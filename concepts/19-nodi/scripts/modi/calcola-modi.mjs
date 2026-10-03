// @ts-check
// Modi propri della tavola libera di un violino (abete), calcolati una volta
// offline. Rayleigh-Ritz su una piastra sottile ORTOTROPA di Kirchhoff con
// BORDI LIBERI, integrata su una griglia mascherata dal contorno vero (effe
// comprese), base di polinomi di Legendre P_i(x) P_j(y) con i + j ≤ grado.
//
// Uscite:
//   src/pages/concepts/nodi/webgl/dati/modi.bin      tre campi Int8 + maschera a 1 bit (formato i8-96x168)
//   src/pages/concepts/nodi/webgl/dati/modi-meta.ts  dimensioni, parametri, cuscinetti, centro dell'anello, topologie
//   qa/modi/*.png                                    linee nodali di tutti i modi calcolati e dei tre scelti
//
// Uso: `npm run modi` (oppure `node scripts/modi/calcola-modi.mjs [--grado 16] [--bombatura 15.5] [--catena [--catena-scala 1]]`).
// Fisica (correzioni del trend-researcher §2.2 applicate):
//   - rigidezza lungo la vena / di traverso = 15 / 0,8 GPa ≈ 19 (fascia 17-20, Haines 2000 in Jansson tab. 5.2)
//   - spessore 2,8 mm (Jansson fig. 5.16e), densità 460 kg/m³ (Jansson tab. 5.1)
//   - modo 2 della TAVOLA = due linee a parentesi ")(" lungo la tavola (non la X, che è del fondo)
//   - modo 5 della TAVOLA = anello APERTO alle C (chiuso solo nel fondo)
// La bombatura non è modellata (piastra piana): le frequenze calcolate NON si
// usano sul sito (valgono quelle di bottega 92 / 168 / 348 Hz); si usano solo
// le forme, scelte per topologia.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gramSchmidt, jacobi, legendre } from './algebra.mjs';
import { costruisciMaschera, dentro, leggiTavola } from './contorno.mjs';
import { scriviPng, scriviTavolaComparata } from './controllo-nodi.mjs';

const QUI = dirname(fileURLToPath(import.meta.url));
const DATI = resolve(QUI, '../../src/pages/concepts/nodi/webgl/dati');

const argomenti = process.argv.slice(2);
const opzione = (/** @type {string} */ nome, /** @type {number} */ def) => {
  const i = argomenti.indexOf(nome);
  return i >= 0 ? Number(argomenti[i + 1]) : def;
};

// ---------------------------------------------------------------------------
// Parametri del materiale (SI)

const ABETE = {
  EL: 15.0e9, // modulo lungo la vena (asse y, lunghezza della tavola)
  ER: opzione("--ER", 0.8) * 1e9, // modulo di traverso (asse x, radiale nel taglio di quarto)
  G: opzione("--G", 0.84) * 1e9, // modulo di taglio L-R
  nuLR: 0.37, // Poisson (contrazione R per trazione L)
  rho: 460, // kg/m³
  h: 2.8e-3, // m
};
const GRADO = opzione('--grado', 18);
const CON_CATENA = argomenti.includes('--catena');
const SCALA_CATENA = opzione('--catena-scala', 1);
/** Altezza della bombatura al centro (mm); 0 = piastra piana. */
const BOMBATURA_MM = opzione('--bombatura', 15.5);

/**
 * Catena (bass bar) come irrigidimento lungo la vena sul lato dei bassi
 * (sinistra nella vista dall'alto, riccio in alto). Trave rettangolare
 * 5,5 mm di larghezza, alta 11 mm al centro e 3 mm agli estremi, lunga 270 mm,
 * centrata sotto il piede dei bassi del ponticello.
 */
const CATENA = { xMm: -18.5, larghezzaMm: 5.5, y0Mm: 46, y1Mm: 316, altezzaCentroMm: 11, altezzaEstremiMm: 3 };

/** Quante forme calcolate (della parità giusta) entrano nella taratura, e penalità sui modi alti. */
const BASE_TARATURA = opzione('--base', 6);
const PENALITA = opzione('--penalita', 0.002);

/**
 * Linee nodali misurate da Jansson, fig. 5.17 (media di 14 tavole), riga in
 * alto: tavola armonica. Le quote sono in mm sul contorno 4/4 di 356 mm.
 */
const MISURE_JANSSON = {
  modo1: { yTraverso: 190 },
  modo2: { distanzaAlta: 140, distanzaBassa: 162, semidistanzaVita: 27, yVita: 158, esponente: 1.25 },
  modo5: { altoCentro: 69, altoBordo: 92, bassoCentro: 60, bassoBordo: 254 },
};

// Griglia di integrazione (2 mm circa) e griglia d'uscita (formato §8.2 del tech-architect).
const NU_INT = opzione('--nu', 84), NV_INT = Math.round(NU_INT * 1.712);
const NU_OUT = 96, NV_OUT = 168;

// ---------------------------------------------------------------------------

const tavola = leggiTavola();
const { x0, y0, w: Wmm, h: Hmm } = tavola.rettangolo;
console.log(`contorno: ${tavola.sorgente} (${Wmm.toFixed(1)} × ${Hmm.toFixed(1)} mm)`);

const integ = costruisciMaschera(tavola, NU_INT, NV_INT);
const semiW = Wmm / 2, semiH = Hmm / 2, cy = y0 + semiH;
const xHat = (/** @type {number} */ xmm) => xmm / semiW;
const yHat = (/** @type {number} */ ymm) => (ymm - cy) / semiH;

/** @type {Array<[number, number]>} */
const indici = [];
for (let s = 0; s <= GRADO; s++) for (let i = 0; i <= s; i++) indici.push([i, s - i]);
const N = indici.length;

// punti dentro la maschera
/** @type {number[]} */
const punti = [];
for (let k = 0; k < integ.maschera.length; k++) if (integ.maschera[k]) punti.push(k);
const G = punti.length;
const dA = (integ.cella.w * 1e-3) * (integ.cella.h * 1e-3);
console.log(`griglia ${NU_INT}×${NV_INT}, ${G} punti dentro, base di ${N} polinomi (grado ${GRADO})`);

const peso = new Float64Array(G).fill(ABETE.rho * ABETE.h * dA);
const xm = new Float64Array(G), ym = new Float64Array(G);
for (let g = 0; g < G; g++) {
  const k = punti[g];
  const i = k % NU_INT, j = (k / NU_INT) | 0;
  xm[g] = integ.xDaU((i + 0.5) / NU_INT);
  ym[g] = integ.yDaV((j + 0.5) / NV_INT);
}

// Base e derivate (prime e seconde) in metri.
const sx = 1 / (semiW * 1e-3), sy = 1 / (semiH * 1e-3);
const phi = [], px = [], py = [], pxx = [], pyy = [], pxy = [], coeff = [];
for (let a = 0; a < N; a++) {
  for (const l of [phi, px, py, pxx, pyy, pxy]) l.push(new Float64Array(G));
  const c = new Float64Array(N); c[a] = 1; coeff.push(c);
}
for (let g = 0; g < G; g++) {
  const lx = legendre(xHat(xm[g]), GRADO), ly = legendre(yHat(ym[g]), GRADO);
  for (let a = 0; a < N; a++) {
    const [i, j] = indici[a];
    phi[a][g] = lx.p[i] * ly.p[j];
    px[a][g] = lx.d1[i] * ly.p[j] * sx;
    py[a][g] = lx.p[i] * ly.d1[j] * sy;
    pxx[a][g] = lx.d2[i] * ly.p[j] * sx * sx;
    pyy[a][g] = lx.p[i] * ly.d2[j] * sy * sy;
    pxy[a][g] = lx.d1[i] * ly.d1[j] * sx * sy;
  }
}

let t0 = Date.now();
// due passate per la stabilità numerica
let tenute = gramSchmidt(phi, [px, py, pxx, pyy, pxy, coeff], peso);
const idx = tenute.flatMap((t, a) => (t ? [a] : []));
const sel = (/** @type {Float64Array[]} */ l) => idx.map((a) => l[a]);
const Phi = sel(phi), Px = sel(px), Py = sel(py), Pxx = sel(pxx), Pyy = sel(pyy), Pxy = sel(pxy), Coeff = sel(coeff);
tenute = gramSchmidt(Phi, [Px, Py, Pxx, Pyy, Pxy, Coeff], peso);
const n = Phi.length;
console.log(`base ortonormale: ${n} funzioni (${N - n} scartate), ${Date.now() - t0} ms`);

// ---------------------------------------------------------------------------
// Bombatura: guscio sottile ribassato (Marguerre). z0(x, y) è l'altezza della
// tavola sul piano delle fasce: arco lungo la tavola × arco di traverso a
// campana di coseno sulla semilarghezza locale (sguscio verso il bordo).
// Con BOMBATURA = 0 il modello torna la piastra piana.

/** semilarghezza locale del contorno (mm) per ogni riga della griglia d'integrazione */
const semilarghezza = new Float64Array(NV_INT);
for (let j = 0; j < NV_INT; j++) {
  const ymm = integ.yDaV((j + 0.5) / NV_INT);
  let b = 0;
  for (let xmm = 0; xmm <= semiW; xmm += 0.5) if (integ.dentroTavola(xmm, ymm) || integ.dentroTavola(-xmm, ymm)) b = xmm;
  // le effe non accorciano la semilarghezza: si prende il bordo esterno
  semilarghezza[j] = Math.max(b, 1);
}
const z0 = new Float64Array(G), z0x = new Float64Array(G), z0y = new Float64Array(G);
{
  const Hb = BOMBATURA_MM;
  /** @param {number} xmm @param {number} ymm */
  const quota = (xmm, ymm) => {
    const t = Math.min(1, Math.max(0, (ymm - y0) / Hmm));
    const jf = Math.min(NV_INT - 1, Math.max(0, t * NV_INT - 0.5));
    const j0 = Math.floor(jf), j1 = Math.min(NV_INT - 1, j0 + 1), fj = jf - j0;
    const b = semilarghezza[j0] * (1 - fj) + semilarghezza[j1] * fj;
    const s = Math.min(1, Math.abs(xmm) / b);
    const lungo = Math.pow(Math.sin(Math.PI * t), 0.7);
    const traverso = 0.5 * (1 + Math.cos(Math.PI * s));
    return Hb * lungo * traverso;
  };
  const e = 0.25;
  for (let g = 0; g < G; g++) {
    z0[g] = quota(xm[g], ym[g]) * 1e-3;
    z0x[g] = (quota(xm[g] + e, ym[g]) - quota(xm[g] - e, ym[g])) / (2 * e);
    z0y[g] = (quota(xm[g], ym[g] + e) - quota(xm[g], ym[g] - e)) / (2 * e);
  }
}

// Rigidezze (x = di traverso, R; y = lungo la vena, L).
const nuRL = (ABETE.nuLR * ABETE.ER) / ABETE.EL;
const den = 1 - ABETE.nuLR * nuRL;
const h3 = ABETE.h ** 3;
const Dx = (ABETE.ER * h3) / (12 * den);
const DyPiastra = (ABETE.EL * h3) / (12 * den);
const D12 = ABETE.nuLR * Dx;
const D66 = (ABETE.G * h3) / 12;
const A11 = (ABETE.ER * ABETE.h) / den;
const A22 = (ABETE.EL * ABETE.h) / den;
const A12 = ABETE.nuLR * A11;
const A66 = ABETE.G * ABETE.h;
const Dy = new Float64Array(G).fill(DyPiastra);
if (CON_CATENA) {
  const c = CATENA;
  const meta = (c.y1Mm - c.y0Mm) / 2, centro = (c.y0Mm + c.y1Mm) / 2;
  for (let g = 0; g < G; g++) {
    if (Math.abs(xm[g] - c.xMm) > c.larghezzaMm / 2 || ym[g] < c.y0Mm || ym[g] > c.y1Mm) continue;
    const t = (ym[g] - centro) / meta;
    const H = (c.altezzaEstremiMm + (c.altezzaCentroMm - c.altezzaEstremiMm) * Math.sqrt(Math.max(0, 1 - t * t))) * 1e-3;
    // trave incollata sotto la tavola: E I / b della sezione composta, distribuito sulla sua larghezza
    const EIperB = (SCALA_CATENA * ABETE.EL * (H + ABETE.h) ** 3) / 12;
    Dy[g] = Math.max(DyPiastra, EIperB);
  }
}
console.log(`rapporto di rigidezza EL/ER = ${(ABETE.EL / ABETE.ER).toFixed(1)}, bombatura ${BOMBATURA_MM} mm, catena ${CON_CATENA ? 'sì' : 'no'}`);

// Gradi di libertà: u (n), v (n), w (n). Per ognuno le deformazioni
// membranali (ex, ey, gxy) e le curvature (kxx, kyy, kxy) nei punti.
const zero = new Float64Array(G);
const Exw = [], Eyw = [], Gw = [];
for (let a = 0; a < n; a++) {
  const ex = new Float64Array(G), ey = new Float64Array(G), gg = new Float64Array(G);
  for (let g = 0; g < G; g++) {
    ex[g] = z0x[g] * Px[a][g];
    ey[g] = z0y[g] * Py[a][g];
    gg[g] = z0x[g] * Py[a][g] + z0y[g] * Px[a][g];
  }
  Exw.push(ex); Eyw.push(ey); Gw.push(gg);
}
const conMembrana = BOMBATURA_MM > 0;
/** @type {Array<{ ex: Float64Array, ey: Float64Array, gxy: Float64Array, kxx: Float64Array, kyy: Float64Array, kxy: Float64Array }>} */
const gdl = [];
if (conMembrana) {
  for (let a = 0; a < n; a++) gdl.push({ ex: Px[a], ey: zero, gxy: Py[a], kxx: zero, kyy: zero, kxy: zero });
  for (let a = 0; a < n; a++) gdl.push({ ex: zero, ey: Py[a], gxy: Px[a], kxx: zero, kyy: zero, kxy: zero });
}
const offW = gdl.length;
for (let a = 0; a < n; a++) gdl.push({ ex: Exw[a], ey: Eyw[a], gxy: Gw[a], kxx: Pxx[a], kyy: Pyy[a], kxy: Pxy[a] });
const nTot = gdl.length;

t0 = Date.now();
const K = new Float64Array(nTot * nTot);
for (let I = 0; I < nTot; I++) {
  const a = gdl[I];
  const mA = a.ex !== zero || a.ey !== zero, bA = a.kxx !== zero;
  for (let J = I; J < nTot; J++) {
    const b = gdl[J];
    const mB = b.ex !== zero || b.ey !== zero, bB = b.kxx !== zero;
    let s = 0;
    if (conMembrana && mA && mB) {
      const aex = a.ex, aey = a.ey, ag = a.gxy, bex = b.ex, bey = b.ey, bg = b.gxy;
      for (let g = 0; g < G; g++) {
        s += A11 * aex[g] * bex[g] + A12 * (aex[g] * bey[g] + aey[g] * bex[g]) + A22 * aey[g] * bey[g] + A66 * ag[g] * bg[g];
      }
    }
    if (bA && bB) {
      const xa = a.kxx, ya = a.kyy, za = a.kxy, xb = b.kxx, yb = b.kyy, zb = b.kxy;
      for (let g = 0; g < G; g++) {
        s += Dx * xa[g] * xb[g] + D12 * (xa[g] * yb[g] + ya[g] * xb[g]) + Dy[g] * ya[g] * yb[g] + 4 * D66 * za[g] * zb[g];
      }
    }
    K[I * nTot + J] = K[J * nTot + I] = s * dA;
  }
}
console.log(`rigidezza ${nTot}×${nTot}: ${Date.now() - t0} ms`);
t0 = Date.now();
const { valori, vettori } = jacobi(K, nTot);
console.log(`autovalori: ${Date.now() - t0} ms`);

// ---------------------------------------------------------------------------
// Valutazione dei modi su una griglia qualsiasi

/**
 * Coefficienti del modo m nella base di Legendre originale.
 * @param {number} m
 */
function coefficientiModo(m) {
  const c = new Float64Array(N);
  for (let a = 0; a < n; a++) {
    const v = vettori[(offW + a) * nTot + m];
    if (v === 0) continue;
    const ca = Coeff[a];
    for (let q = 0; q < N; q++) c[q] += v * ca[q];
  }
  return c;
}

/**
 * @param {Float64Array} c
 * @param {number} nu
 * @param {number} nv
 */
function valutaSuGriglia(c, nu, nv) {
  const out = new Float64Array(nu * nv);
  const lxs = [];
  for (let i = 0; i < nu; i++) lxs.push(legendre(xHat(x0 + ((i + 0.5) / nu) * Wmm), GRADO).p);
  for (let j = 0; j < nv; j++) {
    const ly = legendre(yHat(y0 + ((j + 0.5) / nv) * Hmm), GRADO).p;
    for (let i = 0; i < nu; i++) {
      const lx = lxs[i];
      let s = 0;
      for (let a = 0; a < N; a++) s += c[a] * lx[indici[a][0]] * ly[indici[a][1]];
      out[j * nu + i] = s;
    }
  }
  return out;
}

/**
 * Normalizza a max |w| = 1 dentro la maschera; fuori limita a ±1.
 * @param {Float64Array} w
 * @param {Uint8Array} maschera
 */
function normalizza(w, maschera) {
  let max = 0;
  for (let k = 0; k < w.length; k++) if (maschera[k]) max = Math.max(max, Math.abs(w[k]));
  for (let k = 0; k < w.length; k++) w[k] = Math.max(-1, Math.min(1, w[k] / max));
  return w;
}

// ---------------------------------------------------------------------------
// Topologia

/**
 * @param {Float64Array} w   normalizzato
 * @param {Uint8Array} m
 * @param {number} nu
 * @param {number} nv
 */
function topologia(w, m, nu, nv) {
  let simm = 0, tot = 0;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const k = j * nu + i, k2 = j * nu + (nu - 1 - i);
    if (!m[k] || !m[k2]) continue;
    simm += w[k] * w[k2]; tot += w[k] * w[k];
  }
  const parita = simm / tot;
  /** cambi di segno lungo una sequenza di celle (con isteresi) @param {number[]} ks */
  const cambi = (ks) => {
    let segno = 0, c = 0;
    for (const k of ks) {
      if (!m[k] || Math.abs(w[k]) < 0.06) continue;
      const s = Math.sign(w[k]);
      if (segno !== 0 && s !== segno) c++;
      segno = s;
    }
    return c;
  };
  const riga = (/** @type {number} */ ymm) => {
    const j = Math.round(((ymm - y0) / Hmm) * nv - 0.5);
    return Array.from({ length: nu }, (_, i) => j * nu + i);
  };
  const colonna = (/** @type {number} */ xmm) => {
    const i = Math.round(((xmm - x0) / Wmm) * nu - 0.5);
    return Array.from({ length: nv }, (_, j) => j * nu + i);
  };
  /**
   * Posizioni (mm) dei passaggi per lo zero lungo una sequenza di celle, con
   * interpolazione lineare; `coord(q)` dà la coordinata della q-esima cella.
   * @param {number[]} ks
   * @param {(q: number) => number} coord
   */
  const zeri = (ks, coord) => {
    /** @type {number[]} */
    const z = [];
    let qPrec = -1, segno = 0;
    ks.forEach((k, q) => {
      if (!m[k] || Math.abs(w[k]) < 0.06) return;
      const s = Math.sign(w[k]);
      if (segno !== 0 && s !== segno && qPrec >= 0) {
        // cerca il passaggio esatto tra qPrec e q
        let best = coord((qPrec + q) / 2);
        for (let t = qPrec; t < q; t++) {
          const a = w[ks[t]], b = w[ks[t + 1]];
          if (Math.sign(a) !== Math.sign(b) && a !== b) { best = coord(t + a / (a - b)); break; }
        }
        z.push(Math.round(best * 10) / 10);
      }
      segno = s; qPrec = q;
    });
    return z;
  };
  const yDiCella = (/** @type {number} */ q) => y0 + ((q + 0.5) / nv) * Hmm;
  const xDiCella = (/** @type {number} */ q) => x0 + ((q + 0.5) / nu) * Wmm;
  // la colonna centrale cade sulla giunta: si legge a ±4 mm
  const asse = cambi(colonna(4));
  const asseB = cambi(colonna(-4));
  const zeriAsse = zeri(colonna(4), yDiCella);
  const larghezze = [0.12, 0.5, 0.88].map((t) => {
    const z = zeri(riga(y0 + t * Hmm), xDiCella);
    return z.length === 2 ? Math.round((z[1] - z[0]) * 10) / 10 : null;
  });
  const r = {
    parita,
    asse: Math.max(asse, asseB),
    lato: cambi(colonna(32)),
    spalleAlte: cambi(riga(85)),
    vita: cambi(riga(178)),
    spalleBasse: cambi(riga(285)),
    zeriAsse,
    larghezze,
  };
  /** @type {string} */
  let nome = 'altro';
  const L = Hmm;
  if (parita < -0.5 && r.lato === 1 && r.spalleAlte <= 1 && r.spalleBasse <= 1) nome = 'croce';
  else if (parita > 0.5 && r.asse === 0 && (r.vita === 2 || r.spalleAlte === 2) && r.spalleBasse === 2) nome = 'parentesi';
  else if (parita > 0.5 && r.asse >= 1 && r.lato === 2 && r.spalleAlte === 2 && r.spalleBasse === 2 &&
    zeriAsse.every((z) => (z > y0 + 0.1 * L && z < y0 + 0.42 * L) || (z > y0 + 0.62 * L && z < y0 + 0.93 * L)) &&
    zeriAsse.some((z) => z > y0 + 0.62 * L)) nome = 'anello';
  return { nome, ...r };
}

/**
 * L'anello è "aperto alle C" se, sulla riga della vita, non c'è cambio di segno
 * tra il centro e il bordo almeno da un lato.
 * @param {Float64Array} w
 * @param {Uint8Array} m
 * @param {number} nu
 * @param {number} nv
 */
function anelloAperto(w, m, nu, nv) {
  const lati = [];
  for (const dir of [-1, 1]) {
    let apertoDaQuestoLato = false;
    for (let ymm = 160; ymm <= 196; ymm += 4) {
      const j = Math.round(((ymm - y0) / Hmm) * nv - 0.5);
      const ic = nu / 2 - (dir < 0 ? 1 : 0);
      const s0 = Math.sign(w[j * nu + ic]);
      let cambio = false;
      for (let i = ic; i >= 0 && i < nu; i += dir) {
        const k = j * nu + i;
        if (!m[k]) continue;
        if (Math.abs(w[k]) > 0.04 && Math.sign(w[k]) !== s0) cambio = true;
      }
      if (!cambio) apertoDaQuestoLato = true;
    }
    lati.push(apertoDaQuestoLato);
  }
  return { bassi: lati[0], acuti: lati[1] };
}

// ---------------------------------------------------------------------------
// Cuscinetti sulle linee nodali

/**
 * Distanza (mm) di ogni cella dal bordo valido più vicino (contorno o effe).
 * @param {Uint8Array} m
 * @param {number} nu
 * @param {number} nv
 */
function distanzaDalBordo(m, nu, nv) {
  const cw = Wmm / nu, ch = Hmm / nv;
  const bordo = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) if (!m[j * nu + i]) bordo.push([i, j]);
  const d = new Float32Array(nu * nv);
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    if (!m[j * nu + i]) continue;
    let best = Infinity;
    for (const [bi, bj] of bordo) {
      const dx = (bi - i) * cw, dy = (bj - j) * ch;
      const q = dx * dx + dy * dy;
      if (q < best) best = q;
    }
    d[j * nu + i] = Math.sqrt(best);
  }
  return d;
}

/**
 * Quattro cuscinetti (u, v) su punti nodali ben distribuiti.
 * @param {Float64Array} w
 * @param {Uint8Array} m
 * @param {Float32Array} dist
 * @param {number} nu
 * @param {number} nv
 * @param {boolean} simmetrico
 * @returns {Array<[number, number]>}
 */
function cuscinetti(w, m, dist, nu, nv, simmetrico) {
  const cw = Wmm / nu, ch = Hmm / nv;
  /** @type {Array<[number, number, number]>} x mm, y mm, |w| */
  const cand = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const k = j * nu + i;
    if (!m[k] || dist[k] < 15 || Math.abs(w[k]) > 0.05) continue;
    const xmm = x0 + (i + 0.5) * cw, ymm = y0 + (j + 0.5) * ch;
    if (simmetrico && xmm < 14) continue;
    cand.push([xmm, ymm, Math.abs(w[k])]);
  }
  if (cand.length === 0) throw new Error('nessun punto nodale lontano dal bordo');
  const quanti = simmetrico ? 2 : 4;
  /** @type {Array<[number, number, number]>} */
  const scelti = [];
  // primo: il punto nodale più in alto
  scelti.push(cand.reduce((a, b) => (b[1] < a[1] ? b : a)));
  while (scelti.length < quanti) {
    let best = cand[0], bestD = -1;
    for (const c of cand) {
      const dmin = Math.min(...scelti.map((s) => Math.hypot(s[0] - c[0], s[1] - c[1])));
      // a parità di distanza preferisci il punto più nodale
      const punteggio = dmin - 40 * c[2];
      if (punteggio > bestD) { bestD = punteggio; best = c; }
    }
    scelti.push(best);
  }
  const tutti = simmetrico ? scelti.flatMap((s) => [s, /** @type {[number, number, number]} */ ([-s[0], s[1], s[2]])]) : scelti;
  return tutti.map(([x, y]) => [arrot((x - x0) / Wmm), arrot((y - y0) / Hmm)]);
}

const arrot = (/** @type {number} */ v) => Math.round(v * 10000) / 10000;

// ---------------------------------------------------------------------------
// Scelta dei tre modi

const out = costruisciMaschera(tavola, NU_OUT, NV_OUT);
const dist = distanzaDalBordo(out.maschera, NU_OUT, NV_OUT);
const freq = Array.from(valori, (l) => Math.sqrt(Math.max(0, l)) / (2 * Math.PI));
const elastici = [];
/**
 * Quota di |w|² spiegata da un piano a + b x + c y: vicino a 1 = moto rigido
 * (nel guscio ribassato le rotazioni rigide non sono esatte nella base
 * polinomiale e compaiono a bassa frequenza: si scartano).
 * @param {Float64Array} w
 */
function quotaPiana(w) {
  const m = out.maschera;
  let s1 = 0, sx1 = 0, sy1 = 0, sxx = 0, syy = 0, sxy = 0, sw = 0, sxw = 0, syw = 0, sww = 0;
  for (let j = 0; j < NV_OUT; j++) for (let i = 0; i < NU_OUT; i++) {
    const k = j * NU_OUT + i;
    if (!m[k]) continue;
    const x = (i + 0.5) / NU_OUT - 0.5, y = (j + 0.5) / NV_OUT - 0.5, v = w[k];
    s1++; sx1 += x; sy1 += y; sxx += x * x; syy += y * y; sxy += x * y; sw += v; sxw += x * v; syw += y * v; sww += v * v;
  }
  // minimi quadrati 3×3 (regola di Cramer)
  const M = [[s1, sx1, sy1], [sx1, sxx, sxy], [sy1, sxy, syy]], r = [sw, sxw, syw];
  const det = (/** @type {number[][]} */ A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  const D = det(M);
  const c = [0, 1, 2].map((q) => det(M.map((riga, i) => riga.map((v, jj) => (jj === q ? r[i] : v)))) / D);
  const spiegata = c[0] * sw + c[1] * sxw + c[2] * syw;
  return spiegata / sww;
}
const SOGLIA_PIANO = opzione('--soglia-piano', 0.5);
for (let m = 0; m < nTot && elastici.length < 18; m++) {
  if (freq[m] < 5) continue;
  const prova = valutaSuGriglia(coefficientiModo(m), NU_OUT, NV_OUT);
  const q = quotaPiana(prova);
  if (q > SOGLIA_PIANO) { console.log(`scartato moto rigido a ${freq[m].toFixed(1)} Hz (piano ${q.toFixed(3)})`); continue; }
  console.log(`  ${freq[m].toFixed(1)} Hz: quota piana ${q.toFixed(3)}`);
  elastici.push(m);
}

const confronti = [];
/** @type {Array<{ ordine: number, m: number, hz: number, w: Float64Array, t: ReturnType<typeof topologia> }>} */
const calcolati = [];
const elenco = [];
for (const [ordine, m] of elastici.entries()) {
  const w = normalizza(valutaSuGriglia(coefficientiModo(m), NU_OUT, NV_OUT), out.maschera);
  const t = topologia(w, out.maschera, NU_OUT, NV_OUT);
  calcolati.push({ ordine: ordine + 1, m, hz: freq[m], w, t });
  elenco.push({ ordine: ordine + 1, hz: Math.round(freq[m] * 10) / 10, topologia: t.nome, parita: Math.round(t.parita * 100) / 100 });
  console.log(`modo elastico ${ordine + 1}: ${freq[m].toFixed(1)} Hz  ${t.nome.padEnd(9)} parità ${t.parita.toFixed(2)} asse ${t.asse} [${t.zeriAsse.join(' ')}] lato ${t.lato} alte ${t.spalleAlte} vita ${t.vita} basse ${t.spalleBasse} larghezze ${t.larghezze.join('/')}`);
  if (ordine < 12) {
    scriviPng(`calcolato-${String(ordine + 1).padStart(2, '0')}-${t.nome}.png`, { campo: w, maschera: out.maschera, nu: NU_OUT, nv: NV_OUT, scala: 3 });
    confronti.push({ campo: w, maschera: out.maschera, nu: NU_OUT, nv: NV_OUT, scala: 2 });
  }
}
scriviTavolaComparata('calcolati-tutti.png', confronti);

// ---------------------------------------------------------------------------
// Taratura sulle misure (Jansson fig. 5.17, tavole vere, bombate e graduate).
// Il modello è una piastra bombata ideale: le sue forme proprie hanno le
// topologie giuste ma le linee non cadono esattamente dove cadono nelle
// tavole misurate (spessori graduati, bombatura vera, catena). Ogni figura
// spedita è quindi una COMBINAZIONE dei modi calcolati con la stessa parità,
// scelta perché le linee nodali passino per i punti misurati da Jansson
// (minimi quadrati con norma unitaria e penalità sui modi alti). Il doc
// riporta quanto pesa il modo calcolato principale in ogni figura.

/** semilarghezza del contorno (senza effe) alla quota y, in mm */
function semilarghezzaA(/** @type {number} */ ymm) {
  let b = 0;
  for (let x = 0; x <= Wmm / 2; x += 0.25) if (dentro(tavola.contorno, x, ymm) || dentro(tavola.contorno, -x, ymm)) b = x;
  return b;
}
/** quota y (mm) del contorno con semilarghezza `x` cercando dal lato `daY` verso `versoY` */
function yBordoA(/** @type {number} */ x, /** @type {number} */ daY, /** @type {number} */ versoY) {
  const passo = versoY > daY ? 0.25 : -0.25;
  for (let y = daY; passo > 0 ? y <= versoY : y >= versoY; y += passo) if (semilarghezzaA(y) >= x) return y;
  return versoY;
}

/** @param {Float64Array} w @param {number} xmm @param {number} ymm */
function campionaMm(w, xmm, ymm) {
  const u = (xmm - x0) / Wmm * NU_OUT - 0.5, v = (ymm - y0) / Hmm * NV_OUT - 0.5;
  const i = Math.max(0, Math.min(NU_OUT - 2, Math.floor(u))), j = Math.max(0, Math.min(NV_OUT - 2, Math.floor(v)));
  const fx = u - i, fy = v - j;
  const a = w[j * NU_OUT + i], b = w[j * NU_OUT + i + 1], c = w[(j + 1) * NU_OUT + i], d = w[(j + 1) * NU_OUT + i + 1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

/** Linee misurate (mm, x dalla giunta, y dal bordo verso il riccio) per i tre modi. */
function bersagli() {
  const L = Hmm;
  /** @type {Record<number, Array<[number, number]>>} */
  const t = { 1: [], 2: [], 5: [] };
  // Modo 1: linea di traverso circa 10 mm sotto gli angoli bassi delle C (all'altezza degli occhi bassi delle effe).
  const yTrav = MISURE_JANSSON.modo1.yTraverso;
  for (let x = 8; x < semilarghezzaA(yTrav) - 4; x += 6) { t[1].push([x, yTrav]); t[1].push([-x, yTrav]); }
  // Modo 2: due parentesi )( dagli spigoli alti (140 mm tra le due) agli spigoli bassi (162 mm),
  // che si avvicinano tra le effe passando per gli occhi alti senza toccarsi.
  const m2 = MISURE_JANSSON.modo2;
  const yt = yBordoA(m2.distanzaAlta / 2, 0, L / 2), yb = yBordoA(m2.distanzaBassa / 2, L, L / 2);
  const xt = m2.distanzaAlta / 2, xb = m2.distanzaBassa / 2, xw = m2.semidistanzaVita, yw = m2.yVita;
  for (let y = yt + 4; y < yb - 4; y += 6) {
    const x = y < yw ? xw + (xt - xw) * Math.pow((yw - y) / (yw - yt), m2.esponente) : xw + (xb - xw) * Math.pow((y - yw) / (yb - yw), m2.esponente);
    if (integ.dentroTavola(x, y)) { t[2].push([x, y]); t[2].push([-x, y]); }
  }
  // Modo 5: arco alto (69 mm dal bordo alto sulla giunta, al bordo all'altezza degli spigoli alti),
  // arco basso (60 mm dal bordo basso sulla giunta, al bordo sopra gli spigoli bassi); aperto alle C.
  const m5 = MISURE_JANSSON.modo5;
  const yAc = m5.altoCentro, yAb = m5.altoBordo, yBc = L - m5.bassoCentro, yBb = m5.bassoBordo;
  const xeA = semilarghezzaA(yAb), xeB = semilarghezzaA(yBb);
  for (let x = 0; x < xeA - 3; x += 5) { const y = yAc + (yAb - yAc) * (x / xeA) ** 2; t[5].push([x, y]); if (x > 0) t[5].push([-x, y]); }
  for (let x = 0; x < xeB - 3; x += 5) { const y = yBc + (yBb - yBc) * (x / xeB) ** 2; t[5].push([x, y]); if (x > 0) t[5].push([-x, y]); }
  return t;
}

/**
 * Combinazione dei modi calcolati di parità `segnoParita` che annulla w sui
 * punti misurati. Restituisce il campo normalizzato e i pesi.
 * @param {Array<[number, number]>} punti
 * @param {1 | -1} segnoParita
 */
function combina(punti, segnoParita) {
  const base = calcolati.filter((c) => c.t.parita * segnoParita > 0.9).slice(0, BASE_TARATURA);
  const K = base.length;
  const m = out.maschera;
  // campi a norma quadratica media 1 sulla tavola
  const campi = base.map((c) => {
    let s = 0, q = 0;
    for (let k = 0; k < c.w.length; k++) if (m[k]) { s += c.w[k] * c.w[k]; q++; }
    const f = 1 / Math.sqrt(s / q);
    return c.w.map((v) => v * f);
  });
  const B = new Float64Array(K * K), A = new Float64Array(K * K);
  let q = 0;
  for (let k = 0; k < m.length; k++) if (m[k]) q++;
  for (let a = 0; a < K; a++) for (let b = a; b < K; b++) {
    let s = 0;
    for (let k = 0; k < m.length; k++) if (m[k]) s += campi[a][k] * campi[b][k];
    B[a * K + b] = B[b * K + a] = s / q;
    let r = 0;
    for (const [x, y] of punti) r += campionaMm(campi[a], x, y) * campionaMm(campi[b], x, y);
    A[a * K + b] = A[b * K + a] = r / punti.length;
  }
  const f0 = base[0].hz;
  for (let a = 0; a < K; a++) A[a * K + a] += PENALITA * ((base[a].hz / f0) ** 2 - 1);
  // min c'Ac con c'Bc = 1: B^(-1/2) A B^(-1/2)
  const eb = jacobi(B, K);
  const Bm = new Float64Array(K * K);
  for (let i = 0; i < K; i++) for (let j = 0; j < K; j++) {
    let s = 0;
    for (let r = 0; r < K; r++) s += eb.vettori[i * K + r] * eb.vettori[j * K + r] / Math.sqrt(Math.max(eb.valori[r], 1e-12));
    Bm[i * K + j] = s;
  }
  const C = new Float64Array(K * K);
  for (let i = 0; i < K; i++) for (let j = 0; j < K; j++) {
    let s = 0;
    for (let r = 0; r < K; r++) for (let t2 = 0; t2 < K; t2++) s += Bm[i * K + r] * A[r * K + t2] * Bm[t2 * K + j];
    C[i * K + j] = s;
  }
  const ec = jacobi(C, K);
  const y = Array.from({ length: K }, (_, r) => ec.vettori[r * K + 0]);
  const c = Array.from({ length: K }, (_, i) => y.reduce((s, yr, r) => s + Bm[i * K + r] * yr, 0));
  const w = new Float64Array(m.length);
  for (let a = 0; a < K; a++) for (let k = 0; k < w.length; k++) w[k] += c[a] * campi[a][k];
  // quota di energia per modo (i campi sono quasi ortogonali: B ≈ I)
  const tot = c.reduce((s, v) => s + v * v, 0);
  const pesi = base.map((b, a) => ({ ordine: b.ordine, hz: Math.round(b.hz), quota: Math.round((c[a] * c[a]) / tot * 1000) / 1000 }))
    .sort((p1, p2) => p2.quota - p1.quota);
  // residuo: distanza media (mm) dei punti misurati dalla linea nodale ottenuta
  normalizza(w, m);
  let distTot = 0;
  for (const [x, y] of punti) {
    let best = 30;
    for (let r = 0.5; r < 30 && best === 30; r += 0.5) {
      for (let ang = 0; ang < 360; ang += 15) {
        const xx = x + r * Math.cos(ang * Math.PI / 180), yy = y + r * Math.sin(ang * Math.PI / 180);
        if (Math.sign(campionaMm(w, xx, yy)) !== Math.sign(campionaMm(w, x, y))) { best = r; break; }
      }
    }
    distTot += Math.abs(campionaMm(w, x, y)) < 0.01 ? 0 : best;
  }
  return { w, pesi, distanzaMediaMm: Math.round((distTot / punti.length) * 10) / 10 };
}

const B5 = bersagli();
const tarati = {
  1: combina(B5[1], -1),
  2: combina(B5[2], 1),
  5: combina(B5[5], 1),
};
for (const [modo, r] of Object.entries(tarati)) {
  console.log(`modo ${modo}: distanza media dalle linee misurate ${r.distanzaMediaMm} mm; pesi ${r.pesi.slice(0, 4).map((p) => `${p.ordine}°(${p.hz} Hz) ${(p.quota * 100).toFixed(1)}%`).join(', ')}`);
}

// segno: centro della tavola positivo per i simmetrici, quarto in alto a destra positivo per la croce (solo convenzione)
const kc = Math.floor(NV_OUT / 2) * NU_OUT + NU_OUT / 2;
for (const modo of [2, 5]) { const w = tarati[modo].w; if (w[kc] < 0) for (let k = 0; k < w.length; k++) w[k] = -w[k]; }
{ const w = tarati[1].w; const kq = Math.floor(NV_OUT * 0.25) * NU_OUT + Math.floor(NU_OUT * 0.7); if (w[kq] < 0) for (let k = 0; k < w.length; k++) w[k] = -w[k]; }

scriviTavolaComparata('tarati-1-2-5.png', [1, 2, 5].map((modo) => ({
  campo: tarati[/** @type {1|2|5} */ (modo)].w, maschera: out.maschera, nu: NU_OUT, nv: NV_OUT, scala: 3,
  cuscinetti: B5[modo].map(([x, y]) => /** @type {[number, number]} */ ([(x - x0) / Wmm, (y - y0) / Hmm])),
})));
const topo = {
  1: topologia(tarati[1].w, out.maschera, NU_OUT, NV_OUT),
  2: topologia(tarati[2].w, out.maschera, NU_OUT, NV_OUT),
  5: topologia(tarati[5].w, out.maschera, NU_OUT, NV_OUT),
};
const attese = { 1: 'croce', 2: 'parentesi', 5: 'anello' };
for (const modo of [1, 2, 5]) {
  const t = topo[/** @type {1|2|5} */ (modo)];
  console.log(`figura spedita modo ${modo}: ${t.nome} (asse [${t.zeriAsse.join(' ')}], larghezze ${t.larghezze.join('/')}, vita ${t.vita})`);
  if (t.nome !== attese[/** @type {1|2|5} */ (modo)]) throw new Error(`la figura del modo ${modo} non ha la topologia attesa (${attese[/** @type {1|2|5} */ (modo)]})`);
}
const aperto = anelloAperto(tarati[5].w, out.maschera, NU_OUT, NV_OUT);
console.log(`anello aperto alle C: bassi ${aperto.bassi}, acuti ${aperto.acuti}`);
if (!aperto.bassi && !aperto.acuti) throw new Error('il modo 5 risulta chiuso alle C: nella tavola deve aprirsi (Jansson p. 5.21)');

const trovati = {
  croce: { m: tarati[1].pesi[0].ordine, w: tarati[1].w, hz: 0, t: topo[1] },
  parentesi: { m: tarati[2].pesi[0].ordine, w: tarati[2].w, hz: 0, t: topo[2] },
  anello: { m: tarati[5].pesi[0].ordine, w: tarati[5].w, hz: 0, t: topo[5] },
};
const scelta = [
  { modo: 1, hzBottega: 92, ...trovati.croce, simm: false, taratura: tarati[1] },
  { modo: 2, hzBottega: 168, ...trovati.parentesi, simm: true, taratura: tarati[2] },
  { modo: 5, hzBottega: 348, ...trovati.anello, simm: true, taratura: tarati[5] },
];

// centro dell'anello: baricentro della zona interna (stesso segno del centro, |w| > 0,3)
let su = 0, sv = 0, sw = 0;
for (let j = 0; j < NV_OUT; j++) for (let i = 0; i < NU_OUT; i++) {
  const k = j * NU_OUT + i;
  if (!out.maschera[k]) continue;
  const v = trovati.anello.w[k];
  if (v > 0.3) { su += v * (i + 0.5) / NU_OUT; sv += v * (j + 0.5) / NV_OUT; sw += v; }
}
const centroAnello = [arrot(su / sw), arrot(sv / sw)];

// ---------------------------------------------------------------------------
// Scrittura

const nCelle = NU_OUT * NV_OUT;
const bin = new Uint8Array(3 * nCelle + Math.ceil(nCelle / 8));
scelta.forEach((s, q) => {
  for (let k = 0; k < nCelle; k++) bin[q * nCelle + k] = Math.round(s.w[k] * 127) & 0xff;
});
for (let k = 0; k < nCelle; k++) if (out.maschera[k]) bin[3 * nCelle + (k >> 3)] |= 1 << (k & 7);

const modiMeta = scelta.map((s) => {
  // ri-quantizza come il browser per i cuscinetti e i controlli
  const wq = new Float64Array(nCelle);
  for (let k = 0; k < nCelle; k++) wq[k] = ((bin[[1, 2, 5].indexOf(s.modo) * nCelle + k] << 24) >> 24) / 127;
  const cus = cuscinetti(wq, out.maschera, dist, NU_OUT, NV_OUT, s.simm);
  scriviPng(`scelto-modo${s.modo}.png`, { campo: wq, maschera: out.maschera, nu: NU_OUT, nv: NV_OUT, scala: 4, cuscinetti: cus });
  return {
    modo: s.modo,
    hzBottega: s.hzBottega,
    composizione: s.taratura.pesi.slice(0, 4),
    distanzaMediaMm: s.taratura.distanzaMediaMm,
    topologia: s.t.nome === 'anello' ? 'anello-aperto' : s.t.nome,
    cuscinetti: cus,
  };
});
scriviTavolaComparata('scelti-modi-1-2-5.png', scelta.map((s, q) => {
  const wq = new Float64Array(nCelle);
  for (let k = 0; k < nCelle; k++) wq[k] = ((bin[q * nCelle + k] << 24) >> 24) / 127;
  return { campo: wq, maschera: out.maschera, nu: NU_OUT, nv: NV_OUT, scala: 3, cuscinetti: modiMeta[q].cuscinetti };
}));

const meta = {
  versione: 1,
  data: new Date().toISOString().slice(0, 10),
  metodo: 'rayleigh-ritz-tarato',
  formato: 'i8-96x168',
  griglia: { nu: NU_OUT, nv: NV_OUT },
  rettangoloMm: { x0: arrot(x0), y0: arrot(y0), w: arrot(Wmm), h: arrot(Hmm) },
  contorno: tavola.sorgente,
  parametri: {
    ELGPa: ABETE.EL / 1e9,
    ERGPa: ABETE.ER / 1e9,
    GGPa: ABETE.G / 1e9,
    poissonLR: ABETE.nuLR,
    densita: ABETE.rho,
    spessoreMm: ABETE.h * 1e3,
    rapportoRigidezza: Math.round((ABETE.EL / ABETE.ER) * 10) / 10,
    gradoPolinomi: GRADO,
    funzioniBase: n,
    catena: CON_CATENA ? CATENA : null,
    bombaturaMm: BOMBATURA_MM,
    taratura: { misure: MISURE_JANSSON, base: BASE_TARATURA, penalita: PENALITA },
  },
  modi: modiMeta,
  anello: { centro: centroAnello, apertoAlleC: aperto },
  riposo: { cuscinetti: modiMeta[0].cuscinetti },
  calcolati: elenco,
};

const ts = `// File GENERATO da scripts/modi/calcola-modi.mjs (${meta.data}). Non modificare a mano:
// rilancia \`npm run modi\`. Il blocco tra JSON e FINE è JSON puro (lo rilegge
// scripts/modi/controllo-nodi.mjs).

export type TopologiaModo = 'croce' | 'parentesi' | 'anello-aperto';
export type FormatoModi = 'i8-96x168' | 'i16-64x112';

export interface MetaModo {
  readonly modo: 1 | 2 | 5;
  /** Frequenza di bottega usata dal sito (Hz). */
  readonly hzBottega: number;
  /** Modi calcolati che compongono la figura (ordine, Hz del modello, quota d'energia): solo documentazione. */
  readonly composizione: ReadonlyArray<{ readonly ordine: number; readonly hz: number; readonly quota: number }>;
  /** Distanza media (mm) tra le linee nodali spedite e i punti misurati da Jansson. */
  readonly distanzaMediaMm: number;
  readonly topologia: TopologiaModo;
  /** Quattro cuscinetti (u, v) in [0, 1] sul rettangolo, sulle linee nodali. */
  readonly cuscinetti: ReadonlyArray<readonly [number, number]>;
}

export interface MetaModi {
  readonly versione: number;
  readonly data: string;
  readonly metodo: 'rayleigh-ritz' | 'rayleigh-ritz-tarato' | 'a-mano';
  readonly formato: FormatoModi;
  readonly griglia: { readonly nu: number; readonly nv: number };
  /** Rettangolo dei campi in mm: x centrata sulla giunta, y = 0 al bordo verso il riccio. */
  readonly rettangoloMm: { readonly x0: number; readonly y0: number; readonly w: number; readonly h: number };
  readonly contorno: 'svg' | 'riserva';
  readonly parametri: Readonly<Record<string, unknown>>;
  /** Nell'ordine dei campi in modi.bin: modo 1, modo 2, modo 5. */
  readonly modi: readonly [MetaModo, MetaModo, MetaModo];
  readonly anello: { readonly centro: readonly [number, number]; readonly apertoAlleC: { readonly bassi: boolean; readonly acuti: boolean } };
  readonly riposo: { readonly cuscinetti: ReadonlyArray<readonly [number, number]> };
  readonly calcolati: ReadonlyArray<{ readonly ordine: number; readonly hz: number; readonly topologia: string; readonly parita: number }>;
}

export const MODI_META: MetaModi = /*JSON*/${JSON.stringify(meta, null, 2)}/*FINE*/ as MetaModi;
`;

mkdirSync(DATI, { recursive: true });
writeFileSync(resolve(DATI, 'modi.bin'), bin);
writeFileSync(resolve(DATI, 'modi-meta.ts'), ts);
console.log(`scritti modi.bin (${bin.length} B) e modi-meta.ts`);
