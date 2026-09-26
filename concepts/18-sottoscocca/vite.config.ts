/**
 * Vite · app standalone del Concept 18 (SOTTOSCOCCA). Solo standalone: non si porta.
 *
 * - alias `@` → `src` come nel sito vero (`@/lib/analytics`,
 *   `@/components/ConceptBackButton`);
 * - dev e preview sulla porta 9180, sempre `strictPort` (tech-architect §11:
 *   gli altri agent passano la loro porta con `--port <n> --strictPort`);
 * - target es2020 (tech-architect §1.4);
 * - three in un chunk suo (arriva solo con il WebGL lazy), react + router in un altro.
 *
 * Il modello (`webgl/modelli/auto.bin?url`), le foto `.webp` e gli SVG
 * (`?raw`) si importano con i suffissi nativi di Vite: nessun plugin, così il
 * porting nel sito non aggiunge dipendenze.
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
    port: 9180,
    strictPort: true,
    open: false,
  },
  preview: {
    host: true,
    port: 9180,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
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
