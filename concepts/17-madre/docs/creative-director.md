# Creative director · Concept 17 · Panificio e pasticceria (Pordenone)

Ondata 0. Rotta `/concept-17`. Documento di direzione per tutti gli agent delle
ondate successive: quello che è scritto da "3. La scelta" in giù è vincolante.

Materiale letto: `CLAUDE.md`, `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 17, paragrafo
"17 · MADRE", verifica incrociata, regole comuni),
`.claude/skills/design-taste-frontend/SKILL.md` (sezioni 0, 1, 4, 9),
`concepts/10-torchio/docs/creative-director.md` (solo come livello e formato),
screenshot `docs/concept-attuali/concept-6.jpg`, `-9.jpg`, `-17.jpg`.

La direzione arriva già assegnata dalla matrice. Qui la sviluppo, la metto alla
prova con tre esecuzioni diverse e ne scelgo una. Palette, font, struttura,
interazione firma e prenotazione restano quelle della matrice, raffinate.

---

## 0. Cosa ho visto (base delle scelte)

**Il vecchio 17 INFORNATA (bocciato)**: crema calda, titolo serif marrone con
"c'è" in crosta, split testo a sinistra e foto di pane in cornice a destra con
"TAV. I", riga di orari tra due filetti, due bottoni marroni (pieno e contorno),
menu "Il forno a orari · La notte". Tutto il concept girava attorno al *tempo*:
cosa esce a che ora, cosa c'è adesso, prenota per domani.

**6 MERIGGIO**: crema, rosa e salvia pastello, serif morbido con corsivo
colorato, cono illustrato, badge ruotati, coriandoli. Il "dolce e affettuoso" è
già preso in chiave illustrata e pastello.

**9 LUME**: bianco con azzurro vivo `#5B9BD5` come accento, chip, foto in
cornice arrotondata. L'azzurro "pulito e clinico" è già preso.

**BRACE & LIEVITO**: il brief lo cita tra i concept del sito, ma non esiste né
negli screenshot di `docs/concept-attuali/` (1-9 sono MERIDIANA … LUME) né in
nessun file del repo. Lo tratto come un concept di pizzeria o forno a legna che
già occupa il territorio "fuoco + impasto". Regola prudenziale per 17: niente
fuoco, braci, fondo scuro con bagliore arancio, forno a legna, impasto tirato a
mano, e niente parola "lievito" nel titolo della prima schermata. **Da
verificare** da chi avrà accesso a `cicerilab/cicerilab`.

**Conseguenza**: MADRE non parla di orari, non è crema e marrone, non è pastello
né illustrato, non ha l'azzurro vivo. Parla di *un gesto* (la prova del dito) e
di *un'abitudine* (il pane di tutte le settimane).

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina commerciale di un panificio e
pasticceria di quartiere a Pordenone per chi compra pane ogni giorno e paste la
domenica, con un linguaggio tattile e fotografico, morbido ma asciutto,
leaning toward una superficie d'impasto in WebGL in apertura + una fila
orizzontale di foto macro vere lungo un bancone + grottesco espressivo
(Bricolage Grotesque) e CSS nativo.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **8** | Struttura nata dall'oggetto (il bancone che si percorre di lato), non da sezioni in colonna. Non 9-10: il cliente vero è la signora che vuole la segale il martedì, deve capire tutto al primo sguardo. |
| `MOTION_INTENSITY` | **5** | Il movimento vero è uno solo: l'impasto che si preme e torna su. Il resto è spostamento guidato dall'utente (scroll che diventa cammino lungo il bancone). Nessuna coreografia automatica. |
| `VISUAL_DENSITY` | **4** | Una vetrina piena ma ordinata: un prodotto per volta a grandezza "macro", nome e prezzo accanto. Mai griglia di schede. |

---

## 2. La metafora sviluppata: "madre"

La **madre** è il lievito madre: una pasta viva che il panettiere tiene da anni,
**rinfresca ogni giorno** (farina e acqua, sempre alla stessa ora) e da cui nasce
tutto il pane della bottega. Per capire se un impasto è pronto il panettiere fa
**la prova del dito**: preme, e guarda la fossetta.

- torna su di scatto: è indietro, deve ancora lievitare;
- torna su **piano piano** e resta un segno leggero: è pronto;
- resta giù: è andato oltre.

Da qui tre idee che reggono tutto il sito:

1. **Il pane è una cosa viva e morbida**: la prima schermata non è una foto né
   un titolo, è un impasto vero da premere. Il sito si presenta con un gesto
   che fa il panettiere, non con uno slogan.
2. **La madre si rinfresca ogni giorno, il cliente torna ogni settimana**. La
   ripetizione è il cuore del mestiere e anche del cliente abituale. Da qui la
   prenotazione: non "prenota per domani" (INFORNATA), ma **il pane fisso**, un
   ordine che si ripete da solo, come il rinfresco.
3. **La carta da zucchero** è la carta azzurra, grigia e polverosa, in cui le
   pasticcerie del Friuli incartano il vassoio della domenica. È il colore del
   rito della domenica. Nel sito è la superficie dei dolci e il vassoio: dove
   c'è la carta azzurra, è festa.

Il "bancone" è la struttura: in bottega si cammina di lato davanti alla
vetrina, dai pani ai dolci alle paste. Il sito si percorre allo stesso modo, in
orizzontale, all'altezza degli occhi.

Nome: **MADRE**, *panificio e pasticceria*, Pordenone (indirizzo di esempio
verosimile scelto dal copywriter, mai dati legali). Rotta invariata.

---

## 3. Tre varianti di esecuzione (stessa direzione) e la scelta

Tutte e tre tengono impasto WebGL in apertura, vetrina orizzontale, pane fisso,
palette e font della matrice. Cambia come si costruisce il bancone.

### Variante A · IL BANCONE (vista frontale, all'altezza degli occhi)

- Dopo l'impasto la pagina diventa una **striscia orizzontale lunga** vista di
  fronte, come la vetrina refrigerata vista dal cliente. Una linea continua,
  il **piano del bancone** (fascia color crosta, 6-10 px), attraversa tutta la
  striscia a un'altezza fissa: ogni prodotto *poggia* su quella linea.
- I prodotti sono foto macro vere ritagliate stretto (niente sfondo di
  cucina), di grandezze diverse secondo il prodotto reale: la pagnotta da 1 kg
  è grande, i biscotti piccoli. Accanto a ognuno, sopra il piano: nome, due
  righe, prezzo al chilo o al pezzo, "Nel pane fisso".
- Il fondo cambia lungo il cammino: **farina** per i pani, **carta da
  zucchero** per i dolci e la domenica. Il passaggio non è un taglio: il fondo
  azzurro entra da destra come un foglio che si stende sul bancone.
- Scroll verticale del documento = cammino orizzontale (sezione sticky con
  altezza pari alla lunghezza della striscia). Su mobile uguale, col pollice.
- **Rischi**: il pattern "scroll orizzontale pinned" è diffuso; lo salva il
  contenuto (piano del bancone reale, scala vera dei prodotti, cambio di
  carta) e il fatto che la striscia non è una fila di card uguali.

### Variante B · IL ROTOLO (la carta da zucchero che si srotola)

- Tutta la vetrina è un unico foglio azzurro che si srotola da un rotolo sul
  lato destro dello schermo; i prodotti compaiono "incartati" e si aprono con
  pieghe di carta in CSS 3D.
- **Scartata**: la carta come superficie unica e protagonista è il linguaggio di
  10 IMPRONTA (foglio unico, materia della carta); le pieghe 3D si avvicinano
  alla direzione "segnatura" del 10 e al CSS 3D di 11 e 20. In più la foto
  macro sparisce dietro la carta, e la foto vera è una richiesta della matrice.

### Variante C · LE TEGLIE (vista dall'alto)

- Il bancone visto dall'alto: teglie e cassette che scorrono di lato, prodotti
  fotografati a piombo.
- **Scartata**: la vista dall'alto di un piano con oggetti sopra è il tavolo di
  11 TAJUT; le foto a piombo di pane su teglia sono le più banali in assoluto
  nelle banche immagini (il "flat lay" da food blog) e non rendono la mollica.

### La scelta: A · IL BANCONE

1. È la sola che mette il visitatore **dove sta il cliente**: davanti alla
   vetrina, che cammina di lato e guarda i prodotti all'altezza degli occhi.
2. Tiene la **foto macro protagonista** dopo la prima schermata (richiesta
   dalla verifica incrociata contro 1 MERIDIANA e 6 MERIGGIO).
3. Il **piano del bancone** è una linea che organizza contenuto reale (su cosa
   poggia il prodotto, la scala vera), non una decorazione.
4. Si distingue da 14 BATTIFILO (anch'esso orizzontale): lì una sola foto a
   tutto schermo e un cursore del tempo; qui una fila di prodotti di grandezze
   diverse, nessun cursore, nessuna timeline.
5. È costruibile bene: DOM vero per la striscia, un solo canvas WebGL solo in
   apertura (e nel ritorno dell'impasto nel pane fisso, vedi 4.4).

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo in breve (per art-director e webgl-artist)

**Palette** (quella della matrice, con i ruoli e i contrasti verificati)

| Token | Colore | Ruolo | Contrasti (WCAG) |
|---|---|---|---|
| farina | `#F7F3EA` | fondo dei pani, dell'impasto, del piede | inchiostro su farina 10,0:1 |
| carta da zucchero | `#9BB2C5` | fondo di dolci, domenica, vassoio, stato "scelto" nel pane fisso | inchiostro su zucchero 5,06:1 (testo ok) |
| crosta | `#9C5B2A` | unico accento: piano del bancone, prezzi, bottone primario su farina | crosta su farina 4,81:1 (testo ok); **mai testo crosta su zucchero** (2,43:1) |
| inchiostro | `#2F3D4C` | tutto il testo, bordi di focus | |
| crosta scura (derivato) | `#7E4620` | hover/attivo del bottone crosta, prezzi piccoli su farina | 6,8:1 su farina |

- Il bottone primario su farina è crosta con testo farina (4,81:1, testo da 17 px
  in su e peso 600); sul fondo zucchero il primario diventa inchiostro pieno con
  testo farina. Un solo colore di accento: la crosta. Nessun verde, rosa, giallo.
- L'azzurro non è mai un accento su bianco (quello è LUME): è sempre un **fondo
  pieno** grigio e polveroso, come la carta vera.
- Niente marrone come fondo, niente crema calda (`#F6EFE3` e simili): la farina
  `#F7F3EA` è fredda e bianca, e va tenuta così.

**Tipografia**
- *Bricolage Grotesque* (display, assi `opsz` 12-96 e `wdth` 75-100, peso
  200-800). Titoli in minuscolo, `opsz` 96, peso 700, `wdth` 90: le forme un po'
  gonfie e irregolari del Bricolage sono la "morbidezza dell'impasto" senza
  bisogno di un serif. Il nome del prodotto sul bancone: `opsz` 48, peso 600.
  Niente corsivo (non esiste e non si finge).
- *Karla* 400/500/700 per il testo, 17 px su desktop e 16 px su mobile,
  interlinea 1,5, massimo 60 caratteri per riga. Prezzi in Karla 700 con cifre
  allineate (verificare `font-variant-numeric: tabular-nums`; se Karla non le
  ha, allineare i prezzi a destra in una colonna fissa).
- Nessun maiuscoletto spaziato, nessun monospace, nessun occhiello numerato.

**Forme**: raggio unico **4 px** per bottoni, campi e gettoni del pane fisso
(un taglio netto ma non tagliente, come il bordo della carta da pasticceria).
Le foto sono rettangoli a spigolo vivo. Il vassoio della domenica è l'unica
forma diversa: rettangolo con i quattro angoli piegati (è un oggetto vero).

**Foto**: vedi 4.6.

### 4.2 Struttura: la vetrina orizzontale (schermate)

Ordine lungo il bancone, da sinistra a destra. Ogni "banco" è un `<section>` con
il suo `<h2>` nel DOM, in ordine di lettura.

| # | Banco | Contenuto | Fondo |
|---|---|---|---|
| 0 | **L'impasto** (apertura) | Impasto WebGL a tutto schermo. Marchio MADRE in alto. Titolo corto (es. "premi. se torna su piano piano, è pronto.") e una riga di testo. Un solo bottone: **"Il pane fisso"** (unica etichetta per l'intento prenotazione in tutto il sito: menu, apertura, piede). | farina (è l'impasto) |
| 1 | **Il banco del pane** | 6 pani, per esempio: pagnotta di madre (1 kg e 500 g), segale e cumino, pan di sorc (mais, uvetta, fichi: tradizione friulana), integrale, ciabatta, filone di semola. Ogni pane: foto macro (crosta o mollica tagliata), nome, due righe, prezzo al kg, giorni in cui si fa ("segale: martedì e venerdì"), gesto "Nel pane fisso". | farina |
| 2 | **La madre** (intermezzo stretto) | Un solo blocco, non un prodotto: foto macro del lievito madre (bolle, vasetto), tre frasi su rinfresco quotidiano e lievitazione lunga, in numeri semplici e verosimili (es. "18 ore di lievitazione"). Qui l'impasto WebGL non torna: è fotografico. | farina che vira |
| 3 | **Il banco dei dolci** | gubana, pinza (solo "a Pasqua, su ordinazione"), strucolo di mele, crostata di marmellata, esse di Raveo, biscotti di frolla al chilo. Stessa logica: foto, nome, righe, prezzo. | carta da zucchero (entra da destra come un foglio steso sul bancone) |
| 4 | **Il vassoio della domenica** | Le paste mignon e da vassoio (bignè, cannoncini, diplomatiche, sfogliatine, krapfen alla crema). Una foto larga del vassoio, e sotto il vassoio stesso in carta da zucchero con gli angoli piegati: le paste si "mettono sul vassoio" (anteprima del pane fisso). Prezzo al kg, "mezzo chilo sono circa 12 paste". | carta da zucchero |
| 5 | **Il pane fisso** | La prenotazione (vedi 4.4). È il banco più largo della striscia. | farina |
| 6 | **La bottega** | Indirizzo, orari scritti come testo semplice (nessuna timeline oraria), telefono di esempio, link "Apri in Maps" alla mappa vera. Piede: crediti delle foto (licenze), "Un concept di CiceriLab", torna al Lab. | inchiostro con testo farina |

**Come ci si muove (desktop 1440)**
- Il documento scorre in verticale; una sezione `position: sticky` alta come la
  finestra contiene la striscia; l'altezza del contenitore è pari alla
  lunghezza della striscia. Lo scroll verticale (rotella, trackpad, barra
  spaziatrice, PagSu/PagGiù) sposta la striscia in orizzontale: scroll nativo,
  nessun blocco dello scroll, nessuno smoothing che "rubi" il controllo
  (Lenis facoltativo solo se non altera la tastiera).
- Lo scroll orizzontale del trackpad (deltaX) muove allo stesso modo.
- In basso, fisso, il **nome dei banchi** sul bordo del bancone: "pane · la
  madre · dolci · domenica · pane fisso · bottega", come le etichette di
  sezione di una vetrina vera. È navigazione vera (link), indica dove sei e
  porta al banco con un clic. Non è una barra di avanzamento con traccia
  piena.
- Il menu in alto (marchio + 3 voci + "Il pane fisso") resta visibile.

**Come ci si muove (mobile 375, pensato per primo)**
- Stessa striscia orizzontale, nessuna trasformazione in colonna: il pollice
  scorre in verticale come sempre, e la striscia avanza di lato. In più il
  gesto orizzontale sulla striscia (swipe) viene tradotto nello stesso
  movimento, così funzionano entrambi.
- Un prodotto per schermata circa: larghezza del blocco 84 vw (315 px), il
  prodotto successivo si vede per 16 vw a destra, così si capisce che si
  continua di lato. Foto sopra il piano del bancone (alta circa 46% della
  finestra), sotto il piano nome, righe, prezzo, gesto. Margini laterali 20 px.
- I nomi dei banchi diventano una riga in basso che scorre anch'essa, con il
  banco attivo in inchiostro e gli altri al 60%, sopra la safe-area.
  `ConceptBackButton` in basso a sinistra (regola del sito sotto 640 px): la
  riga dei banchi gli lascia lo spazio.
- L'impasto dell'apertura occupa tutta la finestra; il titolo sta in alto a
  sinistra, non sopra la zona dove si preme (il centro-basso, sotto il pollice).

**Tastiera e lettori di schermo**
- Il DOM è lineare: banco dopo banco, prodotto dopo prodotto. Il Tab su un
  elemento fuori vista porta la striscia a quel punto (si calcola lo scroll
  verticale corrispondente; `scrollIntoView` non basta con la trasformazione).
- Frecce sinistra/destra quando il focus è sulla striscia: prodotto precedente
  o successivo. Un link "Salta al pane fisso" è il primo elemento del focus.
- `prefers-reduced-motion`: la striscia si muove solo con lo scroll dell'utente
  (è già così); si tolgono l'inerzia, l'ingresso del foglio azzurro (diventa un
  cambio netto di fondo in dissolvenza di 200 ms) e le parallassi tra foto e
  testo.

### 4.3 Interazione firma: "La prova del dito"

**La superficie**
- Un piano suddiviso (circa 180×110 vertici su desktop, 110×70 su mobile) in
  three.js, un solo `<canvas>` a tutta finestra solo nel banco 0.
- Colore: farina `#F7F3EA` che vira appena verso l'avorio nelle pieghe;
  spolvero di farina come rumore bianco fine e irregolare sopra; luce diffusa
  dall'alto a sinistra, niente riflessi lucidi (è un impasto opaco, non
  plastilina). Leggera diffusione sotto la superficie finta (shading morbido
  che schiarisce i bordi delle fossette).
- La forma non è piatta: una "pagnotta" di impasto molto larga, con due o tre
  gonfiature morbide e una piega di chiusura, vista dall'alto con un leggero
  angolo.
- A riposo l'impasto **respira**: una salita lentissima (un ciclo di 8-10 s,
  ampiezza minima). È l'unica animazione che parte da sola, e si ferma dopo 30 s
  senza input.

**Il gesto**
- Pointer down sull'impasto: nel punto toccato si forma una fossetta che si
  approfondisce finché si tiene premuto (profondità massima in circa 500 ms,
  curva che frena). La fossetta ha la forma di un polpastrello, non di un
  cerchio perfetto. Lo spolvero di farina si apre nella fossetta e lascia
  vedere l'impasto nudo, un tono più caldo.
- Al rilascio la fossetta **torna su piano piano**: ritorno esponenziale lento
  (circa 1,8-2,2 s al 90%), senza rimbalzo, e resta un segno leggerissimo che
  si cancella in altri 4-5 s. Lo spolvero si richiude per ultimo.
- Fino a 3 fossette insieme (tre dita, o tre prove una dopo l'altra); la
  quarta prende il posto della più vecchia.
- Accanto (non sopra) compare una riga di testo, sempre la stessa, che spiega
  cosa hai visto: "torna su piano piano: è pronto. il pane di oggi è stato
  impastato ieri sera." Il testo arriva una volta, non a ogni pressione.
- Il cursore resta quello di sistema (niente cursore custom, niente cerchio
  che segue il mouse). Sull'impasto il cursore è `pointer`.
- **Differenza da 10 IMPRONTA** (che ha pressione e "tieni premuto"): qui
  premere non invia niente, non è una leva, e il senso sta nel **ritorno**,
  non nella pressione. Nessun bottone del sito si usa "tenendo premuto".
- Su mobile: `touch-action: none` solo dentro la zona centrale dell'impasto
  (circa il 60% centrale), così lo scroll verticale parte dai bordi e dal
  titolo; se il dito si muove in verticale di più di 12 px prima di premere, è
  scroll e non prova.

**Fallback senza WebGL**
- Al posto del canvas: una foto macro vera di un impasto spolverato di farina
  (vedi 4.6), a tutta finestra. Sopra, al punto toccato, una fossetta fatta con
  un elemento con `radial-gradient` di ombra interna e luce sul bordo, che si
  allarga mentre premi e al rilascio torna con una transizione CSS di 2 s
  (`opacity` e `scale`). Stesso testo, stesso senso. Deve essere bello da solo.
- Il fallback scatta anche se il contesto WebGL si perde o se il device è
  molto lento (primo frame sopra 200 ms).

**Da tastiera e per lettori di schermo**
- L'impasto è un `<button>` con etichetta "Fai la prova del dito sull'impasto".
  Invio o Spazio: fossetta al centro; tenuto premuto la approfondisce, al
  rilascio torna su. Frecce: spostano il punto della prova tra cinque posizioni
  (centro e quattro lati), con un anello di focus inchiostro visibile attorno
  al punto.
- Una regione `aria-live="polite"` dice la frase di spiegazione una volta. Il
  canvas è `aria-hidden`.

**Reduced motion**
- Niente respiro. La fossetta appare e scompare con una dissolvenza di
  ombreggiatura (400 ms in entrata, 600 ms in uscita), senza muovere i
  vertici. Il testo resta identico. Nessun cambio di luminosità più rapido di
  3 volte al secondo in nessun caso.

### 4.4 Meccanica unica di prenotazione: "Il pane fisso"

**Idea**: chi compra il pane lo compra sempre uguale. Invece di prenotare ogni
volta, si fa **la propria settimana** una volta sola: "la segale il martedì e il
venerdì, la pagnotta da un chilo il sabato". La bottega la tiene pronta, con il
nome sul sacchetto, finché non la cambi o la sospendi. Le paste della domenica
si mettono a parte, sul vassoio.

**Il banco (layout)**
- Desktop: in alto la **fila dei pani** (i 6 pani come gettoni: foto quadrata
  96 px, nome, prezzo); sotto, la **settimana** come sette scomparti del
  bancone, da martedì a domenica, più lunedì visibile ma chiuso (grigio,
  "lunedì siamo chiusi"). La domenica ha dentro il **vassoio** in carta da
  zucchero, con la fila delle paste sopra di lui. A destra, la frase
  riassuntiva che si scrive da sola e il contatto.
- Mobile 375: i pani in una fila orizzontale scorrevole in alto (gettoni 72 px);
  la settimana come **sette righe** (giorno a sinistra, pani messi a destra),
  alte almeno 56 px, perché su 375 sette colonne sono troppo strette per il
  pollice. La frase riassuntiva e l'invio restano fissi in basso in una barra
  alta al massimo 30% della finestra, apribile.

**Come si mette un pane in un giorno (tre modi equivalenti)**
1. **Trascinare** il gettone del pane sul giorno (mouse e dito). Mentre si
   trascina, i giorni in cui quel pane si fa diventano carta da zucchero; quelli
   in cui non si fa restano farina con la scritta "la segale si fa martedì e
   venerdì".
2. **Tocca e poi tocca** (il modo principale su mobile): tocchi il pane, resta
   "in mano" (bordo inchiostro 2 px e scritta "scegli i giorni"), poi tocchi i
   giorni. Tocchi di nuovo il pane per posarlo.
3. **Tastiera**: il pane è un bottone; Invio lo prende in mano; i giorni sono
   bottoni `aria-pressed`; Esc lo posa. Tutto annunciato via `aria-live`.

Nel giorno, il pane messo diventa una riga con nome, pezzatura (500 g / 1 kg,
dove esiste) e quantità con due bottoni meno/più (non uno slider). Toglierlo:
meno fino a zero, oppure trascinarlo fuori.

**Il vassoio della domenica**
- Le paste si mettono sul vassoio allo stesso modo (trascina o tocca). Il
  vassoio si vende a peso, come nelle pasticcerie friulane: 500 g, 750 g, 1 kg,
  con "circa 12 / 18 / 24 paste". Si sceglie il misto o si indicano le paste
  preferite (fino a 4).
- Due opzioni chiare: "ogni domenica" oppure "una domenica sì e una no".
  Il vassoio è l'unico punto dove la carta da zucchero è un oggetto e non un
  fondo: quando ci sono paste sopra, gli angoli si piegano (una volta, 300 ms).

**La frase che si scrive da sola** (sempre visibile, è il riassunto)
- "La tua settimana: segale 500 g martedì e venerdì, pagnotta di madre 1 kg
  sabato. Vassoio da 750 g ogni domenica. Circa 21,40 € a settimana, si paga
  al ritiro." Testo vero, non una tabella, non un conto.
- Sotto: "dalla prossima settimana, martedì 6 ottobre" (data calcolata dal
  giorno vero), e "Lo sospendi quando vuoi con un messaggio o una telefonata."

**L'invio**
- Due campi: nome (per il sacchetto) e telefono o email. Etichette sopra i
  campi, errore sotto il campo, mai il placeholder come etichetta. Un bottone
  normale: **"Tieni da parte"** (clic o Invio, nessun "tieni premuto").
- `track("demo_prenotazione")` solo al successo.

**Stati obbligatori**
- **Vuoto**: la settimana non è mai bianca. Ogni giorno ha scritto a bassa voce
  "qui il tuo pane", e il martedì mostra un esempio fantasma (gettone al 35%,
  tratteggio) "per esempio: la segale". Il bottone di invio è attivo ma, se
  premuto a settimana vuota, porta il focus alla fila dei pani con "Metti almeno
  un pane in un giorno". La frase riassuntiva dice "La tua settimana è ancora
  vuota: comincia da un pane."
- **Errori** (tutti detti vicino a dove nascono, in inchiostro su farina, mai
  solo col colore):
  - pane lasciato su un giorno in cui non si fa: il gettone torna al suo posto
    (con reduced motion: ci riappare) e il giorno dice "il pan di sorc si fa
    solo venerdì e sabato";
  - lunedì: "Il lunedì siamo chiusi";
  - domenica: si accettano solo il vassoio e due pani (pagnotta e ciabatta):
    "la domenica facciamo solo pagnotta e ciabatta, fino alle 12.30";
  - più di 6 pezzi dello stesso pane in un giorno: "per più di 6 pezzi
    chiamaci, così li mettiamo in conto nell'impasto";
  - contatto non valido o nome mancante: sotto il campo;
  - invio fallito: niente si perde, la settimana resta com'è, messaggio "Non è
    partito. Riprova, o chiamaci allo 0434 …" (numero di esempio).
- **Invio in corso**: il bottone dice "Un momento…" ed è disabilitato; nessuna
  rotella, niente scheletro.
- **Successo**: **nessuna cartolina, ricevuta, scontrino o sacchetto disegnato.**
  La settimana resta lì, ferma; il bordo di ogni scomparto con un pane diventa
  crosta, e al posto del bottone compare una frase in inchiostro: "Fatto,
  Marta. Da martedì 6 la tua segale è pronta con il tuo nome sul sacchetto,
  dalle 7." Due azioni: **"Aggiungi al calendario"** (file `.ics` con una
  ricorrenza settimanale per ogni giorno di ritiro, generato nel browser: è
  un'utilità vera) e "Cambia la settimana". In più, se l'utente torna
  all'apertura, l'impasto ha un piccolo segno di dito già fatto: il suo.
- Salvataggio della bozza in `localStorage` (con try/catch): chi torna trova la
  sua settimana a metà.

### 4.5 Differenziazione (cosa rende 17 diverso dagli altri 19)

- **Da INFORNATA (vecchio 17)**: niente tempo come tema. Niente "il forno a
  orari", niente timeline della giornata, niente "appena sfornato", niente
  "cosa c'è adesso", niente "prenota per domani". Gli orari compaiono una volta
  sola, nella bottega, come testo. MADRE parla del gesto e dell'abitudine
  settimanale.
- **Da 6 MERIGGIO**: niente pastello, niente illustrazioni, niente serif
  corsivo colorato, niente badge ruotati o coriandoli. Foto vere e 3D.
- **Da 9 LUME**: l'azzurro è un fondo polveroso pieno, mai accento vivo su
  bianco; niente chip, niente foto in cornice arrotondata con ombra.
- **Da BRACE & LIEVITO** (se esiste, vedi sezione 0): niente fuoco, forno a
  legna, fondo scuro e arancio; il nostro impasto è freddo e bianco di farina.
- **Da 10 IMPRONTA**: niente carta come superficie unica, niente rilievo
  tipografico, niente luce radente, niente "tieni premuto per inviare".
- **Da 14 BATTIFILO**: niente cursore del tempo, niente foto unica a tutto
  schermo; una fila di prodotti di grandezze diverse.
- **Da 1 MERIDIANA**: l'impasto non è un oggetto da girare o smontare, e dopo
  la prima schermata la pagina è fotografica.

### 4.6 Foto

**Principio**: macro vere, strette sul materiale (crosta, mollica, alveoli,
zucchero in granella, crema), senza sfondi di cucina o di negozio. Luce
naturale, niente filtri pesanti; si uniformano con il ritaglio (stesse
proporzioni per banco) e con un leggerissimo abbassamento della saturazione
se una foto stona. Ogni foto è scaricata e guardata una per una (regola del
Lab), con autore, URL e licenza annotati nel doc dell'art-director e nei
crediti del piede.

**Serve (lista minima)**
- impasto spolverato di farina, dall'alto (fallback dell'apertura);
- lievito madre nel vasetto o in superficie con le bolle (banco 2);
- per i pani: mollica di pagnotta di madre tagliata, crosta di segale con
  cumino, ciabatta con alveoli grandi, integrale, filone di semola; pan di sorc
  solo se la foto è davvero quella (altrimenti vedi piano B);
- dolci: gubana, pinza, strucolo/strudel, crostata, esse di Raveo o frolla;
- paste: vassoio di mignon italiane (bignè, cannoncini, diplomatiche).
- **Vietate**: pane industriale in busta, pancarré, baguette francesi al posto
  del filone, croissant francesi a mezzaluna spacciati per brioche friulane
  (se serve la brioche, che sia la brioche italiana; altrimenti non c'è),
  cupcake, macaron, donut americani, mani o persone in primo piano, banconi
  con marchi leggibili.

**Verifica fatta oggi per gubana e pinza** (Wikimedia Commons; foto scaricate
in `concepts/17-madre/qa/cd-foto/` e guardate):

| Foto | Esito | Licenza e autore |
|---|---|---|
| [Gubana - Interior (452273489)](https://commons.wikimedia.org/wiki/File:Gubana_-_Interior_(452273489).jpg) | **Ottima**: macro della spirale di noci e uvetta nella pasta, sfondo neutro. Prima scelta per il banco dei dolci. | CC BY-SA 2.0, Eric Fung (Flickr) |
| [Gubana 05](https://commons.wikimedia.org/wiki/File:Gubana_05.JPG) | Buona: gubana tagliata con la spirale, zucchero in granella; sfondo scuro da ritagliare. | CC BY-SA 4.0, Petar43 |
| [Gubana 01](https://commons.wikimedia.org/wiki/File:Gubana_01.JPG) | Buona: gubana intera con la chiocciola; piatto bianco da ritagliare. | CC BY-SA 4.0, Petar43 |
| [Gubana.jpg](https://commons.wikimedia.org/wiki/File:Gubana.jpg) | Usabile: tagliata su tagliere; sfondo rosso da escludere con il ritaglio. | CC BY 3.0, Dorothy61n1 |
| [Gubana -.jpg](https://commons.wikimedia.org/wiki/File:Gubana_-.jpg) | **Scartata**: allestimento natalizio con nastri e scritta sovrapposta. | |
| [Pinza triestina](https://commons.wikimedia.org/wiki/File:Pinza_triestina.jpg) | **Vera** (la pinza pasquale con i tre tagli), ma foto casalinga con oggetti rossi sullo sfondo: usabile **solo** con ritaglio stretto sulla crosta e sui tagli. | CC BY-SA 4.0, Kuthurega |

- Attenzione al nome: la "pinza" veneta dell'Epifania (con farina di mais e
  frutta secca, piatta) è un altro dolce. In MADRE la pinza è quella pasquale
  friulana e triestina, e compare con "a Pasqua, su ordinazione".
- Le CC BY-SA chiedono attribuzione e stessa licenza per le modifiche (il
  ritaglio è una modifica): crediti nel piede ("Foto della gubana: Eric Fung,
  CC BY-SA 2.0", con link). È un credito vero, non una didascalia decorativa.
- **Piano B**: se il ritaglio della pinza non regge a 315 px di larghezza, la
  pinza sta nel banco dei dolci **senza foto**: solo nome, due righe e "a
  Pasqua, su ordinazione", in una casella più piccola sul piano del bancone.
  Niente illustrazione, niente foto generata, niente foto di un altro dolce.
  Stessa regola per il pan di sorc e per qualsiasi prodotto friulano non
  trovato.
- **Rete**: `images.unsplash.com` risponde (200), ma la ricerca di Unsplash
  (`unsplash.com/napi/…`) oggi è dietro un controllo anti-bot. Per cercare:
  Openverse (`api.openverse.org`, funziona) e Wikimedia Commons (funziona, ma
  con limite di richieste: una ogni 10-15 s e User-Agent esplicito).

### 4.7 Cosa NON fare

**Dalla ricetta bocciata e da INFORNATA**
- Niente split testo a sinistra e foto in cornice a destra nella prima
  schermata; niente "TAV. I"; niente riga di orari o numeri tra due filetti;
  niente due bottoni pieno + contorno.
- Niente orari come struttura: niente "il forno a orari", niente giornata ora
  per ora, niente "la notte", niente "appena sfornato", niente contatori di
  cosa è rimasto, niente "prenota per domani".
- Niente serif (tanto meno corsivo), niente marrone su crema, niente crema
  calda.
- Niente sezioni numerate "01 ·", niente occhielli in maiuscoletto spaziato,
  niente schede bianche con bordino e ombra, niente fade-up allo scroll,
  niente onde o filetti tra le sezioni, niente mappa disegnata, niente
  cartolina o scontrino alla fine della prenotazione.

**Specifici di MADRE**
- Niente particelle di farina che volano, niente vapore, niente spighe di
  grano, mattarelli o fruste in SVG, niente lavagnetta col gesso, niente carta
  kraft, niente legno rustico come texture, niente sacchi di juta.
- Niente mani o figure disegnate; la prova del dito si vede dalla fossetta, non
  da un dito disegnato.
- Niente impasto lucido o "gelatina": è opaco e spolverato. Niente rimbalzo
  elastico: torna su piano piano.
- Niente animazioni automatiche oltre al respiro dell'impasto nell'apertura.
- L'azzurro non diventa mai un accento su bianco, né un gradiente.
- Niente griglia di prodotti: la vetrina è una fila su un piano, con
  grandezze vere.
- Niente cursore custom, niente testo magnetico, niente "Scorri".
- Niente contatori finti ("dal 1987", "3.000 pagnotte l'anno"), niente
  trattini lunghi in nessun testo visibile.
- Un solo richiamo per la prenotazione: "Il pane fisso" (menu, apertura,
  piede), e "Tieni da parte" solo come invio dentro il pane fisso.

### 4.8 Accessibilità e reduced motion (riepilogo)

- Contrasti: testo inchiostro su farina e su zucchero; crosta come testo solo su
  farina; mai testo farina su zucchero; bottoni verificati in tutti gli stati.
- Focus sempre visibile (anello inchiostro 2 px con 2 px di stacco, su
  zucchero stesso colore: 5:1).
- Ogni gesto ha l'alternativa: impasto come bottone da tastiera; striscia con
  Tab, frecce e link dei banchi; pane fisso con tocca e tocca e `aria-pressed`.
- Lettori di schermo: DOM lineare, un `h1` (apertura), un `h2` per banco, foto
  con `alt` concreto ("gubana tagliata: la spirale di noci e uvetta").
- `prefers-reduced-motion`: niente respiro, fossetta in dissolvenza, niente
  ingresso del foglio azzurro, niente inerzia, gettoni che riappaiono invece di
  volare, pieghe del vassoio senza animazione.
- Niente lampeggi, nessun cambio più rapido di 3 volte al secondo.
- Aree di tocco almeno 44×44 px (i giorni su mobile 56 px di altezza).

### 4.9 Mobile 375 (riepilogo)

- Apertura: impasto a tutta finestra, titolo in alto a sinistra su 2 righe al
  massimo, bottone "Il pane fisso" sopra la safe-area in basso a destra (a
  sinistra c'è `ConceptBackButton`), zona di prova al centro sotto il pollice.
- Vetrina: striscia orizzontale mossa dal pollice, un prodotto e un pezzo del
  successivo per schermata, piano del bancone sempre alla stessa altezza.
- Pane fisso: settimana in sette righe, pani in fila scorrevole, riassunto in
  barra in basso apribile, tastiera del telefono che non copre il campo attivo.
- Niente colonne schiacciate, niente testo sotto 16 px, niente scroll
  orizzontale indesiderato della pagina fuori dalla striscia.

### 4.10 Note per le ondate successive

- **tech-architect / webgl-artist**: three 0.160 senza R3F se basta (un solo
  piano, un solo materiale); render on demand (fermo quando nessuna fossetta è
  attiva e il respiro è finito), pausa fuori vista e con scheda nascosta, DPR
  massimo 1,75 su mobile. Il canvas si smonta quando la striscia lo porta
  fuori schermo. Nessun accesso a `window` a livello di modulo (prerender).
- **motion-designer**: gli unici eventi di movimento sono: respiro e fossetta
  dell'impasto, cammino della striscia (guidato dall'utente), ingresso del
  foglio azzurro ai dolci, gettoni del pane fisso, pieghe del vassoio.
- **copywriter**: italiano da bottega di Pordenone, frasi brevi, nomi veri dei
  prodotti friulani, prezzi al chilo verosimili; il nome sul sacchetto è un
  nome italiano normale di esempio.
- **trend-researcher**: siti di panifici e pasticcerie di alto livello,
  vetrine orizzontali ben fatte, superfici morbide in WebGL (soft body,
  displacement). Principi, non copie.
- **art-director**: completa la lista foto con le macro dei pani e delle paste
  (Openverse, Commons, CDN Unsplash) e conferma o sostituisce le foto di gubana
  e pinza qui sopra.
