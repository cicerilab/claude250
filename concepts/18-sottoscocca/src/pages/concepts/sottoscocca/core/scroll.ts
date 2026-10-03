/**
 * SOTTOSCOCCA · scroll nativo (tech-architect §0.4, ux-architect §2.6).
 *
 * Niente lenis, niente scroll-jacking: un solo listener `scroll` passivo che
 * sveglia il ticker (che poi legge `window.scrollY` una volta per frame).
 * `vaiA(id)` porta all'ancora con `behavior: smooth` solo senza reduced
 * motion, e mette il fuoco sul primo `h1/h2` (o `[tabindex="-1"]`) della
 * sezione, come chiede l'ux (§2.6). I link `#` della pagina passano tutti da
 * qui grazie al gestore delegato di Radice.tsx.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { ticker } from './ticker';

/** Solo Radice.tsx: avvia il listener passivo. Restituisce lo smontaggio. */
export function avviaScroll(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const sveglia = (): void => {
    ticker.wake();
  };
  window.addEventListener('scroll', sveglia, { passive: true });
  return () => {
    window.removeEventListener('scroll', sveglia);
  };
}

export interface OpzioniVaiA {
  /** Reduced motion: salto istantaneo. */
  readonly ridotto: boolean;
  /** Se false non sposta il fuoco (default true). */
  readonly fuoco?: boolean;
}

/**
 * Scorre all'elemento con quell'id. Restituisce false se non esiste (allora
 * il link fa il suo lavoro nativo). Il fuoco va all'intestazione della
 * sezione, senza far scorrere ancora (`preventScroll`).
 */
export function vaiA(id: string, { ridotto, fuoco = true }: OpzioniVaiA): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (el === null) return false;
  el.scrollIntoView({ behavior: ridotto ? 'auto' : 'smooth', block: 'start' });
  if (fuoco) {
    const bersaglio =
      el.matches('h1, h2, [tabindex]') ? el : el.querySelector<HTMLElement>('h1, h2, [tabindex="-1"]') ?? el;
    if (!bersaglio.hasAttribute('tabindex')) bersaglio.setAttribute('tabindex', '-1');
    try {
      bersaglio.focus({ preventScroll: true });
    } catch {
      // nessun fuoco: la pagina scorre lo stesso
    }
  }
  ticker.wake();
  return true;
}
