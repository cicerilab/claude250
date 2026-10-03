/**
 * Vite · app standalone del Concept 13 (CONTROPELO). Solo standalone: non si porta.
 *
 * - alias `@` → `src` come nel sito vero (`@/lib/analytics`,
 *   `@/components/ConceptBackButton`);
 * - dev sulla porta 9130, preview sulla 9131, sempre `strictPort` (tech-architect §11:
 *   gli altri agent passano la loro porta con `--port <n> --strictPort`);
 * - target es2020 (tech-architect §1.4);
 * - react + router in un chunk a parte (il budget JS del concept si misura da solo).
 *
 * Le foto `.webp` si importano con gli import nativi di Vite: nessun plugin,
 * così il porting nel sito non aggiunge dipendenze.
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
    port: 9130,
    strictPort: true,
    open: false,
  },
  preview: {
    host: true,
    port: 9131,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
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
