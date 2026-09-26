# Tech architect · Concept 12 · SOTTOPELLE

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza esclusivi, stato condiviso, contratti tra moduli, budget,
caricamento, fallback e comandi.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`,
`docs/matrice-concept-11-20.md` (riga 12, paragrafo 12, verifica incrociata),
`concepts/12-sottopelle/docs/creative-director.md` (tutto). Come riferimento di
formato e architettura (mai di design): `concepts/10-torchio/docs/tech-architect.md`,
`scaffold-engineer.md`, e dal codice del pilota `package.json`, `vite.config.ts`,
`src/components/ConceptBackButton.tsx`, `src/lib/analytics.ts`, `core/*`, `state/*`.

Verifiche fatte il 2026-09-26:
- Node 22.22.2; registry npm raggiungibile. Le versioni in §1 sono quelle del
  pilota, già installate e provate lì (le "latest" di oggi sono React 19,
  Vite 8, TS 7: **non** si usano, il sito è su React 18 / Vite 5 / TS 5.6).
- Font Google misurati (woff2, sottoinsieme latin): **Grenze Gotisch
  variabile 100-900: 42,3 KB**; **Schibsted Grotesk è variabile anche lui**
  (un solo file serve 400, 500 e 700): **46,8 KB**. Totale 89,1 KB.
- `ConceptBackButton`: stesso componente misurato dal tech-architect del 13
  (Chromium, font mono di ripiego): 198 × 35 px a (14, 14) su desktop;
  194 × 33 px a sinistra 12, in basso 14 sotto i 640 px. Vedi §3.3: su
  mobile **urta la barra della parete** come la descrive il CD.

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/12-sottopelle/`, struttura identica al pilota: tutto il concept in
   `src/pages/concepts/sottopelle/`, `src/pages/Concept12.tsx` sottile.
   Porting = copiare la cartella `sottopelle/` e `Concept12.tsx`.
2. **WebGL "crudo" (WebGL2, ripiego WebGL1), senza three.** Differenza
   consapevole dal CD §4.4 (che proponeva three 0.160 e lasciava la scelta a
   me). La scena è: un quad, un programma, fino a ~50 disegni dello stesso
   quad con uniform diverse, texture caricate a mano. three porterebbe
   ~113 KB gz (misurati nel pilota) per usarne l'1%; il WebGL crudo per questa
   scena sono ~6-9 KB gz. Qui il chunk GL **è** il contenuto (senza, le foto
   non sbocciano), quindi ogni KB sul 4G è tempo in cui la parete resta nera.
   In più: controllo diretto su upload delle texture (ImageBitmap, un upload
   per frame), perdita di contesto, niente mipmap (la scala è fissa). Il porting
   non aggiunge nulla (three resta nel sito, noi non lo importiamo).
3. **Niente lenis, niente GSAP, niente R3F/drei.** Il sito non scorre (finestra
   fissa sulla parete, CD §4.2); l'elenco e il pannello "Grande come?" scorrono
   in nativo. Movimenti: sei, tutti gestiti dal ticker (§2.2).
4. **Un solo ciclo rAF** (`core/ticker.ts`, API del pilota senza lenis): fasi
   `read → update → write → render`. In `write` si scrive **una sola**
   trasformazione sul piano DOM della parete; in `render` il GL disegna con lo
   **stesso** valore di spostamento dello stesso frame: DOM e canvas non si
   scollano mai di un pixel.
5. **La parete è matematica, non layout.** Posizioni, periodo toroidale,
   rimescolamento e visibilità sono funzioni pure (`parete/*`) che non leggono
   mai il DOM. DOM e GL consumano la stessa lista di "istanze visibili".
6. **Store lento con `useSyncExternalStore`** (vista, filtri, dialoghi,
   prenotazione, taratura, stato GL) + **valori caldi fuori da React**
   (spostamento, velocità, puntatore, sboccio, increspature).
7. **CSS in file `.css` per sezione, prefisso `stp-`**, tutto sotto
   `.stp-root`. Niente Tailwind, niente CSS modules, niente `backdrop-filter`.
8. **Il fallback senza WebGL è un modo di prima classe**, non un ripiego: le
   stesse tessere DOM prendono un `<img>` e lo sboccio con `mask-image`
   (CD §4.1). Si decide una volta per visita e non si torna indietro.
9. **Il pannello "Grande come?" è un chunk lazy** (prefetch in idle e su
   hover/focus dei bottoni rossi): la prenotazione non pesa sulla prima
   pittura.

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json` standalone)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` |

Nient'altro a runtime.

### 1.2 Dev (identiche al pilota, meno `@types/three`)

| Pacchetto | Versione |
|---|---|
| `vite` | `5.4.21` |
| `@vitejs/plugin-react` | `4.7.0` |
| `typescript` | `5.6.3` |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` |
| `@types/node` | `22.20.4` (solo `vite.config.ts`) |
| `eslint`, `@eslint/js` | `9.39.5` |
| `typescript-eslint` | `8.70.1` |
| `eslint-plugin-react-hooks` | `5.2.0` |
| `eslint-plugin-react-refresh` | `0.4.26` |
| `globals` | `15.15.0` |

**Non installati di proposito**: `three`, `@react-three/*`, `lenis`, `gsap`,
Tailwind, librerie di stato, `@fontsource/*`, `@phosphor-icons/*` (le icone
arrivano come path SVG copiati dal vector-artist, licenza MIT annotata),
`vite-plugin-glsl` (gli shader si importano con `?raw`), librerie di date (le
date della consulenza si calcolano con `Date` e `Intl.DateTimeFormat('it-IT')`).

### 1.3 Font

Google Fonts, `<link>` iniettato al mount + `preconnect` (pattern del pilota):

```
https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@100..900&family=Schibsted+Grotesk:wght@400..700&display=swap
```

- L'URL esatto vive in `styles/tokens.ts` (`FONT_CSS_URL`, art-director), lo
  inietta `core/fonts.ts` (scaffold).
- Schibsted come intervallo `400..700` (un file, 46,8 KB) invece di tre pesi
  statici: stesso file, URL più corto.
- Niente corsivi. `display=swap`; l'art-director definisce in `tokens.css` due
  `@font-face` di ripiego locali con `size-adjust` / `ascent-override` tarati
  (gotico su un serif di sistema, grotesk su Arial/Helvetica) per tenere a zero
  il salto nelle isole.
- Lo sboccio della parola *Sottopelle* (asse peso 100 → 600) parte solo dopo
  `fontsReady(['600 1em "Grenze Gotisch"'])`, attesa massima 1200 ms; se il font
  non c'è entro allora, la parola resta ferma al peso 600 (motion-designer).

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json`.
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `jsx: react-jsx`, `moduleResolution: bundler`,
  `types: ["vite/client"]`, target `ES2020`, `lib` con `DOM` e
  `DOM.Iterable`.
- Dev server: **porta 9120** con `strictPort: true` (range del concept
  9120-9129, §11.2). Preview: **9121**. Mai 8080 (è del sito e del pilota).
- Build target `es2020`. `manualChunks`: `react` (react, react-dom, scheduler,
  router) in un chunk suo; `webgl/` e `sections/GrandeCome/` escono da soli come
  chunk dinamici.

---

## 2. Scelte motivate

### 2.1 WebGL crudo invece di three

Cosa deve fare la GPU (CD §4.3-4.4): per ogni tessera visibile, un
rettangolo con la foto, lo sboccio (campo di distanza + rumore frattale),
l'increspatura (spostamento radiale), l'arretramento (scuro + desaturato).
Fondo = colore di pulizia del canvas (nero `#151312`). Nessuna luce, nessuna
camera prospettica, nessun grafo, nessun loader di modelli.

| Serve | Con WebGL crudo |
|---|---|
| Un quad | un buffer statico di 4 vertici, `TRIANGLE_STRIP` |
| Un materiale | un programma GLSL ES 1.00 (compila su WebGL1 e WebGL2) |
| Uniform per tessera | ~10 `uniform*` per disegno; ≤ 56 disegni per frame (§8) |
| Texture | `texImage2D` da `ImageBitmap` (o `HTMLImageElement` decodificato), `LINEAR`, niente mipmap, `CLAMP_TO_EDGE` |
| Resize, DPR | `canvas.width/height` + `viewport` |
| Perdita di contesto | `webglcontextlost` / `restored` sul canvas |

Il CD chiede "un solo ShaderMaterial con uniform per tessera": è esattamente
un programma con uniform, senza il livello three sopra. Se in ondata 3 lo
shader-engineer trovasse un motivo concreto per three (non ne vedo), lo
scrive nel doc e l'orchestratore decide: three 0.160.1 è già nel sito.

### 2.2 Niente lenis, niente GSAP

Gli unici movimenti ammessi (CD §4.10): deriva iniziale, inerzia della parete,
sboccio, increspatura, FLIP della scheda, posarsi della macchia, arretramento
dei filtri.

| Movimento | Dove vive | Come |
|---|---|---|
| Deriva iniziale (40 px, una volta) | `motion/camera.ts` | scivolata con easing nel ticker |
| Trascinamento 1:1 + inerzia | `interaction/useTrascina.ts` → `motion/camera.ts` | delta del puntatore scritti su `runtime.pan`; al rilascio velocità con attrito integrato sul `dt` del ticker |
| Scivolata da tastiera / fuoco | `motion/camera.ts` | `camera.scivola()` con easing, 280 ms |
| Sboccio | `motion/sboccio.ts` | avanzamento 0 → 1 per foto nel ticker; GL lo legge come uniform, il fallback come `--stp-sboccio` |
| Increspatura | `motion/increspature.ts` | tempo di partenza + punto per istanza; lo shader fa il resto |
| Arretramento filtri | `motion/arretramento.ts` | lerp per foto 0 → 1 nel ticker |
| FLIP scheda, posarsi macchia, posto scelto | CSS (`transition` / `@keyframes`) con curve di `motion/easing.ts` | niente JS di animazione |

Nessuno di questi richiede timeline o ScrollTrigger. Il sito non ha GSAP.

### 2.3 Un solo ciclo rAF

`core/ticker.ts` è l'unico `requestAnimationFrame` del concept. Ordine fisso:

1. **read**: niente layout durante il pan. Qui leggono solo i moduli che
   devono (es. `visualViewport` su mobile, già in `runtime.viewport`).
2. **update**: `camera` (pan, inerzia, scivolate) → `visibili` (istanze nella
   finestra, eventi entra/esce) → `sboccio`, `increspature`, `arretramento`.
3. **write**: `transform: translate3d(...)` del piano DOM (una scrittura);
   variabili CSS dei fogli `data-stpvar` (solo quando il valore cambia, e
   solo in fallback o per l'ingresso).
4. **render**: il GL disegna solo se `runtime.dirty`.

Il ticker dorme quando niente si muove (nessuna fn ha restituito `true`,
nessun `wake()`), si ferma su `visibilitychange` → nascosto, e con la vista
elenco o un dialogo a tutto schermo aperto la parete non si ridisegna.
**Nessun altro `requestAnimationFrame`, `setInterval` o listener `scroll`
per animare**, in nessun file.

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo app standalone, non si porta; **[P]** si porta. Tra
parentesi il proprietario (vedi §4). Percorsi dentro `sottopelle/` relativi a
`src/pages/concepts/sottopelle/`.

```
concepts/12-sottopelle/
├─ DESIGN.md                                  (art-director)  resta nel repo claude250
├─ docs/                                      [S] un .md per agent
├─ qa/                                        [S] screenshot di QA (ignorati da git)
├─ package.json  package-lock.json            [S] (scaffold)
├─ vite.config.ts  tsconfig.json  tsconfig.app.json  tsconfig.node.json  [S] (scaffold)
├─ eslint.config.js  .gitignore               [S] (scaffold)
├─ index.html                                 [S] (scaffold) lang="it", preconnect font, fondo nero inline su html/body
├─ public/favicon.svg                         [S] (vector-artist)
└─ src/
   ├─ main.tsx  App.tsx  vite-env.d.ts        [S] (scaffold) App: BrowserRouter, /concept-12 lazy, / e * → Navigate
   ├─ lib/analytics.ts                        [S] (scaffold) copia fedele del tipo TrackEvent e della firma del sito
   ├─ components/ConceptBackButton.tsx        [S] (scaffold) copia fedele (location.href = "/")
   └─ pages/
      ├─ Concept12.tsx                        [P] (scaffold) import Sottopelle from './concepts/sottopelle'
      └─ concepts/sottopelle/                 [P] TUTTO il concept
         ├─ index.ts                          (scaffold) export { default } from './Sottopelle'
         ├─ Sottopelle.tsx                    (scaffold) radice .stp-root: font, ticker, store, GL, strati, dialoghi
         │
         ├─ core/                             (scaffold)
         │  ├─ ticker.ts                      unico rAF, fasi read/update/write/render
         │  ├─ capabilities.ts                detectWebGL(), prefersReducedMotion(), ascoltaReducedMotion(), isCoarsePointer(), saveData()
         │  ├─ fonts.ts                       injectFonts(), fontsReady()
         │  ├─ glLoader.ts                    decidiGL(), caricaGL() → import('../webgl')
         │  ├─ viewport.ts                    osservaViewport(): runtime.viewport + runtime.modulo
         │  ├─ params.ts                      parametri di prova nell'URL (§11.3)
         │  ├─ links.ts                       LAB_URL, CICERILAB_URL, MAPS_URL, TELEFONO_URL, EMAIL_URL
         │  ├─ storia.ts                      una voce di history per dialogo aperto (tasto indietro = chiudi)
         │  ├─ inert.ts                       impostaInert(el, bool) (React 18 non tipizza inert)
         │  └─ useDialogo.ts                  focus intrappolato, Esc, ritorno del fuoco, inert sul resto, storia
         │
         ├─ state/                            (scaffold)
         │  ├─ store.ts                       store lento + useSottopelle(selector) + azioni (§6.1)
         │  ├─ runtime.ts                     valori caldi (§6.2)
         │  └─ persist.ts                     local/sessionStorage con try/catch (§6.3)
         │
         ├─ parete/                           (scaffold) il motore della superficie, puro, senza DOM
         │  ├─ mappa.ts                       il periodo 16 × 12: slot delle tessere (forma) e delle 7 isole, dall'ux-architect
         │  ├─ layout.ts                      moduli → px, scarti fissi, periodo toroidale, rimescolamento per seme
         │  ├─ visibili.ts                    istanze nella finestra (+1 modulo), eventi entra/esce, periodo corrente
         │  └─ useVisibili.ts                 hook con useSyncExternalStore sulla lista (cambia solo quando cambia l'insieme)
         │
         ├─ motion/                           (motion-designer)
         │  ├─ easing.ts                      curve (funzioni + stringhe cubic-bezier)
         │  ├─ tempi.ts                       durate, soglie, attrito, velocità massima, anelli d'apertura
         │  ├─ camera.ts                      pan, inerzia, scivolate, deriva, vaiA()
         │  ├─ sboccio.ts                     avanzamento per foto, memoria "posate", fogli data-stpvar in fallback
         │  ├─ increspature.ts                increspatura per istanza (punto, t0), limite 1 ogni 600 ms
         │  ├─ arretramento.ts                livello per foto dai filtri, lerp
         │  └─ motion.css                     variabili --stp-ease-*, --stp-dur-*, keyframes della macchia e del posto
         │
         ├─ interaction/                      (interaction-designer)
         │  ├─ useTrascina.ts                 pointer events sulla regione: trascinamento, soglia tocco 6 px, rilascio
         │  ├─ useRotella.ts                  wheel/trackpad → pan (deltaX/deltaY), mai zoom, ctrl+rotella lasciata al browser
         │  ├─ useTastieraParete.ts           frecce, Maiusc+frecce, Invio; fuoco su tessera → camera porta dentro
         │  ├─ puntatore.ts                   hover → increspatura (hit test matematico, niente mouseenter per tessera)
         │  ├─ useSwipe.ts                    swipe orizzontale nella scheda (mobile)
         │  └─ interaction.css                cursori di sistema grab/grabbing, :hover, :focus-visible, anello osso
         │
         ├─ webgl/
         │  ├─ shaders/tessera.vert.glsl      (webgl-artist)
         │  ├─ shaders/tessera.frag.glsl      (webgl-artist) sboccio + filamenti + increspatura + arretramento
         │  ├─ programma.ts                   (webgl-artist) compila/linka, mappa delle uniform (nomi e tipi), UNIFORM
         │  ├─ presets.ts                     (webgl-artist) parametri dell'inchiostro (scale del rumore, fronte, filamenti)
         │  ├─ PareteGL.ts                    (shader-engineer) contesto, resize, DPR, perdita contesto, disegno
         │  ├─ textures.ts                    (shader-engineer) caricamento per vicinanza, 1 upload per frame, LRU a byte
         │  ├─ quality.ts                     (shader-engineer) DPR adattivo, passaggio al fallback se troppo lento
         │  ├─ PareteCanvas.tsx               (shader-engineer) componente React che monta PareteGL
         │  └─ index.ts                       (shader-engineer; stub dello scaffold) export default PareteCanvas
         │
         ├─ content/                          (copywriter)
         │  ├─ testi.ts                       tutti i testi, microcopy, aria-label, etichettaLavoro(), META
         │  ├─ prezzi.ts                      tariffe di esempio, fattori della stima (stile, zona), minimo, caparra
         │  └─ orari.ts                       giorni e orari di esempio dello studio e delle consulenze
         │
         ├─ assets/
         │  ├─ foto/*.webp + index.ts         (photo-editor) catalogo tipizzato dei lavori (§6.4)
         │  └─ svg/                           (vector-artist)
         │     ├─ icone.ts                    path Phosphor (MIT) usati: elenco, parete, filtri, chiudi, frecce, casa, esterno, calendario, avviso
         │     ├─ Icona.tsx                   <Icona nome=… /> aria-hidden, currentColor
         │     └─ oggetti.ts                  moneta 1 €, carta ISO, telefono medio, cartolina aperta: SVG con viewBox in MILLIMETRI
         │
         ├─ styles/
         │  ├─ tokens.css                     (art-director) variabili --stp-*, @font-face di ripiego
         │  ├─ tokens.ts                      (art-director) COLORI (hex e vec3 per il GL), FONT_CSS_URL, MODULO per fascia, Z
         │  ├─ componenti.css                 (art-director) .stp-azione (bottone rosso), .stp-comando, .stp-campo, .stp-isola
         │  ├─ fallback.css                   (art-director) resa DOM delle tessere senza GL: mask-image radiale da --stp-sboccio
         │  ├─ base.css                       (scaffold) radice, reset scoped con :where(), .stp-sr, .stp-salto
         │  └─ layout.css                     (scaffold) strati, canvas, piano della parete, zone riservate, z-index
         │
         └─ sections/                          (una cartella per section-builder, §3.1)
            ├─ Parete/     Parete.tsx  Tessera.tsx  PostoTuo.tsx  parete.css
            ├─ Ingresso/   Ingresso.tsx  ingresso.css
            ├─ Isole/      index.ts  Isola.tsx  SoloGuariti.tsx  ChiTatua.tsx  PrimaDiVenire.tsx
            │              QuantoCosta.tsx  LaCura.tsx  Dove.tsx  isole.css
            ├─ Comandi/    Testata.tsx  Barra.tsx  Filtri.tsx  FoglioFiltri.tsx  comandi.css
            ├─ Scheda/     Scheda.tsx  scheda.css
            ├─ Elenco/     Elenco.tsx  elenco.css
            ├─ GrandeCome/ index.ts  GrandeCome.tsx  Frase.tsx  Stima.tsx  Posto.tsx  Contatto.tsx
            │              Esito.tsx  stima.ts  agenda.ts  invio.ts  ics.ts  grande-come.css
            └─ Banco/      Banco.tsx  Taratura.tsx  Oggetto.tsx  Macchia.tsx  taratura.ts  banco.css
```

### 3.1 Sezioni da costruire (una per section-builder)

Nomi dagli strati e dalle isole del creative-director (§4.2, §4.5). Se
l'ux-architect li chiama in modo diverso nella sua sezione "Sezioni da
costruire", vale la corrispondenza sotto: **le cartelle restano queste**,
cambiano solo testi e id.

| Section-builder | Cartella | Cosa c'è (CD) | Probabile nome ux |
|---|---|---|---|
| `parete` | `sections/Parete` | Strato 0 in DOM: `region` con nome, piano che si sposta, tessere-bottone (vuote con GL, `<img>` con sboccio mascherato senza GL), montaggio delle isole alle loro posizioni, "posto vuoto" dopo il successo, montaggio degli input di `interaction/` | parete |
| `ingresso` | `sections/Ingresso` | isola all'origine: h1 *Sottopelle* con sboccio del peso e nuvola CSS dietro, frase, bottone rosso "Grande come?" | ingresso |
| `isole` | `sections/Isole` | le altre 6 isole (Solo guariti, Chi tatua con "Solo i suoi", Prima di venire, Quanto costa, La cura, Dove + colophon), ognuna usabile sulla parete e nell'elenco | isole / cartelli |
| `comandi` | `sections/Comandi` | Strato 1: testata (nome che porta all'ingresso, bottone rosso), barra della parete (Parete/Elenco, filtri stile/misura/artista, Torna all'ingresso), foglio dei filtri su mobile | comandi / barra |
| `scheda` | `sections/Scheda` | Strato 2: dialogo del lavoro, FLIP dalla tessera, dati, avanti/indietro, swipe, "Grande come?" precompilato | scheda del lavoro |
| `elenco` | `sections/Elenco` | vista elenco: pagina che scorre, isole come h2, lavori in 2 colonne (1 sotto 640), filtri veri, ritorno alla parete dal punto lasciato | vista elenco |
| `banco` | `sections/Banco` | taratura (carta ISO, − / +, Salta, rifai), oggetto di confronto in scala 1:1, macchia ridimensionabile (maniglia 44 px e campi cm), "esce dallo schermo", "Non lo so ancora" | banco di misura |
| `grande-come` | `sections/GrandeCome` | Strato 3: pannello, frase da completare, stima (aria-live), posto (10 giorni, orari da 20 min), contatto, 18 anni, invio simulato, tutti gli stati, successo, .ics | prenotazione |
| (`shader-engineer`) | `webgl/` | integrazione del canvas, texture, DPR, perdita contesto, qualità | (interazione firma) |

Sono **8** section-builder, nell'intervallo 5-9, più lo shader-engineer.

### 3.2 Regole di porting (valgono già ora)

- Dentro `sottopelle/` nessun import fuori da `sottopelle/` tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` e i pacchetti npm.
- **Nessun accesso a `window`, `document`, `navigator`, `localStorage`,
  `sessionStorage`, `matchMedia`, `devicePixelRatio`, `Date.now()` / `new
  Date()` a livello di modulo**: solo in effetti, handler o funzioni chiamate
  da effetti (il sito fa prerender). La data di oggi per le consulenze si
  calcola **all'apertura del pannello**.
- Foto e SVG da `assets/` con gli import nativi di Vite (`import url from
  './x.webp'`, `import.meta.glob(..., { query: '?url', import: 'default',
  eager: true })`, `?raw`), mai da `public/`.
- `Concept12.tsx`: `import Sottopelle from './concepts/sottopelle'; export
  default function Concept12() { return <Sottopelle /> }`.
- Allo smontaggio `Sottopelle.tsx` ferma il ticker, distrugge il GL, stacca i
  listener, ripristina `document.title`, la description, lo sfondo e
  l'`overflow` / `overscroll-behavior` di `html` e `body`, e toglie il `<link>`
  dei font solo se l'ha aggiunto lui.

### 3.3 Zone del ConceptBackButton (vincolo misurato)

Il bottone del sito è `position: fixed`, z-index 2147483000, e non si sposta.
Zone **senza nessun comando del concept** (misure con margine):

| Larghezza | Zona riservata | Conseguenza |
|---|---|---|
| > 640 px | in alto a sinistra, x 0-228, y 0-60 | libera per costruzione: il CD mette nome e bottone rosso in alto a **destra**, la barra in basso al centro. La parete ci passa sotto (è sfondo). |
| ≤ 640 px | in basso a sinistra, x 0-220, da `bottom: 0` a `bottom: 60px + env(safe-area-inset-bottom)` | **urta la barra** del CD §4.2 ("da 72 px a sinistra fino a 16 px a destra"): il bottone è largo ~194 px, non 56. |

Proposta tecnica (il disegno lo decide l'ux-architect): sotto i 640 px la
barra sta **sopra** la zona del bottone, a tutta larghezza (16 px ai lati),
con `bottom: calc(60px + env(safe-area-inset-bottom))`, altezza 52 px
(`Elenco`, `Filtri`, bottone rosso). Sotto di lei, a destra del bottone del
sito (x 220 → 359), resta uno spazio di 60 px di altezza: non ci va niente.
In alternativa, il bottone rosso a destra nella stessa riga del bottone del
sito (139 px disponibili a 375: "Grande come?" in Schibsted 15 px + 2 × 16 px
di padding ≈ 138 px, troppo stretto: **sconsigliato**). Lo scaffold espone in
`layout.css` `--stp-zona-back-w: 228px`, `--stp-zona-back-h: 60px`,
`--stp-barra-bottom` (mobile/desktop), così tutte le sezioni usano le stesse
misure.

---

## 4. File di competenza esclusiva

Ogni file ha **un solo proprietario**. Tutti leggono e importano tutto. Chi
ha bisogno di cambiare un file altrui lo scrive nel proprio doc, sezione
"Richieste ad altri agent"; l'orchestratore la gira.

**Stub**: lo scaffold crea stub con le **firme complete** (sezioni che rendono
il loro elemento vuoto, `webgl/index.ts` che esporta un componente che rende
`null`, `GrandeCome/index.ts` lazy) perché il build sia verde dal primo
minuto; alla fine dello scaffold la proprietà passa ai proprietari sotto e lo
scaffold non li tocca più.

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md`, `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts`, `styles/componenti.css`, `styles/fallback.css` | CSS delle sezioni, `base.css`, `layout.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/tempi.ts`, `motion/camera.ts`, `motion/sboccio.ts`, `motion/increspature.ts`, `motion/arretramento.ts`, `motion/motion.css` | ticker (usa l'API), shader, CSS delle sezioni |
| **webgl-artist** | `docs/webgl-artist.md`, `webgl/shaders/tessera.vert.glsl`, `webgl/shaders/tessera.frag.glsl`, `webgl/programma.ts`, `webgl/presets.ts` | i file dello shader-engineer in `webgl/`; tutto fuori da `webgl/` |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*` (file di §3) | niente cursore custom, niente preloader, niente bottoni magnetici (CD §4.9) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/prezzi.ts`, `content/orari.ts` | nessun testo scritto nei componenti |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/icone.ts`, `assets/svg/Icona.tsx`, `assets/svg/oggetti.ts`, `public/favicon.svg` | niente figure, sagome del corpo, macchinette, flash, teschi, gocce (CD §4.9) |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*.webp`, `assets/foto/index.ts` | nessun trattamento a runtime |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file [S] di §3 tranne `DESIGN.md`, `docs/*` altrui e `public/favicon.svg`; `src/pages/Concept12.tsx`; `sottopelle/index.ts`, `sottopelle/Sottopelle.tsx`; `core/*`; `state/*`; `parete/*`; `styles/base.css`, `styles/layout.css`; stub di `sections/*/*` e di `webgl/index.ts` (poi passano) |
| **section-builder-parete** | `sections/Parete/Parete.tsx`, `Tessera.tsx`, `PostoTuo.tsx`, `parete.css`, `docs/section-builder-parete.md` |
| **section-builder-ingresso** | `sections/Ingresso/Ingresso.tsx`, `ingresso.css`, `docs/section-builder-ingresso.md` |
| **section-builder-isole** | `sections/Isole/*` (i 9 file di §3), `docs/section-builder-isole.md` |
| **section-builder-comandi** | `sections/Comandi/Testata.tsx`, `Barra.tsx`, `Filtri.tsx`, `FoglioFiltri.tsx`, `comandi.css`, `docs/section-builder-comandi.md` |
| **section-builder-scheda** | `sections/Scheda/Scheda.tsx`, `scheda.css`, `docs/section-builder-scheda.md` |
| **section-builder-elenco** | `sections/Elenco/Elenco.tsx`, `elenco.css`, `docs/section-builder-elenco.md` |
| **section-builder-banco** | `sections/Banco/Banco.tsx`, `Taratura.tsx`, `Oggetto.tsx`, `Macchia.tsx`, `taratura.ts`, `banco.css`, `docs/section-builder-banco.md` |
| **section-builder-grande-come** | `sections/GrandeCome/*` (i 12 file di §3), `docs/section-builder-grande-come.md` |
| **shader-engineer** (in parallelo ai section-builder: dipende solo da §6-§7 e dai file del webgl-artist) | `webgl/PareteGL.ts`, `webgl/textures.ts`, `webgl/quality.ts`, `webgl/PareteCanvas.tsx`, `webgl/index.ts`, `docs/shader-engineer.md` |

Composizione fissa (la scrive lo scaffold in `Sottopelle.tsx`, firme già negli stub):

```tsx
<div className="stp-root" data-gl data-motion data-vista data-dialogo>
  <a className="stp-salto" href="#stp-elenco">Vai all'elenco</a>   {/* primo elemento focalizzabile, CD §4.8 */}
  <ConceptBackButton />
  {vista === 'parete' && glComponente && <Canvas />}               {/* webgl, lazy */}
  {vista === 'parete' ? <Parete /> : <Elenco />}                   {/* Parete monta <Ingresso/> e le isole alle loro posizioni */}
  <Testata /> <Barra />                                            {/* Strato 1, sempre */}
  <Scheda />                                                       {/* rende null se chiusa */}
  <Suspense fallback={null}><GrandeCome /></Suspense>             {/* lazy, rende null se chiuso */}
  <div id="stp-annuncio" className="stp-sr" aria-live="polite" />  {/* alimentato da annuncia() */}
</div>
```

- Firme: tutti default export. `Parete`, `Elenco`, `Testata`, `Barra`,
  `Scheda`, `GrandeCome`, `Ingresso` senza prop. Le isole:
  `({ contesto }: { contesto: 'parete' | 'elenco' })`; nell'elenco il titolo è
  `h2`, sulla parete è `h2` solo nell'istanza del periodo corrente (le altre
  istanze sono `aria-hidden` e `inert`). `Isole/index.ts` esporta
  `ISOLE: Record<IdIsola, ComponentType<{ contesto }>>` e l'ordine di lettura.
  `Banco` senza prop (legge e scrive lo store); lo monta `GrandeCome`.
- `Sottopelle.tsx` passa a `vista` "elenco" smontando la parete, e viceversa;
  `runtime.pan` resta, quindi la parete riprende dal punto lasciato.
- `invio.ts` è **simulato** (nessuna rete): risolve dopo ~1100 ms; con
  `?invio=ko` fallisce. `agenda.ts` e `stima.ts` sono **puri** (niente DOM,
  niente `Date.now()`): ricevono "oggi" e i dati dal chiamante.
- Il contatto (nome, telefono/email) e l'idea scritta restano **stato locale**
  del componente: mai nello store, mai in storage, mai negli analytics.
- Il copywriter scrive i testi come dati `as const`; i builder non inventano
  testo. Se manca una stringa, la chiedono.

---

## 5. Convenzioni

### 5.1 CSS

- Un file `.css` per sezione, importato dal componente. Nessun CSS module.
- Prefisso **`stp-`**, BEM leggero: `stp-<sezione>__<elemento>--<variante>`
  (`stp-parete__tessera--arretrata`, `stp-banco__maniglia`). Classi condivise:
  `stp-root`, `stp-sr`, `stp-salto` (scaffold); `stp-azione`, `stp-comando`,
  `stp-campo`, `stp-isola` (art-director, `componenti.css`).
- **Ogni selettore comincia con `.stp-root`**. Niente `html`, `body`, `:root`,
  `*` nudi (unica eccezione, come nel pilota: `html:has(.stp-root)` in
  `base.css` per `overscroll-behavior: none` in vista parete).
- Variabili `--stp-*` solo in `tokens.css` (art-director) e `motion.css`
  (motion-designer); locali di sezione `--stp-<sezione>-*`. **Nessun hex
  fuori da `styles/tokens.*`**; il GL legge i colori da `tokens.ts`
  (`COLORI.nero` come `[r, g, b]` 0..1).
- Attributi di stato su `.stp-root`, scritti **solo** da `Sottopelle.tsx`
  dallo store: `data-gl="pending|on|off"`, `data-motion="full|reduced"`,
  `data-vista="parete|elenco"`, `data-dialogo="nessuno|scheda|grande-come|filtri"`,
  `data-trascina="si|no"` (cursore `grabbing`, scritto da `useTrascina` tramite
  azione).
- **Z-index** (token in `tokens.css`, nomi fissati qui): canvas 0, piano della
  parete 1, comandi 10, foglio filtri 20, scheda 30, Grande come? 40. Il
  bottone del sito sta sopra tutto da solo. Nient'altro.
- `touch-action: none` **solo** sulla regione della parete. Elenco e
  pannello: zoom e scorrimento del browser liberi.
- Unità: `rem` per il testo, `clamp()` per il fluido, `dvh` per le altezze
  (mai `100vh` nudo). Raggio 0 ovunque (CD §4.1), tranne gli oggetti misurati
  (i raggi veri stanno negli SVG del vector-artist).
- Niente `backdrop-filter`, niente `filter` su grandi aree, niente
  `will-change` permanente (solo `transform` sul piano della parete, che si
  muove sempre). Niente ombre (CD).
- Il piano della parete è **un solo elemento trasformato**; le tessere e le
  isole dentro hanno `position: absolute` in coordinate del mondo (px), mai
  trasformazioni proprie tranne lo scarto fisso (in `left/top`, calcolato da
  `layout.ts`, non in `transform`).

### 5.2 TypeScript e React

- Tipi condivisi: `state/store.ts` (`Stile`, `Misura`, `Artista`, `Zona`,
  `Oggetto`, `Vista`, …: riesportati da `assets/foto/index.ts` e
  `content/prezzi.ts`, una sola fonte), `parete/layout.ts` (`Istanza`,
  `Forma`, `Rett`).
- Le sezioni chiamano **azioni** dello store, mai `store.set`.
- Id DOM stabili: `stp-parete`, `stp-elenco`, `stp-scheda`, `stp-grande-come`,
  `stp-annuncio`, tessera `stp-t-<periodo>-<slot>` (es. `stp-t-0_0-14`), isola
  `stp-isola-<id>`.
- Nessun `useEffect` che legge layout durante il pan. Le misure che servono
  (rettangolo di una tessera per il FLIP) si chiedono a `layout.ts` +
  `runtime.pan`, non al DOM.

### 5.3 Accessibilità strutturale (contratto tecnico del CD §4.8)

- Ordine DOM = ordine di lettura: salto "Vai all'elenco", back button del sito,
  parete (region: ingresso con `h1`, poi tessere e isole del periodo corrente
  in ordine di lettura di `mappa.ts`), testata, barra.
- Canvas `aria-hidden="true"`. Ogni tessera è un `<button>` con
  `aria-label = etichettaLavoro(foto)` (copywriter). In fallback l'`<img>`
  dentro ha `alt=""`.
- **Tab order finito**: solo le istanze del **periodo corrente** (quello che
  contiene il centro della finestra) hanno `tabIndex=0`; le istanze dei periodi
  vicini sono in DOM solo se visibili, con `aria-hidden="true"` e `inert`.
  Mentre il fuoco è dentro la parete, il periodo corrente **non cambia** (lo
  blocca `visibili.ts` con `bloccaPeriodo()`), così il fuoco non salta.
- Dialoghi (scheda, Grande come?, foglio filtri): `useDialogo` (scaffold) =
  `role="dialog"`, `aria-modal`, focus intrappolato, Esc chiude, fuoco
  restituito, `inert` sul resto, voce di history (indietro = chiudi).
- Filtri `aria-pressed`; Parete/Elenco come due bottoni con `aria-pressed`
  (stato letto). Stima: `aria-live="polite"` suo, dentro il pannello.
  Annunci di sistema (filtri applicati, esito): `annuncia(testo)` dello store.
- Anello di focus osso 2 + 2 px (interaction.css), mai coperto: i comandi fissi
  hanno `scroll-padding`/`scroll-margin` nel pannello e nell'elenco; sulla
  parete la camera porta la tessera a fuoco **dentro l'area libera** (finestra
  meno testata, barra e zona del back button), non solo dentro lo schermo:
  `layout.areaLibera(viewport)` dello scaffold.
- Reflow/zoom: la parete è una superficie a due dimensioni (eccezione WCAG
  1.4.10 per contenuti che richiedono layout 2D), ma tutto il sito esiste
  nell'elenco, che rifluisce. Proposta all'ux-architect: se all'apertura la
  finestra è alta meno di 480 px CSS (telefono in orizzontale, zoom ≥ 200%),
  si parte **in elenco** (§Richieste).

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno senza librerie, letto con `useSyncExternalStore` e un selettore.

```ts
// tipi (fonte unica: assets/foto/index.ts e content/prezzi.ts, riesportati qui)
export type Stile = 'linea-fine' | 'blackwork' | 'lettering' | 'ornamentale' | 'nero-grigio';
export type Misura = 'piccolo' | 'medio' | 'grande';
export type Artista = 'nives' | 'tobia';            // nomi definitivi dal copywriter/brand
export type Zona = 'polso' | 'avambraccio' | 'braccio' | 'spalla' | 'scapola' | 'schiena' | 'costole'
  | 'fianco' | 'coscia' | 'polpaccio' | 'caviglia' | 'mano' | 'collo';
export type Oggetto = 'moneta' | 'carta' | 'telefono' | 'cartolina';
export type Vista = 'parete' | 'elenco';
export type Dialogo = 'nessuno' | 'scheda' | 'grande-come' | 'filtri';
export type StatoGL = 'pending' | 'on' | 'off';
export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';

export interface Filtri { stili: Stile[]; misure: Misura[]; artista: Artista | null }

export interface Taratura { pxPerMm: number; fonte: 'carta' | 'stima' }

export interface Prenotazione {
  larghezzaCm: number | null;      // null = "Non lo so ancora"
  altezzaCm: number | null;
  oggetto: Oggetto;                // default 'carta'
  zona: Zona | null;
  stile: Stile | null;
  primo: boolean | null;           // primo tatuaggio?
  giorno: string | null;           // ISO yyyy-mm-dd
  orario: string | null;           // 'hh:mm'
  daLavoro: string | null;         // id foto se aperto dalla scheda ("una cosa così")
  invio: StatoInvio;
}

export interface PostoTuo { larghezzaCm: number; altezzaCm: number; giorno: string; orario: string }

export interface SottopelleState {
  vista: Vista;
  dialogo: Dialogo;
  scheda: { fotoId: string; daIstanza: string | null } | null;   // daIstanza = chiave per il FLIP
  filtri: Filtri;
  taratura: Taratura | null;       // null = mai tarato (localStorage)
  prenotazione: Prenotazione;
  postoTuo: PostoTuo | null;       // sessionStorage: il posto vuoto sulla parete dopo il successo
  gl: StatoGL;
  glMotivo: string | null;
  reducedMotion: boolean;
  simulaErroreInvio: boolean;      // ?invio=ko
  annuncio: string;                // testo della regione aria-live di sistema
}

export const store: { get(): SottopelleState; set(p: PatchStato): void; subscribe(fn: () => void): () => void };
export function useSottopelle<T>(sel: (s: SottopelleState) => T, isEqual?: (a: T, b: T) => boolean): T;

// azioni (le sezioni chiamano queste)
export function impostaVista(v: Vista): void;
export function apriScheda(fotoId: string, daIstanza: string | null): void;
export function chiudiDialogo(): void;
export function apriFiltri(): void;
export function apriGrandeCome(opz?: { daLavoro?: string }): void;   // precompila stile, zona, misura dal catalogo
export function alternaStile(s: Stile): void;
export function alternaMisura(m: Misura): void;
export function scegliArtista(a: Artista | null): void;
export function azzeraFiltri(): void;
export function impostaTaratura(t: Taratura | null): void;           // salva in localStorage
export function aggiornaPrenotazione(p: Partial<Prenotazione>): void; // misura limitata 1..40 cm, passo 0,5
export function impostaInvio(i: StatoInvio): void;
export function confermaPosto(): void;                                // successo: scrive postoTuo (sessionStorage)
export function impostaGL(gl: StatoGL, motivo?: string | null): void; // solo Sottopelle.tsx e shader-engineer
export function annuncia(testo: string): void;
export function inizializzaStore(o: { search: string; reducedMotion: boolean; altezza: number }): SottopelleState; // solo Sottopelle.tsx

// selettori
export function selFiltriAttivi(s: SottopelleState): boolean;
export function selFotoVisibile(s: SottopelleState, fotoId: string): boolean; // passa i filtri
```

- Lo store è un singleton di modulo **re-inizializzato** al mount di
  `Sottopelle.tsx` (persist + parametri URL), così uscire e tornare nel sito
  vero non lascia stati sporchi.
- `gl`/`glMotivo` li scrivono solo `Sottopelle.tsx` e lo shader-engineer;
  `reducedMotion` solo `Sottopelle.tsx`.

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, **mai** nello stato React. Scritto e letto nel ticker.

```ts
export interface Runtime {
  viewport: { w: number; h: number; dpr: number };  // core/viewport.ts (visualViewport su mobile)
  modulo: number;                                    // M in px: 168 / 136 / 112 (da tokens.ts MODULO), core/viewport.ts
  pan: { x: number; y: number };                     // coordinate MONDO dell'angolo in alto a sinistra della finestra
  vel: { x: number; y: number };                     // px/s, per l'inerzia e per la durata dello sboccio
  trascina: { attivo: boolean; id: number | null };  // interaction/useTrascina
  puntatore: { x: number; y: number; dentro: boolean; tipo: 'mouse' | 'touch' | 'pen' };
  dirty: boolean;                                    // il GL deve ridisegnare
  markDirty(): void;
  reset(): void;                                     // Sottopelle.tsx al mount
}
export const runtime: Runtime;
```

- `pan` lo scrivono **solo** `motion/camera.ts` e `interaction/useTrascina.ts`
  (tramite `camera.trascina(dx, dy)`, mai direttamente). Chiunque cambi
  qualcosa di visibile nel GL chiama `runtime.markDirty()`.
- Il mondo cresce senza limiti (toroide): i numeri restano float normali; al
  cambio di periodo non si riallinea nulla.

### 6.3 Persistenza: `state/persist.ts`

API del pilota (`leggi`, `scrivi`, `rimuovi`, `leggiJSON`, `scriviJSON`,
`scriviJSONRimandato`, `svuotaRimandati`), tutto in try/catch. Chiavi:

| Chiave | Area | Contenuto | Scrive |
|---|---|---|---|
| `sottopelle:taratura` | local | `{ pxPerMm, fonte, dpr, schermoW }`; si ignora se `dpr` o `screen.width` sono cambiati (altro schermo) | `impostaTaratura` |
| `sottopelle:posate` | session | id delle foto già posate (CD: "una volta posato, resta" per la visita) | `motion/sboccio.ts` (rimandato 500 ms) |
| `sottopelle:posto` | session | `PostoTuo` | `confermaPosto` |

### 6.4 Catalogo dei lavori: `assets/foto/index.ts` (photo-editor)

```ts
export type Forma = '1x1' | '2x1' | '1x2' | '2x2' | '2x3';   // moduli L × A
export interface Lavoro {
  id: string;                         // kebab-case, stabile (es. 'ramo-ulivo-avambraccio')
  forma: Forma;                       // dalla misura vera (CD §3 A)
  misura: Misura;                     // 1x1 → piccolo; 2x1/1x2 → medio; 2x2/2x3 → grande
  stile: Stile; zona: Zona; artista: Artista;
  larghezzaCm: number; altezzaCm: number; sedute: number; guaritoMesi: number;
  soggetto: string;                   // "ramo d'ulivo" (per etichettaLavoro del copywriter)
  src: { parete: string; scheda: string };   // URL Vite: 640 e 1280 px sul lato lungo
  px: { w: number; h: number };       // misure del file "scheda"
  autore: string; fonte: string;      // credito Unsplash (o Pexels) per il colophon
}
export const LAVORI: readonly Lavoro[];
```

- **Proporzioni esatte**: lo spazio tra tessere è M/6, quindi le proporzioni
  delle forme non cambiano con il modulo: `1x1` = 1, `2x1` = 13:6, `1x2` =
  6:13, `2x2` = 1, `2x3` = 13:20. Il photo-editor ritaglia ogni foto
  **esattamente** a quella proporzione, sul tatuaggio: lo shader e il fallback
  non fanno "cover".
- Due misure (CD §4.4 chiedeva 640 e 1600): **640 px** sul lato lungo per la
  parete, **1280 px** per la scheda e per le tessere grandi (`2x2`, `2x3`) su
  desktop con DPR > 1,25. Il 1600 costerebbe il 56% di memoria GPU in più per
  una differenza che a scala fissa non si vede (80% di 900 px = 720 px CSS ×
  DPR 1,75 ≈ 1260). Webp qualità 72-78; tetto 70 KB (640) e 190 KB (1280).
- Minimo **4 foto per forma** usata nella mappa, o il rimescolamento tra
  periodi ripete la stessa foto vicina a se stessa (vedi §7.2).

---

## 7. La parete: contratti

### 7.1 `parete/mappa.ts` e `parete/layout.ts` (scaffold)

```ts
export const PERIODO = { colonne: 16, righe: 12 } as const;   // 12 × 9 se piano B foto (CD §4.6)
export type IdIsola = 'ingresso' | 'solo-guariti' | 'chi-tatua' | 'prima-di-venire' | 'quanto-costa' | 'la-cura' | 'dove';
export interface SlotTessera { tipo: 'tessera'; indice: number; col: number; riga: number; forma: Forma }
export interface SlotIsola { tipo: 'isola'; id: IdIsola; col: number; riga: number; larg: number; alt: number }
export const SLOT: readonly (SlotTessera | SlotIsola)[];     // in ordine di lettura (= ordine di Tab)
export const ORIGINE: { col: number; riga: number };          // centro dell'ingresso

export interface Rett { x: number; y: number; w: number; h: number }
export interface Istanza {
  chiave: string;                     // `${px}_${py}-${indiceSlot}`: stabile, usata da React, GL, motion
  periodo: { px: number; py: number };
  slot: SlotTessera | SlotIsola;
  fotoId: string | null;              // null per le isole
  mondo: Rett;                        // px mondo, scarto fisso ±10 (±6 sotto 640) già applicato
}
export function rettSlot(slot, periodo, modulo): Rett;       // include lo scarto deterministico (hash di slot)
export function fotoPerSlot(slot: SlotTessera, periodo): string;   // periodo (0,0): ordine curato; altri: rimescolato con seme hash(px,py) dentro la stessa forma
export function periodoDi(xMondo: number, yMondo: number, modulo: number): { px: number; py: number };
export function panIniziale(viewport, modulo): { x: number; y: number };   // ingresso al centro
export function areaLibera(viewport): Rett;                   // finestra meno testata, barra, zona back button
export function panPerMostrare(r: Rett, pan, viewport): { x: number; y: number } | null;  // null se già dentro l'area libera
export function istanzaSotto(xSchermo, ySchermo, pan, modulo): Istanza | null;           // hit test puro
```

Le posizioni dello slot vengono dall'ux-architect (periodo 16 × 12 con
tessere e isole, CD §4.10); se il suo doc non le dà complete, lo scaffold le
compone rispettando il CD: isole distanti ≥ 3 moduli, un'isola entro circa due
schermate in ogni direzione, 25-30% di vuoto, 28-30 tessere.

### 7.2 `parete/visibili.ts` (scaffold)

Gira nella fase `update` dopo `camera`. Calcola le istanze il cui `mondo`
interseca la finestra allargata di **1 modulo** su ogni lato.

```ts
export const visibili: {
  lista(): readonly Istanza[];          // array condiviso, sostituito solo quando cambia l'insieme
  versione: number;                     // +1 a ogni cambio d'insieme
  periodoCorrente(): { px: number; py: number };
  bloccaPeriodo(b: boolean): void;      // true mentre il fuoco è dentro la parete
  suEntra(fn: (i: Istanza, lato: 'sx' | 'dx' | 'su' | 'giu' | 'dentro') => void): () => void;
  suEsce(fn: (i: Istanza) => void): () => void;
  subscribe(fn: () => void): () => void; // per useVisibili
};
export function useVisibili(): readonly Istanza[];   // React: ri-render solo al cambio d'insieme, mai per frame
```

- `lato` = da dove entra la tessera, per il punto d'ingresso dello sboccio
  (CD §4.3); `'dentro'` all'apertura (anelli dal centro).
- Nessun `getBoundingClientRect`, nessun IntersectionObserver: è aritmetica
  sul modulo.
- La stessa foto può comparire in due istanze visibili insieme solo se il
  bucket della sua forma ha meno di 4 foto (§6.4): il rimescolamento evita
  ripetizioni nello stesso periodo e nei periodi adiacenti quando può.

### 7.3 Motion ↔ parete ↔ GL (chi legge cosa)

```ts
// motion/camera.ts (motion-designer)
camera.trascina(dx: number, dy: number): void;   // 1:1 durante il gesto
camera.rilascia(vx: number, vy: number): void;   // inerzia (max 2400 px/s, ~0,9 s); niente con reduced motion
camera.scivola(dx: number, dy: number): void;    // frecce: 1 o 4 moduli, 280 ms (0 con reduced motion)
camera.vaiA(x: number, y: number, opz?: { durata?: number }): void;   // "Torna all'ingresso", fuoco, ritorno dall'elenco
camera.deriva(): void;                           // una volta, all'apertura (niente con reduced motion)
camera.inMoto(): boolean;

// motion/sboccio.ts (motion-designer)
sboccio.stato(fotoId: string): { t: number; ingresso: [number, number]; seme: number } ; // t 0..1 (1 = posata)
sboccio.posata(fotoId: string): boolean;
sboccio.pronta(fotoId: string): void;            // chiamata da textures.ts (GL) o dall'<img> decodificata (fallback): parte lo sboccio
sboccio.registraFoglia(chiave: string, fotoId: string, el: HTMLElement): () => void;  // solo fallback: scrive --stp-sboccio

// motion/increspature.ts (motion-designer)
increspature.avvia(chiave: string, u: number, v: number): void;   // chiamata da interaction/puntatore.ts; limite 1/600 ms per istanza
increspature.stato(chiave: string, now: number): { u: number; v: number; t: number } | null;   // t in secondi dall'avvio

// motion/arretramento.ts (motion-designer)
arretramento.livello(fotoId: string): number;    // 0 piena, 1 arretrata (dai filtri dello store)
```

Il GL (shader-engineer, `PareteGL.ts`) nella fase `render`, per ogni istanza di
`visibili.lista()` con `fotoId`: rettangolo schermo = `mondo − runtime.pan`
(× DPR), texture della foto (se caricata, altrimenti non disegna: si vede il
nero del fondo, che è già "coperto dall'inchiostro"), uniform da `sboccio`,
`increspature`, `arretramento`. Le isole non sono nel GL.

Il DOM (section-builder-parete) nella fase `write`: `transform:
translate3d(−pan.x px, −pan.y px, 0)` sul piano, una volta per frame.
Le tessere si montano/smontano solo al cambio di `useVisibili()`.

### 7.4 Uniform del programma (contratto tra webgl-artist e shader-engineer)

Il webgl-artist le fissa in `webgl/programma.ts` (`UNIFORM`, nomi e tipi);
questa è la base minima:

| Uniform | Tipo | Significato |
|---|---|---|
| `uRisoluzione` | vec2 | canvas in px fisici |
| `uRett` | vec4 | tessera in px fisici (x, y, w, h), origine in alto a sinistra |
| `uFoto` | sampler2D | texture della foto |
| `uSboccio` | float | 0..1 (1 = posata: ramo veloce, niente rumore) |
| `uIngresso` | vec2 | punto d'ingresso in uv della tessera |
| `uSeme` | float | seme del rumore per foto |
| `uIncr` | vec3 | u, v, t in secondi (t < 0 = nessuna) |
| `uArretra` | float | 0..1 |
| `uNero` | vec3 | colore dell'inchiostro/fondo (da `tokens.ts`) |
| `uGrigio` | vec3 | colore dei filamenti (grigio sfumato) |

GLSL ES 1.00, `precision highp float` nel fragment (se `highp` manca →
fallback DOM, §9). Nessuna texture di rumore: rumore procedurale (hash +
value noise, 4 ottave al massimo, solo con `uSboccio < 1`).

---

## 8. Budget di performance

Misurati dal performance-auditor sulla build standalone (Lighthouse mobile e
desktop, più le prove indicate).

| Voce | Budget |
|---|---|
| JS iniziale del concept (chunk `Concept12` + `sottopelle/`, senza react/router) | ≤ **60 KB gz** (obiettivo 45) |
| JS iniziale totale standalone (con react, react-dom, router) | ≤ **115 KB gz** |
| Chunk WebGL lazy (`webgl/`) | ≤ **160 KB gz** (tetto del lab); obiettivo **≤ 15 KB gz** senza three |
| Chunk "Grande come?" lazy (`GrandeCome` + `Banco`) | ≤ **30 KB gz** |
| CSS totale del concept | ≤ **24 KB gz** |
| SVG (icone + oggetti) | ≤ **15 KB** non gz |
| Font | 89 KB (Grenze Gotisch 42,3 + Schibsted 46,8, misurati) |
| Foto della prima schermata | ≤ **700 KB** a 1440, ≤ **350 KB** a 375 (miniature 640) |
| Foto, file singolo | 640: ≤ 70 KB; 1280: ≤ 190 KB |
| Richieste foto contemporanee | ≤ **4**, ordinate per distanza dal centro della finestra |
| LCP | ≤ **2,5 s** mobile, ≤ 1,5 s desktop. Elemento LCP = **h1 *Sottopelle* nel DOM**, mai il canvas né una foto |
| CLS | ≤ **0,02** (tutto `position: fixed`, piano mosso con transform, isole a misura di modulo, font di ripiego tarati) |
| INP | ≤ **150 ms** (tocco su tessera, filtri, campi della frase, maniglia della macchia) |
| TBT | ≤ 150 ms mobile |
| Disegni per frame | ≤ **56** (un quad per tessera visibile); **0** frame quando niente si muove |
| Upload texture | ≤ **1 per frame** su mobile, 2 su desktop, da `ImageBitmap` già decodificata |
| Memoria texture | ≤ **48 MB** mobile, ≤ **96 MB** desktop, LRU a byte (non a numero); niente mipmap |
| DPR del canvas | mobile ≤ **1,75**, desktop ≤ **2**; pixel totali ≤ **5 M** (a 2560 × 1440 il DPR scende da solo) |
| FPS durante il pan | 60 desktop; ≥ 50 su mobile medio (iPhone 12, Pixel 6a); mai sotto 30 |
| Long task durante il pan a 390 px CPU 4× | nessuno > 50 ms |

**Qualità adattiva** (`quality.ts`): media mobile del tempo frame su 30 frame
di pan; sopra 20 ms si scende di 0,25 di DPR fino a 1,0; se sotto i 30 fps
per 3 s a DPR 1,0 → `impostaGL('off', 'qualita')`: il canvas va a opacità 0 in
300 ms mentre le tessere DOM prendono le loro `<img>` già posate (sboccio
saltato per le foto in `posate`). Monotono, nessun lampo.

---

## 9. Strategia di caricamento

1. **HTML + CSS** (prima pittura): `index.html` ha fondo nero inline su
   `html` e `body` (nessun lampo chiaro). React monta `.stp-root` con
   `data-gl="pending"`: nero, isole in DOM (l'ingresso al centro), tessere
   DOM vuote e trasparenti (= nero, cioè "coperte dall'inchiostro").
2. **Font**: `preconnect` + `<link>` al mount, `display=swap`, ripieghi
   tarati. La parola *Sottopelle* sboccia dopo il font (max 1200 ms di attesa).
3. **Rilevamento** (`core/capabilities.ts`, subito al mount): WebGL
   (`webgl2 ?? webgl`, `failIfMajorPerformanceCaveat: true`, `highp`
   nel fragment), `prefers-reduced-motion` (con listener),
   `navigator.connection?.saveData`, `?gl=0|1`.
4. **WebGL subito, non in idle** (differenza dal pilota): la parete è il
   contenuto, quindi `import('../webgl')` parte **al mount**, in parallelo ai
   font (il chunk è piccolo, §8). Se il GL non è `on` entro **4000 ms** dal
   mount → `impostaGL('off', 'lento')` e il chunk, se arriva dopo, viene
   ignorato per tutta la visita. Una sola decisione, niente passaggi avanti e
   indietro.
5. **`gl = 'on'`** quando: contesto creato, programma compilato e linkato,
   primo frame disegnato (tutto nero). Da lì il canvas è a opacità 1 subito
   (è identico al nero del fondo: nessuna dissolvenza da fare).
6. **Foto**: `textures.ts` scarica per distanza dal centro della finestra
   (prima l'anello attorno all'ingresso), ≤ 4 fetch insieme, decodifica con
   `createImageBitmap` (ripiego `img.decode()` su Safari vecchi), carica ≤ 1
   texture per frame, poi chiama `sboccio.pronta(fotoId)`. Lo sboccio parte
   solo quando la texture c'è: mai un'apertura sul vuoto. All'apertura, gli
   anelli (60 ms l'uno dall'altro) partono dal primo frame utile; il motion
   garantisce "finito entro 1,9 s" contando dal momento in cui l'anello è
   pronto.
7. **Precaricamento**: in idle dopo il primo sboccio (`requestIdleCallback`,
   ripiego `setTimeout` 1500 ms) si scarica il chunk "Grande come?"; si
   scarica comunque su `pointerenter`/`focus` di un bottone rosso. La foto
   1280 di una tessera si scarica su `pointerdown` (prima del tocco completo)
   per la scheda.
8. **Vista elenco**: `<img loading="lazy" decoding="async" srcset="640w,
   1280w" sizes>` con `width`/`height` veri (niente CLS). Il GL resta montato
   ma non disegna (la parete è smontata dal DOM, il canvas nascosto).
9. **Pausa**: `visibilitychange` → ticker fermo. `webglcontextlost` →
   `preventDefault()`, `impostaGL('off', 'contesto-perso')` subito (fallback
   DOM con le foto già posate); `webglcontextrestored` **non** riaccende
   (una decisione per visita).
10. **Smontaggio**: ticker fermo, `PareteGL.dispose()` (texture, buffer,
    programma, `WEBGL_lose_context`), `ImageBitmap.close()`, listener via,
    `html`/`body` ripristinati, font tolti solo se aggiunti.

### 9.1 Fallback senza WebGL (`data-gl="off"`)

Deve reggere da solo la giuria (CD §4.1):
- ogni `Tessera` rende dentro il bottone un `<img>` (640, o 1280 per le forme
  grandi su DPR > 1,25) caricato solo quando l'istanza è in
  `visibili.lista()`;
- lo sboccio è una `mask-image: radial-gradient(...)` centrata sul punto
  d'ingresso, raggio pilotato da `--stp-sboccio` (0 → 1) scritto da
  `sboccio.registraFoglia` solo sull'elemento foglia `[data-stpvar]`, 700 ms,
  bordo morbido; stile in `styles/fallback.css` (art-director);
- nessuna increspatura; arretramento con `filter: grayscale() brightness()`
  **solo** sulle tessere arretrate (piccole aree, non l'intera parete);
- stessa memoria `posate`: una foto già vista rientra già posata.

### 9.2 Reduced motion (`data-motion="reduced"`)

Il GL si carica comunque (è materia, non animazione) ma: `uSboccio = 1`
subito (dissolvenza di 150 ms solo al primo caricamento dell'immagine, fatta
con un'uniform di opacità o, più semplice, lasciando `uSboccio` da 0,85 a 1:
decide il webgl-artist con il motion-designer), nessuna increspatura, nessuna
deriva, nessuna inerzia, scivolate istantanee, *Sottopelle* fermo a 600,
scheda in dissolvenza senza FLIP. La preferenza si ascolta: se cambia durante
la visita, si applica da subito.

---

## 10. Analytics

`import { track } from '@/lib/analytics'`, firma del sito:
`track(event: TrackEvent, params?: Record<string, string | number | boolean | undefined>)`.
Solo due eventi (integrazione-sito.md punto 2):

| Evento | Quando | Params |
|---|---|---|
| `apri_concept` | mount di `Sottopelle.tsx`, una volta (guardia per StrictMode) | `{ concept: 12 }` |
| `demo_prenotazione` | successo dell'invio in `GrandeCome` | `{ concept: 12, misura: 'piccolo'\|'medio'\|'grande'\|'non-so', zona, stile, sedute, tarato: boolean, daLavoro: boolean }` |

Mai contatto, idea scritta, giorno/orario. Nessun altro evento: il resto non
si traccia.

---

## 11. Comandi

### 11.1 Script (dalla cartella `concepts/12-sottopelle/`)

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite --port 9120 --strictPort` → http://localhost:9120/concept-12 (`/` fa redirect) |
| `npm run build` | `vite build` in `dist/` |
| `npm run preview` | `vite preview --port 9121 --strictPort` (fallback SPA: `/concept-12` regge il ricaricamento) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | `tsc -p tsconfig.node.json --noEmit` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build in fila: **da lanciare prima di dire "fatto"** |
| `npm run size` | dopo il build, stampa i pesi gz dei chunk (script dello scaffold in Node, niente dipendenze) |

Ogni agent che avvia un server usa **la sua porta** (sotto) con
`--strictPort` (es. `npx vite --port 9124 --strictPort`) e lo chiude alla
fine. Mai uccidere processi altrui.

### 11.2 Porte (range del concept: 9120-9129)

| Ondata | Porta | Agent |
|---|---|---|
| 2 | 9124 | art-director (pagine di prova statiche) |
| 2 | 9125 | motion-designer |
| 2 | 9126 | interaction-designer |
| 2 | 9127 | webgl-artist (prova di compilazione in Chromium) |
| 2 | 9128 | vector-artist |
| 2 | 9129 | photo-editor |
| 3 | 9120 | scaffold-engineer (da solo), poi shader-engineer |
| 3 | 9122 | section-builder-parete |
| 3 | 9123 | section-builder-ingresso |
| 3 | 9124 | section-builder-isole |
| 3 | 9125 | section-builder-comandi |
| 3 | 9126 | section-builder-scheda |
| 3 | 9127 | section-builder-elenco |
| 3 | 9128 | section-builder-banco |
| 3 | 9129 | section-builder-grande-come |
| 4 | 9121 | responsive-tester (preview) |
| 4 | 9122 | accessibility-auditor |
| 4 | 9123 | performance-auditor |
| 4 | 9124 | cross-browser-tester |
| 4 | 9125 | seo-engineer |
| 4 | 9126 | awwwards-jury (se serve un server) |

Le porte si riusano solo tra ondate diverse (quelle della precedente sono
chiuse).

### 11.3 Parametri di prova nell'URL (`core/params.ts`)

| URL | Effetto |
|---|---|
| `?gl=0` | niente WebGL, `data-gl="off"` (fallback DOM) |
| `?gl=1` | WebGL anche con risparmio dati (non se il contesto manca) |
| `?vista=elenco` | apre in vista elenco |
| `?lavoro=<id>` | apre la scheda di quel lavoro |
| `?apri=grande-come` | apre il pannello (con `&da=<id>` precompilato da un lavoro) |
| `?taratura=salta` | taratura saltata (96 px per pollice CSS), per le prove del banco |
| `?invio=ko` | l'invio simulato fallisce |
| `?posate=tutte` | tutte le foto già posate (screenshot senza attese) |
| `?successo=1` | dopo il mount, stato di successo con un posto di esempio (per QA del "posto vuoto") |
| `#elenco` | come `?vista=elenco` (è anche il bersaglio del salto) |

Per svuotare la memoria del concept: `localStorage.removeItem('sottopelle:taratura');
sessionStorage.clear()`.

---

## 12. Checklist per chi scrive codice

- Segui `.claude/skills/design-taste-frontend/SKILL.md` e
  `.claude/skills/full-output-enforcement/SKILL.md`: niente file troncati,
  niente TODO, niente placeholder.
- Solo i tuoi file (§4). Ciò che è condiviso passa da store, runtime,
  `parete/*`, `motion/*`, token: non duplicare costanti.
- Nessun `requestAnimationFrame` fuori dal ticker; nessun `setInterval` per
  animare; nessun listener `scroll`/`resize` proprio (c'è `runtime.viewport`).
- Nessuna lettura di layout durante il pan; nessuna trasformazione per
  tessera.
- Nessun colore hex fuori da `styles/tokens.*`; rosso solo come fondo di
  `.stp-azione`; Grenze Gotisch mai sotto 32 px, mai maiuscolo.
- Nessun accesso al browser a livello di modulo (prerender del sito).
- Nessun testo nel canvas; nessun testo nei componenti (tutto da
  `content/testi.ts`); niente trattini lunghi.
- `aria-hidden` sul canvas e sulle istanze fuori dal periodo corrente.
- Prima di consegnare: `npm run check` verde, pagina aperta sulla tua porta
  senza errori in console a 375 e 1440, screenshot della finestra guardati.

---

## Richieste ad altri agent

1. **ux-architect**: la barra mobile come la descrive il CD urta il
   `ConceptBackButton` (§3.3). Proposta: barra a tutta larghezza **sopra** la
   zona del bottone (`bottom: 60px + safe-area`). Decidi il disegno.
2. **ux-architect**: nella sezione "Sezioni da costruire" usa, se puoi, gli
   8 nomi di §3.1 (parete, ingresso, isole, comandi, scheda, elenco, banco,
   grande-come). Servono anche: le posizioni esatte del periodo 16 × 12
   (col, riga, forma di ogni tessera; col, riga, larg, alt di ogni isola) in
   ordine di lettura; la tabella della stima e il calendario delle consulenze
   (vanno in `content/prezzi.ts` e `content/orari.ts`).
3. **ux-architect**: proposta di partire in **elenco** se all'apertura la
   finestra è alta meno di 480 px CSS (zoom ≥ 200%, telefono in orizzontale).
   Se sì, lo scaffold lo implementa in `inizializzaStore`.
4. **ux-architect**: tasto indietro del browser = chiude il dialogo aperto
   (`core/storia.ts`). Confermalo nel flusso.
5. **creative-director / orchestratore**: due differenze consapevoli dal CD
   §4.4 da approvare: WebGL crudo invece di three 0.160 (§2.1), foto della
   scheda a 1280 px invece di 1600 (§6.4).
6. **art-director**: in `tokens.ts` servono `MODULO` per fascia
   (`{ largo: 168, medio: 136, stretto: 112 }` con soglie 1024 e 640),
   `COLORI` anche come `[r, g, b]` 0..1 per il GL, e gli z-index di §5.1 come
   token. `componenti.css` definisce `.stp-azione` (unico uso del rosso).
7. **photo-editor**: proporzioni esatte per forma (§6.4), due misure 640/1280,
   nomi file `<id>-640.webp` / `<id>-1280.webp`, almeno 4 foto per ogni forma
   usata dalla mappa, catalogo `LAVORI` con i campi di §6.4.
8. **vector-artist**: `assets/svg/oggetti.ts` con gli oggetti di confronto in
   SVG a `viewBox` **in millimetri** (moneta Ø 23,25; carta 85,60 × 53,98 con
   raggio 3,18; telefono 71 × 147 con raggio ~9; cartolina 210 × 148 con
   piega a metà), così il banco imposta solo `width`/`height` = mm ×
   `pxPerMm`. Contorno con `vector-effect: non-scaling-stroke`.
9. **webgl-artist**: shader in GLSL ES 1.00 (WebGL1 e WebGL2), uniform di
   §7.4 in `programma.ts`, prova di compilazione in Chromium headless con
   SwiftShader (porta 9127) su una pagina statica.
10. **copywriter**: `etichettaLavoro(l: Lavoro): string` in `testi.ts` per
    gli `aria-label` delle tessere e gli alt dell'elenco, e `META` (title e
    description con "Concept di Ciceri Lab").
