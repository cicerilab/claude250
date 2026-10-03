/**
 * NODI · curve di movimento.
 *
 * Sulla pagina si muovono solo cose fisiche: foglie di tè spinte da una
 * tavola che vibra, cuscinetti di gommapiuma spostati a mano, un cursore
 * che segue un dito. Ogni curva risponde alla domanda "chi lo spinge?":
 *
 * - posa        una foglia che tocca il legno: arriva decisa, si ferma senza
 *               rimbalzo (la gommapiuma sotto la tavola smorza tutto);
 * - assesta     una foglia che scivola verso una linea nodale: parte spinta
 *               dal ventre, rallenta dove il legno sta fermo;
 * - cuscinetto  il liutaio sposta un cuscinetto sul nodo nuovo: alza, porta,
 *               appoggia (lento all'inizio e alla fine, mai secco);
 * - velo        una dissolvenza di testo o di figura: quasi lineare, un
 *               filo più veloce a metà (l'occhio non deve accorgersene);
 * - inseguito   il cursore che rincorre un valore: pronto, poi liscio;
 * - riquadro    il riquadro mobile che si riduce legato allo scroll: una
 *               curva simmetrica senza velocità ai capi (smootherstep).
 *
 * Nessuna curva sovraelonga: sulla tavola niente rimbalza, niente lampeggia.
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

/** Smootherstep tra due soglie. */
export function smootherstep(e0: number, e1: number, x: number): number {
  return smootherstep01(progressoTra(e0, e1, x));
}

/** Interpolazione in scala logaritmica tra due valori positivi. */
export function lerpLog(a: number, b: number, t: number): number {
  return a * Math.pow(b / a, t);
}

/** Inversa di `lerpLog`, limitata a 0..1. */
export function progressoLog(a: number, b: number, v: number): number {
  if (a <= 0 || b <= 0 || v <= 0) return 0;
  const d = Math.log(b / a);
  return Math.abs(d) < 1e-9 ? 0 : clamp01(Math.log(v / a) / d);
}

/* ------------------------------------------------------------------ */
/* Bezier cubica (stessa definizione di CSS `cubic-bezier`)            */
/* ------------------------------------------------------------------ */

/**
 * Restituisce la funzione y(x) della bezier cubica con punti di controllo
 * (x1, y1) e (x2, y2), come `cubic-bezier` di CSS. Newton con ripiego a
 * bisezione: precisione 1e-6, sempre monotona per x1, x2 in [0, 1].
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const campX = (u: number): number => ((ax * u + bx) * u + cx) * u;
  const campY = (u: number): number => ((ay * u + by) * u + cy) * u;
  const derX = (u: number): number => (3 * ax * u + 2 * bx) * u + cx;

  const risolvi = (x: number): number => {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const dx = campX(u) - x;
      if (Math.abs(dx) < 1e-6) return u;
      const d = derX(u);
      if (Math.abs(d) < 1e-6) break;
      u -= dx / d;
    }
    let lo = 0;
    let hi = 1;
    u = x;
    while (hi - lo > 1e-6) {
      const dx = campX(u) - x;
      if (Math.abs(dx) < 1e-6) return u;
      if (dx > 0) hi = u;
      else lo = u;
      u = (lo + hi) / 2;
    }
    return u;
  };

  return (t: number): number => {
    const x = clamp01(t);
    if (x === 0) return 0;
    if (x === 1) return 1;
    return campY(risolvi(x));
  };
}

/* ------------------------------------------------------------------ */
/* Le curve di NODI                                                    */
/* ------------------------------------------------------------------ */

/** Punti di controllo, unica fonte per funzioni e stringhe CSS. */
const PUNTI = {
  posa: [0.3, 0.55, 0.2, 1],
  assesta: [0.12, 0.42, 0.28, 1],
  cuscinetto: [0.45, 0.02, 0.22, 1],
  velo: [0.4, 0.15, 0.6, 0.85],
  inseguito: [0.2, 0.6, 0.25, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type NomeCurva = keyof typeof PUNTI | 'riquadro' | 'lineare';

/** Una foglia che tocca il legno: decisa, ferma senza rimbalzo. */
export const posa: Easing = cubicBezier(...PUNTI.posa);
/** Una foglia che scivola verso la linea nodale: spinta, poi frena. */
export const assesta: Easing = cubicBezier(...PUNTI.assesta);
/** Il cuscinetto portato a mano sul nodo nuovo: alza, porta, appoggia. */
export const cuscinetto: Easing = cubicBezier(...PUNTI.cuscinetto);
/** Dissolvenza di testi e figure: quasi lineare. */
export const velo: Easing = cubicBezier(...PUNTI.velo);
/** Il cursore che rincorre un valore: pronto, poi liscio. */
export const inseguito: Easing = cubicBezier(...PUNTI.inseguito);
/** Riquadro mobile legato allo scroll: simmetrica, senza velocità ai capi. */
export const riquadro: Easing = smootherstep01;
export const lineare: Easing = (t: number): number => clamp01(t);

export const CURVE: Readonly<Record<NomeCurva, Easing>> = {
  posa,
  assesta,
  cuscinetto,
  velo,
  inseguito,
  riquadro,
  lineare,
};

/** Stringhe per `transition-timing-function` / `animation-timing-function`. */
export const BEZIER_CSS: Readonly<Record<NomeCurva, string>> = {
  posa: `cubic-bezier(${PUNTI.posa.join(', ')})`,
  assesta: `cubic-bezier(${PUNTI.assesta.join(', ')})`,
  cuscinetto: `cubic-bezier(${PUNTI.cuscinetto.join(', ')})`,
  velo: `cubic-bezier(${PUNTI.velo.join(', ')})`,
  inseguito: `cubic-bezier(${PUNTI.inseguito.join(', ')})`,
  // smootherstep non è una bezier: la si esporta campionata (`linear()`),
  // con ripiego ease-in-out per i browser senza `linear()`.
  riquadro: 'ease-in-out',
  lineare: 'linear',
};

/**
 * Campiona una curva come `linear(...)` di CSS (Chrome 113+, Firefox 112+,
 * Safari 17.2+). Da usare con `@supports (animation-timing-function: linear(0, 1))`.
 */
export function cssLinear(fn: Easing, campioni = 32, decimali = 4): string {
  const parti: string[] = [];
  for (let i = 0; i <= campioni; i++) {
    const t = i / campioni;
    parti.push(fn(t).toFixed(decimali).replace(/\.?0+$/, ''));
  }
  return `linear(${parti.join(', ')})`;
}

/** Stringa `linear()` della curva del riquadro, per chi la vuole esatta in CSS. */
export function riquadroCss(): string {
  return cssLinear(riquadro, 24);
}

/**
 * Derivata numerica di una curva, per verifiche (la doc del motion-designer
 * la usa per dimostrare che nessuna curva sovraelonga: y' non cambia segno).
 */
export function derivata(fn: Easing, t: number, h = 1e-3): number {
  const a = clamp01(t - h);
  const b = clamp01(t + h);
  return b === a ? 0 : (fn(b) - fn(a)) / (b - a);
}
