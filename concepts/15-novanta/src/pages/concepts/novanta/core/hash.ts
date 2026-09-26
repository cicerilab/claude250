/**
 * NOVANTA · frammento dell'URL ⇄ angolo (tech-architect §7.5, ux-architect §1.1).
 *
 * - Si conserva SEMPRE `history.state` (React Router ci tiene la sua chiave):
 *   mai `location.hash = …`, che nel sito vero farebbe anche un salto di scroll.
 * - Nella storia si scrive solo quando il braccio si è FERMATO su un angolo
 *   diverso dall'ultimo scritto (`annotaArrivo`, dall'`onFermo` del rotore).
 *   Più arrivi entro 800 ms (rotella veloce 0 → 30 → 60) fanno un solo passo
 *   di storia: il primo è `push`, i successivi `replace`.
 * - Indietro/Avanti (`popstate`): `ascoltaPopstate` segna l'angolo come già
 *   scritto (l'arrivo che segue non fa un nuovo push) e chiama la fn.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { ANGOLI, angoloPiuVicino, type Angolo } from '../dial/geometria';
import { idAngolo } from './ids';

const PREFISSO = '#gradi-';

/** Finestra in cui più arrivi fanno un solo passo di storia (ms). */
export const FINESTRA_STORIA_MS = 800;

let ultimoScritto: Angolo | null = null;
let ultimoPush = Number.NEGATIVE_INFINITY;

export type LetturaHash =
  | { readonly tipo: 'nessuno' }
  | { readonly tipo: 'angolo'; readonly angolo: Angolo; readonly esatto: boolean }
  | { readonly tipo: 'sconosciuto' };

/**
 * Legge un frammento: `#gradi-90` → angolo esatto; `#gradi-47` → 60, non
 * esatto (va corretto con `replace`); altro → sconosciuto (va tolto).
 */
export function leggiHash(hash: string): LetturaHash {
  if (hash === '' || hash === '#') return { tipo: 'nessuno' };
  if (!hash.startsWith(PREFISSO)) return { tipo: 'sconosciuto' };
  const resto = hash.slice(PREFISSO.length);
  if (!/^-?\d+(\.\d+)?$/.test(resto)) return { tipo: 'sconosciuto' };
  const n = Number(resto);
  if (!Number.isFinite(n)) return { tipo: 'sconosciuto' };
  const angolo = angoloPiuVicino(n);
  return { tipo: 'angolo', angolo, esatto: (ANGOLI as readonly number[]).includes(n) };
}

/** `'#gradi-90'` → 90; qualsiasi altra cosa → null (contratto tech-architect §7.5). */
export function leggiAngoloDaHash(hash: string): Angolo | null {
  const l = leggiHash(hash);
  return l.tipo === 'angolo' ? l.angolo : null;
}

function urlCon(frammento: string): string {
  const { pathname, search } = window.location;
  return `${pathname}${search}${frammento}`;
}

/** Scrive `#gradi-N` nella storia conservando `history.state`. */
export function scriviHash(a: Angolo, modo: 'push' | 'replace'): void {
  if (typeof window === 'undefined') return;
  const url = urlCon(`#${idAngolo(a)}`);
  try {
    if (modo === 'push') window.history.pushState(window.history.state, '', url);
    else window.history.replaceState(window.history.state, '', url);
    ultimoScritto = a;
    if (modo === 'push') ultimoPush = performance.now();
  } catch {
    // storia non scrivibile (iframe sandbox): il sito funziona uguale
  }
}

/** Toglie il frammento (sconosciuto) con `replace`. */
export function togliHash(): void {
  if (typeof window === 'undefined') return;
  try {
    window.history.replaceState(window.history.state, '', urlCon(''));
  } catch {
    // come sopra
  }
}

/**
 * Il braccio si è fermato su `a`: push, replace dentro la finestra di 800 ms,
 * niente se `a` è già l'ultimo scritto. La chiama useBraccio (onFermo).
 */
export function annotaArrivo(a: Angolo): void {
  if (a === ultimoScritto) return;
  const ora = performance.now();
  scriviHash(a, ora - ultimoPush < FINESTRA_STORIA_MS ? 'replace' : 'push');
}

/**
 * Segna `a` come già presente nell'URL senza scrivere (arrivo iniziale con
 * hash, popstate). Lo usano Novanta.tsx e `ascoltaPopstate`.
 */
export function segnaScritto(a: Angolo | null): void {
  ultimoScritto = a;
}

/**
 * Indietro/Avanti del browser: la fn riceve l'angolo del frammento (0 se non
 * c'è frammento). Restituisce la pulizia.
 */
export function ascoltaPopstate(fn: (a: Angolo) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const suPop = (): void => {
    const a = leggiAngoloDaHash(window.location.hash) ?? 0;
    ultimoScritto = a;
    fn(a);
  };
  window.addEventListener('popstate', suPop);
  return () => {
    window.removeEventListener('popstate', suPop);
  };
}

/** Rimette lo stato del modulo come all'avvio (Novanta.tsx al mount). */
export function azzeraStoria(): void {
  ultimoScritto = null;
  ultimoPush = Number.NEGATIVE_INFINITY;
}
