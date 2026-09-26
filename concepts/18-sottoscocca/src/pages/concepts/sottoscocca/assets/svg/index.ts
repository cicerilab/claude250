// Asset vettoriali di SOTTOSCOCCA (vector-artist). Solo stringhe: nessun accesso al DOM.
// Icone di servizio in currentColor, spigolo vivo, aria-hidden: il testo accanto resta l'etichetta.
// Dettagli e uso in docs/vector-artist.md.

import frecciaEsterna from './freccia-esterna.svg?raw'
import chiudi from './chiudi.svg?raw'
import indice from './indice.svg?raw'

export { frecciaEsterna, chiudi, indice }

/** Nome dell'icona di servizio. */
export type NomeIcona = 'freccia-esterna' | 'chiudi' | 'indice'

/** Markup SVG completo per nome, da inserire inline in uno span aria-hidden largo 1em. */
export const ICONE: Readonly<Record<NomeIcona, string>> = {
  'freccia-esterna': frecciaEsterna,
  chiudi,
  indice,
}
