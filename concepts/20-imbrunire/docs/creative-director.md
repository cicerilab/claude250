# Creative director · Concept 20 · Albergo di sette stanze (Pordenone)

Ondata 0. Rotta `/concept-20`. Documento di direzione per tutti gli agent delle
ondate successive: quello che è scritto da "4. La scelta" in giù è vincolante.

Materiale letto: `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/matrice-concept-11-20.md` (riga 20, paragrafo 20,
verifica incrociata, regole comuni), `.claude/skills/design-taste-frontend/SKILL.md`
(sezioni 0, 1, 4, 9), `concepts/10-torchio/docs/creative-director.md` (solo come
livello e formato), screenshot `docs/concept-attuali/concept-20.jpg` (il bocciato
SETTE CHIAVI).

La direzione è assegnata dalla matrice (IMBRUNIRE). Qui la raffino, la sviluppo e
ne scelgo l'esecuzione tra tre varianti; palette, font, struttura, interazione
firma e prenotazione restano quelli della matrice.

---

## 0. Cosa ho visto (base delle scelte)

**Il bocciato SETTE CHIAVI**: verde bottiglia + oro, serif con una parola in
corsivo dorato ("gancio"), occhiello maiuscoletto "ALBERGO · VICOLO DEL CRISTO 4 ·
DAL 1923", riga di quattro numeri tra due filetti ("sette / dal 1748 / 5 / dalle
7:30"), due bottoni pieno + contorno, foto di una camera incorniciata a destra
con "TAV. I", poi "01 La bacheca delle chiavi". La metafora (chiave sul gancio =
stanza libera) era buona come idea ma vestita con la ricetta.

**Conseguenza**: il nuovo 20 non ha nulla di verde, di oro, di chiavi, di ganci,
di bacheche, di numeri di stanza sul legno. Non ha una prima schermata con testo
e foto affiancati. La domanda "è libera?" si risponde con la **luce accesa in una
stanza**, non con un oggetto appeso.

**Vicini da tenere lontani** (dalla verifica incrociata):
- 11 TAJUT usa anche lui CSS 3D, ma gira carte piatte su un tavolo: in 20 il 3D
  è un **ambiente in cui si entra**, con profondità, pavimento, soffitto.
- 15 NOVANTA ha toni caldi rosati chiari (albicocca + petrolio): in 20 la
  terracotta è media e sta **su blu notte**, mai su chiaro.
- 1 MERIDIANA e 3 MARGINALIA usano blu notte come testo su crema: in 20 il blu
  notte è **il cielo e il fondo**, il testo è chiaro sul blu.
- 16 EVIDENZIA sceglie una casa leggendo; 20 sceglie la stanza **entrandoci**.

---

## 1. Design Read e dial

**Design Read**: *Reading this as: sito vetrina con prenotazione diretta di un
piccolo albergo di sette stanze in un palazzo del centro di Pordenone, per
viaggiatori di coppia e di lavoro che scelgono la stanza e non la catena, con un
linguaggio serale, caldo e architettonico (il palazzo tagliato in sezione come
una casa di bambola all'ora in cui si accendono le luci), leaning toward CSS 3D
nativo (scatole con prospettiva) + fotografie vere delle camere + un calendario
lunare calcolato, senza WebGL e senza illustrazioni disegnate.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **8** | La struttura è un edificio, non una pagina a colonne: asimmetrica per natura (la scala da un lato, stanze di larghezze diverse, il tetto). Non 9-10: deve restare leggibile come un albergo, con prezzi e regole chiari. |
| `MOTION_INTENSITY` | **5** | Due soli movimenti forti: entrare/uscire da una stanza e le luci che si accendono o si spengono in dissolvenza lenta. Tutto il resto è fermo. È un sito di sera: calmo. |
| `VISUAL_DENSITY` | **4** | Sette stanze + tre spazi comuni in una sola vista: qualche informazione in più di un sito arioso, ma ogni cella dice una cosa sola (nome, prezzo da, luce). Le regole vivono dentro l'androne, non in un muro di testo. |

---

## 2. La metafora sviluppata: il palazzo in sezione all'imbrunire

Un albergo di sette stanze si sceglie **per la stanza**: chi prenota vuole sapere
se dorme sotto le travi o al piano nobile col camino, se la finestra dà sul
Noncello o sulla corte. Un sito di catena mostra "camera doppia superior"; qui
mostriamo **il palazzo intero, tagliato**, come le case di bambola che si aprono
sul davanti e come le sezioni degli architetti.

**L'ora è fissa: l'imbrunire.** È il momento in cui un viaggiatore arriva in un
albergo, in cui il palazzo da fuori diventa una fila di finestre calde, in cui
dal marciapiede si vede dentro alle stanze. È anche il momento in cui sale la
luna: per questo le notti si scelgono sulle lune. Il sito **non** cambia con
l'ora vera (era la meccanica del bocciato VESPRO): è sempre quel quarto d'ora.

**Cosa si vede**
- Un cielo blu notte pieno (`#1F2638`), fermo, con la luna di **stasera**
  (fase vera, calcolata) sopra il tetto, piccola, nell'angolo del cielo.
- Il palazzo di intonaco terracotta, visto di fronte, **tagliato**: il fronte è
  stato tolto e si vedono i muri e i solai sezionati (il "poché" degli
  architetti, pieno e più scuro), tre piani, la scala su un lato, il tetto a
  falde con due comignoli, il portico al piano terra (i portici di corso Vittorio
  Emanuele a Pordenone).
- Dentro ogni stanza, una scatola vera: pavimento, soffitto, pareti laterali in
  prospettiva e **la parete di fondo che è la foto vera della camera**. Le stanze
  sono illuminate da dentro: la foto è calda, la cornice della stanza è in ombra.

**La pianta delle celle (vincolante per ux-architect e builder)**

| Piano | Da sinistra a destra | Contenuto |
|---|---|---|
| Sottotetto (2°) | **Il Noce** · **Il Campanile** · **La Soffitta** · pianerottolo | tre camere sotto le travi, soffitto inclinato (la sezione del tetto taglia le celle) |
| Piano nobile (1°) | **Il Camino** (la più larga) · **La Loggia** · **Sul Noncello** · pianerottolo | tre camere alte, finestre grandi |
| Piano terra | **Il portico** (fuori, sulla strada) · **L'androne** (reception) · **La colazione** · **La Corte** · rampa | La Corte è la camera senza scale (accessibile, porta sulla corte interna) |

- La **scala** è una colonna verticale all'estremità destra, con rampe a
  gradini fatte di scatole CSS: è il percorso tra i piani, anche nella
  navigazione (vedi 5.3).
- Le larghezze delle celle sono volutamente diverse (Il Camino ~1,4 volte una
  camera normale, La Soffitta più stretta, il portico aperto sul davanti): è un
  edificio vero, non una griglia 3×3.
- Nomi delle stanze: legati a cosa si vede o cosa c'è (il noce del pavimento, il
  campanile di San Marco dalla finestra, il fiume Noncello, il camino in pietra).
  **Niente numeri di stanza come identità** (il bocciato li aveva sui ganci):
  il numero esiste solo come dato piccolo nella scheda.

**Perché è di questo mestiere e non di un altro**
L'albergo diffuso e il piccolo albergo di palazzo vendono una cosa sola che le
catene non hanno: **ogni stanza è diversa**. La sezione le mostra tutte insieme,
diverse, nello stesso palazzo, e fa capire in un colpo d'occhio la cosa che il
cliente chiede al telefono: "quali sono libere quelle notti?". La risposta è la
più antica immagine di un albergo: **le finestre accese**.

---

## 3. Tre varianti di esecuzione della stessa direzione

La direzione (palazzo in sezione, CSS 3D, lune, luci) è fissata dalla matrice.
Le tre varianti cambiano **come** la si mette in scena.

### Variante A · "Sezione frontale" (sezione di fronte, profondità vera dentro)

- Il palazzo è visto **frontalmente**, in proiezione quasi ortogonale; la
  prospettiva (`perspective` sul contenitore) si vede solo **dentro** le stanze:
  ogni cella è una scatola profonda, con pavimento, soffitto e pareti laterali
  che fuggono verso la foto di fondo. Il punto di fuga di ogni stanza è il
  centro della stanza stessa (non uno solo per tutto il palazzo), così ogni
  camera sembra "guardata dal suo pianerottolo".
- Entrare: la sezione intera trasla e scala finché la stanza scelta riempie la
  finestra; mentre lo fa, la parete di fondo si avvicina (`translateZ`) e le
  pareti laterali escono dai bordi: si ha la sensazione di **camminare dentro**.
- Pro: leggibile a colpo d'occhio, tutte e dieci le celle visibili; la
  disponibilità (luci accese/spente) si legge senza ruotare nulla; costruibile
  con scatole semplici; su mobile i piani si impilano senza cambiare natura.
- Rischi: può sembrare piatto se le scatole non hanno spessore e luce credibili.
  Si risolve con il poché spesso, l'ombra interna calda e il soffitto a travi.

### Variante B · "Plastico di tre quarti"

- Il palazzo è un plastico ruotato di 30° su un tavolo, con facciata laterale
  visibile; si ruota trascinando (orbita limitata ±35°). Entrare in una stanza
  significa volare con la telecamera fino alla sua apertura.
- Pro: più "wow" nella prima schermata, oggetto tridimensionale forte.
- Rischi: con la rotazione le stanze del lato lontano si leggono male, e la
  disponibilità (la cosa che serve) si perde; orbita + trascinamento del nastro
  delle lune = due gesti di trascinamento in competizione; su 375 px il plastico
  in tre quarti diventa minuscolo; troppo vicino al "oggetto 3D che ruota" di 1
  MERIDIANA e a 18 SOTTOSCOCCA. Il testo ruotato in CSS 3D rende male.

### Variante C · "Facciata a cerniera"

- All'apertura si vede la **facciata** intera del palazzo all'imbrunire, con le
  finestre che si accendono una per volta; al primo tocco la facciata si apre su
  una cerniera laterale come lo sportello di una casa di bambola vera e rivela la
  sezione.
- Pro: il gesto d'apertura è memorabile e letterale.
- Rischi: aggiunge un passaggio prima del contenuto (una "intro" che il
  visitatore di ritorno odia); la facciata va disegnata con cura (finestre,
  cornici, marcapiani) e scivola verso l'illustrazione disegnata a mano, che la
  matrice vieta; lo sportello che ruota di 110° su mobile esce dallo schermo;
  "casa di bambola che si apre" rischia l'effetto giocattolo per un albergo che
  vende 140 € a notte.

---

## 4. La scelta: Variante A "Sezione frontale"

**Perché vince**
1. **Mette la disponibilità al centro**: la sezione frontale è l'unica in cui
   tutte e sette le camere sono visibili insieme e alla stessa scala, quindi
   "quali sono accese per le mie notti" si legge in un secondo. È il cuore della
   prenotazione, e le altre due varianti lo indeboliscono.
2. **Il 3D serve a entrare, non a mostrarsi**: la profondità è dentro le stanze
   (dove c'è la foto), non nel volume esterno. Questo distingue 20 da 1 e 18
   (oggetti che ruotano) e da 11 (carte piatte che si girano).
3. **Un solo gesto per volta**: sulla sezione si tocca; sul nastro delle lune si
   trascina. Nessuna orbita che litiga con il nastro.
4. **Costruibile bene**: scatole CSS semplici (la matrice lo chiede: "costruita
   in CSS con scatole semplici, non disegnata a mano"), niente WebGL, peso basso;
   il rischio sta tutto nella cura di luce e proporzioni, cioè dove un art
   director può intervenire.

**Cosa prendo dalle altre due**
- Da C: **l'accensione delle luci** all'apertura, ma senza facciata e senza
  sportello: la sezione è già aperta, sono le stanze che si accendono una dopo
  l'altra in dissolvenza lenta (vedi 6.4). Nessun passaggio in più.
- Da B: un **accenno di volume**: il tetto e il lato destro della scala mostrano
  2-3° di rotazione in `rotateY` legata al puntatore (parallasse leggerissima,
  massimo 2°, solo desktop, spenta con reduced motion). Niente orbita.

**Nome**: **IMBRUNIRE**, *albergo di sette stanze*, Pordenone. È il nome
dell'albergo e del concept. Sul portale dell'androne, in Marcellus maiuscolo, è
"inciso" ALBERGO IMBRUNIRE. Indirizzo di esempio sotto i portici del centro
(scelto dal copywriter, con civico di esempio), nessun dato legale inventato,
recapiti di esempio (repo pubblico).

---

## 5. Sistema visivo e struttura

### 5.1 Palette (raffinata dalla matrice, stessi quattro colori base)

| Ruolo | Colore | Uso |
|---|---|---|
| Notte | `#1F2638` | cielo, fondo di tutto, pannelli di testo |
| Notte profonda | `#171C2A` | interno delle stanze spente, ombre dentro le scatole |
| Intonaco | `#BE7359` | muri e facciata sezionata (solo superfici, mai fondo di testo piccolo) |
| Poché | `#8A4A38` | spessore di muri e solai tagliati, gradini della scala |
| Luna | `#F2E8D0` | testo principale su notte (contrasto 12,4:1), disco della luna |
| Luce | `#F2C77C` | stanze accese (velatura calda sulla foto e alone sul pavimento), selezione sul nastro, bottone primario (testo notte su luce, 9,5:1) |
| Luna spenta | `#9AA0B4` | testo secondario su notte (5,8:1), parte in ombra della luna |

Regole:
- Contrasti verificati: notte su intonaco 4,15:1 → sull'intonaco solo testo
  **grande** (≥ 24 px), cioè i nomi delle stanze in Marcellus; il testo corrente
  sta sempre su notte (luna o luna spenta) o su poché (luna su poché 5,5:1).
- **Nessun gradiente di cielo verso il viola**, nessun arancio di tramonto: il
  cielo è notte piena. Al massimo, vicino ai tetti, uno schiarimento di 3-4
  punti di luminosità dello stesso blu (`#1F2638` → `#262E44`), mai virato.
- La "luce" è l'unico accento. Nessun altro colore: nessun verde, nessun oro
  metallico, nessun rosso di errore saturo (gli errori sono in luna, con icona e
  testo, su un filo di luce).
- Tema: il sito è **scuro per identità** (è sera). Non esiste un tema chiaro; il
  contrasto AA è garantito nel tema unico. Si dichiara `color-scheme: dark`.

### 5.2 Tipografia

- **Marcellus** (display, un solo peso): usata **solo in maiuscolo o in
  maiuscolo e minuscolo da iscrizione**, mai corsivo (non esiste e non si
  simula), mai con un sottotitolo sans attaccato come "titolo + occhiello". Usi:
  nomi delle stanze sulle celle, iscrizione del portale, titolo della stanza
  aperta, il mese sul nastro delle lune. Spaziatura leggermente aperta (+0,04em)
  come nelle lapidi, non il maiuscoletto spaziato a +0,2em della ricetta.
- **Commissioner** (testo, variabile): 400/500/600, 16-17 px, interlinea 1,55,
  righe ≤ 60 caratteri. Cifre tabellari (`font-variant-numeric: tabular-nums`)
  per prezzi, date, orari. Nessun monospace.
- Gerarchia con peso e colore (luna vs luna spenta), non con dimensioni che
  urlano: la cosa grande del sito è il palazzo, non un H1.
- Font vietati dalla matrice: nessuno usato. Marcellus e Commissioner non sono
  in 1-19 né in IMPRONTA.

### 5.3 Schermate e navigazione (struttura esplorabile)

Il sito **non è una pagina a sezioni che scorre** (desktop). È un luogo con
stati. Ogni stato ha un indirizzo (hash) così il tasto indietro del browser
funziona sempre.

| Stato | Hash | Cosa si vede |
|---|---|---|
| **Il palazzo** (home) | `#/` | cielo, luna di stasera, palazzo in sezione a tutta altezza, nastro delle lune in cielo (desktop) o bottone "Scegli le lune" (mobile) |
| **Dentro una camera** | `#/stanza/<slug>` (es. `#/stanza/il-camino`) | la stanza riempie lo schermo, la foto è la parete di fondo; pannello della stanza |
| **Dentro uno spazio comune** | `#/androne`, `#/colazione`, `#/portico` | reception e regole; colazione; la strada e dove siamo |
| **Le lune aperte** | `#/lune` (+ query `?dal=2026-10-14&notti=3`) | nastro attivo, sezione con le stanze libere accese |
| **Le stanze in elenco** | `#/elenco` | vista testuale e accessibile di tutte le stanze (vedi 9) |

**Contenuto degli spazi**
- **L'androne (reception)**: la parete di fondo non è una foto ma l'intonaco
  con l'iscrizione ALBERGO IMBRUNIRE e, sotto, le regole scritte come su una
  targa: reception 7:30-21:00 (dopo le 21 si arriva solo avvisando, vedi 7.5),
  colazione 7:30-10:30, partenza entro le 11, animali piccoli su richiesta,
  parcheggio convenzionato a 250 m, tassa di soggiorno di esempio. Qui c'è anche
  il telefono di esempio.
- **La colazione**: foto vera di una colazione in sala (pane, marmellate,
  frutta), tre righe su cosa c'è e da dove viene (forno e latteria del posto).
- **Il portico**: è fuori, sulla strada, aperto sul davanti. "A piedi da qui"
  (Duomo di San Marco, Loggia del Municipio, corso Vittorio Emanuele, parco
  del Noncello, stazione: minuti a piedi) e **"Apri in Maps"** che porta alla
  mappa vera. Nessuna mappa disegnata.
- **Chi siamo**: una frase incisa sotto il cornicione del tetto (chi tiene
  l'albergo, da quando, di esempio e senza figure umane), non una sezione.

**Come si naviga**
- **Dal palazzo**: si tocca/clicca una cella per entrare. Al passaggio del
  puntatore la cella si scalda leggermente (velatura luce +8%, 400 ms) e mostra
  sotto il nome il "da 132 € a notte". Nessun cursore custom.
- **Dentro una stanza**: si esce con **"Torna al palazzo"** (bottone fisso in
  basso a sinistra su desktop, in alto a destra sotto 640 px per non
  sovrapporsi al `ConceptBackButton` del sito), con **Esc**, con il tasto
  indietro del browser, o con lo swipe verso il basso su mobile.
- **Tra stanze senza uscire**: dentro una stanza, due porte laterali ("stanza
  accanto" ← →) portano alla cella vicina dello stesso piano con un piccolo
  carrello laterale della camera; ai pianerottoli si prende la scala (↑ ↓): la
  telecamera sale o scende lungo la colonna della scala. Così il palazzo si
  percorre come un palazzo.
- **Il `ConceptBackButton`** del sito (torna al Concept Lab) resta sempre nella
  sua posizione standard (in alto a sinistra su desktop, in basso a sinistra
  sotto 640 px); il nome dell'albergo sta in alto al centro, il bottone "Scegli
  le lune" in alto a destra. Tre elementi fissi, nient'altro.

**Come funziona a 375 px** (dettagli in 10)
- I piani si **impilano in verticale**: il palazzo diventa una torre stretta
  che si scorre, dall'alto (cielo, luna, tetto) al basso (portico, strada). Ogni
  camera occupa tutta la larghezza, alta circa 56% della larghezza (una scatola
  profonda vista di fronte). La scala diventa un binario sottile a destra che
  indica a che piano sei.
- Entrare in una stanza riempie lo schermo con la foto in 3:4.

---

## 6. Interazione firma: entrare nelle stanze

### 6.1 La scatola di una stanza (CSS 3D)

- Ogni cella è un contenitore con `perspective` proprio (≈ 900 px su desktop,
  ≈ 600 px su mobile) e `perspective-origin` al centro della cella.
- Dentro, una scatola con `transform-style: preserve-3d` e cinque piani:
  - **fondo**: la foto vera (`<img>` con `object-fit: cover` e
    `object-position` specifico per ogni foto), a `translateZ(-profondità)`;
  - **pavimento** e **soffitto**: piani ruotati di 90° su X; pavimento del
    colore dominante della foto (campionato a mano e scritto nei dati della
    stanza: cotto, legno di noce, terrazzo), soffitto intonaco chiaro con travi
    (strisce di scatole sottili) nelle camere del sottotetto e del piano nobile;
  - **pareti laterali**: piani ruotati di 90° su Y, intonaco in ombra.
  - Il fronte è aperto; sopra, i bordi del poché (muri e solai tagliati).
- La luce accesa è un secondo livello sopra la foto: un `radial-gradient` caldo
  (luce `#F2C77C` a bassa opacità, modalità `soft-light` o `overlay`) che
  scalda il fondo e un alone sul pavimento. La stanza spenta ha la foto
  desaturata e scurita (`filter: brightness(.38) saturate(.6)`) e un velo notte
  profonda. **Il passaggio acceso/spento è sempre una dissolvenza di 900-1400
  ms**, mai istantanea (vedi 6.4).
- Profondità delle scatole: circa 0,7 volte l'altezza della cella; così la foto
  di fondo occupa circa il 55-60% della cella vista dall'esterno e si capisce
  che cos'è anche da lontano.

### 6.2 Entrare (la telecamera)

- Tecnica: **FLIP sul contenitore del palazzo**. Si misura il rettangolo della
  cella; si calcola scala e traslazione che portano la **parete di fondo** a
  coprire la finestra; si anima il contenitore del palazzo con `transform`
  (`translate3d` + `scale`) e contemporaneamente la parete di fondo della cella
  scelta con `translateZ` verso 0, mentre pavimento, soffitto e pareti escono
  dai bordi dell'inquadratura. Il risultato visivo è camminare dentro, non uno
  zoom piatto.
- Durata **1100 ms** in entrata, easing personalizzato a frenata lunga
  (`cubic-bezier(.22,.7,.18,1)`), niente rimbalzo. Le celle vicine restano
  visibili ai bordi durante il viaggio e poi escono.
- All'arrivo compare il **pannello della stanza** (desktop: in basso a destra,
  su notte al 92%, largo 360 px; mobile: foglio dal basso a mezza altezza,
  trascinabile). Contenuto: nome in Marcellus, due righe di carattere ("sotto le
  travi di noce, guarda il campanile di San Marco"), metratura, letto, bagno,
  piano e scale (La Corte: "nessun gradino"), prezzo da, e il bottone primario
  **"Le mie notti qui"** che apre il nastro delle lune già filtrato su questa
  stanza.
- Una seconda foto opzionale per stanza (il bagno o la finestra): si vede
  spostando lo sguardo (frecce ← → dentro al pannello "guarda la finestra");
  cambia la parete di fondo con dissolvenza incrociata di 600 ms. Mai carosello
  automatico.

### 6.3 Uscire (all'indietro)

- Il movimento inverso esatto, **800 ms**, stessa curva: la parete di fondo
  arretra, pareti e soffitto rientrano, il palazzo torna intero. Il fuoco della
  tastiera torna sulla cella da cui si era entrati.
- Uscire all'indietro è anche il tasto indietro del browser (l'hash cambia).

### 6.4 L'accensione e lo spegnimento delle luci

- All'apertura del sito: il palazzo appare **già visibile ma spento** (foto
  scurite), la luna di stasera è già in cielo, e le stanze si accendono una
  dopo l'altra: intervallo **450 ms**, ognuna in **1400 ms** di dissolvenza,
  ordine non meccanico (prima l'androne, poi Il Camino, La Loggia, La Corte, Il
  Noce, Sul Noncello, La Soffitta, Il Campanile, la colazione). Massimo ~2 cambi
  al secondo. Si fa **una volta per sessione** (`sessionStorage` con try/catch);
  al ritorno le luci sono già accese.
- Quando si scelgono le notti, le stanze occupate **si spengono lentamente**
  (1200 ms, sfalsate di 120 ms) e restano visibili al buio, con la scritta
  "occupata" sotto il nome; le libere restano accese. Nessun lampeggio, nessuno
  "sfarfallio da neon".

### 6.5 Tastiera

- La sezione è una **griglia navigabile** (`role="grid"` non serve: si usa una
  lista di bottoni in ordine logico piano per piano, dall'alto) con indice
  mobile (`roving tabindex`): un solo Tab entra nel palazzo, **frecce** si muovono
  tra le celle come nello spazio (← → sullo stesso piano, ↑ ↓ tra piani, con la
  scala come passaggio), **Invio/Spazio** entra, **Esc** esce, **Home/Fine**
  prima e ultima stanza.
- Dentro la stanza il fuoco va al titolo della stanza (`tabindex="-1"`),
  l'ordine è: pannello, "Le mie notti qui", porte laterali, "Torna al palazzo".
- Ogni cella ha etichetta completa: "Il Campanile, sottotetto, camera doppia,
  da 128 euro a notte, libera per le notti scelte".
- Focus visibile: contorno di 2 px luce con 3 px di distanza, mai rimosso.

### 6.6 Reduced motion

Con `prefers-reduced-motion: reduce`:
- Niente viaggio della telecamera: entrare è una **dissolvenza incrociata di
  250 ms** tra il palazzo e la stanza già inquadrata (stessa composizione
  finale, stessa scatola 3D ferma); uscire uguale.
- Luci: tutte accese subito all'apertura; accese/spente sulle notti con
  dissolvenza di 250 ms.
- Niente parallasse del tetto, niente carrello tra stanze vicine.
- Nastro delle lune: nessuna inerzia nello scorrimento.
Il sito resta completo: nessuna informazione dipende da un movimento.

---

## 7. Meccanica unica di prenotazione: "Scegli le lune"

### 7.1 L'idea

Le notti non sono una griglia di calendario: sono un **nastro di lune**, una per
notte, con la **fase vera** di quella sera. Trascini sulle lune delle notti che
vuoi; nella sezione restano accese le stanze libere per tutte quelle notti; tocchi
la tua, entri, e indichi **l'ora d'arrivo** (la reception chiude alle 21). Dopo
l'invio non compare nessuna cartolina, ricevuta o scontrino: resta accesa solo la
tua stanza, e sul tetto sale la luna della tua prima notte.

### 7.2 Il nastro

- **Desktop**: il nastro corre in orizzontale **nel cielo sopra il tetto**, a
  tutta larghezza, e scorre di lato (rotella orizzontale, trascinamento dello
  spazio vuoto, frecce ai lati). Le lune sono dischi di 34 px con 10 px di
  spazio; sotto ogni luna il giorno (Commissioner 13 px, luna spenta) e
  l'iniziale del giorno della settimana; al primo di ogni mese il nome del mese in
  Marcellus sopra la fila. Il venerdì e il sabato hanno un puntino sotto (sono
  le notti che si esauriscono prima).
- **Mobile**: il nastro sta in un **foglio dal basso** color notte (una fetta di
  cielo sotto il pollice), alto ~30% dello schermo; sopra, il palazzo resta
  visibile in piccolo (scala ridotta a vista intera dei tre piani, non la torre
  che scorre) così si vedono le luci cambiare. Lune di 40 px, area di tocco 44 px.
- **Orizzonte**: da stasera a **+240 notti** (circa otto lune piene). Le notti
  passate non esistono sul nastro. Chiusura di esempio 7-28 gennaio: le lune
  di quelle notti sono velate e marcate "chiuso".

### 7.3 Il gesto

- **Trascinare** da una luna all'altra seleziona le notti (la prima luna =
  notte di arrivo, l'ultima = ultima notte; la partenza è la mattina dopo).
  Durante il trascinamento le lune selezionate prendono un alone luce e una
  base di luce sotto (non un riempimento a pillola del calendario classico);
  il nastro scorre da solo quando il dito arriva al bordo.
- In alternativa **tocco + tocco**: prima luna, poi ultima.
- Mentre si seleziona, la sezione si aggiorna **dal vivo** con le luci (con la
  regola dei 2-3 cambi al secondo: gli aggiornamenti delle luci sono raggruppati
  e partono al più ogni 400 ms durante il trascinamento).
- Una riga di testo sotto il nastro dice sempre lo stato in parole: "Dal giovedì
  15 al sabato 17 ottobre, 3 notti. Libere: Il Camino, La Corte, Il Noce, La
  Soffitta." Questo è anche il testo annunciato ai lettori di schermo
  (`aria-live="polite"`).
- Limiti: minimo 1 notte (2 se la selezione include un sabato di agosto, regola
  di esempio), massimo 14.
- **Se si parte da dentro una stanza** ("Le mie notti qui"): il nastro mostra
  sotto ogni luna un segno di disponibilità **di quella stanza** (luna piena di
  luce = libera, luna spenta = occupata) e la selezione non può attraversare una
  notte occupata.

### 7.4 Le fasi lunari vere: algoritmo (vincolante per chi costruisce)

Obiettivo: per ogni notte, la fase della luna **alle 21:00 ora di Pordenone**
(`Europe/Rome`, con ora legale), l'età in giorni, la frazione illuminata e se è
crescente o calante; più l'indicazione esatta delle quattro fasi principali
(nuova, primo quarto, piena, ultimo quarto) sulla notte giusta.

**Passo 1. Tempi delle fasi principali (Meeus, "Astronomical Algorithms", cap.
49).** Per ogni lunazione `k` (intero per luna nuova, +0,25 primo quarto, +0,5
piena, +0,75 ultimo quarto), con `k ≈ (anno − 2000) × 12,3685`:
- `T = k / 1236,85`
- `JDE = 2451550,09766 + 29,530588861·k + 0,00015437·T² − 0,000000150·T³ + 0,00000000073·T⁴`
- anomalia media del Sole `M = 2,5534 + 29,10535670·k − 0,0000014·T² − 0,00000011·T³`
- anomalia media della Luna `M′ = 201,5643 + 385,81693528·k + 0,0107582·T² + 0,00001238·T³ − 0,000000058·T⁴`
- argomento di latitudine `F = 160,7108 + 390,67050284·k − 0,0016118·T² − 0,00000227·T³ + 0,000000011·T⁴`
- longitudine del nodo `Ω = 124,7746 − 1,56375588·k + 0,0020672·T² + 0,00000215·T³`
- eccentricità `E = 1 − 0,002516·T − 0,0000074·T²`
- correzioni periodiche: si applicano **almeno i primi 8 termini** della
  tabella del cap. 49 per nuova e piena (es. per la nuova `−0,40720·sin M′ +
  0,17241·E·sin M + 0,01608·sin 2M′ + 0,01039·sin 2F + 0,00739·E·sin(M′−M) −
  0,00514·E·sin(M′+M) + 0,00208·E²·sin 2M − 0,00111·sin(M′−2F)`; per la piena i
  coefficienti corrispondenti della stessa tabella) e i termini principali per i
  quarti, più la correzione `W` dei quarti. Con 8 termini l'errore è di pochi
  minuti, più che sufficiente.
- Il risultato è in Tempo Dinamico: si sottrae ΔT ≈ 69 s (valore costante per
  2026-2027, documentato nel codice) per ottenere UTC.
- Si converte il JDE in data UTC e poi in data e ora di `Europe/Rome` con
  `Intl.DateTimeFormat` (mai con offset scritti a mano).

**Passo 2. Età e frazione per ogni notte.** Per la notte `d` si prende l'istante
`t = d alle 21:00 Europe/Rome`. Si trovano le due lune nuove calcolate al passo 1
che racchiudono `t` (`N₀ ≤ t < N₁`):
- età `a = (t − N₀)` in giorni; lunazione vera `L = N₁ − N₀` (varia tra 29,3 e
  29,8 giorni: si usa quella vera, non la media);
- fase normalizzata `p = a / L` (0 = nuova, 0,5 = piena);
- per coerenza con le fasi principali si interpola a tratti: `p` è 0 a `N₀`,
  0,25 al primo quarto, 0,5 alla piena, 0,75 all'ultimo quarto, 1 a `N₁`
  (interpolazione lineare tra i quattro istanti calcolati), così una luna piena
  vera cade esattamente su `p = 0,5`;
- frazione illuminata `f = (1 − cos(2π·p)) / 2`;
- crescente se `p < 0,5`, calante altrimenti.

**Passo 3. Etichetta della notte.** La notte `d` porta il nome di una fase
principale se l'istante di quella fase cade tra le 12:00 di `d` e le 11:59 del
giorno dopo (ora di Roma): cioè "la luna piena è in quella notte". Altrimenti
porta la fase generica: "luna nuova" (f < 0,03), "falce crescente/calante",
"primo/ultimo quarto" (solo per l'etichetta esatta), "gibbosa
crescente/calante", "luna piena" (f > 0,97), più la percentuale ("illuminata al
42%").

**Passo 4. Disegno della luna** (CSS o SVG generato, non disegnato a mano):
- disco di fondo in luna spenta `#9AA0B4` al 22% (la parte in ombra si intravede,
  come la luce cinerea), disco illuminato in luna `#F2E8D0`;
- il terminatore è un'ellisse di semiasse orizzontale `r·|cos(2π·p)|`: la parte
  illuminata è metà disco + o − mezza ellisse (gibbosa se `f > 0,5`, falce se
  `f < 0,5`);
- dall'emisfero nord la parte illuminata è **a destra** quando la luna cresce e
  **a sinistra** quando cala;
- si genera un solo `path` SVG per luna (due archi: il bordo del disco e
  l'ellisse del terminatore); 240 lune = 240 path, calcolati una volta
  (`useMemo`) e mai animati tutti insieme.

**Passo 5. Controlli di prova** (casi di test obbligatori, ora UTC delle fasi
note; i builder li mettono in un test):
- luna nuova 17 febbraio 2026 ~12:01 UTC (eclisse anulare di Sole);
- luna piena 3 marzo 2026 ~11:38 UTC (eclisse totale di Luna);
- luna nuova 12 agosto 2026 ~17:37 UTC (eclisse totale di Sole);
- luna piena 28 agosto 2026 ~04:18 UTC (eclisse parziale di Luna).
Tolleranza ammessa: ±15 minuti sull'istante, e la notte etichettata deve essere
quella giusta. Nota: la sola formula media (età = giorni dal 6 gennaio 2000
18:14 UTC modulo 29,530588853) sbaglia fino a ~0,6 giorni (verificato: dà
14,3 giorni di età per la piena del 3 marzo 2026) e quindi **non basta** per
etichettare le notti di luna piena o nuova: si usa solo come stima iniziale di `k`.

**Dove si calcola**: in una funzione pura senza accesso a `window` (il sito fa
prerender), chiamata nel client dopo il montaggio; il nastro nel prerender
mostra la struttura vuota (dischi in luna spenta) e le fasi appaiono al primo
rendering, in dissolvenza di 300 ms.

### 7.5 La scelta della stanza e l'ora d'arrivo

- Con le notti scelte, si tocca una stanza **accesa** e si entra (stessa
  interazione firma). Il pannello della stanza diventa il pannello di
  prenotazione:
  - le notti in parole e il **prezzo totale** calcolato (prezzo per notte di
    esempio per stanza, 112-178 €, venerdì e sabato +15%, colazione inclusa,
    tassa di soggiorno di esempio a parte e detta in chiaro);
  - **quanti siete**: 1 o 2 (Il Camino e La Corte anche 3: letto aggiunto);
  - **ora d'arrivo**: una fila di orari reali dalle 14:00 alle 21:00 a
    mezz'ore, disegnati come le finestre di un piano che si accendono (tocchi
    un'ora, quella finestra resta accesa). La fila finisce alle 21:00 con la
    riga "Dopo le 21 la reception è chiusa: se arrivi più tardi, chiamaci e ti
    lasciamo le istruzioni per entrare." con il telefono di esempio. Non si
    inventa un arrivo notturno automatico;
  - **nome** e **email o telefono** (etichetta sopra il campo, errore sotto,
    nessun placeholder usato come etichetta), un campo facoltativo "Una cosa che
    dobbiamo sapere" (allergie, cane piccolo, culla).
  - Bottone primario: **"Tienimi la stanza"** (testo notte su luce).
- Si può toccare anche una stanza spenta: si entra lo stesso (per vederla), ma
  il pannello dice "Occupata il 16 ottobre" e propone le notti vicine in cui è
  libera ("Libera dal 19 al 21: usa queste lune").

### 7.6 Disponibilità (dati di esempio)

- Nessun backend: la disponibilità è **generata in modo deterministico** da una
  funzione con seme (hash di `slug stanza + data`), stabile tra un caricamento e
  l'altro, con occupazione più alta nei fine settimana (~70%) che in settimana
  (~35%) e qualche blocco di più notti (soggiorni lunghi), così il nastro e la
  sezione sembrano un albergo vero. Documentata come dato di esempio.
- L'invio è simulato (700-1200 ms), con `track("demo_prenotazione")` all'invio
  riuscito; `track("apri_concept")` all'apertura. Nessun altro evento.

### 7.7 Stati (tutti obbligatori)

| Stato | Cosa si vede |
|---|---|
| **Vuoto** (nessuna notte scelta) | Tutte le stanze accese normalmente (l'albergo "vivo"). Sul nastro la luna di stasera ha un anello sottile di luce e la scritta "stasera"; sotto il nastro: "Trascina sulle lune delle notti che vuoi." Mai un nastro bianco o senza fasi. |
| **Notti scelte, stanze libere** | Libere accese, occupate spente in dissolvenza con "occupata" sotto il nome; riga di stato con l'elenco delle libere e il prezzo da. |
| **Nessuna stanza libera** | Il palazzo è tutto spento tranne l'androne (la reception resta accesa: c'è qualcuno). Messaggio sotto il nastro: "Per queste notti siamo pieni." e **le due proposte più vicine** calcolate davvero ("Dal 22 al 24 ottobre si liberano Il Noce e La Corte"), toccabili: spostano la selezione. |
| **Errore di selezione** | Più di 14 notti, notti di chiusura, minimo notti non rispettato: la selezione si ferma all'ultima notte valida e la riga di stato dice perché, in parole ("Da noi al massimo 14 notti: per soggiorni più lunghi scrivici."). Nessun colore rosso. |
| **Errore nel pannello** | Campo contatto non valido o ora d'arrivo mancante: messaggio sotto il campo, fuoco sul primo campo sbagliato, riepilogo in `aria-live`. |
| **Invio in corso** | Il bottone dice "Ti teniamo la stanza…" e resta premuto; la stanza resta accesa; nessuno spinner. |
| **Invio fallito** | "Non è partito. Riprova, oppure chiamaci al …" con il numero di esempio; i dati restano nei campi. |
| **Successo** | Si esce da soli dalla stanza (movimento all'indietro); nel palazzo **si spengono tutte le altre luci** in dissolvenza lenta e resta accesa solo la tua stanza; sopra il tetto la luna di stasera lascia il posto alla **luna della tua prima notte** (dissolvenza, 1200 ms). Una frase sola, su notte: "Ti aspettiamo giovedì 15 ottobre verso le 19:30. Quella sera la luna è crescente, illuminata al 42%. Ti scriviamo entro stasera per confermare." Più "Aggiungi al calendario" (file .ics scaricato) e "Torna al palazzo" (riaccende le luci). Nessuna cartolina, ricevuta, scontrino, chiave o busta. |

---

## 8. Fotografie

### 8.1 Cosa serve

- **7 foto principali**, una per camera, orizzontali (almeno 1600 px di lato
  lungo), da usare come parete di fondo: su desktop si ritagliano circa 4:3, su
  mobile circa 3:4 (quindi il soggetto deve reggere entrambi i tagli: letto
  centrato o leggermente decentrato, niente elementi importanti ai bordi).
- **Fino a 7 foto secondarie** (bagno, finestra, dettaglio): facoltative, una
  per stanza solo se coerente.
- **1 foto colazione** (tavola con pane, marmellate, caffè: niente persone in
  primo piano).
- **Nessuna foto** per androne (intonaco e iscrizione) e portico (se non si
  trova una foto vera credibile di un portico urbano del Nord-Est: altrimenti
  testo + link Maps).

### 8.2 Coerenza (le sette camere devono sembrare lo stesso albergo)

Criteri di scelta, da verificare foto per foto con Read:
- **Palazzo storico italiano o europeo**: travi a vista, pareti di intonaco,
  pavimenti di cotto, legno o terrazzo, finestre alte. Niente camere
  "minimal scandinavo" con pareti bianche lisce, niente moquette, niente TV a
  parete in primo piano, niente vista mare, niente palme, niente grattacieli
  dalla finestra.
- **Luce calda di sera o luce naturale morbida**: lampade accese preferite.
  Niente foto a flash o a luce fredda d'ufficio.
- **Stessa famiglia di materiali e toni**: terre, legno, lino bianco, qualche
  colore profondo (verde bosco o blu su una parete va bene in **una** stanza sola,
  non come dominante del sito).
- **Letti fatti**, nessuna persona, nessun logo, nessun cartello leggibile.
- **Ogni stanza deve essere riconoscibilmente diversa** dalle altre (è il
  punto del concept): la foto de Il Camino deve avere un camino, La Soffitta
  il soffitto inclinato, Il Noce il legno, Sul Noncello una finestra
  protagonista, La Loggia un'apertura ad arco o un balcone, La Corte una porta
  finestra su un cortile o comunque luce dal basso, Il Campanile una finestra
  alta. Se una foto giusta per quel carattere non si trova, **si cambia il
  nome della stanza per adattarlo alla foto vera** (il copywriter viene
  avvisato), non il contrario.
- **Trattamento unico**: tutte ritoccate allo stesso modo in fase di export
  (bilanciamento leggermente caldo, ombre sollevate di poco, stessa nitidezza),
  in WebP 1600 e 900 px, qualità ~70. Nessun filtro CSS "vintage". La
  differenza acceso/spento la fa il livello di luce CSS, non l'export.

### 8.3 Fonti e procedura

- Unsplash (rete aperta secondo `docs/lab-operativo.md`): ricerche utili
  "boutique hotel room italy", "beamed ceiling bedroom", "attic bedroom
  wooden beams", "fireplace bedroom", "terracotta floor bedroom", "palazzo
  hotel room", "arched window bedroom". Scaricare con `?w=1600&q=70&fm=webp`,
  guardarle **una per una con Read**, salvarle negli asset del concept,
  annotare autore e URL nel doc di chi le sceglie. Mai un 404.

### 8.4 Piano B

1. Se Unsplash non basta per 7 coerenti: Pexels (licenza libera), stessi
   criteri, stesso trattamento.
2. Se ancora non si arriva a 7 coerenti: meglio **meno varietà ma vera**:
   si usano 5-6 foto diverse e per 1-2 stanze la parete di fondo mostra una
   foto di dettaglio vera coerente (la finestra con la tenda, il lavabo di
   pietra, la testiera) con la descrizione della stanza nel pannello. Mai la
   stessa foto su due stanze.
3. Se una foto non è giusta nel soggetto, **nessuna foto**: la parete di fondo
   resta intonaco in luce calda con il nome della stanza in Marcellus inciso e
   le sue caratteristiche in Commissioner. Deve essere bella anche così.
4. **Niente immagini generate** di camere né rendering 3D di interni: il
   visitatore sta scegliendo un posto vero dove dormire, una camera finta è
   una promessa falsa. Niente illustrazioni disegnate di stanze.

---

## 9. Accessibilità

- **Fonte di verità è il DOM**: ogni cella è un `<button>` (o un link con
  hash) con nome completo; la scatola 3D è decorativa (`aria-hidden` sulle
  pareti), la foto ha un `alt` che descrive la stanza vera ("Camera con letto
  matrimoniale sotto travi di legno scuro e finestra alta").
- **Vista elenco "Le stanze in elenco"** (`#/elenco`), raggiungibile dal primo
  link saltabile ("Vai alle stanze in elenco") e dall'intestazione: le sette
  camere in una lista semplice con nome, piano, scale sì/no, letto, prezzo da,
  foto piccola, e il link per entrare. Con notti scelte, l'elenco mostra
  libera/occupata. È anche la vista per chi non vuole esplorare.
- **Alternativa al trascinamento del nastro**: tastiera (↔ sposta la luna
  attiva, **Maiusc+↔** allarga la selezione, Invio/Spazio fissa inizio e fine,
  Pag↑/Pag↓ mese precedente/successivo, Home "stasera"), tocco + tocco, e due
  campi data nativi ("Arrivo" e "Partenza") in un piccolo pannello "Scrivi le
  date" per chi preferisce. Le tre vie producono lo stesso stato.
- **Ogni luna** è un'opzione (`role="option"` in un `listbox` con
  `aria-multiselectable`) con etichetta: "Giovedì 15 ottobre, luna crescente
  illuminata al 42%, 4 stanze libere".
- **Libera/occupata non è solo luce**: la parola "occupata" compare sotto il nome
  delle stanze spente, e il contrasto del nome resta AA anche al buio (nome in
  luna su poché/notte, mai sopra la foto senza velo).
- Contrasti AA verificati (vedi 5.1); testo corrente mai su intonaco.
- Focus visibile su tutto; `Esc` chiude pannelli e stanze; fuoco gestito in
  entrata e in uscita (6.5); nessuna trappola di fuoco nel foglio mobile.
- Niente lampeggi (6.4); reduced motion completo (6.6).
- Lingua `it`, date e prezzi formattati con `Intl` in italiano.
- Aree di tocco ≥ 44 px (lune, orari, porte tra stanze).

---

## 10. Mobile 375 px (pensato, non schiacciato)

- **Apertura**: cielo in alto con la luna di stasera e il nome IMBRUNIRE in
  Marcellus; sotto, il tetto e i comignoli. La prima schermata mostra tetto +
  sottotetto: si capisce subito che è un palazzo e che si scende.
- **Torre**: piani impilati, una camera per riga a tutta larghezza meno 16 px
  per lato (il muro di poché fa da margine, spesso 16 px: è il muro vero),
  scatole profonde con prospettiva più corta (600 px). Solai tra un piano e
  l'altro spessi 20 px di poché con il nome del piano in piccolo ("piano
  nobile"). Il portico in fondo, aperto sulla strada, chiude la pagina con "A
  piedi da qui" e "Apri in Maps".
- **La scala**: binario verticale di 6 px a destra con tre tacche (i piani);
  toccando una tacca si scorre a quel piano. Indica sempre dove sei.
- **Scorrimento**: qui la pagina scorre in verticale (nativo, niente Lenis):
  è il modo naturale di scendere una torre col pollice.
- **Entrare**: la stanza riempie lo schermo in 3:4 (foto con `object-position`
  per il taglio verticale); il pannello è un foglio dal basso a mezza altezza,
  trascinabile a tutta altezza; "Torna al palazzo" in alto a destra, il
  `ConceptBackButton` resta in basso a sinistra come da integrazione del sito
  (il foglio lascia libero l'angolo o lo sovrasta con un margine: verificato dal
  responsive-tester).
- **Le lune**: bottone "Scegli le lune" fisso in alto a destra e, dopo il primo
  scroll, anche come barretta in basso; apre il foglio del nastro (7.2) con il
  palazzo **ridotto a vista intera** sopra, così si vedono tutte le luci
  cambiare insieme.
- Ogni schermata a 375 px ha la sua composizione: nessun elemento tagliato dal
  bordo, nessun testo sopra la foto senza velo, nessuna riga oltre 42 caratteri.

---

## 11. Cosa NON fare

**Dalla ricetta bocciata e dal vecchio SETTE CHIAVI**
- Niente chiavi, ganci, bacheche, portachiavi, numeri di stanza su legno,
  targhette d'ottone; niente "prendi una chiave" come bottone.
- Niente verde bottiglia, niente oro, niente crema come fondo.
- Niente prima schermata con testo a sinistra e foto incorniciata a destra;
  niente "TAV. I", niente didascalie poetiche sotto la foto.
- Niente riga di numeri tra due filetti ("sette / dal 1748 / 5 / dalle 7:30"),
  niente "dal 1923" come occhiello, niente occhielli maiuscoletto spaziato.
- Niente sezioni numerate "01 ·", niente schede bianche con bordino e ombra,
  niente bento, niente tre colonne uguali.
- Niente fade-up allo scroll; niente onde, filetti o divisori decorativi.
- Niente mappa disegnata a mano; niente figure umane disegnate (nemmeno sagome
  nelle finestre, nemmeno un portiere stilizzato).
- La prenotazione non è a passi numerati e non finisce in cartolina,
  scontrino, ricevuta, busta, biglietto o chiave consegnata.

**Specifici di IMBRUNIRE**
- **Niente cielo sfumato in viola**, niente tramonto arancio-rosa, niente
  stelle scintillanti, niente stelle cadenti. Il cielo è notte ferma; l'unico
  astro è la luna, con la fase vera.
- **Niente finestre che si accendono di colpo**: ogni cambio di luce è una
  dissolvenza lenta (≥ 900 ms), mai più di 2-3 cambi al secondo in tutta la
  sezione; niente tremolio "da candela", niente luci che pulsano.
- Niente facciata disegnata, niente mattoni, cornici, persiane o balconi
  illustrati in SVG: il palazzo è fatto di **scatole CSS semplici** (celle,
  poché, gradini, tetto con `clip-path`), la ricchezza sta nelle foto dentro.
- Niente WebGL, niente modelli 3D, niente orbita del palazzo.
- Niente lune disegnate a mano o immagini di lune fotografiche: la luna è
  **calcolata e generata** (7.4). Niente fasi finte o ripetute a caso.
- Niente griglia di calendario mensile (7×5) da nessuna parte, nemmeno come
  alternativa: l'alternativa sono i due campi data nativi.
- Il sito **non cambia con l'ora reale** (è sempre imbrunire): unica cosa
  "vera" legata a oggi è la luna di stasera.
- Niente cursore custom, niente testo magnetico, niente "Scorri".
- Niente carosello automatico di foto dentro le stanze.
- Niente stelle di recensioni, "punteggio 9,4", loghi di portali di
  prenotazione, contatori finti ("1.240 ospiti felici").
- Niente Marcellus in corsivo o con parola colorata dentro un titolo; niente
  sottotitolo sans attaccato sotto un titolo serif come coppia fissa.
- Niente trattini lunghi (né `—` né `–`) in nessun testo visibile.
- Un solo intento primario: "Scegli le lune" per prenotare (intestazione,
  pannello stanza come "Le mie notti qui" che apre lo stesso nastro). Nessun
  secondo bottone "Prenota" diverso.

---

## 12. Note per le ondate successive

- **tech-architect**: nessun WebGL (three non serve); CSS 3D con
  `transform-style: preserve-3d`, `will-change: transform` solo durante i
  viaggi della telecamera; stato in React + hash router interno al concept
  (senza cambiare la rotta `/concept-20`); il calcolo lunare in un modulo puro
  testabile (`luna.ts`) con i quattro casi di prova di 7.4; disponibilità in un
  modulo puro con seme; nessun accesso a `window` a livello di modulo. Foto con
  `srcset` (900/1600) e `loading="lazy"` tranne le tre del sottotetto visibili
  subito. Porte 9200-9219.
- **ux-architect**: pianta delle celle di 2 come base; sequenza "vuoto → notti
  → stanza → pannello → successo" e tutti gli stati di 7.7; vista elenco.
- **art-director**: poché, spessori, proporzioni delle celle, travi, luce
  calda; token dalla tabella 5.1; la luna generata.
- **motion-designer**: i soli eventi di movimento sono: accensione iniziale,
  luci su/giù, entrata/uscita, carrello tra stanze vicine, scala, nastro,
  luna del successo, parallasse ≤ 2° del tetto. Nient'altro si muove.
- **copywriter**: italiano da albergo di famiglia di Pordenone, frasi brevi,
  concrete (metri quadri, letti, scale, orari, minuti a piedi, prezzi di
  esempio verosimili); nomi delle stanze da confermare dopo la scelta delle foto;
  nessun dato legale, recapiti di esempio.
- **trend-researcher**: siti di piccoli alberghi e case d'autore con
  navigazione spaziale, sezioni architettoniche interattive, calendari non a
  griglia; estrarre principi, non copiare. Evitare i riferimenti "dollhouse"
  illustrati/isometrici da Dribbble.
