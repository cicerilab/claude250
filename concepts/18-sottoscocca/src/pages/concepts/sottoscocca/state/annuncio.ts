/**
 * SOTTOSCOCCA · la regione `aria-live="polite"` della pagina.
 *
 * Una sola regione, in fondo a Radice.tsx (`.ssc-sr`). La usa ponte/quota.ts
 * per gli annunci di plateau (`QUOTE[q].annuncio`, mai i centimetri
 * intermedi) e la possono usare le sezioni per annunci brevi
 * (`ANNUNCI.aggiunto`, `ANNUNCI.sostituito`, `ANNUNCI.tolto`). Il planning ha
 * le sue regioni (stati P/D/F).
 *
 * Lo stesso testo ripetuto viene riletto (si alterna uno spazio
 * indivisibile finale, come `rendiNuovo` di interaction/util.ts).
 * Nessun accesso al browser a livello di modulo.
 */

import { rendiNuovo } from '../interaction/util';

let regione: HTMLElement | null = null;
let ultimo = '';

/** Solo Radice.tsx: collega l'elemento della regione. Restituisce lo scollegamento. */
export function collegaAnnuncio(el: HTMLElement | null): () => void {
  regione = el;
  ultimo = '';
  return () => {
    if (regione === el) regione = null;
  };
}

/** Annuncia un testo (già scritto dal copywriter). Senza regione collegata non fa niente. */
export function annuncia(testo: string): void {
  if (regione === null) return;
  const nuovo = rendiNuovo(testo, ultimo);
  ultimo = nuovo;
  regione.textContent = nuovo;
}
