// Foto vere di SOTTOSCOCCA (photo-editor). Solo dati: nessun accesso al DOM.
// Fonti: Wikimedia Commons e Flickr (licenze CC e pubblico dominio), guardate una per una.
// Dettagli, scarti e motivi in docs/photo-editor.md. Il trattamento colore è in CSS (art-director):
// i file sono al naturale.

import type { IdPunto, Quota } from '../../content/lavori'

import depositoL from './deposito-l.webp'
import depositoS from './deposito-s.webp'
import officinaPonteL from './officina-ponte-l.webp'
import officinaPonteS from './officina-ponte-s.webp'
import officinaAttrezzaturaL from './officina-attrezzatura-l.webp'
import officinaAttrezzaturaS from './officina-attrezzatura-s.webp'
import ponte0L from './ponte-0-l.webp'
import ponte0S from './ponte-0-s.webp'
import ponte80L from './ponte-80-l.webp'
import ponte80S from './ponte-80-s.webp'
import ponte180L from './ponte-180-l.webp'
import ponte180S from './ponte-180-s.webp'

/** Un file in una misura: url risolto da Vite e dimensioni vere in px (per width/height e srcset). */
export interface FileFoto {
  readonly src: string
  readonly w: number
  readonly h: number
}

/** Credito da mostrare nel piede: autore, fonte, licenza, link veri. */
export interface CreditoFoto {
  readonly autore: string
  /** Pagina della foto sulla fonte (link del credito). */
  readonly url: string
  readonly fonte: 'Wikimedia Commons' | 'Flickr'
  /** Sigla della licenza come va scritta nel credito. */
  readonly licenza: string
  readonly licenzaUrl: string
  /** true se il file è stato ritagliato o ridimensionato (serve per CC BY-SA: "modificata"). */
  readonly modificata: boolean
}

export interface Foto {
  /** Misura grande: lato lungo fino a 1600 px (meno se l'originale è più piccolo). */
  readonly l: FileFoto
  /** Misura piccola: ~800 px di larghezza. */
  readonly s: FileFoto
  /**
   * Chiave dell'alt in content/testi.ts. Le foto del fallback sono decorative (alt="").
   * 'deposito' → DEPOSITO_TESTI.fotoAlt; 'officina.ponte' / 'officina.attrezzatura' → OFFICINA.fotoAlt.*
   */
  readonly altChiave: 'deposito' | 'officina.ponte' | 'officina.attrezzatura' | null
  /** Punto focale in % (x, y) per object-position: dove sta il soggetto se la finestra taglia. */
  readonly fuoco: readonly [number, number]
  /** Cosa si vede davvero, in una riga (per chi monta la sezione e per la QA). */
  readonly soggetto: string
  readonly credito: CreditoFoto
}

/** Coordinate in % (0-100) di un punto toccabile sulla foto, nel sistema della foto intera. */
export type PuntiFoto = Partial<Record<IdPunto, { readonly x: number; readonly y: number }>>

export interface FotoQuota extends Foto {
  /** Punti posizionabili in modo onesto su questa foto; gli altri restano solo nell'elenco. */
  readonly punti: PuntiFoto
}

const CC_BY_2 = 'https://creativecommons.org/licenses/by/2.0/'
const CC_BY_3 = 'https://creativecommons.org/licenses/by/3.0/'
const CC_BY_SA_2 = 'https://creativecommons.org/licenses/by-sa/2.0/'
const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/'
const PDM = 'https://creativecommons.org/publicdomain/mark/1.0/'

export const FOTO_DEPOSITO: Foto = {
  l: { src: depositoL, w: 1280, h: 853 },
  s: { src: depositoS, w: 720, h: 480 },
  altChiave: 'deposito',
  fuoco: [55, 50],
  soggetto: 'Scaffali di ferro con gomme invernali in fila su tre piani, contro un muro di pietra; qualche cartellino di carta appeso.',
  credito: {
    autore: 'AnnSophieQ',
    url: 'https://www.flickr.com/photos/141281588@N05/50338426143',
    fonte: 'Flickr',
    licenza: 'CC BY-SA 2.0',
    licenzaUrl: CC_BY_SA_2,
    modificata: true,
  },
}

export const FOTO_OFFICINA = {
  ponte: {
    l: { src: officinaPonteL, w: 1600, h: 1083 },
    s: { src: officinaPonteS, w: 800, h: 542 },
    altChiave: 'officina.ponte',
    fuoco: [35, 45],
    soggetto: 'Interno di un gommista: un\'auto col portellone aperto sulle pedane, scaffali di gomme e cerchi, travi di legno e neon.',
    credito: {
      autore: 'Андрей Романенко',
      url: 'https://commons.wikimedia.org/wiki/File:Inside_a_tire_shop_in_Riga.jpg',
      fonte: 'Wikimedia Commons',
      licenza: 'CC BY-SA 4.0',
      licenzaUrl: CC_BY_SA_4,
      modificata: true,
    },
  },
  attrezzatura: {
    l: { src: officinaAttrezzaturaL, w: 1067, h: 1600 },
    s: { src: officinaAttrezzaturaS, w: 533, h: 800 },
    altChiave: 'officina.attrezzatura',
    fuoco: [52, 45],
    soggetto: 'Colonna blu di un ponte sollevatore con quadro elettrico e centralina idraulica; accanto il retro di un\'auto grigia.',
    credito: {
      autore: 'Shixart1985',
      url: 'https://commons.wikimedia.org/wiki/File:Car_lift_in_an_auto_repair_shop_with_vehicles_and_tools_present.jpg',
      fonte: 'Wikimedia Commons',
      licenza: 'CC BY 2.0',
      licenzaUrl: CC_BY_2,
      modificata: true,
    },
  },
} as const satisfies Record<'ponte' | 'attrezzatura', Foto>

/** Foto del fallback senza WebGL: tre quote; la 20 usa quella a terra (tech-architect §7.3). */
const QUOTA_0: FotoQuota = {
  l: { src: ponte0L, w: 1280, h: 960 },
  s: { src: ponte0S, w: 800, h: 600 },
  altChiave: null,
  fuoco: [40, 42],
  soggetto: 'Utilitaria grigia alzata su un ponte a due colonne blu, di lato; officina ordinata con linee gialle a terra.',
  punti: {
    'ruota-anteriore': { x: 64.5, y: 48 },
    'ruota-posteriore': { x: 25.5, y: 50 },
  },
  credito: {
    autore: 'ANT Berezhnyi',
    url: 'https://commons.wikimedia.org/wiki/File:Chery_A1_-_service_shop_in_Ukraine_(7).jpg',
    fonte: 'Wikimedia Commons',
    licenza: 'CC BY 3.0',
    licenzaUrl: CC_BY_3,
    modificata: true,
  },
}

const QUOTA_80: FotoQuota = {
  l: { src: ponte80L, w: 1600, h: 1200 },
  s: { src: ponte80S, w: 800, h: 600 },
  altChiave: null,
  fuoco: [50, 55],
  soggetto: 'Ruota smontata: disco del freno, pinza e mozzo in primo piano; sopra, la molla blu della sospensione e il tampone.',
  punti: {
    freni: { x: 64, y: 84 },
    sospensioni: { x: 55, y: 30 },
  },
  credito: {
    autore: 'jason.odonnell',
    url: 'https://www.flickr.com/photos/70317059@N00/4267833444',
    fonte: 'Flickr',
    licenza: 'CC BY 2.0',
    licenzaUrl: CC_BY_2,
    modificata: true,
  },
}

const QUOTA_180: FotoQuota = {
  l: { src: ponte180L, w: 1227, h: 1000 },
  s: { src: ponte180S, w: 800, h: 652 },
  altChiave: null,
  fuoco: [45, 35],
  soggetto: 'Il sottoscocca visto da sotto: albero di trasmissione, giunto e culla, con due mani in guanti blu al lavoro.',
  // Nessun punto: nella foto non c'è un pezzo di scarico, olio, freni o ruote riconoscibile
  // senza forzare. A 180 cm resta l'elenco della quota.
  punti: {},
  credito: {
    autore: 'City of Greenville NC',
    url: 'https://www.flickr.com/photos/cityofgreenvillenc/50211830327',
    fonte: 'Flickr',
    licenza: 'Pubblico dominio',
    licenzaUrl: PDM,
    modificata: true,
  },
}

export const FOTO_QUOTE: Readonly<Record<Quota, FotoQuota>> = {
  0: QUOTA_0,
  20: QUOTA_0,
  80: QUOTA_80,
  180: QUOTA_180,
}

/** Tutti i crediti, senza doppioni, nell'ordine della pagina (per il piede). */
export const CREDITI_FOTO: readonly CreditoFoto[] = [
  QUOTA_0.credito,
  QUOTA_80.credito,
  QUOTA_180.credito,
  FOTO_DEPOSITO.credito,
  FOTO_OFFICINA.ponte.credito,
  FOTO_OFFICINA.attrezzatura.credito,
]

/** srcset pronto per <img>: "url 800w, url 1600w". */
export function srcsetDi(foto: Foto): string {
  return `${foto.s.src} ${foto.s.w}w, ${foto.l.src} ${foto.l.w}w`
}
