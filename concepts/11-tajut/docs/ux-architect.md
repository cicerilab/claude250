# UX architect · Concept 11 · TAJUT, osteria di paese (Valvasone)

Ondata 1. Rotta `/concept-11`. Base vincolante: `docs/creative-director.md`
(variante B, LA MANO DELL'OSTE). Questo documento decide **struttura, stati,
percorsi, ordine di lettura, conversione e accessibilità**. Non decide colori,
font, easing o testi definitivi (art-director, motion-designer, copywriter):
i testi tra virgolette qui sotto sono segnaposto di lunghezza e di tono.

Materiale letto: `CLAUDE.md`, `docs/ruoli-agent.md`, `docs/processo-agent.md`,
`docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/matrice-concept-11-20.md` (riga 11, paragrafo TAJUT, verifica
incrociata, regole comuni), `concepts/10-torchio/docs/integrazione-sito.md`,
`concepts/11-tajut/docs/creative-director.md`,
`concepts/10-torchio/docs/ux-architect.md` (solo come formato e livello).

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, niente sezioni numerate visibili, niente maiuscoletto spaziato, una
sola etichetta per l'intento di prenotazione: **"Prenota un tavolo"**.

Il flusso di scroll del processo standard qui non esiste: al suo posto c'è il
**diagramma degli stati del tavolo** (sez. 3), come chiesto dal creative-director
in 4.10.

---

## 1. Sitemap

Una rotta, nessuno scroll di pagina, **un solo DOM** presentato in due modi
(tavolo e vista elenco). Le "pagine" sono stati del tavolo.

```
/                                   ← Ciceri Lab (uscita: ConceptBackButton condiviso)
└── /concept-11                     AL TAJUT (un solo schermo, 100dvh)
    │
    ├── [tavolo]  modo predefinito
    │   ├── S0  tavolo apparecchiato     mazzo + briscola, nome, riga, "Prenota un tavolo", mano da sei
    │   ├── S1  carta aperta (id)        una delle sei (o la briscola) aperta al centro
    │   ├── S1p presa aperta (solo <640) il mucchietto della presa steso per scegliere
    │   ├── S2  mano da tre              prenotazione: giorno, ora, quanti siete + foglietto
    │   ├── S3  attesa                   tre carte calate coperte, carta coperta dell'oste
    │   ├── S4  risposta dell'oste       S4a tavolo dato · S4b carta di scarto (pieno) · S4c non arrivata (rete)
    │   └── S5  tavolo con la tua presa  come S0, con la presa della prenotazione al posto dell'oste
    │
    └── [elenco]  "Leggi come un menù"  le sette facce in fila + prenotazione in fondo (qui si scorre)
        ├── #briscola   il piatto del giorno (Sette di spade)
        ├── #cucina     In cucina oggi (Tre di spade)
        ├── #vino       Il vino sfuso (Cinque di coppe)
        ├── #orari      Quando siamo aperti (Sei di denari)
        ├── #dove       Dove siamo (Quattro di bastoni)
        ├── #torneo     La briscola del giovedì (Due di coppe)
        ├── #oste       L'oste (Asso di bastoni)
        └── #prenota    Prenota un tavolo (tre scelte + foglietto + risposta)
```

**Identificatori delle carte** (usati da stato, URL, ancore, `id` DOM, file):
`briscola`, `cucina`, `vino`, `orari`, `dove`, `torneo`, `oste`. Ordine fisso
della mano, da sinistra a destra: `cucina`, `vino`, `orari`, `dove`, `torneo`,
`oste` (lo stesso della tabella del creative-director, lo stesso della vista
elenco dopo la briscola). Nessun mescolamento, mai.

**Parametri di ingresso** (per post e inserzioni di Luca), tutti facoltativi,
letti **una volta** al montaggio, mai riscritti dal sito:

| Parametro | Valori | Effetto |
|---|---|---|
| `?carta=` | `briscola`, `cucina`, `vino`, `orari`, `dove`, `torneo`, `oste` | dopo l'arrivo della mano, quella carta viene giocata da sola (una volta, stesso volo del tocco) |
| `#prenota` (o `?prenota`) | | dopo l'arrivo della mano si passa a S2 |
| `?torneo` | | come `#prenota`, con il giorno sul prossimo giovedì e la casella del torneo spuntata |
| `?vista=menu` | | apre direttamente la vista elenco |
| `#cucina` … `#oste` in vista elenco | | salto all'ancora (solo in modo elenco) |
| `?demo=pieno`, `?demo=rete` | | forza la risposta S4b o S4c alla prossima calata (per QA e per mostrare gli stati a un cliente) |

Esempio per un'inserzione sul torneo: `/concept-11?torneo`. Per il vino:
`/concept-11?carta=vino`.

**Cronologia del browser**: il tasto Indietro del telefono è il gesto più
naturale per "chiudere". Regola: alla prima uscita da S0 (carta aperta o
prenotazione) il sito aggiunge **una sola** voce di cronologia (`pushState`,
stesso URL con `#tavolo`); i passaggi successivi la sostituiscono
(`replaceState`). `popstate` su quella voce = "Riprendi" (S1 → S0) o "Torna
alle carte" (S2/S4 → S0/S5). Durante S3 (attesa) Indietro non annulla l'invio:
la voce resta, e la risposta arriva comunque. Mai più di una voce in più: chi
preme Indietro due volte esce dal concept come si aspetta.

**Stato che sopravvive**: nessuno tra una visita e l'altra (nessun
localStorage: il foglietto contiene nome e telefono, non si salvano). Dentro la
visita, in memoria: carte in presa, carta aperta, valori delle tre carte, testi
del foglietto, prenotazione confermata. Il passaggio tavolo ↔ elenco non perde
niente.

---

## 2. Navigazione

### 2.1 Principio

Non c'è menù, non c'è testata, non c'è hamburger. **La mano è il menù**: sei
carte sempre in vista, ognuna con numero, seme e titolo breve scritti sulla
parte scoperta. Chi ha fretta legge "orari" sulla terza carta e la tocca. Due
soli elementi di navigazione fuori dalla mano:

1. **"Prenota un tavolo"** (bottone ocra, unico intento di conversione).
2. **"Leggi come un menù"** (link testuale piccolo, passa alla vista elenco e
   ritorno con "Torna al tavolo").

Il `ConceptBackButton` condiviso è l'uscita dal concept: il concept non ne
disegna un altro e non mette niente nella sua zona (in alto a sinistra
~230×44 px da 640 px in su, in basso a sinistra ~210×44 px sotto 640 px, con 14
px dal bordo).

### 2.2 Desktop 1440 × 900 (e da 1024 in su)

Il tavolo è diviso in zone fisse (misure indicative, l'art-director le fissa):

```
x:  0        250            560          940     1180         1440
y:  ┌──ConceptBackButton──┐                                        │
 14 │ (14,14 → 244,58)    │                        ┌─ POSTO OSTE ─┐│
    └─────────────────────┘                        │ anello vino  ││
 84 ┌ MAZZO ┐                                      │ qui arriva   ││
    │dorso  │═══ BRISCOLA ═══╗    ZONA DI GIOCO    │ la sua carta ││
    │"Al    │ di traverso     ║    (centro-sinistra)└──────────────┘│
    │Tajut" │ piatto+prezzo   ║     x 560-940                       │
    └───────┘═════════════════╝     y 40-760                        │
360 AL TAJUT  (nome, Bagel ~104 px)       carta aperta        PRESA  │
    riga Literata, max 2 righe            380×720 max         x 980-1180
    [ Prenota un tavolo ]                                     y 300-600
600                                                                  │
640              ┌─────────── LA MANO (6 carte) ───────────┐        │
                 │  x 420-1020, carte ~124×236, passo 96   │  Leggi come
900              └─────────────────────────────────────────┘  un menù ◆
```

- **Bordo in alluminio** sui lati lunghi della finestra: in orizzontale (desktop) sopra e sotto, in verticale (telefono) a destra e sinistra. Deciso a ogni resize dal rapporto della finestra.
- **Mazzo** a (40, 84): lascia libera la zona del bottone "torna". La
  briscola è di traverso sotto il mazzo e ne sporge a destra: si leggono piatto
  e prezzo senza toccarla.
- **Blocco del nome** sotto il mazzo, allineato a sinistra (x 40-520): nome,
  riga, bottone. Sta volutamente fuori dalla zona di gioco, così **nessuna carta
  aperta lo copre mai** da 1024 px in su: "Prenota un tavolo" è sempre visibile.
- **Zona di gioco**: dove atterra la carta aperta, centro-sinistra (x 560-940).
- **Presa**: a destra della zona di gioco, le carte giocate piccole (circa
  90×171), ruotate tra -8° e 8°, sparse; si allarga verso destra e in basso.
- **Posto dell'oste**: in alto a destra; lì arriva la sua carta coperta (S3) e
  lì resta la presa della prenotazione (S5).
- **Mano**: in basso al centro, interamente visibile (bordo inferiore a 24 px
  dal fondo), mai tagliata dal bordo dello schermo.
- **"Leggi come un menù"**: in basso a destra, sopra la linea della mano,
  allineato a destra (x ~1220-1400, y ~850).
- Tab: nome → riga → "Prenota un tavolo" → briscola → mano (un solo tab stop,
  frecce dentro) → carta aperta (se c'è) → presa → "Leggi come un menù". Il
  `ConceptBackButton` è montato per primo nel DOM, quindi è il primo tab stop
  (come in tutti i concept).

### 2.3 Mobile 375 × 667 (misura di progetto, pensato per primo)

```
┌───────────────────────────────────────┐ y
│┊ ┌MAZZO┐╔═BRISCOLA═══════╗   ◯ posto ┊│ 16
│┊ │48×91│║ polenta e toç  ║   dell'oste┊│   briscola ~150×79 di traverso
│┊ │     │║ in braide  9 € ║     (56 px)┊│
│┊ └─────┘╚════════════════╝            ┊│ 130
│┊                                       ┊│
│┊ Al Tajut          (Bagel 48-52 px)    ┊│ 170-226
│┊ Osteria a Valvasone. Vino sfuso,      ┊│
│┊ frico, e un tavolo libero per la      ┊│ 238-308 (3 righe max)
│┊ briscola.                             ┊│
│┊ [ Prenota un tavolo ]  (larghezza nat.)┊│ 328-376 (48 alto)
│┊                                       ┊│
│┊                    Leggi come un menù ┊│ ~408 (in cima alla mano, a destra)
│┊ ┌──┬──┬──┬──┬──┬─────┐                ┊│ 447 cime delle carte
│┊ │3 │5 │6 │4 │2 │1    │  6 carte 80×152┊│     passo 52 px, ultima intera
│┊ │⚔ │♡ │◎ │| │♡ │|    │  indice + titolo┊│
│┊ │cu│vi│or│do│to│l'oste│ nella parte    ┊│
│┊ │  │  │  │  │  │     │  scoperta      ┊│ 599 (68 px dal fondo)
│┊ └──┴──┴──┴──┴──┴─────┘                ┊│
│ [← Torna in Ciceri Lab]      ┌presa┐  │ 609-653 riga di fondo
└───────────────────────────────────────┘ 667
 ┊ = bordo di alluminio 8 px solo a destra e sinistra
```

- **ConceptBackButton** in basso a sinistra (14-224 × 609-653). La mano **sale
  sopra di lui**: bordo inferiore delle carte a 68 px dal fondo. Mai
  sovrapposti.
- **Presa (sotto 640 px)**: un mucchietto nella **riga di fondo, a destra del
  bottone "torna"** (circa 76×44 px, carte di traverso con il numero di carte
  lette). Scostamento motivato dal creative-director, che la voleva in alto a
  destra: in alto a destra c'è il posto dell'oste (dove arriverà la sua carta)
  e la carta aperta su mobile occupa proprio quella fascia. In basso a destra
  non la copre mai niente ed è sotto il pollice.
- **Mano**: sei carte 80×152 (1:1.9), passo 52 px (5×52 + 80 = 340 px, dentro
  l'area viva di 343 px); rotazioni fisse irregolari (-5°, -1°, 3°, -2°, 4°, 1°)
  e sfalsamenti verticali di 2-6 px. Nella parte scoperta di 52 px: numero in
  Bagel (~24 px), seme (~16 px), titolo breve in Literata 14 px (massimo 6
  lettere: "cucina", "vino", "orari", "dove", "torneo", "oste"; il copywriter
  li fissa, massimo 6 caratteri).
- **Sotto 360 px** (320, 340): la mano mantiene 80×152 e il passo 52 px e
  scorre di lato con `scroll-snap` (una carta per scatto); a destra una sfumatura
  di formica (non un'ombra) dice che continua. Mai carte più piccole.
- **375 × 812**: stessi elementi, 145 px d'aria in più distribuiti: la briscola
  cresce a ~170 px, il nome a 56 px, e tra bottone e mano resta tavolo vuoto
  (la zona di gioco).
- **Orizzontale** (667 × 375, 812 × 375): la mano passa a destra, in colonna
  verticale (carte ruotate di 90° come tenute di lato, passo 44 px), il tavolo
  resta intero a sinistra: mazzo, nome in una riga, bottone. Il bottone "torna"
  sotto 640 px di larghezza non si applica (667 ≥ 640: sta in alto a sinistra),
  quindi il mazzo scende di 58 px. La carta aperta atterra al centro della
  parte sinistra.

### 2.4 768 × 1024 (tablet verticale)

Stessa logica del desktop (il bottone "torna" sta in alto a sinistra da 640
in su): mazzo sotto il bottone, blocco del nome sotto il mazzo, mano in basso
al centro con carte ~104×198 e passo 80 px, presa **stesa** sul tavolo (da 640
px in su) a destra della zona di gioco. La carta aperta (fino a 440×836) qui
**copre** il blocco del nome: il blocco diventa `inert` finché la carta è
aperta (vedi 7.3), e "Prenota un tavolo" torna disponibile appena la carta va
giù. Da 1024 in su questo non succede mai.

### 2.5 2560 × 1440

Le carte hanno un tetto (carta aperta max 440 px di larghezza, carte della
mano max 132×251): il tavolo cresce, le carte no. Le zone restano ancorate agli
angoli (mazzo e nome a sinistra, oste in alto a destra, mano in basso al
centro), la zona di gioco resta al centro-sinistra e la presa si allarga di
più. Nessun elemento centrato in un vuoto enorme: il vuoto è formica, ed è
giusto che ci sia.

---

## 3. Stati del tavolo (al posto del flusso di scroll)

### 3.1 Diagramma

```
                     ┌───────────────────────────── ?vista=menu / "Leggi come un menù" / zoom forte ─────┐
                     │                                                                                   ▼
 [ingresso] ──► S0 TAVOLO ◄────────────── Riprendi / Esc / trascina giù / Indietro ──┐           ELENCO (stesso DOM)
   mano arriva   │   ▲  ▲                                                             │           si scorre; tutto
   dal basso     │   │  └── "Riprendi in mano" (dalla presa) ── tutte in mano ─┐      │           quello del tavolo
   400 ms        │   │                                                         │      │           "Torna al tavolo" ──► stato di prima
                 │   │                                                         │      │
   tocco/lancio/ │   │ tocco su tavolo vuoto o trascina verso la presa:        │      │
   Invio su una  │   │ la carta va GIÙ nella presa                             │      │
   carta ────────┴─► S1 CARTA APERTA(id) ── tocco su un'altra carta ──► S1(id2)│      │
                     │     (la prima va nella presa)   ▲                       │      │
                     │                                 └── tocco su carta della presa (riapre)
                     │  <640: tocco sul mucchietto ──► S1p PRESA APERTA ──► S1(id) / S0
                     │
   "Prenota un tavolo" (da S0, S1, S5) · link in "orari" e "torneo" · #prenota · ?torneo
                     ▼
                  S2 MANO DA TRE ── "Torna alle carte" / Esc / Indietro ──► S0 (o S5), niente inviato
                     │   ▲   │
                     │   │   └─ Cala con errori nel foglietto ──► S2·errore (carte tornano, focus al campo)
                     │   │
                     │   └────── proposta scelta (S4b) / "Riprova" (S4c) ──────────┐
                     ▼                                                              │
      Cala le tre carte (trascina una o bottone), foglietto valido                 │
                     ▼                                                              │
                  S3 ATTESA (700-1100 ms, aria-busy) ──┬── disponibile ──► S4a TAVOLO DATO ── "Torna alle carte" ──► S5
                                                       ├── pieno ───────► S4b CARTA DI SCARTO ──────────────────────┤
                                                       └── rete ────────► S4c NON ARRIVATA ─────────────────────────┘
   S5 = S0 + la presa della prenotazione nel posto dell'oste (toccarla la riapre come S4a in sola lettura)
```

### 3.2 Tabella delle transizioni

Per ogni transizione: cosa la provoca, dove va il focus, cosa annuncia la zona
`aria-live="polite"`, cosa succede con `prefers-reduced-motion: reduce` (RM).

| Da → A | Innesco | Focus dopo | Annuncio (segnaposto) | RM |
|---|---|---|---|---|
| ingresso → S0 | montaggio | nessuno spostato (resta sul documento) | nessuno | mano già in posizione |
| S0 → S1(id) | tocco, lancio, Invio/Spazio sulla carta, `?carta=` | titolo `h2` della carta aperta (`tabindex=-1`) | "Carta aperta: il vino sfuso" | dissolvenza 150 ms, carta in mano al 40% |
| S1(a) → S1(b) | tocco/Invio su un'altra carta della mano | titolo di b | "Il vino sfuso va nella presa. Carta aperta: dove siamo" | a scompare, b compare, niente volo |
| S1 → S0 (ripresa) | "Riprendi", Esc, trascinare giù oltre il 25% dell'altezza, Indietro | la carta in mano da cui era partita | "Carta ripresa in mano" | istantaneo |
| S1 → S0 (giù nella presa) | tocco sul tavolo vuoto, trascinare verso la presa | la carta nella presa (desktop) o il mucchietto (mobile) | "Il vino sfuso è nella presa" | istantaneo |
| S0/S1 → S1 (dalla presa) | tocco/Invio su una carta della presa | titolo della carta | "Carta riaperta: il vino sfuso" | dissolvenza 150 ms |
| presa → mano | "Riprendi in mano" | prima carta della mano | "Tutte le carte sono di nuovo in mano" | istantaneo |
| S0/S1 → S1p (<640) | tocco sul mucchietto | prima carta della presa stesa | "Presa: 3 carte" | istantaneo |
| S0/S1/S5 → S2 | "Prenota un tavolo", link in orari/torneo, `#prenota`, `?torneo` | carta "Il giorno" | "Hai in mano tre carte: sabato 11 ottobre, alle 20, in due. Toccale per cambiarle, poi calale." | tre carte già girate in mano |
| S2 → S2 (valore) | tocco sulla carta, ‹ ›, frecce su/giù | resta sulla carta | "Il giorno: domenica 12 ottobre" | cambio istantaneo |
| S2 → S2·errore | Cala con nome vuoto o telefono non valido | primo campo sbagliato | il messaggio del campo (via `aria-describedby`, non doppio in live) | carte ferme, nessuna spinta |
| S2 → S0/S5 | "Torna alle carte", Esc (fuori dai campi), Indietro | "Prenota un tavolo" | "Prenotazione lasciata. Le tue scelte restano se torni." | istantaneo |
| S2 → S3 | Cala valido (trascinare una carta verso il centro o bottone submit) | resta sul bottone "Cala le tre carte" (`aria-disabled`) | "Carte calate. L'oste ci pensa." | tre carte coperte al centro, senza volo |
| S3 → S4a | risposta disponibile | titolo della carta dell'oste ("Tavolo 5") | "L'oste ti ha dato il tavolo 5, sabato 11 ottobre alle 20, in quattro." | carta già girata, dissolvenza 150 ms |
| S3 → S4b | combinazione piena (tabella fissa) o `?demo=pieno` | titolo della carta di scarto | "Sabato alle 20 per sei siamo pieni. Due proposte." | idem |
| S3 → S4c | rete (offline o `?demo=rete`) | il messaggio (`role="alert"`, poi focus sul bottone "Riprova") | testo del messaggio (alert) | carta dell'oste sparisce, tre carte in mano |
| S4b → S2 | tocco su una delle due proposte | la carta cambiata | "Ora: sabato alle 21. Puoi calare." | istantaneo |
| S4c → S3 | "Riprova" | come S2 → S3 | come S2 → S3 | come S2 → S3 |
| S4a → S5 | "Torna alle carte", Esc, Indietro | la presa della prenotazione (posto dell'oste) | "Il tuo tavolo resta qui, al posto dell'oste." | nessuna raccolta animata |
| S5 → S4a (lettura) | tocco sulla presa della prenotazione | titolo della carta dell'oste | "Il tuo tavolo: il 5, sabato 11 alle 20" | dissolvenza 150 ms |
| tavolo ↔ elenco | "Leggi come un menù" / "Torna al tavolo" / cambio automatico (7.7) | titolo della carta che era aperta, altrimenti `h1` | "Vista elenco" / "Vista tavolo" | nessuna animazione tra i modi, mai |

**Regole di coda** (dal creative-director): una sola carta in volo. Un input
durante il volo non si somma: si tiene **solo l'ultimo** e parte quando il volo
finisce. Esc durante il volo chiude la carta appena atterra. Durante S3 gli
input sulle tre carte sono ignorati (sono coperte al centro); il resto del
tavolo resta usabile ma la mano da sei non c'è.

### 3.3 Arco emotivo

| Momento | Stato | Cosa prova chi guarda | Cosa lo produce |
|---|---|---|---|
| 1. Riconoscimento (0-2 s) | S0, arrivo della mano | "È il tavolo dell'osteria." | formica, bordo in alluminio, mazzo col dorso stampato, sei carte che arrivano dal basso una volta sola |
| 2. Già servito (2-5 s) | S0 | "Il piatto di oggi lo vedo già." | la briscola scoperta, leggibile senza fare nulla |
| 3. Curiosità | S0 → S1 | "Cosa c'è sulla carta di coppe?" | titoli brevi sulle carte, hover che la alza e la raddrizza |
| 4. Piacere del gesto | S1 | "L'ho lanciata e si è girata." | volo, giro, appoggio con una sola frenata |
| 5. Orientamento | S1 ripetuto | "Ho visto quasi tutto." | la presa che si allarga (o il mucchietto che conta 3, 4, 5) |
| 6. Decisione | S0 → S2 | "Mi siedo." | cambio di mano: le sei vanno via, arrivano tre carte da briscola |
| 7. Gioco | S2 | "Sabato... in quattro." | toccare le carte per cambiarle, come contare i punti |
| 8. Attesa breve | S3 | "Vediamo cosa gioca l'oste." | la sua carta coperta, ferma, senza spinner |
| 9. Risposta | S4a | "Il cinque, vicino alla stufa." | la carta numerale ocra e prugna, la voce dell'oste |
| 10. Ricordo | S5 | "Ce l'ho qui." | la presa della prenotazione resta sul tavolo per tutta la visita |

Nei due esiti negativi l'arco non si rompe: il pieno è una **mossa dell'oste**
(carta di scarto con due proposte vere, sez. 6.6), la rete è un **"non ci è
arrivata"** con la via del telefono. Mai una schermata d'errore.

---

## 4. Tre user journey (fino alla prenotazione)

Nomi e situazioni verosimili, da allineare con i tre pubblici del
brand-strategist (possono cambiare nome, non struttura).

### 4.1 Gianni, 66 anni, San Vito al Tagliamento · telefono, link su WhatsApp dal nipote

Vuole sapere se giovedì c'è il torneo e prenotare per sé e l'amico.
Legge poco a video, tocca con l'indice, non trascina.

1. Apre il link (`/concept-11`). Vede il tavolo, la briscola ("polenta e toç in
   braide, 9 €"), la mano. Riconosce le carte triestine: sorride.
2. Legge i titoli sulle carte: "torneo" sulla quinta. **Tocca** (non trascina):
   la carta sale del 40%, vola, si gira, si apre. Due righe: il torneo a coppie
   del giovedì, come ci si iscrive.
3. In fondo alla faccia il link "Prenota per il torneo" → S2 con il giorno sul
   prossimo giovedì, 20.00, 2 persone, casella "veniamo per il torneo" già
   spuntata (è visibile perché il giorno è giovedì).
4. Scrive "Gianni" e il telefono. La tastiera sale: le tre carte si riducono a
   una striscia con i valori scritti ("gio 16 · 20.00 · in due"), il foglietto
   resta visibile, "Cala le tre carte" sotto i campi (6.8).
5. Tocca "Cala le tre carte". S3: la carta coperta dell'oste arriva al suo
   posto. Dopo un secondo si gira: "il tre", tre denari. "Tavolo 3, quello
   vicino al banco. Giovedì 16 alle 20, in due, a nome Gianni. Per il torneo vi
   segno io."
6. "Torna alle carte": la presa resta al posto dell'oste. Chiude.
   **Totale: 4 tocchi + 2 campi.** Mai un trascinamento necessario.

### 4.2 Chiara, 34 anni, Pordenone · desktop in ufficio, da Google "osteria frico Valvasone"

Organizza la cena del sabato per sei colleghi. Confronta, poi decide.

1. Apre a 1440. Passa il mouse sulla mano: ogni carta si alza e si raddrizza.
   Trascina "cucina" verso il centro e la lancia: gioco scoperto.
2. Legge i tre piatti. Poi clicca "vino": la cucina va nella presa, a destra.
   Poi "dove": parcheggio in piazza, "Apri in Maps" (nuova scheda, mappa vera).
3. Clicca "Prenota un tavolo" (sempre visibile a sinistra, mai coperto).
   S2: tre carte grandi in basso, foglietto a destra delle carte.
4. Tocca "Il giorno" fino a sabato (o usa ›), "Quanti siete" fino a 6.
   Scrive nome e telefono. "Cala le tre carte".
5. S4b: l'oste gira una **carta di scarto**: "Sabato alle 20 per sei siamo
   pieni. Alle 21.00 c'è posto, o domenica alle 20." Due bottoni.
6. Clicca "Sabato alle 21.00": la carta dell'ora cambia in mano, le tre carte
   tornano pronte, il foglietto è ancora compilato. Ricala. S4a: "il sette".
   **Il pieno le ha fatto perdere un clic, non la prenotazione.**

### 4.3 Elena e Marco, 40 anni, Treviso · telefono in bici sulla ciclovia, da un post Instagram `?carta=vino`

Domenica a pranzo, rete ballerina, guanti appena tolti.

1. Il link apre il tavolo e, dopo l'arrivo della mano, la carta del vino si
   gioca da sola: cinque vini al tajut con i prezzi, la faccia scorre dentro la
   carta con l'indice fermo.
2. Toccano "orari" (il vino va nel mucchietto in basso a destra, che dice 1):
   domenica aperti a pranzo. Toccano "dove": "Apri in Maps".
3. Nella carta "orari" il link "Prenota un tavolo" (stesso intento, non un
   secondo bottone) → S2. Scelgono domenica, "L'ora" fino a 12.30 ("a pranzo"),
   2 persone. Foglietto. Calano.
4. S4c: la carta coperta dell'oste torna indietro, le tre carte tornano in mano,
   sul tavolo: "Non ci è arrivata. Riprova, o chiamaci." ("chiamaci" è un link
   `tel:`). Il foglietto è intatto.
5. "Riprova" quando la rete torna: S4a, "il due".
6. **Variante lettore di schermo** (Marco usa VoiceOver): scorre con il dito
   fino a "Prenota un tavolo", doppio tocco; sente "Il giorno: domenica 12
   ottobre. Tocca per il giorno dopo. Pulsante"; scorre alle frecce ("Giorno
   dopo", "Giorno prima"); compila i campi etichettati; "Cala le tre carte";
   sente "L'oste ti ha dato il tavolo 2, domenica 12 ottobre alle 12.30".

---

## 5. Wireframe testuali per schermata

Convenzioni:
- ◆ = interattivo. ▭ = carta (faccia carta `#FBF6EA`), ▩ = dorso (prugna).
  "Bagel" e "Literata" indicano il ruolo, non la misura finale.
- Coordinate indicative (x, y in px CSS). Ordine di lettura = ordine DOM =
  ordine di tabulazione, salvo dove indicato.
- Nessuno stato fa scorrere la pagina. Scorrono solo: la faccia di una carta
  aperta troppo lunga (dentro la carta), la mano sotto 360 px (di lato), la
  vista elenco.

### 5.1 S0 · Il tavolo apparecchiato

**1440 × 900**

```
┌[← Torna in Ciceri Lab]──────────────────────────────────────────────────────────────┐
│                                                                                     │
│  ▩▩▩▩▩                                                          ┌ posto dell'oste ┐ │
│  ▩ Al ▩ ▭══ BRISCOLA (di traverso, ~250×131) ══▭                 │   ◯ anello ocra  │ │
│  ▩Tajut▩ ▭ 7 ⚔  polenta e toç in braide   9 € ▭                   │     al 20%       │ │
│  ▩▩▩▩▩  ▭═══════════════════════════════════▭                   └──────────────────┘ │
│                                                                                     │
│  Al Tajut                              (zona di gioco vuota:                        │
│  Osteria a Valvasone. Vino sfuso,       formica e granitura)                        │
│  frico, e un tavolo libero per la                                                   │
│  briscola.                                                                          │
│  ◆[ Prenota un tavolo ]                                                             │
│                                                                                     │
│                  ◆▭3⚔  ◆▭5♡  ◆▭6◎  ◆▭4|  ◆▭2♡  ◆▭1|                                  │
│                  cucina vino  orari dove  torneo l'oste    (rotazioni irregolari)   │
│                                                                 ◆ Leggi come un menù│
└─────────────────────────────────────────────────────────────────────────────────────┘
```

- La briscola è un `article` con titolo (h2 visivamente sostituito dalla carta)
  e **si può anche giocare**: toccata, si apre come le altre (S1 `briscola`),
  per chi vuole la riga in più sul piatto. Resta comunque leggibile da ferma.
- Il mazzo non è interattivo (è il marchio). Nessun hover su di lui.
- Il posto dell'oste è decorativo (`aria-hidden`) finché non ci arriva una
  carta.
- Massimo 4 elementi di testo aperti sul tavolo (nome, riga, bottone, il link
  "Leggi come un menù" che è navigazione). Niente orari, niente numeri.

**375 × 667**: vedi schema in 2.3.

### 5.2 S1 · Una carta aperta

**1440 × 900** (esempio: "Il vino sfuso", Cinque di coppe)

```
┌[← torna]────────────────────────────────────────────────────────────────────────────┐
│  ▩mazzo▩ ▭═ briscola ═▭          ┌──────────────────────┐          ┌ posto oste ┐   │
│                                  │5                     │          └────────────┘   │
│  Al Tajut                        │♡   Il vino sfuso     │                           │
│  Osteria a Valvasone...          │    (Bagel, titolo)   │     PRESA                 │
│  ◆[ Prenota un tavolo ]          │  ┌────────────────┐  │     ◆▭ cucina (-6°)       │
│  (non coperto, non velato:       │  │ foto: caraffa  │  │        ◆▭ dove (5°)       │
│   da 1024 in su resta fuori      │  │ di bianco      │  │                           │
│   dalla zona di gioco)           │  └────────────────┘  │     ◆[ Riprendi in mano ] │
│                                  │ Friulano   1,60 · 5,50│    (solo con ≥1 in presa) │
│                                  │ Ribolla    1,80 · 6,50│                           │
│                                  │ Refosco dal peduncolo │                           │
│                                  │ rosso      2,00 · 7,00│                           │
│                                  │ Merlot     1,40 · 5,00│                           │
│                                  │ Verduzzo   2,60 · 9,00│                           │
│                                  │ ◆ Riprendi            │                           │
│                                  │                     ♡│                           │
│                                  │                     5│  (indice capovolto)       │
│                                  └──────────────────────┘                           │
│            (mano abbassata: si vedono le cime, ~96 px)                              │
│                  ◆▭3⚔  ◆▭6◎  ◆▭4|  ◆▭2♡  ◆▭1|      ← il vino non è più in mano       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

- Carta aperta: altezza = spazio tra 40 px dall'alto e la cima della mano
  abbassata, massimo 720 px; larghezza = altezza / 1.9 (circa 380 px); tetto
  440 px su schermi grandi.
- Velo formica al 30% su mazzo, presa e mano (non sul blocco del nome, che non
  è nella zona di gioco), mai scuro.
- **La carta giocata lascia la mano** (resta un vuoto che si chiude: le altre
  si avvicinano). Torna in mano con "Riprendi"; va nella presa se la si sostituisce
  o la si mette giù (sez. 7.4 spiega le due chiusure).
- Faccia lunga: scorre **dentro** il campo centrale; indice e "Riprendi"
  restano fermi. Rotella e trackpad sulla carta scorrono la faccia; fuori dalla
  carta non succede nulla.
- Contenuto delle facce (quantità = numero della carta): tabella del
  creative-director 4.2, testi dal copywriter. Link previsti:
  - `orari`: link "Prenota un tavolo" → S2;
  - `torneo`: link "Prenota per il torneo" → S2 con giovedì e casella;
  - `dove`: "Apri in Maps" (link esterno, `target=_blank`, `rel=noopener`),
    "Chiama" (`tel:`, numero non scritto in vista);
  - `oste`: in fondo la nota "Concept di Ciceri Lab. Attività inventata."
    (anche nel piede della vista elenco).

**375 × 667**

```
┌───────────────────────────────────────┐
│┊ ┌───────────────────────────────┐   ┊│ 16
│┊ │5                              │   ┊│   carta aperta 330 × 495
│┊ │♡  Il vino sfuso               │   ┊│   (88% di larghezza; su 667 di altezza
│┊ │ ┌───────────────────────────┐ │   ┊│    la proporzione scende a ~1:1.5,
│┊ │ │ foto caraffa (h 120)      │ │   ┊│    su 812 torna 1:1.9: vedi 5.2.1)
│┊ │ └───────────────────────────┘ │   ┊│
│┊ │ Friulano        1,60 · 5,50   │   ┊│
│┊ │ Ribolla gialla  1,80 · 6,50   │   ┊│   ↕ scorre DENTRO la carta
│┊ │ Refosco dal peduncolo rosso   │   ┊│
│┊ │                 2,00 · 7,00   │   ┊│
│┊ │ ...                           │   ┊│
│┊ │ ◆ Riprendi                  ♡5│   ┊│ 511
│┊ └───────────────────────────────┘   ┊│
│┊ ▭3 ▭6 ▭4 ▭2 ▭1   (cime, 76 px)       ┊│ 523 mano abbassata
│ [← Torna in Ciceri Lab]      ◆[▭▭ 1]  │ 609-653: bottone condiviso + mucchietto presa
└───────────────────────────────────────┘
```

- Il blocco del nome, il mazzo e la briscola sono sotto la carta: diventano
  `inert` finché la carta è aperta (nessun fuoco su cose coperte).
- La mano abbassata mostra le cime (indice e titolo): toccarne una sostituisce
  la carta aperta. Le carte abbassate passano **dietro** la riga di fondo (il
  bottone condiviso e il mucchietto stanno sopra).
- Trascinare la carta aperta verso il basso oltre il 25% della sua altezza =
  "Riprendi". Il trascinamento verticale parte solo dall'indice o dal bordo
  della carta, non dal campo che scorre (lì il dito scorre il testo).

**5.2.1 Misura della carta aperta (regola unica per tutte le larghezze)**

```
spazio_alto  = altezza finestra - 16 (o 40 da 640 in su) - cime della mano abbassata - 12
larghezza    = min(88vw sotto 640 | spazio_alto / 1.9 da 640 in su, 440)
altezza      = min(larghezza × 1.9, spazio_alto)
```

Sotto 640 px vince la larghezza (88%, come chiede il creative-director in 4.8)
e sui telefoni bassi la carta si accorcia: 330×495 a 375×667, 330×627 (1:1.9
esatto) a 375×812. Da 640 in su vince la proporzione 1:1.9. Richiesta
all'art-director: con la doppia testa e i margini giusti la carta accorciata
deve restare "triestina", non diventare una carta da poker.

### 5.3 S1p · Presa aperta (solo sotto 640 px)

```
┌───────────────────────────────────────┐
│┊                                     ┊│
│┊   (tavolo velato al 30%)             ┊│
│┊                                     ┊│
│┊   La presa                           ┊│  titolo (Literata)
│┊   ◆▭5♡  ◆▭4|  ◆▭3⚔                   ┊│  carte 80×152 affiancate, rotazioni ±6°
│┊   vino  dove  cucina                 ┊│  (in ordine di gioco, l'ultima a destra)
│┊                                     ┊│
│┊   ◆[ Riprendi in mano ]  ◆ Chiudi    ┊│
│┊ ▭ ▭ ▭  (mano abbassata)              ┊│
│ [← Torna in Ciceri Lab]      ◆[▭▭ 3]  │
└───────────────────────────────────────┘
```

- Si apre toccando il mucchietto; si chiude con "Chiudi", Esc, tocco sul
  mucchietto o sul tavolo. Toccare una carta la riapre (S1) e la toglie dalla
  presa.
- Il mucchietto è un `button` con `aria-expanded` e nome "La presa: 3 carte
  lette". Con zero carte il mucchietto non c'è (niente contatore a zero).
- Più di 3 carte: seconda fila sotto, stessa misura. Mai carte più piccole.

**Da 640 px in su** la presa è sempre stesa sul tavolo (5.2): ogni carta è un
`button` "Riapri: il vino sfuso"; "Riprendi in mano" compare sotto le carte
quando ce n'è almeno una.

### 5.4 S2 · La mano da tre (prenotazione)

**Ingresso**: la mano da sei scivola in basso fuori dallo schermo, la presa si
raccoglie in un mucchietto (anche da 640 in su), l'eventuale carta aperta va
nella presa; dal mazzo arrivano tre carte coperte che si girano una dopo
l'altra (120 ms).

**1440 × 900**

```
┌[← torna]────────────────────────────────────────────────────────────────────────────┐
│  ▩mazzo▩ ▭═ briscola ═▭                                             ┌ posto oste ┐   │
│                                                                     └────────────┘   │
│  Al Tajut                                                                           │
│  Osteria a Valvasone...                (centro del tavolo vuoto:                    │
│  (il bottone "Prenota un tavolo"        qui si calano le carte)     ▭▭ presa        │
│   qui diventa ◆ "Torna alle carte")                                 (mucchietto)    │
│                                                                                     │
│        Tocca una carta per cambiarla, poi calale.   (riga d'aiuto / zona messaggi)  │
│                                                                                     │
│      ┌─────────┐ ┌─────────┐ ┌─────────┐      ┌──── IL FOGLIETTO ─────────────┐     │
│      │◆ ◎      │ │◆ ◎      │ │◆ ♡      │      │ A che nome                    │     │
│      │ sabato  │ │ 20.00   │ │   2     │      │ ◆[__________________________] │     │
│      │11 ottobre│ │ a cena  │ │ ♡   ♡   │      │ (errore qui sotto)            │     │
│      │      ◎  │ │      ◎  │ │  in due │      │ Un telefono                   │     │
│      └─────────┘ └─────────┘ └─────────┘      │ ◆[__________________________] │     │
│      ◆‹  ◆›      ◆‹  ◆›      ◆‹  ◆›           │ ◆☐ veniamo per il torneo      │     │
│                                               │   (solo se il giorno è giovedì)│     │
│          ◆[ Cala le tre carte ]  (ocra)       │ Demo: il foglietto non parte.  │     │
│                                               └───────────────────────────────┘     │
│                                                                 ◆ Leggi come un menù│
└─────────────────────────────────────────────────────────────────────────────────────┘
```

- Tre carte ~150×285, dritte, affiancate, al posto della mano. Frecce ‹ › da 44
  px sotto ciascuna.
- **Il bottone "Prenota un tavolo" diventa "Torna alle carte"** (stesso posto,
  stile secondario, testo prugna su formica): è l'uscita dalla prenotazione
  senza inviare. Un solo bottone ocra alla volta sul tavolo: in S2 è "Cala le
  tre carte".
- Il foglietto (carta `#FBF6EA`, riga a matita) sta a destra delle carte, in
  basso, alla stessa altezza; la carta totale in vista resta sotto il 35% dello
  schermo.
- Ordine DOM e tab: "Torna alle carte" → riga d'aiuto → Il giorno → L'ora →
  Quanti siete → A che nome → Un telefono → (torneo) → "Cala le tre carte". Le
  frecce ‹ › sono fuori dal giro del tab (`tabindex=-1`, vedi 7.5) ma presenti
  per il lettore di schermo.

**375 × 667**

```
┌───────────────────────────────────────┐ y
│┊ ▩mazzo (48×91)             ◯ oste   ┊│ 16-110
│┊ ◆ Torna alle carte                   ┊│ 116-140 (link, area 44 px)
│┊ ┌── IL FOGLIETTO ─────────────────┐  ┊│ 150
│┊ │ A che nome                      │  ┊│
│┊ │ ◆[____________________________] │  ┊│
│┊ │ Un telefono                     │  ┊│
│┊ │ ◆[____________________________] │  ┊│
│┊ │ (◆☐ veniamo per il torneo)      │  ┊│ solo giovedì: le carte scendono a 96×160
│┊ └─────────────────────────────────┘  ┊│ 300
│┊ Tocca una carta per cambiarla,       ┊│ 308-340 riga d'aiuto / messaggi
│┊ poi calale.                          ┊│
│┊ ┌────────┐ ┌────────┐ ┌────────┐     ┊│ 346  carte 104×170, spazi 15 px
│┊ │◎sabato │ │◎ 20.00 │ │♡  2    │     ┊│
│┊ │11 ott. │ │a cena  │ │ ♡  ♡   │     ┊│
│┊ └────────┘ └────────┘ └────────┘     ┊│ 516
│┊ ◆‹  ◆›     ◆‹  ◆›     ◆‹  ◆›          ┊│ 516-560
│┊              ◆[ Cala le tre carte ]  ┊│ 560-604 (a destra, larghezza naturale)
│ [← Torna in Ciceri Lab]      ◆[▭▭ 2]  │ 609-653
└───────────────────────────────────────┘
```

- Su mobile il foglietto sta **sopra** le carte (creative-director 4.8), così
  con la tastiera aperta resta in vista (6.8).
- Il posto dell'oste resta in alto a destra, piccolo: lì arriva la sua carta.

**768**: come 1440 con carte ~128×243 e foglietto sotto le carte a destra,
bottone "Cala" sotto le carte a sinistra.

### 5.5 S3 · Attesa

```
1440                                                           375
  ...                                ┌ posto oste ┐              ┊ ▩mazzo        ▩ ← carta coperta ocra
                                     │ ▩ dorso    │              ┊                  dell'oste, ferma
       ▩ ▩ ▩   ← tre carte calate,   │   ocra     │              ┊ (foglietto
                 coperte, in fila    └────────────┘              ┊  in sola lettura)
                 al centro                                        ┊   ▩ ▩ ▩  al centro
       ◆[ Cala le tre carte ] aria-disabled, testo invariato      ┊ ◆[ Cala ] aria-disabled
```

- Nessuno spinner, nessun puntino, nessun testo che pulsa. La riga d'aiuto
  dice "L'oste ci pensa." (statica). `aria-busy="true"` sul `form`.
- Durata demo 700-1100 ms (casuale nell'intervallo; il contenuto no).
- Campi del foglietto `readonly` durante l'attesa (non `disabled`: restano
  leggibili dal lettore di schermo).

### 5.6 S4a · L'oste gira il tavolo (successo)

```
1440                                                      375
                     ┌──────────────────────┐              ┌───────────────────────────────┐
                     │5  (Bagel ocra+prugna)│              │5                              │
                     │◎                     │              │◎   Tavolo 5                   │
                     │      Tavolo 5        │              │   ◎   ◎                       │
                     │    ◎    ◎            │              │     ◎                         │
                     │       ◎              │              │   ◎   ◎                       │
                     │    ◎    ◎            │              │ Tavolo 5, quello vicino alla  │
                     │ Tavolo 5, quello     │              │ stufa. Sabato 11 alle 20, in  │
                     │ vicino alla stufa.   │              │ quattro, a nome Bortolin. Se  │
                     │ Sabato 11 alle 20,   │              │ tardate più di mezz'ora,      │
                     │ in quattro, a nome   │              │ fateci uno squillo.           │
                     │ Bortolin. Se tardate │              │ ◆ Torna alle carte            │
                     │ più di mezz'ora,     │              └───────────────────────────────┘
                     │ fateci uno squillo.  │               ▩ ▩ ▩ (le tre calate, sotto)
                     │ ◆ Torna alle carte  ◎│
                     └──────────────────────┘
```

- La carta dell'oste si gira al suo posto e poi si porta al centro a misura di
  lettura (stessa regola 5.2.1): su mobile il posto dell'oste è troppo piccolo
  per leggerla lì.
- La carta è una **numerale**: il numero del tavolo (1-7) è il numero della
  carta, con quel numero di **denari** (seme del tempo: "ci vediamo a
  quell'ora"). Nessuna figura, nessun timbro, nessuna cartolina.
- "fateci uno squillo" è un link `tel:` (nessun numero scritto in vista).
- `track("demo_prenotazione", …)` qui, **una volta sola per visita** (8.3).
- **Assegnazione del tavolo** (deterministica, niente sorteggio): 1-2 persone →
  tavoli 1 o 2; 3-4 → 3, 4 o 5; 5-7 → 6 o 7. Dentro il gruppo: indice =
  (numero del giorno nel mese + indice della mezz'ora) modulo quanti tavoli ha
  il gruppo. Il copywriter scrive una riga per ogni tavolo ("vicino alla
  stufa", "sotto la finestra", "quello del torneo"...).

### 5.7 S5 · Il tavolo con la tua presa

Come S0, con in più, **al posto dell'oste**, la presa della prenotazione: le
tre carte tue coperte sotto e la carta dell'oste scoperta sopra, piccola (su
mobile 56×106), col numero del tavolo leggibile. È un `button` "Il tuo tavolo:
il 5, sabato 11 ottobre alle 20. Rileggi". "Prenota un tavolo" resta com'è (si
può prenotare un'altra sera: la nuova presa sostituisce la vecchia solo a
conferma avvenuta).

### 5.8 Vista elenco "Leggi come un menù"

**1440** (colonna di lettura ~560 px, allineata a sinistra a x 280, non
centrata; il tavolo di formica resta come fondo, le facce sono carte distese
in fila e non ruotate)

```
┌[← torna]────────────────────────────────────────────────────────────────────┐
│                  ◆ Torna al tavolo                                            │ (in cima, fisso? no: scorre;
│                  Al Tajut  (h1)                                               │  ripetuto in fondo)
│                  Osteria a Valvasone. Vino sfuso, frico...                     │
│                  ◆[ Prenota un tavolo ]  → ancora #prenota                     │
│                                                                               │
│                  ▭ 7 ⚔ Il piatto del giorno (h2)  ............ id=briscola   │
│                  ▭ 3 ⚔ In cucina oggi (h2) ..................... id=cucina    │
│                  ▭ 5 ♡ Il vino sfuso ........................... id=vino      │
│                  ▭ 6 ◎ Quando siamo aperti ..................... id=orari     │
│                  ▭ 4 | Dove siamo .............................. id=dove      │
│                  ▭ 2 ♡ La briscola del giovedì ................. id=torneo    │
│                  ▭ 1 | L'oste .................................. id=oste      │
│                  Prenota un tavolo (h2) ........................ id=prenota   │
│                    fieldset Il giorno  ◆‹ sabato 11 ottobre ◆›                │
│                    fieldset L'ora      ◆‹ 20.00 a cena ◆›                     │
│                    fieldset Quanti     ◆‹ 2 ◆›                                │
│                    foglietto (2 campi + torneo) · ◆[ Cala le tre carte ]      │
│                    risposta dell'oste (stessa carta, in fila)                 │
│                  piede: Concept di Ciceri Lab. Attività inventata. ◆ Torna al tavolo │
└───────────────────────────────────────────────────────────────────────────────┘
```

**375**: colonna a tutta area viva (16 px di margine), facce a tutta
larghezza, altezza libera (non 1:1.9: qui la carta è "distesa"; indice solo in
alto). Spazio di 72 px in fondo per il bottone condiviso in basso a sinistra.

- È **lo stesso DOM** del tavolo: le sette facce sono sempre nel documento
  (in modo tavolo solo quella aperta è visibile, le altre sono `hidden` o nella
  presa come miniature `aria-hidden` con il loro bottone); la prenotazione è lo
  stesso `form`. Cambia la presentazione (una classe di modo sulla radice).
- È anche la resa **senza JavaScript** e la base del prerender: se JS non gira,
  un `<noscript><style>` dentro il componente forza il modo elenco. Con JS, il
  modo tavolo è quello predefinito fin dal primo paint (nessun salto
  elenco → tavolo, CLS zero).
- In modo elenco le tre scelte della prenotazione restano "carte" piccole con
  ‹ ›, ma senza volo né calata animata; la risposta dell'oste compare in coda.
- Il cambio di modo porta il fuoco alla carta che era aperta (o all'`h1`) e
  scorre fin lì.

### 5.9 Stati di bordo

- **Zero carte in mano** (tutte in presa): al posto della mano, il bottone
  "Riprendi in mano" centrato nella fascia della mano.
- **Carta aperta = briscola**: la briscola si apre come le altre ma quando si
  chiude **torna sotto il mazzo** (non va mai nella presa).
- **Finestra ridimensionata durante un volo**: il volo si completa verso la
  nuova posizione finale (nessuna carta persa fuori schermo).
- **Tastiera virtuale aperta fuori da S2**: non capita (nessun campo fuori dal
  foglietto).

---

## 6. La prenotazione, tutti gli stati

### 6.1 Valori e regole delle tre carte

| Carta | Valori | Predefinito | Tocco / Invio / Spazio | ‹ › | Frecce ↑ ↓ (con fuoco) | Limiti |
|---|---|---|---|---|---|---|
| **Il giorno** (denari) | da domani a +21 giorni, lunedì esclusi | la prima **sera aperta** da domani | giorno aperto successivo; all'ultimo torna a domani (annunciato: "Torniamo a domani") | indietro/avanti, si fermano ai limiti (`aria-disabled`) | ↑ successivo, ↓ precedente; Home = primo, End = ultimo | oggi non si prenota qui (la riga d'aiuto lo dice solo se si prova a tornare prima di domani: "Per stasera chiamaci", con link `tel:`) |
| **L'ora** (denari) | fasce vere: pranzo 12.00-13.30, cena 19.00-21.00, ogni mezz'ora; solo quelle aperte in quel giorno (dati della carta "orari") | 20.00 | mezz'ora successiva, in giro | come sopra | come sopra | se il giorno cambia e l'ora non esiste più (es. domenica sera chiusa), l'ora va alla fascia aperta più vicina e lo annuncia |
| **Quanti siete** (coppe) | 1-7, poi "Otto o più?" | 2 | uno in più; dopo "Otto o più" torna a 1 | come sopra | come sopra | a "Otto o più" la faccia dice "Otto o più? Chiamaci" con link `tel:`; "Cala le tre carte" diventa `aria-disabled` con la riga d'aiuto "Per otto o più ci sentiamo al telefono" |

- Le date si calcolano dal giorno reale solo per la prenotazione (serve un
  calendario vero), **dopo il montaggio** (mai nel prerender: nel HTML statico
  la carta del giorno mostra solo il seme e "scegli il giorno"). Il resto del
  sito non cambia mai con data o ora.
- **Lunedì**: non è mai un valore. Se il tasto ↑ arriverebbe su lunedì, la
  carta mostra per un attimo (nessuna animazione, solo il testo annunciato)
  "lunedì siamo chiusi" e passa a martedì; l'annuncio è "Lunedì siamo chiusi:
  martedì 14 ottobre".
- **Giovedì**: compare la casella "veniamo per il torneo" nel foglietto;
  sparisce (e si toglie la spunta) se il giorno cambia. Con `?torneo` o dal
  link della carta torneo arriva già spuntata.
- La prima mossa su una carta toglie la riga d'aiuto "Tocca una carta per
  cambiarla, poi calale." (non torna più nella visita).

### 6.2 Il foglietto

| Campo | Tipo | Attributi | Regola | Messaggio (segnaposto) |
|---|---|---|---|---|
| A che nome | `input type=text` | `autocomplete="name"`, `enterkeyhint="next"`, `maxlength=40` | almeno 2 caratteri non spazio | "Scrivi un nome, ci basta quello." |
| Un telefono | `input type=tel` | `autocomplete="tel"`, `inputmode="tel"`, `enterkeyhint="done"` | 8-13 cifre dopo aver tolto spazi, punti, trattini e "+39" | < 8: "Il numero sembra corto: controlla le cifre." · > 13 o lettere: "Il numero ha qualcosa che non torna." |
| veniamo per il torneo | `checkbox` | visibile solo giovedì | facoltativa | nessuno |

- Etichetta sempre sopra il campo, errore sotto, collegato con
  `aria-describedby` e `aria-invalid="true"`. Nessun placeholder usato come
  etichetta.
- Validazione **alla calata**, non durante la scrittura. Dopo il primo errore,
  il campo si ricontrolla a ogni modifica e l'errore sparisce appena è giusto.
- Una riga fissa nel foglietto: "Demo: il foglietto non parte davvero." (il
  copywriter la rende nella voce giusta). Niente dati salvati.

### 6.3 Elenco completo degli stati

| # | Stato | Cosa si vede | Cosa si può fare | Uscite |
|---|---|---|---|---|
| P0 | **Cambio di mano** (ingresso) | sei carte via, presa raccolta, tre carte dal mazzo che si girano (120 ms l'una) | niente (≤ 700 ms; input accodato) | P1 |
| P1 | **Vuoto / pronto** | tre carte con valori predefiniti (mai bianche), riga d'aiuto, foglietto vuoto con etichette | cambiare carte, scrivere, calare, tornare | P2, P3, S0 |
| P1a | **Giovedì** | come P1 + casella torneo | idem | idem |
| P1b | **Otto o più** | faccia "Otto o più? Chiamaci", "Cala" `aria-disabled` | chiamare, cambiare numero | P1 |
| P2 | **Errore di compilazione** | le tre carte partono e tornano con una spinta indietro (una volta, 200 ms), messaggio sotto il campo | correggere, ricalare | P1, P3 |
| P3 | **Invio in corso** | tre carte coperte al centro, carta coperta ocra al posto dell'oste, riga "L'oste ci pensa." | leggere; nessun doppio invio (ogni calata durante P3 è ignorata) | P4a, P4b, P4c |
| P4a | **Successo** | carta dell'oste girata col numero del tavolo, voce dell'oste | "Torna alle carte", link `tel:` | S5 |
| P4b | **Pieno** | carta **di scarto** (senza numero di tavolo: solo una riga di semi in fondo) con la frase e **due proposte** come bottoni | scegliere una proposta, oppure "Cambio io" (torna a P1 senza cambiare niente) | P1 con carta cambiata |
| P4c | **Errore di rete** | la carta coperta dell'oste torna indietro, tre carte in mano, sul tavolo: "Non ci è arrivata. Riprova, o chiamaci." (`role="alert"`) | "Riprova" (ricala gli stessi valori), "chiamaci" (`tel:`) | P3, S0 |
| P5 | **Uscita senza inviare** | "Torna alle carte": le tre carte tornano nel mazzo, arriva la mano da sei, la presa si ristende | | S0 / S5; i valori scelti restano in memoria se si rientra |

**Tabella fissa del pieno** (dati d'esempio, dichiarati come tali nel codice e
nel doc del copywriter):

| Giorno | Ora | Persone | Esito |
|---|---|---|---|
| venerdì | 20.00 | 5 o più | pieno |
| sabato | 20.00 | 5 o più | pieno |
| giovedì | 20.30 e 21.00 | qualsiasi, se "torneo" è spuntato | pieno (i tavoli del torneo sono presi) |

**Le due proposte** (sempre due, sempre vere rispetto alla tabella):
1. stesso giorno, prima mezz'ora libera **dopo** l'ora chiesta nella stessa
   fascia (o la più vicina prima, se dopo non c'è);
2. il giorno aperto successivo, stessa ora (se anche quello è pieno, il
   successivo ancora).
Esempio: sabato 20.00 per 6 → "Alle 21.00 c'è posto" / "O domenica alle 20".

**Errore di rete** (demo): succede se `navigator.onLine === false` al momento
della calata, oppure con `?demo=rete` (solo alla prima calata, così "Riprova"
riesce). Il numero di telefono non è scritto in vista: "chiamaci" è il link
(regola del repo pubblico in `docs/ruoli-agent.md`, che qui prevale sul
"chiamaci allo 0434 ..." del creative-director).

### 6.4 Calare trascinando

Trascinare **una qualsiasi** delle tre carte verso il centro del tavolo (oltre
il 25% della sua altezza, o con un lancio) cala tutte e tre: le altre seguono.
Rilascio debole = tornano in mano. Il bottone "Cala le tre carte" fa la stessa
cosa ed è la via normale. Il tocco semplice sulla carta **non** cala (cambia il
valore): qui il tocco ha un altro significato, ed è detto dalla riga d'aiuto.

### 6.5 Dati che l'oste ripete

La voce dell'oste in P4a ripete **tutti** i dati (giorno, data, ora, persone,
nome) così chi ha sbagliato se ne accorge; il copywriter scrive un modello con
segnaposto (`{tavolo}`, `{descrizione}`, `{giorno}`, `{data}`, `{ora}`,
`{persone in lettere}`, `{nome}`, e la frase per il torneo).

### 6.6 Perché il pieno non è un errore

La carta di scarto è una mossa del gioco: l'oste "non prende", ma ti rilancia
due carte buone. Nessun colore d'errore, nessuna icona di avviso: la stessa
carta prugna e ocra, senza il numero del tavolo.

### 6.7 Doppio invio, uscite, ricarica

- Una calata alla volta; il bottone resta `aria-disabled` in P3.
- Esc dentro un campo non esce dalla prenotazione (serve a chi usa
  completamento automatico): esce solo con il fuoco su carte o bottoni.
- Ricaricare la pagina riparte da S0, prenotazione compresa (nessun dato
  salvato).

### 6.8 Tastiera virtuale (mobile)

Con `visualViewport`: quando un campo del foglietto ha il fuoco e l'altezza
visibile scende sotto 500 px, le tre carte si riducono a una **striscia** di
tre carte di traverso (altezza 44 px) con i valori scritti ("sab 11 · 20.00 ·
in due"), sopra il foglietto; toccarla chiude la tastiera e riporta le carte
grandi. "Cala le tre carte" resta subito sotto il campo del telefono. Il campo
col fuoco non finisce mai sotto la tastiera. Il mazzo e il posto dell'oste
escono di vista (restano nel DOM).

---

## 7. Accessibilità (per ogni interazione)

### 7.1 Base di pagina

- `lang="it"`. Landmark: `main` (tutto il tavolo), `footer` (solo in modo
  elenco è visibile; in modo tavolo la nota sta sulla carta dell'oste).
  Nessun `nav` finto: la mano è un `section` con nome "La tua mano".
- Un solo `h1`: "Al Tajut, osteria a Valvasone" (in vista si legge "Al Tajut";
  ", osteria a Valvasone" è testo visivamente nascosto o la riga sotto fa da
  descrizione, a scelta del copywriter, purché l'`h1` completo sia quello).
  `h2` per ogni carta (briscola compresa), per la prenotazione e per la
  risposta dell'oste.
- Zona `aria-live="polite"` unica, visivamente nascosta, per gli annunci della
  tabella 3.2; `role="alert"` solo per l'errore di rete.
- Focus visibile ovunque: contorno prugna 2 px, distanza 3 px, che **segue la
  rotazione della carta** (outline sulla carta ruotata, non sul contenitore
  dritto). Una carta con il fuoco si alza di 18-24 px anche da tastiera, così
  il contorno non è coperto dalle vicine.
- Area minima 44×44 px per tutto (frecce ‹ ›, mucchietto, link della carta).
- Semi e numeri non portano informazioni solo visive: il titolo di ogni carta
  dice cosa c'è; il numero è ridetto nel nome accessibile ("Cinque di coppe.
  Il vino sfuso: cinque vini").
- Ocra mai come colore di testo; testo sul bottone ocra in prugna.
- Mai `outline: none` senza sostituto.
- Nessun fuoco su elementi coperti: ciò che una carta aperta copre diventa
  `inert` (sotto 1024 px il blocco del nome, sotto 640 anche mazzo e briscola).

### 7.2 La mano (S0)

| Input | Comportamento |
|---|---|
| Tab | entra nella mano su **una** carta (roving tabindex: l'ultima con il fuoco, o la prima) |
| ← → | carta precedente/successiva (non ciclico); Home/End prima/ultima |
| Invio, Spazio | gioca la carta (stessa traiettoria del tocco) |
| Puntatore fine | hover = la carta si alza 18-24 px e si raddrizza; nessun effetto sulle altre |
| Tocco | la carta sale del 40% e parte (anticipo del gesto) |
| Trascinamento | segue il dito; rilascio con velocità o distanza sufficiente = lancio; altrimenti torna |
| Lettore di schermo | `ul` di `li > button`: nome "Cinque di coppe. Il vino sfuso: cinque vini", `aria-expanded` vero se è la carta aperta, `aria-controls` = `id` della faccia |

- `touch-action: none` sulle carte (mai sul tavolo intero: lo zoom del browser
  deve funzionare). **Sotto 360 px**, dove la mano scorre di lato, le carte
  hanno `touch-action: pan-x`: il dito orizzontale scorre la mano, quello verso
  l'alto trascina la carta (soglia 8 px, direzione decisa al primo movimento).
- Il trascinamento non è mai l'unico modo (WCAG 2.5.7): tocco, tastiera,
  bottoni fanno tutto.

### 7.3 La carta aperta (S1)

- `section role="region"` con `aria-labelledby` sul suo `h2`. **Non** un
  dialog modale: il resto del tavolo resta raggiungibile, salvo ciò che è
  coperto (reso `inert`).
- All'apertura il fuoco va all'`h2` (`tabindex=-1`), che il lettore legge.
  Tab successivi: contenuto della faccia (link) → "Riprendi".
- Esc = "Riprendi" (fuoco torna alla carta in mano da cui è partita; se
  aperta dalla presa, torna alla presa).
- Faccia che scorre: il campo centrale è un contenitore scorrevole con
  `tabindex=0` e nome ("Il vino sfuso, testo"), così si scorre anche con le
  frecce da tastiera.
- Link esterni ("Apri in Maps") annunciano che aprono una nuova scheda.

### 7.4 Le due chiusure (decisione)

Il creative-director dice sia "chiusa o sostituita va nella presa" sia "Riprendi
la fa tornare in mano". Si tengono tutte e due, con un verbo ciascuna:

| Verbo | Come | Dove va la carta |
|---|---|---|
| **Riprendi** | bottone "Riprendi" sulla faccia, Esc, trascinare giù oltre il 25%, Indietro del browser | torna **in mano**, al suo posto |
| **Metti giù** | tocco su un'altra carta della mano (la sostituisce), tocco sul tavolo vuoto, trascinare verso la presa | va **nella presa** |

Così la presa è davvero "le carte che ho letto e messo da parte", e chi vuole
solo richiudere trova la carta dove l'aveva.

### 7.5 Prenotazione (S2-S4)

- Il gruppo delle tre carte è un `fieldset` con `legend` "Le tre carte". Ogni
  carta è un `button` (come chiede il creative-director) con nome che dice
  valore e azione: "Il giorno: sabato 11 ottobre. Tocca per il giorno dopo".
  Il nome si aggiorna a ogni cambio e la zona live dice il nuovo valore (solo il
  valore, non l'istruzione).
- Frecce ↑ ↓ sulla carta con il fuoco cambiano il valore; Home/End ai limiti.
- ‹ › sono `button` con nome ("Giorno prima", "Giorno dopo") e
  `tabindex=-1`: fuori dal giro del Tab (la carta fa già tutto da tastiera), ma
  raggiungibili con lo scorrimento del lettore di schermo su telefono.
- Il foglietto è dentro lo stesso `form`; "Cala le tre carte" è
  `button type=submit`. Invio in un campo = calare (tranne che nel nome, dove
  `enterkeyhint=next` passa al telefono).
- P3: `aria-busy="true"` sul form, bottone `aria-disabled="true"` (resta
  focalizzabile, non `disabled`, così il fuoco non si perde).
- P4a/P4b: la risposta è una `section` con `h2` ("Tavolo 5" / "Siamo pieni"),
  fuoco sull'`h2`. Le due proposte sono `button` con il testo completo
  ("Sabato alle 21.00").
- P4c: messaggio `role="alert"`, poi fuoco su "Riprova".

### 7.6 `prefers-reduced-motion: reduce`

Riassunto (dettaglio nella colonna RM di 3.2):
- niente volo, niente giro, niente lancio: la carta giocata compare aperta al
  centro con dissolvenza 150 ms, e la carta in mano si spegne al 40% (invece di
  lasciare un vuoto);
- la mano è già in posizione all'apertura;
- cambio di mano per la prenotazione istantaneo, tre carte già girate;
- cambio di valore istantaneo; nessuna spinta indietro nell'errore (solo il
  messaggio e il fuoco);
- carta dell'oste già girata, dissolvenza 150 ms; nessuna raccolta della presa;
- il trascinamento resta possibile ma la carta non segue il dito con inerzia:
  al rilascio oltre soglia compare aperta.
- In ogni modalità: nessun movimento o cambio di colore di grandi superfici più
  di una volta ogni 500 ms (il velo formica al 30% entra ed esce in dissolvenza,
  mai a scatti ripetuti).

### 7.7 Zoom 200% e 400%, testo grande

Il tavolo sta in una finestra; la vista elenco scorre. **Regola di passaggio
automatico al modo elenco** (misurata al montaggio e a ogni `resize`, con
isteresi di 40 px per non oscillare):

- lo spazio verticale per una carta aperta (5.2.1) è **sotto 300 px**, oppure
- la larghezza della finestra è **sotto 300 px**, oppure
- `1rem` calcolato è **sopra 24 px** (testo ingrandito dal browser ≥ 150%).

Esempi: 1440×900 al 400% = 360×225 → elenco. 1366×768 al 200% = 683×384 →
tavolo (come un telefono orizzontale). 375×667 al 200% = 187×333 → elenco.
Telefono orizzontale 667×375 → tavolo.

Nel passaggio automatico: stato conservato, fuoco sulla carta aperta (o
`h1`), e il link "Torna al tavolo" **non** compare finché la finestra resta
troppo piccola (compare una riga: "Il tavolo torna quando c'è più spazio.").
Al 400% la vista elenco non ha scorrimento orizzontale (verificato dal
responsive-tester: `scrollWidth ≤ clientWidth`).

### 7.8 Lettore di schermo, riassunto del percorso

`ConceptBackButton` → `h1` → riga → "Prenota un tavolo" → briscola (`article`,
h2 + piatto + prezzo, bottone "Apri") → "La tua mano" (elenco di 6) → carta
aperta (se c'è) → presa ("La presa: 2 carte", elenco di bottoni "Riapri: ...")
→ "Riprendi in mano" → "Leggi come un menù". Il modo elenco non serve per
forza al lettore di schermo (il tavolo è già un documento in ordine), ma è lì.

---

## 8. Conversione

### 8.1 Un intento, un'etichetta

**"Prenota un tavolo"** porta sempre a S2 (o all'ancora `#prenota` in modo
elenco).

| Dove | Parte con | Note |
|---|---|---|
| Bottone sul tavolo (S0, S1, S5) | valori predefiniti o gli ultimi scelti | unico bottone ocra in S0 |
| Carta "Quando siamo aperti" | predefiniti | link testuale, non bottone |
| Carta "La briscola del giovedì" | prossimo giovedì, 20.00, torneo spuntato | link "Prenota per il torneo" |
| Vista elenco, in cima | ancora `#prenota` | |
| URL `#prenota`, `?torneo` | come sopra | |

Da 1024 px in su il bottone non è mai coperto; sotto, è a un gesto ("Riprendi"
o Indietro). Nessun bottone fisso che galleggia sopra il tavolo.

### 8.2 Conversioni alternative

- **Chiama** (`tel:`): carta "dove", "Otto o più? Chiamaci", "Per stasera
  chiamaci", errore di rete, "fateci uno squillo" nella risposta.
- **Apri in Maps**: carta "dove".
- Il telefono di esempio non è mai scritto in vista (repo pubblico): sempre un
  link con un verbo.

### 8.3 Tracciamento (solo i due eventi del sito vero)

- `track("apri_concept", { concept: 11 })` al montaggio, una volta.
- `track("demo_prenotazione", { concept: 11, tavolo, persone, torneo, origine,
  carte_lette, tentativi })` una volta per visita, al primo S4a.
  `origine` ∈ `bottone`, `orari`, `torneo`, `elenco`, `url`;
  `carte_lette` = carte diverse aperte prima di prenotare; `tentativi` = calate
  fatte (pieni e reti compresi).
- Nessun altro evento: niente micro-conversioni con nomi nuovi (l'unione
  `TrackEvent` del sito è chiusa).

### 8.4 Cosa converte

- **Il prezzo e l'orario non si nascondono**: la briscola ha il prezzo in
  vista, gli orari sono a un tocco. Nessuno deve "giocare" per sapere se siamo
  aperti.
- **Il gioco insegna la prenotazione**: la mano da tre si usa come la mano da
  sei (toccare le carte), quindi al momento di prenotare il gesto è già noto.
- **Il pieno propone, non respinge** (P4b).
- **Il rifiuto costa poco**: "Torna alle carte" non perde i valori.
- **Per Luca** (meta-conversione): l'oste di un'osteria vera che guarda il
  concept deve pensare "questo è il mio tavolo"; la nota "Concept di Ciceri
  Lab" è sulla carta dell'oste e nel piede dell'elenco.

---

## 9. Richieste ad altri agent

- **tech-architect / scaffold-engineer**
  - Un solo reducer di stato con gli stati S0-S5, P0-P5, modo `tavolo|elenco`,
    `cartaAperta`, `presa: id[]`, `mano: id[]`, `prenotazione {giorno, ora,
    persone, nome, telefono, torneo}`, `risposta`, `primaPrenotazioneTracciata`.
  - Un primitivo condiviso **`Carta`** (faccia/dorso, doppia testa con indice,
    disposizione dei semi da 1 a 7, proporzione 1:1.9, stato ruotato) usato da
    tutte le sezioni: va fatto dallo scaffold perché le sezioni lavorano in
    parallelo.
  - Parametri URL (sez. 1) letti una volta; una sola voce di cronologia
    (`pushState`/`replaceState`/`popstate`, sez. 1).
  - `visualViewport` per la tastiera (6.8); `inert` (con controllo del
    supporto); misura del passaggio automatico al modo elenco (7.7).
  - `<noscript><style>` per il modo elenco senza JS; modo tavolo al primo
    paint con JS; date calcolate solo dopo il montaggio.
  - Invio simulato 700-1100 ms, tabella del pieno, `?demo=pieno|rete`,
    `navigator.onLine`.
- **copywriter**: titoli brevi delle sei carte (≤ 6 caratteri), nomi accessibili
  delle carte, tutti gli annunci della tabella 3.2, i messaggi di 6.2, le frasi
  di P1-P5, il modello della voce dell'oste (6.5), le sette righe dei tavoli
  (5.6), le due proposte del pieno, "Otto o più? Chiamaci", "Per stasera
  chiamaci", "Demo: il foglietto non parte davvero.", "Il tavolo torna quando
  c'è più spazio.", nota "Concept di Ciceri Lab. Attività inventata."
- **brand-strategist**: confermare giorni e fasce orarie (la carta "L'ora" le
  legge dalla carta "orari": se la domenica sera è chiusa, la carta la salta).
- **art-director**: misura della carta aperta sui telefoni bassi (5.2.1), il
  mucchietto della presa nella riga di fondo a 375 (2.3), focus visibile sulle
  carte ruotate, la carta di scarto (senza numero), la striscia della tastiera.
- **motion-designer**: eventi di movimento = quelli del creative-director 4.10
  più: mano che si abbassa quando una carta è aperta (e risale), carta dell'oste
  che dal suo posto va al centro di lettura, riduzione a striscia con la
  tastiera, spinta indietro dell'errore (una volta, 200 ms). Tutti con la
  versione RM di 7.6.
- **interaction-designer**: soglie del trascinamento (8 px per partire, 25% o
  velocità per il lancio), `touch-action` per la mano che scorre sotto 360 px,
  calata trascinando una delle tre (6.4).
- **responsive-tester / accessibility-auditor**: controlli obbligatori: mano
  mai sotto il bottone condiviso a 375×667; "Prenota un tavolo" visibile senza
  scorrere a 375×667 e 320×568; carta aperta leggibile a 375×667 con la faccia
  che scorre; foglietto e campo attivo visibili con la tastiera; passaggio
  all'elenco al 400%; focus mai su elementi coperti; nessun cambio di grandi
  superfici più di una volta ogni 500 ms.

**Scostamenti dal creative-director, motivati sopra**: presa mobile nella riga
di fondo a destra (2.3); due verbi di chiusura, Riprendi e Metti giù (7.4);
telefono mai scritto in vista nell'errore di rete (6.3); soglie di zoom con
passaggio automatico all'elenco (7.7); carta aperta mobile accorciata sui
telefoni bassi (5.2.1).

---

## Sezioni da costruire

Una per section-builder, nomi in kebab-case. Tutte usano il primitivo `Carta`
e lo stato condiviso dello scaffold; i testi solo da `content/testi.ts`.

1. **`tavolo`**: la superficie e la regia dello schermo. Formica con
   granitura, bordo in alluminio sui lati lunghi, zone fisse (2.2-2.5), blocco
   del nome (`h1`, riga, bottone "Prenota un tavolo" che in S2 diventa "Torna
   alle carte"), posto dell'oste vuoto (anello del bicchiere), velo formica al
   30%, zona `aria-live`, logica `inert` delle zone coperte, link "Leggi come
   un menù".
2. **`mazzo-briscola`**: il mazzo col dorso "Al Tajut" (non interattivo) e la
   briscola di traverso con piatto del giorno e prezzo leggibili da ferma;
   briscola giocabile che torna sotto il mazzo; punto da cui partono le tre
   carte della prenotazione.
3. **`mano`**: le sei carte in fila irregolare (rotazioni e sfalsamenti fissi,
   mai arco), indice e titolo breve, hover/focus che alza e raddrizza, roving
   tabindex, tocco/lancio/trascinamento, mano abbassata quando una carta è
   aperta, scroll-snap sotto 360 px, colonna verticale in orizzontale, arrivo
   all'apertura, uscita per il cambio di mano, stato "zero carte".
4. **`carta-aperta`**: il volo, il giro e l'apertura al centro, misura 5.2.1,
   le sette facce (briscola, cucina, vino, orari, dove, torneo, oste) con doppia
   testa, foto e contenuti, faccia che scorre dentro la carta, "Riprendi" e
   "Metti giù", fuoco sull'`h2`, link verso la prenotazione e Maps.
5. **`presa`**: le carte messe giù, stese sul tavolo da 640 px in su (piccole,
   ruotate tra -8° e 8°) e mucchietto con contatore sotto 640 (S1p presa
   aperta), riapertura, "Riprendi in mano", raccolta in mucchietto durante la
   prenotazione.
6. **`prenotazione`**: la mano da tre (giorno, ora, quanti siete) con tutte le
   regole di 6.1, frecce ‹ ›, il foglietto con validazione (6.2), calata col
   bottone o trascinando (6.4), striscia con la tastiera (6.8), stati P0-P3 e
   P5, riga d'aiuto e messaggi.
7. **`risposta-oste`**: carta coperta ocra in attesa (P3), carta del tavolo
   numerale con la voce dell'oste (P4a) e `track("demo_prenotazione")`, carta di
   scarto con le due proposte (P4b), "Non ci è arrivata" con "Riprova" (P4c),
   presa della prenotazione al posto dell'oste e rilettura (S5).
8. **`vista-elenco`**: il modo "Leggi come un menù" dello stesso DOM (colonna
   di lettura, facce distese, prenotazione in fondo senza animazioni, piede con
   la nota), "Torna al tavolo", passaggio automatico per zoom e testo grande
   (7.7), resa senza JS (`noscript`).
