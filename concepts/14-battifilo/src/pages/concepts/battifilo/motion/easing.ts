/**
 * BATTIFILO · curve di movimento.
 *
 * Ogni curva risponde alla domanda "chi lo spinge?" (trend-researcher P8,
 * creative director 4.9: si muovono solo filo, polvere, foto, scheda,
 * finestra battuta):
 * - tiro        la cassetta tirata dal filo verso una tacca: parte piano
 *               (il filo si tende), attraversa, frena lunga sul punto;
 * - aggancio    la cassetta lasciata che si assesta sulla tacca vicina;
 * - velatura    una foto o una scheda che si posa sull'altra (solo opacità);
 * - posa        il gesso che si posa sul calcestruzzo dopo la battuta: tutto
 *               nei primi istanti, poi si ferma;
 * - solleva     la lastra che sale sopra la foto ("Di più" su telefono);
 * - scende      la lastra che torna giù;
 * - sbuffo      un granello di polvere che si alza e ricade.
 * La battuta del filo non è un cubic-bezier: è `alzaBattuta()`, qui sotto.
 *
 * Modulo puro: nessun accesso a window/document, sicuro per il prerender.
 */

export type Curva = (t: number) => number;

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

export function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Base di Hermite h10(u) = u³ − 2u² + u: porta la velocità iniziale dentro
 * una corsa a tempo senza cambiare punto d'arrivo. Vale 0 in 0 e in 1, ha
 * derivata 1 in 0 e 0 in 1. Usata dalla cassetta: quando un volo parte
 * mentre la cassetta si muove già, la velocità si conserva (niente scatto).
 */
export function hermiteVelocita(u: number): number {
  const x = clamp01(u);
  return x * x * x - 2 * x * x + x;
}

/* ------------------------------------------------------------------ */
/* Cubic-bezier (stesso algoritmo dei browser: Newton + bisezione)      */
/* ------------------------------------------------------------------ */

export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Curva {
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
/* Le curve del cantiere                                               */
/* ------------------------------------------------------------------ */

/*
 * Punti di controllo. `tiro` e `aggancio` hanno pendenza 0 sia in partenza
 * (y1 = 0) sia in arrivo (y2 = 1): la velocità d'ingresso la aggiunge
 * `hermiteVelocita`, così la somma resta continua e arriva ferma.
 */
const P_TIRO = [0.45, 0, 0.15, 1] as const;
const P_AGGANCIO = [0.3, 0, 0.1, 1] as const;
const P_VELATURA = [0.35, 0, 0.25, 1] as const;
const P_POSA = [0.12, 0.7, 0.2, 1] as const;
const P_SOLLEVA = [0.22, 0.8, 0.24, 1] as const;
const P_SCENDE = [0.45, 0, 0.3, 1] as const;
const P_SBUFFO = [0.15, 0.55, 0.3, 1] as const;

/** La cassetta tirata dal filo verso una tacca (tocco, tasto, swipe, rotella). */
export const tiro: Curva = cubicBezier(...P_TIRO);
/** La cassetta lasciata che si assesta sulla tacca vicina. */
export const aggancio: Curva = cubicBezier(...P_AGGANCIO);
/** Dissolvenze di foto e schede: nessun cambio di luminosità brusco. */
export const velatura: Curva = cubicBezier(...P_VELATURA);
/** Il gesso che si posa: quasi tutto subito, poi si ferma. */
export const posa: Curva = cubicBezier(...P_POSA);
/** La lastra che sale sopra la foto ("Di più"). */
export const solleva: Curva = cubicBezier(...P_SOLLEVA);
/** La lastra che torna giù ("Meno"). */
export const scende: Curva = cubicBezier(...P_SCENDE);
/** Un granello di polvere che si alza e ricade. */
export const sbuffo: Curva = cubicBezier(...P_SBUFFO);
/** Lineare, per i soli conti interni. */
export const lineare: Curva = (t: number): number => clamp01(t);

const bezierCss = (p: readonly [number, number, number, number]): string =>
  `cubic-bezier(${p[0]}, ${p[1]}, ${p[2]}, ${p[3]})`;

/** Le stesse curve come stringhe CSS (per `variabiliMotion` e i fogli di sezione). */
export const BEZIER_CSS = {
  tiro: bezierCss(P_TIRO),
  aggancio: bezierCss(P_AGGANCIO),
  velatura: bezierCss(P_VELATURA),
  posa: bezierCss(P_POSA),
  solleva: bezierCss(P_SOLLEVA),
  scende: bezierCss(P_SCENDE),
  sbuffo: bezierCss(P_SBUFFO),
} as const;

export type NomeCurva = keyof typeof BEZIER_CSS;

export const CURVE: Readonly<Record<NomeCurva, Curva>> = {
  tiro,
  aggancio,
  velatura,
  posa,
  solleva,
  scende,
  sbuffo,
};

/* ------------------------------------------------------------------ */
/* La battuta del filo                                                 */
/* ------------------------------------------------------------------ */

/**
 * Fasi della battuta, in frazioni della sua durata (350 ms la piena):
 * - 0 → ALZATA: due dita sollevano il filo al centro (esce rapido, frena in cima);
 * - ALZATA → IMPATTO: il filo lasciato cade, accelerando, e colpisce il getto;
 * - IMPATTO → 1: due piccoli rimbalzi smorzati sopra la superficie, poi fermo.
 * All'IMPATTO nasce il segno: lì il gesso si posa e parte la polvere.
 */
export const BATTUTA_FASI = {
  alzata: 0.2,
  impatto: 0.36,
} as const;

/** Altezza del primo rimbalzo rispetto all'alzata (circa 24%). */
const RIMBALZO = 0.445;
/** Smorzamento dei rimbalzi: il secondo vale circa il 7% dell'alzata. */
const RIMBALZO_SMORZAMENTO = 2.47;

/**
 * Spostamento del punto di controllo centrale del filo durante la battuta,
 * in px, per `u` in 0..1. Negativo = verso l'alto (sistema SVG, y in giù).
 * `ampiezza` è l'alzata massima (positiva); `alzaIniziale` è dove si trova
 * il filo quando la battuta parte (0 se è già teso), così una battuta che
 * ne interrompe un'altra non salta.
 *
 * Proprietà: vale `alzaIniziale` in 0, −ampiezza alla fine dell'alzata,
 * 0 all'impatto, mai positivo dopo l'impatto (il filo non entra nel getto),
 * esattamente 0 in 1.
 */
export function alzaBattuta(u: number, ampiezza: number, alzaIniziale = 0): number {
  const x = clamp01(u);
  const a = -Math.abs(ampiezza);
  const { alzata, impatto } = BATTUTA_FASI;
  if (x < alzata) {
    const k = x / alzata;
    const uscita = 1 - (1 - k) * (1 - k);
    return lerp(alzaIniziale, a, uscita);
  }
  if (x < impatto) {
    const k = (x - alzata) / (impatto - alzata);
    return a * (1 - k * k);
  }
  if (x >= 1) return 0;
  const v = (x - impatto) / (1 - impatto);
  return a * RIMBALZO * Math.abs(Math.sin(2 * Math.PI * v)) * Math.exp(-RIMBALZO_SMORZAMENTO * v);
}

/**
 * Il sussulto: il filo si alza appena e ricade senza toccare il getto con
 * forza (niente segno, niente polvere). Per "Manda le misure" premuto con le
 * misure mancanti (ux-architect 5.5.6, I0). `u` in 0..1, risultato in px.
 */
export function alzaSussulto(u: number, ampiezza: number): number {
  const x = clamp01(u);
  const s = Math.sin(Math.PI * x);
  return -Math.abs(ampiezza) * s * s;
}

/* ------------------------------------------------------------------ */
/* Versioni CSS campionate                                             */
/* ------------------------------------------------------------------ */

/**
 * Campiona una curva in una funzione CSS `linear()` (Chrome 113, Firefox
 * 112, Safari 17.2). Non serve nel concept (le curve CSS sono tutte
 * cubic-bezier); resta per chi volesse la battuta in un keyframe.
 */
export function cssLinear(fn: Curva, campioni = 48, decimali = 4): string {
  const n = Math.max(2, Math.floor(campioni));
  const punti: string[] = [];
  for (let i = 0; i <= n; i += 1) {
    punti.push(Number(fn(i / n).toFixed(decimali)).toString());
  }
  return `linear(${punti.join(', ')})`;
}
