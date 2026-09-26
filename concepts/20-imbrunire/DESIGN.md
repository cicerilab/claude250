---
version: 1
name: IMBRUNIRE-albergo-di-sette-stanze
description: Sito di un piccolo albergo di sette stanze in un palazzo del centro di Pordenone, costruito come il palazzo tagliato in sezione all'ora in cui si accendono le luci. Cielo blu notte fermo con la luna vera di stasera, muri d'intonaco terracotta e poché pieno, dentro ogni stanza una scatola in CSS 3D con la foto vera come parete di fondo. La luce calda è l'unico accento e vuol dire una cosa sola - acceso, libero, toccabile. Marcellus maiuscolo da iscrizione, Commissioner per orari, prezzi e regole. Un solo tema, scuro per identità. Spigoli vivi, nessuna ombra d'interfaccia.

colors:
  notte: "#1F2638"
  notte-profonda: "#171C2A"
  cielo-basso: "#262E44"
  pietra: "#2B3247"
  intonaco: "#BE7359"
  intonaco-luce: "#D08A6E"
  intonaco-ombra: "#9C5A45"
  poche: "#8A4A38"
  poche-scuro: "#5E2F23"
  inciso: "#4E261C"
  soffitto: "#D7B59A"
  trave: "#4B2F24"
  pavimento-base: "#7A5540"
  luna: "#F2E8D0"
  luna-velata: "#E6D7BC"
  luna-spenta: "#9AA0B4"
  luce: "#F2C77C"
  su-luce: "#1F2638"
  pannello: "rgb(31 38 56 / 0.92)"

typography:
  iscrizione:
    fontFamily: Marcellus
    fontSize: 32px → 64px (in cella 11cqi)
    fontWeight: 400
    textTransform: uppercase
    letterSpacing: 0.08em
    lineHeight: 1.05
  titolo-stanza:
    fontFamily: Marcellus
    fontSize: 28px → 40px
    fontWeight: 400
    textTransform: uppercase
    letterSpacing: 0.04em
    lineHeight: 1.1
  nome-cella:
    fontFamily: Marcellus
    fontSize: clamp(13px, 2.2cqi del palazzo, 17 → 20px) · torre 20px
    fontWeight: 400
    textTransform: uppercase
    letterSpacing: 0.04em
    lineHeight: 1.1
  marchio:
    fontFamily: Marcellus
    fontSize: 16px → 19px (21 da 1920)
    textTransform: uppercase
    letterSpacing: 0.04em
  mese:
    fontFamily: Marcellus
    fontSize: 15px → 17px
    textTransform: uppercase
    letterSpacing: 0.04em
  fregio:
    fontFamily: Marcellus
    fontSize: clamp(12px, 2.3cqi del palazzo, 14 → 17px)
    textTransform: uppercase
    letterSpacing: 0.04em
  successo:
    fontFamily: Commissioner
    fontSize: 22px → 30px
    fontWeight: 400
    lineHeight: 1.35
  totale:
    fontFamily: Commissioner
    fontSize: 28px → 36px
    fontWeight: 600
    fontVariantNumeric: tabular-nums
    lineHeight: 1.1
  corpo:
    fontFamily: Commissioner
    fontSize: 16px → 17px
    fontWeight: 400
    lineHeight: 1.55
  piccolo:
    fontFamily: Commissioner
    fontSize: 14px → 15px
    fontWeight: 400
    lineHeight: 1.45
  micro:
    fontFamily: Commissioner
    fontSize: 13px (14 da 1920)
    fontWeight: 400
    fontVariantNumeric: tabular-nums
  bottone:
    fontFamily: Commissioner
    fontSize: 16px → 17px
    fontWeight: 600
    lineHeight: 1

rounded:
  none: 0px
  disco: 50%

spacing:
  s-1: 4px
  s-2: 8px
  s-3: 12px
  s-4: 16px
  s-5: 24px
  s-6: 32px
  s-7: 48px
  s-8: 64px
  s-9: 96px
  margine: 16px (375) → 46px (1440)
  muro: 16px torre · 14 → 18 → 24px sezione (768 · 1440 · 2560)
  solaio: 20px torre · 18 → 22 → 28px sezione
  fascia-nome: 46px sezione (40 su schermi bassi), cresce col testo in torre
  palazzo: min(1180px, 82vw, (100svh − 222 − 36 − fissi) / 0.53), da 480 a 1400px

components:
  bottone-primario:
    backgroundColor: "{colors.luce}"
    textColor: "{colors.su-luce}"
    typography: "{typography.bottone}"
    rounded: "{rounded.none}"
    height: 52px ("Tienimi la stanza"), 48px (gli altri), 44px ("Scegli le lune" in testata)
  bottone-secondario:
    backgroundColor: transparent
    textColor: "{colors.luna}"
    border: 1px solid luna-spenta
    rounded: "{rounded.none}"
    height: 48px
  pannello-stanza:
    backgroundColor: "{colors.pannello}"
    textColor: "{colors.luna}"
    width: 360px
    padding: 24px
    rounded: "{rounded.none}"
  fascia-nome:
    backgroundColor: "{colors.poche}"
    textColor: "{colors.luna}"
    secondaryText: "{colors.luna-velata}"
  finestra-ora:
    backgroundColor: "{colors.notte-profonda}"
    frame: 3px poche, su muro d'intonaco da 8px
    selectedBackground: "{colors.luce}"
    selectedText: "{colors.su-luce}"
    size: 52 × 44px, 5 per riga, spazio 6px
  campo:
    backgroundColor: "{colors.notte-profonda}"
    textColor: "{colors.luna}"
    border: 1px solid luna-spenta (fuoco - luce)
    height: 48px
    rounded: "{rounded.none}"
  luna:
    lit: "{colors.luna}"
    shadow: luna-spenta al 22%
    size: 34px nastro (28 schermi bassi, 38 grandi, 40 torre) · 48px cielo · 96px successo
  anello-di-fuoco:
    outline: 2px solid luce, offset 3px
    halo: box-shadow 0 0 0 3px notte
---

# IMBRUNIRE · Design system

Albergo di sette stanze a Pordenone, concept 20 di Ciceri Lab. Questo file è
la fonte per chi costruisce: i valori esatti stanno in
`src/pages/concepts/imbrunire/styles/tokens.css` (variabili `--imb-*`) e
`tokens.ts` (stessi valori per JS, più le funzioni di geometria). Il perché
delle scelte e la tabella completa dei contrasti stanno in
`docs/art-director.md`.

## 1. Visual Theme & Atmosphere

È sempre quel quarto d'ora di sera in cui si arriva in albergo. Il cielo è
blu notte pieno e fermo; l'unico astro è la luna di stasera, con la fase vera.
Sotto, il palazzo di intonaco terracotta è **tagliato in sezione** come le
tavole degli architetti: il fronte è stato tolto, i muri e i solai tagliati
sono un pieno più scuro (il poché), e dentro ogni cella c'è una stanza vera,
una scatola con pavimento, soffitto e pareti in prospettiva, la cui parete di
fondo è la fotografia della camera.

- **Una sola cosa grande**: il palazzo. Nessun titolo che urla, nessuna
  fotografia a tutto schermo in apertura, nessun video.
- **La luce è il significato**: una stanza accesa è libera, una spenta è
  occupata; il colore `luce` compare solo dove si può andare o toccare.
- **Materiali, non decorazioni**: intonaco con una grana ferma appena
  percettibile, poché pieno, travi di noce, pavimento del colore della foto.
  Niente cornici, filetti, onde, ombre di sollevamento, vetro sfocato.
- **Architettura, non giocattolo**: spigoli vivi ovunque, falde basse da coppi
  veneti (pendenza 0,33, ~18°), niente rimbalzi, niente colori saturi.
- Dial: `DESIGN_VARIANCE 8`, `MOTION_INTENSITY 5`, `VISUAL_DENSITY 4`.

## 2. Color Palette & Roles

### Notte (fondo di tutto)

| Token | Hex | Ruolo |
|---|---|---|
| `notte` | `#1F2638` | cielo, fondo della pagina, pannelli, fogli, testo sui bottoni di luce |
| `notte-profonda` | `#171C2A` | interno delle stanze spente, ombre dentro le scatole, fondo dei campi, finestre spente |
| `cielo-basso` | `#262E44` | lo stesso blu schiarito di 3-4 punti vicino ai tetti (mai virato verso il viola) |
| `pietra` | `#2B3247` | marciapiede e strada sotto il portico |

### Il palazzo (superfici, mai testo corrente)

| Token | Hex | Ruolo |
|---|---|---|
| `intonaco` | `#BE7359` | muri visti di fronte: colonna della scala, portico, comignoli, pelle esterna dei muri |
| `intonaco-luce` | `#D08A6E` | intonaco toccato dalla luce: parete dell'androne, cornicione, telaio del pannello |
| `intonaco-ombra` | `#9C5A45` | pareti laterali dentro le scatole |
| `poche` | `#8A4A38` | spessore di muri e solai tagliati, gradini, **fasce dei nomi** |
| `poche-scuro` | `#5E2F23` | falde tagliate del tetto, zoccolo con la frase di chi siamo |
| `inciso` | `#4E261C` | lettere incise nell'intonaco (solo ≥ 24 px, o logotipo) |
| `soffitto` | `#D7B59A` | intonaco chiaro del soffitto interno, scaldato dalla lampada |
| `trave` | `#4B2F24` | travi di noce (sottotetto, piano nobile) |
| `pavimento-base` | `#7A5540` | pavimento solo se la foto non dà il suo colore campionato |

### Luna e luce

| Token | Hex | Ruolo |
|---|---|---|
| `luna` | `#F2E8D0` | testo principale su notte e su poché; disco illuminato della luna |
| `luna-velata` | `#E6D7BC` | testo secondario **sulle fasce di poché** (luna spenta lì non passa AA) |
| `luna-spenta` | `#9AA0B4` | testo secondario su notte; parte in ombra della luna (al 22%); bordi dei campi |
| `luce` | `#F2C77C` | **unico accento**: stanza accesa, luna scelta, ora scelta, bottone primario, fuoco |

### Regole

- La `luce` vuol dire "acceso, scelto, toccabile" e nient'altro: mai su
  decorazioni, icone informative, link del piede, titoli.
- Testo corrente solo su `notte`, `notte-profonda`, `pannello`, `poche`,
  `poche-scuro`, `pietra`. Su `intonaco` solo testo ≥ 24 px (in `inciso` o
  `notte`). Mai testo sopra una foto senza il velo del pannello.
- Nessun altro colore entra nel sito: niente verde, niente oro metallico,
  niente rosso d'errore, niente viola, niente arancio di tramonto. Gli errori
  sono testo in `luna` con un filo di `luce` a sinistra.
- Tema unico scuro (`color-scheme: dark`), nessun tema chiaro.
- Eccezione unica ai token: il colore del pavimento campionato da ogni foto
  (dato in `assets/foto/index.ts`).

### Stati della luce (solo opacità di veli, mai `filter` animato)

| Stato | Velo di luce sulla foto | Velo notte profonda | Velo di desaturazione |
|---|---|---|---|
| accesa | `--imb-velo-luce` (radial caldo, `soft-light`), opacità 1 | 0 | 0 |
| accesa + passaggio/fuoco | + `--imb-calore` (0,08) | 0 | 0 |
| spenta (occupata, chiusa, accensione non ancora arrivata) | 0 | `rgb(notte-profonda / .64)`, opacità 1 | grigio 50% al 40% in `saturation`, opacità 1 |

Il pavimento ha l'alone `--imb-alone-pavimento` (acceso) e il velo notte
(spento); pareti e soffitto hanno il velo notte profonda quando la stanza è
spenta. La fascia di una stanza accesa riceve `--imb-riverbero`: un filo di
luce di 2 px sul bordo del solaio, **mai** una velatura sotto il nome.

## 3. Typography Rules

### Famiglie

- **Marcellus** (un peso): capitali da iscrizione sui portali. Sempre
  **maiuscolo**, spaziatura +0,04em (+0,08em solo nell'iscrizione incisa),
  mai corsivo (non esiste e non si simula), mai con una parola colorata dentro,
  mai con un sottotitolo sans attaccato come coppia fissa. Usi: nome
  dell'albergo, nomi delle stanze nelle fasce, titolo della stanza aperta, mese
  sul nastro, iscrizione dell'androne, frase nello zoccolo.
- **Commissioner** (variabile 400-600): tutto il resto, sempre in tondo, mai
  maiuscolo spaziato. `font-variant-numeric: tabular-nums` su prezzi, date,
  giorni del nastro, ore, metri quadri.
- Ripieghi locali tarati con `size-adjust`/`ascent-override` (misurati con
  fontTools): `Imbrunire Commissioner Ripiego` (Arial, 99,04%) e `Imbrunire
  Marcellus Ripiego` (Times, 94,94%, tarato sul maiuscolo).

### Gerarchia

| Livello | Token | Misura 375 → 1440 |
|---|---|---|
| Iscrizione incisa | `--imb-t-iscrizione` | 32 → 64 px (in cella `11cqi` della cella) |
| Titolo della stanza (h2) | `--imb-t-titolo` | 28 → 40 px |
| Nome in cella | `--imb-t-nome-cella` + `--imb-nome-adatta` | torre 20 px; sezione `clamp(13px, 2.2cqi, 17→20px)`, stessa misura per tutte le celle |
| Nome dell'albergo (h1) | `--imb-t-marchio` | 16 → 19 px |
| Mese sul nastro | `--imb-t-mese` | 15 → 17 px |
| Frase nello zoccolo | `--imb-t-fregio` + `--imb-fregio-adatta` | 14 → 17 px, `clamp(12px, 2.3cqi, …)` |
| Frase del successo | `--imb-t-successo` | 22 → 30 px, interlinea 1,35 |
| Totale | `--imb-t-totale` | 28 → 36 px, 600, tabellare |
| Corpo | `--imb-t-corpo` | 16 → 17 px, interlinea 1,55, riga ≤ 60ch (42ch a 375) |
| Piccolo | `--imb-t-piccolo` | 14 → 15 px (prezzo "da", occupata, dati) |
| Micro | `--imb-t-micro` | 13 px (giorni sotto le lune, ore nelle finestre) |
| Bottone | `--imb-t-bottone` | 16 → 17 px, 600 |

La gerarchia si fa con peso e colore (`luna` contro `luna-spenta`/`luna-velata`),
non con misure che urlano. La cosa grande del sito è il palazzo.

## 4. Component Stylings

### Il palazzo in sezione

- **Pianta** (ux-architect §2.2): sottotetto Il Noce 31 · Il Campanile 31 ·
  La Soffitta 24 · scala 14; piano nobile Il Camino 35 · La Loggia 25 · Sul
  Noncello 26 · scala 14; piano terra portico 17 · androne 19 · colazione 23 ·
  La Corte 27 · rampa 14 (percentuali della luce interna del piano).
- **Altezze delle scatole** in `u = larghezza / 7,2`: sottotetto 0,95u, piano
  nobile 1,2u, piano terra 1u. Sotto ogni piano il **solaio è la fascia del
  nome**: poché, alto `--imb-fascia-sezione` (46 px; 40 su schermi bassi).
- **Tetto**: il sottotetto sta **dentro** il triangolo del tetto. Muretto
  d'imposta a 0,45 dell'altezza del sottotetto, falde a pendenza 0,33 che
  tagliano Il Noce a sinistra e la colonna della scala a destra (`clip-path`
  sul contenitore del piano, non sulla scatola 3D). Falde tagliate in
  `poche-scuro`, spesse `--imb-manto`, sporgenti 1,4 × muro. Due comignoli in
  intonaco (3,2% × 7,5% della larghezza) con cappello di poché scuro, a 24% e
  70% della larghezza, che escono dalle falde.
- **Muri**: poché spesso `--imb-muro` tra le celle e ai lati, con una pelle di
  intonaco di 3 px sul lato esterno dei muri perimetrali (il palazzo si
  stacca dal cielo). Il poché non si assottiglia mai per fare spazio.
- **Zoccolo**: fascia di `poche-scuro` alta `--imb-zoccolo-h` sotto il piano
  terra, poco più larga del palazzo, con la frase di chi siamo incisa in
  Marcellus `luna` (una riga; due sotto 600 px di palazzo). Sotto, il
  marciapiede in `pietra` (36 px) con la riga "Albergo inventato…".
- **Scala**: colonna d'intonaco a destra con rampe di gradini di poché
  (alzata 7, pedata 11 px), una rampa diagonale per piano; nel sottotetto la
  colonna sale fino alla falda.
- **Portico**: scatola aperta sul davanti, parete di fondo d'intonaco, due
  archi a tutto sesto di poché ritagliati con maschera; nessuna foto.
- **Androne**: parete di fondo `intonaco-luce` con ALBERGO IMBRUNIRE inciso
  (`inciso`, ombra chiara di 1 px sotto le lettere, la cella è un contenitore:
  `--imb-t-iscrizione-cella`). Decorativo in cella (`aria-hidden`).
- **Larghezza**: `width: var(--imb-palazzo-w)` (min 480, max 1180 o 1400 su
  schermi grandi). Il palazzo **poggia sempre sul marciapiede**: il cielo in
  più va sopra, mai sotto.

### La scatola di una stanza (CSS 3D)

- `perspective` = altezza della cella × `--imb-prospettiva` (1,05 sezione,
  1,25 torre); profondità = altezza × `--imb-profondita` (0,7);
  `perspective-origin: 50% var(--imb-occhio-y)` (42%, occhio sopra la metà:
  si vede più pavimento). Misurato: la foto di fondo occupa il 60% della cella
  in ogni piano. In TS: `misureScatola(modo, h)`.
- Facce: fondo = foto (`object-fit: cover`) con sopra i veli e l'ombra
  `--imb-angoli-fondo`; pavimento = colore della foto + `--imb-pavimento-velo`
  + alone; soffitto = `--imb-soffitto-sfondo` o `--imb-soffitto-travi`
  (sottotetto e piano nobile); pareti = `--imb-parete-sx` / `--imb-parete-dx`
  (intonaco in ombra, più scuro verso il fronte). Facce sovrapposte di 0,5 px.
- Strato Dentro: stessa scatola a tutto schermo con prospettiva 3 × altezza
  della finestra (la foto copre ~81%, le pareti restano ai bordi). La testata
  ha fondo `pannello` finché si è dentro (sopra il soffitto chiaro il nome non
  si leggerebbe).
- Foto mancante: parete `--imb-sfondo-intonaco-luce` con il nome della
  stanza in `inciso` ≥ 24 px.

### Fascia del nome (sotto ogni cella)

Poché, `padding: 5px 8px` (sezione), 8px 12px (torre). Nome in Marcellus
`luna`, una riga (`white-space: nowrap`); sotto, in Commissioner piccolo
`luna-velata`, "da 128 € a notte" (sezione: solo al passaggio o al fuoco;
torre: sempre) o "occupata" (sempre, quando le notti scelte la occupano). Gli
spazi comuni in cella usano il nome breve (`PORTICO`, `ANDRONE`, `COLAZIONE`).

### Bottoni

- **Primario** (`luce`, testo `notte`, 600, spigoli vivi): "Scegli le lune"
  (testata, 44 px con il disco della luna di stasera da 18-24 px a sinistra),
  "Le mie notti qui", "Tienimi la stanza" (52 px, tutta la larghezza del
  pannello). Premuto: fondo `luce` con `--imb-velo-spenta` al 15%; in invio
  resta premuto, testo "Ti teniamo la stanza…", nessuno spinner.
- **Secondario**: trasparente, filo 1 px `luna-spenta`, testo `luna`, 48 px.
  Al passaggio il filo diventa `luna`. Mai due primari nello stesso schermo.
- **Porte laterali e scala** (dentro la stanza): bottoni `pannello` a
  tutt'altezza del testo, icona del vector-artist + nome della destinazione.

### Pannello della stanza

Fondo `pannello` (notte al 92%), 360 px, padding 24 px, nessun bordo, nessuna
ombra: si stacca dalla foto solo per il fondo. Titolo in Marcellus, due righe
di carattere in corpo `luna`, dati in piccolo `luna-spenta` tabellari, totale
grande 600.

### Finestre delle ore d'arrivo

Una "facciata" d'intonaco (muro 8 px) con 3 piani di 5 finestre 52 × 44 px,
spazio 6 px (300 px: entra nei 312 utili del pannello). Finestra spenta
`notte-profonda` con telaio interno 3 px di poché e l'ora in `luna` 13 px
tabellare; scelta: fondo `luce`, ora in `notte` 600. Torre: 5 colonne `1fr`.

### Campi

Etichetta sopra (piccolo 500 `luna`), campo 48 px `notte-profonda` con filo 1 px
`luna-spenta`, corpo ≥ 16 px; al fuoco il filo diventa `luce` più l'anello di
fuoco. Errore: sotto il campo, testo `luna` con filo `luce` di 2 px a
sinistra e l'icona "avviso"; mai rosso.

### Lune (`styles/luna.css`)

Disco illuminato `luna`, disco in ombra `luna-spenta` al 22% (luce cinerea).
Stati: `--vuota` (prima del calcolo: ombra al 34%, niente luce), `--stasera`
(anello di luce 1,5 px a r+4), `--scelta` (alone radiale di luce dietro, più la
**base di luce** 3 px sotto: 22 px, a tutta larghezza del passo per arrivo e
ultima notte), `--chiusa` (velata al 35%, la parola "chiuso" sotto),
`--cielo` (alone lunare fermo). Nastro filtrato su una stanza: punto pieno
`luce` = libera, anello tratteggiato `luna-spenta` = occupata (forma, non solo
colore).

### Fuoco

Anello a due toni su tutto: `outline: 2px solid luce; outline-offset: 3px;
box-shadow: 0 0 0 3px notte`. Si legge su notte, poché, intonaco e foto.
Nelle celle del sottotetto il `clip-path` del tetto taglierebbe l'anello:
lì il ritaglio va sul vano interno, non sul bottone.

## 5. Layout Principles

- **Sezione** (`(min-width: 720px) and (min-height: 640px)`): la pagina non
  scorre. Dall'alto: testata 64 px (56 su schermi bassi), nastro delle lune a
  tutta larghezza con riga di stato (fino a ~206 px; 188 in totale su schermi
  bassi con lune da 28), cielo, palazzo appoggiato sul marciapiede. La luna di
  stasera sta nel cielo a sinistra, il palazzo è spostato del 3% a destra.
- **Torre** (sotto soglia): i piani si impilano, una cella per riga larga
  quanto lo schermo meno 16 px di muro per lato; altezza della scatola 56%
  della larghezza (Il Camino 64%, La Soffitta 50%), max 70svh; solai 20 px con
  il nome del piano; binario della scala di 6 px a destra. Lo zoccolo e il
  portico chiudono la pagina, poi 80 px di marciapiede libero.
- **Griglia non convenzionale**: non c'è una griglia a colonne. Le larghezze
  vengono dalla pianta del palazzo (celle diverse, 31/31/24, 35/25/26,
  17/19/23/27, scala 14), le altezze dal modulo u, gli spessori dal poché.
  L'interfaccia intorno (testata, nastro, pannello) si allinea ai margini
  (`--imb-margine`, 16 → 46 px) e alle zone riservate del ConceptBackButton
  (244 × 58 in alto a sinistra ≥ 640 px; 224 × 58 in basso a sinistra sotto).
- Spazi: scala di 4 (4, 8, 12, 16, 24, 32, 48, 64, 96).

## 6. Depth & Elevation

- La profondità sta **solo dentro le scatole**: prospettiva vera, luce che
  viene dalla lampada in fondo (superfici più chiare verso la foto, più scure
  verso il fronte), ombre calde e corte negli angoli tra parete e pavimento.
- Nessuna `box-shadow` di sollevamento su bottoni, pannelli, nastro, fogli.
  Nessun `backdrop-filter`. Se un elemento dell'interfaccia sembra sollevato,
  è sbagliato.
- Livelli (`--imb-z-*`): cielo 0, palazzo 1, testata 20, nastro 25, Dentro 30,
  pannello 35, foglio 40, successo 45. Il ConceptBackButton sta sopra tutto.
- **Texture**: `--imb-grana`, rumore frattale fermo tono su tono (SVG in data
  URI, 160 px), solo su intonaco; mai sotto il testo, mai animata. Il poché è
  pieno, come nei disegni d'architetto. Il cielo è piatto, con lo schiarimento
  a `cielo-basso` solo nel 45% basso.
- **Fotografie**: ritoccate tutte allo stesso modo in export (photo-editor):
  bilanciamento leggermente caldo, ombre appena sollevate, stessa nitidezza.
  Nessun filtro CSS "vintage". Acceso/spento lo fanno i veli, non l'export.
  Foto frontali, parete di fondo parallela all'immagine (dentro una scatola
  frontale una foto d'angolo sembra storta).

## 7. Do's and Don'ts

### Do

- Tenere il poché spesso e pieno: è ciò che fa leggere la sezione.
- Usare `luce` solo per ciò che è acceso o toccabile.
- Scrivere "occupata" e "libera" in parole, oltre alla luce.
- Tenere i nomi delle celle su una riga, alla stessa misura in tutto il palazzo.
- Appoggiare il palazzo sul marciapiede e lasciare il cielo sopra.
- Verificare ogni nuova coppia di colori con lo script dei contrasti.

### Don't

- Niente verde bottiglia, oro, crema come fondo, chiavi, ganci, bacheche,
  numeri di stanza come identità (il bocciato SETTE CHIAVI).
- Niente cielo sfumato in viola, tramonto arancio-rosa, stelle.
- Niente titolo serif corsivo con sottotitolo sans, niente "01 ·", niente
  maiuscoletto spaziato come etichetta, niente schede bianche con bordino e
  ombra, niente filetti o onde, niente fade-up.
- Niente facciata, mattoni, persiane, mobili o sagome disegnati.
- Niente `filter`, `opacity < 1`, `clip-path` o `overflow` sugli elementi
  `preserve-3d`: vanno sulle facce o sul contenitore.
- Niente `luce` da sola su intonaco (2,29:1), niente `luna-spenta` su poché
  (2,59:1), niente testo chiaro su intonaco (2,98:1), niente velatura di luce
  sotto i nomi.
- Niente raggi, niente rimbalzi, niente pillole.

## 8. Responsive Behavior

| Finestra | Modo | Palazzo | Lune (d / passo) | Note |
|---|---|---|---|---|
| 375 × 667 | torre | 343 px di celle | 40 / 48 | prima schermata: cielo, luna, tetto, Il Noce |
| 768 × 1024 | sezione | 706 px (92vw) | 34 / 44 | cielo alto sopra il palazzo |
| 1024 × 600 | torre | | 40 / 48 | sotto 640 px d'altezza la sezione non entra leggibile |
| 1280 × 720 | sezione bassa | 615 px | 28 / 38 | nomi a 13,5 px |
| 1366 × 768 | sezione bassa | 700 px | 28 / 38 | verificato a schermo |
| 1440 × 900 | sezione | 845 px | 34 / 44 | verificato a schermo |
| 1920 × 1080 | sezione grande | 1166 px | 38 / 50 | testi +1 |
| 2560 × 1440 | sezione grande | 1400 px | 38 / 50 | il cielo cresce sopra |

- Soglie: sezione `(min-width: 720px) and (min-height: 640px)`; bassa
  `… and (max-height: 820px)`; grande `(min-width: 1920px) and (min-height:
  1000px)`; tablet `max-width: 1023px` (palazzo al 92vw). In JS:
  `MQ_SEZIONE`, `misuraPer()`, `larghezzaPalazzo()`, `misureLune()`.
- Aree di tocco ≥ 44 px; le lune in sezione bassa (28 px, passo 38) sono solo
  per puntatore fine: il tocco arriva sempre dalla torre o dal foglio (40/48).
- Zoom 400%: si passa da soli alla torre. Contrasto forzato: veli e grana
  spenti, le parole restano.

## 9. Agent Prompt Guide

### Riferimento rapido

- Fondo `#1F2638`, testo `#F2E8D0`, secondario `#9AA0B4` (su poché
  `#E6D7BC`), accento unico `#F2C77C` con testo `#1F2638`.
- Palazzo: intonaco `#BE7359`, poché `#8A4A38`, poché scuro `#5E2F23`.
- Marcellus maiuscolo +0,04em per nomi; Commissioner per tutto il resto.

### Prompt d'esempio

- *"Cella del palazzo: vano con scatola CSS 3D (prospettiva = altezza × 1,05,
  profondità 0,7, occhio al 42%), foto sulla parete di fondo, veli di luce;
  sotto, fascia di poché `#8A4A38` alta 46 px con il nome in Marcellus
  maiuscolo `#F2E8D0` su una riga e 'occupata' in Commissioner 14 px
  `#E6D7BC`. Spigoli vivi, nessuna ombra esterna."*
- *"Pannello della stanza: notte al 92%, 360 px, padding 24, titolo Marcellus
  maiuscolo 40 px, due righe di corpo, dati tabellari in `#9AA0B4`, bottone
  primario `#F2C77C` 52 px a tutta larghezza con testo `#1F2638` 600."*

### Guida all'iterazione

1. Parti dal palazzo: se non si legge come un edificio tagliato, il poché è
   troppo sottile o la prospettiva troppo debole.
2. Poi la luce: acceso/spento deve leggersi a colpo d'occhio e anche in
   parole.
3. Solo dopo l'interfaccia intorno, che deve arretrare.
4. Ogni colore nuovo passa dallo script dei contrasti (appendice di
   `docs/art-director.md`) prima di entrare nei token.
