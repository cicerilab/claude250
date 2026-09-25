/**
 * IMPRONTA · fibra della carta generata a runtime (webgl-artist)
 *
 * Una texture 256×256 RGBA, ripetibile senza cuciture, deterministica (stesso
 * seme = stessa carta a ogni visita). Niente foto, niente file da scaricare.
 *
 * Canali:
 *   R, G  pendenza del micro rilievo della fibra (normale xy codificata 0..255,
 *         128 = piano). Serve alla luce radente: la fibra si vede solo quando
 *         la luce è bassa, come nella carta vera.
 *   B     "formazione": nuvole larghe di densità della pasta (0..255, media 128).
 *         Varia l'albedo di pochissimo.
 *   A     soglia di assorbimento dell'inchiostro: dove le fibre sono più
 *         fitte l'inchiostro beve prima (0..255, media 128).
 *
 * Scala: 1 texel = 1 px CSS. Le fibre sono lunghe 6-30 px, larghe circa 1 px.
 *
 * Il modulo è puro fino a `creaTexturaFibra()`, che crea solo una DataTexture
 * (niente window/document).
 */
import { DataTexture, LinearFilter, RGBAFormat, RepeatWrapping, UnsignedByteType } from 'three';

export const FIBRA_LATO = 256;
export const FIBRA_SEME = 0x1b873593;

export interface DatiFibra {
  lato: number;
  dati: Uint8Array;
}

/** PRNG mulberry32: piccolo, veloce, deterministico. */
function prng(seme: number): () => number {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Rumore di valore ripetibile: griglia `periodo`×`periodo` di valori casuali,
 * interpolazione quintica, avvolgimento sui bordi. `periodo` deve dividere `lato`.
 * Ritorna valori in -1..1.
 */
function rumoreRipetibile(lato: number, periodo: number, rnd: () => number): Float32Array {
  const griglia = new Float32Array(periodo * periodo);
  for (let i = 0; i < griglia.length; i++) griglia[i] = rnd() * 2 - 1;
  const out = new Float32Array(lato * lato);
  const passo = lato / periodo;
  const liscia = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  for (let y = 0; y < lato; y++) {
    const gy = y / passo;
    const y0 = Math.floor(gy);
    const ty = liscia(gy - y0);
    const r0 = (y0 % periodo) * periodo;
    const r1 = ((y0 + 1) % periodo) * periodo;
    for (let x = 0; x < lato; x++) {
      const gx = x / passo;
      const x0 = Math.floor(gx);
      const tx = liscia(gx - x0);
      const c0 = x0 % periodo;
      const c1 = (x0 + 1) % periodo;
      const a = griglia[r0 + c0] ?? 0;
      const b = griglia[r0 + c1] ?? 0;
      const c = griglia[r1 + c0] ?? 0;
      const d = griglia[r1 + c1] ?? 0;
      const top = a + (b - a) * tx;
      const bot = c + (d - c) * tx;
      out[y * lato + x] = top + (bot - top) * ty;
    }
  }
  return out;
}

/** exp(-x) tabulata su 0..8 in 512 passi: il deposito delle fibre ne chiama mezzo milione. */
const PASSI_EXP = 512;
const MAX_EXP = 8;
let tabellaExp: Float32Array | null = null;
function expNeg(x: number): number {
  if (!tabellaExp) {
    tabellaExp = new Float32Array(PASSI_EXP + 1);
    for (let i = 0; i <= PASSI_EXP; i++) tabellaExp[i] = Math.exp(-(i / PASSI_EXP) * MAX_EXP);
  }
  if (x >= MAX_EXP) return 0;
  return tabellaExp[Math.floor(x * (PASSI_EXP / MAX_EXP))] ?? 0;
}

/**
 * Deposita un punto gaussiano (sigma in px) con avvolgimento.
 * Raggio di deposito 2 px: sufficiente per sigma fino a 1,1.
 * `lato` deve essere una potenza di 2 (l'avvolgimento è un AND).
 */
function deposita(buf: Float32Array, lato: number, x: number, y: number, sigma: number, amp: number): void {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const k = 0.5 / (sigma * sigma);
  const m = lato - 1;
  for (let dy = -2; dy <= 2; dy++) {
    const py = iy + dy;
    const wy = py - y;
    const riga = (py & m) * lato;
    for (let dx = -2; dx <= 2; dx++) {
      const px = ix + dx;
      const wx = px - x;
      const w = expNeg((wx * wx + wy * wy) * k);
      if (w < 0.01) continue;
      const i = riga + (px & m);
      buf[i] = (buf[i] ?? 0) + w * amp;
    }
  }
}

/** Normalizza un campo a media 0 e deviazione 1 (in place). */
function normalizza(buf: Float32Array): void {
  let s = 0;
  for (let i = 0; i < buf.length; i++) s += buf[i] ?? 0;
  const media = s / buf.length;
  let v = 0;
  for (let i = 0; i < buf.length; i++) {
    const d = (buf[i] ?? 0) - media;
    v += d * d;
  }
  const dev = Math.sqrt(v / buf.length) || 1;
  for (let i = 0; i < buf.length; i++) buf[i] = ((buf[i] ?? 0) - media) / dev;
}

/**
 * Percentile di valori non negativi con un istogramma a 2048 classi: stesso
 * risultato di un ordinamento a meno di 1/2048 del massimo, ma lineare
 * (l'ordinamento di 65 536 valori costava da solo 30 ms).
 */
function percentile(valori: Float32Array, p: number): number {
  let max = 0;
  for (let i = 0; i < valori.length; i++) {
    const v = valori[i] ?? 0;
    if (v > max) max = v;
  }
  if (max <= 0) return 0;
  const classi = 2048;
  const isto = new Uint32Array(classi);
  const k = (classi - 1) / max;
  for (let i = 0; i < valori.length; i++) {
    const c = Math.floor((valori[i] ?? 0) * k);
    isto[c] = (isto[c] ?? 0) + 1;
  }
  const soglia = valori.length * p;
  let somma = 0;
  for (let c = 0; c < classi; c++) {
    somma += isto[c] ?? 0;
    if (somma >= soglia) return (c + 1) / k;
  }
  return max;
}

function byte(v: number): number {
  const b = Math.round(v);
  return b < 0 ? 0 : b > 255 ? 255 : b;
}

/**
 * Il lavoro diviso in passi: ogni `yield` è un punto in cui si può cedere il
 * thread. Nessun passo supera circa 8 ms su un portatile.
 */
function* passiFibra(seme: number, latoRichiesto: number): Generator<void, DatiFibra, void> {
  // Potenza di 2 tra 64 e 1024 (serve all'avvolgimento veloce e alle texture WebGL1 ripetute).
  const lato = Math.min(1024, Math.max(64, 2 ** Math.round(Math.log2(Math.max(1, latoRichiesto)))));
  const rnd = prng(seme);
  const n = lato * lato;

  // 1. Feltro fine: la pasta di cellulosa vista da vicino.
  const feltro = new Float32Array(n);
  const f1 = rumoreRipetibile(lato, lato / 2, rnd); // periodo 2 px
  const f2 = rumoreRipetibile(lato, lato / 4, rnd); // periodo 4 px
  for (let i = 0; i < n; i++) feltro[i] = 0.55 * (f1[i] ?? 0) + 0.45 * (f2[i] ?? 0);
  yield;

  // 2. Fibre: brevi tratti leggermente curvi, orientati di preferenza lungo
  //    la direzione di macchina (orizzontale), come nella carta in bobina.
  const fibre = new Float32Array(n);
  const quante = Math.round((lato * lato) / 90);
  for (let f = 0; f < quante; f++) {
    let x = rnd() * lato;
    let y = rnd() * lato;
    let ang = rnd() < 0.62 ? (rnd() - 0.5) * 0.9 : (rnd() - 0.5) * Math.PI;
    const lunghezza = 6 + rnd() * rnd() * 24;
    const sigma = 0.5 + rnd() * 0.55;
    // Poche fibre scavano (le fibre sottili che si piegano nel feltro).
    const amp = (rnd() < 0.15 ? -0.6 : 1) * (0.45 + rnd() * 0.55);
    const curva = (rnd() - 0.5) * 0.05;
    for (let s = 0; s < lunghezza; s += 0.7) {
      // Rastrematura alle estremità.
      const t = s / lunghezza;
      const rastrema = Math.sin(Math.PI * t);
      deposita(fibre, lato, x, y, sigma, amp * (0.35 + 0.65 * rastrema));
      ang += curva + (rnd() - 0.5) * 0.05;
      x += Math.cos(ang) * 0.7;
      y += Math.sin(ang) * 0.7;
    }
    if ((f & 255) === 255) yield;
  }
  yield;

  // 3. Formazione: nuvole larghe (periodi 64, 32, 16 px).
  const formazione = new Float32Array(n);
  const m1 = rumoreRipetibile(lato, 4, rnd);
  const m2 = rumoreRipetibile(lato, 8, rnd);
  const m3 = rumoreRipetibile(lato, 16, rnd);
  for (let i = 0; i < n; i++) {
    formazione[i] = 0.55 * (m1[i] ?? 0) + 0.3 * (m2[i] ?? 0) + 0.15 * (m3[i] ?? 0);
  }

  yield;

  normalizza(feltro);
  normalizza(fibre);
  normalizza(formazione);

  // Altezza della superficie: fibre in rilievo sopra il feltro.
  const altezza = new Float32Array(n);
  for (let i = 0; i < n; i++) altezza[i] = 0.62 * (fibre[i] ?? 0) + 0.38 * (feltro[i] ?? 0);

  // Pendenze con differenze centrali (avvolte) e scala sul 99° percentile,
  // così gli 8 bit si usano tutti senza saturare quasi mai.
  const gx = new Float32Array(n);
  const gy = new Float32Array(n);
  const moduli = new Float32Array(n);
  for (let y = 0; y < lato; y++) {
    const su = ((y - 1 + lato) % lato) * lato;
    const giu = ((y + 1) % lato) * lato;
    const riga = y * lato;
    for (let x = 0; x < lato; x++) {
      const sx = (x - 1 + lato) % lato;
      const dx = (x + 1) % lato;
      const ddx = ((altezza[riga + dx] ?? 0) - (altezza[riga + sx] ?? 0)) * 0.5;
      const ddy = ((altezza[giu + x] ?? 0) - (altezza[su + x] ?? 0)) * 0.5;
      // Normale di una superficie z = h(x, y): (-dh/dx, -dh/dy, 1).
      gx[riga + x] = -ddx;
      gy[riga + x] = -ddy;
      moduli[riga + x] = Math.sqrt(ddx * ddx + ddy * ddy);
    }
  }
  const scalaPendenza = 127 / (percentile(moduli, 0.99) || 1);
  yield;

  const dati = new Uint8Array(n * 4);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    dati[o] = byte(128 + (gx[i] ?? 0) * scalaPendenza);
    dati[o + 1] = byte(128 + (gy[i] ?? 0) * scalaPendenza);
    dati[o + 2] = byte(128 + (formazione[i] ?? 0) * 42);
    // Assorbimento: le fibre guidano l'inchiostro, il feltro lo sparpaglia.
    const ass = 0.7 * (fibre[i] ?? 0) + 0.3 * (feltro[i] ?? 0);
    dati[o + 3] = byte(128 + ass * 48);
  }
  return { lato, dati };
}

/**
 * Genera i dati della fibra in un colpo solo. Circa 20 ms su un portatile
 * (50 ms la prima volta, a JIT freddo), il doppio o il triplo su un telefono
 * medio. Per non creare un task lungo usare `generaFibraAPezzi`.
 */
export function generaFibra(seme: number = FIBRA_SEME, lato: number = FIBRA_LATO): DatiFibra {
  const passi = passiFibra(seme, lato);
  for (;;) {
    const r = passi.next();
    if (r.done) return r.value;
  }
}

/**
 * Come `generaFibra`, ma cede il thread tra un passo e l'altro chiamando
 * `cedi()` (per esempio una promessa risolta da requestIdleCallback o da un
 * setTimeout 0, a scelta di chi chiama). Stesso risultato, al byte.
 */
export async function generaFibraAPezzi(
  cedi: () => Promise<void>,
  seme: number = FIBRA_SEME,
  lato: number = FIBRA_LATO,
): Promise<DatiFibra> {
  const passi = passiFibra(seme, lato);
  for (;;) {
    const r = passi.next();
    if (r.done) return r.value;
    await cedi();
  }
}

/**
 * Crea la DataTexture per lo shader. Filtro lineare, niente mipmap (la fibra
 * si campiona sempre vicino a 1 texel per px CSS), ripetizione in entrambe le
 * direzioni. Da smaltire con `.dispose()` da chi la possiede (ImprontaGL).
 */
export function creaTexturaFibra(dati: DatiFibra = generaFibra()): DataTexture {
  const tex = new DataTexture(dati.dati, dati.lato, dati.lato, RGBAFormat, UnsignedByteType);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  tex.flipY = false;
  tex.needsUpdate = true;
  return tex;
}
