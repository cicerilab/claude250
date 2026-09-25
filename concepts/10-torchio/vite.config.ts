/**
 * Vite · app standalone del Concept 10 (IMPRONTA).
 *
 * - alias `@` → `src` come nel sito vero (import `@/lib/analytics`,
 *   `@/components/ConceptBackButton`);
 * - dev sulla porta 8080 (come il sito), preview sulla 4173;
 * - target es2020 (tech-architect §1.4);
 * - three in un chunk suo, così il WebGL lazy non entra nel percorso critico.
 *
 * Gli shader e gli SVG si importano con `?raw` / `?url`, nativi di Vite:
 * nessun plugin, così il porting nel sito non aggiunge dipendenze.
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
    port: 8080,
    strictPort: true,
    open: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
          return undefined;
        },
      },
    },
  },
});
