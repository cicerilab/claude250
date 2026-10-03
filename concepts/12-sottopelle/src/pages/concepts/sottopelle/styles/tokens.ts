/**
 * SOTTOPELLE · design tokens per JS e WebGL (art-director)
 *
 * Specchio numerico di tokens.css: colori (hex, rgb 0..1 sRGB e lineari),
 * font, misure del modulo della parete, scala dei corpi, livelli, parametri
 * visivi dell'inchiostro e dell'arretramento. Solo costanti e funzioni pure:
 * nessun accesso a window, document o al tempo a livello di modulo (il sito
 * fa prerender). I contrasti sono misurati in docs/art-director.md §2 con le
 * stesse funzioni luminanza() e contrasto() qui sotto.
 */

/* ------------------------------------------------------------------------ */
/* Colori                                                                    */
/* ------------------------------------------------------------------------ */

export const COLORI = {
  /** Muro, fondo di tutto, inchiostro. */
  nero: '#151312',
  /** Unico gradino di superficie: isole, barra, targhe, scheda, pannello. */
  neroRialzato: '#1E1B19',
  /** Testo, contorni, anello del fuoco, oggetti in scala. */
  osso: '#ECE5D8',
  /** Testo secondario piccolo. 6,31:1 sul rialzato, 6,82:1 sul nero. */
  grigioLettura: '#A39C93',
  /** Mai testo: filamenti dell'inchiostro, tratteggi, sottolineature mute. */
  grigioSfumato: '#6F6962',
  /** Solo fondo dei due bottoni d'azione. Testo osso sopra: 5,37:1. */
  rosso: '#A92F28',
  /** Bottone rosso al passaggio del puntatore. */
  rossoScuro: '#8F2722',
  /** Bottone rosso premuto e durante l'invio. */
  rossoPremuto: '#7E211D',
  /** Fronte della nuvola d'inchiostro, un filo più scuro del nero. */
  inchiostroFronte: '#0E0C0B',
  /** Inchiostro diluito sotto testo osso (macchia, posto scelto): osso 5,60:1. */
  inchiostroVelo: '#5E5852',
  /** Osso al 6% sul nero: campitura degli oggetti in scala. */
  campitura: '#22201E',
} as const;

export type NomeColore = keyof typeof COLORI;
export type Vec3 = readonly [number, number, number];

function canale(hex: string, i: number): number {
  return parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
}

/** Hex `#RRGGBB` → terna sRGB 0..1 (quello che il canvas WebGL scrive). */
export function hexInVec3(hex: string): Vec3 {
  return [canale(hex, 0) / 255, canale(hex, 1) / 255, canale(hex, 2) / 255];
}

function linearizza(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Hex `#RRGGBB` → terna lineare 0..1 (per chi lavora in spazio lineare). */
export function hexInLineare(hex: string): Vec3 {
  const [r, g, b] = hexInVec3(hex);
  return [linearizza(r), linearizza(g), linearizza(b)];
}

function mappaColori(f: (hex: string) => Vec3): { readonly [K in NomeColore]: Vec3 } {
  return {
    nero: f(COLORI.nero),
    neroRialzato: f(COLORI.neroRialzato),
    osso: f(COLORI.osso),
    grigioLettura: f(COLORI.grigioLettura),
    grigioSfumato: f(COLORI.grigioSfumato),
    rosso: f(COLORI.rosso),
    rossoScuro: f(COLORI.rossoScuro),
    rossoPremuto: f(COLORI.rossoPremuto),
    inchiostroFronte: f(COLORI.inchiostroFronte),
    inchiostroVelo: f(COLORI.inchiostroVelo),
    campitura: f(COLORI.campitura),
  };
}

/**
 * Colori come terne sRGB 0..1 per le uniform del GL. Il canvas non fa
 * gestione del colore: le texture e il fondo stanno in sRGB, quindi lo
 * shader usa questi valori così come sono (`uNero = COLORI_GL.nero`).
 */
export const COLORI_GL = mappaColori(hexInVec3);

/** Gli stessi colori in spazio lineare (solo se lo shader linearizza le texture). */
export const COLORI_LINEARI = mappaColori(hexInLineare);

/** Luminanza relativa WCAG 2.x di un hex `#RRGGBB`. */
export function luminanza(hex: string): number {
  const [r, g, b] = hexInLineare(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapporto di contrasto WCAG 2.x tra due hex (sempre ≥ 1). */
export function contrasto(a: string, b: string): number {
  const la = luminanza(a);
  const lb = luminanza(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ------------------------------------------------------------------------ */
/* Inchiostro e arretramento (parametri visivi comuni a GL e fallback CSS)   */
/* ------------------------------------------------------------------------ */

/**
 * Cosa deve sembrare l'inchiostro. I numeri del rumore, del fronte e dei
 * filamenti sono del webgl-artist (webgl/presets.ts); qui stanno i colori e i
 * limiti visivi che valgono per tutto il sito.
 */
export const INCHIOSTRO = {
  /** Nuvola: lo stesso nero del muro, così una tessera coperta È il muro. */
  nuvola: COLORI.nero,
  /** Fronte della nuvola: un filo più scuro (1,05:1 sul nero), mai un bordo. */
  fronte: COLORI.inchiostroFronte,
  /** Filamenti che anticipano il fronte. Mai rosso, mai blu, mai bagliori. */
  filamenti: COLORI.grigioSfumato,
  /** Opacità massima dei filamenti sopra il nero. */
  opacitaFilamenti: 0.6,
  /** Foto appena scoperta, dietro il fronte: sfocatura come frazione del lato corto della tessera. */
  sfocaturaMorbida: 0.012,
  /** Foto appena scoperta: saturazione di partenza (1 = colori veri). */
  saturazioneMorbida: 0.35,
  /** Increspatura: spostamento massimo come frazione della tessera (CD: 0,6%). */
  increspaturaMax: 0.006,
  /** Increspatura: variazione di luminosità massima (CD: 3%). */
  increspaturaLuce: 0.03,
} as const;

/** Lavori esclusi dai filtri: luminosità e saturazione (GL e CSS uguali). */
export const ARRETRA = {
  luce: 0.28,
  saturazione: 0,
} as const;

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/** Un solo foglio per le due famiglie variabili; solo il sottoinsieme latin si scarica (89 KB). */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@100..900&family=Schibsted+Grotesk:wght@400..700&display=swap';

export const FONT_PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'] as const;

/** Descrittori per document.fonts.load / fontsReady (un file variabile per famiglia). */
export const FONT_DA_CARICARE = ['600 1em "Grenze Gotisch"', '400 1em "Schibsted Grotesk"'] as const;

export const FAMIGLIE = {
  insegna: "'Grenze Gotisch', 'Stp Grenze Ripiego', 'Times New Roman', serif",
  testo: "'Schibsted Grotesk', 'Stp Schibsted Ripiego', Arial, sans-serif",
} as const;

/** Metriche misurate (fontTools + Chromium, 03/10/2026), in em. */
export const METRICHE_FONT = {
  grenzeGotisch: {
    versione: 'v20',
    unitaPerEm: 1000,
    ascendente: 1.1,
    discendente: 0.38,
    altezzaX: 0.448,
    altezzaMaiuscole: 0.603,
    assePeso: [100, 900] as const,
    /** Cifre di base in stile antico (3 e 7 scendono): per la stima si usano lnum + tnum. */
    cifreLineari: 'lnum',
    pesoKB: 42.3,
  },
  schibstedGrotesk: {
    versione: 'v7',
    unitaPerEm: 2048,
    ascendente: 0.9766,
    discendente: 0.2578,
    altezzaX: 0.5273,
    altezzaMaiuscole: 0.7031,
    assePeso: [400, 700] as const,
    /** Larghezza media di un carattere su testo italiano vero, peso 400. */
    carattereMedio: 0.458,
    pesoKB: 46.8,
  },
} as const;

/**
 * Glifi che i due font NON hanno (verificato con fontTools sul sottoinsieme
 * latin): non vanno mai nei testi, il browser li prenderebbe da un altro font.
 * Le frecce si disegnano con le icone del vector-artist; tra numero e unità
 * si usa lo spazio unificatore U+00A0 (c'è in entrambi).
 */
export const GLIFI_ASSENTI = ['←', '→', ' ', ' '] as const;

/* ------------------------------------------------------------------------ */
/* La parola Sottopelle (h1 dell'ingresso)                                   */
/* ------------------------------------------------------------------------ */

/** Larghezza di "Sottopelle" in Grenze Gotisch per peso (em, misurata). */
export const LARGHEZZA_SOTTOPELLE_EM = {
  100: 3.44,
  200: 3.54,
  300: 3.63,
  400: 3.7,
  500: 3.78,
  600: 3.89,
  700: 3.99,
  800: 4.06,
  900: 4.18,
} as const;

export const INSEGNA = {
  /** Peso all'inizio dello sboccio della parola. */
  pesoInizio: 100,
  /** Peso a riposo (fine dello sboccio, reduced motion, font in ritardo). */
  pesoRiposo: 600,
  /** Divisore del corpo: 3,89 em a peso 600 più il 4% di margine. */
  larghezzaEm: 4.05,
  /** Rientro ottico della S verso sinistra. */
  rientroEm: -0.04,
} as const;

/** Peso della parola Sottopelle all'avanzamento p dello sboccio (0..1). */
export function pesoInsegna(p: number): number {
  const t = Math.min(1, Math.max(0, p));
  return Math.round(INSEGNA.pesoInizio + (INSEGNA.pesoRiposo - INSEGNA.pesoInizio) * t);
}

/** Corpo in px della parola che riempie un contenuto largo `larghezzaPx`. */
export function corpoInsegna(larghezzaPx: number): number {
  return larghezzaPx / INSEGNA.larghezzaEm;
}

/* ------------------------------------------------------------------------ */
/* Gradini e modulo della parete                                             */
/* ------------------------------------------------------------------------ */

export type Fascia = 'stretto' | 'medio' | 'largo';

/** Lato del modulo M in px per gradino. */
export const MODULO = { largo: 168, medio: 136, stretto: 112 } as const;

/** Larghezza minima di ogni gradino (px CSS). Stretto: fino a 640 compreso. */
export const SOGLIE = { medio: 641, largo: 1024 } as const;

/**
 * Le stesse soglie come media query, identiche a tokens.css: chi deve
 * scegliere il gradino nel browser usa matchMedia con queste stringhe, così
 * CSS e JS non litigano mai su una finestra di 640,5 px.
 */
export const MQ = {
  medio: '(min-width: 641px)',
  largo: '(min-width: 1024px)',
  puntatoreFine: '(pointer: fine)',
  passaggio: '(hover: hover)',
  movimentoRidotto: '(prefers-reduced-motion: reduce)',
} as const;

/** Gradino per una larghezza in px (funzione pura, per test e prerender). */
export function fasciaPer(larghezza: number): Fascia {
  if (larghezza >= SOGLIE.largo) return 'largo';
  if (larghezza >= SOGLIE.medio) return 'medio';
  return 'stretto';
}

export function moduloPer(larghezza: number): number {
  return MODULO[fasciaPer(larghezza)];
}

/** Spazio tra due tessere: un sesto del modulo, dentro il modulo. */
export function giunto(modulo: number): number {
  return modulo / 6;
}

/** Lato di una tessera o isola di `n` moduli. */
export function latoInModuli(n: number, modulo: number): number {
  return n * modulo - giunto(modulo);
}

/** Scarto fisso massimo di una tessera (±px), per gradino. Le isole non ne hanno. */
export const SCARTO = { largo: 10, medio: 10, stretto: 6 } as const;

/** Padding interno di isole e ingresso per gradino (px). */
export const PADDING = {
  isola: { largo: 40, medio: 32, stretto: 20 },
  ingresso: { largo: 48, medio: 40, stretto: 20 },
} as const;

/** Rapporto larghezza/altezza esatto di ogni forma di tessera (uguale a ogni gradino). */
export const RAPPORTO_FORMA = {
  '1x1': 1,
  '2x1': 13 / 6,
  '1x2': 6 / 13,
  '2x2': 1,
  '2x3': 13 / 20,
} as const;

/**
 * Larghezza del contenuto dell'isola d'ingresso: 4 moduli meno il giunto e
 * il padding, mai oltre la finestra meno 32 px (su telefono il fondo dell'isola
 * esce dallo schermo, il contenuto no). Uguale a --stp-insegna-larghezza.
 */
export function larghezzaIngresso(larghezzaFinestra: number): number {
  const fascia = fasciaPer(larghezzaFinestra);
  const m = MODULO[fascia];
  const interno = latoInModuli(4, m) - 2 * PADDING.ingresso[fascia];
  return Math.min(interno, larghezzaFinestra - 32);
}

/* ------------------------------------------------------------------------ */
/* Scala dei corpi (px; nel CSS sono in rem)                                 */
/* ------------------------------------------------------------------------ */

/** Corpi sulla parete, a gradini (seguono il modulo, non la finestra). */
export const TIPO_PARETE = {
  titolo: { stretto: 38, medio: 42, largo: 48 },
  pannello: { stretto: 32, medio: 38, largo: 44 },
  nome: { stretto: 32, medio: 36, largo: 40 },
  marchio: { stretto: 32, medio: 32, largo: 32 },
  lead: { stretto: 16, medio: 18, largo: 19 },
  isola: { stretto: 15, medio: 16, largo: 17 },
  testo: { stretto: 16, medio: 16, largo: 17 },
  comando: { stretto: 15, medio: 15, largo: 14 },
  azione: { stretto: 15, medio: 16, largo: 16 },
  etichetta: { stretto: 15, medio: 15, largo: 15 },
  campo: { stretto: 17, medio: 17, largo: 17 },
  misura: { stretto: 15, medio: 15, largo: 16 },
  nota: { stretto: 14, medio: 14, largo: 14 },
} as const;

/** Corpi fluidi fuori dalla parete: [a 375 px, a 1440 px]. */
export const TIPO_FLUIDO = {
  insegnaElenco: [80, 128],
  frase: [19, 26],
  schedaTitolo: [24, 30],
  cifra: [64, 96],
} as const;

/** Valore fluido a una larghezza (stessa retta del clamp di tokens.css). */
export function corpoFluido(voce: keyof typeof TIPO_FLUIDO, larghezza: number): number {
  const [a, b] = TIPO_FLUIDO[voce];
  const t = Math.min(1, Math.max(0, (larghezza - 375) / (1440 - 375)));
  return a + (b - a) * t;
}

/** Il gotico non scende mai sotto questo corpo. */
export const GOTICO_MINIMO_PX = 32;

/* ------------------------------------------------------------------------ */
/* Livelli                                                                   */
/* ------------------------------------------------------------------------ */

/** Unici z-index del concept (il bottone del sito sta sopra tutto da solo). */
export const Z = {
  canvas: 0,
  parete: 1,
  comandi: 10,
  filtri: 20,
  scheda: 30,
  grandeCome: 40,
} as const;

/* ------------------------------------------------------------------------ */
/* Misure dei comandi                                                        */
/* ------------------------------------------------------------------------ */

export const MISURE = {
  tocco: 44,
  campo: 52,
  barra: 48,
  testata: 44,
  casella: 24,
  /** Bottone rosso per gradino: [altezza, altezza grande dell'ingresso, padding orizzontale]. */
  azione: { stretto: [44, 48, 14], medio: [48, 52, 20], largo: [48, 52, 22] },
  /** "Grande come?" in Schibsted 600 misura 6,95 em: a 15 px sono 104 px, con 14 + 14 di padding 132 px (riga A del telefono: 135 disponibili). */
  grandeComeEm: 6.95,
  focus: { spessore: 2, distanza: 2 },
} as const;
