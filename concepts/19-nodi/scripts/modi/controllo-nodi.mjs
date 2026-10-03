// @ts-check
// PNG di controllo delle linee nodali (per il doc del webgl-artist, in qa/modi/).
// Uso diretto: `node scripts/modi/controllo-nodi.mjs` rilegge webgl/dati/modi.bin
// e modi-meta.ts e riscrive le tre PNG. calcola-modi.mjs chiama scriviPng()
// anche per i modi scartati. Nessuna dipendenza: PNG scritte a mano con zlib.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const QUI = dirname(fileURLToPath(import.meta.url));
export const CARTELLA_QA = resolve(QUI, '../../qa/modi');
const DATI = resolve(QUI, '../../src/pages/concepts/nodi/webgl/dati');

/** @type {Uint32Array | null} */
let tabellaCrc = null;
/** @param {Uint8Array} buf */
function crc32(buf) {
  if (!tabellaCrc) {
    tabellaCrc = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      tabellaCrc[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = tabellaCrc[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * @param {string} tipo
 * @param {Uint8Array} dati
 */
function blocco(tipo, dati) {
  const out = new Uint8Array(12 + dati.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, dati.length);
  for (let i = 0; i < 4; i++) out[4 + i] = tipo.charCodeAt(i);
  out.set(dati, 8);
  dv.setUint32(8 + dati.length, crc32(out.subarray(4, 8 + dati.length)));
  return out;
}

/**
 * PNG RGB 8 bit.
 * @param {number} w
 * @param {number} h
 * @param {Uint8Array} rgb  w*h*3
 */
export function codificaPng(w, h, rgb) {
  const righe = new Uint8Array(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) {
    righe[y * (w * 3 + 1)] = 0;
    righe.set(rgb.subarray(y * w * 3, (y + 1) * w * 3), y * (w * 3 + 1) + 1);
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, w);
  dv.setUint32(4, h);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const firma = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const parti = [firma, blocco('IHDR', ihdr), blocco('IDAT', deflateSync(righe, { level: 9 })), blocco('IEND', new Uint8Array(0))];
  const tot = parti.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(tot);
  let o = 0;
  for (const p of parti) { out.set(p, o); o += p.length; }
  return out;
}

const ABETE = [230, 212, 172];
const FUORI = [250, 248, 244];
const TE = [59, 43, 29];
const POSITIVO = [214, 191, 142];
const NEGATIVO = [238, 226, 200];
const CUSCINETTO = [139, 58, 29];

/**
 * Immagine di controllo di un campo: abete chiaro/scuro per il segno di w,
 * linea nodale in tè, fuori dalla tavola quasi bianco, cuscinetti in rosso.
 * @param {{ campo: ArrayLike<number>, maschera: ArrayLike<number>, nu: number, nv: number, scala: number, cuscinetti?: ReadonlyArray<readonly [number, number]>, soglia?: number }} o
 */
export function immagineCampo(o) {
  const { campo, maschera, nu, nv, scala } = o;
  const soglia = o.soglia ?? 0.035;
  const W = nu * scala, H = nv * scala;
  const rgb = new Uint8Array(W * H * 3);
  /** @param {number} u @param {number} v */
  const campiona = (u, v) => {
    const x = Math.min(nu - 1.001, Math.max(0, u * nu - 0.5));
    const y = Math.min(nv - 1.001, Math.max(0, v * nv - 0.5));
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const a = campo[j * nu + i], b = campo[j * nu + i + 1], c = campo[(j + 1) * nu + i], d = campo[(j + 1) * nu + i + 1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
  for (let Y = 0; Y < H; Y++) {
    for (let X = 0; X < W; X++) {
      const i = Math.floor(X / scala), j = Math.floor(Y / scala);
      const k = (Y * W + X) * 3;
      let col = FUORI;
      if (maschera[j * nu + i]) {
        const w = campiona((X + 0.5) / W, (Y + 0.5) / H);
        col = Math.abs(w) < soglia ? TE : w > 0 ? POSITIVO : NEGATIVO;
        if (Math.abs(w) >= soglia && Math.abs(w) < soglia * 1.6) col = ABETE;
      }
      rgb[k] = col[0]; rgb[k + 1] = col[1]; rgb[k + 2] = col[2];
    }
  }
  for (const [u, v] of o.cuscinetti ?? []) {
    const cx = u * W, cy = v * H, r = Math.max(3, scala * 2.2);
    for (let Y = Math.floor(cy - r); Y <= cy + r; Y++) for (let X = Math.floor(cx - r); X <= cx + r; X++) {
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const d = Math.hypot(X - cx, Y - cy);
      if (d <= r && d >= r - 1.6) {
        const k = (Y * W + X) * 3;
        rgb[k] = CUSCINETTO[0]; rgb[k + 1] = CUSCINETTO[1]; rgb[k + 2] = CUSCINETTO[2];
      }
    }
  }
  return { W, H, rgb };
}

/**
 * @param {string} nome
 * @param {Parameters<typeof immagineCampo>[0]} o
 */
export function scriviPng(nome, o) {
  mkdirSync(CARTELLA_QA, { recursive: true });
  const { W, H, rgb } = immagineCampo(o);
  const percorso = resolve(CARTELLA_QA, nome);
  writeFileSync(percorso, codificaPng(W, H, rgb));
  return percorso;
}

/**
 * Affianca più immagini (stessa altezza) in una sola PNG con 12 px di stacco.
 * @param {string} nome
 * @param {Array<Parameters<typeof immagineCampo>[0]>} lista
 */
export function scriviTavolaComparata(nome, lista) {
  const imm = lista.map(immagineCampo);
  const H = Math.max(...imm.map((i) => i.H));
  const W = imm.reduce((s, i) => s + i.W, 0) + 12 * (imm.length - 1);
  const rgb = new Uint8Array(W * H * 3).fill(255);
  let ox = 0;
  for (const i of imm) {
    for (let y = 0; y < i.H; y++) rgb.set(i.rgb.subarray(y * i.W * 3, (y + 1) * i.W * 3), (y * W + ox) * 3);
    ox += i.W + 12;
  }
  mkdirSync(CARTELLA_QA, { recursive: true });
  const percorso = resolve(CARTELLA_QA, nome);
  writeFileSync(percorso, codificaPng(W, H, rgb));
  return percorso;
}

/** Rilegge i dati spediti e riscrive le PNG dei tre modi. */
function daDatiSpediti() {
  const meta = readFileSync(resolve(DATI, 'modi-meta.ts'), 'utf8');
  const json = meta.slice(meta.indexOf('/*JSON*/') + 8, meta.indexOf('/*FINE*/'));
  const m = JSON.parse(json);
  const bin = new Uint8Array(readFileSync(resolve(DATI, 'modi.bin')));
  const { nu, nv } = m.griglia;
  const n = nu * nv;
  const maschera = new Uint8Array(n);
  const base = 3 * n;
  for (let k = 0; k < n; k++) maschera[k] = (bin[base + (k >> 3)] >> (k & 7)) & 1;
  const lista = [];
  for (let s = 0; s < 3; s++) {
    const campo = new Float32Array(n);
    for (let k = 0; k < n; k++) campo[k] = ((bin[s * n + k] << 24) >> 24) / 127;
    const modo = m.modi[s];
    const o = { campo, maschera, nu, nv, scala: 4, cuscinetti: modo.cuscinetti };
    scriviPng(`spedito-modo${modo.modo}.png`, o);
    lista.push(o);
  }
  console.log('PNG riscritte in', scriviTavolaComparata('spedito-modi-1-2-5.png', lista));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) daDatiSpediti();
