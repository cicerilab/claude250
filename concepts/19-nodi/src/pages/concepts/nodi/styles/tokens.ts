/**
 * NODI · design tokens per TypeScript e WebGL (art-director)
 *
 * Specchio numerico di `tokens.css`: stessi colori, stesse misure. Se cambi
 * un valore qui, cambialo anche là (e viceversa). La tabella dei contrasti in
 * `docs/art-director.md` è calcolata su questi hex con lo script in appendice.
 *
 * File puro: nessun import, nessun accesso a window/document a livello di
 * modulo (il sito fa prerender). Le funzioni sotto sono matematica pura.
 *
 * Colori in tre forme:
 * - `hex`  "#RRGGBB", per CSS e per il canvas 2D (maschera, atlante, poster);
 * - `srgb` vec3 0..1 non linearizzato, per confronti al byte con il fondo CSS
 *          (il canvas deve combaciare al pixel con l'abete della pagina);
 * - `lin`  vec3 lineare (IEC 61966-2-1), per chi scrive colori direttamente
 *          in uniform o attributi quando il renderer lavora in spazio lineare.
 * Con three 0.160 la strada più semplice è `new Color(PALETTE.abete.hex)`:
 * `Color` converte da sRGB a lineare da solo (ColorManagement attivo).
 */

/* ------------------------------------------------------------------------ */
/* Tipi                                                                      */
/* ------------------------------------------------------------------------ */

export type Vec3 = readonly [number, number, number];

export const COLORI_IDS = [
  'abete',
  'abeteScuro',
  'abeteVena',
  'te',
  'teChiaro',
  'vernice',
  'ebano',
  'assi',
  'tacca',
  'cuscinetto',
  'ombra',
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
 * Quattro materiali del gesto (abete, tè, vernice, ebano) più i derivati.
 * I derivati con alfa sono già composti su abete (o su abete scuro per gli
 * assi): nel GL si usano questi valori pieni, così il canvas e il DOM hanno
 * lo stesso colore senza dipendere dal blending.
 */
export const PALETTE: Readonly<Record<IdColore, TokenColore>> = {
  abete: {
    hex: '#E6D4AC',
    srgb: [0.90196, 0.83137, 0.67451],
    lin: [0.7913, 0.65837, 0.41254],
    css: '--nod-abete',
    ruolo: 'La tavola e il banco: fondo di tutta la pagina, colore base della tavola nello shader, testo sul bottone ebano',
  },
  abeteScuro: {
    hex: '#DCC593',
    srgb: [0.86275, 0.77255, 0.57647],
    lin: [0.71569, 0.55834, 0.29177],
    css: '--nod-abete-scuro',
    ruolo: 'Abete in ombra: fondo del piano del suono, fondo del campo a fuoco',
  },
  abeteVena: {
    hex: '#D6BF8E',
    srgb: [0.83922, 0.74902, 0.55686],
    lin: [0.67244, 0.521, 0.2705],
    css: '--nod-abete-vena',
    ruolo: 'Solo le righe della vena nello shader della tavola; mai nel DOM',
  },
  te: {
    hex: '#3B2B1D',
    srgb: [0.23137, 0.16863, 0.11373],
    lin: [0.04374, 0.02416, 0.01229],
    css: '--nod-te',
    ruolo: 'Foglie di tè: testo di lettura, link, righello, bordi dei campi, foglia del piano, tono scuro delle foglie',
  },
  teChiaro: {
    hex: '#5D4D3A',
    srgb: [0.36471, 0.30196, 0.22745],
    lin: [0.10946, 0.07421, 0.04231],
    css: '--nod-te-chiaro',
    ruolo: 'Tè all 80 % su abete: secondo tono delle foglie nell atlante (mai testo)',
  },
  vernice: {
    hex: '#8B3A1D',
    srgb: [0.5451, 0.22745, 0.11373],
    lin: [0.25818, 0.04231, 0.01229],
    css: '--nod-vernice',
    ruolo: 'Vernice a olio: SOLO cifre (Hz, euro, mesi, posto in lista), cursore del righello, tacca "la tua voce", segno di errore. Mai fondi, mai bottoni, mai titoli, mai nel GL',
  },
  ebano: {
    hex: '#16120F',
    srgb: [0.08627, 0.07059, 0.05882],
    lin: [0.00802, 0.00605, 0.00478],
    css: '--nod-ebano',
    ruolo: 'Ebano: titoli IM Fell, bottone principale, contorno della tavola (1 px a DPR 1), segni dei modi trovati, anello di fuoco',
  },
  assi: {
    hex: '#7C6B53',
    srgb: [0.48627, 0.41961, 0.32549],
    lin: [0.20156, 0.14703, 0.0865],
    css: '--nod-assi',
    ruolo: 'Tè al 62 % su abete scuro: i due assi del piano del suono (3,04:1)',
  },
  tacca: {
    hex: '#7F6F56',
    srgb: [0.49804, 0.43529, 0.33725],
    lin: [0.21223, 0.15896, 0.09306],
    css: '--nod-tacca',
    ruolo: 'Tè al 60 % su abete: tacche ogni 10 Hz del righello (3,34:1)',
  },
  cuscinetto: {
    hex: '#B2A485',
    srgb: [0.69804, 0.64314, 0.52157],
    lin: [0.4452, 0.37124, 0.23455],
    css: '--nod-cuscinetto',
    ruolo: 'Ebano al 25 % su abete: i quattro cuscinetti di gommapiuma nel GL (colore pieno, senza alfa)',
  },
  ombra: {
    hex: '#C4B28F',
    srgb: [0.76863, 0.69804, 0.56078],
    lin: [0.55201, 0.4452, 0.27468],
    css: '--nod-ombra',
    ruolo: 'Tè al 20 % su abete: colore pieno dell ombra della tavola al centro (nello shader si sfuma verso abete)',
  },
};

/** Alfa fisse del sistema (stesse di tokens.css). */
export const ALFA = {
  /** Ombra della tavola sul banco (tinta di tè). */
  ombra: 0.2,
  /** Cuscinetti di gommapiuma (ebano). */
  cuscinetto: 0.25,
  /** Assi del piano del suono (tè su abete scuro). */
  assi: 0.62,
  /** Tacche minori del righello (tè su abete). */
  tacca: 0.6,
  /** Secondo tono delle foglie (tè su abete). */
  fogliaChiara: 0.8,
  /** Pannello del menu a comparsa. */
  veloMenu: 0.98,
} as const;

/* ------------------------------------------------------------------------ */
/* Colori della scena (per webgl-artist e shader-engineer)                   */
/* ------------------------------------------------------------------------ */

/**
 * Cosa usa la scena, per nome. Il canvas ha `alpha: true` e sotto c'è il fondo
 * CSS abete: fuori dal contorno il frammento è trasparente, dentro è abete con
 * la vena. I toni delle foglie sono due e non cambiano mai (CD §4.3).
 */
export const SCENA = {
  /** Fondo CSS sotto il canvas; clear color se mai servisse un fondo opaco. */
  fondo: PALETTE.abete,
  /** Colore base della tavola dentro il contorno. */
  tavola: PALETTE.abete,
  /** Righe della vena, mescolate a `tavola` con VENA.contrasto. */
  vena: PALETTE.abeteVena,
  /** Linea della giunta al centro (stesso colore della vena, più netta). */
  giunta: PALETTE.abeteVena,
  /** Contorno della tavola, 1 px a DPR 1. */
  contorno: PALETTE.ebano,
  /** Ombra al centro, sfumata verso `fondo` in OMBRA.sfocaturaMm. */
  ombra: PALETTE.ombra,
  /** Foglie: due toni, scelti per istanza, fissi. */
  foglia: [PALETTE.te, PALETTE.teChiaro] as const,
  /** Ombra portata minima delle foglie: tè, con questa alfa sul secondo campione. */
  fogliaOmbraAlfa: 0.22,
  /** Cuscinetti di gommapiuma (colore pieno). */
  cuscinetto: PALETTE.cuscinetto,
} as const;

/** Vena dell'abete tagliato di quarto (parametri per lo shader, in mm). */
export const VENA = {
  /** Distanza tra due righe al centro della tavola. */
  passoMm: 1.4,
  /** Distanza verso i fianchi (anelli più larghi). */
  passoFiancoMm: 2.2,
  /** 0 = abete piatto, 1 = righe al colore pieno di `vena`. */
  contrasto: 0.55,
  /** Ondulazione delle righe (rumore procedurale, ampiezza relativa). */
  rumore: 0.18,
  /** Spessore della linea della giunta. */
  giuntaMm: 0.25,
} as const;

/** Ombra della tavola sul banco (una sola ombra in tutto il sito). */
export const OMBRA = {
  alfa: ALFA.ombra,
  sfocaturaMm: 9,
  spostamentoMm: [0, 3] as const,
  /** Equivalente CSS per il poster e per i fermi (tokens.css: --nod-ombra-tavola). */
  css: '0 10px 28px rgb(59 43 29 / 0.2)',
} as const;

/* ------------------------------------------------------------------------ */
/* Font                                                                      */
/* ------------------------------------------------------------------------ */

/**
 * URL di Google Fonts (core/fonts.ts lo inietta al mount). Niente `ital`:
 * il corsivo di IM Fell non si usa mai. Spline Sans variabile 300..600.
 */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=IM+Fell+DW+Pica&family=Spline+Sans:wght@300..600&display=swap';

/** Per `fontsReady()`: le tre facce che devono essere pronte prima del GL. */
export const FONT_DA_CARICARE = [
  '400 48px "IM Fell DW Pica"',
  '400 17px "Spline Sans"',
  '500 40px "Spline Sans"',
] as const;

export const FONT = {
  fell: '"IM Fell DW Pica", "Nod Fell Ripiego", "Times New Roman", serif',
  spline: '"Spline Sans", "Nod Spline Ripiego", Arial, sans-serif',
} as const;

/**
 * Scala tipografica: [min a 375 px, max a 1440 px], lineare in mezzo.
 * Stessi numeri delle clamp() di tokens.css. `famiglia` dice quale font.
 */
export interface StileTesto {
  readonly famiglia: 'fell' | 'spline';
  readonly px: readonly [number, number];
  readonly peso: 300 | 400 | 500 | 600;
  readonly interlinea: number;
  readonly tabulare?: boolean;
}

export const TIPO = {
  h1: { famiglia: 'fell', px: [34, 52], peso: 400, interlinea: 1.08 },
  h2: { famiglia: 'fell', px: [32, 56], peso: 400, interlinea: 1.05 },
  h3: { famiglia: 'fell', px: [24, 28], peso: 400, interlinea: 1.15 },
  marchio: { famiglia: 'fell', px: [28, 40], peso: 400, interlinea: 1 },
  marchio2: { famiglia: 'fell', px: [18, 18], peso: 400, interlinea: 1.2 },
  radio: { famiglia: 'fell', px: [24, 24], peso: 400, interlinea: 1.2 },
  valore: { famiglia: 'spline', px: [24, 44], peso: 500, interlinea: 1, tabulare: true },
  cifra: { famiglia: 'spline', px: [24, 32], peso: 500, interlinea: 1, tabulare: true },
  lead: { famiglia: 'spline', px: [17, 19], peso: 400, interlinea: 1.5 },
  corpo: { famiglia: 'spline', px: [17, 17], peso: 400, interlinea: 1.55 },
  piccolo: { famiglia: 'spline', px: [15, 15], peso: 400, interlinea: 1.5 },
  nota: { famiglia: 'spline', px: [13, 13], peso: 400, interlinea: 1.45 },
  scala: { famiglia: 'spline', px: [11, 12], peso: 500, interlinea: 1, tabulare: true },
  modo: { famiglia: 'spline', px: [12, 14], peso: 500, interlinea: 1.2 },
  bottone: { famiglia: 'spline', px: [17, 17], peso: 500, interlinea: 1 },
  campo: { famiglia: 'spline', px: [17, 17], peso: 400, interlinea: 1.3 },
  etichetta: { famiglia: 'spline', px: [15, 15], peso: 500, interlinea: 1.25 },
} as const satisfies Record<string, StileTesto>;
export type IdStileTesto = keyof typeof TIPO;

/** Dimensione in px di uno stile a una data larghezza di finestra (stessa curva del CSS). */
export function pxA(stile: StileTesto, larghezzaFinestra: number): number {
  const [min, max] = stile.px;
  if (max === min) return min;
  const t = Math.min(1, Math.max(0, (larghezzaFinestra - 375) / (1440 - 375)));
  return min + (max - min) * t;
}

/* ------------------------------------------------------------------------ */
/* Misure di layout (stesse di tokens.css)                                   */
/* ------------------------------------------------------------------------ */

export const MISURE = {
  /** Punto di rottura del layout largo (con rapporto ≥ 5:4, core/viewport.ts). */
  largoMin: 1100,
  /** Sopra questa larghezza c'è anche la colonna del banco. */
  bancoMin: 1200,
  bordo: 20,
  bordoLargo: 72,
  lettura: { min: 320, vw: 26.7, max: 440 },
  tavolaAltezzaSvh: 86,
  tavolaAltezzaMaxPx: 1000,
  /** Riquadro con l'ombra, in mm (il vector-artist può correggerlo in assets/svg/index.ts). */
  riquadroMm: { w: 240, h: 388 },
  corniceSvh: 54,
  corniceMinSvh: 34,
  corniceAperturaMinSvh: 38,
  regoloH: 56,
  bancoW: 164,
  ritornoZona: 72,
  ritornoScroll: 88,
  fotoW: 360,
  pianoLato: 320,
  pianoCentro: 0.18,
  tocco: 44,
  bottoneH: 52,
  campoH: 48,
  indiceRiga: 40,
  cursoreSegno: 16,
  cursoreSpessore: 2,
  taccaL: 8,
  taccaCifraL: 14,
  binario: 1,
  filo: 1,
  filoForte: 2,
  fogliaPiano: 28,
  /** DPR massimo del canvas (tech-architect §10). */
  dprMax: { largo: 2, stretto: 1.5 },
} as const;

/** Misura minima delle foglie a schermo, in px sul lato lungo (trend R4). */
export const FOGLIE_SCHERMO = {
  /** Lunghezza reale in mm delle scaglie (atlante). */
  lunghezzaMm: [1.5, 3] as const,
  /** Sotto questa misura a schermo la scala delle foglie si esagera. */
  minPx: 4,
  /** Fattore massimo di esagerazione (su stretto circa 2×). */
  esagerazioneMax: 2.2,
} as const;

/** Tempi di dissolvenza usati dal CSS (le curve definitive sono del motion-designer). */
export const TEMPI = {
  dissolvenzaTesto: 200,
  dissolvenzaModo: 300,
  dissolvenzaFermo: 400,
  caduta: 1200,
} as const;

export const LIVELLI = {
  palco: 0,
  testo: 1,
  regolo: 2,
  testata: 10,
  menu: 11,
} as const;

/* ------------------------------------------------------------------------ */
/* Utilità pure                                                              */
/* ------------------------------------------------------------------------ */

/** "#RRGGBB" → [r, g, b] in 0..1 (sRGB). */
export function hexAVec3(hex: string): Vec3 {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** sRGB 0..1 → lineare (IEC 61966-2-1). */
export function sRGBALineare(v: number): number {
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** Vec3 sRGB → Vec3 lineare. */
export function vec3Lineare(c: Vec3): Vec3 {
  return [sRGBALineare(c[0]), sRGBALineare(c[1]), sRGBALineare(c[2])];
}

/** Colore composto: `fg` con alfa `a` sopra `bg`, in sRGB (come fa il CSS). */
export function componi(fg: Vec3, a: number, bg: Vec3): Vec3 {
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
}

/** Rapporto di contrasto WCAG 2.x tra due colori sRGB. */
export function contrasto(a: Vec3, b: Vec3): number {
  const l = (c: Vec3) => {
    const [r, g, bl] = vec3Lineare(c);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [l(a), l(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}
