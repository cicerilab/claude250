/**
 * SOTTOSCOCCA · ingresso del chunk WebGL (shader-engineer; stub dello scaffold).
 *
 * Contratto (core/glLoader.ts, tech-architect §9): default export = un
 * componente React SENZA prop obbligatorie, caricato in lazy con
 * `import('../webgl')` e montato da Radice.tsx come figlio diretto di
 * `.ssc-root`, dopo il Fondale e prima di `.ssc-contenuto`. Rende
 * `<div class="ssc-gl-strato" aria-hidden="true"><canvas class="ssc-gl" data-sscvar/></div>`
 * (posizione, livello e dissolvenza on/off sono in styles/layout.css), e
 * quando il primo frame è a schermo chiama `impostaGL('on')`.
 *
 * Lo stub non disegna niente: lo stato resta 'pending' e dopo 8 s Radice lo
 * porta a 'off' ('tempo'), cioè al fallback del Fondale.
 */

function ScenaStub() {
  return null;
}

export default ScenaStub;
