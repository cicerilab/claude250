# Tech architect · Concept 19 · NODI

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, contratti tra moduli, stato, budget e caricamento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga 19, paragrafo
19, verifica incrociata, regole comuni), `concepts/19-nodi/docs/creative-director.md`
(tutto), `concepts/10-torchio/docs/integrazione-sito.md`, `tech-architect.md` e
`scaffold-engineer.md` del pilota, il codice del pilota in `src/` (`package.json`,
`vite.config.ts`, `App.tsx`, `Concept10.tsx`, stub di analytics,
`ConceptBackButton`), `tech-architect.md` del concept 18 (per coerenza di
formato tra i concept con WebGL). Il pilota è riferimento di formato e
architettura, non di design.

Verifiche fatte da questo agent il 26/09/2026 (Node 22.22.2, registry npm
raggiungibile):
- versioni con `npm view`: `three@0.160.1` esiste (ultima della 0.160), le
  altre sono quelle del pilota (§1);
- **misura reale del peso di three** con un build Vite 5.4.21 di prova nello
  scratchpad, con esattamente gli import che servono qui (renderer,
  camera ortografica, `Mesh`, `PlaneGeometry`, `InstancedBufferGeometry`,
  `InstancedBufferAttribute`, `ShaderMaterial`, `RawShaderMaterial`,
  `DataTexture`, `CanvasTexture`): **112,8 KB gz** (§2.1);
- **font**: l'URL Google Fonts di IM Fell DW Pica (400) e Spline Sans
  (variabile `wght` 300..700) risponde; file woff2 latin: IM Fell 62,6 KB,
  Spline Sans variabile 58,0 KB. **Spline Sans ha la feature `tnum`**
  (tabella GSUB letta dal file: `ccmp dnom frac liga locl numr pnum tnum`),
  quindi `font-variant-numeric: tabular-nums` funziona sulle cifre. IM Fell ha
  solo `liga locl` (niente cifre tabulari: non porta cifre, come vuole il CD);
- ambiente: niente `numpy` né `cwebp` né `sharp` installati; gli script
  offline sono quindi in **Node senza dipendenze** e le WebP si fanno col
  Chromium di Playwright (§9.5).

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/19-nodi/`, stessa struttura del pilota. Il concept vive tutto in
   `src/pages/concepts/nodi/`; `src/pages/Concept19.tsx` è un file sottile.
   Porting = copiare quella cartella e `Concept19.tsx`.
2. **three 0.160 puro, senza R3F né drei** (CD §4.10). La scena è un piano
   ortografico (la tavola), un gruppo di cuscinetti e un sistema di foglie
   istanziate: **3 draw call**. Tutto in una classe (`webgl/TavolaGL.ts`)
   montata da un componente sottile.
3. **Le foglie si muovono sulla CPU**, non in GPGPU. 2.600 particelle con
   tre campi modali campionati bilinearmente costano meno di 0,5 ms a passo
   anche su un telefono medio; in cambio la simulazione è **deterministica**
   (stesso seme, stesse posizioni), scritta in TypeScript puro senza three,
   provabile in Node, e la stessa funzione calcola le **disposizioni finali
   del reduced motion** e i **fermi immagine** del fallback. La GPU riceve
   solo le posizioni (un buffer istanziato aggiornato per frame).
4. **I campi dei modi sono calcolati offline** (`scripts/modi/`, Node, una
   volta) e spediti come un piccolo binario (`webgl/dati/modi.bin`,
   ≤ 60 KB non compressi) più un file TS di metadati generato. Mai calcolati
   nel browser.
5. **Una sola verità: la posizione di scroll.** Lo scroll nativo del documento
   (niente lenis, niente GSAP) dà il *percorso*, il percorso dà la
   frequenza (curva a pianerottoli del motion-designer), la frequenza dà le
   ampiezze dei modi (lorentziane), le ampiezze muovono le foglie. Trascinare
   il righello o usarlo da tastiera **scrive lo scroll** (`window.scrollTo`),
   non la frequenza: scroll e righello non litigano mai (CD §4.3).
6. **Un solo ciclo rAF** (`core/ticker.ts`, API del pilota) con fasi
   read/update/write/render; render WebGL **solo se sporco**, e la
   simulazione dorme quando le foglie sono ferme.
7. **La prima pittura è un'immagine**: il poster della tavola **vuota**
   (legno, contorno, ombra, cuscinetti, senza foglie), generato dallo stesso
   shader. Quando il WebGL è pronto il canvas lo sostituisce (identico, 300 ms)
   e le foglie **cadono** (1,2 s, CD §4.2 schermata 1). Senza WebGL: fermi
   immagine delle figure (riposo, modo 1, 2, 5) con dissolvenze. Nessun
   preloader.
8. **Audio Web Audio solo dopo un gesto**, in un chunk lazy di pochi KB.
   Nessun `AudioContext` esiste finché il visitatore non tocca "Suono" o
   "Senti la voce".
9. **CSS in file per sezione, prefisso `nod-`**, tutto sotto `.nod-root`.
   Stato lento in uno store con `useSyncExternalStore`; valori caldi in un
   oggetto mutabile letto dal ticker, mai nello stato React.

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json`)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` |
| `three` | `0.160.1` | patch della 0.160 del sito. Import **sempre per nome** (`import { Mesh } from 'three'`), mai `import * as THREE` |

### 1.2 Dev

| Pacchetto | Versione |
|---|---|
| `vite` | `5.4.21` |
| `@vitejs/plugin-react` | `4.7.0` |
| `typescript` | `5.6.3` |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` |
| `@types/three` | `0.160.0` |
| `@types/node` | `22.20.4` (per `vite.config.ts` e `scripts/`) |
| `eslint`, `@eslint/js` | `9.39.5` |
| `typescript-eslint` | `8.70.1` |
| `eslint-plugin-react-hooks` | `5.2.0` |
| `eslint-plugin-react-refresh` | `0.4.26` |
| `globals` | `15.15.0` |

**Non installati di proposito**: `@react-three/fiber`, `@react-three/drei`
(§2.1), `lenis` (scroll nativo, CD §4.2: "niente Lenis obbligatorio"; §2.2),
`gsap` (§2.2), Tailwind, librerie di stato, `@fontsource`, librerie di icone
(l'unica icona, l'altoparlante, la ridisegna o copia con licenza il
vector-artist), librerie audio (Tone.js ecc.: bastano oscillatore, filtro e
guadagno nativi), `vite-plugin-glsl` (shader con `?raw`, nativo). Playwright
per gli script si usa quello globale della sandbox (`/opt/pw-browsers`), non
entra nel `package.json`.

Se in ondata 3 qualcuno dimostra di aver bisogno di un pacchetto, lo chiede
nel suo doc; si aggiunge solo con motivazione e va detto nel riepilogo a Luca.

### 1.3 Font

Google Fonts, `<link>` iniettato al mount (`core/fonts.ts`) più
`preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`. URL di partenza
(l'art-director lo fissa in `styles/tokens.ts` come `FONT_CSS_URL`, può
restringere l'asse dei pesi a 300..600 come chiede il CD):

```
https://fonts.googleapis.com/css2?family=IM+Fell+DW+Pica&family=Spline+Sans:wght@300..600&display=swap
```

- Mai il corsivo di IM Fell (non va nemmeno richiesto: niente `ital` nell'URL).
- `FONT_DA_CARICARE` (tokens.ts) per `fontsReady()`: `['400 48px "IM Fell DW Pica"', '400 17px "Spline Sans"', '500 40px "Spline Sans"']`.
- Il WebGL **non disegna testo** (il righello, le cifre e i nomi dei modi sono
  DOM): non deve aspettare i font. Il caricamento del chunk GL aspetta
  comunque `fontsReady()` per non competere con i font nel percorso critico
  (§9.1).
- L'art-director definisce in `tokens.css` i `@font-face` di ripiego locali
  (Georgia per IM Fell, Arial/Helvetica per Spline Sans) con `size-adjust`,
  `ascent-override`, `descent-override` tarati, per tenere il CLS al cambio
  font sotto 0,02.

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json`.
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `jsx: react-jsx`, `moduleResolution: bundler`,
  `types: ["vite/client"]`.
- `tsconfig.node.json`: `vite.config.ts` e `scripts/**/*.mjs` (con `checkJs`
  e JSDoc per i tipi, così gli script sono controllati senza compilarli).
- Target build `es2020`. `manualChunks`: `three` in un chunk suo, `react` +
  `react-dom` + `scheduler` + router in un altro.
- `assetsInlineLimit: 0` per `.bin` e `.webp` (un fermo immagine inlineato in
  base64 finirebbe nel JS del concept): si imposta con la funzione
  `assetsInlineLimit(file)` di Vite 5 che restituisce `false` per `.bin`,
  `.webp`, `.jpg` e lascia il default agli SVG piccoli.
- Dev server **porta 9190** `strictPort`, preview **9190** `strictPort`
  (non girano mai insieme nella stessa ondata; porte degli agent in §11).

---

## 2. Scelte motivate

### 2.1 three puro invece di R3F, e perché three e non WebGL nudo

Build di prova (Vite 5.4.21, es2020, tree shaking attivo) con gli import
della scena: **112,8 KB gz** per three. Più il codice della scena, della
simulazione e degli shader (stima 14-22 KB gz) il chunk WebGL arriva a
**~130-135 KB gz**, sotto il budget di 160. R3F (come misurato nel concept 18)
aggiunge ~43 KB gz di reconciler e annulla il tree shaking di three: fuori
budget e senza vantaggi, perché qui non c'è grafo di scena da gestire in JSX.

WebGL nudo peserebbe 10 KB invece di 113, ma il CD (§4.10) chiede three
0.160, three è già nel sito (lo usa il Concept 1, stessa versione: nel sito
il chunk è condiviso e spesso già in cache), e three ci dà gratis la gestione
di perdita/ripristino del contesto, `setPixelRatio`, attributi istanziati in
WebGL1 e WebGL2 e la pulizia delle risorse. Si resta su three.

### 2.2 Niente GSAP, niente lenis

Movimenti ammessi dal CD (§4.10, motion-designer): caduta iniziale delle
foglie, migrazione delle foglie, spostamento dei cuscinetti, dissolvenze dei
testi al cambio modo, riduzione del riquadro della tavola su mobile.

| Movimento | Come si fa |
|---|---|
| Caduta iniziale (1,2 s, scala 0,9 → 1 + dissolvenza per foglia, sfasate) | nella simulazione: ogni foglia ha un `t0` di comparsa; il vertex shader legge `uTempo` e scala/opacità per istanza. Una volta sola |
| Migrazione | simulazione CPU (`webgl/sim/foglie.ts`) avanzata nella fase `update` del ticker |
| Cuscinetti (dissolvenza lenta sui nodi del modo nuovo) | due posizioni per cuscinetto e un `mix` 0 → 1 nel ticker con l'easing del motion-designer; uniform |
| Dissolvenze dei testi (200 ms) e del nome del modo (300 ms) | transizioni CSS di `opacity` con le curve di `motion/easing.ts` (esportate anche come stringhe `cubic-bezier`) |
| Riquadro della tavola su mobile 54 % → 34 % | valore caldo `runtime.palco` derivato dallo scroll, scritto come variabile CSS nella fase `write` e applicato con `transform` (niente cambi di altezza nel flusso, niente CLS, §5.3) |
| Cursore del righello | `transform` scritto nella fase `write`, lerp normalizzato su `dt` |

Niente timeline, niente pin di ScrollTrigger (il pin è `position: sticky` o
`fixed`), niente scroll liscio: il CD vuole lo scroll vero e il righello deve
poter scrivere la posizione di scroll in modo esatto e sincrono (con lenis
bisognerebbe passare da `lenis.scrollTo(…, { immediate: true })` e tenere
due verità allineate). Lo scroll verso un'ancora (indice, "La voce che
vorresti", scorciatoie dei modi, magnetismo al rilascio) usa
`window.scrollTo({ behavior: 'smooth' })` fuori dal reduced motion e
`behavior: 'auto'` dentro.

### 2.3 Un solo ciclo rAF

`core/ticker.ts` (scaffold, **stessa API del pilota**, `scaffold-engineer.md`
§4.1, senza lenis). Ordine di ogni frame:

1. `runtime.scrollY = window.scrollY` (una sola lettura);
2. **read**: rimisura delle stazioni solo se invalidate (§6.3); il trascinamento
   del righello e del piano del suono legge le coordinate del puntatore
   **salvate dagli handler** (nessuna lettura di layout qui oltre alle
   stazioni invalidate);
3. **update**: percorso → frequenza (`risonanza/frequenza.ts`) → ampiezze dei
   tre modi → `runtime.palco` → parametri dell'altoparlante (se acceso) →
   **passo della simulazione** (funzione registrata dal GL) → cambi di
   pianerottolo nello store (solo quando cambiano);
4. **write**: DOM (cursore e valore del righello, `--nod-palco`, variabili sulle
   foglie `data-nodvar`), e **`window.scrollTo` del trascinamento del
   righello** (una volta per frame al massimo);
5. **render**: WebGL solo se `runtime.dirty`.

Nessun altro `requestAnimationFrame`, `setInterval` per animare o listener
`scroll` nel concept (l'unico listener `scroll`, passivo, sta in
`core/scroll.ts` e fa solo `ticker.wake()`). Il ticker dorme quando niente si
muove e si ferma con la scheda nascosta. L'audio non usa il ticker per il suo
tempo (usa `AudioParam.setTargetAtTime`), il ticker gli passa solo la
frequenza corrente.

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo standalone, non si porta. **[P]** si porta nel sito.
Tra parentesi il proprietario (§4).

```
concepts/19-nodi/
├─ DESIGN.md                                   [S*] (art-director)  *resta nel repo claude250 come doc
├─ docs/                                       [S]  un .md per agent
├─ qa/                                         [S]  screenshot QA (ignorati da git)
├─ scripts/                                    [S]  mai nel bundle
│  ├─ modi/
│  │  ├─ calcola-modi.mjs                      (webgl-artist) Rayleigh-Ritz su piastra ortotropa libera sul contorno vero → webgl/dati/modi.bin + modi-meta.ts
│  │  ├─ contorno.mjs                          (webgl-artist) legge assets/svg/tavola.svg → maschera a griglia (punto dentro/fuori, effe comprese)
│  │  ├─ algebra.mjs                           (webgl-artist) autovalori generalizzati simmetrici (Cholesky + Jacobi), niente dipendenze
│  │  └─ controllo-nodi.mjs                    (webgl-artist) PNG delle linee nodali dei 3 modi scelti per il doc (in qa/, non nel bundle)
│  └─ fermi.mjs                                (webgl-artist in ondata 2; shader-engineer lo rilancia in ondata 3) Playwright + SwiftShader su ?fermo=… → assets/fermi/*.webp
├─ package.json  package-lock.json             [S]  (scaffold)
├─ vite.config.ts  tsconfig*.json  eslint.config.js  .gitignore   [S] (scaffold)
├─ index.html                                  [S]  (scaffold) lang="it", fondo abete inline, preconnect font
├─ public/favicon.svg                          [S]  (vector-artist)
└─ src/
   ├─ main.tsx  App.tsx  vite-env.d.ts         [S]  (scaffold) /concept-19 lazy; / e * → redirect
   ├─ lib/analytics.ts                         [S]  (scaffold) copia dello stub del pilota (stesso TrackEvent)
   ├─ components/ConceptBackButton.tsx         [S]  (scaffold) copia fedele di concepts/10-torchio/src/components/ConceptBackButton.tsx
   └─ pages/
      ├─ Concept19.tsx                         [P]  (scaffold) export default function Concept19() { return <Nodi/> }
      └─ concepts/nodi/                        [P]  TUTTO il concept
         ├─ index.ts                           (scaffold) export { default } from './Radice'
         ├─ Radice.tsx                         (scaffold) .nod-root, font, ticker, stazioni, store, griglia della scena, GL lazy, aria-live
         │
         ├─ core/                              (scaffold)
         │  ├─ ticker.ts                       unico rAF, fasi read/update/write/render (§2.3)
         │  ├─ scroll.ts                       listener scroll passivo → ticker.wake(); vaiAScroll(y, liscio?), vaiAllAncora(id)
         │  ├─ capabilities.ts                 detectWebGL(opz), prefersReducedMotion(), ascoltaReducedMotion(), isCoarsePointer(), saveData(), dispositivoLento(), leggiForzaturaGL()
         │  ├─ fonts.ts                        injectFonts(), fontsReady()
         │  ├─ viewport.ts                     runtime.viewport su resize/visualViewport; layout 'largo' | 'stretto'
         │  ├─ links.ts                        LAB_URL, CICERILAB_URL, MAPS_URL, TELEFONO_URL, EMAIL_URL
         │  ├─ glLoader.ts                     decidiGL() + caricaGL(): import('../webgl')
         │  └─ invioSimulato.ts                inviaSimulato(segnale): ~1,2 s, fallisce con ?invio=ko (usato da Voce e Riparazioni)
         │
         ├─ state/                             (scaffold)
         │  ├─ store.ts                        store lento + useNodi(selector) + azioni + selettori (§6.1)
         │  ├─ runtime.ts                      valori caldi mutabili (§6.2)
         │  └─ persist.ts                      local/sessionStorage in try/catch
         │
         ├─ risonanza/                         (scaffold) il legame scroll → frequenza → ampiezze
         │  ├─ modi.ts                         costanti di bottega (92/168/348 Hz, banda, magnete, scala 60-420), ampiezza(), modoInRisonanza(), voce → Hz
         │  ├─ stazioni.ts                     registro delle sezioni-stazione e loro misure in coordinate documento (§6.3)
         │  ├─ useStazione.ts                  hook con cui ogni sezione si dichiara stazione
         │  └─ frequenza.ts                    fn di update: scrollY → percorso → runtime.hz/ampiezze/palco; pianerottolo → store
         │
         ├─ motion/                            (motion-designer)
         │  ├─ easing.ts                       curve custom: funzioni + stringhe cubic-bezier per CSS
         │  ├─ percorso.ts                     hzDaPercorso, percorsoDaHz (inversa), palcoDaPercorso (§6.3)
         │  ├─ molle.ts                        lerp normalizzato su dt; inseguimento del cursore del righello
         │  ├─ choreography.ts                 durate e soglie: caduta 1200, formazione 2500-4000, cuscinetti, dissolvenze 200/300/400
         │  └─ useMotionVars.ts                scrive variabili CSS sulle foglie data-nodvar, solo quando cambiano
         │
         ├─ interaction/                       (interaction-designer)
         │  ├─ useRighello.ts                  trascinamento del cursore (mouse, dito, penna) → scroll; magnetismo al rilascio; tastiera da slider
         │  ├─ usePianoVoce.ts                 trascinamento della foglia sul piano del suono, frecce sulla foglia a fuoco, sincronia con i due range
         │  ├─ useMenuMobile.ts                apertura/chiusura del menu dal marchio, Esc, trappola del fuoco, fuoco di ritorno
         │  └─ interaction.css                 hover, :focus-visible (2 px ebano, offset 2 px), stati attivi, touch-action
         │
         ├─ audio/                             (interaction-designer) chunk lazy, import() solo al primo gesto
         │  ├─ index.ts                        export { accendiAltoparlante, spegniAltoparlante, suonaNotaEsempio }
         │  ├─ contesto.ts                     AudioContext unico creato al primo gesto, resume/suspend, chiusura allo smontaggio
         │  ├─ altoparlante.ts                 sinusoide alla frequenza del righello, guadagno ≤ 0,04, attacco/rilascio 150-200 ms, -50 % fuori risonanza, spegnimenti automatici
         │  └─ notaEsempio.ts                  nota d'esempio 1,8 s: La 440 / Do 131 / Do 65, filtro dal punto scuro↔brillante, attacco dal punto morbido↔pronto
         │
         ├─ condivisi/                         (webgl-artist) dati puri usati sia dal GL sia dal DOM, niente three
         │  └─ foglie.ts                       FORME_FOGLIA: 4 tracciati normalizzati (atlante del GL e foglia del piano del suono)
         │
         ├─ webgl/
         │  ├─ shaders/                        (webgl-artist)
         │  │  ├─ tavola.vert.glsl  tavola.frag.glsl        abete in pianta: vena procedurale, giunta, contorno ebano, ombra sul banco
         │  │  ├─ foglia.vert.glsl  foglia.frag.glsl        istanze: posizione, rotazione, forma, tono, comparsa, tremolio liscio ≤ 3 cambi/s
         │  │  └─ cuscinetto.vert.glsl  cuscinetto.frag.glsl 4 dischi di gommapiuma, dissolvenza tra due posizioni
         │  ├─ materiali.ts                    (webgl-artist) creaMaterialeTavola/Foglie/Cuscinetti, layout delle uniform
         │  ├─ maschera.ts                     (webgl-artist) contorno SVG → canvas 2D: maschera, bordo, ombra sfocata → CanvasTexture
         │  ├─ atlanteFoglie.ts                (webgl-artist) FORME_FOGLIA → canvas 2D 256×64 → CanvasTexture
         │  ├─ sim/                            (webgl-artist) TypeScript puro, niente three, niente DOM
         │  │  ├─ campi.ts                     decodifica modi.bin; campiona w e ∇|w| (bilineare); campo del modo 5 scalato per la voce
         │  │  ├─ foglie.ts                    stato SoA (Float32Array), seme, sparpaglia(), passo(dt, ingressi), ferme(), avanzaFinoAFermo()
         │  │  └─ cuscinetti.ts                posizioni dei 4 cuscinetti per modo (da modi-meta) e per il riposo
         │  ├─ dati/                           (webgl-artist) generati da scripts/modi/
         │  │  ├─ modi.bin                     campi dei modi 1, 2, 5 + maschera (formato §8.2)
         │  │  └─ modi-meta.ts                 dimensioni griglia, scala di quantizzazione, cuscinetti, centro dell'anello, controllo topologia
         │  ├─ TavolaGL.ts                     (shader-engineer) renderer, resize, DPR, perdita contesto, render on demand, registrazione nel ticker
         │  ├─ qualita.ts                      (shader-engineer) DPR adattivo, spegnimento se lento
         │  ├─ dissolvenza.ts                  (shader-engineer) dissolvenza incrociata 400 ms tra due disposizioni ferme (reduced motion)
         │  ├─ fermo.ts                        (shader-engineer) modalità ?fermo=… per scripts/fermi.mjs
         │  ├─ TavolaCanvas.tsx                (shader-engineer) componente che monta TavolaGL nel palco
         │  └─ index.ts                        (shader-engineer; stub dello scaffold) export default TavolaCanvas
         │
         ├─ content/                           (copywriter)
         │  ├─ testi.ts                        tutti i testi visibili, aria-label, alt, meta, stati, descrizioni aria-live dei modi, frasi delle 5 zone
         │  └─ listino.ts                      strumenti (prezzi "da", mesi), lista d'attesa per strumento, riparazioni "da", sabati (fascia oraria) (DATI, tipi §6.4)
         │
         ├─ styles/
         │  ├─ tokens.css                      (art-director) variabili --nod-*, @font-face di ripiego con metriche
         │  ├─ tokens.ts                       (art-director) PALETTE (hex + rgb lineare per three), FONT_CSS_URL, FONT_DA_CARICARE, scala tipografica
         │  ├─ base.css                        (scaffold) reset scoped, tipografia base, .nod-sr, .nod-salto
         │  └─ layout.css                      (scaffold) .nod-scena (griglia a tre colonne / colonna unica), .nod-palco, .nod-regolo, .nod-stazione, livelli
         │
         ├─ assets/
         │  ├─ svg/                            (vector-artist) tavola.svg (contorno + effe, in mm), altoparlante.svg, uscita.svg, marchio (se serve) + index.ts
         │  ├─ foto/                           (photo-editor) massimo 4 foto, *.webp in 2 misure + index.ts (url, larghezze, alt-chiave, autore, URL Unsplash)
         │  └─ fermi/                          (webgl-artist, poi shader-engineer) {vuota,riposo,modo1,modo2,modo5}-{l,p}.webp + index.ts
         │
         └─ sections/
            ├─ Apertura/     Apertura.tsx apertura.css Testata.tsx testata.css Menu.tsx      (section-builder-apertura)
            ├─ Legni/        Legni.tsx legni.css                                             (section-builder-legni)
            ├─ Costruire/    Costruire.tsx costruire.css                                     (section-builder-costruire)
            ├─ Voce/         Voce.tsx voce.css PianoSuono.tsx Strumento.tsx Contatto.tsx
            │                ListaAttesa.tsx Esito.tsx validazione.ts                        (section-builder-voce)
            ├─ Riparazioni/  Riparazioni.tsx riparazioni.css Sabati.tsx sabati.ts            (section-builder-riparazioni)
            ├─ Bottega/      Bottega.tsx bottega.css                                         (section-builder-bottega)
            ├─ Piede/        Piede.tsx piede.css                                             (section-builder-bottega)
            ├─ Palco/        Palco.tsx palco.css Poster.tsx Descrizione.tsx                  (section-builder-palco)
            └─ Righello/     Righello.tsx righello.css Scala.tsx Indice.tsx Scorciatoie.tsx
                             InterruttoreSuono.tsx RimettiFoglie.tsx                         (section-builder-righello)
```

Struttura montata da `Radice.tsx`:

```
.nod-root  data-gl data-motion data-layout data-modo data-suono
  link di salto ("Salta al contenuto", "Vai a La voce che vorresti")
  <ConceptBackButton/>
  <Testata/>                      marchio NODI in alto a destra, menu a comparsa su stretto (livello 10)
  <div class="nod-scena">         griglia: testo | palco | regolo  (largo) · colonna unica (stretto)
    <Palco Canvas={ComponenteGL}/> sticky (largo) / fixed in alto (stretto): poster, fermi, canvas, descrizione aria-live
    <Righello/>                    sticky a destra (largo) / fixed sotto il palco (stretto): scala, indice, scorciatoie, suono, "Rimetti le foglie"
    <main id="contenuto" class="nod-testo">
      <Apertura/> <Legni/> <Costruire/> <Voce/> <Riparazioni/> <Bottega/>
    </main>
    <Piede/>                       nella colonna del testo (la tavola resta ferma fino in fondo, CD §4.2)
  </div>
```

Id delle ancore (stabili, li usano indice, scorciatoie, bottone "La voce che
vorresti" e hash): `inizio`, `legni`, `costruire`, `voce`, `riparazioni`,
`bottega`, `piede`. Se l'ux-architect rinomina le schermate cambiano testi e
ordine, non cartelle né id (l'orchestratore riallinea i nomi degli agent:
section-builder-`<cartella in kebab-case>`).

### 3.1 Regole di porting (valgono da subito)

- Dentro `nodi/` nessun import fuori dalla cartella tranne `@/lib/analytics`,
  `@/components/ConceptBackButton` (solo in `Radice.tsx`) e i pacchetti npm.
- **Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `navigator`, `AudioContext` a livello di modulo**: solo in effetti, handler
  o funzioni chiamate da effetti. Il sito fa prerender: `Radice` deve rendere
  senza browser (poster, testi e righello a "0 Hz" sì; ticker, stazioni, GL e
  audio partono solo al mount). I sabati "prossimi quattro" si calcolano al
  mount, non nel render del prerender (§6.4).
- Asset con i suffissi nativi di Vite (`?url`, `?raw`), mai da `public/`
  (tranne il favicon standalone). `import modiUrl from './dati/modi.bin?url'`
  e `fetch` + `arrayBuffer()`.
- Nessun hex fuori da `styles/tokens.*`; il GL prende i colori da
  `styles/tokens.ts` (rgb lineare).
- `webgl/sim/*` e `condivisi/*` non importano three né toccano il DOM
  (restano provabili fuori dal browser); gli script offline però non li
  importano: i fermi si fanno nel browser (§8.4, §9.5).

---

## 4. File di competenza esclusiva

Ogni file ha un solo proprietario. Tutti possono leggere e importare tutto.
Chi ha bisogno di una modifica altrui la scrive in "Richieste ad altri agent"
del proprio doc. Lo scaffold crea gli stub necessari al build verde; alla fine
dello scaffold la proprietà passa agli agent sotto e lo scaffold non li tocca
più. Il prefisso di tutti i percorsi di `src/` è `src/pages/concepts/nodi/`.

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md`, `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts` | CSS di sezione, `base.css`, `layout.css`, `interaction.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/*` (5 file di §3) | ticker (usa la sua API), `risonanza/*`, CSS di sezione, la fisica delle foglie (`webgl/sim/*`) |
| **webgl-artist** | `docs/webgl-artist.md`, `webgl/shaders/*`, `webgl/materiali.ts`, `webgl/maschera.ts`, `webgl/atlanteFoglie.ts`, `webgl/sim/*`, `webgl/dati/*`, `condivisi/foglie.ts`, `scripts/modi/*`, `scripts/fermi.mjs` (prima versione), `assets/fermi/*` (prima versione) | i file dello shader-engineer in `webgl/`; il contorno SVG (è del vector-artist: lo legge) |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*`, `audio/*` | niente cursore custom, niente preloader, niente particelle che seguono il cursore, niente suono al passaggio del mouse (CD §4.7) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/listino.ts` | nessun testo nei componenti; niente em-dash, niente "01 ·" |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*`, `public/favicon.svg` | un solo disegno (la tavola con le effe, CD §4.10) più le icone di servizio; niente figure umane, niente violinisti, niente ornamenti |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*` | fermi immagine; se le foto giuste sono meno di due, piano B del CD §4.6 (al massimo una macro di abete) e `index.ts` lo dichiara |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file [S] tranne `DESIGN.md`, `docs/*` altrui, `public/favicon.svg`, `scripts/`; `src/pages/Concept19.tsx`; `nodi/index.ts`, `Radice.tsx`; `core/*`; `state/*`; `risonanza/*`; `styles/base.css`, `styles/layout.css`; stub di `sections/*/*.tsx` e `webgl/index.ts` |
| **section-builder-apertura** | `sections/Apertura/*` (prima schermata + testata con marchio e menu mobile), `docs/section-builder-apertura.md` |
| **section-builder-legni** | `sections/Legni/*`, `docs/section-builder-legni.md` |
| **section-builder-costruire** | `sections/Costruire/*`, `docs/section-builder-costruire.md` |
| **section-builder-voce** | `sections/Voce/*` (piano del suono, strumento, contatto, lista d'attesa, tutti gli stati della prenotazione, validazione), `docs/section-builder-voce.md` |
| **section-builder-riparazioni** | `sections/Riparazioni/*` (il sabato di bottega, calcolo dei prossimi quattro sabati, stati), `docs/section-builder-riparazioni.md` |
| **section-builder-bottega** | `sections/Bottega/*`, `sections/Piede/*`, `docs/section-builder-bottega.md` |
| **section-builder-palco** | `sections/Palco/*` (riquadro della tavola: poster, fermi del fallback e loro dissolvenze, slot del canvas, descrizione `aria-live`, riduzione su stretto), `docs/section-builder-palco.md` |
| **section-builder-righello** | `sections/Righello/*` (scala verticale/orizzontale, cursore, valore in vernice, nome del modo, tacche trovate e "la tua voce", indice, scorciatoie modo 1/2/5, interruttore Suono con nota, "Rimetti le foglie"), `docs/section-builder-righello.md` |
| **shader-engineer** (in parallelo ai section-builder) | `webgl/TavolaGL.ts`, `qualita.ts`, `dissolvenza.ts`, `fermo.ts`, `TavolaCanvas.tsx`, `index.ts`, `scripts/fermi.mjs` e `assets/fermi/*` (versione finale), `docs/shader-engineer.md` |

Note:
- Sono **8 section-builder** (6 schermate di contenuto con il piede insieme
  alla bottega, più i due trasversali **palco** e **righello**). I nomi
  vengono dal CD §4.2; la lista "Sezioni da costruire" dell'ux-architect si
  mappa su queste cartelle (vedi "Richieste ad altri agent").
- `Palco` riceve il componente GL come prop (`Canvas: ComponentType | null`)
  da `Radice`, che gestisce il caricamento lazy: il builder del palco non
  importa mai `webgl/` (resterebbe nel percorso critico).
- La logica di trascinamento è dell'interaction-designer
  (`useRighello`, `usePianoVoce`); i componenti che la usano sono dei
  builder righello e voce. Il markup e il CSS sono dei builder, gli hook
  restituiscono solo handler, ref e stato.
- `sections/Voce/validazione.ts`: funzioni pure (email o telefono, uno dei due
  basta; email con chiocciola), senza React. Invio con `inviaSimulato` di
  `core/invioSimulato.ts`.
- `sections/Riparazioni/sabati.ts`: funzione pura
  `prossimiSabati(oggi: Date, n = 4)` e formattazione "sabato 3 ottobre"
  con `Intl.DateTimeFormat('it-IT')`; chiamata al mount, non nel render
  iniziale (prerender).

---

## 5. Convenzioni CSS e layout

### 5.1 Regole

- **Un `.css` per sezione** importato dal componente. Niente Tailwind, niente
  CSS modules.
- **Prefisso `nod-`**, BEM leggero: `nod-<sezione>`, `nod-<sezione>__<el>`,
  `nod-<sezione>--<variante>` (es. `nod-righello__cursore`,
  `nod-voce__foglia--trascinata`). Classi condivise dello scaffold:
  `nod-root`, `nod-scena`, `nod-testo`, `nod-palco`, `nod-regolo`,
  `nod-stazione`, `nod-gl`, `nod-sr`, `nod-salto`.
- **Ogni selettore inizia con `.nod-root`.** Nessun selettore nudo su `html`,
  `body`, `:root`, `*` (unica eccezione ammessa: `html:has(.nod-root)` per
  `scroll-padding` e `scroll-behavior: auto`, come nel pilota). Il fondo si dà
  a `.nod-root`; `Radice` imposta il fondo di `html/body` inline (abete) e lo
  ripristina allo smontaggio.
- **Variabili** `--nod-*` definite solo dall'art-director (`tokens.css`);
  locali di sezione `--nod-<sezione>-*`. Il motion-designer e il ticker
  scrivono variabili solo sugli elementi foglia marcati `data-nodvar`.
- **Attributi di stato su `.nod-root`** (li scrive solo `Radice.tsx`):
  `data-gl="pending|on|off"`, `data-motion="full|reduced"`,
  `data-layout="largo|stretto"`, `data-modo="riposo|1|2|5|ferma|salita"`,
  `data-suono="on|off"`, `data-menu="aperto"` (solo se aperto).
- **Livelli** (token dell'art-director): palco 0, testo 1, regolo 2, testata
  10, menu mobile 11. Il `ConceptBackButton` sta sopra a tutto (z-index del
  sito): nessun fisso nella sua zona (in alto a sinistra ~230×44 px da 640 px
  in su; in basso a sinistra ~210×44 px sotto: margine inferiore sinistro di
  72 px per tutto ciò che è fisso o in fondo a un contenuto).
- `.nod-root`, `.nod-scena` e `.nod-testo` hanno **nessun** `transform`,
  `filter`, `contain`, `container-type`, `overflow` diverso da `visible`:
  sticky e fixed devono restare agganciati alla finestra.
- Unità: `rem` per testo, `clamp()` per misure fluide, `svh`/`dvh` per altezze
  a schermo (mai `100vh` puro). Raggio 0 ovunque (CD §4.1) tranne cuscinetti
  (nel GL) e foglia del piano del suono.
- `font-variant-numeric: tabular-nums` su tutte le cifre (righello, prezzi,
  lista d'attesa): Spline Sans ha `tnum` (verificato).
- **Nessuna transizione di colore di superfici grandi**: al massimo un cambio
  ogni 500 ms e sempre in dissolvenza (regola comune della matrice).

### 5.2 Layout largo (da 1100 px e rapporto ≥ 5:4)

`data-layout="largo"` quando `(min-width: 1100px) and (min-aspect-ratio: 5/4)`
(deciso in `core/viewport.ts` con lo stesso `matchMedia` usato dal CSS, così
JS e CSS non divergono).

- `.nod-scena` è una griglia `testo | palco | regolo`. Il palco è centrato:
  le due colonne laterali hanno la stessa larghezza, l'asimmetria la fa il
  contenuto (testo in basso a sinistra, righello a tutta altezza a destra).
- `.nod-palco` è un elemento della griglia alto quanto tutta la scena, con
  dentro un figlio `position: sticky; top: 0; height: 100svh` che centra il
  riquadro della tavola. Riquadro: altezza `min(86svh, 1000px)`,
  `aspect-ratio` = quello del riquadro della tavola (`TAVOLA.riquadro` di
  `assets/svg/index.ts`, circa 240 × 388 mm con l'ombra).
- `.nod-regolo` idem, sticky a tutta altezza; il righello verticale è alto
  quanto il riquadro della tavola.
- La testata (marchio) è fissa in alto a destra e non entra nella griglia.

### 5.3 Layout stretto (tutto il resto, 375 pensato per primo)

- `.nod-palco` è `position: fixed; top: 0` a tutta larghezza, alto
  `54svh` (valore massimo), fondo abete opaco: il testo gli passa **sotto**.
  Il canvas e il poster sono dimensionati **una volta** su 54svh; la riduzione
  a 34svh è `transform: scale(var(--nod-palco))` sul riquadro della tavola
  (origine in alto al centro) e `transform: scaleY(…)` sul fondo del palco, con
  `--nod-palco` in [0,63; 1] scritto dal ticker (fase `write`) da
  `runtime.palco`. Solo compositor: niente ridimensionamento del canvas,
  niente reflow, niente CLS.
- `.nod-regolo` è fisso subito sotto il palco (alto 56 px) e segue la stessa
  riduzione con un `translateY`.
- `.nod-testo` ha `padding-top: calc(54svh + 56px + 16px)` e
  `padding-bottom` ≥ 72 px (bottone del sito).
- **Fuoco mai coperto** (WCAG 2.4.11): `html:has(.nod-root)` riceve
  `scroll-padding-top: calc(54svh + 72px)` su stretto e
  `scroll-padding-bottom: 72px`; sul largo solo 16 px. Il builder della voce
  aggiunge `scroll-margin` ai campi se serve.
- `touch-action`: `pan-y` sulla tavola (la pagina scorre anche partendo dal
  dito sulla tavola), `none` sul cursore del righello orizzontale e sulla
  foglia del piano del suono (CD §4.9); mai `none` su superfici grandi.

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno senza librerie, letto con `useSyncExternalStore` e selettore
(stessa forma del pilota, `scaffold-engineer.md` §4.8).

```ts
import type { Strumento } from '../content/listino';

export type IdStazione = 'inizio' | 'legni' | 'costruire' | 'voce' | 'riparazioni' | 'bottega';
export type IdSezione = IdStazione | 'piede';
export type Modo = 1 | 2 | 5;
export type StatoTavola = 'riposo' | Modo | 'ferma' | 'salita';   // 'salita' = tra due pianerottoli
export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
export type ZonaVoce = 'scura-morbida' | 'scura-pronta' | 'brillante-morbida' | 'brillante-pronta' | 'equilibrata';

export interface Voce {
  strumento: Strumento;               // 'violino' | 'viola' | 'violoncello'
  x: number;                          // 0 scuro … 1 brillante
  y: number;                          // 0 morbido … 1 pronto
}
export interface Richiesta {          // dopo il successo, localStorage 'nodi:richiesta'
  numero: number;                     // posto in lista (da listino.ts, fisso per strumento)
  strumento: Strumento;
  zona: ZonaVoce;
  hz: number;                         // intero, per la tacca "la tua voce, 352 Hz"
}
export interface Sabato { iso: string /* 'YYYY-MM-DD' */ }

export interface NodiState {
  tavola: StatoTavola;                // pianerottolo corrente (data-modo, aria-live, nome del modo sul righello)
  ultimoModo: Modo | null;            // ultima figura formata (resta dopo lo spegnimento: 'ferma' mostra ancora l'anello)
  sezione: IdSezione;                 // sezione alla linea di lettura (aria-current nell'indice)
  trovati: Record<Modo, boolean>;     // tacche dei modi trovati (localStorage 'nodi:trovati')
  suono: boolean;                     // altoparlante acceso
  voce: Voce;                         // sessionStorage 'nodi:voce' (senza contatti)
  invioVoce: StatoInvio;
  richiesta: Richiesta | null;
  sabato: Sabato | null;              // sabato scelto per la riparazione
  invioSabato: StatoInvio;
  menuAperto: boolean;                // menu a comparsa su stretto
  gl: 'pending' | 'on' | 'off';
  glMotivo: string | null;
  reducedMotion: boolean;
  simulaErroreInvio: boolean;         // ?invio=ko
}

store.get(); store.set(patch); store.subscribe(fn);
useNodi<T>(selector, isEqual?): T;
```

Azioni (le sezioni chiamano queste, mai `store.set`):
`impostaTavola(stato)` e `impostaSezione(id)` (solo `risonanza/frequenza.ts`),
`segnaTrovato(modo)` (salva), `impostaSuono(acceso)`,
`impostaVoce(patch: Partial<Voce>)` (limitata a una scrittura per frame:
durante il trascinamento `usePianoVoce` scrive prima `runtime.voce` e chiama
`impostaVoce` al massimo una volta per frame nella fase `write`),
`impostaInvioVoce(stato)`, `confermaRichiesta(r)` (salva), `cambiaVoce()`
("Cambia la voce": `invioVoce` → `idle`, `richiesta` resta finché non si
rimanda), `scegliSabato(s | null)`, `impostaInvioSabato(stato)`,
`apriMenu(aperto)`, `impostaGL(gl, motivo?)` (solo `Radice` e
shader-engineer), `inizializzaStore({ search, reducedMotion })` (solo
`Radice`).

Selettori: `selZonaVoce(s)` (centro entro raggio 0,18 → `equilibrata`,
altrimenti il quadrante), `selHzVoce(s)` (= `hzDaVoce(s.voce.x)` di
`risonanza/modi.ts`, arrotondato), `selPostoInLista(s)` (da `LISTA` di
`content/listino.ts` per lo strumento), `selModoMostrato(s)` (`tavola` se è un
modo, altrimenti `ultimoModo`: serve al fallback e alla descrizione).

Regole: `tavola`, `ultimoModo`, `sezione` li scrive solo
`risonanza/frequenza.ts`; `gl` solo `Radice` e shader-engineer;
`reducedMotion` solo `Radice`. **Nome, email, telefono, nota e problema della
riparazione non entrano mai nello store né nella memoria**: stato locale di
`Contatto.tsx` e `Sabati.tsx`. Lo store si re-inizializza al mount di
`Radice` (navigare via e tornare nel sito vero non lascia stati sporchi).

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, mai in React state, letto e scritto nel ticker.

```ts
runtime.scrollY                          // px, scritto dal ticker prima di 'read'
runtime.viewport                         // { w, h, dpr, layout: 'largo' | 'stretto' }
runtime.percorso                         // continuo 0..6 (§6.3)
runtime.hz                               // { target: number | null; valore: number | null }  null = altoparlante spento (riposo, ferma)
runtime.ampiezze                         // Float32Array(3): risposta dei modi 1, 2, 5 in [0, 1] (lorentziane su hz.valore)
runtime.hzModo5                          // frequenza del modo 5 per la voce scelta (330..366), default 348
runtime.scalaAnello                      // da hzModo5 (§8.3), default 1
runtime.prontezza                        // 0..1 da voce.y: velocità di formazione e attacco della nota
runtime.voce                             // { x, y, trascinando: boolean }  scritto da usePianoVoce durante il trascinamento
runtime.palco                            // 1 … 0,63 (stretto: 54 % → 34 %), 1 sul largo
runtime.righello                         // { trascinando: boolean; hzPuntatore: number | null; cursore: number /* Hz mostrati, lerp */ }
runtime.foglie                           // { comando: 'nessuno' | 'sparpaglia' | 'ricomponi'; ferme: boolean; quante: number }
runtime.dirty; runtime.markDirty(); runtime.reset();
```

Chi scrive cosa: `risonanza/frequenza.ts` → `percorso`, `hz`, `ampiezze`,
`palco`, `hzModo5`, `scalaAnello`, `prontezza` (queste ultime tre dallo store
`voce` o da `runtime.voce` durante il trascinamento); `interaction/useRighello.ts`
→ `righello.trascinando`, `righello.hzPuntatore`; `motion/molle.ts` (chiamata
da `frequenza.ts`) → `righello.cursore`; `interaction/usePianoVoce.ts` →
`voce`; componenti "Rimetti le foglie" e invio della voce → `foglie.comando`
(la simulazione lo consuma e lo rimette a `'nessuno'`); `webgl/sim` →
`foglie.ferme`, `foglie.quante`; `core/viewport.ts` → `viewport`.

### 6.3 Stazioni, percorso e frequenza (scroll → Hz)

- Ogni schermata con effetto sulla tavola chiama `useStazione(ref, id)`. Il
  registro (`risonanza/stazioni.ts`) tiene per ognuna `top` e `altezza` in
  coordinate documento, rimisurate solo su `ResizeObserver`, resize (150 ms),
  `fonts.ready` e `invalidaStazioni()`. **Mai letture di layout durante lo
  scroll.**
- `percorso = i + t`: `i` indice della stazione che contiene la linea di
  lettura (55 % dell'altezza della finestra sul largo; sullo stretto, 55 %
  dello spazio **sotto** il regolo), `t` ∈ [0, 1) la frazione dentro di essa.
  Stazioni in ordine: 0 `inizio` (riposo), 1 `legni` (modo 1), 2 `costruire`
  (modo 2), 3 `voce` (modo 5), 4 `riparazioni` (ferma), 5 `bottega` (ferma).
- Il motion-designer fornisce in `motion/percorso.ts` funzioni **pure** e
  monotone:
  - `hzDaPercorso(p, hzModo5) → number | null`: pianerottolo nella prima
    parte di ogni stazione (circa una finestra e mezza, CD §4.2; lunghezza da
    ux), salita logaritmica nella parte finale verso il pianerottolo
    successivo. Valori: riposo `null` (a "0 Hz", altoparlante spento) →
    salita 60 → 92 → pianerottolo 92 → salita → 168 → salita → `hzModo5` →
    salita `hzModo5` → 420 nella prima metà della transizione verso
    riparazioni, poi `null` (spento) fino in fondo. Così **ogni valore del
    righello 60-420 corrisponde a un solo punto di scroll**.
  - `percorsoDaHz(hz, hzModo5) → number`: inversa (sui pianerottoli
    restituisce l'inizio del pianerottolo più un piccolo margine; `null` non
    si inverte).
  - `palcoDaPercorso(p) → number`: 1 sui pianerottoli, 0,63 dove si legge un
    contenuto lungo (prezzi, form) secondo ux; transizione continua.
- `risonanza/frequenza.ts` (scaffold) applica le funzioni, calcola
  `ampiezza(hz, modo)` per i tre modi e scrive il runtime; con reduced
  motion salta direttamente ai valori del pianerottolo (nessun valore
  intermedio della frequenza **mostrato**: il righello salta, le foglie
  fanno la dissolvenza incrociata del §9.3).
- `scrollDaHz(hz)` (esportata da `frequenza.ts`) = `percorsoDaHz` riportato
  in pixel con le misure delle stazioni. La usano righello (trascinamento,
  tastiera, magnetismo) e scorciatoie.
- Pianerottolo raggiunto → `store.tavola`, `ultimoModo`, `segnaTrovato` se è
  un modo, `data-modo` e annuncio `aria-live` (testo del copywriter, CD §4.8).
  Mai per ogni hertz.
- Costanti di `risonanza/modi.ts` (numeri del CD, fonte unica):

```ts
export const MODI = { 1: 92, 2: 168, 5: 348 } as const;     // Hz, tavola di esempio
export const HZ_MIN = 60, HZ_MAX = 420;                     // scala log del righello
export const BANDA = 8;                                     // ± Hz di banda utile (CD §2.2 regola 4)
export const MAGNETE = 6;                                   // ± Hz di aggancio al rilascio
export const VOCE_HZ = { min: 330, max: 366 } as const;     // modo 5 dalla voce scura → brillante
export function ampiezza(hz: number | null, f0: number, banda?: number): number;   // lorentziana normalizzata a 1 sul picco, 0 se hz null
export function modoInRisonanza(hz: number | null, hzModo5?: number): Modo | null; // entro BANDA
export function hzDaVoce(x: number): number;                // 330 + 36 x
export function scalaAnelloDaHz(hz5: number): number;       // 1 ± 0,04 (più scura = anello più largo); il webgl-artist può ritoccare il ±
export function magnete(hz: number, hzModo5?: number): number | null;             // picco entro MAGNETE, altrimenti null
```

### 6.4 Dati del mestiere: `content/listino.ts` (copywriter)

Tipi fissati qui, valori del copywriter (una sola fonte, lo store li
ri-esporta):

```ts
export type Strumento = 'violino' | 'viola' | 'violoncello';
export interface VoceListino {
  strumento: Strumento;
  prezzoDa: number;                 // euro, intero ("a partire da")
  mesi: { min: number; max: number };
  notaEsempio: { nome: string; hz: number };   // La 440, Do 131, Do 65 (CD §4.4)
}
export interface PostoInLista { numero: number; consegna: string }   // "primavera 2028"
export interface Riparazione { id: string; prezzoDa: number }        // nome e descrizione in testi.ts
export const STRUMENTI: readonly VoceListino[];
export const LISTA: Record<Strumento, PostoInLista>;
export const RIPARAZIONI: readonly Riparazione[];
export const SABATO = { dalle: '9:00', alle: '12:30', quanti: 4 } as const;
export const STRUMENTI_ANNO: number;                                 // piccolo e verosimile
```

`content/testi.ts` contiene anche: le frasi delle 5 zone (chiavi `ZonaVoce`),
le descrizioni `aria-live` di riposo, modo 1, 2, 5 e tavola ferma, gli
`aria-valuetext` del righello (funzione pura `valuetextRighello(hz, modo)`,
"168 hertz, modo 2, Costruire uno strumento"; a riposo "Altoparlante spento,
tavola a riposo"), le etichette dei due range accessibili, gli alt delle foto
e dei fermi immagine, `META` (title/description "Concept di Ciceri Lab").

---

## 7. Il righello e il piano del suono: contratti DOM

### 7.1 Righello (section-builder-righello + interaction-designer)

```ts
// interaction/useRighello.ts
export function useRighello(opz: { orientamento: 'verticale' | 'orizzontale' }): {
  refScala: RefObject<HTMLDivElement>;          // l'area trascinabile (misurata su resize, non durante il trascinamento)
  propsCursore: {                               // da spargere sul cursore: role=slider, aria-*, tabIndex, handler pointer/keydown
    role: 'slider'; tabIndex: 0; 'aria-valuemin': 60; 'aria-valuemax': 420;
    'aria-valuenow': number; 'aria-valuetext': string; 'aria-orientation': 'vertical' | 'horizontal';
    onPointerDown; onKeyDown;
  };
  refCursore: RefObject<HTMLElement>;           // il ticker scrive il transform qui (fase write)
  refValore: RefObject<HTMLElement>;            // il ticker scrive "168 Hz" qui (textContent, solo quando cambia l'intero)
};
```

- Trascinamento: `pointerdown` con `setPointerCapture`; `pointermove` salva
  solo `hzPuntatore` (dalla posizione relativa alla scala, misurata prima);
  nella fase `write` il ticker fa `window.scrollTo(0, scrollDaHz(hz))`.
  Magnetismo **solo al rilascio** (`magnete()`), con scroll liscio.
- Tastiera: frecce ±1 Hz, PagSu/PagGiù ±10 Hz, Inizio/Fine 60/420: ogni tasto
  → `scrollDaHz` con `behavior: 'auto'`.
- `aria-valuenow` e `aria-valuetext` si aggiornano in React solo sui
  pianerottoli e al rilascio (non 60 volte al secondo); durante il
  trascinamento il valore visibile lo scrive il ticker.
- Scala logaritmica: posizione = `log(hz/60) / log(420/60)`; sul largo 60 Hz
  in basso e 420 in alto.

### 7.2 Piano del suono (section-builder-voce + interaction-designer)

```ts
// interaction/usePianoVoce.ts
export function usePianoVoce(): {
  refPiano: RefObject<HTMLDivElement>;
  propsFoglia: { role: 'group' | undefined; tabIndex: 0; 'aria-label': string; onPointerDown; onKeyDown };
  refFoglia: RefObject<HTMLElement>;            // transform scritto nella fase write
  propsRangeX: InputHTMLAttributes<HTMLInputElement>;   // "Da scuro a brillante", 0..100
  propsRangeY: InputHTMLAttributes<HTMLInputElement>;   // "Da morbido a pronto", 0..100
};
```

- La foglia è disegnata con `FORME_FOGLIA[0]` di `condivisi/foglie.ts` come
  `<svg><path d=…></svg>` inline (28 px, bersaglio tattile 44×44).
- Trascinare **non fa mai suonare niente** (CD §4.4). La nota parte solo dal
  bottone "Senti la voce" (`suonaNotaEsempio({ strumento, x, y })`).
- Mentre si trascina: `runtime.voce` subito (la tavola rifà l'anello),
  `impostaVoce` al massimo una volta per frame (frase della zona, righello,
  range).

### 7.3 Audio (interaction-designer)

```ts
// audio/index.ts (chunk lazy: import('../../audio') al primo tocco)
export function accendiAltoparlante(): Promise<void>;    // crea/riprende il contesto; registra nel ticker una fn 'update' che segue runtime.hz
export function spegniAltoparlante(dissolvenzaMs?: number): void;
export function suonaNotaEsempio(v: { strumento: Strumento; x: number; y: number }): Promise<void>;
export function chiudiAudio(): void;                     // Radice allo smontaggio
```

Spegnimenti automatici (CD §4.3): `visibilitychange` nascosto, uscita dalle
stazioni dei modi (`tavola` diventa `ferma`), 20 s senza cambi di frequenza
(dissolvenza 1 s). Ognuno chiama `impostaSuono(false)`.

---

## 8. La scena WebGL e la simulazione

### 8.1 Oggetti e draw call

| Oggetto | Geometria | Materiale | Draw call |
|---|---|---|---|
| Tavola | un `PlaneGeometry` sul riquadro | `ShaderMaterial` (vena procedurale, giunta, maschera, contorno ebano 1 px a DPR 1, ombra tinta di tè al 18-22 %) | 1 |
| Cuscinetti | 4 istanze di un quad | cerchio pieno ebano al 25 %, `mix` tra posizione vecchia e nuova | 1 |
| Foglie | `InstancedBufferGeometry` (un quad) × N | atlante 4 forme, 2 toni, ombra minima (secondo campione spostato nel frammento) | 1 (+1 durante la dissolvenza incrociata del reduced motion) |

Camera ortografica sul riquadro in millimetri (nessuna prospettiva, CD
§4.7). Canvas **grande quanto il riquadro della tavola**, non a tutto schermo;
`alpha: true`, `premultipliedAlpha: true`: sotto c'è il fondo abete del CSS,
quindi il canvas combacia al pixel col poster e col fondo pagina.

Attributi delle foglie: **statici** (una volta: forma, tono, rotazione fissa,
fase del tremolio, `t0` di comparsa) e **dinamici** (x, y, ampiezza locale per
il tremolio: 3 float per foglia, `DynamicDrawUsage`, aggiornati solo nei
frame in cui la simulazione ha girato). Il tremolio è rumore liscio nel
vertex shader (`uTempo`, al massimo 3 cambi al secondo, ≤ 2 px, scalato
dall'ampiezza locale): niente tremolio frame per frame, niente cambi di
colore o luminosità delle foglie (CD §4.3).

### 8.2 Campi dei modi: formato di `webgl/dati/modi.bin`

- Griglia sul rettangolo che contiene il contorno (coordinate normalizzate
  u ∈ [0,1] sulla larghezza, v ∈ [0,1] sulla lunghezza, v = 0 al riccio
  della tavola, cioè in alto nella vista), **96 × 168** celle.
- Contenuto, in quest'ordine, senza intestazione (le dimensioni stanno in
  `modi-meta.ts`): tre campi `w` dei modi 1, 2, 5 in **Int8** normalizzati a
  ±127 sul massimo di `|w|` di ciascun modo dentro il contorno (3 × 16.128 B),
  poi la **maschera** a 1 bit per cella (dentro la tavola e fuori dalle effe),
  2.016 B. Totale **≈ 50 KB**, ≤ 60 KB: il file può arrivare non compresso
  (molti host non comprimono `application/octet-stream`).
- Se la precisione a 8 bit non basta vicino alle linee nodali (il
  webgl-artist lo verifica con `controllo-nodi.mjs`), alternativa ammessa:
  **Int16 su 64 × 112** con campionamento bicubico, stesso limite di 60 KB. Il
  formato scelto va scritto in `modi-meta.ts` (`formato: 'i8-96x168' |
  'i16-64x112'`), `campi.ts` li decodifica entrambi.
- `modi-meta.ts` (generato): dimensioni, formato, per ogni modo le 4
  posizioni dei cuscinetti sulle linee nodali (u, v), il centro dell'anello
  del modo 5 (per la scala della voce), la topologia verificata
  (`'croce' | 'x' | 'anello'`), la data e i parametri del calcolo
  (rapporto di rigidezza, spessore, grado dei polinomi). **Piano B del CD
  §2.2**: stesso formato, con `metodo: 'a-mano'` e la spiegazione nel doc.
- Il gradiente di `|w|` si calcola una volta al caricamento (differenze
  centrali) in `Float32Array` separati: la simulazione non fa `abs` né
  differenze a ogni passo.

### 8.3 Simulazione (`webgl/sim/foglie.ts`, webgl-artist)

```ts
export interface StatoFoglie {
  n: number;
  x: Float32Array; y: Float32Array;        // mm nel riquadro
  vx: Float32Array; vy: Float32Array;
  forma: Uint8Array; tono: Uint8Array; rot: Float32Array; fase: Float32Array; t0: Float32Array;
  seme: number;
}
export interface IngressiPasso {
  ampiezze: Float32Array;                  // runtime.ampiezze
  scalaAnello: number;                     // runtime.scalaAnello (solo modo 5)
  prontezza: number;                       // runtime.prontezza
}
export function creaFoglie(n: number, seme: number, campi: Campi): StatoFoglie;
export function sparpaglia(s: StatoFoglie, campi: Campi, seme?: number): void;   // uniforme dentro la maschera, fuori dalle effe
export function passo(s: StatoFoglie, campi: Campi, dt: number, i: IngressiPasso): boolean;  // true se qualcosa si è mosso oltre la soglia
export function ferme(s: StatoFoglie): boolean;
export function avanzaFinoAFermo(s: StatoFoglie, campi: Campi, i: IngressiPasso, maxPassi?: number): Generator<void, void>;  // a blocchi, per il reduced motion e i fermi
```

- Passo fisso 1/60 s (sotto-passi se `dt` è più lungo, al massimo 3), attrito
  alto, velocità limitata: nessuna foglia salta (CD §2.2 regola 5). Spinta
  ∝ ampiezza locale, discesa lungo `−∇|w|` verso `w ≈ 0` (regola 3). Fuori
  risonanza le ampiezze sono quasi 0 e **le foglie restano dove sono**
  (regola 4). Tempo di formazione calibrato su `choreography.ts`
  (2,5-4 s, più breve con `prontezza` alta).
- Una foglia che esce dalla maschera (bordo, effe) viene riportata dentro al
  punto più vicino della cella valida: nessuna foglia "cade" fuori dal
  contorno.
- Determinismo: generatore pseudo-casuale con seme (mulberry32 o simile),
  niente `Math.random()` nella simulazione. Stesso seme ⇒ stesse posizioni in
  browser, nello script dei fermi e nel reduced motion.
- `avanzaFinoAFermo` è un generatore: il chiamante (shader-engineer) ne
  consuma blocchi di ≤ 60 passi per frame o in `requestIdleCallback`, così
  nessun long task > 50 ms.

**Quante foglie** (deciso una volta, prima della caduta, da
`core/capabilities.ts` → `dispositivoLento()` e da `runtime.viewport`):

| Condizione | Foglie |
|---|---|
| `?foglie=N` nell'URL (QA) | N (tra 200 e 4000) |
| dispositivo lento: `hardwareConcurrency ≤ 4` o `deviceMemory ≤ 2`, oppure i primi 20 passi di prova (a foglie ancora invisibili) in media > 2 ms | **900** |
| layout stretto | **1.400** |
| layout largo | **2.600** |

Il numero non cambia più durante la visita (togliere foglie a metà sarebbe
un cambio visibile); se la qualità crolla dopo, si scende di DPR e poi si passa
al fallback (§10).

### 8.4 Script offline (webgl-artist)

- `npm run modi` → `node scripts/modi/calcola-modi.mjs`: legge
  `assets/svg/tavola.svg` (contorno ed effe, in mm), costruisce la maschera,
  risolve Rayleigh-Ritz (piastra ortotropa, bordi liberi, rigidezza lungo
  vena 12-15×, spessore ~2,8 mm), sceglie i tre modi per **topologia**
  (croce, X, anello), scrive `webgl/dati/modi.bin` e `webgl/dati/modi-meta.ts`
  e le PNG di controllo in `qa/modi/`. Node puro, niente dipendenze (non c'è
  numpy nella sandbox).
- Gli script non importano i `.ts` del concept: se servono le stesse funzioni
  della simulazione per i fermi, i fermi si fanno **nel browser** (§9.5), non
  in Node.

---

## 9. Caricamento e fallback

### 9.1 Sequenza

1. **HTML + CSS** (prima pittura): `.nod-root` su fondo abete, titolo, frase
   e bottone dell'apertura, righello a "0 Hz", e nel palco il **poster della
   tavola vuota** (`assets/fermi/vuota-{l,p}.webp` con `srcset`/`sizes`,
   `width`/`height` espliciti, `fetchpriority="high"`, `decoding="async"`,
   `alt=""` perché la descrizione sta nel DOM). `data-gl="pending"`. La
   pagina è già leggibile e completa.
2. **Font**: `preconnect` + `<link>` iniettato al mount; ripieghi metrici.
3. **Rilevamento** (`core/capabilities.ts`, al mount): WebGL
   (`webgl2 ?? webgl` con `failIfMajorPerformanceCaveat: true`, e per WebGL1
   l'estensione `ANGLE_instanced_arrays`; canvas di prova scartato);
   `prefers-reduced-motion` con listener; `navigator.connection?.saveData`
   → niente WebGL; `?gl=0` forza il fallback; `?gl=1` forza il WebGL
   **senza** `failIfMajorPerformanceCaveat` (serve a SwiftShader in
   headless: verifiche del webgl-artist e script dei fermi).
4. **WebGL lazy** (`core/glLoader.ts`): dopo `fontsReady()` **e**
   `requestIdleCallback` (timeout 1200 ms; senza rIC `setTimeout` 300 ms) si
   fa `import('../webgl')`; il componente scarica in parallelo `modi.bin`
   (`fetch`) e prepara maschera e atlante. Il chunk non è mai nel percorso
   critico.
5. **Primo frame GL**: il canvas nasce con `opacity: 0` sopra il poster; al
   primo frame completo (tavola, cuscinetti, foglie **non ancora comparse**)
   `impostaGL('on')` → il canvas va a 1 in 300 ms (il legno è identico al
   poster: nessun salto), poi parte la **caduta delle foglie** (1,2 s, una
   volta sola). Il poster resta sotto (nessun buco se il contesto si perde).
6. **Tetto**: se il GL non è `on` entro 6 s dal mount (rete lenta, telefono
   lento), `impostaGL('off', 'lento')` e non si carica più in questa visita:
   si passa ai fermi (le foglie non devono cadere due volte).
7. **Audio**: nessun import finché non c'è un gesto (§7.3).
8. **Foto**: `loading="lazy"`, `decoding="async"`, dimensioni esplicite; mai
   sopra o dietro la tavola (CD §4.6).

### 9.2 Fallback senza WebGL (`data-gl="off"`)

- Il palco mostra i fermi immagine: `riposo`, `modo1`, `modo2`, `modo5`
  (misure `l` e `p`), tutti generati dalla stessa simulazione (§9.5).
  All'ingresso il poster `vuota` passa a `riposo` con una dissolvenza di
  1,2 s (è la caduta del fallback). Poi `selModoMostrato` sceglie il fermo;
  cambio con dissolvenza incrociata di 400 ms, al massimo un cambio ogni
  500 ms (se si scorre veloce si salta direttamente all'ultimo).
- Righello, indice, scorciatoie, suono e prenotazione funzionano uguali. La
  voce non cambia l'anello nel fallback (resta il fermo del modo 5 a 348 Hz);
  il righello e la tacca "la tua voce" sì.
- I fermi dei modi si scaricano solo in fallback, uno per volta al bisogno
  (più il successivo in idle): mai nel percorso critico del GL.

### 9.3 Reduced motion (`data-motion="reduced"`)

- Il WebGL si carica comunque (è materia, non animazione) ma: nessuna caduta,
  nessun tremolio, nessuna migrazione. Le disposizioni finali di riposo e dei
  tre modi si calcolano con `avanzaFinoAFermo` (stesso seme) a blocchi in
  idle, subito dopo il caricamento; il cambio di modo è una **dissolvenza
  incrociata di 400 ms** tra due disposizioni ferme (`webgl/dissolvenza.ts`).
  Finché una disposizione non è pronta resta l'ultima.
- Cuscinetti: cambio in dissolvenza senza spostamento.
- Scroll verso le ancore `behavior: 'auto'`; cursore del righello senza lerp;
  riduzione del palco su stretto a scatti di pianerottolo con una dissolvenza,
  non legata allo scroll continuo.
- Il suono resta disponibile e spento di default.

### 9.4 Smontaggio (navigazione nel sito vero)

`Radice` ferma il ticker, rimuove i listener, `chiudiAudio()`,
`TavolaGL.dispose()` (geometrie, materiali, texture, `renderer.forceContextLoss()`),
ripristina fondo di `html/body`, `scroll-behavior`, `scrollRestoration`,
`document.title` e meta description, toglie il `<link>` dei font solo se
l'ha aggiunto lei.

### 9.5 Fermi immagine (`scripts/fermi.mjs`)

- `npm run fermi -- 9199`: con un dev server acceso su quella porta, apre
  Chromium di `/opt/pw-browsers` con SwiftShader
  (`--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`),
  carica `/concept-19?gl=1&fermo=<stato>&foglie=<n>`, aspetta
  `data-fermo="pronto"` sul canvas, e cattura **solo il riquadro del
  canvas** sul fondo abete della pagina (screenshot dell'elemento in PNG,
  così l'immagine combacia col fondo); poi converte la PNG in WebP **nel
  browser stesso** (disegno su un canvas 2D e `toBlob('image/webp', 0.82)`),
  perché nella sandbox non ci sono `cwebp` né `sharp`.
- Stati: `vuota`, `riposo`, `modo1`, `modo2`, `modo5`. Misure: `l` alta
  1.200 px (largo, circa DPR 1,5 a 800 px di tavola), `p` alta 760 px
  (stretto, circa DPR 2 a 360 px), con 2.600 e 1.400 foglie rispettivamente.
- `webgl/fermo.ts` (shader-engineer): con `?fermo=` la scena salta la
  caduta, porta la simulazione a fermo per quello stato (`avanzaFinoAFermo`),
  nasconde il resto della pagina (solo il palco, a dimensione fissa), fa un
  render e mette `data-fermo="pronto"`.
- `assets/fermi/index.ts`: url (`?url`), larghezze, altezze, per stato e
  misura. Gli alt stanno in `content/testi.ts`.

---

## 10. Budget di performance

Misurati dal performance-auditor sulla build standalone (Lighthouse mobile e
desktop).

| Voce | Budget |
|---|---|
| JS iniziale del concept (chunk `Concept19`, senza react/router) | ≤ **60 KB gz** |
| JS iniziale totale (con react, react-dom, router) | ≤ **125 KB gz** |
| Chunk WebGL lazy (three + `webgl/` + `condivisi/`) | ≤ **160 KB gz** (atteso ~130-135: three 112,8 misurato) |
| `modi.bin` | ≤ **60 KB** non compressi |
| Chunk audio lazy | ≤ 4 KB gz |
| CSS totale del concept | ≤ **24 KB gz** |
| SVG totali | ≤ 12 KB (contorno della tavola ≤ 6 KB dopo svgo) |
| Font woff2 latin | ≤ 130 KB (IM Fell 62,6 + Spline Sans variabile 58,0 misurati) |
| Poster `vuota` | ≤ **60 KB** (l) / ≤ **32 KB** (p): è candidato LCP |
| Fermi `riposo`/`modo*` | ≤ 90 KB (l) / ≤ 50 KB (p), solo in fallback |
| Foto (massimo 4) | ciascuna ≤ 110 KB a 1200 w, ≤ 45 KB a 720 w, `loading="lazy"` |
| LCP | ≤ **2,5 s** mobile, ≤ 1,5 s desktop; elemento LCP = titolo o poster, **mai** il canvas |
| CLS | ≤ **0,02** (palco con `aspect-ratio` e dimensioni esplicite, riduzione su stretto solo con `transform`, font con ripiego metrico, immagini con dimensioni, stati del form ad altezza riservata: il bottone "Ti mettiamo in lista" resta largo uguale) |
| INP | ≤ **150 ms** (trascinamento del righello e della foglia: gli handler scrivono solo il runtime; invio: validazione pura; "Senti la voce": il primo tocco crea il contesto audio, nessun calcolo pesante) |
| TBT | ≤ 150 ms mobile; nessun long task > 50 ms (costruzione della scena a passi con `await` tra maschera, atlante, campi; disposizioni del reduced motion a blocchi) |
| Simulazione | ≤ **1,5 ms** a passo su mobile medio con 1.400 foglie; ≤ 1 ms su desktop con 2.600 |
| Render | ≤ 4 ms GPU per frame; **3 draw call** (4 durante una dissolvenza) |
| DPR canvas | largo ≤ **2**, stretto ≤ **1,5**, pixel totali del canvas ≤ 2,5 M |
| FPS | 60 desktop, ≥ 50 mobile medio durante la migrazione; **0 render** a foglie ferme e fuori risonanza |
| Audio | **0** `AudioContext` prima di un gesto; guadagno massimo 0,04 |

**Qualità adattiva** (`webgl/qualita.ts`): media mobile del tempo frame su 30
frame renderizzati; sopra 20 ms scende il DPR di 0,25 fino a 1,0; sotto 24 fps
per 3 s a DPR 1,0 → `impostaGL('off', 'qualita')`: il palco fa una dissolvenza
di 400 ms dal canvas al fermo del modo mostrato. Perdita di contesto
(`webglcontextlost`) → `impostaGL('off', 'contesto-perso')` subito (il poster
e i fermi sono sotto); su `webglcontextrestored` si ricrea la scena e si
torna a `on` **senza** nuova caduta (le foglie riprendono dallo stato della
simulazione, che è sulla CPU e non si è perso).

---

## 11. Comandi e porte

Dalla cartella `concepts/19-nodi/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite --port 9190 --strictPort` → http://localhost:9190/concept-19 (`/` fa redirect) |
| `npm run build` | `vite build` in `dist/` |
| `npm run preview` | `vite preview --port 9190 --strictPort` (fallback SPA) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` e `scripts/` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: da lanciare prima di dire "fatto" |
| `npm run modi` | `node scripts/modi/calcola-modi.mjs` |
| `npm run fermi -- <porta>` | `node scripts/fermi.mjs <porta>` (serve un dev server acceso su quella porta) |

URL di prova:

| URL | Effetto |
|---|---|
| `?gl=0` | fallback con i fermi immagine |
| `?gl=1` | WebGL anche con risparmio dati e senza `failIfMajorPerformanceCaveat` (SwiftShader) |
| `?invio=ko` | invio della voce e del sabato falliscono |
| `?foglie=900` | numero di foglie forzato |
| `?fermo=vuota\|riposo\|modo1\|modo2\|modo5` | scena ferma per `scripts/fermi.mjs` |
| `#voce`, `#riparazioni` | arrivo diretto alla prenotazione o al sabato |

Per svuotare la memoria del concept nel browser:
`localStorage.removeItem('nodi:trovati'); localStorage.removeItem('nodi:richiesta'); sessionStorage.removeItem('nodi:voce')`.

**Porte** (range 9190–9199, sempre `--strictPort`, ognuno chiude il suo
server e non uccide mai processi altrui):

| Ondata | Agent → porta |
|---|---|
| 2 | art-director 9191, webgl-artist 9192, vector-artist 9193, photo-editor 9194, interaction-designer 9195, motion-designer 9196, copywriter 9197 |
| 3 | scaffold 9190 (da solo); poi shader-engineer 9190, apertura 9191, legni 9192, costruire 9193, voce 9194, riparazioni 9195, bottega 9196, righello 9197, palco 9198 |
| 4 | responsive 9191, accessibility 9192, performance 9193, cross-browser 9194, seo 9195, awwwards-jury 9196 (preview su quella porta: `npx vite preview --port <n> --strictPort`) |
| script | `scripts/fermi.mjs` su 9199 (dev server dedicato, acceso e spento dallo stesso agent) |

---

## 12. Analytics

`import { track } from '@/lib/analytics'` (firma del sito, `TrackEvent`
chiuso, `integrazione-sito.md` punto 2). Solo:
- `track('apri_concept', { concept: 19 })` al mount di `Radice`, una volta
  (guardia per StrictMode);
- `track('demo_prenotazione', { concept: 19, strumento, voce: zona, hz })` al
  successo dell'invio della voce (section-builder-voce);
- `track('demo_prenotazione', { concept: 19, tipo: 'riparazione' })` al
  successo del sabato (section-builder-riparazioni).

Mai nome, email, telefono, nota o problema. Nient'altro si traccia (né il
suono, né i modi trovati, né l'esito del GL).

---

## 13. Checklist per chi scrive codice

- `design-taste-frontend` e `full-output-enforcement`: niente placeholder,
  niente TODO, file completi.
- Solo i propri file (§4). Condiviso = store, runtime, stazioni, `risonanza/modi.ts`,
  token, content.
- Nessun `requestAnimationFrame` fuori dal ticker, nessun listener `scroll`
  fuori da `core/scroll.ts`, nessuna lettura di layout nelle fasi
  `update`/`write`, nessun `Math.random()` nella simulazione.
- Nessun hex fuori da `styles/tokens.*`; nessun testo fuori da `content/`;
  nessun trattino lungo in nessun testo.
- Nessun accesso al browser a livello di modulo; nessun `AudioContext` prima
  di un gesto.
- Canvas `aria-hidden="true"`; righello = `slider` vero; piano del suono con i
  due range etichettati; bersagli ≥ 44×44 px; focus 2 px ebano con 2 px di
  distanza; nessun cambio di colore di grandi superfici più di una volta ogni
  500 ms; le foglie non cambiano mai colore né luminosità.
- `npm run check` verde prima di consegnare.

---

## Richieste ad altri agent

- **ux-architect**: le cartelle e gli id del §3 seguono le 7 schermate del
  CD §4.2 (il piede insieme alla bottega) più due builder trasversali,
  **palco** e **righello**. Se la tua "Sezioni da costruire" usa altri nomi,
  l'orchestratore li mappi su queste cartelle. Mi servono da te: la lunghezza
  di ogni pianerottolo e di ogni salita (in finestre), la posizione della
  linea di lettura se diversa dal 55 %, e dove su stretto il palco scende a
  34 % (quali contenuti sono "lunghi"). La soglia del layout largo che
  propongo è `min-width: 1100px` e `min-aspect-ratio: 5/4`: se la cambi,
  cambia solo `core/viewport.ts` e `layout.css`.
- **motion-designer**: `motion/percorso.ts` con le tre funzioni pure e
  monotone del §6.3 (`hzDaPercorso`, `percorsoDaHz`, `palcoDaPercorso`), che
  coprano **tutto** 60-420 Hz con un solo punto di scroll per valore;
  `motion/molle.ts` con lerp normalizzato su `dt`; in `choreography.ts` il
  tempo di formazione per `prontezza` 0 e 1, che la simulazione usa per la
  sua taratura.
- **webgl-artist**: formato di `modi.bin` e `modi-meta.ts` del §8.2, API
  della simulazione del §8.3 (TypeScript puro, deterministico, niente three
  dentro `webgl/sim/`), `condivisi/foglie.ts` con le 4 forme (la quinta
  serve alla foglia del piano del suono solo se diversa: usa la prima). Nel
  doc le tre immagini delle linee nodali accanto alle figure di Hutchins e
  Jansson (CD §2.2 regola 2). Verifica di compilazione degli shader in
  SwiftShader con `?gl=1`.
- **vector-artist**: `assets/svg/tavola.svg` in millimetri, con tre tracciati
  con id `nod-contorno`, `nod-effe-bassi`, `nod-effe-acuti`, orientata col
  riccio in alto; e in `assets/svg/index.ts` anche l'oggetto
  `TAVOLA = { viewBox, mm: { w, h }, riquadro: { w, h }, contorno, effeBassi, effeAcuti }`
  (le `d` come stringhe, niente `DOMParser` a runtime) con `riquadro` =
  tavola più il margine dell'ombra (circa 16 mm per lato). Lo usano layout,
  GL e script dei modi.
- **interaction-designer**: API del §7 (`useRighello`, `usePianoVoce`,
  `audio/index.ts`). Gli hook non renderizzano markup e non contengono testi.
- **copywriter**: tipi del §6.4 esatti in `content/listino.ts`; in
  `content/testi.ts` anche `valuetextRighello(hz, modo)`, le cinque frasi
  delle zone con le chiavi `ZonaVoce`, le descrizioni `aria-live` di ogni
  stato della tavola e gli alt dei fermi immagine.
- **art-director**: in `styles/tokens.ts` la palette anche in rgb lineare
  (per three) e i token di livello del §5.1 (`--nod-z-palco` 0,
  `--nod-z-testo` 1, `--nod-z-regolo` 2, `--nod-z-testata` 10,
  `--nod-z-menu` 11).
- **orchestratore**: nessuna deviazione dal CD. Due precisazioni che il CD
  lascia aperte e che fisso qui: (1) la caduta iniziale delle foglie avviene
  sul canvas quando il GL è pronto, sopra un poster della tavola **vuota**;
  se il GL non arriva entro 6 s si resta nel fallback per tutta la visita;
  (2) nel fallback la voce non cambia l'anello (fermo a 348 Hz), il resto
  della prenotazione è identico.
