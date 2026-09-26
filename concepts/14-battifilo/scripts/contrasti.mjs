#!/usr/bin/env node
/**
 * BATTIFILO · contrasti WCAG dei token (art-director).
 *
 * Uso, dalla cartella del concept:  node scripts/contrasti.mjs
 *
 * 1. Legge gli hex da styles/tokens.css (variabili --btf-*) e da
 *    styles/tokens.ts (COLORI) e controlla che coincidano.
 * 2. Calcola il rapporto di contrasto WCAG 2.x (luminanza relativa sRGB) di
 *    ogni coppia usata nel sito. Sulla lastra calcola tre casi: la tinta
 *    media, il punto più scuro e il punto più chiaro della texture. La
 *    texture è una mappa di luminanza in grigio (valori 116-146) fusa in
 *    soft-light sulla tinta: il colore reale sotto il testo si ottiene con
 *    la formula soft-light del W3C (Compositing and Blending Level 1).
 * 3. Stampa la tabella in Markdown (è quella di docs/art-director.md §3) e
 *    esce con codice 1 se una coppia con soglia non passa o se gli hex non
 *    coincidono.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const qui = dirname(fileURLToPath(import.meta.url));
const stili = join(qui, '..', 'src', 'pages', 'concepts', 'battifilo', 'styles');

/* ---------------------------------------------------------------- lettura */

const css = readFileSync(join(stili, 'tokens.css'), 'utf8');
const ts = readFileSync(join(stili, 'tokens.ts'), 'utf8');

const daCss = {};
for (const m of css.matchAll(/--btf-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) {
  daCss[m[1]] = m[2].toUpperCase();
}

const daTs = {};
const blocco = ts.match(/export const COLORI = \{([\s\S]*?)\} as const;/);
if (blocco === null) {
  console.error('COLORI non trovato in tokens.ts');
  process.exit(1);
}
for (const m of blocco[1].matchAll(/([a-zA-Z]+):\s*'(#[0-9A-Fa-f]{6})'/g)) {
  daTs[m[1]] = m[2].toUpperCase();
}

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const differenze = [];
for (const [nome, hex] of Object.entries(daTs)) {
  const k = kebab(nome);
  if (daCss[k] === undefined) differenze.push(`${nome}: manca --btf-${k} in tokens.css`);
  else if (daCss[k] !== hex) differenze.push(`${nome}: tokens.ts ${hex} ≠ tokens.css ${daCss[k]}`);
}
for (const k of Object.keys(daCss)) {
  const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  if (daTs[camel] === undefined) differenze.push(`--btf-${k}: manca ${camel} in COLORI di tokens.ts`);
}

const C = {};
for (const [k, v] of Object.entries(daCss)) C[k] = v;

/* ---------------------------------------------------------------- colore */

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const hexDa = (c) =>
  '#' + c.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const rapporto = (a, b) => {
  const x = lum(a);
  const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/* soft-light W3C: cb = fondo (tinta), cs = sorgente (grigio della mappa) */
const D = (c) => (c <= 0.25 ? ((16 * c - 12) * c + 4) * c : Math.sqrt(c));
const softLight = (cb, cs) => (cs <= 0.5 ? cb - (1 - 2 * cs) * cb * (1 - cb) : cb + (2 * cs - 1) * (D(cb) - cb));
const MAPPA = { minimo: 116, media: 128, massimo: 146 };
const sullaMappa = (hex, grigio) => rgb(hex).map((v) => softLight(v, grigio / 255));

/* mescola: a sopra b con opacità t */
const mescola = (a, b, t) => rgb(a).map((v, i) => v * t + rgb(b)[i] * (1 - t));

/* ---------------------------------------------------------------- derivati */

const controlliDerivati = [];
{
  const rasatura = hexDa(mescola(C.calce, C.calcestruzzo, 0.45));
  controlliDerivati.push(['rasatura = 45% calce su calcestruzzo', rasatura, C.rasatura]);
  const vecchio = hexDa(mescola(C.cobalto, C.calcestruzzo, 0.55));
  controlliDerivati.push(['gesso vecchio = 55% cobalto su calcestruzzo', vecchio, C['gesso-vecchio']]);
}
for (const [nome, atteso, token] of controlliDerivati) {
  const d = Math.max(...rgb(atteso).map((v, i) => Math.abs(v - rgb(token)[i]) * 255));
  if (d > 1.01) differenze.push(`${nome}: calcolato ${atteso}, token ${token}`);
}

/* ---------------------------------------------------------------- coppie */

const lastra = {
  tinta: rgb(C.calcestruzzo),
  scuro: sullaMappa(C.calcestruzzo, MAPPA.minimo),
  chiaro: sullaMappa(C.calcestruzzo, MAPPA.massimo),
};
const ombra = {
  tinta: rgb(C['calcestruzzo-ombra']),
  scuro: sullaMappa(C['calcestruzzo-ombra'], MAPPA.minimo),
};

/**
 * [uso, primo piano (hex), fondo (nome), fondo (rgb), soglia | null, nota]
 * soglia 4.5 = testo normale AA; 3 = testo grande AA (≥ 24 px o ≥ 18,66 px
 * grassetto) o elemento non testuale (WCAG 1.4.11); null = informativo.
 */
const coppie = [];
const suLastra = (uso, fg, soglia, nota = '') => {
  coppie.push([uso, fg, 'lastra, tinta media', lastra.tinta, soglia, nota]);
  coppie.push([uso, fg, 'lastra, punto più scuro', lastra.scuro, soglia, '']);
  coppie.push([uso, fg, 'lastra, punto più chiaro', lastra.chiaro, soglia, '']);
};

suLastra('testo di lettura, fase, tacche, quote della porta (ferro)', C.ferro, 4.5);
suLastra('link e prezzi in riga, testo piccolo cobalto (cobalto fondo)', C['cobalto-fondo'], 4.5);
suLastra('cifre a stencil ≥ 24 px, quote della finestra (cobalto)', C.cobalto, 3, 'solo testo grande');
suLastra('linea battuta, tratti della forbice, rettangolo della finestra (cobalto)', C.cobalto, 3, 'non testuale');
suLastra('anello di fuoco sulla lastra (cobalto, 3 px)', C.cobalto, 3, 'non testuale');
suLastra('bordo del bottone cobalto sulla lastra', C.cobalto, 3, 'non testuale');
suLastra('filo teso, porta, tratteggio del vuoto, fascette (ferro)', C.ferro, 3, 'non testuale');
suLastra('pannello del cartello (ferro) sulla lastra', C.ferro, 3, 'non testuale');
suLastra('gesso già visto (cobalto 55%)', C['gesso-vecchio'], null, 'ausilio, non necessario: la posizione la dicono cassetta e tacche');
suLastra('tratti vuoti della forbice (calcestruzzo ombra)', C['calcestruzzo-ombra'], null, 'segnaposto: il testo accanto dice cosa manca');

coppie.push(['testo nei campi (ferro su rasatura)', C.ferro, 'rasatura', rgb(C.rasatura), 4.5, '']);
coppie.push(['riga di base del campo (ferro su rasatura)', C.ferro, 'rasatura', rgb(C.rasatura), 3, 'non testuale']);
coppie.push(['anello di fuoco cobalto sul campo', C.cobalto, 'rasatura', rgb(C.rasatura), 3, 'non testuale']);
coppie.push(['testo cobalto fondo nel campo (bottone "Usa 118")', C['cobalto-fondo'], 'rasatura', rgb(C.rasatura), 4.5, '']);
coppie.push(['campo sulla lastra (rasatura su calcestruzzo)', C.rasatura, 'lastra, tinta media', lastra.tinta, null, 'il campo si riconosce dalla riga di base ferro']);

coppie.push(['testo del bottone (calce su cobalto)', C.calce, 'cobalto', rgb(C.cobalto), 4.5, '']);
coppie.push(['testo del bottone premuto (calce su cobalto fondo)', C.calce, 'cobalto fondo', rgb(C['cobalto-fondo']), 4.5, '']);
coppie.push(['testo su fascia e cartello (calce su ferro)', C.calce, 'ferro', rgb(C.ferro), 4.5, '']);
coppie.push(['anello di fuoco calce su ferro', C.calce, 'ferro', rgb(C.ferro), 3, 'non testuale']);
coppie.push(['bordo del cartello (calce su ferro)', C.calce, 'ferro', rgb(C.ferro), 3, 'non testuale']);
coppie.push(['cassetta (ferro) sulla lastra: vedi riga "filo teso"', C.ferro, 'lastra, punto più chiaro', lastra.chiaro, 3, 'non testuale']);
coppie.push(['bottone cobalto sulla fascia ferro', C.cobalto, 'ferro', rgb(C.ferro), null, 'il bottone si riconosce dal testo calce (6,8:1)']);
coppie.push(['anello di fuoco calce intorno al bottone nella fascia', C.calce, 'ferro', rgb(C.ferro), 3, 'non testuale']);
coppie.push(['testo sul segnaposto in ombra (vietato)', C.ferro, 'calcestruzzo ombra, punto più scuro', ombra.scuro, null, 'nessun testo sull’ombra: riga di controllo']);

/* ---------------------------------------------------------------- stampa */

const f2 = (n) => n.toFixed(2);
let falliti = 0;
const righe = [];
righe.push('| Uso | Primo piano | Fondo | Colore reale del fondo | Rapporto | Soglia | Esito |');
righe.push('|---|---|---|---|---|---|---|');
for (const [uso, fg, nomeFondo, fondo, soglia, nota] of coppie) {
  const r = rapporto(rgb(fg), fondo);
  let esito;
  if (soglia === null) esito = `informativo${nota ? ` (${nota})` : ''}`;
  else if (r >= soglia) esito = `passa${nota ? ` (${nota})` : ''}`;
  else {
    esito = `**NON PASSA**${nota ? ` (${nota})` : ''}`;
    falliti += 1;
  }
  righe.push(
    `| ${uso} | \`${fg}\` | ${nomeFondo} | \`${hexDa(fondo)}\` | **${f2(r)}:1** | ${soglia === null ? 'n/a' : `${soglia}:1`} | ${esito} |`,
  );
}

console.log('## Contrasti WCAG 2.x dei token BATTIFILO\n');
console.log(
  `Lastra: tinta \`${C.calcestruzzo}\`; mappa di luminanza ${MAPPA.minimo}-${MAPPA.massimo} in soft-light → ` +
    `punto più scuro \`${hexDa(lastra.scuro)}\` (luminanza ×${f2(lum(lastra.scuro) / lum(lastra.tinta))}), ` +
    `punto più chiaro \`${hexDa(lastra.chiaro)}\` (×${f2(lum(lastra.chiaro) / lum(lastra.tinta))}).\n`,
);
console.log(righe.join('\n'));
console.log('');

if (differenze.length > 0) {
  console.log('### Differenze tra tokens.css e tokens.ts\n');
  for (const d of differenze) console.log(`- ${d}`);
  console.log('');
} else {
  console.log('tokens.css e tokens.ts coincidono (8 colori); i derivati tornano con le loro formule.\n');
}

const conSoglia = coppie.filter((c) => c[4] !== null).length;
console.log(`${conSoglia - falliti} coppie con soglia su ${conSoglia} passano.`);
process.exit(falliti > 0 || differenze.length > 0 ? 1 : 0);
