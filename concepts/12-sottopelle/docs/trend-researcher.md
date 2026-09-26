# Trend researcher · Concept 12 · SOTTOPELLE (studio di tatuaggi)

Ondata 1. Input: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, riga e paragrafo 12 di `docs/matrice-concept-11-20.md`,
`concepts/12-sottopelle/docs/creative-director.md` (vincolante),
`.claude/skills/taste/SKILL.md` con i quattro passi in `references/`,
`concepts/10-torchio/docs/trend-researcher.md` (solo come formato).

Scopo: dare all'ondata 2 (art-director, motion-designer, webgl-artist,
interaction-designer, copywriter, vector-artist, photo-editor) **principi da
reinterpretare**, **pattern da evitare** e i **rischi veri** del concept (parete
infinita, inchiostro in WebGL, gotico, foto di guariti, scala 1:1). Nessun codice.

---

## 1. Fonti

### 1.1 /taste su siti reali (fatto davvero, 26/09/2026)

Il Playwright MCP non c'è in questa sessione e il Chromium della sandbox non
si fida della CA del proxy (`ERR_CERT_AUTHORITY_INVALID`). Soluzione usata
(stessa tecnica di `docs/lab-operativo.md` per i font): Chromium di
`/opt/pw-browsers` con `page.route` che serve **ogni** richiesta scaricandola
con `curl` (TLS verificato col CA bundle dell'ambiente). Per ogni sito:
finestra 1440×900, pagina intera o metà+piede, 375×812, `extract.js` della
skill, poi i quattro passi (misura, pattern, gusto, osservatore) e l'autoverifica
anti-slop (0 occorrenze, 2 sezioni, JSON valido).

| Sito | Perché | Esito | File |
|---|---|---|---|
| **drwoo.com** (Dr. Woo, Los Angeles, linea fine) | tatuatore di linea fine famoso che apre con un guarito a tutta finestra | ok, più prova con rotella e menu | `docs/taste/drwoo.com.md` / `.json` |
| **shamrocksocialclub.com** (Mark Mahoney, West Hollywood) | lo studio che usa il **gotico** come firma: il parente più vicino di Grenze Gotisch | ok, più pagina `/artists` | `docs/taste/shamrocksocialclub.com.md` / `.json` |
| **bangbangforever.com** (Bang Bang, New York) | studio con 30+ artisti, fondo `#151515`: il "nero da studio" misurato | ok, più 4 schermate a scorrimento | `docs/taste/bangbangforever.com.md` / `.json` |
| **ottografie.nl** (Otto van den Toorn, fotografo) | **parete libera trascinabile** con foto a distanze irregolari, molto citata | ok dopo 20 s di intro; trascinamento provato | `docs/taste/ottografie.nl.md` / `.json` |

Screenshot (non versionati) in `concepts/12-sottopelle/qa/taste/`.

Scartati e dichiarati:
- `sangbleu.com` (Sang Bleu, Londra): raggiunto, ma oggi è una pagina "Website
  under construction". Nessun dato utile.
- `savedtattoo.com`: raggiunto, ma è un blog di consigli, non uno studio, con
  foto dall'aspetto generato. Fuori tema.
- `cosmos.so`: raggiunto, ma la home è marketing chiaro con pillole; la parete
  infinita sta dietro il login. Tenuto solo come nota, non analizzato.
- `awwwards.com`, `bruno-simon.com`: rifiutati dal proxy (connessione chiusa).

### 1.2 Sistemi da `design-references/awesome-design-md/design-md/` (letti)

| Sistema | Perché serve a SOTTOPELLE | Cosa prendo (principio) | Cosa lascio |
|---|---|---|---|
| **pinterest** | l'unico sistema della libreria in cui una **parete di foto** è il prodotto; un solo rosso riservato al richiamo "Sign up" | la foto è la tessera (nessuna cornice, nessuna etichetta sopra); il rosso vale perché compare su **un'azione sola**; ogni tessera tiene le sue proporzioni vere | raggi 16 px, pillole, fondo crema, fughe di 8 px (foto che si toccano: da noi M/6 = 28 px, la parete respira) |
| **runwayml** | scuro, "le foto SONO l'interfaccia", zero ombre, nessun gradiente nell'interfaccia | l'interfaccia si ritira: niente bordi, niente ombre, niente colore che non venga dalla foto | maiuscolo spaziato per le etichette, carattere unico, grigi freddi (i nostri sono caldi) |
| **spotify** | "content-first darkness": gradini di nero `#121212` / `#181818` / `#1F1F1F`, un solo accento solo funzionale | conferma il **nero rialzato** `#1E1B19` come unico gradino di superficie; accento mai decorativo | pillole, ombre pesanti, bottoni maiuscoli spaziati |

---

## 2. Cosa ho misurato (in breve)

- **Il nero degli studi veri non è nero puro.** Bang Bang: fondo `#151515` sull'85,7%
  della superficie, testo `#A8A8A8` e `#C2C2C2`, titoli `#FFFFFF`. È quasi il
  nostro `#151312` (ma neutro, il nostro è caldo). Shamrock: `#000000` puro
  alternato a `#FFFFFF` (54,6% / 44,4%): l'alternanza chiaro/scuro che qui è
  vietata.
- **Il gotico funziona solo grande e una volta.** Shamrock usa la fraktur solo
  nel nome, a circa 130 px su due righe, sopra una foto; il testo è un serif da
  libro a 17,7 px / 28,4 px. Nessun gotico in maiuscolo, nessun gotico piccolo.
- **Il guarito a tutta finestra è l'apertura più forte del mestiere.** Dr. Woo
  apre con una sola foto di due avambracci con rose in nero e grigio, 100% della
  finestra, nessun titolo, testo solo a 11 px nella barra. Però la foto è
  **scurita e sgranata**: le linee (quello che il cliente vuole giudicare) si
  leggono peggio. E su 375 la foto è tagliata in modo che le rose escano dai
  bordi.
- **La parete libera di Ottografie**: foto di formati misti (0,75:1 e 1,78:1)
  posate con scarti negativi (-68, -41, -15 px) e circa il 55% della finestra
  vuoto; un titolo di categoria a 180 px in mezzo; pillola "View Project" in
  basso; **cursore custom** a cerchio con "+"; **intro** con conteggio e video
  di circa 15-20 s; su 375 mostra solo "(Please rotate your device)".
- **Raggio 0 e zero ombre** in tutti e quattro gli studi (Bang Bang ha
  un'ombra `0 0 75px rgba(0,0,0,.1)` invisibile sul nero). Nessuno usa
  `:focus-visible`, nessuno gestisce `prefers-reduced-motion` (estrattore:
  `focusVisible false`, `reducedMotion false` su tutti).
- **Il mono è la scorciatoia "da studio" più comune**: Bang Bang usa Droid Sans
  Mono 12 px per 943 elementi (tutte le biografie). È la ricetta vietata e si
  vede perché: colonne da 215 px, paragrafi di 8-10 righe, fatica.

---

## 3. Principi da reinterpretare (10)

Ognuno: da dove viene, poi **come si applica qui**. Da tradurre nel materiale
"inchiostro nella pelle", mai da copiare.

### P1 · Il guarito è la prova, e si mostra nitido
*Da: Dr. Woo (guarito a tutta finestra) e il suo difetto (foto scurita e sgranata).*
**Qui**: la prima cosa che si vede sono lavori guariti, subito, intorno
all'isola d'ingresso. Ma dopo lo sboccio la foto è **nitida e a colori veri**:
niente grana sopra, niente vignetta, niente abbassamento di esposizione per
"fare atmosfera". L'atmosfera la fa il nero intorno, non il velo sulla foto. Il
photo-editor corregge solo bilanciamento e ritaglio; il webgl-artist non mette
post-processing sulla foto posata.

### P2 · L'interfaccia si ritira, la foto porta il colore
*Da: runwayml (zero ombre, nessun colore nell'interfaccia), spotify (UI acromatica).*
**Qui**: l'unico colore che non viene dalle foto è il rosso dei due bottoni.
Isole, barra, scheda: nero rialzato, osso, grigi caldi. Nessun bordo sulle
isole (già deciso dal creative director), nessuna ombra, nessuna icona colorata.
Controllo: una schermata qualunque in scala di grigi deve perdere solo il rosso
dei bottoni e i toni della pelle.

### P3 · Un solo gradino di superficie
*Da: spotify (`#121212` → `#181818`), Bang Bang (`#151515` unico fondo).*
**Qui**: `#151312` per la parete, `#1E1B19` per isole, barra, scheda e "Grande
come?". Nessun terzo livello, nessuna trasparenza con sfocatura dietro
(`backdrop-filter`): un gradino solo si legge come "cartello appeso sul muro",
due o tre gradini come "interfaccia a pannelli".

### P4 · Il gotico è un'insegna, non un carattere di testo
*Da: Shamrock (fraktur solo nel nome, a circa 130 px; corpo in serif da libro).*
**Qui**: conferma la regola del creative director (Grenze mai sotto 32 px, mai
maiuscolo) e aggiunge: **una parola gotica grande per isola**, mai due titoli
gotici uno sopra l'altro, mai gotico e foto sovrapposti (Shamrock scrive il nome
sopra il ritratto: da noi l'isola è un fondo pieno, il gotico non tocca mai una
foto). Il salto di scala gotico/Schibsted deve essere netto (titolo isola
almeno 2,5 volte il testo) così i due caratteri non litigano.

### P5 · La foto è la tessera, e ha la sua misura vera
*Da: pinterest (ogni tessera tiene il proprio rapporto, nessuna cornice), Ottografie (formati misti).*
**Qui**: nessuna cornice, nessun bordo, nessuna didascalia sopra la foto. La
dimensione della tessera (1×1, 2×1, 1×2, 2×2, 2×3 moduli) viene dalla misura
vera del tatuaggio: è la differenza tra "griglia di schede" e "muro dello
studio". Ritaglio sul tatuaggio, mai sulla persona.

### P6 · Il vuoto fa sembrare le foto appese
*Da: Ottografie (circa 55% della finestra vuoto, scarti irregolari).*
**Qui**: il 25-30% di vuoto voluto della parete è ciò che la separa da un
masonry di Pinterest (8 px di fuga, foto che si toccano). Lo scarto fisso
±10 px (±6 px su mobile) deve vedersi ma non sembrare disordine: consiglio
all'ux-architect di non mettere mai due tessere allineate sullo stesso bordo per
più di tre moduli di fila.

### P7 · Il rosso vale perché è su un'azione sola
*Da: pinterest (rosso solo sul richiamo d'iscrizione e sull'ancora fissa).*
**Qui**: il rosso vive solo sul fondo di "Grande come?" (barra, ingresso,
scheda) e di "Fissa la consulenza" (pannello). Hover e pressione cambiano il
rosso di tono (più scuro), mai in un altro colore, mai un bagliore. Se qualcuno
propone un rosso per lo stato attivo dei filtri: no, lo stato attivo è osso pieno.

### P8 · Raggio 0 e nessuna ombra: il muro, non l'app
*Da: tutti e quattro gli studi (raggio 0, nessuna ombra percepibile).*
**Qui**: è il linguaggio del mestiere (fotografie stampate appese, cartelli).
L'unica curva è l'inchiostro. Le uniche eccezioni sono gli oggetti misurati di
"Grande come?" (moneta, carta, telefono), perché sono raggi veri e non stile.

### P9 · Orientarsi senza chrome, ma senza giganti
*Da: Ottografie (titolo 180 px al centro per dire "dove sei") e il suo limite (copre le foto, fa da poster).*
**Qui**: ci si orienta con le **isole** (cartelli che si incontrano ogni circa
due schermate), con "Torna all'ingresso" e con la vista elenco. Niente scritta
gigante che segue il trascinamento, niente nome di categoria a tutto schermo,
niente minimappa. Se l'ux-architect sente bisogno di un indicatore di
posizione, meglio un testo piccolo nella barra ("vicino a: Prima di venire")
letto anche dal lettore di schermo.

### P10 · Il movimento ha una causa: il gesto o l'arrivo
*Da: Ottografie (intro di 15-20 s, video che parte da solo al trascinamento) come controesempio.*
**Qui**: nulla si muove da solo tranne la deriva iniziale di 40 px (una volta)
e gli sbocci delle tessere che entrano. Nessuna intro, nessun conteggio, nessun
video automatico, nessuna foto che cambia da sola. La velocità dello sboccio
dipende dal gesto: chi spinge l'acqua, fa correre l'inchiostro.

---

## 4. Pattern inflazionati da evitare (10)

I primi quattro sono la ricetta bocciata (`docs/concept-lab.md`) e LUCIDA; gli
altri sono i luoghi comuni di oggi nei siti di tatuaggio e nelle gallerie
trascinabili, **visti davvero** nei siti analizzati.

1. **La ricetta bocciata intera**: titolo serif corsivo + sans, occhielli "01 ·"
   con maiuscoletto spaziato o monospace, griglia di schede bianche con bordino
   e ombra, fade-up uguale ovunque, filetti e onde, mappa disegnata, prenotazione
   a passi che finisce in cartolina o scontrino, figure umane in SVG.
2. **Lo split di LUCIDA**: fondo crema, titolo con una parola rossa, riga di tre
   numeri tra filetti, foto in cornice a destra con "TAV. I", striscia rossa
   scorrevole in fondo.
3. **Monospace "da studio" per le biografie** (Bang Bang: Droid Sans Mono 12 px
   su 943 elementi). Qui Schibsted 16-17 px, massimo 60 caratteri per riga.
4. **Macchinetta, guanti, sessione in corso come immagine del mestiere**
   (Shamrock, seconda sezione; LUCIDA). Qui solo guariti e, per "Dove", lo studio
   vuoto.
5. **Ritratti degli artisti in bianco e nero, schede identiche ripetute** (Bang
   Bang: 32 moduli uguali "foto + VIEW GALLERY + nome maiuscolo"). Qui nessun
   ritratto: il lavoro è il ritratto.
6. **Flash tradizionali e iconografia da cliché**: rose con teschio e ragno,
   aquile, rondini, pugnali disegnati (Shamrock: rosa con teschio sull'hero,
   aquila nel modulo). Qui nessun disegno nostro.
7. **Foto scurite con grana a tutto schermo per "atmosfera"** (Dr. Woo). Qui
   la foto posata è nitida; il nero è intorno, non sopra.
8. **Ora e città nella barra** ("LOS ANGELES 11:00PM PST", Dr. Woo) e vezzi da
   rivista ("Rx", contatori "(09)" di Ottografie). Qui la barra contiene solo
   comandi.
9. **Cursore custom, pillola che segue, intro con conteggio** (Ottografie:
   cerchio "+", pillola "View Project", intro di 15-20 s). Qui cursore di sistema
   `grab`/`grabbing`, nessun preloader.
10. **Parete trascinabile solo per mouse** ("Please rotate your device" di
    Ottografie a 375 px) e **parete senza alternativa** (nessuna vista elenco,
    tastiera assente). Qui 375 è pensato insieme al desktop e l'elenco è sempre
    a un tocco.

Pattern che **sembra** inflazionato ma qui regge: la parete trascinabile in
sé. È diventata comune nei portfolio dei fotografi, ma quasi sempre è solo
desktop, con zoom e con foto tutte uguali. Regge se: si usa col dito a 375,
non ha zoom, le tessere hanno misure che significano qualcosa, e c'è un elenco
equivalente.

---

## 5. Prendere / non prendere

| Dal riferimento | Prendere | Non prendere |
|---|---|---|
| Dr. Woo | guarito come prima immagine; nessuno slogan | grana e foto scurita; ora nella barra; niente percorso per chi arriva |
| Shamrock | gotico solo come insegna, grande; raggio 0; nessuna ombra | ritratto del titolare; macchinetta e guanti; flash disegnati; alternanza nero/bianco |
| Bang Bang | nero neutro-scuro come muro unico (`#151515`) | mono 12 px; schede uguali; ritratti; maiuscolo spaziato |
| Ottografie | foto appese a distanze irregolari; molto vuoto; trascinamento libero | cursore custom; intro lunga; titolo 180 px sulla parete; niente mobile |
| pinterest | foto = tessera; rosso su un'azione sola | raggi 16 px, fughe 8 px, crema |
| runwayml | interfaccia invisibile, zero ombre e gradienti | maiuscolo spaziato; grigi freddi |
| spotify | un solo gradino di nero rialzato | pillole, ombre pesanti |

---

## 6. Rischi del concept e come stare dalla parte giusta

### 6.1 La goccia d'inchiostro che sembra una "demo WebGL"

Rischio: campo di distanza + rumore frattale è l'esercizio classico; si
riconosce da bordi troppo regolari, colori fuori tema (viola, blu, glow),
effetto che dura troppo o si ripete.
- **Riferimento fisico**: inchiostro di china in acqua fotografato su fondo
  scuro. Il fronte è più denso, dietro ci sono filamenti sottili, non una
  macchia rotonda che si allarga. Il webgl-artist guardi due o tre video veri
  prima di scrivere lo shader e deformi il campo con rumore **anisotropo**
  (allungato nella direzione d'ingresso), non un cerchio che cresce.
- **Mai colore nell'inchiostro**: nero caldo e filamenti in `#6F6962`. Niente
  rosso, niente iridescenza, niente bloom.
- **Monotono e finito**: dal nero alla foto una volta, poi fermo. Nessun
  "respiro" continuo sulla foto posata.
- **Controllo di qualità**: screenshot a metà sboccio. Deve sembrare un
  fotogramma di inchiostro vero su una foto; se sembra un tutorial di shader
  (bordi a onda regolare, gradiente arcobaleno), togliere frequenze al rumore e
  contrasto al fronte.

### 6.2 La parete che disorienta o pesa troppo

- **Orientamento**: isole ogni circa due schermate, "Torna all'ingresso"
  sempre visibile, elenco sempre a un tocco (P9). La deriva iniziale di 40 px è
  l'unico suggerimento del gesto.
- **Ripetizione visibile**: il rimescolamento per periodo è giusto; in più, la
  stessa foto non deve comparire due volte nella stessa finestra (a 2560 px si
  vedono più di 15 moduli di larghezza: controllare).
- **Mobile**: il trascinamento col dito deve battere lo scroll della pagina
  (`touch-action: none` solo sul canvas) e il ConceptBackButton in basso a
  sinistra non deve stare sopra le tessere toccabili. La parete a 375 deve
  mostrare 5-7 foto intere: se sembra una colonna, il modulo è sbagliato.
- **Peso**: miniature 640 px webp, massimo 40 texture, render su richiesta.
  Nessun video, nessuna intro: è la differenza principale rispetto a
  Ottografie.

### 6.3 Il gotico che scivola nel cliché da tatuaggio

Rischio: fraktur + nero + rosso = poster da negozio di magliette, "old school",
metal. Quello che lo tiene lontano:
- **Minuscolo e un solo peso animato**: *Sottopelle* in minuscolo con iniziale,
  peso 500-650 a riposo; niente maiuscolo, niente contorno, niente ombra,
  niente effetto "inciso".
- **Il gotico non tocca le foto** (P4) e non convive con iconografia (niente
  rose, pugnali, cornici).
- **Il resto è giornale**: Schibsted pulito per regole, prezzi, centimetri.
  È il contrasto tra insegna storica e cartello chiaro a fare il tono "studio
  serio di provincia", non il gotico da solo.
- **Controllo di qualità**: coprire le foto. Se quello che resta sembra la
  copertina di un disco metal, ridurre il gotico (una parola per isola) e dare
  più spazio al grotesk.

### 6.4 Foto di tatuaggi guariti: poche e dubbie

Quasi tutte le foto libere di tatuaggi sono **appena fatti** (lucidi, arrossati,
pellicola) o in sessione. Dr. Woo mostra che un guarito ben fotografato vale più
di dieci foto mediocri. Per il photo-editor:
- segnali di guarito: pelle opaca con texture normale, peli ricresciuti, neri
  leggermente morbidi, nessun alone rosso intorno alle linee;
- scartare senza pietà: meglio il piano B del creative director (periodo
  12 × 9, 12 foto giuste) che 24 dubbie;
- uniformare **solo** bilanciamento del bianco e ritaglio; niente filtro comune
  (è l'errore della grana di Dr. Woo).

### 6.5 La scala 1:1 di "Grande come?"

Nessuno dei siti analizzati prova a far capire la misura: è il vuoto che
SOTTOPELLE riempie. Rischi: la taratura vissuta come ostacolo, e misure sbagliate
presentate come vere.
- Taratura **saltabile subito**, e il sito resta utile con la stima 96 px/pollice
  e la scritta "misure approssimate".
- Oggetti disegnati come contorno osso misurato, mai come illustrazione (niente
  riflessi sul telefono, niente logo sulla carta, niente faccia della moneta).
- A 375 telefono e cartolina escono dal bordo col tratteggio: è un'informazione,
  va scritto bene, non nascosto.

### 6.6 Accessibilità, dove gli studi veri falliscono tutti

Nessuno dei quattro siti ha `:focus-visible` o rispetta la riduzione del
movimento; Ottografie esclude il telefono in verticale. Qui è il punto facile
per distinguersi: skip-link "Vai all'elenco", tessere come bottoni con testo
alternativo descrittivo, anello osso 2 px, reduced motion con parete completa e
ferma.

---

## 7. Sintesi per l'ondata 2

- **art-director**: P2, P3, P4, P7, P8, rischio 6.3. Nel DESIGN.md: un solo
  gradino di superficie, gotico mai su foto e una parola per isola, rosso solo
  sul fondo dei due bottoni (anche negli stati), nessuna grana o velo sulle foto.
- **webgl-artist**: P1, P10, rischio 6.1 (rumore anisotropo nella direzione
  d'ingresso, nessun colore nell'inchiostro, nessun post-processing sulla foto
  posata) e 6.2 (peso).
- **motion-designer**: P10, divieti 7, 9. Nessuna intro, niente "respiro".
- **interaction-designer**: P9, divieti 9 e 10, rischio 6.2 (mobile) e 6.6.
- **copywriter**: divieti 3, 8; tono da cartello chiaro accanto all'insegna
  gotica (6.3).
- **photo-editor**: P1, P5, rischio 6.4.
- **vector-artist**: divieto 6 e rischio 6.5 (oggetti misurati, non illustrati).
