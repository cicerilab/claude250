/**
 * Vite · app standalone del Concept 16 (EVIDENZIA). Non si porta nel sito.
 *
 * - alias `@` → `src` come nel sito vero (`@/lib/analytics`,
 *   `@/components/ConceptBackButton`);
 * - dev sulla porta 9160, preview sulla 9161 (tech-architect §11), sempre
 *   `strictPort`: mai una porta di un altro concept;
 * - target es2020 (tech-architect §1.4);
 * - due chunk a parte: `react` (react, react-dom, scheduler, router) e
 *   `leaflet`, che entra solo con l'`import()` della mappa all'apertura del giro.
 *
 * Foto e SVG si importano con gli import nativi di Vite (`./x.webp`,
 * `./x.svg?raw`): nessun plugin, il porting non aggiunge dipendenze.
 */
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 9160,
    strictPort: true,
    open: false,
  },
  preview: {
    host: true,
    port: 9161,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet/')) return 'leaflet';
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/scheduler') ||
            id.includes('node_modules/@remix-run')
          ) {
            return 'react';
          }
          return undefined;
        },
      },
    },
  },
});
