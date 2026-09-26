/**
 * Pesi gzip dei file di dist/assets confrontati con il budget del
 * tech-architect §8. Solo standalone: `npm run build && npm run size`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const cartella = new URL('../dist/assets/', import.meta.url);
const kb = (n) => (n / 1024).toFixed(2);
const BUDGET = { concept: 60, iniziale: 115, css: 24 };

let file;
try {
  file = readdirSync(cartella);
} catch {
  console.error('dist/assets non esiste: lancia prima npm run build');
  process.exit(1);
}

const righe = file
  .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
  .map((f) => {
    const dati = readFileSync(join(cartella.pathname, f));
    return { f, grezzo: dati.length, gz: gzipSync(dati, { level: 9 }).length };
  })
  .sort((a, b) => b.gz - a.gz);

for (const r of righe) console.log(`${r.f.padEnd(40)} ${kb(r.grezzo).padStart(8)} KB  ${kb(r.gz).padStart(7)} KB gz`);

const somma = (filtro) => righe.filter(filtro).reduce((n, r) => n + r.gz, 0);
const concept = somma((r) => r.f.startsWith('Concept15') && r.f.endsWith('.js'));
const react = somma((r) => r.f.startsWith('react') && r.f.endsWith('.js'));
const indice = somma((r) => r.f.startsWith('index') && r.f.endsWith('.js'));
const css = somma((r) => r.f.endsWith('.css'));
const esito = (v, max) => `${kb(v)} KB gz (budget ${max}) ${v / 1024 <= max ? 'OK' : 'SOPRA'}`;

console.log('');
console.log(`JS del concept (Concept15)      ${esito(concept, BUDGET.concept)}`);
console.log(`JS iniziale (react+index+concept) ${esito(concept + react + indice, BUDGET.iniziale)}`);
console.log(`CSS totale                      ${esito(css, BUDGET.css)}`);
