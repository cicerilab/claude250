/**
 * EVIDENZIA · il solo punto da cui si cambia tra Leggi e Pagina intera
 * (interaction-designer).
 *
 * Lo usano i miei hook (tasti + e -, pizzico, clic in Pagina intera, fuoco
 * che entra in un annuncio) e i bottoni Leggi / Pagina intera del molo
 * (section-builder-comandi). Tenere un solo ingresso serve a due regole:
 *
 * 1. anti-lampeggio: cambiare vista cambia la luminosità dell'intera
 *    finestra (testo fitto contro carta), quindi al massimo UN cambio ogni
 *    500 ms, qualunque sia la sorgente (tasto tenuto premuto, pizzichi
 *    ripetuti, clic a raffica). Le richieste troppo ravvicinate si scartano:
 *    niente coda, così un tasto tenuto giù non produce un'altalena;
 * 2. mai Pagina intera nella colonna (< 640 px): lì non esiste.
 *
 * L'animazione (motion/vista.ts) e il punto fisso li gestisce lo scaffold
 * dentro `impostaVista` (vedi docs/interaction-designer.md §9).
 */

import { impostaVista, store, type Vista } from '../state/store';

/** Intervallo minimo tra due cambi di vista effettivi (anti-lampeggio). */
export const INTERVALLO_VISTA_MS = 500;

/** Punto in coordinate del contenuto NON scalato (quelle di `vaiA`). */
export interface PuntoContenuto {
  readonly x: number;
  readonly y: number;
}

let ultimoCambio = -Infinity;

function adesso(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/**
 * Chiede la vista `v`. `punto` (facoltativo): il punto del contenuto che deve
 * finire al centro della finestra quando si torna a Leggi.
 * `forza`: salta l'intervallo minimo (solo per il fuoco da tastiera che entra
 * in un annuncio: succede una volta, poi si è già in Leggi).
 * Restituisce true se il cambio è partito.
 */
export function chiediVista(v: Vista, punto?: PuntoContenuto, opz?: { readonly forza?: boolean }): boolean {
  const s = store.get();
  if (s.layout !== 'foglio') return false;
  if (s.vista === v) return false;
  const ora = adesso();
  if (opz?.forza !== true && ora - ultimoCambio < INTERVALLO_VISTA_MS) return false;
  ultimoCambio = ora;
  impostaVista(v, punto);
  return true;
}

/** Leggi ↔ Pagina intera. */
export function alternaVista(punto?: PuntoContenuto): boolean {
  return chiediVista(store.get().vista === 'leggi' ? 'intera' : 'leggi', punto);
}

/** Solo per lo smontaggio e i test. */
export function azzeraCambioVista(): void {
  ultimoCambio = -Infinity;
}
