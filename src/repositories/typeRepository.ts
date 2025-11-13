import type {InsertTypes} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class TypeRepository extends BaseRepository {
	protected tbl = this.tables.typesTable;
	readonly createUnique = async (payload: InsertTypes, trx = this.db) => {
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
