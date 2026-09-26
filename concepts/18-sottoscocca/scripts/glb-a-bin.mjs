#!/usr/bin/env node
// Conversione offline del modello Kenney (Car Kit 3.1, CC0) nel binario compatto
// letto da `src/pages/concepts/sottoscocca/webgl/scena/auto.ts`.
//
//   node scripts/glb-a-bin.mjs                 (da concepts/18-sottoscocca/)
//   node scripts/glb-a-bin.mjs --controllo     (stampa le statistiche, non scrive)
//
// Cosa fa:
// 1. legge `sorgenti/kenney/sedan.glb` e `sorgenti/kenney/colormap.png`
//    (la texture esterna del GLB, usata SOLO qui per classificare i triangoli);
// 2. classifica ogni triangolo per la cella della colormap indicata dalle UV
//    (8 colonne x 4 righe da 64 px): carrozzeria, fascia, fondo, vetri, fanali
//    per la scocca; gomma e cerchio per le ruote;
// 3. porta il giocattolo verso le proporzioni di una berlina vera: scala
//    uniforme SCALA, poi allunga SOLO il tratto centrale della scocca (tra i due
//    passaruota) di ALLUNGAMENTO metri, cosi' passaruota, paraurti e ruote non
//    si deformano; le ruote si spostano sul passo nuovo;
// 4. scarta UV, tangenti e texture, unisce i vertici uguali, quantizza
//    (posizioni Int16 sul riquadro della mesh, normali Int8) e scrive un solo
//    file `webgl/modelli/auto.bin` con intestazione JSON incorporata.
//
// Formato di auto.bin (little endian):
//   0  'SSC1'                         4 byte
//   4  uint32 lunghezza dell'intestazione JSON (byte, multiplo di 4)
//   8  intestazione JSON UTF-8 (riempita di spazi fino al multiplo di 4)
//   8+L blocchi binari, ognuno allineato a 4 byte, agli offset indicati nel JSON
//       (offset contati dall'inizio del file).
// Nessuna dipendenza: PNG decodificato con zlib di Node.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GLB = resolve(RADICE, 'sorgenti/kenney/sedan.glb');
const COLORMAP = resolve(RADICE, 'sorgenti/kenney/colormap.png');
const USCITA = resolve(RADICE, 'src/pages/concepts/sottoscocca/webgl/modelli/auto.bin');
const SOLO_CONTROLLO = process.argv.includes('--controllo');

/** Scala uniforme: il sedan Kenney e' largo 1,50 m; una berlina media 1,75 m. */
const SCALA = 1.15;
/** Metri aggiunti al tratto centrale della scocca (da 2,93 a circa 4,2 m). */
const ALLUNGAMENTO = 1.25;
/** Meta' del tratto centrale che si allunga, in metri Kenney (i passaruota partono da 0,36). */
const MEZZO_TRATTO = 0.33;

/**
 * Celle della colormap (colonna,riga) -> gruppo. Le celle sono state lette dal
 * `colormap.png` di Car Kit 3.1 e dai render di prova (docs/webgl-artist.md §2).
 * Una cella non elencata va in `carrozzeria` (la vernice cambia cella da un
 * modello all'altro: sedan 6,1 arancio, hatchback-sports 3,1 verde).
 */
const CELLE_SCOCCA = {
  '3,2': 'fascia', // grigio: fascia bassa, paraurti, sottoporta (e il fondo, vedi sotto)
  '2,2': 'fondo', // grigio scuro: interno dei passaruota
  '0,3': 'vetri', // azzurro chiarissimo
  '6,2': 'fanali', // bianco: fari
  '1,3': 'fanali', // giallo: frecce
  '2,3': 'fanali', // rosso: fanali posteriori
};
const CELLE_RUOTA = { '2,2': 'gomma', '5,2': 'cerchio' };
/** Ordine dei gruppi nell'indice (e quindi delle draw call). */
const GRUPPI_SCOCCA = ['carrozzeria', 'fascia', 'fondo', 'vetri', 'fanali'];
const GRUPPI_RUOTA = ['gomma', 'cerchio'];

// ---------------------------------------------------------------- PNG

function leggiPng(percorso) {
  const b = readFileSync(percorso);
  let o = 8;
  let w = 0;
  let h = 0;
  let tipo = 0;
  let profondita = 0;
  let interlacciato = 0;
  const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o);
    const t = b.toString('ascii', o + 4, o + 8);
    const d = b.subarray(o + 8, o + 8 + len);
    if (t === 'IHDR') {
      w = d.readUInt32BE(0);
      h = d.readUInt32BE(4);
      profondita = d[8];
      tipo = d[9];
      interlacciato = d[12];
    } else if (t === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  if (profondita !== 8 || (tipo !== 6 && tipo !== 2) || interlacciato !== 0) {
    throw new Error(`colormap.png: formato non gestito (profondita ${profondita}, tipo ${tipo}, interlacciato ${interlacciato})`);
  }
  const bpp = tipo === 6 ? 4 : 3;
  const grezzo = inflateSync(Buffer.concat(idat));
  const riga = w * bpp;
  const px = Buffer.alloc(w * h * bpp);
  const zero = Buffer.alloc(riga);
  for (let y = 0; y < h; y++) {
    const filtro = grezzo[y * (riga + 1)];
    const src = grezzo.subarray(y * (riga + 1) + 1, (y + 1) * (riga + 1));
    const su = y > 0 ? px.subarray((y - 1) * riga, y * riga) : zero;
    const qui = px.subarray(y * riga, (y + 1) * riga);
    for (let x = 0; x < riga; x++) {
      const a = x >= bpp ? qui[x - bpp] : 0;
      const bb = su[x];
      const c = x >= bpp ? su[x - bpp] : 0;
      let v = src[x];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += bb;
      else if (filtro === 3) v += (a + bb) >> 1;
      else if (filtro === 4) {
        const p = a + bb - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - bb);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
      }
      qui[x] = v & 255;
    }
  }
  return { w, h, bpp, px };
}

// ---------------------------------------------------------------- GLB

function leggiGlb(percorso) {
  const b = readFileSync(percorso);
  if (b.toString('ascii', 0, 4) !== 'glTF') throw new Error('sedan.glb: non e\' un GLB');
  const lenJson = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + lenJson).toString('utf8'));
  const inizioBin = 20 + lenJson;
  const bin = b.subarray(inizioBin + 8, inizioBin + 8 + b.readUInt32LE(inizioBin));
  const componenti = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  const tipi = { 5126: Float32Array, 5123: Uint16Array, 5125: Uint32Array };
  function accessor(i) {
    const a = json.accessors[i];
    const bv = json.bufferViews[a.bufferView];
    const n = componenti[a.type];
    const T = tipi[a.componentType];
    if (!T) throw new Error(`accessor ${i}: componentType ${a.componentType} non gestito`);
    const passo = bv.byteStride ?? n * T.BYTES_PER_ELEMENT;
    if (passo !== n * T.BYTES_PER_ELEMENT) throw new Error(`accessor ${i}: dati interlacciati non gestiti`);
    const off = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const copia = new Uint8Array(a.count * passo);
    copia.set(bin.subarray(off, off + copia.length));
    return new T(copia.buffer);
  }
  const nodi = {};
  for (const nodo of json.nodes) {
    if (nodo.mesh === undefined) continue;
    if (nodo.rotation || nodo.scale) throw new Error(`nodo ${nodo.name}: rotazione o scala non attese`);
    const prim = json.meshes[nodo.mesh].primitives;
    if (prim.length !== 1) throw new Error(`nodo ${nodo.name}: attesa una sola primitiva`);
    const p = prim[0];
    nodi[nodo.name] = {
      t: nodo.translation ?? [0, 0, 0],
      pos: accessor(p.attributes.POSITION),
      nor: accessor(p.attributes.NORMAL),
      uv: accessor(p.attributes.TEXCOORD_0),
      ind: accessor(p.indices),
    };
  }
  for (const n of ['body', 'wheel-front-left', 'wheel-front-right', 'wheel-back-left', 'wheel-back-right']) {
    if (!nodi[n]) throw new Error(`sedan.glb: manca il nodo ${n}`);
  }
  return nodi;
}

// ---------------------------------------------------------------- trasformazioni

const TRATTO = MEZZO_TRATTO * SCALA;
const K = 1 + ALLUNGAMENTO / (2 * TRATTO);

/** z scalato -> z allungato (lineare a tratti, continuo). */
function allungaZ(z) {
  if (Math.abs(z) <= TRATTO) return z * K;
  return z + Math.sign(z) * TRATTO * (K - 1);
}

function cella(uv, ind, t) {
  let u = 0;
  let v = 0;
  for (let k = 0; k < 3; k++) {
    u += uv[ind[t + k] * 2];
    v += uv[ind[t + k] * 2 + 1];
  }
  u /= 3;
  v /= 3;
  return `${Math.floor(u * 8)},${Math.floor(v * 4)}`;
}

/**
 * Costruisce una mesh pulita: vertici trasformati, uniti, triangoli ordinati
 * per gruppo. `trasforma(p, n)` riceve posizione e normale Kenney del vertice
 * (gia' traslate dal nodo) e restituisce [p', n'].
 */
function costruisci(nodo, celle, gruppi, trasforma, classificaExtra) {
  const { pos, nor, uv, ind } = nodo;
  const perGruppo = Object.fromEntries(gruppi.map((g) => [g, []]));
  const conteggioCelle = {};
  for (let t = 0; t < ind.length; t += 3) {
    const c = cella(uv, ind, t);
    conteggioCelle[c] = (conteggioCelle[c] ?? 0) + 1;
    let g = celle[c] ?? gruppi[0];
    if (classificaExtra) g = classificaExtra(g, t);
    perGruppo[g].push(ind[t], ind[t + 1], ind[t + 2]);
  }
  const mappa = new Map();
  const P = [];
  const N = [];
  const I = [];
  const intervalli = [];
  for (const g of gruppi) {
    const inizio = I.length;
    for (const vi of perGruppo[g]) {
      const [p, n] = trasforma(
        [pos[vi * 3] + nodo.t[0], pos[vi * 3 + 1] + nodo.t[1], pos[vi * 3 + 2] + nodo.t[2]],
        [nor[vi * 3], nor[vi * 3 + 1], nor[vi * 3 + 2]],
      );
      const chiave = `${p.map((x) => Math.round(x * 1e5)).join(',')}|${n.map((x) => Math.round(x * 100)).join(',')}`;
      let idx = mappa.get(chiave);
      if (idx === undefined) {
        idx = P.length / 3;
        mappa.set(chiave, idx);
        P.push(...p);
        N.push(...n);
      }
      I.push(idx);
    }
    intervalli.push({ nome: g, inizio, conta: I.length - inizio });
  }
  return { P, N, I, intervalli, conteggioCelle };
}

function normalizza(n) {
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
}

// ---------------------------------------------------------------- main

const nodi = leggiGlb(GLB);
const png = leggiPng(COLORMAP);

// Controllo: le celle usate devono avere il colore atteso (vernice satura, vetri chiari...).
function coloreCella(c) {
  const [cx, cy] = c.split(',').map(Number);
  const x = Math.floor((cx + 0.5) * (png.w / 8));
  const y = Math.floor((cy + 0.5) * (png.h / 4));
  const i = (y * png.w + x) * png.bpp;
  return [png.px[i], png.px[i + 1], png.px[i + 2]];
}

// Scocca: scala, allungamento del tratto centrale, fondo separato per normale.
const corpoNodo = nodi.body;
const corpo = costruisci(
  corpoNodo,
  CELLE_SCOCCA,
  GRUPPI_SCOCCA,
  (p, n) => {
    const ps = [p[0] * SCALA, p[1] * SCALA, allungaZ(p[2] * SCALA)];
    const dentro = Math.abs(p[2] * SCALA) <= TRATTO;
    const ns = normalizza([n[0], n[1], dentro ? n[2] / K : n[2]]);
    return [ps, ns];
  },
  (g, t) => {
    // Le facce della fascia rivolte in basso sono il pianale: vanno nel fondo.
    if (g !== 'fascia') return g;
    const { nor, ind } = corpoNodo;
    let ny = 0;
    for (let k = 0; k < 3; k++) ny += nor[ind[t + k] * 3 + 1] / 3;
    return ny < -0.7 ? 'fondo' : g;
  },
);

// Ruote: una sinistra e una destra, riferite al centro della ruota.
const ruote = {};
const posizioniRuote = {};
for (const [nomeKenney, lato] of [
  ['wheel-front-left', 'sx'],
  ['wheel-front-right', 'dx'],
]) {
  const nodo = { ...nodi[nomeKenney], t: [0, 0, 0] };
  ruote[`ruota-${lato}`] = costruisci(nodo, CELLE_RUOTA, GRUPPI_RUOTA, (p, n) => [
    [p[0] * SCALA, p[1] * SCALA, p[2] * SCALA],
    normalizza(n),
  ]);
}
for (const [nomeKenney, nome, mesh] of [
  ['wheel-front-left', 'anteriore-sinistra', 'ruota-sx'],
  ['wheel-front-right', 'anteriore-destra', 'ruota-dx'],
  ['wheel-back-left', 'posteriore-sinistra', 'ruota-sx'],
  ['wheel-back-right', 'posteriore-destra', 'ruota-dx'],
]) {
  const t = nodi[nomeKenney].t;
  posizioniRuote[nome] = {
    mesh,
    centro: [t[0] * SCALA, t[1] * SCALA, allungaZ(t[2] * SCALA)].map((x) => +x.toFixed(4)),
  };
}

// ---------------------------------------------------------------- misure

function riquadro(P) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], P[i + a]);
      max[a] = Math.max(max[a], P[i + a]);
    }
  }
  return { min, max };
}
const rCorpo = riquadro(corpo.P);
const rRuota = riquadro(ruote['ruota-sx'].P);
// Quota del pianale: y minima tra i triangoli del fondo rivolti in basso.
let fondoY = Infinity;
{
  const f = corpo.intervalli.find((x) => x.nome === 'fondo');
  for (let i = f.inizio; i < f.inizio + f.conta; i++) {
    const v = corpo.I[i];
    if (corpo.N[v * 3 + 1] < -0.7) fondoY = Math.min(fondoY, corpo.P[v * 3 + 1]);
  }
}
const misure = {
  lunghezza: +(rCorpo.max[2] - rCorpo.min[2]).toFixed(3),
  larghezza: +(rCorpo.max[0] - rCorpo.min[0]).toFixed(3),
  altezza: +rCorpo.max[1].toFixed(3),
  fondoY: +fondoY.toFixed(3),
  zMin: +rCorpo.min[2].toFixed(3),
  zMax: +rCorpo.max[2].toFixed(3),
  passo: +(posizioniRuote['anteriore-sinistra'].centro[2] - posizioniRuote['posteriore-sinistra'].centro[2]).toFixed(3),
  carreggiata: +(posizioniRuote['anteriore-sinistra'].centro[0] - posizioniRuote['anteriore-destra'].centro[0]).toFixed(3),
  raggioRuota: +((rRuota.max[1] - rRuota.min[1]) / 2).toFixed(3),
  larghezzaRuota: +(rRuota.max[0] - rRuota.min[0]).toFixed(3),
  // x della faccia esterna della ruota sinistra, relativa al suo centro
  ruotaEsternoX: +rRuota.max[0].toFixed(3),
  ruotaInternoX: +rRuota.min[0].toFixed(3),
};

// ---------------------------------------------------------------- scrittura

const blocchi = [];
let cursore = 0; // offset relativo all'inizio dei dati, poi spostato
function aggiungi(buf) {
  const pad = (4 - (buf.byteLength % 4)) % 4;
  const off = cursore;
  blocchi.push(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength));
  if (pad) blocchi.push(Buffer.alloc(pad));
  cursore += buf.byteLength + pad;
  return off;
}

function scriviMesh(m) {
  const { min, max } = riquadro(m.P);
  const passo = min.map((mn, a) => (max[a] - mn) / 65535 || 1);
  const nv = m.P.length / 3;
  const q = new Int16Array(nv * 3);
  for (let i = 0; i < nv * 3; i++) {
    const a = i % 3;
    q[i] = Math.round((m.P[i] - min[a]) / passo[a]) - 32768;
  }
  const n = new Int8Array(nv * 3);
  for (let i = 0; i < nv * 3; i++) n[i] = Math.max(-127, Math.min(127, Math.round(m.N[i] * 127)));
  if (nv > 65535) throw new Error('troppi vertici per indici Uint16');
  const idx = new Uint16Array(m.I);
  return {
    vertici: nv,
    triangoli: m.I.length / 3,
    posizioni: { offset: aggiungi(q), min: min.map((x) => +x.toFixed(6)), passo: passo.map((x) => +x.toPrecision(8)) },
    normali: { offset: aggiungi(n) },
    indici: { offset: aggiungi(idx), conta: m.I.length },
    gruppi: m.intervalli,
  };
}

const intestazione = {
  formato: 'SSC1',
  fonte: 'Kenney Car Kit 3.1, sedan.glb (CC0, www.kenney.nl)',
  unita: 'metri; y=0 a terra sotto le gomme; z verso il muso; x verso il lato sinistro dell\'auto',
  scala: SCALA,
  allungamento: ALLUNGAMENTO,
  misure,
  ruote: posizioniRuote,
  mesh: {
    corpo: scriviMesh(corpo),
    'ruota-sx': scriviMesh(ruote['ruota-sx']),
    'ruota-dx': scriviMesh(ruote['ruota-dx']),
  },
};

// Gli offset nel JSON diventano assoluti: servono le dimensioni dell'intestazione,
// che a loro volta dipendono dagli offset. Due passate bastano (le cifre crescono al piu' di poco).
function serializza(base) {
  const copia = JSON.parse(JSON.stringify(intestazione));
  for (const m of Object.values(copia.mesh)) {
    m.posizioni.offset += base;
    m.normali.offset += base;
    m.indici.offset += base;
  }
  let s = Buffer.from(JSON.stringify(copia), 'utf8');
  const pad = (4 - (s.length % 4)) % 4;
  if (pad) s = Buffer.concat([s, Buffer.alloc(pad, 0x20)]);
  return s;
}
let json = serializza(0);
for (let giro = 0; giro < 4; giro++) {
  const prossimo = serializza(8 + json.length);
  if (prossimo.length === json.length) {
    json = prossimo;
    break;
  }
  json = prossimo;
}
const testa = Buffer.alloc(8);
testa.write('SSC1', 0, 'ascii');
testa.writeUInt32LE(json.length, 4);
const file = Buffer.concat([testa, json, ...blocchi]);

// ---------------------------------------------------------------- resoconto

const righe = [];
righe.push(`misure (m): ${JSON.stringify(misure)}`);
for (const [nome, m] of Object.entries(intestazione.mesh)) {
  righe.push(`${nome}: ${m.vertici} vertici, ${m.triangoli} triangoli, gruppi ${m.gruppi.map((g) => `${g.nome} ${g.conta / 3}`).join(' / ')}`);
}
righe.push(`celle scocca: ${Object.entries(corpo.conteggioCelle).map(([c, n]) => `${c} (${coloreCella(c).join(',')}) ${n}`).join('; ')}`);
righe.push(`auto.bin: ${file.length} byte (intestazione ${json.length})`);
console.log(righe.join('\n'));

if (!SOLO_CONTROLLO) {
  mkdirSync(dirname(USCITA), { recursive: true });
  writeFileSync(USCITA, file);
  console.log(`scritto ${USCITA}`);
}
