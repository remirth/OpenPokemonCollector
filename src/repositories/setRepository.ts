import type {InsertSet} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class SetRepository extends BaseRepository {
	private tbl = this.tables.setTable;
	readonly createUnique = async (set: InsertSet, trx = this.db) => {
		return trx
			.insert(this.tbl)
			.values(set)
			.onConflictDoUpdate({
				target: this.tbl.name,
				set: {
					name: this.$.sql`${this.tbl.name}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(set.name))
			.then((row) => row.id);
	};
}
