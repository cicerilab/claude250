# UX architect · Concept 20 · IMBRUNIRE, albergo di sette stanze (Pordenone)

Ondata 1. Rotta `/concept-20`. Base vincolante: `docs/creative-director.md`
(variante A "Sezione frontale"), riga e paragrafo 20 di
`docs/matrice-concept-11-20.md`, `concepts/10-torchio/docs/integrazione-sito.md`.
Questo documento decide **struttura, indirizzi, percorsi, ordine di lettura,
stati e accessibilità**. Non decide colori, font, easing o testi definitivi
(art-director, motion-designer, copywriter): le frasi tra virgolette sono
segnaposto di lunghezza e di tono, da sostituire. Prezzi, metrature e regole
sono quelli di `docs/brand-strategist.md` (7.1, 7.2), letti mentre lo scriveva:
se cambiano là, vince là.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, matrice (riga 20, paragrafo 20,
verifica incrociata, regole comuni), `docs/creative-director.md` di questo
concept, `concepts/10-torchio/docs/ux-architect.md` (solo formato e livello).

Regole rispettate anche qui: niente trattini lunghi nei testi visibili, niente
occhielli numerati, niente maiuscoletto spaziato come etichetta, un solo intento
primario (**"Scegli le lune"**, e dentro una stanza lo stesso nastro come **"Le
mie notti qui"**), invio con **"Tienimi la stanza"**.

---

## 1. Sitemap e indirizzi

Una rotta del sito (`/concept-20`), dentro un **router a hash** del concept (non
tocca react-router). Il sito non è una pagina a sezioni: è un luogo con stati.
Ogni stato ha un hash, così il tasto indietro del browser funziona sempre.

```
/                                  ← Ciceri Lab (ConceptBackButton del sito)
└── /concept-20                    IMBRUNIRE
    ├── #/                         Il palazzo (home)                 stato base
    ├── #/lune                     Le lune aperte (nastro attivo)    sopra il palazzo
    ├── #/stanza/<slug>            Dentro una camera                 7 slug
    │     il-noce · il-campanile · la-soffitta
    │     il-camino · la-loggia · sul-noncello
    │     la-corte
    ├── #/androne                  Dentro l'androne (reception, regole, telefono)
    ├── #/colazione                Dentro la sala colazione
    ├── #/portico                  Fuori, sotto il portico (a piedi da qui, Maps)
    ├── #/elenco                   Le stanze in elenco (vista testuale)
    └── #/ti-aspettiamo            Successo (solo dopo un invio riuscito)
```

**Le notti viaggiano con ogni indirizzo** come query dentro l'hash:
`?dal=AAAA-MM-GG&notti=N` (es. `#/stanza/la-loggia?dal=2026-10-15&notti=3`).
Così le notti scelte non si perdono entrando e uscendo dalle stanze, e un link
condiviso riapre la stessa situazione.

**Regole di cronologia** (vincolanti per lo scaffold):

| Azione | Cronologia | Perché |
|---|---|---|
| Entrare in una stanza o in uno spazio comune dal palazzo | `push` | indietro = uscire all'indietro (6.3 della direzione) |
| Passare alla stanza accanto o prendere la scala dentro una stanza | `replace` | indietro esce sempre al palazzo, non ripercorre il corridoio |
| Aprire il nastro (`#/lune`, foglio mobile, fascia in stanza) | `push` | indietro chiude il nastro (su Android è il gesto naturale) |
| Cambiare le notti (trascinamento, tasti, campi data, proposte) | `replace` | nessuna voce di cronologia per ogni luna |
| Aprire `#/elenco` | `push` | |
| Invio riuscito → `#/ti-aspettiamo` | `replace` della stanza | indietro non riapre un modulo già inviato |
| "Torna al palazzo" dal successo | `replace` con `#/` e notti svuotate | |

**Indirizzi non validi**: hash sconosciuto o slug inesistente → `replace` su
`#/` (notti conservate se valide). `dal` passato, oltre l'orizzonte, in
chiusura o `notti` fuori limite → notti ignorate e riga di stato che lo dice
("Quelle notti non si possono più scegliere: eccole da stasera."). Ricaricare su
`#/ti-aspettiamo` senza un invio in memoria → `replace` su `#/`.

**Prerender e primo rendering**: il server produce sempre lo stato `#/` (il
palazzo, luci spente o accese secondo 6.4, lune vuote in luna spenta). L'hash si
legge solo dopo il montaggio. Se l'hash chiede una stanza, la stanza appare
**già inquadrata** (dissolvenza di 250 ms, senza viaggio della telecamera) e la
sequenza di accensione è considerata fatta.

**Link per post e inserzioni di Luca** (tutti funzionano senza parametri extra):
- `/concept-20` (il palazzo che si accende);
- `/concept-20#/stanza/il-camino` (entra direttamente nella stanza più grande);
- `/concept-20#/lune?dal=2026-10-16&notti=2` (un fine settimana già scelto,
  palazzo con le luci giuste).

**Stato che sopravvive**:
- `sessionStorage` (try/catch): "accensione già vista" (6.4 della direzione).
- Le notti vivono nell'hash, non nello storage.
- Bozza del pannello (quanti siete, ora d'arrivo, nome, nota; **mai** il
  contatto) in `sessionStorage` per stanza + notti, così uscire e rientrare non
  la cancella. Svuotata al successo.

---

## 2. Navigazione

### 2.1 Principio

Il palazzo è la navigazione. Non c'è menu: le stanze sono le voci, la scala è il
passaggio tra i piani, il portico è il piede. Gli elementi fissi sono **tre** su
ogni larghezza, più il `ConceptBackButton` del sito:

1. **Nome dell'albergo** (torna a `#/`), con sotto il link piccolo "le stanze in
   elenco" (è l'accesso dall'intestazione che la direzione chiede per la vista
   elenco, dentro lo stesso blocco, non un quarto elemento);
2. **"Scegli le lune"** (intento unico);
3. dentro una stanza o uno spazio: **"Torna al palazzo"** (al posto di "Scegli
   le lune", che dentro la stanza diventa "Le mie notti qui" nel pannello: mai
   due bottoni che fanno la stessa cosa sullo stesso schermo).

Link di salto, invisibili fino al focus, primi elementi tabulabili: **"Vai alle
stanze in elenco"** (→ `#/elenco`) e **"Vai alle lune"** (→ `#/lune`, fuoco sulla
luna di stasera).

**Convivenza col `ConceptBackButton`** (fisso, z-index altissimo, del sito):
- ≥ 640 px: occupa in alto a sinistra circa 14…244 × 14…58 px. Nessun elemento
  del concept sta in quel rettangolo più 12 px di respiro.
- < 640 px: occupa in basso a sinistra circa 14…224 × (h−58)…(h−14). Nessun
  bottone del concept sta in quel rettangolo; fogli e pannelli dal basso tengono
  una **fascia di riserva** a sinistra alta 72 px (vedi 2.3), o mettono la loro
  riga d'azioni sopra quella fascia.

### 2.2 Desktop (≥ 1024 px, disegnato a 1440 × 900)

**Il palazzo non scorre**: occupa una schermata sola (`100svh`), come una
fotografia di sera. Tutto il contenuto sta dentro le stanze.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[ConceptBackButton]          ALBERGO IMBRUNIRE                 ( Scegli le lune ) │ 0-64
│ riservato 244×58             le stanze in elenco              bottone luce, 44 h │
│                                                                                  │
│ ‹  ottobre                                                         novembre   ›  │ 72-190
│    ◐ ◐ ◑ ◑ ● ● ● ● ◕ ◕ ◕ ◔ ◔ ◔ ◒ ◒ ◓ ◓ ○ ○ ◌ ◌ ◌ ◑ ◑ ◑ ◑ ◕ ◕ ● ● ● ● ◕ ◕       │ nastro
│    26 27 28 29 30  1  2  3  4  5  6  7  8 ...                                    │ (sempre
│    s  d  l  m  m   g  v· s· ...                                                  │  visibile)
│    "Trascina sulle lune delle notti che vuoi."   Scrivi le date                  │ riga stato
│                                                                                  │
│      ◖ luna di stasera                                                           │ cielo
│        (48 px, fase vera)          ╱▔▔▔▔▔▔▔▔╲  comignoli                        │
│                              ╱▔▔▔▔▔ tetto a falde ▔▔▔▔▔╲                        │ 200-300
│                     "Tre fratelli e una casa sul corso..."  (frase incisa)       │ cornicione
│          ┌───────────┬───────────┬─────────┬──────┐                              │
│          │ IL NOCE   │IL CAMPANILE│LA SOFFITTA│ ▞ sc │  sottotetto  ~170 h        │
│          ├═══════════╪═══════════╪═════════╪══════┤  solaio (poché)             │
│          │ IL CAMINO      │ LA LOGGIA │SUL NONCELLO│ ▞ sc │  piano nobile ~210 h  │
│          ├═══════════╪═══════════╪═════════╪══════┤                              │
│          │ portico │ ANDRONE │ COLAZIONE │ LA CORTE │ ▞ ra │  piano terra ~180 h   │
│  ════════╧═════════╧═════════╧═══════════╧══════════╧══════╧════════ marciapiede │
│   Albergo inventato per un concept di Ciceri Lab              (riga sul marciapiede) │ 880-900
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Misura del palazzo**: larghezza = min(1180 px, 82vw, altezza disponibile ×
  1,18); centrato, leggermente spostato a destra (la luna occupa il cielo a
  sinistra). Se l'altezza della finestra è < 760 px il palazzo si rimpicciolisce,
  non si taglia. A 2560 resta a 1180 px (o fino a 1400 se l'altezza lo consente)
  e il cielo cresce intorno: il nastro invece resta a tutta larghezza e mostra
  più notti.
- **Pianta delle celle** (larghezze in % della luce interna del piano, esclusi i
  muri di poché; la colonna della scala è la stessa su tutti i piani):

| Piano | Celle da sinistra | Larghezze | Altezza relativa |
|---|---|---|---|
| Sottotetto | Il Noce · Il Campanile · La Soffitta · scala | 31 · 31 · 24 · 14 | 0,95 (falde che tagliano Il Noce a sinistra e la scala a destra) |
| Piano nobile | Il Camino · La Loggia · Sul Noncello · scala | 35 · 25 · 26 · 14 | 1,20 |
| Piano terra | portico · androne · colazione · La Corte · rampa | 17 · 19 · 23 · 27 · 14 | 1,00 |
| Tetto | triangolo con due comignoli | | 0,50 |

- **Ogni cella** mostra il nome in Marcellus sulla fascia di poché sotto la
  scatola (mai sopra la foto senza velo). Al passaggio del puntatore o al fuoco
  compare sotto il nome **"da 128 € a notte"**. Con notti scelte, sotto il nome
  delle occupate c'è sempre "occupata" (non solo al passaggio).
- **La scala** non è un bottone: è una colonna di gradini. Con la tastiera
  serve da passaggio tra i piani (6.1).
- **Parallasse** del tetto e del lato della scala (≤ 2°, solo puntatore fine,
  spenta con reduced motion). Nessun'altra cosa si muove col puntatore.
- **Il nastro è sempre nel cielo** su desktop. "Scegli le lune" non apre
  niente: porta il fuoco sulla luna di stasera (o sulla prima notte scelta),
  mette l'hash `#/lune` e mostra sotto la riga di stato il link "Scrivi le
  date". Esc o "indietro" tolgono `#/lune` (il nastro resta, il fuoco torna al
  bottone).
- **Dentro una stanza** (1440): la foto riempie la finestra.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│[ConceptBackButton]            ALBERGO IMBRUNIRE                                  │
│                                le stanze in elenco                               │
│                                                                                  │
│  ◂ La Loggia                    FOTO DELLA CAMERA               Sul Noncello ▸   │ porte laterali
│  (porta, 56×120,                (parete di fondo)               (porta)           │ a metà altezza
│   bordo della scatola)                                                           │
│                                                           ┌────────────────────┐ │
│  ▴ Il Noce, piano di sopra                                │ IL CAMPANILE       │ │ pannello
│  ▾ Il Camino, piano di sotto                              │ due righe di       │ │ 360 px,
│                                                           │ carattere          │ │ notte 92%
│                                                           │ 17 m² · matrim. 160│ │ max-height
│                                                           │ doccia · 3 rampe   │ │ 100svh−140
│                                                           │ da 128 € a notte   │ │ (scorre
│                                                           │ ◂ guarda la finestra ▸│ │ dentro)
│  ( ← Torna al palazzo )                                   │ ( Le mie notti qui )│ │
│  basso a sinistra, 24 px dai bordi                        └────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- Porte laterali: a metà altezza, sul bordo sinistro e destro, con il nome della
  destinazione scritto (mai solo una freccia). Scala: in basso a sinistra, sopra
  "Torna al palazzo", i bottoni "▴ piano di sopra" e "▾ piano di sotto" col nome
  della stanza d'arrivo (la più vicina in orizzontale nel piano d'arrivo).
- Ai bordi del piano non c'è porta verso il vuoto: nella prima cella del piano
  non c'è "◂"; nell'ultima "▸" è sostituita dalla scala.
- Gli spazi comuni del piano terra sono nella stessa catena di porte (portico ▸
  androne ▸ colazione ▸ La Corte).

### 2.3 Mobile (< 700 px di larghezza, disegnato a 375 × 667): la torre

Qui la pagina **scorre in verticale** (scroll nativo, niente Lenis): si scende
la torre col pollice.

```
┌─────────────────────────────────────┐
│ IMBRUNIRE             ( Scegli le lune )│ 0-56 fisso, notte 92%
│ le stanze in elenco                  │ (link piccolo sotto il nome)
│                                      │
│   cielo           ◗ luna di stasera  │ 56-190
│                                      │
│          ╱▔▔▔▔▔╲  comignoli          │ 190-300 tetto
│    ╱▔▔▔▔ frase incisa ▔▔▔▔╲          │
│█┌────────────────────────────────┐█ ┃│ 300 Il Noce, 343 × 192
│█│   scatola 3D, foto di fondo     │█ ┃│ muro di poché 16 px
│█│                                 │█ ●│ ← binario della scala
│█└────────────────────────────────┘█ ┃│   (tacca del piano attivo)
│█ IL NOCE        da 136 € a notte   █ ┃│ fascia nome, 44 h
│█┌────────────────────────────────┐█ ┃│ Il Campanile...
└─────────────────────────────────────┘
       [ConceptBackButton] in basso a sinistra, sempre libero
```

- **Ordine dall'alto**: cielo, tetto, sottotetto (Il Noce, Il Campanile, La
  Soffitta), solaio "piano nobile" (20 px di poché con il nome del piano), Il
  Camino, La Loggia, Sul Noncello, solaio "piano terra", androne, colazione, La
  Corte, e in fondo **il portico aperto sulla strada** che chiude la pagina con
  "A piedi da qui", "Apri in Maps" e la riga "Albergo inventato per un concept di
  Ciceri Lab". Sotto il portico, 80 px di marciapiede vuoto: l'ultimo link non
  finisce mai sotto il `ConceptBackButton`.
- **Celle**: larghezza piena meno 16 px di muro per lato, altezza 56% della
  larghezza (Il Camino 64%, La Soffitta 50%, per restare "diverse"), massimo
  70svh (telefono in orizzontale). Il prezzo "da" è **sempre** scritto (non c'è
  passaggio del puntatore).
- **Binario della scala**: fisso sul bordo destro, 6 px di linea visibile con tre
  tacche (sottotetto, piano nobile, piano terra), ognuna un bottone di 44 × 44
  ancorato al bordo; la tacca del piano visibile è piena. Tocco = scorre a quel
  piano. Compare solo dopo il tetto, sparisce sul portico.
- **Scegli le lune**: in alto a destra fisso; dopo il primo scorrimento oltre il
  tetto compare anche un **bottone in basso a destra** (104 × 52, disco della
  luna di stasera 24 px + testo "Lune"; nome accessibile "Scegli le lune"), a 12
  px dal bordo destro, mai sopra il rettangolo del `ConceptBackButton`. Nascosto
  quando un foglio è aperto e quando la tastiera è aperta.
- **Il foglio delle lune** (`#/lune`): sale dal basso, alto 36% dello schermo
  (min 240 px). Sopra, il palazzo **ridotto a vista intera** (tre piani + tetto,
  scalato alla larghezza, nomi in Commissioner 12 px su due righe se servono) al
  posto della torre, così si vedono tutte le luci cambiare insieme.

```
┌─────────────────────────────────────┐
│ IMBRUNIRE                 ( Chiudi ) │ in #/lune il bottone diventa "Chiudi"
│   ◗ luna        ╱▔▔▔╲                │
│   ┌────┬────┬───┬─┐                  │ palazzo intero ridotto,
│   │NOCE│CAMP│SOF│s│                  │ celle toccabili (si entra
│   ├────┼────┼───┼─┤                  │ direttamente nella stanza)
│   │CAMINO│LOG│NON│s│                 │
│   ├──┬───┬───┬───┼─┤                 │
│   │po│and│col│COR│r│                 │
│ ══╧══╧═══╧═══╧═══╧═╧══               │
├─────────────── maniglia ─────────────┤ foglio notte, 36%
│ ottobre                              │
│ ◐ ◑ ● ● ◕ ◕ ◔ ◔ ◒ ...  (scorre di lato)│ lune 40 px, area 44
│ 26 27 28 29 30  1  2 ...             │
│ "Dal giovedì 15 al sabato 17 ottobre,│ riga di stato
│  3 notti. Libere: Il Camino, ..."    │ (aria-live)
│ Scrivi le date        Svuota         │
│ ░░ riserva 224 px ░░   ( Fatto )     │ riga d'azioni: "Fatto" a destra,
└─────────────────────────────────────┘ sinistra libera per il ConceptBackButton
```

- **Dentro una stanza** (375): foto in 3:4 a tutta larghezza in alto, "Torna al
  palazzo" in alto a destra (sotto 640 px; il nome dell'albergo si riduce a
  "IMBRUNIRE"), foglio della stanza dal basso a metà altezza, trascinabile a
  tutta altezza (con il bottone-maniglia "Apri tutto" / "Riduci" come
  alternativa al trascinamento). Porte e scala sono una fila di bottoni in cima
  al foglio: "◂ La Loggia", "Sul Noncello ▸", "▴ piano di sopra", "▾ piano di
  sotto" (scorre di lato se non ci sta, area 44 px). Lo swipe verso il basso
  sulla foto esce dalla stanza.
- **Fascia di riserva**: ogni foglio ha in fondo 72 px + `env(safe-area-inset-bottom)`
  in cui la parte sinistra (224 px) è vuota; il bottone primario sta a destra di
  quella zona o sopra di essa a tutta larghezza.

### 2.4 Da 700 a 1023 px (tablet) e casi di confine

- **Modo "palazzo intero"** (quello desktop) quando la finestra è larga ≥ 700 px
  **e** alta ≥ 600 px. Altrimenti **modo "torre"**. Un telefono in orizzontale
  (844 × 390) è quindi torre, con celle limitate a 70svh e centrate a max 560 px.
- A 768 × 1024 (tablet verticale): palazzo intero largo 700 px, più cielo sopra;
  il nastro nel cielo mostra circa 16 notti per volta; il pannello della stanza è
  largo 360 px in basso a destra; "Torna al palazzo" in basso a sinistra (il
  `ConceptBackButton` è in alto a sinistra sopra 640 px).
- Tra 640 e 699 px: torre, ma il `ConceptBackButton` è in alto a sinistra: il
  nome dell'albergo parte a 256 px da sinistra.
- **Altezza < 480 px CSS** (zoom 400%, telefono orizzontale): l'intestazione non è
  più fissa (scorre con la pagina) e il pannello della stanza non è un foglio
  sovrapposto ma scorre **sotto** la foto, nel flusso. Nessun fisso del concept
  copre il contenuto.

---

## 3. Arco emotivo

Non è uno scroll a sezioni: è una **visita serale** in un palazzo. L'arco segue
l'arrivo di un viaggiatore all'imbrunire.

| Momento | Stato | Emozione | Cosa trattiene | Cosa porta avanti |
|---|---|---|---|---|
| 1. Arrivo | `#/`, accensione | **quiete, meraviglia lenta** | il palazzo è già lì, spento; le finestre si accendono una alla volta; c'è la luna vera di stasera | "in quale entro?": dieci celle, dieci inviti |
| 2. Sguardo | `#/`, passaggio sulle celle | **curiosità** | ogni stanza è diversa (larghezza, luce, foto); il prezzo compare al passaggio | toccare una cella |
| 3. Entrare | `#/stanza/…` | **intimità** | si cammina dentro: la foto vera diventa la parete; due righe concrete (travi, finestra, scale) | la stanza accanto, la scala, "Le mie notti qui" |
| 4. Il quando | `#/lune` | **gioco calmo, sorpresa** | le notti sono lune con la fase vera; trascinando, le stanze occupate si spengono | la risposta in un secondo: "quali sono accese" |
| 5. La scelta | stanza accesa + notti | **fiducia** | prezzo totale già fatto, colazione inclusa, tassa detta; l'ora d'arrivo come finestre che si accendono; il limite delle 21 detto prima | "Tienimi la stanza" |
| 6. Congedo | `#/ti-aspettiamo` | **attesa serena** | resta accesa solo la tua stanza; sale la luna della tua prima notte; una frase sola | aggiungi al calendario; torna al palazzo |

Regole di ritmo:
- L'accensione (momento 1) **non blocca nulla**: si può toccare una cella o il
  nastro da subito. Se si interagisce prima della fine, le luci ancora spente si
  accendono **tutte insieme** in una sola dissolvenza (un solo cambio).
- Momento 2 senza fretta: nessun invito lampeggiante, nessun "Scorri". Il solo
  invito è la riga sotto il nastro ("Trascina sulle lune...") e il bottone "Scegli
  le lune".
- Chi ha fretta (journey 4.2) salta 2 e 3: va dritto alle lune o all'elenco.
- Chi prima vuole vedere (4.1) fa 3 → 4 → 5 senza mai uscire dalla stanza.

---

## 4. Tre journey fino alla prenotazione

Il visitatore vero del Concept Lab è un **albergatore** che arriva da
cicerilab.com e si mette nei panni dei suoi ospiti. Ogni storia chiude con cosa
vede lui.

### 4.1 Chiara e Matteo, coppia da Treviso per un fine settimana (mobile, da Instagram)

**Contesto**: martedì sera, iPhone 375 × 667. Vogliono una notte a Pordenone per
un concerto sabato 24 ottobre, forse due. Arrivano da `/concept-20` (post di Luca
"l'albergo dove le notti sono lune").

1. **Arrivo**: cielo, luna di stasera (quasi primo quarto), tetto; il sottotetto
   si accende in dissolvenza. Chiara scorre giù: la torre, un piano alla volta.
   Il binario a destra dice "sottotetto", poi "piano nobile".
2. Si ferma su **La Loggia** (porta ad arco, balcone). Tocca: la foto riempie lo
   schermo in 3:4, il foglio sale a metà. Legge "22 m², matrimoniale 160, doccia,
   2 rampe, da 158 € a notte". Guarda la seconda foto ("guarda la finestra ▸").
3. Tocca **"Le mie notti qui"**: sale il foglio del nastro con, sotto ogni luna,
   il segno di disponibilità **della Loggia**. Sabato 24 è spenta: occupata.
4. Trascina da venerdì 23 a sabato 24: la selezione si ferma su venerdì 23 (non
   può attraversare una notte occupata). Riga di stato: "La Loggia è occupata
   sabato 24. Libera venerdì 23, oppure dal 30 al 31 ottobre."
5. Torna al palazzo con "indietro" (il foglio si chiude, poi la stanza esce
   all'indietro). Le notti 23-24 restano nell'hash. Riapre il nastro dal bottone
   "Lune" in basso a destra, seleziona 23-24 senza filtro: nel palazzo ridotto
   restano accese Il Noce, La Soffitta e Sul Noncello.
6. Tocca **Sul Noncello** nel palazzo ridotto: entra direttamente. Il foglio della
   stanza è già il pannello di prenotazione: "venerdì 23 e sabato 24 ottobre, 2
   notti, 2 persone: 340 € colazione inclusa. Tassa di soggiorno a parte: 6 € in
   due." (148 × 1,15 = 170 × 2).
7. Ora d'arrivo: tocca la finestra **19:30**, che resta accesa. Scrive nome e
   telefono. "Tienimi la stanza" → "Ti teniamo la stanza…" → la stanza esce
   all'indietro, il palazzo si spegne tranne Sul Noncello, sale la luna di
   venerdì 23 (gibbosa crescente). "Ti aspettiamo venerdì 23 ottobre verso le
   19:30..." Chiara fa uno screenshot e lo manda a Matteo.

**Attriti da evitare**: perdere le notti uscendo dalla stanza (vivono
nell'hash); il foglio che copre il `ConceptBackButton` (fascia di riserva); la
torre troppo lunga (binario della scala + palazzo ridotto nel foglio delle lune).
**L'albergatore vede**: la domanda "è libera sabato?" ha una risposta visiva, e
l'ospite trova da solo l'alternativa invece di rinunciare.

### 4.2 Davide, consulente in trasferta (desktop, da Google "albergo centro Pordenone")

**Contesto**: ufficio a Bologna, 1440 × 900, deve dormire tre notti per un corso
in Fiera, arrivo in treno tardi. Non vuole esplorare.

1. **Arrivo**: vede il palazzo accendersi, ignora; il nastro è già nel cielo.
   Clicca la luna di martedì 10 novembre e poi quella di giovedì 12 (tocco +
   tocco). Riga di stato: "Dal martedì 10 al giovedì 12 novembre, 3 notti.
   Libere: La Soffitta, Il Campanile, Il Camino, La Corte." Le altre stanze si
   spengono lentamente, sfalsate.
2. Vuole un elenco: clicca "le stanze in elenco" sotto il nome. `#/elenco`: sette
   righe con libera/occupata per quelle notti, prezzo da, scale. Ordina per
   prezzo. La Soffitta, 3 rampe, 14 m²: gli va bene, non ha valigie grandi.
3. Clicca "Entra" sulla riga della Soffitta: la stanza appare già inquadrata
   (dall'elenco non c'è viaggio della telecamera, c'è la dissolvenza) con il
   pannello di prenotazione: "3 notti, 1 persona: 291 € colazione inclusa" (uso
   singola 97 × 3).
4. **Ora d'arrivo**: il suo treno arriva alle 21:40. Le finestre finiscono alle
   21:00; sotto c'è la riga "Dopo le 21 la reception è chiusa: se arrivi più tardi,
   chiamaci e ti lasciamo le istruzioni per entrare." con il link "Chiama".
   Sceglie 21:00 e scrive nella nota "Arrivo col treno delle 21:40".
5. Inserisce un'email con un errore di battitura (`davide@studio`): all'uscita dal
   campo "Scrivi un'email completa o un numero di telefono." Corregge. Invia:
   successo. Clicca "Aggiungi al calendario": scarica il file .ics.

**Variante "pieno"**: se avesse scelto la settimana della fiera più affollata,
sarebbe apparso "Per queste notti siamo pieni." con **due proposte vere**
toccabili ("Dal 17 al 19 novembre si liberano Il Noce e La Corte"). Un clic
sposta la selezione.
**Attriti da evitare**: dover capire il palazzo per prenotare (nastro sempre
visibile, elenco a un clic); arrivo tardi non gestito (detto prima, non dopo).
**L'albergatore vede**: il cliente di lavoro prenota in un minuto e sa già cosa
succede se arriva tardi: meno telefonate alle 22.

### 4.3 Giorgio e Nives, settantenni, per la laurea della nipote (laptop, tastiera e zoom)

**Contesto**: Giorgio usa il portatile con lo zoom del browser al 200% e preferisce
la tastiera; Nives cammina col bastone. Serve una stanza senza scale, per due. Il figlio gli
ha mandato il link.

1. **Arrivo**: al 200% la finestra CSS è 720 × 450: altezza < 480, quindi torre
   senza intestazione fissa. Primo Tab: "Vai alle stanze in elenco". Invio.
2. **Elenco**: la prima colonna dopo il nome è "Scale". Legge "La Corte, piano
   terra, nessun gradino dalla strada, doccia a filo pavimento". Tab fino a
   "Entra in La Corte". Invio: la stanza si apre, il fuoco va sul titolo "La
   Corte".
3. Tab: pannello, poi **"Le mie notti qui"**. Invio: il nastro si apre filtrato
   sulla Corte, il fuoco va sulla luna di stasera. Preferisce le date: Tab fino a
   **"Scrivi le date"**, Invio, due campi nativi "Arrivo" 5 dicembre, "Partenza" 7
   dicembre. Riga di stato letta: "Dal sabato 5 al domenica 6 dicembre, 2 notti.
   La Corte è libera."
4. Pannello: "Quanti siete" 2; ora d'arrivo con le frecce nella fila delle
   finestre: 16:00. Nome, telefono. Nella nota: "Mia moglie usa il bastone, ci
   servono due asciugamani in più". Invio.
5. Invio fallito (la connessione di casa cade per un attimo): "Non è partito.
   Riprova, oppure chiamaci." I campi restano pieni; il fuoco va sul messaggio.
   "Tienimi la stanza" di nuovo: successo. La frase di successo prende il fuoco e
   viene letta.

**Attriti da evitare**: informazioni sulle scale nascoste nella stanza (sono la
seconda colonna dell'elenco e nell'etichetta di ogni cella); il trascinamento
come unica via (campi data e tastiera); fissi che coprono con lo zoom (2.4).
**L'albergatore vede**: la stanza accessibile si trova senza chiedere, e la
richiesta arriva già con le cose che servono.

---

## 5. Wireframe per schermata

Convenzioni:
- ◆ = interattivo. ▓ = poché (muri e solai tagliati). ░ = velo notte.
- Ordine di lettura = ordine nel DOM = ordine di tabulazione, salvo dove detto.
- La scatola 3D (pareti, soffitto, pavimento, luce) è sempre `aria-hidden`; la
  foto ha `alt`; il testo che conta è DOM su notte o su poché.

### 5.1 Il palazzo `#/` (1440, vedi 2.2 per lo schema)

Ordine DOM: link di salto → intestazione (nome, "le stanze in elenco", "Scegli
le lune") → `main`: nastro delle lune (5.4) → luna di stasera (figura
decorativa con testo: "Stasera la luna è crescente, illuminata al 38%") → frase
di chi siamo → palazzo (lista di piani, dall'alto) → strada (riga "Albergo
inventato...").

Ogni cella (◆ `button` o link con hash):
```
┌──────────────────────────┐
│ soffitto (travi)          │  scatola aria-hidden
│   ┌──────────────────┐    │
│   │  FOTO DI FONDO   │    │  img con alt, 55-60% della cella
│   └──────────────────┘    │
│ pavimento (colore foto)   │
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓ IL CAMPANILE             ▓  nome, Marcellus, luna su poché
▓ da 128 € a notte         ▓  al passaggio/fuoco (desktop), sempre (torre)
▓ occupata                 ▓  solo con notti scelte e stanza occupata
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

Spazi comuni: androne senza foto (intonaco in luce con ALBERGO IMBRUNIRE
inciso, riconoscibile anche piccolo), colazione con foto, portico aperto sul
davanti (archi con `clip-path`, vista sul marciapiede, nessuna foto). Il nome
sotto: "L'ANDRONE", "LA COLAZIONE", "IL PORTICO" e una parola in Commissioner
("reception", "7:30-10:30", "dove siamo") al posto del prezzo.

**375**: torre (2.3). Stesse celle, nome e prezzo sempre scritti, "occupata"
sotto il nome.

### 5.2 Dentro una camera `#/stanza/<slug>`

**1440**: vedi 2.2. Pannello della stanza (senza notti scelte):

```
┌──────────── pannello 360 ───────────┐
│ IL CAMPANILE          (h2, fuoco)    │  tabindex -1, riceve il fuoco all'arrivo
│ "Finestra alta con il campanile di   │  2 righe di carattere
│  San Marco dentro."                  │
│ 17 m² · matrimoniale 160 · doccia    │  dati, cifre tabellari
│ sottotetto · 3 rampe, niente ascensore│
│ ospiti 1-2 · camera 6               │  numero di stanza piccolo
│ da 128 € a notte, colazione inclusa  │
│ ◆ ◂ guarda la finestra ▸             │  seconda foto (se esiste)
│ ◆ ( Le mie notti qui )               │  primario, luce
└──────────────────────────────────────┘
```

Con notti scelte e stanza **libera**, il pannello è quello di prenotazione (5.5).
Con notti scelte e stanza **occupata** (anche una sola notte):

```
│ IL CAMPANILE                          │
│ "Occupata sabato 24 ottobre."         │  in luna, non rosso
│ ◆ Libera dal 30 al 31 ottobre:        │  proposta calcolata, stesso numero di
│   usa queste lune                     │  notti, la più vicina dopo e prima
│ ◆ Libera dal 16 al 17 ottobre: ...    │
│ ◆ ( Le mie notti qui )                │  apre il nastro filtrato
│ dati della stanza (come sopra)        │
```

**375**: foto 3:4 in alto (object-position del taglio verticale), "Torna al
palazzo" in alto a destra, foglio dal basso a metà altezza con in cima la fila di
porte/scala, poi lo stesso contenuto del pannello. Riga d'azioni in fondo con la
fascia di riserva (2.3).

**Foto mancante** (piano B 8.4.3): parete di fondo intonaco in luce, nome
inciso, le caratteristiche in Commissioner; il pannello non cambia.

### 5.3 Spazi comuni `#/androne`, `#/colazione`, `#/portico`

Stessa inquadratura e stesso pannello delle camere (con porte e scala), contenuto
diverso, **nessun bottone di prenotazione** tranne "Scegli le lune" in fondo al
pannello (secondario, contorno, perché qui l'intento non è una stanza).

- **Androne**: parete di fondo = intonaco con ALBERGO IMBRUNIRE inciso e, sotto,
  la **targa delle regole** in DOM (lista `dl`): reception 7:30-21:00; dopo le 21
  si arriva avvisando; colazione 7:30-10:30; partenza entro le 11; animali piccoli
  su richiesta (non nel sottotetto); parcheggio convenzionato a 250 m, 12 € ogni
  24 ore; tassa di soggiorno di esempio; pagamento in albergo; cancellazione
  gratuita fino a 3 giorni prima; niente ascensore, La Corte senza gradini. Nel
  pannello: ◆ "Chiama" (`tel:` di esempio) e ◆ "Scrivi" (`mailto:` di esempio).
  A 1440 la targa sta sulla parete (testo su intonaco solo ≥ 24 px, quindi il
  corpo della targa sta su una lastra di poché incassata nella parete).
- **Colazione**: foto; pannello con orario, tre righe su cosa c'è e da dove viene,
  "inclusa nel prezzo".
- **Portico**: scatola aperta sul davanti, niente foto; pannello "A piedi da qui"
  (lista: Duomo di San Marco, Loggia del Municipio, corso Vittorio Emanuele, parco
  del Noncello, stazione; minuti a piedi), indirizzo di esempio, ◆ **"Apri in
  Maps"** (link esterno, nuova scheda dichiarata nel nome accessibile), riga
  "Albergo inventato per un concept di Ciceri Lab".

### 5.4 Il nastro delle lune (`#/lune` e sempre nel cielo su desktop)

**1440** (fascia 72-190 px, tutta la larghezza meno 48 px per lato):

```
│ ◆‹                              ottobre         novembre                   ◆› │
│    ○   ◐   ◐   ◑   ◑   ●   ●   ●   ●   ◕   ◕   ◕   ◔ ...   (34 px, passo 44) │
│  stasera                                                                      │
│    26  27  28  29  30   1   2   3   4   5   6   7   8                          │
│    s   d   l   m   m    g   v·  s·  d   l   m   m   g       (· = ven e sab)    │
│ Riga di stato (aria-live): "Trascina sulle lune delle notti che vuoi."        │
│ ◆ Scrivi le date     ◆ Svuota (solo con notti scelte)                         │
```

- Luna selezionata: alone luce e base di luce sotto (non pillola). Prima e
  ultima notte con la base più lunga ("arrivo", "ultima notte" scritti sotto al
  fuoco/passaggio).
- **Notti di chiusura** (7-28 gennaio): lune velate, sotto "chiuso" al posto del
  giorno della settimana; non selezionabili.
- **Filtrato su una stanza** ("Le mie notti qui"): sotto ogni luna un segno di
  disponibilità **di quella stanza** (punto luce = libera, punto spento con
  trattino di contorno = occupata; la differenza è di forma, non solo di colore),
  e la riga di stato comincia con il nome della stanza ("La Corte: ...").
- **Frecce ‹ ›**: scorrono di un mese; la rotella orizzontale e il
  trascinamento dello spazio vuoto (sopra o sotto le lune) scorrono il nastro.
  Trascinare **su una luna** seleziona (non scorre).
- **"Scrivi le date"**: apre sotto il nastro un piccolo pannello con due campi
  data nativi ("Arrivo", "Partenza"), `min` stasera, `max` +240, e ◆ "Usa queste
  date". Stessa validazione e stessi messaggi del nastro.

**Dentro una stanza (1440)**: "Le mie notti qui" fa scendere una fascia di cielo
in cima allo schermo (notte piena, alta 190 px) con lo stesso nastro filtrato; il
pannello resta a destra e diventa il pannello di prenotazione appena le notti
sono valide. Esc chiude la fascia.

**375**: foglio (2.3), lune 40 px con area 44, nastro che scorre di lato col dito
nello spazio vuoto; il trascinamento su una luna seleziona dopo 120 ms di tenuta
o dopo uno spostamento orizzontale > 8 px partito da una luna (per non rubare lo
scorrimento). Tocco + tocco sempre disponibile.

### 5.5 Pannello di prenotazione (stanza libera + notti scelte)

**1440** (nel pannello 360 px, scorre dentro se serve):

```
┌──────────── pannello 360 ───────────┐
│ IL CAMPANILE          (h2)          │
│ Dal giovedì 15 al sabato 17 ottobre, │ notti in parole
│ 3 notti · ◆ cambia le notti          │ riapre il nastro filtrato
│                                      │
│ Quanti siete   ◆ (1) ◆ (2)  [◆ (3)]  │ radiogroup; 3 solo Camino e Corte
│                                      │
│ 3 notti, 2 persone                   │
│ 422 €  colazione inclusa             │ totale grande, tabellare
│ tassa di soggiorno a parte: 9 € in   │
│ due, si paga qui                     │
│ ◆ come è fatto il prezzo             │ disclosure: notte per notte (+15% ven/sab)
│                                      │
│ Quando arrivi                        │ radiogroup "finestre"
│ ┌──┐┌──┐┌──┐┌──┐┌──┐                 │ 14:00 14:30 15:00 15:30 16:00
│ └──┘└──┘└──┘└──┘└──┘                 │
│ ┌──┐┌──┐┌──┐┌──┐┌──┐                 │ 16:30 17:00 17:30 18:00 18:30
│ └──┘└──┘└──┘└──┘└──┘                 │
│ ┌──┐┌──┐┌──┐┌──┐┌──┐                 │ 19:00 19:30 20:00 20:30 21:00
│ └──┘└──┘└──┘└──┘└──┘                 │ ogni finestra 60×48, ora scritta dentro
│ "Dopo le 21 la reception è chiusa:   │
│  se arrivi più tardi, ◆ chiamaci e   │ link tel: di esempio
│  ti lasciamo le istruzioni."         │
│                                      │
│ Il tuo nome        [______________]  │ etichetta sopra, errore sotto
│ Email o telefono   [______________]  │
│ Una cosa che dobbiamo sapere          │
│ (facoltativo)      [______________]  │ textarea 3 righe
│                                      │
│ ◆ ( Tienimi la stanza )              │ primario, luce, 52 h
│ "Non paghi niente adesso. Cancelli   │ promessa, sotto il bottone
│  gratis fino a 3 giorni prima."      │
│ zona messaggi (aria-live)            │
└──────────────────────────────────────┘
```

- La fila delle ore è una **facciata di tre piani di cinque finestre**: si legge
  dall'alto (prima) al basso (più tardi). L'ora scelta resta accesa (dissolvenza
  400 ms); le altre spente. Nessuna preselezione: l'ora va scelta.
- Il totale si aggiorna al cambio di "Quanti siete" e di notti; mai prezzi "da"
  qui dentro.
- Calcolo (dal brand-strategist 7.2): prezzo base per due, uso singola −15 €,
  venerdì e sabato +15% arrotondato all'euro dopo la singola, letto aggiunto 35 €
  a notte, tassa 1,50 € a persona a notte per le prime 5 notti fuori dal totale.
  Lo sconto di 7+ notti **si omette** (complica il pannello, il brand lo permette).
- **375**: stesso contenuto nel foglio della stanza aperto a tutta altezza
  (si apre da solo quando diventa pannello di prenotazione); finestre 5 per riga
  (311 px / 5 = 58 px); il bottone primario sta a tutta larghezza **sopra** la
  fascia di riserva; con la tastiera aperta il foglio usa `visualViewport` e il
  campo attivo resta visibile.

### 5.6 Successo `#/ti-aspettiamo`

**1440**: la stanza è uscita all'indietro; il palazzo è tutto spento tranne la
tua stanza (**solo la tua**, nemmeno l'androne, come dice la direzione); il nastro
è nascosto; nel cielo, al posto della luna di stasera, la **luna della tua prima
notte** (più grande, 96 px, dissolvenza 1200 ms). Sotto la luna, su notte:

```
│   ◖ (luna della prima notte)                                    │
│   "Ti aspettiamo giovedì 15 ottobre verso le 19:30.             │ h2, riceve il fuoco
│    Quella sera la luna è crescente, illuminata al 42%.          │
│    Ti scriviamo entro stasera per confermare."                  │
│   ◆ Aggiungi al calendario      ◆ Torna al palazzo               │
```

- "Aggiungi al calendario": scarica un `.ics` (evento di arrivo alle 19:30 della
  prima notte, fine alle 11:00 del giorno di partenza, indirizzo di esempio).
- "Torna al palazzo": riaccende le luci (una sola dissolvenza), svuota le notti,
  torna a `#/`, fuoco sul bottone "Scegli le lune".
- Nessuna cartolina, ricevuta, scontrino, busta, chiave.
- Il tuo nome di stanza resta leggibile sotto la cella accesa.

**375**: la torre scorre da sola alla tua stanza (con reduced motion: salto);
cielo con la luna della prima notte e la frase **in cima** alla pagina (è il
primo contenuto dopo l'intestazione), la tua stanza accesa subito sotto in un
riquadro del palazzo ridotto (vista intera). Bottoni a tutta larghezza.

### 5.7 Le stanze in elenco `#/elenco`

Vista testuale, sopra al palazzo (pannello notte a tutta pagina, il palazzo si
intravede spento dietro al velo). "Chiudi l'elenco" in alto a destra (≥ 640) o in
alto a destra sotto il nome (< 640).

**1440**: tabella vera (`table` con `caption`, intestazioni di colonna):

```
│ Le stanze                     ordina per: ◆ piano  ◆ prezzo            │
│ (con notti: "Per dal 15 al 17 ottobre, 3 notti")                        │
│┌──────┬─────────────┬───────────┬──────────┬─────┬────────┬──────────┬─────────┐│
││ foto │ Stanza      │ Scale      │ Letto    │ m²  │ Ospiti │ Da/notte │         ││
││ 96×72│ La Corte    │ nessun     │ matrim.  │ 24  │ 1-3    │ 142 €    │◆ Entra  ││
││      │ piano terra │ gradino    │ 160 + 1  │     │        │ libera   │         ││
│ ... sette righe ...                                                              │
│ Spazi comuni: ◆ l'androne  ◆ la colazione  ◆ il portico                          │
│ ◆ Scegli le lune                                                                 │
```

- Con notti scelte: colonna "Per le tue notti" con "libera, 422 € in due" o
  "occupata"; le libere prima. Senza notti: niente colonna.
- "Entra" apre la stanza **con dissolvenza** (dall'elenco non c'è una cella da
  cui partire): il fuoco va al titolo; uscendo dalla stanza si torna all'elenco
  (l'elenco è nella cronologia).
- **375**: non tabella ma lista di sette blocchi (foto 88×66 a sinistra, testo a
  destra: nome, piano e scale, letto e m², prezzo, stato, ◆ "Entra"), per non
  scorrere di lato.

---

## 6. Stati

### 6.1 Stati del palazzo e del nastro

| # | Stato | Palazzo | Nastro | Riga di stato (segnaposto) | Fuoco |
|---|---|---|---|---|---|
| P0 | **Prerender / prima del calcolo lune** | celle presenti, luci secondo sessione | dischi in luna spenta, struttura completa, giorni scritti | "Trascina sulle lune delle notti che vuoi." | nessuno spostato |
| P1 | **Accensione** (prima visita della sessione) | spento, poi una stanza ogni 450 ms (1400 ms di dissolvenza), ordine della direzione 6.4 | fasi in dissolvenza 300 ms | come P0 | interattivo da subito |
| P2 | **Vuoto** (nessuna notte) | tutto acceso | stasera con anello e "stasera" | "Trascina sulle lune delle notti che vuoi." | |
| P3 | **Prima luna fissata** (tocco + tocco o Invio) | invariato | la luna fissata con base di luce, le successive con anteprima al passaggio | "Arrivo giovedì 15 ottobre. Ora scegli l'ultima notte." | resta sulla luna |
| P4 | **Selezione in corso** (trascinamento o Maiusc+frecce) | luci aggiornate al più ogni 400 ms | alone sulle lune toccate; auto-scorrimento al bordo | aggiornata a vista; annunciata **solo** a fine gesto | |
| P5 | **Notti scelte, libere ≥ 1** | libere accese, occupate spente (1200 ms, sfalsate 120 ms) con "occupata" | selezione ferma | "Dal giovedì 15 al sabato 17 ottobre, 3 notti. Libere: Il Camino, La Corte, Il Noce, La Soffitta. Da 112 € a notte." | |
| P6 | **Nessuna libera** | tutto spento tranne l'androne | selezione ferma | "Per queste notti siamo pieni." + 2 proposte ◆ ("Dal 22 al 24 ottobre si liberano Il Noce e La Corte") | la prima proposta resta raggiungibile subito dopo la riga |
| P7 | **Oltre 14 notti** | aggiornato fino alla 14ª | selezione fermata alla 14ª | "Da noi al massimo 14 notti: per soggiorni più lunghi ◆ scrivici." | |
| P8 | **Attraversa la chiusura** | aggiornato fino al 6 gennaio | fermata all'ultima notte valida | "Dal 7 al 28 gennaio siamo chiusi." | |
| P9 | **Minimo non rispettato** (una notte con un sabato di agosto) | luci **non** aggiornate (restano quelle di prima) | selezione visibile ma tratteggiata | "In agosto il sabato si resta almeno due notti." ◆ "Aggiungi la domenica" / ◆ "Aggiungi il venerdì" | |
| P10 | **Filtrato su una stanza** | la stanza scelta resta in primo piano (siamo dentro) | segni di disponibilità della stanza; selezione che non attraversa le occupate | "La Loggia: occupata sabato 24. Libera venerdì 23, oppure dal 30 al 31 ottobre." | |
| P11 | **Date scritte non valide** (campi) | invariato | invariato | sotto il campo: "La partenza viene dopo l'arrivo." / "Scegli una data da stasera al 24 maggio." | primo campo sbagliato |
| P12 | **Notti dall'URL non valide** | tutto acceso | vuoto | "Quelle notti non si possono più scegliere: eccole da stasera." | |
| P13 | **Svuota** | tutto acceso (una dissolvenza) | vuoto | come P2 | resta su "Svuota" → poi sulla luna di stasera |

Regola anti-lampeggio (per tutti): i cambi di luce di **tutta la sezione**
sono raggruppati in al massimo **2 partenze al secondo**; una partenza può
contenere più stanze (sfalsate di 120 ms), ogni dissolvenza dura ≥ 900 ms.

### 6.2 Stati della stanza e del pannello

| # | Stato | Pannello | Note |
|---|---|---|---|
| S0 | **Dentro, nessuna notte** | informazioni + "Le mie notti qui" | |
| S1 | **Dentro, nastro filtrato aperto** | fascia di cielo in alto (desktop) / foglio (mobile) | P10 |
| S2 | **Dentro, notti valide, stanza libera** | pannello di prenotazione (5.5) | |
| S3 | **Dentro, notti valide, stanza occupata** (anche parzialmente) | "Occupata il ..." + 2 proposte di questa stanza + "Le mie notti qui" | se non ci sono proposte entro l'orizzonte: "Nelle prossime lune è sempre occupata: ◆ guarda le stanze libere" (torna al palazzo con le notti) |
| S4 | **Spazio comune** | contenuto 5.3, nessun modulo | con notti scelte: riga "Per le tue notti ci sono 4 stanze libere: ◆ torna al palazzo" |
| S5 | **Foto in caricamento** | pannello già completo | parete intonaco in luce finché la foto non c'è, poi dissolvenza 300 ms |
| S6 | **Foto non caricata** | invariato | parete intonaco con nome inciso (piano B) |
| S7 | **Seconda foto** | "◂ guarda il letto / guarda la finestra ▸" | dissolvenza incrociata 600 ms, mai automatica |
| S8 | **Carrello / scala** verso un'altra stanza | pannello si svuota e si riempie con la nuova stanza | fuoco al nuovo titolo; bozza del pannello salvata per stanza |

### 6.3 Stati dell'invio

| # | Stato | Cosa si vede | Fuoco e annunci |
|---|---|---|---|
| F0 | **Pronto** | bottone "Tienimi la stanza" sempre attivo (mai disabilitato: la validazione parla) | |
| F1 | **Errori nei campi** (nome vuoto, contatto non valido, ora non scelta) | messaggio sotto ogni campo ("Scegli l'ora in cui pensi di arrivare.", "Scrivi un'email completa o un numero di telefono.", "Scrivi il tuo nome."), bordo in luce + icona, **niente rosso** | fuoco sul primo errore; riepilogo in `aria-live` ("Mancano due cose: l'ora d'arrivo e il contatto.") |
| F2 | **Invio in corso** (700-1200 ms simulati) | bottone "Ti teniamo la stanza…", resta premuto, `aria-disabled`; campi in sola lettura; la stanza resta accesa; nessuno spinner | annuncio "Invio in corso" |
| F3 | **Invio fallito** (offline reale, o `?prova=errore` nell'hash per il collaudo) | "Non è partito. Riprova, oppure ◆ chiamaci." sotto il bottone; dati conservati | fuoco sul messaggio |
| F4 | **Notti cambiate nel frattempo** (la stanza è diventata occupata per le nuove notti) | il pannello torna S3 con il messaggio "Per le nuove notti la stanza è occupata." | annuncio |
| F5 | **Successo** | 5.6; `track("demo_prenotazione", { concept: 20, stanza, notti, ospiti })` | fuoco sulla frase di successo |

**Contatto valido**: email con `@` e dominio con punto, oppure telefono con
almeno 8 cifre (spazi, `+` e `/` ammessi). Validazione all'uscita dal campo e
all'invio, mai a ogni carattere.

---

## 7. Accessibilità (per ogni interazione)

### 7.1 Base

- Punti di riferimento: `header` (nome, elenco, lune), `main` (nastro, cielo,
  palazzo), la strada come `footer` (riga "Albergo inventato...", "Apri in Maps"
  nella torre). Stanza e spazi: `main` con `h2` del titolo; il resto del palazzo
  `inert` mentre si è dentro.
- **Un solo `h1`**: "Albergo Imbrunire, sette stanze a Pordenone" (visivamente
  è il nome nell'intestazione). `h2` per piano (visivamente nascosti,
  "Sottotetto", "Piano nobile", "Piano terra"), per la stanza aperta, per il
  nastro ("Le notti"), per il successo, per l'elenco.
- Lingua `it`; date, prezzi, percentuali con `Intl` in italiano.
- Focus visibile: contorno 2 px luce a 3 px di distanza su tutto, anche sulle lune
  e sulle finestre delle ore. Mai rimosso.
- Aree di tocco ≥ 44 × 44 (lune, ore, porte, tacche della scala, "Svuota").
- Nessuna informazione solo nella luce: libera/occupata è sempre anche una parola
  e un segno di forma.
- **Cambio di contesto** mai al solo fuoco: si entra in una stanza solo con
  Invio/Spazio/clic.

### 7.2 Celle del palazzo

- Una lista di `button` (o `a href="#/stanza/…"`) in ordine: Il Noce, Il
  Campanile, La Soffitta, Il Camino, La Loggia, Sul Noncello, il portico,
  l'androne, la colazione, La Corte. Raggruppati in tre liste con nome del piano.
- **Roving tabindex**: un solo Tab entra nel palazzo (sulla cella attiva, la
  prima volta Il Noce); ← → sullo stesso piano (niente giro), ↑ ↓ al piano sopra
  o sotto sulla cella con il centro orizzontale più vicino; Home/Fine prima e
  ultima cella; Invio/Spazio entra; un altro Tab esce dal palazzo.
- Nome accessibile completo: "Il Campanile, sottotetto, 3 rampe, matrimoniale,
  da 128 euro a notte" + con notti ", libera per le tue notti" / ", occupata per
  le tue notti". Spazi: "L'androne, piano terra, reception e regole della casa".
- Uscendo da una stanza il fuoco torna sulla cella da cui si è entrati (o sulla
  cella dell'ultima stanza vista, se ci si è spostati con porte o scala).
- Torre: stesse regole di tastiera; il fuoco su una cella la porta in vista con
  `scrollIntoView({ block: "nearest" })` (senza animazione con reduced motion).
- Il binario della scala: tre `button` "Vai al sottotetto / al piano nobile / al
  piano terra", con `aria-current="true"` sul piano visibile; il fuoco va al primo
  bottone-cella del piano.

### 7.3 Entrare, uscire, porte e scala

- Entrare: all'arrivo il fuoco va all'`h2` della stanza (`tabindex="-1"`).
  Annuncio implicito dal titolo. Ordine: titolo, pannello (dati, seconda foto,
  "Le mie notti qui" o modulo), porte laterali, scala, "Torna al palazzo".
- Uscire: "Torna al palazzo", **Esc** (se nessun foglio/fascia è aperto: Esc
  chiude prima la cosa più interna), tasto indietro, swipe verso il basso sulla
  foto (mobile, con il bottone come alternativa).
- Porte e scala: `button` con nome "Stanza accanto: Sul Noncello" / "Piano di
  sopra: Il Noce". Frecce della tastiera **non** globali dentro la stanza (i
  gruppi radio del pannello le usano).
- Seconda foto: due `button` "Guarda il letto" / "Guarda la finestra" con
  `aria-pressed`; l'`alt` cambia con la foto.
- Parallasse del tetto: decorativa, non serve a nulla, spenta con reduced motion
  e con puntatore grossolano.

### 7.4 Nastro delle lune

- `role="listbox"`, `aria-multiselectable="true"`, `aria-label="Le notti, da
  stasera"`, con `aria-describedby` sulla riga d'istruzioni. I mesi sono `group`
  con nome ("ottobre 2026"). Ogni luna `role="option"` con `aria-selected` e nome
  completo: "Giovedì 15 ottobre, luna crescente illuminata al 42%, 4 stanze
  libere" (filtrato: "La Corte libera"); chiusura: "chiuso", `aria-disabled`.
- **Tastiera**: fuoco mobile sulla luna attiva (roving); ← → luna precedente e
  successiva; **Maiusc + ← →** allarga o stringe la selezione dalla prima luna
  fissata; **Invio/Spazio** fissa l'arrivo, poi l'ultima notte (tocco + tocco con
  la tastiera); Pag↑/Pag↓ mese precedente e successivo; **Home** stasera; **Fine**
  ultima notte dell'orizzonte; **Esc** annulla la luna fissata (P3) e, se niente
  è in corso, chiude `#/lune`; **Canc** svuota.
- **Annunci**: la riga di stato è `aria-live="polite"`; durante trascinamento e
  Maiusc+frecce si annuncia **solo** 500 ms dopo l'ultimo cambio o alla fine del
  gesto.
- **Alternative al trascinamento**: tocco + tocco; tastiera; "Scrivi le date"
  (due `input type="date"` con etichetta visibile). Le tre vie producono lo stesso
  stato (stessa query nell'hash).
- **Trascinamento col puntatore**: la selezione si conferma al rilascio;
  trascinare fuori dal nastro e rilasciare annulla il gesto (annullamento del
  puntatore); il dito non deve mai restare fermo a lungo (nessun "tieni premuto"
  obbligatorio).
- Foglio mobile: `dialog` non modale verso il palazzo ridotto (le celle ridotte
  restano toccabili e tabulabili, perché servono a entrare), ma il resto della
  pagina (torre) è `inert`; niente trappola: Tab dall'ultimo elemento del foglio
  va al palazzo ridotto, poi all'intestazione. Esc, "Fatto", "Chiudi", indietro e
  trascinamento verso il basso della maniglia chiudono; il fuoco torna a chi l'ha
  aperto.

### 7.5 Pannello di prenotazione

- "Quanti siete" e "Quando arrivi": `fieldset` + `legend` con `radio` veri (resi
  come dischi e come finestre). Frecce dentro il gruppo; la scelta non si fa al
  solo fuoco del gruppo se non c'è una scelta (nessuna preselezione dell'ora).
- Nome di ogni finestra: "19:30". Il limite delle 21 è testo nel `legend`
  descrizione (`aria-describedby`), non solo alla fine della fila.
- Campi: etichetta sopra, `autocomplete="name"`, contatto `autocomplete="email"`
  con `inputmode="email"` (accetta anche telefono: l'etichetta lo dice), corpo ≥
  16 px (niente zoom iOS), errori `aria-describedby` + `aria-invalid`.
- Totale in `aria-live="polite"` con debounce 600 ms ("422 euro per 3 notti, 2
  persone, colazione inclusa").
- "Come è fatto il prezzo": `button` con `aria-expanded`, lista notte per notte.

### 7.6 Successo

- Fuoco sulla frase (`h2 tabindex="-1"`), che è anche l'annuncio. La luna della
  prima notte ha `alt` testuale nella frase stessa (non un secondo annuncio).
- "Aggiungi al calendario": `a download` con nome accessibile "Aggiungi l'arrivo
  al calendario, file .ics".

### 7.7 Reduced motion (`prefers-reduced-motion: reduce`)

- Entrare/uscire: **dissolvenza incrociata di 250 ms** tra palazzo e stanza già
  inquadrata; stessa composizione finale.
- Accensione: tutte le luci accese subito. Luci su/giù per le notti: 250 ms, una
  sola partenza.
- Niente parallasse, niente carrello tra stanze (dissolvenza), niente
  auto-scorrimento animato della torre (salto), nastro senza inerzia.
- Luna della prima notte al successo: dissolvenza 250 ms, nessuna salita.
- Nessuna informazione dipende da un movimento: il sito resta completo.

### 7.8 Zoom 400% e testo ingrandito

- 1440 al 400% = 360 × 225 CSS px: modo torre, altezza < 480 → intestazione non
  fissa, pannelli nel flusso (2.4). Nessuno scorrimento orizzontale tranne il
  nastro (che è un componente a scorrimento con frecce, ammesso).
- Il nastro al 400%: lune 34 px restano 34 px CSS (quindi grandi); il foglio non
  è sovrapposto ma nel flusso sotto l'intestazione.
- Testo ingrandito al 200% (solo testo): i nomi delle stanze possono andare su due
  righe nella fascia di poché, che cresce in altezza (mai testo tagliato, mai
  altezza fissa sulle fasce di testo).

---

## 8. Conversione

**Un solo intento, due etichette che aprono lo stesso nastro**:

| Posizione | Etichetta | Parte con |
|---|---|---|
| Intestazione (palazzo, elenco) | "Scegli le lune" | notti correnti o vuoto |
| Bottone mobile in basso a destra | "Lune" (nome "Scegli le lune") | come sopra |
| Pannello della stanza | "Le mie notti qui" | nastro filtrato sulla stanza |
| Spazi comuni, elenco | "Scegli le lune" (secondario) | come sopra |

**Conversione principale**: "Tienimi la stanza" nel pannello (richiesta di
prenotazione, nessun pagamento).

**Perché converte**:
- la risposta a "è libera?" arriva **prima** di qualsiasi modulo (luci);
- il **totale** è visibile prima di scrivere il nome, con colazione inclusa e
  tassa detta;
- le rassicurazioni stanno accanto al bottone, non in una pagina di condizioni:
  "Non paghi niente adesso. Cancelli gratis fino a 3 giorni prima.";
- l'arrivo tardi è gestito prima (riga delle 21 con "chiamaci");
- chi trova pieno riceve **due proposte vere**, mai un vicolo cieco.

**Conversioni alternative**: "Chiama" / "Scrivi" nell'androne, nel messaggio delle
21, nell'invio fallito, per soggiorni oltre 14 notti; "Apri in Maps" nel portico.
Recapiti di esempio presentati come link, senza numeri finti in vista.

**Misura** (solo i due eventi del sito, 3 di `integrazione-sito.md`):
- `track("apri_concept", { concept: 20, ingresso: "palazzo" | "stanza" | "lune" })`
  al montaggio (ingresso letto dall'hash);
- `track("demo_prenotazione", { concept: 20, stanza, notti, ospiti, via:
  "palazzo" | "stanza" | "elenco" })` all'invio riuscito.
Nient'altro si traccia.

**Per Luca**: la riga "Albergo inventato per un concept di Ciceri Lab" sul
marciapiede e nel portico; l'albergatore deve uscire pensando "il mio telefono
squilla meno e le camere si vendono da sole".

---

## 9. Dati che servono (per tech-architect, copywriter, photo-editor)

Per ogni stanza (7): `slug`, `nome`, `piano`, `ordine` nel piano, `larghezza` (%
della pianta 2.2), `mq`, `letto`, `bagno`, `ospitiMax` (2 o 3), `rampe` (0, 2, 3),
`prezzoBase`, `numero` (1-7, solo dato piccolo), `carattere` (2 righe), `foto`
(+ `alt`, `posDesktop`, `posMobile`), `foto2?` (+ `alt`, etichetta "guarda ..."),
`pavimento` (colore campionato), `soffitto` (`travi` | `inclinato` | `alto`).
Per ogni spazio comune (3): `slug`, `nome`, `parola` (al posto del prezzo),
`contenuto`.
Per il nastro: orizzonte 240 notti, chiusura 7-28 gennaio, minimo agosto,
massimo 14, disponibilità con seme (direzione 7.6), funzione delle **due proposte
più vicine** (stesso numero di notti, prima dopo e poi prima della selezione,
almeno una stanza libera; filtrata per stanza in S3/P10).

---

## 10. Richieste ad altri agent

- **tech-architect / scaffold**: router a hash con query (1), regole di
  cronologia `push`/`replace` (1), `inert` sul palazzo quando si è dentro, soglia
  dei modi "palazzo intero" / "torre" (2.4) come stato unico letto da tutti,
  `visualViewport` per la tastiera mobile, invio simulato con errore
  riproducibile (`?prova=errore` nell'hash), bozza del pannello in
  `sessionStorage`, `.ics` generato nel client, funzione delle proposte (9).
- **motion-designer**: eventi di movimento ammessi = quelli della direzione (12)
  + comparsa del bottone "Lune" mobile (transform 240 ms) + auto-scorrimento della
  torre al successo; niente altro. Raggruppamento luci ≤ 2 partenze al secondo.
- **copywriter**: tutte le frasi tra virgolette di questo documento sono
  segnaposto; microcopy di tutti gli stati 6.1-6.3; nomi accessibili di celle,
  lune, porte, scala; `h1` e `title`.
- **art-director**: fascia di poché sotto ogni cella che regge il nome e il prezzo
  (altezza che cresce col testo), lastra di poché per la targa dell'androne,
  finestre delle ore, segno di disponibilità per forma sul nastro filtrato.
- **responsive-tester**: controlli obbligatori: 1440 × 900 e 1366 × 768 senza
  scorrimento verticale nel palazzo; 375 × 667 prima schermata con tetto e prima
  stanza; nessun fisso del concept sopra il `ConceptBackButton`; foglio mobile con
  riga d'azioni libera a sinistra; zoom 400% senza fissi che coprono.
- **accessibility-auditor**: la sezione 7 è la lista di collaudo.

---

## Sezioni da costruire

Una per section-builder, in kebab-case. I nomi seguono le schermate del
creative-director (5.3, 7); i file li assegna il tech-architect.

1. **`intestazione-cielo`**: i tre elementi fissi (nome con "le stanze in
   elenco", "Scegli le lune" / "Torna al palazzo" / "Chiudi"), link di salto,
   bottone "Lune" mobile in basso a destra, cielo notte, **luna di stasera** sopra
   il tetto e la sua sostituzione con la luna della prima notte (successo),
   frase di chi siamo sotto il cornicione. Spazio riservato al `ConceptBackButton`.
2. **`palazzo`**: la sezione in CSS 3D a 1440 (pianta 2.2, poché, solai, tetto con
   comignoli, scala a gradini, portico ad archi, marciapiede con la riga "Albergo
   inventato"), le dieci celle-scatola con foto, luce accesa/spenta, "occupata",
   prezzo al passaggio, parallasse ≤ 2°, accensione iniziale; la **torre** a 375
   con binario della scala; il **palazzo ridotto** del foglio lune; roving
   tabindex 7.2.
3. **`stanza`**: dentro una camera: telecamera d'entrata e uscita (FLIP),
   inquadratura a tutto schermo, porte laterali e scala con carrello, seconda
   foto, pannello informativo S0 e stanza occupata S3 con proposte, foglio
   mobile trascinabile, swipe d'uscita, gestione del fuoco, foto mancante.
4. **`spazi-comuni`**: androne (iscrizione, targa delle regole, Chiama/Scrivi),
   colazione (foto, orari, provenienze), portico (a piedi da qui, indirizzo di
   esempio, Apri in Maps), nello stesso contenitore della stanza.
5. **`nastro-lune`**: il nastro di 240 lune con fasi vere (disegno da `luna.ts`),
   trascinamento, tocco + tocco, tastiera listbox, scorrimento e frecce di mese,
   chiusura, filtro per stanza, riga di stato `aria-live`, "Scrivi le date",
   "Svuota", proposte in caso di pieno, stati P0-P13; versioni cielo (desktop),
   fascia in stanza, foglio (mobile).
6. **`pannello-prenotazione`**: notti in parole e "cambia le notti", quanti siete,
   totale e "come è fatto il prezzo", fila delle ore come finestre con il limite
   delle 21, campi, validazione, invio simulato, stati F0-F4, bozza in
   `sessionStorage`, `track("demo_prenotazione")`.
7. **`successo`**: `#/ti-aspettiamo`: spegnimento di tutte le luci tranne la tua
   stanza, frase unica con la luna della prima notte, "Aggiungi al calendario"
   (.ics), "Torna al palazzo" che riaccende; versione torre a 375.
8. **`elenco`**: `#/elenco`: tabella a 1440 e lista a 375, ordinamento per piano o
   prezzo, colonna "Per le tue notti", link agli spazi comuni, "Entra" con
   dissolvenza e ritorno all'elenco.
