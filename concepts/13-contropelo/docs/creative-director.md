# Creative director · Concept 13 · Barbiere (Pordenone)

Ondata 0. Rotta `/concept-13`. Cartella `concepts/13-contropelo/`. Documento di
direzione per tutti gli agent delle ondate successive: quello che è scritto sotto
"La direzione scelta nel dettaglio" è vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 13, paragrafo 13,
verifica incrociata, regole comuni), `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 0, 1, 4, 9), `concepts/10-torchio/docs/creative-director.md` (solo come
riferimento di livello e formato), screenshot `docs/concept-attuali/concept-13.jpg`.

La direzione di partenza è assegnata dalla matrice del Lab (CONTROPELO: specchio
appannato, listino a pennarello sul vetro, tre specchi = tre poltrone, vapore da
pulire col dito, "La lista sullo specchio"). Questo documento la sviluppa, la
raffina e ne sceglie l'esecuzione. Palette, font, struttura, interazione firma e
prenotazione restano quelli della matrice.

---

## 0. Da dove si parte

**Il bocciato TRE POLTRONE** (screenshot): fondo crema, blu notte e rosso,
slab serif pesante con una parola rossa, occhiello spaziato "BARBIERE · VIA ... ·
DAL 1961", riga di tre numeri tra due filetti ("In fila adesso 8 · Attesa 28 min
· 3 su 3"), due bottoni (pieno rosso + contorno), foto di poltrona in pelle
marrone in cornice a destra con didascalia "TAV. I", poi sezione "01" col
"tabellone". È la ricetta bocciata al completo, più il palo a strisce nel logo.

**Cosa non può essere il nuovo 13**: né crema, né blu + rosso, né slab serif, né
split testo/foto, né fila live con minuti di attesa, né tabellone, né "barber
vintage" (pelle marrone, lampadine a filamento, oro, whisky). Non può somigliare
a 12 SOTTOPELLE (nero caldo + rosso, parete infinita, inchiostro che sboccia), né
a 7 CONTROLUCE (galleria in nero assoluto), né a 5 FORGIA CLUB (quasi nero +
viola), né a IMPRONTA (carta colorata, rilievo, luce radente, leva "tieni
premuto").

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina commerciale di una barberia di
quartiere a Pordenone per uomini di ogni età che vogliono sapere prezzi, barbiere
e un orario libero, con un linguaggio fisico e quotidiano (il vetro, il vapore,
il pennarello), leaning toward un'unica superficie a schermo intero: foto vera
del salone vista come riflesso + maschera di vapore in Canvas 2D + scrittura a
mano in DOM, senza scroll di pagina e senza WebGL.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **8** | Struttura nata dall'oggetto (lo specchio, la parete con tre specchi), niente colonne né sezioni. Non 9-10: il cliente tipo è un uomo di 50 anni col telefono che deve trovare il prezzo della barba in tre secondi. |
| `MOTION_INTENSITY` | **4** | L'unico movimento "da solo" è il vapore che si riforma, lento e monotono. Il resto lo fa l'utente (pulire, passare da uno specchio all'altro, scrivere). Niente coreografie, niente reveal, niente parallasse. |
| `VISUAL_DENSITY` | **3** | Su uno specchio si scrive poco: cinque righe di listino, un nome, una lista di mezz'ore. Il vetro respira. |

---

## 2. La metafora sviluppata

**Lo specchio del barbiere** è l'unico posto del salone che il cliente guarda
per tutto il tempo. Ci si parla attraverso lo specchio: il barbiere ti guarda
nel riflesso, tu guardi lui. In molte barberie di provincia sullo specchio ci
sono scritte a pennarello bianco: il prezzo della barba, "chiuso lunedì", i nomi
di chi ha appuntamento. Poi arriva l'asciugamano caldo per la rasatura e il
vetro si appanna; il barbiere ci passa sopra il palmo e il riflesso torna.

Da qui tre livelli, uno sull'altro, che sono tutta l'identità del sito:

1. **Il riflesso** (in fondo): la foto vera del salone, specchiata
   orizzontalmente come in uno specchio vero, raffreddata e scurita. È "quello
   che hai alle spalle mentre sei seduto": la poltrona accanto, il barbiere che
   lavora, le mensole.
2. **Il pennarello** (sul vetro): testo DOM vero in Mansalva bianco
   `#FAFAF6`, scritto sul vetro. Listino, orari, la lista del giorno.
3. **Il vapore** (sopra): una velatura grigio-verde `#CDD5D4` in Canvas 2D che
   copre riflesso e pennarello. Col dito o col mouse la pulisci, e dietro
   compaiono il salone e le scritte. Poi torna, lentamente, come torna sul vetro
   vero.

**Il nome**: *contropelo* è la seconda passata del rasoio, quella contro il
verso del pelo, che rifinisce. Il gesto di pulire il vapore è la stessa cosa: una
passata che rivela. Il nome si capisce in Friuli senza spiegazioni e non è un
gioco di parole da startup.

**Il turchese** `#2A9D96` è il liquido disinfettante in cui stanno immersi
pettini e forbici sul bancone: ogni cliente l'ha visto, nessuno lo nomina. Nel
sito è l'unico colore, e ha un solo significato: **"qui c'è posto / qui tocca a
te"** (i buchi liberi nella lista, la sottolineatura del tuo nome, il fuoco da
tastiera, il barbiere attivo).

**Le tre poltrone**: tre specchi appesi alla stessa parete, uno accanto
all'altro. Ogni specchio è una poltrona, con il suo barbiere, il suo riflesso,
il suo vapore e la sua lista del giorno. Si passa da uno specchio all'altro come
si gira la testa sulla poltrona.

---

## 3. Tre varianti di esecuzione della stessa direzione

Le tre varianti hanno tutte palette, font, vapore e lista sullo specchio della
matrice. Cambia come è fatta la parete e come si passa da una poltrona all'altra.

### Variante A · LA PARETE

- **Cosa si vede**: lo schermo è la parete del salone (grafite scura). Uno
  specchio occupa quasi tutto lo schermo; ai due lati si vedono i bordi degli
  specchi vicini (6% della larghezza su desktop, 12 px su mobile), con il loro
  vapore. Si capisce subito che ce ne sono altri.
- **Passare di poltrona**: la parete scorre di lato (pan orizzontale, 650 ms,
  easing che frena), come girare la testa. Si comanda dalla mensola sotto lo
  specchio (i tre nomi), dalle frecce da tastiera o toccando il bordo dello
  specchio vicino.
- **Contenuto**: ogni specchio porta una cosa diversa scritta a pennarello
  (listino, barba e rasatura, dove e quando) più la lista del giorno del suo
  barbiere.
- **Forza**: una sola idea spaziale, chiarissima; il vapore di ogni specchio
  ha una sua memoria (quello pulito prima è ancora un po' pulito quando ci
  torni). Si costruisce in un giorno.
- **Rischio**: il pan orizzontale su mobile litiga con il gesto di pulire: va
  deciso che sul vetro un dito pulisce e basta (vedi 5.3).

### Variante B · UN RIFLESSO SOLO

- **Cosa si vede**: un unico specchio fisso a tutto schermo, niente parete.
  Scegliere un altro barbiere cambia il riflesso dietro al vetro: il vapore si
  rifà da capo e dietro compare un'altra poltrona.
- **Forza**: massima pulizia, lo specchio è davvero "tutto".
- **Perché la scarto**: si perde il "tre poltrone uno accanto all'altro",
  che è l'unica informazione spaziale del mestiere (è un salone con tre posti,
  non un'app). Ogni cambio di barbiere ricopre di vapore quello che avevi
  pulito: frustrante. E visivamente scivola verso "foto a tutto schermo con
  testo sopra", che 2, 5 e 7 hanno già.

### Variante C · LO SPECCHIETTO

- **Cosa si vede**: lo specchio grande resta appannato; l'utente muove uno
  specchietto a mano ovale (quello con cui il barbiere ti fa vedere la nuca)
  che mostra, come una lente, il salone e le scritte dietro.
- **Forza**: oggetto verissimo del mestiere, gesto elegante.
- **Perché la scarto**: è una lente che segue il cursore, un pattern
  consumato su Awwwards; sposta il gesto firma dal "pulire" (assegnato dalla
  matrice e unico nel Lab) al "guardare attraverso", che è vicino alla parete
  esplorata di 12 SOTTOPELLE. Su 375 px la lente copre il dito e il testo.
  Lo specchietto non entra nel sito, nemmeno come decorazione.

### La scelta: A · LA PARETE

1. È l'unica delle tre che dice senza parole "tre poltrone, tre barbieri, una
   parete": il salone è una stanza, e il sito lo fa sentire.
2. Tiene il gesto della matrice intatto e lo rende più ricco: il vapore ha
   memoria per specchio, e la lista del giorno è **di quel barbiere**, scritta
   sul suo specchio. La prenotazione nasce dalla struttura, non è una sezione
   in più.
3. È distante da tutti: nessun altro concept è una parete con oggetti uguali
   affiancati che si guarda girando la testa (11 è un tavolo visto dall'alto,
   12 una parete infinita libera, 17 un bancone che scorre, 20 un palazzo in
   sezione in cui si entra).
4. Tecnicamente è la più sobria: un canvas 2D attivo alla volta, tre foto,
   testo DOM. Costruibile e leggera su un telefono di cinque anni fa.

---

## 4. La direzione scelta nel dettaglio: sistema visivo

### 4.1 Palette (dalla matrice, più due neutri derivati)

| Ruolo | Hex | Uso |
|---|---|---|
| Specchio | `#232A2C` | colore del vetro pulito; velatura sopra la foto; testo sul vapore |
| Vapore | `#CDD5D4` | solo il vapore (Canvas) e l'alone fermo sui bordi in riduzione del movimento |
| Turchese | `#2A9D96` | unico accento: posti liberi, tuo nome sottolineato, fuoco, barbiere attivo, bottone principale |
| Pennarello | `#FAFAF6` | tutto ciò che è scritto sul vetro; testo sulla mensola |
| Parete (derivato) | `#171C1D` | la parete tra gli specchi, la fascia alta, la mensola |
| Bisello (derivato) | `#48555A` | il bordo smussato degli specchi (1 px luce + 1 px ombra), linee sottili funzionali |

Regole:
- Tutto freddo, grafite verdastra. Nessun marrone, nessun oro, nessun crema,
  nessun rosso, nessun bianco puro, nessun nero puro.
- Contrasti verificati a tavolino (da riverificare in QA): pennarello su
  specchio ≈ 14:1; specchio su vapore ≈ 9:1; turchese su specchio ≈ 4,4:1,
  quindi **turchese mai per testo sotto i 24 px** (o 19 px bold): solo segni,
  bordi, fuoco, sottolineature, fondo del bottone con testo specchio sopra
  (≈ 4,4:1 per il testo: il bottone usa testo Figtree 600 a 18 px, oppure
  il turchese si schiarisce a `#34B1A9` solo come fondo del bottone; decide
  l'art-director misurando).
- La foto dietro al vetro è sempre sotto una velatura `#232A2C` al 62-72% e
  desaturata del 40%: il pennarello deve restare ≥ 7:1 su ogni punto della foto.
- Un solo tema (scuro). Niente modo chiaro: lo specchio è quello.

### 4.2 Tipografia

- **Limelight** (display, 400): solo l'insegna "Contropelo" sulla fascia alta
  della parete e i tre nomi dei barbieri sulla mensola. È il lettering dei
  vetri sabbiati e delle insegne dei saloni di una volta, senza essere slab
  né serif da rivista. Mai per frasi, mai sotto i 20 px.
- **Mansalva** (pennarello): **tutto ciò che è scritto sul vetro** e solo
  quello: voci e prezzi del listino, orari, la lista del giorno, il tuo nome.
  Corpo minimo 22 px su mobile, 26-34 px su desktop. Mai per etichette di
  interfaccia, errori, testi legali.
- **Figtree** (400/500/600): interfaccia sulla mensola, etichette dei campi,
  messaggi di errore e di conferma, testo alternativo lungo. 16-17 px,
  interlinea 1.5.
- Niente maiuscoletto spaziato, niente occhielli, niente numerazioni "01",
  niente monospace, niente corsivi.

### 4.3 Forme e materia

- Specchi rettangolari a spigolo vivo con bisello di 2 px (luce in alto a
  sinistra, ombra in basso a destra); nessun raggio sugli specchi. Controlli
  sulla mensola: raggio 0 anche loro. Unica eccezione: il segno di fuoco
  attorno a un posto libero nella lista, che è un tratto di pennarello tondo
  (è una scritta, non un componente).
- Nessuna ombra portata, nessuna card, nessun vetro smerigliato CSS
  (`backdrop-filter`) al posto del vapore: il vapore è il canvas.
- Nessuna illustrazione: niente forbici, rasoi, baffi, pali a strisce, sagome.
  Icone funzionali (se servono) da Phosphor, tratto sottile, colore pennarello.

---

## 5. Struttura vera della pagina

Un solo schermo, **niente scroll di pagina** (`100dvh`). Tre livelli
orizzontali fissi:

```
┌──────────────────────────────────────────────┐
│ fascia alta (parete): insegna Contropelo      │  56 px desktop / 48 px mobile
├───┬──────────────────────────────────────┬───┤
│ ▌ │                                      │ ▐ │  bordo dello specchio vicino
│ ▌ │   SPECCHIO ATTIVO                    │ ▐ │
│ ▌ │   riflesso (foto) + pennarello + vapore │ ▐ │
│ ▌ │                                      │ ▐ │
├───┴──────────────────────────────────────┴───┤
│ mensola: [Mattia] [Denis] [Samir]  ·  Specchio pulito  ·  Scrivi il tuo nome │  88 px / 84 px
└──────────────────────────────────────────────┘
```

(I nomi dei barbieri sono proposte; il copywriter li fissa. Niente nomi
generici, niente cognomi completi dei clienti nella lista: "Luca B.", "Enrico P.")

### 5.1 La fascia alta
Parete `#171C1D`. Insegna "Contropelo" in Limelight 28 px (22 px mobile) in
pennarello, allineata a destra su desktop (a sinistra c'è il
`ConceptBackButton` condiviso), centrata su mobile. Accanto, in Figtree 14 px,
"barberia, Pordenone". Nient'altro: niente menu (i "menu" sono gli specchi).

### 5.2 I tre specchi (il contenuto vero)
Ogni specchio ha due facce di contenuto a pennarello: **il vetro** (cosa c'è
scritto normalmente) e **la lista** (gli appuntamenti del giorno di quel
barbiere). Su desktop convivono (vetro a sinistra ~55%, lista a destra ~32%,
spazi asimmetrici, come scritte fatte a mano in momenti diversi, con rotazioni
di -1,5° / +0,8°). Su mobile si alternano (vedi 9).

1. **Specchio 1 · Mattia · "Il listino"**
   Riflesso: il salone visto dalla prima poltrona (poltrone in fila, mensola).
   Pennarello: le voci con prezzo di esempio verosimile (taglio 22, taglio e
   barba 34, barba 16, rasatura con panno caldo 20, bambini fino a 12 anni 15,
   macchinetta un'altezza 15), in colonna, con i prezzi allineati a destra
   come li scrive un barbiere. Una riga su Mattia (da quanto taglia, cosa fa
   meglio), scritta piccola in basso.
2. **Specchio 2 · Denis · "La barba"**
   Riflesso: una rasatura in corso (panno caldo o schiuma, cliente uomo).
   Pennarello: come funziona la rasatura tradizionale (panno caldo, pennello,
   rasoio a lama, contropelo, dopobarba) in quattro righe brevi, con i tempi.
   Una riga su Denis.
3. **Specchio 3 · Samir · "Dove e quando"**
   Riflesso: l'ingresso o la vetrina dall'interno.
   Pennarello: orari (martedì-venerdì 8:30-12:30 e 14:30-19, sabato 8-17,
   domenica e lunedì chiuso: di esempio), indirizzo di esempio a Pordenone
   (non via Cavallotti 12 del bocciato), telefono di esempio, link "Apri in
   Maps" (vera mappa esterna, mai disegnata). Una riga su Samir.

Lista del giorno: su **ogni** specchio, perché ogni poltrona ha i suoi
appuntamenti (vedi 7).

### 5.3 La mensola
Parete `#171C1D`, 88 px (84 px mobile), sotto gli specchi. È l'interfaccia
sempre leggibile, mai coperta dal vapore:
- **I tre barbieri** in Limelight 20 px: `role="tablist"`, il barbiere attivo
  ha sotto un tratto turchese di 3 px (non un pallino). Cambiare barbiere =
  pan della parete.
- **"Specchio pulito"**: interruttore (`aria-pressed`) che toglie il vapore e
  lo ferma (vedi 6.4). Icona Phosphor + testo.
- **"Scrivi il tuo nome"**: l'unico richiamo alla prenotazione di tutto il
  sito. Fondo turchese, testo specchio, spigolo vivo. Porta la lista in primo
  piano e mette il fuoco sul primo posto libero.

Niente altro sulla mensola: niente social, niente numeri, niente "dal 19xx".
Il piede legale/credits ("Un concept di CiceriLab", crediti foto) è un piccolo
link Figtree 13 px "Informazioni" che apre un pannello a pennarello sul vetro
dello specchio attivo (DOM, chiudibile con Esc).

---

## 6. Interazione firma: "Pulire lo specchio"

### 6.1 Il gesto
- **Mouse**: il vapore si pulisce **al passaggio** del puntatore sul vetro
  (pennello morbido di raggio 34 px); tenendo premuto il pennello si allarga a
  60 px, come il palmo invece del dito. Il cursore resta quello di sistema:
  niente cursore custom, niente cerchio che segue il mouse.
- **Dito**: trascinare sul vetro pulisce (raggio 30 px, 44 px se il tocco è
  largo, `PointerEvent.width` quando disponibile). Sul vetro
  `touch-action: none`: un dito sul vetro **pulisce e basta**, non cambia
  specchio. Si cambia specchio dalla mensola, toccando il bordo dello
  specchio vicino, o con uno swipe **sulla mensola**.
- **Traccia continua**: i punti tra due eventi vengono interpolati (niente
  "puntini" a velocità alta); lo spessore cresce un poco con la velocità.
- **Gocce**: a volte (massimo 2 alla volta, mai più di una ogni 1,5 s) dal
  bordo basso di una zona pulita parte una goccia che scende lenta (30-40
  px/s) lasciando una scia pulita sottile, e si ferma dopo 60-140 px. Solo
  dettaglio, disattivato con riduzione del movimento.

### 6.2 Il vapore che torna
- Torna **lento e monotono**: una zona pulita torna coperta in circa 14-18 s,
  prima a chiazze (maschera di rumore statico: le goccioline si riformano per
  prime in certi punti) poi uniforme. Nessuna pulsazione, nessun
  "respiro", nessuna oscillazione di opacità: l'opacità del vapore in un punto
  può solo scendere (quando pulisci) o salire piano (quando torna).
- **Densità**: il vapore è più fitto in basso (l'asciugamano caldo è sotto lo
  specchio) e più leggero in alto, opacità massima 0,9 in basso e 0,78 in alto.
  Così anche a vapore pieno si intuiscono le scritte e il salone: lo specchio
  non è mai un muro grigio.
- **Memoria per specchio**: ogni specchio conserva il suo vapore. Quando ci
  torni, il tempo passato viene applicato come dissolvenza di 600 ms (mai uno
  scatto).
- **Cosa il vapore non copre mai**: la zona della lista mentre stai
  prenotando, il tuo nome dopo la prenotazione (il pennarello non si appanna
  sul serio: il vapore gli passa "dietro" come alone), gli elementi con il
  fuoco da tastiera.

### 6.3 L'apertura
1. Lo specchio attivo è già pulito: riflesso e listino visibili, fermi (0 ms,
   nessun preloader, nessuna percentuale).
2. Dopo 500 ms il vapore sale dal basso e copre il vetro in 2,4 s (dissolvenza
   continua dal basso in alto, lineare nella luminosità, nessun lampo).
3. Una sola passata automatica, come fatta con il palmo, in diagonale, pulisce
   una striscia sopra il prezzo del taglio (700 ms). Insegna il gesto senza
   parole.
4. Sulla mensola, una riga Figtree 14 px che sparisce al primo gesto: "Passa il
   dito sul vetro" (mobile) / "Passa il mouse sul vetro" (desktop).
Con riduzione del movimento: nessuna di queste fasi, lo specchio è pulito.

### 6.4 Chi non può o non vuole strofinare
- **"Specchio pulito"** sulla mensola: toglie il vapore da tutti e tre gli
  specchi con una dissolvenza di 900 ms (200 ms con riduzione del movimento) e
  lo ferma finché non lo riattivi. La scelta si salva in `localStorage` (con
  try/catch; se fallisce, vale per la sessione).
- **Tastiera**: nessun contenuto è raggiungibile solo pulendo. Quando un
  elemento sul vetro prende il fuoco (link Maps, un posto libero nella lista,
  "Informazioni"), il vapore si pulisce da solo in un ovale attorno al suo
  rettangolo (dissolvenza 300 ms) e resta pulito finché ha il fuoco.
- **Lettori di schermo**: il canvas è `aria-hidden`; tutto il pennarello è
  testo DOM vero, in ordine logico (barbiere, contenuto del vetro, lista). Il
  vapore non esiste per loro.
- **Chi usa ingrandimento o ha difficoltà motorie**: il vapore non torna mai
  sopra un elemento in uso; il toggle è sempre nello stesso posto.

### 6.5 Fotosensibilità
- Nessun cambio di luminosità ripetuto: il vapore è monotono (scende solo per
  azione dell'utente, sale solo lentamente); niente rumore animato nel vapore
  (la grana è una texture statica generata una volta); nessuna transizione
  sotto i 300 ms su grandi aree.
- Al massimo 2-3 cambi al secondo in qualsiasi punto, come da regole comuni
  della matrice. Nessun riflesso che "luccica", nessuna luce che passa sul
  vetro.

---

## 7. Meccanica unica di prenotazione: "La lista sullo specchio"

Non è una fila live e non è un form a passi. È **la lista degli appuntamenti
che il barbiere scrive sul suo specchio**, a mezz'ore fisse. Tu trovi un buco
tra due nomi e scrivi il tuo, con la stessa calligrafia.

### 7.1 Come appare
- In testa, a pennarello: "Oggi, martedì 29" (data vera del giorno, calcolata
  al montaggio del componente, mai a livello di modulo per il prerender). Sotto,
  le mezz'ore della giornata una per riga: "9:00 Luca B.", "9:30 Enrico P.",
  "10:00 ___", ... La pausa pranzo è una riga sola: "12:30-14:30 pranzo".
- I **posti liberi** sono un trattino turchese al posto del nome (non un
  pallino, non un chip). Gli occupati sono nomi di esempio (nome + iniziale).
- Gli altri giorni: in fondo alla lista, a pennarello, "domani →" e "← oggi".
  Cambiare giorno = il barbiere "ripassa lo straccio": la lista svanisce in
  400 ms e si riscrive riga per riga (60 ms per riga, 200 ms in totale con
  riduzione del movimento: solo dissolvenza). Si prenota fino a 6 giorni
  lavorativi avanti. Lunedì e domenica: "chiuso" scritto grande, con
  "martedì →".
- I dati sono di esempio e generati in modo deterministico dalla data (stessa
  giornata = stessa lista), con circa il 55-65% di posti occupati.

### 7.2 Scrivere il tuo nome
1. Tocchi un trattino turchese (o "Scrivi il tuo nome" sulla mensola, che
   mette il fuoco sul primo). La zona della lista si pulisce del vapore e resta
   pulita.
2. Al posto del trattino si apre **la riga di scrittura**, sul vetro:
   - "Cosa ti facciamo?": quattro parole a pennarello da toccare (taglio,
     barba, taglio e barba, rasatura). Taglio e barba occupa due mezz'ore:
     quando la scegli, anche la riga sotto si segna con un tratto tratteggiato.
   - "Il tuo nome" e "Telefono" (per avvisarti se il barbiere ha un imprevisto):
     etichetta in Figtree sopra il campo, campo senza bordo con una sola linea
     di base a pennarello; **il testo che scrivi è già in Mansalva**, cioè
     compare con la stessa calligrafia della lista mentre digiti.
   - Bottone "Segna" (turchese, spigolo vivo). Nessun passo numerato.
3. Su 375 px la riga di scrittura si porta in alto nel vetro quando si apre la
   tastiera (`visualViewport`), così non finisce sotto la tastiera.

### 7.3 Stati
- **Vuoto** (niente toccato): la lista è piena di nomi di esempio e trattini;
  la mensola dice "Scrivi il tuo nome". Mai una lista bianca. Se il giorno è
  pieno: "Oggi siamo pieni. Da Denis domani alle 9:30 c'è posto" con il link
  che porta direttamente a quello specchio e a quella riga (il sito cerca il
  primo posto libero sui tre specchi).
- **Errore** (sempre sotto il campo, in Figtree 15 px pennarello con icona
  Phosphor di avviso, `aria-invalid` + `aria-describedby`, annunciato con
  `aria-live="polite"`; mai solo colore):
  - nome vuoto: "Scrivi un nome, anche solo quello: il barbiere deve sapere chi
    chiamare."
  - telefono non valido: "Il numero non torna: controlla le cifre."
  - servizio da un'ora in un buco da mezz'ora: "Qui c'è solo mezz'ora: taglio o
    barba. Per taglio e barba ci sono le 16:00." con il link alla riga giusta.
  - posto preso nel frattempo (simulato raramente, per mostrare lo stato):
    "Qualcuno ha scritto prima di te alle 17:00. Le 17:30 sono libere."
- **Invio in corso**: il tuo nome si scrive nella riga da sinistra a destra
  come un tratto di pennarello (maschera che avanza, 600 ms). Nessuno spinner.
- **Successo**: il tuo nome resta nella lista, nella stessa calligrafia di
  tutti gli altri, e il barbiere lo **sottolinea in turchese** (un tratto
  unico, 400 ms). Sulla mensola, in Figtree: "Segnato: martedì 29 alle 16:30 con
  Denis. Se non puoi venire, chiama lo 0434 ..." (numero di esempio). Nessuna
  cartolina, ricevuta, scontrino, biglietto o modale. `track("demo_prenotazione")`
  solo qui.
  La prenotazione si salva in `localStorage` (con try/catch): se torni, il tuo
  nome è ancora scritto sullo specchio di quel barbiere, e il vapore non lo
  copre. Accanto al nome, piccolo: "cancella", che lo toglie con una passata di
  straccio (dissolvenza 400 ms) e ridà il trattino turchese.
- **Invio fallito**: il nome resta scritto ma sbiadito (opacità 0,45) e
  sotto: "Non è arrivato. Riprova, oppure chiama lo 0434 ..." con "Riprova".

### 7.4 Accessibilità della lista
- La lista è un `<ol>` di righe: ogni posto libero è un `<button>` "Ore 16:30,
  libero, scrivi il tuo nome"; gli occupati sono testo "Ore 17:00, occupato".
  Il giorno è un titolo vero. "domani →" e "← oggi" sono bottoni.
- Frecce su/giù si spostano tra le righe libere; Invio apre la riga di
  scrittura; Esc la chiude e rimette il fuoco sul trattino.

---

## 8. Foto

- **Soggetto**: barbiere vero, uomo o donna che taglia a uomini, clienti
  uomini; poltrone da barbiere, specchi, mensole con pettini, rasatura con
  panno caldo o schiuma, macchinetta sulla nuca. **Mai un parrucchiere**: niente
  caschi asciugacapelli, niente stagnole e colore, niente lavatesta da salone
  per signora, niente clienti con capelli lunghi in piega, niente
  "beauty salon".
- **Quante**: tre, una per specchio (salone dalla prima poltrona, rasatura,
  ingresso/vetrina dall'interno). Da Unsplash, scaricate come
  `https://images.unsplash.com/photo-...?w=1600&q=70&fm=webp` (e versione
  800 px per mobile), **guardate una per una con Read**, salvate negli asset
  del concept, autore e URL annotati nel doc di chi le sceglie. Mai un 404.
- **Trattamento**: specchiate orizzontalmente (è un riflesso), desaturate del
  40%, raffreddate verso il grafite, velatura `#232A2C` al 62-72%; leggera
  sfocatura (1-2 px) perché sono "dietro" il vetro e le scritte davanti restano
  nitide. Evitare foto con scritte leggibili (specchiate si leggerebbero al
  contrario), foto calde marroni in pelle e lampadine a filamento (è il
  bocciato), e volti in primo piano che guardano in camera.
- **Piano B**: se non ci sono tre foto giuste, **una sola foto larga** del
  salone tagliata in tre inquadrature (sinistra, centro, destra): le tre
  poltrone sono parti dello stesso riflesso, ed è persino più coerente.
- **Piano C**: se non c'è nemmeno una foto giusta, nessuna foto: il vetro
  riflette solo una sfumatura grafite con un alone verticale più chiaro (la
  finestra alle spalle), e il sito regge sul vapore e sul pennarello. Mai
  immagini generate spacciate per il salone vero, mai un parrucchiere "perché
  somiglia".

---

## 9. Canvas, SVG, WebGL

- **Canvas 2D** (unica tecnologia grafica): uno per lo specchio attivo, più
  tre canvas fuori schermo (uno per specchio) che tengono la maschera del
  vapore. Il vapore si disegna come: riempimento vapore + texture di grana
  statica (generata una volta, rumore a bassa frequenza) + gradiente di
  densità dal basso. Pulire = `destination-out` con pennello a gradiente
  radiale. Tornare = `source-over` con alfa piccolissima per frame, pesata dalla
  maschera di rumore statico.
  - Risoluzione interna 0,5 × dimensione CSS (il vapore è morbido, non serve
    di più), DPR ignorato; massimo 2 ms per frame su mobile medio.
  - Il loop gira solo se qualcosa cambia (vapore che torna, goccia, gesto);
    quando il vetro è tutto appannato e fermo, il loop si ferma. Pausa su
    `visibilitychange`. Nessun accesso a `window`/`document` a livello di
    modulo.
  - Senza canvas (errore, browser strano): specchio pulito e bottone
    "Specchio pulito" nascosto. Il sito è completo.
- **SVG**: solo le icone Phosphor e il tratto di sottolineatura turchese del
  tuo nome (un path semplice, disegnato con `stroke-dashoffset`). Nessuna
  illustrazione, nessun palo a strisce, nessun logo disegnato: l'insegna è
  testo in Limelight.
- **WebGL**: **no**. Il vapore non ne ha bisogno, e nella matrice il WebGL
  forte è di 12, 17, 18, 19. Niente three/R3F in questo concept.
- **CSS**: parete, bisello, pan orizzontale (`transform: translateX`),
  dissolvenze. Niente Lenis (non c'è scroll), GSAP non necessario.

---

## 10. Mobile 375 px (pensato per primo)

- Viewport 375 × 667: fascia alta 48 px, mensola 84 px, specchio ~535 px di
  altezza, bordi degli specchi vicini 12 px per lato, gutter della parete 12
  px. Nessuno scroll orizzontale, nessuno scroll di pagina.
- Il vetro su mobile ha **una faccia alla volta**: "vetro" (listino, barba o
  dove e quando) oppure "lista". Si passa con "Scrivi il tuo nome" sulla
  mensola o con "la lista →" scritto a pennarello in fondo al vetro. Il cambio
  è una passata di straccio (dissolvenza 400 ms).
- La lista su mobile è divisa in "mattina" e "pomeriggio" (due parole a
  pennarello da toccare in testa), per stare in altezza senza scroll interno:
  massimo 9-10 righe da 44 px.
- Target minimi 44 × 44 px: trattini liberi, parole del servizio, nomi dei
  barbieri, toggle.
- **ConceptBackButton**: sotto 640 px sta in basso a sinistra. La mensola gli
  lascia il suo spazio (i nomi dei barbieri partono dopo 56 px), senza
  sovrapposizioni. Su desktop il bottone è in alto a sinistra nella fascia
  alta, l'insegna va a destra.
- Il testo a pennarello su 375 px non scende sotto 22 px; i prezzi restano
  allineati. Lo specchio non è una colonna schiacciata: è lo stesso specchio,
  più stretto, con le stesse scritte ridistribuite.
- Tastiera virtuale aperta: la riga di scrittura resta visibile
  (`visualViewport`), il vapore è fermo.

---

## 11. Riduzione del movimento e accessibilità (riassunto vincolante)

`prefers-reduced-motion: reduce`:
- specchio già pulito all'apertura, vapore spento (resta solo un alone fermo
  di vapore sui bordi del vetro, statico, come cornice), toggle "Specchio
  pulito" già attivo ma disattivabile;
- nessuna goccia, nessuna passata automatica;
- pan tra gli specchi sostituito da dissolvenza di 200 ms;
- scrittura del nome e sottolineatura: compaiono, senza tracciarsi.

Sempre:
- DOM come fonte di verità; canvas `aria-hidden`; ordine di lettura: insegna,
  barbiere attivo, vetro, lista, mensola.
- Specchi come `tablist`/`tabpanel` (frecce sinistra/destra sulla mensola);
  fuoco visibile turchese 2 px con 2 px di stacco, anche sul vetro.
- Contrasti AA (AAA dove si può) verificati sulla foto più chiara di ogni
  specchio; mai informazione solo nel colore (i posti liberi sono trattino +
  testo per lettore di schermo; gli errori hanno testo e icona).
- `lang="it"`; la data della lista è in `<time datetime>`.
- Nessun suono.

---

## 12. Cosa NON fare

**Dal bocciato TRE POLTRONE e dalla ricetta comune**
- Niente fila live, niente "in fila adesso", niente minuti di attesa, niente
  tabellone, niente contatori. Solo mezz'ore fisse.
- Niente crema, niente blu notte + rosso, niente slab serif, niente
  Cormorant/Playfair/Inter e nessuno dei font vietati dalla matrice.
- Niente split testo/foto, niente foto in cornice con "TAV. I", niente riga di
  numeri tra filetti, niente due bottoni pieno + contorno, niente occhiello
  "BARBIERE · VIA ... · DAL 19xx".
- Niente sezioni numerate, niente maiuscoletto spaziato, niente fade-up, niente
  divisori decorativi, niente mappa disegnata, niente figure umane in SVG.
- La prenotazione non è a passi e non finisce in cartolina, scontrino,
  biglietto, ricevuta o modale di conferma.

**Specifici di CONTROPELO**
- Niente palo a strisce rosso-bianco-blu, nemmeno piccolo, nemmeno nel
  favicon. Niente forbici, rasoi, baffi, pettini disegnati.
- Niente "barber vintage": pelle marrone, oro, ottone, legno scuro, lampadine
  a filamento, whisky, tatuaggi.
- Niente parrucchieri per signora nelle foto (vedi 8).
- Niente `backdrop-filter` al posto del vapore, niente glassmorphism sulle
  interfacce. Il vetro è uno solo, ed è lo specchio.
- Niente vapore che pulsa, respira, sfarfalla o torna di colpo. Niente rumore
  animato.
- Niente cursore custom, niente lente che segue il mouse, niente testo
  magnetico.
- Niente testo di interfaccia o errori in Mansalva: il pennarello è solo ciò
  che è scritto sul vetro. Niente Limelight per frasi.
- Niente turchese per testo piccolo, niente secondo colore di accento, niente
  pallini colorati di stato.
- Niente scroll di pagina, niente scroll-hijacking, niente scroll interno sulla
  lista su mobile (mattina/pomeriggio).
- Niente informazione raggiungibile solo pulendo il vapore.
- Niente recensioni a stelline, niente "i nostri numeri", niente trattini
  lunghi (né `—` né `–`) nei testi visibili, niente dati legali inventati.
- Un solo richiamo alla prenotazione: "Scrivi il tuo nome".

---

## 13. Note per le ondate successive

- **ux-architect**: la mappa è: parete → 3 specchi (vetro + lista) → mensola.
  Documentare i due "facce" su mobile e il percorso tastiera completo.
- **tech-architect**: niente three; un componente `Specchio` × 3, un hook per
  il vapore (canvas 2D, maschere fuori schermo, loop su richiesta), stato
  della lista generato dalla data nel `useEffect`. Porte 9130-9139 (una per agent, `--strictPort`).
- **art-director**: misurare i contrasti su ogni foto scelta; decidere se il
  fondo del bottone turchese va schiarito; definire rotazioni e posizioni delle
  scritte a pennarello per 375, 768, 1440.
- **motion-designer**: gli unici movimenti sono: vapore che sale all'apertura,
  passata automatica, vapore che torna, gocce, pan tra specchi, straccio sulla
  lista, scrittura del nome, sottolineatura. Nient'altro si muove.
- **copywriter**: italiano da barberia di Pordenone, frasi brevi scritte come
  le scriverebbe un barbiere sul vetro (niente punto esclamativo a raffica,
  niente battute sul "look"). Prezzi, orari, indirizzo e telefono di esempio.
- **trend-researcher**: cercare siti con maschere "scratch/wipe to reveal" per
  estrarre cosa rende il gesto soddisfacente (inerzia, pennello, ritorno) e
  cosa lo rende un gimmick; barbierie reali con listini a mano. Principi, non
  copie.
