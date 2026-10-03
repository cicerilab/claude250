/**
 * MADRE · texture dello spolvero (webgl-artist).
 *
 * Una sola texture RGBA 256², ripetibile senza cuciture, generata a runtime
 * in modo deterministico (stesso seme = stessi pixel su ogni dispositivo):
 *   R  grana fine della farina: rumore quasi bianco, decide quali puntini
 *      sono farina quando lo spolvero è sottile;
 *   G  alveoli: 0,5 = piano; sopra = bolle sotto la pelle (sul tavolo: grumi
 *      di farina); sotto = qualche bolla scoppiata (cratere con orlo);
 *   B  rumore frattale morbido: chiazze dello spolvero, onde della pelle,
 *      strisce del raschietto sul tavolo (letto a scale diverse);
 *   A  rete delle crepe (Worley F2 − F1 deformato): 0 sul bordo delle celle.
 *
 * Costo: ~15-25 ms su un portatile medio, una volta sola (nessuna rete,
 * nessun asset). Nessun accesso a window/document a livello di modulo.
 */
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, RepeatWrapping, UnsignedByteType } from 'three';

export const SPOLVERO_LATO = 256;
const SEME = 0x6d616472; // "madr"

/** PRNG piccolo e deterministico (mulberry32). */
function generatore(seme: number): () => number {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sfuma = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

/** Rumore di valore periodico: `periodo` celle sul lato (divide 256). */
function rumoreValore(periodo: number, caso: () => number): Float32Array {
  const L = SPOLVERO_LATO;
  const griglia = new Float32Array(periodo * periodo);
  for (let i = 0; i < griglia.length; i++) griglia[i] = caso();
  const out = new Float32Array(L * L);
  const k = periodo / L;
  for (let y = 0; y < L; y++) {
    const fy = y * k;
    const y0 = Math.floor(fy);
    const ty = sfuma(fy - y0);
    const r0 = (y0 % periodo) * periodo;
    const r1 = ((y0 + 1) % periodo) * periodo;
    for (let x = 0; x < L; x++) {
      const fx = x * k;
      const x0 = Math.floor(fx);
      const tx = sfuma(fx - x0);
      const c0 = x0 % periodo;
      const c1 = (x0 + 1) % periodo;
      const a = griglia[r0 + c0] ?? 0;
      const b = griglia[r0 + c1] ?? 0;
      const c = griglia[r1 + c0] ?? 0;
      const d = griglia[r1 + c1] ?? 0;
      out[y * L + x] = a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
    }
  }
  return out;
}

/** Somma di ottave periodiche, normalizzata 0..1. */
function frattale(periodi: readonly number[], caso: () => number): Float32Array {
  const L = SPOLVERO_LATO;
  const out = new Float32Array(L * L);
  let peso = 1;
  let somma = 0;
  for (const p of periodi) {
    const r = rumoreValore(p, caso);
    for (let i = 0; i < out.length; i++) out[i] = (out[i] ?? 0) + (r[i] ?? 0) * peso;
    somma += peso;
    peso *= 0.5;
  }
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < out.length; i++) {
    const v = (out[i] ?? 0) / somma;
    out[i] = v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const scala = max > min ? 1 / (max - min) : 1;
  for (let i = 0; i < out.length; i++) out[i] = ((out[i] ?? 0) - min) * scala;
  return out;
}

/** R: grana. Rumore bianco per texel con un po' di grana più grossa. */
function grana(caso: () => number): Float32Array {
  const L = SPOLVERO_LATO;
  const fine = rumoreValore(128, caso);
  const media = rumoreValore(64, caso);
  const out = new Float32Array(L * L);
  for (let i = 0; i < out.length; i++) {
    const v = caso() * 0.58 + (fine[i] ?? 0) * 0.27 + (media[i] ?? 0) * 0.15;
    // allarga la distribuzione (la somma tende al centro): soglie più nette nello shader
    out[i] = Math.max(0, Math.min(1, (v - 0.5) * 1.7 + 0.5));
  }
  return out;
}

/** G: alveoli e crateri, sommati su 0,5; distanza avvolta (ripetibile). */
function alveoli(caso: () => number): Float32Array {
  const L = SPOLVERO_LATO;
  const h = new Float32Array(L * L);
  const timbra = (cx: number, cy: number, r: number, profilo: (t: number) => number): void => {
    const est = Math.ceil(r * 1.6);
    for (let dy = -est; dy <= est; dy++) {
      for (let dx = -est; dx <= est; dx++) {
        const t = Math.hypot(dx - (cx % 1), dy - (cy % 1)) / r;
        if (t > 1.6) continue;
        const x = (((Math.floor(cx) + dx) % L) + L) % L;
        const y = (((Math.floor(cy) + dy) % L) + L) % L;
        const i = y * L + x;
        h[i] = (h[i] ?? 0) + profilo(t);
      }
    }
  };
  // bolle sotto la pelle: cupole morbide di grandezze diverse
  const bolla = (amp: number) => (t: number): number => {
    if (t >= 1) return 0;
    const s = 1 - t * t;
    return amp * s * Math.sqrt(s);
  };
  const famiglie: readonly (readonly [number, number, number, number])[] = [
    // quante, raggio min, raggio max (texel), ampiezza
    [34, 1.8, 3.4, 0.18],
    [22, 3.4, 7, 0.24],
    [8, 8, 14, 0.2],
  ];
  for (const [n, r0, r1, amp] of famiglie) {
    for (let k = 0; k < n; k++) {
      const r = r0 + (r1 - r0) * caso() * caso();
      timbra(caso() * L, caso() * L, r, bolla(amp * (0.7 + 0.6 * caso())));
    }
  }
  // bolle scoppiate: un buco con l'orlo appena rialzato
  const cratere = (amp: number) => (t: number): number => {
    if (t >= 1.5) return 0;
    const buco = t < 1 ? -(1 - t * t) * (1 - t * t) : 0;
    const orlo = Math.exp(-(((t - 1.05) / 0.25) ** 2)) * 0.35;
    return amp * (buco + orlo);
  };
  for (let k = 0; k < 6; k++) {
    timbra(caso() * L, caso() * L, 1.3 + 1.4 * caso(), cratere(0.36 + 0.16 * caso()));
  }
  for (let i = 0; i < h.length; i++) h[i] = Math.max(0, Math.min(1, 0.5 + (h[i] ?? 0)));
  return h;
}

/** A: crepe dello spolvero. Celle irregolari, bordo deformato dal rumore. */
function crepe(caso: () => number, deformaX: Float32Array, deformaY: Float32Array): Float32Array {
  const L = SPOLVERO_LATO;
  const N = 11; // celle per lato
  const cella = L / N;
  const punti = new Float32Array(N * N * 2);
  for (let i = 0; i < N * N; i++) {
    punti[i * 2] = 0.12 + 0.76 * caso();
    punti[i * 2 + 1] = 0.12 + 0.76 * caso();
  }
  const out = new Float32Array(L * L);
  const forza = 7.5; // texel di deformazione: bordi che serpeggiano
  for (let y = 0; y < L; y++) {
    for (let x = 0; x < L; x++) {
      const i = y * L + x;
      const px = x + ((deformaX[i] ?? 0.5) - 0.5) * 2 * forza;
      const py = y + ((deformaY[i] ?? 0.5) - 0.5) * 2 * forza;
      const gx = Math.floor(px / cella);
      const gy = Math.floor(py / cella);
      let f1 = Infinity;
      let f2 = Infinity;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const cx = gx + ox;
          const cy = gy + oy;
          const wx = ((cx % N) + N) % N;
          const wy = ((cy % N) + N) % N;
          const k = (wy * N + wx) * 2;
          const qx = (cx + (punti[k] ?? 0.5)) * cella;
          const qy = (cy + (punti[k + 1] ?? 0.5)) * cella;
          const d = Math.hypot(px - qx, py - qy);
          if (d < f1) {
            f2 = f1;
            f1 = d;
          } else if (d < f2) {
            f2 = d;
          }
        }
      }
      out[i] = Math.min(1, (f2 - f1) / (cella * 0.5));
    }
  }
  return out;
}

/** Pixel RGBA della texture (esportato per i test e per chi volesse cuocerla offline). */
export function generaSpolvero(seme: number = SEME): Uint8Array {
  const caso = generatore(seme);
  const L = SPOLVERO_LATO;
  const r = grana(caso);
  const g = alveoli(caso);
  const b = frattale([4, 8, 16, 32, 64], caso);
  const dx = frattale([8, 16, 32], caso);
  const dy = frattale([8, 16, 32], caso);
  const a = crepe(caso, dx, dy);
  const dati = new Uint8Array(L * L * 4);
  for (let i = 0; i < L * L; i++) {
    dati[i * 4] = Math.round((r[i] ?? 0) * 255);
    dati[i * 4 + 1] = Math.round((g[i] ?? 0.5) * 255);
    dati[i * 4 + 2] = Math.round((b[i] ?? 0.5) * 255);
    dati[i * 4 + 3] = Math.round((a[i] ?? 1) * 255);
  }
  return dati;
}

/**
 * La texture per `uSpolvero`: RepeatWrapping, mipmap (niente sfarfallio della
 * grana quando l'impasto è piccolo), dati lineari (non è un colore).
 * Chi la crea la libera con `dispose()` (lo fa `liberaImpastoMaterial`).
 */
export function creaSpolvero(seme: number = SEME): DataTexture {
  const tex = new DataTexture(generaSpolvero(seme), SPOLVERO_LATO, SPOLVERO_LATO, RGBAFormat, UnsignedByteType);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 1;
  tex.needsUpdate = true;
  return tex;
}
