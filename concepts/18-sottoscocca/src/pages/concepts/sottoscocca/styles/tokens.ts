/**
 * SOTTOSCOCCA · design tokens per TypeScript e WebGL (art-director)
 *
 * Specchio numerico di `tokens.css`: stessi colori, stesse misure. Se cambi un
 * valore qui, cambialo anche là (e viceversa). La tabella dei contrasti in
 * `docs/art-director.md` è calcolata su questi hex con lo script in appendice.
 *
 * File puro: nessun import, nessun accesso a window/document a livello di
 * modulo (il sito fa prerender). Le funzioni sotto sono matematica pura.
 *
 * Colori in tre forme:
 * - `hex`  "#RRGGBB", per CSS e per il canvas 2D (targhetta, linee a terra);
 * - `srgb` vec3 0..1 non linearizzato (per `Color.setRGB(r, g, b, SRGBColorSpace)`
 *          o per confronti al byte con il fondo CSS);
 * - `lin`  vec3 lineare (IEC 61966-2-1), per chi scrive colori direttamente in
 *          uniform o attributi quando il renderer lavora in spazio lineare.
 * Con three 0.160 la strada più semplice è `new Color(PALETTE.verde.hex)`:
 * `Color` converte da sRGB a lineare da solo (ColorManagement attivo).
 */

/* ------------------------------------------------------------------------ */
/* Tipi                                                                      */
/* ------------------------------------------------------------------------ */

export type Vec3 = readonly [number, number, number];

export const COLORI_IDS = [
  'nero',
  'neroAlto',
  'verde',
  'verdeOmbra',
  'bianco',
  'biancoPremuto',
  'zincato',
  'gesso',
] as const;
export type IdColore = (typeof COLORI_IDS)[number];

export interface TokenColore {
  readonly hex: string;
  readonly srgb: Vec3;
  readonly lin: Vec3;
  /** Variabile CSS corrispondente in tokens.css. */
  readonly css: string;
  /** A cosa serve (riassunto di DESIGN.md §2). */
  readonly ruolo: string;
}

/* ------------------------------------------------------------------------ */
/* Palette                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Cinque colori della direzione più tre derivati.
 * Nessun colore d'accento in più: l'accento è il bianco segnaletica, e il
 * bianco pieno come superficie significa sempre "il tuo" (il tuo blocco, il
 * tuo lavoro, il punto che hai toccato, la quota dove sei) o l'azione
 * principale.
 */
export const PALETTE: Readonly<Record<IdColore, TokenColore>> = {
  nero: {
    hex: '#1C1D1B',
    srgb: [0.1098, 0.11373, 0.10588],
    lin: [0.01161, 0.01229, 0.01096],
    css: '--ssc-nero',
    ruolo: 'Nero grasso: fondo pagina, pavimento, clear color del GL, blocchi occupati, testo sui bianchi',
  },
  neroAlto: {
    hex: '#2A2C29',
    srgb: [0.16471, 0.17255, 0.16078],
    lin: [0.02315, 0.02519, 0.02217],
    css: '--ssc-nero-alto',
    ruolo: 'Nero di una superficie sollevata dal pavimento: hover su nero, fascia "passato" del planning',
  },
  verde: {
    hex: '#5E7564',
    srgb: [0.36863, 0.45882, 0.39216],
    lin: [0.11193, 0.17789, 0.12744],
    css: '--ssc-verde',
    ruolo: 'Verde macchina utensile: ponte, carrozzeria, pezzi nella scena; nel DOM solo testo grande su nero e il centro dei punti',
  },
  verdeOmbra: {
    hex: '#44584A',
    srgb: [0.26667, 0.3451, 0.2902],
    lin: [0.05781, 0.09759, 0.06848],
    css: '--ssc-verde-ombra',
    ruolo: 'Verde in ombra: pannelli con testo (quote, scheda, barra, corsie del planning)',
  },
  bianco: {
    hex: '#F0EFE9',
    srgb: [0.94118, 0.93725, 0.91373],
    lin: [0.87137, 0.86316, 0.81485],
    css: '--ssc-bianco',
    ruolo: 'Bianco segnaletica: testo, linee a terra, asta, il tuo blocco, bottone principale, punti attivi',
  },
  biancoPremuto: {
    hex: '#D9DBD3',
    srgb: [0.85098, 0.85882, 0.82745],
    lin: [0.69387, 0.70838, 0.65141],
    css: '--ssc-bianco-premuto',
    ruolo: 'Bianco di una superficie bianca premuta o sotto il puntatore (bottone principale, blocco)',
  },
  zincato: {
    hex: '#A3AAA4',
    srgb: [0.63922, 0.66667, 0.64314],
    lin: [0.36625, 0.40198, 0.37124],
    css: '--ssc-zincato',
    ruolo: 'Zincato: tacche minori, testo secondario solo su nero, bordi dei campi, cerchi e metallo nella scena',
  },
  gesso: {
    hex: '#CDD2CB',
    srgb: [0.80392, 0.82353, 0.79608],
    lin: [0.6105, 0.64448, 0.5972],
    css: '--ssc-gesso',
    ruolo: 'Gesso della lavagna: testo secondario sui pannelli verde ombra (aiuti sotto i campi, "da", note)',
  },
};

/** Opacità fisse usate nel sistema (stesse di tokens.css). */
export const OPACITA = {
  /** Vetri dell'auto (nero grasso). */
  vetri: 0.7,
  /** Cerchio della ruota anteriore a 80 cm, per vedere disco e pinza. */
  cerchioAperto: 0.35,
  /** Canvas sotto il planning. */
  scenaSottoPlanning: 0.2,
  /** Corsie del planning non adatte al lavoro mentre trascini. */
  corsiaNonAdatta: 0.4,
  /** Fondo dell'asta e delle etichette dei punti sopra la scena. */
  veloTarghetta: 0.9,
  /** Velo dell'apertura, nel punto più scuro (in basso a sinistra). */
  veloApertura: 0.88,
  /** Stato disabilitato (sempre con una frase che dice perché). */
  disabilitato: 0.45,
} as const;

/* ------------------------------------------------------------------------ */
/* Colori della scena (per webgl-artist e shader-engineer)                   */
/* ------------------------------------------------------------------------ */

/**
 * Ruolo → colore della palette. Materiali piatti e opachi, nessun colore della
 * texture Kenney. Il clear color del renderer è `nero` con alpha 1 e deve
 * coincidere al byte con il fondo di `.ssc-root` (niente cornice visibile
 * attorno al canvas). La nebbia, se c'è, va verso `nero`.
 */
export const SCENA: Readonly<Record<string, IdColore>> = {
  clear: 'nero',
  nebbia: 'nero',
  pavimento: 'nero',
  lineeATerra: 'bianco',
  colonne: 'verde',
  carrelli: 'verde',
  bracci: 'verde',
  tamponi: 'nero',
  targhettaFondo: 'zincato',
  targhettaTesto: 'nero',
  carrozzeria: 'verde',
  vetri: 'nero',
  fanali: 'zincato',
  gomme: 'nero',
  cerchi: 'zincato',
  pezzi: 'verde',
  pezziMetallo: 'zincato',
  evidenza: 'bianco',
  neon: 'bianco',
};

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Un file per famiglia (latin 19 KB Tektur + 30 KB Red Hat Text, misurati il
 * 26/09/2026): Google serve lo stesso woff2 variabile qualunque intervallo si
 * chieda, quindi si chiede la gamma intera che usiamo.
 */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Tektur:wdth,wght@75..100,400..900&family=Red+Hat+Text:wght@400..700&display=swap';

export const FONT_PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'] as const;

/** Descrittori per `fontsReady()` (core/fonts.ts). Il GL aspetta il primo. */
export const FONT_DA_CARICARE = ['600 48px Tektur', '400 17px "Red Hat Text"', '700 17px "Red Hat Text"'] as const;

/** Pile complete, uguali a `--ssc-font-tecnico` e `--ssc-font-testo`. */
export const FAMIGLIA_TECNICA = "Tektur, 'Ssc Tektur Ripiego', 'Arial Narrow', Arial, sans-serif";
export const FAMIGLIA_TESTO = "'Red Hat Text', 'Ssc Red Hat Ripiego', Arial, sans-serif";

/**
 * Stringa `ctx.font` per la targhetta "PORTATA 3500 kg" disegnata su canvas 2D.
 * `ctx.fontStretch` accetta solo parole chiave: "normal" (100) o
 * "semi-condensed" (87,5) / "condensed" (75). La targhetta usa 100.
 */
export function fontTarghetta(pxAltezza: number): string {
  return `600 ${Math.round(pxAltezza)}px Tektur, Arial, sans-serif`;
}

/**
 * Metriche misurate (fontTools su Tektur v6 e Red Hat Text v19; larghezze
 * misurate in Chromium con i woff2 veri e `tabular-nums`), in em.
 */
export const METRICHE = {
  tektur: { upm: 1000, ascent: 1.0, descent: 0.3, capHeight: 0.7, xHeight: 0.56 },
  redHat: { upm: 1000, ascent: 1.018, descent: 0.305, capHeight: 0.7, xHeight: 0.488 },
  /** Larghezze di stringhe chiave (em), per calcolare corpi che riempiono una misura. */
  larghezze: {
    marchio_w100_700: 6.8, // "SOTTOSCOCCA" maiuscolo, wdth 100, wght 700
    cifre3_w80_600: 1.53, // "180" tabellare, wdth 80, wght 600 (0,51 em a cifra)
    cifre2_w80_600: 1.02, // "20"
    unita_w100_500: 1.72, // " cm" wdth 100 wght 500
    deposito_w80_700: 2.34, // "D-214" wdth 80 wght 700
    trovaUnBuco_w100_600: 6.96, // "Trova un buco"
  },
} as const;

/* ------------------------------------------------------------------------ */
/* Scala tipografica fluida (375 → 1440)                                     */
/* ------------------------------------------------------------------------ */

export type Famiglia = 'tecnica' | 'testo';

export interface VoceTipo {
  readonly famiglia: Famiglia;
  /** Corpo a 375 px e a 1440 px (px CSS). Tra i due lineare, fuori fermo (clamp). */
  readonly min: number;
  readonly max: number;
  /** Asse wdth (solo Tektur), in %: si scrive con `font-stretch`. */
  readonly wdth?: number;
  readonly wght: number;
  readonly interlinea: number;
  /** Tracking in em. */
  readonly tracking: number;
  /** Numeri tabellari. */
  readonly tabellare?: boolean;
  readonly css: string;
}

export const TIPO = {
  marchio: { famiglia: 'tecnica', min: 45, max: 92, wdth: 100, wght: 700, interlinea: 0.92, tracking: 0, css: '--ssc-t-marchio' },
  quota: { famiglia: 'tecnica', min: 96, max: 192, wdth: 80, wght: 600, interlinea: 0.84, tracking: -0.01, tabellare: true, css: '--ssc-t-quota' },
  cartellino: { famiglia: 'tecnica', min: 64, max: 120, wdth: 80, wght: 700, interlinea: 0.9, tracking: 0, tabellare: true, css: '--ssc-t-cartellino' },
  giorno: { famiglia: 'tecnica', min: 32, max: 40, wdth: 85, wght: 600, interlinea: 1, tracking: 0, tabellare: true, css: '--ssc-t-giorno' },
  titolo2: { famiglia: 'tecnica', min: 30, max: 48, wdth: 100, wght: 600, interlinea: 1.02, tracking: -0.01, css: '--ssc-t-titolo2' },
  titolo3: { famiglia: 'tecnica', min: 22, max: 28, wdth: 100, wght: 600, interlinea: 1.1, tracking: 0, css: '--ssc-t-titolo3' },
  prezzo: { famiglia: 'tecnica', min: 24, max: 32, wdth: 85, wght: 600, interlinea: 1, tracking: 0, tabellare: true, css: '--ssc-t-prezzo' },
  targhetta: { famiglia: 'tecnica', min: 20, max: 20, wdth: 90, wght: 500, interlinea: 1.15, tracking: 0, tabellare: true, css: '--ssc-t-targhetta' },
  bottone: { famiglia: 'tecnica', min: 20, max: 20, wdth: 100, wght: 600, interlinea: 1, tracking: 0, css: '--ssc-t-bottone' },
  numerale: { famiglia: 'tecnica', min: 15, max: 15, wdth: 100, wght: 500, interlinea: 1, tracking: 0, tabellare: true, css: '--ssc-t-numerale' },
  lead: { famiglia: 'testo', min: 18, max: 21, wght: 400, interlinea: 1.45, tracking: 0, css: '--ssc-t-lead' },
  corpo: { famiglia: 'testo', min: 17, max: 18, wght: 400, interlinea: 1.55, tracking: 0, css: '--ssc-t-corpo' },
  piccolo: { famiglia: 'testo', min: 15, max: 16, wght: 400, interlinea: 1.5, tracking: 0.003, css: '--ssc-t-piccolo' },
  nota: { famiglia: 'testo', min: 14, max: 14, wght: 500, interlinea: 1.4, tracking: 0.005, css: '--ssc-t-nota' },
  etichetta: { famiglia: 'testo', min: 15, max: 16, wght: 700, interlinea: 1.25, tracking: 0, css: '--ssc-t-etichetta' },
  bottoneTesto: { famiglia: 'testo', min: 16, max: 17, wght: 700, interlinea: 1.2, tracking: 0, css: '--ssc-t-bottone-testo' },
  campo: { famiglia: 'testo', min: 17, max: 17, wght: 400, interlinea: 1.3, tracking: 0, css: '--ssc-t-campo' },
} as const satisfies Record<string, VoceTipo>;

export type IdTipo = keyof typeof TIPO;

/** Tektur mai sotto 20 px per parole; 15 px solo per numerali (asta, ore). */
export const TEKTUR_MIN_PAROLE_PX = 20;
export const TEKTUR_MIN_NUMERALI_PX = 15;

/** Giustezza massima del corpo in caratteri. */
export const GIUSTEZZA_CH = 60;

/**
 * Espressione `clamp()` in rem per un corpo fluido tra 375 e 1440 px
 * (stessa formula usata in tokens.css). Base 16 px.
 */
export function fluido(minPx: number, maxPx: number, da = 375, a = 1440): string {
  if (minPx === maxPx) return `${+(minPx / 16).toFixed(4)}rem`;
  const pendenza = (maxPx - minPx) / (a - da);
  const intercetta = minPx - pendenza * da;
  const vw = +(pendenza * 100).toFixed(4);
  const rem = +(intercetta / 16).toFixed(4);
  return `clamp(${+(minPx / 16).toFixed(4)}rem, ${rem}rem + ${vw}vw, ${+(maxPx / 16).toFixed(4)}rem)`;
}

/** Corpo della voce `id` a una larghezza di finestra (px): lineare tra 375 e 1440, fermo fuori. */
export function corpoA(id: IdTipo, larghezza: number): number {
  const v: VoceTipo = TIPO[id];
  const t = Math.min(1, Math.max(0, (larghezza - 375) / (1440 - 375)));
  return v.min + (v.max - v.min) * t;
}

/**
 * Corpo del marchio "SOTTOSCOCCA" perché riempia `misura` px senza andare a capo
 * (stessa regola di `--ssc-t-marchio`: il minimo tra il fluido e la misura).
 */
export function corpoMarchio(misura: number, larghezza: number): number {
  return Math.min(corpoA('marchio', larghezza), misura / (METRICHE.larghezze.marchio_w100_700 * 1.02));
}

/* ------------------------------------------------------------------------ */
/* Spazi, griglia, livelli                                                   */
/* ------------------------------------------------------------------------ */

/** Scala a multipli di 4 (px): `--ssc-sp-1` … `--ssc-sp-10`. */
export const SPAZI = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

/** Punti di rottura (px CSS, larghezza della finestra). */
export const PUNTI_ROTTURA = {
  /** Sotto: bottone di ritorno in basso a sinistra, layout "telefono". */
  bottoneRitorno: 640,
  /** Da qui: testata con Deposito e Officina, asta da 40 px. */
  tablet: 768,
  /** Da qui: planning orizzontale. */
  planningOrizzontale: 900,
  /** Da qui: banco (colonna testo) + postazione (scena), asta da 48 px. */
  desktop: 1024,
  /** Oltre: la griglia smette di crescere, la scena no. */
  largo: 1680,
  /** Altezza sotto cui vale la modalità "bassa" (zoom, telefono coricato). */
  altezzaBassa: 520,
} as const;

/**
 * "La pianta della postazione": tre zone per riga, come sul pavimento
 * dell'officina. Il banco (dove si legge), la postazione (dove sta l'auto,
 * vuota di DOM tranne i punti), la corsia dell'asta (fuori griglia, fissa).
 */
export const GRIGLIA = {
  telefono: { colonne: 4, canalino: 16, margine: 16, corsiaAsta: 48, asta: 32 },
  tablet: { colonne: 8, canalino: 20, margine: 32, corsiaAsta: 64, asta: 40 },
  desktop: { colonne: 12, canalino: 24, margine: 64, corsiaAsta: 96, asta: 48 },
  /** Colonne del banco su desktop (c1-c5) e sua larghezza massima (px). */
  bancoColonne: 5,
  bancoMax: 576,
  /** Tablet: il banco è il 52% della finestra (ux §2.5). */
  bancoTabletPercento: 52,
  /** Colonne del marchio nell'apertura su desktop (c1-c6). */
  marchioColonne: 6,
  /** Telefono, planning verticale: scala delle ore + tre corsie (ux §5.6). */
  planningTelefono: { scala: 44, corsia: 96 },
} as const;

/** Livelli (z-index), unici ammessi. Il ConceptBackButton sta sopra a tutti. */
export const LIVELLI = {
  scena: 0,
  contenuto: 1,
  punti: 2,
  asta: 5,
  pannelliFissi: 6,
  testata: 10,
} as const;

/** Misure dei segni (px). */
export const SEGNI = {
  /** Linea a terra sotto la cifra della quota: telefono / da 768. */
  lineaTerra: { telefono: 4, largo: 6 },
  /** Tratteggio dei buchi liberi: tratto, vuoto, spessore. */
  tratteggio: { tratto: 10, vuoto: 6, spessore: 2 },
  /** Punto toccabile: area di tocco, cerchio visibile, anello bianco, alone nero. */
  punto: { area: 44, cerchio: 26, anello: 2, alone: 2 },
  /** Fuoco: anello bianco, distanza (riempita di nero grasso). */
  fuoco: { spessore: 2, distanza: 3 },
  /** Tacche dell'asta: maggiore (ogni 50 cm), media (10 cm). */
  tacche: { maggiore: 16, minore: 8, spessore: 2 },
  /** Distanza minima fra due punti (centro-centro). */
  distanzaPunti: 56,
} as const;

/* ------------------------------------------------------------------------ */
/* Utilità pure                                                              */
/* ------------------------------------------------------------------------ */

/** "#RRGGBB" → "r g b" per `rgb(var(--x-rgb) / a)`. */
export function hexATripla(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Colore con alpha per canvas 2D: rgba(r, g, b, a). */
export function rgba(id: IdColore, alpha: number): string {
  const [r, g, b] = hexATripla(PALETTE[id].hex).split(' ');
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function canaleLineare(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminanza relativa WCAG 2.x di un hex. */
export function luminanza(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = canaleLineare(((n >> 16) & 255) / 255);
  const g = canaleLineare(((n >> 8) & 255) / 255);
  const b = canaleLineare((n & 255) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapporto di contrasto WCAG 2.x tra due hex. */
export function contrasto(a: string, b: string): number {
  const la = luminanza(a);
  const lb = luminanza(b);
  const [chiaro, scuro] = la > lb ? [la, lb] : [lb, la];
  return (chiaro + 0.05) / (scuro + 0.05);
}
