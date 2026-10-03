// Asset vettoriali di NODI (vector-artist). Solo stringhe e dati: nessun accesso al DOM,
// nessun window/document a livello di modulo (il sito fa prerender).
// Dettagli, misure, fonti e uso in docs/vector-artist.md.
//
// tavola.svg è l'unico disegno del sito: la tavola armonica di un violino 4/4 vista
// dall'alto, riccio in alto, coordinate in MILLIMETRI. La tavola occupa
// x 0..208, y 0..356; il viewBox (-16 -16 240 388) è il riquadro con il margine
// dell'ombra (16 mm per lato), così SVG, poster, fermi e canvas combaciano.
// Lato dei bassi = sinistra di chi guarda (corda di Sol), lato degli acuti = destra.
//
// Le icone usano currentColor, non hanno id e sono aria-hidden: si inseriscono inline
// accanto a un testo che dice già l'azione, anche più volte nella stessa pagina.

import tavolaSvg from './tavola.svg?raw'
import altoparlante from './altoparlante.svg?raw'
import uscita from './uscita.svg?raw'

export { tavolaSvg, altoparlante, uscita }

/** Legge l'attributo d di un tracciato per id dalla stringa SVG (regex, niente DOMParser). */
function tracciato(svg: string, id: string): string {
  const tag = svg.match(new RegExp(`<path[^>]*\\sid="${id}"[^>]*>`))
  const d = tag?.[0].match(/\sd="([^"]+)"/)?.[1]
  if (!d) throw new Error(`assets/svg: tracciato #${id} mancante in tavola.svg`)
  return d
}

/** Margine dell'ombra attorno alla tavola, in mm (per lato). */
export const MARGINE_OMBRA_MM = 16

/**
 * Riquadro della tavola in mm (tavola + ombra): dà l'aspect-ratio del palco.
 * Export leggero: per il layout basta questo, senza portarsi dietro i tracciati.
 */
export const RIQUADRO = { w: 240, h: 388 } as const

/** Rapporto larghezza / altezza del riquadro (240 / 388 ≈ 0,6186). */
export const RAPPORTO_RIQUADRO = RIQUADRO.w / RIQUADRO.h

/**
 * Misure della tavola di esempio in mm, nelle coordinate di tavola.svg
 * (x 0..208 da sinistra, y 0..356 dal riccio). Utili a GL, script dei modi e testi.
 */
export const MISURE_TAVOLA = {
  /** lunghezza della cassa, bordo a bordo */
  lunghezza: 356,
  /** larghezza alle spalle alte, nel punto più largo (y 62) */
  spalleAlte: { larghezza: 168, y: 62 },
  /** larghezza alle C, nel punto più stretto (y 151) */
  vita: { larghezza: 110, y: 151 },
  /** larghezza alle spalle basse, nel punto più largo (y 272) */
  spalleBasse: { larghezza: 208, y: 272 },
  /** punte degli angoli: alti e bassi (y del punto più esterno) */
  angoliAlti: { y: 121, xSemi: 81.8 },
  angoliBassi: { y: 205, xSemi: 93.7 },
  /** tacche delle effe (dove va il ponticello): circa 195 mm dal bordo alto */
  tacche: { y: 196 },
  /** occhi delle effe: centro e raggio; x assolute nel lato dei bassi e degli acuti */
  occhioAlto: { y: 159.4, r: 3.2, xBassi: 78.1, xAcuti: 129.9 },
  occhioBasso: { y: 212.6, r: 4.1, xBassi: 44.4, xAcuti: 163.6 },
  /** ingombro verticale delle effe */
  effe: { yDa: 151.9, yA: 220.7 },
  /** filetto: linea mediana a 4 mm dal bordo */
  filettoDalBordo: 4,
} as const

export interface Tavola {
  /** viewBox di tavola.svg: il riquadro con l'ombra, in mm */
  viewBox: string
  /** stesso viewBox come numeri: [x, y, larghezza, altezza] */
  viewBoxNumeri: readonly [number, number, number, number]
  /** ingombro della sola tavola in mm */
  mm: { readonly w: number; readonly h: number }
  /** riquadro (tavola + ombra) in mm */
  riquadro: { readonly w: number; readonly h: number }
  /** origine della tavola dentro il riquadro, in mm dal suo angolo in alto a sinistra */
  origine: { readonly x: number; readonly y: number }
  /** contorno chiuso della tavola (attributo d, comandi M m C c l v Z z, niente archi) */
  contorno: string
  /** effe del lato dei bassi (sinistra), tracciato chiuso */
  effeBassi: string
  /** effe del lato degli acuti (destra), tracciato chiuso */
  effeAcuti: string
  /** filetto (linea mediana a 4 mm dal bordo), tracciato chiuso, facoltativo per lo shader */
  filetto: string
}

/**
 * La tavola: tracciati come stringhe (per Path2D, per lo shader della maschera e per gli
 * script offline) e misure del riquadro. Coordinate di tutti i tracciati: mm, origine
 * nell'angolo in alto a sinistra del rettangolo della tavola.
 */
export const TAVOLA: Tavola = {
  viewBox: '-16 -16 240 388',
  viewBoxNumeri: [-MARGINE_OMBRA_MM, -MARGINE_OMBRA_MM, RIQUADRO.w, RIQUADRO.h],
  mm: { w: 208, h: 356 },
  riquadro: RIQUADRO,
  origine: { x: MARGINE_OMBRA_MM, y: MARGINE_OMBRA_MM },
  contorno: tracciato(tavolaSvg, 'nod-contorno'),
  effeBassi: tracciato(tavolaSvg, 'nod-effe-bassi'),
  effeAcuti: tracciato(tavolaSvg, 'nod-effe-acuti'),
  filetto: tracciato(tavolaSvg, 'nod-filetto'),
}

export type NomeIcona = 'altoparlante' | 'uscita'

/** Icone di servizio per nome, per un eventuale componente <Icona nome="..." />. */
export const ICONE: Readonly<Record<NomeIcona, string>> = {
  altoparlante,
  uscita,
}

/** Dove si usa ciascuna icona e a che misura (px CSS); il testo accanto resta l'etichetta. */
export const USO_ICONE: Readonly<Record<NomeIcona, { dove: string; px: number }>> = {
  altoparlante: { dove: 'bottone "Senti la voce" del piano del suono (sezione Voce)', px: 20 },
  uscita: { dove: 'link esterni: "Apri in Maps" (Bottega), CiceriLab e crediti delle foto (Piede)', px: 16 },
}
