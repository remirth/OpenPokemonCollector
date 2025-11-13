import {scope} from 'arktype';

const s = scope({
	nullishString: 'string|undefined|null',
	Legalities: {
		unlimited: 'string',
		'standard?': 'nullishString',
		'expanded?': 'nullishString',
	},
	Images: {
		symbol: 'string.url',
		logo: 'string.url',
	},
	PokemonSet: {
		id: 'string',
		name: 'string',
		series: 'string',
		printedTotal: 'number',
		total: 'number',
		legalities: 'Legalities',
		'ptcgoCode?': 'nullishString',
		releaseDate: 'string.date',
		updatedAt: 'string.date',
		images: 'Images',
	},
	PokemonSetFile: 'PokemonSet[]',
});

export const PokemonSetSchema = s.export('PokemonSet').PokemonSet;
export const PokemonSetFileSchema = s.export('PokemonSetFile').PokemonSetFile;

export type PokemonSet = typeof PokemonSetSchema.infer;
export type PokemonSetFile = typeof PokemonSetFileSchema.infer;
