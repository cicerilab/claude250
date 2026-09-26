# Creative director · Concept 18 · Officina e gommista (Pordenone)

Ondata 0. Rotta `/concept-18`. Documento di direzione per tutti gli agent delle
ondate successive: quello che è scritto da "4. La direzione scelta" in poi è
vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 18, paragrafo 18,
verifica incrociata, regole comuni), `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 0, 1, 4, 9), `concepts/10-torchio/docs/creative-director.md` (solo come
livello e formato), screenshot `docs/concept-attuali/concept-18.jpg` (il bocciato
CHIAVE DEL TREDICI).

Verifiche di rete fatte da questo agent (26/09/2026):
- `kenney.nl/assets/car-kit` risponde 200. Car Kit 3.1, 45 modelli, licenza CC0
  (letta nel `License.txt` dello zip). Zip scaricato solo nello scratchpad per
  ispezione, **non** copiato nel concept: lo fa il webgl-artist.
- `poly.pizza` risponde 403: non si usa.
- `images.unsplash.com` risponde 200: le foto vere si possono scaricare.

---

## 0. Da dove si parte

**La direzione è assegnata dalla matrice** (riga 18, SOTTOSCOCCA): ponte
sollevatore, scroll che alza l'auto, asta graduata, punti del sottoscocca
toccabili, 3D low-poly CC0, prenotazione "Il ponte libero" sul planning dei tre
ponti. Palette verde macchina utensile `#5E7564`, nero grasso `#1C1D1B`, bianco
segnaletica `#F0EFE9`. Font Tektur + Red Hat Text. Qui la raffino, non la cambio.

**Cosa c'era nel bocciato CHIAVE DEL TREDICI** (screenshot): grigio antracite con
accento arancio pieno, condensato maiuscolo pesante (tipo Teko/Barlow Condensed),
hero diviso con testo a sinistra e foto di un'auto sul ponte in cornice
arancione a destra con didascalia "TAV. I", riga di quattro numeri tra filetti
("in via Vallona dal 2001 / 3 ponti / 1h30 / prima di toccare"), due bottoni
("Compila la scheda" + "Guarda il listino"), orari in piccolo, poi "01 LA SCHEDA
D'INGRESSO" con il libretto di manutenzione e le sette spie del cruscotto. Il
bottone in alto diceva già **"Prenota il ponte"**. Quindi: la parola "ponte" era
già nel bocciato come etichetta; qui deve diventare un oggetto e un gesto, non
un'etichetta.

**Vicini pericolosi**:
- *1 MERIDIANA* e il Concept 2 del sito (hardware 3D con configuratore): oggetto
  3D protagonista che si ruota, si smonta, si configura. SOTTOSCOCCA non ha
  orbita libera, non ha vista esplosa, non ha scelta di colori o materiali: la
  telecamera corre su un binario fisso guidato dallo scroll e l'auto fa una sola
  cosa, sale.
- *11 TAJUT*: l'altro verde della matrice. Là verde acqua chiaro e brillante di
  formica; qui verde grigio medio, su fondo scuro.
- *15 NOVANTA*: l'altra prenotazione "a tempo". Là un anello settimanale; qui una
  sola giornata lineare su tre corsie di lunghezza diversa.
- *13 CONTROPELO* e *12 SOTTOPELLE*: rivelano immagini con un gesto su fondo
  scuro. Qui non si rivela niente "pulendo" o "esplorando": si alza un oggetto.
- *10 IMPRONTA*: campo pieno di colore e luce radente. Qui niente campo pieno di
  verde e niente luce che segue il puntatore.

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina commerciale di un'officina meccanica
e gommista di quartiere a Pordenone, per automobilisti normali che vogliono
sapere quanto costa e quanto ci vuole, con un linguaggio tecnico da reparto
(targhette di macchine utensili, linee a terra, quote in centimetri) e un solo
gesto spettacolare, leaning toward una scena three/R3F sola e fissa (auto
low-poly CC0 su ponte a due colonne costruito proceduralmente) guidata dallo
scroll, con DOM vero sopra, tipografia tecnica squadrata e foto vere
dell'officina nella parte bassa.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **8** | Struttura nata dall'oggetto (l'altezza del ponte), non da sezioni a modello. Non 9-10: il cliente dell'officina deve trovare prezzo e orario senza giocare. |
| `MOTION_INTENSITY` | **6** | Un movimento solo, lungo e fisico: l'auto che sale e la telecamera che scende sotto. Tutto il resto è fermo. Niente coreografie continue. |
| `VISUAL_DENSITY` | **5** | Più alta di un sito vetrina: listino, tempi, planning e deposito sono informazioni vere e dense, come la lavagna del capofficina. Ma una quota per volta. |

---

## 2. La metafora sviluppata

In officina la verità sta sotto la macchina, e il cliente non la vede mai: sta
in accettazione, sente "le pastiglie sono al limite" e deve fidarsi. Il ponte
sollevatore è il momento in cui il meccanico **ti fa vedere**. SOTTOSCOCCA mette
il visitatore sotto l'auto.

Il sito ha **una sola misura: l'altezza del ponte**, in centimetri. Non ci sono
"sezioni 01, 02": ci sono quote. Scorrere non fa comparire blocchi, alza
l'auto. A ogni quota si vede qualcosa di diverso, e si parla di quello:

| Quota | Cosa si vede davvero a quell'altezza | Di cosa si parla |
|---|---|---|
| **0 cm** | Auto ferma sui bracci del ponte, gomme a terra | Chi siamo in una riga, il gesto |
| **0 → 20 cm** | Le ruote si staccano da terra, girano libere | Gomme: cambio stagionale, equilibratura, convergenza, deposito |
| **80 cm** | Il mozzo all'altezza degli occhi: disco, pinza, molla, ammortizzatore | Freni e sospensioni |
| **180 cm** | Si è sotto: coppa dell'olio, filtro, scarico, catalizzatore, silenziatore, pianale | Il sottoscocca: tutti i punti toccabili, tagliando, scarico, revisione |
| **180 → 0 cm** | Il ponte ridiscende | Il ponte libero: la prenotazione |

**L'asta graduata** sul lato destro è la quota come strumento: una riga
verticale da 0 a 200 cm con tacche ogni 10 cm, numeri ogni 50 in Tektur, e
un indice bianco che sale con l'auto. È insieme indicatore di posizione e
navigazione (si tocca una quota e il ponte ci va). Sostituisce qualunque indice,
barra di avanzamento o menu a sezioni numerate.

**Perché è di questo mestiere e non di un altro**: il ponte a due colonne con
i bracci e i tamponi di gomma è l'oggetto che c'è in ogni officina del mondo, e
"mettere in ponte" è il gesto che separa un'officina seria da un preventivo al
telefono. Il verde è quello di torni, trapani a colonna e banchi da lavoro
verniciati a fuoco; il bianco è quello delle linee a terra che delimitano le
postazioni; il nero è il grasso. Tektur è la geometria delle targhette
rivettate sulle macchine ("PORTATA 3500 kg").

**Cosa promette al cliente vero** (il gommista che guarda il concept su
cicerilab.com): "i tuoi clienti vedono cosa fai e prenotano un buco vero sul
tuo ponte, sapendo già quanto dura". Il planning dei tre ponti è la lavagna che
ogni capofficina ha già in testa.

---

## 3. Tre varianti di esecuzione della stessa direzione

La direzione (ponte, quota, punti toccabili, planning) è fissa. Cambia come la
si mette in scena.

### Variante A · PROSPETTO

**Idea**: l'auto è vista sempre di lato, in proiezione ortografica, come la
tavola di un manuale d'officina. Sale in verticale pura dentro l'inquadratura
fissa; l'asta graduata è una vera quota di disegno tecnico accanto all'auto.

- **Camera**: ortografica, laterale, ferma. L'auto trasla in Y, basta.
- **Punti toccabili**: sul profilo laterale (ruota, pinza vista attraverso il
  cerchio, scarico che sporge dietro, coppa vista di taglio).
- **Resa**: flat shading a due toni, contorni scuri (outline), niente luce.
- **Pro**: leggibilissima, leggera, perfetta su 375 px (l'auto di lato riempie
  la larghezza), facilissima da rendere accessibile.
- **Contro**: il sottoscocca **non si vede mai davvero**: di lato si vede solo
  il bordo. Tradisce la metafora ("guardarla da sotto"). L'estetica "blueprint
  con quote" è inflazionata e somiglia a una tavola didattica, non a un luogo.
  Il wow è basso: un rettangolo che sale.

### Variante B · LAMPADA

**Idea**: prospettiva del meccanico sotto l'auto, al buio; la lampada portatile
a gabbia (quella appesa al cofano) è l'unica luce, e il visitatore la muove per
illuminare i pezzi.

- **Camera**: prospettica, bassa, che si muove su un binario sotto l'auto.
- **Punti toccabili**: compaiono dove passa il fascio della lampada.
- **Resa**: materiali più ricchi (metallo, gomma), ombre vere, ambiente scuro.
- **Pro**: fortissima atmosfera, cinematografica, "vera".
- **Contro**: la lampada che segue il puntatore **è un gesto di rivelazione su
  fondo scuro**, lo stesso territorio di 13 CONTROPELO (vapore) e 12 SOTTOPELLE
  (inchiostro), e di IMPRONTA (luce che segue il cursore). Al buio, un modello
  Kenney low-poly mostra i suoi limiti; per reggere servono ombre e materiali
  pesanti, male su mobile. Informazioni nascoste finché non illumini: pessimo per
  accessibilità e per chi vuole solo il prezzo delle gomme.

### Variante C · QUOTA

**Idea**: officina ben illuminata e ordinata (neon a soffitto, luce diffusa,
nessun buio). La telecamera sta su un **binario** che scende mentre l'auto sale:
a 0 cm si guarda l'auto di tre quarti ad altezza d'uomo, a 80 cm si guarda la
ruota negli occhi, a 180 cm la camera è sotto e guarda **in su**, in una vista
quasi ortografica del pianale: la pianta del sottoscocca, leggibile come una
mappa. L'asta graduata è la spina dorsale dell'interfaccia.

- **Camera**: prospettica con FOV stretto (circa 28°, poca deformazione), su un
  binario di 4 chiavi interpolate dallo scroll; alla quota 180 si "appiattisce"
  verso una vista dal basso quasi zenitale.
- **Punti toccabili**: pochi, grandi, sempre tutti visibili alla loro quota;
  sono bottoni DOM proiettati sulla scena, non oggetti 3D.
- **Resa**: materiali opachi e piatti (Lambert/Toon a 3 livelli), colori della
  palette, niente riflessi. Il low-poly Kenney diventa una scelta di stile
  coerente (la targhetta tecnica, non la vetrina del concessionario).
- **Pro**: fa vedere davvero il sottoscocca; i punti sono leggibili come su una
  tavola; la luce piena non si sovrappone a nessun "gesto di rivelazione" degli
  altri concept; costo di rendering basso; su mobile funziona (la vista dal basso
  di un'auto è lunga e stretta: in verticale ci sta bene).
- **Contro**: il binario della camera va tarato con cura (le transizioni tra
  chiavi devono sembrare un braccio meccanico, non un volo di drone); rischio
  "giocattolo" se il modello Kenney resta con i suoi colori originali.

### La scelta: QUOTA (variante C)

1. **È l'unica che mantiene la promessa della metafora**: guardare l'auto *da
   sotto*. A la vede di lato, B la vede al buio.
2. **Informazione sempre visibile**: a ogni quota i punti ci sono tutti, con
   prezzo e tempi a un tocco. Il visitatore che vuole solo "quanto costano
   quattro gomme 205/55 R16 montate" lo trova alla prima quota senza gesti.
3. **Distanza dagli altri concept**: luce piena e ordinata (non buio + luce che
   rivela), camera su binario (non orbita da configuratore), un solo movimento
   (salire). Nessun'altra pagina della matrice si "abbassa" sotto un oggetto.
4. **Costruibile e leggera**: un GLB Kenney da circa 170 KB, un ponte procedurale
   di pochi box, materiali opachi, render on demand. Gira su un telefono medio.
5. **Il rischio giocattolo si risolve con la palette**: si scartano i colori
   della texture Kenney e si assegnano materiali piatti della palette; il
   risultato somiglia a un modellino tecnico in scala, non a un gioco.

**Nome**: **SOTTOSCOCCA**, *officina e gommista*, Pordenone. Il nome
dell'officina di esempio (se serve un'insegna diversa dal nome del concept) lo
decide il brand-strategist; indirizzo e recapiti di esempio li scrive il
copywriter, **non** "via Vallona 13" (era del bocciato). Nessun dato legale.

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo (base per art-director e webgl-artist)

**Tema unico scuro**, bloccato su tutta la pagina: il pavimento dell'officina.
Nessuna sezione chiara in mezzo.

| Ruolo | Colore | Uso |
|---|---|---|
| Nero grasso | `#1C1D1B` | Fondo pagina, pavimento, blocchi occupati del planning |
| Verde macchina utensile | `#5E7564` | Colonne e bracci del ponte, carrozzeria dell'auto, superfici grandi, titoli molto grandi |
| Verde ombra (derivato) | `#44584A` | Pannelli con testo sopra (scheda del punto, pannello del planning) |
| Bianco segnaletica | `#F0EFE9` | Testo, linee a terra, asta graduata, indice di quota, il **tuo** blocco nel planning, bottone principale |
| Zincato (derivato) | `#9AA19B` | Tacche minori dell'asta, testo secondario solo su nero grasso, parti metalliche nella scena |

- **Nessun colore d'accento in più.** L'accento è il bianco segnaletica: si usa
  pieno solo per l'indice di quota, il bottone principale, il blocco del
  visitatore e i punti toccabili attivi. Niente arancio, niente giallo, niente
  rosso "errore" (l'errore si dice con le parole e con il tratteggio, vedi 4.4).
- **Contrasti (calcolo del creative-director, l'art-director li riverifica)**:
  bianco su nero grasso circa 15:1; bianco su verde ombra `#44584A` circa 6,6:1
  (ok per testo corrente); zincato su nero grasso circa 6,4:1; **bianco su verde
  macchina `#5E7564` circa 4,3:1: solo testo grande (da 24 px o 19 px bold)**,
  mai testo corrente sul verde pieno.
- **Tipografia**:
  - *Tektur* (variabile, assi larghezza e peso) per quote, prezzi, tempi, titoli
    e numeri dell'asta. Le quote sono il "display" del sito: "80 cm" enorme,
    non un titolo poetico. Larghezza 75-85 per i numeri grandi, 100 per i
    titoli. Niente maiuscolo spaziato come etichetta.
  - *Red Hat Text* 400/500/700 per il testo, 17 px, interlinea 1,55, massimo 60
    caratteri per riga. Numeri tabellari (`font-variant-numeric: tabular-nums`)
    in listini e planning.
  - Niente monospace, niente condensato maiuscolo tipo Teko/Barlow/Oswald (era
    il bocciato), niente serif.
- **Forme**: spigolo vivo (raggio 0) su tutto, come lamiera tagliata. Unica
  eccezione documentata: i **punti toccabili** sono cerchi (sono i tamponi di
  gomma dei bracci del ponte, tondi per natura) e i tamponi stessi nella scena.
- **Segni grafici ammessi**: solo le **linee a terra** (strisce bianche larghe,
  come quelle che delimitano le postazioni sul pavimento) e l'asta graduata.
  Nessun filetto decorativo, nessuna onda, nessun divisore.
- **Foto**: vere, solo nella parte bassa (deposito, officina) e nel fallback.
  Trattamento: leggera desaturazione verso il verde grigio (non duotone), mai
  cornici, mai didascalie "TAV.", nessuna etichetta sovrapposta.

### 4.2 Sezioni / schermate (8)

Le quote sono sezioni DOM vere (`<section>` con titolo `h2`), sopra il canvas
fisso. Lo scroll della pagina è nativo (nessun Lenis globale, come da
integrazione): l'altezza del ponte è una funzione della posizione di scroll.

1. **Apertura · 0 cm**
   Il canvas riempie lo schermo: il pavimento nero con le linee bianche, il ponte
   a due colonne verde, l'auto ferma sui bracci, di tre quarti. Nessuno split
   testo/foto. In basso a sinistra, sopra il pavimento: il marchio in Tektur,
   una frase sola (esempio di tono: "Te la alziamo davanti e ti facciamo vedere
   cosa c'è sotto.") e **un solo bottone: "Trova un buco"** (porta al planning;
   è l'unica etichetta per l'intento prenotazione in tutto il sito: menu,
   apertura, schede dei punti, piede). A destra compare l'asta graduata con
   l'indice a 0. Nessun "Scorri", nessuna freccia animata: il primo scroll alza
   l'auto di qualche centimetro e basta quello a spiegare il gesto.
   Primo caricamento: prima del modello si vede un **fermo immagine** della
   scena a 0 cm (WebP pre-renderizzato), poi il canvas lo sostituisce senza
   salti. Niente preloader a percentuale.

2. **Gomme · 0 → 20 cm**
   L'auto si stacca da terra, le ruote girano libere lentamente una volta sola
   (mezza rotazione, poi ferme). Punti toccabili: **ruota anteriore** (gomme,
   stagionali, 4 stagioni) e **ruota posteriore** (equilibratura, convergenza).
   Accanto, in DOM: il listino per misure comuni (3 o 4 misure vere, es.
   195/65 R15, 205/55 R16, 225/45 R17) con prezzo montaggio ed equilibratura, e
   il tempo in minuti. La quota "20 cm" in Tektur enorme dà il ritmo.

3. **Freni e sospensioni · 80 cm**
   La camera scende e guarda la ruota negli occhi; la ruota anteriore si
   "apre" in trasparenza leggera (opacità del cerchio al 35%) per far vedere
   disco e pinza procedurali. Punti: **freni** (pastiglie, dischi, liquido) e
   **sospensioni** (ammortizzatori, molle, testine). Per ognuno: cosa si guarda,
   ogni quanto, prezzo indicativo, tempo sul ponte.

4. **Il sottoscocca · 180 cm** (sezione fissata, pinned, la più alta del sito)
   La camera è sotto e guarda in su: la pianta del pianale, lunga, leggibile.
   Tutti i punti sono qui, anche quelli delle quote precedenti: **gomme, freni,
   sospensioni, olio e filtro (tagliando), scarico** (catalizzatore e
   silenziatore). È la schermata firma (vedi 4.3). Da qui ogni scheda di un
   punto ha il bottone "Aggiungi al lavoro", che compone il blocco da
   prenotare.

5. **Deposito gomme**
   Il ponte resta su; la pagina passa a una **foto vera** di una scaffalatura
   di gomme in deposito (vedi 4.6). Testo: quanto costa tenere il treno di
   gomme per una stagione, come funziona il numero di deposito (un cartellino
   con un codice legato alla targa), e che chi ha già le gomme da noi fa il
   cambio più in fretta. Il codice di esempio è grande in Tektur, come scritto
   col pennarello bianco sul cartellino.

6. **Il ponte libero · la prenotazione** (vedi 4.4)
   Entrando nella sezione il ponte ridiscende a 0 e il canvas si allontana
   (l'auto rimpicciolisce e si sposta in alto, poi il canvas sfuma al 20% di
   opacità sotto il planning). L'asta graduata diventa l'asse delle ore.

7. **L'officina · dove siamo**
   Due o tre foto vere dell'officina (ponte, attrezzatura, esterno se c'è) in
   una composizione asimmetrica, non una griglia di schede. Indirizzo di
   esempio, orari (lun-ven 8:00-12:30 e 14:00-18:30, sabato mattina solo gomme:
   il copywriter conferma), telefono di esempio, link "Apri in Maps" alla mappa
   vera. Nessuna mappa disegnata, nessun ritratto della squadra.

8. **Piede**
   Poche righe in Red Hat Text: recapiti, "Un concept di CiceriLab", credito
   "Modello 3D: Kenney (CC0)" e crediti fotografici reali. Torna al Concept Lab.

### 4.3 Interazione firma: "Alza il ponte" + "Tocca il punto"

**Alza il ponte (scroll)**
- La quota del ponte `h` (0-180 cm) è derivata dalla posizione di scroll nelle
  sezioni 1-4 con una curva a gradini morbidi: tra una quota e l'altra l'auto
  sale in continuo, ma **si ferma** (plateau) per un tratto di scroll a 20, 80 e
  180 cm, così il testo di quella quota si legge con l'auto ferma. Lo stesso
  capita al ponte vero: sale, si ferma, il meccanico guarda.
- Movimento meccanico: velocità della salita smorzata (lerp circa 0,12 per
  frame) e un micro assestamento di 3-4 mm quando si arriva a un plateau, come
  i fermi di sicurezza delle colonne. Niente rimbalzi elastici, niente
  "overshoot" da interfaccia.
- **Camera su binario**: 4 chiavi (0, 20, 80, 180 cm) con posizione, target e
  FOV; tra le chiavi interpolazione con easing unico. La camera non segue il
  mouse, non ruota da sola, non ha orbita. Parallasse minima al puntatore:
  **no**.
- **L'asta graduata**: fissa sul bordo destro. Indice bianco che segue `h`, il
  numero corrente in Tektur accanto all'indice (arrotondato ai 5 cm per non
  "frullare"). Le quote 0, 20, 80, 180 sono link (`<nav>` con `aria-label="Quota
  del ponte"`, `aria-current` sulla quota attiva): toccarle fa scorrere la pagina
  a quella sezione (scroll nativo, `behavior: smooth` solo senza reduced
  motion).
- **Luce**: fissa. Neon a soffitto resi come due luci rettangolari morbide +
  ambiente tenue. **I neon non si accendono con lo sfarfallio** (il classico
  avvio del neon è un lampeggio: vietato).

**Tocca il punto**
- I punti toccabili sono **bottoni DOM** (`<button>`) posizionati proiettando
  punti 3D nello schermo a ogni frame in cui la camera cambia. Cerchio di 44 px
  (area di tocco), anello bianco da 2 px e centro verde; attivo: pieno bianco.
  Etichetta testuale accanto al cerchio sempre visibile a 180 cm ("Scarico"),
  solo al focus o al passaggio alle quote basse.
- Tocco/clic: si apre la **scheda del punto** (pannello su verde ombra), con:
  nome, cosa si controlla, segnali per capire che serve (in parole normali:
  "fischia quando freni"), prezzo indicativo di esempio, **tempo sul ponte** in
  minuti, e il bottone "Aggiungi al lavoro". Nella scena, il pezzo toccato
  diventa bianco segnaletica (solo quel pezzo), gli altri restano verdi. Una
  sola scheda aperta alla volta. Esc o il bottone "Chiudi" la chiudono e
  restituiscono il focus al punto.
- **"Aggiungi al lavoro"** costruisce il blocco da prenotare: ogni punto ha una
  durata (tabella di esempio, il copywriter la rifinisce):

  | Lavoro | Tempo sul ponte | Ponte |
  |---|---|---|
  | Cambio gomme stagionale con equilibratura | 40' | 3 (gommista) |
  | Cambio gomme già in deposito | 30' | 3 |
  | Convergenza | 30' | 3 |
  | Pastiglie anteriori | 1 h | 1 o 2 |
  | Pastiglie e dischi anteriori | 1 h 30 | 1 o 2 |
  | Coppia ammortizzatori | 2 h | 1 o 2 |
  | Tagliando (olio, filtri) | 1 h 30 | 1 o 2 |
  | Silenziatore / controllo scarico | 1 h | 1 o 2 |

  Una piccola barra "Il tuo lavoro" (fissa in basso a sinistra su desktop,
  sopra il pannello del planning) mostra la somma: "Tagliando + pastiglie: 2 h
  30 sul ponte". Nessun carrello, nessuna icona di borsa.

**Alternativa da tastiera e lettore di schermo**
- Ordine di tabulazione: contenuto della quota, poi i suoi punti in un ordine
  logico (davanti → dietro), poi il testo successivo. Frecce sinistra/destra
  (o su/giù) spostano il focus tra i punti della stessa quota; Invio o Spazio
  aprono la scheda.
- Ogni quota ha, sotto il testo, lo stesso contenuto in forma di **elenco
  semplice** ("Da qui si vede: ruote, freni...") con bottoni che aprono le stesse
  schede. È visibile, non solo per screen reader: serve anche a chi non vuole
  cercare i cerchi sulla scena.
- Il canvas è `aria-hidden="true"`. Un `aria-live="polite"` annuncia solo il
  cambio di quota a plateau raggiunto ("Ponte a 80 centimetri: freni e
  sospensioni"), mai ogni centimetro.
- Focus visibile: contorno bianco 2 px con 3 px di distanza, su tutto.

**Fallback senza WebGL** (o modello che non carica entro 8 s, o
`webglcontextlost`)
- La stessa storia, con le stesse quote e la stessa asta graduata, ma al posto
  della scena ci sono **foto vere** di un'auto sul ponte a tre altezze (a terra
  / ruota all'altezza degli occhi / sottoscocca da sotto), a tutto schermo,
  che cambiano con dissolvenza di 300 ms al raggiungimento del plateau.
- I punti toccabili restano: sulle foto sono cerchi posizionati in
  percentuale (coordinate annotate dall'art-director foto per foto); se una
  foto non permette di posizionarli bene, si usa solo l'elenco della quota.
- Se le foto giuste non si trovano (vedi 4.6, piano B), il fallback usa i
  **fermi immagine** della scena 3D renderizzati a 0, 20, 80, 180 cm (WebP
  generati con Playwright dalla build WebGL).

**Reduced motion** (`prefers-reduced-motion: reduce`)
- Niente salita continua: l'auto **scatta** tra le quote al plateau (0, 20, 80,
  180) con una dissolvenza incrociata di 200 ms tra due inquadrature ferme. Le
  ruote non girano. La camera non vola. Lo scroll smooth dei link dell'asta è
  disattivato. La sezione 180 cm non è pinned: si legge come una sezione
  normale con la vista dal basso ferma. Il sito resta completo.

### 4.4 Meccanica unica di prenotazione: "Il ponte libero"

**Idea**: il cliente non compila un modulo con data e ora; vede la **giornata
dell'officina** come la vede il capofficina (tre ponti, blocchi già occupati) e
**mette il suo blocco in un buco libero**. La lunghezza del blocco dipende dal
lavoro scelto, quindi capisce subito quanto tempo serve e perché certi buchi
non bastano.

**Il planning (layout)**
- **Desktop**: tre corsie orizzontali, una per ponte, sull'asse delle ore
  8:00-12:30 e 14:00-18:30 (la pausa è una fascia vuota con scritto "chiuso",
  non un buco). Ponte 1 e 2 (a due colonne) per meccanica; ponte 3 (a forbice,
  gommista) per gomme e convergenza. Ogni corsia è etichettata in Tektur con
  la portata vera del ponte, come la targhetta ("Ponte 3 · forbice · 3000 kg").
- Blocchi occupati: rettangoli nero grasso su corsia verde ombra, con il solo
  tipo di lavoro ("tagliando", "gomme"), **mai nomi di clienti o targhe**.
  Buchi liberi: la corsia scoperta con una linea tratteggiata bianca a terra.
- Sopra il planning: la **striscia dei giorni** (prossimi 6 giorni lavorativi,
  numero del giorno grande in Tektur, "sabato: solo gomme"). Dati di esempio
  generati in modo verosimile e stabile (seme per data, stessi buchi a ogni
  visita dello stesso giorno), con giornate più piene e più vuote.
- **375 px**: il planning ruota. Il tempo scorre **in verticale** (dall'alto in
  basso, come un'agenda), i tre ponti sono tre colonne strette (circa 96 px
  l'una) sotto il pollice. L'asta graduata a destra si trasforma nella scala
  delle ore. Non è un planning desktop rimpicciolito.

**Il tuo blocco**
- Il blocco del visitatore è **bianco segnaletica**, con dentro il lavoro e la
  durata ("Tagliando + pastiglie · 2 h 30"), e la sua lunghezza sulla scala
  del tempo è quella vera.
- Nasce dai punti toccati sotto l'auto. Se si arriva qui senza aver toccato
  niente, il blocco si compone qui con i lavori in forma di bottoni (gli stessi
  della tabella in 4.3).
- **Come si piazza**:
  - Desktop: trascini il blocco sul planning; si aggancia a passi di 10 minuti
    e solo sui ponti adatti al lavoro (le corsie non adatte si attenuano al 40%
    mentre trascini, con scritto perché: "Il ponte 3 fa solo gomme").
  - Touch: **tocchi un buco** e il blocco ci va, allineato all'inizio del buco;
    poi puoi spostarlo con due bottoni "10' prima" / "10' dopo". Il
    trascinamento sul telefono c'è solo tenendo premuto il blocco (per non
    litigare con lo scroll della pagina: `touch-action: none` solo sul blocco
    afferrato).
  - Bottone **"Primo buco libero"**: piazza il blocco nel primo spazio
    compatibile di quel giorno (o del giorno dopo, e lo dice).
  - Tastiera: il blocco è un `button` focalizzabile con istruzioni collegate
    (`aria-describedby`), niente `role="application"`; frecce sinistra/destra spostano di 10',
    su/giù cambiano ponte, PagSu/PagGiù cambiano giorno, Invio conferma la
    posizione. Ogni spostamento è annunciato in `aria-live` ("Ponte 2, dalle
    9:10 alle 11:40, libero").
  - Alternativa senza gesti: sotto il planning c'è un elenco dei buchi
    compatibili del giorno ("Ponte 2, 9:10-11:40") come bottoni.
- **Deposito gomme**: se il lavoro comprende un cambio gomme compare una
  domanda sola: "Le tue gomme sono già da noi?". Sì → campo "Numero deposito"
  (es. `D-214`, formato indicato sotto il campo) e il blocco si accorcia a 30'.
  No → a fine prenotazione il deposito ti assegna un numero di esempio, scritto
  sul blocco come il cartellino sulle gomme.

**I dati**
- Dopo aver piazzato il blocco: nome, telefono (obbligatori), targa o modello
  dell'auto (facoltativo, aiuta a preparare i ricambi), nota breve facoltativa.
  Etichette sopra i campi, errori sotto, niente placeholder come etichetta.
- Bottone di invio: **"Metti in ponte"**. È un bottone normale (niente tieni
  premuto: quello è di IMPRONTA).

**Stati**
- **Vuoto**: il planning del primo giorno libero è già caricato, con i blocchi
  occupati; il tuo blocco è "parcheggiato" a fianco del planning (a destra su
  desktop, in alto su mobile) con il contorno tratteggiato e la scritta "Cosa
  facciamo?" con i lavori come bottoni. Mai un planning bianco, mai un
  messaggio "nessun dato".
- **Errori** (sempre detti a parole, vicino a dove succede, senza rosso):
  - *Non ci sta*: il blocco lasciato su un buco troppo corto torna al bordo
    del buco con il contorno tratteggiato e sotto: "Qui ci sono 50 minuti, il
    tuo lavoro ne chiede 90. Il ponte 2 è libero dalle 14:10." con il bottone
    per andarci.
  - *Ponte sbagliato*: "Le gomme le facciamo sul ponte 3."
  - *Giorno pieno*: il giorno nella striscia è attenuato con "pieno"; se lo si
    sceglie, il planning lo mostra comunque e propone il primo giorno utile.
  - *Campi*: "Serve un numero di telefono per richiamarti", "Il numero di
    deposito è una D e tre cifre, lo trovi sul cartellino".
- **Invio in corso**: il tuo blocco "sale sul ponte": passa da contorno a pieno
  bianco con una transizione di 400 ms e il bottone diventa "Invio..." non
  cliccabile. Niente spinner.
- **Successo**: il blocco **resta sul planning**, pieno, e la giornata è ora
  quella con il tuo lavoro dentro. Accanto, una frase sola: "Fatto. Martedì 7
  alle 9:10 sul ponte 2. Ti chiamiamo per confermare entro sera." (più il
  numero di deposito se c'è). L'asta graduata, se si torna su, porta la tacca
  "il tuo ponte: 9:10". **Nessuna cartolina, ricevuta, scontrino, scheda
  d'ingresso o libretto.** Evento `track("demo_prenotazione")` qui e solo qui.
- **Invio fallito**: il blocco torna tratteggiato nella stessa posizione (non
  perdi il buco), e sotto: "Non è partito. Riprova, o chiamaci allo 0434 ..."
  (numero di esempio del copywriter).

### 4.5 Il modello 3D

**Auto (Kenney Car Kit, CC0)**
- Candidati, nell'ordine: `sedan.glb` (circa 172 KB, nodi separati `body`,
  `wheel-front-left`, `wheel-front-right`, `wheel-back-left`,
  `wheel-back-right`: le ruote sono già oggetti a sé, utili per i punti gomme e
  per farle girare), in alternativa `hatchback-sports.glb` (circa 198 KB) se la
  sagoma da compatta è più "auto di tutti i giorni" vista da sotto. **Non**
  usare `suv-luxury`, `race`, `race-future`, `police`, `taxi` (fuori tono).
- Pezzi utili dallo stesso kit: `debris-drivetrain.glb` / `debris-drivetrain-axle.glb`
  (assali e trasmissione, da mettere sotto il pianale), `wheel-default.glb`
  (ruota singola, per il deposito o per lo stato "ruota smontata").
- I colori della texture `colormap.png` (arancio/rosso giocattolo) **si
  scartano**: materiali piatti riassegnati per nodo: carrozzeria verde
  macchina, vetri nero grasso al 70%, gomme nero grasso, cerchi zincato.
- Il modello Kenney ha il pianale semplificato: il sottoscocca va
  **completato proceduralmente** con primitive three (cilindri e box): coppa
  dell'olio, filtro, tubo di scarico con catalizzatore e silenziatore, dischi e
  pinze dei freni dietro i cerchi, molle e ammortizzatori. Pochi poligoni,
  forme riconoscibili, stesso materiale piatto. Ogni pezzo procedurale ha un
  nome che coincide con l'id del punto toccabile.
- Verifica prima di tutto (webgl-artist): scaricare lo zip da
  `https://kenney.nl/assets/car-kit`, aprire il GLB, controllare scala,
  orientamento e che il pianale non abbia buchi visibili dal basso. Copiare
  nel concept solo i file usati e il `License.txt`. Se la sagoma Kenney da sotto
  risulta troppo giocattolo anche ricolorata: **piano B procedurale** (scocca
  come box smussato estruso da un profilo laterale, quattro ruote cilindriche,
  stesso sottoscocca procedurale), sempre sotto i 60 KB di geometria.

**Ponte e officina (procedurali)**
- Ponte a due colonne: due colonne verdi con carrello, quattro bracci
  telescopici, quattro tamponi di gomma tondi (i "punti" nascono da qui),
  targhetta sulla colonna con "3500 kg" in Tektur (texture da canvas 2D).
- Pavimento: piano nero grasso con le linee bianche della postazione (texture
  da canvas 2D, niente foto). Niente muri: il fondo è il nero grasso che sfuma.
- **Budget**: GLB + texture sotto 350 KB compressi; meno di 40 draw call;
  DPR massimo 1,5 su mobile, 2 su desktop; render on demand (solo quando cambia
  lo scroll o si apre un punto); pausa con scheda nascosta. Il modello si
  carica dopo il primo paint, il fermo immagine copre l'attesa.

### 4.6 Foto

**Dove**: sezione Deposito (1 foto), sezione Officina (2-3 foto), fallback
senza WebGL (3 foto, una per quota). Mai nella prima schermata.

**Cosa cercare su Unsplash** (scaricare, guardare con Read una per una,
annotare autore e URL in `docs/art-director.md`):
- auto normale su ponte a due colonne, di lato o di tre quarti ("car lift
  garage", "car on hydraulic lift", "auto officina ponte");
- ruota smontata con disco e pinza in vista ("brake disc caliper wheel off");
- sottoscocca visto da sotto ("under car exhaust", "car underside lift");
- scaffalatura di gomme ("tire storage rack", "tyre warehouse");
- officina ordinata, luce di neon, pavimento con linee ("auto repair shop
  interior").

**Scartare**: supercar, auto da corsa, auto d'epoca americane cromate, saloni
da concessionario, foto dominate dall'arancio (era il bocciato), foto con
fiamme/scintille da smerigliatrice come effetto, stock posato col meccanico
sorridente e il pollice alzato, officine palesemente non europee se si
riconoscono (targhe USA in primo piano). Le persone al lavoro vanno bene se
sono naturali e non protagoniste.

**Piano B**: se per una collocazione non c'è una foto giusta, **meglio
nessuna foto**: la sezione Officina diventa un fermo immagine della scena 3D
con il ponte a 180 cm e i recapiti; il fallback senza WebGL usa i fermi
immagine renderizzati (4.3). Il testo non finge mai che le foto siano "la
nostra officina" se sono stock: dice "un'officina come la nostra" oppure
niente.

### 4.7 Mobile 375 px (pensato, non ridotto)

- La scena riempie lo schermo in verticale. A 0-80 cm l'auto è inquadrata di
  tre quarti più stretta (FOV e distanza della camera per aspetto verticale:
  ogni chiave del binario ha una variante "portrait"). A 180 cm la vista dal
  basso mette l'auto **in verticale** (muso in alto): il pianale lungo occupa
  tutta l'altezza e i punti toccabili sono ben distanziati sotto il pollice.
- L'asta graduata resta a destra, 32 px di larghezza, numeri ogni 50 cm. Il
  testo delle quote sta in un pannello in basso (fino al 40% dello schermo),
  sopra il pavimento, con 20 px di margine laterale; la scena resta visibile
  sopra.
- La scheda di un punto si apre dal basso fino al 55% dell'altezza e lascia
  visibile il pezzo evidenziato; si chiude con "Chiudi" o trascinando giù.
- Il `ConceptBackButton` sotto i 640 px sta in basso a sinistra: pannelli e
  barra "Il tuo lavoro" lasciano libero quell'angolo (margine inferiore di 72
  px a sinistra).
- Planning verticale come in 4.4; striscia dei giorni scorrevole di lato con
  scroll-snap.
- Target di tocco minimi 44 × 44 px ovunque, compresi i giorni e i bottoni
  "10' prima / dopo".

### 4.8 Accessibilità (riassunto vincolante)

- Il DOM è sempre la fonte: prezzi, tempi, punti e planning esistono come
  testo e controlli veri; il canvas è decorativo.
- Contrasti AA come in 4.1; nessun testo corrente sul verde pieno.
- Tutto il sito si usa da tastiera: asta graduata (link), punti (bottoni con
  frecce), schede (dialog non modale con Esc), planning (blocco con frecce ed
  elenco dei buchi).
- Nessuna informazione solo nel colore: il tuo blocco è bianco **e** ha il testo
  "il tuo lavoro"; i buchi sono tratteggiati **e** hanno l'orario scritto.
- Niente lampeggi: nessun cambio di luminosità più di 3 volte al secondo,
  neon mai sfarfallanti, evidenziazione dei pezzi con transizione di 250 ms.
- `prefers-reduced-motion` come in 4.3; lingua `it` sul wrapper; titoli di
  sezione in ordine (`h1` una volta sola).

### 4.9 Cosa NON fare

**Dal bocciato CHIAVE DEL TREDICI ("libretto di manutenzione")**
- Niente libretto, scheda d'ingresso da compilare, "scadenze", promemoria del
  tagliando, sette spie del cruscotto, verde/giallo/rosso come semafori di
  stato.
- Niente arancio, niente grigio antracite con accento acceso, niente
  condensato maiuscolo pesante, niente titolo con una parola colorata.
- Niente split testo a sinistra e foto in cornice a destra, niente "TAV. I",
  niente riga di numeri tra filetti ("dal 2001 / 3 ponti / 1h30"), niente due
  bottoni pieno + contorno nell'apertura, niente orari in piccolo sotto i
  bottoni.
- Niente etichetta "Prenota il ponte": l'intento prenotazione si chiama
  **"Trova un buco"** ovunque; l'invio si chiama "Metti in ponte".
- Niente sezione "La squadra" con ritratti, niente sezioni numerate "01".
- Niente "via Vallona 13".

**Dalla ricetta bocciata in generale**
- Niente serif corsivo, niente occhielli in maiuscoletto spaziato o monospace,
  niente fade-up allo scroll (l'unico movimento è il ponte), niente schede
  bianche con bordino, niente bento, niente onde o divisori, niente mappa
  disegnata, niente figure umane o meccanici in SVG, niente prenotazione a
  passi che finisce in cartolina o scontrino.

**Per non avvicinarsi agli altri concept**
- Niente orbita libera della camera, niente trascina-per-ruotare, niente vista
  esplosa, niente scelta di colore o materiale dell'auto (è il territorio di 1
  MERIDIANA e del configuratore hardware 3D del sito).
- Niente luce o lampada che segue il puntatore, niente rivelazioni al buio
  (10 IMPRONTA, 12, 13).
- Niente campo pieno di verde come fondo (10 IMPRONTA ha il campo pieno); il
  verde sta sugli oggetti e sui pannelli.
- Niente verde acqua o verde brillante (11 TAJUT).
- Niente planning settimanale ad anello o due appuntamenti collegati (15
  NOVANTA): qui una giornata, tre corsie, un blocco.
- Niente "tieni premuto per inviare" (10 IMPRONTA).

**Specifici del mestiere**
- Niente estetica racing: niente bandiera a scacchi, niente strisce gialle e
  nere di pericolo, niente contagiri o tachimetri, niente fiamme, niente
  carbonio.
- Niente riflessi cromati, HDRI da studio, vernice metallizzata da
  concessionario. Materiali opachi.
- Niente icone di chiavi inglesi, ingranaggi, pistoni come decorazione.
- Niente colori originali della texture Kenney (il giocattolo arancione).
- Niente cursore custom, niente testo magnetico, niente "Scorri".
- Niente contatori finti ("12.000 auto riparate"), niente recensioni con
  stelline a 5,0 perfette; se servono recensioni, poche, verosimili, con nome
  e paese.
- Niente trattini lunghi (né `—` né `–`) in nessun testo visibile; il punto
  mediano al massimo uno per riga (le targhette dei ponti).

### 4.10 Note per le ondate successive

- **tech-architect / webgl-artist / shader-engineer**: un solo `<Canvas>` R3F
  fisso dietro al DOM; la quota `h` e il binario della camera sono uno stato
  unico derivato dallo scroll (un solo listener passivo, niente Lenis globale).
  Proiezione dei punti toccabili in un unico passaggio per frame renderizzato,
  scritta direttamente negli stili (niente re-render React per frame). Fermi
  immagine delle 4 quote generati dalla build per poster e fallback.
  Nessun accesso a `window`/`document` a livello di modulo (prerender).
- **motion-designer**: gli unici movimenti sono: salita e discesa del ponte,
  binario della camera, mezza rotazione delle ruote, evidenziazione del pezzo,
  apertura della scheda, blocco che si aggancia e "sale sul ponte" all'invio.
  Nient'altro si muove.
- **ux-architect**: il percorso minimo per chi vuole solo prenotare è apertura
  → "Trova un buco" → planning (blocco composto lì) → invio: deve stare in 4
  interazioni.
- **copywriter**: italiano da accettazione di officina di Pordenone, frasi
  brevi, minuti e euro veri, misure gomme vere. Nessun verbo da startup, nessun
  dato legale. Scrive anche le frasi degli stati di errore del planning.
- **trend-researcher**: cercare siti con scroll che guida un solo oggetto 3D su
  un binario di camera, interfacce "a quota" o a scala graduata, planning con
  trascinamento ben fatti (strumenti di scheduling veri, non template).
  Principi, non copie.
