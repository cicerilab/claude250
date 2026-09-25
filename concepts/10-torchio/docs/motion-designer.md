# Motion designer · Concept 10 · IMPRONTA

Ondata 2. Documento vincolante per chi muove qualcosa nel concept: scaffold,
section-builder, shader-engineer, interaction-designer. Qui ci sono le curve,
le molle, la coreografia dello scroll sezione per sezione, le transizioni, le
variabili CSS esposte e i contratti che lo scaffold deve rispettare perché il
mio codice funzioni.

Letti: `docs/processo-agent.md`, `creative-director.md`, `trend-researcher.md`,
`brand-strategist.md`, `ux-architect.md`, `tech-architect.md` (in particolare
§2.2-2.3, §6, §7), `.claude/skills/design-taste-frontend/SKILL.md` (sez. 5,
6.B, 9.G), `.claude/skills/full-output-enforcement/SKILL.md`. Letti anche, per
allinearmi, i file già scritti in parallelo da art-director
(`styles/tokens.css`, `styles/relief-fallback.css`) e interaction-designer
(`interaction/*.ts`).

File miei (tutti in `src/pages/concepts/impronta/motion/`):

| File | Contenuto |
|---|---|
| `easing.ts` | curve (funzioni TS + stringhe CSS), utilità numeriche, `cubicBezier`, `cssLinear` |
| `spring.ts` | `Molla` analitica sul dt, preset `MOLLE`, `seguiDt`, `seguiAngoloDt` |
| `choreography.ts` | tutte le costanti di tempo e soglia, profili di pressione, intervalli di scroll, funzioni pure (onda, soste del filo, isteresi, ancore), `variabiliMotion()` |
| `usePressione.ts` | hook della pressa: ingresso con IO, molla/curva nel ticker, `registry.setPressione`, `--imp-press`, gesti (hover, battuta, ristampa, leva) |
| `useScrollProgress.ts` | `useScrollProgress`, `useFilo`, `arrivaAScroll`, `arrivaAllAncora`, `viaggioAncora` |

Verifiche fatte: `tsc` in modalità `strict` + `noUncheckedIndexedAccess` +
`noUnusedLocals/Parameters` e ESLint 9 con `typescript-eslint` e
`react-hooks` (le stesse regole del progetto) su tutti e cinque i file, contro
stub costruiti esattamente sui contratti del §4: zero errori, zero avvisi.
Verifiche numeriche: la pressa resta in 0..1, tocca 1 al 58% del tempo, il
ritorno elastico scende a 0,9828 (1,7%) e il secondo rimbalzo vale lo 0,3%;
la molla dà lo stesso valore con 1 passo da 0,1 s o 6 passi da 1/60 s (errore
nullo alla sesta cifra); `conSoste` è monotona; l'isteresi non cambia passo a
0,26 ma cambia a 0,28.

---

## 0. Decisioni in breve

1. **Niente GSAP** (come deciso da tech-architect §2.2). Ho cercato un caso che
   non si reggesse senza: non c'è. Nessuna timeline annidata, nessuno stagger
   complesso, il pin lo fa `position: sticky`. Tutto gira nel ticker unico.
2. **Una sola curva firma, la pressa**, e tutto il resto è una sua variazione
   (rilascio, ristampa, battuta, leva, urto). Il sito ha un solo verbo: premere.
3. **La pressa è a tempo, le correzioni sono a molla.** La discesa d'ingresso
   è una curva deterministica (durata esatta, ritorno esatto dell'1,6%); ogni
   interruzione (hover, battuta, leva lasciata) passa a una molla che eredita
   posizione e velocità, così non c'è mai uno scatto.
4. **Nessun valore caldo in React state.** Hook e motori scrivono su
   `registry` (per il GL) e su variabili CSS inline (per DOM e fallback)
   dentro le fasi `update` e `write` del ticker. Nessun rAF proprio, nessun
   listener `scroll`.
5. **Il motion scrive solo `--imp-press`** (0..1) sui blocchi premuti, mai
   `font-variation-settings` né variabili d'asse. La traduzione in assi di
   Anybody la fa il CSS dell'art-director (`.imp-pressa`: larghezza d'arrivo
   per 0,8 + 0,2 p, peso da 700 all'arrivo), che conosce l'arrivo di ogni
   titolo e lo adatta alla larghezza: a 375 px l'arrivo dell'hero è più
   stretto, così la parola non scende a 40 px. In JS, se servisse, c'è
   `assiPressione()` in `styles/tokens.ts`. Con il GL acceso gli assi restano
   fermi all'arrivo e la discesa la fa lo shader. Una sola fonte.
6. **Una pressa per blocco, una volta sola.** Il testo in inchiostro è fermo
   dal primo frame. Niente fade-up, niente reveal, niente loop.
7. **Reduced motion = stato finale immediato** ovunque, con due sole
   eccezioni volute e dichiarate: la dissolvenza di 200 ms del cambio carta e
   la leva, che resta un "tieni premuto" di 900 ms (è un gesto, non
   un'animazione) ma senza ritorno elastico.

---

## 1. Principi (da rispettare anche in ciò che non è scritto qui)

- **Chi lo spinge?** (trend-researcher P11). Ogni movimento ha una causa fisica:
  la pressa (pressione), la mano (luce, leva), lo scorrimento (filo, pin), la
  carta che assorbe (onda). Se un movimento non ha una causa, non esiste.
- **Il materiale cambia, il layout no** (P10). Nessuna sezione si ridispone,
  nessun elemento entra o esce scorrendo. Si muovono solo profondità, luce,
  colore della carta, lunghezza del filo, rotazione del taglio colorato.
- **Niente lampi.** Nessun cambio di luminosità ripetuto, meno di 3 al secondo
  in qualsiasi caso. Il cambio carta è un evento unico di 700 ms. Nessuna
  animazione infinita (l'arco della luce nell'hero è dell'interaction-designer
  ed è lentissimo: un giro in 40 s).
- **Solo `transform`, `opacity` e variabili che pilotano ombre o shader.** Gli
  assi variabili dei titoli cambiano larghezza del testo, ma solo su parole a
  riga singola dentro un contenitore già dimensionato allo stato finale
  (tech-architect §7.4, art-director `.imp-pressa`): zero CLS.
- **Il contenuto non aspetta mai un'animazione** per essere leggibile o
  cliccabile (ux-architect 6.4).

---

## 2. Le curve (`easing.ts`)

Tutte le curve sono funzioni `(t: number) => number` con `t` in 0..1, limitate
in ingresso. Le versioni CSS sono in `BEZIER_CSS` e in `pressaCss()`.

| Nome | Forma | Uso | CSS |
|---|---|---|---|
| `pressa` | 0 → 58%: `1 - (1-u)^2,6` (discesa rapida, frena a velocità nulla sul contatto). 58% → 100%: `1 - 0,016 · ritornoElastico(u)` (la carta restituisce e si riassesta). Continua con derivata continua, sempre in 0..1 | ingresso di ogni blocco, seconda metà della ristampa | `linear(...)` a 65 campioni da `pressaCss()`; approssimazione `cubic-bezier(0.2, 0.86, 0.3, 1)` |
| `ritornoElastico(u)` | `e^(-3,4u) · sin²(2πu)`, normalizzato: primo picco 1 a u = 0,25, secondo 0,18 a u = 0,75, 0 agli estremi con derivata nulla, mai negativo | il contatto della leva (`urto`), la parte finale di `pressa` | nessuna |
| `pressaSenzaRitorno` | `1 - (1-u)^2,6` | leva con reduced motion | come `pressa` bezier |
| `rilascio` | `cubic-bezier(0.5, 0, 0.18, 1)`: un attimo di adesione, poi sale e si posa | platina che si alza (ristampa, invio fallito) | stessa |
| `leva` | `cubic-bezier(0.3, 0.12, 0.34, 1)`: quasi proporzionale al tempo, frena in fondo | pressione della prova mentre si tiene la leva | stessa |
| `assorbe` | `cubic-bezier(0.16, 0.64, 0.32, 1)`: parte rapida dal punto toccato e rallenta come una macchia | raggio dell'onda di cambio carta | stessa |
| `sfoglia` | `cubic-bezier(0.22, 0.61, 0.24, 1)` | segnapagina che entra, indice che sale, lastra del banco | stessa |
| `sfogliaVia` | `cubic-bezier(0.4, 0, 0.7, 0.2)` | segnapagina e indice che escono | stessa |
| `scorrimento` | `cubic-bezier(0.62, 0.02, 0.2, 1)`: la spinta del braccio sul carrello del tirabozze, attraversa, frena lungo | viaggio verso un'ancora (lenis) | stessa |
| `lineare` | `t` | solo dissolvenze di opacità (comparsa GL, cambio carta ridotto) | `linear` |

Utilità esportate: `clamp`, `clamp01`, `lerp`, `inverseLerp`, `progressoTra`,
`smoothstep01`, `smootherstep01`, `smootherstep`, `derivata`, `cubicBezier`,
`cssLinear`, `CURVE` (mappa nome → funzione).

Valori di controllo della pressa (t → valore): 0 → 0; 0,1 → 0,389; 0,3 →
0,849; 0,5 → 0,994; 0,58 → 1; 0,62 → 0,991; 0,68 → 0,983; 0,75 → 0,997; 1 → 1.

---

## 3. Le molle (`spring.ts`)

`Molla` risolve in forma chiusa l'oscillatore smorzato a ogni passo (tre casi:
sotto-smorzato, critico, sovra-smorzato): stessa traiettoria a 30, 60, 120 Hz,
stabile anche dopo un frame lungo. Il passo è limitato a 0,1 s (oltre, il
frame è una pausa). Si ferma esattamente sull'obiettivo sotto 1e-4 di
distanza e 1e-3 di velocità.

| Preset | Frequenza | Zeta | Sovraelongazione (salto unitario) | Uso |
|---|---|---|---|---|
| `carta` | 3,6 Hz | 0,75 | 2,8% | interruzioni della pressa, cambi di obiettivo generici |
| `battuta` | 7,5 Hz | 0,70 | 4,6% (su un salto di 0,08: 0,4%) | ritorno dopo una lettera nuova nel banco |
| `morbida` | 2,6 Hz | 1 | 0 | hover e fuoco sui pezzi e sulle carte |
| `tiro` | 3,2 Hz | 0,80 | 1,5% | il filo che si tende su una fermata |
| `risalita` | 2,2 Hz | 1 | 0 | la carta che risale quando la leva si lascia presto (la usa `useHoldToConfirm`) |

API: `new Molla(iniziale, parametri)`, `.verso(obiettivo)`, `.salta(v)`,
`.spingi(velocita)`, `.imposta(parametri)`, `.passo(dt): boolean`, `.ferma`,
campi pubblici `valore`, `velocita`, `obiettivo`.
Per la luce: `seguiDt(corrente, obiettivo, fattore60, dt)` e
`seguiAngoloDt(...)` (via più corta sugli angoli), lerp 0,08 per frame a 60 Hz
reso indipendente dal frame rate (li usa già `interaction/light.ts`).

---

## 4. Contratti richiesti allo scaffold

I miei file importano questi moduli con queste firme esatte. Sono coerenti con
tech-architect §2.3, §6, §7 e con l'uso che già ne fa
l'interaction-designer (`interaction/light.ts`, `paperWave.ts`,
`useHoldToConfirm.ts`): **un solo contratto per tutti**. In particolare la
firma della funzione di tick è `(dt, now)` e le fasi hanno i nomi inglesi,
perché così le usa già il codice dell'interaction-designer.

### 4.1 `core/ticker.ts`

```ts
export type FaseTicker = 'read' | 'update' | 'write' | 'render';

/**
 * dt: secondi dal frame precedente, limitati a [0, 0.05]; il primo frame dopo
 *     un risveglio riceve 1/60.
 * now: timestamp del frame in ms (quello passato da requestAnimationFrame,
 *     stessa base di performance.now()).
 * Ritorno: true = "mi sto ancora muovendo, serve un altro frame".
 *     false o undefined = "per me si può dormire".
 */
export type TickFn = (dt: number, now: number) => boolean | void;

export interface Ticker {
  /** Registra fn nella fase indicata (default 'update'). Sveglia il ticker. Restituisce la funzione di rimozione. */
  add(fn: TickFn, fase?: FaseTicker): () => void;
  /** Chiede almeno un altro frame (input, IO, cambio di stato). */
  wake(): void;
  /** true se il ciclo rAF è attivo. */
  readonly running: boolean;
}

export const ticker: Ticker;
```

Semantica obbligatoria:
1. Ordine in ogni frame: `lenis.raf(now)` → aggiornamento di
   `runtime.scrollY` → fase `read` → `update` → `write` → `render`. Dentro una
   fase, ordine di registrazione.
2. **Aggiungere o togliere durante un frame è sicuro**: una fn aggiunta durante
   il frame parte dal frame successivo; una fn tolta non viene più chiamata,
   neanche nelle fasi successive dello stesso frame. (I miei motori si tolgono
   da soli nella fase `write` quando arrivano a riposo.)
3. Il ciclo continua finché, nell'ultimo frame, almeno una fn ha restituito
   true, oppure è stato chiamato `wake()`, oppure lenis sta scorrendo
   (`lenis.isScrolling`). Altrimenti si ferma. `add()` sveglia sempre.
4. `visibilitychange` → nascosto: fermo. Visibile: `wake()`.
5. Un'eccezione in una fn non ferma il ciclo (try/catch per fn, errore in
   console solo in sviluppo).
6. Nessun accesso al browser a livello di modulo: il rAF si crea al primo
   `add`/`wake` (o in `start()` chiamato da `Impronta.tsx`).

### 4.2 `state/runtime.ts`

Uso questi campi (il resto dell'oggetto è quello di tech-architect §6.2):

```ts
export interface Runtime {
  /** px, scroll corrente: lenis.animatedScroll, o window.scrollY senza lenis. Aggiornato prima della fase 'read'. */
  scrollY: number;
  /** px CSS e DPR. h = window.innerHeight. Aggiornato su resize (e visualViewport resize). 0 prima del montaggio. */
  viewport: { w: number; h: number; dpr: number };
  dirty: boolean;
  markDirty(): void;
}
export const runtime: Runtime;
```

Con reduced motion lenis non esiste: `core/lenis.ts` deve comunque tenere
aggiornato `runtime.scrollY`. Va bene un listener `scroll` passivo che fa
**solo** `ticker.wake()` (nessun calcolo nel listener, quindi dentro la regola
5.D della skill); il valore si legge da `window.scrollY` nel frame.

### 4.3 `state/store.ts`

```ts
export const store: {
  get(): ImprontaState;                    // uso: .reducedMotion
  set(patch: Partial<ImprontaState> | ((s: ImprontaState) => Partial<ImprontaState>)): void;
  subscribe(fn: () => void): () => void;
};
export function useImpronta<T>(
  selector: (s: ImprontaState) => T,
  isEqual?: (a: T, b: T) => boolean,
): T;
```

`reducedMotion: boolean` deve essere già corretto al primo render lato
client (letto in modo sincrono con `matchMedia` dentro l'inizializzazione
dello store al mount, con listener per i cambi), così nessun blocco parte con
la pressa e poi salta.

### 4.4 `relief/registry.ts` e `relief/useRelief.ts`

```ts
export const registry: {
  /**
   * v viene limitato a 0..1. Se il valore cambia, aggiorna block.pressione e
   * chiama runtime.markDirty(). Id sconosciuto (blocco già rimosso): nessun effetto.
   * Chiamata anche a ogni frame durante una pressa: deve costare O(1) (Map per id).
   */
  setPressione(id: string, v: number): void;
  // ... resto dell'API di tech-architect §7.2
};

/** Registra il blocco al mount e restituisce il suo id (null fino alla registrazione). */
export function useRelief(ref: RefObject<HTMLElement | null>, spec: ReliefSpec): string | null;
```

Il registro **non** deve dare una pressione di default diversa da quella che
gli passo: un blocco appena registrato con `pressione` iniziale 0 va bene
perché `usePressione` gli manda il valore corrente appena riceve l'id.

### 4.5 `core/lenis.ts`

```ts
import type Lenis from 'lenis';
/** L'istanza creata da Impronta.tsx, o null (reduced motion, prerender, prima del mount, dopo lo smontaggio). */
export function getLenis(): Lenis | null;
```

Lenis va creato con `autoRaf: false` (lo guida il ticker) e deve svegliare il
ticker quando arriva input: `lenis.on('virtual-scroll', () => ticker.wake())`.
Uso di lenis da parte mia: solo `lenis.scroll` e
`lenis.scrollTo(y, { duration, easing, lock: true, force: true, onComplete })`.

### 4.6 `Impronta.tsx` (tre righe da aggiungere)

1. Style inline di `.imp-root`: `style={variabiliMotion(reducedMotion)}` (da
   `motion/choreography`, restituisce un `Record<\`--imp-${string}\`, string>`;
   in React va passato come `React.CSSProperties`). Contiene curve e durate
   per le transizioni CSS (§8).
2. Hash iniziale (`#banco` nell'URL, o qualsiasi ancora): al mount
   `history.scrollRestoration = 'manual'` e, se il browser ha già saltato
   all'ancora, `window.scrollTo(0, 0)` subito (prima della pressa, quindi
   invisibile); poi
   `setTimeout(() => arrivaAllAncora(id), reducedMotion ? 0 : ANCORE.attesaIniziale)`.
   Si vede la pressa scendere nell'hero, poi il foglio scorre al banco
   (ux-architect 1). L'hash nell'URL si lascia com'è.
3. Clic sui link interni: un solo listener delegato su `.imp-root` per
   `a[href^="#"]` → `preventDefault()` → `arrivaAllAncora(id)`. Così testata,
   segnapagina, indice, colophon, "Prova la tua", "cos'è?", "Torna al banco"
   hanno tutti lo stesso viaggio e lo stesso fuoco all'arrivo.

---

## 5. API dei miei moduli (per section-builder e shader-engineer)

### 5.1 `usePressione(ref, opzioni): ComandiPressione`

```ts
interface OpzioniPressione {
  profilo: ProfiloPressione;              // da PROFILI in choreography.ts
  reliefId?: string | null;               // da useRelief
  ingresso?: 'vista' | 'montaggio' | 'manuale';   // default 'vista'
  indice?: number;                        // per lo sfasamento tra fratelli
  osserva?: RefObject<Element | null>;    // chi fa scattare l'ingresso (default ref)
  bersaglio?: RefObject<HTMLElement | null>; // dove scrivere --imp-press e data-imp-pressa (default ref)
  attendi?: () => Promise<unknown>;       // solo 'montaggio': es. () => document.fonts.ready
}

interface ComandiPressione {
  valore(): number;
  premi(obiettivo?: number, o?: { durata?: number; curva?: Easing; rispettaTempo?: boolean; poi?: () => void }): void;
  verso(obiettivo: number, molla?: ParametriMolla): void;
  rilascia(obiettivo?: number, durata?: number): void;
  urto(ampiezza?: number, durata?: number): void;
  battuta(): void;
  ristampa(alFondo: () => void): void;
  hover(attivo: boolean): void;
  imposta(valore: number): void;
  segui(valore: number): void;
  riarma(): void;
}
```

Comportamento:
- Al mount (non ridotto) il blocco è messo a pressione 0 e
  `data-imp-pressa="attesa"`. All'innesco: curva `pressa` da 0 al riposo del
  profilo, `data-imp-pressa="in-corso"`, poi `"premuta"`. Mai più.
- L'innesco `'vista'` usa un IntersectionObserver con `rootMargin` del
  profilo e `threshold: 0` (una soglia di rapporto non funziona sulle sezioni
  più alte dello schermo). Si scollega dopo il primo innesco.
- Durante un viaggio verso un'ancora (`viaggioAncora.attivo()`) gli inneschi
  sono sospesi: i blocchi sorvolati restano in attesa e premono all'arrivo se
  sono in vista, oppure quando il lettore ci torna.
- Ogni frame in moto: `registry.setPressione(reliefId, v)` in fase `update`,
  `--imp-press` (4 decimali, solo se cambia di almeno 1e-4) in fase `write`.
- I valori sono sempre in 0..1.
- l'oggetto `ComandiPressione` restituito è stabile (stessa identità per
  tutta la vita del componente): si può passare a callback e dipendenze senza problemi.

### 5.2 `useScrollProgress(ref, opzioni): ProgressoScroll`

```ts
interface OpzioniScroll {
  intervallo?: Intervallo;          // default INTERVALLI.pin
  variabile?: string | null;        // default '--imp-scroll-p'
  derivate?: Record<string, (p: number) => number>;
  bersaglio?: RefObject<HTMLElement | null>;
  passi?: number; isteresi?: number;
  onProgresso?: (p: number) => void;
  onPasso?: (indice: number, precedente: number) => void;   // precedente = -1 alla prima valutazione
  valoreRidotto?: number;           // default 1
  passoRidotto?: number;            // default 0
  margineAttivo?: string;           // default '50% 0px'
}
interface ProgressoScroll {
  valore(): number; passo(): number; misura(): void;
  scrollPer(p: number): number | null;
  vaiA(p: number, opzioni?: OpzioniArrivo): void;
}
```

`Intervallo = { inizio: [Bordo, frazioneViewport], fine: [Bordo, frazioneViewport] }`,
`Bordo = 'top' | 'center' | 'bottom'`. Esempi: `INTERVALLI.pin` =
`{ inizio: ['top', 0], fine: ['bottom', 1] }` (0 quando il contenitore si
fissa, 1 quando si stacca); `INTERVALLI.attraversa` =
`{ inizio: ['top', 1], fine: ['bottom', 0] }`.

Misura in coordinate documento al mount, su ResizeObserver dell'elemento, su
resize (150 ms) e a font pronti; nessuna lettura di layout durante lo scroll.
Attivo per frame solo entro mezza viewport; uscendo fa un'ultima valutazione
esatta, così un salto lungo lascia 0 o 1 e non un valore a metà.

### 5.3 `useFilo(ref, opzioni): ProgressoFilo`

```ts
interface OpzioniFilo {
  fermate: RefObject<ReadonlyArray<HTMLElement | null>>;  // un elemento per legatura
  soste?: readonly number[];          // frazioni del tracciato, default LEGATORIA.soste
  bersaglio?: RefObject<HTMLElement | null>;
  onSosta?: (indice: number) => void; // ultima fermata agganciata, -1 nessuna
}
interface ProgressoFilo extends ProgressoScroll { filo(): number; sosta(): number }
```

### 5.4 Ancore

```ts
arrivaAllAncora(id: string, o?: { ridotto?: boolean; fuoco?: boolean; onArrivo?: () => void }): boolean
arrivaAScroll(y: number, o?: { ridotto?: boolean; onArrivo?: () => void }): void
viaggioAncora: { attivo(): boolean; inizia(): void; finisce(): void; ascolta(fn): () => void }
```

### 5.5 `choreography.ts`

Esporta: `VAR`, `ATTR`, `ATTESA_PRESSA`, `PROFILI`, `RISTAMPA`, `BATTUTA`,
`LEVA`, `HOVER`, `ESEMPIO_LEGGERO`, `INTERVALLI`, `HERO`, `PER_CHI`,
`TECNICHE`, `CARTA`, `LEGATORIA`, `BANCO`, `BOTTEGA`, `COLOPHON`,
`SEGNAPAGINA`, `INDICE`, `ANCORE`, `GL`,
`LARGHEZZA_STRETTA` (768), `LARGHEZZA_TESTATA` (1024) e le funzioni pure
`eStretto`, `ritardoConSfasamento`, `pressioneLeva`,
`scrollPerBordo`, `progressoIntervallo`, `scrollPerProgresso`,
`indiceConIsteresi`, `giroTecniche`, `gradiGiroTecniche`,
`progressoSaltoTecnica`, `raggioFinaleOnda`, `statoOnda`, `conSoste`,
`durataAncora`, `margineAncora`, `variabiliMotion`.

**Nessun section-builder scrive numeri di tempo propri**: se ne serve uno che
non c'è, lo chiede a me.

---

## 6. Coreografia sezione per sezione

Notazione delle timeline: `t` in ms dall'innesco; "valore" è la pressione
`--imp-press` del blocco (e la stessa nel registro per lo shader).

### 6.0 Apertura della pagina (timeline globale)

| t (ms dal mount) | Cosa succede | Chi |
|---|---|---|
| 0 (prima pittura, anche prerender) | Carta piena, testi in inchiostro già al loro posto e leggibili (LCP = H1 nel DOM). I blocchi premuti nascono con `data-imp-pressa="attesa"` nel markup, quindi piatti. Nessun preloader. | markup + CSS art-director |
| 0 | Hero: `usePressione` con `ingresso: 'montaggio'` aspetta `document.fonts.ready`, al massimo 450 ms | motion |
| font pronti (≤ 450) + 160 | **La pressa scende** sulla parola *impronta*: 1100 ms di curva `pressa` | motion |
| + 638 | contatto (58%): rilievo pieno, assi all'arrivo (dal CSS) | motion + CSS `.imp-pressa` |
| + 750 circa | la carta restituisce l'1,7%, poi lo 0,3% | motion |
| + 1100 | fermo. `data-imp-pressa="premuta"` | motion |
| in parallelo | l'arco lentissimo della luce parte solo nell'hero (interaction) | interaction |
| quando arriva | il GL fa il suo primo frame con le maschere pronte e riprende la pressione dal registro, dallo stesso valore: dissolvenza canvas 300 ms lineare, i fantasmi perdono il `text-shadow` nello stesso istante | shader-engineer |
| 1830 (`ANCORE.attesaIniziale`) | se l'URL ha `#banco` (o un'altra ancora): viaggio verso l'ancora | Impronta.tsx |

### 6.1 Hero · la pressa (`#inizio`)

Motivo: è la promessa del sito in un gesto. Il rilievo nasce dalla pressione,
non da una comparsa.

| Blocco | Innesco | Profilo | Timeline |
|---|---|---|---|
| parola *impronta* (`.imp-relief.imp-secco.imp-pressa`) | `ingresso: 'montaggio'`, `attendi: () => document.fonts.ready` | `PROFILI.heroParola`: ritardo 160, durata 1100, riposo 1 | 0-160 piatta; 160-798 discesa `pressa` 0 → 1, frena sul contatto; 798-1260 ritorno elastico (minimo 0,983 a circa 910); 1260 fermo a 1 |
| H1, sottotitolo, "Prova la tua" | nessuno | nessuno | fermi dal primo frame |
| dial della luce | nessuno | nessuno | fermo |

Assi: il motion scrive solo `--imp-press`. Con il GL spento o non ancora
pronto è `.imp-pressa` (art-director) a portare la parola dall'80% della sua
larghezza d'arrivo e peso 700 all'arrivo pieno, con l'arrivo tarato per ogni
larghezza di schermo. Con il GL acceso gli assi del DOM sono fermi
all'arrivo (testo trasparente) e la stretta orizzontale
`mix(0.8, 1.0, pressione)` la fa lo shader (tech-architect §7.4).

**Dopo l'invio** (testo del cliente nell'hero, ux-architect 5.1): quando
`testoCliente` cambia, l'hero builder chiama `comandi.riarma()` e poi cambia il
testo (`registry.update`). La parola torna piatta; l'IO dell'hero si riarma e,
quando il lettore risale, **la pressa scende sui suoi nomi**. Se l'hero è già
in vista la pressa scende subito. Per il riarmo serve che l'hero passi a
`ingresso: 'vista'` dopo il primo montaggio: si ottiene passando
`ingresso={testoCliente ? 'vista' : 'montaggio'}`.

```tsx
const parolaRef = useRef<HTMLDivElement>(null);
const reliefId = useRelief(parolaRef, spec);
const pressa = usePressione(parolaRef, {
  profilo: HERO.profilo,
  reliefId,
  ingresso: testoCliente ? 'vista' : 'montaggio',
  attendi: () => document.fonts.ready,
});
// <div ref={parolaRef} {...ATTESA_PRESSA} className="imp-hero__parola imp-relief imp-secco imp-pressa" aria-hidden="true">impronta</div>
```

Reduced motion: parola già premuta a 1, nessuna attesa, nessun arco di luce.

### 6.2 Per chi · tre lavori sul bancone (`#lavori`)

Motivo: tre oggetti appoggiati sul bancone uno dopo l'altro: il ritmo di tre
colpi dice "tre lavori diversi", non "una griglia".

| Blocco | Innesco | Timeline |
|---|---|---|
| partecipazione (indice 0) | la **sezione** entra al 30% (`osserva: sezioneRef`, margine `0px 0px -30% 0px`) | 0-820 `pressa` 0 → 0,86 |
| biglietto (indice 1) | stesso innesco | 150-970 `pressa` 0 → 0,86 |
| copertina (indice 2) | stesso innesco | 300-1120 `pressa` 0 → 0,86 |
| didascalie, prezzi, "Prova la tua" | nessuno | ferme |

- Riposo 0,86: resta margine perché l'hover "prema di più" senza superare 1.
- **Hover e fuoco** (`pointerenter`/`pointerleave`, `focusin`/`focusout` sul
  pezzo): `comandi.hover(true|false)` → molla `morbida` verso 1 e ritorno a
  0,86. Nessuno spostamento, nessuna scala.
- Rotazioni -2°, 1,5°, -0,5° (`PER_CHI.rotazioni`): statiche, mai animate.
- Mobile (mazzo con scroll-snap): l'innesco è sulla sezione, quindi anche i
  pezzi 2 e 3 fuori schermo a destra sono già premuti quando arrivano con lo
  swipe. Lo swipe è scroll nativo: nessuna animazione aggiunta.
- Reduced motion: tutti a 0,86 subito; l'hover porta a 1 senza molla.

```tsx
// Pezzo.tsx: un hook per pezzo, l'innesco è la sezione intera.
function Pezzo({ indice, sezioneRef, spec }: PezzoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reliefId = useRelief(ref, spec);
  const pressa = usePressione(ref, {
    profilo: PER_CHI.profilo, reliefId, indice, osserva: sezioneRef,
  });
  return (
    <article
      onPointerEnter={() => pressa.hover(true)}
      onPointerLeave={() => pressa.hover(false)}
      onFocus={() => pressa.hover(true)}
      onBlur={() => pressa.hover(false)}
    >
      <div ref={ref} {...ATTESA_PRESSA} className="imp-perchi__pezzo imp-relief imp-foglio" aria-hidden="true" />
      {/* h3, due righe, "Prova la tua": fermi */}
    </article>
  );
}
```

### 6.3 Le tecniche · la stessa parola, quattro volte (`#tecniche`)

Motivo: la stessa forma ripassa sotto la pressa con un'altra tecnica. Il
cambio di materiale è una **ristampa**, non una dissolvenza: la platina si
alza, si cambia la forma, riscende.

Struttura: contenitore alto `TECNICHE.altezzaSvh.largo` = **400svh** su
desktop e **350svh** su mobile, figlio `position: sticky; top: 0; height:
100svh`. Il pin dura quindi 300svh desktop e 250svh mobile: rispetta il
limite del trend-researcher (3 e 2,5 schermate) e l'ux-architect (4
schermate di sezione). La testata sticky desktop copre 56 px: il figlio
sticky la considera nel suo padding, non nel `top`.

Progresso: `useScrollProgress(sezioneRef, { intervallo: TECNICHE.intervallo,
variabile: VAR.tecnicheP, passi: 4, isteresi: 0.02, derivate: {
[VAR.tecnicheGiro]: giroTecniche }, onPasso })`.

| Progresso del pin | Tecnica | Evento |
|---|---|---|
| ingresso sezione (bordo superiore al 65% della viewport) | a secco | la parola campione riceve la sua pressa d'ingresso: 60 ms di ritardo, 900 ms di `pressa`, 0 → 1 |
| 0 → 0,25 | a secco | fermo |
| 0,27 (0,25 + isteresi) | a un colore | **ristampa** |
| 0,52 | lamina a caldo | **ristampa** |
| 0,77 | taglio colorato | **ristampa** |
| 0,80 → 0,96 | taglio colorato | `--imp-tecniche-giro` 0 → 1 con smootherstep: il foglio ruota di tre quarti, max 32° desktop, 18° mobile (`gradiGiroTecniche(w)`), legato allo scroll |
| 1 | | il pin si stacca |

Timeline di una **ristampa** (`comandi.ristampa(alFondo)`):

| t (ms) | Valore | Curva | Cosa |
|---|---|---|---|
| 0 | 1 | | la soglia di passo è superata |
| 0 → 170 | 1 → 0,3 | `rilascio` | la platina si alza (durata ridotta in proporzione se si parte già più in basso, minimo 60 ms) |
| 170 | 0,3 | | `alFondo()`: il builder fa `registry.update(id, { tecnica })` e cambia **nello stesso istante** l'H3 e le tre righe visibili (sostituzione secca, niente fade) |
| 170 → 690 | 0,3 → 1 | `pressa` | la forma nuova riscende, con il suo ritorno elastico |

- Scroll veloce su più confini: le richieste si fondono, vale l'ultima. Se la
  platina sta già salendo, cambia solo il callback; se sta scendendo, risale
  dal punto in cui è.
- Prima valutazione (`precedente === -1`): il builder imposta la tecnica
  senza ristampa.
- L'elenco delle quattro tecniche (c10-c12) aggiorna la voce corrente in
  `onPasso`, istantaneamente (peso 600 e "◂"): è un indice, non si anima.
- **Salto a una tecnica** (clic sul nome): `progresso.vaiA(progressoSaltoTecnica(i))`
  (punti 0,08 / 0,37 / 0,62 / 0,96). Il viaggio attraversa i confini e le
  ristampe si fondono in una sola, quella della tecnica di arrivo. Il fuoco
  resta sul bottone.
- "Torna al banco" in fondo: `arrivaAllAncora('banco')`.
- La parola campione non cambia assi durante la ristampa (non ha la classe
  `.imp-pressa`: i suoi assi sono fissi nel CSS): l'asse si muove una volta sola
  per blocco (trend-researcher 5.1).
- Il taglio colorato ruota il contenitore DOM con
  `transform: perspective(1400px) rotateY(calc(var(--imp-tecniche-giro) * -32deg))`
  (valore mobile: -18deg in media query). Il blocco è `tracking: 'live'`. La
  resa del bordo tinto nello shader è dello shader-engineer e del
  webgl-artist: il valore `giroTecniche(progresso.valore())` è disponibile a
  ogni frame (vedi §10).
- Reduced motion: **niente pin** (quattro blocchi statici alti 60vh, ux 5.3),
  quindi il builder non usa `useScrollProgress` né `ristampa`: ogni blocco ha
  la sua parola già premuta nella sua tecnica e il taglio colorato già ruotato.

### 6.4 La carta · tocca prima di scegliere (`#carta`)

Motivo d'ingresso: quattro colpi in fila, da sinistra a destra (dall'alto in
basso su mobile), come quattro campioni che il tipografo stende sul banco.

| Blocco | Innesco | Timeline |
|---|---|---|
| nome a secco di Citrino | sezione al 30% | 0-640 `pressa` 0 → 0,84 |
| Cotone | idem | 90-730 |
| Cipria | idem | 180-820 |
| Grafite | idem | 270-910 |

- Hover e fuoco sulla striscia: `hover(true)` → molla `morbida` a 1 ("il nome
  si preme di più", ux 5.4). La luce che passa sulla striscia è
  dell'interaction-designer.
- Grammatura, uso, "✓ la carta del sito": fermi.
- **Il cambio carta** è la transizione più importante del sito: vedi §7.1.

### 6.5 Legatoria · il filo (`#legatoria`)

Motivo: il filo è il lavoro che si vede. Si cuce perché scorri (la causa è
la tua mano), e si ferma a ogni legatura come si ferma l'ago a ogni
segnatura.

Intervallo: `LEGATORIA.intervallo` = da bordo superiore della sezione al 75%
della viewport a bordo inferiore all'85%. Sezione alta 220vh desktop, 240svh
mobile (ux 3).

Mappatura scroll → filo con **soste** (`conSoste`): tra una fermata e
l'altra il filo accelera e frena (smootherstep); su ogni fermata resta fermo
per il 7% dell'intervallo di scroll. Con le soste di default
`[0,18, 0,42, 0,66, 0,90]`:

| Progresso scroll | Lunghezza filo | Evento |
|---|---|---|
| 0 | 0 | la sezione è entrata del 25% |
| 0,13 → 0,20 | 0,18 fermo | **brossura cucita**: aggancio |
| 0,37 → 0,44 | 0,42 fermo | **cartonato**: aggancio |
| 0,62 → 0,69 | 0,66 fermo | **legatura giapponese**: aggancio |
| 0,86 → 0,93 | 0,90 fermo | **punto metallico**: aggancio |
| 1 | 1 | il filo arriva a "Prova la tua" |

**Aggancio**: quando il filo raggiunge una fermata (con 0,004 d'anticipo), la
molla `tiro` di quella fermata va a 1 (sovraelongazione 1,5%, circa 400 ms):
`--imp-filo-aggancio` sulla fermata e `data-imp-agganciato`. Il builder la
usa **solo** sui segni di cucitura della fermata (i punti del filo passano da
tratteggio leggero a tratto pieno con `stroke-opacity` o `stroke-width`), mai
sul testo: nome, due righe e prezzo sono già lì, fermi. Scorrendo indietro
l'aggancio si scioglie con la stessa molla.

SVG del filo: `pathLength="1"`, `stroke-dasharray: 1`,
`stroke-dashoffset: calc(1 - var(--imp-filo-p))`. Nessun `getTotalLength` per
frame. Le soste vere si misurano **una volta** dal tracciato (lunghezza fino al
punto più vicino a ogni fermata, divisa per la lunghezza totale) e si passano
in `soste`.

`onSosta(i)` dà l'ultima legatura raggiunta: "Prova la tua" in fondo porta al
banco con *libro* e quella legatura (brossura se -1).

Reduced motion: filo interamente cucito (`--imp-filo-p: 1`), tutte le fermate
agganciate, nessun abbonamento al ticker.

### 6.6 Il banco di prova (`#banco`)

Motivo: è l'unico posto dove la pressa è **tua**. Le lettere si premono
mentre scrivi, la leva la fai scendere tu.

| Blocco | Innesco | Profilo | Timeline |
|---|---|---|---|
| la prova sulla lastra | sezione al 25% dal fondo (`0px 0px -25% 0px`) | `PROFILI.bancoProva` | 0-900 `pressa` 0 → **0,78** |
| il prezzo in lamina sul margine | stesso innesco | `PROFILI.bancoPrezzo` | 220-920 `pressa` 0 → 1 |
| compositoio, campi, riepilogo | nessuno | | fermi |

Riposo della prova a 0,78: è una prova da bancone, ancora da "tirare"; la
leva la porta a 1.

**Battuta** (ogni lettera nuova, `input` con testo più lungo): il builder
aggiorna la maschera (`registry.update`) e chiama `prova.battuta()`.

| t (ms) | Valore | Curva |
|---|---|---|
| 0 → 80 | 0,78 → 0,86 | uscita quadratica (affondo) |
| 80 → circa 350 | 0,86 → 0,78 | molla `battuta` (un'eco dello 0,4%) |

Tasti più ravvicinati di 45 ms non ripartono da capo (digitazione veloce:
la pressa resta giù e ondeggia appena). È un'approssimazione per blocco
della "pressione locale per lettera" del CD; se lo shader-engineer vuole la
versione locale, il punto della lettera nuova è la fine della riga
digitata: ne parliamo in §10.

**Prezzo che cambia**: stessa `battuta()` sul blocco del prezzo (riposo 1:
la battuta va verso il basso, 1 → 0,92 → 1). Il prezzo in inchiostro nel
riepilogo cambia secco.

**Campo svuotato**: torna il testo d'esempio con `prova.verso(ESEMPIO_LEGGERO)`
(0,4, molla `morbida`); al primo carattere nuovo `prova.verso(BANCO.prova.riposo)`.

**Cambio di prodotto** (formato della prova): `prova.ristampa(() => { cambio
di formato e maschera })`, stessa timeline delle Tecniche. Il formato della
lastra (proporzioni) cambia secco dentro `alFondo`: con la platina su non si
vede il salto.

**Cambio di tecnica nel banco**: `prova.ristampa(...)`, come sopra.

**La leva** (logica in `interaction/useHoldToConfirm.ts`, progresso lineare
0..1 nel tempo, 900 ms):

| Evento della leva | Comando sulla prova | Risultato |
|---|---|---|
| ogni frame del progresso (`subscribeProgress`) | `prova.segui(pressioneLeva(p, BANCO.prova.riposo))` | 0,78 → 1 con curva `leva`, frena prima del contatto |
| rilascio anticipato | nessun comando mio: il progresso della leva risale con la molla `risalita` e `segui` lo riporta sulla prova | la carta risale senza scatti |
| completamento | `prova.urto()` | contatto: 1 → 0,978 → 1 in 320 ms (`ritornoElastico`, 2,2%) |
| invio in corso | niente | la pressa resta giù a 1, nessuno spinner |
| invio riuscito | niente | resta a 1 |
| invio fallito | `hold.reset()` (interaction): il progresso risale, `segui` porta la prova a 0,78 | la carta risale |

Con reduced motion: la leva resta di 900 ms (`useHoldToConfirm` non cambia
la durata), `segui` segue il progresso, `urto()` non fa nulla (nessun
rimbalzo), la risalita è immediata (la fa `useHoldToConfirm`).

**Lastra con tastiera aperta** (mobile, ux 5.6): la lastra passa da 42% a 28%
dell'altezza visibile. Non si anima `height`: il contenitore resta alto 42%
e si anima `clip-path: inset(0 0 var(--imp-banco-taglio) 0)` più una
`transform: translateY()` della prova per centrarla nella striscia, in
`var(--imp-dur-lastra)` (220 ms) con `var(--imp-ease-sfoglia)`. Lo scorrimento
automatico al campo usa lo scroll nativo del browser (il campo ha il fuoco:
non si passa da lenis). Con reduced motion: 0 ms.

### 6.7 La bottega · portaci la bozza (`#bottega`)

Motivo: l'indirizzo è premuto come il nome sul biglietto di un artigiano.

| Blocco | Innesco | Timeline |
|---|---|---|
| indirizzo a secco (`.imp-pressa`, sopra la stessa riga in inchiostro) | sezione al 25% dal fondo | 0-900 `pressa` 0 → 1 |
| orari, telefono, Maps, frase | nessuno | fermi |

Il vuoto a destra resta vuoto: nessun elemento entra da lì.

### 6.8 Colophon · piede (`#colophon`)

Motivo del non-movimento: il libro è finito, il foglio è fermo.

- Nessun ingresso sul testo. Il nome della carta nel testo ("stampato a secco
  su carta Cipria") cambia secco al cambio carta, nello stesso istante in cui
  cambia `data-carta` (§7.1).
- Se il builder mette il marchio a secco: `PROFILI.colophonFirma`, 600 ms, il
  colpo più leggero del sito, innesco al 15% dal fondo.
- "Ricomincia da capo": la conferma in linea compare secca (niente animazione).
  Dopo il reset lo store torna ai default; i blocchi già premuti restano
  premuti (non si ripete l'arco).

---

## 7. Transizioni

Il concept non ha pagine: le "transizioni di pagina" sono il cambio carta
(che cambia il sito intero) e il viaggio verso le ancore.

### 7.1 Cambio carta: l'onda

Causa: il dito tocca una carta, il colore nuovo **si propaga dal punto
toccato** come carta che assorbe. Innesco da tastiera: centro della striscia
o del quadrato scelto.

Implementazione esistente: `interaction/paperWave.ts`
(interaction-designer), 700 ms, raggio `assorbe(u) · raggioMassimo`, velo DOM
sotto il contenuto solo quando il GL non è acceso, `uWave` per lo shader da
`getPaperWave(now)`, `scegliCarta(to)` a onda completa. Coerente con la mia
coreografia su durata, curva, origine, livello e reduced motion.

Timeline che propongo come definitiva (in `choreography.ts`: `CARTA.onda`,
`statoOnda`):

| t (ms) | u | Raggio | Strato | `data-carta` e inchiostro |
|---|---|---|---|---|
| 0 | 0 | 0 | carta nuova DENTRO il cerchio, bordo sfumato 12 px | carta vecchia |
| 200 | 0,29 | 72% | idem, bordo 36 px | vecchia |
| **315** | **0,45** | 87% | lo strato si **inverte**: carta vecchia FUORI dal cerchio (stesso raggio, stessa immagine a schermo) | **scambio**: `data-carta` = nuova, l'inchiostro cambia colore in 240 ms (`--imp-dur-inchiostro`) |
| 700 | 1 | 100% + 56 px | strato rimosso | nuova |

Perché lo scambio al 45% e non alla fine? Con Citrino → Grafite (e ritorno)
l'inchiostro si inverte (verde notte ↔ bianco). Se l'inchiostro cambia solo
a onda finita, per 700 ms il testo sta nella carta sbagliata dentro il cerchio
che cresce: verde notte su grafite, cioè illeggibile. Al 45% del tempo il raggio è
già all'87% del finale e il cerchio copre la maggior parte dello schermo, quindi l'inchiostro nuovo è giusto sulla parte
più grande, e nei 240 ms della sua transizione l'onda finisce. L'inversione
dello strato evita qualsiasi fotogramma di colore sbagliato: prima dello
scambio lo strato disegna il nuovo dentro, dopo disegna il vecchio fuori.

Bordo "bagnato": `mask-image: radial-gradient(circle at var(--imp-onda-x)
var(--imp-onda-y), black calc(var(--imp-onda-r) - var(--imp-onda-bordo)),
transparent var(--imp-onda-r))` (prima dello scambio) e lo stesso con
`transparent`/`black` invertiti (dopo). Se l'interaction-designer preferisce
tenere `clip-path: circle()` a bordo netto va bene lo stesso: il bordo sfumato
è un di più, lo scambio al 45% no (vedi richieste §11).

Shader: `uWave = (x, y, raggio, bordo) × dpr` più indici di carta da/a; lo
shader mescola i quattro colori della carta sulla stessa geometria. Le due
funzioni (`statoOnda` e `getPaperWave`) danno lo stesso raggio: `assorbe` e
angolo più lontano (io aggiungo il bordo, 56 px, per non lasciare un alone
sugli angoli).

Reduced motion (`statoOnda(..., true)`): scambio a t = 0, lo strato mostra la
carta **vecchia** a tutto schermo e va da opacità 1 a 0 in 200 ms lineari,
mentre l'inchiostro cambia nello stesso tempo: una sola dissolvenza, nessun
cerchio.

Cosa non si muove durante l'onda: il layout, i testi, la pressione dei blocchi
(una carta nuova non ripreme niente: cambia il foglio sotto la stessa forma,
trend P10).

### 7.2 Arrivo alle ancore

Causa: il carrello del torchio porta il foglio sotto la testata.

| Passo | Dettaglio |
|---|---|
| 1 | `arrivaAllAncora(id)`: destinazione = top della sezione meno 80 px (testata sticky, ≥ 1024 px) o 24 px (sotto 1024) |
| 2 | `viaggioAncora.inizia()`: le presse d'ingresso dei blocchi sorvolati sono sospese |
| 3 | `lenis.scrollTo(y, { duration, easing: scorrimento, lock: true, force: true })`, durata = 480 ms + 0,12 ms per px, tra 600 e 1400 ms (1000 px → 600 ms, 5000 px → 1080 ms, oltre 7667 px → 1400 ms) |
| 4 | arrivo: `viaggioAncora.finisce()`. I blocchi in vista ricevono **adesso** la loro pressa: si arriva e il torchio scende. Rete di sicurezza: se lenis non chiama `onComplete`, il viaggio si chiude comunque dopo durata + 400 ms |
| 5 | fuoco sull'`h2` della sezione (`tabindex="-1"`, `preventScroll`) |

Reduced motion o senza lenis: `window.scrollTo({ behavior: 'instant' })`,
stessi passi 4-5 subito.

Le ancore dentro il pin delle Tecniche usano `progresso.vaiA(p)`: stesso
viaggio, destinazione calcolata sul progresso del pin.

### 7.3 Segnapagina mobile

Entrata `translateY(100%)` → `0` in `var(--imp-dur-segnapagina-entra)`
(240 ms) con `var(--imp-ease-sfoglia)`; uscita in
`var(--imp-dur-segnapagina-esce)` (200 ms) con `var(--imp-ease-sfoglia-via)`.
È una transizione CSS: la guida l'attributo di stato che mette chi lo gestisce
(interaction o hero builder). Reduced motion: durate 0 (le dà già
`variabiliMotion(true)`).

### 7.4 Indice mobile

Il foglio sale fino al 78% in 320 ms (`sfoglia`), scende in 240 ms
(`sfogliaVia`). Trascinamento verso il basso: il foglio segue il dito
(transform diretto nel ticker, nessuna curva); al rilascio chiude se si è
superato il 30% dell'altezza o 0,5 px/ms di velocità, altrimenti torna su con
la molla `morbida`. Il fondo dietro non si scurisce con un velo animato (non
ci sono veli colorati nel concept): resta `inert`.

### 7.5 WebGL: comparsa e spegnimento

Comparsa del canvas 0 → 1 in 300 ms lineari, mentre i fantasmi perdono il
`text-shadow` nello stesso frame (`GL.comparsa`, `--imp-dur-gl`). Spegnimento
per qualità o perdita di contesto: 300 ms lineari al contrario
(`GL.spegnimento`). Opacità lineare di proposito: nessun picco di luminosità.

### 7.6 Uscita verso Ciceri Lab

Nessuna transizione mia: la navigazione è del sito. `Impronta.tsx` smonta,
tutti i miei hook tolgono i loro abbonamenti al ticker e i loro observer.

---

## 8. Variabili CSS e attributi esposti

### 8.1 Scritte a runtime dal motion (inline sull'elemento)

| Variabile | Dove | Valori | Letta da |
|---|---|---|---|
| `--imp-press` | ogni blocco con `usePressione` (o il suo `bersaglio`) | 0..1, 4 decimali | `relief-fallback.css` (ombre, assi di `.imp-pressa`), CSS di sezione |
| `--imp-scroll-p` | elemento di `useScrollProgress` senza `variabile` | 0..1 | CSS di sezione |
| `--imp-tecniche-p` | contenitore delle Tecniche | 0..1 | CSS Tecniche (posizione dell'indicatore, se serve) |
| `--imp-tecniche-giro` | contenitore delle Tecniche | 0..1 | `rotateY` del taglio colorato |
| `--imp-filo-p` | sezione Legatoria (o `bersaglio`) | 0..1 con soste | `stroke-dashoffset` del filo |
| `--imp-filo-aggancio` | ogni fermata della Legatoria | 0..1 (molla `tiro`) | segni di cucitura della fermata |
| `--imp-onda-x`, `--imp-onda-y`, `--imp-onda-r`, `--imp-onda-bordo`, `--imp-onda-o` | strato dell'onda (se l'interaction-designer adotta `statoOnda`) | px, px, px, px, 0..1 | CSS dello strato |

### 8.2 Scritte una volta su `.imp-root` (`variabiliMotion(ridotto)`)

| Variabile | Valore | Con reduced motion |
|---|---|---|
| `--imp-ease-pressa` | `linear(...)` della pressa | uguale |
| `--imp-ease-pressa-bezier` | `cubic-bezier(0.2, 0.86, 0.3, 1)` (per i browser senza `linear()`) | uguale |
| `--imp-ease-rilascio`, `--imp-ease-leva`, `--imp-ease-assorbe`, `--imp-ease-sfoglia`, `--imp-ease-sfoglia-via` | cubic-bezier del §2 | uguali |
| `--imp-dur-pressa` | 820ms | 0ms |
| `--imp-dur-segnapagina-entra` / `-esce` | 240ms / 200ms | 0ms |
| `--imp-dur-indice-sale` / `-scende` | 320ms / 240ms | 0ms |
| `--imp-dur-lastra` | 220ms | 0ms |
| `--imp-dur-inchiostro` | 240ms | 200ms |
| `--imp-dur-gl` | 300ms | 300ms |

Uso di `linear()` con ripiego: `transition-timing-function:
var(--imp-ease-pressa-bezier); transition-timing-function:
var(--imp-ease-pressa);` non basta (una variabile non valida al calcolo non
ricade sulla dichiarazione precedente): va dentro
`@supports (transition-timing-function: linear(0, 1)) { ... }`.

### 8.3 Attributi

| Attributo | Dove | Valori |
|---|---|---|
| `data-imp-pressa` | blocchi premuti | `attesa` (nel markup con `{...ATTESA_PRESSA}`), `in-corso`, `premuta` |
| `data-imp-agganciato` | fermate della Legatoria | presente / assente |

---

## 9. Reduced motion, riepilogo

Fonte: `store.reducedMotion` (media query + listener, scritta dallo scaffold),
riflessa su `.imp-root[data-motion="reduced"]`. Tutti i miei hook la leggono
con `useImpronta` e cambiano comportamento anche se cambia a pagina aperta.

| Movimento | Normale | Ridotto |
|---|---|---|
| pressa d'ingresso | curva `pressa` una volta | valore finale subito, nessun abbonamento al ticker |
| hover | molla `morbida` | salto a 1 e ritorno a riposo senza molla |
| ristampa (tecniche, banco) | 170 + 520 ms | cambio secco in `alFondo`, pressione ferma |
| battuta | affondo + molla | nessuna |
| leva | 900 ms, curva `leva`, urto elastico | 900 ms, curva `leva`, nessun urto |
| tecniche | pin 400/350svh, ristampe, giro scrubbato | niente pin: 4 blocchi statici già nella loro tecnica |
| filo | cucito con lo scroll, soste, agganci | già cucito, tutto agganciato |
| cambio carta | onda 700 ms | dissolvenza 200 ms |
| ancore | viaggio lenis 600-1400 ms | salto istantaneo, fuoco all'h2 |
| segnapagina, indice, lastra | 200-320 ms | 0 ms |
| luce | (interaction) | ferma a 135° / 22° |
| GL comparsa | 300 ms opacità | 300 ms opacità (è una dissolvenza, non un movimento) |

---

## 10. Note per lo shader-engineer e il webgl-artist

- **Pressione**: `block.pressione` in 0..1 dal registro, già con la curva
  applicata. Lo shader non ri-interpola niente: la usa così com'è per la
  profondità e per la stretta orizzontale `mix(0.8, 1.0, pressione)` con
  ancoraggio a sinistra. Il ritorno elastico (fino a 0,983) è nel valore.
- **Valori per frame**: `setPressione` viene chiamata a ogni frame solo per i
  blocchi in moto (al massimo circa 5 insieme: tre pezzi di Per chi o quattro
  carte, più la luce). Il registro marca sporco, il render parte.
- **Onda**: `uWave` da `getPaperWave(now)` di interaction, o da
  `statoOnda(now - cartaWave.t0, geometria, ridotto)` se si adotta lo scambio
  al 45% (§7.1). Stesso raggio in entrambi.
- **Taglio colorato**: il giro 0..1 è `giroTecniche(p)` con `p` dal
  `ProgressoScroll` della sezione. Se lo si vuole nello shader, serve un
  campo per blocco (per esempio `spec` o un `uParam` in più): è una decisione
  vostra, il valore c'è.
- **Battuta locale** (opzionale): se volete la pressione per lettera, la
  battuta può passare anche la posizione della lettera nuova (x relativo nel
  blocco). Oggi la battuta è per blocco e basta così per il CD; lo aggiungo
  se lo chiedete.

---

## 11. Richieste ad altri agent

- **art-director** (`styles/relief-fallback.css` o `tokens.css`):
  1. prima pittura senza lampi: `@media (prefers-reduced-motion: no-preference)
     { .imp-root:not([data-motion="reduced"]) [data-imp-pressa="attesa"] {
     --imp-press: 0; } }`. Senza questa regola l'HTML prerenderizzato mostra i
     blocchi già premuti (default `--imp-press: 1`), l'idratazione li appiattisce
     e poi la pressa li ripreme: un lampo pieno, piatto, pieno.
  2. transizione del colore dell'inchiostro al cambio carta: `color`,
     `-webkit-text-fill-color` e i colori delle ombre del fallback con
     `transition-duration: var(--imp-dur-inchiostro)` e curva lineare.
     Niente transizioni su `--imp-press` (la anima il ticker: una transizione
     CSS sopra la rallenterebbe).
- **interaction-designer** (`interaction/paperWave.ts`): spostare lo scambio
  di `scegliCarta(to)` al 45% dell'onda (`CARTA.onda.scambio`) invertendo il
  velo (carta vecchia fuori dal cerchio), per non avere 700 ms di inchiostro
  illeggibile nei passaggi da e verso Grafite (§7.1). Facoltativo: usare
  `statoOnda()` per avere la stessa geometria (bordo sfumato compreso) in DOM
  e GL. Nota di livello: il velo sotto il contenuto è giusto; `--imp-z-onda:
  20` di `tokens.css` non va usato per il velo (coprirebbe il testo).
- **scaffold-engineer**: i contratti del §4 (firma `(dt, now)`, fasi
  `read/update/write/render`, aggiunta sicura durante il frame, `wake()`,
  `setPressione` O(1), `getLenis()`, `virtual-scroll` → `wake`),
  `variabiliMotion()` su `.imp-root`, hash iniziale dopo
  `ANCORE.attesaIniziale`, listener delegato dei link `#` →
  `arrivaAllAncora`.
- **section-builder** (tutti): `{...ATTESA_PRESSA}` sul markup di ogni blocco
  premuto; nessuna durata propria; nessuna animazione d'ingresso sui testi;
  per il pin delle Tecniche altezze da `TECNICHE.altezzaSvh`; nessun
  `font-variation-settings` scritto da JS (la larghezza sotto la pressa è
  `.imp-pressa` + `--imp-press`). I miei file non chiamano `track()`: gli
  eventi sono solo `apri_concept` e `demo_prenotazione`
  (`docs/integrazione-sito.md`), e nessuno dei due è un evento di movimento.
- **shader-engineer**: §10.

---

## 12. Perché nessun GSAP (verifica chiesta da tech-architect §2.2)

| Candidato | Serve GSAP? | Come è fatto |
|---|---|---|
| pressa con ritorno elastico | no | curva chiusa `pressa` + molla analitica, nel ticker |
| pin delle Tecniche | no | `position: sticky` + `useScrollProgress` con isteresi |
| ristampa (sequenza su, cambio, giù) | no | due curve concatenate con callback nell'animatore |
| stagger Per chi e Carta | no | `ritardoConSfasamento(profilo, indice)` |
| filo con soste | no | `conSoste` puro + `stroke-dashoffset` |
| viaggio alle ancore | no | `lenis.scrollTo` con `scorrimento` |
| onda | no | funzione pura del tempo nel ticker |

Nessun caso regge meglio con GSAP. Resta fuori dal bundle.
