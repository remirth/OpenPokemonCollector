import type {InsertTypeRelation} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class TypeRelationRepository extends BaseRepository {
	private tbl = this.tables.typesRelationTable;
	readonly createUnique = async (
		payload: InsertTypeRelation,
		trx = this.db,
	) => {
		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: [this.tbl.cardId, this.tbl.typeId],
				set: {
					cardId: this.$.sql`${this.tbl.cardId}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst('Upserted Row'))
			.then((row) => row.id);
	};
}
