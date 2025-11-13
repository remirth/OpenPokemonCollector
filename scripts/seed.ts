import fs from 'node:fs';
import path from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {DB} from '../src/db';
import {RepositoryContext} from '../src/repositories/repositoryContext';
import {importData} from './importData';
import {Pokedex} from './pokedex';

Pokedex.get();

const db = new PGlite({dataDir: 'memory://pokemon_seed.db'});
// await db.exec(`SET search_path = public;`);

const ctx = RepositoryContext.bare(db);
console.log('Got context!');
await DB.migrateDatabase(ctx.db);
console.log('Migrated!');

console.log('Seeding!');
await importData(ctx);
console.log('Seed successful');

console.log('Dumping');
const file = await db.dumpDataDir('gzip');
const destination = path.join(
	import.meta.dirname,
	'..',
	'public',
	'seed.db.tgz',
);

const ab = await file.arrayBuffer();

fs.writeFileSync(destination, new Uint8Array(ab));

console.log('Dump success!');
// console.log('Temp database', tmpDB);
console.log('Gzipped tarball at', destination);
