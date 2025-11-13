import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import unpluginDrizzleOrmMigrations from "@proj-airi/unplugin-drizzle-orm-migrations/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tw from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  "publicDir": "./public",
  plugins: [
    unpluginDrizzleOrmMigrations(),
    tw(),
    tsConfigPaths(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  build: {
    assetsInlineLimit: 0, // avoid inlining huge assets
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
})
