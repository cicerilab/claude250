# Motion designer · Concept 16 · EVIDENZIA

Ondata 2. Documento vincolante per chi muove qualcosa nel concept: scaffold,
interaction-designer (`tratto/Tratto.tsx`), section-builder di testata,
annunci, comandi, scheda, giro e mappa. Qui ci sono le curve, le durate, la
coreografia per schermata, le API dei miei moduli e cosa serve dagli altri.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga e paragrafo
16, regole comuni), `concepts/10-torchio/docs/integrazione-sito.md`, tutti i
doc dell'ondata 1 in `concepts/16-evidenzia/docs/` (creative-director,
trend-researcher, brand-strategist, ux-architect, tech-architect),
`concepts/10-torchio/docs/motion-designer.md` (solo formato),
`.claude/skills/design-taste-frontend/SKILL.md` (sez. 1, 5),
`.claude/skills/full-output-enforcement/SKILL.md`. Letti anche, per
allinearmi, i file già scritti in parallelo: `styles/tokens.css` e
`styles/tokens.ts` (art-director), `interaction/segni.ts`,
`interaction/useEvidenziatore.ts`, `interaction/cambioVista.ts`
(interaction-designer), `tratto/forma.ts` (vector-artist).

File miei (tutti in `src/pages/concepts/evidenzia/motion/`):

| File | Contenuto |
|---|---|
| `easing.ts` | curve con nome (funzioni TS + CSS), la curva della mano campionata in `linear()` con ripiego bezier, lo slancio che eredita la velocità del gesto, utilità numeriche |
| `durate.ts` | tutte le durate e soglie (`TRATTO`, `SCARICO`, `STACCO`, `COLORE`, `VELO`, `VISTA`, `PERCORSO`, `SOGLIE_GESTO`), `variabiliMotion()`, `durataPerDistanza()` |
| `tratto.ts` | `completa`, `ritira`, `scolora`, `disegnaDaBottone`, `dimostrativo`, `scarico`, `ferma`, `registraAvanzamento` |
| `stacco.ts` | `stacca`, `rimetti` (FLIP annuncio ↔ scheda), `retinoAColore`, `mostraVelo`, `nascondiVelo`, `liberaScheda` |
| `vista.ts` | `fotografaVista`, `cambiaVista` (Leggi ↔ Pagina intera con punto fisso), `puntoDaClic`, `puntoAlCentro`, `scalaPaginaIntera`, `fermaVista` |

**Verifiche fatte**:
- `tsc` strict + `noUncheckedIndexedAccess` + `noUnusedLocals/Parameters` ed
  ESLint 9 (stessa configurazione del pilota) sui cinque file, contro stub di
  `state/runtime.ts` e `state/store.ts` costruiti sui contratti del
  tech-architect §6: zero errori, zero avvisi.
- Numeri (bundle Node): tutte le 12 curve monotone e dentro 0..1; la mano vale
  0,1 → 0,013, 0,5 → 0,598, 0,9 → 0,997; la bezier di ripiego della mano
  sbaglia al massimo 0,017; lo slancio parte esattamente con la pendenza
  chiesta (0,6 / 1,4 / 3,5 misurate) e arriva a 1 senza superarlo; il
  completamento dura 160 ms da 0,55, 107 ms da 0,8, 70 ms da 0,95.
- Chromium headless (Playwright), pagina di prova: `--evd-avanzamento`
  registrata e interpolata come numero (a metà di `completa` vale 0,93); a
  fine animazione valore inline `1`, zero animazioni appese, `runtime.tratti`
  coerente; `scolora` porta l'opacità a 0,22 a metà e lascia avanzamento 0 e
  opacità del CSS; `scarico` si ferma a 0,46 e finisce a 0; `ferma` a metà di
  un disegno lascia 0,19 senza animazioni; `stacca` crea il clone senza id
  doppi, mette `data-evd-stacco="fuori"`, ritaglia la scheda
  (`inset(0 152px 241px 0)` a metà), alla fine rimuove il clone e non lascia
  animazioni; `rimetti` toglie l'attributo e il clone e lascia la scheda a
  opacità 0 in attesa di smontaggio; `cambiaVista` ha **fotogramma 0 identico
  alla foto di partenza** in entrambe le direzioni (nessuno scatto),
  overflow dello scroller nascosto solo durante il volo, scala finale 0,25 e
  1, scroll di Leggi portato sul punto chiesto (limitato ai bordi). Uno
  screenshot a metà stacco è stato guardato: la scheda si apre dal
  rettangolo dell'annuncio ruotata di poco, il ritaglio vuoto resta al suo
  posto.

---

## 0. Decisioni in breve

1. **Niente GSAP, niente libreria di motion, niente rAF mio.** Tutte le
   animazioni sono una tantum e vanno con la Web Animations API (tech-architect
   §2.2). Ciò che segue il dito resta nel ticker dell'interaction-designer; io
   intervengo solo quando il dito si alza.
2. **Una sola variabile animata, registrata**: `--evd-avanzamento`
   (`CSS.registerProperty`, `<number>`, ereditata, iniziale 0). WAAPI la
   interpola come un numero, quindi qualunque `calc()` scriva Tratto per una o
   due righe segue da solo. È il modo di animare "il tratto" senza sapere come
   è disegnato.
3. **La mano come curva firma.** Il tratto disegnato da solo (bottone,
   dimostrativo, posti del giro) e il percorso sulla mappa usano la stessa
   curva: il profilo di velocità a campana dei movimenti umani, reso
   asimmetrico (picco al 43% del tempo, frenata più lunga perché la punta si
   ferma premendo a fine riga, dove il vector-artist mette più inchiostro).
   È lo stesso gesto dalla carta alla città (CD 2, idea 2).
4. **Il tratto eredita lo slancio.** Al rilascio oltre il 55% il tratto non
   riparte da fermo: la bezier del completamento parte con la pendenza della
   velocità della mano (limitata tra 0,6 e 3,5) e frena a fine riga senza
   superarla. Durata proporzionale a quanto manca (radice), 160 ms dal 55%.
5. **La scheda non si scala mai.** Lo stacco è un FLIP senza deformazioni: la
   scheda si sposta e si ritaglia (`clip-path`) dal rettangolo dell'annuncio
   alla sua misura, mentre un clone dell'annuncio (il ritaglio di carta) si
   solleva di 4 px, ruota di 1° con l'ombra tinta di carta e svanisce sopra.
   Il testo resta nitido in ogni fotogramma.
6. **Zoom percettivamente uniforme.** Leggi ↔ Pagina intera è uno zoom intorno
   al punto fisso geometrico delle due viste, con la scala interpolata in modo
   geometrico su 12 fotogrammi chiave: da 1 a 0,4 non accelera in fondo.
7. **Reduced motion = stato finale immediato**, con le eccezioni già scritte
   dallo ux: la scheda si apre con una dissolvenza di 150 ms; il tratto
   scarico resta pallido fermo a metà per 600 ms e poi sparisce senza
   movimento (è un cambio di stato, non un'animazione).
8. **Nient'altro si muove** (CD 4.10): niente entrate allo scroll, niente
   hover animati da me, niente pannello del giro che scivola, niente
   comparsa animata della barra sticky.

---

## 1. Principi (valgono anche per ciò che non è scritto qui)

- **Chi lo muove?** Ogni movimento ha una causa del mestiere: la mano con
  l'evidenziatore (tratto, percorso), la mano che stacca un ritaglio dal
  giornale (scheda), l'occhio che si allontana dalla pagina (vista), la stampa
  che si sviluppa (retino → colore). Se non c'è una causa, non si muove.
- **La pagina è già stampata.** Nessun contenuto aspetta un'animazione per
  essere leggibile o cliccabile. Al caricamento si muove una sola cosa: il
  tratto dimostrativo su "Segna".
- **Il rosa si muove solo per causa tua.** Le animazioni del tratto partono
  da un gesto o da un bottone; l'unica eccezione è il dimostrativo, una volta.
- **Solo `transform`, `opacity`, `clip-path` e `--evd-avanzamento`.** Nessuna
  animazione di larghezza, altezza, margini: zero CLS.
- **Niente lampi.** Nessun cambio di luminosità ripetuto; il velo sul foglio
  cambia al massimo una volta ogni 500 ms (se si chiude prima, l'uscita si
  allunga). Il cambio di vista è limitato a uno ogni 500 ms da
  `interaction/cambioVista.ts`.
- **Interrompibile.** Ogni funzione, chiamata di nuovo sullo stesso elemento,
  riparte dal valore visibile in quel momento.

---

## 2. Le curve (`easing.ts`)

Tutte `(t) => valore`, t limitato a 0..1, monotone, mai oltre 1 (verificato).
In CSS: `BEZIER_CSS[nome]` (sempre supportata) o `easingCss(nome)` (la
migliore per il browser: `linear()` campionata per la mano dove esiste).

| Nome | Forma | Uso e causa | CSS |
|---|---|---|---|
| `mano` | velocità `t²(1-t)^2,6` integrata e normalizzata; picco al 43% | tratto dal bottone e dai posti del giro (350 ms), dimostrativo (600 ms), percorso sulla mappa (900 ms): la punta che parte da ferma e frena premendo | `linear()` a 33 campioni; ripiego `cubic-bezier(0.46, 0, 0.4, 1)` |
| `slancio(p)` | `cubic-bezier(0.2, min(0.95, 0.2p), 0.35, 1)` | completamento dopo il rilascio: parte con la velocità della mano (pendenza p) e si ferma a fine riga | `slancioCss(p)` |
| `rientro` | `cubic-bezier(0.5, 0, 0.15, 1)` | il tratto corto che torna al punto in cui la punta si era posata; seconda metà del tratto scarico | stessa |
| `asciuga` | `cubic-bezier(0.2, 0.55, 0.35, 1)` | il rosa che si scolora: cala subito, poi sparisce lentamente come inchiostro che asciuga | stessa |
| `esaurisce` | `cubic-bezier(0.1, 0.6, 0.25, 1)` | il quinto tratto: parte veloce e muore, l'inchiostro finisce | stessa |
| `solleva` | `cubic-bezier(0.25, 0.8, 0.3, 1)` | il ritaglio che si stacca dal foglio: scatto breve, poi si assesta | stessa |
| `apre` | `cubic-bezier(0.55, 0, 0.12, 1)` | il ritaglio tirato verso destra che si apre in scheda: la mano tira, poi accompagna | stessa |
| `chiude` | `cubic-bezier(0.45, 0, 0.2, 1)` | la scheda che torna ritaglio | stessa |
| `posa` | `cubic-bezier(0.35, 0, 0.1, 1)` | il ritaglio che si riadagia nel suo buco, senza rimbalzi (la carta non rimbalza) | stessa |
| `sviluppo` | `cubic-bezier(0.45, 0, 0.25, 1)` | la foto dal retino al colore, come una stampa nel bagno di sviluppo | stessa |
| `obiettivo` | `cubic-bezier(0.5, 0, 0.1, 1)` | Leggi ↔ Pagina intera (applicata al tempo; la scala è già geometrica nei fotogrammi) | stessa |
| `velo` | `cubic-bezier(0.33, 0, 0.25, 1)` | oscuramento del foglio, dissolvenze di ripiego | stessa |
| `lineare` | `t` | solo per tempi proporzionali | `linear` |

Utilità esportate: `clamp`, `clamp01`, `lerp`, `lerpLog`, `cubicBezier`,
`cssLinear`, `supportaLinear`, `easingCss`, `pendenzaSlancio`, `slancio`,
`slancioCss`, `CURVE`, `BEZIER_CSS`, `NOMI_CURVE`, `PENDENZA_SLANCIO_DEFAULT`.

Valori di controllo della mano: 0,1 → 0,013; 0,25 → 0,142; 0,5 → 0,598;
0,75 → 0,943; 0,9 → 0,997.

---

## 3. Durate e soglie (`durate.ts`)

| Costante | Valore | Fonte |
|---|---|---|
| `TRATTO.completa` | 160 ms da 0,55 a 1; minimo 70 ms; proporzionale alla radice della distanza | CD 4.4 |
| `TRATTO.ritira` | 200 ms (minimo 90) | CD 4.4 |
| `TRATTO.scolora` | 250 ms | CD 4.4 |
| `TRATTO.disegnaDaBottone` | 350 ms (se il tratto era già in parte visibile: la parte che manca, minimo il 35%) | CD 4.4 |
| `TRATTO.dimostrativo` | 600 ms, dopo 450 ms dai font pronti (attesa font massima 3 s) | CD 4.2, tech §9.2 |
| `SCARICO` | esce 300 + sosta 160 + rientra 220 = 680 ms; si ferma a 0,48 ± 0,06 (dal seme); ridotto: fermo 600 ms; avviso 8 s | CD 4.4, ux 5.7 A, 6.4 |
| `STACCO` | solleva 120 + apre 300 = 420 ms; chiude 260 + posa 110 = 370 ms; 4 px, 1°; il clone svanisce nel primo 45% dell'apertura e ricompare nell'ultimo 40% della chiusura; ridotto 150 ms; annuncio fuori vista 180 ms | CD 4.3, 4.4 |
| `COLORE.sviluppo` | 520 ms, almeno 60 ms dopo l'inizio dell'apertura | CD 2, idea 3 |
| `VELO` | 200 ms entrata, 200 ms uscita, almeno 500 ms tra due cambi | ux 6.1 |
| `VISTA` | allontana 340 ms, avvicina 300 ms, 12 fotogrammi, aria 32 px | ux 5.3, 8 |
| `PERCORSO` | 900 ms, 180 ms dopo il primo tile, curva `mano` | CD 4.5 |
| `SOGLIE_GESTO` | 6 px mouse, 12 px e 30° touch, 55%, 40 px annullamento verticale, 24 px dal bordo, vibrazione 10 ms | CD 4.4, ux 6.4, trend R5 (consultazione: le applica interaction/) |

`variabiliMotion(ridotto, client?)` restituisce le variabili
`--evd-ease-<curva>` e `--evd-durata-velo|scolora|tratto|colore` (0ms con
reduced motion) per le poche transizioni scritte in CSS.

---

## 4. Il tratto (`tratto.ts`)

### 4.1 Contratto

- `el` è **il nodo foglia `data-evdvar` del tratto**, quello il cui
  `clip-path` legge `--evd-avanzamento`. In sviluppo, un `el` senza
  l'attributo produce un avviso in console.
- Il valore finale si scrive **inline sullo stesso nodo, solo se cambia**; se
  è dato `id`, `runtime.tratti.get(id)` riceve `avanzamento = bersaglio =
  finale`, `gesto = false` (voce esistente; non la creo).
- Un'animazione in corso ha la precedenza sullo stile inline (cascata WAAPI):
  se nel frattempo Tratto scrive la variabile dal ticker, non si vede nessuno
  scatto; alla fine vince il mio valore finale, scritto prima di annullare.
- Reduced motion (o browser senza `CSS.registerProperty`): stato finale
  immediato, ritorno `null`, `onFine` chiamato subito.

### 4.2 API

```ts
registraAvanzamento(): boolean                     // idempotente; la chiama Evidenzia.tsx al mount
avanzamentoCorrente(el): number                    // valore visibile (animazione compresa)
ferma(el): number                                  // blocca dove si trova, scrive inline, restituisce il valore
inMovimento(el): boolean

completa(el, da, { id?, velocita?, ridotto?, onFine? }): Animation | null         // → 1
ritira(el, da, { id?, verso?, ridotto?, onFine? }): Animation | null              // → verso, poi 0
scolora(el, { id?, ridotto?, onFine? }): Animation | null                         // opacità → 0, poi avanzamento 0
disegnaDaBottone(el, { id?, ridotto?, onFine? }): Animation | null                // → 1 con la mano
dimostrativo(el, { ritardo?, ridotto?, onFine? }): Animation | null               // 0 → 1, 600 ms
scarico(el, { seme?, inizio?, id?, ridotto?, onFine? }): Animation | null         // inizio → metà → inizio, poi 0
fermaScarico(seme): number
```

- `velocita`: frazione di riga al secondo al rilascio (dal gesto). Senza, la
  pendenza è 1,4.
- `verso`: il punto in cui la punta si era posata (`segni.inizio(id)`): il
  tratto corto torna lì e poi vale 0.
- `inizio` dello scarico: stesso significato; il tratto pallido parte da lì e
  muore a circa metà di ciò che resta della riga.

### 4.3 Da eventi del gesto a movimenti (per `tratto/Tratto.tsx`)

`interaction/segni.ts` emette gli eventi; Tratto li traduce così:

| Evento o cambio | Chiamata |
|---|---|
| `inizio` | `ferma(el)` (se un mio movimento è in corso, il gesto lo prende da lì) |
| `completa { da }` | `completa(el, da, { id, velocita })` |
| `ritira { da, a }` | `ritira(el, da, { id, verso: a })` |
| `toglie` | `scolora(el, { id })` |
| `ripristina` | `disegnaDaBottone(el, { id })` (riparte dal valore visibile) |
| `scarico` | `scarico(elScarico, { id, seme: semeDa(id), inizio: segni.inizio(id) })` sul nodo che porta la forma `scarico: true` |
| store: aggiunto senza attesa del gesto (bottone, scheda, giro) | `disegnaDaBottone(el, { id })` |
| store: tolto senza attesa del gesto | `scolora(el, { id })` |
| primo render con giro salvato o `?segna=` | nessuna chiamata: il valore 1 è già nello stile (nessun tratto "entra") |

### 4.4 Coreografia del tratto

| Momento | Movimento | Durata | Curva | Reduced motion |
|---|---|---|---|---|
| Il dito trascina | segue il puntatore (ticker, interaction) | continuo | inseguimento esponenziale dell'interaction | segue lo stesso: è manipolazione diretta, non animazione |
| Rilascio ≥ 55% | prosegue fino a fine riga | 70-160 ms | `slancio(p)` | intero subito |
| Rilascio < 55% o annullato | torna al punto di partenza | 90-200 ms | `rientro` | sparisce subito |
| Ripasso su un segnato | il rosa si scolora dove si trova | 250 ms | `asciuga` | sparisce subito |
| Bottone Evidenzia | si disegna da sinistra | 350 ms | `mano` | intero subito |
| Quinto annuncio | pallido, rallenta, muore a metà, fermo, rientra | 680 ms | `esaurisce`, fermo, `rientro` | pallido fermo a metà 600 ms, poi via |
| Dimostrativo su "Segna" | si disegna una volta | 600 ms dopo 450 ms dai font | `mano` | già lì |

---

## 5. Stacco, colore e velo (`stacco.ts`)

### 5.1 Coreografia della scheda (desktop e colonna, stesso codice)

```
t (ms)   0 ──────── 120 ─────────────────────────── 420
clone    solleva 4 px, ruota 1°,  ── viaggia verso l'angolo della scheda,
         ombra --evd-ombra-stacco    svanisce entro 255 ms
scheda   ferma, ritagliata sul   ── si sposta e si apre: clip-path da
         rettangolo dell'annuncio    "annuncio" a "scheda intera", ruota 1° → 0°
annuncio data-evd-stacco="fuori" dal fotogramma 0 (ritaglio vuoto)
foto 1   retino (già in cache)   ── dopo il caricamento: sviluppo a colori 520 ms
velo     0 → opacità del CSS in 200 ms (in parallelo, una volta)
```

Chiusura (370 ms): la scheda si richiude nel rettangolo dell'annuncio
(`chiude`), il clone ricompare sopra nell'ultimo 40% ancora sollevato e ruotato,
poi si posa (`posa`, 110 ms: 4 px giù, 1° → 0°, ombra via); nello stesso
compito l'annuncio vero perde `data-evd-stacco` e il clone sparisce.

Su 375 la scheda è a tutto schermo: lo stesso ritaglio "sale dal punto
dell'annuncio" (ux 5.5) senza codice diverso. Se l'annuncio non è in vista
(arrivo da `#scheda-214`, finestra ridimensionata) la scheda entra o esce con
una dissolvenza di 180 ms; con reduced motion 150 ms.

### 5.2 API

```ts
stacca(daEl: HTMLElement | null, aEl: HTMLElement, { ridotto?, rotazione?, strato? }): Promise<void>
rimetti(daEl: HTMLElement | null, aEl: HTMLElement, { ridotto?, rotazione?, strato? }): Promise<void>
liberaScheda(aEl): void
retinoAColore(imgRetino: HTMLImageElement | null, imgColore: HTMLImageElement, { ridotto?, ritardo? }): Promise<boolean>
mostraVelo(veloEl, { ridotto? }): Animation | null
nascondiVelo(veloEl, { ridotto? }): Promise<void>
ATTR_STACCO = 'data-evd-stacco'  (valore 'fuori'),  ATTR_CLONE = 'data-evd-clone',  ATTR_COLORE = 'data-evd-colore'  ('attesa' | 'pronto')
```

- `stacca` si chiama nel `useLayoutEffect` della scheda appena montata (scheda
  già nella posizione finale, prima della pittura). `daEl` è l'`<article>`
  (`document.getElementById(id)`); null = nessuno stacco (dissolvenza).
- `rotazione`: consiglio `variazione(semeDa(id)).rotazione > 0 ? 1 : -1` da
  `tratto/forma.ts`, così ogni annuncio si stacca sempre dallo stesso lato.
- `rimetti` si chiama **prima** di smontare la scheda; la si smonta quando la
  promessa risolve (resta nascosta dall'animazione tenuta fino allo
  smontaggio). Il fuoco sul titolo dell'annuncio lo rimette chi chiude.
- Il clone: copia dell'annuncio senza `id` e senza `data-evdvar`,
  `aria-hidden`, `inert`, `position: fixed`, con la tipografia calcolata
  dell'originale copiata inline e fondo `var(--evd-carta)`, appeso a
  `strato` (default: il genitore della scheda, dentro `.evd-root`).
- `retinoAColore` aspetta caricamento e `decode()` della foto a colori, poi
  la porta da 0 a 1 in 520 ms e la marca `pronto`. Se la foto non arriva
  risolve false e resta `attesa` (la scheda toglie quella foto dalla
  striscia, ux 5.7 C). Con reduced motion: `pronto` appena decodificata.
- `mostraVelo` anima solo l'entrata verso l'opacità del CSS;
  `nascondiVelo` risolve a velo trasparente (poi si smonta).

### 5.3 Il giro

Il pannello del giro **non scivola**: compare con il velo (200 ms) ed è già
completo (ux 5.7 B, "Apertura": gli orari sono calcolati subito). Il suo
movimento è il percorso sulla mappa: `stroke-dashoffset` della polilinea da
lunghezza a 0 in `PERCORSO.durata` con `easingCss(PERCORSO.curva)` (la mano),
`PERCORSO.attesa` dopo il primo tile e il `fitBounds` senza animazione;
riordini e tolte: percorso sostituito senza animazione (ux 5.7 B); reduced
motion: intero. Le tappe mostrano il tratto già completo (nessuna
animazione); i posti della barra si riempiono con `disegnaDaBottone`.

---

## 6. Leggi ↔ Pagina intera (`vista.ts`)

### 6.1 Protocollo

```ts
// 1. prima del cambio di stato (dentro impostaVista, vedi richieste allo scaffold)
const foto = fotografaVista(paginaEl);
// 2. store.set({ vista })
// 3. useLayoutEffect in Foglio.tsx sulla nuova vista
await cambiaVista(paginaEl, foto, vista, punto ?? null, { scroller: foglioEl });
```

- `cambiaVista` porta prima lo scroll: in Pagina intera a (0, 0); in Leggi il
  `punto` (px del contenuto non scalato) al centro dello scroller, oppure, se
  null, il punto che era al centro prima.
- Poi misura la posizione nuova e anima da quella vecchia con 13 fotogrammi
  in `transform-origin: 0 0`: scala interpolata in modo geometrico intorno al
  punto fisso delle due viste (esiste sempre quando la scala cambia); se la
  scala non cambia, pura traslazione. Il fotogramma 0 coincide con la foto
  (verificato: nessuno scatto). Legge `transform` e `transform-origin`
  calcolati, quindi funziona con qualunque scala e centratura decida
  `foglio.css`.
- Durante il volo lo scroller ha `overflow: hidden` inline (ripristinato
  dopo): la pagina in volo non cambia l'area scorrevole.
- Interrompibile: un cambio durante un altro riparte dal fotogramma visibile.
- `puntoDaClic(x, y, paginaEl)`: il punto del contenuto sotto un clic in
  Pagina intera. `puntoAlCentro(scroller, paginaEl)`. `scalaPaginaIntera({
  larghezza, altezza, contenutoW, contenutoH, aria })`: la scala di Pagina
  intera nell'area libera a sinistra del molo, mai sopra 1.
- `fermaVista()` allo smontaggio o al passaggio in colonna.

### 6.2 Coreografia

| Da → a | Durata | Curva | Cosa si vede |
|---|---|---|---|
| Leggi → Pagina intera | 340 ms | `obiettivo` sul tempo, scala geometrica | la pagina si allontana intorno al punto che guardavi, i segni rosa restano in scala |
| Pagina intera → Leggi | 300 ms | idem | la pagina si avvicina e il punto toccato arriva al centro |
| Reduced motion | 0 | | cambio immediato, scroll già al punto giusto |

La minipagina non si anima (sparisce in Pagina intera: la decide il CSS dei
comandi). Lo spostamento del foglio da minipagina, sommario e posti resta
`scrollTo({ behavior: 'smooth' })` nativo (`core/scroller.ts`), `auto` con
reduced motion.

---

## 7. Coreografia per schermata (riepilogo)

| Schermata | Cosa si muove | Cosa NON si muove |
|---|---|---|
| Apertura (1440 e 375) | solo il tratto dimostrativo su "Segna", una volta, dopo i font | testata, annunci, foto a retino, molo, barra sticky: tutto già stampato |
| Foglio, Leggi | tratti (gesto, bottone, scolora, scarico); stacco al clic sull'attacco | nessun hover animato da me, nessuna entrata allo scroll, barre sticky senza comparsa |
| Pagina intera | passaggio di scala; nessun tratto nuovo | i segni rosa (solo scalati) |
| Scheda | stacco 420 ms, sviluppo della foto 520 ms, velo 200 ms; il toggle disegna il tratto sull'annuncio sottostante (visibile dopo la chiusura, già al suo stato) | striscia foto: scorrimento nativo con snap; testo fermo |
| Giro | velo 200 ms, percorso 900 ms sulla mappa | pannello, colonna, tappe, modulo, riga di successo (nessuna cartolina, nessun timbro, nessun movimento di "conferma") |
| Colonna 375 | tratto col pollice, stacco a tutto schermo, percorso | striscia rubriche, barra del giro sticky, "Hai segnato" |

---

## 8. Richieste ad altri agent

**scaffold-engineer**
- `Evidenzia.tsx`: al mount (client) chiamare `registraAvanzamento()` da
  `motion/tratto`; mettere `variabiliMotion(reducedMotion)` da `motion/durate`
  nello `style` di `.evd-root` (tipo `React.CSSProperties`); allo smontaggio
  `fermaVista()`.
- `state/runtime.ts`: `runtime.tratti` come da tech-architect §6.2
  (`Map<IdAnnuncio, { avanzamento: number; bersaglio: number; riga: 0 | 1;
  gesto: boolean }>` con campi mutabili). `state/store.ts`: `store.get().reducedMotion`
  corretto già al primo render.
- **Vista**: `interaction/cambioVista.ts` chiama `impostaVista(v, punto)`.
  Dentro `impostaVista`, **prima** di `store.set`, fare
  `fotoVista = fotografaVista(paginaEl)` (elemento `.evd-pagina` registrato da
  `Foglio.tsx`) e conservare `punto`; in `Foglio.tsx` un `useLayoutEffect` su
  `vista` chiama `cambiaVista(paginaEl, fotoVista, vista, punto ?? null, {
  scroller: foglioEl })`. `.evd-pagina` con `transform-origin: 0 0` è
  consigliato (non obbligatorio: lo leggo). Nessuna `transition` CSS sul
  `transform` di `.evd-pagina` (farebbe doppio movimento). La scala di Pagina
  intera si può calcolare con `scalaPaginaIntera()`.
- Livelli: il clone dello stacco va appeso fuori dallo scroller del foglio e
  dentro `.evd-root` (il genitore della scheda va bene).

**art-director**
- Aggiungere `--evd-z-stacco: 45` (sopra la scheda 40, sotto il giro 50): il
  clone usa `var(--evd-z-stacco, 45)`. `--evd-ombra-stacco` e `--evd-carta`
  ci sono già e li uso.
- Nessuna dichiarazione `@property --evd-avanzamento` nei CSS: la registra
  `motion/tratto.ts` (due registrazioni diverse la renderebbero discreta).

**interaction-designer** (`tratto/Tratto.tsx`, `tratto/tratto.css`)
- Il `clip-path` del nodo `data-evdvar` deve dipendere solo da
  `--evd-avanzamento` (e da variabili fisse per riga/inizio): così le mie
  WAAPI la animano con una o due righe.
- Tradurre gli eventi di `segni` come nella tabella §4.3.
- Aggiungere all'evento `completa` la velocità della mano al rilascio
  (`velocita?: number`, frazioni di riga al secondo): senza, uso la pendenza
  di default 1,4 e il tratto perde lo slancio.
- Il tratto scarico usa `scarico(el, { seme, inizio })` sul nodo che porta la
  forma pallida; niente `setTimeout` per nasconderlo: a fine animazione vale 0.

**section-builder-annunci**
- Stilare `.evd-root [data-evd-stacco="fuori"]` come ritaglio vuoto **senza
  cambiare la scatola dell'annuncio** (figli `visibility: hidden`, filo
  tratteggiato retino), perché lo misuro per il ritorno.
- L'aspetto dell'annuncio non deve dipendere da combinatori col genitore
  (`.evd-colonne > …`): il clone vive fuori dal foglio. Basta `.evd-root` +
  classi proprie (la tipografia ereditata la copio io).

**section-builder-scheda**
- Sequenza: montare la scheda (e il velo) → `useLayoutEffect`: `stacca(daEl,
  schedaEl, { rotazione })` + `mostraVelo(veloEl)` → a stacco risolto,
  `retinoAColore(imgRetino, imgColore)` per la prima foto (le altre foto a
  colori senza animazione). Chiusura: `Promise.all([rimetti(daEl, schedaEl),
  nascondiVelo(veloEl)])` → `chiudiScheda()` → fuoco sull'attacco.
- Foto a colori con `data-evd-colore="attesa"` iniziale e CSS
  `[data-evd-colore="attesa"] { opacity: 0 }`, sovrapposta alla retino nello
  stesso riquadro ad altezza fissa.

**section-builder-testata**: tratto dimostrativo con
`dimostrativo(nodoFoglia)` dopo `fontsReady()` (al massimo
`TRATTO.attesaFontMax`), una volta per montaggio.

**section-builder-comandi**: il posto del giro che si riempie usa
`disegnaDaBottone` sul suo nodo foglia; quello che si svuota `scolora`. Il
rettangolo della minipagina resta nel ticker (nessuna animazione).

**section-builder-giro**: velo con `mostraVelo`/`nascondiVelo`; pannello
senza scivolamento; nessuna animazione di successo.

**section-builder-mappa**: percorso con WAAPI su `stroke-dashoffset` usando
`PERCORSO` e `easingCss(PERCORSO.curva)`; `zoomAnimation: false` e
`fitBounds` senza animazione con reduced motion (ux 6.10).
