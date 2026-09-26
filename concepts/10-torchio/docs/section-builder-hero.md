# Section builder · Hero e Testata · Concept 10 · IMPRONTA

Ondata 3. File miei (esclusivi):
`src/pages/concepts/impronta/sections/Hero/Hero.tsx`, `hero.css`,
`Testata.tsx`, `testata.css`, questo documento.

Letti prima di scrivere: `DESIGN.md`, `docs/scaffold-engineer.md` (API di
`core/`, `state/`, `relief/`, ordine dei CSS), `creative-director.md`,
`ux-architect.md` (§2, §5.0, §5.1, §6, §7), `copywriter.md` + `content/testi.ts`,
`art-director.md`, `motion-designer.md` (§5, §6.0, §6.1, §7.2-7.4, §8, §9),
`interaction-designer.md` (§2, §3, §5, §9, §11.4 bis), `webgl-artist.md` §10,
`integrazione-sito.md`, le skill `design-taste-frontend` e
`full-output-enforcement`, e il codice di `motion/`, `interaction/`,
`relief/`, `state/`, `styles/`.

---

## 0. Esito

| Controllo | Esito |
|---|---|
| `npm run typecheck` | verde (tutto `src/`) |
| `npm run lint` | verde (tutto `src/`, zero avvisi) |
| Dev server mio `npx vite --port 8101 --strictPort` + Playwright (Chromium `/opt/pw-browsers`, SwiftShader) | zero errori in console dai miei file; WebGL acceso (`data-gl="on"`) e spento (`?gl=0`) |
| Prove funzionali (script Playwright) | pressa completa (`data-imp-pressa="premuta"`, `--imp-press: 1`, parola larga 1178 px su 1181 di area viva a 1440); indice: apertura, fuoco sul "chiudi", scroll bloccato, Esc, ritorno del fuoco su "indice", annuncio "Indice chiuso."; voce dell'indice → viaggio all'ancora, `h2` a 24 px dal bordo e col fuoco, riga in alto tolta di mezzo; cambio carta dall'indice (Grafite); tocco fuori chiude; riga mobile che esce scorrendo in giù e torna scorrendo in su; invito "luce col telefono" dopo il primo tocco sulla carta (iPhone 12 emulato), "Lascia stare" lo toglie e il fuoco torna su "Prova la tua"; ordine di tabulazione desktop: salti, bottone del sito, marchio, tre voci, "Prova la tua" della testata, "Prova la tua" dell'hero, dial |

Screenshot in `/tmp/claude-0/shots-hero/`:

| File | Cosa |
|---|---|
| `hero-375x667-gl0.png`, `hero-375x667-gl.png` | iPhone SE, fallback CSS e WebGL: bottone nel primo schermo |
| `hero-375x812-gl0.png`, `hero-375x812-gl.png` | 375 × 812: frontespizio (parola in testa, inchiostro al piede) |
| `hero-768x1024-gl0.png`, `hero-768x1024-gl.png` | tablet in piedi |
| `hero-1440x900-gl0.png`, `hero-1440x900-gl.png` | desktop, gabbia dell'ux-architect |
| `hero-1440-cotone.png`, `-cipria.png`, `-grafite.png` | le altre tre carte |
| `pressa-500ms.png` | a metà pressa: titolo, sottotitolo e bottone già pieni |
| `ridotto-375-400ms.png` | reduced motion: parola già premuta a 400 ms |
| `cliente-375.png`, `cliente-1440.png` | dopo l'invio: "Irene e Davide" al posto di *impronta*, "La tua prova è in stampa." |
| `scroll-375.png`, `scroll-1440.png` | testata attaccata (costa e ombra), voce corrente, richiamo in basso a destra |
| `indice-prima-375.png`, `indice-375.png`, `indice-grafite-375.png` | indice mobile, "sei qui", carta Grafite scelta |
| `invito-390.png` | invito "Muovi la luce inclinando il telefono" nel flusso |
| `focus-1440.png` | anello di fuoco sulla voce della testata (font di ripiego: prova senza Google Fonts) |

Nota sull'ambiente: il proxy della sandbox a volte rifiuta Google Fonts a
Chromium headless (scaffold §11.1). Negli script ho servito i woff2 veri
(scaricati dall'art-director nella scratchpad) al posto di
`fonts.googleapis.com`: nessun cambio al codice. Durante le prove un altro
builder aveva un file a metà (Tecniche senza default export) che faceva
cadere la pagina: per non dipendere dai loro salvataggi ho fatto girare il
mio server anche da una copia isolata nella scratchpad (sezioni altrui
sostituite da blocchi vuoti, la mia cartella `Hero/` collegata con
`preserveSymlinks`); gli screenshot finali `hero-*` e `scroll-*` sono del
progetto vero, con tutte le sezioni.

---

## 1. Hero (`#inizio`)

Markup (ordine di lettura = DOM = tabulazione):

```
<section id="inizio" class="imp-hero imp-page" aria-labelledby="imp-hero-titolo" data-imp-luce>
  <div class="imp-hero__piano">                         container-type: inline-size (= area viva)
    <div class="imp-hero__parola imp-relief imp-secco imp-pressa" data-imp-pressa="attesa" aria-hidden>impronta</div>
    [dopo l'invio: <p class="imp-sr">RILIEVI.heroParolaCliente.alt(testo)</p> + gemello di misura]
  </div>
  <div class="imp-hero__testo imp-griglia">
    <h1 class="imp-hero__titolo imp-inchiostro">HERO.titolo</h1>
    <p class="imp-hero__sotto">HERO.sottotitolo | HERO.dopoInvio</p>
    <div class="imp-hero__azioni">
      <a href="#banco" class="imp-hero__cta imp-lamina imp-ix-premibile" aria-label=TESTATA.provaAria data-imp-hero-cta>Prova la tua</a>
      <div class="imp-hero__luce">luce + dial (solo ≥ 1024)</div>
    </div>
    [invito luce col telefono, nel flusso, solo se gyroPermission è in 'invito']
    <p class="imp-sr" aria-live="polite">annunci del tilt</p>
  </div>
</section>
```

Scelte:
- **La parola riempie l'area viva al pixel.** Il corpo è
  `calc(100cqi / var(--imp-hero-em))` su un contenitore di query largo quanto
  l'area viva (con ripiego `--imp-fs-secco-hero` dei token senza unità
  `cqi`). Con `100vw` nel calcolo la barra di scorrimento di Windows (17 px)
  spingerebbe la parola oltre il margine esterno; con `cqi` no. Misurato:
  1178 px su 1181 a 1440, 335 su 335 a 375.
- **Rilievo**: `useRelief` con `{ kind: 'text', tecnica: 'secco',
  profondita: 1, tracking: 'doc', priorita: 10 }`; classe `imp-relief` messa a
  mano. **Pressa**: `usePressione(ref, { profilo: HERO.profilo, reliefId,
  ingresso: testoCliente ? 'vista' : 'montaggio', attendi: document.fonts.ready })`,
  `{...ATTESA_PRESSA}` nel markup: nasce piatta, nessun lampo.
- **H1 in `.imp-inchiostro`**: inchiostro pieno dal primo frame (pressione 1
  di default, nessun `data-imp-pressa`), con il labbro del solco appena
  accennato: è "stampato", non scritto. Non è registrato nel rilievo (con il
  GL acceso resta DOM leggibile). LCP = h1.
- **Dopo l'invio** (`store.testoCliente`): riarmo della pressa in un layout
  effect dichiarato prima di `useRelief` (motion 6.1: prima riarma, poi cambia
  il testo), riga `HERO.dopoInvio` al posto del sottotitolo, gemello `.imp-sr`
  con `RILIEVI.heroParolaCliente.alt`. Il corpo del testo del cliente viene da
  una **misura del DOM**: un gemello invisibile a 100 px con gli assi d'arrivo
  (non quelli che la pressa sta animando), dentro una scatola 0 × 0, osservato
  con ResizeObserver e `fonts.ready` → `--imp-hero-em-misurato` sul piano.
  Prima della misura vale la stima `stimaLarghezzaEm` alle tre larghezze
  d'arrivo (`--imp-hero-em-s/m/l`). Mai più grande di *impronta*.
- **Gabbia**: 375 una colonna; 600-1023 titolo su 7 colonne e sottotitolo su
  6; da 1024 titolo c1-c8 su due righe, sottotitolo c1-c5, bottone a sinistra
  e dial della luce all'estremo destro del blocco (ux 6.3). Testa ≤ 96 px
  (regola 4.7), piede `--imp-piede`.
- **Frontespizio sugli schermi in verticale** (`max-aspect-ratio: 4/5` e
  altezza ≥ 700): la parola resta in testa, il blocco in inchiostro scende al
  piede della prima schermata (`margin-top: auto`), in mezzo solo carta dove il
  dito sposta la luce. È il canone del libro (piede più alto della testa)
  applicato alla prima pagina; la testa non cresce, quindi il limite di 96 px
  resta rispettato. A 375 × 667 non scatta: tutto sta nel primo schermo
  (bottone a 508 px).
- **Invito "luce col telefono"**: `useGyro()`; visibile se lo stato è
  `invito` (o in attesa del sensore), mai con reduced motion. "Attiva"
  chiama `attivaGyro()` dentro il clic (nessun await prima), "Lascia stare"
  `rifiutaInvito()`. Esito annunciato (`ANNUNCI.tiltAttivo/tiltSpento`) nella
  regione `aria-live` dell'hero; quando la riga sparisce il fuoco torna su
  "Prova la tua". Nessun annuncio per "Lascia stare" (la luce non stava
  seguendo il telefono).
- **Dial** (`useLuceDial`, classi `imp-ix-dial` dell'interaction-designer) con
  l'etichetta visibile `LUCE.etichetta`, solo da 1024 px.
- Il clic su "Prova la tua" lo gestisce `Impronta.tsx` (link `#` delegati):
  nessun gestore mio. `data-imp-hero-cta` serve alla testata.

## 2. Testata, richiamo in basso, indice

`Testata.tsx` rende un frammento: `<header>`, il richiamo fisso, il
`<dialog>` dell'indice e una regione `aria-live`. Il richiamo e il dialog
stanno **fuori** dall'header perché l'header si trasla (headroom) e un
`transform` renderebbe il richiamo fisso relativo all'header.

### 2.1 Da 1024 px (ux 2.2)
- Marchio in lamina (`.imp-segno-caldo` con la maschera di
  `marchio-impronta.svg?url`, 18 px × 9,41), che porta a `#inizio`; tre voci;
  "Prova la tua" in lamina (44 px). Nel banco il bottone diventa il testo
  `COMUNI.seiSulBanco`, nello stesso posto (larghezza minima fissa, nessuno
  spostamento delle voci).
- Voce corrente (`aria-current="location"`, sottolineatura 2 px): mappa
  sezione → voce come da ux 2.2 (tecniche e carta accendono "lavori",
  colophon accende "bottega", hero e banco nessuna). Sezione corrente da un
  IntersectionObserver con una banda sottile al 38% dell'altezza.
- 64 px nell'hero, 56 attaccata: `position: sticky; top: -8px` con 8 px di
  padding in testa. L'altezza nel flusso non cambia mai (niente CLS).
- Il marchio parte sulla terza colonna della gabbia e mai prima di 244 px:
  in alto a sinistra c'è il bottone del sito (misurato 14..212 × 14..52).

### 2.2 Sotto 1024 px: **differenza voluta dall'ux-architect 2.3**
L'ux-architect voleva il segnapagina a tutta larghezza in basso
("indice · sezione" 60% + "Prova la tua" 40%). Ma **sotto i 640 px il
bottone "Torna in Ciceri Lab" del sito sta in basso a sinistra**
(integrazione-sito.md, fatto 3, che prevale): misurato 12..206 × 36 px a
14 px dal fondo. Il 60% sinistro del segnapagina gli finirebbe sotto, e la
parte libera a destra (≈ 135 px a 375) basta per un solo bottone.
Soluzione:
- **"indice · la sezione" sale nella riga in alto** (56 px, marchio a
  sinistra, bottone "indice ▴ / nome della sezione" a destra, in Anybody
  largo come chiedeva la UX). La riga resta attaccata ma **si toglie di
  mezzo scorrendo in giù e torna scorrendo in su** (28 px), torna in cima
  alla pagina e quando riceve il fuoco da tastiera. Durante e subito dopo un
  viaggio verso un'ancora resta fuori: `ANCORE.margineStretto` è 24 px, e il
  titolo d'arrivo deve restare libero (verificato: `h2` a 24 px, riga fuori).
  Tutto nel ticker (fasi `read`/`write`), nessun listener di scroll.
- **"Prova la tua" in basso a destra**, lamina 44 px, a portata di pollice.
  Compare quando il bottone dell'hero è uscito dallo schermo (mai due "Prova
  la tua" dell'hero e del richiamo insieme), sparisce nel banco, nel
  colophon (ha il suo "Prova la tua" e così non copre l'ultimo link), con la
  tastiera aperta (`visualViewport`) e con l'indice aperto. Entrata 240 ms
  `sfoglia`, uscita 200 ms `sfoglia via` (variabili del motion, 0 ms con
  reduced motion); da nascosto `visibility: hidden`, `aria-hidden`,
  `tabindex=-1`. Sotto i 360 px sale sopra la riga del bottone del sito.
- 641-1023 px: il bottone del sito torna in alto a sinistra, quindi nella
  riga in alto il marchio parte dopo 244 px.

### 2.3 Indice (ux 2.3, 6.9; motion 7.4)
- `<dialog>` modale (`showModal`: top layer, fuoco intrappolato, resto
  `inert`), nessun velo colorato (`::backdrop` trasparente). Foglio al 78%
  (`78svh`) che sale in 320 ms e scende in 240 ms; su tablet è largo al
  massimo 36rem e allineato al margine interno.
- Contenuto: `h2` "indice" + "chiudi ✕" (44 px); le otto sezioni
  (`SEZIONI[id].indice`, Anybody 24 px, righe ≥ 52 px) con
  `TECNICHE.segnoCorrente` + `INDICE.seiQui` scritto sulla corrente e
  `aria-current="location"`; la carta del sito (radio veri, nome accessibile
  `CARTE[c].radioAria`, campioni 56 × 56 con costa e fibra, scelta = bordo
  d'inchiostro del sito 3 px + parola `BANCO.carta.scelta`), cambio con
  `cambiaCarta(c, label)` e annuncio `ANNUNCI.carta` dopo l'onda; "Luce col
  telefono: sì / no" (`aria-pressed`) se il sensore c'è e non c'è reduced
  motion, con `impostaLuceTelefono` dentro il clic.
- Chiusura: "chiudi", Esc (`cancel` → chiusura animata), tocco fuori dal
  foglio (solo se il dito è sceso sul fondo), trascinamento in giù dalla
  testa (segue il dito nel ticker; chiude oltre il 30% o 0,5 px/ms, altrimenti
  risale con la molla `morbida`), scelta di una voce. Alla chiusura il fuoco
  torna su "indice" (nativo); scegliendo una voce lo prende poi l'`h2`
  d'arrivo. Scroll della pagina bloccato (lenis fermo + `overflow` di
  `<html>`), sbloccato **prima** che parta il viaggio verso l'ancora.
- Annunci `ANNUNCI.indiceAperto/indiceChiuso` nella regione `aria-live` della
  testata.
- Nell'indice non c'è "← Torna in Ciceri Lab" (lo prevedeva la UX): il
  concept non crea un proprio link "torna" (integrazione-sito, fatto 3).

---

## 3. Accessibilità e movimento

- Nessuna informazione solo nel rilievo: *impronta* è `aria-hidden` (ripete
  il marchio, `RILIEVI.heroParola.decorativo`); il testo del cliente ha il
  suo gemello `.imp-sr`. Marchio: link con `aria-label` `TESTATA.marchioAria`,
  segno `aria-hidden`.
- Landmark: `header` (banner), `nav` "Principale" (desktop), `nav` dentro
  l'indice etichettato dal suo `h2`, `main` e un solo `h1`.
- Reduced motion: pressa già completa (lo fa `usePressione`), niente invito
  al tilt, durate di headroom, richiamo e indice a 0 ms (variabili del
  motion), molla dell'indice sostituita da un salto.
- Aree di tocco ≥ 44 px; anello di fuoco di `interaction.css` ovunque (sulle
  carte dell'indice su `:has(:focus-visible)` in inchiostro del sito).
- Nessun accesso a `window`/`document` a livello di modulo: tutto in effetti
  e gestori.
- Radio delle carte: comportamento nativo (le frecce spostano anche la
  scelta, come ogni radiogroup). La UX chiedeva "la carta non cambia al solo
  focus": con un radiogroup nativo freccia = scelta, ed è il pattern che i
  lettori di schermo si aspettano. Se l'accessibility-auditor preferisce la
  selezione manuale va rifatto con `roving tabindex` in tutti e tre i gruppi
  (carta, banco, indice) insieme.

---

## 4. Richieste ad altri agent

- **copywriter**: per la parola "scelta" sotto il campione dell'indice uso
  `BANCO.carta.scelta` (stessa parola del banco). Se serve una chiave propria
  dell'indice: `INDICE.scelta = 'scelta'`. Nessun'altra stringa mancante:
  tutti i testi vengono da `content/testi.ts`. Il "◂" dell'indice è
  `TECNICHE.segnoCorrente` (stesso segno delle Tecniche).
- **ux-architect / accessibility-auditor**: prendere atto della differenza
  del §2.2 (indice in alto, "Prova la tua" in basso a destra, riga in alto
  che si toglie di mezzo scorrendo). Verifica obbligatoria del
  responsive-tester invariata: bottone dell'hero nel primo schermo a 375 × 667
  (ok, fondo a 508 px).
- **section-builder-colophon**: il richiamo in basso si nasconde nel
  colophon, quindi non copre l'ultimo link; niente da fare.
- **shader-engineer**: il marchio della testata **non** è registrato nel
  rilievo: la testata attaccata ha il fondo pieno della carta (sopra il
  canvas), quindi il marchio resta in lamina CSS (`.imp-segno-caldo`, senza
  `.imp-relief`) in tutti gli stati. La parola dell'hero ha `priorita: 10`.
  Con il GL acceso la testata attaccata ha il fondo della carta senza fibra
  CSS (la fibra la disegna lo shader sotto).
- **scaffold-engineer**: nessuna. Nota: `Impronta.tsx` non ha una regione
  `aria-live` globale; hero e testata usano ciascuna la propria (`.imp-sr`,
  `polite`).

---

## 5. Chiusura

Server di sviluppo sulla porta 8101 chiuso a fine lavoro. Nessun commit.

---

# Giro 2

Voti del giro 1: Hero 5, Testata 6 (docs/awwwards-jury.md §2 e §5). Punti
applicati, solo nei miei file (Hero.tsx, hero.css, Testata.tsx, testata.css):

## Hero ricomposto
- **La parola è l'oggetto**: "impron" / "ta" su due righe premute con lo
  stesso corpo. La prima riga riempie l'area viva al pixel (misura del DOM dei
  gemelli invisibili, `100cqi / em`), la seconda chiude sul margine esterno
  (`text-align: right`: box a tutta larghezza, così la pressa non cambia la
  misura del blocco e lo shader legge l'allineamento dal computed style).
  Altezza: 1440×900 circa 360 px (40%); 2560×1440 circa 600 px; 375 due righe
  da circa 85 px (prima una sola da 61). Tetto: 42svh per tutte le righe.
- **Titolo agganciato**: da 1024 px il blocco in inchiostro sta nel vuoto a
  sinistra di "ta" (colonne 1-7). L'ultima riga del titolo sta sulla linea di
  base di "ta", e in ogni caso a 16 px sotto la discendente della "p".
  Il titolo scala a `min(titolo-1, 3,55cqi)` per restare su due righe in sette
  colonne. Sotto i 1024 px il blocco sta sotto "ta", a 24-40 px dalla linea di
  base.
- **Niente vuoti**: l'hero è alto quanto il suo contenuto (via il
  `min-height: 100svh` e il frontespizio del giro 1, che a 768 lasciava 380 px
  vuoti). A 375, 768, 1440 e 2560 la sezione dopo comincia nella prima
  schermata.
- **2560**: l'hero non è più dentro `.imp-page` (1680 px al massimo). Usa
  tutta la finestra con i margini da libro, quindi la parola è grande quanto
  la copertina. Le sezioni dopo restano nella gabbia.
- **Dial della luce**: sotto "ta", chiuso sul margine esterno, alla linea del
  bottone (non più isolato a metà pagina). L'etichetta resta
  `LUCE.etichetta` ("luce").
- **Testo del cliente** dopo l'invio: una o due righe spezzate tra le parole
  (più uguali possibile), sempre sopra al blocco in inchiostro.

## Testata
- **Marchio sull'asse**: da 641 px sta al centro della riga, come una testata
  di giornale (in alto a sinistra c'è il bottone del sito, quindi l'asse del
  margine interno a x 86 non è libero). È alto 26 px da 1200 px; tra 1024 e
  1199 parte dopo il bottone del sito, perché le voci gli arriverebbero sopra.
  La riga è chiusa su margini simmetrici (margine interno da entrambi i lati).
- **Voce corrente vera**: si accende solo in lavori, legatoria e bottega; in
  tecniche, carta, banco, colophon e hero nessuna voce.
- **Un solo "Prova la tua" per schermo**: la testata osserva tutti gli
  `a[href="#banco"]` del contenuto (IntersectionObserver più
  MutationObserver, esclusi i propri `data-imp-richiamo`). Finché uno è in
  vista (hero, pezzi di Per chi, legatoria, colophon), il bottone della
  testata esce (le voci scivolano a destra, solo `transform`) e il richiamo
  mobile in basso non compare. Risolve anche il doppio bottone a 375 e la
  freccia "›" coperta a 768 (responsive-tester).
- **Lamina**: resta solo sul bottone dell'hero (le classi sono
  dell'art-director). "Prova la tua" della testata e dell'angolo in basso sono
  in inchiostro pieno sulla carta.
- **Indice mobile**: il foglio ora scende dalla riga in alto, dove sta il
  bottone (la giuria notava il triangolo in su per un menu che scende). Il
  triangolo punta in giù, "indice" è a 15 px invece di 14, e il foglio si
  richiude tirando in su la linguetta al piede. Da 641 px scende sotto la riga,
  sul lato destro, lontano dal bottone del sito.

## Accessibilità
- **A2 punto 3**: dopo uno spostamento del fuoco fuori dalla testata, per
  400 ms la riga mobile non rientra, così non copre l'elemento appena portato
  in vista.
- **A3**: `.imp-segnapagina` è nascosto con `@media (max-height: 34rem)`.
- **B5**: tolti gli annunci "Indice aperto." / "Indice chiuso.".

## Verifica
- `npm run typecheck` e `npm run lint` verdi.
- Server mio `npx vite --port 8103 --strictPort`, chiuso alla fine. Font veri
  serviti con `page.route`.
- Screenshot in `/tmp/claude-0/shots-hero/giro2/`: hero `hero-{375,768,1440,2560}-{gl,gl0}-{citrino,cotone}.png`,
  più `scroll-{375,768,1440}-{900,2600}.png` e `indice-375.png`. Manca 2560
  con GL: lo scatto ha superato il tempo limite in SwiftShader.

## Richieste
- **copywriter**: la giuria chiede per il dial un'etichetta parlante tipo
  "sposta la luce". Oggi c'è `LUCE.etichetta = 'luce'`; se si vuole, serve una
  nuova chiave (per esempio `LUCE.etichettaLunga`).
- **interaction-designer**: A4 (lampeggio con i radio delle carte, anche
  nell'indice) si corregge in `paperWave.ts`, limitando la frequenza dei
  cambi.
- **per-chi, legatoria, colophon**: il richiamo della testata e quello in
  basso si nascondono da soli quando i loro link al banco sono in vista.
  Nessun obbligo di toglierli per causa mia.

---

# Giro 3

Voti del giro 2: Testata 7, Hero 8,5 (docs/awwwards-jury.md "Giro 2", riga 6
e 9). Tutto nei miei file.

- **"Prova la tua" della testata in lamina.** Stessa classe `.imp-lamina`
  dell'hero e del colophon, alta 44 px. Via il blocco verde pieno: una sola
  azione, un solo aspetto. Anche il richiamo in basso a destra è in lamina,
  con i bordi `--imp-lamina-bordi` più un'ombra corta tinta. Le mie regole
  danno solo misura e tipografia; colore, fondo e bordi sono dell'art-director.
- **Dial "luce" agganciato alla parola.** Pende dal piede di "ta"
  (`margin-top: 0,86 em` della parola + 12 px), chiuso sul margine esterno
  come la parola. Non sta più alla linea del bottone. Con il testo del
  cliente su una riga pende da quella.
- **Una sola regola di allineamento a 2560: la gabbia.** Hero e testata
  stanno nella gabbia da 1680 px come tutte le altre sezioni (`max-inline-size:
  var(--imp-pagina-max)`, centrati, margini da libro). Il sito è una pagina
  di libro: la forma di stampa resta ferma e oltre c'è solo carta (DESIGN.md
  §5). Andare a vivo con tutte le sezioni avrebbe voluto dire cambiare i file
  degli altri sette builder e rompere la misura di lettura dei testi. La
  parola resta comunque l'oggetto: circa 390 px di altezza a 2560.
- **"indice" più grande a 375**: 16 px, peso 600, in inchiostro pieno (prima
  13-15 px, velato).
- **Spazio per i fissi in basso a 375**: sotto i 1024 px `.imp-contenuto`
  finisce con un `::after` alto quanto i comandi fissi (`--imp-segnapagina-h`
  più l'area sicura, minimo 14 px). L'ultima riga del colophon ("← Torna in
  Ciceri Lab") resta sopra "Torna in Ciceri Lab" del sito e sopra "Prova la
  tua". Per le altre sezioni il testo passa sotto i fissi solo mentre scorre.

Verifica: `npm run typecheck` e `npm run lint` verdi. Server mio sulla 8103,
chiuso alla fine; font veri serviti con `page.route`.

Screenshot in `/tmp/claude-0/shots-hero/giro3/`:
- `hero-{375,1440,2560}-gl0-{citrino,cotone}.png`
- `scroll-{375,1440,2560}-{900,2600}.png` (testata attaccata con la lamina)
- `fondo-375.png` (fine pagina con i fissi)

Nota: durante gli scatti l'art-director stava riscrivendo
`relief-fallback.css` e `tokens.css`. Un primo giro era caduto a metà di un
aggiornamento (parola senza rilievo); rifatto a file stabili.
