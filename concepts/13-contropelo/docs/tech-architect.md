# Tech architect · Concept 13 · CONTROPELO

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza esclusivi, stato condiviso, contratti tra moduli, budget,
caricamento, fallback e comandi.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`,
`docs/matrice-concept-11-20.md` (riga 13, paragrafo 13, verifica incrociata,
regole comuni), `concepts/13-contropelo/docs/creative-director.md` (tutto),
e come riferimento di formato/architettura il pilota:
`concepts/10-torchio/docs/tech-architect.md`, `scaffold-engineer.md`,
`src/components/ConceptBackButton.tsx`, `src/lib/analytics.ts`,
`core/ticker.ts`, `vite.config.ts`, `package.json`.

Verifiche fatte il 2026-09-26: registry npm raggiungibile, versioni sotto
controllate con `npm view`; Node 22.22. Font Google misurati (woff2 latin):
Figtree variabile 20,2 KB, Limelight 23,1 KB, Mansalva 69,5 KB.
`ConceptBackButton` misurato con Playwright (Chromium di `/opt/pw-browsers`,
font mono di ripiego): 198 × 35 px a (14, 14) su desktop; 194 × 33 px a
(12, bottom 14) a 375 px. Vedi §3.3: su mobile **cade dentro la mensola**.

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/13-contropelo/`, struttura identica al pilota: tutto il concept in
   `src/pages/concepts/contropelo/`, `src/pages/Concept13.tsx` sottile. Porting
   = copiare la cartella `contropelo/` e `Concept13.tsx`.
2. **Niente three, R3F, drei, lenis, GSAP.** Il concept è un solo schermo
   senza scroll e l'unica grafica è il vapore in **Canvas 2D** (CD §9). Le
   uniche dipendenze runtime sono react, react-dom, react-router-dom.
3. **Un solo ciclo rAF** (`core/ticker.ts`, copiato dal pilota senza lenis) con
   fasi `read → update → write → render`; il vapore disegna in `render`, e il
   ticker dorme quando il vetro è fermo.
4. **Tre canvas visibili (uno per specchio) a mezza risoluzione, uno solo
   "vivo" alla volta.** Differenza consapevole dal CD §9 (che diceva un canvas
   attivo + tre fuori schermo): i bordi degli specchi vicini devono mostrare il
   loro vapore (CD §3 variante A), e un canvas fermo che tiene l'ultimo frame
   costa zero. Solo lo specchio attivo aggiorna maschera e disegno; gli altri
   sono immagini ferme finché non tornano attivi (§7.3).
5. **Store lento con `useSyncExternalStore`** (specchio attivo, faccia, lista,
   scrittura, prenotazione, toggle) + **valori caldi fuori da React**
   (tratti del dito, maschere del vapore, viewport visivo).
6. **CSS in file `.css` per sezione, prefisso `ctp-`**, tutti i selettori sotto
   `.ctp-root`. Niente Tailwind, niente CSS modules, niente `backdrop-filter`.
7. **Foto pre-trattate a build-time dal photo-editor** (specchiate,
   desaturate, raffreddate, sfocate 1-2 px) e servite come `<img srcset>`; la
   velatura `#232A2C` è un livello CSS sopra (regolabile dall'art-director).
   Nessun `filter: blur()` a runtime sulle foto: su mobile durante il pan
   costerebbe un layer ridisegnato per frame.
8. **Icone Phosphor copiate come path SVG** (licenza MIT, annotata) dal
   vector-artist: nessun pacchetto `@phosphor-icons/*`, così il porting non
   aggiunge dipendenze.

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json` standalone)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` in `App.tsx` (standalone) |

### 1.2 Dev (identiche al pilota)

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

**Non installati di proposito**: `three`, `@types/three`, `@react-three/*`
(nessun WebGL: CD §9), `lenis` (non c'è scroll), `gsap` (i movimenti ammessi
sono otto, tutti gestibili con transizioni CSS + ticker, §2.2),
`@phosphor-icons/react` (§0.8), Tailwind, librerie di stato, `@fontsource`,
librerie di date (la data si calcola con `Intl`, §6.4).

### 1.3 Font

Google Fonts, `<link>` iniettato in `useEffect` (come i Concept 1-9) più
`preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`:

```
https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Limelight&family=Mansalva&display=swap
```

- L'URL vive in `styles/tokens.ts` (`FONT_CSS_URL`, art-director); lo inietta
  `core/fonts.ts` (scaffold). `FONT_DA_CARICARE` (stesso file) elenca le
  combinazioni da attendere con `document.fonts.load()`:
  `'400 28px Limelight'`, `'400 28px Mansalva'`, `'400 16px Figtree'`,
  `'600 16px Figtree'`.
- Il canvas **non disegna testo**: il vapore non dipende dai font. I font
  servono solo al DOM, quindi `display=swap` + metriche di ripiego.
- Metriche di ripiego (`@font-face` locale con `size-adjust`,
  `ascent-override`, `descent-override`) per Mansalva e Figtree in
  `tokens.css`, tarate dall'art-director: il listino e la lista sono in
  colonna con prezzi e orari allineati, un cambio di larghezza al caricamento
  sposterebbe tutto (CLS).
- Totale font ≈ 113 KB. Nessun corsivo, nessun peso in più.

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json` (`paths`).
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`, `jsx: react-jsx`,
  `moduleResolution: bundler`, `types: ["vite/client"]`.
- Target build `es2020`. `manualChunks`: `react` (react, react-dom,
  scheduler, router) separato dal chunk del concept, così il budget JS del
  concept si misura da solo.
- Dev server **9130**, preview **9131** (§11), sempre `strictPort`.

---

## 2. Scelte motivate

### 2.1 Canvas 2D e nient'altro

Il vapore è una maschera di opacità morbida su un colore piatto con una grana
statica: due `drawImage` per frame a mezza risoluzione. WebGL darebbe lo stesso
risultato con 150 KB in più, un contesto da perdere e un fallback da
mantenere. Canvas 2D c'è ovunque (anche nei Safari vecchi), e `destination-out`
/ `source-over` bastano per pulire e far tornare il vapore. Niente
`ctx.filter` (Safari < 18 non lo ha): la morbidezza viene dal pennello a
gradiente radiale e dalla mezza risoluzione scalata dal browser.

### 2.2 GSAP no, lenis no

Movimenti ammessi (CD §13, motion-designer): vapore che sale all'apertura,
passata automatica, vapore che torna, gocce, pan tra specchi, straccio sulla
lista, scrittura del nome, sottolineatura.

| Movimento | Come si fa |
|---|---|
| Vapore che sale, passata, ritorno, gocce | ticker → `vapore/` (canvas) |
| Pan tra specchi | `transform: translateX()` con transizione CSS (650 ms, easing del motion-designer); 200 ms di dissolvenza con reduced motion |
| Straccio sulla lista (400 ms + righe a 60 ms) | transizioni CSS con `transition-delay` per riga da variabile `--ctp-riga` scritta **una volta** al render |
| Scrittura del nome (maschera che avanza, 600 ms) | `clip-path: inset()` o `mask-position` in transizione CSS |
| Sottolineatura turchese (400 ms) | `stroke-dashoffset` SVG in transizione CSS |

Nessuno richiede timeline o ScrollTrigger. Non c'è scroll: lenis non serve.

### 2.3 Un solo ciclo rAF

`core/ticker.ts` è una copia del ticker del pilota **senza lenis** (niente
`lenis.raf`, niente `runtime.scrollY`). Ordine fisso:

1. **read**: solo se `runtime.misureSporche` (dopo un resize) il vapore rilegge
   il rettangolo dei vetri e delle zone protette; nessuna lettura di layout nei
   frame normali;
2. **update**: consumo dei tratti del dito (interpolati), ritorno del vapore,
   gocce, dissolvenze di modo, passata automatica;
3. **write**: variabili CSS sugli elementi foglia `data-ctpvar` (solo se il
   valore cambia; pochissimi casi: la riga di scrittura che segue
   `visualViewport`);
4. **render**: composizione del canvas dello specchio attivo, solo se sporco.

Nessun altro `requestAnimationFrame`, nessun `setInterval` per animare. Il
ticker si ferma quando nessuno chiede un frame (vapore tutto pieno o modo
"fermo", nessuna goccia, nessun gesto) e su `visibilitychange` → nascosto.

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo standalone, non si porta; **[P]** si porta. Tra
parentesi il proprietario (§4). Percorsi del concept relativi a
`src/pages/concepts/contropelo/`.

```
concepts/13-contropelo/
├─ DESIGN.md                                  [S*] (art-director)
├─ docs/                                      [S]  un .md per agent
├─ qa/                                        [S]  screenshot (git-ignorati)
├─ package.json  package-lock.json            [S]  (scaffold)
├─ vite.config.ts                             [S]  (scaffold)
├─ tsconfig.json  tsconfig.app.json  tsconfig.node.json  [S] (scaffold)
├─ eslint.config.js  .gitignore               [S]  (scaffold)
├─ index.html                                 [S]  (scaffold) lang="it", title/description dal copywriter, preconnect font, fondo #171C1D inline
├─ public/
│  └─ favicon.svg                             [S]  (vector-artist)
└─ src/
   ├─ main.tsx                                [S]  (scaffold)
   ├─ App.tsx                                 [S]  (scaffold) /concept-13 lazy; / e * → <Navigate to="/concept-13" replace/>
   ├─ vite-env.d.ts                           [S]  (scaffold)
   ├─ components/ConceptBackButton.tsx        [S]  (scaffold) copia fedele del pilota
   ├─ lib/analytics.ts                        [S]  (scaffold) copia fedele del pilota
   └─ pages/
      ├─ Concept13.tsx                        [P]  (scaffold) sottile
      └─ concepts/contropelo/                 [P]  TUTTO il concept
         ├─ index.ts                          (scaffold) export { default } from './Contropelo'
         ├─ Contropelo.tsx                    (scaffold) radice .ctp-root: griglia fascia/parete/mensola, font, ticker, store, attributi data-*
         │
         ├─ core/                             (scaffold)
         │  ├─ ticker.ts                      unico rAF (§2.3)
         │  ├─ capabilities.ts                prefersReducedMotion(), ascoltaReducedMotion(), isCoarsePointer(), canvas2DOk(), ascoltaMedia()
         │  ├─ fonts.ts                       injectFonts(), fontsReady()
         │  ├─ viewport.ts                    osservaViewport(): runtime.viewport + visualViewport + --ctp-vvh
         │  ├─ layout.ts                      soglie di layout (§5.4) e calcolo di data-facce / data-layout
         │  ├─ params.ts                      lettura dei parametri di prova nell'URL (§11.2)
         │  ├─ date.ts                        oggiISO(), giorniPrenotabili(), formattaGiorno() (§6.4)
         │  ├─ inert.ts                       impostaInert(el, bool) (React 18 non tipizza `inert`)
         │  └─ links.ts                       LAB_URL, CICERILAB_URL, MAPS_URL, TELEFONO_URL (da content/testi.ts)
         │
         ├─ state/                            (scaffold)
         │  ├─ store.ts                       store + useContropelo(selector) + azioni (§6.1)
         │  ├─ runtime.ts                     valori caldi (§6.2)
         │  └─ persist.ts                     localStorage con try/catch (§6.3)
         │
         ├─ vapore/                           (section-builder-vapore; stub dello scaffold)
         │  ├─ index.ts                       API pubblica `vapore` + export VaporeCanvas (contratto §7)
         │  ├─ motore.ts                      stato per specchio, maschera, ritorno, composizione
         │  ├─ grana.ts                       texture di rumore statica, generata una volta
         │  ├─ gocce.ts                       gocce (max 2, 1 ogni 1,5 s)
         │  ├─ VaporeCanvas.tsx               <canvas aria-hidden> di uno specchio
         │  └─ useZonaPulita.ts               hook per le sezioni: tiene pulita una zona DOM
         │
         ├─ motion/                           (motion-designer)
         │  ├─ easing.ts                      curve custom (funzioni + stringhe cubic-bezier)
         │  ├─ tempi.ts                       tutte le durate e soglie (pan, straccio, riga, scrittura, sottolineatura, vapore)
         │  ├─ motion.css                     --ctp-ease-*, --ctp-dur-* su .ctp-root; varianti [data-motion="reduced"]
         │  ├─ apertura.ts                    avviaApertura(): vapore che sale + passata automatica, via API vapore
         │  └─ useStraccio.ts                 fasi del "ripassa lo straccio" (via → riscrivi) per lista e facce mobile
         │
         ├─ interaction/                      (interaction-designer)
         │  ├─ pulire.ts                      collegaPulitura(el, indice): puntatore/dito → vapore.pulisci (§7.2)
         │  ├─ fuocoPulisce.ts                focusin sul vetro → vapore.proteggi ovale attorno all'elemento
         │  ├─ useFrecceTablist.ts            frecce ←/→, Home/Fine sui tre barbieri
         │  ├─ useSwipeMensola.ts             swipe orizzontale sulla mensola → specchio vicino
         │  ├─ useRigheLibere.ts              frecce ↑/↓ tra i posti liberi, Invio apre, Esc chiude e rende il fuoco
         │  └─ interaction.css                :hover, :focus-visible (turchese 2 px + 2 px), :active, stati delle parole toccabili
         │
         ├─ content/                          (copywriter)
         │  ├─ testi.ts                       tutti i testi visibili, aria-label, microcopy di tutti gli stati, meta
         │  ├─ listino.ts                     voci e prezzi di esempio (dati)
         │  ├─ orari.ts                       orari settimanali strutturati (generano la lista, §6.4)
         │  └─ nomi.ts                        nomi di esempio dei clienti ("Luca B.") per la lista
         │
         ├─ styles/
         │  ├─ tokens.css                     (art-director) variabili --ctp-* su .ctp-root, @font-face di ripiego
         │  ├─ tokens.ts                      (art-director) COLORI (hex + rgb per il canvas), VAPORE (opacità alto/basso), FONT_CSS_URL, FONT_DA_CARICARE
         │  ├─ materia.css                    (art-director) bisello, velatura del riflesso, resa del pennarello, rotazioni delle scritte, alone fermo
         │  ├─ base.css                       (scaffold) reset scoped, .ctp-sr, focus di base
         │  └─ layout.css                     (scaffold) griglia 100dvh, geometria parete/specchi (variabili), data-layout="scorre"
         │
         ├─ assets/
         │  ├─ foto/                          (photo-editor) specchio-{1,2,3}-{800,1600}.webp + index.ts
         │  └─ svg/                           (vector-artist) icone.ts, tratti.ts, Icona.tsx
         │
         └─ sections/
            ├─ Fascia/        Fascia.tsx  fascia.css                               (section-builder-fascia)
            ├─ Parete/        Parete.tsx  Specchio.tsx  Riflesso.tsx  parete.css  (section-builder-parete)
            ├─ Vetro/         Vetro.tsx  VetroListino.tsx  VetroBarba.tsx
            │                 VetroDove.tsx  vetro.css                             (section-builder-vetro)
            ├─ Lista/         Lista.tsx  RigaScrittura.tsx  agenda.ts
            │                 invio.ts  lista.css                                  (section-builder-lista)
            ├─ Mensola/       Mensola.tsx  mensola.css                             (section-builder-mensola)
            └─ Informazioni/  Informazioni.tsx  informazioni.css                   (section-builder-informazioni)
```

### 3.1 Sezioni da costruire (una per section-builder)

Nomi presi dal creative-director (§5). Se l'ux-architect le chiama in modo
diverso nella sua sezione "Sezioni da costruire", l'orchestratore usa la
tabella di corrispondenza sotto: **i nomi delle cartelle restano questi**
(stabili per i proprietari), cambiano solo testi e id.

| Section-builder | Cartella | Cosa c'è (CD) | Probabile nome ux |
|---|---|---|---|
| `fascia` | `sections/Fascia` | fascia alta della parete: insegna "Contropelo" in Limelight + "barberia, Pordenone"; zona del ConceptBackButton lasciata libera | fascia / insegna |
| `parete` | `sections/Parete` | la parete con i tre specchi, pan orizzontale, bordi dei vicini toccabili, `tabpanel`, riflesso (foto), bisello, due facce su mobile, montaggio di Vetro/Lista/VaporeCanvas dentro ogni specchio | parete / specchi |
| `vetro` | `sections/Vetro` | le scritte a pennarello "normali" dei tre specchi: listino (1), la barba (2), dove e quando (3) con link Maps e telefono; riga sul barbiere; "la lista →" su mobile | vetro / listino / barba / dove-quando |
| `lista` | `sections/Lista` | "La lista sullo specchio": giorno, mezz'ore, trattini liberi, riga di scrittura, tutti gli stati, invio simulato, persistenza, mattina/pomeriggio su mobile | lista / prenotazione |
| `mensola` | `sections/Mensola` | tre barbieri (`tablist`), "Specchio pulito", "Scrivi il tuo nome", suggerimento del primo gesto, messaggio di conferma, link "Informazioni" | mensola |
| `informazioni` | `sections/Informazioni` | pannello a pennarello sul vetro attivo: "Un concept di CiceriLab", attività inventata, crediti foto, chiusura con Esc | informazioni / piede |
| `vapore` | `vapore/` | il motore del vapore (canvas, maschere, ritorno, gocce, zone protette, modi) | (interazione firma) |

Sono **7**, nell'intervallo 5-9 richiesto.

### 3.2 Regole di porting (valgono già ora)

- Dentro `contropelo/` nessun import fuori da `contropelo/` tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` e i pacchetti npm.
- **Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `navigator`, `Intl` con data corrente a livello di modulo**: solo dentro
  effetti, handler o funzioni chiamate da effetti (il sito fa prerender).
  In particolare la data di oggi si calcola **al montaggio** (CD §7.1).
- Foto e SVG si importano da `assets/` con gli import nativi di Vite
  (`import url from './x.webp'`, `?raw`), mai da `public/`.
- `Concept13.tsx`: `import Contropelo from './concepts/contropelo'; export
  default function Concept13() { return <Contropelo /> }`.
- Allo smontaggio `Contropelo.tsx` ferma il ticker, stacca i listener, rimuove
  il `<link>` dei font solo se l'ha aggiunto lui, ripristina `document.title`
  e l'`overflow` di `html`/`body` se l'ha toccato (§5.4).

### 3.3 Il ConceptBackButton e la mensola (vincolo misurato)

Il bottone del sito è `position: fixed` e non si sposta. Zone da lasciare
**senza nessun controllo del concept** (misure con margine sopra quelle
misurate):

| Larghezza | Zona riservata | Conseguenza |
|---|---|---|
| > 640 px | in alto a sinistra, x 0-228 px, y 0-58 px | sta dentro la fascia alta (56 px): l'insegna va a destra (CD §5.1). La fascia deve essere alta **almeno 58 px** o il bottone sborda di 1-2 px sul bordo dello specchio: propongo 60 px (richiesta a ux/art-director). |
| ≤ 640 px | in basso a sinistra, x 0-220 px, da `bottom: 0` a `bottom: 60px + env(safe-area-inset-bottom)` | **cade dentro la mensola** (84 px). Il CD (§10) prevedeva 56 px liberi a sinistra: non bastano, il bottone è largo ~195 px. |

Soluzione tecnica proposta (decide l'ux-architect il disegno): su ≤ 640 px la
mensola ha **due file**: in alto (44 px) i tre barbieri a tutta larghezza; in
basso (60 px + safe area) a sinistra lo spazio del bottone del sito, a destra
"Scrivi il tuo nome" (≥ 44 px di altezza) con l'interruttore "Specchio
pulito" come icona 44 × 44 con `aria-label`. Mensola totale ≈ 104 px +
safe area; lo specchio a 375 × 667 resta ≈ 503 px. Lo scaffold espone la zona
come variabili in `layout.css`: `--ctp-zona-back-w`, `--ctp-zona-back-h`.

---

## 4. File di competenza esclusiva

Ogni file ha **un solo proprietario**. Tutti possono leggere e importare tutto.
Chi ha bisogno di cambiare un file altrui lo scrive nel proprio doc, sezione
"Richieste ad altri agent"; l'orchestratore la gira.

**Stub**: lo scaffold crea gli stub (sezioni che rendono il loro elemento
vuoto, `vapore/index.ts` con l'API completa che non fa nulla,
`VaporeCanvas` che rende `null`) perché il build sia verde dal primo minuto;
alla fine dello scaffold la proprietà passa al proprietario sotto e lo
scaffold non li tocca più.

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md`, `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts`, `styles/materia.css` | CSS delle sezioni, `base.css`, `layout.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/tempi.ts`, `motion/motion.css`, `motion/apertura.ts`, `motion/useStraccio.ts` | ticker (usa l'API), il motore del vapore (usa l'API §7), CSS delle sezioni |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*` (file di §3) | niente cursore custom, niente preloader, niente lente (CD §12) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/listino.ts`, `content/orari.ts`, `content/nomi.ts` | nessun testo nei componenti |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/icone.ts`, `assets/svg/tratti.ts`, `assets/svg/Icona.tsx`, `public/favicon.svg` | niente forbici, rasoi, pali, baffi, pettini, figure (CD §4.3, §12) |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*` (webp + `index.ts`) | nessun trattamento a runtime |
| webgl-artist | **non previsto** (niente WebGL) | |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file [S] di §3 tranne `DESIGN.md`, `docs/*` altrui, `public/favicon.svg`; `src/pages/Concept13.tsx`; `contropelo/index.ts`, `contropelo/Contropelo.tsx`; `core/*`; `state/*`; `styles/base.css`, `styles/layout.css`; stub di `sections/*/*` e di `vapore/*` (poi passano) |
| **section-builder-fascia** | `sections/Fascia/Fascia.tsx`, `fascia.css`, `docs/section-builder-fascia.md` |
| **section-builder-parete** | `sections/Parete/Parete.tsx`, `Specchio.tsx`, `Riflesso.tsx`, `parete.css`, `docs/section-builder-parete.md` |
| **section-builder-vetro** | `sections/Vetro/Vetro.tsx`, `VetroListino.tsx`, `VetroBarba.tsx`, `VetroDove.tsx`, `vetro.css`, `docs/section-builder-vetro.md` |
| **section-builder-lista** | `sections/Lista/Lista.tsx`, `RigaScrittura.tsx`, `agenda.ts`, `invio.ts`, `lista.css`, `docs/section-builder-lista.md` |
| **section-builder-mensola** | `sections/Mensola/Mensola.tsx`, `mensola.css`, `docs/section-builder-mensola.md` |
| **section-builder-informazioni** | `sections/Informazioni/Informazioni.tsx`, `informazioni.css`, `docs/section-builder-informazioni.md` |
| **section-builder-vapore** (al posto dello shader-engineer) | `vapore/index.ts`, `motore.ts`, `grana.ts`, `gocce.ts`, `VaporeCanvas.tsx`, `useZonaPulita.ts`, `docs/section-builder-vapore.md` |

Note:
- `invio.ts` è un **invio simulato** (nessuna rete): risolve dopo ~900 ms;
  con `?invio=ko` fallisce; con `?preso=1` il primo tentativo risponde "posto
  preso" (CD §7.3). Senza parametri il "preso" capita raramente e in modo
  deterministico (hash della riga), mai due volte di fila.
- `agenda.ts` è **puro** (niente DOM, niente `Date.now()`): riceve la data ISO
  dal chiamante. È importato anche dalla mensola (`trovaPrimoLibero`, per
  "Oggi siamo pieni…") e dalla parete (nessun altro uso).
- La composizione è fissa: `Contropelo.tsx` rende `<Fascia/>`, `<Parete/>`,
  `<Mensola/>`, `<Informazioni/>`; `Parete` rende tre `<Specchio indice/>`, e
  ogni `Specchio` rende `<Riflesso/>`, `<Vetro indice/>`, `<Lista indice/>`,
  `<VaporeCanvas indice/>`. Firme: `Vetro({ indice }: { indice: IndiceSpecchio })`,
  `Lista({ indice })`, `VaporeCanvas({ indice })`; `Fascia`, `Parete`,
  `Mensola`, `Informazioni` senza prop. Default export per tutti.
- Il copywriter scrive i testi come dati tipizzati `as const`; i builder non
  inventano testo. Se manca una stringa, la chiedono.

---

## 5. Convenzioni

### 5.1 CSS

- Un file `.css` per sezione, importato dal componente. Nessun CSS module.
- Prefisso **`ctp-`**, BEM leggero: `ctp-<sezione>__<elemento>--<variante>`
  (`ctp-lista__riga--libera`, `ctp-mensola__barbiere`). Classi condivise
  dello scaffold: `ctp-root`, `ctp-sr` (solo lettori di schermo),
  `ctp-pennarello` (dell'art-director in `materia.css`: famiglia e resa del
  testo sul vetro).
- **Ogni selettore comincia con `.ctp-root`**. Niente `html`, `body`, `:root`,
  `*` nudi. Lo sfondo della parete è su `.ctp-root`.
- Variabili `--ctp-*` solo in `tokens.css` (art-director) e `motion.css`
  (motion-designer); variabili locali di sezione `--ctp-<sezione>-*`.
  **Nessun hex fuori da `styles/tokens.*`**; il canvas legge i colori da
  `tokens.ts` (`COLORI.vapore`, in rgb).
- Attributi di stato su `.ctp-root`, scritti **solo** da `Contropelo.tsx`
  (dallo store):
  `data-specchio="0|1|2"`, `data-motion="full|reduced"`,
  `data-canvas="pending|on|off"`, `data-vapore="vivo|fermo"`,
  `data-facce="affiancate|alternate"`, `data-layout="fisso|scorre"`,
  `data-scrittura="chiusa|aperta"`.
- **Z-index** (token): riflesso 0, pennarello 1, vapore (canvas) 2, riga di
  scrittura e pannello Informazioni 3, fascia e mensola 4. Nient'altro. Il
  bottone del sito sta sopra tutto da solo.
- Il canvas ha `pointer-events: none`: i gesti si ascoltano sul contenitore
  del vetro, così bottoni e link sotto il vapore restano cliccabili.
- Unità: `rem` per il testo, `clamp()` per il fluido, `dvh`/`svh` per le
  altezze (mai `100vh` nudo). Raggio 0 ovunque. Nessuna ombra portata.
- Niente `backdrop-filter`, niente `filter: blur()` su foto o grandi aree,
  niente `will-change` permanente (solo sulla traccia della parete durante il
  pan, messo e tolto dal builder della parete).

### 5.2 TypeScript e React

- Tipi condivisi in `state/store.ts` (`IndiceSpecchio = 0 | 1 | 2`,
  `Servizio`, `Slot`, `Prenotazione`, …) e in `vapore/index.ts` (contratto §7).
- Le sezioni chiamano **azioni** dello store, mai `store.set` diretto.
- `inert`: React 18 non lo tipizza; si usa `impostaInert(el, bool)` di
  `core/inert.ts` in un effetto (specchi non attivi, faccia nascosta su
  mobile, contenuto sotto il pannello Informazioni).
- Id DOM stabili: tab `ctp-tab-<i>`, pannello `ctp-specchio-<i>`, lista
  `ctp-lista-<i>`, riga `ctp-riga-<i>-<hhmm>`, annuncio `ctp-annuncio`.

### 5.3 Accessibilità strutturale (dal CD §11, contratto tecnico)

- Ordine DOM = ordine di lettura: fascia (insegna, `h1`), parete (specchio
  attivo: vetro, lista), mensola. Il canvas è `aria-hidden="true"`.
- Barbieri: `role="tablist"` nella mensola; ogni specchio è
  `role="tabpanel"` con `aria-labelledby` sul suo tab. Gli specchi non attivi
  sono `inert` (i bordi visibili restano toccabili come **bottoni fuori dal
  tabpanel**, `aria-hidden`, perché lo stesso comando c'è già nel tablist).
- Una sola regione `aria-live="polite"` (`#ctp-annuncio`, dello scaffold in
  `Contropelo.tsx`), alimentata da `store.annuncia(testo)`: cambio barbiere,
  cambio giorno, esito della prenotazione. Gli errori dei campi hanno il loro
  `aria-describedby` nella riga di scrittura.
- Fuoco visibile turchese 2 px + 2 px di stacco (`interaction.css`); il vapore
  non copre mai l'elemento col fuoco (§7.4).

### 5.4 Layout: fisso, scorrevole, facce

`core/layout.ts` calcola due attributi da viewport e zoom (su resize, con
`ascoltaMedia`):

| Attributo | Regola | Effetto |
|---|---|---|
| `data-facce="alternate"` | larghezza < **900 px** CSS | una faccia per volta (vetro o lista, CD §10); sopra: affiancate |
| `data-layout="scorre"` | altezza < **520 px** CSS (telefono in orizzontale, zoom 200-400%) | la pagina **scorre** (niente `100dvh`), specchi impilati uno sotto l'altro, facce affiancate in colonna, vapore in modo `fermo` (§7.1), niente `touch-action: none` sul vetro |

Il secondo caso è obbligatorio per WCAG 1.4.10 (zoom 400% = 320 × 256 CSS px
su un 1280 × 1024): un layout a schermo fisso senza scroll lì taglierebbe il
contenuto. Le soglie sono costanti in `core/layout.ts` (`SOGLIA_FACCE`,
`SOGLIA_SCORRE`); l'ux-architect e l'art-director le possono far cambiare con
una richiesta allo scaffold.

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno senza librerie, letto con `useSyncExternalStore` e selettore
(`useContropelo(selector, isEqual?)`). Singleton di modulo **re-inizializzato
al mount** di `Contropelo.tsx` (legge `persist.ts` e i parametri URL).

```ts
export type IndiceSpecchio = 0 | 1 | 2;
export type Servizio = 'taglio' | 'barba' | 'taglio-barba' | 'rasatura'; // chiavi; le etichette sono del copywriter
export type Faccia = 'vetro' | 'lista';
export type MetaGiornata = 'mattina' | 'pomeriggio';

export interface Slot { specchio: IndiceSpecchio; giorno: string /* YYYY-MM-DD */; ora: string /* 'HH:MM' */ }

export interface Prenotazione extends Slot {
  servizio: Servizio;
  nome: string;            // salvato solo in localStorage del visitatore
  creata: number;          // ms, per scartare le prenotazioni passate
}

export interface Scrittura extends Slot {
  servizio: Servizio | null;
  nome: string;
  telefono: string;
  errori: Partial<Record<'nome' | 'telefono' | 'servizio' | 'preso', string>>; // chiavi di messaggi del copywriter
  stato: 'aperta' | 'invio' | 'errore-invio';
}

export interface ContropeloState {
  pronto: boolean;                         // false nel prerender e prima del mount
  oggi: string | null;                     // YYYY-MM-DD, calcolato al mount (Europe/Rome)
  specchio: IndiceSpecchio;                // attivo
  giornoPerSpecchio: [number, number, number]; // indice nei giorni prenotabili (0 = oggi o primo aperto)
  faccia: Faccia;                          // conta solo con data-facce="alternate"
  meta: MetaGiornata;                      // mattina/pomeriggio su mobile
  scrittura: Scrittura | null;
  prenotazione: Prenotazione | null;       // persistita
  pulito: boolean;                         // toggle "Specchio pulito", persistito
  info: boolean;                           // pannello Informazioni aperto
  primoGesto: boolean;                     // il suggerimento sparisce quando true
  richiestaFuoco: { tipo: 'primo-libero' | 'slot' | 'trattino'; slot?: Slot; id: number } | null;
  annuncio: string;                        // testo della regione live
  motion: 'full' | 'reduced';
  canvas: 'pending' | 'on' | 'off';
  facce: 'affiancate' | 'alternate';
  layout: 'fisso' | 'scorre';
}
```

Azioni (unico modo per cambiare lo stato):

| Azione | Chi la chiama | Effetto |
|---|---|---|
| `inizializza({ oggi, motion, pulito, prenotazione, parametri })` | `Contropelo.tsx` | stato di partenza al mount |
| `vaiASpecchio(i, origine: 'tab'\|'bordo'\|'swipe'\|'tastiera'\|'link')` | mensola, parete, interaction, lista, mensola ("pieni → Denis domani") | cambia specchio, `vapore.attiva(i)`, annuncio |
| `mostraFaccia(f)` | vetro ("la lista →"), mensola, lista | faccia su mobile |
| `cambiaGiorno(i, delta)` | lista | giorno dello specchio `i` (limitato a 0..5) |
| `scegliMeta(m)` | lista | mattina/pomeriggio |
| `scriviIlTuoNome()` | mensola | specchio attivo → faccia lista → `richiestaFuoco` primo libero (o annuncio "pieni" con proposta) |
| `apriScrittura(slot)` / `chiudiScrittura()` | lista | apre/chiude la riga; chiusa → `richiestaFuoco` sul trattino |
| `aggiornaScrittura(patch)` | lista | campi, servizio, errori, stato |
| `confermaPrenotazione(p)` | lista (dopo `invio.ts`) | salva, persiste, annuncio, `track('demo_prenotazione', …)` |
| `cancellaPrenotazione()` | lista | toglie e ridà il trattino |
| `impostaPulito(bool)` | mensola | persiste; `vapore.impostaModo('fermo'\|'vivo', …)` |
| `apriInfo()` / `chiudiInfo()` | mensola / informazioni | pannello |
| `segnaPrimoGesto()` | vapore (`onPrimoGesto`) | nasconde il suggerimento |
| `consumaRichiestaFuoco(id)` | lista | la richiesta è servita |
| `annuncia(testo)` | tutte le sezioni | regione live |

`track('demo_prenotazione', { concept: 13, specchio, servizio, giorno: offset })`
solo dentro `confermaPrenotazione`: mai nome né telefono.

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, mai in React state:

```ts
runtime.viewport         // { w, h, dpr, vvH, vvTop, tastiera: boolean } da core/viewport.ts
runtime.misureSporche    // true dopo resize/fonts: il vapore rilegge i rettangoli in fase 'read'
runtime.reset()          // Contropelo.tsx al mount
```

Le maschere, i tratti in coda, le gocce e le zone protette sono **dentro
`vapore/motore.ts`**, non in `runtime`: solo il vapore li legge e li scrive.
`core/viewport.ts` scrive anche `--ctp-vvh` e `--ctp-vvtop` su `.ctp-root`
(solo se cambiano), per la riga di scrittura sopra la tastiera (CD §7.2.3).

### 6.3 Persistenza: `state/persist.ts`

Tutte le letture/scritture in `try/catch`; se falliscono vale la sessione.

| Chiave | Valore | Note |
|---|---|---|
| `contropelo:pulito` | `'1'` / `'0'` | con reduced motion e nessun valore salvato: pulito |
| `contropelo:prenotazione` | JSON `Prenotazione` | scartata se il giorno è passato o il JSON non valida |

### 6.4 Date, orari, lista del giorno

- `core/date.ts` (scaffold): `oggiISO()` con
  `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' })` (restituisce
  `YYYY-MM-DD`), `giorniPrenotabili(oggi, orari, n = 6)` (salta i giorni
  chiusi di `content/orari.ts`), `formattaGiorno(iso)` → "martedì 29"
  (`it-IT`), `aggiungiGiorni(iso, n)`. Tutte pure tranne `oggiISO()`, chiamata
  solo nell'effetto di mount. Con `?oggi=YYYY-MM-DD` si forza la data (QA:
  lunedì chiuso, giorno pieno).
- `content/orari.ts` (copywriter), forma:
  ```ts
  export const ORARI = {
    passo: 30,                                   // minuti
    settimana: {                                 // 0 = domenica … 6 = sabato
      0: null, 1: null,
      2: [['08:30', '12:30'], ['14:30', '19:00']], /* … */
      6: [['08:00', '17:00']],
    },
    pausa: { etichetta: /* chiave testo */ },
  } as const;
  ```
  È la fonte unica: il vetro 3 ("Dove e quando") e l'agenda lo leggono.
- `sections/Lista/agenda.ts` (builder lista): `generaGiornata(giorno, indice,
  orari, nomi): Riga[]` deterministica (PRNG mulberry32 con seme dall'hash di
  `giorno|indice`), 55-65% di occupati; `unisciPrenotazione(righe, p)`;
  `trovaPrimoLibero(daGiorno, servizio?, orari, nomi)` su tutti e tre gli
  specchi (per "Oggi siamo pieni…" e per "Scrivi il tuo nome").
  Il sabato 8-17 senza pausa: la regola della pausa è nei dati, non nel codice.

---

## 7. Il vapore: contratto (`vapore/index.ts`)

### 7.1 API

```ts
import type { IndiceSpecchio } from '../state/store';

export type ModoVapore = 'vivo' | 'fermo' | 'spento';
// vivo   = vapore normale: si pulisce, torna, gocce
// fermo  = vetro pulito + alone statico sui bordi (toggle "Specchio pulito", reduced motion, data-layout="scorre")
// spento = nessun canvas (errore o ?canvas=0): data-canvas="off"

export interface PuntoTratto { x: number; y: number; r: number; t: number } // px CSS relativi al vetro, raggio px CSS, ms

export interface OpzioniZona {
  forma?: 'ovale' | 'rettangolo';  // default 'ovale'
  margine?: number;                // px CSS attorno al rettangolo, default 16
  dissolvenza?: number;            // ms per pulire la zona, default 300
  alone?: boolean;                 // il vapore "passa dietro" come alone (nome dopo la prenotazione)
}

export interface Vapore {
  registra(i: IndiceSpecchio, canvas: HTMLCanvasElement, vetro: HTMLElement): () => void; // solo VaporeCanvas
  attiva(i: IndiceSpecchio): void;                // specchio attivo; applica il tempo trascorso in 600 ms
  pulisci(i: IndiceSpecchio, punti: readonly PuntoTratto[]): void;  // interaction/pulire.ts
  proteggi(i: IndiceSpecchio, el: HTMLElement, opz?: OpzioniZona): () => void; // zona sempre pulita finché non si toglie
  alza(i: IndiceSpecchio, durata: number): void;  // apertura: il vapore sale dal basso (motion/apertura.ts)
  passata(i: IndiceSpecchio, da: { x: number; y: number }, a: { x: number; y: number }, raggio: number, durata: number): void; // coordinate 0..1 del vetro
  impostaModo(m: ModoVapore, durata: number): void;
  onPrimoGesto(fn: () => void): () => void;       // primo tratto dell'utente (non le passate automatiche)
}
export const vapore: Vapore;
export { default as VaporeCanvas } from './VaporeCanvas';
export { useZonaPulita } from './useZonaPulita';  // useZonaPulita(ref, indice, attiva: boolean, opz?)
```

### 7.2 Chi chiama cosa

| Chiamante | Chiamata |
|---|---|
| `VaporeCanvas` (vapore) | `registra` al mount; se `getContext('2d')` fallisce → `store` `canvas: 'off'` |
| `Contropelo.tsx` (scaffold) | `impostaModo` all'avvio (da `pulito`, `motion`, `layout`, `canvas`) e quando cambiano |
| `store.vaiASpecchio` (scaffold) | `attiva(i)` |
| `interaction/pulire.ts` | `pulisci(i, punti)`: raccoglie `getCoalescedEvents()`, interpola, calcola il raggio (34/60 px mouse, 30/44 px dito o `PointerEvent.width`); **nessun disegno nell'handler** |
| `interaction/fuocoPulisce.ts` | `proteggi(i, el)` su `focusin`, rilascio su `focusout` |
| `motion/apertura.ts` | `alza`, `passata` (solo con `motion: 'full'` e modo `vivo`) |
| Lista | `useZonaPulita(refLista, i, scritturaAperta)`; `useZonaPulita(refTuoNome, i, true, { alone: true })` |
| Mensola | `onPrimoGesto` → `segnaPrimoGesto()` |

### 7.3 Implementazione (vincoli per il section-builder-vapore)

- Per specchio: **maschera** (canvas fuori schermo, alfa = quanto è pulito) e
  **canvas visibile**. Risoluzione interna 0,5 × CSS, DPR ignorato, massimo
  1280 × 800 px interni.
- Una sola volta per resize: **strato vapore** (colore `COLORI.vapore` +
  gradiente di densità 0,78 in alto → 0,9 in basso da `tokens.ts` + grana
  statica di `grana.ts`, rumore a bassa frequenza 256² ripetuto).
- Pulire: sulla maschera, pennello a gradiente radiale con `source-over`
  (bianco con alfa) lungo i punti interpolati.
- Tornare: sulla maschera, `destination-out` di un riempimento con la
  **texture di rumore statica** come pattern e `globalAlpha` = `dt /
  tempi.ritornoVapore` pesato: le chiazze tornano prima, poi tutto uniforme
  (CD §6.2). Mai oscillazioni: in ogni punto l'alfa del vapore è monotona.
- Comporre (fase `render`, solo se sporco): `drawImage(strato)` →
  `destination-out` `drawImage(maschera)` → zone protette (ovali cancellati,
  con alone se richiesto). Due-tre `drawImage` a mezza risoluzione:
  **≤ 2 ms per frame** su mobile medio.
- Il ticker gira per lo specchio attivo solo se: c'è un tratto in coda, la
  maschera non è ancora tornata piena, c'è una goccia, una dissolvenza o una
  passata in corso. Vetro tutto appannato e fermo → `false` → il ticker dorme.
- Specchi non attivi: nessun lavoro. Il loro canvas mostra l'ultimo frame. Si
  salva l'istante in cui hanno smesso di essere attivi; su `attiva(i)` il
  tempo trascorso si applica come ritorno accelerato in 600 ms (mai uno
  scatto).
- Gocce (`gocce.ts`): massimo 2, una ogni ≥ 1,5 s, 30-40 px/s, si fermano dopo
  60-140 px; solo in modo `vivo` e `motion: 'full'`.
- Resize: la maschera si ridimensiona con `drawImage` scalato (si conserva ciò
  che era pulito), lo strato si rigenera; debounce 150 ms.
- Modo `fermo`: maschera piena di "pulito" in `durata` ms (900, 200 con
  reduced motion), poi un solo disegno dell'alone ai bordi, ticker fermo.
- Nessun accesso al browser a livello di modulo; tutto nasce in `registra`.

### 7.4 Cosa il vapore non copre mai (implementato con `proteggi`)

La lista mentre stai scrivendo, il tuo nome dopo la prenotazione (con alone),
l'elemento col fuoco da tastiera, il pannello Informazioni (che sta sopra, z 3).

---

## 8. Budget di performance

Misurati dal performance-auditor sulla build standalone (Lighthouse mobile e
desktop).

| Voce | Budget |
|---|---|
| JS del concept (chunk `contropelo`, senza react/react-dom/router) | ≤ **60 KB gz** (atteso 20-30) |
| JS iniziale totale standalone | ≤ **115 KB gz** |
| CSS totale del concept | ≤ **24 KB gz** |
| WebGL | **nessuno** (voce del budget 160 KB non usata) |
| Foto | 3 foto × 2 misure webp: 1600 px ≤ **140 KB** l'una, 800 px ≤ **60 KB** l'una; al primo caricamento su mobile ≤ 180 KB di foto |
| SVG (icone + tratti + favicon) | ≤ **12 KB** non gz |
| Font | ≈ 113 KB (Figtree var + Limelight + Mansalva latin), tetto **130 KB** |
| LCP | ≤ **2,5 s** mobile, ≤ 1,5 s desktop. Candidato LCP = foto del primo specchio o il listino in DOM: **mai** il canvas |
| CLS | ≤ **0,02** (griglia a altezze fisse, metriche di ripiego dei font, lista con altezza riservata prima del mount, foto con `width`/`height`) |
| INP | ≤ **150 ms** (pointermove accoda punti e basta; digitazione nei campi senza lavoro pesante; cambio specchio = una classe/transform) |
| TBT | ≤ 150 ms mobile |
| Canvas | 0,5 × CSS, ≤ 1280 × 800 px interni per canvas; ≤ 2 ms/frame di render su mobile medio |
| FPS | 60 desktop, ≥ 50 mobile medio durante il gesto e il pan; **0 frame** a vetro fermo |

---

## 9. Strategia di caricamento

1. **HTML + CSS** (prima pittura): `index.html` ha il fondo parete `#171C1D`
   inline; `.ctp-root` disegna fascia, parete, bisello, velatura. Nel
   prerender (`pronto: false`) la lista mostra la sua struttura senza data e
   con altezza riservata; la data e le righe arrivano al mount senza spostare
   nulla.
2. **Foto**: `<img>` con `srcset` 800w/1600w,
   `sizes="(min-width: 900px) 88vw, 100vw"`, `width`/`height` veri,
   `decoding="async"`. Specchio attivo all'avvio: `fetchpriority="high"`,
   `loading="eager"`. Gli altri due: `fetchpriority="low"` (i loro bordi sono
   già in vista). Nello standalone `index.html` ha un
   `<link rel="preload" as="image" imagesrcset=… >` della prima foto (scaffold);
   nel sito basta il `fetchpriority`.
3. **Font**: `preconnect` + `<link>` al mount, `display=swap`, metriche di
   ripiego.
4. **Specchio pulito per 0 ms** (CD §6.3.1): riflesso e listino visibili
   subito, nessun preloader. Il canvas nasce con il vetro **tutto pulito**
   (maschera piena), quindi non c'è mai un frame grigio prima del JS.
5. **Apertura** (motion-designer, `motion/apertura.ts`): dopo `fontsReady()`
   e comunque non prima di 500 ms dal mount, `vapore.alza(0, 2400)` poi
   `vapore.passata(…)`. Solo con `motion: 'full'`, modo `vivo`, canvas `on`,
   nessuna prenotazione aperta e nessun `?pulito=1`.
6. **Rilevamento** al mount (`core/capabilities.ts`): reduced motion (con
   listener), puntatore grosso, canvas 2D (`getContext('2d')` su un canvas di
   prova, scartato), `?canvas=0`.
7. **Pausa**: `visibilitychange` → ticker fermo; al ritorno il vapore applica
   il tempo trascorso come in §7.3.
8. **Smontaggio**: ferma ticker, deregistra canvas, stacca listener, toglie il
   `<link>` dei font se suo, ripristina `document.title`.

### 9.1 Senza canvas (fallback)

`data-canvas="off"` (errore di contesto, `?canvas=0`): specchio pulito, niente
vapore, niente passata, interruttore "Specchio pulito" nascosto, suggerimento
del gesto nascosto. Il sito è **completo**: tutta l'informazione è DOM (CD §9).
Deve reggere da solo la giuria: riflesso, pennarello, bisello, lista.

### 9.2 Reduced motion

Modo `fermo` dall'inizio (alone statico ai bordi), niente apertura, niente
gocce, pan = dissolvenza 200 ms, straccio = dissolvenza 200 ms, scrittura e
sottolineatura compaiono senza tracciarsi. Il toggle resta attivo e si può
spegnere (CD §11): se l'utente lo spegne, il vapore torna `vivo` ma senza gocce
e senza passata automatica.

---

## 10. Analytics

`import { track } from '@/lib/analytics'` (stub nello standalone, stessa
firma e stesso `TrackEvent` del sito: copia dal pilota).

| Evento | Quando | Params |
|---|---|---|
| `apri_concept` | mount di `Contropelo.tsx` (una volta) | `{ concept: 13 }` |
| `demo_prenotazione` | solo in `confermaPrenotazione` | `{ concept: 13, specchio, servizio, giorno }` (giorno = offset 0..5) |

Nessun altro evento (unione chiusa del sito). Mai nome o telefono.

---

## 11. Comandi

### 11.1 Script (dalla cartella `concepts/13-contropelo/`)

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite --port 9130 --strictPort` → http://localhost:9130/concept-13 (`/` fa redirect) |
| `npm run build` | `vite build` in `dist/` |
| `npm run preview` | `vite preview --port 9131 --strictPort` (fallback SPA) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: **prima di dire "fatto"** |

Porte per agent (intervallo 9130-9139, sempre `--strictPort`, ognuno chiude il
proprio server):

| Porta | Ondata 2 | Ondata 3 | Ondata 4 |
|---|---|---|---|
| 9130 | | scaffold (`npm run dev`) | |
| 9131 | | section-builder-fascia | responsive-tester (preview) |
| 9132 | | section-builder-parete | accessibility-auditor |
| 9133 | | section-builder-vetro | performance-auditor |
| 9134 | | section-builder-lista | cross-browser-tester |
| 9135 | | section-builder-mensola | seo-engineer |
| 9136 | art-director (prove statiche) | section-builder-informazioni | awwwards-jury (se serve) |
| 9137 | interaction-designer (prove) | section-builder-vapore | |
| 9138 | motion-designer (prove) | | |
| 9139 | vector-artist (prove) | | |

I section-builder avviano con `npx vite --port 913X --strictPort`; i QA usano
`npx vite preview --port 913X --strictPort` dopo `npm run build`.

### 11.2 Parametri di prova nell'URL (`core/params.ts`)

| Parametro | Effetto |
|---|---|
| `?specchio=1\|2\|3` | specchio attivo all'avvio |
| `?faccia=lista` | su mobile parte dalla lista |
| `?pulito=1` / `?pulito=0` | forza il toggle (vince sul salvato) |
| `?canvas=0` | fallback senza canvas |
| `?oggi=YYYY-MM-DD` | data forzata (lunedì chiuso, giorno pieno) |
| `?pieno=1` | lo specchio attivo ha il giorno pieno (stato "Oggi siamo pieni") |
| `?invio=ko` | l'invio simulato fallisce |
| `?preso=1` | il primo invio risponde "posto preso" |
| `?scrittura=HH:MM` | apre la riga di scrittura su quell'ora dello specchio attivo (QA degli stati) |

Svuotare la memoria del concept:
`localStorage.removeItem('contropelo:pulito'); localStorage.removeItem('contropelo:prenotazione')`.

---

## 12. Checklist per chi scrive codice

- Segui `.claude/skills/design-taste-frontend/SKILL.md` e
  `.claude/skills/full-output-enforcement/SKILL.md`: niente placeholder, TODO,
  file troncati.
- Solo i tuoi file (§4). Costanti condivise da store, runtime, token, tempi:
  non duplicarle.
- Nessun `requestAnimationFrame` fuori dal ticker, nessun `setInterval` per
  animare, nessun listener `scroll`.
- Nessun hex fuori da `styles/tokens.*`; nessun testo fuori da `content/`.
- Nessun accesso al browser a livello di modulo.
- Mansalva solo per ciò che è scritto sul vetro; Figtree per interfaccia ed
  errori; Limelight solo insegna e nomi dei barbieri (CD §4.2).
- Turchese mai per testo sotto 24 px (CD §4.1).
- Verifica con il tuo dev server sulla tua porta, screenshot della finestra a
  375/768/1440 guardati, `npm run typecheck` e `npm run lint` verdi.

---

## Richieste ad altri agent

- **ux-architect / art-director**: su ≤ 640 px il `ConceptBackButton` del sito
  (misurato 194 × 33 px a `left: 12px; bottom: 14px`) cade dentro la mensola;
  i 56 px previsti dal CD §10 non bastano. Serve una mensola che lasci libera
  la zona x 0-220 px × ultimi 60 px (+ safe area): proposta in §3.3 (mensola a
  due file, ≈ 104 px). Su desktop la fascia alta deve essere ≥ 58 px
  (propongo 60) perché il bottone arriva a y = 49 px con 11 px di padding.
- **ux-architect**: prevedere il layout `data-layout="scorre"` (§5.4) per
  altezza < 520 px (telefono in orizzontale, zoom 400%), con specchi impilati
  e vapore fermo; senza, lo zoom 400% non è conforme.
- **creative-director** (solo per conoscenza): tre canvas visibili invece di
  uno + tre fuori schermo (§0.4), per far vedere il vapore sui bordi degli
  specchi vicini; costo in memoria trascurabile, un solo canvas aggiornato alla
  volta.
- **photo-editor**: consegnare le foto **già trattate** (specchiate, −40%
  saturazione, raffreddate, sfocatura 1-2 px) in webp 800/1600 px, e in
  `assets/foto/index.ts` per ogni specchio: `src800`, `src1600`, `larghezza`,
  `altezza`, `posizione` (`object-position` desktop e mobile), `autore`, `url`.
  Niente velatura cotta: è CSS.
- **vector-artist**: icone Phosphor (Light) come path in `icone.ts` con la
  licenza MIT annotata; in `tratti.ts` la sottolineatura del nome, 3 varianti
  del trattino libero e il cerchio a pennarello del fuoco sul posto libero.
- **copywriter**: oltre a `testi.ts`, i dati `listino.ts`, `orari.ts` (forma in
  §6.4), `nomi.ts` (almeno 40 nomi + iniziale, maschili e femminili, di Pordenone
  e dintorni); `title`/`description` con "Concept di Ciceri Lab".
