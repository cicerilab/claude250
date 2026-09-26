/**
 * NOVANTA · design tokens per TypeScript (art-director)
 *
 * Specchio numerico di `tokens.css`: stessi colori, stesse misure. Se cambi
 * un valore qui, cambialo anche là (e viceversa). La tabella dei contrasti
 * in `docs/art-director.md` è calcolata su questi hex.
 *
 * File puro: nessun accesso a window/document a livello di modulo (il sito
 * vero fa prerender), nessun import.
 */

/* ------------------------------------------------------------------------ */
/* Colori                                                                    */
/* ------------------------------------------------------------------------ */

/** I tre colori del concept e i loro derivati. Nessun altro hex nel sito. */
export const COLORI = {
  /** Il campo: fondo di tutto il sito, sempre pieno. */
  albicocca: '#F4D5C0',
  /** Lo strumento e il testo: braccio, tacche percorse, perno, bottone pieno. */
  petrolio: '#0E3D49',
  /** Faccia del goniometro, basamento, campi, listino. Mai fondo pagina. */
  gesso: '#FCF8F3',
  /** Petrolio 78% su albicocca: testo secondario. 5,03:1 su albicocca, 6,61:1 su gesso. */
  petrolioQuieto: '#415E63',
  /** Petrolio x0,72: bottone pieno in hover/premuto. Gesso sopra 13,94:1. */
  petrolioProfondo: '#0A2C35',
  /** Spicchio "chiuso", pillola in hover, selezione. Sopra solo petrolio pieno (6,98:1). */
  albicoccaScura: '#E9BFA3',
  /** Petrolio 34% su gesso: tacche non percorse, ore occupate. Decorativo (1,93:1). */
  taccaSpenta: '#ABB8B9',
  /** Petrolio 22% su albicocca: filo tra le voci di un elenco. Decorativo. */
  filetto: '#C1B4A6',
  /** Petrolio 45% su albicocca: solo controlli disabilitati. */
  inattivo: '#8D918A',
} as const;

export type NomeColore = keyof typeof COLORI;

/** Ombra dell'unico oggetto sollevato (il braccio), come filtro CSS/SVG. */
export const OMBRA_BRACCIO = { dx: 0, dy: 3, sfocatura: 3, colore: COLORI.petrolio, opacita: 0.12 } as const;

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Google Fonts: Epilogue variabile 300-800 (il "°" a 300, la scala a 500,
 * i titoli a 700, i gradi e il marchio a 800) e Lexend variabile 400-500.
 * Latin: 35,7 KB + 39,7 KB woff2 (budget 150 KB).
 */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Epilogue:wght@300..800&family=Lexend:wght@400..500&display=swap';

/** Descrittori per `document.fonts.load()` prima di misurare o scattare. */
export const FONT_DA_CARICARE = [
  '800 1em Epilogue',
  '700 1em Epilogue',
  '500 1em Epilogue',
  '300 1em Epilogue',
  '400 1em Lexend',
  '500 1em Lexend',
] as const;

export const FAMIGLIE = {
  misura: '"Epilogue", "Novanta Epilogue Ripiego", Arial, sans-serif',
  testo: '"Lexend", "Novanta Lexend Ripiego", Arial, sans-serif',
} as const;

/**
 * Metriche misurate sul file di Epilogue (v20). Il font ha `tnum`: con
 * `font-variant-numeric: tabular-nums` ogni cifra avanza uguale e il numero
 * non vibra mentre gira. Valori in em.
 */
export const CIFRE_EPILOGUE = {
  /** Avanzamento di una cifra tabellare per peso. */
  tnum: { 300: 0.5315, 500: 0.5625, 700: 0.594, 800: 0.6095 },
  /** Avanzamento del "°" per peso. */
  grado: { 300: 0.3345, 800: 0.326 },
  /** Larghezza della scatola dei gradi: 3 cifre a 800 + "°" a 300. */
  scatolaGradi: 2.17,
  /** Altezza delle maiuscole e delle cifre (cap height). */
  altezzaCifre: 0.7375,
} as const;

/* ------------------------------------------------------------------------ */
/* Scala tipografica (px CSS a 375 e a 1440; fluida in mezzo)                */
/* ------------------------------------------------------------------------ */

export interface Taglia {
  readonly a375: number;
  readonly a1440: number;
  readonly interlinea: number;
  readonly peso: number;
}

/** Cinque taglie per raddoppio più il logotipo. Nessuna sesta taglia. */
export const TIPO = {
  nota: { a375: 14, a1440: 14, interlinea: 1.45, peso: 400 },
  corpo: { a375: 17, a1440: 18, interlinea: 1.6, peso: 400 },
  titolo: { a375: 28, a1440: 36, interlinea: 1.08, peso: 700 },
  misura: { a375: 56, a1440: 72, interlinea: 0.9, peso: 800 },
  marchio: { a375: 22, a1440: 28, interlinea: 1, peso: 800 },
} as const satisfies Record<string, Taglia>;

/**
 * Il numero dei gradi. Mobile: 104 px (limitato a 15,6% dell'altezza sugli
 * schermi bassi). Desktop: 26% dell'altezza tra 144 e 280 px (piano B senza
 * foto). A 90° scende (l'anello è il protagonista).
 */
export const GRADI = {
  fondo: { px: 104, minPx: 80, frazioneAltezza: 0.156 },
  bordo: { minPx: 144, frazioneAltezza: 0.26, maxPx: 280 },
  prenotaFondo: { px: 56 },
  prenotaBordo: { minPx: 96, frazioneAltezza: 0.16, maxPx: 144 },
  elenco: { a375: 56, a1440: 72 },
} as const;

/* ------------------------------------------------------------------------ */
/* Lo strumento: misure visive del quadrante (px del viewBox = px CSS)       */
/* ------------------------------------------------------------------------ */

export interface MisureStrumento {
  /** Lunghezze delle tacche, dal bordo dell'arco verso il perno. */
  readonly taccaCorta: number;
  readonly taccaMedia: number;
  readonly taccaLunga: number;
  readonly spessoreTacca: number;
  readonly spessoreTaccaLunga: number;
  /** Filo petrolio sull'arco (il disco gesso sull'albicocca da solo è 1,31:1). */
  readonly contornoDisco: number;
  /** Distanza dal bordo dell'arco al centro dei numeri 0-30-...-180, verso il perno. */
  readonly rientroNumeri: number;
  /** Distanza dal bordo dell'arco alla parola dell'angolo, verso l'esterno. */
  readonly distanzaParole: number;
  readonly spessoreBraccio: number;
  /** Quanto il braccio va oltre l'arco prima della manopola. */
  readonly sporgenzaBraccio: number;
  readonly manopola: number;
  readonly manopolaTocco: number;
  readonly perno: number;
  readonly pernoAnello: number;
  /** Diametro dell'oblò con il numero intero (controruotato, sempre dritto). */
  readonly finestrella: number;
  /** Distanza dal bordo dell'arco al centro dell'oblò, verso il perno. */
  readonly rientroFinestrella: number;
}

export const STRUMENTO: { readonly bordo: MisureStrumento; readonly fondo: MisureStrumento; readonly mini: MisureStrumento } = {
  bordo: {
    taccaCorta: 10,
    taccaMedia: 16,
    taccaLunga: 26,
    spessoreTacca: 1.25,
    spessoreTaccaLunga: 2.5,
    contornoDisco: 1.5,
    rientroNumeri: 44,
    distanzaParole: 28,
    spessoreBraccio: 10,
    sporgenzaBraccio: 40,
    manopola: 28,
    manopolaTocco: 48,
    perno: 20,
    pernoAnello: 3,
    finestrella: 30,
    rientroFinestrella: 78,
  },
  fondo: {
    taccaCorta: 7,
    taccaMedia: 11,
    taccaLunga: 18,
    spessoreTacca: 1,
    spessoreTaccaLunga: 2,
    contornoDisco: 1.5,
    rientroNumeri: 32,
    distanzaParole: 22,
    spessoreBraccio: 8,
    sporgenzaBraccio: 0,
    manopola: 26,
    manopolaTocco: 48,
    perno: 16,
    pernoAnello: 3,
    finestrella: 26,
    rientroFinestrella: 58,
  },
  /** Mini archi (30°, 150°, vista elenco): niente tacche corte sotto 80 px di raggio. */
  mini: {
    taccaCorta: 0,
    taccaMedia: 5,
    taccaLunga: 9,
    spessoreTacca: 1,
    spessoreTaccaLunga: 1.5,
    contornoDisco: 1.5,
    rientroNumeri: 0,
    distanzaParole: 10,
    spessoreBraccio: 4,
    sporgenzaBraccio: 6,
    manopola: 10,
    manopolaTocco: 0,
    perno: 8,
    pernoAnello: 2,
    finestrella: 0,
    rientroFinestrella: 0,
  },
};

/** Margine minimo tra la manopola e il bordo dello schermo (px). */
export const MARGINE_SCHERMO = 16;

/**
 * Raggio massimo del quadrante "fondo" perché a 0° e a 180° la manopola
 * disegnata resti dentro lo schermo con 16 px di margine (trend-researcher
 * §4.2). A 375 px: 187,5 − 16 − 0 − 13 = 158,5 px.
 */
export function raggioMaxFondo(larghezza: number): number {
  const m = STRUMENTO.fondo;
  return larghezza / 2 - MARGINE_SCHERMO - m.sporgenzaBraccio - m.manopola / 2;
}

/* ------------------------------------------------------------------------ */
/* Forme, spazi, livelli                                                     */
/* ------------------------------------------------------------------------ */

export const RAGGI = { superficie: 14, pillola: 999 } as const;

export const ALTEZZE = { bottone: 56, pillola: 44, campo: 52 } as const;

export const FOCUS = { spessore: 3, distanza: 3 } as const;

/** Spazi base 4, in px (gli stessi di --nov-sp-1 ... --nov-sp-10). */
export const SPAZI = [4, 8, 12, 16, 24, 32, 48, 64, 96, 120] as const;

export const COLONNA = { lettura: 520, stretta: 352 } as const;

export const Z = { contenuto: 1, quadrante: 2, testata: 3, salto: 4 } as const;

/** Soglie in em (le stesse di core/modo.ts e delle media query). */
export const SOGLIE_EM = { bordo: 47.5, altezzaBordo: 35, altezzaFondo: 32.5, bottoneSito: 40 } as const;

/* ------------------------------------------------------------------------ */
/* Foto                                                                      */
/* ------------------------------------------------------------------------ */

/** Trattamento previsto per le foto (piano B attivo: oggi nessuna foto). */
export const FOTO_TRATTAMENTO = {
  velatura: COLORI.albicocca,
  opacitaVelatura: 0.12,
  fusione: 'multiply',
  filtro: 'saturate(0.82) contrast(0.96)',
} as const;

/* ------------------------------------------------------------------------ */
/* Utilità pure                                                              */
/* ------------------------------------------------------------------------ */

function canale(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminanza relativa WCAG 2.x di un hex "#RRGGBB". */
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
  const [alto, basso] = la > lb ? [la, lb] : [lb, la];
  return (alto + 0.05) / (basso + 0.05);
}
