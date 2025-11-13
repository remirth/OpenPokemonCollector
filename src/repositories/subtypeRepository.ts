import type {InsertSubtype} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class SubtypeRepository extends BaseRepository {
	private tbl = this.tables.subtypeTable;
	readonly createUnique = async (subtype: InsertSubtype, trx = this.db) => {
		return trx
			.insert(this.tbl)
			.values(subtype)
			.onConflictDoUpdate({
				target: this.tbl.name,
				set: {
					name: this.$.sql`${this.tbl.name}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(subtype.name))
			.then((row) => row.id);
	};
}
