import type {InsertCard} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class CardRepository extends BaseRepository {
	private tbl = this.tables.cardTable;

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
}
