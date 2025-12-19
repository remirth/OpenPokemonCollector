import type {EntityKind} from 'scripts/schemas';
import type {InsertCard} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class CardRepository extends BaseRepository {
	private tbl = this.T.cardTable;

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
		_kind?: Array<EntityKind>,
		page = 0,
		pageSize = 50,
		trx = this.db,
	) => {
		return trx
			.select()
			.from(this.tbl)
			.where(
				this.$.and(
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
					: this.$.asc(this.tbl.name),
				this.$.asc(this.tbl.name),
			);
	};
}
