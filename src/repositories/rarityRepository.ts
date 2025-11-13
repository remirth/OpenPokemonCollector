import type {InsertRarity} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class RarityRepository extends BaseRepository {
	private tbl = this.tables.rarityTable;
	readonly createUnique = async (payload: InsertRarity, trx = this.db) => {
		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: this.tbl.name,
				set: {
					name: this.$.sql`${this.tbl.name}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(payload.name))
			.then((row) => row.id);
	};
}
