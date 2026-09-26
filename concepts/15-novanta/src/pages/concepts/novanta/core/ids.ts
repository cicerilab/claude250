/**
 * NOVANTA · id stabili del DOM. Li usano hash, link di salto, `nav` del
 * quadrante (`aria-controls`), focus e test: non vanno cambiati.
 */

import type { Angolo } from '../dial/geometria';

/** `<main>`. */
export const ID_CONTENUTO = 'contenuto';

/** `<ol>` dei sette angoli (bersaglio di `aria-controls` del braccio). */
export const ID_ANGOLI = 'nov-angoli';

/** `<section>` dell'angolo: `gradi-90`. È anche il frammento dell'URL. */
export function idAngolo(a: Angolo): string {
  return `gradi-${a}`;
}

/** `h2` dell'angolo: `gradi-90-titolo` (focus dopo un salto, `aria-labelledby`). */
export function idTitolo(a: Angolo): string {
  return `gradi-${a}-titolo`;
}
