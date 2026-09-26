/**
 * EVIDENZIA · design tokens in TypeScript (art-director, ondata 2).
 *
 * Specchio numerico di `tokens.css` per chi deve CALCOLARE (impaginato,
 * minipagina, scala della Pagina intera, precarico dei font, test dei
 * contrasti). Lo STILE passa sempre dal CSS: nessun componente scrive un
 * colore da qui (i marcatori Leaflet e il percorso si stilano con classi).
 * Nessun accesso a window/document: solo costanti e funzioni pure.
 */

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Libre Franklin variabile 400-900 + Newsreader 400 con asse opsz 6-72 +
 * Newsreader corsivo 400 a opsz fisso 18 (solo citazioni a 18 px).
 * Verificato il 26/09/2026: risposta 200, file latin 29,3 + 57,3 + 22,9 KB
 * = 109 KB (l'URL con peso 400..700 portava Newsreader a 132 KB e il corsivo
 * con opsz a 63 KB: 224 KB, oltre il budget di 200 KB).
 * Newsreader NON ha il grassetto caricato: tutto ciò che è grassetto è Franklin.
 */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400..900&family=Newsreader:ital,opsz,wght@0,6..72,400;1,18,400&display=swap';

export const FONT_PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'] as const;

export const FONT_FAMIGLIE = {
  titoli: 'Libre Franklin',
  testo: 'Newsreader',
} as const;

/** Uguali a --evd-font-titoli / --evd-font-testo. */
export const FONT_STACK = {
  titoli: '"Libre Franklin", "Evidenzia Franklin Ripiego", Arial, "Helvetica Neue", sans-serif',
  testo: '"Newsreader", "Evidenzia Newsreader Ripiego", "Times New Roman", Times, serif',
} as const;

/**
 * Combinazioni da attendere con `document.fonts.load()` prima di misurare le
 * righe d'attacco (registro dei tratti) e di impaginare.
 */
export const FONT_DA_CARICARE = [
  '900 144px "Libre Franklin"',
  '800 16px "Libre Franklin"',
  '700 16px "Libre Franklin"',
  '500 14px "Libre Franklin"',
  '400 15px "Newsreader"',
  'italic 400 18px "Newsreader"',
] as const;

/** Metriche dei woff2 (frazioni dell'em), misurate con fontTools. */
export const METRICHE = {
  franklin: { unitsPerEm: 1000, ascent: 0.966, descent: 0.246, capHeight: 0.742, xHeight: 0.53 },
  newsreader: { unitsPerEm: 2000, ascent: 0.735, descent: 0.265, capHeight: 0.67, xHeight: 0.426 },
} as const;

/** Larghezze misurate in em (Chromium, woff2 veri) per verifiche d'impaginato. */
export const LARGHEZZE_EM = {
  /** "EVIDENZIA", Franklin 900, tracking -0,02 em */
  testata: 5.61,
  /** "Il giro di sabato lo prepariamo noi.", Franklin 800, -0,015 em */
  riquadroRigaLunga: 15.59,
  /** carattere medio di un attacco in Franklin 800 (38 caratteri ≈ 18,5 em) */
  carattereAttacco: 0.487,
} as const;

/* ------------------------------------------------------------------------ */
/* Colori (solo per test e QA: lo stile usa le variabili CSS)               */
/* ------------------------------------------------------------------------ */

export const COLORI = {
  carta: '#E4DFD1',
  nero: '#1C1C1A',
  secondario: '#4F4C46',
  retino: '#8F8B82',
  rosa: '#EE5A9E',
  cartaPremuta: '#D4CFC2',
  ombraTinta: '#58503C',
  retinoPiatto: '#B1ADA2',
} as const;

export type NomeColore = keyof typeof COLORI;

export const OPACITA = {
  /** gruppo del tratto, in multiply: tetto assoluto sotto testo nero */
  tratto: 0.85,
  /** relative al gruppo */
  trattoCorpo: 0.88,
  trattoStriatura: 0.62,
  trattoEstremita: 1,
  /** gruppo del tratto "scarico" (quinto annuncio) */
  trattoScarico: 0.35,
  percorso: 0.55,
  velo: 0.3,
  /** grayscale dei tile OSM */
  mappaGrigio: 0.35,
  /** opacità composta oltre la quale il nero sotto il tratto scende sotto 4,5:1 */
  trattoLimiteCalcolato: 0.945,
} as const;

export const TRATTO = {
  /** altezza del tratto = corpo della riga × questo fattore */
  altezzaSuCorpo: 1.15,
  dyMax: 2,
  rotazioneMaxGradi: 0.6,
  righeMax: 2,
} as const;

/* ------------------------------------------------------------------------ */
/* Tipografia: corpi in px (a 16 px = 1 rem)                                  */
/* ------------------------------------------------------------------------ */

export type Famiglia = 'titoli' | 'testo';

export interface VoceTipo {
  famiglia: Famiglia;
  peso: number;
  /** corpo sul foglio (≥ 640 px), fisso */
  foglio: number;
  /** corpo nella colonna a 375 px */
  colonna: number;
  interlinea: number;
  tracking: number;
}

export const TIPO = {
  testata: { famiglia: 'titoli', peso: 900, foglio: 144, colonna: 52, interlinea: 0.86, tracking: -0.02 },
  riquadro: { famiglia: 'titoli', peso: 800, foglio: 34, colonna: 29.4, interlinea: 1.08, tracking: -0.015 },
  sottotesto: { famiglia: 'testo', peso: 400, foglio: 18, colonna: 16.3, interlinea: 1.45, tracking: 0 },
  barra: { famiglia: 'titoli', peso: 800, foglio: 20, colonna: 18, interlinea: 1, tracking: -0.005 },
  attaccoTesta: { famiglia: 'titoli', peso: 800, foglio: 22, colonna: 22, interlinea: 1.1, tracking: -0.015 },
  attaccoRiquadro: { famiglia: 'titoli', peso: 800, foglio: 20, colonna: 20, interlinea: 1.1, tracking: -0.015 },
  attacco: { famiglia: 'titoli', peso: 800, foglio: 16, colonna: 18, interlinea: 1.2, tracking: -0.01 },
  cerchiamo: { famiglia: 'titoli', peso: 700, foglio: 16, colonna: 17, interlinea: 1.2, tracking: 0 },
  testo: { famiglia: 'testo', peso: 400, foglio: 15, colonna: 16, interlinea: 1.4, tracking: 0 },
  prezzo: { famiglia: 'titoli', peso: 700, foglio: 17, colonna: 18, interlinea: 1.15, tracking: 0 },
  prezzoGrande: { famiglia: 'titoli', peso: 700, foglio: 20, colonna: 20, interlinea: 1.15, tracking: 0 },
  boxTitolo: { famiglia: 'titoli', peso: 800, foglio: 20, colonna: 20, interlinea: 1.1, tracking: -0.015 },
  citazione: { famiglia: 'testo', peso: 400, foglio: 18, colonna: 18, interlinea: 1.4, tracking: 0 },
  bottone: { famiglia: 'titoli', peso: 700, foglio: 15, colonna: 16, interlinea: 1.15, tracking: 0 },
  servizio: { famiglia: 'titoli', peso: 500, foglio: 14, colonna: 14, interlinea: 1.35, tracking: 0 },
} as const satisfies Record<string, VoceTipo>;

export type NomeVoceTipo = keyof typeof TIPO;

/** Corpo in px di una voce per il layout indicato. */
export function corpo(voce: NomeVoceTipo, layout: 'foglio' | 'colonna'): number {
  return TIPO[voce][layout];
}

/** Altezza del tratto per una riga della voce indicata. */
export function altezzaTratto(voce: NomeVoceTipo, layout: 'foglio' | 'colonna'): number {
  return Math.round(corpo(voce, layout) * TRATTO.altezzaSuCorpo * 10) / 10;
}

/* ------------------------------------------------------------------------ */
/* Griglia del foglio (ux-architect 5 e 5.1)                                 */
/* ------------------------------------------------------------------------ */

export const GRIGLIA = {
  colonne: 6,
  colonna: 268,
  canaletto: 20,
  margine: 66,
  margineAlto: 72,
  larghezza: 1840,
  /** stima; l'altezza vera la misura l'impaginato */
  altezza: 2060,
  spazioDestro: 360,
  spazioBasso: 320,
  filetto: 1,
  filoTestata: 3,
  bordoRiquadro: 2,
  annunciStacco: 12,
  barra: 36,
  retinoPasso: 3,
} as const;

/** x sinistra della colonna n (1-6) nel foglio: c1 = 66, c6 = 1506. */
export function xColonna(n: number): number {
  const i = Math.min(GRIGLIA.colonne, Math.max(1, Math.round(n))) - 1;
  return GRIGLIA.margine + i * (GRIGLIA.colonna + GRIGLIA.canaletto);
}

/** Larghezza di un blocco che occupa `quante` colonne: 1 → 268, 2 → 556, 3 → 844. */
export function larghezzaSpan(quante: number): number {
  const n = Math.min(GRIGLIA.colonne, Math.max(1, Math.round(quante)));
  return n * GRIGLIA.colonna + (n - 1) * GRIGLIA.canaletto;
}

/** x del filetto di colonna tra la colonna n e la n+1 (centro del canaletto). */
export function xFiletto(n: number): number {
  return xColonna(n) + GRIGLIA.colonna + GRIGLIA.canaletto / 2;
}

export const FOTO = {
  foglio: { testa: { l: 268, h: 200 }, conFoto: { l: 268, h: 168 }, riquadro: { l: 258, h: 160 } },
  colonna: { testa: { l: 343, h: 200 }, conFoto: { l: 343, h: 190 }, riquadro: { l: 170, h: 120 } },
  /** file a retino: larghezza 2× della colonna */
  retinoFileLarghezza: 536,
} as const;

/* ------------------------------------------------------------------------ */
/* Colonna, molo, pannelli                                                   */
/* ------------------------------------------------------------------------ */

export const BREAKPOINT = {
  /** sotto: colonna del giornale piegato; da qui in su: foglio */
  colonna: 640,
  /** sotto i 700 px di larghezza la riga delle zone del molo sparisce */
  zoneMolo: 700,
  desktop: 1024,
  /** sotto questa altezza di finestra il molo si riduce a una riga */
  moloRidottoAltezza: 560,
  /** sotto questa altezza le barre di rubrica non sono sticky (colonna) */
  barreStickyAltezza: 480,
} as const;

export const COLONNA = {
  margine: 16,
  larghezzaA375: 343,
  spazioFondo: 88,
  barraGiro: 48,
  striscia: 44,
  barra: 36,
} as const;

export const MOLO = {
  larghezza: 320,
  altezza: 290,
  distanza: 24,
  altezzaRidotto: 52,
  minipagina: { l: 150, h: 168 },
  posto: { l: 44, h: 44, trattoL: 36, trattoH: 18 },
  postoColonna: { trattoL: 24, trattoH: 10 },
} as const;

export const PANNELLI = {
  scheda: { l: 720, testa: 56 },
  giro: { l: 960, testa: 64, mappa: 520, colonna: 440 },
  /** spazio in basso a sinistra per ConceptBackButton nei pannelli a tutto schermo */
  riservaBackMobile: 88,
  /** oscuramento del foglio sotto scheda e giro */
  velo: 0.3,
} as const;

export const MAPPA = {
  percorsoSpessore: 11,
  marcatore: { l: 40, h: 26 },
  marcatoreAgenzia: 28,
} as const;

export const UI = {
  tocco: 44,
  bottone: 44,
  bottoneGrande: 52,
  campo: 48,
  campoColonna: 56,
  raggio: 0,
  fuoco: { spessore: 2, distanza: 2 },
} as const;

export const Z = {
  foglio: 0,
  comandi: 20,
  scarico: 25,
  velo: 30,
  scheda: 40,
  giro: 50,
} as const;

/* ------------------------------------------------------------------------ */
/* Pagina intera (ux-architect 5.3)                                          */
/* ------------------------------------------------------------------------ */

export const PAGINA_INTERA = {
  /** aria intorno al foglio scalato */
  aria: 32,
} as const;

/**
 * Scala della Pagina intera: la più grande che fa stare il foglio intero nella
 * finestra meno il molo (a destra) e 32 px di aria. Mai sopra 1.
 */
export function scalaPaginaIntera(
  larghezzaFinestra: number,
  altezzaFinestra: number,
  altezzaFoglio: number = GRIGLIA.altezza,
): number {
  const liberaL = larghezzaFinestra - MOLO.larghezza - MOLO.distanza - PAGINA_INTERA.aria * 2;
  const liberaH = altezzaFinestra - PAGINA_INTERA.aria * 2;
  if (liberaL <= 0 || liberaH <= 0 || altezzaFoglio <= 0) return 0.1;
  const s = Math.min(liberaL / GRIGLIA.larghezza, liberaH / altezzaFoglio, 1);
  return Math.round(Math.max(0.1, s) * 1000) / 1000;
}

/* ------------------------------------------------------------------------ */
/* Contrasto (WCAG 2.x) e multiply: per i test                               */
/* ------------------------------------------------------------------------ */

export type Rgb = readonly [number, number, number];

export function hexARgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgbAHex(c: Rgb): string {
  return (
    '#' +
    c
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function lineare(v: number): number {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminanza(hex: string): number {
  const [r, g, b] = hexARgb(hex);
  return 0.2126 * lineare(r) + 0.7152 * lineare(g) + 0.0722 * lineare(b);
}

export function contrasto(a: string, b: string): number {
  const la = luminanza(a);
  const lb = luminanza(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Colore risultante di `mix-blend-mode: multiply` con opacità `alfa` su `base`. */
export function multiply(base: string, sopra: string, alfa: number): string {
  const b = hexARgb(base);
  const s = hexARgb(sopra);
  return rgbAHex([
    b[0] * (1 - alfa) + ((b[0] * s[0]) / 255) * alfa,
    b[1] * (1 - alfa) + ((b[1] * s[1]) / 255) * alfa,
    b[2] * (1 - alfa) + ((b[2] * s[2]) / 255) * alfa,
  ]);
}
