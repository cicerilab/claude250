/**
 * SOTTOSCOCCA · scroll nativo (tech-architect §0.4, ux-architect §2.6 e §7.2).
 *
 * Niente lenis, niente scroll-jacking: un solo listener `scroll` passivo che
 * sveglia il ticker (che poi legge `window.scrollY` una volta per frame).
 *
 * `vaiA(id)` porta all'ancora:
 * - con `behavior: smooth` solo senza reduced motion;
 * - per `gomme`, `freni`, `sottoscocca` allo scroll in cui il ponte è GIÀ
 *   alla loro quota (`scrollPerAncora` di ponte/quota.ts): "un salto verso una
 *   quota porta il ponte a quella quota";
 * - mette il fuoco sul primo `h1`/`h2` (o `[tabindex="-1"]`) della sezione,
 *   senza far scorrere (`preventScroll`), e non annuncia il plateau (il fuoco
 *   sull'h2 basta, ux §7.2).
 * Gli alias dell'ux (`#quota-0`, `#quota-20`, `#quota-80`, `#quota-180`)
 * portano agli id stabili del tech-architect.
 *
 * I link `#` della pagina passano tutti da qui grazie al gestore delegato di
 * Radice.tsx: le sezioni non aggiungono gestori propri ai link `#`.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { scrollPerAncora, silenziaPlateau } from '../ponte/quota';
import { ticker } from './ticker';

/** Alias dell'ux-architect (§1) → id delle sezioni. */
export const ALIAS_ANCORE: Readonly<Record<string, string>> = {
  'quota-0': 'inizio',
  'quota-20': 'gomme',
  'quota-80': 'freni',
  'quota-180': 'sottoscocca',
};

/** Id vero di un'ancora (gestisce gli alias). */
export function risolviAncora(id: string): string {
  return ALIAS_ANCORE[id] ?? id;
}

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
  /** Se false non sposta il fuoco (arrivo da hash al caricamento). Default true. */
  readonly fuoco?: boolean;
}

/** `scroll-padding-top` di <html> in px (testata), letto al momento. */
function margineAlto(): number {
  const v = Number.parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop);
  return Number.isFinite(v) ? v : 0;
}

function bersaglioFuoco(el: HTMLElement): HTMLElement {
  if (el.matches('h1, h2')) return el;
  return el.querySelector<HTMLElement>('h1, h2, [tabindex="-1"]') ?? el;
}

/**
 * Scorre all'ancora. Restituisce false se l'elemento non esiste (allora il
 * link fa il suo lavoro nativo).
 */
export function vaiA(idGrezzo: string, { ridotto, fuoco = true }: OpzioniVaiA): boolean {
  if (typeof document === 'undefined') return false;
  const id = risolviAncora(idGrezzo);
  const el = document.getElementById(id);
  if (el === null) return false;
  const comportamento: ScrollBehavior = ridotto ? 'auto' : 'smooth';
  const margine = margineAlto();
  const y = scrollPerAncora(id, margine);
  silenziaPlateau();
  if (y !== null) {
    window.scrollTo({ top: y, behavior: comportamento });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY - margine;
    window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: comportamento });
  }
  if (fuoco) {
    const b = bersaglioFuoco(el);
    if (!b.hasAttribute('tabindex') && !b.matches('a[href], button, input, select, textarea')) {
      b.setAttribute('tabindex', '-1');
    }
    try {
      b.focus({ preventScroll: true });
    } catch {
      // nessun fuoco possibile: la pagina scorre lo stesso
    }
  }
  ticker.wake();
  return true;
}
