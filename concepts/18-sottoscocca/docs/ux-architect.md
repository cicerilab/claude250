# UX architect · Concept 18 · SOTTOSCOCCA, officina e gommista (Pordenone)

Ondata 1. Rotta `/concept-18`. Base vincolante: `docs/creative-director.md`
(variante C, QUOTA). Questo documento decide **struttura, percorsi, ordine di
lettura, geometria delle zone, stati della prenotazione e accessibilità**. Non
decide colori, font, easing o testi definitivi (art-director, motion-designer,
copywriter): le frasi tra virgolette qui sotto sono segnaposto di lunghezza e
di tono, da sostituire. I prezzi citati nei wireframe sono di esempio e li
fissano brand-strategist e copywriter; i **tempi sul ponte** sono quelli della
tabella del creative-director (4.3) e qui diventano regola del planning.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, riga e paragrafo 18 di
`docs/matrice-concept-11-20.md`, `concepts/18-sottoscocca/docs/creative-director.md`,
`concepts/10-torchio/docs/ux-architect.md` (solo formato e livello).

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, niente occhielli numerati, niente maiuscoletto spaziato, **un solo
intento di prenotazione con una sola etichetta: "Trova un buco"**; l'invio si
chiama **"Metti in ponte"**.

---

## 1. Sitemap

SPA a pagina singola. Una rotta, otto schermate con ancora, un link di uscita
(il `ConceptBackButton` condiviso). Le prime quattro schermate sono **quote**
del ponte, non sezioni numerate.

```
/                                   ← Ciceri Lab (uscita: ConceptBackButton condiviso)
└── /concept-18                     SOTTOSCOCCA (pagina unica)
    ├── #quota-0        1  Apertura · 0 cm                    <header> + <section>  (h1)
    ├── #quota-20       2  Gomme · 20 cm                      <section>
    ├── #quota-80       3  Freni e sospensioni · 80 cm        <section>
    ├── #quota-180      4  Il sottoscocca · 180 cm            <section> (pinned)
    ├── #deposito       5  Deposito gomme                     <section>
    ├── #ponte-libero   6  Il ponte libero · prenotazione     <section> (cuore)
    ├── #officina       7  L'officina · dove siamo            <section>
    └── #piede          8  Piede                              <footer>
```

Elementi fissi (sopra il canvas, fuori dalle sezioni):
- **Testata** (marchio piccolo, due link, "Trova un buco");
- **Asta graduata** (`<nav aria-label="Quota del ponte">`), bordo destro;
- **Barra "Il tuo lavoro"** (compare solo quando c'è almeno un lavoro);
- **Scheda del punto** (pannello non modale, una alla volta);
- **Canvas** della scena (fisso, `aria-hidden="true"`, dietro a tutto).

### 1.1 Parametri di ingresso (per post e inserzioni di Luca)

Tutti facoltativi, letti una volta all'avvio, mai riscritti nell'URL dal sito.

| Parametro | Valori | Effetto |
|---|---|---|
| `?lavoro=` | `gomme`, `convergenza`, `pastiglie`, `dischi`, `ammortizzatori`, `tagliando`, `scarico` (più valori separati da virgola) | mette quei lavori nel blocco; la barra "Il tuo lavoro" è già piena |
| `?deposito=` | `si` | con `gomme`: risponde già "sì" alla domanda del deposito (blocco da 30') |
| `?giorno=` | `AAAA-MM-GG` | seleziona quel giorno nella striscia se è tra i 6 mostrati, altrimenti ignorato |
| `#quota-80` ecc. | ancore | scorre alla quota dopo il primo paint (il ponte è già a quell'altezza) |
| `#ponte-libero` | | scorre al planning; il ponte è già giù |

Esempi: inserzione di ottobre sulle gomme invernali
`/concept-18?lavoro=gomme&deposito=si#ponte-libero`; post sui freni
`/concept-18#quota-80`.

### 1.2 Stato che sopravvive al ricaricamento

`localStorage`, sempre in try/catch; se è vuoto o bloccato il sito funziona
uguale.
- lavori scelti (la barra "Il tuo lavoro");
- risposta al deposito e numero deposito;
- **ultima prenotazione riuscita** (giorno, ora, ponte, lavori, numero
  deposito): serve a mostrare il blocco pieno nel planning e la tacca "il tuo
  ponte" sull'asta. **Mai** nome e telefono.
- Nel piede: "Ricomincia da capo" svuota tutto.

---

## 2. Navigazione

### 2.1 Principio

La navigazione è **l'asta graduata**: dice dove sei in centimetri, e toccando
una quota il ponte ci va. Niente menu a panino, niente indice di sezioni. Si
arriva sempre al planning con un tocco ("Trova un buco") e si esce sempre verso
Ciceri Lab (bottone condiviso).

Elementi presenti su ogni larghezza:
1. link di salto nascosti fino al focus: "Salta al contenuto", "Vai al ponte
   libero" (primi due tabulabili, compaiono sotto la zona del bottone di
   ritorno, mai sopra);
2. `ConceptBackButton` (del sito, non nostro);
3. marchio SOTTOSCOCCA (piccolo, porta a `#quota-0`);
4. **"Trova un buco"** → `#ponte-libero`;
5. asta graduata (quote 0, 20, 80, 180 come link).

### 2.2 Convivenza con il ConceptBackButton

Il bottone è `position: fixed`, z-index altissimo, e ha una zona sua che nessun
elemento interattivo del concept può occupare:

| Larghezza | Posizione del bottone | Zona riservata (nessun controllo nostro dentro) |
|---|---|---|
| ≥ 640 px | in alto a sinistra, top 14, left 14 | rettangolo `0,0 → 260 × 72` px |
| < 640 px | in basso a sinistra, bottom 14, left 14 | rettangolo `0, (100svh − 72) → 232 × 72` px, più `env(safe-area-inset-bottom)` |

Conseguenze:
- **Desktop**: la testata comincia a x = 272 px. Il marchio grande
  dell'apertura sta in basso a sinistra (zona libera su desktop).
- **Mobile**: nessun elemento fisso nostro tocca il fondo a sinistra per i
  primi 232 px. La barra "Il tuo lavoro", la scheda del punto e la mensola del
  planning si fermano **72 px sopra il fondo** oppure hanno i loro controlli a
  destra di x = 244 px. Il testo che scorre sotto il bottone è ammesso (è
  contenuto in flusso), i controlli fissi no.
- Il focus non deve mai finire sotto il bottone: ogni elemento tabulabile che
  a scroll fermo cadrebbe nella zona riservata riceve `scroll-margin-bottom:
  88px` (mobile) o `scroll-margin-top: 88px` (desktop).

### 2.3 Desktop (≥ 1024 px, disegnato a 1440)

**Testata**, fissa, alta 64 px. Nell'apertura è trasparente sopra la scena;
appena il pannello della prima quota le passa sotto, prende il fondo nero
grasso pieno (nessuna ombra, nessun filetto: il cambio è di fondo, non una
riga).

```
|[ Torna in Ciceri Lab ]   SOTTOSCOCCA            Deposito   Officina        [ Trova un buco ]|
 ^ bottone del sito,        ^ marchio 18 px,        ^ link testo 16 px        ^ bottone bianco
   zona 0-260 px              x = 272                 (Red Hat 500)             segnaletica, 44 px
                                                                                 margine destro 96 px
                                                                                 (lascia l'asta)
```

- Solo due link di testo: **Deposito** e **Officina**, le due schermate che
  l'asta non misura. Le quote stanno sull'asta; il planning sta nel bottone.
- Link corrente: sottolineato in bianco 2 px e `aria-current="location"`.
- Dentro `#ponte-libero` il bottone "Trova un buco" diventa testo non
  cliccabile "sei sul planning" (niente bottone che porta dove sei già).

**Asta graduata**, fissa sul bordo destro:

```
                                                          ┌──┐
                                                    200 ─ │  │
                                                          │  │ tacche ogni 10 cm
                                                          │  │ (zincato, 8 px)
                                          180 cm  ◀────── ├──┤ quota 180 = link
                                   (indice bianco +       │  │
                                    numero corrente)      │  │
                                                    150 ─ │  │ numeri ogni 50
                                                          │  │ (Tektur)
                                                    100 ─ │  │
                                           80 cm  ◀────── ├──┤ quota 80 = link
                                                          │  │
                                                     50 ─ │  │
                                           20 cm  ◀────── ├──┤ quota 20 = link
                                            0 cm  ◀────── └──┘ quota 0 = link
```

- Posizione: x da 1440 − 72 a 1440 − 24, y da 96 px a `100vh − 48 px`. Scala
  lineare 0-200 cm, lo zero in basso (come il ponte vero).
- I 4 link di quota hanno area di tocco 44 × 44 px, allineata alla tacca; il
  loro nome accessibile è "Ponte a 80 centimetri: freni e sospensioni".
- L'indice (triangolo bianco + numero in Tektur) segue `h` arrotondata ai 5
  cm. Il numero **non** è un link; è testo `aria-hidden` (lo stato vero è
  `aria-current` sul link della quota raggiunta e l'annuncio di plateau, §6.2).
- Dopo una prenotazione riuscita compare una quinta tacca, a sinistra
  dell'asta all'altezza 0: "il tuo ponte: mar 7, 9:10" (link a
  `#ponte-libero`).
- Entrando in `#ponte-libero` l'asta **si ritira** (trasla fuori dal bordo
  destro): il suo linguaggio di tacche passa all'asse orizzontale delle ore del
  planning (§5.6). Riappare tornando su. Nel `#piede` e in `#officina` resta,
  con l'indice a 0.

### 2.4 Mobile (375 px): testata corta, asta sottile, niente menu

**Testata**, fissa, alta 56 px, fondo trasparente sull'apertura e nero grasso
pieno dopo:

```
| SOTTOSCOCCA                       [ Trova un buco ] |
  ^ marchio 16 px, margine 16         ^ bottone 44 px alto, margine destro 16
```

- Nessun link di testo: Deposito e Officina si raggiungono scorrendo, dal piede
  (indice di cinque righe) e da "Trova un buco" per il planning.
- Il bottone di ritorno è in basso a sinistra: la testata è tutta nostra.

**Asta graduata**, fissa a destra, larga 32 px, alta da 72 px a
`100svh − 88 px` (sta sopra la zona in basso, che a destra è libera ma serve
alla barra "Il tuo lavoro"):

```
                    ┌┐ 200
                    ││
          180 ◀──── ├┤  link 44×44 che sporge a sinistra dell'asta
                    ││
                    ├┤ 100 (numeri solo ogni 50)
           80 ◀──── ├┤
                    ││
           20 ◀──── ├┤
            0 ◀──── └┘
```

- Le aree di tocco dei link sporgono a sinistra (44 × 44), le tacche restano
  sottili: non si ruba larghezza al testo, che ha margine destro 48 px quando
  scorre accanto all'asta.
- L'indice mostra il numero corrente a sinistra dell'asta, in un'etichetta
  nero grasso 40 × 24 px.
- In `#ponte-libero` l'asta si ritira come su desktop: la scala delle ore del
  planning verticale prende il suo posto e il suo aspetto (§5.6).

### 2.5 768 px (tablet)

Testata desktop (con Deposito e Officina) da 768 px in su; testata mobile sotto
768. Asta da 40 px. Pannelli delle quote in colonna sinistra larga 52% (come
desktop, §5), planning in orizzontale (come desktop) da 900 px in su, verticale
(come mobile) sotto. Il bottone di ritorno a 768 è in alto a sinistra (≥ 640):
vale la zona riservata desktop.

### 2.6 Salti e focus

- I link (asta, testata, "Trova un buco", piede) usano lo scroll nativo con
  `behavior: smooth` solo senza reduced motion.
- Dopo il salto il focus va all'`h2` della sezione (`tabindex="-1"`), così chi
  usa la tastiera riparte dal punto giusto.
- Un salto verso una quota **porta il ponte a quella quota** (il binario è
  funzione dello scroll): non esiste un "ponte a 80" con la pagina altrove.

---

## 3. Flusso narrativo dello scroll (arco emotivo)

L'arco è quello di una mattina in officina: entri in accettazione, il meccanico
mette la macchina in ponte, la alza, ti chiama sotto, ti fa vedere, poi la
riabbassa e ti dice quando può farla. Il **picco** è il sottoscocca (180 cm,
lo stupore), il **cuore** è il planning (la decisione).

| # | Schermata | Altezza indicativa (desktop / mobile) | Ponte `h` | Emozione | Cosa trattiene | Cosa porta avanti |
|---|---|---|---|---|---|---|
| 1 | Apertura | 100vh / 100svh | 0 → 20 al primo scroll | **curiosità concreta** | l'auto ferma sui bracci, pavimento con le linee; si capisce "officina" in un secondo | il primo scroll la stacca da terra: il gesto si spiega da solo |
| 2 | Gomme · 20 cm | 180vh / pannello + 60svh | plateau 20 | **riconoscimento** ("è quello che mi serve") | le ruote girano libere mezzo giro; misure vere, prezzi, minuti | per chi vuole solo le gomme: "Aggiungi al lavoro" o "Trova un buco" |
| 3 | Freni e sospensioni · 80 cm | 180vh / pannello + 60svh | 20 → 80, plateau 80 | **comprensione** ("ecco perché fischia") | la ruota negli occhi, il disco dietro il cerchio in trasparenza | la domanda "e sotto cosa c'è?" |
| 4 | Il sottoscocca · 180 cm | 320vh con pin / 260svh con pin | 80 → 180, plateau 180 | **stupore, picco** | la pianta del pianale dal basso, tutti i punti toccabili | il lavoro composto con i punti: la barra "Il tuo lavoro" si riempie |
| 5 | Deposito gomme | 110vh / 130svh | resta 180 (la foto copre la scena) | **sollievo pratico** | il cartellino col numero; "le gomme te le teniamo noi" | chi ha già le gomme da noi sa che fa prima |
| 6 | Il ponte libero | ~130vh / ~200svh | 180 → 0 entrando, poi 0 | **decisione, controllo** | la giornata vera dell'officina; il tuo blocco che trova il suo buco | "Metti in ponte" |
| 7 | L'officina | 100vh / 150svh | 0 (scena al 20%) | **radicamento** | foto vere, indirizzo, orari, "Apri in Maps", "Chiama" | chi non vuole prenotare online telefona o passa |
| 8 | Piede | 50vh / 90svh | 0 | **congedo** | crediti veri (Kenney CC0, fotografi), "Un concept di CiceriLab" | ritorno al Lab |

**Regola dei plateau** (per tech-architect e motion-designer): `h` non è legata
a numeri di vh fissi ma alla geometria dei pannelli.
- Salita tra due quote: nel tratto di scroll in cui **nessun pannello di testo
  è in lettura** (desktop: il pannello precedente è uscito dall'alto e il
  successivo non è ancora a metà schermo; mobile: il pannello precedente ha
  superato il 55% superiore).
- Plateau: da quando il bordo alto del pannello della quota raggiunge l'85%
  dell'altezza della finestra a quando il suo bordo basso esce dal 15%
  superiore. Il testo si legge **sempre** con l'auto ferma.
- Apertura: nessun plateau a 0. Il primo scroll alza di qualche centimetro
  subito (0 → 20 lungo i primi 100vh), e questo spiega il gesto senza "Scorri".
- Dopo il pin di 180 cm: `h` resta 180 per tutto il deposito; scende 180 → 0
  nei primi 60vh di `#ponte-libero`, mentre il planning entra dal basso.

Regole di ritmo:
- Tra un pannello e il successivo c'è solo scena: è lì che il ponte si muove.
  Mai due pannelli nella stessa finestra.
- Nessun divisore, nessun filetto. L'unico segno ammesso tra le zone è la
  linea bianca a terra della scena.
- Chi non vuole seguire l'arco ha sempre "Trova un buco" a un tocco (testata) e
  l'asta per saltare di quota.

---

## 4. Tre user journey (dall'arrivo all'invio)

Persone di esempio (i nomi definitivi dei pubblici li dà il brand-strategist;
queste servono a misurare i percorsi).

### 4.1 Chiara, Cordenons, 34 anni · mobile, inserzione di ottobre sulle invernali

Contesto: ha le gomme invernali già nel deposito dell'officina dall'anno
scorso; vuole fare il cambio prima del 15 novembre, di sabato. Arriva da
`/concept-18?lavoro=gomme&deposito=si#ponte-libero`.

1. La pagina si apre direttamente sul planning, il ponte è già giù. Il blocco
   è già composto: "Cambio gomme, già in deposito · 30'". Sotto il blocco il
   campo "Numero deposito" è già visibile (la risposta "sì" c'è).
2. Striscia dei giorni: tocca **sabato** (etichetta "solo gomme, mattina").
   Il planning mostra la mattina, con il ponte 3 libero dalle 9:40.
3. Tocca "Primo buco libero": il blocco va sul ponte 3 alle 9:40. La mensola in
   basso dice "Sab 11, ponte 3, 9:40-10:10" con "10' prima" e "10' dopo".
4. Scrive nome, telefono, numero deposito `D-214`.
5. **"Metti in ponte"**. Il blocco si riempie di bianco; frase di successo con il
   numero di deposito ripetuto.

Interazioni: 4 tocchi (giorno, primo buco, campi, invio). Tempo stimato 60 s.
Rischio: il campo deposito con formato sbagliato (`214`): l'errore lo dice
sotto il campo, il blocco non si perde.

### 4.2 Paolo, Pordenone, 58 anni · desktop, Google "pastiglie freni Pordenone prezzo"

Contesto: la macchina fischia quando frena da una settimana; non sa se sono
pastiglie o dischi. Arriva da Google su `/concept-18` (apertura).

1. Apertura: legge la frase, vede l'auto sul ponte. Scorre: l'auto sale.
2. A 20 cm legge le gomme, non gli interessano; tocca **80** sull'asta.
3. A 80 cm, la ruota negli occhi: tocca il punto **Freni** (o il bottone
   "Freni" nell'elenco della quota). La scheda dice: "fischia quando freni:
   quasi sempre pastiglie; se senti vibrare il pedale, anche i dischi".
   Tempi: pastiglie 1 h, pastiglie e dischi 1 h 30.
4. Aggiunge "Pastiglie e dischi anteriori" (per sicurezza). La barra "Il tuo
   lavoro" compare in basso a sinistra: "Pastiglie e dischi: 1 h 30 sul ponte".
5. Scorre fino a 180 cm per curiosità; tocca **Olio**: è quasi ora del
   tagliando. Lo aggiunge. Barra: "Pastiglie e dischi + tagliando: 3 h sul
   ponte".
6. "Trova un buco" (dalla barra). Il planning mostra giovedì: nessun buco da 3 h
   la mattina; **trascina** il blocco sul ponte 2 alle 14:00. Il ponte 3 si
   attenua al 40% mentre trascina, con scritto "Il ponte 3 fa solo gomme".
7. Lascia il blocco alle 15:20 per sbaglio: dalle 15:20 ci sono solo 2 h 10 fino
   alla chiusura. Stato **"non ci sta"**: il blocco torna all'inizio del buco
   (14:00) tratteggiato, e sotto "Qui dalle 15:20 ci sono 2 h 10, il tuo lavoro
   ne chiede 3. Dalle 14:00 ci sta." con il bottone "Mettilo alle 14:00".
8. Accetta, compila nome e telefono, targa facoltativa. "Metti in ponte".

Interazioni: 9 (è un percorso esplorativo, non minimo). Il valore è che arriva
al planning **sapendo già** perché servono 3 ore.

### 4.3 Gianni, gommista di Sacile · desktop poi mobile, post di Luca su Ciceri Lab

Contesto: è il cliente vero a cui il concept parla. Vuole capire se "il planning
dei ponti" funzionerebbe per la sua officina. Arriva da `/concept-18`.

1. Apertura, scorre fino al sottoscocca senza toccare nulla: guarda il ponte
   salire, verifica che l'auto sia "normale" (non una supercar). Pin a 180 cm:
   passa il mouse sui punti, apre Scarico, chiude con Esc.
2. Clicca "Trova un buco" in testata **senza lavori**: stato vuoto, il blocco è
   parcheggiato a destra con "Cosa facciamo?". Sceglie "Cambio gomme" e poi
   "Convergenza": 1 h 10, ponte 3.
3. Prova a trascinare il blocco sul ponte 1: stato **"ponte sbagliato"**
   ("Le gomme le facciamo sul ponte 3"), il blocco torna nel parcheggio.
4. Sceglie venerdì, che nella striscia è segnato **"pieno"**: il planning lo
   mostra comunque, tutto occupato, con "Venerdì è pieno. Lunedì 10 il ponte 3
   è libero dalle 8:00." e il bottone per andarci.
5. Riapre il concept sul telefono: il lavoro è ancora nella barra
   (localStorage). Planning verticale, mattina; tocca un buco: il blocco ci va.
   Invia con dati finti: successo. Tornando in cima l'asta ha la tacca "il tuo
   ponte".

Interazioni: molte, ma il percorso mostra al cliente vero tutti gli stati che
contano: vuoto, ponte sbagliato, giorno pieno, successo.

### 4.4 Percorso minimo (vincolo del creative-director)

Apertura → **"Trova un buco"** (1) → nel parcheggio sceglie un lavoro (2) →
**"Primo buco libero"** (3) → scrive nome e telefono → **"Metti in ponte"**
(4). Quattro interazioni; lo scrivere nei campi non conta come passaggio
perché non c'è navigazione. Nessuna schermata intermedia, nessun passo
numerato.

---

## 5. Wireframe testuali per schermata

Convenzioni:
- `▓` scena 3D (canvas fisso dietro), `◉` punto toccabile (bottone DOM
  proiettato, 44 px), `[ ]` bottone, `▭` campo, `┆` tratteggio.
- Griglia desktop 1440: margine sinistro 64 px (dopo l'apertura la colonna
  testo parte da 64: la zona del bottone di ritorno è solo in alto, e la
  testata fissa la copre già), colonna testo delle quote **c1-c5** di 12
  (circa 520 px), zona scena c5-c12, asta fuori griglia a destra.
- Mobile 375: margini 16 px, margine destro 48 px quando il testo scorre
  accanto all'asta, pannelli a tutta larghezza dentro i margini.
- **Zone scena** (dove la camera deve inquadrare l'auto e dove possono cadere i
  punti; per webgl-artist e shader-engineer):

| Larghezza | Zona dei punti (in % della finestra) | Motivo |
|---|---|---|
| ≥ 1024 | x 40%-92%, y 12%-90% | a sinistra c'è la colonna dei pannelli, a destra l'asta |
| 640-1023 | x 50%-90%, y 12%-90% | colonna pannelli al 52% |
| < 640 | x 4%-86%, y 10%-54% nelle quote 0-80; y 10%-78% a 180 cm (pin) | sotto scorre il pannello; a destra l'asta; in basso a sinistra il bottone di ritorno |

  Un punto proiettato fuori dalla sua zona non si nasconde: si **aggancia al
  bordo della zona** con una linea di richiamo bianca di 1 px verso il pezzo.
  Un punto dietro un'altra geometria resta visibile (è un bottone DOM, non ha
  occlusione).

### 5.0 Elementi fissi comuni

**Barra "Il tuo lavoro"** (compare al primo lavoro aggiunto, sparisce se si
tolgono tutti):

```
1440, fissa in basso a sinistra, x 64, bottom 24, larga max 560 px, alta 64:
┌─────────────────────────────────────────────────────────────────────┐
│ Il tuo lavoro  Tagliando + pastiglie: 2 h 30 sul ponte  [Modifica] [ Trova un buco ] │
└─────────────────────────────────────────────────────────────────────┘

375, fissa, left 16, right 56 (lascia l'asta), bottom 72 + safe area, alta 56:
┌───────────────────────────────────────┐
│ 2 lavori · 2 h 30     [ Trova un buco ]│
└───────────────────────────────────────┘
```

- Fondo verde ombra, testo bianco. Nessuna icona di carrello o borsa.
- "Modifica" (desktop) / tocco sul testo (mobile) apre un piccolo elenco dei
  lavori con "Togli" per ciascuno (popover non modale, sopra la barra).
- Dentro `#ponte-libero` la barra sparisce: lì il blocco è il tuo lavoro.
- Con la scheda del punto aperta su mobile la barra resta sotto la scheda
  (non visibile); ricompare alla chiusura.

**Scheda del punto** (una sola aperta):

```
1440: pannello a destra della colonna testo, ancorato vicino al punto ma dentro
x 40%-90%, largo 400 px, alto quanto serve (max 70vh, scorre dentro):
┌──────────────────────────────────────┐
│ Freni                      [ Chiudi ]│  h3 + bottone 44×44
│ Cosa guardiamo: pastiglie, dischi,   │
│ liquido.                             │
│ Te ne accorgi se: fischia quando     │
│ freni; il pedale vibra.              │
│                                      │
│ Pastiglie anteriori                  │
│ da 90 € · 1 h sul ponte              │
│ [ Aggiungi al lavoro ]               │  bottone interruttore (aria-pressed)
│                                      │
│ Pastiglie e dischi anteriori         │
│ da 220 € · 1 h 30 sul ponte          │
│ [ Aggiungi al lavoro ]               │
└──────────────────────────────────────┘

375: foglio dal basso, fino al 55% dell'altezza, sopra tutto tranne il bottone
di ritorno; contenuto con padding-bottom 72 px; i bottoni "Aggiungi al lavoro"
sono larghi da x 16 a x 327 ma stanno sopra i 72 px finali:
┌───────────────────────────────────────┐
│ ═══ (maniglia, trascina giù chiude)   │
│ Freni                      [ Chiudi ] │
│ ...stesso contenuto, scorre dentro... │
│ [ Aggiungi al lavoro ]                │
│                                       │ ← 72 px liberi (bottone di ritorno)
└───────────────────────────────────────┘
```

- Aggiunto: il bottone diventa "Nel tuo lavoro ✓ · Togli" (testo, non solo
  colore) e l'annuncio dice "Aggiunto: pastiglie e dischi. Il tuo lavoro: 1 h
  30".
- Scelte che si escludono (pastiglie / pastiglie e dischi; cambio gomme / già
  in deposito) si sostituiscono, e l'annuncio lo dice ("Al posto delle sole
  pastiglie").
- Nella scena il pezzo toccato diventa bianco (solo quello).

**Mappa punti → lavori** (id condivisi tra DOM e nomi dei pezzi 3D):

| Id punto | Nome | Quota in cui compare | Lavori (tempo sul ponte) | Ponte |
|---|---|---|---|---|
| `ruota-ant` | Gomme | 20, 180 | Cambio gomme con equilibratura (40'); se in deposito 30' | 3 |
| `ruota-post` | Convergenza | 20, 180 | Convergenza (30') | 3 |
| `freni` | Freni | 80, 180 | Pastiglie anteriori (1 h) · Pastiglie e dischi anteriori (1 h 30) | 1 o 2 |
| `sospensioni` | Sospensioni | 80, 180 | Coppia ammortizzatori (2 h) | 1 o 2 |
| `olio` | Olio e filtri | 180 | Tagliando (1 h 30) | 1 o 2 |
| `scarico` | Scarico | 180 | Silenziatore e controllo scarico (1 h) | 1 o 2 |

Regola del ponte: **solo gomme e convergenza → ponte 3**. Se nel lavoro c'è
anche un solo lavoro di meccanica, tutto va sul **ponte 1 o 2** (le gomme si
cambiano lì). Durata del blocco = somma dei tempi.

### 5.1 Apertura · 0 cm (`#quota-0`)

**1440**

```
|[bottone ritorno]  SOTTOSCOCCA    Deposito  Officina              [ Trova un buco ]   |
|                                                                                  ┌┐  |
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ││  |
|  ▓   ponte a due colonne verde, auto di tre quarti sui bracci, pavimento nero  ▓  ││  |
|  ▓   con le linee bianche della postazione. Camera ad altezza d'uomo.          ▓  ││  |
|  ▓   L'auto occupa x 38%-88%, y 22%-78%.                                       ▓  ││  |
|  ▓                                                                             ▓  ├┤ ◀ 0 cm
|                                                                                  └┘  |
|  SOTTOSCOCCA                    ← h1, Tektur molto grande, c1-c6, bottom 22vh      |
|  officina e gommista, Pordenone ← una riga, Red Hat 17 px                          |
|  "Te la alziamo davanti e ti facciamo vedere cosa c'è sotto."  ← frase, max 40 car.|
|  [ Trova un buco ]              ← unico bottone, bianco segnaletica, 56 px          |
|  lun-ven 8-12:30, 14-18:30      ← NO: gli orari non stanno qui (erano del bocciato)|
```

- `h1` = il marchio con la descrizione ("SOTTOSCOCCA, officina e gommista a
  Pordenone" come nome accessibile completo). Nessun altro titolo.
- **Un solo bottone.** Niente orari, niente riga di numeri, niente secondo
  bottone a contorno.
- La testata è trasparente qui; il suo "Trova un buco" è **nascosto
  finché il bottone dell'apertura è visibile** (mai due "Trova un buco" in
  vista insieme), con `visibility`, non solo opacità, così non riceve focus.
- Primo paint: fermo immagine WebP della scena a 0 cm dietro al testo (è anche
  l'LCP); il canvas lo sostituisce quando ha disegnato il primo frame.

**375**

```
| SOTTOSCOCCA                   [ Trova un buco ] |  ← testata 56, il bottone
|                                              ┌┐|    di testata qui è nascosto
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││|    (c'è quello dell'apertura),
|  ▓ auto di tre quarti stretta, camera       ▓ ││|    resta il marchio
|  ▓ "portrait": l'auto sta in y 12%-50%,     ▓ ││|
|  ▓ ponte e colonne visibili interi          ▓ ││|
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ├┤ 0
|                                              └┘|
|  SOTTOSCOCCA          ← h1 Tektur, riempie     |
|  officina e gommista,    la larghezza utile     |
|  Pordenone               (fino a x 327)         |
|  "Te la alziamo davanti e ti facciamo          |
|   vedere cosa c'è sotto."                      |
|  [ Trova un buco ]   ← largo 100% utile, 56 px  |
|                                                |
|[bottone ritorno]                               |  ← zona riservata: il blocco
```

- Il blocco testo finisce **sopra** i 72 px del bottone di ritorno a 375 × 667:
  controllo obbligatorio del responsive-tester.
- A 375 × 667 il bottone "Trova un buco" deve essere tutto visibile senza
  scorrere.

### 5.2 Gomme · 20 cm (`#quota-20`)

**1440**

```
|  ┌──────────────── pannello c1-c5 (verde ombra) ───────┐   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ├┤ ◀ 20 cm |
|  │ 20 cm                    ← Tektur enorme (display)  │   ▓ auto staccata da   ▓      |
|  │ Gomme                    ← h2                        │   ▓ terra, ruote che  ▓      |
|  │ due righe: cambio stagionale, 4 stagioni, cosa si    │   ▓ fanno mezzo giro  ▓      |
|  │ guarda (battistrada, data sul fianco).               │   ▓  ◉ Gomme          ▓      |
|  │                                                      │   ▓  (ruota ant.)     ▓      |
|  │ Misura         Montaggio + equil.   Tempo            │   ▓        ◉ Convergenza      |
|  │ 195/65 R15     40 €                 40'              │   ▓        (ruota post.)      |
|  │ 205/55 R16     48 €                 40'              │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      |
|  │ 225/45 R17     60 €                 40'              │                             |
|  │ (tabella vera, tabular-nums, caption a parole)       │                             |
|  │ Convergenza 45 € · 30'                               │                             |
|  │ Deposito: vedi più sotto (link #deposito)            │                             |
|  │                                                      │                             |
|  │ Da qui si vede:  [ Gomme ]  [ Convergenza ]          │  ← elenco della quota:      |
|  └──────────────────────────────────────────────────────┘    stessi bottoni dei punti |
```

- La cifra "20 cm" è grande ma **non** è l'`h2`: è `aria-hidden`, e l'`h2` è
  "Gomme, a 20 centimetri da terra" (visibile solo "Gomme").
- Tabella HTML vera (`<table>` con `<caption>`), non una griglia di div.
- L'elenco "Da qui si vede" è visibile a tutti, non solo al lettore di
  schermo. Apre le stesse schede dei punti.

**375**

```
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ├┤ 20|  ← scena libera (55% alto)
|  ▓   ◉ Gomme                              ▓ ││  |    mentre il pannello sale
|  ▓            ◉ Convergenza               ▓ ││  |
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││  |
|  ┌──────── pannello (in flusso, sale) ─────┐ ││  |
|  │ 20 cm         Gomme                     │ └┘  |
|  │ testo                                   │     |
|  │ 195/65 R15      40 €     40'            │  tabella a 3 colonne strette;
|  │ 205/55 R16      48 €     40'            │  sotto 360 px diventa elenco
|  │ 225/45 R17      60 €     40'            │  "205/55 R16: 48 €, 40 minuti"
|  │ Da qui si vede: [Gomme] [Convergenza]   │
|  └─────────────────────────────────────────┘
```

- Il pannello è **in flusso**, non fisso: sale sopra la metà bassa della scena
  mentre il ponte è fermo a 20 (plateau), ed esce dall'alto prima che il ponte
  riparta. Così su mobile il testo può essere lungo quanto serve, senza
  scroll annidati.
- Il pannello ha margine destro 48 px (asta).

### 5.3 Freni e sospensioni · 80 cm (`#quota-80`)

Stessa struttura della quota 20, contenuto diverso.

**1440**

```
|  ┌──── pannello c1-c5 ────────────────────────┐   ▓▓▓ camera ad altezza mozzo ▓▓ ├┤ ◀ 80 |
|  │ 80 cm                                      │   ▓  ruota anteriore in grande,  ▓     |
|  │ Freni e sospensioni   (h2)                 │   ▓  cerchio al 35%: dietro      ▓     |
|  │ Freni: cosa guardiamo, ogni quanto,        │   ▓  disco e pinza               ▓     |
|  │   prezzo da, tempo sul ponte               │   ▓     ◉ Freni (pinza)          ▓     |
|  │ Sospensioni: idem                          │   ▓            ◉ Sospensioni     ▓     |
|  │ "Se fischia, se tira da una parte, se      │   ▓              (molla/ammort.) ▓     |
|  │  senti ogni buca": tre segnali a parole    │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      |
|  │ Da qui si vede: [ Freni ] [ Sospensioni ]  │                                        |
|  └────────────────────────────────────────────┘                                        |
```

- Due blocchi `h3` (Freni, Sospensioni) nel pannello, ognuno con: cosa
  guardiamo, ogni quanto (in km o anni), prezzo da, tempo sul ponte.
- Nessuna tabella di prezzi lunga: i dettagli sono nelle schede.

**375**: come 5.2; la ruota riempie la metà alta della finestra, i due punti
distano almeno 64 px tra loro.

### 5.4 Il sottoscocca · 180 cm (`#quota-180`), la schermata firma

Sezione alta 320vh (desktop) / 260svh (mobile) con uno **stadio fisso**
(`position: sticky; top: 0; height: 100svh`) dentro. Il ponte arriva a 180
nella prima parte, poi resta fermo: il resto dell'altezza è tempo per toccare
i punti.

**1440**

```
|[ritorno]  SOTTOSCOCCA   Deposito  Officina                         [ Trova un buco ]|
|  ┌──── c1-c4 ───────────────────┐  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ├┤ ◀ 180 |
|  │ 180 cm                       │  ▓ vista dal basso, quasi zenitale: il pianale ▓   |
|  │ Il sottoscocca   (h2)        │  ▓ lungo in orizzontale, muso a sinistra       ▓   |
|  │ una frase: "Qui sotto c'è    │  ▓  ◉ Gomme                     ◉ Convergenza  ▓   |
|  │ quasi tutto quello che       │  ▓      ◉ Freni   ◉ Olio e filtri              ▓   |
|  │ paghi. Tocca un pezzo."      │  ▓  ◉ Sospensioni        ════ ◉ Scarico ═══    ▓   |
|  │                              │  ▓ etichette sempre visibili accanto ai punti  ▓   |
|  │ Da qui si vede:              │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      |
|  │ [Gomme] [Convergenza]        │                                                     |
|  │ [Freni] [Sospensioni]        │     scheda del punto aperta: a destra, dentro       |
|  │ [Olio e filtri] [Scarico]    │     x 40%-90%, dalla parte opposta al pezzo         |
|  │ ogni bottone con tempo: "1 h"│                                                     |
|  └──────────────────────────────┘                                                     |
|  [ Il tuo lavoro: ...  Trova un buco ]  ← barra in basso a sinistra (se piena)        |
```

- Tutti e sei i punti, con etichetta di testo sempre visibile.
- Ordine dei punti nel DOM e nella tabulazione: davanti → dietro (Gomme,
  Freni, Sospensioni, Olio e filtri, Scarico, Convergenza sul posteriore).
- Il pannello è dentro lo stadio fisso (non scorre durante il pin). Deve stare
  in 100vh a 1440 × 800: se non ci sta (zoom, finestra bassa) il pin si toglie
  (§6.9).

**375**

```
| SOTTOSCOCCA                   [ Trova un buco ] |
|                                              ┌┐ |
|  ▓▓▓▓▓▓▓ pianale in VERTICALE, muso in alto ▓ ├┤180
|  ▓   ◉ Gomme             ◉ (ruota dx)       ▓ ││ |
|  ▓        ◉ Freni                           ▓ ││ |
|  ▓   ◉ Sospensioni  ◉ Olio e filtri         ▓ ││ |
|  ▓            ║                             ▓ ││ |
|  ▓            ║ ◉ Scarico                   ▓ ││ |
|  ▓   ◉ Convergenza                          ▓ ││ |
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ └┘ |
|  ┌──────── striscia fissa nello stadio ─────┐    |  y dal 80% al fondo − 72 px
|  │ 180 cm  Il sottoscocca · tocca un pezzo  │    |
|  └──────────────────────────────────────────┘    |
|[ritorno]                                          |
```

- A 375 lo stadio contiene solo la scena, i punti (y 10%-78%) e una striscia
  con quota e titolo. Il testo lungo e l'elenco "Da qui si vede" (6 bottoni in
  due colonne da 44 px) vengono **dopo il pin**, in flusso.
- Distanza minima tra due punti: 56 px da centro a centro. Se la proiezione li
  avvicina di più, il secondo si sposta sul bordo della zona con linea di
  richiamo (regola di §5).

### 5.5 Deposito gomme (`#deposito`)

**1440**

```
|  ┌──────────── FOTO vera, c1-c8, alta 78vh ───────────────┐   c9-c12:            ├┤ 180 |
|  │ scaffalatura di gomme, trattamento verso il verde,     │   Deposito gomme (h2)       |
|  │ nessuna cornice, nessuna didascalia sovrapposta        │   "Le gomme della stagione  |
|  │                                                        │    le teniamo noi."         |
|  │                                                        │   Quanto costa: 50 € a      |
|  └────────────────────────────────────────────────────────┘   stagione (esempio)        |
|                                                                Come funziona: 3 righe   |
|                                              ┌────────────┐                            |
|                                              │  D-214     │ ← il cartellino: numero in |
|                                              │ la tua targa│   Tektur grande, bianco su |
|                                              └────────────┘   nero, come scritto a mano|
|                                                "Se sono già da noi il cambio dura     |
|                                                 30 minuti invece di 40."               |
|                                                [ Aggiungi il cambio gomme ]            |
```

- La foto copre la scena (il ponte resta a 180 dietro, non si vede): è la
  prima volta che la pagina esce dal 3D, e deve essere netta, non una
  dissolvenza lenta.
- Il bottone "Aggiungi il cambio gomme" aggiunge il lavoro `ruota-ant` e
  risponde già "sì" alla domanda del deposito? **No**: aggiunge il cambio e
  basta; la domanda resta al planning (chi legge del deposito non per forza ce
  l'ha).
- Nessun secondo "Trova un buco" qui (la testata lo ha già): la conversione del
  deposito è "Aggiungi".
- `alt` della foto descrittivo; testo che non finge che sia "il nostro
  deposito" se è stock.

**375**: foto a tutta larghezza (margini 0), alta 56svh; sotto, in flusso,
titolo, testo, cartellino (largo 60% utile), bottone largo.

### 5.6 Il ponte libero (`#ponte-libero`), il cuore

Entrando: il ponte scende 180 → 0 nei primi 60vh, il canvas si allontana e
sale, poi resta al 20% di opacità sotto il planning. L'asta si ritira.

**1440**

```
|  Il ponte libero (h2)                                                                     |
|  "Scegli il giorno, metti il tuo lavoro in un buco. La lunghezza è il tempo vero."        |
|                                                                                          |
|  striscia dei giorni (radiogroup, 6 giorni, 96×72 ciascuno):                             |
|  [ lun  6 ] [ mar  7 ] [ mer  8 ] [ gio  9 ] [ ven 10  pieno ] [ sab 11  solo gomme ]    |
|                                                                                          |
|  asse ore (tacche ogni 10', numeri ogni ora, il linguaggio dell'asta coricato):          |
|        8    9    10   11   12  │chiuso│ 14   15   16   17   18                            |
|  ┌──────────────────────────────────────────────────────────────┐  ┌── parcheggio ───┐  |
|  │Ponte 1 · 2 colonne ·│▓tagliando▓│┆┆┆┆┆┆┆┆│▓▓gomme▓▓│ │chiuso│ │  │ Cosa facciamo?  │  |
|  │  3500 kg            │           │ libero  │         │ │      │ │  │ [Cambio gomme]  │  |
|  │                     │           │ 9:10-   │         │ │      │ │  │ [Convergenza]   │  |
|  ├─────────────────────────────────────────── ─ ─ ─ ─ ─ ─ ─ ─ ──┤  │ [Pastiglie]     │  |
|  │Ponte 2 · 2 colonne │ ... │  │ [Pastiglie e    │  |
|  │  3500 kg            │                                        │  │   dischi]       │  |
|  ├──────────────────────────────────────────────────────────────┤  │ [Ammortizzatori]│  |
|  │Ponte 3 · forbice ·  │ ... │  │ [Tagliando]     │  |
|  │  3000 kg (gomme)    │                                        │  │ [Scarico]       │  |
|  └──────────────────────────────────────────────────────────────┘  │ ┌┆┆┆┆┆┆┆┆┆┆┆┆┐  │  |
|    etichette corsie c1-c2 (200 px); corsie alte 88 px;             │ ┆ il tuo     ┆  │  |
|    scala: circa 1,5 px al minuto (10' = 15 px)                      │ ┆ lavoro     ┆  │  |
|                                                                    │ └┆┆┆┆┆┆┆┆┆┆┆┆┘  │  |
|  Buchi compatibili di martedì 7 (elenco di bottoni):               │ [Primo buco     │  |
|  [ Ponte 1, 9:10-11:00 ] [ Ponte 2, 14:00-16:40 ] [ ... ]           │   libero]       │  |
|                                                                    └─────────────────┘  |
|  zona dei dati (compare quando il blocco è piazzato, sotto il parcheggio, c10-c12):      |
|  "Martedì 7, ponte 2, 14:00-16:30"                                                       |
|  Le tue gomme sono già da noi?  ( ) Sì  ( ) No   ← solo se c'è il cambio gomme           |
|  Numero deposito ▭  "Una D e tre cifre, è sul cartellino"                                |
|  Nome ▭   Telefono ▭   Targa o modello (facoltativo) ▭   Nota (facoltativa) ▭            |
|  [ Metti in ponte ]                                                                       |
|  zona messaggi (aria-live)                                                               |
```

Geometria desktop: planning c1-c9 (circa 860 px utili dopo le etichette),
parcheggio e dati c10-c12 (circa 300 px), sticky in alto a 88 px mentre il
planning è in vista, così il blocco e il bottone d'invio sono sempre vicini.
Pausa pranzo: fascia fissa di 40 px con scritto "chiuso", non in scala (non è
un buco e non si può occupare). Scala: 540' in circa 820 px, 10' ≈ 15 px; il
blocco più corto (30') è largo circa 45 px, alto 88: bersaglio sufficiente.

**375** (tempo in verticale, ponti in colonne)

```
| SOTTOSCOCCA                      sei sul planning |  ← testata: il bottone è testo
|  Il ponte libero (h2)                            |
|  una riga                                         |
|  striscia giorni, scorre di lato, scroll-snap:    |  sticky sotto la testata
|  [lun 6][mar 7][mer 8][gio 9][ven 10 ▸            |  mentre il planning è in vista
|                                                   |
|  ┌─ parcheggio ──────────────────────────────┐    |
|  │ Cosa facciamo?                            │    |
|  │ [Cambio gomme] [Convergenza] [Pastiglie]  │    |  bottoni a capo, 44 px
|  │ [Pastiglie e dischi] [Ammortizzatori]     │    |
|  │ [Tagliando] [Scarico]                     │    |
|  │ ┌┆┆┆ Tagliando · 1 h 30 ┆┆┆┐              │    |
|  │ [ Primo buco libero ]                     │    |
|  └───────────────────────────────────────────┘    |
|  [ Mattina ] [ Pomeriggio ]  ← due bottoni (aria-pressed)
|        P1         P2         P3                   |  intestazioni colonne:
|   8:00 ┌────────┐┌────────┐┌────────┐             |  "Ponte 1", "Ponte 2",
|        │▓tagl.▓ ││┆libero┆││▓gomme▓│             |  "Ponte 3 gomme"
|   9:00 │▓▓▓▓▓▓▓ ││┆8:00- ┆││▓▓▓▓▓▓ │             |
|        │┆libero┆││┆10:30 ┆││┆libero┆│             |
|  10:00 │┆9:10- ┆││        ││┆      ┆│             |
|        ...                                         |
|  12:30 └────────┘└────────┘└────────┘             |
|  scala ore a sinistra (44 px) con le tacche        |
|  dell'asta; colonne 96 px; 1,5 px/min: mezza       |
|  giornata = 405 px, sta in una finestra            |
|                                                   |
|  Buchi compatibili di martedì 7: [bottoni]        |
|  (zona dati, come desktop, in colonna)             |
|  [ Metti in ponte ]  ← largo, sopra la zona       |
|                         del bottone di ritorno     |
```

- **Mattina / Pomeriggio**: a 375 si vede mezza giornata alla volta, così
  l'agenda sta tutta in una finestra (56 testata + 72 giorni + 405 planning).
  "Primo buco libero" sceglie da solo la metà giusta. Il blocco non attraversa
  mai la pausa, quindi non serve vedere le due metà insieme.
- **Mensola** (solo < 900 px, solo quando il blocco è piazzato e il planning è
  in vista): striscia fissa in basso, da x 16 a x 359, a 72 px dal fondo
  (bottone di ritorno), alta 56:
  `mar 7 · P2 · 9:10-10:40   [10' prima] [10' dopo]` con i due bottoni a
  destra di x 244. Sparisce quando i campi dei dati sono in vista (non serve
  e coprirebbe il bottone d'invio) e quando la tastiera è aperta
  (`visualViewport`).
- Il parcheggio a 375 sta **sopra** il planning (come da direzione).

**Regole del planning (per chi costruisce)**

| Regola | Valore |
|---|---|
| Giorni | i prossimi 6 giorni lavorativi (lun-sab); oggi incluso se c'è almeno un buco di 30' che parte dopo "adesso + 60'" |
| Orari | lun-ven 8:00-12:30 e 14:00-18:30; sabato 8:00-12:30 solo ponte 3 (ponti 1 e 2 mostrati "chiuso") |
| Passo | 10 minuti |
| Blocco | non attraversa la pausa né la chiusura; non si sovrappone a un blocco occupato |
| Ponte adatto | solo gomme/convergenza → ponte 3; qualunque meccanica → ponte 1 o 2 |
| Dati di esempio | generati con seme per data (stessi buchi per lo stesso giorno a ogni visita), giornate diverse tra loro, almeno un giorno "pieno" su sei e almeno un giorno con un buco di 3 h sui ponti 1-2 |
| Orari passati | oggi, prima di "adesso + 60'": fascia "passato" come occupata, senza testo di lavoro |
| Blocchi occupati | solo il tipo di lavoro ("tagliando", "gomme"), mai nomi o targhe |

### 5.7 L'officina · dove siamo (`#officina`)

**1440**

```
|  ┌──── FOTO 1, c1-c7, 70vh ───────────┐                                   ├┤ 0 |
|  │ ponte con auto, officina ordinata   │   L'officina (h2)                         |
|  └─────────────────────────────────────┘   indirizzo di esempio, Pordenone          |
|                  ┌── FOTO 2, c5-c9, 40vh, sfalsata in basso ──┐                    |
|                  │ attrezzatura / pavimento con le linee       │  Orari (dl):       |
|                  └─────────────────────────────────────────────┘  lun-ven 8-12:30,  |
|                                                                   14-18:30         |
|                                                                   sab 8-12:30 gomme|
|                                              [ Chiama ]  [ Apri in Maps ]           |
```

- Composizione asimmetrica, non una griglia di schede. Nessun ritratto della
  squadra, nessuna mappa disegnata: "Apri in Maps" è un link alla mappa vera.
- "Chiama" è un link `tel:` con numero di esempio **non mostrato in vista**
  (regola del copywriter: recapiti come link).
- Due link di pari peso qui sono ammessi: non sono prenotazione (quella è solo
  "Trova un buco").

**375**: foto 1 a tutta larghezza (48svh), testo, orari, due link larghi 44
px uno sotto l'altro, foto 2 in fondo al 70% della larghezza allineata a
destra (non sotto la zona del bottone di ritorno).

### 5.8 Piede (`#piede`, `<footer>`)

```
|  SOTTOSCOCCA · officina e gommista (esempio)        Indice:                  |
|  Attività inventata: nomi, prezzi e recapiti        0 cm   20 cm   80 cm      |
|  sono di esempio.                                   180 cm  Deposito          |
|  Modello 3D: Kenney, Car Kit (CC0)                  Ponte libero  Officina    |
|  Foto: autore, Unsplash (link veri)                                           |
|  Un concept di CiceriLab                            Ricomincia da capo        |
```

- L'indice del piede è l'unico elenco completo delle schermate (serve a chi è
  arrivato in fondo e al telefono, che non ha i link in testata).
- "Ricomincia da capo" svuota localStorage e riporta in cima con il ponte a 0
  (conferma a parole in `aria-live`, nessuna finestra di conferma).
- A 375 l'ultimo link del piede deve stare sopra i 72 px del bottone di
  ritorno: padding-bottom 96 px.

---

## 6. Stati della prenotazione ("Il ponte libero")

Tutti gli stati, con cosa si vede, cosa si annuncia e dove va il focus.
L'errore non usa mai il rosso: si dice a parole, vicino a dove succede, con il
tratteggio.

### 6.1 Stati del blocco e del planning

| # | Stato | Quando | Cosa si vede | Annuncio (`aria-live="polite"`) | Focus |
|---|---|---|---|---|---|
| P0 | **Prima del montaggio** (prerender) | HTML statico, prima dell'idratazione | titolo, riga, parcheggio con i lavori come bottoni disabilitati, spazio del planning riservato alla sua altezza (niente CLS) con scritto "Il planning si carica" e sotto "Oppure chiamaci" (`tel:`) | nessuno | nessuno |
| P1 | **Vuoto** | nessun lavoro scelto | planning del primo giorno con buchi, blocco parcheggiato tratteggiato con "Cosa facciamo?" e i lavori come bottoni | nessuno | invariato |
| P2 | **Composto, non piazzato** | almeno un lavoro | blocco tratteggiato nel parcheggio con lavori e durata ("Tagliando + pastiglie · 2 h 30"); "Primo buco libero" attivo; buchi compatibili del giorno in elenco sotto il planning; nel planning i buchi troppo corti restano senza tratteggio attivo | "Il tuo lavoro: 2 ore e 30 sul ponte 1 o 2. 3 buchi adatti martedì." | invariato |
| P3 | **Trascinamento** (puntatore) | blocco afferrato | blocco segue il puntatore; ombra di aggancio tratteggiata dove cadrebbe (passo 10'); corsie non adatte al 40% con il perché scritto in corsia; sotto l'ombra: "ci sta" / "non ci sta: 50 minuti liberi" | nessuno durante il gesto (troppi) | resta sul blocco |
| P4 | **Piazzato** | rilasciato in un buco valido, o "Primo buco libero", o tocco su un buco, o bottone dell'elenco | blocco con contorno bianco pieno 2 px dentro la corsia, testo "il tuo lavoro · 9:10-11:40"; appare la zona dati; su mobile la mensola | "Ponte 2, martedì 7, dalle 9:10 alle 11:40. Libero." | resta sul blocco (tastiera) o invariato (puntatore) |
| P5 | **Non ci sta** | rilasciato su un buco troppo corto | il blocco torna **all'inizio del buco** tratteggiato; sotto: "Qui ci sono 50 minuti, il tuo lavoro ne chiede 90. Il ponte 2 è libero dalle 14:10." + [Mettilo lì] | la stessa frase | sul bottone [Mettilo lì] |
| P6 | **Ponte sbagliato** | rilasciato su una corsia non adatta | il blocco torna dov'era (parcheggio o posizione precedente); in corsia: "Le gomme le facciamo sul ponte 3." oppure "Il ponte 3 fa solo gomme." | la stessa frase | sul blocco |
| P7 | **Fuori orario** | rilasciato sulla pausa o oltre la chiusura | torna al punto valido più vicino **prima** della pausa/chiusura se ci sta, altrimenti come P5; "A pranzo il ponte si ferma: il tuo lavoro finisce alle 12:30 se parti alle 11:00." | la frase | sul blocco |
| P8 | **Giorno pieno** | giorno con "pieno" nella striscia, scelto | planning mostrato comunque, tutto occupato; sopra: "Venerdì 10 è pieno. Lunedì 13 il ponte 3 è libero dalle 8:00." + [Vai a lunedì 13] | la frase | invariato |
| P9 | **Sabato con meccanica** | sabato scelto e nel lavoro c'è meccanica | ponti 1 e 2 "chiuso"; "Il sabato facciamo solo gomme. Per il tagliando il primo buco è lunedì 13 alle 8:00." + [Vai a lunedì 13] | la frase | invariato |
| P10 | **Troppo lungo** | durata > 4 h 30 (non sta in mezza giornata) | blocco nel parcheggio con "4 h 30 è il massimo in mezza giornata"; due scelte: "Togli un lavoro" (apre l'elenco) oppure [Lascia l'auto per la giornata] che trasforma il blocco in "giornata intera" (va solo su un ponte 1-2 libero dalle 8:00 alle 12:30, si ritira in serata) | la frase | sulla prima scelta |
| P11 | **Nessun buco nei 6 giorni** | caso limite dei dati | "In questi sei giorni non c'è un buco da 3 h. Lasciaci il numero: ti chiamiamo noi con una data." La zona dati compare senza orario; invio = richiesta senza orario | la frase | sul campo Nome |
| P12 | **Lavoro cambiato dopo il piazzamento** | aggiunto/tolto un lavoro con il blocco già piazzato | se ci sta ancora: il blocco si allunga/accorcia sul posto; se non ci sta più: come P5 dal suo inizio; se cambia il ponte adatto: torna nel parcheggio con "Ora serve il ponte 1 o 2" | la frase | invariato |
| P13 | **Cambio giorno con blocco piazzato** | tocco su un altro giorno | il blocco torna nel parcheggio (composto), il nuovo giorno si carica | "Mercoledì 8: 2 buchi adatti." | invariato |
| P14 | **Tutti i lavori tolti** | ultimo "Togli" | torna P1 | "Il tuo lavoro è vuoto." | sul primo lavoro del parcheggio |

### 6.2 Deposito gomme (solo se nel lavoro c'è il cambio gomme)

| # | Stato | Cosa si vede |
|---|---|---|
| D0 | domanda | "Le tue gomme sono già da noi?" radio Sì / No, nessuna scelta di default; durata calcolata a 40' finché non si risponde |
| D1 | Sì | campo "Numero deposito" (formato sotto: "Una D e tre cifre, es. D-214"); il blocco si accorcia a 30' (con P12 se era piazzato) |
| D2 | No | frase: "Ti diamo noi un numero quando porti le gomme"; blocco a 40' |
| D3 | numero non valido | sotto il campo: "Il numero di deposito è una D e tre cifre, lo trovi sul cartellino." (all'uscita dal campo e all'invio) |
| D4 | successo con No | il numero assegnato di esempio compare **scritto sul blocco**, come il cartellino, e nella frase di successo |

### 6.3 Dati e invio

| # | Stato | Cosa si vede | Annuncio | Focus |
|---|---|---|---|---|
| F0 | dati nascosti | prima di P4 (o P11): la zona dati non c'è; "Metti in ponte" non c'è (non un bottone disabilitato senza motivo) | | |
| F1 | dati in compilazione | Nome, Telefono obbligatori; Targa o modello, Nota facoltativi; etichette sopra, formato sotto | | |
| F2 | errori campi | sotto il campo: "Serve un nome per sapere chi cercare", "Serve un numero di telefono per richiamarti"; all'uscita dal campo e all'invio, mai a ogni tasto | all'invio: "Due cose da sistemare: nome, telefono." | al primo campo con errore |
| F3 | **invio in corso** | il blocco passa da contorno a pieno bianco in 400 ms ("sale sul ponte"); il bottone diventa "Invio..." con `aria-disabled` (non `disabled`: resta focalizzabile) | "Invio in corso." | invariato |
| F4 | **successo** | il blocco resta **pieno nel planning**; accanto una frase: "Fatto. Martedì 7 alle 9:10 sul ponte 2. Ti chiamiamo per confermare entro sera." (+ numero deposito); la zona dati si chiude; compare [Prenota un altro lavoro]; sull'asta (tornando su) la tacca "il tuo ponte: mar 7, 9:10"; `track("demo_prenotazione", …)` qui e solo qui | la frase | sulla frase (`tabindex="-1"`) |
| F5 | **invio fallito** | il blocco torna tratteggiato **nella stessa posizione** (il buco non si perde); sotto il bottone: "Non è partito. Riprova, o chiamaci." con [Riprova] e il link [Chiama] | la frase | su [Riprova] |
| F6 | ritorno dopo successo (ricarica) | il planning del giorno prenotato mostra il blocco pieno; il parcheggio dice "Hai già un lavoro in ponte martedì 7 alle 9:10" + [Prenota un altro lavoro] | nessuno | invariato |
| F7 | prenota un altro | svuota i lavori e riporta a P1; la prenotazione precedente resta pieno nel planning (occupata) | "Pronto per un altro lavoro." | sul primo lavoro |

Invio **simulato** (nessun backend): ritardo di 900 ms; F5 riproducibile con
`?invio=errore` e senza rete (`navigator.onLine === false`), così il QA lo
vede. La richiesta senza orario (P10 giornata intera, P11) usa gli stessi F3-F5
con frasi sue.

### 6.4 Modi di piazzare il blocco (tutti equivalenti, tutti portano a P4)

1. **Trascinare** (puntatore fine, ≥ 900 px): afferra, trascina, rilascia.
2. **Toccare un buco** (touch e mouse): il blocco va all'inizio del buco se ci
   sta, altrimenti P5.
3. **Primo buco libero**: primo buco compatibile del giorno scelto, altrimenti
   del giorno dopo, e lo dice ("Martedì è pieno per 3 h: ti ho messo mercoledì
   8 alle 8:00").
4. **Elenco dei buchi compatibili** sotto il planning: bottoni "Ponte 2,
   9:10-11:40".
5. **Tastiera** sul blocco (§7.7).
6. **Touch, trascinamento** solo dopo pressione prolungata di 400 ms sul
   blocco (`touch-action: none` solo sul blocco afferrato); il semplice
   scorrere col dito sul planning scorre la pagina.
7. Rifinitura: "10' prima" / "10' dopo" (mensola mobile, e sotto il blocco su
   desktop come link piccoli).

---

## 7. Accessibilità (per ogni interazione)

### 7.1 Base di pagina

- Punti di riferimento: `header` (testata), `nav aria-label="Quota del
  ponte"` (asta), `main` (sezioni 1-7), `footer` (piede). Un solo `h1`
  (apertura), un `h2` per schermata, `h3` per blocchi interni (Freni,
  Sospensioni, voci della scheda). `lang="it"` sul wrapper.
- Link di salto "Salta al contenuto", "Vai al ponte libero".
- Il DOM è la fonte: ogni prezzo, tempo, punto, buco esiste come testo. Canvas
  `aria-hidden="true"`, i punti proiettati sono `button` veri con nome
  ("Freni: apri prezzi e tempi").
- Focus visibile ovunque: contorno bianco 2 px a 3 px di distanza; su fondo
  bianco (il bottone principale, il blocco pieno) contorno nero grasso 2 px
  più alone bianco esterno, così si vede su ogni fondo.
- Tocco minimo 44 × 44 px ovunque (giorni, 10' prima/dopo, punti, link
  dell'asta). Bottoni principali 56 px.
- Nessun testo corrente su verde macchina pieno (contrasto 4,3:1): i pannelli
  sono su verde ombra.
- Nessuna informazione solo nel colore: il blocco del visitatore è bianco
  **e** dice "il tuo lavoro"; i buchi sono tratteggiati **e** hanno l'orario
  scritto; il pezzo evidenziato nella scena ha anche la scheda aperta a
  parole; le corsie non adatte sono attenuate **e** dicono perché.
- Niente lampeggi: nessun cambio di luminosità oltre 3 volte al secondo;
  qualsiasi cambio di colore di grandi superfici al massimo uno ogni 500 ms;
  neon mai sfarfallanti; evidenziazione del pezzo in 250 ms.

### 7.2 Alza il ponte (scroll)

- È scroll nativo: nessuno scroll-jacking, nessuna velocità alterata, nessun
  Lenis globale. Le frecce, Pagina giù, Spazio e la rotella funzionano come in
  ogni pagina.
- Il cambio di quota è annunciato **solo al plateau** in una regione
  `aria-live="polite"` dedicata: "Ponte a 80 centimetri: freni e
  sospensioni." Mai i centimetri intermedi. Nessun annuncio se il plateau è
  raggiunto con un salto dell'asta (lì l'utente ha già scelto e il focus va
  all'`h2`).
- Il numero corrente accanto all'indice è `aria-hidden`.

### 7.3 Asta graduata (navigazione)

- `nav` con 4 link (`<a href="#quota-80">`), nome completo; `aria-current=
  "location"` sulla quota del plateau corrente (nessuno durante la salita:
  resta l'ultima raggiunta).
- Ordine di tabulazione: subito dopo la testata (l'asta è navigazione
  principale).
- La tacca "il tuo ponte" è un quinto link, presente solo dopo F4.

### 7.4 Punti toccabili

- Ogni quota ha i suoi punti in un gruppo (`role="group"`, etichetta "Pezzi
  a 80 centimetri"); un solo punto del gruppo è nella tabulazione (roving
  tabindex); frecce sinistra/destra e su/giù si muovono tra i punti del gruppo
  in ordine davanti → dietro; Home/Fine al primo/ultimo; Invio o Spazio aprono
  la scheda.
- I punti di una quota non ancora raggiunta sono `hidden` (non solo
  trasparenti), così non si tabula su bottoni invisibili. Nel pin a 180 ci sono
  tutti e sei.
- Stato attivo: `aria-expanded="true"` + `aria-controls` verso la scheda.
- L'elenco "Da qui si vede" di ogni quota è l'alternativa sempre visibile,
  con gli stessi nomi e le stesse schede. Chi usa il lettore di schermo può
  usare solo quello.
- Hover (puntatore fine): l'etichetta compare e il pezzo si evidenzia; mai
  informazioni disponibili solo all'hover.

### 7.5 Scheda del punto

- `role="dialog"` **non modale**, `aria-labelledby` sull'`h3`. All'apertura il
  focus va all'`h3` (`tabindex="-1"`). Esc e "Chiudi" chiudono e riportano il
  focus al punto (o al bottone dell'elenco) che l'ha aperta.
- Aprire un'altra scheda chiude la precedente (una sola alla volta).
- Mobile: il foglio si chiude anche trascinando giù la maniglia; la maniglia è
  decorativa (`aria-hidden`), "Chiudi" c'è sempre.
- "Aggiungi al lavoro": `button` con `aria-pressed`; testo che cambia ("Nel
  tuo lavoro, togli"); annuncio della durata totale dopo ogni cambio.
- Uscire dalla scheda con Tab: il focus prosegue nel contenuto dopo il punto
  (la scheda è nel DOM subito dopo il gruppo dei punti).

### 7.6 Barra "Il tuo lavoro"

- `region` con etichetta "Il tuo lavoro"; il riepilogo è testo semplice
  (non live: gli annunci li fa chi aggiunge). "Modifica" è un bottone con
  `aria-expanded` che apre un elenco con "Togli" per voce; Esc chiude e rende il
  focus a "Modifica".
- Non deve mai coprire il focus: tutti gli elementi focalizzabili hanno
  `scroll-margin-bottom` pari all'altezza della barra + 16 px mentre la barra
  è visibile.

### 7.7 Planning

- **Striscia dei giorni**: `radiogroup` "Giorno"; radio con nome completo
  ("Venerdì 10, pieno"; "Sabato 11, solo gomme, mattina"); frecce per muoversi,
  la scelta avviene con la freccia (comportamento standard dei radio) ma il
  caricamento del giorno è istantaneo e senza spostare il focus.
- **Il blocco**: `button` focalizzabile, nome "Il tuo lavoro: tagliando e
  pastiglie, 2 ore e 30", `aria-describedby` verso le istruzioni visibili sotto
  il planning ("Con la tastiera: frecce sinistra e destra spostano di 10
  minuti, su e giù cambiano ponte, Pagina su e giù cambiano giorno, Invio
  conferma"). Niente `role="application"`.
  - Nel parcheggio: Invio lo mette nel primo buco (come "Primo buco libero").
  - Piazzato: frecce ←/→ ±10' (su mobile: ↑/↓ per il tempo e ←/→ per il ponte,
    coerente con l'orientamento; le istruzioni cambiano con il layout), su/giù
    cambiano ponte (saltando quelli non adatti, annunciandolo), PagSu/PagGiù
    cambiano giorno, Home/Fine inizio/fine del buco corrente, Invio conferma
    e porta il focus al primo campo dei dati, Esc riporta al parcheggio.
  - Ogni spostamento annuncia: "Ponte 2, dalle 9:10 alle 11:40, libero" oppure
    "occupato dalle 10:30: non ci sta".
- **Corsie**: ogni corsia è una lista (`ul` "Ponte 1, due colonne, 3500 kg")
  di intervalli ("8:00-9:10, tagliando, occupato"; "9:10-11:00, libero,
  bottone"). I buchi liberi compatibili sono `button`; quelli troppo corti sono
  testo ("9:10-9:40, libero, troppo corto per il tuo lavoro").
- **Elenco dei buchi compatibili**: alternativa senza gesti, sempre visibile
  sotto il planning (P2-P4).
- **Trascinamento**: mai l'unico modo (WCAG 2.5.7); lo si può annullare
  portando il blocco fuori dal planning o premendo Esc durante il gesto
  (torna dov'era). L'azione avviene al rilascio (2.5.2).
- **Mattina / Pomeriggio** (mobile): due `button` con `aria-pressed`.

### 7.8 Campi e invio

- Etichette visibili sopra, formato e errori sotto collegati con
  `aria-describedby`, `aria-invalid` sugli errati. Niente placeholder come
  etichetta.
- `autocomplete="name"`, `autocomplete="tel"` + `inputmode="tel"`; targa
  `autocapitalize="characters"`; deposito `inputmode="text"` con formato
  accettato anche senza trattino e minuscolo (`d214` → `D-214`).
- Corpo 17 px nei campi (niente zoom automatico su iOS).
- "Metti in ponte" è un `button type="submit"` normale (niente tieni premuto).
  Durante l'invio `aria-disabled` e testo "Invio...".
- Dopo F4 il focus va alla frase di successo; dopo F5 a "Riprova".

### 7.9 Reduced motion (`prefers-reduced-motion: reduce`)

- Il ponte **scatta** tra le quote al plateau (0, 20, 80, 180) con dissolvenza
  incrociata di 200 ms tra due inquadrature ferme. Ruote ferme. Nessun volo di
  camera.
- Sezione 180 cm **senza pin**: una sezione normale con la vista dal basso
  ferma.
- Scroll dei link senza `smooth`.
- Discesa verso il planning: salto diretto a 0, canvas già al 20%.
- Scheda, foglio mobile, barra, mensola: compaiono senza traslazione
  (dissolvenza ≤ 150 ms o niente).
- Blocco: si aggancia senza scivolare; "sale sul ponte" all'invio diventa
  cambio immediato da contorno a pieno.
- Il sito resta completo: nessun contenuto dipende da un'animazione.

### 7.10 Zoom 400% e finestre basse (reflow)

A 1440 × 900 con zoom 400% la finestra è 360 × 225 px CSS. Regole:
- La larghezza < 640 attiva già il layout mobile (e il bottone di ritorno va in
  basso a sinistra).
- **Altezza < 520 px CSS** (zoom, telefono in orizzontale): modalità "bassa".
  - Testata non fissa (in flusso in cima).
  - Asta ridotta a un solo indicatore fisso 44 × 44 in alto a destra con la
    quota corrente ("80"); i link di quota restano nel piede e nell'elenco.
  - Nessun pin: la sezione 180 cm è normale.
  - Barra "Il tuo lavoro" e mensola non fisse: diventano in flusso (la barra in
    cima al parcheggio del planning).
  - La scheda del punto si apre **in linea** sotto l'elenco della quota
    (disclosure), non come foglio fisso.
  - Il planning resta orizzontale o verticale secondo la larghezza, e scorre
    con la pagina; niente elementi sticky.
- Testo ingrandibile al 200% senza perdita; nessun testo in immagine; nessun
  contenitore ad altezza fissa con testo dentro.
- Nessuno scroll orizzontale della pagina a 320 px CSS; l'unica fila che
  scorre di lato è la striscia dei giorni, con scroll-snap e tutti i giorni
  raggiungibili da tastiera.

### 7.11 Fallback senza WebGL

- Stessa pagina, stesse quote, stessa asta; al posto del canvas foto vere (o
  fermi immagine) a tutto schermo, cambiate con dissolvenza di 300 ms al
  plateau (con reduced motion: cambio netto).
- Punti sulle foto in coordinate percentuali; dove non si possono posizionare
  bene, c'è solo l'elenco della quota (che c'è sempre).
- Nessun messaggio "il tuo browser non supporta": la pagina non deve sembrare
  rotta.

---

## 8. Conversione

**Un solo intento, una sola etichetta: "Trova un buco"** (→ `#ponte-libero`).

| Posizione | Parte con | Note |
|---|---|---|
| Apertura | lavori da URL o localStorage, altrimenti vuoto | unico bottone dell'apertura |
| Testata (fissa) | come sopra | nascosto mentre si vede quello dell'apertura; "sei sul planning" dentro il planning |
| Barra "Il tuo lavoro" | lavori composti con i punti | il percorso che converte meglio: arrivi sapendo il tempo |
| Piede (indice) | come sopra | come voce "Ponte libero" |

Nelle schede dei punti **non** c'è "Trova un buco": c'è "Aggiungi al lavoro", e
la barra porta al planning. Due richiami diversi nello stesso posto
confonderebbero.

**Conversione principale**: invio dal planning ("Metti in ponte").

**Conversioni alternative**: "Chiama" (`tel:` di esempio, in officina, in P0 e
in F5), "Apri in Maps" (officina), richiesta senza orario (P10, P11).

**Micro-conversioni**: il sito vero ha un `TrackEvent` chiuso. Si tracciano
solo:
- `track("apri_concept", { concept: 18 })` al montaggio;
- `track("demo_prenotazione", { concept: 18, lavori: "tagliando+pastiglie",
  minuti: 150, ponte: 2, metodo: "trascina" | "tocco" | "primo-buco" |
  "elenco" | "tastiera", origine: "punti" | "planning" | "url", deposito:
  "si" | "no" | "nessuno", senzaOrario: boolean })` in F4, una volta per invio.
Nessun altro evento.

**Gancio che converte**: il tempo sul ponte è detto **prima** del planning, in
ogni scheda; il prezzo "da" è sempre visibile senza lasciare dati. Il planning
mostra buchi veri: l'utente sceglie, non chiede.

**Per Luca (meta-conversione)**: il gommista che guarda deve pensare "questa è
la mia lavagna dei ponti". Il piede firma "Un concept di CiceriLab".

---

## 9. Consegne ad altri agent

- **tech-architect / scaffold**: `h` derivata dalla geometria dei pannelli
  (regola dei plateau, §3), un solo listener passivo; proiezione dei punti con
  aggancio al bordo della zona (§5, tabella zone); parametri URL (§1.1);
  localStorage in try/catch (§1.2); `visualViewport` per la mensola; modalità
  "bassa" sotto 520 px di altezza (§7.10); invio simulato con `?invio=errore`
  e offline (§6.3); planning renderizzato solo al montaggio con altezza
  riservata (P0).
- **webgl-artist / shader-engineer**: quattro chiavi di camera per due aspetti
  (landscape e portrait) che rispettano le **zone dei punti** di §5; nomi dei
  pezzi = id dei punti (`ruota-ant`, `ruota-post`, `freni`, `sospensioni`,
  `olio`, `scarico`); fermi immagine a 0/20/80/180 per poster e fallback.
- **motion-designer**: movimenti ammessi oltre a quelli della direzione:
  ritiro dell'asta entrando nel planning (e ritorno), comparsa della barra e
  della mensola (traslazione verticale), foglio della scheda su mobile. Tutti
  con la versione reduced motion di §7.9.
- **interaction-designer**: trascinamento del blocco (soglia di presa 400 ms su
  touch), aggancio a 10', attenuazione delle corsie non adatte, tastiera del
  blocco (§7.7), roving tabindex dei punti (§7.4).
- **copywriter**: tutte le frasi degli stati P0-P14, D0-D4, F0-F7; nomi
  accessibili dei punti, dei giorni, del blocco; istruzioni da tastiera del
  planning (due versioni: orizzontale e verticale); prezzi "da" per ogni
  lavoro; tabella misure gomme; frase dell'apertura.
- **accessibility-auditor**: §7 è la checklist di collaudo; più: focus mai
  sotto il bottone di ritorno, sotto la barra o sotto la mensola.
- **responsive-tester**: controlli obbligatori: "Trova un buco" dell'apertura
  visibile a 375 × 667 e sopra la zona del bottone di ritorno; punti mai sotto
  pannelli, asta o bottone di ritorno; mezza giornata del planning visibile in
  una finestra a 375 × 667; mensola che non copre "Metti in ponte"; ultimo link
  del piede sopra il bottone di ritorno.

---

## 10. Sezioni da costruire

Una per section-builder, in kebab-case. I nomi coincidono con le schermate del
creative-director; i tre elementi fissi condivisi (asta, testata, scheda,
barra) sono assegnati a due builder dedicati perché servono a più schermate.

1. **`asta-testata`** · Elementi fissi di navigazione: testata (marchio,
   Deposito, Officina, "Trova un buco" con le regole di visibilità), link di
   salto, asta graduata desktop e mobile (tacche, indice, 4 link di quota con
   `aria-current`, ritiro nel planning, tacca "il tuo ponte"), regione
   `aria-live` degli annunci di plateau, indicatore compatto della modalità
   "bassa". §2, §7.2, §7.3, §7.10.
2. **`apertura`** · Quota 0 (`#quota-0`): `h1` marchio, riga, frase, unico
   bottone "Trova un buco", fermo immagine WebP come poster/LCP sotto il
   canvas. §5.1.
3. **`gomme`** · Quota 20 (`#quota-20`): pannello con cifra "20 cm", `h2`,
   testo, tabella delle misure (con variante a elenco sotto 360 px),
   convergenza, rimando al deposito, elenco "Da qui si vede". §5.2.
4. **`freni-sospensioni`** · Quota 80 (`#quota-80`): pannello con due `h3`
   (Freni, Sospensioni), segnali a parole, ogni quanto, prezzo da, tempo sul
   ponte, elenco "Da qui si vede". §5.3.
5. **`sottoscocca`** · Quota 180 (`#quota-180`): sezione con stadio sticky
   (pin), pannello o striscia secondo la larghezza, elenco dei sei pezzi dopo il
   pin su mobile, disattivazione del pin con reduced motion e altezza bassa.
   §5.4.
6. **`punti-lavoro`** · Livello dei punti proiettati (bottoni DOM per quota,
   roving tabindex, aggancio al bordo della zona, linee di richiamo), **scheda
   del punto** (dialog non modale, foglio su mobile, "Aggiungi al lavoro" con
   scelte che si escludono), **barra "Il tuo lavoro"** con "Modifica/Togli",
   dati dei lavori (id, durate, ponte adatto). Usato dalle quote 20, 80, 180 e
   dal deposito. §5.0, §7.4-7.6.
7. **`deposito`** · `#deposito`: foto vera che copre la scena, testo, costo a
   stagione, cartellino col numero in Tektur, "Aggiungi il cambio gomme".
   §5.5.
8. **`ponte-libero`** · `#ponte-libero`: striscia dei giorni, planning dei tre
   ponti orizzontale (desktop) e verticale con Mattina/Pomeriggio (mobile),
   dati di esempio con seme per data, parcheggio "Cosa facciamo?", blocco
   (trascina, tocca, primo buco, elenco, tastiera), mensola mobile, domanda
   del deposito, campi, invio simulato, **tutti gli stati** P0-P14, D0-D4,
   F0-F7, `track("demo_prenotazione")`. §5.6, §6, §7.7, §7.8.
9. **`officina-piede`** · `#officina` + `<footer id="piede">`: composizione
   asimmetrica di 2 foto, indirizzo, orari (`dl`), "Chiama" e "Apri in Maps";
   piede con nota "attività inventata", crediti Kenney CC0 e fotografi, "Un
   concept di CiceriLab", indice delle schermate, "Ricomincia da capo". §5.7,
   §5.8.

---

## Richieste ad altri agent

- **tech-architect**: la tabella dei file esclusivi usi i nove nomi sopra;
  `punti-lavoro` e `asta-testata` hanno bisogno nello store di: `h` corrente,
  quota di plateau, lista lavori, prenotazione riuscita, scheda aperta, stato
  "modalità bassa". Il deposito e il planning leggono/scrivono la lista lavori
  solo tramite store.
- **brand-strategist**: confermare o sostituire le tre persone di §4 e i
  prezzi "da" dei wireframe (qui sono solo di lunghezza).
