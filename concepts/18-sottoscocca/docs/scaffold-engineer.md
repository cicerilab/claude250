# Scaffold engineer · Concept 18 · SOTTOSCOCCA

Ondata 3, prima dei section-builder e dello shader-engineer. Documento
vincolante per chi scrive codice nell'ondata 3: comandi, file e proprietari,
pagina montata da `Radice.tsx`, API esatte di `core/`, `state/`, `ponte/`,
ordine dei CSS e livelli, richieste dell'ondata 2 evase, problemi aperti.

Letti: `docs/ruoli-agent.md`, il pilota (`concepts/10-torchio/docs/scaffold-engineer.md`
e il suo codice), tutti i doc in `concepts/18-sottoscocca/docs/` e tutto il
codice dell'ondata 2 (`motion/`, `interaction/`, `content/`, `styles/tokens.*`,
`webgl/scena/`, `assets/`). I moduli dello scaffold sono costruiti sugli import
e sulle firme che quei file usano davvero.

---

## 0. Esito

| Controllo | Esito |
|---|---|
| `npm install` | verde (versioni esatte di tech-architect §1, senza `pngjs`, lockfile creato) |
| `npm run typecheck` (strict + `noUncheckedIndexedAccess` + `noUnused*`) | **verde su tutto `src/`**, compresi i file di motion, interaction, content, tokens, webgl-artist, foto, svg, fermi |
| `npm run typecheck:node` (`vite.config.ts` + `scripts/*.mjs`, solo sintassi per gli .mjs) | verde |
| `npm run lint` (`eslint src`) | verde, zero avvisi |
| `npm run build` | verde. Chunk `Concept18` **13,3 KB gz** (budget 60), react+router 52,3 KB gz, CSS **5,9 KB gz** (budget 24) |
| `npm run dev` (9180) + Playwright Chromium su `/concept-18` | **zero errori e zero avvisi in console** a 1440×900 e 375×812, e con `?gl=0&lavoro=gomme,dischi&deposito=si&giorno=…&invio=errore`, `#quota-80` con reduced motion a 375×667, finestra bassa 900×400, `?fermo=80`, `?fermo=180` con SwiftShader |

Prove funzionali nel browser (sezioni allungate a mano con la geometria di
riferimento del motion-designer, moduli importati dal dev server):

- scroll 0 / 0,25 / 1 / 2,15 / 4,4 / 6 / 8,6 finestre → quota 0 / 15 / 20 / 55 /
  156 / 180 / 17 (discesa), binario 0 / 0,76 / 1 / 1,58 / 2,76 / 3 / 0,86;
  `data-quota`, `store.quotaPlateau` e annuncio aria-live solo ai plateau
  ("Ponte a 20 centimetri: gomme.", "… 180 …"), nessun annuncio al
  caricamento; `sezione` dello store giusta;
- clic su un link `#quota-80` dalla cima → la pagina si ferma con il ponte a
  80 (plateau, pannello sotto la testata), fuoco sull'`h2`, **plateau non
  annunciato** (ux §7.2);
- `?lavoro=gomme,dischi&deposito=si` → `['gomme-deposito','pastiglie-dischi']`,
  `deposito.gia = true`; `?giorno=` e `?invio=errore` letti;
- finestra 400 px di altezza → `data-altezza="bassa"`;
- WebGL: in headless `data-gl="off"` (`nessun-contesto`, SwiftShader rifiuta
  `failIfMajorPerformanceCaveat`); con il contesto disponibile lo stub resta
  `pending` e dopo 8 s va `off/tempo`; con `?fermo=` la clausola è tolta (per
  `npm run fermi`) e il DOM è nascosto;
- primo Tab → "Salta al contenuto" visibile in alto al centro, in Red Hat Text.

Screenshot guardati (`/tmp/claude-0/…/scratchpad/shots/`): 1440 e 375 mostrano
il nero grasso pieno e il bottone "Torna in Ciceri Lab" (in alto a sinistra a
1440, in basso a 375); le sezioni sono stub vuoti, quindi non c'è altro.
Server chiuso.

---

## 1. Comandi

Dalla cartella `concepts/18-sottoscocca/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (c'è `package-lock.json`) |
| `npm run dev` | `vite --port 9180 --strictPort` → http://localhost:9180/concept-18 (`/` e ogni altro percorso → redirect) |
| `npx vite --port <n> --strictPort` | dev server sulla propria porta (section-builder 9181-9189, tech §11) |
| `npm run build` / `npm run preview` | build in `dist/` / preview su 9180 |
| `npm run typecheck` / `typecheck:node` / `lint` | come da tech §11 |
| `npm run check` | typecheck + lint + build: **da lanciare prima di dire "fatto"** |
| `npm run modello` / `npm run fermi` | script del webgl-artist / shader-engineer |

URL di prova: `?gl=0|1`, `?invio=ko` (o `errore`), `?lavori=<IdLavoro,…>`,
`?lavoro=gomme,dischi,…` (alias dell'ux), `?deposito=si`,
`?giorno=AAAA-MM-GG`, `?fermo=0|20|80|180`, `#inizio … #piede` e gli alias
`#quota-0|20|80|180`.

Memoria del concept: `sessionStorage` `sottoscocca:lavori`,
`sottoscocca:deposito`; `localStorage` `sottoscocca:confermata`.

---

## 2. File e proprietari

**Solo standalone [S]** (dello scaffold, non si portano): `package.json`,
`package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`,
`.gitignore`, `index.html` (fondo `#1C1D1B` inline, favicon, preconnect),
`src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts` (tipi `?raw`, `?url`,
`.webp`), `src/lib/analytics.ts` e `src/components/ConceptBackButton.tsx`
(copie del pilota).

**Si portano [P]**, dello scaffold: `src/pages/Concept18.tsx`; in
`src/pages/concepts/sottoscocca/`: `index.ts`, `Radice.tsx`, `core/*`,
`state/*`, `ponte/*`, `styles/base.css`, `styles/layout.css`,
`styles/motion-vars.css`.

### 2.1 Tabella definitiva section-builder → file esclusivi

Le 9 sezioni dell'ux-architect (§10) più lo shader-engineer. Le cartelle
seguono il tech-architect dove possibile; due spostamenti decisi qui (§9):
la **Testata** ha una cartella sua (è di asta-testata, non dell'apertura) e il
**Fondale** pure (è il poster LCP dell'apertura, non dell'asta). Da adesso lo
scaffold non tocca più nessuno di questi file.

| Agent | File esclusivi | Stub consegnato (rende) | Porta |
|---|---|---|---|
| **section-builder-asta-testata** | `sections/Testata/*`, `sections/Asta/*`, `docs/section-builder-asta-testata.md` | `Testata.tsx` `<header class="ssc-testata">`; `Asta.tsx` `<nav class="ssc-asta" hidden>` | 9188 |
| **section-builder-apertura** | `sections/Apertura/*`, `sections/Fondale/*`, `docs/section-builder-apertura.md` | `Apertura.tsx` `<section id="inizio" class="ssc-apertura ssc-stazione">`; `Fondale.tsx` `<div class="ssc-fondale" aria-hidden>` | 9181 |
| **section-builder-gomme** | `sections/Gomme/*`, `docs/section-builder-gomme.md` | `<section id="gomme" class="ssc-gomme ssc-stazione">` | 9182 |
| **section-builder-freni-sospensioni** | `sections/Freni/*`, `docs/section-builder-freni-sospensioni.md` | `<section id="freni" class="ssc-freni ssc-stazione">` | 9183 |
| **section-builder-sottoscocca** | `sections/Sottoscocca/*`, `docs/section-builder-sottoscocca.md` | `<section id="sottoscocca" class="ssc-sottoscocca ssc-stazione">` | 9184 |
| **section-builder-punti-lavoro** | `sections/Punti/*` (`PuntiQuota.tsx`, `Punto.tsx`, `Scheda.tsx`, `BarraLavoro.tsx`, `punti.css`), `docs/section-builder-punti-lavoro.md` | `PuntiQuota` con la **firma finale** (§4.9); `Scheda` e `BarraLavoro` rendono `null` | 9189 |
| **section-builder-deposito** | `sections/Deposito/*`, `docs/section-builder-deposito.md` | `<section id="deposito" class="ssc-deposito ssc-stazione">` | 9185 |
| **section-builder-ponte-libero** | `sections/PonteLibero/*` (anche `planning.ts`, `genera.ts`, `invio.ts`), `docs/section-builder-ponte-libero.md` | `<section id="ponte-libero" class="ssc-ponte-libero ssc-stazione">` | 9186 |
| **section-builder-officina-piede** | `sections/Officina/*`, `sections/Piede/*`, `docs/section-builder-officina-piede.md` | `<section id="officina">`, `<footer id="piede">` | 9187 |
| **shader-engineer** | `webgl/ScenaGL.ts`, `proiezione.ts`, `qualita.ts`, `dissolvenza.ts`, `ScenaCanvas.tsx`, `webgl/index.ts`, `scripts/fermi-immagine.mjs` e `assets/fermi/*` (versione finale), `docs/shader-engineer.md` | `webgl/index.ts` default export che rende `null` | 9180 |

Regole per gli stub:
- ogni componente di sezione è un **default export senza prop** (tranne
  `PuntiQuota`); gli **id** (`inizio`, `gomme`, `freni`, `sottoscocca`,
  `deposito`, `ponte-libero`, `officina`, `piede`) non si cambiano: li usano
  asta, testata, piede (`PIEDE.indice`), barra e hash;
- le otto sezioni chiamano già `useStazione(ref, id)`: il builder lo tiene,
  sull'elemento radice della sezione;
- ogni CSS di sezione è già importato dal suo componente.

---

## 3. La pagina montata da `Radice.tsx`

```html
<div class="ssc-root" lang="it" data-gl="pending|on|off" data-motion="full|reduced"
     data-orient="landscape|portrait" data-quota="0|20|80|180" data-asta="quota|ore"
     [data-scheda="aperta"] [data-altezza="bassa"] [data-fermo="80"]>
  <a class="ssc-salto" href="#contenuto">Salta al contenuto</a>
  <a class="ssc-salto" href="#ponte-libero">Trova un buco</a>
  <button class="cl-backbtn">← Torna in Ciceri Lab</button>          <!-- del sito -->
  <Fondale/>                                                          <!-- fisso, livello 0 -->
  <Scena/>  = <div class="ssc-gl-strato"><canvas class="ssc-gl"/></div>   <!-- lazy, livello 0 -->
  <div class="ssc-contenuto">                                         <!-- position: relative, SENZA z-index -->
    <Testata/>   <!-- header, livello 10 -->
    <Asta/>      <!-- nav fissa a destra, livello 5: tabulazione subito dopo la testata (ux §7.3) -->
    <main id="contenuto" class="ssc-main">
      <Apertura/> <Gomme/> <Freni/> <Sottoscocca/> <Deposito/> <PonteLibero/> <Officina/>
    </main>
    <Piede/>     <!-- footer -->
  </div>
  <BarraLavoro/>   <!-- fissa, livello 6 -->
  <Scheda/>        <!-- una sola, fissa, livello 6 -->
  <div class="ssc-sr" aria-live="polite" aria-atomic="true"></div>   <!-- state/annuncio.ts -->
</div>
```

Gli attributi sulla radice li scrive **solo** Radice (da store e viewport):
le sezioni li leggono nel CSS (`.ssc-root[data-quota="80"] …`,
`.ssc-root[data-altezza="bassa"] …`, `.ssc-root[data-motion="reduced"] …`).

Al mount, in ordine:
1. inizializzatore di `useState`: `runtime.reset()` e
   `inizializzaStore({ search, reducedMotion, bassa })` prima del primo render;
2. `track('apri_concept', { concept: 18 })` una volta (guardia StrictMode);
3. `document.title` / `meta description` da `META`, fondo di html/body =
   `PALETTE.nero.hex`, tutto rimesso allo smontaggio;
4. `injectFonts()`; ascolto di `prefers-reduced-motion` → `store.reducedMotion`;
5. `collegaAnnuncio(regione)`;
6. `ticker.attiva()`, `osservaViewport()` (→ `data-orient`, `store.bassa`),
   `avviaScroll()`, `osservaStazioni(.ssc-contenuto)`, `avviaPonte()`,
   `avviaPunti()`; allo smontaggio tutto staccato e `azzeraEvidenza()`
   (richiesta dell'interaction-designer);
7. `svuotaRimandati()` su `pagehide` e allo smontaggio;
8. hash iniziale (anche `#quota-80`): `scrollRestoration = 'manual'`,
   `vaiA(id, { ridotto: true, fuoco: false })` + `saltaPonte()` (il ponte è
   già all'altezza giusta), ripetuto dopo i font se nessuno ha scorso;
9. WebGL: `decidiGL()` → `off` subito con motivo, oppure `pending`,
   `caricaGL()` (dopo `load` + `requestIdleCallback` 1500 ms) → `<Scena/>`;
   **tetto 8 s**: ancora `pending` → `impostaGL('off', 'tempo')` e lo strato
   non viene montato. Con `?fermo=` niente tetto e la rilevazione accetta
   la GPU software.

Clic sui link interni: un solo `onClick` delegato su `.ssc-root`: ogni
`a[href^="#"]` (clic sinistro senza modificatori) → `vaiA(id)` e
`preventDefault()` se l'ancora esiste. **Le sezioni non aggiungono gestori
propri ai link `#`.**

---

## 4. API dei moduli (firme esatte)

Percorsi relativi a `src/pages/concepts/sottoscocca/`. Nessun modulo tocca
`window`/`document` a livello di modulo.

### 4.1 `core/ticker.ts`

```ts
export type FaseTicker = 'read' | 'update' | 'write' | 'render';
export type TickFn = (dt: number, now: number) => boolean | void;
export interface Ticker {
  add(fn: TickFn, fase?: FaseTicker): () => void;  // default 'update'; sveglia; restituisce la rimozione
  wake(): void;
  readonly running: boolean;
  attiva(): () => void;                            // solo Radice: pausa con la scheda del browser nascosta
  suRipresa(fn: () => void): () => void;           // ritorno da scheda nascosta (il ponte fa `salta`)
  readonly abbonati: number;
}
export const ticker: Ticker;
export const FASI_TICKER: readonly FaseTicker[];
```

Ordine del frame: `runtime.scrollY = window.scrollY` → `read` → `update` →
`write` → `render`; dentro una fase, ordine di registrazione (in `update` il
ponte è registrato da Radice prima che arrivi il GL: la proiezione dello
shader-engineer gira **dopo** il motore). `dt` in secondi in [0, 0,05], 1/60
al risveglio. Aggiunte durante il frame partono dal frame dopo; rimozioni
valgono subito. **Nessun altro `requestAnimationFrame` e nessun listener
`scroll` nel concept.**

### 4.2 `core/scroll.ts`

```ts
export const ALIAS_ANCORE: Readonly<Record<string, string>>;   // quota-0 → inizio, quota-20 → gomme, quota-80 → freni, quota-180 → sottoscocca
export function risolviAncora(id: string): string;
export function avviaScroll(): () => void;                      // solo Radice: listener passivo → ticker.wake()
export interface OpzioniVaiA { readonly ridotto: boolean; readonly fuoco?: boolean }
export function vaiA(id: string, o: OpzioniVaiA): boolean;      // false se l'ancora non esiste
```

`vaiA`: smooth solo senza reduced motion; per `gomme`, `freni`,
`sottoscocca` arriva **dentro il plateau** della loro quota (pannello sotto la
testata; sottoscocca all'aggancio dello stadio) con `scrollPerAncora`; per le
altre ancore il bordo alto meno lo `scroll-padding-top`. Fuoco sul primo
`h1`/`h2` (o `[tabindex="-1"]`) della sezione con `preventScroll` (aggiunge
`tabindex="-1"` se serve); il plateau d'arrivo **non** si annuncia.

### 4.3 `core/capabilities.ts`, `core/fonts.ts`, `core/glLoader.ts`, `core/viewport.ts`, `core/links.ts`

```ts
export function detectWebGL(o?: { readonly permettiSoftware?: boolean }): EsitoWebGL;  // webgl2 ?? webgl, failIfMajorPerformanceCaveat (tolta solo per ?fermo=), highp
export function prefersReducedMotion(): boolean;
export function ascoltaReducedMotion(fn: (ridotto: boolean) => void): () => void;
export function isCoarsePointer(): boolean;
export function prefersPortrait(): boolean;
export function saveData(): boolean;
export function leggiForzaturaGL(search: string): 'auto' | 'on' | 'off';    // ?gl=0|off|no, ?gl=1|on|si

export function injectFonts(url?: string): () => void;                   // FONT_CSS_URL + FONT_PRECONNECT di tokens.ts
export const FONT_ATTESA_MAX = 3000;
export function fontsReady(specs?: readonly string[], attesaMax?: number): Promise<void>;  // default FONT_DA_CARICARE; non rifiuta mai

export function decidiGL(i: { forzatura; saveData; webgl }): { carica: boolean; motivo: MotivoNoGL | null };
export type ComponenteGL = ComponentType;                                // default export di webgl/index.ts
export function caricaGL(segnale: AbortSignal, onErrore?: (e: unknown) => void): Promise<ComponenteGL | null>;

export const ALTEZZA_BASSA = 520;
export interface MisuraViewport { w; h; dpr; orient: 'landscape' | 'portrait'; bassa: boolean }
export function osservaViewport(onCambio?: (m: MisuraViewport) => void): () => void;  // solo Radice

export const LAB_URL = '/';  CICERILAB_URL;  MAPS_URL;  TELEFONO_URL;  EMAIL_URL;  KENNEY_URL;  // da RECAPITI_DATI
```

`osservaViewport` scrive `runtime.viewport` (con `orient`), invalida le
stazioni e sveglia il ticker a ogni resize / `visualViewport` resize.

### 4.4 `state/runtime.ts` (valori caldi, mai in React state)

```ts
export type Orientamento = 'landscape' | 'portrait';
export interface Runtime {
  scrollY: number;
  viewport: { w: number; h: number; dpr: number; orient: Orientamento };
  percorso: number;                                   // 0..6, ponte/quota.ts
  quota: { target: number; valore: number };          // cm, MotorePonte
  binario: number;                                    // 0..3, MotorePonte
  discesa: number;                                    // 0..1, MotorePonte
  opacitaScena: number;                               // 0..1, MotorePonte
  ruote: number;                                      // rad, MotorePonte
  evidenza: Partial<Record<IdPezzo, number>>;         // 0..1, MotorePonte
  punti: Record<IdPunto, { x: number; y: number; visibile: boolean }>;  // px viewport: webgl/proiezione.ts o Fondale
  puntoSotto: IdPunto | null;                         // sections/Punti (motion §11 punto 2)
  dirty: boolean; markDirty(): void; reset(): void;
}
export const runtime: Runtime;
```

`runtime` soddisfa `UscitaPonte` di `motion/molle.ts` e viene passato tale e
quale al motore. Le evidenze che il motore riceve sono `evidenzeCorrenti()` di
`interaction/evidenza.ts` (scheda aperta + punto indicato, già limitate a un
cambio ogni 500 ms): **i Punti segnalano hover e fuoco con
`segnalaIndicato()`** (lo fa già `useNavigaPunti`); `runtime.puntoSotto` resta
come informazione per chi disegna (etichette, linee di richiamo).

### 4.5 `state/store.ts` (valori lenti)

```ts
export type IdStazione = 'inizio' | 'gomme' | 'freni' | 'sottoscocca' | 'deposito' | 'ponte-libero';
export type IdSezione = IdStazione | 'officina' | 'piede';
export interface Posizione { giorno: string; ponte: Ponte; inizio: number }           // 'YYYY-MM-DD', minuti
export interface Confermata extends Posizione { fine: number; lavori: readonly IdLavoro[]; numeroDeposito: string | null }
export interface Deposito { gia: boolean | null; numero: string }
export interface SottoscoccaState {
  quotaPlateau: Quota; sezione: IdSezione; schedaAperta: { punto: IdPunto; origine: 'scena' | 'elenco' } | null;
  lavori: readonly IdLavoro[]; deposito: Deposito; posizione: Posizione | null;
  invio: 'idle' | 'sending' | 'sent' | 'error'; confermata: Confermata | null; modoAsta: 'quota' | 'ore';
  gl: 'pending' | 'on' | 'off'; glMotivo: string | null; reducedMotion: boolean;
  bassa: boolean; giornoRichiesto: string | null; simulaErroreInvio: boolean; fermo: Quota | null;
}
export const store: { get(); set(patch); subscribe(fn): () => void };
export function useSottoscocca<T>(selector: (s) => T, isEqual?: (a: T, b: T) => boolean): T;

// azioni (le sezioni chiamano queste, mai store.set)
export function apriScheda(punto: IdPunto, origine: 'scena' | 'elenco'): void;   // solo via interaction/useScheda.ts
export function chiudiScheda(): void;
export function aggiungiLavoro(id: IdLavoro): IdLavoro | null;   // toglie l'altro del gruppo (esclusoDa) e lo RESTITUISCE → ANNUNCI.sostituito
export function togliLavoro(id: IdLavoro): void;
export function impostaDeposito(patch: Partial<Deposito>): void;
export function piazzaBlocco(p: Posizione | null): void;
export function impostaInvio(s: StatoInvio): void;
export function conferma(c: Confermata): void;                    // invio 'sent' + localStorage
export function ricomincia(): void;                               // "Ricomincia da capo" / "Un altro lavoro"
export function impostaModoAsta(m: 'quota' | 'ore'): void;        // solo PonteLibero
export function impostaGL(gl: StatoGL, motivo?: string | null): void;   // Radice e shader-engineer
export function inizializzaStore(o: { search; reducedMotion; bassa? }): SottoscoccaState;  // solo Radice

// selettori
selDurata(s)          // durataMinuti(lavori, deposito.gia) di content/lavori.ts
selPontiAdatti(s)     // pontiAdatti(lavori): MAI un'intersezione (copywriter); nuovo array → usare con isEqual o fuori da useSottoscocca
selEtichettaLavoro(s) // etichettaLavoro(lavori, selDurata(s)) di testi.ts; '' senza lavori
selHaGomme(s), selPrezzoDa(s), selQuotaPlateau, selSezione, selReducedMotion, selGL, selBassa,
selSchedaAperta, selLavori, selModoAsta, selFermo
// utilità
leggiParametriUrl(search), normalizzaLavori(ids), eLavoro, eQuota, ePonte, statoIniziale(),
STAZIONI_ID, SEZIONI_ID, LAVORI_VALIDI, QUOTE_VALIDE
```

Regole: `quotaPlateau` e `sezione` li scrive solo `ponte/quota.ts`; `bassa`
e `reducedMotion` solo Radice; aggiungere `gomme-deposito` mette
`deposito.gia = true`. **Nome, telefono, targa e nota mai nello store** (stato
locale di `PonteLibero/Dati.tsx`). Con `useSottoscocca` un selettore che crea
array (es. `selPontiAdatti`) va usato con un `isEqual` per contenuto.

### 4.6 `state/persist.ts`, `state/annuncio.ts`

```ts
export const CHIAVI: { lavori: 'sottoscocca:lavori'; deposito: 'sottoscocca:deposito'; confermata: 'sottoscocca:confermata' };
leggi / scrivi / rimuovi / leggiJSON / scriviJSON / scriviJSONRimandato / annullaRimandato / svuotaRimandati   // come il pilota, tutto in try/catch

export function collegaAnnuncio(el: HTMLElement | null): () => void;   // solo Radice
export function annuncia(testo: string): void;                          // regione polite della pagina (ANNUNCI.aggiunto/sostituito/tolto…)
```

### 4.7 `ponte/stazioni.ts` e `ponte/useStazione.ts`

```ts
export const ATTR_PANNELLO = 'data-ssc-pannello';   // pannello di testo della quota (gomme, freni, sottoscocca)
export const ATTR_PIN = 'data-ssc-pin';             // stadio sticky del sottoscocca
export const ATTR_STAZIONE = 'data-ssc-stazione';   // messo dallo scaffold sulla sezione registrata
export function useStazione(ref: RefObject<HTMLElement | null>, id: IdSezione): void;   // layout effect
export function registraStazione(id: IdSezione, el: HTMLElement): () => void;
export function invalidaStazioni(): void;          // layout cambiato senza resize (es. un pannello che si apre)
export function stazioniInvalide(): boolean;
export function misuraStazioni(): boolean;         // SOLO fase read (la chiama ponte/quota.ts)
export function geometrie(): readonly GeometriaStazione[];
export function versioneStazioni(): number;
export function sezioneA(y: number): IdSezione | null;
export function elementoSezione(id: IdSezione): HTMLElement | null;
export function osservaStazioni(contenuto: HTMLElement | null): () => void;   // solo Radice
export function azzeraStazioni(): void;
```

Misure (motion §4.1, §11 punto 4): `top`/`altezza` della sezione, primo
`[data-ssc-pannello]` → `pannelloTop`/`pannelloAltezza`, `fissa` = dentro c'è
un `[data-ssc-pin]` con `position: sticky` **calcolata** in quel momento (il
CSS del sottoscocca toglie lo sticky con reduced motion e con
`data-altezza="bassa"`: la misura se ne accorge da sola). Rimisura solo su
ResizeObserver (sezioni e `.ssc-contenuto`), resize, font caricati,
`invalidaStazioni()`.

### 4.8 `ponte/quota.ts`

```ts
export function avviaPonte(): () => void;                    // solo Radice: fasi read e update
export function saltaPonte(): void;                          // prossimo frame: motore.salta (arrivo da hash)
export function silenziaPlateau(): void;                     // il prossimo plateau non si annuncia (lo usa vaiA)
export function profiloCorrente(): ProfiloPonte;             // per chi deve calcolare uno scroll "a una quota"
export function scrollPerAncora(id: string, margineAlto: number): number | null;
```

È il codice di motion §11 nella sostanza: `read` → misura e
`profiloDaGeometria(geometrie(), vh, orient)` solo se serve; `update` →
`statoDaScroll` (o l'obiettivo fisso di `?fermo=`), `percorsoDaScroll`,
`evidenze = evidenzeCorrenti()`, `motore.passo(dt, now, ingresso, runtime)`
(o `salta` al primo frame, al cambio di orientamento, al ritorno da scheda
nascosta, dopo un hash), `markDirty` se `cambiato`, plateau → `store` +
`annuncia(QUOTE[q].annuncio)` (mai al primo plateau, mai dopo un salto da
link), `sezione` → store (linea al 50% della finestra).

### 4.9 `ponte/punti.ts` e la firma di `PuntiQuota`

```ts
export const ATTR_PUNTO_ATTIVO = 'data-ssc-punto-attivo';      // 'si' | 'no'
export function registraPunto(el: HTMLElement, id: IdPunto, quota: Quota): () => void;
export function avviaPunti(): () => void;                      // solo Radice: fase write

// sections/Punti/PuntiQuota.tsx (firma finale, stub dello scaffold)
export interface PropsPuntiQuota { readonly quota: Quota; readonly etichette: 'sempre' | 'al-focus' }
export default function PuntiQuota(props: PropsPuntiQuota): JSX.Element;
```

Nella fase `write`, per ogni bottone registrato: `data-ssc-punto-attivo="si"`
se `|quota.valore − quota| ≤ 2 cm` e `runtime.punti[id].visibile`, altrimenti
`"no"`; se attivo e spostato di almeno 0,5 px,
`style.transform = translate3d(x, y, 0)`. Il CSS dei punti (builder) li mette
`position: fixed; left: 0; top: 0` e nasconde gli `"no"` con
`visibility: hidden`. `translate` e `scale` restano a interaction.css.

### 4.10 Per lo shader-engineer

- `webgl/index.ts`: default export = componente senza prop; rende
  `<div class="ssc-gl-strato" aria-hidden="true"><canvas class="ssc-gl" data-sscvar/></div>`.
  Posizione fissa, livello 0 e dissolvenza on/off (300 ms, 200 ridotta) sono
  del wrapper in `layout.css`; il canvas ha `opacity: var(--ssc-opacita-scena, 1)`
  (con `useMotionVars(ref, CALCOLI.opacitaScena)`). Due elementi diversi così
  la transizione on/off non insegue il valore caldo.
- Proiezione: `ticker.add(fn, 'update')` (dopo il ponte), scrive
  `runtime.punti`; render nella fase `render` solo con `runtime.dirty`, poi
  `runtime.dirty = false`; niente render con `opacitaScena === 0`.
- `impostaGL('on')` al primo frame vero; `impostaGL('off', motivo)` per
  contesto perso/qualità (lo strato resta montato e può tornare `on`); se il
  tetto degli 8 s scatta prima (`off/tempo`) Radice non monta lo strato.
- `?fermo=<q>`: `store.get().fermo`; il ponte è già fermo a quella quota e il
  DOM è nascosto (`layout.css`); a primo frame disegnato segnare
  `data-ssc-fermo="pronto"` (contratto di `scripts/fermi-immagine.mjs`).

---

## 5. Livelli e regole CSS per tutti

- **`.ssc-contenuto` è `position: relative` senza z-index** (deviazione dalla
  frase dell'art-director "il livello 1 lo dà .ssc-contenuto"): con
  `z-index: 1` il contenuto diventerebbe un contesto chiuso e la testata (10)
  finirebbe sotto l'asta (5). Così invece il contenuto in flusso sta sopra
  fondale e canvas (vengono prima nel DOM, livello 0), e punti (2), asta (5),
  scheda/barra (6), testata (10) competono tutti nel contesto di `.ssc-root`
  come da DESIGN.md §6.
- **Sezioni e `.ssc-stazione`: niente z-index, transform, filter, opacity < 1,
  contain, container-type** (art-director §5): i fissi dentro resterebbero
  intrappolati.
- Ogni selettore comincia con `.ssc-root`. Nessun hex fuori dai token.
- Classi dello scaffold: `ssc-root`, `ssc-contenuto`, `ssc-main`,
  `ssc-stazione`, `ssc-gl-strato`, `ssc-gl`, `ssc-pagina` (margine sinistro +
  corsia dell'asta, max 1680), `ssc-banco` (larghezza `--ssc-banco`),
  `ssc-griglia` (`--ssc-colonne` × `--ssc-canalino`), `ssc-giustezza`,
  `ssc-lead`, `ssc-piccolo`, `ssc-nota`, `ssc-numeri`, `ssc-lista`, `ssc-sr`,
  `ssc-salto`.
- `base.css`: `button, input, select, textarea { font: inherit; color:
  inherit }` (art-director), `::selection` coi token, `h2`/`h3` in Tektur con le
  voci `titolo2`/`titolo3`, `scroll-padding` su `html:has(.ssc-root)` (72/88
  telefono, 88/16 da 640).

## 6. Ordine dei CSS

In `Radice.tsx`: `styles/tokens.css` → `styles/motion-vars.css` →
`styles/base.css` → `styles/layout.css` → `interaction/interaction.css` → CSS
di sezione (importati dai componenti).

**`styles/motion-vars.css`** (scaffold): `tokens.css` non ha le variabili
`--ssc-curva-*` e `--ssc-durata-*` che il motion-designer (§8.1) chiedeva
all'art-director. Le ho generate da `variabiliMotion(false/true)` di
`motion/choreography.ts` (curve da `BEZIER_CSS`): normali su `.ssc-root`,
ridotte su `.ssc-root[data-motion="reduced"]`. Se il motion-designer cambia
una durata, si rigenera così (da `concepts/18-sottoscocca/`):

```sh
npx esbuild src/pages/concepts/sottoscocca/motion/choreography.ts --bundle --format=esm --platform=node --outfile=/tmp/cor.mjs
node -e "import('/tmp/cor.mjs').then(({variabiliMotion:v})=>{const n=v(false),r=v(true);const f=o=>Object.entries(o).map(([k,x])=>'  '+k+': '+x+';').join('\n');console.log('.ssc-root {\n'+f(n)+'\n}\n\n.ssc-root[data-motion=\"reduced\"] {\n'+f(Object.fromEntries(Object.entries(r).filter(([k,x])=>n[k]!==x)))+'\n}')})"
```

(e si rimette l'intestazione del file). Se l'art-director preferisce averle in
`tokens.css`, basta spostarle e togliere l'import.

---

## 7. Richieste dell'ondata 2: cosa ho fatto

| Da | Richiesta | Fatto |
|---|---|---|
| tech-architect | struttura §3, store §6.1, runtime §6.2, stazioni §6.3, punti §7, caricamento §9 | sì (deviazioni in §9) |
| art-director | `font: inherit` sui controlli, radice con fondo/testo/font/corpo dei token, `::selection`, fondo inline `#1C1D1B`, **niente z-index/transform su stazioni e sezioni**, font da `tokens.ts` | sì; livello del contenuto risolto come in §5 |
| motion-designer §11 | 1 il motore scrive tutto in `runtime`; 2 `runtime.puntoSotto`; 3 `salta` all'hash, al cambio di orientamento, al ritorno da scheda nascosta; 4 `[data-ssc-pannello]` e `fissa`; 5 `data-motion`; variabili `--ssc-curva/durata-*` | sì, tutte; variabili in `styles/motion-vars.css` |
| interaction-designer | `ticker` (add/wake), `runtime.scrollY`/`markDirty`, `store.get/subscribe`, `useSottoscocca`, azioni **per nome** `apriScheda`/`chiudiScheda`, stato `schedaAperta`/`sezione`/`reducedMotion`; `interaction.css` importato in Radice; `azzeraEvidenza()` allo smontaggio; `evidenze: evidenzeCorrenti()` nel ponte | sì, tutte |
| copywriter | `selDurata` con `durataMinuti`, `selPontiAdatti` con `pontiAdatti`, `selEtichettaLavoro` con `etichettaLavoro`, `aggiungiLavoro` che usa `esclusoDa` e restituisce l'id tolto; `ORARI` readonly; `links.ts` da `RECAPITI_DATI`; `META.title`, `SALTI`, `QUOTE[q].annuncio`; alias URL `gomme`/`dischi` + `deposito=si`; id del piede `#inizio…` | sì, tutte; gli id restano quelli del tech-architect (gli alias `#quota-*` dell'ux funzionano) |
| webgl-artist | script `modello` e `fermi`, niente `pngjs`, `types: ["vite/client"]`, un solo `auto.bin` | sì |
| photo-editor | tipi dei moduli `*.webp` | sì (`vite-env.d.ts`); `CREDITI_FOTO` e `FOTO_QUOTE` compilano |
| vector-artist | `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `vite-env.d.ts` per `?raw` | sì |
| brand-strategist | generatori dei blocchi occupati con etichette e orari giusti | non è codice dello scaffold: va a section-builder-ponte-libero (`genera.ts`, `OCCUPATI_PER_PONTE`) |
| ux-architect | parametri URL §1.1, modalità bassa §7.10, annunci solo a plateau, nessun annuncio dopo un salto, fuoco sull'h2 | sì (`data-altezza="bassa"` + `store.bassa`; i builder adattano i loro fissi) |

---

## 8. Problemi nei file altrui

**Nessuno.** Typecheck strict e ESLint passano su `motion/`, `interaction/`,
`content/`, `styles/tokens.ts`, `webgl/scena/`, `assets/` senza modifiche; il
build non è bloccato da nulla. Osservazioni non bloccanti:
- `webgl/scena/*` oggi non entra nel build (lo stub `webgl/index.ts` non lo
  importa): entrerà nel chunk lazy con lo shader-engineer.
- `interaction/interaction.css` copia a mano alcune durate (`--ssc-ix-*`) che
  ora esistono anche come `--ssc-durata-*`: si possono unificare
  (interaction-designer), non è un errore.

---

## 9. Differenze consapevoli rispetto ai documenti

| Punto | Documento | Scelta | Perché |
|---|---|---|---|
| Testata | tech §3: `sections/Apertura/Testata.tsx` | `sections/Testata/` (asta-testata) | ux §10 la dà ad asta-testata; una cartella = un proprietario |
| Fondale | tech §3: `sections/Asta/Fondale.tsx` | `sections/Fondale/` (apertura) | ux §10: il poster LCP è dell'apertura |
| Asta nel DOM | tech §3: dopo `.ssc-contenuto` | dentro `.ssc-contenuto`, subito dopo la Testata | ux §7.3: tabulazione subito dopo la testata |
| Livello del contenuto | art-director: z 1 su `.ssc-contenuto` | `position: relative` senza z-index | altrimenti testata (10) sotto asta (5), §5 |
| Strato GL | tech: `<canvas class="ssc-gl">` | wrapper `.ssc-gl-strato` + canvas | dissolvenza on/off separata dalla variabile calda |
| Memoria | ux §1.2: tutto in localStorage | lavori e deposito in sessionStorage (tech §6.1), prenotazione in localStorage | il blocco del giorno non deve tornare settimane dopo; la tacca "il tuo ponte" sì |
| Stato in più | — | `bassa`, `giornoRichiesto`, `fermo` | ux §7.10, §1.1; tech §8.4 |
| Annuncio | ux: regione di asta-testata | regione unica in Radice + `annuncia()` | il plateau lo decide il ponte (scaffold); tutti possono annunciare |
| `?invio=` | ux `errore`, tech `ko` | entrambi | |
| Tetto GL | — | 8 s anche per lo stub | se lo strato non disegna, la pagina va al fallback e non resta in attesa |

---

## 10. Problemi aperti

1. **WebGL in headless**: Chromium headless usa SwiftShader, rifiutato da
   `failIfMajorPerformanceCaveat` → `data-gl="off"` (fallback). Corretto per
   il concept; con `?fermo=` la clausola è tolta per gli script.
2. **Font**: i woff2 di Google sono arrivati nelle prove (Red Hat Text visto
   sul link di salto); se il proxy li rifiuta, i ripieghi metrici
   dell'art-director tengono il layout.
3. **Porting**: `ConceptBackButton` e `@/lib/analytics` NON si copiano (si
   usano quelli del sito); `LAB_URL` da verificare nel sito vero. Lo
   smontaggio completo (titolo, fondo, font, ticker, stazioni) è scritto ma si
   prova solo cambiando pagina nel sito vero.
4. `npm install` segnala `eslint@9.39.5` non più supportato e vulnerabilità
   `npm audit` nelle dipendenze di sviluppo: versioni fissate dal
   tech-architect, nessun effetto sul bundle.
5. Con gli stub la pagina è alta una finestra: il motore usa `profiloBase`
   (geometria di riferimento) finché le sezioni non hanno altezza vera; le
   prove del ponte qui sopra sono state fatte allungando le sezioni a mano.
