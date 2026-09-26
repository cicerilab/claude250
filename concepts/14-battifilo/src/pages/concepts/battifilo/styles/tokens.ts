/**
 * BATTIFILO · token per il codice TypeScript (art-director).
 *
 * Gli stessi valori di tokens.css, per chi li deve usare in JS: il font da
 * iniettare (core/fonts.ts), le misure che entrano nei conti della linea del
 * tempo e del disegno di Misura, gli hex per gli SVG scritti dal codice.
 * `node scripts/contrasti.mjs` controlla che gli hex qui e in tokens.css
 * coincidano.
 *
 * Nessun accesso al browser: solo costanti e funzioni pure.
 */

/* ------------------------------------------------------------------------ */
/* Colori                                                                    */
/* ------------------------------------------------------------------------ */

/** I sei colori della direzione (creative-director §4.1) e i tre derivati. */
export const COLORI = {
  calcestruzzo: '#B8B4AB',
  calcestruzzoOmbra: '#9F9B92',
  cobalto: '#1C4CB4',
  cobaltoFondo: '#143A8C',
  ferro: '#23272B',
  calce: '#F1F2EE',
  rasatura: '#D2D0C9',
  gessoVecchio: '#627BB0',
} as const;

export type NomeColore = keyof typeof COLORI;

/** Opacità del gesso già visto quando il tratto è dipinto in cobalto (= gessoVecchio composto). */
export const GESSO_VECCHIO_OPACITA = 0.55;

/**
 * Colori per ruolo, per gli SVG disegnati dal codice (filo, finestra,
 * porta, tratti della forbice). Il cobalto piccolo (testo sotto i 24 px)
 * è sempre `cobaltoFondo`.
 */
export const RUOLI = {
  gesso: COLORI.cobalto,
  gessoVecchio: COLORI.gessoVecchio,
  filo: COLORI.ferro,
  porta: COLORI.ferro,
  quotaPorta: COLORI.ferro,
  quotaFinestra: COLORI.cobalto,
  tratteggioVuoto: COLORI.ferro,
  trattoVuoto: COLORI.calcestruzzoOmbra,
  testo: COLORI.ferro,
  testoPiccoloGesso: COLORI.cobaltoFondo,
} as const;

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Un solo foglio di Google Fonts: Big Shoulders Stencil variabile (peso
 * 700-900, dimensione ottica 10-72) e Chivo variabile 400-700.
 * Latin: 60 KB + 33 KB = 93 KB (budget 100).
 */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Big+Shoulders+Stencil:opsz,wght@10..72,700..900&family=Chivo:wght@400..700&display=swap';

export const FONT_PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'] as const;

export const FONT_FAMIGLIE = {
  stencil: 'Big Shoulders Stencil',
  testo: 'Chivo',
} as const;

export const FONT_STACK = {
  stencil: '"Big Shoulders Stencil", "Battifilo Stencil Ripiego Stretto", "Battifilo Stencil Ripiego", "Arial Narrow", sans-serif',
  testo: '"Chivo", "Battifilo Chivo Ripiego", Arial, sans-serif',
} as const;

/**
 * Specifiche per `document.fonts.load()`: le combinazioni che la prima
 * schermata usa davvero. Nessun movimento aspetta i font.
 */
export const FONT_DA_CARICARE = [
  '850 72px "Big Shoulders Stencil"',
  '800 20px "Big Shoulders Stencil"',
  '400 17px "Chivo"',
  '700 16px "Chivo"',
] as const;

/* ------------------------------------------------------------------------ */
/* Scala tipografica (px a 375 e a 1440; i CSS usano clamp in rem)           */
/* ------------------------------------------------------------------------ */

export const TIPO = {
  titolo: { a375: 36, a1440: 72, maxVh: 8 },
  fase: { a375: 36, a1440: 60, maxVh: 6.7 },
  costo: { a375: 36, a1440: 52, maxVh: 5.8 },
  schermata: { a375: 36, a1440: 56 },
  enorme: { a375: 64, a1440: 152 },
  marchio: { a375: 24, a1440: 28 },
  data: { a375: 32, a1440: 48 },
  quota: { a375: 24, a1440: 24 },
  tacca: { a375: 20, a1440: 20 },
  lead: { a375: 17, a1440: 19 },
  mese: { a375: 16, a1440: 19 },
  corpo: { a375: 16, a1440: 17 },
  campo: { a375: 17, a1440: 17 },
  piccolo: { a375: 15, a1440: 15 },
  nota: { a375: 14, a1440: 14 },
} as const;

/** Stencil: mai sotto questa misura (px). */
export const STENCIL_MIN_PX = 20;
/** Cobalto `#1C4CB4` come testo: solo da questa misura in su (px). */
export const COBALTO_TESTO_MIN_PX = 24;

/**
 * Larghezza delle cifre a stencil in em (peso 900, misurata con fontTools):
 * i riquadri di larghezza fissa del costo e del totale.
 */
export const LARGHEZZA_CIFRE_EM = {
  costo: 3.8,
  totale: 4.3,
} as const;

/* ------------------------------------------------------------------------ */
/* Misure usate nei conti (px CSS)                                           */
/* ------------------------------------------------------------------------ */

export const MISURE = {
  /** La cassetta del battifilo. */
  cassettaW: 44,
  cassettaH: 56,
  /** L'unico raggio del sito: la maniglia della cassetta. */
  manigliaRaggio: 6,
  /** Colonna del gancio a sinistra della linea (largo). */
  gancioW: 48,
  /** Passi della linea: 0 PRIMA, 1-14 mesi, 15 CHIAVI. */
  passi: 16,
  /** Passo della linea su telefono (cassetta ferma al centro, la linea scorre). */
  passoStretto: 64,
  /** Filo teso (tratto ferro). */
  filoSpessore: 1.5,
  /** Altezza utile della linea battuta. */
  gessoSpessore: 6,
  gessoSpessorePiccolo: 3,
  /** Striscia del filo nella lastra. */
  filoH: { largo: 112, medio: 104, stretto: 88 },
  /** Fasce. */
  fasciaH: { largo: 56, stretto: 48 },
  fasciaBassaH: 64,
  /** Zone del bottone condiviso del Lab (niente di nostro lì dentro). */
  labZona: { largo: { w: 240, h: 56 }, stretto: { w: 216, h: 64 } },
  /** Il marchio parte da qui (largo / medio). */
  marchioDa: { largo: 260, medio: 240 },
  /** Contenuto della lastra al massimo, poi centrato. */
  lastraMax: 1680,
  /** Foto al massimo, poi centrata con la lastra ai lati. */
  fotoMax: 1920,
  /** Ogni bersaglio di tocco. */
  bersaglio: 44,
  /** Anello di fuoco. */
  fuocoSpessore: 3,
  fuocoDistanza: 3,
} as const;

/**
 * Geometria del palco per formato. Le stesse formule sono nelle variabili
 * `--btf-lastra-h`, `--btf-foto-h-stretto` di tokens.css.
 */
export const PALCO = {
  largo: { lastraMin: 320, lastraVh: 40, lastraMax: 440 },
  medio: { lastraMin: 340, lastraVh: 46, lastraMax: 480 },
  stretto: { fotoSvh: 42, fotoSvhBasso: 38, sogliaBassoPx: 700, fotoEspansaSvh: 20 },
} as const;

/** Misura e manda: quota del piano di tracciamento. */
export const PIANO = {
  largoQuota: 0.55,
  strettoSvh: 38,
  tastieraQuota: 0.3,
  tastieraMinPx: 150,
} as const;

/* ------------------------------------------------------------------------ */
/* Soglie dei formati (em; identiche in core/modo.ts e nei CSS)              */
/* ------------------------------------------------------------------------ */

export const SOGLIE_EM = {
  /** Sotto: bottone del Lab in basso, fascia bassa. */
  stretto: 40,
  /** Da qui: palco largo (linea intera, griglia del filo). */
  largo: 60,
  /** Altezza minima del palco; sotto: modo documento. */
  palcoAltezza: 34,
  /** Larghezza minima del palco; sotto: modo documento. */
  palcoLarghezzaMin: 20,
  /** Da qui la foto smette di crescere (1920 px). */
  moltoLargo: 120,
} as const;

/* ------------------------------------------------------------------------ */
/* Livelli                                                                   */
/* ------------------------------------------------------------------------ */

export const Z = {
  foto: 0,
  lastra: 1,
  filo: 2,
  fascia: 10,
  schermata: 20,
  fasciaBassa: 25,
  /** Il bottone del sito: nessuno lo supera. */
  bottoneLab: 2147483000,
} as const;

/* ------------------------------------------------------------------------ */
/* Texture della lastra (per il photo-editor e per i controlli)              */
/* ------------------------------------------------------------------------ */

/**
 * La texture è una mappa di luminanza in grigio fusa in soft-light sulla
 * tinta: media e limiti del grigio nel file (0-255). Con questi limiti la
 * luminanza della lastra resta tra 0,942 e 1,062 volte quella della tinta.
 */
export const LASTRA_MAPPA = {
  media: 128,
  minimo: 116,
  massimo: 146,
  file: { stretto: 800, largo: 1600 },
  tesseraCss: { stretto: 400, largo: 800 },
} as const;

/* ------------------------------------------------------------------------ */
/* Funzioni pure                                                             */
/* ------------------------------------------------------------------------ */

function canale(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminanza relativa WCAG di un hex `#RRGGBB`. */
export function luminanza(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * canale(r) + 0.7152 * canale(g) + 0.0722 * canale(b);
}

/** Rapporto di contrasto WCAG 2.x tra due hex. */
export function contrasto(a: string, b: string): number {
  const la = luminanza(a);
  const lb = luminanza(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Dimensione fluida in px per una larghezza di finestra (stessa formula dei clamp di tokens.css). */
export function fluido(a375: number, a1440: number, larghezza: number): number {
  const p = (a1440 - a375) / (1440 - 375);
  const v = a375 + p * (larghezza - 375);
  return Math.min(Math.max(v, Math.min(a375, a1440)), Math.max(a375, a1440));
}
