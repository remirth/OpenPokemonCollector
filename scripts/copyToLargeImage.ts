import fs from 'node:fs';
import path from 'node:path';
import {type} from 'arktype';

const str = type('string');

const cardImagesDir = path.join(process.cwd(), 'public/.images/cards');
const pattern = str.assert(process.argv[2]);

const matched = fs
	.readdirSync(cardImagesDir)
	.filter((e) => e.includes(pattern));
for (const match of matched) {
	const largeName = `${path.basename(match, path.extname(match))}_large.webp`;
	fs.cpSync(
		path.join(cardImagesDir, match),
		path.join(cardImagesDir, largeName),
	);
}
