/**
 * MADRE · il foglio azzurro che si stende sul bancone
 * (motion-designer, docs/motion-designer.md §6.3; creative-director 4.2,
 * trend-researcher P8).
 *
 * Tra la madre e i dolci la carta da zucchero arriva da destra come un
 * foglio spinto sul bancone: entra più veloce dei prodotti, scivola sotto il
 * cartello dei dolci e si posa al suo posto esattamente quando i dolci
 * arrivano al margine dell'area viva; da lì in poi è ferma sul bancone e si
 * cammina con lei (1:1). Tutto è legato al cammino (scroll), mai al tempo:
 * tornando indietro il foglio si ritira allo stesso modo.
 *
 * Geometria (coordinate del binario, px):
 * - `inizio`: il posto del foglio, cioè il suo bordo sinistro a riposo (il
 *   bordo sinistro del banco dei dolci meno un eventuale rientro);
 * - `anticipo` D: quanto più a destra parte (30% dell'area viva, 72-380 px);
 * - il foglio non va MAI a sinistra di `inizio`: non copre mai la madre né i
 *   prezzi crosta del pane (crosta su zucchero è 2,43:1, vietato);
 * - tratto di stesura: dal cammino in cui il bordo compare al margine destro
 *   della finestra (bordo = w) a quello in cui `inizio` arriva al margine
 *   sinistro dell'area viva (bordo = margine). Curva `stende`: entra a circa
 *   2× la velocità del bancone e si posa con velocità relativa nulla.
 *
 * Reduced motion: nessun anticipo. Il foglio è già steso al suo posto e si
 * cammina con lui come col resto del bancone (nessun movimento relativo,
 * nessun cambio di colore a tutta finestra). Vedi doc §6.3 per il perché.
 *
 * Modulo puro: nessun accesso a window/document.
 */

import { FOGLIO, margineVivo } from './choreography';
import { clamp, progressoTra, stende } from './easing';

export interface GeometriaFoglio {
  /** Bordo sinistro del foglio a riposo, in coordinate del binario (px). */
  inizio: number;
  /** Larghezza della finestra della vetrina (px). */
  w: number;
  /** Bordo sinistro dell'area viva (px), di solito `margineVivo(w)`. */
  margine: number;
}

export function geometriaFoglio(inizio: number, w: number, margine: number = margineVivo(w)): GeometriaFoglio {
  return { inizio, w, margine };
}

/** Quanto più a destra del suo posto parte il foglio (px). Sempre meno di metà dell'area viva. */
export function anticipoFoglio(g: GeometriaFoglio): number {
  const vivo = Math.max(0, g.w - g.margine);
  return Math.min(vivo * 0.5, clamp(vivo * FOGLIO.anticipo, FOGLIO.anticipoMin, FOGLIO.anticipoMax));
}

/** Il tratto di cammino (x della vetrina) in cui il foglio si stende. */
export function trattoFoglio(g: GeometriaFoglio): { da: number; a: number } {
  const d = anticipoFoglio(g);
  return { da: g.inizio + d - g.w, a: g.inizio - g.margine };
}

export interface PosizioneFoglio {
  /** x sullo schermo (px) del bordo sinistro del foglio, NON limitato. */
  bordo: number;
  /** 0..1 lungo il tratto di stesura (1 = steso). */
  progresso: number;
}

/**
 * Bordo del foglio sullo schermo quando la vetrina ha camminato di `x` px.
 * Continua: prima del tratto il bordo è oltre la finestra (≥ w), dopo il
 * tratto si muove col bancone. Scrive in `out` se dato (niente allocazioni).
 */
export function bordoFoglio(x: number, g: GeometriaFoglio, ridotto: boolean, out?: PosizioneFoglio): PosizioneFoglio {
  const r = out ?? { bordo: g.w, progresso: 0 };
  if (ridotto) {
    r.bordo = g.inizio - x;
    r.progresso = r.bordo <= g.margine ? 1 : 0;
    return r;
  }
  const d = anticipoFoglio(g);
  const { da, a } = trattoFoglio(g);
  const p = a > da ? progressoTra(da, a, x) : x >= a ? 1 : 0;
  r.bordo = g.inizio + d * (1 - stende(p)) - x;
  r.progresso = p;
  return r;
}

/**
 * Il valore da scrivere come traslazione del foglio (px): il bordo limitato a
 * [0, w]. Il foglio è largo quanto la finestra: traslato di 0 la copre tutta,
 * traslato di w è fuori. Una volta passato il bordo sinistro resta a 0.
 */
export function traslazioneFoglio(x: number, g: GeometriaFoglio, ridotto: boolean): number {
  return clamp(bordoFoglio(x, g, ridotto).bordo, 0, g.w);
}
