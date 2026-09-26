/**
 * SOTTOSCOCCA · curve di movimento (motion-designer).
 *
 * Ogni curva risponde a "che cosa lo muove in officina?":
 * - colonna      il ponte sale: il motore della centralina prende il carico,
 *                la salita è costante, frena lunga sui fermi di sicurezza;
 * - sfiato       il ponte scende: la valvola si apre, il peso fa il resto,
 *                rallenta prima di posare i bracci a terra;
 * - cassetto     un pannello su guide (scheda, barra, mensola, asta che
 *                rientra): parte deciso, si ferma morbido, nessun rimbalzo;
 * - via          lo stesso pannello che esce: prende velocità e sparisce;
 * - aggancio     il blocco del planning che scatta nella tacca dei 10 minuti;
 * - ritorno      il blocco che torna dov'era (non ci sta, ponte sbagliato);
 * - vernice      il pezzo che diventa bianco segnaletica (evidenza, 250 ms);
 * - lineare      solo per le dissolvenze di opacità;
 * - ruotaLibera  la ruota sollevata spinta con la mano: parte subito, poi
 *                l'attrito del mozzo la ferma (esponenziale, niente molla);
 * - fermo        l'assestamento dei fermi di sicurezza: il carrello si posa
 *                sul dente di 3-4 mm e l'idraulica lo riprende. Una sola
 *                discesa e una sola risalita, mai un'oscillazione.
 *
 * Modulo puro: nessun import, nessun accesso a window/document (prerender).
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
/* Le curve                                                            */
/* ------------------------------------------------------------------ */

/**
 * Salita del ponte, mappata sul tratto di scroll tra due quote. Partenza
 * morbida (la pompa prende il carico, niente strappo), tratto centrale quasi
 * costante, arrivo lungo: gli ultimi centimetri sono lenti come quando il
 * meccanico accosta il carrello al dente giusto. Velocità nulla agli estremi,
 * quindi il binario della camera non ha spigoli sulle chiavi.
 */
export const colonna: Easing = cubicBezier(0.42, 0, 0.22, 1);

/**
 * Discesa del ponte verso il planning. La valvola si apre (un attimo di
 * attesa), il peso accelera, poi la discesa si smorza per posare i bracci.
 * Più decisa di `colonna` in partenza: scendere costa meno che salire.
 */
export const sfiato: Easing = cubicBezier(0.5, 0.04, 0.26, 1);

/** Pannello su guide che entra: scheda, barra "Il tuo lavoro", mensola, asta che torna. */
export const cassetto: Easing = cubicBezier(0.2, 0.7, 0.2, 1);

/** Lo stesso pannello che esce (scheda chiusa, barra svuotata, asta che si ritira). */
export const via: Easing = cubicBezier(0.5, 0, 0.75, 0.3);

/** Il blocco del planning che scatta nella tacca: rapidissimo, frena secco, nessun rimbalzo. */
export const aggancio: Easing = cubicBezier(0.15, 0.9, 0.3, 1);

/** Il blocco che torna al bordo del buco o nel parcheggio: si stacca, scivola, si ferma. */
export const ritorno: Easing = cubicBezier(0.35, 0, 0.2, 1);

/** Il pezzo che passa da verde a bianco segnaletica (e ritorno). Simmetrica. */
export const vernice: Easing = cubicBezier(0.4, 0, 0.6, 1);

/** Lineare, per le sole dissolvenze di opacità. */
export const lineare: Easing = (t: number): number => clamp01(t);

/** Attrito del mozzo: più alto = la ruota si ferma prima. */
const ATTRITO_RUOTA = 3.2;
const NORMA_RUOTA = 1 - Math.exp(-ATTRITO_RUOTA);

/**
 * La ruota spinta con la mano: velocità massima subito (è la spinta), poi
 * decresce in modo esponenziale per l'attrito. Arriva esattamente a 1.
 * Nessuna inversione, nessun oscillare: una ruota libera non torna indietro.
 */
export function ruotaLibera(t: number): number {
  const x = clamp01(t);
  return (1 - Math.exp(-ATTRITO_RUOTA * x)) / NORMA_RUOTA;
}

/** Frazione del tempo in cui il carrello tocca il dente (fine della posa). */
export const FERMO_CONTATTO = 0.32;

/**
 * Forma dell'assestamento sui fermi di sicurezza, 0..1..0 su t in 0..1.
 * 0 → 1 accelerando (il carrello cade di pochi millimetri sul dente: caduta
 * libera, quadratica), 1 → 0 con smootherstep (l'idraulica riprende il
 * carico e riporta il ponte alla quota esatta). Un solo minimo, derivata
 * nulla alla fine. Moltiplicata per i millimetri dell'assestamento dà lo
 * scarto, sempre verso il basso.
 */
export function fermo(t: number): number {
  const x = clamp01(t);
  if (x >= 1) return 0;
  if (x < FERMO_CONTATTO) {
    const u = x / FERMO_CONTATTO;
    return u * u;
  }
  const u = (x - FERMO_CONTATTO) / (1 - FERMO_CONTATTO);
  return 1 - smootherstep01(u);
}

/* ------------------------------------------------------------------ */
/* Versioni CSS                                                        */
/* ------------------------------------------------------------------ */

/**
 * Le stesse curve come stringhe CSS. `ruotaLibera` e `fermo` vivono solo nel
 * GL (niente equivalente CSS: non servono al DOM).
 */
export const BEZIER_CSS = {
  colonna: 'cubic-bezier(0.42, 0, 0.22, 1)',
  sfiato: 'cubic-bezier(0.5, 0.04, 0.26, 1)',
  cassetto: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  via: 'cubic-bezier(0.5, 0, 0.75, 0.3)',
  aggancio: 'cubic-bezier(0.15, 0.9, 0.3, 1)',
  ritorno: 'cubic-bezier(0.35, 0, 0.2, 1)',
  vernice: 'cubic-bezier(0.4, 0, 0.6, 1)',
  lineare: 'linear',
} as const;

export type NomeCurva = keyof typeof BEZIER_CSS;

export const CURVE: Readonly<Record<NomeCurva, Easing>> = {
  colonna,
  sfiato,
  cassetto,
  via,
  aggancio,
  ritorno,
  vernice,
  lineare,
};
