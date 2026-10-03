# Scaffold engineer · Concept 16 · EVIDENZIA

Ondata 3, prima dei section-builder. Documento vincolante per chi scrive codice
nell'ondata 3: comandi, struttura della pagina, API esatte di `core/`,
`state/`, `foglio/`, stub consegnati, tabella delle sezioni da costruire,
richieste raccolte e problemi aperti.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, tutti i documenti in `concepts/16-evidenzia/docs/`
(in particolare tech-architect §3-§12, ux-architect §1, §2, §5, §6 e "Sezioni
da costruire", interaction-designer §3.3, §6, §8, motion-designer §6 e §8,
art-director §3-§4, copywriter e photo-editor "Richieste", vector-artist §5),
il formato del pilota (`concepts/10-torchio/docs/scaffold-engineer.md` e il suo
codice) e tutto il codice già scritto nell'ondata 2 (`interaction/`, `motion/`,
`tratto/`, `styles/tokens.*`, `content/`, `assets/`). I miei moduli sono
costruiti sugli import e sulle firme che quei file usano davvero: nessun file
dell'ondata 2 è stato toccato.

---

## 0. Esito

| Controllo | Esito |
|---|---|
| `npm install` | verde, versioni esatte di tech-architect §1, lockfile creato |
| `npm run typecheck` (strict + `noUncheckedIndexedAccess` + `noUnused*`) | **verde su tutto `src/`**, compresi tutti i file di interaction, motion, tratto, content, assets |
| `npm run typecheck:node` (vite.config.ts) | verde |
| `npm run lint` (`eslint src`) | verde, zero avvisi |
| `npm run build` | verde. JS del concept 26,0 KB gz (budget 60: quasi tutto è testo di `content/`), react+router 52,3 KB gz, CSS 4,6 KB gz (budget 24). Chunk `Giro` separato. `leaflet` non entra ancora (lo importerà solo `mappa/`) |
| `npm run dev` (9160) + Playwright Chromium su `/concept-16` | **zero errori e zero avvisi in console** a 1440 × 900, 375 × 667 (touch, DPR 2), con reduced motion, con `?vista=intera&scheda=rif-152`, `#giro`, `?segna=…&oggi=…` |
| Prova funzionale nel browser (moduli importati dal dev server) | vedi sotto |

Provato a mano nel browser:
- ticker fermo da solo (`running: false`, un solo abbonato: la lettura dello
  scroll); font veri caricati (Libre Franklin, Newsreader) più i ripieghi;
- foglio: scroller `role="region"`, `tabIndex 0`, area scorrevole 2200 × 2380
  (1840 + 360 per il molo, 2060 + 320); finestra senza scroll;
- `evidenzia` / `togli` / `alterna` / `sposta`: 'aggiunto', 'gia', 'pieno' al
  quinto con la riga del quinto in live, ordine a mano coerente, memoria
  `evidenzia:giro` scritta;
- registro: un annuncio di prova a due righe in c4 → `righe` 2 (251 e 225 px,
  locali), `posizione` (930, 72) = `xColonna(4)`, `versione` +1;
- Leggi → Pagina intera → Leggi con il punto fisso: animazione WAAPI in volo,
  scala 0,406 a 1440 × 900, pagina centrata a sinistra del molo, voce live
  "Vista Pagina intera…"; ritorno con il punto chiesto al centro; `vaiA`
  coerente con `runtime.foglio`;
- scheda: `#scheda-214` nella history, foglio e comandi `inert`, regione live
  no, fuoco sul dialogo; Esc chiude e l'hash sparisce; giro: `#giro`, il tasto
  indietro del browser lo chiude restando su `/concept-16`; arrivo diretto con
  `#giro`: Esc chiude con `replaceState` (nessuna voce in più);
- calendario: oggi (sabato 3/10) → testata 3/10, giro 10/10 e 17/10, `tardi`
  3/10; `?oggi=2026-10-02T13:00` → tardi; `?oggi=2026-12-24` → testata 26/12,
  giro 9/1 e 16/1 (26/12 e 2/1 chiusi), `chiuso` 26/12;
- `?segna=214,rif-231,999` a 375 → due case (la 999 ignorata), voce live
  "Nel tuo giro ci sono già due case…", `scrollWidth` 375;
- filetti di colonna a x = 344, 632, 920, 1208 (e 1496) a scroll 0.

Screenshot (guardati): `qa/scaffold/1440.png`, `1440-intera.png`, `375.png`,
`1440-reduced-intera.png`, `filetti.png`. Le sezioni sono stub vuoti: si vede la
carta piena e il bottone del sito "Torna in Ciceri Lab" (in alto a sinistra a
1440, in basso a sinistra a 375); `filetti.png` mostra la griglia con un `main`
alto 400 px messo apposta per la prova.

---

## 1. Comandi

Dalla cartella `concepts/16-evidenzia/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (c'è `package-lock.json`) |
| `npm run dev` | Vite su http://localhost:**9160** (`/` e ogni percorso → `/concept-16`) |
| `npm run build` | build in `dist/` |
| `npm run preview` | `dist/` su http://localhost:**9161** |
| `npm run typecheck` / `typecheck:node` / `lint` | come da nome |
| `npm run check` | typecheck + lint + build: **prima di dire "fatto"** |

Ogni section-builder usa la sua porta: `npx vite --port <porta> --strictPort`
(tabella al §6), e la chiude alla fine.

URL di prova (letti una volta da `inizializzaStore`):

| URL | Effetto |
|---|---|
| `?segna=214,229` (anche `rif-214`) | fino a 4 case segnate, **solo se la memoria è vuota**; Rif. sconosciuti ignorati; voce live dopo 0,9 s |
| `?giro=1` oppure `#giro` | giro aperto al mount (`aperturaDaUrl: true`) |
| `?scheda=rif-214` oppure `#scheda-214` | scheda aperta al mount (niente stacco) |
| `?vista=intera` | parte in Pagina intera (solo da 640 px) |
| `?rubrica=affitti` | porta il foglio all'inizio della rubrica, senza animazione |
| `?invio=ko` / `?mappa=ko` | `store.get().simula.invioKo` / `.mappaKo` |
| `?oggi=2026-10-03` o `?oggi=2026-10-02T12:30` | data finta (ora di Roma; senza ora vale 9:00) |

Svuotare la memoria: `localStorage.removeItem('evidenzia:giro')`.

Versioni: react/react-dom 18.3.1, react-router-dom 6.30.6, leaflet 1.9.4, vite
5.4.21, @vitejs/plugin-react 4.7.0, typescript 5.6.3, @types/react 18.3.31,
@types/react-dom 18.3.7, @types/leaflet 1.9.22, @types/node 22.20.4, eslint e
@eslint/js 9.39.5, typescript-eslint 8.70.1, eslint-plugin-react-hooks 5.2.0,
eslint-plugin-react-refresh 0.4.26, globals 15.15.0.

---

## 2. File consegnati

**Solo standalone [S]** (non si portano): `package.json`, `package-lock.json`,
`vite.config.ts` (alias `@`, dev 9160, preview 9161, `strictPort`, es2020,
chunk `react` e `leaflet`), `tsconfig*.json`, `eslint.config.js`,
`.gitignore`, `index.html` (`lang="it"`, title e description di `META`,
preconnect, fondo carta inline), `src/main.tsx` (StrictMode), `src/App.tsx`
(`/concept-16` lazy, `/` e `*` → redirect), `src/vite-env.d.ts`
(`vite/client`: tipi di `*.png`, `*.webp`, `*.svg?raw`),
`src/lib/analytics.ts`, `src/components/ConceptBackButton.tsx` (copia del
pilota, a sua volta copia fedele del sito: `/home/user/cicerilab` non è
nell'ambiente).

**Si portano [P]**: `src/pages/Concept16.tsx` e in
`src/pages/concepts/evidenzia/`: `index.ts`, `Evidenzia.tsx`, `core/*`,
`state/*`, `foglio/*`, `styles/base.css`, `styles/layout.css`.

**Stub che passano ai proprietari** (da adesso non li tocco più): tabella §6.

---

## 3. La pagina montata da `Evidenzia.tsx`

```html
<div class="evd-root" data-layout="foglio|colonna" data-vista="leggi|intera"
     data-motion="full|reduced" data-pannello="nessuno|scheda|giro"
     style="--evd-ease-*: …; --evd-durata-*: …">            <!-- variabiliMotion(ridotto) -->
  <a class="evd-salto" href="#evd-appartamenti">Vai agli annunci</a>
  <a class="evd-salto" href="#evd-prepara-giro">Vai al tuo giro</a>
  <button class="cl-backbtn">← Torna in Ciceri Lab</button>       <!-- del sito -->
  <div class="evd-foglio" tabindex="0" role="region" aria-label="Pagina degli annunci"
       aria-describedby="evd-foglio-aiuto">                     <!-- Foglio.tsx; in colonna niente ruolo -->
    <p id="evd-foglio-aiuto" class="evd-sr">…</p>               <!-- solo foglio -->
    <div class="evd-dimensionatore">
      <div class="evd-pagina">
        <Testata/>                <!-- header.evd-testata -->
        <StrisciaRubriche/>       <!-- solo colonna -->
        <main id="annunci" class="evd-annunci evd-colonne">
          <RiquadroTesta/>        <!-- section.evd-riquadro, primo figlio del main -->
          <Rubriche/>             <!-- rubriche, box incastrati, Cerchiamo, HaiSegnato (colonna) -->
        </main>
        <Piede/>                  <!-- footer.evd-piede -->
      </div>
    </div>
  </div>
  <Comandi/>                      <!-- aside.evd-comandi: molo / barra, minipagina, vista -->
  <Scheda/>                       <!-- solo se schedaAperta (key = id) -->
  <Giro/>                         <!-- solo se giroAperto, lazy dentro Suspense(null) -->
  <div id="evd-annunci-live" class="evd-live" role="status" aria-live="polite" data-evd-vivo></div>
</div>
```

Al mount, in ordine: (1) inizializzatore di `useState`: `runtime.reset()`,
`registraAvanzamento()`, `inizializzaStore({ search, hash, reducedMotion,
layout })`; (2) `salvaAvvio()` e `track('apri_concept', { concept: 16 })` una
volta; (3) titolo e description da `META`, rimessi allo smontaggio; (4) fondo
inline di html e body = `COLORI.carta`; (5) `injectFonts()`; (6)
`ticker.attiva()` + `osservaViewport()`; (7) ascolto di reduced motion e del
layout (640 px); (8) `fontsReady()` e `loadingdone` → `registro.invalida()`;
(9) prefetch del giro in idle (timeout 2 s); (10) `?rubrica=` e voce live di
`?segna=`. Allo smontaggio: `fermaVista()`, `azzeraCambioVista()`,
`segni.azzera()`, `registro.azzera()`.

**Un solo ascoltatore delegato** per tutti gli `a[href^="#"]` dentro
`.evd-root`: clic sinistro senza modificatori → `vaiAllAncora(id)` (mostra e dà
il fuoco). Le sezioni non aggiungono gestori ai link `#`.

Scelte da sapere:
- **Foglio e colonna, stesso DOM.** In `foglio` la finestra non scorre
  (`html:has(.evd-root[data-layout=foglio])` → `overflow: hidden`), scorre
  `.evd-foglio`. In `colonna` scorre la finestra; nessun antenato ha
  `overflow`, quindi barra del giro e barre di rubrica possono essere sticky.
- **La pagina** (`.evd-pagina`) è larga 1840 px con padding `72 66 0`: il
  contenuto parte a x = 66, y = 72 (sotto il bottone del sito). Il `main` è la
  griglia `.evd-colonne`: 6 colonne da 268 + canaletti da 20 e i **filetti**
  disegnati una volta dal suo fondo. Righe, aree e posizione dei blocchi le
  decide `sections/Annunci` (impaginato.ts + annunci.css); il riquadro di testa
  (Testata) si posiziona da annunci.css (`.evd-root .evd-annunci > .evd-riquadro`).
  In colonna la pagina ha padding `0 16 88` (+ area sicura): chi vuole il
  filo da bordo a bordo usa `margin-inline: calc(-1 * var(--evd-colonna-margine))`.
- **Pagina intera**: `transform: translate(--evd-intera-x, --evd-intera-y)
  scale(--evd-scala)` sulla pagina, dentro un dimensionatore grande quanto lo
  scroller e con `overflow: clip`; scroller con `overflow: hidden`. Scala =
  `scalaPaginaIntera()` di motion/vista.ts nell'area libera a sinistra del molo
  (finestra − 320 − 24) con 32 px di aria. In Leggi la pagina **non** ha
  `transform` (niente gruppi isolati in più).
- **Le foto a retino in Pagina intera** diventano grigio piatto
  (`--evd-retino-piatto`) se il contenitore della foto porta `data-evd-retino`
  (richiesta dell'art-director, contratto con Annunci).
- **Scroll-padding**: foglio `72 0 320 0` (bottone del sito, molo); finestra in
  colonna `96` sopra, `88 + area sicura` sotto (ux §6.1).
- **Livelli**: foglio `--evd-z-foglio`, salti sopra il giro. Comandi, velo,
  scheda, giro: li posizionano i proprietari con i token z.

---

## 4. API dei moduli (firme esatte)

Percorsi relativi a `src/pages/concepts/evidenzia/`. Nessun modulo tocca
`window`/`document` a livello di modulo.

### 4.1 `core/ticker.ts` (unico rAF)

```ts
export type FaseTicker = 'read' | 'update' | 'write' | 'render';
export type TickFn = (dt: number, now: number) => boolean | void;
export const ticker: {
  add(fn: TickFn, fase?: FaseTicker): () => void;   // default 'update'; sveglia; restituisce la rimozione
  wake(): void;
  readonly running: boolean;
  attiva(): () => void;                             // solo Evidenzia.tsx
  readonly abbonati: number;
};
export const FASI_TICKER: readonly FaseTicker[];
```
Ordine: `read` (scroll in `runtime.foglio`, misure del registro) → `update` →
`write` → `render`. `dt` in [0, 0.05], 1/60 dopo un risveglio. Aggiunta durante
il frame → parte dal frame dopo; rimozione → mai più chiamata. Zero frame da
fermo. **Nessun altro `requestAnimationFrame`, nessun listener `scroll`.**

### 4.2 `core/scroller.ts`

```ts
export function registraScroller(el: HTMLElement | null): () => void;  // solo Foglio.tsx; null = finestra (colonna)
export function registraPagina(el: HTMLElement | null): () => void;     // solo Foglio.tsx
export function getScroller(): HTMLElement | null;
export function getPagina(): HTMLElement | null;                        // .evd-pagina
export function vaiA(x: number, y: number, opz?: { liscio?: boolean }): void;
export interface OpzioniMostra { blocco?: ScrollLogicalPosition; inline?: ScrollLogicalPosition; liscio?: boolean }
export function mostraElemento(el: HTMLElement, margine?: number, opz?: OpzioniMostra): void;
export function aCoordinateContenuto(clientX: number, clientY: number): { x: number; y: number };
```
- coordinate del contenuto = px della pagina **non scalata** (come
  `registro.posizione` e il punto fisso della vista);
- `vaiA(x, y)` mette il punto nell'angolo in alto a sinistra: scroll = punto ×
  scala. `liscio` default **false** (minipagina trascinata, pan); sempre
  istantaneo con reduced motion;
- `mostraElemento` = `scrollIntoView` nativo (`nearest` di default) con
  `scroll-margin` temporaneo = `margine`; rispetta gli scroll-padding; `liscio`
  default **true** (posti del giro, Hai segnato), mai con reduced motion.

### 4.3 `core/ancore.ts`

```ts
export const ID_ANNUNCI = 'annunci';             // il <main>
export const ID_PREPARA = 'evd-prepara-giro';    // bottone "Prepara il giro" di Comandi (molo o barra: uno solo in pagina)
export const ID_LIVE = 'evd-annunci-live';
export const ID_AIUTO_FOGLIO = 'evd-foglio-aiuto';
export function idRubrica(r: Rubrica): string;   // "evd-appartamenti" … : id dell'h2 della barra di rubrica (tabIndex -1)
export function vaiAllAncora(id: string, opz?: { blocco?: ScrollLogicalPosition; liscio?: boolean }): boolean;
```
Il sommario della testata e la striscia della colonna usano
`href={'#' + idRubrica(r)}`: il clic lo gestisce Evidenzia.tsx.

### 4.4 `core/capabilities.ts`, `core/layout.ts`, `core/viewport.ts`, `core/fonts.ts`, `core/semi.ts`, `core/links.ts`

```ts
// capabilities
export function prefersReducedMotion(): boolean;
export function ascoltaReducedMotion(fn: (ridotto: boolean) => void): () => void;
export function isCoarsePointer(): boolean;
export function saveData(): boolean;
export function puoVibrare(): boolean;            // dito, navigator.vibrate, mai con reduced motion
export function vibra(ms: number): void;
// layout
export type Layout = 'foglio' | 'colonna';
export const QUERY_FOGLIO: string;                // "(min-width: 640px)"
export function leggiLayout(): Layout;
export function ascoltaLayout(fn: (l: Layout) => void): () => void;
// viewport
export function osservaViewport(): () => void;    // runtime.viewport
// fonts
export function injectFonts(url?: string): () => void;            // FONT_CSS_URL di tokens.ts
export const FONT_ATTESA_MAX = 3000;
export function fontsReady(specs?: readonly string[], attesaMax?: number): Promise<void>;  // non rifiuta mai
// semi
export function semeDa(id: string): number;       // FNV-1a 32 bit SENZA segno (vector-artist §5)
export function mulberry32(seme: number): () => number;
// links (recapiti letti da AGENZIA di content/zone.ts: un posto solo)
export const LAB_URL: '/'; export const CICERILAB_URL: string;
export const TELEFONO_URL: string; export const EMAIL_URL: string; export const MAPS_URL: string;
export const OSM_COPYRIGHT_URL: string;
export function osmZonaUrl(zona: ZonaId): string;
export function osmAgenziaUrl(): string;
```

### 4.5 `core/sabato.ts` (fuso Europe/Rome, CALENDARIO del copywriter)

```ts
export type { Giorno };                           // da content/testi.ts, mese 1-12
export interface Sabato { readonly iso: string; readonly giorno: Giorno }
export interface Istante { readonly iso: string; readonly giorno: Giorno; readonly settimana: number; readonly minuti: number }
export interface Calendario {
  readonly oggi: Istante;
  readonly testata: Sabato;                       // sabato che viene, oggi se è sabato
  readonly proposti: readonly [Sabato, Sabato];   // i due sabati del giro (radio)
  readonly tardi: Sabato | null;                  // saltato perché dopo venerdì 12:00 o di sabato
  readonly chiuso: Sabato | null;                 // primo sabato di chiusura saltato
}
export function isoDa(g: Giorno): string;
export function giornoDa(iso: string): Giorno | null;
export function aggiungiGiorni(g: Giorno, n: number): Giorno;
export function leggiOggiFinto(search: string): string | null;
export function adessoRoma(finto?: string | null, adesso?: Date): Istante;
export function prossimoSabato(oggi: Istante): Sabato;
export function calendario(oggi: Istante): Calendario;
```
Le frasi le scrive `testi.ts` (`sabatoLungo`, `GIRO.sabato.tardi(…)`,
`.chiuso(…)`, `.passato(…)`); il calendario è calcolato una volta all'avvio ed
è in `store.get().calendario` (oggetto stabile).

### 4.6 `core/dialogo.ts` (scheda e giro)

```ts
export type TipoLivello = 'scheda' | 'giro';
export type MotivoChiusura = 'esc' | 'storia';
export const HASH_GIRO = '#giro';
export function hashScheda(rif: string): string;  // "#scheda-214"
export interface OpzioniDialogo {
  readonly tipo: TipoLivello;
  readonly hash: string;
  readonly onChiudi: (motivo: MotivoChiusura) => void;   // anima la chiusura, POI chiudiScheda()/chiudiGiro()
  readonly fuocoIniziale?: RefObject<HTMLElement>;      // il titolo (tabIndex -1)
  readonly ritornoFuoco?: () => HTMLElement | null;      // l'attacco dell'annuncio / il bottone Prepara
}
export function useDialogo(ref: RefObject<HTMLElement>, opz: OpzioniDialogo): void;
```
Si usa nel componente del pannello, che esiste solo quando il livello è
aperto. Fa: `pushState` con l'hash (niente voce nuova se l'URL ha già l'hash),
popstate → `onChiudi('storia')`, allo smontaggio `history.back()` se la voce in
cima è la nostra altrimenti `replaceState` senza hash (regge StrictMode);
`inert` su tutti i figli di `.evd-root` tranne il pannello, la regione live
(`data-evd-vivo`) e il bottone del sito; Tab ciclico dentro; Esc →
`onChiudi('esc')` se nessuno ha già fatto `preventDefault`; fuoco iniziale (o
il pannello: dargli `tabIndex={-1}`) e di ritorno. Lo stacco, il velo e il
ritorno animato restano della scheda (motion/stacco.ts).

### 4.7 `state/runtime.ts` (valori caldi)

```ts
export interface StatoFoglio { x: number; y: number; w: number; h: number; contenutoW: number; contenutoH: number; scala: number }
export interface VoceTratto { avanzamento: number; bersaglio: number; riga: 0 | 1; gesto: boolean }
export const runtime: {
  viewport: { w: number; h: number; dpr: number };
  foglio: StatoFoglio;          // x/y = scroll in px di schermo; w/h = area visibile; contenuto non scalato; scala
  puntatore: { x: number; y: number; attivo: boolean; tipo: 'mouse' | 'touch' | 'pen' };
  tratti: Map<string, VoceTratto>;
  pan: { spazio: boolean; trascina: boolean };
  reset(): void;
};
```
`foglio.x/y/w/h` li scrive scroller.ts nella fase `read`; `scala`,
`contenutoW/H` Foglio.tsx quando cambiano.

### 4.8 `state/store.ts`

```ts
export type IdAnnuncio = string;   // vedi nota
export type Vista = 'leggi' | 'intera';
export type { Layout };
export type Partenza = '09:00' | '09:30' | '10:00';       // da CALENDARIO.partenze
export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
export type StatoMappa = 'chiusa' | 'caricamento' | 'pronta' | 'errore';
export type Origine = 'gesto' | 'bottone' | 'scheda' | 'giro';
export type EsitoEvidenzia = 'aggiunto' | 'gia' | 'pieno';
export type EsitoAlterna = 'aggiunto' | 'tolto' | 'pieno';
export const PARTENZE: readonly Partenza[];
export { MAX_GIRO };                                       // 4, da content/annunci.ts
export interface GiroMandato { sabato: string; tappe: readonly IdAnnuncio[]; partenza: Partenza; daAgenzia: boolean; impronta: string }
export interface EvidenziaState {
  segnati: readonly IdAnnuncio[];            // ordine di aggiunta, max 4 (memoria)
  ordine: readonly IdAnnuncio[] | null;      // a mano; null = il più breve (memoria)
  partenza: Partenza; daAgenzia: boolean;    // memoria
  sabato: 0 | 1;                             // indice in calendario.proposti (memoria come ISO)
  calendario: Calendario | null;             // null solo prima dell'avvio
  sabatoPassato: string | null;              // ISO di un sabato salvato già passato (riga "è passato")
  sparite: number;                           // Rif. salvati che non esistono più (riga "non è più in pagina")
  vista: Vista; layout: Layout;
  schedaAperta: IdAnnuncio | null; giroAperto: boolean;
  aperturaDaUrl: boolean;                    // livello aperto dall'URL: niente stacco
  invio: StatoInvio;
  mandato: GiroMandato | null;               // memoria; azzerato se il suo sabato è passato
  scarico: IdAnnuncio | null;                // quinto annuncio tentato (riga d'avviso)
  mappa: StatoMappa;
  voceLive: string; voceLiveN: number;       // regione live (Evidenzia.tsx)
  daUrl: number;                             // case arrivate da ?segna=
  reducedMotion: boolean;
  simula: { invioKo: boolean; mappaKo: boolean; oggi: string | null };
}
export const store: { get(): EvidenziaState; set(patch): void; subscribe(fn): () => void };
export function useEvidenzia<T>(selector: (s: EvidenziaState) => T, isEqual?: (a: T, b: T) => boolean): T;
export function stessiId(a, b): boolean;    // isEqual per liste di id

// azioni (le sezioni chiamano queste, MAI store.set)
export function annuncia(testo: string): void;
export function evidenzia(id, origine: Origine): EsitoEvidenzia;   // 'pieno' → scarico = id + riga del quinto in live
export function togli(id, origine: Origine): void;
export function alterna(id, origine: Origine): EsitoAlterna;
export function sposta(id, verso: -1 | 1, base?: readonly IdAnnuncio[]): void;   // base = ordine mostrato se ordine è null
export function riordina(ids: readonly IdAnnuncio[]): void;
export function ordineAutomatico(): void;
export function impostaPartenza(p: Partenza): void;
export function impostaDaAgenzia(b: boolean): void;
export function impostaSabato(n: 0 | 1): void;
export function impostaVista(v: Vista, puntoFisso?: PuntoFisso | null): void;   // SOLO via chiediVista()
export function prendiCambioVista(v: Vista): CambioVistaInAttesa | null;        // solo Foglio.tsx
export function apriScheda(id): void;  export function chiudiScheda(): void;
export function apriGiro(): void;      export function chiudiGiro(): void;      // chiudiGiro rimette mappa 'chiusa'
export function chiudiScarico(): void;                       // riga del quinto chiusa o 8 s passati
export function impostaMappa(m: StatoMappa): void;           // solo mappa/
export function impostaInvio(i: StatoInvio): void;           // solo sections/Giro
export function segnaMandato(g: { sabato: string; tappe: readonly IdAnnuncio[] }): void;   // solo Giro, al successo; invio = 'sent'
// solo Evidenzia.tsx
export function impostaReducedMotion(r: boolean): void;
export function impostaLayout(l: Layout): void;              // colonna → vista 'leggi'
export function inizializzaStore(o: { search: string; hash?: string; reducedMotion: boolean; layout: Layout; adesso?: Date }): EvidenziaState;
export function salvaAvvio(): void;

// selettori
export const selQuanti, selPieno, selOrdineGiro, selReducedMotion;
export const selSabato: (s) => Sabato | null;               // il sabato scelto del giro
export const selSabatoTestata: (s) => Sabato | null;        // null → stampare DATA_PRERENDER
export const selCambiatoDopoInvio: (s) => boolean;          // "Cambiato dopo l'invio"
export function selSegnato(id): (s) => boolean;
```
Regole: ogni aggiunta/rimozione dice in live `voceAggiunto` / `voceTolto`
(copywriter) e vibra 10 ms (gesto e bottone, dove si può); la memoria
`evidenzia:giro` si riscrive a ogni azione che cambia il giro; il contatto del
modulo non entra mai qui. Un cambio del giro dopo il mandato non cancella
`mandato`: lo dice `selCambiatoDopoInvio`.

**Nota sul tipo `IdAnnuncio`.** `content/annunci.ts` esporta un `IdAnnuncio`
letterale ("rif-214" | …); lo store usa `string` perché in memoria possono
esserci Rif. spariti e i moduli del gesto leggono gli id dal DOM
(`useTrascinaTappe` legge `data-evd-tappa`): con il tipo letterale non
compilerebbero. Il letterale è assegnabile allo store. Gli altri tipi
(`Annuncio`, `Rubrica`, `Formato`, `Tipologia`) si importano da
`content/annunci.ts`, come chiede il copywriter.

### 4.9 `state/persist.ts`

```ts
export const CHIAVI: { giro: 'evidenzia:giro' };     // decisione dell'orchestratore
export function leggi(chiave: string): string | null;
export function scrivi(chiave: string, valore: string): boolean;
export function rimuovi(chiave: string): void;
export function leggiJSON<T>(chiave: string, valida: (v: unknown) => v is T): T | null;
export function scriviJSON(chiave: string, valore: unknown): boolean;
```
Formato salvato: `{ versione: 1, segnati, ordine, partenza, daAgenzia, sabato: ISO | null, mandato }`.

### 4.10 `state/registro.ts`

```ts
export interface RigaTratto { x: number; y: number; w: number; h: number }   // locali dell'article, NON scalate
export interface Rettangolo { x: number; y: number; w: number; h: number }
export interface VoceAnnuncio { readonly id; readonly el: HTMLElement; readonly attacco: HTMLElement;
  readonly righe: readonly RigaTratto[]; readonly posizione: Rettangolo; readonly versione: number }
export const registro: {
  registra(id, el: HTMLElement, attacco: HTMLElement): () => void;   // in un useLayoutEffect di Annuncio.tsx
  get(id): VoceAnnuncio | undefined;
  tutti(): readonly VoceAnnuncio[];
  subscribe(fn: (id: IdAnnuncio | null) => void): () => void;       // null = rimisura generale
  invalida(): void;                                                  // Evidenzia/Foglio: font, layout
  azzera(): void;                                                    // solo Evidenzia.tsx
};
export function useVoceAnnuncio(id): VoceAnnuncio | undefined;      // oggetto NUOVO a ogni rimisura (Tratto)
export function useTuttiAnnunci(): readonly VoceAnnuncio[];          // per la Minipagina
```
Misure solo nella fase `read`: alla registrazione, su ResizeObserver
dell'article (uno solo per tutti), su `invalida()`. Righe raggruppate per top
(±2 px), al massimo 2; posizione nella pagina non scalata. Al cambio di vista
**non** si rimisura.

### 4.11 `foglio/Foglio.tsx`

`<Foglio>{figli}</Foglio>`: scroller + dimensionatore + pagina; registra
scroller e pagina; monta `usePan`, `useTastieraFoglio`, `usePizzico` sullo
scroller; misura area e contenuto; scrive `--evd-scala`, `--evd-intera-x/-y`,
`--evd-area-w/-h` sul dimensionatore solo in Pagina intera; nel layout effect
della vista nuova chiama `cambiaVista(pagina, foto, vista, punto, { scroller })`
con la foto presa da `impostaVista` (protocollo del motion-designer §6.1);
al cambio di layout `fermaVista()` e `registro.invalida()`.

---

## 5. CSS: ordine, classi, attributi

Ordine di import (Evidenzia.tsx): `styles/tokens.css` → `styles/base.css` →
`styles/layout.css` → `foglio/foglio.css` → `interaction/interaction.css` →
CSS delle sezioni (importati dai componenti). Tutti i selettori iniziano con
`.evd-root`; nessun hex fuori da `styles/tokens.*`.

| Classe / attributo | Chi | Note |
|---|---|---|
| `.evd-root[data-layout|data-vista|data-motion|data-pannello]` | Evidenzia.tsx | `data-pan` non c'è: usePan scrive `data-evd-pan` sullo scroller |
| `.evd-foglio`, `.evd-dimensionatore`, `.evd-pagina` | Foglio.tsx | zone vuote trascinabili per usePan: `.evd-pagina`, `.evd-colonne` |
| `.evd-colonne` | main di Evidenzia.tsx | griglia 6 × 268 / 20, filetti dal fondo |
| `.evd-sr`, `.evd-salto`, `.evd-live`, `.evd-lista` | base/layout.css | solo lettore di schermo; link di salto; regione live; lista senza puntini |
| `data-evd-afferra` | Testata (header), Annunci (barre di rubrica, contenitori delle fasce), Piede | la mano; **non** sui box |
| `data-evd-annuncio`, `data-evd-attacco`, `data-evd-no-tratto` | Annunci | interaction §3.3 e §6 |
| `data-evd-retino` | Annunci (contenitore della foto a retino) | grigio piatto in Pagina intera |
| `data-evd-vivo` | regione live | resta viva sotto i dialoghi |
| `data-evd-stacco="fuori"` | motion/stacco.ts sull'article | lo stila Annunci (ritaglio vuoto, stessa scatola) |
| `data-evdvar` | nodi foglia scritti nel `write` | tratto, rettangolo della minipagina, tappe |

---

## 6. Sezioni da costruire: chi, quali file, che porta

I nove nomi dell'ux-architect ("Sezioni da costruire") stanno nei sette
builder del tech-architect §4 (stesse cartelle, porte di tech-architect §11).
Una sola correzione: il **piede** va al builder dei box, come dice la nota
dell'ux (tipografia di servizio condivisa), quindi `Piede.tsx` è in
`sections/Box/` e non in `sections/Testata/`.

| Builder | Sezioni ux | File (stub già creati in grassetto) | Monta / è montato da | Porta |
|---|---|---|---|---|
| **section-builder-testata** | `testata`, `riquadro-di-testa` | **`sections/Testata/Testata.tsx`**, **`RiquadroTesta.tsx`**, **`StrisciaRubriche.tsx`**, **`testata.css`**, `docs/section-builder-testata.md` | Evidenzia.tsx (dentro Foglio); RiquadroTesta è il primo figlio del `main` | 9162 |
| **section-builder-annunci** | `annunci` + l'impaginato di `foglio` | **`sections/Annunci/Rubriche.tsx`**, **`annunci.css`**, `Rubrica.tsx`, `Annuncio.tsx`, `FotoRetino.tsx`, `Cerchiamo.tsx`, `impaginato.ts`, `docs/section-builder-annunci.md` | Rubriche da Evidenzia.tsx; importa i Box e `Comandi/HaiSegnato` | 9163 |
| **section-builder-box** | `box-redazionali` + piede | **`sections/Box/Listino.tsx`**, **`VendiCasa.tsx`**, **`Agenzia.tsx`**, **`HannoComprato.tsx`**, **`Piede.tsx`**, **`box.css`**, `docs/section-builder-box.md` | i box da Annunci (nessuna posizione propria); Piede da Evidenzia.tsx | 9164 |
| **section-builder-comandi** | `barra-del-giro` + Leggi / Pagina intera e minipagina di `foglio` | **`sections/Comandi/Comandi.tsx`**, **`HaiSegnato.tsx`**, **`comandi.css`**, `Minipagina.tsx`, `Vista.tsx`, `BarraGiro.tsx`, `docs/section-builder-comandi.md` | Comandi da Evidenzia.tsx (fuori dal foglio); HaiSegnato da Annunci | 9165 |
| **section-builder-scheda** | `scheda-casa` | **`sections/Scheda/Scheda.tsx`**, **`scheda.css`**, `StrisciaFoto.tsx`, `Consistenza.tsx`, `docs/section-builder-scheda.md` | Evidenzia.tsx, solo con `schedaAperta` (`key` = id) | 9166 |
| **section-builder-giro** | `giro-colonna` | **`sections/Giro/Giro.tsx`**, **`giro.css`**, `ColonnaGiro.tsx`, `Tappa.tsx`, `ChiSei.tsx`, `calcolo.ts`, `ics.ts`, `invio.ts`, `docs/section-builder-giro.md` | Evidenzia.tsx con `lazy()`, solo con `giroAperto`; importa `mappa/` con `lazy()` | 9167 |
| **section-builder-mappa** (in parallelo) | `giro-mappa` | **`mappa/index.ts`**, **`mappa/MappaGiro.tsx`**, `motore.ts`, `percorso.ts`, `mappa.css`, `docs/section-builder-mappa.md` | Giro (lazy, Suspense con il riquadro di carta) | 9168 |

Il resto di `foglio` (lo scroller nei due assi, la griglia, Pagina intera, gli
scroll-padding, il montaggio di pan, tastiera e pizzico) è già dello scaffold.

Ogni stub è un **default export senza prop** (tranne `MappaGiro`, che ha già
le prop del contratto) che rende l'elemento radice con la classe giusta. Scheda
e Giro hanno già `useDialogo` collegato. Dopo lo scaffold i file sono del
builder indicato; lo scaffold non li tocca più.

### 6.1 Contratti per ogni builder (oltre a §4)

- **Testata**: `selSabatoTestata` (null → `DATA_PRERENDER` con la larghezza
  riservata); sommario con `href={'#' + idRubrica(r)}`; `data-evd-afferra`
  sull'header (non sui link); `<TrattoSu id="segna" modo="dimostrativo">`
  sulla parola "Segna" (fa da sé l'attesa dei font); StrisciaRubriche
  restituisce `null` in layout `foglio`.
- **Annunci**: markup di interaction-designer §3.3 (article con
  `id={a.id}`, `data-evd-annuncio`, `position: relative`; attacco nel bottone
  dell'h3 con `data-evd-attacco`; `registro.registra` in un `useLayoutEffect`;
  `useEvidenziatore(ref, id)`; `<Tratto id>` dopo il testo). **Bottone
  Evidenzia (decisione dell'orchestratore): etichetta fissa
  `ANNUNCIO.evidenzia` + `aria-pressed` + nome `ANNUNCIO.evidenziaAria(a)`;
  lo stato visibile non cromatico è la riga `ANNUNCIO.rifNelGiro(a)` al posto
  di `ANNUNCIO.rif(a)`** e il bottone pieno nero di `evd-ix-interruttore`;
  `alterna(id, 'bottone')`. L'h2 di ogni barra di rubrica: `id={idRubrica(r)}`
  e `tabIndex={-1}`; `data-evd-afferra` su barre e contenitori delle fasce.
  Contenitore della foto a retino con `data-evd-retino`, `<img>` con `width`
  e `height`. Riga del quinto quando `store.scarico === id`, chiusa con
  `chiudiScarico()` dopo `SCARICO.avvisoMs`. `[data-evd-stacco="fuori"]` come
  ritaglio vuoto della stessa scatola. HaiSegnato in fondo al `main` solo in
  colonna. Impaginato: aree della griglia in annunci.css, compreso
  `.evd-riquadro`.
- **Box**: nessuna posizione propria; Piede con i crediti di
  `assets/foto/index.ts` (`CREDITI`: `autore`, `url`, `licenza`,
  `licenzaUrl`) e `data-evd-afferra`; recapiti solo da `core/links.ts`.
- **Comandi**: `id={ID_PREPARA}` sul bottone "Prepara il giro" (→
  `apriGiro()`); Leggi / Pagina intera **solo** con `chiediVista()`
  (`evd-ix-interruttore`, `aria-pressed`); minipagina con `useTuttiAnnunci()` e
  `runtime.foglio` nel `write` del ticker, `vaiA(x, y, { liscio: false })` al
  trascinamento; posti: `mostraElemento(registro.get(id).el, 16)` + fuoco
  sull'attacco; posti che si riempiono/svuotano con `disegnaDaBottone` /
  `scolora`; "Hai segnato" con `<TrattoSu id>`. La regione live è già in
  Evidenzia.tsx: si scrive con `annuncia()`.
- **Scheda**: `useDialogo(ref, { tipo: 'scheda', hash: hashScheda(a.rif),
  onChiudi, fuocoIniziale, ritornoFuoco })`; con `aperturaDaUrl` niente
  stacco (`stacca(null, …)`); chiusura: `rimetti` + `nascondiVelo`, poi
  `chiudiScheda()`; toggle `alterna(id, 'scheda')`. Il clone dello stacco va in
  uno strato dentro `.evd-root` fuori dal foglio (il genitore della scheda va
  bene).
- **Giro**: `useDialogo(ref, { tipo: 'giro', hash: HASH_GIRO, … })`;
  `selSabato`, `calendario.proposti/tardi/chiuso`, `sabatoPassato`, `sparite`;
  `sposta(id, verso, ordineMostrato)`, `riordina`, `ordineAutomatico`;
  `impostaInvio`, `simula.invioKo`, al successo `segnaMandato({ sabato: iso,
  tappe })` e `track('demo_prenotazione', { concept: 16, case: n })`;
  `selCambiatoDopoInvio`. Mappa con `lazy(() => import('../../mappa'))`.
- **Mappa**: prop `MappaGiroProps` di `mappa/MappaGiro.tsx` (le tappe arrivano
  già calcolate); `impostaMappa()`; `simula.mappaKo` → errore subito, senza
  tile; `OSM_COPYRIGHT_URL`, `osmZonaUrl()`; Leaflet solo con `import()`
  dentro `mappa/`. Il chunk `leaflet` è già previsto in `vite.config.ts`.

---

## 7. Richieste raccolte dall'ondata 2 e come sono state chiuse

| Da | Richiesta | Fatto |
|---|---|---|
| interaction-designer §8 | `impostaVista(v, puntoFisso?)` col protocollo `fotografaVista` → `store.set` → `cambiaVista` nel layout effect di Foglio | sì (§4.8, §4.11), provato in volo |
| interaction-designer §8 | i tre hook montati da Foglio.tsx; `interaction.css` dopo tokens e base; `segni.azzera()` e `azzeraCambioVista()` allo smontaggio | sì |
| interaction-designer §8 | `useVoceAnnuncio` restituisce un oggetto nuovo a ogni rimisura; righe non scalate, max 2 | sì |
| interaction-designer §8 | classi `evd-foglio`, `evd-pagina`, `evd-colonne`; niente `data-pan` sulla radice | sì |
| motion-designer §8 | `registraAvanzamento()` al mount; `variabiliMotion(reducedMotion)` nello style di `.evd-root`; `fermaVista()` allo smontaggio; `runtime.tratti` mutabile; `reducedMotion` giusto al primo render; nessuna `transition` sul transform della pagina; `transform-origin: 0 0` | sì |
| art-director §4 | base.css (radice, selezione, h1-h3 in Franklin senza margini, bottoni a raggio 0); fonts da `FONT_CSS_URL` / `FONT_DA_CARICARE`; fondo inline in index.html; filetti a `xFiletto(n)`; retino piatto in Pagina intera | sì |
| copywriter | `links.ts` da `AGENZIA`; `sabato.ts` con `CALENDARIO` e oggetti `Giorno`; `annuncia` con `voceAggiunto` / `voceTolto`; `?segna=` con `idDaRif`; tipi da `content/annunci.ts` | sì (`IdAnnuncio` resta `string`, nota §4.8) |
| copywriter / ux / tech | chiave di memoria unica | `evidenzia:giro` (decisione dell'orchestratore) |
| brand-strategist | `tel:+390434000000`, `agenzia@evidenzia.example`; regola 9.3 nel calcolo del sabato | sì (da `AGENZIA` e `CALENDARIO`) |
| vector-artist | `vite/client` per `?raw`; `semeDa` a 32 bit senza segno | sì |
| photo-editor | tipi `*.png` / `*.webp` da `vite/client`; `retino2` e `licenza` / `licenzaUrl` nei crediti | sì: `assets/foto/index.ts` compila così com'è |
| ux-architect | history `#scheda-<rif>` e `#giro` con `pushState` / `popstate`; `?segna=`, `?rubrica=`; `inert` su foglio e molo; una regione live fuori dal foglio; scroll-padding | sì (§4.6, §3) |
| orchestratore | bottone Evidenzia a etichetta fissa + `aria-pressed` | contratto scritto per Annunci (§6.1) |

Scostamenti dal tech-architect, dichiarati: `IdAnnuncio = string`; piede nei
Box; `GiroMandato` con `daAgenzia` e `impronta`; nello store in più
`calendario`, `sabatoPassato`, `sparite`, `aperturaDaUrl`, `voceLiveN`,
`daUrl`; history con l'hash dell'ux invece della "stessa URL" (la rotta resta
la stessa); `sposta` con il terzo argomento `base`; `mostraElemento` con il
terzo argomento facoltativo.

---

## 8. Problemi aperti e richieste ad altri agent

- **art-director**: manca `--evd-z-stacco: 45` in `tokens.css` (lo chiede il
  motion-designer; il clone usa il ripiego 45, funziona comunque). In Pagina
  intera il foglio scalato sta su carta uguale al fondo: se serve un bordo del
  foglio, è un token tuo da usare in `foglio.css` (chiedilo, lo aggiungo io).
- **copywriter**: `PIEDE.credito` / `creditoAria` dicono "su Unsplash", ma le
  foto sono di Flickr con licenza CC (photo-editor §6): serve la formula con
  autore e licenza.
- **section-builder-annunci**: il bottone Evidenzia nello snippet di
  interaction-designer §3.3 cambia testo ("Nel giro"): vale invece la
  decisione dell'orchestratore (etichetta fissa, §6.1).
- **performance-auditor** (ondata 4): il JS del concept è già 26 KB gz con i
  soli testi; restano 34 KB per le sezioni.
- **Ambiente**: `/home/user/cicerilab` non c'è: ConceptBackButton e analytics
  sono le copie del pilota (stessa firma); al porting si usano quelli del sito.
