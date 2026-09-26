# Creative director · Concept 16 · Agenzia immobiliare (Pordenone)

Ondata 0. Rotta `/concept-16`. Documento di direzione per tutti gli agent delle
ondate successive: quello che è scritto da "3. La scelta" in giù è vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (tabella, paragrafo 16,
verifica incrociata, regole comuni), `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 0, 1, 4, 9), `concepts/10-torchio/docs/creative-director.md` (solo
per formato e livello), `concepts/10-torchio/docs/integrazione-sito.md`,
screenshot `docs/concept-attuali/concept-16.jpg` (vecchio QUATTRO MURA) e
`concept-3.jpg` (MARGINALIA).

La direzione è assegnata dalla matrice: **EVIDENZIA**, la pagina degli annunci
del sabato letta con l'evidenziatore in mano. Qui la sviluppo, la metto alla
prova con tre esecuzioni diverse e ne fisso una. Una correzione rispetto alla
matrice: la **planimetria nella scheda della casa non si disegna** (era il
cuore del bocciato QUATTRO MURA); vedi 4.3 e 4.7.

---

## 0. Cosa ho visto (base delle scelte)

**Il vecchio QUATTRO MURA (concept-16.jpg)**: la ricetta bocciata al completo.
Occhiello spaziato "AGENZIA IMMOBILIARE · PORDENONE E DINTORNI", titolo serif
Playfair con la parola "luce" in ocra, riga di quattro numeri tra filetti (4, 22,
68 giorni, 2% + IVA), due bottoni pieno + contorno, foto di soggiorno in cornice
a destra con didascalia "TAV. I", crema, e come idea la "pianta col sole".
Tutto questo è vietato qui, uno per uno.

**MARGINALIA (concept-3.jpg)**: crema, blu, ruggine; frontespizio centrato con
doppio filetto, serif display nero, maiuscoletto spaziato, fleurons, corsivo,
foto in cornice. È la carta del *libro*: calda, lenta, ariosa, centrata.
Il giornale di EVIDENZIA deve essere il suo opposto: carta **grigia fredda**,
fitta, **a colonne**, allineata a sinistra, grottesco nero per i titoli, niente
ornamenti, niente cornici, niente corsivi decorativi, velocità di lettura da
sabato mattina.

**Gli altri della matrice**: 14 BATTIFILO ha un grigio caldo (calcestruzzo) ma è
foto piena + cobalto; 20 IMBRUNIRE fa scegliere una stanza entrandoci; 11 TAJUT
e 17 MADRE hanno carte chiare ma colorate e sono gesti su oggetti. EVIDENZIA è
l'unico concept **fatto di testo stampato**, l'unico **denso** e l'unico con una
**mappa vera**.

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina di un'agenzia immobiliare di
Pordenone per coppie e famiglie che cercano casa in città e nei comuni vicini,
con un linguaggio da pagina di piccoli annunci di un quotidiano locale (carta
grigia, colonne fitte, grottesco nero, un solo colore: il rosa
dell'evidenziatore), leaning toward CSS grid a colonne di giornale + SVG per il
tratto dell'evidenziatore + foto vere a retino/a colori + Leaflet con tile
OpenStreetMap, niente WebGL.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | La griglia di un giornale è rigida per natura: la varietà nasce dalle dimensioni degli annunci (piccolo, con foto, a riquadro, di testa), non da asimmetrie gratuite. Più di 7 renderebbe la pagina illeggibile come pagina di annunci. |
| `MOTION_INTENSITY` | **4** | Si muovono solo tre cose: il tratto rosa (segue il dito), l'annuncio che si stacca, il percorso che si traccia sulla mappa. Nessuna entrata allo scroll, nessuna coreografia. |
| `VISUAL_DENSITY` | **8** | Scelta deliberata e unica nel Lab: la densità *è* la metafora (tante case, tu ne scegli quattro). La densità si governa con la tipografia (corpo, interlinea, filetti di colonna), mai con testo minuscolo: il corpo di lettura resta 15-16 px. |

---

## 2. La metafora sviluppata

Sabato mattina, il caffè, il giornale aperto sul tavolo alla pagina delle case.
Chi cerca casa in Friuli lo ha fatto per decenni: legge di fila, e quando un
annuncio lo convince ci passa sopra l'evidenziatore. Poi prende il telefono e
chiama per vederle *tutte in una mattina*. Il sito è quella pagina e quel
gesto, senza nostalgia: è la pagina di oggi, con i prezzi di oggi.

Tre idee reggono tutto:

1. **Il rosa è solo tuo.** Sulla pagina tutto è nero stampa e grigio retino.
   Il rosa compare soltanto dove *l'utente* ha agito: il tratto sugli annunci,
   i segni sulla mappa, il percorso del giro. Unica eccezione documentata: un
   tratto dimostrativo nel riquadro di testa, disegnato una volta sola
   all'apertura. Nessun bottone, link o titolo è rosa. Così il colore diventa
   informazione: guardi la pagina intera e vedi a colpo d'occhio che cosa hai
   scelto.
2. **Lo stesso gesto, dalla carta alla città.** Il giro del sabato è tracciato
   sulla mappa vera con lo stesso evidenziatore, largo e semitrasparente, come
   si faceva su una piantina di carta. Il sito non ha due linguaggi (annunci e
   prenotazione): ne ha uno.
3. **Il giornale stampa in grigio, la casa è a colori.** Sulla pagina le poche
   foto sono stampate a retino, grigie, piccole, come nei piccoli annunci veri.
   Quando un annuncio si stacca e diventa scheda, la foto passa dal retino al
   colore. È il momento in cui "un annuncio" diventa "una casa".

Perché è di questo mestiere: l'agenzia vende *scelta* e *tempo*. La pagina
fitta mostra l'offerta; l'evidenziatore fa scegliere senza moduli; il giro
risolve il vero problema di chi cerca casa (vedere quattro case in una
mattina, in un ordine che ha senso, senza dieci telefonate).

---

## 3. Tre esecuzioni della stessa direzione

Le tre varianti hanno tutte palette, font, evidenziatore e giro assegnati dalla
matrice. Cambia *come si abita la pagina*.

### Variante A · PAGINA INTERA (broadsheet da esplorare)

- Una sola pagina larga di giornale, **6 colonne** (circa 1.840 px di
  larghezza a lettura, alta circa 2,3 schermate a 1440). La finestra è una
  porzione della pagina: si sposta in due direzioni con lo scroll nativo
  (rotella, trackpad), con spazio + trascinamento, con le frecce, o
  trascinando il rettangolo sulla **minipagina** in basso a destra.
- Due livelli di zoom soltanto: **Leggi** (100%, testo 15 px) e **Pagina
  intera** (la pagina tutta nello schermo, testo illeggibile di proposito, si
  vedono impaginazione e segni rosa). Tocchi un punto nella pagina intera e ci
  entri a lettura.
- Su mobile la pagina si ricompone come **colonna di un giornale piegato**.
- Rischi: conflitto tra trascinare per spostare e trascinare per evidenziare
  (risolto sotto, 4.4); una pagina più larga dello schermo è insolita e va
  resa evidente dal taglio della colonna al bordo destro, non da scritte
  "trascina".

### Variante B · IL FASCICOLO (pagine da sfogliare)

- Quattro pagine (appartamenti, case e villette, affitti, zone e prezzi)
  affiancate; si passa dall'una all'altra con una piega e un giro di pagina in
  CSS 3D.
- Rischi: il "flipbook" è il cliché dei PDF sfogliabili (Issuu), il giro di
  pagina 3D è un effetto e non un gesto del mestiere; si avvicina allo
  scorrimento laterale di 17 MADRE e al CSS 3D di 11 e 20; spezza la vista
  d'insieme, che è proprio il valore della pagina fitta (vedere tutti i segni
  rosa insieme).

### Variante C · LA COLONNA INFINITA

- Una sola colonna lunga di piccoli annunci, a scroll verticale, con le
  rubriche fisse in alto mentre scorri; su desktop tre colonne affiancate che
  scorrono insieme.
- Rischi: torna allo scroll verticale a sezioni che la matrice vuole evitare;
  perde la sensazione di "pagina"; su desktop diventa un feed qualunque. Poco
  memorabile.

### La scelta: A · PAGINA INTERA, con la colonna di C come forma mobile

1. È l'unica in cui **la pagina esiste come oggetto**: la vista d'insieme con i
   segni rosa sparsi è l'immagine memorabile del concept, e il "Pagina intera"
   la rende un comando, non una decorazione.
2. Rispetta la struttura assegnata ("si ingrandisce e si sposta") senza
   inventare effetti 3D: lo spostamento è scroll nativo, quindi veloce,
   accessibile e senza librerie.
3. La densità ha un senso: vedi molte case insieme, come sul giornale, e ne
   segni poche.
4. Su 375 px la colonna del giornale piegato (da C) è la forma giusta: la
   matrice chiede di non fare zoom su un foglio enorme sul telefono.
5. B scartata perché il giro di pagina è un effetto preso in prestito da altri
   concept e da altri media; C scartata perché è la struttura di tutti.

**Nome**: resta **EVIDENZIA**, *case a Pordenone e dintorni*. È anche il nome
della testata della pagina (il "foglio del sabato" dell'agenzia): non imita
nessun quotidiano reale.

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo in breve (base per l'art-director)

**Palette** (tema chiaro bloccato, nessuna sezione invertita tranne le barre
delle rubriche):

| Ruolo | Colore | Uso | Contrasto |
|---|---|---|---|
| Carta di giornale | `#E4DFD1` | fondo unico di tutta la pagina e della scheda | |
| Nero stampa | `#1C1C1A` | tutto il testo, titoli, barre rubrica (in negativo), bottoni | circa 13:1 su carta |
| Nero grigio (derivato) | `#4F4C46` | testo secondario: riferimento, zona, date | circa 6:1 su carta, AA |
| Retino | `#8F8B82` | solo filetti di colonna, punti del retino delle foto, bordo minipagina. **Mai testo** (2,5:1) | |
| Rosa evidenziatore | `#EE5A9E` | solo tratti dell'utente, marcatori e percorso sulla mappa. **Mai testo rosa**; il testo nero sopra il rosa sta intorno a 5:1, AA | |

Il tratto rosa si stampa in `mix-blend-mode: multiply` sopra il testo, come un
evidenziatore vero (l'inchiostro nero resta nero). Niente altri colori:
nessun verde "disponibile", nessun rosso "venduto", nessun badge.

**Tipografia**:
- *Libre Franklin* (variabile, 100-900): testata (900, spaziatura -0,02 em),
  titoli di rubrica (800, in negativo su barra nera, in minuscolo con
  maiuscola iniziale, mai maiuscoletto spaziato), attacco degli annunci (800:
  zona e tipologia), prezzi (700, cifre tabellari, formato italiano
  "€ 168.000").
- *Newsreader* (variabile con asse opsz): testo degli annunci 15/1,38 a
  lettura su desktop, 16/1,45 su mobile; descrizione nella scheda 18/1,5 con
  opsz alto; il corsivo di Newsreader solo per le citazioni di chi ha comprato,
  mai nei titoli.
- Niente monospace, niente font a mano, niente terzo font.

**Forme**: spigolo vivo ovunque (raggio 0), come un ritaglio di forbice. Unica
eccezione documentata: le estremità del tratto dell'evidenziatore, che hanno la
forma della punta a scalpello (leggermente oblique, irregolari).

**Griglia**: 6 colonne di 268 px con canaletto di 20 px e filetto di colonna
sottile (1 px, retino). I filetti organizzano il contenuto come su un giornale
vero: non sono divisori decorativi tra sezioni. Sotto la testata un solo filo
nero di 3 px. Niente doppi filetti (sono di MARGINALIA), niente onde.

**Foto sulla pagina**: stampate a **retino** (punti del retino in `#8F8B82`
e nero su carta, generati da una vera immagine in scala di grigi, non un
filtro sfocato), piccole, solo in circa un terzo degli annunci. Nella scheda
la stessa foto è a colori, a tutta larghezza della scheda, senza cornice né
didascalie sovrapposte.

### 4.2 Struttura vera della pagina (desktop 1440)

Non è una pagina a sezioni: è **un solo foglio** impaginato. Da sinistra a
destra e dall'alto in basso:

1. **Testata** (tutta la larghezza del foglio). A sinistra *EVIDENZIA* in
   Libre Franklin 900 molto grande (circa 132 px, occupa 3-4 colonne); a
   destra, allineate alla base: una riga "Case in vendita e in affitto a
   Pordenone e dintorni" e la **data del sabato vero** (calcolata: "sabato 3
   ottobre 2026"; da domenica a venerdì mostra il sabato che viene). Sotto,
   il filo nero da 3 px. In alto a sinistra resta libera la zona di
   `ConceptBackButton` (circa 230×44 px): la testata parte più in basso.
2. **Riquadro di testa** (3 colonne, prima schermata, in alto a sinistra
   sotto la testata). È l'annuncio dell'agenzia stessa, e fa da hero: un
   titolo in Libre Franklin 800 (massimo 2 righe, per esempio "Segna le case
   che vuoi vedere. Il giro di sabato lo prepariamo noi."), sotto al massimo
   20 parole in Newsreader che spiegano il gesto (fino a quattro case, un
   percorso, sabato mattina). Sulla parola "Segna" c'è il tratto rosa
   dimostrativo, disegnato una volta all'apertura (600 ms). Nessun bottone
   qui: l'azione è sugli annunci. Niente foto nel riquadro di testa.
3. **Rubriche di annunci**, ognuna aperta da una barra nera in negativo con il
   nome in Libre Franklin 800 (per esempio "Appartamenti in vendita"). Quattro
   rubriche:
   - *Appartamenti in vendita* (circa 8 annunci);
   - *Case e villette* (circa 6);
   - *Rustici e terreni* (circa 3);
   - *Affitti* (circa 5, compresi un box auto e un monolocale).
   In totale **20-24 annunci**, di quattro formati: piccolo (1 colonna, 5-7
   righe, solo testo), con foto (1 colonna, foto a retino in testa), a
   riquadro (2 colonne, bordo nero da 2 px, due foto a retino), e uno solo
   di testa per rubrica. Le rubriche scorrono in colonna come su un giornale
   (una rubrica può continuare nella colonna dopo), non a blocchi uguali.
   Zone vere: Centro, Borgomeduna, Torre, Rorai Grande, Villanova, San
   Gregorio, e i comuni di Cordenons, Porcia, Roveredo in Piano, Fiume
   Veneto. Prezzi di esempio verosimili per Pordenone (appartamenti 95-260 mila
   euro, villette 220-390 mila, affitti 480-850 € al mese).
4. **Box redazionali** incastrati tra gli annunci, come su una pagina vera
   (ognuno una sola volta, in formati diversi tra loro):
   - *Quanto costa al metro quadro* (1 colonna): il listino delle zone come le
     tabelle di borsa del giornale, zona e €/m² in cifre tabellari, due righe
     di spiegazione; dichiarato "stime di esempio dell'agenzia". Nessuna barra
     di progresso, nessun grafico.
   - *Vendi casa?* (1 colonna): cosa serve (APE, visura, conformità), come
     lavoriamo, la provvigione detta in chiaro, il telefono. Nessun secondo
     modulo: per vendere si telefona o si passa.
   - *L'agenzia* (1 colonna): indirizzo di esempio, orari (sabato mattina
     sempre aperti: è il giorno del giro), telefono di esempio con prefisso
     0434, due righe su chi lavora in agenzia, senza ritratti.
   - *Hanno comprato con noi* (2 colonne): due citazioni brevi (massimo 3
     righe), nome e zona.
5. **Piede del foglio**: una riga come il piede di un giornale (numero di
   pagina, nome testata, data), crediti foto con autore e link Unsplash,
   "Un concept di CiceriLab".

**Comandi fissi** (sempre visibili, piccoli, neri su carta, sopra il foglio):
- **Minipagina** in basso a destra (circa 150×190 px): il foglio in miniatura
  con il rettangolo della finestra e i segni rosa degli annunci evidenziati. Si
  trascina il rettangolo per spostarsi. Accanto, i due comandi **Leggi** /
  **Pagina intera**.
- **Barra del giro** in basso a destra sopra la minipagina: "Il tuo giro" e
  quattro posti che si riempiono di un piccolo tratto rosa ciascuno (stato
  reale, non decorazione), e il bottone **Prepara il giro** (l'unica etichetta
  per l'intento "prenota visita" in tutto il sito). Da zero case la barra dice
  "Il giro è vuoto" e il bottone apre lo stato vuoto (4.5).

**La scheda della casa** (sovrapposta al foglio, vedi 4.3) e **il giro del
sabato** (pannello a tutta altezza, vedi 4.5) sono le altre due "schermate".

### 4.3 La scheda della casa: l'annuncio che si stacca

- Toccando il titolo di un annuncio (è un bottone), il rettangolo dell'annuncio
  **si stacca dal foglio**: si solleva di pochi pixel con un'ombra tinta del
  colore della carta (non nera), ruota di circa 1°, poi si apre in una scheda
  larga circa 720 px ancorata al lato destro della finestra (su desktop il
  foglio resta visibile a sinistra, oscurato del 30%). Transizione tipo FLIP
  in circa 420 ms.
- Dentro la scheda, dall'alto: striscia di foto a colori che si scorre in
  orizzontale (4-6 foto della stessa casa, la prima è quella che sul foglio
  era a retino e passa dal retino al colore); attacco e titolo; **prezzo** e,
  in una frase, il confronto con la zona ("2.050 €/m²: in zona Torre la media
  è 1.620"); la **consistenza** raggruppata in tre blocchi brevi (la casa:
  superficie, locali, piano, anno; i costi: spese condominiali, riscaldamento,
  classe energetica; fuori: garage, giardino, cantina); la descrizione in
  Newsreader; la zona in tre righe concrete (scuola, autobus, supermercato,
  con distanze a piedi); il toggle **Evidenzia per il giro** (lo stesso stato
  dell'annuncio).
- **Nessuna planimetria disegnata**, nessuna pianta col sole, nessuna bussola.
  Se serve, una riga: "Planimetria catastale disponibile in agenzia".
- Chiusura: bottone "Rimetti nella pagina" in alto, `Esc`, clic sul foglio
  oscurato; l'annuncio torna al suo posto con la transizione inversa e il
  focus torna sul suo titolo.

### 4.4 Interazione firma: l'evidenziatore

**Il tratto (come appare)**
- Il tratto copre la **riga d'attacco** dell'annuncio (zona e tipologia in
  grassetto), agganciato alla sua linea di base: il puntatore guida la
  lunghezza, non l'altezza, così il tratto resta pulito e il testo leggibile.
  Oscillazione verticale massima 2 px e rotazione tra -0,6° e 0,6°, estratte
  da un seme salvato per annuncio (il tratto è sempre lo stesso quando torni).
- Forma: rettangolo alto circa 1,15 volte il corpo del testo, estremità a
  scalpello, due o tre striature più chiare nel senso del tratto e un po' più
  d'inchiostro all'inizio e alla fine (dove la punta si ferma). SVG, in
  `multiply`, opacità 0,85.
- Se il gesto scende oltre la prima riga, il tratto continua sulla seconda
  (massimo due righe per annuncio).

**Mouse e penna (desktop)**
- Si preme su un annuncio e si trascina verso destra: dopo 6 px di movimento
  orizzontale il tratto parte dal punto premuto e si allunga seguendo il
  puntatore (tornando indietro si accorcia).
- Rilasciando: se il tratto copre almeno il **55%** della riga, si completa da
  solo fino a fine riga in 160 ms e l'annuncio entra nel giro (la barra del
  giro riceve un tratto, la minipagina il suo segno); sotto il 55% il tratto
  si ritira in 200 ms e non succede niente.
- Ripassare su un annuncio già evidenziato lo toglie: il rosa si scolora in
  250 ms.
- **Il quinto annuncio**: l'evidenziatore "è scarico". Il tratto esce pallido e
  a strisce, si ferma a metà e si ritira; accanto compare una riga: "Il giro
  del sabato sta in una mattina: quattro case. Togline una per mettere questa."
- **Spostare il foglio** non usa mai il trascinamento sugli annunci: rotella e
  trackpad (scroll nativo nei due assi), spazio + trascinamento ovunque,
  trascinamento sugli spazi vuoti, sui filetti e sulle barre di rubrica, e la
  minipagina. Il cursore è quello di sistema: `text` sugli annunci, `grab` sugli
  spazi vuoti. Niente cursore personalizzato.
- La selezione di testo sugli annunci è sostituita dal tratto; nella scheda il
  testo (telefono, indirizzo) si seleziona normalmente.

**Tastiera**
- Ogni annuncio è un `article` con un titolo `h3` che contiene il bottone che
  apre la scheda, e un secondo bottone **Evidenzia** (`aria-pressed`, icona
  Phosphor "Highlighter" + il riferimento "Rif. 214"). Premendo Evidenzia il
  tratto si disegna da solo da sinistra a destra in 350 ms.
- Il foglio è un contenitore scorrevole con `tabindex="0"` e nome accessibile
  ("Pagina degli annunci"): con il focus sul foglio le frecce lo spostano, `+`
  e `-` passano tra Leggi e Pagina intera. Nessuna scorciatoia a lettera
  singola globale (WCAG 2.1.4).
- Quando il focus va su un annuncio fuori vista, il foglio scorre per
  mostrarlo intero (`scrollIntoView` con margine), senza animazione se è
  attivo reduced motion.
- Collegamenti di salto all'inizio: "Vai agli annunci", "Vai al tuo giro".
- Ogni cambio del giro è annunciato in una regione `aria-live="polite"`:
  "Aggiunto al giro: Torre, trilocale con garage. Due case su quattro."

**Touch e mobile**
- Sulla colonna del giornale piegato lo scroll verticale resta del sistema.
  Gli annunci hanno `touch-action: pan-y`: un trascinamento **orizzontale**
  (angolo entro 30° e almeno 12 px) disegna il tratto, un trascinamento
  verticale scorre la pagina. È esattamente il gesto dell'evidenziatore su una
  riga di giornale.
- Il bottone Evidenzia resta sempre visibile e grande almeno 44×44 px: chi non
  vuole il gesto ha il tocco.
- Vibrazione leggera (10 ms, `navigator.vibrate` se disponibile) solo quando
  un annuncio entra nel giro.
- Su tablet (768-1024) il foglio è quello desktop, e il pizzico con due dita
  passa tra Leggi e Pagina intera (solo due livelli, niente zoom libero).

**Reduced motion**
- Il tratto compare intero al rilascio o al tocco (niente disegno progressivo,
  niente ritiro animato); il tratto dimostrativo nel riquadro di testa è già
  lì. Lo stacco dell'annuncio diventa una dissolvenza di 150 ms. Il retino
  passa al colore senza transizione. Lo spostamento del foglio da minipagina e
  da tastiera salta, non scorre. Il sito resta completo.

### 4.5 Meccanica unica di prenotazione: "Il giro del sabato"

Idea: non si prenota una visita, si **costruisce una mattina**. Gli annunci
evidenziati (da 1 a 4) diventano un percorso di visite di sabato su una mappa
vera, con orari già calcolati; lo mandi e l'agente conferma il giro.

**Dove si apre**: bottone **Prepara il giro** nella barra del giro. Desktop:
pannello a tutta altezza che copre i due terzi destri della finestra (il
foglio resta visibile a sinistra con i suoi segni rosa); a sinistra del
pannello la mappa, a destra la colonna del giro. Mobile: pannello a tutto
schermo, mappa in alto (circa 45% dell'altezza), colonna del giro sotto.

**La mappa (OpenStreetMap vera)**
- Leaflet (libreria da aggiungere solo al concept, caricata con `import()`
  dinamico all'apertura del pannello, mai al caricamento della pagina) con
  il livello `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.
- **Regole d'uso dei tile OSM** (tile usage policy della OSM Foundation):
  - attribuzione sempre visibile sulla mappa: "© OpenStreetMap contributors"
    con link a `https://www.openstreetmap.org/copyright`, leggibile anche a
    375 px (non nascosta dietro un'icona);
  - nessun download in blocco, nessun precaricamento di tile fuori vista,
    nessuna copia offline, nessun tile salvato negli asset del concept;
  - le richieste partono dal browser con il suo Referer (non impostare
    `referrerPolicy: "no-referrer"` sui tile) e rispettano la cache HTTP;
  - URL senza sottodomini `a/b/c`; zoom limitato tra 12 e 17, mappa limitata
    all'area di Pordenone e comuni vicini (`maxBounds`), così il numero di
    tile resta piccolo;
  - la mappa si carica solo quando l'utente apre il giro;
  - nel doc del tech-architect va scritto che per un cliente vero in
    produzione si passa a un fornitore di tile con contratto (o a tile
    propri): i server OSM non sono pensati per traffico commerciale;
  - nei test Playwright la mappa si apre il minimo indispensabile (poche
    esecuzioni, cache del browser attiva), mai cicli ripetuti di zoom.
- Stile della mappa: i tile standard OSM restano quelli (non si ricolorano con
  filtri che ne alterano la leggibilità); per legarli alla carta si
  desaturano leggermente (grayscale 35%) e il contenitore ha il fondo
  `#E4DFD1`. Controlli di zoom Leaflet ristilati nero su carta, spigolo vivo.
- **Marcatori**: un tratto rosa corto e largo (come una macchia di
  evidenziatore) con dentro il numero di passaggio in nero (1-4) in Libre
  Franklin 800. Niente spilli a goccia stile Google. Il marcatore è sulla
  **zona**, non sull'indirizzo (le agenzie non pubblicano il civico): punto
  del quartiere con uno spostamento fisso entro 250 m per annuncio. Le
  coordinate dei quartieri si verificano una volta in fase di sviluppo su
  openstreetmap.org, e si scrivono nei dati (nessuna chiamata a Nominatim in
  pagina). Riferimenti di partenza da verificare: Pordenone centro 45,956 N
  12,660 E; Borgomeduna 45,944 12,670; Torre 45,969 12,675; Rorai Grande
  45,966 12,630; Cordenons 45,986 12,701; Porcia 45,963 12,617.
- **Il percorso**: una polilinea rosa larga (10-12 px, opacità 0,55,
  estremità squadrate, `multiply`) che collega agenzia e case nell'ordine
  del giro, come un evidenziatore passato sulla piantina. Onestà: è in linea
  d'aria, e la colonna lo dice ("tragitti stimati in auto"). Niente servizi
  di routing esterni.
- La mappa entra inquadrando tutti i punti (`fitBounds` con margine); il
  percorso si traccia da un punto al successivo in 900 ms totali (reduced
  motion: compare intero).

**La colonna del giro**
- Titolo: "Sabato 3 ottobre" (il sabato calcolato), con la possibilità di
  passare al sabato dopo.
- **Partenza**: tre scelte (9:00, 9:30, 10:00). Si parte dall'agenzia o, se
  l'utente lo sceglie, "ci vediamo alla prima casa".
- **Tappe**: per ogni casa, l'orario d'arrivo in Libre Franklin 700 grande, la
  riga d'attacco dell'annuncio *con il suo tratto rosa* (lo stesso tratto
  della pagina), prezzo, e sotto il tragitto ("12 minuti da Borgomeduna").
  Due bottoni piccoli "Prima" / "Dopo" per cambiare ordine (su desktop anche
  trascinando la tappa); "Togli" rimuove dal giro e dal foglio.
- **Calcolo** (tutto nel browser): ordine iniziale il più breve partendo
  dall'agenzia (con al massimo 4 tappe si provano tutte le 24 combinazioni);
  distanza in linea d'aria moltiplicata per 1,35 (fattore strade), velocità
  media 28 km/h, arrotondato ai 5 minuti in su; visita di 20 minuti per un
  appartamento, 30 per una casa o un rustico; 5 minuti di margine tra una casa
  e l'altra. L'agenzia il sabato chiude alle 12:30: se il giro sfora, la
  colonna lo dice subito ("L'ultima visita finirebbe alle 12:50: parti alle
  9:00 o sposta Porcia a sabato 10") senza bloccare.
- **Chi sei**: nome, telefono (obbligatorio, le conferme si fanno a voce),
  email facoltativa, una nota facoltativa ("veniamo in due, con un bambino
  piccolo"). Etichetta sopra ogni campo, errore sotto il campo, nessun
  segnaposto usato come etichetta.
- Bottone **Manda il giro** (nero, testo carta).

**Stati**
- *Vuoto* (nessun annuncio evidenziato): la mappa si apre comunque su
  Pordenone con i nomi delle zone degli annunci in pagina; la colonna dice
  "Il giro è vuoto. Passa l'evidenziatore su un annuncio, o premi Evidenzia, e
  la casa comparirà qui." e propone due annunci "da cui partire" con il loro
  bottone Evidenzia. Il modulo "Chi sei" non si mostra finché il giro è vuoto.
- *Una casa sola*: valido; la colonna dice che il giro può crescere fino a
  quattro.
- *Errore mappa* (tile che non arrivano: offline, rete bloccata, 3 errori di
  tile di fila o nessun tile entro 8 s): la mappa è sostituita da un riquadro
  di carta con la frase "La mappa non si carica. Il giro resta valido: ecco le
  tappe in ordine." e un link "Apri la zona su openstreetmap.org". La colonna
  del giro funziona identica. Se manca Leaflet (import fallito) stesso
  comportamento.
- *Errore modulo*: telefono non valido (formati italiani fissi e mobili,
  con o senza +39) o nome vuoto, detto sotto il campo; il focus va al primo
  campo con errore.
- *Invio in corso*: il bottone diventa "Mando il giro…" e si disattiva; niente
  spinner, niente scheletri.
- *Invio fallito* (nel prototipo si simula solo se offline): "Non è partito.
  Il giro è salvato su questo telefono: chiamaci allo 0434 … e lo
  confermiamo a voce."
- *Successo*: **nessuna cartolina, ricevuta, scontrino o timbro**. La colonna
  resta com'è, con gli orari; in cima compare una riga in nero: "Giro
  mandato. Chiara ti richiama entro venerdì alle 18 per confermarlo." (nome
  dell'agente di esempio, deciso dal copywriter). Sotto, un solo link utile:
  **Aggiungi al calendario**, che scarica un file `.ics` generato nel browser
  con le tappe come eventi (titolo, orario, zona, riferimento annuncio). Sulla
  pagina, i tratti rosa degli annunci del giro restano; nella barra del giro
  compare "Giro mandato per sabato 3 ottobre".
- `track("demo_prenotazione", { concept: 16, case: n })` all'invio riuscito;
  `track("apri_concept", { concept: 16 })` all'apertura. Nient'altro.
- Il giro (annunci evidenziati, ordine, partenza) si salva in `localStorage`
  con try/catch: tornando, la pagina ha ancora i suoi segni. Senza storage
  tutto funziona uguale nella sessione.

### 4.6 Foto

- **Servono**: case del Friuli occidentale credibili. Esterni: villetta o
  bifamiliare anni '70-'90 con tetto a due falde in coppi e intonaco chiaro,
  condominio basso anni '70-'80 con balconi, casa colonica o rustico con
  portico e muri in sasso o mattone, casa a schiera recente. Interni: cucina,
  soggiorno con parquet o gres, camera, bagno, scala interna, porticato con
  vista giardino. Luce naturale, niente styling da rivista di lusso.
- **Da evitare** (controllando con Read ogni foto): palme, ville con piscina a
  sfioro, case americane in legno a doghe, villette inglesi a schiera in
  mattone rosso, chalet di montagna innevati, case greche bianche, loft
  newyorkesi, prese e interruttori non europei, scritte in inglese, targhe
  straniere, persone in posa con le chiavi.
- **Coerenza per scheda**: le 4-6 foto di una scheda devono sembrare della
  stessa casa (stesso fotografo o stessa serie su Unsplash). Se una serie
  coerente non c'è, la scheda ha meno foto, mai foto di case diverse spacciate
  per una.
- Scaricate da `images.unsplash.com` (`w=1600&q=70&fm=webp` per la scheda,
  una versione piccola in scala di grigi per il retino del foglio), salvate
  negli asset del concept, autore e URL annotati nel doc dell'art-director e
  nei crediti del piede. Mai un 404, mai picsum.
- Mai foto di case reali riconoscibili di Pordenone presentate come in
  vendita (sarebbe un annuncio falso su una proprietà vera).
- **Piano B**: se si trovano meno di 5 serie credibili, le schede con foto
  scendono a quelle che ci sono (minimo 4); gli altri annunci restano
  tipografici anche nella scheda, con la frase "Foto in agenzia, su
  richiesta" e più spazio alla consistenza. È verosimile: molti piccoli annunci
  veri non hanno foto. Nessun segnaposto grigio, nessuna illustrazione.

### 4.7 Cosa NON fare

**Dal vecchio QUATTRO MURA e dalla ricetta bocciata**
- Nessuna planimetria, pianta, sezione, bussola o "sole che gira"; nessun
  ombreggiamento per orientamento. La casa si racconta con foto, numeri e
  parole.
- Nessuna foto di soggiorno in cornice a destra, nessuno split testo/foto nella
  prima schermata, nessuna didascalia "TAV. I".
- Nessuna riga di numeri tra filetti ("22 anni di attività", "68 giorni"),
  nessun contatore finto ("347 case vendute").
- Nessun occhiello in maiuscoletto spaziato, nessuna sezione numerata "01 ·".
- Niente Playfair, Cormorant, serif corsivo nei titoli, parola colorata nel
  titolo.
- Nessuna dissolvenza dal basso allo scroll: sul foglio **niente entra**,
  tutto è già stampato.
- Nessuna prenotazione a passi numerati che finisce in cartolina, scontrino,
  ricevuta o timbro "Confermato".

**Da MARGINALIA (3) e dagli altri concept**
- Niente crema o carta avorio calda: la carta è grigia fredda di giornale.
- Niente frontespizio centrato, cornici a doppio filetto, fleurons,
  capilettera, corsivi ornamentali: è un giornale, non un libro.
- Niente bianco-nero-rosso e titolone svizzero gigante (è STUDIO FORMA, 4).
- Niente cobalto o foto a tutto schermo (è BATTIFILO, 14); niente stanze in
  cui entrare (è IMBRUNIRE, 20).

**Specifici di EVIDENZIA**
- Non imitare quotidiani reali (testate, impaginati o caratteri del
  Gazzettino, del Messaggero Veneto, del Popolo o di altri): la testata è
  quella dell'agenzia.
- Niente giornale "vintage": carta ingiallita, macchie di caffè, bordi
  strappati, pieghe fotografiche, font da macchina da scrivere, texture di
  carta stropicciata. È la pagina di questo sabato.
- Niente rosa fuori dai gesti dell'utente (niente bottoni rosa, link rosa,
  titoli rosa, sfondi rosa). Niente secondo colore d'accento.
- Niente testo nei colori retino o rosa.
- Niente etichette sulle foto ("Novità", "Ribassato", "Venduto"): la novità si
  scrive nell'attacco dell'annuncio, in grassetto, come si fa sul giornale.
- Niente mappa disegnata, niente spilli a goccia, niente mappa decorativa
  nella pagina: la mappa vera esiste solo nel giro.
- Niente cursore personalizzato, niente scritte "trascina" o "scorri", niente
  testo ruotato in verticale.
- Niente figure umane disegnate, niente avatar, niente foto di agenti
  sorridenti con le chiavi.
- Niente abbreviazioni criptiche da annuncio anni '80 ("tricam. 2bagni risc.
  aut."): italiano pieno e asciutto ("tre camere, due bagni, riscaldamento
  autonomo").
- Niente trattini lunghi (né `—` né `–`) in nessun testo visibile; il punto
  medio al massimo uno per riga.
- Niente due bottoni con lo stesso intento: "Prepara il giro" è l'unico
  richiamo alla visita; "Evidenzia" è un'azione sull'annuncio, non una
  prenotazione.
- Nessun dato legale inventato (niente P.IVA, niente numero REA); recapiti di
  esempio.

### 4.8 Accessibilità

- Il DOM è un documento vero: `h1` la testata, `h2` le rubriche e i box, `h3`
  gli annunci (`article`), liste vere per la consistenza. Sulla vista "Pagina
  intera" il DOM non cambia (è solo una scala visiva).
- Tutte le funzioni del gesto hanno un bottone: Evidenzia, Togli, Prima /
  Dopo, Pagina intera / Leggi. Target minimi 44×44 px su touch.
- Scheda e pannello del giro sono dialoghi (`role="dialog"`, `aria-modal`,
  titolo collegato, focus intrappolato, `Esc` chiude, focus restituito).
- La mappa non è l'unica fonte: la colonna del giro, in ordine, contiene
  tutte le informazioni (orari, zone, tragitti). I marcatori hanno etichette
  ("Tappa 2, Torre, 9:45"). I controlli di zoom Leaflet restano raggiungibili
  da tastiera.
- Contrasti: testo nero su carta circa 13:1; secondario `#4F4C46` circa 6:1;
  testo nero sotto il rosa circa 5:1; il retino non porta mai testo. Focus
  visibile: contorno nero da 2 px con 2 px di stacco in colore carta.
- Il corpo minimo di lettura resta 15 px (desktop) e 16 px (mobile) anche
  se la pagina è densa.
- Nessun lampeggio: tratti, stacchi e percorso sono movimenti singoli,
  nessun cambio di luminosità ripetuto.
- `prefers-reduced-motion` come descritto in 4.4 e 4.5.

### 4.9 Mobile 375 px: il giornale piegato

- Il foglio si ricompone in **una colonna** di 343 px (margini 16 px),
  come la colonna di un giornale piegato in lungo: testata compatta
  (*EVIDENZIA* a circa 52 px, 900, su una riga, data sotto), filo nero, poi il
  riquadro di testa con il tratto dimostrativo, poi le rubriche in ordine.
  Non è "il desktop schiacciato": ogni annuncio a riquadro diventa largo come
  la colonna, le foto a retino occupano la larghezza, i box redazionali si
  inseriscono tra le rubriche come sul giornale.
- Sotto la testata, una striscia che scorre in orizzontale con i nomi delle
  rubriche (testo nero, la rubrica corrente sottolineata) per saltare.
- **La barra del giro** è in alto, fissa sotto la testata compatta, alta 48 px
  (in basso a sinistra c'è `ConceptBackButton`, 210×44, e non va coperto):
  "Il tuo giro", quattro posti a tratto rosa, **Prepara il giro**.
- Niente minipagina e niente "Pagina intera" sotto i 640 px: al loro posto,
  in fondo alla colonna, un riepilogo "Hai segnato" con le righe d'attacco
  evidenziate, che porta agli annunci.
- La scheda è un foglio a tutto schermo che sale dal punto dell'annuncio;
  foto che scorrono in orizzontale a tutta larghezza; chiusura con bottone in
  alto a destra; il tasto indietro di Android chiude la scheda (stato di
  history senza cambiare rotta, da decidere col tech-architect).
- Il giro a tutto schermo: mappa 45% in alto (l'attribuzione OSM resta
  leggibile), colonna sotto; i campi del modulo con tastiere giuste
  (`inputmode="tel"`, `autocomplete`).
- 768 px: foglio desktop a 3 colonne visibili con spostamento nei due assi e
  minipagina.

### 4.10 Note per le ondate successive

- **tech-architect**: niente WebGL, niente three per questo concept. Foglio =
  contenitore con `overflow: auto` nei due assi e griglia CSS; tratti in SVG
  posizionati sulle righe misurate dopo `document.fonts.ready` e ricalcolati al
  ridimensionamento. Leaflet 1.9 aggiunto al concept con import dinamico, CSS
  di Leaflet caricato solo con la mappa e stili contenuti nel prefisso del
  concept. Nessun accesso a `window`/`document` a livello di modulo (prerender).
  Retino: immagini preparate in fase di build o disegnate una volta su canvas,
  non filtri CSS pesanti a ogni frame. Porte 9160-9179 con `--strictPort`.
- **ux-architect**: definire l'impaginato esatto del foglio (quale annuncio in
  quale colonna, dove cadono i box) e la versione colonna. La prima schermata a
  1440 deve mostrare testata, riquadro di testa e almeno due colonne di
  annunci con un filetto tagliato al bordo destro (che dice "la pagina
  continua").
- **copywriter**: italiano da agenzia di Pordenone, frasi corte e concrete;
  20-24 annunci credibili con zone, metrature, classi energetiche, spese e
  prezzi di esempio verosimili; nomi friulani per agenti e clienti; niente
  verbi da startup; nessun dato legale.
- **motion-designer**: gli unici movimenti sono tratto, stacco dell'annuncio,
  passaggio retino-colore, spostamento del foglio da comandi, percorso sulla
  mappa, tratto "scarico". Nient'altro si muove.
- **trend-researcher**: cercare siti che usano la tipografia di giornale come
  interfaccia (non come estetica rétro), interazioni di annotazione e
  evidenziazione, mappe OSM integrate con stile sobrio. Estrarre principi,
  non copiare.
