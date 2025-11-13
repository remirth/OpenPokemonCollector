import type {InsertArtist} from '~/db/schema';
import {BaseRepository} from './baseRepository';

export class ArtistRepository extends BaseRepository {
	private tbl = this.tables.artistTable;

	readonly createUnique = async (payload: InsertArtist, trx = this.db) => {
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
