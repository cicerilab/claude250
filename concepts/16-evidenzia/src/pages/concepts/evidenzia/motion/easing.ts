/**
 * EVIDENZIA · curve di movimento.
 *
 * Tutte le curve nascono da due oggetti del mestiere: la mano che passa
 * l'evidenziatore su una riga di giornale, e il ritaglio di carta che si
 * stacca dalla pagina e ci torna. Nessuna curva generica (ease, ease-in-out,
 * standard di sistema): ognuna ha un nome e una causa (docs/motion-designer.md §2).
 *
 * Ogni curva esiste in due forme:
 * - funzione TS `(t) => valore`, t in 0..1 (limitato), per i calcoli
 *   (fotogrammi della vista, test numerici);
 * - stringa CSS per WAAPI e transizioni: `cubic-bezier(...)`, oppure
 *   `linear(...)` campionata dove una bezier non basta (la mano), con ripiego
 *   automatico sulla bezier nei browser che non conoscono `linear()`.
 *
 * Nessun accesso al browser a livello di modulo: il test di supporto di
 * `linear()` avviene alla prima richiesta ed è memorizzato.
 */

export type Easing = (t: number) => number;

export type NomeCurva =
  | 'mano'
  | 'rientro'
  | 'asciuga'
  | 'esaurisce'
  | 'solleva'
  | 'apre'
  | 'chiude'
  | 'posa'
  | 'sviluppo'
  | 'obiettivo'
  | 'velo'
  | 'lineare';

/* ------------------------------------------------------------------ */
/* Utilità numeriche                                                   */
/* ------------------------------------------------------------------ */

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolazione geometrica: uniforme per l'occhio quando si cambia scala. */
export function lerpLog(a: number, b: number, t: number): number {
  if (a <= 0 || b <= 0) return lerp(a, b, t);
  return a * Math.pow(b / a, t);
}

/* ------------------------------------------------------------------ */
/* Cubic bezier (stessa definizione di CSS)                            */
/* ------------------------------------------------------------------ */

/**
 * Curva di Bézier cubica con estremi (0,0) e (1,1), come `cubic-bezier()` di
 * CSS. Newton-Raphson con ripiego a bisezione: errore < 1e-6.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (s: number): number => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number): number => ((ay * s + by) * s + cy) * s;
  const derivX = (s: number): number => (3 * ax * s + 2 * bx) * s + cx;

  const solveX = (x: number): number => {
    let s = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(s) - x;
      if (Math.abs(err) < 1e-7) return s;
      const d = derivX(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }
    let lo = 0;
    let hi = 1;
    s = x;
    for (let i = 0; i < 40; i++) {
      const v = sampleX(s);
      if (Math.abs(v - x) < 1e-7) return s;
      if (v < x) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return s;
  };

  return (t: number): number => {
    const x = clamp01(t);
    if (x === 0 || x === 1) return x;
    return sampleY(solveX(x));
  };
}

function bezierCss(x1: number, y1: number, x2: number, y2: number): string {
  const f = (n: number): string => String(Math.round(n * 1000) / 1000);
  return `cubic-bezier(${f(x1)}, ${f(y1)}, ${f(x2)}, ${f(y2)})`;
}

/* ------------------------------------------------------------------ */
/* La mano                                                             */
/* ------------------------------------------------------------------ */

/**
 * La curva della mano che passa l'evidenziatore.
 *
 * Profilo di velocità a campana `v(t) ∝ t² (1 - t)^2,6` (famiglia del
 * "minimo strappo" dei movimenti umani, resa asimmetrica): la mano parte da
 * ferma, raggiunge la velocità massima al 43% del tempo e frena più a lungo di
 * quanto ha accelerato, perché la punta si ferma premendo a fine riga (dove il
 * vector-artist mette più inchiostro). La posizione è l'integrale normalizzato
 * della velocità, tabulato una volta sola (pura matematica, nessun browser).
 *
 * Valori di controllo: 0,1 → 0,013; 0,25 → 0,142; 0,5 → 0,598;
 * 0,75 → 0,943; 0,9 → 0,997.
 */
const MANO_A = 2;
const MANO_B = 2.6;
const MANO_PASSI = 512;
let tabellaMano: Float64Array | null = null;

function tabulaMano(): Float64Array {
  if (tabellaMano) return tabellaMano;
  const t = new Float64Array(MANO_PASSI + 1);
  const vel = (u: number): number => Math.pow(u, MANO_A) * Math.pow(1 - u, MANO_B);
  let somma = 0;
  t[0] = 0;
  for (let i = 1; i <= MANO_PASSI; i++) {
    const u0 = (i - 1) / MANO_PASSI;
    const u1 = i / MANO_PASSI;
    const um = (u0 + u1) / 2;
    // Simpson sul singolo intervallo: errore trascurabile a 512 passi.
    somma += ((u1 - u0) / 6) * (vel(u0) + 4 * vel(um) + vel(u1));
    t[i] = somma;
  }
  for (let i = 0; i <= MANO_PASSI; i++) t[i] = (t[i] ?? 0) / somma;
  t[MANO_PASSI] = 1;
  tabellaMano = t;
  return t;
}

export const mano: Easing = (t: number): number => {
  const x = clamp01(t);
  if (x === 0 || x === 1) return x;
  const tab = tabulaMano();
  const p = x * MANO_PASSI;
  const i = Math.floor(p);
  const a = tab[i] ?? 0;
  const b = tab[Math.min(MANO_PASSI, i + 1)] ?? 1;
  return lerp(a, b, p - i);
};

/* ------------------------------------------------------------------ */
/* Catalogo                                                            */
/* ------------------------------------------------------------------ */

interface DefinizioneCurva {
  /** Punti di controllo della bezier (forma esatta, o ripiego per le curve campionate). */
  readonly bezier: readonly [number, number, number, number];
  /** Funzione esatta, se diversa dalla bezier. */
  readonly esatta?: Easing;
  /** Campioni per `linear()` (solo se `esatta`). */
  readonly campioni?: number;
}

/**
 * Le curve di EVIDENZIA (uso e causa in docs/motion-designer.md §2).
 * - mano:       il tratto disegnato da solo (bottone, dimostrativo), il percorso sulla mappa.
 * - rientro:    il tratto corto che torna all'inizio della riga (ritiro sotto il 55%).
 * - asciuga:    l'inchiostro rosa che si scolora quando togli un annuncio.
 * - esaurisce:  il quinto tratto, con l'evidenziatore scarico: parte e muore.
 * - solleva:    l'annuncio che si stacca dal foglio (pochi pixel, 1°).
 * - apre:       il ritaglio che si apre in scheda.
 * - chiude:     la scheda che torna ritaglio.
 * - posa:       il ritaglio che si riadagia nel suo buco.
 * - sviluppo:   la foto che passa dal retino al colore.
 * - obiettivo:  Leggi ↔ Pagina intera (su fotogrammi in scala geometrica).
 * - velo:       l'oscuramento del foglio sotto scheda e giro.
 * - lineare:    solo dove il tempo deve restare proporzionale (nessun uso visivo diretto).
 */
const CURVE_DEF: Record<NomeCurva, DefinizioneCurva> = {
  // Ripiego della mano: miglior bezier con y1 = 0, y2 = 1 (errore massimo 0,017).
  mano: { bezier: [0.46, 0, 0.4, 1], esatta: mano, campioni: 33 },
  rientro: { bezier: [0.5, 0, 0.15, 1] },
  asciuga: { bezier: [0.2, 0.55, 0.35, 1] },
  esaurisce: { bezier: [0.1, 0.6, 0.25, 1] },
  solleva: { bezier: [0.25, 0.8, 0.3, 1] },
  apre: { bezier: [0.55, 0, 0.12, 1] },
  chiude: { bezier: [0.45, 0, 0.2, 1] },
  posa: { bezier: [0.35, 0, 0.1, 1] },
  sviluppo: { bezier: [0.45, 0, 0.25, 1] },
  obiettivo: { bezier: [0.5, 0, 0.1, 1] },
  velo: { bezier: [0.33, 0, 0.25, 1] },
  lineare: { bezier: [0, 0, 1, 1] },
};

export const NOMI_CURVE = Object.keys(CURVE_DEF) as readonly NomeCurva[];

/** Le curve come funzioni TS. */
export const CURVE: Record<NomeCurva, Easing> = (() => {
  const out = {} as Record<NomeCurva, Easing>;
  for (const nome of NOMI_CURVE) {
    const d = CURVE_DEF[nome];
    out[nome] = d.esatta ?? cubicBezier(d.bezier[0], d.bezier[1], d.bezier[2], d.bezier[3]);
  }
  return out;
})();

/** Le curve come `cubic-bezier()` (sempre supportate: ripiego universale). */
export const BEZIER_CSS: Record<NomeCurva, string> = (() => {
  const out = {} as Record<NomeCurva, string>;
  for (const nome of NOMI_CURVE) {
    const b = CURVE_DEF[nome].bezier;
    out[nome] = nome === 'lineare' ? 'linear' : bezierCss(b[0], b[1], b[2], b[3]);
  }
  return out;
})();

/**
 * `linear(...)` campionata da una funzione (CSS Easing Level 2). I campioni
 * sono equidistanti nel tempo; 33 bastano per una curva morbida su 600 ms.
 */
export function cssLinear(fn: Easing, campioni = 33): string {
  const n = Math.max(2, Math.floor(campioni));
  const valori: string[] = [];
  for (let i = 0; i < n; i++) {
    const v = fn(i / (n - 1));
    valori.push(String(Math.round(v * 10000) / 10000));
  }
  return `linear(${valori.join(', ')})`;
}

let supportoLinear: boolean | null = null;

/** true se il browser accetta `linear()` come funzione di temporizzazione. Memorizzato. */
export function supportaLinear(): boolean {
  if (supportoLinear !== null) return supportoLinear;
  try {
    supportoLinear =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timing-function', 'linear(0, 0.5 40%, 1)');
  } catch {
    supportoLinear = false;
  }
  return supportoLinear;
}

const cacheLinear = new Map<NomeCurva, string>();

/**
 * La stringa CSS migliore per il browser corrente: `linear()` esatta per le
 * curve campionate (la mano) dove è supportata, altrimenti la bezier.
 * Da usare come `easing` di WAAPI o in una transizione.
 */
export function easingCss(nome: NomeCurva): string {
  const d = CURVE_DEF[nome];
  if (!d.esatta || !supportaLinear()) return BEZIER_CSS[nome];
  const c = cacheLinear.get(nome);
  if (c) return c;
  const s = cssLinear(d.esatta, d.campioni ?? 33);
  cacheLinear.set(nome, s);
  return s;
}

/* ------------------------------------------------------------------ */
/* Slancio: il tratto che eredita la velocità della mano               */
/* ------------------------------------------------------------------ */

/** Pendenza iniziale di default quando il gesto non dà la velocità. */
export const PENDENZA_SLANCIO_DEFAULT = 1.4;
const PENDENZA_MIN = 0.6;
const PENDENZA_MAX = 3.5;
const SLANCIO_X1 = 0.2;
const SLANCIO_X2 = 0.35;

/**
 * Pendenza iniziale (unità normalizzate) che fa proseguire il tratto alla
 * velocità che aveva la mano al rilascio.
 *
 * velocita: frazione di riga al secondo misurata dal gesto (positiva verso
 *   destra); distanza: frazione di riga ancora da coprire; durataMs: durata
 *   del completamento. Limitata a [0,6; 3,5]: sotto, il tratto sembrerebbe
 *   ripartire da fermo; sopra, scatterebbe.
 */
export function pendenzaSlancio(velocita: number | undefined, distanza: number, durataMs: number): number {
  if (velocita === undefined || !Number.isFinite(velocita) || distanza <= 0) return PENDENZA_SLANCIO_DEFAULT;
  const p = (Math.max(0, velocita) * (durataMs / 1000)) / distanza;
  return clamp(p, PENDENZA_MIN, PENDENZA_MAX);
}

/** Punti di controllo dello slancio: parte con la pendenza data, si ferma a fine riga senza superarla. */
function puntiSlancio(pendenza: number): [number, number, number, number] {
  const p = clamp(pendenza, PENDENZA_MIN, PENDENZA_MAX);
  // y1 ≤ 0,95 e y2 = 1: punti di controllo non decrescenti, quindi curva
  // monotona e mai oltre la fine della riga.
  return [SLANCIO_X1, Math.min(0.95, SLANCIO_X1 * p), SLANCIO_X2, 1];
}

export function slancio(pendenza: number): Easing {
  const [a, b, c, d] = puntiSlancio(pendenza);
  return cubicBezier(a, b, c, d);
}

export function slancioCss(pendenza: number): string {
  const [a, b, c, d] = puntiSlancio(pendenza);
  return bezierCss(a, b, c, d);
}
