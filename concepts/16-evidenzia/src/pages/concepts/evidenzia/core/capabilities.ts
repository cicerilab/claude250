/**
 * EVIDENZIA · capacità del dispositivo (tech-architect §9.3).
 *
 * Solo funzioni: nessun accesso al browser a livello di modulo. Le chiamano
 * Evidenzia.tsx al mount e lo store (vibrazione dopo un'aggiunta riuscita).
 */

const QUERY_REDUCED = '(prefers-reduced-motion: reduce)';
const QUERY_COARSE = '(pointer: coarse)';

function mediaQuery(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  try {
    return window.matchMedia(query);
  } catch {
    return null;
  }
}

/** `prefers-reduced-motion: reduce` adesso. */
export function prefersReducedMotion(): boolean {
  return mediaQuery(QUERY_REDUCED)?.matches ?? false;
}

/** Ascolta i cambi di `prefers-reduced-motion`. Restituisce la funzione per smettere. */
export function ascoltaReducedMotion(fn: (ridotto: boolean) => void): () => void {
  const mq = mediaQuery(QUERY_REDUCED);
  if (mq === null) return () => undefined;
  const suCambio = (e: MediaQueryListEvent): void => {
    fn(e.matches);
  };
  mq.addEventListener('change', suCambio);
  return () => {
    mq.removeEventListener('change', suCambio);
  };
}

/** Puntatore principale grossolano (dito). */
export function isCoarsePointer(): boolean {
  return mediaQuery(QUERY_COARSE)?.matches ?? false;
}

interface ConnessioneRisparmio {
  readonly saveData?: boolean;
}

/** `navigator.connection.saveData` (risparmio dati). */
export function saveData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: ConnessioneRisparmio }).connection;
  return conn?.saveData === true;
}

/** true se il dispositivo può vibrare (telefoni Android; iOS no). Mai con reduced motion. */
export function puoVibrare(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  return isCoarsePointer() && !prefersReducedMotion();
}

/** Vibrazione breve (10 ms dopo un'aggiunta al giro col gesto o col bottone). Silenziosa se non si può. */
export function vibra(ms: number): void {
  if (!puoVibrare()) return;
  try {
    navigator.vibrate(ms);
  } catch {
    // alcuni browser rifiutano la vibrazione senza un gesto recente: niente da fare
  }
}
