# UX architect · Concept 15 · NOVANTA, fisioterapia e osteopatia (Pordenone)

Ondata 1. Rotta `/concept-15`. Base vincolante: `docs/creative-director.md`
(variante C "Al bordo"). Questo documento decide **struttura, URL, percorsi,
ordine di lettura, geometrie, stati e accessibilità**. Non decide colori
definitivi, easing o testi finali (art-director, motion-designer,
interaction-designer, copywriter): i testi qui sotto sono segnaposto di
lunghezza e di tono, da sostituire.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`concepts/10-torchio/docs/integrazione-sito.md`,
`concepts/10-torchio/src/components/ConceptBackButton.tsx` (misure vere del
bottone), `concepts/15-novanta/docs/creative-director.md`,
`.claude/skills/design-taste-frontend/SKILL.md` (sez. 4.7, 5, 6),
`concepts/10-torchio/docs/ux-architect.md` (solo formato),
`docs/matrice-concept-11-20.md` (riga 15).

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, un solo `·` per riga, niente occhielli "01 ·", niente maiuscoletto
spaziato. Un solo intento di prenotazione con una sola etichetta:
**"Prenota"** (porta il braccio a 90°). Il bottone finale della prenotazione
dice cosa fa ("Fissa le due visite"), non è un secondo richiamo.

Decisioni che questo documento prende al posto della direzione (dove la
direzione lasciava aperto):
1. **Prezzi e dove restano insieme a 180°** (sez. 5.8), in due blocchi
   interni; indirizzo, orari e telefono si ripetono anche nel piede della
   vista elenco.
2. **Conflitto quadrante / ConceptBackButton sotto 640 px risolto con il
   "basamento"** (sez. 2.3): il quadrante si appoggia su una fascia che è il
   lato dritto del goniometro, e il bottone del sito vive lì sotto.
3. **Su desktop il raggio del disco è limitato** perché la tacca dei 180° e
   la sua parola non finiscano sotto il bottone in alto a sinistra (sez. 2.2).
4. **In modalità quadrante le sei sezioni non attive sono `inert`** (sez.
   6.1): la struttura DOM completa resta sempre (prerender, vista elenco), ma
   niente focus invisibile. La lettura lineare completa è a un tasto:
   "Leggi in elenco".

---

## 1. Sitemap e URL

SPA a pagina singola, una rotta, sette angoli con frammento, nessuno scroll di
pagina in modalità quadrante.

```
/                                   ← Ciceri Lab (uscita: ConceptBackButton del sito)
└── /concept-15                     NOVANTA
    ├── #gradi-0     da zero          apertura, chi siamo, per chi, [Prenota]   <section>
    ├── #gradi-30    primo incontro   la prima visita in quattro momenti         <section>
    ├── #gradi-60    trattamenti      fisioterapia, voce per voce                <section>
    ├── #gradi-90    prenota          LA SETTIMANA A RUOTA (conversione)         <section>
    ├── #gradi-120   osteopatia       cos'è, quando sì, quando no                <section>
    ├── #gradi-150   esercizi         tre esercizi con angolo obiettivo          <section>
    └── #gradi-180   prezzi e dove    listino di esempio, poi indirizzo e orari  <section>
```

Struttura DOM (identica nelle due viste):

```
<a> Salta al contenuto · <a> Vai alla prenotazione        (link di salto)
<ConceptBackButton />                                     (fisso, del sito)
<header> marchio · chiama · Leggi in elenco / Torna al quadrante
<nav aria-label="Angoli">                                  (quadrante: slider + ol di 7 link)
<main>
  <ol class="angoli">
    <li><section id="gradi-0"   aria-labelledby="t-0"> <p class="gradi">0°</p> <h2 id="t-0">…
    … fino a gradi-180
  </ol>
</main>
<footer> solo in vista elenco: dove siamo in breve + "Un concept di CiceriLab"
<div aria-live="polite"> (titolo dell'angolo) · <div aria-live="polite"> (esiti prenotazione)
```

Un solo `h1`, visivamente il marchio NOVANTA con la riga "fisioterapia e
osteopatia, Pordenone" (testo accessibile completo dell'`h1`). Ogni angolo ha
il suo `h2`. Il numero dei gradi è un `p` accessorio con `aria-hidden` (il
titolo parlante è l'`h2`; i gradi sono detti dallo slider).

### 1.1 Frammenti

| Frammento | Effetto all'arrivo |
|---|---|
| nessuno | braccio a 0°, nessuna animazione |
| `#gradi-0` … `#gradi-180` (solo multipli di 30) | braccio già all'angolo, **senza** animazione di ingresso; il contenuto è quello dell'angolo dal primo frame |
| `#gradi-47` o qualsiasi valore non multiplo di 30 | arrotondato all'angolo più vicino (qui 60), URL corretto con `replaceState` |
| frammento sconosciuto | 0°, frammento tolto con `replaceState` |

**Storia del browser**
- Si scrive nella storia **solo quando il braccio si è agganciato** a un angolo
  diverso dal precedente (mai durante il trascinamento, mai per i gradi
  intermedi con Maiuscole+freccia). `pushState(#gradi-N)`.
- Più agganci entro 800 ms (rotella veloce: 0 → 30 → 60) fanno un solo
  passo di storia: il primo è `push`, i successivi `replace`. Così "Indietro"
  torna dove l'utente si era davvero fermato.
- "Indietro" / "Avanti" del browser (`popstate`, `hashchange`): il braccio
  ruota all'angolo del frammento (movimento di aggancio normale; istantaneo
  con reduced motion). Indietro da 0° arrivati da fuori esce dal concept:
  comportamento normale del browser, non lo si blocca.
- Nella vista elenco i frammenti sono ancore normali: `#gradi-90` scorre alla
  sezione (focus all'`h2`).

### 1.2 Parametri di ingresso (per post e inserzioni di Luca)

Letti una volta all'avvio, mai riscritti dal sito, tutti facoltativi.

| Parametro | Valori | Effetto |
|---|---|---|
| `?vista=elenco` | `elenco` | apre in vista elenco (vince su localStorage per questa visita) |
| `?motivo=` | `spalla`, `schiena`, `collo`, `ginocchio`, `intervento` | precompila "Cosa ti porta da noi" con il suggerimento corrispondente (modificabile) |

Esempio per un'inserzione sulla spalla: `/concept-15?motivo=spalla#gradi-90`.

### 1.3 Stato che sopravvive al ricaricamento

localStorage, sempre in try/catch; il sito funziona uguale se vuoto o bloccato.
- `novanta.vista`: `quadrante` | `elenco` (solo se scelta a mano, mai quando è
  il passaggio automatico di 6.9);
- `novanta.prenotazione`: dopo il successo, le due date e ore (mai nome,
  telefono o motivo). Al ritorno, l'angolo 90° si apre nello stato
  **"già fissato"** (sez. 5.5, S14);
- `novanta.invito`: `visto` dopo l'invito della manopola (una volta per
  browser).

---

## 2. Navigazione

### 2.1 Principio

Il menu è il quadrante: niente hamburger, niente menu a tendina, niente voci
testuali in testata. Tre garanzie su ogni larghezza:
1. **si vede sempre dove sei**, in gradi e a parole (numero grande + parola
   del quadrante accesa + titolo);
2. **la prenotazione è sempre a un gesto**: la parola "prenota" a 90° è sempre
   visibile sul quadrante, a metà arco, nel punto più comodo;
3. **si esce sempre** verso Ciceri Lab con il `ConceptBackButton` del sito, in
   una zona che il concept lascia libera.

Più: un'uscita dal gesto, sempre in testata, **"Leggi in elenco"**, per chi non
vuole ruotare niente.

### 2.2 Desktop (≥ 760 px, disegnato a 1440 × 900)

**Zone riservate**
- **In alto a sinistra, 0-240 × 0-64 px**: `ConceptBackButton` (top 14, left
  14, circa 200 × 38 px). Nessun elemento del concept lì.
- **Testata**: a destra, una riga, 64 px, nessuna barra di colore, nessuna
  ombra (sta sull'albicocca):

```
|[← TORNA IN CICERI LAB]                                   NOVANTA   ☎ 0434 000 000   Leggi in elenco |
 ^ bottone del sito                                         ^ h1      ^ tel: link       ^ bottone pillola
 zona libera fino a x 240                                   Epilogue  Lexend 16        contorno petrolio
                                                            800 28px                   44 px alto
                                                                          margine destro 48 px
```

  Il marchio è a destra (non a sinistra come di solito) perché a sinistra c'è
  il perno e il bottone del sito: il marchio non si scontra con nessuno dei due.

**Geometria del quadrante**
- Centro (perno) sul bordo sinistro, `x = 0`, `y = 50vh`.
- Raggio `R = min(46vh, 50vh − 76px, 480px)`. A 900 px di altezza:
  `min(414, 374, 480) = 374 px`. Il limite `50vh − 76px` tiene la cima del disco
  (180°) almeno 76 px sotto il bordo alto, cioè 22 px sotto il bottone del sito:
  né la tacca dei 180° né la sua parola cadono sotto il bottone.
- La parola di ogni angolo sta fuori dall'arco, a `R + 28 px`, testo sempre
  orizzontale: a 0° sotto il disco a destra del bordo, a 180° sopra il disco
  a destra del bordo (x ≥ 40, y ≈ 50vh − R − 10, quindi sotto i 64 px della
  zona del bottone), a 90° a destra della punta.
- Il braccio sporge di 40 px oltre l'arco con la manopola (diametro 48 px
  toccabile, 28 px disegnati).
- **Campo di lettura**: colonna di contenuto da `x = R + 220 px` (a 1440 × 900:
  594 px, "Fs" nei wireframe) larga al massimo 520 px (56 caratteri Lexend 18);
  il resto a destra è albicocca vuota o la foto a filo del bordo destro (0°,
  60°, 180°).
- **Linea di lettura**: `y = 50vh`, l'altezza della punta del braccio a 90°.
  In ogni angolo il **titolo `h2` poggia su questa linea**; il numero dei gradi
  sta sopra, il testo sotto. È la stessa linea per tutti gli angoli: cambiando
  angolo l'occhio non si sposta.

**Finestre basse**: sotto 560 px di altezza il sito passa da solo alla vista
elenco (sez. 6.9). Tra 560 e 720 px il numero dei gradi scende da 22vh a 18vh e
il testo lungo scorre dentro la propria area.

**768 × 1024 (tablet verticale)**: con la geometria al bordo il raggio
sarebbe `min(471, 436, 480) = 436` e il campo partirebbe a `436 + 220 = 656`,
lasciando una colonna di `768 − 656 − 32 = 80 px`: **non basta**, e ridurre il
raggio fino a liberare 360 px di colonna lo porterebbe a circa 150 px, un
quadrante da francobollo. Quindi **in verticale (altezza > larghezza) vale
sempre la geometria sotto il pollice** (sez. 2.3), con raggio
`min(44vw, 260 px)`. Al bordo solo in orizzontale, da 760 px in su, e solo se
la colonna di lettura resta ≥ 360 px (altrimenti sotto il pollice).

Regola definitiva di scelta della geometria (da passare al tech-architect):

| Condizione | Geometria |
|---|---|
| altezza < 560 px, o testo ingrandito (6.9) | vista elenco automatica |
| larghezza ≥ 760, larghezza > altezza × 1.1 e colonna di lettura ≥ 360 px | **al bordo** (desktop, perno a sinistra) |
| tutto il resto | **sotto il pollice** (mobile, perno in basso al centro) |

### 2.3 Mobile (375 px, pensato per primo)

**Il problema**: sotto 640 px il `ConceptBackButton` è fisso in basso a sinistra
(`bottom: max(safe-area, 14px)`, `left: 12px`, circa 197 × 36 px: occupa x
12-210, y da `bottom 14` a `bottom 50`). Il quadrante sotto il pollice ha il
perno al centro del bordo inferiore e lo 0° all'estremo sinistro del diametro,
cioè proprio lì. Spostare solo lo 0° non basta: la manopola a 0° e la parola
"da zero" cadrebbero sopra il bottone del sito.

**La soluzione: il basamento.** Un goniometro vero ha un lato dritto, il
diametro, spesso qualche millimetro. Qui il lato dritto diventa una fascia a
tutta larghezza, **alta `max(env(safe-area-inset-bottom), 14px) + 36 + 12 px`**
(62 px su iPhone SE, 82 px su iPhone con barra home), dello stesso gesso del
disco, con una sola riga petrolio di 2 px sul bordo alto (il diametro, dove
poggiano 0° e 180°). Il mezzo disco poggia **sopra** il basamento.

```
                         ┌ tacca 90 ┐
                   ╭──────────┼──────────╮     mezzo disco gesso, R ≈ 150 px
              ╭────╯          │          ╰────╮
          ╭───╯               │ braccio        ╰───╮
    0° ───┴───────────────────●──────────────────┴─── 180°   ← diametro: riga petrolio 2 px
 |[← TORNA IN CICERI LAB]               [‹ 30°] [30° ›] |    ← basamento (gesso), 62 px + safe area
   ^ bottone del sito, suo                ^ passi ±30°, 44×44
```

- Il bottone del sito sta **dentro il basamento**, a sinistra: il concept non
  mette niente nei primi 222 px (12 + 197 + 13 di respiro) del basamento.
- A destra nel basamento: due bottoni pillola **"‹ 30°"** e **"30° ›"**,
  44 × 44, `aria-label` "Angolo precedente: trattamenti" / "Angolo successivo:
  osteopatia" (con i nomi veri). Sono l'alternativa a un tocco al
  trascinamento (WCAG 2.5.7). Da 375 px: x 263-307 e 315-359, 53 px dal
  bottone del sito. **Sotto 360 px** (320-359) i due passi non ci stanno a
  fianco del bottone: spariscono dal basamento e l'alternativa a un tocco resta
  il tocco sulle parole e sul disco (sez. 6.4), che c'è sempre.
- Il perno sta al centro del diametro, cioè sul bordo alto del basamento.
  Nessun elemento del quadrante scende nel basamento: la manopola a 0° e a
  180° sta 24 px sopra il diametro (il braccio a 0° è sdraiato sul diametro
  ma la sua area di tocco sale, non scende).
- Il basamento è sempre visibile, anche a 90° e anche in vista elenco (in
  vista elenco è alto solo quanto serve al bottone del sito e non ha i passi:
  serve a non far finire l'ultimo testo sotto il bottone).

**Schermata 375 × 667 (iPhone SE)**

```
y 0     | NOVANTA                    ☎ chiama   elenco |  testata 48 px
y 48    | 60°                                          |  numero Epilogue 800, ~104 px, cifre fisse
y 150   | Trattamenti                                  |  h2 Epilogue 700, 26 px, max 2 righe
y 190   | testo Lexend 17/1.6, max 6 righe visibili,   |  area che scorre da sola se lunga
        | poi scorre dentro l'area (non la pagina)      |  (maschera morbida 16 px in fondo)
y 395   |          trattamenti                          |  parola attiva + le due vicine
        |  primo incontro ╭─────┼─────╮ prenota          |
        |            ╭────╯     │     ╰────╮             |  quadrante: R = min(44vw, 260) = 165
        |        ╭───╯          ●          ╰───╮          |  ma limitato in altezza (vedi sotto)
y 605   | 0° ────┴──────────────●──────────────┴── 180°  |  diametro
y 605   | [← TORNA IN CICERI LAB]       [‹ 30°] [30° ›]  |  basamento 62 px
y 667   └──────────────────────────────────────────────┘
```

- Altezza del quadrante (disco + parole) a 375: 210 px (raggio 165 + 45 di
  parole). Su schermi con altezza < 700 px il raggio scende a 150 px (quadrante
  195 px). Area di contenuto a 375 × 667: `667 − 48 − 195 − 62 = 362 px`.
- Testata mobile: marchio a sinistra (in alto a sinistra è libero, il bottone
  del sito è in basso), "chiama" (icona telefono + parola, `tel:`), "elenco"
  (bottone testuale; `aria-label` "Leggi in elenco"). 48 px, non fissa ma sempre
  in vista perché la pagina non scorre.
- Il pollice destro trascina il braccio da sinistra a destra; il sinistro
  arriva uguale a 90° perché è al centro. Scorrere in verticale sul testo
  scorre il testo, **mai** il braccio: la rotazione si fa solo sul quadrante.

### 2.4 Riepilogo ingressi alla rotazione

| Ingresso | Desktop | Mobile | Effetto |
|---|---|---|---|
| Trascinare la manopola o il braccio | sì | sì | angolo continuo, aggancio al rilascio (±15°) |
| Toccare/cliccare un punto del disco | sì | sì | il braccio va lì, poi aggancio |
| Parole del quadrante (link) | tutte e sette | attiva + due vicine | aggancio diretto all'angolo |
| Passi "‹ 30°" "30° ›" | no (bastano le parole) | sì, da 360 px | ±30° |
| Rotella / trackpad | sì (1° ogni 4 px di delta, soglia anti-tremolio) | no | ruota; ma se sotto il puntatore c'è testo che scorre, prima scorre quello |
| Tastiera sullo slider | sì | sì (tastiera esterna) | frecce ±30°, Maiuscole+frecce ±1°, Home 0°, Fine 180° |
| Bottone "Prenota" (0°, vista elenco) | sì | sì | va a 90° |
| Frammento / Indietro del browser | sì | sì | va all'angolo del frammento |

---

## 3. Arco emotivo (la rotazione)

L'arco è quello di una prima visita: arrivi con un movimento che non torna,
ti fidi, capisci cosa ti faranno, **decidi**, e poi resti autonomo fino alla
seduta dopo. Non è una sequenza obbligata: chi ha fretta va a 90° con un gesto.
Il picco è 90°, a metà dell'arco, non alla fine.

| Angolo | Emozione | Cosa trattiene | Cosa porta avanti |
|---|---|---|---|
| 0° da zero | **sollievo, riconoscimento** ("è per me") | due frasi e un elenco di movimenti che si tornano a fare ("pettinarti, stendere, prendere il barattolo in alto"); il braccio che pende è il punto di partenza di chi arriva | "Prenota" per chi ha già deciso; la manopola invita ad alzare il braccio |
| 30° primo incontro | **fiducia** (so cosa mi succede) | quattro momenti della prima visita, con la misura in gradi spiegata su un mini arco "oggi 70°, obiettivo 90°" | capisco che mi misureranno: mi fido di un numero |
| 60° trattamenti | **competenza** | cosa fanno, voce per voce, con durata; nessuna scheda | a 60° mancano 30°: il gesto successivo è la prenotazione |
| 90° prenota | **decisione, climax** | l'anello della settimana: scegli un'ora e il controllo arriva da solo | la sicurezza di un piccolo ciclo già fissato |
| 120° osteopatia | **onestà** | "quando sì e quando no", "se serve un medico te lo diciamo" | chi era incerto torna a 90° (un gesto indietro) |
| 150° esercizi | **autonomia** | tre esercizi con angolo obiettivo: qualcosa da fare già stasera | la cura continua anche fuori: il sito è utile anche senza prenotare |
| 180° prezzi e dove | **concretezza, radicamento** | quanto costa, come si paga, dove siamo, orari, telefono, "Apri in Maps" | braccio in alto, "fatto tutto il giro"; si torna a 90° con un gesto o si chiama |

**Percorsi tipici** (da verificare nel collaudo, tutti devono essere corti):
- *Fretta*: 0° → "Prenota" → 90°. Un tocco.
- *Cauto*: 0° → 30° → 60° → 90°. Tre gesti.
- *Prezzo prima*: 0° → 180° (Fine, o tocco su "prezzi e dove") → 90°. Due gesti.
- *Dubbio osteopatia*: link condiviso `#gradi-120` → 90°. Un gesto.

**Regole di ritmo**
- Un contenuto per angolo, densità bassa. Nessun angolo supera 6 righe a 375
  senza scorrere, tranne 60° (trattamenti) e 180° (listino), che scorrono
  dentro la propria area con un'indicazione visibile (maschera sfumata in fondo
  + testo accessibile "continua sotto").
- Il contenuto cambia solo a metà strada tra due angoli (a ±15°). Nei salti
  programmati (Prenota, parole, frammenti) il braccio passa per gli angoli
  intermedi ma il contenuto cambia **una volta sola**, all'arrivo: niente
  sfilata di sei testi in 350 ms.
- Il numero dei gradi scorre grado per grado sempre (tranne reduced motion):
  è l'unica cosa che si muove con continuità.

---

## 4. Tre user journey (dall'arrivo alla prenotazione)

Nota: il visitatore vero del Concept Lab è un **fisioterapista** o il titolare
di uno studio che arriva da cicerilab.com e si immedesima nei suoi pazienti. Le
tre storie sono i pazienti; l'ultima riga di ognuna dice cosa vede lo studio.

### 4.1 Marta, 58 anni, spalla destra rigida (mobile, da Google)

**Contesto**: pausa pranzo in ufficio, iPhone 13 (390 × 844), cerca
"fisioterapista spalla Pordenone". Da due mesi non riesce a stendere i panni
sopra la testa. Tiene il telefono con la **mano sinistra**: il braccio destro
fa male.

1. **0°**. Vede "0°", il titolo e la frase "Torni a pettinarti, a stendere, a
   prendere il barattolo in alto." Il braccio del goniometro pende a sinistra,
   sul diametro. Dopo 3 s senza toccare, la manopola fa l'invito (6° su e giù,
   una volta).
2. Trascina con il pollice sinistro la manopola: i gradi scorrono, a 15° il
   testo cambia in "primo incontro". Si ferma a 38°: al rilascio il braccio si
   aggancia a 30°. Legge i quattro momenti; il mini arco "oggi 70°, obiettivo
   90°" le fa capire cosa vuol dire "misuriamo".
3. Tocca "prenota" sul quadrante (è la parola a destra, vicina): il braccio sale
   a 90°. Il quadrante si abbassa a fascia (64 px) e sale l'anello.
4. **90°, stato arrivo (S0)**: l'anello è già girato sulla prima ora libera,
   "gio 1 · 9:00". Legge "Gira l'anello fino a un'ora che ti va. Il controllo
   lo fissiamo noi, una settimana dopo." Gira l'anello con il pollice: le ore
   occupate vengono saltate; si ferma su **ven 2 · 18:00** (dopo il lavoro).
5. Si accende sulla pista esterna **"controllo: ven 9 · 18:00"** e l'arco del
   ciclo unisce i due punti (S2).
6. Tocca "Nome": l'anello si riduce a 140 px e resta in alto (S7). Scrive
   nome, telefono (dimentica una cifra), tocca il suggerimento "spalla".
7. "Fissa le due visite" → errore sotto il telefono (S8), focus sul campo.
   Corregge.
8. Invio (S9: "Fissiamo...", l'arco del ciclo si completa) → **successo**
   (S12): "Ci vediamo venerdì 2 alle 18. Il controllo è venerdì 9 alle 18."
   Tocca "Aggiungi al calendario": il file .ics con due eventi si apre nel
   Calendario di iOS.

**Attriti da evitare**: dover usare la mano che fa male (90° al centro, passi
a destra ma parole toccabili anche a sinistra); la tastiera che copre il
bottone (il bottone è sotto l'ultimo campo e si porta in vista); ore occupate
su cui "cadere" (l'anello non si ferma lì).
**Lo studio vede**: la paziente esce con due appuntamenti, non uno.

### 4.2 Davide, 34 anni, ginocchio operato (desktop, da Google, confronta prezzi)

**Contesto**: portatile 1440 × 900, sera. Crociato ricostruito sei settimane
fa; il chirurgo gli ha detto "fisioterapia due volte a settimana". Cerca
"fisioterapia dopo intervento ginocchio Pordenone prezzi" e confronta tre
studi. Vuole un prezzo, subito.

1. **0°**. Muove la rotella verso il basso: il braccio sale di un angolo per
   colpo. Al secondo colpo è a 60°: legge "riabilitazione dopo intervento, 45
   minuti". Il listino dei trattamenti è lungo: la rotella prima fa scorrere il
   testo fino in fondo, poi riprende a ruotare il braccio.
2. Preme **Fine** sulla tastiera (lo slider ha il focus dopo il primo clic sul
   braccio): 180°. Legge il listino di esempio, "pacchetto da 5 sedute", la
   riga sulla detrazione con fattura sanitaria, e "parcheggio in cortile,
   secondo piano con ascensore".
3. Clicca "osteopatia" sul quadrante (120°): legge "se serve un medico te lo
   diciamo". Si fida.
4. Clicca "prenota" (90°). L'anello è su "lun 5 · 8:00". Usa la rotella
   sull'anello (sopra l'anello la rotella gira l'anello, non il braccio) fino a
   **mer 7 · 13:30** (pausa pranzo).
5. Nella finestra 7-10 giorni alle 13:30 non c'è posto: il controllo cade su
   "mer 14 · 14:00" e la frase dice "Alle 13:30 non c'è posto: ti proponiamo
   le 14:00." (S4). Preme **"dopo"**: "gio 15 · 13:30". Preme ancora "dopo" fino
   a "sab 17"; al decimo giorno "dopo" si disattiva con il motivo scritto
   ("il controllo resta entro 10 giorni").
6. Compila nome e telefono con la tastiera, tocca il suggerimento "dopo un
   intervento". Invio.
7. **Errore di posto** (S10, simulato): "Mercoledì alle 13:30 qualcuno ha
   appena prenotato. Ti abbiamo spostato alle 14:30, sempre mercoledì." Il
   controllo si ricalcola. I campi sono ancora compilati. Rilegge, reinvia.
8. **Successo**. Scarica l'.ics.

**Attriti da evitare**: la rotella che resta "intrappolata" nel testo lungo
(al fondo del testo riprende a ruotare, con soglia); prezzo nascosto (a 180°
è in chiaro prima di ogni dato personale); ricominciare da capo dopo l'errore
di posto.
**Lo studio vede**: un paziente post operatorio che confrontava prezzi prenota
senza telefonare.

### 4.3 Franco, 71 anni, protesi d'anca (mobile con testo grande e VoiceOver, da un link)

**Contesto**: la figlia gli manda su WhatsApp
`/concept-15?motivo=intervento#gradi-90`. Franco usa l'iPhone con il testo
ingrandito al massimo e, per leggere a lungo, VoiceOver.

1. Il sito rileva il testo ingrandito (6.9) e **apre in vista elenco**, già
   scorsa alla sezione 90° (il frammento funziona come ancora). Un avviso
   in cima, una riga sola: "Stai leggendo in elenco perché il testo è grande.
   Torna al quadrante" (bottone).
2. VoiceOver legge l'`h2` "Prenota", la riga di istruzione, poi lo slider
   dell'anello: "Prima visita, regolabile, lunedì 5 ottobre, ore 9, libero".
   Franco preferisce la lista: attiva **"Tutte le ore libere"**, un elenco di
   gruppi per giorno con pulsanti di scelta. Sceglie "martedì 6, ore 10".
3. VoiceOver annuncia (regione `aria-live`): "Controllo proposto: martedì 13
   ottobre, ore 10."
4. "Cosa ti porta da noi" è già "dopo un intervento" (parametro). Scrive nome e
   telefono. Invio.
5. **Invio fallito** (S11): in cantina il telefono non ha rete. "Non siamo
   riusciti a fissare le visite. Riprova tra poco o chiamaci allo 0434 000 000."
   (il numero è un link). I dati restano. Il focus va al messaggio.
6. Sale le scale, riprova: **successo**, letto per intero dalla regione
   `aria-live`. Il bottone "Aggiungi al calendario" è il prossimo elemento
   con il focus.

**Attriti da evitare**: un quadrante da trascinare con il testo gigante (vista
elenco automatica); uno slider circolare che VoiceOver non sa usare (lista
alternativa sempre presente); perdere i dati per la rete.
**Lo studio vede**: il sito lavora anche per il paziente anziano, con la
figlia che manda un link e basta.

---

## 5. Wireframe testuali

Convenzioni:
- **1440 × 900**: perno a (0, 450). R = 374. Parole a R + 28. Campo di
  lettura da **Fs = 594 px**, colonna **520 px** (fino a 1114). Foto (dove c'è)
  a filo del bordo destro, **da x 1160 a 1440**, dall'alto della testata (64)
  al fondo (900), 280 px di larghezza, velatura albicocca in `multiply`.
  **Linea di lettura** y = 450: l'`h2` poggia lì. Numero dei gradi: Epilogue
  800, 22vh (≈ 198 px), top a y 120.
- **375 × 667**: testata 48; area contenuto da y 48 a y 410 (362 px) con
  margini 20 px; quadrante 195 px (y 410-605); basamento 62 px.
- ◆ = interattivo. Il quadrante è disegnato solo in 5.0; negli altri
  wireframe è abbreviato `[quadrante]`.
- Ordine di lettura = ordine DOM = ordine di tabulazione (sez. 6.1).

### 5.0 Scheletro fisso (tutti gli angoli)

**1440 × 900**

```
x 0                        x 374  x 402                x 594                        x 1114   x 1440
|[← TORNA IN CICERI LAB]                                                NOVANTA  ☎ 0434…  ◆Leggi in elenco|  y 0-64
|  (zona del bottone del sito: nessun elemento del concept)                                              |
|                180 ◆prezzi e dove                                                                      |  y ≈ 66
|  ╮  tacche petrolio, 1 ogni grado, media ogni 5°,                                                      |
|  │╲ lunga ogni 10°, numeri ogni 30°       ◆osteopatia        [numero dei gradi, 22vh]                   |
|  │ ╲                                                                                                    |
|  │  ╲  disco GESSO                ◆esercizi                                                            |
|  │   ╲                                                                                                  |
|  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◉  ◆prenota               ── h2 sulla linea di lettura (y 450) ──    |
|  │  braccio 10 px, finestrella "90",  manopola 48 px                                                    |
|  │   ╱  ombra tinta 12%                                        testo sotto                              |
|  │  ╱                              ◆trattamenti                                                          |
|  │ ╱                                                                                                    |
|  │╱                         ◆primo incontro                                                            |
|  ╯                                                                                                      |
|   0 ◆da zero                                                                                           |  y ≈ 834
```

- Il disco è `aria-hidden`; lo slider accessibile è il braccio (manopola)
  sovrapposto, `role="slider"`, e le parole sono i link di un `nav` con `ol`.
- Tacche da 0 all'angolo attuale petrolio pieno; oltre, albicocca scura.
- Nessun elemento del concept a sinistra di x 240 sopra y 64.

**375 × 667**: vedi 2.3.

### 5.1 0° · da zero (`#gradi-0`)

**1440 × 900**

```
| [quadrante, braccio a 0°: pende lungo il bordo]   Fs                              x 1160         |
|                                                   0°               (22vh)          ┌──────────┐ |
|                                                                                    │ FOTO      │ |
|                                                                                    │ studio    │ |
|                                                   h2 "Torni a fare                 │ vuoto,    │ |  ← y 450
|                                                       quello che fai."             │ luce di   │ |
|                                                   frase ≤ 20 parole: chi siamo     │ finestra  │ |
|                                                   e per chi (spalla, schiena,      │ sul       │ |
|                                                   collo, ginocchio, dopo un        │ lettino   │ |
|                                                   intervento, dopo una caduta)     │           │ |
|                                                   ◆ [ Prenota ]  pillola piena     │           │ |
|                                                     petrolio, 56 px, testo gesso   └──────────┘ |
```

- Regole hero (skill 4.7): titolo max 2 righe, frase ≤ 20 parole, un solo
  bottone. Niente occhiello, niente riga di numeri, niente "Scorri" o "Ruota".
  L'invito è la manopola (una volta, 6°).
- La foto è `alt` descrittivo ("Una stanza dello studio vuota, luce di
  finestra su un lettino"); piano B senza foto: il numero sale a 26vh, il resto
  uguale.
- ◆ "Prenota" → braccio a 90°, focus all'`h2` di 90°.

**375 × 667**

```
y 48   | 0°                                   |  104 px
y 150  | Torni a fare quello che fai.         |  h2 26 px, 2 righe
y 222  | frase ≤ 20 parole, 4 righe           |
y 330  | ◆ [ Prenota ]  larghezza piena, 52 px |
y 410  | [quadrante: braccio sdraiato a 0°]   |
y 605  | [basamento]                          |
```

- A 375 niente foto a 0° (il primo schermo è del numero e del quadrante; la
  foto a 375 compare a 180° come fascia). Il bottone "Prenota" deve stare nel
  primo schermo a 375 × 667 (verifica del responsive-tester).

### 5.2 30° · primo incontro (`#gradi-30`)

**1440 × 900**

```
| [quadrante a 30°]      Fs  30°                                                         |
|                           h2 "La prima volta, un'ora."                ← y 450         |
|                           ol, quattro momenti, una frase ciascuno:                    |
|                             1 Parliamo: cosa non riesci più a fare.                   |
|                             2 Guardiamo come ti muovi.                                |
|                             3 Misuriamo, in gradi.                                     |
|                             4 Ti diciamo quante sedute servono e quanto costano.       |
|                           riga: 60 minuti. Porta referti e scarpe comode.              |
|                                                                   ┌─ mini arco ─┐     |
|                                                                   │ oggi 70°     │     |  x 1160-1400
|                                                                   │ obiettivo 90°│     |  SVG, 200 px
|                                                                   └──────────────┘     |
```

- I quattro momenti sono una `ol` (l'ordine conta), senza cerchietti numerati
  decorativi: il numero è il marcatore della lista in Epilogue.
- Mini arco: `figure` con `figcaption` "Esempio: oggi la spalla arriva a 70
  gradi, l'obiettivo è 90". L'SVG è `aria-hidden`. Statico (nessuna
  animazione obbligatoria; al massimo il braccietto sale da 0 a 70 una volta
  all'ingresso, 400 ms, niente con reduced motion).

**375 × 667**

```
y 48   | 30°                                  |
y 150  | La prima volta, un'ora.              |  h2
y 190  | 1 Parliamo: cosa non riesci più…     |  4 righe da 1-2 righe
       | 2 Guardiamo come ti muovi.           |
       | 3 Misuriamo, in gradi.               |
       | 4 Ti diciamo quante sedute…          |
       | 60 minuti. Porta referti e scarpe…   |
       | [mini arco 140 px, sotto il testo:   |  si raggiunge scorrendo l'area
       |  oggi 70° · obiettivo 90°]           |
y 410  | [quadrante]                          |
```

### 5.3 60° · trattamenti (`#gradi-60`)

**1440 × 900**

```
| [quadrante a 60°]     Fs 60°                                               x 1160            |
|                          h2 "Cosa facciamo, con le mani                      ┌──────────┐     |
|                              e con l'esercizio."            ← y 450          │ FOTO     │     |
|                          dl, quattro voci:                                   │ elastici │     |
|                            Terapia manuale              45 min               │ e rullo  │     |
|                            una frase                                         │ (facolt.)│     |
|                            Esercizio terapeutico        45 min               └──────────┘     |
|                            una frase                                                          |
|                            Riabilitazione dopo intervento  45-60 min                          |
|                            una frase                                                          |
|                            Taping                       15 min, con la seduta                  |
|                            una frase                                                          |
|                          (area che scorre se non ci sta, maschera in fondo)                   |
```

- `dl` con `dt` (nome, Lexend 500) + `dd` (frase) + durata allineata a destra
  in cifre fisse; un filo di 1 px petrolio al 20% tra le voci è ammesso (è un
  elenco, non una griglia di schede). Niente icone per voce.
- Se il testo supera l'altezza fino a y 860, l'area scorre: rotella prima
  sul testo (regola 6.3).

**375 × 667**

```
y 48   | 60°                                  |
y 150  | Cosa facciamo, con le mani e con     |  h2 max 2 righe
       | l'esercizio.                         |
y 222  | Terapia manuale              45 min  |
       | una frase                            |
       | Esercizio terapeutico        45 min  |  visibili ~2,5 voci, poi l'area scorre
       | …                                    |  maschera + "continua sotto" (sr-only)
y 410  | [quadrante]                          |
```

### 5.4 90° · prenota, la settimana a ruota (`#gradi-90`), la più importante

**1440 × 900**

A 90° il campo si allarga: il contenuto va da Fs (594) fino a 1392. Il numero
dei gradi scende a 16vh (l'anello è il protagonista); niente foto.

```
| [quadrante a 90°:          Fs 90°  (16vh)                    x 1040                          x 1392 |
|  braccio orizzontale,                                         h2 "Prenota la prima visita."        |
|  finestrella "90"]                                            riga: "Gira l'anello fino a un'ora   |
|                                  ┌───── indice fisso a ore 12 ─┐ che ti va. Il controllo lo       |
|                               ╭──┴──╮                          fissiamo noi, una settimana dopo." |
|                          lun ╱       ╲ mar                                                        |
|                             │  ╭───╮  │    pista interna:      ── controllo ──                    |
|                         dom │  │ven│  │ mer  questa settimana   controllo: ven 9 · 18:00          |  ← y 450
|                         chiuso│ │2  │  │      pista esterna:     ◆[prima] ◆[dopo]                   |
|                             │  │18:00│ │     settimana dopo     ◆ solo la prima visita (link)     |
|                          sab ╲ ╰───╯ ╱ gio                                                        |
|                               ╰─────╯                          ◆ Nome            (etichetta sopra)|
|                     anello Ø 400, centro (800, 460)            ◆ Telefono                         |
|                     centro: "ven 2 · 18:00" Epilogue 40        ◆ Cosa ti porta da noi (facolt.)  |
|                             "prima visita, 60 min" Lexend      ◆spalla ◆schiena ◆collo ◆ginocchio |
|                                                                ◆dopo un intervento                |
|                  ◆ Tutte le ore libere ▾ (disclosure)          ◆ [ Fissa le due visite ]          |
|                                                                zona messaggi (aria-live)          |
```

- Colonna sinistra (Fs-1000): numero, anello, disclosure "Tutte le ore
  libere". Colonna destra (1040-1392, 352 px): titolo, istruzione, lettura del
  controllo, campi, bottone, messaggi. Se la colonna destra supera y 870, scorre
  da sola; l'anello resta fermo.
- Anello: 7 spicchi, lunedì in alto e poi in senso orario. Pista interna
  (settimana 1) larga 64 px, esterna (settimana 2) 40 px. Tacche radiali ogni
  30 minuti: lun-ven 8:00-19:30 (24 tacche), sab 8:00-12:30 (10 tacche),
  domenica chiusa (spicchio albicocca scuro, parola "chiuso", nessuna tacca).
- Lo spicchio del giorno porta la sigla e la data ("ven 2") fuori dall'anello,
  orizzontale.
- La disclosure "Tutte le ore libere" apre sotto l'anello (x Fs-1000, altezza
  max 280 px, scorre) i gruppi per giorno.

**375 × 667, arrivo a 90°**

Il quadrante si riduce a **fascia** di 64 px sopra il basamento: braccio corto
orizzontale e "90°" nella finestrella, a sinistra ◆"‹ trattamenti", a destra
◆"osteopatia ›" (bottoni 44 px alti). Trascinare la fascia in orizzontale
ruota il braccio come il quadrante pieno.

```
y 0    | NOVANTA                  ☎ chiama   elenco |
y 48   | 90°  Prenota la prima visita.            |  numero 56 px + h2 affiancati
y 104  | Gira l'anello fino a un'ora che ti va.   |  2 righe
       | Il controllo lo fissiamo noi.            |
y 160  |            ▼ indice                      |
       |        ╭───────────╮                      |
       |     ╭──╯  ven 2    ╰──╮                   |  anello Ø 300 (x 37-337)
       |     │     18:00       │                   |
       |     │  prima visita,  │                   |
       |     ╰──╮  60 min   ╭──╯                   |
       |        ╰───────────╯                      |
y 470  | controllo: ven 9 · 18:00  ◆prima ◆dopo    |  ↓ da qui l'area scorre
       | ◆ solo la prima visita                    |
       | ◆ Tutte le ore libere ▾                   |
       | Nome / Telefono / Cosa ti porta / chips   |
       | ◆ [ Fissa le due visite ]                 |
y 541  | ◆‹ trattamenti     ━●━ 90°  osteopatia ›◆ |  fascia 64 px
y 605  | [basamento con il bottone del sito]       |
```

- **Tutto quello che sta sotto y 470 scorre dentro l'area** (non la pagina).
  Quando un campo riceve il focus (S7), l'anello si riduce a **140 px** e resta
  appiccicato in cima all'area (sticky), con accanto la lettura "ven 2 · 18:00 /
  controllo ven 9 · 18:00": la scelta resta in vista mentre si scrive.
- Con la tastiera aperta (`visualViewport` più basso della finestra): fascia e
  passi spariscono (sono coperti comunque), il campo attivo è portato in vista
  con 16 px di margine sopra la tastiera; il bottone "Fissa le due visite" è
  sotto l'ultimo campo, mai fisso in basso. L'area ha un margine inferiore di
  64 px perché il bottone del sito (che resta fisso) non copra mai il campo
  attivo o il bottone di invio.

### 5.5 Stati della prenotazione "settimana a ruota"

Dati: orari di esempio verosimili e fissi nel codice, generati nel browser
rispetto alla data di oggi (mai nel prerender). Nessuna finzione di
disponibilità dal vivo: una riga in piccolo sotto l'anello lo dice ("Orari di
esempio: questo è un prototipo").

**Calendario dell'anello**
- La **pista interna** è la settimana (lun-dom) del primo giorno utile. Primo
  giorno utile = oggi se restano almeno due ore libere a partire da adesso + 2
  ore, altrimenti domani. Se nella settimana corrente restano meno di due giorni
  aperti (es. venerdì sera, sabato, domenica), la pista interna è la settimana
  successiva e l'esterna quella dopo ancora.
- Giorni già passati della settimana interna: spicchio albicocca scuro senza
  tacche, data barrata a parole ("passato", non solo colore).
- Ore già passate di oggi e prima di adesso + 2 ore: tacche come "occupate".
- La pista esterna mostra le tacche della settimana dopo, spente finché non
  c'è una prima visita scelta.

| # | Stato | Cosa si vede | Cosa si può fare | Annuncio `aria-live` |
|---|---|---|---|---|
| **S0** | **Arrivo** (prima volta a 90°) | anello già girato sulla prima ora libera utile; lettura al centro; pista esterna con tacche ma **nessun controllo acceso**; istruzione "Gira l'anello…" | girare l'anello, usare l'elenco, compilare | nessuno all'arrivo (lo slider dice il suo valore quando riceve il focus) |
| **S1** | **Anello in rotazione** (trascinamento, rotella) | l'anello gira con il dito; la lettura al centro segue l'ora sotto l'indice, anche occupata, scritta "occupata" in petrolio al 72%; il controllo proposto si spegne mentre si gira | rilasciare | nessuno durante il gesto |
| **S2** | **Prima visita scelta, controllo proposto** | al rilascio l'anello si aggancia all'ora **libera** più vicina (le occupate sono saltate); sulla pista esterna si accende il controllo (stessa ora, primo giorno libero tra +7 e +10); arco petrolio sottile tra i due punti; riga "controllo: ven 9 · 18:00" con ◆prima ◆dopo | spostare il controllo, toglierlo, compilare | "Prima visita venerdì 2 ottobre, ore 18. Controllo proposto venerdì 9 ottobre, ore 18." |
| **S3** | **Controllo spostato** (prima/dopo) | il punto esterno salta al giorno libero precedente/successivo **alla stessa ora** dentro +7…+10; arco ridisegnato; ai limiti il bottone relativo è disattivato e sotto c'è il motivo ("il controllo resta tra 7 e 10 giorni") | come S2 | "Controllo: sabato 10 ottobre, ore 18." |
| **S4** | **Stessa ora non disponibile nella finestra** | il controllo cade sull'ora libera più vicina in quei giorni (prima quella più vicina nello stesso giorno +7, poi i giorni successivi); frase "Alle 18 non c'è posto: ti proponiamo le 17:30." | come S2; prima/dopo scorrono i giorni con l'ora più vicina | la frase stessa |
| **S5** | **Nessun controllo possibile** (finestra 7-10 tutta piena) | pista esterna spenta, frase "La settimana dopo è piena: il controllo lo fissiamo insieme alla prima visita." Bottone di invio "Fissa la visita" | compilare, inviare solo la prima visita | la frase |
| **S6** | **Solo la prima visita** (controllo tolto dall'utente) | pista esterna spenta, arco sparito, link ◆"Aggiungi il controllo" al posto di "solo la prima visita"; bottone "Fissa la visita" | rimettere il controllo (torna la proposta di S2) | "Controllo tolto. Fissi solo la prima visita." |
| **S7** | **Compilazione** | a 375: anello ridotto a 140 px, sticky in cima all'area; a 1440 nulla cambia (colonna destra) | scrivere, toccare i suggerimenti (riempiono il campo, restano modificabili) | nessuno |
| **S8** | **Errore di campo** | all'invio: messaggio sotto il campo, petrolio, con icona cerchio barrato (libreria), campo con bordo petrolio 2 px; focus al primo campo sbagliato; nessun rosso, nessuna vibrazione | correggere; l'errore sparisce quando il campo diventa valido (non a ogni tasto prima dell'invio) | messaggio collegato con `aria-describedby`; `aria-invalid="true"` |
| **S9** | **Invio in corso** | bottone al suo posto, testo "Fissiamo...", `aria-disabled`; l'arco del ciclo si completa da un punto all'altro in 400-600 ms; nessuno spinner; anello e campi non modificabili | attendere | "Stiamo fissando le visite." |
| **S10** | **Errore di posto** (simulato, l'ora è stata presa) | la tacca scelta si spegne in dissolvenza; l'anello si sposta da solo alla prossima ora libera (stesso giorno se c'è); il controllo si ricalcola; frase "Venerdì alle 18 qualcuno ha appena prenotato. Ti abbiamo spostato alle 18:30." Campi intatti. **Non reinvia da solo** | rileggere, reinviare | la frase |
| **S11** | **Invio fallito** (simulato, rete) | l'arco del ciclo torna indietro; frase "Non siamo riusciti a fissare le visite. Riprova tra poco o chiamaci allo 0434 000 000." (numero = `tel:`); dati intatti | riprovare, chiamare | la frase, focus al messaggio |
| **S12** | **Successo** | le due tacche restano come punti pieni uniti dall'arco; tutte le altre tacche attenuate; al centro dell'anello "Ci vediamo venerdì 2 alle 18. Il controllo è venerdì 9 alle 18."; sotto ◆"Aggiungi al calendario" (.ics con due eventi, generato nel browser) e ◆"Cambia"; riga "Ti scriviamo il giorno prima." I campi spariscono (riassunto a parole: "A nome di Marta, telefono che finisce per 42") | aggiungere al calendario, cambiare | la frase intera; focus su "Aggiungi al calendario". **`track("demo_prenotazione", …)` qui** |
| **S13** | **Cambia** (da S12) | torna a S2 con le stesse scelte e i campi compilati; il bottone diventa "Sposta le visite" | come S2 | "Puoi cambiare le visite." |
| **S14** | **Già fissato** (ritorno, localStorage) | come S12 ma senza campi né riassunto del nome; in più ◆"Prenota un'altra persona" (svuota e torna a S0) | calendario, cambia, altra persona | nessuno all'arrivo |
| **S15** | **Senza JavaScript / prerender** | vista elenco; a 90° niente anello: testo "Per prenotare chiamaci allo 0434 000 000" + orari; l'anello compare all'idratazione | chiamare | n/a |

Varianti per una sola visita: in S5 e S6 tutte le frasi passano al singolare
("Ci vediamo venerdì 2 alle 18.").

**Campi** (etichetta sopra, sempre visibile; niente placeholder come etichetta):

| Campo | Tipo | Obbligo | Regola | Errore |
|---|---|---|---|---|
| Nome | `text`, `autocomplete="name"` | sì | almeno 2 lettere | "Scrivi il tuo nome, così sappiamo chi aspettare." |
| Telefono | `tel`, `autocomplete="tel"`, `inputmode="tel"` | sì | 9-13 cifre dopo aver tolto spazi, `+39` ammesso | "Il numero sembra incompleto: controlla le cifre." |
| Cosa ti porta da noi | `textarea` 2 righe, max 140 caratteri | no | contatore a parole solo sopra 120 ("ancora 20 caratteri") | nessuno |

Suggerimenti a tocco sotto il terzo campo: bottoni che **aggiungono** la parola
al campo (se il campo è vuoto la mettono, se c'è già testo la aggiungono dopo
una virgola). Non sono una scelta obbligata, non sono chip con icona.

**Elenco "Tutte le ore libere"**: un `fieldset` per giorno (`legend` "venerdì
2 ottobre"), radio per ogni ora libera (solo le libere). Scegliere una radio
ruota l'anello allo stesso punto (S2). In vista elenco e con testo grande è
aperto di default.

### 5.6 120° · osteopatia (`#gradi-120`)

**1440 × 900**

```
| [quadrante a 120°]     Fs 120°                                                   |
|                           h2 "Osteopatia, detta semplice."          ← y 450     |
|                           p: cos'è in due frasi                                   |
|                           h3 "Quando ha senso"   · 3 righe                        |
|                           h3 "Quando no"         · 2 righe                        |
|                           riga: "Se serve un medico te lo diciamo."  (Lexend 500)  |
|                           riga: una seduta dura 50 minuti.                          |
```

- Solo testo (direzione). Il vuoto a destra resta vuoto: è l'angolo
  dell'onestà, niente decorazioni.

**375 × 667**: numero, h2, due frasi, i due `h3` con le loro righe; l'area
scorre se serve (probabile dalla riga "Quando no").

### 5.7 150° · esercizi (`#gradi-150`)

**1440 × 900**

```
| [quadrante a 150°]     Fs 150°                                                        |
|                           h2 "Tre cose da fare a casa."             ← y 450          |
|                           ol di tre esercizi, ciascuno:                                |
|                           ┌ mini arco 96 px ┐  Pendolo                                |
|                           │ fino a 30°      │  due frasi: come, quante volte          |
|                           └─────────────────┘                                          |
|                           ┌ mini arco ┐  Scivolamento al muro, fino a 120°            |
|                           ┌ mini arco ┐  Rotazione con l'elastico, fino a 45°         |
|                           riga: "Se fa male, fermati e chiedici."                      |
```

- Ogni esercizio: `li` con `h3` (nome) e testo; il mini arco è `aria-hidden`
  perché l'angolo obiettivo è **scritto** nel testo ("fino a 30 gradi").
  Nessun omino, nessun disegno del gesto.
- Il mini arco è lo stesso componente del quadrante in piccolo: mezzo disco
  gesso, tacche ogni 10°, braccio all'angolo obiettivo, zona 0-obiettivo
  petrolio pieno. Fermo.
- Disposizione: mini arco a sinistra del testo (96 px) su desktop; su 375 il
  mini arco (64 px) sta a sinistra del nome, il testo sotto a tutta larghezza.

**375 × 667**: numero, h2, primo esercizio visibile per intero, gli altri
scorrendo l'area.

### 5.8 180° · prezzi e dove (`#gradi-180`)

**Decisione**: restano insieme. Prima i prezzi (è il nome della parola sul
quadrante e la domanda di chi arriva qui con Fine), poi "dove". Due `h3` dentro
la sezione. L'area scorre.

**1440 × 900**

```
| [quadrante a 180°: braccio      Fs 180°                                    x 1160         |
|  dritto in alto, vicino ma                                                 ┌──────────┐   |
|  sotto la zona del bottone]     h2 "Quanto costa, e dove siamo."  ← y 450  │ FOTO     │   |
|                                 h3 "Quanto costa"                          │ ingresso │   |
|                                 dl, listino di esempio:                    │ o sala   │   |
|                                   Prima visita, 60 min        60 €         │          │   |
|                                   Seduta di fisioterapia, 45  50 €         └──────────┘   |
|                                   Osteopatia, 50 min          65 €                         |
|                                   Cinque sedute              225 €                         |
|                                 riga: paghi con carta, bancomat o contanti; fattura       |
|                                 sanitaria, detraibile come spesa medica.                  |
|                                 h3 "Dove siamo"                                            |
|                                 indirizzo di esempio, Pordenone                            |
|                                 lun-ven 8-20, sab 8-13 · domenica chiuso                   |
|                                 ◆ ☎ 0434 000 000        ◆ Apri in Maps ↗                  |
|                                 parcheggio in cortile, secondo piano, ascensore           |
|                                 ─ piede ─ "Un concept di CiceriLab"                        |
```

- Prezzi, indirizzo e telefono: **di esempio**, da confermare dal copywriter,
  senza dati legali (niente P.IVA, niente numero d'albo). Una riga in piccolo:
  "Prezzi e recapiti di esempio."
- Orari: `dl` o testo; mai una barra orizzontale di orari (è di 18).
- "Apri in Maps" apre la mappa vera in una nuova scheda (`target="_blank"`,
  `rel="noopener"`, avviso "si apre in una nuova scheda" nel nome accessibile).
  Nessuna mappa disegnata o incorporata.
- Il piede "Un concept di CiceriLab" è testo semplice, non un secondo bottone
  "torna" (quello è il `ConceptBackButton`).

**375 × 667**

```
y 48   | 180°                                 |
y 150  | Quanto costa, e dove siamo.          |
       | [FOTO fascia 335 × 140, velatura]    |  prima del listino (piano B: niente)
       | Prima visita, 60 min          60 €   |
       | …                                     |  l'area scorre
       | Dove siamo · indirizzo · orari       |
       | ◆ ☎ chiama     ◆ Apri in Maps        |  due bottoni pillola affiancati, 44 px
       | Un concept di CiceriLab              |
y 410  | [quadrante a 180°: manopola a destra, sopra il diametro, lontana dal bottone del sito] |
```

### 5.9 Vista elenco

Un bottone in testata, **"Leggi in elenco"** (a 375: "elenco"), trasforma il
sito in una pagina verticale normale. Tornando indietro diventa **"Torna al
quadrante"**. `aria-pressed` no: è un cambio di vista, il bottone cambia
etichetta.

**Cosa cambia**
- Il quadrante sparisce (resta solo il basamento sotto 640 px, senza passi,
  per il bottone del sito). Le sette sezioni si vedono una sotto l'altra,
  nell'ordine 0 → 180, **nessuna `inert`**. Lo scroll di pagina torna normale
  (nessun Lenis: non serve).
- Ogni sezione: numero dei gradi (Epilogue 800, 96 px desktop / 72 px mobile)
  a sinistra, contenuto a destra (desktop) o sotto (375). Accanto al numero, un
  **mini arco** 48 px con il braccio a quell'angolo: il goniometro resta
  riconoscibile anche in elenco.
- Tra le sezioni: 120 px di albicocca vuota (desktop), 72 px (375). Nessun
  divisore.
- Il numero di ogni sezione è anche un'ancora: `#gradi-N`.
- A 0° il bottone "Prenota" porta a `#gradi-90` (scorre, focus all'`h2`).
- A 90° l'anello è Ø 360 desktop / 300 mobile, "Tutte le ore libere" aperto di
  default, campi sotto. Stessi stati S0-S15.
- Piede (`footer`): indirizzo, orari e telefono in breve, "Un concept di
  CiceriLab".
- Il cambio di vista mantiene l'angolo: da quadrante a 120° si apre l'elenco
  scorso a `#gradi-120`; dall'elenco al quadrante si torna all'angolo della
  sezione più visibile.

**1440**

```
|[← TORNA IN CICERI LAB]                          NOVANTA  ☎ 0434…  ◆Torna al quadrante |
|                                                                                          |
|   x 240   0°  ◠                x 594   Torni a fare quello che fai.                     |
|                                         frase · ◆[ Prenota ]                              |
|                                                                                          |
|           30°  ◠                        La prima volta, un'ora.                           |
|                                         …                                                 |
|           90°  ◠                        Prenota la prima visita.                          |
|                                         [anello Ø 360]  [campi]                           |
|           …                                                                               |
|  footer: dove siamo in breve · Un concept di CiceriLab                                    |
```

**Passaggio automatico** (6.9): stessa vista, con in cima una riga
`role="status"` "Stai leggendo in elenco perché la finestra è bassa (o il testo
è grande)." e ◆"Torna al quadrante" (che resta disponibile solo se le misure
lo permettono; altrimenti la riga dice perché non si può).

---

## 6. Accessibilità (per ogni interazione)

### 6.1 Base di pagina e ordine di focus

- Punti di riferimento: `header`, `nav aria-label="Angoli"` (quadrante),
  `main` (la `ol` delle sette sezioni), `footer` (solo vista elenco). `lang="it"`.
- Un `h1` (marchio + "fisioterapia e osteopatia, Pordenone"), un `h2` per
  angolo, `h3` dentro 120°, 150°, 180°.
- **Ordine di tabulazione in modalità quadrante**:
  1. "Salta al contenuto" (va all'`h2` dell'angolo attivo), "Vai alla
     prenotazione" (va a 90° e al suo `h2`). Nascosti finché non hanno il focus.
  2. `ConceptBackButton` (del sito).
  3. Marchio (`h1`, non link), ◆ telefono, ◆ "Leggi in elenco".
  4. ◆ **Braccio** (`role="slider"`).
  5. ◆ Le sette parole (link del `nav`). A 375 le quattro parole non mostrate
     restano nel DOM e nel tab order, visivamente nascoste, e compaiono accanto
     alla loro tacca quando ricevono il focus (come i link di salto): la
     tastiera esterna su telefono raggiunge tutti e sette gli angoli.
  6. ◆ Passi "‹ 30°" "30° ›" (solo mobile ≥ 360).
  7. Contenuto dell'angolo attivo (i suoi link e controlli).
- **Le sei sezioni non attive sono `inert`** in modalità quadrante: né focus né
  albero di accessibilità (evita focus invisibile, WCAG 2.4.7 / 2.4.11). La
  lettura completa lineare è la vista elenco, a un tasto, terzo elemento
  tabulabile. Il prerender e i motori di ricerca vedono tutte le sette sezioni
  (nel prerender è la vista elenco).
- **Focus visibile**: anello petrolio 3 px distanziato 3 px ovunque; sulla
  manopola anche quando il focus è sullo slider (il contorno avvolge la
  manopola, non il braccio intero). Mai `outline: none` senza sostituto. Il
  focus non è mai coperto da elementi fissi (2.4.11): la testata non è sopra il
  contenuto, e il basamento ha margine sotto l'area che scorre.
- **Target**: manopola 48 × 48; braccio toccabile lungo tutta la lunghezza con
  48 px di spessore; parole con area 44 px di altezza anche se il testo è
  16 px; bottoni 44 px minimo, "Prenota" e "Fissa le due visite" 52-56 px.
- **Contrasto**: tutto il testo petrolio su albicocca (~8:1) o su gesso (~11:1).
  Testo al 72%: da misurare; se sotto 4.5:1 si usa il 100%. Stati "occupata",
  "passato", "chiuso" non si affidano al solo colore: sempre una parola o una
  forma diversa (tacca corta contro lunga).
- **Modo scuro** (skill 6.C): decisione dell'art-director. Vincoli UX: stessa
  gerarchia, nessuna informazione solo nel colore, il disco resta la superficie
  più chiara del campo (è l'oggetto).
- **Nessun lampeggio**: nessun cambio di luminosità oltre 3 volte al secondo;
  le tacche si accendono in continuo.

### 6.2 Braccio del goniometro (slider principale)

- `role="slider"`, `tabindex="0"`, `aria-label="Angolo"`,
  `aria-valuemin="0"`, `aria-valuemax="180"`, `aria-valuenow` (gradi interi),
  `aria-valuetext` parlante: "90 gradi, prenota", "47 gradi, vicino a
  trattamenti" (valore non agganciato), `aria-orientation` non impostato
  (circolare).
- `aria-controls` = id della `ol` delle sezioni.
- **Tastiera**: → e ↑ +30° (angolo successivo), ← e ↓ −30°; Maiuscole+frecce
  ±1° (il contenuto segue l'angolo più vicino; al rilascio di Maiuscole non si
  aggancia, si aggancia al primo tasto senza Maiuscole o a Invio); Home 0°, Fine
  180°; PagSu/PagGiù come frecce (±30°). Invio o Spazio: "entra" nell'angolo
  (focus all'`h2` dell'angolo). Esc durante un trascinamento: torna all'angolo
  di partenza.
- Il focus **resta sullo slider** mentre si cambia angolo con i tasti: annuncio
  del titolo nuovo nella regione `aria-live="polite"` dedicata ("Trattamenti"),
  una volta per aggancio, non per ogni grado.
- Con lettore di schermo su mobile (gesto di regolazione su/giù di VoiceOver e
  TalkBack): ±30°.
- Il disco SVG, tacche, numeri e ombra sono `aria-hidden="true"`.

### 6.3 Trascinamento, tocco sul disco, rotella

- **Trascinamento**: Pointer Events con `setPointerCapture`; il gesto parte
  solo dalla manopola, dal braccio o dal disco (`touch-action: none` solo su
  questi); il resto della pagina mantiene i gesti di sistema. Su 375 il
  contenuto sopra ha `touch-action: pan-y` e non ruota mai.
- **Alternativa a un tocco** (WCAG 2.5.7): parole del quadrante, tocco su un
  punto del disco, passi ±30° (mobile), tastiera. Nessuna funzione richiede il
  trascinamento.
- **Rotella / trackpad** (solo desktop): il delta si accumula (1° ogni 4 px),
  soglia di 12 px prima di muovere (tremolii del trackpad), aggancio dopo 140 ms
  senza delta. **Se il puntatore è sopra un'area che scorre e non è al fondo
  (o in cima, girando al contrario), scorre l'area**; arrivata al limite, serve
  un nuovo gesto (pausa di 300 ms) prima che la rotella ruoti il braccio: niente
  cambio d'angolo per inerzia del trackpad. Sopra l'anello a 90° la rotella gira
  l'anello. Sopra i campi del modulo scorre la colonna.
- Il cursore del sistema: `grab` / `grabbing` sulla manopola e sul braccio,
  `pointer` sulle parole; niente cursore custom.

### 6.4 Parole del quadrante e passi

- `nav aria-label="Angoli"` → `ol` di sette `a href="#gradi-N"`, testo = nome
  dell'angolo; l'attivo ha `aria-current="location"` e resta petrolio pieno
  (le altre al 60%: il 60% è per il colore del testo, da verificare 4.5:1,
  altrimenti 100% con peso 400 contro 500).
- Attivare un link: il braccio ruota all'angolo, `pushState`, focus all'`h2`
  del nuovo angolo (con `tabindex="-1"`).
- Passi mobile: `button` con `aria-label` completo del nome di destinazione,
  disattivati (`aria-disabled`, restano focalizzabili) a 0° ("‹") e 180° ("›").

### 6.5 Anello della settimana (slider secondario)

- `role="slider"`, `aria-label="Prima visita"`, `aria-valuemin="0"`,
  `aria-valuemax` = numero di ore libere − 1, `aria-valuenow` = indice dell'ora
  libera, `aria-valuetext` = "venerdì 2 ottobre, ore 18, libero". Il valore
  salta solo tra ore libere, quindi il lettore non annuncia mai un'ora occupata.
- **Tastiera**: → e ↓ ora libera successiva; ← e ↑ precedente; PagGiù / PagSu
  primo orario libero del giorno successivo / precedente; Home / Fine prima /
  ultima ora libera delle due settimane interne.
- **Trascinamento circolare** con aggancio alle ore libere; **rotella** sopra
  l'anello: un'ora libera per scatto.
- L'SVG (spicchi, tacche, arco del ciclo, indice) è `aria-hidden`; la lettura
  al centro è testo DOM ma duplicata dal valore dello slider, quindi anche lei
  `aria-hidden` (niente doppia lettura).
- **Alternativa**: "Tutte le ore libere" (`button aria-expanded
  aria-controls`), `fieldset` per giorno, radio. Stessa sorgente dati dello
  slider: una scelta aggiorna l'altra.
- **Controllo**: testo "controllo: venerdì 9 ottobre, ore 18" (visibile in
  forma breve, nome accessibile in forma lunga) + `button` "Controllo un giorno
  prima" / "Controllo un giorno dopo" (etichette visibili "prima" / "dopo"),
  disattivati ai limiti con il motivo in `aria-describedby`. "Solo la prima
  visita" / "Aggiungi il controllo" è un `button` (cambia stato, non naviga).
- Esiti (S2-S6, S9-S13) nella regione `aria-live="polite"` delle
  prenotazioni; S11 e S8 mettono anche il focus sul messaggio / campo.

### 6.6 Campi e invio

- `form` con `novalidate` e validazione propria all'invio; `label` visibile
  per ogni campo; obbligatori marcati a parole ("obbligatorio"), non solo con
  l'asterisco; `aria-required`, `aria-invalid`, `aria-describedby` al messaggio.
- Suggerimenti: gruppo `role="group" aria-label="Suggerimenti"` di `button`;
  dopo il tocco il focus resta sul bottone e il campo si aggiorna (annuncio
  breve "Aggiunto: spalla").
- Invio con Invio da qualsiasi campo di una riga; il bottone non si disattiva
  prima dell'invio (i problemi si scoprono cliccando, non indovinando).
- In S9 `aria-busy="true"` sul form; niente doppio invio.
- "Aggiungi al calendario": `a download="novanta.ics"` generato nel browser
  (due `VEVENT`, fuso Europe/Rome, luogo di esempio).

### 6.7 Cambio di vista

- "Leggi in elenco" / "Torna al quadrante": `button`; dopo il cambio il focus va
  all'`h2` dell'angolo corrente nella nuova vista. La scelta manuale va in
  localStorage.
- La vista elenco è anche ciò che si vede **senza JavaScript e nel prerender**:
  nessun accesso a `window`/`document` a livello di modulo; la scelta della
  geometria e della vista avviene dopo il montaggio, senza lampo (il primo
  render client è la vista elenco finché le misure non sono lette, poi si passa
  al quadrante in un fotogramma, con il contenuto già all'angolo del
  frammento).

### 6.8 `prefers-reduced-motion: reduce`

- Braccio: niente inerzia né molla, salta all'angolo scelto; il trascinamento
  resta (è un controllo) e segue il dito 1:1, ma al rilascio l'aggancio è
  immediato.
- Numero dei gradi: cambia direttamente al valore finale.
- Contenuto: dissolvenza 120 ms senza spostamento.
- Nessun invito della manopola; mini arco a 30° già a 70°.
- A 375 il passaggio quadrante → fascia a 90° è immediato.
- Anello: salta all'ora scelta; l'arco del ciclo compare già completo (S9: il
  bottone dice "Fissiamo..." e basta); in S10 la tacca si spegne senza
  dissolvenza.
- Anche `prefers-reduced-motion` letto dopo il montaggio, mai nel prerender.

### 6.9 Zoom 200-400%, testo grande, finestre basse (reflow)

- **Passaggio automatico alla vista elenco** quando: altezza della finestra
  < 560 px CSS, **oppure** il quadrante non ci sta (regole di 2.2 e 2.3), **oppure**
  il testo è ingrandito: una sonda di `1rem` misura più di 20 px (Dynamic Type,
  impostazioni del browser). Si ricontrolla a ogni `resize` (con isteresi di
  40 px, per non oscillare).
- **Zoom 400% a 1280 × 1024** = 320 × 256 CSS px: vista elenco, una colonna,
  nessuno scroll orizzontale (WCAG 1.4.10). Testata su due righe permesse
  (marchio sopra, chiama + "Torna al quadrante" sotto) solo in questo caso.
  L'anello in vista elenco sotto 480 px di altezza scende a Ø 220 e "Tutte le
  ore libere" resta aperto: è il modo principale di scegliere.
- Il bottone del sito in basso a sinistra a 320 px: il basamento lo accoglie;
  l'ultimo elemento del piede ha margine inferiore pari al basamento.
- **Spaziatura del testo** (WCAG 1.4.12): nessuna altezza fissa sui blocchi di
  testo; le aree che scorrono hanno solo `max-height`.
- Il numero dei gradi con testo grande: `clamp` con massimo in vh, non cresce
  con il testo (è decorativo, `aria-hidden`).

---

## 7. Punti di conversione

**Un solo intento, una sola etichetta**: "Prenota" → 90°.

| Dove | Forma | Note |
|---|---|---|
| 0° | bottone pieno "Prenota" | unico bottone dell'apertura |
| Quadrante, sempre | parola "prenota" a 90° | non è un bottone in più: è la mappa |
| Vista elenco, 0° | bottone "Prenota" | porta a `#gradi-90` |
| Link di salto | "Vai alla prenotazione" | solo al focus da tastiera |
| Fascia mobile a 90° | nessuno | sei già lì |

Nessun altro "Prenota" (niente bottone a 60°, a 180°, in testata).

**Conversione principale**: "Fissa le due visite" a 90° (S12). Il ciclo è il
default: la conversione vera è **due** appuntamenti.

**Conversioni alternative** (per chi non vuole scrivere):
- telefono `tel:` in testata (sempre), a 180°, in S11 e S15;
- "Apri in Maps" a 180°;
- dopo il successo, "Aggiungi al calendario" (riduce le assenze: è una
  conversione per lo studio).

**Analytics** (fatti veri del sito, `integrazione-sito.md`): solo due eventi.
- `track("apri_concept", { concept: 15 })` al montaggio;
- `track("demo_prenotazione", { concept: 15, controllo: true|false,
  vista: "quadrante"|"elenco", geometria: "bordo"|"pollice",
  origine: "prenota"|"parola"|"frammento"|"slider"|"elenco", motivo: "spalla"|… })`
  in S12, una volta per prenotazione. Nient'altro si traccia (nessun evento per
  angolo, niente nome o telefono nei parametri).

**Gancio che converte**: la frase all'arrivo di 90°, "Il controllo lo fissiamo
noi, una settimana dopo." Il prezzo della prima visita è scritto anche a 90°,
sotto il titolo, in una riga ("Prima visita, 60 minuti, 60 €"): nessuno deve
andare a 180° per sapere quanto spende prima di lasciare il telefono.

**Per Luca (meta-conversione)**: "Un concept di CiceriLab" in fondo a 180° e
nel piede della vista elenco; lo studio che guarda deve pensare "i miei
pazienti prenoterebbero il controllo insieme alla prima visita".

---

## 8. Consegne ad altri agent

- **copywriter**: tutti i testi segnaposto (titoli dei sette angoli, frasi,
  quattro momenti, trattamenti, osteopatia, esercizi con angoli obiettivo,
  listino e recapiti di esempio, tutte le frasi degli stati S0-S15, errori dei
  campi, riga del passaggio automatico). Limiti: 0° frase ≤ 20 parole; `h2` ≤ 6
  parole; ogni angolo ≤ 6 righe a 375 tranne 60° e 180°.
- **tech-architect / scaffold**: regola di scelta della geometria (2.2),
  basamento mobile (2.3), frammenti e storia (1.1), parametri (1.2),
  localStorage (1.3), `inert` sulle sezioni non attive, `visualViewport`,
  generazione orari di esempio relativa a oggi solo lato client, .ics nel
  browser, invio simulato con S10 e S11 riproducibili (es. `?simula=posto` e
  `?simula=rete`, solo in sviluppo).
- **interaction-designer / motion-designer**: aggancio senza rimbalzo, soglie
  della rotella (6.3), passaggio quadrante → fascia a 90° su mobile, arco del
  ciclo in S9, tutto con l'alternativa 6.8.
- **accessibility-auditor**: la sez. 6 è la checklist; in più VoiceOver iOS e
  TalkBack su entrambi gli slider.
- **responsive-tester**: controlli obbligatori: "Prenota" a 0° nel primo
  schermo a 375 × 667; nessun elemento del concept sotto il bottone del sito
  (in alto a sinistra ≥ 640, in basso a sinistra < 640), con il braccio a 0° e
  a 180°; anello e bottone di invio visibili con tastiera aperta; 320 px senza
  scroll orizzontale; zoom 400%; 768 × 1024 in geometria pollice.

---

## Sezioni da costruire

Un section-builder per voce, ognuno solo nei propri file. I nomi sono quelli
delle cartelle/componenti in `src/pages/concepts/novanta/`.

| Nome | Cosa contiene |
|---|---|
| `scheletro-testata` | Guscio della pagina: link di salto, montaggio del `ConceptBackButton`, testata (marchio `h1`, telefono, "Leggi in elenco" / "Torna al quadrante"), **basamento mobile** con zona libera per il bottone del sito e passi ±30°, regioni `aria-live`, regola di scelta geometria/vista (2.2, 6.9), stato angolo condiviso, frammenti e storia (1.1), parametri e localStorage (1.2, 1.3), `inert` sulle sezioni non attive, `track("apri_concept")`. |
| `quadrante` | L'SVG del goniometro nelle due geometrie (al bordo, sotto il pollice) e nella **fascia** da 64 px a 90° su mobile: disco, tacche calcolate, numeri, parole con `nav`/`ol`, braccio con finestrella e manopola, slider ARIA, trascinamento, tocco sul disco, rotella con precedenza allo scroll interno, tastiera, aggancio, invito della manopola, reduced motion. Esporta anche il componente **mini arco** (usato da 30°, 150° e vista elenco). |
| `campo-lettura` | Il contenitore del contenuto dell'angolo attivo: numero dei gradi a cifre fisse che scorre, linea di lettura, dissolvenza incrociata a ±15°, area che scorre con maschera e "continua sotto", posizione della foto a filo del bordo destro / fascia mobile. |
| `angolo-0-da-zero` | Apertura: titolo, frase ≤ 20 parole, bottone "Prenota", foto dello studio vuoto (o piano B). |
| `angolo-30-primo-incontro` | I quattro momenti della prima visita in `ol`, durata e cosa portare, mini arco "oggi 70°, obiettivo 90°" in `figure`. |
| `angolo-60-trattamenti` | Elenco `dl` dei trattamenti con frase e durata, foto facoltativa dell'attrezzatura. |
| `settimana-a-ruota` | L'anello a 7 spicchi con due piste: generazione degli orari di esempio relativi a oggi, slider ARIA, trascinamento e rotella con aggancio alle sole ore libere, indice fisso, lettura al centro, controllo proposto +7…+10 con prima/dopo/togli, arco del ciclo, elenco "Tutte le ore libere", stati S0-S6, S10, S12-S14 lato anello. |
| `modulo-prenotazione` | Angolo 90° completo attorno all'anello: titolo, istruzione, riga del prezzo, campi nome/telefono/motivo con suggerimenti, validazione, stati S7-S13 e S15, invio simulato, .ics con due eventi, `track("demo_prenotazione")`, layout desktop a due colonne e mobile con anello ridotto sticky e gestione tastiera. |
| `angolo-120-osteopatia` | Solo testo: cos'è, quando sì, quando no, "se serve un medico te lo diciamo", durata. |
| `angolo-150-esercizi` | Tre esercizi in `ol` con `h3`, testo e angolo obiettivo scritto, ciascuno con il suo mini arco. |
| `angolo-180-prezzi-dove` | Listino di esempio, pagamenti e fattura sanitaria, indirizzo, orari, telefono, "Apri in Maps", accesso, foto dell'ingresso (o piano B), firma "Un concept di CiceriLab". |
| `vista-elenco` | La pagina verticale: sette sezioni in fila con numero e mini arco, anello a 90° in versione elenco, riga del passaggio automatico, piede con dove siamo in breve e firma, passaggio di angolo tra le due viste, resa senza JavaScript e nel prerender. |
