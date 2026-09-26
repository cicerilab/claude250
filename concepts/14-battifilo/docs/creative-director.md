# Creative director · Concept 14 · Impresa edile e serramenti (Pordenone)

Ondata 0. Rotta `/concept-14`. Documento di direzione per tutti gli agent delle
ondate successive: quello che è scritto da "3. La scelta" in giù è vincolante.

Materiale letto: `CLAUDE.md`, `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 14, paragrafo 14,
verifica incrociata, regole comuni), `concepts/10-torchio/docs/creative-director.md`
(solo come livello e formato), `concepts/10-torchio/docs/integrazione-sito.md`,
`.claude/skills/design-taste-frontend/SKILL.md` (sezioni 0, 1, 4, 9), screenshot
`docs/concept-attuali/concept-14.jpg` (il vecchio FILO A PIOMBO).

---

## 0. Da dove parto

**La matrice assegna**: BATTIFILO, la linea blu del battifilo sul calcestruzzo;
il sito è la cronaca di un cantiere tipo, dallo scavo alle chiavi, in 14 mesi.
Palette calcestruzzo / cobalto / calce / ferro; Big Shoulders Stencil Display +
Chivo; struttura a timeline con una foto a tutto schermo e un cursore del tempo;
interazione "trascinare il tempo"; prenotazione "Misura e manda". Non la scarto:
è la più forte e la più lontana dagli altri 19 che io veda. La raffino.

**Cosa aveva il vecchio FILO A PIOMBO (screenshot)**: split testo a sinistra e
foto incorniciata a destra con "TAV. I"; titolo condensato nero con una parola
gialla ("DENTRO"); riga di quattro numeri tra due filetti (212 cantieri, 4 600
serramenti, 11 in squadra, 0 preventivi a corpo); due bottoni pieno + contorno;
orari in piccolo; sezione "Rev. 00 · La casa, strato per strato" (casa in sezione
che si scopre scorrendo); giallo cantiere come accento; foto di una casa con
struttura in legno americana (sbagliata per il Friuli, dove si costruisce in
laterizio e cemento armato). Tutto questo è da non rifare.

**Due correzioni di palette rispetto alla matrice** (raffinamenti, non
avvicinamenti):
- il ferro `#2A2C2F` della matrice è identico alla carta Grafite di IMPRONTA:
  lo sposto a `#23272B`, più freddo, il colore del tondino da armatura nuovo;
- la calce `#F2F0EA` è a un soffio dall'avorio di MERIDIANA `#F2F0EB` e dalla
  famiglia "crema" vietata dalla skill: la sposto a `#F1F2EE`, bianco di calce
  spenta, leggermente freddo. E non è mai un fondo di pagina: solo testo su ferro
  o su cobalto, e il bordo del cartello.

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina commerciale di un'impresa edile e di
serramenti per privati del Pordenonese che devono costruire, ristrutturare o
cambiare le finestre, con un linguaggio da cantiere vero (calcestruzzo, spray a
stencil, la linea del battifilo) e onesto sui tempi e sui costi, leaning toward
una sola scena a timeline con fotografia reale protagonista + CSS nativo + un
unico segno SVG (la linea battuta), senza WebGL.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | Struttura radicale (niente pagina a sezioni: un palcoscenico con un cursore del tempo), ma il pubblico è una coppia di 40-60 anni che deve spendere 400.000 € o cambiare 9 finestre: ogni schermata deve leggersi al primo colpo. Non 9. |
| `MOTION_INTENSITY` | **5** | Si muovono solo tre cose: la corda che si tende e batte, la dissolvenza tra le foto, la polvere blu che si posa. Nessuna coreografia, nessun reveal. |
| `VISUAL_DENSITY` | **5** | Più dati del solito per un concept (costo del mese, progressivo, squadre, giorni fermi), perché la paura del cliente è proprio "quanto dura e quanto costa". Ma una fase per volta. |

---

## 2. La metafora sviluppata

Il **battifilo** (in Friuli anche "la corda blu", il tracciatore) è una
cassetta con dentro un filo e la polvere colorata. Si aggancia un capo, si tira
il filo teso sul calcestruzzo, lo si alza con due dita e lo si lascia: il filo
batte e lascia una linea dritta e polverosa. È il primo gesto di ogni cantiere
(si tracciano gli scavi e i muri) e l'ultimo (si tracciano le quote dei
pavimenti e le luci delle finestre). È dritto, preciso, e sporco: esattamente
come vuole sembrare un'impresa seria.

Nel sito il battifilo ha tre compiti, sempre lo stesso segno:

1. **Misura il tempo.** Il cursore sul fondo è la cassetta del battifilo. Tirarla
   verso destra srotola il filo lungo i 14 mesi; quando la lasci, il filo batte e
   la linea blu resta sul calcestruzzo fin dove sei arrivato. Il tempo del
   cantiere è una linea tracciata, non una barra di avanzamento.
2. **Dice la verità sui fermi.** Dove il cantiere si è fermato (tre settimane di
   ferie ad agosto, quattro giorni di gelo a dicembre, tre di pioggia ad aprile)
   la linea battuta ha un **buco**: il filo lì non ha toccato terra. È l'unico
   modo grafico con cui il sito mostra un ritardo, ed è onesto senza bisogno di
   testo allarmato.
3. **Disegna la tua finestra.** In "Misura e manda" lo stesso filo batte quattro
   volte e traccia sul calcestruzzo la luce della tua finestra, in proporzione,
   accanto a una porta standard. Il segno che ha raccontato il cantiere tipo
   diventa il primo segno del tuo lavoro.

Il calcestruzzo è la superficie su cui tutto si scrive: le fasi, i mesi, i
prezzi sono **marcati a spruzzo con lo stencil**, come i numeri che i
carpentieri scrivono sui getti e sui pilastri. Da qui Big Shoulders Stencil: è
la voce della bomboletta in cantiere, non un titolo da poster.

---

## 3. Tre varianti di esecuzione della stessa direzione

Tutte e tre tengono metafora, palette, font, cursore del tempo e "Misura e
manda". Cambia come foto, calcestruzzo e linea si dividono lo schermo.

### Variante A · NASTRO SULLA FOTO

- La foto del mese riempie tutto lo schermo, 100dvh. Il cursore è una striscia
  sottile di calcestruzzo appoggiata sul fondo della foto; i dati del mese
  stanno in un pannello semitrasparente ferro in basso a sinistra, sopra la
  foto.
- Pro: la foto è protagonista assoluta, effetto "film" immediato.
- Contro: i testi stanno sopra fotografie sempre diverse (cielo, ferri,
  intonaco bianco): servono velature scure che variano da foto a foto e che
  tutti i siti di edilizia hanno già. La linea blu battuta su una foto non ha
  senso: il gesso non si batte sul cielo. E somiglia al "tutto schermo con testo
  sopra" di 2 QUOTA TREMILA e alla foto piena dietro al vetro di 13 CONTROPELO.

### Variante B · LA LASTRA (scelta)

- La foto del mese occupa tutta la larghezza e la parte alta dello schermo; il
  terzo inferiore è una **lastra di calcestruzzo** vera (texture fotografica di
  un getto, tinta sulla palette) su cui la foto "poggia": ogni foto è ritagliata
  in modo che la sua linea di terra (il suolo, il pavimento, il bordo del
  solaio) cada esattamente sul bordo superiore della lastra.
- Sulla lastra sta tutto quello che si legge: fase del mese marcata a stencil,
  cosa si è fatto, chi c'era, quanto è costato, il progressivo, e in fondo la
  linea dei 14 mesi con la cassetta del battifilo.
- Pro: la metafora è letterale (la linea si batte davvero su una superficie di
  calcestruzzo); nessun testo sopra le foto, quindi contrasto sempre certo; la
  foto resta enorme e pulita. La lastra è un piano materico che nessun altro
  concept della matrice ha.
- Contro: la foto perde un terzo di altezza. Si compensa con il ritaglio
  preciso sulla linea di terra, che fa sembrare la foto più grande di quanto sia
  (la scena continua nel calcestruzzo).

### Variante C · TRACCIAMENTO

- Vista dall'alto: tutto lo schermo è calcestruzzo, la linea dei 14 mesi lo
  attraversa in diagonale come un tracciamento di muri, e le foto compaiono
  piccole, fissate con il nastro lungo la linea.
- Pro: il segno grafico è dominante, fortissimo sul piano del design.
- Contro: le foto (la prova che l'impresa lavora davvero) diventano francobolli;
  un piano grigio con una linea sopra rischia di essere freddo e di leggersi come
  un diagramma. Su 375 px la diagonale non regge. Tradisce la matrice ("foto
  protagonista").

### La scelta: B, LA LASTRA

1. È l'unica in cui la metafora funziona alla lettera: la linea blu si batte sul
   calcestruzzo, e il calcestruzzo è lì, sotto la foto, come il suolo del
   cantiere.
2. Mantiene la foto protagonista (larga, alta, senza scritte sopra) e mette le
   informazioni su un materiale che garantisce il contrasto AA sempre, con
   qualunque foto: è la scelta più solida per l'accessibilità.
3. Stacca il concept dagli altri "foto piena" della matrice: 13 CONTROPELO ha la
   foto dietro un vetro appannato a tutto schermo, 16 EVIDENZIA ha le foto solo
   nelle schede, 2 QUOTA TREMILA ha il testo sopra la foto. Qui foto e
   calcestruzzo sono due piani distinti con un bordo netto, la linea di terra.
4. Si costruisce bene in CSS: due livelli di immagini in dissolvenza, una lastra
   con texture, un SVG per filo e linea. Niente WebGL, niente rischio tecnico,
   ottimo su mobile.

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo in breve (base per art-director)

**Palette** (una sola, fredda; nessun giallo in tutto il sito)

| Nome | Hex | Uso |
|---|---|---|
| Calcestruzzo | `#B8B4AB` | la lastra: fondo di tutte le zone di lettura (tinta media sotto la texture) |
| Calcestruzzo ombra | `#9F9B92` | tacche dei mesi, bordi di campo, porta di riferimento in "Misura e manda" |
| Cobalto | `#1C4CB4` | la linea battuta, le cifre grandi a stencil (solo da 24 px in su), il bottone principale |
| Cobalto fondo | `#163E94` | solo per testo cobalto piccolo su calcestruzzo (link, prezzi in riga) |
| Ferro | `#23272B` | testo su calcestruzzo, fascia alta, fondo del "cartello" |
| Calce | `#F1F2EE` | testo su ferro e su cobalto; bordo del cartello |

Contrasti calcolati (da ricontrollare dall'accessibility-auditor):
ferro su calcestruzzo circa 7,3:1 (AA testo); cobalto `#1C4CB4` su calcestruzzo
circa 3,7:1, quindi **solo testo grande** (≥ 24 px o ≥ 19 px grassetto) e
segni grafici; cobalto fondo `#163E94` su calcestruzzo circa 4,8:1 (AA testo);
calce su cobalto circa 6,8:1 (bottone AA). La texture della lastra deve restare
entro ±6% di luminosità dalla tinta media, altrimenti i contrasti cadono.

**Accento unico**: il cobalto, cioè la polvere del battifilo. Compare solo dove
c'è "gesso": linea dei mesi, cifre dei costi, disegno della finestra, bottone
"Misura e manda". Niente altro colore, nemmeno per gli errori.

**Tipografia**
- *Big Shoulders Stencil* (Google Fonts; la famiglia che la matrice chiama
  "Stencil Display": oggi è pubblicata come variabile con asse di dimensione
  ottica; si usa il taglio Display, pesi 700-900). Solo per le **marcature sulla
  lastra**: nome della fase, mesi, cifre dei costi, quote del disegno, il
  marchio. Maiuscolo, come lo stencil vero. Mai sopra una foto, mai per testi
  di lettura, mai sotto i 20 px.
- *Chivo* 400/500/700 per tutto il resto: testi del mese, istruzioni, campi,
  cartello. 16-17 px su mobile, 17-18 px desktop, interlinea 1.5, cifre
  `font-variant-numeric: tabular-nums` per i prezzi. Niente monospace.
- Niente corsivi. Niente maiuscoletto spaziato come etichetta (nessun
  occhiello). L'enfasi è il peso.
- Collisioni: nessuna delle due famiglie è nella lista vietata né in 1-9, 10 o
  negli altri concept della matrice (che usano Tektur, Epilogue, Libre Franklin,
  ecc.). Il condensato qui è stencil e sta sul calcestruzzo, non è il
  condensato sopra la foto di 2 e 5.

**Forme**: tutto spigolo vivo (raggio 0), come un cassero. Unica eccezione
documentata: la maniglia della cassetta del battifilo (angoli 6 px, è un oggetto
in plastica che si impugna).

**Materiali**
- *Lastra*: foto vera di una superficie di getto (bolle d'aria, segni del
  cassero), desaturata e portata su `#B8B4AB` con `mix-blend-mode`; fallback
  tinta piena + un rumore SVG leggerissimo. Una sola texture per tutto il sito.
- *Marcatura a spruzzo*: le scritte stencil hanno un bordo appena sfrangiato
  (maschera SVG di rumore applicata una volta, oppure `text-shadow` di 0,5 px
  dello stesso colore). Niente bagliori, niente glow.
- *Linea battuta*: vedi 4.3.

**Fascia alta**: una banda ferro di 56 px (48 px su mobile): marchio BATTIFILO a
stencil in calce, tre voci ("Cronaca", "Il cartello", "Misura e manda"). Su
desktop la zona in alto a sinistra di circa 230×44 px resta libera per il
`ConceptBackButton` condiviso: il marchio parte da 260 px.

### 4.2 Schermate (la struttura vera)

Non è una pagina che scorre. È **un palcoscenico unico** (la cronaca) più due
schermate a tutto schermo raggiungibili dalla fascia alta, più una vista elenco.
Lo scroll della pagina non esiste: il tempo si muove solo con il battifilo.

**S0 · Apertura, "mese zero"** (è l'hero)
- Foto: il terreno com'era, prima dello scavo (prato o sterrato con picchetti o
  paletti di legno, nessuna persona). Ritagliata sulla linea di terra.
- Sulla lastra, a sinistra: titolo a stencil in due righe, per esempio
  "QUATTORDICI MESI, DALLO SCAVO ALLE CHIAVI." Sotto, in Chivo, al massimo 20
  parole: "La cronaca di un cantiere tipo a Cordenons: cosa si fa ogni mese, chi
  c'è, quanto costa." Un solo bottone cobalto: **Misura e manda**. Nessun'altra
  riga: niente numeri tra filetti, niente orari, niente "dal 1996".
- In fondo alla lastra la linea dei 14 mesi, ancora non battuta, con la
  cassetta al punto zero e accanto, una sola volta, l'istruzione "Tira il filo
  per far passare i mesi" (è l'istruzione di un controllo non ovvio, non un
  "scroll"). Sparisce al primo movimento.
- Unico movimento d'apertura: dopo 600 ms il filo si tende da solo fino al mese
  1 e batte una volta, lasciando il primo tratto blu e un filo di polvere. Poi
  si ferma e aspetta. Con riduzione del movimento il primo tratto è già lì.

**S1 · La cronaca, mesi 1-14** (stesso palcoscenico, cambia il contenuto)
- Al primo spostamento il titolo di S0 lascia il posto alla scheda del mese
  (dissolvenza di 250 ms, nessuno scorrimento). La scheda, sulla lastra, ha
  sempre gli stessi cinque pezzi e nessun riquadro intorno:
  1. **fase**, a stencil grande ferro: "IMPIANTI"; accanto, in Chivo, "ottobre,
     mese 8";
  2. **quanto è costato il mese**, a stencil cobalto grande: "41.200 €"; sotto,
     in Chivo, "speso finora 238.400 € su 412.500 €";
  3. **cosa si è fatto**, 2-3 righe;
  4. **chi c'era**: mestieri e numero di persone, giorni in cantiere, giorni
     fermi e perché ("elettricisti 2, idraulici 2 · 19 giorni in cantiere");
  5. **cosa controllare tu**, una riga di consiglio pratico ("Prima che chiudano
     le tracce, fotografa i tubi: un giorno ti servirà sapere dove passano.").
     È la voce che trasforma la cronaca in aiuto vero e fa fidare.
- Il cantiere tipo (proposta per il copywriter, cifre di esempio IVA esclusa,
  casa unifamiliare di 170 m² in laterizio e cemento armato, classe energetica
  alta, a Cordenons; totale 412.500 € circa 2.430 €/m²):

  | Mese | Fase | Costo del mese | Fermi (buchi nella linea) |
  |---|---|---|---|
  | 1 marzo | Tracciamento e scavo | 14.600 € | |
  | 2 aprile | Fondazioni: magrone, ferri, getto della platea | 32.400 € | 3 giorni di pioggia |
  | 3 maggio | Vespaio aerato, scarichi, muri del piano terra | 29.800 € | |
  | 4 giugno | Muri del piano terra e solaio | 38.900 € | |
  | 5 luglio | Muri del primo piano, cordoli | 31.700 € | |
  | 6 agosto | Struttura del tetto | 22.300 € | 3 settimane di ferie |
  | 7 settembre | Manto del tetto, lattonerie, controtelai delle finestre | 27.500 € | |
  | 8 ottobre | Impianti: tracce, elettrico, idraulico | 41.200 € | |
  | 9 novembre | Intonaci interni | 24.600 € | |
  | 10 dicembre | Massetti e riscaldamento a pavimento | 26.900 € | 4 giorni di gelo |
  | 11 gennaio | Cartongessi, ventilazione meccanica, pompa di calore | 30.400 € | |
  | 12 febbraio | Posa dei serramenti | 36.800 € | |
  | 13 marzo | Cappotto esterno e pavimenti | 34.100 € | |
  | 14 aprile | Finiture, esterni, collaudi e documenti | 21.300 € | |

  L'ordine è quello vero di un cantiere in laterizio (le finestre si posano
  prima del cappotto, che poi risvolta sul telaio; niente cappotto a gennaio
  perché le colle non lavorano sotto i 5 °C). Il copywriter rifinisce le cifre;
  devono restare "sporche" e verosimili, sempre marcate come esempio nel testo
  ("cifre di un cantiere tipo, IVA esclusa").
- Nei mesi 7 e 12 (controtelai e posa dei serramenti) la scheda ha un
  collegamento in più, in Chivo cobalto fondo: "Quanto costerebbe la tua
  finestra?" che apre "Misura e manda". È un invito contestuale, non un secondo
  bottone uguale al primo.

**S2 · Le chiavi** (la posizione dopo il mese 14, fine della linea)
- Foto: una porta d'ingresso nuova con la chiave nella serratura (niente mani,
  niente coppia sorridente).
- Sulla lastra il bilancio, in quattro righe onestissime: 14 mesi e 11 giorni
  di fermo; preventivo firmato 398.000 €, finale 412.500 € (+3,6%) e perché (due
  varianti chieste dal cliente: una finestra in più in cucina, un pavimento
  diverso al piano terra); cosa si consegna con le chiavi (certificazione
  energetica, dichiarazioni di conformità degli impianti, libretto della pompa
  di calore, manuale dei serramenti); il telefono del capocantiere per il
  primo anno (di esempio).
- La linea blu qui è tutta battuta, con i suoi tre buchi: il riassunto visivo
  del cantiere senza nessun grafico.

**S3 · Misura e manda** (prenotazione, vedi 4.4). Schermata a tutto schermo di
sola lastra, si apre dalla fascia alta, dal bottone di S0 e dai mesi 7 e 12.

**S4 · Il cartello** (chi siamo, dove, orari, contatti)
- Il cartello di cantiere, quello obbligatorio appeso alla rete: un pannello
  ferro con bordo calce, testo in Chivo e intestazioni a stencil, appeso sulla
  lastra con due fascette (disegnate in CSS, due rettangolini). Righe:
  impresa esecutrice (BATTIFILO costruzioni e serramenti), sede (indirizzo di
  esempio a Cordenons, **non** via Comina che era del vecchio concept), orari
  di ufficio e del magazzino serramenti (sabato mattina aperto per vedere i
  campioni), telefono ed email di esempio, zone in cui lavoriamo (Pordenone,
  Cordenons, Porcia, San Quirino, Fiume Veneto, Sacile), chi siamo in tre righe
  (squadra propria di muratori, posatori dei serramenti interni all'impresa).
  Un link "Apri in Maps" verso la mappa vera. Nessun numero di permesso, nessuna
  partita IVA, nessun nome di direttore lavori: niente dati legali inventati.
- Una sola foto piccola sopra il cartello? No: nessuna foto. Il cartello è il
  contenuto.

**S5 · Tutti i mesi** (vista elenco, alternativa accessibile e stampabile)
- Link "Leggi tutti i mesi" nella lastra di S1 e nel cartello. Apre una
  colonna di lettura su lastra: i 14 mesi come elenco ordinato (`<ol>`), ognuno
  con fase, costo, fatto, chi c'era, fermi, consiglio, e la foto piccola con la
  sua didascalia. Qui sì la pagina scorre, perché è un documento da leggere. Si
  chiude tornando alla cronaca sullo stesso mese.

### 4.3 Interazione firma: "Tira il filo"

**L'oggetto**
- La **cassetta** (il cursore): un piccolo corpo ferro 44×56 px con una
  maniglia, disegnato in CSS; dal suo lato sinistro esce il **filo**, una linea
  SVG sottile (1,5 px, ferro) agganciata al punto zero della lastra con un
  gancetto. Non è un cursore custom del mouse: è un controllo che si afferra.
- Sotto il filo c'è la **linea battuta**: la traccia blu, larga 5-6 px, con i
  bordi polverosi e la densità del gesso non uniforme. Le 14 tacche dei mesi
  sono marcate a stencil sotto la linea ("MAR", "APR", ... "APR"), più la
  posizione finale "CHIAVI".

**Il gesto**
1. *Tirare*: trascini la cassetta verso destra (o sinistra). Il filo si allunga
   teso e dritto dietro di lei. La foto e la scheda cambiano **per fasi**,
   quando la cassetta supera la metà di un mese, non in modo continuo. Durante
   il trascinamento la foto nuova arriva in dissolvenza incrociata (450 ms,
   le due foto sempre sovrapposte, mai passaggio per bianco o nero).
2. *Battere*: quando lasci la cassetta (o ti fermi per 500 ms) la cassetta si
   aggancia al mese più vicino e il filo **batte**: si solleva di pochi pixel al
   centro, torna giù con due piccole oscillazioni smorzate (350 ms in tutto) e
   lascia la linea blu fino a quel mese. Pochissima polvere si alza dal punto
   d'impatto e si posa in 800 ms (8-12 granelli, opacità bassa, nessun lampo).
3. *La linea resta*: se torni indietro il filo si accorcia, ma il gesso già
   battuto resta, un po' più chiaro (opacità 55%): si vede fin dove hai
   guardato, come in cantiere il segno vecchio resta sotto quello nuovo.
4. *I buchi*: nei mesi con fermi la linea battuta ha un'interruzione di
   lunghezza proporzionale ai giorni fermi (ad agosto tre quarti del mese).
   Passandoci sopra con il puntatore o mettendo a fuoco la tacca compare una
   riga: "Ferie: cantiere chiuso dal 4 al 22 agosto."

**Altri modi di muovere il tempo** (tutti portano allo stesso risultato)
- Toccare o cliccare una tacca: la cassetta ci va (500 ms) e il filo batte.
- Tastiera: la cassetta è un `role="slider"` (vedi 4.6).
- Swipe orizzontale sulla foto: un mese avanti o indietro.
- Rotella del mouse o trackpad sopra la scena: **a scatti**, un mese per gesto
  (blocco di 400 ms tra uno scatto e l'altro), mai uno scorrimento continuo. È
  una concessione a chi usa la rotella per abitudine: il sito non "scorre", fa
  un passo.

**Come la costruisco (per motion-designer e section-builder)**
- Filo: un `<path>` SVG quadratico dal gancio alla cassetta; durante la
  battuta si anima solo il punto di controllo centrale (molla smorzata, valori
  guidati da `requestAnimationFrame`, niente stato React per frame).
- Linea battuta: un rettangolo SVG lungo tutta la linea con un filtro di rumore
  (`feTurbulence` + `feDisplacementMap`) calcolato **una volta**, poi rivelato
  con `clip-path: inset()` fino al mese raggiunto; i buchi sono maschere fisse.
  Nessun filtro ricalcolato durante l'animazione.
- Polvere: pochi `<circle>` SVG o un piccolo canvas 2D che esiste solo per 800
  ms; oppure niente se il dispositivo è lento.
- Nessuna libreria di animazione obbligatoria: CSS + rAF bastano. GSAP non
  serve.

**Le foto per fasi: come renderle coerenti e credibili**

Non esiste su nessuna banca foto la stessa casa fotografata per 14 mesi, e non
la si finge. Scelta (come dice la matrice): **foto vere di cantieri diversi,
dichiarate**, rese coerenti dal trattamento e dal ritaglio, non dall'inganno.

- *Dichiararlo*: in S0 e in S5 una riga in Chivo: "Un cantiere tipo, raccontato
  con foto di cantieri diversi." Ogni foto ha la sua didascalia funzionale
  sotto, sulla lastra, piccola: cosa si vede e l'autore Unsplash ("Getto di
  una platea. Foto di N. Cognome, Unsplash").
- *Coerenza di tecnica costruttiva*: solo cantieri europei in **laterizio e
  cemento armato** (blocchi in laterizio forato, tetto in legno con coppi o
  tegole, cappotto in EPS o fibra di legno). Scartare ogni foto di struttura in
  legno americana o giapponese, grattacieli, gru a torre da città, capannoni.
- *Coerenza di punto di vista*: mesi 1-7 (esterni) fotografati da altezza
  d'uomo, tre quarti, con il suolo visibile; mesi 8-11 (interni) da altezza
  d'uomo verso una parete; 12-14 di nuovo esterni o dettagli di finestra. Mai
  droni, mai grandangoli deformati, mai foto dal basso "eroiche".
- *Linea di terra allineata*: per ogni foto l'art-director fissa
  `object-position` (desktop e mobile separati) in modo che il suolo, il
  pavimento o il bordo del solaio cada sul bordo della lastra. Passando da un
  mese all'altro l'orizzonte non salta: è questo che fa sembrare la sequenza un
  racconto solo.
- *Coerenza di luce e colore*: stessa correzione su tutte (bianchi portati
  verso la calce, neri alzati verso il ferro, saturazione -15%, un filo di
  freddo), fatta **una volta sui file** in fase di ottimizzazione, non con
  filtri CSS a runtime. Scartare foto al tramonto, notturne, con cielo
  drammatico.
- *Niente persone in primo piano*: operai sì se di spalle o lontani e al
  lavoro vero; niente volti riconoscibili in primo piano, niente pollici alzati,
  niente caschi in posa, niente strette di mano.
- *Termini di ricerca da cui partire* (il trend-researcher / art-director
  verifica con Read una per una): empty plot stakes; excavation foundation;
  rebar concrete slab; concrete pouring foundation; clay block wall
  construction / hollow brick wall; slab formwork; roof timber structure
  insulation; roof tiles installation; conduit wall chases electrical; wall
  plastering; underfloor heating screed; drywall installation; window
  installation; facade insulation EPS; tile laying floor; new front door key.
- *Fasi a rischio* (probabile che manchi una foto credibile): tracciamento con
  il battifilo, vespaio con igloo, controtelai, ventilazione meccanica.

**Piano B, in quest'ordine**
1. *Dettaglio al posto della scena*: se manca la foto del cantiere in quella
   fase, una macro vera del materiale giusto (i ferri legati, i blocchi in
   laterizio accatastati, le tegole, i tubi del pavimento radiante, un
   controtelaio in angolo). Il dettaglio è sempre credibile e non pretende di
   essere "la casa".
2. *Solo lastra*: se neanche il dettaglio è giusto, quel mese non ha foto: la
   lastra sale e occupa tutto lo schermo, con la fase marcata grandissima a
   stencil. Meglio nessuna foto che una foto sbagliata (regola di Luca).
3. *Mai immagini generate* spacciate per un cantiere vero e mai la "stessa casa"
   ricostruita con un generatore: sarebbe proprio la finzione che la matrice
   vieta, e un'impresa che mente sulle foto perde tutto.

**L'argomento commerciale per CiceriLab**: il concept è fatto per ricevere le
foto vere di un cantiere dell'impresa cliente, scattate col telefono una volta
al mese. Con quelle diventa "la cronaca di un nostro cantiere", la stessa casa
dall'inizio alla fine. Il copywriter lo scrive nella voce `desc` del concept.

### 4.4 Meccanica unica di prenotazione: "Misura e manda"

**L'idea**: chi deve cambiare le finestre non sa quanto costano e ha paura di
chiamare per niente. Qui prende il metro, misura la sua finestra, scrive due
numeri e vede la sua finestra **battuta sul calcestruzzo** in proporzione
accanto a una porta standard, con la forbice di prezzo nei tre materiali. Poi
chiede il sopralluogo con le misure già dentro. Non è un modulo a passi, non è
un calendario, non finisce in cartolina.

**Layout**
- Desktop: tutta la schermata è lastra. A sinistra (circa 55%) il **piano di
  tracciamento**: una linea di terra in basso, a sinistra la **porta interna
  standard 80 × 210 cm** disegnata con un contorno calcestruzzo ombra e la sua
  quota a stencil, a destra lo spazio dove batterà la tua finestra, alla stessa
  scala. A destra (45%) le istruzioni, i campi, la forbice e l'invio, in una
  colonna sola.
- 375 px: il piano di tracciamento sta in alto, fisso, alto circa 38% dello
  schermo (porta e finestra sempre visibili); sotto scorrono istruzioni, campi,
  forbice e invio. Il disegno si aggiorna sempre in vista.
- Riferimento di scala: **la porta, mai una sagoma umana**.

**Le istruzioni "come si misura la luce"** (sempre visibili, brevi)
- Tre righe e un piccolo schema a linee (la finestra vista da dentro, con tre
  frecce orizzontali e tre verticali, stesso segno blu): "Misura la larghezza
  in alto, al centro e in basso, da muro a muro. Tieni la misura più piccola.
  Fai lo stesso con l'altezza, dal davanzale all'architrave. Se c'è ancora il
  telaio vecchio, misura dove vedi l'intonaco: al sopralluogo rimisuriamo noi
  al millimetro."

**Le scelte** (una colonna, ordine libero, nessun numero di passo)
1. *Che cosa*: finestra a un'anta, finestra a due ante, portafinestra,
   scorrevole alzante. Cambia il disegno dentro il rettangolo (montante
   centrale, maniglia, binario) e il coefficiente di prezzo.
2. *Larghezza* e *altezza* in centimetri: due campi numerici veri
   (`inputmode="decimal"`), etichetta sopra, aiuto sotto ("tra 40 e 300 cm"),
   errore sotto il campo.
3. *Quante uguali*: da 1 a 20, con due bottoni meno/più da 44 px.

**Il disegno**
- Appena entrambe le misure sono valide il filo del battifilo batte **quattro
  volte** (sopra, destra, sotto, sinistra, 120 ms tra una battuta e l'altra) e
  traccia il rettangolo blu della luce, poggiato sulla linea di terra a 90 cm
  (davanzale tipico; 0 per portafinestra e scorrevole). Le quote sono marcate a
  stencil cobalto lungo i lati ("118" e "142"), come si quota in cantiere; sotto,
  in Chivo, la superficie ("1,68 m² di luce").
- Se cambi un numero, il lato che cambia viene ribattuto (una battuta sola),
  il vecchio segno resta chiaro sotto: si vede la correzione.

**La forbice di prezzo**
- Tre righe, una per materiale, **non tre schede**: PVC, legno-alluminio,
  legno. Ogni riga è un tratto battuto su un solo asse orizzontale dei prezzi
  comune ai tre (da min a max), con le due cifre alle estremità ("da 780 € a
  1.120 €") e una riga di carattere del materiale ("PVC: non si vernicia mai,
  il più economico."). I tre tratti si distinguono per la posizione sull'asse e
  per il nome, non per il colore: sono tutti cobalto.
- Prezzi indicativi per pezzo, posa e smontaggio del vecchio compresi, IVA
  esclusa; il totale per la quantità scelta sotto. Base di calcolo proposta al
  ux-architect e al copywriter (esempio verosimile, da rifinire): PVC 450-650
  €/m², legno 650-900 €/m², legno-alluminio 800-1.100 €/m², minimo fatturato
  1 m² per pezzo, scorrevole alzante ×1,6, portafinestra ×1,1, posa 160-240 € a
  pezzo. Detrazioni fiscali: una riga sola, "Te ne parliamo al sopralluogo",
  nessuna percentuale scritta.

**L'invio**
- Campi: nome; telefono o email (un campo, si accetta l'uno o l'altro);
  comune (scelta tra i comuni serviti + "altro"); quando preferisci il
  sopralluogo (mattina, pomeriggio, sabato mattina). Etichette sopra, errori
  sotto, nessun placeholder come etichetta.
- Bottone cobalto con testo calce: **Manda le misure**.
- Nella demo l'invio è simulato (circa 900 ms) e chiama
  `track("demo_prenotazione", { concept: 14, tipo, materiale_visto })`.

**Stati obbligatori**
- *Vuoto*: mai un piano bianco. Porta disegnata, linea di terra, e al posto
  della finestra il **filo teso ma non battuto** (una linea sottile ferro che
  forma un rettangolo tratteggiato di esempio, con la scritta "Scrivi le tue
  due misure: la battiamo qui, accanto alla porta."). La forbice non mostra
  cifre: tre tratti grigi calcestruzzo ombra con la scritta "La forbice compare
  con le due misure." Il bottone di invio c'è ma dice cosa manca.
- *Parziale*: una sola misura scritta: il filo si tende solo su quel lato
  (una linea della lunghezza giusta, ancora non battuta).
- *Errore*: 
  - misura fuori campo (sotto 40 o sopra 300 cm): sotto il campo, in ferro con
    un'icona Phosphor di avviso e bordo del campo a 2 px ferro, la frase
    "Una finestra da 12 cm non esiste: controlla la misura." Nel disegno il filo
    è **molle** (una curva che pende): il battifilo non batte con la corda
    molle. Il colore non cambia: nessun rosso, l'errore si capisce da testo,
    icona e forma;
  - misura probabilmente in millimetri (da 400 a 3000): "Forse hai scritto in
    millimetri: 1180 mm sono 118 cm." con un bottone "Usa 118";
  - contatto non valido: "Scrivi un numero di telefono o un'email: ti
    richiamiamo lì."
  - `aria-invalid`, `aria-describedby` sull'errore, fuoco sul primo campo
    sbagliato all'invio.
- *Invio in corso*: bottone disabilitato con testo "Mando le misure…"; nel
  disegno il filo fa una battuta lunga su tutto il perimetro. Nessuno spinner.
- *Successo*: niente cartolina, ricevuta, scontrino o busta. Il disegno resta
  dov'è; sulla lastra, accanto, compare **marcata a spruzzo** la data di oggi e
  la scritta "Ricevute. Ti chiamiamo entro domani per il sopralluogo a
  Porcia. Tieni il metro a portata di mano." E il sito cambia: nella cronaca,
  prima del mese 1, compare una tacca in più, **"TU"**, con la tua finestra
  "118 × 142" battuta in piccolo: il tuo lavoro entra nella linea del tempo.
  (Salvato in `localStorage` con try/catch, solo per questo browser.)
- *Invio fallito*: il filo del disegno torna molle, i dati restano nei campi,
  e il messaggio dice cosa fare: "Non è partita. Riprova tra poco oppure
  chiamaci al 0434 000 000 (numero di esempio)." con il numero cliccabile.

### 4.5 Uso di SVG e CSS

- **SVG solo per il segno del battifilo**: filo, linea battuta con i suoi buchi,
  tacche, polvere, rettangolo della finestra, tratti della forbice, schema
  "come si misura". È un unico segno che si ripete, non illustrazione.
- **Niente SVG disegnati a mano di case, gru, caschi, betoniere, operai,
  cazzuole, metri**. La porta di riferimento è un rettangolo con una maniglia,
  non un disegno. Icone (avviso, telefono, freccia) solo da Phosphor, una
  famiglia, tratto uniforme.
- **CSS per tutto il resto**: lastra (immagine + tinta + `mix-blend-mode`),
  fascia ferro, cartello con le fascette, cassetta del battifilo, dissolvenze
  delle foto (`opacity`, due livelli), layout con CSS Grid. Nessun WebGL, nessun
  canvas tranne, facoltativo, quello della polvere.
- Foto: `<picture>` con WebP 1600 e 900 px, circa 150-220 KB l'una; si
  precaricano solo il mese precedente e il successivo a quello visto.

### 4.6 Accessibilità e reduced motion

- **Cassetta = slider vero**: `role="slider"`, `aria-valuemin="0"`,
  `aria-valuemax="15"` (0 apertura, 1-14 mesi, 15 chiavi), `aria-valuetext`
  parlante ("Mese 8, ottobre: impianti. 41.200 euro. Speso finora 238.400
  euro."). Frecce ±1, Pagina su/giù ±3, Home e Fine. Una regione `aria-live`
  educata annuncia la fase quando il mese si ferma (non a ogni pixel).
- **Tacche**: bottoni veri, ognuno con nome completo del mese e fase; i buchi
  hanno la loro spiegazione anche da tastiera (a fuoco sulla tacca).
- **Vista elenco** S5 sempre raggiungibile: chi non vuole trascinare ha tutta la
  cronaca in un documento semplice. Ordine di lettura del DOM uguale a quello
  visivo.
- **Foto**: `alt` che dice la verità ("Cantiere di un'altra casa: posa dei
  ferri della platea di fondazione."). Nessuna informazione solo nella foto.
- **Contrasti**: vedi 4.1. Il cobalto piccolo usa sempre `#163E94`. Fuoco
  visibile: contorno 3 px cobalto con distanza 3 px sulla lastra, calce sulla
  fascia ferro.
- **Niente lampeggi**: dissolvenze ≥ 250 ms, polvere lenta, nessun cambio di
  luminosità più veloce di 3 volte al secondo; la dissolvenza tra due foto
  molto diverse (cielo bianco e interno scuro) usa 450 ms, mai un taglio netto
  ripetuto se l'utente trascina veloce (durante il trascinamento rapido si
  aggiorna al massimo 3 volte al secondo, poi la foto finale).
- **`prefers-reduced-motion`**: nessuna battuta animata (la linea compare già
  battuta), nessuna oscillazione del filo, nessuna polvere, foto con
  dissolvenza di 150 ms, apertura senza movimento (primo tratto già segnato), il
  rettangolo della finestra compare intero. Tutto resta comprensibile e bello.
- Target di tocco ≥ 44 px ovunque (cassetta, tacche su mobile, meno/più).

### 4.7 Mobile 375 px (pensato come versione piena, non ridotta)

- Fascia ferro 48 px: marchio a stencil e un bottone "Menu" che apre le tre
  voci su una lastra a tutto schermo.
- **Foto**: circa 42% dell'altezza (`svh`), ritaglio mobile dedicato per ogni
  foto, sempre sulla linea di terra.
- **Lastra**: il resto. In alto fase (stencil 36-40 px) e "ottobre, mese 8";
  poi il costo del mese grande in cobalto e il progressivo; poi "fatto", "chi
  c'era", "controlla" in tre blocchi da due righe, con "Di più" che apre il
  testo completo nella stessa lastra. Il copywriter scrive i testi per starci.
- **Linea del tempo**: su 343 px utili 14 mesi farebbero tacche da 24 px, troppo
  piccole. Quindi su mobile **la cassetta resta ferma al centro e la linea
  scorre sotto di lei** (si vedono circa 5 mesi alla volta): trascini la lastra
  in orizzontale e il filo si srotola. Ai lati due bottoni 44 px "mese prima" e
  "mese dopo". Swipe sulla foto: un mese.
- **Zona del `ConceptBackButton`**: in basso a sinistra (circa 210×44 px) resta
  libera. La linea del tempo sta **sopra** una fascia inferiore di 64 px in cui
  il bottone condiviso sta a sinistra e "Misura e manda" (cobalto) a destra.
- "Misura e manda" su mobile: piano di tracciamento fisso in alto (38%), campi
  sotto; la tastiera numerica non copre mai il disegno (i campi portano su
  il contenuto, il disegno resta).
- Il cartello (S4) su mobile riempie la larghezza con 16 px di margine, e le
  fascette restano: non diventa un elenco nudo.

### 4.8 Cosa NON fare

**Dal vecchio FILO A PIOMBO ("il cantiere scorrendo")**
- Niente pagina a scroll verticale che racconta il cantiere sezione dopo
  sezione: qui il tempo si **tira** con il battifilo, non si scorre, e la
  pagina non scorre affatto (tranne la vista elenco S5).
- Niente casa in sezione, niente "strato per strato", niente spaccato dei muri,
  niente assonometrie: si mostrano **mesi e foto vere**, non strati disegnati.
- Niente giallo cantiere, niente strisce gialle e nere di pericolo, niente
  nastro bianco e rosso.
- Niente hero split testo/foto in cornice, niente "TAV. I", niente "Rev. 00",
  niente riga di numeri tra due filetti ("212 cantieri finiti"), niente due
  bottoni pieno + contorno, niente orari sotto l'hero, niente "dal 1996".
- Niente foto di strutture in legno all'americana.

**Dagli altri concept della matrice e da 1-10**
- Niente configuratore 3D di finestre o materiali che ruotano (MERIDIANA):
  il disegno è 2D, in proporzione, a linee.
- Niente mappa disegnata (e la mappa vera è di EVIDENZIA: qui solo un link
  "Apri in Maps").
- Niente vetrina che scorre di lato con prodotti (MADRE): qui la foto è una
  sola per volta.
- Niente maschera che rivela la foto (CONTROPELO), niente testo sopra le foto.
- Niente WebGL, niente rilievo, niente carta, niente luce radente (IMPRONTA).

**Dalla ricetta bocciata e dalla skill**
- Niente occhielli, niente "01 ·", niente maiuscoletto spaziato, niente
  monospace, niente serif.
- Niente schede con bordino e ombra, niente tre colonne uguali (la forbice dei
  materiali è un asse con tre tratti, non tre card), niente bento.
- Niente fade-up allo scroll; l'unico ingresso è la battuta del filo.
- Niente divisori decorativi: l'unica linea del sito è quella battuta, e
  significa sempre tempo o misura.
- Niente prenotazione a passi numerati, niente cartolina, scontrino, ricevuta,
  "certificato" alla fine.
- Niente sagome umane (nemmeno come scala: si usa la porta), niente caschi,
  giubbotti, gru o betoniere disegnate.
- Niente cursore custom, niente bottoni magnetici, niente "Scorri".
- Niente contatori finti ("4.600 serramenti montati"), niente recensioni con
  stelline, niente loghi di certificazioni inventati.
- Niente dati legali inventati (P.IVA, numeri di permesso, iscrizioni):
  indirizzo, telefono ed email di esempio, dichiarati tali dove serve.
- Niente trattini lunghi in nessun testo visibile.
- Un solo richiamo per intento: **Misura e manda** (fascia alta, S0, mesi 7 e
  12 con la formula contestuale, fascia mobile). Il bottone finale "Manda le
  misure" è l'atto dentro quel flusso, non un secondo richiamo.

### 4.9 Note per le ondate successive

- **ux-architect**: stati della scena (0, 1-14, 15) e dei due overlay (S3, S4)
  come stato dell'URL (`?mese=8`, `#misura`, `#cartello`) così un mese si può
  linkare e il tasto indietro del browser funziona. Regole di calcolo della
  forbice in un solo modulo testabile.
- **art-director**: il documento delle foto con, per ognuna, URL, autore, fase,
  `object-position` desktop e mobile, e la riga della linea di terra. Scegliere
  prima la texture della lastra: tutto il contrasto dipende da lei.
- **motion-designer**: gli unici movimenti sono la tensione e la battuta del
  filo, la polvere, la dissolvenza delle foto, il cambio della scheda (250 ms),
  la battuta a quattro lati della finestra. Nient'altro si muove.
- **copywriter**: italiano da ufficio di cantiere del Pordenonese, frasi brevi,
  nomi veri dei lavori (platea, vespaio, cordolo, controtelaio, massetto,
  cappotto, lattonerie); cifre sporche e dichiarate come esempio; nessun verbo
  da startup.
- **trend-researcher**: siti di imprese e studi di architettura con timeline
  fotografiche di cantiere, siti con un solo controllo fisico come navigazione,
  uso di font stencil fuori dal cliché militare. Estrarre principi, non copiare.
- **tech-architect**: niente three/R3F per questo concept; niente Lenis; porte
  9140-9159? No: porte **9140-9159** non esistono per la regola del Lab, il
  concept 14 usa **9140-9159** solo se N=14 dà 9140-9159: la regola è
  `9N00-9N19`, quindi per 14 le porte sono **91400-91419**? No: per concept 11
  la regola dà 9110-9119; per 14 dunque **9140-9149** (e fino a 9159 per
  analogia con "9N00-9N19" letto come due cifre). Usare **9140-9149**, sempre
  con `--strictPort`.
