/**
 * IMPRONTA · misura del viewport in `runtime.viewport` (w, h, dpr).
 *
 * `osservaViewport()` la chiama Impronta.tsx al mount: misura subito e poi a
 * ogni `resize` della finestra e del `visualViewport` (tastiera mobile).
 * I listener fanno solo la misura (nessun layout) e svegliano il ticker.
 */

import { runtime } from '../state/runtime';
import { ticker } from './ticker';

function misura(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const v = runtime.viewport;
  if (v.w === w && v.h === h && v.dpr === dpr) return;
  v.w = w;
  v.h = h;
  v.dpr = dpr;
  runtime.markDirty();
  ticker.wake();
}

/** Avvia la misura del viewport. Restituisce lo smontaggio. */
export function osservaViewport(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  misura();
  const suResize = (): void => {
    misura();
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
