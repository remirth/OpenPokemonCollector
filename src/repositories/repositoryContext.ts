import {DB} from '~/db';
import {NotInitializedError} from '~/lib/errors';
import {http} from '~/lib/http';
import {ArtistRepository} from './artistRepository';
import {CardRepository} from './cardRepository';
import {EntityRelationRepository} from './entityRelationRepository';
import {EntityRepository} from './entityRepository';
import {RarityRepository} from './rarityRepository';
import {SetRepository} from './setRepository';
import {SubtypeRelationRepository} from './subtypeRelationRepository';
import {SubtypeRepository} from './subtypeRepository';
import {TypeRelationRepository} from './typeRelationRepository';
import {TypeRepository} from './typeRepository';

export class RepositoryContext {
	readonly sets: SetRepository;
	readonly cards: CardRepository;
	readonly types: TypeRepository;
	readonly artists: ArtistRepository;
	readonly rarities: RarityRepository;
	readonly entities: EntityRepository;
	readonly subtypes: SubtypeRepository;
	readonly typeRelations: TypeRelationRepository;
	readonly subtypeRelations: SubtypeRelationRepository;
	readonly entityRelations: EntityRelationRepository;

	private constructor(
		readonly db: DB.DatabaseContext,
		readonly connection: DB.DatabaseEngine,
		readonly tables: typeof DB.tables,
	) {
		this.sets = new SetRepository(this);
		this.cards = new CardRepository(this);
		this.types = new TypeRepository(this);
		this.rarities = new RarityRepository(this);
		this.entities = new EntityRepository(this);
		this.subtypes = new SubtypeRepository(this);
		this.artists = new ArtistRepository(this);
		this.typeRelations = new TypeRelationRepository(this);
		this.subtypeRelations = new SubtypeRelationRepository(this);
		this.entityRelations = new EntityRelationRepository(this);
	}

	static #instance: Promise<RepositoryContext> | undefined;
	static readonly get = () => {
		try {
			return NotInitializedError.test(
				'RepositoryContext instance',
				this.#instance,
			);
		} catch {
			this.#instance = this.create();
			return this.#instance;
		}
	};

	static readonly databaseIsSeeded = async (engine: DB.DatabaseEngine) => {
		const result = await engine.exec(`SELECT COUNT(*) AS table_count
            FROM information_schema.tables
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema');`);

		console.log(result);
		const row = result[0]?.rows[0] as {table_count: number} | undefined;
		NotInitializedError.assert('Table count', row);
		console.log(row);
		return row.table_count > 0;
	};

	static readonly checkDbExists = (name: string): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			let existed = true;
			const req = indexedDB.open(`/pglite/${name}`);
			req.onupgradeneeded = (event) => {
				// If oldVersion is 0, the DB did not exist before this open.
				existed = (event.oldVersion ?? 0) !== 0;
			};
			req.onsuccess = () => {
				req.result.close();
				resolve(existed);
			};
			req.onerror = () => reject(req.error);
		});
	};

	static readonly bare = (engine: DB.DatabaseEngine) => {
		const ctx = DB.createDbContext(engine);
		return new RepositoryContext(ctx, engine, DB.tables);
	};

	static readonly create = async () => {
		const name = 'pokemon-collector.db';
		const exists = await this.checkDbExists(name);
		console.debug('Database Exists', exists);
		let engine: DB.DatabaseEngine;

		if (!exists) {
			const seed = await this.fetchSeed();
			engine = await DB.createEngine(name, seed);
		}
		engine ??= await DB.createEngine(name);

		if (import.meta.env.DEV) {
			// biome-ignore lint/suspicious/noExplicitAny: Running in dev mode make the database accessible from devtools
			(window as any).db = engine;
		}

		const ctx = DB.createDbContext(engine);
		const shouldMigrate = DB.shouldMigrate();

		if (shouldMigrate) {
			await DB.migrateDatabase(ctx);
			DB.updatePerformedMigrations();
		}

		const instance = new RepositoryContext(ctx, engine, DB.tables);
		return instance;
	};

	static readonly fetchSeed = async () => {
		const dump = await http(`${import.meta.env.BASE_URL}seed.db.tgz`);
		const ds = new DecompressionStream('gzip');
		NotInitializedError.assert('Response body', dump.body);
		const decompressed = dump.body.pipeThrough(ds);
		return new Response(decompressed).blob();
	};
}
