# UX architect · Concept 10 · IMPRONTA, tipografia e legatoria (Pordenone)

Ondata 1. Rotta `/concept-10`. Base vincolante: `docs/creative-director.md`
(direzione C, IMPRONTA). Questo documento decide **struttura, percorsi, ordine di
lettura, stati e accessibilità**. Non decide colori, font, easing o testi
definitivi (art-director, motion-designer, copywriter): i testi qui sotto sono
segnaposto di lunghezza e di tono, da sostituire.

Materiale letto: `CLAUDE.md`, `docs/processo-agent.md`, `docs/concept-lab.md`,
`concepts/10-torchio/docs/creative-director.md`,
`.claude/skills/design-taste-frontend/SKILL.md` (sez. 4.7, 5, 6).

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, niente occhielli numerati, niente maiuscoletto spaziato come
etichetta, un solo richiamo al preventivo con una sola etichetta: **"Prova la
tua"**.

---

## 1. Sitemap

È una SPA a pagina singola. Una rotta, otto sezioni con ancora, un link di
uscita.

```
/                                  ← Ciceri Lab (uscita, link "← Torna in Ciceri Lab")
└── /concept-10                    IMPRONTA (pagina unica)
    ├── #inizio       1  Hero · la pressa                       <header> + <section>
    ├── #lavori       2  Per chi · tre lavori sul bancone        <section>
    ├── #tecniche     3  Le tecniche · la stessa parola 4 volte  <section> (pinned)
    ├── #carta        4  La carta · tocca prima di scegliere     <section>
    ├── #legatoria    5  Legatoria · il filo                     <section>
    ├── #banco        6  Il banco di prova · preventivo          <section> (cuore)
    ├── #bottega      7  La bottega · portaci la bozza           <section>
    └── #colophon     8  Colophon · piede                        <footer>
```

**Parametri di ingresso (per post e inserzioni di Luca)**, tutti facoltativi,
letti una volta all'avvio, mai scritti nell'URL dal sito:

| Parametro | Valori | Effetto |
|---|---|---|
| `?prova=` | `partecipazione`, `biglietto`, `intestata`, `libro` | preseleziona "Cosa stampi" nel banco |
| `?carta=` | `citrino`, `cotone`, `cipria`, `grafite` | applica la carta a tutto il sito (vince su localStorage solo alla prima visita) |
| `#banco` | | scorre direttamente al banco dopo che la pressa dell'hero è scesa |

Esempio per un'inserzione sulle partecipazioni:
`/concept-10?prova=partecipazione&carta=cipria#banco`.

**Stato che sopravvive al ricaricamento** (localStorage, sempre in try/catch,
il sito funziona uguale se è vuoto o bloccato):
- `carta` scelta;
- bozza del banco (cosa stampi, testi, tecnica, tiratura; **mai** il contatto);
- `inviata: true` + testo premuto, per far tornare i nomi nell'hero.
Nel colophon c'è "Ricomincia da capo", che svuota tutto.

**Carta alla prima visita**: Citrino. Se il sistema è in modo scuro
(`prefers-color-scheme: dark`) e non c'è una scelta salvata, parte Grafite.
Nessuna levetta "modo scuro" separata: il modo scuro è la carta Grafite.

---

## 2. Navigazione

### 2.1 Principio

Il sito è un foglio solo: la navigazione deve essere **un indice di libro**, non
un menu di app. Si vede sempre dove sei (a parole, non con un pallino), si
arriva sempre al banco con un tocco, si esce sempre verso Ciceri Lab.

Elementi presenti su ogni larghezza:
1. link di salto nascosti fino al focus: "Salta al contenuto" e "Vai al banco di
   prova" (primi due elementi tabulabili);
2. "← Torna in Ciceri Lab" (verso `/`, stessa posizione e stessa forma degli
   altri concept);
3. marchio IMPRONTA (lamina) che riporta a `#inizio`;
4. il richiamo unico **"Prova la tua"** → `#banco`.

### 2.2 Desktop (≥ 1024 px, disegnato a 1440)

**Testata in cima all'hero**, alta 64 px, una riga sola, sullo stesso colore
della carta (nessuna barra di un altro colore, nessuna ombra):

```
|← Torna in Ciceri Lab     IMPRONTA          lavori   legatoria   bottega     [ Prova la tua ]|
 ^ Hanken 14 px            ^ lamina, Anybody  ^ Hanken 15 px, minuscolo      ^ bottone lamina
 margine sinistro 7vw                                                           margine destro 7vw
```

**Dopo l'hero** la testata resta attaccata in alto (sticky), 56 px, fondo pieno
della carta attiva (così il testo che scorre sotto non sporca la lettura). Si
aggiunge un solo elemento: la **voce corrente**, cioè la voce della sezione in
cui sei, sottolineata in inchiostro 2 px e con `aria-current="location"`.
Le sezioni senza voce (tecniche, carta, banco, colophon) accendono la voce
più vicina che le precede; nel banco non si accende nulla e il bottone
"Prova la tua" diventa testo semplice "sei sul banco" (non cliccabile, per non
avere un bottone che porta dove sei già).

Tre voci soltanto (la direzione dice tre): **lavori** (`#lavori`),
**legatoria** (`#legatoria`), **bottega** (`#bottega`). Tecniche e carta si
raggiungono scorrendo e dall'indice del colophon; la carta si sceglie anche dal
banco. A 1024 px la riga deve stare su una linea: se non ci sta, "Torna in
Ciceri Lab" si accorcia in "← Ciceri Lab" (con `aria-label` completo).

I link alle ancore scorrono con Lenis; con reduced motion il salto è
istantaneo. Dopo il salto il focus va all'`h2` della sezione (con
`tabindex="-1"`), così chi usa tastiera o lettore di schermo si ritrova nel
punto giusto.

### 2.3 Mobile (375 px): niente hamburger, un "segnapagina"

**In cima**, non attaccata, alta 56 px:

```
| ← Ciceri Lab                                    IMPRONTA |
  margine 20 px                                  margine 20 px
```

**In basso, il segnapagina**: una striscia attaccata al fondo dello schermo,
alta 56 px + area sicura (`env(safe-area-inset-bottom)`), fondo carta attiva,
separata dal contenuto solo da una costa d'ombra di 1 px (il bordo di un foglio
sopra un altro, non un filetto decorativo):

```
| indice · le tecniche          ▴ |   Prova la tua   |
  ^ bottone, 60% della larghezza     ^ bottone lamina, 40%
```

- A sinistra, **"indice"** seguito dal nome della sezione in cui sei (in
  Anybody largo, minuscolo). È un bottone: dice cosa fa e dice dove sei, quindi
  è più ovvio di tre lineette.
- A destra, **"Prova la tua"**. È a portata di pollice.
- Quando compare: solo quando il bottone "Prova la tua" dell'hero è uscito dallo
  schermo (mai due "Prova la tua" visibili insieme).
- Quando sparisce: dentro il banco di prova (lì serve tutto lo spazio e il
  richiamo è inutile) e quando la tastiera del telefono è aperta.
- Entra e esce traslando di 100% in verticale (transform), 240 ms; con reduced
  motion appare e sparisce senza movimento.

**L'indice** (si apre toccando "indice"): un foglio che sale dal basso fino al
78% dello schermo, come l'ultima pagina di un libro.

```
┌───────────────────────────────────────┐
│ indice                       chiudi ✕ │  h2 + bottone chiudi (44×44)
│                                       │
│ la pressa                             │  8 righe, Anybody larghezza 120,
│ tre lavori sul bancone                │  24 px, alte 52 px ciascuna,
│ la stessa parola, quattro volte  ◂ sei qui │  la corrente con "sei qui"
│ la carta                              │  scritto, non solo evidenziata
│ il filo                               │
│ il banco di prova                     │
│ la bottega                            │
│ colophon                              │
│                                       │
│ la carta del sito                     │  gruppo radio: 4 quadrati 56×56
│ [Citrino] [Cotone] [Cipria] [Grafite] │  con il nome scritto sotto
│                                       │
│ ← Torna in Ciceri Lab                 │
└───────────────────────────────────────┘
```

Si chiude con: "chiudi", tasto Esc, tocco fuori dal foglio, trascinamento verso
il basso, scelta di una voce. Mentre è aperto: focus intrappolato dentro,
contenuto dietro `inert`, scroll della pagina bloccato. Alla chiusura il focus
torna a "indice" (o all'`h2` della sezione scelta).

### 2.4 768 px (tablet)

Testata desktop senza la voce corrente se non ci sta; da 768 a 1023 px vale il
segnapagina mobile in basso (è più comodo con il pollice anche su tablet
verticale).

---

## 3. Flusso narrativo dello scroll (arco emotivo)

L'arco è quello di una visita in bottega: entri, tocchi, capisci, scegli, fai,
te ne vai sapendo dove tornare. Il picco è il banco (sezione 6), non l'hero.

| # | Sezione | Altezza indicativa (desktop / mobile) | Emozione | Cosa trattiene | Cosa porta avanti |
|---|---|---|---|---|---|
| 1 | La pressa | 100svh / 100svh | **stupore tattile** | la pressa scende una volta, poi la luce segue il mouse o il dito: la parola "c'è" nella carta | la domanda "cosa posso farci io?"; il bottone "Prova la tua" per chi ha già deciso |
| 2 | Tre lavori sul bancone | 130vh / 150svh | **riconoscimento** ("è per me") | tre oggetti diversi, uno per pubblico, con prezzo di partenza: ognuno si trova in uno | ogni pezzo porta al banco già impostato |
| 3 | La stessa parola, quattro volte | 400vh pinned / 360svh pinned | **competenza** | una parola sola che cambia materia sotto lo scroll: capisci le tecniche senza leggere un listino | voglia di vedere la *propria* parola |
| 4 | La carta | 100vh / 120svh | **gioco e possesso** | toccare una carta cambia tutto il sito: il primo "potere" dato al visitatore | il sito ora è della carta che hai scelto: quella carta ti segue nel banco |
| 5 | Il filo | 220vh / 240svh | **fiducia artigiana** | il filo si cuce da solo; si vede il lavoro vero, non un'icona | l'editore ha trovato la sua parte; per gli altri è una pausa lenta prima del picco |
| 6 | Il banco di prova | 140vh (prova sticky) / ~260svh (prova sticky) | **creazione, climax** | scrivi e vedi il tuo nome premuto; il prezzo cambia dal vivo; tieni premuta la leva | la promessa: una prova vera arriva a casa |
| 7 | La bottega | 90vh / 100svh | **radicamento** | c'è un posto vero, orari, telefono, mappa vera | chi non vuole scrivere può chiamare o passare |
| 8 | Colophon | 60vh / 80svh | **congedo firmato** | il sito ti dice di cosa è fatto, con la *tua* carta nel testo | "Un concept di CiceriLab", torna al Lab |

Regole di ritmo:
- Tra due sezioni c'è solo carta vuota (piede di sezione: 18vh desktop, 96 px
  mobile). Nessun divisore.
- Dopo il pinned delle tecniche (lungo) c'è la carta (corta e interattiva): lo
  scroll passivo è subito seguito da un gesto attivo.
- Il filo (5) è volutamente lento e basso di densità: prepara il picco senza
  chiedere nulla.
- Chi non vuole seguire l'arco ha sempre "Prova la tua" a un tocco (testata o
  segnapagina).
- Per chi torna dopo aver inviato: l'hero mostra i suoi nomi premuti al posto di
  *impronta* e sotto, in inchiostro, "La tua prova è in stampa." Il resto
  dell'arco non cambia.

---

## 4. Tre user journey (dall'arrivo all'invio)

Nota: il visitatore "vero" del Concept Lab è un **tipografo** che arriva da
cicerilab.com e si immedesima nei suoi clienti. Le tre storie qui sotto sono i
clienti del tipografo; la quarta riga dice cosa vede il tipografo in ognuna.

### 4.1 Giulia e Marco, sposi (mobile, da un'inserzione Instagram)

**Contesto**: sera, divano, iPhone. Matrimonio a giugno, 120 invitati. Hanno
già visto le partecipazioni stampate online e le trovano "piatte". Arrivano da
`/concept-10?prova=partecipazione&carta=cipria` (senza `#banco`: l'inserzione
parla di "sentire il nome nella carta").

1. **Hero** (Cipria per il parametro). La pressa scende su *impronta*. Giulia
   passa il dito sulla carta: la luce gira e il rilievo si muove. Primo tocco su
   iOS: compare in fondo all'hero, discreta, la frase "Vuoi muovere la luce
   inclinando il telefono? Attiva" (mai un popup all'avvio). Lei attiva.
2. **Tre lavori**: la partecipazione su Cipria è il primo pezzo della fila
   (con `?prova=partecipazione` l'ordine mette quel pezzo per primo). Legge
   "100 partecipazioni con busta, da 390 €". Tocca "Prova la tua".
3. **Banco**: già impostato su partecipazione, Cipria, a secco, 100. Nella
   prova c'è il testo di esempio. Tocca "Primo nome", scrive "Giulia": la
   prova si stringe in alto (tastiera aperta) ma resta visibile; ogni lettera
   cade e viene premuta. Scrive "Marco" e "21 giugno 2027".
4. Cambia tecnica in "a un colore": i nomi si riempiono d'inchiostro. Prezzo in
   lamina e riga in inchiostro si aggiornano. Tiratura: tocca "150".
5. Scrive il numero di telefono, sceglie "più avanti" in "quando ti serve".
6. Tiene premuta la leva: la pressa scende sulla loro prova. Rilascia a metà per
   errore: la carta risale, sotto la leva "Hai lasciato presto: tieni premuto
   finché la pressa tocca il foglio." Riprova, arriva in fondo.
7. **Successo**: la prova resta premuta, accanto la frase "Ricevuto. Domani ti
   scriviamo il prezzo esatto e ti spediamo a casa questa prova, stampata
   davvero, sulla carta Cipria." Giulia scorre su: nell'hero ci sono "Giulia e
   Marco" premuti. Fa uno screenshot e lo manda a Marco.

**Attriti da evitare**: tastiera che copre la prova (sez. 5.6 mobile); perdere
il testo se chiude la scheda (bozza in localStorage); non capire la leva
(istruzione scritta sempre visibile sopra la leva).
**Il tipografo vede**: il preventivo diventa un oggetto da mostrare, il
cliente si è già innamorato della carta prima di chiamare.

### 4.2 Stefano, commercialista (desktop, da Google "biglietti da visita letterpress Pordenone")

**Contesto**: ufficio, 1440 px, ha fretta, vuole un prezzo e non vuole giocare.

1. **Hero** (Citrino). Muove il mouse, la luce segue: 3 secondi di curiosità.
   Clicca subito "Prova la tua" in testata.
2. **Banco**: senza parametri parte già su **biglietto da visita** (il
   default: il prodotto più richiesto e più corto da comporre). Scrive "Stefano Brun" e "Commercialista".
3. Sceglie Cotone 600 g: tutto il sito diventa bianco caldo, con un'onda che
   parte dal quadrato cliccato. Sceglie "lamina argento": la luce del mouse fa
   scorrere il riflesso sul nome. Tiratura 250.
4. Legge sotto la prova: "Impianto lamina 90 €, carta Cotone 600 g, 250
   biglietti. Indicativo 425 €, IVA inclusa. In bottega in 8-12 giorni
   lavorativi."
5. Vuole prima capire cosa sia "a secco": scorre su verso **le tecniche**
   (o clicca il link "cos'è?" accanto a "La tecnica", che porta a `#tecniche`
   e poi offre "Torna al banco" in fondo alla sezione). Il banco ha conservato
   tutto.
6. Torna, scrive l'email, preme Invio sulla leva con la tastiera una volta:
   la leva dice "Tieni premuto o premi di nuovo per confermare". Preme di
   nuovo: invio. Successo come sopra, carta Cotone.

**Attriti da evitare**: essere costretto a scorrere tutto l'arco (skip link e
testata sempre a un clic); perdere lo stato del banco uscendo e rientrando;
prezzo nascosto dietro l'invio (il prezzo è visibile prima, sempre).
**Il tipografo vede**: il cliente professionista riceve un prezzo in 60 secondi
senza telefonare.

### 4.3 Anna, piccola editrice di poesia (desktop e poi mobile, da un post di Luca)

**Contesto**: casa editrice di Udine, collana di plaquette da 48 pagine, 100
copie. Prima guarda con calma sul portatile, poi invia dal telefono.

1. **Hero**, poi **tre lavori**: si ferma sulla copertina su Grafite con il
   titolo in inchiostro bianco. Non clicca subito.
2. **Tecniche**: la parola campione è "Pordenone". Clicca sul nome "lamina a
   caldo" nell'elenco delle quattro: la sezione salta a quella tecnica.
3. **Carta**: sceglie Grafite. Il sito diventa scuro: è anche il suo modo di
   leggere la sera.
4. **Il filo**: legge le quattro legature con prezzo a copia. Si ferma su
   "legatura giapponese". In fondo alla sezione, "Prova la tua" porta al banco
   con *libro* e *legatura giapponese* già scelti.
5. **Banco**: scrive titolo "Acque basse" e autore. Sceglie 100 copie. Chiude il
   portatile. La bozza resta nel browser del portatile (non passa al telefono:
   è una comodità locale, non un salvataggio).
6. Il giorno dopo dal telefono riapre dal post: rifà le scelte in 40 secondi
   (il banco su mobile è la stessa sequenza), invia con il telefono.
7. Invio fallito (è in treno, niente rete): la carta risale, sotto la leva
   "Non siamo riusciti a spedire la richiesta. Controlla la connessione e tieni
   premuto di nuovo, oppure chiamaci al 0434 …". Il testo e le scelte restano
   tutti. Al secondo tentativo: successo.

**Attriti da evitare**: il pinned delle tecniche che "ruba" lo scroll (va
saltato con i nomi cliccabili e ha un'uscita chiara); legatura non collegata al
banco; perdita dei dati all'errore.
**Il tipografo vede**: anche la legatoria, che di solito è una pagina
dimenticata, porta preventivi.

---

## 5. Wireframe testuali per sezione

Convenzioni:
- **1440**: pagina come un recto di libro. Margine interno (sinistro) **7vw**
  (≈100 px), margine esterno (destro) **12vw** (≈173 px), area viva ≈ 1167 px
  divisa in **12 colonne** con canalino 24 px (colonna ≈ 75 px). "c1-c6" =
  colonne da 1 a 6 dell'area viva. Il blocco di testo sta volutamente fuori
  centro, verso sinistra.
- **375**: margini laterali 20 px, area viva 335 px, una colonna; piede di
  sezione 96 px. Dove serve, 4 colonne da 68 px con canalino 21 px.
- Ordine di lettura = ordine nel DOM = ordine di tabulazione, salvo dove
  indicato.
- ◆ = interattivo. ▒ = superficie resa dallo shader (rilievo), con fallback CSS
  e `aria-hidden`. Tutto il testo che conta è DOM in inchiostro.

### 5.0 Testata e segnapagina
Già descritti in 2.2 e 2.3. Altezze: 64 px (hero desktop), 56 px (sticky
desktop, mobile in cima, segnapagina). Riserva di spazio: la testata sticky non
copre gli `h2` dopo un salto (`scroll-margin-top: 80px`).

### 5.1 Hero · la pressa (`#inizio`)

**1440 × 900**

```
y 0     | testata 64 px (vedi 2.2)                                                    |
y 14vh  |      ▒ i m p r o n t a ▒                                                     |
        |      c1 ─────────────────────────────────────────── c12                     |
        |      Anybody 150/900 a secco, corpo ≈ 11.5vw, alta ≈ 17vh                    |
y 40vh  |      H1 "Stampiamo cose che si leggono                                      |
        |          anche a occhi chiusi."        c1-c8, Anybody larghezza 100, 700,     |
        |                                        ≈ 3.4vw, max 2 righe, inchiostro      |
        |      Sottotitolo ≤ 20 parole, c1-c5, Hanken 18 px, max 3 righe               |
        |      ◆ [ Prova la tua ]   bottone lamina, 56 px alto, testo inchiostro       |
y 100vh |                                              (carta vuota: la luce ci gioca) |
```

- Proporzioni: parola a secco = tutta l'area viva in larghezza; testo in
  inchiostro sotto, su 8 colonne, lasciando vuote c9-c12 e il margine esterno.
  Padding superiore dopo la testata ≤ 96 px (regola 4.7).
- Elementi di testo nell'hero: H1, sottotitolo, un bottone. Niente occhiello,
  niente riga di numeri, niente "Scorri".
- Interattivo: ◆ "Prova la tua"; la carta intera reagisce al puntatore (luce),
  ma non è un controllo e non riceve focus.
- Apertura: la pressa scende una volta (~1,1 s). Il testo in inchiostro è già
  lì dal primo frame: LCP = H1 in DOM, non il canvas.
- Stato "dopo l'invio": al posto di *impronta* è premuto il testo dell'utente
  (i due nomi uniti da "e", o nome, o titolo), adattato alla stessa larghezza
  con l'asse width di Anybody; sotto l'H1 resta uguale e compare una riga
  "La tua prova è in stampa." (sostituisce il sottotitolo, non si aggiunge).

**375 × 667 (iPhone SE, il caso più stretto) e 375 × 812**

```
y 0      | ← Ciceri Lab                  IMPRONTA |  56 px, non sticky
y 88     | ▒ impronta ▒                           |  una riga sola, 335 px esatti:
         |                                        |  il corpo è fisso (≈ 19vw), è l'asse
         |                                        |  width che si stringe per starci
y 190    | H1 "Stampiamo cose che si              |  Anybody w100, 30 px, max 3 righe
         |     leggono anche a occhi              |
         |     chiusi."                           |
y 310    | Sottotitolo, Hanken 17 px, max 4 righe |
y 430    | ◆ [ Prova la tua ]  larghezza piena    |  52 px alto
         |                                        |
         | (carta: trascinare il dito qui muove   |
         |  la luce; il testo resta selezionabile)|
```

- La parola non è mai tagliata dal bordo: se con larghezza minima dell'asse non
  sta in 335 px, si riduce il corpo, mai il margine.
- Il bottone deve stare nel primo schermo anche a 667 px di altezza (verifica
  obbligatoria del responsive-tester).
- Trascinare il dito sulla carta muove la luce **senza bloccare lo scroll
  verticale**: solo i movimenti prevalentemente orizzontali o i tocchi fermi
  spostano la luce (`touch-action: pan-y` sul fondo).
- Invito all'inclinazione (solo iOS con permesso richiesto, solo dopo il primo
  tocco sulla carta, una volta per visita): riga in inchiostro in fondo
  all'hero "Muovi la luce inclinando il telefono" + ◆ "Attiva". Se rifiuta, la
  riga sparisce e non torna.

### 5.2 Per chi · tre lavori sul bancone (`#lavori`)

**1440**

```
| H2 "Tre lavori sul bancone"   c1-c7, Anybody w120, stacco dal fondo sezione precedente 18vh |
| una riga Hanken sotto, c1-c6                                                                |
|                                                                                             |
|   ┌────────────┐                                                                            |
|   │ PARTECIP.  │ -2°       ┌──────────────┐                                                 |
|   │ Cipria     │           │ BIGLIETTO    │ +1.5°                   ┌─────────┐              |
|   │ 148×105    │           │ Cotone 85×55 │                         │COPERTINA│ -0.5°        |
|   │ ▒nomi▒     │           └──────────────┘                         │ Grafite │              |
|   └────────────┘            c6-c8, scala 0.8                       │ 150×210 │              |
|    c1-c4, scala 1          y +12vh rispetto al primo               └─────────┘              |
|                                                                     c10-c12, y +4vh         |
|   per chi si sposa          per chi si presenta                     per chi pubblica        |
|   "100 con busta,           "250 biglietti,                         "100 copie da 48 pagine,|
|    da 390 €"                 da 220 €"                               da 1.350 €"            |
|   ◆ Prova la tua            ◆ Prova la tua                          ◆ Prova la tua          |
```

- Tre oggetti a scala e rotazione diverse, altezze sfalsate: nessuna riga di
  schede uguali. Le tre didascalie in inchiostro stanno **sotto** il proprio
  oggetto, allineate al suo bordo sinistro, non su una linea comune.
- Ogni oggetto è ▒ (superficie shader); nel DOM ogni pezzo è un `<article>` con
  `h3` ("Partecipazione di nozze"), le due righe e il link.
- ◆ "Prova la tua" di ogni pezzo porta a `#banco` impostando "Cosa stampi" e la
  carta di quel pezzo (`aria-label`: "Prova la tua partecipazione", "... il tuo
  biglietto", "... il tuo libro"). Etichetta visibile identica: resta un solo
  richiamo, con tre partenze.
- Hover su un oggetto: la pressione di quel pezzo si approfondisce leggermente
  (feedback), nessuno spostamento.
- Pressione in ingresso: i tre pezzi scendono uno dopo l'altro (sfasati 150 ms)
  quando la sezione entra al 30%.

**375**

```
| H2 "Tre lavori sul bancone" (2 righe, 30 px)                 |
| riga Hanken                                                  |
|                                                              |
|  ┌──────────────────────────┐┌───                            |
|  │ PARTECIPAZIONE -2°       ││ BIG  ← il secondo pezzo        |
|  │ 280 px largo             ││      sporge 40 px da destra,  |
|  │                          ││      sovrapposto e ruotato:   |
|  └──────────────────────────┘└───   si capisce che si sfoglia |
|  per chi si sposa                                            |
|  100 con busta, da 390 €                                     |
|  ◆ Prova la tua                                              |
|                                                              |
|  ◆ ‹  partecipazione · biglietto · copertina  ›              |
|     la parola del pezzo in vista è in inchiostro pieno e     |
|     sottolineata; le altre in inchiostro al 70%              |
```

- Fila orizzontale con scroll-snap (un pezzo per volta, 280 px + 40 px di
  sporgenza del successivo); la didascalia cambia con il pezzo.
- Sotto, i tre nomi come ◆ bottoni (`aria-controls` sulla fila,
  `aria-current` sul pezzo in vista) più frecce ‹ › da 44×44: chi non fa swipe
  o usa tastiera non ha bisogno del gesto.
- Il DOM resta una lista di 3 `<article>`: il lettore di schermo li legge in fila
  normale.

### 5.3 Le tecniche · la stessa parola, quattro volte (`#tecniche`)

**1440** (pinned per 4 schermate, `start: top top`)

```
| H2 "La stessa parola, quattro volte"  c1-c8 (resta fisso in alto nel pin) |
|                                                                           |
|  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                ◆ a secco        ◂ |
|  ▒     P o r d e n o n e          ▒                ◆ a un colore        |
|  ▒     (o il nome scritto nel banco)▒              ◆ lamina a caldo     |
|  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                ◆ taglio colorato    |
|   c1-c8, alta 45vh                                  c10-c12              |
|                                                                           |
|  H3 "A secco"          c1-c5, Hanken                                     |
|  cos'è · su cosa rende meglio · quanto costa in più (3 righe brevi)      |
|                                                  ◆ Torna al banco (solo  |
|                                                  se si è arrivati dal    |
|                                                  link "cos'è?" del banco)|
```

- Lo scroll cambia solo il materiale della parola e il blocco H3 + 3 righe
  (sostituzione secca del testo, nessun fade-up). Nel DOM i quattro blocchi
  sono una lista di 4 `h3` + paragrafi, sempre leggibili in ordine dal lettore
  di schermo (nascosti solo visivamente quando non sono i correnti, mai con
  `display:none`); la vista mostra quello corrente.
- ◆ L'elenco delle quattro tecniche (c10-c12) è un indice di salto: clic =
  scorre alla porzione del pin di quella tecnica. La tecnica corrente ha "◂" e
  peso 600, non solo un colore.
- Uscita chiara: il pin finisce dopo "taglio colorato"; l'elenco a destra mostra
  anche la posizione (4 voci, la corrente marcata) così si sa quanto manca.
- Reduced motion: **niente pin**. Quattro blocchi uno sotto l'altro, ciascuno
  con la parola già resa in quella tecnica (4 superfici statiche), alta 60vh
  ciascuno.

**375** (pinned per 4 × 90svh)

```
| H2 (2 righe)                                   |
| ◆ a secco · a un colore · lamina · taglio  →   |  fila di 4 bottoni, scorrevole
|   (sticky sotto l'H2)                          |  in orizzontale se non sta
|                                                |
| ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ |
| ▒      Pordenone  (larghezza piena, w stretta) ▒|  alta 38svh
| ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ |
|                                                |
| H3 "A secco" + 3 righe Hanken 16 px            |
```

- Parola campione lunga (nomi lunghi dal banco): se supera 12 caratteri su
  mobile si usa solo il primo nome; su desktop fino a 18 caratteri, poi il
  primo nome.
- Taglio colorato: la parola resta ferma e l'inquadratura della superficie
  ruota di tre quarti per mostrare il bordo tinto; su mobile la rotazione è
  minore (max 20°) per non rendere illeggibile la parola.

### 5.4 La carta · tocca prima di scegliere (`#carta`)

**1440**

```
| H2 "Tocca prima di scegliere"  c1-c7                                        |
| una riga Hanken: "La carta che scegli diventa la carta di tutto il sito."   |
|                                                                             |
|┌──────────────┬──────────────┬──────────────┬──────────────┐               |
|│ ▒ citrino ▒  │ ▒ cotone ▒   │ ▒ cipria ▒   │ ▒ grafite ▒  │  4 strisce da  |
|│              │              │              │              │  25vw, a tutta |
|│              │              │              │              │  larghezza     |
|│              │              │              │              │  (fuori dai    |
|│ Citrino      │ Cotone       │ Cipria       │ Grafite      │  margini: è    |
|│ 300 g        │ 600 g        │ 350 g        │ 400 g        │  l'unico punto |
|│ per tutto    │ biglietti    │ partecip.    │ editoria     │  a vivo)       |
|│ ✓ la carta   │              │              │              │  alta 72vh     |
|│   del sito   │              │              │              │               |
|└──────────────┴──────────────┴──────────────┴──────────────┘               |
|  ▔▔▔▔ costa: spessore visibile 3 / 6 / 4 / 5 px in basso a ogni striscia     |
```

- Ogni striscia è un ◆ radio del gruppo "La carta del sito" (`role=radiogroup`,
  frecce sinistra/destra per muoversi, Spazio per scegliere; la scelta si
  applica alla selezione, non al solo focus, per non far cambiare il sito
  mentre si tabula).
- Testo in ogni striscia: nome (Anybody), grammatura e uso (Hanken), il tutto
  nell'inchiostro **di quella carta** (su Grafite, inchiostro bianco). La carta
  scelta ha scritto "✓ la carta del sito" e un bordo interno inchiostro 3 px:
  la scelta non è mai detta solo dal colore.
- Scelta: il nuovo colore si propaga dal punto toccato (da centro striscia se
  scelto da tastiera), 700 ms; reduced motion: dissolvenza 200 ms. Annuncio
  `aria-live="polite"`: "Carta Cotone 600 g. Tutto il sito ora è su Cotone."
- Hover desktop: la luce passa sulla striscia e il nome si preme di più.

**375**

```
| H2 (2 righe) + riga Hanken                      |
|┌───────────────────────────────────────────────┐|
|│ ▒ citrino ▒           Citrino 300 g           │|  4 fasce orizzontali
|│                       per tutto  ✓ del sito   │|  a vivo (0 margine),
|├───────────────────────────────────────────────┤|  alte 22svh ciascuna,
|│ ▒ cotone ▒            Cotone 600 g            │|  min 120 px
|├───────────────────────────────────────────────┤|
|│ ▒ cipria ▒            Cipria 350 g            │|  la costa (spessore)
|├───────────────────────────────────────────────┤|  è il bordo inferiore
|│ ▒ grafite ▒           Grafite 400 g           │|  di ogni fascia
|└───────────────────────────────────────────────┘|
```

- Nome a secco a sinistra (decorativo), testo vero a destra: nome, grammatura,
  uso, eventuale "✓ la carta del sito". Area di tocco = fascia intera.

### 5.5 Legatoria · il filo (`#legatoria`)

**1440**

```
| H2 "Il filo"  c1-c5                                                          |
| riga Hanken c1-c6                                                            |
|                                                                              |
|   │  filo SVG, un solo tratto, colonna c1-c3                                 |
|   │                                                                          |
|   ╳╳╳  punti della brossura cucita   ──▶  c5-c10:  H3 "Brossura cucita"       |
|   │                                               2 righe + "da 6 € a copia  |
|   │                                               su 100 copie"             |
|   ⌒⌒⌒  cartonato                     ──▶  c6-c11 (sfalsato di 1 colonna)     |
|   │                                                                          |
|   ▯▯▯▯  legatura giapponese           ──▶  c5-c10                            |
|   │                                                                          |
|   ✕ ✕   punto metallico                ──▶  c6-c11                           |
|   │                                                                          |
|   ◆ Prova la tua  (c5, dopo l'ultima legatura)                               |
```

- Il filo si disegna seguendo lo scroll (scrub); ogni fermata ha il percorso di
  cucitura vero di quella legatura. Il testo di ogni fermata è **già presente**
  e fermo; il filo che arriva lo "aggancia" (unico effetto).
- I quattro blocchi sono una lista `<ol>` visivamente senza numeri, ognuno con
  `h3`, testo e prezzo. Il filo è `aria-hidden`: la descrizione del punto sta
  nel testo ("cucita a filo refe, segnatura per segnatura").
- ◆ "Prova la tua" in fondo porta al banco con *libro* e la legatura
  dell'ultima fermata vista (se nessuna, brossura cucita).
- Reduced motion: filo già interamente cucito, statico.

**375**

```
| H2 + riga                                   |
| │                                           |
| ╳  H3 Brossura cucita                        |  filo nel margine sinistro
| │  2 righe, prezzo                           |  (x = 28 px), testo da
| │                                           |  x = 56 px a 355 px
| ⌒  H3 Cartonato ...                          |
| ...                                         |
| ◆ [ Prova la tua ]  larghezza piena          |
```

### 5.6 Il banco di prova (`#banco`), la sezione più importante

**1440**

```
| H2 "Il banco di prova"  c1-c7                                                         |
| una riga: "Scrivi, scegli la carta, guarda la prova. Il prezzo è qui, subito."        |
|                                                                                       |
| ┌─────────────── LASTRA (c1-c7, sticky top 88 px) ───────┐  COMPOSITOIO (c8-c12)       |
| │                                                        │                             |
| │        ┌───────────────────────────┐   ◆ luce ◐         │  fieldset "Cosa stampi"     |
| │        │  PROVA ▒                  │   (dial in basso   │  ◆ biglietto ◆ partecip.    |
| │        │  proporzionata al formato │    a destra della  │  ◆ carta intestata ◆ libro  |
| │        │  85×55 / 148×105 / A4 /   │    lastra)         │                             |
| │        │  150×210, alta max 58vh   │                    │  fieldset "Il tuo testo"    |
| │        │                           │                    │  ◆ campo 1  ◆ campo 2 (◆ 3) |
| │        └───────────────────────────┘                    │  (dipendono da Cosa stampi) |
| │          ▒ 425 € ▒ in lamina sul margine della prova    │                             |
| └────────────────────────────────────────────────────────┘  fieldset "La carta"        |
|   Riepilogo in inchiostro (DOM, aria-live):                  ◆ 4 quadrati 64×64 + nome  |
|   "Biglietto da visita 85×55, Cotone 600 g, lamina          |                             |
|    argento, 250 pezzi. Impianto lamina 90 €.                fieldset "La tecnica" cos'è?|
|    Indicativo 425 €, IVA inclusa. Pronti in 8-12             ◆ a secco ◆ a un colore     |
|    giorni lavorativi."                                       ◆ lamina argento            |
|                                                              ☐ taglio colorato          |
|                                                              (fieldset "Legatura" solo  |
|                                                               se libro: 4 scelte)       |
|                                                              fieldset "Quante"          |
|                                                              ◆ 50 ◆100 ◆150 ◆250 ◆500 ◆1000 |
|                                                              ─────────────────────────  |
|                                                              "Dove ti scriviamo"        |
|                                                              ◆ campo email o telefono   |
|                                                              (errore qui sotto)         |
|                                                              "Quando ti serve" facolt.  |
|                                                              ◆ entro 15 giorni ◆ entro  |
|                                                                un mese ◆ più avanti     |
|                                                                                         |
|                                                              Totale indicativo 425 €    |
|                                                              Tieni premuto per stampare |
|                                                              ◆ ( ● ═══════════════ )    |
|                                                                LEVA lamina, 72 px alta, |
|                                                                larga c8-c12             |
|                                                              zona messaggi (aria-live)  |
```

- La lastra resta ferma (sticky) mentre il compositoio scorre: la prova è
  **sempre** in vista mentre si sceglie.
- Ordine di lettura e tabulazione: H2 → riga → compositoio intero (dall'alto
  in basso) → leva → messaggi. La lastra viene dopo nel DOM come `figure` con
  `figcaption` = riepilogo, e il suo dial della luce. Le scelte non sono passi
  numerati: tutti i gruppi sono aperti e modificabili in qualsiasi ordine.
- Tutti i gruppi di scelta sono `fieldset` + `legend` con radio veri (resi come
  bottoni di carta), "Quante" compreso (niente slider).
- Link ◆ "cos'è?" accanto alla legenda "La tecnica": porta a `#tecniche`; in
  fondo alle tecniche compare ◆ "Torna al banco".

**Campi "Il tuo testo" per prodotto** (etichetta sopra, sempre visibile):

| Cosa stampi | Campo 1 | Campo 2 | Campo 3 | Limite per campo |
|---|---|---|---|---|
| Biglietto da visita | Nome e cognome | Mestiere | (no) | 28 / 32 |
| Partecipazione | Primo nome | Secondo nome | Data | 18 / 18 / 24 |
| Carta intestata | Nome o studio | Indirizzo breve | (no) | 32 / 40 |
| Libro o libretto | Titolo | Autore | (no) | 36 / 28 |

Default senza parametro: **biglietto da visita**, carta = carta attiva del
sito, tecnica a secco, 100 pezzi (30 copie per il libro).

**Prezzi di esempio (verosimili, indicativi, IVA inclusa)** da passare al
copywriter. Base = carta Cotone, stampa a secco, impianto incluso:

| Tiratura | Biglietto 85×55 | Partecipazione 148×105 con busta | Carta intestata A4 | Libro 150×210, 48 pp, brossura cucita |
|---|---|---|---|---|
| 30 | | | | 690 € |
| 50 | 120 € | 260 € | 210 € | 890 € |
| 100 | 150 € | 390 € | 290 € | 1.350 € |
| 150 | 175 € | 480 € | 350 € | |
| 250 | 220 € | 650 € | 480 € | |
| 300 | | | | 2.900 € |
| 500 | 330 € | 1.050 € | 760 € | |
| 1000 | 520 € | 1.800 € | 1.250 € | |

Supplementi: *a un colore* +40 € impianto e +0,25 € a pezzo; *lamina argento*
+90 € impianto e +0,45 € a pezzo; *taglio colorato* +0,30 € a pezzo (minimo
30 €); carta *Citrino* o *Cipria* +5%, *Grafite* +12%. Per il libro tecnica e
taglio valgono sulla copertina; legatura: brossura cucita inclusa, cartonato
+4 € a copia, giapponese +2,50 €, punto metallico −1,50 € (solo fino a 48
pagine). Tempi: 8-12 giorni lavorativi, libri 15-20. Arrotondare ai 5 €. Il
riepilogo in parole elenca solo le voci diverse dalla base.

**375**

```
| H2 "Il banco di prova" + riga                   |
|┌───────────────────────────────────────────────┐|
|│  LASTRA sticky, top 0, alta 42svh             │|  la prova centrata,
|│      ┌───────────────────────┐                │|  larga max 300 px;
|│      │  PROVA ▒              │   ▒425 €▒      │|  prezzo in lamina sul
|│      └───────────────────────┘   ◆ luce ◐     │|  margine destro;
|│  Totale indicativo 425 €  (riga inchiostro)   │|  dial luce 44×44
|└───────────────────────────────────────────────┘|  sotto la costa: ombra 1 px
| fieldset Cosa stampi: 4 bottoni 2×2 (160×52)    |
| fieldset Il tuo testo: campi a larghezza piena, |
|   56 px alti, testo 17 px (niente zoom iOS)     |
| fieldset La carta: 4 quadrati 72×72 in riga     |
|   con nome sotto                                |
| fieldset La tecnica: 3 bottoni in colonna +     |
|   casella taglio colorato; link "cos'è?"        |
| (Legatura, se libro: 2×2)                       |
| fieldset Quante: 6 bottoni 3×2 (100×48)         |
| Riepilogo in parole (il testo lungo sta qui,    |
|   non nella lastra)                             |
| Dove ti scriviamo: campo, tastiera email o tel  |
|   (inputmode scelto dal primo carattere)        |
| Quando ti serve: 3 bottoni in colonna           |
| Tieni premuto per stampare                      |
| ◆ ( ● ══════════════════════ ) leva 72 px,      |
|   larghezza piena                               |
| zona messaggi                                   |
| 96 px piede                                     |
```

- **Tastiera aperta** (focus in un campo, rilevato con `visualViewport`): la
  lastra si comprime a una striscia alta 28% dello schermo visibile che mostra
  solo la riga che stai scrivendo, premuta, a larghezza piena. Il campo
  attivo è sempre sotto la striscia (scroll automatico al campo, con
  `scroll-margin-top` pari all'altezza della striscia).
- Il segnapagina è nascosto per tutta la sezione.
- La leva è sempre raggiungibile scorrendo: niente leva sticky (eviterebbe
  invii accidentali col pollice).

**Stati del banco** (testi segnaposto per il copywriter, senza trattini lunghi)

| Stato | Quando | Prova (lastra) | Messaggio (DOM, dove) |
|---|---|---|---|
| **Vuoto / primo arrivo** | nessuna bozza | testo di esempio del prodotto già premuto (es. "Chiara Zanin / Restauratrice"), mai bianca | sotto la legenda "Il tuo testo": "È un esempio. Scrivi il tuo e lo vedi premuto." |
| **Campo svuotato** | l'utente cancella tutto un campo | torna il testo di esempio per quel campo, più chiaro (pressione 0,4) | nessun errore: il campo vuoto è lecito finché non si invia |
| **Scrittura** | digitazione | ogni lettera nuova fa una piccola pressione locale | nessuno |
| **Testo lungo** | oltre il limite del campo | la riga si stringe con l'asse width fino al minimo, poi va a capo | sotto il campo, cortese: "Oltre 28 lettere lo componiamo su due righe." Il campo non blocca, il contatore compare solo dagli ultimi 5 caratteri |
| **Segno non disponibile** | emoji o caratteri fuori dal set del font | il segno viene omesso dalla prova | sotto il campo: "Questo segno non c'è nella nostra cassa di caratteri: nella prova lo lasciamo fuori." |
| **Bozza ritrovata** | rientro con bozza salvata | la prova con il testo salvato | sopra il compositoio: "Abbiamo tenuto la tua prova dell'ultima volta." + ◆ "Ricomincia" |
| **Contatto non valido** | uscita dal campo (blur) con valore non email e non telefono italiano | invariata | sotto il campo, inchiostro + segno "!" + testo: "Scrivi un'email (nome@esempio.it) o un numero di telefono." Campo con `aria-invalid` e bordo 3 px. Mai rosso come unico segnale (non c'è rosso) |
| **Leva senza contatto** | leva tenuta con contatto vuoto | la pressa non scende | focus al campo contatto, messaggio sotto: "Ci serve un'email o un telefono per mandarti la prova." |
| **Rilascio anticipato** | leva lasciata prima di ~900 ms | la carta risale | sotto la leva: "Hai lasciato presto: tieni premuto finché la pressa tocca il foglio. Oppure premi due volte." |
| **Primo tocco breve** | clic o Invio senza tenere | invariata | la leva cambia etichetta: "Premi di nuovo per confermare" per 6 s, poi torna com'era |
| **Invio in corso** | pressione completa | la pressa **resta giù**, rilievo massimo, nessuno spinner | leva disabilitata (`aria-disabled`), testo "Stiamo mettendo in stampa…" in `aria-live` |
| **Successo** | risposta ok (nel concept: invio simulato, ~1,2 s, niente dati spediti) | la prova resta premuta, la leva sparisce | accanto alla prova (desktop) o al posto della leva (mobile), una frase in inchiostro: "Ricevuto. Domani ti scriviamo il prezzo esatto e ti spediamo a casa questa prova, stampata davvero, sulla carta Cipria." + ◆ "Prova un'altra cosa" (reset leggero, carta invariata). Focus spostato su questa frase. Nessuna cartolina, ricevuta o scontrino |
| **Invio fallito** | rete assente o errore | la carta risale | sotto la leva: "Non siamo riusciti a spedire la richiesta. Controlla la connessione e tieni premuto di nuovo, oppure chiamaci allo 0434 …" (numero di esempio, link `tel:`). Tutte le scelte restano |
| **Senza WebGL** | canvas non disponibile | prova in CSS (text-shadow di luce e ombra sulla carta), prezzo in lamina come gradiente leggero | nessun messaggio: il fallback è completo, il dial della luce sposta le ombre CSS |

### 5.7 La bottega · portaci la bozza (`#bottega`)

**1440**

```
| c1-c7, tutto a sinistra, composto come un frontespizio:                  |
|                                                                          |
| H2 "Portaci la bozza"               Anybody w120                         |
|                                                                          |
| ▒ Via …, 14 ▒  + stessa riga in inchiostro sopra il rilievo              |
|   Anybody largo 150, ≈ 4vw, l'indirizzo è sia premuto sia stampato       |
| 33170 Pordenone                                                          |
|                                                                          |
| Orari (lista di definizioni, Hanken):                                    |
|   lunedì-venerdì  8.30-12.30 · 15.00-19.00                               |
|   sabato          9.00-12.30                                             |
| ◆ 0434 … (link tel:)                                                     |
| ◆ Apri in Maps ↗ (nuova scheda, detto nell'aria-label)                   |
|                                                                          |
| una frase su chi lavora in bottega, c1-c5                                |
|                                                  c8-c12: carta vuota     |
```

- Nessuna mappa disegnata, nessun ritratto. Il vuoto a destra è voluto.
- Dati d'esempio verosimili scelti dal copywriter; niente P.IVA.

**375**: stessa sequenza in colonna; indirizzo in Anybody largo adattato alla
larghezza (asse width), telefono e Maps come due ◆ bottoni pieni a larghezza
piena, 52 px, uno sotto l'altro (sono le due conversioni alternative del
telefono).

### 5.8 Colophon · piede (`#colophon`, `<footer>`)

**1440**

```
|                colonna centrata 44ch, Hanken 16 px                         |
|   "Questo sito è composto in Anybody e Hanken Grotesk, stampato a secco    |
|    su carta Cipria 350 g nella tipografia IMPRONTA di Pordenone."          |
|    (la carta nel testo è quella attiva, aggiornata dal vivo)               |
|                                                                           |
|   indice: la pressa · tre lavori · tecniche · carta · il filo · banco ·   |
|           bottega                                  (◆ link alle ancore)   |
|   ◆ Prova la tua     ◆ Ricomincia da capo (svuota carta e bozza, chiede    |
|                        conferma in linea, non con un popup)              |
|                                                                           |
|   Un concept di CiceriLab        ◆ ← Torna in Ciceri Lab                   |
|                                          piede 12vh                       |
```

**375**: stesso contenuto, colonna 335 px, indice in lista verticale, link a
48 px di altezza; il segnapagina resta visibile e non copre l'ultimo link
(padding inferiore = 56 px + area sicura).

---

## 6. Accessibilità (per ogni interazione)

### 6.1 Base di pagina
- Punti di riferimento: `header` (testata), `nav` "Principale" (voci),
  `main` (sezioni 1-7), `footer` (colophon). Un solo `h1` (la frase dell'hero),
  un `h2` per sezione, `h3` per pezzi, tecniche, legature.
- Link di salto "Salta al contenuto" e "Vai al banco di prova".
- Focus visibile ovunque: contorno inchiostro 3 px, distanza 3 px, sulle
  quattro carte (su Grafite l'inchiostro è chiaro). Mai `outline: none` senza
  sostituto.
- Area minima di tocco 44×44 px; bottoni principali 52-72 px.
- Contrasto: testo in inchiostro AA (AAA per il corpo dove possibile) su
  ciascuna delle quattro carte; la lamina argento non porta mai testo di
  lettura sulla carta (il testo sui bottoni in lamina è inchiostro su argento,
  da verificare AA). Il prezzo in lamina è decorativo: il prezzo vero è sempre
  in inchiostro.
- Tutti i canvas `aria-hidden="true"`; ogni rilievo ha il suo testo in DOM o
  ripete un testo già leggibile. **Nessuna informazione vive solo nel rilievo,
  nella luce o nel colore della carta.**
- Lingua `lang="it"`. Testo ingrandibile al 200% senza perdita (le parole a
  secco possono uscire dal flusso, il testo in inchiostro no).
- Nessun lampeggio; nessun cambio di luminosità più rapido di 3 volte al
  secondo; nessuno scroll-jacking fuori dal pin delle tecniche.

### 6.2 `prefers-reduced-motion: reduce`
Luce ferma a 135° / 22°, niente arco automatico, niente tilt, pressione già
completa ovunque (anche nell'hero), tecniche senza pin (4 blocchi), filo già
cucito, cambio carta in dissolvenza 200 ms, lettere del banco che compaiono già
premute, leva: la pressa scende senza rimbalzo (la leva resta un "tieni
premuto", il tempo non cambia, e c'è sempre la doppia pressione).

### 6.3 Luce radente
- È decorativa ma è anche un piacere: va resa controllabile senza mouse.
- ◆ **Dial della luce** nella lastra del banco e, su desktop, anche nell'hero
  in basso a destra del blocco testo (piccolo, 44×44, icona semicerchio +
  testo nascosto "Direzione della luce"). È un `input type=range` (0-345°, passo
  15°) con valore detto a parole (`aria-valuetext`: "luce da sinistra in
  alto"). Frecce, Pagina su/giù, Home/Fine funzionano come in ogni slider.
- La `figure` della prova nel banco non riceve focus: il controllo della luce
  è uno solo, il dial, per non creare due modi diversi di fare la stessa cosa.
- Tilt del telefono: solo su richiesta esplicita (◆ "Attiva"), mai all'avvio,
  disattivabile nell'indice ("Luce col telefono: sì / no").
- Trascinare sulla carta non deve interferire con scroll, selezione del testo
  o gesti di sistema.

### 6.4 Pressione (ingresso dei blocchi)
Non trasmette informazioni: il testo è già lì. Nessun contenuto aspetta
un'animazione per diventare leggibile o cliccabile.

### 6.5 Scelta della carta (sezione 4, banco, indice)
- Sempre un `radiogroup` con etichetta ("La carta del sito") e 4 `radio` con
  nome accessibile completo ("Cipria, 350 grammi, per partecipazioni").
- Frecce per muoversi, Spazio per scegliere; la carta non cambia al solo focus.
- Stato scelto indicato da testo ("✓ la carta del sito" / "scelta") e bordo
  3 px, non solo dal colore.
- Annuncio `aria-live="polite"` dopo il cambio. Il cambio non sposta il focus
  e non fa scorrere la pagina.
- I tre gruppi (sezione carta, banco, indice) sono sincronizzati: cambiare in
  uno aggiorna gli altri.

### 6.6 Leva "tieni premuto per stampare"
- Elemento `button` vero, nome accessibile "Tieni premuto per stampare",
  `aria-describedby` → istruzione visibile sopra la leva e prezzo totale.
- **Puntatore**: pressione mantenuta ~900 ms; l'azione parte a pressione
  completa, rilasciare prima annulla (conforme a "annullamento del puntatore").
  Spostare il dito fuori dalla leva annulla.
- **Tastiera**: Spazio o Invio tenuti premuti ~900 ms funzionano come il
  puntatore (ignorare la ripetizione automatica del tasto, contare dal primo
  keydown al keyup).
- **Alternativa senza tempo** (per tastiera, lettori di schermo, sensibilità
  motorie ridotte, e per chiunque): una pressione breve mette la leva in stato
  "Premi di nuovo per confermare" (annunciato con `aria-live`), una seconda
  pressione entro 6 s invia. Nessuno è obbligato a tenere premuto.
- Progresso visibile (la maniglia scorre e la pressa scende) più testo di
  stato; nessun suono.
- Dopo l'invio il focus va alla frase di successo (o al messaggio d'errore).
- La leva non si attiva mai con lo scroll o per un tocco di passaggio.

### 6.7 Campi del banco
- Etichetta visibile sopra ogni campo (niente placeholder come etichetta),
  errori sotto il campo collegati con `aria-describedby`, `aria-invalid`.
- `autocomplete`: `name` per il nome sul biglietto, `email` / `tel` sul
  contatto; `inputmode` coerente. Corpo 17 px minimo (niente zoom su iOS).
- Validazione del contatto all'uscita dal campo e all'invio, mai a ogni
  carattere.
- La prova che si aggiorna mentre scrivi non viene annunciata a ogni lettera;
  il riepilogo in parole ha `aria-live="polite"` con debounce di 800 ms e
  annuncia solo il prezzo e le voci cambiate.

### 6.8 Tecniche (pin) e tre lavori (fila)
- Tecniche: i quattro nomi sono bottoni di salto; il contenuto delle quattro
  tecniche è letto per intero, in ordine, dal lettore di schermo; con tastiera
  si esce dal pin tabulando oltre l'ultimo nome.
- Tre lavori su mobile: fila con frecce ‹ › e nomi-bottone; su tastiera la fila
  scorre al pezzo che riceve il focus.

### 6.9 Indice mobile
`dialog` modale con titolo "indice", focus intrappolato, Esc chiude, contenuto
dietro `inert`, ritorno del focus al bottone di apertura. Il bottone ha
`aria-expanded` e `aria-controls`.

---

## 7. CTA e punti di conversione

**Un solo intento, una sola etichetta**: "Prova la tua" (→ `#banco`). Dove
appare:

| Posizione | Parte con | Note |
|---|---|---|
| Hero | impostazioni di default o dei parametri URL | unico bottone dell'hero |
| Testata desktop (sticky) | come sopra | diventa "sei sul banco" dentro il banco |
| Segnapagina mobile | come sopra | nascosto nell'hero e nel banco |
| Tre lavori (×3) | prodotto + carta del pezzo | `aria-label` specifico |
| Fine del filo | libro + legatura vista | |
| Colophon | stato corrente | |

**Conversione principale**: invio dal banco con la leva (richiesta di
preventivo + prova gratuita spedita).

**Conversioni alternative** (per chi non vuole scrivere): telefono (`tel:`
in bottega, nel messaggio d'errore), "Apri in Maps" (visita in bottega).

**Micro-conversioni** (segnali di interesse, tracciati con `track()` del sito
vero; nomi proposti al tech-architect):
- `c10_luce_mossa` (prima interazione con la luce, una volta)
- `c10_carta_scelta` (con carta e sezione di origine)
- `c10_banco_aperto` (con origine: hero, testata, segnapagina, pezzo, filo, colophon, url)
- `c10_testo_scritto` (primo carattere scritto nel banco)
- `c10_leva_rilasciata_presto`, `c10_invio_ok`, `c10_invio_errore`
- `c10_tel`, `c10_maps`, `c10_torna_lab`

**Gancio che converte**: la promessa, detta vicino alla leva prima
dell'invio, "Ti spediamo a casa una prova vera, gratis, sulla carta che hai
scelto". Il prezzo è sempre visibile **prima** dell'invio: niente "scopri il
prezzo lasciando la tua email".

**Per Luca (meta-conversione)**: il colophon firma "Un concept di CiceriLab" e
riporta al Lab; il tipografo che guarda il concept deve uscire pensando "il mio
preventivo potrebbe essere questo".

---

## 8. Consegne ad altri agent

- **copywriter**: tutti i testi segnaposto di questo documento (hero,
  didascalie, stati del banco, bottega, colophon); tabella prezzi in 5.6 da
  confermare; indirizzo e telefono di esempio senza dati legali.
- **tech-architect / scaffold**: parametri URL (sez. 1), localStorage in
  try/catch, `visualViewport` per la tastiera mobile, `inert` per l'indice,
  invio simulato con stato di errore riproducibile (offline).
- **motion-designer**: eventi di movimento ammessi = quelli già elencati dalla
  direzione + comparsa del segnapagina (240 ms, transform) + compressione della
  lastra con la tastiera; tutto con alternativa reduced motion descritta in 6.2.
- **accessibility-auditor**: la lista in sez. 6 è la checklist di collaudo,
  carta per carta (4 carte × 3 larghezze).
- **responsive-tester**: controlli obbligatori: bottone dell'hero visibile a
  375×667; parola dell'hero mai tagliata; prova del banco visibile con
  tastiera aperta; segnapagina che non copre l'ultimo link del colophon.
