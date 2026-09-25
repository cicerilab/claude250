---
version: 1
name: IMPRONTA-tipografia-e-legatoria
description: Sito di una tipografia e legatoria artigiana di Pordenone costruito come un unico foglio di carta colorata spessa in cui le lettere sono premute dal torchio. Una carta per volta (Citrino, Cotone, Cipria, Grafite, la sceglie il visitatore), inchiostro verde notte, lamina argento come unico accento, Anybody variabile che si allarga sotto la pressa, Hanken Grotesk per leggere. Nessuna fotografia, raggio zero, margini da libro.

colors:
  citrino: "#E4CF3F"
  citrino-luce: "#F5E97E"
  citrino-ombra: "#9C8A1E"
  citrino-inchiostro: "#17231D"
  cotone: "#F1F1EE"
  cotone-luce: "#FFFFFF"
  cotone-ombra: "#B9BAB3"
  cotone-inchiostro: "#17231D"
  cipria: "#E8B9B3"
  cipria-luce: "#F7D8D3"
  cipria-ombra: "#A9776F"
  cipria-inchiostro: "#231518"
  grafite: "#2A2C2F"
  grafite-luce: "#44474B"
  grafite-ombra: "#141517"
  grafite-inchiostro: "#ECEBE6"
  lamina: "#C8CDD2"
  lamina-chiara: "#DDE1E5"
  lamina-scura: "#A7AEB5"
  su-lamina: "#17231D"

typography:
  secco-hero:
    fontFamily: Anybody
    fontSize: area viva / 8.158 em (desktop), / 6.819 (tablet), / 5.479 (mobile)
    fontWeight: 900
    fontVariation: "wdth 150 | 125 | 100"
    lineHeight: 0.86
    letterSpacing: -0.01em
  secco-grande:
    fontFamily: Anybody
    fontSize: 32px → 60px
    fontWeight: 800
    fontVariation: "wdth 112.5 → 150"
    lineHeight: 0.86
    letterSpacing: -0.01em
  titolo-1:
    fontFamily: Anybody
    fontSize: 30px → 50px
    fontWeight: 700
    fontVariation: "wdth 100"
    lineHeight: 1.04
    letterSpacing: -0.012em
  titolo-2:
    fontFamily: Anybody
    fontSize: 30px → 60px
    fontWeight: 750
    fontVariation: "wdth 100 → 110"
    lineHeight: 1
    letterSpacing: -0.012em
  titolo-3:
    fontFamily: Anybody
    fontSize: 22px → 30px
    fontWeight: 650
    fontVariation: "wdth 100"
    lineHeight: 1.08
    letterSpacing: -0.005em
  nome:
    fontFamily: Anybody
    fontSize: 20px → 22px
    fontWeight: 800
    fontVariation: "wdth 150"
    lineHeight: 1
  prezzo:
    fontFamily: Anybody
    fontSize: 28px → 44px
    fontWeight: 900
    fontVariation: "wdth 125"
    lineHeight: 1
  lead:
    fontFamily: Hanken Grotesk
    fontSize: 18px → 21px
    fontWeight: 400
    lineHeight: 1.45
  corpo:
    fontFamily: Hanken Grotesk
    fontSize: 17px → 18px
    fontWeight: 400
    lineHeight: 1.55
  piccolo:
    fontFamily: Hanken Grotesk
    fontSize: 15px → 16px
    fontWeight: 400
    lineHeight: 1.5
  nota:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  bottone:
    fontFamily: Hanken Grotesk
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.15

rounded:
  none: 0px
  leva: 999px

spacing:
  sp-1: 4px
  sp-2: 8px
  sp-3: 12px
  sp-4: 16px
  sp-5: 24px
  sp-6: 32px
  sp-7: 48px
  sp-8: 64px
  sp-9: 96px
  sp-10: 128px
  u: clamp(20px, 6% pagina, 101px)
  margine-interno: 1u (mobile 20px)
  margine-esterno: 2u (mobile 20px)
  testa: 1.5u (48 → 128px)
  piede: 3u (96 → 240px)

components:
  bottone-lamina:
    backgroundColor: "{colors.lamina}"
    textColor: "{colors.su-lamina}"
    typography: "{typography.bottone}"
    rounded: "{rounded.none}"
    height: 52px (56px nell'hero)
  leva:
    backgroundColor: "{colors.lamina}"
    textColor: "{colors.su-lamina}"
    typography: 18px 600
    height: 72px
    rounded: "{rounded.leva} solo sul manico"
  foglio:
    backgroundColor: carta del pezzo
    textColor: inchiostro del pezzo
    rounded: "{rounded.none}"
---

# IMPRONTA · Design system

Concept 10 del Concept Lab di CiceriLab, rotta `/concept-10`. Documento di
riferimento per tutti i section-builder. I valori vivono in
`src/pages/concepts/impronta/styles/tokens.css` (CSS) e `tokens.ts` (TS e
WebGL); il rilievo senza WebGL in `styles/relief-fallback.css`. I numeri dei
contrasti sono in `docs/art-director.md`.

## 1. Visual Theme & Atmosphere

Il sito è **un foglio solo**. Non una pagina bianca con sopra delle cose, ma
carta colorata spessa, a tutto schermo, in cui le lettere sono state premute.
Si legge come si legge una prova in bottega: inclinando il foglio sotto la
lampada. La luce radente (lo shader, o due ombre in CSS) fa emergere il solco;
tutto quello che serve capire è stampato accanto in inchiostro, fermo e
leggibile.

L'atmosfera è quella del bancone di una tipografia di oggi, non di un museo
della stampa: niente crema, niente anticato, niente caratteri in piombo
fotografati. Il colore è la carta. L'unico lusso è la lamina argento, usata in
tre posti in tutto il sito.

**Caratteristiche chiave**
- Un campo pieno di colore saturo come fondo (Citrino di default). Nessun altro
  concept del Lab lo fa.
- Una carta per schermata. La cambia il visitatore, mai il sito da solo.
- Lettere premute a secco, a un colore, in lamina: la tecnica è il
  materiale, non un effetto.
- Anybody largo e pesante per ciò che è premuto; Hanken Grotesk per leggere.
- Raggio zero ovunque, come un foglio rifilato. Unica eccezione: il manico
  della leva.
- Margini da libro (canone 2:3:4:6), blocco di testo fuori centro verso
  l'interno, piede più alto della testa.
- Nessuna fotografia, nessuna illustrazione, nessuna figura. Il prodotto si
  genera dal vivo.

**Il foglio "si tocca" in tre modi**
1. *Luce*: il cursore o il dito spostano una lampada bassa; il rilievo gira.
2. *Pressione*: quando un blocco entra, la pressa scende una volta; la parola
   si allarga (asse wdth) mentre affonda.
3. *Carta*: toccando una carta, il nuovo colore si propaga dal punto toccato.

## 2. Color Palette & Roles

### Le quattro carte

Ogni carta ha quattro ruoli fissi più tre derivati. I nomi delle variabili
sono gli stessi per tutte: cambiare carta significa cambiare
`data-carta` su `.imp-root` (o su un pezzo), mai i colori nei componenti.

| Carta | `--imp-carta` fondo | `--imp-carta-luce` | `--imp-carta-ombra` | `--imp-inchiostro` | Uso |
|---|---|---|---|---|---|
| **Citrino** 300 g | `#E4CF3F` | `#F5E97E` | `#9C8A1E` | `#17231D` verde notte | default, identità |
| **Cotone** 600 g | `#F1F1EE` | `#FFFFFF` | `#B9BAB3` | `#17231D` verde notte | biglietti, carta intestata |
| **Cipria** 350 g | `#E8B9B3` | `#F7D8D3` | `#A9776F` | `#231518` bruno notte | partecipazioni, nascite |
| **Grafite** 400 g | `#2A2C2F` | `#44474B` | `#141517` | `#ECEBE6` inchiostro bianco | modo scuro, editoria d'arte |

Derivati per carta (in `tokens.css`):

| Variabile | Citrino | Cotone | Cipria | Grafite | Ruolo |
|---|---|---|---|---|---|
| `--imp-inchiostro-velato` | `#505327` | `#545D58` | `#5A4343` | `#B6B6B3` | voci non correnti (inchiostro al 72% già composto). AA garantito |
| `--imp-secco-fondo` | `#D8C43A` | `#E8E8E5` | `#DEAEA8` | `#232528` | fondo del solco a secco. Decorativo |
| `--imp-carta-costa` | `#BCA92D` | `#D2D3CE` | `#C5958E` | `#373A3D` | spessore visto di taglio. Decorativo |
| `--imp-taglio` | `#17231D` | `#E4CF3F` | `#2A2C2F` | `#E4CF3F` | colore del taglio colorato (preso da un'altra carta del sistema) |
| `--imp-lamina-bordo` | `#17231D` | `#17231D` | `#231518` | `#A7AEB5` | filo del bottone in lamina (≥ 3:1 sul fondo) |
| `--imp-spessore` | 3px | 6px | 4px | 5px | costa delle strisce "La carta" |
| `--imp-spessore-pezzo` | 1px | 1.8px | 1.1px | 1.3px | costa di un pezzo appoggiato (uguale al GL) |

### Accento unico: lamina argento

| Variabile | Hex | Ruolo |
|---|---|---|
| `--imp-lamina` | `#C8CDD2` | argento base, colore di ripiego |
| `--imp-lamina-chiara` | `#DDE1E5` | lato verso la luce |
| `--imp-lamina-scura` | `#A7AEB5` | lato in ombra delle superfici |
| `--imp-lamina-riflesso` | `#EEF1F3` | testa delle lettere in lamina |
| `--imp-lamina-profonda` | `#7E868E` | piede delle lettere in lamina (solo lì) |
| `--imp-su-lamina` | `#17231D` | testo sopra la lamina, su tutte le carte |

La lamina compare **solo** su: marchio IMPRONTA, prezzo sulla prova del banco,
bottone "Prova la tua" e leva. Mai su link, icone, bordi, hover, badge.

### Stati

- **Focus**: anello `--imp-focus-colore` (= inchiostro della carta), 3 px, a
  3 px di distanza. Su Grafite è chiaro. Contrasto ≥ 9:1 su ogni carta.
- **Scelto** (carta, tecnica, tiratura): bordo interno inchiostro 3 px **più**
  una parola scritta ("✓ la carta del sito", "scelta"). Mai solo il colore.
- **Errore**: nessun rosso. Bordo inchiostro 3 px, segno "!" e testo sotto il
  campo, `aria-invalid`.
- **Hover dei link**: la sottolineatura si ispessisce da 0,07 em a 0,14 em
  (come una riga premuta di più). Colore invariato.
- **Premuto** (`:active`): `--imp-ombra-premuto` (ombra interna tinta) e
  `translateY(1px)`; sulle superfici in lamina `--imp-lamina-sfumatura-premuta`.
- **Disabilitato**: opacità 0,5 più un testo che dice perché.
- **Selezione del testo**: fondo inchiostro, testo del colore della carta.

### Divieti di colore

- Niente testo grigio sulle carte colorate: il secondario si fa con corpo e
  peso, non schiarendo. L'unica eccezione è `--imp-inchiostro-velato`, già
  verificato AA.
- Niente secondo accento (niente bottoni di un altro colore, niente badge).
- Niente nero puro, niente ombre grigie neutre su Citrino (diventano verdi e
  sporche): ogni ombra è `--imp-carta-ombra` o `--imp-sito-ombra`.
- Niente sfumature sul fondo: la carta è piena e piatta; varia solo dove la
  luce la colpisce.

## 3. Typography Rules

### Famiglie

1. **Anybody** (Google Fonts, variabile: `wdth` 50-150, `wght` 100-900). Per
   tutto ciò che è premuto e per i titoli. Il suo asse di larghezza è la
   "pressione" del sito: sotto la pressa la parola si allarga e si ingrassa.
   Mai il corsivo, mai sotto 20 px, mai testo di lettura, mai larghezza sotto
   75 (sarebbe il condensato del vecchio TORCHIO).
2. **Hanken Grotesk** 400 / 500 / 600 (variabile, un solo file). Per leggere:
   corpo, didascalie, bottoni, campi, colophon. Grottesco caldo, non neutro
   come Inter, aperto a 17 px su carta colorata.

Perché non cambio la coppia del creative director: le misure fatte sui file
confermano che Anybody copre da 75 a 150 di larghezza con proporzioni
lineari (la parola cresce del 48% da 100 a 150 a peso 900), cosa che nessun
altro variabile gratuito offre con questa pesantezza; Hanken ha la stessa
larghezza media di Arial (100,2%), quindi il ripiego non fa saltare le righe.

### Gerarchia

| Voce | Famiglia | Corpo 375 → 1440 | wdth | wght | Interlinea | Tracking |
|---|---|---|---|---|---|---|
| `secco-hero` (la parola *impronta*) | Anybody | riempie l'area viva: 61 px → 145 px | 100 / 125 / 150 | 900 | 0,86 | -0,01 em |
| `secco-grande` (indirizzo, nomi carta) | Anybody | 32 → 60 | 112,5 / 112,5 / 150 | 800 | 0,86 | -0,01 em |
| `titolo-1` (H1 hero) | Anybody | 30 → 50 | 100 | 700 | 1,04 | -0,012 em |
| `titolo-2` (H2 sezioni) | Anybody | 30 → 60 | 100 / 100 / 110 | 750 | 1,00 | -0,012 em |
| `titolo-3` (pezzi, tecniche, legature) | Anybody | 22 → 30 | 100 | 650 | 1,08 | -0,005 em |
| `nome` (parola-nome accanto al titolo) | Anybody | 20 → 22 | 150 | 800 | 1,00 | 0 |
| `prezzo` (in lamina sulla prova) | Anybody | 28 → 44 | 125 | 900 | 1,00 | -0,01 em |
| `marchio` | Anybody | 20 | 150 | 800 | 1,00 | +0,04 em |
| `lead` (sottotitolo hero) | Hanken | 18 → 21 | | 400 | 1,45 | 0 |
| `corpo` | Hanken | 17 → 18 | | 400 (600 per il forte) | 1,55 | 0 |
| `piccolo` (didascalie, colophon) | Hanken | 15 → 16 | | 400 | 1,50 | +0,005 em |
| `nota` (minimo assoluto) | Hanken | 14 | | 500 | 1,40 | +0,005 em |
| `bottone` / `leva` | Hanken | 17 / 18 | | 600 | 1,15 | 0 |
| `campo` | Hanken | 17 (mai sotto 16: zoom iOS) | | 400 | 1,30 | 0 |

Le tre colonne di wdth sono: sotto 600 px, da 600 a 1023, da 1024.

### La parola dell'hero

Il corpo è calcolato, non scelto: `--imp-fs-secco-hero = area viva / larghezza
della parola in em`. Misure su Anybody wght 900 (tracking incluso): 5,479 em a
wdth 100, 6,819 a 125, 8,158 a 150. Risultato verificato nel browser: a 1440
la parola è larga 1181 px (area viva esatta, 145 px di corpo); a 375 è larga
335 px (61 px di corpo). Mai tagliata, mai a capo, mai oltre il margine.

Dopo l'invio i nomi dell'utente sostituiscono *impronta*: il builder usa
`corpoPerRiempire()` di `tokens.ts` (stima) e poi misura il DOM.

### La pressione sugli assi

- Solo le **parole a riga singola** premute cambiano assi: parola dell'hero,
  indirizzo della bottega. Classe `.imp-pressa`.
- A pressione `p`: `wdth = arrivo × (0,8 + 0,2 p)`, `wght = 700 + (arrivo -
  700) × p`. Lo 0,8 coincide con lo `stringiMin` dello shader: DOM e rilievo
  si allargano insieme.
- I titoli su più righe (H1, H2, H3) hanno **assi fissi**: allargarli
  riscriverebbe le righe (salto di layout). La loro pressione si vede solo nel
  rilievo.
- La larghezza di arrivo di una parola premuta è sempre una di quelle che il
  canvas sa disegnare: 75, 87,5, 100, 112,5, 125, 150.

### Principi

- Due registri netti: stampato (interlinea 0,86-1,04, Anybody) e leggibile
  (1,45-1,55, Hanken). Il salto è una firma.
- La scritta a secco è sempre almeno 4 volte più grande del suo gemello in
  inchiostro, così si leggono come materiale e informazione, non come un
  testo ripetuto.
- Minuscolo per ciò che è premuto; maiuscolo solo nel marchio.
- Niente maiuscoletto spaziato come etichetta, niente monospace, niente
  numeri di sezione.
- Giustezza del corpo: massimo 62 caratteri; testi brevi (lead, colophon) 44.
- Descendenti e accenti: le righe a interlinea 0,86 non vanno mai in un
  contenitore con `overflow: hidden` (la "p" di *impronta* scende di 0,09 em
  sotto il box).

### Ripiego dei font

`tokens.css` dichiara due `@font-face` locali tarati sulle metriche vere:
"Impronta Hanken Ripiego" (Arial, `size-adjust` 100,2%) e "Impronta Anybody
Ripiego" (Arial Bold, `size-adjust` 112,3%, tarato su wdth 100 / wght 700).
Lo scambio al caricamento non sposta le righe del testo.

## 4. Component Stylings

### Bottone "Prova la tua" (unico richiamo al preventivo)

- Superficie `.imp-lamina`: argento satinato fermo (sfumatura a 100°, dal
  chiaro allo scuro), filo di bordo 1 px `--imp-lamina-bordo`, raggio 0.
- Testo Hanken 17 / 600, `--imp-su-lamina`, su una riga sola. Altezza 52 px
  (56 nell'hero), padding orizzontale 28 px, larghezza piena su mobile.
- Hover: sfumatura premuta, niente spostamento. Active: `translateY(1px)` +
  ombra interna. Focus: anello inchiostro 3 px a 3 px.
- Niente icone, niente frecce animate, niente magnetismo.

### Leva "tieni premuto per stampare"

- Pista in lamina alta 72 px, larga quanto il compositoio; manico tondo
  (`--imp-raggio-leva`), l'unico oggetto tondo del sito.
- Il testo sopra la leva è inchiostro, Hanken 18 / 600.
- Mentre si tiene premuto il manico scorre e la prova si approfondisce; il
  progresso è anche testo (`aria-live`).

### Foglio (pezzi di "Per chi", prova del banco)

- `.imp-foglio` + `data-carta` del pezzo: fondo della sua carta con fibra,
  inchiostro della sua carta, costa di 1-1,8 px della sua carta, ombra di
  appoggio corta tinta della carta del sito.
- Rotazioni leggere e diverse (-2°, 1,5°, -0,5°), mai uguali.
- `.imp-taglio` aggiunge il bordo tinto (taglio colorato).
- Non è una scheda: niente bordino grigio, niente ombra morbida grande,
  niente hover che solleva.

### Scelte (carta, tecnica, tiratura, cosa stampi)

- Radio veri resi come rettangoli di carta a raggio 0, altezza minima 48 px.
- Scelta attiva: bordo interno inchiostro 3 px + parola scritta.
- Le quattro carte nel banco: quadrati 64 × 64 (72 su mobile) del colore
  della carta, con costa, nome sotto in Hanken.

### Campi

- Etichetta sopra (Hanken 15-16 / 600, inchiostro), campo alto 56 px, fondo
  `--imp-carta-luce` (il foglio "sollevato" dove si scrive), filo inchiostro
  1 px sotto, 2 px al focus più anello.
- Testo 17 px. Placeholder mai come etichetta; se c'è, in
  `--imp-inchiostro-velato` (AA).
- Errore sotto il campo, inchiostro, con "!" e bordo 3 px.

### Testata e segnapagina

- Testata sullo stesso colore della carta, 64 px (56 quando è fissa), nessuna
  barra di altro colore. Da fissa: `--imp-ombra-testata` (costa 1 px + ombra
  tinta cortissima), cioè un foglio sopra l'altro.
- Voci Hanken 15 / 500 in minuscolo; voce corrente sottolineata 2 px.
- Segnapagina mobile: stessa carta, `--imp-ombra-segnapagina`.

### Link

- Inchiostro, sottolineatura 0,07 em a 0,2 em di distanza; hover 0,14 em.
- Link esterni con la freccia del vector-artist, mai colorati.

### Signature: la stessa parola in quattro tecniche (fallback CSS)

| Tecnica | Classe | Resa senza WebGL |
|---|---|---|
| a secco | `.imp-secco` | lettera color fondo del solco, labbro chiaro verso il basso a destra, parete scura verso la luce |
| a un colore | `.imp-inchiostro` | inchiostro pieno, labbro chiaro corto |
| lamina a caldo | `.imp-caldo` | argento con sfumatura verticale ferma (riflesso in testa, profondo al piede), filo scuro e chiaro |
| taglio colorato | `.imp-foglio.imp-taglio` | bordo e costa del cartoncino tinti con `--imp-taglio` |

## 5. Layout Principles

### Gabbia: una pagina di libro (recto)

Canone 2:3:4:6 semplificato su un'unità `u = clamp(20px, 6% della pagina,
101px)`:

| Margine | Rapporto | 375 | 768 | 1440 | 1680+ |
|---|---|---|---|---|---|
| interno (sinistra) | 1u | 20 | 46 | 86 | 101 |
| esterno (destra) | 2u | 20 | 92 | 173 | 202 |
| testa di sezione | 1,5u | 48 | 69 | 130 | 128 (max) |
| piede di sezione | 3u | 96 | 138 | 240 (max) | 240 |
| area viva | | 335 | 630 | 1181 | 1377 |

- Il blocco di testo è ancorato al margine interno: **mai centrato**. Il
  margine esterno resta vuoto (è lì che gioca la luce).
- Il piede è sempre più alto della testa: la pagina "pesa" in basso come un
  libro ben composto.
- Colonne: 4 (sotto 600, canalino 21 px), 8 (600-1023, 22 px), 12 (da 1024,
  24 px). A 1440 una colonna è 76 px.
- Pagina massima 1680 px, centrata: oltre, la carta continua ma la forma di
  stampa resta ferma.
- **A vivo** (fuori dai margini) va una sola cosa: le quattro strisce della
  sezione "La carta". Tutto il resto rispetta i margini.

### Ritmo verticale

- Tra due sezioni solo carta vuota: piede della precedente (`--imp-piede`) più
  testa della successiva (`--imp-testa`). Nessun filetto, nessuna onda.
- Hero: padding superiore dopo la testata massimo 96 px.
- Mai due sezioni consecutive aperte da una parola gigante.

### Spazi

Scala a multipli di 4: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
(`--imp-sp-1` … `--imp-sp-10`). Dentro un blocco composto si usano 8-24;
tra blocchi di una sezione 48-96; tra sezioni testa + piede.

## 6. Depth & Elevation

Il sito è piatto come un foglio: la profondità va **dentro** la carta (il
solco), non sopra.

| Livello | Cosa | Trattamento |
|---|---|---|
| -1 | lettera premuta | solco: parete scura verso la luce, labbro chiaro dall'altra parte (`.imp-secco`, `.imp-inchiostro`, `.imp-caldo`) |
| 0 | carta del sito | pieno, fibra statica quasi invisibile |
| 1 | pezzo appoggiato | costa di 1-1,8 px + ombra di appoggio corta tinta (`.imp-foglio`) |
| 2 | testata fissa, segnapagina | costa 1 px + ombra tinta cortissima (`--imp-ombra-testata`) |
| 3 | indice mobile | foglio che sale: costa + ombra verso l'alto (`--imp-ombra-indice`) |

Regole: ogni ombra è tinta della carta; nessuna ombra grande e morbida;
nessun bagliore; nessun `backdrop-filter`; niente z-index oltre i quattro
token (canvas 0, contenuto 1, testata 10, onda 20; l'indice usa il top layer
di `<dialog>`).

### Luce

- Direzione di riposo: dall'alto a sinistra (azimut 135°, elevazione 22°).
- Il fallback CSS legge `--imp-luce-x` / `--imp-luce-y` (vettore verso la
  luce, coordinate schermo); se l'interaction-designer li aggiorna, anche le
  ombre CSS girano. `vettoreLuce(azimut)` in `tokens.ts`.
- Carta opaca: nessun riflesso sulla carta, lo speculare vive solo sulla
  lamina.

### Texture

`--imp-fibra`: due strati SVG `feTurbulence` statici, tinti con l'ombra e la
luce della carta, stirati in orizzontale (il senso della fibra). Si vedono
solo da vicino. Con WebGL acceso la fibra la fa lo shader e lo strato CSS
sparisce.

## 7. Do's and Don'ts

### Do

- Usare solo variabili `--imp-*`; cambiare carta con `data-carta`.
- Mettere il testo che conta in inchiostro, nel DOM, sempre leggibile.
- Dare a ogni scritta a secco il suo gemello in inchiostro o `aria-hidden`.
- Tenere la parola gigante dentro i margini: una prova di stampa rispetta il
  foglio, un poster no.
- Usare il vuoto della carta per far riposare il giallo.
- Tenere la lamina a tre usi.
- Provare ogni schermata su tutte e quattro le carte (e con `?gl=0`).

### Don't

- Niente crema, avorio, nero + rosso, serif, corsivo, monospace, condensato.
- Niente occhielli numerati, maiuscoletto spaziato, "Tav.", timbri, "dal 19..".
- Niente schede bianche con bordino, bento, tre colonne uguali.
- Niente fade-up: l'unico ingresso è la pressione, sui blocchi premuti.
- Niente filetti, onde o divisori tra le sezioni.
- Niente oro, lamina olografica, gradienti colorati, glow, testo sfumato
  fuori dalla lamina.
- Niente grana animata o velo di rumore sopra il testo.
- Niente cursore custom, niente bottoni magnetici.
- Niente informazione affidata solo al rilievo, alla luce o al colore della
  carta.
- Niente trattini lunghi nei testi visibili.

## 8. Responsive Behavior

### Breakpoint

| Nome | Da | Cosa cambia |
|---|---|---|
| s | 0 | margini 20 / 20, 4 colonne, parola hero wdth 100, H2 wdth 100, segnapagina in basso |
| m | 600 | margini da libro 1u / 2u, 8 colonne, parola hero wdth 125 |
| l | 1024 | 12 colonne, parola hero wdth 150, H2 wdth 110, indirizzo wdth 150, testata con voci |
| pagina max | 1680 | la gabbia smette di crescere |

(768-1023 usa ancora il segnapagina mobile: lo decide la UX, i token non
cambiano.)

### Touch

- Area minima 44 × 44; bottoni 52-56; leva 72; campi 56.
- Trascinare sulla carta muove la luce senza bloccare lo scroll verticale.

### 375 px

- La parola dell'hero è a larghezza piena dell'area viva (335 px) a wdth 100,
  61 px di corpo: grande, non tagliata, non sillabata.
- H1 30 px su tre righe al massimo, lead 18 px, bottone a larghezza piena.
- I pezzi di "Per chi" restano oggetti ruotati e sovrapposti, non una colonna
  di rettangoli.
- Le quattro carte diventano fasce orizzontali a vivo, alte 22svh.

### Zoom e contrasto alto

- Tutti i corpi sono in rem: zoom al 200% senza perdite.
- `forced-colors`: rilievi e lamina diventano testo di sistema, niente perso.
- `prefers-contrast: more`: la scritta a secco diventa inchiostro.

## 9. Agent Prompt Guide

### Riferimento rapido dei colori

- Fondo (default): "Citrino `#E4CF3F`, giallo carta un po' spento, mai limone"
- Testo: "verde notte `#17231D`" (su Cipria "bruno notte `#231518`", su
  Grafite "inchiostro bianco `#ECEBE6`")
- Luce del rilievo Citrino: `#F5E97E`; ombra del rilievo Citrino: `#9C8A1E`
- Accento unico: "lamina argento `#C8CDD2`, satinata, ferma"
- Carte alternative: Cotone `#F1F1EE`, Cipria `#E8B9B3`, Grafite `#2A2C2F`

### Prompt d'esempio per componenti

- "Hero a tutta pagina su carta Citrino `#E4CF3F`: la parola *impronta* in
  Anybody wdth 150 peso 900, minuscola, larga esattamente quanto l'area viva
  tra un margine sinistro di 86 px e un destro di 173 px, stampata a secco
  (stesso colore della carta, labbro chiaro `#F5E97E` in basso a destra,
  parete scura `#9C8A1E` in alto a sinistra, 2 px). Sotto, H1 Anybody wdth 100
  peso 700 50 px in verde notte `#17231D`, due righe; sottotitolo Hanken 21 px;
  un solo bottone 'Prova la tua' in lamina argento a raggio 0 con filo 1 px
  verde notte."
- "Tre cartoncini appoggiati su un foglio giallo: una partecipazione rosa
  cipria ruotata di -2° con i nomi a secco, un biglietto bianco cotone ruotato
  di 1,5° con il nome in lamina argento, una copertina grafite ruotata di
  -0,5° con il titolo in inchiostro bianco. Costa di 1-2 px del colore della
  carta, ombra di appoggio corta tinta di giallo scuro. Nessun bordo, nessuna
  scheda."
- "Campo di testo su carta Cipria: etichetta sopra in Hanken 16 / 600 bruno
  notte, campo alto 56 px con fondo `#F7D8D3`, filo inferiore 1 px bruno
  notte, raggio 0; errore sotto con '!' e bordo 3 px, niente rosso."

### Guida all'iterazione

1. Una sezione alla volta, e sempre controllata su tutte e quattro le carte.
2. Se una cosa sembra piatta, si aumenta la luce radente o il vuoto intorno,
   non si aggiunge colore.
3. Se una cosa sembra "demo WebGL", si riducono profondità e contrasto del
   rilievo.
4. Se il giallo stanca, più carta vuota e blocchi d'inchiostro più compatti,
   mai un secondo colore.
5. Coprire con la mano la parola gigante: se quello che resta è ancora un
   biglietto ben composto, la pagina è giusta.
