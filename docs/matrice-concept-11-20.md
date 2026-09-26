# Matrice di differenziazione: concept 11–20

Documento del direttore artistico del Concept Lab. Serve come base per
rifare i concept 11–20 dopo l'approvazione del pilota 10 (IMPRONTA). Ogni riga
diventa l'ONDATA 0 del proprio concept: il creative-director parte da qui,
propone comunque le sue tre direzioni e scarta questa solo se ne trova una più
forte e altrettanto distante dagli altri 19.

Numeri, rotte (`/concept-11` … `/concept-20`) e mestieri restano quelli di
sempre. Nomi e idee sono nuovi.

## 0. Da dove si parte

### Cosa c'è già (da non toccare)

| # | Palette dominante (letta dagli screenshot) | Font (lettura visiva, da verificare nel repo del sito) | Struttura |
|---|---|---|---|
| 1 MERIDIANA | avorio `#F2F0EB`, blu notte `#2B4A6F` | Cormorant + Inter + mono | split, oggetto 3D a destra |
| 2 QUOTA TREMILA | verde bosco `#1F3A2E`, arancio `#E8612C` | Barlow Condensed + Inter + mono | hero foto a tutto schermo |
| 3 MARGINALIA | crema `#F6EFE3`, blu `#1E2B45`, ruggine `#A33A2A` | serif editoriale (Fraunces o simile) | cornice da frontespizio + foto |
| 4 STUDIO FORMA | bianco `#FAFAF8`, nero, rosso `#E63B2E` | Archivo (espanso/nero) + Inter + mono | manifesto tipografico svizzero |
| 5 FORGIA CLUB | quasi nero `#151320`, viola `#8B5CF6` | condensato pesante (Oswald/Anton) + Inter | hero foto scura |
| 6 MERIGGIO | crema `#FFF6EC`, rosa `#E08BA2`, salvia `#7FA56B`, cacao `#3A2521` | serif morbido + sans tondo (Nunito?) | split giocoso con cono |
| 7 CONTROLUCE | nero, bianco | serif condensato (Instrument Serif?) + Inter | foto a pieno schermo |
| 8 PODERE LIVENZA | carta `#F2ECE6`, bordeaux `#6B2238` | Cormorant/EB Garamond + Inter | etichetta + foto |
| 9 LUME | bianco, azzurro `#5B9BD5`, blu `#1C3553` | Plus Jakarta Sans o Sora | split con foto e chip |
| 10 IMPRONTA | citrino `#E4CF3F`, verde notte `#17231D`, lamina `#C8CDD2` | Anybody + Hanken Grotesk | foglio unico, rilievo WebGL |

Tutti e dieci sono pagine a scroll verticale a sezioni. Per questo nella
matrice la maggior parte dei concept nuovi non lo è.

### Cosa hanno in comune i bocciati 11–20 (e quindi non si rifà)

Hero sempre uguale: testo a sinistra, foto incorniciata a destra con
didascalia "TAV. I", riga di tre o quattro numeri tra due filetti, due bottoni
(pieno + contorno), orari in piccolo sotto. Poi sezioni numerate "01".
Nessun concept nuovo può avere uno split testo/foto nella prima schermata.

### Font vietati in tutta la matrice

Inter, Cormorant (tutte), Playfair (tutte), Anybody, Hanken Grotesk, e le
famiglie che si vedono in 1–9 e nei bocciati: Barlow, Archivo, Fraunces,
EB Garamond, Instrument Serif, Plus Jakarta Sans, Sora, Nunito, Oswald,
Anton, Young Serif, DM Serif, Alfa Slab One, Teko, Rajdhani, Spectral,
Alegreya, Jost, Mulish, Work Sans, IBM Plex, JetBrains Mono, Space Grotesk,
Space Mono. I font di 1–9 sono stati letti dagli screenshot: il primo agent
che ha accesso a `cicerilab/cicerilab` controlla i `useEffect` dei font in
`Concept1.tsx`…`Concept9.tsx` e segnala eventuali collisioni.

## 1. Tabella riassuntiva

| n. | Nome | Mestiere | Metafora | Palette | Font display + testo | Struttura della pagina | Interazione firma | Tecnologia principale | Prenotazione / contatto unico | Cartella |
|---|---|---|---|---|---|---|---|---|---|---|
| 11 | **TAJUT** | Osteria di paese | Il tavolo di formica dove si gioca a briscola con le carte triestine: il sito è una mano di carte. | formica `#A8D5C5`, carta `#FBF6EA`, ocra `#D69A2D`, prugna `#2B2238` | Bagel Fat One + Literata | Un solo schermo: il tavolo visto dall'alto, una mano di carte in basso. Ogni carta giocata diventa un contenuto (menù, vino, orari, dove). Niente scroll di pagina. | Trascinare/lanciare una carta sul tavolo, che si gira e si apre. | CSS 3D (flip) + SVG dei semi + foto sulle facce delle carte | **"Cala le tre carte"**: tre carte in mano (giorno, ora, quanti siete), ognuna si cambia toccandola; si calano insieme sul tavolo e l'oste risponde giocando la sua carta con il numero del tavolo. | `concepts/11-tajut` |
| 12 | **SOTTOPELLE** | Studio di tatuaggi | L'inchiostro che entra nella pelle e si posa: ogni lavoro arriva come una goccia d'inchiostro che si apre nell'acqua e poi si ferma. | nero `#151312`, osso `#ECE5D8`, rosso `#A92F28`, grigio sfumato `#6F6962` | Grenze Gotisch + Schibsted Grotesk | Parete infinita da trascinare in ogni direzione (portfolio di tatuaggi guariti), con una "vista elenco" per chi non vuole esplorare. | Trascinando la parete, le foto nuove sbocciano come inchiostro in acqua, a velocità legata al gesto; al passaggio l'inchiostro fa un'increspatura lenta. | WebGL 2D (shader di diffusione) + foto vere | **"Grande come?"**: la misura del tatuaggio si sceglie confrontandola con oggetti veri in scala reale (moneta da 1 €, carta di credito, telefono, cartolina aperta); con idea e zona si ottiene una stima in sedute e si sceglie un posto per la consulenza gratuita di 20 minuti. | `concepts/12-sottopelle` |
| 13 | **CONTROPELO** | Barbiere | Lo specchio del salone appannato dal vapore dell'asciugamano caldo; prezzi e appuntamenti sono scritti sul vetro a pennarello. | specchio `#232A2C`, vapore `#CDD5D4`, turchese `#2A9D96`, pennarello `#FAFAF6` | Limelight + Figtree (+ Mansalva solo per la scrittura a mano sul vetro) | Un solo specchio a tutto schermo, niente scroll. Tre specchi uno accanto all'altro sono i tre barbieri: si passa dall'uno all'altro. Dietro il vapore c'è la foto vera del salone. | Pulire il vapore con il dito o il mouse: dove passi il vetro si schiarisce e compaiono listino, servizi, barbiere; il vapore torna lento. | Canvas 2D (maschera del vapore) + foto | **"La lista sullo specchio"**: gli appuntamenti del giorno sono nomi scritti a pennarello sullo specchio, a mezz'ore fisse; tocchi un buco tra due nomi, scrivi il tuo e compare con la stessa calligrafia. Non è una fila live. | `concepts/13-contropelo` |
| 14 | **BATTIFILO** | Impresa edile e serramenti | La linea blu del battifilo sul calcestruzzo: tutto il sito è la cronaca di un cantiere tipo, dal primo scavo alla consegna delle chiavi. | calcestruzzo `#B8B4AB`, cobalto `#1C4CB4`, calce `#F2F0EA`, ferro `#2A2C2F` | Big Shoulders Stencil Display + Chivo | Timeline: una foto a tutto schermo e un cursore in basso che scorre 14 mesi di lavori. Ogni mese ha la sua foto, cosa si è fatto, quanto è costato quel passaggio. | Trascinare il tempo: il cursore "batte" una linea blu sul calcestruzzo mentre avanzi, e le foto cambiano per fasi. | Foto (protagonista) + CSS | **"Misura e manda"**: misuri la tua finestra a casa (larghezza e altezza della luce, con le istruzioni), inserisci i numeri e la vedi disegnata in scala accanto a una porta standard, con la forbice di prezzo per PVC, legno-alluminio e legno; poi chiedi il sopralluogo. | `concepts/14-battifilo` |
| 15 | **NOVANTA** | Fisioterapia e osteopatia | Il goniometro del fisioterapista: il movimento si misura in gradi. "Novanta" è l'angolo che una spalla deve tornare a fare. | albicocca `#F4D5C0`, petrolio `#0E3D49`, gesso `#FCF8F3` | Epilogue + Lexend | Quadrante radiale: la navigazione è un braccio di goniometro che ruota da 0° a 180°; ogni angolo è un contenuto (primo incontro, trattamenti, osteopatia, esercizi, prezzi, dove). Su mobile il quadrante diventa un mezzo cerchio in basso, sotto il pollice. | Ruotare il braccio del goniometro (trascinamento, rotella, frecce da tastiera): i gradi scorrono e il contenuto cambia. | SVG + CSS (poche foto dello studio) | **"La settimana a ruota"**: la settimana è un anello di 7 spicchi con le ore libere; ruoti fino a un posto e il sistema piazza anche il controllo a 7-10 giorni sullo stesso anello, così prenoti un piccolo ciclo e non una visita sola. | `concepts/15-novanta` |
| 16 | **EVIDENZIA** | Agenzia immobiliare | La pagina degli annunci del sabato: si legge con l'evidenziatore in mano. | carta di giornale `#E4DFD1`, nero stampa `#1C1C1A`, rosa evidenziatore `#EE5A9E`, retino `#8F8B82` | Libre Franklin + Newsreader | Una pagina di giornale larga, fitta di piccoli annunci (case vere di esempio). Si ingrandisce e si sposta; un annuncio aperto si stacca e diventa la scheda della casa con le foto. Su mobile è la colonna di un giornale piegato. | Passare l'evidenziatore sugli annunci: il tratto rosa resta, e ogni annuncio evidenziato entra nel "giro". | Tipografia + SVG (tratto) + foto nelle schede + mappa vera | **"Il giro del sabato"**: gli annunci evidenziati (fino a 4) diventano un percorso di visite del sabato mattina su una mappa vera, con gli orari già calcolati; lo mandi e l'agente conferma il giro. | `concepts/16-evidenzia` |
| 17 | **MADRE** | Panificio e pasticceria | Il lievito madre e la carta da zucchero: l'impasto vivo e la carta azzurra in cui si incartano le paste della domenica. | carta da zucchero `#9BB2C5`, farina `#F7F3EA`, crosta `#9C5B2A`, inchiostro `#2F3D4C` | Bricolage Grotesque + Karla | Vetrina orizzontale: si scorre di lato lungo il bancone (pani, poi dolci, poi le paste della domenica), con foto macro vere. In apertura, l'impasto vivo. | "La prova del dito": premi l'impasto e la fossetta torna su piano piano, come fa un impasto lievitato bene. | WebGL 3D (superficie morbida) + foto | **"Il pane fisso"**: un ordine che si ripete; trascini i pani sui giorni della settimana ("segale il martedì e il venerdì") e lo ritiri senza richiederlo ogni volta. Le paste della domenica si mettono a parte, su un vassoio. | `concepts/17-madre` |
| 18 | **SOTTOSCOCCA** | Officina e gommista | Il ponte sollevatore: per capire un'auto la si alza e la si guarda da sotto. | verde macchina utensile `#5E7564`, nero grasso `#1C1D1B`, bianco segnaletica `#F0EFE9` | Tektur + Red Hat Text | Verticale ma "ad altezze": scorrere alza l'auto sul ponte; a 0 cm si parla di gomme, a 80 cm di freni e sospensioni, a 180 cm si vede tutto il sottoscocca. Un'asta graduata sul lato dice a che altezza sei. | Alzare il ponte con lo scroll e toccare i punti del sottoscocca (gomme, freni, scarico, olio) per aprirne il prezzo e i tempi. | WebGL 3D (auto low-poly CC0) | **"Il ponte libero"**: la giornata dell'officina è un planning dei tre ponti; trascini il tuo blocco (lunghezza secondo il lavoro: cambio gomme 40', tagliando 1 h 30') in un buco libero. Il deposito gomme ha il suo numero. | `concepts/18-sottoscocca` |
| 19 | **NODI** | Liuteria | Le figure di Chladni: il liutaio mette foglie di tè sulla tavola di abete, la fa vibrare, e le foglie disegnano le linee dove la tavola sta ferma. | abete `#E6D4AC`, tè `#3B2B1D`, vernice `#8B3A1D`, ebano `#16120F` | IM Fell DW Pica + Spline Sans | Un unico oggetto: la tavola di un violino vista dall'alto, ferma al centro. Scorrendo, la tavola passa da un modo di vibrazione all'altro (modo 1, 2, 5) e ogni figura porta un contenuto (legni, costruzione, restauri, lista d'attesa). | "Accordare la tavola": trascini la frequenza e le foglie di tè si muovono fino a disegnare la figura; il suono è facoltativo, basso, solo se lo accendi. | WebGL (particelle) + Web Audio | **"La voce che vorresti"**: per un nuovo strumento scegli il carattere del suono su un piano a due assi (scuro/brillante, morbido/pronto) e senti una nota d'esempio; la richiesta parte con quella "voce" e la posizione in lista d'attesa. Per riparazioni: il sabato mattina di bottega aperta. | `concepts/19-nodi` |
| 20 | **IMBRUNIRE** | Albergo di sette stanze | Il palazzo tagliato in sezione come una casa di bambola all'ora in cui si accendono le luci; le date si scelgono sulle lune vere. | intonaco `#BE7359`, notte `#1F2638`, luna `#F2E8D0`, luce `#F2C77C` | Marcellus + Commissioner | Stanza esplorabile: il palazzo in sezione (tre piani, sette stanze, scala) riempie lo schermo; tocchi una stanza e la telecamera entra; dentro, le foto vere della stanza. | Entrare nelle stanze: zoom nella sezione, parete di fondo con la foto vera, e uscita all'indietro. | CSS 3D (scatole con foto) + foto | **"Scegli le lune"**: le notti sono un nastro di lune con le fasi vere delle date; trascini sulle notti che vuoi, nella sezione restano accese le stanze libere per quelle notti, tocchi la tua e indichi l'ora d'arrivo (la reception chiude alle 21). | `concepts/20-imbrunire` |

Distribuzione delle tecnologie: WebGL forte in 12, 17, 18, 19; Canvas 2D in
13; CSS 3D in 11 e 20; foto protagonista in 13, 14 e 16; SVG/CSS puro in 15.
Nessuno usa la leva "tieni premuto".

## 2. I dieci concept

### 11 · TAJUT (osteria di paese)

In Friuli "un tajut" è il bicchiere di vino all'osteria, e all'osteria si gioca
a briscola e tressette con le carte triestine: il mestiere è il tavolo, non il
menù. Il sito è quel tavolo di formica verde acqua degli anni Sessanta, visto
dall'alto; in basso hai la tua mano. Ogni carta è un contenuto: il piatto del
giorno (frico, musetto e brovada, cjarsons), il vino sfuso, gli orari, dove
siamo. La si trascina sul tavolo, si gira, si legge; si riprende in mano con un
gesto. È memorabile perché è un gioco che tutti in Friuli conoscono e perché la
prenotazione si fa calando tre carte. Da evitare: le figure (Fante, Cavallo,
Re) perché sono figure umane disegnate, si usano solo carte numerali e semi;
nessuna "lavagna" (era il bocciato VESPRO), nessun sito che cambia con l'ora;
nessuna tovaglia a quadri. Le foto dei piatti friulani vanno verificate: se su
Unsplash non c'è un frico vero, la carta mostra un'altra cosa vera o solo testo.

### 12 · SOTTOPELLE (studio di tatuaggi)

Chi cerca un tatuatore vuole vedere lavori, tanti, e lavori guariti, non
appena fatti. Il sito è una parete senza bordi da esplorare trascinando, come
il muro di un vero studio, e ogni tatuaggio arriva come una goccia di
inchiostro che si apre nell'acqua e poi si ferma. Il gotico variabile (Grenze
Gotisch) è la voce del mestiere senza cadere nel "tattoo flash" americano,
bilanciato da un grotesk molto pulito per le regole (igiene, età, caparra).
Memorabile: il gesto di esplorare e la scelta della misura con oggetti veri in
scala 1:1, che risolve la domanda più frequente ("quanto grande?"). Da evitare:
manichini e sagome del corpo (il bocciato LUCIDA e la regola di Luca), il
lucido/carta da ricalco già usato, i disegni flash disegnati da noi. Le foto
devono essere tatuaggi veri e guariti; niente macchinette in primo piano come
nel bocciato. La parete ha sempre una vista elenco accessibile da tastiera.

### 13 · CONTROPELO (barbiere)

Nel barbiere lo specchio è tutto: ci si guarda, ci si parla, e molti barbieri
ci scrivono sopra i prezzi a pennarello. Qui lo specchio è l'intera pagina,
appannato dal vapore dell'asciugamano caldo; col dito lo pulisci e dietro vedi
il salone vero (foto), con il listino scritto a mano sul vetro. Tre specchi
sono le tre poltrone: si passa dall'uno all'altro, ognuno con il suo barbiere.
Il turchese è quello del liquido dove stanno i pettini: un dettaglio che ogni
cliente riconosce. Memorabile: il gesto di pulire lo specchio e la lista
scritta sul vetro dove aggiungi il tuo nome. Da evitare: il "tabellone" e la
fila live del bocciato TRE POLTRONE (qui ci sono appuntamenti a mezz'ore
fisse, non una coda); il palo a strisce come decorazione; foto di parrucchieri
per signora. Il vapore ritorna lento e senza pulsazioni; con riduzione del
movimento lo specchio è già pulito.

### 14 · BATTIFILO (impresa edile e serramenti)

Chi deve ristrutturare ha una paura sola: quanto dura e quanto costa davvero.
Il sito risponde con la cronaca di un cantiere tipo, mese per mese, dallo
scavo alle chiavi: un cursore sul fondo scorre il tempo, la foto a tutto
schermo cambia fase, e per ogni fase c'è cosa si è fatto, chi c'era, quanto è
costata. La linea blu del battifilo è l'unico segno grafico, battuta sul
calcestruzzo mentre avanzi. Il carattere stencil è quello delle scritte a
spruzzo in cantiere. Memorabile: il tempo che si trascina e "Misura e manda",
che trasforma due numeri presi col metro a casa in un disegno in scala con il
prezzo. Da evitare: la casa in sezione "strato per strato" del bocciato FILO A
PIOMBO, il giallo cantiere, il configuratore 3D (è di MERIDIANA). Le foto
vengono da cantieri diversi: il testo lo dice ("un cantiere tipo"), non si
finge che sia la stessa casa.

### 15 · NOVANTA (fisioterapia e osteopatia)

Il fisioterapista misura il movimento in gradi, e il paziente vuole sapere
quando tornerà a fare un gesto normale. Il goniometro diventa la navigazione:
un braccio che ruota da 0° a 180° e porta da un contenuto all'altro, con i
gradi grandi e leggibili. Palette calda e morbida (albicocca e petrolio), che
non sa di ospedale e non somiglia al bianco-azzurro di LUME. Lexend è un font
nato per la leggibilità: scelta sensata per chi legge con dolore o fretta.
Memorabile: la pagina che ruota invece di scorrere, e la prenotazione che
fissa già il controllo sulla stessa ruota. Da evitare: la mappa del corpo
"tocca dove ti fa male" del bocciato SNODO e qualunque sagoma anatomica; il
widget clinico di LUME; il dolore da 0 a 10. Il quadrante deve funzionare da
tastiera (frecce) e con uno screen reader come un normale elenco.

### 16 · EVIDENZIA (agenzia immobiliare)

Chi cerca casa sfoglia annunci e ne segna alcuni: è il gesto vero del
mestiere, da prima di internet. Il sito è una pagina di annunci fitta e
tipografica (Libre Franklin è il carattere dei giornali, Newsreader è fatto per
leggere notizie), dove l'evidenziatore rosa è l'unico colore. Un annuncio
aperto si stacca dalla pagina e diventa una scheda con le foto vere, la
planimetria e il prezzo al metro quadro della zona (Borgomeduna, Torre, Rorai,
Cordenons, Porcia). Memorabile: evidenzi e il giro delle visite si costruisce
da solo su una mappa vera. Da evitare: la pianta col sole del bocciato QUATTRO
MURA, la foto di soggiorno in cornice, il bianco-nero-rosso di STUDIO FORMA (qui
la carta è grigia di giornale e l'accento è rosa fluo). La mappa è vera
(OpenStreetMap, rispettando le regole d'uso dei tile), mai disegnata. Su mobile
non si fa zoom su un foglio enorme: si legge una colonna.

### 17 · MADRE (panificio e pasticceria)

Il lievito madre è vivo, e il panettiere lo tocca per capire se è pronto:
premi e guardi quanto torna su. Questo gesto apre il sito, con un impasto in
WebGL che reagisce al dito. Poi la vetrina scorre di lato come il bancone:
pani, dolci, e le paste della domenica sul vassoio incartato nella carta da
zucchero, quella azzurra dei pasticcieri. Memorabile: la prova del dito e il
"pane fisso", che risponde al bisogno vero di chi compra ogni giorno. Da
evitare: gli orari del forno e "cosa c'è adesso" del bocciato INFORNATA, il
marrone su crema, i fumetti di farina che volano. L'azzurro è grigio e
polveroso, non l'azzurro vivo di LUME. Le foto macro vanno verificate una per
una (niente pane industriale in busta, niente croissant francesi spacciati per
brioche friulane); gubana e pinza solo se la foto è davvero quella.

### 18 · SOTTOSCOCCA (officina e gommista)

In officina la verità sta sotto la macchina, e il cliente non la vede mai. Qui
scorrendo alzi il ponte: l'auto sale e a ogni altezza si parla di quello che
si vede (gomme a terra, freni a mezza altezza, sottoscocca in alto). Il verde è
quello dei vecchi torni e trapani a colonna, il bianco è quello delle linee
sul pavimento. Tektur ha la geometria delle targhette tecniche. Memorabile:
l'auto che sale e il planning dei tre ponti dove trascini il tuo lavoro in un
buco libero, capendo subito quanto tempo serve. Da evitare: il libretto e le
spie del cruscotto del bocciato CHIAVE DEL TREDICI, l'arancio e il nero
"racing", i riflessi cromati da concessionaria. Il modello 3D deve essere CC0
(per esempio Kenney o Poly Pizza) e leggero; senza WebGL la pagina mostra la
stessa storia con foto vere di auto sul ponte.

### 19 · NODI (liuteria)

Il liutaio accorda la tavola prima di chiudere lo strumento: la fa vibrare, e
foglie di tè o brillantini si raccolgono dove il legno sta fermo, disegnando
figure. È un gesto reale, poco noto e bellissimo. Il sito è quella tavola di
abete al centro dello schermo; scorrendo o trascinando la frequenza le foglie
si spostano e disegnano i modi 1, 2 e 5. IM Fell riprende i cartigli stampati
dentro gli strumenti antichi; Spline Sans porta i numeri (Hz, spessori). La
richiesta di un nuovo strumento parte da un piano del suono che fa sentire la
voce scelta. Da evitare: lo strumento che si apre a pezzi del bocciato ANIMA,
il marrone scuro con l'oro, la foto della pialla in cornice. Il suono non
parte mai da solo, è basso e si spegne con un tocco; le particelle si muovono
lente, niente sfarfallii.

### 20 · IMBRUNIRE (albergo di sette stanze)

Un albergo di sette stanze si sceglie per la stanza, non per la catena. Il
palazzo è mostrato in sezione, come una casa di bambola all'ora in cui si
accendono le luci: tre piani, la scala, sette stanze diverse. Tocchi una stanza
e ci entri: la parete di fondo è la foto vera. Le notti si scelgono su un
nastro di lune con le fasi vere delle date: un calendario che nessun altro
albergo ha e che parla di sera, di viaggio, di arrivo. Marcellus ha le capitali
delle iscrizioni sui portali; Commissioner è sobrio per orari e regole.
Da evitare: la bacheca delle chiavi e i ganci del bocciato SETTE CHIAVI; il cielo
sfumato in viola; le finestre che si accendono di colpo (sempre dissolvenza
lenta). La sezione è costruita in CSS con scatole semplici, non disegnata a
mano, e su mobile i piani si impilano in verticale.

## 3. Verifica incrociata

| Coppia | Possibile somiglianza | Come è stata evitata |
|---|---|---|
| 13 CONTROPELO / 12 SOTTOPELLE | Entrambi scuri, entrambi rivelano immagini con il gesto. | 13 è grafite fredda con turchese, 12 nero caldo con rosso. 13 si pulisce con il dito (maschera che torna), 12 si esplora trascinando e le immagini sbocciano da sole. 13 è un solo schermo, 12 una parete infinita. |
| 13 CONTROPELO / bocciato TRE POLTRONE | "Lista" delle persone dal barbiere. | Nessun contatore live né attesa in minuti: appuntamenti a mezz'ore fisse scritti a mano sullo specchio. |
| 14 BATTIFILO / 17 MADRE | Entrambi si muovono in orizzontale. | 14 ha una sola foto a tutto schermo e un cursore del tempo; 17 è una fila di prodotti che si scorre. Palette opposte (grigio + cobalto contro azzurro polvere + crosta). |
| 14 BATTIFILO / 16 EVIDENZIA | Carte grigie calde (calcestruzzo e giornale). | 14 è grigio medio con accento cobalto e foto piena; 16 è grigio chiaro fitto di testo con rosa fluo. Nessun elemento grafico in comune. |
| 14 BATTIFILO / 1 MERIDIANA | Strumento che calcola un prodotto su misura. | 14 è un disegno 2D in scala con una forbice di prezzo, niente 3D e niente materiali da ruotare. |
| 17 MADRE / 9 LUME | Azzurro. | 9 è azzurro vivo `#5B9BD5` come accento su bianco; 17 è carta da zucchero `#9BB2C5`, grigia e polverosa, come fondo. |
| 11 TAJUT / 18 SOTTOSCOCCA | Due verdi. | 11 è verde acqua chiaro e brillante (formica), 18 è verde grigio medio (macchine utensili). Struttura e tecnologia lontanissime (carte CSS contro 3D a scroll). |
| 11 TAJUT / 2 QUOTA TREMILA e 10 IMPRONTA | Verdi scuri. | 11 non ha verdi scuri: l'inchiostro è prugna. |
| 11 TAJUT / 20 IMBRUNIRE | CSS 3D in entrambi. | 11 gira carte piatte su un tavolo; 20 costruisce un ambiente in cui si entra. |
| 12 SOTTOPELLE / 19 NODI | Accento rosso. | 12 rosso vivo su nero; 19 rosso vernice bruno su abete chiaro. Rosso in 12 solo sui bottoni, in 19 solo sulle cifre. |
| 12 SOTTOPELLE / 4 STUDIO FORMA | Nero + rosso. | 4 è bianco dominante, svizzero, senza foto; 12 è nero dominante, gotico, pieno di foto. |
| 12 SOTTOPELLE / 7 CONTROLUCE | Galleria scura di foto. | 7 è una galleria lineare in bianco e nero senza accento; 12 è una parete libera in due dimensioni con accento rosso e font gotico. |
| 15 NOVANTA / 20 IMBRUNIRE | Toni caldi rosati. | 15 è albicocca chiaro con petrolio; 20 è terracotta media con blu notte. |
| 15 NOVANTA / 9 LUME | Sanità, fiducia, calma. | Niente bianco-azzurro, niente chip, niente foto sorridente in cornice: palette calda e navigazione a quadrante. |
| 16 EVIDENZIA / 20 IMBRUNIRE | Scegliere un "posto" (casa, stanza). | 16 si sceglie leggendo e segnando; 20 si sceglie entrando nello spazio. |
| 16 EVIDENZIA / 14 BATTIFILO | Mappa. | La mappa vera c'è solo in 16. In 14 il contatto è un disegno in scala. |
| 17 MADRE / 6 MERIGGIO | Dolci, tono affettuoso. | 6 è pastello rosa/salvia su crema con illustrazione; 17 è carta da zucchero, foto vere, impasto in 3D, nessun disegno. |
| 17 MADRE / 1 MERIDIANA | Oggetto 3D in apertura. | In 17 l'impasto è una superficie morbida da premere, non un oggetto da smontare, e dopo la prima schermata la pagina è fotografica. |
| 18 SOTTOSCOCCA / 1 MERIDIANA | 3D protagonista. | 1 ruota e smonta un oggetto in un configuratore; 18 alza un'auto lungo lo scroll e la guarda da sotto. Palette e font lontani. |
| 18 SOTTOSCOCCA / 15 NOVANTA | Prenotazione "a tempo" su griglia. | 18 è un planning lineare dei tre ponti con blocchi di lunghezza diversa; 15 è un anello settimanale che piazza due appuntamenti. |
| 19 NODI / 3, 6, 8 (carte chiare) | Fondo chiaro caldo. | L'abete `#E6D4AC` è più saturo e dorato delle creme di 3, 6, 8, ed è una superficie di legno in WebGL, non carta. |
| 19 NODI / bocciato ANIMA | Suono dello strumento. | Il suono è secondario e facoltativo; il cuore è la figura di foglie di tè. Nessuno smontaggio. |
| 19 NODI / 10 IMPRONTA | Un solo "foglio" in WebGL. | 10 è rilievo a luce radente su carta; 19 sono particelle che si spostano su legno. Tipografia opposta (larga variabile contro cartiglio antico). |
| 20 IMBRUNIRE / bocciato SETTE CHIAVI | "Libera o occupata" a colpo d'occhio. | Le date si scelgono sulle lune e le stanze libere restano accese dentro un palazzo esplorabile; niente ganci, niente chiavi, niente bacheca. |
| 20 IMBRUNIRE / 1 e 3 (blu notte) | Blu scuro. | In 20 il blu notte è il cielo di fondo della sezione, con terracotta e luce calda; in 1 e 3 è testo su crema. |
| Prenotazioni, tutte | Stesso form ricolorato. | Nessuna è un form a passi con cartolina o scontrino: tre carte (11), misura con oggetti (12), nome sullo specchio (13), disegno in scala (14), anello settimanale (15), percorso su mappa (16), ordine ricorrente (17), planning dei ponti (18), piano del suono (19), nastro di lune (20). |
| Font, tutti | Famiglie ripetute. | 21 famiglie diverse (compresa Mansalva solo in 13); nessuna tra quelle vietate. Solo 11 (Literata) e 16 (Newsreader) hanno un serif di testo, e sono famiglie diverse. |
| Strutture, tutte | Scroll verticale a sezioni. | Solo 18 scorre in verticale, e lo scroll ha un significato (l'altezza del ponte). Gli altri: tavolo (11), parete libera (12), specchio fisso (13), cursore del tempo (14), quadrante (15), giornale (16), vetrina orizzontale (17), tavola unica (19), sezione esplorabile (20). |

## 4. Regole comuni per chi costruisce

- Prima schermata: mai testo a sinistra e foto in cornice a destra, mai la
  riga di numeri tra due filetti, mai "TAV. I".
- Ogni gesto firma ha un'alternativa: tastiera, vista elenco o bottoni, e una
  versione ferma con `prefers-reduced-motion`.
- Niente lampeggi: luci, vapore, inchiostro e particelle cambiano in dissolvenza
  lenta (al massimo 2-3 cambi al secondo, come in IMPRONTA).
- Foto da Unsplash scaricate e guardate una per una; se il soggetto non è
  giusto, meglio nessuna foto.
- Niente figure umane disegnate (vale anche per le figure delle carte in 11 e
  per le sagome anatomiche in 15).
- Testi in italiano vero, con luoghi di Pordenone e dintorni; prezzi e orari di
  esempio verosimili, nessun dato legale inventato.
- 375 px pensato per primo per 11, 13, 15, 17 e 19, dove il gesto si fa col
  pollice.
