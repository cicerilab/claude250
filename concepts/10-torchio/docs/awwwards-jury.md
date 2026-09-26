# Awwwards jury · Concept 10 · IMPRONTA · Giro 1

Ondata 4 (QA). Nessun file sorgente toccato. Metro di giudizio: **Site of the
Day**, non "sito carino". Confronto con il livello approvato (concept 1-9) e con
la ricetta bocciata (concept 10-20, `docs/concept-lab.md`).

Materiale guardato davvero (Read sugli screenshot del responsive-tester):
tutte le 14 schermate a 375 e a 1440 (giro GL), le pagine intere
`full-1440-a/b/c` e `full-375-a/b/c`, a 768 `01`, `02`, `06c`, a 2560 `01`,
`02`, `04`, `06b`, `07`, in fallback `gl0/1440/01`, `gl0/1440/06d`,
`gl0/375/02`. Riferimenti: `docs/concept-attuali/concept-1, 4, 7, 10, 15.jpg`.
Letti: `docs/creative-director.md`, `DESIGN.md`, `docs/responsive-tester.md`,
`docs/accessibility-auditor.md`, `docs/performance-auditor.md`,
`docs/cross-browser-tester.md`, `docs/seo-engineer.md`, `docs/tech-architect.md`
§4, `design-taste-frontend` §4, §9, §10.

---

## 0. Verdetto in una riga

Il concept è il più originale del Lab dopo MERIDIANA (carta satura come
interfaccia, luce radente, il sito che cambia carta, la leva da tenere premuta):
la **ricetta bocciata non c'è**. Ma l'esecuzione è timida e a tratti grezza: il
rilievo, che è l'unico "oggetto" del sito, è quasi invisibile proprio dove
deve colpire (hero, banco); il primo schermo è mezzo vuoto; i bottoni in
"lamina" sembrano bottoni grigi di sistema; appena si sceglie Cotone il sito
diventa un modulo bianco a schede con bordino. Oggi è un **6,5**: da
"honorable mention", non da SOTD. Tutto sotto 8, torna indietro.

| Categoria | Voto |
|---|---|
| **DESIGN** | **6** |
| **USABILITÀ** | **5,5** |
| **CREATIVITÀ** | **7,5** |
| **CONTENUTO** | **7** |

---

## 1. Voti per categoria, con motivazione

### DESIGN · 6

Cosa funziona
- Palette mai vista nel Lab: Citrino pieno + verde notte + argento. Nessun
  crema, nessun rosso. Anybody largo 800-900 in minuscolo ha carattere e non
  somiglia a nessuno dei 1-9 (il 4 è grottesco svizzero maiuscolo, qui è
  espanso e morbido).
- Raggio zero coerente, ombre tinte, niente glow: la disciplina del
  `DESIGN.md` si vede.
- La sezione "La carta" a 1440 (quattro strisce a vivo) è l'unico momento in
  cui la pagina ha un impatto da poster: prova che il sistema può funzionare.
- I tre pezzi di "Per chi" sono oggetti appoggiati, ruotati, a scala diversa:
  non sono tre card.

Cosa lo tiene a 6
1. **L'oggetto firma è quasi invisibile.** Nell'hero a 1440 (GL) *impronta*
   è un rilievo morbido e sfocato a basso contrasto (luce `#F5E97E` / ombra
   `#9C8A1E` su `#E4CF3F`, bordi impastati): si legge come un watermark, non
   come carta premuta dal torchio. Nel fallback `gl0/1440/01` è addirittura
   più nitido che col GL: la versione "wow" è peggio del ripiego. Nel banco
   (Citrino, `1440/06a`) "Chiara Zanin" a secco è praticamente illeggibile,
   la prova sembra un rettangolo vuoto.
2. **Vuoti inspiegati** (AI tell 9.C "floating elements with awkward gaps"):
   hero con 230 px vuoti in basso a 1440, metà schermo vuota a 2560 (y 600-1440)
   e 380 px vuoti tra parola e titolo a 768; banco dopo la leva con ~400 px di
   niente a 1440 (`06c`); legatoria fine con 250 px sopra e sotto; pagina
   intera 1440: ~1600 px di carta vuota tra la fine delle tecniche e "Tocca
   prima di scegliere" (anche tolta la corsa del pin, il salto è enorme).
   Il `DESIGN.md` parla di "carta che respira", ma qui il vuoto non ha un
   peso compositivo: non c'è niente che lo tenga in tensione.
3. **Bottone "lamina" = bottone grigio di Windows.** Sfumatura lineare
   `#DDE1E5 → #A7AEB5` a 100° con filo nero 1 px (`hero`, `testata`, `per-chi`,
   `legatoria`, `colophon`, leva): senza riflesso, senza grana, senza risposta
   alla luce, è il "bottone argento a gradiente" generico. Su Cotone (quasi
   bianco) sparisce del tutto. La lamina doveva essere il lusso del sito.
4. **Il sito su Cotone diventa un template.** Dopo la scelta di Cotone
   (`1440/06b`, `full-1440-b`, `2560/06b`) il banco è una griglia di
   **schede bianche con bordino sottile e ombra corta**: "biglietto /
   partecipazione / carta intestata / libro", "a secco / a un colore /
   lamina", "50 / 100 / 150 / 250 / 500 / 1.000", "entro 15 giorni /
   entro un mese / più avanti". È esattamente la voce della ricetta vietata
   "griglie di schede bianche con bordino sottile e ombra leggera".
5. **Gerarchie piatte** nella seconda metà: bottega e colophon sono liste di
   link sottolineati e righe Hanken 15 px su fondo grigio chiaro; "Le
   macchine" è un elenco a due colonne da scheda tecnica; il colophon ha tre
   colonne di testo piccolo alla stessa altezza. Nessun punto focale.
6. **Split-header** (tell §4.7) in Tecniche a 1440: titolo grande a sinistra
   e "Stessa parola, stessa carta…" a destra, sollevato di 30 px rispetto a
   tutto il resto. E in Carta l'intro è rientrata di 100 px rispetto al
   titolo (x 187 contro 86): sembra un errore.
7. **Testo verticale ruotato** nelle strisce della Carta (`writing-mode:
   vertical-rl`, "Citrino", "Cotone"... a 1440 e 2560): tell §9.F e divieto
   esplicito del creative director §4.5 ("Niente scritte verticali ruotate").
8. Testata desktop non simmetrica: il marchio parte a 285, "Prova la tua"
   finisce a 1267 e lascia 173 px vuoti a destra, "Torna in Ciceri Lab" in
   monospace crema spinge tutto fuori asse (quest'ultimo è del sito, ma la
   testata non lo compensa).

### USABILITÀ · 5,5

- **Bug visibili**: sigillo del colophon = rettangolo grigio pieno in fallback
  a tutte le larghezze (`full-1440-c`, `full-375-c`); copertina "Sul Noncello"
  vuota col GL a 2560 e titolo tagliato a destra ("Noncellc") a 1440/2560;
  nome della prova sdoppiato dopo l'invio (`gl0/1440/06d`, `375/06d`).
- **Sovrapposizioni dei fissi**: a 375 "Prova la tua" fisso sopra quello
  della scheda del per-chi (due bottoni uguali uno sopra l'altro,
  `375/02`), "Torna in Ciceri Lab" sopra le frecce della fila; a 768 la
  lastra sticky copre la leva (`768/06c`); a 375 dopo l'invio la lastra
  sticky copre l'inizio della frase "Ricevuto…" (`375/06d`: si legge
  "esatto e ti spediamo…").
- **CTA duplicati**: "Prova la tua" appare in testata, hero, sotto ognuno dei
  tre pezzi, in legatoria, nel colophon e nel segnapagina: 8 bottoni uguali
  nella pagina, fino a 3 nello stesso schermo a 2560 (`2560/02`). Il CD voleva
  "un solo richiamo" in menu, hero e piede.
- Dall'accessibilità: 4 problemi "alti" (link "cos'è?" coperto nel banco,
  fuoco coperto dai fissi, reflow al 400% rotto da lastra e pin, **rischio
  lampeggio** cambiando carta a raffica con le frecce: WCAG 2.3.1, e il brief
  di Luca vieta gli effetti lampeggianti).
- Dal performance: scrittura a 30 Hz di `--imp-luce-x/y` e layout forzati a
  ogni tasto nel banco (INP).
- Navigazione: a 1440 la voce corrente resta "lavori" durante tecniche e
  carta (`1440/03a-c`, `04`): l'utente non sa dove si trova.
- Il toggle "luce" nell'hero galleggia a 800 px, fuori da ogni allineamento,
  e non si capisce cosa faccia.
- Bene: niente scroll orizzontale, zero errori console su tre motori, leva
  con alternativa da tastiera, stati di errore del banco scritti.

### CREATIVITÀ · 7,5

- Idea forte e davvero del mestiere: la luce radente come controllo, la carta
  scelta che diventa la carta del sito, il preventivo che è una prova di stampa
  e si chiude tenendo premuta una leva, il nome dell'utente che torna
  nell'hero (`full-1440-a`: "Stefano Brun" al posto di *impronta*). Nessun
  altro dei 20 concept ha un'interazione così legata al prodotto.
- Il filo della legatoria che disegna il vero percorso di cucitura è un
  contenuto, non un decoro: bella scelta.
- Perché non 8+: la creatività è nel documento più che nello schermo. Negli
  screenshot il momento "wow" non arriva mai a piena potenza: il rilievo è
  timido, la "pressa che scende" non si percepisce, l'onda di carta non ha un
  fotogramma memorabile, la leva è una barra grigia con un cerchio. Un giurato
  Awwwards scorre e vede un sito giallo con titoli neri: deve vedere **carta
  vera sotto una lampada**.

### CONTENUTO · 7

- Italiano concreto e di bottega: grammature, formati, "100 con busta, da
  390 €", "Cliché per la lamina 80 € al posto della lastra", "Teniamo la
  lastra due anni", "lunedì chiuso, si stampa a porta chiusa", "Mandi,
  Marta". Livello dei migliori 1-9.
- Contro:
  - **Placeholder visibili**, vietati dalle regole di Luca (§6 "niente
    placeholder visibili") e tell 9.D (numeri finti perfetti):
    "0434 000 000" composto **a 60 px** in Anybody come elemento principale
    della bottega, "bottega@impronta.example", "stefano.brun@studio.example".
  - "chiuso adesso" in grigio velato a 60 px: lo stato dell'orario è
    l'informazione più grande della sezione e dipende dall'ora dello scatto
    (alle 0.46 il sito dice "chiuso" in caratteri da manifesto).
  - Troppa copia di servizio ripetuta (prezzi e tempi ripetuti tra legatoria,
    banco e bottega) e micro-frasi sotto i titoli (tell §9.F "micro-meta
    sentences").
  - SEO P3: title e description si presentano come bottega vera.

---

## 2. Voti per sezione e difetti visivi

### Testata · 6
- **1440**: marchio IMPRONTA in lamina stretto e piccolo (20 px) con
  gradiente che a DPR 1 diventa grigio sporco; nessuna relazione con la
  gabbia (marchio a x 285, contenuto a x 86). "Prova la tua" della testata
  con gradiente a 100° = bottone di sistema. Voce corrente sbagliata in
  Tecniche e Carta ("lavori").
  *Da fare*: marchio sull'asse del margine interno (x 86) e più grande (26-28 px,
  wdth 150), voce corrente per sezione vera (aggiungere "tecniche" e "carta"
  oppure nessuna voce accesa), testata chiusa sul margine esterno simmetrico.
- **375 / 768**: "la pressa" in Anybody 22 px a destra come segnapagina in alto
  è una bella idea, ma "indice ▴" in 13 px sopra è troppo piccolo e il
  triangolo punta in su per aprire un menu che scende.
- Tell: bottone argento a gradiente (vedi §3).

### Hero · 5
- **1440 (GL)**: *impronta* a secco morbida e sfocata, contrasto quasi nullo;
  sotto 230 px vuoti; il toggle "luce ◐" isolato a x 780-855 senza
  allineamento; un solo bottone grigio. Il primo schermo non comunica "carta
  spessa premuta": comunica "sito giallo".
- **768**: 380 px di carta vuota tra la parola e il titolo (y 190-570): è metà
  schermo, legge come bug.
- **2560**: metà inferiore dello schermo vuota; la parola resta a 1377 px
  (pagina max 1680) e sembra piccola su 2560.
- **375**: *impronta* a 40 px di corpo, 250 px vuoti sotto, il titolo parte a
  y 405. È un'intestazione, non la pressa.
- *Da fare (art director)*: la parola a secco deve essere **l'oggetto**, non
  una scritta sopra al titolo. Portarla ad altezza 38-45% del viewport,
  rilievo profondo e nitido (ombra `--imp-carta-ombra` al 100% sul lato in
  ombra, labbro di luce 1,5 px netto, niente blur oltre 1 px nello step di
  smusso), luce di riposo più radente (elevazione 14-16°, non 22°). Il titolo
  in inchiostro va agganciato alla parola (24-40 px sotto il piede della p),
  non a metà pagina. A 768 e 375 la parola a wdth 100 va spezzata su due righe
  "impron / ta" a tutta area viva (circa 110 px di corpo a 375) invece di
  restare 40 px. A 2560 hero `min-block-size` = 100svh con contenuto
  distribuito: parola in alto, titolo e bottone ancorati al piede del primo
  schermo. Il toggle luce va nella testata o accanto alla parola, allineato
  alla gabbia, con etichetta ("sposta la luce").

### Per chi · 6,5
- **Bene**: oggetti veri appoggiati, partecipazione con busta, rotazioni
  diverse. Il migliore momento compositivo della pagina.
- **1440**: "Sul Noncello" tagliato ("Noncellc"); il biglietto Cotone è
  minuscolo (215 px) e sta in basso al centro: il salto di scala è troppo
  forte, sembra dimenticato; copertina Grafite enorme e vuota sotto il titolo;
  i testi sotto i pezzi sono tre colonne di testo quasi uguali
  (titolo 30 px + riga + nota grigia + prezzo + bottone ×3) = la struttura
  della card tornata dalla finestra.
- **2560**: copertina completamente nera (bug GL); tre "Prova la tua" in fila.
- **375**: il carosello mostra 1 pezzo e mezzo, ma il bottone fisso "Prova la
  tua" sta sopra quello della scheda; le frecce "‹ ›" sono coperte.
- *Da fare*: un solo invito, non tre bottoni: il pezzo stesso è cliccabile
  ("prova questo sul banco" come link testuale sotto il prezzo). Composizione
  a 1440: biglietto portato a 300-320 px e sovrapposto per 40 px alla
  partecipazione (sono sul bancone, si toccano), copertina ridotta al 70% e
  con autrice e collana stampate in basso per riempire il nero. Testi di
  accompagnamento a due righe come didascalie da catalogo, con altezze e
  allineamenti diversi, non tre blocchi identici.

### Tecniche · 6
- **Bene**: l'idea "la stessa parola, quattro volte" è chiara; "a un colore"
  (inchiostro nel solco) è l'unica resa davvero materica del sito.
- **1440**: split-header con il paragrafo destro sollevato; lastra grande
  (780×500) con la parola al centro che occupa il 60%: tanto campo vuoto e
  un rilievo "a secco" pallido; "taglio colorato" reso come **filetto nero**
  intorno a un rettangolo in prospettiva storta: sembra un wireframe, non un
  cartoncino con il bordo dipinto. Indice con triangolo "◄" di testo.
- **375**: il titolo della sezione non è nel pin (si entra e si vede solo la
  barra delle tecniche e un rettangolo), 120 px vuoti sopra e sotto la lastra.
- *Da fare*: togliere il paragrafo destro (va sotto al titolo o via).
  Lastra meno alta (16:9 → 3:2 più piccola) e parola più grande (85% della
  larghezza). Taglio colorato: mostrare una **pila** di 6-8 biglietti di
  Cotone vista di tre quarti con il taglio in Citrino pieno (spessore 6-8 px
  per foglio), non un contorno. Lamina: il riflesso deve passare davvero
  sulla parola durante lo scroll (è il fotogramma da mettere nella
  thumbnail). A 375 tenere il titolo H2 nel pin, in alto, 30 px.

### Carta · 7
- **Bene**: a 1440 le quattro strisce a vivo sono il momento più forte del
  sito; costa proporzionale alla grammatura è un dettaglio da mestiere.
- **Difetti**: testo verticale ruotato (divieto CD + tell); intro rientrata di
  100 px senza motivo; a 1440 metà superiore delle strisce vuota e
  informazioni tutte schiacciate in basso; a 2560 le strisce non sono più a
  vivo (1312 px su 2560, centrate) e perdono il loro senso; a 375 le fasce
  hanno la parola a secco a sinistra e il testo a destra: ordinato ma da
  listino.
- *Da fare*: il nome della carta a secco **orizzontale**, enorme, che esce
  dalla striscia e viene tagliata dal bordo (come un campione tagliato dal
  foglio); a 2560 strisce sempre a vivo (100vw). Intro allineata al margine
  interno.

### Legatoria · 6
- **Bene**: il filo con i veri punti di cucitura è onesto e bello.
- **1440**: il disegno sta in una colonna di 280 px a sinistra, schiacciato,
  con numeri "1 2 3 4" in grigio che sembrano le quote di un disegno tecnico;
  la colonna destra ha i testi larghi 560 px e un grande vuoto a destra;
  prezzo "6 €" enorme in Anybody accanto a una riga 15 px ("da 6 € a copia,
  su 100 copie") che ripete il numero. Fine sezione: 250 px vuoti, poi
  quattro scelte a tile giallo chiaro (brossura/cartonato/giapponese/punto
  metallico) che **sono di nuovo schede con bordino**, e un altro "Prova la
  tua".
- **375**: tutto il testo rientra di 56 px per lasciare posto al filo
  verticale: la colonna si stringe a 280 px e il filo è solo una riga.
- *Da fare*: il filo come protagonista a tutta area viva: il dorso di un
  libro aperto a 1440 disegnato a 500-600 px di altezza, i nomi delle legature
  agganciati ai punti del filo (non in una colonna parallela). Eliminare la
  ripetizione del prezzo. Eliminare il gruppo di scelte in fondo (duplica il
  banco) o trasformarlo in un link testuale al banco.

### Banco di prova · 5
Il cuore del sito, e la sezione più debole visivamente.
- **1440 Citrino** (`06a`): la lastra è un riquadro di 580×500 con un bordino
  scuro e dentro un rettangolo dello stesso giallo con "Chiara Zanin" a secco
  illeggibile. Il visitatore vede un **riquadro vuoto**. Il compositoio a
  destra è una griglia di tile giallo chiaro con bordino.
- **1440 Cotone** (`06b`, `06c`): tutto diventa bianco/grigio: tile bianche con
  bordino e ombra corta (ricetta vietata), campi bianchi su bianco, la prova
  con "Stefano Brun" in lamina grigio chiaro su bianco, prezzo in lamina
  "295 €" grigio su grigio. Leva = barra con gradiente argento e un cerchio:
  non è una leva, non è un torchio.
- **Successo** (`gl0/1440/06d`): nome sdoppiato; la frase "Ricevuto…" +
  "Mandi, Marta" + bottone bordato: il momento emotivo del sito (la pressa
  scende sul tuo nome) passa inosservato.
- **375**: la lastra sticky con "Totale indicativo 295 €" + prova piccola;
  dopo l'invio copre la prima riga del messaggio; a 768 copre la leva.
- **Vuoto** di ~400 px sotto la leva a 1440.
- *Da fare*:
  1. La prova è l'eroe: il biglietto a **scala 1:1 fisica** o più (85 mm a
     1440 ≈ 450-500 px), luce radente forte, rilievo netto. Niente riquadro
     con bordino intorno: il biglietto sta direttamente sulla carta del sito
     con la sua costa e ombra di appoggio.
  2. Le scelte non sono tile: *Cosa stampi* come i quattro formati **disegnati
     in scala** uno accanto all'altro (85×55, 148×105, A4, 150×210: si sceglie
     toccando la sagoma); *Quante* come numeri grandi in Anybody su una riga,
     con la scelta sottolineata da una riga premuta 3 px, niente box;
     *Quando* come testo in riga. *La carta* va bene (campioni con costa).
  3. Su Cotone e Cipria le superfici "sollevate" (campi) devono avere una
     tinta propria (Cotone: `#E6E6E1`, non bianco), altrimenti il banco sparisce.
  4. La leva: un vero manico tondo in lamina su una **guida** incisa nella
     carta (solco), che scende verticalmente o scorre a destra; mentre la
     tieni il biglietto affonda e la luce lo mostra. È il momento da video.
  5. Successo: la prova resta, si toglie il riquadro, il nome si imprime una
     volta ancora in profondità piena (senza sdoppio), la frase va **sopra**
     la lastra su mobile.

### Bottega · 6
- **Bene**: indirizzo a secco in Anybody largo, orari scritti come un
  tipografo, "chiuso, si stampa a porta chiusa".
- **Difetti**: indirizzo a secco su Cotone quasi invisibile e ripetuto
  (piccolo sopra, grande sotto: due volte la stessa informazione una sopra
  l'altra); "0434 000 000" gigante e sottolineato: il placeholder è l'elemento
  più grande della sezione; "chiuso adesso" in grigio velato 60 px; "Chi c'è"
  con i nomi Marta/Franco/Elia in Anybody 60 px e il ruolo in 15 px a 360 px
  di distanza (gerarchia rovesciata, sembra una lista di nomi); "Le macchine"
  = due colonne di voci a elenco, da scheda tecnica.
- *Da fare*: composizione da frontespizio vera: indirizzo a secco **una
  volta**, grande, con il suo gemello in inchiostro piccolo **sotto** (non
  sopra); telefono in Hanken 20 px, non da manifesto, con un numero verosimile
  non tondo e non composto a 60 px; stato orario in una riga di testo;
  "Chi c'è" come tre righe di frase ("Marta compone e stampa, Franco rilega
  tre giorni a settimana…"); le macchine ridotte a 3 con una riga ciascuna,
  o tolte.

### Colophon · 4
- **Bug**: in fallback il sigillo IMPRONTA è un **rettangolo grigio pieno**
  1180×127 (tutte le larghezze). È il fotogramma finale del sito.
- Anche col GL (`1440/08`) il marchio a secco è pallido e alto 127 px con
  sotto tre colonne di testo 15 px: fine piatta. Due bottoni "Prova la tua" +
  "Ricomincia da capo" affiancati, indice di 7 link sottolineati impilati
  (tell: lista di link uguali), riga di recapiti con ".example".
- *Da fare*: correzione del bug (`url("${marchioUrl}")`); il colophon deve
  essere composto come l'ultima pagina di un libro: frase del colophon
  centrata **sull'asse della gabbia** in Hanken 21 px, marchio a secco sotto
  a larghezza piena ma con rilievo profondo, indice in una riga orizzontale
  separata da spazi, un solo bottone.

---

## 3. Ricetta vietata e AI tells trovati

| # | Cosa | Dove | Regola |
|---|---|---|---|
| 1 | **Schede bianche con bordino e ombra corta** in griglia | Banco su Cotone (cosa stampi, tecnica, quante, quando), 1440/2560/375 | ricetta vietata concept-lab; CD §4.5 "niente schede bianche con bordino" |
| 2 | **Bottone argento a gradiente lineare** con filo nero | tutti i "Prova la tua", leva | CD: "lamina sobria"; tell 9.A (effetto generico); su Cotone contrasto di forma nullo |
| 3 | **CTA duplicati** (8 "Prova la tua") | testata, hero, per-chi ×3, legatoria, colophon, segnapagina | skill §4.5 NO DUPLICATE CTA INTENT; CD §4.5 |
| 4 | **Testo verticale ruotato** | Carta, 1440/2560 | tell 9.F; CD §4.5 esplicito |
| 5 | **Split-header** con paragrafo fluttuante a destra | Tecniche 1440/2560 | skill §4.7 SPLIT-HEADER BAN, 9.F floating top-right sub-text |
| 6 | **Vuoti inspiegati** | hero 768/2560/375, banco sotto leva, legatoria fine, stacco tecniche→carta | tell 9.C, §4.7 hero |
| 7 | **Numeri finti perfetti / placeholder** | "0434 000 000" a 60 px, "@impronta.example" | tell 9.D; concept-lab regola 6 |
| 8 | **Gerarchia piatta, liste di link sottolineati** | colophon, bottega "le macchine" | tell 9.F liste; template di footer |
| 9 | **Tile giallo chiaro con bordino** come scelte | legatoria fine, banco su Citrino | variante gialla del punto 1 |
| 10 | **Righe con filetto sotto ogni voce** | carta (riga sotto "per tutto"), bottega | 9.F border su ogni riga (lieve) |
| 11 | Diagramma tecnico con numeri grigi "1 2 3 4" | legatoria | lieve: quote da disegno tecnico, non narrano |

Non trovati (bene): serif corsivo, occhielli "01 ·", maiuscoletto spaziato,
fade-up generalizzato, onde/filetti tra sezioni, mappa disegnata, figure
umane, cartolina/scontrino finale, em-dash visibili, cursore custom, glow.

---

## 4. Interventi per le categorie sotto 8 (ordinati per impatto)

### DESIGN (6)
1. Rilievo nitido e profondo ovunque (hero, prova, bottega, colophon):
   meno blur nello smusso, ombra piena, luce di riposo 14-16°. → webgl-artist
   (`webgl/presets.ts`, `maskPainter.ts`), art-director (`relief-fallback.css`)
2. Hero ricomposto: parola a secco come oggetto al 40% del viewport, titolo
   agganciato, niente vuoti a 375/768/2560, toggle luce allineato. →
   section-builder-hero (`hero.css`, `Hero.tsx`)
3. Banco ridisegnato senza tile: formati in scala, quantità in riga, prova 1:1
   senza riquadro, leva con guida incisa. → section-builder-banco (`banco.css`,
   `Compositoio.tsx`, `Prova.tsx`, `Leva.tsx`)
4. Lamina credibile: sfumatura a 3-4 fermate con banda di riflesso stretta,
   grana anisotropa, bordo chiaro/scuro invece del filo nero; variante per
   Cotone. → art-director (`relief-fallback.css` `.imp-lamina`, `tokens.css`)
5. Superfici su Cotone/Cipria con tinta propria (non bianco). → art-director
   (`tokens.css`)
6. Carta: niente testo ruotato, nome orizzontale tagliato dal bordo, strisce a
   vivo a 2560, intro allineata. → section-builder-carta (`carta.css`,
   `Carta.tsx`)
7. Tecniche: via lo split-header, lastra più compatta, taglio colorato come
   pila vera. → section-builder-tecniche (`tecniche.css`, `Tecniche.tsx`)
8. Legatoria: filo a tutta area, nomi agganciati ai punti, via le scelte in
   fondo. → section-builder-legatoria (`legatoria.css`, `Filo.tsx`)
9. Bottega e colophon ricomposti come frontespizio/colophon. →
   section-builder-bottega, section-builder-colophon
10. Testata: marchio sull'asse, voce corrente corretta. → section-builder-hero
    (`Testata.tsx`, `testata.css`)

### USABILITÀ (5,5)
1. Sigillo colophon grigio in fallback: `url("${marchioUrl}")`,
   `Colophon.tsx:78`. → section-builder-colophon
2. Un solo "Prova la tua" per schermo: via i bottoni dai pezzi, dalla
   legatoria e dal segnapagina quando un altro è visibile. →
   section-builder-per-chi, -legatoria, -hero (`Testata.tsx`)
3. Rischio lampeggio: un cambio carta ogni 400 ms (A4). → interaction-designer
   (`interaction/paperWave.ts`)
4. Fuoco coperto dai fissi (A2): `scroll-padding` + `scroll-margin`
   sull'input. → scaffold-engineer (`styles/base.css`), section-builder-banco,
   section-builder-hero
5. Reflow 400% (A3): lastra e pin statici con finestra bassa. →
   section-builder-banco, -tecniche, -hero
6. Lastra sticky che copre leva (768) e messaggio di successo (375); lastra
   ≤ 42svh tra 600-1023. → section-builder-banco (`banco.css`)
7. Copertina vuota col GL a 2560 e "Noncello" tagliato. → shader-engineer /
   art-director (`relief-fallback.css` per `fuori`), section-builder-per-chi
   (`per-chi.css`)
8. Nome sdoppiato dopo l'invio. → art-director (`.imp-caldo`) /
   section-builder-banco
9. Link "cos'è?" coperto nel banco (A1). → section-builder-banco
10. INP del banco (P2) e luce a 30 Hz (P1). → section-builder-banco
    (`Prova.tsx`), interaction-designer (`interaction/light.ts`)
11. Filo che non si cuce su Firefox (B1). → section-builder-legatoria
12. Frecce della fila coperte dai fissi (375, 768). → section-builder-per-chi

### CREATIVITÀ (7,5)
1. Rendere visibile la "pressa che scende" all'ingresso di hero e prova:
   corsa 0→1 più lunga (1,1 s), micro-compressione della carta intorno alle
   lettere, e un'ombra che si sposta. → motion-designer
   (`motion/usePressione.ts`, `choreography.ts`), webgl-artist
2. Leva come oggetto fisico con guida incisa e affondamento della prova. →
   section-builder-banco (`Leva.tsx`), interaction-designer
   (`useHoldToConfirm.ts`)
3. Riflesso della lamina che attraversa la parola nel pin delle tecniche e il
   prezzo del banco. → webgl-artist (`shaders/*.glsl`)
4. Onda di carta con fotogramma memorabile (bordo della nuova carta con costa
   visibile che avanza), sempre sotto 3 cambi/s. → interaction-designer

### CONTENUTO (7)
1. Via i placeholder visibili: telefono verosimile e non tondo (es.
   "0434 521 887" con nota "numero di esempio"), email senza ".example" (es.
   "bottega@impronta-pn.it" con disclaimer nel colophon, già presente). →
   copywriter (`content/testi.ts`)
2. "chiuso adesso" diventa una riga di testo, non un titolo. → copywriter +
   section-builder-bottega
3. Togliere le ripetizioni di prezzo e le micro-frasi sotto i titoli
   (legatoria "da 6 € a copia", banco intro). → copywriter
4. Title/description con "concept" (SEO P3). → copywriter

---

## 5. Interventi per agent (da girare)

| Agent | File | Interventi | Priorità |
|---|---|---|---|
| **section-builder-colophon** | `sections/Colophon/Colophon.tsx`, `colophon.css` | `url("${marchioUrl}")` riga 78; ricomporre come colophon da libro (frase sull'asse, marchio profondo, indice in riga, un solo bottone) | A |
| **section-builder-banco** | `banco.css`, `Compositoio.tsx`, `Prova.tsx`, `Leva.tsx` | via le tile con bordino (formati in scala, quantità e "quando" in riga); prova 1:1 senza riquadro; leva con guida incisa; lastra ≤ 42svh a 600-1023, non copre leva né successo; frase di successo sopra la lastra su mobile; A1, A2 (scroll-margin sugli input), A3, M2, M5, B3, B8; P2 INP; vuoto sotto la leva | A |
| **section-builder-hero** | `Hero.tsx`, `hero.css`, `Testata.tsx`, `testata.css` | hero ricomposto (parola oggetto, niente vuoti a 375/768/2560, toggle luce allineato); testata: marchio sull'asse della gabbia, voce corrente corretta, segnapagina "Prova la tua" nascosto quando un altro è in vista; A2 punto 3; A3 segnapagina; B5 | A |
| **art-director** | `styles/relief-fallback.css`, `styles/tokens.css`, `DESIGN.md` | lamina a 3-4 fermate con riflesso stretto e bordo chiaro/scuro (niente filo nero); superfici sollevate tinte su Cotone/Cipria; `.imp-caldo` senza sdoppio a pressione 1; regola per `data-imp-gl="fuori"`; rilievo di ripiego più nitido; P7 font | A |
| **webgl-artist** | `webgl/presets.ts`, `maskPainter.ts`, `shaders/*.glsl` | rilievo più profondo e netto (meno blur, ombra piena), elevazione di riposo 14-16°; riflesso della lamina che scorre davvero | A |
| **interaction-designer** | `interaction/paperWave.ts`, `light.ts`, `useHoldToConfirm.ts` | A4 un cambio carta ogni 400 ms; P1 luce non a 30 Hz; M3 dial; B2 leva; onda con costa visibile | A |
| **section-builder-per-chi** | `PerChi.tsx`, `per-chi.css`, `Pezzo.tsx` | via i tre "Prova la tua" (link testuale o pezzo cliccabile); "Noncello" dentro il pezzo; biglietto più grande e sovrapposto; copertina con autrice e collana; spazio sotto la fila per i fissi; M1 | A |
| **section-builder-carta** | `Carta.tsx`, `carta.css` | niente `writing-mode: vertical-rl` (riga 369): nome orizzontale tagliato dal bordo; strisce a vivo a 2560; intro allineata al margine interno; M4 | M |
| **section-builder-tecniche** | `Tecniche.tsx`, `tecniche.css` | via lo split-header; lastra più compatta e parola all'85%; taglio colorato come pila di biglietti; H2 nel pin a 375; A3 resa statica con finestra bassa; B2 | M |
| **section-builder-legatoria** | `Legatoria.tsx`, `legatoria.css`, `Filo.tsx` | filo protagonista a tutta area, nomi agganciati ai punti; via prezzo ripetuto e scelte finali con bordino; testo a 375 non rientrato di 56 px; B1 Firefox; B6 | M |
| **section-builder-bottega** | `Bottega.tsx`, `bottega.css` | indirizzo a secco una volta con gemello sotto; telefono in 20 px; stato orario in riga; "Chi c'è" come frase; macchine ridotte; B7 | M |
| **copywriter** | `content/testi.ts`, `content/prezzi.ts` | niente "0434 000 000" e ".example" visibili; togliere ripetizioni e micro-frasi; title/description con "concept" (SEO P3, P11) | M |
| **motion-designer** | `motion/usePressione.ts`, `choreography.ts` | discesa della pressa percepibile (1,1 s, compressione intorno alle lettere) su hero e prova | M |
| **shader-engineer** | `webgl/ImprontaGL.ts`, `blocks.ts` | copertina a 2560 (limite blocchi / maschera non cotta); P5 avvio in un task lungo; P6 atlante | M |
| **scaffold-engineer** | `styles/base.css`, `core/*` | A2 `scroll-padding-block`; P3 chunk | M |
| **vector-artist** | `assets/svg/*` | B4 id duplicato `freccia` | B |

### I 12 interventi a maggiore impatto

1. Rilievo nitido e profondo (è il prodotto del sito): **webgl-artist** +
   **art-director**
2. Banco senza schede bianche con bordino, prova 1:1, leva fisica:
   **section-builder-banco**
3. Hero ricomposto, niente mezzo schermo vuoto a 375/768/1440/2560:
   **section-builder-hero**
4. Sigillo del colophon grigio in fallback (`url("…")`) e colophon
   ricomposto: **section-builder-colophon**
5. Lamina credibile al posto del bottone argento a gradiente + superfici tinte
   su Cotone: **art-director**
6. Un solo "Prova la tua" per schermo: **section-builder-per-chi**,
   **-legatoria**, **-hero**
7. Rischio lampeggio dei cambi carta (WCAG 2.3.1): **interaction-designer**
8. Lastra sticky che copre leva e messaggio di successo, fuoco coperto dai
   fissi: **section-builder-banco** + **scaffold-engineer** (`base.css`)
9. Carta senza testo verticale ruotato, strisce a vivo a 2560:
   **section-builder-carta**
10. Copertina vuota a 2560 e "Noncello" tagliato: **shader-engineer** /
    **art-director** + **section-builder-per-chi**
11. Tecniche senza split-header, taglio colorato come pila vera:
    **section-builder-tecniche**
12. Placeholder visibili fuori ("0434 000 000" gigante, ".example"), bottega
    come frontespizio: **copywriter** + **section-builder-bottega**

Condizione per il prossimo giro: rifare gli screenshot a 375/768/1440/2560
su **Citrino e su Cotone** (il sito cambia carattere con la carta e il banco
va giudicato su entrambe), più il fotogramma della leva a metà corsa.

---

# Giro 2

Stesso metro (Site of the Day), stesso metodo. Materiale guardato davvero in
`qa/shots-g2/`:
- **1440**, tutte le sezioni su Citrino e Cotone, con il GL e in fallback
  (`gl0`): leva a metà corsa, successo, tecniche, per chi e colophon;
- **375**, tutte le sezioni sulle due carte (col GL, più `gl0` per leva,
  successo e bottega);
- **pagine intere** `full-1440-citrino-a/b/c` e `full-375-cotone-a/b`;
- **768**: hero e banco; **2560**: hero Cotone, carta, banco.

Letti il "Giro 2" di `docs/responsive-tester.md` e le sezioni "Giro 2" dei
builder. Come chiede l'orchestratore, la leva e il rilievo pieno li ho giudicati
sugli scatti `gl0`: col GL in SwiftShader alcune presse non arrivano in tempo.
Nota: accessibility, performance, cross-browser e SEO **non** hanno rifatto il
giro. Le correzioni A1-A4, P1-P3, B1 e M2-M5 sono dichiarate dai proprietari ma
nessun auditor le ha ancora verificate.

## Verdetto in una riga

Salto netto. Adesso il sito ha un primo schermo da poster e la sezione carta
è da SOTD. Il banco ha smesso di essere un modulo a schede: formati disegnati
in scala, campioni "st" per la tecnica, numeri in riga, leva con manico tondo
nel solco. La ricetta vietata è sparita anche su Cotone. Restano sotto 8 due
cose: il **ritmo** (legatoria e banco finiscono ancora in grandi vuoti) e un
paio di **disallineamenti del GL** visibili (bottega a 375, colophon a 1440).
E il rilievo a secco resta pallido proprio dove si guarda la prova (tecniche
"a secco", banco su Citrino).

| Categoria | Giro 1 | **Giro 2** |
|---|---|---|
| DESIGN | 6 | **7,5** |
| USABILITÀ | 5,5 | **7** |
| CREATIVITÀ | 7,5 | **8,5** |
| CONTENUTO | 7 | **8** |

## Voti per sezione

| Sezione | G1 | **G2** | Cosa è cambiato / cosa manca |
|---|---|---|---|
| Testata | 6 | **7** | Marchio centrato più grande, voce corrente giusta ("legatoria", "bottega"), "la pressa / il banco" a 375 funziona. Però il "Prova la tua" della testata è ora un **blocco verde notte pieno**, mentre nell'hero e nel colophon è in lamina: stessa azione, due bottoni diversi. A 375 "indice ▾" (13 px) resta minuscolo accanto a "la pressa" (22 px). |
| Hero | 5 | **8,5** | *impronta* su due righe ("impron / ta") che riempie il primo schermo, rilievo netto con parete scura e labbro chiaro; su Cotone sembra carta di cotone premuta davvero. A 375 e 768 non ci sono più vuoti. Lamina del bottone con banda di riflesso: credibile. Resta: il dial "luce ◐" galleggia da solo a destra, all'altezza del bottone, senza relazione con la parola. A 2560 l'hero va a vivo (x 79) mentre tutto il resto sta nella gabbia da 1680 (x 423): due allineamenti sinistri nello stesso schermo. |
| Per chi | 6,5 | **8** | Biglietto sovrapposto alla partecipazione come su un bancone, copertina con collana, titolo e autrice, un link "Prova la tua partecipazione ›" al posto dei tre bottoni. A 375 la fila con le linguette "partecipazione / biglietto / copertina" è chiara. Col GL il biglietto Cotone ha il nome a secco quasi invisibile (è corretto per la tecnica, ma il pezzo così sembra bianco): meglio un nome in lamina, come dice la didascalia. |
| Tecniche | 6 | **7,5** | Titolo e indice sulla stessa colonna: niente più titolo a sinistra con paragrafo fluttuante a destra. Il taglio colorato ora è un **cartoncino in prospettiva con il bordo dipinto** (giallo su Cotone). "A un colore" è bellissimo. Restano due difetti. Primo: "a secco" (lo stato con cui si entra) è una scritta pallida al centro di una lastra 680×450 quasi vuota; la lastra è ancora troppo grande per la parola (65% della larghezza). Secondo: su Citrino il taglio si vede come un bordo **scuro** (verde notte), non come un colore: perché si legga come "taglio colorato" il bordo deve essere di una tinta diversa dall'inchiostro. Il pin mostra anche lo stato "a un colore" mentre l'indice è già su "taglio" (`1440/03c-citrino`, GL): il testo è in ritardo di uno stato. |
| Carta | 7 | **9** | Nomi orizzontali giganti tagliati dal bordo del campione, strisce a vivo anche a 2560, intro allineata. A 375 le fasce orizzontali con "Citrino / Cotone" a secco sono il momento mobile migliore del sito. Resta solo un dettaglio: metà superiore delle strisce vuota a 1440 (i dati stanno tutti in fondo); ci starebbe il gemello in inchiostro della grammatura in grande. |
| Legatoria | 6 | **6,5** | Il filo ora attraversa la pagina e i nomi si agganciano ai punti con un tratteggio, le scelte a schede sono sparite, il richiamo finale è "Prova la tua" composto sul filo. Ma a 1440: ~250 px vuoti prima di "Prezzi su 100 copie" e ~240 dopo, con in mezzo solo il filo che scende; in `05a` la metà destra sopra "Brossura cucita" è vuota per 300 px. Il filo diventa un **riquadro**: parte in alto, gira a destra e chiude sotto "Prova la tua". A 375 (`05b-cotone`) racchiude il testo in una **cornice rettangolare con bordo di 2 px**: è di nuovo una scheda con bordino, fatta col filo. I 4 diagrammi (dorso, cartonato, giapponese, punto metallico) sono disegni al tratto sottile in grigio, con quote: sembrano un manuale tecnico, non un libro cucito. |
| Banco | 5 | **7,5** | Formati disegnati in scala; campioni "st / st / st" nelle tre tecniche; tiratura "50 100 150 250 500 1.000" in numeri Anybody in riga; campi con tinta propria (giallo chiaro su Citrino, grigio caldo su Cotone). Leva con solco e manico tondo in lamina: a metà corsa (`gl0/1440/06d-citrino`, `gl0/375/06d-cotone`) si capisce cosa succede. Successo pulito, nome non più sdoppiato, "Mandi, Marta". Cosa manca: **(1)** su Citrino la prova col testo di esempio a secco resta un rettangolo giallo con "Chiara Zanin" appena percettibile (`1440/06a`, `375/06a`): è il primo fotogramma del banco. **(2)** Sotto la leva e dopo il successo restano 300-400 px di carta vuota a 1440 (`06c`, `06e`). **(3)** A 375 dopo il successo resta il dial "luce" orfano in basso, senza la prova (`gl0/375/06e`). **(4)** A 2560 col GL la prova in lamina viene fuori pallida come un secco (`2560/06b-citrino`): va verificato su un device vero. **(5)** Il cursore della leva è un cerchio grigio a gradiente: è credibile, ma meno bello della lamina del bottone. |
| Bottega | 6 | **7** | Frontespizio vero: indirizzo a secco su due righe a tutta area, riga in inchiostro con i tre link, "Telefono ed email sono di esempio", stato orario in una riga di testo, "Chi c'è" come frase. Il numero finto gigante è sparito. Ma **bug nuovo**: a 375 col GL (`375/07-citrino`, `375/07-cotone`) l'indirizzo a secco è disegnato ~90 px più in basso del suo posto e **finisce sopra** "Chiama la bottega / Scrivi alla bottega"; in fallback (`gl0/375/07`) è giusto. Poi: 150 px vuoti tra l'intro e l'indirizzo, a 375 e a 1440. |
| Colophon | 4 | **7** | Marchio IMPRONTA premuto a tutta larghezza anche in fallback, indice in una riga, disclaimer chiaro, un solo bottone. Col GL a 1440 (`1440/08-citrino`) il marchio sta ~30 px più in basso e "tipografia e legatoria · Pordenone" **ci finisce sopra**. Dopo i recapiti restano 100-150 px di vuoto (`full-1440-citrino-c`). Il marchio del colophon (maiuscolo, Anybody largo) è bello, ma a 375 è alto solo 40 px: è la fine del sito, deve pesare di più. |

## Cosa è migliorato (confronto con il giro 1)

1. **Hero**: da "sito giallo" a poster. È il miglioramento più grande: ora il primo schermo vende il concept.
2. **Ricetta vietata**: sparite le schede bianche con bordino del banco su Cotone, le tile della legatoria e il testo verticale della carta.
3. **Lamina**: il bottone argento a gradiente piatto è diventato una lamina con banda di riflesso e grana: si legge come metallo.
4. **CTA**: da 8 bottoni uguali a un bottone per contesto (link nel per chi, filo nella legatoria).
5. **Bug del giro 1 risolti**: sigillo grigio, copertina vuota, "Noncellc", nome sdoppiato, lastra sopra la leva, intro della carta rientrata.
6. **Contenuto**: placeholder dichiarati ("Telefono ed email sono di esempio: la bottega non esiste"), title con "Concept 10", stato orario ridimensionato, micro-frasi tagliate.
7. **Tecniche**: via lo split-header, taglio colorato come oggetto.

## Cosa impedisce ancora 8

**DESIGN 7,5**
1. **Ritmo**. Legatoria (250 + 240 px vuoti), banco dopo la leva e dopo il
   successo (300-400 px), bottega tra intro e indirizzo (150 px). Il vuoto non
   ha tensione: nessun elemento lo tiene. Nella pagina intera la seconda metà
   si "sfilaccia".
2. **Legatoria come cornice**: il filo che gira intorno al testo è un
   rettangolo con bordino (375) e i diagrammi al tratto grigio sottile sembrano
   quote tecniche.
3. **Rilievo a secco pallido** nel primo stato delle Tecniche e nel banco su
   Citrino: il prodotto del sito è più debole proprio dove il cliente lo guarda.
4. **Due stili per "Prova la tua"**: lamina nell'hero e nel colophon, blocco
   verde notte pieno nella testata. Il `DESIGN.md` vuole la lamina solo lì: la
   testata deve usare la lamina (in piccolo) o un link, non un terzo stile.
5. **Due allineamenti a 2560**: hero a vivo, resto nella gabbia.

**USABILITÀ 7**
1. **Il GL disegna blocchi fuori posto**: indirizzo della bottega sopra i link
   (375) e marchio del colophon sotto la sua riga (1440). Lo shader è il
   percorso principale su desktop e mobile veri: questi sono i primi bug che un
   giurato vede.
2. **Tecniche col GL**: il testo resta in ritardo di uno stato rispetto
   all'indice (`1440/03c-citrino`: indice su "taglio", testo "A un colore").
3. **Nessun auditor ha verificato le correzioni** di accessibilità (A1-A4:
   lampeggio, fuoco coperto, reflow), performance (P1-P3) e Firefox (B1). Finché
   non passano il giro, la categoria non va oltre 7.
4. A 375 i due fissi in basso ("Torna in Ciceri Lab" + "Prova la tua")
   occupano tutta l'ultima riga e il testo che scorre ci passa sotto; dopo il
   successo il dial "luce" resta orfano.

## Interventi per agent (solo ciò che resta sotto 8)

In ordine di impatto.

| # | Agent | File | Intervento | Categoria |
|---|---|---|---|---|
| 1 | **shader-engineer** | `webgl/blocks.ts`, `webgl/ImprontaGL.ts` | Allineare i piani GL ai rettangoli DOM dopo cambi di layout/font: indirizzo della bottega a 375 (+90 px, sopra i link) e marchio del colophon a 1440 (+30 px). Rimisurare i blocchi su `ResizeObserver` dei fantasmi e dopo `document.fonts.ready`, non solo allo scroll. Verificare anche la lamina pallida della prova a 2560. | Usabilità |
| 2 | **section-builder-legatoria** | `legatoria.css`, `Filo.tsx`, `Legatoria.tsx` | Togliere i due vuoti a 1440/2560 (margine prima di "Prezzi su 100 copie" ≤ 96 px, dopo "Prova la tua" = piede di sezione). Il filo non deve chiudersi intorno al testo: a 375 niente tratto verticale a destra né orizzontale sotto, deve finire nel nodo di "Prova la tua". Diagrammi con tratto inchiostro 1,5-2 px e senza le quote grigie, oppure uno solo grande. | Design |
| 3 | **webgl-artist** + **art-director** | `webgl/presets.ts` (preset "a secco" della prova e delle tecniche), `styles/relief-fallback.css` | Secco più leggibile nel primo stato delle Tecniche e nel banco su Citrino. Parete d'ombra `--imp-carta-ombra` piena, labbro di luce più chiaro (`--imp-carta-luce` al 100%), profondità della prova a secco almeno pari a quella dell'hero. Oggi l'hero è netto e la prova no: devono avere lo stesso preset. | Design |
| 4 | **section-builder-banco** | `banco.css`, `Banco.tsx` | Chiudere il vuoto sotto la leva e dopo il successo a 1440/2560: il piede della sezione parte dalla fine della colonna più lunga, niente altezza minima. A 375 dopo il successo spostare il dial "luce" accanto alla prova o nasconderlo. Testo di esempio della prova vuota su Citrino in "a un colore" invece che a secco, così il primo fotogramma del banco non è un rettangolo giallo vuoto (oppure la tecnica di partenza resta "a secco" ma con il preset del punto 3). | Design, Usabilità |
| 5 | **section-builder-tecniche** | `Tecniche.tsx`, `tecniche.css` | Lastra più piccola (larghezza 520-560 a 1440) e parola all'80-85%. Taglio colorato su Citrino: il bordo in una tinta che non sia l'inchiostro (Cipria o Grafite chiaro), altrimenti sembra un filetto. Testo della tecnica sincronizzato con l'indice anche col GL (lo stato deve venire da un'unica fonte). | Design, Usabilità |
| 6 | **section-builder-hero** | `Testata.tsx`, `testata.css`, `hero.css` | "Prova la tua" della testata nello stesso stile dell'hero (lamina, altezza 44 px) invece del blocco verde notte. Dial "luce" agganciato alla parola (sotto il piede di "ta", a destra, allineato al margine esterno) invece che isolato all'altezza del bottone. A 2560 hero nella stessa gabbia delle altre sezioni (o tutte a vivo: una sola regola). A 375 "indice" a 15 px. | Design |
| 7 | **section-builder-bottega** | `bottega.css` | Vuoto tra intro e indirizzo a secco ≤ 64 px (375) / 96 px (1440). | Design |
| 8 | **section-builder-colophon** | `colophon.css` | Marchio a 375 almeno 64 px di corpo (su due righe "IMPRON / TA" se serve, come nell'hero); vuoto finale ridotto al piede. Controllare la distanza tra marchio e riga "tipografia e legatoria" dopo la correzione del punto 1. | Design |
| 9 | **section-builder-hero** + **section-builder-per-chi** | `testata.css`, `per-chi.css` | A 375: spazio in fondo alle sezioni pari all'altezza dei fissi (56 px + safe area), così nessun testo resta sotto "Torna in Ciceri Lab" e "Prova la tua". | Usabilità |
| 10 | **accessibility-auditor**, **performance-auditor**, **cross-browser-tester** | i loro doc | Rifare il giro sulle correzioni dichiarate (A1-A4, M2-M5, B2-B8; P1-P3; B1 Firefox). Senza questa verifica l'usabilità non può salire sopra 7. | Usabilità |

Creatività (8,5) e contenuto (8) sono a 8 o sopra: nessun intervento obbligatorio.
Per il giro 3 servono gli scatti GL su un device vero (o almeno una GPU
non-SwiftShader) per hero, banco e colophon, e un fotogramma della pressa a
metà discesa sulla prova.

---

# Giro 3

Stesso metro (Site of the Day), stesso metodo. Guardati davvero in
`qa/shots-g3/`: a 1440 hero, per chi (con GL e con `attesa15s`), tecniche
(inizio/metà/fine, GL e `gl0`), carta, legatoria (inizio/fine), banco (vuoto,
compilato, leva a metà `gl0`, successo `gl0`), bottega, colophon, su Citrino e
Cotone; a 375 tutte le sezioni sulle due carte (leva e successo in `gl0`);
pagine intere `full-1440-citrino-a/b`; 768 banco successo e legatoria fine;
2560 hero Citrino e per chi Cotone. Letti il "Giro 3" del responsive-tester e i
"Giro 3/3b" di accessibility (axe 0, A1-A4 risolti, N1; A2 a 375 chiuso dal
banco nel 3b secondo l'orchestratore), performance (Lighthouse 95/100, CLS 0,
scroll ~50 fps, INP banco desktop risolto) e cross-browser (tre motori verdi,
B3 WebKit chiuso nel 3b).

## Verdetto in una riga

Il sito ora regge il confronto con MERIDIANA e STUDIO FORMA: un'identità che
non somiglia a nessun altro concept del Lab, un primo schermo da poster, la
sezione carta da SOTD, un preventivo che è un gesto di mestiere. Le quattro
categorie arrivano a 8. Restano tre sezioni a 7,5 (banco, per chi col GL,
colophon a 375): rifiniture, non più difetti di concept.

| Categoria | G1 | G2 | **G3** |
|---|---|---|---|
| DESIGN | 6 | 7,5 | **8** |
| USABILITÀ | 5,5 | 7 | **8** |
| CREATIVITÀ | 7,5 | 8,5 | **8,5** |
| CONTENUTO | 7 | 8 | **8,5** |

### Perché ora 8

- **Design 8**: sparito l'ultimo stile doppio (il "Prova la tua" della
  testata è in lamina come nell'hero e nel colophon); tecniche con lastra più
  compatta e secco netto in fallback; legatoria con i disegni campiti di carta
  chiara e tratto inchiostro, il filo non chiude più il testo in una cornice;
  bottega con l'indirizzo a secco attaccato all'intro. Il ritmo della seconda
  metà adesso tiene (vuoto residuo solo sotto la leva). Non 9: il banco su
  Citrino apre ancora con una prova quasi invisibile e il colophon mobile
  chiude debole.
- **Usabilità 8**: per la prima volta i fatti sono verificati dagli auditor,
  non dichiarati: axe 0 su 4 carte, lampeggio sotto 3/s, fuoco mai coperto a
  1440, reflow 400% ok, Lighthouse 95 mobile / 100 desktop, CLS 0, scroll da
  6 a ~50 fps, console pulita su Chromium, Firefox e WebKit. Non 9: il pezzo
  del per chi col GL può restare vuoto finché la maschera non è cotta (M, in
  correzione), TBT mobile al limite (166 ms), chunk 0,5 KB fuori budget.
- **Creatività 8,5**: invariata; la leva a metà corsa (`gl0/*/06d`) e il nome
  del visitatore che diventa il titolo dell'hero (`full-1440-citrino-a`:
  "Stefano Brun") sono i due fotogrammi da giuria.
- **Contenuto 8,5**: placeholder dichiarati in chiaro, orari veri da bottega
  ("sabato, oggi"), prezzi coerenti fra per chi, tecniche, legatoria e banco,
  successo firmato "Mandi, Marta".

## Voti per sezione

| Sezione | G1 | G2 | **G3** | Note |
|---|---|---|---|---|
| Testata | 6 | 7 | **8** | "Prova la tua" in lamina e compare solo dove non ce n'è un altro in vista; voce corrente giusta. Resta "indice ▾" piccolo a 375 (rifinitura). |
| Hero | 5 | 8,5 | **9** | A 2560 ora sta nella gabbia come le altre sezioni; dial "luce" agganciato al piede di "ta". |
| Per chi | 6,5 | 8 | **7,5** | In `gl0` e con `attesa15s` è la composizione migliore dopo la carta. Ma nello scatto di giro col GL a 1440 Citrino la copertina è un **rettangolo nero vuoto** e "Chiara Zanin" quasi non si vede: il fantasma si spegne prima che il blocco sia disegnato. Correzione in corso (shader-engineer): con la correzione verificata la sezione torna a 8,5. |
| Tecniche | 7,5 | 7,5 | **8** | Lastra ridotta, parola all'80%, "a secco" netto in `gl0`, taglio con bordo rosa visibile a 375. Col GL "a secco" resta più tenue del fallback: accettabile, il secco è così. |
| Carta | 7 | 9 | **9** | Invariata, sempre il picco del sito. |
| Legatoria | 6 | 6,5 | **8** | Disegni campiti e leggibili; filo che collega i nomi ai punti; a 375 niente più cornice (il filo corre sul margine e finisce nel nodo di "Prova la tua"); "Prova la tua" accanto ai prezzi a 1440. Restano ~100 px vuoti in fondo: normali. |
| Banco | 5 | 7,5 | **7,5** | Leva, scelte, campi e successo sono a livello (a 375 dopo l'invio: frase, "Prova un'altra cosa", poi la prova intera col prezzo: giusto). Cosa lo tiene sotto: **(1)** il primo fotogramma su Citrino (`1440/06a`, `375/06a`) è ancora un rettangolo giallo con "Chiara Zanin" a secco appena percettibile, mentre hero e tecniche in `gl0` hanno un secco netto: la prova usa un preset più tenue; **(2)** sotto la leva a 375 restano ~250 px di carta vuota prima della bottega (`gl0/375/06d`), a 1440 ~200 px (`gl0/1440/06d`); **(3)** a 768 Cotone col GL la lamina del nome dopo l'invio è chiarissima (segnalato dal tester). |
| Bottega | 6 | 7 | **8,5** | Frontespizio vero: indirizzo a secco subito sotto l'intro, gemello in inchiostro, link in riga, stato orario in una frase. Col GL a 375 l'indirizzo è ora al suo posto. |
| Colophon | 4 | 7 | **7,5** | A 1440 corretto (marchio sopra la riga, con spazio). A 375 il marchio va su due righe spezzato **"IMPR / ONTA"**: taglio arbitrario, diverso da "impron / ta" dell'hero, e sotto restano ~150 px vuoti con il bottone fisso "Prova la tua" in basso. |

## Cosa è migliorato rispetto al giro 2

1. Tutti gli interventi del giro 2 sono visibili negli scatti: blocchi GL al
   loro posto (bottega 375, colophon 1440), legatoria senza vuoti e senza
   cornice, testata con un solo stile di bottone, hero nella gabbia a 2560,
   tecniche compatte.
2. Gli auditor hanno chiuso il giro: nessuna voce alta aperta in
   accessibilità, performance e cross-browser.
3. Ricetta vietata e AI tells: nessuna occorrenza residua su nessuna carta e
   nessuna larghezza.

## Interventi rimasti (solo sezioni sotto 8)

| # | Agent | File | Intervento | Sezione |
|---|---|---|---|---|
| 1 | **shader-engineer** (in corso) | `webgl/ImprontaGL.ts`, `webgl/blocks.ts` | Il fantasma DOM del pezzo resta visibile finché il blocco non è davvero disegnato (maschera cotta + primo frame), stesso contratto di `data-imp-gl="fuori"`. Verifica: scatto GL a 1440 Citrino senza attesa extra, copertina con titolo e autrice. | Per chi |
| 2 | **webgl-artist** + **art-director** | `webgl/presets.ts`, `styles/relief-fallback.css` | La prova del banco a secco usa lo stesso preset (profondità, ombra piena, labbro di luce) di hero e tecniche: "Chiara Zanin" su Citrino deve leggersi al primo sguardo. Lamina della prova su Cotone col GL più scura al piede (`--imp-lamina-profonda`). | Banco |
| 3 | **section-builder-banco** | `banco.css` | Piede della sezione dalla fine della colonna più lunga: niente ~250 px (375) / ~200 px (1440) vuoti sotto la leva. | Banco |
| 4 | **section-builder-colophon** | `colophon.css`, `Colophon.tsx` | A 375 il marchio su una riga a tutta area (wdth più stretto) oppure spezzato "IMPRON / TA" come l'hero; vuoto finale ridotto al piede. | Colophon |

Con 1 verificato e 2-4 fatti, per chi, banco e colophon salgono a 8 o più.
**Condizione del loop soddisfatta** (almeno 8 in ogni categoria): il concept
può andare a Luca con questi quattro ritocchi come ultima passata.
