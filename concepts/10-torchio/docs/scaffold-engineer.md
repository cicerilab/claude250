# Scaffold engineer · Concept 10 · IMPRONTA

Ondata 3, prima dei section-builder e dello shader-engineer. Documento
vincolante per chi scrive codice nell'ondata 3: comandi, struttura della
pagina, API esatte di `core/`, `state/`, `relief/`, come si registra un
blocco a rilievo, ordine dei CSS, stub consegnati, problemi aperti.

Letti: `docs/processo-agent.md`, tutti i documenti in `docs/` del concept (in
particolare `tech-architect.md` §3-§12, `integrazione-sito.md`, le sezioni
"contratti richiesti" di motion-designer §4, interaction-designer §11,
webgl-artist §10/§12, art-director §3.1/§4, vector-artist §5-§7, copywriter
§1/§9), le skill `design-taste-frontend` e `full-output-enforcement`, e tutto il
codice già scritto nell'ondata 2 (`motion/`, `interaction/`, `webgl/`,
`styles/tokens*`, `relief-fallback.css`, `content/`, `assets/svg/`). I miei
moduli sono costruiti sugli import e sulle firme che quei file usano davvero.
Fonti reali del sito: `/home/user/cicerilab/src/lib/analytics.ts` e
`/home/user/cicerilab/src/components/ConceptBackButton.tsx`.

---

## 0. Esito

| Controllo | Esito |
|---|---|
| `npm install` | verde (187 pacchetti, versioni esatte di tech-architect §1, lockfile creato) |
| `npm run typecheck` (`tsc -p tsconfig.app.json`, strict + `noUncheckedIndexedAccess` + `noUnused*`) | **verde su tutto `src/`**, compresi i file di motion, interaction, webgl-artist, content, assets |
| `npm run typecheck:node` (vite.config.ts) | verde |
| `npm run lint` (`eslint src`) | verde, zero avvisi |
| `npm run build` | verde. JS iniziale del concept 17,4 KB gz (budget 60), react+router 52,3 KB gz, CSS 6,9 KB gz (budget 20) |
| `npm run dev` + Playwright (Chromium di `/opt/pw-browsers`) su `/concept-10` | **zero errori in console** a 1440 e 375, anche con `?gl=0&carta=grafite#banco` e con reduced motion + `?prova=libro` |
| Prova funzionale nel browser (import dei moduli dal dev server) | ordine delle fasi del ticker, aggiunta durante il frame (parte al frame dopo), dt 1/60 al risveglio, lenis guidato dal ticker, `runtime.scrollY` = scroll reale, `rectView = rectDoc − scrollY`, `setPressione` limitato a 0..1, visibilità IO, bozza salvata e ritrovata dopo il ricaricamento, carta salvata: tutto come da contratto |

Screenshot: `/tmp/claude-0/scaffold-shots/1440.png`, `375.png`,
`1440-gl0-grafite.png`, `375-reduced.png`. Mostrano la carta piena con la
fibra del fallback (Citrino, Grafite) e il bottone "Torna in Ciceri Lab" del
sito in alto a sinistra (desktop) e in basso a sinistra (375): le sezioni sono
stub vuoti, quindi non c'è altro.

---

## 1. Comandi

Dalla cartella `concepts/10-torchio/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | installa le versioni esatte (c'è `package-lock.json`) |
| `npm run dev` | Vite su http://localhost:8080 (`/` e qualsiasi percorso → `/concept-10`) |
| `npm run build` | build in `dist/` |
| `npm run preview` | serve `dist/` su http://localhost:4173 (fallback SPA di Vite: `/concept-10` regge il ricaricamento) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | typecheck di `vite.config.ts` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build in fila: **da lanciare prima di dire "fatto"** |

URL di prova:

| URL | Effetto |
|---|---|
| `/concept-10?gl=0` | WebGL mai caricato, `data-gl="off"` (fallback CSS) |
| `/concept-10?gl=1` | WebGL anche con risparmio dati (non se il contesto manca) |
| `/concept-10?carta=grafite` | carta alla prima visita (la carta salvata vince) |
| `/concept-10?prova=partecipazione` | preseleziona "Cosa stampi" |
| `/concept-10?invio=ko` | `store.get().simulaErroreInvio === true`: l'invio simulato del banco deve fallire |
| `/concept-10#banco` | la pressa scende nell'hero, poi dopo `ANCORE.attesaIniziale` il foglio scorre al banco |

Per svuotare la memoria del concept nel browser:
`localStorage.removeItem('impronta:carta'); localStorage.removeItem('impronta:bozza'); localStorage.removeItem('impronta:inviata')`.

Versioni installate: react/react-dom 18.3.1, react-router-dom 6.30.6,
three 0.160.1, lenis 1.3.26, vite 5.4.21, @vitejs/plugin-react 4.7.0,
typescript 5.6.3, @types/react 18.3.31, @types/react-dom 18.3.7,
@types/three 0.160.0, @types/node 22.20.4, eslint + @eslint/js 9.39.5,
typescript-eslint 8.70.1, eslint-plugin-react-hooks 5.2.0,
eslint-plugin-react-refresh 0.4.26, globals 15.15.0.

---

## 2. File consegnati

**Solo standalone [S]** (non si portano): `package.json`, `package-lock.json`,
`vite.config.ts` (alias `@` → `src`, dev 8080, preview 4173, target es2020,
three in un chunk suo), `tsconfig.json`, `tsconfig.app.json`,
`tsconfig.node.json`, `eslint.config.js`, `.gitignore` (node_modules, dist),
`index.html` (`lang="it"`, favicon, preconnect font, fondo Citrino inline, Grafite
se la carta salvata o `?carta=` è grafite o il sistema è scuro senza scelta
salvata), `src/main.tsx` (StrictMode), `src/App.tsx` (BrowserRouter con i flag
v7, `/concept-10` lazy, `/` e `*` → redirect), `src/vite-env.d.ts`
(`/// <reference types="vite/client" />` per `?raw` e `?url`),
`src/lib/analytics.ts`, `src/components/ConceptBackButton.tsx`.

**Si portano [P]**: `src/pages/Concept10.tsx`, e in
`src/pages/concepts/impronta/`: `index.ts`, `Impronta.tsx`, `core/*`,
`state/*`, `relief/*`, `styles/base.css`, `styles/layout.css`.

**Stub che passano ai proprietari** (tech-architect §4): da adesso non li
tocco più.

| File | Rende | Proprietario |
|---|---|---|
| `sections/Hero/Hero.tsx` + `hero.css` | `<section id="inizio" class="imp-hero">` | section-builder-hero |
| `sections/Hero/Testata.tsx` + `testata.css` | `<header class="imp-testata">` | section-builder-hero |
| `sections/PerChi/PerChi.tsx` + `per-chi.css` | `<section id="lavori" class="imp-perchi">` | section-builder-per-chi |
| `sections/Tecniche/Tecniche.tsx` + `tecniche.css` | `<section id="tecniche" class="imp-tecniche">` | section-builder-tecniche |
| `sections/Carta/Carta.tsx` + `carta.css` | `<section id="carta" class="imp-carta">` | section-builder-carta |
| `sections/Legatoria/Legatoria.tsx` + `legatoria.css` | `<section id="legatoria" class="imp-legatoria">` | section-builder-legatoria |
| `sections/Banco/Banco.tsx` + `banco.css` | `<section id="banco" class="imp-banco">` | section-builder-banco |
| `sections/Bottega/Bottega.tsx` + `bottega.css` | `<section id="bottega" class="imp-bottega">` | section-builder-bottega |
| `sections/Colophon/Colophon.tsx` + `colophon.css` | `<footer id="colophon" class="imp-colophon">` | section-builder-colophon |
| `webgl/index.ts` | componente che rende `null` | shader-engineer |

Ogni componente di sezione è un **default export senza prop**. Gli id delle
ancore (`inizio`, `lavori`, `tecniche`, `carta`, `legatoria`, `banco`,
`bottega`, `colophon`) sono quelli di ux-architect §1 e `ORDINE_SEZIONI` di
`content/testi.ts`: non vanno cambiati (li usano i link, la luce
`#inizio`, l'hash iniziale).

---

## 3. La pagina montata da `Impronta.tsx`

```html
<div class="imp-root" data-carta="citrino|cotone|cipria|grafite"
     data-gl="pending|on|off" data-motion="full|reduced"
     style="--imp-ease-pressa: …; --imp-dur-pressa: 820ms; …">   <!-- variabiliMotion(ridotto) -->
  <a class="imp-salto" href="#contenuto">Salta al contenuto</a>
  <a class="imp-salto" href="#banco">Vai al banco di prova</a>
  <button class="cl-backbtn">← Torna in Ciceri Lab</button>            <!-- ConceptBackButton del sito -->
  <Canvas/>                                                           <!-- webgl, quando arriva (lazy) -->
  <!-- qui paperWave.ts aggiunge e toglie il velo .imp-ix-onda (fisso, livello canvas) -->
  <div class="imp-contenuto">                                          <!-- position: relative; z-index 1 -->
    <Testata/>                                                         <!-- header, fratello del main: sticky su tutta la pagina -->
    <main id="contenuto" class="imp-main">
      <Hero/> <PerChi/> <Tecniche/> <Carta/> <Legatoria/> <Banco/> <Bottega/>
    </main>
    <Colophon/>                                                        <!-- footer -->
  </div>
</div>
```

Scelte da sapere:
- **Testata fuori dall'Hero.** "Testata (dentro Hero)" di tech-architect è
  inteso come proprietà (è dell'hero builder), non come nesting: se la testata
  stesse dentro `<section id="inizio">` il suo `position: sticky` finirebbe con
  l'hero. `Impronta.tsx` importa `sections/Hero/Testata` e la monta prima del
  `<main>`. Il `<header>` resta un landmark `banner`.
- **Link di salto** (ux-architect §2.1): sono in `Impronta.tsx`, primi due
  elementi tabulabili, visibili solo col fuoco, in alto **al centro** (in alto a
  sinistra c'è il bottone del sito con z-index 2147483000 che li coprirebbe).
- **Zona del bottone "Torna in Ciceri Lab"**: in alto a sinistra ~230×44 px
  su desktop, in basso a sinistra ~210×44 px sotto i 640 px. Nessuna sezione
  ci mette elementi fissi (la testata desktop deve partire dopo quel bottone).
- **Livelli**: canvas e velo dell'onda a `--imp-z-canvas` (0) fuori da
  `.imp-contenuto`; tutto il contenuto a `--imp-z-contenuto` (1) dentro
  `.imp-contenuto`; testata a `--imp-z-testata` (10) dentro il contenuto.
  `.imp-root` ha `isolation: isolate` e **nessun** `container-type`,
  `transform`, `filter` o `contain` (art-director §4): i figli fissi restano
  agganciati alla finestra.

Cosa fa al mount, in quest'ordine:
1. inizializzatore di `useState`: `runtime.reset()` e `inizializzaStore({ search, reducedMotion, scuro })`
   → carta (memoria, poi `?carta=`, poi Grafite se il sistema è scuro, poi
   Citrino), bozza, testo dell'hero, `?prova=`, `?invio=ko`, reduced motion.
   Tutto **prima** del primo render delle sezioni;
2. `track('apri_concept', { concept: 10 })` una volta (guardia per StrictMode);
3. `document.title` e `meta[name=description]` da `META` (content/testi.ts), rimessi allo smontaggio;
4. fondo di `<html>` e `<body>` = `CARTE[carta].fondo` (inline, niente strisce nel rimbalzo iOS), rimesso allo smontaggio;
5. `injectFonts()` (FONT_CSS_URL + preconnect), tolti allo smontaggio solo se aggiunti qui;
6. ascolto di `prefers-reduced-motion` → `store.set({ reducedMotion })`;
7. `ticker.attiva()` (pausa con la scheda nascosta) e `osservaViewport()`;
8. `avviaScroll({ ridotto })`: lenis (`autoRaf: false`) o scroll nativo, ricreato se cambia la preferenza; allo smontaggio `lenis.destroy()` e `scroll-behavior` di `<html>` ripristinato;
9. `useLuce(rootRef)` (interaction), dopo il mount delle sezioni;
10. hash iniziale: `history.scrollRestoration = 'manual'`, `scrollTo(0, 0)`, poi `arrivaAllAncora(id)` dopo `ANCORE.attesaIniziale` (0 con reduced motion); ripristino di `scrollRestoration` allo smontaggio;
11. `concludiPaperWave()` allo smontaggio; `svuotaRimandati()` su `pagehide` e allo smontaggio (bozza);
12. WebGL: `decidiGL({ forzatura: ?gl, saveData, webgl: detectWebGL() })`; se no → `impostaGL('off', motivo)`; se sì → `caricaGL()` (font pronti + `requestIdleCallback` 1200 ms / `setTimeout` 300 ms) → `import('../webgl')` → `<Canvas/>`.

Clic sui link interni: `onClick` su `.imp-root` (un solo ascoltatore
delegato): ogni `a[href^="#"]` con clic sinistro senza modificatori →
`arrivaAllAncora(id)` e `preventDefault()` se l'ancora esiste. Le sezioni
**non** devono aggiungere gestori propri ai link `#`.

---

## 4. API dei moduli (firme esatte)

Tutti i percorsi sono relativi a `src/pages/concepts/impronta/`. Nessun
modulo tocca `window`/`document` a livello di modulo.

### 4.1 `core/ticker.ts`

```ts
export type FaseTicker = 'read' | 'update' | 'write' | 'render';
export type TickFn = (dt: number, now: number) => boolean | void;
export interface Ticker {
  add(fn: TickFn, fase?: FaseTicker): () => void;   // default 'update'; sveglia sempre; restituisce la rimozione
  wake(): void;                                     // chiede almeno un altro frame
  readonly running: boolean;
  attiva(): () => void;                             // pausa/ripresa con visibilitychange (Impronta.tsx)
  readonly abbonati: number;                        // diagnostica
}
export const ticker: Ticker;
export const FASI_TICKER: readonly FaseTicker[];
```

Ordine del frame: `lenis.raf(now)` → `runtime.scrollY` → `read` → `update` →
`write` → `render`; dentro una fase, ordine di registrazione. `dt` in secondi,
in [0, 0.05], 1/60 al primo frame dopo un risveglio. Il ciclo continua se una
fn ha restituito `true`, se qualcuno ha chiamato `wake()` (o `add()`) durante
il frame, o se `lenis.isScrolling`. Aggiunta durante il frame → parte dal
frame dopo; rimozione durante il frame → non viene più chiamata, neanche
nelle fasi successive. Eccezioni isolate per fn (console solo in dev).
**Nessun altro `requestAnimationFrame` nel concept.**

### 4.2 `core/lenis.ts`

```ts
export function getLenis(): Lenis | null;                            // null con reduced motion, prerender, prima/dopo il mount
export interface OpzioniScroll { readonly ridotto: boolean }
export function avviaScroll({ ridotto }: OpzioniScroll): () => void;   // solo Impronta.tsx
```

Lenis: `autoRaf: false`, `anchors: false`, `syncTouch: false`, `lerp: 0.1`,
`stopInertiaOnNavigate: true`; `virtual-scroll` e `scroll` → `ticker.wake()`.
Con reduced motion: nessun lenis, un listener `scroll` passivo che fa solo
`ticker.wake()`. Per viaggiare verso un'ancora si usa
`arrivaAllAncora` / `arrivaAScroll` di `motion/useScrollProgress.ts`, non
`lenis.scrollTo` diretto.

### 4.3 `core/capabilities.ts`

```ts
export type VersioneWebGL = 0 | 1 | 2;
export interface EsitoWebGL { readonly ok: boolean; readonly versione: VersioneWebGL;
  readonly motivo: 'nessuna-finestra' | 'nessun-contesto' | 'niente-highp' | null }
export type ForzaturaGL = 'auto' | 'on' | 'off';
export function detectWebGL(): EsitoWebGL;              // webgl2 ?? webgl, failIfMajorPerformanceCaveat, highp; canvas scartato
export function prefersReducedMotion(): boolean;
export function ascoltaReducedMotion(fn: (ridotto: boolean) => void): () => void;
export function isCoarsePointer(): boolean;
export function prefersDark(): boolean;
export function saveData(): boolean;
export function leggiForzaturaGL(search: string): ForzaturaGL;   // ?gl=0|off|no, ?gl=1|on|si
```

### 4.4 `core/fonts.ts`

```ts
export function injectFonts(url?: string): () => void;             // default FONT_CSS_URL; toglie solo ciò che ha aggiunto
export const FONT_ATTESA_MAX = 3000;
export function fontsReady(specs?: readonly string[], attesaMax?: number): Promise<void>;  // default FONT_DA_CARICARE; non rifiuta mai
```

### 4.5 `core/glLoader.ts`

```ts
export type MotivoNoGL = 'url' | 'save-data' | 'nessun-contesto' | 'niente-highp' | 'nessuna-finestra' | 'errore-import';
export interface DecisioneGL { readonly carica: boolean; readonly motivo: MotivoNoGL | null }
export interface IngressiDecisione { readonly forzatura: ForzaturaGL; readonly saveData: boolean; readonly webgl: EsitoWebGL }
export function decidiGL(i: IngressiDecisione): DecisioneGL;
export type ComponenteGL = ComponentType;                          // default export di webgl/index.ts, nessuna prop obbligatoria
export function caricaGL(segnale: AbortSignal, onErrore?: (errore: unknown) => void): Promise<ComponenteGL | null>;
```

### 4.6 `core/links.ts`, `core/viewport.ts`

```ts
export const LAB_URL = '/';                          // da verificare al porting
export const CICERILAB_URL = 'https://cicerilab.com';
export const MAPS_URL: string;                       // Google Maps, query RECAPITI.mapsQuery
export const TELEFONO_URL: string;                   // RECAPITI.telefonoHref (numero inesistente)
export const EMAIL_URL: string;                      // mailto: RECAPITI.email (.example)

export function osservaViewport(): () => void;       // solo Impronta.tsx: runtime.viewport su resize e visualViewport resize
```

### 4.7 `state/runtime.ts` (valori caldi, mai in React state)

```ts
export type LuceFonte = 'idle' | 'pointer' | 'touch' | 'gyro' | 'dial';
export type TipoPuntatore = 'mouse' | 'touch' | 'pen';
export interface Viewport { w: number; h: number; dpr: number }
export interface Puntatore { x: number; y: number; active: boolean; tipo: TipoPuntatore }
export interface Luce { azimuth: number; elevation: number; targetAzimuth: number; targetElevation: number; fonte: LuceFonte }
export interface Runtime {
  scrollY: number;           // lenis.animatedScroll o window.scrollY, scritto dal ticker prima di 'read'
  viewport: Viewport;        // core/viewport.ts; 0 prima del mount
  pointer: Puntatore;        // solo interaction/light.ts
  light: Luce;               // solo interaction/light.ts (target e lerp)
  dirty: boolean;            // lo azzera il renderer GL dopo aver disegnato
  markDirty(): void;
  reset(): void;             // Impronta.tsx al mount
}
export const LUCE_RIPOSO: { readonly azimuth: 135; readonly elevation: 22 };
export const runtime: Runtime;
```

### 4.8 `state/store.ts` (valori lenti)

```ts
export type { Carta, Legatura, Prodotto, Quando, Tecnica };   // da content/prezzi.ts: una sola fonte
export const CARTE_VALIDE, PRODOTTI_VALIDI, TECNICHE_VALIDE, LEGATURE_VALIDE, QUANDO_VALIDI;

export interface CartaWave { x: number; y: number; from: Carta; to: Carta; t0: number }
export interface Prova {
  prodotto: Prodotto;
  campi: Record<string, string>;     // chiavi di CAMPI_TESTO[prodotto]; vuoto = testo di esempio
  tecnica: Tecnica;
  taglioColorato: boolean;
  tiratura: number;
  legatura: Legatura;                // aggiunta del copywriter §9 (solo libro)
  quando: Quando | null;             // aggiunta del copywriter §9 (facoltativo)
}
export type StatoInvio = 'idle' | 'holding' | 'sending' | 'sent' | 'error';
export type StatoGL = 'pending' | 'on' | 'off';
export interface ImprontaState {
  carta: Carta;
  cartaWave: CartaWave | null;
  prova: Prova;
  bozzaRitrovata: boolean;           // c'era una bozza salvata all'avvio
  testoCliente: string | null;
  invio: StatoInvio;
  gl: StatoGL;
  glMotivo: string | null;
  reducedMotion: boolean;
  simulaErroreInvio: boolean;        // ?invio=ko
}
export type PatchStato = Partial<ImprontaState> | ((s: ImprontaState) => Partial<ImprontaState>);
export type PatchProva = Partial<Omit<Prova, 'campi'>> & { campi?: Record<string, string> };

export const store: {
  get(): ImprontaState;
  set(patch: PatchStato): void;               // sincrono, avvisa subito; niente avviso se nulla cambia
  subscribe(fn: () => void): () => void;
};
export function useImpronta<T>(selector: (s: ImprontaState) => T, isEqual?: (a: T, b: T) => boolean): T;

// azioni (le sezioni chiamano queste, non store.set)
export function scegliCarta(carta: Carta, origine?: { x: number; y: number }): void;  // salva e cambia, NON anima
export function aggiornaProva(patch: PatchProva): void;       // fonde `campi`; tiratura riportata a una valida per il prodotto; bozza salvata dopo 300 ms
export function impostaInvio(invio: StatoInvio): void;
export function confermaTestoCliente(testo?: string): void;   // default: primo campo scritto della prova; salvato
export function svuotaBozza(): void;                          // "Prova un'altra cosa" / "Ricomincia" del banco: carta e testo restano
export function ricominciaDaCapo(): void;                     // "Ricomincia da capo" del colophon: carta, bozza e testo
export function impostaGL(gl: StatoGL, motivo?: string | null): void;

// avvio e utilità
export function inizializzaStore(o: { search: string; reducedMotion: boolean; scuro: boolean }): ImprontaState;  // solo Impronta.tsx
export function leggiParametriUrl(search: string): { carta: Carta | null; prodotto: Prodotto | null; invioKo: boolean };
export function cartaPredefinita(): Carta;                    // Citrino, o Grafite se il sistema era scuro
export function provaIniziale(prodotto?: Prodotto): Prova;
export function tiraturaValida(prodotto: Prodotto, tiratura: number): number;
export function testoDallaProva(prova: Prova): string | null;
export function eCarta(v: unknown): v is Carta;
export function eProdotto(v: unknown): v is Prodotto;

// selettori
export function selParolaCampione(s: ImprontaState): string;  // testoCliente ?? primo campo scritto ?? TECNICHE.parolaCampione
export function selCarta(s: ImprontaState): Carta;
export function selReducedMotion(s: ImprontaState): boolean;
export function selGL(s: ImprontaState): StatoGL;
```

Regole:
- **Cambio carta dalle sezioni**: `cambiaCarta(carta, origine)` di
  `interaction/paperWave.ts` (onda, poi `scegliCarta` allo scambio). Mai
  `scegliCarta` diretto da una sezione. Per "Ricomincia da capo" con l'onda:
  `await cambiaCarta(cartaPredefinita(), el); ricominciaDaCapo();`.
- `cartaWave` lo scrive solo `paperWave.ts`; `gl`/`glMotivo` solo
  `Impronta.tsx` e lo shader-engineer (`impostaGL`); `reducedMotion` solo
  `Impronta.tsx`.
- Il **contatto** del banco non entra mai nello store né nella memoria: resta
  stato locale del componente del banco.
- `useImpronta` accetta selettori inline; se il selettore costruisce oggetti,
  passare `isEqual` (per esempio un confronto per campi).

### 4.9 `state/persist.ts`

```ts
export type AreaStorage = 'local' | 'session';
export const CHIAVI: { carta: 'impronta:carta'; bozza: 'impronta:bozza'; inviata: 'impronta:inviata' };
export function leggi(chiave: string, tipo?: AreaStorage): string | null;
export function scrivi(chiave: string, valore: string, tipo?: AreaStorage): boolean;
export function rimuovi(chiave: string, tipo?: AreaStorage): void;
export function leggiJSON<T>(chiave: string, valida: (v: unknown) => v is T, tipo?: AreaStorage): T | null;
export function scriviJSON(chiave: string, valore: unknown, tipo?: AreaStorage): boolean;
export function scriviJSONRimandato(chiave: string, valore: unknown, ritardo?: number, tipo?: AreaStorage): void;
export function annullaRimandato(chiave: string): void;
export function svuotaRimandati(): void;
```

Tutto in try/catch: con lo storage bloccato si legge `null` e si scrive
`false`, il sito funziona uguale.

### 4.10 `relief/types.ts`

```ts
export type TecnicaRilievo = 'secco' | 'colore' | 'lamina' | 'cordonatura';   // + cordonatura (webgl-artist §10.1)
export type TrackingRilievo = 'doc' | 'live';
export type TipoRilievo = 'text' | 'svg' | 'piece';
export interface StileLayer { famiglia: string; dimensione: number; peso: number; larghezza: number;
  spaziatura: number; interlinea: number; allineamento: 'left' | 'center' | 'right';
  trasformazione: 'none' | 'uppercase' | 'lowercase' | 'capitalize' }
export interface ReliefLayer {                     // = LayerMaschera di webgl/maskPainter.ts
  kind: 'text' | 'svg' | 'linea';
  x: number; y: number; w: number; h: number;      // percento del pezzo, 0..100
  text?: string; svg?: string;
  tecnica?: TecnicaRilievo;                        // se manca, quella del pezzo
  profondita?: number;                             // 0..1
  selettore?: string;                              // figlio del pezzo da cui prendere testo e metrica
  stile?: Partial<StileLayer>;
}
export interface ReliefSpec {
  kind: TipoRilievo;
  text?: string;
  svg?: string;
  layers?: ReliefLayer[];
  tecnica: TecnicaRilievo;
  carta?: Carta;
  profondita: number;                              // 0..1
  rotazione?: number;                              // gradi, orari
  tracking: TrackingRilievo;
  slot?: { maxW: number; maxH: number };
  priorita?: number;
}
export interface Rettangolo { x: number; y: number; w: number; h: number }
export interface ReliefBlock {
  readonly id: string;
  readonly el: HTMLElement;
  spec: ReliefSpec;
  rectDoc: Rettangolo;       // documento, NON ruotato (offsetWidth/Height centrati sul riquadro) se spec.rotazione ≠ 0
  rectView: Rettangolo;      // viewport px CSS, aggiornato nella fase 'read'
  pressione: number;         // 0..1
  versione: number;          // parte da 1; +1 quando la maschera va ricotta
  visibile: boolean;         // IO rootMargin '100% 0px'
  readonly ordine: number;   // ordine di registrazione
  misurato: boolean;         // w e h > 0 alla misura
}
export type EventoRegistro =
  | { tipo: 'aggiunto' | 'rimosso' | 'versione' | 'spec' | 'misura' | 'visibilita'; id: string };
```

### 4.11 `relief/registry.ts`

```ts
export const MAX_LIVE = 4;
export const RESIZE_ATTESA = 150;
export const MARGINE_VISIBILITA = '100% 0px';
export const ATTR_RELIEF = 'data-imp-relief';       // messo sull'elemento registrato, valore = id
export const registry: {
  register(el: HTMLElement, spec: ReliefSpec): string;
  unregister(id: string): void;
  update(id: string, patch: Partial<ReliefSpec>): void;   // versione+1 se cambiano kind/text/svg/layers/tecnica/slot, altrimenti evento 'spec'
  ridisegna(id: string): void;                            // versione+1 forzata
  setPressione(id: string, v: number): void;              // O(1), limitato a 0..1, markDirty solo se cambia
  get(id: string): ReliefBlock | undefined;
  all(): readonly ReliefBlock[];                          // ordine di registrazione, array condiviso: non modificarlo
  visible(): ReliefBlock[];
  readonly size: number;
  subscribe(fn: (evento: EventoRegistro) => void): () => void;
  invalidate(): void;                                     // rimisura tutti (cambio di layout dichiarato)
  misura(id: string): void;                               // rimisura uno
};
export type Registry = typeof registry;
```

Misure "doc": alla registrazione, su ResizeObserver dell'elemento, su resize
della finestra (150 ms), a font pronti (`fonts.ready` e `loadingdone`), su
`invalidate()`. Nella fase `read` del ticker: `rectView.y = rectDoc.y −
runtime.scrollY`, **nessuna lettura di layout**. "Live": rilettura di
`getBoundingClientRect()` nella fase `read`, solo se visibile, al massimo 4 per
frame. La scelta dei massimo 8 blocchi da mandare allo shader (priorità,
distanza dal centro) è dello shader-engineer in `webgl/blocks.ts`.
Lo scroll orizzontale della pagina è considerato sempre 0.

### 4.12 `relief/useRelief.ts` e `relief/ReliefText.tsx`

```ts
export function useRelief(ref: RefObject<HTMLElement | null>, spec: ReliefSpec,
  opzioni?: { readonly attivo?: boolean }): string | null;     // id, null fino alla registrazione
export function specUguali(a: ReliefSpec, b: ReliefSpec): boolean;

export type TagFantasma = 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'strong' | 'em'
  | 'li' | 'dt' | 'dd' | 'figcaption' | 'blockquote' | 'address';
export interface ReliefTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'slot'> {
  children: string;
  as?: TagFantasma;                 // default 'span'
  tecnica?: TecnicaRilievo;         // default 'secco'
  profondita?: number;              // default 1
  tracking?: TrackingRilievo;       // default 'doc'
  carta?: Carta;
  rotazione?: number;
  slotAtlante?: ReliefSpec['slot']; // diventa spec.slot (il nome `slot` è già un attributo HTML)
  priorita?: number;
  registra?: boolean;               // default true
  onRegistrato?: (id: string | null) => void;
}
export const ReliefText: ForwardRefExoticComponent<ReliefTextProps & RefAttributes<HTMLElement>>;
```

`useRelief` registra in un layout effect (prima della pittura), confronta la
spec per contenuto a ogni render e chiama `registry.update` solo se cambia:
la spec si può scrivere inline. `ReliefText` aggiunge sempre la classe
`imp-relief` (quella che `relief-fallback.css` rende trasparente con
`data-gl="on"`).

---

## 5. Come un section-builder registra un blocco a rilievo

**Caso A · testo premuto (titolo, parola, indirizzo).** Con il componente:

```tsx
import { useRef, useState } from 'react';
import { ReliefText } from '../../relief/ReliefText';
import { usePressione } from '../../motion/usePressione';
import { ATTESA_PRESSA, BOTTEGA } from '../../motion/choreography';
import { BOTTEGA as TESTI_BOTTEGA } from '../../content/testi';

const ref = useRef<HTMLElement>(null);
const [reliefId, setReliefId] = useState<string | null>(null);
usePressione(ref, { profilo: BOTTEGA.profilo, reliefId });   // = PROFILI.bottegaIndirizzo del motion-designer

<ReliefText ref={ref} as="p" onRegistrato={setReliefId} {...ATTESA_PRESSA}
  tecnica="secco" profondita={1}
  className="imp-bottega__indirizzo imp-pressa imp-secco" aria-hidden="true">
  {TESTI_BOTTEGA.indirizzo.riga1}
</ReliefText>
```

Oppure con il hook, su un elemento qualsiasi (esempio del motion-designer §6.1):

```tsx
const parolaRef = useRef<HTMLDivElement>(null);
const reliefId = useRelief(parolaRef, { kind: 'text', text: parola, tecnica: 'secco', profondita: 1, tracking: 'doc' });
const pressa = usePressione(parolaRef, { profilo: HERO.profilo, reliefId, ingresso: testoCliente ? 'vista' : 'montaggio',
  attendi: () => document.fonts.ready });
<div ref={parolaRef} {...ATTESA_PRESSA} className="imp-hero__parola imp-relief imp-secco imp-pressa" aria-hidden="true">{parola}</div>
```

Con `useRelief` su un elemento proprio, **la classe `imp-relief` va messa a
mano** (con `ReliefText` è automatica).

**Caso B · pezzo composto (Per chi, prova del Banco).** Si registra
l'elemento interno **non ruotato**; la rotazione va nella spec, non letta dal
DOM:

```tsx
const pezzoRef = useRef<HTMLDivElement>(null);
const id = useRelief(pezzoRef, {
  kind: 'piece', tecnica: 'secco', carta: 'cipria', profondita: 0.8, rotazione: -2,
  tracking: largo ? 'doc' : 'live',                      // 'live' nel mazzo swipe su mobile
  layers: [
    { kind: 'text', x: 0, y: 0, w: 100, h: 100, selettore: '.imp-perchi__nomi' },
    { kind: 'linea', x: 0, y: 50, w: 100, h: 1, tecnica: 'cordonatura' },
  ],
});
<div className="imp-perchi__foglio" style={{ transform: 'rotate(-2deg)' }}>
  <div ref={pezzoRef} className="imp-perchi__pezzo imp-foglio imp-relief" data-carta="cipria">…</div>
</div>
```

**Caso C · SVG (marchio in lamina).** `kind: 'svg', svg: marchioImpronta`
(stringa da `assets/svg`), `tecnica: 'lamina'`.

Regole:
- `tracking: 'live'` solo dentro contenitori sticky, trasformati o a scorrimento
  orizzontale (Tecniche fissata, mazzo di Per chi, prova fissa del Banco su
  mobile): costano una lettura di layout per frame, massimo 4.
- Testo che cambia a ogni tasto (Banco): `slot` (o `slotAtlante` su
  `ReliefText`) con la misura massima, e il testo nuovo nella spec
  (`text`): `useRelief` fa `update` da solo, e la versione sale.
- Cambio di layout che il ResizeObserver non vede (un fratello che cambia
  altezza e sposta il blocco senza ridimensionarlo): `registry.invalidate()`.
- Niente `font-variation-settings` da JS: la pressione è `--imp-press`
  (scritta da `usePressione`), gli assi li deriva `.imp-pressa`.

---

## 6. Ordine dei CSS

In `Impronta.tsx`, in quest'ordine (art-director §3.1, interaction-designer §11.5):

1. `styles/tokens.css` (art-director): variabili, carte, `@font-face` di ripiego;
2. `styles/base.css` (scaffold): radice, reset scoped, tipografia di base, `.imp-sr`, `.imp-salto`;
3. `styles/layout.css` (scaffold): `.imp-contenuto`, `.imp-main`, `.imp-gl`, `.imp-page`, `.imp-block`, `.imp-griglia`, `.imp-giustezza(--stretta)`, `.imp-a-vivo`;
4. `styles/relief-fallback.css` (art-director): classi materiali, fibra, spegnimento con GL;
5. `interaction/interaction.css` (interaction-designer): stati, anello di focus, onda;
6. i CSS di sezione, importati dai componenti di sezione (ordine delle sezioni).

`base.css` usa `:where()` per il reset e la tipografia: specificità minima,
così ogni regola di sezione (`.imp-root .imp-…`) vince senza forzature.
Sulla radice: fondo `var(--imp-carta)`, inchiostro, Hanken al corpo,
`transition: color var(--imp-dur-inchiostro, 240ms) linear` (solo il colore:
il fondo lo cambia l'onda). Titoli `h1/h2/h3` in Anybody con gli assi fissi
delle voci `titolo-*` tramite `--imp-wdth`/`--imp-wght` e
`font-synthesis: none`.

Classi dello scaffold per le sezioni:

| Classe | Uso |
|---|---|
| `imp-page` | gabbia della pagina: max 1680, margini interno/esterno da libro |
| `imp-block` | sezione: `padding-block: var(--imp-testa) var(--imp-piede)` |
| `imp-griglia` | griglia a `--imp-colonne` (4 / 8 / 12) con `--imp-canalino` |
| `imp-giustezza`, `imp-giustezza--stretta` | riga di lettura 62ch / 44ch |
| `imp-a-vivo` | esce dalla gabbia fino ai bordi (solo le strisce della carta) |
| `imp-sr` | solo lettori di schermo |
| `imp-relief` | fantasma del rilievo (messa da `ReliefText`) |
| `imp-gl` | il `<canvas>` dello shader-engineer: fisso, livello 0, opacità 0 → 1 con `data-gl="on"` in `--imp-dur-gl` |
| `imp-display`, `imp-piccolo`, `imp-nota`, `imp-lista` | Anybody senza assi, testo piccolo, nota 14 px, lista senza puntini |

---

## 7. Per lo shader-engineer

- `webgl/index.ts`: `export { default } from './ImprontaCanvas'` (default
  export = componente senza prop obbligatorie). Lo monta `Impronta.tsx`
  come figlio diretto di `.imp-root`, prima di `.imp-contenuto`.
- Il `<canvas>` con classe `imp-gl` e `aria-hidden="true"`: posizione, livello
  e dissolvenza sono già in `layout.css`.
- Quando il primo frame con tutte le maschere visibili è pronto:
  `impostaGL('on')`. Spegnimento per qualità o perdita di contesto:
  `impostaGL('off', 'qualita' | 'contesto-perso' | …)`.
- Render nella fase `'render'` del ticker, solo se `runtime.dirty`; azzera
  `runtime.dirty` dopo aver disegnato. Se serve animare (arco della luce,
  onda), la fn restituisce `true` solo finché serve.
- Blocchi: `registry.all()` / `visible()` e `registry.subscribe()` per
  aggiunte, rimozioni e versioni. `rectView` è in px CSS del viewport (da
  moltiplicare per il DPR), del rettangolo non ruotato; la rotazione è
  `spec.rotazione`.
- Onda: `getPaperWave(now)` di `interaction/paperWave.ts`; luce:
  `runtime.light`; carta: `store.get().carta` e `CARTE` di `styles/tokens.ts`.

---

## 8. Analytics

`import { track } from '@/lib/analytics'`, firma del sito:
`track(event: TrackEvent, params?: Record<string, string | number | boolean | undefined>)`.
`TrackEvent` è l'unione **chiusa** del sito (copiata). Il concept usa solo:
- `track('apri_concept', { concept: 10 })`: già in `Impronta.tsx`, una volta per montaggio;
- `track('demo_prenotazione', { concept: 10, prodotto, tecnica, tiratura })`: al
  successo dell'invio del banco (section-builder-banco). Mai il testo scritto
  né il contatto.

Gli eventi `concept_view`, `concept_cta`, `concept_carta`,
`concept_prova_invio`, `concept_gl` di tech-architect §10 **non compilano**
(non sono in `TrackEvent`): non vanno usati (integrazione-sito.md punto 2).
Nello standalone `track` scrive in `console.debug` solo in sviluppo.

---

## 9. Differenze consapevoli rispetto ai documenti

| Punto | Documento | Scelta | Perché |
|---|---|---|---|
| Testo del cliente dopo l'invio | tech-architect §6.1: sessionStorage `impronta:testo` | localStorage `impronta:inviata` (`{ testo }`) | ux-architect §1: "sopravvive al ricaricamento… `inviata: true` + testo premuto, per far tornare i nomi nell'hero"; "Ricomincia da capo" lo svuota |
| `prova` nello store | tech-architect §6.1 | + `legatura`, `quando` | richiesta del copywriter §9 (tipi di `content/prezzi.ts`) |
| Tipi `Carta`, `Tecnica`, `Prodotto` | ridefiniti in store | re-esportati da `content/prezzi.ts` | una sola fonte, coincidono per costruzione |
| `Tecnica` del rilievo | tech-architect §7.1 | `TecnicaRilievo` con `cordonatura` | webgl-artist §10.1; lo store resta a 3 tecniche (prezzi) |
| Testata | "dentro Hero" | fratello del `<main>`, montata da `Impronta.tsx` | sticky per tutta la pagina e landmark `banner` |
| Stato aggiunto | — | `bozzaRitrovata`, `glMotivo`, `simulaErroreInvio` | stato "Bozza ritrovata" del banco, diagnostica GL, `?invio=ko` |
| Azioni aggiunte | — | `svuotaBozza`, `ricominciaDaCapo`, `impostaGL`, `confermaTestoCliente(testo?)` | "Prova un'altra cosa", "Ricomincia da capo" (ux 5.6-5.8), stato GL |
| Viewport | dove? | `core/viewport.ts` | la misura di `runtime.viewport` serviva a un modulo dello scaffold |
| ReliefText | — | prop `slotAtlante` invece di `slot` | `slot` è già un attributo HTML in `HTMLAttributes` |
| `index.html` | fondo inline | + script che legge carta salvata / `?carta=` / modo scuro | nessun lampo giallo prima di React su chi ha scelto Grafite |

---

## 10. Problemi nei file altrui

**Nessun errore di compilazione né di lint** nei file degli altri agent:
typecheck strict e ESLint passano su `motion/`, `interaction/`, `webgl/`
(file del webgl-artist), `styles/tokens.ts`, `content/`, `assets/svg/`. Il
build non è bloccato da nulla.

Osservazioni non bloccanti (da girare ai proprietari se servono):
- `interaction/interaction.css:584` e `styles/base.css` dichiarano entrambi
  `.imp-root { transition: color var(--imp-dur-inchiostro, 240ms) linear; }`:
  duplicato innocuo (stesso valore). Lo tengo anche in `base.css` perché
  l'art-director l'ha chiesto allo scaffold (art-director §4).
- `styles/tokens.css`: `--imp-z-onda: 20` resta inutilizzato (il velo usa
  `--imp-z-canvas`, interaction-designer §12); se qualcuno lo usasse per il
  velo coprirebbe il testo.
- `docs/tech-architect.md` §10: i nomi di evento lì elencati non esistono in
  `TrackEvent` (vedi §8 qui sopra); vale `integrazione-sito.md`.
- `webgl/*` (webgl-artist) oggi non entra nel build: lo stub `webgl/index.ts`
  non lo importa. Lo typecheck lo copre comunque; entrerà nel chunk lazy quando
  lo shader-engineer collegherà `ImprontaCanvas`.

---

## 11. Problemi aperti

1. **Font nel contenitore di sviluppo**: il proxy della sandbox a volte
   rifiuta `fonts.googleapis.com` a Chromium headless
   (`ERR_CERT_AUTHORITY_INVALID` senza `ignoreHTTPSErrors`,
   `ERR_TOO_MANY_RETRIES` a ricaricamento): è l'ambiente, non il codice. Nei
   test Playwright usare `ignoreHTTPSErrors: true`; i font di ripiego tarati
   dell'art-director reggono comunque il layout.
2. **WebGL in headless**: Chromium headless usa SwiftShader, che
   `failIfMajorPerformanceCaveat` rifiuta: `data-gl="off"` (fallback CSS).
   Corretto per il concept; per vedere il GL serve un Chromium con GPU (o un
   test dello shader-engineer che crei il contesto senza quella clausola).
3. **Porting** (tech-architect §3.1): da verificare nel sito vero l'URL della
   vetrina del Concept Lab (`core/links.ts` → `LAB_URL`). `ConceptBackButton`
   e `@/lib/analytics` NON si copiano: si usano quelli del sito.
4. Nello standalone il bottone "Torna in Ciceri Lab" porta a `/`, che fa
   redirect a `/concept-10`: ricarica la pagina. È voluto (copia fedele con
   `location.href = "/"`); nel sito vero porta alla vetrina.
5. `npm install` segnala `eslint@9.39.5` come non più supportato e 4
   vulnerabilità `npm audit` nelle dipendenze di sviluppo: versioni fissate da
   tech-architect §1, nessun effetto sul bundle del concept.
6. Lo smontaggio completo (html/body, lenis, ticker, font) è scritto e letto,
   ma nello standalone non si può navigare fuori dalla pagina (tutte le rotte
   tornano a `/concept-10`): va provato al porting, cambiando pagina nel sito.
