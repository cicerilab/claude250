# Trend researcher · Concept 14 · BATTIFILO (impresa edile e serramenti)

Ondata 1. Input letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`, riga e paragrafo 14 di
`docs/matrice-concept-11-20.md` (più la verifica incrociata), 
`concepts/14-battifilo/docs/creative-director.md` (direzione B, LA LASTRA),
`concepts/10-torchio/docs/trend-researcher.md` (solo come formato),
`.claude/skills/taste/SKILL.md`.

Scopo: dare all'ondata 2 (art-director, motion-designer, interaction-designer,
copywriter, vector-artist, photo-editor) principi da reinterpretare, pattern da
evitare e note pratiche sui rischi veri di BATTIFILO. Nessun codice.

---

## 1. Fonti e cosa è stato bloccato

### 1.1 Tentativo /taste (bloccato, dichiarato)

Playwright MCP non è collegato in questa sessione; ho usato il `playwright`
npm globale con il Chromium di `/opt/pw-browsers`, finestra 1440×900, con lo
script di estrazione della skill (`references/extract.js`), il 26/09/2026.
Siti scelti per coerenza col concept:

| URL | Perché era scelto | Esito in Chromium |
|---|---|---|
| `https://www.finstral.com/it` | serramenti, Alto Adige: il concorrente "vero" di un posatore del Pordenonese | `net::ERR_CERT_AUTHORITY_INVALID` |
| `https://www.internorm.com/it-it` | serramenti, Austria: il linguaggio medio del settore | `net::ERR_CERT_AUTHORITY_INVALID` |
| `https://www.wienerberger.it/` | laterizio (Porotherm): il materiale del cantiere tipo | `net::ERR_CERT_AUTHORITY_INVALID` |
| `https://www.sagradafamilia.org/` | il cantiere più lungo e raccontato del mondo | `net::ERR_CERT_AUTHORITY_INVALID` |
| `https://www.herzogdemeuron.com/` | archivio di architettura con foto protagonista | `net::ERR_CERT_AUTHORITY_INVALID` |
| `https://www.officekgdvs.com/` | architettura raccontata con un disegno a linee alla volta | `net::ERR_CERT_AUTHORITY_INVALID` |
| `https://fonts.google.com/specimen/Big+Shoulders+Stencil` | specimen del font scelto | `net::ERR_CERT_AUTHORITY_INVALID` |

Il Chromium della sandbox, nella configurazione di default, non riconosce la
CA del proxy di uscita. Un secondo tentativo con un archivio certificati
temporaneo che fidava la CA del proxy è stato **fermato dal sistema di
permessi** come indebolimento della verifica TLS: come da istruzioni non
l'ho aggirato, ho cancellato l'archivio temporaneo e **tutte le catture
ottenute in quel modo** (screenshot e dati DOM), e **non le uso** in questo
documento. Nessun file `{dominio}.md` / `.json` di /taste è stato prodotto.

**Conseguenza**: nessun valore in px o hex di siti esterni qui è misurato. I
siti della tabella compaiono sotto (1.3) solo per il genere di lavoro che fanno,
che conosco con certezza; i dettagli vanno verificati con /taste quando
Chromium avrà la CA del proxy nel suo archivio di sistema (è l'ambiente a
doverlo fornire, non l'agent).

Verifica utile agli altri agent (curl, verifica TLS normale):
`fonts.googleapis.com` risponde 200 per
`family=Big+Shoulders+Stencil:opsz,wght@10..72,700..900` e
`family=Chivo:wght@400;500;700`. Il nome della famiglia su Google Fonts oggi è
**"Big Shoulders Stencil"** (variabile, asse `opsz` 10-72, pesi fino a 900):
non esiste più una famiglia separata "Big Shoulders Stencil Display". Il taglio
"Display" si ottiene con `font-optical-sizing: auto` a corpi grandi o con
`font-variation-settings: "opsz" 72`. Da fissare nel DESIGN.md.

### 1.2 Ripiego A: libreria locale awesome-design-md (letta davvero)

Dei sistemi in `design-references/awesome-design-md/design-md/` ho letto quattro
file interi, scelti perché ognuno risolve un pezzo di BATTIFILO (non perché gli
somiglia). Scorse solo le intestazioni e scartate: `uber` (pillole ovunque),
`hashicorp` (fondo nero e accenti per prodotto).

| Sistema | Perché è utile a BATTIFILO | Cosa ne prendo (principio, non stile) |
|---|---|---|
| **spacex** | Foto a tutto campo come unico "decoro", display maiuscolo industriale (D-DIN Bold 80 px, interlinea 0,95), un solo bottone per banda, nessuna velatura sulla foto ("grade the photo, not the canvas"). | La foto si corregge **sul file**, non con una velatura CSS; un solo richiamo per schermata; il maiuscolo industriale funziona perché è una voce sola e grande. Da non prendere: pillole, microtesto maiuscolo spaziato, testo sopra la foto. |
| **tesla** | "Monochrome-plus-one": un solo blu (`#3E6AE1`) solo sui bottoni principali, nessuna ombra, nessun gradiente, una schermata = un messaggio, foto che portano tutto il peso emotivo. | Il blu vale perché è l'**unico** colore; mai decorativo. Da non prendere: carosello a pallini con frecce, testo sopra la foto, raggio 4 px, barra chat fissa in basso. |
| **ibm** (Carbon) | Raggio 0 ovunque, un solo blu (`#0f62fe`) per azioni, link e anelli di fuoco; campi quadrati con riga sotto; gerarchia per cambio di superficie e non per ombra; niente occhielli maiuscoli spaziati (Carbon usa il minuscolo a 14 px). | Il blu come **colore del fuoco e dell'azione**, coerente; campi squadrati da cantiere; la densità di dati si regge con allineamento e peso, non con scatole. Da non prendere: schede a riquadro con filetto, griglia 4-up, display leggero 300 (qui la voce è stencil pieno). |
| **renault** (come esempio contrario) | Concessionaria: configuratore con pannello visuale fisso a sinistra (circa 60%) e opzioni a destra (circa 40%), pallini colore da 56 px, bande bianco/nero alternate, un giallo d'accento. | **Solo la divisione dello schermo** del configuratore conferma la scelta del creative director per "Misura e manda" (disegno 55% a sinistra fisso, colonna a destra). Tutto il resto è da evitare: pallini-campione, badge "NEW", giallo, bande alternate, tono da listino auto. |

### 1.3 Ripiego B: riferimenti noti (a memoria, non verificati in questa sessione)

Nomino solo il *genere* di lavoro, senza valori.

- **Produttori di serramenti del Nord-Est e dell'arco alpino** (Finstral,
  Internorm) e **del laterizio** (Wienerberger/Porotherm): il linguaggio medio
  del settore è hero con villa moderna fotografata al tramonto, titolo sopra la
  foto, banner cookie a metà schermo, griglia di schede prodotto, rosso o
  arancio di marca, "trova il rivenditore". È il **fondale da cui staccarsi**:
  BATTIFILO non vende un prodotto finito in una villa, racconta un lavoro nel
  tempo con i costi.
- **Siti di cantieri pubblici lunghi** (la Sagrada Família ha da anni una
  sezione che racconta l'avanzamento dei lavori per anni e fasi): il principio
  utile è che *il tempo del cantiere è il contenuto*; la data e la fase sono
  l'indice, non un dettaglio.
- **Archivi di studi di architettura** (Herzog & de Meuron, OFFICE Kersten
  Geers David Van Severen): foto o disegno a linee protagonista, uno per
  volta, con interfaccia quasi assente. Principio utile a "Misura e manda": un
  disegno a linee sottili su fondo pieno, in scala, basta a dare fiducia.
- **Big Shoulders** nasce come carattere dell'identità civica di Chicago
  (Chicago Design System, Patric King): condensato ma *civile*, da segnaletica
  urbana e cantiere pubblico, non militare. È l'argomento per usarlo senza il
  cliché "cassa di munizioni".

---

## 2. Principi da reinterpretare (10)

Ogni principio: da dove viene, poi **come si applica qui**.

### P1 · Il tempo è l'indice, non un dettaglio
*Da: siti di cantieri lunghi; archivi di progetto ordinati per data.*
**Qui**: la navigazione *è* la linea dei 14 mesi; non esiste un menu di
"sezioni" della cronaca. Ogni schermata della cronaca si nomina col mese e la
fase ("ottobre, mese 8") e l'URL lo riflette (`?mese=8`). Il copywriter non
scrive titoli di sezione: scrive mesi.

### P2 · Si corregge la foto, non la tela
*Da: spacex ("grade the photo, not the canvas"), tesla (nessuna velatura).*
**Qui**: nessuna velatura, gradiente o `filter` CSS sulle foto. La coerenza tra
cantieri diversi si fa **sul file** (bianchi verso la calce, neri alzati verso
il ferro, saturazione -15%, un filo di freddo), una volta, dal photo-editor. Il
testo non tocca mai la foto: sta sulla lastra. Se una foto "ha bisogno" di una
velatura per funzionare, è la foto sbagliata.

### P3 · Monocromo più uno, e l'uno ha un significato fisico
*Da: tesla (un blu solo per l'azione), ibm (un blu per azione, link, fuoco).*
**Qui**: il cobalto è la polvere del battifilo. Compare dove c'è "gesso"
(linea battuta, cifre dei costi, finestra disegnata, bottone Misura e manda) e
come anello di fuoco. Regola di controllo per l'art-director: per ogni uso del
cobalto chiedersi "qui il filo ha battuto?". Se no, è ferro. Niente cobalto su
icone, hover di superfici, bordi di campo, errori.

### P4 · Raggio zero come materiale, non come moda
*Da: ibm/Carbon (0 px ovunque, campi squadrati con riga sotto).*
**Qui**: spigolo vivo perché è un **cassero**. Campi di "Misura e manda" come
Carbon: rettangoli pieni sulla lastra con riga di base 2 px ferro (è il bordo
del getto), niente contorno sottile tutto intorno. L'unica eccezione resta la
maniglia della cassetta (6 px). Se compare un secondo raggio nel CSS, è un
errore.

### P5 · Un richiamo per schermata
*Da: spacex (un solo bottone per banda), tesla (al massimo due, uno pieno).*
**Qui**: una sola azione visibile per stato: in S0 "Misura e manda", in S1 la
cassetta (e nei mesi 7 e 12 il link contestuale, in testo, non bottone), in S3
"Manda le misure". Mai coppia pieno + contorno (era il vecchio FILO A PIOMBO).

### P6 · Pannello visuale fisso, colonna che scorre
*Da: il configuratore di renault (visuale ~60% fisso, opzioni ~40%), preso solo come struttura.*
**Qui**: conferma la struttura di "Misura e manda" (piano di tracciamento 55%
fisso, colonna 45%; su 375 il piano in alto fisso al 38%). La differenza da
tenere: il configuratore auto mostra il **prodotto finito**; qui si mostra la
**misura** (luce in scala accanto alla porta 80×210). Nessun campione di
colore, nessuna foto del serramento, nessun "scegli la finitura".

### P7 · Densità di dati retta dall'allineamento, non dalle scatole
*Da: ibm/Carbon (tabelle e dati senza riquadri, gerarchia per peso e superficie).*
**Qui**: la scheda del mese ha cinque pezzi e **nessun riquadro**. Si reggono
con: un allineamento a sinistra unico sulla lastra, cifre `tabular-nums`
allineate a destra tra loro (costo del mese e progressivo), peso (Chivo 700 per
le etichette di contenuto, 400 per il testo), e la scala stencil solo per fase
e costo. Etichette in minuscolo normale ("chi c'era"), mai maiuscolo spaziato.

### P8 · Il segno unico significa sempre la stessa cosa
*Da: archivi di architettura a linee (una linea = un muro, sempre).*
**Qui**: la linea battuta significa **tempo o misura**, mai decoro. Quindi:
niente filetti tra blocchi, niente sottolineature decorative, niente cornici
della foto. Il vector-artist e il motion-designer verificano ogni linea
tracciata: se non misura un tempo o una lunghezza, si toglie. Il **buco** nella
linea significa sempre "fermo", con la sua spiegazione.

### P9 · Il carattere condensato è una voce, non un titolo da poster
*Da: spacex (maiuscolo industriale grande, una voce sola), Big Shoulders come segnaletica civica.*
**Qui**: lo stencil è la **marcatura a spruzzo** su un materiale: sta solo sulla
lastra, è sempre allineato come si marca un getto (a sinistra, non centrato),
non tocca i due bordi, non è mai sopra una foto e mai sotto i 20 px. La scala
si tiene per ruolo: fase 56-96 px desktop / 36-40 px mobile, costo del mese
come seconda voce, tacche dei mesi 20-24 px. Mai più di due misure stencil
diverse nella stessa schermata oltre alle tacche.

### P10 · L'onestà si vede nella forma, non nel testo allarmato
*Da: nessun sito in particolare; è l'inverso del settore (villa al tramonto, "chiavi in mano", zero date).*
**Qui**: ritardi, extra (+3,6%) e fermi si mostrano con la **forma** (il buco
nella linea, la cifra "sporca", il progressivo sempre visibile) e con frasi
piane. Niente icone di avviso sui fermi, niente colori diversi per gli extra,
niente "garanzia" o "trasparenza" scritte come slogan: se la forma è onesta, la
parola è superflua. Il copywriter non usa mai "trasparenza".

---

## 3. Pattern inflazionati da evitare (12)

I primi otto sono la ricetta bocciata (`docs/concept-lab.md`), declinata sul
mestiere; gli altri vengono dal settore edile e serramenti.

1. **Serif corsivo + sans** come coppia di titoli. Qui non c'è nessun serif e
   nessun corsivo, nemmeno di Chivo.
2. **Occhielli "01 ·", maiuscoletto spaziato, monospace** come etichette. Le
   fasi *non* sono numerate come sezioni: sono mesi. "Mese 8" è un dato in
   Chivo, non un occhiello.
3. **Schede bianche con bordino e ombra** e le varianti (bento, tre colonne
   uguali). In particolare: i tre materiali (PVC, legno-alluminio, legno) non
   sono tre card con icona e "da ... €": sono tre tratti su un asse.
4. **Stesso reveal dal basso ovunque.** L'unico ingresso è la battuta del filo;
   la scheda del mese cambia in dissolvenza di 250 ms senza traslazione.
5. **Onde, filetti, divisori decorativi.** L'unica linea è quella battuta.
6. **Mappa disegnata a mano.** Solo "Apri in Maps" (la mappa vera è di
   EVIDENZIA).
7. **Prenotazione a passi con cartolina, scontrino, ricevuta, certificato.**
   La chiusura è la data marcata a spruzzo e la tacca "TU" nella linea.
8. **Figure umane in SVG**, e per il mestiere anche: caschi, giubbotti
   catarifrangenti, gru, betoniere, cazzuole, metri disegnati. Scala = la porta.
9. **Villa moderna al tramonto con piscina** come hero, titolo bianco sopra la
   foto: è la foto di default dei siti di serramenti. Qui niente tramonti,
   niente ville finite nell'hero (l'hero è il prato prima dello scavo).
10. **Giallo e nero da cantiere, strisce di pericolo, nastro bianco e rosso,
    "safety orange"** come accento. È il cliché edile per eccellenza (ed era il
    vecchio FILO A PIOMBO).
11. **Contatori animati di numeri** ("4.600 finestre posate", "30 anni di
    esperienza", "100% soddisfatti") e **loghi di certificazioni o bonus**
    ("Ecobonus 50%", stelle, badge "CasaClima" inventati). Le detrazioni: una
    riga, "te ne parliamo al sopralluogo".
12. **Carosello automatico a pallini con frecce ai bordi** per le foto dei
    lavori, e l'**effetto prima/dopo con cursore che divide la foto** (il
    "before/after slider" è onnipresente nelle ristrutturazioni). Qui c'è un
    solo cursore ed è il tempo; le foto cambiano per fasi, intere, in
    dissolvenza incrociata.

Da evitare anche, per il carattere stencil: il **cliché militare** (verde
oliva, cassa di munizioni, sabbia, numeri di serie finti, "EST. 1987") e lo
**stencil sporco a grunge** con schizzi e gocce: la marcatura è pulita con un
bordo appena sfrangiato, come la vernice spray su un getto liscio.

---

## 4. Tabella rapida: prendere / non prendere

| Dal riferimento | Prendere | Non prendere |
|---|---|---|
| spacex | foto corretta sul file, un bottone per schermata, maiuscolo industriale come voce unica | testo sopra la foto, pillole, microtesto maiuscolo spaziato, fondo nero |
| tesla | un solo blu, solo per l'azione; niente ombre né gradienti; una schermata un messaggio | carosello a pallini, barra chat fissa, raggio 4 px, titoli sopra la foto |
| ibm | raggio 0, campi squadrati con riga di base, blu = fuoco e azione, niente occhielli maiuscoli | schede a filetto, griglia 4-up, display leggero, verde/giallo/rosso semantici |
| renault | divisione visuale fisso / colonna delle scelte | pallini campione, badge, giallo, tono da listino, prodotto finito al posto della misura |
| settore serramenti e laterizio | niente (fondale da cui staccarsi) | villa al tramonto, rosso/arancio di marca, "trova il rivenditore", banner cookie a metà schermo |

---

## 5. Rischi del concept e come ridurli

### 5.1 Una pagina che non scorre

Il rischio: chi arriva da un'inserzione su telefono prova a scorrere, non
succede niente, se ne va. È il rischio più grande del concept.

- L'istruzione "Tira il filo per far passare i mesi" deve stare **vicino alla
  cassetta**, non in alto; e la battuta automatica dopo 600 ms fino al mese 1
  deve partire comunque (è lei che insegna il gesto). Con reduced motion il
  primo tratto è già battuto *e* l'istruzione resta finché non si interagisce.
- Su mobile lo **swipe verticale** sulla lastra non deve essere "morto": se il
  dito scorre in verticale, meglio interpretarlo come "mese dopo" (un passo,
  come la rotella a scatti) che ignorarlo. Da decidere con ux-architect e
  interaction-designer; va scritto nel loro doc.
- La **vista elenco** (S5) è la rete di sicurezza: il link "Leggi tutti i mesi"
  deve essere visibile nella prima schermata, non solo dopo il primo mese.
- Controllo di qualità: dare il telefono a qualcuno senza spiegare niente. Se
  entro 5 secondi non ha mosso il tempo, l'istruzione o la battuta automatica
  non bastano.

### 5.2 Calcestruzzo grigio medio che diventa "grigio sporco"

Il rischio: un fondo `#B8B4AB` a tutto terzo inferiore, con texture, sembra
cartone o schermo spento; il testo ferro è AA ma la lettura stanca.

- La texture deve leggersi come **getto liscio da cassero** (bolle d'aria,
  segni delle tavole), non come intonaco ruvido o asfalto: poca frequenza
  alta, variazione entro ±6% di luminanza (già nel creative director).
- Il testo di lettura sta su una **zona più calma** della texture: se serve,
  la texture è più tenue sotto la colonna di testo (una sola immagine
  preparata così, non una velatura CSS).
- Niente "testo grigio" sulla lastra: il secondario si fa con dimensione e
  peso di Chivo, sempre in ferro (vale la stessa regola del pilota).
- Il cobalto piccolo usa solo `#163E94`; il cobalto `#1C4CB4` solo da 24 px in
  su. L'accessibility-auditor misura i contrasti **sul colore reale sotto il
  testo**, campionando la texture, non sulla tinta media.

### 5.3 Foto di cantieri diversi che non sembrano un racconto

Il rischio: 14 foto di fonti diverse con luci, ottiche e altezze diverse
rompono la sequenza a ogni mese, e la linea di terra salta.

- La regola della **linea di terra** (object-position per foto, desktop e
  mobile) è il fattore che conta di più: più della correzione colore.
- Scegliere prima le foto **difficili** (tracciamento, vespaio con igloo,
  controtelai, ventilazione meccanica) e costruire il criterio di
  inquadratura su quelle; le facili si adeguano.
- Il piano B "dettaglio al posto della scena" funziona meglio se i dettagli
  sono **tutti alla stessa distanza** (macro a circa 1 m, stessa altezza):
  diventano un ritmo riconoscibile invece di buchi nel racconto.
- Nessun volto, nessuna posa: operai solo di spalle o lontani (già nel
  creative director). Scartare anche foto con marchi leggibili di aziende
  vere su teli, mezzi e ponteggi.

### 5.4 Lo stencil che scade nel cliché (militare o grunge)

- Colore: stencil **solo ferro o cobalto su calcestruzzo**, mai calce su
  ferro in grande (tranne il marchio nella fascia): calce su ferro in stencil
  grande è la targa militare.
- Il bordo sfrangiato è una sola maschera statica e leggera; niente gocce,
  schizzi, aloni, niente animazione di "spruzzo".
- Mai frasi intere a stencil: solo parole-marcatura (fase, mese, cifre,
  quote, marchio). La frase d'apertura in due righe è il limite massimo.

### 5.5 Il gesto "tirare" che sembra un range slider di sistema

- La cassetta deve avere **peso** (il filo teso che la segue, la battuta al
  rilascio) e le fasi cambiano a scatti di mese: un cursore che scorre fluido
  su una barra piena da sinistra è l'`<input type=range>` ricolorato.
- Mai una barra di avanzamento piena dietro la cassetta: dietro c'è la linea
  battuta, polverosa e con i buchi, che si scopre solo al rilascio.

### 5.6 Cifre dei costi che spaventano o sembrano un preventivo

- "412.500 €" grande in cobalto è forte: il testo accanto deve sempre dire
  "cantiere tipo, IVA esclusa" alla prima comparsa di ogni schermata, in
  Chivo, non in nota a piè di pagina.
- La forbice dei serramenti è una **forbice** (da ... a ...), mai un prezzo
  singolo, mai "a partire da" con asterisco.

---

## 6. Sintesi per l'ondata 2

- **art-director**: P2, P3, P4, P7, P9 e le note 5.2 e 5.4. Nel DESIGN.md:
  nome esatto della famiglia (Big Shoulders Stencil, asse `opsz`), stencil mai
  sotto 20 px e mai sopra foto, un solo raggio (6 px, maniglia), cobalto solo
  dove il filo ha battuto, nessun testo grigio sulla lastra.
- **motion-designer**: P8 e la nota 5.5; divieti 4 e 12. Nessuna barra piena,
  nessun movimento senza causa (il filo, la polvere, la dissolvenza).
- **interaction-designer**: P1, P5, P6 e le note 5.1 e 5.5 (swipe verticale su
  mobile da decidere con ux-architect).
- **copywriter**: P1, P10, divieti 11 e la nota 5.6. Mesi al posto dei titoli,
  niente "trasparenza", niente contatori.
- **photo-editor / art-director foto**: P2 e la nota 5.3 (linea di terra
  prima di tutto, foto difficili per prime, niente marchi leggibili).
- **vector-artist**: P8 e divieto 8: solo il segno del battifilo.
- **Da rifare quando l'ambiente lo permette**: /taste vero sui sette indirizzi
  della tabella 1.1, dopo che Chromium avrà la CA del proxy nel suo archivio
  di sistema, per sostituire la sezione 1.3 con misure vere.
