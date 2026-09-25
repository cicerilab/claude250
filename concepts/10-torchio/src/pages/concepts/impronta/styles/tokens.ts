/**
 * IMPRONTA · design tokens per TypeScript e WebGL (art-director)
 *
 * Specchio numerico di `tokens.css`: stessi colori, stesse misure. Se cambi
 * un valore qui, cambialo anche là (e viceversa); la tabella dei contrasti in
 * `docs/art-director.md` è calcolata su questi hex.
 *
 * Il file è puro: nessun accesso a window/document a livello di modulo
 * (il sito vero fa prerender), nessun import.
 *
 * Colori in tre forme:
 * - `hex`   "#RRGGBB", per CSS e per `paletteCarta()` del webgl-artist;
 * - `srgb`  vec3 0..1 non linearizzato (lo shader che vuole uguagliare al
 *           byte il fondo CSS lavora qui);
 * - `lin`   vec3 lineare (sRGB → lineare, IEC 61966-2-1), per chi fa
 *           illuminazione in spazio lineare e riconverte in uscita.
 */

/* ------------------------------------------------------------------------ */
/* Tipi                                                                      */
/* ------------------------------------------------------------------------ */

export type Vec3 = readonly [number, number, number];

export const CARTE_IDS = ['citrino', 'cotone', 'cipria', 'grafite'] as const;
export type CartaId = (typeof CARTE_IDS)[number];

/** Colori di una carta che hanno anche una forma vec3. */
export interface ColoriVec3 {
  readonly fondo: Vec3;
  readonly luce: Vec3;
  readonly ombra: Vec3;
  readonly inchiostro: Vec3;
  readonly seccoFondo: Vec3;
  readonly costa: Vec3;
  readonly taglio: Vec3;
}

export interface TokenCarta {
  readonly id: CartaId;
  /** Fondo della carta (tutta la pagina o il pezzo). */
  readonly fondo: string;
  /** Luce del rilievo: il labbro del solco che prende la luce. */
  readonly luce: string;
  /** Ombra del rilievo: la parete del solco in ombra, ombre di appoggio. */
  readonly ombra: string;
  /** Testo di lettura. AA su fondo, luce e ombra (vedi docs/art-director.md). */
  readonly inchiostro: string;
  /** Inchiostro al 72% già composto sul fondo: voci non correnti. AA garantito. */
  readonly inchiostroVelato: string;
  /** Fondo del solco a secco (la fibra compressa). Decorativo. */
  readonly seccoFondo: string;
  /** Spessore della carta visto di taglio. Decorativo. */
  readonly costa: string;
  /** Colore del taglio colorato su questa carta (preso da un'altra carta del sistema). */
  readonly taglio: string;
  /** Filo del bottone in lamina su questa carta (≥ 3:1 sul fondo). */
  readonly laminaBordo: string;
  readonly srgb: ColoriVec3;
  readonly lin: ColoriVec3;
  /** Costa delle strisce della sezione "La carta" (esagerata per leggersi), px CSS. */
  readonly spessoreStrisciaPx: number;
  /** Costa di un pezzo appoggiato (Per chi, prova del banco), px CSS. Uguale al GL. */
  readonly spessorePezzoPx: number;
  /** true solo per Grafite: inchiostro chiaro, color-scheme dark. */
  readonly scura: boolean;
}

/* ------------------------------------------------------------------------ */
/* Le quattro carte                                                          */
/* ------------------------------------------------------------------------ */

const CARTE_COLORI = {
  citrino: {
    id: 'citrino',
    fondo: '#E4CF3F',
    luce: '#F5E97E',
    ombra: '#9C8A1E',
    inchiostro: '#17231D',
    inchiostroVelato: '#505327',
    seccoFondo: '#D8C43A',
    costa: '#BCA92D',
    taglio: '#17231D',
    laminaBordo: '#17231D',
    srgb: {
      fondo: [0.89412, 0.81176, 0.24706],
      luce: [0.96078, 0.91373, 0.49412],
      ombra: [0.61176, 0.54118, 0.11765],
      inchiostro: [0.0902, 0.13725, 0.11373],
      seccoFondo: [0.84706, 0.76863, 0.22745],
      costa: [0.73725, 0.66275, 0.17647],
      taglio: [0.0902, 0.13725, 0.11373],
    },
    lin: {
      fondo: [0.77582, 0.62396, 0.04971],
      luce: [0.9131, 0.81485, 0.20864],
      ombra: [0.33245, 0.25415, 0.01298],
      inchiostro: [0.00857, 0.01681, 0.01229],
      seccoFondo: [0.68669, 0.55201, 0.04231],
      costa: [0.50289, 0.39676, 0.02624],
      taglio: [0.00857, 0.01681, 0.01229],
    },
  },
  cotone: {
    id: 'cotone',
    fondo: '#F1F1EE',
    luce: '#FFFFFF',
    ombra: '#B9BAB3',
    inchiostro: '#17231D',
    inchiostroVelato: '#545D58',
    seccoFondo: '#E8E8E5',
    costa: '#D2D3CE',
    taglio: '#E4CF3F',
    laminaBordo: '#17231D',
    srgb: {
      fondo: [0.9451, 0.9451, 0.93333],
      luce: [1, 1, 1],
      ombra: [0.72549, 0.72941, 0.70196],
      inchiostro: [0.0902, 0.13725, 0.11373],
      seccoFondo: [0.9098, 0.9098, 0.89804],
      costa: [0.82353, 0.82745, 0.80784],
      taglio: [0.89412, 0.81176, 0.24706],
    },
    lin: {
      fondo: [0.87962, 0.87962, 0.85499],
      luce: [1, 1, 1],
      ombra: [0.48515, 0.49102, 0.45079],
      inchiostro: [0.00857, 0.01681, 0.01229],
      seccoFondo: [0.80695, 0.80695, 0.78354],
      costa: [0.64448, 0.65141, 0.61721],
      taglio: [0.77582, 0.62396, 0.04971],
    },
  },
  cipria: {
    id: 'cipria',
    fondo: '#E8B9B3',
    luce: '#F7D8D3',
    ombra: '#A9776F',
    inchiostro: '#231518',
    inchiostroVelato: '#5A4343',
    seccoFondo: '#DEAEA8',
    costa: '#C5958E',
    taglio: '#2A2C2F',
    laminaBordo: '#231518',
    srgb: {
      fondo: [0.9098, 0.72549, 0.70196],
      luce: [0.96863, 0.84706, 0.82745],
      ombra: [0.66275, 0.46667, 0.43529],
      inchiostro: [0.13725, 0.08235, 0.09412],
      seccoFondo: [0.87059, 0.68235, 0.65882],
      costa: [0.77255, 0.58431, 0.55686],
      taglio: [0.16471, 0.17255, 0.18431],
    },
    lin: {
      fondo: [0.80695, 0.48515, 0.45079],
      luce: [0.93011, 0.68669, 0.65141],
      ombra: [0.39676, 0.18447, 0.15896],
      inchiostro: [0.01681, 0.0075, 0.00913],
      seccoFondo: [0.73046, 0.42327, 0.39157],
      costa: [0.55834, 0.30054, 0.2705],
      taglio: [0.02315, 0.02519, 0.02843],
    },
  },
  grafite: {
    id: 'grafite',
    fondo: '#2A2C2F',
    luce: '#44474B',
    ombra: '#141517',
    inchiostro: '#ECEBE6',
    inchiostroVelato: '#B6B6B3',
    seccoFondo: '#232528',
    costa: '#373A3D',
    taglio: '#E4CF3F',
    laminaBordo: '#A7AEB5',
    srgb: {
      fondo: [0.16471, 0.17255, 0.18431],
      luce: [0.26667, 0.27843, 0.29412],
      ombra: [0.07843, 0.08235, 0.0902],
      inchiostro: [0.92549, 0.92157, 0.90196],
      seccoFondo: [0.13725, 0.1451, 0.15686],
      costa: [0.21569, 0.22745, 0.23922],
      taglio: [0.89412, 0.81176, 0.24706],
    },
    lin: {
      fondo: [0.02315, 0.02519, 0.02843],
      luce: [0.05781, 0.06301, 0.07036],
      ombra: [0.007, 0.0075, 0.00857],
      inchiostro: [0.8388, 0.83077, 0.7913],
      seccoFondo: [0.01681, 0.0185, 0.02122],
      costa: [0.0382, 0.04231, 0.04667],
      taglio: [0.77582, 0.62396, 0.04971],
    },
  },
} as const;

const SPESSORI: Readonly<Record<CartaId, { striscia: number; pezzo: number }>> = {
  citrino: { striscia: 3, pezzo: 1 },
  cotone: { striscia: 6, pezzo: 1.8 },
  cipria: { striscia: 4, pezzo: 1.1 },
  grafite: { striscia: 5, pezzo: 1.3 },
};

export const CARTE: Readonly<Record<CartaId, TokenCarta>> = {
  citrino: { ...CARTE_COLORI.citrino, spessoreStrisciaPx: SPESSORI.citrino.striscia, spessorePezzoPx: SPESSORI.citrino.pezzo, scura: false },
  cotone: { ...CARTE_COLORI.cotone, spessoreStrisciaPx: SPESSORI.cotone.striscia, spessorePezzoPx: SPESSORI.cotone.pezzo, scura: false },
  cipria: { ...CARTE_COLORI.cipria, spessoreStrisciaPx: SPESSORI.cipria.striscia, spessorePezzoPx: SPESSORI.cipria.pezzo, scura: false },
  grafite: { ...CARTE_COLORI.grafite, spessoreStrisciaPx: SPESSORI.grafite.striscia, spessorePezzoPx: SPESSORI.grafite.pezzo, scura: true },
};

/** Carta di partenza (UX: Grafite se il sistema è in modo scuro e non c'è scelta salvata). */
export const CARTA_PREDEFINITA: CartaId = 'citrino';
export const CARTA_PREDEFINITA_SCURA: CartaId = 'grafite';

export function eCartaId(v: unknown): v is CartaId {
  return typeof v === 'string' && (CARTE_IDS as readonly string[]).includes(v);
}

/* ------------------------------------------------------------------------ */
/* Lamina argento (unico accento: marchio, prezzo, leva/bottone)            */
/* ------------------------------------------------------------------------ */

export const LAMINA = {
  base: '#C8CDD2',
  chiara: '#DDE1E5',
  scura: '#A7AEB5',
  riflesso: '#EEF1F3',
  profonda: '#7E868E',
  suLamina: '#17231D',
  srgb: {
    base: [0.78431, 0.80392, 0.82353],
    chiara: [0.86667, 0.88235, 0.89804],
    scura: [0.6549, 0.68235, 0.7098],
    riflesso: [0.93333, 0.9451, 0.95294],
    profonda: [0.49412, 0.52549, 0.55686],
    suLamina: [0.0902, 0.13725, 0.11373],
  },
  lin: {
    base: [0.57758, 0.6105, 0.64448],
    chiara: [0.72306, 0.75294, 0.78354],
    scura: [0.38643, 0.42327, 0.46208],
    riflesso: [0.85499, 0.87962, 0.89627],
    profonda: [0.20864, 0.2384, 0.2705],
    suLamina: [0.00857, 0.01681, 0.01229],
  },
} as const;

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Anybody variabile (wdth 50..150, wght 100..900, solo tondo) + Hanken
 * Grotesk 400/500/600 (è un variabile: Google serve un solo file).
 * Verificato il 25/09/2026: 200 da fonts.googleapis.com, woff2 latin
 * Anybody 57 KB, Hanken 35 KB.
 */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=Hanken+Grotesk:wght@400;500;600&display=swap';

export const FONT_PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'] as const;

export const FONT_FAMIGLIE = {
  display: 'Anybody',
  testo: 'Hanken Grotesk',
} as const;

/** Stack uguali a --imp-font-display / --imp-font-testo. */
export const FONT_STACK = {
  display: '"Anybody", "Impronta Anybody Ripiego", Arial, sans-serif',
  testo: '"Hanken Grotesk", "Impronta Hanken Ripiego", "Helvetica Neue", Arial, sans-serif',
} as const;

/**
 * Larghezze (asse wdth) che il canvas 2D sa disegnare: `ctx.fontStretch`
 * accetta solo parole chiave. Le parole premute (maschere del WebGL) usano
 * SOLO questi valori, così DOM e rilievo coincidono.
 */
export const CANVAS_STRETCH = {
  75: 'condensed',
  87.5: 'semi-condensed',
  100: 'normal',
  112.5: 'semi-expanded',
  125: 'expanded',
  150: 'extra-expanded',
} as const;

export type WdthCanvas = 75 | 87.5 | 100 | 112.5 | 125 | 150;

const STOP_CANVAS: readonly WdthCanvas[] = [75, 87.5, 100, 112.5, 125, 150];

/** Parola chiave `fontStretch` più vicina a un valore di wdth. */
export function stretchPerCanvas(wdth: number): (typeof CANVAS_STRETCH)[WdthCanvas] {
  let migliore: WdthCanvas = 100;
  let distanza = Number.POSITIVE_INFINITY;
  for (const s of STOP_CANVAS) {
    const d = Math.abs(s - wdth);
    if (d < distanza) {
      distanza = d;
      migliore = s;
    }
  }
  return CANVAS_STRETCH[migliore];
}

/**
 * Combinazioni da precaricare con `document.fonts.load()` prima di cuocere
 * le maschere (sintassi della proprietà `font`, stretch come parola chiave).
 */
export const FONT_DA_CARICARE = [
  'normal 900 100px "Anybody"',
  'expanded 900 100px "Anybody"',
  'extra-expanded 900 100px "Anybody"',
  'extra-expanded 800 100px "Anybody"',
  'semi-expanded 800 100px "Anybody"',
  'normal 800 100px "Anybody"',
  'normal 700 100px "Anybody"',
  '400 17px "Hanken Grotesk"',
  '500 17px "Hanken Grotesk"',
  '600 17px "Hanken Grotesk"',
] as const;

/** Metriche misurate dai file woff2 (frazioni dell'em). */
export const METRICHE = {
  anybody: { unitsPerEm: 2000, ascent: 0.795, descent: 0.24, capHeight: 0.675, xHeight: 0.593 },
  hanken: { unitsPerEm: 1000, ascent: 1, descent: 0.303, capHeight: 0.697, xHeight: 0.493 },
} as const;

/* ------------------------------------------------------------------------ */
/* Larghezza di Anybody: misure reali per stimare i corpi                   */
/* ------------------------------------------------------------------------ */

/**
 * Larghezza media di una lettera minuscola (em) su testo italiano, per peso
 * e larghezza. Misurata sui file veri. Utile per scegliere il corpo di un
 * testo che cambia (nomi del banco, parola campione) PRIMA che il DOM lo
 * misuri; la misura finale resta quella del DOM.
 */
export const ANYBODY_LETTERA_MEDIA: Readonly<Record<700 | 800 | 900, Readonly<Record<number, number>>>> = {
  700: { 75: 0.4482, 85: 0.5149, 90: 0.5482, 95: 0.5816, 100: 0.615, 110: 0.6816, 120: 0.7485, 130: 0.8153, 140: 0.882, 150: 0.9489 },
  800: { 75: 0.4826, 85: 0.548, 90: 0.5808, 95: 0.6134, 100: 0.6463, 110: 0.7117, 120: 0.7772, 130: 0.8427, 140: 0.9083, 150: 0.9738 },
  900: { 75: 0.5112, 85: 0.5754, 90: 0.6075, 95: 0.6398, 100: 0.6719, 110: 0.7364, 120: 0.8008, 130: 0.8654, 140: 0.9299, 150: 0.9943 },
};

/** Larghezza dello spazio (em), per peso e larghezza. */
export const ANYBODY_SPAZIO: Readonly<Record<700 | 800 | 900, Readonly<Record<number, number>>>> = {
  700: { 75: 0.172, 85: 0.206, 90: 0.223, 95: 0.24, 100: 0.257, 110: 0.29, 120: 0.324, 130: 0.357, 140: 0.392, 150: 0.425 },
  800: { 75: 0.177, 85: 0.21, 90: 0.227, 95: 0.243, 100: 0.26, 110: 0.293, 120: 0.326, 130: 0.359, 140: 0.392, 150: 0.425 },
  900: { 75: 0.181, 85: 0.214, 90: 0.23, 95: 0.246, 100: 0.263, 110: 0.295, 120: 0.328, 130: 0.36, 140: 0.393, 150: 0.425 },
};

/** "impronta" a wght 900 (em, senza tracking), per le larghezze usate dall'hero. */
export const IMPRONTA_EM_900: Readonly<Record<100 | 125 | 150, number>> = {
  100: 5.559,
  125: 6.899,
  150: 8.238,
};

function interpolaTabella(tab: Readonly<Record<number, number>>, wdth: number): number {
  const chiavi = Object.keys(tab)
    .map(Number)
    .sort((a, b) => a - b);
  const primo = chiavi[0] ?? 100;
  const ultimo = chiavi[chiavi.length - 1] ?? 100;
  const w = Math.min(ultimo, Math.max(primo, wdth));
  for (let i = 0; i < chiavi.length - 1; i += 1) {
    const a = chiavi[i] ?? primo;
    const b = chiavi[i + 1] ?? ultimo;
    if (w >= a && w <= b) {
      const va = tab[a] ?? 0;
      const vb = tab[b] ?? 0;
      const t = b === a ? 0 : (w - a) / (b - a);
      return va + (vb - va) * t;
    }
  }
  return tab[w] ?? 0;
}

function pesoVicino(wght: number): 700 | 800 | 900 {
  if (wght >= 850) return 900;
  if (wght >= 750) return 800;
  return 700;
}

/**
 * Stima la larghezza in em di un testo in Anybody (minuscolo o misto),
 * tracking incluso. Errore tipico ±4% su parole italiane.
 */
export function stimaLarghezzaEm(testo: string, wdth: number, wght: number, trackingEm = 0): number {
  const p = pesoVicino(wght);
  const lettera = interpolaTabella(ANYBODY_LETTERA_MEDIA[p], wdth);
  const spazio = interpolaTabella(ANYBODY_SPAZIO[p], wdth);
  let em = 0;
  for (const c of testo) em += c === ' ' ? spazio : lettera;
  return em + trackingEm * [...testo].length;
}

/**
 * Corpo (px) perché un testo su una riga riempia `larghezzaPx`, entro i
 * limiti dati. Per l'hero dopo l'invio (i nomi al posto di *impronta*).
 */
export function corpoPerRiempire(
  testo: string,
  larghezzaPx: number,
  wdth: number,
  wght: number,
  limiti: { min: number; max: number },
  trackingEm = TIPO.seccoHero.trackingEm,
): number {
  const em = stimaLarghezzaEm(testo, wdth, wght, trackingEm);
  if (em <= 0) return limiti.max;
  return Math.min(limiti.max, Math.max(limiti.min, larghezzaPx / em));
}

/* ------------------------------------------------------------------------ */
/* Scala tipografica numerica (uguale a tokens.css)                          */
/* ------------------------------------------------------------------------ */

export const VIEWPORT_MIN = 375;
export const VIEWPORT_MAX = 1440;

export type Famiglia = 'display' | 'testo';

export interface VoceTipo {
  readonly famiglia: Famiglia;
  /** Corpo a 375 px e a 1440 px di viewport (px CSS). null = calcolato dalla griglia. */
  readonly px: readonly [number, number] | null;
  /** Larghezza per breakpoint: sotto 600, 600-1023, da 1024. */
  readonly wdth: { readonly s: number; readonly m: number; readonly l: number };
  readonly wght: number;
  readonly interlinea: number;
  readonly trackingEm: number;
  /** La pressione pilota gli assi (solo parole a riga singola, classe .imp-pressa). */
  readonly pressa: boolean;
}

export const TIPO = {
  seccoHero: { famiglia: 'display', px: null, wdth: { s: 100, m: 125, l: 150 }, wght: 900, interlinea: 0.86, trackingEm: -0.01, pressa: true },
  seccoGrande: { famiglia: 'display', px: [32, 60], wdth: { s: 112.5, m: 112.5, l: 150 }, wght: 800, interlinea: 0.86, trackingEm: -0.01, pressa: true },
  titolo1: { famiglia: 'display', px: [30, 50], wdth: { s: 100, m: 100, l: 100 }, wght: 700, interlinea: 1.04, trackingEm: -0.012, pressa: false },
  titolo2: { famiglia: 'display', px: [30, 60], wdth: { s: 100, m: 100, l: 110 }, wght: 750, interlinea: 1, trackingEm: -0.012, pressa: false },
  titolo3: { famiglia: 'display', px: [22, 30], wdth: { s: 100, m: 100, l: 100 }, wght: 650, interlinea: 1.08, trackingEm: -0.005, pressa: false },
  nome: { famiglia: 'display', px: [20, 22], wdth: { s: 150, m: 150, l: 150 }, wght: 800, interlinea: 1, trackingEm: 0, pressa: false },
  prezzo: { famiglia: 'display', px: [28, 44], wdth: { s: 125, m: 125, l: 125 }, wght: 900, interlinea: 1, trackingEm: -0.01, pressa: false },
  marchio: { famiglia: 'display', px: [20, 20], wdth: { s: 150, m: 150, l: 150 }, wght: 800, interlinea: 1, trackingEm: 0.04, pressa: false },
  lead: { famiglia: 'testo', px: [18, 21], wdth: { s: 100, m: 100, l: 100 }, wght: 400, interlinea: 1.45, trackingEm: 0, pressa: false },
  corpo: { famiglia: 'testo', px: [17, 18], wdth: { s: 100, m: 100, l: 100 }, wght: 400, interlinea: 1.55, trackingEm: 0, pressa: false },
  piccolo: { famiglia: 'testo', px: [15, 16], wdth: { s: 100, m: 100, l: 100 }, wght: 400, interlinea: 1.5, trackingEm: 0.005, pressa: false },
  nota: { famiglia: 'testo', px: [14, 14], wdth: { s: 100, m: 100, l: 100 }, wght: 500, interlinea: 1.4, trackingEm: 0.005, pressa: false },
  bottone: { famiglia: 'testo', px: [17, 17], wdth: { s: 100, m: 100, l: 100 }, wght: 600, interlinea: 1.15, trackingEm: 0, pressa: false },
  leva: { famiglia: 'testo', px: [18, 18], wdth: { s: 100, m: 100, l: 100 }, wght: 600, interlinea: 1.15, trackingEm: 0, pressa: false },
  campo: { famiglia: 'testo', px: [17, 17], wdth: { s: 100, m: 100, l: 100 }, wght: 400, interlinea: 1.3, trackingEm: 0, pressa: false },
} as const satisfies Record<string, VoceTipo>;

export type NomeVoceTipo = keyof typeof TIPO;

/** Corpo in px di una voce a una data larghezza di viewport (stessa formula del clamp CSS). */
export function corpoFluido(voce: NomeVoceTipo, larghezzaViewport: number): number {
  const v: VoceTipo = TIPO[voce];
  if (v.px === null) return corpoHero(larghezzaViewport);
  const [min, max] = v.px;
  const t = (larghezzaViewport - VIEWPORT_MIN) / (VIEWPORT_MAX - VIEWPORT_MIN);
  return Math.min(max, Math.max(min, min + (max - min) * t));
}

/** Larghezza (wdth) di arrivo di una voce alla larghezza di viewport data. */
export function wdthPer(voce: NomeVoceTipo, larghezzaViewport: number): number {
  const v: VoceTipo = TIPO[voce];
  if (larghezzaViewport >= GRIGLIA.breakpoint.l) return v.wdth.l;
  if (larghezzaViewport >= GRIGLIA.breakpoint.m) return v.wdth.m;
  return v.wdth.s;
}

/* ------------------------------------------------------------------------ */
/* Pressione e assi                                                          */
/* ------------------------------------------------------------------------ */

export const PRESSIONE = {
  /** A pressione 0 la larghezza è l'80% di quella di arrivo (uguale allo `stringiMin` dello shader). */
  wdthRiposo: 0.8,
  /** Peso a pressione 0. */
  wghtRiposo: 700,
} as const;

/** Assi di Anybody per una pressione 0..1, dati i valori di arrivo. */
export function assiPressione(wdthArrivo: number, wghtArrivo: number, pressione: number): { wdth: number; wght: number } {
  const p = Math.min(1, Math.max(0, pressione));
  return {
    wdth: wdthArrivo * (PRESSIONE.wdthRiposo + (1 - PRESSIONE.wdthRiposo) * p),
    wght: PRESSIONE.wghtRiposo + (wghtArrivo - PRESSIONE.wghtRiposo) * p,
  };
}

/* ------------------------------------------------------------------------ */
/* Griglia da libro                                                          */
/* ------------------------------------------------------------------------ */

export const GRIGLIA = {
  breakpoint: { m: 600, l: 1024 },
  paginaMax: 1680,
  /** Unità del canone: 6% della pagina, tra 20 e 101 px. */
  u: { min: 20, quota: 0.06, max: 101 },
  margineMobile: 20,
  /** Canone 2:3:4:6 → interno 1u, testa 1,5u, esterno 2u, piede 3u. */
  rapporti: { interno: 1, testa: 1.5, esterno: 2, piede: 3 },
  testa: { min: 48, max: 128 },
  piede: { min: 96, max: 240 },
  colonne: { s: 4, m: 8, l: 12 },
  canalino: { s: 21, m: 22, l: 24 },
  giustezzaCh: 62,
  giustezzaStrettaCh: 44,
} as const;

export interface Margini {
  interno: number;
  esterno: number;
  testa: number;
  piede: number;
  areaViva: number;
  colonne: number;
  canalino: number;
  colonna: number;
}

/** Stessi margini di tokens.css per una larghezza di viewport (px CSS). */
export function margini(larghezzaViewport: number): Margini {
  const vw = Math.min(larghezzaViewport, GRIGLIA.paginaMax);
  const u = Math.min(GRIGLIA.u.max, Math.max(GRIGLIA.u.min, vw * GRIGLIA.u.quota));
  const libro = larghezzaViewport >= GRIGLIA.breakpoint.m;
  const interno = libro ? u : GRIGLIA.margineMobile;
  const esterno = libro ? u * GRIGLIA.rapporti.esterno : GRIGLIA.margineMobile;
  const testa = Math.min(GRIGLIA.testa.max, Math.max(GRIGLIA.testa.min, u * GRIGLIA.rapporti.testa));
  const piede = Math.min(GRIGLIA.piede.max, Math.max(GRIGLIA.piede.min, u * GRIGLIA.rapporti.piede));
  const chiave = larghezzaViewport >= GRIGLIA.breakpoint.l ? 'l' : libro ? 'm' : 's';
  const colonne = GRIGLIA.colonne[chiave];
  const canalino = GRIGLIA.canalino[chiave];
  const areaViva = vw - interno - esterno;
  const colonna = (areaViva - (colonne - 1) * canalino) / colonne;
  return { interno, esterno, testa, piede, areaViva, colonne, canalino, colonna };
}

/** Corpo della parola dell'hero (px): "impronta" riempie l'area viva. */
export function corpoHero(larghezzaViewport: number): number {
  const w = wdthPer('seccoHero', larghezzaViewport) as 100 | 125 | 150;
  const em = IMPRONTA_EM_900[w] + TIPO.seccoHero.trackingEm * 8;
  return margini(larghezzaViewport).areaViva / em;
}

/* ------------------------------------------------------------------------ */
/* Luce (solo per il fallback CSS: la luce dello shader è del webgl-artist) */
/* ------------------------------------------------------------------------ */

/** Luce di riposo: in alto a sinistra, radente. */
export const LUCE_RIPOSO = { azimut: 135, elevazione: 22 } as const;

/**
 * Vettore unitario verso la luce in coordinate schermo (x a destra, y in
 * basso), da scrivere in --imp-luce-x / --imp-luce-y. Azimut in gradi,
 * 0 = da destra, 90 = dall'alto, 135 = dall'alto a sinistra.
 */
export function vettoreLuce(azimutGradi: number): { x: number; y: number } {
  const a = (azimutGradi * Math.PI) / 180;
  return { x: Math.cos(a), y: -Math.sin(a) };
}

/* ------------------------------------------------------------------------ */
/* Livelli                                                                   */
/* ------------------------------------------------------------------------ */

export const Z = {
  canvas: 0,
  contenuto: 1,
  testata: 10,
  onda: 20,
} as const;

/* ------------------------------------------------------------------------ */
/* Utilità colore (pure)                                                     */
/* ------------------------------------------------------------------------ */

/** "#RRGGBB" → vec3 sRGB 0..1. */
export function hexASrgb(hex: string): Vec3 {
  const h = hex.replace('#', '');
  const n = Number.parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  if (Number.isNaN(n)) return [0.5, 0.5, 0.5];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Canale sRGB 0..1 → lineare. */
export function srgbALineare(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** "#RRGGBB" → vec3 lineare. */
export function hexALineare(hex: string): Vec3 {
  const [r, g, b] = hexASrgb(hex);
  return [srgbALineare(r), srgbALineare(g), srgbALineare(b)];
}

/** Rapporto di contrasto WCAG 2.x tra due colori hex. */
export function contrasto(hexA: string, hexB: string): number {
  const lum = (hex: string): number => {
    const [r, g, b] = hexALineare(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(hexA);
  const b = lum(hexB);
  const [chiaro, scuro] = a > b ? [a, b] : [b, a];
  return (chiaro + 0.05) / (scuro + 0.05);
}
