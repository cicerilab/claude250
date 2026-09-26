# Creative director · Concept 11 · Osteria di paese

Ondata 0. Rotta `/concept-11`. Cartella `concepts/11-tajut/`. Documento di
direzione per tutti gli agent delle ondate successive: tutto ciò che sta sotto
"4. La direzione nel dettaglio" è vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 11, paragrafo
TAJUT, verifica incrociata, regole comuni), `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 0, 1, 4, 9), `concepts/10-torchio/docs/creative-director.md` (solo
come livello e formato), screenshot del vecchio `docs/concept-attuali/concept-11.jpg`.

La direzione non si sceglie qui: è assegnata dalla matrice (TAJUT, il tavolo
di formica con le carte triestine). Le tre varianti del punto 2 sono tre modi
di eseguire **la stessa** direzione.

---

## 0. Da dove si parte

**Il vecchio 11 (VESPRO)**: fondo crema a quadretti, serif corsivo con "ora" in
rosso, righe di orari tra filetti, foto della sala a destra con "Tav. I", due
bottoni, e l'idea del sito che cambia con l'ora e della lavagna. Tutto questo
è vietato nel nuovo 11: niente crema come fondo, niente serif corsivo nei
titoli, niente lavagna, niente ora vera, niente split testo/foto.

**Vincoli dalla matrice**
- Palette: formica `#A8D5C5`, carta `#FBF6EA`, ocra `#D69A2D`, prugna `#2B2238`.
- Font: *Bagel Fat One* (display) + *Literata* (testo).
- Struttura: un solo schermo, il tavolo visto dall'alto, la mano in basso,
  niente scroll di pagina.
- Firma: trascinare/lanciare una carta sul tavolo, che si gira e si apre.
- Tecnologia: CSS 3D (flip) + SVG dei semi + foto sulle facce.
- Prenotazione: **"Cala le tre carte"** (giorno, ora, quanti siete); l'oste
  risponde con la sua carta e il numero del tavolo.
- Vietato: figure (Fante, Cavallo, Re), lavagna, sito che cambia con l'ora,
  tovaglia a quadri, verdi scuri.

**Vicini pericolosi (da tenere lontani)**
- 13 CONTROPELO: anche lui un solo schermo senza scroll. Distanza: 13 è scuro,
  verticale, una superficie da pulire; 11 è chiaro, visto dall'alto, fatto di
  oggetti da spostare.
- 15 NOVANTA: su mobile ha un mezzo cerchio in basso sotto il pollice. **Una
  mano di carte a ventaglio rischia di sembrare lo stesso quadrante.** Regola:
  la mano di TAJUT non è mai un arco regolare che ruota, è una fila di carte
  sovrapposte con inclinazioni irregolari (vedi 4.3); non si "gira" la mano per
  navigare, si prende una carta.
- 20 IMBRUNIRE: anche lui CSS 3D. Distanza: in 11 la telecamera non si muove mai
  e non si entra in niente; le carte sono piatte, restano sul piano del tavolo.
- 10 IMPRONTA: carta come materiale. Distanza: in 11 la carta è piccola, stampata
  a due colori, lucida e sottile, mai in rilievo, mai luce radente.
- 6 MERIGGIO: tono affettuoso con colori chiari. Distanza: nessun pastello rosa,
  nessuna illustrazione; il verde acqua è un laminato industriale anni Sessanta.

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina di un'osteria di paese in provincia di
Pordenone per chi cerca dove bere un tajut, mangiare il frico e trovare un posto
il venerdì sera, with a linguaggio da gioco da tavolo vero (carte triestine,
formica anni Sessanta, stampa a due colori), leaning toward un solo schermo in
CSS 3D con oggetti fisici da spostare, SVG geometrici per i semi e poche foto
vere sulle facce delle carte.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **8** | Nessuna colonna, nessuna sezione: la composizione nasce da dove cadono le carte. Non 9-10: il cliente dell'osteria ha 60 anni e deve trovare orari e telefono in due tocchi. |
| `MOTION_INTENSITY` | **6** | Il movimento è fisico e raro: una carta lanciata, un giro, un appoggio. Niente di continuo, niente che si muova da solo dopo l'apertura. |
| `VISUAL_DENSITY` | **3** | Un tavolo con poche cose sopra. Una carta aperta per volta, leggibile come un menù scritto a mano sul retro di un foglio, ma in stampa. |

---

## 2. Tre varianti di esecuzione (stessa direzione)

Le tre varianti hanno tutte formica, carte triestine, Bagel Fat One + Literata,
un solo schermo, lancio e giro, "Cala le tre carte". Cambia **come si tiene la
mano** e quindi come si trovano i contenuti.

### Variante A · BRISCOLA A TRE

- **Come funziona**: come nella briscola vera, in mano hai sempre tre carte.
  Ne giochi una, si apre sul tavolo, e peschi dal mazzo la successiva. I
  contenuti arrivano nell'ordine del mazzo (cucina, vino, orari, dove, torneo,
  l'oste). La briscola (la carta scoperta sotto il mazzo) è il piatto del giorno.
- **Pro**: la più fedele al gioco; la mano da tre è identica alla mano della
  prenotazione, quindi il gesto si impara prima di prenotare.
- **Contro**: il contenuto dipende dall'ordine di pesca. Chi cerca solo gli
  orari può doverne giocare quattro prima di trovarli. Serve comunque un indice,
  che smentisce il gioco. Su 375 px funziona benissimo (tre carte grandi), ma è
  un sito che fa aspettare.

### Variante B · LA MANO DELL'OSTE (scelta)

- **Come funziona**: in mano hai sei carte, tutte visibili, ognuna con il suo
  seme e il suo numero, e ognuna dice cosa contiene. Il mazzo sta sul tavolo con
  la briscola scoperta sotto (il piatto del giorno, sempre in vista senza
  toccare niente). Giochi la carta che vuoi; quelle giocate restano sul tavolo,
  scoperte, in una "presa" che si allarga. Quando prenoti, la mano di sei si
  ripone e ti arrivano **tre** carte: la mano da briscola, quella per calare.
- **Pro**: si trova tutto in un tocco; il gioco resta vero (il seme e il numero
  hanno un senso, vedi 4.2); la prenotazione diventa un cambio di mano, un
  momento a sé, riconoscibile.
- **Contro**: sei carte a 375 px vanno sovrapposte con cura (risolto in 4.8);
  va evitato il ventaglio regolare che ricorda NOVANTA.

### Variante C · TAVOLO STESO

- **Come funziona**: le carte sono già tutte sul tavolo, coperte, sparse come a
  fine partita. Si girano toccandole. La mano in basso c'è solo per la
  prenotazione.
- **Pro**: colpo d'occhio forte in apertura, zero istruzioni.
- **Contro**: diventa un memory, cioè una griglia di rettangoli coperti: una
  bento grid travestita. Il lancio (la firma) sparisce, resta solo il giro. Su
  375 px le carte diventano piccole e illeggibili, o il tavolo va scrollato.

### La scelta: B, LA MANO DELL'OSTE

1. **Serve chi ha fretta**: orari, telefono e "dove siete" sono a un tocco,
   scritti sulla carta in mano. Il gioco non si mette mai in mezzo tra il
   cliente e l'informazione.
2. **Tiene il gesto firma al centro**: ogni contenuto si ottiene lanciando una
   carta sul tavolo; il tavolo si riempie di quello che hai letto, come una
   partita vera che lascia la sua presa.
3. **Rende la prenotazione un momento di gioco vero**: il passaggio da sei a tre
   carte è il passaggio da "guardo" a "mi siedo". Tre carte è la mano della
   briscola: chi ci ha giocato lo sente subito.
4. **Prende da A la cosa migliore**: la briscola scoperta sotto il mazzo è il
   piatto del giorno, visibile senza fare nulla.

---

## 3. La metafora sviluppata

In Friuli "un tajut" è un bicchiere di vino, e ordinarlo vuol dire sedersi.
All'osteria di paese il cuore non è la cucina ma il tavolo: di formica verde
acqua con il bordo in alluminio rigato, un mazzo di carte triestine consumate
col dorso stampato dall'osteria, il bicchiere che lascia un cerchio, il
foglietto dei punti con la matita. Il sito è quel tavolo visto dall'alto, e
l'utente è il quarto che si siede.

Il vocabolario del gioco diventa il vocabolario del sito:

| Nel gioco | Nel sito |
|---|---|
| **La mano** | le sei carte in basso: cosa puoi sapere |
| **Il mazzo** | la pila coperta in alto a sinistra, dorso stampato "Al Tajut": è il marchio |
| **La briscola** | la carta scoperta sotto il mazzo: il piatto del giorno |
| **Giocare una carta** | aprire un contenuto |
| **La presa** | le carte già giocate, scoperte sul tavolo: la cronologia |
| **Riprendere in mano** | chiudere un contenuto |
| **Calare** | inviare la prenotazione |
| **L'oste che risponde** | la conferma, con il numero del tavolo |
| **Il foglietto dei punti** | i due campi (nome, telefono) della prenotazione |

**Seme e numero non sono decorazione: hanno una regola.** Il numero della carta
è il numero di cose che ci sono scritte sopra; il seme dice di che cosa si
parla. Chi guarda la carta sa quanto è lunga prima di aprirla.

- **Spade** = la cucina (il coltello del salame, il taglio).
- **Coppe** = il vino.
- **Denari** = il tempo: orari e giorni (la moneta tonda come un quadrante di
  una volta; niente orologi disegnati).
- **Bastoni** = la strada: dove siamo, come si arriva, e il paese.

Solo carte numerali da 1 a 7: nelle triestine 8, 9 e 10 sono le figure, e le
figure non si usano. Anche questo ha un senso: **l'osteria ha sette tavoli**,
numerati da 1 a 7, e il tavolo che l'oste ti dà è una carta numerale.

---

## 4. La direzione nel dettaglio

### 4.1 Sistema visivo (base per art-director)

**Palette (dalla matrice, raffinata)**

| Ruolo | Colore | Uso |
|---|---|---|
| Formica | `#A8D5C5` | fondo: tutto il tavolo, a tutto schermo |
| Formica, puntinato | `#97C8B7` e `#BBE0D3` | granitura finissima del laminato (2-3% di opacità reale, non un motivo) |
| Alluminio del bordo | `#C4C8C4` con righe `#AEB3AF` | bordo rigato del tavolo, 10-14 px, solo sui lati lunghi |
| Carta | `#FBF6EA` | solo le facce delle carte e il foglietto dei punti, mai il fondo |
| Prugna | `#2B2238` | inchiostro: testo, semi, dorso delle carte, contorni |
| Ocra | `#D69A2D` | unico accento: secondo colore di stampa dei semi, il bottone di prenotazione, la carta dell'oste |
| Ombre | prugna `#2B2238` al 14-22% | ombre delle carte sul tavolo, mai nere |

Regole di colore:
- La carta `#FBF6EA` è vicina alle creme vietate: si giustifica perché è
  **piccola** (una carta di 58×110 mm) e circondata dal verde acqua. Mai più del
  35% dello schermo è carta, nemmeno con una carta aperta.
- Le carte sono stampate **a due colori soli**, prugna e ocra, come le edizioni
  economiche da osteria. Niente rosso e blu delle triestine vere: la
  riconoscibilità viene dalla forma dei semi e dalla doppia testa della carta,
  non dai colori.
- L'ocra non è mai colore di testo su carta o su formica (contrasto
  insufficiente): solo campiture, semi, bottone con testo prugna.
- Nessun verde scuro in nessun punto (vincolo di matrice). Il verde è solo
  quello chiaro del laminato.

**Tipografia**
- *Bagel Fat One*: marchio "Al Tajut" sul dorso delle carte, indici d'angolo
  delle carte (il numero grande), titolo di ogni carta aperta, numero del tavolo
  nella risposta dell'oste. Mai per frasi più lunghe di 4 parole. Nessuna
  lettera spaziata, nessun maiuscolo tutto: Bagel è già gridato, va usato
  minuscolo o in maiuscola iniziale.
- *Literata* (asse opsz): tutto il testo di lettura sulle facce, 16-17 px su
  mobile, 17-18 px su desktop, interlinea 1.45. Corsivo di Literata ammesso
  **solo** per i nomi friulani dei piatti (*cjarsons*, *frico*, *musêt e
  brovade*), come si fa nei menù veri; mai nei titoli.
- Prezzi e orari in Literata con cifre tabellari (`font-variant-numeric:
  tabular-nums lining-nums`). Niente monospace.

**Forme**
- Carte con angoli arrotondati veri, raggio 6% della larghezza (circa 5-8 px):
  è l'unico raggio del sito, perché è quello del cartoncino tagliato. Il resto
  (bottone, campi del foglietto) prende lo stesso raggio: un solo raggio.
- Proporzione carta: 1 : 1.9 (triestine 58×110 mm). Mai carte quadrate o di
  proporzione da poker.
- La faccia di ogni carta è **a doppia testa**, come le triestine: indice in
  alto a sinistra e, ruotato di 180°, in basso a destra. Il contenuto
  leggibile sta nel campo centrale, dritto.

### 4.2 Le schermate (struttura vera: un tavolo, non sezioni)

Non c'è scroll di pagina. Ci sono **stati del tavolo**. Tutto è sempre nello
stesso schermo (`100dvh`).

**Stato 0 · Il tavolo apparecchiato (apertura)**
- Il tavolo riempie lo schermo, bordo di alluminio sui lati lunghi.
- In alto a sinistra: **il mazzo** (dorso prugna con "Al Tajut" in Bagel ocra) e,
  messa di traverso sotto, **la briscola scoperta**: il piatto del giorno con la
  foto (se verificata) e il prezzo. Si legge senza toccare nulla.
- In alto a destra, sul lato dell'oste: il suo posto, vuoto, con il bicchiere
  (foto ritagliata dall'alto o, piano B, solo il cerchio di vino lasciato sul
  laminato, un anello ocra al 20%). Qui arriverà la sua carta.
- Sul tavolo, in chiaro, i soli testi dell'apertura (massimo 4 elementi):
  1. il nome **Al Tajut** in Bagel Fat One, stampato come sul dorso, grande;
  2. una riga in Literata, massimo 16 parole: "Osteria a Valvasone. Vino
     sfuso, frico, e un tavolo libero per la briscola." (paese esempio: lo
     conferma il copywriter; Valvasone o San Quirino);
  3. il bottone unico **"Prenota un tavolo"** (ocra, testo prugna);
  4. niente altro. Niente orari in piccolo, niente numeri, niente occhiello.
- In basso: **la mano**, sei carte scoperte (vedi 4.3 per la disposizione).
- In basso a sinistra (sotto 640 px) o in alto a sinistra (desktop) il
  `ConceptBackButton` condiviso del sito: va lasciato libero, il mazzo si
  sposta di conseguenza.

**Stato 1 · Una carta giocata (la lettura)**
- La carta vola dalla mano al centro del tavolo, si gira, si appoggia, e si
  "apre": cresce fino alla misura di lettura (desktop circa 380×720 px
  proporzionata all'altezza della finestra; mobile vedi 4.8). Il resto del tavolo
  si abbassa di tono di poco (velo formica al 30%), non si oscura.
- Chiudi: gesto di ripresa (trascini la carta verso la mano), tasto "Riprendi"
  sulla faccia, Esc, o tocco su un'altra carta della mano (che la sostituisce).
- Quando una carta viene sostituita o chiusa, **non torna in mano**: va nella
  presa, a destra del centro, scoperta e piccola, ruotata a caso tra -8° e 8°.
  La presa si ritocca per riaprire. "Riprendi in mano" (bottone nella presa)
  rimette tutto in mano in ordine.

**Le sei carte della mano (contenuti)**

| Carta | Seme e numero | Contenuto (il numero = quante cose ci sono) | Foto sulla faccia |
|---|---|---|---|
| **In cucina oggi** | Tre di spade | tre piatti fissi: *frico* con polenta, *musêt e brovade*, *cjarsons*; ognuno con prezzo e una riga | sì, una, se verificata (frico o polenta) |
| **Il vino sfuso** | Cinque di coppe | cinque vini al tajut: Friulano, Ribolla gialla, Refosco dal peduncolo rosso, Merlot, Verduzzo; prezzo al tajut (1,40-2,60 €) e al quarto | sì: bicchieri o caraffa di bianco |
| **Quando siamo aperti** | Sei di denari | sei giorni aperti, uno per riga, con le ore; "lunedì chiuso" in fondo, fuori dal conto | no: solo pips e testo |
| **Dove siamo** | Quattro di bastoni | quattro cose: indirizzo di esempio, parcheggio in piazza, autobus da Pordenone, link "Apri in Maps" (mappa vera esterna, mai disegnata) | sì: una strada o una piazza di paese friulano, se verificata |
| **La briscola del giovedì** | Due di coppe | due righe: il torneo a coppie del giovedì sera, come ci si iscrive (al banco o prenotando "per il torneo") | no |
| **L'oste** | Asso di bastoni | una cosa sola: chi tiene l'osteria, in tre righe, senza ritratto e senza firma disegnata | no, o solo un interno vero del banco |

La **briscola** (piatto del giorno, fuori dalla mano) è il **Sette di spade** o
altra carta di spade secondo il giorno; il copywriter fissa un piatto del
giorno d'esempio (per esempio "polenta e *toç in braide*"). Non cambia con l'ora
vera: è un contenuto fisso d'esempio.

**Stato 2 · La mano da tre (prenotazione)** vedi 4.4.

**Vista elenco "Leggi come un menù"**
- Link testuale piccolo, fisso in basso a destra del tavolo (sopra la mano su
  desktop, in cima alla mano su mobile). Porta a una versione piatta: le sette
  carte (briscola compresa) una sotto l'altra come facce leggibili, in ordine
  fisso, con la prenotazione in fondo come normale gruppo di tre scelte +
  foglietto. Qui (e solo qui) si scorre.
- È anche la versione prerender / senza JS e la base per i lettori di schermo.
  Il tavolo è un modo di presentare questo DOM, non un DOM diverso.

### 4.3 Interazione firma: "Gioca la carta"

**La mano**
- Sei carte in fila sovrapposta, **non un arco**: ogni carta ha una rotazione
  fissa ma irregolare (per esempio -5°, -1°, 3°, -2°, 4°, 1°) e un leggero
  sfalsamento verticale di pochi pixel, come una mano tenuta da una persona. La
  mano non ruota, non scorre come una ruota, non ha un centro di rotazione.
- Ogni carta in mano mostra: indice d'angolo (numero in Bagel + seme), e in
  alto il titolo breve ("il vino"). Si capisce senza giocarla.
- Hover (solo puntatore fine) o focus: la carta si alza di 18-24 px e si
  raddrizza. Sulle altre nulla.

**Il lancio**
- Si prende una carta e la si trascina verso il tavolo; al rilascio parte con la
  velocità del gesto (flick). Se il gesto è debole, la carta torna in mano.
- Durante il volo la carta **si gira** (rotateY 0→180°, con un leggero rotateX
  per dare peso), attraversa il tavolo e si appoggia al centro con una rotazione
  residua casuale tra -4° e 4°, poi si raddrizza a 0° mentre si apre.
- Atterraggio: una sola piccola frenata con 1-2% di assestamento, e l'ombra che
  si stringe (la carta è arrivata al piano). Niente rimbalzi multipli, niente
  vibrazioni.
- Durata complessiva 520-700 ms secondo la distanza. Curva: veloce all'inizio,
  frenata lunga alla fine (tipo `cubic-bezier(.2,.7,.2,1)` o molla smorzata
  critica). Un solo evento di movimento per volta.
- **Tocco semplice = lancio automatico**: toccare una carta in mano la gioca
  con la stessa traiettoria. Il trascinamento è il piacere, il tocco è la via
  normale. Nessuno deve scoprire il gesto per usare il sito.

**La ripresa**
- Carta aperta trascinata verso il basso oltre il 25% dell'altezza: torna in
  mano girandosi al contrario. Oppure bottone "Riprendi" sulla faccia, Esc, o
  tocco sul tavolo vuoto.

**Suono**: nessuno. Nemmeno facoltativo (il suono facoltativo è di 19 NODI).

**Tecnica (per tech-architect, non codice)**
- CSS 3D puro: `perspective` sul tavolo (grande, 1600-2200 px, quasi zenitale,
  così le carte non sembrano inclinate), carte con `transform-style:
  preserve-3d`, faccia e dorso con `backface-visibility: hidden`.
- Fisica minima scritta a mano (molla smorzata in `requestAnimationFrame`) o
  Web Animations API. GSAP non necessario. Nessun Lenis (non c'è scroll).
- Pointer Events unificati (mouse, dito, penna), `touch-action: none` solo sulle
  carte, mai sul tavolo intero (il browser deve poter fare zoom).
- Al massimo una carta in volo; gli input durante il volo si accodano, non si
  sommano.

### 4.4 Meccanica unica di prenotazione: "Cala le tre carte"

**Ingresso**
- Si entra solo dal bottone "Prenota un tavolo" (unico intento di
  prenotazione in tutto il sito; nelle carte "Quando siamo aperti" e "La
  briscola del giovedì" c'è un link testuale che porta allo stesso stato, non un
  secondo bottone).
- Le sei carte della mano scivolano via verso il basso e la presa si raccoglie
  in un mucchietto; dal mazzo arrivano **tre carte** coperte che si girano da
  sole in mano, una dopo l'altra (intervallo 120 ms). Ora la mano è quella della
  briscola.

**Le tre carte** (grandi, dritte, affiancate, ognuna con la sua regola)

| Carta | Seme | Cosa mostra | Come si cambia |
|---|---|---|---|
| **Il giorno** | denari | giorno della settimana in Bagel ("sabato"), sotto la data in Literata ("11 ottobre") | tocco sulla carta = giorno aperto successivo; frecce ‹ › sotto la carta per avanti e indietro; salta il lunedì; 21 giorni in avanti al massimo |
| **L'ora** | denari | l'ora in Bagel ("20.00") e "a cena" / "a pranzo" | tocco = mezz'ora successiva nelle fasce vere (12.00-13.30, 19.00-21.00); frecce ‹ › |
| **Quanti siete** | coppe | **il numero è la carta**: da 1 a 7 persone, e la faccia mostra quel numero di coppe | tocco = uno in più; frecce ‹ ›; dopo il 7 la carta diventa "Otto o più? Chiamaci" con il telefono d'esempio come link |

Ogni carta è un `button` con nome accessibile che dice valore e azione ("Il
giorno: sabato 11 ottobre. Tocca per il giorno dopo"). Le frecce hanno area
tattile di 44 px.

**Il foglietto dei punti**
- Accanto alle tre carte (desktop) o sopra la mano (mobile), il foglietto con
  cui all'osteria si segnano i punti: carta `#FBF6EA`, una riga a matita.
  Due campi veri: **A che nome** e **Un telefono** (etichetta sopra il campo,
  errore sotto, niente placeholder come etichetta), più una casella facoltativa
  "veniamo per il torneo del giovedì" (visibile solo se il giorno è giovedì).
- Non è una lavagna e non è gesso: è carta e matita, Literata normale.

**Calare**
- Si calano le tre carte **insieme**: trascinandone una qualsiasi verso il
  tavolo (le altre seguono) oppure col bottone "Cala le tre carte" sotto la
  mano. Le tre carte scivolano al centro, coperte, in fila.
- **Invio in corso**: dal lato dell'oste arriva una carta coperta col dorso
  ocra e resta lì, ferma, finché la risposta non c'è (demo: 700-1100 ms). Niente
  spinner, niente puntini che pulsano. `aria-busy` sul gruppo.

**Stati obbligatori**

- **Vuoto (all'ingresso)**: le tre carte non sono mai bianche. Arrivano già
  giocabili con valori sensati: la prima sera aperta a partire da domani,
  20.00, 2 persone. Sotto la mano una sola riga: "Tocca una carta per
  cambiarla, poi calale." Il foglietto è vuoto con le etichette visibili.
- **Errore di compilazione**: nome vuoto o telefono non valido. Le tre carte
  non partono: tornano in mano con una piccola spinta indietro (una volta, 200
  ms, nessuna scossa ripetuta) e sotto il campo sbagliato compare il messaggio
  ("Scrivi un nome, ci basta quello." / "Il numero sembra corto: controlla le
  cifre."). Il focus va al primo campo sbagliato.
- **Errore di disponibilità (il tavolo non c'è)**: l'oste non gira una carta
  col numero; gira una carta **di scarto** con due proposte vere (esempio:
  "Sabato alle 20 per sei siamo pieni. Alle 21.00 c'è posto, o domenica alle
  20."). Le proposte sono due bottoni: toccarne una cambia la carta relativa in
  mano e rimette le carte in mano pronte a essere ricalate. I dati di pieno
  sono finti e dichiarati come esempio (tabella fissa, due o tre combinazioni
  piene: venerdì e sabato 20.00 dai 5 in su, giovedì dopo le 20.30 per il
  torneo).
- **Lunedì**: non si può scegliere (la carta del giorno lo salta). Se ci si
  arriva da tastiera con le frecce, la carta dice "lunedì siamo chiusi" e passa
  a martedì.
- **Errore di invio (rete)**: la carta coperta dell'oste torna indietro, le tre
  carte tornano in mano, e sul tavolo una frase: "Non ci è arrivata. Riprova, o
  chiamaci allo 0434 ..." (numero d'esempio del copywriter, cliccabile).
- **Successo**: l'oste gira la sua carta. È una carta numerale di **ocra e
  prugna** col numero del tavolo (da 1 a 7) grande in Bagel Fat One e i semi
  corrispondenti ("il cinque": cinque denari). Sotto, sulla faccia, in Literata,
  una o due righe dell'oste: "Tavolo 5, quello vicino alla stufa. Sabato 11
  alle 20, in quattro, a nome Bortolin. Se tardate più di mezz'ora, fateci uno
  squillo." Poi le quattro carte (tre tue + la sua) si raccolgono in **una
  presa** che resta in un angolo del tavolo per tutta la visita; toccarla
  rilegge i dati. Si chiude con "Torna alle carte". `track("demo_prenotazione")`
  una volta sola qui.
- **Niente cartolina, scontrino, ricevuta, biglietto, busta, confetti**. La
  conferma è una carta del mazzo, con le stesse regole di tutte le altre.

### 4.5 Foto

Le foto stanno **solo sulle facce delle carte**, nel campo centrale (come
l'illustrazione dell'asso nelle triestine), ritagliate in un rettangolo con lo
stesso raggio della carta, mai a pieno schermo, mai in cornice con didascalia.
Trattamento: nessun filtro vintage; leggera riduzione di saturazione (-10%) per
stare con la stampa a due colori. Massimo **4 foto** in tutto il sito.

Soggetti da cercare su Unsplash (scaricare, guardare con Read, annotare
autore/URL):

| Carta | Cercare | Accettabile | Da scartare |
|---|---|---|---|
| Briscola (piatto del giorno) | "polenta", "polenta cheese", "polenta board" | polenta su tagliere di legno o in piatto semplice | polenta fritta a bastoncini da aperitivo, piatti gourmet impiattati |
| In cucina oggi | "frico", "montasio", "cheese potato crisp", "fried cheese" | un frico vero (disco dorato di formaggio e patate) | tortilla spagnola, rösti, frittata spacciata per frico |
| Il vino sfuso | "white wine tumbler", "house wine carafe", "wine glass bar counter", "osteria wine" | bicchiere basso o caraffa di bianco su un banco vero | calici da degustazione con candele, cantine barricaie, rosé "lifestyle" |
| Dove siamo | "friuli village", "italian village square", "valvasone", "northeast italy street" | piazza o via di paese del nord-est, portici, campanile | colline toscane, costiera, borghi del sud riconoscibili |
| L'oste (facoltativa) | "italian bar counter old", "osteria interior", "trattoria bar" | banco di un bar/osteria vero, senza persone in primo piano | ristoranti moderni, parrucchieri, pub inglesi |
| Da non usare | carte da gioco | solo se sono carte italiane numerali senza figure visibili, altrimenti mai | carte francesi, poker, fiches |

**Piano B (vale carta per carta, deciso dopo aver guardato)**
- Se non c'è un frico vero, la carta "In cucina oggi" è **solo tipografica**:
  tre spade grandi in prugna e ocra e i tre piatti. Una carta numerale senza
  illustrazione è una carta vera, non un ripiego.
- Se non c'è la polenta per la briscola, la briscola mostra il piatto a parole,
  il prezzo, e i sette semi di spade disposti come sulle carte vere.
- Il vino ha quasi certamente una foto buona: se non c'è, anche lui torna ai
  cinque semi.
- Mai cjarsons, musetto o brovada in foto se non sono loro (quasi certamente non
  esistono su Unsplash): si scrivono, non si fingono. Niente ravioli generici al
  posto dei cjarsons.
- Mai foto generate con IA sulle facce: le carte hanno foto vere o niente.

### 4.6 WebGL, 3D, SVG

- **WebGL: nessuno.** Il concept non carica three.js. È una scelta: nella matrice
  11 è il concept "leggero" e fisico, e le carte piatte non hanno bisogno di
  shader.
- **CSS 3D**: solo per il volo e il giro delle carte (e l'arrivo delle carte
  dal mazzo). La camera (la prospettiva del tavolo) è fissa e zenitale; niente
  inclinazione del tavolo col mouse, niente parallax, niente tilt delle carte al
  passaggio del puntatore.
- **SVG** (vector-artist):
  - i quattro semi italiani (coppe, denari, spade, bastoni) in versione
    geometrica pulita a due colori (prugna pieno + campitura ocra), disegnati su
    una griglia comune perché si possano ripetere da 1 a 7 volte nelle
    disposizioni classiche delle carte numerali. Sono segni, non illustrazioni:
    nessun volto, nessuna mano, nessun drago del bastone, nessun ornamento delle
    triestine vere (i marchi di stampa delle triestine sono di un editore: non
    si copiano);
  - il dorso del mazzo: motivo ripetuto semplice (piccolo rombo o griglia
    diagonale in prugna su prugna più chiaro) con il marchio "Al Tajut" in Bagel
    ocra nel riquadro centrale;
  - il cerchio del bicchiere sul laminato (se serve come piano B).
- **Texture del laminato**: rumore finissimo (SVG `feTurbulence` rasterizzato una
  volta sola in un PNG piccolo ripetuto), per non ricalcolarlo a ogni frame.
  Il bordo in alluminio è un `repeating-linear-gradient`.
- **Icone di interfaccia** (freccia ‹ ›, chiudi, telefono, mappa): libreria
  (Phosphor), mai disegnate a mano.

### 4.7 Cosa NON fare

**Dalla ricetta bocciata e dal vecchio VESPRO**
- Niente fondo crema o a quadretti; niente serif corsivo nei titoli; niente
  parola colorata nel titolo; niente riga di orari tra filetti; niente foto
  della sala a destra con "Tav. I"; niente due bottoni pieno + contorno.
- Niente lavagna, gesso, scritte a mano, font "chalk"; niente sito che cambia
  con l'ora vera o con il giorno; niente "cosa c'è adesso".
- Niente sezioni numerate, niente maiuscoletto spaziato, niente fade-up.
- Niente mappa disegnata (la carta "Dove siamo" porta a Maps vera).
- La prenotazione non è a passi numerati e non finisce in cartolina o
  scontrino.

**Specifici di TAJUT**
- **Niente figure**: niente Fante, Cavallo, Re, niente regine, niente jolly,
  niente mani disegnate che tengono le carte, niente oste disegnato. Le carte
  sono solo numerali da 1 a 7.
- **Niente tovaglia a quadri**, niente fiasco impagliato, niente lampadine a
  filamento, niente tavolo di legno rustico, niente "trattoria" da cartolina.
- **Niente casinò**: niente panno verde scuro, niente fiches, niente carte
  francesi, niente poker, niente "royal flush", niente neon, niente oro. Il
  verde è formica chiara, non panno.
- **Niente carte da collezione**: niente riflessi olografici, niente
  lucentezza che segue il mouse, niente tilt 3D al passaggio (vanilla-tilt),
  niente bordi dorati.
- **Niente ventaglio regolare ad arco** che ruota (è il quadrante di 15
  NOVANTA). La mano è una fila irregolare.
- **Niente contenuto a caso**: nessuna carta pescata a sorte, nessun
  mescolamento all'apertura. Chi apre il sito due volte trova le carte nello
  stesso posto.
- **Niente preloader** "sto mescolando il mazzo". L'apertura è: il tavolo c'è
  già; le sei carte arrivano in mano dal basso in 400 ms totali, una volta.
- Niente carte che volano da sole dopo l'apertura, niente carte che "respirano"
  o oscillano in attesa, niente suggerimento animato ripetuto ("trascinami").
- Niente velo scuro modale sul tavolo quando una carta è aperta.
- Niente secondo accento: niente rosso per i semi di coppe, niente blu per le
  spade. Prugna e ocra ovunque.
- Niente WebGL, niente three.js, niente particelle, niente suono.
- Niente contatori ("32 posti", "ultimi 2 tavoli"), niente recensioni con
  stelle, niente "dal 1962".
- Niente trattini lunghi (né `—` né `–`) in nessun testo visibile.
- Niente dialetto finto: le parole friulane sono quelle vere dei piatti e
  "tajut"; il resto è italiano.

### 4.8 Mobile 375 px (pensato per primo)

Il gesto si fa col pollice, quindi 375 × 667 (e 375 × 812) sono la misura di
progetto; il desktop è il caso largo.

- **Tavolo**: tutto lo schermo, `100dvh`, bordo di alluminio solo a destra e
  sinistra (8 px). Il `ConceptBackButton` condiviso sta in basso a sinistra: la
  mano parte 56 px più a destra o sale sopra di lui (da verificare con lo
  scaffold, mai sovrapposti).
- **Apertura**: in alto il mazzo con la briscola (la briscola larga circa 132 px,
  leggibile: piatto e prezzo), sotto il nome "Al Tajut" in Bagel a 44-52 px su due
  righe se serve ("Al" / "Tajut"), la riga di Literata, il bottone "Prenota un
  tavolo" a larghezza naturale (non a tutta larghezza). Il posto dell'oste a
  destra del mazzo, piccolo.
- **Mano**: sei carte sovrapposte in fila nella fascia bassa (ultimi 180-200
  px), ognuna visibile per circa 58 px di larghezza, alta 150 px, con indice e
  titolo breve leggibili nella parte scoperta. Toccata, una carta sale del 40%
  prima di partire (anticipo del gesto). Se non ci stanno sei con 58 px leggibili
  (sotto i 360 px), la mano scorre di lato con scroll-snap, mai carte
  illeggibili.
- **Carta aperta**: larga il 88% dello schermo, alta fino al 74%, centrata un
  po' verso l'alto per lasciare la mano visibile sotto. Se il contenuto supera
  (il vino con cinque righe e prezzi), la faccia scorre **dentro** la carta,
  con l'indice d'angolo fermo; la pagina non scorre mai.
- **Presa**: sotto i 640 px la presa non si allarga sul tavolo, diventa un
  mucchietto nell'angolo in alto a destra con il numero di carte lette,
  toccabile.
- **Prenotazione**: tre carte affiancate, ciascuna 104 × 170 px circa, frecce ‹
  › sotto ciascuna; il foglietto sale sopra la mano come un foglio appoggiato,
  i due campi a tutta larghezza del foglietto; alla comparsa della tastiera il
  foglietto resta visibile e le carte si abbassano (usare `visualViewport`).
  Bottone "Cala le tre carte" sotto le carte.
- **Orizzontale** (telefono girato): la mano si sposta sul lato destro, in
  verticale; il tavolo resta intero.
- **768 e 1440**: stessi elementi, più aria. Su 1440 × 900 la carta aperta sta
  a sinistra del centro e la presa si allarga a destra: il tavolo si riempie
  davvero. Su 2560 la scala delle carte ha un tetto (la carta aperta non supera
  440 px di larghezza), il tavolo cresce, le carte no.

### 4.9 Accessibilità e reduced motion

**Struttura**
- Il DOM è un documento normale: `main` con un titolo `h1` ("Al Tajut,
  osteria a Valvasone"), la briscola come `article`, la mano come elenco
  (`ul`) di `button` ("Tre di spade. In cucina oggi: tre piatti"), la carta
  aperta come `region` con `aria-labelledby` sul suo titolo (non un dialog
  modale: il resto del tavolo resta raggiungibile).
- Tastiera: Tab entra nella mano; frecce sinistra/destra si spostano tra le
  carte (roving tabindex); Invio o Spazio gioca la carta; il focus passa al
  titolo della carta aperta; Esc la riprende e riporta il focus alla carta in
  mano da cui era partita (o, se è andata nella presa, alla presa).
- Prenotazione da tastiera: ogni carta è un `button`; frecce su/giù cambiano il
  valore della carta con il focus; i campi del foglietto sono normali `input`
  con `label`; "Cala le tre carte" è un `button` di tipo submit dentro un
  `form` vero.
- Annunci: una zona `aria-live="polite"` dice cosa è successo ("Carta aperta:
  il vino sfuso", "L'oste ti ha dato il tavolo 5, sabato 11 ottobre alle 20").
  Gli errori dei campi sono collegati con `aria-describedby`.
- Il trascinamento non è mai l'unico modo: tocco, tastiera, bottoni.
- La vista elenco "Leggi come un menù" è sempre disponibile e porta tutto.
- Contrasto: prugna su carta e prugna su formica ampiamente sopra AA; ocra mai
  come testo; testo sul bottone ocra in prugna. Focus visibile: contorno prugna 2
  px con 3 px di distanza, anche sulle carte ruotate.
- Semi e numeri non portano informazioni che non siano anche scritte: il titolo
  della carta dice sempre cosa c'è.
- Zoom del browser fino al 200%: il tavolo passa da solo alla vista elenco se la
  carta aperta non ci sta.

**Reduced motion** (`prefers-reduced-motion: reduce`)
- Niente volo e niente giro: la carta giocata compare già aperta al centro con
  una dissolvenza di 150 ms, e la carta in mano si spegne al 40% per dire che è
  in tavola.
- La mano arriva già in posizione all'apertura; le carte della prenotazione sono
  già in mano, già girate.
- Il cambio di valore di una carta della prenotazione è istantaneo.
- La risposta dell'oste compare girata, con dissolvenza di 150 ms; nessuna
  raccolta animata della presa.
- Nessun movimento supera mai 3 cambi al secondo in nessuna modalità; niente
  lampi di luce sulle carte.

### 4.10 Note per le ondate successive

- **brand-strategist / copywriter**: nome "Al Tajut", paese d'esempio
  (Valvasone o San Quirino), sette tavoli, chiuso il lunedì, torneo di briscola
  il giovedì. Italiano da osteria, frasi corte, la voce dell'oste nella risposta
  della prenotazione. Prezzi verosimili (tajut 1,40-2,60 €, frico con polenta
  11-13 €). Nessun dato legale.
- **ux-architect**: al posto del flusso di scroll, il diagramma degli stati del
  tavolo (0 apertura, 1 carta aperta, 2 mano da tre, 3 attesa, 4 risposta) con
  tutte le transizioni e i ritorni.
- **tech-architect**: niente three.js, niente Lenis; un solo componente tavolo,
  stato in un reducer, animazioni con WAAPI o molla scritta a mano; porte
  9110-9119.
- **motion-designer**: gli unici eventi di movimento sono: arrivo della mano
  all'apertura, volo/giro/apertura di una carta, ripresa, cambio di mano per la
  prenotazione, calata, carta dell'oste, raccolta della presa. Nient'altro si
  muove.
- **trend-researcher**: siti con interfacce "a oggetti su un tavolo" e giochi di
  carte nel browser fatti bene (fisica leggera, leggibilità), per principi di
  lancio e appoggio. Estrarre principi, non copiare.
