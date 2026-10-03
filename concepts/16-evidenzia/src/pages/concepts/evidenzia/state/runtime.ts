/**
 * EVIDENZIA · valori caldi (tech-architect §6.2, interaction-designer §8,
 * motion-designer §8).
 *
 * Oggetto mutabile, MAI nello stato React: lo leggono e lo scrivono i moduli
 * dentro il ticker e negli handler dei gesti. Nessun accesso al browser qui.
 *
 * Chi scrive cosa:
 * - `viewport`: core/viewport.ts (resize, visualViewport);
 * - `foglio`: core/scroller.ts (x, y, w, h nella fase `read`) e
 *   foglio/Foglio.tsx (contenutoW, contenutoH, scala quando cambiano);
 * - `puntatore`: libero per chi segue il puntatore (oggi nessuno);
 * - `tratti`: interaction/useEvidenziatore.ts durante il gesto e
 *   motion/tratto.ts a fine animazione; lo legge tratto/Tratto.tsx in `write`;
 * - `pan`: interaction/usePan.ts.
 */

export type TipoPuntatore = 'mouse' | 'touch' | 'pen';

export interface Viewport {
  /** px CSS (innerWidth). 0 prima del montaggio. */
  w: number;
  h: number;
  dpr: number;
}

/**
 * Scroll e misure del foglio.
 * - x, y: scroll corrente in px dello schermo (scrollLeft/scrollTop dello
 *   scroller in layout 'foglio'; scrollX/scrollY in 'colonna');
 * - w, h: area visibile dello scroller (clientWidth/clientHeight) o della finestra;
 * - contenutoW, contenutoH: misure della pagina NON scalata (`.evd-pagina`);
 * - scala: 1 in Leggi, < 1 in Pagina intera. Un punto del contenuto (px non
 *   scalati) sta allo scroll `punto × scala` (vedi core/scroller.ts `vaiA`).
 */
export interface StatoFoglio {
  x: number;
  y: number;
  w: number;
  h: number;
  contenutoW: number;
  contenutoH: number;
  scala: number;
}

export interface Puntatore {
  x: number;
  y: number;
  attivo: boolean;
  tipo: TipoPuntatore;
}

/** Stato caldo del tratto di un annuncio (avanzamento 0..1 sulla lunghezza delle righe). */
export interface VoceTratto {
  avanzamento: number;
  bersaglio: number;
  riga: 0 | 1;
  gesto: boolean;
}

export interface StatoPan {
  /** spazio tenuto premuto (la mano ovunque) */
  spazio: boolean;
  /** trascinamento in corso */
  trascina: boolean;
}

export interface Runtime {
  viewport: Viewport;
  foglio: StatoFoglio;
  puntatore: Puntatore;
  tratti: Map<string, VoceTratto>;
  pan: StatoPan;
  /** Valori iniziali (al mount di Evidenzia.tsx). */
  reset(): void;
}

export const runtime: Runtime = {
  viewport: { w: 0, h: 0, dpr: 1 },
  foglio: { x: 0, y: 0, w: 0, h: 0, contenutoW: 0, contenutoH: 0, scala: 1 },
  puntatore: { x: 0, y: 0, attivo: false, tipo: 'mouse' },
  tratti: new Map(),
  pan: { spazio: false, trascina: false },
  reset(): void {
    const f = runtime.foglio;
    f.x = 0;
    f.y = 0;
    f.w = 0;
    f.h = 0;
    f.contenutoW = 0;
    f.contenutoH = 0;
    f.scala = 1;
    runtime.puntatore.x = 0;
    runtime.puntatore.y = 0;
    runtime.puntatore.attivo = false;
    runtime.puntatore.tipo = 'mouse';
    runtime.tratti.clear();
    runtime.pan.spazio = false;
    runtime.pan.trascina = false;
  },
};
