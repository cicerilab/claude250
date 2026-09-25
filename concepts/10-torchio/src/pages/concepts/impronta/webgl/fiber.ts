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

/**
 * Deposita un punto gaussiano (sigma in px) con avvolgimento.
 * Raggio di deposito 2 px: sufficiente per sigma fino a 1,1.
 */
function deposita(buf: Float32Array, lato: number, x: number, y: number, sigma: number, amp: number): void {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const k = -0.5 / (sigma * sigma);
  for (let dy = -2; dy <= 2; dy++) {
    const py = iy + dy;
    const wy = py - y;
    const riga = (((py % lato) + lato) % lato) * lato;
    for (let dx = -2; dx <= 2; dx++) {
      const px = ix + dx;
      const wx = px - x;
      const w = Math.exp((wx * wx + wy * wy) * k);
      if (w < 0.01) continue;
      const i = riga + (((px % lato) + lato) % lato);
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

function byte(v: number): number {
  const b = Math.round(v);
  return b < 0 ? 0 : b > 255 ? 255 : b;
}

/**
 * Genera i dati della fibra. Circa 6-12 ms su un telefono medio: si chiama
 * una volta sola, alla creazione della scena.
 */
export function generaFibra(seme: number = FIBRA_SEME, lato: number = FIBRA_LATO): DatiFibra {
  const rnd = prng(seme);
  const n = lato * lato;

  // 1. Feltro fine: la pasta di cellulosa vista da vicino.
  const feltro = new Float32Array(n);
  const f1 = rumoreRipetibile(lato, lato / 2, rnd); // periodo 2 px
  const f2 = rumoreRipetibile(lato, lato / 4, rnd); // periodo 4 px
  for (let i = 0; i < n; i++) feltro[i] = 0.55 * (f1[i] ?? 0) + 0.45 * (f2[i] ?? 0);

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
    const curva = (rnd() - 0.5) * 0.12;
    for (let s = 0; s < lunghezza; s += 0.5) {
      // Rastrematura alle estremità.
      const t = s / lunghezza;
      const rastrema = Math.sin(Math.PI * t);
      deposita(fibre, lato, x, y, sigma, amp * (0.35 + 0.65 * rastrema));
      ang += curva + (rnd() - 0.5) * 0.08;
      x += Math.cos(ang) * 0.5;
      y += Math.sin(ang) * 0.5;
    }
  }

  // 3. Formazione: nuvole larghe (periodi 64, 32, 16 px).
  const formazione = new Float32Array(n);
  const m1 = rumoreRipetibile(lato, 4, rnd);
  const m2 = rumoreRipetibile(lato, 8, rnd);
  const m3 = rumoreRipetibile(lato, 16, rnd);
  for (let i = 0; i < n; i++) {
    formazione[i] = 0.55 * (m1[i] ?? 0) + 0.3 * (m2[i] ?? 0) + 0.15 * (m3[i] ?? 0);
  }

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
      moduli[riga + x] = Math.hypot(ddx, ddy);
    }
  }
  const ordinati = Array.from(moduli).sort((a, b) => a - b);
  const p99 = ordinati[Math.floor(ordinati.length * 0.99)] ?? 1;
  const scalaPendenza = 127 / (p99 || 1);

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
