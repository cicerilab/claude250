# Tech architect · Concept 11 · TAJUT

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, convenzioni, contratti tra moduli, budget e caricamento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga 11, paragrafo
TAJUT, verifica incrociata, regole comuni), `concepts/10-torchio/docs/integrazione-sito.md`,
`concepts/11-tajut/docs/creative-director.md` (tutto), e dal pilota
`concepts/10-torchio/docs/tech-architect.md`, `scaffold-engineer.md` e i file
reali `package.json`, `vite.config.ts`, `src/lib/analytics.ts`,
`src/components/ConceptBackButton.tsx`, `src/App.tsx`, `src/pages/Concept10.tsx`.
Skill: `design-taste-frontend` (§3, §5, §6), `full-output-enforcement`.
Registry npm raggiungibile il 2026-09-26; Node 22.22.2. Le versioni sotto sono
quelle del pilota, già installate e verdi lì (`npm view react-router-dom@6` →
6.30.6 confermato). Pesi dei font misurati con curl su Google Fonts (§1.3).

Il pilota è riferimento di formato e architettura, mai di design: qui non c'è
WebGL, non c'è scroll, non c'è lenis, non c'è rilievo.

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/11-tajut/`, stessa struttura del sito: tutto il concept in
   `src/pages/concepts/tajut/`, `src/pages/Concept11.tsx` sottile. Porting =
   copiare `tajut/` e `Concept11.tsx`.
2. **Dipendenze di runtime: solo `react`, `react-dom`, `react-router-dom`.**
   Niente three, R3F, drei, lenis, GSAP, Motion (framer). Il CD vieta WebGL e
   scroll; il volo delle carte è CSS 3D pilotato da una molla scritta a mano
   (~1 KB). Nel porting non si installa niente.
3. **La geometria del tavolo è CSS, non JS.** Mazzo, briscola, posto
   dell'oste, centro, presa, mano, foglietto sono aree di una griglia CSS
   (`styles/layout.css`) con `100dvh`. Il JS non calcola mai dove stanno le
   cose: le **misura** (una volta, all'inizio di un volo) e anima la
   differenza (**FLIP**). Così prerender, primo paint, font in ritardo e
   resize non spostano niente (CLS ~0) e ogni builder resta padrone della sua
   area.
4. **Un solo ciclo `requestAnimationFrame`** (`core/ticker.ts`) con fasi
   `read → update → write → render`, fermo quando niente si muove. Le molle
   del volo vivono lì; le trasformazioni si scrivono come variabili CSS **solo
   sugli elementi foglia marcati `data-tajvar`**, solo quando il valore cambia.
5. **Stato lento in uno store con `useSyncExternalStore` + reducer puro**
   (fase del tavolo, carta aperta, presa, scelta della prenotazione, esito);
   **stato caldo** (puntatore, velocità del lancio, molle) in un oggetto
   mutabile `runtime`, mai in React state.
6. **Un DOM solo, due presentazioni.** Le facce leggibili sono componenti di
   contenuto (`sections/Facce`) usati identici dalla carta aperta, dalla
   presa e dalla vista elenco "Leggi come un menù". Il tavolo è un modo di
   presentare quei contenuti, non un secondo testo.
7. **Classi `taj-`, tutto sotto `.taj-root`**, un file CSS per sezione. Nessun
   hex fuori da `styles/tokens.*`.
8. **Nessun accesso a `window`/`document` a livello di modulo**; niente
   `Date`, `Math.random`, `matchMedia` durante il render (il sito fa
   prerender e idrata: il primo render deve essere identico sul server e nel
   browser).

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json` standalone)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` (in `App.tsx` standalone) |

### 1.2 Dev

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

**Non installati di proposito** (e perché, §2): `three`, `@types/three`,
`@react-three/*`, `lenis`, `gsap`, `motion`/`framer-motion`,
`@phosphor-icons/react`, Tailwind, librerie di stato, `@fontsource/*`,
autoprefixer/PostCSS (i due prefissi che servono si scrivono a mano, §5).

### 1.3 Font

Google Fonts, `<link>` iniettato in `useEffect` (come i Concept 1-9) +
`preconnect`. URL di partenza (lo possiede l'art-director in
`styles/tokens.ts` come `FONT_CSS_URL`):

```
https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Literata:ital,wght@0,400;0,600;1,400&display=swap
```

Misurato il 2026-09-26, sottoinsieme latin woff2:

| File | Peso |
|---|---|
| Bagel Fat One 400 | 24,4 KB |
| Literata tondo (400 e 600 sono lo stesso file variabile) | 39,0 KB |
| Literata corsivo 400 (solo nomi friulani dei piatti) | 21,1 KB |
| **Totale** | **84,5 KB** |

Il CD chiede "Literata (asse opsz)". Con l'asse `opsz` esplicito
(`ital,opsz,wght@0,7..72,400..600;1,7..72,400`) i file diventano 85,7 + 47,9
KB: **totale 158 KB**, quasi il doppio, per un testo che resta tutto tra 16 e
18 px (una sola misura ottica: quella di default dei file statici è già
quella da testo). Decisione: **senza asse opsz**. L'art-director può
reintrodurlo solo se lo mostra a schermo su un caso concreto (per esempio il
titolo della carta aperta in Literata grande) e resta dentro il budget font
(§9). Il corsivo può anche scendere a ~3 KB con una seconda richiesta
`&text=` sulle sole parole friulane: ottimizzazione facoltativa per il
performance-auditor.

### 1.4 Ambiente

- Alias `@/` → `src/` (vite e `tsconfig.app.json` `paths`).
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`, `noUnused*`,
  `jsx: react-jsx`, `moduleResolution: bundler`, `types: ["vite/client"]`.
- Dev **9110** (`npm run dev`), preview **9111**, entrambi `strictPort`.
- Target build `es2020`. `manualChunks`: `react` (react, react-dom,
  scheduler, router) a parte; il resto nel chunk `Concept11`.

---

## 2. Scelte motivate

### 2.1 Niente WebGL, niente three

Vincolo del CD (§4.6) e della matrice: 11 è il concept leggero e fisico.
Carte piatte che volano e si girano sono esattamente ciò che CSS 3D fa bene
(compositing su GPU, testo nitido a riposo, accessibilità nativa). Di
conseguenza: nessun `webgl-artist`, nessuno `shader-engineer`, nessun chunk
lazy da 160 KB, nessun fallback "senza WebGL" da mantenere.

### 2.2 Niente GSAP, niente Motion, niente WAAPI come motore

La skill `design-taste-frontend` propone Motion; qui non serve ed è un peso
(~30 KB gz) che il sito non ha. I movimenti ammessi dal CD sono otto (arrivo
della mano, volo/giro/apertura, ripresa, raccolta nella presa, cambio di mano,
calata, carta dell'oste, raccolta della prenotazione). Tutti sono **un
elemento che va da un rettangolo misurato a un altro**, con un giro in Y e
una frenata lunga. Serve:

- **continuità di velocità** tra il trascinamento del dito e il volo (il
  flick parte alla velocità del gesto): una molla integrata sul `dt` la dà
  gratis, WAAPI no (bisognerebbe ricostruire la curva a ogni rilascio);
- **interruzione pulita** (Esc durante un volo): la molla riparte dalla
  posizione e velocità correnti;
- una sola sorgente di tempo con il resto (ticker).

WAAPI resta ammessa **solo** per dissolvenze di 150 ms in reduced motion o
micro stati (decide il motion-designer), mai per il volo.

### 2.3 Niente lenis, niente scroll di pagina

Il tavolo è `position: fixed; inset: 0; height: 100dvh; overflow: hidden`.
Scorrono solo: la faccia di una carta aperta troppo lunga (dentro la carta),
la mano sotto i 360 px (orizzontale, `scroll-snap`), e la vista elenco (che è
l'unica pagina che scorre, con scroll nativo). Nessun listener `scroll`
globale.

### 2.4 Geometria CSS + FLIP

Alternativa scartata: un modulo JS che calcola posizioni e dimensioni di
tutte le carte dalla finestra. Costa layout in JS a ogni resize, rompe il
prerender (sul server non c'è finestra: prima pittura sbagliata e salto
all'idratazione), e costringe tutti i builder a passare da un unico file.
Con la griglia CSS ogni elemento sta dove deve stare già nel primo HTML; il
motore misura sorgente e destinazione con `getBoundingClientRect()` **una
volta all'avvio del volo** (fase `read`), mette l'elemento nella posizione
finale del layout e anima l'inverso (`translate`, `scale`, `rotate`) fino a
zero. A riposo la trasformazione è **nessuna**: testo nitido, hit-test e
scroll interno corretti anche in Safari.

### 2.5 Icone

Il CD chiede Phosphor; la skill vieta icone disegnate a mano. Per non
aggiungere una dipendenza al sito vero, il vector-artist **copia i path**
delle 5-6 icone che servono (freccia sinistra/destra, chiudi, telefono,
mappa/pin, eventuale "elenco") da `@phosphor-icons/core` 2.1.1 (licenza MIT,
scaricato in una cartella temporanea con `npm pack`, non in `package.json`)
in `assets/svg/icone.tsx`, con la nota di licenza in testa al file. Non sono
disegnate: sono quelle della libreria, un solo peso (Regular o Bold, decide
l'art-director).

---

## 3. Struttura delle cartelle

**[S]** = solo app standalone, non si porta. **[P]** = si porta. Tra
parentesi il proprietario (dettaglio in §4).

```
concepts/11-tajut/
├─ DESIGN.md                                   (art-director)  resta nel repo claude250 come doc
├─ docs/                                       un .md per agent
├─ qa/                                         screenshot di QA (ignorati da git)
├─ package.json  package-lock.json             [S] (scaffold)
├─ vite.config.ts                              [S] (scaffold)
├─ tsconfig.json  tsconfig.app.json  tsconfig.node.json  [S] (scaffold)
├─ eslint.config.js  .gitignore                [S] (scaffold)
├─ index.html                                  [S] (scaffold)  lang="it", fondo formica inline, preconnect font, theme-color
├─ public/
│  └─ favicon.svg                              [S] (vector-artist)
└─ src/
   ├─ main.tsx  App.tsx  vite-env.d.ts         [S] (scaffold)  App: /concept-11 lazy; / e * → redirect
   ├─ lib/analytics.ts                         [S] (scaffold)  copia fedele del sito (TrackEvent chiuso)
   ├─ components/ConceptBackButton.tsx         [S] (scaffold)  copia fedele, location.href = "/"
   └─ pages/
      ├─ Concept11.tsx                         [P] (scaffold)  export default () => <Tajut/>
      └─ concepts/tajut/                       [P] TUTTO il concept
         ├─ index.ts                           (scaffold)  export { default } from './Tajut'
         ├─ Tajut.tsx                          (scaffold)  radice .taj-root, font, ticker, ordine sezioni, vista
         │
         ├─ core/                              (scaffold)
         │  ├─ ticker.ts                       unico rAF, fasi read/update/write/render
         │  ├─ capabilities.ts                 prefersReducedMotion + ascolto, isCoarsePointer, hoverFine
         │  ├─ fonts.ts                        injectFonts(), fontsReady()
         │  ├─ viewport.ts                     runtime.viewport, visualViewport (tastiera), vista forzata da zoom
         │  ├─ ancore.ts                       registro di ancore DOM nominate per i voli tra sezioni (§7.3)
         │  ├─ rett.ts                         misura(), deltaFLIP(), centro(): utilità di rettangoli
         │  ├─ annunci.ts                      annuncia(testo) → zona aria-live unica
         │  ├─ parametri.ts                    lettura dei parametri QA dell'URL (§6.5)
         │  └─ links.ts                        LAB_URL, MAPS_URL, TELEFONO_URL (da content)
         │
         ├─ state/                             (scaffold)
         │  ├─ tipi.ts                         re-export dei tipi di content + tipi di stato
         │  ├─ reducer.ts                      riduci(stato, azione): puro, testabile
         │  ├─ store.ts                        store + useTajut(selector) + dispatch + selettori
         │  └─ runtime.ts                      valori caldi mutabili
         │
         ├─ motion/                            (motion-designer)
         │  ├─ easing.ts                       curve (funzioni + stringhe cubic-bezier)
         │  ├─ molla.ts                        molla smorzata integrata sul dt del ticker
         │  ├─ motore.ts                       volo FLIP, lancio da velocità, coda, riposo (§7)
         │  ├─ coreografia.ts                  durate, ritardi, rotazioni fisse della mano, presa, soglie
         │  └─ motion.css                      composizione del transform da var, reduced motion
         │
         ├─ interaction/                       (interaction-designer)
         │  ├─ useTrascina.ts                  trascina/lancia/tocca con Pointer Events (§7.5)
         │  ├─ useManoTastiera.ts              roving tabindex, frecce, Invio/Spazio
         │  ├─ useTastiTavolo.ts               Esc e scorciatoie a livello di tavolo
         │  └─ interaction.css                 hover (solo puntatore fine), focus ad anello, :active
         │
         ├─ content/                           (copywriter)
         │  ├─ testi.ts                        tutti i testi, tipi IdCarta/Seme/Numero, CARTE, TAVOLI, META
         │  ├─ prezzi.ts                       piatti, vini, prezzi di esempio (dati)
         │  └─ orari.ts                        giorni, fasce di pranzo/cena, giorno di chiusura (dati)
         │
         ├─ styles/
         │  ├─ tokens.css                      (art-director) variabili --taj-*, @font-face di ripiego
         │  ├─ tokens.ts                       (art-director) FONT_CSS_URL, COLORI, misure carta in numeri
         │  ├─ materiali.css                   (art-director) laminato, alluminio, faccia, dorso, ombre
         │  ├─ texture/laminato.webp           (art-director) granitura, ≤ 8 KB, ripetuta
         │  ├─ base.css                        (scaffold) reset scoped :where(), tipografia base, .taj-sr
         │  └─ layout.css                      (scaffold) griglia del tavolo, aree, zone riservate, vista elenco
         │
         ├─ assets/
         │  ├─ svg/                            (vector-artist)
         │  │  ├─ semi.tsx                     SpriteSemi (symbol × 4, montato una volta) + <Seme/>
         │  │  ├─ dorso.tsx                    motivo del dorso + marchio "Al Tajut"
         │  │  ├─ icone.tsx                    path Phosphor copiati (MIT)
         │  │  ├─ anello.svg                   cerchio del bicchiere (piano B del posto dell'oste)
         │  │  └─ index.ts                     export
         │  └─ foto/                           (photo-editor)
         │     ├─ <nome>-480.webp  <nome>-960.webp   massimo 4 soggetti
         │     └─ index.ts                     FOTO: { src, srcSet, w, h, credito } per chiave
         │
         └─ sections/
            ├─ Tavolo/        Tavolo.tsx  tavolo.css  Insegna.tsx                       (section-builder-tavolo)
            ├─ Mazzo/         Mazzo.tsx  mazzo.css  Briscola.tsx  PostoOste.tsx          (section-builder-mazzo)
            ├─ Mano/          Mano.tsx  mano.css  CartaInMano.tsx                        (section-builder-mano)
            ├─ Facce/         index.ts  facce.css  FacciaMano.tsx  IndiceAngolo.tsx
            │                 DisposizioneSemi.tsx  disposizioni.ts  FacciaCucina.tsx
            │                 FacciaVino.tsx  FacciaOrari.tsx  FacciaDove.tsx
            │                 FacciaTorneo.tsx  FacciaOste.tsx  FacciaBriscola.tsx      (section-builder-facce)
            ├─ CartaAperta/   CartaAperta.tsx  carta-aperta.css                          (section-builder-carta-aperta)
            ├─ Presa/         Presa.tsx  presa.css                                       (section-builder-presa)
            ├─ Prenotazione/  Prenotazione.tsx  prenotazione.css  CartaScelta.tsx
            │                 Foglietto.tsx  CartaDellOste.tsx  PresaPrenotazione.tsx
            │                 usePrenotazione.ts  calendario.ts  disponibilita.ts  invio.ts (section-builder-prenotazione)
            └─ VistaElenco/   VistaElenco.tsx  vista-elenco.css                          (section-builder-vista-elenco)
```

### 3.1 Le otto sezioni (nomi dal creative-director)

| Cartella / builder | Cosa del CD | Area del tavolo |
|---|---|---|
| `tavolo` | Stato 0: insegna (h1 "Al Tajut", riga di Literata, bottone unico "Prenota un tavolo"), velo formica al 30% con una carta aperta, link "Leggi come un menù" | `insegna`, `velo`, `link-elenco` |
| `mazzo` | il mazzo (dorso), la briscola scoperta sotto (piatto del giorno, `article`), il posto dell'oste vuoto (bicchiere/anello) | `mazzo`, `oste` |
| `mano` | le sei carte in mano: fila irregolare, hover, tocco = gioca, trascinamento, arrivo all'apertura, uscita per la prenotazione | `mano` |
| `facce` | i **contenuti** delle sette facce (6 + briscola), la faccia piccola "da mano", indice d'angolo a doppia testa, disposizione dei semi 1-7 | nessuna: componenti usati dagli altri |
| `carta-aperta` | stato 1: la carta in lettura (region), volo dalla mano, giro, apertura, scroll interno, "Riprendi", ripresa trascinando in giù, uscita verso la presa | `centro` |
| `presa` | le carte giocate (desktop: sparse a destra; < 640: mucchietto con conteggio), riapertura, "Riprendi in mano" | `presa` |
| `prenotazione` | "Cala le tre carte": mano da tre, frecce, foglietto dei punti, calata, carta coperta dell'oste, risposta/scarto/errori, presa della prenotazione nell'angolo | `mano` (in fase prenota), `foglietto`, `centro`, `oste`, `presa-prenotazione` |
| `vista-elenco` | "Leggi come un menù": le sette facce una sotto l'altra, prenotazione in fondo come gruppo normale (riusa `Foglietto`, `CartaScelta` e `usePrenotazione`) | sostituisce il tavolo |

Allineamento con l'ux-architect: se la sua sezione "Sezioni da costruire"
usa nomi diversi, **restano questi nomi di cartella** (stabili per i
proprietari) e l'orchestratore mappa i nomi; se unisce o divide sezioni, la
mappatura dei file va scritta nel doc dello scaffold. L'elenco sopra copre
tutti gli stati del CD §4.2-§4.4.

### 3.2 Regole di porting (valgono già da ora)

- Dentro `tajut/` **nessun import fuori da `tajut/`** tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` e i pacchetti npm.
- Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `navigator`, `Date.now()`, `new Date()`, `Math.random()` a livello di modulo
  **né durante il render**: solo in effetti, handler, o funzioni chiamate da
  loro. Le date della prenotazione si calcolano quando si entra nella
  prenotazione (evento dell'utente), mai nel primo render.
- Asset con i suffissi nativi di Vite (`?url`, `?raw`) o `import` diretto di
  `.webp`/`.svg`; mai da `public/` (tranne la favicon standalone).
- `Concept11.tsx`: `import Tajut from './concepts/tajut'; export default function Concept11() { return <Tajut />; }`.
- Id DOM: sempre con prefisso `taj-` (o `useId()`), mai id nudi: la pagina
  vive nel sito insieme ad altro.

---

## 4. File di competenza esclusiva

Ogni file ha **un solo proprietario**. Tutti possono leggere e importare
tutto. Chi ha bisogno di una modifica altrui la scrive nel proprio doc in
"Richieste ad altri agent". Lo scaffold crea gli stub delle sezioni e di
`sections/Facce/index.ts` con le firme di §6-§8 perché il build sia verde dal
primo minuto; a fine scaffold la proprietà passa ai builder.

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md`, `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts`, `styles/materiali.css`, `styles/texture/laminato.webp` (+ lo script che lo genera, in `docs/` o in `qa/`, non in `src/`) | CSS delle sezioni, `base.css`, `layout.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/molla.ts`, `motion/motore.ts`, `motion/coreografia.ts`, `motion/motion.css` | il ticker (usa la sua API), CSS delle sezioni |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/useTrascina.ts`, `interaction/useManoTastiera.ts`, `interaction/useTastiTavolo.ts`, `interaction/interaction.css` | niente cursore custom, niente preloader, niente tilt (CD §4.7) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/prezzi.ts`, `content/orari.ts` | nessun testo nei componenti |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*`, `public/favicon.svg` | niente figure (Fante, Cavallo, Re), mani, volti, oste disegnato |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*` | niente foto generate, niente carte francesi |

Nessun webgl-artist (CD §4.6).

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`, tutti i file [S] di §3 tranne `public/favicon.svg`; `src/pages/Concept11.tsx`; `tajut/index.ts`, `tajut/Tajut.tsx`; `core/*`; `state/*`; `styles/base.css`, `styles/layout.css`; stub iniziali di `sections/*/*` (poi passano) |
| **section-builder-tavolo** | `sections/Tavolo/*`, `docs/section-builder-tavolo.md` |
| **section-builder-mazzo** | `sections/Mazzo/*`, `docs/section-builder-mazzo.md` |
| **section-builder-mano** | `sections/Mano/*`, `docs/section-builder-mano.md` |
| **section-builder-facce** | `sections/Facce/*`, `docs/section-builder-facce.md` |
| **section-builder-carta-aperta** | `sections/CartaAperta/*`, `docs/section-builder-carta-aperta.md` |
| **section-builder-presa** | `sections/Presa/*`, `docs/section-builder-presa.md` |
| **section-builder-prenotazione** | `sections/Prenotazione/*`, `docs/section-builder-prenotazione.md` |
| **section-builder-vista-elenco** | `sections/VistaElenco/*`, `docs/section-builder-vista-elenco.md` |

Nessuno shader-engineer.

Note:
- `sections/Facce/index.ts` è il **contratto pubblico** usato da mano,
  carta-aperta, presa, mazzo, prenotazione e vista-elenco, che lavorano in
  parallelo al builder delle facce: le firme di §8.1 non si cambiano senza
  passare dall'orchestratore.
- `invio.ts` della prenotazione è **simulato** (nessuna rete): risolve dopo
  700-1100 ms; con `?invio=ko` fallisce, con `?pieno=1` risponde sempre con
  lo scarto (§6.5).

---

## 5. Convenzioni CSS

- **Un file `.css` per sezione, importato dal componente**. Niente CSS
  modules, niente Tailwind, niente CSS-in-JS (motivi del pilota: pattern del
  sito, classi leggibili nei QA, selettori di stato semplici).
- **Prefisso `taj-`**, BEM leggero: `taj-<sezione>`, `taj-<sezione>__<elemento>`,
  `taj-<sezione>--<variante>` (es. `taj-mano__carta`, `taj-presa--mucchietto`).
  Classi dello scaffold: `taj-root`, `taj-tavolo`, `taj-area-*`, `taj-sr`.
  Classi dell'art-director (materiali): `taj-carta` (cartoncino: fondo carta,
  raggio, ombra a riposo), `taj-dorso`, `taj-laminato`, `taj-alluminio`,
  `taj-bottone` (l'unico bottone ocra).
- **Ogni selettore inizia con `.taj-root`**. Niente selettori nudi su `html`,
  `body`, `:root`, `*`. Lo sfondo formica sta su `.taj-root`; il fondo di
  `html`/`body` lo mette `Tajut.tsx` inline al mount e lo rimette allo
  smontaggio (niente strisce nel rimbalzo iOS).
- **Variabili**: `--taj-*`, le definisce solo l'art-director in `tokens.css`.
  Le sezioni possono avere variabili locali `--taj-<sezione>-*`. Le variabili
  del **movimento** (`--taj-tx`, `--taj-ty`, `--taj-rz`, `--taj-ry`, `--taj-rx`,
  `--taj-sc`, `--taj-ombra`) le scrive solo `motion/motore.ts`, solo sugli
  elementi con `data-tajvar`, e la loro composizione in `transform` è in
  `motion/motion.css` (§7.2).
- **Attributi di stato su `.taj-root`** (scritti solo da `Tajut.tsx`):
  `data-fase="tavolo|lettura|prenota|attesa|risposta|scarto"`,
  `data-vista="tavolo|elenco"`, `data-motion="full|reduced"`,
  `data-puntatore="fine|grosso"`.
- **Z-index** (token in `tokens.css`, nient'altro): tavolo 0, carte a riposo
  1, presa 2, carta aperta 3, carta in volo 4, foglietto 5, annunci/salti 6.
  Il `ConceptBackButton` del sito sta a 2147483000 e non va mai coperto.
- **Un solo raggio** (`--taj-raggio`, 6% della larghezza carta, CD §4.1).
- **CSS 3D**: `perspective` solo su `.taj-tavolo` (1600-2200 px, valore
  dell'art-director/motion); le carte che si girano `transform-style:
  preserve-3d` **solo durante il volo**; facce con `backface-visibility:
  hidden` **e** `-webkit-backface-visibility: hidden` (niente autoprefixer).
  `.taj-root` non ha mai `transform`, `filter`, `perspective`, `contain`,
  `container-type`: i figli fissi restano agganciati alla finestra.
- Unità: `rem` per il testo, `clamp()` per misure fluide, `dvh`/`svh` per le
  altezze. Mai `100vh` puro.
- `touch-action: none` **solo** sulle carte trascinabili (mano, carta aperta,
  tre carte della prenotazione); il tavolo resta `manipulation` (il browser
  deve poter zoomare).
- Animare solo `transform` e `opacity`. Le ombre delle carte sono uno
  pseudo-elemento sfocato una volta, di cui si animano `opacity`/`transform`
  (`--taj-ombra`), mai `box-shadow` animato. `will-change: transform` solo
  durante il volo (lo mette e lo toglie il motore con `data-in-volo`).

Ordine dei CSS in `Tajut.tsx`: `tokens.css` → `base.css` → `layout.css` →
`materiali.css` → `motion/motion.css` → `interaction/interaction.css` → CSS di
sezione (importati dai componenti, in ordine di montaggio). `base.css` usa
`:where()` per restare a specificità minima.

---

## 6. Stato condiviso

### 6.1 Tipi di contenuto (li definisce il copywriter in `content/testi.ts`)

```ts
export type Seme = 'spade' | 'coppe' | 'denari' | 'bastoni';
export type Numero = 1 | 2 | 3 | 4 | 5 | 6 | 7;              // solo numerali: 8, 9, 10 sono figure
export type IdCarta = 'cucina' | 'vino' | 'orari' | 'dove' | 'torneo' | 'oste';   // la mano, in quest'ordine
export type IdFaccia = IdCarta | 'briscola';
export interface MetaCarta { id: IdFaccia; seme: Seme; numero: Numero; titoloBreve: string; titolo: string; nomeAccessibile: string }
export const CARTE: Readonly<Record<IdFaccia, MetaCarta>>;
export const ORDINE_MANO: readonly IdCarta[];                 // ['cucina','vino','orari','dove','torneo','oste']
```

Seme/numero dal CD §4.2: cucina = 3 di spade, vino = 5 di coppe, orari = 6
di denari, dove = 4 di bastoni, torneo = 2 di coppe, oste = asso di bastoni,
briscola = 7 di spade. `state/tipi.ts` li **re-esporta** (una sola fonte).

### 6.2 Store lento: `state/store.ts` + `state/reducer.ts`

Store esterno senza librerie, letto con `useSyncExternalStore` e selettore.
Il reducer è una funzione **pura** (niente date, niente DOM): chi ha bisogno
di "oggi" lo calcola fuori e lo passa nell'azione.

```ts
export type Fase = 'tavolo' | 'lettura' | 'prenota' | 'attesa' | 'risposta' | 'scarto';
export type Vista = 'tavolo' | 'elenco';
export interface Scelta { giorno: string /* 'YYYY-MM-DD', Europe/Rome */; ora: string /* '20.00' */; persone: number /* 1..7; 8 = "otto o più" */ }
export interface Esito { tavolo: Numero; scelta: Scelta; nome: string; torneo: boolean }
export interface Scarto { scelta: Scelta; proposte: readonly [Scelta, Scelta] }
export interface Volo { id: string; verso: 'centro' | 'presa' | 'mano' | 'oste' | 'raccolta' }

export interface TajutState {
  fase: Fase;
  aperta: IdFaccia | null;           // carta in lettura (anche la briscola, se ux la rende giocabile)
  presa: readonly IdCarta[];         // carte giocate, in ordine
  volo: Volo | null;                 // cosa sta volando: serve a chi deve nascondere l'arrivo (§7.3)
  vistaScelta: Vista;                // scelta dell'utente
  vistaForzata: boolean;             // zoom forte / finestra troppo piccola (§8.4)
  scelta: Scelta | null;             // null finché non si entra nella prenotazione
  torneo: boolean;
  esito: Esito | null;
  scarto: Scarto | null;
  erroreRete: boolean;
  prenotazioneFatta: Esito | null;   // la presa nell'angolo "per tutta la visita" (solo memoria)
  reducedMotion: boolean;
  puntatoreFine: boolean;
  qa: { invioKo: boolean; pieno: boolean };
}

export type Azione =
  | { tipo: 'GIOCA'; id: IdFaccia }            // tavolo|lettura → lettura; la carta prima aperta va nella presa
  | { tipo: 'RIPONI' }                          // lettura → tavolo; la carta aperta va nella presa
  | { tipo: 'RIPRENDI_TUTTO' }                  // presa svuotata, tutto in mano
  | { tipo: 'VOLO'; volo: Volo | null }         // solo il motore/i builder a inizio e fine volo
  | { tipo: 'APRI_PRENOTAZIONE'; scelta: Scelta }   // scelta iniziale calcolata da calendario.ts
  | { tipo: 'SCEGLI'; scelta: Scelta }
  | { tipo: 'TORNEO'; valore: boolean }
  | { tipo: 'CALA' }                            // prenota → attesa
  | { tipo: 'ESITO'; esito: Esito }             // attesa → risposta
  | { tipo: 'SCARTO'; scarto: Scarto }          // attesa → scarto
  | { tipo: 'ERRORE_RETE' }                     // attesa → prenota, erroreRete = true
  | { tipo: 'PROPOSTA'; scelta: Scelta }        // scarto → prenota con la scelta proposta
  | { tipo: 'TORNA_ALLE_CARTE' }                // prenota|risposta|scarto → tavolo (esito → prenotazioneFatta)
  | { tipo: 'VISTA'; vista: Vista }
  | { tipo: 'VISTA_FORZATA'; valore: boolean }
  | { tipo: 'AMBIENTE'; reducedMotion?: boolean; puntatoreFine?: boolean };

export function riduci(s: TajutState, a: Azione): TajutState;   // transizioni non ammesse → stesso oggetto (nessun avviso)

export const store: { get(): TajutState; dispatch(a: Azione): void; subscribe(fn: () => void): () => void };
export function useTajut<T>(sel: (s: TajutState) => T, isEqual?: (a: T, b: T) => boolean): T;
export function inizializzaStore(o: { search: string; reducedMotion: boolean; puntatoreFine: boolean }): TajutState;  // solo Tajut.tsx

// selettori
export function selVista(s: TajutState): Vista;          // vistaForzata ? 'elenco' : vistaScelta
export function selInMano(s: TajutState): readonly IdCarta[];   // ORDINE_MANO meno presa e aperta
export function selOccupato(s: TajutState): boolean;     // fase 'attesa' o volo in corso
```

Regole:
- I componenti chiamano `store.dispatch`, mai uno `set` generico. La macchina
  a stati completa (tutte le transizioni e i ritorni) la disegna
  l'ux-architect; il reducer la implementa **alla lettera** e lo scaffold
  documenta nel suo doc ogni differenza.
- **Nome e telefono non entrano nello store** mentre si scrivono: sono stato
  locale di `usePrenotazione` (come il contatto del banco nel pilota). Il
  nome entra solo nell'`Esito` confermato; il telefono mai.
- **Nessuna persistenza**: niente `localStorage`. Il CD vuole che chi riapre
  trovi le carte sempre nello stesso posto (§4.7), e i dati personali non si
  salvano. `prenotazioneFatta` vive finché la pagina è montata.
- Lo store è un singleton di modulo **re-inizializzato** al mount di
  `Tajut.tsx`: uscire e rientrare nel sito vero riparte da capo.

### 6.3 Valori caldi: `state/runtime.ts`

Oggetto mutabile, **mai** in React state, letto e scritto nel ticker e negli
handler dei puntatori:

```ts
runtime.viewport     // { w, h, dpr, vvH, vvTop }  (vv = visualViewport, per la tastiera del telefono)
runtime.puntatore    // { x, y, vx, vy, attivo, tipo: 'mouse'|'touch'|'pen', idCarta: string | null }
runtime.voli         // Map<string, StatoVolo> del motore (posizione, velocità, target per proprietà)
runtime.reset()      // Tajut.tsx al mount
```

La velocità del puntatore la calcola `useTrascina` sugli ultimi ~80 ms di
campioni (in px/ms); il motore la legge al rilascio come velocità iniziale
della molla.

### 6.4 Annunci e fuoco

- `core/annunci.ts`: `annuncia(testo: string)`. Una sola zona
  `aria-live="polite"` montata da `Tajut.tsx`; lo stesso testo ripetuto viene
  riannunciato (contatore interno). I testi degli annunci sono del
  copywriter (`testi.ts`, gruppo `ANNUNCI`).
- Fuoco: quando una carta si apre, il builder della carta aperta mette il
  fuoco sul titolo (`tabIndex={-1}`, `focus({ preventScroll: true })`)
  **appena l'elemento è visibile** (primo frame del volo, non alla fine);
  alla chiusura il fuoco torna alla carta in mano di partenza o, se è
  finita nella presa, alla carta nella presa. Stesso schema per la
  prenotazione (fuoco sulla prima carta della mano da tre; errore → primo
  campo sbagliato; risposta → titolo della carta dell'oste).

### 6.5 Parametri dell'URL (solo lettura al mount, per QA)

| Parametro | Effetto |
|---|---|
| `?vista=elenco` | parte nella vista elenco |
| `?carta=<IdFaccia>` | parte con quella carta già aperta, senza volo |
| `?prenota=1` | parte nella mano da tre |
| `?invio=ko` | l'invio simulato fallisce (stato errore di rete) |
| `?pieno=1` | l'oste risponde sempre con la carta di scarto |

Nessuna voce di cronologia: aprire una carta o prenotare non fa
`pushState` (il tasto indietro del browser deve uscire dal concept come
dalle altre pagine del sito). Nessun hash.

---

## 7. Il motore delle carte

### 7.1 Ticker: `core/ticker.ts` (scaffold)

```ts
export type FaseTicker = 'read' | 'update' | 'write' | 'render';
export type TickFn = (dt: number, now: number) => boolean | void;   // true = "ho ancora da fare"
export const ticker: {
  add(fn: TickFn, fase?: FaseTicker): () => void;   // default 'update'; sveglia il ciclo
  wake(): void;
  attiva(): () => void;                             // pausa con visibilitychange; solo Tajut.tsx
  readonly running: boolean;
};
```

Ordine del frame: `read` (misure, solo all'avvio dei voli) → `update` (molle)
→ `write` (variabili CSS sui `data-tajvar`) → `render` (riservata: qui non
c'è GL; la usa solo chi deve fare un commit a fine frame, es. togliere
`data-in-volo` e rimettere la carta a riposo). `dt` in secondi, limitato a
[0, 0.05], 1/60 al primo frame dopo un risveglio. Il ciclo si ferma quando
nessuna fn restituisce `true`: **zero frame a tavolo fermo**. **Nessun altro
`requestAnimationFrame`, `setInterval` o `setTimeout` per animare** nel
concept.

### 7.2 Composizione del transform (motion-designer, `motion.css`)

Un elemento che vola ha `data-tajvar` e una sola regola di composizione,
per esempio:

```css
.taj-root [data-tajvar][data-in-volo] {
  transform: translate3d(var(--taj-tx, 0px), var(--taj-ty, 0px), 0)
             rotateZ(var(--taj-rz, 0deg)) rotateX(var(--taj-rx, 0deg))
             rotateY(var(--taj-ry, 0deg)) scale(var(--taj-sc, 1));
  transform-origin: 0 0;          /* FLIP con translate+scale dall'angolo */
  transform-style: preserve-3d;
  will-change: transform;
}
```

L'ordine esatto e l'origine li fissa il motion-designer; il contratto è:
**a riposo `data-in-volo` non c'è, le variabili sono tolte e il transform è
`none`** (testo nitido, scroll interno e hit-test corretti, niente contesto
3D attorno a un `overflow: auto`, che in Safari è instabile). Le rotazioni di
riposo delle carte in mano e nella presa (−5°, −1°, 3°…) sono CSS statico
dei builder (`rotate` con valori fissi da `coreografia.ts`), non variabili
del motore.

### 7.3 Voli tra sezioni: FLIP con ancore

Un volo va quasi sempre da un'area di un builder a quella di un altro
(mano → centro, centro → presa, mazzo → mano da tre, oste → centro,
tre carte + oste → angolo). Per non far dipendere i builder dai componenti
altrui:

```ts
// core/ancore.ts (scaffold)
export type NomeAncora = 'mazzo' | 'briscola' | 'oste' | 'centro' | 'presa' | 'presa-prenotazione'
  | `mano:${IdCarta}` | `presa:${IdCarta}` | `scelta:${'giorno' | 'ora' | 'persone'}`;
export function useAncora(nome: NomeAncora): (el: HTMLElement | null) => void;   // ref callback
export function ancora(nome: NomeAncora): HTMLElement | null;
```

Contratto del motore (motion-designer, `motion/motore.ts`; firme esatte nel
suo doc, queste sono il minimo che i builder usano):

```ts
export interface OpzioniVolo {
  da: NomeAncora | DOMRect;          // sorgente: ancora o rettangolo già misurato
  giro?: 'faccia' | 'dorso' | 'nessuno';   // rotateY 0→180 (o viceversa) durante il volo
  velocita?: { vx: number; vy: number };   // px/ms dal lancio: parte da lì
  rotazioneArrivo?: number;          // residua in gradi, poi a 0 all'apertura
  profilo?: keyof typeof PROFILI;    // durata/molla da coreografia.ts
}
export function vola(el: HTMLElement, o: OpzioniVolo): Promise<'arrivato' | 'interrotto'>;
export function riponi(el: HTMLElement): void;          // stato di riposo immediato (reduced motion, smontaggio)
export function accoda(fn: () => void): void;           // input durante un volo: coda di 1, l'ultimo vince
export function occupato(): boolean;
```

Sequenza tipica (carta giocata):
1. l'handler (tocco, tastiera o fine trascinamento) chiama
   `accoda(() => store.dispatch({ tipo: 'GIOCA', id }))`;
2. React rende la carta aperta **nella sua posizione finale** (area `centro`);
3. in `useLayoutEffect` (prima della pittura) il builder chiama
   `vola(el, { da: 'mano:vino', giro: 'faccia', velocita })`: il motore misura
   sorgente e destinazione, scrive subito l'inverso (nessun lampo nella
   posizione finale) e avvia la molla;
4. il builder della mano nasconde la carta di partenza finché
   `store.volo?.id === 'vino'` (con `visibility: hidden`, non `display:none`:
   la misura deve restare possibile); al termine `dispatch({ tipo: 'VOLO', volo: null })`.

La carta aperta ha **due facce**: il fronte è `FacciaMano` (quella piccola,
`aria-hidden`, disegnata in unità relative alla larghezza carta così che,
scalata, coincida con la carta in mano), il retro è la faccia leggibile. Il
giro in Y porta dalla prima alla seconda. Stesso schema per le tre carte
della prenotazione (dorso → faccia) e per la carta dell'oste.

"Al massimo una carta in volo" (CD §4.3) vale per i voli di gioco/ripresa.
Le coreografie di gruppo (uscita delle sei, arrivo delle tre a 120 ms,
calata, raccolta) sono voli multipli lanciati dallo stesso builder e contano
come un solo evento per la coda.

### 7.4 Reduced motion

`store.reducedMotion` (anche `data-motion="reduced"`): `vola()` non anima,
chiama `riponi()` e risolve subito; la comparsa è una dissolvenza CSS di
150 ms scritta in `motion.css`. Nessun giro, nessun volo, nessuna raccolta
animata, cambio di valore delle tre carte istantaneo (CD §4.9). La
preferenza è ascoltata dal vivo (`capabilities.ts`): se cambia a metà visita,
i voli in corso vengono messi a riposo.

### 7.5 Trascinamento: `interaction/useTrascina.ts`

Contratto (firma esatta nel doc dell'interaction-designer):

```ts
useTrascina(ref, {
  soglia: 6,                               // px prima di diventare trascinamento; sotto = tocco
  onTocco: () => void,                     // = gioca (la via normale, CD §4.3)
  onMuovi: (dx, dy) => void,               // la carta segue il dito (il builder scrive via motore)
  onRilascio: (esito: { vx, vy, dx, dy, lanciata: boolean }) => void,   // lanciata = soglia di velocità/distanza verso il tavolo
  attivo?: boolean,
});
```

Pointer Events unificati, `setPointerCapture`, niente eventi touch/mouse
separati, niente `preventDefault` su `pointerdown` (non deve bloccare il
fuoco né lo zoom fuori dalle carte). Durante il trascinamento la posizione
della carta la scrive il motore nella fase `write` (mai `setState` per ogni
movimento). Il trascinamento non è mai l'unico modo: tocco, tastiera,
bottoni (CD §4.9).

---

## 8. Layout del tavolo e contratti tra sezioni

### 8.1 Contratto di `sections/Facce/index.ts`

```ts
export function FacciaMano(p: { id: IdFaccia; className?: string }): JSX.Element;      // indice + seme + titolo breve; unità relative
export function FacciaLettura(p: { id: IdFaccia; idTitolo: string; conFoto?: boolean }): JSX.Element;  // contenuto leggibile + titolo (h2) con id
export function IndiceAngolo(p: { numero: Numero; seme: Seme }): JSX.Element;         // doppia testa: alto-sx e basso-dx ruotato 180°
export function DisposizioneSemi(p: { numero: Numero; seme: Seme; className?: string }): JSX.Element;  // 1..7 semi nelle posizioni classiche
export const DISPOSIZIONI: Readonly<Record<Numero, readonly { x: number; y: number; capovolto: boolean }[]>>;  // percento del campo
```

Le facce **non** conoscono il tavolo: niente posizione, niente volo, niente
stato. Ricevono l'id e leggono i testi da `content/`. La carta dell'oste
(numero del tavolo) e le tre carte della prenotazione usano `IndiceAngolo` e
`DisposizioneSemi` con numero e seme calcolati.

### 8.2 La griglia del tavolo (`styles/layout.css`, scaffold)

`.taj-tavolo` (il `main`) è una griglia a tutta finestra con aree nominate.
Le proporzioni vengono dai wireframe dell'ux-architect e dalle misure
dell'art-director; lo schema:

| Area | 375 × 667 (progetto) | 1440 × 900 |
|---|---|---|
| `mazzo` + `briscola` | in alto a sinistra, briscola ~132 px | in alto a sinistra, **dopo** la zona del bottone del sito |
| `oste` | in alto a destra, piccolo | in alto a destra |
| `insegna` | sotto il mazzo, "Al" / "Tajut" 44-52 px | centro-alto |
| `centro` | carta aperta 88% × fino al 74%, spostata in su | a sinistra del centro, ≤ 440 px di larghezza |
| `presa` | mucchietto in alto a destra con conteggio | si allarga a destra del centro |
| `mano` | fascia bassa 180-200 px | fascia bassa |
| `foglietto` | sopra la mano (prenotazione) | accanto alle tre carte |
| `link-elenco` | in cima alla mano, a destra | sopra la mano, a destra |

- **Zone riservate** (variabili in `layout.css`, usate da tutti):
  `--taj-zona-back-w: 230px; --taj-zona-back-h: 44px` in alto a sinistra da
  641 px in su; `--taj-zona-back-w: 210px` in basso a sinistra fino a 640
  px. In quelle zone **nessun** elemento interattivo; sotto 640 px la mano
  parte `calc(var(--taj-zona-back-w) + …)` più a destra **oppure** sale sopra
  il bottone (lo decide l'ux, lo implementa lo scaffold in `layout.css`).
- `env(safe-area-inset-*)` sui quattro lati.
- **Orizzontale basso** (`(orientation: landscape) and (max-height: 500px)`):
  la mano diventa una colonna sul lato destro (CD §4.8).
- **2560**: le carte hanno un tetto (carta aperta ≤ 440 px), il tavolo
  cresce, le carte no.
- **Tastiera del telefono** nella prenotazione: `core/viewport.ts` scrive
  `--taj-vv-h` e `--taj-vv-top` su `.taj-root` **solo quando cambiano**
  (evento `resize` di `visualViewport`, non a ogni frame); il foglietto resta
  visibile e le carte scendono.

### 8.3 Ordine del DOM montato da `Tajut.tsx`

```html
<div class="taj-root" data-fase data-vista data-motion data-puntatore>
  <ConceptBackButton/>                       <!-- del sito -->
  <SpriteSemi/>                              <!-- svg nascosto con i 4 <symbol> id taj-seme-* -->
  <!-- vista 'tavolo' -->
  <main class="taj-tavolo taj-laminato" aria-labelledby="taj-titolo">
    <Tavolo/>          <!-- h1#taj-titolo "Al Tajut, osteria a …", riga, bottone, velo, link elenco -->
    <Mazzo/>           <!-- mazzo, article della briscola, posto dell'oste -->
    <CartaAperta/>     <!-- region con aria-labelledby sul titolo della faccia -->
    <Presa/>
    <Mano/>            <!-- ul di button; in fase prenota è sostituita -->
    <Prenotazione/>    <!-- montata dalla fase prenota in poi, e la sua presa d'angolo dopo -->
  </main>
  <!-- vista 'elenco' -->
  <VistaElenco/>       <!-- main scorrevole, stesso h1 -->
  <div class="taj-sr" aria-live="polite">…</div>   <!-- annunci -->
</div>
```

L'ordine del DOM è l'ordine di lettura per tastiera e lettori di schermo; la
posizione visiva la dà la griglia. L'ux-architect può cambiare l'ordine
(es. mano prima della carta aperta): lo si cambia qui, non nelle cartelle.

### 8.4 Vista elenco e vista forzata

- `selVista` = `elenco` se l'utente l'ha scelta **o** se la finestra CSS è
  troppo piccola per la carta aperta (zoom forte). Soglia iniziale in
  `core/viewport.ts`: `w < 320 || h < 300` px CSS (1440×900 al 400% → 360×225:
  elenco; telefono orizzontale 667×~320: tavolo; 200% → 720×450: tavolo).
  L'ux-architect può cambiarla; con vista forzata il link per tornare al
  tavolo è nascosto.
- Passare da una vista all'altra mantiene la scelta della prenotazione e
  l'esito (sono nello store); il fuoco va all'h1 della vista nuova.

### 8.5 Prerender e senza JS (differenza consapevole dal CD)

Il CD (§4.2) vuole la vista elenco anche come "versione prerender / senza
JS". Farla diventare il primo render vorrebbe dire: nel sito, HTML
prerenderizzato a elenco, poi all'idratazione il salto al tavolo (lampo,
CLS enorme, LCP spostato). Scelta:
- il primo render (server e client) è **sempre il tavolo**, identico, senza
  dipendere da finestra o data (§3.2);
- nel prerender ci sono già h1, riga, briscola, i sei bottoni della mano
  con i nomi completi ("Tre di spade. In cucina oggi: tre piatti") e **tutte
  le facce leggibili** dentro la carta aperta come `article hidden` (il testo
  è nell'HTML per i motori di ricerca e per l'idratazione, senza essere
  letto due volte);
- la vista elenco resta ciò che il CD vuole per lettori di schermo, zoom e
  tastiera: sempre disponibile, stesso contenuto, stessi componenti.
Il seo-engineer (ondata 4) decide se aggiungere un `<noscript>` minimo.

---

## 9. Budget di performance

Misurati dal performance-auditor sulla build standalone (Lighthouse mobile
e desktop, `vite preview` su 9111).

| Voce | Budget |
|---|---|
| JS del concept (chunk `Concept11`, senza react/router) | ≤ **60 KB gz** (obiettivo 35: niente librerie) |
| JS iniziale totale standalone (con react, react-dom, router) | ≤ **100 KB gz** |
| CSS totale del concept | ≤ **24 KB gz** |
| WebGL | **nessuno** (budget lazy 160 KB non usato) |
| Font woff2 latin | ≤ **100 KB** (oggi 84,5; con opsz sarebbe 158: fuori) |
| Foto | massimo **4 soggetti**, webp 480 e 960 px di larghezza; ≤ **35 KB** la 480, ≤ **80 KB** la 960; nel primo paint solo la briscola |
| SVG (sprite semi + dorso + icone + anello) | ≤ **14 KB** non gz, inline nel JS |
| Texture laminato | ≤ **8 KB**, una sola, ripetuta |
| LCP | ≤ **2,5 s** mobile, ≤ **1,5 s** desktop; elemento atteso: l'h1 "Al Tajut" (testo, visibile al primo paint, **mai** dentro un'animazione d'ingresso) |
| CLS | ≤ **0,02** (griglia fissa in `dvh`, carte a misura fissa, `aspect-ratio` e `width`/`height` sulle foto, `@font-face` di ripiego con `size-adjust` dell'art-director) |
| INP | ≤ **150 ms** (tocco su una carta: dispatch + render della sola carta aperta; le facce sono `memo`, nessun re-render della mano durante il volo) |
| TBT | ≤ **150 ms** mobile |
| Movimento | solo `transform`/`opacity`; 60 fps desktop, ≥ 50 su mobile medio; nessun long task > 50 ms durante un volo (CPU 4× a 390 px) |
| Frame a riposo | **0** (ticker fermo) |
| Livelli compositi | carte a riposo **senza** `will-change`; in volo al massimo 4 elementi promossi (3 carte + oste) |
| Lampeggio | nessuna grande superficie cambia colore più di 1 volta ogni 500 ms; massimo 3 cambi al secondo in assoluto |

---

## 10. Strategia di caricamento

1. **HTML + CSS**: `index.html` (standalone) ha il fondo formica inline e
   `theme-color` formica, così non c'è lampo bianco. Il tavolo compare
   completo col primo CSS: niente preloader, niente "sto mescolando" (CD
   §4.7). Il `Suspense` di `App.tsx` ha `fallback={null}`.
2. **Font**: `preconnect` + `<link>` iniettato al mount da `core/fonts.ts`,
   `display=swap`; ripieghi metrici dell'art-director in `tokens.css`. L'h1
   è in Bagel: il ripiego tarato evita il salto.
3. **Arrivo della mano** (400 ms, una volta): parte **dopo** il primo paint e
   dopo `fontsReady()` con tetto di 600 ms, così la mano non arriva con il
   font sbagliato; con reduced motion le carte sono già al loro posto.
4. **Foto**: la briscola `loading="eager"`, `decoding="async"`,
   `fetchpriority="high"` se è più grande dell'h1 (lo verifica il
   performance-auditor), `srcset` 480/960 con `sizes`. Le altre foto sono
   dentro facce `hidden`: `loading="lazy"` e in più un **precarico in idle**
   (`requestIdleCallback`, ripiego `setTimeout` 1500 ms) scritto dal builder
   della carta aperta, così la foto c'è già quando la carta si gira. Al
   passaggio del puntatore (fine) su una carta in mano si precarica la sua.
5. **SVG**: sprite dei semi inline una volta (`<symbol>` + `<use href>`), mai
   ripetuto per ogni seme. Colore principale `currentColor` (prugna),
   secondo colore via `style="fill: var(--taj-seme-accento)"` dentro il
   simbolo (le variabili CSS ereditano nell'albero di `<use>`, i selettori
   no). Id `taj-seme-coppe|denari|spade|bastoni`.
6. **Idratazione**: primo render identico al server; `reducedMotion`,
   `puntatoreFine`, `vistaForzata` e parametri dell'URL si leggono
   nell'inizializzatore di `useState` di `Tajut.tsx` **solo nel browser**
   (guardia `typeof window`), come nel pilota; se nel sito vero questo
   creasse un mismatch di idratazione, si spostano in un `useLayoutEffect`
   (punto da verificare al porting, lo annota lo scaffold).
7. **Smontaggio**: ticker fermo, voli a riposo, listener tolti, fondo di
   `html`/`body` e `<link>` dei font rimessi come prima (solo se aggiunti
   qui), `AbortController` sull'invio simulato in corso.

### 10.1 Fallback

- **Niente WebGL** per costruzione: non c'è fallback da gestire.
- **CSS 3D non disponibile** (nessun browser attuale): `@supports not
  (transform-style: preserve-3d)` → voli senza giro (solo traslazione e
  dissolvenza tra le facce). Lo scrive il motion-designer in `motion.css`.
- **Reduced motion**: §7.4.
- **Zoom / finestra piccola**: vista elenco forzata (§8.4).
- **Storage bloccato**: irrilevante, non si usa.

---

## 11. Analytics

`import { track } from '@/lib/analytics'`. Firma del sito:
`track(event: TrackEvent, params?: Record<string, string | number | boolean | undefined>)`,
`TrackEvent` unione chiusa (copiata dallo scaffold). Solo due eventi:

| Evento | Dove | Params |
|---|---|---|
| `apri_concept` | `Tajut.tsx`, una volta per montaggio (guardia StrictMode) | `{ concept: 11 }` |
| `demo_prenotazione` | builder prenotazione, **una volta**, quando l'oste gira la carta col numero | `{ concept: 11, persone, fascia: 'pranzo' \| 'cena', torneo }` (mai nome né telefono) |

Scarto, errore di rete, carte giocate, vista elenco: **non si tracciano**.

---

## 12. Comandi e porte

Dalla cartella `concepts/11-tajut/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile dello scaffold) |
| `npm run dev` | Vite su **http://localhost:9110** (`strictPort`); `/` e ogni percorso → `/concept-11` |
| `npm run build` | build in `dist/` |
| `npm run preview` | `dist/` su **http://localhost:9111** (fallback SPA: `/concept-11` regge il ricaricamento) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: **da lanciare prima di dire "fatto"** |

Porte del concept: **9110-9119**, sempre `--strictPort`, ognuno chiude il
proprio server, mai uccidere processi altrui. Le ondate non si
sovrappongono, quindi le porte si riusano tra ondate:

| Ondata | Porte |
|---|---|
| 2 | art-director 9112, motion-designer 9113, interaction-designer 9114, vector-artist 9115 (render SVG), photo-editor 9116 (se serve) |
| 3 | scaffold 9110 (da solo); poi tavolo 9112, mazzo 9113, mano 9114, facce 9115, carta-aperta 9116, presa 9117, prenotazione 9118, vista-elenco 9119 (`npx vite --port <p> --strictPort`) |
| 4 | responsive-tester 9111 (preview), accessibility 9112, performance 9113, cross-browser 9114, seo 9115 (`npx vite preview --port <p> --strictPort`) |

URL di prova: `/concept-11?vista=elenco`, `?carta=vino`, `?prenota=1`,
`?prenota=1&invio=ko`, `?prenota=1&pieno=1`.

---

## 13. Checklist per chi scrive codice

- Segui `design-taste-frontend` e `full-output-enforcement`: niente file
  troncati, niente placeholder, niente TODO.
- Solo i tuoi file (§4). Ciò che è condiviso passa da store, runtime,
  ancore, motore, token, `Facce/index.ts`: non duplicare costanti.
- Nessun `requestAnimationFrame` fuori dal ticker; nessun `setState` per
  valori continui (trascinamento, molle).
- Nessun hex fuori da `styles/tokens.*`; ocra mai come colore di testo.
- Nessun accesso al browser a livello di modulo o nel render; niente `Date`
  e `Math.random` nel render (le rotazioni "a caso" della presa sono
  pseudo-casuali deterministiche da id e posizione, così il tavolo è sempre
  uguale).
- Ogni gesto ha tocco + tastiera + bottone; ogni stato ha un annuncio.
- Testi solo da `content/`; niente trattini lunghi nei testi visibili.
- Prima di consegnare: `npm run check` verde, pagina aperta sulla propria
  porta senza errori in console a 375, 768, 1440.

---

## 14. Differenze consapevoli rispetto al creative-director

| Punto | CD | Scelta | Perché |
|---|---|---|---|
| Literata | "asse opsz" | file senza asse opsz (84,5 KB contro 158) | testo tutto tra 16 e 18 px; l'art-director può reintrodurlo se lo mostra utile e sta nel budget |
| Vista elenco | anche "versione prerender / senza JS" | il primo render è il tavolo; le facce sono comunque nell'HTML come `article hidden` | evitare il salto elenco → tavolo all'idratazione (CLS, LCP) |
| Input durante un volo | "si accodano" | coda di 1, l'ultimo input sostituisce quello in attesa | tre tocchi veloci non devono diventare tre voli in fila |
| Icone Phosphor | libreria | path copiati da `@phosphor-icons/core` (MIT) in `assets/svg/icone.tsx` | stesse icone, nessuna dipendenza nuova nel sito |
| Stato | "reducer" | reducer puro dentro uno store `useSyncExternalStore` | selettori fini: la mano non si ri-renderizza quando cambia la prenotazione |

---

## 15. Richieste ad altri agent

- **ux-architect**: (1) la sezione "Sezioni da costruire" dovrebbe coincidere
  con le otto di §3.1 (tavolo, mazzo, mano, facce, carta-aperta, presa,
  prenotazione, vista-elenco); se no, indicare la mappatura. (2) Il
  diagramma degli stati usi le fasi di §6.2 (`tavolo`, `lettura`, `prenota`,
  `attesa`, `risposta`, `scarto`) o dica come si traducono. (3) Confermare o
  cambiare la soglia della vista forzata (§8.4) e la scelta tra "mano
  spostata a destra" e "mano sopra il bottone del sito" a 375 (§8.2). (4)
  Dire se la briscola è giocabile (si apre come carta) o solo leggibile sul
  mazzo.
- **copywriter**: esportare da `content/testi.ts` i tipi e le costanti di
  §6.1 con quei nomi esatti, più `TAVOLI` (sette righe, una per tavolo),
  `ANNUNCI`, `META` (title/description "Concept di Ciceri Lab"), recapiti
  di esempio per `core/links.ts` (`telefonoHref`, `mapsQuery`); orari e
  fasce in `content/orari.ts` come dati (li usano sia la faccia degli orari
  sia il calendario della prenotazione: una sola fonte).
- **art-director**: `FONT_CSS_URL` come in §1.3; `@font-face` di ripiego con
  `size-adjust` per Bagel e Literata; misure della carta come numeri in
  `tokens.ts` (rapporto 1 : 1,9, raggio 6%) per motore e builder; z-index di
  §5 come token.
- **motion-designer**: rispettare il contratto minimo di §7.3 (`vola`,
  `riponi`, `accoda`, `occupato`) e la regola "a riposo transform none";
  `coreografia.ts` con le rotazioni fisse della mano e le soglie del lancio.
- **interaction-designer**: `useTrascina` con la firma di §7.5; nessun
  `preventDefault` fuori dalle carte.
- **vector-artist**: sprite con `<symbol>` e colore secondario via variabile
  (§10 punto 5); icone copiate da Phosphor, non disegnate (§2.5).
- **photo-editor**: `assets/foto/index.ts` con `{ src, srcSet, w, h, credito }`
  per chiave (`briscola`, `cucina`, `vino`, `dove`, `oste`), solo quelle
  verificate; le carte senza foto semplicemente non hanno la chiave.
