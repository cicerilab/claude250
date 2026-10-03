// Asset vettoriali di MADRE (vector-artist). Solo stringhe e numeri: nessun accesso
// a window o document, quindi sicuro per il prerender del sito.
// Tutti gli SVG usano currentColor: il colore lo decide il CSS di chi li inserisce.
// Nessun SVG contiene id: si possono inserire inline quante volte serve.
// Misure, regole d'uso e accessibilità in docs/vector-artist.md.

import marchioMadre from './marchio-madre.svg?raw'
import frecciaEsterna from './freccia-esterna.svg?raw'
import frecciaGiu from './freccia-giu.svg?raw'
import chevronGiu from './chevron-giu.svg?raw'
import meno from './meno.svg?raw'
import piu from './piu.svg?raw'
import chiudi from './chiudi.svg?raw'
import spunta from './spunta.svg?raw'
import avviso from './avviso.svg?raw'
import maniglia from './maniglia.svg?raw'

/**
 * Marchio: la parola "madre" in minuscolo, un solo path pieno (currentColor),
 * role="img" e aria-label="MADRE" già dentro l'SVG.
 * Le lettere poggiano sul fondo del viewBox: la base del marchio è la linea di base.
 */
export { marchioMadre }

/** viewBox del marchio: `0 0 512 142` (unità del disegno). */
export const MARCHIO_LARGHEZZA = 512
export const MARCHIO_ALTEZZA = 142

/** Larghezza = altezza × MARCHIO_RAPPORTO (3,61). */
export const MARCHIO_RAPPORTO = MARCHIO_LARGHEZZA / MARCHIO_ALTEZZA

/**
 * Altezza della x (aste di m, a, r) come frazione dell'altezza del marchio: 100/142.
 * Le cupole sporgono di 3 unità sopra (103/142). Serve per allineare il marchio a un testo.
 */
export const MARCHIO_ALTEZZA_X = 100 / MARCHIO_ALTEZZA

/** Altezze consigliate del marchio in px (cima della d → base). Sotto 18 px non va usato. */
export const MARCHIO_ALTEZZA_CONSIGLIATA = { testataDesktop: 26, testataMobile: 22, piede: 40, minima: 18 } as const

export type NomeIcona =
  | 'freccia-esterna'
  | 'freccia-giu'
  | 'chevron-giu'
  | 'meno'
  | 'piu'
  | 'chiudi'
  | 'spunta'
  | 'avviso'
  | 'maniglia'

/**
 * Icone di servizio: griglia 24, tratto 2, capi e giunti tondi, `width`/`height` = 1em
 * (prendono la misura del testo accanto), `aria-hidden="true"` e `focusable="false"` già dentro.
 * Sono sempre decorative: il nome dell'azione lo dà il testo visibile o l'aria-label del bottone.
 */
export const ICONE: Readonly<Record<NomeIcona, string>> = {
  'freccia-esterna': frecciaEsterna,
  'freccia-giu': frecciaGiu,
  'chevron-giu': chevronGiu,
  meno,
  piu,
  chiudi,
  spunta,
  avviso,
  maniglia,
}
