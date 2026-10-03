# Motion designer · Concept 13 · CONTROPELO

Ondata 2. Documento vincolante per chi muove qualcosa nel concept: scaffold,
section-builder (parete, vetro, lista, mensola, informazioni, vapore),
interaction-designer. Qui ci sono le curve, i tempi, la coreografia per
schermata, il modello del vapore che torna, le classi di movimento condivise
e i contratti che lo scaffold deve rispettare perché i miei file compilino.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, riga e paragrafo 13 di
`docs/matrice-concept-11-20.md` (più regole comuni), i doc dell'ondata 1
(`creative-director.md`, `trend-researcher.md` con `taste/rain-on-glass.md`,
`brand-strategist.md`, `ux-architect.md`, `tech-architect.md`), i file già
scritti in parallelo da art-director (`styles/tokens.css`, `tokens.ts`,
`materia.css`), interaction-designer (`interaction/*`, doc) e vector-artist
(`assets/svg/tratti.ts`, `Icona.tsx`). Il pilota `concepts/10-torchio`
(motion-designer, `easing.ts`, `ticker.ts`) solo come formato.

File miei (in `src/pages/concepts/contropelo/motion/`):

| File | Contenuto |
|---|---|
| `easing.ts` | utilità numeriche, `cubicBezier`, `inversa`, le 12 curve (`BEZIER`, funzioni TS, `BEZIER_CSS`, `CURVE`) |
| `tempi.ts` | `TEMPI` (tutte le durate e soglie), `tempiEffettivi(ridotto)`, `durataScrittura`, `passoRiga`, `durataRiscrittura`, `APERTURA`, `INIZIO_PASSATA`, `RITORNO` + modello del vapore che torna (`nebbiaNelTempo`, `etaPerNebbia`, `vaporeInAlzata`, `tempoRecuperato`, `costruisciTabelleNebbia`), `GOCCE` + `parametriGoccia` |
| `motion.css` | variabili `--ctp-ease-*`, `--ctp-dur-*` su `.ctp-root`, varianti `[data-motion="reduced"]`, `@keyframes` e classi di movimento condivise `ctp-mov-*` |
| `apertura.ts` | `avviaApertura(opzioni)`: vapore che sale + passata automatica + suggerimento, via API del vapore |
| `useStraccio.ts` | `useStraccio(righe, onFine?)` (lista e facce che si cancellano e si riscrivono) e `useRaccolta(ref, aperta)` (righe lontane che si raccolgono, FLIP) |

Verifiche fatte (2026-10-03):
- `tsc` strict + `noUncheckedIndexedAccess` + `noUnused*` ed ESLint 9 con le
  regole del progetto su tutti e cinque i file, contro stub costruiti sui
  contratti del §7: zero errori, zero avvisi.
- Numeri: tutte le 12 curve monotone e dentro 0..1 (nessun rimbalzo);
  `nebbiaNelTempo` monotona per ogni nucleazione; `etaPerNebbia` inversa
  esatta (errore 8,5e-13); `tempoRecuperato` crescente e uguale all'ora vera
  a fine recupero; riscrittura di 9 righe 740 ms, di 18 righe 1100 ms (passo
  49 ms); tabelle del vapore 34 KB.
- A schermo (Chromium, pagina di prova con le classi vere, animazioni
  campionate con `document.getAnimations()`): straccio a 200 e 400 ms, righe
  che si riscrivono con sfasamento 0/60/120/180/240 ms, nome che si scrive,
  tratto turchese con ritardo 80 ms; con `data-motion="reduced"` solo
  dissolvenze da 100 ms. Trovato e corretto: il cappuccio tondo del tratto
  lasciava un puntino turchese a tratto vuoto (ora l'opacità sale nel primo
  6%).
- **Trovato un problema serio nel piano del vapore** (§4.4): con il ritorno
  fatto a `destination-out` per frame, come proposto nel tech-architect
  §7.3, la maschera a 8 bit si blocca a metà e il vapore non torna mai del
  tutto. Misurato in Chromium. Il modello a età del §4 lo evita.

---

## 0. Decisioni in breve

1. **Il sito ha un solo movimento "da solo": il vapore che torna.** Tutto il
   resto lo causa l'utente (girare la testa, pulire, scrivere). Elenco chiuso
   del creative-director §13: vapore che sale, passata, vapore che torna,
   gocce, pan, straccio, scrittura, sottolineatura. Ho aggiunto solo ciò che
   l'ux-architect ha chiesto (raccolta delle righe, tastiera, striscia,
   suggerimento) e lo tengo al minimo: opacità o transform, niente "entrate".
2. **Tre famiglie di gesti, tre curve madri.** La testa (`gira`), la mano del
   barbiere (`palmo`, `straccio`, `pennarello`, `sottolinea`), l'aria e
   l'acqua (`sale`, `condensa`, `goccia`). Nessuna curva esce da 0..1: su uno
   specchio niente rimbalza.
3. **Il vapore torna a età, non a opacità.** Ogni punto del vetro ricorda
   *quando* è stato pulito; il vapore che si vede è una funzione pura della
   sua età e della nucleazione del punto. Pausa di pulito 3,6-5,2 s, ritorno
   9,6-12,4 s, tutto coperto entro 17,6 s, a chiazze e poi uniforme
   (creative-director 14-18 s, trend-researcher P1). Monotono per costruzione.
4. **Niente GSAP, niente rAF propri.** Le comparse sono `@keyframes` CSS con
   `fill-mode: backwards` che partono da sole al montaggio o quando compare
   la classe (nessuno "stato di partenza" da togliere al frame dopo, che era
   fragile); le uscite sono transizioni. Il vapore anima nel ticker del
   motore (section-builder-vapore). `setTimeout` solo per rimandare fasi.
5. **Classi di movimento condivise `ctp-mov-*`** in `motion.css`: i builder
   mettono una classe, io possiedo tempi e curve. Nessun section-builder
   scrive durate o curve proprie: se ne serve una, la chiede a me.
6. **Reduced motion = stato finale subito**, con le sole dissolvenze decise
   dalla direzione: specchio 200 ms, straccio 100 + 100 ms, modi del vapore
   200 ms (fermo) / 1200 ms (vivo). Tutto il resto 0 ms (`tempiEffettivi`).

---

## 1. Principi

- **Chi lo muove?** Ogni movimento ha una causa nel salone: la testa, la
  mano, il vapore, l'acqua. Un movimento senza causa non esiste (niente
  fade-up, niente reveal di sezione, niente parallasse, niente hover che
  salta).
- **Il contenuto non aspetta.** A t = 0 il listino è leggibile (LCP nel DOM).
  Nessun testo nasce invisibile in attesa di un'animazione: senza le classi
  modificatrici tutto è fermo e visibile, anche nel prerender.
- **Niente lampi.** Nessuna animazione infinita, nessun cambio di luminosità
  ripetuto. Ogni cambio di una grande superficie è un evento unico; due
  stracci distano almeno 500 ms (ux 8.12, come `creaCadenza` dell'
  interaction-designer). Il vapore in un punto sale e basta.
- **Solo `transform`, `opacity`, `clip-path`, `stroke-dashoffset`.** Nessuna
  altezza animata (la raccolta usa FLIP). `will-change` solo sulla pista
  durante il pan, messo e tolto dal builder della parete.
- **La mano del barbiere ha un ritmo.** Scrivere è quasi costante con un
  appoggio iniziale; cancellare è un colpo deciso; sottolineare è uno scatto
  del polso che frena secco. Le tre curve sono diverse e si riconoscono.

---

## 2. Le curve (`easing.ts`)

Fonte unica: `BEZIER` in `easing.ts`; `motion.css` ripete gli stessi numeri.

| Nome | cubic-bezier | Valori a t = 0,25 / 0,5 / 0,75 | Uso |
|---|---|---|---|
| `gira` | 0.32, 0.04, 0.12, 1 | 0,41 / 0,83 / 0,97 | pan della parete (650 ms): la testa parte morbida e frena lunga |
| `palmo` | 0.45, 0.05, 0.3, 1 | 0,18 / 0,71 / 0,95 | passata automatica (700 ms): la mano accelera e rallenta |
| `straccio` | 0.5, 0.08, 0.3, 1 | 0,16 / 0,69 / 0,95 | straccio sulla lista e "cancella" (400 ms), striscia che rientra |
| `pennarello` | 0.3, 0.12, 0.45, 1 | 0,28 / 0,69 / 0,93 | righe che si riscrivono, nome, segni brevi |
| `sottolinea` | 0.55, 0.02, 0.2, 1 | 0,13 / 0,73 / 0,96 | tratto turchese sotto il nome (400 ms) |
| `sale` | 0.25, 0.2, 0.45, 1 | 0,35 / 0,73 / 0,94 | fronte del vapore che sale (2400 ms), applicata dentro `vaporeInAlzata` |
| `raccolta` | 0.22, 0.7, 0.26, 1 | 0,68 / 0,92 / 0,99 | FLIP delle righe (300 ms) |
| `tastiera` | 0.2, 0.8, 0.2, 1 | 0,77 / 0,95 / 0,99 | riga di scrittura che segue la tastiera (250 ms) |
| `striscia` | 0.22, 0.68, 0.3, 1 | 0,65 / 0,90 / 0,98 | riga di stato che esce da dietro la mensola (320 ms) |
| `lineare` | linear | | solo opacità |
| `condensa` | smootherstep | 0,10 / 0,50 / 0,90 | ritorno del vapore in un punto (velocità nulla agli estremi) |
| `goccia` | 1 − (1 − u)^1,7 | 0,39 / 0,69 / 0,91 | corsa di una goccia: parte col suo peso, si ferma |

Utilità esportate: `clamp`, `clamp01`, `lerp`, `inverseLerp`, `progressoTra`,
`smoothstep01`, `smootherstep01`, `inversa`, `cubicBezier`, `BEZIER_CSS`,
`CURVE`.

---

## 3. I tempi (`tempi.ts`)

Valori in ms. Colonna "ridotto" = `tempiEffettivi(true)`.

| Chiave | Pieno | Ridotto | Cosa |
|---|---|---|---|
| `pan` | 650 | 0 | pan tra specchi (curva `gira`) |
| `dissolviSpecchio` | 0 | 200 | dissolvenza tra specchi al posto del pan |
| `attivaSpecchio` | 600 | 600 | recupero del tempo passato quando torni su uno specchio |
| `modoFermo` | 900 | 200 | "Specchio pulito": il vapore sparisce |
| `modoVivo` | 2400 | 1200 | interruttore spento: il vapore risale dal basso (ridotto: dissolvenza uniforme) |
| `fuocoPulisce` | 300 | 300 | ovale pulito attorno all'elemento col fuoco |
| `zonaGrande` | 450 | 450 | lista in scrittura, pannello Informazioni (mai < 300 ms su grandi aree) |
| `alone` | 600 | 600 | il tuo nome dopo la prenotazione |
| `straccioVia` | 400 | 100 | lo straccio cancella |
| `straccioRiga` | 60 | 0 | sfasamento tra due righe |
| `rigaScrive` | 260 | 100 | una riga che si scrive |
| `riscritturaMassima` | 1100 | 100 | tetto della riscrittura (il sabato ha 18 righe → passo 49 ms) |
| `codaStracci` | 500 | 500 | minimo tra l'inizio di due stracci |
| `scrittura` | 600 | 0 | il tuo nome (fino a 6 lettere; +30 ms per lettera, tetto 900) |
| `scritturaBreve` | 260 | 0 | trattino che torna, tratteggio, nome di chi "ha scritto prima di te" |
| `sottolinea` + `ritardoSottolinea` | 400 + 80 | 0 | tratto turchese |
| `cancella` | 400 | 0 | straccio sul tuo nome |
| `sbiadisce` | 400 | 0 | invio fallito |
| `raccoltaVia` / `raccoltaFlip` / `riappare` | 180 / 300 / 220 | 0 | raccolta delle righe lontane |
| `tastiera` | 250 | 0 | riga di scrittura sopra la tastiera |
| `strisciaEntra` / `strisciaEsce` | 320 / 240 | 0 | riga di stato su mobile |
| `suggerimentoEntra` / `suggerimentoEsce` | 320 / 240 | 0 | "Passa il dito sul vetro" |
| `rigaStato` / `rimettilo` | 8000 / 10000 | uguali | durata dei messaggi (ux §7) |

Funzioni: `durataScrittura(nome, ridotto?)`, `passoRiga(righe, ridotto?)`,
`durataRiscrittura(righe, ridotto?)`.

---

## 4. Il vapore che torna (per il section-builder-vapore)

### 4.1 Il modello

Ogni punto della maschera ha:
- **istante di pulizia** `t` (ms), aggiornato da pennello, passata, gocce,
  rilascio di una zona protetta;
- **nucleazione** `n` in 0..1, da una mappa di rumore **statica** a bassa
  frequenza (macchie larghe 80-160 px CSS, `RITORNO.macchiaMinima/Massima`),
  generata una volta. È diversa dalla grana dell'art-director (aspetto): la
  nucleazione decide solo *dove* il vapore torna prima.

Il vapore visibile in un punto è
`nebbiaNelTempo(ora − t, n) × densità(y)` (densità 0,78 → 0,9 da
`tokens.ts VAPORE`), con:

| Nucleazione | Pulito pieno fino a | Coperto del tutto a |
|---|---|---|
| 1 (nuclea per primo) | 3,6 s | 15,2 s |
| 0,5 | 4,4 s | 15,4 s (circa) |
| 0 (nuclea per ultimo) | 5,2 s | 17,6 s |

Campioni misurati (vapore 0..1): a 8 s 0,42 / 0,20 / 0,08; a 10 s
0,79 / 0,52 / 0,30; a 12 s 0,98 / 0,82 / 0,59 (n = 1 / 0,5 / 0). Le chiazze
si vedono tra 5 e 13 s, poi il vetro torna uniforme. È il "plateau + ritorno
a chiazze" di Rain on Glass (trend-researcher P1) portato ai 14-18 s della
direzione.

### 4.2 Pulizie parziali (bordo del pennello)

Il pennello ha un nocciolo pieno al 70% del raggio e un bordo sfumato
(trend-researcher P2, interaction-designer). Un punto pulito con forza `s`
(0..1) prende come istante
`t' = max(t, ora − etaPerNebbia(1 − s, n))`: se era già più pulito resta
com'era. Effetto: il bordo della traccia torna per primo (età già avanzata),
il centro resta pulito per tutta la pausa. Nessuna somma che "accumula"
pulito oltre il pieno.

### 4.3 Implementazione consigliata (Canvas 2D, nessuna `ctx.filter`)

- Per specchio: un `Float32Array` di istanti di pulizia e un `Uint8Array`
  di nucleazione (quantizzata a `RITORNO.livelli` = 16) a **0,33-0,5 ×** la
  dimensione CSS del vetro (a 1440 il vetro 1220 × 756 → ~400 × 250 =
  100 mila punti; a 375 → ~110 × 170 = 19 mila).
- Una volta sola: `costruisciTabelleNebbia()` (34 KB): `nebbia[livello ×
  passi + floor(età / 16)]` dà il vapore 0..255 senza calcoli; `eta[livello
  × 256 + v]` dà l'età per le pulizie parziali.
- In `render` (solo se sporco): un ciclo sui punti che scrive l'alfa in un
  `ImageData` (vapore × densità della riga), `putImageData` su un canvas
  piccolo, `drawImage` scalato sul canvas visibile (il browser ammorbidisce).
  Con la tabella è circa una lettura e una moltiplicazione per punto:
  stimato < 1 ms a 100 mila punti su desktop, < 0,5 ms su mobile.
- Quando tutti i punti hanno età ≥ `RITORNO.ritornoVapore` (17,6 s), il
  motore smette di chiedere frame (ticker fermo, budget "0 frame a vetro
  fermo").
- Le gocce puliscono la loro scia (larghezza 5 px) mettendo `t = ora` sui
  punti che attraversano; tornano col modello come tutto il resto.

### 4.4 Perché non `destination-out` per frame

Il tech-architect §7.3 proponeva di far tornare il vapore con un
`destination-out` per frame a `globalAlpha = dt / ritorno`. Misurato in
Chromium (canvas 4 × 4, 4000 iterazioni): con alfa per frame 0,0046 o
0,0033 la maschera **si ferma a 127/255** e non scende più (arrotondamento a
8 bit); con 0,02 si ferma a 25/255, con 0,07 a 7/255. Tradotto: il vapore
tornerebbe solo a metà e resterebbe lì per sempre, oppure dovrebbe tornare a
scatti grossi. Inoltre la decadenza moltiplicativa non ha pausa di pulito.
Il modello a età non ha questo problema ed è monotono per costruzione.
(Richiesta al tech-architect / section-builder-vapore in fondo.)

### 4.5 Gli altri tempi del vapore

| Cosa | Come |
|---|---|
| Apertura, `alza(i, 2400)` | il fattore di ogni riga è `vaporeInAlzata(y, t)` con `t` lineare 0..1 sul tempo: fronte che sale dal basso con curva `sale`, banda morbida del 35% dell'altezza, in ogni punto il vapore cresce in modo lineare mentre la banda passa. Durante la salita tutti i punti hanno età "coperto" tranne quelli che l'utente pulisce: la salita **non ricopre mai** ciò che è stato pulito (ux 5.1). |
| `passata(i, da, a, raggio, 700)` | il motore genera i punti lungo il segmento con progresso `palmo(t)` e li tratta come un tratto del pennello (stesso nocciolo, stesso bordo), **senza** chiamare `onPrimoGesto` |
| `attiva(i)` e ritorno da scheda nascosta | il motore non salta all'età vera: usa `tempoRecuperato(ora, inizio, arretrato, 600)` come "ora" per 600 ms. Lo specchio si ricopre in modo continuo invece che di colpo (CD §6.2). Gli specchi non attivi restano fermi all'ultimo frame. |
| `impostaModo('fermo', 900)` | fattore globale da 1 a 0 in 900 ms, lineare (200 ms ridotto); poi tutti i punti puliti e ticker fermo |
| `impostaModo('vivo', 2400)` | come l'apertura: tutti i punti tornano "coperti" e il fronte risale (ridotto: fattore globale 0 → 1 in 1200 ms, lineare, senza fronte) |
| `proteggi(...)` | la zona si pulisce in `fuocoPulisce` 300 ms (zone grandi `zonaGrande` 450, alone `alone` 600); al rilascio i punti della zona prendono `t = ora` e tornano col modello (nessuno scatto) |
| Gocce | `GOCCE`: max 2, una ogni ≥ 1,5 s, probabilità 0,35 a fine tratto, partenza 0,5-1,2 s dopo dal bordo basso della traccia (0,85 × raggio sotto il punto più basso), velocità media 30-40 px/s, corsa 60-140 px con curva `goccia`, testa 3,5 px. `parametriGoccia(a, b, c)` dal PRNG del motore. Solo modo vivo e motion full. |

---

## 5. Coreografia per schermata

### 5.1 Apertura (qualsiasi specchio)

| t dal montaggio | Cosa | Chi |
|---|---|---|
| 0 | vetro pulito, riflesso e listino leggibili, nessun preloader | markup + CSS |
| ≥ 500 ms, font pronti (al massimo 2,5 s), canvas deciso (al massimo 3 s), scheda visibile | il vapore sale dal basso, 2400 ms | `avviaApertura` → `vapore.alza` |
| + 2400 | suggerimento sulla mensola (320 ms di opacità) | `onSuggerimento(true)` |
| + 3100 (`INIZIO_PASSATA`) | una passata col palmo sopra la riga del taglio, 700 ms, raggio 60 px (44 px su vetri < 640 px, orizzontale) | `vapore.passata` |
| primo gesto | suggerimento via (240 ms); se prima della passata, la passata non parte | `onPrimoGesto` |

Non parte se: reduced motion, "Specchio pulito", canvas spento, layout
"scorre", riga di scrittura aperta, Informazioni aperto. Si interrompe se una
di queste cambia o se cambia lo specchio prima della passata.
Il tracciato della passata (`tracciatoPassata`): attraversa la riga del
bersaglio con un raggio di margine a sinistra e a destra, centrata sulla sua
riga; sui vetri larghi scende del 5% dell'altezza da sinistra a destra (la
mano), su quelli stretti è orizzontale. Senza bersaglio usa
`PASSATA_DEFAULT`.

### 5.2 Pulire (tutte le schermate)

Il gesto è dell'interaction-designer (`interaction/pulire.ts`), il ritorno è
il §4. Nient'altro si muove mentre pulisci.

### 5.3 Cambio specchio

- Pieno: la pista trasla in 650 ms con `gira` (`ctp-mov-pista`). Il fuoco
  resta sulla tab. In contemporanea `vapore.attiva(i)` recupera il tempo
  passato in 600 ms: lo specchio nuovo arriva e il suo vapore si posa mentre
  la testa frena.
- Ridotto: la pista salta, gli specchi si scambiano con 200 ms di dissolvenza
  (`ctp-mov-specchio` + `--spento`).
- Il tratto turchese sotto il nome del barbiere sulla mensola cambia **senza
  movimento** (feedback immediato; il tratto che si traccia è riservato al
  tuo nome, il picco dell'arco emotivo).

### 5.4 Cambio giorno, fascia, faccia su mobile: lo straccio

`useStraccio`. Lo straccio cancella da sinistra a destra in 400 ms (maschera
che avanza + opacità a 0,35, curva `straccio`), poi i dati cambiano, poi le
righe si riscrivono col pennarello, una ogni 60 ms (260 ms ciascuna). Una
lista di 9 righe è di nuovo intera dopo 400 + 740 ms. Tocchi a raffica su
"domani →" tengono solo l'ultimo, con almeno 500 ms tra due inizi. Ridotto:
100 ms di uscita, 100 ms di entrata.

### 5.5 Riga di scrittura

| Momento | Movimento |
|---|---|
| tocchi un trattino | la riga di scrittura prende il suo posto e compare per opacità (220 ms dopo 180 ms); le righe lontane svaniscono in 180 ms, poi si nascondono e le vicine si stringono con FLIP (300 ms, `raccolta`); la zona della lista si pulisce dal vapore (450 ms) |
| tastiera aperta (S, M) | la faccia trasla in 250 ms (`tastiera`) |
| scegli "taglio e barba" | il tratteggio sulla riga sotto si scrive (260 ms, segno breve) |
| "Segna" | il tuo nome si scrive da sinistra a destra (600 ms, +30 ms per lettera oltre la sesta, tetto 900) |
| successo | dopo 80 ms il tratto turchese si traccia in 400 ms (`sottolinea`); la riga di scrittura si chiude, le righe tornano (220 ms) e le vicine scorrono al loro posto (FLIP) |
| posto preso (L11) | il nome dell'altro si scrive al posto del trattino (260 ms) |
| invio fallito | il nome sbiadisce a `--ctp-opacita-fallito` in 400 ms |
| "cancella" | straccio sul nome e sul tratto (400 ms), poi il trattino si riscrive (260 ms) |

Ridotto: tutto compare senza tracciarsi.

### 5.6 Mensola, riga di stato, Informazioni

- Riga di stato su S: esce da dietro la mensola (translateY 100% → 0 +
  opacità, 320 ms, `striscia`), rientra in 240 ms. Su L/M è ferma: cambia
  solo il testo.
- Suggerimento: 320 ms in entrata, 240 ms in uscita, solo opacità.
- Interruttore "Specchio pulito": l'icona cambia subito; il vapore va via in
  900 ms (torna in 2400 ms risalendo).
- Pannello Informazioni: compare **senza movimento**; è il vapore sotto che
  si pulisce (450 ms).

### 5.7 Vetrina lunga (`data-layout="scorre"`)

Vapore fermo, nessuna apertura, nessun pan (gli specchi sono impilati). Lo
straccio e la scrittura restano come sopra.

---

## 6. Le classi di movimento (`motion.css`)

Il builder mette la classe; tempi e curve sono miei. Senza modificatori
l'elemento è fermo e visibile.

| Classe | Su cosa | Chi | Note |
|---|---|---|---|
| `ctp-mov-pista` | la pista orizzontale degli specchi | parete | transizione del `transform` (650 ms, `gira`; 0 ridotto) |
| `ctp-mov-specchio` + `--spento` | ogni specchio; `--spento` sui non attivi | parete | dissolvenza 200 ms solo ridotto; in pieno resta opaco |
| `ctp-mov-straccio` + `--via` / `--riscrive` | contenitore che si riscrive | lista, parete (facce) | da `useStraccio().classeContenitore` |
| `ctp-mov-riga` + `--ctp-riga` | ogni riga che si riscrive (anche il titolo del giorno, indice 0) | lista, vetro | **sull'elemento inline-block del testo, non sul `<li>` a tutta larghezza**: la maschera avanza sulla larghezza dell'elemento, su un blocco largo il testo corto si scriverebbe in un lampo (visto a schermo) |
| `ctp-mov-scrittura--scrive` + `--ctp-scrivi` | il tuo nome durante l'invio | lista | `--ctp-scrivi: ${durataScrittura(nome)}ms` scritto una volta |
| `ctp-mov-segno` | trattino che torna, tratteggio, nome di L11 | lista | parte al montaggio |
| `ctp-mov-sottolinea` + `--traccia` | contenitore del `<Tratto tipo="sottolineatura">` | lista | `--traccia` solo al successo; al ritorno sul sito senza modificatore |
| `ctp-mov-cancella` + `--via` | il tuo nome + tratto | lista | dopo `TEMPI.cancella` smontare e montare il trattino |
| `ctp-mov-sbiadito` + `--fallito` | il tuo nome | lista | |
| `ctp-mov-raccolta--lontana`, `data-ctp-riappare`, `ctp-mov-flip--flip`, `ctp-mov-riga-scrittura` | righe e riga di scrittura | lista (via `useRaccolta`) | `data-ctp-riappare` e `--flip` li mette il hook |
| `ctp-mov-tastiera` + `--ctp-tastiera-dy` | faccia lista su S/M | lista | la variabile su un elemento foglia `data-ctpvar`, solo quando cambia |
| `ctp-mov-striscia` + `--nascosta` | riga di stato su S | mensola | sempre montata |
| `ctp-mov-suggerimento` + `--nascosto` | suggerimento del gesto | mensola | sempre montato |

### 6.1 Uso dei hook

```tsx
// Lista (cambio giorno)
const s = useStraccio(righe.length + 1, () => annuncia(...));
<ol className={s.classeContenitore} style={s.stileContenitore as CSSProperties}>
  <li><h3><span className={s.classeRiga} style={s.stileRiga(0) as CSSProperties}>…</span></h3></li>
  {righe.map((r, k) => <li key={r.ora}><span className={s.classeRiga} style={s.stileRiga(k + 1) as CSSProperties}>…</span></li>)}
</ol>
// "domani →"
onClick={() => s.avvia(() => cambiaGiorno(i, +1))}

// Raccolta
const rc = useRaccolta(refOl, scritturaAperta);
onClick={() => { rc.misura(); apriScrittura(slot); }}     // anche prima di chiudiScrittura
<li className={rc.classeRiga(lontana)} hidden={rc.nascondiLontane && lontana}>…</li>
<form className={rc.classeRigaScrittura} data-ctp-scrittura>…</form>
```

`lontana` = più di una riga sopra o sotto la riga di scrittura (due su L se
c'è spazio, ux 5.5). Le righe sono i figli diretti del contenitore passato
a `useRaccolta`.

### 6.2 Apertura

```ts
// Contropelo.tsx, effetto al montaggio (dopo inizializza)
useEffect(() => {
  const vetro = document.querySelector<HTMLElement>(`#ctp-specchio-${specchioIniziale} [data-ctp-vetro]`);
  if (vetro === null) return;
  const bersaglio = vetro.querySelector<HTMLElement>('[data-ctp-bersaglio-passata]');
  return avviaApertura({ indice: specchioIniziale, vetro, bersaglio, onSuggerimento: impostaSuggerimento });
}, []);
```

---

## 7. Contratti richiesti allo scaffold

I miei file importano esattamente questo (verificato con stub):

```ts
// state/store.ts
export type IndiceSpecchio = 0 | 1 | 2;
export interface ContropeloState { pronto; specchio; motion: 'full' | 'reduced'; canvas: 'pending' | 'on' | 'off';
  pulito: boolean; layout: 'fisso' | 'scorre'; scrittura: Scrittura | null; info: boolean; … }   // tech-architect §6.1
export const store: { get(): ContropeloState; subscribe(fn: () => void): () => void; … };
export function useContropelo<T>(selector: (s: ContropeloState) => T, isEqual?): T;

// vapore/index.ts (tech-architect §7.1)
vapore.alza(i, durata); vapore.passata(i, da, a, raggio /* px CSS */, durata); vapore.onPrimoGesto(fn): () => void;

// core/fonts.ts
export function fontsReady(): Promise<unknown>;   // risolve anche se un font fallisce
```

Più: `motion/motion.css` importato una volta (in `Contropelo.tsx`, dopo
`tokens.css`); `data-motion="full" | "reduced"` su `.ctp-root` scritto dallo
store già al primo render lato client.

---

## Richieste ad altri agent

- **scaffold-engineer**: i contratti del §7; importare `motion/motion.css`;
  in `Contropelo.tsx` l'effetto del §6.2 con lo stato `suggerimento`
  (booleano locale o nello store) passato alla mensola.
- **section-builder-vapore** (e tech-architect per conoscenza): **non**
  implementare il ritorno con `destination-out` per frame: la maschera a 8
  bit si blocca a 127/255 (misurato, §4.4). Usare il modello a età del §4
  (`nebbiaNelTempo`, `etaPerNebbia`, `costruisciTabelleNebbia`,
  `vaporeInAlzata`, `tempoRecuperato`, `GOCCE`); `passata` col progresso
  `palmo`, senza `onPrimoGesto`; `RITORNO.ritornoVapore` (17,6 s) come
  soglia per fermare il ticker.
- **section-builder-parete**: `ctp-mov-pista` sulla pista, `ctp-mov-specchio`
  (+ `--spento` sui non attivi) su ogni specchio; l'elemento che riceve i
  gesti con `data-ctp-vetro`; `useStraccio(…)` per il cambio faccia su
  mobile (la faccia nascosta resta `hidden` solo a fine `via`).
- **section-builder-vetro**: `data-ctp-bersaglio-passata` sullo span della
  riga "taglio … 22" del listino (specchio 1), sulla riga del prezzo della
  rasatura (specchio 2) e sulla prima riga degli orari (specchio 3);
  `ctp-mov-riga` sugli span delle righe se la faccia vetro si riscrive.
- **section-builder-lista**: classi e hook del §6; l'invio simulato
  (`invio.ts`) dura almeno `durataScrittura(nome) + 80` ms, così la
  sottolineatura parte a nome scritto.
- **section-builder-mensola**: `ctp-mov-suggerimento` (visibile se
  `suggerimento && !primoGesto && modo vivo`), `ctp-mov-striscia` su S; il
  tratto del barbiere attivo senza transizione; durate dei messaggi da
  `TEMPI.rigaStato` e `TEMPI.rimettilo`.
- **interaction-designer**: nessuna modifica; `useStraccio` applica la
  stessa regola dei 500 ms di `creaCadenza` con la sua coda (serve sapere
  quando finisce lo straccio, non solo quando parte).
