import type {InsertEntity, SelectEntity} from '~/db/schema';
import {NotInitializedError} from '~/lib/errors';
import {BaseRepository} from './baseRepository';

export class EntityRepository extends BaseRepository {
	private readonly tbl = this.T.entityTable;
	private readonly relations = this.T.entityRelationTable;
	private readonly cards = this.T.cardTable;

	readonly createUnique = async (
		payload: InsertEntity,
		trx = this.db,
	): Promise<number> => {
		if (payload.entityKind !== 'pokemon')
			return this.createUniqueBySlug(payload, trx);
		NotInitializedError.assert(
			`PokedexNumber for ${payload.name}`,
			payload.pokedexNumber,
		);

		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: [this.tbl.name, this.tbl.pokedexNumber],
				set: {
					name: this.$.sql`${this.tbl.name}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(payload.name))
			.then((row) => row.id);
	};

	readonly createUniqueBySlug = async (
		payload: InsertEntity,
		trx = this.db,
	): Promise<number> => {
		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: this.tbl.slug,
				set: {
					slug: this.$.sql`${this.tbl.slug}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(payload.name))
			.then((row) => row.id);
	};

	readonly getPage = (
		page = 0,
		pageSize = 50,
		trx = this.db,
	): Promise<Array<SelectEntity & {id: number}>> => {
		return trx
			.select()
			.from(this.tbl)
			.limit(pageSize)
			.offset(page * pageSize)
			.orderBy(this.$.asc(this.tbl.pokedexNumber));
	};

	readonly getCardImageForEntity = (entityId: number, trx = this.db) => {
		return trx
			.select({image: this.cards.imageLargeUrl})
			.from(this.tbl)
			.leftJoin(this.relations, this.$.eq(this.tbl.id, this.relations.entityId))
			.leftJoin(this.cards, this.$.eq(this.cards.id, this.relations.cardId))
			.where(
				this.$.and(
					this.$.eq(this.tbl.id, entityId),
					this.$.isNotNull(this.cards.imageLargeUrl),
				),
			)
			.limit(1)
			.then(
				this.R.piped(
					this.assertFirst(`Card Image for entityId: ${entityId}`),
					this.R.prop('image'),
					this.assert(`Card image for entityId: ${entityId}`),
				),
			);
	};
}
