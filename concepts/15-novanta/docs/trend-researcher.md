# Trend researcher · Concept 15 · NOVANTA · Fisioterapia e osteopatia

Ondata 1. Input letti: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md` (la ricetta bocciata), `docs/matrice-concept-11-20.md`
(riga 15 e paragrafo "15 · NOVANTA", tabella delle differenze),
`concepts/15-novanta/docs/creative-director.md` (vincolante da "3. La scelta"
in giù), `.claude/skills/taste/SKILL.md` con `references/extract.js`.

Scopo: dare all'ondata 2 (art-director, ux, interaction, copywriter, tech)
principi da **reinterpretare** e pattern da **non fare**, con misure vere dove
la rete le ha permesse, e i rischi concreti del quadrante. Nessun codice del
sito, nessuna copia 1:1.

---

## 1. Fonti e cosa ne ho estratto

### 1.1 /taste con Playwright (Chromium in `/opt/pw-browsers`, 26/09/2026)

Procedura della skill: finestra 1440×900, attesa 5-9 s, screenshot della
finestra e a metà pagina, poi `references/extract.js` eseguito nella pagina
(colori, font, pesi, raggi, ombre, transizioni, focus, reduced motion).
Nota tecnica per chi rifà il giro: `extract.js` termina con `};` e passato così
a `page.evaluate` dà `SyntaxError: Unexpected token ';'`; va tolto il `;`
finale e chiamato come `(fn)()`.

**Esiti della rete** (la rete è aperta, ma molti siti rifiutano il proxy):

| URL | Esito |
|---|---|
| `awwwards.com/websites/sites_of_the_day/` e `awwwards.com/` | pagina "upstream request failed": **rifiutato**, nessun SOTD misurabile |
| `swordhealth.com` (fisioterapia digitale) | fermo sul "Vercel Security Checkpoint" |
| `ouraring.com` | prima volta hero vuoto (contenuto solo via JS), poi `ERR_TOO_MANY_RETRIES` |
| `nomos-glashuette.com` (quadranti di orologi) | 404 su `/en`, poi `ERR_TOO_MANY_RETRIES` |
| withings, leica-camera, forhims, physitrack, polar | `ERR_TOO_MANY_RETRIES` |
| kaiahealth, mitutoyo (strumenti di misura), junghans, braun-clocks | timeout |
| ochsundjunior, mbandf (orologi a quadrante) | certificato rifiutato dal proxy |
| **teenage.engineering** (home e `/products/op-1`) | **OK**, misurato |
| **hingehealth.com** (fisioterapia digitale, USA) | **OK**, misurato (usato come contro-esempio) |
| **nothing.tech** | **OK**, misurato (lettura "a display", e cosa non fare) |

#### teenage.engineering (home + pagina OP-1 field): lo strumento come interfaccia

Perché: è il riferimento più citato per "interfacce che sembrano strumenti di
misura" (manopole, display con numeri e mini quadranti).

- **Un carattere solo**: `te-20` in 582 nodi su 584 (home) e 1100 su 1144
  (OP-1). Pesi usati: 100, 200, 300. Niente grassetti.
- **Scala per raddoppio**: 13,22 px → 26,45 → 52,90 px, e 19,10 → 39,67 px.
  Ogni gradino è ×2: poche taglie, salti netti, nessuna taglia "di mezzo".
- **Corpo 19,1 px, interlinea 22 px (1,15)** per frasi brevi centrate; frasi
  di 5-6 righe al massimo, poi 250-400 px di vuoto prima della nota successiva.
- **Nota tecnica** in 13,2 px sotto la frase grande ("one of the 2.4 GHz
  antennas is the tiny white line between the D and the E key"): la didascalia
  da strumento, precisa, un po' ironica.
- **Raggi**: in home **nessun** `border-radius`; sulla pagina OP-1 solo
  20,57 px, 33 volte, e sono i **tasti** dell'oggetto. Tondo = cosa si preme.
- **Ombre**: zero. **Transizioni**: una sola, `transform 0.2s ease-in`.
- **Fondi**: grigi quasi neutri `#F6F8F7` (83% della superficie in home),
  `#E5E5E5` (81% su OP-1), un blu link `#0071BB` come unico colore.
- **Accessibilità dichiarata**: stili `:focus-visible` presenti e media
  query `prefers-reduced-motion` presente.
- Nel display dell'OP-1 (foto prodotto): "12" grande, etichetta "DELAY" in
  piccolo ruotata, **mini quadrante con lancetta** accanto. Il numero e il suo
  arco sono una coppia: il numero dice quanto, l'arco dice "rispetto a cosa".

#### hingehealth.com: com'è oggi la fisioterapia "di serie" (contro-esempio)

Perché: è il grande nome della fisioterapia digitale; mostra la grammatica da
evitare con misure precise.

- Hero: foto di persona su **gradiente scuro** dal basso, H1 56 px/700
  "Pain relief for every body", sottotitolo 20 px, **due bottoni pieno +
  contorno** a pillola con freccia.
- Verde marca `#007B34` e `#00491F`, fascia annuncio lime `#E1F7C9` con emoji,
  fondo bianco al 72,6% della superficie, crema `#FFFBED` all'8%.
- Un carattere solo (BrownLLWeb, 399 nodi) ma 12 taglie diverse da 12 a 56 px
  (13, 14, 15, 16, 18, 20, 22, 24, 32, 40, 56): nessuna scala.
- Raggi misti: 8, 16, 20, 24, 28, 35 px, 50% e 100%: nessun sistema.
- A metà pagina: **carosello di card** (raggio 20-35 px, fondi menta e
  crema) con mockup dell'app dentro e **frecce in cerchi** da 40 px; lista
  esercizi con **foto di una persona che fa l'esercizio** ("Side lunges, 1m,
  Flexibility").
- `:focus-visible` **assente**, `prefers-reduced-motion` **assente**.

#### nothing.tech: il numero "da display" e il suo rischio

- Tre famiglie: NType82 (156 nodi), LatteraMono (126), **Ndot** a matrice di
  punti (14, per i nomi prodotto: "phone (4a)").
- Etichette 11 px maiuscolo mono; titoli di sezione 20-24 px a pesi 55 e 100.
- Fondo `#F4F4F4` all'87,5%, pannelli `rgba(255,255,255,.8)` sopra **foto
  sfocate** a tutto schermo (effetto vetro), raggi 6 e 8 px.
- Transizioni `0.4s cubic-bezier(0.4, 0, 0.2, 1)` e `opacity 0.1s`.
- Lezione utile: un solo nome in un carattere "da strumento" basta a dare
  identità. Lezione da evitare: il mono/dot-matrix e il vetro sfocato sono
  oggi la divisa "tech"; per NOVANTA sono vietati (monospace escluso dal
  creative director, niente sfumature sul fondo).

### 1.2 awesome-design-md (letti in `design-references/awesome-design-md/design-md/`)

| Sistema | Perché serve a NOVANTA | Cosa prendo (principio) | Cosa NON prendo |
|---|---|---|---|
| **wise** | Display pesantissimo (900) a 64-126 px con interlinea 0,85 (`126px / 107.1px`), fondo tinto `#E8EBE6` al posto del bianco. | Il numero grande pesante con interlinea sotto 1 regge da solo come titolo; il campo di colore tinto fa marca più di qualunque illustrazione. | Il lime acceso, le card bianche arrotondate su fondo tinto. |
| **cal** | È il riferimento del "prenota" moderno: mostra il **widget vero** in piccolo dentro la pagina invece di illustrarlo. Raggi max 16 px "per sembrare software professionale". | Mostrare l'oggetto vero (l'anello settimanale, il mini arco "oggi 70°, obiettivo 90°") al posto di icone o disegni che lo raccontano. | Il calendario a griglia 7×5, il bianco, le card con bordino `#E5E7EB` e ombra. |
| **ibm** (Carbon) | Plex Sans a peso **300** per i display, raggi 0-4 px, un solo accento. | Precisione da strumento = pochi pesi, angoli netti sulle superfici, un solo colore che "segna". | Il blu `#0F62FE`, le griglie di tile, il bianco. |
| **mastercard** | Il caso più vicino al rischio di NOVANTA: fondo caldo `#F3F0EE`, **cerchi, orbite e archi arancio sottili** che attraversano la pagina, raggi 40-1000 px. | Nulla sul piano formale; solo la conferma che fondo caldo + archi sottili = "annuncio corporate". | Archi sottili decorativi, cerchi con foto, occhielli maiuscoli con puntino. |

### 1.3 Controllo dei contrasti della palette (calcolati, WCAG 2.x)

| Coppia | Rapporto | Esito |
|---|---|---|
| petrolio `#0E3D49` su albicocca `#F4D5C0` | **8,49:1** | AA e AAA |
| petrolio su gesso `#FCF8F3` | **11,14:1** | AAA |
| petrolio al **72%** su albicocca (= `#4E686A`) | **4,31:1** | **non passa AA** per il testo normale |
| petrolio al 74% (`#4A6568`) | 4,51:1 | passa di un soffio (sconsigliato) |
| petrolio al **76%** (`#456166`) | **4,79:1** | minimo consigliato per il testo secondario |
| petrolio al 60% (parole inattive del quadrante) su albicocca | 3,24:1 | **non passa** (è testo, anche se piccolo) |
| petrolio al 60% su gesso | 3,57:1 | non passa |
| albicocca scura `#E9BFA3` su albicocca | 1,22:1 | quasi invisibile |
| albicocca scura su gesso (tacche "non percorse" sul disco) | 1,60:1 | debole |
| albicocca su gesso (bordo del disco sul fondo) | **1,31:1** | il disco **non ha bordo leggibile** da solo |
| `#C98F72` su albicocca / `#B97E62` su albicocca | 1,98 / 2,43 | alternative più visibili per le tacche |

---

## 2. Principi da reinterpretare (10)

### P1 · Lo strumento è l'interfaccia, non un'illustrazione
*Da: teenage.engineering (i tasti e il display dell'OP-1 sono la pagina), cal (il widget vero mostrato in piccolo).*
**In NOVANTA**: il quadrante non "rappresenta" la navigazione, **è** la
navigazione; l'anello non illustra un calendario, **è** il calendario. Regola
di controllo per ogni agent: se un elemento si potrebbe togliere senza perdere
una funzione, è decorazione e va tolto. I mini archi a 30° e 150° sono istanze
dello stesso componente del quadrante (stessa funzione, scala diversa), mai
disegni nuovi.

### P2 · Il numero e il suo arco sono una coppia
*Da: il display dell'OP-1 ("12" grande + mini quadrante con lancetta).*
**In NOVANTA**: il numero dei gradi da solo sembra un contatore statistico;
accanto al suo arco diventa una misura. Il numero grande nel campo a destra e
la finestrella di lettura sul braccio devono mostrare **sempre lo stesso
valore nello stesso istante** (una sola sorgente, `--deg`). Nei mini archi di
"primo incontro" ed "esercizi" il numero sta vicino all'arco, mai in una
legenda separata.

### P3 · Scala tipografica per raddoppio, poche taglie
*Da: teenage.engineering (13,2 → 26,4 → 52,9 px; 19,1 → 39,7 px). Contro-esempio: Hinge con 12 taglie tra 12 e 56 px.*
**In NOVANTA**: proposta per l'art-director, desktop: Lexend **18** (corpo),
Epilogue **36** (titolo dell'angolo), **72** (numeri del listino e lettura
dell'anello), numero dei gradi a **clamp tra 144 px e 26 vh**. Didascalie a
14 px. Cinque taglie in tutto il sito. Mobile: 17 / 28 / 56 / 104. Se serve
una sesta taglia, è un problema di contenuto, non di tipografia.

### P4 · Pochi pesi, contrasto netto tra "misura" e "lettura"
*Da: teenage.engineering (100-300, un solo carattere), ibm (display a 300), wise (display a 900, interlinea 0,85).*
**In NOVANTA**: i gradi in Epilogue 800 con interlinea 0,85-0,9 (il numero è
un blocco, non una riga), il "°" in 300 (come già deciso), i titoli in 700,
Lexend solo 400 e 500. Totale: cinque pesi, nessun corsivo. Il salto tra il
numero pesante e il testo leggero è la firma tipografica: non va attenuato con
pesi intermedi (600) "per armonia".

### P5 · Tondo solo su ciò che si afferra
*Da: teenage.engineering (home con zero `border-radius`; su OP-1 i 20,6 px esistono solo sui tasti). Contro-esempio: Hinge con 8 raggi diversi.*
**In NOVANTA**: conferma e irrigidisce la regola del creative director.
Pillola/cerchio per: manopola del braccio, perno, bottoni "Prenota", "prima /
dopo", "Fissa le due visite". Raggio unico 14 px per campi e blocchi di
listino. **Nessun altro raggio.** Se un blocco di testo ha lo sfondo gesso con
raggio 14, non ha anche un'ombra.

### P6 · Il colore è un campo pieno, non un effetto
*Da: wise (fondo tinto `#E8EBE6` come identità), teenage.engineering (un grigio all'83% della superficie). Contro-esempio: nothing.tech (foto sfocate e vetro), Hinge (gradiente scuro sull'hero).*
**In NOVANTA**: albicocca `#F4D5C0` su tutta la finestra, sempre, anche a
90° e nella vista elenco. Nessuna sfumatura, nessuna vignettatura, nessun
`backdrop-filter`. La velatura `multiply` al 12% sulle foto è l'unica
concessione ed è un modo per portare la foto nel campo, non un effetto.

### P7 · Una frase per schermata, poi vuoto
*Da: pagina OP-1 ("if it feels thinner. it is." a circa 40 px, 5-6 righe di corpo, poi 250-400 px di vuoto).*
**In NOVANTA**: ogni angolo ha **una** affermazione in apertura (il titolo,
massimo 6 parole) e un testo che sta in 5-6 righe a 375 px. Il vuoto non è
"spazio da riempire" ma il posto dove l'occhio va al quadrante. Il copywriter
scrive frasi da fisioterapista al lettino ("Alla prima visita misuriamo quanto
si alza il braccio."), non slogan ("Il tuo benessere al centro").

### P8 · La nota tecnica come didascalia di strumento
*Da: teenage.engineering (didascalia 13,2 px sotto la frase: un dettaglio vero e verificabile).*
**In NOVANTA**: sotto il testo di alcuni angoli, una riga a 14 px in Lexend
minuscolo con un fatto del mestiere: "La misura si prende da seduti, con la
schiena appoggiata." / "Un braccio sano arriva intorno ai 170-180 gradi."
(da far verificare al copywriter come affermazione generica, non clinica).
**Non** in maiuscolo spaziato (la didascalia di TE lo è: noi no, è nella
ricetta bocciata).

### P9 · Il movimento ha una sola durata e una causa
*Da: teenage.engineering (una transizione: `transform 0.2s ease-in`), nothing (una curva, `cubic-bezier(0.4,0,0.2,1)`, per tutto).*
**In NOVANTA**: tre token e basta: **180 ms** cambio contenuto, **350 ms**
aggancio del braccio (frenata, nessun rimbalzo), **400-600 ms** chiusura
dell'arco del ciclo. Una curva sola di uscita per tutti. Ogni movimento
risponde a "chi lo muove?": il dito o la rotella muovono il braccio, il braccio
cambia il contenuto. Niente che si muova da solo (unica eccezione: l'invito di
6° una volta, già normato).

### P10 · Accessibilità dichiarata come parte del mestiere
*Da: teenage.engineering (`:focus-visible` e `prefers-reduced-motion` presenti anche su un sito giocoso). Contro-esempio: Hinge, sito sanitario, senza nessuno dei due.*
**In NOVANTA**: per uno studio che cura persone con un braccio che non si
alza, il sito usabile con una mano sola, da tastiera e senza animazioni **è**
il messaggio. L'anello di focus petrolio 3 px + 3 px di distanza è parte del
linguaggio visivo (sta bene sul fondo albicocca: 8,49:1), non un'aggiunta da
QA.

---

## 3. Pattern inflazionati da evitare (10)

1. **La ricetta bocciata di `docs/concept-lab.md`, per intero**: titoli in
   serif corsivo con sottotitolo sans; sezioni "01 ·", "02 ·" con etichette in
   maiuscoletto spaziato o monospace; griglie di schede bianche con bordino e
   ombra leggera; stesso fade-up ovunque allo scroll; onde, filetti e divisori
   tra le sezioni; mappa disegnata al posto di quella vera; prenotazione a passi
   che finisce in cartolina, scontrino o ricevuta; sagome e figure umane in
   SVG. In più, dal bocciato SNODO: split testo a sinistra e foto in cornice
   a destra, riga di numeri tra due filetti, "TAV. I".
2. **L'hero della sanità digitale** (misurato su Hinge): persona sorridente in
   foto, gradiente scuro sotto il titolo, H1 bold "Pain relief for every body",
   due bottoni pieno + contorno a pillola con freccia, fascia annuncio con
   emoji in alto.
3. **Carosello di card con mockup dell'app e frecce in cerchi** (Hinge: card a
   raggio 20-35 px su fondi menta e crema, frecce in cerchi da 40 px). Da noi
   nessun carosello: ogni contenuto ha il suo angolo.
4. **Esercizi mostrati con foto o video di una persona che li esegue** (lista
   Hinge "Side lunges, 1m, Flexibility" con miniatura). In NOVANTA gli esercizi
   sono una frase e un **angolo obiettivo** su un mini arco. Nessun omino,
   nessuna miniatura.
5. **Anelli di punteggio e indicatori di prestazione**: il "readiness score"
   degli anelli e degli orologi fitness, i cerchi di attività concentrici
   colorati, il tachimetro con zone verde/giallo/rosso e lancetta rossa. È il
   modo in cui un arco con un numero viene letto per abitudine: il quadrante di
   NOVANTA deve sembrare un goniometro di plastica o metallo, non un
   cruscotto. Niente colori di stato sulle tacche.
6. **Fondi sfocati, mesh gradient, vetro** (nothing.tech: foto sfocate a
   tutto schermo con pannelli `rgba(255,255,255,.8)`; l'"aurora" pastello
   dei siti salute e benessere). Rompono il campo pieno di albicocca.
7. **Archi concentrici e orbite decorative sottili** (LUME, mastercard con gli
   archi arancio che attraversano la pagina). Qualunque arco in NOVANTA è
   graduato, spesso e serve a qualcosa: se un arco non ha tacche e non si può
   toccare, non c'è.
8. **Il numero "tech" in monospace o a matrice di punti** (Ndot e LatteraMono
   di Nothing, il contatore a rullo stile aeroporto). È la tentazione più forte
   per i gradi: vietato. I gradi sono Epilogue 800 con cifre a larghezza fissa
   e cambiano in continuo, senza effetto "flip" né "slot machine".
9. **Numeri statistici che contano all'ingresso** ("+1 900 pazienti",
   "dal 2011", "98% soddisfatti") e recensioni con nome generico e stelline. Il
   solo numero del sito è l'angolo; ogni altro contatore gli toglie senso.
10. **Il corpo come interfaccia e il dolore come misura**: mappa del corpo
    "tocca dove ti fa male", scheletri, muscoli in rosso, articolazioni
    evidenziate, scala del dolore 0-10, faccine, icone di osso o colonna
    vertebrale, croce verde, onda del battito, foto di mani su una spalla.

Da tenere d'occhio anche (non in lista perché già vietati dal creative
director): cursore custom, rotazione dimostrativa 0→180 all'apertura, testo
che ruota con il braccio, chip con icona "prima visita senza impegno", widget a
passi.

---

## 4. Rischi del concept, con note pratiche

### 4.1 Contrasto: il 72% non basta, il 60% nemmeno
Il testo secondario al 72% di petrolio (4,31:1) **non passa AA**: usare almeno
il **76%** (`#456166`, 4,79:1) o il petrolio pieno. Le parole inattive del
quadrante "al 60%" sono testo e a 3,24:1 falliscono: distinguere attiva e
inattive con il **peso** (Lexend 500 contro 400) e con la tacca lunga accesa,
lasciando il colore al 100% (o al minimo 76%). Il disco gesso sul fondo
albicocca ha 1,31:1: senza un contorno petrolio sottile (1-1,5 px) o l'anello
delle tacche fino al bordo, a 375 px il disco "sparisce" e resta un braccio che
galleggia. Le tacche "non percorse" in `#E9BFA3` su gesso sono a 1,60:1: vanno
bene come decorazione (lo stato lo dice il numero), ma se l'art-director vuole
che l'arco percorso si legga davvero, `#C98F72` è il minimo sensato.

### 4.2 Mobile 375 px: la manopola esce dallo schermo
Con il perno al centro del bordo inferiore (x = 187,5), raggio 165 px e
braccio che sporge **40 px oltre l'arco**, a 0° la manopola sta a
x = 187,5 − 205 = **−17,5 px** e a 180° a **392,5 px**: fuori dallo schermo
da entrambi i lati. Con il margine laterale di 16 px, raggio + sporgenza +
metà manopola deve stare in **171 px**: per esempio raggio 125-130 px con
sporgenza 16 px e manopola da 48 px, oppure la manopola che si ferma sull'arco
(nessuna sporgenza) sotto 760 px. Da decidere prima di disegnare.

Altri conflitti del bordo inferiore da risolvere insieme: il
`ConceptBackButton` in basso a sinistra sotto 640 px (proprio sulla zona 0°),
l'indicatore home di iOS (`env(safe-area-inset-bottom)`), la barra di Safari
che cambia altezza (usare `100dvh`, non `100vh`), il gesto "indietro" di iOS
che parte dal bordo sinistro (un trascinamento del braccio vicino a 0° può
far tornare alla pagina precedente: la zona di presa non deve toccare i primi
20 px del bordo).

### 4.3 La rotella che non scorre
Dirottare la rotella è il punto più fragile. Concreti:
- Chrome e Safari mandano `deltaY` circa 100 per scatto di rotella: con
  "1° ogni 4 px" uno scatto fa 25°, non 30. Firefox usa `deltaMode = 1`
  (righe, 3 per scatto): va normalizzato. Meglio: **uno scatto = un angolo**
  (accumulo fino a una soglia, poi aggancio a +30°).
- Il trackpad manda decine di delta piccoli con inerzia: serve un blocco di
  circa 300-400 ms dopo ogni cambio d'angolo, altrimenti un solo gesto
  attraversa tre angoli.
- `wheel` con `{ passive: false }` e `preventDefault` solo quando il
  puntatore **non** è sopra un'area che scorre ancora (listino a 180°), come già
  scritto dal creative director.
- `touch-action: none` **solo** sul disco e sull'anello, mai sul `body`: il
  testo lungo deve scorrere col dito.
- Pointer capture sul braccio (`setPointerCapture`) per non perdere il
  trascinamento quando il dito esce dal disco.

### 4.4 Il quadrante letto come cruscotto o come scala del dolore
Un arco 0-180 con un numero grande è, per abitudine, un tachimetro o un
punteggio. Difese: niente colori di stato; tacche fitte ogni grado come un
goniometro vero (180 tacche, non 10 segmenti); numeri di riferimento ogni 30°
piccoli; il braccio con la finestrella di lettura (un tachimetro non ce l'ha);
la parola "gradi" mai sostituita da "livello", "punteggio", "progresso". Il
copywriter non scrive mai "più alto è meglio".

### 4.5 Somiglianze interne alla serie
- **LUME (9)**: archi chiari su bianco. Difesa: mai bianco, arco sempre
  graduato e spesso, appoggiato al bordo, mai centrato come sfondo.
- **SOTTOSCOCCA (18)**: asta graduata verticale. Difesa: nessuna scala
  lineare nel sito, nemmeno nella vista elenco (i gradi lì sono solo titoli
  numerici, senza righello).
- **IMBRUNIRE (20)**: toni rosati. Difesa: albicocca chiaro e petrolio, mai
  terracotta, mai fondo scuro.

### 4.6 Tipografia: cifre che ballano
Il numero cambia grado per grado: se le cifre di Epilogue non hanno larghezza
fissa, "111" e "180" hanno larghezze diverse e il numero vibra. Va
**verificato** sul file del font (feature `tnum`), non presunto; in mancanza,
ogni cifra in un box a larghezza fissa come già previsto. Anche il "1" stretto
accanto al "°" leggero va controllato a 144 px.

### 4.7 Vista elenco come cittadina di prima classe
È ciò che vedono prerender, chi non ha JavaScript, chi ingrandisce il testo e
chi ha una finestra bassa. Rischio reale: diventa la "versione brutta". Deve
avere lo stesso campo albicocca, gli stessi numeri dei gradi come titoli (a
72 px, non 144), il mini arco dove previsto e l'anello di prenotazione vero.
Il test dell'ondata di QA dovrebbe includere uno screenshot della vista elenco
a 375 e 1440 px, giudicato con lo stesso metro del quadrante.

### 4.8 Foto
Lo studio vuoto di fisioterapia credibile è raro sulle banche immagini (quasi
sempre c'è un terapista con le mani su un paziente, cioè il divieto). Il piano
B tipografico del creative director va considerato **probabile**, non
eccezionale: il sito deve essere pensato bello senza foto fin da subito.

---

## 5. Tabella rapida: prendere / non prendere

| Dal riferimento | Prendere | Non prendere |
|---|---|---|
| teenage.engineering | oggetto = interfaccia, scala ×2, un carattere, tondo solo sui tasti, una transizione, focus e reduced motion dichiarati | grigio freddo, testo centrato lungo, maiuscolo spaziato nelle didascalie, illustrazioni a fumetto |
| hingehealth.com | niente (solo contro-esempio misurato) | hero con persona e gradiente, due bottoni, carosello di card, miniature di esercizi, 8 raggi diversi |
| nothing.tech | un solo elemento "da strumento" basta a fare identità | dot-matrix e mono, vetro sfocato, 11 px maiuscolo |
| wise | numero pesante con interlinea 0,85, fondo tinto come marca | lime, card bianche arrotondate |
| cal | mostrare il widget vero, non illustrarlo | griglia di calendario, bianco, card con ombra |
| ibm | pochi pesi, angoli netti, un solo accento | blu, tile, bianco |
| mastercard | (conferma del rischio archi) | archi sottili e orbite, cerchi con foto, occhielli maiuscoli |
