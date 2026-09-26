# Trend researcher · Concept 17 · MADRE (panificio e pasticceria)

Ondata 1. Input: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, riga 17 e paragrafo "17 ·
MADRE" di `docs/matrice-concept-11-20.md`, `concepts/17-madre/docs/creative-director.md`,
`.claude/skills/taste/SKILL.md`. Formato preso dal pilota
`concepts/10-torchio/docs/trend-researcher.md`.

Scopo: dare all'ondata 2 (art-director, motion-designer, webgl-artist,
interaction-designer, copywriter, photo-editor) **principi da reinterpretare**,
**pattern da evitare** e i **rischi veri** di MADRE. Nessun codice.

---

## 1. Fonti e come sono state lette

### 1.1 /taste su siti reali: come è stato fatto

Chromium in `/opt/pw-browsers` **non si fida del certificato del proxy**
(`net::ERR_CERT_AUTHORITY_INVALID` su tutti i siti, 26/09/2026: lo store NSS
di Chromium è vuoto). Non ho allentato la verifica TLS (niente
`ignoreHTTPSErrors`, niente flag sui certificati). Ho invece tolto la rete a
Chromium: ogni richiesta della pagina viene intercettata con `page.route` e
scaricata da **curl con verifica TLS sul CA bundle** `/root/.ccr/ca-bundle.crt`
(lo stesso metodo che `docs/lab-operativo.md` indica per i font). Solo GET/HEAD;
POST e WebSocket vengono interrotti, quindi i siti che caricano contenuti con
chiamate POST possono risultare incompleti (lo segnalo dove succede).

Per ogni sito: viewport 1440×900, full-page (o metà pagina + piede se oltre
5400 px), 375×812, estrattore DOM `references/extract.js` della skill. File in
`concepts/17-madre/qa/taste/` (`{dominio}-viewport.jpeg`, `-fullpage`/`-mid`/
`-footer`, `-375`, `-dom.json`, e l'output della skill `{dominio}.md` +
`{dominio}.json` con Design Map e Taste DNA; controllo anti-slop = 0, JSON
valido).

| Sito | Esito | Perché l'ho scelto |
|---|---|---|
| **lunecroissanterie.com** (Lune, Melbourne) | ok | Il prodotto da forno fotografato come un oggetto unico: macro su nero, niente contesto. |
| **poilane.com** (Poilâne, Parigi) | ok (9319 px, metà e piede) | Il panificio a lievito naturale più noto al mondo; superfici color farina e un solo rosso da timbro. |
| **fabrique.co.uk** (Fabrique, Stoccolma/Londra) | ok | Panificio di pasta madre con voce "da bottega" e un nastro di testo curvo. |
| **pasticceriamarchesi.com** (Marchesi 1824, Milano) | ok, ma il pop-up natalizio resta nello screenshot | Pasticceria italiana: il colore della confezione usato come cornice del sito; caroselli orizzontali. |
| tartinebakery.com | **scartato**: resta fermo sul preloader "MADE EACH DAY" anche dopo 15 s (contenuti caricati da chiamate che il metodo non serve) | |
| hartbageri.dk | **rifiutato**: 403 del sito (anti-bot) | |
| cedric-grolet.com | **scartato**: la home è solo l'elenco delle sedi, nessun prodotto | |
| e5bakehouse.com | catturato, **non usato**: foto bianco e nero di persone al lavoro, menu in maiuscolo; niente da imparare per MADRE | |

Awwwards non l'ho usato come fonte (nel pilota era bloccato; oggi il proxy
registra chiusure del tunnel verso `www.awwwards.com`). Per le **superfici
morbide in WebGL** non ho trovato un sito pubblico apribile e pertinente: i
principi del P5 vengono dalla fisica del gesto descritta dal creative-director,
non da un sito misurato, e lo dichiaro.

### 1.2 Libreria locale `design-references/awesome-design-md/design-md/`

| Sistema | Perché è utile a MADRE | Cosa ne prendo (principio, non stile) |
|---|---|---|
| **apple** | Fotografia di prodotto "da museo": l'interfaccia arretra, un solo colore d'azione, **una sola ombra in tutto il sistema, solo sotto il prodotto che poggia su una superficie**; il cambio di fondo fa da divisore tra le sezioni. | Il prodotto poggia su un piano e solo lì c'è peso (P2); il cambio di fondo come divisore (P4); un solo accento (P6). |
| **starbucks** | Superfici prese dai **materiali veri del negozio** (tovagliolo, muro, legno) invece del bianco; **l'oro riservato ai momenti "Rewards"**, mai accento generico. | La carta da zucchero è un materiale vero e segna un rito (la domenica) come l'oro segna i premi (P4). Da evitare: pillole a 50 px, bottone flottante con ombra doppia. |
| **airbnb** | Marketplace di schede foto 1:1 con carosello dentro la scheda, 8 px di base, sezioni a 64 px "per mettere più schede per scroll". | Serve **come contro-esempio**: è esattamente la vetrina a griglia di schede che MADRE non deve diventare (vedi pattern 3 e 9). Da tenere solo il testo del prezzo semplice sotto la foto. |

Scartati dopo lettura: `nike` (catalogo a griglia), `mastercard` e `claude`
(già usati dal pilota, e fondo crema caldo).

---

## 2. Cosa ho visto sui siti (in breve, con i numeri)

- **Lune**: fondo `#000000` al 100%, titolo DIN Bold 115 px in due righe
  sfalsate, un croissant macro a filo del bordo destro con il **riflesso sul
  piano** come unico indizio del tavolo. Zero raggi, zero ombre. Transizioni
  lunghe: `transform 1.6s cubic-bezier(0.215, 0.61, 0.355, 1)`. Su 375 il
  prodotto esce dal bordo destro: resta metà croissant, ed è più forte così.
- **Poilâne**: bianco + due superfici tiepide `#FAF8F6` (29% dell'area) e
  `#EEE9E3` (19%), testo `#3A312E`, rosso `#C8102E` al 6% (blocco promo e il
  **timbro tondo** "fabrication à la main, depuis 1932" tagliato dal bordo in
  fondo). Display Gill Sans Nova 85 px maiuscolo. Ricette in griglia 4×327 px
  a piombo: la parte più debole.
- **Fabrique**: crema `#FFF4E0` (72%) e marrone `#5B3E36`, tutto il testo in
  Courier 16 px; un **nastro di testo su arco** ("BREAD MEMORIES") attraversa il
  confine con il piede. Dopo il video d'apertura, 600 px di crema vuota.
- **Marchesi 1824**: bordo pesca `#FFC99A` di 10 px che **incornicia tutta la
  pagina** (è il colore della scatola), Caslon 48 px + Futura 13-14 px. Tre
  caroselli orizzontali; in quello dei negozi le foto laterali sono **tagliate
  dal bordo** e invitano a scorrere senza scritte.

---

## 3. Principi da reinterpretare (10)

### P1 · Il prodotto da solo, senza la cucina intorno
*Da: Lune (nero al 100%, un croissant, nessun oggetto), apple (l'interfaccia arretra).*
**In MADRE**: nel bancone ogni pane è una macro **scontornata o ritagliata
stretta** su farina o carta da zucchero, mai una foto con taglieri, tovaglie,
mani o mensole. Il fondo della foto deve sparire nel fondo del banco: il
photo-editor scarta ogni foto il cui sfondo non si può togliere o chiudere nel
ritaglio. Il nero di Lune **non** si prende: da noi il "vuoto" è la farina
`#F7F3EA`.

### P2 · Il peso nasce dal piano d'appoggio, non da un'ombra
*Da: Lune (il riflesso sotto il croissant), apple (un'unica ombra, solo sotto il prodotto su una superficie).*
**In MADRE**: il piano del bancone (la fascia crosta) è **l'unico** posto dove
c'è un'ombra, ed è l'ombra di contatto del pane sul piano: corta, morbida,
schiacciata (per esempio un'ellisse sfocata alta 6-10 px sotto la base della
foto). Niente ombre su schede, bottoni, testi, gettoni del pane fisso. Se
un'ombra non ha un piano sotto, si toglie.

### P3 · La scala vera come gerarchia
*Da: Lune (un solo prodotto enorme che esce dal bordo a 375), apple (il prodotto occupa la schermata).*
**In MADRE**: al posto di titoli più grandi, **il pane più grande è la foto più
grande**. Fissare nel DESIGN.md una tabella di altezze relative sul piano
(pagnotta 1 kg = 100%, filone 80%, ciabatta 60%, biscotti 30%) e rispettarla
anche a 375. Il prodotto può uscire dal bordo destro della finestra: è il modo
più naturale di dire "continua di lato" (vedi P7).

### P4 · Il colore di un materiale vero, riservato a un rito
*Da: Marchesi (il pesca della scatola diventa cornice e piede), starbucks (superfici dai materiali del negozio, oro solo per i premi), Poilâne (il rosso del timbro, al 6%).*
**In MADRE**: la carta da zucchero `#9BB2C5` non è un tema, è **la carta
della domenica**. Compare solo dove c'è il dolce e il vassoio, e l'utente deve
poterlo dire a parole: "dove c'è l'azzurro è festa". Regola da scrivere nel
DESIGN.md: zucchero **mai** su menu, bottoni generici, focus, link, stati
d'errore. L'unica eccezione è lo stato "si fa quel giorno" nel pane fisso,
già deciso dal creative-director.

### P5 · La materia si riconosce da come torna, non da come si muove
*Da: fisica dell'impasto (creative-director 4.3); nessun sito misurato.*
**In MADRE**: per il webgl-artist la domanda di controllo è "sembra farina
opaca che torna su piano piano, o gelatina?". Si ottiene con: ritorno
**esponenziale senza oscillazione** (nessuna molla con rimbalzo), niente
riflesso speculare, spolvero bianco irregolare che si apre e si richiude per
ultimo, fossetta a forma di polpastrello (ellisse leggermente asimmetrica). Il
fallback foto deve reggere lo stesso confronto.

### P6 · Un solo accento, e vale perché è raro
*Da: Poilâne (rosso al 6%), apple (un solo blu d'azione), starbucks (oro solo nei premi).*
**In MADRE**: la crosta `#9C5B2A` sta in tre ruoli e basta: piano del
bancone, prezzi, bottone primario su farina. Se serve un quarto posto (icone,
bordi, sottolineature, hover di link), il problema è altrove. Il bordo crosta
degli scomparti nel successo del pane fisso è il premio finale proprio perché
prima non c'è mai.

### P7 · Il pezzo tagliato dice "continua"
*Da: Marchesi (foto laterali tagliate nel carosello dei negozi), Lune a 375 (il croissant esce dal bordo).*
**In MADRE**: niente frecce, niente "scorri", niente barra di avanzamento. A
1440 il banco successivo entra sempre per almeno 12-16% della larghezza; a 375
il prodotto dopo si vede per 16 vw (già nel creative-director). Il taglio va
sulla **foto**, mai sul nome o sul prezzo (un prezzo tagliato sembra un
errore).

### P8 · Il cambio di fondo è il divisore
*Da: apple (la sezione chiara e quella scura si toccano senza filetti), Fabrique (il nastro che taglia il confine con il piede).*
**In MADRE**: tra pani e dolci non c'è un filetto né un titolo di sezione a
tutta pagina: c'è il **foglio azzurro che si stende sul bancone**. È l'unico
"evento" di passaggio della vetrina. Il motion-designer lo lega alla posizione
dello scroll (non a un timer), senza onde né bordi strappati: bordo dritto,
come un foglio tagliato. Con reduced motion: cambio netto.

### P9 · La voce della bottega sta nelle parole, non in un carattere "da bottega"
*Da: Fabrique (Courier per dire "ricetta battuta a macchina"), Poilâne (frasi da timbro: "fabrication à la main").*
**In MADRE**: niente monospazio, niente macchina da scrivere, niente scrittura
a mano finta. La voce la porta il copywriter con frasi corte e concrete da
bancone di Pordenone ("la segale si fa martedì e venerdì", "mezzo chilo sono
circa 12 paste"). Bricolage Grotesque in minuscolo fa già il lavoro della
morbidezza.

### P10 · Il sito vende l'abitudine, non l'occasione
*Da: il contrario di Marchesi (regali, confezioni, pre-ordine di Natale) e di Lune ("ORDER NOW" come unico messaggio).*
**In MADRE**: nessun banner stagionale, nessun "novità", nessun pop-up. Ogni
blocco di testo del bancone chiude con **quando si fa** e con il gesto "Nel
pane fisso": la domanda del cliente vero non è "cosa c'è oggi" (INFORNATA) ma
"posso averlo sempre il martedì?". Il pane fisso è la conclusione naturale
della vetrina, non un form in fondo.

---

## 4. Pattern inflazionati da evitare (10)

1. **La ricetta bocciata del Lab, per intero**: titolo serif corsivo + sans;
   occhielli "01 ·" in maiuscoletto spaziato o monospace; griglia di schede
   bianche con bordino e ombra; lo stesso fade-up ovunque; onde e filetti tra
   le sezioni; mappa disegnata; prenotazione a passi che finisce in cartolina
   o scontrino; figure umane in SVG. In MADRE vale anche per il pane fisso: il
   successo è la settimana che resta ferma, non un biglietto.
2. **Split testo a sinistra, foto in cornice a destra con didascalia "TAV. I"**
   (hero dei bocciati 11-20, e anche di Lune: "ORDER NOW" + croissant a destra).
   L'apertura è l'impasto a tutta finestra.
3. **Griglia di prodotti a schede quadrate** con foto 1:1, nome e prezzo sotto,
   cuoricino in alto (airbnb, e-commerce di pasticceria, Poilâne boutique). La
   vetrina è una fila su un piano con grandezze vere.
4. **Crema calda + marrone** (`#FFF4E0` / `#5B3E36` di Fabrique, e INFORNATA).
   La farina `#F7F3EA` resta fredda; il marrone esiste solo come crosta, mai
   come fondo o come testo lungo.
5. **Il prodotto da forno su fondo nero con luce drammatica** (Lune, e la foto
   "da menu gourmet"): è lucido, notturno, è il territorio fuoco-e-buio da
   lasciare a BRACE & LIEVITO. Le nostre macro sono di giorno, luce diffusa.
6. **Flat lay a piombo su tavolo grigio o legno** (le ricette di Poilâne, i
   food blog): il pane visto dall'alto perde mollica e volume, e il "tavolo
   visto dall'alto" è di 11 TAJUT.
7. **Nastro di testo che scorre all'infinito** (marquee orizzontale o su arco,
   Fabrique e piede di Poilâne): oggi in quasi ogni sito di ristorazione;
   in MADRE la cosa che si muove di lato è già il bancone, un secondo
   movimento orizzontale automatico lo confonderebbe (ed è un movimento che
   parte da solo, vietato).
8. **Timbri tondi e badge ruotati "dal 1932", "fatto a mano", "100%
   naturale"** (Poilâne, 6 MERIGGIO): numeri di anzianità e sigilli sono la
   decorazione più abusata dell'artigianato; il creative-director vieta già i
   contatori finti.
9. **Scroll orizzontale "pinned" con card identiche e barra di avanzamento**
   (il template GSAP ScrollTrigger più copiato degli ultimi anni): la striscia
   di MADRE deve avere oggetti di altezze diverse sul piano, un intermezzo
   stretto (la madre), il foglio azzurro; la navigazione in basso sono i nomi
   dei banchi, non una barra.
10. **Pop-up, banner stagionali e preloader con parole che lampeggiano**
    (Marchesi, Tartine "MADE EACH DAY" a opacità alterne): il primo contatto
    di MADRE è un gesto, non un'attesa; niente preloader, niente testo che
    cambia opacità da solo, niente cookie wall disegnato come modale di marca.

In più, per la sezione 9 della skill: niente gradienti azzurri (lo zucchero è
pieno), niente grana animata a tutto schermo, niente cursore custom o testo
magnetico, niente Inter e affini (lista font vietati della matrice).

---

## 5. Rischi del concept (e come contenerli)

**R1 · L'impasto che sembra plastilina o gelatina.** È il rischio più alto:
un piano deformato con luce diretta e ritorno elastico sembra una slime.
Contenimento: vedi P5; nessuna componente speculare; ritorno 1,8-2,2 s al 90%
senza overshoot; rumore di spolvero fine e bianco, non grana grigia; test di
confronto accanto a una foto vera di impasto infarinato (la stessa del
fallback) fatto dal webgl-artist e guardato a 1440 e 375.

**R2 · Lo scroll orizzontale che ruba il controllo.** Pinned + trasformazione
rompe: Tab verso elementi fuori vista, PagGiù/Spazio, trackpad con deltaX,
ritorno con il tasto Indietro, zoom 400% (la striscia alta quanto la finestra
diventa inutilizzabile), iOS con barra degli indirizzi che cambia l'altezza.
Contenimento: scroll nativo senza smoothing (il creative-director lo prevede);
altezze in `svh`/`dvh` misurate una sola volta e non a ogni frame; a zoom
forte o con finestra bassa (per esempio sotto 480 px di altezza) la vetrina
**deve** poter diventare una lista verticale leggibile: lo ux-architect lo
fissa come stato, il responsive-tester lo prova.

**R3 · L'azzurro che diventa LUME o un'app di banca.** `#9BB2C5` su larghe
superfici con testo inchiostro regge (5,06:1), ma accanto a bianco puro e con
bottoni arrotondati diventa "clinico". Contenimento: niente bianco puro in
tutto il sito (solo farina); la carta da zucchero ha una leggerissima fibra
opaca o nessuna texture, mai lucida; raggio 4 px unico; nessun testo farina su
zucchero (contrasto insufficiente, già vietato).

**R4 · Le foto.** Il concept vive di macro vere di prodotti friulani che nelle
banche libere sono rare (gubana sì, pinza a fatica, pan di sorc ed esse di
Raveo quasi mai), e foto di autori diversi hanno luci e colori diversi: la fila
rischia di sembrare un collage. Contenimento: piano B del creative-director
(prodotto senza foto piuttosto che foto sbagliata); stesso ritaglio e stessa
altezza del piano per ogni banco; correzione minima di bilanciamento del bianco
verso la luce diffusa di giorno; crediti CC BY-SA nel piede.

**R5 · Il trascinamento del pane fisso su mobile.** Drag and drop su 375 dentro
una pagina che scorre si scontra con lo scroll. Contenimento: su touch il modo
principale è "tocca e poi tocca" (già deciso); il drag parte solo dopo una
pressione ferma di circa 250 ms o su una maniglia, mai su tutto il gettone.

**R6 · Due gesti "premi" che si confondono.** La prova del dito e i gettoni del
pane fisso si toccano entrambi. Contenimento: l'impasto non ha mai l'aspetto di
un bottone (nessun bordo, nessuna etichetta sopra), i gettoni sì; nessun
"tieni premuto" nel sito oltre all'impasto (già deciso).

**R7 · Peso e primo caricamento.** three.js + piano suddiviso + 15-20 macro
possono sforare il budget (WebGL lazy ≤ 160 KB gz, LCP ≤ 2,5 s). Contenimento:
LCP = fallback foto dell'impasto (già a schermo prima del GL), canvas montato
dopo; macro in webp a due misure caricate per banco vicino alla finestra; il
GL si smonta fuori vista.

**R8 · Somiglianza con 14 BATTIFILO e 6 MERIGGIO.** Già coperta dalla matrice e
dal creative-director; qui aggiungo il controllo pratico: se uno screenshot a
1440 del bancone mostra **una sola foto** a tutta finestra, siamo in BATTIFILO;
se compare un'illustrazione o un pastello rosa, siamo in MERIGGIO.

---

## 6. Richieste ad altri agent

- **art-director**: fissare nel DESIGN.md la tabella di scala dei prodotti sul
  piano (P3), l'unica ombra di contatto (P2), le tre sole posizioni della
  crosta (P6) e l'elenco di dove la carta da zucchero **non** va (P4).
- **webgl-artist**: confronto a schermo impasto GL / foto del fallback (R1),
  ritorno senza overshoot (P5).
- **ux-architect / responsive-tester**: stato "vetrina come lista" per zoom
  400% e finestre basse (R2).
- **photo-editor**: scartare foto con sfondo non ritagliabile, flat lay a
  piombo e fondi neri drammatici (P1, pattern 5-6).
