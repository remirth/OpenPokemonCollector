import * as $ from 'drizzle-orm';
import type {PgColumn} from 'drizzle-orm/pg-core';
import * as R from 'remeda';
import type {DB} from '~/db';
import {NotInitializedError} from '~/lib/errors';
import type {RepositoryContext} from './repositoryContext';

export abstract class BaseRepository {
	protected readonly T: typeof DB.tables;
	protected readonly db: DB.DatabaseContext;
	protected readonly connection: DB.DatabaseEngine;
	protected readonly $ = $;
	protected readonly R = R;

	constructor(protected readonly ctx: RepositoryContext) {
		this.connection = ctx.connection;
		this.db = ctx.db;
		this.T = ctx.tables;
	}

	protected readonly assertFirst = <T>(name: string) => {
		return (rows: Array<T>) => NotInitializedError.test(name, rows[0]);
	};

	protected readonly assert = <T>(name: string) => {
		return (value: T) => NotInitializedError.test(name, value);
	};

	protected readonly Q = {
		toTSQ: (q: string) => this.$.sql`ngram_tsquery(${q})`,
		match: <T extends $.ColumnBaseConfig<$.ColumnDataType, string>>(
			col: PgColumn<T>,
			q: string,
		) => this.$.sql`${col} @@ ${this.Q.toTSQ(q)}`,
		rankDesc: <T extends $.ColumnBaseConfig<$.ColumnDataType, string>>(
			col: PgColumn<T>,
			q: string,
		) => this.$.sql`ts_rank_cd(${col}, ${this.Q.toTSQ(q)}) DESC`,
	};
}
