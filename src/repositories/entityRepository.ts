import type {EntityKind} from 'scripts/schemas';
import type {InsertEntity, SelectEntity} from '~/db/schema';
import {NotInitializedError} from '~/lib/errors';
import {BaseRepository} from './baseRepository';

export class EntityRepository extends BaseRepository {
	private readonly tbl = this.T.entityTable;

	readonly createUnique = async (
		payload: InsertEntity,
		trx = this.db,
	): Promise<number> => {
		if (payload.entityKind !== 'pokemon')
			return this.createUniqueBySlug(payload, trx);
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

	readonly createUniqueBySlug = async (
		payload: InsertEntity,
		trx = this.db,
	): Promise<number> => {
		return trx
			.insert(this.tbl)
			.values(payload)
			.onConflictDoUpdate({
				target: this.tbl.slug,
				set: {
					slug: this.$.sql`${this.tbl.slug}`,
				},
			})
			.returning({id: this.tbl.id})
			.then(this.assertFirst(payload.name))
			.then((row) => row.id);
	};

	readonly getPage = (
		page = 0,
		pageSize = 50,
		trx = this.db,
	): Promise<Array<SelectEntity>> => {
		return trx
			.select()
			.from(this.tbl)
			.limit(pageSize)
			.offset(page * pageSize)
			.orderBy(this.$.asc(this.tbl.pokedexNumber));
	};

	readonly query = (
		query?: string,
		kind?: Array<EntityKind>,
		page = 0,
		pageSize = 50,
		trx = this.db,
	): Promise<Array<SelectEntity>> => {
		return trx
			.select()
			.from(this.tbl)
			.where(
				this.$.and(
					query
						? this.$.or(
								this.Q.match(this.tbl.search, query),
								this.$.ilike(this.tbl.name, `%${query}%`),
							)
						: undefined,
					kind ? this.$.inArray(this.tbl.entityKind, kind) : undefined,
				),
			)
			.limit(pageSize)
			.offset(page * pageSize)
			.orderBy(
				query
					? this.Q.rankDesc(this.tbl.search, query)
					: this.$.asc(this.tbl.pokedexNumber),
				this.$.asc(this.tbl.pokedexNumber),
				this.$.asc(this.tbl.name),
			);
	};
}
