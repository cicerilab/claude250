# Creative director · Concept 12 · Studio di tatuaggi (Pordenone)

Ondata 0. Rotta `/concept-12`. Nome: **SOTTOPELLE**. Documento di direzione per
tutti gli agent delle ondate successive: quello che sta sotto "Direzione scelta"
(sezioni 3 e 4) è vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 12, paragrafo 12,
verifica incrociata, regole comuni), `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 0, 1, 4, 9), `concepts/10-torchio/docs/creative-director.md` (solo come
formato e livello), screenshot `docs/concept-attuali/concept-12.jpg` (il bocciato
LUCIDA).

---

## 0. Da dove parto

**Il bocciato LUCIDA** (screenshot): fondo crema, titolo grottesco nero con una
parola in rosso, riga di tre numeri tra filetti ("in lista adesso 14"), due
bottoni pieno + contorno, foto a destra in cornice con didascalia "TAV. I" e
**macchinetta in primo piano con guanti neri**, striscia rossa scorrevole in
fondo ("NIENTE COPIE · AGHI MONOUSO"), monospace spaziato ovunque, manichino e
"quaderno dei disegni". Tutto questo è vietato qui, uno per uno (vedi 4.8).

**Cosa assegna la matrice** (e che rispetto): parete infinita da trascinare in
ogni direzione, fatta di tatuaggi guariti; ogni lavoro arriva come goccia
d'inchiostro che si apre nell'acqua e si ferma; increspatura lenta al passaggio;
vista elenco sempre disponibile; WebGL 2D con shader di diffusione + foto vere;
prenotazione "Grande come?" con oggetti veri in scala 1:1. Palette nero `#151312`,
osso `#ECE5D8`, rosso `#A92F28`, grigio sfumato `#6F6962`. Font Grenze Gotisch +
Schibsted Grotesk.

**Vicini da cui restare lontano** (dalla verifica incrociata):
- 13 CONTROPELO: scuro, rivela immagini col gesto. Qui niente maschera che torna,
  niente schermo unico: le immagini sbocciano da sole e restano.
- 19 NODI: accento rosso. Qui il rosso vive **solo sui bottoni**, mai su cifre o
  testo.
- 4 STUDIO FORMA: nero + rosso. Qui niente bianco dominante, niente svizzero:
  nero dominante, gotico, pieno di foto.
- 7 CONTROLUCE: galleria scura. Qui niente sequenza lineare in bianco e nero: una
  parete in due dimensioni, a colori veri della pelle.
- 16 EVIDENZIA: "si ingrandisce e si sposta". Qui **niente zoom**: solo
  spostamento, la scala è sempre quella.
- 10 IMPRONTA: prova fissa in alto e scelte sotto su mobile. La prenotazione qui
  non ha quella struttura (è una frase da completare, vedi 4.5).

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina-portfolio di uno studio di tatuaggi
su appuntamento per persone di 18-45 anni che stanno scegliendo a chi affidare la
pelle (spesso al primo tatuaggio), with a notturno, materico e tattile language
dove l'inchiostro è l'unico effetto, leaning toward una parete fotografica
trascinabile in WebGL 2D (shader di diffusione) + gotico variabile per la voce +
grotesk pulito per le regole, DOM vero sopra il canvas.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **9** | La struttura non è una pagina: è una superficie senza bordi. Non 10: le regole (età, caparra, igiene) devono restare leggibili come in un cartello ben fatto. |
| `MOTION_INTENSITY` | **6** | Il movimento è uno solo, l'inchiostro: sboccia, si posa, si ferma. Più l'inerzia della parete. Niente coreografia continua, niente parallasse. |
| `VISUAL_DENSITY` | **5** | Un portfolio vive di quantità (chi cerca un tatuatore vuole tanti lavori), ma ogni foto ha aria intorno: il 25-30% della parete è vuoto voluto. |

---

## 2. La metafora sviluppata

**L'inchiostro che entra nella pelle e si posa.** Chi si tatua sa due cose che
chi non si tatua non sa:

1. Il tatuaggio appena fatto non è il tatuaggio. È gonfio, lucido, rosso,
   coperto di pellicola. Il tatuaggio vero è quello **guarito**, dopo settimane:
   l'inchiostro si è posato nel derma, le linee si sono ammorbidite di un filo, il
   nero è diventato il suo nero. Un tatuatore serio si giudica dai guariti.
2. La domanda che tutti fanno per prima è **"quanto grande?"**, e nessuno sa
   rispondere in centimetri.

Il sito tiene insieme le due cose con un solo materiale, l'inchiostro in acqua
(il derma è acqua per il 70%):

- **La parete** è il muro dello studio, senza bordi: foto di lavori guariti,
  appese a distanze irregolari, da esplorare trascinando.
- **Ogni lavoro arriva come goccia**: entra nello schermo come una nuvola
  d'inchiostro che si apre (filamenti, fronte più scuro, bordo sfumato) e si
  ferma nella foto nitida. La velocità dell'apertura dipende dal gesto: acqua
  agitata, inchiostro veloce.
- **Una volta posato, resta**: un lavoro già visto non sboccia più per tutta la
  visita, nemmeno se lo ritrovi in un altro punto della parete. È permanente,
  come l'inchiostro vero. È anche una regola onesta: la magia si vede solo sulle
  cose nuove.
- **Al passaggio**, la foto già posata si increspa appena, come acqua ferma
  toccata: lenta, piccola, poi niente.
- **La misura** si decide confrontando la macchia d'inchiostro del tuo tatuaggio
  con oggetti veri appoggiati sullo schermo in scala 1:1.
- **Il successo della prenotazione** è un posto vuoto sulla parete, con le
  proporzioni esatte del tuo tatuaggio, che aspetta il tuo lavoro guarito.

**Perché il gotico**: Grenze Gotisch è una fraktur ibrida, variabile (peso
100-900), leggibile a taglia grande. È la voce storica del mestiere (lettering,
scritte sulla pelle) senza il "flash" americano delle rondini e dei pugnali, e il
suo asse di peso diventa quantità d'inchiostro: una parola che sboccia passa dal
peso sottile al peso pieno. **Schibsted Grotesk** (nato per un giornale, molto
pulito) porta le regole, i prezzi, i centimetri: dove serve fiducia, niente
calligrafia.

---

## 3. Tre varianti di esecuzione della stessa direzione, e la scelta

Direzione fissa (parete di guariti + inchiostro che sboccia + "Grande come?").
Cambia il modo di costruire la superficie.

### Variante A · PARETE CONTINUA (scelta)

- Superficie piana senza bordi, periodica (toro): quando arrivi alla fine
  ricomincia, ma ogni ripetizione del periodo **rimescola l'ordine delle foto**
  con un seme diverso, così la ripetizione non si nota.
- Griglia a moduli sciolta: le foto occupano 1×1, 2×1, 1×2, 2×2 o 2×3 moduli
  **in base alla misura vera del tatuaggio** (piccolo, medio, grande), con uno
  scarto casuale fisso di pochi pixel per non sembrare una griglia di schede.
- I contenuti testuali (regole, prezzi, artisti, dove) sono **isole** dentro la
  parete, come i cartelli appesi nello studio.
- Solo spostamento (trascinamento, rotella/trackpad, frecce), mai zoom.
- Pro: il gesto è immediato con un dito o un mouse; la scala costante tiene vivo
  il tema "quanto grande"; costruibile con un pool di quad WebGL riciclati.
- Rischi: orientarsi. Si risolve con la vista elenco, con il ritorno all'origine
  ("Torna all'ingresso") e con i filtri che fanno arretrare i lavori non scelti.

### Variante B · POZZA

- I lavori sono disposti a spirale attorno a un centro, come una goccia caduta in
  una bacinella vista dall'alto; trascinare fa ruotare e allontanare dal centro.
- Pro: metafora dell'acqua letterale, apertura forte.
- Scartata: la navigazione radiale è la struttura di 15 NOVANTA (quadrante);
  su 375 px la spirale spreca gli angoli dello schermo; la rotazione rende le foto
  storte o costringe a contro-ruotarle; l'orientamento è peggiore di A.

### Variante C · PARETE A PROFONDITÀ

- Parete con zoom semantico: da lontano i lavori sono puntini d'inchiostro,
  avvicinandoti sbocciano in foto.
- Pro: dà la sensazione di "tanti lavori" in un colpo d'occhio.
- Scartata: "si ingrandisce e si sposta" è la meccanica di 16 EVIDENZIA; il
  pizzico su mobile litiga con lo zoom del browser; lo zoom rompe la scala
  costante che serve a "Grande come?"; costo di texture a più risoluzioni troppo
  alto per la parete.

### Perché A

1. È la sola in cui il visitatore fa quello che fa nello studio vero: gira lo
   sguardo lungo il muro, si ferma su un lavoro, lo guarda da vicino.
2. La scala fissa collega la parete alla prenotazione: la misura della foto
   sulla parete racconta già la misura del tatuaggio, e "Grande come?" chiude il
   discorso con gli oggetti veri.
3. È la più distante dagli altri 19: nessuno ha una superficie libera in due
   dimensioni senza zoom.
4. È la più costruibile bene in un giorno di agent: un canvas, un pool di quad,
   uno shader con due effetti (sboccio, increspatura), DOM vero sopra.

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo (base per art-director e webgl-artist)

**Palette** (tema unico scuro, bloccato su tutto il sito, prenotazione compresa)

| Nome | Hex | Uso | Contrasto su nero |
|---|---|---|---|
| Nero | `#151312` | fondo di tutto, nuvola d'inchiostro | - |
| Nero rialzato | `#1E1B19` | fondo di pannelli, schede, prenotazione (raffinamento: stesso nero, un gradino sopra) | - |
| Osso | `#ECE5D8` | testo principale, contorni, anello di focus, oggetti in scala | 14,8:1 |
| Grigio lettura | `#A39C93` | testo secondario piccolo (didascalie, aiuti). Raffinamento necessario: il grigio della matrice non regge il testo piccolo | 6,8:1 |
| Grigio sfumato | `#6F6962` | solo testo ≥ 24 px, filamenti dell'inchiostro, area della macchia, lavori "arretrati" dai filtri | 3,4:1 (solo grande) |
| Rosso | `#A92F28` | **solo fondo dei bottoni d'azione** ("Grande come?", "Fissa la consulenza"). Testo del bottone in osso: 5,4:1 | 2,8:1 (mai testo rosso) |

- Il rosso non compare mai su testo, cifre, filtri, link, icone, nuvola
  d'inchiostro o foto. Due bottoni in tutto il sito, stesso rosso.
- Niente nero puro, niente bianco puro, niente sfumature colorate, niente glow.
- L'inchiostro dello shader è nero caldo con i filamenti in grigio sfumato: non
  è mai rosso, mai blu, mai viola.

**Tipografia**
- *Grenze Gotisch* (variabile 100-900) solo da 32 px in su: nome, titoli delle
  isole, parola d'apertura, la cifra grande della stima. **Mai in maiuscolo**
  (la fraktur in maiuscolo non si legge), mai per prezzi, orari, centimetri,
  regole, bottoni, campi. Pesi a riposo 500-650; l'asse peso si anima solo
  quando una parola sboccia (da 100 a 600).
- *Schibsted Grotesk* 400/500/700 per tutto il resto: testo 16-17 px,
  interlinea 1,5, massimo 60 caratteri per riga; cifre `tabular-nums` per cm,
  euro, orari. Niente monospace, niente maiuscoletto spaziato come etichetta.
- Enfasi dentro un testo: grassetto di Schibsted, mai una parola gotica in mezzo
  a una frase in grotesk.

**Forme**: tutto spigolo vivo (raggio 0): foto, isole, bottoni, campi, schede,
come fotografie stampate appese al muro. Regola documentata: l'unica cosa
organica è l'inchiostro (bordo della nuvola, bordo morbido interno della
macchia della misura). Gli oggetti di confronto hanno i loro raggi reali (la
carta ha 3,18 mm, il telefono circa 9 mm, la moneta è un cerchio) perché sono
oggetti misurati, non stile.

**Griglia della parete**: modulo `M` = 168 px sopra 1024 px, 136 px tra 640 e
1024, 112 px sotto 640. Spazio tra le foto M/6. Periodo della parete 16 × 12
moduli. Ogni tessera ha uno scarto fisso pseudo-casuale di ±10 px (±6 px su
mobile), deciso da un seme, uguale a ogni visita.

**Fallback senza WebGL**: le stesse tessere in DOM (`<img>`), lo sboccio fatto
con una `mask-image` radiale che si allarga (bordo morbido, 700 ms), niente
increspatura. Deve essere già bello da solo.

### 4.2 Struttura vera: schermate e contenuti

Il sito **non scorre**: è una finestra fissa (100dvh) sulla parete, con tre
strati sopra. Nessuna sezione numerata.

**Strato 0 · la parete** (canvas WebGL + tessere DOM trasparenti sopra per
focus, clic e lettori di schermo). Contiene, in ogni periodo:
- circa 28-30 posizioni per lavori guariti (almeno 18 foto diverse, obiettivo 24,
  rimescolate tra un periodo e l'altro);
- 7 isole di testo, sempre uguali, in DOM (mai testo nel canvas):

1. **Ingresso** (all'origine, 4 × 3 moduli, centro dello schermo alla prima
   apertura). La parola *Sottopelle* in Grenze Gotisch molto grande (h1), una
   frase sotto (max 20 parole, es. "Tatuaggi su appuntamento a Pordenone. Sulla
   parete solo lavori guariti: trascinala e guardali come stanno dopo mesi."),
   un solo bottone rosso **"Grande come?"**. Niente numeri, niente orari, niente
   secondo bottone. Intorno all'isola le foto sbocciano: la prima schermata è
   la parete, non uno split testo/foto.
2. **Solo guariti** (3 × 2): perché si mostrano i lavori dopo 2-24 mesi e
   non il giorno dopo; cosa guardare in un guarito (linee pulite, neri pieni,
   niente sbavature). Tre righe.
3. **Chi tatua** (4 × 2): due tatuatori, solo nome in gotico e cosa fanno
   (esempio per il copywriter: *Nives*, linea fine, botanico, lettering; *Tobia*,
   blackwork, ornamentale, nero e grigio), i giorni in studio, e un comando
   "Solo i suoi" che attiva il filtro artista. **Nessun ritratto, nessuna
   silhouette**: i loro lavori sono il ritratto.
4. **Prima di venire** (3 × 3): le regole. 18 anni compiuti e documento; la
   consulenza di 20 minuti è gratuita; la caparra di esempio (es. 50 €, scalata
   dal prezzo, resa se disdici almeno 48 ore prima); materiale monouso e
   sterilizzazione (detto semplice, senza certificati o numeri inventati); cosa
   non facciamo (copie del lavoro di altri tatuatori, tatuaggi a chi ha bevuto).
5. **Quanto costa** (3 × 2): minimo di esempio (es. 80 €), tariffa oraria di
   esempio (es. 110 € l'ora), "la stima per il tuo la fa Grande come?" con il
   solo collegamento testuale (non un secondo bottone rosso).
6. **La cura** (3 × 2): le prime tre settimane in cinque righe (lavare, crema
   sottile, niente sole, niente mare e piscina, non grattare). Più il "ritocco
   gratuito entro 3 mesi" di esempio.
7. **Dove** (3 × 2): indirizzo di esempio a Pordenone, orari di esempio
   (es. martedì-sabato 10-19), telefono di esempio, link "Apri in Maps" alla
   mappa vera. Niente mappa disegnata. In piccolo, sotto: colophon (font, foto
   Unsplash con autori, "Un concept di CiceriLab").

Le isole hanno fondo nero rialzato `#1E1B19` (nessun bordo, nessuna ombra),
titolo in gotico, testo in Schibsted. Composizione: isole distanti tra loro almeno
3 moduli, in modo che trascinando in qualunque direzione per circa due schermate
se ne incontri una.

**Strato 1 · comandi fissi** (DOM)
- Desktop: in alto a sinistra il `ConceptBackButton` condiviso; in alto a destra
  il nome *Sottopelle* in gotico piccolo (porta all'ingresso) e il bottone rosso
  "Grande come?". In basso al centro la **barra della parete**, testo su nero
  rialzato: `Parete | Elenco` (interruttore), i filtri per stile (linea fine,
  blackwork, lettering, ornamentale, nero e grigio), i filtri per misura
  (piccoli, medi, grandi), il filtro artista, e "Torna all'ingresso".
- Sotto 640 px: `ConceptBackButton` in basso a sinistra (regola del sito);
  la barra sta in basso da 72 px a sinistra fino a 16 px a destra e contiene
  solo `Elenco`, `Filtri` (apre un foglio dal basso) e il bottone rosso. In
  alto: il nome a sinistra, "Torna all'ingresso" come icona a destra.
- Filtri sulla parete: non spostano niente. I lavori esclusi **arretrano**
  (scuriti al 25%, desaturati, fermi, non cliccabili dal puntatore ma raggiungibili
  in elenco); quelli scelti restano pieni. È l'inchiostro che si ritira.

**Strato 2 · la scheda del lavoro** (dialogo modale). Si apre toccando una foto
(un tocco senza trascinamento: soglia 6 px). La foto si allarga dalla sua
posizione (FLIP, 420 ms) fino a 80% dell'altezza; accanto (sotto, su mobile) i
dati in Schibsted: stile, zona del corpo, misura in cm, sedute, guarito da
quanti mesi, chi l'ha fatto. Frecce avanti/indietro (anche ← →), Esc chiude.
Un bottone rosso "Grande come?" che apre la prenotazione **già compilata** con
stile, zona e misura di quel lavoro ("una cosa così").

**Strato 3 · Grande come?** (vedi 4.5). Pannello a tutto schermo su nero
rialzato, stesso tema.

**Vista elenco** (interruttore `Elenco`, e skip-link "Vai all'elenco" come primo
elemento focalizzabile): una pagina normale che scorre, in DOM, per chi non
vuole esplorare e per tastiera e lettori di schermo. Le 7 isole diventano
sezioni (h2), i lavori un elenco in due colonne (una sotto 640 px) con foto e
didascalia sotto la foto (mai sovrapposta). Qui i filtri filtrano davvero. Lo
sboccio non c'è: le foto sono già posate. Si torna alla parete con lo stesso
interruttore e la parete riprende dal punto lasciato.

### 4.3 Interazione firma: "La goccia" (sboccio) + "L'increspatura"

**Muovere la parete**
- Trascinamento 1:1 con puntatore o dito; al rilascio inerzia con attrito
  (velocità massima 2400 px/s, si ferma in circa 0,9 s). Cursore `grab` /
  `grabbing` di sistema: **nessun cursore custom**.
- Rotella e trackpad spostano (deltaX / deltaY), non zoomano.
- Tastiera: frecce spostano di un modulo con scivolata di 280 ms; Maiusc+frecce
  di quattro moduli; Tab passa da un lavoro all'altro in ordine di lettura del
  periodo e la parete porta il lavoro a fuoco dentro lo schermo; Invio apre la
  scheda.
- All'apertura del sito la parete fa **una sola** deriva lenta di 40 px che si
  ferma: dice "sono mobile" senza scritte. Nessun "Scorri", nessuna icona del
  mouse.

**La goccia (lo sboccio)**
- Ogni tessera nuova che entra nello schermo parte coperta dal nero. Dal punto
  d'ingresso (il lato da cui arriva, spostato verso il puntatore) si apre una
  nuvola d'inchiostro: un campo di distanza deformato da rumore frattale lento,
  con un fronte leggermente più scuro e filamenti in grigio sfumato che
  anticipano il fronte. Dietro il fronte la foto compare prima morbida (sfocata e
  poco satura), poi si posa: nitida, colori veri.
- Durata legata al gesto: da 1100 ms (parete ferma o lenta) a 450 ms (gesto
  veloce), con una curva che frena alla fine. Mai più veloce di 450 ms.
- Onde: all'apertura le tessere intorno all'ingresso sbocciano ad anelli per
  distanza (60 ms tra un anello e l'altro), finito tutto entro 1,9 s.
- La parola *Sottopelle* sboccia per prima: il suo peso va da 100 a 600 mentre
  una nuvola d'inchiostro dietro di lei si apre e si ferma (900 ms). Frase e
  bottone compaiono in dissolvenza di 300 ms, fermi, senza salire dal basso.
- **Una volta posato, resta**: la memoria è per foto (non per posizione) e dura
  tutta la visita (sessione). Una foto già vista che rientra è già posata.
- Luminosità sempre monotona: dal nero alla foto, mai avanti e indietro. Nessun
  lampo.

**L'increspatura**
- Desktop: passando col puntatore su una foto posata parte un anello di
  rifrazione dal punto del puntatore, spostamento massimo 0,6% della tessera,
  si allarga in 1,4 s e si spegne in 1,6 s. Al massimo un'increspatura per
  tessera ogni 600 ms. Nessuna variazione di luminosità oltre il 3%.
- Touch: l'increspatura parte dal punto dove il dito si stacca, sulla tessera
  sotto il dito, alla fine di un trascinamento o di un tocco.
- Mai increspature da sole, mai in loop.

**Reduced motion** (`prefers-reduced-motion: reduce`)
- Nessuno sboccio: le foto sono già posate (dissolvenza di 150 ms solo al primo
  caricamento dell'immagine). Nessuna increspatura, nessuna deriva iniziale,
  nessuna inerzia (la parete si ferma al rilascio), frecce e Tab spostano senza
  scivolata. *Sottopelle* statico al peso 600. La scheda si apre in dissolvenza,
  senza FLIP. Il sito resta completo.

### 4.4 Uso di WebGL, SVG e 3D

- **WebGL 2D** con three 0.160, un solo canvas fisso a tutto schermo, camera
  ortografica, un **pool di circa 40 quad riciclati** (le tessere visibili più un
  bordo di un modulo). Un solo `ShaderMaterial` con uniform per tessera: texture,
  avanzamento sboccio, punto d'ingresso, seme del rumore, punto e tempo
  dell'increspatura, livello di arretramento del filtro. R3F non è necessario;
  se il tech-architect lo preferisce va bene, ma senza drei superflui.
- **Niente simulazione di fluidi vera**: la nuvola è un campo di distanza +
  rumore frattale animato nel tempo di sboccio. Costo per pixel basso, gira su
  mobile.
- Texture: miniature 640 px (webp) per la parete, 1600 px solo nella scheda;
  caricamento per vicinanza allo schermo; al massimo 40 texture in memoria (le
  più lontane si liberano). DPR massimo 1,75 su mobile, 2 su desktop.
- Rendering su richiesta: si disegna solo quando la parete si muove o c'è uno
  sboccio o un'increspatura in corso; pausa quando la scheda del browser non è
  visibile.
- **SVG**: solo le icone della barra (una libreria, es. Phosphor) e gli oggetti
  di confronto di "Grande come?" (cerchio, rettangoli con i raggi veri: forme
  geometriche misurate, non illustrazioni).
- **3D**: nessuno. Niente pelle 3D, niente braccio, niente macchinetta.
- Senza WebGL: fallback DOM descritto in 4.1.

### 4.5 Meccanica unica di prenotazione: "Grande come?"

Idea: la domanda che tutti fanno al tatuatore diventa l'interfaccia. Non è un
modulo a passi: è **un banco di misura** con gli oggetti veri in scala 1:1 e una
**frase da completare**. Il risultato è una stima onesta in sedute e un posto per
la consulenza gratuita di 20 minuti.

**Taratura (una volta sola)**
- Lo schermo non conosce i centimetri. Alla prima apertura: "Appoggia una carta
  (bancomat, tessera sanitaria) sullo schermo e allarga il rettangolo finché
  combacia." Un rettangolo con le proporzioni della carta ISO (85,60 × 53,98 mm)
  si allarga col trascinamento o con due bottoni − / +. Da lì px per mm.
- "Salta" è sempre visibile: si usa una stima (96 px per pollice CSS) e accanto
  alle misure resta scritto "misure approssimate · tara lo schermo".
- La taratura si salva in `localStorage` (con try/catch) e si rifà da un link.

**Il banco**
- Fondo nero rialzato. A sinistra (in alto su mobile) l'**oggetto di confronto**
  a grandezza vera, disegnato in osso a contorno sottile con una campitura
  appena percettibile: moneta da 1 € (Ø 23,25 mm), carta (85,60 × 53,98 mm),
  telefono (circa 71 × 147 mm, "un telefono medio"), cartolina aperta
  (210 × 148 mm, con la piega a metà). Si cambia oggetto con quattro comandi
  testuali.
- Accanto, la **macchia**: l'area del tuo tatuaggio, un rettangolo di contorno
  osso con dentro l'inchiostro fermo (grigio sfumato, bordo interno morbido
  fatto dallo stesso shader o da un gradiente in CSS). Si ridimensiona dalla
  maniglia d'angolo (area di presa 44 px) o con due campi numerici con − / +
  (larghezza e altezza in cm, passo 0,5 cm, da 1 a 40 cm). Le misure sono scritte
  in Schibsted accanto ai lati.
- Se l'oggetto o la macchia sono più grandi dello schermo, escono dal bordo con
  il contorno che continua tratteggiato e la scritta "esce dallo schermo: è più
  grande del tuo telefono". Onesto e utile.
- "Non lo so ancora" azzera la misura e rimanda la decisione alla consulenza.

**La frase da completare** (sotto il banco, Schibsted 24-28 px desktop, 19-20
px mobile). Ogni parte tra parentesi è un comando che apre una piccola scelta
sul posto:

> Grande **[6 × 4 cm]**, sul **[polso]**, in **[linea fine]**, ed è il mio
> **[primo]** tatuaggio. L'idea: **[scrivi due parole]**.

- Zone: parole, non corpi (polso, avambraccio, braccio, spalla, scapola,
  schiena, costole, fianco, coscia, polpaccio, caviglia, mano, collo). **Nessuna
  sagoma del corpo.**
- Stili: gli stessi dei filtri della parete.
- Primo / non il primo (cambia la durata massima di seduta: 3 h al primo, 4 h
  dopo).
- L'idea: un campo di testo breve, facoltativo, con etichetta sopra.
- Se si arriva dalla scheda di un lavoro, la frase è già completata con i suoi
  dati e la macchia ha la sua misura.

**La stima** (compare come continuazione della frase, appena misura e zona ci
sono):

> Circa **2 ore**, **una seduta**. Da **200** a **260 €**, caparra 50 €.

- Calcolo di esempio (lo definiscono ux-architect e copywriter, dichiarato come
  esempio): area in cm² × fattore stile × fattore zona → ore; ore divise per la
  durata massima di seduta → sedute, a 4 settimane l'una dall'altra; prezzo =
  ore × tariffa di esempio, con il minimo. La cifra delle ore è l'unico numero in
  Grenze Gotisch, grande; tutto il resto in Schibsted.
- Sotto, sempre: "È una stima: il prezzo vero lo diciamo in consulenza, guardando
  la pelle."

**Il posto** (si apre sotto la stima, senza numeri di passo)
- I prossimi 10 giorni di apertura in una riga orizzontale scorrevole; toccato un
  giorno, gli orari della consulenza da 20 minuti (es. 15:00-18:40) come righe
  di testo. Il posto scelto si riempie d'inchiostro (sboccio di 450 ms, in
  reduced motion subito pieno).
- Contatto: nome, telefono o email (etichetta sopra, errore sotto, niente
  segnaposto come etichetta), casella "Ho 18 anni compiuti".
- Bottone rosso **"Fissa la consulenza"**.

**Stati**
- **Vuoto**: mai bianco. All'apertura la macchia ha già una misura d'esempio
  (5 × 5 cm) accanto alla carta; la frase mostra i campi vuoti come comandi
  sottolineati ("[che misura?]", "[dove?]"); la stima dice "Scegli la zona e
  ti diciamo quante sedute." Nessun orario scelto: il bottone è attivo ma spiega
  cosa manca se premuto.
- **Errore**: sotto il campo o sotto la parte della frase interessata, in
  osso con un'icona (non in rosso, il rosso è solo dei bottoni): contatto non
  valido; nessun orario scelto ("Scegli un orario per la consulenza");
  casella dei 18 anni non spuntata ("Tatuiamo solo maggiorenni: se hai meno di 18
  anni, scrivici con un genitore"). Misura fuori dai limiti: la macchia si
  ferma al limite e lo dice. **Invio fallito**: la macchia non si posa, resta
  morbida, e il messaggio dice di riprovare o chiamare il numero di esempio.
- **Invio in corso**: il bottone resta premuto con la scritta "Sto fissando…",
  niente spinner.
- **Successo**: **nessuna cartolina, ricevuta, scontrino, biglietto o
  certificato.** La macchia si posa (l'inchiostro diventa nitido e si ferma
  accanto all'oggetto, 900 ms) e la frase diventa definitiva: "Ci vediamo
  giovedì 8 ottobre alle 17:20, in via … a Pordenone, per 20 minuti. Porta
  un'idea, anche una foto: la misura l'abbiamo già." Un link "Aggiungi al
  calendario" (file .ics). Chiudendo, la parete si riapre all'ingresso e accanto
  all'isola c'è **un posto vuoto nuovo**, con le proporzioni esatte della tua
  macchia, contorno osso e scritta "Il tuo, quando sarà guarito". Resta per
  la visita (sessione).
- Analytics: `track("demo_prenotazione")` solo al successo; `track("apri_concept")`
  come da integrazione. Nient'altro.

### 4.6 Foto: soggetti, verifica, piano B

Tutte da Unsplash (licenza Unsplash), scaricate, **guardate una per una con
Read**, ritagliate sul tatuaggio, salvate ottimizzate negli asset del concept,
con autore e URL annotati nel doc dell'agent e nel colophon. Nota: dalla sandbox
la ricerca `unsplash.com/napi/search` risponde con un redirect (307), mentre
`images.unsplash.com` risponde 200; chi cerca le foto usa la pagina di ricerca
nel browser Playwright o le API pubbliche, e scarica dal CDN.

**Cosa cercare** (in inglese): "healed tattoo", "fine line tattoo forearm",
"blackwork tattoo", "botanical tattoo", "script tattoo", "ornamental tattoo",
"black and grey tattoo", "tattoo shoulder", "tattoo back", "ankle tattoo",
"hand tattoo", "minimal tattoo wrist", "tattooed arm". Obiettivo 24 foto, minimo
18, più 2-3 foto dello **studio vuoto** (poltrona, parete, luce; nessuna
persona, nessuna macchinetta in primo piano) per l'isola "Dove".

**Criteri per tenerla (tutti)**
- Tatuaggio **guarito**: niente rossore, gonfiore, lucido di crema, pellicola o
  "seconda pelle", niente sangue o plasma, niente linee appena fatte con bordi
  netti e pelle arrossata; texture della pelle normale.
- Nessun volto riconoscibile (ritagliare su braccio, schiena, gamba, mano); se
  un volto resta nell'inquadratura, scartare.
- Niente macchinette, guanti o aghi in primo piano; niente sessione in corso.
- Nessun nudo oltre schiena e spalle; niente pose da moda.
- Nessun marchio, personaggio protetto o scritta leggibile che sia un marchio.
- Varietà vera: diversi toni di pelle, diverse zone, piccoli e grandi, linea
  fine e blackwork.
- Per ogni foto annotare (per la scheda): stile, zona, misura stimata in cm,
  "guarito da" di esempio. Questi dati sono di esempio e il colophon lo dice:
  "Lavori fotografati da altri autori su Unsplash, usati come esempio."

**Piano B**
1. Se Unsplash dà meno di 18 guariti validi: Pexels (licenza libera), stessa
   verifica.
2. Se ancora meno di 18: il periodo della parete si accorcia (12 × 9 moduli),
   le isole prendono più spazio e il rimescolamento tra periodi fa il resto.
   Meglio 12 foto giuste che 24 dubbie.
3. **Mai** tatuaggi generati con l'intelligenza artificiale, mai flash disegnati
   da noi, mai foto di tatuaggi appena fatti per riempire: un portfolio finto
   è il contrario di questo sito.
4. Foto dello studio non trovate: l'isola "Dove" resta solo testo.

### 4.7 Mobile 375 px (pensato insieme al desktop, non dopo)

- La parete a 375 × 812: modulo 112 px, quindi circa 3 moduli di larghezza e 6
  di altezza visibili: 5-7 foto intere per schermo, mai una colonna. Il
  trascinamento con un dito è il gesto naturale del telefono.
- L'ingresso a 375: *Sottopelle* su una riga a 56-60 px (la parola ci sta:
  verificarlo con il font caricato, altrimenti 52 px; mai spezzata a metà),
  frase di 3 righe, bottone a tutta larghezza meno i margini (16 px).
- `touch-action: none` solo sul canvas della parete; lo zoom del browser resta
  possibile nella vista elenco e nella prenotazione (testo ingrandibile).
- Barra in basso compatibile col `ConceptBackButton` in basso a sinistra (vedi
  4.2), rispettando `env(safe-area-inset-bottom)`. Altezza 100dvh, niente salti
  della barra degli indirizzi.
- Scheda del lavoro: foto a tutta larghezza in alto (60% dell'altezza), dati
  sotto, frecce grandi 44 px, chiusura in alto a destra; scorrimento
  orizzontale tra i lavori con lo swipe.
- "Grande come?" a 375: il banco occupa la metà alta; moneta e carta ci stanno
  in scala vera, telefono e cartolina escono dal bordo col contorno tratteggiato
  (vedi 4.5). La frase si legge sotto e ogni parte si apre come foglio dal basso;
  la stima e il posto seguono scorrendo dentro il pannello. Il banco scorre via
  con il resto (non resta fisso sopra: la struttura "prova fissa + scelte sotto"
  è di IMPRONTA).
- Screenshot di controllo a 375, 768, 1440, 2560 per: ingresso, parete in
  movimento, un'isola, scheda, elenco, banco vuoto, errore, successo.

### 4.8 Accessibilità

- Il canvas è `aria-hidden`; sopra c'è il DOM vero: ogni tessera è un bottone
  con testo alternativo che descrive il lavoro ("Ramo d'ulivo a linea fine
  sull'avambraccio, 9 × 3 cm, guarito da un anno, di Nives").
- La parete è una `region` con nome ("Parete dei lavori: trascina o usa le
  frecce"); le tessere fuori dal periodo corrente non sono nel tab order (niente
  tab infiniti).
- Primo elemento focalizzabile: "Vai all'elenco". L'elenco contiene tutto il
  sito: nessuna informazione vive solo sulla parete.
- Anello di focus osso 2 px con 2 px di distacco, su tutto (14,8:1).
- Dialoghi (scheda, Grande come?, fogli dei filtri): focus intrappolato, Esc
  chiude, il focus torna da dove era partito.
- Filtri: bottoni con `aria-pressed`. Interruttore Parete/Elenco con stato letto.
- La macchia: ridimensionabile senza trascinare (campi numerici e − / +);
  la stima annunciata con `aria-live="polite"`; errori collegati ai campi
  (`aria-describedby`).
- Contrasti: tabella 4.1. Grigio sfumato mai per testo sotto 24 px; rosso mai per
  testo.
- Nessun lampo: sbocci e increspature monotoni, lenti, sotto le 3 variazioni al
  secondo; nessuna animazione in loop.

### 4.9 Cosa NON fare

**Dalla ricetta bocciata e da LUCIDA**
- Niente fondo crema o osso a tutto schermo, niente sezioni chiare in mezzo al
  nero (tema unico), niente titolo con una parola colorata.
- Niente riga di numeri tra filetti ("in lista adesso 14", "attesa 2 mesi"),
  niente contatori, niente "dal 2009".
- Niente split testo a sinistra / foto in cornice a destra nella prima schermata,
  niente "TAV. I", niente didascalie poetiche.
- Niente macchinetta, guanti, aghi in primo piano; niente foto di sessione in
  corso.
- Niente manichino, sagoma del corpo, figura umana disegnata, mappa del corpo
  da toccare.
- Niente carta da ricalco, lucido, stencil viola, "quaderno dei disegni".
- Niente flash disegnati da noi (rondini, rose, pugnali, cuori), niente
  tatuaggi generati.
- Niente striscia scorrevole di parole in fondo, niente marquee.
- Niente monospace, niente maiuscoletto spaziato, niente occhielli "01 ·".
- Niente "Mettiti in lista", niente coda o lista d'attesa live.
- La prenotazione non è un form a passi numerati e non finisce in cartolina,
  scontrino, ricevuta, biglietto, busta o certificato.

**Specifici di SOTTOPELLE**
- Rosso solo sul fondo dei due bottoni d'azione. Mai testo rosso, mai rosso
  nell'inchiostro, mai "sangue".
- Grenze Gotisch mai in maiuscolo, mai sotto 32 px, mai per numeri, regole,
  prezzi, bottoni (unica eccezione: la cifra delle ore nella stima).
- Niente zoom della parete, niente rotazione, niente parallasse, niente
  profondità 3D.
- Niente foto che sbocciano di nuovo quando sono già state viste; niente
  sboccio sotto i 450 ms; niente increspature spontanee o in loop.
- Niente cursore custom, niente cerchio che segue il mouse, niente bottoni
  magnetici.
- Niente testo dentro il canvas: il testo è sempre DOM.
- Niente etichette sovrapposte alle foto (stile, prezzo, "guarito"): i dati
  stanno nella scheda o sotto la foto in elenco.
- Niente griglia regolare di schede uguali, niente bento: la dimensione delle
  tessere dipende dalla misura vera del tatuaggio.
- Niente "Scorri" o "Trascina" come scritta animata; la deriva iniziale basta.
- Niente teschi, fiamme, scritte "ink", gocce di sangue, texture grunge, carta
  bruciata: il cliché tattoo è il nemico quanto il cliché web.
- Niente trattini lunghi (né `—` né `–`) in nessun testo visibile.
- Un solo intento per etichetta: "Grande come?" è l'unico richiamo alla
  prenotazione (barra, ingresso, scheda); "Fissa la consulenza" esiste solo
  dentro il pannello.
- Niente dati legali inventati (P.IVA, autorizzazioni ASL, numeri di
  certificato); recapiti di esempio.

### 4.10 Note per le ondate successive

- **ux-architect**: disegna il periodo 16 × 12 con le posizioni esatte di
  tessere e isole, l'ordine di tab, la tabella di stima (esempio) e il
  calendario delle consulenze di esempio.
- **tech-architect / webgl-artist**: un canvas, pool di quad, shader unico
  (sboccio, increspatura, arretramento), render su richiesta, fallback DOM con
  `mask-image`. Nessun accesso a window/document a livello di modulo (prerender).
  Porte del concept 12: **9120-9129** (dall'esempio di `lab-operativo.md`:
  concept 11 → 9110-9119), sempre con `--strictPort`.
- **motion-designer**: gli unici eventi di movimento sono: deriva iniziale,
  inerzia della parete, sboccio, increspatura, FLIP della scheda, posarsi della
  macchia, arretramento dei filtri. Nient'altro si muove.
- **copywriter**: italiano da studio di Pordenone, diretto e gentile, frasi
  brevi; niente gergo inglese inutile (si dice "linea fine" e "guarito", "fine
  line" solo se serve per farsi capire); regole dette come le direbbe il
  tatuatore al bancone.
- **trend-researcher**: siti di studi di tatuaggio con portfolio forte, gallerie
  a trascinamento libero (infinite canvas), shader di diffusione/inchiostro in
  WebGL. Estrarre principi, non copiare.
