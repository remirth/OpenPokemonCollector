import unpluginDrizzleOrmMigrations from '@proj-airi/unplugin-drizzle-orm-migrations/vite';
import tw from '@tailwindcss/vite';
import {tanstackRouter} from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import ReactCompiler from 'babel-plugin-react-compiler';
import {defineConfig} from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

const debugBuild = !!process.env['VITE_DEBUG_BUILD'];

// https://vitejs.dev/config/
export default defineConfig({
	publicDir: './public',
	define: debugBuild
		? {
				'process.env.NODE_ENV': JSON.stringify('development'),
			}
		: undefined,
	plugins: [
		unpluginDrizzleOrmMigrations(),
		tw(),
		tsConfigPaths(),
		tanstackRouter({target: 'react', autoCodeSplitting: true}),
		react({
			babel: {
				plugins: [ReactCompiler],
			},
		}),
	],
	build: {
		manifest: true,
		outDir: '.output',
		sourcemap: debugBuild,
		minify: debugBuild ? false : undefined,
	},
	optimizeDeps: {
		exclude: ['@electric-sql/pglite'],
	},
});
