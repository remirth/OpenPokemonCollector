import path from 'node:path';
import {
	createRequestHandler,
	RouterServer,
	renderRouterToString,
} from '@tanstack/react-router/ssr/server';
import React from 'react';
import {NotInitializedError} from '~/lib/errors';
import {lazyLoaded} from '~/lib/lazy';
import {makeQueryClient, makeRouter} from '../src/router';

export async function renderUrl(url: string) {
	const request = new Request(`http://localhost${url}`);
	const createRouter = () => {
		const qc = makeQueryClient();
		return makeRouter(qc);
	};
	const handler = createRequestHandler({request, createRouter});
	const response = await handler((args) =>
		renderRouterToString({
			...args,
			children: React.createElement(RouterServer, {
				router: args.router,
			}),
		}),
	);
	return await response.text();
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

function getTemplate() {
	const p = path.join(import.meta.dirname, '..', 'index.html');
	return Bun.file(p).text();
}

export async function htmlTemplate(
	body: string,
	tags: Awaited<ReturnType<typeof clientTags>>,
) {
	const template = await lazyLoaded('template', getTemplate);
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
