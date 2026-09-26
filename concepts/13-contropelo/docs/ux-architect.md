# UX architect · Concept 13 · CONTROPELO, barberia (Pordenone)

Ondata 1. Rotta `/concept-13`. Base vincolante: `docs/creative-director.md`
(variante A, LA PARETE). Questo documento decide **struttura, percorsi, ordine
di lettura, misure della griglia, stati della prenotazione e accessibilità**.
Non decide colori esatti, easing o testi definitivi (art-director,
motion-designer, copywriter): i testi tra virgolette qui sotto sono segnaposto
di lunghezza e di tono, da sostituire.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, riga e paragrafo 13 di
`docs/matrice-concept-11-20.md` (più verifica incrociata e regole comuni),
`concepts/13-contropelo/docs/creative-director.md`,
`concepts/10-torchio/docs/ux-architect.md` (solo formato e livello),
`concepts/10-torchio/src/components/ConceptBackButton.tsx` (misure reali del
bottone "Torna in Ciceri Lab").

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, niente occhielli numerati, niente maiuscoletto spaziato, un solo
richiamo alla prenotazione con una sola etichetta: **"Scrivi il tuo nome"**.

### Tre correzioni alla direzione (motivate, da confermare con l'orchestratore)

1. **Il bottone "Torna in Ciceri Lab" su mobile non è largo 56 px.** Dal codice
   vero: fisso a `bottom: max(env(safe-area-inset-bottom), 14px)`,
   `left: 12px`, mono 10 px maiuscolo con spaziatura 0,17em, padding 10/14:
   circa **192 × 36 px**. La mensola mobile quindi non può essere una riga
   sola da 84 px con i barbieri che "partono dopo 56 px": diventa **due righe**
   (barbieri sopra, sotto la "nicchia" del bottone Lab a sinistra e il
   richiamo a destra). Vedi 2.3.
2. **Recapiti**: la direzione scrive "chiama lo 0434 ...". Le regole del
   copywriter (`ruoli-agent.md`) vietano numeri finti in vista: ovunque qui
   c'è un link "Chiama" (`tel:` di esempio) invece del numero scritto.
3. **Zoom 400% e telefoni in orizzontale**: "niente scroll di pagina" non può
   reggere sotto i 500 px di altezza (400% su 1280×800 = 320×200 px CSS). Esiste
   quindi una seconda disposizione, **"vetrina lunga"**, che scorre in verticale
   e spegne il vapore. Vedi 2.5. È l'unico caso in cui la pagina scorre.

---

## 1. Sitemap

Pagina unica senza scroll. Una rotta, una parete, tre specchi, due facce per
specchio, un pannello, un link di uscita.

```
/                                ← Ciceri Lab (uscita: ConceptBackButton condiviso)
└── /concept-13                  CONTROPELO (una schermata, 100dvh)
    ├── fascia alta              <header>: insegna (h1), "Informazioni", [interruttore vapore su S/M]
    ├── la parete                <main>: pista orizzontale con tre specchi
    │   ├── specchio "listino"   poltrona 1 · Mattia   tabpanel
    │   │   ├── faccia vetro     il listino a pennarello
    │   │   └── faccia lista     gli appuntamenti del giorno di Mattia (+ riga di scrittura)
    │   ├── specchio "barba"     poltrona 2 · Denis    tabpanel
    │   │   ├── faccia vetro     la rasatura, come si fa e quanto dura
    │   │   └── faccia lista     gli appuntamenti di Denis
    │   └── specchio "orari"     poltrona 3 · Samir    tabpanel
    │       ├── faccia vetro     orari, indirizzo, "Apri in Maps", "Chiama"
    │       └── faccia lista     gli appuntamenti di Samir
    ├── la mensola               <nav> tablist dei tre barbieri + richiamo + riga di stato (aria-live)
    └── pannello Informazioni    dialog sul vetro dello specchio attivo (crediti, nota, "Ricomincia da capo")
```

I nomi dei barbieri sono proposte della direzione (li fissa il copywriter);
**gli identificativi stabili usati nel codice e negli URL sono quelli del
contenuto del vetro**: `listino`, `barba`, `orari`.

### 1.1 Parametri di ingresso (per post e inserzioni di Luca)

Tutti facoltativi, letti una volta al montaggio (mai a livello di modulo), mai
riscritti nell'URL dal sito (niente `pushState`: il tasto indietro del browser
esce dalla pagina, come ci si aspetta da una pagina unica).

| Parametro | Valori | Effetto |
|---|---|---|
| `?specchio=` | `listino`, `barba`, `orari` | apre la parete su quello specchio, senza pan (posizione iniziale) |
| `?vista=lista` | | sulle larghezze a faccia singola apre la faccia "lista"; su desktop mette il fuoco visivo (nessun fuoco da tastiera) sulla lista pulendola dal vapore |
| `?pulito=1` | | specchi puliti e vapore fermo per questa visita (non salvato). Per screenshot, inserzioni e QA |
| `#lista` | | equivale a `?vista=lista` |
| `?demo=` | `pieno`, `preso`, `fallito` | **solo QA**, mai linkato: `pieno` = oggi tutti pieni su tutti e tre gli specchi; `preso` = il prossimo "Segna" trova il posto già preso; `fallito` = il prossimo "Segna" fallisce |

Esempio per un'inserzione sulla rasatura: `/concept-13?specchio=barba#lista`.

### 1.2 Stato che sopravvive al ricaricamento

`localStorage`, sempre in try/catch; se è bloccato vale per la sessione e il
sito non lo dice (nessun avviso).

| Chiave | Contenuto | Note |
|---|---|---|
| `ctp-pulito` | `"1"` o `"0"` | scelta esplicita dell'interruttore "Specchio pulito"; vince su tutto tranne `?pulito=1` |
| `ctp-prenotazione` | `{ specchio, data (AAAA-MM-GG), ora, servizio, nome }` | **mai il telefono**. Una sola prenotazione attiva. Se la data è passata viene cancellata in silenzio al montaggio |
| `ctp-bozza` | `{ nome }` | solo il nome, per non riscriverlo se si riapre una riga; mai il telefono |

In Informazioni c'è "Ricomincia da capo", che svuota le tre chiavi e ricarica
lo stato iniziale senza ricaricare la pagina.

---

## 2. Navigazione

### 2.1 Principio

Non c'è menu: **il menu sono gli specchi**. Si naviga come si gira la testa
sulla poltrona. Tre regole valgono a ogni larghezza:

1. si vede sempre **quale barbiere** hai davanti (tratto turchese sotto il nome
   sulla mensola + nome scritto in testa al vetro, per chi non guarda la
   mensola);
2. si arriva sempre alla lista con **un tocco** ("Scrivi il tuo nome");
3. si esce sempre verso Ciceri Lab dal bottone condiviso, che il concept non
   copre mai.

Modi per cambiare specchio (tutti equivalenti, nessuno obbligatorio):

| Modo | Dove | Note |
|---|---|---|
| Nome del barbiere (tab) | mensola | modo principale, 44 px di altezza minima |
| Frecce ← → | sulla tablist (pattern tabs con attivazione automatica) | Home/Fine vanno al primo/ultimo |
| Tocco o clic sul bordo di uno specchio vicino | parete, ai lati del vetro | scorciatoia visiva; area 24 px su mobile, 110 px su desktop |
| Trascinamento orizzontale | **solo sulla mensola** (mai sul vetro) | soglia 48 px o 0,35 px/ms; sul vetro un dito pulisce e basta |
| Link nel messaggio "pieno" | lista | porta a un altro specchio e a una riga precisa |

La parete non gira in tondo: dal primo specchio non si va a sinistra, e il
bordo sinistro del primo mostra solo parete (niente bordo di specchio). Stessa
cosa a destra del terzo. Così si capisce che gli specchi sono tre.

### 2.2 Desktop (L: ≥ 1024 px, disegnato a 1440 × 900)

```
0                                                                                           1440
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ConceptBackButton ~230×44]              ...            Informazioni   Contropelo  barberia, │ 56
│  nicchia vuota 0-260 px                                  Figtree 14    Limelight 28  Pordenone│
├──────┬──┬───────────────────────────────────────────────────────────────────┬──┬──────────┤
│bordo │  │                                                                   │  │  bordo   │
│spec. │pa│                    SPECCHIO ATTIVO 1220 × 756                     │pa│  spec.   │ 756
│vicino│re│         (vedi wireframe 5.x: vetro a sinistra, lista a destra)    │re│  vicino  │
│86 px │24│                                                                   │24│  86 px   │
├──────┴──┴───────────────────────────────────────────────────────────────────┴──┴──────────┤
│  Mattia   Denis   Samir        Passa il mouse sul vetro      ◐ Specchio pulito  [Scrivi il │ 88
│  ▔▔▔▔▔▔ (tratto turchese)       (sparisce al 1° gesto)                          tuo nome]  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Fascia alta** 56 px, parete. A sinistra la nicchia del bottone Lab
  (0-260 px) resta vuota a ogni stato. A destra, da destra verso sinistra:
  "barberia, Pordenone" (Figtree 14), insegna "Contropelo" (Limelight 28, è
  l'`h1`), "Informazioni" (Figtree 14, bottone testuale, 44 px di area).
  L'insegna non è un link: non c'è "home" da raggiungere.
- **Mensola** 88 px, parete, margini 110 px (allineati al vetro). A sinistra la
  tablist (tre nomi Limelight 20, spaziati 40 px, ognuno con area 44 × ≥ 88).
  Al centro l'indicazione del gesto (solo prima del primo gesto; poi al suo
  posto la **riga di stato**, vedi 7). A destra l'interruttore "Specchio
  pulito" (icona Phosphor + testo Figtree 15) e il bottone "Scrivi il tuo nome"
  (turchese, spigolo vivo, 48 px di altezza).
- La mensola non ha altro: niente social, niente telefono, niente "dal 19xx".

### 2.3 Mobile (S: < 640 px, disegnato a 375 × 667)

Il bottone Lab sta **in basso a sinistra** (≈ x 12-204, ≈ 36 px di altezza,
14 px dal fondo o sopra l'area sicura). La mensola gli costruisce attorno una
nicchia e non ci mette mai niente.

```
0                                     375
┌─────────────────────────────────────┐
│ Contropelo            ⓘ  ◐ pulito   │ 48   fascia alta: insegna a sinistra (Limelight 22),
├┬─┬─────────────────────────────┬─┬─┤      "Informazioni" (icona 44×44 con aria-label),
││ │                             │ │ │      interruttore vapore (icona + "Specchio pulito")
││ │                             │ │ │
││ │   SPECCHIO ATTIVO           │ │ │ 515  bordo vicino 12 px + parete 12 px per lato
││ │   327 × 515                 │ │ │      vetro x 24 → 351
││ │   una faccia alla volta:    │ │ │
││ │   vetro OPPURE lista        │ │ │
││ │                             │ │ │
├┴─┴─────────────────────────────┴─┴─┤
│  Mattia      Denis      Samir       │ 48   riga 1 della mensola: tablist a tutta larghezza
│  ▔▔▔▔▔                              │      (tre celle da 117 px)
├─────────────────────────┬───────────┤
│ [← TORNA IN CICERI LAB] │[Scrivi il │ 56   riga 2: nicchia Lab 0-212 px (vuota nel concept)
│  (bottone del sito)     │ tuo nome] │      + richiamo 216-363 px (147 px)
└─────────────────────────┴───────────┘      + env(safe-area-inset-bottom) sotto
```

- Altezze: fascia 48, mensola 48 + 56 (+ area sicura), specchio = il resto
  (515 px a 375 × 667; circa 400 px su un iPhone SE con le barre di Safari).
- Il richiamo "Scrivi il tuo nome" a 147 px sta su una riga a Figtree 600 15 px;
  **sotto i 380 px di larghezza va su due righe** ("Scrivi il / tuo nome",
  interlinea 1,15, bottone 48 px), mai troncato né abbreviato. A 320 px resta
  su due righe in 96 px.
- Sotto i 360 px l'interruttore in fascia mostra solo l'icona (con
  `aria-label="Specchio pulito"` e `aria-pressed`), il testo ricompare sopra.
- La **riga di stato** su mobile compare **sopra la mensola**, in Figtree 15
  (non a pennarello) su striscia di parete alta 40 px che si appoggia sul bordo
  basso del vetro (scende sul vetro, non sposta il layout), per 8 s o finché
  resta valida (successo e prenotazione esistente restano finché non si tocca
  altro).
- Il suggerimento "Passa il dito sul vetro" sta nella stessa striscia, solo
  all'apertura.

### 2.4 Tablet e finestre medie (M: 640-1023 px, disegnato a 768 × 1024)

- Bottone Lab in alto a sinistra (sopra i 640 px): la fascia alta (56 px)
  riserva 0-250 px come su desktop; a destra insegna, "Informazioni" e
  l'interruttore vapore (come su mobile, perché la mensola non ha posto).
- Mensola a una riga (88 px): tablist a sinistra, "Scrivi il tuo nome" a destra.
- Bordi vicini 32 px + parete 16 px per lato: vetro 672 × 880 a 768 × 1024.
- **Una faccia alla volta** (vetro o lista), come su mobile.

### 2.5 Le quattro disposizioni (regola unica per chi costruisce)

| Disposizione | Condizione | Facce | Vapore | Scroll |
|---|---|---|---|---|
| **S** | larghezza < 640 e altezza ≥ 500 | una alla volta | sì | no |
| **M** | 640 ≤ larghezza < 1024, altezza ≥ 500 | una alla volta | sì | no |
| **L** | larghezza ≥ 1024, altezza ≥ 500 | affiancate se il vetro è largo ≥ 960 px, altrimenti una alla volta | sì | no |
| **vetrina lunga** | altezza < 500 (telefono in orizzontale, zoom forte) **oppure** una faccia che trabocca dal suo riquadro (ResizeObserver: testo ingrandito dal browser, spaziatura testo forzata) | impilate: vetro, poi lista | **spento** (solo alone fermo sui bordi) | verticale, di pagina |

**Vetrina lunga** nel dettaglio:
- `html`/`body` tornano a scorrere; fascia alta e mensola non sono più fisse:
  fascia in cima, poi la tablist dei barbieri (a tutta larghezza, avvolgibile
  su due righe), poi lo specchio attivo con vetro e lista **uno sotto l'altro**
  e la lista del giorno **intera** (nessuna fascia oraria), poi "Scrivi il tuo
  nome" e la riga di stato.
- Il pan diventa un cambio in dissolvenza (200 ms); i bordi vicini spariscono.
- `scroll-padding-top: 64px` e `scroll-padding-bottom: 72px` e 72 px di spazio
  vuoto in fondo, perché il bottone Lab fisso non copra mai il fuoco né
  l'ultimo elemento.
- Rientro automatico nella disposizione normale se le condizioni cambiano
  (rotazione del telefono), mantenendo specchio, faccia e riga aperta.

### 2.6 Ordine nel DOM (= ordine di tabulazione)

1. link di salto "Vai alla lista di oggi" (nascosto finché non ha il fuoco,
   compare nella fascia alta a destra della nicchia Lab su L/M, in cima al
   vetro su S);
2. `ConceptBackButton` (montato qui, fisso: la posizione visiva la decide lui);
3. `<header>`: `h1` insegna, "Informazioni", interruttore vapore (su S/M);
4. `<nav aria-label="Le tre poltrone">` con la tablist;
5. `<main>`: i tre tabpanel; solo l'attivo è raggiungibile (gli altri `inert`,
   ma **non** `hidden`, perché i loro bordi si vedono);
6. azioni della mensola: interruttore vapore (su L), "Scrivi il tuo nome";
7. riga di stato (`role="status"`, fuori dal tab).

La tablist sta nel DOM **prima** dei pannelli anche se si vede sotto (pattern
tabs: dalla tab attiva, Tab entra nel pannello). Il salto visivo
basso → centro → basso è accettato e compensato dal link di salto e dal fatto
che "Scrivi il tuo nome" porta il fuoco dentro la lista.

La parete è una griglia CSS unica a cui appartengono fascia, pista e mensola:
l'interruttore vapore è **un solo elemento** che la griglia piazza in fascia
(S/M) o in mensola (L) con `grid-area`, senza duplicati nel DOM. Il suo posto
nel DOM resta il punto 6; su S/M questo fa sì che visivamente stia in alto ma
arrivi dopo la tablist nel giro del Tab: accettabile, ed è l'unica eccezione.

---

## 3. Arco emotivo (senza scroll: nel tempo e nei gesti)

Non ci sono sezioni che scorrono: l'arco è quello di dieci minuti sulla
poltrona. Il picco è **il tuo nome sottolineato sullo specchio**, non
l'apertura.

| Momento | Quando | Emozione | Cosa succede | Cosa porta avanti |
|---|---|---|---|---|
| Ti siedi | 0-0,5 s | **riconoscimento** | specchio già pulito: il salone vero alle spalle, il listino a pennarello con i prezzi. La risposta alla domanda principale ("quanto costa?") è sullo schermo prima di ogni effetto | niente da capire: puoi già leggere |
| Arriva l'asciugamano caldo | 0,5-2,9 s | **intimità, calore** | il vapore sale dal basso e copre il vetro, le scritte restano intuibili | curiosità: "cosa c'è dietro?" |
| La prima passata | 3,6-4,3 s | **complicità** | una passata sola, come col palmo, pulisce la riga del taglio | il gesto è insegnato senza parole; sulla mensola "Passa il dito sul vetro" |
| Pulisci | dal primo gesto | **piacere fisico** | dove passi il vetro si schiarisce, qualche goccia scende, il vapore torna piano | voglia di vedere tutto il vetro, poi gli altri specchi |
| Giri la testa | cambio specchio | **spazio** | la parete scorre: un altro barbiere, un'altra poltrona, un altro vapore (con la sua memoria) | si capisce che è un salone vero con tre posti |
| Guardi la lista | faccia lista | **fiducia** | nomi veri di clienti ("Luca B."), mezz'ore fisse, buchi turchesi: è pieno ma c'è posto | "c'è posto per me alle 16:30" |
| Scrivi il tuo nome | riga di scrittura | **appartenenza** | quello che digiti è già nella calligrafia del barbiere | niente passi, niente numeri: un nome e un telefono |
| Il barbiere lo sottolinea | successo | **sollievo, picco** | il tuo nome resta nella lista e viene sottolineato in turchese | la riga di stato dice quando, con chi, e come disdire |
| Torni | visita successiva | **essere un cliente** | il tuo nome è ancora lì, e il vapore non lo copre | "cancella" se non puoi venire |

Regole di ritmo:
- Nulla si muove da solo dopo l'apertura, tranne il vapore che torna (14-18 s
  per zona) e le gocce. Nessun invito lampeggiante, nessun richiamo animato.
- Chi ha fretta salta l'arco: "Scrivi il tuo nome" è visibile dal primo
  fotogramma e porta alla lista con un tocco.
- Con riduzione del movimento l'arco si accorcia a: riconoscimento → lista →
  nome sottolineato (compare, non si traccia).

---

## 4. Tre user journey (dall'arrivo alla prenotazione)

Il visitatore vero del Lab è un **barbiere** che arriva da cicerilab.com e si
immedesima nei suoi clienti. Ogni storia chiude con cosa vede lui.

### 4.1 Enrico, 54 anni, geometra (mobile, da un post Facebook)

**Contesto**: pausa pranzo, Android 360 × 740 in Chrome, pollice destro. Vuole
tagliarsi i capelli sabato mattina e sa che il sabato "è sempre pieno".
Arriva da `/concept-13` senza parametri. È martedì.

1. **Apertura**: specchio di Mattia pulito, listino leggibile: "taglio 22".
   Il vapore sale; la passata automatica ripulisce la riga del taglio. Legge il
   prezzo senza toccare nulla.
2. Passa il pollice sul vetro per curiosità: il salone compare, una goccia
   scende. Il suggerimento sparisce.
3. Tocca **"Scrivi il tuo nome"** (in basso a destra, sotto il pollice): la
   faccia del vetro viene "ripassata con lo straccio" e compare la lista di
   Mattia, **oggi**, fascia oraria in corso (sono le 13:10: pausa, quindi si
   apre la fascia "14:30"). Il fuoco va sul primo trattino turchese.
4. Tocca "domani →" quattro volte (mercoledì, giovedì, venerdì, sabato): ogni
   volta la lista si riscrive riga per riga. Sabato: la fascia "8:00" ha un
   solo buco alle 9:30.
5. Tocca il trattino delle 9:30. Si apre la riga di scrittura: le righe lontane
   si raccolgono, restano visibili "9:00 Paolo G." sopra e "10:00 Ivan R.".
6. Tocca "taglio" (il prezzo 22 € compare accanto). Tocca "Il tuo nome": si apre
   la tastiera, la riga di scrittura sale in cima al vetro. Scrive "Enrico" e
   lo vede già in calligrafia. Nel telefono scrive "347 12" e preme "Segna".
7. **Errore**: sotto il telefono, icona e testo "Il numero non torna: controlla
   le cifre." Il fuoco va sul campo. Completa il numero, "Segna".
8. **Invio**: il nome si scrive da sinistra a destra (600 ms). **Successo**:
   tratto turchese sotto "Enrico"; riga di stato: "Segnato: sabato 3 alle 9:30
   con Mattia. Se non puoi venire, Chiama." Chiude il telefono.
9. Giovedì riapre il link: lo specchio di Mattia è aperto sulla lista di
   sabato con "Enrico" sottolineato, pulito dal vapore.

**Attriti da evitare**: tastiera che copre "Segna" (la riga sale col
`visualViewport`); pollice che pulisce e intanto cambia specchio (sul vetro
il dito pulisce e basta); un trascinamento partito su un trattino che apre la
riga per sbaglio (un trascinamento oltre 8 px non è un tocco).
**Il barbiere vede**: le prenotazioni del sabato arrivano con nome e telefono
senza che lui risponda al telefono con le mani nella schiuma.

### 4.2 Karim, 29 anni, impiegato (desktop 1440, da Google "rasatura panno caldo Pordenone")

**Contesto**: ufficio, mouse, poco tempo. L'annuncio lo porta a
`/concept-13?specchio=barba`.

1. **Apertura** direttamente sullo specchio di Denis (nessun pan). Il vetro
   dice come funziona la rasatura: panno caldo, pennello, lama, contropelo,
   dopobarba, 30 minuti. Sulla destra, la lista di oggi di Denis.
2. Muove il mouse sul vetro mentre legge: pulisce passando, tiene premuto e
   pulisce col "palmo" una zona larga sulla lista.
3. Clicca il bordo dello specchio di sinistra: la parete scorre (650 ms) su
   Mattia, legge "taglio e barba 34". Torna su Denis con il tab "Denis" nella
   mensola: il vapore di Denis è tornato in parte (memoria dello specchio).
4. Nella lista di Denis clicca il trattino delle 12:00 e sceglie **"taglio e
   barba"**: la riga sotto è "12:30-14:30 pranzo". **Errore immediato**, sotto le
   parole del servizio: "Qui c'è solo mezz'ora: taglio o barba. Per taglio e
   barba ci sono le 16:00." Clicca "le 16:00": la riga si sposta alle 16:00, il
   servizio resta scelto, la riga delle 16:30 si segna con un tratto
   tratteggiato.
5. Scrive nome e telefono, preme Invio nel campo telefono (equivale a "Segna").
6. **Posto preso nel frattempo** (capita di rado): "Qualcuno ha scritto prima
   di te alle 16:00. Le 17:00 sono libere." con link. Clicca: riga alle 17:00,
   campi già compilati, "Segna". Successo, sottolineatura.

**Attriti da evitare**: dover scoprire il gesto per leggere il prezzo (il
listino è leggibile anche a vapore pieno, e l'interruttore è sempre lì);
perdere i dati scritti dopo un errore (i campi non si svuotano mai da soli);
errori che dicono "non va" senza proporre l'orario giusto.
**Il barbiere vede**: i servizi da un'ora non finiscono in un buco da mezz'ora
e non deve richiamare nessuno per spostarlo.

### 4.3 Marco, 41 anni, non vedente (desktop, NVDA + Firefox, tastiera)

**Contesto**: vuole portare il figlio Tommaso (9 anni) da Samir, che gli
hanno consigliato. Riduzione del movimento attiva nel sistema.

1. **Apertura**: nessun vapore (riduzione del movimento), nessuna passata. NVDA
   legge il titolo della pagina e l'`h1` "Contropelo". Primo Tab: "Vai alla
   lista di oggi". Secondo Tab: "Torna in Ciceri Lab". Poi "Informazioni",
   poi la tablist: "Mattia, scheda selezionata, 1 di 3".
2. Freccia destra due volte: "Samir, scheda, 3 di 3". La parete cambia in
   dissolvenza (200 ms). Tab: entra nel pannello; con i comandi di lettura
   ascolta: "Samir, poltrona 3" (h2), "Dove e quando" (h3), orari, indirizzo,
   "Apri in Maps, link", "Chiama, link", poi "Martedì 29 settembre" (h3 della
   lista, con `<time>`), "Mattina" / "Pomeriggio" (bottoni di fascia con
   `aria-pressed`), elenco ordinato di 9 elementi.
3. Nell'elenco, Tab va solo sui posti liberi: "Ore 15:00, libero, scrivi il
   tuo nome, pulsante". Frecce su e giù saltano da un posto libero all'altro.
   Invio.
4. Riga di scrittura: il fuoco va sul gruppo "Cosa ti facciamo?" (radio): taglio,
   barba, taglio e barba, rasatura. Sceglie "taglio" (la riga dice "22 euro": il
   prezzo bambini, 15, è nel listino e si applica in bottega; la riga di
   scrittura non ha una quinta voce). Tab: "Il tuo nome, modifica". Scrive "Tommaso". Tab: telefono.
   Tab: "Segna, pulsante". Invio con il telefono vuoto.
5. **Errore annunciato**: "Telefono, non valido, Lasciaci un numero: se il
   barbiere ha un imprevisto ti chiama." Il fuoco torna sul campo telefono.
   Scrive, Invio.
6. **Successo annunciato** dalla riga di stato: "Segnato: martedì 29 alle 15:00
   con Samir. Se non puoi venire, chiama." Il fuoco resta sul nome appena
   scritto nella lista, che ora è un elemento con "Tommaso, tuo, ore 15:00" e
   accanto il bottone "Cancella".

**Attriti da evitare**: canvas letto dal lettore di schermo (è `aria-hidden`);
trenta Tab per arrivare alla lista (link di salto e Tab che salta gli
occupati); errori solo in colore; fuoco perso dopo l'invio.
**Il barbiere vede**: il sito funziona per tutti, anche per chi non vedrà mai
il vapore.

---

## 5. Wireframe testuali per schermata

Convenzioni:
- **1440 × 900** (L): vetro 1220 × 756 (x 110-1330, y 56-812), padding interno
  56 px. Faccia **vetro** su x 6-56% del vetro, faccia **lista** su x 62-94%
  (≈ 390 px), in alto a destra. Rotazioni delle scritte: vetro -1,5°, lista
  +0,8° (l'art-director le regola; mai oltre ±2°, mai sui campi della riga di
  scrittura, che stanno dritti).
- **375 × 667** (S): vetro 327 × 515 (x 24-351, y 48-563), padding 20 px,
  area utile 287 px. Una faccia alla volta.
- ◆ = interattivo. ░ = vapore (canvas, `aria-hidden`). ▣ = riflesso (foto
  specchiata, `alt=""` perché decorativa: il salone è descritto nel testo del
  pannello Informazioni). Tutto il resto è DOM.
- Testo a pennarello (Mansalva): 26-34 px su L, minimo 22 px su S.
- Ogni pannello: `h2` = nome del barbiere + "poltrona N"; `h3` per il titolo
  del vetro e per il giorno della lista.

### 5.1 Apertura (qualsiasi specchio, di solito "listino")

**1440**
```
t = 0 ms       vetro pulito: ▣ salone + listino e lista leggibili. Nessun preloader.
t = 500 ms     ░ sale dal basso, copre tutto in 2400 ms (più fitto in basso: 0,9 → 0,78 in alto).
t = 3600 ms    una passata diagonale automatica (700 ms) pulisce la riga "taglio ...... 22".
mensola        centro: "Passa il mouse sul vetro" (Figtree 14) fino al primo gesto.
```
**375**: stessa sequenza; la passata attraversa la riga del taglio da sinistra
a destra; il suggerimento "Passa il dito sul vetro" sta nella striscia sopra la
mensola.

Regole: il vetro riceve gesti anche durante la salita del vapore: se
l'utente pulisce prima dei 2,9 s, la salita continua altrove ma
non ricopre dove ha pulito, e la passata automatica viene annullata. Se c'è
`ctp-pulito = "1"`, `?pulito=1` o riduzione del movimento: nessuna fase.

### 5.2 Specchio "listino" (poltrona 1, Mattia)

**1440**
```
┌───────────────────────────────── vetro 1220 × 756 ─────────────────────────────────┐
│ ▣ salone dalla prima poltrona (specchiato, velato)                    ░░░░░░░░░░░░░ │
│                                                                                     │
│   h2 visivamente: "Mattia" (Mansalva 34, in alto a sx,        h3 "Oggi, martedì 29" │
│      è anche l'h2 "Mattia, poltrona 1")                       ◆ mattina ◆ pomeriggio│
│                                                                                     │
│   h3 "Il listino"                                             8:30  Luca B.         │
│   taglio .............................. 22                    9:00  ◆ ▬ (turchese)  │
│   taglio e barba ....................... 34                   9:30  Enrico P.       │
│   barba ................................ 16                   10:00 Gianni T.       │
│   rasatura a panno caldo ............... 20                   10:30 ◆ ▬             │
│   bambini fino a 12 anni ............... 15                   11:00 Marco Z.        │
│   macchinetta, un'altezza .............. 15                   11:30 ◆ ▬             │
│      (prezzi allineati a destra sul bordo della colonna)       12:00 Stefano D.      │
│                                                                                     │
│   riga piccola (Mansalva 24): "Mattia taglia dal 2009,        ◆ ← oggi   ◆ domani →  │
│   le sfumature sono sue"                                                            │
│                                                                 ░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```
- Le "puntinature" tra voce e prezzo sono solo spazio (niente puntini veri: il
  barbiere allinea i prezzi, non traccia linee). Struttura: `<dl>` con voce
  (`dt`) e prezzo (`dd`, "22 euro" per il lettore di schermo tramite testo
  nascosto dopo il numero).
- Lista: 2 fasce (mattina/pomeriggio) a 1440 × 900; l'intera giornata se il
  vetro è alto abbastanza (vedi 6.1).

**375 · faccia vetro**
```
┌──────────── 327 × 515 ────────────┐
│ ▣ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  Mattia            (Mansalva 28)  │
│  Il listino        (Mansalva 22)  │
│                                   │
│  taglio                      22   │  righe da 40 px, testo 24 px
│  taglio e barba              34   │  voci ≤ 22 caratteri (al copywriter)
│  barba                       16   │
│  rasatura a panno caldo      20   │
│  bambini fino a 12 anni      15   │
│  macchinetta, un'altezza     15   │
│                                   │
│  Mattia taglia dal 2009,          │
│  le sfumature sono sue            │
│                                   │
│                    ◆ la lista →   │  44 px, in basso a destra (sopra al pollice)
└───────────────────────────────────┘
```

**375 · faccia lista** (4 fasce, vedi 6.1)
```
┌───────────────────────────────────┐
│  Mattia                           │  28 px, il barbiere resta scritto in testa
│  Oggi, martedì 29                 │  h3, 44 px
│  ◆8:30  ◆10:30  ◆14:30  ◆17:00    │  fasce, 44 px, quella attiva sottolineata turchese
│  8:30   Luca B.                   │
│  9:00   ◆ ▬                       │  5 righe da 44 px al massimo
│  9:30   Enrico P.                 │
│  10:00  Gianni T.                 │
│                                   │
│  ◆ ← il listino      ◆ domani →   │  44 px
└───────────────────────────────────┘
```
"← il listino" torna alla faccia vetro (l'etichetta usa il titolo del vetro di
quello specchio: "← il listino", "← la barba", "← dove e quando").

### 5.3 Specchio "barba" (poltrona 2, Denis)

**1440**: stessa impaginazione di 5.2. Vetro: `h3` "La barba", poi quattro-
cinque righe brevi con i tempi (es. "panno caldo, 3 minuti", "pennello e
sapone", "lama, a favore e poi contropelo", "dopobarba e panno freddo", "in
tutto mezz'ora, 20 euro"). Sotto, riga su Denis. ▣ = rasatura in corso.
Lista di Denis a destra.

**375**: faccia vetro con le stesse righe (una per riga, a capo morbido ammesso
solo sulle righe descrittive, mai sui prezzi); "la lista →" in basso a destra.

### 5.4 Specchio "orari" (poltrona 3, Samir)

**1440**
```
│   Samir                                                       h3 "Oggi, martedì 29"│
│   h3 "Dove e quando"                                          ...lista di Samir... │
│   martedì a venerdì   8:30-12:30   14:30-19                                         │
│   sabato              8-17, senza pausa                                             │
│   domenica e lunedì   chiuso                                                        │
│                                                                                     │
│   via <indirizzo di esempio>, Pordenone                                             │
│   ◆ Apri in Maps ↗   ◆ Chiama                                                       │
│   riga su Samir                                                                     │
```
- Orari in `<dl>`; indirizzo in `<address>`. "Apri in Maps" apre la mappa vera
  in una nuova scheda (`target="_blank"`, `rel="noopener"`, testo nascosto
  "si apre in una nuova scheda"). "Chiama" è `tel:` di esempio. Sono gli unici
  link esterni del vetro: ricevono il fuoco e il vapore si pulisce attorno.
- Il sabato con pausa sfalsata: nella lista del sabato ogni barbiere ha la sua
  riga "pranzo" a un'ora diversa (Mattia 12:30, Denis 13:00, Samir 13:30): la
  bottega non chiude mai, ed è un dettaglio vero.

**375**: stesso contenuto in colonna; "Apri in Maps" e "Chiama" come due righe
da 44 px; "la lista →" in basso a destra.

### 5.5 Riga di scrittura aperta (dentro la lista, qualsiasi specchio)

Quando si apre, la lista **raccoglie** le righe lontane: restano il titolo del
giorno, la riga sopra, la riga di scrittura, la riga (o le due righe, se
servizio da un'ora) sotto. Le righe raccolte non sono cancellate: tornano
quando la riga si chiude. Su L, se c'è spazio, restano due righe sopra e due
sotto. La zona della lista è **protetta dal vapore** finché la riga è aperta.

**1440** (nella colonna lista, ≈ 390 px)
```
│  Oggi, martedì 29                                      │
│  15:30  Diego F.                                       │
│  16:00  ┌ riga di scrittura (dritta, niente rotazione) ┐│
│         │ "Cosa ti facciamo?" (Figtree 15, legend)     ││
│         │ ◆taglio ◆barba ◆taglio e barba ◆rasatura     ││  parole Mansalva 24, 44 px, a capo libero
│         │           → accanto al scelto: "34 €"        ││
│         │ "Il tuo nome" (Figtree 15, label)            ││
│         │ ◆ ______________________ (Mansalva 30 dentro)││  linea di base a pennarello 2 px
│         │ "Telefono" (Figtree 15, label)               ││
│         │ ◆ ______________________ (Mansalva 30 dentro)││  inputmode="tel", autocomplete="tel"
│         │ (errori qui sotto il campo, Figtree 15 + icona)││
│         │ ◆ [ Segna ]            ◆ lascia stare        ││  Segna turchese 48 px; "lascia stare" testo
│         └──────────────────────────────────────────────┘│
│  16:30  ┄┄┄┄┄┄┄┄ (tratteggio se "taglio e barba")      │
│  17:00  Nicola S.                                      │
```

**375** (la riga di scrittura prende tutta la faccia lista)
```
┌───────────────────────────────────┐
│  Oggi, martedì 29 · 16:00         │  il titolo dice anche l'ora scelta
│  15:30  Diego F.                  │
│  ┌─────────────────────────────┐  │
│  │ Cosa ti facciamo?           │  │
│  │ ◆taglio     ◆barba          │  │  2 × 2, celle 44 px
│  │ ◆taglio e barba ◆rasatura   │  │
│  │ Il tuo nome                 │  │
│  │ ◆ ________________________  │  │  campo 48 px
│  │ Telefono                    │  │
│  │ ◆ ________________________  │  │
│  │ ◆[ Segna ]   ◆ lascia stare │  │
│  └─────────────────────────────┘  │
│  16:30  ┄┄┄┄┄┄                    │
└───────────────────────────────────┘
```
**Tastiera virtuale aperta** (S e M): quando `visualViewport.height` scende di
oltre 150 px, la faccia lista trasla in su finché il bordo alto della riga di
scrittura sta 8 px sotto il bordo alto della parte visibile; il campo col
fuoco e "Segna" devono stare sopra la tastiera (se non ci stanno entrambi,
le parole del servizio si riducono a quella scelta, con "cambia"). Il vapore è
fermo. Fascia alta e mensola restano dove sono (sotto la tastiera o fuori
vista), nessuno spostamento di layout.

### 5.6 Successo e prenotazione esistente

**1440** (lista)
```
│  16:00  Karim                 ◆ cancella   │  il nome in Mansalva come gli altri
│         ▔▔▔▔▔▔▔ tratto turchese 3 px       │  (SVG, si traccia in 400 ms)
│  16:30  Karim  (seconda mezz'ora, se 1 h)  │  scritto più piccolo, senza "cancella"
```
Mensola, riga di stato: "Segnato: martedì 29 alle 16:00 con Denis. Taglio e
barba, 34 €. Se non puoi venire, ◆ Chiama." Resta finché l'utente non fa
altro sulla mensola o apre un'altra riga.

**375**: identico nella lista; riga di stato nella striscia sopra la mensola,
su due righe se serve.

### 5.7 Giorno chiuso, giorno pieno, giornata finita

```
CHIUSO (domenica, lunedì)            PIENO (tutti i buchi presi)
│  Lunedì 5                     │    │  Oggi, sabato 3               │
│                               │    │  (righe tutte con nomi)       │
│   chiuso    (Mansalva 64)     │    │                               │
│                               │    │  Oggi siamo pieni.            │
│  ◆ ← sabato   ◆ martedì →     │    │  ◆ Da Denis martedì alle 9:30 │
                                      │    c'è posto                   │
GIORNATA FINITA (oggi, dopo l'ultima mezz'ora)
│  Per oggi abbiamo finito.     │   la lista si apre direttamente sul
│  ◆ domani →                   │   giorno aperto successivo; "← oggi"
                                     mostra questa riga
```
- **Pieno**: il link cerca il primo posto libero **sui tre specchi**, dal
  giorno visualizzato in avanti, preferendo lo stesso barbiere a parità di
  giorno. Attivarlo: pan (o dissolvenza) verso quello specchio, faccia lista,
  giorno giusto, fascia giusta, fuoco sul trattino di quella riga (la riga di
  scrittura **non** si apre da sola).
- Le mezz'ore già passate di oggi: ora dimessa (opacità 0,5), nessun nome né
  trattino, non raggiungibili; per il lettore di schermo "Ore 9:00, passata".
  Un posto è prenotabile solo se inizia almeno 30 minuti dopo l'ora attuale.

### 5.8 Pannello Informazioni

**1440**: si apre sul vetro dello specchio attivo, in alto a sinistra sopra la
faccia vetro (larghezza 560 px), a pennarello per i titoli e **Figtree** per i
testi lunghi (crediti, nota): è testo di servizio, non scritto a mano. Il
vapore sotto il pannello è pulito e fermo.
```
│  h2 "Informazioni"                            ◆ chiudi (44×44) │
│  "Contropelo non esiste: è un concept di Ciceri Lab..."        │
│  Foto: autore, Unsplash (link) × 3                              │
│  Font: Limelight, Mansalva, Figtree                             │
│  ◆ Ricomincia da capo   (svuota prenotazione e scelte)          │
```
**375**: occupa tutto il vetro (327 × 515), con scroll interno se serve (è
l'unica eccezione al "niente scroll interno": è testo di servizio).

### 5.9 Vetrina lunga (altezza < 500 o zoom 400%)

**320 × 200 CSS (1280 × 800 al 400%)**
```
Contropelo                ⓘ ◐      ← fascia, non fissa
◆Mattia ◆Denis ◆Samir               ← tablist, può andare a capo
Mattia · Il listino                 ← vetro, senza vapore, testo 22 px
taglio               22
...
Oggi, martedì 29                    ← lista intera, nessuna fascia oraria
8:30  Luca B.
9:00  ◆ ▬
...
◆ domani →
◆[ Scrivi il tuo nome ]
(72 px vuoti: il bottone Lab non copre l'ultimo elemento)
```
Tutto su una colonna, nessuno scroll orizzontale a 320 px, nessun testo
tagliato. Il riflesso resta come fondo fisso del vetro (velatura più forte,
80%).

---

## 6. La prenotazione: "La lista sullo specchio"

### 6.1 La lista e le sue fasce

- Le mezz'ore: martedì-venerdì 8:30-12:00 (8 righe) e 14:30-18:30 (9 righe),
  con la riga "12:30-14:30 pranzo" in mezzo; sabato 8:00-16:30 (18 righe) con
  la riga "pranzo" di mezz'ora sfalsata per barbiere (vedi 5.4); domenica e
  lunedì "chiuso". (Orari di esempio della direzione; il copywriter può
  cambiarli, le regole restano.)
- Altezza di riga: **44 px** con puntatore grosso (`pointer: coarse`),
  **40 px** con mouse.
- **Fasce**: la lista mostra la giornata intera se ci sta; altrimenti due
  fasce ("mattina", "pomeriggio"; sabato divisa a metà: 8:00-12:00 e
  12:30-16:30); altrimenti quattro fasce di al massimo 5 righe, nominate con
  l'ora d'inizio ("8:30", "10:30", "14:30", "17:00"). Il calcolo è uno solo:

  ```
  disponibile = altezza faccia lista - testata (titolo + riga fasce) - piede (← / domani →)
  1 fascia  se  righe_giornata × altezza_riga ≤ disponibile
  2 fasce   se  9 × altezza_riga ≤ disponibile
  4 fasce   altrimenti
  ```
  A 375 × 667 risultano 4 fasce; a 1440 × 900, 2 fasce; a 2560 × 1440, la
  giornata intera. La fascia iniziale è quella che contiene l'ora attuale (o
  la prima con un posto libero, se quella è piena).
- Le fasce sono bottoni con `aria-pressed` (non tab: non c'è un pannello
  diverso, è la stessa lista filtrata). Cambiare fascia: la lista si ripassa
  con lo straccio (dissolvenza 400 ms, 200 ms in riduzione del movimento).
- **Giorni**: "← oggi"/"← giorno prima" e "domani →"/"giorno dopo →" (etichette
  del copywriter con il nome del giorno quando non è domani: "sabato →").
  Avanti fino a **6 giorni lavorativi**; oltre, "giorno dopo →" sparisce e al
  suo posto c'è "Più in là? ◆ Chiama". "←" sparisce sul giorno di oggi.
- **Dati di esempio**, generati in modo deterministico da data + specchio
  (stessa giornata = stessa lista), nel `useEffect` di montaggio:
  - 55-65% di mezz'ore occupate da nomi di esempio (nome + iniziale, lista di
    almeno 40 nomi friulani e non: "Luca B.", "Ivan R.", "Karim A.",
    "Gianni T.", "Oleksandr M.", "Paolo G."...);
  - per ogni specchio e giorno: **almeno un buco da un'ora** (due mezz'ore
    libere consecutive) e **almeno un buco isolato** da mezz'ora, così gli
    stati "ok da un'ora" ed "errore mezz'ora" sono sempre raggiungibili;
  - il sabato più pieno (75-85%);
  - "oggi" ha sempre almeno un posto libero dopo l'ora attuale, su almeno
    uno dei tre specchi, salvo `?demo=pieno` o giornata finita.
- La prenotazione salvata (se c'è) si sovrappone al generato: quella riga è
  tua, e le sue mezz'ore non sono mai "prese" dal generatore.

### 6.2 La riga di scrittura

| Elemento | Tipo | Regole |
|---|---|---|
| "Cosa ti facciamo?" | `fieldset` + `legend`, 4 radio vere rese come parole a pennarello | taglio (30'), barba (30'), taglio e barba (60'), rasatura (30'). **Nessuna preselezione.** Accanto alla parola scelta il prezzo ("22 €"), per il lettore di schermo nella label ("taglio, 22 euro") |
| "Il tuo nome" | `input type="text"`, `autocomplete="given-name"`, `maxlength="24"` | il testo è in Mansalva mentre scrivi. Precompilato da `ctp-bozza` se c'è |
| "Telefono" | `input type="tel"`, `inputmode="tel"`, `autocomplete="tel"` | obbligatorio (serve per avvisare). Valido: 9-13 cifre dopo aver tolto spazi, punti, trattini e un eventuale "+39"/"0039"; deve iniziare con 3 (cellulare) o 0 (fisso) |
| "Segna" | `button type="submit"` | turchese, 48 px. Invio da qualsiasi campo = "Segna" |
| "lascia stare" | `button type="button"` | chiude la riga, ridà il trattino, riporta il fuoco sul trattino. Anche Esc |

Validazione: **all'invio** e poi, per il campo già in errore, a ogni modifica
(l'errore sparisce appena il valore diventa valido). Nessun errore mentre si
scrive la prima volta. Il fuoco va al **primo** campo in errore.

### 6.3 Tutti gli stati

| # | Stato | Cosa si vede | Cosa sente il lettore di schermo | Uscite |
|---|---|---|---|---|
| L0 | **Prerender / prima del montaggio** | faccia lista con titolo "La lista del giorno" e l'area riservata alla sua altezza finale (nessun CLS); nessuna riga | niente di rilevante (la lista arriva al montaggio, in pochi ms) | montaggio → L1 senza animazione |
| L1 | **A riposo** | nomi, trattini turchesi, ore passate dimesse; mensola "Scrivi il tuo nome" | titolo del giorno, "elenco, N elementi"; righe "Ore 9:00, occupato", "Ore 9:30, libero, scrivi il tuo nome" | tocco su trattino → L5; fasce; giorni |
| L2 | **Cambio giorno o fascia** | straccio: la lista svanisce (400 ms) e si riscrive riga per riga (60 ms per riga) | la riga di stato annuncia "Mercoledì 30, mattina: 4 posti liberi" | → L1 / L3 / L4 |
| L3 | **Giorno chiuso** | "chiuso" grande, "martedì →" | "Lunedì 5, chiuso" | → giorno aperto |
| L4 | **Giorno pieno** | righe tutte piene + "Oggi siamo pieni. Da Denis martedì alle 9:30 c'è posto" (link) | stesso testo; il link dice anche "vai alla lista di Denis" | link → altro specchio, fuoco sul trattino |
| L4b | **Giornata finita** | "Per oggi abbiamo finito." + "domani →"; all'apertura la lista parte già dal giorno aperto successivo | idem | → giorno dopo |
| L5 | **Riga aperta, vuota** | riga di scrittura al posto del trattino; righe lontane raccolte; lista protetta dal vapore | fuoco sul primo radio: "Cosa ti facciamo?, gruppo, taglio, 22 euro, pulsante di opzione, non selezionato, 1 di 4" | scelta → L6; Esc/"lascia stare" → L1 col fuoco sul trattino |
| L6 | **Servizio scelto** | prezzo accanto; se 60': tratteggio sulla riga sotto | selezionato | nome, telefono |
| L6e | **Errore mezz'ora** (60' su un buco da 30') | sotto le parole del servizio, icona + "Qui c'è solo mezz'ora: taglio o barba. Per taglio e barba ci sono le 16:00." con "le 16:00" link. Se nessun buco da un'ora nel giorno: "...Per taglio e barba ◆ guarda domani" | annunciato subito (`aria-live="polite"` del gruppo), il radio resta scelto | link → la riga si sposta all'ora giusta con i campi intatti; oppure scegliere un servizio da 30' fa sparire l'errore |
| L7 | **Scrittura** | nome in Mansalva mentre digiti | normale campo di testo | "Segna" |
| L8 | **Errori di campo** | sotto il campo, icona di avviso Phosphor + testo Figtree 15 pennarello; linea di base del campo più spessa (3 px) e tratteggiata; **mai solo colore** | `aria-invalid="true"`, `aria-describedby` sul testo; fuoco al primo campo in errore; il testo è letto con il fuoco | correzione → l'errore sparisce |
|  | nessun servizio | "Scegli cosa ti facciamo: taglio, barba, taglio e barba o rasatura." | | |
|  | nome vuoto | "Scrivi un nome, anche solo quello: il barbiere deve sapere chi chiamare." | | |
|  | telefono vuoto | "Lasciaci un numero: se il barbiere ha un imprevisto ti chiama." | | |
|  | telefono non valido | "Il numero non torna: controlla le cifre." | | |
| L9 | **Invio in corso** (600 ms simulati) | il nome si "scrive" nella riga da sinistra a destra; campi e "Segna" in sola lettura (`aria-disabled`, non `disabled`, per non perdere il fuoco) | riga di stato: "Sto segnando..." | → L10 / L11 / L12 |
| L10 | **Successo** | la riga di scrittura si chiude; il nome resta nella lista in Mansalva, sottolineato in turchese (400 ms); "cancella" accanto; riga di stato con giorno, ora, barbiere, servizio, prezzo e "Chiama" | riga di stato letta per intero; il fuoco va sulla riga del tuo nome (elemento `tabindex="-1"` con testo "Ore 16:00, Karim, il tuo appuntamento") | `track("demo_prenotazione", ...)` una volta; → L13 |
| L11 | **Posto preso nel frattempo** | la riga resta aperta, campi intatti; al posto del trattino un nome nuovo compare scritto; sotto: "Qualcuno ha scritto prima di te alle 16:00. Le 17:00 sono libere." (link alla prossima ora compatibile col servizio) | annunciato (`role="alert"`) | link → riga spostata con campi intatti → "Segna" |
| L12 | **Invio fallito** (offline o `?demo=fallito`) | il nome resta scritto ma sbiadito (0,45); sotto: "Non è arrivato. ◆ Riprova, oppure ◆ Chiama." | `role="alert"`; fuoco su "Riprova" | Riprova → L9 |
| L13 | **Prenotazione esistente** (dopo il successo o al ritorno) | nome sottolineato nella lista di quel giorno, **mai coperto dal vapore**; aprendo il sito senza parametri, la parete parte su quello specchio e quella lista; "Scrivi il tuo nome" porta alla tua riga e la riga di stato dice "Sei già segnato: sabato 3 alle 9:30 con Mattia. Per cambiare, cancella e riscrivi." | idem | "cancella" → L14 |
| L14 | **Cancellato** | passata di straccio sul nome (400 ms), torna il trattino turchese; riga di stato "Cancellato. ◆ Rimettilo" per 10 s | "Cancellato", fuoco sul trattino tornato libero | "Rimettilo" (se nel frattempo la riga è ancora libera) → L13 |
| L15 | **Una sola prenotazione alla volta** | se hai già un nome segnato e apri un altro trattino: la riga si apre ma in testa dice "Hai già le 9:30 di sabato con Mattia: se segni questa, quella si cancella." | letto all'apertura della riga | "Segna" sposta la prenotazione (la vecchia riga torna libera con lo straccio) |
| L16 | **Riga aperta e cambio specchio/giorno** | cambio specchio: la riga resta aperta su quello specchio (memoria), ci ritrovi i campi; cambio giorno: la riga si chiude, nome e telefono restano in memoria (il telefono solo in sessione, non salvato) e ricompaiono alla prossima riga | | |
| L17 | **Senza `localStorage`** | tutto uguale; la prenotazione vale fino alla chiusura della scheda | nessun avviso | |

"Chiama" è sempre un `tel:` di esempio, mai un numero scritto in vista.

### 6.4 Cosa la prenotazione non fa mai

Nessun passo numerato, nessun riepilogo in un riquadro, nessuna cartolina,
scontrino, biglietto o modale di conferma, nessuna email richiesta, nessun
contatore "posti rimasti", nessuna attesa in minuti, nessun "in fila adesso".

---

## 7. La riga di stato (unico canale dei messaggi)

- Un solo elemento `role="status"` (`aria-live="polite"`,
  `aria-atomic="true"`) per tutta la pagina, in Figtree 15, sempre pennarello
  su parete. Su L e M al centro della mensola; su S nella striscia sopra la
  mensola.
- Gli errori di campo **non** passano di qui: stanno sotto il loro campo. Gli
  errori che bloccano (L11, L12) usano `role="alert"` nella riga di
  scrittura.
- Messaggi: suggerimento del gesto, cambio giorno/fascia (conteggio dei posti
  liberi), invio, successo, prenotazione esistente, cancellato,
  "Specchio pulito: il vapore non torna" / "Il vapore torna" (al cambio
  dell'interruttore).
- Durata: 8 s per gli informativi; successo e "già segnato" restano finché non
  arriva un altro messaggio. Mai due messaggi insieme.

---

## 8. Accessibilità per ogni interazione

### 8.1 Base di pagina
- `lang="it"`; `<title>` e `description` del copywriter ("Concept di Ciceri
  Lab"); un solo `h1` (l'insegna, testo vero "Contropelo, barberia a
  Pordenone" con la seconda parte visibile su L e nascosta visivamente su S).
- Canvas del vapore: `aria-hidden="true"`, `pointer-events: none` (i gesti li
  prende il contenitore dello specchio, non il canvas), nessun contenuto solo
  lì.
- Foto del riflesso: `alt=""`, decorative. Il salone è raccontato a parole in
  Informazioni.
- Fuoco visibile ovunque: anello turchese 2 px con 2 px di stacco su parete e
  sul vetro; sulle parole a pennarello l'anello è l'ovale "a pennarello" della
  direzione ma con lo stesso spessore minimo. Nessun `outline: none` senza
  sostituto.
- **Fuoco mai coperto** (WCAG 2.4.11): la nicchia del bottone Lab è vuota a ogni
  larghezza; in vetrina lunga `scroll-padding` 64/72 px; il vapore si pulisce
  attorno all'elemento col fuoco (8.3).
- Contrasti: pennarello su vetro verificato sul punto più chiaro di ogni foto
  **a vapore zero**; il testo sotto al vapore non conta come stato di lettura
  (c'è sempre l'interruttore). Testo turchese mai sotto i 24 px.
- `forced-colors: active`: canvas nascosto (specchio pulito), foto nascosta,
  trattini liberi resi con `CanvasText` e affiancati dalla parola "libero"
  visibile, bottoni con bordo di sistema.
- `prefers-contrast: more`: velatura della foto all'80%, vapore massimo 0,6.

### 8.2 `prefers-reduced-motion: reduce`
Vale la sezione 11 della direzione. In più: cambio fascia/giorno = dissolvenza
200 ms senza scrittura riga per riga; riga di scrittura che si apre/chiude
senza animazione di altezza; traslazione con la tastiera virtuale istantanea;
"Rimettilo" e "cancella" senza straccio (sparisce/compare). L'interruttore
parte attivo **solo se l'utente non ha mai scelto** (`ctp-pulito` assente).

### 8.3 Pulire il vapore (gesto firma)
| Chi | Come |
|---|---|
| Mouse | pulisce al passaggio; premuto = pennello largo. Nessun contenuto richiede di pulire |
| Dito / penna | trascinare pulisce; `touch-action: none` **solo sul vetro** (mai su mensola o fascia, dove restano scroll e zoom). Un tocco fermo (< 8 px, < 300 ms) su un elemento interattivo lo attiva e pulisce un ovale attorno; un trascinamento oltre 8 px **non** attiva mai quello su cui è iniziato (il clic viene annullato in fase di cattura) |
| Tastiera | non si pulisce: quando un elemento del vetro prende il fuoco il vapore si apre in un ovale attorno al suo rettangolo (300 ms) e resta aperto finché ha il fuoco. La faccia che contiene il fuoco non viene mai ricoperta sopra l'elemento |
| Lettore di schermo | il vapore non esiste; tutto è testo DOM in ordine |
| Ingrandimento dello schermo / tremore | l'interruttore "Specchio pulito" (sempre nello stesso posto per disposizione) toglie il vapore per sempre (salvato) |
| Pinch-zoom sul vetro | con `touch-action: none` il pinch non zooma sul vetro: lo zoom del browser (menu) e il pinch su fascia e mensola restano disponibili; oltre i 500 px di altezza visibile si passa alla vetrina lunga dove il vetro è `touch-action: auto` |

### 8.4 Interruttore "Specchio pulito"
`button` con `aria-pressed`, etichetta fissa "Specchio pulito" (non cambia
testo tra gli stati: cambia `aria-pressed` e l'icona). Annuncio nella riga di
stato. Area 44 × 44 minima. Nascosto se il canvas non è disponibile.

### 8.5 Barbieri (tablist) e pan
- `role="tablist"` con `aria-label="Le tre poltrone"`; ogni tab
  `aria-controls` il suo pannello, `aria-selected`; tabindex mobile (solo
  l'attiva è nel Tab). Frecce ←/→ con attivazione automatica, Home/Fine.
- Pannelli `role="tabpanel"`, `aria-labelledby` la tab; inattivi `inert` (non
  focalizzabili, non letti) ma visibili ai bordi.
- Pan 650 ms: durante il pan il fuoco resta sulla tab; nessun contenuto del
  pannello nuovo riceve il fuoco da solo.
- Bordo dello specchio vicino: su L è un `button` vero ("Specchio di Denis")
  **fuori dal Tab** (`tabindex="-1"`), perché la tastiera ha già la tablist;
  su S è solo un'area di tocco da 24 px.
- Trascinamento sulla mensola: alternativa ai tab, mai l'unico modo.

### 8.6 Facce vetro/lista (S, M, L stretto)
- Il cambio di faccia non è un tab: "la lista →" e "← il listino" sono bottoni;
  dopo il cambio il fuoco va al titolo della faccia nuova (`h3` con
  `tabindex="-1"`). La faccia nascosta è `hidden` (una faccia alla volta
  davvero).
- "Scrivi il tuo nome" dalla mensola: apre la faccia lista (se serve) e mette il
  fuoco sul primo trattino libero della fascia mostrata (o sulla tua riga se
  hai già una prenotazione). Se nessun posto è libero, il fuoco va sul link
  del messaggio "pieno".

### 8.7 Lista
- `h3` con `<time datetime="2026-09-29">`; righe in `<ol>`; posti liberi
  `button` con testo nascosto "Ore 16:30, libero, scrivi il tuo nome"; occupati
  testo "Ore 17:00, occupato" (il nome del cliente di esempio è letto: "Ore
  17:00, Nicola S."); passati "Ore 9:00, passata"; la pausa "Dalle 12:30 alle
  14:30, pranzo".
- Tab entra solo sui posti liberi; ↑/↓ si spostano tra i liberi della fascia
  e al bordo della fascia si fermano (per cambiare fascia ci sono i bottoni
  fascia).
- Fasce: `button` con `aria-pressed`, dentro un gruppo `aria-label="Fascia
  oraria"`. Giorni: `button` con testo completo ("Vai a mercoledì 30").
- Target: 44 px con puntatore grosso, 40 px (≥ 24 px AA) con mouse.

### 8.8 Riga di scrittura
- `form` con `aria-label="Scrivi il tuo nome alle 16:00 con Denis"`; etichette
  sempre visibili sopra i campi (mai placeholder al posto dell'etichetta).
- Apertura: fuoco sul primo radio. Chiusura con Esc o "lascia stare": fuoco
  sul trattino. Dopo il successo: fuoco sulla riga del tuo nome.
- Font Mansalva nel campo: dimensione ≥ 22 px, `letter-spacing` normale;
  deve reggere la spaziatura forzata (WCAG 1.4.12) senza tagliare.
- `autocomplete` corretti; nessun limite di tempo; nessun CAPTCHA.

### 8.9 Informazioni
`role="dialog"`, `aria-modal="true"`, `aria-labelledby` il suo `h2`; il resto
della pagina `inert` mentre è aperto, tranne il bottone Lab, che non è del
concept, non va toccato e resta attivo. Fuoco sull'`h2` all'apertura, Esc e
"chiudi" lo chiudono, fuoco di ritorno a "Informazioni". "Ricomincia da capo"
chiede conferma **nella stessa riga** ("Sicuro? ◆ Sì, ricomincia ◆ No"), mai
con `confirm()`.

### 8.10 Link del vetro "orari"
"Apri in Maps" annuncia la nuova scheda; "Chiama" ha `aria-label="Chiama la
barberia"`. Entrambi puliscono il vapore al fuoco.

### 8.11 Zoom 200% e 400%, testo ingrandito
- 200% su 1440 × 900 (720 × 450): altezza < 500 → vetrina lunga.
- 400%: vetrina lunga a 320 px di larghezza, nessuno scroll orizzontale
  (WCAG 1.4.10).
- Testo ingrandito dal browser o spaziatura forzata: se una faccia trabocca, la
  pagina passa da sola alla vetrina lunga (rete di sicurezza, 2.5).

### 8.12 Fotosensibilità
Vale 6.5 della direzione. Aggiunta per chi costruisce: lo straccio della lista
(400 ms) cambia opacità di un'area grande **una volta** per azione; azioni
ripetute rapide (tocchi veloci su "domani →") si accodano con almeno 500 ms
tra due cambi, mai sovrapposte.

---

## 9. Conversione

**Un solo intento, una sola etichetta**: "Scrivi il tuo nome".

| Dove | Cosa fa |
|---|---|
| Mensola (sempre visibile, ogni disposizione) | apre la lista dello specchio attivo e porta il fuoco sul primo posto libero (o sulla tua riga) |
| Trattini turchesi della lista | aprono la riga di scrittura su quell'ora: sono il richiamo "dentro" il contenuto, senza etichetta ripetuta |
| Messaggio "pieno" | porta al primo posto libero su un altro specchio o giorno |

**Conversione principale**: "Segna" con successo (L10).
**Conversioni alternative**: "Chiama" (vetro orari, successo, errore di invio,
oltre i 6 giorni) e "Apri in Maps".

**Tracciamento** (unione chiusa del sito vero, solo due eventi):
- `track("apri_concept", { concept: 13 })` una volta al montaggio.
- `track("demo_prenotazione", { concept: 13, specchio, servizio, giorni_avanti,
  origine, pulito_a_mano, specchi_visti })` **solo** al successo, dove:
  `origine` = `"mensola" | "trattino" | "pieno" | "url"`;
  `pulito_a_mano` = l'utente ha pulito il vetro almeno una volta (bool);
  `specchi_visti` = quanti specchi diversi ha aperto (1-3).
  Nessun altro evento: "Chiama", "Maps" e l'interruttore non si tracciano.

**Cosa converte davvero**:
- il prezzo è leggibile **prima** di qualsiasi gesto (vetro pulito a t = 0) e
  il prezzo del servizio scelto è scritto accanto nella riga di scrittura;
- la lista mostra che la bottega lavora (nomi veri) ma ha posto (trattini);
- due campi soli, nessun account, nessuna email;
- l'errore del servizio da un'ora propone l'ora giusta invece di bloccare;
- al ritorno il tuo nome c'è ancora: il sito ricorda che sei un cliente.

**Per Luca**: il barbiere che guarda il concept deve pensare "la mia agenda di
carta, ma che si riempie da sola", e trovare "Un concept di Ciceri Lab" in
Informazioni.

---

## 10. Richieste ad altri agent

- **tech-architect**: le quattro disposizioni (2.5) con i loro criteri come
  unica fonte (hook `useDisposizione` nello store: `S | M | L | lunga` +
  `facce: "affiancate" | "singola"`); la parete come griglia unica con
  l'interruttore piazzato per `grid-area` (2.6); API del vapore per le **zone
  protette** (lista durante la scrittura, tua riga, elemento col fuoco,
  pannello Informazioni) e per `pulisciAttorno(rect)`; generatore
  deterministico della lista (6.1); `visualViewport` per la tastiera; stato
  `?demo=`; tre chiavi `localStorage` con prefisso `ctp-`.
- **copywriter**: tutti i testi segnaposto qui dentro; voci del listino ≤ 22
  caratteri (entrano a 375 px con il prezzo); etichette "← il listino",
  "← la barba", "← dove e quando"; nomi dei 40 clienti di esempio; messaggi
  L4-L17 e della riga di stato; nessun numero di telefono in vista.
- **art-director**: la nicchia del bottone Lab (0-260 × 0-56 su L/M; 0-212 ×
  fondo su S) è intoccabile; decidere il bottone "Scrivi il tuo nome" a due
  righe sotto i 380 px; stile del fuoco sulle parole a pennarello e
  in `forced-colors`.
- **motion-designer**: movimenti aggiunti da questo documento: raccolta delle
  righe lontane quando si apre la riga di scrittura, traslazione con tastiera
  virtuale, striscia della riga di stato su S, coda di 500 ms tra due stracci.
- **interaction-designer**: regola tocco/trascinamento (8 px, 300 ms) e
  annullamento del clic dopo un trascinamento; trascinamento sulla mensola per
  cambiare specchio (soglie in 2.1).
- **accessibility-auditor / responsive-tester**: checklist = sezione 8 + le
  quattro disposizioni; controlli obbligatori: nicchia del bottone Lab vuota a
  375, 768, 1440; "Segna" visibile con tastiera aperta a 375 × 667; lista a 4
  fasce a 375 × 667 senza scroll interno; vetrina lunga a 667 × 375 e al 400%.

---

## 11. Sezioni da costruire

Una per section-builder (7). Nomi allineati alla direzione: parete → tre
specchi (vetro + lista) → mensola, più vapore e informazioni. I file esclusivi
li assegna il tech-architect.

1. **`parete`**: la griglia dell'intera schermata e la fascia alta. Insegna
   (`h1`), "Informazioni" (solo il bottone), nicchia del bottone Lab, link di
   salto; la pista orizzontale con i tre specchi (bisello, parete tra gli
   specchi, bordi degli specchi vicini cliccabili), il pan 650 ms / dissolvenza;
   il riflesso (foto specchiata e velata) di ogni specchio; le quattro
   disposizioni S/M/L/vetrina lunga e il passaggio automatico alla vetrina
   lunga su trabocco; il posto (`grid-area`) dell'interruttore vapore.
2. **`vapore`**: il canvas 2D dello specchio attivo e le tre maschere fuori
   schermo; pulire con mouse/dito (pennello, interpolazione, palmo), ritorno
   lento a chiazze, memoria per specchio, gocce, sequenza d'apertura e passata
   automatica, zone protette e pulizia attorno al fuoco, pausa su
   `visibilitychange`, regola tocco/trascinamento e annullamento del clic,
   fallback senza canvas. (Se il tech-architect affida il motore
   all'interaction-designer, questa sezione ne fa l'integrazione nel vetro.)
3. **`vetro`**: il contenuto a pennarello delle tre facce "vetro" (listino di
   Mattia, barba di Denis, dove e quando di Samir con Maps e Chiama), i nomi
   dei barbieri in testa, la riga su ciascun barbiere, il cambio faccia
   vetro/lista (bottoni "la lista →" / "← il listino", fuoco sul titolo) nelle
   disposizioni a faccia singola, le rotazioni e posizioni per 375/768/1440.
4. **`lista`**: la faccia "lista" di ogni specchio: generatore deterministico
   per data e specchio, righe (libere, occupate, passate, pranzo), fasce 1/2/4
   con il calcolo di 6.1, cambio giorno fino a 6 giorni lavorativi, stati L0-L4b
   (prerender, riposo, straccio, chiuso, pieno con ricerca sui tre specchi,
   giornata finita), raccolta delle righe lontane, navigazione ↑/↓, la tua
   riga sottolineata con "cancella" e "Rimettilo" (L13-L15).
5. **`riga-di-scrittura`**: il form che sostituisce il trattino: quattro
   servizi con prezzo, nome in Mansalva, telefono, "Segna" / "lascia stare",
   validazione ed errori L6e-L8, invio simulato (L9), successo con
   sottolineatura SVG e salvataggio (L10), posto preso (L11), invio fallito
   (L12), sostituzione della prenotazione esistente (L15),
   `track("demo_prenotazione")`, traslazione con la tastiera virtuale.
6. **`mensola`**: la tablist dei tre barbieri col tratto turchese, il
   trascinamento per cambiare specchio, l'interruttore "Specchio pulito"
   (`aria-pressed`, salvataggio), "Scrivi il tuo nome" (anche su due righe),
   la riga di stato unica (`role="status"`) con il suggerimento del gesto, e
   la disposizione a due righe con la nicchia del bottone Lab su mobile.
7. **`informazioni`**: il dialog sul vetro dello specchio attivo: nota
   "attività inventata" e "Un concept di Ciceri Lab", crediti delle foto e dei
   font, "Ricomincia da capo" con conferma in riga; gestione del fuoco, `inert`
   del resto, Esc.
