/**
 * IMBRUNIRE · curve di movimento.
 *
 * Due velocità, mai armonizzate (trend-researcher P10):
 * - l'INTERFACCIA risponde subito (150-250 ms): bottoni, fuoco, pannelli;
 * - la LUCE e il CORPO hanno i tempi di una casa vera: le lampade si scaldano
 *   e si raffreddano in 0,9-1,4 s, chi entra in una stanza cammina e frena.
 *
 * Ogni curva risponde alla domanda "chi lo spinge?":
 * - soglia        il passo di chi entra: parte deciso, frena lungo sulla
 *                 soglia, nessun rimbalzo (CD §6.2: cubic-bezier(.22,.7,.18,1));
 * - accendi       il filamento che si scalda: un attimo di ritardo, poi la
 *                 luce sale e si posa piano;
 * - spegni        la lampada che si spegne: cala subito, poi resta il bagliore
 *                 caldo che si esaurisce lento;
 * - carrelloVia   la testa che si volta verso la porta: accelera uscendo;
 * - carrello      il passo nella stanza accanto: arriva e si ferma morbido;
 * - scala         il piede sull'ultimo gradino: sale e si assesta;
 * - foglio        il foglio dal basso che segue il pollice e si ferma;
 * - interfaccia   risposta rapida di bottoni e pannelli;
 * - lineare       solo dissolvenze incrociate di opacità.
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

/** Posizione di `v` tra `a` e `b`, limitata a 0..1. Se a === b restituisce 0 o 1. */
export function progressoTra(a: number, b: number, v: number): number {
  const d = b - a;
  if (Math.abs(d) < 1e-9) return v >= b ? 1 : 0;
  return clamp01((v - a) / d);
}

/** Smoothstep: velocità nulla agli estremi. */
export function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Inseguimento esponenziale indipendente dal frame rate.
 * `fattore60` è la frazione di distanza coperta in un frame a 60 Hz.
 */
export function seguiDt(corrente: number, obiettivo: number, fattore60: number, dt: number): number {
  const f = clamp01(fattore60);
  if (f >= 1) return obiettivo;
  const k = 1 - Math.pow(1 - f, dt * 60);
  return corrente + (obiettivo - corrente) * k;
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

  const risolviU = (x: number): number => {
    let u = x;
    for (let i = 0; i < 8; i += 1) {
      const errore = curvaX(u) - x;
      if (Math.abs(errore) < 1e-7) return u;
      const d = derivataX(u);
      if (Math.abs(d) < 1e-6) break;
      u -= errore / d;
    }
    let basso = 0;
    let alto = 1;
    u = x;
    for (let i = 0; i < 40; i += 1) {
      const valore = curvaX(u);
      if (Math.abs(valore - x) < 1e-7) return u;
      if (x > valore) basso = u;
      else alto = u;
      u = (basso + alto) / 2;
    }
    return u;
  };

  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return curvaY(risolviU(t));
  };
}

/* ------------------------------------------------------------------ */
/* Le curve del concept                                                */
/* ------------------------------------------------------------------ */

export type NomeCurva =
  | 'soglia'
  | 'accendi'
  | 'spegni'
  | 'carrelloVia'
  | 'carrello'
  | 'scala'
  | 'foglio'
  | 'interfaccia'
  | 'lineare';

/** Punti di controllo delle curve: unica fonte per JS e CSS. */
export const PUNTI_CURVA: Readonly<Record<Exclude<NomeCurva, 'lineare'>, readonly [number, number, number, number]>> = {
  soglia: [0.22, 0.7, 0.18, 1],
  accendi: [0.5, 0.04, 0.3, 1],
  spegni: [0.3, 0.45, 0.2, 1],
  carrelloVia: [0.5, 0, 0.75, 0.35],
  carrello: [0.2, 0.6, 0.2, 1],
  scala: [0.35, 0.3, 0.15, 1],
  foglio: [0.32, 0.72, 0, 1],
  interfaccia: [0.2, 0.7, 0.3, 1],
};

function bezierCss(p: readonly [number, number, number, number]): string {
  return `cubic-bezier(${p[0]}, ${p[1]}, ${p[2]}, ${p[3]})`;
}

/** Stringhe CSS / WAAPI delle curve (valore di `easing` o di `transition-timing-function`). */
export const BEZIER_CSS: Readonly<Record<NomeCurva, string>> = {
  soglia: bezierCss(PUNTI_CURVA.soglia),
  accendi: bezierCss(PUNTI_CURVA.accendi),
  spegni: bezierCss(PUNTI_CURVA.spegni),
  carrelloVia: bezierCss(PUNTI_CURVA.carrelloVia),
  carrello: bezierCss(PUNTI_CURVA.carrello),
  scala: bezierCss(PUNTI_CURVA.scala),
  foglio: bezierCss(PUNTI_CURVA.foglio),
  interfaccia: bezierCss(PUNTI_CURVA.interfaccia),
  lineare: 'linear',
};

/** Le stesse curve come funzioni (per il ticker, i test e le verifiche). */
export const CURVE: Readonly<Record<NomeCurva, Easing>> = {
  soglia: cubicBezier(...PUNTI_CURVA.soglia),
  accendi: cubicBezier(...PUNTI_CURVA.accendi),
  spegni: cubicBezier(...PUNTI_CURVA.spegni),
  carrelloVia: cubicBezier(...PUNTI_CURVA.carrelloVia),
  carrello: cubicBezier(...PUNTI_CURVA.carrello),
  scala: cubicBezier(...PUNTI_CURVA.scala),
  foglio: cubicBezier(...PUNTI_CURVA.foglio),
  interfaccia: cubicBezier(...PUNTI_CURVA.interfaccia),
  lineare: (t: number) => clamp01(t),
};
