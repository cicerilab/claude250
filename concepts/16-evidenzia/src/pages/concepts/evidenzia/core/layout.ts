/**
 * EVIDENZIA · i due impaginati (tech-architect §0.6).
 *
 * `'foglio'` da 640 px in su (il foglio scorre dentro il suo contenitore, nei
 * due assi), `'colonna'` sotto (colonna del giornale piegato, scorre la
 * finestra). Stesso DOM, cambia il CSS e la sorgente dello scroll.
 * Soglia da `BREAKPOINT.colonna` dei token. Nessun accesso al browser a
 * livello di modulo.
 */

import { BREAKPOINT } from '../styles/tokens';

export type Layout = 'foglio' | 'colonna';

export const QUERY_FOGLIO = `(min-width: ${BREAKPOINT.colonna}px)`;

function mq(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  try {
    return window.matchMedia(QUERY_FOGLIO);
  } catch {
    return null;
  }
}

/** Layout di adesso. Senza finestra (prerender): 'foglio'. */
export function leggiLayout(): Layout {
  const m = mq();
  if (m === null) return 'foglio';
  return m.matches ? 'foglio' : 'colonna';
}

/** Ascolta il passaggio foglio ↔ colonna. Restituisce la funzione per smettere. */
export function ascoltaLayout(fn: (layout: Layout) => void): () => void {
  const m = mq();
  if (m === null) return () => undefined;
  const suCambio = (e: MediaQueryListEvent): void => {
    fn(e.matches ? 'foglio' : 'colonna');
  };
  m.addEventListener('change', suCambio);
  return () => {
    m.removeEventListener('change', suCambio);
  };
}
