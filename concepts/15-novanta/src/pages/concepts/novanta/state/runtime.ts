/**
 * NOVANTA · valori caldi (tech-architect §6.2).
 *
 * Oggetto mutabile, MAI in React state: lo leggono e scrivono il ticker e gli
 * handler di input. React non si ri-renderizza per questi valori.
 *
 * Chi scrive cosa:
 * - `braccio`, `anello`: SOLO il rotore (motion/rotore.ts), comandato da
 *   sections/Quadrante/useBraccio.ts e sections/Prenota/useAnello.ts;
 * - `viewport`: core/viewport.ts (resize e visualViewport);
 * - `perno`: core/modo.ts (resize, mai per frame);
 * - `pernoAnello`: sections/Prenota/Anello.tsx (ResizeObserver);
 * - `ultimoInput`: interaction/attivita.ts (`segnaInput`).
 *
 * `reset()` rimette tutto a zero SENZA cambiare gli oggetti (`braccio` e
 * `anello` restano gli stessi riferimenti): un rotore creato prima del reset
 * continua a scrivere nell'oggetto giusto. Lo chiama Novanta.tsx al mount.
 *
 * Nessun accesso al browser a livello di modulo.
 */

export type StatoMoto = 'fermo' | 'trascina' | 'aggancio' | 'inerzia';

/** Stessa forma di `StatoRotazione` di motion/rotore.ts (motion-designer §3.1). */
export interface Rotazione {
  /** Angolo mostrato, con i decimali. Braccio 0..180, anello in gradi non limitati (conta i giri). */
  deg: number;
  /** Dove sta andando. */
  target: number;
  /** Gradi al secondo (inerzia). */
  vel: number;
  stato: StatoMoto;
}

export interface Viewport {
  /** Larghezza e altezza della finestra (layout viewport), px CSS. */
  w: number;
  h: number;
  /** Altezza del visualViewport (si accorcia con la tastiera del telefono). */
  vvH: number;
  dpr: number;
}

/** Centro e raggio di un goniometro in px del viewport. */
export interface Perno {
  x: number;
  y: number;
  r: number;
}

export interface Runtime {
  braccio: Rotazione;
  anello: Rotazione;
  viewport: Viewport;
  /** Perno e raggio del quadrante (core/modo.ts). */
  perno: Perno;
  /** Perno e raggio dell'anello della settimana (Anello.tsx). */
  pernoAnello: Perno;
  /** performance.now() dell'ultimo input dell'utente; 0 = mai. */
  ultimoInput: number;
  /** Tutto a zero, stessi oggetti. */
  reset(): void;
}

function azzeraRotazione(r: Rotazione): void {
  r.deg = 0;
  r.target = 0;
  r.vel = 0;
  r.stato = 'fermo';
}

function azzeraPerno(p: Perno): void {
  p.x = 0;
  p.y = 0;
  p.r = 0;
}

export const runtime: Runtime = {
  braccio: { deg: 0, target: 0, vel: 0, stato: 'fermo' },
  anello: { deg: 0, target: 0, vel: 0, stato: 'fermo' },
  viewport: { w: 0, h: 0, vvH: 0, dpr: 1 },
  perno: { x: 0, y: 0, r: 0 },
  pernoAnello: { x: 0, y: 0, r: 0 },
  ultimoInput: 0,
  reset(): void {
    azzeraRotazione(this.braccio);
    azzeraRotazione(this.anello);
    this.viewport.w = 0;
    this.viewport.h = 0;
    this.viewport.vvH = 0;
    this.viewport.dpr = 1;
    azzeraPerno(this.perno);
    azzeraPerno(this.pernoAnello);
    this.ultimoInput = 0;
  },
};
