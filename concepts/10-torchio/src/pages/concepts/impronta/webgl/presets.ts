/**
 * IMPRONTA · preset del materiale (webgl-artist)
 *
 * Qui vivono SOLO numeri di materiale: quanto affonda una tecnica, quanto è
 * morbido lo smusso, quanto si vede la fibra di una carta, dove sta la luce.
 * I COLORI delle carte e della lamina non stanno qui: arrivano da
 * `styles/tokens.ts` (art-director) e passano per `paletteCarta()`.
 *
 * Unità usate in tutto il file:
 * - `em`  = frazione del corpo del testo premuto (font-size in px CSS);
 * - `px`  = pixel CSS (a DPR 1). Chi scrive gli uniform moltiplica per il DPR.
 * - angoli in gradi nelle API, in radianti negli uniform.
 *
 * Il file è puro: nessun accesso a window/document, nessun import di three.
 */

/* ------------------------------------------------------------------------- */
/* Tecniche                                                                   */
/* ------------------------------------------------------------------------- */

/**
 * Tecniche che lo shader sa rendere.
 * - `secco`       stampa a secco: solo solco, niente inchiostro;
 * - `colore`      a un colore: solco + inchiostro opaco che riempie il fondo;
 * - `lamina`      lamina a caldo argento: solco basso + metallo satinato;
 * - `cordonatura` riga di piega: canale largo e tondo, senza spigolo.
 * Le prime tre coincidono con `ReliefSpec['tecnica']`; `cordonatura` è
 * un'aggiunta richiesta nel documento `docs/webgl-artist.md`.
 */
export type TecnicaGL = 'secco' | 'colore' | 'lamina' | 'cordonatura';

/** Indice della tecnica negli uniform (uBlockB non lo porta: serve alla cottura). */
export const ORDINE_TECNICHE: readonly TecnicaGL[] = ['secco', 'colore', 'lamina', 'cordonatura'];

export interface PresetTecnica {
  /** Valore del canale R (altezza) che la forma scrive nella maschera, 0..1. */
  altezza: number;
  /** La forma scrive anche il canale G (inchiostro). */
  inchiostro: boolean;
  /** La forma scrive anche il canale B (lamina). */
  lamina: boolean;
  /** Profondità del solco a pressione 1 e `profondita` 1, in em del corpo. */
  profonditaEm: number;
  /** Limiti della profondità in px CSS (i corpi piccoli non spariscono, quelli enormi non diventano plastilina). */
  profonditaMinPx: number;
  profonditaMaxPx: number;
  /**
   * Tre raggi (sigma gaussiana) dello smusso a gradini, in em.
   * r1 = spigolo del piombo, r2 = spalla, r3 = coda nella carta.
   */
  smussoEm: readonly [number, number, number];
  /** Limite inferiore di r1 e superiore di r3, in px CSS. */
  smussoMinPx: number;
  smussoMaxPx: number;
  /**
   * Profilo del solco: pesi dei tre blur (sommano a 1) e quarto valore =
   * "cuscinetto", la carta spostata che si gonfia appena attorno al solco.
   */
  profilo: readonly [number, number, number, number];
  /** Sigma della sfumatura dell'inchiostro (bordo che beve nella fibra), px CSS. */
  inchiostroSfumaPx: number;
  /** Larghezza orizzontale del rilievo a pressione 0 (la maschera è cotta allo stato finale). */
  stringiMin: number;
}

/**
 * Valori tarati per "foto di bottega con luce radente", non per "demo":
 * solchi di 1-4 px, ombre corte, spigolo netto ma non tagliente.
 * Riferimento: a corpo 160 px il secco affonda circa 2,9 px.
 */
export const PRESET_TECNICA: Readonly<Record<TecnicaGL, PresetTecnica>> = {
  // Giro 2 (giuria): solco più profondo e spigolo netto. r1 resta sotto il
  // px anche nei corpi grandi ("niente blur oltre 1 px nello smusso"), il
  // peso del profilo sta quasi tutto su r1: parete ripida, fondo piatto.
  secco: {
    altezza: 1,
    inchiostro: false,
    lamina: false,
    profonditaEm: 0.02,
    profonditaMinPx: 1.2,
    profonditaMaxPx: 5,
    smussoEm: [0.0028, 0.006, 0.013],
    smussoMinPx: 0.35,
    smussoMaxPx: 3.2,
    profilo: [0.72, 0.2, 0.08, 0.1],
    inchiostroSfumaPx: 0.4,
    stringiMin: 0.8,
  },
  colore: {
    altezza: 0.85,
    inchiostro: true,
    lamina: false,
    profonditaEm: 0.016,
    profonditaMinPx: 1,
    profonditaMaxPx: 4,
    smussoEm: [0.0025, 0.0055, 0.012],
    smussoMinPx: 0.35,
    smussoMaxPx: 3,
    profilo: [0.72, 0.2, 0.08, 0.08],
    inchiostroSfumaPx: 0.4,
    stringiMin: 0.8,
  },
  lamina: {
    altezza: 0.8,
    inchiostro: false,
    lamina: true,
    profonditaEm: 0.014,
    profonditaMinPx: 1,
    profonditaMaxPx: 3.5,
    smussoEm: [0.0022, 0.005, 0.011],
    smussoMinPx: 0.35,
    smussoMaxPx: 2.8,
    profilo: [0.75, 0.18, 0.07, 0.06],
    inchiostroSfumaPx: 0.4,
    stringiMin: 0.8,
  },
  cordonatura: {
    altezza: 1,
    inchiostro: false,
    lamina: false,
    profonditaEm: 0.06,
    profonditaMinPx: 1.4,
    profonditaMaxPx: 3.5,
    smussoEm: [0.025, 0.05, 0.085],
    smussoMinPx: 0.8,
    smussoMaxPx: 5,
    profilo: [0.2, 0.35, 0.45, 0.25],
    inchiostroSfumaPx: 0.4,
    stringiMin: 1,
  },
};

/** Corpo convenzionale per forme senza testo (svg, cordonature), px CSS. */
export const CORPO_DEFAULT_PX = 40;

/** Accetta anche valori sconosciuti e ripiega sul secco (difesa da dati sporchi). */
export function tecnicaGL(valore: string | undefined | null): TecnicaGL {
  if (valore === 'colore' || valore === 'lamina' || valore === 'cordonatura' || valore === 'secco') {
    return valore;
  }
  return 'secco';
}

/**
 * Raggi dello smusso in texel della maschera, più il raggio dell'inchiostro.
 * `scala` = texel per px CSS usati nella cottura (di solito min(dpr, 1.5)).
 * Ritorna [r1, r2, r3, rInchiostro] pronti per `uRaggi` del blur.
 */
export function raggiSmusso(
  tecnica: TecnicaGL,
  corpoPx: number,
  scala: number,
): [number, number, number, number] {
  const p = PRESET_TECNICA[tecnica];
  const corpo = corpoPx > 0 ? corpoPx : CORPO_DEFAULT_PX;
  const r1 = Math.max(p.smussoMinPx, p.smussoEm[0] * corpo);
  const r2 = Math.max(r1 * 1.4, p.smussoEm[1] * corpo);
  const r3 = Math.min(p.smussoMaxPx, Math.max(r2 * 1.4, p.smussoEm[2] * corpo));
  return [r1 * scala, r2 * scala, r3 * scala, p.inchiostroSfumaPx * scala];
}

/**
 * Margine da lasciare attorno alla forma nella maschera, in px CSS, perché il
 * blur più largo e il cuscinetto non vengano tagliati dal bordo dello slot.
 * 2,6 sigma coprono il 99% della gaussiana.
 */
export function margineMaschera(tecnica: TecnicaGL, corpoPx: number): number {
  const [, , r3] = raggiSmusso(tecnica, corpoPx, 1);
  return Math.ceil(r3 * 2.6 + 2);
}

/** Profondità del solco in px CSS a pressione 1. */
export function profonditaPx(tecnica: TecnicaGL, corpoPx: number, profondita: number): number {
  const p = PRESET_TECNICA[tecnica];
  const corpo = corpoPx > 0 ? corpoPx : CORPO_DEFAULT_PX;
  const base = Math.min(p.profonditaMaxPx, Math.max(p.profonditaMinPx, p.profonditaEm * corpo));
  return base * clamp01(profondita);
}

/* ------------------------------------------------------------------------- */
/* Carte                                                                      */
/* ------------------------------------------------------------------------- */

/** Stesse chiavi di `Carta` dello store; qui ridichiarata per non dipendere dallo store. */
export type CartaGL = 'citrino' | 'cotone' | 'cipria' | 'grafite';

/** Indice della carta negli uniform (`uCarte`, `uBlockA.w`, `uCarteAttive`). */
export const ORDINE_CARTE: readonly CartaGL[] = ['citrino', 'cotone', 'cipria', 'grafite'];

export function indiceCarta(carta: CartaGL | undefined | null): number {
  if (!carta) return -1;
  const i = ORDINE_CARTE.indexOf(carta);
  return i;
}

export interface PresetCarta {
  /** Grammatura, solo documentale e per lo spessore. */
  grammatura: number;
  /** Moltiplicatore della fibra (micro rilievo e macchie di formazione), 1 = carta media. */
  fibra: number;
  /** Quanto le facce illuminate vanno verso il colore "luce" della carta, 0..1. */
  luceForza: number;
  /** Quanto le facce in ombra e le ombre portate vanno verso il colore "ombra", 0..1. */
  ombraForza: number;
  /** Quanto l'inchiostro beve nella fibra (bordo irregolare), 0..1. */
  assorbimento: number;
  /** Spessore visibile della costa di un pezzo appoggiato sul foglio, px CSS. */
  spessorePx: number;
}

/**
 * Taratura carta per carta.
 * - Cotone: fibra più visibile, beve di più, costa più spessa (600 g).
 * - Grafite: fondo scuro, la fibra si vede meno e l'ombra deve lavorare di più
 *   per staccare il solco dal fondo.
 */
export const PRESET_CARTA: Readonly<Record<CartaGL, PresetCarta>> = {
  citrino: { grammatura: 300, fibra: 1, luceForza: 1, ombraForza: 1, assorbimento: 0.5, spessorePx: 1 },
  cotone: { grammatura: 600, fibra: 1.25, luceForza: 1, ombraForza: 1, assorbimento: 0.7, spessorePx: 1.8 },
  cipria: { grammatura: 350, fibra: 1.05, luceForza: 1, ombraForza: 1, assorbimento: 0.55, spessorePx: 1.1 },
  grafite: { grammatura: 400, fibra: 0.7, luceForza: 0.95, ombraForza: 1, assorbimento: 0.4, spessorePx: 1.3 },
};

/** Colore in sRGB 0..1. Lo shader lavora in sRGB perché la carta piatta deve uguagliare al byte il CSS. */
export type RGB = [number, number, number];

/** I quattro colori di una carta come arrivano dai token (hex "#RRGGBB" oppure vec3 0..1). */
export interface ColoriCartaToken {
  fondo: string | readonly number[];
  luce: string | readonly number[];
  ombra: string | readonly number[];
  inchiostro: string | readonly number[];
}

export interface PaletteCarta {
  fondo: RGB;
  luce: RGB;
  ombra: RGB;
  inchiostro: RGB;
}

/** "#RGB" o "#RRGGBB" → sRGB 0..1. Valori non validi diventano grigio medio (visibile, non nero). */
export function hexARgb(hex: string): RGB {
  const h = hex.trim().replace(/^#/, '');
  const pieno = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(pieno)) return [0.5, 0.5, 0.5];
  const n = parseInt(pieno, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function aRgb(v: string | readonly number[]): RGB {
  if (typeof v === 'string') return hexARgb(v);
  const r = v[0] ?? 0.5;
  const g = v[1] ?? 0.5;
  const b = v[2] ?? 0.5;
  // Accetta sia 0..1 sia 0..255.
  const scala = r > 1 || g > 1 || b > 1 ? 1 / 255 : 1;
  return [r * scala, g * scala, b * scala];
}

/** Converte i colori di una carta dai token (qualunque delle due forme) in palette per lo shader. */
export function paletteCarta(token: ColoriCartaToken): PaletteCarta {
  return {
    fondo: aRgb(token.fondo),
    luce: aRgb(token.luce),
    ombra: aRgb(token.ombra),
    inchiostro: aRgb(token.inchiostro),
  };
}

/* ------------------------------------------------------------------------- */
/* Luce                                                                       */
/* ------------------------------------------------------------------------- */

/**
 * Luce radente. Azimut in gradi, 0 = da destra, 90 = dall'alto, 135 = dall'alto
 * a sinistra (come le ombre del fallback CSS). Elevazione in gradi sopra il foglio.
 */
export const LUCE = {
  azimutRiposo: 135,
  elevazioneRiposo: 22,
  elevazioneMin: 18,
  elevazioneMax: 25,
  /** Semiarco consentito attorno a 135°: la lampada si sposta a mano, non gira attorno al foglio. */
  semiarco: 55,
  /**
   * Giro 2: elevazione che lo shader usa davvero. `runtime.light` resta nella
   * scala dell'interazione (18-25°, riposo 22°, anche per il fallback CSS);
   * `elevazioneShader()` la porta in 12-18°, riposo 15,4°: luce più radente,
   * senza toccare light.ts né il contratto con lo shader-engineer.
   */
  elevazioneShaderMin: 12,
  elevazioneShaderMax: 18,
} as const;

/** Elevazione dell'interazione (18-25°) → elevazione radente dello shader (12-18°). */
export function elevazioneShader(elevazioneGradi: number): number {
  const t = (elevazioneGradi - LUCE.elevazioneMin) / (LUCE.elevazioneMax - LUCE.elevazioneMin);
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return LUCE.elevazioneShaderMin + c * (LUCE.elevazioneShaderMax - LUCE.elevazioneShaderMin);
}

/** Limita azimut ed elevazione ai valori da bottega. */
export function limitaLuce(azimutGradi: number, elevazioneGradi: number): [number, number] {
  let d = ((azimutGradi - LUCE.azimutRiposo + 540) % 360) - 180;
  d = Math.max(-LUCE.semiarco, Math.min(LUCE.semiarco, d));
  const el = Math.max(LUCE.elevazioneMin, Math.min(LUCE.elevazioneMax, elevazioneGradi));
  return [LUCE.azimutRiposo + d, el];
}

/**
 * Direzione verso la luce nello spazio pagina dello shader:
 * x a destra, y in BASSO (come il DOM), z verso chi guarda.
 */
export function direzioneLuce(azimutGradi: number, elevazioneGradi: number): [number, number, number] {
  const a = (azimutGradi * Math.PI) / 180;
  const e = (elevazioneGradi * Math.PI) / 180;
  const c = Math.cos(e);
  return [c * Math.cos(a), -c * Math.sin(a), Math.sin(e)];
}

/**
 * Posizione della "lampada" usata solo per il riflesso della lamina (giro 2).
 * La lampada sta DENTRO la finestra, spostata dal centro verso la luce, e
 * alta mezzo schermo: il riflesso stretto cade sotto di lei. Quando l'azimut
 * cambia (puntatore, dito, giroscopio, dial) la lampada si sposta e il
 * riflesso scorre davvero sulle lettere; quando la pagina scorre le parole
 * attraversano la banda del riflesso. Valori in px del buffer.
 */
export function puntoLuce(
  azimutGradi: number,
  elevazioneGradi: number,
  larghezzaBuffer: number,
  altezzaBuffer: number,
): [number, number, number] {
  const [dx, dy] = direzioneLuce(azimutGradi, elevazioneGradi);
  const l = Math.hypot(dx, dy) || 1;
  const cx = larghezzaBuffer * 0.5 + (dx / l) * larghezzaBuffer * 0.36;
  const cy = altezzaBuffer * 0.5 + (dy / l) * altezzaBuffer * 0.3;
  const alto = Math.max(larghezzaBuffer, altezzaBuffer) * 0.42;
  return [cx, cy, alto];
}

/* ------------------------------------------------------------------------- */
/* Parametri globali di carta e lamina                                        */
/* ------------------------------------------------------------------------- */

/**
 * uPaper: x = ampiezza della pendenza della fibra, y = sensibilità della
 * luce (quanto una pendenza sposta verso luce/ombra), z = forza dell'ombra
 * di contatto dei pezzi appoggiati, w = scurimento del fondo del solco.
 */
export const CARTA_GLOBALE = {
  pendenzaFibra: 0.011,
  sensibilitaLuce: 3.2,
  ombraContatto: 0.5,
  fondoSolco: 0.16,
} as const;

/**
 * Lamina argento anisotropa, satinata. Niente olografico, niente oro.
 * - venaturaX/Y: rugosità lungo e attraverso la venatura (il verso del rullo);
 * - riflessoMax: tetto del riflesso (nessun bagliore);
 * - satinato: quota di riflesso largo che fa "metallo" anche a luce ferma.
 */
export const LAMINA = {
  // Giro 2: venatura verticale (asse y del blocco) e rugosità stretta lungo
  // di essa: il riflesso è una banda orizzontale alta circa un decimo di
  // schermo che segue la lampada. Tetto più alto ma sempre sotto il bianco.
  venaturaX: 0.075,
  venaturaY: 0.6,
  riflessoMax: 0.6,
  satinato: 0.3,
} as const;

/* ------------------------------------------------------------------------- */
/* Dati per blocco                                                            */
/* ------------------------------------------------------------------------- */

export interface ParametriBloccoGL {
  /** Profondità del solco in px del buffer a pressione 1. */
  profonditaBuffer: number;
  /** 1 se la tecnica stampa inchiostro, altrimenti 0. */
  inchiostro: number;
  /** 1 se la tecnica stampa lamina, altrimenti 0. */
  lamina: number;
  /** Larghezza a pressione 0 (vedi PresetTecnica.stringiMin). */
  stringiMin: number;
  /** Spessore della costa del pezzo in px del buffer (0 se il blocco non ha una carta sua). */
  spessoreBuffer: number;
  /** Indice della carta del pezzo, -1 = usa il foglio. */
  cartaIndice: number;
}

/**
 * Calcola la parte statica degli uniform di un blocco (cambia solo quando
 * cambia la spec, il corpo o il DPR). La parte calda (rettangolo, pressione)
 * la scrive `blocks.ts` a ogni frame con `scriviBlocco()` di materials.ts.
 *
 * Nota: per i pezzi con layer misti la tecnica "di blocco" regola profondità
 * e profilo; inchiostro e lamina sono comunque decisi dai canali della maschera,
 * quindi qui valgono 1 per i pezzi, così i layer a colore e a lamina si vedono.
 */
export function parametriBlocco(input: {
  tecnica: string;
  profondita: number;
  corpoPx: number;
  dpr: number;
  carta?: CartaGL | null;
  pezzo?: boolean;
}): ParametriBloccoGL {
  const t = tecnicaGL(input.tecnica);
  const p = PRESET_TECNICA[t];
  const ci = indiceCarta(input.carta ?? null);
  const pezzo = input.pezzo === true;
  return {
    profonditaBuffer: profonditaPx(t, input.corpoPx, input.profondita) * input.dpr,
    inchiostro: pezzo || p.inchiostro ? 1 : 0,
    lamina: pezzo || p.lamina ? 1 : 0,
    stringiMin: pezzo ? 1 : p.stringiMin,
    spessoreBuffer: ci >= 0 ? (PRESET_CARTA[ORDINE_CARTE[ci] ?? 'citrino'].spessorePx * input.dpr) : 0,
    cartaIndice: ci,
  };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
