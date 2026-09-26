/// <reference types="vite/client" />

/*
 * Tipi di Vite per gli import con suffisso: `?raw` (stringa: shader GLSL e
 * markup SVG), `?url` (URL dell'asset nel build). Li usano webgl/materials.ts
 * e assets/svg/index.ts. Nessun plugin: sono nativi di Vite.
 */

// Definita da vite.config.ts: true solo nella build di anteprima.
declare const __ANTEPRIMA__: boolean;
