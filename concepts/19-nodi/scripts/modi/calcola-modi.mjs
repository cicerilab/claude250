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
// Uso: `npm run modi` (oppure `node scripts/modi/calcola-modi.mjs [--grado 18] [--senza-catena]`).
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
import { costruisciMaschera, leggiTavola } from './contorno.mjs';
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
  ER: 0.8e9, // modulo di traverso (asse x, radiale nel taglio di quarto)
  G: 0.84e9, // modulo di taglio L-R
  nuLR: 0.37, // Poisson (contrazione R per trazione L)
  rho: 460, // kg/m³
  h: 2.8e-3, // m
};
const GRADO = opzione('--grado', 18);
const CON_CATENA = !argomenti.includes('--senza-catena');

/**
 * Catena (bass bar) come irrigidimento lungo la vena sul lato dei bassi
 * (sinistra nella vista dall'alto, riccio in alto). Trave rettangolare
 * 5,5 mm di larghezza, alta 11 mm al centro e 3 mm agli estremi, lunga 270 mm,
 * centrata sotto il piede dei bassi del ponticello.
 */
const CATENA = { xMm: -18.5, larghezzaMm: 5.5, y0Mm: 46, y1Mm: 316, altezzaCentroMm: 11, altezzaEstremiMm: 3 };

// Griglia di integrazione (2 mm circa) e griglia d'uscita (formato §8.2 del tech-architect).
const NU_INT = 104, NV_INT = 178;
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

// Base e derivate seconde in metri.
const sx = 1 / (semiW * 1e-3), sy = 1 / (semiH * 1e-3);
const phi = [], pxx = [], pyy = [], pxy = [], coeff = [];
for (let a = 0; a < N; a++) {
  phi.push(new Float64Array(G)); pxx.push(new Float64Array(G)); pyy.push(new Float64Array(G)); pxy.push(new Float64Array(G));
  const c = new Float64Array(N); c[a] = 1; coeff.push(c);
}
for (let g = 0; g < G; g++) {
  const lx = legendre(xHat(xm[g]), GRADO), ly = legendre(yHat(ym[g]), GRADO);
  for (let a = 0; a < N; a++) {
    const [i, j] = indici[a];
    phi[a][g] = lx.p[i] * ly.p[j];
    pxx[a][g] = lx.d2[i] * ly.p[j] * sx * sx;
    pyy[a][g] = lx.p[i] * ly.d2[j] * sy * sy;
    pxy[a][g] = lx.d1[i] * ly.d1[j] * sx * sy;
  }
}

let t0 = Date.now();
// due passate per la stabilità numerica
let tenute = gramSchmidt(phi, [pxx, pyy, pxy, coeff], peso);
const idx = tenute.flatMap((t, a) => (t ? [a] : []));
const sel = (/** @type {Float64Array[]} */ l) => idx.map((a) => l[a]);
const Phi = sel(phi), Pxx = sel(pxx), Pyy = sel(pyy), Pxy = sel(pxy), Coeff = sel(coeff);
tenute = gramSchmidt(Phi, [Pxx, Pyy, Pxy, Coeff], peso);
const n = Phi.length;
console.log(`base ortonormale: ${n} funzioni (${N - n} scartate), ${Date.now() - t0} ms`);

// Rigidezze flessionali.
const nuRL = (ABETE.nuLR * ABETE.ER) / ABETE.EL;
const den = 1 - ABETE.nuLR * nuRL;
const h3 = ABETE.h ** 3;
const Dx = (ABETE.ER * h3) / (12 * den);
const DyPiastra = (ABETE.EL * h3) / (12 * den);
const D12 = ABETE.nuLR * Dx;
const D66 = (ABETE.G * h3) / 12;
const Dy = new Float64Array(G).fill(DyPiastra);
if (CON_CATENA) {
  const c = CATENA;
  const meta = (c.y1Mm - c.y0Mm) / 2, centro = (c.y0Mm + c.y1Mm) / 2;
  for (let g = 0; g < G; g++) {
    if (Math.abs(xm[g] - c.xMm) > c.larghezzaMm / 2 || ym[g] < c.y0Mm || ym[g] > c.y1Mm) continue;
    const t = (ym[g] - centro) / meta;
    const H = (c.altezzaEstremiMm + (c.altezzaCentroMm - c.altezzaEstremiMm) * Math.sqrt(Math.max(0, 1 - t * t))) * 1e-3;
    // trave: E I / b distribuito sulla sua larghezza (sopra la piastra: asse neutro spostato, approssimato)
    const EIperB = (ABETE.EL * (H + ABETE.h) ** 3) / 12;
    Dy[g] = Math.max(DyPiastra, EIperB);
  }
}
console.log(`rapporto di rigidezza Dy/Dx = ${(DyPiastra / Dx).toFixed(1)} (EL/ER = ${(ABETE.EL / ABETE.ER).toFixed(1)})`);

t0 = Date.now();
const K = new Float64Array(n * n);
for (let a = 0; a < n; a++) {
  for (let b = a; b < n; b++) {
    const xa = Pxx[a], ya = Pyy[a], za = Pxy[a], xb = Pxx[b], yb = Pyy[b], zb = Pxy[b];
    let s = 0;
    for (let g = 0; g < G; g++) {
      s += Dx * xa[g] * xb[g] + D12 * (xa[g] * yb[g] + ya[g] * xb[g]) + Dy[g] * ya[g] * yb[g] + 4 * D66 * za[g] * zb[g];
    }
    K[a * n + b] = K[b * n + a] = s * dA;
  }
}
const { valori, vettori } = jacobi(K, n);
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
    const v = vettori[a * n + m];
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
  // la colonna centrale cade sulla giunta: si legge a ±4 mm
  const asse = cambi(colonna(4)) ;
  const asseB = cambi(colonna(-4));
  const r = {
    parita,
    asse: Math.max(asse, asseB),
    lato: cambi(colonna(32)),
    spalleAlte: cambi(riga(85)),
    vita: cambi(riga(178)),
    spalleBasse: cambi(riga(285)),
  };
  /** @type {string} */
  let nome = 'altro';
  if (parita < -0.5 && r.lato === 1 && r.spalleAlte <= 1 && r.spalleBasse <= 1) nome = 'croce';
  else if (parita > 0.5 && r.asse === 0 && r.vita === 2) nome = 'parentesi';
  else if (parita > 0.5 && r.asse === 2 && r.spalleAlte === 2 && r.spalleBasse === 2) nome = 'anello';
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
for (let m = 0; m < n && elastici.length < 12; m++) if (freq[m] > 5) elastici.push(m);

const confronti = [];
/** @type {Record<string, { m: number, w: Float64Array, hz: number, t: ReturnType<typeof topologia> }>} */
const trovati = {};
const elenco = [];
for (const [ordine, m] of elastici.entries()) {
  const w = normalizza(valutaSuGriglia(coefficientiModo(m), NU_OUT, NV_OUT), out.maschera);
  const t = topologia(w, out.maschera, NU_OUT, NV_OUT);
  elenco.push({ ordine: ordine + 1, hz: Math.round(freq[m] * 10) / 10, ...t });
  console.log(`modo elastico ${ordine + 1}: ${freq[m].toFixed(1)} Hz  ${t.nome.padEnd(9)} parità ${t.parita.toFixed(2)} asse ${t.asse} lato ${t.lato} spalle alte ${t.spalleAlte} vita ${t.vita} spalle basse ${t.spalleBasse}`);
  scriviPng(`calcolato-${String(ordine + 1).padStart(2, '0')}-${t.nome}.png`, { campo: w, maschera: out.maschera, nu: NU_OUT, nv: NV_OUT, scala: 3 });
  if (t.nome !== 'altro' && !trovati[t.nome]) trovati[t.nome] = { m, w, hz: freq[m], t };
  confronti.push({ campo: w, maschera: out.maschera, nu: NU_OUT, nv: NV_OUT, scala: 2 });
}
scriviTavolaComparata('calcolati-tutti.png', confronti);

for (const nome of ['croce', 'parentesi', 'anello']) {
  if (!trovati[nome]) throw new Error(`topologia "${nome}" non trovata nei primi 12 modi: rivedi i parametri o usa il piano B`);
}
const aperto = anelloAperto(trovati.anello.w, out.maschera, NU_OUT, NV_OUT);
console.log(`anello aperto alle C: bassi ${aperto.bassi}, acuti ${aperto.acuti}`);

// segno: centro della tavola positivo (solo convenzione)
const kc = Math.floor(NV_OUT / 2) * NU_OUT + NU_OUT / 2;
for (const v of Object.values(trovati)) if (v.w[kc] < 0) for (let k = 0; k < v.w.length; k++) v.w[k] = -v.w[k];

const scelta = [
  { modo: 1, hzBottega: 92, ...trovati.croce, simm: false },
  { modo: 2, hzBottega: 168, ...trovati.parentesi, simm: true },
  { modo: 5, hzBottega: 348, ...trovati.anello, simm: true },
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
    hzCalcolatoPiastraPiana: Math.round(s.hz * 10) / 10,
    ordineCalcolo: elastici.indexOf(s.m) + 1,
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
  metodo: 'rayleigh-ritz',
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
    bombatura: false,
  },
  modi: modiMeta,
  anello: { centro: centroAnello, apertoAlleC: aperto },
  riposo: { cuscinetti: modiMeta[0].cuscinetti },
  calcolati: elenco.map((e) => ({ ordine: e.ordine, hz: e.hz, topologia: e.nome })),
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
  /** Frequenza della piastra piana del calcolo: solo documentazione, mai usata. */
  readonly hzCalcolatoPiastraPiana: number;
  readonly ordineCalcolo: number;
  readonly topologia: TopologiaModo;
  /** Quattro cuscinetti (u, v) in [0, 1] sul rettangolo, sulle linee nodali. */
  readonly cuscinetti: ReadonlyArray<readonly [number, number]>;
}

export interface MetaModi {
  readonly versione: number;
  readonly data: string;
  readonly metodo: 'rayleigh-ritz' | 'a-mano';
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
  readonly calcolati: ReadonlyArray<{ readonly ordine: number; readonly hz: number; readonly topologia: string }>;
}

export const MODI_META: MetaModi = /*JSON*/${JSON.stringify(meta, null, 2)}/*FINE*/ as MetaModi;
`;

mkdirSync(DATI, { recursive: true });
writeFileSync(resolve(DATI, 'modi.bin'), bin);
writeFileSync(resolve(DATI, 'modi-meta.ts'), ts);
console.log(`scritti modi.bin (${bin.length} B) e modi-meta.ts`);
