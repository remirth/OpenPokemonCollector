import {scope} from 'arktype';

const s = scope({
	// Reusable atoms
	nullishString: 'string|undefined|null',

	// If you want URL validation consistent with sets.ts, use string.url
	// If your environment lacks URL refinement, fall back to 'string'
	Url: 'string.url',

	// Components
	ImageLinks: {
		small: 'Url',
		large: 'Url',
	},

	Legalities: {
		unlimited: 'string',
		'standard?': 'string',
		'expanded?': 'string',
	},

	WeaknessOrResistance: {
		type: 'string',
		value: 'string',
	},

	Attack: {
		'name?': 'string',
		'cost?': 'string[]',
		'convertedEnergyCost?': 'number',
		'damage?': 'string',
		'text?': 'string',
	},

	Ability: {
		'name?': 'string',
		'text?': 'string',
		'type?': 'string',
	},

	// Card base
	Card: {
		// required
		id: 'string',
		name: 'string',
		supertype: "'Pokémon'|'Trainer'|'Energy'",
		number: 'string',
		legalities: 'Legalities',
		images: 'ImageLinks',

		// optional (were Pokémon-only in Zod version)
		'artist?': 'string',
		'rarity?': 'string',

		// Zod used .catch([]) for subtypes/types; arktype doesn't auto-default,
		// so we make them optional arrays. Apply defaults in your load/parse layer.
		'subtypes?': 'string[]',
		'level?': 'string',
		'hp?': 'string',
		'types?': 'string[]',
		'evolvesFrom?': 'string',
		'evolvesTo?': 'string[]',
		'abilities?': 'Ability[]',
		'attacks?': 'Attack[]',
		'weaknesses?': 'WeaknessOrResistance[]',
		'resistances?': 'WeaknessOrResistance[]',
		'retreatCost?': 'string[]',
		'convertedRetreatCost?': 'number',
		'rules?': 'string[]',
		'flavorText?': 'string',

		// Zod used .catch([]) here too; keep optional array
		'nationalPokedexNumbers?': 'number[]',
	},

	CardFile: 'Card[]',

	// Entity kind enum
	EntityKindEnum: "'pokemon'|'energy'|'trainer'",
});

export const CardSchema = s.export('Card').Card;
export const CardFileSchema = s.export('CardFile').CardFile;

export type Card = typeof CardSchema.infer;
export type CardFile = typeof CardFileSchema.infer;

// For compatibility with previous type names
export type CardSuperType = Card['supertype'];

// Entity kind
export const EntityKindEnumSchema = s.export('EntityKindEnum').EntityKindEnum;
export type EntityKind = typeof EntityKindEnumSchema.infer;
