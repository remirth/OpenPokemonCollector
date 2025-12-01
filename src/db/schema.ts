import {createInsertSchema, createSelectSchema} from 'drizzle-arktype';
import {type SQL as SQLStatement, sql} from 'drizzle-orm';
import * as SQL from 'drizzle-orm/pg-core';

export const entityKindEnum = SQL.pgEnum('entity_kind_enum', [
	'pokemon',
	'energy',
	'trainer',
]);

const tsvector = SQL.customType<{data: string}>({
	dataType: () => 'tsvector',
});

export const entityTable = SQL.pgTable(
	'entities',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: SQL.varchar('name', {length: 255}).notNull().unique(),
		slug: SQL.varchar('slug', {length: 255}).notNull().unique(),
		evolvesFrom: SQL.varchar('evolves_from', {length: 255}),
		evolvesTo: SQL.text('evolves_to').array(),
		entityKind: entityKindEnum('entity_kind').notNull(),
		pokedexNumber: SQL.integer('pokedex_number').unique(),
		imageUrl: SQL.varchar('image_url', {length: 255}),
		search: tsvector('search').generatedAlwaysAs(
			(): SQLStatement =>
				sql`setweight(to_tsvector('simple', coalesce(${entityTable.name}, '')), 'A')`,
		),
	},
	(tbl) => {
		return [
			SQL.uniqueIndex('entity_name_idx').on(tbl.name),
			SQL.uniqueIndex('entity_slug_idx').on(tbl.slug),
			SQL.uniqueIndex('entity_pokedex_idx').on(tbl.pokedexNumber),
			SQL.uniqueIndex('entity_pokedex_name_idx').on(
				tbl.pokedexNumber,
				tbl.name,
			),
			SQL.index('entity_kind_idx').on(tbl.entityKind),
			SQL.index('entity_search_idx').using('gin', tbl.search),
		];
	},
);

export const InsertEntitySchema = createInsertSchema(entityTable);
export const SelectEntitySchema = createSelectSchema(entityTable);
export type InsertEntity = typeof InsertEntitySchema.infer;
export type SelectEntity = typeof SelectEntitySchema.infer;

export const subtypeTable = SQL.pgTable(
	'subtypes',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: SQL.varchar('name', {length: 255}).notNull().unique(),
		entityKind: entityKindEnum('entity_kind').notNull(),
	},
	(tbl) => {
		return [
			SQL.uniqueIndex('subtypes_name_idx').on(tbl.name),
			SQL.index('subtype_kind_idx').on(tbl.entityKind),
		];
	},
);

export const InsertSubtypeSchema = createInsertSchema(subtypeTable);
export const SelectSubtypeSchema = createSelectSchema(subtypeTable);
export type InsertSubtype = typeof InsertSubtypeSchema.infer;
export type SelectSubtype = typeof SelectSubtypeSchema.infer;

export const rarityTable = SQL.pgTable(
	'rarities',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: SQL.varchar('name', {length: 255}).notNull().unique(),
	},
	(tbl) => {
		return [SQL.uniqueIndex('rarities_name_idx').on(tbl.name)];
	},
);

export const InsertRaritySchema = createInsertSchema(rarityTable);
export const SelectRaritySchema = createSelectSchema(rarityTable);
export type InsertRarity = typeof InsertRaritySchema.infer;
export type SelectRarity = typeof SelectRaritySchema.infer;

export const typesTable = SQL.pgTable(
	'types',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: SQL.varchar('name', {length: 255}).notNull().unique(),
	},
	(tbl) => {
		return [SQL.uniqueIndex('types_name_idx').on(tbl.name)];
	},
);

export const InsertTypesSchema = createInsertSchema(typesTable);
export const SelectTypesSchema = createSelectSchema(typesTable);
export type InsertTypes = typeof InsertTypesSchema.infer;
export type SelectTypes = typeof SelectTypesSchema.infer;

export const artistTable = SQL.pgTable(
	'artists',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: SQL.varchar('name', {length: 255}).notNull().unique(),
	},
	(tbl) => {
		return [SQL.uniqueIndex('artists_name_idx').on(tbl.name)];
	},
);

export const InsertArtistSchema = createInsertSchema(artistTable);
export const SelectArtistSchema = createSelectSchema(artistTable);
export type InsertArtist = typeof InsertArtistSchema.infer;
export type SelectArtist = typeof SelectArtistSchema.infer;

export const setTable = SQL.pgTable(
	'sets',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: SQL.varchar('name', {length: 255}).notNull().unique(),
		series: SQL.varchar('series', {length: 255}).notNull(),
		total: SQL.integer('total').notNull(),
		printedTotal: SQL.integer('printed_total').notNull(),
		ptcgoCode: SQL.varchar('ptcgo_code', {length: 255}),
		releaseDate: SQL.date('release_date').notNull(),
		updatedAt: SQL.date('updated_at').notNull(),
		imageSymbol: SQL.varchar('image_symbol', {length: 255}).notNull(),
		imageLogo: SQL.varchar('image_logo', {length: 255}).notNull(),
		externalId: SQL.varchar('external_id', {length: 255}).notNull().unique(),
	},
	(tbl) => {
		return [
			SQL.uniqueIndex('sets_name_idx').on(tbl.name),
			SQL.uniqueIndex('sets_external_idx').on(tbl.externalId),
		];
	},
);

export const InsertSetSchema = createInsertSchema(setTable);
export const SelectSetSchema = createSelectSchema(setTable);
export type InsertSet = typeof InsertSetSchema.infer;
export type SelectSet = typeof SelectSetSchema.infer;

export const cardTable = SQL.pgTable(
	'cards',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		externalId: SQL.varchar({length: 255}).unique().notNull(),
		name: SQL.varchar({length: 255}).notNull(),
		setId: SQL.integer('set_id')
			.notNull()
			.references(() => setTable.id),
		artistId: SQL.integer('artist_id').references(() => artistTable.id),
		rarityId: SQL.integer('rarity_id').references(() => rarityTable.id),
		numberInSet: SQL.varchar('number_in_set', {length: 255}),
		imageUrl: SQL.varchar('image_url', {length: 255}),
		imageLargeUrl: SQL.varchar('image_large_url', {length: 255}),
	},
	(tbl) => {
		return [
			SQL.uniqueIndex('card_external_idx').on(tbl.externalId),
			SQL.index('card_rarity_idx').on(tbl.rarityId),
			SQL.index('card_set_idx').on(tbl.setId),
			SQL.index('card_artist_idx').on(tbl.artistId),
		];
	},
);

export const InsertCardSchema = createInsertSchema(cardTable);
export const SelectCardSchema = createSelectSchema(cardTable);
export type InsertCard = typeof InsertCardSchema.infer;
export type SelectCard = typeof SelectCardSchema.infer;

export const collectionTable = SQL.pgTable(
	'collections',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: SQL.varchar('name', {length: 255}).notNull().unique(),
		updatedAt: SQL.date('updated_at').defaultNow(),
		createdAt: SQL.date('created_at').defaultNow(),
		active: SQL.boolean('active').default(true),
	},
	(tbl) => {
		return [
			SQL.uniqueIndex('collections_name_idx').on(tbl.name),
			SQL.index('collections_updated_idx').on(tbl.updatedAt),
			SQL.index('collections_created_idx').on(tbl.createdAt),
		];
	},
);

export const InsertCollectionSchema = createInsertSchema(collectionTable);
export const SelectCollectionSchema = createSelectSchema(collectionTable);
export type InsertCollection = typeof InsertCollectionSchema.infer;
export type SelectCollection = typeof SelectCollectionSchema.infer;

export const collectionEntryTable = SQL.pgTable(
	'collection_entries',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		collectionId: SQL.integer('collection_id')
			.notNull()
			.references(() => collectionTable.id),
		cardId: SQL.integer('card_id')
			.notNull()
			.references(() => cardTable.id),
		quantity: SQL.integer().default(1),
		createdAt: SQL.date('created_at').defaultNow(),
		updatedAt: SQL.date('updated_at').defaultNow(),
	},
	(tbl) => {
		return [
			SQL.index('collection_entry_idx').on(tbl.collectionId),
			SQL.index('collection_entry_card_idx').on(tbl.cardId),
			SQL.index('collection_quantity_idx').on(tbl.quantity),
			SQL.index('collection_entry_updated_idx').on(tbl.updatedAt),
			SQL.index('collection_entry_created_idx').on(tbl.createdAt),
		];
	},
);

export const InsertCollectionEntrySchema =
	createInsertSchema(collectionEntryTable);
export const SelectCollectionEntrySchema =
	createSelectSchema(collectionEntryTable);
export type InsertCollectionEntry = typeof InsertCollectionEntrySchema.infer;
export type SelectCollectionEntry = typeof SelectCollectionEntrySchema.infer;

export const typesRelationTable = SQL.pgTable(
	'type_relations',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		typeId: SQL.integer('type_id')
			.notNull()
			.references(() => typesTable.id),
		cardId: SQL.integer('card_id')
			.notNull()
			.references(() => cardTable.id),
	},
	(tbl) => {
		return [SQL.uniqueIndex('type_relation_idx').on(tbl.cardId, tbl.typeId)];
	},
);

export const InsertTypeRelationSchema = createInsertSchema(typesRelationTable);
export const SelectTypeRelationSchema = createSelectSchema(typesRelationTable);
export type InsertTypeRelation = typeof InsertTypeRelationSchema.infer;
export type SelectTypeRelation = typeof SelectTypeRelationSchema.infer;

export const subtypesRelationTable = SQL.pgTable(
	'subtype_relations',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		subtypeId: SQL.integer('subtype_id')
			.notNull()
			.references(() => subtypeTable.id),
		cardId: SQL.integer('card_id')
			.notNull()
			.references(() => cardTable.id),
	},
	(tbl) => {
		return [
			SQL.uniqueIndex('subtype_relation_idx').on(tbl.cardId, tbl.subtypeId),
		];
	},
);

export const InsertSubtypeRelationSchema = createInsertSchema(
	subtypesRelationTable,
);
export const SelectSubtypeRelationSchema = createSelectSchema(
	subtypesRelationTable,
);
export type InsertSubtypeRelation = typeof InsertSubtypeRelationSchema.infer;
export type SelectSubtypeRelation = typeof SelectSubtypeRelationSchema.infer;

export const entityRelationTable = SQL.pgTable(
	'entity_relations',
	{
		id: SQL.integer('id').primaryKey().generatedAlwaysAsIdentity(),
		entityId: SQL.integer('entity_id')
			.notNull()
			.references(() => entityTable.id),
		cardId: SQL.integer('card_id')
			.notNull()
			.references(() => cardTable.id),
	},
	(tbl) => {
		return [
			SQL.uniqueIndex('entity_relation_idx').on(tbl.cardId, tbl.entityId),
		];
	},
);

export const InsertEntityRelationSchema =
	createInsertSchema(entityRelationTable);
export const SelectEntityRelationSchema =
	createSelectSchema(entityRelationTable);
export type InsertEntityRelation = typeof InsertEntityRelationSchema.infer;
export type SelectEntityRelation = typeof SelectEntityRelationSchema.infer;
