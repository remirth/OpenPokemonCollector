import {createHash} from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {getPlaiceholder} from 'plaiceholder';
import * as R from 'remeda';
import sharp from 'sharp';
import {http} from '~/lib/http';
import {lazyLoaded} from '~/lib/lazy';
import type {CardFile} from './schemas';

const PATCHED_URLS: Record<string, string> = {
	'https://images.pokemontcg.io/ex5/102.png':
		'https://den-cards.pokellector.com/56/Groudon.HL.102.png',
	'https://images.pokemontcg.io/ex5/102_hires.png':
		'https://den-cards.pokellector.com/56/Groudon.HL.102.png',
};

export function hashSha256(input: string) {
	return createHash('sha256').update(input, 'utf8').digest('hex');
}

async function getBlur(buffer: Buffer) {
	return getPlaiceholder(buffer, {size: 8, format: ['webp']}).then(
		R.prop('base64'),
	);
}

const cachePath = path.join(os.tmpdir(), 'pokemon_blurs');
async function getBlurCachedOnDisk(buffer: Buffer, key: string) {
	const hash = hashSha256(key);
	await fsp.mkdir(cachePath, {recursive: true});
	const fp = path.join(cachePath, hash);

	if (fs.existsSync(fp)) {
		return fsp.readFile(fp, 'utf8');
	}

	const blur = await getBlur(buffer);
	await fsp.writeFile(fp, blur);
	return blur;
}

const paths = {
	cards: path.join(process.cwd(), 'public', '.images', 'cards'),
	entities: path.join(process.cwd(), 'public', '.images', 'entities'),
} as const;

export async function fetchAndStoreImageAndBlur(
	url: string,
	dir: 'cards' | 'entities',
	id: string,
	suffix?: string,
) {
	const dirPath = paths[dir];
	await fsp.mkdir(dirPath, {recursive: true});
	const filePath = path.join(dirPath, `${id}${suffix ?? ''}.webp`);
	const exists = fs.existsSync(filePath);
	if (!exists) {
		await http(PATCHED_URLS[url] ?? url, {retry: {retries: 5}})
			.then((r) => r.arrayBuffer())
			.then((ab) => Buffer.from(ab))
			.then((b) => sharp(b).webp({quality: 80}).toFile(filePath));
	}

	const buf = await fsp.readFile(filePath).then((b) => Buffer.from(b));

	const blur = await getBlurCachedOnDisk(buf, url);
	return {filePath: path.relative(process.cwd(), filePath), blur};
}

const basePokedexImageUrl = `https://raw.githubusercontent.com/remirth/sprites/master/sprites/pokemon/`;
function createPokedexUrl(pokedexNumber: number) {
	return `${basePokedexImageUrl}${pokedexNumber}.png`;
}

export async function prefetchImagesForCards(cards: CardFile) {
	const result = new Map<
		string,
		Awaited<ReturnType<typeof fetchAndStoreImageAndBlur>>
	>();

	await Promise.all(
		cards.map(async (card) => {
			const tasks = [];
			tasks.push(
				lazyLoaded(card.images.small, () =>
					fetchAndStoreImageAndBlur(card.images.small, 'cards', card.id),
				).then((r) => result.set(card.images.small, r)),
			);

			tasks.push(
				lazyLoaded(card.images.large, () =>
					fetchAndStoreImageAndBlur(
						card.images.large,
						'cards',
						card.id,
						'_large',
					),
				).then((r) => result.set(card.images.large, r)),
			);

			for (const pokedexNumber of card.nationalPokedexNumbers ?? []) {
				const imageUrl = createPokedexUrl(pokedexNumber);
				tasks.push(
					lazyLoaded(imageUrl, () =>
						fetchAndStoreImageAndBlur(
							imageUrl,
							'entities',
							String(pokedexNumber),
						),
					).then((r) => result.set(String(pokedexNumber), r)),
				);
			}

			await Promise.all(tasks);
		}),
	);

	return result;
}
