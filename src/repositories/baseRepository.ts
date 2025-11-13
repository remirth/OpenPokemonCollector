import * as $ from 'drizzle-orm';
import * as R from 'remeda';
import type {DB} from '~/db';
import {NotInitializedError} from '~/lib/errors';
import type {RepositoryContext} from './repositoryContext';

export abstract class BaseRepository {
	protected readonly tables: typeof DB.tables;
	protected readonly db: DB.DatabaseContext;
	protected readonly connection: DB.DatabaseEngine;
	protected readonly $ = $;
	protected readonly R = R;
	constructor(protected readonly ctx: RepositoryContext) {
		this.connection = ctx.connection;
		this.db = ctx.db;
		this.tables = ctx.tables;
	}

	protected assertFirst = <T>(name: string) => {
		return (rows: Array<T>) => NotInitializedError.test(name, rows[0]);
	};
}
