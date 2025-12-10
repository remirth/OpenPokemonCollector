import path from 'node:path';
import {dehydrate} from '@tanstack/react-query';
import {renderToString} from 'react-dom/server';
import {NotInitializedError} from '~/lib/errors';
import {App} from '../src/App';
import {makeQueryClient, makeRouter} from '../src/router';

export async function renderUrl(url: string) {
	const qc = makeQueryClient();
	const router = makeRouter(qc, url);

	await router.load();
	const app = <App queryClient={qc} router={router} />;
	const html = renderToString(app);
	return {html, dehydrated: dehydrate(qc)};
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
	NotInitializedError.assert('index.html entry', entry.file);
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
	body: string,
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
					el.append(tag, {html: true});
				}
			},
		})
		.on('div[id=app]', {
			element(el) {
				el.append(body, {html: true});
			},
		});

	return rewriter.transform(new Response(template)).text();
}
