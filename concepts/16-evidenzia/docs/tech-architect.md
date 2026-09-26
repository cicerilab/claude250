# Tech architect · Concept 16 · EVIDENZIA

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, convenzioni, contratti tra moduli, budget e caricamento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga e paragrafo
16, regole comuni), `concepts/16-evidenzia/docs/creative-director.md` (tutto),
`concepts/10-torchio/docs/tech-architect.md`, `scaffold-engineer.md`,
`integrazione-sito.md`, `package.json` e `vite.config.ts` del pilota,
`package.json` del sito (`/home/user/cicerilab`). Registry npm verificato il
2026-09-26 con `npm view`; Node disponibile 22.22.2.

Il pilota è riferimento di formato e di architettura, non di design: da lì
prendo store, ticker, ConceptBackButton, analytics e regole di porting; il
resto (niente WebGL, niente lenis, un foglio che scorre in due assi, una mappa
vera) è tutto di EVIDENZIA.

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/16-evidenzia/`, stessa struttura del pilota: il concept vive in
   `src/pages/concepts/evidenzia/`, `src/pages/Concept16.tsx` è sottile. Il
   porting è copiare `evidenzia/` e `Concept16.tsx`, più aggiungere Leaflet
   al sito (§3.1).
2. **Niente WebGL, niente three, niente R3F, niente lenis, niente GSAP.** Il
   foglio è un contenitore con scroll nativo nei due assi (CD 3, 4.10): lenis
   non gestisce bene lo scroll orizzontale di un elemento e toglierebbe la
   rotella nativa, che qui è il comando principale. Le transizioni una tantum
   (stacco dell'annuncio, cambio Leggi/Pagina intera, completamento del
   tratto) usano la **Web Animations API** (`element.animate`), che gira sul
   compositore e non richiede un secondo ciclo rAF. Ciò che segue il dito
   (il tratto durante il gesto, il rettangolo della minipagina) passa dal
   ticker unico.
3. **Una sola libreria in più: Leaflet 1.9.4**, caricata con `import()`
   dinamico **solo** all'apertura del giro, in un chunk suo insieme al CSS di
   Leaflet. Mai nel percorso critico, mai importata a livello di modulo (tocca
   `window` al caricamento).
4. **Tratti dell'evidenziatore in SVG dentro ogni annuncio**, in coordinate
   locali dell'annuncio: nessun sistema di coordinate globale da tenere
   allineato allo scroll. Le righe d'attacco si misurano con
   `Range.getClientRects()` dopo i font, su ResizeObserver e al cambio di
   vista; mai durante lo scroll (§7).
5. **Pagina intera = `transform: scale()`** sul foglio dentro un contenitore
   dimensionato alla misura scalata, così le barre di scroll sono corrette e
   il DOM non cambia (CD 4.8).
6. **Due impaginati, un DOM**: `layout = 'foglio'` (≥ 640 px, il foglio scorre
   dentro il suo contenitore) e `layout = 'colonna'` (< 640 px, scorre la
   finestra, colonna del giornale piegato). Stessi componenti, stesso ordine
   DOM, cambia il CSS e la sorgente dello scroll (`core/scroller.ts`).
7. **Store lento con `useSyncExternalStore`** per giro, vista, scheda,
   pannello, invio; **runtime mutabile** per i valori caldi (scroll del
   foglio, avanzamento dei tratti durante il gesto, puntatore). **Ticker
   unico** con fasi `read → update → write → render`.
8. **Retino preparato offline** (script Python + Pillow) in PNG indicizzati:
   nessun filtro CSS, nessun canvas a runtime per le foto del foglio.
9. **CSS in file per sezione, prefisso `evd-`**, tutto sotto `.evd-root`.
   Niente Tailwind, niente CSS modules.

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json` standalone)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` |
| `leaflet` | `1.9.4` | ultima stabile 1.x; solo nel chunk `mappa` (§9). **Va aggiunta al sito al porting** |

### 1.2 Dev

| Pacchetto | Versione |
|---|---|
| `vite` | `5.4.21` |
| `@vitejs/plugin-react` | `4.7.0` |
| `typescript` | `5.6.3` |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` |
| `@types/leaflet` | `1.9.22` |
| `@types/node` | `22.20.4` (solo `vite.config.ts`) |
| `eslint`, `@eslint/js` | `9.39.5` |
| `typescript-eslint` | `8.70.1` |
| `eslint-plugin-react-hooks` | `5.2.0` |
| `eslint-plugin-react-refresh` | `0.4.26` |
| `globals` | `15.15.0` |

**Non installati di proposito**: `three`, `@react-three/*` (nessun WebGL, CD
4.10), `lenis` (scroll nativo nei due assi), `gsap`, `framer-motion` (WAAPI
basta: le animazioni sono una manciata di transizioni singole), Tailwind,
librerie di stato, `@phosphor-icons/react` (una sola icona: il vector-artist
ne copia il tracciato SVG "Highlighter" da `@phosphor-icons/core` 2.1.1,
licenza MIT, citata nel suo doc), `react-leaflet` (un livello React sopra
Leaflet non ci dà nulla: la mappa è un oggetto imperativo montato una volta),
librerie di date (`Intl.DateTimeFormat` basta), servizi di routing o
geocoding.

**Strumento offline (non entra nel bundle)**: Python 3.11 + `pillow==12.3.0`
(`pip3 install --user pillow==12.3.0`) per lo script del retino
(`scripts/retino.py`, photo-editor, §8.3). Nel contenitore non ci sono
ImageMagick né Pillow preinstallati.

### 1.3 Font

Google Fonts, iniettati con un `<link>` in `useEffect` (come il pilota), più
`preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`. URL verificato
(risposta 200, 11 `@font-face` con i sottoinsiemi):

```
https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400..900&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400&display=swap
```

- Libre Franklin variabile 400-900 (testata 900, attacchi 800, prezzi 700).
- Newsreader variabile con asse `opsz` 6-72 e peso 400-700; corsivo solo 400
  (citazioni di "Hanno comprato con noi", CD 4.1).
- L'URL esatto vive in `styles/tokens.ts` (`FONT_CSS_URL`, art-director); lo
  inietta `core/fonts.ts` (scaffold). L'art-director definisce in `tokens.css`
  due `@font-face` di ripiego locali tarati (`size-adjust`, `ascent-override`,
  `descent-override`) su Arial/Helvetica per Franklin e su Georgia per
  Newsreader: il foglio è fitto e un salto di metrica sposterebbe decine di
  righe (CLS).
- Le righe dei tratti si misurano **dopo** `fontsReady()` e di nuovo su
  `document.fonts` `loadingdone` (§7.2).

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json`.
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `jsx: react-jsx`, `moduleResolution: bundler`,
  `types: ["vite/client"]`.
- Dev server porta **9160** (`strictPort: true`), preview **9161**. Porte
  degli agent in §11.
- Target build `es2020`. `manualChunks`: `react` (react, react-dom,
  scheduler, router) e `leaflet` (node_modules/leaflet).

---

## 2. Scelte motivate

### 2.1 Scroll nativo nei due assi, niente lenis

Il foglio desktop è più largo e più alto della finestra (circa 1.840 × 2.100
px a lettura). Lo spostamento deve funzionare con rotella verticale,
trackpad in due assi, Maiusc + rotella, tastiera, spazio + trascinamento,
minipagina (CD 4.4). Lo scroll nativo di un elemento `overflow: auto` fa già
le prime tre cose, con inerzia di sistema e accessibilità; lenis lavora bene
solo sull'asse verticale della finestra e dovremmo reimplementare il resto.
Quindi:

- **desktop/tablet (`layout = 'foglio'`)**: la finestra non scorre
  (`.evd-root` alta `100dvh`, `overflow: hidden`); scorre
  `.evd-foglio` (`overflow: auto`, `overscroll-behavior: contain`,
  `tabindex="0"`, `role="region"`, `aria-label="Pagina degli annunci"`).
- **mobile (`layout = 'colonna'`)**: scorre la finestra (barra degli
  indirizzi che si ritira, scroll di sistema), `.evd-foglio` è un blocco
  normale.

`core/scroller.ts` nasconde la differenza: tutti leggono lo scroll da
`runtime.foglio` e spostano con `vaiA()` (§6.3).

### 2.2 WAAPI per le transizioni, ticker per i gesti

| Movimento (CD 4.10) | Come |
|---|---|
| Tratto che segue il dito | ticker: `runtime.tratti[id].avanzamento` letto nel `write` → variabile CSS sul nodo foglia `data-evdvar` |
| Tratto che si completa (160 ms), si ritira (200 ms), si scolora (250 ms), si disegna da bottone (350 ms), tratto dimostrativo (600 ms), tratto "scarico" | WAAPI sul nodo del tratto (`clip-path`/`opacity`), lanciata dal motion-designer (`motion/tratto.ts`) a fine gesto |
| Stacco dell'annuncio → scheda (FLIP 420 ms) e ritorno | WAAPI (`motion/stacco.ts`) |
| Retino → colore | WAAPI, dissolvenza incrociata tra due `<img>` (`motion/stacco.ts`) |
| Leggi ↔ Pagina intera | WAAPI su `transform` del foglio con punto fisso (`motion/vista.ts`) |
| Spostamento del foglio da minipagina e tastiera | `scrollTo({ behavior: 'smooth' })` nativo, `'auto'` con reduced motion (`core/scroller.ts`) |
| Percorso sulla mappa (900 ms) | `stroke-dashoffset` della polilinea Leaflet (SVG) con WAAPI (`mappa/percorso.ts`) |

Regola: **nessun `requestAnimationFrame` fuori da `core/ticker.ts`**,
nessun `setInterval` per animare. Le WAAPI si annullano allo smontaggio e con
reduced motion non si creano (si imposta lo stato finale).

### 2.3 Un solo ciclo rAF

`core/ticker.ts` (API identica al pilota, senza lenis). Ordine fisso del
frame:

1. **read**: `core/scroller.ts` legge `scrollLeft/scrollTop` (o `scrollX/Y`)
   in `runtime.foglio`; nient'altro legge layout qui tranne le misure
   dichiarate "live" (nessuna, oggi);
2. **update**: avanzamento del tratto verso il bersaglio del puntatore,
   calcoli della minipagina;
3. **write**: variabili CSS sui nodi foglia (`--evd-avanzamento` del tratto,
   `transform` del rettangolo della minipagina), solo se il valore è cambiato;
4. **render**: libero (oggi nessun abbonato; resta per simmetria col pilota).

Il ticker dorme quando nessuno chiede frame; si sveglia con lo scroll del
foglio (listener passivo che chiama solo `ticker.wake()`) e con i gesti;
si ferma su `visibilitychange` → nascosto.

### 2.4 Leaflet puro, lazy

La mappa è una sola istanza con 1 livello di tile, 1-5 marcatori `divIcon`
(niente immagini di marcatore, niente percorsi di asset da sistemare in
Vite), 1 polilinea. `react-leaflet` aggiungerebbe un contesto e un ciclo di
vita da domare. Una classe `mappa/MappaGiro.ts` con `monta / aggiorna /
distruggi`, montata da un componente sottile.

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo app standalone, non si porta. **[P]** si porta. Tra
parentesi il proprietario (vedi §4). I nomi di sezione seguono il CD (4.2-4.5
e 4.9); se l'ux-architect cambia nomi o ordine, cambiano i testi e l'ordine in
`Evidenzia.tsx`, **non** le cartelle.

```
concepts/16-evidenzia/
├─ DESIGN.md                                   (art-director)
├─ docs/                                       un .md per agent
├─ qa/                                         screenshot (ignorati da git)
├─ scripts/
│  └─ retino.py                           [S]  (photo-editor) foto → PNG a retino
├─ package.json  package-lock.json        [S]  (scaffold)
├─ vite.config.ts                         [S]  (scaffold)
├─ tsconfig.json tsconfig.app.json tsconfig.node.json  [S] (scaffold)
├─ eslint.config.js  .gitignore           [S]  (scaffold)
├─ index.html                             [S]  (scaffold) lang="it", preconnect font, fondo carta #E4DFD1 inline
├─ public/
│  └─ favicon.svg                         [S]  (vector-artist)
└─ src/
   ├─ main.tsx                            [S]  (scaffold)
   ├─ App.tsx                             [S]  (scaffold) /concept-16 lazy; / e * → Navigate
   ├─ vite-env.d.ts                       [S]  (scaffold)
   ├─ lib/analytics.ts                    [S]  (scaffold) copia firma e TrackEvent del sito
   ├─ components/ConceptBackButton.tsx    [S]  (scaffold) copia fedele, location.href = "/"
   └─ pages/
      ├─ Concept16.tsx                    [P]  (scaffold) export default () => <Evidenzia/>
      └─ concepts/evidenzia/              [P]  TUTTO il concept
         ├─ index.ts                      (scaffold) export { default } from './Evidenzia'
         ├─ Evidenzia.tsx                 (scaffold) radice .evd-root, font, ticker, layout, sezioni, pannelli
         │
         ├─ core/                         (scaffold)
         │  ├─ ticker.ts                  unico rAF (§2.3)
         │  ├─ scroller.ts                sorgente dello scroll (foglio o finestra), vaiA(), mostraElemento()
         │  ├─ layout.ts                  'foglio' | 'colonna' da matchMedia (min-width: 640px)
         │  ├─ capabilities.ts            prefersReducedMotion(), ascolta…, isCoarsePointer(), saveData(), puoVibrare()
         │  ├─ fonts.ts                   injectFonts(), fontsReady()
         │  ├─ dialogo.ts                 useDialogo(): trappola del fuoco, Esc, inert sul resto, fuoco restituito, voce di history
         │  ├─ sabato.ts                  prossimoSabato(), etichette in italiano, fuso Europe/Rome, ?oggi=
         │  ├─ semi.ts                    hash stabile di stringa + PRNG mulberry32 (semi dei tratti)
         │  ├─ viewport.ts                osservaViewport() → runtime.viewport
         │  └─ links.ts                   LAB_URL, CICERILAB_URL, TELEFONO_URL, EMAIL_URL, OSM_COPYRIGHT_URL, osmZonaUrl()
         │
         ├─ state/                        (scaffold)
         │  ├─ store.ts                   store + useEvidenzia(selector) + azioni (§6.1)
         │  ├─ runtime.ts                 valori caldi (§6.2)
         │  ├─ persist.ts                 localStorage con try/catch
         │  └─ registro.ts                registro degli annunci montati e delle loro righe (§7)
         │
         ├─ foglio/                       (scaffold) il contenitore, non il contenuto
         │  ├─ Foglio.tsx                 scroller + dimensionatore + pagina scalata, data-vista
         │  └─ foglio.css                 griglia 6 colonne, filetti di colonna, scala, colonna mobile
         │
         ├─ tratto/
         │  ├─ forma.ts                   (vector-artist) geometria pura del tratto: punta a scalpello, striature, variante "scarico"
         │  ├─ Tratto.tsx                 (interaction-designer) <svg> sovrapposto all'annuncio, legge registro + store + runtime
         │  └─ tratto.css                 (interaction-designer) multiply, opacità, clip dall'avanzamento
         │
         ├─ motion/                       (motion-designer)
         │  ├─ easing.ts                  curve custom (funzioni + stringhe CSS)
         │  ├─ durate.ts                  tutte le durate e soglie di movimento del CD (160, 200, 250, 350, 420, 600, 900 ms…)
         │  ├─ tratto.ts                  completa / ritira / scolora / disegnaDaBottone / dimostrativo / scarico (WAAPI)
         │  ├─ stacco.ts                  FLIP annuncio ↔ scheda, retino → colore
         │  └─ vista.ts                   Leggi ↔ Pagina intera con punto fisso
         │
         ├─ interaction/                  (interaction-designer)
         │  ├─ useEvidenziatore.ts        gesto su un annuncio: mouse/penna (6 px), touch (angolo 30°, 12 px), soglia 55 %, quinto annuncio
         │  ├─ usePan.ts                  spazio + trascinamento, trascinamento su vuoti/filetti/barre
         │  ├─ useTastieraFoglio.ts       frecce, + e -, scrollIntoView del fuoco
         │  ├─ usePizzico.ts              due dita su tablet → Leggi/Pagina intera
         │  └─ interaction.css            cursori di sistema (text/grab), stati hover/focus/active, anello di fuoco
         │
         ├─ content/                      (copywriter)
         │  ├─ testi.ts                   tutti i testi visibili, microcopy, aria-label, META
         │  ├─ annunci.ts                 20-24 annunci tipizzati (§6.4)
         │  ├─ zone.ts                    zone con nome e coordinate verificate su openstreetmap.org, agenzia
         │  └─ listino.ts                 €/m² per zona (box "Quanto costa al metro quadro" e confronto in scheda)
         │
         ├─ styles/
         │  ├─ tokens.css                 (art-director) variabili --evd-*, @font-face di ripiego
         │  ├─ tokens.ts                  (art-director) FONT_CSS_URL, FONT_DA_CARICARE, misure della griglia in numeri (per impaginato e minipagina)
         │  ├─ base.css                   (scaffold) reset sotto .evd-root, tipografia base, .evd-sr, .evd-salto
         │  └─ layout.css                 (scaffold) radice a tutta finestra, livelli, pannelli fissi
         │
         ├─ assets/
         │  ├─ svg/                       (vector-artist) icona evidenziatore, frecce Prima/Dopo, chiudi, index.ts
         │  └─ foto/                      (photo-editor) *.webp a colori (2 misure), *-retino.png, index.ts
         │
         ├─ sections/
         │  ├─ Testata/     Testata.tsx testata.css RiquadroTesta.tsx StrisciaRubriche.tsx Piede.tsx     (section-builder-testata)
         │  ├─ Annunci/     Rubriche.tsx Rubrica.tsx Annuncio.tsx FotoRetino.tsx impaginato.ts annunci.css (section-builder-annunci)
         │  ├─ Box/         Listino.tsx VendiCasa.tsx Agenzia.tsx HannoComprato.tsx box.css              (section-builder-box)
         │  ├─ Comandi/     Comandi.tsx Minipagina.tsx Vista.tsx BarraGiro.tsx HaiSegnato.tsx comandi.css (section-builder-comandi)
         │  ├─ Scheda/      Scheda.tsx StrisciaFoto.tsx Consistenza.tsx scheda.css                       (section-builder-scheda)
         │  └─ Giro/        Giro.tsx ColonnaGiro.tsx Tappa.tsx ChiSei.tsx calcolo.ts ics.ts invio.ts giro.css (section-builder-giro)
         │
         └─ mappa/                        (section-builder-mappa) chunk lazy
            ├─ index.ts                   export default MappaGiro (componente)
            ├─ MappaGiro.tsx              componente sottile: monta/aggiorna/distrugge
            ├─ motore.ts                  classe Leaflet: tile, maxBounds, zoom 12-17, marcatori, polilinea, errori
            ├─ percorso.ts                traccia della polilinea (900 ms, WAAPI su stroke-dashoffset)
            └─ mappa.css                  ristile dei controlli e dell'attribuzione sotto .evd-root
```

Ordine di montaggio in `Evidenzia.tsx`:

```
.evd-root
  link di salto ("Vai agli annunci", "Vai al tuo giro")
  ConceptBackButton
  Foglio
    Testata  (h1 EVIDENZIA, data del sabato)            ← dentro il foglio: è stampata
    StrisciaRubriche (solo colonna)
    main#annunci
      RiquadroTesta
      Rubriche (con i Box incastrati secondo impaginato.ts)
    Piede
  Comandi (BarraGiro, Minipagina + Vista; HaiSegnato in colonna dentro il foglio, vedi §4 note)
  Scheda   (se schedaAperta)
  Giro     (se giroAperto; importa mappa/ con lazy)
  regione aria-live (#evd-annunci-live)
```

### 3.1 Regole di porting (valgono già da ora)

- Dentro `evidenzia/` nessun import fuori da `evidenzia/` tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` e i pacchetti npm.
- Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `navigator`, `Intl` con la data corrente a livello di modulo. Leaflet
  **mai** importato staticamente (legge `window` quando viene valutato).
- Asset importati con Vite (`import url from './x.webp'`, `?raw` per gli SVG
  da mettere inline), mai da `public/`.
- **Da fare nel sito al porting**: `npm i leaflet@1.9.4` e `-D
  @types/leaflet@1.9.22`. Il CSS di Leaflet (`leaflet/dist/leaflet.css`)
  arriva nel chunk lazy della mappa: resta caricato dopo aver visitato il
  giro, ma colpisce solo classi `.leaflet-*`, che il sito non usa.
- **Tile OSM in produzione**: i server `tile.openstreetmap.org` non sono per
  traffico commerciale. Per un cliente vero si passa a un fornitore di tile
  con contratto (o tile propri); il punto di scambio è una sola costante,
  `TILE_URL` + `TILE_ATTRIBUZIONE` in `mappa/motore.ts`. Per il Lab (traffico
  minimo, mappa solo a richiesta) si rispetta la tile usage policy (§9.3).

---

## 4. File di competenza esclusiva

Regola: **ogni file ha un solo proprietario**. Chi ha bisogno di una modifica
in un file altrui la scrive nel proprio doc, sezione "Richieste ad altri
agent". Tutti possono leggere e importare tutto.

**Passaggio di stub**: lo scaffold crea gli stub dei componenti di sezione e
di `mappa/index.ts` (componenti che rendono l'elemento radice vuoto con la
classe e l'id giusti) perché il build sia verde. Finito lo scaffold, la
proprietà passa a chi è indicato qui e lo scaffold non li tocca più.

### Ondata 2

| Agent | File esclusivi | Note |
|---|---|---|
| **art-director** | `DESIGN.md`, `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts` | contrasti con script; misure della griglia (268/20, margini) come token; livelli z; nessun CSS di sezione |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/durate.ts`, `motion/tratto.ts`, `motion/stacco.ts`, `motion/vista.ts` | usa ticker e WAAPI; scrive variabili solo su nodi `data-evdvar` |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*`, `tratto/Tratto.tsx`, `tratto/tratto.css` | niente cursore custom, niente scritte "trascina" (CD 4.7) |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*`, `public/favicon.svg`, `tratto/forma.ts` | `forma.ts` è geometria pura (nessun DOM): la punta a scalpello e le striature sono disegno, quindi sue |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/annunci.ts`, `content/zone.ts`, `content/listino.ts` | coordinate delle zone verificate una volta su openstreetmap.org e scritte nei dati (CD 4.5) |
| **photo-editor** | `docs/photo-editor.md`, `scripts/retino.py`, `assets/foto/*` | `assets/foto/index.ts` esporta le foto per id di annuncio (§6.4) |

Nessun webgl-artist e nessun shader-engineer: il concept non usa WebGL.

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file **[S]** di §3 tranne `DESIGN.md`, `docs/*` altrui, `public/favicon.svg`, `scripts/retino.py`; `src/pages/Concept16.tsx`; `evidenzia/index.ts`, `Evidenzia.tsx`; `core/*`; `state/*`; `foglio/*`; `styles/base.css`, `styles/layout.css`; stub di `sections/*/*` e `mappa/index.ts` |
| **section-builder-testata** | `sections/Testata/*`, `docs/section-builder-testata.md` |
| **section-builder-annunci** | `sections/Annunci/*`, `docs/section-builder-annunci.md` |
| **section-builder-box** | `sections/Box/*`, `docs/section-builder-box.md` |
| **section-builder-comandi** | `sections/Comandi/*`, `docs/section-builder-comandi.md` |
| **section-builder-scheda** | `sections/Scheda/*`, `docs/section-builder-scheda.md` |
| **section-builder-giro** | `sections/Giro/*`, `docs/section-builder-giro.md` |
| **section-builder-mappa** (in parallelo; dipende solo dai contratti §6 e §9) | `mappa/*`, `docs/section-builder-mappa.md` |

Note sui confini:
- **Testata**: testata, riquadro di testa (hero, con il tratto dimostrativo
  via `motion/tratto.ts` → `dimostrativo()` e `tratto/Tratto.tsx`), striscia
  delle rubriche su mobile, piede del foglio con i crediti foto (letti da
  `assets/foto/index.ts`).
- **Annunci**: le 4 rubriche, l'annuncio nei 4 formati, la foto a retino,
  **l'impaginato** (`impaginato.ts`: in quale colonna e fascia cade ogni
  annuncio e ogni box, secondo lo ux-architect). Monta i componenti dei Box
  nei punti dell'impaginato (li importa, non li scrive). Registra ogni
  annuncio nel registro (§7) e collega `useEvidenziatore`.
- **Box**: i quattro box redazionali come componenti senza posizione propria
  (la posizione la decide `impaginato.ts`).
- **Comandi**: barra del giro (desktop in basso a destra, mobile fissa in alto
  48 px), minipagina e comandi Leggi/Pagina intera (solo `layout = 'foglio'`),
  riepilogo "Hai segnato" (solo `colonna`, montato dagli Annunci in fondo al
  `main` tramite il componente esportato da `Comandi/HaiSegnato.tsx`).
- **Scheda**: dialogo, striscia foto, consistenza, zona, toggle "Evidenzia per
  il giro", chiusura; usa `motion/stacco.ts` e `core/dialogo.ts`.
- **Giro**: pannello, colonna, partenza, tappe, ordine, modulo "Chi sei",
  stati, invio simulato, `.ics`, `track('demo_prenotazione')`. Il calcolo è
  suo (`calcolo.ts`, funzioni pure), la mappa la importa con `lazy()` da
  `mappa/` e le passa le tappe calcolate.
- **Mappa**: solo Leaflet e il suo stato di errore; non calcola tempi né
  ordine.

---

## 5. Convenzioni CSS

- **File `.css` per sezione**, importati dal componente. Prefisso **`evd-`**,
  BEM leggero: `evd-<sezione>__<elemento>--<variante>` (es.
  `evd-annuncio__attacco`, `evd-giro__tappa--attiva`). Classi condivise dello
  scaffold: `evd-root`, `evd-foglio`, `evd-pagina`, `evd-colonne`, `evd-sr`,
  `evd-salto`.
- **Tutti i selettori iniziano con `.evd-root`**. Niente selettori nudi su
  `html`, `body`, `:root`, `*`. Unica eccezione ammessa (come il pilota):
  `html:has(.evd-root)` per `scroll-padding` e per togliere lo scroll della
  finestra in `layout = 'foglio'`.
- **Variabili**: prefisso `--evd-`, definite solo dall'art-director in
  `tokens.css`; variabili locali di sezione `--evd-<sezione>-…`. **Nessun hex
  fuori da `styles/tokens.*`**; il rosa `--evd-rosa` si usa solo in
  `tratto/tratto.css`, `sections/Comandi/*` (posti del giro e segni della
  minipagina), `sections/Giro/*` (tratti delle tappe) e `mappa/*` (marcatori,
  percorso). Mai su testo, bottoni, link, fondi (CD 4.1, 4.7).
- **Attributi di stato su `.evd-root`** (li scrive solo `Evidenzia.tsx`):
  `data-layout="foglio|colonna"`, `data-vista="leggi|intera"`,
  `data-motion="full|reduced"`, `data-pannello="nessuno|scheda|giro"`,
  `data-pan="0|1"` (spazio premuto: cursore `grab` ovunque).
- **Livelli z** (token dell'art-director): foglio 0, comandi 20, velo 30,
  scheda 40, giro 50, avviso "scarico" 25. `ConceptBackButton` sta sopra tutto
  (z-index del sito): scheda e giro su mobile riservano 60 px in basso a
  sinistra (`padding-bottom` + `env(safe-area-inset-bottom)`) per non farsi
  coprire bottoni o campi.
- **Raggio 0 ovunque**. Unità `rem` per il testo, `clamp()` per le misure
  fluide della colonna, `dvh`/`svh` per le altezze a schermo, mai `100vh`.
- **Blend**: il tratto è `mix-blend-mode: multiply` dentro l'annuncio; nessun
  antenato dell'annuncio fino al foglio deve avere `isolation`, `filter` o
  `opacity < 1` persistenti (romperebbero il multiply con il testo). Durante
  lo stacco l'annuncio clonato ha il suo tratto: va bene.
- **Nessun `transform`, `filter`, `contain` o `container-type` su `.evd-root`**
  (i figli fissi devono restare agganciati alla finestra). La scala della
  Pagina intera sta su `.evd-pagina`, dentro lo scroller.
- **Filetti di colonna**: disegnati una volta dal fondo di `.evd-colonne`
  (gradiente ripetuto alle posizioni delle 6 colonne, in `foglio.css`), non
  come bordi di ogni blocco: restano continui come su un giornale. I blocchi a
  riquadro hanno fondo carta e coprono i filetti che attraversano.

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno, letto con `useSyncExternalStore` e selettore (come il pilota).

```ts
type IdAnnuncio = string;                 // = Annuncio.id, es. "rif-214"
type Vista = 'leggi' | 'intera';
type Layout = 'foglio' | 'colonna';
type Partenza = '09:00' | '09:30' | '10:00';
type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
type StatoMappa = 'chiusa' | 'caricamento' | 'pronta' | 'errore';

interface GiroMandato { sabato: string /* ISO yyyy-mm-dd */; tappe: IdAnnuncio[]; partenza: Partenza }

interface EvidenziaState {
  segnati: IdAnnuncio[];                  // ordine di aggiunta, massimo MAX_GIRO = 4 (persistito)
  ordine: IdAnnuncio[] | null;            // ordine scelto a mano nel giro; null = il più breve (persistito)
  partenza: Partenza;                     // persistito, default '09:00'
  daAgenzia: boolean;                     // true = si parte dall'agenzia; false = "ci vediamo alla prima casa"
  sabato: 0 | 1;                          // 0 = prossimo sabato, 1 = quello dopo
  vista: Vista;
  layout: Layout;
  schedaAperta: IdAnnuncio | null;
  giroAperto: boolean;
  invio: StatoInvio;
  mandato: GiroMandato | null;            // persistito: "Giro mandato per sabato 3 ottobre"
  scarico: IdAnnuncio | null;             // annuncio su cui è stato tentato il quinto tratto (riga d'avviso)
  mappa: StatoMappa;
  voceLive: string;                       // ultimo messaggio per la regione aria-live
  reducedMotion: boolean;
  simula: { invioKo: boolean; mappaKo: boolean; oggi: string | null };   // ?invio=ko, ?mappa=ko, ?oggi=
}
```

API (come il pilota): `store.get()`, `store.set(patch)`, `store.subscribe(fn)`,
`useEvidenzia(selector, isEqual?)`.

**Azioni** (le sezioni chiamano queste, mai `store.set`):

```ts
evidenzia(id, origine: 'gesto' | 'bottone' | 'scheda' | 'giro'): 'aggiunto' | 'gia' | 'pieno';
togli(id, origine): void;                 // dal giro e dal foglio (il tratto si scolora)
alterna(id, origine): 'aggiunto' | 'tolto' | 'pieno';
sposta(id, verso: -1 | 1): void;          // Prima / Dopo: fissa `ordine`
riordina(ids: IdAnnuncio[]): void;        // trascinamento delle tappe
ordineAutomatico(): void;                 // ordine = null
impostaPartenza(p), impostaDaAgenzia(b), impostaSabato(0 | 1);
impostaVista(v: Vista);
apriScheda(id), chiudiScheda();
apriGiro(), chiudiGiro();
impostaMappa(stato: StatoMappa);          // solo mappa/
impostaInvio(stato: StatoInvio);          // solo sections/Giro
segnaMandato(g: GiroMandato);             // solo sections/Giro, al successo
annuncia(testo: string);                  // regione aria-live
inizializzaStore({ search, reducedMotion, layout }): EvidenziaState;  // solo Evidenzia.tsx
```

- `evidenzia()` con 4 segnati restituisce `'pieno'`, imposta `scarico = id` e
  non aggiunge (CD 4.4, il quinto annuncio); lo scaricamento si azzera al
  primo `togli()` o dopo che l'avviso è stato mostrato e chiuso.
- Ogni aggiunta/rimozione chiama `annuncia()` con il testo del copywriter
  ("Aggiunto al giro: Torre, trilocale con garage. Due case su quattro.") e,
  se `origine === 'gesto' | 'bottone'` e l'aggiunta è riuscita, vibra 10 ms
  quando `puoVibrare()`.
- Un cambio del giro dopo `mandato` non cancella `mandato`, ma la barra torna
  a "Il tuo giro" e il giro si può rimandare (lo ux decide il testo).
- **Selettori** (in `store.ts`): `selSegnato(id)`, `selQuanti`,
  `selPieno`, `selOrdineGiro` (= `ordine ?? null`; l'ordine più breve lo
  calcola `sections/Giro/calcolo.ts`), `selSabato` (data ISO ed etichetta da
  `core/sabato.ts`).
- Il **contatto** del modulo (nome, telefono, email, nota) non entra mai nello
  store né nella memoria: è stato locale di `ChiSei.tsx`. Solo in caso di
  invio fallito si salva `giro` (non il contatto), che è già salvato.
- Lo store è un singleton di modulo **re-inizializzato** al mount di
  `Evidenzia.tsx`.

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, mai nello stato React:

```ts
runtime.viewport            // { w, h, dpr }
runtime.foglio              // { x, y, w, h, contenutoW, contenutoH, scala } : scroll e misure del foglio, scritti da core/scroller.ts nella fase read
runtime.puntatore           // { x, y, attivo, tipo: 'mouse' | 'touch' | 'pen' }
runtime.tratti              // Map<IdAnnuncio, { avanzamento: number; bersaglio: number; riga: 0 | 1; gesto: boolean }>
runtime.pan                 // { spazio: boolean; trascina: boolean }
runtime.reset()
```

- `tratti` lo scrivono solo `interaction/useEvidenziatore.ts` (durante il
  gesto) e `motion/tratto.ts` (a fine animazione, per lasciare il valore
  finale coerente). Lo legge `tratto/Tratto.tsx` nella fase `write`.
- `foglio` lo scrive solo `core/scroller.ts`; lo leggono minipagina, vista e
  pan.

### 6.3 `core/scroller.ts` (contratto)

```ts
export function registraScroller(el: HTMLElement | null): () => void;   // Foglio.tsx; null = finestra (layout colonna)
export function vaiA(x: number, y: number, opz?: { liscio?: boolean }): void;  // coordinate del contenuto non scalato; liscio=false con reduced motion
export function mostraElemento(el: HTMLElement, margine?: number): void;       // scrollIntoView con margine sul foglio o sulla finestra
export function aCoordinateContenuto(clientX: number, clientY: number): { x: number; y: number };
```

### 6.4 Dati (copywriter e photo-editor)

`content/annunci.ts`:

```ts
type Rubrica = 'appartamenti' | 'case' | 'rustici' | 'affitti';
type Formato = 'piccolo' | 'foto' | 'riquadro' | 'testa';
type Tipologia = 'appartamento' | 'casa' | 'rustico' | 'box' | 'monolocale';
interface Annuncio {
  id: string;                       // "rif-214"
  rif: string;                      // "214", mostrato come "Rif. 214"
  rubrica: Rubrica;
  formato: Formato;
  zona: ZonaId;                     // chiave di content/zone.ts
  tipologia: Tipologia;             // decide la durata della visita (20 o 30 min) nel calcolo
  attacco: string;                  // riga d'attacco in grassetto, quella che si evidenzia (zona e tipologia)
  titoloScheda: string;
  testo: string;                    // corpo del piccolo annuncio, italiano pieno
  prezzo: number;                   // euro; affitti = al mese
  affitto: boolean;
  mq: number;
  casa: readonly string[]; costi: readonly string[]; fuori: readonly string[];   // consistenza (CD 4.3)
  descrizione: string;
  vicino: readonly string[];        // tre righe: scuola, autobus, supermercato con minuti a piedi
  novita?: string;                  // "Nuovo", "Prezzo ribassato": in grassetto nell'attacco, mai etichetta sulla foto
}
export const ANNUNCI: readonly Annuncio[];
export const MAX_GIRO = 4;
```

`content/zone.ts`: `ZonaId`, `ZONE: Record<ZonaId, { nome; lat; lng }>`,
`AGENZIA: { lat; lng; indirizzo… }`, `SCOSTAMENTI: Record<IdAnnuncio,
{ dLat; dLng }>` (spostamento fisso entro 250 m per annuncio, CD 4.5),
`LIMITI_MAPPA` (`maxBounds` area Pordenone e comuni vicini).

`assets/foto/index.ts`:

```ts
interface FotoAnnuncio {
  retino?: { src: string; w: number; h: number };            // PNG del foglio
  colore: readonly { src: string; src800: string; w: number; h: number; alt: string }[];  // 0..6, prima = stessa della retino
  crediti: readonly { autore: string; url: string }[];
}
export const FOTO: Partial<Record<IdAnnuncio, FotoAnnuncio>>;
export const CREDITI: readonly { autore: string; url: string }[];  // per il piede
```

Un annuncio senza voce in `FOTO` è tipografico anche nella scheda ("Foto in
agenzia, su richiesta", CD 4.6 piano B).

---

## 7. Annunci, righe e tratti

### 7.1 Registro: `state/registro.ts`

```ts
interface RigaTratto { x: number; y: number; w: number; h: number }   // px CSS, coordinate locali dell'annuncio, NON scalate
interface VoceAnnuncio {
  id: IdAnnuncio;
  el: HTMLElement;                  // l'<article>
  attacco: HTMLElement;             // lo span della riga d'attacco
  righe: RigaTratto[];              // massimo 2 (CD 4.4)
  posizione: { x: number; y: number; w: number; h: number };   // nel contenuto del foglio, non scalato (minipagina, mostraElemento)
  versione: number;                 // +1 a ogni rimisura che cambia qualcosa
}
export const registro: {
  registra(id, el, attacco): () => void;
  get(id): VoceAnnuncio | undefined;
  tutti(): readonly VoceAnnuncio[];
  subscribe(fn: (id: IdAnnuncio | null) => void): () => void;   // null = rimisura generale
  invalida(): void;                 // rimisura tutto (cambio di vista o di layout)
};
export function useVoceAnnuncio(id): VoceAnnuncio | undefined;  // per Tratto.tsx e Minipagina
```

**Come si misura** (mai durante lo scroll, mai in un handler di gesto):
- `righe`: `Range.selectNodeContents(attacco).getClientRects()`, raggruppati
  per riga (stesso `top` entro 2 px), convertiti in coordinate locali
  dell'`article` e **divisi per `runtime.foglio.scala`** (in Pagina intera il
  foglio è scalato: le righe restano in unità non scalate, l'SVG è dentro
  l'annuncio e scala con lui).
- Quando: alla registrazione, dopo `fontsReady()`, su `loadingdone` dei font,
  su `ResizeObserver` dell'`article` (un solo osservatore per tutti, nel
  registro), su `invalida()` (cambio `layout`), con rimisure raggruppate in un
  solo passaggio nella fase `read` del ticker.
- Al cambio di `vista` **non** si rimisura: le coordinate sono non scalate.

### 7.2 `tratto/forma.ts` (vector-artist)

```ts
interface OpzioniForma { larghezza: number; altezza: number; seme: number; scarico?: boolean }
interface FormaTratto { d: string; striature: readonly string[]; viewBox: string }
export function formaTratto(o: OpzioniForma): FormaTratto;        // pura, deterministica dato il seme
export function variazione(seme: number): { dy: number; rotazione: number };  // |dy| ≤ 2 px, rotazione in [-0.6°, 0.6°]
```

Il seme viene da `core/semi.ts` (`semeDa(id)`), così il tratto è sempre lo
stesso quando si torna (CD 4.4). Altezza circa 1,15 × corpo della riga.

### 7.3 `tratto/Tratto.tsx` (interaction-designer)

`<Tratto id={id} />` dentro l'`article`, `position: absolute`, `inset: 0`,
`pointer-events: none`, `aria-hidden="true"`. Per ogni riga misurata disegna
il path di `formaTratto`; la parte visibile è `clip-path: inset(0 calc((1 -
var(--evd-avanzamento)) * 100%) 0 0)` sul nodo foglia `data-evdvar`. Stato
finale da store (`segnato` → 1, altrimenti 0); durante il gesto dal runtime.
Lo stesso componente si usa nel riquadro di testa (tratto dimostrativo su
"Segna"), nelle tappe del giro e nel riepilogo "Hai segnato" (con prop
`righe` fornite e non dal registro).

### 7.4 Minipagina

Disegnata in SVG da `sections/Comandi/Minipagina.tsx` con i rettangoli di
`registro.tutti()` (scala fissa), i segni rosa dei segnati, e il rettangolo
della finestra scritto nella fase `write` da `runtime.foglio` (un solo
`transform` su un nodo `data-evdvar`). Trascinare il rettangolo chiama
`vaiA()` senza animazione.

---

## 8. Budget di performance

Misurati dal performance-auditor sulla build standalone (Lighthouse mobile e
desktop).

| Voce | Budget |
|---|---|
| JS iniziale del concept (chunk `Concept16`, senza react/router) | ≤ **60 KB gz** |
| JS iniziale totale standalone (con react, react-dom, router) | ≤ **120 KB gz** |
| Chunk lazy `mappa` (Leaflet + `mappa/*`) | ≤ **55 KB gz** (Leaflet 1.9.4 minificato: 42,4 KB gz) |
| Chunk lazy del giro (`sections/Giro`, se separato) | ≤ **15 KB gz** |
| CSS totale del concept (escluso Leaflet) | ≤ **24 KB gz** |
| CSS di Leaflet (lazy) | 3,5 KB gz (dato) |
| WebGL | **nessuno** |
| SVG totali | ≤ **20 KB** non gz |
| Font (woff2, latin) | ≤ **200 KB** totali (Franklin variabile + Newsreader variabile + corsivo) |
| Foto a retino del foglio (PNG indicizzati 2-3 colori, larghezza 2× la colonna: 536 px) | ≤ **22 KB** ciascuna, ≤ **180 KB** tutte |
| Foto a colori della scheda (webp) | 1600 px ≤ **190 KB**, 800 px ≤ **75 KB**; caricate solo all'apertura della scheda (o al passaggio del puntatore sul titolo) |
| Immagini scaricate al primo caricamento a 1440 | ≤ **250 KB** (solo le retino nella prima finestra: le altre `loading="lazy"`) |
| LCP | ≤ **2,5 s** mobile, ≤ **1,5 s** desktop. Elemento LCP atteso: la testata *EVIDENZIA* (testo) o il titolo del riquadro di testa, mai una foto |
| CLS | ≤ **0,02** (font di ripiego tarati, `width`/`height` su ogni `<img>`, barra del giro con altezza riservata, nessun contenuto che entra) |
| INP | ≤ **150 ms** (tratto: il gesto scrive solo nel runtime; Evidenzia/Togli: un solo `store.set`; apertura scheda: il FLIP legge un rettangolo e anima, le foto grandi non bloccano) |
| TBT | ≤ **150 ms** mobile |
| Long task durante lo scroll del foglio | **0** sopra 50 ms (a 390 px, CPU 4×) |
| Frame idle | **0** frame del ticker quando niente si muove |
| Tile OSM | solo a giro aperto; zoom 12-17; nessun precaricamento (`keepBuffer: 1`, niente `updateWhenIdle: false` forzato) |

---

## 9. Strategia di caricamento

1. **HTML + CSS** (prima pittura): `.evd-root` con fondo carta, foglio
   stampato tutto nel DOM (20-24 annunci sono pochi nodi: niente
   virtualizzazione, che romperebbe la lettura continua, la ricerca nella
   pagina e i lettori di schermo). I tratti salvati (localStorage, letto nel
   `useState` iniziale con try/catch) sono già al loro stato finale al primo
   render: nessun tratto "entra" al caricamento, tranne il dimostrativo.
2. **Font**: `preconnect` + `<link>` al mount, `display=swap`, ripieghi tarati.
   Il tratto dimostrativo parte dopo `fontsReady()` (attesa massima 3 s) per
   cadere sulla parola giusta.
3. **Rilevamento** al mount: `layout` (matchMedia con listener), reduced
   motion (con listener), `isCoarsePointer`, `puoVibrare`, parametri URL
   (§11).
4. **Foto**: retino con `loading="lazy"` e `decoding="async"` tranne quelle
   che l'impaginato mette nella prima finestra a 1440 (`fetchpriority` non
   serve: non sono LCP). Colore: `<img srcset>` montate solo nella scheda;
   `pointerenter`/`focus` sul titolo dell'annuncio fa un `new Image()` della
   prima foto 800 px (una sola volta per annuncio).
5. **Giro**: `sections/Giro/Giro.tsx` è importato con `lazy()` dallo scaffold
   in `Evidenzia.tsx` e prefetchato in idle (`requestIdleCallback`, timeout
   2 s) dopo il primo render. La **mappa no**: `mappa/` si importa solo
   quando il pannello del giro è aperto.
6. **Mappa**: all'apertura del giro `impostaMappa('caricamento')` →
   `import('../../mappa')` (dentro `Giro.tsx`, con `lazy()` + `Suspense` il cui
   fallback è il riquadro di carta, non uno spinner) → Leaflet +
   `leaflet/dist/leaflet.css` + `mappa.css` → `impostaMappa('pronta')` al
   primo evento `load` del livello tile.
7. **Reduced motion**: stesso caricamento; nessuna WAAPI creata, stato finale
   immediato; `vaiA` e `mostraElemento` senza scorrimento liscio; percorso
   della mappa intero.
8. **Pausa**: `visibilitychange` → ticker fermo.
9. **Smontaggio** (navigazione nel sito vero): `Evidenzia.tsx` ferma il
   ticker, scollega lo scroller, ripristina `overflow` e `background` di
   `html`/`body`, rimuove il `<link>` dei font se l'ha aggiunto lui, chiude
   le voci di history aggiunte da scheda e giro senza tornare indietro
   (`history.replaceState`), la mappa chiama `map.remove()`, le WAAPI vengono
   annullate.

### 9.1 History e tasto indietro (CD 4.9)

`core/dialogo.ts`, opzione `storia: true`: all'apertura di scheda o giro
`history.pushState({ evd: 'scheda' | 'giro', id }, '')` (**stessa URL, stessa
rotta**); `popstate` con stato diverso chiude il pannello. Chiudere dal bottone
o con `Esc` fa `history.back()` solo se la voce in cima è la nostra, così
indietro non esce mai dal concept per sbaglio e non si accumulano voci.

### 9.2 Fallback e stati d'errore

Nessun WebGL, quindi nessun fallback grafico. I fallback veri sono:
- **mappa** (`?mappa=ko`, import fallito, 3 errori di tile di fila,
  nessun tile entro 8 s, `navigator.onLine === false`): `impostaMappa('errore')`,
  riquadro di carta con la frase del copywriter e il link `osmZonaUrl()`;
  la colonna del giro funziona identica (CD 4.5);
- **storage bloccato**: tutto funziona nella sessione;
- **senza JS**: il concept è una SPA come il sito; il prerender del sito
  produce solo i meta.

### 9.3 Tile OpenStreetMap: regole d'uso applicate nel codice

`mappa/motore.ts` deve avere, e il section-builder-mappa lo verifica nel suo
doc:
- `L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 12,
  maxZoom: 17, attribution, crossOrigin: false, keepBuffer: 1 })`, nessun
  sottodominio `a/b/c`, nessun `referrerPolicy` impostato (resta il Referer del
  browser);
- `maxBounds` = `LIMITI_MAPPA` con `maxBoundsViscosity: 1`;
- attribuzione sempre visibile, **testo** "© OpenStreetMap contributors" con
  link a `OSM_COPYRIGHT_URL`, leggibile a 375 px (non dietro un'icona); il
  prefisso "Leaflet" dell'attribuzione si può togliere
  (`attributionControl.setPrefix(false)`), quello di OSM mai;
- nessun precaricamento o download di tile fuori vista, nessuna cache offline,
  nessun tile negli asset;
- nei test Playwright la mappa si apre il minimo indispensabile, con cache del
  browser attiva, mai cicli di zoom.

---

## 10. Analytics

`import { track } from '@/lib/analytics'`, firma del sito
(`integrazione-sito.md` punto 2). Solo:

| Evento | Quando | Parametri |
|---|---|---|
| `apri_concept` | mount di `Evidenzia.tsx` (guardia per StrictMode) | `{ concept: 16 }` |
| `demo_prenotazione` | invio del giro riuscito (`sections/Giro/invio.ts` risolve) | `{ concept: 16, case: n }` (n = tappe). Mai nome, telefono, email, nota, indirizzi |

Nient'altro si traccia (CD 4.5).

---

## 11. Comandi e porte

Dalla cartella `concepts/16-evidenzia/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite` su http://localhost:**9160** (`/` e `*` → `/concept-16`) |
| `npm run build` | `vite build` in `dist/` |
| `npm run preview` | `dist/` su http://localhost:**9161** (fallback SPA) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: **prima di dire "fatto"** |

Ogni agent che avvia un server usa **la sua porta** con
`npx vite --port <porta> --strictPort` (o `vite preview --port`) e lo chiude
alla fine. Mai porte fuori da 9160-9169, mai processi altrui.

| Porta | Chi |
|---|---|
| 9160 | `npm run dev` (scaffold; poi l'orchestratore) |
| 9161 | `npm run preview` (ondata 4, un agent alla volta) |
| 9162 | art-director, poi section-builder-testata, poi responsive-tester |
| 9163 | interaction-designer, poi section-builder-annunci, poi accessibility-auditor |
| 9164 | motion-designer, poi section-builder-box, poi performance-auditor |
| 9165 | vector-artist, poi section-builder-comandi, poi cross-browser-tester |
| 9166 | section-builder-scheda, poi seo-engineer |
| 9167 | section-builder-giro, poi awwwards-jury |
| 9168 | section-builder-mappa |
| 9169 | riserva dell'orchestratore |

**Parametri URL per QA** (letti una volta da `inizializzaStore`):

| URL | Effetto |
|---|---|
| `/concept-16?segna=rif-214,rif-305` | parte con quegli annunci segnati (se la memoria è vuota) |
| `/concept-16?giro=1` | apre il pannello del giro al mount |
| `/concept-16?scheda=rif-214` | apre la scheda di quell'annuncio |
| `/concept-16?vista=intera` | parte in Pagina intera (solo `layout = 'foglio'`) |
| `/concept-16?invio=ko` | l'invio simulato fallisce |
| `/concept-16?mappa=ko` | la mappa va subito in errore, senza chiedere tile (per i test ripetuti) |
| `/concept-16?oggi=2026-10-03` | data finta per `core/sabato.ts` (sabato, domenica, dopo le 12:30…) |

Per svuotare la memoria: `localStorage.removeItem('evidenzia:giro')`.

---

## 12. Contratti tra moduli da rispettare (riepilogo per l'ondata 2)

- **motion-designer**: esporta da `motion/tratto.ts`
  `completa(el, da, opz)`, `ritira(el, da, opz)`, `scolora(el, opz)`,
  `disegnaDaBottone(el, opz)`, `dimostrativo(el, opz)`, `scarico(el, opz)`,
  ognuna `→ Animation | null` (null con reduced motion: ha già messo lo stato
  finale); da `motion/stacco.ts` `stacca(daEl, aEl, opz) → Promise<void>` e
  `rimetti(daEl, aEl, opz) → Promise<void>`, `retinoAColore(imgRetino,
  imgColore, opz)`; da `motion/vista.ts` `cambiaVista(paginaEl, da, a,
  puntoFisso, opz) → Promise<void>`. Le firme esatte si fissano nel suo doc;
  lo scaffold si adegua (come nel pilota).
- **interaction-designer**: `useEvidenziatore(ref: RefObject<HTMLElement>, id:
  IdAnnuncio)` non restituisce stato React; `usePan(scrollerRef)`,
  `useTastieraFoglio(scrollerRef)`, `usePizzico(scrollerRef)` montati da
  `foglio/Foglio.tsx`.
- **vector-artist**: `tratto/forma.ts` come in §7.2; `assets/svg/index.ts`
  esporta stringhe `?raw` (icona Evidenzia 24 px, Prima, Dopo, Chiudi, freccia
  link esterno).
- **copywriter**: tipi di §6.4; tutti i testi di stato del giro, della
  scheda, della barra, del quinto annuncio, delle voci aria-live (come
  funzioni di formattazione pure: `voceAggiunto(annuncio, quanti)`), `META`
  con title/description "Concept di Ciceri Lab".
- **photo-editor**: `assets/foto/index.ts` come in §6.4; `scripts/retino.py`
  documentato (retino a punti, 2-3 colori indicizzati: carta trasparente o
  `#E4DFD1`, punti retino, punti neri; angolo 45°, passo circa 4 px a 2×).
- **art-director**: token per griglia (`--evd-colonna: 268px`,
  `--evd-canaletto: 20px`, margini del foglio) anche in numeri in `tokens.ts`,
  livelli z (§5), anello di fuoco. Nessun colore in JS: i marcatori Leaflet
  (`divIcon`) e la polilinea si stilano con classi CSS.

---

## 13. Checklist per chi scrive codice

- Segui `design-taste-frontend` e `full-output-enforcement`: niente file
  troncati, niente TODO o segnaposto.
- Solo i tuoi file (§4). Ciò che è condiviso passa da store, runtime,
  registro, token.
- Nessun `requestAnimationFrame` fuori dal ticker, nessun `setInterval` per
  animare, nessun listener `scroll` diretto (si usa `runtime.foglio` o
  `core/scroller.ts`).
- Nessun hex fuori da `styles/tokens.*`; rosa solo nei file elencati in §5.
- Nessun accesso al browser a livello di modulo; Leaflet solo con `import()`.
- Testi solo da `content/*`.
- Ogni gesto ha il suo bottone (Evidenzia, Togli, Prima/Dopo, Leggi/Pagina
  intera); target ≥ 44×44 px su touch.
- Prima di consegnare: `npm run check` verde.

---

## Richieste ad altri agent

- **ux-architect** (stessa ondata): l'elenco "Sezioni da costruire" è atteso
  allineato ai sette builder di §4 (testata, annunci, box, comandi, scheda,
  giro, mappa). Se ne propone un taglio diverso, l'orchestratore decide e io
  aggiorno §3-§4; i nomi delle cartelle restano quelli di §3. Serve da lui
  anche l'impaginato del foglio (colonna e fascia di ogni annuncio e box) che
  il section-builder-annunci traduce in `impaginato.ts`.
- **creative-director**: il CD in 4.10 cita "porte 9160-9179"; la tabella di
  `docs/ruoli-agent.md` assegna **9160-9169** al concept 16 (9170-9179 sono
  del 17). Vale la tabella; qui si usano solo 9160-9169.
