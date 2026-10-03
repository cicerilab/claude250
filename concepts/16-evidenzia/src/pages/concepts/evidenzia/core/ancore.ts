/**
 * EVIDENZIA · ancore e link di salto (ux-architect §2.1, §6.13).
 *
 * Id condivisi tra sezioni (non cambiarli: li usano i link di salto, il
 * sommario, la striscia delle rubriche, `?rubrica=` e "Vai al tuo giro"):
 * - `ID_ANNUNCI`: il `<main>` del foglio (lo rende Evidenzia.tsx);
 * - `idRubrica(r)`: l'`h2` della barra di ogni rubrica (Annunci), con
 *   `tabIndex={-1}`: "Vai agli annunci" porta il fuoco sull'`h2` della prima;
 * - `ID_PREPARA`: il bottone "Prepara il giro" del molo (foglio) o della
 *   barra (colonna) di Comandi. Uno solo in pagina per volta;
 * - `ID_LIVE`: la regione aria-live unica (Evidenzia.tsx);
 * - `ID_AIUTO_FOGLIO`: la descrizione accessibile del foglio (Foglio.tsx).
 *
 * `vaiAllAncora(id)` è il viaggio unico verso un'ancora interna: in Pagina
 * intera il fuoco che entra nel foglio riporta a Leggi (useTastieraFoglio),
 * poi l'elemento si mostra intero e riceve il fuoco. Evidenzia.tsx lo usa
 * per TUTTI i clic su `a[href^="#"]` dentro `.evd-root` (un solo ascoltatore
 * delegato): le sezioni non aggiungono gestori propri ai link `#`.
 */

import type { Rubrica } from '../content/annunci';
import { RUBRICHE } from '../content/testi';
import { mostraElemento } from './scroller';

export const ID_ANNUNCI = 'annunci';
export const ID_PREPARA = 'evd-prepara-giro';
export const ID_LIVE = 'evd-annunci-live';
export const ID_AIUTO_FOGLIO = 'evd-foglio-aiuto';

/** "evd-appartamenti", "evd-case", "evd-rustici", "evd-affitti". */
export function idRubrica(r: Rubrica): string {
  return `evd-${RUBRICHE[r].ancora}`;
}

/** Margine intorno all'elemento raggiunto (px), oltre agli scroll-padding. */
const MARGINE_ARRIVO = 16;

function focalizzabile(el: HTMLElement): boolean {
  if (el.hasAttribute('tabindex')) return true;
  return el.matches('a[href], button, input, select, textarea, summary, [contenteditable="true"]');
}

/**
 * Porta all'elemento con quell'id: lo mostra (in cima se `blocco` = 'start')
 * e gli dà il fuoco senza un secondo scorrimento. false se l'id non esiste.
 */
export function vaiAllAncora(id: string, opz?: { blocco?: ScrollLogicalPosition; liscio?: boolean }): boolean {
  if (typeof document === 'undefined' || id.length === 0) return false;
  const el = document.getElementById(id);
  if (el === null) return false;
  if (!focalizzabile(el)) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  mostraElemento(el, MARGINE_ARRIVO, { blocco: opz?.blocco ?? 'nearest', liscio: opz?.liscio });
  return true;
}
