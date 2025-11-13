import {migrate} from '@proj-airi/drizzle-orm-browser-migrator/pglite';
import {drizzle, type PgliteDatabase} from 'drizzle-orm/pglite';
import * as schema from './schema';

type Migration =
	typeof import('virtual:drizzle-migrations.sql')['default'][number];

function dedupMigrations(lst: Array<Migration>) {
	const result: Array<Migration> = [];
	const hashes = new Set();

	for (const migration of lst) {
		if (!hashes.has(migration.hash)) {
			hashes.add(migration.hash);
			result.push(migration);
		}
	}

	return result;
}

export async function createFs(dbName: string) {
	const {IdbFs} = await import('@electric-sql/pglite');
	return new IdbFs(dbName);
}

export namespace DB {
	export async function createEngine(name: string, tar?: Blob | File) {
		const {PGlite} = await import('@electric-sql/pglite');
		const fs = await createFs(name);
		return new PGlite({fs, loadDataDir: tar});
	}

	export type DatabaseEngine = Awaited<ReturnType<typeof createEngine>>;

	export function createDbContext(engine: DatabaseEngine): DatabaseContext {
		return drizzle({client: engine});
	}

	export type DatabaseContext = PgliteDatabase<typeof schema>;

	export async function migrateDatabase(ctx: DatabaseContext) {
		const {default: MIGRATIONS} = await import(
			'virtual:drizzle-migrations.sql'
		);

		const migrations = dedupMigrations(MIGRATIONS);
		await migrate(ctx, migrations);
	}

	export const tables = schema;
}
