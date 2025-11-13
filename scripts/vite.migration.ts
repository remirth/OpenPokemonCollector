import unpluginDrizzleOrmMigrations from '@proj-airi/unplugin-drizzle-orm-migrations/vite';
import {defineConfig} from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [unpluginDrizzleOrmMigrations(), tsConfigPaths()],
	build: {
		ssr: 'scripts/seed.ts',
		sourcemap: 'inline',
		outDir: '.dist',
		rollupOptions: {output: {entryFileNames: 'migrate.js'}},
	},
});
