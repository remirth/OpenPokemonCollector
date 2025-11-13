import type {InsertSubtypeRelation} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class SubtypeRelationRepository extends BaseRepository {
	private tbl = this.tables.subtypesRelationTable;

	readonly createUnique = async (
		payload: InsertSubtypeRelation,
		trx = this.db,
	) => {
		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: [this.tbl.cardId, this.tbl.subtypeId],
				set: {
					cardId: this.$.sql`${this.tbl.cardId}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst('Upserted Row'))
			.then((row) => row.id);
	};
}
