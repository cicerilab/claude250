# Performance auditor · Concept 10 · IMPRONTA

Ondata 4 (QA). Misure sulla build standalone (`npm run build` +
`npx vite preview --port 8203 --strictPort`, chiuso a fine prova) contro il
budget di `tech-architect.md` §8. Nessun file sorgente modificato.

Letti: `tech-architect.md` (§4, §8, §9), `shader-engineer.md` (tutto,
diagnostica `window.__improntaGL` §8), il codice di `core/`, `interaction/light.ts`,
`webgl/ImprontaGL.ts`, `webgl/quality.ts`, `sections/Banco/Prova.tsx`,
`vite.config.ts`, `styles/tokens.ts`.

Strumenti: Lighthouse 13.5.0 (throttling simulato, preset mobile Moto G Power e
`--preset=desktop`), Playwright 1.56 + CDP (`Performance.getMetrics`,
`Emulation.setCPUThrottlingRate`), Chromium di `/opt/pw-browsers/chromium-1194`
headless. Script e JSON grezzi nella scratchpad della sessione
(`/tmp/claude-0/-home-user-claude250/72613ce9-a18f-5d71-bb71-d39c705d752e/scratchpad/perf/`:
`misura.mjs`, `diag.mjs`, `tipo.mjs`, `idle*.mjs`, `lh-*.json`, `modules.json`).

**Limiti dell'ambiente (da leggere prima dei numeri)**

- **WebGL = SwiftShader** (`--use-angle=swiftshader --enable-unsafe-swiftshader
  --ignore-gpu-blocklist`): è una GPU su CPU. Un frame 1440×900 costa ~1 s,
  quindi fps, tempi GPU, TBT e LCP delle corse "con GL" **non sono
  rappresentativi**. Del GL misuro solo: lavoro JS per frame del ticker, draw
  call, render on demand, memoria dichiarata. Per le prove GL stabili:
  `?gl=1` + script di init che toglie `failIfMajorPerformanceCaveat` (solo nel
  browser di prova, come lo shader-engineer).
- **Google Fonts**: dal browser della sandbox la richiesta fallisce (proxy). In
  Playwright ho servito il CSS e i woff2 veri (scaricati con curl da
  fonts.googleapis.com/gstatic) tramite `page.route`, **con 1200 ms di
  ritardo**, per vedere il cambio font a pagina già dipinta. Lighthouse invece
  gira senza font (resta il fallback metrico locale).
- La CPU della sandbox è più lenta di un desktop medio: i tempi "1×" sono
  pessimisti per un desktop, ottimisti per un telefono.

---

## 1. Tabella metriche vs budget

| Voce | Budget §8 | Misurato | Esito |
|---|---|---|---|
| JS concept (`Concept10-*.js`, lenis compreso) | ≤ 60 KB gz | **62,55 KB gz** (199,8 KB min) | **FUORI +2,55** |
| JS iniziale totale (html + `index` 1,27 + `react` con router 52,32 + `Concept10` 62,55) | ≤ 130 KB gz | **116,1 KB gz** (+1,05 html) | ok |
| Chunk WebGL lazy (`index-*.js` 22,28 + `three` 112,82) | ≤ 160 KB gz | **135,1 KB gz** | ok |
| CSS totale (`Concept10-*.css`) | ≤ 20 KB gz | **21,34 KB gz** (131,2 KB min; 20,9 con gzip -9) | **FUORI +1,34** (era 20,66 allo shader-engineer: cresce) |
| SVG | ≤ 25 KB | 6,9 KB file (`assets/svg/`) + 0,3 favicon + 3,3 KB di grana `feTurbulence` inline nel CSS (8 URI) = **~10,5 KB** | ok |
| Font latin | ≤ 180 KB, Anybody var + Hanken 3 pesi | **2 file, 91,6 KB**: Anybody variabile (wdth 50-150, wght 100-900) 56,9 KB + Hanken Grotesk variabile 34,7 KB. latin-ext **non** scaricato | ok (vedi P7) |
| Immagini raster | 0 | 0 (solo `data:` SVG e `blob:` delle maschere) | ok |
| LCP mobile | ≤ 2,5 s | **2,20 s** `?gl=0` · 3,26 s con GL SwiftShader (render delay 1,08 s, non rappresentativo) | ok (fallback) / da rifare su device |
| LCP desktop | ≤ 1,5 s | **0,55 s** `?gl=0` · 0,82 s con GL | ok |
| Elemento LCP | testo hero, mai canvas | mobile `h1#imp-hero-titolo`, desktop `div.imp-hero__parola` ("impronta") | ok |
| CLS (Lighthouse) | ≤ 0,02 | **0** in tutte e 4 le corse | ok |
| CLS con font in ritardo 1,2 s + pressa hero (Playwright) | ≤ 0,02 | desktop **0,0043**, mobile **0,0018** (un solo spostamento, all'arrivo dei font: `imp-testata__nav`/`imp-hero-sotto` a 1440, `imp-testata__indice` a 390); pressa: 0 | ok |
| TBT mobile | ≤ 150 ms | **233 ms** `?gl=0` · 4827 ms con GL SwiftShader | **FUORI** (vedi P1) |
| TBT desktop | — | 27 ms `?gl=0` · 2055 ms con GL SwiftShader | — |
| Performance score | — | mobile **94** / desktop **98** con `?gl=0`; 60 / 66 con GL SwiftShader | — |
| INP stimato (Event Timing, 23 tasti nel Banco + un radio) | ≤ 150 ms | desktop 1× p50 48 · p95 120 · **max 160 ms**; mobile 4× **max 256 ms** | **FUORI** (vedi P2) |
| Draw call per frame | 1 (+2-4 in cottura) | **1** frame normale (`drawCallFrameNormale`), **4** nei frame con cottura (1+3) | ok |
| Frame idle | 0 | `?gl=0`: **0 rAF in 10 s** (TaskDuration 1 ms). GL: 0 cotture, restano solo i frame della coda d'inerzia della luce (vedi P8) | ok |
| JS del ticker per frame (desktop 1×, scroll lenis con GL) | < 16 ms | p50 0,2 · p95 1,4 · max 4,4 ms; 0 long task | ok |
| JS del ticker per frame (mobile 390, CPU 4×, scroll continuo) | < 16 ms | `?gl=0` p50 0,4 · p95 5,1 · max 30,2 (1 frame su 54 > 16); GL p50 2,1 · max 11,4 | JS ok, **ma il frame no** (P1) |
| FPS mobile (4×, scroll continuo, `?gl=0`) | ≥ 50 | **~6 fps** (intervallo p50 185 ms), scroll avanzato di soli 365 px in 8 s | **FUORI** (P1) |
| FPS con GL | 60 / ≥ 50 | non misurabile in SwiftShader (~0,6-1 fps) | da device |
| DPR canvas | mobile ≤ 1,75, desktop ≤ 1,5, ≤ 3,5 M px | mobile DPR 3 → **1,749**, buffer 682×1477 (1,0 M px); desktop 1440×900 a DPR 1 | ok |
| Atlante | 2048², 16 MB GPU | desktop **2048² HalfFloat = 32 MB**; mobile 2048² 8 bit = 16 MB; occupazione 10-15% | desktop fuori (scelta dichiarata, P6) |
| Heap JS | — | 4,9 MB (`?gl=0`) · 6,2-6,6 MB (GL) | ok |

---

## 2. Dove pesa il chunk `Concept10` (62,55 KB gz)

Analisi per modulo con un config Vite di prova nella scratchpad (plugin
`generateBundle`, `renderedLength` prima della minificazione, gz del modulo da
solo). Il gz dei moduli sommati è più alto di quello del chunk (il chunk
comprime meglio): servono come proporzioni.

| Modulo | min (pre-minify) | gz da solo | Nota |
|---|---|---|---|
| `node_modules/lenis` | 33,1 KB | **8,2 KB** | serve solo dopo il primo input di scroll |
| `content/testi.ts` | 28,5 KB | 9,7 KB | contenuto: non si taglia |
| `sections/Hero/Testata.tsx` | 22,3 KB | 5,2 KB | 791 righe, molti commenti (spariscono in minify) |
| `sections/Banco/*` (Banco, Compositoio, Prova, Leva, calcolaPrezzo, invio) + `useHoldToConfirm` | ~54 KB | ~14,8 KB | sezione sotto la piega |
| `interaction/light.ts` | 16,7 KB | 4,6 KB | |
| `motion/usePressione` + `choreography` + `useScrollProgress` + `spring` + `easing` | ~46 KB | ~14 KB | |
| marchio SVG importato **due volte** (`?url` data URI 1,1 KB in Testata e Colophon + `?raw` 0,86 KB in Colophon) | 2,0 KB | ~1,0 KB | doppione |

Tagli proposti (in ordine di resa):

1. **lenis in import dinamico** (`core/lenis.ts`: `avviaScroll` fa
   `import('lenis')` e crea l'istanza al `then`; `getLenis()` resta `null`
   fino ad allora, e tutti i chiamanti gestiscono già `null`: Testata,
   `useScrollProgress`, `ticker`). Resa **~7-8 KB gz** → chunk ~55 KB.
   Primo scroll prima del caricamento: nativo (come reduced motion).
   Proprietario **scaffold-engineer**.
2. **Un solo marchio**: in Testata e Colophon costruire l'URL da
   `marchioImpronta` (raw) con `` `url("data:image/svg+xml,${encodeURIComponent(marchioImpronta)}")` ``
   e togliere gli import `?url`. Resa ~0,5 KB gz. Proprietari
   **section-builder-hero** (`Testata.tsx`) e **section-builder-colophon**
   (`Colophon.tsx`).
3. (strutturale, facoltativo) **Banco lazy** con `React.lazy` e altezza
   riservata (min-block-size già nota da `layout.css`) caricato quando
   `#bottega`/`#carta` entra nel margine dell'IO: −~14 KB gz dal JS iniziale e
   −5,2 KB gz dal CSS iniziale (non dal totale). Rischio CLS se l'altezza non
   è riservata. Proprietari **scaffold-engineer** (`Impronta.tsx`) +
   **section-builder-banco**. Da valutare con il tech-architect.

Con 1 + 2 il chunk rientra (~54-55 KB gz) senza toccare le sezioni.

## 3. Dove pesa il CSS (21,34 KB gz)

gz per file minificato da solo (la somma è 28,9 KB: in bundle comprime a 21,3).

| File | min | gz |
|---|---|---|
| `sections/Banco/banco.css` | 28,1 KB | **5,2 KB** |
| `sections/Hero/testata.css` | 11,6 KB | 2,5 KB |
| `styles/tokens.css` | 10,7 KB | 2,5 KB |
| `interaction/interaction.css` | 11,2 KB | 2,4 KB |
| `sections/Tecniche/tecniche.css` | 10,7 KB | 2,4 KB |
| `sections/PerChi/per-chi.css` | 8,8 KB | 2,2 KB |
| legatoria 1,9 · carta 1,8 · bottega 1,7 · colophon 1,7 · relief-fallback 1,4 · base 1,3 · hero 1,3 · layout 0,5 | | |

Guadagno misurato togliendo gruppi dal bundle: `@media (min-width:1024px)`
(28 blocchi) 1,7 KB; `forced-colors` 0,42 KB (da tenere: accessibilità);
prefisso `.imp-root ` davanti alle classi BEM di sezione (918 occorrenze)
**0,36 KB**.

Tagli proposti (servono ≥ 1,4 KB):

1. **banco.css** (il 25% del CSS): 6 blocchi di dichiarazioni identici
   ripetuti, 11× `font-size: var(--imp-fs-piccolo)` e 9×
   `font-family: var(--imp-font-display)` riscritti per elemento; unire gli
   stati duplicati e usare le utility di base. Obiettivo −0,6 KB gz.
   Proprietario **section-builder-banco**.
2. **Utility tipografiche comuni**: la terna `font-size/letter-spacing/line-height`
   "piccolo" è riscritta in bottega, carta, colophon, legatoria, banco
   (5-11 volte per file), mentre `.imp-piccolo` e `.imp-nota` di `base.css`
   non sono **mai** usate nel JSX. Usare le utility nei componenti e togliere le
   ripetizioni: −0,3/0,4 KB gz. Proprietari: **scaffold-engineer**
   (`base.css`) + section-builder di bottega, carta, colophon, legatoria.
3. **Grana `feTurbulence`**: 8 data URI quasi identici (~420 caratteri, cambia
   solo la `feColorMatrix` per carta) in `tokens.css`: una sola grana neutra
   colorata con `background-blend-mode`/`mix-blend-mode` o con opacità per carta.
   −~0,3 KB gz. Proprietario **art-director** (`tokens.css`).
4. **Codice morto**: `.imp-display`, `.imp-nota`, `.imp-piccolo` (base.css),
   `.imp-assi` (solo commento in relief-fallback), `.imp-giustezza(--stretta)`
   (layout.css) non usate in nessun componente. −~0,15 KB gz. Proprietari
   **scaffold-engineer** / **art-director**.
5. Se non basta: il tech-architect porta il budget CSS a **22 KB gz** (il
   concept ha 9 sezioni con layout mobile/desktop distinti e accessibilità
   `forced-colors`/`prefers-contrast` completa: il numero è onesto).

---

## 4. Problemi, gravità, correzione, proprietario

### P1 · ALTA · Scrittura a 30 Hz di `--imp-luce-x/y` su `.imp-root` (fallback e attesa GL)

- **Misura**: con `data-gl` `off` o `pending` e l'hero in vista,
  `interaction/light.ts` (`scriviVariabili`, riga ~426) scrive
  `--imp-luce-x/y` sullo `style` di `.imp-root` 36 volte al secondo
  (MutationObserver: 72 scritture in 2 s). **Ogni** scrittura di una
  proprietà custom su `.imp-root` ricalcola lo stile di tutti gli 815
  elementi: **63 ms** a 1× (anche una variabile inutilizzata: 69 ms),
  **311 ms** con CPU 4×. La stessa scrittura su `#inizio` costa **0,98 ms**.
- **Effetti**: desktop 1× `?gl=0`: 62 long task in 7 s (4,5 s totali, max
  168 ms), 47 dopo i primi 3 s, con la pagina ferma. Mobile 4× hero fermo:
  RecalcStyle **3,65 s su 4 s**. Scroll continuo mobile 4×: ~6 fps, RecalcStyle
  8,0 s su 8,6 s, lo scroll avanza di 365 px. TBT mobile Lighthouse 233 ms. Il
  JS del ticker e di lenis è sotto 16 ms (p95 5,1 ms): è lo stile, non lo script.
  Riguarda chi resta sul fallback (niente WebGL, `saveData`, qualità spenta,
  `?gl=0`) e **tutti** nella fase `pending` prima che il GL si accenda (quindi
  pesa sul TBT reale). Con GL acceso la funzione esce prima (`gl === 'on'`).
- **Correzione**: non scrivere mai variabili per-frame su `.imp-root`. Scrivere
  `--imp-luce-x/y` solo sui consumatori: i fantasmi `.imp-relief` registrati
  (il registro li conosce, sono ~20) o al massimo sulla sezione in vista
  (`#inizio`, dove gira l'arco); il valore di default resta in `tokens.css`
  sulla radice. In più, nel fallback con puntatore grossolano fermare l'arco
  automatico (luce a riposo) o scendere a 10 Hz. Resa attesa: da 63 ms a ~1 ms
  per scrittura.
- **Proprietario**: **interaction-designer** (`interaction/light.ts`).
  Verifica dell'**art-director** su `relief-fallback.css` (le regole leggono la
  variabile ereditata dall'elemento: funziona uguale se la variabile sta sul
  fantasma o sulla sezione).
- **Nota di fondo** (bassa, art-director + tech-architect §5): il ricalcolo
  della radice è così caro anche per ~172 proprietà custom dichiarate su
  `.imp-root` più molte `calc()`/`color-mix()` dipendenti, 21 `:has()` e 11
  `container-type`. Regola da aggiungere a §5/§12: "variabili animate solo sul
  nodo più basso possibile".

### P2 · ALTA · INP del Banco: layout forzati a ogni tasto

- **Misura**: 23 tasti nel primo campo del Banco (desktop 1×, `?gl=0`, hero
  fuori vista): **390 layout e 399 ricalcoli di stile** (~17 layout forzati per
  tasto), RecalcStyle 522 ms + Layout 292 ms contro 81 ms di script; ~74 ms di
  task per tasto. Event Timing: `keypress` 160 ms (50 ms di processing),
  `input` 152 ms (32 ms). Mobile 4×: max 256 ms.
- **Causa**: `adattaRighe` in `sections/Banco/Prova.tsx` (righe 105-128,
  chiamata alle righe 272/278) alterna per ogni riga scrittura di
  `--imp-banco-wdth` e lettura di `clientWidth/scrollWidth` (fino a 3
  scritture e 3 letture per riga): layout thrashing, e il ricalcolo è caro per
  il motivo di P1.
- **Correzione**: separare le fasi. (a) Scrivere `WDTH_MAX` su tutte le righe,
  (b) leggere tutte le misure, (c) scrivere tutti i `wdth` calcolati, (d) una
  sola lettura di verifica per tutte. Meglio ancora farlo nel ticker (`read`
  poi `write`) al frame dopo il tasto, non nell'handler/layout effect, come
  vuole §8 ("la maschera si ridisegna in rAF, non nell'handler"). In
  alternativa stimare la larghezza con `CanvasRenderingContext2D.measureText`
  sul font variabile. Obiettivo: ≤ 2 layout per tasto, INP < 100 ms.
- **Proprietario**: **section-builder-banco** (`Prova.tsx`).

### P3 · MEDIA · Chunk `Concept10` 62,55 KB gz (budget 60)

Correzioni e proprietari in §2 (lenis dinamico: **scaffold-engineer**;
marchio unico: **section-builder-hero** + **section-builder-colophon**).

### P4 · MEDIA · CSS 21,34 KB gz (budget 20)

Correzioni e proprietari in §3 (banco.css: **section-builder-banco**; utility:
**scaffold-engineer** + section-builder; grana: **art-director**; se non
basta, revisione budget: **tech-architect**).

### P5 · MEDIA (da verificare su device) · Avvio del GL in un solo task lungo

- **Misura**: con GL, 5-6 long task all'avvio, il maggiore **~950 ms** (mobile
  896 ms): compilazione dei programmi e prime cotture sul main thread. In
  SwiftShader il numero è gonfiato, ma la forma (un task unico) resta anche su
  GPU vera: su un telefono medio la compilazione di `relief.frag` può valere
  100-300 ms, e cade nella finestra di interazione.
- **Correzione**: `await renderer.compileAsync(scene, camera)` (three r160 lo
  ha, usa `KHR_parallel_shader_compile` quando c'è) prima del primo render, e
  le cotture d'avvio (oggi 6 per frame prima della comparsa) a 2-3 per frame.
- **Proprietario**: **shader-engineer** (`webgl/ImprontaGL.ts`). Misura vera:
  iPhone 12 / Pixel 6a (cross-browser-tester o a mano).

### P6 · BASSA · Atlante HalfFloat 32 MB su desktop (budget 16 MB)

Scelta dichiarata dallo shader-engineer (§9 del suo doc); occupazione misurata
10-15%. Proposta: HalfFloat solo con `navigator.deviceMemory >= 8` (o se
assente), altrimenti 8 bit; oppure il **tech-architect** aggiorna §8 a
"16 MB mobile / 32 MB desktop". Proprietari **shader-engineer**
(`webgl/atlas.ts`) / **tech-architect**.

### P7 · BASSA · Hanken Grotesk dichiarato in tre `@font-face` con lo stesso file

L'URL `Hanken+Grotesk:wght@400;500;600` produce tre `@font-face` (400, 500,
600) che puntano allo **stesso** woff2 variabile: nel test il file è stato
chiesto 3 volte (con la cache HTTP reale di gstatic probabilmente una sola
rete, ma tre decodifiche). Usare `Hanken+Grotesk:wght@400..600` → un solo
`@font-face` per subset. Proprietario **art-director** (`styles/tokens.ts`,
`FONT_URL`).

### P8 · BASSA · Coda d'inerzia della luce: render GL fino a 0,02°

Fuori dall'hero, a pagina ferma, la luce torna a 135° con inerzia 0,08 e soglia
di quiete `QUIETE_GRADI = 0.02`: ogni passo cambia l'azimut e forza un frame GL
(osservato 135,4° → 135,1° con un frame ogni ~1,2 s in SwiftShader; a 60 fps
reali ~1,5 s e poi si ferma). Nessuna cottura, render on demand corretto.
Proposta: soglia 0,1-0,2° (invisibile) o scatto al riposo quando l'hero non è
in vista. Proprietario **interaction-designer** (`interaction/light.ts`).

### P9 · INFO · Numeri GL di Lighthouse

TBT 4,8 s / LCP 3,26 s mobile con GL sono SwiftShader (render delay dell'LCP
1,08 s, long task del main thread in attesa della GPU software): non vanno
letti come regressione. L'LCP resta comunque il testo dell'hero, mai il canvas.
Servono corse Lighthouse/WebPageTest su device reali prima della consegna.

---

## 5. Richieste ad altri agent

| A chi | File | Cosa | Gravità |
|---|---|---|---|
| interaction-designer | `interaction/light.ts` | P1: `--imp-luce-x/y` fuori da `.imp-root` (sui fantasmi o sulla sezione), arco fermo o 10 Hz nel fallback touch; P8: soglia di quiete 0,1-0,2° | alta / bassa |
| section-builder-banco | `sections/Banco/Prova.tsx`, `banco.css` | P2: `adattaRighe` a fasi separate nel ticker; P4: −0,6 KB gz da banco.css | alta / media |
| scaffold-engineer | `core/lenis.ts`, `styles/base.css`, (`Impronta.tsx`) | P3: `import('lenis')` dinamico; utility tipografiche e codice morto; (Banco lazy, facoltativo) | media |
| section-builder-hero, section-builder-colophon | `Testata.tsx`, `Colophon.tsx` | P3: un solo marchio (raw → data URI), niente `?url` | media |
| section-builder bottega, carta, colophon, legatoria | loro `.css` | P4: usare `.imp-piccolo`/`.imp-nota` invece di ridichiarare la terna tipografica | media |
| art-director | `styles/tokens.css`, `styles/tokens.ts`, `relief-fallback.css` | P4: grana unica; P7: `wght@400..600`; verifica P1 | media / bassa |
| shader-engineer | `webgl/ImprontaGL.ts`, `webgl/atlas.ts` | P5: `compileAsync` e cotture d'avvio a 2-3/frame; P6: HalfFloat condizionato | media / bassa |
| tech-architect | `docs/tech-architect.md` §5, §8 | regola "variabili animate sul nodo più basso"; eventuale budget CSS 22 KB e atlante 32 MB desktop | bassa |

Dopo le correzioni di P1-P4 vanno ripetute: build (pesi), Lighthouse `?gl=0`
mobile (TBT), `misura.mjs mobile` (fps e RecalcStyle in scroll 4×) e
`misura.mjs inp` (INP del Banco).

---

## Giro 3 · rimisura dopo le correzioni (26/09/2026)

Build nuovo (HEAD `eeb091a`), `npx vite preview --port 8203 --strictPort`
(chiusa a fine prova). Stessi strumenti e stessi limiti del giro 1 (font serviti
via `page.route` con 1200 ms di ritardo; Lighthouse senza font; SwiftShader non
rappresentativo). Script: `misura3.mjs`, `cls3.mjs`, `idle*.mjs`, JSON `g3-*.json`
nella scratchpad `perf/`.

**Decisione dell'orchestratore, annotata**: budget CSS portato da 20 a
**24 KB gz** (3 KB non cambiano la velocità percepita, i tagli rischiano
regressioni). Il tech-architect aggiorni §8.

### Pesi gz (Vite) prima / dopo

| Voce | Budget | Giro 1 | Giro 3 | Esito |
|---|---|---|---|---|
| Chunk `Concept10` | ≤ 60 | 62,55 | **60,52** | **fuori di 0,52** |
| `lenis` (chunk dinamico nuovo) | — | nel Concept10 | 5,64 | fuori dal percorso critico |
| JS iniziale totale (index 1,27 + react 52,32 + Concept10) | ≤ 130 | 116,1 | **114,1** | ok |
| WebGL lazy (`index` + `three`) | ≤ 160 | 135,1 | **137,4** (24,55 + 112,82) | ok |
| CSS | ≤ **24** (era 20) | 21,34 | **23,18** | ok col budget nuovo (fuori col vecchio) |

Il chunk `Concept10` è sceso di 2 KB con lenis dinamico, ma nel frattempo le
sezioni sono cresciute: mancano 0,52 KB. Resta il taglio P3.2 (un solo
marchio, −~0,5 KB gz: section-builder-hero + section-builder-colophon), che da
solo lo porta al limite.

### Lighthouse `?gl=0` prima / dopo

| | Giro 1 mobile | Giro 3 mobile | Giro 1 desktop | Giro 3 desktop |
|---|---|---|---|---|
| Performance | 94 | **95** | 98 | **100** |
| FCP | 1,49 s | 1,75 s | 0,42 s | 0,47 s |
| LCP (budget 2,5 / 1,5) | 2,20 s | **2,43 s** (ok, margine 70 ms) | 0,55 s | **0,60 s** |
| TBT (budget 150 mobile) | 233 ms | **166 ms** (fuori di 16) | 27 ms | **13 ms** |
| CLS | 0 | 0 | 0 | 0 |
| TTI | 4,45 s | **2,46 s** | 3,28 s | **0,60 s** |
| styleLayout nel trace | 4977 ms | **1563 ms** | 6905 ms | **543 ms** |

Elemento LCP: `div.imp-hero__riga` (testo dell'hero), mai il canvas. Il TBT
mobile residuo è quasi tutto un task di React al montaggio (332 ms simulati):
il P1 non c'entra più. La varianza di Lighthouse su TBT a questa scala è
±30 ms: è al limite, non un problema strutturale.

### Scroll continuo 390×844, CPU 4×, `?gl=0` (lenis, 8 s di rotella)

| | Giro 1 | Giro 3 |
|---|---|---|
| Hero fermo 4 s: RecalcStyle | 3650 ms | **0 ms** (nessun rAF: su touch niente arco) |
| JS rAF (ticker + lenis) p50 / p95 / max | 0,4 / 5,1 / 30,2 ms | 0,7 / 4,7 / 74,6 ms (1 frame su 431 > 16) |
| FPS stimati | ~6 | **~50** (intervallo p50 16,7 ms, p95 42,6) |
| Scroll percorso | 365 px | **2398 px** |
| RecalcStyle / Task | 8046 / 8788 ms | **661 / 3895 ms** |
| Long task | 36 (max 395 ms) | **6** (max 389 ms) |

Il JS del ticker e di lenis resta sotto 16 ms al p95. I 6 task lunghi arrivano
all'ingresso di nuove sezioni (montaggio, primo layout), non a regime.

Desktop 1440 `?gl=0` con hero in vista (arco della luce acceso): 600 rAF in
10 s, **RecalcStyle 564 ms per 572 ricalcoli (~1 ms l'uno, era 63 ms)**, task
totale 12%. **P1 risolto.**

### INP del Banco (23 tasti + un radio, Event Timing)

| | Giro 1 | Giro 3 | Budget |
|---|---|---|---|
| Desktop 1× p50 / p95 / max | 48 / 120 / 160 ms | **40 / 80 / 88 ms** | ok |
| Mobile 390 CPU 4× p95 / max | 256 / 256 ms | **136 / 160 ms** | max fuori di 10 ms |

Il caso peggiore su mobile è `keypress` con 63 ms di processing (render React
del Banco a ogni tasto). **P2 risolto su desktop, quasi su mobile 4×.**
Suggerimento (bassa, section-builder-banco): `useDeferredValue` o
`startTransition` sul testo passato a `Prova`, così la prova si ridisegna dopo
il tasto e il campo risponde subito.

### Render a pagina ferma

| | Giro 1 | Giro 3 |
|---|---|---|
| `?gl=0`, scroll 2700, 10 s | 0 rAF | **0 rAF**, task 1 ms |
| GL (SwiftShader, `?gl=1`), scroll 2700, 10 s | frame solo dalla coda della luce | idem: 11 frame, nessuna cottura, azimut 135,4 → 135,1 |

La coda di inerzia della luce (P8) resta visibile solo in SwiftShader: il dt è
limitato a 50 ms e un frame costa ~1 s, quindi la convergenza dura decine di
secondi. A 60 fps reali, con `QUIETE_GRADI = 0.15`, finisce in meno di 1 s.
Nessuna azione.

### Regressione nuova · ALTA · CLS all'arrivo dei font nell'hero

- **Misura** (font in ritardo di 1,2 s): CLS **0,060 desktop, 0,061 mobile**
  (giro 1: 0,0043 / 0,0018; budget 0,02). Lighthouse dà 0 solo perché lì i font
  non arrivano mai.
- **Cosa si sposta**: al cambio da "Impronta Anybody Ripiego" ad Anybody,
  `imp-hero__riga--1` ("impronta") passa da 1354 a 1181 px di larghezza; subito
  dopo (~5 ms, nuova misura della composizione) `imp-hero__riga--2` passa da
  228 a 196 px di altezza (mobile 97 → 87), e `imp-hero__testo`,
  `imp-hero__luce` e la sezione `imp-perchi` salgono di 26-52 px.
- **Causa**: la nuova composizione a due righe dell'hero dimensiona le righe
  sulla misura del testo, e il fallback metrico non può imitare l'asse `wdth`
  di Anybody. Quindi la scatola cambia al cambio font.
- **Correzione**: dare alle righe dell'hero un'altezza che non dipende dal font
  (`block-size` in `em`/`cqi` calcolata dai token, `line-height: 1`,
  `overflow: clip` sul contenuto a rilievo), in modo che il cambio font cambi
  solo i glifi e non la scatola. In più, rimisurare la composizione solo sulla
  larghezza, senza toccare l'altezza. In alternativa (peggiore) tarare
  `size-adjust` del ripiego sulla larghezza di "impronta" al `wdth` usato.
- **Proprietario**: **section-builder-hero** (`Hero.tsx`, `hero.css`), con
  l'**art-director** per il ripiego in `tokens.css`.

### Stato dei problemi

| # | Giro 1 | Giro 3 |
|---|---|---|
| P1 luce su `.imp-root` | alta | **risolto** (1 ms per ricalcolo, 50 fps in scroll 4×) |
| P2 INP Banco | alta | **risolto desktop**, mobile 4× max 160 ms (bassa) |
| P3 chunk Concept10 | media | **aperto, +0,52 KB** (P3.2 marchio unico) |
| P4 CSS | media | **chiuso per decisione**: budget 24 KB, misurato 23,18 |
| P5/P6 avvio GL, atlante | media / bassa | dichiarati corretti; non misurabili in SwiftShader, da device |
| P8 coda della luce | bassa | ok (soglia 0,15°) |
| CLS hero ai font | — | **nuovo, alto** (0,06 contro 0,02) |
| TBT mobile | fuori (233) | 166 ms, al limite (bassa) |
