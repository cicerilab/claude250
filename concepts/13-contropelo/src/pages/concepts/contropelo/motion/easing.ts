/**
 * CONTROPELO · curve di movimento (motion-designer).
 *
 * Ogni curva risponde alla domanda "chi lo muove?". Nel salone si muovono
 * solo quattro cose: la testa di chi è seduto (gira), la mano del barbiere
 * (palmo, straccio, pennarello, sottolinea), il vapore (sale, condensa) e
 * l'acqua (goccia). Tutto il resto è interfaccia e si muove il meno possibile
 * (raccolta, tastiera, striscia).
 *
 * - gira        la testa che ruota sulla poltrona verso lo specchio accanto:
 *               parte morbida (inerzia del collo), frena lunga e si posa.
 * - palmo       la passata automatica dell'apertura: la mano accelera sul
 *               vetro e rallenta in fondo, senza fermarsi di colpo.
 * - straccio    lo straccio che cancella la lista: un colpo deciso, frena
 *               appena prima del bordo.
 * - pennarello  la scrittura riga per riga e del tuo nome: velocità quasi
 *               costante, un attimo di appoggio all'inizio, stacco morbido.
 * - sottolinea  il tratto turchese sotto il tuo nome: il polso scatta e
 *               frena secco, come una firma.
 * - sale        il fronte del vapore che sale dal basso: quasi lineare,
 *               rallenta un poco in alto dove il vapore è più leggero.
 * - condensa    il vapore che torna in un punto: nasce piano (goccioline
 *               che si formano), si infittisce, si chiude senza scatto.
 * - goccia      la corsa di una goccia: parte con il suo peso e si ferma.
 * - raccolta    le righe della lista che si stringono attorno alla riga di
 *               scrittura (FLIP, solo transform).
 * - tastiera    la riga di scrittura che segue la tastiera virtuale (vicina
 *               alla curva della tastiera di iOS e Android).
 * - striscia    la riga di stato che esce da dietro la mensola su mobile.
 * - lineare     solo dissolvenze di opacità (riduzione del movimento, cambio
 *               di modo del vapore, righe raccolte).
 *
 * Nessuna curva va oltre 1 né sotto 0: niente rimbalzi, niente elastici.
 * Su uno specchio niente rimbalza.
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

/**
 * Inversa numerica di una curva monotona crescente su 0..1 (bisezione,
 * errore < 1e-6). Serve per passare da "quanto vapore voglio" a "quanto
 * tempo è passato" (vedi `etaPerNebbia` in tempi.ts).
 */
export function inversa(fn: Easing, y: number): number {
  const obiettivo = clamp01(y);
  if (obiettivo <= 0) return 0;
  if (obiettivo >= 1) return 1;
  let basso = 0;
  let alto = 1;
  for (let i = 0; i < 40; i += 1) {
    const mezzo = (basso + alto) / 2;
    if (fn(mezzo) < obiettivo) basso = mezzo;
    else alto = mezzo;
  }
  return (basso + alto) / 2;
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
 * Le curve come cubic-bezier CSS. Sono la fonte: le funzioni TS sotto sono
 * costruite da questi stessi numeri, e motion.css li ripete identici nelle
 * variabili --ctp-ease-* (se ne cambi uno, cambialo anche lì).
 */
export const BEZIER = {
  gira: [0.32, 0.04, 0.12, 1],
  palmo: [0.45, 0.05, 0.3, 1],
  straccio: [0.5, 0.08, 0.3, 1],
  pennarello: [0.3, 0.12, 0.45, 1],
  sottolinea: [0.55, 0.02, 0.2, 1],
  sale: [0.25, 0.2, 0.45, 1],
  raccolta: [0.22, 0.7, 0.26, 1],
  tastiera: [0.2, 0.8, 0.2, 1],
  striscia: [0.22, 0.68, 0.3, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type NomeBezier = keyof typeof BEZIER;

function daBezier(nome: NomeBezier): Easing {
  const [x1, y1, x2, y2] = BEZIER[nome];
  return cubicBezier(x1, y1, x2, y2);
}

/** La testa che gira verso lo specchio accanto (pan della parete, 650 ms). */
export const gira: Easing = daBezier('gira');

/** La mano che passa sul vetro nell'apertura (passata automatica, 700 ms). */
export const palmo: Easing = daBezier('palmo');

/** Lo straccio che cancella la lista o il tuo nome (400 ms). */
export const straccio: Easing = daBezier('straccio');

/** Il pennarello che scrive: righe della lista, il tuo nome, il trattino che torna. */
export const pennarello: Easing = daBezier('pennarello');

/** Il tratto turchese sotto il tuo nome (400 ms). */
export const sottolinea: Easing = daBezier('sottolinea');

/** Il fronte del vapore che sale dal basso nell'apertura (2400 ms). */
export const sale: Easing = daBezier('sale');

/** Le righe che si stringono attorno alla riga di scrittura (FLIP, 300 ms). */
export const raccolta: Easing = daBezier('raccolta');

/** La riga di scrittura che segue la tastiera virtuale (250 ms). */
export const tastiera: Easing = daBezier('tastiera');

/** La riga di stato che esce da dietro la mensola su mobile (320 ms). */
export const striscia: Easing = daBezier('striscia');

/** Solo dissolvenze di opacità. */
export const lineare: Easing = (t: number): number => clamp01(t);

/**
 * Il vapore che torna in un punto, per u in 0..1 sul suo tratto di ritorno
 * (i tempi del tratto sono in tempi.ts, `VAPORE`). Smootherstep: parte a
 * velocità nulla (nessuno scatto alla fine della pausa di pulito), la
 * velocità massima è 1,875 volte la media, arriva a velocità nulla.
 * Monotona: in un punto il vapore sale e basta, mai oscillazioni.
 */
export const condensa: Easing = smootherstep01;

/**
 * La corsa di una goccia, per u in 0..1: parte con il suo peso (velocità
 * iniziale 1,7 volte la media) e si ferma dolcemente dove l'acqua finisce.
 */
export function goccia(u: number): number {
  const x = clamp01(u);
  return 1 - Math.pow(1 - x, 1.7);
}

/** Tutte le curve per nome (per chi riceve il nome da un dato). */
export const CURVE: Readonly<Record<NomeBezier | 'lineare' | 'condensa' | 'goccia', Easing>> = {
  gira,
  palmo,
  straccio,
  pennarello,
  sottolinea,
  sale,
  raccolta,
  tastiera,
  striscia,
  lineare,
  condensa,
  goccia,
};

/* ------------------------------------------------------------------ */
/* Versioni CSS                                                        */
/* ------------------------------------------------------------------ */

function bezierCss(nome: NomeBezier): string {
  const [x1, y1, x2, y2] = BEZIER[nome];
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}

/** Le curve come stringhe CSS, per chi scrive una transizione da JS (FLIP). */
export const BEZIER_CSS: Readonly<Record<NomeBezier | 'lineare', string>> = {
  gira: bezierCss('gira'),
  palmo: bezierCss('palmo'),
  straccio: bezierCss('straccio'),
  pennarello: bezierCss('pennarello'),
  sottolinea: bezierCss('sottolinea'),
  sale: bezierCss('sale'),
  raccolta: bezierCss('raccolta'),
  tastiera: bezierCss('tastiera'),
  striscia: bezierCss('striscia'),
  lineare: 'linear',
};
