/**
 * SOTTOSCOCCA · piccoli attrezzi condivisi dai moduli di interaction/.
 *
 * - `rendiNuovo`: un annuncio aria-live identico al precedente non verrebbe
 *   letto; uno spazio indivisibile in coda lo rende "nuovo".
 * - `unisciRef`: un elemento può servire a più moduli (registro dei punti
 *   dello scaffold, roving tabindex, trascinamento): i ref si compongono.
 * - `focusabili`, `eVisibile`, `prossimoFocusabileDopo`: ricerca del fuoco
 *   usata da scheda e popover (ritorno del fuoco, Tab che "esce" dalla scheda
 *   come se fosse nel DOM subito dopo il suo punto).
 * - `eTastoModificato`: le scorciatoie non scattano con Ctrl, Alt o Cmd
 *   (lasciano liberi i comandi del browser e dei lettori di schermo).
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import type { MutableRefObject, Ref, RefCallback } from 'react';

/** Spazio indivisibile usato per rendere "nuovo" un annuncio ripetuto. */
const NBSP = ' ';

/**
 * Restituisce `testo`, oppure `testo` + NBSP se coincide con l'ultimo
 * annuncio: aria-live legge solo i cambiamenti.
 */
export function rendiNuovo(testo: string, precedente: string): string {
  if (testo === '') return '';
  // Se l'ultimo era "testo", si alterna con "testo + NBSP" (e viceversa).
  return precedente === testo ? `${testo}${NBSP}` : testo;
}

/** Compone più ref (oggetto o callback) in un solo ref callback. */
export function unisciRef<T>(...refs: ReadonlyArray<Ref<T> | undefined>): RefCallback<T> {
  return (valore: T | null) => {
    for (const r of refs) {
      if (!r) continue;
      if (typeof r === 'function') {
        r(valore);
      } else {
        (r as MutableRefObject<T | null>).current = valore;
      }
    }
  };
}

const SELETTORE_FOCUSABILI = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]',
].join(',');

/**
 * true se l'elemento può davvero ricevere il fuoco adesso: non `hidden`, non
 * dentro un antenato `hidden` o `inert`, con un box disegnato.
 */
export function eVisibile(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest('[hidden],[inert]')) return false;
  if (el.getClientRects().length === 0) return false;
  const stile = el.ownerDocument.defaultView?.getComputedStyle(el);
  return !stile || stile.visibility !== 'hidden';
}

/** Elementi raggiungibili con Tab dentro `radice`, in ordine di documento. */
export function focusabili(radice: ParentNode): HTMLElement[] {
  const esito: HTMLElement[] = [];
  radice.querySelectorAll<HTMLElement>(SELETTORE_FOCUSABILI).forEach((el) => {
    if (el.tabIndex < 0) return;
    if (!eVisibile(el)) return;
    esito.push(el);
  });
  return esito;
}

/**
 * Il primo elemento tabulabile che segue `riferimento` nel documento, dentro
 * `radice`, saltando quelli contenuti in `escluso` (la scheda stessa).
 */
export function prossimoFocusabileDopo(
  riferimento: Element,
  radice: ParentNode,
  escluso: Element | null,
): HTMLElement | null {
  for (const el of focusabili(radice)) {
    if (escluso && escluso.contains(el)) continue;
    if (el === riferimento || riferimento.contains(el)) continue;
    const pos = riferimento.compareDocumentPosition(el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return el;
  }
  return null;
}

/** true se è premuto Ctrl, Alt o Meta (Maiusc da solo non conta). */
export function eTastoModificato(e: { ctrlKey: boolean; altKey: boolean; metaKey: boolean }): boolean {
  return e.ctrlKey || e.altKey || e.metaKey;
}

/** Tempo corrente in ms (stessa base del ticker). Solo da handler ed effetti. */
export function adesso(): number {
  return performance.now();
}
