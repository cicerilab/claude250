# Tech architect · Concept 17 · MADRE

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, contratti tra moduli, stato condiviso, budget, caricamento e
fallback.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga 17, paragrafo
"17 · MADRE", verifica incrociata), `concepts/10-torchio/docs/integrazione-sito.md`,
`concepts/17-madre/docs/creative-director.md` (tutto),
`concepts/17-madre/docs/brand-strategist.md` (prodotti, prezzi, regole della
settimana, recapiti), `tech-architect.md` e `scaffold-engineer.md` del pilota,
il codice del pilota (`package.json`, `ConceptBackButton.tsx`, stub
`analytics.ts`). Per coerenza di formato ho guardato anche il doc del 18. Il
pilota è riferimento di formato e architettura, mai di design.

Verifiche fatte da questo agent il 26/09/2026 (Node 22.22.2, registry npm
raggiungibile):
- versioni con `npm view` (three 0.160.1 esiste; le ultime major di React,
  Router, Vite e TS sono fuori dallo stack del sito e **non** si usano);
- **peso reale del chunk three** per la scena dell'impasto: build Vite 5.4.21
  di prova nello scratchpad con gli import che servono (renderer, scena,
  camera prospettica, `PlaneGeometry`, `ShaderMaterial`, `Mesh`,
  `DataTexture`, `Raycaster`, `Plane`, vettori): **112,1 KB gz**;
- **URL Google Fonts** di Bricolage Grotesque (`opsz` 12..96, `wdth` 75..100,
  `wght` 200..800) + Karla (400..700): risponde 200. File latin misurati:
  Bricolage a 3 assi **131,5 KB**, Karla variabile **24,3 KB** (un solo file
  per i tre pesi). Nota: Google non ritaglia l'asse `wdth`; togliendolo del
  tutto Bricolage scende a 76,9 KB (vedi §1.3).

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/17-madre/`, stessa struttura del pilota. Tutto il concept vive in
   `src/pages/concepts/madre/`; `src/pages/Concept17.tsx` è un file sottile.
   Porting = copiare la cartella `madre/` e `Concept17.tsx`.
2. **three 0.160 puro, senza R3F né drei.** La scena è un solo piano
   suddiviso con un solo `ShaderMaterial` (CD §4.10 lo chiede). Chunk three
   misurato: 112 KB gz; con il codice della scena si arriva a ~125 KB gz,
   dentro i 160.
3. **Niente Lenis, niente GSAP.** Scroll nativo del documento (il CD vuole
   tastiera, PagGiù e barra spaziatrice intatti, e nessuno smoothing che
   "rubi" il controllo). Un solo listener `scroll` passivo che sveglia il
   **ticker unico** (rAF con fasi read/update/write/render, API del pilota).
4. **La vetrina orizzontale è un binario dentro una finestra `sticky`.** Il
   contenitore è alto `corsa + 100svh`, la finestra è `position: sticky`
   alta `100svh` con `overflow: clip`, il binario si trasla con
   `translate3d(-x, 0, 0)` scritto nella fase `write`. `x` deriva da
   `scrollY` (valore caldo in `runtime`), mai da React state. Il cammino è
   guidato dall'utente: nessuna inerzia nostra sulla rotella.
5. **Deviazione consapevole dal CD (da approvare, vedi "Richieste")**: nella
   striscia orizzontale stanno i banchi **pane, la madre, dolci, domenica**.
   **Il pane fisso e la bottega seguono in verticale**, alla fine del
   bancone. Motivo tecnico: il pane fisso ha campi di testo, trascinamento,
   sette righe da 56 px su mobile e una barra apribile; dentro un binario
   traslato e fissato servirebbe uno scroll verticale interno (trappola di
   scroll annidato), la tastiera virtuale del telefono cambierebbe
   l'altezza della finestra e quindi la corsa (salti), il fuoco sui campi
   farebbe scorrere contenitori `overflow` in modo diverso per browser. Il
   bancone "finisce" a destra e il pane fisso comincia sotto: la navigazione
   dei banchi resta una sola e li comprende tutti e sei.
6. **L'impasto è una sezione normale in apertura**, non un canvas fisso a
   tutta pagina: il canvas vive dentro `#impasto`, si ferma (0 render) fuori
   vista e si libera dopo 15 s lontano (§9.4).
7. **La prova del dito è un contratto a tre** su `runtime.impasto`: gli input
   (interaction-designer) scrivono le pressioni, la dinamica
   (motion-designer) muove le fossette nel ticker, e **due** disegnatori le
   leggono: il WebGL (webgl-artist + shader-engineer) oppure le fossette CSS
   del fallback (section-builder-impasto). Stesso gesto, stessi tempi, due
   rese.
8. **Stato della settimana nello store lento**, con logica pura in
   `state/settimana.ts` (scaffold): lo usano il gesto "Nel pane fisso" dei
   prodotti, il vassoio della domenica e il banco del pane fisso. Il contatto
   (telefono/email) non entra mai nello store né nella memoria.
9. **Prima pittura senza WebGL e senza foto**: superficie color farina in CSS
   con il titolo (`h1` = elemento LCP). Il GL entra con una dissolvenza di
   300 ms dopo il suo primo frame; la foto macro dell'impasto si carica
   **solo** se si va in fallback (`data-gl="off"`).
10. **CSS in file per sezione, prefisso `mad-`**, tutto sotto `.mad-root`.
    Niente Tailwind, niente CSS modules.

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json`)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` |
| `three` | `0.160.1` | patch della 0.160 del sito; nel porting non si aggiunge nulla |

Nessun'altra dipendenza di runtime.

### 1.2 Dev

| Pacchetto | Versione |
|---|---|
| `vite` | `5.4.21` |
| `@vitejs/plugin-react` | `4.7.0` |
| `typescript` | `5.6.3` |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` |
| `@types/three` | `0.160.0` |
| `@types/node` | `22.20.4` (solo `vite.config.ts`) |
| `eslint`, `@eslint/js` | `9.39.5` |
| `typescript-eslint` | `8.70.1` |
| `eslint-plugin-react-hooks` | `5.2.0` |
| `eslint-plugin-react-refresh` | `0.4.26` |
| `globals` | `15.15.0` |

**Non installati di proposito**: `@react-three/fiber`, `@react-three/drei`
(un piano e un materiale non hanno bisogno di un reconciler), `gsap` (§2.2),
`lenis` (§0.3), Tailwind, librerie di stato, librerie di drag and drop
(`dnd-kit` & co.: il trascinamento del pane fisso è fatto con Pointer Events,
§6.4), librerie di date o `.ics` (il file si genera a mano, §6.5),
`vite-plugin-glsl` (shader con `?raw`, nativo di Vite).

### 1.3 Font

Google Fonts, `<link>` iniettato al mount da `core/fonts.ts` (come i Concept
1-9), più `preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`:

```
https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Karla:wght@400;500;700&display=swap
```

L'URL definitivo lo scrive l'art-director in `styles/tokens.ts`
(`FONT_CSS_URL`, più `FONT_DA_CARICARE` per `document.fonts.load`). Può
restringere i pesi (`wght@400..800` ecc.): il file non cambia di molto. Se non
usa davvero `wdth` < 100, **togliere l'asse `wdth`** fa risparmiare 55 KB
(131,5 → 76,9 KB): decisione sua, da scrivere nel suo doc. Solo latin
(automatico con `unicode-range`). Niente corsivi.

### 1.4 Ambiente

- Alias `@/` → `src/` (`vite.config.ts` e `tsconfig.app.json` `paths`).
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`, `jsx: react-jsx`,
  `moduleResolution: bundler`, `types: ["vite/client"]`.
- Target build `es2020`; three in un chunk suo (`manualChunks` solo per
  `three`), caricato solo da `import('../webgl')`.
- Dev server porta **9170** (`--strictPort`), preview **9170** (§11).

---

## 2. Scelte motivate

### 2.1 three puro

La scena del CD è: un canvas nella sezione d'apertura, **un** piano suddiviso
(180×110 su desktop, 110×70 su mobile), **un** `ShaderMaterial` con
spostamento dei vertici e ombreggiatura opaca, una camera prospettica con un
leggero angolo, nessun loader, nessun controllo. Serve controllo diretto su:
render on demand, DPR adattivo, perdita di contesto, misura del primo frame
(> 200 ms → fallback, CD §4.3), rilascio del contesto fuori vista. Tutto in una
classe (`webgl/ImpastoGL.ts`) montata da un componente sottile.

| Variante | Peso gz |
|---|---|
| three puro con gli import della scena (misurato) | 112,1 KB |
| + codice scena, shader, qualità (stima) | +10-15 KB → **~125 KB** |
| R3F 8 (dal doc del 18, misura analoga) | ~+45 KB e tree shaking di three annullato: fuori budget |

### 2.2 GSAP no

Movimenti ammessi dal CD (§4.10): respiro e fossetta dell'impasto, cammino
della striscia (guidato dall'utente), ingresso del foglio azzurro ai dolci,
gettoni del pane fisso, pieghe del vassoio.

| Movimento | Come si fa |
|---|---|
| Fossetta (giù in ~500 ms con freno; su in ~2 s esponenziale; segno che svanisce in 4-5 s) | dinamica pura nel ticker, `motion/fossetta.ts`, su `dt` |
| Respiro (ciclo 8-10 s, si ferma 30 s dopo l'ultimo input) | `motion/respiro.ts`, nel ticker, a 30 fps |
| Cammino della striscia | `scrollY` → `x` (funzione pura, nessuna inerzia sulla rotella) |
| Foglio azzurro che entra da destra | progresso 0→1 del tratto madre→dolci dal cammino; `motion/foglio.ts` dà la curva; scritto in `write` come `clip-path`/`transform` |
| Gettoni (volo al giorno, ritorno al posto) | FLIP a mano: misura in `read`, `transform` in `write`, curve di `motion/easing.ts` |
| Pieghe del vassoio (una volta, 300 ms) | transizione CSS con la stringa `cubic-bezier` di `motion/easing.ts` |

Nessuno richiede timeline o ScrollTrigger: il pin è `position: sticky`.

### 2.3 Un solo ciclo rAF

`core/ticker.ts` (scaffold, stessa API del pilota, scaffold-engineer §4.1,
senza lenis). Ordine di ogni frame:

1. `runtime.scrollY = window.scrollY` (una lettura);
2. **read**: rimisure solo se invalidate (vetrina, §6.3), FLIP dei gettoni;
3. **update**: cammino (`x`, progresso, banco attivo) → foglio → fossette e
   respiro → gettoni in volo;
4. **write**: `transform` del binario, variabili CSS sulle foglie
   `data-madvar`, fossette CSS del fallback;
5. **render**: WebGL solo se `runtime.dirty` e l'impasto è in vista.

Nessun altro `requestAnimationFrame`, `setInterval` per animare o listener
`scroll` nel concept. Il ticker dorme quando niente si muove e si ferma con la
scheda del browser nascosta.

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo standalone, non si porta. **[P]** si porta nel sito. Tra
parentesi il proprietario (§4).

```
concepts/17-madre/
├─ DESIGN.md                                  [S*] (art-director)  resta nel repo claude250 come doc
├─ docs/                                      [S]  un .md per agent
├─ qa/                                        [S]  screenshot QA (ignorati da git)
├─ package.json  package-lock.json            [S]  (scaffold)
├─ vite.config.ts  tsconfig.json  tsconfig.app.json  tsconfig.node.json   [S] (scaffold)
├─ eslint.config.js  .gitignore               [S]  (scaffold)
├─ index.html                                 [S]  (scaffold) lang="it", meta, preconnect font, fondo farina inline
├─ public/favicon.svg                         [S]  (vector-artist)
└─ src/
   ├─ main.tsx  App.tsx  vite-env.d.ts        [S]  (scaffold) /concept-17 lazy; / e * → <Navigate to="/concept-17" replace/>
   ├─ lib/analytics.ts                        [S]  (scaffold) copia dello stub del pilota (stesso TrackEvent, stessa firma)
   ├─ components/ConceptBackButton.tsx        [S]  (scaffold) copia fedele di quella del pilota
   └─ pages/
      ├─ Concept17.tsx                        [P]  (scaffold) export default function Concept17() { return <Madre/> }
      └─ concepts/madre/                      [P]  TUTTO il concept
         ├─ index.ts                          (scaffold) export { default } from './Madre'
         ├─ Madre.tsx                         (scaffold) radice .mad-root: font, ticker, store, vetrina, ordine sezioni, GL lazy, annunci
         │
         ├─ core/                             (scaffold)
         │  ├─ ticker.ts                      unico rAF, fasi read/update/write/render (§2.3)
         │  ├─ scroll.ts                      un listener scroll passivo → ticker.wake(); scorriA(y, {liscio}) (liscio solo senza reduced motion)
         │  ├─ capabilities.ts                detectWebGL(), prefersReducedMotion(), ascoltaReducedMotion(), isCoarsePointer(), saveData(), leggiForzaturaGL()
         │  ├─ fonts.ts                       injectFonts(), fontsReady()
         │  ├─ viewport.ts                    runtime.viewport su resize/visualViewport; solo cambi di LARGHEZZA invalidano la vetrina
         │  ├─ links.ts                       LAB_URL, CICERILAB_URL, MAPS_URL, TELEFONO_URL, EMAIL_URL
         │  ├─ annunci.ts                     annuncia(testo) → unica regione aria-live="polite" montata da Madre.tsx
         │  ├─ oggi.ts                        oggi() e primoRitiro(): date calcolate SOLO al mount (prerender)
         │  └─ glLoader.ts                    decidiGL() + caricaGL(): import('../webgl')
         │
         ├─ state/                            (scaffold)
         │  ├─ store.ts                       store lento + useMadre(selector) + azioni + selettori (§6.1)
         │  ├─ runtime.ts                     valori caldi mutabili (§6.2)
         │  ├─ settimana.ts                   logica pura del pane fisso: regole, aggiunte, totale (§6.4)
         │  └─ persist.ts                     local/sessionStorage in try/catch
         │
         ├─ vetrina/                          (scaffold) il legame scroll → cammino orizzontale
         │  ├─ Vetrina.tsx                    contenitore alto corsa+100svh, finestra sticky, binario traslato (§6.3)
         │  ├─ banchi.ts                      registro dei banchi nel binario: id, offset, larghezza (coordinate binario)
         │  ├─ useBanco.ts                    hook con cui ogni banco della striscia si registra
         │  ├─ cammino.ts                     fn di update: scrollY → runtime.vetrina.{x, progresso, banco}; banco → store
         │  ├─ vaiA.ts                        vaiABanco(id), vaiAElemento(el): calcola lo scroll verticale giusto
         │  └─ seguiFuoco.ts                  focusin nel binario → porta l'elemento in vista (Tab da tastiera)
         │
         ├─ motion/                           (motion-designer)
         │  ├─ easing.ts                      curve custom: funzioni + stringhe cubic-bezier per CSS
         │  ├─ fossetta.ts                    dinamica delle 3 fossette: premi/rilascia/aggiorna su dt (§7.2)
         │  ├─ respiro.ts                     respiro dell'impasto (ciclo, spegnimento dopo 30 s, 30 fps)
         │  ├─ foglio.ts                      curva del foglio azzurro dal progresso del tratto madre→dolci
         │  ├─ gettoni.ts                     FLIP dei gettoni (volo, ritorno, riapparizione in reduced motion)
         │  ├─ choreography.ts                durate e soglie (fade GL 300, pieghe 300, cambio fondo 200 ecc.)
         │  └─ useMotionVars.ts               scrive variabili CSS sulle foglie data-madvar, solo quando cambiano
         │
         ├─ interaction/                      (interaction-designer)
         │  ├─ provaDito.ts                   collegaProvaDito(el, opz): pointer/touch/tastiera → motion/fossetta (§7.1)
         │  ├─ gestiStriscia.ts               deltaX del trackpad e swipe orizzontale sul binario → scroll verticale
         │  ├─ tastieraStriscia.ts            frecce sinistra/destra tra i prodotti quando il fuoco è nel binario
         │  ├─ usePrendiPosa.ts               "prendi in mano / posa": trascina, tocca e tocca, tastiera (§6.4)
         │  └─ interaction.css                :hover, :focus-visible (anello inchiostro 2 px, stacco 2 px), stati attivi
         │
         ├─ webgl/
         │  ├─ shaders/                       (webgl-artist)
         │  │  ├─ impasto.vert.glsl           forma della pagnotta larga + fossette + respiro
         │  │  └─ impasto.frag.glsl           impasto opaco, spolvero, pelle nuda nella fossetta, luce diffusa
         │  ├─ materiale.ts                   (webgl-artist) createImpastoMaterial(), layout degli uniform (§8.2)
         │  ├─ spolvero.ts                    (webgl-artist) texture di rumore 256² generata a runtime
         │  ├─ forma.ts                       (webgl-artist) parametri della pagnotta: gonfiature, piega, camera, luce
         │  ├─ ImpastoGL.ts                   (shader-engineer) renderer, resize, DPR, perdita contesto, render on demand
         │  ├─ proiezione.ts                  (shader-engineer) schermo → uv del piano (Raycaster) per runtime.impasto
         │  ├─ qualita.ts                     (shader-engineer) primo frame, DPR adattivo, spegnimento se lento
         │  ├─ ImpastoCanvas.tsx              (shader-engineer) componente che monta ImpastoGL
         │  └─ index.ts                       (shader-engineer; stub dello scaffold) export default ImpastoCanvas
         │
         ├─ content/                          (copywriter)
         │  ├─ testi.ts                       tutti i testi visibili, aria-label, alt, meta, microcopy di tutti gli stati
         │  └─ prezzi.ts                      prodotti, pezzature, prezzi, giorni, regole (DATI, tipi esportati §6.6)
         │
         ├─ styles/
         │  ├─ tokens.css                     (art-director) variabili --mad-*, @font-face di ripiego con metriche
         │  ├─ tokens.ts                      (art-director) PALETTE (hex + rgb lineare per three), FONT_CSS_URL, FONT_DA_CARICARE, scala
         │  ├─ base.css                       (scaffold) reset scoped, tipografia base, .mad-sr, .mad-salto
         │  └─ layout.css                     (scaffold) .mad-contenuto, .mad-main, .mad-vetrina*, livelli
         │
         ├─ assets/
         │  ├─ svg/                           (vector-artist) marchio MADRE, icone di servizio (freccia esterna, meno/più, chiudi) + index.ts
         │  └─ foto/                          (photo-editor) *.webp in 2 misure (+ gettone) + index.ts (§6.7)
         │
         └─ sections/
            ├─ Impasto/     Impasto.tsx impasto.css Superficie.tsx FossetteCss.tsx Testata.tsx testata.css   (section-builder-impasto)
            ├─ Bancone/     Piano.tsx Foglio.tsx Etichette.tsx Prodotto.tsx bancone.css                     (section-builder-bancone)
            ├─ Pane/        Pane.tsx pane.css                                                                (section-builder-pane)
            ├─ LaMadre/     LaMadre.tsx la-madre.css                                                         (section-builder-la-madre)
            ├─ Dolci/       Dolci.tsx dolci.css                                                              (section-builder-dolci)
            ├─ Domenica/    Domenica.tsx domenica.css Vassoio.tsx                                            (section-builder-domenica)
            ├─ PaneFisso/   PaneFisso.tsx pane-fisso.css FilaPani.tsx Settimana.tsx Giorno.tsx VassoioFisso.tsx
            │               Frase.tsx Invio.tsx Esito.tsx frase.ts ics.ts invio.ts                           (section-builder-pane-fisso)
            └─ Bottega/     Bottega.tsx bottega.css Piede.tsx piede.css                                      (section-builder-bottega)
```

Ordine in `Madre.tsx`:

```
.mad-root[data-gl data-motion data-banco]
  <a class="mad-salto" href="#pane-fisso">Salta al pane fisso</a>     primo elemento del fuoco (CD 4.2)
  <a class="mad-salto" href="#contenuto">Salta al contenuto</a>
  <ConceptBackButton/>                                                 del sito, sopra a tutto
  .mad-contenuto
    <Testata/>                                                         header: marchio + 3 voci + "Il pane fisso"
    <main id="contenuto">
      <Impasto/>                                                       section#impasto, h1, canvas lazy dentro
      <Vetrina piano={<Piano/>} fondo={<Foglio/>}>                     div#vetrina (sticky + binario)
        <Pane/> <LaMadre/> <Dolci/> <Domenica/>                        section#pane, #la-madre, #dolci, #domenica
      </Vetrina>
      <PaneFisso/>                                                     section#pane-fisso (verticale)
      <Bottega/>                                                       section#bottega (verticale)
    </main>
    <Piede/>                                                           footer (builder della bottega)
  <Etichette/>                                                         nav fissa in basso: i nomi dei banchi
  <div class="mad-sr" aria-live="polite">                              unica regione per annuncia()
```

**Id delle ancore** (stabili; li usano etichette, menu, link di salto, hash):
`impasto`, `pane`, `la-madre`, `dolci`, `domenica`, `pane-fisso`, `bottega`,
`piede`. Se l'ux-architect rinomina, cambiano i testi, non cartelle né id;
l'orchestratore mappa i suoi nomi su questi builder (§4, nota finale).

### 3.1 Regole di porting (valgono da subito)

- Dentro `madre/` nessun import fuori dalla cartella tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` (solo in `Madre.tsx`) e
  i pacchetti npm.
- **Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `navigator`, `Date` "di oggi" a livello di modulo**: solo in effetti,
  handler o funzioni chiamate da effetti. Il sito fa prerender: `Madre` deve
  rendere senza browser (canvas, ticker, vetrina, data del primo ritiro
  partono al mount; nel prerender la frase del primo ritiro è assente, non
  sbagliata).
- Asset con i suffissi nativi di Vite (`?url`, `?raw`), mai da `public/`
  (tranne il favicon standalone). Le foto: `import x from './x-1280.webp'`
  (URL gestito da Vite), elencate in `assets/foto/index.ts`.
- Nessun hex fuori da `styles/tokens.*`; il GL prende i colori da
  `styles/tokens.ts`.
- `Concept17.tsx` finale:
  `import Madre from './concepts/madre'; export default function Concept17() { return <Madre /> }`.

---

## 4. File di competenza esclusiva

Ogni file ha un solo proprietario. Tutti possono leggere e importare tutto.
Chi ha bisogno di una modifica altrui la scrive in "Richieste ad altri agent"
del proprio doc; l'orchestratore la gira. Lo scaffold crea gli stub necessari
al build verde; alla fine dello scaffold la proprietà passa agli agent sotto e
lo scaffold non li tocca più.

Percorsi relativi a `src/pages/concepts/madre/` salvo dove indicato.

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md` (root del concept), `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts` | CSS di sezione, `base.css`, `layout.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/*` (7 file di §3) | ticker e vetrina (usa le loro API), CSS di sezione |
| **webgl-artist** | `docs/webgl-artist.md`, `webgl/shaders/*.glsl`, `webgl/materiale.ts`, `webgl/spolvero.ts`, `webgl/forma.ts` | file dello shader-engineer in `webgl/`; tutto fuori da `webgl/` |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*` | niente cursore custom, niente preloader, niente testo magnetico, niente "tieni premuto" su bottoni (CD 4.3, 4.7) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/prezzi.ts` | nessun testo nei componenti |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*`, `public/favicon.svg` (root del concept) | niente spighe, mattarelli, fruste, mani, figure, lavagnette (CD 4.7) |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*` (webp + `index.ts`) | nessuna foto generata; nessun ritaglio fatto in CSS che cambi il soggetto |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file [S] tranne `DESIGN.md`, `docs/*` altrui e `public/favicon.svg`; `src/pages/Concept17.tsx`; `madre/index.ts`, `Madre.tsx`; `core/*`; `state/*`; `vetrina/*`; `styles/base.css`, `styles/layout.css`; stub di `sections/*/*` e `webgl/index.ts` |
| **section-builder-impasto** | `sections/Impasto/*` (sezione d'apertura, testata, superficie accessibile, fossette CSS, foto di ripiego), `docs/section-builder-impasto.md` |
| **section-builder-bancone** | `sections/Bancone/*` (piano del bancone, foglio azzurro, etichette dei banchi, componente condiviso `Prodotto`), `docs/section-builder-bancone.md` |
| **section-builder-pane** | `sections/Pane/*`, `docs/section-builder-pane.md` |
| **section-builder-la-madre** | `sections/LaMadre/*`, `docs/section-builder-la-madre.md` |
| **section-builder-dolci** | `sections/Dolci/*`, `docs/section-builder-dolci.md` |
| **section-builder-domenica** | `sections/Domenica/*` (foto del vassoio, vassoio in carta da zucchero con le paste), `docs/section-builder-domenica.md` |
| **section-builder-pane-fisso** | `sections/PaneFisso/*`, `docs/section-builder-pane-fisso.md` |
| **section-builder-bottega** | `sections/Bottega/*` (bottega + piede con crediti foto), `docs/section-builder-bottega.md` |
| **shader-engineer** (in parallelo ai section-builder) | `webgl/ImpastoGL.ts`, `proiezione.ts`, `qualita.ts`, `ImpastoCanvas.tsx`, `index.ts`, `docs/shader-engineer.md` |

Note:
- **Stub con firma finale** (così i builder lavorano in parallelo): lo
  scaffold crea `sections/Bancone/Prodotto.tsx` con le prop di §6.8 e un
  markup minimo funzionante; il builder del bancone lo completa senza
  cambiare la firma. Lo stesso per `webgl/index.ts` (§8.4).
- `sections/PaneFisso/invio.ts`: invio **simulato**, nessuna rete; risolve
  dopo ~1,2 s; con `?invio=ko` fallisce. `frase.ts`: la frase che si scrive
  da sola, pura (settimana + vassoio + prezzi + testi → stringa). `ics.ts`:
  file `.ics` con una `RRULE:FREQ=WEEKLY;BYDAY=…` per giorno di ritiro (e
  `INTERVAL=2` per il vassoio "una domenica sì e una no"), `DTSTART` dal
  primo ritiro, `TZID=Europe/Rome`, scaricato con `Blob` + `URL.createObjectURL`
  e revocato subito dopo.
- La **Testata** è del builder dell'impasto (vive nella prima schermata), ma
  `Madre.tsx` la monta **fuori** da `#impasto`, prima del `<main>`, perché
  resti visibile su tutta la pagina (CD 4.2: "Il menu in alto resta
  visibile").
- **Mappatura con lo ux-architect**: la sua "Sezioni da costruire" deve
  avere 8 voci che corrispondono a queste cartelle. Se ne propone di diverse
  (per esempio etichette separate dal bancone), vale la sua lista per i
  contenuti, questa per le cartelle; l'orchestratore allinea i nomi degli
  agent come `section-builder-<cartella in kebab-case>`.

---

## 5. Convenzioni CSS

- **Un `.css` per sezione** importato dal componente
  (`import './pane.css'`). Niente Tailwind, niente CSS modules.
- **Prefisso `mad-`**, BEM leggero: `mad-<sezione>`, `mad-<sezione>__<el>`,
  `mad-<sezione>--<variante>` (es. `mad-settimana__giorno--chiuso`,
  `mad-prodotto__prezzo`). Classi condivise dello scaffold: `mad-root`,
  `mad-contenuto`, `mad-main`, `mad-vetrina`, `mad-vetrina__finestra`,
  `mad-vetrina__binario`, `mad-banco` (ogni banco nel binario), `mad-sr`,
  `mad-salto`.
- **Ogni selettore inizia con `.mad-root`.** Nessun selettore nudo su `html`,
  `body`, `:root`, `*` (unica eccezione ammessa, come nel pilota:
  `html:has(.mad-root)` per `scroll-padding-top` sotto la testata). Il fondo si
  dà a `.mad-root`; `Madre.tsx` imposta inline il fondo di `html/body` a
  farina e `overscroll-behavior-x: none` su `html` (evita il "torna indietro"
  del trackpad durante lo swipe della vetrina) e li ripristina allo
  smontaggio.
- **Variabili** `--mad-*` definite solo dall'art-director (`tokens.css`);
  locali di sezione `--mad-<sezione>-*`. Il motion-designer scrive variabili
  solo sulle foglie marcate `data-madvar`, solo quando il valore cambia.
- **Variabili di layout della vetrina** (le scrive solo `vetrina/`, come
  proprietà inline): `--mad-corsa` (px) sul contenitore `.mad-vetrina`. Il
  **piano del bancone** sta a un'altezza fissa definita dall'art-director
  come token (`--mad-piano-y`, per esempio in `svh`, con valore mobile e
  desktop): tutti i banchi e `Prodotto` lo usano, nessuno lo ricalcola.
- **Attributi di stato su `.mad-root`** (li scrive solo `Madre.tsx`):
  `data-gl="pending|on|off"`, `data-motion="full|reduced"`,
  `data-banco="impasto|pane|la-madre|dolci|domenica|pane-fisso|bottega"`
  (banco attivo, cambia solo al passaggio), `data-mano="pane|pasta"` quando
  un gettone è in mano (per il cursore `grabbing` e i giorni evidenziati).
- **Livelli** (token dell'art-director): contenuto 1, canvas dentro
  `#impasto` 0 relativo alla sezione, foglio azzurro sotto il binario dentro
  la finestra, etichette 5, barra del pane fisso su mobile 6, testata 10,
  gettone trascinato 20. Il `ConceptBackButton` sta sopra a tutto: nessun
  fisso nella sua zona (in alto a sinistra ~230×44 px da 640 px in su; in
  basso a sinistra ~210×44 px sotto). Quindi: la testata desktop comincia a
  destra di quel bottone; le etichette e la barra del pane fisso su mobile
  lasciano libero l'angolo in basso a sinistra (rientro di 224 px dalla
  sinistra sulla loro riga, oppure stanno sopra quella riga: decide
  l'ux-architect, la regola è "mai sotto il bottone").
- `.mad-root`, `.mad-contenuto`, `.mad-main`, `.mad-vetrina` hanno **nessun**
  `transform`, `filter`, `contain`, `container-type`, `overflow` diverso da
  `visible` (`sticky` e i fissi devono restare agganciati alla finestra).
  `.mad-vetrina__finestra` ha `overflow: clip` (**non** `hidden`: un
  contenitore `overflow: hidden` si fa scorrere da solo quando un elemento
  dentro prende il fuoco, e il binario si sposterebbe due volte).
- Unità: `rem` per il testo, `clamp()` per misure fluide, `svh` per altezze a
  schermo (mai `100vh` puro; `dvh` no nella vetrina, perché cambia mentre la
  barra del browser mobile entra ed esce e farebbe saltare la corsa). Raggio
  unico 4 px (token), foto a spigolo vivo, vassoio con angoli piegati (CD 4.1).
- `font-variant-numeric: tabular-nums` su prezzi e quantità (se Karla non ha
  le cifre tabellari, lo dice l'art-director e i prezzi si allineano a destra
  in colonna fissa, CD 4.1).

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno senza librerie, letto con `useSyncExternalStore` e un selettore
(`useMadre(selector, isEqual?)`): un componente si ri-renderizza solo quando
cambia la sua fetta. Singleton di modulo, **re-inizializzato** al mount di
`Madre.tsx` (lettura di `persist.ts` e dell'URL), così navigare via e tornare
nel sito vero non lascia stati sporchi.

```ts
import type { IdPane, IdPasta, IdPezzatura, IdGiorno, PesoVassoio, Frequenza } from '../content/prezzi';

export type IdBanco = 'impasto' | 'pane' | 'la-madre' | 'dolci' | 'domenica' | 'pane-fisso' | 'bottega';

export interface Riga { pane: IdPane; pezzatura: IdPezzatura; quantita: number }   // quantita 1..6
export type Settimana = Record<IdGiorno, Riga[]>;                                    // 'lun' esiste ed è sempre []
export interface Vassoio {
  peso: PesoVassoio;             // 500 | 750 | 1000
  misto: boolean;                // true = "come viene"; false = preferite
  preferite: IdPasta[];          // 0..4
  frequenza: Frequenza;          // 'ogni' | 'alterna'
}
export type InMano = { tipo: 'pane'; id: IdPane } | { tipo: 'pasta'; id: IdPasta } | null;

export type CodiceErrore =
  | 'giorno-sbagliato'     // pane su un giorno in cui non si fa
  | 'lunedi'               // lunedì chiuso
  | 'domenica-limitata'    // la domenica solo pagnotta, ciabatta e vassoio
  | 'troppi-pezzi'         // più di 6 dello stesso pane in un giorno
  | 'troppe-paste'         // più di 4 preferite
  | 'settimana-vuota';     // invio a settimana vuota
export interface ErrorePaneFisso { codice: CodiceErrore; giorno: IdGiorno | null; pane: IdPane | null }

export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
export type StatoGL = 'pending' | 'on' | 'off';

export interface MadreState {
  bancoAttivo: IdBanco;          // scritto solo da vetrina/cammino.ts e dall'osservatore delle sezioni verticali
  settimana: Settimana;          // bozza persistita
  vassoio: Vassoio | null;       // bozza persistita
  inMano: InMano;
  errore: ErrorePaneFisso | null;
  invio: StatoInvio;
  nomeSacchetto: string | null;  // dopo il successo, per "Fatto, Marta."; persistito con 'inviata'
  provaVista: boolean;           // la frase dell'impasto è già stata detta una volta (sessione)
  segnoCliente: { u: number; v: number } | null;   // il "suo" segno di dito dopo il successo (CD 4.4)
  bozzaRitrovata: boolean;
  gl: StatoGL;
  glMotivo: string | null;
  reducedMotion: boolean;
  simulaErroreInvio: boolean;    // ?invio=ko
}

export const store: { get(): MadreState; set(patch: Partial<MadreState> | ((s: MadreState) => Partial<MadreState>)): void; subscribe(fn: () => void): () => void };
export function useMadre<T>(selector: (s: MadreState) => T, isEqual?: (a: T, b: T) => boolean): T;
```

**Azioni** (le sezioni chiamano queste, mai `store.set`):

```ts
prendiInMano(cosa: Exclude<InMano, null>): void      // un solo gettone in mano per volta
posa(): void                                          // inMano = null
metti(giorno: IdGiorno, pane: IdPane, pezzatura?: IdPezzatura): EsitoMetti   // usa settimana.ts; imposta/azzera errore; annuncia
cambiaQuantita(giorno: IdGiorno, indice: number, delta: 1 | -1): EsitoMetti  // 0 = toglie la riga
togli(giorno: IdGiorno, indice: number): void
impostaVassoio(patch: Partial<Vassoio> | null): void
mettiSulVassoio(pasta: IdPasta): EsitoMetti            // crea il vassoio (750 g, ogni) se assente
togliDalVassoio(pasta: IdPasta): void
nelPaneFisso(pane: IdPane): void                      // gesto "Nel pane fisso" di un Prodotto: prendiInMano + vaiA('pane-fisso')
nelVassoio(pasta: IdPasta): void                      // gesto dal banco della domenica: mettiSulVassoio (resta nella vetrina)
impostaInvio(s: StatoInvio): void
confermaInvio(nome: string, segno: { u: number; v: number }): void   // sent + nomeSacchetto + segnoCliente, persistiti
cambiaSettimana(): void                               // da "Cambia la settimana": invio → idle, la settimana resta
segnaProvaVista(): void
impostaGL(gl: StatoGL, motivo?: string | null): void  // solo Madre.tsx e shader-engineer
inizializzaStore(o: { search: string; reducedMotion: boolean }): MadreState   // solo Madre.tsx
```

`EsitoMetti = { ok: true } | { ok: false; errore: ErrorePaneFisso }`.

**Selettori**: `selRighe(giorno)`, `selGiorniDelPane(id)` (i giorni validi, per
colorare di carta da zucchero i giorni durante il trascinamento),
`selSettimanaVuota`, `selTotaleSettimana` (euro, numero, calcolato da
`settimana.ts`), `selNumeroPezzi`, `selGL`, `selReducedMotion`,
`selBancoAttivo`.

Regole:
- La bozza (`settimana` + `vassoio`) si salva in `localStorage`
  `madre:bozza` con scrittura rimandata di 300 ms; `madre:inviata` tiene
  `{ nome, segno }` dopo il successo. Mai il contatto.
- `bancoAttivo` cambia solo al passaggio di banco (niente set per frame).
- `annuncia()` (core) si chiama dentro le azioni che cambiano la settimana,
  con i testi del copywriter: i componenti non duplicano gli annunci.

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, **mai** in React state, letto e scritto nel ticker.

```ts
runtime.scrollY                       // px, scritto dal ticker a inizio frame
runtime.viewport                      // { w, h, dpr }
runtime.vetrina                       // { top, corsa, x, progresso /*0..1*/, banco: IdBanco, tratti: Record<IdBanco, {da, a}> }
runtime.impasto = {
  inVista: boolean,                   // IntersectionObserver su #impasto (scritto dal builder dell'impasto)
  fossette: Fossetta[3],              // §7.2
  prossima: 0|1|2,                    // indice della prossima fossetta (la quarta prende il posto della più vecchia)
  respiro: number,                    // -1..1, già moltiplicato per l'ampiezza e spento dopo 30 s
  ultimoInput: number,                // ms (performance.now) dell'ultima pressione
  daSchermoAUv: (x: number, y: number) => { u: number; v: number } | null,   // default: lineare sul rettangolo; col GL: raycast (shader-engineer)
  segnoCliente: { u, v } | null,      // copiato dallo store al mount
}
runtime.gettoni                       // voli FLIP in corso (motion/gettoni.ts)
runtime.dirty                         // il GL deve ridisegnare
runtime.markDirty()
runtime.reset()                       // Madre.tsx al mount
```

### 6.3 La vetrina: scroll verticale → cammino orizzontale

**DOM** (`vetrina/Vetrina.tsx`, scaffold):

```html
<div id="vetrina" class="mad-vetrina" style="--mad-corsa: 5120px">     <!-- height: calc(var(--mad-corsa) + 100svh) -->
  <div class="mad-vetrina__finestra">                                   <!-- position: sticky; top: 0; height: 100svh; overflow: clip -->
    {fondo}                                                             <!-- Foglio azzurro (bancone), sotto il binario -->
    <div class="mad-vetrina__binario" role="presentation">              <!-- display: flex; width: max-content; will-change: transform -->
      {piano}                                                           <!-- Piano del bancone: linea a tutta lunghezza del binario -->
      <section id="pane" class="mad-banco">…</section>
      <section id="la-madre" class="mad-banco">…</section>
      <section id="dolci" class="mad-banco">…</section>
      <section id="domenica" class="mad-banco">…</section>
    </div>
  </div>
</div>
```

Firma: `Vetrina({ piano, fondo, children }: { piano?: ReactNode; fondo?: ReactNode; children: ReactNode })`.

**Misure** (fase `read`, solo quando invalidate): larghezza del binario
(`scrollWidth`), `top` del contenitore in coordinate documento
(`getBoundingClientRect().top + scrollY`), e per ogni banco registrato con
`useBanco(ref, id)` offset e larghezza **nel binario** (`offsetLeft`,
`offsetWidth`: non dipendono dalla trasformazione). `corsa = larghezza
binario − larghezza finestra`, scritta come `--mad-corsa` sul contenitore.
Invalidazione: al mount, `document.fonts.ready`, `ResizeObserver` sul
binario, cambio di **larghezza** della finestra (debounce 150 ms), caricamento
di un'immagine del binario (le foto hanno `width`/`height`, quindi non
dovrebbe cambiare nulla, ma si rimisura lo stesso). I cambi della sola altezza
(barra del browser mobile) **non** invalidano.

**Cammino** (fase `update`, `vetrina/cammino.ts`):
`x = clamp(scrollY − top, 0, corsa)`, `progresso = x / corsa`,
`banco` = il banco il cui tratto contiene il centro della finestra
(`x + w/2`). Scrittura (`write`): `binario.style.transform =
translate3d(${-x}px,0,0)` solo se `x` è cambiato di almeno 0,5 px. Nessun
lerp: la striscia segue lo scroll nativo 1:1 (il pollice e la rotella
restano "veri"). Per gli altri banchi (impasto, pane-fisso, bottega) il banco
attivo viene da un `IntersectionObserver` sulle sezioni verticali
(scaffold).

**Andare a un banco o a un elemento** (`vetrina/vaiA.ts`):
- `vaiABanco(id)`: banco nella vetrina → `scorriA(top + offset(id))`;
  sezione verticale → `scorriA(top della sezione − altezza testata)`.
  `scorriA` è liscio (`behavior: 'smooth'`) solo senza reduced motion.
- `vaiAElemento(el)`: se `el` è nel binario, porta il suo bordo sinistro a
  un margine (20 px mobile, 8 vw desktop) dalla sinistra della finestra;
  poi `el.focus({ preventScroll: true })` se richiesto.
- Il `Madre.tsx` ha **un solo ascoltatore delegato** di clic sui link
  `a[href^="#"]` (come il pilota): `vaiABanco(id)` + `preventDefault()`. Le
  sezioni non aggiungono gestori propri ai link `#`. L'hash iniziale
  (`/concept-17#pane-fisso`) va allo stesso modo dopo il primo layout.

**Fuoco da tastiera** (`vetrina/seguiFuoco.ts`): `focusin` sul binario →
se l'elemento è fuori dalla finestra (calcolo sui numeri registrati, senza
leggere il layout traslato) → `vaiAElemento(el)` senza animazione. Così il Tab
attraversa la vetrina prodotto per prodotto; `scrollIntoView` non si usa.

**Gesti** (interaction-designer, `interaction/gestiStriscia.ts`):
- trackpad: `wheel` passivo sul binario; se `|deltaX| > |deltaY|`,
  `window.scrollBy(0, deltaX)` (non si blocca niente, la rotella verticale
  resta nativa);
- touch: il binario ha `touch-action: pan-y` (il pollice in verticale è
  scroll nativo); uno swipe orizzontale (Pointer Events, soglia 10 px, angolo
  < 30° dall'orizzontale) diventa `window.scrollBy(0, −dx)` a ogni mossa, con
  una piccola inerzia al rilascio calcolata nel ticker (niente inerzia con
  reduced motion);
- frecce sinistra/destra (`interaction/tastieraStriscia.ts`) quando il fuoco
  è nel binario: prodotto precedente/successivo con `vaiAElemento` + fuoco
  sul suo primo elemento interattivo.

**Reduced motion**: il cammino è identico (è già guidato dall'utente); niente
inerzia dello swipe, `scorriA` senza liscio, il foglio azzurro diventa un
cambio di fondo in dissolvenza di 200 ms (motion-designer), niente parallassi.

**Senza JS / prerender**: il contenitore ha l'altezza di una finestra e il
binario scorre in orizzontale con `overflow-x: auto` (classe
`mad-vetrina--statica`, tolta al mount): il contenuto è leggibile anche così.

### 6.4 Il pane fisso: logica pura (`state/settimana.ts`, scaffold)

Nessuna dipendenza da React o dal DOM; usa i dati di `content/prezzi.ts`.

```ts
export const GIORNI: readonly IdGiorno[];                          // ['lun','mar','mer','gio','ven','sab','dom']
export function settimanaVuota(): Settimana;
export function puoStare(pane: IdPane, giorno: IdGiorno): EsitoMetti;   // lunedì, giorni del pane, regola della domenica
export function metti(s: Settimana, giorno: IdGiorno, pane: IdPane, pezzatura?: IdPezzatura): { s: Settimana; esito: EsitoMetti };
export function cambiaQuantita(s: Settimana, giorno: IdGiorno, indice: number, delta: 1 | -1): { s: Settimana; esito: EsitoMetti };
export function togli(s: Settimana, giorno: IdGiorno, indice: number): Settimana;
export function mettiPasta(v: Vassoio | null, pasta: IdPasta): { v: Vassoio; esito: EsitoMetti };
export function totale(s: Settimana, v: Vassoio | null): { settimana: number; mediaConVassoio: number };   // euro; 'alterna' = metà del vassoio in media
export function vuota(s: Settimana, v: Vassoio | null): boolean;
export function giorniDiRitiro(s: Settimana, v: Vassoio | null): IdGiorno[];
export function eSettimana(x: unknown): x is Settimana;            // per leggere la bozza salvata
export function eVassoio(x: unknown): x is Vassoio;
```

Regole (dal CD 4.4 e dal brand-strategist 1.6/5.6): lunedì chiuso; ogni pane
solo nei suoi giorni; domenica solo pagnotta, ciabatta e vassoio; 1-6 pezzi
per riga (7 → errore `troppi-pezzi`, la quantità resta 6); stesso pane e
stessa pezzatura nello stesso giorno = una riga sola (si somma); fino a 4
paste preferite. Il pan di sorc stagionale è **solo testo** (richiesta del
brand-strategist): la validazione guarda solo i giorni.

**Prendi in mano / posa** (`interaction/usePrendiPosa.ts`,
interaction-designer): un hook per i gettoni (pani e paste) e uno per i
bersagli (giorni, vassoio).

```ts
usePresa(ref, cosa: Exclude<InMano, null>): { props: ButtonHTMLAttributes; inMano: boolean }
useBersaglio(ref, bersaglio: { tipo: 'giorno'; giorno: IdGiorno } | { tipo: 'vassoio' }): { props: ButtonHTMLAttributes; valido: boolean | null; sopra: boolean }
```

- **Trascina** (Pointer Events, mouse e dito; sul dito parte dopo 8 px di
  movimento, `touch-action: none` solo sul gettone afferrato, mai sulla
  pagina): durante il trascinamento `data-mano` su `.mad-root`, il clone del
  gettone segue il puntatore (scritto in `write`), i bersagli sotto il
  puntatore si trovano con `document.elementFromPoint` in `read`. Al
  rilascio su un bersaglio: `metti(...)`; su niente o errore: il gettone
  torna al suo posto (FLIP di `motion/gettoni.ts`; con reduced motion
  riappare).
- **Tocca e tocca** (principale su mobile): tap sul gettone =
  `prendiInMano`, tap sui giorni = `metti`, tap di nuovo sul gettone =
  `posa`.
- **Tastiera**: gettone = `<button aria-pressed>`; Invio/Spazio lo prende;
  giorni = `<button aria-pressed>`; Esc posa. Tutto annunciato con
  `annuncia()` dentro le azioni.
- Nessun HTML5 Drag and Drop (non funziona col dito e non si stila).

### 6.5 Date

`core/oggi.ts`: `oggi(): Date` (letta al mount, poi fissa per la sessione) e
`primoRitiro(giorni: IdGiorno[], da: Date): Date | null` = il primo di quei
giorni **dalla prossima settimana** (CD: "dalla prossima settimana, martedì 6
ottobre"). Formattazione con `Intl.DateTimeFormat('it-IT', { weekday:
'long', day: 'numeric', month: 'long' })`. Chiamate solo dopo il mount; nel
prerender la riga non si scrive. Agosto (ferie): solo testo del copywriter.

### 6.6 Dati del mestiere: `content/prezzi.ts` (copywriter)

Una sola fonte di prodotti e prezzi (brand-strategist §7, §10). Id **fissati
qui** perché li usano anche photo-editor (`assets/foto/index.ts`), store e
builder:

```ts
export type IdPane = 'pagnotta' | 'segale' | 'sorc' | 'integrale' | 'ciabatta' | 'semola';
export type IdDolce = 'gubana' | 'strucolo' | 'crostata' | 'esse' | 'frolla' | 'pinza';
export type IdPasta = 'bigne' | 'cannoncini' | 'diplomatiche' | 'sfogliatine' | 'krapfen';
export type IdGiorno = 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';
export type IdPezzatura = '500g' | '1kg' | 'pezzo';
export type PesoVassoio = 500 | 750 | 1000;
export type Frequenza = 'ogni' | 'alterna';

export interface Pane {
  id: IdPane; nome: string; righe: readonly [string, string];
  alKg: number;                                              // euro
  pezzature: readonly { id: IdPezzatura; etichetta: string; prezzo: number }[];
  giorni: readonly IdGiorno[];
  giorniTesto: string;                                       // "martedì e venerdì"
  stagione?: string;                                         // "da ottobre a Pasqua" (solo testo)
  scala: number;                                             // grandezza relativa sul bancone (1 = pagnotta da 1 kg), per la "scala vera" del CD
}
export interface Dolce { id: IdDolce; nome: string; righe: readonly [string, string]; alKg: number | null; pezzi: readonly { etichetta: string; prezzo: number }[]; quando: string; soloSuOrdinazione: boolean; scala: number }
export interface Pasta { id: IdPasta; nome: string; riga: string }
export const PANI: readonly Pane[];
export const DOLCI: readonly Dolce[];
export const PASTE: readonly Pasta[];
export const VASSOI: readonly { peso: PesoVassoio; paste: number; prezzo: number }[];
export const DOMENICA_PANI: readonly IdPane[];              // ['pagnotta', 'ciabatta']
export const MAX_PEZZI = 6;
export const MAX_PREFERITE = 4;
export const RECAPITI: { indirizzo: string; mapsQuery: string; telefonoHref: string; email: string };   // di esempio (0434 000 000, .example)
```

Tutto `as const`/`readonly`. I prezzi sono numeri (euro), formattati con
`Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })` da una
funzione `euro(n)` esportata dallo stesso file.

### 6.7 Foto: `assets/foto/index.ts` (photo-editor)

```ts
export type IdFoto = IdPane | IdDolce | IdPasta | 'impasto' | 'madre' | 'vassoio';
export interface Foto {
  id: IdFoto;
  src: string; srcPiccola: string;      // 1280 w e 640 w (import di Vite)
  gettone?: string;                     // 192×192 per i gettoni del pane fisso (solo pani e paste)
  w: number; h: number;                 // della 1280, per width/height (CLS)
  fuoco?: { x: number; y: number };     // object-position in %, se il ritaglio lo chiede
  autore: string; licenza: string; url: string; urlLicenza: string;
}
export const FOTO: Partial<Record<IdFoto, Foto>>;           // "Partial": piano B del CD, un prodotto può non avere foto
```

Un prodotto senza foto (pinza, pan di sorc se non si trovano) si disegna come
"casella più piccola sul piano" (CD 4.6 piano B): `Prodotto` lo gestisce da
solo se `FOTO[id]` manca. I crediti del piede si generano da `FOTO`.

### 6.8 `sections/Bancone/Prodotto.tsx` (firma fissata, stub dello scaffold)

```ts
interface ProdottoProps {
  id: IdPane | IdDolce | IdPasta;
  nome: string;
  righe: readonly string[];
  prezzo: string;                    // già formattato ("5,80 € al chilo")
  nota?: string;                     // giorni ("martedì e venerdì") o "a Pasqua, su ordinazione"
  scala: number;                     // grandezza sul bancone
  azione?: { etichetta: string; onClick: () => void; premuto?: boolean };   // "Nel pane fisso" / "Sul vassoio"
  prima?: boolean;                   // il primo prodotto di un banco: loading="eager" se vicino al primo schermo
}
export default function Prodotto(p: ProdottoProps): JSX.Element
```

Rende un `<article class="mad-prodotto">` con la foto che **poggia** sul
piano del bancone (`--mad-piano-y`), `h3` col nome, righe, prezzo, nota,
bottone. Foto con `width`/`height`, `srcset` (640w, 1280w), `sizes`,
`loading="lazy"`, `decoding="async"`, `alt` da `content/testi.ts`.

---

## 7. La prova del dito: contratto

### 7.1 Input (`interaction/provaDito.ts`, interaction-designer)

```ts
export function collegaProvaDito(el: HTMLButtonElement, opz: { zonaTouch: DOMRectReadOnly | (() => DOMRectReadOnly) }): () => void
```

- `el` è il `<button>` "Fai la prova del dito sull'impasto" che copre la
  superficie (del builder dell'impasto); il canvas e le fossette CSS stanno
  sotto, `aria-hidden`.
- Pointer down (mouse/penna subito; dito solo dentro la zona centrale del
  60%, e solo se prima di premere non si è mosso in verticale più di 12 px:
  altrimenti è scroll) → `uv = runtime.impasto.daSchermoAUv(x, y)` →
  `premi(uv)` di `motion/fossetta.ts`. Pointer up/cancel → `rilascia(i)`.
  Fino a 3 puntatori attivi.
- Tastiera: Invio/Spazio premuto = `premi` nel punto corrente, rilascio =
  `rilascia`; frecce = 5 posizioni (centro e quattro lati), con l'anello di
  fuoco disegnato attorno al punto (posizione scritta in `--mad-prova-x/y`
  sulla foglia `data-madvar`).
- La frase di spiegazione: al primo rilascio, se `!provaVista`, `annuncia()` +
  `segnaProvaVista()`; la riga visibile accanto la mostra il builder.
- `touch-action: none` solo sulla zona centrale (un elemento interno del
  bottone), `pan-y` sul resto della sezione.

### 7.2 Dinamica (`motion/fossetta.ts` e `motion/respiro.ts`, motion-designer)

```ts
export interface Fossetta { u: number; v: number; profondita: number; premuta: boolean; segno: number; eta: number }
export function premi(uv: { u: number; v: number }): number;      // indice usato (la quarta sostituisce la più vecchia)
export function rilascia(indice: number): void;
export function aggiornaFossette(dt: number, ridotto: boolean): boolean;   // fn di update per il ticker; true se qualcosa si muove
export function aggiornaRespiro(dt: number, now: number, ridotto: boolean): boolean;
```

Tempi dal CD 4.3: giù fino al massimo in ~500 ms con freno; su al 90% in
1,8-2,2 s, esponenziale, senza rimbalzo; segno leggero che svanisce in 4-5 s.
Respiro 8-10 s di ciclo, ampiezza minima, spento 30 s dopo l'ultimo input,
aggiornato a 30 fps. Con reduced motion: niente respiro; la fossetta cambia
solo un'intensità di ombreggiatura (400 ms entrata, 600 ms uscita), **i
vertici non si muovono** (lo shader legge `uRidotto`). Ogni cambio chiama
`runtime.markDirty()`. Registrazione nel ticker: la fa `Impasto.tsx` al
mount (update), la toglie allo smontaggio.

### 7.3 Resa

- **GL** (`data-gl="on"`): lo shader legge `uFossette[3]` = `vec4(u, v,
  profondita, segno)` + `uRespiro`, `uRidotto`, `uSegnoCliente` (vec3: u, v,
  presente). Forma a polpastrello (ellisse leggermente asimmetrica) e
  apertura dello spolvero decise dal webgl-artist.
- **CSS** (`data-gl="pending|off"`, `sections/Impasto/FossetteCss.tsx`): 3
  elementi con `radial-gradient` di ombra interna e luce sul bordo;
  in `write` si scrivono `transform: translate(...) scale(...)` e `opacity`
  dai valori di `runtime.impasto.fossette`. Stessa dinamica, niente
  transizioni CSS separate (così pending → on non cambia i tempi a metà di
  una prova).
- **Proiezione**: senza GL `daSchermoAUv` è lineare sul rettangolo della
  superficie; col GL lo shader-engineer la sostituisce con un raycast sul
  piano (la camera ha un angolo) e la rimette lineare in `dispose()`.

---

## 8. La scena WebGL

### 8.1 Geometria e camera

Un `PlaneGeometry` 180×110 segmenti (desktop) o 110×70 (puntatore grosso o
larghezza < 768), camera prospettica con leggero angolo dall'alto
(parametri in `webgl/forma.ts`), il piano riempie la finestra a qualsiasi
proporzione (lo shader-engineer adatta la scala al rapporto della finestra,
non la camera: così `forma.ts` resta uno). Nessuna luce di three: la luce è
nello shader (diffusa dall'alto a sinistra, niente speculare).

### 8.2 Uniform (layout fissato qui, implementato in `webgl/materiale.ts`)

| Uniform | Tipo | Chi lo scrive |
|---|---|---|
| `uFossette[3]` | `vec4` (u, v, profondità, segno) | shader-engineer da `runtime.impasto.fossette` |
| `uRespiro` | `float` | shader-engineer da `runtime.impasto.respiro` |
| `uSegnoCliente` | `vec3` (u, v, presente 0/1) | shader-engineer da `runtime.impasto.segnoCliente` |
| `uRidotto` | `float` 0/1 | shader-engineer dallo store |
| `uRisoluzione` | `vec2` px × dpr | shader-engineer |
| `uAspetto` | `float` | shader-engineer |
| `uFarina`, `uFarinaOmbra`, `uImpastoNudo` | `vec3` lineari | webgl-artist da `styles/tokens.ts` |
| `uSpolvero` | `sampler2D` 256², `RepeatWrapping` | webgl-artist (`spolvero.ts`) |

Normali: calcolate nello shader dalla stessa funzione d'altezza (differenze
finite nel fragment, o derivata analitica), non da `computeVertexNormals`
(la superficie cambia a ogni frame). `precision highp float` nel fragment.
Deve compilare in WebGL1 e WebGL2 (verifica del webgl-artist in Chromium
headless con SwiftShader, args in `docs/lab-operativo.md`).

### 8.3 Draw call e memoria

**1 draw call**, 1 materiale, 1 texture 256², nessun render target, nessun
post-processing. Memoria GPU trascurabile (vertici < 20 k).

### 8.4 `webgl/index.ts` (stub dello scaffold, poi shader-engineer)

```ts
export interface ImpastoCanvasProps { superficie: RefObject<HTMLElement> }   // l'elemento su cui si adatta
export default function ImpastoCanvas(p: ImpastoCanvasProps): JSX.Element | null
```

Lo monta `sections/Impasto/Superficie.tsx` quando `core/glLoader.ts` ha
restituito il componente. Il canvas: `aria-hidden="true"`,
`position: absolute; inset: 0` dentro la superficie, opacità 0 finché il
primo frame non è pronto, poi `impostaGL('on')` e dissolvenza di 300 ms.

---

## 9. Caricamento e fallback

### 9.1 Sequenza

1. **HTML + CSS**: `.mad-root` farina, `data-gl="pending"`. L'apertura è già
   completa: superficie color farina in CSS (gradiente morbido e grana
   **statica** dell'art-director), titolo `h1`, riga di testo, bottone "Il
   pane fisso", fossette CSS funzionanti. **LCP = il testo dell'`h1`**, mai il
   canvas né una foto. Vetrina, pane fisso e bottega sono tutti nel DOM.
2. **Font**: `injectFonts()` al mount; `@font-face` di ripiego locale con
   `size-adjust`/`ascent-override` tarati dall'art-director per Bricolage e
   Karla (niente salto al cambio font, CLS).
3. **Rilevamento** al mount (`core/capabilities.ts`): WebGL2 ?? WebGL con
   `failIfMajorPerformanceCaveat: true` e `highp`; `saveData`; `?gl=0` forza
   il fallback, `?gl=1` lo forza acceso (salvo contesto assente).
4. **Chunk GL lazy** (`core/glLoader.ts`): dopo `fontsReady()` **e**
   `requestIdleCallback` (timeout 1200 ms; `setTimeout` 300 ms dove manca) →
   `import('../webgl')`. Solo se `#impasto` è ancora entro una finestra dalla
   vista (chi arriva con `#pane-fisso` non lo scarica finché non torna su).
5. **Primo frame**: `ImpastoGL` disegna, misura il tempo del primo frame
   (dal `render()` al rAF successivo): **sopra 200 ms → fallback** (CD 4.3),
   altrimenti `impostaGL('on')` e il canvas sale a opacità 1 in 300 ms sopra
   la superficie CSS, che poi si nasconde. Tetto di 6 s dal mount per import
   + primo frame, poi `impostaGL('off', 'tempo')`.
6. **Render on demand**: solo se `runtime.dirty` **e**
   `runtime.impasto.inVista` **e** la scheda è visibile. Fossette ferme e
   respiro spento = 0 render.

### 9.2 Fallback senza WebGL (`data-gl="off"`)

Cause: nessun contesto, niente `highp`, `saveData`, `?gl=0`, errore di import,
tetto dei 6 s, primo frame > 200 ms, qualità troppo bassa (§10),
`webglcontextlost` (subito off; su `restored` si ricrea e si torna on).
Cosa si vede: **la foto macro vera dell'impasto spolverato** a tutta
superficie (`FOTO.impasto`, caricata solo ora, `fetchpriority="high"`), sopra
le fossette CSS (§7.3), stesso testo, stesso senso. Il passaggio on → off è
una dissolvenza di 300 ms, mai un lampo. Il resto del sito è identico con o
senza GL.

### 9.3 Reduced motion (`data-motion="reduced"`)

Il GL si carica comunque (è materia, non animazione): niente respiro,
fossetta solo in ombreggiatura (§7.2). Vetrina senza inerzia e senza foglio
animato (§6.3). Gettoni che riappaiono invece di volare. Pieghe del vassoio
senza animazione. Scroll ai link senza liscio. Nessun cambio di luminosità di
grandi superfici più di una volta ogni 500 ms in nessun caso.

### 9.4 Fuori vista, pausa, smontaggio

- `#impasto` fuori vista → 0 render (la dinamica delle fossette continua solo
  finché ha qualcosa da fare, poi il ticker dorme).
- Fuori vista da **15 s** e distante più di una finestra →
  `ImpastoGL.dispose()` e `renderer.forceContextLoss()` (libera la GPU sui
  telefoni mentre si usa il pane fisso); `data-gl` torna `pending`, si vede
  la superficie CSS. Rientro entro una finestra → rimontaggio (il chunk è in
  cache) con la stessa dissolvenza.
- `visibilitychange` → ticker fermo.
- Smontaggio (navigazione nel sito vero): `Madre.tsx` ferma il ticker, toglie
  listener e osservatori, `dispose()` del GL, toglie il `<link>` dei font solo
  se l'ha aggiunto, ripristina fondo e `overscroll-behavior` di `html/body`,
  `scrollRestoration` e `document.title`.

---

## 10. Budget di performance

Misurati dal performance-auditor sulla build standalone (Lighthouse mobile e
desktop).

| Voce | Budget |
|---|---|
| JS iniziale del concept (chunk `Concept17`, senza react/router) | ≤ **60 KB gz** |
| JS iniziale totale (con react, react-dom, router) | ≤ **120 KB gz** |
| Chunk WebGL lazy (three + `webgl/`) | ≤ **160 KB gz** (atteso ~125) |
| CSS totale del concept | ≤ **24 KB gz** |
| SVG totali | ≤ 12 KB |
| Font woff2 latin | ≤ **160 KB** (Bricolage 3 assi 131,5 + Karla 24,3; 101 KB se si toglie `wdth`) |
| Foto prodotti (pani, dolci, madre, vassoio) | ciascuna ≤ **110 KB** a 1280 w, ≤ **45 KB** a 640 w, `loading="lazy"` |
| Gettoni (192×192) | ciascuno ≤ **12 KB** |
| Foto dell'impasto (solo fallback) | ≤ **140 KB** a 1600 w, ≤ **60 KB** a 800 w |
| Byte al primo schermo (HTML + JS + CSS + font, niente foto) | ≤ **450 KB** trasferiti |
| LCP | ≤ **2,5 s** mobile, ≤ 1,5 s desktop; elemento LCP = `h1`, **mai** il canvas |
| CLS | ≤ **0,02** (foto con `width`/`height`, font con ripiego metrico, altezza della vetrina calcolata una volta a font pronti e poi solo sui cambi di larghezza, barra del pane fisso fissa senza spingere il contenuto) |
| INP | ≤ **150 ms** (tocco sul giorno, meno/più, "Nel pane fisso", invio: le azioni aggiornano solo lo store; FLIP in rAF, non nell'handler) |
| TBT | ≤ 150 ms mobile |
| Draw call | **1** |
| DPR canvas | mobile ≤ **1,75**, desktop ≤ **1,5**, pixel totali ≤ **3,5 M** |
| FPS | 60 desktop, ≥ 50 mobile medio durante una prova; respiro a 30 fps; **0 render** a impasto fermo o fuori vista |
| Scroll della vetrina | nessun long task > 50 ms durante lo scorrimento a 390 px con CPU 4×; solo `transform` in scrittura, nessuna lettura di layout in `update`/`write` |

**Qualità adattiva** (`webgl/qualita.ts`): media mobile del tempo frame su 30
frame renderizzati; sopra 20 ms scende il DPR di 0,25 fino a 1,0, poi passa
alla griglia mobile (110×70); sotto 24 fps per 3 s a DPR 1,0 →
`impostaGL('off', 'qualita')` con dissolvenza di 300 ms.

---

## 11. Comandi e porte

Dalla cartella `concepts/17-madre/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite --port 9170 --strictPort` → http://localhost:9170/concept-17 (`/` fa redirect) |
| `npm run build` | `vite build` in `dist/` |
| `npm run preview` | `vite preview --port 9170 --strictPort` (fallback SPA: `/concept-17` regge il ricaricamento) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: da lanciare prima di dire "fatto" |

Chi usa un'altra porta del range la passa a mano:
`npx vite --port <n> --strictPort` (o `npx vite preview --port <n> --strictPort`).

URL di prova:

| URL | Effetto |
|---|---|
| `/concept-17?gl=0` | fallback: foto dell'impasto e fossette CSS |
| `/concept-17?gl=1` | GL anche con risparmio dati |
| `/concept-17?invio=ko` | l'invio simulato del pane fisso fallisce |
| `/concept-17?settimana=esempio` | settimana del brand-strategist 7.4 già messa (segale mar+ven, pagnotta 1 kg sab, vassoio 750 g ogni domenica), per QA degli stati pieni |
| `/concept-17#pane-fisso` | arrivo diretto al pane fisso |
| `/concept-17#dolci` | arrivo nella vetrina, al banco dei dolci (foglio azzurro già steso) |

Per svuotare la memoria nel browser:
`localStorage.removeItem('madre:bozza'); localStorage.removeItem('madre:inviata')`.

**Porte** (range 9170–9179, sempre `--strictPort`, ognuno chiude il suo
server; mai processi altrui):

| Ondata | Agent → porta |
|---|---|
| 2 | art-director 9171, webgl-artist 9172, vector-artist 9173, photo-editor 9174, interaction-designer 9175, motion-designer 9176, copywriter 9177 |
| 3 | scaffold 9170 (da solo); poi shader-engineer 9170, impasto 9171, bancone 9172, pane 9173, la-madre 9174, dolci 9175, domenica 9176, pane-fisso 9177, bottega 9178 |
| 4 | responsive 9171, accessibility 9172, performance 9173, cross-browser 9174, seo 9175, awwwards-jury 9176 (preview su quella porta) |
| riserva | 9179 (solo se la propria porta è occupata da un proprio processo rimasto) |

---

## 12. Analytics

`import { track } from '@/lib/analytics'` (firma del sito, `TrackEvent`
chiuso, integrazione-sito punto 2). Solo:
- `track('apri_concept', { concept: 17 })` al mount di `Madre`, una volta
  (guardia per StrictMode), con `gl` come parametro solo se già deciso
  (altrimenti niente: nessun evento in più per il GL);
- `track('demo_prenotazione', { concept: 17, giorni: 3, pani: 4, vassoio:
  true, frequenza: 'ogni' })` al **successo** dell'invio, solo lì
  (section-builder-pane-fisso). Mai nome, telefono, email, cifra.

---

## 13. Checklist per chi scrive codice

- `design-taste-frontend` e `full-output-enforcement`: niente placeholder,
  niente TODO, file completi.
- Solo i propri file (§4). Condiviso = store, runtime, vetrina, settimana,
  token, content, foto.
- Nessun `requestAnimationFrame` fuori dal ticker, nessun listener `scroll`
  (c'è `runtime.scrollY`), nessuna lettura di layout in `update`/`write`.
- Nessun hex fuori da `styles/tokens.*`; nessun testo fuori da `content/`.
- Nessun accesso al browser (né `new Date()` "di oggi") a livello di modulo.
- Canvas e fossette CSS `aria-hidden="true"`; l'impasto è un `<button>`;
  gettoni e giorni sono `<button aria-pressed>`; un `h1` (impasto), un `h2`
  per banco; target ≥ 44×44 px (giorni su mobile ≥ 56 px di altezza); fuoco
  anello inchiostro 2 px con stacco 2 px, mai coperto dalla testata, dalle
  etichette o dalla barra del pane fisso (`scroll-padding`).
- Nessun cambio di colore di grandi superfici più di una volta ogni 500 ms.
- Nella vetrina: niente `overflow: hidden` su contenitori che contengono
  elementi con fuoco; niente `scrollIntoView`; niente `100vh`.
- `npm run check` verde prima di consegnare.

---

## Richieste ad altri agent

- **creative-director / orchestratore / ux-architect**: approvare la
  deviazione di §0.5: **il pane fisso e la bottega fuori dalla striscia
  orizzontale**, in verticale dopo il bancone, su tutte le larghezze. La
  vetrina orizzontale resta per pane, la madre, dolci e domenica. Motivi
  tecnici in §0.5 (campi, tastiera virtuale, trascinamento, sette righe su
  mobile, scroll annidato). La navigazione dei banchi resta unica e comprende
  tutti i banchi.
- **ux-architect**: la "Sezioni da costruire" va mappata su 8 builder:
  `impasto` (con la testata), `bancone` (piano, foglio azzurro, etichette dei
  banchi, componente `Prodotto`), `pane`, `la-madre`, `dolci`, `domenica`,
  `pane-fisso`, `bottega` (con il piede). Serve da te: dove stanno le
  etichette su mobile rispetto al `ConceptBackButton` (in basso a sinistra) e
  alla barra del pane fisso; quanto è largo ogni banco a 1440 e 375 (84 vw a
  prodotto su mobile, CD 4.2).
- **art-director**: token obbligatori oltre a palette e tipografia:
  `--mad-piano-y` (altezza del piano del bancone, mobile e desktop),
  `--mad-z-*` (§5), la superficie CSS dell'impasto per lo stato `pending`
  (gradiente e grana statica), `@font-face` di ripiego con metriche per
  Bricolage e Karla; in `tokens.ts` i colori farina/ombra/impasto nudo anche
  in rgb lineare per lo shader. Decidere se tenere l'asse `wdth` (§1.3).
- **webgl-artist**: rispettare il layout degli uniform di §8.2; niente luci
  di three, niente render target; compilazione verificata in WebGL1 e WebGL2.
  Finché lo scaffold non c'è, prova in una pagina nello scratchpad con three
  0.160.1 (per esempio dai `node_modules` del pilota).
- **motion-designer**: `motion/fossetta.ts` e `motion/respiro.ts` con le
  firme di §7.2, dinamica su `dt` (non per frame), e `markDirty()` a ogni
  cambio; `motion/gettoni.ts` con FLIP che misura solo in `read`.
- **interaction-designer**: `collegaProvaDito` (§7.1), `usePresa` e
  `useBersaglio` (§6.4), gesti della vetrina (§6.3) senza bloccare lo scroll
  verticale nativo.
- **copywriter**: `content/prezzi.ts` con gli id e i tipi esatti di §6.6 e i
  prezzi del brand-strategist §7; in `testi.ts` anche gli annunci
  `aria-live` di ogni azione del pane fisso (messo, tolto, errore per codice,
  in mano, posato) e la frase di spiegazione della prova del dito.
- **photo-editor**: `assets/foto/index.ts` con il tipo `Foto` e gli id di
  §6.7; tre misure per pani e paste (1280, 640, gettone 192²), due per il
  resto; foto dell'impasto anche a 1600 w per il fallback; `fuoco` in % dove
  il ritaglio lo chiede.
- **scaffold-engineer**: parametro `?settimana=esempio` (§11) letto in
  `inizializzaStore`; `Prodotto.tsx` e `webgl/index.ts` come stub con la
  firma finale (§6.8, §8.4); classe `mad-vetrina--statica` per il prerender.
