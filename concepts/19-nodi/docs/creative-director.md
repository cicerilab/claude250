# Creative director · Concept 19 · Liuteria (Pordenone)

Ondata 0. Rotta `/concept-19`. Nome: **NODI**, *liuteria*. Documento di
direzione per tutti gli agent delle ondate successive: quello che sta sotto
"4. La direzione scelta nel dettaglio" è vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 19, paragrafo 19,
verifica incrociata, regole comuni), `concepts/10-torchio/docs/creative-director.md`
(solo come riferimento di livello e formato), `concepts/10-torchio/docs/integrazione-sito.md`,
`.claude/skills/design-taste-frontend/SKILL.md` (sezioni 0, 1, 4, 9),
screenshot `docs/concept-attuali/concept-19.jpg` (il bocciato ANIMA) e
`concept-1.jpg` (MERIDIANA).

---

## 0. Da dove parto

**La direzione è assegnata dalla matrice** e la tengo: la tavola armonica di un
violino vista dall'alto, ferma al centro, con le foglie di tè che disegnano le
figure di Chladni; palette abete / tè / vernice / ebano; IM Fell DW Pica +
Spline Sans; interazione "accordare la tavola"; prenotazione "La voce che
vorresti". Qui la raffino e la rendo costruibile; non la avvicino a nessuno
degli altri concept.

**Cosa era ANIMA (bocciato, da non rifare)**: fondo marrone quasi nero, oro
come accento e bottoni pieni oro, titolo serif con una parola in corsivo oro,
testo a sinistra e foto della pialla in cornice a destra con didascalia
"TAV. I", riga di quattro numeri tra due filetti (41 strumenti, 14 mesi, 6 in
lista, 10 anni), due bottoni, "Audio acceso" nel menu, e l'idea "il violino si
apre pezzo per pezzo e ogni pezzo suona". Il suono era il protagonista e lo
strumento era un oggetto da smontare.

**Cosa non deve somigliare a MERIDIANA (concept 1)**: là c'è un oggetto 3D in
prospettiva che ruota e si smonta in un configuratore, a destra di un testo.
NODI non ha prospettiva, non ha rotazione, non ha pezzi, non ha materiali da
scegliere: è una superficie piatta vista in pianta, e l'unica cosa che si
muove sono le foglie sopra.

**Vicini da tenere lontani**: IMPRONTA (10) è anch'esso un solo piano WebGL
(ma lì è luce radente su carta, qui particelle su legno, e la luce non si
muove mai); MADRE (17) ha una superficie che reagisce al dito (qui la tavola
non si deforma mai visibilmente, sono le foglie a muoversi); SOTTOPELLE (12)
ha un rosso (lì vivo e sui bottoni, qui bruno e solo sulle cifre).

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina di una bottega di liuteria
artigiana per musicisti (studenti avanzati, professionisti, genitori che
comprano il primo strumento "vero") e per chi porta a riparare, con un
linguaggio da laboratorio di acustica e da cartiglio antico, leaning toward un
unico oggetto in pianta reso in WebGL (particelle guidate da modi di
vibrazione precalcolati) + tipografia da cartiglio + DOM nativo, audio Web
Audio solo su richiesta.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | La struttura è radicale (un solo oggetto fermo, niente sezioni a blocchi), ma la composizione deve restare quieta e leggibile: l'oggetto è simmetrico come un violino, l'asimmetria sta nei margini. Non 9: un musicista che cerca un liutaio vuole serietà, non una galleria d'arte. |
| `MOTION_INTENSITY` | **5** | Si muovono solo le foglie, lente, e solo quando la tavola è in risonanza. Nessun'altra animazione sulla pagina. Il movimento è fisico e raro, non coreografico. |
| `VISUAL_DENSITY` | **3** | Una tavola, un righello delle frequenze, un blocco di testo per volta. Le cifre (Hz, mesi, euro) sono poche e grandi. |

Nota sulla regola "palette premium-consumer" (skill 4.2): abete, tè e vernice
rientrano nella famiglia "crema + ruggine + espresso" che la skill vieta come
riflesso automatico. Qui è ammessa per l'override previsto: non è un colore di
comodo, è **il colore letterale dei tre materiali del gesto** (la tavola di
abete, le foglie di tè, la vernice a olio del liutaio), e nessun altro
concept del Lab ha un fondo così dorato e saturo (verifica incrociata:
`#E6D4AC` contro le creme di 3, 6, 8). Le regole per tenerla lontana dal
"craft beige" sono al 4.1: niente ottone, niente oro, niente nero-espresso
come fondo, vernice solo sulle cifre.

---

## 2. La metafora: le figure di Chladni sulla tavola

### 2.1 Il gesto vero

Prima di incollare la tavola (abete) e il fondo (acero) sulle fasce, molti
liutai fanno la **taratura delle tavole libere** (*free plate tuning*,
metodo reso noto da Carleen Hutchins e dalla Catgut Acoustical Society, e
studiato da Erik Jansson al KTH di Stoccolma). La tavola, già con i fori a
effe e la catena incollata, si appoggia su quattro piccoli cuscinetti di
gommapiuma; sotto c'è un altoparlante che suona una nota pura; sopra si
spargono foglie di tè (o brillantini, o semi). Si fa salire la frequenza:
quando la tavola entra in risonanza su uno dei suoi **modi**, le parti che
vibrano lanciano via le foglie, che si fermano dove il legno sta fermo. Le
linee che si formano sono le **linee nodali**. Il liutaio guarda la figura e
la frequenza, toglie qualche decimo di millimetro di legno col raschietto
dove serve, e rifà la prova.

Si guardano soprattutto tre modi, con la numerazione di Hutchins:

| Modo | Nome in bottega | Figura (tavola di violino) | Frequenza tipica, tavola | Contenuto sul sito |
|---|---|---|---|---|
| **1** | torsione | due linee nodali quasi perpendicolari che si incrociano al centro: una lungo l'asse della giunta, una di traverso all'altezza delle C. La tavola si "torce" come un foglio preso per due angoli opposti. | circa 80-100 Hz | I legni |
| **2** | "modo X" | due linee nodali curve che si incrociano a X nella zona delle C e delle effe; le quattro "punte" della X vanno verso i quattro angoli (spalle e fianchi). È la flessione di traverso alla vena. | circa 150-180 Hz | Costruire uno strumento |
| **5** | "modo ad anello" | una sola linea chiusa, un ovale allungato dentro il bordo, che passa più o meno attraverso le effe e resta a distanza dal contorno; il centro e il bordo si muovono in versi opposti. | circa 320-370 Hz, circa un'ottava sopra il modo 2 | La voce che vorresti (prenotazione) |

Le frequenze sono **valori tipici di letteratura, indicativi** (Hutchins 1981,
*The Acoustics of Violin Plates*, Scientific American; Jansson, *Acoustics for
Violin and Guitar Makers*, KTH, cap. sulle tavole libere, disponibile online).
Il trend-researcher le verifica su almeno una delle due fonti e il copywriter
le presenta sempre con "circa" e come valori di esempio della bottega. La
regola di bottega che il sito racconta: "il modo 5 circa un'ottava sopra il
modo 2" (indicazione di Hutchins, da citare come tale, non come legge).

Valori fissi della tavola di esempio del sito (coerenti con le fasce sopra,
rapporto modo 5 / modo 2 = 2,07): **modo 1 = 92 Hz, modo 2 = 168 Hz,
modo 5 = 348 Hz**.

### 2.2 Come la simulazione resta fisicamente plausibile

Chiunque abbia visto una prova vera (e i liutai l'hanno vista) deve
riconoscerla. Otto regole, vincolanti per il webgl-artist:

1. **Il contorno è quello vero.** Contorno di una tavola di violino 4/4
   (lunghezza circa 356 mm, larghezza massima alle spalle basse circa 208 mm,
   alle spalle alte circa 168 mm, alle C circa 110 mm), con le due effe
   ritagliate. Il contorno si prende da un disegno di pubblico dominio
   (per esempio una forma di scuola cremonese riprodotta in manuali storici)
   o si ricostruisce con archi di cerchio come fanno i liutai; mai un ovale,
   mai una chitarra. Il vector-artist lo consegna come un solo tracciato SVG
   pulito, in millimetri, da cui il webgl-artist genera la maschera.
2. **Le forme dei modi vengono da un calcolo, non da un disegno.** Metodo
   consigliato: calcolo **offline** (script Node o Python fuori dal bundle,
   eseguito una volta) di una piastra sottile **ortotropa** con **bordi
   liberi** sul contorno vero, con il metodo di Rayleigh-Ritz su una base di
   polinomi in x, y integrata su una griglia mascherata dal contorno.
   Parametri: rigidezza lungo la vena circa 12-15 volte quella di traverso
   (abete), spessore uniforme (circa 2,8 mm) o leggermente graduato,
   catena ignorata o resa come un irrigidimento lungo il lato dei bassi. Si
   ottengono i primi 6-8 modi; si scelgono i tre la cui **topologia** coincide
   con la tabella 2.1 (incrocio a +, incrocio a X, anello chiuso) e si
   esportano come campi di spostamento `w(x, y)` normalizzati (griglia
   128 x 224, Float32 o PNG a 16 bit). Le frequenze calcolate non si usano:
   si usano i valori di bottega del 2.1, perché uno spessore reale graduato
   sposta le frequenze. **Piano B** se il calcolo non restituisce le
   topologie giuste: campi costruiti a mano come somme di funzioni lisce nel
   sistema di coordinate della tavola, controllati a occhio sulle foto delle
   fonti (Hutchins e Jansson pubblicano le figure). In entrambi i casi il
   webgl-artist allega nel suo doc tre immagini delle linee nodali ottenute
   accanto alle figure di riferimento.
3. **Le foglie vanno ai nodi, non ai ventri.** Una foglia si muove con una
   spinta proporzionale all'ampiezza locale `|w|` e scende lungo il gradiente
   di `|w|` fino a dove `w` è circa zero. (La polvere finissima va invece ai
   ventri per le correnti d'aria: qui sono foglie di tè, quindi nodi. È un
   dettaglio che un liutaio nota.)
4. **Solo in risonanza.** L'ampiezza di ogni modo segue una curva di
   risonanza (lorentziana) attorno alla sua frequenza. Fuori risonanza la
   tavola quasi non si muove e **le foglie restano dove sono**: la figura
   precedente resta intera finché la risonanza successiva non la scompone.
   Il fattore di merito vero di una tavola è alto (picchi stretti); qui lo si
   allarga di proposito (banda utile circa ±8 Hz attorno al picco) perché si
   trovi col dito, e il testo non lo nasconde.
5. **Tempi veri, rallentati poco.** In bottega la figura si forma in pochi
   secondi. Qui: circa 2,5-4 s perché la figura sia nitida, tutta la
   migrazione con velocità limitata. Nessuna foglia "salta" da un capo
   all'altro della tavola.
6. **Tavola libera e appoggiata.** Quattro piccoli cuscinetti rotondi di
   gommapiuma grigia (cerchi pieni di 8-10 mm in scala, colore ebano al 25%)
   stanno **sulle linee nodali del modo in prova**, come fa il liutaio. Quando
   si cambia modo, i cuscinetti si spostano con una dissolvenza lenta sui
   nodi del modo nuovo. Nessun altro oggetto disegnato.
7. **Le foglie sono foglie.** Scaglie irregolari di tè nero sminuzzato,
   lunghe 1,5-3 mm in scala, con 3-4 forme diverse da un piccolo atlante,
   rotazione casuale fissa, due toni (tè `#3B2B1D` e tè più chiaro al 80%),
   un'ombra portata minima tinta di tè. Non puntini perfetti, non
   brillantini, non luci.
8. **Il legno è abete.** La tavola ha la vena dell'abete: righe sottili,
   dritte e fitte lungo la lunghezza, un po' più larghe verso i fianchi
   (come in un abete tagliato di quarto), fatte con rumore procedurale nello
   shader, con la giunta al centro. Nessuna foto usata come texture, nessuna
   marezzatura da acero (quella è del fondo e il fondo non compare).

---

## 3. Tre varianti di esecuzione della stessa direzione

La direzione è fissa; cambiano l'inquadratura e il ritmo.

### Variante A · LA TAVOLA INTERA

- La tavola intera, in pianta, sempre visibile e ferma al centro dello
  schermo, alta circa l'86% della finestra su desktop. Non si muove, non si
  ingrandisce, non ruota.
- Scorrere fa salire la frequenza lungo un righello; le foglie compongono il
  modo 1, poi il 2, poi il 5. Il testo di ogni modo sta nel margine sinistro,
  il righello e le cifre in quello destro.
- Pregi: la figura è sempre leggibile perché si vede tutto il contorno; il
  violino in pianta è un formato verticale (circa 1:1,7) che su un telefono
  in verticale si piazza in modo naturale; è la variante più vicina al gesto
  vero (il liutaio guarda tutta la tavola).
- Rischi: composizione centrale e statica; va tenuta viva con i margini
  asimmetrici e con la qualità delle foglie.

### Variante B · SOTTO LA LENTE

- La tavola è più grande dello schermo (scala 3:1); la vista è una lente che
  si sposta sulla zona dove passa la linea nodale del contenuto corrente
  (le effe per il modo 2, il bordo per il modo 5). Foto macro di legno.
- Pregi: foglie grandi e materiche, molto fotografico.
- Rischi: si perde il contorno del violino, cioè l'unica cosa che rende
  leggibile la figura; a 375 px diventa "foglie su legno" astratte; lo
  spostamento della vista è un movimento di camera che avvicina alla visita
  3D di MERIDIANA. Scartata.

### Variante C · IL QUADERNO DELLE PROVE

- La tavola piccola accanto al quaderno del liutaio: pagine fitte di misure
  (Hz, grammi, spessori al decimo) per ogni tavola provata; si scorre il
  quaderno e la tavola rifà la prova di ogni riga.
- Pregi: molto credibile per un professionista, tanti dati veri del mestiere.
- Rischi: diventa una tabella di numeri (data dump, skill 4.9); la tavola
  accanto al testo ricrea lo split testo/oggetto vietato in prima schermata;
  il gesto si riduce a guardare. Scartata.

### Scelta: **A, LA TAVOLA INTERA**, con due prestiti

1. È l'unica in cui la figura si legge sempre come figura di un violino: la
   metafora funziona solo se si riconosce il contorno.
2. È la più forte a 375 px: il formato verticale della tavola coincide con
   quello del telefono (vedi 4.9). Le altre due peggiorano sul telefono.
3. È la più lontana da MERIDIANA: niente camera, niente prospettiva.
4. È la più costruibile: un campo di particelle 2D su un piano, tre campi
   precalcolati, nessuna scena 3D.

Prestiti: da **C** le poche misure vere scritte in vernice nel margine (una o
due per modo, mai una tabella); da **B** la qualità materica delle foglie
(atlante di scaglie vere, ombra minima), non la lente.

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo in breve

**Palette (tokens di partenza, l'art-director li fissa)**

| Token | Hex | Uso |
|---|---|---|
| abete | `#E6D4AC` | fondo di tutta la pagina e colore base della tavola |
| abete vena | derivato, circa `#D6BF8E` | solo le righe della vena nello shader |
| tè | `#3B2B1D` | testo di lettura, foglie, righello (contrasto su abete circa 9,3:1) |
| vernice | `#8B3A1D` | **solo cifre**: Hz, prezzi, mesi di attesa, numero in lista, e il cursore del righello. Mai fondi, mai bottoni pieni, mai titoli (contrasto su abete circa 5,3:1) |
| ebano | `#16120F` | titoli IM Fell, bottone principale (fondo ebano, testo abete), contorno della tavola |

- Una sola ombra in tutto il sito: quella della tavola sul banco, morbida,
  tinta di tè al 18-22%, mai nera. La tavola si distingue dal fondo per
  vena, ombra e contorno ebano sottile (1 px a DPR 1).
- Tema chiaro unico. Niente modo scuro, niente sezioni invertite.
- Forme: spigolo vivo ovunque (raggio 0), come il bordo di un listello
  piallato. Eccezione documentata: i cuscinetti di gommapiuma e la
  "foglia" del piano del suono sono tondi/organici perché sono oggetti.

**Tipografia**

- *IM Fell DW Pica* (roman, 400): solo per il nome NODI, i titoli dei modi e
  poche frasi grandi. Rimanda ai cartigli stampati incollati dentro gli
  strumenti antichi (i caratteri Fell sono caratteri inglesi del Seicento,
  coevi dei cartigli cremonesi). **Mai il corsivo di IM Fell** (il vecchio
  ANIMA e la ricetta bocciata avevano la parola in corsivo colorato);
  l'enfasi si fa con la dimensione e basta. Titoli tra 40 e 88 px su
  desktop, 34-44 px su 375.
- *Spline Sans* (300-600): testo, bottoni, etichette dei campi, e **tutte le
  cifre** (Hz, euro, mesi). Cifre tabulari se disponibili
  (`font-variant-numeric: tabular-nums`; l'art-director verifica che la
  famiglia le abbia, altrimenti le cifre del righello hanno larghezza fissa
  per contenitore). Testo 17 px, interlinea 1,55, massimo 60 caratteri per
  riga.
- Niente monospace (neanche Spline Sans Mono), niente maiuscoletto spaziato,
  niente occhielli.

**Marchio**: "NODI" in IM Fell composto come un piccolo cartiglio a due righe
("NODI" / "liuteria in Pordenone"), in alto a destra su desktop (in alto a
sinistra c'è il `ConceptBackButton`). Senza cornice ornata, senza filetti.

### 4.2 Struttura della pagina e schermate

La pagina è **una sola scena**: la tavola resta fissa (sticky) al centro per
tutta la lunghezza; lo scroll nativo del documento fa avanzare la frequenza.
Scroll vero (non intercettato), niente Lenis obbligatorio: se il
tech-architect ne vuole uno, è locale alla pagina e si smonta.

La corrispondenza scroll → frequenza è monotona con **pianerottoli**: a ogni
risonanza lo scroll per un tratto (circa una finestra e mezza) non cambia la
frequenza, così si legge il contenuto con la figura ferma e nitida; tra un
pianerottolo e l'altro la frequenza sale. Scala logaritmica 60-420 Hz.

Schermate, in ordine:

1. **A riposo (apertura)** · 0 Hz, altoparlante spento.
   La tavola al centro con le foglie sparse a caso, come appena versate.
   Nel margine sinistro, allineato in basso: il titolo (IM Fell, massimo due
   righe, per esempio "Prima di chiudere un violino, lo ascoltiamo con le
   foglie di tè."), una frase di testo (al massimo 20 parole) e un solo
   bottone **"La voce che vorresti"** (ebano, testo abete). Nel margine
   destro, il righello con "0 Hz" in vernice. Niente riga di numeri,
   niente seconda call to action, niente "scorri".
   Entrata: nessun preloader a percentuale. Le foglie "cadono" sulla tavola
   una volta sola (circa 1,2 s, dall'alto in pianta: comparsa con scala
   0,9 → 1 e dissolvenza, non un rimbalzo), poi stanno ferme.

2. **Modo 1 · I legni** · 92 Hz.
   Le foglie formano la croce della torsione. Testo: l'abete rosso di
   risonanza della Val di Fiemme (foresta di Paneveggio) e l'acero dei
   Balcani per fondo e fasce, la stagionatura in bottega (anni di esempio),
   perché si prende di quarto. Una sola misura in vernice nel margine
   (per esempio "92 Hz" e "circa 70 g la tavola", da verificare dal
   copywriter). Foto: le tavole grezze accatastate (vedi 4.6).

3. **Modo 2 · Costruire uno strumento** · 168 Hz.
   La X. Testo: violino, viola, violoncello; quanti strumenti l'anno
   (numero di esempio verosimile e piccolo), tempi di consegna in mesi,
   prezzi di esempio "a partire da" per ciascuno (in vernice). Come
   funziona: si viene in bottega a provare, si sceglie la voce, si firma un
   acconto (senza dati legali). Tre righe per strumento, non tre schede.
   Foto: la tavola scavata con la sgorbia o la tavola "in bianco" (senza
   vernice) sul banco.

4. **Modo 5 · La voce che vorresti** · 348 Hz. Il cuore del sito e la
   schermata più alta (vedi 4.4). L'anello.

5. **Tavola ferma · Riparazioni e restauri**.
   L'altoparlante si spegne: le foglie **restano** nella figura ad anello
   (è quello che succede davvero), il righello torna a "spento". Testo:
   cosa si ripara (ponticello, anima riposizionata, crepe, tasto, cavigliere
   rotto), prezzi di esempio "da", e la regola della bottega: **il sabato
   mattina la bottega è aperta**, si porta lo strumento e si guarda insieme.
   Piccola meccanica di contatto per le riparazioni (vedi 4.5).

6. **La bottega**.
   Indirizzo di esempio verosimile a Pordenone (diverso da quello di ANIMA,
   "Via dei Molini 3"), orari, telefono di esempio, link "Apri in Maps" alla
   mappa vera. Niente mappa disegnata. Una frase su chi lavora in bottega,
   senza ritratti disegnati.

7. **Piede**: "Un concept di CiceriLab", torna al Concept Lab, crediti delle
   foto (autori Unsplash reali), una riga su come è fatta la simulazione
   ("le figure sono calcolate da una tavola di violino di esempio").

Navigazione: un piccolo indice nel margine destro sotto il righello con i
nomi dei contenuti (I legni, Costruire, La voce, Riparazioni, Bottega), che
porta allo scroll del pianerottolo relativo. Su 375 è un menu a comparsa dal
marchio. Il bottone "La voce che vorresti" è l'unico richiamo alla
prenotazione in tutta la pagina (hero, indice, piede usano lo stesso testo).

### 4.3 Interazione firma: "Accordare la tavola"

**Il righello delle frequenze**
- Desktop: verticale nel margine destro, alto quanto la tavola, 60 Hz in
  basso e 420 Hz in alto (le note salgono). Tacche ogni 10 Hz, cifre ogni
  50 Hz in Spline Sans 12 px tè; il valore corrente grande (40-48 px) in
  vernice accanto al cursore; sotto, il nome del modo quando c'è
  risonanza ("modo 2") oppure niente.
- Mobile: orizzontale, in basso, sotto il pollice (vedi 4.9).
- Il cursore si trascina (mouse, dito, penna). Trascinare il righello **fa
  scorrere la pagina** di conseguenza (una sola verità: la posizione di
  scroll), così scroll e trascinamento non litigano mai e i contenuti
  restano quelli giusti.
- Aiuto al polso: entro ±6 Hz da un picco il cursore "si appoggia" sul
  picco al rilascio (magnetismo solo al rilascio, mai durante il
  trascinamento).
- Le tacche dei tre modi sono segnate solo dopo che il visitatore li ha
  trovati almeno una volta (un piccolo segno ebano sulla tacca): il
  righello racconta la sua prova. Salvato in `localStorage` con try/catch;
  senza memoria, riparte vuoto e va bene lo stesso.
- Tastiera: il righello è un `slider` (frecce ±1 Hz, PagSu/PagGiù ±10 Hz,
  Inizio/Fine); tre scorciatoie visibili accanto ("modo 1", "modo 2",
  "modo 5") che portano ai pianerottoli.
- "Rimetti le foglie": un link di testo sotto il righello sparge di nuovo
  le foglie in modo uniforme (1,2 s), per rivedere la figura formarsi.

**Le foglie (particelle)**
- Quantità: circa 2.600 su desktop, circa 1.400 su mobile, 900 se il
  dispositivo è lento (il tech-architect fissa la soglia).
- Movimento come da 2.2: spinta proporzionale a `|w|` per la risposta di
  risonanza, discesa verso i nodi, attrito alto. Il tremolio sulle zone
  che vibrano è **rumore liscio** a bassa frequenza (al massimo 3 cambi al
  secondo), ampiezza massima circa 2 px: mai un tremolio frame per frame,
  che sullo schermo diventa sfarfallio.
- **Niente lampeggi**: le foglie non cambiano mai colore né luminosità,
  la tavola non cambia luce, non ci sono bagliori né flash di "risonanza
  trovata". L'unico segnale di risonanza è la figura che si forma e il
  nome del modo che compare in dissolvenza (300 ms).
- Quando tutte le foglie sono quasi ferme, il rendering si ferma (render on
  demand); riparte solo quando cambia la frequenza o si interagisce. Si
  ferma anche quando la scheda non è visibile.

**Il suono (sempre facoltativo)**
- Spento all'apertura, sempre. Nessun `AudioContext` creato finché il
  visitatore non tocca il comando "Suono" (un interruttore di testo accanto
  al righello: "Suono spento" / "Suono acceso", `aria-pressed`). Mai nel
  menu come richiamo principale (in ANIMA era un bottone in alto).
- Acceso, fa sentire quello che si sente in bottega: una sinusoide pura alla
  frequenza del righello, come l'altoparlante sotto la tavola. Volume basso
  (guadagno massimo circa 0,04, cioè circa -28 dBFS), attacco e rilascio di
  150-200 ms per non fare click, e si abbassa da solo del 50% fuori
  risonanza.
- Si spegne da solo: quando la scheda va in secondo piano, quando si esce
  dalle schermate dei modi, e dopo 20 s senza cambi di frequenza (con una
  dissolvenza di 1 s). Un tocco sull'interruttore lo spegne subito.
- Nota sotto l'interruttore: "Suono basso. Con le cuffie abbassa il volume."

**Reduced motion** (`prefers-reduced-motion: reduce`)
- Nessuna migrazione: le foglie sono già disposte nella figura del modo
  corrente (posizioni finali precalcolate con la stessa simulazione) e il
  passaggio da un modo all'altro è una dissolvenza incrociata di 400 ms
  tra due disposizioni ferme. Nessun tremolio, nessuna caduta iniziale.
- Il righello funziona uguale; fuori risonanza resta visibile l'ultima
  figura.
- Il suono resta disponibile e resta spento di default.

**Senza WebGL**
- Tre immagini statiche (PNG/WebP) delle figure 1, 2, 5 generate dalla
  stessa simulazione dal webgl-artist, più l'immagine "a riposo"; stesso
  righello, cambi con dissolvenza. Deve essere già bello così.

### 4.4 Meccanica unica di prenotazione: "La voce che vorresti"

Idea: chi chiede uno strumento nuovo non sa dire "voglio una tavola a 348
Hz", ma sa dire "lo voglio scuro e pronto". Il sito gli dà **un piano del
suono** su cui posare una foglia di tè, gli fa sentire una nota d'esempio se
la chiede, e manda al liutaio la richiesta con quella voce e con il posto in
lista d'attesa. Non è un form a passi, non finisce in cartolina, scontrino,
certificato o ricevuta.

**Layout**
- Desktop: la tavola resta al centro e mostra il modo 5 con l'anello. Nel
  margine sinistro il piano del suono: un quadrato di circa 320 px (fondo
  abete leggermente più scuro, niente bordo spesso, due assi sottili in tè
  al 40%), con le quattro parole agli estremi in Spline Sans: **scuro** /
  **brillante** (orizzontale), **morbido** / **pronto** (verticale). Sotto,
  i campi. Nel margine destro il righello resta, e il suo cursore
  segue la voce scelta.
- Mobile: vedi 4.9.

**Cosa si sceglie (ordine libero)**
1. *Lo strumento*: violino, viola, violoncello (gruppo di radio in IM Fell
   24 px, sottolineatura ebano sul selezionato; niente pillole).
2. *La voce*: si trascina la **foglia** (una scaglia di tè ingrandita,
   circa 28 px, l'unico oggetto "disegnato" del sito, dall'atlante delle
   foglie) sul piano. Il punto sceglie due parametri:
   - scuro ↔ brillante sposta la frequenza di riferimento del modo 5
     della tavola tra circa 330 e 366 Hz: **le foglie sulla tavola
     rifanno l'anello** alla nuova frequenza (anello un po' più largo o
     più stretto, nel limite del plausibile), e il righello segue;
   - morbido ↔ pronto cambia quanto rapidamente la figura si forma (più
     pronto = foglie più rapide) e, nella nota d'esempio, l'attacco.
   Sotto il piano una frase in parole semplici aggiorna la scelta (cinque
   zone: "scura e morbida, da musica da camera", "scura e pronta",
   "brillante e morbida", "brillante e pronta, che passa l'orchestra",
   "equilibrata" al centro). Il copywriter scrive le cinque frasi, con
   onestà: "è un modo per parlarne, non una promessa di laboratorio".
3. *Senti la voce* (bottone di testo con icona altoparlante da libreria):
   **solo su tocco**, suona una nota d'esempio sintetica (un La 440 Hz per
   il violino, un Do 131 Hz per la viola, un Do 65 Hz per il violoncello,
   circa 1,8 s), volume basso come sopra, colore del suono dato dal punto
   (filtro più aperto se brillante, attacco più breve se pronto). Didascalia
   onesta: "Suono sintetico d'esempio, per orientarti. In bottega si prova
   lo strumento vero." Nessuna nota parte da sola, neanche al primo
   trascinamento della foglia.
4. *Chi sei*: nome, email **o** telefono (uno dei due basta), una riga
   facoltativa ("per chi è, che musica suoni"). Etichetta sopra, errore
   sotto, niente placeholder come etichetta.

**La lista d'attesa**
- Sopra il bottone di invio, in vernice: la posizione che si otterrebbe
  ("Saresti il numero 7 in lista. Consegna prevista: primavera 2028.") con
  numeri di esempio fissi e credibili per una bottega che fa pochi
  strumenti l'anno (il copywriter li fissa; niente contatori finti che si
  muovono). La consegna dipende dallo strumento (il violoncello più lungo).

**Invio**
- Un solo bottone: **"Mettimi in lista"** (ebano, testo abete, una riga).
  È l'azione del form; la call to action di tutta la pagina resta "La voce
  che vorresti".
- Al clic: `track("demo_prenotazione", { concept: 19, strumento, voce })`.
  È un prototipo: nessun dato parte davvero; il testo del successo lo dice
  in una riga piccola.

**Stati obbligatori**
- **Vuoto** (all'arrivo): la foglia è al centro del piano ("equilibrata"),
  lo strumento è "violino", la tavola mostra l'anello a 348 Hz, i campi sono
  vuoti con le loro etichette. Un invito in una riga sopra il piano:
  "Sposta la foglia dove senti il tuo strumento. Se non lo sai, lasciala
  al centro: ne parliamo in bottega." Mai un piano vuoto e grigio.
- **Errore** (validazione, al tentativo di invio e all'uscita dal campo):
  sotto il campo, in tè con un segno vernice a sinistra (non solo colore):
  "Scrivi un'email o un numero di telefono, ci basta uno dei due." / "Questa
  email non sembra completa: manca la chiocciola?". Il focus va al primo
  campo con errore. Le foglie sulla tavola non reagiscono agli errori
  (nessun "tremore di errore").
- **Invio in corso**: il bottone diventa "Ti mettiamo in lista" e resta
  largo uguale; sulla tavola l'anello si ricompone lentamente (niente
  spinner). Dura al massimo quanto la simulazione di rete.
- **Invio fallito** (simulato con un parametro di test): una frase sotto il
  bottone: "Non è partita. Riprova tra poco o chiamaci al numero della
  bottega, rispondiamo dal martedì al sabato." Campi conservati.
- **Successo**: niente cartolina né riepilogo incorniciato. La figura ad
  anello resta ferma sulla tavola alla frequenza della voce scelta e, sul
  righello, compare una tacca permanente in vernice con scritto "la tua
  voce, 352 Hz" (salvata in `localStorage` con try/catch). Nel margine,
  al posto del form, tre righe: "Sei in lista, al numero 7. Hai chiesto un
  violino dalla voce scura e pronta. Ti scriviamo entro due giorni per
  fissare una prova in bottega." e un link "Cambia la voce" che riapre il
  form con i dati conservati. Più in piccolo: "Questo è un concept di
  CiceriLab: la richiesta non è stata inviata a nessuno."

### 4.5 Riparazioni: "Il sabato di bottega"

Seconda meccanica, piccola e diversa, per chi ha già lo strumento:
- I prossimi quattro sabati, scritti come date in parole ("sabato 3
  ottobre"), ognuno con la fascia 9:00-12:30. Si tocca un sabato, si
  scrive lo strumento e il problema in una riga, nome e telefono.
- Risposta: "Ti aspettiamo sabato 3 ottobre tra le 9 e mezzogiorno e mezzo.
  Porta anche l'archetto." Nessun orario a slot di 15 minuti, nessun
  calendario a griglia: la bottega il sabato è aperta e basta, il nome serve
  solo a sapere chi arriva.
- Stessi stati del 4.4 (vuoto: nessun sabato scelto e la frase "Scegli un
  sabato"; errore sotto il campo; successo in una frase). Stesso evento
  `track("demo_prenotazione", { concept: 19, tipo: "riparazione" })`.

### 4.6 Foto

**Cosa serve** (massimo 4 foto, tutte da Unsplash, scaricate e guardate con
Read una per una, autore e URL annotati nel doc dell'agent che le sceglie):
1. tavole di abete grezze o cunei di legno di risonanza accatastati (I legni);
2. una tavola o un fondo di violino in lavorazione sul banco, con sgorbie,
   pialletti a pollice o raschietti (Costruire);
3. il banco di una bottega di liuteria vera: forme interne, morsetti,
   strumenti "in bianco" appesi (Riparazioni o Bottega);
4. facoltativa: un violino finito verniciato visto di dettaglio (effe,
   riccio), solo se la luce è naturale e non "oro su nero".

Ricerche suggerite: "luthier workshop", "violin maker", "violin making",
"violin in the white", "tonewood spruce", "luthier tools".

**Controlli obbligatori sul soggetto**: solo strumenti ad arco (violino,
viola, violoncello, contrabbasso). Scartare: chitarre (molte foto
"luthier" sono di liutai di chitarre), ukulele, mandolini, strumenti a fiato,
concertisti che suonano, mani sulle corde in concerto, violini con fumo o
luci da palco, foto seppia scure con riflessi oro (ricordano ANIMA), la
pialla in primo piano "in cornice" (era la foto del bocciato).

**Trattamento**: colori naturali, nessun duotono, nessun filtro seppia.
Rettangoli puliti senza cornice e senza didascalie poetiche ("TAV. I"
vietato). Le foto stanno **nel margine di lettura** del contenuto a cui
servono, a dimensione fissa (circa 360 px di larghezza su desktop), mai sopra
o dietro la tavola, mai a tutto schermo: l'oggetto resta la tavola. Testo
alternativo funzionale ("Tavole di abete accatastate a stagionare").

**Piano B**: se non si trovano almeno due foto giuste di liuteria ad arco,
**nessuna foto di bottega**: il sito vive della tavola e della vena
procedurale. Al massimo una foto macro di legno di abete (più facile da
trovare) nella schermata I legni, e solo se è davvero abete di quarto. Mai
immagini generate con l'IA spacciate per la bottega vera. Mai una foto
sbagliata "tanto per".

### 4.7 Cosa NON fare

**Il vecchio ANIMA (lo strumento che si apre e suona)**
- Nessuno smontaggio, nessuna esplosione in pezzi, nessun "tocca un pezzo e
  senti la nota", nessun violino aperto con la catena e l'anima in vista.
  La tavola è intera, sola, e non si separa da niente.
- Il suono non è il protagonista: nessun "Audio acceso" nel menu, nessuna
  musica di sottofondo, nessun suono al passaggio del mouse, nessun
  campione di violino suonato da un musicista.
- Niente marrone quasi nero come fondo, niente oro, niente bottoni pieni
  color oro/ambra, niente parola del titolo in corsivo colorato.
- Niente riga di numeri tra due filetti ("41 strumenti, 14 mesi..."),
  niente due bottoni affiancati pieno + contorno, niente "TAV. I", niente
  foto a destra del testo in prima schermata.
- Non chiamare niente "anima" (né nome, né sezioni), per non richiamare il
  bocciato; l'anima si nomina solo nell'elenco delle riparazioni.

**MERIDIANA e il 3D**
- Nessuna prospettiva, nessuna rotazione della tavola, nessuna orbita,
  nessun modello 3D di violino, nessun configuratore di materiali o colori
  della vernice. La vista è sempre in pianta, ortografica.

**La ricetta bocciata e la skill**
- Niente sezioni numerate "01 ·", niente maiuscoletto spaziato, niente
  schede con bordino e ombra, niente fade-up allo scroll (sul testo
  nessuna animazione di ingresso: cambia per dissolvenza di 200 ms quando
  cambia modo, e basta), niente onde o filetti decorativi tra le sezioni,
  niente mappa disegnata, niente sagome o figure umane in SVG (neanche un
  violinista stilizzato), niente cursore custom, niente testo magnetico.
- Niente trattini lunghi (né `—` né `–`) in nessun testo visibile.
- Niente contatori finti, niente "dal 1987" come occhiello, niente
  coordinate, niente "scorri".
- Niente secondo accento: il rosso vernice vive solo sulle cifre e sul
  cursore del righello.

**Specifici di NODI**
- Le figure non si inventano per bellezza: niente mandala, niente simmetrie
  a stella, niente figure di piastre quadrate o circolari da manuale di
  fisica (sono quelle che si trovano ovunque, e su un violino sarebbero
  false). Solo le tre figure della tavola, verificate come al 2.2.
- Le foglie non brillano, non sono puntini luminosi, non lasciano scie, non
  fanno "polvere magica". Niente glow, niente particelle che seguono il
  cursore.
- La tavola non si deforma mai visibilmente (la deformazione vera è di
  micron): niente onde che corrono sul legno.
- Niente frequenze che salgono da sole all'apertura: la tavola aspetta.
- Niente accordatore cromatico da chitarra, niente oscilloscopio verde,
  niente spettro colorato stile equalizzatore: il righello è un righello.

### 4.8 Accessibilità

- Il `canvas` è `aria-hidden`. Ogni stato della tavola ha la sua
  descrizione nel DOM, letta con `aria-live="polite"` solo quando cambia
  modo: "Modo 2 a 168 hertz: le foglie formano una X all'altezza delle
  effe."
- Il righello è un vero `slider` con `aria-valuetext` parlante ("168 hertz,
  modo 2, Costruire uno strumento"); le tre scorciatoie dei modi sono
  bottoni veri. L'indice dei contenuti è una normale lista di link. Tutto
  il contenuto è leggibile anche senza toccare il righello, solo con lo
  scroll o con la tastiera.
- Il piano del suono ha l'alternativa accessibile: due `input type=range`
  etichettati ("Da scuro a brillante", "Da morbido a pronto") che muovono
  la stessa foglia, e le frecce della tastiera sulla foglia a fuoco.
- Contrasti: tè su abete circa 9,3:1, vernice su abete circa 5,3:1, ebano su
  abete circa 12,7:1, abete su ebano (bottone) circa 12,7:1. Anello di focus
  2 px ebano con 2 px di distanza, visibile su abete.
- Obiettivi tattili almeno 44 x 44 px (cursore del righello, foglia,
  radio, sabati).
- Nessun lampeggio (vedi 4.3), `prefers-reduced-motion` rispettato,
  audio mai automatico e con interruttore sempre visibile quando è acceso.
- `lang="it"`, gerarchia dei titoli vera (un solo `h1`, un `h2` per
  contenuto).

### 4.9 Mobile a 375 px (pensato per primo)

- La tavola sta in un riquadro fisso (sticky) in alto, alto circa il 54%
  della finestra (`svh`), centrata: a 375 x 667 è alta circa 360 px e larga
  circa 210 px, abbastanza per leggere le figure. Il formato verticale del
  violino riempie bene lo schermo verticale.
- Sotto la tavola, il testo scorre in una colonna piena larga (margini
  laterali 20 px) che passa **sotto** il riquadro; quando si legge un
  contenuto lungo (prezzi, form), il riquadro della tavola si riduce al 34%
  (transizione legata allo scroll, niente scatti) e torna al 54% sul
  pianerottolo successivo.
- Il righello è **orizzontale**, sotto la tavola, appena sopra il testo,
  alto 56 px, con il cursore da 44 px trascinabile col pollice e il
  valore in vernice a destra. Sul righello `touch-action: none` in
  orizzontale; sulla tavola `touch-action: pan-y`, così la pagina scorre
  sempre anche se il dito parte dalla tavola.
- Zona del `ConceptBackButton` (in basso a sinistra, circa 210 x 44 px)
  sempre libera: il bottone di invio e l'interruttore del suono non ci
  finiscono sotto, e l'ultima riga di ogni contenuto ha un margine di piede
  di almeno 72 px.
- Il piano del suono su 375: quadrato largo quanto la colonna (circa 300 px),
  la foglia si trascina col pollice; mentre si trascina, lo scroll della
  pagina è bloccato solo dentro il piano. I campi sono sotto, uno per riga,
  con tastiera giusta (`type=email`, `type=tel`, `autocomplete`).
- Il marchio NODI e il menu a comparsa in alto a destra.
- Le foto su mobile stanno nel flusso del testo, larghe quanto la colonna,
  proporzione 4:3, caricate in lazy.
- Controllo del responsive-tester: 375, 768, 1440, 2560 px. A 2560 la
  tavola non supera circa 1.000 px di altezza e i margini crescono.

### 4.10 Note per le ondate successive

- **tech-architect / webgl-artist**: three 0.160 senza R3F (un solo piano
  ortografico e un sistema di particelle istanziate; R3F non serve). Campi
  modali precalcolati offline come asset statici (tre file piccoli), mai
  calcolati nel browser. Integrazione delle particelle sulla CPU (poche
  migliaia di punti) o in un semplice passaggio GPGPU, a scelta del
  tech-architect; DPR massimo 2 su desktop e 1,5 su mobile; render on demand;
  pausa con `visibilitychange`. Web Audio creato solo dopo un gesto.
  Nessun accesso a `window`/`document` a livello di modulo (prerender).
  Porte: **9190-9199** (per analogia con gli esempi di `lab-operativo.md`,
  11 → 9110-9119 e 20 → 9200-9219; il range non tocca quello del 20),
  sempre con `--strictPort`.
- **motion-designer**: gli unici eventi di movimento sono: caduta
  iniziale delle foglie, migrazione delle foglie, spostamento dei
  cuscinetti, dissolvenze dei testi al cambio modo, riduzione del
  riquadro della tavola su mobile. Nient'altro si muove.
- **ux-architect**: i pianerottoli di scroll e l'ordine delle schermate del
  4.2 sono vincolanti; la lunghezza dei pianerottoli si regola.
- **copywriter**: italiano di bottega di Pordenone, frasi brevi, parole
  del mestiere spiegate una volta (tavola, fondo, fasce, catena, effe,
  "in bianco"). Frequenze sempre con "circa". Prezzi e tempi di esempio
  verosimili, nessun dato legale, nessun nome di maestro inventato come
  "allievo di" qualcuno di reale.
- **trend-researcher**: verificare le figure e le frequenze sulle fonti
  del 2.1; cercare siti che usano una simulazione fisica come interfaccia
  e siti di liutai contemporanei. Estrarre principi, non copiare.
- **vector-artist**: il contorno della tavola con le effe come unico SVG
  in millimetri; niente altre illustrazioni.
