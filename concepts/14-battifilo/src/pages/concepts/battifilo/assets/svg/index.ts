// Asset vettoriali di BATTIFILO (vector-artist). Solo stringhe e dati: nessun accesso al DOM.
// Due famiglie:
// - maschere (polvere-tessera, polvere-bordo): si usano come URL in `mask-image`, bianco su
//   trasparente, senza colore; il colore lo dà il `background` dell'elemento mascherato.
// - segni inline (gancio, schema-misura, icone): markup `?raw` in currentColor, senza id,
//   con aria-hidden: si possono ripetere nella stessa pagina e vanno accanto a un testo
//   che dice già l'azione. Misure e uso in docs/vector-artist.md.

import polvereTesseraUrl from './polvere-tessera.svg?url'
import polvereBordoUrl from './polvere-bordo.svg?url'
import gancio from './gancio.svg?raw'
import schemaMisura from './schema-misura.svg?raw'

import avviso from './icone/avviso.svg?raw'
import telefono from './icone/telefono.svg?raw'
import email from './icone/email.svg?raw'
import mappa from './icone/mappa.svg?raw'
import esterno from './icone/esterno.svg?raw'
import menu from './icone/menu.svg?raw'
import chiudi from './icone/chiudi.svg?raw'
import meno from './icone/meno.svg?raw'
import piu from './icone/piu.svg?raw'
import prima from './icone/prima.svg?raw'
import dopo from './icone/dopo.svg?raw'
import elenco from './icone/elenco.svg?raw'

export { polvereTesseraUrl, polvereBordoUrl, gancio, schemaMisura }

/**
 * Tessera della polvere del battifilo (maschera ripetuta in orizzontale).
 * viewBox 240 × 24: nucleo denso alto circa 6 unità al centro (y 9-15, copertura 80-90%),
 * polvere che si dirada fino a y 6 e y 18; sopra e sotto è vuota (margine per la battuta). Rapporto larghezza/altezza 10: con l'elemento alto 24 px
 * la tessera si ripete ogni 240 px senza cuciture (turbolenza con stitchTiles).
 */
export const TESSERA = {
  url: polvereTesseraUrl,
  larghezza: 240,
  altezza: 24,
  /** altezza consigliata dell'elemento mascherato, in px CSS (nucleo ~6 px) */
  altezzaCss: 24,
  /** misure ammesse dell'elemento (sotto 20 il nucleo scende sotto 5 px) */
  altezzaMinCss: 20,
  altezzaMaxCss: 28,
  /** centro della linea in frazione dell'altezza: l'asse del filo e del gancio */
  asse: 0.5,
} as const

/** Maschera "a spruzzo" per le marcature stencil (lacune minute, circa il 4% della superficie). */
export const SPRUZZO = {
  url: polvereBordoUrl,
  lato: 160,
  /** sotto questa misura del carattere la maschera si toglie: le lacune rovinano la lettura */
  corpoMinPx: 32,
} as const

/**
 * Gancio del filo al punto zero: un chiodo e il cappio del filo intorno.
 * viewBox 24 × 24; il filo esce dal bordo destro in (24, 12), a metà altezza: con il gancio
 * alto 24 px accanto alla linea alta 24 px, filo, gancio e asse della polvere coincidono.
 * Tratto 1,5 come il filo di Filo.tsx.
 */
export const GANCIO = {
  svg: gancio,
  larghezza: 24,
  altezza: 24,
  /** punto in cui il filo lascia il gancio, in unità del viewBox */
  uscitaFilo: [24, 12] as const,
  /** centro del chiodo: il punto zero della scala del tempo */
  chiodo: [6, 12] as const,
} as const

/**
 * Schema "come si misura la luce": la finestra vista da dentro, tre quote orizzontali
 * (alto, centro, basso) e tre verticali (sinistra, centro, destra), da muro a muro.
 * viewBox 88 × 88, pensato a 88 px (1:1). Due gruppi colorabili dal CSS:
 * `.btf-schema-muro` (spalle, architrave, davanzale) e `.btf-schema-quote` (le sei frecce).
 */
export const SCHEMA_MISURA = {
  svg: schemaMisura,
  larghezza: 88,
  altezza: 88,
} as const

export type NomeIcona =
  | 'avviso'
  | 'telefono'
  | 'email'
  | 'mappa'
  | 'esterno'
  | 'menu'
  | 'chiudi'
  | 'meno'
  | 'piu'
  | 'prima'
  | 'dopo'
  | 'elenco'

/** Icone Phosphor Regular 2.1.1 (MIT), viewBox 256, 1em × 1em, currentColor. */
export const ICONE: Readonly<Record<NomeIcona, string>> = {
  avviso,
  telefono,
  email,
  mappa,
  esterno,
  menu,
  chiudi,
  meno,
  piu,
  prima,
  dopo,
  elenco,
}

/** Dove si usa ciascuna icona e a che misura (px CSS). Nessuna icona sta da sola senza testo. */
export const USO_ICONE: Readonly<Record<NomeIcona, { dove: string; px: number }>> = {
  avviso: { dove: 'errori sotto i campi di Misura e manda, invio fallito', px: 18 },
  telefono: { dove: 'link "Chiama" nel cartello e nel messaggio di invio fallito', px: 20 },
  email: { dove: 'link "Scrivi" nel cartello', px: 20 },
  mappa: { dove: 'riga della sede nel cartello', px: 20 },
  esterno: { dove: 'dopo "Apri in Maps" e il link a Ciceri Lab', px: 16 },
  menu: { dove: 'bottone "Menu" della fascia alta sotto i 720 px', px: 20 },
  chiudi: { dove: '"Chiudi" del menu e delle viste a tutto schermo', px: 20 },
  meno: { dove: '"Quante uguali": bottone meno (44 × 44)', px: 20 },
  piu: { dove: '"Quante uguali": bottone più (44 × 44)', px: 20 },
  prima: { dove: '"Mese prima" ai lati del nastro su mobile', px: 20 },
  dopo: { dove: '"Mese dopo" ai lati del nastro su mobile', px: 20 },
  elenco: { dove: 'link "Leggi tutti i mesi" (vista elenco, <ol>)', px: 18 },
}

/** Licenza delle icone, da tenere nel repo del sito accanto ai file. */
export const LICENZA_ICONE = 'Phosphor Icons 2.1.1, licenza MIT, Copyright (c) 2023 Phosphor Icons'
