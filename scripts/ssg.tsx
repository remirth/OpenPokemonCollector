import path from 'node:path';
import { dehydrate } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { App } from '../src/App';
import { makeQueryClient, makeRouter } from '../src/router';

export async function renderUrl(url: string) {
  const qc = makeQueryClient();
  const router = makeRouter(qc);

  await router.navigate({ to: url, replace: true });
  await router.load();
  const app = <App queryClient={qc} router={router} />;
  const html = renderToString(app);
  return { html, dehydrated: dehydrate(qc) };
}

// biome-ignore lint/complexity/noStaticOnlyClass: Singleton
class Template {
  static get = () => {
    if (!this.#instance) {
      return this.load();
    }

    return this.#instance;
  };

  static #instance: Promise<string>;
  static load = () => {
    const p = path.join(import.meta.dirname, '..', 'index.html');
    this.#instance = Bun.file(p).text();
    return this.#instance;
  };
}

export async function clientTags(dist: string) {
  const manifest = await Bun.file(
    path.join(dist, '.vite', 'manifest.json'),
  ).json();
  const entry = manifest['index.html'];

  if (!entry?.file) throw new Error('entry-client missing');
  const tags: Array<string> = [];
  tags.push(
    `<script type="module" src="/${entry.file}" crossorigin></script>\n`,
  );
  const preloads =
    (entry.imports ?? [])
      .map((i: string) => manifest[i]?.file)
      .filter(Boolean)
      .map(
        (f: string) => `<link rel="modulepreload" crossorigin href="/${f}">\n`,
      ) ?? [];

  tags.push(...preloads);
  const css = (entry.css ?? []).map(
    (c: string) => `<link rel="stylesheet" crossorigin href="/${c}">\n`,
  );

  tags.push(...css);
  return tags;
}

export async function htmlTemplate(
  _body: string,
  dehydrated: unknown,
  tags: Awaited<ReturnType<typeof clientTags>>,
) {
  const _state = JSON.stringify(dehydrated);
  const template = await Template.get();
  const rewriter = new HTMLRewriter()
    .on("script[type='module']", {
      element(el) {
        const src = el.getAttribute('src');
        const co = el.getAttribute('crossorigin');
        if (src === '/src/main.tsx' && co === 'anonymous') {
          el.remove();
        }
      },
    })
    .on('head', {
      element(el) {
        for (const tag of tags) {
          el.append(tag, { html: true });
        }
      },
    });

  return rewriter.transform(new Response(template)).text();
}
