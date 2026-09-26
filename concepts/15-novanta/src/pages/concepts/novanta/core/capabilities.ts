/**
 * NOVANTA · cosa sa fare il browser (tech-architect §3).
 *
 * Tutte funzioni: nessun accesso a window/matchMedia a livello di modulo (il
 * sito fa prerender). Fuori dal browser rispondono con il caso "senza
 * preferenze" (niente reduced motion, puntatore fine, 16 px).
 */

const QUERY_REDUCED = '(prefers-reduced-motion: reduce)';
const QUERY_COARSE = '(pointer: coarse)';
const QUERY_SCRIPTING = '(scripting: enabled)';

/** Il MediaQueryList di `query`, o null fuori dal browser. */
export function mediaQuery(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  try {
    return window.matchMedia(query);
  } catch {
    return null;
  }
}

/** true se `query` è vera adesso. */
export function corrisponde(query: string): boolean {
  return mediaQuery(query)?.matches ?? false;
}

/** Ascolta i cambi di una media query. Restituisce la funzione per smettere. */
export function ascoltaMedia(query: string, fn: (vera: boolean) => void): () => void {
  const mq = mediaQuery(query);
  if (mq === null) return () => undefined;
  const suCambio = (e: MediaQueryListEvent): void => {
    fn(e.matches);
  };
  mq.addEventListener('change', suCambio);
  return () => {
    mq.removeEventListener('change', suCambio);
  };
}

export function prefersReducedMotion(): boolean {
  return corrisponde(QUERY_REDUCED);
}

/** Ascolta i cambi di `prefers-reduced-motion`. */
export function ascoltaReducedMotion(fn: (ridotto: boolean) => void): () => void {
  return ascoltaMedia(QUERY_REDUCED, fn);
}

/** Puntatore principale grossolano (dito). */
export function isCoarsePointer(): boolean {
  return corrisponde(QUERY_COARSE);
}

/**
 * `@media (scripting: enabled)`. I browser che non conoscono la feature
 * rispondono false anche con JavaScript acceso: qui siamo per forza in JS,
 * quindi fuori dal prerender la risposta è sempre true.
 */
export function supportaScripting(): boolean {
  if (typeof window === 'undefined') return false;
  return corrisponde(QUERY_SCRIPTING) || true;
}

/**
 * Quanti px CSS vale 1rem adesso (Dynamic Type, testo ingrandito del
 * browser). Si misura con una sonda: legge il layout, va chiamata solo in
 * handler o effetti (core/modo.ts, al resize).
 */
export function remPx(): number {
  if (typeof document === 'undefined' || document.body === null) return 16;
  const sonda = document.createElement('div');
  sonda.setAttribute('aria-hidden', 'true');
  sonda.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;inline-size:1rem;block-size:0;inset-block-start:0;inset-inline-start:0';
  document.body.appendChild(sonda);
  const v = sonda.getBoundingClientRect().width;
  sonda.remove();
  return v > 0 ? v : 16;
}

/**
 * `env(safe-area-inset-bottom)` in px (barra home dell'iPhone). Sonda come
 * sopra: solo in handler o effetti.
 */
export function safeAreaBasso(): number {
  if (typeof document === 'undefined' || document.body === null) return 0;
  const sonda = document.createElement('div');
  sonda.setAttribute('aria-hidden', 'true');
  sonda.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;inset-inline-start:0;inset-block-end:0;inline-size:0;block-size:env(safe-area-inset-bottom, 0px)';
  document.body.appendChild(sonda);
  const v = sonda.getBoundingClientRect().height;
  sonda.remove();
  return Number.isFinite(v) ? v : 0;
}
