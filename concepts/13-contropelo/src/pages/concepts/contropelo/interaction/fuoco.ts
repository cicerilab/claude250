/**
 * CONTROPELO · spostare il fuoco senza far scorrere la parete.
 *
 * Nel layout "fisso" la parete è una pista traslata dentro un contenitore che
 * taglia (overflow). `el.focus()` senza opzioni fa scorrere qualsiasi
 * antenato con overflow per mostrare l'elemento: la pista si sposterebbe di
 * lato senza passare dallo store, e lo specchio visibile non sarebbe più
 * quello attivo. Quindi, in layout "fisso", ogni fuoco programmatico usa
 * `preventScroll: true`. In "vetrina lunga" (`data-layout="scorre"`) la pagina
 * scorre davvero e il fuoco deve portare l'elemento in vista.
 *
 * Tutte le sezioni che spostano il fuoco (tablist, "Scrivi il tuo nome",
 * riga di scrittura, cambio di faccia, Informazioni) usano `mettiFuoco`.
 */

import { store } from '../state/store';

export interface OpzioniFuoco {
  /** Forza lo scorrimento anche in layout "fisso" (mai necessario nel concept). */
  scorri?: boolean;
}

/**
 * Mette il fuoco su `el`. Restituisce true se il fuoco è arrivato davvero
 * (l'elemento esiste, è collegato, non è `inert` né nascosto).
 */
export function mettiFuoco(el: HTMLElement | null | undefined, opz: OpzioniFuoco = {}): boolean {
  if (el === null || el === undefined || !el.isConnected) return false;
  const fisso = store.get().layout === 'fisso';
  el.focus({ preventScroll: fisso && opz.scorri !== true });
  return el.ownerDocument.activeElement === el;
}

/** Elementi interattivi nativi o con ruolo, usati da pulire e dal fuoco. */
export const SELETTORE_INTERATTIVO =
  'a[href], button, input, select, textarea, label, summary, [role="button"], [role="radio"], [role="tab"], [role="link"], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/** Campi dove il testo si scrive o si seleziona: niente gesto sopra. */
export const SELETTORE_CAMPO = 'input, textarea, select, [contenteditable="true"]';

/** true se l'elemento è visibile (ha almeno un rettangolo di layout). */
export function visibile(el: Element): boolean {
  return el.getClientRects().length > 0;
}
