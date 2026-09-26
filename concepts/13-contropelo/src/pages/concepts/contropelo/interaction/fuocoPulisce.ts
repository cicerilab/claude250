/**
 * CONTROPELO · il fuoco pulisce il vetro.
 *
 * Creative-director §6.4, ux-architect §8.3: nessun contenuto è raggiungibile
 * solo pulendo. Quando un elemento sul vetro prende il fuoco (da tastiera, da
 * tocco su un campo, da `mettiFuoco`), il vapore si apre in un ovale attorno
 * al suo rettangolo (dissolvenza 300 ms) e resta aperto finché il fuoco è lì.
 * Il vapore non torna mai sopra l'elemento in uso.
 *
 * Meccanica: `focusin` sul vetro → `vapore.proteggi(indice, zona, …)`;
 * `focusout` verso fuori dal vetro, o `focusin` su un altro elemento →
 * rilascio. Se l'elemento col fuoco sparisce dal DOM (il trattino che
 * diventa la riga di scrittura, la lista che si riscrive) il rilascio avviene
 * comunque: i browser non mandano sempre `focusout` quando un nodo viene
 * rimosso, quindi un MutationObserver controlla che la zona sia ancora
 * collegata.
 *
 * La **zona** protetta è l'elemento visibile che rappresenta il controllo:
 * - un antenato con `data-ctp-zona-fuoco` (per esempio la riga intera);
 * - altrimenti la `label` che contiene l'input (i radio del servizio sono
 *   input trasparenti sopra la parola a pennarello);
 * - altrimenti l'elemento stesso.
 */

import { vapore, type OpzioniZona } from '../vapore';
import type { IndiceSpecchio } from '../state/store';

/** Opzioni dell'ovale attorno al fuoco (creative-director §6.4). */
export const ZONA_FUOCO: Readonly<OpzioniZona> = {
  forma: 'ovale',
  margine: 16,
  dissolvenza: 300,
};

/** L'elemento visibile da tenere pulito quando `el` ha il fuoco. */
export function zonaDelFuoco(el: HTMLElement): HTMLElement {
  const marcata = el.closest<HTMLElement>('[data-ctp-zona-fuoco]');
  if (marcata !== null) return marcata;
  if (el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox')) {
    const label = el.closest<HTMLElement>('label');
    if (label !== null) return label;
  }
  return el;
}

/**
 * Collega la pulizia da fuoco al vetro dello specchio `indice`.
 * Restituisce la funzione di smontaggio.
 */
export function collegaFuocoPulisce(el: HTMLElement, indice: IndiceSpecchio): () => void {
  let zona: HTMLElement | null = null;
  let rilascia: (() => void) | null = null;

  const libera = (): void => {
    if (rilascia !== null) rilascia();
    rilascia = null;
    zona = null;
  };

  const suFocusIn = (e: FocusEvent): void => {
    const t = e.target;
    if (!(t instanceof HTMLElement) || t === el || !el.contains(t)) {
      libera();
      return;
    }
    const nuova = zonaDelFuoco(t);
    if (nuova === zona) return;
    libera();
    zona = nuova;
    rilascia = vapore.proteggi(indice, nuova, ZONA_FUOCO);
  };

  const suFocusOut = (e: FocusEvent): void => {
    const verso = e.relatedTarget;
    // Il fuoco resta nel vetro: ci pensa il focusin che segue.
    if (verso instanceof Node && el.contains(verso)) return;
    libera();
  };

  const osservatore =
    typeof MutationObserver === 'function'
      ? new MutationObserver(() => {
          if (zona !== null && !zona.isConnected) libera();
        })
      : null;
  osservatore?.observe(el, { childList: true, subtree: true });

  el.addEventListener('focusin', suFocusIn);
  el.addEventListener('focusout', suFocusOut);

  // Montaggio con il fuoco già dentro (ritorno da un altro specchio, ripristino).
  const giaDentro = el.ownerDocument.activeElement;
  if (giaDentro instanceof HTMLElement && giaDentro !== el && el.contains(giaDentro)) {
    zona = zonaDelFuoco(giaDentro);
    rilascia = vapore.proteggi(indice, zona, ZONA_FUOCO);
  }

  return () => {
    el.removeEventListener('focusin', suFocusIn);
    el.removeEventListener('focusout', suFocusOut);
    osservatore?.disconnect();
    libera();
  };
}
