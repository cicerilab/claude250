# Trend researcher · Concept 16 · EVIDENZIA (agenzia immobiliare, Pordenone)

Ondata 1. Input letti: `docs/ruoli-agent.md`, `docs/concept-lab.md` (ricetta
bocciata), `docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga e
paragrafo 16, verifica incrociata), `concepts/16-evidenzia/docs/creative-director.md`
(tutto, in particolare 4.1-4.10), `.claude/skills/taste/SKILL.md` e
`references/extract.js`, `concepts/10-torchio/docs/trend-researcher.md` (solo
formato).

Scopo: dare all'ondata 2 (art-director, motion-designer, interaction-designer,
copywriter, vector-artist, photo-editor) e al tech-architect **principi da
reinterpretare**, **pattern da non usare** e i **rischi veri** del concept, con
numeri dove si possono calcolare. Nessun codice di prodotto.

---

## 1. Fonti consultate e cosa è stato bloccato

### 1.1 Tentativo /taste (bloccato, dichiarato)

Ho seguito la pipeline di `/taste` con Playwright 1.56.1 (Chromium in
`/opt/pw-browsers`, viewport 1440×900, estrattore `references/extract.js`),
26/09/2026. Script: `concepts/16-evidenzia/qa/taste/cap.cjs`.

| URL | Perché era scelto | Esito |
|---|---|---|
| `https://www.ft.com/` | carta tinta come identità di un giornale, griglia fitta di titoli | bloccato, `net::ERR_CERT_AUTHORITY_INVALID` |
| `https://www.ilpost.it/` | quotidiano italiano, tipografia come interfaccia, niente fronzoli | bloccato, stesso errore |
| `https://www.themodernhouse.com/` | agenzia immobiliare che vende case con linguaggio editoriale | bloccato, stesso errore |
| `https://newyork.craigslist.org/search/apa` | piccoli annunci di case in forma pura, densità massima | bloccato, stesso errore |
| `https://web.hypothes.is/` | annotazione ed evidenziazione come gesto principale | bloccato, stesso errore |
| `https://www.openstreetmap.org/#map=14/45.9560/12.6600` | tile OSM standard su Pordenone, come appariranno nel giro | bloccato, stesso errore |

Causa: il Chromium di Playwright non si fida del certificato del proxy di
uscita dell'ambiente. Aggirarlo (disattivare o allentare la verifica TLS) è
stato **negato dalla policy** della sessione e non l'ho inseguito per altre
strade. **Nessun file `{dominio}.md` / `.json` è stato prodotto** e nessun
valore px/hex di siti esterni in questo documento è misurato.

Per avere il /taste vero serve che Luca renda il certificato del proxy
affidabile per il Chromium di Playwright (store NSS del browser o
configurazione dell'ambiente su claude.ai); poi lo script `cap.cjs` gira così
com'è sugli stessi URL.

### 1.2 Ripiego A: libreria locale awesome-design-md (letta davvero)

Dei sistemi in `design-references/awesome-design-md/design-md/` ne ho letti 4.
Nessuno somiglia a EVIDENZIA: ognuno risolve **un pezzo** del problema.

| Sistema | Perché è utile qui | Cosa ne prendo (principio, non stile) |
|---|---|---|
| **wired** | Rivista stampata portata sul web: raggio 0 su ogni bottone e campo, nessuna ombra, tre famiglie con ruoli rigidi (serif per il racconto, sans per struttura e bottoni), righe di storie separate da filetti di 1 px, unico colore extra (blu `#057dbc`) confinato ai link *dentro* il testo lungo. | La grammatica della stampa si ottiene con regole d'uso, non con texture. Un colore extra resta forte solo se ha **un solo contesto** ammesso (lì i link nel corpo, qui i gesti dell'utente). Il rosa di EVIDENZIA è lo stesso contratto, più severo. |
| **dell-1996** | Catalogo stampato del web prima dei CSS: cornice nera, titoli Arial Black 900, corpo Times 14, rosso riservato a **due** cose (pannello d'azione e numero di telefono in alto), palette "chiusa per progetto". | 1) Grottesco nerissimo per i titoli + serif per il testo: è la coppia della carta stampata economica (qui Libre Franklin 800-900 + Newsreader). 2) "Il sito finisce con una telefonata": il telefono dell'agenzia è navigazione, non piè di pagina. 3) Palette chiusa: nessun colore si aggiunge "per uno stato". Da **non** prendere: bollini "NEW!", sigilli, cornici smussate (è il vintage che il creative-director vieta). |
| **airbnb** | Il riferimento inevitabile di chi cerca casa online: un solo colore (Rausch `#ff385c`) che porta CTA, cuore "salvato" e marcatori della mappa; schede con foto 1:1 a raggio 14 px, badge sulle foto, cuore in alto a destra, mappa con spilli colorati. | Una cosa buona: il colore unico coincide con lo **stato "salvato"** dell'utente. EVIDENZIA porta l'idea fino in fondo togliendo il rosa anche ai bottoni. Tutto il resto è il **catalogo di cosa evitare** (scheda-foto arrotondata, badge "Guest favorite", cuore, pill di ricerca): è il linguaggio che l'utente vede ogni giorno su Immobiliare e Idealista, e EVIDENZIA deve sembrare il contrario. |
| **theverge** | Titoli display enormi, blocchi di colore pieno, zero gradienti; ma fondo scuro, raggi tondi, mono maiuscolo per le etichette. | Solo una regola: il colore saturo funziona pieno e piatto, mai sfumato. Il mono maiuscolo per etichette e i tag a pillola sono ricetta bocciata e **non** vanno presi. |

Scartati dopo lettura dell'intestazione: `notion`, `uber` (mappa dentro una
card arrotondata con ombra: l'opposto della piantina di carta), `claude`,
`mastercard` (carte calde, già usate da IMPRONTA e MARGINALIA).

### 1.3 Ripiego B: riferimenti noti (a memoria, non verificati in sessione)

Cito solo il *genere* di lavoro che conosco con certezza, senza inventare
misure. Da verificare con /taste quando la rete lo permette.

- **Financial Times**: la carta tinta (il rosa salmone) è l'identità del
  giornale, sia stampato sia online, da decenni. Principio: **il fondo è il
  marchio**. Per EVIDENZIA il grigio freddo `#E4DFD1` fa lo stesso lavoro: deve
  essere riconoscibile anche con zero testo in vista.
- **Il Post**: quotidiano online italiano costruito quasi solo con tipografia e
  filetti; titoli in grassetto, nessun ornamento. Principio: un giornale
  italiano credibile non ha bisogno di decorazione per sembrare giornale.
- **The Modern House** (agenzia immobiliare londinese): vende case come
  articoli di una rivista, con descrizioni lunghe e foto sobrie. Principio:
  **la descrizione scritta bene vende la casa** quanto la foto. Da non
  prendere: il tono da rivista di lusso (qui è Pordenone, prezzi veri).
- **Craigslist e i piccoli annunci dei quotidiani**: densità massima, zero
  gerarchia visiva, ma la gente li legge davvero. Principio: la densità è
  accettata quando **ogni riga è informazione** (zona, tipologia, prezzo).
- **Hypothesis, evidenziazioni di Kindle e Medium**: l'evidenziatore digitale
  è ormai un gesto conosciuto, sempre un rettangolo piatto e perfetto dietro al
  testo. Principio: il gesto si capisce da solo; la **differenza** di
  EVIDENZIA sta nel tratto fisico (punta a scalpello, sopra il testo in
  multiply, stesso seme a ogni visita).
- **Tile OpenStreetMap standard e Leaflet**: la cartografia OSM è colorata
  (verdi, arancioni delle strade principali, azzurri). Stili monocromatici
  come Stamen Toner esistono ma oggi richiedono fornitori terzi con chiave:
  **non** sono un'opzione per il prototipo. Principio: la mappa si armonizza
  con il contenitore, non ricolorandola.

---

## 2. Principi da reinterpretare (10)

Ogni principio: da dove viene, poi come si applica a EVIDENZIA.

### P1 · Un colore, un solo contesto ammesso
*Da: wired (blu solo nei link del testo lungo), dell-1996 (rosso solo in due posti), airbnb (Rausch = stato salvato).*
**Qui**: il rosa `#EE5A9E` esiste **solo come conseguenza di un gesto
dell'utente** (tratto, segno sulla minipagina, posto riempito nella barra del
giro, marcatore e percorso sulla mappa) più l'unico tratto dimostrativo del
riquadro di testa. Test per l'art-director: fai lo screenshot della pagina
appena aperta con storage vuoto; il rosa deve coprire **meno dell'1%** della
superficie (solo il tratto su "Segna"). Se c'è altro rosa, è un errore.

### P2 · Il fondo è il marchio
*Da: FT (carta salmone), wired (bianco puro come scelta, non come default).*
**Qui**: `#E4DFD1` è l'unico fondo di foglio, scheda, pannello del giro,
contenitore della mappa e campi del modulo (campi con bordo nero da 1 px su
carta, **non** campi bianchi). Niente bianco puro da nessuna parte: un campo
bianco su carta grigia diventerebbe l'elemento più luminoso della pagina e
ruberebbe l'occhio al rosa.

### P3 · Grottesco nero per chiamare, serif per leggere
*Da: dell-1996 (Arial Black + Times), wired (serif per il racconto, sans per struttura e bottoni).*
**Qui**: Libre Franklin porta tutto ciò che si **scansiona** (testata, barre
rubrica, attacco dell'annuncio, prezzo, orari del giro, bottoni); Newsreader
porta tutto ciò che si **legge** (testo annuncio, descrizione, citazioni).
Regola per l'art-director: nessun elemento cliccabile in Newsreader, nessun
testo sopra le due righe in Libre Franklin. L'occhio impara in pochi secondi
che "grassetto = dove toccare e cosa costa".

### P4 · Densità accettata perché ogni riga è informazione
*Da: piccoli annunci, Craigslist.*
**Qui**: nell'annuncio piccolo l'ordine fisso è **zona e tipologia** (attacco
in 800), **tre fatti** (metri, locali, piano o giardino), **una riga di
carattere** (la cosa che lo distingue), **prezzo**. Il copywriter non scrive
aggettivi vuoti ("splendido", "luminosissimo"): ogni parola deve poter essere
evidenziata con senso. La densità si regola con interlinea e filetti, mai
scendendo sotto 15 px (desktop) / 16 px (mobile).

### P5 · La griglia varia per formato, non per capriccio
*Da: impaginato dei quotidiani, wired (1 grande + 2 medi + righe).*
**Qui**: i quattro formati (piccolo, con foto, a riquadro con bordo 2 px,
di testa) sono l'unica fonte di ritmo. L'ux-architect distribuisce i formati
in modo che in ogni schermata a 1440 ci sia almeno un riquadro e non più di
due foto a retino affiancate. Nessuno spazio vuoto "di respiro" tra rubriche:
su un giornale vero la rubrica successiva comincia subito sotto il filetto.

### P6 · Il telefono è navigazione
*Da: dell-1996 (numero in alto su ogni pagina: "il sito finisce con una telefonata").*
**Qui**: in un'agenzia di provincia la prenotazione si chiude a voce, e il
creative-director lo sa già (telefono obbligatorio, "Chiara ti richiama").
Il link **Chiama** dell'agenzia (senza numero finto in vista, come vuole il
copywriter) deve essere raggiungibile sempre: nella barra del giro su mobile
o nel box *L'agenzia* a portata di un salto da tastiera. Non diventa un
secondo bottone "prenota": è un recapito.

### P7 · Grammatica della stampa senza imitare la carta
*Da: wired (raggio 0, niente ombre, filetti 1 px).*
**Qui**: la "cartità" nasce da raggio 0, filetti di colonna `#8F8B82` da
1 px, filo nero da 3 px sotto la testata, barre rubrica in negativo, piede
del foglio con numero di pagina. **Niente** texture fotografica di carta,
grana, pieghe, strappi. L'unica ombra ammessa è quella dell'annuncio che si
stacca (tinta carta, come da 4.3), e dura solo durante lo stacco.

### P8 · Il segno fisico come prova che è tuo
*Da: evidenziazioni digitali (Hypothesis, Kindle), per differenza.*
**Qui**: il rettangolo piatto dietro al testo è ciò che fanno tutti. Il
tratto di EVIDENZIA si riconosce perché è **sopra** il testo in multiply,
ha la punta a scalpello, le striature, più inchiostro all'inizio e alla
fine, e soprattutto è **sempre lo stesso** quando torni (seme salvato per
annuncio). Il vector-artist disegna 3-4 forme base di estremità, non una
sola, e le combina col seme: così venti annunci evidenziati in una pagina
non sembrano venti copie.

### P9 · La casa si racconta a parole prima che in foto
*Da: The Modern House (descrizione lunga), piccoli annunci senza foto.*
**Qui**: rafforza il piano B del creative-director. Gli annunci senza foto
non sono annunci "di serie B": nella scheda hanno la descrizione a 18 px più
lunga e i tre blocchi di consistenza (la casa, i costi, fuori) in primo
piano. Il confronto €/m² con la zona è la frase più utile di tutta la scheda
e va composta come titolo secondario (Libre Franklin 700), non come nota.

### P10 · La mappa si accorda col contenitore, non si ridipinge
*Da: tile OSM standard; per differenza da airbnb e uber (mappa in card arrotondata, spilli colorati).*
**Qui**: la mappa sta a spigolo vivo nel pannello, con fondo carta intorno,
tile leggermente desaturati (grayscale 35%, come deciso) e **tutta la voce
grafica affidata al percorso rosa largo e ai marcatori a macchia**. I
controlli Leaflet ristilati nero su carta, raggio 0. L'attribuzione OSM
leggibile in Newsreader o Libre Franklin 13-14 px, nero secondario su carta,
non il grigio chiaro di default.

---

## 3. Pattern inflazionati da evitare (10)

I primi quattro sono la ricetta bocciata applicata a questo mestiere; gli
altri sono i cliché del settore immobiliare e del "giornale sul web".

1. **La ricetta bocciata del Lab, intera**: titolone serif corsivo
   (Cormorant, Playfair) con sottotitolo sans, occhielli in maiuscoletto
   spaziato o mono, sezioni numerate "01 ·", griglie di schede bianche con
   bordino e ombra leggera, dissolvenza dal basso a ogni scroll, onde e
   divisori decorativi, mappa disegnata a mano, prenotazione a passi che
   finisce in cartolina o scontrino, figure umane in SVG. Su EVIDENZIA non
   entra nulla allo scroll: il foglio è già stampato.
2. **Il vecchio QUATTRO MURA**: planimetria col sole, bussola, "TAV. I",
   foto di soggiorno in cornice a destra, riga di quattro numeri tra filetti
   ("22 anni", "68 giorni", "2% + IVA"), parola del titolo colorata in ocra.
3. **La scheda-foto da portale** (Immobiliare, Idealista, Airbnb): foto 4:3 o
   1:1 con angoli arrotondati, carosello a pallini, cuore in alto a destra,
   badge "Esclusiva", "Novità", "Ribassato" sulla foto, prezzo in un bollino.
4. **La barra di ricerca a filtri** in cima (comune, tipologia, prezzo
   min/max, locali, "Cerca") come hero. EVIDENZIA sostituisce il filtro con
   la lettura: la pagina è già la selezione dell'agenzia.
5. **Il giornale "vintage"**: carta ingiallita, macchie di caffè, bordi
   strappati, font da macchina da scrivere, testate gotiche tipo Old English,
   colonne giustificate con sillabazione da tipografia ottocentesca, retino
   usato come filtro "effetto stampa" su tutto. È la pagina di questo sabato.
6. **Il flipbook**: giro di pagina 3D, sfoglia stile Issuu (già scartato dal
   creative-director come variante B).
7. **Hero con foto a tutto schermo di un soggiorno luminoso** e claim
   "Trova la casa dei tuoi sogni", con agente sorridente che porge le chiavi.
8. **La mappa di ricerca a destra con spilli a goccia e prezzi nei
   bollini** (layout lista + mappa affiancate dei portali). In EVIDENZIA la
   mappa esiste solo nel giro, e i marcatori sono macchie di evidenziatore
   numerate sulla zona, non sull'indirizzo.
9. **Contatori e prove sociali finte**: "347 case vendute", "4,9 stelle su
   Google", loghi di premi, bollini "Agenzia certificata".
10. **Il tratto evidenziatore come decorazione dei titoli** (il "marker
    highlight" sotto una parola dell'h1, visto su migliaia di landing page SaaS
    dal 2020): qui il tratto è stato e dato dell'utente. Il solo tratto
    dimostrativo sulla parola "Segna" è accettabile perché insegna il gesto;
    un secondo tratto decorativo in qualsiasi titolo annulla il concept.

---

## 4. Rischi del concept (con numeri e mitigazioni)

### R1 · Contrasto sotto il rosa: il testo secondario non regge
Calcolato con la formula WCAG (script Python, 26/09/2026), rosa `#EE5A9E` in
multiply al 85% su carta `#E4DFD1` = circa `#D7648D`:

| Coppia | Contrasto | Esito |
|---|---|---|
| nero stampa `#1C1C1A` su carta | 12,8:1 | AA/AAA |
| nero stampa sotto il tratto (multiply 0,85) | **4,96:1** | AA per testo normale, margine minimo |
| nero stampa su rosa pieno | 5,36:1 | AA |
| secondario `#4F4C46` su carta | 6,4:1 | AA |
| secondario `#4F4C46` sotto il tratto | **2,48:1** | **fallisce** |
| rosa `#EE5A9E` su carta (il tratto come segno) | **2,39:1** | **sotto 3:1 (WCAG 1.4.11)** |
| retino `#8F8B82` su carta | 2,55:1 | solo decorativo, mai testo |

Conseguenze vincolanti:
- il tratto copre **solo** la riga d'attacco in nero stampa 800; mai testo in
  `#4F4C46` (riferimento, date, zona secondaria). Se la seconda riga del
  tratto finisce su testo secondario, quella riga va composta in nero;
- l'opacità del tratto non sale sopra 0,85 e il rosa non si scurisce: già a
  0,85 siamo a 4,96:1;
- il tratto rosa **da solo non basta** a dire "questo annuncio è nel giro"
  (2,39:1 sulla carta, e chi non distingue il rosa non lo vede): ogni stato
  "nel giro" ha anche un segnale non cromatico: il bottone Evidenzia passa a
  pieno nero con testo carta e `aria-pressed="true"`, e la sua etichetta
  cambia ("Nel giro · Rif. 214"). Lo stesso sui posti della barra del giro
  (numero o spunta in nero dentro il tratto).

### R2 · Trascinare per evidenziare contro trascinare per spostare
È il rischio d'uso più grande della variante A. Il creative-director lo
risolve per zone (annunci = tratto, spazi vuoti = spostamento). Rischi
residui: su un foglio fitto gli "spazi vuoti" sono pochi e stretti
(canaletti da 20 px). Suggerimenti per interaction-designer e ux-architect:
- il trascinamento di spostamento deve valere anche su **testata, barre
  rubrica, box redazionali e piede**, non solo su canaletti e filetti;
- un trascinamento **verticale** su un annuncio (desktop) deve scorrere il
  foglio, come su mobile: il tratto parte solo se il gesto è orizzontale
  entro 30°. Così l'utente che "prende e tira giù" il foglio non si ritrova
  un tratto a metà;
- lo spazio + trascinamento va scritto in un solo punto visibile (accanto a
  Leggi / Pagina intera), non in un tutorial.

### R3 · Una pagina più larga della finestra non si capisce da sola
Lo scroll orizzontale nativo con la rotella verticale non esiste senza
Shift; su mouse senza trackpad l'utente non scopre la parte destra. Oltre al
filetto tagliato al bordo e alla minipagina: la rotella verticale arrivata in
fondo al foglio **non** deve spostare in orizzontale (sarebbe
disorientante), ma la minipagina deve essere visibile da subito, non dopo il
primo gesto. Verificare nei test che almeno un annuncio "tagliato" al bordo
destro sia in vista a 1440×900.

### R4 · Pizzico e zoom del browser (tablet)
Il pizzico a due dita per passare tra Leggi e Pagina intera **non deve mai
disattivare lo zoom del browser** (`user-scalable=no` o `maximum-scale=1`
violano WCAG 1.4.4). Intercettare il pizzico solo dentro il foglio e
lasciare lo zoom di pagina funzionante; a zoom 400% la pagina deve
ricomporsi nella colonna del giornale piegato (a 1440 × 400% la finestra
utile è 360 px: è già la forma mobile, quindi la soglia 640 px lo copre).

### R5 · Gesto orizzontale su mobile contro "indietro" del sistema
Su iOS Safari e su Android con navigazione a gesti, lo swipe che parte dal
bordo sinistro è "indietro". Un tratto che parte da un annuncio vicino al
bordo (margine 16 px) rischia di uscire dalla pagina. Mitigazione: il
tratto parte solo se il tocco inizia ad almeno 24 px dal bordo della
finestra; il bottone Evidenzia resta sempre l'alternativa. Inoltre il tasto
indietro di Android deve chiudere scheda e giro (history state) senza
lasciare la rotta `/concept-16`.

### R6 · Retino: costo e moiré
Un retino generato a runtime per 7-8 foto è costo CPU al caricamento; un
retino a punti fitti ridimensionato dal browser produce **moiré** su schermi
1× e a zoom intermedi (Pagina intera). Suggerimenti per tech-architect e
photo-editor: retino preparato **in fase di build** come immagine a 1 bit o
a 2 toni (punti `#8F8B82` e `#1C1C1A` su trasparente), passo del punto non
sotto 4 px CSS, due misure (1× e 2×), e in "Pagina intera" si accetta il
moiré ridotto oppure si sostituisce con un grigio piatto `#8F8B82`
(illeggibile di proposito come il testo).

### R7 · Mappa: tile, peso, stile
- Leaflet 1.9 pesa circa 40 KB gz di JS più il suo CSS: **supera da solo metà
  del budget JS del concept (60 KB gz)** se finisce nel bundle iniziale.
  Deve stare in un chunk separato caricato solo all'apertura del giro, e va
  conteggiato nel budget "lazy", non nel principale (da scrivere nel doc del
  tech-architect).
- I tile OSM standard sono colorati; con grayscale 35% restano verdi e
  arancioni tenui. Il percorso rosa in multiply sopra un'arteria arancione
  diventa rosso scuro: accettabile, ma l'art-director deve guardarlo a
  schermo su Pordenone (viale Grigoletti, viale Dante) prima di fissare
  l'opacità 0,55.
- Policy OSM: nessun precaricamento, niente sottodomini, zoom 12-17,
  `maxBounds`; nei test Playwright al massimo poche aperture. Il fallback
  "La mappa non si carica" deve essere provato **bloccando** le richieste
  ai tile nel test, non aspettando un errore reale.

### R8 · Font: peso e stabilità dell'impaginato
Newsreader variabile con asse `opsz` e corsivo, più Libre Franklin
variabile 100-900: sono file grandi. Con un impaginato a colonne che
misura le righe per posare i tratti, un cambio di font in ritardo sposta
tutto (CLS) e sposta i tratti fuori riga. Suggerimenti: sottoinsieme latino,
solo i pesi usati (Libre Franklin 700, 800, 900; Newsreader 400 e corsivo
400), `font-display: optional` o metriche di fallback regolate
(`size-adjust`), e i tratti posati **solo dopo** `document.fonts.ready` (già
previsto) e ricalcolati al resize.

### R9 · La data del sabato
"Sabato 3 ottobre 2026" calcolato nel browser: attenzione al fuso (usare
`Europe/Rome`, non UTC) e al sabato stesso dopo le 12:30 (l'agenzia ha
chiuso: il giro deve proporre il sabato dopo). Il file `.ics` deve avere
orari con fuso `Europe/Rome` esplicito, altrimenti un calendario in un altro
fuso sposta le visite. Il prerender non deve fissare una data nel HTML:
la data si calcola al montaggio.

### R10 · Il quinto annuncio e la frustrazione
Il limite di quattro è una regola del mestiere (una mattina), ma il tratto
"scarico" può sembrare un bug. Serve che la riga di spiegazione compaia
**accanto all'annuncio toccato** e nella regione `aria-live`, e che la barra
del giro in quel momento indichi quale togliere (nessun lampeggio: al
massimo un cambio di colore per superficie ogni 500 ms).

### R11 · Deriva verso il "giornale vecchio" o verso STUDIO FORMA
Due derive opposte da controllare a ogni revisione: verso il vintage
(texture, gotico, ingiallito) e verso il bianco-nero-rosso svizzero di
STUDIO FORMA (4). Il test rapido: se lo screenshot in bianco e nero è
indistinguibile da un giornale del 1970, è vintage; se il rosa diventa rosso
o il fondo diventa bianco, è STUDIO FORMA.

### R12 · Densità e prima impressione su 375
La colonna del giornale piegato con barra del giro fissa (48 px) più
testata compatta più striscia delle rubriche rischia di lasciare meno di
metà schermo al contenuto su un iPhone SE (667 px di altezza). Suggerimento
per l'ux-architect: la striscia delle rubriche **non** è fissa, scorre via
con la testata; resta fissa solo la barra del giro. Controllare che
`ConceptBackButton` in basso a sinistra non copra il bottone Evidenzia di un
annuncio in fondo alla finestra (margine inferiore della colonna almeno
64 px).

---

## 5. Richieste ad altri agent

- **art-director**: tabella contrasti di R1 da includere e ricalcolare con
  i valori finali; regola "il tratto copre solo testo in nero stampa";
  stato "nel giro" non solo cromatico.
- **tech-architect**: Leaflet in chunk separato e fuori dal budget JS
  principale (R7); retino in fase di build (R6); data e `.ics` con
  `Europe/Rome` (R9); nessun blocco dello zoom del browser (R4).
- **interaction-designer**: soglia 24 px dal bordo per il tratto su mobile
  (R5); trascinamento verticale su annuncio = scroll anche su desktop (R2).
- **ux-architect**: striscia rubriche non fissa su 375 e margine inferiore
  64 px (R12); annuncio tagliato al bordo in vista a 1440×900 (R3).
- **copywriter**: ordine fisso dell'annuncio piccolo (P4), etichetta del
  bottone che cambia con lo stato (R1), riga del quinto annuncio (R10).
- **Luca** (ambiente): rendere affidabile il certificato del proxy per il
  Chromium di Playwright per poter eseguire /taste dal vivo (1.1).
