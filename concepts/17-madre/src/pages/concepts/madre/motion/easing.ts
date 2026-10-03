/**
 * MADRE · curve di movimento (motion-designer, docs/motion-designer.md §2).
 *
 * Ogni curva risponde alla domanda "chi lo spinge?" (trend-researcher P5):
 * - affonda   il polpastrello entra nell'impasto: parte da fermo, frena
 *             contro la pasta che resiste, mai oltre il fondo;
 * - risale    l'impasto lievitato bene torna su piano piano: si stacca dal
 *             dito senza scatto, poi sale lento, senza rimbalzo;
 * - stende    il foglio di carta da zucchero fatto scivolare sul bancone:
 *             arriva veloce da destra e si posa fermo al suo posto;
 * - posa      la mano che porta il pane nel giorno: alza, porta, appoggia;
 * - torna     il gettone che non trova posto scivola indietro dov'era;
 * - piega     l'angolo del vassoio piegato col pollice: resiste, poi cede;
 * - compare   un elemento fisso che arriva: due passi brevi, poi fermo;
 * - lineare   solo per le dissolvenze di luminosità (velocità costante,
 *             nessun picco di variazione).
 *
 * Più gli integratori esatti sul dt che usano fossetta.ts, foglio.ts e
 * l'inerzia dello swipe: nessun risultato dipende dalla frequenza dei frame.
 *
 * Modulo puro: nessun accesso a window/document, sicuro per il prerender.
 */

export type Easing = (t: number) => number;

/* ------------------------------------------------------------------ */
/* Utilità numeriche                                                   */
/* ------------------------------------------------------------------ */

export function clamp(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}

export function clamp01(x: number): number {
  return x <= 0 ? 0 : x >= 1 ? 1 : x;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Posizione di `v` tra `a` e `b`, non limitata. Se a === b restituisce 0. */
export function inverseLerp(a: number, b: number, v: number): number {
  const d = b - a;
  return Math.abs(d) < 1e-9 ? 0 : (v - a) / d;
}

/** Posizione di `v` tra `a` e `b`, limitata a 0..1. */
export function progressoTra(a: number, b: number, v: number): number {
  return clamp01(inverseLerp(a, b, v));
}

export function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** Smootherstep di Perlin: velocità e accelerazione nulle agli estremi. */
export function smootherstep01(t: number): number {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Arrotonda a mezzo pixel: le scritture di posizione cambiano solo quando si vede. */
export function mezzoPixel(x: number): number {
  return Math.round(x * 2) / 2;
}

/* ------------------------------------------------------------------ */
/* Cubic-bezier (stesso algoritmo dei browser: Newton + bisezione)      */
/* ------------------------------------------------------------------ */

export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const curvaX = (u: number): number => ((ax * u + bx) * u + cx) * u;
  const curvaY = (u: number): number => ((ay * u + by) * u + cy) * u;
  const derivataX = (u: number): number => (3 * ax * u + 2 * bx) * u + cx;

  const risolviX = (x: number): number => {
    let u = x;
    for (let i = 0; i < 8; i += 1) {
      const errore = curvaX(u) - x;
      if (Math.abs(errore) < 1e-6) return u;
      const d = derivataX(u);
      if (Math.abs(d) < 1e-6) break;
      u -= errore / d;
    }
    let basso = 0;
    let alto = 1;
    u = x;
    for (let i = 0; i < 40; i += 1) {
      const valore = curvaX(u);
      if (Math.abs(valore - x) < 1e-6) return u;
      if (x > valore) basso = u;
      else alto = u;
      u = (basso + alto) / 2;
    }
    return u;
  };

  return (t: number): number => {
    const x = clamp01(t);
    if (x === 0 || x === 1) return x;
    return curvaY(risolviX(x));
  };
}

/* ------------------------------------------------------------------ */
/* Integratori esatti sul dt                                           */
/* ------------------------------------------------------------------ */

/**
 * Primo ordine esatto: `x` si avvicina a `bersaglio` con costante di tempo
 * `tau` (secondi). Stesso risultato con un passo da 0,1 s o con sei da 1/60.
 */
export function avvicina(x: number, bersaglio: number, dt: number, tau: number): number {
  if (tau <= 0 || dt <= 0) return dt <= 0 ? x : bersaglio;
  return bersaglio + (x - bersaglio) * Math.exp(-dt / tau);
}

/** Stato di un oscillatore: posizione e velocità (unità al secondo). */
export interface PosVel {
  x: number;
  v: number;
}

/**
 * Molla a smorzamento critico, soluzione esatta su `dt` (nessun rimbalzo,
 * mai oltre il bersaglio se parte da ferma). `omega` in rad/s: il 95% del
 * tratto si copre in circa 4,74 / omega secondi partendo da fermi.
 * Scrive il risultato in `out` (niente allocazioni per frame).
 */
export function passoCritico(x: number, v: number, bersaglio: number, omega: number, dt: number, out: PosVel): PosVel {
  if (dt <= 0) {
    out.x = x;
    out.v = v;
    return out;
  }
  const d0 = x - bersaglio;
  const b = v + omega * d0;
  const e = Math.exp(-omega * dt);
  out.x = bersaglio + (d0 + b * dt) * e;
  out.v = (b - omega * (d0 + b * dt)) * e;
  return out;
}

/**
 * Inerzia esponenziale (lo swipe della vetrina al rilascio): velocità che
 * decade con costante `tau`. Restituisce lo spostamento esatto in questo
 * passo e aggiorna la velocità in `stato.v`.
 */
export function passoInerzia(stato: { v: number }, dt: number, tau: number): number {
  if (dt <= 0 || tau <= 0) return 0;
  const e = Math.exp(-dt / tau);
  const spostamento = stato.v * tau * (1 - e);
  stato.v *= e;
  return spostamento;
}

/* ------------------------------------------------------------------ */
/* La prova del dito                                                   */
/* ------------------------------------------------------------------ */

/** Costante della discesa normalizzata: al 95% del fondo a t = 1. */
const AFFONDA_K = 4.744;
const AFFONDA_NORMA = 1 - (1 + AFFONDA_K) * Math.exp(-AFFONDA_K);

/**
 * Il dito entra nella pasta (t = 0..1 sulla durata della discesa, 500 ms):
 * risposta critica normalizzata. Parte da velocità nulla, la velocità massima
 * cade a un quinto del tempo, poi frena lunga contro la pasta. Nessun
 * oltrepassamento. È la stessa legge di `passoCritico` usata nel ticker:
 * questa forma serve a CSS e ai test.
 */
export function affonda(t: number): number {
  const x = clamp01(t);
  if (x >= 1) return 1;
  const kt = AFFONDA_K * x;
  return (1 - (1 + kt) * Math.exp(-kt)) / AFFONDA_NORMA;
}

/**
 * Risposta sovrasmorzata a due costanti (cascata di due ritardi del primo
 * ordine): parte da 1 con velocità nulla e scende a 0 senza mai passare
 * sotto. È la parte elastica del ritorno dell'impasto (fossetta.ts).
 */
export function sovrasmorzata(t: number, tau1: number, tau2: number): number {
  if (t <= 0) return 1;
  if (Math.abs(tau2 - tau1) < 1e-6) {
    const k = t / tau1;
    return (1 + k) * Math.exp(-k);
  }
  return (tau2 * Math.exp(-t / tau2) - tau1 * Math.exp(-t / tau1)) / (tau2 - tau1);
}

/** Costanti del ritorno elastico (fossetta.ts le importa da qui tramite choreography). */
export const RISALE_TAU1 = 0.22;
export const RISALE_TAU2 = 0.53;
/** Durata su cui `risale` è normalizzata (s): oltre, il resto è il segno. */
export const RISALE_DURATA = 2;
const RISALE_FINE = sovrasmorzata(RISALE_DURATA, RISALE_TAU1, RISALE_TAU2);

/**
 * L'impasto torna su (t = 0..1 su 2 s): si stacca dal dito senza scatto
 * (velocità iniziale nulla), sale più in fretta verso 0,4 s, poi piano piano.
 * 0 = fossetta piena, 1 = superficie tornata. Normalizzata: a t = 1 vale 1.
 */
export function risale(t: number): number {
  const x = clamp01(t);
  if (x >= 1) return 1;
  const resta = sovrasmorzata(x * RISALE_DURATA, RISALE_TAU1, RISALE_TAU2);
  return (1 - resta) / (1 - RISALE_FINE);
}

/* ------------------------------------------------------------------ */
/* Curve a bezier                                                      */
/* ------------------------------------------------------------------ */

/**
 * Il foglio di carta da zucchero spinto sul bancone: entra veloce (pendenza
 * iniziale 2,4) e si posa con velocità nulla, così dopo la posa prosegue
 * col bancone senza strappi. Legata allo scroll, mai al tempo.
 */
export const stende: Easing = cubicBezier(0.25, 0.6, 0.35, 1);

/** La mano che porta il pane nel giorno: si alza piano, attraversa, appoggia. */
export const posa: Easing = cubicBezier(0.45, 0.05, 0.25, 1);

/** Il gettone rifiutato torna al suo posto: scivola subito, si ferma morbido, niente rimbalzo. */
export const torna: Easing = cubicBezier(0.2, 0.65, 0.3, 1);

/** L'angolo del vassoio piegato col pollice: la carta resiste, poi cede e si appiattisce. */
export const piega: Easing = cubicBezier(0.55, 0.05, 0.3, 1);

/** Un fisso che arriva (bottone in testata, riga dei banchi, barra del riassunto). */
export const compare: Easing = cubicBezier(0.2, 0.7, 0.3, 1);

/** Lineare: solo dissolvenze di opacità e di colore (variazione di luminosità costante). */
export const lineare: Easing = (t: number): number => clamp01(t);

/* ------------------------------------------------------------------ */
/* Versioni CSS                                                        */
/* ------------------------------------------------------------------ */

/**
 * Campiona una curva in una funzione CSS `linear()` (Chrome 113, Firefox 112,
 * Safari 17.2). Serve per `affonda` e `risale`, che un cubic-bezier non
 * descrive; dove `linear()` non c'è, il CSS ricade sulla bezier di BEZIER_CSS.
 */
export function cssLinear(fn: Easing, campioni = 32, decimali = 4): string {
  const n = Math.max(2, Math.floor(campioni));
  const punti: string[] = [];
  for (let i = 0; i <= n; i += 1) {
    const v = fn(i / n);
    punti.push(Number(v.toFixed(decimali)).toString());
  }
  return `linear(${punti.join(', ')})`;
}

/** Le curve come stringhe CSS. `affonda` e `risale` sono le bezier più vicine (errore < 0,03). */
export const BEZIER_CSS = {
  affonda: 'cubic-bezier(0.3, 0.55, 0.25, 1)',
  risale: 'cubic-bezier(0.32, 0.2, 0.25, 1)',
  stende: 'cubic-bezier(0.25, 0.6, 0.35, 1)',
  posa: 'cubic-bezier(0.45, 0.05, 0.25, 1)',
  torna: 'cubic-bezier(0.2, 0.65, 0.3, 1)',
  piega: 'cubic-bezier(0.55, 0.05, 0.3, 1)',
  compare: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
  lineare: 'linear',
} as const;

export type NomeCurva = keyof typeof BEZIER_CSS;

export const CURVE: Readonly<Record<NomeCurva, Easing>> = {
  affonda,
  risale,
  stende,
  posa,
  torna,
  piega,
  compare,
  lineare,
};
