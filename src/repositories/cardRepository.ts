import type {InsertCard} from '~/db/schema';
import {arrayHasItems} from '~/lib/utils';
import {BaseRepository} from './baseRepository';

export class CardRepository extends BaseRepository {
	private tbl = this.T.cardTable;
	private relations = this.T.entityRelationTable;

	readonly createUnique = async (payload: InsertCard, trx = this.db) => {
		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: this.tbl.externalId,
				set: {
					externalId: this.$.sql`${this.tbl.externalId}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(payload.externalId))
			.then((row) => row.id);
	};

	readonly query = (
		query?: string,
		sets?: Array<number>,
		artists?: Array<number>,
		rarities?: Array<number>,
		entities?: Array<number>,
		page = 0,
		pageSize = 50,
		trx = this.db,
	) => {
		return trx
			.select()
			.from(this.tbl)
			.innerJoin(this.relations, this.$.eq(this.tbl.id, this.relations.cardId))
			.innerJoin(this.T.setTable, this.$.eq(this.tbl.setId, this.T.setTable.id))
			.where(
				this.$.and(
					arrayHasItems(sets)
						? this.$.inArray(this.tbl.setId, sets)
						: undefined,
					arrayHasItems(artists)
						? this.$.inArray(this.tbl.artistId, artists)
						: undefined,
					arrayHasItems(rarities)
						? this.$.inArray(this.tbl.rarityId, rarities)
						: undefined,
					arrayHasItems(entities)
						? this.$.inArray(this.relations.entityId, entities)
						: undefined,
					query
						? this.$.or(
								this.Q.match(this.tbl.search, query),
								this.$.ilike(this.tbl.name, `%${query}%`),
							)
						: undefined,
				),
			)
			.limit(pageSize)
			.offset(page * pageSize)
			.orderBy(
				query
					? this.Q.rankDesc(this.tbl.search, query)
					: this.$.asc(this.T.setTable.releaseDate),
				this.$.asc(this.tbl.orderInSet),
			);
	};

	readonly queryCount = (
		query?: string,
		sets?: Array<number>,
		artists?: Array<number>,
		rarities?: Array<number>,
		entities?: Array<number>,
		trx = this.db,
	) => {
		return trx
			.select({count: this.$.count()})
			.from(this.tbl)
			.innerJoin(this.relations, this.$.eq(this.tbl.id, this.relations.cardId))
			.where(
				this.$.and(
					arrayHasItems(sets)
						? this.$.inArray(this.tbl.setId, sets)
						: undefined,
					arrayHasItems(artists)
						? this.$.inArray(this.tbl.artistId, artists)
						: undefined,
					arrayHasItems(rarities)
						? this.$.inArray(this.tbl.rarityId, rarities)
						: undefined,
					arrayHasItems(entities)
						? this.$.inArray(this.relations.entityId, entities)
						: undefined,
					query
						? this.$.or(
								this.Q.match(this.tbl.search, query),
								this.$.ilike(this.tbl.name, `%${query}%`),
							)
						: undefined,
				),
			)
			.then(
				this.R.piped(
					this.assertFirst('Card count for query'),
					this.R.prop('count'),
				),
			);
	};
}
