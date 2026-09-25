# Tech architect · Concept 10 · IMPRONTA

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, convenzioni, contratti tra moduli, budget e caricamento.

Letti: `CLAUDE.md`, `docs/processo-agent.md`, `docs/concept-lab.md`
(sezione "Integrazione"), `concepts/10-torchio/docs/creative-director.md`.
Registry npm verificato raggiungibile il 2026-09-25 (versioni sotto
controllate con `npm view`). Node disponibile: 22.22.

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/10-torchio/`, con la stessa struttura di `cicerilab/cicerilab`:
   il concept vive tutto in `src/pages/concepts/impronta/`, e
   `src/pages/Concept10.tsx` è un file sottile. Il porting è: copiare la
   cartella `impronta/` e `Concept10.tsx`, fine.
2. **three 0.160 "puro", senza R3F né drei.** La scena è un solo piano a
   schermo intero con un solo materiale: R3F aggiungerebbe un reconciler
   (~40 KB gz) e un frameloop da domare, senza darci niente. three è già nel
   sito (lo usa il Concept 1), quindi nel porting non si aggiunge nulla.
3. **Niente GSAP.** Bastano lenis + IntersectionObserver + un unico ciclo
   `requestAnimationFrame` nostro (il "ticker") + `position: sticky`. Motivo
   sotto (§2.2).
4. **CSS in file `.css` per sezione, prefisso `imp-`**, tutto annidato sotto
   il wrapper `.imp-root`. Niente Tailwind, niente CSS modules (§5).
5. **Stato globale in un piccolo store con `useSyncExternalStore`** per i
   valori lenti (carta, testo del cliente, prova, invio); i valori caldi
   (luce, scroll, pressioni) stanno in un oggetto mutabile letto dal ticker,
   **mai** nello stato React (§6).
6. **Registro dei blocchi a rilievo**: ogni blocco DOM premuto si registra con
   `useRelief(ref, spec)`; il registro tiene il rettangolo in coordinate
   documento e lo converte in coordinate viewport a ogni frame sottraendo lo
   scroll, senza leggere il layout durante lo scroll (§7).
7. **La prima pittura è CSS**: il rilievo in `text-shadow` è il fallback ed è
   anche quello che si vede prima che il WebGL arrivi (caricato lazy, dopo i
   font, in idle). Il WebGL sostituisce il CSS solo dopo il suo primo frame
   (§9).
8. **Atlante di mappe d'altezza sul GPU**: le maschere si disegnano su canvas
   2D dal testo vero, lo smusso si fa con blur separabile in shader (non con
   `ctx.filter`, che Safari vecchi non hanno); durante lo scroll si
   aggiornano solo uniform. **1 draw call per frame.**

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json` standalone)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito (React 18) |
| `react-router-dom` | `6.30.6` | ultima 6.x; solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` |
| `three` | `0.160.1` | patch della 0.160 del sito; se il sito ha `0.160.0` non cambia nulla per noi |
| `lenis` | `1.3.26` | import `from 'lenis'`; si usa solo `new Lenis()`, `raf()`, `on('scroll')`, `scrollTo()`, `destroy()`: API stabile in tutta la 1.x, quindi va bene qualsiasi lenis 1.x del sito |

### 1.2 Dev

| Pacchetto | Versione |
|---|---|
| `vite` | `5.4.21` |
| `@vitejs/plugin-react` | `4.7.0` |
| `typescript` | `5.6.3` |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` |
| `@types/three` | `0.160.0` |
| `@types/node` | `22.20.4` (solo per `vite.config.ts`) |
| `eslint`, `@eslint/js` | `9.39.5` |
| `typescript-eslint` | `8.70.1` |
| `eslint-plugin-react-hooks` | `5.2.0` |
| `eslint-plugin-react-refresh` | `0.4.26` |
| `globals` | `15.15.0` |

**Non installati di proposito**: `@react-three/fiber`, `@react-three/drei`
(vedi §2.1), `gsap` (§2.2), Tailwind, librerie di stato (zustand ecc.),
librerie di font (`@fontsource`), `vite-plugin-glsl` (gli shader si importano
con `?raw`, nativo di Vite, così il porting non richiede plugin).

### 1.3 Font

Google Fonts, iniettati con un `<link>` in `useEffect` (come i Concept 1-9),
più `preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`:

```
https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=Hanken+Grotesk:wght@400;500;600&display=swap
```

Solo sottoinsieme latin (automatico con `unicode-range`). Niente corsivi. L'URL
esatto vive in `styles/tokens.ts` (`FONT_CSS_URL`, dell'art-director); lo
inietta `core/fonts.ts` (scaffold). Il WebGL non disegna nessuna maschera
prima di `document.fonts.load()` sui pesi/larghezze usati (vedi §7.4).

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json` (`paths`).
- `tsconfig.app.json`: `strict: true`, `noUncheckedIndexedAccess: true`,
  `jsx: react-jsx`, `moduleResolution: bundler`, `types: ["vite/client"]`.
- Dev server porta **8080** (come il sito), `preview` porta 4173.
- Target build `es2020`.

---

## 2. Scelte motivate

### 2.1 three puro invece di R3F/drei

La scena del creative director è: un `<canvas>` fisso a tutta pagina, **un
solo piano**, un solo `ShaderMaterial`, una camera ortografica, più un paio di
passaggi di "cottura" (blur) in render target solo quando cambia una maschera.
Non c'è grafo di scena, non ci sono oggetti da gestire in JSX, non servono
controlli, loader o helper di drei. Il `View` di drei (proposto come opzione
dal CD) creerebbe un viewport e una draw call per blocco: noi invece facciamo
tutto in un fragment shader che conosce i rettangoli dei blocchi → 1 draw
call.

Con three puro abbiamo controllo diretto su: render on demand (renderizziamo
solo quando il ticker dice "sporco"), gestione della perdita di contesto,
`setPixelRatio` adattivo, render target dell'atlante. Il tutto chiuso in una
classe (`webgl/ImprontaGL.ts`) montata da un componente React sottile.

### 2.2 GSAP no: lenis + IntersectionObserver + ticker

Gli unici movimenti ammessi dal CD sono sei: pressione dei blocchi, luce,
sezione tecniche fissata, propagazione della carta, filo della legatura, leva.

| Movimento | Come si fa senza GSAP |
|---|---|
| Pressione (0→1 una volta, freno + micro rimbalzo) | IntersectionObserver fa partire una molla critica/sotto-smorzata nel ticker (`motion/spring.ts`) |
| Luce | lerp nel ticker (0,08 per frame, normalizzato su dt) |
| Tecniche fissata | `position: sticky` in CSS + `useScrollProgress(ref)` che dà 0→1 dalla posizione della sezione e dallo scroll di lenis |
| Propagazione carta | `clip-path: circle()` animato nel ticker (DOM) + uniform `uWave` (GL) |
| Filo legatura | `stroke-dashoffset` guidato dallo stesso `useScrollProgress` |
| Leva | durata di pressione misurata nel ticker (pointer/tastiera) |

Nessuno di questi richiede timeline annidate, stagger complessi o
ScrollTrigger con pin (il pin lo fa `sticky`, che è più stabile su iOS e non
crea spazi finti). GSAP + ScrollTrigger costerebbero ~45 KB gz e un secondo
loop rAF da sincronizzare con lenis. **Se** il motion-designer dimostra nel
suo documento un caso che non si regge senza (non ne vedo), si aggiunge
`gsap@3.15.0` solo nel chunk della sezione che lo usa, e va detto nel
riepilogo a Luca perché va installato nel sito vero.

### 2.3 Un solo ciclo rAF

`core/ticker.ts` è l'unico `requestAnimationFrame` di tutto il concept. Ordine
fisso in ogni frame:

1. `lenis.raf(time)` (scroll liscio);
2. **fase lettura**: il registro aggiorna i rettangoli dei blocchi "live"
   (solo quelli, vedi §7.2);
3. **fase aggiornamento**: molle di pressione, lerp della luce, progressi di
   scroll, onda della carta, leva;
4. **fase scrittura DOM**: variabili CSS (`font-variation-settings` dei
   titoli, `stroke-dashoffset`, `clip-path`);
5. **render WebGL** solo se qualcosa è sporco.

Nessun altro modulo chiama `requestAnimationFrame` o `setInterval` per
animare. Il ticker si ferma da solo quando nessun abbonato è attivo e nessun
valore si sta muovendo, e si ferma sempre su `visibilitychange` → nascosto.

---

## 3. Struttura delle cartelle

Legenda: **[S]** = solo app standalone, non si porta. **[P]** = si porta nel
sito. Tra parentesi il proprietario (vedi §4).

```
concepts/10-torchio/
├─ DESIGN.md                                   [S*] (art-director)  *si tiene nel repo claude250 come doc
├─ docs/                                       [S]  un .md per agent, ognuno il suo
├─ package.json  package-lock.json             [S]  (scaffold)
├─ vite.config.ts                              [S]  (scaffold)
├─ tsconfig.json  tsconfig.app.json  tsconfig.node.json  [S] (scaffold)
├─ eslint.config.js  .gitignore                [S]  (scaffold)
├─ index.html                                  [S]  (scaffold)  lang="it", meta, preconnect font, colore di fondo Citrino inline
├─ public/
│  └─ favicon.svg                              [S]  (vector-artist)
└─ src/
   ├─ main.tsx                                 [S]  (scaffold)  createRoot + <App/>
   ├─ App.tsx                                  [S]  (scaffold)  BrowserRouter; /concept-10 lazy; / e * → <Navigate to="/concept-10" replace/>
   ├─ vite-env.d.ts                            [S]  (scaffold)
   ├─ lib/
   │  └─ analytics.ts                          [S]  (scaffold)  stub: export function track(name, props?) → console.debug in dev
   └─ pages/
      ├─ Concept10.tsx                         [P]  (scaffold)  sottile: default export che rende <Impronta/>
      └─ concepts/
         └─ impronta/                          [P]  TUTTO il concept
            ├─ index.ts                        (scaffold)  export { default } from './Impronta'
            ├─ Impronta.tsx                    (scaffold)  radice: .imp-root, font, lenis, ticker, ordine sezioni, canvas lazy
            │
            ├─ core/                           (scaffold)
            │  ├─ ticker.ts                    unico rAF (§2.3)
            │  ├─ lenis.ts                     crea/distrugge lenis, espone scrollY corrente
            │  ├─ capabilities.ts              detectWebGL(), prefersReducedMotion(), isCoarsePointer(), saveData
            │  ├─ fonts.ts                     injectFonts(), fontsReady(specs)
            │  ├─ links.ts                     LAB_URL, CICERILAB_URL, MAPS_URL (costanti)
            │  └─ glLoader.ts                  decide se e quando fare import('../webgl')
            │
            ├─ state/                          (scaffold)
            │  ├─ store.ts                     store + useImpronta(selector) (§6.1)
            │  ├─ runtime.ts                   valori caldi mutabili (§6.2)
            │  └─ persist.ts                   localStorage/sessionStorage con try/catch
            │
            ├─ relief/                         (scaffold)
            │  ├─ types.ts                     ReliefSpec, ReliefBlock (contratto §7.1)
            │  ├─ registry.ts                  registro blocchi + misure (§7.2)
            │  ├─ useRelief.ts                 hook di registrazione
            │  └─ ReliefText.tsx               componente "fantasma" DOM del testo a rilievo (§7.3)
            │
            ├─ motion/                         (motion-designer)
            │  ├─ easing.ts                    curve custom (funzioni + stringhe cubic-bezier per CSS)
            │  ├─ spring.ts                    molla integrata sul dt del ticker
            │  ├─ choreography.ts              costanti: durate, ritardi, soglie IO per ogni sezione
            │  ├─ usePressione.ts              IO → molla → registry.setPressione(id, v) + var CSS --imp-press
            │  └─ useScrollProgress.ts         0→1 di una sezione (sticky, filo)
            │
            ├─ interaction/                    (interaction-designer)
            │  ├─ light.ts                     puntatore/dito/giroscopio → runtime.light.target
            │  ├─ gyroPermission.ts            richiesta permesso iOS al primo tocco
            │  ├─ useHoldToConfirm.ts          logica della leva (mouse, dito, Spazio/Invio, alternativa a doppio clic)
            │  ├─ paperWave.ts                 startPaperWave(x, y, carta): onda DOM + store.cartaWave
            │  ├─ useSwipeDeck.ts              sfoglia i pezzi di "Per chi" su mobile
            │  └─ interaction.css              stati :hover/:focus-visible/:active, anello di focus
            │
            ├─ webgl/
            │  ├─ shaders/                     (webgl-artist)
            │  │  ├─ fullscreen.vert.glsl
            │  │  ├─ relief.frag.glsl          carta + fibra + rilievo + inchiostro + lamina + luce
            │  │  ├─ blur.frag.glsl            blur separabile per lo smusso a gradini
            │  │  └─ composite.frag.glsl       somma dei passaggi di blur nello slot dell'atlante
            │  ├─ materials.ts                 (webgl-artist) createReliefMaterial(), createBlurMaterial(), layout uniform
            │  ├─ maskPainter.ts               (webgl-artist) ReliefSpec → canvas 2D (R altezza, G inchiostro, B lamina)
            │  ├─ fiber.ts                     (webgl-artist) texture di rumore 256² generata a runtime
            │  ├─ presets.ts                   (webgl-artist) parametri per tecnica e per carta
            │  ├─ ImprontaGL.ts                (shader-engineer) classe: renderer, resize, DPR, perdita contesto, render
            │  ├─ atlas.ts                     (shader-engineer) allocatore a scaffali + render target
            │  ├─ blocks.ts                    (shader-engineer) culling e impacchettamento uniform per frame
            │  ├─ quality.ts                   (shader-engineer) DPR adattivo, spegnimento se troppo lento
            │  ├─ ImprontaCanvas.tsx           (shader-engineer) componente React che monta ImprontaGL
            │  └─ index.ts                     (shader-engineer; stub iniziale dello scaffold) export default ImprontaCanvas
            │
            ├─ content/                        (copywriter)
            │  ├─ testi.ts                     tutti i testi visibili, per sezione, tipizzati
            │  └─ prezzi.ts                    tabella prezzi di esempio (dati, niente calcolo)
            │
            ├─ styles/
            │  ├─ tokens.css                   (art-director) variabili CSS su .imp-root e [data-carta=…]
            │  ├─ tokens.ts                    (art-director) CARTE (colori in hex e in vec3), FONT_CSS_URL, scala tipografica numerica per il WebGL
            │  ├─ relief-fallback.css          (art-director) rilievo CSS text-shadow, lamina gradiente
            │  ├─ base.css                     (scaffold) reset scoped sotto .imp-root, tipografia base
            │  └─ layout.css                   (scaffold) margini da libro, gabbia pagina, classi .imp-page / .imp-block
            │
            ├─ assets/svg/                     (vector-artist)
            │  ├─ marchio-impronta.svg         marchio (per lamina e fallback)
            │  ├─ filo-brossura.svg
            │  ├─ filo-cartonato.svg
            │  ├─ filo-giapponese.svg
            │  ├─ filo-punto-metallico.svg
            │  ├─ freccia.svg                  unica icona di servizio (link esterni)
            │  └─ index.ts                     export delle stringhe/URL (import ?raw o ?url)
            │
            └─ sections/
               ├─ Hero/        Hero.tsx  hero.css  Testata.tsx  testata.css           (section-builder-hero)
               ├─ PerChi/      PerChi.tsx  per-chi.css  Pezzo.tsx                     (section-builder-per-chi)
               ├─ Tecniche/    Tecniche.tsx  tecniche.css                             (section-builder-tecniche)
               ├─ Carta/       Carta.tsx  carta.css                                   (section-builder-carta)
               ├─ Legatoria/   Legatoria.tsx  legatoria.css  Filo.tsx                 (section-builder-legatoria)
               ├─ Banco/       Banco.tsx  banco.css  Prova.tsx  Compositoio.tsx
               │               Leva.tsx  calcolaPrezzo.ts  invio.ts                   (section-builder-banco)
               ├─ Bottega/     Bottega.tsx  bottega.css                               (section-builder-bottega)
               └─ Colophon/    Colophon.tsx  colophon.css                             (section-builder-colophon)
```

Ordine delle sezioni in `Impronta.tsx`: Testata (dentro Hero), Hero, PerChi,
Tecniche, Carta, Legatoria, Banco, Bottega, Colophon. Se l'ux-architect cambia
nomi o ordine delle sezioni, cambiano i testi e l'ordine in `Impronta.tsx`, non
i nomi delle cartelle (restano stabili per i proprietari).

### 3.1 Regole di porting (valgono già da ora)

- **Dentro `impronta/` nessun import fuori da `impronta/`** tranne
  `@/lib/analytics` e i pacchetti npm. Niente import da `@/components` o simili:
  nel sito non sappiamo cosa c'è.
- Nessun accesso a `window`, `document`, `localStorage`, `matchMedia` a
  livello di modulo: solo dentro effetti, handler o funzioni chiamate da
  effetti. Il build del sito fa **prerender**: il concept deve poter essere
  renderizzato senza browser (il canvas e lenis non partono lì).
- Gli asset (SVG, GLSL) si importano con i suffissi nativi di Vite (`?raw`,
  `?url`), mai da `public/`.
- `Concept10.tsx` finale (indicativo):
  `export default function Concept10() { return <Impronta /> }` con
  `import Impronta from './concepts/impronta'`.
- Da verificare al porting (non lo sappiamo da qui): firma reale di `track()`
  nel sito, eventuale lenis globale già attivo in `App.tsx` del sito (se c'è,
  il concept usa quello invece di crearne uno: il punto di scambio è solo
  `core/lenis.ts`), URL della pagina Concept Lab (`core/links.ts`).

---

## 4. File di competenza esclusiva

Regola: **ogni file ha un solo proprietario**. Chi ha bisogno di una modifica
in un file altrui la chiede nel proprio `docs/<agent>.md` (sezione "Richieste
ad altri agent") e l'orchestratore la gira al proprietario. Tutti possono
**leggere e importare** tutto.

**Passaggio di stub**: lo scaffold crea alcuni file vuoti perché il build sia
verde dal primo minuto (componenti di sezione che rendono una `<section>`
vuota, `webgl/index.ts` che esporta un componente che rende `null`). Al
termine dello scaffold, la proprietà di quei file passa al proprietario
indicato qui sotto e lo scaffold non li tocca più.

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md` (root del concept), `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts`, `styles/relief-fallback.css` | CSS delle sezioni, `base.css`, `layout.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/spring.ts`, `motion/choreography.ts`, `motion/usePressione.ts`, `motion/useScrollProgress.ts` | ticker (usa la sua API), CSS delle sezioni |
| **webgl-artist** | `docs/webgl-artist.md`, `webgl/shaders/*.glsl`, `webgl/materials.ts`, `webgl/maskPainter.ts`, `webgl/fiber.ts`, `webgl/presets.ts` | tutto fuori da `webgl/`; in `webgl/` i file dello shader-engineer |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*` (tutti i file elencati in §3) | niente cursore custom, niente preloader (vietati dal CD) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/prezzi.ts` | nessun testo scritto direttamente nei componenti |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*`, `public/favicon.svg` | niente figure, mani, torchi o macchine (vietati dal CD) |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`, tutti i file **[S]** di §3 tranne `DESIGN.md`, `docs/*` altrui e `public/favicon.svg`; `src/pages/Concept10.tsx`; `impronta/index.ts`, `impronta/Impronta.tsx`; `core/*`; `state/*`; `relief/*`; `styles/base.css`, `styles/layout.css`; stub iniziali di `sections/*/*.tsx` e `webgl/index.ts` (poi passano ai proprietari) |
| **section-builder-hero** | `sections/Hero/Hero.tsx`, `hero.css`, `Testata.tsx`, `testata.css`, `docs/section-builder-hero.md` |
| **section-builder-per-chi** | `sections/PerChi/PerChi.tsx`, `per-chi.css`, `Pezzo.tsx`, `docs/section-builder-per-chi.md` |
| **section-builder-tecniche** | `sections/Tecniche/Tecniche.tsx`, `tecniche.css`, `docs/section-builder-tecniche.md` |
| **section-builder-carta** | `sections/Carta/Carta.tsx`, `carta.css`, `docs/section-builder-carta.md` |
| **section-builder-legatoria** | `sections/Legatoria/Legatoria.tsx`, `legatoria.css`, `Filo.tsx`, `docs/section-builder-legatoria.md` |
| **section-builder-banco** | `sections/Banco/Banco.tsx`, `banco.css`, `Prova.tsx`, `Compositoio.tsx`, `Leva.tsx`, `calcolaPrezzo.ts`, `invio.ts`, `docs/section-builder-banco.md` |
| **section-builder-bottega** | `sections/Bottega/Bottega.tsx`, `bottega.css`, `docs/section-builder-bottega.md` |
| **section-builder-colophon** | `sections/Colophon/Colophon.tsx`, `colophon.css`, `docs/section-builder-colophon.md` |
| **shader-engineer** (in parallelo ai section-builder: dipende solo dai contratti di §6-7 e dai file del webgl-artist) | `webgl/ImprontaGL.ts`, `webgl/atlas.ts`, `webgl/blocks.ts`, `webgl/quality.ts`, `webgl/ImprontaCanvas.tsx`, `webgl/index.ts`, `docs/shader-engineer.md` |

Note:
- Il section-builder-banco scrive `invio.ts` come **invio simulato** (nessuna
  rete, nessun endpoint: è un concept). Risolve dopo ~1,2 s; con `?invio=ko`
  nell'URL fallisce, per poter vedere lo stato di errore in QA.
- La Testata (marchio, tre voci di menu, torna a CiceriLab) è dell'hero builder
  perché vive nella prima schermata; è `position: sticky`/fissa con i suoi
  stili in `testata.css`.
- Il copywriter scrive i testi **come dati**; i section-builder li importano da
  `content/testi.ts` e non inventano testo. Se manca una stringa, la chiedono.

---

## 5. Convenzioni CSS

- **File `.css` per sezione, importati dal componente** (`import './hero.css'`).
  Scelto contro i CSS modules perché: è il pattern dei Concept 1-9 (prefisso
  di classe scoped), le classi restano leggibili negli screenshot/devtools dei
  QA, e i selettori di stato (`.imp-root[data-carta="grafite"] …`,
  `[data-gl="on"] …`) si scrivono senza `:global`. Niente Tailwind: il sito
  non lo usa per i concept, e le variazioni per carta sono variabili CSS, che
  Tailwind non semplifica.
- **Prefisso `imp-`** su ogni classe, con BEM leggero:
  `imp-<sezione>`, `imp-<sezione>__<elemento>`, `imp-<sezione>--<variante>`.
  Esempi: `imp-hero__parola`, `imp-banco__leva`, `imp-carta__striscia--grafite`.
  Classi condivise dello scaffold: `imp-root`, `imp-page`, `imp-block`,
  `imp-relief`, `imp-sr` (solo lettori di schermo).
- **Tutti i selettori iniziano con `.imp-root`** (anche nei file di sezione).
  Nel sito, un CSS importato da una pagina lazy resta caricato quando si
  cambia pagina: lo scope evita che colpisca altre pagine. Niente selettori su
  `html`, `body`, `:root`, `*` nudi. Lo sfondo della pagina si dà a
  `.imp-root` (a tutta altezza), non a `body`.
- **Variabili**: prefisso `--imp-`. Solo l'art-director le definisce
  (`tokens.css`); le sezioni possono definire variabili locali con prefisso di
  sezione (`--imp-hero-…`). Il cambio carta avviene cambiando
  `data-carta` su `.imp-root`: tutte le sezioni devono usare le variabili
  (`--imp-carta`, `--imp-carta-luce`, `--imp-carta-ombra`, `--imp-inchiostro`,
  `--imp-lamina`), mai hex diretti.
- **Attributi di stato su `.imp-root`** (scritti solo da `Impronta.tsx`/store):
  `data-carta="citrino|cotone|cipria|grafite"`, `data-gl="pending|on|off"`,
  `data-motion="full|reduced"`.
- **Z-index** (definiti come token): canvas 0, contenuto 1, testata 10,
  onda carta 20. Nient'altro.
- Unità: `rem` per testo, `clamp()` per le misure fluide, `dvh`/`svh` per le
  altezze a schermo (mai `100vh` puro su mobile). Raggio 0 ovunque (CD) tranne
  il manico della leva.
- `font-variation-settings` e `font-stretch` solo tramite variabili
  (`--imp-wdth`, `--imp-wght`) così la pressione le può pilotare.

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Piccolo store esterno (niente librerie), letto con `useSyncExternalStore` e un
selettore, così un componente si ri-renderizza solo quando cambia la fetta che
usa.

```ts
type Carta = 'citrino' | 'cotone' | 'cipria' | 'grafite';
type Tecnica = 'secco' | 'colore' | 'lamina';
type Prodotto = 'partecipazione' | 'biglietto' | 'intestata' | 'libro';

interface ImprontaState {
  carta: Carta;                       // persistita (localStorage 'impronta:carta')
  cartaWave: { x: number; y: number; from: Carta; to: Carta; t0: number } | null;
  prova: {
    prodotto: Prodotto;
    campi: Record<string, string>;    // chiavi definite in content/testi.ts per prodotto
    tecnica: Tecnica;
    taglioColorato: boolean;
    tiratura: number;
  };
  testoCliente: string | null;        // mostrato nell'hero dopo l'invio (sessionStorage 'impronta:testo')
  invio: 'idle' | 'holding' | 'sending' | 'sent' | 'error';
  gl: 'pending' | 'on' | 'off';
  reducedMotion: boolean;
}

// API
store.get(): ImprontaState
store.set(patch: Partial<ImprontaState> | ((s) => Partial<ImprontaState>)): void
store.subscribe(fn: () => void): () => void
useImpronta<T>(selector: (s: ImprontaState) => T, isEqual?: (a: T, b: T) => boolean): T
```

- Azioni nominate (in `store.ts`): `scegliCarta(carta, origine?: {x, y})`,
  `aggiornaProva(patch)`, `impostaInvio(stato)`, `confermaTestoCliente()`.
  Le sezioni chiamano le azioni, non `store.set` direttamente.
- La parola campione delle Tecniche = `testoCliente ?? primo campo della
  prova se modificato ?? "Pordenone"` (selettore `selParolaCampione` in
  `store.ts`).
- Lo store è un **singleton di modulo** ma viene **re-inizializzato** al mount
  di `Impronta.tsx` (lettura di `persist.ts`), così navigare via e tornare nel
  sito vero non lascia stati sporchi.

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, **mai** in React state, letto e scritto nel ticker:

```ts
runtime.scrollY            // da lenis, px
runtime.viewport           // { w, h, dpr }
runtime.pointer            // { x, y, active, tipo: 'mouse'|'touch'|'pen' }
runtime.light              // { azimuth, elevation, targetAzimuth, targetElevation, fonte: 'idle'|'pointer'|'touch'|'gyro' }
runtime.dirty              // flag: il GL deve ridisegnare
runtime.markDirty()        // chiunque cambi qualcosa di visibile nel GL
```

- La luce la scrive **solo** `interaction/light.ts` (i target) e il ticker (il
  lerp). Il WebGL la legge. In fallback CSS, `light.ts` scrive anche
  `--imp-luce-x` / `--imp-luce-y` su `.imp-root` al massimo a 30 Hz, così il
  `text-shadow` del fallback gira un poco con la luce (opzionale, decide
  l'interaction-designer con l'art-director).
- Con `reducedMotion`: azimut fisso 135°, elevazione 22°, niente arco, niente
  giroscopio, `light.ts` non registra listener.

---

## 7. Come la scena WebGL legge i blocchi DOM

### 7.1 Contratto: `relief/types.ts`

```ts
interface ReliefSpec {
  kind: 'text' | 'svg' | 'piece';     // piece = pezzo composto di "Per chi" o la prova del Banco
  text?: string;                      // per kind 'text'
  svg?: string;                       // markup SVG (dal vector-artist) per kind 'svg'
  layers?: ReliefLayer[];             // per 'piece': testi/svg posizionati in % del rettangolo
  tecnica: 'secco' | 'colore' | 'lamina';
  carta?: Carta;                      // se assente = carta globale; presente solo in Per chi e Banco
  profondita: number;                 // 0..1, massimo rilievo a pressione 1
  rotazione?: number;                 // gradi (Per chi: -2, 1.5, -0.5)
  tracking: 'doc' | 'live';           // vedi 7.2
  slot?: { maxW: number; maxH: number }; // riserva nell'atlante per testi che cambiano (Banco)
  priorita?: number;                  // ordine di culling se i visibili superano il massimo
}

interface ReliefBlock {
  id: string;
  el: HTMLElement;
  spec: ReliefSpec;
  rectDoc: DOMRect-like;              // coordinate documento (top include scrollY)
  rectView: { x, y, w, h };           // coordinate viewport CSS px, aggiornato ogni frame
  pressione: number;                  // 0..1, scritto da motion/usePressione
  versione: number;                   // incrementa quando la maschera va ridisegnata
  visibile: boolean;                  // da IntersectionObserver con margine di 1 viewport
}
```

### 7.2 Registro: `relief/registry.ts`

- `registry.register(el, spec) → id`, `unregister(id)`, `update(id, specPatch)`
  (incrementa `versione` se cambia testo/font/tecnica), `setPressione(id, v)`,
  `all()`, `visible()`, `subscribe(fn)` (per lo shader-engineer: aggiunte,
  rimozioni, cambi di versione).
- **Misura "doc" (default)**: `getBoundingClientRect()` + `scrollY` letti
  solo quando serve: al register, su `ResizeObserver` dell'elemento, su resize
  della finestra (debounce 150 ms), dopo `document.fonts.ready`, e quando una
  sezione dichiara un cambio di layout (`registry.invalidate()`). A ogni frame
  il ticker calcola `rectView = rectDoc - runtime.scrollY` **senza leggere il
  layout**: zero reflow durante lo scroll.
- **Misura "live"**: per i blocchi dentro contenitori `sticky`, trasformati o
  che scorrono in orizzontale (Tecniche fissata, mazzo swipe di Per chi, prova
  fissa del Banco su mobile). Per questi il ticker chiama
  `getBoundingClientRect()` nella fase lettura, **solo se visibili**.
  Massimo 4 blocchi live contemporaneamente.
- Le rotazioni CSS dei pezzi di "Per chi" non vanno lette dal DOMRect (che è
  il riquadro ruotato): il pezzo si misura sul suo elemento interno **non
  ruotato**, e la rotazione arriva allo shader da `spec.rotazione`.
- `IntersectionObserver` con `rootMargin: '100% 0px'` imposta `visibile`.
  Solo i visibili vanno allo shader (massimo **8** per frame, per priorità e
  distanza dal centro).

### 7.3 Il fantasma DOM: `relief/ReliefText.tsx`

Ogni testo a rilievo esiste nel DOM come elemento vero (`aria-hidden="true"`
se ripete un testo già leggibile, altrimenti testo normale) con classe
`imp-relief`:
- dà **il rettangolo** al registro;
- dà **lo stile** alla maschera: `maskPainter` legge `getComputedStyle`
  (famiglia, dimensione, `font-variation-settings`, `letter-spacing`,
  interlinea) e disegna esattamente quel testo, così DOM e rilievo coincidono
  al pixel;
- è **il fallback**: con `data-gl="pending|off"` il fantasma è visibile con il
  rilievo in `text-shadow` di `relief-fallback.css`; con `data-gl="on"`
  diventa `color: transparent; text-shadow: none` (resta per il layout e la
  selezione).

### 7.4 Maschere, atlante, frame

- **Maschera** (webgl-artist, `maskPainter.ts`): canvas 2D con R = altezza
  (forma netta), G = inchiostro, B = lamina. Scala di cottura
  `min(dpr, 1.5)`. Prima di disegnare: `await document.fonts.load()` sulle
  combinazioni usate.
- **Smusso**: la maschera va nello slot dell'atlante e un passaggio di blur
  separabile in 2-3 raggi crescenti (sommati) dà il profilo "a gradini" del
  piombo. Tutto su GPU, una tantum per versione.
- **Atlante** (shader-engineer, `atlas.ts`): `WebGLRenderTarget` 2048² (4096²
  se `MAX_TEXTURE_SIZE ≥ 4096` e puntatore fine), allocazione a scaffali.
  Slot fissi riservati (`spec.slot`) per il testo del Banco, che cambia a ogni
  tasto: si ridisegna solo quello slot, al massimo una volta per frame.
- **Frame** (shader-engineer, `blocks.ts`): uniform array
  `uRect[8]` (viewport px × dpr), `uAtlas[8]` (uv nell'atlante),
  `uParam[8]` (pressione, rotazione, tecnica, indice carta), più `uLight`,
  `uCarta[4]` (fondo, luce, ombra, inchiostro dalla carta attiva),
  `uWave` (centro, raggio, carta da, carta a), `uTime` (solo per l'arco della
  luce nell'hero). Il fragment shader cicla sugli 8 rettangoli. **1 draw call.**
- **Pressione e larghezza del font**: il DOM anima `--imp-wdth` 120→150; la
  maschera è cotta a 150 (stato finale) e lo shader la stringe in orizzontale
  (`mix(0.8, 1.0, pressione)`, ancoraggio a sinistra) durante la discesa. Si
  evita di ricuocere la maschera a ogni frame. Per non creare CLS, i titoli
  animati sono su una riga (`white-space: nowrap`) dentro un contenitore già
  dimensionato allo stato finale.

---

## 8. Budget di performance

Misurati da performance-auditor (ondata 4) sulla build standalone, Lighthouse
mobile (Moto G Power, 4G lento) e desktop.

| Voce | Budget |
|---|---|
| JS iniziale del concept (chunk `impronta`, senza react/react-dom/router) | ≤ **60 KB gz** |
| JS iniziale totale standalone (con react, react-dom, router, lenis) | ≤ **130 KB gz** |
| Chunk WebGL lazy (three + webgl/) | ≤ **160 KB gz** |
| CSS totale del concept | ≤ **20 KB gz** |
| SVG totali | ≤ **25 KB** (non gz) |
| Font (woff2, latin) | ≤ **180 KB** totali; Anybody variabile + Hanken 3 pesi |
| Immagini raster | **0** (nessuna foto, tutto generato) |
| LCP | ≤ **2,5 s** mobile, ≤ **1,5 s** desktop. Elemento LCP = testo dell'hero nel DOM, **mai** il canvas |
| CLS | ≤ **0,02** (canvas `position: fixed`, altezze riservate, font con fallback metrico) |
| INP | ≤ **150 ms** (digitazione nel Banco: la maschera si ridisegna in rAF, non nell'handler) |
| TBT | ≤ **150 ms** mobile |
| DPR del canvas | mobile ≤ **1,75**, desktop ≤ **1,5**, e comunque pixel totali ≤ **3,5 M** |
| Draw call per frame | **1** (più 2-4 solo nei frame in cui si cuoce una maschera) |
| Texture | atlante 2048² (16 MB GPU) + fibra 256² + 2 render target di blur alla dimensione slot |
| FPS | **60** desktop; **≥ 50** su mobile medio (iPhone 12, Pixel 6a); mai sotto 30 |
| Frame idle | **0** render quando niente si muove (render on demand) |

**Qualità adattiva** (`quality.ts`): media mobile del tempo frame su 30 frame;
sopra 20 ms si scende di 0,25 di DPR fino a 1,0; se resta sotto 24 fps per
3 s a DPR 1,0 si passa al fallback CSS (`data-gl="off"`), con una
dissolvenza di 300 ms, senza lampi.

L'arco automatico della luce nell'hero gira a **30 fps** (basta per un giro
ogni 40 s) e solo mentre l'hero è visibile e la scheda è attiva.

---

## 9. Strategia di caricamento

1. **HTML + CSS** (prima pittura): `.imp-root` con sfondo della carta
   (Citrino o quella salvata, letta in modo sincrono in `useState` iniziale
   con try/catch), testi in inchiostro, rilievi in CSS. Il sito è già completo
   e bello qui. `data-gl="pending"`.
2. **Font**: `preconnect` + `<link>` iniettato al mount. `display=swap`.
   L'art-director definisce in `tokens.css` un `@font-face` di fallback locale
   con `size-adjust`/`ascent-override` tarati per Anybody e Hanken, per
   togliere il salto al cambio font.
3. **Rilevamento** (`core/capabilities.ts`, subito al mount):
   - WebGL: `canvas.getContext('webgl2') ?? getContext('webgl')` con
     `failIfMajorPerformanceCaveat: true`; serve `highp` nel fragment shader.
     Il canvas di prova si scarta subito.
   - `prefers-reduced-motion` (con listener: se cambia, si aggiorna lo store).
   - `navigator.connection?.saveData` → niente WebGL.
   - Parametro `?gl=0` nell'URL → forza il fallback (per i test QA);
     `?gl=1` lo forza acceso anche con `saveData`.
4. **WebGL lazy** (`core/glLoader.ts`): se il WebGL è disponibile, dopo
   `fontsReady()` **e** `requestIdleCallback` (timeout 1200 ms; su Safari
   `setTimeout` 300 ms) si fa `import('../webgl')`. Il chunk non è mai nel
   percorso critico.
5. **Primo frame GL**: il canvas nasce con `opacity: 0`; quando il primo frame
   con tutte le maschere visibili è pronto, `store.gl = 'on'` → il canvas va a
   1 in 300 ms e contemporaneamente i fantasmi perdono il `text-shadow`. Nessun
   doppio rilievo, nessun salto.
6. **Apertura "la pressa scende"** (CD): parte sul rilievo CSS se il GL non è
   ancora pronto (la pressione pilota anche le ombre del fallback tramite
   `--imp-press`), e il GL la riprende dallo stesso valore. Nessun preloader.
7. **Reduced motion**: il WebGL si carica comunque (è materiale, non
   animazione) ma con luce ferma, pressione già a 1, niente arco; render solo
   su cambio carta e su digitazione. Lenis **non** si crea (scroll nativo).
8. **Pausa**: `visibilitychange` → ticker fermo. Perdita di contesto
   (`webglcontextlost`) → `data-gl="off"` subito; su `webglcontextrestored`
   si ricrea tutto e si ricuociono le maschere.
9. **Smontaggio** (navigazione nel sito vero): `Impronta.tsx` distrugge
   lenis, ferma il ticker, `ImprontaGL.dispose()` (geometrie, materiali,
   texture, render target, `renderer.forceContextLoss()`), rimuove listener e
   il `<link>` dei font solo se l'ha aggiunto lui.

### 9.1 Fallback senza WebGL

È lo stato `data-gl="off"` (e `pending`). Deve reggere da solo la giuria:
- fondo pieno della carta, rilievo con due `text-shadow` (luce in alto a
  sinistra, ombra in basso a destra, colori `--imp-carta-luce` /
  `--imp-carta-ombra`), grana leggerissima opzionale con un SVG `feTurbulence`
  inline **statico** (non animato) in `relief-fallback.css`;
- lamina: gradiente lineare a due grigi, fermo;
- pressione: `--imp-press` scala gli offset delle ombre (0 → piatto, 1 →
  pieno);
- onda della carta: `clip-path: circle()` sul nuovo colore (è DOM anche con
  GL acceso, quindi funziona uguale);
- Per chi, Tecniche, Banco: i pezzi sono DOM veri con i loro fondi carta in
  CSS e i testi in rilievo CSS; la tecnica "lamina" e "taglio colorato" hanno
  la loro resa CSS definita dall'art-director.

---

## 10. Analytics

`import { track } from '@/lib/analytics'`. Nello standalone è uno stub.
Eventi (nomi provvisori, da allineare al sito al porting):

| Evento | Quando | Proprietà |
|---|---|---|
| `concept_view` | mount | `{ concept: 10 }` |
| `concept_cta` | clic su "Prova la tua" | `{ concept: 10, dove: 'testata'|'hero'|'piede' }` |
| `concept_carta` | cambio carta | `{ concept: 10, carta, dove: 'carta'|'banco' }` |
| `concept_prova_invio` | leva completata | `{ concept: 10, prodotto, tecnica, tiratura }` (mai il testo scritto né il contatto) |
| `concept_gl` | esito caricamento WebGL | `{ concept: 10, stato: 'on'|'off', motivo? }` |

---

## 11. Comandi

Dalla cartella `concepts/10-torchio/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | installa le versioni esatte (c'è il lockfile) |
| `npm run dev` | `vite` su http://localhost:8080 (apre `/concept-10`; `/` fa redirect) |
| `npm run build` | `vite build` in `dist/` (deve restare verde) |
| `npm run preview` | serve `dist/` su http://localhost:4173 (per Lighthouse e Playwright) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` (stesso comando del sito) |
| `npm run lint` | `eslint src` |
| `npm run check` | `typecheck` + `lint` + `build` in fila: da lanciare prima di dire "fatto" |

Per le prove del fallback: `http://localhost:8080/concept-10?gl=0`.
Per l'errore di invio: `…/concept-10?invio=ko`.

`preview` deve servire l'SPA con fallback su `index.html` (default di Vite
preview), così `/concept-10` funziona anche ricaricando.

---

## 12. Checklist per chi scrive codice

- Segui `design-taste-frontend` e `full-output-enforcement`: niente file
  troncati, niente "resto del codice qui".
- Solo i tuoi file (§4). Tutto ciò che è condiviso passa da store, runtime,
  registry, token: non duplicare costanti.
- Nessun `requestAnimationFrame` fuori dal ticker; nessun `setInterval` per
  animare; nessun listener `scroll` diretto (si usa `runtime.scrollY` o
  `useScrollProgress`).
- Nessun colore hex fuori da `styles/tokens.*`.
- Nessun accesso al browser a livello di modulo (prerender del sito).
- `aria-hidden` su canvas e fantasmi che ripetono testo; contrasto AA del
  testo in inchiostro su tutte e 4 le carte.
- Prima di consegnare: `npm run check` verde.
