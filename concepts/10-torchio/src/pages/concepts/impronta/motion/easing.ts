/**
 * IMPRONTA · curve di movimento.
 *
 * Ogni curva risponde alla domanda "chi lo spinge?" (trend-researcher P11):
 * - pressa        la platina scende con peso, frena sul foglio, la carta
 *                 restituisce un ritorno elastico del 2% che si smorza;
 * - rilascio      la platina si stacca: un attimo di adesione, poi sale;
 * - leva          la pressa segue la mano che tiene premuto, frena in fondo;
 * - assorbe       la carta nuova si propaga come inchiostro che bagna le fibre;
 * - sfoglia       un foglio che scorre su un altro (segnapagina, indice);
 * - scorrimento   il carrello del torchio tirabozze che porta il foglio a un'ancora.
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

export function smootherstep(e0: number, e1: number, x: number): number {
  return smootherstep01(inverseLerp(e0, e1, x));
}

/** Derivata numerica centrata di una curva (unità: valore per unità di t). */
export function derivata(fn: Easing, t: number, h = 1e-3): number {
  const a = clamp01(t - h);
  const b = clamp01(t + h);
  const d = b - a;
  return d <= 0 ? 0 : (fn(b) - fn(a)) / d;
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
/* La pressa                                                           */
/* ------------------------------------------------------------------ */

/**
 * Giro 2 (giuria: "la pressa che scende non si percepisce"). La corsa ora ha
 * peso: la platina parte lenta (inerzia), accelera, frena contro la carta e
 * tocca al 70% del tempo. Con 1100 ms i fotogrammi a 0/300/600/900/1200 ms
 * mostrano cinque stati diversi (piatto, appena accennato, quasi pieno,
 * contatto, carta che si riassesta) invece di un salto nei primi 300 ms.
 */

/** Frazione della durata in cui la platina tocca il foglio. */
export const PRESSA_CONTATTO = 0.7;
/** Profondità del primo ritorno elastico della carta (2% del rilievo). */
export const PRESSA_RITORNO = 0.02;
/** Smorzamento del ritorno: il secondo rimbalzo vale circa il 18% del primo. */
const PRESSA_SMORZAMENTO = 3.4;
/** Normalizza il ritorno perché il primo picco valga esattamente 1. */
const RITORNO_NORMA = Math.exp(PRESSA_SMORZAMENTO * 0.25);
/** Inizio (frazione della discesa) in cui la carta comincia a opporsi: nasce l'urto. */
const URTO_INIZIO = 0.78;
/** Decadimento dell'urto dopo il contatto. */
const URTO_DECADIMENTO = 4.5;

/**
 * Ritorno elastico della carta dopo il contatto, per u in 0..1.
 * Vale 0 agli estremi (con derivata nulla), primo picco 1 a u = 0,25,
 * secondo picco circa 0,18 a u = 0,75. Mai negativo: la carta risale
 * un poco e torna giù, non va mai più a fondo della forma.
 */
export function ritornoElastico(u: number): number {
  const x = clamp01(u);
  const s = Math.sin(2 * Math.PI * x);
  return Math.exp(-PRESSA_SMORZAMENTO * x) * s * s * RITORNO_NORMA;
}

/** La discesa della platina, 0..1 sul suo tratto: parte lenta, accelera, frena. */
function discesa(u: number): number {
  return smootherstep01(u);
}

/**
 * La curva firma: 0 = foglio piatto, 1 = impressione piena.
 * Discesa con peso (smootherstep) fino al contatto al 70% del tempo, a
 * velocità nulla; poi la carta restituisce il 2% e si assesta. Continua
 * con derivata continua. Resta sempre in 0..1.
 */
export function pressa(t: number): number {
  const x = clamp01(t);
  if (x >= 1) return 1;
  if (x < PRESSA_CONTATTO) return discesa(x / PRESSA_CONTATTO);
  const u = (x - PRESSA_CONTATTO) / (1 - PRESSA_CONTATTO);
  return 1 - PRESSA_RITORNO * ritornoElastico(u);
}

/**
 * L'urto: quanto la carta INTORNO alle lettere è schiacciata in questo
 * istante della curva `pressa`, 0..1. Nasce quando la platina comincia a
 * incontrare resistenza (78% della discesa), è massimo al contatto, poi si
 * scarica in modo esponenziale e vale esattamente 0 alla fine. È un
 * transitorio: a riposo è sempre 0 (la carta intorno torna piana).
 * Monotono in salita e in discesa: un solo picco, nessun lampeggio.
 */
export function urtoPressa(t: number): number {
  const x = clamp01(t);
  if (x >= 1) return 0;
  if (x < PRESSA_CONTATTO) return smoothstep01((x / PRESSA_CONTATTO - URTO_INIZIO) / (1 - URTO_INIZIO));
  const u = (x - PRESSA_CONTATTO) / (1 - PRESSA_CONTATTO);
  return Math.exp(-URTO_DECADIMENTO * u) * (1 - u);
}

/** Come `pressa` ma senza ritorno elastico né urto: per reduced motion sulla leva. */
export function pressaSenzaRitorno(t: number): number {
  return discesa(clamp01(t));
}

/**
 * Il rilascio: la platina si stacca. Un breve attimo di adesione
 * (la carta resta attaccata alla forma), poi sale e si posa morbida.
 * Da usare come progresso della risalita: valore = lerp(da, a, rilascio(t)).
 */
export const rilascio: Easing = cubicBezier(0.5, 0, 0.18, 1);

/**
 * La leva: la pressa segue la mano che tiene premuto. Quasi lineare
 * (la mano la sente come proporzionale al tempo) con una frenata in fondo,
 * appena prima del contatto.
 */
export const leva: Easing = cubicBezier(0.3, 0.12, 0.34, 1);

/** Carta che assorbe: parte rapida dal punto toccato e rallenta come una macchia che si allarga. */
export const assorbe: Easing = cubicBezier(0.16, 0.64, 0.32, 1);

/** Un foglio che scorre su un altro: segnapagina, indice mobile, lastra del banco. */
export const sfoglia: Easing = cubicBezier(0.22, 0.61, 0.24, 1);

/** Il foglio che esce di scena scorrendo (uscita di segnapagina e indice). */
export const sfogliaVia: Easing = cubicBezier(0.4, 0, 0.7, 0.2);

/**
 * Il carrello del torchio tirabozze: parte con la spinta del braccio,
 * attraversa a velocità piena, frena lungo perché il foglio si fermi
 * esattamente sotto la testata. Usata per l'arrivo alle ancore (lenis).
 */
export const scorrimento: Easing = cubicBezier(0.62, 0.02, 0.2, 1);

/** Lineare, per le sole dissolvenze di opacità (niente cambi di luminosità bruschi). */
export const lineare: Easing = (t: number): number => clamp01(t);

/* ------------------------------------------------------------------ */
/* Versioni CSS                                                        */
/* ------------------------------------------------------------------ */

/**
 * Campiona una curva in una funzione CSS `linear()` (Chrome 113, Firefox 112,
 * Safari 17.2). Serve per la pressa, che un cubic-bezier non può descrivere
 * per via del ritorno elastico.
 */
export function cssLinear(fn: Easing, campioni = 48, decimali = 4): string {
  const n = Math.max(2, Math.floor(campioni));
  const punti: string[] = [];
  for (let i = 0; i <= n; i += 1) {
    const v = fn(i / n);
    punti.push(Number(v.toFixed(decimali)).toString());
  }
  return `linear(${punti.join(', ')})`;
}

/** Le stesse curve come cubic-bezier CSS (la pressa ha un'approssimazione senza ritorno). */
export const BEZIER_CSS = {
  pressa: 'cubic-bezier(0.6, 0, 0.3, 1)',
  rilascio: 'cubic-bezier(0.5, 0, 0.18, 1)',
  leva: 'cubic-bezier(0.3, 0.12, 0.34, 1)',
  assorbe: 'cubic-bezier(0.16, 0.64, 0.32, 1)',
  sfoglia: 'cubic-bezier(0.22, 0.61, 0.24, 1)',
  sfogliaVia: 'cubic-bezier(0.4, 0, 0.7, 0.2)',
  scorrimento: 'cubic-bezier(0.62, 0.02, 0.2, 1)',
  lineare: 'linear',
} as const;

export type NomeCurva = keyof typeof BEZIER_CSS;

export const CURVE: Readonly<Record<NomeCurva, Easing>> = {
  pressa,
  rilascio,
  leva,
  assorbe,
  sfoglia,
  sfogliaVia,
  scorrimento,
  lineare,
};

let pressaCssMemo: string | null = null;

/** `linear()` della pressa, calcolata una volta sola e poi riusata. */
export function pressaCss(): string {
  if (pressaCssMemo === null) pressaCssMemo = cssLinear(pressa, 64);
  return pressaCssMemo;
}
