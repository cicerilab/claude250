// @ts-check
// Contorno della tavola (con le effe) → maschera a griglia.
// Legge `src/pages/concepts/nodi/assets/svg/tavola.svg` del vector-artist se
// esiste (tracciati `#nod-contorno`, `#nod-effe-bassi`, `#nod-effe-acuti`, in
// millimetri, riccio in alto). Se manca, usa il contorno di riserva scritto qui
// sotto: una forma di violino 4/4 (356 × 208 mm, spalle alte 168, C 110)
// ricostruita con archi cubici, come si fa col compasso in bottega.
// Nessuna dipendenza.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));
export const PERCORSO_SVG = resolve(QUI, '../../src/pages/concepts/nodi/assets/svg/tavola.svg');

/** Misure della tavola di esempio, in mm. */
export const MISURE = {
  lunghezza: 356,
  larghezzaMax: 208, // spalle basse
  spalleAlte: 168,
  vita: 110, // alle C
};

/**
 * Metà destra del contorno di riserva (x ≥ 0), origine in alto al centro,
 * y verso il basso (v = 0 al riccio). Segmenti cubici [p0, c1, c2, p1].
 * @type {Array<[number, number][]>}
 */
const META_DESTRA = [
  [[0, 0], [44, 0], [84, 24], [84, 62]],            // spalla alta
  [[84, 62], [84, 92], [80, 104], [76, 110]],       // verso l'angolo alto
  [[76, 110], [78, 114], [81, 118], [82, 121]],     // punta dell'angolo alto
  [[82, 121], [64, 130], [55, 152], [55, 176]],     // C, metà alta
  [[55, 176], [55, 202], [68, 224], [86, 233]],     // C, metà bassa
  [[86, 233], [84, 237], [81, 241], [80, 245]],     // punta dell'angolo basso
  [[80, 245], [94, 254], [104, 272], [104, 292]],   // spalla bassa
  [[104, 292], [104, 328], [58, 356], [0, 356]],    // fondo
];

/**
 * Effe destra (lato acuti): asse a S come cubica e due occhi.
 * L'effe sinistra (lato bassi) è specchiata.
 */
const EFFE = {
  asse: /** @type {[number, number][]} */ ([[33, 152], [36, 182], [43, 202], [47, 228]]),
  semilarghezza: 2.6,
  occhioAlto: { x: 32, y: 149, r: 4.4 },
  occhioBasso: { x: 48, y: 231, r: 5.4 },
};

/**
 * @param {[number, number][]} seg
 * @param {number} t
 * @returns {[number, number]}
 */
function cubica(seg, t) {
  const [p0, c1, c2, p1] = seg;
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0], a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1]];
}

/**
 * Poligono chiuso del contorno di riserva (senso orario visto dall'alto).
 * @returns {[number, number][]}
 */
export function poligonoRiserva() {
  /** @type {[number, number][]} */
  const destra = [];
  for (const seg of META_DESTRA) {
    for (let k = 0; k < 24; k++) destra.push(cubica(seg, k / 24));
  }
  destra.push([0, MISURE.lunghezza]);
  const sinistra = destra.slice(1, -1).reverse().map(([x, y]) => /** @type {[number, number]} */ ([-x, y]));
  return destra.concat(sinistra);
}

/**
 * Punti dell'asse di un'effe (segno = +1 lato acuti, -1 lato bassi).
 * @param {number} segno
 * @returns {{ asse: [number, number][], occhi: { x: number, y: number, r: number }[], semilarghezza: number }}
 */
export function effeRiserva(segno) {
  /** @type {[number, number][]} */
  const asse = [];
  const seg = EFFE.asse.map(([x, y]) => /** @type {[number, number]} */ ([segno * x, y]));
  for (let k = 0; k <= 40; k++) asse.push(cubica(seg, k / 40));
  return {
    asse,
    occhi: [
      { x: segno * EFFE.occhioAlto.x, y: EFFE.occhioAlto.y, r: EFFE.occhioAlto.r },
      { x: segno * EFFE.occhioBasso.x, y: EFFE.occhioBasso.y, r: EFFE.occhioBasso.r },
    ],
    semilarghezza: EFFE.semilarghezza,
  };
}

/**
 * Punto dentro un poligono (regola pari/dispari).
 * @param {[number, number][]} poly
 * @param {number} x
 * @param {number} y
 */
export function dentro(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/**
 * Distanza di un punto da una polilinea.
 * @param {[number, number][]} linea
 * @param {number} x
 * @param {number} y
 */
function distanzaPolilinea(linea, x, y) {
  let best = Infinity;
  for (let i = 0; i + 1 < linea.length; i++) {
    const [ax, ay] = linea[i];
    const [bx, by] = linea[i + 1];
    const dx = bx - ax, dy = by - ay;
    const l2 = dx * dx + dy * dy || 1e-9;
    let t = ((x - ax) * dx + (y - ay) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const px = ax + t * dx - x, py = ay + t * dy - y;
    const d = Math.sqrt(px * px + py * py);
    if (d < best) best = d;
  }
  return best;
}

// ---------------------------------------------------------------------------
// Lettura dell'SVG del vector-artist (M L H V C S Q T Z, assoluti e relativi).

/**
 * @param {string} d
 * @returns {[number, number][]}
 */
export function appiattisciPath(d) {
  const token = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  /** @type {[number, number][]} */
  const out = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0;
  const num = () => parseFloat(token[i++]);
  const spingi = (/** @type {number} */ px, /** @type {number} */ py) => { out.push([px, py]); x = px; y = py; };
  const curva = (/** @type {number} */ x1, /** @type {number} */ y1, /** @type {number} */ x2, /** @type {number} */ y2, /** @type {number} */ x3, /** @type {number} */ y3) => {
    const x0 = x, y0 = y;
    for (let k = 1; k <= 16; k++) {
      const t = k / 16, u = 1 - t;
      out.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
    }
    cx = x2; cy = y2; x = x3; y = y3;
  };
  while (i < token.length) {
    const t = token[i];
    if (/[a-zA-Z]/.test(t)) { cmd = t; i++; }
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case 'M': { const px = ox + num(), py = oy + num(); spingi(px, py); sx = px; sy = py; cmd = rel ? 'l' : 'L'; break; }
      case 'L': spingi(ox + num(), oy + num()); break;
      case 'H': spingi(ox + num(), y); break;
      case 'V': spingi(x, oy + num()); break;
      case 'C': { const a = ox + num(), b = oy + num(), c = ox + num(), d2 = oy + num(), e = ox + num(), f = oy + num(); curva(a, b, c, d2, e, f); break; }
      case 'S': { const c = ox + num(), d2 = oy + num(), e = ox + num(), f = oy + num(); curva(2 * x - cx, 2 * y - cy, c, d2, e, f); break; }
      case 'Q': { const a = ox + num(), b = oy + num(), e = ox + num(), f = oy + num();
        curva(x + (2 / 3) * (a - x), y + (2 / 3) * (b - y), e + (2 / 3) * (a - e), f + (2 / 3) * (b - f), e, f); cx = a; cy = b; break; }
      case 'T': { const a = 2 * x - cx, b = 2 * y - cy, e = ox + num(), f = oy + num();
        curva(x + (2 / 3) * (a - x), y + (2 / 3) * (b - y), e + (2 / 3) * (a - e), f + (2 / 3) * (b - f), e, f); cx = a; cy = b; break; }
      case 'Z': spingi(sx, sy); break;
      case 'A': throw new Error('contorno.mjs: comando A non supportato nel tracciato SVG, esporta con curve cubiche');
      default: throw new Error(`contorno.mjs: comando SVG sconosciuto "${cmd}"`);
    }
  }
  return out;
}

/**
 * @param {string} svg
 * @param {string} id
 */
function attributoD(svg, id) {
  const m = svg.match(new RegExp(`<path[^>]*id="${id}"[^>]*>`));
  if (!m) return null;
  const d = m[0].match(/\sd="([^"]+)"/);
  return d ? d[1] : null;
}

/**
 * Descrizione geometrica della tavola: contorno (poligono in mm, x centrata)
 * e due effe come poligoni oppure come asse + occhi.
 * @typedef {{
 *   sorgente: 'svg' | 'riserva',
 *   contorno: [number, number][],
 *   effe: Array<{ poligono?: [number, number][], asse?: [number, number][], occhi?: { x: number, y: number, r: number }[], semilarghezza?: number }>,
 *   rettangolo: { x0: number, y0: number, w: number, h: number },
 * }} Tavola
 */

/** @returns {Tavola} */
export function leggiTavola() {
  if (existsSync(PERCORSO_SVG)) {
    const svg = readFileSync(PERCORSO_SVG, 'utf8');
    const dC = attributoD(svg, 'nod-contorno');
    const dB = attributoD(svg, 'nod-effe-bassi');
    const dA = attributoD(svg, 'nod-effe-acuti');
    if (dC && dB && dA) {
      const contorno = appiattisciPath(dC);
      const xs = contorno.map((p) => p[0]);
      const ys = contorno.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const cx = (x0 + x1) / 2;
      /** @param {[number, number][]} p */
      const centra = (p) => p.map(([x, y]) => /** @type {[number, number]} */ ([x - cx, y - y0]));
      return {
        sorgente: 'svg',
        contorno: centra(contorno),
        effe: [{ poligono: centra(appiattisciPath(dB)) }, { poligono: centra(appiattisciPath(dA)) }],
        rettangolo: { x0: x0 - cx, y0: 0, w: x1 - x0, h: y1 - y0 },
      };
    }
  }
  return {
    sorgente: 'riserva',
    contorno: poligonoRiserva(),
    effe: [effeRiserva(-1), effeRiserva(1)],
    rettangolo: { x0: -MISURE.larghezzaMax / 2, y0: 0, w: MISURE.larghezzaMax, h: MISURE.lunghezza },
  };
}

/**
 * @param {Tavola} tavola
 * @param {number} x
 * @param {number} y
 */
export function inEffe(tavola, x, y) {
  for (const e of tavola.effe) {
    if (e.poligono) { if (dentro(e.poligono, x, y)) return true; continue; }
    if (e.asse && e.semilarghezza !== undefined && distanzaPolilinea(e.asse, x, y) <= e.semilarghezza) return true;
    for (const o of e.occhi ?? []) {
      const dx = x - o.x, dy = y - o.y;
      if (dx * dx + dy * dy <= o.r * o.r) return true;
    }
  }
  return false;
}

/**
 * Maschera a griglia: 1 dentro la tavola e fuori dalle effe. Celle indicizzate
 * k = j * nu + i, i lungo la larghezza (u), j lungo la lunghezza (v, 0 in alto).
 * @param {Tavola} tavola
 * @param {number} nu
 * @param {number} nv
 * @returns {{ maschera: Uint8Array, nu: number, nv: number, cella: { w: number, h: number }, xDaU: (u: number) => number, yDaV: (v: number) => number, dentroTavola: (x: number, y: number) => boolean }}
 */
export function costruisciMaschera(tavola, nu, nv) {
  const { x0, y0, w, h } = tavola.rettangolo;
  const maschera = new Uint8Array(nu * nv);
  const xDaU = (/** @type {number} */ u) => x0 + u * w;
  const yDaV = (/** @type {number} */ v) => y0 + v * h;
  const dentroTavola = (/** @type {number} */ x, /** @type {number} */ y) => dentro(tavola.contorno, x, y) && !inEffe(tavola, x, y);
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      // sotto-campionamento 2×2 per cella: dentro se almeno 3 dei 4 punti lo sono
      let c = 0;
      for (const du of [0.25, 0.75]) for (const dv of [0.25, 0.75]) {
        if (dentroTavola(xDaU((i + du) / nu), yDaV((j + dv) / nv))) c++;
      }
      maschera[j * nu + i] = c >= 3 ? 1 : 0;
    }
  }
  return { maschera, nu, nv, cella: { w: w / nu, h: h / nv }, xDaU, yDaV, dentroTavola };
}
