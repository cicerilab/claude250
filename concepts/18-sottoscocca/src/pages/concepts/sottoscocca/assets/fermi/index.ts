/**
 * SOTTOSCOCCA · fermi immagine della scena 3D (webgl-artist, prima versione;
 * lo shader-engineer li rigenera dalla build con `npm run fermi`).
 *
 * Una coppia per plateau: `l` 1600 x 900 (landscape), `p` 750 x 1624
 * (portrait, 375 x 812 a DPR 2). `quota-0` e' il poster della prima schermata
 * (LCP); gli altri servono al fallback senza WebGL quando manca una foto.
 * Stessa camera e stessa luce di `webgl/scena/binario.ts` e `officina.ts`.
 * Il fondo e' il nero grasso esatto di `.ssc-root`.
 */

import type { Quota } from '../../content/lavori';
import q0l from './quota-0-l.webp';
import q0p from './quota-0-p.webp';
import q20l from './quota-20-l.webp';
import q20p from './quota-20-p.webp';
import q80l from './quota-80-l.webp';
import q80p from './quota-80-p.webp';
import q180l from './quota-180-l.webp';
import q180p from './quota-180-p.webp';

export interface FermoImmagine {
  /** 1600 x 900 */
  l: string;
  /** 750 x 1624 */
  p: string;
}

export const MISURE_FERMO = {
  l: { larghezza: 1600, altezza: 900 },
  p: { larghezza: 750, altezza: 1624 },
} as const;

export const FERMI: Readonly<Record<Quota, FermoImmagine>> = {
  0: { l: q0l, p: q0p },
  20: { l: q20l, p: q20p },
  80: { l: q80l, p: q80p },
  180: { l: q180l, p: q180p },
};

/**
 * `srcset` per un <img> a tutto schermo: il browser sceglie `p` sui telefoni
 * in verticale solo se lo si mette in un <picture> con media query
 * `(orientation: portrait)`; qui le due sorgenti con la loro larghezza.
 */
export function srcsetFermo(q: Quota): { portrait: string; landscape: string } {
  return { portrait: `${FERMI[q].p} 750w`, landscape: `${FERMI[q].l} 1600w` };
}
