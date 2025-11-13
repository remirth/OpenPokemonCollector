import type {InsertEntityRelation} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class EntityRelationRepository extends BaseRepository {
	private tbl = this.tables.entityRelationTable;

	readonly createUnique = async (
		payload: InsertEntityRelation,
		trx = this.db,
	) => {
		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: [this.tbl.cardId, this.tbl.entityId],
				set: {
					entityId: this.$.sql`${this.tbl.entityId}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst('Upserted EntityRelation'))
			.then((row) => row.id);
	};
}
