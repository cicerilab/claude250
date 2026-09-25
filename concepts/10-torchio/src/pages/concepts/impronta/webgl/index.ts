/**
 * IMPRONTA · ingresso del chunk WebGL (shader-engineer).
 *
 * Contratto (core/glLoader.ts): default export = componente React senza prop
 * obbligatorie. Impronta.tsx lo carica con `import('../webgl')` dopo i font e
 * in un momento di quiete, e lo monta come figlio di `.imp-root` prima di
 * `.imp-contenuto`. Tutto three e tutto `webgl/` stanno in questo chunk lazy.
 */
export { default } from './ImprontaCanvas';
