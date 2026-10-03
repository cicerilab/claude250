# Scaffold engineer · Concept 15 · NOVANTA

Ondata 3, prima dei section-builder. Documento vincolante per chi scrive
codice nell'ondata 3: comandi, elenco definitivo delle sezioni e file
esclusivi, struttura della pagina, API esatte di `core/`, `state/`,
`layout/`, ordine dei CSS, contratti tra section-builder, stub consegnati,
problemi aperti.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, tutti i documenti in
`concepts/15-novanta/docs/` (in particolare tech-architect §3-§12,
ux-architect §1, §2, §5, §6 e "Sezioni da costruire", le "Richieste allo
scaffold" di motion-designer §7, interaction-designer §9, vector-artist §7,
art-director §4, copywriter §8, photo-editor), `DESIGN.md`, il pilota
(`concepts/10-torchio/docs/scaffold-engineer.md` e il suo codice) e tutto il
codice dell'ondata 2 (`dial/`, `motion/`, `interaction/`, `content/`,
`styles/tokens.*`, `assets/`). I moduli dello scaffold sono costruiti sugli
import e sulle firme che quei file usano davvero.

---

## 0. Esito

| Controllo | Esito |
|---|---|
| `npm install` | verde (180 pacchetti, versioni esatte di tech-architect §1, lockfile creato) |
| `npm run typecheck` (strict, `noUncheckedIndexedAccess`, `noUnused*`) | **verde su tutto `src/`**, compresi i file di dial, motion, interaction, content, assets |
| `npm run typecheck:node` | verde |
| `npm run lint` | verde, zero errori e zero avvisi |
| `npm run build` | verde. JS del concept **14,0 KB gz** (budget 60), react 51,0 KB gz, iniziale totale 66,3 KB gz (budget 115), CSS **5,9 KB gz** (budget 24) |
| `npx vite --port 9150 --strictPort` + Playwright (Chromium di `/opt/pw-browsers`, font serviti con curl) | **zero errori e zero avvisi in console** a 1440×900, 375×667, 1440 `?vista=elenco#gradi-90`, 375 `#gradi-90` con reduced motion, 1024×500 (elenco automatico) |
| Prova funzionale | 1440: `bordo`, r 334, perno (24, 486), Palco da x 554; 375: `fondo`, r 143, perno (187,5, 593), basamento 62; 6 angoli `inert` in quadrante, 0 in elenco; clic su "Prenota" → 90°, hash `#gradi-90` (push), fuoco su `gradi-90-titolo`; Indietro → 0°, hash tolto; "Leggi in elenco" → elenco, `novanta:vista` salvato, scroll della pagina libero; "Torna al quadrante" → memoria tolta; 1024×500 → elenco automatico con la riga `role="status"` |

Screenshot guardati: `concepts/15-novanta/qa/scaffold/1440.png`, `375.png`,
`1440-elenco.png`, `375-g90-reduced.png`, `1024x500-auto.png`. Si vede: il
campo albicocca pieno, il titolo dell'angolo 0° con il fondo appoggiato alla
linea di lettura (y 486 a 1440), la colonna da x 554, la maschera sfumata
quando il corpo continua sotto (375), la vista elenco con numero, mini arco e
titolo su due colonne. **Testata, quadrante e piede sono stub senza stile**
(si sovrappongono in alto a sinistra): li disegnano i section-builder.

Server chiuso alla fine.

---

## 1. Comandi

Dalla cartella `concepts/15-novanta/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (c'è `package-lock.json`) |
| `npm run dev` | Vite su http://localhost:9150 (`/` e qualsiasi percorso → `/concept-15`, con query e hash conservati) |
| `npx vite --port 91xx --strictPort` | server personale di un section-builder (porte in §2.2) |
| `npm run build` | build in `dist/` |
| `npm run preview` | `dist/` su http://localhost:9151 |
| `npm run typecheck` / `typecheck:node` / `lint` | come nel pilota |
| `npm run check` | typecheck + lint + build: **da lanciare prima di dire "fatto"** |
| `npm run size` | dopo il build: pesi gz di JS e CSS contro il budget di tech-architect §8 |

URL di prova (`core/params.ts`, `core/hash.ts`):

| URL | Effetto |
|---|---|
| `/concept-15#gradi-90` | braccio già a 90°, nessuna animazione d'arrivo |
| `/concept-15#gradi-47` | arrotondato a 60, URL corretto con `replace` |
| `/concept-15?vista=elenco` / `?vista=quadrante` | forza la vista per questa visita (vince sulla memoria) |
| `/concept-15?oggi=2026-10-05` | data fissa (lunedì) per screenshot stabili |
| `/concept-15?invio=ko` (o `?simula=rete`) | `store.get().simula.invioKo === true` |
| `/concept-15?posto=preso` (o `?simula=posto`) | `store.get().simula.postoPreso === true` |
| `/concept-15?motivo=spalla` | `store.get().motivoIniziale === 'spalla'` |

Memoria del concept nel browser:
`localStorage.removeItem('novanta:vista'); localStorage.removeItem('novanta:prenotazione'); sessionStorage.removeItem('novanta:invito')`.

Script di screenshot usato (font serviti con curl, console raccolta):
`/tmp/claude-0/-home-user-claude250/72613ce9-a18f-5d71-bb71-d39c705d752e/scratchpad/scaffold-15/shot.mjs`
(si può copiare cambiando porta e casi).

---

## 2. Sezioni definitive e section-builder

### 2.1 Scelta

L'ux-architect elenca 12 "sezioni da costruire", il tech-architect 8
section-builder. Elenco definitivo: **9 section-builder**.

| Voce ux-architect | Dove finisce |
|---|---|
| `scheletro-testata` | **scaffold** (link di salto, bottone del sito, regioni live, vista e geometria, hash e storia, parametri, memoria, `inert`, `apri_concept`: già fatti) + **zero** (testata) + **quadrante** (basamento e passi ±30°) |
| `quadrante` | **quadrante** |
| `campo-lettura` | **scaffold** (`layout/Angolo.tsx`, `layout/Palco.tsx`, `styles/layout.css`: linea di lettura, colonna, area che scorre con maschera e "continua sotto", angoli sovrapposti) + **quadrante** (`LetturaGradi.tsx`: il numero grande che scorre). La dissolvenza è già in `motion/motion.css` |
| `angolo-0-da-zero` | **zero** |
| `angolo-30-primo-incontro` | **primo-incontro** |
| `angolo-60-trattamenti` | **trattamenti** |
| `settimana-a-ruota` | **anello** (nuovo: il 90° del tech-architect era troppo per un agent solo) |
| `modulo-prenotazione` | **prenota** |
| `angolo-120-osteopatia` | **osteopatia** |
| `angolo-150-esercizi` | **esercizi** |
| `angolo-180-prezzi-dove` | **prezzi-dove** |
| `vista-elenco` | **scaffold** (impaginazione elenco di tutti gli angoli, numero e mini arco accanto al titolo in `Angolo`, scroll e fuoco) + **zero** (riga del passaggio automatico e piede) + **anello** (anello in versione elenco) |

### 2.2 Tabella "section-builder → file esclusivi"

Percorsi relativi a `src/pages/concepts/novanta/`. Ogni builder scrive anche
il suo `docs/section-builder-<nome>.md` (cartella `concepts/15-novanta/docs/`).
I file marcati *stub* esistono già: si riscrivono per intero. Gli altri si
creano. Nessuno tocca file non suoi: le richieste vanno nel proprio doc.

| Section-builder | File esclusivi | Porta |
|---|---|---|
| **quadrante** | `sections/Quadrante/Quadrante.tsx` *stub*, `Braccio.tsx`, `LetturaGradi.tsx`, `ParoleAngoli.tsx`, `Basamento.tsx` (basamento mobile, passi ±30°, fascia a 90°), `useBraccio.ts`, `quadrante.css` *stub* | 9152 |
| **zero** | `sections/Zero/Zero.tsx` *stub*, `zero.css` *stub*; `sections/Testata/Testata.tsx` *stub*, `testata.css` *stub*; `sections/Elenco/AvvisoElenco.tsx` *stub*, `Piede.tsx` *stub*, `elenco.css` *stub* | 9153 |
| **primo-incontro** | `sections/PrimoIncontro/PrimoIncontro.tsx` *stub*, `primo-incontro.css` *stub* | 9154 |
| **trattamenti** | `sections/Trattamenti/Trattamenti.tsx` *stub*, `trattamenti.css` *stub* | 9155 |
| **prenota** | `sections/Prenota/Prenota.tsx` *stub*, `Modulo.tsx`, `Esito.tsx`, `invio.ts`, `ics.ts`, `prenota.css` *stub* | 9156 |
| **anello** | `sections/Prenota/Anello.tsx` *stub*, `OreLibere.tsx`, `Controllo.tsx`, `useAnello.ts`, `calendario.ts`, `anello.css` *stub* | 9150 (libera dopo lo scaffold) |
| **osteopatia** | `sections/Osteopatia/Osteopatia.tsx` *stub*, `osteopatia.css` *stub* | 9157 |
| **esercizi** | `sections/Esercizi/Esercizi.tsx` *stub*, `esercizi.css` *stub* | 9158 |
| **prezzi-dove** | `sections/PrezziDove/PrezziDove.tsx` *stub*, `prezzi-dove.css` *stub* | 9159 |

Ogni componente montato da `Novanta.tsx` è un **default export senza prop**
(`Quadrante`, `Testata`, `AvvisoElenco`, `Piede`, `Zero`, `PrimoIncontro`,
`Trattamenti`, `Prenota`, `Osteopatia`, `Esercizi`, `PrezziDove`); `Anello` e
`Controllo` sono default export senza prop montati da `Prenota.tsx`.

---

## 3. File consegnati

**Solo standalone [S]** (non si portano): `package.json` (+ script `size`),
`package-lock.json`, `vite.config.ts` (alias `@`, dev 9150, preview 9151,
`strictPort`, es2020, chunk `react`), `tsconfig.json`, `tsconfig.app.json`,
`tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `scripts/size.mjs`,
`index.html` (`lang="it"`, title e description di `META`, `theme-color`
`#F4D5C0`, `color-scheme: light`, favicon, preconnect, fondo albicocca
inline), `src/main.tsx` (StrictMode), `src/App.tsx` (BrowserRouter con i
flag v7, `/concept-15` lazy, tutto il resto → redirect con query e hash),
`src/vite-env.d.ts`, `src/lib/analytics.ts` e
`src/components/ConceptBackButton.tsx` (copie del pilota).

**Si portano [P]**: `src/pages/Concept15.tsx`, e in
`src/pages/concepts/novanta/`: `index.ts`, `Novanta.tsx`, `core/*`,
`state/*`, `layout/*`, `styles/base.css`, `styles/layout.css`.

**Stub** (§2.2): passano ai proprietari, lo scaffold non li tocca più. Gli
stub di `Zero`, `Testata`, `Quadrante` (solo il `nav` delle parole),
`AvvisoElenco` e `Piede` sono già funzionanti ma senza stile, per poter
provare la navigazione; gli altri rendono `<Angolo gradi={N}>{null}</Angolo>`;
`Anello` rende `null`.

---

## 4. La pagina montata da `Novanta.tsx`

```html
<div class="nov-root" data-modo="quadrante|elenco" data-geo="bordo|fondo"
     data-attivo="0|30|…|180" data-dir="avanti|indietro"
     data-motion="full|reduced" data-pronto="0|1" data-tastiera="0|1"
     style="--nov-r: 334px; --nov-perno-x: 24px; --nov-perno-y: 486px; --nov-basamento: 0px; --nov-vv-h: 900px">
  <a class="nov-salto" href="#gradi-{attivo}" data-nov-origine="salto">Salta al contenuto</a>
  <a class="nov-salto" href="#gradi-90" data-nov-origine="prenota">Vai alla prenotazione</a>
  <button class="cl-backbtn">← Torna in Ciceri Lab</button>     <!-- del sito -->
  <Testata/>                                                    <!-- header -->
  <AvvisoElenco/>                                               <!-- role=status, solo elenco automatico -->
  <Quadrante/>                                                  <!-- nav + SVG + braccio + LetturaGradi + basamento -->
  <main id="contenuto" class="nov-main">
    <div class="nov-palco" data-nov-ix-scorre>
      <ol id="nov-angoli" class="nov-angoli">
        <Zero/> <PrimoIncontro/> <Trattamenti/> <Prenota/> <Osteopatia/> <Esercizi/> <PrezziDove/>
      </ol>
    </div>
  </main>
  <Piede/>                                                      <!-- footer, solo elenco -->
  <p class="nov-sr" aria-live="polite"></p>                     <!-- nome dell'angolo, cambio di vista -->
</div>
```

Ogni angolo (`layout/Angolo.tsx`):

```html
<li class="nov-angolo" data-gradi="N" data-stato="attivo|entra|esce|spento" [inert aria-hidden]>
  <section id="gradi-N" class="nov-angolo__sezione [--libera] [className]" aria-labelledby="gradi-N-titolo">
    <div class="nov-angolo__testa">                             <!-- quadrante: spazio del numero grande; elenco: numero + mini arco -->
      <p class="nov-angolo__gradi" aria-hidden="true">N<span class="nov-angolo__simbolo">°</span></p>
      <svg class="nov-arco nov-arco--mini nov-angolo__mini" aria-hidden="true">…</svg>
    </div>
    <h2 id="gradi-N-titolo" class="nov-angolo__titolo" tabindex="-1">ANGOLI_TESTI[N].titolo</h2>
    <div class="nov-angolo__corpo" data-nov-ix-scorre [data-continua="1"]>
      {children}
      <p class="nov-sr">Il testo continua sotto: scorri quest'area.</p>   <!-- hidden se non serve -->
    </div>
    <div class="nov-angolo__lato">{lato}</div>                  <!-- solo se passato -->
  </section>
</li>
```

### 4.1 Cosa fa al mount, in quest'ordine

1. Inizializzatore di `useState` (prima di ogni render delle sezioni):
   `runtime.reset()`, `azzeraStoria()`, `inizializzaStore({ search, hash,
   reducedMotion, oggi })`, misura del viewport, `decidiModo()`,
   `aggiornaModo()`. Il primo render è già nella vista e all'angolo giusti.
2. `useLayoutEffect`: variabili del perno sulla radice (`applicaModo`);
   frammento: `#gradi-47` → `replace` a `#gradi-60`, sconosciuto → tolto; in
   elenco con frammento, scroll alla sezione.
3. `data-pronto="1"` dopo il primo effetto (da lì valgono le transizioni).
4. `track('apri_concept', { concept: 15 })` una volta (guardia StrictMode);
   titolo e description da `META` (rimessi allo smontaggio); fondo albicocca
   inline su html/body (`COLORI.albicocca`); `injectFonts()`; ascolto di
   `prefers-reduced-motion`; `ticker.attiva()`; `ascoltaAttivita(root)`;
   `osservaViewport(root, …)` (resize e visualViewport, decisione della
   vista con debounce 100 ms); `bloccaPagina(modo === 'quadrante')`;
   `ascoltaPopstate`; `preparaFoto(['attrezzi', 'ingresso'])`.
5. Allo smontaggio: tutto rimesso com'era (html/body: overflow, overscroll,
   fondo; titolo; description; font solo se aggiunti; ticker; ascoltatori;
   variabili e `data-tastiera` sulla radice).

### 4.2 Navigazione: richieste d'angolo

- **Link `#gradi-N`** ovunque nella pagina (parole del quadrante, "Prenota",
  link di salto, rimandi tra angoli): un solo ascoltatore delegato su
  `.nov-root`. Chiama `richiediAngolo(N, origine, true)` e fa
  `preventDefault`. L'origine viene da `data-nov-origine` sul link
  (`parola` di default in quadrante, `elenco` in elenco). Le sezioni **non**
  aggiungono gestori ai link `#gradi-N`: basta l'`href` (e
  `data-nov-origine="prenota"` sul bottone "Prenota").
- **Bottoni** che portano a un angolo (passi ±30°, Invio sullo slider):
  `richiediAngolo(a, 'passo' | 'tastiera', fuoco)`.
- **Indietro/Avanti**: `richiediAngolo(a, 'popstate', false)`.
- **Chi esegue**: in vista quadrante `useBraccio` (si registra con
  `registraGuida()`, vedi §6.1); se nessun braccio è registrato (vista
  elenco, o quadrante stub) la esegue `Novanta.tsx`: `impostaAttivo` subito;
  in elenco `replace` dell'hash e scroll alla sezione; in quadrante
  `annotaArrivo`.
- **Fuoco**: se `richiesta.fuoco`, `Novanta.tsx` porta il fuoco all'h2 quando
  `store.attivo === richiesta.angolo` (subito in elenco, all'arrivo del
  braccio in quadrante: il contenuto cambia vicino all'arrivo, l'angolo non è
  più `inert`). Il braccio non deve spostare il fuoco da sé.
- **Cambio di vista** (testata): `impostaVista('elenco' | 'auto')`. Lo
  scaffold ricalcola subito, uscendo dall'elenco prende come angolo la
  sezione più visibile, porta il fuoco all'h2 dell'angolo corrente e annuncia
  "Vista elenco." / "Vista quadrante.".
- **Annunci**: la regione live della radice dice `ANNUNCI.angolo(attivo)` a
  ogni cambio d'angolo in quadrante (non all'arrivo). Gli esiti della
  prenotazione hanno la loro regione (section-builder-prenota).

---

## 5. Impaginazione (`styles/layout.css`)

### 5.1 Variabili per i section-builder

Scritte da JS sulla radice (mai per frame, solo al resize): `--nov-r`,
`--nov-perno-x`, `--nov-perno-y`, `--nov-basamento` (px; 0 in bordo),
`--nov-vv-h`. Derivate in CSS (si possono usare nei CSS di sezione):

| Variabile | bordo (1440×900) | fondo (375×667) |
|---|---|---|
| `--nov-fascia-alta` | 72px (bottone del sito a sinistra, testata a destra) | 48px (testata) |
| `--nov-colonna-x` | `R + 220` = 554px | 0 |
| `--nov-palco-inizio` / `--nov-palco-fine` | 72 / 0 | 48 / `100% − perno-y + R + 52` (fino alla parola attiva sopra la manopola); a 90° `basamento + 64` |
| `--nov-linea-y` | y del perno (486) | y del perno |
| `--nov-titolo-blocco` | 2 righe di h2 | 2 righe di h2 |
| `--nov-spazio-gradi` | altezza del numero grande (`--nov-fs-gradi` × lh; a 90° `--nov-fs-gradi-prenota`) | idem |
| `--nov-fascia-h` | — | 64px (quadrante a fascia a 90°) |

`data-tastiera="1"` sulla radice quando il visualViewport è più basso della
finestra di oltre 120 px (tastiera del telefono): in fondo il Palco arriva
fino in fondo.

### 5.2 Vista quadrante

- Radice alta `var(--nov-vv-h)`, `overflow: hidden`; `<main>` assoluto a tutta
  radice con `pointer-events: none`, il Palco con `pointer-events: auto`.
  Livelli: contenuto 1, quadrante 2, testata 3, salto 4 (token).
- **Palco**: da `--nov-colonna-x` al bordo destro, da `--nov-palco-inizio` a
  `--nov-palco-fine`; `container: nov-palco / inline-size`.
- **Angoli sovrapposti** (`position: absolute; inset: 0`): `esce` e `spento`
  nascosti (la dissolvenza la fa `motion.css`), `spento` con
  `content-visibility: hidden` dopo il mount.
- **Sezione** a griglia: testa (spazio del numero), titolo, corpo che scorre
  (`overflow-y: auto`, maschera 16 px quando continua, frase per il lettore
  di schermo). Tornando attivo il corpo riparte dall'alto.
- **bordo**: colonna `--nov-colonna` (520); la testa è alta
  `linea-y − palco-inizio − titolo-blocco` e il titolo ha altezza minima di
  2 righe allineata in basso: **il fondo dell'h2 poggia sulla linea di
  lettura** per titoli di 1 o 2 righe. Il numero grande (LetturaGradi) sta
  nello spazio della testa, sopra il titolo.
- **Lato** (prop `lato` di `Angolo`, foto a filo del bordo destro): seconda
  colonna, `justify-self: end`, visibile solo con il Palco largo almeno
  56rem (520 + 48 + 280 + 48) e solo in bordo; in elenco desktop sotto il
  testo (max 22rem); su mobile mai (la fascia del 180° va nel corpo).
- **fondo**: margine `--nov-margine` ai lati, testa alta quanto il numero
  grande, titolo e corpo sotto.
- **Impaginazione libera** (`impaginazione="libera"`, solo 90°): sezione
  `display: block` a tutta altezza, testa nascosta, corpo senza padding né
  scroll. Il section-builder-prenota dispone titolo (h2 di `Angolo`),
  anello, controllo e modulo, e **lascia libero in alto a sinistra lo spazio
  del numero** (`--nov-spazio-gradi`).

### 5.3 Vista elenco

Pagina verticale, angoli in colonna con `--nov-vuoto-elenco` tra l'uno e
l'altro, gabbia di 75rem, margini `--nov-margine`, fondo pagina con lo
spazio del basamento. Da 47.5em: numero + mini arco a sinistra (10-15rem),
titolo e corpo a destra (corpo max `--nov-colonna`, libero a 90°). Scroll
nativo, nessun `inert`, `scroll-padding` su html: 80 px in alto da 640 px
(bottone del sito), basamento in basso sotto.

### 5.4 Ordine dei CSS

In `Novanta.tsx`: `styles/tokens.css` → `styles/base.css` →
`styles/layout.css` → `dial/arco.css` → `motion/motion.css` →
`interaction/interaction.css` → CSS di sezione (importati dai componenti, in
ordine di montaggio: testata, elenco, quadrante, angoli).

`base.css`: reset con `:where()`, Lexend al corpo, `::selection`, h1/h2/h3
in Epilogue, utility `.nov-sr`, `.nov-salto`, `.nov-nota`, `.nov-quieto`,
`.nov-cifre`, `.nov-lista` (lista senza puntini).

---

## 6. API dei moduli (firme esatte)

Percorsi relativi a `src/pages/concepts/novanta/`. Nessun modulo tocca
`window`/`document` a livello di modulo.

### 6.1 `core/`

```ts
// ticker.ts · l'UNICO requestAnimationFrame (fasi 'update' → 'write')
export type FaseTicker = 'update' | 'write';
export type TickFn = (dt: number, now: number) => boolean | void;  // true = ancora un frame
export const ticker: { add(fn: TickFn, fase?: FaseTicker): () => void; wake(): void;
  readonly running: boolean; attiva(): () => void; readonly abbonati: number };
export const FASI_TICKER: readonly FaseTicker[];

// guida.ts · chi esegue le richieste d'angolo
export function registraGuida(): () => void;      // useBraccio, in un effetto, finché è in vista quadrante
export function guidaPresente(): boolean;

// hash.ts
export function leggiHash(hash: string): { tipo: 'nessuno' } | { tipo: 'angolo'; angolo: Angolo; esatto: boolean } | { tipo: 'sconosciuto' };
export function leggiAngoloDaHash(hash: string): Angolo | null;
export function scriviHash(a: Angolo, modo: 'push' | 'replace'): void;   // conserva history.state
export function annotaArrivo(a: Angolo): void;     // onFermo del braccio: push, replace entro 800 ms, niente se già scritto
export function segnaScritto(a: Angolo | null): void;
export function togliHash(): void;
export function ascoltaPopstate(fn: (a: Angolo) => void): () => void;   // solo Novanta.tsx
export function azzeraStoria(): void;
export const FINESTRA_STORIA_MS = 800;

// ids.ts
export const ID_CONTENUTO = 'contenuto';
export const ID_ANGOLI = 'nov-angoli';            // aria-controls del braccio
export function idAngolo(a: Angolo): string;      // 'gradi-90'
export function idTitolo(a: Angolo): string;      // 'gradi-90-titolo'

// scorre.ts
export function corpoAttivo(radice?: ParentNode | null): HTMLElement | null;  // per useRotella({ scrollInterno })

// modo.ts
export const FASCIA_ALTA = 72, BASAMENTO_BASE = 62, REM_TESTO_GRANDE = 20, ISTERESI_PX = 40,
  COLONNA_MINIMA = 360, RIENTRO_COLONNA = 220, RAGGIO_FONDO_MAX = 190;
export const RAGGIO_BORDO: { min: 220; max: 480 };
export interface MisureModo { w; h; vvH; rem; safeBasso; preferenza: PreferenzaVista; modoPrima: Modo | null }
export interface DecisioneModo extends ModoCalcolato { perno: { x; y; r }; basamento: number }
export function decidiModo(m: MisureModo): DecisioneModo;   // pura
export function misureCorrenti(preferenza, modoPrima): MisureModo;
export function applicaModo(root: HTMLElement, d: DecisioneModo): void;   // runtime.perno, variabili, store

// viewport.ts
export function misuraViewport(): void;
export function osservaViewport(root: HTMLElement, onCambio: () => void): () => void;
export const ATTESA_RESIZE = 100, SOGLIA_TASTIERA = 120;

// pagina.ts (solo Novanta.tsx)
export function bloccaPagina(blocca: boolean): void;
export function impostaFondoPagina(colore: string): void;
export function ripristinaPagina(): void;

// capabilities.ts
export function mediaQuery(q: string): MediaQueryList | null;
export function corrisponde(q: string): boolean;
export function ascoltaMedia(q: string, fn: (vera: boolean) => void): () => void;
export function prefersReducedMotion(): boolean;
export function ascoltaReducedMotion(fn: (ridotto: boolean) => void): () => void;
export function isCoarsePointer(): boolean;
export function supportaScripting(): boolean;
export function remPx(): number;          // sonda, solo in handler/effetti
export function safeAreaBasso(): number;  // sonda, solo in handler/effetti

// fonts.ts
export const FONT_PRECONNECT, FONT_ATTESA_MAX = 3000;
export function injectFonts(url?: string): () => void;
export function fontsReady(specs?: readonly string[], attesaMax?: number): Promise<void>;   // non rifiuta mai

// foto.ts
export const SIZES_FOTO = '(min-width: 47.5em) 280px, calc(100vw - 40px)';   // usatelo come `sizes` delle foto
export function preparaFoto(chiavi: readonly ChiaveFoto[]): () => void;

// params.ts
export interface ParametriNovanta { vista: 'elenco' | 'quadrante' | null; oggi: string | null;
  invioKo: boolean; postoPreso: boolean; motivo: IdMotivo | null }
export function leggiParametri(search: string): ParametriNovanta;
export function eDataIso(v: string): boolean;
export function eMotivo(v: unknown): v is IdMotivo;

// links.ts
export const LAB_URL = '/', CICERILAB_URL = 'https://cicerilab.com';
export const MAPS_URL: string;       // Google Maps, query RECAPITI.mapsQuery
export const TELEFONO_URL: string;   // RECAPITI.telefonoHref (numero di esempio)
export const EMAIL_URL: string;      // RECAPITI.emailHref (.example)
```

### 6.2 `state/runtime.ts` (valori caldi, mai in React state)

```ts
export type StatoMoto = 'fermo' | 'trascina' | 'aggancio' | 'inerzia';
export interface Rotazione { deg: number; target: number; vel: number; stato: StatoMoto }  // = StatoRotazione del rotore
export interface Viewport { w: number; h: number; vvH: number; dpr: number }
export interface Perno { x: number; y: number; r: number }
export const runtime: {
  braccio: Rotazione; anello: Rotazione;   // scrive SOLO il rotore
  viewport: Viewport;                      // core/viewport.ts
  perno: Perno;                            // core/modo.ts (px del viewport)
  pernoAnello: Perno;                      // Anello.tsx (ResizeObserver)
  ultimoInput: number;                     // interaction/attivita.ts
  reset(): void;                           // azzera SENZA cambiare gli oggetti
};
```

### 6.3 `state/store.ts` (valori lenti)

```ts
export type Modo = 'quadrante' | 'elenco';
export type Geometria = 'bordo' | 'fondo';
export type PreferenzaVista = 'auto' | 'elenco' | 'quadrante';
export type MotivoElenco = 'finestra-bassa' | 'testo-grande' | 'non-ci-sta' | null;
export type SlotId = string;                                   // 'AAAA-MM-GG@HH:MM'
export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
export type AvvisoPrenota = 'posto-preso' | 'controllo-spostato' | 'settimana-piena' | null;
export type CampoPrenota = 'nome' | 'telefono' | 'motivo';
export type OrigineRichiesta = 'parola' | 'prenota' | 'hash' | 'popstate' | 'salto' | 'passo' | 'tastiera' | 'elenco';
export interface RichiestaAngolo { angolo: Angolo; n: number; origine: OrigineRichiesta; fuoco: boolean }
export interface PrenotazioneSalvata { prima: SlotId; controllo: SlotId | null }
export interface StatoPrenota {
  prima: SlotId | null; controllo: SlotId | null; ciclo: boolean;
  campi: { nome: string; telefono: string; motivo: string };
  errori: Partial<Record<'nome' | 'telefono', string>>;
  invio: StatoInvio; avviso: AvvisoPrenota;
  elencoOreAperto: boolean;                   // "Tutte le ore libere"
  salvata: PrenotazioneSalvata | null;        // S14, da localStorage
}
export interface NovantaState {
  attivo: Angolo; richiesta: RichiestaAngolo | null; raggio: number;
  precedente: Angolo | null; direzione: 'avanti' | 'indietro';
  preferenzaVista: PreferenzaVista; modo: Modo; geometria: Geometria;
  motivoElenco: MotivoElenco; quadrantePossibile: boolean;
  reducedMotion: boolean; invitoFatto: boolean; arrivoConHash: boolean;
  oggi: string | null; motivoIniziale: IdMotivo | null;
  prenota: StatoPrenota; simula: { invioKo: boolean; postoPreso: boolean };
}
export const store: { get(): NovantaState; set(p): void; subscribe(fn): () => void };
export function useNovanta<T>(sel: (s: NovantaState) => T, isEqual?: (a: T, b: T) => boolean): T;

// azioni: angolo e vista
export function richiediAngolo(a: Angolo, origine: OrigineRichiesta, fuoco?: boolean): void;  // le sezioni chiamano QUESTA
export function impostaAttivo(a: Angolo): void;      // useBraccio (via contenutoDuranteIlMoto + creaCadenza) e Novanta.tsx
export function impostaVista(p: PreferenzaVista): void;   // testata; 'auto' cancella la memoria
export function segnaInvito(): void;                 // sessionStorage 'novanta:invito'
export function aggiornaModo(m: ModoCalcolato, raggio: number): void;   // solo core/modo.ts
export function impostaReducedMotion(r: boolean): void;                  // solo Novanta.tsx
export function impostaOggi(oggi: string): void;                         // solo Novanta.tsx / test
// azioni: prenotazione
export function scegliPrima(slot: SlotId | null): void;
export function spostaControllo(slot: SlotId | null): void;
export function impostaCiclo(ciclo: boolean): void;
export function aggiornaCampo(campo: CampoPrenota, valore: string): void;
export function impostaErrori(e: ErroriPrenota): void;
export function impostaInvio(s: StatoInvio): void;
export function impostaAvviso(a: AvvisoPrenota): void;
export function apriElencoOre(aperto: boolean): void;
export function salvaPrenotazione(prima: SlotId, controllo: SlotId | null): void;  // solo date e ore in memoria
export function ricominciaPrenota(): void;            // "Cambia" (S13): tutto a zero tranne prima/controllo/elenco ore
// utilità e selettori
export function inizializzaStore(o: { search; hash; reducedMotion; oggi }): NovantaState;  // solo Novanta.tsx
export function statoIniziale(): NovantaState;
export function dataIso(d: Date): string;
export function eSlotId(v: unknown): v is SlotId;
export const selAttivo, selRichiesta, selRaggio, selModo, selGeometria, selReducedMotion, selOggi, selPrenota, selElenco;
```

Regole: le sezioni chiamano le azioni, mai `store.set`. `useNovanta`
accetta selettori inline; se il selettore costruisce oggetti, passare
`isEqual`. **Nome, telefono e motivo non vanno mai nello storage.** In
memoria: `novanta:vista` (local, solo scelta a mano), `novanta:invito`
(session, decisione dell'orchestratore), `novanta:prenotazione` (local, solo
`{ prima, controllo }`).

### 6.4 `state/slot.ts` (conversioni pure)

```ts
export function slotId(data: string, ora: string): SlotId;            // '2026-10-09@18:00'
export function leggiSlot(id: SlotId): { data: string; ora: string } | null;
export function dataDaSlot(id: SlotId): Date | null;
export function giornoSettimana(d: Date): IndiceGiorno;               // lunedì 0 … domenica 6
export function quandoDaSlot(id: SlotId): Quando | null;              // per le frasi del copywriter
export function giorniTra(a: string, b: string): number;
```

### 6.5 `state/persist.ts`

Copia del pilota con `CHIAVI = { vista, invito, prenotazione }` (prefisso
`novanta:`); `leggi`, `scrivi`, `rimuovi`, `leggiJSON`, `scriviJSON`,
`scriviJSONRimandato`, `annullaRimandato`, `svuotaRimandati`; tutto in
try/catch.

### 6.6 `layout/`

```ts
// Angolo.tsx
export interface AngoloProps {
  gradi: Angolo; children: ReactNode;
  className?: string;                      // sulla <section>: i CSS di sezione partono da qui
  lato?: ReactNode;                        // foto a filo del bordo destro (0°, 60°, 180°)
  impaginazione?: 'colonna' | 'libera';    // 'libera' solo a 90°
}
export default function Angolo(p: AngoloProps): JSX.Element;
// Palco.tsx
export default function Palco({ children }: { children: ReactNode }): JSX.Element;
```

---

## 7. Contratti per i section-builder

### 7.1 Tutti

- Testi solo da `content/testi.ts`; il titolo h2 lo mette `Angolo`, non va
  ripetuto. Un solo h1 (il marchio, nella testata).
- Nessun `requestAnimationFrame`, `setInterval`, animazione JS per frame
  fuori dal ticker; nessun hex; nessun accesso al browser a livello di modulo.
- Nessun elemento nella zona del bottone del sito: in alto a sinistra
  0-240 × 0-64 da 640 px in su; in basso a sinistra nei primi 222 px del
  basamento sotto.
- Link verso un angolo: `<a href="#gradi-N">` (e `data-nov-origine` se serve);
  bottoni: `richiediAngolo()`.
- Foto: `FOTO[chiave]` (se manca, niente elemento), `sizes={SIZES_FOTO}`,
  `width`/`height`, `decoding="async"`; 0° `loading="eager"` +
  `fetchPriority="high"`, gli altri `loading="lazy"`.
- Fissi dentro un angolo non funzionano: l'`li` ha `translate` dalla
  dissolvenza e diventa il blocco contenitore. Usare `lato` o il flusso.

### 7.2 quadrante

- `Quadrante.tsx` rende il `nav aria-label={QUADRANTE.navAria}` con le sette
  parole (`.nov-ix-parola`, `data-gradi`, `href="#gradi-N"`,
  `aria-current="location"` sull'attiva), l'SVG `aria-hidden`
  (`<Arco variante="quadrante" raggio={store.raggio} …>`), il braccio
  `role="slider"` con `aria-controls={ID_ANGOLI}`, `LetturaGradi`,
  `Basamento`. In vista elenco il quadrante sparisce (ux §5.9: resta solo il
  basamento sotto 640 px, senza passi). Posizione dal perno: `left: calc(var(--nov-perno-x) - …)`,
  `top: calc(var(--nov-perno-y) - …)` o `runtime.perno`; raggio in React da
  `useNovanta(selRaggio)`.
- `useBraccio.ts`: `registraGuida()` in un effetto finché `modo ===
  'quadrante'`; all'avvio `rotore.vaA(store.attivo, { subito: true,
  silenzioso: true })`; a ogni `richiesta` nuova (`n` diverso) `rotore.vaA(
  richiesta.angolo)` (il fuoco lo fa lo scaffold); `onFermo(g)` →
  `aria-valuenow/-valuetext` e `annotaArrivo(angoloPiuVicino(g))` (non per
  `popstate`); `impostaAttivo` solo tramite `contenutoDuranteIlMoto` e
  `creaCadenza`; `useRotella({ scrollInterno: () => corpoAttivo(root) })`;
  invito con `consentito: () => s.modo === 'quadrante' && !s.reducedMotion
  && !s.invitoFatto && !s.arrivoConHash && s.attivo === 0`, `onFatto:
  segnaInvito`. Allo smontaggio o passando a elenco: `rotore.interrompi()`.
- `LetturaGradi.tsx`: in alto a sinistra del Palco (`left:
  var(--nov-colonna-x)` + margine in fondo, `top: var(--nov-palco-inizio)`),
  alto `--nov-spazio-gradi`: è lo spazio che la testa dell'angolo lascia
  libero. In elenco nascosto (il numero lo mostra `Angolo`).
- `Basamento.tsx` (fondo): alto `var(--nov-basamento)`, i primi 222 px
  liberi per il bottone del sito, passi ±30° da 360 px; in elenco solo la
  fascia (o niente: il piede ha già il margine).

### 7.3 zero

- `Testata`: bordo a destra della fascia alta (72 px), fondo in alto (48 px);
  "Leggi in elenco" / "Torna al quadrante" con `impostaVista('elenco' |
  'auto')`; quando `modo === 'elenco' && !quadrantePossibile` il ritorno al
  quadrante non si offre (la riga di `AvvisoElenco` dice perché).
- `AvvisoElenco`: `role="status"` solo se `motivoElenco !== null`.
- `Piede`: solo in elenco; firma, riga di finzione, crediti foto
  (`CREDITI_FOTO`), margine inferiore `var(--nov-basamento)`.
- `Zero`: "Prenota" = `<a href="#gradi-90" data-nov-origine="prenota">`.

### 7.4 prenota e anello (stesso angolo, due agent)

| Cosa | Proprietario |
|---|---|
| Impaginazione dell'angolo 90° (`impaginazione="libera"`, colonne, spazio del numero), istruzione, prezzo, campi, suggerimenti, validazione, invio simulato, esiti S7-S13, S15, regione live degli esiti, `.ics`, `track('demo_prenotazione')` | **prenota** |
| `Anello` (SVG, slider `role="slider"`, rotore dell'anello, indice, lettura al centro, arco del ciclo), `OreLibere` (disclosure con radio), `Controllo` (lettura del controllo, prima/dopo, "solo la prima visita" / "Aggiungi il controllo"), `calendario.ts` (slot dagli orari di `content/orari.ts` a partire da `store.oggi`), stati S0-S6, S10 lato anello, S14 lato anello, anello in vista elenco | **anello** |

Contratto tra i due, tutto via store (nessun import incrociato oltre ai
default export `Anello` e `Controllo` montati da `Prenota.tsx`):
- l'anello scrive `prima` (all'arrivo con `oggi`: la prima ora libera utile),
  `controllo`, `ciclo`, `elencoOreAperto`, `avviso` per
  `controllo-spostato` / `settimana-piena`;
- il modulo scrive `campi`, `errori`, `invio`, `salvata`
  (`salvaPrenotazione`), e per S10 `impostaAvviso('posto-preso')` +
  `impostaInvio('idle')` quando `simula.postoPreso` (una volta). L'anello,
  vedendo `avviso === 'posto-preso'`, spegne la tacca, la segna occupata,
  va alla prossima ora libera (`scegliPrima`, `spostaControllo`); il modulo
  mostra `PRENOTA.stati.postoPreso(perso, nuovo)` con `quandoDaSlot` e
  azzera `avviso` al successivo invio;
- le frasi con date usano `quandoDaSlot(id)` di `state/slot.ts`;
- `?motivo=`: il modulo precompila `campi.motivo` dal suggerimento con
  `id === store.motivoIniziale` (`PRENOTA.campi.suggerimenti`), una volta;
- `track('demo_prenotazione', { concept: 15, ciclo, vista: modo, geometria,
  origine: store.richiesta?.origine })`, mai nome, telefono o motivo.

### 7.5 primo-incontro, trattamenti, osteopatia, esercizi, prezzi-dove

`<Angolo gradi={N} className="nov-…">…</Angolo>`; foto con `lato` (60°:
`attrezzi`; 180°: `ingresso` in `lato` e `ingresso.fascia` nel corpo su
mobile). Mini archi: `<Arco variante="mini" geo="fondo" raggio={48} …>`
misurati in CSS (vector-artist §7). Il primo blocco del corpo è sempre quello
che conta: il resto scorre nel corpo.

---

## 8. Richieste allo scaffold raccolte

| Da | Richiesta | Esito |
|---|---|---|
| tech-architect §3, §4, §9, §11 | file [S], core/state/layout, base/layout.css, stub, `npm run size`, mount e smontaggio | fatto |
| motion §7.1-7.2 | `data-stato` attivo/entra/esce/spento; `entra` visibile, `esce` nascosto, niente transform/animation sul `li` dallo scaffold | fatto (il `li` ha solo `position`/`inset`) |
| motion §7.3 | niente `variabiliMotion()` inline sulla radice | fatto |
| motion §7.4 | `data-dir` nello stesso render di `data-attivo` | fatto (`direzione` cambia nella stessa azione) |
| motion §7.5 | `Rotazione` con `deg`, `target`, `vel`, `stato` | fatto |
| motion §7.6, art §3.1 | ordine dei CSS | fatto |
| motion / orchestratore | chiave dell'invito | **sessionStorage** `novanta:invito` |
| interaction §9 | `ascoltaAttivita(rootEl)`, `ultimoInput` a 0 nel reset, `interaction.css`, `data-nov-ix-scorre` sul Palco | fatto (anche sul corpo dell'angolo, che è l'area che scorre davvero) |
| vector §7.1-7.3 | perno bordo `x = base` (24), fondo `y = h − B − 12`, raggi da `raggioMassimoBordo/Fondo` | fatto (1440: r 334; 375: r 143) |
| vector §7.4 | favicon in `index.html` | fatto |
| art §4 | `FONT_CSS_URL`/`FONT_DA_CARICARE`; `raggioMaxFondo(w)` in fondo; `::selection`, font della radice, antialiased; fondo, `theme-color`, `color-scheme` in `index.html` | fatto |
| copywriter §8 | h2 da `ANGOLI_TESTI`; `TELEFONO_URL`, `MAPS_URL`; title/description da `META`; `?motivo=intervento` | fatto (`motivoIniziale` nello store, lo applica il modulo, §7.4) |
| photo-editor | `?url` con `vite/client` nei tipi | fatto |
| ux §1.1-1.3 | frammenti, storia (800 ms), parametri, memoria | fatto (vedi §9 per la memoria) |
| ux §6.1, §6.7, §6.9 | `inert` sulle non attive, fuoco all'h2 dopo salto e cambio di vista, elenco automatico (finestra bassa, testo grande, isteresi 40 px) | fatto |

---

## 9. Differenze consapevoli rispetto ai documenti

| Punto | Documento | Scelta | Perché |
|---|---|---|---|
| Section-builder | tech 8, ux 12 | 9 (§2) | prenota diviso in anello + modulo; scheletro, campo di lettura e vista elenco allo scaffold |
| Invito | ux: localStorage | sessionStorage | decisione dell'orchestratore |
| Prenotazione in memoria | tech: mai nello storage | solo `{ prima, controllo }` in localStorage | ux §1.3 e S14; niente dati personali |
| Richieste d'angolo | — | `richiediAngolo` nello store + `registraGuida` | le sezioni non conoscono il rotore; funziona anche senza quadrante (elenco, stub) |
| Area che scorre | Palco | corpo dell'angolo | il titolo resta sulla linea di lettura e il testo non passa sotto il numero |
| Preferenza vista | `'auto' \| 'elenco'` | + `'quadrante'` | `?vista=quadrante` |
| Stato in più | — | `richiesta`, `raggio`, `direzione`, `motivoElenco`, `quadrantePossibile`, `arrivoConHash`, `motivoIniziale`, `prenota.elencoOreAperto`, `prenota.salvata` | navigazione, Arco in React, riga dell'elenco, invito, `?motivo=`, S14 |
| Raggio fondo | `min(0,44w, 0,26vvH, 190)` | + `raggioMassimoFondo(w)` e `raggioMaxFondo(w)` | vector §7, art §4 |
| Colonna bordo | `r + 64 + 120` | `R + 220` (ux, DESIGN) | stessa misura dei wireframe |
| Prima pittura CSS | `@media (scripting)` | il primo render client è già giusto | il sito usa `createRoot` (niente HTML prerenderizzato del contenuto): il CSS di ripiego resta solo per i valori del perno |
| Script vista salvata in `index.html` | tech §3 | non messo | React decide la vista al primo render, prima della pittura |
| `?invio=ko` | anche `?simula=rete` / `?simula=posto` | entrambi | ux §8 |

---

## 10. Problemi nei file altrui

**Nessun errore di compilazione né di lint** nei file degli altri agent:
typecheck strict ed ESLint passano su `dial/`, `motion/`, `interaction/`,
`content/`, `styles/tokens.ts`, `assets/`.

Osservazioni non bloccanti:
- `DESIGN.md` §7 e `styles/tokens.css` §1.10 dicono "piano B, nessuna foto",
  ma `assets/foto/index.ts` ha tre foto (photo-editor): da allineare
  (art-director).
- `content/testi.ts` ridefinisce `GradiAngolo` invece di importare `Angolo`
  da `dial/geometria.ts`: compatibili per struttura, nessun problema.

---

## 11. Problemi aperti

1. **Font nella sandbox**: Chromium headless spesso non scarica Google
   Fonts; nelle prove servirli con `page.route` + curl (script in §1).
2. **Stub senza stile**: testata, quadrante e piede si sovrappongono in alto
   a sinistra al bottone del sito finché i loro builder non li disegnano.
3. **Porting**: `LAB_URL` da verificare; `ConceptBackButton` e
   `@/lib/analytics` non si copiano. Lo smontaggio completo si prova solo nel
   sito vero (qui tutte le rotte tornano a `/concept-15`).
4. `npm install` segnala `eslint@9.39.5` non più supportato: versione fissata
   dal tech-architect, nessun effetto sul bundle.
