import path from 'node:path';
import { clientTags, htmlTemplate, renderUrl } from './ssg';

const DIST_DIR = '.output';
const FULL_DIST = path.join(import.meta.dirname, '..', DIST_DIR);

async function _writeOut(pathname: string, html: string) {
  const filePath = path.join(
    FULL_DIST,
    pathname.replace(/\/?$/, '/'),
    'index.html',
  );

  await Bun.write(filePath, html, { createPath: true });
}

async function main() {
  const tags = await clientTags(FULL_DIST);
  const routes = ['/', '/about'];
  for (const url of routes) {
    const { html, dehydrated } = await renderUrl(url);
    const page = await htmlTemplate(html, dehydrated, tags);
    console.log(page);
    // await writeOut(url, page);
    console.log('Prerendered', url);
  }
}

main();
