# Trend researcher · Concept 10 · IMPRONTA (tipografia e legatoria)

Ondata 1. Input: `CLAUDE.md`, `docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/creative-director.md` (direzione C, IMPRONTA),
`.claude/skills/taste/SKILL.md`, `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 9 e 10).

Scopo del documento: dare agli agent dell'ondata 2 (art-director,
motion-designer, webgl-artist, interaction-designer, copywriter) una lista di
**principi da reinterpretare** e una lista di **cose da non fare**, con note
pratiche sui tre rischi veri del concept: la tipografia a larghezza estrema, lo
shader di rilievo, il giallo citrino a tutto schermo. Nessun codice.

---

## 1. Fonti consultate e cosa è stato bloccato

### 1.1 Tentativo /taste (bloccato)

`/taste` richiede Playwright che apra il sito vivo. Ho fatto **un solo
tentativo** con Playwright (Chromium da `/opt/pw-browsers`, pacchetto
`playwright` globale), 25/09/2026, sui seguenti indirizzi:

| URL | Esito |
|---|---|
| `https://www.awwwards.com/websites/sites_of_the_day/` | bloccato, `net::ERR_TUNNEL_CONNECTION_FAILED` |
| `https://www.klim.co.nz/` (fonderia di caratteri) | bloccato, stesso errore |
| `https://www.pentagram.com/` (studio grafico) | bloccato, stesso errore |
| `https://fonts.google.com/specimen/Anybody` (specimen del font scelto) | bloccato, stesso errore |
| `https://lusion.co/` (studio WebGL, controllo con curl) | bloccato |

Controllo aggiuntivo utile agli altri agent: **`fonts.googleapis.com` risponde
(200)** e `fonts.gstatic.com` è raggiungibile; quindi Anybody e Hanken Grotesk
si possono caricare da Google Fonts in sviluppo. `fonts.google.com` (il sito
degli specimen) invece è bloccato.

**Conseguenza**: nessun file `{dominio}.md` / `.json` di /taste è stato
prodotto. Nessun valore in px o hex di siti esterni in questo documento è
"misurato": dove cito siti esterni lo faccio a memoria e solo per quello che so
con certezza. Se Luca vuole il /taste vero, va sbloccato nella network policy
dell'ambiente (da claude.ai) almeno: `www.awwwards.com`, `assets.awwwards.com`,
e i domini dei siti di riferimento qui sotto.

### 1.2 Ripiego A: libreria locale awesome-design-md (letta davvero)

Dei 74 sistemi in `design-references/awesome-design-md/design-md/` ho scelto e
letto 6 sistemi, perché ognuno risolve un pezzo del problema di IMPRONTA (non
perché gli somiglia):

| Sistema | Perché è utile a IMPRONTA | Cosa ne prendo (principio, non stile) |
|---|---|---|
| **lamborghini** | Carattere unico con larghezze da Normal a Ultracompressed, maiuscolo a 120 px con interlinea 0,92, raggio 0 ovunque, un solo colore acceso. | Un solo carattere che cambia *larghezza* per fare gerarchia; interlinea stretta = "stampato, non composto"; lo spazio vuoto del fondo fa da respiro (lì il nero, qui la carta). |
| **theverge** | Titoli Manuka 900 a 60-107 px con interlinea 0,80; blocchi di colore saturo pieno usati come superficie, non come lavaggio; zero gradienti. | Il colore saturo funziona solo se è **pieno e piatto**, mai sfumato; il display grosso vive solo sopra una soglia (sotto i 60 px non si usa). Da evitare invece: mono maiuscolo per etichette e pillole arrotondate (è la ricetta bocciata). |
| **bugatti** | Nessun colore d'accento, nessuna decorazione, gerarchia fatta solo con dimensione e spaziatura; sezioni a 120 px di distanza. | Disciplina: se tutto il resto tace, l'unico elemento "caldo" (qui la lamina argento) vale moltissimo. Il vuoto è una scelta di marca, non spazio da riempire. |
| **mastercard** | Fondo tinto (putty `#F3F0EE`) al posto del bianco; **titoli "fantasma" tono su tono** (crema su crema) che sembrano carta premuta; peso 450 per il corpo. | È il parente più vicino alla stampa a secco nel web reale: una scritta dello stesso colore del fondo, leggibile solo per differenza di tono. Conferma che funziona **solo come secondo livello**, mai come unico veicolo del testo. |
| **wired** | Rivista stampata portata sul web: bottoni quadrati a raggio 0, niente ombre, un solo "segno" di marca (il nastro della testata). | Il web può avere la grammatica della pagina stampata senza imitare la carta con texture: bastano margini, allineamenti, raggio 0 e nessuna ombra. |
| **claude** | Fondo caldo tinto, display a peso 400 con tracking negativo, ritmo tra superfici chiare e scure. | Il cambio di superficie (chiaro/scuro) come ritmo di pagina: da noi diventa il cambio di **carta** scelto dall'utente, non un'alternanza automatica tra sezioni. Da evitare: serif display (occupato da 1, 3, 7, 8). |

Scartati dopo lettura delle intestazioni: `nike` (tipografia forte ma tutta
fotografia), `ferrari`, `framer`, `sanity` (fondo nero e accento neon, fuori
tono per una bottega).

### 1.3 Ripiego B: riferimenti noti (a memoria, non verificati in questa sessione)

Nomino solo siti e studi di cui conosco con certezza il *genere* di lavoro, senza
inventare dettagli di layout o valori. Vanno verificati con /taste quando la
rete lo permette.

- **Fonderie di caratteri con specimen interattivi**: Klim Type Foundry
  (klim.co.nz), Grilli Type (grillitype.com), Dinamo (abcdinamo.com), Pangram
  Pangram (pangrampangram.com). Principio comune: il carattere è il prodotto e
  il sito lo fa *usare* (scrivi, cambia assi, guarda), invece di descriverlo.
  È esattamente la logica del "banco di prova".
- **Studi WebGL premiati su Awwwards** (Lusion, Active Theory; il sito di Igloo
  Inc è stato premiato come sito dell'anno 2024): principio utile, la scena 3D è
  un **materiale** credibile (ghiaccio, vetro, metallo) con luce fisica, non un
  effetto. Principio da non seguire: la durata e la densità dello spettacolo,
  inadatte a una bottega che deve farsi chiamare.
- **Studi di letterpress** (per esempio Mama's Sauce, Orlando; è lo studio di
  stampa a caratteri mobili più citato nel design web): il valore venduto è la
  *profondità dell'impressione* sulla carta spessa, mostrata con luce radente
  nelle foto dei lavori. Noi facciamo la stessa foto, ma dal vivo e
  interattiva.

---

## 2. Principi da reinterpretare (11)

Ogni principio: da dove viene, poi come si applica a IMPRONTA. Nessuno va
copiato: va tradotto nel materiale "carta premuta".

### P1 · Il prodotto si usa, non si descrive
*Da: specimen delle fonderie (Klim, Grilli, Dinamo).*
**In IMPRONTA**: il banco di prova non è una sezione "contatti" in fondo, è la
dimostrazione del mestiere. L'hero deve già far capire che *si può scrivere*:
la parola a secco è il primo esempio del banco. Il copywriter scrive l'hero
come invito a provare, non come slogan.

### P2 · Un solo carattere, gerarchia fatta con la larghezza
*Da: lamborghini (Normal → Ultracompressed), theverge (display solo sopra 60 px).*
**In IMPRONTA**: Anybody lavora come tre caratteri diversi grazie all'asse
larghezza: 150 per il premuto e i nomi di sezione, 100 per i titoli secondari,
mai sotto 75 per non ricadere nel "condensato" del vecchio TORCHIO. Regola
d'uso da fissare nel DESIGN.md: Anybody **mai sotto 20 px** e mai per testo di
lettura; lì c'è solo Hanken Grotesk.

### P3 · Interlinea stretta = stampato; interlinea larga = leggibile
*Da: lamborghini (0,92), theverge (0,80).*
**In IMPRONTA**: il titolo a secco e i titoli premuti hanno interlinea molto
stretta (le righe "toccano" come righe di piombo sul vantaggio), il corpo ha
1,55. Il salto netto tra i due registri è una firma. Controllare che accenti
italiani maiuscoli (È, À) non si scontrino con la riga sopra.

### P4 · Tono su tono come secondo livello, mai come unico
*Da: mastercard (titoli fantasma crema su crema).*
**In IMPRONTA**: il rilievo a secco è per definizione tono su tono. Ogni
scritta a secco ha il suo gemello in inchiostro (già previsto dal creative
director). Aggiungo: la scritta a secco deve essere **molto più grande** del suo
gemello in inchiostro (almeno 4 volte), così si leggono come due livelli
diversi (materiale e informazione) e non come un testo duplicato.

### P5 · Il colore saturo funziona solo pieno e piatto
*Da: theverge (blocchi di colore pieni, zero gradienti).*
**In IMPRONTA**: il citrino non si sfuma mai verso il bianco o il crema, non ha
vignettature, non ha "bagliori". Le variazioni di tono sul fondo vengono
**solo** dalla luce che colpisce la fibra e il rilievo, cioè da una causa fisica
visibile. Se un'area è più chiara, deve esserci un perché (la luce).

### P6 · Un solo accento, e vale perché è raro
*Da: bugatti (nessun accento), lamborghini (oro solo sul bottone primario).*
**In IMPRONTA**: la lamina argento compare in tre posti in tutto il sito
(marchio, prezzo, leva). Se l'art-director sente il bisogno di un quarto posto,
il problema è altrove. Niente argento su icone, link, bordi, hover.

### P7 · Grammatica della pagina stampata senza imitare la carta
*Da: wired (raggio 0, niente ombre, rivista portata sul web).*
**In IMPRONTA**: niente texture fotografica di carta, niente bordi strappati,
niente ombre "foglio sollevato". La "cartità" nasce da: margini di libro,
raggio 0, blocchi composti a giustezza fissa, colophon, e dalla luce sul
rilievo. Il DOM è pulito come una pagina impaginata.

### P8 · Il vuoto è una scelta di marca
*Da: bugatti (sezioni a 120 px, un solo messaggio per schermata), mastercard (300-500 px di vuoto tra ritratto e sezione successiva).*
**In IMPRONTA**: tra una prova e l'altra c'è carta vuota abbondante (desktop
160-240 px, mobile 96 px come da creative director). Il vuoto è anche lo
strumento anti-stanchezza del giallo (vedi nota 5.3): più carta vuota, meno
"muro giallo", perché l'occhio legge il giallo come superficie e non come
segnale.

### P9 · Materiale credibile prima dell'effetto
*Da: studi WebGL premiati (Lusion, Active Theory, Igloo Inc).*
**In IMPRONTA**: la domanda di controllo per il webgl-artist è "sembra carta
vera fotografata con luce radente, o sembra uno shader?". La risposta giusta è
ottenuta con poco: luce una sola, bassa, calda; ombre del solco corte e morbide;
niente riflessi speculari sulla carta (la carta è opaca: speculare solo sulla
lamina).

### P10 · L'interfaccia cambia materiale, non layout
*Da: specimen delle fonderie (cambi l'asse e cambia tutto il testo), claude (ritmo tra superfici).*
**In IMPRONTA**: scegliere la carta cambia il fondo dell'intero sito e i
colori di luce, ombra e inchiostro; **la composizione non si muove**. Nessuna
sezione si ridispone, nessun elemento entra o esce. È un gesto da bottega (cambi
il foglio sotto la stessa forma) e comunica che il layout è "la forma di
stampa", fissa.

### P11 · Il movimento ha una causa fisica leggibile
*Da: la tradizione dei siti tattili premiati: il movimento imita una forza (peso, pressione, attrito), non un'animazione.*
**In IMPRONTA**: ogni movimento del sito deve rispondere a "chi lo spinge?".
La luce: il tuo cursore o il telefono. Il rilievo: la pressa. Il colore: la
carta che assorbe dal punto toccato. Il filo: lo scorrimento. Se un movimento
non ha una causa (per esempio un'icona che pulsa), si toglie.

---

## 3. Pattern inflazionati da evitare nel 2026 (15)

I primi otto vengono dalla ricetta bocciata in `docs/concept-lab.md` (e sono
quindi divieti assoluti), gli altri dalla sezione 9 della skill e da quello che
oggi rende un sito "Awwwards di maniera".

1. **Titolo serif corsivo + sottotitolo sans** (Cormorant, Playfair, Fraunces,
   Instrument Serif corsivo). Vietato anche il corsivo di Anybody.
2. **Occhielli numerati "01 ·", "02 ·" e maiuscoletto spaziato o monospace**
   come etichetta di sezione. Il nome di sezione, se serve, è una parola in
   Anybody largo minuscolo attaccata al titolo.
3. **Griglia di schede bianche con bordino e ombra leggera**, e le sue varianti
   (bento, tre colonne uguali, card su carta).
4. **Stesso reveal ovunque** (fade-up + leggera traslazione). L'unico ingresso
   è la pressione, e solo sui blocchi premuti.
5. **Onde, filetti, divisori decorativi** tra le sezioni.
6. **Mappa disegnata a mano** al posto del link alla mappa vera.
7. **Prenotazione a passi che finisce in "cartolina", "scontrino",
   "certificato" o busta che si chiude.** La chiusura è la prova che resta
   premuta e una frase.
8. **Figure umane, mani, torchi e caratteri mobili disegnati in SVG.**
9. **Estetica "risograph / fuori registro" rosa e blu con grana**: è stata la
   moda editoriale di Dribbble per anni (ed è la direzione A scartata).
10. **Grana di rumore a tutto schermo sopra ogni cosa** (il filtro "film grain"
    fisso, spesso animato). Da noi la fibra esiste solo come *materiale* della
    carta nello shader, statica e quasi invisibile, mai come velo sopra il testo.
11. **Testo gigante a tutta larghezza che fa da poster** (una parola che tocca i
    due bordi, spesso con marquee infinito sotto). Vedi nota 5.1.
12. **Cursore custom, cerchio che segue il mouse, bottoni magnetici, testo che
    scappa dal cursore.** Qui è la luce a rispondere, non un oggetto sotto al
    puntatore.
13. **Preloader a percentuale, intro che dura più di 1,5 s, "Scorri per
    esplorare" o icona di rotella del mouse.**
14. **Metallo "olografico" o oro sfumato con effetto glow** sui titoli, e
    qualunque testo con gradiente. La lamina è argento opaco satinato, riflesso
    stretto, solo su tre elementi.
15. **Ornamenti da "finto artigiano"**: timbri, "Est. 1956", "Handcrafted in
    Pordenone", etichette poetiche ("dal bancone", "note di bottega"),
    coordinate GPS, orari e meteo nella barra, strisce decorative in fondo
    all'hero, scritte verticali ruotate, trattini lunghi nei testi.

Nota su un pattern che **sembra** inflazionato ma non lo è qui: la sezione
pinned delle tecniche. Lo scroll-pinned è comune, ma diventa banale solo quando
dentro "entrano" testi e immagini. Qui dentro cambia solo il materiale della
stessa parola: va bene, a patto che il pin non superi circa 3 altezze di
schermo su desktop e 2,5 su mobile.

---

## 4. Tabella rapida: prendere / non prendere

| Dal riferimento | Prendere | Non prendere |
|---|---|---|
| lamborghini | larghezza come gerarchia, interlinea 0,9, raggio 0 | maiuscolo urlato ovunque, fondo nero, video hero |
| theverge | colore pieno e piatto, display solo grande | pillole arrotondate, mono maiuscolo per etichette, doppio accento neon |
| bugatti | un accento solo o nessuno, vuoto come marca | maiuscolo spaziato, serif per il corpo |
| mastercard | tono su tono come secondo livello, fondo tinto | cerchi, orbite, raggi enormi, puntino arancione negli occhielli |
| wired | pagina stampata senza texture, niente ombre | serif display, filetti tra le righe |
| claude | ritmo di superfici | serif display, crema (colore già usato da 1, 3, 8) |

---

## 5. Note specifiche sui tre rischi del concept

### 5.1 Tipografia variabile a larghezza estrema senza sembrare un poster generico

Il rischio: Anybody a larghezza 150 e peso 900 a tutta pagina è esattamente il
"poster tipografico" che si vede ovunque dal 2022 (parola gigante che tocca i
bordi, spesso con marquee e con larghezza che "respira" allo scroll).

Cosa lo distingue qui:

- **La parola non tocca i due bordi.** Sta in un *blocco composto* con margini
  di libro: margine esterno largo, parola allineata al margine interno. Un
  poster riempie il foglio; una prova di stampa rispetta i margini. Questa è la
  differenza visiva più forte e costa zero.
- **La larghezza è pilotata da una causa (la pressione), una volta sola.**
  Niente "respiro" continuo degli assi, niente larghezza legata alla velocità
  di scroll, niente animazione lettera per lettera in loop. L'asse passa da 120
  a 150 quando la pressa scende e poi sta fermo. È la differenza tra
  "tipografia variabile come giocattolo" e "tipografia variabile come
  materiale".
- **Minuscolo.** Il poster generico è maiuscolo. *impronta* in minuscolo, largo
  e pesante, legge come parola stampata su un biglietto, non come headline.
- **Contrasto di scala con il testo vero accanto.** Sotto la parola a secco c'è
  una frase in inchiostro piccola e composta con cura (Hanken 18-22 px). Il
  poster non ha testo; la pagina stampata sì. Il rapporto tra i due è il
  design.
- **Mai più di una parola gigante per schermata**, mai due sezioni consecutive
  aperte da una parola gigante. Le altre sezioni si aprono con titoli a
  larghezza 100, peso 700, di dimensione "da pagina" (40-64 px desktop).
- **Su 375 px**: meglio ridurre la larghezza dell'asse (fino a 110-120) che
  spezzare la parola; spezzare "impron-/ta" solo se proprio necessario, perché
  la sillabazione forzata a caratteri enormi è un tic da poster.
- **Controllo di qualità**: coprire l'area del titolo con la mano. Se la pagina
  che resta sembra ancora un biglietto ben composto, è giusta; se resta vuota e
  senza struttura, il titolo stava facendo da poster.

### 5.2 Shader di rilievo e luce radente senza sembrare una "demo WebGL"

Il rischio: normal map + luce che segue il mouse è il primo esercizio di chi
impara gli shader. Si riconosce subito: luce troppo forte e bianca, ombre nere
e lunghe, riflessi lucidi su tutto, carta che sembra plastica, rilievo che
"gira" troppo al minimo movimento.

Regole per stare dalla parte della fotografia e non della demo:

- **Carta opaca.** Sulla carta solo diffusione (niente speculare); lo speculare
  vive solo sulla lamina. La plastica nasce dallo speculare sulla carta.
- **Luce calda e bassa, non bianca.** I colori di luce e ombra sono quelli
  della tabella del creative director (per il Citrino luce `#F5E97E`, ombra
  `#9C8A1E`), cioè tinte della carta stessa. Mai grigio o nero puro nell'ombra:
  un'ombra neutra su giallo diventa verdastra e sporca.
- **Rilievo poco profondo e smusso morbido.** La stampa a secco vera ha
  profondità di frazioni di millimetro: l'ombra del solco deve essere corta (pochi
  pixel anche a 150 px di corpo). Un rilievo profondo sembra plastilina o
  metallo stampato.
- **Escursione limitata della luce.** L'azimut segue il cursore, ma
  l'elevazione resta bassa e quasi fissa (18-25°). Se la luce può andare "sopra"
  la carta, il rilievo sparisce e poi ricompare di colpo: effetto demo.
  Consiglio: limitare anche l'azimut a un arco (circa 90-100° attorno a 135°)
  invece del giro completo, come fa chi inclina un foglio sotto una lampada.
- **Inerzia, non inseguimento.** Il lerp lento già previsto (0,08) è corretto:
  la luce deve arrivare dopo il cursore, come una lampada spostata a mano.
- **Fibra quasi invisibile.** Il rumore della carta deve vedersi solo in luce
  radente e solo da vicino (ampiezza minima, scala fine, statico). Se si vede
  la fibra a colpo d'occhio, è un filtro.
- **Nessuna "scena".** Niente camera che si muove, niente profondità di campo,
  niente particelle, niente post-processing (bloom, aberrazione cromatica,
  vignetta). Un piano, una luce, un materiale. È questa povertà di mezzi che
  lo fa sembrare vero.
- **Il DOM resta sopra e nitido.** Il testo di lettura è sempre DOM vero, mai
  renderizzato nella texture: così resta nitido, selezionabile, accessibile, e
  la parte WebGL non "sfoca" mai l'informazione.
- **Il fallback CSS è parte del design**, non un ripiego: se con due
  `text-shadow` tinte della carta la pagina è già bella, lo shader aggiunge
  solo la luce che si muove. Se senza shader la pagina è brutta, lo shader sta
  facendo da stampella.
- **Controllo di qualità**: screenshot fermo dell'hero senza cursore. Deve
  sembrare la foto di un biglietto di cotone fatta in bottega. Se sembra un
  frame di un tutorial di Three.js, ridurre luce, profondità e contrasto.

### 5.3 Usare un colore di carta forte (citrino) senza stancare

Il rischio: un giallo saturo a tutto schermo per 8 sezioni stanca, fa "cantiere"
o "segnaletica", e su alcuni schermi vira al verde acido.

- **Il giallo è la carta, non un colore di interfaccia.** Non esistono bottoni
  gialli, link gialli, bordi gialli, icone gialle. Tutto ciò che è interattivo
  è in inchiostro verde notte o in lamina. Così l'occhio non deve "decidere"
  continuamente cosa è cliccabile.
- **Tinta un po' spenta, non limone.** `#E4CF3F` va bene perché ha una punta di
  grigio/ocra; evitare di "ravvivarlo" verso `#FFE500` o simili: un giallo
  puro è segnaletica. Verificare su uno schermo con gamma P3 che non diventi
  fluo.
- **Il vuoto e il testo scuro rompono la massa.** Il verde notte `#17231D` è
  quasi nero e caldo: blocchi di testo in inchiostro con buona giustezza creano
  "zone scure" che fanno riposare l'occhio. Pagine con poco testo e tanto giallo
  vuoto stancano meno di pagine con tanto testo piccolo sul giallo.
- **La luce varia il giallo.** Il rilievo e la fibra fanno sì che il fondo non
  sia mai un campo digitale piatto al 100%: nelle zone illuminate tende a
  `#F5E97E`, nei solchi a `#9C8A1E`. Questa variazione minima è ciò che rende
  un colore forte "materiale" invece che "schermo".
- **L'utente può cambiare carta**: è la valvola di sfogo del concept. Il banco
  di prova e la sezione carte rendono naturale passare a Cotone o Grafite; il
  sito non deve però mai cambiare carta da solo.
- **Una carta per schermata.** Evitare che il citrino conviva con altri fondi
  grandi (salvo i tre pezzi di "Per chi", che sono oggetti piccoli appoggiati).
  Due campi di colore forti affiancati stancano il doppio.
- **Contrasto**: inchiostro `#17231D` su `#E4CF3F` è ampiamente sopra AA per il
  testo; il rischio vero è sul testo *secondario* se qualcuno lo schiarisce
  (grigio su giallo diventa illeggibile e sporco). Regola per l'art-director:
  sul citrino non esiste "testo grigio"; il secondario si fa con dimensione o
  peso, non con un colore più chiaro. Stessa verifica, carta per carta, per
  Cipria e Grafite.
- **Controllo di qualità**: scorrere l'intera pagina a velocità normale su
  telefono. Se a metà viene voglia di cambiare colore, servono più vuoto e
  blocchi di inchiostro più compatti, non un secondo colore.

---

## 6. Sintesi per l'ondata 2

- **art-director**: P2, P3, P4, P6, P7, P8 e le note 5.1 e 5.3. Nel DESIGN.md
  fissare le soglie (Anybody mai sotto 20 px, larghezza mai sotto 75, niente
  testo grigio sulle carte colorate, argento solo in tre posti).
- **webgl-artist**: P5, P9 e tutta la nota 5.2 (carta opaca, ombre tinte,
  rilievo basso, elevazione quasi fissa, niente post-processing).
- **motion-designer**: P10, P11 e i divieti 4, 12, 13. L'asse larghezza si
  muove una volta sola per blocco.
- **interaction-designer**: P1, P11, divieto 12. Niente cursore custom.
- **copywriter**: P1 e divieto 15 (niente etichette poetiche, niente "Est.").
- **Da rifare quando la rete lo permette**: /taste su 3-5 siti (una fonderia
  con specimen interattivo, uno studio di letterpress, un sito WebGL premiato
  con un solo materiale) per sostituire la sezione 1.3 con misure vere.
