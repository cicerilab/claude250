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
