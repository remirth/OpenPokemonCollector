import fs from 'node:fs';
import {join, posix} from 'node:path';
import {type} from 'arktype';
import {deserializeArgumentList} from 'deez-argv';
import {Hono} from 'hono';
import {serveStatic} from 'hono/bun';
import puppeteer from 'puppeteer-core';

const argsSchema = type({'debug?': 'boolean', 'puppeteerPath?': 'string'});

const args = argsSchema.assert(deserializeArgumentList());

// Configure routes you want to prerender
const ROUTES: string[] = ['/', '/cards'];

// Server config
const PORT = 4173;
const ORIGIN = `http://localhost:${PORT}`;
const DIST_DIR = '.output';

// Optional: set if Puppeteer cannot find Chromium automatically
process.env['PUPPETEER_EXECUTABLE_PATH'] ??= '/usr/bin/chromium';

function routeToFilePath(route: string): string {
	if (route === '/') return 'index.html';
	const clean = route.replace(/^\//, '').replace(/\/+$/, '');
	return posix.join(clean, 'index.html');
}

async function build() {
	if (args.debug) {
		Bun.env['VITE_DEBUG_BUILD'] = '1';
	}
	console.log('[prerender] vite build...');
	const proc = Bun.spawn(['bun', 'x', 'vite', 'build'], {
		stdout: 'inherit',
		stderr: 'inherit',
		env: Bun.env,
	});
	const code = await proc.exited;
	if (code !== 0) {
		throw new Error(`vite build failed: ${code}`);
	}
}

function getStaticServer() {
	const app = new Hono();
	app.use('/*', serveStatic({root: DIST_DIR}));

	return app;
}

async function prerenderRoutes() {
	console.log('[prerender] launching puppeteer...');
	const browser = await puppeteer.launch({
		headless: true,
		executablePath:
			args.puppeteerPath ?? process.env['PUPPETEER_EXECUTABLE_PATH'],
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	try {
		const page = await browser.newPage();

		for (const route of ROUTES) {
			const url = `${ORIGIN}${route}`;
			console.log(`[prerender] visit ${url}`);

			// Set prerender flag before page loads
			await page.evaluateOnNewDocument(() => {
				// biome-ignore lint/suspicious/noExplicitAny: Set prerender flag
				(window as any).__PRERENDER__ = true;
			});

			await page.goto(url, {
				waitUntil: ['networkidle0', 'domcontentloaded'],
				timeout: 60_000,
			});

			console.log(`[prerender] awaiting loader`);
			const loaded = await page.evaluate(async () => {
				await new Promise((res) => setTimeout(res, 1000));
				// biome-ignore lint/suspicious/noExplicitAny: We need to expose the queryClient to the prerender
				const loader = (window as any).load;
				if (typeof loader === 'function') {
					try {
						await loader();
						return true;
					} catch {}
				}

				return false;
			});

			if (loaded) {
				console.log(`[prerender] loader triggered`);
			}

			// Dehydrate React Query via exposed hook
			const dehydratedJson = await page.evaluate(() => {
				// biome-ignore lint/suspicious/noExplicitAny: We need to expose the queryClient to the prerender
				const hook = (window as any).__rqDehydrate;
				if (typeof hook === 'function') {
					try {
						return hook();
					} catch {
						return null;
					}
				}
				return null;
			});

			// Get full HTML
			let html = await page.content();

			// Inject or replace <script id="__RQ" type="application/json">...</script>
			const scriptTag = `<script id="__RQ" type="application/json">${
				dehydratedJson ?? 'null'
			}</script>`;
			if (html.includes('id="__RQ"')) {
				html = html.replace(
					/<script id="__RQ"[^>]*>[\s\S]*?<\/script>/,
					scriptTag,
				);
			} else {
				html = html.replace('</body>', `${scriptTag}\n</body>`);
			}

			// Write file
			const outRel = routeToFilePath(route);
			const outPath = join(DIST_DIR, outRel);

			fs.mkdirSync(join(outPath, '..'), {recursive: true});
			await Bun.write(outPath, html);
			console.log(`[prerender] wrote ${outRel}`);
		}
	} finally {
		await browser.close();
	}
}

async function main() {
	await build();
	const app = getStaticServer();
	const server = Bun.serve({port: PORT, fetch: app.fetch});

	try {
		await prerenderRoutes();
	} finally {
		await server.stop();
		console.log('[prerender] done');
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
