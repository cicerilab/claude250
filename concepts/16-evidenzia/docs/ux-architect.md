# UX architect · Concept 16 · EVIDENZIA, agenzia immobiliare (Pordenone)

Ondata 1. Rotta `/concept-16`. Base vincolante: `docs/creative-director.md`
(variante A, PAGINA INTERA, con la colonna di C come forma mobile) e
`docs/brand-strategist.md` (casting dei 22 annunci, nomi, regole di
calendario). Questo documento decide **struttura, impaginato, percorsi, stati
e accessibilità**. Non decide colori, font, easing o testi definitivi
(art-director, motion-designer, copywriter): le frasi qui sotto sono
segnaposto di lunghezza e di tono.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`,
`docs/matrice-concept-11-20.md` (riga, paragrafo 16, verifica incrociata,
regole comuni), `concepts/16-evidenzia/docs/creative-director.md`,
`concepts/16-evidenzia/docs/brand-strategist.md`,
`concepts/10-torchio/docs/ux-architect.md` (solo formato e livello).

Regole di scrittura rispettate anche qui: niente trattini lunghi, niente
occhielli numerati, niente maiuscoletto spaziato, al massimo un punto medio
per riga nei testi visibili, un solo richiamo alla visita con una sola
etichetta: **Prepara il giro**.

---

## 1. Sitemap e URL

È una SPA a pagina singola, ma **non a sezioni verticali**: è un foglio unico
che si sposta nei due assi, più due livelli sovrapposti (scheda e giro).

```
/                                  ← Ciceri Lab (uscita: ConceptBackButton condiviso)
└── /concept-16                    EVIDENZIA (una rotta sola)
    ├── [foglio]                   <main> contenitore scorrevole nei due assi
    │   ├── testata                <header> h1 + data + sommario + orecchia
    │   ├── #riquadro              riquadro di testa (fa da hero)            h2
    │   ├── #appartamenti          rubrica Appartamenti in vendita (8)       h2
    │   │   └── #listino           box Quanto costa al metro quadro          h2
    │   ├── #case                  rubrica Case e villette (6)               h2
    │   ├── #rustici               rubrica Rustici e terreni (3)             h2
    │   ├── #hanno-comprato        box Hanno comprato con noi                h2
    │   ├── #vendi                 box Vendi casa?                           h2
    │   ├── #agenzia               box L'agenzia                             h2
    │   ├── #affitti               rubrica Affitti (5)                       h2
    │   ├── #hai-segnato           solo < 640 px: riepilogo dei segni        h2
    │   └── piede                  <footer>
    ├── [comandi fissi]            barra del giro, minipagina, Leggi / Pagina intera
    ├── #rif-214 …                 scheda della casa    role="dialog" (sopra il foglio)
    └── #giro                      il giro del sabato   role="dialog" (sopra il foglio)
```

Ogni annuncio ha `id="rif-<numero>"` sull'`article` (serve alle ancore della
minipagina, al riepilogo "Hai segnato" e al ritorno del focus). La scheda
aperta si esprime con l'hash `#scheda-214` (non `#rif-214`, per non far
saltare il browser all'articolo).

**History (niente cambio di rotta)**:
- apertura della scheda: `history.pushState` con hash `#scheda-214`;
  apertura del giro: `#giro`. Il tasto indietro (Android, browser, gesto iOS)
  chiude il livello aperto. La chiusura dal bottone fa `history.back()` se il
  livello è stato aperto dal sito, altrimenti `replaceState` senza hash.
- Dalla scheda si può aprire il giro? No: nella scheda c'è il toggle, non il
  richiamo (vedi 7). Quindi al massimo un livello alla volta.
- Arrivo diretto con `#scheda-214`: la scheda si apre senza transizione di
  stacco (l'annuncio di origine non è in vista); alla chiusura il foglio
  scorre all'annuncio (senza animazione) e il focus va al suo titolo.
- Arrivo diretto con `#giro`: si apre il pannello del giro (anche vuoto).
- Hash letti solo nel client, dopo il montaggio (il sito fa prerender).

**Parametri di ingresso** (per post e inserzioni di Luca), letti una volta,
mai scritti dal sito nell'URL:

| Parametro | Valori | Effetto |
|---|---|---|
| `?segna=214,229` | fino a 4 Rif. separati da virgola | evidenzia quegli annunci, **solo se non c'è un giro salvato**; Rif. sconosciuti ignorati in silenzio |
| `?rubrica=` | `appartamenti`, `case`, `rustici`, `affitti` | porta il foglio (o la colonna) all'inizio della rubrica, senza animazione |

Esempio per un'inserzione sugli affitti: `/concept-16?rubrica=affitti`.
Esempio "giro già pronto": `/concept-16?segna=214,244,229#giro`.

**Stato che sopravvive al ricaricamento** (`localStorage`, chiave
`evd-giro`, sempre in try/catch; senza storage tutto funziona nella sessione):
- Rif. evidenziati, nell'ordine del giro;
- partenza scelta (9:00 / 9:30 / 10:00; agenzia o prima casa);
- sabato scelto (data ISO);
- `mandato`: data ISO del sabato e impronta del giro mandato (per capire se è
  stato cambiato dopo).
- Mai nome, telefono, email, nota: restano solo in memoria.
- Livello di zoom (Leggi / Pagina intera): **non** si salva, si riparte da
  Leggi.

---

## 2. Navigazione e convivenza con ConceptBackButton

### 2.1 Principio

Non c'è menu: un giornale non ne ha. Ci si orienta come sul giornale: la
testata con il **sommario** (i nomi delle rubriche, che portano lì), le barre
nere delle rubriche, e la **minipagina** che mostra dove sei e dove hai
segnato. L'unico comando sempre raggiungibile per la conversione è
**Prepara il giro**.

Elementi presenti su ogni larghezza, in quest'ordine di tabulazione:
1. link di salto, nascosti fino al focus: "Vai agli annunci" (→ prima barra
   di rubrica, focus sul suo `h2`) e "Vai al tuo giro" (→ bottone Prepara il
   giro);
2. `ConceptBackButton` (condiviso, montato fuori dal foglio);
3. testata con sommario;
4. contenuto del foglio;
5. comandi fissi (barra del giro, Leggi / Pagina intera).

Nota sull'ordine: i comandi fissi stanno **dopo** il foglio nel DOM, ma "Vai
al tuo giro" ci porta in un tasto. Così chi tabula non deve attraversare 44
fermate di annunci per arrivare al giro.

### 2.2 Desktop (≥ 1024 px, disegnato a 1440 × 900)

**ConceptBackButton**: fisso in alto a sinistra (top 14, left 14, circa
230 × 44). Il foglio lo rispetta così:
- il margine alto del foglio è 72 px: la testata parte a y = 72, sotto il
  bottone, e *EVIDENZIA* inizia a x = 66;
- quando il foglio scorre, il bottone resta sopra il foglio. Il foglio ha
  `scroll-padding-top: 72px` e `scroll-padding-left: 260px` **solo per la
  fascia alta**: in pratica, quando un elemento riceve il focus e il foglio
  scorre per mostrarlo, lo scorrimento lo lascia almeno 72 px sotto il bordo
  alto, così il bottone non copre mai l'annuncio col focus (WCAG 2.4.11).

**Comandi fissi**: un "molo" in basso a destra, 24 px dai bordi, su fondo carta
pieno con un filo nero da 1 px (è un ritaglio sopra il foglio, non una scheda
con ombra):

```
                                              ┌───────────────────────────────┐
                                              │ Il tuo giro   ▬ ▬ ░ ░          │  riga 1: stato, 4 posti
                                              │ Torre · Centro                 │  riga 2: le zone (1 punto medio)
                                              │ [ Prepara il giro          ]  │  bottone nero, 44 px
                                              └───────────────────────────────┘
                                              ┌───────────────┐ ┌────────────┐
                                              │ ░░░░░░░░░░░░░ │ │ ( Leggi )  │  toggle a 2 bottoni
                                              │ ░▢░░▬░░░░░░░░ │ │ Pagina     │  aria-pressed
                                              │ ░░░░░░▬░░░░░░ │ │ intera     │
                                              │ minipagina    │ └────────────┘
                                              │ 150 × 168     │
                                              └───────────────┘
   molo: 320 px di larghezza, alto circa 290 px, right 24, bottom 24
```

- I quattro **posti** sono bottoni 44 × 44 (area di tocco), disegnati come
  tratti corti: pieno = una casa, vuoto = filetto retino. Un posto pieno porta
  all'annuncio (il foglio scorre, focus sul titolo). Nome accessibile: "Casa 1
  del giro: Torre, trilocale con garage. Vai all'annuncio".
- La riga delle zone elenca le zone del giro nell'ordine del giro (massimo un
  punto medio per riga: con 3-4 zone va su due righe o si scrive "Torre,
  Centro, Porcia").
- La minipagina è larga 150 px e alta in proporzione al foglio (1840 × 2060 →
  150 × 168). Mostra: la sagoma delle colonne in retino, i segni rosa degli
  annunci evidenziati nella loro posizione, il rettangolo della finestra.
- Il foglio ha uno spazio vuoto in fondo e a destra pari al molo (padding
  inferiore 320 px, destro 360 px) così ogni annuncio può essere portato fuori
  da sotto il molo.
- Sotto i 560 px di altezza della finestra (portatili piccoli, telefoni in
  orizzontale, zoom 200% su schermi bassi) il molo si riduce a una riga sola
  alta 52 px: `Il tuo giro ▬ ▬ ░ ░  [Prepara il giro]  [Pagina intera]`, e la
  minipagina sparisce.

**Sommario in testata**: sotto la data, nella colonna 4, i nomi delle quattro
rubriche come link di testo nero sottolineato (Appartamenti, Case e villette,
Rustici e terreni, Affitti). Portano il foglio all'inizio della rubrica
(scorrimento morbido; con reduced motion salto) e il focus all'`h2` della
barra (`tabindex="-1"`).

### 2.3 Mobile (< 640 px, disegnato a 375 × 667): la colonna piegata

**ConceptBackButton**: fisso in basso a sinistra (circa 210 × 44, bottom 14,
left 14). Quindi **nessun elemento fisso in basso**: la barra del giro va in
alto. La colonna ha 88 px di spazio vuoto in fondo, così l'ultima riga del
piede non finisce sotto il bottone.

```
┌─────────────────────────────────────┐
│ EVIDENZIA                           │  testata compatta, scorre via
│ sabato 3 ottobre 2026               │
│ Case in vendita e in affitto a      │
│ Pordenone e dintorni                │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│  filo nero 3 px
│ Appartamenti  Case e villette  Rus› │  striscia rubriche (scorre in orizz.)
├─────────────────────────────────────┤
│ ▬ ▬ ░ ░          [ Prepara il giro ]│  BARRA DEL GIRO, sticky top 0, 48 px
├─────────────────────────────────────┤
│ …                                   │
```

- **Barra del giro**: diventa sticky appena la testata esce dallo schermo;
  prima sta al suo posto sotto la striscia. Alta 48 px, fondo carta pieno,
  filo nero sotto da 1 px. Contiene i quattro posti (tratti da 24 × 10, non
  interattivi, solo stato: il nome accessibile del gruppo è "Il tuo giro: due
  case su quattro") e il bottone **Prepara il giro** (altezza 40 dentro una
  zona di tocco di 48, larghezza circa 150). "Il tuo giro" come testo visibile
  compare solo da 390 px in su; sotto resta nel nome accessibile.
- **Barre di rubrica**: sticky sotto la barra del giro (top 48), alte 36 px:
  mentre leggi una rubrica sai sempre quale è. Sotto i 480 px di altezza
  della finestra (telefono in orizzontale, zoom 400%) le barre di rubrica non
  sono sticky: resta sticky solo la barra del giro.
- **Striscia rubriche**: scorre in orizzontale con lo scroll nativo, voci da
  44 px di altezza, la rubrica in cui sei sottolineata (2 px nero) e con
  `aria-current="location"`. Non è sticky (lo spazio in alto è della barra del
  giro).
- **Hai segnato** in fondo alla colonna, prima del piede: le righe d'attacco
  degli annunci evidenziati, ciascuna con il suo tratto rosa, come link
  all'annuncio; sotto, di nuovo **Prepara il giro**. Con giro vuoto: "Non hai
  ancora segnato niente." e un link "Torna agli annunci".
- Niente minipagina, niente Pagina intera sotto i 640 px.

### 2.4 Da 640 a 1023 px (tablet)

- Stesso foglio del desktop (1840 px, identico), stesso molo.
- A 768 px si vedono le colonne 1 e 2 intere e la 3 tagliata al bordo: il
  taglio dice "la pagina continua". Il testo del riquadro di testa è
  composto su due colonne (556 px) proprio per restare intero da 640 px in su
  (vedi 5.1).
- Il molo a 768 × 1024 sta in basso a destra come su desktop; in verticale sotto
  i 700 px di larghezza la riga delle zone sparisce (resta nei nomi
  accessibili dei posti).

---

## 3. Arco emotivo

Non c'è uno scroll lineare: l'arco è quello di un **sabato mattina col
giornale**, e ogni momento ha un luogo preciso.

| # | Momento | Dove | Emozione | Cosa trattiene | Cosa porta avanti |
|---|---|---|---|---|---|
| 1 | Riconoscere | prima schermata: testata con la data di questo sabato, riquadro di testa, annunci accanto | **familiarità** ("è la pagina delle case") | il tratto dimostrativo su "Segna", disegnato una volta; la pagina tagliata a destra | la voglia di leggere il primo annuncio a destra |
| 2 | Leggere | il foglio, a Leggi | **curiosità concreta** | prezzi, metri, spese scritti; la densità che promette scelta | un annuncio convince: la mano va verso l'evidenziatore |
| 3 | Segnare | il primo tratto rosa | **possesso**, il picco del gesto | il rosa è solo tuo: la pagina cambia per causa tua; la barra del giro riceve il suo primo tratto | "vediamo gli altri"; la minipagina mostra il segno |
| 4 | Guardare da vicino | la scheda: la foto passa dal retino al colore | **desiderio** ("un annuncio diventa una casa") | confronto €/m² con la zona, il difetto scritto, le distanze a piedi | il toggle "Evidenzia per il giro", o "Rimetti nella pagina" e continua |
| 5 | Vedere d'insieme | Pagina intera | **controllo** | tutta la pagina con i segni rosa sparsi: l'immagine memorabile | un tocco su un segno e si rientra a leggere |
| 6 | Il limite | il quinto annuncio | **sorriso** (l'evidenziatore è scarico) | una regola umana: quattro case stanno in una mattina | togliere o tenere: decidere davvero |
| 7 | La mattina si organizza | il giro: mappa vera, percorso rosa, orari | **sollievo**, secondo picco | la mattina calcolata, "Torre alle 9:10, Porcia alle 10:35" | scrivere nome e telefono è poco rispetto a quello che hai già |
| 8 | Impegnarsi e fidarsi | Manda il giro, successo | **fiducia calma** | "Sara ti richiama entro venerdì alle 18"; Aggiungi al calendario | tornare sul foglio: i segni restano |

Regole di ritmo:
- Nessun contenuto aspetta un'animazione per essere leggibile: la pagina è
  "già stampata" (nessun reveal allo scroll).
- Il riquadro di testa non ha bottone: il primo gesto si fa sugli annunci,
  dove il gesto ha senso.
- Il giro è raggiungibile da ogni momento (molo o barra), anche vuoto: lo
  stato vuoto insegna il gesto invece di rimproverare.
- Chi torna dopo aver mandato il giro ritrova la pagina con i suoi tratti e
  la barra che dice "Giro mandato per sabato 3 ottobre".

---

## 4. Tre journey fino al giro mandato

Nota: il visitatore vero del Concept Lab è un **agente immobiliare** che
arriva da cicerilab.com o da un'inserzione e si immedesima nei suoi clienti.
Le tre storie usano i pubblici del brand-strategist.

### 4.1 Elisa e Matteo, prima casa (mobile, sera, da un'inserzione Instagram)

1. Toccano l'inserzione "Segna le case, al giro pensiamo noi": arrivano su
   `/concept-16?rubrica=appartamenti`. La colonna parte già sulla barra
   "Appartamenti in vendita" (sticky), la barra del giro è vuota in alto.
2. Scorrono in verticale. Su 214 (Torre, trilocale con garage) Elisa passa il
   pollice in orizzontale sulla riga d'attacco: il tratto rosa la segue, al
   rilascio si completa, il telefono vibra 10 ms, il primo posto della barra si
   riempie. Lettore di schermo spento, ma la regione live dice comunque
   "Aggiunto al giro: Torre, trilocale con garage. Una casa su quattro."
3. Toccano il titolo di 231 (Centro, bilocale): la scheda sale dal punto
   dell'annuncio. La foto passa dal retino al colore. Leggono "2.400 €/m²:
   in Centro la media è 2.150" e il perché. Premono **Evidenzia per il giro**.
   Tasto indietro di Android: la scheda si chiude, sono di nuovo su 231.
4. Segnano 244 e 229 (Torre). Provano un quinto: il tratto esce pallido e si
   ritira, la riga spiega il limite. Tolgono 231 dal suo bottone Evidenzia.
5. **Prepara il giro**: pannello a tutto schermo, mappa in alto con tre
   marcatori e il percorso rosa, sotto le tappe. È giovedì sera dopo le 12:
   la colonna dice "Per questo sabato è tardi: ti proponiamo sabato 10
   ottobre." Scelgono partenza 9:30, "ci vediamo alla prima casa".
6. Scrivono nome e telefono (tastiera numerica), **Manda il giro**. Il
   bottone diventa "Mando il giro…", poi in cima: "Giro mandato. Sara ti
   richiama entro venerdì alle 18 per confermarlo." Toccano **Aggiungi al
   calendario**: scarica il `.ics` con tre eventi.

### 4.2 Paolo e Francesca, cambiano casa (desktop 1440, pausa pranzo, da Google)

1. Arrivano su `/concept-16`. Prima schermata: testata con la data, riquadro
   di testa, la barra "Appartamenti in vendita" tagliata al bordo destro,
   sotto il riquadro la rubrica "Case e villette" con 152 (Porcia, villetta
   anni '80).
2. Premono **Pagina intera**: vedono l'impaginato completo, capiscono che le
   case sono a sinistra in basso. Clic su 171 (Cordenons, bifamiliare): il
   foglio torna a Leggi centrato lì.
3. Col mouse trascinano sulla riga di 152 e di 171: due tratti. Aprono 237
   (Roveredo, testa di schiera): leggono le tre righe sulla zona ("scuola
   primaria a 6 minuti a piedi"), la evidenziano dalla scheda. Rimettono la
   scheda nella pagina con `Esc`.
4. Si spostano a destra con la rotella tenendo premuto Maiusc, poi trascinando
   il rettangolo della minipagina. Nel box *Vendi casa?* leggono la
   provvigione: annotano mentalmente che venderanno anche con loro.
5. **Prepara il giro**: il pannello copre i due terzi destri, il foglio con i
   tre segni resta visibile a sinistra. L'ordine più breve dall'agenzia è
   Cordenons, Porcia, Roveredo; con partenza 9:00 l'ultima visita finisce alle
   11:15. Spostano Roveredo prima (bottone "Prima"), gli orari si ricalcolano.
6. Aggiungono la nota "veniamo con due bambini", **Manda il giro**.

### 4.3 Luisa, cerca in affitto per lavoro (tastiera e lettore di schermo, desktop)

1. Arriva da un link di un collega. Tab: "Vai agli annunci", "Vai al tuo
   giro". Col lettore di schermo apre l'elenco dei titoli: `h1` Evidenzia, `h2`
   delle rubriche e dei box, `h3` degli annunci. Salta alla rubrica Affitti.
2. Sul titolo di 229 (Torre, trilocale) sente "Torre, trilocale non arredato,
   pulsante, apre la scheda". Tab: "Evidenzia, Rif. 229, pulsante
   interruttore, non premuto". Spazio: "Aggiunto al giro: Torre, trilocale.
   Una casa su quattro." Il tratto si disegna da solo (per chi vede).
3. Apre la scheda di 248 con Invio: il focus va al titolo della scheda,
   il resto della pagina è inerte. Legge la consistenza come liste. `Esc`: il
   focus torna al titolo di 248. Evidenzia anche 248.
4. "Vai al tuo giro" (o Tab fino al molo): **Prepara il giro**. Nel dialogo
   il focus va al titolo "Il giro del sabato, sabato 3 ottobre". Legge le
   tappe come elenco ordinato con orari; la mappa viene dopo, dichiarata
   "Mappa del giro, le stesse tappe dell'elenco".
5. Lascia il telefono vuoto e invia: il focus va al campo telefono, che dice
   "Scrivi un numero per la conferma: ti chiamiamo solo per il giro."
   Corregge, invia, il focus va alla riga di successo.

---

## 5. Wireframe testuali

Unità del foglio (desktop e tablet, identico da 640 px in su):
- larghezza **1840 px**: margine 66 + 6 colonne da 268 + 5 canaletti da 20 +
  margine 66;
- colonne: c1 66-334, c2 354-622, c3 642-910, c4 930-1198, c5 1218-1486,
  c6 1506-1774;
- altezza circa **2060 px** (2,3 schermate a 1440 × 900), più lo spazio del
  molo;
- filetto di colonna 1 px retino al centro di ogni canaletto, interrotto dalle
  barre di rubrica e dai riquadri a bordo nero.

### 5.0 Formati dell'annuncio (le misure di cui ha bisogno l'impaginato)

```
PICCOLO (P), 1 colonna, 150-190 px      CON FOTO (F), 1 colonna, 330-370 px
┌────────────────────────────┐          ┌────────────────────────────┐
│ ▓ Borgomeduna, trilocale   │ attacco  │ ▒▒▒▒ foto a retino ▒▒▒▒▒▒▒ │ 268 × 168
│   al terzo piano           │ (h3 +    │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│ Senza ascensore, da        │  bottone)│ ▓ Centro, bilocale         │
│ rinfrescare. 88 m², due    │          │   ristrutturato            │
│ camere, un bagno. Classe F,│          │ 2-3 righe di descrizione   │
│ autonomo.                  │          │ 58 m², classe C, autonomo. │
│ € 108.000                  │ prezzo   │ € 139.000                  │
│ Rif. 188       [✎ Evidenzia]│ 44 px    │ Rif. 231      [✎ Evidenzia]│
└────────────────────────────┘          └────────────────────────────┘

DI TESTA (T), 1 colonna, 400-440 px     A RIQUADRO (R), 2 colonne, 400-430 px
┌────────────────────────────┐          ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
│ ▒▒▒▒ foto a retino ▒▒▒▒▒▒▒ │ 268×200  ┃ ▒▒▒ foto 1 retino ▒▒▒  ▒▒▒ foto 2 retino ▒▒ ┃ 2 × 258×160
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │          ┃ ▓ San Gregorio, quadrilocale con terrazzo   ┃ attacco su 1 riga
│ ▓▓ Torre, trilocale        │ attacco  ┃ 4-5 righe su due colonne interne            ┃
│ ▓▓ con garage              │ più      ┃ 118 m², due bagni, classe B.                ┃
│ 5-6 righe di descrizione   │ grande   ┃ € 229.000              Rif. 240 [✎ Evidenzia]┃
│ 82 m², classe D.           │          ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ € 168.000                  │                       bordo nero 2 px, spigolo vivo
│ Rif. 214      [✎ Evidenzia]│
└────────────────────────────┘

CERCHIAMO (C), 1 colonna, 90-130 px, tappabuchi (non evidenziabile, non apre schede)
┌────────────────────────────┐
│ Cerchiamo per una famiglia │   attacco in Franklin 700 (non 800), senza Rif.,
│ bilocale in Centro o a     │   senza bottoni; chiude le colonne corte
│ Torre, fino a € 140.000.   │   come sui giornali veri. Da 2 a 4 in pagina.
└────────────────────────────┘
```

- L'**attacco** (riga in grassetto: zona e tipologia) è dentro l'`h3` ed è il
  bottone che apre la scheda. È anche la riga su cui corre il tratto. Il
  brand-strategist lo tiene sotto circa 38 caratteri: sta su una riga a 268 px
  nei formati P e F, su due righe nel formato T (corpo più grande).
- Il bottone **Evidenzia** sta sempre nell'ultima riga, a destra, alto 44 px
  (anche su desktop, per coerenza), con l'icona dell'evidenziatore e il
  testo "Evidenzia" (premuto: "Nel giro"). Nome accessibile: "Evidenzia per il
  giro, Rif. 214".
- Altezze fisse delle foto (168, 200, 160): l'impaginato si calcola prima che
  le immagini arrivino, **nessuno spostamento** (CLS 0).
- Gli annunci "Cerchiamo" sono il modo onesto di pareggiare le colonne: il
  section-builder pareggia le colonne di ogni blocco entro 16 px usando i
  Cerchiamo e, se serve, la versione lunga o corta della descrizione (il
  copywriter scrive per ogni annuncio P e F una descrizione "corta" di 2 righe
  e una "lunga" di 3 righe).

### 5.1 Il foglio a 1440: impaginato esatto

Il foglio è diviso in **tre fasce** orizzontali. Dentro ogni fascia i blocchi
sono pile di colonna; i riquadri a 2 colonne aprono una riga dentro la pila.

```
x:   66        354       642       930       1218      1506      1774  1840
     │   c1    │   c2    │   c3    │   c4    │   c5    │   c6    │
y 72 ┌──────────────────────────────┬─────────┬───────────────────┐
     │ EVIDENZIA                    │ Case in │   ORECCHIA        │  TESTATA
     │ (Franklin 900, ~132 px,      │ vendita │ Il sabato siamo   │  y 72-248
     │  c1-c3)                      │ e in    │ aperti 9-12:30.   │
     │                              │ affitto…│ È il giorno dei   │
     │                              │ sabato  │ giri.             │
     │                              │ 3 ott.  │ (c6, riquadro con │
     │                              │ SOMMARIO│  filo 1 px)       │
     │                              │ Appart. │                   │
     │                              │ Case e… │                   │
     │                              │ Rustici │                   │
     │                              │ Affitti │                   │
y256 ┝━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┥  filo nero 3 px
     │                                                            │
     │ FASCIA 1  (y 276 → ~1330)                                  │
     │ ┌─ blocco sinistro c1-c3 ──────┐ ┌─ blocco destro c4-c6 ──┐│
     │ │ RIQUADRO DI TESTA c1-c3      │ │■ Appartamenti in vendita■│ barra nera 36 px
     │ │ h 280-300                    │ ├────────┬────────┬───────┤│
     │ ├──────────────────────────────┤ │214 T   │231 F   │LISTINO││
     │ │■ Case e villette ■■■■■■■■■■■■│ │        │        │€/m²   ││
     │ ├─────────┬────────────────────┤ │        │        │box    ││
     │ │152 T    │ 171 R  c2-c3       │ │        ├────────┤~380   ││
     │ │         │                    │ ├────────┤197 P   ├───────┤│
     │ │         ├─────────┬──────────┤ │188 P   │        │203 P  ││
     │ ├─────────┤237 F    │209 F     │ ├────────┴────────┼───────┤│
     │ │244 P    │         │          │ │ 240 R  c4-c5    │226 F  ││
     │ ├─────────┤         │          │ │                 │       ││
     │ │166 P    ├─────────┼──────────┤ │                 ├───────┤│
     │ │         │ C       │ C        │ ├────────┬────────┤219 P  ││
     │ ├─────────┤         │          │ │ C      │ C      │       ││
     │ └─────────┴─────────┴──────────┘ └────────┴────────┴───────┘│
     │                                                            │
     │ FASCIA 2  (y ~1350 → ~1980)                                │
     │ ┌─ c1-c2 ──────────┐┌─ c3-c4 ───────────┐┌─ c5-c6 ────────┐│
     │ │■ Rustici e terr. ││ HANNO COMPRATO    ││■ Affitti ■■■■■■■││
     │ ├────────┬─────────┤│ CON NOI  (2 col,  │├────────┬───────┤│
     │ │118 T   │177 P    ││ 2 citazioni)      ││229 T   │235 P  ││
     │ │        ├─────────┤├─────────┬─────────┤│        ├───────┤│
     │ │        │143 P    ││ VENDI   │ L'AGEN- ││        │212 P  ││
     │ │        ├─────────┤│ CASA?   │ ZIA     │├────────┼───────┤│
     │ ├────────┤ C       ││         │         ││248 P   │250 P  ││
     │ │ C      │         ││         │         ││        │       ││
     │ └────────┴─────────┘└─────────┴─────────┘└────────┴───────┘│
     │                                                            │
y~2000 ─────────────────────────────────────────────────────────────  filo 1 px nero
     │ PIEDE: pagina 1 · EVIDENZIA  sabato 3 ottobre 2026   crediti foto   │
     │ Attività inventata…   Un concept di CiceriLab                        │
y~2060 └────────────────────────────────────────────────────────────┘
```

Assegnazione definitiva (Rif. dal casting del brand-strategist):

| Blocco | Colonna | Ordine dall'alto | Nota |
|---|---|---|---|
| Testata | c1-c3 | *EVIDENZIA* | `h1` |
| Testata | c4 | riga "Case in vendita e in affitto a Pordenone e dintorni", data del sabato, sommario (4 link) | visibile nella prima schermata |
| Testata | c6 | orecchia: orari del sabato in 2-3 righe | si scopre spostandosi a destra |
| Fascia 1 sinistra | c1-c3 | riquadro di testa | testo composto su c1-c2 (556 px); in c3 le 3 righe "Come funziona" (vedi 5.2) |
| Fascia 1 sinistra | c1-c3 | barra "Case e villette" | |
| Fascia 1 sinistra | c1 | 152 T, 244 P, 166 P, Cerchiamo | |
| Fascia 1 sinistra | c2-c3 | 171 R | |
| Fascia 1 sinistra | c2 / c3 | 237 F, Cerchiamo / 209 F, Cerchiamo | |
| Fascia 1 destra | c4-c6 | barra "Appartamenti in vendita" | allineata in alto al riquadro di testa, tagliata dal bordo a 1440 |
| Fascia 1 destra | c4 | 214 T, 188 P | |
| Fascia 1 destra | c5 | 231 F, 197 P | |
| Fascia 1 destra | c6 | box *Quanto costa al metro quadro*, 203 P, 226 F, 219 P | |
| Fascia 1 destra | c4-c5 | 240 R, poi Cerchiamo in c4 e c5 | |
| Fascia 2 | c1-c2 | barra "Rustici e terreni"; c1: 118 T, Cerchiamo; c2: 177 P, 143 P | |
| Fascia 2 | c3-c4 | box *Hanno comprato con noi* (2 col); sotto c3 *Vendi casa?*, c4 *L'agenzia* | |
| Fascia 2 | c5-c6 | barra "Affitti"; c5: 229 T, 248 P; c6: 235 P, 212 P, 250 P | |
| Piede | c1-c6 | riga del piede, crediti, dichiarazione, firma | `footer` |

Annunci con foto a retino sul foglio: 214, 231, 226, 240 (2), 152, 237, 209,
171 (2), 118, 229: 10 annunci su 22. Se il photo-editor trova meno serie
credibili, un F diventa P (stessa colonna, si aggiunge un Cerchiamo) e un T
resta T senza foto con attacco più grande: l'impaginato non cambia forma.

**Prima schermata a 1440 × 900 (controllo obbligatorio)**:
- in alto a sinistra ConceptBackButton, libero;
- testata intera fino a c4 (nome, riga, data, sommario), il filo nero;
- il riquadro di testa intero con il tratto dimostrativo su "Segna";
- a destra la barra nera "Appartamenti in vendita" **tagliata dal bordo
  destro** (c5 si vede per 222 px su 268), 214 intero con foto a retino in c4,
  231 tagliato in c5;
- sotto il riquadro, la barra "Case e villette" e l'inizio di 152 e 171;
- il molo in basso a destra copre la parte bassa di c4-c5: accettato, perché
  quella parte si raggiunge spostandosi e il molo ha il padding dedicato.

**Ordine del DOM e di lettura** (uguale a quello della colonna mobile, vedi
5.4): testata, riquadro, Appartamenti (con il listino dopo 226), Case e
villette, Rustici e terreni, Hanno comprato con noi, Vendi casa?, Affitti,
L'agenzia, piede. Sul foglio la posizione visiva è data dalla griglia
(`grid-area`), non dall'ordine del DOM. La tabulazione quindi salta da c4 a
c1 una volta (dagli Appartamenti alle Case): è accettabile perché il foglio
scorre sempre all'elemento col focus e l'ordine segue la logica delle rubriche.

### 5.2 Riquadro di testa (1440)

```
┌──────────────────────────── c1-c3 (844 × ~290) ─────────────────────────────┐
│                                                        │                    │
│  ▓▓▓▓▓▓                                                │ Come funziona      │
│  Segna le case che vuoi vedere.                        │ (Franklin 700)     │
│  Il giro di sabato lo prepariamo noi.                  │                    │
│  (Franklin 800, 2 righe, su c1-c2 = 556 px)            │ Passa              │
│                                                        │ l'evidenziatore    │
│  Fino a quattro case, un percorso, una mattina.        │ su una riga, o     │
│  Gli orari li calcoliamo noi, l'agente ti richiama     │ premi Evidenzia.   │
│  per confermare. (Newsreader 18/1,45, max 20 parole)   │ Poi Prepara il     │
│                                                        │ giro, qui in basso │
│                                                        │ a destra.          │
└──────────────────────────────────────────────────────────────────────────────┘
  bordo: nessuno. Separato dalla fascia dal filo nero sotto la testata e dalla
  barra "Case e villette" sotto. È un `section` con `h2` (il messaggio chiave).
```

- Il tratto dimostrativo su "Segna" è decorativo (`aria-hidden`), disegnato
  una volta sola all'apertura in 600 ms (reduced motion: già lì). Non è un
  annuncio: non entra nel giro, non ha bottone.
- "Come funziona" in c3 cita il molo con la sua posizione reale ("qui in basso
  a destra" su desktop, "qui in alto" su mobile): il testo cambia con la
  larghezza (due varianti dal copywriter).
- Nessun bottone nel riquadro.

### 5.3 Pagina intera (1440)

```
┌──────────────────────────────── finestra 1440 × 900 ──────────────────────────┐
│ [Torna in Ciceri Lab]                                                         │
│                                                                               │
│             ┌─────────────────────────────────────┐                           │
│             │ EVIDENZIA ░░░░ ░░░░░░               │  foglio intero in scala   │
│             │━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│  0,40 circa (1840×2060    │
│             │ ░░░░░░░░░░░░ │■■■■■■■■■■■■■■■■■■■■■│  in 740×830), centrato,   │
│             │ ░░░░░░░░░░░░ │░░▬░░ │░░░░░ │░░░░░░ │  su carta                 │
│             │■■■■■■■■■■■■■■│░░░░░ │░░░░░ │░░▬░░ │  i segni rosa sono        │
│             │░░▬░ │░░░░░░░░│░░░░░ │░░░░░ │░░░░░ │  l'unica cosa leggibile   │
│             │ …                                   │  a colpo d'occhio         │
│             └─────────────────────────────────────┘       ┌───────────────┐ │
│                                                            │ molo: barra   │ │
│                                                            │ del giro +    │ │
│                                                            │ Leggi / Pagina│ │
│                                                            │ intera (senza │ │
│                                                            │ minipagina)   │ │
│                                                            └───────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

- Scala = la più grande che fa stare il foglio intero nella finestra meno il
  molo e 32 px di aria; il foglio si centra nello spazio libero a sinistra del
  molo. La minipagina sparisce (sarebbe un doppione).
- **Puntatore**: in Pagina intera un clic o tocco in un punto del foglio torna
  a Leggi con quel punto al centro della finestra. Nessun tratto, nessuna
  scheda in Pagina intera: tutto il foglio è un unico bersaglio.
- **Tastiera**: il DOM non cambia (solo scala visiva). Se il focus entra in un
  annuncio (Tab) mentre si è in Pagina intera, il foglio torna a Leggi
  centrato su quell'annuncio e la regione live dice "Vista Leggi".
- Tratti rosa: in Pagina intera restano in scala; niente di nuovo si
  disegna.

### 5.4 La colonna del giornale piegato (375 × 667)

```
┌─────────────────────────────────────┐ 0
│ EVIDENZIA          (Franklin 900,   │  testata compatta, ~140 px
│                     ~52 px, 1 riga) │
│ sabato 3 ottobre 2026               │
│ Case in vendita e in affitto a      │
│ Pordenone e dintorni                │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ Appartamenti  Case e villette  Rus› │  striscia rubriche, 44 px
│ ▬ ▬ ░ ░          [ Prepara il giro ]│  barra del giro 48 px (poi sticky)
│                                     │
│ ▓▓▓▓▓▓                              │  RIQUADRO DI TESTA
│ Segna le case che vuoi vedere.      │  Franklin 800, ~30 px, 3-4 righe
│ Il giro di sabato lo prepariamo     │
│ noi.                                │
│ Fino a quattro case, un percorso,   │  Newsreader 16/1,45
│ una mattina…                        │
│ Come funziona: passa il dito in     │  la variante "qui in alto"
│ orizzontale su una riga, o premi    │
│ Evidenzia. Poi Prepara il giro,     │
│ qui in alto.                        │
│■ Appartamenti in vendita ■■■■■■■■■■■│  barra 36 px, sticky sotto la barra del giro
│ ▒▒▒▒▒▒ foto a retino ▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │  343 × 200
│ ▓▓ Torre, trilocale con garage      │ 667  ← fine della prima schermata
└─────────────────────────────────────┘
        [Torna in Ciceri Lab]  ← in basso a sinistra, sopra tutto
```

Ordine della colonna (dal brand-strategist 5.8, con i Rif.):
1. testata compatta, striscia rubriche, barra del giro;
2. riquadro di testa;
3. **Appartamenti in vendita**: 214 T, 231 F, 188 P, 197 P, 240 R, 226 F,
   203 P, 219 P; poi box *Quanto costa al metro quadro*;
4. **Case e villette**: 152 T, 171 R, 237 F, 209 F, 244 P, 166 P; poi box
   *Vendi casa?*;
5. **Rustici e terreni**: 118 T, 177 P, 143 P; poi box *Hanno comprato con
   noi* (le due citazioni una sotto l'altra);
6. **Affitti**: 229 T, 248 P, 235 P, 212 P, 250 P; poi box *L'agenzia*;
7. un solo annuncio **Cerchiamo** a chiusura di ogni rubrica (gli altri
   servono solo al foglio);
8. **Hai segnato**; piede; 88 px vuoti.

Adattamenti:
- ogni formato diventa largo 343 px; il riquadro R diventa una colonna con le
  due foto affiancate (170 × 120 ciascuna) e il bordo nero da 2 px;
- foto a retino: T 343 × 200, F 343 × 190;
- il bottone Evidenzia resta nell'ultima riga, 44 × 44 minimo (con testo);
- il tratto si fa con il pollice sulla riga d'attacco (gesto orizzontale,
  vedi 6.4);
- tra un annuncio e l'altro: filo retino da 1 px (come i filetti di
  colonna, ruotati), mai spazi vuoti grandi;
- **prima schermata a 375 × 667 (controllo obbligatorio)**: testata intera,
  barra del giro con **Prepara il giro** visibile, messaggio chiave intero
  col tratto dimostrativo, la barra "Appartamenti in vendita" e l'inizio di
  214. Se il messaggio chiave non ci sta, si accorcia "Come funziona", mai il
  messaggio.

### 5.5 La scheda della casa

**1440**

```
┌──── foglio oscurato 30% (resta visibile, clic = chiudi) ────┬──── SCHEDA 720 px, a tutta altezza ────────┐
│                                                             │ [← Rimetti nella pagina]         Rif. 214 │ 56 px, sticky
│  ░░░░  ░░░░░  (l'annuncio di origine resta al suo posto,    ├───────────────────────────────────────────┤
│  ░░░░  ░░░░░   "vuoto" come un ritaglio: filo tratteggiato  │ ▒▒▒▒ foto 1 (colore) ▒▒▒▒▒│▒▒ foto 2 ▒▒▒▒ │ 720 × 400,
│  ░░░░  ░░░░░   retino dove c'era)                           │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│▒▒▒▒▒▒▒▒▒▒▒▒▒ │ striscia a
│                                                             │ ‹  1 di 5  ›                              │ scorrimento
│                                                             │                                           │ orizzontale
│                                                             │ ▓▓ Torre, trilocale con garage            │ h2 (Franklin)
│                                                             │ Secondo piano con ascensore, balcone      │
│                                                             │ verso il cortile.                         │
│                                                             │ € 168.000                                 │ prezzo grande
│                                                             │ 2.050 €/m²: in zona Torre la media è 1.620│ una frase
│                                                             │ [✎ Evidenzia per il giro]   aria-pressed  │ 52 px
│                                                             │ ┌ La casa ─────┬ I costi ────┬ Fuori ───┐ │ 3 blocchi,
│                                                             │ │ 82 m² comm.  │ spese 75 €  │ garage   │ │ liste vere
│                                                             │ │ 74 m² calp.  │ autonomo    │ cantina  │ │ (dl)
│                                                             │ │ 3 locali …   │ classe D …  │ …        │ │
│                                                             │ └──────────────┴─────────────┴──────────┘ │
│                                                             │ Descrizione (Newsreader 18/1,5, max 90 p.)│
│                                                             │ La zona: 3 righe con distanze             │
│                                                             │ Planimetria catastale disponibile in      │
│                                                             │ agenzia.                                  │
│                                                             │ Nel giro? ripetizione in testo dello stato│
│                                                             │ (non un secondo bottone)                  │
└─────────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```

- Nella prima vista a 1440 × 900 ci stanno: barra, foto, attacco, prezzo,
  confronto e il toggle. La consistenza comincia sotto.
- La striscia foto: scorrimento nativo orizzontale con `scroll-snap`, bottoni
  ‹ › da 44 × 44 sopra la foto (in basso a destra), contatore "1 di 5" in
  testo. La prima foto parte dal retino (è l'immagine che c'era sul foglio) e
  passa al colore quando la versione a colori è caricata (vedi stati 5.7).
- Senza foto (piano B): al posto della striscia, una riga in Newsreader "Foto
  in agenzia, su richiesta." e la consistenza sale.
- La scheda scorre per conto suo; il foglio dietro è `inert` e non scorre.

**375**

```
┌─────────────────────────────────────┐
│ Rif. 214     [Rimetti nella pagina ✕]│  56 px, sticky; bottone a destra 44 px
├─────────────────────────────────────┤
│ ▒▒▒▒▒▒▒▒ foto 1 a tutta larghezza ▒▒│  375 × 250, scorrimento orizzontale
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│  con snap, "1 di 5" in basso
│ ▓▓ Torre, trilocale con garage      │
│ Secondo piano con ascensore…        │
│ € 168.000                           │
│ 2.050 €/m²: in zona Torre la media  │
│ è 1.620                             │
│ [✎ Evidenzia per il giro          ] │  larghezza piena, 52 px
│ La casa   (lista)                   │  i tre blocchi uno sotto l'altro
│ I costi   (lista)                   │
│ Fuori     (lista)                   │
│ Descrizione                         │
│ La zona                             │
│ Planimetria catastale…              │
│                                     │  88 px liberi (ConceptBackButton)
└─────────────────────────────────────┘
```

- La scheda sale dal punto dell'annuncio a tutto schermo; il tasto indietro
  la chiude (history, sezione 1).
- Il toggle è **uno solo**, nel flusso dopo il confronto: niente barra fissa
  in basso (lì c'è ConceptBackButton).

### 5.6 Il giro del sabato

**1440**

```
┌─ foglio visibile (1/3, oscurato 30%, ─┬──────────────── PANNELLO DEL GIRO (960 px, a tutta altezza) ───────────────────┐
│  con i suoi segni rosa)                │ Il giro del sabato                                       [Torna alla pagina ✕] │ 64 px
│                                        ├────────────────── MAPPA 520 px ──────────┬──── COLONNA DEL GIRO 440 px ───────┤
│  ░░▬░  ░░░░                            │                                         │ Sabato 3 ottobre                   │ h3
│  ░░░░  ░░▬░                            │   OSM, grayscale 35%, fondo carta       │ ( sabato 3 ott. ) ( sabato 10 )    │ radio
│                                        │        (1)▬                             │ Partenza  (9:00) (9:30) (10:00)    │ radio
│                                        │          ╲  percorso rosa largo          │ Da dove   (agenzia) (prima casa)   │ radio
│                                        │   [A]─────(2)▬                          │ ─────────────────────────────────  │
│                                        │              ╲                          │ 9:00  Agenzia, via Mazzini         │
│                                        │               (3)▬                      │ 9:10  ▬Torre, trilocale con garage▬│ tappa 1
│                                        │  [+][−]                                 │       € 168.000 · 10 min dal centro│
│                                        │                                         │       [Prima] [Dopo] [Togli]       │
│                                        │                                         │ 9:45  ▬Cordenons, bifamiliare▬     │ tappa 2
│                                        │                                         │ …                                  │
│                                        │ © OpenStreetMap contributors            │ Tragitti stimati in auto…          │
│                                        │                                         │ Ultima visita finisce alle 11:15.  │
│                                        │                                         │ ─────────────────────────────────  │
│                                        │                                         │ Chi sei                            │ h3
│                                        │                                         │ Nome  [____________________]       │
│                                        │                                         │ Telefono [_________________]       │
│                                        │                                         │ Email (facoltativa) [______]       │
│                                        │                                         │ Una nota (facoltativa) [___]       │
│                                        │                                         │ Sara ti richiama entro venerdì…    │
│                                        │                                         │ [ Manda il giro                  ] │ nero, 52 px
│                                        │                                         │ zona messaggi (aria-live)          │
└────────────────────────────────────────┴─────────────────────────────────────────┴────────────────────────────────────┘
```

- La mappa resta ferma (sticky dentro il pannello) mentre la colonna scorre.
- L'agenzia è il marcatore [A] (quadrato nero con la A in carta, non rosa: il
  rosa è solo delle case scelte dall'utente). Con "ci vediamo alla prima
  casa" [A] sparisce e il percorso parte dalla tappa 1.
- Ogni tappa ripete la riga d'attacco **con il suo tratto rosa** (lo stesso
  seme del foglio), l'orario d'arrivo grande a sinistra, prezzo e tragitto.
- Su desktop una tappa si può anche trascinare per l'intera riga (maniglia =
  tutta la tappa, cursore `grab`); i bottoni Prima / Dopo restano sempre.
- Ordine del DOM nel pannello: titolo, chiudi, **colonna del giro**, poi la
  mappa (vedi 6.10). Visivamente la mappa sta a sinistra (griglia CSS).

**375**

```
┌─────────────────────────────────────┐
│ Il giro del sabato  [Torna alla p. ✕]│  56 px sticky
├─────────────────────────────────────┤
│                                     │
│   MAPPA 45svh (min 220, max 360)    │  nel flusso, NON sticky: scorre via
│        (1)▬──(2)▬                   │
│   [A]╱                              │
│  [+][−]   © OpenStreetMap contrib.  │  attribuzione leggibile, 12 px min
├─────────────────────────────────────┤
│ Sabato 3 ottobre                    │
│ (sabato 3 ott.) (sabato 10 ott.)    │  2 bottoni radio affiancati, 48 px
│ Partenza (9:00)(9:30)(10:00)        │  3 bottoni radio, 48 px
│ Da dove (agenzia)(prima casa)       │
│ 9:10  ▬Torre, trilocale con garage▬ │
│       € 168.000 · 10 min dal centro │
│       [Prima] [Dopo] [Togli]        │  44 px ciascuno
│ …                                   │
│ Chi sei: 4 campi a larghezza piena, │  56 px alti, testo 17 px
│ tastiere giuste                     │
│ [ Manda il giro                   ] │  larghezza piena, 56 px
│ zona messaggi                       │
│ 88 px liberi                        │
└─────────────────────────────────────┘
```

- Con la tastiera del telefono aperta (rilevata con `visualViewport`) il campo
  attivo resta sotto la barra da 56 px (`scroll-margin-top: 72px`); la mappa è
  già uscita dallo schermo.
- Sotto i 480 px di altezza la mappa è alta 200 px fissi.

**Calcolo degli orari** (dal creative-director, qui con gli arrotondamenti
esatti): tragitto = distanza in linea d'aria × 1,35 / 28 km/h, arrotondato ai 5
minuti in su, minimo 5; visita 20 minuti per appartamenti e affitti, 30 per
case, villette e rustici, 15 per terreni e box; 5 minuti di margine tra una
visita e il tragitto successivo. Ordine iniziale: il più breve tra le
permutazioni (massimo 24), partendo dall'agenzia o, con "prima casa", tra
tutte le partenze possibili. Dopo che l'utente ha cambiato l'ordine a mano,
l'ordine non si ricalcola più da solo (anche aggiungendo case: la nuova va in
fondo), e compare il link "Rimetti l'ordine più breve".

### 5.7 Stati della prenotazione (tutti)

**A. Sul foglio (l'evidenziatore alimenta il giro)**

| Stato | Quando | Foglio / annuncio | Molo o barra | Messaggio (DOM, dove) |
|---|---|---|---|---|
| **Giro vuoto** | nessun annuncio segnato | nessun tratto | 4 posti vuoti; "Il giro è vuoto"; Prepara il giro attivo (apre lo stato vuoto) | nessuno |
| **Tratto in corso** | puntatore premuto e mosso > 6 px (mouse) o > 12 px orizzontali entro 30° (touch) | il tratto segue il puntatore, si accorcia tornando indietro | invariata | nessuno |
| **Tratto corto** | rilascio sotto il 55% della riga | il tratto si ritira (200 ms) | invariata | nessuno (nessun rimprovero) |
| **Aggiunto** | rilascio oltre il 55%, o bottone Evidenzia | il tratto si completa; il bottone diventa "Nel giro" (`aria-pressed=true`) | il primo posto vuoto riceve il tratto; la zona si aggiunge; la minipagina ha il segno | live: "Aggiunto al giro: Torre, trilocale con garage. Due case su quattro." |
| **Tolto** | ripassare il tratto, o bottone "Nel giro" | il rosa si scolora (250 ms) | i posti si ricompattano nell'ordine | live: "Tolto dal giro: …. Una casa su quattro." |
| **Pieno** | 4 annunci nel giro | invariato | 4 posti pieni; "Il giro è pieno" al posto di "Il tuo giro" | nessuno |
| **Quinto (scarico)** | tentativo col gesto o col bottone con 4 già nel giro | tratto pallido a strisce che si ferma a metà e si ritira; con il bottone: nessun tratto | i 4 posti restano; nessun movimento | sotto l'attacco, per 8 s o fino al gesto successivo: "Il giro del sabato sta in una mattina: quattro case. Togline una per mettere questa." + link "Vedi il tuo giro" (apre il pannello); lo stesso testo in live |
| **Gesto in Pagina intera** | trascinamento su un annuncio in Pagina intera | nessun tratto: il clic porta a Leggi | invariata | nessuno |
| **Giro mandato** | dopo il successo | tratti invariati | "Giro mandato per sabato 3 ottobre" al posto di "Il tuo giro"; il bottone resta **Prepara il giro** (riapre il pannello con lo stato "mandato") | nessuno |
| **Cambiato dopo l'invio** | aggiunta, tolta o riordino dopo il successo | normale | torna "Il tuo giro"; sotto, in piccolo: "Cambiato dopo l'invio" | nel pannello, vedi B |
| **Ritrovato** | rientro con giro salvato | tratti già disegnati (senza animazione) | posti pieni | nessun messaggio sul foglio |
| **Casa non più in pagina** | un Rif. salvato non esiste più nei dati | nessuno | posti ricompattati | nel pannello, riga in cima: "Una casa che avevi segnato non è più in pagina: è stata venduta o ritirata." |
| **Da URL** | `?segna=` senza giro salvato | tratti disegnati senza animazione | posti pieni | live: "Nel tuo giro ci sono già due case, segnate dal link che hai aperto." |
| **Senza storage** | localStorage assente o bloccato | normale | normale | nessuno (funziona nella sessione) |

**B. Nel pannello del giro**

| Stato | Quando | Mappa | Colonna | Focus |
|---|---|---|---|---|
| **Apertura** | Prepara il giro | area carta con la scritta "Carico la mappa di Pordenone." (niente spinner); Leaflet e tile si caricano solo ora | già completa: orari calcolati subito | titolo del dialogo |
| **Mappa pronta** | primo tile arrivato | `fitBounds` su agenzia e tappe; il percorso si traccia in 900 ms (reduced motion: intero) | invariata | invariato |
| **Vuoto** | 0 case | Pordenone intera, con i nomi delle zone degli annunci come etichette nere piccole | "Il giro è vuoto. Passa l'evidenziatore su un annuncio, o premi Evidenzia, e la casa comparirà qui." Due annunci da cui partire (214 e 231) con la riga d'attacco e il loro bottone **Evidenzia** funzionante. Niente "Chi sei", niente Manda il giro | titolo |
| **Una casa** | 1 | un marcatore e [A], percorso di un tratto | "Una casa sola va benissimo. Il giro può arrivare a quattro." | |
| **Due-quattro case** | 2-4 | marcatori numerati, percorso | tappe con orari; con 4: nessuna riga in più | |
| **Tappa col focus** | focus o passaggio su una tappa | il suo marcatore si ingrandisce di poco (nessun colore nuovo) | la tappa ha il contorno di focus | |
| **Marcatore toccato** | clic o Invio su un marcatore | invariata | la colonna scorre alla tappa, che riceve il focus | tappa |
| **Riordino** | Prima / Dopo / trascinamento | percorso ridisegnato (senza animazione del tracciato, solo sostituito) | orari ricalcolati; compare "Rimetti l'ordine più breve"; live: "Torre ora è la tappa 1, arrivo alle 9:10." | resta sul bottone premuto (che segue la tappa nella nuova posizione) |
| **Togli dal pannello** | Togli | marcatore sparisce | tappa sparisce; il tratto sul foglio si scolora; live: "Tolto dal giro: …" | tappa successiva, o titolo se era l'ultima |
| **Ultima casa tolta** | da 1 a 0 | come Vuoto | come Vuoto; i campi già scritti restano in memoria, nascosti | titolo |
| **Sforamento** | l'ultima visita finisce dopo le 12:30 | invariata | riga sopra "Chi sei", nera con segno "!" in testo: "L'ultima visita finirebbe alle 12:50: parti alle 9:00 o togli una casa." Non blocca l'invio | |
| **Sabato troppo vicino** | dopo venerdì alle 12:00, o di sabato | invariata | la scelta del sabato parte dal sabato dopo; riga: "Per questo sabato è tardi: ti proponiamo sabato 10 ottobre." | |
| **Sabato di chiusura** | sabato nei dati di chiusura (26/12/2026, 2/1/2027) | invariata | quel sabato non è tra le scelte; riga: "Sabato 26 dicembre siamo chiusi." | |
| **Giro salvato ormai passato** | il sabato salvato è nel passato | invariata | si passa al primo sabato possibile; riga: "Il giro di sabato 3 ottobre è passato. Le case segnate sono ancora qui: scegli un altro sabato." Lo stato "mandato" si azzera | |
| **Mappa lenta** | nessun tile entro 8 s, o 3 errori di tile di fila, o offline | riquadro di carta: "La mappa non si carica. Il giro resta valido: ecco le tappe in ordine." + link "Apri la zona su openstreetmap.org" (nuova scheda, `rel="noopener"`) | identica | invariato |
| **Leaflet non caricato** | `import()` fallito | come Mappa lenta | identica | |
| **Campi non validi** | invio con nome vuoto, telefono non italiano, email scritta ma non valida | invariata | errore sotto ogni campo (vedi 6.11); riepilogo in cima al modulo solo se gli errori sono 2 o più ("Controlla due campi: nome e telefono.") | primo campo con errore |
| **Invio in corso** | Manda il giro valido | invariata | bottone "Mando il giro…" disattivato (`aria-disabled`), campi in sola lettura; live "Mando il giro…" | resta sul bottone |
| **Successo** | invio simulato riuscito (circa 1,2 s) | percorso e marcatori invariati | in cima alla colonna, riga nera: "Giro mandato. Sara ti richiama entro venerdì alle 18 per confermarlo." Sotto: **Aggiungi al calendario** (scarica `.ics`). Il modulo si chiude in una riga: "Mandato a nome di Elisa, telefono che finisce con 42. Cambia." Nessuna cartolina, ricevuta, timbro | la riga di successo (`tabindex="-1"`) |
| **Calendario scaricato** | clic su Aggiungi al calendario | | sotto il link: "Il file ha quattro visite: aprilo per metterle nel tuo calendario." Se il download non è possibile (browser dentro un'app), il link apre il `.ics` in una nuova scheda | invariato |
| **Mandato, riaperto** | Prepara il giro dopo il successo | invariata | la riga di successo è in cima, con la data; nessun modulo aperto | titolo |
| **Cambiato dopo l'invio** | modifica dopo il successo | invariata | la riga diventa: "Hai cambiato il giro dopo averlo mandato. Mandalo di nuovo e Sara vedrà l'ultimo." Il modulo si riapre già compilato (dati in memoria); il bottone resta **Manda il giro** | |
| **Invio fallito** | offline (`navigator.onLine === false`) o errore simulato | invariata | sotto il bottone: "Non è partito. Il giro è salvato su questo telefono: chiamaci e lo confermiamo a voce." (chiamaci = link `tel:`). I campi restano | il messaggio |
| **Chiusura** | Torna alla pagina, `Esc`, clic sul foglio visibile, indietro | la mappa si smonta (i tile non restano in memoria) | | il bottone che ha aperto il pannello |

Solo il successo invia `track("demo_prenotazione", { concept: 16, case: n })`.
L'apertura della pagina invia `track("apri_concept", { concept: 16 })`.
Nient'altro si traccia (unione chiusa di `TrackEvent`).

**C. Nella scheda della casa**

| Stato | Quando | Cosa si vede |
|---|---|---|
| **Apertura** | clic o Invio sull'attacco | stacco tipo FLIP (420 ms), foto 1 a retino che passa al colore appena caricata |
| **Foto a colori in arrivo** | la versione a colori non è ancora arrivata | resta la versione a retino (è già in cache dal foglio), a tutta larghezza, senza scheletri |
| **Foto non caricata** | errore di una foto | quella foto si toglie dalla striscia; il contatore si aggiorna; se erano tutte: la riga "Foto in agenzia, su richiesta." |
| **Senza foto** | annuncio senza serie | riga "Foto in agenzia, su richiesta.", consistenza più in alto |
| **Nel giro / non nel giro** | toggle | lo stesso stato dell'annuncio; al cambio, la live region del foglio annuncia |
| **Quinto dalla scheda** | toggle con 4 nel giro | sotto il toggle, il messaggio del quinto con "Vedi il tuo giro" |
| **Da URL** | `#scheda-214` all'arrivo | apertura senza stacco |
| **Rif. inesistente da URL** | `#scheda-999` | nessuna scheda; hash rimosso con `replaceState`; nessun errore visibile |

---

## 6. Accessibilità per ogni interazione

Per ogni voce: **tastiera**, **lettore di schermo (LS)**, **reduced motion
(RM)**, **zoom 400%**.

### 6.1 Base di pagina

- Punti di riferimento: `header` (testata), `main` (il foglio, che è anche il
  contenitore scorrevole con `tabindex="0"`, `role="region"` e nome
  "Pagina degli annunci"), `aside` "Il tuo giro" (molo o barra), `footer`
  (piede). Un solo `h1` (la testata *EVIDENZIA*, con dentro la riga "Case in
  vendita e in affitto a Pordenone e dintorni" come testo in `span`), `h2`
  per riquadro, rubriche e box, `h3` per gli annunci.
- `lang="it"`. Corpo minimo 15 px desktop, 16 px mobile; campi 17 px.
- Focus visibile: contorno nero 2 px con 2 px di stacco color carta, su tutto
  (attacchi, Evidenzia, posti, tappe, marcatori, campi). Mai coperto dal molo
  o da ConceptBackButton: `scroll-padding` del foglio (alto 72, basso 320 da
  640 px in su; alto 96 e basso 88 sotto i 640 px).
- Area di tocco minima 44 × 44; bottoni principali 48-56 px.
- Una sola regione live educata (`aria-live="polite"`, `role="status"`) per
  il giro, fuori dal foglio, sempre montata; i messaggi si sostituiscono, non
  si accumulano.
- Il rosa non porta mai informazione da solo: ogni stato "nel giro" è detto
  anche dal testo del bottone ("Nel giro"), da `aria-pressed` e dai posti con
  nome.
- Nessun lampeggio: tutti i movimenti sono singoli; nessun cambio di colore
  di grandi superfici (l'oscuramento del foglio a 30% avviene una volta per
  apertura, 200 ms).

### 6.2 Spostare il foglio (≥ 640 px)

- **Tastiera**: il foglio è un contenitore scorrevole focalizzabile: frecce,
  Pagina su / giù, Home / Fine sono quelli nativi. `+` e `-` con il focus sul
  foglio passano tra Leggi e Pagina intera (nessuna scorciatoia globale a
  lettera singola). Il focus su un elemento fuori vista fa scorrere il foglio
  per mostrarlo intero (`scrollIntoView({ block: "nearest", inline:
  "nearest" })` più gli `scroll-padding`).
- **Puntatore**: rotella e trackpad nativi nei due assi; spazio + trascina
  ovunque; trascina su canaletti, barre di rubrica, testata e spazi vuoti;
  rettangolo della minipagina.
- **LS**: il foglio si legge in ordine di DOM; la posizione visiva non conta.
  La minipagina è `aria-hidden="true"` e non è focalizzabile (le sue funzioni
  sono coperte da tastiera, sommario e posti del giro).
- **RM**: lo spostamento da sommario, posti e minipagina salta invece di
  scorrere.
- **Zoom 400%**: una finestra da 1280 px diventa 320 px CSS, quindi sotto i
  640 px vale la colonna: niente scorrimento in due assi (WCAG 1.4.10).

### 6.3 Leggi / Pagina intera

- Due `button` con `aria-pressed` dentro un gruppo "Vista della pagina".
- **Tastiera**: Tab e Invio/Spazio; `+` / `-` sul foglio.
- **LS**: al cambio, live "Vista Pagina intera: tutta la pagina in uno
  schermo" / "Vista Leggi".
- **Pagina intera e focus**: vedi 5.3 (il focus che entra in un annuncio
  riporta a Leggi).
- **Tablet (touch, 640-1023 px)**: il pizzico con due dita **dentro il foglio**
  passa tra i due livelli, come chiede il creative-director (`touch-action:
  pan-x pan-y` sul foglio). Limite dichiarato: dentro il foglio il pizzico del
  browser è sostituito da questi due livelli. Compensazioni: Leggi è già a
  15 px, il pizzico del browser resta disponibile nella scheda e nel giro, lo
  zoom del browser da impostazioni funziona (a 200% si passa alla colonna
  sotto i 640 px CSS). Sotto i 640 px il pizzico non è mai intercettato.
- **RM**: il cambio di scala è istantaneo.
- **Zoom 400%**: non presente (colonna).

### 6.4 L'evidenziatore (gesto firma)

- **Puntatore (mouse, penna)**: premi su un annuncio evidenziabile e trascina
  in orizzontale (> 6 px); soglia 55% al rilascio. Annullabile: se prima del
  rilascio torni all'inizio o esci dall'annuncio di oltre 40 px in verticale,
  il tratto si ritira (conforme a "annullamento del puntatore", WCAG 2.5.2).
- **Touch sul foglio (640-1023 px)**: il tratto parte **solo dalla riga
  d'attacco** (zona di presa alta almeno 44 px); il resto dell'annuncio sposta
  il foglio. Così un dito può sempre spostare il foglio anche sopra gli
  annunci. Sulla riga d'attacco: `touch-action: pan-y`, il gesto orizzontale
  (entro 30°, > 12 px) disegna, quello verticale scorre.
- **Touch sulla colonna (< 640 px)**: tutto l'annuncio ha `touch-action:
  pan-y`; il gesto orizzontale disegna sulla riga d'attacco anche se parte
  sulla descrizione (il tratto va sempre sull'attacco, come dice il
  creative-director).
- **Alternativa a un solo tocco / tasto (WCAG 2.5.1, 2.5.7)**: il bottone
  Evidenzia, sempre visibile, fa esattamente lo stesso (il tratto si disegna da
  solo in 350 ms).
- **Tastiera**: Tab raggiunge l'attacco (apre la scheda) e poi Evidenzia
  (toggle). Nessun gesto richiede il puntatore.
- **LS**: "Evidenzia per il giro, Rif. 214, pulsante interruttore, non
  premuto"; esito in live region (testi in 5.7 A). Il tratto è `aria-hidden`.
- **Vibrazione**: 10 ms solo all'aggiunta, solo se `navigator.vibrate` esiste,
  mai in RM? No: la vibrazione non è movimento visivo; resta, ma non si ripete
  mai.
- **RM**: il tratto compare intero al rilascio o al bottone, niente
  disegno progressivo né ritiro animato; il "tratto scarico" è un tratto
  pallido fermo a metà per 600 ms, poi sparisce senza animazione.
- **Zoom 400%**: colonna; bottone Evidenzia a larghezza naturale, mai
  tagliato; il messaggio del quinto va a capo sotto l'attacco.
- **Selezione di testo**: disattivata solo sugli annunci evidenziabili del
  foglio; attiva nella scheda, nei box, nel giro.

### 6.5 Aprire la scheda (attacco)

- `button` dentro l'`h3`; nome = testo dell'attacco; `aria-haspopup="dialog"`.
- **Tastiera**: Invio o Spazio. **LS**: "Torre, trilocale con garage,
  pulsante". **RM**: dissolvenza di 150 ms invece dello stacco. **Zoom 400%**:
  la scheda è a tutto schermo e scorre in verticale; la barra sticky alta 56 px
  resta l'unico elemento fisso.

### 6.6 La scheda (dialogo)

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` = attacco (`h2`
  della scheda). Foglio e molo `inert`; ConceptBackButton resta cliccabile ma
  fuori dal ciclo di tabulazione.
- Focus all'apertura: il titolo della scheda (`tabindex="-1"`), non il
  bottone chiudi (chi usa LS sente subito di quale casa si tratta).
- Ciclo di Tab dentro la scheda. `Esc` chiude. Chiusura: il focus torna
  all'attacco dell'annuncio.
- **Striscia foto**: regione "Foto della casa, 5", `tabindex="0"` per lo
  scorrimento da tastiera con le frecce; bottoni ‹ › "Foto precedente" /
  "Foto successiva"; ogni foto ha un `alt` che descrive cosa si vede
  ("Cucina con finestra sul cortile") dal copywriter. Il contatore è testo.
- **Consistenza**: tre `dl` (termine e valore), leggibili in ordine.
- **RM**: nessuno stacco, nessuna transizione retino-colore (la foto a colori
  compare quando è pronta, senza dissolvenza).
- **Zoom 400%**: i tre blocchi della consistenza sono uno sotto l'altro;
  nessun testo in immagini.

### 6.7 Posti del giro e riepilogo "Hai segnato"

- Desktop: 4 `button` (solo quelli pieni sono attivi; i vuoti sono testo
  nascosto "posto libero" dentro una lista "Il tuo giro, 2 case su 4").
  Invio porta all'annuncio e gli dà il focus.
- Mobile: posti non interattivi (troppo piccoli); il nome del gruppo dice lo
  stato. La navigazione ai segnati è "Hai segnato" (lista di link) in fondo.
- **RM**: salto invece di scorrimento. **Zoom 400%**: la barra sticky resta
  alta 48 px; il testo "Il tuo giro" non c'è, i posti sì.

### 6.8 Prepara il giro

- `button` con `aria-haspopup="dialog"`, testo sempre uguale. Con giro vuoto
  resta attivo (apre lo stato vuoto che insegna il gesto): nessun bottone
  disattivato senza spiegazione.

### 6.9 Il pannello del giro (dialogo)

- Come la scheda: `role="dialog"`, `aria-modal`, titolo "Il giro del sabato"
  con la data, focus al titolo, `Esc` chiude, focus restituito a Prepara il
  giro (o al posto / link che l'ha aperto).
- Scelte (sabato, partenza, da dove): `fieldset` con `legend` e `radio` veri
  resi come bottoni; frecce per muoversi, Spazio per scegliere. Al cambio,
  live con il nuovo orario dell'ultima visita.
- Tappe: `ol` con ogni tappa `li` che contiene orario (in `time`), attacco,
  prezzo, tragitto e i bottoni. Nomi: "Sposta prima: Torre", "Sposta dopo:
  Torre", "Togli dal giro: Torre". Prima è assente sulla prima tappa, Dopo
  sull'ultima (non disattivati: assenti, per non avere fermate morte).
- Trascinamento su desktop: solo un'aggiunta per il puntatore; mai l'unico
  modo (WCAG 2.5.7).
- **RM**: il percorso compare intero, i riordini non animano.
- **Zoom 400%**: layout mobile; la mappa è alta 200 px nel flusso; la colonna
  è lineare; il bottone Manda il giro è nel flusso, mai sticky.

### 6.10 La mappa

- La mappa è **supplementare**: tutto quello che mostra è nella colonna
  (tappe, orari, zone, tragitti). Nel DOM viene dopo la colonna, con un
  titolo nascosto "Mappa del giro: le stesse tappe dell'elenco".
- Contenitore Leaflet focalizzabile (frecce spostano, `+` / `-` zoomano,
  comportamento nativo di Leaflet); controlli di zoom `button` 44 × 44 con
  nome "Avvicina" / "Allontana".
- Marcatori: `divIcon` con `role="button"`, `tabindex="0"`, nome "Tappa 2,
  Cordenons, arrivo alle 9:45"; Invio porta alla tappa nella colonna.
  L'agenzia: "Partenza, agenzia in via Mazzini, 9:00".
- Attribuzione OSM sempre visibile e leggibile (min 12 px, nero su carta),
  link raggiungibile da tastiera.
- **RM**: nessuna animazione di `fitBounds` né del tracciato; zoom senza
  animazione (`zoomAnimation: false`).
- **Zoom 400%**: altezza fissa 200 px; nessun elemento della mappa copre la
  colonna.

### 6.11 Il modulo "Chi sei"

- Etichetta visibile sopra ogni campo; nessun segnaposto come etichetta.
- Nome: `autocomplete="name"`, obbligatorio. Telefono: `type="tel"`,
  `inputmode="tel"`, `autocomplete="tel"`, obbligatorio; valido se, tolti
  spazi, punti e trattini, è `+39` o `0039` facoltativo seguito da un fisso
  (0 e 6-10 cifre) o un mobile (3 e 9-10 cifre). Email: `type="email"`,
  `autocomplete="email"`, facoltativa, validata solo se scritta. Nota:
  `textarea` di 3 righe, massimo 300 caratteri, contatore solo dagli ultimi 30.
- Accanto al telefono, testo d'aiuto collegato con `aria-describedby`: "Lo
  usiamo solo per confermare il giro."
- Validazione all'uscita dal campo (solo se il campo è stato toccato) e
  all'invio; mai a ogni carattere. Errore: testo nero sotto il campo con
  segno "!" in testo, `aria-invalid="true"`, bordo del campo da 1 a 3 px (non
  solo colore; il rosa non si usa per gli errori).
- **RM**: nessun effetto. **Zoom 400%**: campi a larghezza piena, etichette
  sopra, errori sotto, nessun testo tagliato.

### 6.12 Aggiungi al calendario

- Link (`a` con `download="giro-del-sabato.ics"` e `href` a un Blob): è una
  navigazione a un file, quindi link, non bottone. Nome: "Aggiungi al
  calendario, file con 3 visite". Contenuto: un `VEVENT` per tappa (titolo
  "Visita: Torre, trilocale con garage (Rif. 214)", inizio e fine, luogo
  "Torre, Pordenone", descrizione "Indirizzo esatto alla conferma"), fuso
  `Europe/Rome`.

### 6.13 Striscia delle rubriche (mobile) e sommario (desktop)

- `nav` "Rubriche": lista di link alle ancore delle barre; dopo il salto il
  focus va all'`h2` della barra. `aria-current="location"` sulla rubrica in
  cui sei (mobile).
- **RM**: salto. **Zoom 400%**: la striscia scorre in orizzontale al suo
  interno (eccezione ammessa: è una barra di strumenti), voci mai tagliate a
  metà parola.

### 6.14 Data del sabato e prerender

- La data è calcolata nel client (fuso `Europe/Rome`). Il prerender stampa lo
  spazio della riga già riservato (larghezza minima della data più lunga,
  "sabato 26 settembre 2026") e la data compare al montaggio senza spostare
  nulla. Nel frattempo il testo nel prerender è "sabato" seguito da uno spazio
  vuoto riservato, non una data sbagliata.
- La data della testata e il sabato del giro seguono le regole del
  brand-strategist (9.3): testata = sabato che viene, oggi se è sabato; giro =
  questo sabato se entro venerdì alle 12:00, altrimenti il successivo;
  sabati di chiusura saltati.

---

## 7. Conversione

**Un solo intento, una sola etichetta**: **Prepara il giro** (apre il
pannello del giro). Dove compare:

| Posizione | Larghezza | Note |
|---|---|---|
| Molo in basso a destra | ≥ 640 px | sempre visibile, anche in Pagina intera |
| Barra del giro in alto | < 640 px | sticky dopo la testata |
| Hai segnato, in fondo alla colonna | < 640 px | dopo l'elenco dei segnati |
| Messaggio del quinto | tutte | come link "Vedi il tuo giro" (stesso pannello, testo diverso perché il contesto è "guarda cosa hai già") |

Non compare: nel riquadro di testa (il gesto si fa sugli annunci), nella scheda
(lì il richiamo è il toggle **Evidenzia per il giro**), nei box.

**Azioni sull'annuncio** (non sono richiami): Evidenzia (bottone), attacco
(apre la scheda). Sempre due, sempre nello stesso posto.

**Conversione principale**: **Manda il giro** nel pannello (1-4 case, nome,
telefono). È la prenotazione unica di questo concept: un percorso di visite
su mappa vera, non un modulo a passi.

**Conversioni alternative**:
- "Chiama" e "Scrivi" nel box *L'agenzia* (link `tel:` e `mailto:`, nessun
  numero in vista);
- "Chiama" e "Passa in agenzia" nel box *Vendi casa?* (il secondo pubblico,
  chi vende: nessun modulo, come dice il creative-director);
- "chiamaci" nel messaggio di invio fallito;
- "Apri in Maps" nel box *L'agenzia*.

**Cosa abbassa l'attrito**:
- non si chiede nulla finché non si è costruito qualcosa: il modulo compare
  solo con almeno una casa nel giro;
- gli orari sono già calcolati prima di chiedere il telefono (valore prima
  della richiesta);
- tre campi opzionali su quattro sono davvero opzionali; niente registrazione;
- lo stato vuoto ha due annunci pronti da evidenziare dentro il pannello:
  chi apre il giro per curiosità può riempirlo senza uscire;
- il giro si salva: chi chiude e torna domani ritrova tutto.

**Tracciamento**: solo `apri_concept` all'apertura e `demo_prenotazione` al
successo (`{ concept: 16, case: n }`). Nessun evento di micro-conversione:
l'unione `TrackEvent` del sito è chiusa.

**Per Luca (meta-conversione)**: il piede firma "Un concept di CiceriLab"; un
agente immobiliare deve uscire pensando "i miei clienti mi manderebbero il
giro già fatto".

---

## 8. Consegne ad altri agent

- **copywriter**: tutti i testi segnaposto di questo documento (stati in 5.7,
  nomi accessibili in 6); due varianti di "Come funziona" (molo in basso a
  destra / barra in alto); per ogni annuncio P e F una descrizione corta (2
  righe) e una lunga (3 righe); 4 annunci "Cerchiamo" (tappabuchi, non
  evidenziabili); `alt` per ogni foto; il nome che richiama è **Sara**.
- **tech-architect / scaffold**: store del giro unico (Rif., ordine,
  ordine manuale sì/no, partenza, da dove, sabato, mandato + impronta);
  `localStorage` chiave `evd-giro` in try/catch; hash `#scheda-<rif>` e `#giro`
  con `pushState` / `popstate`; `?segna=` e `?rubrica=`; `inert` su foglio e
  molo quando un dialogo è aperto; un'unica regione live fuori dal foglio;
  Leaflet solo con `import()` all'apertura del giro, smontato alla chiusura;
  invio simulato 1,2 s con fallimento riproducibile offline; calcolo del
  sabato in `Europe/Rome`.
- **art-director**: misure del foglio (5, 5.1) e formati (5.0) sono vincoli
  di impaginato; le altezze delle foto sono fisse; il marcatore dell'agenzia
  è nero, non rosa.
- **motion-designer**: movimenti ammessi = quelli del creative-director più:
  sticky della barra del giro (nessuna animazione di comparsa), oscuramento del
  foglio all'apertura dei livelli (200 ms, una volta), passaggio Leggi /
  Pagina intera (scala, 300 ms circa; RM istantaneo).
- **interaction-designer**: presa del tratto su touch da 640 px in su solo
  dalla riga d'attacco (6.4); annullamento del tratto (6.4); trascinamento
  delle tappe come aggiunta.
- **accessibility-auditor**: la sezione 6 è la checklist di collaudo, a 375,
  768 e 1440, più zoom 400% da 1280.
- **responsive-tester**: controlli obbligatori: prima schermata a 1440 × 900
  (5.1) e a 375 × 667 (5.4); barra "Appartamenti" tagliata al bordo destro a
  1440; ConceptBackButton mai sopra un elemento col focus; ultimo link del
  piede e bottone Manda il giro raggiungibili sopra ConceptBackButton a 375;
  molo ridotto sotto i 560 px di altezza; attribuzione OSM leggibile a 375.

## Richieste ad altri agent

- **orchestratore / creative-director**: in `creative-director.md` 4.10 le
  porte sono scritte "9160-9179", ma la tabella di `docs/ruoli-agent.md` dà a
  EVIDENZIA **9160-9169** (9170-9179 sono di 17 MADRE). Da correggere nel doc
  del creative-director; tutti gli agent usino 9160-9169.
- **creative-director** (presa d'atto): la matrice citava la planimetria nella
  scheda, già esclusa dal creative-director; qui confermato. Aggiunti due
  elementi non previsti e coerenti con il giornale: il **sommario** in testata
  (serve alla tastiera) e gli annunci **Cerchiamo** (pareggiano le colonne).
  L'orecchia in testata (c6) è facoltativa.
- **tech-architect**: i file esclusivi seguano i nomi di "Sezioni da
  costruire" qui sotto.

---

## Sezioni da costruire

Nove sezioni, una per section-builder. Nomi in kebab-case; ognuna prende i
testi solo da `content/testi.ts` e legge/scrive il giro solo dallo store.

1. **`testata`**: testata del foglio (h1 *EVIDENZIA*, riga descrittiva, data
   del sabato calcolata nel client con spazio riservato, sommario delle
   rubriche, orecchia in c6), versione compatta mobile con la striscia delle
   rubriche scorrevole e `aria-current`; link di salto "Vai agli annunci" e
   "Vai al tuo giro".
2. **`riquadro-di-testa`**: il box-hero in c1-c3 (messaggio chiave su 556 px,
   frase di 20 parole, "Come funziona" in due varianti per larghezza), con il
   tratto dimostrativo su "Segna" disegnato una volta (già lì in RM); versione
   colonna a 375.
3. **`foglio`**: il contenitore scorrevole nei due assi e l'impaginato a tre
   fasce (griglia di 5.1 con le `grid-area` di ogni blocco), la colonna sotto i
   640 px nell'ordine di 5.4, gli annunci "Cerchiamo" e il pareggio delle
   colonne, lo spostamento (spazio + trascina, canaletti, barre), `+` / `-`,
   i livelli **Leggi / Pagina intera** con i loro bottoni, la **minipagina**,
   gli `scroll-padding` per molo e ConceptBackButton.
4. **`annunci`**: il componente annuncio nei quattro formati (P, F, T, R)
   con foto a retino ad altezza fissa, attacco-bottone che apre la scheda,
   bottone Evidenzia con `aria-pressed`, il **tratto dell'evidenziatore**
   (gesto puntatore/touch con soglia 55%, completamento, ritiro, rimozione,
   quinto "scarico", seme per annuncio, RM), le barre nere delle rubriche
   (sticky su mobile) e il messaggio del quinto.
5. **`box-redazionali`**: *Quanto costa al metro quadro* (tabella zona/€/m²
   in cifre tabellari), *Vendi casa?* (con Chiama / Passa in agenzia), *L'agenzia*
   (persone, indirizzo, orari, Chiama / Scrivi / Apri in Maps), *Hanno comprato
   con noi* (2 colonne, due citazioni), nelle posizioni del foglio e della
   colonna.
6. **`barra-del-giro`**: il molo desktop (4 posti-bottone, zone, Prepara il
   giro, versione ridotta sotto i 560 px di altezza) e la barra sticky mobile
   (posti di stato, Prepara il giro), il riepilogo **Hai segnato** in fondo
   alla colonna, la regione live unica del giro con tutti i messaggi di 5.7 A.
7. **`scheda-casa`**: il dialogo della casa (stacco FLIP dall'annuncio e
   ritorno, 720 px a destra su desktop, tutto schermo su mobile), striscia
   foto con snap e passaggio retino-colore, prezzo e confronto €/m², toggle
   Evidenzia per il giro, consistenza in tre `dl`, descrizione, zona, riga
   planimetria, piano B senza foto, history `#scheda-<rif>`, focus e `inert`.
8. **`giro-mappa`**: la mappa OpenStreetMap del pannello (Leaflet con
   `import()` dinamico, tile OSM secondo le regole d'uso, `maxBounds` e zoom
   12-17, grayscale 35%), marcatori a tratto rosa numerati e agenzia nera,
   percorso rosa largo in `multiply` tracciato in 900 ms, stati di
   caricamento ed errore (8 s, 3 errori, offline, import fallito) con il
   riquadro sostitutivo e il link a openstreetmap.org, accessibilità di 6.10.
9. **`giro-colonna`**: il dialogo del giro e la sua colonna (sabato,
   partenza, da dove), calcolo di ordine e orari (5.6), tappe con tratto,
   Prima / Dopo / Togli e trascinamento, sforamento delle 12:30, sabati
   (troppo vicino, chiusura, passato), stato vuoto con i due annunci da cui
   partire, modulo "Chi sei" con validazione, invio simulato, successo con
   **Aggiungi al calendario** (`.ics`), invio fallito, "cambiato dopo l'invio",
   `track("demo_prenotazione")`, history `#giro`, e il piede del foglio non
   c'entra (va con `testata`? no: vedi sotto).

Nota sul **piede** del foglio (riga del piede, crediti foto, "Attività
inventata", "Un concept di CiceriLab"): è piccolo e va al builder di
`box-redazionali`, che ne condivide la tipografia di servizio.
