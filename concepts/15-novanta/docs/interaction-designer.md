# Interaction designer · Concept 15 · NOVANTA

Ondata 2. Rotta `/concept-15`. Seguiti `design-taste-frontend` (4.5, 4.6,
5.D, 6.A, 6.B, 9.A, 9.G) e `full-output-enforcement`: file completi, niente
segnaposto.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/processo-agent.md`,
`docs/matrice-concept-11-20.md` (riga e paragrafo 15),
`concepts/10-torchio/docs/integrazione-sito.md`, tutti i doc dell'ondata 1 in
`concepts/15-novanta/docs/` (creative-director, trend-researcher,
brand-strategist, ux-architect, tech-architect), il doc e il codice
`interaction/` del pilota (solo formato). Letti anche i file già scritti in
parallelo: `styles/tokens.css` (art-director), `motion/choreography.ts`,
`motion/rotore.ts` (motion-designer).

## 0. File consegnati

Tutti in `src/pages/concepts/novanta/interaction/`:

| File | Cosa fa |
|---|---|
| `trascina.ts` | `useTrascinaAttorno()`: puntatore → gradi attorno a un perno, per braccio, disco, anello e fascia a 90° su mobile. Presa relativa o assoluta, tocco sul disco, srotolamento, zona morta sul perno, Esc, velocità al rilascio. |
| `rotella.ts` | `useRotella()`: rotella e trackpad che ruotano. Scatto = un angolo; trackpad continuo con soglia, tetto per gesto e blocco dell'inerzia; precedenza allo scorrimento interno; niente rotazione sopra i campi e nella colonna del modulo; pizzico = zoom. |
| `tastiera.ts` | `tastiBraccio()`, `tastiAnello()` (mappe dei tasti dei due `role="slider"`), `destinazioneBraccio()`, `prossimoAngolo()`, `azioneAggancia()`. |
| `attivita.ts` | `segnaInput()`, `inattivoDa()`, `ascoltaAttivita()` (per l'invito del motion-designer) e `creaCadenza()`, il limite anti-lampeggio. |
| `interaction.css` | Anello di focus, focus degli slider SVG, cursori di sistema, `touch-action`, manopola all'hover e alla presa, **braccio fantasma** delle parole, stati delle pillole, link, aree che scorrono, reduced motion, colori forzati. |

Verifica fatta in un progetto di prova nello scratchpad (node_modules del
pilota, stessi `tsconfig.app.json` ed `eslint.config.js`), con stub di
`state/runtime.ts` e `dial/geometria.ts` scritti come in tech-architect §6.2 e
§7.1 e con i file veri di `motion/`:
- `tsc` strict (`noUncheckedIndexedAccess`, `noUnusedLocals`) e `eslint` verdi
  sui miei cinque file;
- `interaction.css` passa il parser di esbuild senza avvisi (5,9 KB minificato);
  zero hex, zero trattini lunghi;
- prova in Chromium headless con un banco minimo (React vero): tocco sul disco
  → `onTocco(90)`; trascinamento → `onInizio`, 10 `onMuovi` continui,
  `onFine(vel)`; due scatti di rotella → due `onScatto(1)`; rotella sopra
  un'area che scorre → scorre lei (scrollTop 100), nessuna rotazione; gesto
  continuo simulato da trackpad con coda d'inerzia → somma limitata a 30°, un
  solo `onFine`, la coda assorbita; gesto corto all'indietro → `verso -1`;
  `creaCadenza` con 30, 60, 90 proposti di fila → applica 30 e poi 90
  (dopo 500 ms, 60 saltato). Zero errori in console.

Ricontrollo finale: con tutti i file di `motion/` presenti (compreso
`rotore.ts` e `invito.ts`) il `tsc` del banco di prova è verde.

---

## 1. Cursore custom, preloader, hover magnetici: cosa li sostituisce

Il mandato generico dell'ondata chiede cursore custom, hover magnetici e
preloader memorabile. Per NOVANTA sono **vietati o inutili**:
creative-director §4.7 ("niente cursore custom, niente cerchio che segue il
mouse"), skill 9.A ("NO custom mouse cursors"), tech-architect §9 (la prima
pittura è CSS: non c'è niente da aspettare). Li rispetto così:

- **Il magnete è l'aggancio.** L'unica cosa "magnetica" del sito è il braccio
  che al rilascio si ferma sull'angolo di contenuto entro ±15° (è del rotore).
  Nessun bottone che si sposta verso il mouse: chi ha dolore o fretta deve
  trovare le cose dove le ha viste.
- **Il cursore è quello del sistema, e dice il vero**: mano aperta sul braccio,
  sulla manopola e sull'anello (`grab`), mano chiusa su tutta la pagina mentre
  si trascina (`grabbing`), dito sulle parole e sul disco (`pointer`),
  divieto sui bottoni disattivati, attesa sul bottone in invio.
- **Nessun preloader.** Dal primo frame ci sono il numero dei gradi, il titolo
  e "Prenota". L'unico "momento" non chiesto è l'invito della manopola (6°,
  una volta, dopo 3 s: motion-designer), che legge `runtime.ultimoInput`
  scritto da qui.

---

## 2. Interazione firma "Alza il braccio": come si comporta la mano

### 2.1 Tre modi di prendere il goniometro

| Gesto | Dove | Cosa succede | Chiamate al rotore (suggerite a `useBraccio.ts`) |
|---|---|---|---|
| **Afferrare il braccio o la manopola** | `tocco: 'braccio'`, `valore: () => runtime.braccio.deg` | parte subito; la presa conserva lo scarto tra dito e braccio (afferrato di lato non salta); un braccio che sta agganciando si ferma nella mano | `onInizio` → niente; `onMuovi` → `rotore.trascina(g)`; `onFine(v)` → `rotore.rilascia(v)` |
| **Toccare il disco** | `tocco: 'disco'` | entro 6 px (3 col mouse) è un tocco: il braccio va lì con la frenata e si aggancia all'angolo più vicino | `onTocco(g)` → `rotore.vaA(g, { aggancia: true })` |
| **Trascinare sul disco** | `tocco: 'disco'` | oltre la soglia il braccio va sotto il dito (presa assoluta, con la molla "presa" del rotore) e poi lo segue 1:1 | come il braccio |

Sempre: `limiti: [0, 180]`, `onAnnulla: () => rotore.annullaTrascina()`,
`focusSu: () => sliderEl` sul disco (dopo un clic sul disco le frecce
funzionano subito, come chiede il journey di Davide).

Il braccio e il disco possono avere ognuno il proprio hook anche se annidati:
l'evento preso dal braccio è marcato e il disco lo ignora.

### 2.2 Dettagli che fanno la differenza

- **Srotolamento.** L'angolo del dito passa per `differenza()` in (-180, 180]:
  attraversare il lato opposto al disco (a sinistra del bordo su desktop, sotto
  il diametro su mobile) non fa saltare il braccio da 180° a 0°. Lo
  srotolamento si ferma a 90° oltre i limiti, così tornando indietro il braccio
  riparte appena il dito rientra nell'arco.
- **Zona morta sul perno** (14 px): lì l'angolo è rumore; si tiene l'ultimo.
- **Velocità al rilascio** in gradi/s sugli ultimi 90 ms; se il dito era fermo
  da più di 70 ms è 0. Un lancio veloce passa al rotore, che lo limita a un
  angolo (`INERZIA_MAX` 30).
- **Esc** durante il trascinamento: torna all'angolo di partenza (ux-architect §6.2).
- **Pointer capture**: il gesto non si perde uscendo dal disco; `pointercancel`
  e `lostpointercapture` chiudono il gesto con un rilascio fermo (aggancio).
- **Solo il puntatore primario e il tasto sinistro**: un secondo dito non
  crea un secondo gesto; il tasto destro resta il menu.
- **Mappa lineare per la fascia a 90° su mobile** (ux-architect §5.4):
  `circolare: false`, `gradiDa: (px) => (px - xFascia) / larghezzaFascia * 180`,
  `tocco: 'braccio'`. La presa relativa fa sì che trascinare la fascia di
  mezza larghezza sposti il braccio di 90°, da dove è.
- **Anello della settimana**: stesso hook, senza `limiti` (gira a giri
  interi), `tocco: 'braccio'`, `valore: () => runtime.anello.deg`.

### 2.3 Rotella e trackpad (`rotella.ts`)

Taratura (costanti esportate in `ROTELLA`, quiete e soglia presa da
`motion/choreography.ts` per avere una sola fonte):

| Parametro | Valore | Perché |
|---|---|---|
| Scatto di rotella | **un angolo** (`onScatto(verso)`) | 100-120 px per scatto (Chrome, Safari), 3 righe (Firefox): "1° ogni 4 px" darebbe 25° o 12°. Lo scatto non passa dai pixel (trend-researcher §4.3). |
| Riconoscimento dello scatto | righe/pagine; oppure `wheelDelta` multiplo di 120 e diverso da −3×delta; oppure delta intero ≥ 50 px | euristica conservativa: se sbaglia, cambia la sensazione, non l'esito (tutti e due i modi finiscono agganciati) |
| Scatti "ad alta risoluzione" | uno solo ogni 40 ms nello stesso verso | alcune rotelle mandano più eventi per scatto |
| Trackpad | **1° ogni 4 px** (`pxPerGrado`) | creative-director §4.3 |
| Soglia per gesto | **12 px** (`sogliaTrackpad`) | tremolii (ux-architect §6.3) |
| Tetto per gesto | **30°** (`maxPerGesto`), anello: `Infinity` | un gesto di trackpad sposta al massimo un angolo |
| Fine del gesto | **140 ms** di quiete → `onFine({ verso, percorso })` | ux-architect §6.3 |
| Soglia di intenzione | **6°** (`sogliaVerso`) | un gesto di 6-15° va avanti di un angolo invece di tornare indietro per il magnete |
| Blocco dopo il gesto | **350 ms**, rinnovato dalla coda d'inerzia | la coda del trackpad non attraversa tre angoli |
| Colpo nuovo nella coda | delta che torna a crescere × 1,8 e ≥ 10 px | si può dare un secondo colpo deciso senza aspettare |
| Scorrimento interno | se l'area sotto il puntatore può ancora scorrere, scorre lei; in fondo, lo stesso gesto è assorbito finché non c'è una pausa di **300 ms** | "prima scorre il listino, poi ruota" senza cambi d'angolo per inerzia |
| Mai rotazione | sopra `input`, `textarea`, `select`, `contenteditable`, dentro `data-nov-ix-rotella="blocca"`, con `ctrlKey` (pizzico = zoom) | chi scrive nel modulo a 90° non deve finire a 120° |
| Direzione | giù/destra = braccio che sale | journey di Davide ("rotella verso il basso: il braccio sale") |

Collegamento suggerito in `useBraccio.ts` (ascoltatore sulla radice
`.nov-root`, `scrollInterno: () => palcoEl`):

```ts
onScatto: (verso) => rotore.passoAggancio(verso),
onDelta: (g) => rotore.spingi(g),
onFine: ({ verso, percorso }) => {
  if (verso === 0) rotore.aggancia();
  else rotore.vaA(prossimoAngolo(rotore.meta - percorso, verso));
},
```

Il rotore aggancia già da solo dopo `QUIETE_ROTELLA`; `onFine` arriva nello
stesso istante e **sostituisce** quell'aggancio con quello "di intenzione"
(vedi §9, richiesta al motion-designer).

Anello (`useAnello.ts`, ascoltatore sull'elemento dell'anello): `onScatto`
→ ora libera successiva/precedente, `maxPerGesto: Infinity`, `onFine` →
`rotore.aggancia()`. Chiama `preventDefault`, quindi l'ascoltatore del
braccio sulla radice lo ignora: sopra l'anello la rotella gira l'anello.

### 2.4 Tastiera (`tastiera.ts`)

Braccio: → ↑ PagSu +30°, ← ↓ PagGiù −30°, Maiusc + frecce ±1°, Home 0°,
Fine 180°, Invio/Spazio `entra` (focus all'`h2` dell'angolo). Con Alt, Ctrl
o Cmd niente è intercettato.

`destinazioneBraccio(azione, runtime.braccio.target)`: il passo ±30 va al
**prossimo angolo di contenuto** (da 47° a 60° o 30°, non a 77°); il passo
fine ±1 non aggancia (`azioneAggancia()` è falso: `vaA(g)` senza
`aggancia`). Partire dal `target` fa sì che tre pressioni rapide sommino tre
angoli anche con il braccio ancora in viaggio. Tasto tenuto premuto: ogni
ripetizione è un passo, i cambi di contenuto passano dalla cadenza (§4).

Anello: → ↓ ora libera successiva, ← ↑ precedente, PagGiù/PagSu primo orario
libero del giorno dopo/prima, Home/Fine prima/ultima ora libera.

Le funzioni sono pure: chi le chiama fa `preventDefault()` solo se l'azione
non è `null`.

---

## 3. Micro-interazioni

| Elemento | Riposo | Hover (solo puntatore fine) | Premuto / presa | Focus |
|---|---|---|---|---|
| Manopola | cerchio del disegno | scala 1,12 in 200 ms con la frenata | scala 1,2 finché dura la presa | cerchio `.nov-ix-fuoco` petrolio 3 px attorno |
| Parole del quadrante | peso 400, nessuna riga | sottolineatura 1,5 px + **braccio fantasma** all'angolo della parola | (link) | anello standard + braccio fantasma |
| Parola attiva | peso 500, sottolineatura 2 px, `aria-current` | nessun fantasma (coinciderebbe col braccio) | | |
| Pillola piena (Prenota, Fissa le due visite) | petrolio | petrolio profondo | scende di 1 px, scala 0,985 | anello a 3 px di distanza |
| Pillola a contorno (elenco, prima/dopo, passi, suggerimenti) | contorno | fondo albicocca scura | scende di 1 px | anello |
| Pillola disattivata | testo e bordo `--nov-inattivo`, `not-allowed` | niente | niente | resta focalizzabile, il motivo è in `aria-describedby` |
| Bottone in invio | `aria-busy`, cursore di attesa | niente | niente | |
| Link di testo (tel:, Apri in Maps, Cambia) | sottolineato 1,5 px | 3 px | | anello |

**Il braccio fantasma** è l'unica micro-interazione "firmata": all'hover o al
focus di una parola compare una riga petrolio sottile (35%) dal perno
all'angolo di destinazione. È un'anteprima di misura ("il braccio andrà
qui"), non una decorazione, e non muove niente. Solo CSS (`:has()` sulla
parola con `data-gradi`), nessun JS per frame; si spegne durante il
trascinamento.

Scelte negate di proposito: nessuna vibrazione del telefono agli agganci (un
goniometro non fa clic, e il CD vieta la vibrazione anche nell'errore);
nessuna scia o traccia che segue il puntatore sul disco (sarebbe il "cerchio
che segue il mouse"); nessun effetto sonoro.

---

## 4. Limite anti-lampeggio

Regola del ruolo: un cambio di colore di grandi superfici al massimo **una
volta ogni 500 ms**. In NOVANTA le grandi superfici che cambiano sono: il
contenuto dell'angolo (dissolvenza), la foto a filo del bordo (se l'art-director
la rimette), l'anello gesso a 90° su desktop e il passaggio quadrante → fascia
a 90° su mobile. Un lancio o tre scatti di rotella da 0° a 180° le
attraverserebbero in 300-400 ms.

`creaCadenza({ applica: impostaAttivo })` risolve senza togliere reattività:
il primo cambio è immediato, i successivi dentro 500 ms si accumulano e arriva
**solo l'ultimo** allo scadere dell'intervallo. Il numero dei gradi e il
braccio continuano a muoversi dal vivo (non sono superfici). La cadenza va
usata per `store.impostaAttivo()` in `useBraccio.ts`; `subito()` al montaggio,
all'hash d'arrivo e in vista elenco.

Il mio CSS non cambia colore di superfici grandi: solo pillole e parole, al
passaggio del mouse, in 120 ms.

---

## 5. Ganci per le sezioni

| Gancio | Chi lo mette | Effetto |
|---|---|---|
| `data-nov-ix="rotante"` | quadrante (disco, braccio, fascia), prenota (anello) | `touch-action: none`, niente selezione, niente menu lungo di iOS |
| `data-nov-ix="presa"` | braccio, manopola, anello | cursore `grab`, manopola che cresce all'hover |
| `data-nov-ix="tocca"` | disco | cursore `pointer` |
| `data-nov-ix-presa="1"` | lo scrive `trascina.ts` | `grabbing` su tutta la pagina, manopola a 1,2 |
| `data-nov-ix-scorre` | Palco (scaffold), colonna del modulo, "Tutte le ore libere" | `touch-action: pan-y`, `overscroll-behavior: contain`; la rotella lo riconosce come area che scorre |
| `data-nov-ix-rotella="blocca"` | colonna destra del modulo a 90° (prenota) | la rotella non ruota mai lì |
| `.nov-ix-manopola` | gruppo SVG della manopola | scala all'hover/presa |
| `.nov-ix-fuoco` | cerchio SVG attorno alla manopola e all'indice dell'anello, dentro l'elemento `role="slider"` | anello di focus degli slider SVG |
| `.nov-ix-anteprima` | riga SVG disegnata a 0° nel gruppo del braccio, stesso `transform-origin` | braccio fantasma |
| `.nov-ix-parola` + `data-gradi="N"` | link del `nav` del quadrante | stati delle parole, fantasma |
| `.nov-ix-pillola` (`--piena`) | tutti i bottoni a pillola | hover, premuto, disattivato, in invio |
| `.nov-ix-link` | link di testo | sottolineatura |

---

## 6. Accessibilità di ogni gesto

| Gesto | Alternativa |
|---|---|
| Trascinare il braccio | frecce, Home/Fine, parole del quadrante, tocco sul disco, passi ±30° su mobile, "Prenota", vista elenco |
| Rotella | tutto quanto sopra |
| Ruotare l'anello | frecce, PagSu/PagGiù, Home/Fine, "Tutte le ore libere" (radio) |
| Trascinare la fascia a 90° (mobile) | "‹ trattamenti" / "osteopatia ›" |
| Hover (braccio fantasma) | stesso fantasma al focus da tastiera |

- Nessuna funzione richiede il trascinamento (WCAG 2.5.7) né l'hover.
- Target: manopola 48 px (token `--nov-manopola-tocco`), parole ≥ 44 px
  (garantito da `.nov-ix-parola`), pillole ≥ 44 px (token).
- Focus mai con `outline: none` senza sostituto: gli slider SVG hanno il loro
  cerchio, gli `h2` messi a fuoco da script sono annunciati da `aria-live`.
- Reduced motion: nessuna transizione nel mio CSS, niente "premuto" che
  scende; il trascinamento resta 1:1 (è un controllo). Valgono sia
  `@media (prefers-reduced-motion)` sia `[data-motion="reduced"]` sulla radice.
- Colori forzati: cerchio di focus e parola attiva in `Highlight`.
- **Rischio da verificare in QA**: VoiceOver su iOS regola gli slider ARIA
  personalizzati in modo non sempre affidabile (il gesto su/giù non genera
  eventi tastiera). Le alternative sopra (parole come link, passi, vista
  elenco, radio delle ore) coprono tutto; l'accessibility-auditor deve
  provarlo davvero su entrambi gli slider.
- Gesto "indietro" di iOS dal bordo sinistro: su desktop/iPad orizzontale il
  perno sta sul bordo. Il braccio a 0° e 180° va afferrato dalla manopola, e
  l'area toccabile del braccio **non** deve coprire i primi 20 px dal bordo
  (richiesta a section-builder-quadrante).

---

## 7. API esatte

```ts
// trascina.ts
export interface OpzioniTrascina {
  perno: () => { x: number; y: number };
  gradiDa: (px: number, py: number) => number;
  attivo: () => boolean;
  onInizio?: () => void;
  onMuovi: (g: number) => void;
  onFine: (velGradiAlSecondo: number) => void;
  tocco?: 'braccio' | 'disco';
  // aggiunte facoltative
  valore?: () => number;
  onTocco?: (g: number) => void;
  onAnnulla?: (gInizio: number) => void;
  circolare?: boolean;
  limiti?: readonly [number, number];
  focusSu?: () => HTMLElement | SVGElement | null;
}
export function useTrascinaAttorno(ref: RefObject<Element>, o: OpzioniTrascina): void;
export const SOGLIA_TOCCO_PX: { dito: number; mouse: 3 };
export const ZONA_MORTA_PX = 14, FINESTRA_VEL_MS = 90, FERMO_PRIMA_MS = 70;

// rotella.ts
export interface EsitoGesto { verso: -1 | 0 | 1; percorso: number }
export interface OpzioniRotella {
  pxPerGrado: number; sogliaTrackpad: number; attivo: () => boolean;
  scrollInterno: () => HTMLElement | null; onDelta: (gradi: number) => void;
  // aggiunte facoltative
  passoScatto?: number; onScatto?: (verso: 1 | -1) => void;
  maxPerGesto?: number; onFine?: (esito: EsitoGesto) => void; sogliaVerso?: number;
}
export function useRotella(ref: RefObject<Element>, o: OpzioniRotella): void;
export const ROTELLA: { fineGestoMs; bloccoMs; pausaScrollMs; fattoreNuovoGesto; minNuovoGestoPx; scattoMinPx; scattoMinIntervalloMs };

// tastiera.ts
export type AzioneBraccio = { tipo: 'passo'; gradi: number } | { tipo: 'vai'; g: number } | { tipo: 'entra' };
export type AzioneAnello = { tipo: 'ora'; verso: 1 | -1 } | { tipo: 'giorno'; verso: 1 | -1 } | { tipo: 'estremo'; verso: 1 | -1 };
export function tastiBraccio(e: TastoLetto): AzioneBraccio | null;
export function tastiAnello(e: TastoLetto): AzioneAnello | null;
export function prossimoAngolo(g: number, verso: 1 | -1): Angolo;
export function destinazioneBraccio(azione: AzioneBraccio, attuale: number): number | null;
export function azioneAggancia(azione: AzioneBraccio): boolean;
export const PASSO_ANGOLO = 30, PASSO_FINE = 1;

// attivita.ts
export const CADENZA_MIN_MS = 500;
export function segnaInput(): void;
export function inattivoDa(now?: number): number;
export function ascoltaAttivita(bersaglio: EventTarget): () => void;
export function creaCadenza<T>(o: { intervallo?: number; applica: (v: T) => void; uguale?: (a: T, b: T) => boolean }):
  { proponi(v: T): void; subito(v: T): void; annulla(): void };
```

Le firme del contratto di tech-architect §7.3 sono rispettate alla lettera;
tutto il resto è **aggiunta facoltativa**. Le unioni `AzioneBraccio` e
`AzioneAnello` hanno un caso in più (`entra`, `estremo`) richiesto da
ux-architect §6.2 e §6.5.

## 8. Dipendenze da file altrui (import)

- `../state/runtime`: `runtime.ultimoInput: number` (tech-architect §6.2).
- `../dial/geometria`: `ANGOLI`, `Angolo`, `limita(g, min?, max?)`
  (tech-architect §7.1).
- `../motion/choreography`: `SOGLIA_PRESA`, `QUIETE_ROTELLA` (già scritti).
- Token di `styles/tokens.css` usati: `--nov-focus`, `--nov-focus-anello`,
  `--nov-focus-spessore`, `--nov-focus-distanza`, `--nov-pillola`,
  `--nov-pillola-hover`, `--nov-primario-premuto`, `--nov-inattivo`,
  `--nov-testo`, `--nov-strumento`, `--nov-peso-interfaccia`; di
  `motion/motion.css`: `--nov-motion-curva` (con ripiego).

## 9. Richieste ad altri agent

- **scaffold-engineer**: in `Novanta.tsx` montare `ascoltaAttivita(rootEl)`
  (pulizia allo smontaggio); `runtime.reset()` porta `ultimoInput` a 0;
  importare `interaction/interaction.css` nell'ordine di tech-architect §5;
  `data-nov-ix-scorre` sul Palco. Lo stub di `runtime.ts` deve avere
  `ultimoInput: number`, quello di `geometria.ts` `ANGOLI`, `Angolo`, `limita`.
- **section-builder-quadrante** (`useBraccio.ts`, `Braccio.tsx`,
  `ParoleAngoli.tsx`): collegamenti di §2.1 e §2.3; `store.impostaAttivo`
  attraverso `creaCadenza` (§4); ganci di §5 (`.nov-ix-manopola`,
  `.nov-ix-fuoco` dentro lo slider, `.nov-ix-anteprima` nel gruppo del braccio,
  `.nov-ix-parola` con `data-gradi`); area toccabile del braccio fuori dai
  primi 20 px dal bordo sinistro in geometria `bordo`; fascia a 90° con mappa
  lineare (§2.2).
- **section-builder-prenota** (`useAnello.ts`, `Anello.tsx`, `Modulo.tsx`):
  `useTrascinaAttorno` e `useRotella` sull'anello come in §2.2-2.3,
  `tastiAnello` sullo slider, `data-nov-ix-rotella="blocca"` e
  `data-nov-ix-scorre` sulla colonna del modulo, `.nov-ix-fuoco` attorno
  all'indice, `.nov-ix-pillola` su prima/dopo/suggerimenti/invio (`--piena`
  per "Fissa le due visite", `aria-busy` in invio).
- **section-builder-zero / testata / prezzi-dove / vista elenco**:
  `.nov-ix-pillola--piena` su "Prenota", `.nov-ix-pillola` su "Leggi in
  elenco", `.nov-ix-link` su tel: e "Apri in Maps".
- **motion-designer**: quando il chiamante fa `vaA()` o `aggancia()` dall'`onFine` della rotella
  nello stesso istante della quiete interna, l'ultimo comando deve vincere
  senza doppia corsa (a me sembra già così: confermarlo nel doc).
- **accessibility-auditor**: provare VoiceOver iOS e TalkBack su braccio e
  anello (§6), e contare i cambi di superficie al secondo con tre scatti di
  rotella rapidi da 0° a 180°.
