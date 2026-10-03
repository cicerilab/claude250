/**
 * MADRE · design tokens per TypeScript e WebGL (art-director)
 *
 * Specchio numerico di `tokens.css`: stessi colori, stesse misure. Se cambi
 * un valore qui, cambialo anche là (e viceversa). La tabella dei contrasti
 * in `docs/art-director.md` è calcolata su questi hex.
 *
 * File puro: nessun import, nessun accesso a window/document/navigator a
 * livello di modulo (il sito fa prerender). Le funzioni ricevono le misure
 * della finestra come argomenti.
 */

/* ------------------------------------------------------------------------ */
/* Colori                                                                    */
/* ------------------------------------------------------------------------ */

/** I quattro colori della matrice e i loro derivati. Nessun altro hex nel sito. */
export const COLORI = {
  /** Fondo dei pani, dell'impasto, del pane fisso. Farina, non crema. */
  farina: '#F7F3EA',
  /** Carta da zucchero: dolci, domenica, vassoio, giorni in cui "si fa". Sempre fondo pieno. */
  zucchero: '#9BB2C5',
  /** Unico accento: piano del bancone, prezzi su farina, bottone su farina, bordo del successo. */
  crosta: '#9C5B2A',
  /** Tutto il testo, i fili, il focus. */
  inchiostro: '#2F3D4C',

  /** Bottone crosta premuto o in hover. 6,81:1 con la farina sopra. */
  crostaScura: '#7E4620',
  /** Fondo dei campi di testo. */
  farinaChiara: '#FCFAF5',
  /** Gettoni, lunedì chiuso, foto in caricamento su farina. */
  farinaSotto: '#EEE8DC',
  /** Pieghe dell'impasto (CSS e shader). */
  farinaOmbra: '#E7DECD',
  /** Impasto senza spolvero, dentro la fossetta (CSS e shader). */
  impastoNudo: '#EAD9BC',
  /** Risvolto del foglio azzurro, rovescio degli angoli piegati del vassoio. */
  zuccheroLuce: '#B2C2CE',
  /** Carta del vassoio (più fitta del foglio). Inchiostro sopra 4,67:1. */
  zuccheroPiega: '#95ABBE',
  /** Linea di piega e filo di taglio del vassoio; foto in caricamento su zucchero. Decorativo. */
  zuccheroOmbra: '#8095A7',
  /** Testo secondario SOLO su farina (5,69:1). Su zucchero si usa l'inchiostro pieno. */
  inchiostroQuieto: '#57616C',
  /** Bottone inchiostro premuto o in hover. */
  inchiostroProfondo: '#222C37',
  /** Testo secondario SOLO su inchiostro (bottega): 7,10:1. */
  farinaQuieta: '#CFCFCA',
} as const;

export type NomeColore = keyof typeof COLORI;
export type Vec3 = readonly [number, number, number];

/** Hex `#RRGGBB` → componenti sRGB 0..1. */
export function srgb(hex: string): Vec3 {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Componente sRGB 0..1 → lineare (per gli shader: le uniform di colore sono lineari). */
function canaleLineare(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Hex `#RRGGBB` → vec3 lineare. */
export function lineare(hex: string): Vec3 {
  const [r, g, b] = srgb(hex);
  return [canaleLineare(r), canaleLineare(g), canaleLineare(b)];
}

/**
 * Colori dello shader dell'impasto, già lineari (uniform `uFarina`,
 * `uFarinaOmbra`, `uImpastoNudo` del tech-architect §8.2; `spolvero` per i
 * granelli bianchi). Calcolati qui da funzioni pure: nessun accesso al browser.
 * Valori attesi: farina [0.9301, 0.8963, 0.8228], farinaOmbra
 * [0.7991, 0.7305, 0.6105], impastoNudo [0.8228, 0.6939, 0.5029].
 */
export const COLORI_GL = {
  farina: lineare(COLORI.farina),
  farinaOmbra: lineare(COLORI.farinaOmbra),
  impastoNudo: lineare(COLORI.impastoNudo),
  spolvero: lineare(COLORI.farinaChiara),
  inchiostro: lineare(COLORI.inchiostro),
} as const;

/**
 * Luce dell'impasto: diffusa, dall'alto a sinistra, nessuna componente
 * speculare (è un impasto opaco). La superficie CSS e lo shader usano la
 * stessa direzione. Convenzione del vettore: x a destra, y in alto, z verso
 * chi guarda; azimut misurato da +x in senso antiorario.
 */
export const LUCE = {
  azimutGradi: 135,
  elevazioneGradi: 38,
  vettore: [-0.5572, 0.5572, 0.6157] as Vec3,
  /** Quota di luce ambiente: le zone in ombra non scendono sotto farinaOmbra. */
  ambiente: 0.55,
} as const;

/** Contrasto WCAG 2.x tra due hex (per test e per lo script del doc). */
export function contrasto(a: string, b: string): number {
  const lum = (hex: string): number => {
    const [r, g, b2] = lineare(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
  };
  const la = lum(a);
  const lb = lum(b);
  const [alto, basso] = la > lb ? [la, lb] : [lb, la];
  return (alto + 0.05) / (basso + 0.05);
}

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Google Fonts. Bricolage Grotesque senza l'asse wdth (76,9 KB latin invece
 * di 131,5: la larghezza 90 toglieva proprio la morbidezza che serve) e
 * Karla variabile (24,3 KB, un solo file per 400-700). Totale 101,2 KB.
 * Restringere i pesi non cambia il file servito da Google.
 */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Karla:wght@400..700&display=swap';

/** Descrittori per `document.fonts.load()` prima di misurare o scattare. */
export const FONT_DA_CARICARE = [
  '700 1em "Bricolage Grotesque"',
  '600 1em "Bricolage Grotesque"',
  '500 1em "Bricolage Grotesque"',
  '400 1em Karla',
  '700 1em Karla',
] as const;

/** Pile di famiglie, identiche a `--mad-font-*` di tokens.css. */
export const FAMIGLIE = {
  titolo: '"Bricolage Grotesque", "Madre Titolo Ripiego", Arial, sans-serif',
  voce: '"Bricolage Grotesque", "Madre Voce Ripiego", Arial, sans-serif',
  testo: '"Karla", "Madre Testo Ripiego", Arial, sans-serif',
} as const;

/**
 * Metriche misurate con fontTools sui woff2 latin (Bricolage v9, Karla v33).
 * In em. `cartelloBase`: distanza tra la linea di base e il fondo della riga
 * con interlinea 0,86 ((0,86 − 1,2) / 2 + 0,27 = 0,10).
 */
export const METRICHE = {
  bricolage: { ascent: 0.93, descent: 0.27, altezzaX: 0.528, altezzaMaiuscole: 0.66, upm: 1000 },
  karla: { ascent: 0.917, descent: 0.252, altezzaX: 0.478, altezzaMaiuscole: 0.628, upm: 2000 },
  cartelloBase: 0.1,
  /** Larghezza media rispetto ad Arial (Liberation Sans) su frasi del concept. */
  larghezzaSuArial: {
    titolo: 0.907, // opsz 96, wght 700, rispetto ad Arial Bold
    nome: 0.966, // opsz 48, wght 600, rispetto ad Arial Bold
    frase: 1.036, // opsz 24, wght 500, rispetto ad Arial
    testo: 1.012, // Karla 400, rispetto ad Arial
    testoForte: 0.997, // Karla 600-700, rispetto ad Arial Bold
  },
  /** Entrambe le famiglie hanno la feature `tnum`: prezzi con tabular-nums. */
  cifreTabellari: true,
} as const;

/* ------------------------------------------------------------------------ */
/* Scala tipografica (px CSS a 375 e a 1440; fluida in mezzo)                */
/* ------------------------------------------------------------------------ */

export interface Voce {
  readonly famiglia: keyof typeof FAMIGLIE;
  readonly a375: number;
  readonly a1440: number;
  readonly peso: number;
  /** Asse opsz fissato (solo Bricolage); null = automatico. */
  readonly opsz: number | null;
  readonly interlinea: number;
  /** Spaziatura tra le lettere in em. */
  readonly tracking: number;
}

export const TIPO = {
  cartello: { famiglia: 'titolo', a375: 56, a1440: 128, peso: 700, opsz: 96, interlinea: 0.86, tracking: -0.025 },
  titolo1: { famiglia: 'titolo', a375: 34, a1440: 56, peso: 700, opsz: 96, interlinea: 0.96, tracking: -0.015 },
  titolo2: { famiglia: 'titolo', a375: 44, a1440: 72, peso: 700, opsz: 96, interlinea: 0.96, tracking: -0.015 },
  nome: { famiglia: 'voce', a375: 26, a1440: 40, peso: 600, opsz: 48, interlinea: 1.04, tracking: -0.008 },
  nomePiccolo: { famiglia: 'voce', a375: 22, a1440: 28, peso: 600, opsz: 48, interlinea: 1.04, tracking: -0.008 },
  indirizzo: { famiglia: 'voce', a375: 30, a1440: 40, peso: 600, opsz: 48, interlinea: 1.04, tracking: -0.008 },
  frase: { famiglia: 'voce', a375: 20, a1440: 26, peso: 500, opsz: 24, interlinea: 1.28, tracking: 0 },
  lead: { famiglia: 'testo', a375: 16, a1440: 18, peso: 400, opsz: null, interlinea: 1.5, tracking: 0 },
  corpo: { famiglia: 'testo', a375: 16, a1440: 17, peso: 400, opsz: null, interlinea: 1.5, tracking: 0 },
  prezzo: { famiglia: 'testo', a375: 17, a1440: 20, peso: 700, opsz: null, interlinea: 1.3, tracking: 0 },
  piccolo: { famiglia: 'testo', a375: 15, a1440: 15, peso: 500, opsz: null, interlinea: 1.4, tracking: 0.01 },
  nota: { famiglia: 'testo', a375: 14, a1440: 14, peso: 400, opsz: null, interlinea: 1.4, tracking: 0.01 },
  bottone: { famiglia: 'testo', a375: 17, a1440: 17, peso: 600, opsz: null, interlinea: 1.15, tracking: 0 },
  campo: { famiglia: 'testo', a375: 17, a1440: 17, peso: 400, opsz: null, interlinea: 1.3, tracking: 0 },
} as const satisfies Record<string, Voce>;

export type NomeVoce = keyof typeof TIPO;

/** Corpo in px di una voce a una data larghezza di finestra (come il clamp del CSS). */
export function corpo(voce: NomeVoce, larghezza: number): number {
  const v = TIPO[voce];
  const t = Math.min(1, Math.max(0, (larghezza - 375) / (1440 - 375)));
  return v.a375 + (v.a1440 - v.a375) * t;
}

/* ------------------------------------------------------------------------ */
/* Gabbia                                                                    */
/* ------------------------------------------------------------------------ */

export const BREAKPOINT = { tablet: 640, desktop: 1024, paginaMax: 1680 } as const;

export interface Gabbia {
  readonly margineSx: number;
  readonly margineDx: number;
  readonly colonne: number;
  readonly canalino: number;
}

/**
 * Gabbia "a spalla": da 1024 px il margine sinistro è 248 px (l'asse del
 * marchio, oltre il ConceptBackButton), il destro 40; oltre 1680 px si centra.
 */
export function gabbia(larghezza: number): Gabbia {
  if (larghezza < BREAKPOINT.tablet) return { margineSx: 20, margineDx: 20, colonne: 4, canalino: 16 };
  if (larghezza < BREAKPOINT.desktop) return { margineSx: 24, margineDx: 24, colonne: 8, canalino: 20 };
  const fuori = Math.max(0, (larghezza - BREAKPOINT.paginaMax) / 2);
  return { margineSx: 248 + fuori, margineDx: 40 + fuori, colonne: 12, canalino: 24 };
}

/* ------------------------------------------------------------------------ */
/* Il bancone                                                                */
/* ------------------------------------------------------------------------ */

export interface MisureBancone {
  /** Quota del bordo superiore del piano, px dall'alto della finestra. */
  readonly pianoY: number;
  readonly spessore: number;
  readonly testata: number;
  /** Altezza massima di una foto sul piano (pagnotta da 1 kg = 1). */
  readonly fotoHMax: number;
  /** Larghezza massima di una foto. */
  readonly fotoWMax: number;
  /** Larghezza di un prodotto su mobile (84vw); null da 640 px in su. */
  readonly blocco: number | null;
  /** Spazio tra due prodotti nella striscia. */
  readonly passo: number;
  /** Larghezza della colonna del testo accanto alla foto. */
  readonly cartellino: number;
  /** Distanza tra il piano e il primo testo appeso sotto. */
  readonly appeso: number;
}

/**
 * Stesse formule di `--mad-piano-y` e compagni in tokens.css.
 * `altezza` è l'altezza in svh della finestra (in JS: la più piccola
 * misurata, per esempio `document.documentElement.clientHeight` al mount;
 * mai visualViewport, che cambia con la tastiera); `safeBasso` è la
 * safe-area in basso (0 se non nota).
 */
export function misureBancone(larghezza: number, altezza: number, safeBasso = 0): MisureBancone {
  if (larghezza < BREAKPOINT.tablet) {
    const testata = 56;
    const fissi = 102 + safeBasso;
    const pianoY = testata + (altezza - testata - fissi) * 0.5;
    return {
      pianoY,
      spessore: 6,
      testata,
      fotoHMax: Math.min(230, pianoY - testata - 24),
      fotoWMax: larghezza * 0.84 - 40,
      blocco: larghezza * 0.84,
      passo: 0,
      cartellino: larghezza * 0.84 - 20,
      appeso: 16,
    };
  }
  const testata = 64;
  const fissi = 48;
  const pianoY = testata + (altezza - testata - fissi) * 0.65;
  const desktop = larghezza >= BREAKPOINT.desktop;
  return {
    pianoY,
    spessore: 8,
    testata,
    fotoHMax: Math.min(desktop ? Math.min(440, Math.max(360, altezza * 0.3)) : 300, pianoY - testata - 56),
    fotoWMax: desktop ? Math.min(720, Math.max(560, larghezza * 0.36)) : larghezza * 0.46,
    blocco: null,
    passo: desktop ? 96 : 64,
    cartellino: desktop ? 296 : 264,
    appeso: desktop ? 24 : 20,
  };
}

/**
 * La scala vera sul bancone (trend-researcher P3, ux-architect 5.3-5.6):
 * `altezza` = frazione di `fotoHMax` (pagnotta da 1 kg = 1), `rapporto` =
 * larghezza / altezza del ritaglio che il photo-editor consegna.
 * Chiavi = id di `content/prezzi.ts` (tech-architect §6.6) più 'madre' e
 * 'vassoio'. In CSS: `--mad-scala` e `--mad-rapporto` inline sul prodotto,
 * vedi DESIGN.md §4 "Foto sul piano".
 */
export interface Posto {
  readonly altezza: number;
  readonly rapporto: number;
}

export const POSTI_BANCONE = {
  // pani (altezze a 1440: 360, 300, 280, 250, 230, 200 px)
  pagnotta: { altezza: 1, rapporto: 1.28 },
  integrale: { altezza: 0.83, rapporto: 1.33 },
  sorc: { altezza: 0.78, rapporto: 1.25 },
  segale: { altezza: 0.69, rapporto: 1.2 },
  semola: { altezza: 0.64, rapporto: 2.26 },
  ciabatta: { altezza: 0.56, rapporto: 2.1 },
  // dolci (320, 300, 260, 200, 180, 160 px)
  gubana: { altezza: 0.89, rapporto: 1.3 },
  crostata: { altezza: 0.83, rapporto: 1.33 },
  pinza: { altezza: 0.72, rapporto: 1.25 },
  strucolo: { altezza: 0.56, rapporto: 2.4 },
  esse: { altezza: 0.5, rapporto: 1.33 },
  frolla: { altezza: 0.44, rapporto: 1.33 },
  // intermezzo e domenica
  madre: { altezza: 1, rapporto: 1.1 },
  vassoio: { altezza: 1, rapporto: 2 },
} as const satisfies Record<string, Posto>;

export type IdPosto = keyof typeof POSTI_BANCONE;

/** Misura in px della foto di un prodotto: altezza secondo la scala, larghezza limitata a fotoWMax (il rapporto resta). */
export function fotoSulPiano(id: IdPosto, m: Pick<MisureBancone, 'fotoHMax' | 'fotoWMax'>): { w: number; h: number } {
  const p = POSTI_BANCONE[id];
  const hIdeale = m.fotoHMax * p.altezza;
  const w = Math.min(hIdeale * p.rapporto, m.fotoWMax);
  return { w, h: w / p.rapporto };
}

/** Lato della foto quadrata dei gettoni del pane fisso. */
export function latoGettone(larghezza: number): number {
  return larghezza < BREAKPOINT.tablet ? 72 : 96;
}

/* ------------------------------------------------------------------------ */
/* Interfaccia, stati, livelli                                               */
/* ------------------------------------------------------------------------ */

export const UI = {
  toccoMin: 44,
  bottoneH: 48,
  bottoneHPiccolo: 44,
  bottoneHGrande: 56,
  campoH: 56,
  giornoH: 56,
  raggio: 4,
  filo: 2,
  filoSottile: 1,
  campoBordo: 1.5,
  bordoErrore: 3,
  focusSpessore: 2,
  focusDistanza: 2,
  opacitaDisabilitato: 0.45,
  opacitaFantasma: 0.35,
  vassoioPiega: 22,
  vassoioPiegaGettone: 12,
  contattoH: 14,
  risvolto: 12,
} as const;

/** Livelli (uguali a --mad-z-*). Il ConceptBackButton del sito sta sopra a tutto. */
export const Z = {
  canvas: 0,
  foglio: 0,
  contenuto: 1,
  etichette: 5,
  barra: 6,
  inMano: 7,
  testata: 10,
  trascinato: 20,
} as const;

/** Banchi e fondo di ciascuno (per i fissi che seguono il banco attivo). */
export const FONDO_DEL_BANCO = {
  impasto: 'farina',
  pane: 'farina',
  'la-madre': 'farina',
  dolci: 'zucchero',
  domenica: 'zucchero',
  'pane-fisso': 'farina',
  bottega: 'inchiostro',
} as const;

export type Fondo = (typeof FONDO_DEL_BANCO)[keyof typeof FONDO_DEL_BANCO];
