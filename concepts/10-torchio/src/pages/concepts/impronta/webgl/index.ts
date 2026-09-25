/**
 * STUB dello scaffold-engineer: il componente del canvas WebGL non rende
 * niente, così `data-gl` resta "pending" e si vede il rilievo CSS. La
 * proprietà passa allo shader-engineer (tech-architect §4), che lo sostituisce
 * con `export { default } from './ImprontaCanvas'`.
 *
 * Contratto (core/glLoader.ts): default export = componente React senza prop
 * obbligatorie. Lo carica Impronta.tsx con `import('../webgl')` dopo i font e
 * in un momento di quiete; quando il primo frame completo è pronto chiama
 * `impostaGL('on')` (state/store.ts); se si spegne, `impostaGL('off', motivo)`.
 */
export default function ImprontaCanvas(): null {
  return null;
}
