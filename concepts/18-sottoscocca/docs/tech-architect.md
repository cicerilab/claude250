# Tech architect · Concept 18 · SOTTOSCOCCA

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, contratti tra moduli, stato, budget e caricamento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga 18, paragrafo
18, regole comuni), `concepts/18-sottoscocca/docs/creative-director.md` (tutto),
`concepts/10-torchio/docs/integrazione-sito.md`, `tech-architect.md` e
`scaffold-engineer.md` del pilota, il codice del pilota in `src/` (ticker,
`ConceptBackButton`, stub di analytics, `Concept10.tsx`, `App.tsx`,
`package.json`). Il pilota è riferimento di formato e architettura, non di
design.

Verifiche fatte da questo agent il 26/09/2026 (Node 22.22, registry npm
raggiungibile):
- versioni con `npm view` (tabella §1);
- **misura reale dei pesi** di three e R3F con un build Vite 5 di prova nello
  scratchpad (§2.1);
- **Kenney Car Kit scaricato e ispezionato** (solo nello scratchpad):
  `sedan.glb` 172 KB, 3184 vertici, 2032 triangoli, nodi `body`,
  `wheel-front-left`, `wheel-front-right`, `wheel-back-left`,
  `wheel-back-right`; la texture `Textures/colormap.png` è **esterna** (URI
  relativo, non incorporata nel GLB); estensione `KHR_texture_transform`. Scala:
  ruote di raggio 0,30, scocca lunga 2,54, alta 1,15 con il fondo a 0,15 da
  terra: **1 unità ≈ 1 metro** per le ruote, ma la scocca è corta (una berlina
  vera è ~4,5 m): proporzioni da giocattolo (vedi §8.2);
- URL Google Fonts di Tektur (assi `wdth` 75..100, `wght` 400..900) e Red Hat
  Text 400/500/700: risponde (§1.3).

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/18-sottoscocca/`, stessa struttura del pilota. Il concept vive
   tutto in `src/pages/concepts/sottoscocca/`; `src/pages/Concept18.tsx` è un
   file sottile. Porting = copiare quella cartella e `Concept18.tsx`.
2. **three 0.160 puro, senza R3F né drei.** Il creative-director (§4.10) scrive
   "un solo `<Canvas>` R3F": l'idea (un canvas fisso, render on demand, stato
   unico derivato dallo scroll) resta, lo strumento no. **Misurato**: con R3F il
   chunk WebGL pesa **~229 KB gz** (R3F importa three per intero e annulla il
   tree shaking), contro un budget di 160. Con three puro: **~115 KB gz** di
   three + il codice della scena (§2.1).
3. **Niente GLTFLoader a runtime.** Il GLB Kenney viene convertito **una volta,
   offline** (`scripts/glb-a-bin.mjs`, webgl-artist) in un binario compatto
   con i triangoli già divisi per ruolo (carrozzeria, vetri, fanali, gomme,
   cerchi). Motivi: GLTFLoader costa ~26 KB gz; il GLB punta a una texture
   esterna che non usiamo (con il loader sarebbe un 404 in console o un file
   inutile); i colori Kenney si scartano comunque (§8).
4. **Niente lenis, niente GSAP.** Scroll nativo (il CD lo chiede), un solo
   listener `scroll` passivo che sveglia il **ticker unico** (rAF con fasi
   read/update/write/render, come il pilota). Il pin del sottoscocca è
   `position: sticky`.
5. **La quota del ponte è un valore caldo** in `state/runtime.ts`, derivata
   dallo scroll attraverso le "stazioni" (sezioni misurate) e una curva a
   gradini del motion-designer. React non si ri-renderizza per frame: nello
   store lento entrano solo i cambi di **plateau** (per `aria-current` e
   `aria-live`).
6. **I punti toccabili sono `<button>` DOM dentro le sezioni della loro
   quota** (ordine di tabulazione naturale), posizionati `fixed` con un
   `transform` scritto nella fase `write` dalle coordinate che il GL proietta
   nella fase `update`. Senza GL le coordinate vengono dalle foto (in %).
7. **CSS in file per sezione, prefisso `ssc-`**, tutto sotto `.ssc-root`.
8. **Stato lento in uno store con `useSyncExternalStore`** (lavori scelti,
   scheda aperta, prenotazione, invio, GL, reduced motion).

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json`)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` |
| `three` | `0.160.1` | patch della 0.160 del sito. Import **sempre per nome** (`import { Mesh } from 'three'`), mai `import * as THREE` (romperebbe il tree shaking) |

### 1.2 Dev

| Pacchetto | Versione |
|---|---|
| `vite` | `5.4.21` |
| `@vitejs/plugin-react` | `4.7.0` |
| `typescript` | `5.6.3` |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` |
| `@types/three` | `0.160.0` |
| `@types/node` | `22.20.4` (per `vite.config.ts` e gli script) |
| `eslint`, `@eslint/js` | `9.39.5` |
| `typescript-eslint` | `8.70.1` |
| `eslint-plugin-react-hooks` | `5.2.0` |
| `eslint-plugin-react-refresh` | `0.4.26` |
| `globals` | `15.15.0` |
| `pngjs` | `7.0.0` (solo `scripts/glb-a-bin.mjs`: legge `colormap.png` per classificare i triangoli; mai nel bundle) |

**Non installati di proposito**: `@react-three/fiber`, `@react-three/drei`
(§2.1), `lenis` (scroll nativo, CD §4.2), `gsap` (§2.2), Tailwind, librerie di
stato, `@fontsource`, `vite-plugin-glsl` (se servono shader: `?raw` nativo).
Se in ondata 3 qualcuno dimostra di aver bisogno di un pacchetto, lo chiede
nel suo doc; si aggiunge solo con motivazione e va detto nel riepilogo a Luca.

### 1.3 Font

Google Fonts, `<link>` iniettato in `useEffect` (`core/fonts.ts`) più
`preconnect`. URL di partenza (l'art-director lo fissa in `styles/tokens.ts`
come `FONT_CSS_URL`, può restringere gli assi):

```
https://fonts.googleapis.com/css2?family=Tektur:wdth,wght@75..100,400..900&family=Red+Hat+Text:wght@400;500;700&display=swap
```

Il WebGL disegna la targhetta "3500 kg" con Tektur su canvas 2D: prima di
disegnarla aspetta `fontsReady(['600 48px Tektur'])` (con tetto di 3 s, poi
ridisegna quando il font arriva).

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json`.
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `jsx: react-jsx`, `moduleResolution: bundler`,
  `types: ["vite/client"]`.
- Target build `es2020`. `manualChunks`: `three` in un chunk suo, `react` +
  `react-dom` + router in un altro.
- Dev server **porta 9180** `strictPort`, preview **9180** `strictPort` (le
  due non girano mai insieme nella stessa ondata; porte degli agent in §11).

---

## 2. Scelte motivate

### 2.1 three puro invece di R3F: la misura

Build di prova (Vite 5.4.21, target es2020, stessi import che servono alla
scena: renderer, scena, camera prospettica, Lambert e Toon, box, cilindri,
piani, `CanvasTexture`, luci ambiente/direzionali, `Vector3.project`):

| Variante | Chunk three | Altro | Totale WebGL gz |
|---|---|---|---|
| three puro, senza loader | **115,2 KB** | codice scena (stima 12-18 KB) | **~130 KB** |
| three puro + `GLTFLoader` | 141,0 KB | codice scena | ~155 KB (al limite) |
| R3F 8.18 + `useLoader(GLTFLoader)` | 185,4 KB | `fiber` 43,3 KB | **~229 KB** (fuori budget) |

La scena del CD non ha bisogno di un grafo React: una camera su binario, un
gruppo che sale, pochi materiali, render on demand, proiezione dei punti.
Tutto in una classe (`webgl/ScenaGL.ts`) montata da un componente sottile.
**Questa è una deviazione consapevole da CD §4.10** (vedi "Richieste ad altri
agent"): l'intento resta identico.

### 2.2 GSAP no

Movimenti ammessi dal CD (4.10): salita/discesa del ponte, binario della
camera, mezza rotazione delle ruote, evidenziazione del pezzo, apertura della
scheda, blocco che si aggancia e "sale sul ponte".

| Movimento | Come si fa |
|---|---|
| Salita/discesa (lerp ~0,12 a frame, plateau, assestamento 3-4 mm) | curva a gradini + lerp normalizzato su `dt` nel ticker (`motion/percorso.ts`, `motion/molle.ts`) |
| Binario camera (4 chiavi, varianti portrait) | chiavi del webgl-artist (`webgl/scena/binario.ts`), interpolazione con l'easing del motion-designer, nel ticker |
| Mezza rotazione ruote | valore in `runtime.ruote`, avanzato dal ticker quando la quota passa 0→20 |
| Evidenziazione pezzo (250 ms) | `runtime.evidenza[id]` 0→1 nel ticker, letto dal materiale |
| Scheda, blocco planning | transizioni CSS con le curve di `motion/easing.ts` (esportate anche come stringhe `cubic-bezier`) |
| Pin 180 cm | `position: sticky` |

### 2.3 Un solo ciclo rAF

`core/ticker.ts` (scaffold, stessa API del pilota §4.1 di
`scaffold-engineer.md`, senza lenis). Ordine di ogni frame:

1. `runtime.scrollY = window.scrollY` (una lettura);
2. **read**: rimisura delle stazioni solo se invalidate (§6.3);
3. **update**: percorso → quota target → quota lerp → binario → ruote →
   evidenze → camera e **proiezione dei punti** (funzione registrata dal GL) →
   `runtime.punti`;
4. **write**: DOM (indice dell'asta, `transform` dei punti, variabili CSS
   sulle foglie `data-sscvar`, opacità del canvas);
5. **render**: WebGL solo se `runtime.dirty`.

Nessun altro `requestAnimationFrame`, `setInterval` per animare o listener
`scroll` nel concept. Il ticker dorme quando niente si muove e si ferma con la
scheda del browser nascosta.

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo standalone, non si porta. **[P]** si porta nel sito. Tra
parentesi il proprietario (§4).

```
concepts/18-sottoscocca/
├─ DESIGN.md                                  [S*] (art-director)
├─ docs/                                      [S]  un .md per agent
├─ qa/                                        [S]  screenshot QA (ignorati da git)
├─ sorgenti/kenney/                           [S]  (webgl-artist) sedan.glb, colormap.png, License.txt originali: input dello script, mai nel bundle
├─ scripts/                                   [S]
│  ├─ glb-a-bin.mjs                           (webgl-artist) GLB Kenney → webgl/modelli/auto.bin + auto.json
│  └─ fermi-immagine.mjs                      (webgl-artist in ondata 2; lo shader-engineer lo aggiorna e lo rilancia in ondata 3) Playwright + SwiftShader → assets/fermi/*.webp
├─ package.json  package-lock.json            [S]  (scaffold)
├─ vite.config.ts  tsconfig*.json  eslint.config.js  .gitignore   [S] (scaffold)
├─ index.html                                 [S]  (scaffold) lang="it", fondo #1C1D1B inline, preconnect font
├─ public/favicon.svg                         [S]  (vector-artist)
└─ src/
   ├─ main.tsx  App.tsx  vite-env.d.ts        [S]  (scaffold) /concept-18 lazy; / e * → redirect
   ├─ lib/analytics.ts                        [S]  (scaffold) copia dello stub del pilota (stesso TrackEvent)
   ├─ components/ConceptBackButton.tsx        [S]  (scaffold) copia fedele di quella del pilota
   └─ pages/
      ├─ Concept18.tsx                        [P]  (scaffold) export default function Concept18() { return <Sottoscocca/> }
      └─ concepts/sottoscocca/                [P]  TUTTO il concept
         ├─ index.ts                          (scaffold) export { default } from './Radice'
         ├─ Radice.tsx                        (scaffold) .ssc-root, font, ticker, stazioni, store, ordine sezioni, GL lazy, aria-live quota
         │
         ├─ core/                             (scaffold)
         │  ├─ ticker.ts                      unico rAF, fasi read/update/write/render (§2.3)
         │  ├─ scroll.ts                      un listener scroll passivo → ticker.wake(); vaiA(id) con smooth solo senza reduced motion
         │  ├─ capabilities.ts                detectWebGL(), prefersReducedMotion(), ascoltaReducedMotion(), isCoarsePointer(), saveData(), leggiForzaturaGL()
         │  ├─ fonts.ts                       injectFonts(), fontsReady()
         │  ├─ viewport.ts                    runtime.viewport su resize/visualViewport; orientamento 'landscape'|'portrait'
         │  ├─ links.ts                       LAB_URL, CICERILAB_URL, MAPS_URL, TELEFONO_URL, EMAIL_URL
         │  └─ glLoader.ts                    decidiGL() + caricaGL(): import('../webgl')
         │
         ├─ state/                            (scaffold)
         │  ├─ store.ts                       store lento + useSottoscocca(selector) + azioni + selettori (§6.1)
         │  ├─ runtime.ts                     valori caldi mutabili (§6.2)
         │  └─ persist.ts                     local/sessionStorage in try/catch
         │
         ├─ ponte/                            (scaffold) il legame scroll → quota
         │  ├─ stazioni.ts                    registro delle sezioni-stazione e loro misure in coordinate documento (§6.3)
         │  ├─ useStazione.ts                 hook con cui ogni sezione si dichiara stazione
         │  ├─ quota.ts                       fn di update: scrollY → percorso → runtime.quota/binario/discesa; plateau → store
         │  └─ punti.ts                       registro dei bottoni-punto e fn di write che applica runtime.punti (§7)
         │
         ├─ motion/                           (motion-designer)
         │  ├─ easing.ts                      curve custom: funzioni + stringhe cubic-bezier per CSS
         │  ├─ percorso.ts                    quotaDaPercorso, binarioDaPercorso, discesaDaPercorso (curva a gradini, §6.3)
         │  ├─ molle.ts                       lerp normalizzato su dt, assestamento dei fermi, mezza rotazione ruote
         │  ├─ choreography.ts                durate e soglie (evidenza 250, scheda, blocco 400, dissolvenze 200/300)
         │  └─ useMotionVars.ts               scrive variabili CSS sulle foglie data-sscvar, solo quando cambiano
         │
         ├─ interaction/                      (interaction-designer)
         │  ├─ navigaPunti.ts                 frecce tra i punti della stessa quota (roving tabindex), Invio/Spazio apre
         │  ├─ useScheda.ts                   apertura/chiusura scheda, Esc, focus di ritorno, trascina-giù su touch
         │  ├─ trascinaBlocco.ts              trascinamento del blocco (mouse subito; touch con pressione lunga, touch-action none solo sul blocco afferrato), aggancio 10'
         │  ├─ useBloccoTastiera.ts           frecce ±10' / ponte, PagSu/PagGiù giorno, Invio conferma
         │  └─ interaction.css                hover, :focus-visible (2 px bianco, offset 3 px), stati attivi
         │
         ├─ webgl/
         │  ├─ scena/                         (webgl-artist)
         │  │  ├─ auto.ts                     legge auto.bin/auto.json → BufferGeometry per gruppo; scala e proporzioni
         │  │  ├─ ponte.ts                    ponte a due colonne procedurale (colonne, carrelli, bracci, tamponi)
         │  │  ├─ pezzi.ts                    sottoscocca procedurale: coppa, filtro, scarico, catalizzatore, silenziatore, dischi, pinze, molle, ammortizzatori (nomi = IdPezzo)
         │  │  ├─ officina.ts                 pavimento, linee a terra, neon, luci
         │  │  ├─ materiali.ts                materiali piatti dalla palette (tokens.ts), evidenza, cerchio trasparente
         │  │  ├─ texture.ts                  canvas 2D: linee a terra, targhetta "3500 kg"
         │  │  ├─ binario.ts                  4 chiavi camera × {landscape, portrait}: posizione, target, fov
         │  │  └─ ancore.ts                   posizione 3D (coordinate auto) di ogni punto toccabile
         │  ├─ modelli/                       (webgl-artist) auto.bin, auto.json, LICENSE-kenney.txt
         │  ├─ ScenaGL.ts                     (shader-engineer) renderer, resize, DPR, perdita contesto, render on demand
         │  ├─ proiezione.ts                  (shader-engineer) camera dal binario + proiezione ancore → runtime.punti
         │  ├─ qualita.ts                     (shader-engineer) DPR adattivo, spegnimento se lento
         │  ├─ dissolvenza.ts                 (shader-engineer) dissolvenza incrociata 200 ms per reduced motion (§9.3)
         │  ├─ ScenaCanvas.tsx                (shader-engineer) componente che monta ScenaGL
         │  └─ index.ts                       (shader-engineer; stub dello scaffold) export default ScenaCanvas
         │
         ├─ content/                          (copywriter)
         │  ├─ testi.ts                       tutti i testi visibili, aria-label, alt, meta, stati
         │  └─ lavori.ts                      punti, lavori, durate, ponti adatti, prezzi indicativi, misure gomme (DATI, tipi esportati §6.4)
         │
         ├─ styles/
         │  ├─ tokens.css                     (art-director) variabili --ssc-*, @font-face di ripiego con metriche
         │  ├─ tokens.ts                      (art-director) PALETTE (hex + rgb lineare per three), FONT_CSS_URL, FONT_DA_CARICARE, scala tipografica
         │  ├─ base.css                       (scaffold) reset scoped, tipografia base, .ssc-sr, .ssc-salto
         │  └─ layout.css                     (scaffold) .ssc-contenuto, .ssc-main, .ssc-gl, .ssc-stazione, livelli
         │
         ├─ assets/
         │  ├─ svg/                           (vector-artist) solo icone di servizio (chiudi, uscita esterna) + index.ts
         │  ├─ foto/                          (photo-editor) *.webp in 2 misure + index.ts (url, alt-chiave, autore, coordinate punti §7.3)
         │  └─ fermi/                         (webgl-artist, poi shader-engineer) quota-{0,20,80,180}-{l,p}.webp + index.ts
         │
         └─ sections/
            ├─ Apertura/     Apertura.tsx apertura.css Testata.tsx testata.css                        (section-builder-apertura)
            ├─ Gomme/        Gomme.tsx gomme.css Listino.tsx                                          (section-builder-gomme)
            ├─ Freni/        Freni.tsx freni.css                                                      (section-builder-freni)
            ├─ Sottoscocca/  Sottoscocca.tsx sottoscocca.css                                          (section-builder-sottoscocca)
            ├─ Deposito/     Deposito.tsx deposito.css                                                (section-builder-deposito)
            ├─ PonteLibero/  PonteLibero.tsx ponte-libero.css Giorni.tsx Planning.tsx Blocco.tsx
            │                Composizione.tsx Buchi.tsx Dati.tsx Esito.tsx
            │                planning.ts genera.ts invio.ts                                          (section-builder-ponte-libero)
            ├─ Officina/     Officina.tsx officina.css                                                (section-builder-officina)
            ├─ Piede/        Piede.tsx piede.css                                                      (section-builder-officina)
            ├─ Asta/         Asta.tsx asta.css Fondale.tsx fondale.css                                (section-builder-asta)
            └─ Punti/        PuntiQuota.tsx Punto.tsx Scheda.tsx BarraLavoro.tsx punti.css             (section-builder-punti)
```

Ordine in `Radice.tsx`:

```
.ssc-root
  link di salto ("Salta al contenuto", "Trova un buco")
  <ConceptBackButton/>
  <Fondale/>          poster a 0 cm, poi foto del fallback (livello 0)
  <ScenaCanvas/>      quando arriva (livello 0, sopra il Fondale)
  .ssc-contenuto
    <Testata/>        marchio + "Trova un buco"
    <main id="contenuto">
      <Apertura/> <Gomme/> <Freni/> <Sottoscocca/> <Deposito/> <PonteLibero/> <Officina/>
    </main>
    <Piede/>
  <Asta/>             nav fissa a destra
  <BarraLavoro/>      fissa
  <Scheda/>           una sola, fissa
  <div aria-live="polite" class="ssc-sr">   annuncio quota a plateau (scaffold)
```

Id delle ancore (stabili, li usano l'asta, "Trova un buco" e gli hash):
`inizio`, `gomme`, `freni`, `sottoscocca`, `deposito`, `ponte-libero`,
`officina`, `piede`. Se l'ux-architect rinomina le sezioni cambiano testi e
ordine, non cartelle né id (l'orchestratore riallinea i nomi degli agent:
section-builder-`<cartella in kebab-case>`).

### 3.1 Regole di porting (valgono da subito)

- Dentro `sottoscocca/` nessun import fuori dalla cartella tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` (solo in `Radice.tsx`) e
  i pacchetti npm.
- **Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `navigator` a livello di modulo**: solo in effetti, handler o funzioni
  chiamate da effetti. Il sito fa prerender: `Radice` deve rendere senza
  browser (canvas, ticker, stazioni e date "di oggi" partono solo al mount).
- Asset con i suffissi nativi di Vite (`?url`, `?raw`), mai da `public/`
  (tranne il favicon standalone). Binari del modello: `import autoBin from
  './modelli/auto.bin?url'` e `fetch`.
- Nessun hex fuori da `styles/tokens.*`; il GL prende i colori da
  `styles/tokens.ts`.

---

## 4. File di competenza esclusiva

Ogni file ha un solo proprietario. Tutti possono leggere e importare tutto.
Chi ha bisogno di una modifica altrui la scrive in "Richieste ad altri agent"
del proprio doc. Lo scaffold crea gli stub necessari al build verde; alla fine
dello scaffold la proprietà passa agli agent sotto e lo scaffold non li tocca
più.

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md`, `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts` | CSS di sezione, `base.css`, `layout.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/*` (5 file di §3) | ticker (usa la sua API), CSS di sezione, `ponte/*` |
| **webgl-artist** | `docs/webgl-artist.md`, `webgl/scena/*`, `webgl/modelli/*`, `sorgenti/kenney/*`, `scripts/glb-a-bin.mjs`, `scripts/fermi-immagine.mjs` (fino allo shader-engineer), `assets/fermi/*` (prima versione) | file dello shader-engineer in `webgl/` |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*` | niente cursore custom, niente preloader, niente parallasse al puntatore (CD) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/lavori.ts` | nessun testo nei componenti |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*`, `public/favicon.svg` | niente chiavi inglesi, ingranaggi, pistoni, figure (CD 4.9) |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*` (webp + `index.ts` con url, autore, URL Unsplash, coordinate dei punti per le 3 foto del fallback) | fermi immagine |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file [S] tranne `DESIGN.md`, `docs/*` altrui, `public/favicon.svg`, `sorgenti/`, `scripts/`; `src/pages/Concept18.tsx`; `sottoscocca/index.ts`, `Radice.tsx`; `core/*`; `state/*`; `ponte/*`; `styles/base.css`, `styles/layout.css`; stub di `sections/*/*.tsx` e `webgl/index.ts` |
| **section-builder-apertura** | `sections/Apertura/*`, `docs/section-builder-apertura.md` |
| **section-builder-gomme** | `sections/Gomme/*`, `docs/section-builder-gomme.md` |
| **section-builder-freni** | `sections/Freni/*`, `docs/section-builder-freni.md` |
| **section-builder-sottoscocca** | `sections/Sottoscocca/*`, `docs/section-builder-sottoscocca.md` |
| **section-builder-deposito** | `sections/Deposito/*`, `docs/section-builder-deposito.md` |
| **section-builder-ponte-libero** | `sections/PonteLibero/*`, `docs/section-builder-ponte-libero.md` |
| **section-builder-officina** | `sections/Officina/*`, `sections/Piede/*`, `docs/section-builder-officina.md` |
| **section-builder-asta** | `sections/Asta/*` (asta graduata + Fondale: poster, foto del fallback, dissolvenze 300 ms), `docs/section-builder-asta.md` |
| **section-builder-punti** | `sections/Punti/*` (bottoni-punto, scheda del punto, barra "Il tuo lavoro"), `docs/section-builder-punti.md` |
| **shader-engineer** (in parallelo ai section-builder) | `webgl/ScenaGL.ts`, `proiezione.ts`, `qualita.ts`, `dissolvenza.ts`, `ScenaCanvas.tsx`, `index.ts`, `scripts/fermi-immagine.mjs` e `assets/fermi/*` (versione finale), `docs/shader-engineer.md` |

Note:
- `sections/PonteLibero/genera.ts`: planning di esempio **deterministico**
  (seme = data ISO, stessi buchi a ogni visita dello stesso giorno), 6 giorni
  lavorativi da "oggi" calcolato al mount, sabato solo ponte 3. `planning.ts`:
  logica pura (buchi, compatibilità, aggancio a 10', primo buco libero), senza
  React, testabile. `invio.ts`: invio **simulato** (nessuna rete), risolve
  dopo ~1,2 s; con `?invio=ko` fallisce.
- `PuntiQuota` è importato da Gomme, Freni e Sottoscocca: lo scaffold ne crea
  lo stub **con la firma finale** (§7.1), così i quattro builder lavorano in
  parallelo.
- L'asta cambia modo (quota → ore) nel Ponte libero: il modo sta nello store
  (`modoAsta`), lo scrive solo `PonteLibero`; la scala delle ore la disegna
  l'Asta leggendo `ORARI` da `content/lavori.ts`.

---

## 5. Convenzioni CSS

- **Un `.css` per sezione** importato dal componente. Niente Tailwind, niente
  CSS modules.
- **Prefisso `ssc-`**, BEM leggero: `ssc-<sezione>`, `ssc-<sezione>__<el>`,
  `ssc-<sezione>--<variante>` (es. `ssc-planning__corsia--ponte3`). Classi
  condivise dello scaffold: `ssc-root`, `ssc-contenuto`, `ssc-main`,
  `ssc-stazione`, `ssc-gl`, `ssc-sr`, `ssc-salto`.
- **Ogni selettore inizia con `.ssc-root`.** Nessun selettore nudo su `html`,
  `body`, `:root`, `*` (unica eccezione ammessa: `html:has(.ssc-root)` per
  `scroll-padding`, come nel pilota). Il fondo si dà a `.ssc-root`; `Radice`
  imposta il fondo di `html/body` inline e lo ripristina allo smontaggio.
- **Variabili** `--ssc-*` definite solo dall'art-director (`tokens.css`);
  locali di sezione `--ssc-<sezione>-*`. Il motion-designer scrive variabili
  solo sugli elementi foglia marcati `data-sscvar`.
- **Attributi di stato su `.ssc-root`** (li scrive solo `Radice.tsx`):
  `data-gl="pending|on|off"`, `data-motion="full|reduced"`,
  `data-orient="landscape|portrait"`, `data-quota="0|20|80|180"` (plateau),
  `data-scheda="aperta"` (se aperta).
- **Livelli** (token dell'art-director): fondale e canvas 0, contenuto 1,
  punti 2 (dentro il contenuto), asta 5, barra lavoro e scheda 6, testata 10.
  Il `ConceptBackButton` sta sopra a tutto: nessun fisso nella sua zona (in alto
  a sinistra ~230×44 px da 640 px in su; in basso a sinistra ~210×44 px sotto,
  quindi margine inferiore sinistro di 72 px per scheda, barra e pannelli).
- `.ssc-root` ha `isolation: isolate` e **nessun** `transform`, `filter`,
  `contain`, `container-type`: i fissi (punti, asta, scheda) devono restare
  agganciati alla finestra. Lo stesso vale per `.ssc-stazione` e la sezione
  sticky del sottoscocca.
- Unità: `rem` per testo, `clamp()` per misure fluide, `svh/dvh` per altezze
  a schermo. Raggio 0 ovunque tranne i punti (cerchi) (CD 4.1).
- `font-variant-numeric: tabular-nums` in listini, planning e asta.

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno senza librerie, letto con `useSyncExternalStore` e selettore.

```ts
import type { IdPunto, IdLavoro, Quota, Ponte } from '../content/lavori';

type IdStazione = 'inizio' | 'gomme' | 'freni' | 'sottoscocca' | 'deposito' | 'ponte-libero';
type IdSezione = IdStazione | 'officina' | 'piede';

interface Posizione { giorno: string /* 'YYYY-MM-DD' */; ponte: Ponte; inizio: number /* minuti da mezzanotte */ }
interface Confermata extends Posizione { fine: number; lavori: IdLavoro[]; numeroDeposito: string | null }

interface SottoscoccaState {
  quotaPlateau: Quota;                // ultima quota a plateau raggiunta (aria-current, aria-live, data-quota)
  sezione: IdSezione;                 // sezione al centro della finestra
  schedaAperta: { punto: IdPunto; origine: 'scena' | 'elenco' } | null;
  lavori: IdLavoro[];                 // "Il tuo lavoro": ordine di aggiunta, senza doppioni (sessionStorage)
  deposito: { gia: boolean | null; numero: string };   // numero formato 'D-214'
  posizione: Posizione | null;        // dove sta il blocco (null = parcheggiato)
  invio: 'idle' | 'sending' | 'sent' | 'error';
  confermata: Confermata | null;      // dopo il successo (localStorage): tacca sull'asta, blocco pieno
  modoAsta: 'quota' | 'ore';
  gl: 'pending' | 'on' | 'off';
  glMotivo: string | null;
  reducedMotion: boolean;
  simulaErroreInvio: boolean;         // ?invio=ko
}

store.get(); store.set(patch); store.subscribe(fn);
useSottoscocca<T>(selector, isEqual?): T;
```

Azioni (le sezioni chiamano queste, mai `store.set`):
`apriScheda(punto, origine)`, `chiudiScheda()`, `aggiungiLavoro(id)`,
`togliLavoro(id)`, `impostaDeposito(patch)`, `piazzaBlocco(posizione | null)`,
`impostaInvio(stato)`, `conferma(confermata)`, `ricomincia()`,
`impostaModoAsta(modo)`, `impostaGL(gl, motivo?)`,
`inizializzaStore({ search, reducedMotion })` (solo `Radice`).

Selettori: `selDurata(s)` (minuti totali, con la regola "gomme già in deposito
→ 30'" del CD 4.4), `selPontiAdatti(s)` (intersezione dei ponti adatti dei
lavori; se vuota il planning lo dice a parole, vedi ux), `selEtichettaLavoro(s)`
("Tagliando + pastiglie · 2 h 30", testi dal copywriter), `selHaGomme(s)`.

Regole: `schedaAperta` la scrivono solo i componenti di `Punti/` (tramite
`interaction/useScheda.ts`); `quotaPlateau` e `sezione` solo `ponte/quota.ts`;
`gl` solo `Radice` e shader-engineer; `reducedMotion` solo `Radice`.
**Nome, telefono, targa e nota non entrano mai nello store né nella memoria**:
stato locale di `Dati.tsx`. Lo store si re-inizializza al mount di `Radice`.

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, mai in React state, letto e scritto nel ticker.

```ts
runtime.scrollY                         // px
runtime.viewport                        // { w, h, dpr, orient: 'landscape' | 'portrait' }
runtime.percorso                        // numero continuo 0..6 (§6.3)
runtime.quota                           // { target: number; valore: number }  cm, 0..180
runtime.binario                         // 0..3 continuo tra le 4 chiavi camera
runtime.discesa                         // 0..1 nel Ponte libero: ponte giù, camera lontana
runtime.opacitaScena                    // 0..1 (1 fino al deposito, 0,2 nel planning, 0 in officina/piede)
runtime.ruote                           // angolo in radianti (mezza rotazione una volta)
runtime.evidenza                        // Record<IdPezzo, number> 0..1 (250 ms)
runtime.punti                           // Record<IdPunto, { x: number; y: number; visibile: boolean }>  px CSS viewport
runtime.dirty; runtime.markDirty(); runtime.reset();
```

Chi scrive cosa: `ponte/quota.ts` → percorso, quota.target, discesa,
opacitaScena; `motion/molle.ts` (chiamata da `ponte/quota.ts`) → quota.valore,
binario, ruote, evidenza; `webgl/proiezione.ts` (o `Fondale` senza GL) →
punti; `core/viewport.ts` → viewport.

### 6.3 Stazioni e percorso (scroll → quota)

- Ogni sezione con effetto sul ponte chiama `useStazione(ref, id)`. Il
  registro (`ponte/stazioni.ts`) tiene per ognuna `top` e `altezza` in
  coordinate documento, rimisurate solo su `ResizeObserver`, resize (150 ms),
  `fonts.ready` e `invalidaStazioni()`. **Mai letture di layout durante lo
  scroll.**
- `percorso = i + t`: `i` indice della stazione che contiene la linea di
  lettura (60% dell'altezza della finestra), `t` ∈ [0, 1) la frazione dentro
  di essa. Stazioni in ordine: 0 inizio (0 cm), 1 gomme (20), 2 freni (80),
  3 sottoscocca (180, sticky), 4 deposito (180), 5 ponte-libero (discesa).
- Il motion-designer fornisce funzioni **pure** in `motion/percorso.ts`:
  `quotaDaPercorso(p) → cm` (plateau su ogni stazione e salita nella parte
  finale; esempio: plateau nel primo 65%, transizione nel 35% finale),
  `binarioDaPercorso(p) → 0..3`, `discesaDaPercorso(p) → 0..1`,
  `opacitaDaPercorso(p) → 0..1`. `ponte/quota.ts` le applica, e con reduced
  motion salta direttamente al plateau della stazione (niente valori
  intermedi, §9.3).
- Plateau raggiunto (quota.valore a meno di 0,5 cm dal target di plateau) →
  `store.quotaPlateau`, `data-quota` e annuncio `aria-live` ("Ponte a 80
  centimetri: freni e sospensioni", testo del copywriter). Mai per ogni
  centimetro.

### 6.4 Dati del mestiere: `content/lavori.ts` (copywriter)

Tipi fissati qui, valori del copywriter (una sola fonte, lo store li
ri-esporta):

```ts
export type Quota = 0 | 20 | 80 | 180;
export type Ponte = 1 | 2 | 3;
export type IdPunto = 'ruota-anteriore' | 'ruota-posteriore' | 'freni' | 'sospensioni' | 'olio' | 'scarico';
export type IdPezzo = IdPunto | 'catalizzatore' | 'silenziatore' | 'filtro' | 'disco' | 'pinza' | 'molla' | 'ammortizzatore';
export type IdLavoro = 'gomme-stagionali' | 'gomme-deposito' | 'convergenza' | 'pastiglie'
  | 'pastiglie-dischi' | 'ammortizzatori' | 'tagliando' | 'scarico';

export const PUNTI: Record<IdPunto, { quote: readonly Quota[]; pezzi: readonly IdPezzo[]; lavori: readonly IdLavoro[] }>;
export const LAVORI: Record<IdLavoro, { minuti: number; ponti: readonly Ponte[]; prezzoDa: number }>;
export const PONTI: Record<Ponte, { tipo: 'due-colonne' | 'forbice'; portataKg: number }>;
export const ORARI: { mattina: [number, number]; pomeriggio: [number, number]; sabato: [number, number] | null }; // minuti
export const MISURE_GOMME: readonly { misura: string; montaggio: number; minuti: number }[];
```

`PUNTI[id].quote`: in quali quote il punto compare (tutti a 180). `pezzi`:
quali pezzi della scena si evidenziano (i nomi coincidono con i nodi/pezzi del
webgl-artist). Testi (nomi, segnali, "fischia quando freni") in `testi.ts`.

---

## 7. Punti toccabili: contratto DOM ↔ scena

### 7.1 Componenti (section-builder-punti; stub con firma finale dallo scaffold)

```ts
// sections/Punti/PuntiQuota.tsx
export default function PuntiQuota(props: { quota: Quota; etichette: 'sempre' | 'al-focus' }): JSX.Element;
```

- Rende, dentro la sezione che lo usa, un `<ul>` con un `<button>` per ogni
  punto con `PUNTI[id].quote` che include `quota`, in ordine davanti → dietro.
  I bottoni sono `position: fixed; left: 0; top: 0` e si muovono **solo** con
  `transform: translate3d(x, y, 0)` scritto dalla fase `write`
  (`ponte/punti.ts`). Visibili solo quando `data-quota` della radice è la loro
  quota (per la 180: anche durante la sezione sticky).
- Ogni bottone si registra: `registraPunto(el, id, quota) → () => void`
  (`ponte/punti.ts`). La fn di write applica `runtime.punti[id]` a tutti i
  bottoni registrati della quota attiva, solo se il valore è cambiato di
  almeno 0,5 px.
- Clic/Invio/Spazio → `apriScheda(id, 'scena')`; frecce →
  `interaction/navigaPunti.ts`. L'elenco semplice di ogni quota (CD 4.3) è
  scritto dalla sezione stessa e chiama `apriScheda(id, 'elenco')`.

### 7.2 Proiezione con GL (shader-engineer)

`webgl/proiezione.ts` registra una fn nella fase `update`, **dopo**
`ponte/quota.ts`: calcola la camera da `runtime.binario` + chiavi di
`webgl/scena/binario.ts` + `runtime.viewport.orient`, applica la quota al
gruppo auto+bracci, proietta `ANCORE[id]` di `webgl/scena/ancore.ts`, scrive
`runtime.punti`. Un punto dietro la camera o fuori dalla finestra ha
`visibile: false`. La camera **non** si legge dal DOM.

### 7.3 Senza GL (section-builder-asta, `Fondale.tsx`)

Con `data-gl="off"` il Fondale mostra la foto della quota (3 foto: 0 cm, 80 cm,
180 cm; 20 cm usa quella a terra) con `object-fit: cover`, e scrive
`runtime.punti` convertendo le coordinate in % di `assets/foto/index.ts`
(photo-editor) nella geometria "cover" della finestra. Punti senza
coordinate su quella foto → `visibile: false` (resta l'elenco).

---

## 8. La scena 3D

### 8.1 Modello

- `scripts/glb-a-bin.mjs` (Node 22, `pngjs`): legge `sorgenti/kenney/sedan.glb`
  (o `hatchback-sports.glb`, a scelta del webgl-artist) e `colormap.png`,
  classifica ogni triangolo per il colore della cella di `colormap` indicata
  dalle UV (carrozzeria, vetri, fanali, gomma, cerchio, interni), e scrive
  `webgl/modelli/auto.bin` (posizioni `Int16` quantizzate, normali `Int8`,
  indici `Uint16`) + `auto.json` (per nodo: traslazione, scala di
  quantizzazione, intervalli di indici per gruppo). Niente UV, niente texture.
  Stima: < 45 KB grezzi, < 30 KB gz.
- `webgl/scena/auto.ts` lo legge con `fetch` + `DataView` (~1 KB di codice).
- `LICENSE-kenney.txt` (CC0) accanto al binario; credito nel Piede.

### 8.2 Scala e proporzioni

Unità three = 1 metro; quota in cm → `y = cm / 100` per auto, carrelli e
bracci. Kenney ha ruote giuste (r 0,30) ma scocca corta (2,54 m): il
webgl-artist può allungare **solo la scocca** in Z (×1,5-1,7) e spostare le
ruote (sono nodi a sé) sul passo nuovo, senza deformarle. Decide lui guardando
i render dal basso.

### 8.3 Draw call e materiali

- Materiali piatti (Lambert o Toon a 3 livelli), colori da `PALETTE` di
  `styles/tokens.ts`, nessuna mappa d'ambiente, nessuna ombra calcolata (al
  più una macchia di contatto in texture sotto l'auto a 0 cm).
- Geometria statica unita per materiale (colonne, carrelli, pavimento): i
  pezzi evidenziabili restano mesh separate con materiale clonato (uniform
  di evidenza). Obiettivo **≤ 30 draw call**, massimo 40 (CD).
- Il cerchio anteriore passa al 35% di opacità a 80 cm (materiale trasparente
  dedicato, `depthWrite: false`, ordine di render fissato).

### 8.4 Fermi immagine

`scripts/fermi-immagine.mjs`: apre la pagina con `?fermo=<quota>` (modalità
del GL che nasconde il DOM e disegna la scena ferma al plateau) in Chromium
SwiftShader (`--use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist`) a 1600×900 (`-l`) e 750×1624 (`-p`), salva WebP q 72
in `assets/fermi/`. `quota-0-*` è il poster della prima schermata; gli altri
servono al fallback (piano B del CD) e alla sezione Officina se mancano foto.
Nell'ondata 2 il webgl-artist li produce da una sua pagina di prova; lo
shader-engineer li rigenera dalla build vera e verifica che il poster
coincida con il primo frame (stessa camera, stessa luce).

---

## 9. Caricamento e fallback

### 9.1 Sequenza

1. **HTML + CSS**: `.ssc-root` nero grasso, `data-gl="pending"`. Il
   `Fondale` mostra il **poster a 0 cm** (`<img>` con `srcset` l/p,
   `width`/`height`, `fetchpriority="high"`, `decoding="async"`): è
   l'elemento LCP insieme al testo dell'apertura. Testi, prezzi, elenchi e
   planning sono già tutti nel DOM: il sito è completo senza GL.
2. **Font**: `injectFonts()` al mount; `@font-face` di ripiego con
   `size-adjust`/`ascent-override` tarati dall'art-director (niente salti).
3. **Rilevamento** al mount (`core/capabilities.ts`): WebGL2 ?? WebGL con
   `failIfMajorPerformanceCaveat: true`; `saveData`; `?gl=0` forza il
   fallback, `?gl=1` lo forza acceso (salvo contesto assente).
4. **Chunk GL lazy** (`core/glLoader.ts`): dopo l'evento `load` della pagina
   **e** `requestIdleCallback` (timeout 1500 ms; `setTimeout` 300 ms dove
   manca) → `import('../webgl')`. Mai nel percorso critico.
5. **Modello**: `ScenaCanvas` scarica `auto.bin` + `auto.json` (con
   `AbortSignal`), costruisce la scena, disegna il primo frame alla quota
   corrente, poi `impostaGL('on')`: il canvas va da opacità 0 a 1 in 300 ms
   sopra il poster (nessun salto, nessun preloader). **Tetto di 8 s** dal
   mount per l'intero percorso (import + modello + primo frame): superato →
   `impostaGL('off', 'tempo')`.
6. **Render on demand**: solo se `runtime.dirty` (scroll, quota che si muove,
   evidenza, resize). Scheda del browser nascosta → ticker fermo.
   `opacitaScena === 0` → niente render.

### 9.2 Fallback senza WebGL (`data-gl="off"`)

Cause: nessun contesto, niente `highp`, `saveData`, `?gl=0`, errore di import,
modello oltre 8 s, `webglcontextlost` (subito off; su `restored` si ricrea e si
torna `on`), qualità troppo bassa (§10). Cosa si vede: la stessa storia, le
stesse quote, l'asta, i punti (su foto, §7.3), le foto vere per quota con
dissolvenza di 300 ms al plateau (se mancano: i fermi immagine). Il passaggio
on → off è una dissolvenza di 300 ms, mai un lampo.

### 9.3 Reduced motion (`data-motion="reduced"`)

La quota **scatta** al plateau della stazione (niente valori intermedi); il GL
fa una dissolvenza incrociata di 200 ms tra le due inquadrature ferme
(`webgl/dissolvenza.ts`: copia del frame precedente su un canvas 2D
sovrapposto, render del nuovo, dissolvenza CSS del sovrapposto). Ruote ferme.
Link dell'asta senza smooth. Sottoscocca non sticky. Il GL si carica comunque.

### 9.4 Smontaggio (navigazione nel sito vero)

`Radice` ferma il ticker, toglie listener e osservatori, `ScenaGL.dispose()`
(geometrie, materiali, texture, `renderer.forceContextLoss()`), toglie il
`<link>` dei font solo se l'ha aggiunto, ripristina fondo di `html/body`,
`scrollRestoration` e `document.title`.

---

## 10. Budget di performance

Misurati dal performance-auditor sulla build standalone (Lighthouse mobile e
desktop).

| Voce | Budget |
|---|---|
| JS iniziale del concept (chunk `Concept18`, senza react/router) | ≤ **60 KB gz** |
| JS iniziale totale (con react, react-dom, router) | ≤ **125 KB gz** |
| Chunk WebGL lazy (three + `webgl/`) | ≤ **160 KB gz** (atteso ~130) |
| Modello (`auto.bin` + `auto.json`) | ≤ **40 KB gz** |
| CSS totale del concept | ≤ **24 KB gz** |
| SVG totali | ≤ 10 KB |
| Font woff2 latin | ≤ 150 KB (Tektur variabile + Red Hat Text 3 pesi) |
| Poster a 0 cm | ≤ **80 KB** (l, 1600 w) / ≤ **45 KB** (p, 750 w) |
| Foto (deposito 1, officina 2-3, fallback 3) | ciascuna ≤ 120 KB a 1600 w, ≤ 50 KB a 800 w, `loading="lazy"` |
| LCP | ≤ **2,5 s** mobile, ≤ 1,5 s desktop; elemento LCP = poster o testo, **mai** il canvas |
| CLS | ≤ **0,02** (canvas e fondale fissi, immagini con dimensioni, font con ripiego metrico, planning con altezze riservate) |
| INP | ≤ **150 ms** (tocco di un punto, "Aggiungi al lavoro", trascinamento e "Primo buco libero": nessun calcolo pesante nell'handler, il planning si ricalcola una volta per azione) |
| TBT | ≤ 150 ms mobile; costruzione della scena spezzata in passi (`await` tra auto, ponte, pezzi) |
| Draw call | ≤ 30 (massimo 40) |
| DPR canvas | mobile ≤ **1,5**, desktop ≤ **2**, pixel totali ≤ 3,5 M |
| FPS | 60 desktop, ≥ 50 mobile medio durante la salita; **0 render** a scena ferma |

**Qualità adattiva** (`webgl/qualita.ts`): media mobile del tempo frame su 30
frame renderizzati; sopra 20 ms scende il DPR di 0,25 fino a 1,0; sotto 24 fps
per 3 s a DPR 1,0 → `impostaGL('off', 'qualita')`.

---

## 11. Comandi e porte

Dalla cartella `concepts/18-sottoscocca/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite --port 9180 --strictPort` → http://localhost:9180/concept-18 (`/` fa redirect) |
| `npm run build` | `vite build` in `dist/` |
| `npm run preview` | `vite preview --port 9180 --strictPort` (fallback SPA) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` e `scripts/` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: da lanciare prima di dire "fatto" |
| `npm run modello` | `node scripts/glb-a-bin.mjs` |
| `npm run fermi` | `node scripts/fermi-immagine.mjs` (serve un dev server acceso, porta in argomento) |

URL di prova: `?gl=0` (fallback), `?gl=1`, `?invio=ko` (invio fallito),
`?fermo=0|20|80|180` (scena ferma per i fermi immagine), `?lavori=tagliando,pastiglie`
(blocco già composto), `#ponte-libero` (arrivo al planning).

**Porte** (range 9180–9189, sempre `--strictPort`, ognuno chiude il suo
server; altre porte da 9180 in su solo se la propria è occupata da un proprio
processo rimasto):

| Ondata | Agent → porta |
|---|---|
| 2 | art-director 9181, webgl-artist 9182, vector-artist 9183, photo-editor 9184, interaction-designer 9185, motion-designer 9186, copywriter 9187 |
| 3 | scaffold 9180 (da solo); poi shader-engineer 9180, apertura 9181, gomme 9182, freni 9183, sottoscocca 9184, deposito 9185, ponte-libero 9186, officina 9187, asta 9188, punti 9189 |
| 4 | responsive 9181, accessibility 9182, performance 9183, cross-browser 9184, seo 9185 (preview su quella porta: `npx vite preview --port <n> --strictPort`) |

---

## 12. Analytics

`import { track } from '@/lib/analytics'` (firma del sito, `TrackEvent`
chiuso). Solo:
- `track('apri_concept', { concept: 18 })` al mount di `Radice`, una volta
  (guardia per StrictMode);
- `track('demo_prenotazione', { concept: 18, lavori: 'tagliando+pastiglie',
  minuti, ponte, deposito: boolean })` al successo dell'invio, solo lì
  (section-builder-ponte-libero). Mai nome, telefono, targa, nota.

---

## 13. Checklist per chi scrive codice

- `design-taste-frontend` e `full-output-enforcement`: niente placeholder,
  niente TODO, file completi.
- Solo i propri file (§4). Condiviso = store, runtime, stazioni, registro
  punti, token, content.
- Nessun `requestAnimationFrame` fuori dal ticker, nessun listener `scroll`,
  nessuna lettura di layout nella fase `update`/`write`.
- Nessun hex fuori da `styles/tokens.*`; nessun testo fuori da `content/`.
- Nessun accesso al browser a livello di modulo.
- Canvas `aria-hidden="true"`; punti = `<button>` con nome accessibile; target
  ≥ 44×44 px; focus 2 px bianco con offset 3 px; nessun cambio di luminosità
  di grandi superfici più di 1 volta ogni 500 ms.
- `npm run check` verde prima di consegnare.

---

## Richieste ad altri agent

- **creative-director / orchestratore**: CD §4.10 dice "un solo `<Canvas>`
  R3F". Uso three puro con la stessa architettura (un canvas fisso, stato
  unico dallo scroll, proiezione dei punti per frame scritta negli stili,
  render on demand) perché R3F porta il chunk WebGL a ~229 KB gz contro 160
  (misura in §2.1). Chiedo di considerarla approvata.
- **ux-architect**: le cartelle e gli id di §3 seguono le 8 schermate del CD più
  due builder trasversali (**asta**, **punti**). Se la tua "Sezioni da
  costruire" usa altri nomi, l'orchestratore li mappi su queste cartelle; la
  sezione Piede è costruita dal section-builder-officina. Serve da te anche la
  regola per un lavoro misto gomme + meccanica (ponti adatti disgiunti:
  `selPontiAdatti` vuoto).
- **webgl-artist**: il GLB Kenney ha la texture esterna e proporzioni corte
  (§8): niente GLTFLoader, conversione offline con `scripts/glb-a-bin.mjs`.
  I nomi dei pezzi in `webgl/scena/pezzi.ts` e le chiavi di `ancore.ts` devono
  essere esattamente `IdPezzo` e `IdPunto` di §6.4.
- **copywriter**: usare esattamente i tipi e gli id di §6.4 in
  `content/lavori.ts`; scrivere anche gli annunci `aria-live` delle 4 quote.
- **photo-editor**: in `assets/foto/index.ts` per le 3 foto del fallback,
  coordinate in % (x, y) dei punti visibili in ciascuna, o nessuna.
- **motion-designer**: `motion/percorso.ts` con le 4 funzioni pure di §6.3 e
  `motion/molle.ts` con lerp normalizzato su `dt` (non per frame).
