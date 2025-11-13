import type {InsertEntity} from '~/db/schema';
import {NotInitializedError} from '~/lib/errors';
import {BaseRepository} from './baseRepository';

export class EntityRepository extends BaseRepository {
	private tbl = this.tables.entityTable;

	readonly createUnique = async (payload: InsertEntity, trx = this.db) => {
		if (payload.entityKind !== 'pokemon')
			return this.createUniqueByName(payload, trx);
		NotInitializedError.assert(
			`PokedexNumber for ${payload.name}`,
			payload.pokedexNumber,
		);

		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: [this.tbl.name, this.tbl.pokedexNumber],
				set: {
					name: this.$.sql`${this.tbl.name}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(payload.name))
			.then((row) => row.id);
	};

	readonly createUniqueByName = async (
		payload: InsertEntity,
		trx = this.db,
	) => {
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
