# Creative director · Concept 15 · NOVANTA · Fisioterapia e osteopatia (Pordenone)

Ondata 0. Rotta `/concept-15`. Documento di direzione per tutti gli agent delle
ondate successive: quello che è scritto da "3. La scelta" in giù è vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 15, paragrafo
"15 · NOVANTA", verifica incrociata), `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 0, 1, 4, 9), `concepts/10-torchio/docs/creative-director.md` (solo per
livello e formato), screenshot `docs/concept-attuali/concept-9.jpg` (LUME) e
`concept-15.jpg` (il bocciato SNODO).

---

## 0. Cosa ho visto (base delle scelte)

**SNODO, il bocciato 15**: la ricetta di sempre. Testo a sinistra con titolo
serif e una parola arancio ("perché"), riga di quattro numeri tra due filetti
(2011, 1 900, 60 min, 55 €), due bottoni pieno + contorno, orari in piccolo, a
destra la foto in cornice di due mani del terapista su una spalla con la
didascalia "TAV. I". Poi "01 · Dove ti fa male?" con la sagoma del corpo da
toccare. Tutto questo è da evitare: il corpo come interfaccia, le mani sulla
spalla in foto, i numeri tra filetti, il serif.

**LUME, concept 9 (sanità buona, già approvata)**: bianco, azzurro `#5B9BD5`,
blu `#1C3553`, sans tondo, chip con icone ("Prima visita senza impegno",
"Pagamenti rateali"), foto dello studio e ritratto sorridente in cornice
sovrapposta, e sul fondo **archi concentrici chiari decorativi**. Quest'ultimo
dettaglio è il rischio vero per NOVANTA: un arco graduato su fondo chiaro può
richiamare quei cerchi. La differenza deve essere netta: in LUME gli archi sono
decorazione sottile e ferma su bianco; in NOVANTA l'arco è uno **strumento**
spesso, graduato, con un braccio pieno che si afferra, su un campo di colore
albicocca pieno. Niente chip, niente bianco-azzurro, niente ritratti.

**Il resto della matrice 11-20**: 18 SOTTOSCOCCA ha un'asta graduata verticale
(altezza in cm) e un planning lineare: NOVANTA non usa mai scale lineari
verticali né barre orizzontali di orari; tutto è circolare. 20 IMBRUNIRE ha toni
rosati ma terracotta media su blu notte; NOVANTA resta chiaro e caldo con il
petrolio come unico scuro.

---

## 1. Design Read e dial

**Design Read**: *Reading this as: sito vetrina con prenotazione per uno studio
di fisioterapia e osteopatia di Pordenone, per persone con un dolore o un
movimento limitato che cercano un professionista vicino (spesso da telefono, spesso
con fretta o male a un braccio), with a strumento-di-misura caldo e rassicurante
language, leaning toward un'unica interfaccia a quadrante in SVG + CSS
(trasformazioni su una variabile `--deg`), tipografia Epilogue per i gradi e Lexend per
la lettura, poche foto vere dello studio vuoto, nessun WebGL.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | La struttura è radicale (la pagina ruota invece di scorrere), ma il pubblico ha dolore e fretta: dentro ogni angolo l'impaginazione è calma, allineata, prevedibile. La stranezza sta nel quadrante, mai nel testo. |
| `MOTION_INTENSITY` | **4** | Un solo movimento vero: il braccio che ruota, con un'inerzia corta e un aggancio morbido. Tutto il resto è fermo o in dissolvenza breve. Chi ha dolore non vuole una pagina che si agita. |
| `VISUAL_DENSITY` | **3** | Un contenuto per angolo, poche righe, gradi grandi. Si legge con un occhio mentre si tiene il telefono con la mano che non fa male. |

Motivo del "trust-first" parziale: la sanità è un settore con vincoli di
fiducia (sezione 0.A punto 6 della skill). Per questo variance e motion stanno
sotto la base 8/6 del Lab, ma non ai valori da sito pubblico (3/2): è pur sempre
una vetrina da Awwwards.

---

## 2. La metafora sviluppata

**Il goniometro è l'unico oggetto del sito.** Il fisioterapista, alla prima
visita, appoggia il perno del goniometro sull'articolazione, tiene fermo un
braccio dello strumento lungo il segmento che non si muove e segue con l'altro il
movimento del paziente. Legge un numero: "fai 70°, l'obiettivo è 90". Da quel
momento il percorso di cura è una storia di gradi che tornano.

Tre cose rendono la metafora vera e non decorativa:

1. **Il braccio del goniometro è la navigazione.** Non si scorre la pagina: si
   ruota il braccio da 0° a 180°, e ogni angolo è un contenuto. Il numero dei
   gradi è grande e leggibile, sempre visibile: è l'unico "titolo di sezione"
   del sito (niente "01 ·").
2. **Su desktop la rotazione è letteralmente una spalla che si alza, senza
   disegnare nessun corpo.** Il perno sta sul bordo sinistro dello schermo, a
   metà altezza: la spalla è fuori dallo schermo, è quella di chi guarda. A 0° il
   braccio pende verso il basso, a 90° è orizzontale, a 180° punta in alto.
   È la convenzione vera della flessione della spalla. Nessuna sagoma, nessun
   omino: solo lo strumento e il suo arco. "Novanta" è il momento in cui il
   braccio arriva in orizzontale: il braccio che si alza fino a pettinarsi, a
   stendere, a prendere il barattolo sul ripiano.
3. **La prenotazione sta a 90°.** Il centro del quadrante è la prenotazione:
   ci si arriva da qualunque angolo con un solo gesto, il pollice lo raggiunge
   facilmente su mobile (il braccio dritto in su, al centro del mezzo cerchio), e
   il nome del sito coincide con il posto in cui si decide di venire.

Quello che la metafora NON è: una misura del dolore. I gradi misurano il
movimento, mai "quanto ti fa male". Nessuna scala 0-10, nessuna faccina, nessun
"dove ti fa male". Il sito parla di cosa si torna a fare, non di cosa fa male.

**Nome**: **NOVANTA**, *fisioterapia e osteopatia*, Pordenone. Indirizzo e
telefono di esempio li decide il copywriter (diversi da quelli di SNODO: niente
viale Grigoletti 72), mai dati legali inventati.

---

## 3. Tre varianti di esecuzione della stessa direzione

La direzione (goniometro come navigazione, palette albicocca/petrolio/gesso,
Epilogue + Lexend, settimana a ruota) è assegnata dalla matrice. Qui cambio solo
il modo di eseguirla.

### Variante A · "Sul tavolo"

Il goniometro è appoggiato orizzontale in basso al centro, su desktop come su
mobile: perno al centro del bordo inferiore, arco che sale a cupola, 0° a
sinistra e 180° a destra, come un goniometro scolastico sul banco. Il contenuto
sta sopra la cupola.

- Pro: una sola geometria per tutte le larghezze, facile da costruire.
- Contro: su desktop il braccio attraversa il contenuto o il contenuto va
  compresso in una fascia alta; somiglia a un tachimetro da cruscotto o a un
  indicatore di "punteggio" (e quindi a una scala del dolore); perde la
  lettura "spalla che si alza". Il semicerchio grande su fondo chiaro e centrato
  è anche la variante più vicina agli archi di LUME.

### Variante B · "Il ventaglio"

Il quadrante è diviso in sette spicchi pieni di colore, come un ventaglio
aperto; il braccio ruotando "riempie" gli spicchi e il contenuto vive dentro lo
spicchio attivo, che si allarga.

- Pro: molto grafico, riconoscibile in un'anteprima.
- Contro: il testo dentro uno spicchio è stretto e storto, illeggibile a 375 px;
  sembra un grafico a torta o un'infografica; lo spicchio pieno anticipa
  l'anello a spicchi della prenotazione e li rende due oggetti uguali (la
  prenotazione perde la sua unicità).

### Variante C · "Al bordo" (scelta)

Su desktop il goniometro è un mezzo disco attaccato al bordo sinistro dello
schermo: perno a metà altezza sul bordo, arco graduato che sporge verso destra
fino a circa il 40% della larghezza, 0° in basso, 90° orizzontale, 180° in alto.
Il contenuto dell'angolo attivo sta nel campo libero a destra, allineato alla
punta del braccio a 90° (la linea di lettura). Su mobile (sotto 760 px) il
mezzo disco scende in basso, perno al centro del bordo inferiore, 0° a
sinistra, 90° dritto in su, 180° a destra: sotto il pollice, come chiede la
matrice. Il contenuto sta sopra.

**Perché vince**

1. È l'unica delle tre in cui il gesto di navigare coincide con il gesto che il
   fisioterapista misura: alzare il braccio. Si capisce senza spiegazione e
   senza disegnare un corpo.
2. Il braccio non passa mai sopra il testo: su desktop il contenuto sta a
   destra dell'arco, su mobile sopra.
3. Tiene la prenotazione al centro (90°) in entrambe le geometrie, sempre al
   punto più comodo.
4. Mezzo disco appoggiato al bordo, pieno di gesso e graduato in petrolio: è
   un oggetto, lontano dai cerchi sottili e centrati di LUME.

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo (base per l'art-director)

**Palette** (tre colori della matrice, raffinati nei ruoli)

| Token | Hex | Ruolo |
|---|---|---|
| albicocca | `#F4D5C0` | **Fondo di tutto il sito.** Campo pieno, mai sfumato. È il colore dominante: il sito si riconosce da questo. |
| petrolio | `#0E3D49` | Braccio del goniometro, tacche, numeri, tutto il testo, bottone primario. Unico scuro, unico "accento". |
| gesso | `#FCF8F3` | Solo la faccia del goniometro (il mezzo disco) e le superfici di lettura lunga (listino, campi del modulo). Mai come fondo pagina. |
| derivati | petrolio al 72% su albicocca per il testo secondario (da verificare AA), albicocca scura `#E9BFA3` per le tacche fuori portata e per gli spicchi chiusi dell'anello | solo derivati, nessun colore nuovo |

Contrasto: petrolio su albicocca circa 8:1, petrolio su gesso circa 11:1. Il
testo non va mai in albicocca su gesso (contrasto insufficiente). Nessun
secondo accento: niente arancio, niente verde "ok", niente rosso d'errore
saturo (l'errore è petrolio con un segno, vedi 4.4).

Nota sulla regola "premium-consumer palette ban" della skill: il gesso è vicino
alle creme vietate, per questo non è mai il fondo. Il fondo è albicocca pieno,
che nessun concept 1-20 usa.

**Tipografia**

- *Epilogue* (variabile 100-900) per i gradi e per i titoli. Il numero dei
  gradi è l'elemento tipografico principale: Epilogue 800, dimensione grande
  (su desktop circa 22-26 vh, su mobile circa 96-112 px), cifre a larghezza
  fissa (`tnum` se disponibile, altrimenti ogni cifra in un box di larghezza
  fissa, così il numero non balla mentre gira), simbolo "°" in peso 300. Titoli
  degli angoli in Epilogue 700, minuscolo naturale, massimo 6 parole.
- *Lexend* 400/500 per tutto il testo, 18 px (17 px su mobile), interlinea 1.6,
  massimo 56 caratteri per riga. Lexend è progettato per ridurre lo sforzo di
  lettura: è la scelta giusta per chi legge con dolore o di fretta.
- Niente corsivo, niente maiuscoletto spaziato, niente monospace.

**Forme**: il sistema è circolare. Superfici rettangolari (campi, blocchi di
listino) con raggio unico 14 px; bottoni e manopole a pillola perché sono
oggetti da afferrare. Nessuna ombra se non quella, tinta di petrolio al 12%,
sotto il braccio del goniometro (è l'unico oggetto sollevato).

### 4.2 Il quadrante: struttura vera

**Geometria desktop (≥ 760 px)**
- Mezzo disco gesso, centro sul bordo sinistro a metà altezza, raggio pari al
  46% dell'altezza della finestra (max 480 px). Sporge verso destra.
- Tacche petrolio su un anello interno al bordo del disco: una tacca corta ogni
  grado da 0 a 180, media ogni 5°, lunga ogni 10°, con i numeri ogni 30°
  (0, 30, 60, 90, 120, 150, 180) in Epilogue 500. Le sette tacche lunghe dei
  contenuti hanno accanto, fuori dall'arco, la parola dell'angolo in Lexend
  500 (es. "trattamenti"): cliccabili.
- Il braccio: una riga piena petrolio (spessore 10 px, estremità arrotondate)
  dal perno fino oltre l'arco di 40 px, con una finestrella di lettura vicino
  alla punta (come quella dei goniometri veri) e una manopola tonda alla fine,
  il punto da afferrare. Il perno è un rivetto petrolio con un anello gesso.
- Il secondo braccio, quello fisso, è sul bordo dello schermo (verticale, verso
  il basso): non si disegna, è il bordo stesso. Lo 0° è il braccio che pende.
- Il numero dei gradi sta nel campo a destra, in alto, allineato a sinistra
  al contenuto, e cambia continuamente mentre il braccio gira.
- Il contenuto dell'angolo attivo sta sotto il numero, nel campo albicocca a
  destra del disco (colonna di circa 520 px). Una sola lettura per angolo.

**Geometria mobile (< 760 px, pensata per prima a 375 px)**
- Mezzo disco gesso con il perno al centro del bordo inferiore, raggio pari a
  circa il 44% della larghezza (circa 165 px a 375), 0° a sinistra, 90° in alto,
  180° a destra. Altezza totale del quadrante con le parole: circa 210 px.
- Le parole dei sette angoli non stanno tutte fuori dall'arco a 375 px: si
  mostrano solo quella attiva (sopra la manopola) e le due vicine, più
  piccole. Le altre sono solo tacche lunghe.
- Il numero dei gradi sta in alto a sinistra, il contenuto sotto, e il
  contenuto scorre verticalmente dentro la propria area se è lungo (listino).
  Il quadrante è fisso in basso, sopra la zona di sicurezza (`env(safe-area-inset-bottom)`).
- `ConceptBackButton` del sito sta in basso a sinistra sotto 640 px: va
  lasciato uno spazio libero di 56 px a sinistra del quadrante, oppure il
  quadrante si alza di 64 px. Da risolvere con il tech-architect guardando il
  bottone vero.

**Gli angoli (sette contenuti, uno ogni 30°)**

| Angolo | Nome sul quadrante | Contenuto | Visuale |
|---|---|---|---|
| **0°** | da zero | Apertura. Chi è lo studio in due frasi, per chi è (spalla, schiena, collo, ginocchio, dopo un intervento, dopo una caduta), e un solo bottone: **"Prenota"** (porta il braccio a 90°). È anche lo stato di arrivo del sito. | Una foto dello studio vuoto (luce di finestra sul lettino), o piano B tipografico. |
| **30°** | primo incontro | Cosa succede alla prima visita, in quattro momenti scritti come frasi (parliamo, guardiamo come ti muovi, misuriamo in gradi, ti diciamo quante sedute servono e quanto costano). Durata 60 minuti, cosa portare (referti, scarpe comode). | Un piccolo arco doppio: "oggi 70°", "obiettivo 90°", come esempio di come si legge una misura. SVG. |
| **60°** | trattamenti | Fisioterapia: terapia manuale, esercizio terapeutico, riabilitazione dopo intervento, taping. Ogni voce: una frase e la durata tipica. Niente griglia di schede. | Nessuna immagine o una sola foto dell'attrezzatura (elastici, spalliera). |
| **90°** | prenota | **La settimana a ruota** (vedi 4.4). È l'unico posto del sito in cui si prenota. | L'anello settimanale. |
| **120°** | osteopatia | Cos'è in parole semplici, quando ha senso e quando no (onestà: "se serve un medico te lo diciamo"), quanto dura una seduta. | Solo testo. |
| **150°** | esercizi | Tre esercizi da fare a casa tra una seduta e l'altra, descritti a parole, ognuno con il suo **angolo obiettivo** mostrato su un mini arco (es. "pendolo: fino a 30°", "scivolamento al muro: fino a 120°"). Nessun omino, nessun disegno del gesto. | Mini archi SVG che riprendono il quadrante. |
| **180°** | prezzi e dove | Listino di esempio verosimile (prima visita, seduta, osteopatia, pacchetto da 5), come si paga, detrazione fiscale con fattura sanitaria (formulata in modo generico, senza dati legali). Poi indirizzo, orari, telefono di esempio, "Apri in Maps" verso la mappa vera, parcheggio e piano con ascensore. | Una foto dell'ingresso o della sala (piano B: niente). |

Nota: la matrice elenca sei contenuti (primo incontro, trattamenti, osteopatia,
esercizi, prezzi, dove); li distribuisco su sette angoli aggiungendo 0° come
apertura e 90° come prenotazione, e unendo prezzi e dove a 180° ("fatto tutto il
giro: quanto costa e dove siamo"). Se il copywriter trova i due contenuti troppo
lunghi insieme, prezzi va a 180° e "dove" entra nel piede fisso (vedi sotto).
L'ordine segue la visita vera: si parte da zero, ci si conosce, si capisce cosa
si fa, si prenota a metà strada, poi il resto.

**Elementi fissi fuori dal quadrante**
- In alto a destra (desktop) o in alto (mobile): il marchio NOVANTA in Epilogue
  800 petrolio, il telefono di esempio come link `tel:` (chi ha dolore spesso
  vuole chiamare), e un interruttore **"vista elenco"**.
- Nessun menu a tendina: il menu è il quadrante.
- In fondo alla vista elenco e nel contenuto a 180°: "Un concept di CiceriLab",
  torna al Concept Lab.

**Vista elenco** (obbligatoria)
Un interruttore trasforma il sito in una normale pagina verticale: i sette
angoli uno sotto l'altro, ognuno con il suo numero di gradi come titolo, in
ordine. È la stessa struttura DOM (una `ol` di sette `section`) senza la
rotazione. È anche ciò che vede il prerender e chi ha JavaScript spento. La
scelta si ricorda in `localStorage` (try/catch).

### 4.3 Interazione firma: "Alza il braccio"

**Il gesto**
- **Trascinamento**: si afferra la manopola o qualsiasi punto del braccio (area
  di tocco almeno 48 px di spessore lungo tutto il braccio) e lo si porta
  attorno al perno; l'angolo è quello tra il puntatore e il perno, limitato a
  0-180. Anche toccare un punto qualunque del disco gesso porta il braccio lì.
- **Rotella / trackpad**: sulla pagina la rotella non scorre, ruota. Il delta
  si accumula: circa 1° per 4 px di delta, così un colpo di rotella avanza di
  circa 30° (un angolo). Se il puntatore è sopra un contenuto che scorre
  (listino lungo), prima scorre il contenuto e solo al suo fondo ruota il
  braccio. Trackpad: stessa regola, con soglia per non far scattare angoli con
  i piccoli tremolii.
- **Tocco sulle parole** del quadrante: il braccio va a quell'angolo.
- **Aggancio**: al rilascio il braccio si aggancia all'angolo di contenuto più
  vicino (magnete entro ±15°), con un movimento di circa 350 ms che frena alla
  fine (nessun rimbalzo elastico: una spalla che si muove bene non rimbalza).
- **Inerzia corta**: un lancio veloce prosegue al massimo di un angolo.

**Cosa succede mentre gira**
- Il numero dei gradi scorre grado per grado, continuo.
- Le tacche tra 0 e l'angolo attuale sono petrolio pieno; quelle oltre sono
  albicocca scura: l'arco "percorso" si vede, come una misura presa.
- Il contenuto cambia solo quando il braccio passa la metà tra due angoli
  (ogni 30°, a 15° dal centro): dissolvenza incrociata di 180 ms, il testo nuovo
  entra spostandosi di 8 px nella direzione della rotazione. Nessuna animazione
  lettera per lettera.
- La parola dell'angolo sul quadrante diventa petrolio pieno, le altre al 60%.
- Il braccio proietta la sua piccola ombra tinta sul disco gesso (unica
  profondità del sito).
- A 90° esatti la finestrella di lettura del braccio mostra "90" e il campo
  a destra si apre sull'anello della prenotazione: è l'unico momento in cui il
  contenuto non è testo.

**Alternativa da tastiera**
- Il braccio è un elemento `role="slider"` focalizzabile con
  `aria-valuemin="0"`, `aria-valuemax="180"`, `aria-valuenow`, e
  `aria-valuetext` parlante ("90 gradi, prenota").
- Frecce destra/su: +30° (angolo successivo); sinistra/giù: -30°. Con Maiuscole
  premuto: ±1° (per chi vuole "giocare" con la misura; il contenuto segue
  l'angolo più vicino). Home: 0°, Fine: 180°.
- Le sette parole del quadrante sono anche link di un `nav` con una `ol`
  (primo incontro, trattamenti...), raggiungibili con Tab dopo il braccio.
- Il cambio di contenuto è annunciato con una regione `aria-live="polite"` che
  dice solo il titolo dell'angolo, non tutto il testo.
- Focus sempre visibile: anello petrolio di 3 px distanziato di 3 px, sulla
  manopola anche quando il braccio ha il focus.
- Il link "Salta al contenuto" porta al contenuto dell'angolo attivo.
- Screen reader: il quadrante SVG è `aria-hidden`; si legge come un normale
  elenco di sette sezioni (la struttura DOM della vista elenco è sempre lì,
  anche quando è mostrata ruotata).

**URL**: ogni angolo ha il suo frammento (`/concept-15#gradi-90`), così un link
condiviso apre il braccio al posto giusto, e il tasto Indietro del browser
torna all'angolo precedente senza uscire dal sito.

### 4.4 Meccanica unica di prenotazione: "La settimana a ruota"

**Idea**: nessuno guarisce in una seduta. Quando prenoti la prima visita il
sistema ti fissa già il controllo a 7-10 giorni, sullo stesso anello. Prenoti
un piccolo ciclo, non una visita sola: è il vero bisogno del paziente (sapere
quando tornerà) e il vero bisogno dello studio (che il paziente torni).

**L'oggetto**
- Un anello SVG con **7 spicchi** (lunedì in alto, poi in senso orario), uno
  per giorno della settimana. Due piste concentriche:
  - **pista interna**: questa settimana, dove si sceglie la **prima visita**;
  - **pista esterna**: la settimana dopo, dove compare il **controllo**.
- Dentro ogni spicchio, le ore sono tacche radiali (dalle 8 alle 20 su
  lun-ven, 8-13 il sabato; domenica chiusa, spicchio albicocca scuro senza
  tacche e con scritto "chiuso"). Tacca petrolio = ora libera; tacca albicocca
  scura corta = occupata. Orari di esempio verosimili e fissi nel codice (non
  è una disponibilità live e non si finge che lo sia).
- In alto all'anello (a ore 12) c'è un **indice fisso**: lo stesso braccio del
  goniometro, corto, che a 90° punta dentro l'anello. È il punto di lettura.
- Al centro dell'anello: la lettura in chiaro dell'ora sotto l'indice, in
  Epilogue grande ("mer 7 · 18:00") e sotto, in Lexend, "prima visita, 60 min".
  (Un solo `·` per riga.)

**Il gesto**
- Si **ruota l'anello** (trascinamento circolare, rotella, frecce) finché
  un'ora libera sta sotto l'indice. L'anello si aggancia solo alle ore
  libere: le occupate vengono saltate, così non si può "cadere" su un'ora
  piena.
- Appena una prima visita è scelta, sulla pista esterna si accende il
  **controllo proposto**: stessa ora, giorno tra +7 e +10, il primo libero. Un
  arco petrolio sottile unisce i due punti sull'anello (il "ciclo").
- Il controllo si può spostare con due bottoni a pillola "prima" / "dopo"
  accanto alla sua lettura ("controllo: gio 15 · 18:00"), solo dentro la
  finestra 7-10 giorni e solo su ore libere. Oppure si può togliere
  ("solo la prima visita"), ma il default è il ciclo.
- Sotto l'anello, tre campi: **nome**, **telefono** (obbligatori), **"cosa ti
  porta da noi"** facoltativo (testo libero breve, suggerimenti a tocco:
  "spalla", "schiena", "collo", "ginocchio", "dopo un intervento"). Nessuna
  scala del dolore, nessuna domanda clinica. Etichetta sopra, errore sotto,
  niente placeholder come etichetta.
- Un solo bottone: **"Fissa le due visite"** (o "Fissa la visita" se il
  controllo è stato tolto).

**Alternativa senza gesto**: sotto l'anello, per tastiera, screen reader e per
chi preferisce, un elenco "Tutte le ore libere" raggruppato per giorno
(`<select>` o gruppi di radio). Scegliere lì ruota l'anello allo stesso punto.
L'anello è `role="slider"` con `aria-valuetext` = "mercoledì 7 ottobre, ore 18,
libero"; frecce = ora libera successiva/precedente, PagSu/PagGiù = giorno
successivo/precedente.

**Stati**
- **Vuoto (arrivo a 90°)**: l'anello è già girato sulla prima ora libera utile
  (mai vuoto, mai "scegli una data"); la pista esterna mostra le tacche ma
  nessun controllo acceso; una riga dice "Gira l'anello fino a un'ora che ti
  va. Il controllo lo fissiamo noi, una settimana dopo."
- **Nessun controllo possibile** nella finestra 7-10 giorni per quell'ora: la
  proposta cade sull'ora libera più vicina in quei giorni, e la frase lo dice
  ("alle 18 non c'è posto: ti proponiamo le 17:30").
- **Errore di campo**: telefono non valido o nome vuoto; messaggio sotto il
  campo in petrolio con un segno (un piccolo cerchio barrato da icona di
  libreria), nessun rosso, nessuna vibrazione del modulo. Il focus va al primo
  campo sbagliato.
- **Errore di posto** (simulato: l'ora è stata presa nel frattempo): la tacca
  si spegne in dissolvenza, l'anello si sposta da solo alla prossima ora libera
  e lo dice in una frase; i campi restano compilati.
- **Invio in corso**: il bottone resta dov'è con la scritta "Fissiamo...", l'arco
  del ciclo si completa lentamente da un punto all'altro (400-600 ms); nessuno
  spinner.
- **Successo**: niente cartolina, ricevuta, scontrino o schermata nuova. Le due
  tacche scelte restano sull'anello come due punti pieni, uniti dall'arco del
  ciclo; le altre tacche si attenuano. Al centro dell'anello: "Ci vediamo
  mercoledì 7 alle 18. Il controllo è giovedì 15 alle 18." Sotto, due azioni:
  "Aggiungi al calendario" (file .ics con due eventi, generato nel browser) e
  "Cambia" (riapre la scelta). Un SMS di conferma è promesso in una riga
  ("ti scriviamo il giorno prima"). Il `track("demo_prenotazione")` parte qui.
- **Invio fallito** (simulabile): l'arco del ciclo torna indietro, una frase
  dice di chiamare il numero di esempio, i dati restano.

**Perché è unica**: 18 SOTTOSCOCCA è un planning lineare di tre ponti con
blocchi di durata diversa; 20 IMBRUNIRE sceglie notti su un nastro di lune;
LUME è un widget clinico a passi. Qui la settimana è un anello e il sistema
prenota due appuntamenti con un gesto solo.

### 4.5 Foto

- **Servono poche, e solo dello studio vuoto**: luce di finestra su un
  lettino, una stanza chiara con una spalliera, elastici o un rullo appoggiati,
  una porta d'ingresso. Al massimo tre in tutto il sito: 0°, 60° (facoltativa),
  180°.
- **Vietato**: persone, medici in camice, mani del terapista su una spalla o su
  una schiena (era la foto di SNODO), scheletri e modelli anatomici, radiografie,
  stetoscopi, sorrisi in cornice (LUME), attrezzature da ospedale.
- Trattamento: foto senza cornice, a filo del bordo destro (desktop) o come
  fascia a tutta larghezza sopra il testo (mobile), con una leggera velatura
  albicocca in `multiply` (circa 12%) così appartengono alla palette. Nessuna
  didascalia decorativa, nessuna etichetta sopra la foto.
- Da Unsplash, scaricate e guardate una per una con Read (regole di
  `docs/lab-operativo.md`), autore e URL annotati nel doc dell'art-director.
- **Piano B**: se non si trova uno studio di fisioterapia vuoto e credibile, non
  si mette nessuna foto. L'angolo mostra il numero dei gradi ancora più grande e
  il testo; il sito regge da solo perché l'oggetto è il quadrante.

### 4.6 Uso di SVG e CSS

- **Un solo SVG principale**: il quadrante (disco, tacche, numeri, braccio,
  perno) generato da codice (tacche calcolate in un ciclo, non disegnate a
  mano). Il braccio ruota con `transform: rotate(var(--deg))` sul gruppo, perno
  come `transform-origin`. Nessuna libreria di animazione necessaria: una molla
  corta in `requestAnimationFrame` o transizione CSS per l'aggancio. GSAP non
  serve.
- **Secondo SVG**: l'anello della settimana, stessa logica (spicchi e tacche
  calcolati).
- **Mini archi** a 30° e 150° (obiettivi di movimento): varianti piccole dello
  stesso componente del quadrante, non illustrazioni nuove.
- Icone (poche: telefono, calendario, errore) da una libreria (Phosphor o
  Tabler), mai disegnate a mano.
- Tutto il resto è CSS: fondo pieno, griglia, tipografia. Nessun WebGL, nessun
  canvas: la matrice riserva a NOVANTA l'unico "SVG/CSS puro" della serie.

### 4.7 Cosa NON fare

**Il corpo (regola di Luca e differenza da SNODO)**
- Nessuna sagoma umana, omino, silhouette, scheletro, muscolo, articolazione
  disegnata, mano, braccio umano, nemmeno stilizzati o fatti di linee. Il
  "braccio" del sito è sempre e solo il braccio dello strumento.
- Nessuna mappa del corpo, nessun "tocca dove ti fa male", nessun elenco di
  zone del corpo come interfaccia principale (le zone esistono solo come
  suggerimenti di testo nel campo facoltativo).
- Nessuna scala del dolore 0-10, nessuna faccina, nessun termometro.

**LUME e la sanità generica**
- Niente bianco, niente azzurro, niente archi concentrici decorativi sottili,
  niente chip con icona ("prima visita senza impegno"), niente foto di persone
  sorridenti, niente croci, cuori, onde del battito.
- Niente widget a passi: la prenotazione non ha "passo 1, 2, 3".

**La ricetta bocciata**
- Niente split testo a sinistra e foto in cornice a destra nella prima
  schermata; niente riga di numeri tra due filetti ("dal 2011", "1 900
  pazienti"); niente due bottoni pieno + contorno; niente "TAV. I".
- Niente "01 ·" o occhielli in maiuscoletto spaziato: il numero dei gradi è
  l'unico indice.
- Niente schede con bordino e ombra, niente griglie di card per i trattamenti.
- Niente fade-up allo scroll (e comunque non c'è scroll).
- Niente mappa disegnata: "Apri in Maps" verso la mappa vera.
- Nessuna cartolina, scontrino, ricevuta o "certificato" alla fine della
  prenotazione.

**Del quadrante stesso**
- Il quadrante non diventa un tachimetro, un "punteggio" o un indicatore di
  prestazione: niente zone colorate verde/giallo/rosso, niente lancetta rossa.
- Non scrivere testo lungo lungo l'arco o ruotato con il braccio: il testo è
  sempre orizzontale e fermo.
- Non far girare il braccio da solo all'apertura (niente giro dimostrativo
  0→180): al massimo, alla prima visita, la manopola fa un solo piccolo
  "invito" di 6° avanti e indietro dopo 3 s di inattività, una volta sola, e
  mai con reduced motion.
- Non sovrapporre il braccio al testo.
- Niente cursore custom, niente cerchio che segue il mouse.
- Non mettere due richiami con lo stesso intento: "Prenota" esiste a 0° e
  nella vista elenco (porta a 90°); nessun altro bottone di prenotazione.
- Nessun trattino lungo (`—` o `–`) nei testi visibili; `·` massimo uno per riga.
- Nessun contatore finto, nessuna recensione con nome generico.

### 4.8 Accessibilità e reduced motion

- **Contrasti**: tutto il testo in petrolio su albicocca o su gesso (AA
  largamente superato). Testo secondario al 72% da verificare con strumento:
  se sotto 4.5:1 si torna al 100%. Tacche "fuori portata" sono decorative.
- **Target**: manopola del braccio almeno 48×48 px, parole del quadrante con
  area di tocco almeno 44 px anche se il testo è piccolo, tacche dell'anello
  non si toccano singolarmente (si gira l'anello o si usa l'elenco).
- **Struttura**: `main` con una `ol` di sette sezioni con `h2` ("Primo
  incontro"...), gradi come testo accessorio; il quadrante SVG `aria-hidden`; il
  braccio e l'anello come `role="slider"` con testo parlante; regione
  `aria-live` solo per il titolo dell'angolo e per l'esito della prenotazione.
- **Senza JavaScript / prerender**: si vede la vista elenco completa, senza
  quadrante interattivo. Nessun accesso a `window`/`document` a livello di
  modulo.
- **Zoom 200% e testo grande**: se la finestra è bassa (sotto 560 px di
  altezza su desktop) o il testo è ingrandito, il sito passa da solo alla vista
  elenco.
- **`prefers-reduced-motion: reduce`**: il braccio non ha inerzia né molla,
  salta all'angolo scelto; il numero dei gradi cambia direttamente al valore
  finale (niente conteggio); il contenuto cambia con una dissolvenza di 120 ms
  senza spostamento; nessun "invito" della manopola; l'anello della settimana
  salta all'ora scelta; l'arco del ciclo compare già completo. Il gesto di
  trascinamento resta (è un controllo, non un'animazione).
- **Niente lampeggi**: nessun cambio di luminosità più veloce di 3 volte al
  secondo; le tacche si accendono in continuo, non a scatti colorati.

### 4.9 Mobile 375 px (pensato per primo)

- Schermata: marchio e telefono in alto (48 px); numero dei gradi grande a
  sinistra (circa 104 px di corpo); titolo dell'angolo; testo (massimo 5-6
  righe visibili senza scorrere nell'area); quadrante in basso, fisso, circa
  210 px, sotto il pollice. Nessuno scroll di pagina: scorre solo l'area del
  contenuto quando serve.
- Il pollice destro trascina il braccio da sinistra a destra; il pollice
  sinistro lo raggiunge ugualmente perché 90° è al centro.
- A 90° la prenotazione prende quasi tutto lo schermo: l'anello (circa 300 px
  di diametro) sale in alto, il quadrante si riduce a una fascia di 64 px con
  solo il braccio corto e il "90", e i campi scorrono sotto l'anello, che resta
  visibile in versione ridotta (circa 140 px) appena si entra nei campi, così
  la scelta fatta resta in vista mentre si scrive.
- La tastiera del telefono non deve coprire il bottone: il campo attivo va
  portato in vista, e il bottone "Fissa le due visite" è sotto l'ultimo campo,
  non fisso in basso.
- Il bottone "torna a CiceriLab" in basso a sinistra non deve cadere sulla
  zona 0° del quadrante: vedi 4.2.
- Orientamento orizzontale del telefono: si usa la geometria desktop se la
  larghezza supera 760 px, altrimenti la vista elenco.
- 375 deve essere bello quanto 1440: il mezzo disco gesso in basso sul fondo
  albicocca è l'immagine del sito anche sul telefono, non una versione ridotta.

### 4.10 Note per le ondate successive

- **ux-architect**: definire i testi di ogni angolo con il limite di righe di
  4.9; decidere se "prezzi" e "dove" restano insieme a 180°.
- **art-director**: verificare contrasti del petrolio al 72%; scegliere se
  Epilogue ha `tnum` (altrimenti box a larghezza fissa per le cifre); scrivere
  i token dei tre colori e dei derivati.
- **interaction-designer**: la molla dell'aggancio senza rimbalzo, la soglia
  della rotella/trackpad, la gestione del conflitto rotella/scroll interno.
- **copywriter**: italiano da studio di Pordenone, frasi brevi, niente gergo
  clinico non spiegato, niente promesse di guarigione, niente dati legali;
  prezzi e orari di esempio verosimili.
- **trend-researcher**: siti Awwwards con navigazione radiale o a quadrante
  (estrarre come rendono leggibile la rotazione), strumenti di misura resi in
  SVG; pattern di sanità da evitare.
- **tech-architect**: niente WebGL; un componente `Quadrante` riusato per
  navigazione, mini archi e (in variante) indice dell'anello; porte 9150-9159 (regola di `docs/lab-operativo.md`).
