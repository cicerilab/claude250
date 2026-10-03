# Interaction designer · Concept 14 · BATTIFILO

Ondata 2. Rotta `/concept-14`. Seguiti `design-taste-frontend` (4.5, 4.6,
5.D, 6.A, 6.B, 9.A) e `full-output-enforcement`: file completi, niente
segnaposto.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/processo-agent.md`,
`docs/matrice-concept-11-20.md` (riga e paragrafo 14),
`concepts/10-torchio/docs/integrazione-sito.md`, tutti i doc dell'ondata 1 in
`concepts/14-battifilo/docs/` (creative-director §4.3, §4.6, §4.7, §4.8;
trend-researcher P1, P3, P5, P6, §5.1, §5.5; brand-strategist; ux-architect
§2, §5.1-5.3, §5.9, §6; tech-architect §3, §4, §5, §6, §7.1-7.3, §12), i doc
e il codice `interaction/` del pilota e di NOVANTA (solo formato e euristiche
già provate). Letti anche i file scritti in parallelo: `styles/tokens.css`
(art-director), `motion/choreography.ts` (motion-designer).

## 0. File consegnati

Tutti in `src/pages/concepts/battifilo/interaction/`:

| File | Cosa fa |
|---|---|
| `trascina.ts` | `useTrascinaOrizzontale()`: puntatore → px e velocità, per la cassetta (presa immediata), la striscia del filo (tocco = tacca vicina, oltre soglia trascinamento) e la lastra su telefono (presa solo se il gesto è orizzontale: il nastro scorre sotto la cassetta). Esc annulla, secondo dito annulla, clic assorbito dopo un trascinamento partito su una tacca. Esporta `asseDelGesto()`, `eventiPresi`, `puntatoriInPresa`, `ingranditaColPizzico()`. |
| `swipe.ts` | `useSwipe()`: un gesto del dito = un mese, sulla foto (orizzontale e verticale) e sulla lastra (solo verticale, e solo se non è espansa). Esporta `versoDelloSwipe()` puro. |
| `rotella.ts` | `useRotellaAScatti()`: rotella e trackpad, un mese per gesto, blocco di 400 ms tra due passi, precedenza alle aree che scorrono, Ctrl + rotella mai toccato. Esporta `eScatto()` e `deltaPx()`. |
| `tastiera.ts` | `tastiSlider()`, `destinazioneSlider()`, `creaRipetizione()`, `tastiTacche()`, `tastoSuPassoDisattivato()`: mappe pure dei tasti per lo slider e per il gruppo delle tacche. |
| `attivita.ts` | `segnaInput()`, `inattivoDa()`, `segnaSpostamento(origine)`, `ultimaOrigine()`, `annunciaCambio()`, `alPrimoSpostamento()`, `ascoltaSpostamenti()`, `azzeraAttivita()`, `ascoltaAttivita()`. |
| `interaction.css` | Anello di fuoco (cobalto su lastra, calce su ferro e dentro gli oggetti pieni), cursori di sistema, cassetta all'hover e alla presa, tacche, tasti quadrati, link, voci della fascia, righe di scelta, `touch-action` del palco, reduced motion, colori forzati. 6,3 KB minificato, zero hex, zero trattini lunghi. |

**Verifica** (banco di prova nello scratchpad, `node_modules` del pilota,
stessi `tsconfig.app.json` ed `eslint.config.js`, stub di `state/runtime.ts`
e `core/tempo.ts` scritti come in tech-architect §6.2 e §7.1, file veri di
`motion/`):
- `tsc` strict (`noUncheckedIndexedAccess`, `noUnusedLocals`) e `eslint` con
  `react-hooks` verdi sui sei file; `interaction.css` passa esbuild senza
  avvisi;
- Chromium headless (Playwright 1.56, `hasTouch`) con React vero e un banco
  minimo, zero errori in console:
  swipe sulla foto a sinistra → `onPasso(1)`, a destra → `-1`, in su → `1`
  (asse verticale), a 45° → niente; sulla lastra chiusa swipe in su → un
  passo, gesto orizzontale → `onInizio`, 8 `onMuovi` con `dx`, `onFine(-1234
  px/s)`; lastra espansa (`'nativo'`) swipe in su → niente (scorre il
  browser); cassetta col mouse: presa al `pointerdown`, `data-btf-ix-presa=1`,
  fuoco sulla cassetta, Esc → `onAnnulla`, il `pointerup` dopo Esc non fa
  niente; rilascio con velocità → `onFine(1214)`; clic sulla striscia fuori
  dalle tacche → `onTocco(x)`; clic su una tacca → clic nativo, nessun
  `onTocco`; trascinamento partito su una tacca → presa e clic assorbito; 6
  scatti di rotella in 10 ms → **un** passo; gesto di trackpad con coda
  d'inerzia (10 eventi) → un passo; rotella sopra un'area `data-btf-ix-scorre`
  che può scorrere → scorre lei, nessun passo; tastiera da 4: → 5, PagSu 7,
  Home 0, Fine 15, ↓ 3; 5 ripetizioni in un colpo → nessuna (filtro 250 ms);
  `annunciaCambio` falso quando lo slider ha il fuoco.

---

## 1. Cursore custom, preloader, hover magnetici: cosa li sostituisce

Il mandato generico dell'ondata li chiede; il creative-director li vieta
(§4.8: "niente cursore custom, niente bottoni magnetici, niente Scorri") e
il tech-architect §9 dice che non c'è niente da aspettare (la prima pittura
è HTML + CSS). Al loro posto:

- **Il cursore è quello di sistema, e dice la verità.** Mano aperta sulla
  cassetta (`grab`), mano chiusa mentre si tira (`grabbing`, su tutto il
  concept finché la presa dura), mano a puntare sulla striscia del filo e
  sulle tacche, `not-allowed` su "mese prima" a PRIMA, `progress` sul
  bottone durante l'invio (già in `lastra.css`). Nessun cerchio che segue il
  mouse: coprirebbe le tacche da 44 px.
- **Il magnete è l'aggancio.** L'unica attrazione del sito è la cassetta che
  al rilascio va alla tacca più vicina e batte (è del motion-designer,
  `motion/cassetta.ts`). Nessun bottone si sposta verso il mouse.
- **Nessun preloader.** L'attesa è la battuta d'apertura dopo 600 ms: un
  gesto che insegna il controllo, non una percentuale.

---

## 2. L'interazione firma: "Tira il filo"

### 2.1 Chi ascolta cosa

Tre elementi ascoltano il puntatore, dal più interno al più esterno. Il più
interno vince, senza coordinamento esplicito, grazie a due oggetti di modulo
(`eventiPresi`, un WeakSet dei `pointerdown` già presi; `puntatoriInPresa`,
gli id dei puntatori che stanno tirando):

| Elemento | Hook | Presa | Asse | Cosa fa |
|---|---|---|---|---|
| cassetta (`role="slider"`) | `useTrascinaOrizzontale` | immediata | libero | segue il dito 1:1 con lo scarto di presa (`x − x0`); il chiamante fa `cassetta.trascina(posDaX(x − scarto))` |
| striscia del filo (largo e stretto) | `useTrascinaOrizzontale` | soglia 8 px (3 col mouse) | libero | tocco su un punto vuoto → `onTocco(x)` → `vaA(tappaVicina(posDaX(x)))`; trascinamento → come la cassetta ma con x assoluta |
| lastra (solo `< 60em`, solo dito e penna) | `useTrascinaOrizzontale` | soglia, entro 30° | orizzontale | il nastro scorre: `dx` dal punto di presa → `trascina(posIniziale − dx / passo)` |
| foto | `useSwipe` | 8 px | orizzontale e verticale | un mese per gesto |
| lastra chiusa | `useSwipe` | 8 px | verticale | un mese per gesto (vedi §4) |
| `<main id="cronaca">` | `useRotellaAScatti` | | | un mese per gesto |

`useCassetta.ts` (section-builder-linea) fa `segnaSpostamento(origine)` e
poi comanda `motion/cassetta.ts`: i hook non conoscono i mesi. Il codice
d'uso è in §7.

### 2.2 Il gesto, passo per passo (desktop)

1. **Hover sulla cassetta**: la maniglia si solleva di 2 px in 160 ms (curva
   `--btf-ease-tiro` del motion-designer). È il solo hover con movimento del
   sito: dice "questo si afferra".
2. **Presa** (`pointerdown`): capture del puntatore, `data-btf-ix-presa="1"`
   sulla cassetta, `data-trascina="1"` sulla radice (dallo store), maniglia a
   3 px, cursore `grabbing` ovunque, selezione del testo spenta, fuoco sulla
   cassetta (così dopo il rilascio le frecce continuano da lì). Afferrare
   una cassetta in volo la ferma (lo fa il controller quando riceve
   `trascina`).
3. **Tiro**: `onMuovi(x, dx)` a ogni `pointermove` con x diversa; nessun
   setState, nessuna lettura di layout (`sinistraPagina` la legge il
   chiamante in `onInizio`, l'unico momento permesso). La foto e la scheda
   cambiano per fasi, mai più di una volta ogni 500 ms (limite del
   controller, non di questo hook).
4. **Sosta**: se il dito sta fermo 500 ms la cassetta aggancia e batte
   (controller); il hook continua a mandare le mosse, il controller decide.
5. **Rilascio**: velocità in px/s sugli ultimi 90 ms; se il dito era fermo
   da più di 70 ms, 0. Il chiamante la converte in tappe/s (`vel / passo`) e
   passa a `rilascia()`: aggancio alla tacca vicina, al massimo +1 nel verso
   se la velocità supera `CASSETTA.sogliaLancio`. Nessuna inerzia lunga
   (trend-researcher §5.5: non è un range slider).
6. **Esc durante la presa**: `onAnnulla()`, il chiamante fa
   `vaA(tappaFerma, { subito: true })`. Secondo dito (pizzico): stesso
   annullamento, lo zoom resta al browser. `pointercancel` (il sistema si è
   preso il gesto): idem.

### 2.3 Su telefono: la linea che scorre sotto la cassetta

- La cassetta ferma al centro resta afferrabile (stesso hook, `onMuovi` con
  `dx`: il chiamante fa `trascina(posIniziale + dx / passo)`, perché qui
  spostare il dito a destra vuol dire tirare il filo, cioè andare avanti).
- La lastra intera sotto la foto è presa orizzontale: primi 8 px entro 30°
  → nastro (`trascina(posIniziale − dx / passo)`: il nastro segue il dito,
  la cassetta è ferma); oltre 60° → `useSwipe` (un mese, §4); tra 30° e 60°
  → niente, il gesto è incerto e non si indovina.
- `touch-action: pinch-zoom` sulla foto, sulla lastra e sulla striscia (con
  `none` come ripiego per i browser che non lo capiscono): il browser non
  scorre nulla, lo zoom col pizzico resta. Con la pagina già ingrandita
  (`visualViewport.scale > 1`) `swipe.ts` scrive `data-btf-ix-zoom="1"` e il
  CSS rimette `touch-action: auto`: il dito sposta la vista, non il tempo;
  la cassetta però si afferra lo stesso (44×56 px sono un bersaglio anche
  ingranditi).
- I due tasti "mese prima" / "mese dopo" (`data-btf-ix="tasto"`) sono
  bottoni veri con `touch-action: manipulation` (niente ritardo di 300 ms,
  niente doppio tocco = zoom).

### 2.4 Un trascinamento partito sopra una tacca

Sul nastro (passo 64 px) quasi ogni dito parte sopra una tacca. Regola: il
trascinamento vale, e il `click` che il browser manda al rilascio viene
assorbito (400 ms, in cattura). Un tocco fermo sulla tacca resta un clic
nativo → `vaA(mese)`. Così "prendo la lastra e la tiro" non finisce mai sul
mese da cui si è partiti.

---

## 3. Rotella e trackpad: un passo, non uno scorrimento

`useRotellaAScatti` sul `<main>` della cronaca (foto + lastra); le tre
schermate e la fascia sono fuori da `main`, lì la rotella è del browser.

- **Scatti** (rotella a tacche; Firefox in righe): ogni scatto chiede un
  passo, ma tra due passi passano almeno `BLOCCO_ROTELLA` = 400 ms. Girare di
  corsa dà 2,5 mesi al secondo, non 15 (limite anti-lampeggio: la foto è una
  grande superficie).
- **Continuo** (trackpad, Magic Mouse): i delta si sommano; a 40 px parte
  un passo e il resto del gesto è consumato; il gesto finisce dopo 180 ms
  senza eventi. La coda d'inerzia arriva senza pause, quindi appartiene
  allo stesso gesto: un colpo di trackpad = un mese (Chiara e Davide,
  ux-architect §4.2). Un cambio di verso a metà gesto azzera l'accumulo.
- Riconoscimento scatto/continuo: `deltaMode` righe o pagine → scatto;
  `wheelDeltaY ≈ −3 × deltaY` → trackpad (Chrome, Safari); delta con
  decimali → continuo; delta intero ≥ 50 px → scatto. Sbagliare cambia solo
  la sensazione: in entrambi i casi si fa un passo.
- Verso: giù e destra = mese dopo; su e sinistra = mese prima; vale l'asse
  col delta maggiore.
- Mai toccato: `ctrlKey` (zoom), campi e `[data-btf-ix-rotella="libera"]`,
  aree `[data-btf-ix-scorre]` che possono ancora scorrere nel verso del
  gesto (la lastra espansa da "Di più"). Arrivati in fondo, lo stesso gesto
  non diventa un passo: serve una pausa di 300 ms (se no chi legge il
  testo lungo si ritrova a novembre).
- `preventDefault` solo quando la rotella è nostra: niente rimbalzo della
  pagina, niente "indietro" del browser col gesto orizzontale su Mac.

---

## 4. Lo swipe verticale su telefono (decisione)

Domanda aperta del trend-researcher (§5.1) da chiudere con l'ux-architect,
che in §5.3.4 lascia il verticale sulla lastra al browser (`pan-y`) e non
dice niente del verticale sulla foto. La lastra nel palco però **non
scorre** (è tutta in vista, tranne quando "Di più" la espande): un dito che
va in su troverebbe un sito morto, che è il rischio più grande del concept.

**Decisione**: nel palco lo swipe verticale è **un passo**, lo stesso di uno
scatto della rotella. In su = mese dopo (il verso in cui scorrerebbe il
contenuto, coerente con rotella giù e con swipe a sinistra); in giù = mese
prima. Un passo per gesto, mai uno scorrimento continuo del tempo in
verticale: il tempo si **tira** solo sul nastro orizzontale. Vale sulla foto
e sulla lastra chiusa.

Il verticale resta del browser (e `useSwipe` non lo tocca) quando:
- la lastra è espansa da "Di più" (`verticale: 'nativo'`, `touch-action:
  pan-y pinch-zoom`): lì c'è testo da scorrere;
- si è in modo documento (stesse soglie di `core/modo.ts`, ripetute in
  `interaction.css`): la pagina scorre davvero;
- la pagina è ingrandita col pizzico;
- si è dentro un'area `data-btf-ix-scorre` o in una schermata.

Perché un passo e non "ignora": l'ux-architect §6.6 già classifica swipe e
rotella come scorciatoie degli stessi passi di [‹][›], tacche e tastiera;
l'annuncio `aria-live` alla fermata dice il mese, quindi chi scorre "per
abitudine" capisce subito cosa ha fatto e come tornare (in giù). Perché
non uno scorrimento continuo: la metafora è tirare un filo, e un filo si
tira in orizzontale; in più tre cambi di foto per un dito che scivola sono
esattamente il lampeggio vietato.

Soglie (ux-architect §5.3.4): asse deciso nei primi 8 px con
`asseDelGesto()` (la stessa funzione di `trascina.ts`, così i due hook
sullo stesso elemento si dividono il gesto senza parlarsi); passo se lo
spostamento sull'asse è ≥ 48 px, oppure ≥ 16 px con velocità finale > 0,4
px/ms nello stesso verso; un gesto lungo più di 900 ms e lento è un
"appoggio", non uno swipe. Col mouse niente swipe (c'è la rotella, e un
trascinamento del mouse sulla lastra deve poter selezionare il testo).

---

## 5. Tastiera: alternativa a ogni gesto

| Gesto | Alternativa | Dove |
|---|---|---|
| tirare la cassetta | frecce ±1, PagSu/PagGiù ±3, Home 0, Fine 15 sullo slider | `tastiSlider`, `destinazioneSlider` |
| tasto tenuto premuto | un passo ogni 250 ms, le ripetizioni più rapide si ignorano ma restano `preventDefault` (se no la pagina scorre) | `creaRipetizione` |
| toccare una tacca | Tab al gruppo (una fermata), frecce spostano il fuoco senza cambiare mese, Home/Fine prima/ultima, Invio/Spazio vanno al mese (click nativo del `<button>`) | `tastiTacche` |
| passare sopra un buco | fuoco sulla tacca del mese col fermo: la riga del fermo compare (`aria-describedby`, CSS della sezione) | ux-architect §6.5 |
| swipe, rotella | sono scorciatoie di [‹][›] e delle frecce | |
| "mese prima" a PRIMA | `aria-disabled="true"`, resta a fuoco; Invio e Spazio assorbiti | `tastoSuPassoDisattivato` |
| Esc durante la presa | annulla | `trascina.ts` |

`destinazioneSlider` parte da `runtime.cassetta.target`, non da `pos`: tre
pressioni rapide sommano tre mesi anche se la cassetta è ancora in volo. Con
Alt, Ctrl o Cmd nessun tasto viene intercettato.

**Annuncio alla fermata** (ux-architect §5.3.5): `annunciaCambio(sliderAFuoco)`
di `attivita.ts` risponde "sì" se l'ultimo spostamento (entro 3 s) viene da
tacca, rotella, swipe, passo, linea, oppure da tastiera/trascinamento con
lo slider **senza** fuoco; "no" se viene dallo slider a fuoco (parla già
`aria-valuetext`) o non è un gesto (apertura automatica, URL, popstate).

---

## 6. Hover e micro-interazioni (tutte in `interaction.css`)

Regola di controllo (trend-researcher P3): niente cobalto negli hover, il
cobalto è solo gesso battuto. Le risposte sono di **forma** e di
**superficie**, con `transform` e `opacity` (tech-architect §5), mai colore
su grandi superfici.

| Elemento | Riposo | Hover (solo `hover: hover` e `pointer: fine`) | Premuto / presa | Fuoco |
|---|---|---|---|---|
| cassetta | maniglia a 0 | maniglia −2 px, 160 ms | maniglia −3 px, `grabbing` | anello calce dentro il corpo (calce sul calcestruzzo non si vede: 1,9:1) |
| tacca | segno 1× | segno 1,5× in altezza (origine in basso) | 1,2× | 2×; la tacca corrente (`aria-current="step"`) è sempre a 2× |
| buco | invisibile | riga del fermo (sezione) | | contorno dentro la striscia |
| tasti quadrati (‹ › − +) | | fondo rasatura | rasatura + 1 px giù | anello cobalto |
| disattivati | `not-allowed`, icona al 45% | niente | niente | restano a fuoco |
| link Chivo | sottolineato 1 px | 2 px, subito | 2 px | anello |
| voci della fascia | senza riga | riga 2 px calce | | anello calce |
| voce corrente | riga 2 px calce, cursore normale | | | |
| righe di scelta (radio) | | fondo rasatura | | anello sulla riga intera (`:has(:focus-visible)`) |
| bottone cobalto | (in `lastra.css`) | cobalto fondo | 1 px giù | anello calce dentro |
| campi | riga di base 2 px | | | anello cobalto a distanza 0 |
| h2 a fuoco da programma (`tabindex="-1"`) | | | | nessun anello |

Anello di fuoco: 3 px a 3 px di distanza, cobalto sulla lastra (3,7:1 sul
calcestruzzo, sufficiente per un indicatore non testuale), calce su ferro e
sul cartello. Colori forzati: `Highlight`, cassetta `ButtonText`, link
`LinkText`.

**Limite anti-lampeggio**: nessuno stato di questo file cambia il colore di
una grande superficie. Gli unici cambi di fondo sono su tasti da 44 px e
righe da 52 px (rasatura). La foto cambia solo per `mostraTappa`, che il
controller limita a una ogni 500 ms; la rotella aggiunge il suo blocco di
400 ms tra passi; la tastiera il filtro di 250 ms sulle ripetizioni (con il
volo di 500 ms tra tacche, la foto non cambia più di due volte al secondo).

**Reduced motion**: la maniglia e i segni delle tacche non hanno
transizione (stato finale subito), i tasti non scendono; il trascinamento
resta (è un controllo, non un'animazione), lo swipe e la rotella restano a
passi.

---

## 7. Contratto per chi costruisce (section-builder-linea, -foto, -scheda, -fascia, -misura)

### 7.1 Attributi sugli elementi (per `interaction.css`)

| Attributo | Su | Chi lo mette |
|---|---|---|
| `data-btf-ix="cassetta"` + figlio `data-btf-ix-parte="maniglia"` | la cassetta `role="slider"` e la sua maniglia | linea |
| `data-btf-ix="striscia"` | la striscia del filo (gancio, linea, tacche, cassetta) | linea |
| `data-btf-ix="tacca"` + figli `data-btf-ix-parte="segno"` e `"nome"` | ogni `<button>` tacca | linea |
| `data-btf-ix="buco"` | il bottone invisibile sopra un buco | linea |
| `data-btf-ix="tasto"` | mese prima/dopo, meno/più | linea, misura |
| `data-btf-ix="foto"` | il `<figure>` della foto | foto |
| `data-btf-ix="lastra"` | la lastra della cronaca | scaffold (`Battifilo.tsx`) o scheda |
| `data-btf-ix="link"` | link in Chivo sulla lastra e nel cartello | scheda, chiavi, cartello, mesi |
| `data-btf-ix="voce"` | voci della fascia | fascia |
| `data-btf-ix="riga"` | `<label>` delle scelte radio | misura |
| `data-btf-fondo="ferro"` | fascia, fascia bassa, menu, cartello | fascia, cartello |
| `data-btf-ix-scorre` | ogni area con scroll proprio (lastra espansa, schermate, Tutti i mesi) | scaffold (`Schermata.tsx`), scheda |
| `data-btf-ix-rotella="libera"` | dove la rotella deve restare del browser dentro `main` (nessun caso previsto oggi) | |

Scritti dai hook, mai a mano: `data-btf-ix-presa`, `data-btf-ix-verticale`,
`data-btf-ix-zoom`.

### 7.2 Uso in `useCassetta.ts` (section-builder-linea)

```ts
import { useTrascinaOrizzontale } from '../../interaction/trascina';
import { useRotellaAScatti } from '../../interaction/rotella';
import { tastiSlider, destinazioneSlider, creaRipetizione } from '../../interaction/tastiera';
import { segnaSpostamento, annunciaCambio } from '../../interaction/attivita';
import { posDaX, tappaVicina } from '../../core/tempo';
import { runtime } from '../../state/runtime';

// letture di layout solo qui (inizio presa) e nel ResizeObserver di Linea.tsx
const aggiornaSinistra = () => { runtime.linea.sinistraPagina = lineaEl.getBoundingClientRect().left; };

useTrascinaOrizzontale(cassettaRef, {
  attivo: () => store.get().vista === 'cronaca' && store.get().modo === 'palco',
  presa: 'immediata', asse: 'libero',
  onInizio: () => { aggiornaSinistra(); posPresa = runtime.cassetta.pos; segnaSpostamento('trascina'); store.impostaTrascina(true); },
  onMuovi: (_x, dx) => cassetta.trascina(runtime.linea.formato === 'nastro' ? posPresa + dx / runtime.linea.passo : posPresa + dx / runtime.linea.passo),
  onFine: (vel) => { store.impostaTrascina(false); cassetta.rilascia(vel / runtime.linea.passo); },
  onAnnulla: () => { store.impostaTrascina(false); cassetta.vaA(store.get().tappaFerma, { subito: true }); },
});

useTrascinaOrizzontale(strisciaRef, {
  attivo: () => runtime.linea.formato === 'intera' && store.get().vista === 'cronaca',
  presa: 'soglia', asse: 'libero',
  focusSu: () => cassettaRef.current,
  onTocco: (x) => { segnaSpostamento('linea'); cassetta.vaA(tappaVicina(posDaX(x - runtime.linea.sinistraPagina, runtime.linea))); },
  onInizio: ({ x }) => { aggiornaSinistra(); segnaSpostamento('trascina'); store.impostaTrascina(true); cassetta.trascina(posDaX(x - runtime.linea.sinistraPagina, runtime.linea)); },
  onMuovi: (x) => cassetta.trascina(posDaX(x - runtime.linea.sinistraPagina, runtime.linea)),
  onFine: (vel) => { store.impostaTrascina(false); cassetta.rilascia(vel / runtime.linea.passo); },
});

useTrascinaOrizzontale(lastraRef, {      // solo nastro (stretto)
  attivo: () => runtime.linea.formato === 'nastro' && store.get().vista === 'cronaca' && !schedaEspansa,
  presa: 'soglia', asse: 'orizzontale', puntatori: ['touch', 'pen'],
  focusSu: () => cassettaRef.current,
  onInizio: () => { posPresa = runtime.cassetta.pos; segnaSpostamento('trascina'); store.impostaTrascina(true); },
  onMuovi: (_x, dx) => cassetta.trascina(posPresa - dx / runtime.linea.passo),   // il nastro segue il dito
  onFine: (vel) => { store.impostaTrascina(false); cassetta.rilascia(-vel / runtime.linea.passo); },
});

useRotellaAScatti(mainRef, {
  attivo: () => store.get().vista === 'cronaca' && store.get().modo === 'palco',
  onPasso: (verso) => { segnaSpostamento('rotella'); cassetta.passo(verso); },
});

const ripeti = useRef(creaRipetizione()).current;
const onKeyDown = (e: React.KeyboardEvent) => {
  const azione = tastiSlider(e); if (!azione) return;
  e.preventDefault(); if (!ripeti(e)) return;
  segnaSpostamento('tastiera');
  cassetta.vaA(destinazioneSlider(azione, runtime.cassetta.target), { forza: e.repeat ? 'corta' : 'piena' });
};
// alla fermata: if (annunciaCambio(document.activeElement === cassettaRef.current)) annuncia(valoreParlante(t))
```

(`forza` della battuta: se `vaA` non la prende, la sezione chiama
`filo.batti()` con `FILO.ampiezza.corta` quando `e.repeat`.)

### 7.3 Uso nella foto e nella scheda

```ts
useSwipe(fotoRef, { attivo: () => vista === 'cronaca' && modo === 'palco', orizzontale: true, verticale: 'passo',
  onPasso: (verso) => { segnaSpostamento('swipe'); cassettaCorrente()?.passo(verso); } });
useSwipe(lastraRef, { attivo: () => vista === 'cronaca' && modo === 'palco', orizzontale: false, verticale: espansa ? 'nativo' : 'passo',
  onPasso: (verso) => { segnaSpostamento('swipe'); cassettaCorrente()?.passo(verso); } });
```

Tacche: `onClick={() => { segnaSpostamento('tacca'); cassetta.vaA(m); }}`,
`onKeyDown` con `tastiTacche(e, indice, totale)` → `fuoco` sposta il
`tabIndex` mobile e chiama `focus()` sulla tacca. Mese prima/dopo:
`segnaSpostamento('passo'); cassetta.passo(±1)`; se `aria-disabled`,
`tastoSuPassoDisattivato(e)` → `preventDefault`.

Istruzione "Tira il filo": `useEffect(() => alPrimoSpostamento(() =>
store.segnaIstruzione()), [])`.

---

## 8. Richieste ad altri agent

- **scaffold-engineer**: in `Battifilo.tsx` al mount `azzeraAttivita()` e
  `ascoltaAttivita(rootEl)` (pulizia allo smontaggio); `data-btf-ix="lastra"`
  sulla `.btf-lastra` e `data-btf-ix-scorre` sul contenitore che scorre di
  `Schermata.tsx`; importare `interaction/interaction.css` dopo
  `motion/motion.css` (ordine di tech-architect §5); `runtime.ultimoInput`
  in `state/runtime.ts` come da §6.2. Le funzioni di `core/tempo.ts` usate
  qui: solo `ULTIMA_TAPPA` e il tipo `Tappa`.
- **section-builder-linea, -foto, -scheda, -fascia, -misura, -cartello,
  -mesi**: attributi di §7.1 e codice di §7.2-7.3. La riga del fermo sulla
  tacca a fuoco e la sparizione dell'istruzione sono loro (CSS e store).
- **motion-designer**: `motion/cassetta.ts` deve fermare un volo in corso
  quando riceve `trascina()` (afferrare in volo) e `rilascia(vel)` deve
  ricevere tappe/s con segno nel verso del tempo (per il nastro il segno è
  già invertito da chi chiama). `vaA` con la forza della battuta, oppure la
  sezione chiama `filo.batti()` a parte per il tasto tenuto premuto.
- **ux-architect** (conferma): swipe verticale = un passo (§4 qui), foto e
  lastra chiusa; nella lastra espansa resta `pan-y`. Zona tra 30° e 60°
  = gesto ignorato. `aria-live` secondo `annunciaCambio()`.
- **art-director**: l'anello di fuoco sugli oggetti pieni (bottone cobalto,
  cassetta) è calce **dentro** l'oggetto (offset −6 px), non cobalto fuori:
  da riportare in `DESIGN.md` se dice altro. Nessun colore nuovo usato.
- **accessibility-auditor**: provare l'ordine cassetta → gruppo tacche →
  buco; Esc durante la presa; `not-allowed` su ‹ a PRIMA; il fuoco sulla
  tacca del mese col fermo che fa comparire la riga; lo zoom col pizzico
  sulla lastra (`data-btf-ix-zoom`).
- **cross-browser-tester**: `touch-action: pinch-zoom` è dichiarato dopo
  `none` come miglioramento; Firefox e WebKit lo capiscono, verificare che
  lo zoom col pizzico funzioni sulla foto e sulla lastra a 375.
