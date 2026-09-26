# UX architect · Concept 17 · MADRE, panificio e pasticceria (Pordenone)

Ondata 1. Rotta `/concept-17`. Base vincolante: `docs/creative-director.md`
(variante A, IL BANCONE). Allineato con `docs/brand-strategist.md` (scritto in
parallelo: nomi, giorni dei pani, prezzi, orari e promesse di servizio vengono
da lì, una sola fonte). Questo documento decide **struttura, percorsi, ordine di
lettura, stati e accessibilità**. Non decide colori, font, easing o testi
definitivi (art-director, motion-designer, copywriter): i testi qui sotto sono
segnaposto di lunghezza e di tono.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, riga e paragrafo 17 di
`docs/matrice-concept-11-20.md` (più "Regole comuni"),
`concepts/17-madre/docs/creative-director.md`,
`concepts/17-madre/docs/brand-strategist.md`,
`.claude/skills/design-taste-frontend/SKILL.md` (sez. 4.7, 5.B, 6, 9),
`concepts/10-torchio/docs/ux-architect.md` (solo formato e livello),
`concepts/10-torchio/src/components/ConceptBackButton.tsx` (misure reali).

Regole di scrittura rispettate: niente trattini lunghi nei testi visibili,
niente occhielli numerati, niente maiuscoletto spaziato, un solo richiamo alla
prenotazione con una sola etichetta: **"Il pane fisso"**; "Tieni da parte" solo
come invio dentro il pane fisso.

---

## 0. Tre decisioni di struttura (da leggere prima di tutto)

1. **La striscia orizzontale porta i quattro banchi della vetrina** (pane, la
   madre, dolci, domenica). **Il pane fisso e la bottega stanno dopo, in
   verticale**, nel flusso normale della pagina. Motivo: il pane fisso ha un
   modulo con campi, trascinamento, sette righe su mobile e la tastiera del
   telefono; dentro un contenitore sticky alto una finestra e traslato in
   orizzontale diventerebbe uno scroll annidato, la tastiera iOS lo
   romperebbe e con lo zoom al 400% (finestra di 360×225 px CSS) sarebbe
   inutilizzabile. Resta fedele alla metafora: **in bottega si cammina di lato
   lungo la vetrina, poi ci si ferma al banco per ordinare**. Il pane fisso è
   "il banco più largo" perché è l'unico che occupa tutta la pagina e dove il
   cammino si ferma. Il piano del bancone continua: arriva dal bordo destro
   della striscia e diventa la riga su cui poggia la fila dei pani del pane
   fisso (vedi 5.7). **Da confermare dal creative-director** (è una modifica
   al suo 4.2, riga 5).
2. **Lo scroll resta nativo ovunque.** Anche sull'impasto: `touch-action:
   pan-y` al posto del `none` previsto dal creative-director (4.3). Se il
   dito parte sull'impasto e il browser comincia a scorrere, arriva
   `pointercancel`: la fossetta viene rilasciata e torna su piano piano. È
   coerente con il gesto (un tocco di passaggio lascia un segno leggero) e
   nessuna zona dello schermo blocca lo scroll. Tenere premuto fermo
   approfondisce la fossetta come previsto.
3. **Modo in colonna**: quando la finestra è bassa (`max-height: 539px`:
   telefono in orizzontale, zoom del browser dal 200% in su su portatile)
   la striscia non si fissa e non trasla: i quattro banchi diventano un flusso
   verticale normale (prodotto sotto prodotto, stesso contenuto, stesso DOM).
   È anche la versione stampata. Nessun bottone per attivarlo: scatta da solo
   con una media query e lo rileva lo stato della vetrina.

---

## 1. Sitemap

SPA a pagina singola. Una rotta, sette ancore, un'uscita.

```
/                                   Ciceri Lab (uscita: ConceptBackButton del sito)
└── /concept-17                     MADRE (pagina unica)
    ├── #impasto      banco 0  L'impasto, apertura (h1)            <section>, verticale, 100svh
    ├── (vetrina)     contenitore sticky della striscia orizzontale <div>, altezza calcolata
    │   ├── #pane       banco 1  Il banco del pane                   <section> nella striscia
    │   ├── #madre      banco 2  La madre (intermezzo stretto)       <section> nella striscia
    │   ├── #dolci      banco 3  Il banco dei dolci (carta azzurra)  <section> nella striscia
    │   └── #domenica   banco 4  Il vassoio della domenica           <section> nella striscia
    ├── #pane-fisso   banco 5  Il pane fisso (prenotazione, cuore) <section>, verticale
    └── #bottega      banco 6  La bottega + piede                   <section> + <footer>
```

**Ancore dentro la striscia**: il salto nativo del browser non funziona (gli
elementi sono traslati). All'avvio, se c'è un hash, lo stato della vetrina
calcola lo scroll verticale che porta quel banco al bordo sinistro dell'area
viva e ci salta (istantaneo), poi mette il focus sull'`h2` del banco
(`tabindex="-1"`). Stessa funzione per i link del menu e della riga dei
banchi. Il sito non scrive mai l'hash nell'URL mentre si scorre.

**Parametri di ingresso** (per post e inserzioni di Luca), facoltativi, letti
una volta all'avvio, mai scritti nell'URL:

| Parametro | Valori | Effetto |
|---|---|---|
| `?pane=` | `pagnotta`, `segale`, `sorc`, `integrale`, `ciabatta`, `filone` | quel pane risulta "scelto sul bancone" (5.3) e nel pane fisso è il primo della fila; l'esempio fantasma del martedì usa quel pane se si fa di martedì, altrimenti il suo primo giorno |
| `?vassoio=` | `500`, `750`, `1000` | il vassoio della domenica è già messo nel pane fisso con quel peso, "ogni domenica", misto |
| `#pane-fisso` | | salta al pane fisso dopo il primo frame dell'impasto (l'impasto non si vede) |

Esempio per un'inserzione sulla segale:
`/concept-17?pane=segale#pane-fisso`.

**Stato che sopravvive al ricaricamento** (`localStorage`, chiave
`madre:v1`, sempre in try/catch; se è bloccato o vuoto il sito funziona
identico e non dice nulla):
- `settimana`: per ogni giorno, pani con pezzatura e quantità; il vassoio
  (peso, frequenza, misto o paste preferite);
- `scelti`: i pani segnati "Nel pane fisso" lungo la vetrina e le paste "Sul
  vassoio";
- `inviato`: `{ nome, quando }` solo dopo un invio riuscito (per "Fatto,
  Marta" al ritorno e per il segno del dito nell'impasto);
- **mai** il contatto (telefono o email).

Nel piede c'è "Ricomincia da capo", che svuota tutto (conferma in linea, non
un popup).

---

## 2. Navigazione

### 2.1 Principio

Si cammina lungo una vetrina: la navigazione è **il cartellino dei banchi sul
bordo del bancone**, non un menu di app. Si vede sempre dove sei (a parole),
si arriva sempre al pane fisso con un tocco, si esce sempre verso Ciceri Lab
con il comando del sito.

Presente su ogni larghezza:
1. link di salto nascosto fino al focus: **"Salta al pane fisso"** (primo
   elemento tabulabile);
2. `ConceptBackButton` del sito (fisso, suo stile, non si tocca): è il secondo
   elemento del DOM, subito dopo il link di salto;
3. marchio **MADRE** che riporta a `#impasto`;
4. il richiamo unico **"Il pane fisso"** → `#pane-fisso`;
5. la **riga dei banchi**: "pane · la madre · dolci · domenica · pane fisso ·
   bottega", navigazione vera (`<nav aria-label="Il bancone">`, sei link).

### 2.2 Spazi riservati al ConceptBackButton (misure reali del componente)

- **Desktop (> 640 px)**: fisso in alto a sinistra, `top 14px left 14px`,
  circa **195×36 px**. La testata lascia vuota la fascia `x 0-232 px` per
  tutta la sua altezza. Nessun elemento del concept sotto quel rettangolo più
  12 px di margine, in nessuno stato (anche nel pane fisso, anche
  nell'impasto).
- **Mobile (≤ 640 px)**: fisso in basso a sinistra, `bottom
  max(safe-area, 14px) left 12px`, circa **192×34 px**. La fascia in basso
  `x 0-210 px`, altezza `safe-area + 58 px` è sua. Tutto ciò che il concept
  fissa in basso sta **sopra** questa fascia (vedi 2.4) oppure a destra di
  `x 216 px` sulla stessa riga.

### 2.3 Desktop (≥ 1024 px, disegnato a 1440)

**Testata**, fissa in alto per tutta la pagina, alta **64 px**, trasparente
(nessuna barra di colore, nessuna ombra): sta sopra la farina o sopra la carta
da zucchero a seconda del banco.

```
| [riservato al        MADRE             pane   dolci   la bottega          [ Il pane fisso ] |
|  ConceptBackButton]  ^ x 248 px        ^ Karla 16, minuscolo, gap 32 px    ^ bottone 44 px  |
|  x 0-232                                 allineate a sinistra da x 520      margine dx 40 px |
```

- Le tre voci (dal brand-strategist 5.0): **pane** (`#pane`), **dolci**
  (`#dolci`), **la bottega** (`#bottega`). Sono le tre destinazioni di chi ha
  già un'intenzione; la posizione lungo la vetrina la dice la riga dei banchi
  in basso, non la testata. Nessuna voce "corrente" nella testata (non si
  ripete l'informazione).
- Bottone "Il pane fisso": su fondo farina crosta pieno con testo farina; quando
  il banco attivo ha fondo carta da zucchero (dolci, domenica) diventa
  inchiostro pieno con testo farina (regola del creative-director 4.1). Il
  cambio avviene una volta per passaggio di banco, in dissolvenza di 300 ms,
  mai più spesso di una volta ogni 500 ms (isteresi: il banco attivo cambia
  solo quando il nuovo banco occupa più del 50% dell'area viva). Dentro
  `#pane-fisso` il bottone diventa testo semplice non cliccabile "sei al pane
  fisso" (niente bottone che porta dove sei).
- A 1024 px la riga sta su una linea: se non ci sta, le voci scendono a gap 24
  px; sotto i 900 px spariscono le tre voci (resta la riga dei banchi).

**Riga dei banchi**, fissa in basso, alta **48 px**, trasparente, sul bordo
del bancone (sotto il piano, dove in vetrina stanno i cartellini):

```
|        pane   la madre   dolci   domenica   pane fisso   bottega                         |
|        ^ Karla 15 px, minuscolo, inchiostro pieno; corrente: Karla 700 + sottolineatura    |
|          2 px + aria-current="location"; le altre Karla 400. Allineata a x 248 (come MADRE)|
```

- **Non** si usa l'opacità al 60% per le voci non correnti (proposta del
  creative-director 4.2): inchiostro al 60% su carta da zucchero scende sotto
  3:1. La differenza è il peso e la sottolineatura, tutte in inchiostro pieno.
- Si vede dall'uscita dell'impasto fino alla fine della bottega; nell'impasto
  è nascosta (lì c'è un solo gesto e un solo bottone).
- Nessuna barra di avanzamento, nessuna traccia piena, nessun pallino.

### 2.4 Mobile (375 px, pensato per primo): niente hamburger

**In alto**, fissa, alta **56 px**, trasparente:

```
| MADRE                                         [ Il pane fisso ] |
| margine 20 px                                  bottone 44 px alto |
```

- Il bottone "Il pane fisso" in testata compare solo quando il bottone
  dell'impasto è uscito dallo schermo (mai due "Il pane fisso" visibili
  insieme) e sparisce dentro `#pane-fisso`. Comparsa: dissolvenza 200 ms.
- Le tre voci della testata desktop non ci sono: la riga dei banchi le
  contiene tutte.

**In basso, a due piani** (sopra la safe-area):

```
| pane  la madre  [dolci]  domenica  pane fisso  bottega  →|   piano 2: riga dei banchi,
|                                                          |   44 px, bottom = safe + 58 px
| [← TORNA IN CICERI LAB]                                  |   piano 1: ConceptBackButton,
|  x 12-204 (del sito)          x 216-359 libero           |   bottom = safe + 14 px
```

- La riga dei banchi scorre in orizzontale da sola (overflow-x con
  scroll-snap), porta sempre in vista la voce corrente (scroll della riga, non
  della pagina) e ha le stesse regole di stile del desktop (peso e
  sottolineatura, niente opacità).
- Nell'impasto la riga non c'è; nel pane fisso è sostituita dalla **barra del
  riassunto** (5.8), stesso piano 2.
- A destra del ConceptBackButton, sul piano 1 (`x 216-359`), c'è il bottone
  "Il pane fisso" **solo nell'impasto** (4.1 del creative-director: in basso a
  destra, sotto il pollice). Altrove quella zona resta vuota.
- Area viva della striscia a 375×667: `667 - 56 (testata) - 102 (due piani) =
  509 px`. Ogni misura della vetrina mobile in 5.3 sta dentro questi 509 px.
- Con la tastiera del telefono aperta (`visualViewport` più basso del 75%
  della finestra) i due piani in basso si nascondono.

### 2.5 768 px (tablet verticale)

Testata desktop senza le tre voci; riga dei banchi a un piano, in basso,
allineata a destra del ConceptBackButton solo se > 640 px (lì il componente è
in alto): quindi a 768 la riga è a un piano, alta 48 px, da `x 24`.
Striscia con le misure desktop scalate (prodotti a `min(52vw, 420px)`).

### 2.6 Salti e focus

- Ogni link a un banco: calcola lo scroll, salta (con `behavior: smooth`
  solo se non c'è reduced motion e la distanza è sotto le 3 finestre; oltre,
  salto istantaneo per non far "correre" la striscia a lungo), poi focus
  sull'`h2` del banco con `preventScroll: true`.
- `scroll-margin-top: 72px` sugli `h2` verticali (pane fisso, bottega).

---

## 3. Arco emotivo (flusso dello scroll)

L'arco è una mattina in bottega: entri, tocchi, guardi, ti viene fame, ti fidi,
ti fai festa, ti fermi al banco e dici "il solito", te ne vai sapendo dove
tornare. **Il picco è il pane fisso**, non l'apertura.

| # | Banco | Lunghezza indicativa (desktop / mobile) | Emozione | Cosa trattiene | Cosa porta avanti |
|---|---|---|---|---|---|
| 0 | L'impasto | 100svh / 100svh | **curiosità tattile** | premi e la fossetta torna su piano piano; una frase spiega cosa hai visto | la domanda "e cosa ci fate, con questo impasto?"; "Il pane fisso" per chi sa già |
| 1 | Il pane | circa 3.400 px di striscia / 7 schermate di pollice | **fame e riconoscimento** ("questo è il mio pane") | un pane per volta, grande, con i suoi giorni e il prezzo al chilo | segnare "Nel pane fisso" senza uscire dal cammino |
| 2 | La madre | circa 900 px / 1,3 schermate | **fiducia** | una foto, tre frasi, un numero (18 ore) | la ragione per cui il pane dura: il pane fisso può essere due volte a settimana |
| 3 | I dolci | circa 2.900 px / 7 schermate | **festa** | la carta azzurra entra da destra come un foglio steso sul bancone: cambia la stagione del cammino | la domenica |
| 4 | La domenica | circa 1.600 px / 2,5 schermate | **affetto, rito** | il vassoio si riempie con le paste che tocchi | "il vassoio si mette nel pane fisso": il cammino finisce al banco |
| 5 | Il pane fisso | 100-140vh / circa 280svh | **calma, abitudine, controllo** (climax) | la tua settimana si compone e si scrive da sola in una frase, con la cifra onesta | "Tieni da parte": il sacchetto col tuo nome |
| 6 | La bottega | 90vh / 110svh | **radicamento** | c'è un posto vero, orari, chi c'è | chi non vuole scrivere chiama o passa |

Regole di ritmo:
- Tra i banchi della striscia nessun divisore: solo lo spazio di un cartello
  (il titolo del banco sta sul piano come un cartello di vetrina, 5.3).
- La madre (2) è stretta e ferma: una pausa tra due tratti lunghi.
- Chi non vuole seguire l'arco ha sempre "Il pane fisso" a un tocco (testata,
  impasto) e la riga dei banchi.
- **Chi torna dopo un invio**: l'impasto ha già un segno di dito leggero (il
  suo) e sotto il titolo, al posto della riga di testo, "Il tuo pane è da
  parte, Marta." Il pane fisso si apre nello stato "Da parte" (5.8). Il resto
  dell'arco non cambia.
- Lunghezza totale della vetrina: circa 8.800 px di cammino a 1440 (≈ 9,8
  schermate di scroll verticale), circa 17 schermate a 375. Il cammino non si
  allunga artificialmente: 1 px di scroll verticale = 1 px di striscia.

---

## 4. Tre journey fino alla prenotazione

Il visitatore vero del Concept Lab è un **panettiere o pasticcere** che arriva
da cicerilab.com e si mette nei panni dei suoi clienti. Le tre storie sono i
clienti di MADRE (dai pubblici del brand-strategist); l'ultima riga dice cosa
vede il panettiere.

### 4.1 Marta, il pane di tutti i giorni (mobile, 375, da un post Facebook)

**Contesto**: martedì sera, divano, telefono. Compra la segale il martedì e il
venerdì e la pagnotta grande il sabato, da anni, e fa la coda. Arriva da
`/concept-17?pane=segale` (il post parla della segale).

1. **Impasto**: legge "premi. se torna su piano piano, è pronto." Preme col
   pollice al centro: la fossetta si scava, lascia, torna su piano piano.
   Compare accanto la frase "torna su piano piano: è pronto." Scorre col
   pollice dal bordo: lo scroll parte subito.
2. **Pane**: la striscia avanza di lato mentre il pollice scorre in
   verticale. La segale è già segnata "scelta" (parametro). Si ferma sulla
   pagnotta di madre, legge "1 kg 5,80 €, martedì-domenica", tocca "Nel pane
   fisso": il bottone diventa "Scelta" con la spunta, e nella riga dei banchi
   "pane fisso" riceve un piccolo "2" (due pani scelti).
3. Salta la madre e i dolci toccando "pane fisso" nella riga dei banchi.
4. **Pane fisso**: la fila dei pani in alto ha segale e pagnotta per prime,
   con "scelta sul bancone". Il martedì mostra l'esempio fantasma "per esempio:
   la segale". Tocca la segale: resta "in mano" (bordo inchiostro, "scegli i
   giorni"), i giorni in cui si fa (martedì, venerdì) diventano carta da
   zucchero. Tocca martedì e venerdì: in ognuno compare la riga "segale 500 g,
   1" con meno e più. Tocca di nuovo la segale per posarla.
5. Prende la pagnotta, tocca sabato; nel sabato la riga "pagnotta di madre"
   parte da 500 g: tocca "1 kg" (due bottoni di pezzatura). Per errore tocca
   lunedì: il lunedì dice "Il lunedì siamo chiusi", niente cambia.
6. La barra del riassunto in basso dice, su due righe: "segale martedì e
   venerdì, pagnotta 1 kg sabato. Circa 13,00 € a settimana." Tocca "Vai
   all'invio".
7. Scrive "Marta" e il numero. Tocca "Tieni da parte". Il bottone dice "Un
   momento…"; poi il successo: i bordi dei tre scomparti con il pane diventano
   crosta, e al posto del bottone "Fatto, Marta. Martedì 29 la tua segale è
   pronta col tuo nome sul sacchetto, dalle 7." Tocca "Aggiungi al
   calendario": scarica il file `.ics` con le tre ricorrenze.

**Attriti da evitare**: lo scroll bloccato sull'impasto (decisione 0.2);
dover trovare da sola in quali giorni si fa la segale (i giorni si colorano
appena il pane è in mano); tastiera che copre il campo (5.8); perdere la
settimana chiudendo la scheda (bozza in `localStorage`).
**Il panettiere vede**: il quaderno di Sabrina diventa un servizio, e la coda
del martedì si accorcia.

### 4.2 Davide, la domenica dai suoceri (desktop 1440, da Google "vassoio paste Pordenone")

**Contesto**: ufficio, venerdì a pranzo. Ogni due domeniche pranzo dai suoceri,
e la suocera non ama i cannoncini. Vuole il vassoio e basta, ma già che c'è la
ciabatta.

1. **Impasto**: preme una volta col mouse, due secondi di curiosità. Clicca
   "dolci" in testata: la striscia salta istantanea (distanza lunga) ai dolci,
   focus sull'`h2`.
2. **Dolci**: la carta azzurra è già stesa. Scorre con la rotella: gubana,
   strucolo. Arriva alla **domenica**: la foto larga del vassoio, sotto il
   vassoio vero in carta da zucchero. Clicca "Sul vassoio" su bignè,
   diplomatiche e sfogliatine: il vassoio si riempie (gli angoli si piegano una
   volta, 300 ms). Clicca "Il pane fisso" sotto il vassoio.
3. **Pane fisso**: la domenica ha già il vassoio con le tre paste preferite.
   Sceglie 750 g ("circa 18 paste") e "una domenica sì e una no".
4. Trascina la ciabatta col mouse sulla domenica: mentre trascina, i giorni in
   cui si fa diventano azzurri. La posa. Poi prova a trascinare il filone sulla
   domenica: il gettone torna al suo posto e la domenica dice "la domenica
   facciamo solo pagnotta e ciabatta, fino alle 12.30".
5. Legge la frase a destra: "La tua settimana: ciabatta la domenica. Vassoio da
   750 g, una domenica sì e una no: bignè, diplomatiche, sfogliatine. Circa
   1,50 € a settimana di pane, più 25,50 € il vassoio ogni due domeniche. Si
   paga al ritiro."
6. Scrive nome ed email, "Tieni da parte". **Invio fallito** (simulato, 5.8):
   "Non è partito. Riprova, o chiamaci." La settimana è intatta. Riprova:
   successo. Clicca "Aggiungi al calendario": il file ha la ricorrenza ogni due
   domeniche.

**Attriti da evitare**: essere costretto a percorrere tutto il pane per
arrivare ai dolci (voce "dolci" in testata); non capire quante paste sono 750
g (numero di paste sempre accanto al peso); perdere il vassoio all'errore.
**Il panettiere vede**: la pasticceria della domenica ha i vassoi prenotati il
venerdì, e sa quante paste fare.

### 4.3 Lucia, da tastiera con lettore di schermo (desktop, NVDA)

**Contesto**: 67 anni, ipovedente, usa NVDA e la tastiera. La figlia le ha
mandato il link. Vuole l'integrale il giovedì.

1. Primo Tab: "Salta al pane fisso, link". Lo salta per curiosità: secondo
   Tab "Torna in Ciceri Lab", poi MADRE, pane, dolci, la bottega, "Il pane
   fisso". Poi il bottone dell'impasto: "Fai la prova del dito sull'impasto,
   pulsante". Preme Spazio: sente, una volta, "torna su piano piano: è pronto.
   il pane di oggi è stato impastato ieri sera."
2. Tab: entra nella vetrina. Ogni prodotto è un `article` con `h3`; NVDA legge
   nome, righe, prezzo, giorni; il Tab si ferma su "Nel pane fisso"
   (`aria-label`: "Metti l'integrale nel pane fisso") e la striscia si sposta
   da sola a quel prodotto. Freccia destra: prodotto successivo. Preme Invio
   sull'integrale: "Integrale scelto per il pane fisso".
3. Con H arriva all'`h2` "Il pane fisso". La fila dei pani è una lista di
   bottoni. Invio sull'integrale: "Integrale in mano. Si fa martedì, giovedì e
   sabato. Scegli i giorni." Tab ai giorni: sono bottoni con `aria-pressed`;
   su giovedì: "Giovedì, si fa, non scelto". Invio: "Integrale 500 grammi,
   uno, messo giovedì." Esc: "Integrale posato."
4. Tab dentro il giovedì: "Meno, integrale", "1 pezzo", "Più, integrale".
5. Tab alla frase riassuntiva (regione `aria-live` con debounce): la legge con
   le frecce. Campi con etichetta: nome, "telefono o email". Lascia vuoto il
   nome e preme "Tieni da parte": il focus va al campo nome, NVDA legge
   "Nome per il sacchetto, obbligatorio, non valido. Scrivi il nome da mettere
   sul sacchetto." Lo scrive, reinvia.
6. Successo: il focus va alla frase "Fatto, Lucia. Giovedì 1 ottobre il tuo
   integrale è pronto col tuo nome sul sacchetto, dalle 7." Poi Tab su
   "Aggiungi al calendario" e "Cambia la settimana".

**Attriti da evitare**: un gesto senza alternativa (trascinare ha sempre tocca
e tocca e tastiera); annunci a ogni lettera o a ogni pixel di scroll; la
striscia che non segue il focus; errori detti solo col colore.
**Il panettiere vede**: anche la cliente che non vede bene ordina da sola.

---

## 5. Wireframe testuali per schermata

Convenzioni:
- **1440 × 900**: margine sinistro dell'area viva **x 248** (allineato a
  MADRE, lascia libero il ConceptBackButton), margine destro 40 px. Per le
  sezioni verticali: area viva 1152 px (x 248-1400) su 12 colonne con canalino
  24 px (colonna ≈ 74 px), "c1-c6" = colonne 1-6.
- **Piano del bancone** (desktop): riga orizzontale color crosta, spessore
  8 px, a **y = 64% della finestra** (576 px su 900). Sopra: i prodotti e i
  loro testi. Sotto: il "fronte" del bancone con i cartellini.
- **375**: margini laterali 20 px, area viva della striscia 509 px di altezza
  (2.4). Piano del bancone a **y = 56 + 0,50 × 509 ≈ 310 px** dall'alto.
- Ordine di lettura = ordine nel DOM = ordine di tabulazione, salvo dove
  detto.
- ◆ = interattivo. ▒ = superficie WebGL (con fallback, `aria-hidden`). ▦ = foto
  vera.

### 5.1 L'impasto (`#impasto`, apertura)

**1440 × 900**

```
y 0     | [riservato]  MADRE        pane  dolci  la bottega          [ Il pane fisso ] |
y 64    |▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
y 120   |▒  H1 "premi. se torna su          ▒  ◆ l'intera superficie è il bottone          ▒|
        |▒  piano piano, è pronto."         ▒    "Fai la prova del dito sull'impasto"       ▒|
        |▒  c1-c6 (x 248-760), 2 righe      ▒    (canvas a tutta finestra sotto; il        ▒|
        |▒  riga Karla 18 px, ≤ 16 parole   ▒     bottone copre l'area dell'impasto        ▒|
        |▒  "MADRE, panificio e pasticceria ▒     esclusa la colonna del testo)            ▒|
        |▒   a Pordenone."                  ▒                                              ▒|
y 360   |▒  ◆ [ Il pane fisso ]             ▒        ( ) zona dove cade la prima prova      ▒|
        |▒                                  ▒            del mouse: centro-destra           ▒|
y 600   |▒  zona della spiegazione (aria-live): compare qui, sotto il bottone, c1-c5,      ▒|
        |▒  "torna su piano piano: è pronto. il pane di oggi è stato impastato ieri sera." ▒|
y 900   |▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
```

- Elementi di testo: H1, una riga, un bottone. La spiegazione arriva solo
  dopo la prima prova (non conta nel primo sguardo). Niente occhiello, niente
  "Scorri", niente orari.
- La testata è sopra l'impasto (trasparente). L'impasto va a tutta finestra,
  anche sotto la testata.
- Il testo sta in alto a sinistra, **fuori** dalla zona dove si preme; il
  bottone dell'impasto è un elemento posizionato sopra il canvas che esclude la
  colonna del testo (così il testo resta selezionabile e il bottone "Il pane
  fisso" non è dentro un altro bottone).
- LCP = H1 in DOM, presente dal primo frame. Il canvas arriva dopo; fino al
  primo frame disegnato si vede la foto di fallback (stessa inquadratura).
- Stato "dopo l'invio": un segno leggero già fatto al centro-destra
  (profondità 15%, non si cancella) e la riga diventa "Il tuo pane è da parte,
  Marta."

**375 × 667 (il caso più stretto) e 375 × 812**

```
y 0     | MADRE                                            |  testata 56 px, senza bottone
y 72    | H1 "premi. se torna su                           |  Bricolage 34-36 px, max 3 righe
        |     piano piano, è pronto."                      |  (x 20-300: non tocca la destra)
y 190   | riga Karla 16 px, max 2 righe                    |
y 250   |▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
        |▒        zona di prova: 60% centrale             ▒|  y 250-560: sotto il pollice
        |▒        (x 38-337, y 250-560)                   ▒|
        |▒   spiegazione aria-live compare qui sotto,     ▒|
        |▒   y 520-570, Karla 16 px, su fondo farina 90%  ▒|
y 609   |[← TORNA IN CICERI LAB]      ◆ [ Il pane fisso ] |  piano 1: x 216-359, 44 px
```

- Tutto il primo schermo: bottone "Il pane fisso" visibile a 375×667 senza
  scroll (verifica obbligatoria del responsive-tester).
- L'impasto va anche sotto il testo (è lo sfondo); il bottone dell'impasto
  copre solo la zona di prova.
- Scroll: parte da qualsiasi punto, anche dall'impasto (decisione 0.2).
  Soglia: se il dito si sposta di più di 12 px in verticale entro i primi
  120 ms, il browser scorre e la fossetta si rilascia.

### 5.2 La vetrina (contenitore della striscia)

**Meccanica (uguale a tutte le larghezze, salvo il modo in colonna)**
- Un contenitore alto `lunghezza striscia - larghezza finestra + altezza
  finestra`; dentro, un elemento `position: sticky; top: 0; height: 100svh`
  con la striscia traslata in `x` (transform) secondo lo scroll verticale.
  Rotella, trackpad, barra spaziatrice, PagSu/PagGiù, Home/Fine: tutto
  nativo. Il trackpad orizzontale (deltaX) viene tradotto in scroll verticale
  1:1. Su touch, il gesto orizzontale sulla striscia (`touch-action: pan-y`
  sulla striscia, i movimenti orizzontali arrivano al JS) viene tradotto in
  scroll verticale 1:1 con un'inerzia breve al rilascio (niente inerzia con
  reduced motion).
- Il fondo appartiene alla striscia: la carta da zucchero è un pannello della
  striscia che comincia al cartello dei dolci, quindi **entra da destra da
  sola** mentre si cammina. Il suo bordo sinistro non è una riga dritta: è il
  bordo di un foglio (disegno dell'art-director). Con reduced motion il fondo
  sotto i fissi cambia con una dissolvenza di 200 ms quando il banco attivo
  diventa "dolci".
- Il piano del bancone è un unico elemento lungo tutta la striscia (non uno per
  prodotto): i prodotti ci poggiano sopra. Continua sotto il foglio azzurro (il
  foglio è steso sopra il bancone, il piano resta visibile come bordo davanti).
- Il canvas dell'impasto si smonta quando la vetrina occupa tutta la finestra.
- **Tastiera**: vedi 6.4. **Modo in colonna**: vedi decisione 0.3 e 5.10.

**1440 × 900: struttura verticale della finestra durante il cammino**

```
y 0    | testata 64 px                                                              |
y 64   |                                                                            |
       |   area dei prodotti: la foto poggia sul piano; testo accanto, sopra il piano|
y 576  |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ piano del bancone, 8 px ━━━━━━━━━━━━━━━━━━━━━|
       |   fronte del bancone: cartellini appesi sotto ogni prodotto (prezzo,      |
       |   giorni, ◆ gesto), y 600-800                                              |
y 852  | riga dei banchi 48 px                                                      |
```

**375 × 667**

```
y 0    | MADRE                                    [ Il pane fisso ] |
y 56   |   foto del prodotto, poggia sul piano: altezza max 230 px    |
y 310  |━━━━━━━━━━━━━━━━━━━━ piano del bancone, 6 px ━━━━━━━━━━━━━━━━━|
y 326  |   nome (Bricolage 26 px), 2 righe (Karla 16), prezzo,       |
       |   giorni, ◆ gesto 44 px. Fine blocco ≤ y 560                |
y 565  | riga dei banchi (piano 2)                                    |
y 609  | [← TORNA IN CICERI LAB]                                      |
```

- Blocco prodotto su mobile: **84vw (315 px)** di larghezza, il successivo si
  vede per 16vw a destra (60 px), margine iniziale 20 px.

### 5.3 Il banco del pane (`#pane`)

**1440**

```
 cartello              prodotto 1                      prodotto 2              prodotto 3 …
| H2 "il pane"   |  ▦▦▦▦▦▦▦▦▦▦▦▦▦▦  pagnotta di madre  |  ▦▦▦▦▦▦▦▦  segale     |  ▦▦▦▦▦▦ …
|  Bricolage      |  ▦ mollica    ▦  (Bricolage 40 px) |  ▦ crosta ▦  e cumino |
|  ~150 px, su    |  ▦ tagliata   ▦  2 righe Karla 17  |  ▦ cumino ▦  2 righe  |
|  2 righe, poggia|  ▦ 460×360    ▦  x = bordo foto+32 |  ▦ 300×250▦           |
|  sul piano      |  ▦▦▦▦▦▦▦▦▦▦▦▦▦▦  (testo in basso,   |  ▦▦▦▦▦▦▦▦             |
|  riga Karla:    |                  allineato al piano)|                       |
|  "sei pani, una |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
|  madre sola"    |  cartellino: 1 kg 5,80 € · 500 g   |  500 g 3,60 €         |
|  larghezza      |  2,90 € · 5,80 € al chilo          |  7,20 € al chilo      |
|  520 px         |  si fa: da martedì a domenica      |  si fa: martedì e     |
|                 |  ◆ [ Nel pane fisso ]              |  venerdì  ◆ [ … ]     |
```

- **Scala vera**: la larghezza della foto segue il pane reale. Proposta
  (desktop, altezza della foto): pagnotta 1 kg 360 px, integrale 300, filone
  di semola 230 (ma lunga: 520×230), segale 250, pan di sorc 280, ciabatta 200
  (larga 420). Mobile: stesse proporzioni, massimo 230 px di altezza e 275 px di
  larghezza.
- Distanza tra prodotti: 96 px desktop, 0 su mobile (il blocco è già 84vw).
- Ordine dei sei pani (dal più comprato al più raro): pagnotta di madre,
  ciabatta, integrale, segale e cumino, filone di semola, pan di sorc. Con
  `?pane=` l'ordine **non** cambia (la vetrina è una sola); il pane indicato è
  solo segnato "scelto".
- Ogni pane nel DOM è un `<article aria-labelledby>` con `h3` (nome), `p` (due
  righe), un `dl` (pezzatura e prezzo, al chilo, giorni) e il bottone.
- La domenica si dice sul pane, non in un avviso: sotto la pagnotta e la
  ciabatta, nei giorni, "anche la domenica"; gli altri non lo dicono.
- Pan di sorc: "venerdì e sabato, da ottobre a Pasqua" (riga di testo; la
  validazione del pane fisso guarda solo i giorni).
- Piano B della foto (creative-director 4.6): un pane senza foto verificata sta
  sul piano come casella più piccola solo testo (nome, righe, cartellino).

◆ **"Nel pane fisso"** (su ogni pane): **non porta via dal cammino**. È un
interruttore (`aria-pressed`): segna il pane come scelto. Etichetta visibile
"Nel pane fisso" → "Scelto" con spunta disegnata; `aria-label` "Metti la segale
nel pane fisso" / "Togli la segale dal pane fisso". Effetti: la voce "pane
fisso" della riga dei banchi mostra il numero di pani scelti (testo, non un
pallino: "pane fisso 2"); nel pane fisso i pani scelti vengono per primi con
"scelto sul bancone". Annuncio `aria-live`: "Segale scelta per il pane fisso."

**375**: un pane per blocco (5.2). Il cartello "il pane" è un blocco da 70vw
con H2 su due righe (Bricolage 56 px) e la riga Karla, poggiato sul piano.

### 5.4 La madre (`#madre`, intermezzo)

**1440** (larghezza 900 px nella striscia)

```
| ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦    H2 "la madre"   (Bricolage 64 px)             |
| ▦ il vasetto di vetro,    ▦  tre frasi, Karla 17 px, max 44 caratteri       |
| ▦ bolle in superficie     ▦  per riga:                                      |
| ▦ 420×380, poggia sul     ▦  1 il vasetto portato da Spilimbergo           |
| ▦ piano                   ▦  2 ogni giorno farina e acqua                   |
| ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦    3 circa 18 ore: per questo dura tre giorni     |
|━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━|
|  sotto il piano: nulla. È una pausa: nessun bottone, nessun cartellino.     |
```

- Il numero 18 non è un contatore e non si anima: è testo.
- Il fondo "vira" (creative-director): nessun gradiente; il bordo del foglio
  azzurro comincia a vedersi al margine destro alla fine di questo banco.

**375**: un blocco da 84vw: foto sopra il piano (220 px), sotto H2 e le tre
frasi (Karla 16, massimo 8 righe in tutto: se non ci stanno in 250 px, il
blocco diventa largo 2 × 84vw con foto a sinistra e testo a destra nel
secondo schermo).

### 5.5 Il banco dei dolci (`#dolci`)

**1440**: stessa grammatica del pane (5.3), su **carta da zucchero**. Cartello
"i dolci" + riga ("dall'altra parte della vetrina, i dolci di Giulia"), poi sei
dolci: gubana, strucolo di mele, crostata di marmellata, esse, biscotti di
frolla, pinza. Scala vera: gubana grande 1 kg 320 px, strucolo lungo
(480×200), crostata 24 cm 300, esse e biscotti piccoli (180 e 160 px), pinza
260 (o casella senza foto, piano B).

- Cartellino: prezzo al chilo e del pezzo intero, "quando c'è" (tutto l'anno /
  a Pasqua, su ordinazione). **Nessun bottone "Nel pane fisso"** sui dolci: non
  entrano nella settimana. Ogni dolce ha le sue due righe con gli ingredienti
  veri e, per la gubana, "dura una settimana, incartata".
- La pinza ha una riga in più: "è la pinza di Pasqua con i tre tagli, non
  quella veneta dell'Epifania".
- Alla fine del banco, sul piano, un cartello di testo (non un prodotto):
  "Un dolce intero per un giorno preciso? Chiamaci o scrivici due giorni
  prima." ◆ "Chiama" ◆ "Scrivi" (link, niente numero in vista). È una
  conversione alternativa, non un secondo richiamo di prenotazione.
- Testo in inchiostro su carta da zucchero (5,06:1). **Mai crosta come testo qui**:
  i prezzi sui dolci sono in inchiostro 700 (regola del creative-director
  4.1). Il piano del bancone resta crosta (non è testo).

**375**: come il pane; il cartello finale "Un dolce intero" è un blocco da
84vw con i due link a larghezza piena (52 px), uno sotto l'altro.

### 5.6 Il vassoio della domenica (`#domenica`)

**1440** (circa 1.600 px nella striscia, carta da zucchero)

```
| H2 "la domenica"    ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦ foto larga del vassoio vero     |
| riga: "le paste di   ▦ 760×380, poggia sul piano                ▦                               |
|  Giulia, a peso,     ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦                                 |
|  incartate nella                                                                                 |
|  carta da zucchero"  le cinque paste, in fila sopra il piano a destra della foto:               |
|                      bignè · cannoncini · diplomatiche · sfogliatine · krapfen                   |
|                      ogni pasta: nome (Bricolage 28), una riga, ◆ [ Sul vassoio ]               |
|━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━|
|  sotto il piano: IL VASSOIO (oggetto: rettangolo in carta da zucchero più scura/diversa per     |
|  grana, angoli piegati), 520×150, con dentro le paste scelte scritte per nome;                  |
|  accanto: "500 g, circa 12 paste, 17,00 € · 750 g, circa 18, 25,50 € · 1 kg, circa 24, 34,00 €" |
|  "34,00 € al chilo"   ◆ [ Il pane fisso ]  (porta al vassoio dentro il pane fisso)              |
```

- ◆ **"Sul vassoio"** su ogni pasta: interruttore (`aria-pressed`), fino a 4
  paste preferite; il vassoio sotto il piano mostra i nomi scelti. Alla quinta:
  il bottone non si accende e sotto il vassoio compare "Sul vassoio ci stanno
  quattro preferenze: togline una." Nessuna pasta scelta: il vassoio dice
  "misto: un po' di tutto".
- Quando la prima pasta va sul vassoio gli angoli si piegano (una volta,
  300 ms; reduced motion: già piegati). Lo stato del vassoio è lo stesso del
  pane fisso (condiviso).
- Il bottone "Il pane fisso" qui è l'unica ripetizione del richiamo nella
  striscia: è la fine del cammino. `aria-label`: "Il pane fisso: metti il
  vassoio nella tua settimana".

**375**: blocco 1 (84vw): H2 e riga. Blocco 2 (84vw): foto del vassoio sopra
il piano. Blocchi 3-4 (84vw ciascuno): le cinque paste come elenco verticale
sopra e sotto il piano (nome + "Sul vassoio" per riga, righe da 52 px). Blocco
5 (84vw): il vassoio con le paste scelte, i tre pesi, "Il pane fisso" a
larghezza piena. Alla fine della striscia il piano del bancone esce a destra
e il pane fisso arriva da sotto (5.7).

### 5.7 Il pane fisso (`#pane-fisso`), il banco più importante

Arrivo: la striscia finisce, il contenitore sticky scorre via verso l'alto e
sotto c'è il pane fisso, su **farina**. Il piano del bancone riappare in cima
al pane fisso alla stessa quota visiva in cui è uscito (la riga su cui
poggiano i gettoni della fila dei pani): continuità del bancone.

**1440**

```
| H2 "il pane fisso"   c1-c8, Bricolage 72 px                                                   |
| una frase: "Fai la tua settimana una volta. Noi la teniamo pronta col tuo nome."  c1-c7       |
|                                                                                               |
| LA FILA DEI PANI (c1-c8), gettoni che poggiano sul piano:                                     |
|  ◆[▦96] pagnotta  ◆[▦96] ciabatta  ◆[▦96] integrale  ◆[▦96] segale  ◆[▦96] filone  ◆[▦96] sorc |
|   5,80 €/kg        1,50 € il pezzo   …  (nome Karla 15 700, prezzo 15)                        |
|━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━|
| LA SETTIMANA (c1-c8), otto scomparti sotto il piano:              | LA FRASE (c9-c12, sticky  |
| ┌───┬─────────┬─────────┬─────────┬─────────┬─────────┬──────────┐ |  top 88 px):              |
| │lun│ martedì │mercoledì│ giovedì │ venerdì │ sabato  │ domenica │ | "La tua settimana:        |
| │   │         │         │         │         │         │┌────────┐│ |  segale 500 g martedì e   |
| │chi│ qui il  │ qui il  │ qui il  │ qui il  │ qui il  ││VASSOIO ││ |  venerdì, pagnotta 1 kg   |
| │uso│ tuo pane│ tuo pane│ tuo pane│ tuo pane│ tuo pane││ carta  ││ |  sabato. Circa 13,00 € a  |
| │   │ (esempio│         │         │         │         ││zucchero││ |  settimana. Si paga al    |
| │   │ fantasma│         │         │         │         │└────────┘│ |  ritiro."                 |
| │   │ segale) │         │         │         │         │ pagnotta │ | "Il primo sacchetto è     |
| │   │         │         │         │         │         │ e ciabatta| |  pronto martedì 29        |
| │   │         │         │         │         │         │ fino 12.30| |  settembre, dalle 7."     |
| └───┴─────────┴─────────┴─────────┴─────────┴─────────┴──────────┘ | tre rassicurazioni:       |
|  lun 64 px; mar-sab ~118 px; dom ~200 px (vassoio + 2 pani)       | si paga al ritiro · lo    |
|  altezza scomparto min 280 px, cresce con le righe                | sospendi con un messaggio |
|                                                                    | · nessun account          |
| VASSOIO (sotto la settimana, c1-c8, solo se c'è il vassoio):       | ─ invio ─                 |
|  peso ◆500 g ◆750 g ◆1 kg  (radio, con "circa 12/18/24 paste")      | ◆ Nome per il sacchetto   |
|  quando ◆ogni domenica ◆una domenica sì e una no                    | ◆ Telefono o email        |
|  paste ◆misto ◆bignè ◆cannoncini ◆diplomatiche ◆sfogliatine ◆krapfen| ◆ [ Tieni da parte ]      |
|  ◆ togli il vassoio                                                 | zona messaggi (live)      |
```

- **Fila dei pani**: `<ul>` di 6 bottoni (gettone: foto quadrata 96 px, nome,
  prezzo principale). I pani "scelti sul bancone" vengono per primi, con la
  riga "scelto sul bancone" sotto il nome. Un settimo gettone in fondo alla
  fila è **"il vassoio"** (angoli piegati, carta da zucchero, 96 px): si mette
  solo sulla domenica.
- **Scomparti**: ogni giorno è un `<li>` con intestazione (nome del giorno +
  data della prima settimana utile in piccolo, "29 set") e un bottone-giorno
  (`aria-pressed` quando c'è un pane in mano: "metti qui"). Dentro, le righe
  dei pani messi: nome, pezzatura (◆ 500 g / ◆ 1 kg dove esiste, radio da
  44 px), quantità con ◆ meno e ◆ più (44×44), nessuno slider.
- **Lunedì**: scomparto stretto, fondo farina più scuro/tratteggio (art-director),
  testo "lunedì siamo chiusi". Non è un bottone; se si prova a metterci un pane
  (trascinando o toccando) lo scomparto dice "Il lunedì siamo chiusi".
- **Domenica**: dentro, in alto, il posto del vassoio; sotto, fino a due pani
  (pagnotta e ciabatta). Riga fissa in piccolo: "la domenica solo pagnotta e
  ciabatta, fino alle 12.30".
- **La frase** a destra resta ferma (sticky) mentre si lavora sulla
  settimana: è sempre visibile. Sotto, le tre rassicurazioni e l'invio.
- Riga di servizio sotto l'invio, piccola: "Cambi e sospensioni entro le 12
  del giorno prima, con un messaggio o una telefonata." e "Ad agosto il pane
  fisso si ferma da solo e riparte."

**Come si mette un pane in un giorno** (tre modi equivalenti, dal
creative-director 4.4)

1. **Trascinare** (mouse, penna, dito): pointer down su un gettone, dopo 8 px
   di movimento parte il trascinamento (prima è un tocco). Un clone del
   gettone segue il puntatore. I giorni in cui quel pane si fa diventano carta
   da zucchero con "si fa"; gli altri restano farina con la riga "la segale si
   fa martedì e venerdì". Rilascio su un giorno valido: il pane entra (1
   pezzo, pezzatura più piccola). Rilascio fuori da ogni giorno o su uno non
   valido: il clone torna al gettone (320 ms; reduced motion: sparisce e il
   gettone resta dov'era). Su touch il trascinamento del gettone ha
   `touch-action: none` **solo sul gettone** (è piccolo: il resto della pagina
   scorre); vicino ai bordi della finestra (48 px) la pagina scorre da sola
   durante il trascinamento.
2. **Tocca e poi tocca** (il modo principale su mobile): tocco sul gettone =
   "in mano" (bordo inchiostro 2 px, "scegli i giorni" sotto il nome,
   `aria-pressed="true"`). Tocchi i giorni: ogni giorno valido riceve il pane
   (un secondo tocco sullo stesso giorno aggiunge un pezzo, fino a 6). Tocchi
   di nuovo il gettone (o un altro gettone, o Esc) per posarlo. Un solo pane in
   mano per volta.
3. **Tastiera**: vedi 6.6.

**Togliere**: meno fino a zero (la riga sparisce, annuncio "Segale tolta da
martedì"), oppure trascinare la riga fuori dallo scomparto (la riga ha una
maniglia `aria-hidden`; la stessa azione da tastiera è il meno).

**375**

```
| H2 "il pane fisso" (Bricolage 44 px, 2 righe)                 |
| frase d'ingresso Karla 16, 3 righe                            |
| LA FILA DEI PANI: riga scorrevole in orizzontale, gettoni 72 px|
|  ◆[▦] pagnotta ◆[▦] ciabatta ◆[▦] integrale ◆[▦] …  →         |  altezza 128 px, scroll-snap,
|━━━━━━━━━━━━━━━━━━ piano del bancone ━━━━━━━━━━━━━━━━━━━━━━━━━━|  il 4° gettone si vede a metà
| LA SETTIMANA: otto righe                                      |
| lunedì      lunedì siamo chiusi                               |  48 px, non interattiva
| martedì     ◆ metti qui    (per esempio: la segale)           |  min 56 px; cresce con i pani
|             segale 500 g   ◆−  1  ◆+                          |  riga pane: 52 px
| mercoledì   ◆ metti qui                                        |
| giovedì     ◆ metti qui                                        |
| venerdì     ◆ metti qui                                        |
| sabato      ◆ metti qui                                        |
| domenica    ◆ metti qui  · solo pagnotta, ciabatta e vassoio   |
|             [VASSOIO angoli piegati] 750 g · una sì e una no  |
| VASSOIO (se c'è): peso 3 bottoni in riga (100×52), quando 2    |
|  bottoni in colonna, paste 6 bottoni 2×3 (160×48)              |
| LA FRASE per intero (Karla 17), le tre rassicurazioni          |
| INVIO: Nome per il sacchetto, Telefono o email (56 px, 17 px)  |
| ◆ [ Tieni da parte ] larghezza piena, 56 px                     |
| zona messaggi                                                  |
| spazio finale = piano 2 + piano 1 + 24 px                      |
| barra del riassunto (piano 2, fissa): vedi 5.8                 |
```

- Otto righe e non otto colonne: su 375 sette colonne sono troppo strette per
  il pollice. Il nome del giorno a sinistra (colonna 92 px), a destra il
  bottone "metti qui" (compare solo con un pane in mano; senza, la riga dice
  "qui il tuo pane" in inchiostro normale) e i pani messi.
- Con un pane in mano, i giorni validi hanno fondo carta da zucchero e "si fa";
  quelli non validi restano farina con la riga di motivo in piccolo. A 375 la
  settimana è più alta della finestra e la fila dei pani esce di vista:
  quando il pane è in mano compare **in cima**, sotto la testata, una striscia
  fissa da 48 px "In mano: segale · ◆ posala" (così si sa sempre cosa si sta
  mettendo, anche scorrendo fino alla domenica).
- Drag su mobile possibile ma secondario: il tocca e tocca è quello
  suggerito dalla frase d'ingresso ("tocca un pane, poi i giorni").

### 5.8 Riassunto, invio e stati del pane fisso

**La frase che si scrive da sola** (sempre visibile: colonna sticky a 1440,
barra fissa e poi testo in flusso a 375). Si compone dai dati, non da una
tabella:

- Struttura: "La tua settimana: " + per ogni pane l'elenco dei giorni (i
  giorni consecutivi con lo stesso pane si uniscono: "da martedì a sabato") +
  pezzatura se non è la più piccola + quantità se > 1 ("due ciabatte") + ". "
  + vassoio ("Vassoio da 750 g ogni domenica: bignè e diplomatiche.") + cifra.
- **Cifra** (da `prezzi.ts`, fonte unica del brand-strategist 7): somma dei
  pani della settimana + vassoio se "ogni domenica": "Circa 38,50 € a
  settimana." Con "una domenica sì e una no" due cifre separate, mai una media:
  "Circa 13,00 € a settimana di pane, più 25,50 € il vassoio ogni due
  domeniche." Sempre "circa" e sempre seguita da "Si paga al ritiro."
- **Prima data**: il primo giorno della settimana composta che sia almeno
  domani e per cui non siano passate le 12 del giorno prima (regola del
  brand-strategist 8), calcolato dall'ora vera del browser: "Il primo
  sacchetto è pronto martedì 29 settembre, dalle 7." (domenica: "dalle 7.30").
  Nessun conto alla rovescia, nessun orario che si aggiorna.

**Barra del riassunto a 375** (piano 2 in basso, al posto della riga dei
banchi, solo dentro `#pane-fisso` e prima che l'invio sia in vista):

```
chiusa (64 px):
| segale mar e ven, pagnotta 1 kg sab…      [ Vai all'invio ↓ ] |
| circa 13,00 € a settimana                  ◆ leggi tutto ▴     |
aperta (max 30% dell'altezza, scroll interno se serve):
| La tua settimana: … (frase intera)                  ◆ chiudi ▾ |
| Il primo sacchetto è pronto martedì 29 settembre, dalle 7.     |
```

- "leggi tutto" è un bottone con `aria-expanded`; la barra aperta non è una
  finestra modale (niente focus intrappolato), si chiude con "chiudi" o Esc.
- "Vai all'invio" scorre al blocco invio e mette il focus sul primo campo
  vuoto. **Non** invia: l'unico bottone di invio è "Tieni da parte" nel
  blocco invio (così non ci sono due invii e nessun invio parte col pollice
  per sbaglio).
- La barra sparisce quando il blocco invio è in vista (la frase è lì per
  intero) e quando la tastiera è aperta.

**Invio**: due campi, etichetta sopra, errore sotto, mai placeholder come
etichetta.

| Campo | Etichetta | Tipo | Regola |
|---|---|---|---|
| nome | "Nome per il sacchetto" | text, `autocomplete="given-name"` | obbligatorio, 2-24 caratteri |
| contatto | "Telefono o email" | text, `inputmode` passa a `email` se c'è una @, altrimenti `tel`; `autocomplete="tel"` | email valida o telefono italiano (9-11 cifre, spazi ammessi, +39 facoltativo) |

Sotto il contatto: "Ti chiamiamo o scriviamo solo per il tuo pane."
Bottone: **"Tieni da parte"**, 56 px, clic o Invio. Invio simulato nel
concept (circa 1,2 s, nessun dato spedito). Errore riproducibile: se il
browser è offline (`navigator.onLine === false`) o con `?prova=errore` nel
solo ambiente di sviluppo.

**Stati del pane fisso** (testi segnaposto per il copywriter)

| Stato | Quando | Cosa si vede | Messaggio (dove) |
|---|---|---|---|
| **Vuoto, primo arrivo** | nessuna bozza, nessun parametro | ogni scomparto "qui il tuo pane" a bassa voce; il martedì un gettone fantasma al 35% con tratteggio "per esempio: la segale" (non è un pane vero, `aria-hidden`, non conta) | frase: "La tua settimana è ancora vuota: comincia da un pane." |
| **Con scelte dal bancone** | pani segnati "Nel pane fisso" | i pani scelti in testa alla fila, "scelto sul bancone"; l'esempio fantasma usa il primo scelto nel suo primo giorno | frase: "Hai scelto la segale e la pagnotta sul bancone: mettile nei giorni." |
| **Bozza ritrovata** | rientro con `settimana` salvata | la settimana com'era | sopra la fila: "Abbiamo tenuto la tua settimana di prima." + ◆ "Ricomincia" |
| **Pane in mano** | tocco o Invio su un gettone | bordo inchiostro 2 px sul gettone, giorni validi in carta da zucchero con "si fa", non validi con il motivo; a 375 la striscia "In mano" in cima | live: "Segale in mano. Si fa martedì e venerdì. Scegli i giorni." |
| **Trascinamento** | gettone trascinato | clone sotto il puntatore, stessi colori dei giorni del "pane in mano"; il giorno sotto il puntatore ha bordo inchiostro 2 px | nessun annuncio durante (solo all'esito) |
| **Messo** | rilascio o tocco su giorno valido | riga nuova nello scomparto, 1 pezzo | live: "Segale 500 grammi, uno, messa martedì." |
| **Pezzo in più / in meno** | più e meno | numero aggiornato | live (debounce 600 ms): "Segale martedì: due." |
| **Tolto** | meno fino a zero o trascinato fuori | la riga sparisce; lo scomparto torna "qui il tuo pane" se vuoto | live: "Segale tolta da martedì." |
| **Giorno in cui non si fa** | rilascio o tocco su un giorno non valido | il clone torna al gettone (reduced motion: riappare), il giorno resta com'era | nello scomparto, sotto il nome del giorno, per 6 s e in live: "il pan di sorc si fa solo venerdì e sabato" |
| **Lunedì** | pane portato sul lunedì | nulla cambia | nello scomparto del lunedì: "Il lunedì siamo chiusi." |
| **Domenica, pane non ammesso** | pane diverso da pagnotta e ciabatta sulla domenica | nulla cambia | nello scomparto: "La domenica facciamo solo pagnotta e ciabatta, fino alle 12.30." |
| **Vassoio fuori dalla domenica** | gettone vassoio su un altro giorno | nulla cambia | "Il vassoio è solo la domenica." |
| **Oltre 6 pezzi** | più premuto a 6 | il più resta a 6 (`aria-disabled`, non `disabled`, per restare raggiungibile) | sotto la riga: "Per più di 6 pezzi chiamaci, così li mettiamo in conto nell'impasto." + ◆ "Chiama" |
| **Vassoio messo** | vassoio sulla domenica (da gettone, dal banco domenica o da `?vassoio=`) | dentro la domenica il vassoio con angoli piegati; sotto la settimana il blocco del vassoio (peso, quando, paste) | live: "Vassoio da 500 grammi, ogni domenica, misto." |
| **Quinta pasta preferita** | quinta pasta scelta | il bottone non si accende | sotto il gruppo paste: "Sul vassoio ci stanno quattro preferenze: togline una." |
| **Invio a settimana vuota** | "Tieni da parte" senza pani né vassoio | focus alla fila dei pani (primo gettone) | sopra la fila e in live: "Metti almeno un pane in un giorno." |
| **Nome mancante** | invio o uscita dal campo con nome vuoto (all'uscita solo se si è già scritto qualcosa) | campo con `aria-invalid`, bordo 3 px, segno "!" | sotto il campo: "Scrivi il nome da mettere sul sacchetto." |
| **Contatto non valido** | uscita dal campo o invio | come sopra | sotto il campo: "Scrivi un numero di telefono o un'email (nome@esempio.it)." |
| **Invio con più errori** | più campi sbagliati | il focus va al **primo** campo sbagliato; ogni errore sotto il suo campo | nessun riepilogo in alto (i campi sono due) |
| **Invio in corso** | dopo "Tieni da parte" valido | bottone "Un momento…", `aria-disabled`, settimana bloccata (gettoni e giorni `aria-disabled`); nessuna rotella, nessuno scheletro | live: "Un momento…" |
| **Successo** | risposta ok | la settimana resta ferma; il bordo di ogni scomparto con un pane diventa crosta (su farina); il vassoio resta com'è. Al posto del bottone e dei campi, frase in inchiostro. Focus su questa frase (`tabindex="-1"`). **Nessuna cartolina, ricevuta, scontrino o sacchetto disegnato** | "Fatto, Marta. Martedì 29 la tua segale è pronta col tuo nome sul sacchetto, dalle 7." + ◆ "Aggiungi al calendario" + ◆ "Cambia la settimana". `track("demo_prenotazione", …)` una volta |
| **Da parte (ritorno)** | rientro con `inviato` | come il successo, frase "La tua settimana è da parte, Marta." + le due azioni | nessun annuncio all'arrivo |
| **Cambia la settimana** | dopo il successo | settimana di nuovo modificabile, campi ricompilati con il nome (il contatto va riscritto: non è salvato) | bottone "Tieni da parte" di nuovo; al successo: "Aggiornato, Marta. Da martedì 29 vale la settimana nuova." |
| **Invio fallito** | offline o errore simulato | tutto resta com'è, settimana di nuovo modificabile, campi pieni | sotto il bottone, con segno "!": "Non è partito. Riprova, o chiamaci." (◆ "chiamaci" link, niente numero in vista). Focus sul messaggio |
| **Calendario** | "Aggiungi al calendario" | scarica `madre-pane-fisso.ics` generato nel browser: un evento ricorrente settimanale per ogni giorno con pani (07:00-07:15, "Pane fisso da MADRE: segale"), uno ogni 1 o 2 settimane per il vassoio (07:30); nessun dato del cliente oltre al nome | se il download non parte (iOS vecchi): link "Apri il file del calendario" |
| **Tastiera del telefono aperta** | focus in un campo, `visualViewport` < 75% | barra del riassunto e piani in basso nascosti; il campo attivo resta sopra la tastiera (`scroll-margin-bottom`) | nessuno |
| **Senza JavaScript / prerender** | HTML statico | vetrina e testi leggibili in colonna; al posto del pane fisso interattivo un paragrafo: "Il pane fisso si fa con due tocchi: qui serve JavaScript. Oppure chiamaci." | `<noscript>` |
| **Storage bloccato** | `localStorage` lancia | tutto funziona, niente bozza | nessun messaggio |

### 5.9 La bottega e il piede (`#bottega`, `<footer>`)

Fondo inchiostro, testo farina (creative-director 4.2, banco 6).

**1440**

```
| H2 "la bottega"  c1-c6, Bricolage 72 px                                               |
|                                                                                      |
| Via Cappuccini 31           c1-c5, Bricolage 40 px (l'indirizzo è il titolo del     |
| 33170 Pordenone             blocco, non una didascalia)                              |
| ◆ Apri in Maps ↗            (nuova scheda, detto nell'aria-label)                    |
|                                                                                      |
| orari come testo, dl, c1-c5:                    chi c'è, c7-c11, Karla 17:           |
|   lunedì      chiuso                            "Renzo fa il pane, Giulia i dolci,   |
|   da martedì a sabato  7-13 e 16.30-19.30        Sabrina ti mette da parte il        |
|   domenica    7.30-12.30                         sacchetto."                         |
|   ad agosto due settimane di ferie              "si parcheggia davanti per cinque   |
|                                                  minuti, il tempo del sacchetto"    |
| ◆ Chiama    ◆ Scrivi    (link, niente numero in vista)                               |
|──────────────────────────────── piede (footer) ──────────────────────────────────────|
| ◆ Il pane fisso      ◆ Ricomincia da capo (svuota bozza e "inviato", conferma in    |
|                        linea: "Sicuro? ◆ sì, ricomincia  ◆ no")                     |
| Foto: crediti con licenza e link (gubana: Eric Fung, CC BY-SA 2.0; …)  Karla 14      |
| MADRE è un'attività inventata. Un concept di CiceriLab.    Mandi.                    |
| (spazio finale 12vh)                                                                 |
```

- Nessuna mappa disegnata, nessun ritratto, nessuna tabella oraria a griglia
  (gli orari sono una lista di definizioni, una volta sola nel sito).
- Il "torna al Lab" è il ConceptBackButton (sempre visibile): nel piede non
  si aggiunge un secondo link di ritorno.

**375**: stessa sequenza in colonna; indirizzo Bricolage 30 px; "Apri in
Maps", "Chiama", "Scrivi" come tre bottoni pieni a larghezza piena, 52 px, uno
sotto l'altro (sono le conversioni alternative del telefono). Crediti in
lista, 14 px, link da 44 px di altezza. Spazio finale = piano 2 + piano 1 +
24 px, così la riga dei banchi e il ConceptBackButton non coprono l'ultimo
link.

### 5.10 Modo in colonna (finestra bassa, zoom, stampa)

- I quattro banchi uno sotto l'altro; ogni prodotto: foto (larghezza massima
  480 px), piano del bancone come riga sotto la foto, poi testo e cartellino.
- Il foglio azzurro diventa il fondo di dolci e domenica (cambio netto al
  titolo dei dolci).
- Testata non fissa (in una finestra alta 225-375 px un fisso da 64 px è
  troppo): torna fissa sopra i 540 px. La riga dei banchi diventa un elenco
  di link dopo la testata, non fisso.
- Il pane fisso è già verticale: a 1440 zoom 400% (360×225) si comporta come
  a 375 senza la barra del riassunto fissa (la frase sta in flusso sopra
  l'invio).

---

## 6. Accessibilità (per ogni interazione)

### 6.1 Base di pagina
- Punti di riferimento: `header` (testata), `nav` "Principale" (voci della
  testata), `main` (banchi 0-6), `nav` "Il bancone" (riga dei banchi, fuori da
  `main`, dopo nel DOM), `footer`. Un solo `h1` (impasto), un `h2` per banco
  (sette), `h3` per ogni prodotto, dolce, pasta.
- Il DOM è lineare: banco dopo banco, prodotto dopo prodotto; la
  trasformazione della striscia non cambia l'ordine.
- Focus visibile ovunque: anello inchiostro 2 px con 2 px di stacco (su
  farina e su carta da zucchero); nella bottega (fondo inchiostro) anello
  farina. Mai `outline: none` senza sostituto.
- **Il focus non è mai coperto** dai fissi: `scroll-padding-top: 72px` e
  `scroll-padding-bottom` pari ai piani in basso; nella striscia il calcolo
  della posizione tiene conto dell'area viva (6.4).
- Aree di tocco almeno 44×44 px; righe dei giorni su mobile 56 px; bottoni
  principali 52-56 px.
- Contrasti: testo in inchiostro su farina (10:1) e su carta da zucchero
  (5,06:1); crosta come testo **solo** su farina (4,81:1, da 17 px e peso
  600); mai testo farina su carta da zucchero; mai opacità sotto il 100% sul
  testo che conta.
- Nessuna informazione solo nel colore: i giorni validi dicono "si fa", lo
  stato scelto dice "Scelto", gli errori hanno "!" e testo, il successo ha la
  frase.
- `lang="it"`. Testo ingrandibile al 200% senza perdita; zoom 400% gestito dal
  modo in colonna (0.3).
- Canvas `aria-hidden="true"`; foto con `alt` concreto ("mollica della
  pagnotta tagliata, alveoli fitti"); le foto decorative ripetute (gettoni del
  pane fisso) hanno `alt=""` perché il nome è accanto.
- Nessun lampeggio; nessun cambio di colore di grandi superfici più spesso di
  una volta ogni 500 ms (banco attivo con isteresi, 2.3).

### 6.2 `prefers-reduced-motion: reduce`
Impasto senza respiro, fossetta in dissolvenza d'ombra (400 ms entrata,
600 ms uscita) senza muovere i vertici; striscia mossa solo dallo scroll
dell'utente, senza inerzia né traduzione con inerzia dello swipe (resta 1:1);
nessuna parallasse tra foto e testo; ingresso del foglio azzurro sostituito da
un cambio di fondo in dissolvenza di 200 ms; salti tra banchi istantanei;
gettoni che riappaiono invece di tornare volando; angoli del vassoio già
piegati; barra del riassunto e bottoni fissi che compaiono senza movimento.
Nessun contenuto aspetta un'animazione per essere leggibile o cliccabile.

### 6.3 La prova del dito (impasto)
- `<button>` vero posizionato sopra la zona di prova, nome accessibile "Fai la
  prova del dito sull'impasto", `aria-describedby` → la riga sotto il titolo.
- **Puntatore**: pointer down = fossetta che si approfondisce (max in circa
  500 ms), pointer up o `pointercancel` = ritorno lento. Fino a 3 fossette
  (multitouch). Il clic singolo è una prova completa: premere non invia nulla
  e nulla richiede di tenere premuto (niente limite di tempo, conforme a 2.5.1
  e 2.5.2: l'azione è sul rilascio e non ha conseguenze).
- **Tastiera**: Invio o Spazio = fossetta nel punto corrente; tenuto premuto la
  approfondisce (ignorare la ripetizione automatica del tasto: si conta dal
  primo keydown al keyup); al rilascio torna su. Frecce: spostano il punto tra
  cinque posizioni (centro, sopra, destra, sotto, sinistra) con un anello di
  focus inchiostro disegnato attorno al punto; `aria-describedby` dice la
  posizione solo al cambio ("punto della prova: a destra").
- **Lettore di schermo**: regione `aria-live="polite"` che dice la frase di
  spiegazione **una volta** per visita, alla prima prova. Nessun annuncio alle
  prove successive.
- Nessun cursore custom: `cursor: pointer` sull'impasto.
- Senza WebGL (o contesto perso, o primo frame sopra 200 ms): foto di impasto
  spolverato a tutta finestra con la fossetta in CSS (gradiente radiale che si
  allarga e torna con transizione di 2 s); stesso bottone, stessa frase.

### 6.4 La striscia (vetrina)
- **Tab**: quando un elemento della striscia riceve il focus (`focusin`) e non
  è interamente nell'area viva (tra x 248 e x 1400 a 1440; tra 20 e 355 a
  375), lo stato della vetrina calcola lo scroll verticale che porta il suo
  `article` al bordo sinistro dell'area viva e ci salta (istantaneo; con
  movimento consentito, 240 ms). `scrollIntoView` non basta con la
  trasformazione.
- **Frecce sinistra/destra** quando il focus è dentro la striscia: focus al
  bottone del prodotto precedente/successivo (per i prodotti senza bottone,
  come i dolci, all'`article` stesso con `tabindex="-1"`). Su/giù restano
  scroll nativo. Home/Fine restano quelli della pagina.
- **Lettore di schermo in lettura continua**: legge il DOM in ordine; la
  striscia segue solo il focus di sistema, non il cursore virtuale (non serve:
  il contenuto è tutto nel DOM).
- **Riga dei banchi**: sei link, `aria-current="location"` sul corrente; il
  numero dei pani scelti fa parte del nome accessibile ("pane fisso, 2 pani
  scelti").
- La striscia ha `role="region"` con `aria-label="La vetrina"` e nessuna
  `aria-roledescription` inventata.
- Swipe orizzontale: alternativa completa è lo scroll verticale; nessun gesto
  a più dita richiesto (2.5.1).

### 6.5 "Nel pane fisso" e "Sul vassoio" (lungo la vetrina)
- `button` con `aria-pressed`, etichetta visibile che cambia ("Nel pane fisso"
  / "Scelto") più `aria-label` completo col nome del prodotto.
- Annuncio `aria-live="polite"` all'esito, breve. La quinta pasta: messaggio
  in live e sotto il vassoio.
- Nessuno spostamento di focus, nessuno scroll.

### 6.6 Il pane fisso da tastiera e lettore di schermo
- Fila dei pani: `ul` di `button` con `aria-pressed` ("in mano"). Invio o
  Spazio prende il pane in mano (e posa quello di prima). Esc lo posa.
- Giorni: ogni scomparto ha un `button` "metti qui" (`aria-label`: "Metti la
  segale martedì, si fa" / "martedì, la segale non si fa"): i giorni non
  validi restano focalizzabili e, premuti, danno il messaggio del motivo
  (meglio che saltarli in silenzio). Senza un pane in mano il bottone dice
  "Prendi prima un pane" e porta il focus alla fila.
- Niente scorciatoie nascoste (per esempio tasti numerici per i giorni): si
  arriva al giorno con Tab.
- Righe dei pani nei giorni: gruppo con nome ("Segale, martedì"), radio della
  pezzatura (`fieldset` + `legend` visivamente nascosta), meno e più con
  `aria-label` completo e il numero come testo tra i due (`aria-live` sulla
  sola riga con debounce).
- Vassoio: `fieldset` per peso (radio), quando (radio), paste (checkbox, max
  4, la quinta dà messaggio).
- Trascinamento: sempre con alternativa (tocca e tocca, tastiera). Nessuna
  funzione solo col drag (2.5.7).
- Frase riassuntiva: `aria-live="polite"`, debounce 800 ms, annuncia solo la
  cifra e la parte cambiata ("Aggiunta segale venerdì. Circa 13,00 € a
  settimana."), non l'intera frase ogni volta. La frase intera si legge
  navigando.
- Campi: etichetta visibile sopra, errori sotto con `aria-describedby`,
  `aria-invalid`, `autocomplete`, corpo 17 px minimo (niente zoom iOS).
  Validazione all'uscita dal campo e all'invio, mai a ogni carattere.
- Dopo il successo o l'errore il focus va alla frase o al messaggio.

### 6.7 Barra del riassunto (mobile)
- `aside` con `aria-label="Riassunto della tua settimana"`; il bottone "leggi
  tutto" ha `aria-expanded` e `aria-controls`; non è modale. Non ruba il
  focus alla comparsa. Nascosta con `hidden` (non solo trasparente) quando non
  serve, così non entra nel Tab.

### 6.8 Zoom 400% e testo grande
- A 1440 con zoom 400%: modo in colonna (0.3), testata non fissa, nessun
  contenuto tagliato, nessuno scroll orizzontale della pagina.
- Con testo al 200% (solo testo): i blocchi prodotto crescono in altezza
  (larghezze in em) e non scorrono mai al loro interno; se l'altezza del
  blocco più alto supera l'area viva, la vetrina passa al modo in colonna (lo stato controlla
  l'altezza del blocco più alto a ogni resize e al cambio di font).

---

## 7. Conversione

**Un solo intento, una sola etichetta**: "Il pane fisso" (→ `#pane-fisso`).

| Posizione | Parte con | Note |
|---|---|---|
| Impasto | stato corrente | unico bottone dell'apertura; su mobile in basso a destra |
| Testata (desktop sempre, mobile dopo l'impasto) | stato corrente | diventa "sei al pane fisso" dentro il banco |
| Fine della domenica | vassoio già messo se ci sono paste scelte, altrimenti vassoio misto da 500 g | `aria-label` specifico |
| Piede | stato corrente | |

"Nel pane fisso" (pani) e "Sul vassoio" (paste) **non** sono richiami: sono
scelte che restano nella vetrina e preparano il banco.

**Conversione principale**: "Tieni da parte" riuscito (pane fisso messo da
parte). **Conversioni alternative** (per chi non vuole comporre la
settimana): "Chiama" e "Scrivi" (dolci interi, oltre 6 pezzi, invio fallito,
bottega), "Apri in Maps" (bottega).

**Misura** (fatti del sito: `TrackEvent` è un'unione chiusa, solo due eventi
per i concept):
- `track("apri_concept", { concept: 17 })` al montaggio della pagina;
- `track("demo_prenotazione", { concept: 17, giorni, pani, vassoio, origine })`
  **solo** al successo di "Tieni da parte" (non a "Cambia la settimana" già
  inviato: lì `{ …, aggiornamento: true }`, una volta). `giorni` e `pani`
  numeri, `vassoio` `"no" | "settimanale" | "quindicinale"`, `origine` =
  da dove si è arrivati al pane fisso l'ultima volta (`impasto`, `testata`,
  `domenica`, `riga`, `piede`, `url`, `scroll`).
- Nessun altro evento: le micro-conversioni (prova del dito, pani scelti,
  calendario, chiama) **non** si tracciano come eventi propri. Se servono, il
  tech-architect le aggiunge come parametri del solo `demo_prenotazione`
  (per esempio `prova_dito: true`, `scelti_dal_bancone: 2`).

**Gancio che converte**: la frase che si scrive da sola, con la cifra onesta
**prima** dell'invio, e le tre rassicurazioni accanto al bottone (si paga al
ritiro, lo sospendi con un messaggio, nessun account). Nessun "scopri il
prezzo lasciando il contatto".

**Per Luca (meta-conversione)**: il panettiere che guarda il concept deve
uscire pensando "il mio quaderno dei clienti fissi potrebbe essere questo". Il
piede firma "Un concept di CiceriLab"; il ritorno è il ConceptBackButton.

---

## 8. Consegne ad altri agent

- **creative-director** (conferma): pane fisso e bottega fuori dalla striscia
  (0.1); `touch-action: pan-y` sull'impasto (0.2); voci non correnti della
  riga dei banchi con peso e non con opacità 60% (2.3).
- **tech-architect / scaffold**: stato condiviso della vetrina (banco attivo
  con isteresi, lunghezza della striscia, mappa banco/prodotto → scroll
  verticale, modo in colonna, `focusin` → salto), stato del pane fisso
  (settimana, scelti, vassoio, in mano, invio) con `localStorage` in
  try/catch, calcolo della prima data, generatore `.ics`, `visualViewport` per
  la tastiera, invio simulato con errore riproducibile offline. Parametri URL
  in 1. I nomi dei file seguono "Sezioni da costruire" qui sotto.
- **copywriter**: tutti i testi segnaposto (impasto, cartelli, cartellini,
  stati del pane fisso in 5.8, bottega, piede); regole per la frase che si
  scrive da sola (struttura in 5.8) come funzione di testo tipizzata, non come
  stringhe fisse; "chiamaci" come link senza numero.
- **art-director**: piano del bancone (8 px desktop, 6 px mobile, quote in
  5), bordo del foglio azzurro, scomparto del lunedì chiuso, gettone
  fantasma, stato "in mano" (bordo inchiostro 2 px), bordo crosta del
  successo, anello di focus su tre fondi.
- **motion-designer**: eventi di movimento ammessi = quelli del
  creative-director + ritorno del gettone (320 ms) + comparsa del bottone in
  testata (200 ms) + barra del riassunto; tutto con l'alternativa in 6.2.
- **interaction-designer**: 6.3, 6.4, 6.6 sono la specifica dei gesti e delle
  alternative (soglie: 8 px per il drag, 12 px / 120 ms per lo scroll
  sull'impasto, 48 px di bordo per l'auto-scroll durante il drag).
- **responsive-tester**: controlli obbligatori: bottone "Il pane fisso"
  visibile a 375×667 nell'impasto; nulla sotto il ConceptBackButton (2.2) a
  1440 e a 375; blocco prodotto entro 509 px di altezza a 375×667; modo in
  colonna a 667×375 e a 1440 con zoom 400%; ultimo link del piede non coperto;
  campo attivo visibile con tastiera aperta.
- **accessibility-auditor**: la sezione 6 è la checklist di collaudo, su
  farina, carta da zucchero e inchiostro, a 3 larghezze.

---

## Sezioni da costruire

Una per section-builder, nomi in kebab-case. Tutte leggono i testi solo da
`content/testi.ts` e i prezzi solo da `content/prezzi.ts`, usano lo stato
condiviso dello scaffold (vetrina e pane fisso) e lasciano libere le zone del
ConceptBackButton (2.2).

1. **`impasto`**: banco 0 (5.1). `section#impasto` con `h1`, riga, bottone
   "Il pane fisso" (in basso a destra su mobile), il bottone "Fai la prova del
   dito" posizionato sulla zona di prova con la logica di puntatore e tastiera
   (6.3: cinque punti, frecce, keydown/keyup, `pointercancel`), la regione
   `aria-live` della spiegazione (una volta per visita), il fallback senza
   WebGL (foto + fossetta CSS), lo stato "dopo l'invio" (segno e riga). Monta
   il canvas del webgl-artist tramite il punto di aggancio dello
   shader-engineer; non scrive shader.
2. **`vetrina`**: la regia della pagina e della striscia (2, 5.2, 5.10,
   6.4). Testata desktop e mobile (marchio, tre voci, "Il pane fisso" con le
   sue regole di comparsa e di colore), link "Salta al pane fisso", contenitore
   sticky con traslazione, piano del bancone continuo, pannello del foglio
   azzurro, traduzione di deltaX e swipe, riga dei banchi a uno o due piani
   con `aria-current` e numero dei scelti, salti tra banchi con focus
   sull'`h2`, `focusin` → salto, frecce tra prodotti, modo in colonna. Ospita i
   quattro banchi come figli; non ne scrive il contenuto.
3. **`banco-pane`**: banco 1 (5.3). Cartello "il pane", sei `article` a scala
   vera con foto, due righe, cartellino (pezzature, prezzo, al chilo, giorni,
   "anche la domenica"), bottone "Nel pane fisso" con `aria-pressed`,
   caselle senza foto per il piano B.
4. **`madre`**: banco 2 (5.4). Foto del vasetto, `h2`, tre frasi, nessun
   controllo; versione a uno o due blocchi su mobile.
5. **`banco-dolci`**: banco 3 (5.5). Cartello "i dolci", sei `article` su carta
   da zucchero (prezzi in inchiostro), pinza con la riga in più e piano B,
   cartello finale "Un dolce intero" con "Chiama" e "Scrivi".
6. **`vassoio-domenica`**: banco 4 (5.6). Foto larga, cinque paste con "Sul
   vassoio" (massimo 4), il vassoio con angoli piegati e i nomi scelti, i tre
   pesi con numero di paste e prezzo, "Il pane fisso" che porta il vassoio
   nella settimana.
7. **`pane-fisso`**: banco 5, la settimana (5.7 e le righe "Pane in mano"
   fino a "Quinta pasta preferita" di 5.8). `h2` e frase d'ingresso, fila dei
   pani con il gettone del vassoio, otto scomparti (lunedì chiuso, domenica
   con il vassoio) a 1440 e otto righe a 375, i tre modi per mettere un pane
   (trascinare, tocca e tocca, tastiera), righe con pezzatura e meno/più,
   blocco del vassoio (peso, quando, paste), esempio fantasma, striscia "In
   mano" a 375, tutti i messaggi di rifiuto nello scomparto, bozza ritrovata.
8. **`pane-fisso-invio`**: il riassunto e l'invio (5.8). La frase che si
   scrive da sola (colonna sticky a 1440, in flusso a 375) con cifra e prima
   data, la barra del riassunto mobile (piano 2, chiusa/aperta, "Vai
   all'invio"), le tre rassicurazioni, i due campi con validazione, "Tieni da
   parte", gli stati invio in corso / successo / da parte / cambia la
   settimana / invio fallito, il bordo crosta degli scomparti al successo, il
   file `.ics`, `track("demo_prenotazione")`, `<noscript>`.
9. **`bottega`**: banco 6 e piede (5.9). `h2`, indirizzo come titolo, "Apri
   in Maps", orari come `dl`, chi c'è, parcheggio, "Chiama" e "Scrivi",
   `footer` con "Il pane fisso", "Ricomincia da capo" con conferma in linea,
   crediti foto con licenza, nota "attività inventata", "Un concept di
   CiceriLab", "Mandi", spazio finale per i fissi di mobile.

Nota per il tech-architect: `pane-fisso` e `pane-fisso-invio` dividono un solo
`<section id="pane-fisso">` (con un solo `h2`, in `pane-fisso`): la sezione
radice e l'`h2` stanno in `pane-fisso`, che espone uno slot dove
`pane-fisso-invio` monta la colonna del riassunto e dell'invio. Lo stato che
li collega (settimana, invio) è dello scaffold, non di uno dei due.
