# Interaction designer · Concept 13 · CONTROPELO

Ondata 2. Rotta `/concept-13`. Seguiti `design-taste-frontend` (4.5, 5.D, 6.B,
9.A: nessun cursore custom) e `full-output-enforcement`: codice completo,
niente segnaposto.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`,
riga 13 della matrice, `creative-director.md` (tutto, in particolare §6, §7.4,
§11, §12), `trend-researcher.md` (P2, P3, P10, divieti 8 e 10, rischi 4.1 e
4.6), `brand-strategist.md`, `ux-architect.md` (§2.1, §2.5, §2.6, §4, §8),
`tech-architect.md` (§3, §4, §5, §6, §7), il pilota solo per formato
(`concepts/10-torchio/docs/interaction-designer.md`) e i file già scritti in
parallelo: `styles/tokens.css` (art-director), `assets/svg/tratti.ts` e
`Icona.tsx` (vector-artist), `docs/vector-artist.md`.

## 0. File consegnati

Tutti in `src/pages/concepts/contropelo/interaction/` (file esclusivi,
tech-architect §4). Ai quattro previsti se ne aggiungono tre piccoli di
supporto e un hook che unisce i due collegamenti del vetro.

| File | Cosa fa |
|---|---|
| `pulire.ts` | L'interazione firma: dal puntatore ai tratti per `vapore.pulisci`. Pennello 34/60 px mouse, 30-44 px dito, interpolazione, velocità, regola tocco/trascinamento, ovale attorno all'elemento toccato, niente selezione né drag nativo. `collegaPulitura(el, indice)`, `vetroPulibile(stato, indice)`, `PENNELLO`. |
| `fuocoPulisce.ts` | Il fuoco pulisce: `focusin` sul vetro → `vapore.proteggi` in ovale (300 ms) finché il fuoco resta lì; rilascio anche se l'elemento sparisce dal DOM. `collegaFuocoPulisce(el, indice)`, `zonaDelFuoco(el)`, `ZONA_FUOCO`. |
| `useVetro.ts` | `useVetro(ref, indice)`: monta i due collegamenti sul contenitore del vetro. È l'unica cosa che il builder della parete deve chiamare. |
| `useFrecceTablist.ts` | I tre barbieri: `role="tablist"`, ←/→ Home/Fine con attivazione automatica, tabindex mobile, nessun giro in tondo. `useFrecceTablist()`, `idTab(i)`, `idPannello(i)`. |
| `useSwipeMensola.ts` | Trascinamento orizzontale **sulla mensola** (dito e penna) → specchio vicino. Soglie 48 px o 0,35 px/ms con almeno 16 px; direzione come una pila di fogli. `useSwipeMensola(ref)`, `SWIPE`. |
| `useRigheLibere.ts` | La lista da tastiera: ↑/↓ e Home/Fine tra i posti liberi della fascia mostrata, si fermano ai bordi; Esc chiude la riga di scrittura. `useRigheLibere(ref, { scritturaAperta, onChiudi })`, `postiLiberi(el)`. |
| `cadenza.ts` | Limite anti-lampeggio: `creaCadenza(500)` (esegue subito o tiene solo l'ultima richiesta) e `chiediSpecchio(i, origine)`, l'unica porta per cambiare specchio da un comando dell'utente. `specchioDestinazione()`, `fermaCadenze()`, `indiceValido(n)`. |
| `annullaClic.ts` | Un trascinamento oltre 8 px non attiva mai l'elemento su cui è partito: `creaAnnullaClic(el)` ferma il clic gemello in fase di cattura (mai i clic da tastiera o da tecnologia assistiva, `detail === 0`). `SOGLIA_TRASCINAMENTO_PX`. |
| `fuoco.ts` | `mettiFuoco(el)`: fuoco programmatico con `preventScroll` in layout "fisso" (altrimenti `focus()` farebbe scorrere la pista della parete fuori dallo store); in vetrina lunga scorre. `SELETTORE_INTERATTIVO`, `SELETTORE_CAMPO`, `visibile(el)`. |
| `interaction.css` | Stati: fuoco turchese 2 px + 2 px, hover solo con mouse, premuto, `aria-pressed/-selected/-invalid/-readonly`, `touch-action` del vetro e della mensola, radio resi come parole, campi, `forced-colors`. Nessun hex, nessuna transizione. |

Verifica (§8): `tsc` strict (`noUncheckedIndexedAccess`, `noUnusedLocals`) ed
`eslint` (react-hooks) verdi in un progetto di prova con gli stub esatti di
`state/store.ts`, `state/runtime.ts` e `vapore/index.ts` (§7); 36 prove
Playwright in Chromium (mouse, tastiera, dito via CDP) tutte passate; fuoco
guardato a schermo.

---

## 1. Cursore custom, preloader, lente: cosa li sostituisce

Vietati dal creative-director (§6.1, §12: "niente cursore custom, niente
cerchio che segue il mouse, niente lente", §6.3: "nessun preloader") e dal
trend-researcher (divieti 8 e 10). Li rispetto:

- **Il cursore è quello di sistema**, e dice cosa si può fare: freccia sul
  vetro (`cursor: default`, il pennarello non è testo da selezionare), mano
  sui comandi, barra nei campi. La risposta al puntatore non è un oggetto che
  lo segue ma **il vetro che si pulisce dove passa**: non copre niente, non
  ritarda niente, non si perde ai bordi. Su Rain on Glass la mano guantata
  disegnata copre proprio la zona che si sta scoprendo (trend 3.8).
- **Nessun preloader**: lo specchio è già pulito a 0 ms, il listino è
  leggibile prima di ogni effetto. L'apertura (vapore che sale, passata
  automatica) è del motion-designer via API del vapore; qui non c'è nulla che
  aspetti.
- **Niente magnetismo, niente testo che si sposta**: sul vetro gli stati sono
  segni a pennarello (sottolineatura, cerchio, ovale, tratto più calcato);
  sulla parete i comandi scendono di 1 px quando premuti, e basta.

---

## 2. Interazione firma: "Pulire lo specchio" (`pulire.ts`)

### 2.1 Che cosa fa e che cosa non fa

Il file **non disegna**: trasforma gli eventi del puntatore in punti
(`PuntoTratto { x, y, r, t }`, px CSS relativi al vetro) e li consegna a
`vapore.pulisci(indice, punti)` (tech-architect §7.2: "nessun disegno
nell'handler"). Maschera, pennello a gradiente con nocciolo pieno al 70%
(trend P2), ritorno e gocce sono del motore. Un `pointermove` costa
un'interpolazione e un `push`: nessun layout letto nei frame normali (il
rettangolo del vetro si rilegge al massimo ogni 150 ms, su resize e su
`ResizeObserver`), quindi INP ≤ 150 ms.

### 2.2 Il gesto

| Chi | Come | Raggio |
|---|---|---|
| Mouse al passaggio | pulisce senza premere (`pointermove` con `buttons === 0`) | 34 px |
| Mouse premuto | il palmo; la traccia continua da dove era il passaggio | 60 px |
| Dito | trascinare; il tocco che si appoggia pulisce subito un tondo | 30 px |
| Dito largo | `PointerEvent.width` da 24 a 40 px → raggio da 30 a 44 px | fino a 44 px |
| Penna | come il dito, ma in hover non pulisce (solo a contatto) | 30 px |
| Velocità | media esponenziale (peso 0,25); a 2,4 px/ms il raggio cresce del 18%, mai di più, senza tremolio | ×1,00–1,18 |

- **Traccia continua**: `getCoalescedEvents()` quando c'è, poi interpolazione
  lineare tra l'ultimo punto e il nuovo a passi di 0,3 × raggio (minimo 3
  px, massimo 80 punti per segmento). A velocità alta niente "puntini"
  (verificato: passo massimo 11,2 px con raggio 34-40).
- **Dentro/fuori**: un punto fuori dal vetro (dito catturato che esce)
  interrompe la traccia; il mouse che rientra riparte dal punto d'ingresso.
  Se il vetro si è spostato di oltre 1 px tra due letture (pan della parete)
  le tracce in corso ripartono da capo: mai una linea che attraversa lo
  specchio.
- **Campi**: un `pointerdown` dentro `input`/`textarea` non apre un tratto,
  il puntatore scrive.
- **Quando è attivo** (`vetroPulibile`): `pronto`, `canvas === 'on'`,
  `!pulito`, `layout === 'fisso'`, `specchio === indice`, `!info`,
  `!runtime.viewport.tastiera`. Altrimenti gli handler non consegnano nulla
  (verificato: con "Specchio pulito" 0 punti). Tutti e tre gli specchi
  montano il collegamento; solo l'attivo lavora.

### 2.3 Tocco o trascinamento (ux-architect §8.3)

- Un tocco fermo (< 8 px) su un elemento interattivo lo attiva normalmente
  **e** pulisce un ovale attorno (`pulisciAttorno`: raggio = metà altezza +
  14 px, lungo la riga). Così un trattino toccato sotto il vapore si vede.
- Un trascinamento oltre 8 px partito da un elemento interattivo **non lo
  attiva mai**: `annullaClic.arma()` al rilascio ferma il clic gemello del
  browser in fase di cattura (verificato con mouse e con dito: drag partito
  dal trattino e tornato sopra → 0 clic; tocco fermo → 1 clic).
- Il clic viene ignorato solo se `e.detail !== 0`: i clic da tastiera, da
  lettore di schermo e da controllo vocale passano sempre.
- Un tocco vero **dopo** un trascinamento funziona (l'armatura si disarma al
  `pointerdown` e scade dopo 600 ms). Nota per il QA: Chromium stesso non
  emette il clic se il tocco arriva meno di ~300 ms dopo la fine di un
  drag; non è del concept.

### 2.4 Niente selezione, niente drag, niente menu

Durante un gesto premuto sul vetro attivo: `selectstart` e `dragstart`
bloccati (il pennarello non si colora di blu, i link e le foto non partono
in drag-and-drop), `contextmenu` bloccato solo per la pressione lunga del
dito (col mouse il tasto destro resta). I campi della riga di scrittura e
l'`<address>` restano selezionabili (`interaction.css`). Verificato: palmo
sopra "taglio 22" → selezione vuota.

### 2.5 `touch-action` (creative-director §6.1, trend 4.6)

`touch-action: none` **solo** sul vetro, e solo quando serve:
`.ctp-root[data-layout='fisso'][data-canvas='on'][data-vapore='vivo'] .ctp-ix-vetro`.
Con "Specchio pulito", senza canvas o in vetrina lunga il vetro torna una
superficie normale (zoom e scorrimento del browser). Mensola e fascia:
`pan-y pinch-zoom`. Mai su `body` come fa Rain on Glass.

---

## 3. Il fuoco pulisce (`fuocoPulisce.ts`)

Creative-director §6.4: nessun contenuto è raggiungibile solo pulendo.

- `focusin` su un elemento del vetro → `vapore.proteggi(indice, zona, {
  forma: 'ovale', margine: 16, dissolvenza: 300 })`; la zona resta pulita
  finché il fuoco è lì.
- **Zona** = l'elemento visibile del controllo: un antenato marcato
  `data-ctp-zona-fuoco` (per esempio la riga di scrittura intera), altrimenti
  la `label` di un radio/checkbox (i radio del servizio sono trasparenti sopra
  la parola), altrimenti l'elemento stesso.
- Fuoco spostato dentro il vetro → una sola zona alla volta (la vecchia si
  rilascia). Fuoco uscito dal vetro (mensola, bottone Lab) → rilascio.
- Se l'elemento col fuoco viene rimosso dal DOM (il trattino che diventa la
  riga di scrittura, la lista che si riscrive con lo straccio) i browser non
  mandano sempre `focusout`: un `MutationObserver` sul vetro rilascia la
  zona quando `zona.isConnected` è falso (verificato).
- Montaggio con il fuoco già dentro (ritorno da un altro specchio): la zona
  parte subito.

Il pannello Informazioni, la lista mentre si scrive e il tuo nome usano
`useZonaPulita` del vapore (tech-architect §7.2), non questo file.

---

## 4. Girare la testa: tablist, bordo, swipe, link

Tutti i comandi passano da **`chiediSpecchio(i, origine)`** (`cadenza.ts`),
mai da `vaiASpecchio` diretto. È la sola porta, così il limite anti-lampeggio
vale per tab, frecce, bordo del vicino, swipe e link "pieni".

### 4.1 Tastiera (`useFrecceTablist.ts`)

- Pattern tabs con attivazione automatica: ←/→ spostano il fuoco sul nome
  accanto **subito** (`mettiFuoco`) e chiedono la parete; Home/Fine al
  primo/ultimo. `aria-selected`, `aria-controls="ctp-specchio-i"`,
  `id="ctp-tab-i"`, tabindex mobile (solo l'attivo è nel giro del Tab).
- **Nessun giro in tondo** (creative-director §3 A, ux §2.1): da Mattia ← non
  fa nulla, da Samir → non fa nulla (verificato).
- Il fuoco resta sulla tab durante il pan; nessun contenuto del pannello
  nuovo prende il fuoco da solo (ux §8.5).
- In una raffica di frecce il fuoco arriva subito sull'ultimo nome, la
  parete lo raggiunge alla cadenza (verificato: due → in 20 ms → cambio a 1
  subito, cambio a 2 dopo 500 ms; `aria-selected` e tabindex coerenti).

### 4.2 Dito sulla mensola (`useSwipeMensola.ts`)

- Solo `touch`/`pen`, solo layout "fisso", solo il puntatore primario.
- Il gesto si decide dopo 8 px: se è più verticale che orizzontale viene
  lasciato al browser. Riuscito se |dx| ≥ 48 px, oppure |dx| ≥ 16 px con
  velocità finale ≥ 0,35 px/ms (misurata sugli ultimi 80 ms).
- Direzione come una pila di fogli: verso sinistra → specchio di destra.
  Ai bordi nulla. Durante una raffica il "prossimo" si calcola dalla
  destinazione in attesa (`specchioDestinazione()`), così due swipe veloci
  da Mattia arrivano a Samir.
- **Nessun movimento che segue il dito**: la parete si sposta a gesto
  concluso con il pan del motion-designer (650 ms). MOTION_INTENSITY 4: il
  vapore è già il movimento "fisico" del sito; una parete trascinabile
  sarebbe un secondo gesto firma e litigherebbe con il pulire.
- Uno swipe partito da un nome o dal bottone **non li preme** (annullaClic,
  verificato: swipe partito da "Samir" → un solo cambio, origine `swipe`).

### 4.3 Bordo dello specchio vicino (per section-builder-parete)

Un `<button tabindex="-1" aria-hidden="true" class="ctp-ix-bordo">` per
lato, `onClick={() => chiediSpecchio(i ± 1, 'bordo')}`. Hover: il bisello si
accende di un filo (`outline` 1 px `--ctp-inchiostro-velo`). Su S è solo
un'area di tocco di 24 px (ux §8.5). Non ha bisogno di annullaClic: sopra
il bordo non c'è vetro da pulire.

### 4.4 Link "Oggi siamo pieni" (per section-builder-lista e mensola)

`chiediSpecchio(i, 'link')`, poi `mostraFaccia('lista')`, giorno, fascia e
`richiestaFuoco` sul trattino: la riga di scrittura non si apre da sola
(ux §5.7).

---

## 5. La lista da tastiera (`useRigheLibere.ts`)

- Marcatura: ogni posto libero `<button data-ctp-libero class="ctp-ix-libero">`;
  contenitore della riga di scrittura `data-ctp-scrittura`.
- ↑/↓: al posto libero precedente/successivo **della fascia mostrata**
  (`postiLiberi`: visibili, non `hidden`/`inert`, non `aria-disabled`); ai
  bordi si fermano (ux §8.7: per cambiare fascia ci sono i bottoni fascia).
  Home/Fine al primo/ultimo. `preventDefault` sulle frecce: nemmeno in
  vetrina lunga fanno scorrere la pagina.
- Invio/Spazio: è il clic nativo del `<button>`, apre la riga (azione della
  lista).
- Esc con `scritturaAperta`: `onChiudi()` (di solito `chiudiScrittura` dello
  store, che emette `richiestaFuoco: 'trattino'`). Con la riga chiusa Esc
  non fa nulla e non viene fermato (il pannello Informazioni lo gestisce da
  sé). Verificato: ↓, bordo, Home, Esc una volta sola.
- Il fuoco che si sposta sui liberi usa `mettiFuoco` (§6): niente
  scorrimento della pista.

---

## 6. Fuoco senza far scorrere la parete (`fuoco.ts`)

In layout "fisso" la pista dei tre specchi è traslata dentro un contenitore
che taglia. `el.focus()` nudo fa scorrere qualunque antenato con overflow per
mostrare l'elemento: la pista si sposterebbe **senza passare dallo store**,
e lo specchio in vista non sarebbe più quello attivo (bug classico dei
caroselli). `mettiFuoco(el)` usa `preventScroll: true` quando
`store.get().layout === 'fisso'`, e lascia scorrere in vetrina lunga.
Richiesta a tutte le sezioni che spostano il fuoco (tablist, "Scrivi il tuo
nome", riga di scrittura, cambio faccia, Informazioni, `richiestaFuoco`):
usare `mettiFuoco`, mai `focus()` diretto. Il builder della parete metta
comunque `overflow: clip` (non `hidden`) sul contenitore della pista: `clip`
non è un contenitore di scorrimento e non può spostarsi.

---

## 7. Limite anti-lampeggio (`cadenza.ts`)

Regola del Lab: qualsiasi cambio di colore di grandi superfici al massimo
**1 ogni 500 ms**. Superfici grandi che cambiano per un comando:

| Cambio | Chi lo limita |
|---|---|
| Pan della parete / dissolvenza 200 ms (cambio specchio) | `chiediSpecchio` → `creaCadenza(500)`: il primo subito, poi solo l'ultima richiesta, a 500 ms dal cambio precedente |
| "Specchio pulito" (il vapore sparisce/torna su tutto il vetro) | la mensola avvolge `impostaPulito` in `creaCadenza(500)` (richiesta §9) |
| Straccio della lista (giorno, fascia) e cambio faccia | motion-designer, `useStraccio` (ux §8.12: coda di 500 ms); può usare `creaCadenza` |

Verificato: 16 clic sui tab a 60 ms → 2 cambi, massimo 2 in qualsiasi
finestra di 1 s, intervallo minimo 500 ms, e alla fine è attivo l'ultimo
specchio chiesto. Il vapore per sé è monotono (scende solo sotto la mano,
sale piano): nessun cambio ripetuto. Gli stati di hover/premuto in
`interaction.css` sono su parole e bottoni, non su superfici grandi, e non
hanno transizioni.

---

## 8. Micro-interazioni e stati (`interaction.css`)

Principio: sul vetro ogni stato è un segno a pennarello, sulla parete è
tipografico e a spigolo vivo. Nessuna transizione (il pennarello non sfuma),
nessuna ombra, nessun glow, nessun colore nuovo. Il turchese resta "qui c'è
posto / qui tocca a te": fuoco, fascia scelta, cursore del campo.

| Classe (la sezione la aggiunge alla sua) | Stati |
|---|---|
| `ctp-ix-vetro` (contenitore del vetro) | `cursor: default`; `touch-action: none` e niente selezione solo quando il vapore è vivo; campi e indirizzo selezionabili |
| `ctp-ix-mensola` | `touch-action: pan-y pinch-zoom` |
| `ctp-ix-tab` (barbieri) | hover sul non attivo: filo sotto il nome in `--ctp-inchiostro-velo` (annuncia il tratto turchese dell'attivo, che è della mensola); attivo `cursor: default`; premuto scende 1 px |
| `ctp-ix-bordo` | hover: bisello acceso (outline 1 px interno) |
| `ctp-ix-parola` (parole sul vetro: "la lista", "← il listino", "domani →", fasce, "Apri in Maps", "Chiama", "cancella", "lascia stare", "Riprova", "Rimettilo", link del "pieno") | 44 px minimi; hover: sottolineatura 2 px; premuto: 3 px; `aria-pressed="true"` (fascia scelta): sottolineatura turchese 3 px fissa; fuoco: anello ovale (`border-radius` irregolare, l'unico raggio del concept, CD §4.3) |
| `ctp-ix-libero` (trattino) | `position: relative` per il cerchio; hover: trattino ×1,4 in altezza (ripassato); premuto ×1,7; fuoco: il **cerchio a pennarello** del vector-artist (`<Tratto tipo="cerchio">` reso sempre, `opacity` 0 → 1 con `:focus-visible`), anello standard tolto con `:has()`; senza `:has()` restano entrambi |
| `ctp-ix-scelta` + `__input` + `__parola` (radio del servizio) | l'input copre la parola (tocco, clic, lettori di schermo); scelta: la parola è cerchiata a pennarello (bordo 2 px `--ctp-pennarello`, sempre riservato: scegliere non sposta nulla); fuoco: anello turchese sulla parola; hover sul non scelto: sottolineatura |
| `ctp-ix-campo` (nome, telefono) | `caret-color` turchese; selezione turchese al 38%; `aria-invalid`: linea di base 3 px tratteggiata (mai solo colore, con l'icona e il testo della lista); `readonly`/`aria-readonly` durante l'invio: niente barra |
| `ctp-ix-bottone` ("Scrivi il tuo nome", "Segna") | 48 px; hover: fondo `--ctp-turchese-vetro` (più chiaro: testo `--ctp-su-turchese` a 8,06:1 invece di 5,21:1); premuto: 1 px giù; `aria-disabled`: `cursor: default` |
| `ctp-ix-testo` ("Informazioni", "Specchio pulito", "chiudi", "Sì, ricomincia", "No") | 44 px; hover: sottolineatura 1 px; premuto: 1 px giù |
| `ctp-ix-tocco` | solo area minima 44 × 44 |

- **Fuoco**: `.ctp-root :focus-visible` = `--ctp-fuoco-spessore` (2 px)
  `--ctp-fuoco-colore` (turchese del vetro `#4BC3BC`: 6,83:1 sullo specchio, 8,06:1 sulla parete),
  stacco `--ctp-fuoco-stacco` (2 px); titoli con `tabindex="-1"`: stacco 6
  px; parole sul vetro: stacco 4 px. Guardato a schermo: anello turchese
  ovale attorno al trattino, netto sul grafite.
- **Hover** solo con `(hover: hover) and (pointer: fine)`: sul telefono
  nessuno stato appiccicato dopo il tocco. `-webkit-tap-highlight-color:
  transparent` solo dove c'è un `:active` che lo sostituisce.
- **Premuto** (1 px giù) solo con `data-motion="full"`.
- **`forced-colors`**: anello `Highlight`, cerchio nascosto e anello di
  sistema al suo posto, scelta con `CanvasText`, bottoni e tab con bordo
  `ButtonText`, `caret-color: CanvasText`.

---

## 9. Alternativa da tastiera per ogni gesto (riassunto per l'auditor)

| Gesto | Tastiera | Lettore di schermo |
|---|---|---|
| Pulire il vetro | non serve: il fuoco pulisce attorno a ogni elemento (§3); "Specchio pulito" toglie tutto | il vapore non esiste (canvas `aria-hidden`) |
| Cambiare specchio | ←/→ Home/Fine sulla tablist | "Mattia, scheda selezionata, 1 di 3" |
| Swipe sulla mensola | idem (è un'alternativa, mai l'unico modo) | idem |
| Toccare il bordo del vicino | idem; il bordo è fuori dal Tab | `aria-hidden` |
| Aprire un posto libero | Tab/↑/↓ sui liberi, Invio | "Ore 9:30, libero, scrivi il tuo nome, pulsante" |
| Chiudere la riga | Esc o "lascia stare" | fuoco di ritorno sul trattino |
| Scegliere il servizio | radio veri: frecce dentro il gruppo, Spazio | "Cosa ti facciamo?, gruppo, taglio, 22 euro, 1 di 4" |
| Cambiare fascia/giorno/faccia | bottoni veri (`ctp-ix-parola`) | testo completo |

Reduced motion: nessun mio file anima; `:active` fermo; il resto è del
motion-designer.

---

## 10. Verifica fatta

Progetto di prova nello scratchpad (`node_modules` del pilota, stessi
`tsconfig.app.json` ed `eslint.config.js`, `interaction/` collegata con un
link simbolico, stub di `state/store.ts`, `state/runtime.ts`,
`vapore/index.ts` con le firme di §11):
- `tsc -p tsconfig.app.json --noEmit` verde; `eslint src` verde.
- Banco Playwright (React 18 vero, Chromium di `/opt/pw-browsers`, 1440 × 700,
  tre "specchi" da 600 × 400 su una pista traslata, tablist, lista con
  trattini, campo): **36 prove, 36 passate, 0 errori in console**. Tra le
  altre: hover 42 punti interpolati, passo massimo 11,2 px, raggio 34 → 40,1
  con la velocità, coordinate relative al vetro esatte; palmo 60+; clic
  fermo sì / trascinamento no (mouse e dito via CDP `Input.dispatchTouchEvent`);
  nessuna selezione col palmo; "Specchio pulito" → 0 punti; cursori
  `default|text|pointer`; fuoco → una zona, spostata → una sola, elemento
  rimosso → zona liberata; ↓ / bordo / Home / Esc; frecce sui tab con fuoco
  immediato e parete a 500 ms; niente giro in tondo; raffica di 16 clic →
  ≤ 2 cambi al secondo, ultimo chiesto vince; `touch-action` vetro `none`,
  mensola `pan-y pinch-zoom`; tocco fermo attiva e pulisce attorno; swipe
  sinistra/destra/corto/verticale/dal tab.
- Screenshot del fuoco da tastiera guardati (anello turchese 2 px + 2 px sul
  trattino e sulla tab).

Non provato (serve il concept montato): la riga di scrittura con la tastiera
virtuale, Firefox e WebKit (cross-browser-tester), VoiceOver/TalkBack.

---

## 11. Contratti che i miei file importano (per lo scaffold)

Coerenti con tech-architect §6 e §7; nessuna aggiunta ai tipi. Uso:

- `state/store.ts`: `store.get()`, `useContropelo(selector)`,
  `vaiASpecchio(i, origine)` con `origine: 'tab' | 'bordo' | 'swipe' |
  'tastiera' | 'link'`, tipi `IndiceSpecchio`, `ContropeloState` (campi
  `pronto, canvas, pulito, layout, specchio, info`). `store.get()` e
  `vaiASpecchio` sincroni.
- `state/runtime.ts`: `runtime.viewport.tastiera: boolean`.
- `vapore/index.ts`: `vapore.pulisci(i, punti)`, `vapore.proteggi(i, el,
  opz)` che restituisce la funzione di rilascio; tipi `PuntoTratto`,
  `OpzioniZona`.
- Nessun import di `ticker`, `analytics`, `content`, `motion`: i miei file non
  animano, non tracciano, non scrivono testo.

### Richieste allo scaffold

- `Contropelo.tsx`: `import './interaction/interaction.css'` **dopo**
  `tokens.css`, `base.css`, `layout.css`, `materia.css` e prima dei CSS di
  sezione; allo smontaggio chiamare `fermaCadenze()` da
  `interaction/cadenza.ts` (nessun cambio di specchio rimandato deve partire
  a concept smontato).
- Gli attributi `data-layout`, `data-canvas`, `data-vapore`, `data-motion`
  su `.ctp-root` come da tech-architect §5.1 (li uso nei selettori).
- `richiestaFuoco` servita dalle sezioni con `mettiFuoco` (§6).
- Il contenitore della pista con `overflow: clip`.

---

## 12. Richieste ad altri agent

- **section-builder-parete**: `useVetro(vetroRef, indice)` sul contenitore
  del vetro (lo stesso elemento passato a `vapore.registra`), classe
  `ctp-ix-vetro`; bordi dei vicini come in §4.3 con `ctp-ix-bordo`;
  `overflow: clip` sulla pista; `will-change: transform` solo durante il pan.
- **section-builder-mensola**: `useFrecceTablist()` (props su tablist e
  tab, classe `ctp-ix-tab`), `useSwipeMensola(ref)` sul `<nav>` con classe
  `ctp-ix-mensola`; "Scrivi il tuo nome" `ctp-ix-bottone`; "Specchio pulito"
  e "Informazioni" `ctp-ix-testo`; l'interruttore avvolto in
  `creaCadenza(500)` (§7). Il bordo/link "pieno" con `chiediSpecchio(i,
  'link')`.
- **section-builder-lista**: `useRigheLibere(listaRef, { scritturaAperta,
  onChiudi: chiudiScrittura })`; trattini `<button data-ctp-libero
  class="ctp-ix-libero">` con dentro `<Tratto tipo="cerchio">` del
  vector-artist; radio del servizio con `ctp-ix-scelta` / `__input` /
  `__parola`; campi `ctp-ix-campo` con `aria-invalid` e `readonly` durante
  l'invio (non `disabled`: il fuoco non si perde); parole toccabili
  `ctp-ix-parola` (fasce con `aria-pressed`); la riga di scrittura marcata
  `data-ctp-scrittura` e `data-ctp-zona-fuoco`; fuoco sempre con
  `mettiFuoco`.
- **section-builder-vetro / informazioni**: "la lista →", "← il listino",
  "Apri in Maps", "Chiama" con `ctp-ix-parola`; "chiudi", "Sì, ricomincia",
  "No" con `ctp-ix-testo`; il pannello Informazioni gestisce Esc da sé
  (`useRigheLibere` ferma Esc solo con la riga di scrittura aperta).
- **section-builder-vapore**: in `pulisci` il nocciolo pieno al 70% del
  raggio (trend P2) e la coda di punti consumata in fase `update` del
  ticker; `proteggi` con `forma: 'ovale'` deve seguire l'elemento se il suo
  rettangolo cambia (riga di scrittura che si alza con la tastiera).
- **motion-designer**: per lo straccio e il cambio faccia può usare
  `creaCadenza(500)` di `interaction/cadenza.ts` (stessa regola, stesso
  codice); il pan parte da `vaiASpecchio` (già a cadenza), non serve altro.
- **art-director**: usati `--ctp-fuoco-colore/-spessore/-stacco`,
  `--ctp-turchese-vetro`, `--ctp-pennarello`, `--ctp-inchiostro-velo`,
  `--ctp-tratto-attivo`, `--ctp-tratto-campo-errore`, `--ctp-tocco-min`,
  `--ctp-riga-lista-h`, `--ctp-bottone-h`, `--ctp-raggio`. Il fuoco su una
  parola scelta e su un trattino usa un `border-radius` irregolare (ovale
  a mano): è l'unica eccezione al raggio 0, prevista dal CD §4.3.
- **accessibility-auditor**: provare la regola tocco/trascinamento su
  iOS Safari (il clic gemello dopo `pointercancel`), VoiceOver sui radio
  resi come parole, e che l'anello turchese resti visibile sul punto più
  chiaro di ogni foto a vapore zero.
