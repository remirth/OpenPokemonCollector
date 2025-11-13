import {Chan} from 'ts-chan';
import type {DB} from '~/db';
import {
	AppError,
	HttpError,
	NotInitializedError,
	toError,
} from '../src/lib/errors';
import type {RepositoryContext} from '../src/repositories';
import {Pokedex} from './pokedex';
import {
	type CardFile,
	CardFileSchema,
	type CardSuperType,
	type EntityKind,
	type PokemonSet,
	type PokemonSetFile,
	PokemonSetFileSchema,
} from './schemas';

const setUrl = new URL(
	'https://raw.githubusercontent.com/remirth/pokemon-tcg-data/master/sets/en.json',
);

const baseCardUrl = `https://raw.githubusercontent.com/remirth/pokemon-tcg-data/master/cards/en/`;
const basePokedexImageUrl = `https://raw.githubusercontent.com/remirth/sprites/master/sprites/pokemon/`;

export async function importData(ctx: RepositoryContext) {
	let sets: PokemonSetFile;
	try {
		sets = await fetch(setUrl)
			.then(HttpError.test)
			.then((res) => res.json())
			.then(PokemonSetFileSchema.assert);
	} catch (e) {
		const error = toError(e);
		throw error;
	}

	if (!sets.length) {
		throw new AppError('Received no sets from database!');
	}

	console.log('setsCount', sets.length);
	const channel = new Chan<FetchResult>(sets.length);
	const promise = fetchCards(channel, sets).catch((e) => {
		console.error(e);
	});

	let i = 0;
	for await (const result of channel) {
		if (!result.ok) {
			throw result.error;
		}

		await ctx.db.transaction(async (trx) =>
			importSet(result.set, result.cards, ctx, trx, i),
		);

		i++;
	}

	await promise;
	console.log('Loaded all sets');
	console.log('Loaded all cards');

	console.log('stage', 'Done');
}

async function importSet(
	set: PokemonSet,
	cards: CardFile,
	ctx: RepositoryContext,
	trx: DB.DatabaseContext,
	index: number,
) {
	console.log({
		name: set.name,
		length: cards.length,
		releaseDate: set.releaseDate,
	});
	const setId = await ctx.sets.createUnique(
		{
			externalId: set.id,
			series: set.series,
			imageLogo: set.images.logo,
			imageSymbol: set.images.symbol,
			releaseDate: set.releaseDate,
			updatedAt: set.updatedAt,
			name: set.name,
			printedTotal: set.printedTotal,
			ptcgoCode: set.ptcgoCode,
			total: set.total,
		},
		trx,
	);

	for (let i = 0; i < cards.length; ++i) {
		const card = cards[i];
		NotInitializedError.assert(`Card at index: ${i} in set ${set.name}`, card);

		const pokedex = await Pokedex.get();
		const paradoxId = pokedex.getParadoxNumber(card.name);
		if (paradoxId && !card.nationalPokedexNumbers?.length) {
			card.nationalPokedexNumbers = [paradoxId];
		}

		const entityKind = supertypeToEntityKind(
			card.supertype,
			Boolean(card.nationalPokedexNumbers?.length),
		);
		const entityIds: number[] = [];

		if (entityKind === 'pokemon') {
			NotInitializedError.assert(
				`PokedexNumber for ${card.name}`,
				card.nationalPokedexNumbers?.at(0),
			);
			for (const pokedexNumber of card.nationalPokedexNumbers) {
				const name = pokedex.get(pokedexNumber);
				NotInitializedError.assert(`Pokedex Entry for ${pokedexNumber}`, name);

				await ctx.entities
					.createUnique(
						{
							entityKind,
							name,
							pokedexNumber,
							imageUrl: `${basePokedexImageUrl}${pokedexNumber}.png`,
							evolvesFrom: card.evolvesFrom,
							evolvesTo: card.evolvesTo,
						},
						trx,
					)
					.then((id) => entityIds.push(id));
			}
		} else {
			await ctx.entities
				.createUniqueByName(
					{
						entityKind,
						name: card.name,
						evolvesFrom: card.evolvesFrom,
						evolvesTo: card.evolvesTo,
					},
					trx,
				)
				.then((id) => entityIds.push(id));
		}

		let rarityId: number | undefined;
		if (card.rarity) {
			rarityId = await ctx.rarities.createUnique(
				{
					name: card.rarity,
				},
				trx,
			);
		}

		let artistId: number | undefined;
		if (card.artist) {
			artistId = await ctx.artists.createUnique(
				{
					name: card.artist,
				},
				trx,
			);
		}

		let cardId: number;
		cardId = await ctx.cards.createUnique(
			{
				externalId: card.id,
				artistId,
				rarityId,
				setId,
				name: card.name,
				numberInSet: card.number,
				imageUrl: card.images.small,
				imageLargeUrl: card.images.large,
			},
			trx,
		);

		for (const entityId of entityIds) {
			await ctx.entityRelations.createUnique({cardId, entityId}, trx);
		}

		card.subtypes ??= [];
		for (const subtype of card.subtypes) {
			const subtypeId = await ctx.subtypes.createUnique(
				{
					entityKind,
					name: subtype,
				},
				trx,
			);

			await ctx.subtypeRelations.createUnique(
				{
					subtypeId,
					cardId,
				},
				trx,
			);
		}

		card.types ??= [];
		for (const type of card.types) {
			const typeId = await ctx.types.createUnique(
				{
					name: type,
				},
				trx,
			);

			await ctx.typeRelations.createUnique(
				{
					typeId,
					cardId,
				},
				trx,
			);
		}
	}

	console.log('setsProcessed', index + 1);
}

function supertypeToEntityKind(
	supertype: CardSuperType,
	hasPokedex: boolean,
): EntityKind {
	switch (supertype) {
		case 'Pokémon':
			return hasPokedex ? 'pokemon' : 'trainer';
		case 'Trainer':
			return 'trainer';
		case 'Energy':
			return 'energy';
	}
}

type FetchResult =
	| {cards: CardFile; set: PokemonSet; ok: true}
	| {ok: false; error: Error};

async function fetchCards(channel: Chan<FetchResult>, sets: PokemonSetFile) {
	try {
		const tasks = sets
			.sort((a, b) => Date.parse(a.releaseDate) - Date.parse(b.releaseDate))
			.map(async (set) => {
				return fetch(`${baseCardUrl}/${set.id}.json`)
					.then(HttpError.test)
					.then((res) => res.json())
					.then(CardFileSchema.assert)
					.then((cards) => ({set, cards, ok: true as const}));
			});

		for (const task of tasks) {
			const result = await task;
			await channel.send(result);
		}
	} catch (e) {
		const error = toError(e);
		channel.trySend({ok: false as const, error});
	} finally {
		channel.close();
	}
}
