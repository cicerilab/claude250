/**
 * SOTTOSCOCCA · misura del viewport in `runtime.viewport` (w, h, dpr, orient).
 *
 * `osservaViewport()` la chiama Radice.tsx al mount: misura subito e poi a
 * ogni `resize` della finestra e del `visualViewport` (tastiera mobile).
 * I listener fanno solo la misura (nessun layout), invalidano le stazioni
 * (cambia la geometria) e svegliano il ticker. `onCambio` riceve la misura
 * nuova (Radice la usa per `data-orient`, la modalità bassa e `salta` del
 * motore al cambio di orientamento).
 */

import { runtime, type Orientamento } from '../state/runtime';
import { invalidaStazioni } from '../ponte/stazioni';
import { ticker } from './ticker';

export const ALTEZZA_BASSA = 520;

export interface MisuraViewport {
  readonly w: number;
  readonly h: number;
  readonly dpr: number;
  readonly orient: Orientamento;
  /** ux-architect §7.10: sotto 520 px di altezza la pagina è in modalità "bassa". */
  readonly bassa: boolean;
}

function misura(): MisuraViewport | null {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const orient: Orientamento = h > w ? 'portrait' : 'landscape';
  const v = runtime.viewport;
  if (v.w === w && v.h === h && v.dpr === dpr && v.orient === orient) return null;
  v.w = w;
  v.h = h;
  v.dpr = dpr;
  v.orient = orient;
  runtime.markDirty();
  invalidaStazioni();
  ticker.wake();
  return { w, h, dpr, orient, bassa: h < ALTEZZA_BASSA };
}

/** Avvia la misura del viewport. Restituisce lo smontaggio. */
export function osservaViewport(onCambio?: (m: MisuraViewport) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const prima = misura();
  if (prima !== null) onCambio?.(prima);
  const suResize = (): void => {
    const m = misura();
    if (m !== null) onCambio?.(m);
  };
  window.addEventListener('resize', suResize, { passive: true });
  window.addEventListener('orientationchange', suResize, { passive: true });
  const vv = window.visualViewport;
  vv?.addEventListener('resize', suResize, { passive: true });
  return () => {
    window.removeEventListener('resize', suResize);
    window.removeEventListener('orientationchange', suResize);
    vv?.removeEventListener('resize', suResize);
  };
}
