/**
 * NOVANTA · curve di movimento (motion-designer).
 *
 * Il sito ha una sola curva: la **frenata**. È il gesto del fisioterapista che
 * accompagna il braccio fino al punto giusto e lo ferma lì, senza rimbalzo:
 * parte già in moto (lo spinge il dito, la rotella o un clic) e rallenta fino a
 * velocità zero esattamente all'arrivo. Tutto il resto ne è una variante:
 *
 * - frenata         p(s) = 1,5 s − 0,5 s³  (velocità iniziale 1,5, finale 0);
 *                   in CSS è esattamente cubic-bezier(1/3, 0,5, 2/3, 1);
 * - hermite(s, a)   la stessa famiglia con velocità iniziale `a` qualsiasi:
 *                   serve al rotore per ereditare la velocità del dito quando
 *                   il braccio viene lasciato (continuità, nessuno scatto);
 *                   con a = 1,5 coincide con la frenata;
 * - curvaInvito     l'unico movimento che parte da fermo e torna da fermo:
 *                   la manopola si alza di 6° e ridiscende, una volta sola.
 *
 * Nessun rimbalzo è possibile per costruzione: per 0 ≤ a ≤ 3 la hermite è
 * monotona e non supera mai l'arrivo (verifica numerica nel doc).
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

/* ------------------------------------------------------------------ */
/* Cubic-bezier (stesso algoritmo dei browser: Newton + bisezione)      */
/* ------------------------------------------------------------------ */

/**
 * Curva cubic-bezier come funzione, identica a quella che il browser usa per
 * `transition-timing-function`. Serve a verificare che le stringhe CSS di
 * questo file descrivano davvero le funzioni TS.
 */
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
      if (Math.abs(errore) < 1e-7) return u;
      const d = derivataX(u);
      if (Math.abs(d) < 1e-7) break;
      u -= errore / d;
    }
    let basso = 0;
    let alto = 1;
    u = x;
    for (let i = 0; i < 48; i += 1) {
      const valore = curvaX(u);
      if (Math.abs(valore - x) < 1e-7) return u;
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
/* La frenata                                                          */
/* ------------------------------------------------------------------ */

/** Velocità iniziale normalizzata della frenata (p'(0)). */
export const A_FRENATA = 1.5;

/** Velocità iniziale massima senza superare l'arrivo (limite di monotonia). */
export const A_MASSIMA = 3;

/** Velocità iniziale minima ammessa quando il braccio si allontana dall'arrivo. */
export const A_MINIMA = -1;

/**
 * La curva firma. p(0) = 0, p(1) = 1, p'(0) = 1,5, p'(1) = 0: il braccio parte
 * con la spinta di chi lo muove e si ferma senza rimbalzo.
 */
export function frenata(t: number): number {
  const s = clamp01(t);
  return 1.5 * s - 0.5 * s * s * s;
}

/**
 * Stessa curva in CSS. Con i punti di controllo in x a 1/3 e 2/3 il tempo è
 * lineare nel parametro, quindi la curva CSS coincide con `frenata` (errore
 * massimo sotto 1e-4, verificato con `cubicBezier`).
 */
export const FRENATA_CSS = 'cubic-bezier(0.3333, 0.5, 0.6667, 1)';

/**
 * Famiglia di Hermite cubica da 0 a 1 con velocità iniziale `a` e velocità
 * finale 0 (unità: frazione del tragitto per frazione della durata).
 *   p(s) = (a − 2) s³ + (3 − 2a) s² + a s
 * - a = 0      parte da fermo (smoothstep);
 * - a = 1,5    frenata;
 * - a = 3      massima velocità iniziale senza superare l'arrivo;
 * - a < 0      il braccio stava andando nel verso opposto: torna indietro un
 *              poco (al massimo 5,5% del tragitto con a = −1) e poi arriva.
 */
export function hermite(t: number, a: number): number {
  const s = clamp01(t);
  return ((a - 2) * s + (3 - 2 * a)) * s * s + a * s;
}

/** Derivata di `hermite` rispetto a s. */
export function hermiteVelocita(t: number, a: number): number {
  const s = clamp01(t);
  return 3 * (a - 2) * s * s + 2 * (3 - 2 * a) * s + a;
}

/* ------------------------------------------------------------------ */
/* L'invito                                                            */
/* ------------------------------------------------------------------ */

/**
 * Andata e ritorno della manopola (creative-director §4.7): 0 → 1 → 0, parte e
 * arriva da ferma (derivata nulla agli estremi), il picco cade al 40% del
 * tempo. È più rapida a salire che a scendere, come una mano che accenna il
 * gesto e poi lo lascia.
 */
export function curvaInvito(t: number): number {
  const s = clamp01(t);
  const x = Math.sin(Math.PI * Math.pow(s, 0.75));
  return x * x;
}

/* ------------------------------------------------------------------ */
/* Tabella delle curve CSS                                             */
/* ------------------------------------------------------------------ */

/**
 * Le curve disponibili in CSS. Una sola: `motion.css` la espone come
 * `--nov-motion-curva` e tutte le transizioni del concept la usano.
 */
export const CURVE_CSS = {
  frenata: FRENATA_CSS,
} as const;

export type NomeCurva = keyof typeof CURVE_CSS;
