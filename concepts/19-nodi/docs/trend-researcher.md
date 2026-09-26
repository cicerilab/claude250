# Trend researcher · Concept 19 · NODI (liuteria, Pordenone)

Ondata 1. Input letti: `docs/ruoli-agent.md`, `docs/concept-lab.md` (ricetta
bocciata), `docs/matrice-concept-11-20.md` (riga e paragrafo 19, verifica
incrociata), `concepts/19-nodi/docs/creative-director.md` (direzione A, LA
TAVOLA INTERA, vincolante dal 4 in poi), `.claude/skills/taste/SKILL.md`,
`concepts/18-sottoscocca/docs/trend-researcher.md` e
`concepts/10-torchio/docs/trend-researcher.md` (solo formato).

Scopo: dare all'ondata 2 (art-director, motion-designer, webgl-artist,
interaction-designer, copywriter, vector-artist, photo-editor) **la verifica
delle figure e delle frequenze** chiesta dal creative-director (2.1 e 4.10),
**principi da reinterpretare**, **pattern da evitare** e i **rischi veri**.
Nessun codice, nessuna copia di stile.

---

## 1. Fonti e metodo

### 1.1 /taste dal vivo: non possibile, dichiarato

In questo ambiente il Chromium di Playwright rifiuta il certificato del proxy
(`ERR_CERT_AUTHORITY_INVALID`) e la verifica TLS **non** va allentata. Quindi
niente screenshot, niente `references/extract.js` nella pagina, niente file
`{dominio}.md` / `{dominio}.json` della skill.

**Ripiego fatto davvero (26/09/2026)**: `curl` dell'HTML della home e di
**tutti i fogli di stile** collegati (stesso dominio), poi conteggio di
`font-family`, colori esadecimali, variabili CSS, `border-radius`,
`font-size`, `text-transform`, ombre, e testo visibile. Sono misure del CSS
dichiarato, non della pagina resa: dicono quali token esistono e quanto sono
usati nel codice, non quanta superficie occupano. Dove scrivo "a memoria"
sono riferimenti noti **non verificati** in questa sessione.

| Sito | Perché è coerente col concept | Esito |
|---|---|---|
| `florianleonhard.com` | Bottega contemporanea di liuteria, restauro e perizia (Londra): il mestiere, lato alto di gamma | Catturato: 57 CSS del tema, 461 KB. Font Typekit non scaricabile (TLS di `use.typekit.net` rifiutato), nomi letti dal CSS |
| `tarisio.com` | Casa d'aste di strumenti ad arco, archivio Cozio, dendrocronologia: il lessico e le cifre del settore | Catturato: 3 CSS, 488 KB |
| `ciechanow.ski/sound/` | Il riferimento più noto di **simulazione fisica come interfaccia di lettura**, e proprio sul suono | Catturato: 2 CSS, 23 KB, testo e struttura |
| `teenage.engineering` | Costruttore di strumenti elettronici: oggetto protagonista e interfaccia minuscola ai margini | Catturato: 17 CSS, 178 KB |

**Rifiutati, dichiarati**: `martinschleske.de` (liutaio che lavora con
l'analisi modale: sarebbe stato il riferimento ideale; proxy 502),
`museodelviolino.org` (connessione chiusa), `fondazionestradivari.org`,
`jmviolins.com`, `zygmuntowicz.com`, `stradivari.org`, `violinmakers.org`,
`bein-fushi.com` (502 o 000), `benningviolins.com` e `stringsmagazine.com`
(202, pagina anti-bot). Nessuna bottega di liuteria italiana è risultata
raggiungibile.

### 1.2 Sistemi dalla libreria locale `awesome-design-md` (letti)

| Sistema | Perché serve a NODI | Principio preso (non lo stile) |
|---|---|---|
| **claude** | Fondo crema `#FAF9F5`, accento corallo `#CC785C`, serif display a 400: è esattamente il "caldo editoriale" di default a cui NODI rischia di somigliare | **Controesempio**. La sua regola buona: "non illustrare il prodotto quando puoi mostrare quello vero" (lì il codice, qui la simulazione). Da non prendere: accento corallo sui bottoni, alternanza di bande crema/scure |
| **ibm** (Carbon) | Spigoli 0-4 px, un solo accento, cifre e dati in chiaro | Il dato si mostra piatto e allineato; raggio 0 = strumento di misura. Il righello deve sembrare Carbon per rigore, non per stile |
| **wired** | Rivista stampata portata sul web: serif display alto solo nei titoli, sans per i metadati, zero cromature di marketing | La grammatica della pagina stampata (margini, allineamenti, niente ombre) basta a dare "cartiglio"; nessuna texture di carta finta |

---

## 2. Verifica delle figure e delle frequenze (richiesta dal creative-director)

### 2.1 Fonte primaria letta per intero

**Erik Jansson, *Acoustics for Violin and Guitar Makers*, 4ª ed. 2002, KTH,
cap. V "Vibration Properties of the Wood and Tuning of Violin Plates"**,
`https://www.speech.kth.se/music/acviguit4/part5.pdf` (31 pagine, lette con le
figure). È la fonte citata al 2.1 del creative-director. Contiene i dati di
Hutchins, Beldie, Hansen e Niewczyk. Seconda fonte: **Hutchins e Voskuil,
"Mode Tuning for the Violin Maker", CAS Journal vol. 2 n. 4, 1993**, sul sito
della fondazione di Hutchins, `https://nvfa.org/cmh/cmh-modetuning.html`.
Wikipedia ("Violin acoustics", "Carleen Maley Hutchins", "Ernst Chladni") è
stata letta ma non dà frequenze delle tavole: conferma solo che la polvere si
raccoglie ai nodi e che la taratura delle tavole libere è di Hutchins.

### 2.2 Tabella di verifica

Valori di Jansson, fig. 5.17: **14 tavole armoniche non ancora tarate**
(media ± scarto), con fattore di merito Q. Tabella 5.4: media di 5 tavole con
effe e catena (Hansen). Fig. 5.16e: una tavola finita da 2,8 mm.

| Affermazione del creative-director | Fonte | Esito |
|---|---|---|
| Modo 1 "circa 80-100 Hz" | 89 ± 10 Hz, Q 52 ± 8 (fig. 5.17); 89 Hz con effe e catena (tab. 5.4); 85 Hz tavola finita (fig. 5.16e) | **Confermato** |
| Modo 1: croce, una linea lungo la giunta e una di traverso all'altezza delle C | Fig. 5.17: una linea lungo l'asse, una trasversale all'altezza degli occhi inferiori delle effe (circa 10 mm sotto l'angolo inferiore delle C). "Twisting mode" | **Confermato** (precisare: la traversa sta sugli occhi bassi delle effe) |
| Modo 2 "circa 150-180 Hz" | 165 ± 24 Hz, Q 58 ± 11 (fig. 5.17); 150 Hz (tab. 5.4); 156 Hz (fig. 5.16e) | **Confermato** (la dispersione vera è più larga, 141-189) |
| Modo 2: "due linee curve che si **incrociano a X** nella zona delle C e delle effe" | Jansson p. 5.21: "The nodal lines of the typical **top plate** are shaped as **two vertical brackets )(** and the nodal lines of the back plates of two horizontal but bent nodal lines". Le due linee vanno dagli angoli alti agli angoli bassi, si **avvicinano** alla vita tra le effe **senza toccarsi**; distanza tra gli estremi circa 140 ± 8 mm in alto e 162 ± 5 mm in basso | **Da correggere**. La X (una "v" in alto e una "v" rovesciata in basso che quasi si toccano al centro) è la figura del **fondo di acero** (fig. 5.23a), non della tavola di abete |
| Modo 5 "circa 320-370 Hz" | 350 ± 34 Hz, Q 62 ± 13 (fig. 5.17); 342 Hz (tab. 5.4); **348 Hz** proprio la tavola finita di fig. 5.16e | **Confermato**. Il 348 Hz del sito coincide con un dato pubblicato |
| Modo 5: "una sola linea **chiusa**, un ovale allungato dentro il bordo" | Jansson p. 5.21: "For the back plate the node is closed but **for the top plate it opens at the C-bouts**". Nella tavola il tratto alto passa circa 69 ± 8 mm sotto il bordo superiore, quello basso circa 60 ± 8 mm sopra il bordo inferiore; ai fianchi, all'altezza delle C, la linea si apre (almeno da un lato; con la catena, fig. 5.22, il lato dei bassi si "ripiega") | **Da correggere**: anello aperto alle C nella tavola; chiuso solo nel fondo |
| "Il modo 5 circa un'ottava sopra il modo 2" (Hutchins) | Hutchins e Voskuil 1993: coppie di tavole libere "mode 5 at 370 Hz and mode 2 at 185 Hz", "360-180 Hz or 350-175 Hz". Jansson, medie misurate: 350/165 = 2,12 | **Confermato come regola di Hutchins**, non come legge |
| Valori del sito 92 / 168 / 348 Hz, rapporto 2,07 | Tutti dentro le fasce di fig. 5.17; 348/168 = 2,071 | **Confermato** |
| Quattro cuscinetti di gommapiuma, altoparlante sotto, foglie di tè | Jansson p. 5.9: "lifted up a cm or two above the table with **four pieces of plastic foam**. Small particles, saw dust, **tea leaves** or similar"; amplificatore circa 15 W, "a loud tone"; cuscinetti sulle linee nodali, altoparlante sotto un ventre | **Confermato alla lettera** (anche le foglie di tè) |
| Le foglie prima saltano sui ventri, poi si fermano sui nodi | Jansson p. 5.9: "The positions of maximum jumps of the particles mark the antinodes. The particles will soon move and collect at the nodal lines" | **Confermato**. (Polvere finissima ai ventri: noto dalla letteratura su Chladni, **non verificato** qui; non ci serve) |
| Rigidezza lungo la vena "circa 12-15 volte" quella di traverso | Haines 2000 (tab. 5.2): abete E longitudinale 15 GPa, radiale 0,76 GPa, taglio 0,84 GPa → circa **20**; piastra di Beldie 8,9/0,52 → circa **17**; barrette d'esempio 15,2/0,79 → circa **19** | **Da correggere**: usare **17-20** |
| Spessore circa 2,8 mm | Fig. 5.16e: "finished top plate 2.8 mm thick" | **Confermato** |
| Densità (non citata) | Abete 460 kg/m³ (tab. 5.1) | Dato utile al webgl-artist |
| "circa 70 g la tavola" | Non presente nelle fonti lette | **Non verificato**: il copywriter lo tolga o lo presenti come "della nostra tavola d'esempio" |
| Picchi stretti, allargati a ±8 Hz | Q 52-62 → larghezza di banda a -3 dB circa 1,7 Hz a 89 Hz e circa 5,6 Hz a 348 Hz (±0,9 e ±2,8 Hz) | **Confermato che è un allargamento** (circa 3 volte al modo 5, circa 9 volte al modo 1): il testo lo dica, come previsto |
| Scuro ↔ brillante sposta il modo 5 tra 330 e 366 Hz | Hutchins e Voskuil 1993: violini con tavole libere più rigide (modo 5 a 370, modo 2 a 185) "preferred by soloists for their bright powerful sound"; frequenze più basse "more suitable for some orchestra players and amateurs" | **Direzione confermata** come osservazione di Hutchins: più alto = più brillante. Il copywriter può citarla così, con onestà |

### 2.3 Due cose che il creative-director non dice e un liutaio nota

1. **I modi 3 e 4 esistono.** Il "modo 5" è davvero la quinta risonanza:
   nella tavola finita di fig. 5.16e ci sono modi a **249 e 260 Hz** tra il
   modo 2 (156) e il modo 5 (348). Una scansione vera da 168 a 348 Hz li
   attraversa. Proposta: tra circa 240 e 270 Hz le foglie **tremano appena**
   (ampiezza bassa, nessuna figura nitida) e il righello ha due tacche sottili
   senza nome; una riga di testo facoltativa: "Tra i due, la tavola ha altri
   modi: il liutaio guarda soprattutto l'1, il 2 e il 5." Così la scansione
   non è "vuota" in modo sospetto. (Decisione del creative-director e del
   webgl-artist, vedi Richieste.)
2. **Le linee "parlano".** Jansson (p. 5.27, dati di Hutchins 1989): se la
   linea dell'anello "esce" dal bordo tra le C, la tavola è troppo rigida al
   centro; se la X del fondo si allarga in una macchia, la parte alta è
   troppo spessa. È contenuto vero e breve per "Costruire uno strumento" o per
   il piede sulla simulazione: si legge la figura come si legge un difetto.

### 2.4 Riferimenti visivi per il webgl-artist

Confrontare le tre figure calcolate con: Jansson fig. **5.17** (tavola, riga
in alto: modi 1, 2, 5 con quote in mm), fig. **5.18** (modi 2 e 5 con effe e
catena), fig. **5.22** (anello con la catena, tre stadi), tutte nel PDF sopra.
Per il fondo (che non compare) fig. 5.23. Il contorno 4/4 del
creative-director (lunghezza circa 356 mm) è coerente con le piastre di prova
di Jansson (360 x 212 mm) e col grezzo standard (385 x 215 mm).

---

## 3. Cosa hanno detto le misure (sintesi del ripiego /taste)

- **Florian Leonhard**: palette dichiarata in `colors.css` con nomi propri:
  onyx `#24201D`, ivory `#F2EBE6`, linen `#FAF3EE`, cocoa `#5B3924`,
  tumbleweed `#AB8B7A`, e un solo accento, salamander `#FC5D21` (67 usi
  contro 63 di onyx: l'arancio è su link e dettagli, non su fondi). Titoli in
  serif da libro (`nocturne-serif-lights` 16 regole, `warnock-pro-display`
  12), 60-95 px; testo 18 px. `border-radius: 0` prevale (9 regole) ma
  convive con pillole da 70 px (6). Menu con 25 voci, feed Instagram, negozio.
  Frase d'apertura: "Fine violin experts, dealers, restorers, makers, and
  consultants". Lettura: il settore alto usa **fondo avorio, testo quasi nero
  bruno, serif chiaro, un accento caldo raro**, cioè il territorio da cui NODI
  deve distinguersi per saturazione (abete `#E6D4AC` contro ivory `#F2EBE6`).
- **Tarisio**: fondo `#F6F5F0`, rosso `#AF292E` (170 usi, secondo solo al
  bianco), GoudyOS (serif antico) per i titoli e Myriad per tutto il resto,
  **35 regole in maiuscolo**, pillole da 40 px e 9999 px, ombre
  `2px 3px 1px rgba(0,0,0,.1)` sulle schede. Il contenuto però è oro:
  dendrocronologia, archivio storico, perizie, registro degli strumenti
  rubati. Lettura: **rosso bruno sulle cifre funziona nel settore** (è il
  colore dei prezzi d'asta), ma il maiuscolo e le schede con ombra sono
  esattamente la ricetta bocciata.
- **ciechanow.ski/sound**: 142 paragrafi e **37 cursori dentro il testo**,
  nessun canvas nell'HTML (le simulazioni nascono in JS dove servono), testo
  IBM Plex Sans / Inter, fondo bianco, accento rosso `#E63946` solo sugli
  elementi attivi. Prima della prima tastiera sonora il testo dice: "make
  sure your system volume is at a reasonable level". Lettura: la
  simulazione **è** la spiegazione; ogni controllo cambia un solo parametro
  e la frase accanto dice cosa guardare.
- **teenage.engineering**: dimensioni del testo legate alla larghezza della
  finestra (`--fs-10` ... `--fs-40` come frazioni di `--client-width`),
  testo minuscolo e piccolo, nero `#0F0E12` e un grigio chiaro prodotto
  `#F5F5F5`, raggio 0 o 1000 px, `prefers-reduced-motion` gestito. Lettura:
  l'oggetto occupa la scena, l'interfaccia è minuta e sta ai bordi.

---

## 4. Principi da reinterpretare (10)

Ogni principio: da dove viene, poi **come si applica qui**.

### P1 · La simulazione dentro la frase
*Da: ciechanow.ski (37 cursori dentro 142 paragrafi).*
**Qui**: il righello è l'unico comando, ma ogni pianerottolo ha **una frase
che dice cosa guardare** sulla tavola in quel momento ("Guarda le due linee:
si avvicinano tra le effe e non si toccano."). Il copywriter scrive una frase
"guarda" per modo, massimo 14 parole, sotto il titolo del modo. È anche il
testo di `aria-live`.

### P2 · Avvisa del volume prima, non dopo
*Da: ciechanow.ski (avviso sul volume prima del primo suono).*
**Qui**: la nota "Suono basso. Con le cuffie abbassa il volume." deve essere
visibile **accanto all'interruttore spento**, prima del primo tocco, non solo
dopo averlo acceso. Stessa nota sopra "Senti la voce".

### P3 · La cifra porta la sua tolleranza
*Da: Jansson fig. 5.17 (ogni frequenza con ± e Q), Hutchins 1993 (coppie
170-185).*
**Qui**: le cifre in vernice sono poche e oneste: "92 Hz" grande, e accanto,
piccolo in tè, "nelle tavole vere tra 80 e 100". Mai una cifra nuda che
sembri una specifica. Nessun contatore.

### P4 · Un accento raro su fondo caldo
*Da: Florian Leonhard (salamander solo su dettagli), Tarisio (rosso bruno sui
prezzi), ibm (un solo accento).*
**Qui**: vernice `#8B3A1D` solo su cifre e cursore, come già deciso. Regola
misurabile per l'art-director: la vernice copre **meno dell'1% dell'area**
della finestra in ogni schermata (le cifre grandi del righello comprese). Se
supera, la pagina diventa "craft beige con accento".

### P5 · Il serif antico solo grande
*Da: Florian Leonhard (serif da libro a 60-95 px), Tarisio (GoudyOS solo nei
titoli), wired.*
**Qui**: IM Fell DW Pica ha altezza della x di **0,44 em** (903/2048,
misurata sul file di Google Fonts) e un solo peso, roman 400: sotto circa
24 px diventa piccola e irregolare. Soglia: mai sotto 24 px, mai testo
corrente, mai etichette. Le legature del file sono solo fi, fl, ff, ffi, ffl
(nessuna legatura storica "ct" o "st"), le lettere accentate italiane e `€`
ci sono.

### P6 · Le cifre del mestiere sono tabellari
*Da: ibm (dati allineati).*
**Qui**: **verificato**: Spline Sans di Google Fonts ha la feature `tnum`
(anche `pnum`, `frac`). Il righello e le cifre in vernice usano
`font-variant-numeric: tabular-nums`, così "92" → "168" → "348" non fa
ballare la colonna durante il trascinamento. Nessun contenitore a larghezza
fissa di ripiego serve.

### P7 · Spigolo vivo = strumento
*Da: ibm (0-4 px), Florian Leonhard (raggio 0 prevalente); controesempi
Tarisio (pillole 40 px e 9999 px) e Leonhard (pillole 70 px).*
**Qui**: raggio 0 ovunque come da creative-director; le uniche forme tonde
sono i cuscinetti e la foglia del piano del suono. Nessun bottone a pillola.

### P8 · L'oggetto occupa la scena, l'interfaccia sta ai bordi
*Da: teenage.engineering (testo piccolo ai margini, oggetto protagonista).*
**Qui**: nei margini testo 17 px e righello sottile; niente pannelli, niente
schede sopra la tavola. La tavola non ha mai niente sopra se non le foglie
e i cuscinetti.

### P9 · Mostra il vero, non illustrarlo
*Da: claude DESIGN.md ("non dipingere illustrazioni del codice quando puoi
mostrare il codice vero").*
**Qui**: la simulazione è il prodotto. Nessuna illustrazione di violino,
archetto, note musicali, onde. Nel piede, le fonti vere in una riga ("Figure
calcolate su una tavola d'esempio; frequenze tipiche da Jansson, KTH, e
Hutchins"): per un liutaio è la prova che non è un effetto.

### P10 · Il mestiere si dice con il suo lessico
*Da: Tarisio (dendrocronologia, perizie, registro dei rubati), Florian
Leonhard (restauro, ricrinatura dell'arco, perizia).*
**Qui**: nell'elenco delle riparazioni manca la voce più frequente in una
bottega: **la ricrinatura dell'archetto** (e la regolazione del ponticello e
dell'anima prima di un concerto). In "I legni" una riga sulla vena
("anelli fitti e dritti, tagliato di quarto") vale più di un aggettivo. Da
passare a brand-strategist e copywriter.

---

## 5. Pattern inflazionati da evitare (10)

1. **La ricetta bocciata** (concept-lab): serif corsivo nei titoli con
   sottotitolo sans, sezioni "01 ·" con maiuscoletto o monospace, schede
   bianche con bordino e ombra, dissolvenza dal basso ovunque, onde e
   divisori, mappa disegnata, prenotazione a passi che finisce in
   cartolina/scontrino, figure umane SVG.
2. **Il bocciato ANIMA**: marrone quasi nero con oro, bottoni pieni oro,
   parola del titolo in corsivo colorato, foto della pialla in cornice con
   "TAV. I", riga di quattro numeri tra filetti, "Audio acceso" nel menu, il
   violino che si apre pezzo per pezzo e suona.
3. **L'estetica del commerciante di strumenti antichi**: violino su velluto
   o su nero con luce radente dorata, "Rare Italian violins", menu a 25 voci
   (Leonhard), navigazione tutta in maiuscolo (Tarisio: 35 regole). NODI non
   vende Stradivari: è una bottega che costruisce.
4. **Il "caldo editoriale" di default**: crema + corallo/terracotta + serif
   display a 400 (claude DESIGN.md, `#FAF9F5` + `#CC785C`). È la versione
   generica di NODI: niente CTA color terracotta, niente bande crema/scure
   alternate, niente secondo tono di fondo.
5. **Chladni da video virale**: piastra quadrata o tonda di metallo con
   sabbia bianca su nero, sweep di frequenza con figure a mandala, "cymatics"
   con acqua e luci colorate. Su un violino quelle figure sono false.
6. **Particelle da vetrina WebGL**: bagliore, scie, bloom, particelle che
   seguono il cursore, polvere dorata, esplosione all'arrivo. Le foglie sono
   opache e ferme quando la tavola è ferma.
7. **Visualizzatore audio**: sinusoidi animate, spettro a barre colorate,
   oscilloscopio verde, accordatore cromatico con ago. Il righello è un
   righello.
8. **Negozio e social nella stessa pagina**: feed Instagram, carrello,
   schede prodotto con ombra `2px 3px 1px` (Leonhard, Tarisio). Nessuna
   griglia di strumenti "in vendita".
9. **Testimonianze di solisti e loghi di orchestre**: "suonato da...",
   fascia di loghi, citazioni con virgolette giganti. Per una bottega
   inventata è falso.
10. **Pillole, cookie banner, chat fissa, torna-su**: competono con righello,
    marchio e `ConceptBackButton`. Nessun elemento fisso oltre a questi.

---

## 6. Rischi del concept (e cosa fare)

**R1 · Figure sbagliate agli occhi di un liutaio.** Due descrizioni del
creative-director non corrispondono alla tavola di abete (modo 2 a X, modo 5
chiuso). *Mitigazione*: correzioni al 2.2; il webgl-artist confronta con
Jansson fig. 5.17 e 5.18 e allega il confronto; il Piano B "a mano" usa quelle
figure come bersaglio. Anche la descrizione `aria-live` del modo 2 va
corretta ("due linee lungo la tavola che si avvicinano tra le effe").

**R2 · Scansione sospetta tra 168 e 348 Hz.** Una tavola vera risponde anche
a circa 250-260 Hz (modi 3 e 4). *Mitigazione*: vedi 2.3, tremolio minimo e
tacche senza nome, oppure una frase che lo dichiara.

**R3 · Il suono basso non si sente sul telefono.** Gli altoparlanti dei
telefoni rendono poco sotto i 200-300 Hz (dato noto, **non misurato** qui):
a 92 Hz la sinusoide del modo 1 sarà quasi muta, a 348 Hz si sentirà bene.
Il rischio è che il visitatore alzi il volume sul modo 1 e poi si spaventi al
modo 5. *Mitigazione*: guadagno massimo **fisso** (0,04, come deciso) senza
compensazioni di volume; nota "Sul telefono le note più basse quasi non si
sentono". Per "Senti la voce": la viola (Do 131 Hz) e il violoncello (Do 65
Hz) come sinusoide pura sono inudibili sul telefono; la nota d'esempio va
sintetizzata **con armoniche** (per esempio a dente di sega filtrato), così
la fondamentale si "sente" anche dove l'altoparlante non la rende.

**R4 · Le foglie non si leggono come foglie a 375 px.** Con la tavola alta
circa 360 px, 1 mm reale ≈ 1 px: foglie di 1,5-3 mm sono 1,5-3 px, cioè
puntini, che il creative-director vieta. *Mitigazione*: sul telefono la scala
delle foglie si esagera (minimo circa 4 px sul lato lungo) e se ne usano meno;
l'atlante di scaglie deve reggere a 4-6 px.

**R5 · "Craft beige".** Abete + tè + vernice + serif antico è a un passo dai
siti avorio del settore e da claude. *Mitigazione*: P4 (vernice sotto l'1%),
il fondo resta abete saturo `#E6D4AC` (non `#F2EBE6` né `#FAF9F5`), nessun
secondo tono di fondo, la tavola è l'unica "immagine".

**R6 · Contrasto degli assi del piano del suono.** Tè al 40% su abete fa circa
**2,2:1** (calcolato), sotto il 3:1 che WCAG 1.4.11 chiede per la grafica
necessaria a capire un comando. *Mitigazione*: assi a tè pieno sottili (1 px)
o tè al 60-65%; le quattro parole agli estremi sono il vero riferimento. I
contrasti di testo del creative-director sono giusti (ricalcolati: tè 9,28:1,
vernice 5,28:1, ebano 12,75:1).

**R7 · Scroll lungo.** Tre pianerottoli da circa 1,5 finestre più i contenuti
fanno molte schermate prima della prenotazione. *Mitigazione*: il bottone "La
voce che vorresti" già in apertura, l'indice sotto il righello, e il righello
stesso come navigazione (le tre scorciatoie dei modi).

**R8 · Pagina che vive solo nel canvas.** *Mitigazione*: tutto il testo nel
DOM, canvas `aria-hidden`, fallback con le immagini delle figure pronto dalla
prima build (come deciso).

**R9 · Foto sbagliate.** La maggior parte delle foto "luthier" sono di
chitarre (già segnalato dal creative-director). Aggiungo: scartare anche le
foto con violini su velluto rosso o in controluce dorato (pattern 3).

**R10 · Credibilità del piano del suono.** "Scuro/brillante" collegato alla
frequenza del modo 5 è un'osservazione di Hutchins, non una misura del
suono finito. *Mitigazione*: la didascalia già prevista ("è un modo per
parlarne, non una promessa di laboratorio") più, se il copywriter vuole, la
citazione: "Hutchins notava che le tavole più rigide danno violini più
brillanti."

---

## 7. Note per agent

- **webgl-artist**: 2.2 (modo 2 a parentesi, modo 5 aperto alle C, rigidezza
  17-20, densità 460 kg/m³, spessore 2,8 mm), 2.4 (figure di confronto), R2,
  R4.
- **art-director**: P4 (vernice sotto l'1%), P5 (IM Fell mai sotto 24 px),
  P6 (`tnum` verificato), P7, R5, R6.
- **interaction-designer / motion-designer**: P1, P2, R3 (guadagno fisso,
  armoniche nella nota d'esempio), R2 (tremolio minimo tra i modi 3 e 4, senza
  lampeggi).
- **copywriter**: 2.2 (frequenze sempre con "circa" e con la fascia vera; il
  70 g non è verificato; citazione di Hutchins su scuro/brillante), P1 (frase
  "guarda" per modo), P3, P10 (ricrinatura dell'archetto), fonti nel piede.
- **photo-editor**: pattern 3, R9.
- **vector-artist**: contorno coerente con 356 mm di lunghezza (le piastre di
  prova di Jansson sono 360 x 212 mm); le effe servono anche perché aprono
  l'anello del modo 5.

## Richieste ad altri agent

- **creative-director**: correggere in `creative-director.md` 2.1 la figura del
  modo 2 (due parentesi `)(` lungo la tavola, non una X) e del modo 5 (anello
  aperto alle C nella tavola), e al 2.2 punto 2 la rigidezza (17-20 volte).
  Decidere se mostrare i modi 3 e 4 (2.3). Facoltativo: valori del sito in
  ottave esatte secondo la regola di Hutchins, **87 / 174 / 348 Hz**, tutti
  dentro le fasce di Jansson; se si tengono 92 / 168 / 348 va bene lo stesso,
  sono verosimili.
- **creative-director / copywriter**: aggiornare il testo `aria-live` del modo
  2 al 4.8 ("le foglie formano due linee lungo la tavola, che si avvicinano
  tra le effe").
