import {migrate} from '@proj-airi/drizzle-orm-browser-migrator/pglite';
import {drizzle, type PgliteDatabase} from 'drizzle-orm/pglite';
import {NotInitializedError} from '~/lib/errors';
import {stringArray} from '~/schemas/shared';
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

	export async function createEngineInMemory(tar?: Blob | File) {
		const {PGlite} = await import('@electric-sql/pglite');
		return new PGlite({dataDir: 'memory://open_pokemon.db', loadDataDir: tar});
	}

	export type DatabaseEngine = Awaited<ReturnType<typeof createEngine>>;

	export function createDbContext(engine: DatabaseEngine): DatabaseContext {
		return drizzle({client: engine});
	}

	export const shouldMigrate = (): boolean => {
		NotInitializedError.assert('Migrations not loaded', migrations);
		const data = getPerformedMigrations();
		if (!data) return true;

		const performed = new Set(data);
		for (const m of migrations) {
			if (!performed.has(m.tag)) {
				return true;
			}
		}

		return false;
	};

	const MIGRATIONS_KEY = '__PERFORMED_MIGRATIONS';

	export const getPerformedMigrations = () => {
		NotInitializedError.assert('Window', window);
		const data = localStorage.getItem(MIGRATIONS_KEY);
		if (!data) return undefined;

		return stringArray.assert(JSON.parse(data));
	};

	export const updatePerformedMigrations = () => {
		NotInitializedError.assert('Migrations not loaded', migrations);
		localStorage.setItem(
			MIGRATIONS_KEY,
			JSON.stringify(migrations.map((m) => m.tag)),
		);
	};

	export type DatabaseContext = PgliteDatabase<typeof schema>;

	export async function loadMigrations() {
		const {default: mig} = await import('virtual:drizzle-migrations.sql');
		migrations = dedupMigrations(mig).sort((a, b) => b.when - a.when);
	}

	export let migrations: Migration[] | undefined;
	export async function migrateDatabase(ctx: DatabaseContext) {
		NotInitializedError.assert('Migrations not loaded', migrations);
		await migrate(ctx, migrations);
	}

	export const tables = schema;
}
