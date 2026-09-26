#!/usr/bin/env node
// Fermi immagine della scena alle quattro quote (poster della prima schermata
// e fallback senza WebGL). Chromium headless con SwiftShader (GPU software).
//
//   node scripts/fermi-immagine.mjs [url-base] [--solo=0,180] [--qualita=0.72]
//
// url-base: pagina che, con `?fermo=<quota>`, disegna la scena ferma al
// plateau senza DOM sopra e segna `data-ssc-fermo="pronto"` su un elemento
// quando il primo frame e' a schermo. Default: http://localhost:9180/concept-18
// (modalita' fermo dello shader-engineer). In ondata 2 il webgl-artist l'ha
// lanciato sulla sua pagina di prova (docs/webgl-artist.md §8).
//
// Uscite in src/pages/concepts/sottoscocca/assets/fermi/:
//   quota-<q>-l.webp  1600 x 900  (landscape, DPR 1)
//   quota-<q>-p.webp   750 x 1624 (portrait, finestra 375 x 812 a DPR 2)
// La codifica WebP la fa Chromium (canvas.toDataURL), niente dipendenze.
// Playwright: quello del progetto se c'e', altrimenti quello globale.

import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const USCITA = resolve(RADICE, 'src/pages/concepts/sottoscocca/assets/fermi');
const argomenti = process.argv.slice(2);
const base = argomenti.find((a) => !a.startsWith('--')) ?? 'http://localhost:9180/concept-18';
const opzione = (nome, def) => argomenti.find((a) => a.startsWith(`--${nome}=`))?.split('=')[1] ?? def;
const QUOTE = opzione('solo', '0,20,80,180').split(',').map(Number);
const QUALITA = Number(opzione('qualita', '0.72'));

const FORMATI = [
  { suffisso: 'l', viewport: { width: 1600, height: 900 }, dpr: 1 },
  { suffisso: 'p', viewport: { width: 375, height: 812 }, dpr: 2 },
];

function trovaPlaywright() {
  const require = createRequire(import.meta.url);
  for (const dove of [RADICE, '/opt/node22/lib/node_modules']) {
    try {
      return require(require.resolve('playwright', { paths: [dove] }));
    } catch {
      // prova il prossimo
    }
  }
  throw new Error('playwright non trovato (npm i -D playwright, oppure quello globale in /opt/node22)');
}

const { chromium } = trovaPlaywright();
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
mkdirSync(USCITA, { recursive: true });
const errori = [];
try {
  for (const f of FORMATI) {
    const ctx = await browser.newContext({ viewport: f.viewport, deviceScaleFactor: f.dpr, ignoreHTTPSErrors: true });
    for (const q of QUOTE) {
      const pagina = await ctx.newPage();
      pagina.on('pageerror', (e) => errori.push(`${q}-${f.suffisso}: ${e.message}`));
      pagina.on('console', (m) => {
        if (m.type() === 'error') errori.push(`${q}-${f.suffisso}: ${m.text()}`);
      });
      const url = new URL(base);
      url.searchParams.set('fermo', String(q));
      await pagina.goto(url.href, { waitUntil: 'load' });
      await pagina.waitForSelector('[data-ssc-fermo="pronto"]', { timeout: 120000 });
      const png = await pagina.screenshot({ type: 'png' });
      // ricodifica in WebP nel browser stesso
      const dataUrl = await pagina.evaluate(
        async ({ b64, qualita }) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const c = document.createElement('canvas');
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const ctx2 = c.getContext('2d');
          ctx2.drawImage(img, 0, 0);
          return c.toDataURL('image/webp', qualita);
        },
        { b64: png.toString('base64'), qualita: QUALITA },
      );
      const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
      const file = resolve(USCITA, `quota-${q}-${f.suffisso}.webp`);
      writeFileSync(file, buf);
      console.log(`${file.replace(`${RADICE}/`, '')}  ${(buf.length / 1024).toFixed(1)} KB`);
      await pagina.close();
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
if (errori.length) {
  console.error(`errori nella pagina:\n${errori.join('\n')}`);
  process.exitCode = 1;
}
