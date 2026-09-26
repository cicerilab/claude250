/**
 * Vite · app standalone del Concept 15 (NOVANTA). Non si porta nel sito.
 *
 * - alias `@` → `src` come nel sito vero (import `@/lib/analytics`,
 *   `@/components/ConceptBackButton`);
 * - dev sulla 9150, preview sulla 9151, sempre `strictPort` (porte del
 *   concept in docs/ruoli-agent.md); gli altri agent usano
 *   `npx vite --port 91xx --strictPort`;
 * - target es2020 (tech-architect §1.4);
 * - react in un chunk suo, così il chunk `Concept15` misura solo il concept.
 *
 * Gli SVG e le foto si importano con `?raw` / `?url`, nativi di Vite:
 * nessun plugin, il porting non aggiunge dipendenze.
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
    port: 9150,
    strictPort: true,
    open: false,
  },
  preview: {
    host: true,
    port: 9151,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
          return undefined;
        },
      },
    },
  },
});
