# UX architect · Concept 12 · SOTTOPELLE, studio di tatuaggi (Pordenone)

Ondata 1. Rotta `/concept-12`. Base vincolante: `docs/creative-director.md`
(variante A, PARETE CONTINUA). Questo documento decide **struttura, percorsi,
posizioni sulla parete, ordine di lettura, stati e accessibilità**. Non decide
colori, font, easing o testi definitivi (art-director, motion-designer,
copywriter): le frasi citate qui sono segnaposto di lunghezza e di tono.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`, riga e paragrafo 12 di
`docs/matrice-concept-11-20.md`, `concepts/10-torchio/docs/integrazione-sito.md`,
`concepts/12-sottopelle/docs/creative-director.md`,
`concepts/10-torchio/docs/ux-architect.md` (solo formato),
`concepts/10-torchio/src/components/ConceptBackButton.tsx` (misure reali).

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, niente occhielli numerati, niente maiuscoletto spaziato, un solo
richiamo alla prenotazione con una sola etichetta: **"Grande come?"**
("Fissa la consulenza" esiste solo dentro il pannello).

---

## 0. Scostamenti motivati dalla direzione

1. **Periodo della parete 20 × 15 moduli, non 16 × 12.** La direzione chiede
   7 isole distanti almeno 3 moduli tra loro dentro un periodo periodico. L'ho
   verificato con uno script (ricerca su tutte le posizioni, distanza misurata
   sul toro, bordo a bordo): in 16 × 12 le 7 isole (53 moduli) stanno al massimo
   a **1 modulo** l'una dall'altra, in 18 × 14 a 2, in **20 × 15 a 3**. Con
   16 × 12 il testo sarebbe il 28% della parete e le isole si toccherebbero:
   una parete di cartelli, non di lavori. In 20 × 15 le isole sono il 18%, le
   foto il 50%, il vuoto il 32%. Il modulo `M` resta quello della direzione
   (168 / 136 / 112 px).
2. **Posizioni per foto ripetute nel periodo.** 48 posizioni per 24 foto: ogni
   foto compare circa due volte per periodo, mai a meno di 5 moduli da sé
   stessa (vedi 5.2). La memoria dello sboccio è per foto, quindi la seconda
   copia arriva già posata: è coerente con "una volta posato, resta".
3. **Frecce su una tessera = spostamento alla tessera vicina**, frecce sulla
   parete (contenitore) = scivolata di un modulo come da direzione. Serve a non
   far uscire dallo schermo l'elemento che ha il fuoco (vedi 7.3).
4. **Sotto i 480 px di altezza utile** (telefono in orizzontale, zoom 400% su
   desktop) il sito si apre in vista elenco. La parete resta a un tocco. Motivo
   in 7.8.

---

## 1. Sitemap e URL

SPA a una rotta. Non è una pagina che scorre: è una finestra fissa (100dvh)
sulla parete con strati sopra. Ogni strato ha un indirizzo, così il tasto
"indietro" del telefono chiude quello che hai aperto invece di farti uscire.

```
/                                ← Ciceri Lab (ConceptBackButton, del sito)
└── /concept-12                  SOTTOPELLE
    ├── (parete)                 strato 0: canvas + tessere DOM + 7 isole
    │     isole: ingresso · solo guariti · chi tatua · prima di venire
    │            quanto costa · la cura · dove (+ colophon)
    ├── #elenco                  vista elenco: pagina che scorre, tutto il sito
    ├── #lavoro-<id>             strato 2: scheda del lavoro (dialogo)
    ├── #grande-come             strato 3: pannello di prenotazione
    └── #filtri                  solo sotto 1024 px: foglio/popover dei filtri
```

- Aprire uno strato fa `history.pushState` con l'hash; chiuderlo (Esc, "Chiudi",
  indietro del browser) torna all'hash precedente. Un solo livello alla volta:
  dalla scheda, "Grande come?" **sostituisce** la voce (`replaceState`), così
  indietro dal pannello riporta alla parete, non alla scheda.
- Arrivare con un hash apre direttamente lo strato dopo il primo disegno della
  parete (niente sboccio d'apertura sotto un pannello: l'ingresso è già posato).
- `#lavoro-<id>` di un id che non esiste: si ignora, parete all'ingresso.

**Parametri di ingresso** (per inserzioni e post di Luca), letti una volta in
`useEffect`, mai riscritti nell'URL:

| Parametro | Valori | Effetto |
|---|---|---|
| `?stile=` | `linea-fine`, `blackwork`, `lettering`, `ornamentale`, `nero-e-grigio` | filtro attivo sulla parete e stile nella frase |
| `?artista=` | `nives`, `tobia` | filtro artista |
| `?misura=` | `LxA` in cm, es. `6x4` (da 1 a 40, passo 0,5) | misura della macchia |
| `?zona=` | una delle 13 zone (7.6), es. `polso` | zona nella frase |
| `?vista=elenco` | | apre la vista elenco |
| `?invio=errore` | | forza l'invio fallito (solo per QA e demo) |

Esempio per un'inserzione sulla linea fine:
`/concept-12?stile=linea-fine&misura=6x4&zona=polso#grande-come`.

**Stato che sopravvive** (sempre in try/catch, il sito funziona uguale se lo
storage è vuoto o bloccato):

| Chiave | Dove | Cosa | Durata |
|---|---|---|---|
| `stp-taratura` | localStorage | px per mm + larghezza della finestra quando si è tarato | finché l'utente non la rifà; si scarta se la larghezza dello schermo (`screen.width`) cambia |
| `stp-posati` | sessionStorage | id delle foto già sbocciate | la visita |
| `stp-bozza` | sessionStorage | misura, zona, stile, primo, idea, giorno e ora scelti (**mai** nome e contatto) | la visita |
| `stp-posto` | sessionStorage | proporzioni della macchia prenotata + data e ora della consulenza | la visita |
| `stp-vista` | sessionStorage | `parete` o `elenco` + posizione della parete | la visita |

---

## 2. Navigazione e convivenza con il ConceptBackButton

### 2.1 Principio

La parete è libera, i comandi sono pochi e fermi ai bordi: **in alto chi sei e
la prenotazione, in basso come guardi la parete**. Nessun hamburger, nessun
menu di sezioni: le sezioni sono isole che si incontrano, e chi vuole un indice
ha la vista elenco.

Regole che valgono a ogni larghezza:
- **Mai due "Grande come?" visibili insieme.** Il bottone dei comandi fissi è
  nascosto (`visibility: hidden`, fuori dal tab) finché il bottone dell'isola
  d'ingresso è dentro lo schermo per almeno metà.
- **Mai due "Sottopelle" visibili insieme.** Il nome piccolo in alto compare
  solo quando l'h1 dell'ingresso è uscito dallo schermo.
- "Torna all'ingresso" è disattivato (`aria-disabled`, grigio lettura) quando
  l'ingresso è già al centro, per non avere un comando che non fa niente.
- Lo spazio del `ConceptBackButton` è **riservato**: nessun nostro comando,
  foglio o bordo di pannello ci finisce sotto.

### 2.2 Zone riservate (misurate sul componente vero)

| Larghezza | Posizione del ConceptBackButton | Zona riservata |
|---|---|---|
| > 640 px | `top: max(safe-top, 14px)`, `left: 14px` | rettangolo 14,14 → 250 × 58 (bottone circa 230 × 38, più aria) |
| ≤ 640 px | `bottom: max(safe-bottom, 14px)`, `left: 12px` | rettangolo 0 → 224 px di larghezza, dal fondo fino a 14 + 38 + 8 = 60 px (+ safe-bottom) |

Il bottone ha `z-index: 2147483000`: sta sopra anche ai nostri dialoghi. Per
questo:
- il bottone va montato **fuori** dal contenitore che diventa `inert` quando si
  apre un dialogo (fratello della radice del concept, non figlio), così resta
  cliccabile e non è un bottone morto;
- ogni contenitore che scorre dentro i dialoghi ha `scroll-padding-top: 72px`
  (desktop) e `scroll-padding-bottom: 76px + safe-bottom` (mobile), così il
  fuoco da tastiera non finisce mai sotto il bottone del sito;
- l'ultimo elemento di ogni pannello mobile ha 76 px di aria sotto.

### 2.3 Desktop (≥ 1024 px, disegnato a 1440 × 900)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[← TORNA IN CICERI LAB]                                  Sottopelle  [Grande come?]│ top 14, alt. 44
│  zona del sito                                          ^ gotico 32  ^ bottone     │ (nome e bottone
│                                                           → ingresso   rosso       │  solo fuori
│                                                                                    │  dall'ingresso)
│                        (la parete, a tutto schermo, sotto a tutto)                 │
│                                                                                    │
│                                                                                    │
│  ┌────────────────────────────── barra della parete ─────────────────────────────┐ │
│  │ [Parete|Elenco]  Stile: linea fine · blackwork · lettering · ornamentale ·     │ │ bottom 16
│  │ nero e grigio   Misura: piccoli · medi · grandi   Chi: Nives · Tobia           │ │ alt. 48
│  │                                             [Azzera]  [⌂ Torna all'ingresso]   │ │ centrata,
│  └────────────────────────────────────────────────────────────────────────────────┘ │ una riga
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Barra**: una sola riga, fondo nero rialzato, centrata, larghezza al
  contenuto (circa 1180 px a 14 px). Gruppi separati da 24 px di spazio, non da
  filetti. Le parole "Stile:", "Misura:", "Chi:" sono testo normale in grigio
  lettura, non etichette maiuscole. Ogni filtro è un bottone di testo con
  `aria-pressed`; attivo = testo osso con sottolineatura 2 px, inattivo = grigio
  lettura. "Azzera" compare solo con almeno un filtro attivo.
- **Da 1024 a 1279 px** la riga non ci sta: i tre gruppi diventano tre bottoni
  "Stile", "Misura", "Chi" (con il numero di scelte attive: "Stile, 2") che
  aprono ciascuno un popover sopra la barra. Resto invariato.
- Il contenitore della parete ha una **zona sicura** per il fuoco e per
  "porta il lavoro nello schermo": 72 px in alto, 80 px in basso, 24 px ai lati.

### 2.4 Tablet (641–1023 px, controllato a 768)

- ConceptBackButton in alto a sinistra (regola del sito sopra 640).
- In alto a destra: nome (fuori dall'ingresso) e "Grande come?".
- Barra in basso centrata: `[Parete|Elenco]  [Filtri, 2]  [Azzera]  [⌂]`.
  "Filtri" apre un foglio dal basso alto al massimo il 60% (stesso contenuto del
  foglio mobile, 2.6).

### 2.5 Mobile (≤ 640 px, disegnato a 375 × 812)

```
┌─────────────────────────────────────┐
│ Sottopelle                     [⌂]  │ top max(safe,12), alt. 44; nome gotico 32 px,
│                                     │ [⌂] Torna all'ingresso 44×44 (icona + aria-label)
│                                     │ entrambi solo fuori dall'ingresso
│          (parete)                   │
│                                     │
│                                     │
│ ┌─────────────────────────────────┐ │ riga B: bottom = safe + 68, alt. 48
│ │ [Parete|Elenco]      [Filtri, 2]│ │ left 16, right 16, fondo nero rialzato
│ └─────────────────────────────────┘ │
│ [← TORNA IN CICERI LAB]  [Grande   ]│ riga A: bottom = safe + 14, alt. 44
│  (del sito, ~200 px)     [come?    ]│ bottone rosso da x = 224 a 375 − 16
└─────────────────────────────────────┘
```

- **Riga A**: a sinistra il bottone del sito; a destra, nello spazio che resta
  (da 224 px al margine destro di 16 px, 135 px a 375), il bottone rosso
  "Grande come?", alto 44. È il comando più vicino al pollice.
- **Riga B**: interruttore Parete/Elenco e "Filtri" (con il numero di filtri
  attivi). Niente "Azzera" qui: sta dentro il foglio.
- **Sotto i 360 px** (320, zoom): il bottone rosso non ci sta nella riga A.
  Riga A = solo il bottone del sito; la riga B diventa
  `[Elenco] [Filtri] [Grande come?]` (l'interruttore si riduce a un solo
  bottone "Elenco", che nella vista elenco diventa "Parete").
- Mentre l'ingresso è in vista il bottone rosso della riga A è nascosto e la
  riga A resta con il solo bottone del sito: nessun salto, la riga B non si
  sposta.
- Altezza di tutto: `100dvh`; righe A e B con `env(safe-area-inset-bottom)`.

### 2.6 Foglio dei filtri (mobile e tablet)

```
┌─────────────────────────────────────┐
│ Filtri                     [Chiudi] │ h2 + chiudi 44×44
│                                     │
│ Stile                               │ fieldset + legend
│ [linea fine] [blackwork] [lettering]│ bottoni di testo alti 44, a capo liberi
│ [ornamentale] [nero e grigio]       │
│ Misura                              │
│ [piccoli] [medi] [grandi]           │
│ Chi                                 │
│ [Nives] [Tobia]                     │
│                                     │
│ 11 lavori su 24                     │ aria-live polite
│ [Azzera]            [Guarda i 11]   │ "Guarda" chiude il foglio (non rosso:
│                                     │  contorno osso)
│ (76 px di aria per il bottone sito) │
└─────────────────────────────────────┘
```

Si apre dal basso fino al 70% dello schermo. I filtri si applicano **subito**
(la parete arretra dietro il foglio, visibile nella parte alta), "Guarda i N" è
solo chiudere. Chiusura: Chiudi, Esc, tocco fuori, trascinamento in giù,
indietro del browser.

### 2.7 Logica dei filtri

- Dentro un gruppo: OR (linea fine **o** lettering). Tra gruppi: AND.
- Misura: piccoli = lato maggiore fino a 8 cm; medi = da 8 a 18 cm; grandi =
  oltre 18 cm (dal dato in cm della foto, non dal formato della tessera).
- Sulla parete i lavori esclusi arretrano (scuriti, desaturati, niente
  increspatura, niente puntatore, `tabindex="-1"` e `aria-hidden` sulle loro
  tessere); nella vista elenco spariscono davvero.
- Zero risultati: tutte le tessere arretrano, e sopra la barra compare una riga
  "Nessun lavoro così: togli un filtro." con il bottone "Azzera". In elenco lo
  stesso testo al posto della griglia.
- I filtri sono gli stessi nelle due viste e restano cambiando vista.
- "Solo i suoi" (isola Chi tatua) attiva il filtro artista e basta: non tocca
  gli altri gruppi.

---

## 3. Arco emotivo della visita

Il sito non scorre, quindi l'arco non è una sequenza di sezioni: è il tempo
della visita, come in studio. Il picco è "Grande come?", non l'apertura.

| Momento | Dove | Emozione | Cosa la regge | Cosa porta avanti |
|---|---|---|---|---|
| Arrivo (0-2 s) | ingresso | **silenzio, attesa** | nero, poi *Sottopelle* sboccia per prima, poi le foto intorno ad anelli | la deriva di 40 px: "si muove" senza scritte |
| Primo gesto (2-20 s) | parete | **curiosità che diventa meraviglia trattenuta** | ogni foto nuova si apre come inchiostro in acqua, alla velocità del tuo gesto | "sono tanti, e veri"; la voglia di vedere il prossimo angolo |
| Esplorazione (20 s-3 min) | parete, scheda | **riconoscimento**: "questo è il mio stile" | filtri che fanno ritirare l'inchiostro; la scheda con zona, cm, mesi di guarigione | nella scheda "Grande come?" già compilato: "una cosa così" |
| Fiducia | isole Solo guariti, Chi tatua, Prima di venire, Quanto costa | **rassicurazione** | regole dette come al bancone; prezzi di esempio chiari; nessun volto ma i lavori come ritratto | il link testuale "la stima per il tuo la fa Grande come?" |
| Progetto | Grande come? banco | **concretezza, sollievo**: "ah, è grande così" | oggetti veri in scala 1:1 accanto alla macchia | la frase che si completa da sola man mano |
| Impegno | stima e posto | **calma**: nessuna sorpresa | ore, sedute, forbice di prezzo, consulenza gratuita di 20 minuti | un giorno, un orario, tre campi |
| Dopo | successo, parete | **appartenenza** | la macchia che si posa; sulla parete un posto vuoto con le tue proporzioni | tornare quando sarà guarito |

---

## 4. Tre user journey fino alla prenotazione

### 4.1 Sara, 23 anni, primo tatuaggio (telefono, da un'inserzione Instagram)

Cerca "una cosa piccola e fine sul polso", ha paura che faccia male e di
spendere troppo. Link dell'inserzione: `?stile=linea-fine`.

1. Apre il link sul telefono. Nero, *Sottopelle* sboccia, intorno le foto si
   aprono ad anelli. I lavori non di linea fine sono già arretrati: capisce
   senza leggere che le stanno mostrando "il suo".
2. Trascina con il pollice verso l'alto e verso destra. Le foto nuove sbocciano
   più veloci perché muove veloce. Tocca un rametto sulla caviglia (tocco senza
   trascinamento): la scheda si apre dalla foto. Legge "4 × 2 cm, guarito da 14
   mesi, Nives". Swipe a sinistra, altri due lavori.
3. Tocca "Grande come?" nella scheda. Il pannello si apre già con "Grande 4 × 2
   cm, sulla caviglia, in linea fine". Prima volta: la taratura le chiede la
   carta. Appoggia il bancomat, allarga il rettangolo col dito, "Combacia".
4. Sceglie la moneta: la macchia è poco più di una moneta e mezza. La porta a
   5 × 3 con i + (non vuole trascinare una maniglia piccola). Cambia la zona:
   tocca [caviglia] nella frase, dal foglio sceglie [polso]. Lascia [primo].
5. La stima compare come continuazione della frase: "Circa un'ora, una seduta.
   Da 100 a 140 €, caparra 50 €." Sollievo.
6. Scorre dentro il pannello: sceglie sabato, poi 11:20. Scrive nome e numero,
   dimentica la casella dei 18 anni e preme "Fissa la consulenza".
7. Il fuoco va alla casella con l'errore sotto ("Tatuiamo solo maggiorenni…").
   La spunta, ripreme. "Sto fissando…", poi la macchia si posa e la frase
   diventa definitiva. "Aggiungi al calendario". Chiude: sulla parete, accanto
   all'ingresso, un posto vuoto con le proporzioni del suo polso.

Attriti tolti: nessun account, nessun pagamento, stima prima del contatto,
misura senza trascinare, errore che dice cosa fare.

### 4.2 Marco, 38 anni, ha già un braccio tatuato (desktop, da Google "blackwork Pordenone")

Vuole la schiena, vuole capire chi fa blackwork e quanto ci vuole.

1. Arriva a 1440. Guarda l'ingresso, legge la frase, **non** preme subito.
   Trascina col mouse verso sinistra, poi usa la rotella del trackpad in
   diagonale.
2. Nella barra: Stile "blackwork", Misura "grandi". Metà parete arretra.
   Incontra l'isola **Chi tatua**: Tobia, blackwork e ornamentale, mercoledì,
   giovedì, sabato. Preme "Solo i suoi".
3. Apre tre schede con le frecce ← →. In una vede "32 × 20 cm, 4 sedute".
4. Incontra **Quanto costa**: legge minimo e tariffa oraria di esempio, poi il
   link "la stima per il tuo la fa Grande come?".
5. Il pannello si apre con stile blackwork (dal filtro). Salta la taratura
   ("misure approssimate · tara lo schermo" resta accanto alle misure). Scrive
   30 e 40 nei campi della macchia: la macchia esce dal pannello, contorno
   tratteggiato, "esce dallo schermo: è più grande del tuo telefono" (sceglie
   anche la cartolina, che resta tutta dentro la macchia).
6. Frase: [schiena], [non il primo]. Stima: "Circa 64 ore, 16 sedute, in circa
   15 mesi. Da 6.260 a 8.690 €, caparra 50 €." e sotto "È una stima: il prezzo
   vero lo diciamo in consulenza, guardando la pelle."
7. Sceglie un giovedì (la riga del giorno dice "Tobia"), 17:40, email, casella,
   "Fissa la consulenza". Successo; scarica il file .ics.

### 4.3 Elena, 46 anni, ipovedente: zoom al 200% e lettore di schermo (desktop)

Vuole coprire una vecchia scritta sull'avambraccio; prima di tutto vuole sapere
le regole di igiene e se si può fare una consulenza senza impegno.

1. Primo Tab: "Vai all'elenco" (il lettore lo annuncia). Invio: vista elenco,
   una pagina normale che scorre, h1 *Sottopelle*, poi i titoli h2.
2. Con la navigazione per titoli salta a "Prima di venire" e a "Quanto costa".
   Legge che la consulenza di 20 minuti è gratuita e che la caparra si rende
   con 48 ore di preavviso.
3. Nell'elenco dei lavori filtra "nero e grigio" (bottoni con stato letto:
   "nero e grigio, premuto"); il lettore annuncia "9 lavori su 24".
4. Preme "Grande come?" (nella vista elenco è in testa, dopo il titolo). Il
   dialogo si apre, il fuoco va al titolo del pannello. "Salta" la taratura.
5. Non conosce la misura: preme "Non lo so ancora". La stima dice "La misura
   la decidiamo insieme in consulenza." La frase resta leggibile come testo, le
   parti sono bottoni con il valore letto ("zona: avambraccio, cambia").
6. Giorni: un gruppo di radio in orizzontale, frecce per cambiare giorno;
   orari: un gruppo di radio. Campi con etichette sopra. Invio: "Sto
   fissando…" annunciato; poi il messaggio di successo annunciato in una regione
   `aria-live` e il fuoco sul titolo della conferma.

---

## 5. La parete: periodo, posizioni, ordine

### 5.1 Coordinate

- Modulo `M` = 168 px (≥ 1024), 136 px (641-1023), 112 px (≤ 640). Spazio tra le
  tessere `M/6`, dentro il modulo (una tessera 2 × 1 è larga `2M − M/6`).
- Periodo `P` = **20 × 15 moduli** (3360 × 2520 px a 1440). La parete è un toro:
  posizione di un elemento = `(periodo_x × 20 + col) × M`, idem per le righe.
- Origine: all'apertura il **centro dell'isola d'ingresso** (col 10, riga 7,5 del
  periodo 0,0) è al centro della zona sicura dello schermo.
- Scarto fisso per tessera: ±10 px (±6 px sotto 640) su x e y, dal seme
  dell'id della posizione (uguale in ogni periodo e a ogni visita). Le isole non
  hanno scarto: sono cartelli dritti.

### 5.2 Mappa del periodo (20 colonne × 15 righe)

`IN` ingresso, `GU` solo guariti, `CH` chi tatua, `PR` prima di venire, `QC`
quanto costa, `CU` la cura, `DO` dove; numeri = posizioni delle foto `t01…t48`;
`··` = vuoto voluto. Le celle con lo stesso numero sono una sola tessera. Le
tessere e le isole che toccano il bordo continuano nel periodo accanto (t43,
t46, t47, PR sono spezzate qui solo nel disegno).

```
      0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
  0  43 01 ·· CU CU CU ·· 46 46 PR PR PR ·· ·· 47 47 ·· 02 02 43
  1  ·· 01 ·· CU CU CU ·· ·· ·· PR PR PR ·· 03 47 47 ·· 02 02 ··
  2  04 05 05 ·· ·· ·· 06 06 07 ·· ·· ·· 08 08 ·· ·· CH CH CH CH
  3  ·· 05 05 09 09 ·· 06 06 ·· 10 10 ·· 11 11 12 ·· CH CH CH CH
  4  13 05 05 ·· ·· ·· 06 06 ·· 10 10 ·· 11 11 12 14 14 ·· ·· ··
  5  13 ·· 15 15 16 16 ·· 17 17 ·· ·· 18 11 11 ·· 14 14 ·· 19 19
  6  20 20 ·· ·· 16 16 ·· ·· IN IN IN IN ·· 21 21 ·· ·· ·· 19 19
  7  20 20 22 22 16 16 ·· 23 IN IN IN IN ·· 21 21 GU GU GU ·· ··
  8  20 20 ·· ·· ·· 24 24 23 IN IN IN IN 25 25 ·· GU GU GU 26 27
  9  ·· ·· DO DO DO 24 24 ·· ·· 28 ·· ·· 29 30 30 ·· 31 31 26 ··
 10  35 32 DO DO DO ·· ·· 33 33 ·· 34 34 ·· 30 30 ·· 31 31 ·· 35
 11  35 32 ·· ·· ·· 36 36 33 33 ·· 34 34 ·· 30 30 ·· 37 ·· ·· 35
 12  ·· ·· 38 38 ·· 36 36 ·· 39 ·· 34 34 ·· ·· 40 40 QC QC QC ··
 13  43 ·· 38 38 41 36 36 ·· 39 ·· ·· ·· 42 42 ·· ·· QC QC QC 43
 14  43 44 44 ·· 41 ·· 45 46 46 PR PR PR 42 42 47 47 48 ·· ·· 43
```

**Isole** (angolo in alto a sinistra, larghezza × altezza in moduli):

| Isola | id | col, riga | Moduli | A 1440 (px) | A 375 (px) |
|---|---|---|---|---|---|
| Ingresso | `ingresso` | 8, 6 | 4 × 3 | 644 × 476 | 429 × 317 |
| Solo guariti | `guariti` | 15, 7 | 3 × 2 | 476 × 308 | 317 × 205 |
| Chi tatua | `chi` | 16, 2 | 4 × 2 | 644 × 308 | 429 × 205 |
| Prima di venire | `prima` | 9, 14 | 3 × 3 | 476 × 476 | 317 × 317 |
| Quanto costa | `costa` | 16, 12 | 3 × 2 | 476 × 308 | 317 × 205 |
| La cura | `cura` | 3, 0 | 3 × 2 | 476 × 308 | 317 × 205 |
| Dove | `dove` | 2, 9 | 3 × 2 | 476 × 308 | 317 × 205 |

Distanza minima tra due isole: 3 moduli (bordo a bordo, sul toro), verificata.

**Posizioni delle foto** (formato = colonne × righe; `opz` = si spegne nel
piano B, 5.4):

| id | formato | col, riga | | id | formato | col, riga | | id | formato | col, riga |
|---|---|---|---|---|---|---|---|---|---|---|
| t01 | 1×2 | 1, 0 opz | | t17 | 2×1 | 7, 5 | | t33 | 2×2 | 7, 10 |
| t02 | 2×2 | 17, 0 | | t18 | 1×1 | 11, 5 opz | | t34 | 2×3 | 10, 10 |
| t03 | 1×1 | 13, 1 opz | | t19 | 2×2 | 18, 5 | | t35 | 2×2 | 19, 10 |
| t04 | 1×1 | 0, 2 opz | | t20 | 2×3 | 0, 6 | | t36 | 2×3 | 5, 11 |
| t05 | 2×3 | 1, 2 | | t21 | 2×2 | 13, 6 | | t37 | 1×1 | 16, 11 |
| t06 | 2×3 | 6, 2 | | t22 | 2×1 | 2, 7 opz | | t38 | 2×2 | 2, 12 |
| t07 | 1×1 | 8, 2 opz | | t23 | 1×2 | 7, 7 opz | | t39 | 1×2 | 8, 12 opz |
| t08 | 2×1 | 12, 2 | | t24 | 2×2 | 5, 8 | | t40 | 2×1 | 14, 12 |
| t09 | 2×1 | 3, 3 | | t25 | 2×1 | 12, 8 opz | | t41 | 1×2 | 4, 13 |
| t10 | 2×2 | 9, 3 | | t26 | 1×2 | 18, 8 | | t42 | 2×2 | 12, 13 |
| t11 | 2×3 | 12, 3 | | t27 | 1×1 | 19, 8 opz | | t43 | 2×3 | 19, 13 |
| t12 | 1×2 | 14, 3 opz | | t28 | 1×1 | 9, 9 | | t44 | 2×1 | 1, 14 opz |
| t13 | 1×2 | 0, 4 | | t29 | 1×1 | 12, 9 | | t45 | 1×1 | 6, 14 opz |
| t14 | 2×2 | 15, 4 | | t30 | 2×3 | 13, 9 | | t46 | 2×2 | 7, 14 |
| t15 | 2×1 | 2, 5 opz | | t31 | 2×2 | 16, 9 opz | | t47 | 2×3 | 14, 14 |
| t16 | 2×3 | 4, 5 | | t32 | 1×2 | 1, 10 | | t48 | 1×1 | 16, 14 opz |

Totale: 48 posizioni (10 da 1×1, 8 da 2×1, 8 da 1×2, 12 da 2×2, 10 da 2×3) =
150 moduli, 50% del periodo; isole 53 moduli (18%); vuoto 97 moduli (32%),
senza nessun quadrato 3 × 3 tutto vuoto e senza file di 4 moduli vuoti di
seguito in riga o colonna tranne due.

### 5.3 Quale foto va dove

- Ogni foto ha **un formato fisso** (quello del suo ritaglio), deciso dal
  photo-editor in base alla misura vera e all'orientamento del tatuaggio:
  1×1 piccolo, 2×1 medio orizzontale, 1×2 medio verticale, 2×2 medio-grande,
  2×3 grande verticale. Obiettivo con 24 foto: 1×1 × 5, 2×1 × 4, 1×2 × 4,
  2×2 × 6, 2×3 × 5.
- Per ogni periodo `(px, py)` un seme `hash(px, py)` mescola le foto di ogni
  formato e le distribuisce sulle posizioni di quel formato in ordine di
  lettura, ricominciando la lista quando finisce.
- Vincolo: la stessa foto non compare a meno di 5 moduli (bordo a bordo, anche
  tra periodi vicini) da un'altra sua copia; se succede, si scambia con la
  posizione successiva dello stesso formato. Deterministico: stessa parete a
  ogni visita.
- Nel periodo 0,0 le 8 posizioni intorno all'ingresso (t10, t16, t17, t21,
  t23, t24, t28, t33) hanno foto **diverse tra loro** e rappresentano tutti e
  cinque gli stili: è la prima impressione.

### 5.4 Piano B (meno di 18 foto valide)

Il periodo resta 20 × 15 (le isole restano distanti). Si spengono le 16
posizioni `opz`: restano 32 posizioni (3 da 1×1, 4 da 2×1, 4 da 1×2, 11 da
2×2, 10 da 2×3), vuoto al 37%, ancora nessun quadrato 3 × 3 vuoto. Se un
formato non ha foto, le sue posizioni restano vuote. La scelta è automatica
all'avvio: `foto.length < 18`.

### 5.5 Il posto vuoto dopo la prenotazione

Dopo il successo, nel periodo 0,0 compare "Il tuo, quando sarà guarito":
- macchia più larga che alta o quadrata → nel vuoto sotto l'ingresso, col 10-11,
  riga 9 (2 × 1 moduli);
- macchia più alta che larga → nel vuoto a destra dell'ingresso, col 12, righe
  6-7 (1 × 2 moduli).
Il rettangolo ha le proporzioni esatte della macchia, il più grande possibile
dentro quei moduli, contorno osso 1 px, fondo nero, scritta sotto in
grotesk. "Non lo so ancora": proporzioni 1:1. Solo nel periodo 0,0 (è uno,
come il tuo tatuaggio).

### 5.6 Ordine di lettura e di tab dentro la parete

La parete tiene nel DOM **tutte le 55 voci del periodo corrente** (48 tessere +
7 isole, anche fuori schermo) più le copie visibili dei periodi vicini.
Periodo corrente = quello che contiene il centro dello schermo, ricalcolato
solo a parete ferma. Le copie dei periodi vicini sono cliccabili col
puntatore ma `aria-hidden` e `tabindex="-1"` (sono doppioni). Ogni voce ha una
`key` per posizione, non per periodo: cambiando periodo l'elemento resta lo
stesso e cambia solo la posizione, così il fuoco non si perde mai.

Ordine (lettura per righe dell'angolo, a partire dall'ingresso, poi si
ricomincia dall'alto del periodo):

```
IN t21 t22 t23 GU t24 t25 t26 t27 DO t28 t29 t30 t31 t32 t33 t34 t35 t36 t37
t38 t39 t40 QC t41 t42 t43 t44 t45 t46 PR t47 t48 t01 CU t02 t03 t04 t05 t06
t07 t08 CH t09 t10 t11 t12 t13 t14 t15 t16 t17 t18 t19 t20
```

Dentro un'isola il tab passa per i suoi comandi (bottone, link). Le tessere
arretrate dai filtri si saltano. Al fuoco su un elemento fuori dalla zona
sicura, la parete scivola (280 ms, subito in reduced motion) fino a portarlo
dentro con 24 px di aria.

---

## 6. Wireframe testuali per schermata

Misure a 1440 × 900 e 375 × 812. `[ ]` = comando, `▓` = foto, `◼` = bottone
rosso. Testi segnaposto.

### 6.1 Apertura: ingresso sulla parete

**1440**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[← TORNA IN CICERI LAB]                                                            │
│   ▓▓▓▓    ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓            ▓▓▓▓▓▓▓▓    ▓▓▓▓▓▓▓▓                      │ t16 t17 t10 t11 t14
│   ▓▓▓▓    ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓            ▓▓▓▓▓▓▓▓    ▓▓▓▓▓▓▓▓                      │ (parzialmente)
│   ▓▓▓▓          ┌──────────────────────────────────┐  ▓▓▓▓▓▓▓▓                      │
│   ▓▓▓▓      ▓▓  │                                  │  ▓▓▓▓▓▓▓▓    ┌───────────      │ GU entra da destra
│             ▓▓  │   Sottopelle                     │              │ Solo guar.      │
│ ▓▓▓▓▓▓▓▓    ▓▓  │   h1 gotico, 1 riga, ~150 px     │  ▓▓▓▓        │                 │
│ ▓▓▓▓▓▓▓▓    ▓▓  │                                  │  ▓▓▓▓        └───────────      │
│ ▓▓▓▓▓▓▓▓        │   Tatuaggi su appuntamento a     │                               │
│                 │   Pordenone. Sulla parete solo   │     ▓▓▓▓▓▓▓▓                  │
│      ▓▓▓▓       │   lavori guariti: trascinala.    │     ▓▓▓▓▓▓▓▓                  │
│      ▓▓▓▓       │   (max 20 parole, 60 car./riga)  │     ▓▓▓▓▓▓▓▓                  │
│                 │   ◼ Grande come?                 │                               │
│                 └──────────────────────────────────┘                               │
│  ┌──────────────────────── barra della parete ────────────────────────┐            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- Isola 644 × 476, fondo nero rialzato, padding 48 px. h1 in alto a sinistra
  dell'isola (non centrato: è un cartello appeso), frase sotto, bottone rosso in
  basso a sinistra. Niente altro: niente orari, numeri, secondo bottone.
- In alto a destra niente: nome e bottone dei comandi fissi compaiono solo
  quando l'ingresso esce.
- Primo disegno (LCP): l'isola in DOM, nero intorno. Le foto sbocciano ad anelli
  dall'ingresso verso fuori (anello 1: t10 t16 t17 t21 t23 t24 t28 t33).

**375**

```
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓   ▓▓▓▓                     │ t10 (parziale) t18
│ ▓▓▓▓▓▓▓▓▓   ▓▓▓▓                     │
│┌───────────────────────────────────┐│ isola 429 px > schermo: il FONDO
││ Sottopelle                        ││ esce di 27 px per lato, il
││ h1 56-60 px, una riga             ││ CONTENUTO è largo al massimo
││                                   ││ 100vw − 32 e centrato nello schermo
││ Tatuaggi su appuntamento a        ││
││ Pordenone. Sulla parete solo      ││ frase 3 righe
││ lavori guariti: trascinala.       ││
││ ◼◼◼◼◼◼◼ Grande come? ◼◼◼◼◼◼◼◼◼◼◼◼ ││ tutta larghezza − 32
│└───────────────────────────────────┘│
│   ▓▓▓▓   ▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓         │ t28 t33 t34
│ ┌─────────────────────────────────┐ │
│ │ [Parete|Elenco]     [Filtri]    │ │ riga B
│ └─────────────────────────────────┘ │
│ [← TORNA IN CICERI LAB]              │ riga A (rosso nascosto: c'è quello dell'isola)
└─────────────────────────────────────┘
```

A 375 × 667 (telefono piccolo) il bottone dell'isola deve restare sopra la riga
B: l'origine della parete si calcola sulla zona sicura (in alto 64, in basso
128 + safe), non sullo schermo intero.

### 6.2 La parete in movimento (qualsiasi punto)

**1440**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[← TORNA IN CICERI LAB]                                   Sottopelle  ◼Grande come?│
│    ▓▓▓▓▓▓▓▓      ▓▓▓▓    ░░░░░░░░         ▓▓▓▓▓▓▓▓                                │ ░ = foto che sboccia
│    ▓▓▓▓▓▓▓▓      ▓▓▓▓    ░░░░░░░░         ▓▓▓▓▓▓▓▓      ┌──────────────┐          │ (nuvola che si apre)
│    ▓▓▓▓▓▓▓▓              ░░░░░░░░                       │ Chi tatua    │          │
│                ▓▓▓▓▓▓▓▓                  ▒▒▒▒           │ …            │          │ ▒ = arretrata (filtro)
│    ▓▓▓▓        ▓▓▓▓▓▓▓▓    ▓▓▓▓▓▓▓▓      ▒▒▒▒           └──────────────┘          │
│    ▓▓▓▓                    ▓▓▓▓▓▓▓▓                                               │
│  ┌──────────────────────── barra della parete ────────────────────────┐            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Nessuna etichetta sulle foto. Il cursore è `grab`/`grabbing` di sistema. Al
passaggio su una foto posata: increspatura. Al fuoco da tastiera: anello osso
2 px con 2 px di distacco attorno alla tessera.

**375**: stessa cosa, 5-7 foto intere per schermo; nome in alto a sinistra e
[⌂] a destra; riga A con il rosso.

### 6.3 Isole (in parete)

Struttura comune: `<section aria-labelledby>` con fondo nero rialzato, padding
40 px (1440) / 20 px (375), titolo gotico h2, testo grotesk 16-17 px. Nessun
bordo, nessuna ombra. Se il testo non entra (testo ingrandito dall'utente,
misurato con ResizeObserver: `scrollHeight > clientHeight`), l'isola mostra la
versione breve del copywriter e un link "Continua nell'elenco" che apre la
vista elenco su quella sezione. Niente scroll dentro le isole (litigherebbe col
trascinamento).

| Isola | 1440 (476 × 308 salvo dove detto) | 375 (317 × 205 salvo dove detto) |
|---|---|---|
| **Solo guariti** | h2 + tre righe: perché i guariti, cosa guardarci (linee pulite, neri pieni, niente sbavature) | h2 + tre righe brevi (max 38 car.) |
| **Chi tatua** (644 × 308 / 429 × 205, contenuto max 343) | due colonne: *Nives* (gotico 40 px) + cosa fa + giorni + [Solo i suoi]; *Tobia* uguale. Nessun ritratto | due blocchi uno sotto l'altro, compatti: nome gotico 32, una riga, giorni, [Solo i suoi] alto 44 |
| **Prima di venire** (476 × 476 / 317 × 317) | h2 + 5 regole in elenco (18 anni e documento; consulenza gratuita 20 min; caparra 50 € scalata, resa con 48 h; monouso e sterilizzazione; cosa non facciamo) | h2 + 5 regole in versione breve, una riga ciascuna |
| **Quanto costa** | h2 + "minimo 80 €", "110 € l'ora", link testuale "la stima per il tuo la fa Grande come?" (apre il pannello; è un link, non un bottone rosso) | uguale, cifre in `tabular-nums` |
| **La cura** | h2 + 5 righe (lavare, crema sottile, niente sole, niente mare e piscina, non grattare) + "ritocco gratuito entro 3 mesi" | 5 righe brevi + ritocco |
| **Dove** | h2 + indirizzo di esempio, orari di esempio, link "Chiama", "Scrivi", "Apri in Maps" (mappa vera, nuova scheda). Sotto, in piccolo, colophon: font, "Lavori fotografati da altri autori su Unsplash, usati come esempio" + link "Crediti" (vista elenco, sezione crediti), "Attività inventata. Un concept di CiceriLab." | indirizzo, orari su due righe, tre link in fila, colophon in una riga + "Crediti" |

Recapiti: link "Chiama" (`tel:`) e "Scrivi" (`mailto:`) di esempio, senza
numeri finti in vista (copywriter).

### 6.4 Scheda del lavoro (`#lavoro-<id>`, dialogo modale)

**1440**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[← TORNA IN CICERI LAB]                                                  [Chiudi ✕]│ chiudi 44×44 top-right
│                                                                                  │
│      ┌───────────────────────────────────┐                                        │
│      │                                   │    Ramo d'ulivo                        │ h2 grotesk 28
│      │                                   │                                        │
│ [‹]  │   FOTO 1600 px, alta 80vh         │    Stile        linea fine            │ dl in due colonne
│      │   larghezza secondo formato       │    Zona         avambraccio           │ tabular-nums
│      │                                   │    Misura       9 × 3 cm              │
│      │                                   │    Sedute       una, 2 ore            │
│      │                                   │    Guarito da   un anno               │
│      │                                   │    Di           Nives                 │
│      │                                   │                                        │
│      └───────────────────────────────────┘    ◼ Grande come?                      │ "una cosa così"
│                                                  (aria-label: "Grande come? Parti │
│                                               3 di 11                  [›]      │  da questo lavoro")
└──────────────────────────────────────────────────────────────────────────────────┘
```

- Fondo nero pieno (la parete dietro è nascosta, non sfocata). Frecce ‹ › 44 × 44
  ai lati, anche ← → da tastiera; "3 di 11" conta i lavori del filtro attivo.
- Ordine: quello della vista elenco (le 24 foto uniche, filtrate), non le
  posizioni: nella scheda non si vedono doppioni.
- La foto 640 della parete resta mostrata finché arriva la 1600; se la 1600
  non arriva resta la 640. Nessuno spinner.

**375**

```
┌─────────────────────────────────────┐
│                          [Chiudi ✕] │ top 12
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ foto a tutta larghezza − 32,
│ │  FOTO, 60% dell'altezza         │ │ alta al massimo 60dvh
│ │                                 │ │ swipe orizzontale = lavoro
│ │                                 │ │ precedente/successivo
│ └─────────────────────────────────┘ │
│ Ramo d'ulivo                        │
│ linea fine · avambraccio · 9 × 3 cm │ dati in righe (dl), scorrono
│ una seduta, 2 ore · guarito da un   │
│ anno · Nives                        │
│ [‹]        3 di 11             [›]  │ 44×44
│ ◼◼◼◼◼◼◼◼ Grande come? ◼◼◼◼◼◼◼◼◼◼◼ │ tutta larghezza
│ (76 px di aria per il bottone sito) │
└─────────────────────────────────────┘
```

Chiusura: Chiudi, Esc, indietro del browser, trascinamento in giù della foto
su touch (soglia 96 px). Il fuoco torna alla tessera da cui si è partiti; se
nel frattempo si è andati su un altro lavoro, la parete scivola sulla
posizione più vicina di quel lavoro e il fuoco va lì.

### 6.5 Vista elenco (`#elenco`)

**1440** (pagina che scorre, colonna di contenuto 1080 px, margine sinistro
libero per il bottone del sito in alto)

```
│[← TORNA IN CICERI LAB]                                                           │
│                                                                                  │
│   Sottopelle                                         [Parete|Elenco]            │ testata in flusso,
│   Tatuaggi su appuntamento a Pordenone. …            ◼ Grande come?              │ non fissa
│                                                                                  │
│   Lavori                                                                         │ h2
│   Stile: linea fine · blackwork · …   Misura: …   Chi: …   [Azzera]             │ stessi filtri
│   11 lavori su 24                                                                │ aria-live
│   ┌──────────────────────┐  ┌──────────────────────┐                             │ due colonne
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │                             │ foto in proporzione
│   └──────────────────────┘  └──────────────────────┘                             │ vera, colonne
│   Ramo d'ulivo, linea fine,   Ornamento sulla scapola,                           │ sfalsate (non griglia
│   avambraccio, 9 × 3 cm,      blackwork, 22 × 18 cm,                             │ regolare)
│   guarito da un anno. Nives   guarito da 8 mesi. Tobia                           │ didascalia SOTTO
│   …                                                                              │
│   Solo guariti · Chi tatua · Prima di venire · Quanto costa · La cura · Dove     │ sei h2, testo pieno
│   Crediti delle foto (autore, link Unsplash) · colophon                          │ h2 Crediti
```

- Ogni foto è un bottone che apre la scheda (stesso dialogo).
- h1 unico: *Sottopelle* (la parete, nascosta in questa vista, non è nel DOM
  accessibile: `inert` + `aria-hidden`, canvas in pausa).
- Nessuno sboccio, nessuna increspatura: le foto sono già posate.
- Tornando alla parete, riprende dal punto lasciato (`stp-vista`).

**375**: una colonna, foto a tutta larghezza − 32, didascalia sotto; testata
in flusso con "Grande come?" a tutta larghezza; interruttore e "Filtri" nella
riga B fissa come sulla parete (la riga A resta: bottone sito + rosso, ma il
rosso è nascosto finché quello della testata è in vista). Ultimo elemento con
140 px di aria sotto (righe A e B).

### 6.6 Grande come? · taratura (solo la prima volta)

**1440** (pannello a tutto schermo, fondo nero rialzato, dialogo modale)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[← TORNA IN CICERI LAB]      Grande come?                               [Chiudi ✕]│ h2 del pannello
│                                                                                  │
│      Appoggia una carta (bancomat, tessera sanitaria) sullo schermo              │
│      e allarga il rettangolo finché combacia.                                    │
│                                                                                  │
│               ┌─────────────────────────────────┐◢                                │ rettangolo 85,60 × 53,98
│               │                                 │  maniglia 44×44                 │ raggio 3,18 mm
│               │                                 │                                 │ a sinistra del centro
│               └─────────────────────────────────┘                                 │
│                                                                                  │
│               [−]  larghezza della carta sullo schermo  [+]                       │ slider accessibile
│                                                                                  │
│               [Combacia]        [Salta, uso una stima]                            │ contorno osso, non rossi
└──────────────────────────────────────────────────────────────────────────────────┘
```

**375**: stesso contenuto in colonna; il rettangolo parte da 85,60 mm stimati
(323 px a 96 dpi CSS, ci sta in 343) e si trascina dalla maniglia o dai − / +.
Il telefono va tenuto in verticale sul tavolo: frase "Appoggia il telefono sul
tavolo e la carta sopra".

Comportamento: il rettangolo è un `role="slider"` (valore = px per mm,
`aria-valuetext` "carta larga 8,6 cm sullo schermo"), frecce ±1 px, Maiusc +
frecce ±10 px, PagSu/PagGiù ±10 px. "Combacia" salva `stp-taratura` e mostra il
banco. "Salta" usa 96 px/pollice CSS (3,78 px/mm) e accende la nota "misure
approssimate · tara lo schermo" accanto alle misure del banco (link che riapre
la taratura).

### 6.7 Grande come? · banco, frase, stima, posto

**1440**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[← TORNA IN CICERI LAB]      Grande come?                               [Chiudi ✕]│
│┌──────────── BANCO (56%, fermo) ─────────────┐┌── FRASE E POSTO (44%, scorre) ──┐│
││ Confronta con:                              ││ Grande [6 × 4 cm], sul [polso], ││ frase 26 px
││ [moneta] [carta] [telefono] [cartolina]     ││ in [linea fine], ed è il mio    ││
││                                             ││ [primo] tatuaggio. L'idea:      ││
││                                             ││ [scrivi due parole        ]     ││
││   ┌─────────────────┐  ┌──────────┐◢        ││                                 ││
││   │                 │  │░░░░░░░░░░│ 4 cm    ││ Circa  2  ore, una seduta.      ││ "2" gotico grande
││   │   carta         │  │░ macchia░│         ││ Da 200 a 260 €, caparra 50 €.   ││ aria-live polite
││   │   85,6 × 54 mm  │  │░░░░░░░░░░│         ││ È una stima: il prezzo vero lo  ││
││   └─────────────────┘  └──────────┘         ││ diciamo in consulenza.          ││
││     (appoggiati sulla stessa linea di base)  ││                                 ││
││                         6 cm                ││ La consulenza, 20 minuti        ││ h3
││   Larghezza [−] 6 cm [+]  Altezza [−] 4 [+] ││ ‹ mar 29  mer 30  gio 1  ven 2 ›││ giorni: radio,
││   [Non lo so ancora]                        ││   Nives   Nives+Tobia  Tobia    ││ scorrono di lato
││   misure approssimate · tara lo schermo     ││ 15:00  15:40  16:20  17:40 …    ││ orari: radio
│└─────────────────────────────────────────────┘│                                 ││
│                                               │ Nome [                    ]     ││
│                                               │ Telefono o email [        ]     ││
│                                               │ [☐] Ho 18 anni compiuti         ││
│                                               │ ◼ Fissa la consulenza           ││
│                                               └─────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────────┘
```

- Il banco resta fermo a sinistra mentre la colonna destra scorre: su desktop
  la macchia è sempre in vista mentre si completa la frase.
- Oggetto e macchia appoggiati sulla stessa linea di base, 32 px tra loro. Se
  insieme non ci stanno, **la macchia resta intera** e l'oggetto esce dal bordo
  sinistro del banco con il contorno che continua tratteggiato e la scritta
  "esce dallo schermo". Se è la macchia a non starci da sola, esce lei dal
  bordo destro, stessa regola, e la scritta dice "è più grande di questo
  schermo".
- Le misure scritte accanto ai lati della macchia (grotesk, `tabular-nums`).
- Ordine di tab: Chiudi → Confronta con → campi della macchia → Non lo so →
  nota taratura → frase (parti in ordine) → giorni → orari → Nome → Contatto →
  casella → Fissa la consulenza. La maniglia d'angolo **non** è nel tab (i
  campi fanno la stessa cosa): è solo per il puntatore.

**375** (tutto il pannello scorre, niente di fisso tranne Chiudi)

```
┌─────────────────────────────────────┐
│ Grande come?              [Chiudi ✕]│ testata del pannello, fissa, alt. 56
│ [moneta][carta][telefono][cartolina]│ 4 bottoni di testo, a capo se serve
│ ┌───────────────┐  ┌──────┐◢        │ banco: metà alta dello schermo;
│ │ carta         │  │░░░░░░│         │ moneta e carta ci stanno, telefono
│ │ 85,6 × 54     │  │░░░░░░│ 4 cm    │ e cartolina escono tratteggiati
│ └───────────────┘  └──────┘         │
│                      6 cm           │
│ Larghezza [−] 6 cm [+]              │ campi su due righe, − / + 44×44
│ Altezza   [−] 4 cm [+]              │
│ [Non lo so ancora]                  │
│ misure approssimate · tara lo…      │
│                                     │
│ Grande [6 × 4 cm], sul [polso], in  │ frase 19-20 px; ogni parte apre un
│ [linea fine], ed è il mio [primo]   │ foglio dal basso
│ tatuaggio. L'idea: [          ]     │
│                                     │
│ Circa  2  ore, una seduta.          │
│ Da 200 a 260 €, caparra 50 €.       │
│ È una stima: …                      │
│                                     │
│ La consulenza, 20 minuti            │
│ ‹ mar 29 · mer 30 · gio 1 · ven 2 › │ riga che scorre di lato (snap)
│ 15:00  15:40  16:20                 │ orari in griglia a 3, alti 44
│ 17:40  18:20                        │
│ Nome                                │
│ [                                 ] │
│ Telefono o email                    │
│ [                                 ] │
│ [☐] Ho 18 anni compiuti             │
│ ◼◼◼◼◼◼ Fissa la consulenza ◼◼◼◼◼◼◼ │
│ (76 px di aria per il bottone sito) │
└─────────────────────────────────────┘
```

- Il banco **non** resta fermo sopra le scelte (quella struttura è di IMPRONTA):
  scorre via con il resto.
- Tastiera del telefono aperta sui campi: nessun elemento fisso in basso (il
  pannello non ne ha), il campo scorre sopra la tastiera (`visualViewport`).

### 6.8 Parti della frase: cosa apre ognuna

| Parte | Vuota si legge | Apre (desktop: popover sotto la parola; mobile: foglio dal basso) |
|---|---|---|
| misura | `[che misura?]` | porta il fuoco al campo Larghezza del banco (mobile: scorre al banco). Non un doppione dei campi |
| zona | `[dove?]` | gruppo di radio con 13 zone in parole: polso, avambraccio, braccio, spalla, scapola, schiena, costole, fianco, coscia, polpaccio, caviglia, mano, collo |
| stile | `[che stile?]` | radio: linea fine, blackwork, lettering, ornamentale, nero e grigio, "non lo so" |
| primo | `[primo]` (valore iniziale) | radio: primo / non il primo |
| idea | campo inline | `<input>` vero, max 80 caratteri, facoltativo, `aria-labelledby` = "L'idea:" |

Scelta fatta = il popover o il foglio si chiude da solo e il fuoco torna alla
parte della frase, che ora dice il valore.

### 6.9 Grande come? · successo

**1440**: la colonna destra si sostituisce con la conferma; il banco resta con
la macchia posata (nitida, ferma).

```
││   ┌─────────────────┐  ┌──────────┐       ││ Ci vediamo giovedì 1 ottobre   ││ h3, fuoco qui
││   │ carta           │  │██████████│       ││ alle 17:40, in via … a         ││
││   └─────────────────┘  └──────────┘       ││ Pordenone, per 20 minuti.      ││
││                                           ││ Porta un'idea, anche una foto: ││
││                                           ││ la misura l'abbiamo già.       ││
││                                           ││ [Aggiungi al calendario]       ││ file .ics
││                                           ││ [Torna alla parete]            ││ contorno osso
```

Niente cartolina, ricevuta, biglietto, numero di prenotazione. **375**: stesso
testo sotto il banco, poi i due comandi a tutta larghezza.

"Torna alla parete" (e ogni chiusura dopo il successo) chiude il pannello, la
parete scivola all'ingresso, compare il posto vuoto (5.5) e il fuoco va al
posto vuoto (`role="img"` con nome "Il tuo, quando sarà guarito: 6 × 4 cm,
consulenza giovedì 1 ottobre alle 17:40").

---

## 7. Tutti gli stati e l'accessibilità per interazione

### 7.1 Base di pagina

- Lingua `it`. Un solo h1 (*Sottopelle*, nell'isola d'ingresso o nella testata
  dell'elenco). h2 per isole e pannelli.
- Primo elemento tabulabile: **"Vai all'elenco"** (nascosto finché non ha il
  fuoco, poi visibile in alto al centro, sotto la zona del bottone del sito).
  Ordine DOM: link di salto → comandi in alto (nome, Grande come?) → barra della
  parete (è la barra degli strumenti della parete, viene prima di lei) →
  regione della parete. Il ConceptBackButton è montato fuori dal concept.
- Anello di focus osso 2 px, distacco 2 px, su tutto; mai coperto da un fisso
  (zone sicure in 2.3 e 2.5, `scroll-padding` in 2.2).
- Obiettivi di tocco ≥ 44 × 44 su touch; su desktop almeno 32 px di altezza.

### 7.2 Stati della parete

| Stato | Cosa si vede | Note |
|---|---|---|
| Prima del JS (prerender) | nero, isola d'ingresso con h1, frase, bottone (link a `#grande-come`) | niente contenuti nascosti dietro il JS per l'h1 |
| WebGL in preparazione | isola visibile, tessere DOM presenti ma vuote (nero) | nessuno spinner, nessun preloader |
| Pronta | sboccio ad anelli, deriva di 40 px | una volta sola per visita |
| Senza WebGL / contesto perso | tessere DOM con `<img>`, sboccio con `mask-image` radiale 700 ms, niente increspatura | una tessera torna al DOM finché il GL non l'ha disegnata davvero |
| Foto che non si carica | la tessera resta nero rialzato con la descrizione breve in grotesk 14 px grigio lettura, centrata | niente icona rotta; nella scheda la stessa descrizione |
| Filtro attivo | esclusi arretrati, contatore annunciato | 2.7 |
| Zero risultati | tutto arretrato + riga "Nessun lavoro così" + Azzera | |
| Scheda del browser nascosta | rendering in pausa | |
| Posto prenotato | posto vuoto accanto all'ingresso | 5.5 |
| Reduced motion | foto già posate (dissolvenza 150 ms solo al primo caricamento), niente deriva, niente inerzia, niente increspature, scivolate istantanee | |

### 7.3 Muovere la parete

- **Puntatore / dito**: trascinamento 1:1, inerzia al rilascio; tocco senza
  trascinamento (sotto 6 px) su una tessera = apre la scheda. `touch-action:
  none` solo sul contenitore della parete.
- **Rotella / trackpad**: sposta (deltaX, deltaY). Ctrl + rotella (pizzico del
  trackpad) **non** viene intercettato: resta lo zoom del browser.
- **Tastiera**:
  - fuoco sulla regione della parete (è tabulabile, `role="region"`,
    `aria-label="Parete dei lavori: trascina o usa le frecce"`,
    `aria-roledescription` non usato): frecce = un modulo, Maiusc + frecce =
    quattro moduli;
  - fuoco su una tessera o su un comando di un'isola: frecce = fuoco alla voce
    più vicina in quella direzione (sul toro), la parete la porta dentro la
    zona sicura; Invio o Spazio sulla tessera = scheda;
  - `Home` (ovunque sulla parete) = torna all'ingresso, fuoco sull'h1
    (`tabindex="-1"`);
  - Tab / Maiusc+Tab = ordine 5.6.
- **Lettore di schermo**: ogni tessera è un `<button>` con nome = descrizione
  del lavoro ("Ramo d'ulivo a linea fine sull'avambraccio, 9 × 3 cm, guarito da
  un anno, di Nives"); il canvas è `aria-hidden`. Le isole sono sezioni con
  titolo: la navigazione per titoli le trova nell'ordine 5.6.
- **Zoom 200%**: a 1440 diventa una finestra di 720 px, layout tablet, parete
  intatta. **Zoom 400%**: vedi 7.8.

### 7.4 Sboccio e increspatura

Non sono comandi: nessuna alternativa necessaria, ma:
- mai più di una variazione di luminosità monotona per tessera (dal nero alla
  foto), nessun lampo, sotto le 3 variazioni al secondo;
- increspatura al massimo una per tessera ogni 600 ms, luminosità ±3% al
  massimo;
- reduced motion = niente di tutto questo (7.2).

### 7.5 Filtri e interruttore Parete/Elenco

- Filtri: `<button aria-pressed>` dentro `role="group"` con `aria-labelledby`
  ("Stile", "Misura", "Chi"). Contatore "11 lavori su 24" in una regione
  `aria-live="polite"`, annunciato 400 ms dopo l'ultima pressione (non a ogni
  tasto).
- Popover 1024-1279: bottone con `aria-expanded` e `aria-controls`; Esc chiude
  e riporta il fuoco al bottone; il fuoco non è intrappolato (non è modale).
- Foglio mobile e tablet: dialogo modale (`role="dialog"`, `aria-modal`, titolo
  "Filtri"), fuoco intrappolato, sfondo `inert` tranne il bottone del sito.
- Interruttore: due bottoni con `aria-pressed` ("Parete", "Elenco"). Passando
  all'elenco il fuoco va all'h1 dell'elenco; tornando alla parete, alla voce che
  aveva il fuoco prima o, se non c'era, alla regione.
- Reduced motion: filtri e fogli senza movimento (compaiono).

### 7.6 Scheda del lavoro

| Stato | Comportamento |
|---|---|
| Apertura dalla parete | FLIP 420 ms dalla tessera; reduced motion: dissolvenza 150 ms |
| Apertura dall'elenco o da URL | dissolvenza, niente FLIP |
| Foto grande in arrivo | resta la 640 (nessuno spinner) |
| Foto grande fallita | resta la 640; se manca anche quella, la descrizione |
| Primo / ultimo lavoro | le frecce fanno il giro (dall'ultimo al primo): il toro non ha fine; "11 di 11" → "1 di 11" |
| Filtro cambiato mentre è aperta | non si può: i filtri sono dietro, `inert` |

Accessibilità: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` = h2 del
lavoro, fuoco iniziale sull'h2 (`tabindex="-1"`), poi Chiudi. ← → cambiano
lavoro anche con il fuoco su Chiudi o sulle frecce; il cambio annuncia il nuovo
h2 (il fuoco va sull'h2). Swipe orizzontale su touch con alternativa: i bottoni
‹ ›. Esc chiude. Foto con `alt` = descrizione completa.

### 7.7 Grande come? · tutti gli stati

| Stato | Cosa si vede e cosa succede |
|---|---|
| **Chiuso** | parete o elenco |
| **Aperto, mai tarato** | taratura (6.6). Il fuoco va all'h2 del pannello |
| **Aperto, tarato** | banco diretto |
| **Aperto, taratura saltata** | banco + nota "misure approssimate · tara lo schermo" (link) |
| **Taratura rifatta** | stesso flusso di 6.6, poi il banco con la stessa macchia in cm (cambiano solo i px) |
| **Banco vuoto** (default) | carta come oggetto, macchia 5 × 5 cm (quindi la misura nella frase c'è già); vuoti `[dove?]` e `[che stile?]`, `[primo]` già scelto; stima: "Scegli la zona e ti diciamo quante sedute." Nessun giorno scelto |
| **Precompilato dalla scheda** | misura, zona e stile di quel lavoro; oggetto più vicino per misura (moneta se ≤ 3 cm, carta ≤ 9, telefono ≤ 15, cartolina oltre) |
| **Precompilato da URL o filtri** | solo i campi indicati (stile dal filtro se ce n'è uno solo attivo; artista non entra nella frase ma evidenzia i giorni di quell'artista) |
| **Bozza della visita** | riaprendo, tutto come lasciato (`stp-bozza`), contatto vuoto |
| **Misura in modifica** | maniglia (puntatore) o campi / − / +. Passo 0,5 cm. Il numero accanto al lato si aggiorna dal vivo; la stima si aggiorna quando ci si ferma (300 ms) |
| **Misura al limite** | sotto 1 o sopra 40 cm la macchia si ferma, il − o il + si disattiva e sotto i campi: "Da 1 a 40 cm: più grande lo decidiamo in consulenza." |
| **Oggetto o macchia fuori schermo** | contorno tratteggiato oltre il bordo + scritta (6.7) |
| **Non lo so ancora** | la macchia diventa un tratteggio senza inchiostro, le misure spariscono, la parte misura della frase dice `[la misura la decidiamo insieme]`; stima: "La misura la decidiamo insieme in consulenza." Premendo un − / + o la maniglia, torna la macchia |
| **Zona scelta, stile no** | stima calcolata con stile medio, con "(stile da decidere)" dopo le ore |
| **Stima completa** | 7.9; `aria-live="polite"` annuncia solo la frase della stima, non tutta la frase |
| **Nessun giorno scelto** | riga dei giorni, orari assenti con testo "Scegli un giorno." |
| **Giorno pieno** | il giorno resta nella riga ma è `aria-disabled` con scritto "pieno" (grigio lettura); non si seleziona |
| **Giorno scelto** | orari liberi di quel giorno; sotto: "altri 5 già presi" (non si mostrano gli orari presi) |
| **Orario scelto** | il posto si riempie d'inchiostro (450 ms, subito in reduced motion) |
| **Campo in errore** | messaggio sotto il campo, osso + icona, collegato con `aria-describedby` e `aria-invalid="true"`; si valida all'uscita dal campo e all'invio, mai mentre si scrive; l'errore sparisce appena il valore è valido |
| **Invio con errori** | nessun invio; il fuoco va al **primo** elemento in errore nell'ordine di tab (anche un orario mancante: fuoco sul gruppo degli orari o dei giorni con "Scegli un orario per la consulenza"); 18 anni non spuntato: "Tatuiamo solo maggiorenni: se hai meno di 18 anni, scrivici con un genitore." |
| **Invio in corso** | bottone premuto, "Sto fissando…", `aria-disabled`, tutto il resto invariato e non modificabile (fieldset `disabled`); 900 ms simulati; annunciato |
| **Invio fallito** (`navigator.onLine === false` o `?invio=errore`) | la macchia non si posa, resta morbida; messaggio sotto il bottone: "Non è partita. Riprova, oppure chiamaci." con link "Chiama"; il bottone torna attivo; i dati restano; fuoco sul messaggio (`role="alert"`) |
| **Successo** | 6.9; `track("demo_prenotazione", { concept: 12 })` una volta sola; `stp-posto` salvato |
| **Riaperto dopo il successo** | conferma ancora visibile + link "Fissa un'altra consulenza" che riporta al banco con la stessa macchia e contatto vuoto |
| **Chiuso senza inviare** | bozza tenuta per la visita; nessuna domanda "sei sicuro?" |
| **Chiusura** | Chiudi, Esc (se non c'è un popover o un foglio aperto, che si chiude prima), indietro del browser. Il fuoco torna al bottone da cui si era aperto |

**Accessibilità del pannello**: `role="dialog"`, `aria-modal`, titolo h2
"Grande come?", fuoco iniziale sull'h2; fuoco intrappolato; sfondo `inert`
tranne il bottone del sito.
- Oggetti di confronto: gruppo di radio (`role="radiogroup"`, nome "Confronta
  con"), frecce per cambiare. L'oggetto disegnato è `role="img"` con nome
  "Carta di credito a grandezza vera, 8,6 per 5,4 cm".
- Macchia: `role="img"` con nome aggiornato ("Il tuo tatuaggio, 6 per 4 cm,
  più piccolo della carta"). Il confronto a parole ("più piccolo della carta",
  "grande come due monete", "più grande del telefono") è scritto anche in
  vista sotto il banco, per chi non vede la scala.
- Campi larghezza e altezza: `<input type="number" inputmode="decimal">` con
  etichette visibili, `step 0.5`, `min 1`, `max 40`; − / + con `aria-label`
  "Larghezza meno mezzo centimetro". Frecce su/giù nel campo = ±0,5.
- Frase: testo normale con bottoni dentro; ogni bottone ha nome completo
  ("Zona: polso. Cambia"); popover con `aria-expanded`; foglio mobile modale.
- Giorni: `role="radiogroup"` orizzontale, frecce ← → per cambiare, i giorni
  pieni si saltano; nome di ogni giorno completo ("martedì 29 settembre,
  Nives, 4 orari liberi"). Orari: `radiogroup`, frecce.
- Reduced motion: nessun riempimento animato, la macchia si posa subito.
- Zoom 400%: il pannello è in colonna (layout mobile), il banco mostra gli
  oggetti tratteggiati fuori bordo come su telefono; tutto scorre.

### 7.8 Zoom 400% e altezze basse

A 1280 × 800 con zoom 400% la finestra è 320 × 200 CSS px: righe A e B e
testata lascerebbero meno di 60 px di parete. Regola: **se all'avvio (o al
resize) l'altezza utile è sotto 480 px, si passa alla vista elenco**, con un
avviso una tantum in testa all'elenco: "Schermo basso: ti mostriamo l'elenco.
[Torna alla parete]". Se l'utente torna alla parete, la scelta vale per la
visita e la parete nasconde la testata alta (nome e ⌂ entrano nel foglio
Filtri). L'elenco a 320 px: una colonna, testo a capo libero, nessuna
larghezza fissa, nessuno scroll orizzontale (WCAG 1.4.10).

### 7.9 La stima (di esempio, da dichiarare come tale)

Dati: larghezza `L` e altezza `A` in cm, stile, zona, primo sì/no.

1. **Area efficace**: `a = L × A`; se `a > 100`, `a = 100 + (a − 100) × 0,6`
   (le superfici grandi si riempiono più in fretta per cm²).
2. **Minuti** = `30` (preparazione e disegno sulla pelle) + `a × m_stile × f_zona`.

| Stile | m (minuti per cm²) | | Zona | f | | Zona | f |
|---|---|---|---|---|---|---|---|
| linea fine | 2,0 | | polso | 1,00 | | schiena | 1,10 |
| lettering | 2,5 | | avambraccio | 1,00 | | caviglia | 1,15 |
| ornamentale | 3,5 | | braccio | 1,00 | | mano | 1,25 |
| nero e grigio | 4,0 | | coscia | 1,00 | | collo | 1,25 |
| blackwork | 4,5 | | spalla | 1,05 | | fianco | 1,30 |
| non lo so / da decidere | 3,2 | | polpaccio | 1,05 | | costole | 1,35 |
| | | | scapola | 1,10 | | | |

3. **Ore** = minuti / 60, minimo 1. Mostrate arrotondate **per eccesso** alla
   mezz'ora fino a 10 ore, all'ora oltre ("un'ora", "un'ora e mezza", "2 ore",
   "2 ore e mezza", "12 ore"). La cifra in gotico è il numero intero (per
   "un'ora e mezza" la cifra è 1 e il resto in grotesk: "1 ora e mezza").
4. **Sedute** = `ceil(ore / max)`, `max` = 3 al primo tatuaggio, 4 dopo. Oltre
   una seduta: "in circa N mesi" con N = `(sedute − 1)` (una seduta ogni 4
   settimane, arrotondato al mese).
5. **Prezzo**: `basso = max(80, arrotonda10(ore × 110 × 0,9))`,
   `alto = max(110, arrotonda10(ore × 110 × 1,25))` (ore non arrotondate).
   Separatore delle migliaia col punto ("5.940 €"). Caparra sempre 50 €.
6. Sotto, sempre: "È una stima: il prezzo vero lo diciamo in consulenza,
   guardando la pelle."

Esempi di controllo (per i test del builder):

| Misura, zona, stile, primo | Minuti | Mostrato | Sedute | Forbice |
|---|---|---|---|---|
| 5 × 3, polso, linea fine, primo | 60 | un'ora | una | 100-140 € |
| 6 × 4, polso, linea fine, primo | 78 | un'ora e mezza | una | 130-180 € |
| 3 × 2, caviglia, lettering, primo | 47 | un'ora (minimo) | una | 100-140 € |
| 12 × 8, avambraccio, blackwork, non primo | 462 | 8 ore | due, in circa un mese | 760-1.060 € |
| 30 × 40, schiena, blackwork, non primo | 3.792 | 64 ore | 16, in circa 15 mesi | 6.260-8.690 € |

Le ore passate al prezzo sono quelle non arrotondate, dopo il minimo di 1.
Verificati con uno script.

### 7.10 Calendario delle consulenze (di esempio)

- Apertura di esempio: martedì-sabato 10-19 (da allineare con brand-strategist
  e copywriter). Chiuso domenica, lunedì e festivi nazionali (1/1, 6/1,
  Pasquetta calcolata, 25/4, 1/5, 2/6, 15/8, 1/11, 8/12, 25/12, 26/12) più il
  patrono di Pordenone l'8 settembre.
- **Prossimi 10 giorni di apertura** a partire da domani (mai oggi).
- Orari delle consulenze da 20 minuti: martedì-venerdì 15:00-18:40 (12 orari:
  15:00, 15:20 … 18:40); sabato 10:00-12:40 (9 orari).
- Chi c'è: di esempio Nives martedì, mercoledì, venerdì; Tobia mercoledì,
  giovedì, sabato. Il giorno mostra il nome o i nomi. L'ordine resta sempre
  per data; con il filtro artista attivo, i giorni di quell'artista hanno il
  nome in osso, gli altri in grigio lettura (restano sceglibili).
- Occupati: pseudo-casuali ma fissi, dal seme della data (stesso risultato a
  ogni visita nello stesso giorno), circa il 40% degli orari; un giorno su
  cinque tutto pieno ("pieno"); mai i primi due giorni entrambi pieni.
- Il posto prenotato (successo) diventa occupato per il resto della visita.

### 7.11 Contatto

- **Nome**: obbligatorio, almeno 2 lettere. Errore: "Scrivi il tuo nome."
- **Telefono o email**: un solo campo `type="text"` con `autocomplete="on"`
  (un solo valore di `autocomplete` non copre entrambi). Valido se è un'email
  (`/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`) o un telefono (tolti spazi, `+`, punti,
  trattini e parentesi, da 8 a 13 cifre). Errore: "Scrivi un numero o
  un'email a cui risponderti."
- **Casella 18 anni**: obbligatoria, `<input type="checkbox">` vero con
  etichetta cliccabile, area 44 × 44.
- Etichette sopra, sempre visibili; niente segnaposto al posto
  dell'etichetta.

---

## 8. Conversione

**Un solo intento, una sola etichetta: "Grande come?"**

| Dove | Parte con | Note |
|---|---|---|
| Isola d'ingresso | default o parametri URL | unico bottone dell'ingresso |
| Comandi fissi (alto a destra desktop, riga A mobile) | default + filtri attivi | nascosto quando l'ingresso è in vista |
| Scheda del lavoro | misura, zona, stile di quel lavoro | `aria-label` "Grande come? Parti da questo lavoro" |
| Testata della vista elenco | come i comandi fissi | |
| Isola Quanto costa | come i comandi fissi | è un link testuale, non un bottone rosso |
| URL `#grande-come` | parametri | per inserzioni |

**Conversione principale**: "Fissa la consulenza" (consulenza gratuita di 20
minuti). `track("demo_prenotazione", { concept: 12 })` solo al successo;
`track("apri_concept", { concept: 12 })` al montaggio. Nessun altro evento
(l'unione `TrackEvent` del sito è chiusa); le origini dell'apertura del
pannello **non** si tracciano.

**Conversioni alternative** (per chi non vuole prenotare dal sito): "Chiama" e
"Scrivi" nell'isola Dove e nel messaggio d'invio fallito; "Apri in Maps".

**Ganci che convertono** (in ordine di lettura):
1. la stima arriva **prima** del contatto: ore, sedute, prezzo, senza lasciare
   nulla;
2. "consulenza gratuita, 20 minuti" detto nell'h3 del posto;
3. tre campi soltanto, niente account, niente pagamento, la caparra si paga in
   studio (di esempio);
4. dopo il successo, la frase "la misura l'abbiamo già" chiude il dubbio.

**Attriti tolti**: taratura saltabile e fatta una volta sola; misura senza
trascinare; "Non lo so ancora"; errori che dicono cosa fare; bozza tenuta per
la visita.

**Per Luca**: il tatuatore che guarda il concept deve pensare "è il mio muro, e
risponde alla domanda che mi fanno tutti". Il colophon nell'isola Dove firma
"Un concept di CiceriLab".

---

## 9. Richieste ad altri agent

- **tech-architect**: periodo **20 × 15** (sez. 0 e 5); dati della mappa in un
  file tipizzato (proposta `data/periodo.ts`, esclusivo del builder `parete`);
  ConceptBackButton montato fuori dal contenitore che diventa `inert`;
  history/hash per gli strati; stati in session/localStorage con le chiavi di
  1; scelta automatica del piano B (`foto.length < 18`).
- **photo-editor**: per ogni foto: id, formato tra i cinque (5.3) con i numeri
  obiettivo, ritaglio già in quel formato, stile, zona, L × A in cm, "guarito
  da" in mesi, artista (Nives / Tobia), descrizione breve e completa (per
  `alt` e nome della tessera), autore e URL. Almeno una foto per stile tra le 8
  intorno all'ingresso.
- **copywriter**: versioni **brevi** di ogni isola per 375 (righe max 38
  caratteri) oltre a quelle piene per 1440 ed elenco; tutti i messaggi di 7.7 e
  7.11; parole della stima (7.9) incluse le forme "un'ora", "un'ora e mezza";
  confronti a parole della macchia ("grande come due monete"); avviso di 7.8.
- **brand-strategist / copywriter**: confermare giorni di Nives e Tobia, orari
  e prezzi di esempio (7.9, 7.10) o dirmi quali cambiare: le formule restano,
  cambiano le costanti.
- **motion-designer**: eventi di movimento = quelli della direzione + scivolata
  di 280 ms al fuoco da tastiera + riempimento del posto (450 ms) + popover e
  fogli (senza movimento in reduced motion).
- **interaction-designer**: soglia tocco 6 px, soglia chiusura scheda 96 px,
  frecce spaziali sulle tessere (7.3), `Home` = ingresso.
- **accessibility-auditor**: la sezione 7 è la checklist; in particolare
  fuoco mai sotto il ConceptBackButton nei dialoghi (2.2) e 7.8.
- **responsive-tester**: controlli obbligatori: bottone dell'ingresso sopra la
  riga B a 375 × 667; *Sottopelle* mai spezzato; riga A a 360 e a 320 (2.5);
  contenuto dell'ingresso dentro lo schermo a 375 anche se il fondo esce;
  barra desktop su una riga a 1280.

---

## 10. Sezioni da costruire

Una per section-builder, in kebab-case. Tutte leggono i testi solo da
`content/testi.ts`.

1. **`parete`**: la superficie. Mappa del periodo (5.2) e distribuzione delle
   foto (5.3, 5.4); strato DOM delle tessere (bottoni con descrizione, copie dei
   periodi vicini `aria-hidden`); modello del movimento (trascinamento, inerzia,
   rotella, frecce, frecce spaziali, `Home`, zona sicura, scivolata al fuoco);
   periodo corrente e ordine di tab (5.6); fallback DOM senza WebGL con
   `mask-image`; stato "foto non caricata"; arretramento dei filtri sulle
   tessere. Aggancia il canvas dello shader-engineer, non lo disegna.
2. **`ingresso`**: isola 1 (h1 *Sottopelle*, frase, bottone rosso) a 1440 e
   375 con il contenuto limitato allo schermo; primo disegno per il prerender;
   osservazione "ingresso in vista" che nasconde nome e bottone dei comandi
   fissi; il posto vuoto dopo la prenotazione (5.5).
3. **`isole`**: le altre sei isole (Solo guariti, Chi tatua con "Solo i suoi",
   Prima di venire, Quanto costa con il link al pannello, La cura, Dove con
   colophon e crediti) come componenti usati sia in parete (dimensioni in
   moduli, versione breve, "Continua nell'elenco" se non entra) sia in elenco
   (testo pieno).
4. **`comandi`**: tutto il fisso: link "Vai all'elenco", nome e bottone rosso in
   alto, ⌂ Torna all'ingresso, barra della parete a 1440 / 1024-1279 (popover) /
   768, righe A e B mobile con la regola sotto 360 px, foglio dei filtri,
   interruttore Parete/Elenco, contatore `aria-live`, riga "Nessun lavoro così";
   rispetto delle zone del ConceptBackButton.
5. **`scheda`**: dialogo del lavoro (`#lavoro-<id>`): FLIP dalla tessera,
   dati, frecce e swipe, ordine filtrato, foto 640 → 1600, ritorno del fuoco,
   bottone "Grande come?" precompilato.
6. **`elenco`**: vista elenco (`#elenco`): testata in flusso, filtri che filtrano
   davvero, lavori in due colonne sfalsate con didascalia sotto, le sei isole
   come sezioni h2, crediti delle foto, avviso dello schermo basso (7.8),
   ritorno alla parete nel punto lasciato.
7. **`banco`**: guscio del pannello "Grande come?" (`#grande-come`, dialogo,
   testata, Chiudi, due colonne desktop / colonna mobile), taratura con la
   carta (6.6), oggetti di confronto in scala 1:1, macchia con maniglia e campi
   − / +, limiti, fuori schermo tratteggiato, "Non lo so ancora", confronto a
   parole, macchia che si posa o resta morbida.
8. **`frase-e-posto`**: la frase da completare con popover e fogli (6.8), la
   stima (7.9) con `aria-live`, calendario dei 10 giorni e orari (7.10),
   contatto e validazione (7.11), invio simulato con tutti gli stati (7.7),
   successo con .ics, "Fissa un'altra consulenza", `track("demo_prenotazione")`,
   salvataggio di `stp-bozza` e `stp-posto`.
