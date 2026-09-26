# Tech architect · Concept 15 · NOVANTA

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, convenzioni, contratti tra moduli, stato, budget, caricamento e
comandi. Dove un fatto del sito vero è in conflitto con questo documento vale
`concepts/10-torchio/docs/integrazione-sito.md`.

Letti: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`concepts/10-torchio/docs/integrazione-sito.md`,
`concepts/15-novanta/docs/creative-director.md` (tutto),
`concepts/10-torchio/docs/tech-architect.md`,
`concepts/10-torchio/docs/scaffold-engineer.md`,
`concepts/10-torchio/docs/RIEPILOGO.md`, il codice del pilota
(`package.json`, `vite.config.ts`, `index.html`, `src/lib/analytics.ts`,
`src/components/ConceptBackButton.tsx`, `src/App.tsx`, `state/persist.ts`) e
`package.json` del sito vero (`/home/user/cicerilab`).

Cartella del concept: `concepts/15-novanta/`. Cartella del codice:
`src/pages/concepts/novanta/`. Prefisso CSS `nov-`. Rotta `/concept-15`.
Porte **9150-9159**.

**Nomi delle sezioni.** Uso i sette angoli del creative-director (§4.2) più il
quadrante e la testata. L'ux-architect lavora in parallelo: se cambia titoli,
ordine o accorpa "prezzi" e "dove", **cambiano i testi (copywriter) e l'elenco
`ANGOLI` in `content/testi.ts`, non i nomi di cartelle, file e agent**, che
restano stabili per i proprietari. Se l'ux-architect aggiunge o toglie un
angolo, l'orchestratore aggiorna la tabella di §4 prima dell'ondata 3.

---

## 0. Decisioni chiave in breve

1. **Stessa app standalone del pilota**: Vite 5 + React 18.3 + React Router 6
   + TypeScript 5.6, stesse versioni esatte (verdi nel pilota il 25/09). Il
   concept vive tutto in `src/pages/concepts/novanta/`; `src/pages/Concept15.tsx`
   è un file sottile. Porting = copiare la cartella e il file.
2. **Solo SVG + CSS. Niente three, niente R3F/drei, niente WebGL, niente
   canvas, niente lenis, niente GSAP.** Il sito non scorre (il quadrante
   ruota) e l'unico movimento vero è un angolo che cambia: basta una variabile
   CSS scritta da un ciclo rAF nostro. Nessun agent webgl-artist né
   shader-engineer in questo concept.
3. **Un solo ciclo `requestAnimationFrame`** (`core/ticker.ts`, API identica
   al pilota con due sole fasi, `update` e `write`), che si ferma da solo
   quando niente si muove. È l'unico posto dove l'angolo del braccio e
   dell'anello si scrive nel DOM.
4. **Valori caldi fuori da React**: l'angolo continuo del braccio (0-180 con i
   decimali), quello dell'anello e il numero dei gradi mostrato vivono in
   `state/runtime.ts` e si scrivono nel DOM come `--nov-deg` e `textContent`.
   React si ri-renderizza **solo** quando cambia l'angolo di contenuto attivo
   (a metà strada tra due angoli), la vista, o lo stato della prenotazione.
5. **Store lento con `useSyncExternalStore`** e selettori (come il pilota),
   azioni nominate, re-inizializzato al mount.
6. **Una sola geometria, due orientamenti**: tutta la matematica polare è in
   `dial/geometria.ts` (una fonte, usata da quadrante, mini archi, anello,
   interazione, movimento). Convenzione unica dei gradi del goniometro, con
   `geo: 'bordo' | 'fondo'` (§7).
7. **Un controller generico di rotazione** (`motion/rotore.ts`): molla senza
   rimbalzo, magnete agli agganci, inerzia corta. Lo usano sia il braccio
   (agganci ogni 30°) sia l'anello della settimana (agganci = ore libere).
8. **La prima pittura la decide il CSS, non JS**: la struttura DOM è sempre
   la `ol` di sette `section` (vista elenco). Con `@media (scripting: enabled)`
   e le stesse soglie di larghezza/altezza di `core/modo.ts`, il CSS impagina
   già il quadrante prima che React monti; senza JS (e nel prerender letto
   senza script) si vede l'elenco. Così non c'è salto di layout all'avvio.
9. **Icone**: SVG di Tabler Icons (MIT) copiati come file in
   `assets/svg/icone/` dal vector-artist, nessuna dipendenza npm (il sito ha
   solo `lucide-react`; aggiungere Phosphor o Tabler al sito vero costerebbe
   un pacchetto per tre icone).
10. **Bottone "Torna in Ciceri Lab" vero**: il quadrante si sposta per non
    toccarlo mai (misure in §7.4). È la correzione che il creative-director
    chiedeva di risolvere qui.

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte, niente `^`)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy` nell'app standalone; il concept non importa il router |

Nient'altro a runtime.

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

**Non installati di proposito**: `three`, `@types/three`, `@react-three/*`,
`lenis`, `gsap`, `framer-motion`, Tailwind, `zustand` (lo store è nostro, 60
righe), librerie di icone, `@fontsource`, librerie di date (`date-fns`: le
date servono per 14 giorni, bastano `Date` e `Intl.DateTimeFormat('it-IT')`),
librerie di calendario/.ics (il file .ics è testo, lo scriviamo noi).

Motivo del "niente three": il creative-director assegna a NOVANTA l'unico
"SVG/CSS puro" della serie; il quadrante è 181 tacche + un braccio + un disco:
circa 200 nodi SVG statici e **un** attributo `transform` che cambia. Un
contesto WebGL costerebbe 110+ KB gz e un fallback da mantenere, senza
guadagno visivo.

Motivo del "niente lenis": in vista quadrante la pagina non scorre (scorre
solo, nativamente, l'area del contenuto lungo); in vista elenco lo scroll
nativo è quello giusto per chi legge con fretta o con uno screen reader.

### 1.3 Font

Google Fonts iniettati con un `<link>` al mount (`core/fonts.ts`), più
`preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`. URL indicativo
(quello vero lo fissa l'art-director in `styles/tokens.ts` → `FONT_CSS_URL`):

```
https://fonts.googleapis.com/css2?family=Epilogue:wght@100..900&family=Lexend:wght@400;500&display=swap
```

- Epilogue variabile (per il 300 del "°", il 500 dei numeri del quadrante, il
  700 dei titoli, l'800 dei gradi e del marchio). Solo latin.
- Lexend 400/500.
- L'art-director verifica se Epilogue ha `tnum`; se no, i gradi si scrivono in
  tre box a larghezza fissa (una cifra per box), come da creative-director §4.1.
  La scelta la dichiara in `DESIGN.md`; la implementa il section-builder del
  quadrante.
- `@font-face` di ripiego locale con `size-adjust` / `ascent-override` tarati
  su Epilogue e Lexend (in `tokens.css`, art-director): è la prima difesa del
  CLS.

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json`.
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`, `jsx: react-jsx`,
  `moduleResolution: bundler`, `types: ["vite/client"]`, target `ES2020`.
- `vite.config.ts`: dev **9150** `strictPort`, preview **9151** `strictPort`,
  `host: true`, target build `es2020`, `manualChunks` solo per `react`
  (`node_modules/react*`, `scheduler`) come nel pilota.
- Node 22.

---

## 2. Architettura in una figura

```
                ┌───────────────── React (lento) ──────────────────┐
 input ──►  interaction/*  ──►  motion/rotore  ──►  state/runtime (caldo)
 (dito,        (angolo dal       (molla, magnete,     braccio.deg, anello.deg
  rotella,      puntatore,        inerzia)                 │
  tastiera)     delta rotella)        │                    ▼
                                      │            core/ticker  fase 'write'
                                      │            ├─ --nov-deg sul quadrante
                                      │            ├─ path della clipPath tacche
                                      │            └─ textContent dei gradi
                                      ▼
                   store.impostaAttivo(angolo)  (solo a metà strada: ±15°)
                                      │
                        React: data-attivo, dissolvenza del contenuto,
                        aria-live, hash dell'URL (core/hash.ts)
```

Regola d'oro: **niente `setState` a ogni frame**. Durante un trascinamento
React non viene toccato se non nel passaggio da un angolo di contenuto al
successivo (al massimo 6 volte in un giro intero).

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo standalone, non si porta. **[P]** si porta nel sito. Tra
parentesi il proprietario (dettaglio in §4).

```
concepts/15-novanta/
├─ DESIGN.md                                 [S*] (art-director)  formato Stitch, resta nel repo come doc
├─ docs/                                     [S]  un .md per agent
├─ qa/                                       [S]  screenshot di QA (ignorati da git)
├─ package.json  package-lock.json           [S]  (scaffold)
├─ vite.config.ts                            [S]  (scaffold)
├─ tsconfig.json tsconfig.app.json tsconfig.node.json   [S] (scaffold)
├─ eslint.config.js  .gitignore              [S]  (scaffold)
├─ index.html                                [S]  (scaffold)  lang="it", meta, preconnect, fondo albicocca inline, script vista salvata
├─ public/
│  └─ favicon.svg                            [S]  (vector-artist)
└─ src/
   ├─ main.tsx                               [S]  (scaffold)  StrictMode + <App/>
   ├─ App.tsx                                [S]  (scaffold)  BrowserRouter flag v7; /concept-15 lazy; / e * → redirect
   ├─ vite-env.d.ts                          [S]  (scaffold)
   ├─ lib/analytics.ts                       [S]  (scaffold)  copia del pilota: TrackEvent chiuso del sito, stessa firma
   ├─ components/ConceptBackButton.tsx       [S]  (scaffold)  copia fedele del pilota (location.href = "/")
   └─ pages/
      ├─ Concept15.tsx                       [P]  (scaffold)  export default () => <Novanta/>
      └─ concepts/
         └─ novanta/                         [P]  TUTTO il concept
            ├─ index.ts                      (scaffold)  export { default } from './Novanta'
            ├─ Novanta.tsx                   (scaffold)  radice .nov-root, ordine, salti, aria-live, mount/unmount
            │
            ├─ core/                         (scaffold)
            │  ├─ ticker.ts                  unico rAF, fasi 'update' | 'write'
            │  ├─ capabilities.ts            prefersReducedMotion(), ascolta…, isCoarsePointer(), supportaScripting()
            │  ├─ fonts.ts                   injectFonts(), fontsReady()
            │  ├─ viewport.ts                runtime.viewport + --nov-vv-h (visualViewport, tastiera del telefono)
            │  ├─ modo.ts                    soglie e decidiModo() (vista quadrante/elenco, geometria bordo/fondo)
            │  ├─ hash.ts                    #gradi-N ⇄ angolo, pushState/popstate
            │  ├─ pagina.ts                  blocca/ripristina overflow e overscroll di html/body
            │  ├─ params.ts                  parametri di QA dell'URL (§11)
            │  └─ links.ts                   LAB_URL, MAPS_URL, TELEFONO_URL (da content/studio.ts)
            │
            ├─ state/                        (scaffold)
            │  ├─ store.ts                   store + useNovanta(selector) + azioni (§6.1)
            │  ├─ runtime.ts                 valori caldi mutabili (§6.2)
            │  └─ persist.ts                 local/sessionStorage in try/catch (copia del pilota, chiavi novanta:)
            │
            ├─ layout/                       (scaffold)
            │  ├─ Angolo.tsx                 involucro comune di ogni angolo: <li><section id="gradi-N"> + h2 + stato
            │  └─ Palco.tsx                  area del contenuto: posizione in quadrante/elenco, scroll interno
            │
            ├─ dial/                         (vector-artist)  la geometria e lo strumento, senza interazione
            │  ├─ geometria.ts               matematica polare unica (§7.1)
            │  ├─ Arco.tsx                   arco graduato SVG presentazionale (quadrante, mini archi, indice)
            │  └─ arco.css
            │
            ├─ motion/                       (motion-designer)
            │  ├─ easing.ts                  curve (funzioni + stringhe cubic-bezier)
            │  ├─ molla.ts                   molla critica senza rimbalzo, integrata sul dt del ticker
            │  ├─ rotore.ts                  controller generico di rotazione (§7.2)
            │  ├─ invito.ts                  l'"invito" di 6° una volta sola dopo 3 s (creative-director §4.7)
            │  ├─ choreography.ts            costanti: durate, soglie, distanze, versioni ridotte
            │  └─ motion.css                 dissolvenza incrociata degli angoli, comparsa arco del ciclo, varianti reduced
            │
            ├─ interaction/                  (interaction-designer)
            │  ├─ trascina.ts                useTrascinaAttorno(): puntatore → gradi attorno a un perno
            │  ├─ rotella.ts                 useRotella(): rotella/trackpad → delta gradi, precedenza allo scroll interno
            │  ├─ tastiera.ts                mappe tasti per role="slider" (braccio e anello)
            │  ├─ attivita.ts                runtime.ultimoInput (per l'invito e il trackpad)
            │  └─ interaction.css            focus visibile, cursori grab, touch-action, hover
            │
            ├─ content/                      (copywriter)
            │  ├─ testi.ts                   ANGOLI (titoli, parole del quadrante, testi), META, testata, frasi della prenotazione
            │  ├─ listino.ts                 prezzi di esempio (dati)
            │  ├─ orari.ts                   orari di apertura e schema di occupazione di esempio (dati)
            │  └─ studio.ts                  RECAPITI di esempio (indirizzo, telefono finto, query Maps, parcheggio)
            │
            ├─ styles/
            │  ├─ tokens.css                 (art-director) variabili --nov-*, @font-face di ripiego
            │  ├─ tokens.ts                  (art-director) COLORI hex, FONT_CSS_URL, FONT_DA_CARICARE, misure numeriche usate in TS
            │  ├─ base.css                   (scaffold) reset scoped, tipografia base, .nov-sr, .nov-salto
            │  └─ layout.css                 (scaffold) impaginazione quadrante/elenco, zone riservate, prima pittura CSS
            │
            ├─ assets/
            │  ├─ svg/                       (vector-artist)
            │  │  ├─ marchio-novanta.svg     (solo se il marchio non è testo puro: decide art-director)
            │  │  ├─ icone/telefono.svg  calendario.svg  errore.svg  esterno.svg  elenco.svg  quadrante.svg
            │  │  └─ index.ts                export degli SVG (?raw) e degli URL (?url)
            │  └─ foto/                      (art-director)  max 3 foto, ognuna in 640w e 1200w .webp
            │     ├─ studio-640.webp  studio-1200.webp          (0°)
            │     ├─ attrezzi-640.webp attrezzi-1200.webp       (60°, facoltativa)
            │     ├─ ingresso-640.webp ingresso-1200.webp       (180°, facoltativa)
            │     └─ index.ts                FOTO: { src, srcset, w, h, alt, autore, url } per chiave
            │
            └─ sections/
               ├─ Testata/      Testata.tsx  testata.css                                  (section-builder-zero)
               ├─ Zero/         Zero.tsx  zero.css                                         (section-builder-zero)
               ├─ Quadrante/    Quadrante.tsx  Braccio.tsx  LetturaGradi.tsx
               │                ParoleAngoli.tsx  useBraccio.ts  quadrante.css             (section-builder-quadrante)
               ├─ PrimoIncontro/ PrimoIncontro.tsx  primo-incontro.css                     (section-builder-primo-incontro)
               ├─ Trattamenti/  Trattamenti.tsx  trattamenti.css                           (section-builder-trattamenti)
               ├─ Prenota/      Prenota.tsx  Anello.tsx  OreLibere.tsx  Modulo.tsx  Esito.tsx
               │                useAnello.ts  calendario.ts  invio.ts  ics.ts  prenota.css (section-builder-prenota)
               ├─ Osteopatia/   Osteopatia.tsx  osteopatia.css                             (section-builder-osteopatia)
               ├─ Esercizi/     Esercizi.tsx  esercizi.css                                 (section-builder-esercizi)
               └─ PrezziDove/   PrezziDove.tsx  prezzi-dove.css                            (section-builder-prezzi-dove)
```

Ordine in `Novanta.tsx`: Testata, Quadrante (con `LetturaGradi` e le parole
come `nav`), `main` con la `ol` dei sette angoli in ordine Zero,
PrimoIncontro, Trattamenti, Prenota, Osteopatia, Esercizi, PrezziDove.

### 3.1 La pagina montata da `Novanta.tsx`

```html
<div class="nov-root" data-modo="quadrante|elenco" data-geo="bordo|fondo"
     data-attivo="0|30|…|180" data-dir="avanti|indietro"
     data-motion="full|reduced" data-pronto="0|1">
  <a class="nov-salto" href="#gradi-{attivo}">Salta al contenuto</a>
  <ConceptBackButton/>                              <!-- del sito, fisso, z altissimo -->
  <Testata/>                                        <!-- header: marchio, tel:, interruttore vista -->
  <Quadrante/>                                      <!-- SVG aria-hidden + braccio role=slider + nav delle 7 parole + LetturaGradi -->
  <main id="contenuto" class="nov-main">
    <Palco>                                         <!-- area di lettura, scroll interno se serve -->
      <ol class="nov-angoli">
        <Zero/> <PrimoIncontro/> <Trattamenti/> <Prenota/>
        <Osteopatia/> <Esercizi/> <PrezziDove/>     <!-- ognuno: <Angolo gradi={N}> … </Angolo> -->
      </ol>
    </Palco>
  </main>
  <p class="nov-sr" aria-live="polite">{titolo dell'angolo attivo}</p>
</div>
```

- Ogni sezione è **default export senza prop** e rende il proprio contenuto
  dentro `<Angolo gradi={N}>` (scaffold), che produce
  `<li class="nov-angolo" data-gradi="N" data-stato="attivo|entra|esce|spento"><section id="gradi-N" aria-labelledby="gradi-N-titolo">`
  con l'`h2` (titolo dal copywriter) e il numero dei gradi come testo
  accessorio. In vista quadrante gli angoli non attivi hanno `inert` e
  `aria-hidden` (li mette `Angolo`, non la sezione). In vista elenco nessuno
  è inerte.
- Gli id `gradi-0` … `gradi-180` sono stabili: li usano hash, salto,
  `nav` del quadrante e i test.

---

## 4. File di competenza esclusiva

Regola: **ogni file ha un solo proprietario**. Chi ha bisogno di una modifica
in un file altrui la scrive nel proprio `docs/<agent>.md` (sezione
"Richieste ad altri agent") e l'orchestratore la gira. Tutti possono
**leggere e importare** tutto. Percorsi relativi a
`src/pages/concepts/novanta/` salvo dove scritto.

**Passaggio degli stub**: lo scaffold crea gli stub delle sezioni (default
export che rende `<Angolo gradi={N}>` con il solo titolo) e di
`Quadrante`/`Testata` perché il build sia verde subito. A fine scaffold la
proprietà passa al section-builder e lo scaffold non li tocca più.

### Ondata 2 (in parallelo)

| Agent | File esclusivi | Cosa NON tocca / vincoli |
|---|---|---|
| **art-director** | `DESIGN.md` (root del concept), `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts`, `assets/foto/*` (scelta, verifica con Read, ottimizzazione, `index.ts` con autore e URL) | CSS di sezione, `base.css`, `layout.css`. Nessun colore fuori dai tre del CD e dai derivati. |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/molla.ts`, `motion/rotore.ts`, `motion/invito.ts`, `motion/choreography.ts`, `motion/motion.css` | il ticker (ne usa l'API), gli input (interaction), il DOM delle sezioni. Nessun rimbalzo elastico. |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/trascina.ts`, `interaction/rotella.ts`, `interaction/tastiera.ts`, `interaction/attivita.ts`, `interaction/interaction.css` | niente cursore custom, niente preloader, niente cerchio che segue il mouse (vietati dal CD). |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/listino.ts`, `content/orari.ts`, `content/studio.ts` | nessun testo nei componenti; niente `—`/`–`; un solo `·` per riga; recapiti di esempio, nessun dato legale. |
| **vector-artist** | `docs/vector-artist.md`, `dial/geometria.ts`, `dial/Arco.tsx`, `dial/arco.css`, `assets/svg/*` (icone Tabler MIT con licenza annotata), `public/favicon.svg` | nessun corpo, sagoma, mano, scheletro (CD §4.7). Le tacche si calcolano, non si disegnano a mano. |
| ~~webgl-artist~~ | **non previsto**: nessun WebGL (§1.2). Se l'orchestratore lo lancia comunque, il suo unico output è un `docs/webgl-artist.md` che conferma la rinuncia. | — |

Perché `dial/` al vector-artist: è la parte "strumento" del sito (arco,
tacche, numeri, perno, forma del braccio), serve **prima** dell'ondata 3 a tre
section-builder (quadrante, primo incontro, esercizi) e all'anello, ed è SVG
generato da codice. È presentazionale: niente eventi, niente stato.

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file **[S]** di §3 tranne `DESIGN.md`, i `docs/*` altrui e `public/favicon.svg`; `src/pages/Concept15.tsx`; `index.ts`, `Novanta.tsx`; `core/*`; `state/*`; `layout/*`; `styles/base.css`, `styles/layout.css`; stub iniziali di `sections/*/*.tsx` e `*.css` (poi passano ai proprietari) |
| **section-builder-quadrante** | `sections/Quadrante/Quadrante.tsx`, `Braccio.tsx`, `LetturaGradi.tsx`, `ParoleAngoli.tsx`, `useBraccio.ts`, `quadrante.css`, `docs/section-builder-quadrante.md` |
| **section-builder-zero** (0°, e la testata della prima schermata) | `sections/Zero/Zero.tsx`, `zero.css`, `sections/Testata/Testata.tsx`, `testata.css`, `docs/section-builder-zero.md` |
| **section-builder-primo-incontro** (30°) | `sections/PrimoIncontro/PrimoIncontro.tsx`, `primo-incontro.css`, `docs/section-builder-primo-incontro.md` |
| **section-builder-trattamenti** (60°) | `sections/Trattamenti/Trattamenti.tsx`, `trattamenti.css`, `docs/section-builder-trattamenti.md` |
| **section-builder-prenota** (90°) | `sections/Prenota/Prenota.tsx`, `Anello.tsx`, `OreLibere.tsx`, `Modulo.tsx`, `Esito.tsx`, `useAnello.ts`, `calendario.ts`, `invio.ts`, `ics.ts`, `prenota.css`, `docs/section-builder-prenota.md` |
| **section-builder-osteopatia** (120°) | `sections/Osteopatia/Osteopatia.tsx`, `osteopatia.css`, `docs/section-builder-osteopatia.md` |
| **section-builder-esercizi** (150°) | `sections/Esercizi/Esercizi.tsx`, `esercizi.css`, `docs/section-builder-esercizi.md` |
| **section-builder-prezzi-dove** (180°, con la riga "Un concept di CiceriLab") | `sections/PrezziDove/PrezziDove.tsx`, `prezzi-dove.css`, `docs/section-builder-prezzi-dove.md` |

Note:
- Nessuno shader-engineer (niente WebGL).
- `section-builder-quadrante` è il più delicato: collega `interaction/*` e
  `motion/rotore.ts` al braccio in `useBraccio.ts`, chiama
  `store.impostaAttivo()` e `core/hash.ts`. Parte in parallelo agli altri: il
  contratto con loro passa solo da store e `Angolo`.
- `section-builder-prenota` scrive `invio.ts` come **invio simulato** (nessuna
  rete): risolve dopo ~1 s; `?invio=ko` fallisce; `?posto=preso` fa scattare
  una volta lo stato "l'ora è stata presa nel frattempo". `ics.ts` genera il
  file .ics con due `VEVENT` in un `Blob` al clic e si carica con
  `import('./ics')` (fuori dal chunk iniziale).
- `calendario.ts` (prenota) trasforma `content/orari.ts` (schema per giorno
  della settimana, niente date) in slot con date vere a partire da
  `store.oggi`. "Questa settimana" = la settimana lun-dom di `oggi`, oppure la
  successiva se `oggi` è sabato dopo le 13 o domenica; le ore già passate sono
  occupate. Il controllo cade in `[+7, +10]` giorni **ma solo sui giorni
  della pista esterna**: se non c'è posto, si applica la regola "ora libera
  più vicina" del CD §4.4 dentro la settimana dopo, e la frase lo dice. Da
  confermare con ux-architect.
- Il copywriter scrive i testi come dati tipizzati; i section-builder non
  inventano testo. Se manca una stringa, la chiedono.

### Porte (regola di `docs/lab-operativo.md`, sempre `--strictPort`, ognuno chiude il suo server)

| Porta | Chi |
|---|---|
| 9150 | `npm run dev` di default; scaffold-engineer |
| 9151 | `npm run preview`; performance-auditor (Lighthouse sul build) |
| 9152 | art-director (ondata 2) · section-builder-quadrante (ondata 3) · accessibility-auditor (ondata 4) |
| 9153 | motion-designer · section-builder-zero · responsive-tester |
| 9154 | interaction-designer · section-builder-primo-incontro · cross-browser-tester |
| 9155 | vector-artist · section-builder-trattamenti · seo-engineer |
| 9156 | section-builder-prenota |
| 9157 | section-builder-osteopatia |
| 9158 | section-builder-esercizi |
| 9159 | section-builder-prezzi-dove · awwwards-jury (se gli serve un server) |

Le ondate non si sovrappongono, quindi il riuso di una porta tra ondate è
sicuro. Comando per chi non è lo scaffold:
`npx vite --port 91xx --strictPort` dalla cartella del concept.

---

## 5. Convenzioni CSS

- **Un file `.css` per sezione**, importato dal componente. Niente CSS
  modules, niente Tailwind (come il pilota: classi leggibili negli screenshot,
  selettori di stato su attributi della radice senza `:global`).
- **Prefisso `nov-`** con BEM leggero: `nov-<blocco>`, `nov-<blocco>__<el>`,
  `nov-<blocco>--<variante>`. Esempi: `nov-quadrante__braccio`,
  `nov-anello__spicchio--chiuso`, `nov-prenota__campo`.
- **Tutti i selettori iniziano con `.nov-root`**. Niente regole su `html`,
  `body`, `:root`, `*` nudi. L'unica eccezione ammessa è in `base.css`
  (scaffold) con `html:has(.nov-root)`, come nel pilota. Il fondo albicocca è
  su `.nov-root` (a tutta altezza) e, inline al mount, su html/body (niente
  strisce nel rimbalzo iOS), ripristinato allo smontaggio.
- **Variabili `--nov-*` solo in `tokens.css`** (art-director); variabili
  locali di sezione con prefisso di sezione (`--nov-prenota-…`). **Nessun
  hex fuori da `styles/tokens.*`.**
- **Variabili scritte da JS** (solo ticker/scaffold, mai a mano nelle sezioni):
  `--nov-deg` (angolo continuo del braccio, numero senza unità, sul nodo
  `.nov-quadrante`), `--nov-anello-deg` (sull'anello), `--nov-vv-h` (altezza
  del visualViewport in px, su `.nov-root`), `--nov-r` e `--nov-perno-x/-y`
  (misure del quadrante calcolate da `core/modo.ts`, su `.nov-root`).
- **Attributi di stato su `.nov-root`** (li scrive solo `Novanta.tsx`):
  `data-modo`, `data-geo`, `data-attivo`, `data-dir`, `data-motion`,
  `data-pronto` (`1` dopo il mount: da lì valgono le transizioni; prima,
  niente transizioni, per non animare la prima pittura).
- **Rotazione con una variabile**: il braccio si disegna a 0° e si ruota con
  `rotate: calc(var(--nov-deg) * -1deg)` in geometria `bordo` e
  `calc(var(--nov-deg) * 1deg)` in `fondo` (vedi `rotazioneCss()` in §7.1),
  `transform-origin` sul perno, `transform-box: view-box`. Nessun
  `transition` sul braccio: lo muove il rotore.
- **Z-index** (token dell'art-director): contenuto 1, quadrante 2, testata 3,
  salto 4. Il bottone del sito sta a 2147483000 e nessuno lo supera.
- **Unità**: `rem` per il testo, `clamp()` per le misure fluide, `dvh`/`svh`
  per le altezze (mai `100vh` puro su mobile), `env(safe-area-inset-*)` dove
  il quadrante tocca un bordo.
- **Raggi** (CD): 14 px per le superfici, pillola per bottoni e manopole,
  nient'altro. Una sola ombra (sotto il braccio).
- **Media query in `em`** per larghezza e altezza (così lo zoom e il testo
  ingrandito del browser spostano davvero la soglia): `47.5em` = 760 px,
  `35em` = 560 px, `32.5em` = 520 px, `40em` = 640 px (bottone del sito).
- **Ordine dei CSS** in `Novanta.tsx`: `tokens.css` → `base.css` →
  `layout.css` → `dial/arco.css` → `motion/motion.css` →
  `interaction/interaction.css` → CSS di sezione (ordine delle sezioni).

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno di modulo (niente librerie), letto con `useSyncExternalStore`
più selettore ed eguaglianza opzionale, **re-inizializzato al mount** di
`Novanta.tsx` (così uscire e rientrare nel sito vero non lascia stati
sporchi). Tipi `Angolo` e `ANGOLI` importati da `dial/geometria.ts` (una fonte).

```ts
type Modo = 'quadrante' | 'elenco';
type Geometria = 'bordo' | 'fondo';
type PreferenzaVista = 'auto' | 'elenco';          // 'auto' = decide core/modo.ts
type SlotId = string;                               // 'AAAA-MM-GG@HH:MM', ora locale
type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';

interface NovantaState {
  attivo: Angolo;                   // angolo di contenuto corrente (cambia a metà strada)
  precedente: Angolo | null;        // per data-dir e per la dissolvenza
  preferenzaVista: PreferenzaVista; // localStorage 'novanta:vista'
  modo: Modo;                       // derivato da preferenza + viewport (core/modo.ts)
  geometria: Geometria;             // ≥ 760 px (in em) 'bordo', sotto 'fondo'
  reducedMotion: boolean;
  invitoFatto: boolean;             // sessionStorage 'novanta:invito'
  oggi: string | null;              // 'AAAA-MM-GG' impostato al mount (o ?oggi=); null nel prerender
  prenota: {
    prima: SlotId | null;           // mai null dopo il mount con oggi impostato: prima ora libera utile
    controllo: SlotId | null;
    ciclo: boolean;                 // true di default; false = "solo la prima visita"
    campi: { nome: string; telefono: string; motivo: string };
    errori: Partial<Record<'nome' | 'telefono', string>>;
    invio: StatoInvio;
    avviso: 'posto-preso' | 'controllo-spostato' | null;
  };
  simula: { invioKo: boolean; postoPreso: boolean };   // da core/params.ts
}

store.get(): NovantaState
store.subscribe(fn): () => void
useNovanta<T>(sel: (s: NovantaState) => T, isEqual?: (a: T, b: T) => boolean): T
```

Azioni nominate (le sezioni chiamano queste, mai `store.set` diretto):
`impostaAttivo(angolo)`, `impostaVista(pref)`, `aggiornaModo({ modo, geometria })`
(solo `Novanta.tsx`), `segnaInvito()`, `scegliPrima(slot)`,
`spostaControllo(slot | null)`, `impostaCiclo(bool)`,
`aggiornaCampo(nome, valore)`, `impostaErrori(errori)`,
`impostaInvio(stato)`, `impostaAvviso(avviso)`, `ricominciaPrenota()`.

Memoria: `novanta:vista` (localStorage), `novanta:invito` (sessionStorage).
**Mai** nome, telefono o motivo nello storage (dati sanitari, anche se finti).

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, **mai** in React state, letto e scritto nel ticker e dagli
handler di input:

```ts
interface Rotazione {
  deg: number;          // angolo mostrato (decimali)
  target: number;       // dove sta andando
  vel: number;          // gradi/s (per l'inerzia)
  stato: 'fermo' | 'trascina' | 'aggancio' | 'inerzia';
}
runtime.braccio: Rotazione            // 0..180
runtime.anello: Rotazione             // gradi dell'anello, 0..360 non limitato (giri)
runtime.viewport: { w: number; h: number; vvH: number; dpr: number }
runtime.perno: { x: number; y: number; r: number }        // quadrante, px viewport, da core/modo.ts
runtime.pernoAnello: { x: number; y: number; r: number }  // anello, lo scrive Anello.tsx (ResizeObserver)
runtime.ultimoInput: number           // performance.now() dell'ultimo input utente (interaction/attivita.ts)
runtime.reset(): void                 // Novanta.tsx al mount
```

Chi scrive cosa:
- `runtime.braccio` / `runtime.anello`: **solo** il rotore
  (`motion/rotore.ts`), comandato da `useBraccio.ts` / `useAnello.ts`.
- `runtime.perno`: `core/modo.ts` (al resize, mai per frame).
- Lettura dei rettangoli (`getBoundingClientRect`) solo su resize /
  `ResizeObserver` / inizio trascinamento, **mai nel ticker**.

### 6.3 Ticker: `core/ticker.ts`

API del pilota, fasi ridotte:

```ts
type FaseTicker = 'update' | 'write';
type TickFn = (dt: number, now: number) => boolean | void;   // true = ho ancora da muovermi
ticker.add(fn, fase = 'update'): () => void
ticker.wake(): void
ticker.attiva(): () => void          // pausa con visibilitychange; solo Novanta.tsx
```

`dt` in secondi, limitato a [0, 0,05]. Il ciclo si ferma quando nessuna fn
ritorna `true`. **Nessun altro `requestAnimationFrame`, `setInterval` o
animazione JS nel concept.** Le dissolvenze sono transizioni CSS.

Fase `write` (tutta in `useBraccio.ts` e `useAnello.ts`, una fn ciascuno):
1. `quadranteEl.style.setProperty('--nov-deg', deg.toFixed(2))`;
2. `clipPathEl.setAttribute('d', spicchioPath(…, 0, deg, geo))`: le tacche
   "percorse" sono un secondo strato di tacche petrolio ritagliato da uno
   spicchio che va da 0 all'angolo attuale. Un attributo per frame, non 181
   colori;
3. `gradiEl.textContent = String(Math.round(deg))` solo se il numero intero è
   cambiato;
4. `aria-valuenow` / `aria-valuetext` del braccio **solo** a fine movimento
   (non per frame: gli screen reader non vanno inondati).

---

## 7. Contratti tra moduli (firme da rispettare già nell'ondata 2)

Gli agent dell'ondata 2 lavorano in parallelo: scrivono contro queste firme.
Lo scaffold verifica con il typecheck che coincidano.

### 7.1 `dial/geometria.ts` (vector-artist)

Convenzione unica: **g** = gradi del goniometro, 0..180.
- `bordo` (desktop): perno sul bordo sinistro; 0 = giù, 90 = destra, 180 = su
  (flessione della spalla).
- `fondo` (mobile): perno al centro in basso; 0 = sinistra, 90 = su, 180 = destra.
Coordinate schermo/SVG con y verso il basso.

```ts
export type Geometria = 'bordo' | 'fondo';
export const ANGOLI: readonly [0, 30, 60, 90, 120, 150, 180];
export type Angolo = (typeof ANGOLI)[number];
export function versore(g: number, geo: Geometria): { x: number; y: number };
export function polare(cx: number, cy: number, r: number, g: number, geo: Geometria): { x: number; y: number };
export function gradiDaPunto(px: number, py: number, cx: number, cy: number, geo: Geometria): number; // non limitato
export function limita(g: number, min?: number, max?: number): number;                               // default 0..180
export function angoloPiuVicino(g: number): Angolo;
export function angoloDiContenuto(g: number): Angolo;     // cambia a metà strada (±15°): è quello che va nello store
export function arcoPath(cx: number, cy: number, r: number, g0: number, g1: number, geo: Geometria): string;
export function spicchioPath(cx: number, cy: number, r: number, g0: number, g1: number, geo: Geometria): string;
export interface Tacca { g: number; tipo: 'corta' | 'media' | 'lunga'; numero: boolean }
export function tacche(da?: number, a?: number, passo?: number): Tacca[]; // 1°; media ogni 5; lunga ogni 10; numero ogni 30
export function rotazioneCss(g: number, geo: Geometria): number;          // bordo: -g; fondo: +g
```

`dial/Arco.tsx` (vector-artist), presentazionale:

```ts
interface ArcoProps {
  variante: 'quadrante' | 'mini' | 'indice';
  geo: Geometria;
  raggio: number;                 // in unità del viewBox
  da?: number; a?: number;        // arco visibile (default 0..180)
  valore?: number;                // mini archi: angolo obiettivo statico (es. 30, 120)
  confronto?: number;             // mini arco doppio del 30°: "oggi 70°" vs "obiettivo 90°"
  percorsoClipId?: string;        // quadrante: id della clipPath dello strato "percorso" (la gestisce Braccio/useBraccio)
  className?: string;
}
```

Rende disco gesso, anello di tacche, numeri ogni 30°; **non** rende il
braccio (è di `Braccio.tsx`), non ha eventi. `aria-hidden="true"` sempre. I
mini archi (30°, 150°) sono `variante="mini"` con `valore` statico, senza
ticker.

### 7.2 `motion/rotore.ts` (motion-designer)

```ts
interface OpzioniRotore {
  stato: Rotazione;                         // runtime.braccio o runtime.anello
  min?: number; max?: number;               // braccio 0..180; anello senza limiti
  agganci: () => readonly number[];         // braccio: ANGOLI; anello: angoli delle ore libere (cambiano!)
  magnete: number;                          // gradi (CD: 15)
  inerziaMax: number;                       // gradi oltre il rilascio (CD: un angolo = 30)
  durataAggancio: number;                   // ms (CD: ~350)
  ridotto: () => boolean;                   // reduced motion: salto secco, niente molla/inerzia
  onFermo?: (g: number) => void;            // arrivato su un aggancio: aria-valuenow, hash, analytics
}
interface Rotore {
  trascina(g: number): void;                // durante il drag: segue il dito 1:1 (niente ritardo)
  rilascia(velGradiAlSecondo: number): void;// inerzia corta + aggancio
  vaA(g: number, opz?: { subito?: boolean }): void; // tasti, parole, hash, anello su ora scelta
  spingi(deltaGradi: number): void;         // rotella/trackpad: accumula sul target
  tick(dt: number): boolean;                // lo chiama la fn del ticker; true se ancora in moto
}
export function creaRotore(o: OpzioniRotore): Rotore;
```

`motion/choreography.ts` esporta almeno: `DUR_AGGANCIO` (350),
`DUR_DISSOLVENZA` (180), `DUR_DISSOLVENZA_RIDOTTA` (120), `SPOSTA_TESTO_PX`
(8), `MAGNETE` (15), `INERZIA_MAX` (30), `INVITO` (`{ attesa: 3000, ampiezza: 6 }`),
`DUR_ARCO_CICLO` (`[400, 600]`), e `variabiliMotion(ridotto)` → oggetto di
variabili CSS che `Novanta.tsx` mette sulla radice. `motion.css` usa
`[data-stato]` di `Angolo` e `data-dir` della radice per la dissolvenza
incrociata con 8 px nel verso della rotazione.

### 7.3 `interaction/*` (interaction-designer)

```ts
// trascina.ts
function useTrascinaAttorno(ref: RefObject<Element>, o: {
  perno: () => { x: number; y: number };    // px viewport (runtime.perno / pernoAnello)
  gradiDa: (px: number, py: number) => number; // di solito gradiDaPunto(…, geo); l'anello passa la sua
  attivo: () => boolean;
  onInizio?: () => void;
  onMuovi: (g: number) => void;             // → rotore.trascina
  onFine: (velGradiAlSecondo: number) => void; // → rotore.rilascia
  tocco?: 'braccio' | 'disco';              // 'disco': un tocco sul disco porta il braccio lì
}): void;
// rotella.ts
function useRotella(ref: RefObject<Element>, o: {
  pxPerGrado: number;                       // CD: 4
  sogliaTrackpad: number;                   // tremolii ignorati
  attivo: () => boolean;
  scrollInterno: () => HTMLElement | null;  // il Palco: prima scorre lui, al fondo/cima ruota
  onDelta: (gradi: number) => void;         // → rotore.spingi
}): void;                                   // listener wheel { passive: false } con preventDefault solo quando ruota
// tastiera.ts
function tastiBraccio(e: KeyboardEvent): { tipo: 'passo'; gradi: number } | { tipo: 'vai'; g: number } | null; // ±30, Maiusc ±1, Home 0, Fine 180
function tastiAnello(e: KeyboardEvent): { tipo: 'ora'; verso: 1 | -1 } | { tipo: 'giorno'; verso: 1 | -1 } | null; // frecce, PagSu/PagGiù
// attivita.ts
function segnaInput(): void;                // aggiorna runtime.ultimoInput
```

Puntatore con `setPointerCapture`; `touch-action: none` **solo** su disco e
braccio (in `interaction.css`), `pan-y` sul Palco. `overscroll-behavior: none`
su html/body in vista quadrante lo mette `core/pagina.ts`.

### 7.4 Geometria reale e zone riservate (`core/modo.ts`, scaffold)

Il bottone del sito (misurato nel pilota) occupa in alto a sinistra
~230×44 px a `top/left 14 px` su desktop, in basso a sinistra ~210×44 px a
`bottom 14 px + safe-area` sotto 640 px. Il quadrante non lo tocca mai.

**`bordo` (larghezza ≥ 47.5em e altezza ≥ 35em)**
- Fascia alta riservata `T = 72 px`: a sinistra il bottone del sito, a destra
  la Testata. Il quadrante sta sotto.
- Perno: `x = 0`, `y = T + (h − T) / 2`.
- Lunghezza totale del braccio (raggio + 40 px oltre l'arco + manopola 24 px)
  ≤ `(h − T)/2 − 16`. Quindi
  `r = clamp(220, (h − T)/2 − 16 − 64, 480)` e comunque `r ≤ 0,40·w − 120`
  (spazio per le parole fuori dall'arco). A 1440×900: r ≈ 334 px (37% di h
  invece del 46% del CD: è il prezzo per non passare sotto il bottone del
  sito a 150-180°).
- Colonna di contenuto: da `r + 64 + 120 px` (parole) a destra, max 520 px.

**`fondo` (larghezza < 47.5em, altezza ≥ 32.5em)**
- Fascia bassa riservata `B = 64 px + env(safe-area-inset-bottom)`: ci sta
  solo il bottone del sito, a sinistra. Il perno è **sopra** questa fascia:
  `x = w/2`, `y = h − B`. È la soluzione "il quadrante si alza di 64 px" del
  CD §4.2: la zona 0° (sinistra) non cade mai sul bottone.
- `r = min(0,44·w, 0,26·vvH, 190)`; altezza del quadrante con le parole ≈
  `r + 48`.
- **A 90°** (prenota) il quadrante diventa compatto: vive nella stessa fascia
  bassa, **a destra del bottone** (da x = 236 px al bordo destro), alto 64 px,
  con il braccio corto e il "90". L'anello e il modulo prendono il resto.
- Testata in alto 48 px.

**Vista elenco automatica** (`preferenzaVista: 'auto'`): se nessuna delle due
condizioni sopra è vera (finestra bassa, telefono orizzontale sotto 760,
zoom 200% su schermi piccoli, testo molto ingrandito). Il CSS di prima
pittura (`layout.css`) usa **le stesse soglie**, scritte una volta in
`core/modo.ts` come costanti (`MQ_BORDO`, `MQ_FONDO`) e ripetute a mano in
`layout.css` con un commento che rimanda lì.

`core/modo.ts` scrive `runtime.perno`, `--nov-r`, `--nov-perno-x/-y` su
resize (debounce 100 ms) e chiama `store.aggiornaModo()` solo se modo o
geometria cambiano.

### 7.5 `core/hash.ts` (scaffold)

```ts
function leggiAngoloDaHash(hash: string): Angolo | null;          // '#gradi-90' → 90
function scriviHash(a: Angolo, modo: 'push' | 'replace'): void;   // history.pushState(history.state, '', …)
function ascoltaPopstate(fn: (a: Angolo) => void): () => void;
```

- Si **conserva `history.state`** (React Router ci tiene la sua chiave): mai
  `location.hash = …`, che nel sito vero farebbe un salto di scroll.
- `push` solo quando il braccio si **ferma** su un angolo diverso da quello
  dell'ultimo push (non a ogni passaggio di metà strada); `replace` all'arrivo.
- In vista elenco il clic su una parola o su "Prenota" scorre alla sezione
  (`scrollIntoView`, `behavior` secondo reduced motion) e fa `replace`.

### 7.6 Analytics

`import { track } from '@/lib/analytics'` (stub dello scaffold, copia del
pilota: `TrackEvent` **chiuso** e firma del sito). Solo due eventi:

| Evento | Quando | Params |
|---|---|---|
| `apri_concept` | una volta per mount (guardia StrictMode), in `Novanta.tsx` | `{ concept: 15 }` |
| `demo_prenotazione` | al successo dell'invio, in `Prenota.tsx` | `{ concept: 15, ciclo: boolean, vista: 'quadrante' \| 'elenco' }` |

Mai nome, telefono o motivo nei params. Nessun altro evento: non compila.

---

## 8. Budget di performance

Misurati dal performance-auditor sulla build standalone (`npm run preview`,
porta 9151), Lighthouse mobile (Moto G Power, 4G lento) e desktop.

| Voce | Budget |
|---|---|
| JS del concept (chunk `Concept15`, senza react/react-dom/router) | ≤ **60 KB gz** (atteso 30-40: niente three, lenis, gsap) |
| JS iniziale totale standalone (react + router + concept) | ≤ **115 KB gz** |
| `ics.ts` | chunk a parte, caricato al clic su "Aggiungi al calendario" |
| CSS totale del concept | ≤ **24 KB gz** |
| SVG in file (icone, marchio, favicon) | ≤ **12 KB** non gz; il quadrante è generato, non è un file |
| Nodi SVG del quadrante | ≤ **420** (2 strati di 181 tacche + numeri + disco); anello ≤ **260** |
| Font woff2 (latin) | ≤ **150 KB** (Epilogue variabile + Lexend 2 pesi) |
| Foto | max **3**; ogni 1200w ≤ **110 KB**, ogni 640w ≤ **50 KB** (.webp); totale scaricato a 375 ≤ **150 KB** |
| **LCP** | ≤ **2,5 s** mobile, ≤ 1,5 s desktop. Candidati: il numero dei gradi (testo) o la foto del 0°, che è `loading="eager"` + `fetchpriority="high"` + `width/height` |
| **CLS** | ≤ **0,02**: prima pittura del quadrante in CSS (§9), font di ripiego tarati, cifre a larghezza fissa, angoli sovrapposti nello stesso Palco (il cambio di angolo non sposta niente), foto con `aspect-ratio` |
| **INP** | ≤ **150 ms**: gli handler di input scrivono solo `runtime` e chiamano `ticker.wake()`; il cambio di angolo fa un re-render di 2 `Angolo` (entra/esce) e della radice; la validazione del modulo a `blur` e all'invio, non a ogni tasto |
| TBT | ≤ 150 ms mobile |
| FPS durante il trascinamento | 60 desktop, ≥ 55 su mobile medio; per frame: 1 `setProperty`, 1 `setAttribute`, ≤ 1 `textContent`, nessuna lettura di layout |
| Frame a riposo | **0** (ticker fermo) |

Verifica dei nodi SVG e delle scritture per frame: il performance-auditor
registra un profilo di 3 s di trascinamento a 4× CPU slowdown.

---

## 9. Strategia di caricamento

1. **HTML + CSS = prima pittura completa.** Il componente rende tutto il DOM
   (Testata, Quadrante SVG con il braccio a 0°, i sette angoli). Il CSS decide
   l'impaginazione:
   - `@media (scripting: none)` → vista elenco (anche il prerender letto
     senza JS);
   - altrimenti, con le soglie di §7.4 → quadrante `bordo` o `fondo`, con il
     0° visibile e gli altri angoli nascosti (`visibility: hidden` +
     `opacity: 0`, sovrapposti nella stessa area del Palco), oppure elenco
     automatico.
   `data-pronto="0"` fino al mount: nessuna transizione sulla prima pittura.
   Il fondo albicocca è inline in `index.html` (standalone) e su `.nov-root`.
2. **Mount** (`Novanta.tsx`, in quest'ordine, nell'inizializzatore di
   `useState` o in `useLayoutEffect` prima della pittura):
   `runtime.reset()`, `inizializzaStore({ search, hash, reducedMotion })`
   (preferenza vista salvata, `?vista=`, angolo dall'hash, `?oggi=`,
   `?invio=ko`, `?posto=preso`), `decidiModo()`, braccio **subito**
   all'angolo dell'hash (nessuna animazione d'arrivo, nessun giro
   dimostrativo). Poi: `track('apri_concept')`, `document.title`/meta da
   `META` (ripristinati allo smontaggio), fondo su html/body,
   `injectFonts()`, `ticker.attiva()`, `osservaViewport()`,
   `core/pagina.ts` (in vista quadrante: `overflow: hidden` e
   `overscroll-behavior: none` su html/body; ripristino esatto allo
   smontaggio e al passaggio a elenco), `ascoltaPopstate`, `store.oggi`
   (data locale), `data-pronto="1"`.
3. **Font**: `display=swap` + `@font-face` di ripiego tarati. Il numero dei
   gradi non cambia larghezza al cambio font (box fissi o `tnum`).
4. **Foto**: `<img>` con `srcset` 640w/1200w, `sizes`, `width`/`height`,
   `decoding="async"`. 0° `eager` + `fetchpriority="high"`; 60° e 180°
   `loading="lazy"` e, dopo l'evento `load` della pagina, in
   `requestIdleCallback` (timeout 2000 ms; Safari `setTimeout` 500 ms), lo
   scaffold chiama `img.decode()` sulle foto degli angoli vicini all'attivo,
   così la dissolvenza non mostra mai un'immagine a metà. Piano B del CD
   (nessuna foto) non cambia nulla del caricamento.
5. **Prenota**: il calcolo degli slot parte quando `store.oggi` c'è (dopo il
   mount): nel prerender l'anello mostra i sette giorni senza date e senza
   ore scelte, testo neutro del copywriter. `ics.ts` con `import()` al clic.
6. **Invito**: `motion/invito.ts` dopo 3 s senza input, una volta per sessione,
   mai con reduced motion, mai se l'hash ha già portato altrove.
7. **Reduced motion**: rotore a salto secco, numero dei gradi dritto al
   valore finale, dissolvenza 120 ms senza spostamento, arco del ciclo già
   completo, nessun invito. Il trascinamento resta (è un controllo).
8. **Pausa**: `visibilitychange` → ticker fermo.
9. **Smontaggio** (navigazione nel sito vero): ticker fermo, listener tolti
   (wheel non passivo compreso), html/body ripristinati (overflow,
   overscroll, fondo), `<link>` dei font tolto solo se aggiunto da noi, titolo
   e meta ripristinati, `history.state` intatto.

### 9.1 Senza JavaScript / prerender

Vista elenco completa, leggibile e navigabile: sette `section` con `h2`,
listino, recapiti, link `tel:` e "Apri in Maps". La prenotazione mostra il
testo "Chiamaci" con il numero di esempio (niente anello interattivo). Il
quadrante SVG è nel DOM ma nascosto da `@media (scripting: none)`.

---

## 10. Porting nel sito

- Dentro `novanta/` **nessun import fuori da `novanta/`** tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` e `react`.
- Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `history`, `Intl` con fuso a livello di modulo: solo in effetti, handler o
  funzioni chiamate da effetti. Il sito fa **prerender**.
- Nessun Lenis globale nel sito (`integrazione-sito.md` punto 4): non ci
  riguarda, non lo usiamo.
- Asset importati con `?url` / `?raw` di Vite, mai da `public/`.
- `ConceptBackButton` e `analytics` dello standalone **non** si copiano.
- Si portano: `src/pages/Concept15.tsx` e `src/pages/concepts/novanta/`. Poi
  rotta, `site.ts`, prerender, sitemap e immagine della vetrina come nel
  pilota (RIEPILOGO del pilota, punto 1).

---

## 11. Comandi

Dalla cartella `concepts/15-novanta/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite` su http://localhost:9150 (`/` e `*` → `/concept-15`) |
| `npm run build` | build in `dist/` |
| `npm run preview` | serve `dist/` su http://localhost:9151 (fallback SPA: `/concept-15` regge il ricaricamento) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: **verde prima di dire "fatto"** |
| `npm run size` | (scaffold) stampa i pesi gz dei chunk JS e CSS di `dist/` confrontandoli con §8 |

Porta personale: `npx vite --port 91xx --strictPort` (tabella di §4); chiudere
il proprio server alla fine, mai uccidere processi altrui.

Parametri di prova (`core/params.ts`):

| URL | Effetto |
|---|---|
| `/concept-15#gradi-90` | apre con il braccio a 90° (prenota) |
| `/concept-15?vista=elenco` / `?vista=quadrante` | forza la vista (la scelta salvata perde) |
| `/concept-15?oggi=2026-10-05` | data fissa per screenshot stabili (lunedì) |
| `/concept-15?invio=ko` | invio simulato che fallisce |
| `/concept-15?posto=preso` | la prima ora scelta risulta presa nel frattempo, una volta |

Per svuotare la memoria del concept:
`localStorage.removeItem('novanta:vista'); sessionStorage.removeItem('novanta:invito')`.

Screenshot: regole di `docs/lab-operativo.md` (font di Google serviti con
`page.route` + curl, `document.fonts.ready`, scatti della finestra). Non
servono gli args SwiftShader: niente WebGL.

---

## 12. Checklist per chi scrive codice

- `design-taste-frontend` e `full-output-enforcement`: niente file troncati.
- Solo i tuoi file (§4). Ciò che è condiviso passa da store, runtime,
  geometria, rotore, token: non duplicare costanti né matematica polare.
- Nessun `requestAnimationFrame`, `setInterval`, animazione JS o `setState`
  per frame fuori dal ticker; nessuna lettura di layout nel ticker.
- Nessun hex fuori da `styles/tokens.*`; nessun testo visibile fuori da
  `content/*`.
- Nessun accesso al browser a livello di modulo.
- Il braccio non passa mai sopra il testo; nessun elemento nelle zone del
  bottone del sito (§7.4).
- Quadrante SVG `aria-hidden`; braccio e anello `role="slider"` con
  `aria-valuetext` parlante aggiornato a fine movimento; `aria-live` solo per
  titolo dell'angolo ed esito della prenotazione.
- Target ≥ 48 px per la manopola, ≥ 44 px per le parole del quadrante.
- Reduced motion rispettato; niente lampeggi (> 3 al secondo).
- Prima di consegnare: `npm run check` verde e zero errori in console a 1440 e
  375.
