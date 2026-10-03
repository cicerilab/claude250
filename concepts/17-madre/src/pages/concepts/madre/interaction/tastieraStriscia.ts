/**
 * MADRE · frecce sinistra/destra lungo la vetrina (interaction-designer §4,
 * tech-architect §6.3, ux-architect §6.4).
 *
 * Quando il fuoco è dentro il binario, freccia destra porta il fuoco alla
 * "sosta" successiva (il prodotto dopo), freccia sinistra a quella prima.
 * Una sosta è ogni `article.mad-prodotto` e ogni elemento marcato
 * `data-mad-sosta` (cartelli dei banchi, la madre, il cartello "Un dolce
 * intero", le paste della domenica…). Il fuoco va al primo controllo della
 * sosta ("Nel pane fisso", "Sul vassoio", un link); se la sosta non ne ha
 * (i dolci), va alla sosta stessa, resa focalizzabile con `tabindex="-1"`.
 *
 * La striscia si sposta da sola fino all'elemento: lo fa `vetrina/seguiFuoco.ts`
 * (scaffold) sul `focusin`, come per il Tab. Qui si chiama solo
 * `focus({ preventScroll: true })`.
 *
 * Su/giù, Home/Fine, PagSu/PagGiù e Spazio restano quelli della pagina.
 * Le frecce non fanno nulla dentro campi di testo, slider, gruppi di radio e
 * liste di schede (dove le frecce hanno già un significato), né con i tasti
 * modificatori. Ai bordi della vetrina il fuoco resta dov'è (niente giro).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useEffect, type RefObject } from 'react';

/** Cosa conta come "prodotto" per le frecce. */
export const SELETTORE_SOSTA = '.mad-prodotto, [data-mad-sosta]';

const SELETTORE_FOCUSABILI = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Dove le frecce appartengono già al controllo. */
const SELETTORE_FRECCE_PROPRIE = [
  'input',
  'textarea',
  'select',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[role="radiogroup"]',
  '[role="radio"]',
  '[role="tablist"]',
  '[role="slider"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="grid"]',
].join(', ');

function visibile(el: HTMLElement): boolean {
  if (el.closest('[hidden], [inert]') !== null) return false;
  return el.getClientRects().length > 0;
}

/** Le soste "foglia" (una sosta che ne contiene altre non conta), in ordine DOM. */
export function sosteDi(binario: HTMLElement): HTMLElement[] {
  const tutte = Array.from(binario.querySelectorAll<HTMLElement>(SELETTORE_SOSTA)).filter(visibile);
  return tutte.filter((s) => !tutte.some((altra) => altra !== s && s.contains(altra)));
}

/** Il primo elemento che riceve il fuoco dentro una sosta (o la sosta stessa). */
export function bersaglioDiSosta(sosta: HTMLElement): HTMLElement {
  const dentro = Array.from(sosta.querySelectorAll<HTMLElement>(SELETTORE_FOCUSABILI)).find(
    (el) => visibile(el) && el.getAttribute('aria-hidden') !== 'true',
  );
  if (dentro !== undefined) return dentro;
  if (!sosta.hasAttribute('tabindex')) sosta.setAttribute('tabindex', '-1');
  return sosta;
}

/** Indice della sosta da cui partire per il tasto dato, o null se non c'è dove andare. */
function prossimaSosta(soste: HTMLElement[], da: Element, avanti: boolean): HTMLElement | null {
  const corrente = soste.findIndex((s) => s === da || s.contains(da));
  if (corrente >= 0) {
    return soste[corrente + (avanti ? 1 : -1)] ?? null;
  }
  // Il fuoco è nel binario ma fuori da ogni sosta (per esempio un h2):
  // la prima sosta dopo (o l'ultima prima) in ordine di documento.
  if (avanti) {
    return soste.find((s) => (da.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) ?? null;
  }
  for (let i = soste.length - 1; i >= 0; i -= 1) {
    const s = soste[i];
    if (s !== undefined && (da.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_PRECEDING) !== 0) return s;
  }
  return null;
}

/**
 * Collega le frecce al binario della vetrina. Restituisce la funzione che le
 * stacca.
 */
export function collegaTastieraStriscia(binario: HTMLElement): () => void {
  function tasto(e: KeyboardEvent): void {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
    const da = e.target;
    if (!(da instanceof Element) || !binario.contains(da)) return;
    if (da.closest(SELETTORE_FRECCE_PROPRIE) !== null) return;

    const soste = sosteDi(binario);
    if (soste.length === 0) return;
    e.preventDefault();
    const meta = prossimaSosta(soste, da, e.key === 'ArrowRight');
    if (meta === null) return; // al bordo: si resta qui
    bersaglioDiSosta(meta).focus({ preventScroll: true });
  }

  binario.addEventListener('keydown', tasto);
  return () => {
    binario.removeEventListener('keydown', tasto);
  };
}

/** Versione React: collega le frecce al binario al mount. */
export function useTastieraStriscia(binario: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = binario.current;
    if (el === null) return undefined;
    return collegaTastieraStriscia(el);
  }, [binario]);
}
