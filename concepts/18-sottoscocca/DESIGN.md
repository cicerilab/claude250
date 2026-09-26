---
version: 1
name: SOTTOSCOCCA-officina-e-gommista
description: Sito di un'officina e gommista di Pordenone costruito attorno a un ponte sollevatore. Lo scroll alza l'auto, un'asta graduata dice a che altezza sei, i punti del sottoscocca si toccano per sapere prezzo e tempo sul ponte, e si prenota mettendo il proprio blocco in un buco del planning dei tre ponti. Tema unico scuro (il pavimento), verde macchina utensile sugli oggetti e sui pannelli, bianco segnaletica come unico accento, Tektur per quote, prezzi e targhette, Red Hat Text per leggere. Spigolo vivo ovunque tranne i punti, che sono tamponi di gomma tondi.

colors:
  nero: "#1C1D1B"
  nero-alto: "#2A2C29"
  verde: "#5E7564"
  verde-ombra: "#44584A"
  bianco: "#F0EFE9"
  bianco-premuto: "#D9DBD3"
  zincato: "#A3AAA4"
  gesso: "#CDD2CB"

typography:
  marchio:
    fontFamily: Tektur
    fontSize: 45px → 92px (e mai oltre la misura del banco / 6,94)
    fontWeight: 700
    fontStretch: 100%
    lineHeight: 0.92
    letterSpacing: 0
    textTransform: uppercase (solo la parola SOTTOSCOCCA)
  quota:
    fontFamily: Tektur
    fontSize: 96px → 192px
    fontWeight: 600
    fontStretch: 80%
    lineHeight: 0.84
    letterSpacing: -0.01em
    fontVariantNumeric: tabular-nums
  cartellino:
    fontFamily: Tektur
    fontSize: 64px → 120px
    fontWeight: 700
    fontStretch: 80%
    lineHeight: 0.9
  giorno:
    fontFamily: Tektur
    fontSize: 32px → 40px
    fontWeight: 600
    fontStretch: 85%
    lineHeight: 1
  titolo-2:
    fontFamily: Tektur
    fontSize: 30px → 48px
    fontWeight: 600
    fontStretch: 100%
    lineHeight: 1.02
    letterSpacing: -0.01em
  titolo-3:
    fontFamily: Tektur
    fontSize: 22px → 28px
    fontWeight: 600
    fontStretch: 100%
    lineHeight: 1.1
  prezzo:
    fontFamily: Tektur
    fontSize: 24px → 32px
    fontWeight: 600
    fontStretch: 85%
    lineHeight: 1
  targhetta:
    fontFamily: Tektur
    fontSize: 20px
    fontWeight: 500
    fontStretch: 90%
    lineHeight: 1.15
  bottone:
    fontFamily: Tektur
    fontSize: 20px
    fontWeight: 600
    fontStretch: 100%
    lineHeight: 1
  numerale:
    fontFamily: Tektur
    fontSize: 14px (wdth 80, telefono) / 15px (wdth 100, da 768)
    fontWeight: 500
    note: solo cifre (asta, ore del planning), mai parole
  lead:
    fontFamily: Red Hat Text
    fontSize: 18px → 21px
    fontWeight: 400
    lineHeight: 1.45
  corpo:
    fontFamily: Red Hat Text
    fontSize: 17px → 18px
    fontWeight: 400
    lineHeight: 1.55
  piccolo:
    fontFamily: Red Hat Text
    fontSize: 15px → 16px
    fontWeight: 400
    lineHeight: 1.5
  nota:
    fontFamily: Red Hat Text
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
  etichetta:
    fontFamily: Red Hat Text
    fontSize: 15px → 16px
    fontWeight: 700
    lineHeight: 1.25
  bottone-testo:
    fontFamily: Red Hat Text
    fontSize: 16px → 17px
    fontWeight: 700
    lineHeight: 1.2
  campo:
    fontFamily: Red Hat Text
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.3

rounded:
  none: 0px
  punto: 50%

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
  margine: 16px (telefono) / 32px (768) / 48 → 64px (da 1024)
  corsia-asta: 48px (telefono) / 64px (768) / 96px (da 1024)
  canalino: 16px / 20px / 24px
  colonne: 4 / 8 / 12
  banco: tutta la larghezza utile (telefono) / 52% (768) / c1-c5, max 576px (da 1024)

components:
  bottone-principale:
    backgroundColor: "{colors.bianco}"
    textColor: "{colors.nero}"
    typography: "{typography.bottone}"
    rounded: "{rounded.none}"
    height: 48px (56px nell'apertura)
  bottone-contorno:
    backgroundColor: transparent
    textColor: "{colors.bianco}"
    border: 2px inset "{colors.bianco}"
    typography: "{typography.bottone-testo}"
    rounded: "{rounded.none}"
    height: 44px (48px nelle schede)
    pressed: backgroundColor "{colors.bianco}", textColor "{colors.nero}"
  pannello:
    backgroundColor: "{colors.verde-ombra}" + vernice martellata
    textColor: "{colors.bianco}"
    secondaryText: "{colors.gesso}"
    rounded: "{rounded.none}"
  punto:
    size: 44px area, 26px cerchio
    backgroundColor: "{colors.verde}"
    ring: 2px "{colors.bianco}" + alone 2px "{colors.nero}"
    active: backgroundColor "{colors.bianco}"
    rounded: "{rounded.punto}"
  blocco-tuo:
    backgroundColor: "{colors.bianco}"
    textColor: "{colors.nero}"
    rounded: "{rounded.none}"
  blocco-occupato:
    backgroundColor: "{colors.nero}"
    textColor: "{colors.zincato}"
    border: 1px inset "{colors.zincato}"
  campo:
    backgroundColor: "{colors.nero}"
    textColor: "{colors.bianco}"
    border: 1px "{colors.zincato}", filo inferiore 2px "{colors.bianco}"
    height: 56px
---

# SOTTOSCOCCA · Design system

Concept 18 del Concept Lab di CiceriLab, rotta `/concept-18`. Documento di
riferimento per section-builder, webgl-artist, shader-engineer, motion e
interaction. I valori vivono in
`src/pages/concepts/sottoscocca/styles/tokens.css` (variabili `--ssc-*` su
`.ssc-root`) e `tokens.ts` (stessi valori in TS, con le tre forme dei colori
per three). Contrasti calcolati, misure dei font e prove a schermo in
`docs/art-director.md`.

## 1. Visual Theme & Atmosphere

Il sito è **il pavimento di un'officina ordinata**, visto con la luce dei neon
accesa. Nero grasso sotto, oggetti verniciati a fuoco in verde macchina
utensile (colonne del ponte, bracci, l'auto stessa come un modellino tecnico),
e il bianco delle linee a terra che delimitano le postazioni. Niente buio da
film, niente lampada che rivela: tutto è illuminato e leggibile, come quando il
meccanico ti chiama sotto l'auto per farti vedere il pezzo.

Il sito ha **una sola misura: l'altezza del ponte**, in centimetri. È il suo
display: "80 cm" enorme in Tektur stretto è il titolo di una schermata, non un
occhiello. Tutto il resto è la lavagna del capofficina: prezzi, minuti, misure
delle gomme, tre corsie di planning.

**Caratteristiche chiave**
- Tema unico scuro, bloccato. Nessuna sezione chiara, nessun cambio di tema.
- Il verde sta sugli **oggetti** (scena) e sui **pannelli** (verde ombra); mai
  come campo pieno di fondo.
- Il bianco segnaletica pieno come superficie vuol dire sempre **"il tuo"** o
  **"fai questo"**: il bottone principale, il tuo blocco nel planning, il lavoro
  che hai aggiunto, il punto che hai toccato, l'indice della quota dove sei.
  Occupa meno del 3% della finestra in ogni schermata.
- Tektur (variabile, `wdth` 75-100) per ciò che si legge come targhetta
  rivettata: quote, prezzi, tempi, titoli, nomi dei ponti. Red Hat Text per
  leggere.
- Spigolo vivo ovunque, come lamiera tagliata. Gli unici tondi sono i punti
  toccabili, perché sono i tamponi di gomma dei bracci.
- Due soli segni grafici: la **linea a terra** (striscia bianca larga) e
  l'**asta graduata**. Nessun filetto decorativo, nessun divisore.
- Una sola texture: la **vernice martellata** dei banchi e delle macchine
  utensili, quasi invisibile, solo sui pannelli verdi.

## 2. Color Palette & Roles

### I cinque della direzione e i tre derivati

| Variabile | Hex | Nome | Ruolo |
|---|---|---|---|
| `--ssc-nero` | `#1C1D1B` | nero grasso | fondo pagina, pavimento, clear color del GL, blocchi occupati, fondo dei campi, testo sui bianchi |
| `--ssc-nero-alto` | `#2A2C29` | nero rialzato | superficie appena sopra il pavimento: giorni della striscia, fascia "passato", hover su nero |
| `--ssc-verde` | `#5E7564` | verde macchina utensile | oggetti della scena (ponte, carrozzeria, pezzi), centro dei punti; nel DOM solo testo **grande** su nero |
| `--ssc-verde-ombra` | `#44584A` | verde in ombra | pannelli con testo: quote, scheda del punto, barra "Il tuo lavoro", corsie del planning |
| `--ssc-bianco` | `#F0EFE9` | bianco segnaletica | testo, linee a terra, asta, tratteggio dei buchi, "il tuo", bottone principale, fuoco |
| `--ssc-bianco-premuto` | `#D9DBD3` | bianco premuto | superficie bianca in hover o premuta |
| `--ssc-zincato` | `#A3AAA4` | zincato | tacche minori, numeri dell'asta, testo secondario **solo su nero**, bordi dei campi e dei blocchi occupati, metallo nella scena |
| `--ssc-gesso` | `#CDD2CB` | gesso della lavagna | testo secondario **solo sui pannelli verde ombra** (aiuti sotto i campi, "da", didascalie) |

Lo zincato della direzione (`#9AA19B`) è schiarito a `#A3AAA4`: così il bordo
di 1 px dei blocchi occupati sulla corsia verde ombra arriva a 3,23:1 (prima
2,90) e il testo secondario su nero a 7,13:1.

### Ruoli (nei componenti si usano questi, non i colori nudi)

`--ssc-fondo`, `--ssc-testo`, `--ssc-testo-secondario` (su nero),
`--ssc-pannello`, `--ssc-pannello-testo`, `--ssc-pannello-secondario` (su
verde ombra), `--ssc-azione`, `--ssc-azione-premuta`, `--ssc-su-azione`,
`--ssc-occupato`, `--ssc-occupato-bordo`, `--ssc-occupato-testo`,
`--ssc-passato`, `--ssc-corsia`, `--ssc-campo-fondo`, `--ssc-campo-bordo`,
`--ssc-campo-filo`, `--ssc-velo-hover`, `--ssc-selezione-fondo/-testo`.

### Veli sopra la scena

| Variabile | Valore | Dove |
|---|---|---|
| `--ssc-velo-targhetta` | nero al 90% | fondo dell'asta, etichette dei punti, indice di quota: il testo resta AA anche sopra un pezzo evidenziato in bianco |
| `--ssc-velo-apertura` | nero 88% → 82% → 0 dal basso (telefono fino al 55% dell'altezza, da 768 fino al 34%) | sotto il testo dell'apertura, sopra la scena |
| `--ssc-velo-apertura-laterale` | nero 60% → 0 da sinistra al 48% | insieme al precedente, solo nell'apertura |

### Stati

- **Fuoco**: anello bianco 2 px a 3 px di distanza, e la distanza riempita di
  nero grasso (`box-shadow: var(--ssc-fuoco-alone)`), così l'anello si stacca
  da qualunque fondo, anche da un pezzo bianco o da una linea a terra.
- **Hover** su superfici bianche: `--ssc-bianco-premuto`. Su bottoni a contorno:
  `--ssc-velo-hover` (bianco al 10%). Niente cambi di colore di grandi superfici.
- **Premuto** (`:active`): `translateY(1px)`, niente ombra.
- **Scelto / aggiunto** (aria-pressed, giorno scelto): pieno bianco con testo
  nero, **più una parola** ("Nel tuo lavoro", "scelto"). Mai solo il colore.
- **Errore**: nessun rosso. Contorno **tratteggiato bianco** 2 px, frase sotto
  in Red Hat 700, `aria-invalid`. Il blocco che non ci sta torna tratteggiato.
- **Disabilitato**: opacità 0,45 e una frase che dice perché.
- **Non adatto** (corsie del planning mentre trascini): opacità 0,4; il motivo
  è scritto fuori dalla corsia, a opacità piena.
- **Selezione del testo**: fondo bianco, testo nero.

### Divieti di colore

- Nessun colore d'accento in più: niente arancio, giallo, rosso, azzurro.
- Nessun semaforo verde/giallo/rosso di stato (era il bocciato).
- Niente testo corrente sul verde pieno (4,34:1): sul verde solo testo da 24 px
  in su o 19 px bold.
- Niente zincato come testo sui pannelli verdi (2,9:1): lì il secondario è gesso.
- Niente nero puro, niente bianco puro, niente sfumature decorative.
- Niente colori della texture Kenney nella scena.

## 3. Typography Rules

### Famiglie

1. **Tektur** (Google Fonts, variabile, `wdth` 75-100 e `wght` 400-900, un
   solo woff2 latin da 19 KB). La larghezza si scrive con **`font-stretch`**
   (mai `font-variation-settings`): così il ripiego giusto si sceglie da solo.
   Per quote, prezzi, tempi, titoli, marchio, nomi dei ponti, bottone
   principale. Mai sotto 20 px per le parole; 14-15 px solo per numerali
   (asta, ore). Mai corsivo, mai maiuscolo spaziato come etichetta.
2. **Red Hat Text** (variabile `wght` 300-700, un woff2 latin da 30 KB, caricato
   come gamma 400..700). Per leggere: corpo, campi, bottoni secondari, note,
   piede. Numeri tabellari in listini e planning.

Nessun monospace, nessun serif, nessun condensato maiuscolo tipo Teko, Barlow,
Oswald. Tektur stretto (80-85) si usa solo per **cifre** e per prezzi: le
parole stanno a 90-100.

### Gerarchia (375 → 1440, lineare in mezzo, ferma fuori)

| Voce | Famiglia | Corpo | wdth | wght | Interlinea | Dove |
|---|---|---|---|---|---|---|
| `marchio` | Tektur, maiuscolo | 45 → 92 (mai oltre banco / 6,94) | 100 | 700 | 0,92 | `h1` dell'apertura; riempie la misura |
| `quota` | Tektur | 96 → 192 | 80 | 600 | 0,84 | "20", "80", "180" nei pannelli; "cm" a 0,3 em wdth 100 wght 500 |
| `cartellino` | Tektur | 64 → 120 | 80 | 700 | 0,9 | numero di deposito "D-214" |
| `giorno` | Tektur | 32 → 40 | 85 | 600 | 1 | numero del giorno nella striscia |
| `titolo-2` | Tektur | 30 → 48 | 100 | 600 | 1,02 | `h2` di sezione |
| `titolo-3` | Tektur | 22 → 28 | 100 | 600 | 1,1 | `h3`, titolo della scheda |
| `prezzo` | Tektur | 24 → 32 | 85 | 600 | 1 | "da 90 €", durate nella scheda |
| `targhetta` | Tektur | 20 | 90 | 500 | 1,15 | "Ponte 1 · due colonne · 3500 kg", cifre nelle tabelle |
| `bottone` | Tektur | 20 | 100 | 600 | 1 | "Trova un buco", "Metti in ponte" |
| `numerale` | Tektur | 14 (wdth 80) / 15 da 768 | 80 / 100 | 500 | 1 | numeri dell'asta, ore del planning |
| `lead` | Red Hat | 18 → 21 | | 400 | 1,45 | frase dell'apertura, prima riga di un pannello |
| `corpo` | Red Hat | 17 → 18 | | 400 (700 per il forte) | 1,55 | testo |
| `piccolo` | Red Hat | 15 → 16 | | 400 | 1,5 | didascalie, aiuti, piede |
| `nota` | Red Hat | 14 | | 500 | 1,4 | minimo assoluto: etichette dei blocchi, giorni |
| `etichetta` | Red Hat | 15 → 16 | | 700 | 1,25 | etichette dei campi, intestazioni di tabella, etichette dei punti |
| `bottone-testo` | Red Hat | 16 → 17 | | 700 | 1,2 | bottoni a contorno |
| `campo` | Red Hat | 17 | | 400 | 1,3 | input (mai sotto 16: zoom iOS) |

Variabili: `--ssc-t-<voce>` (corpo), `--ssc-t-<voce>-wdth`, `-wght`, `-lh`.
Giustezza del corpo `--ssc-giustezza: 60ch`.

### Regole

- **La quota è il titolo visivo, l'`h2` è il titolo vero.** La cifra è
  `aria-hidden`, sta sopra l'`h2`, ed è sempre seguita dalla sua **linea a
  terra** (vedi 4). Mai due cifre giganti nella stessa finestra.
- Il marchio è l'unica parola in maiuscolo del sito. Il resto in minuscolo con
  iniziale maiuscola dove serve.
- Cifre sempre tabellari (`font-variant-numeric: tabular-nums`) in quote,
  prezzi, tempi, asta, ore, cartellino.
- I minuti si scrivono col primo (`40'`) solo nelle tabelle e nel planning; nel
  testo "40 minuti". Il punto mediano al massimo uno per riga.
- Il segno ✓ **non esiste** né in Tektur né in Red Hat Text: non usarlo (lo
  stato si dice con le parole) o usare l'icona SVG del vector-artist.
- `max-width` delle frasi brevi in `em`, non in `ch`: il `ch` cambia tra font
  vero e ripiego e fa andare a capo una riga in più (misurato).

### Ripiego dei font (niente salti)

`tokens.css` dichiara quattro `@font-face` locali su Arial / Liberation Sans,
tarati con fontTools e verificati in Chromium bloccando i woff2: altezze di
pannelli, tabelle e paragrafi **identiche al pixel**, larghezze entro il 4%.
- `Ssc Red Hat Ripiego` (400-600: `size-adjust` 100,1%; 700: 102,2%);
- `Ssc Tektur Ripiego` largo (`font-stretch` 92,5-100%: 102,5%) e stretto
  (75-92%: 90%), scelto dal browser in base a `font-stretch`;
- `Ssc Marchio Ripiego` (87,6%): solo per SOTTOSCOCCA in maiuscolo, perché le
  maiuscole di Arial sono il 17% più larghe di quelle di Tektur. Il marchio
  usa `--ssc-font-marchio`.

Pile: `--ssc-font-tecnico`, `--ssc-font-testo`, `--ssc-font-marchio`.

## 4. Component Stylings

### Bottone principale (un solo intento: "Trova un buco"; invio: "Metti in ponte")

- Fondo `--ssc-azione` (bianco), testo `--ssc-su-azione` (nero), Tektur 20 /
  600 / wdth 100, una riga, raggio 0.
- Altezza `--ssc-controllo` 48 px (56 nell'apertura), padding orizzontale 24 px
  (32 nell'apertura), larghezza piena a 375 dove l'ux lo chiede.
- Hover `--ssc-azione-premuta`; `:active` `translateY(1px)`; fuoco come §2.
- Niente icone, niente frecce, niente ombra, niente pillola. Mai due bottoni
  principali nella stessa vista (la testata nasconde il suo quando quello
  dell'apertura è visibile).

### Bottone a contorno (elenco "Da qui si vede", "Aggiungi al lavoro", "Chiudi", "10' prima")

- Trasparente, contorno bianco 2 px **interno** (`box-shadow: inset`), testo
  bianco Red Hat 16-17 / 700, altezza minima 44 px, raggio 0.
- Interruttore (`aria-pressed="true"`): pieno bianco, testo nero, e la parola
  cambia ("Nel tuo lavoro, togli").
- Hover: `--ssc-velo-hover`.

### Link

Bianco, sottolineatura 1 px a 0,2 em; hover 2 px. Link esterni con l'icona del
vector-artist. Nella testata la voce corrente ha la sottolineatura 2 px e
`aria-current`.

### Testata

- Alta `--ssc-testata` (56 telefono, 64 da 768). Trasparente sull'apertura,
  **nero grasso pieno** dopo (cambio di fondo, niente riga né ombra).
- Marchio Tektur 16-18 / 700 in maiuscolo (`--ssc-font-marchio`); link Red Hat
  16 / 500.
- Da 640 px comincia a x 272 (zona del bottone di ritorno); sotto, a 16 px.

### Asta graduata

- Una riga verticale larga `--ssc-asta` (32 / 40 / 48) su fondo
  `--ssc-velo-targhetta`, fissa a destra, livello `--ssc-z-asta`.
- Tacche ogni 10 cm: zincato, 8 × 2 px, allineate al bordo destro; ogni 50 cm:
  bianco, 16 × 2 px, con il numero (`numerale`, zincato) a sinistra della tacca.
  Sul telefono i numeri stanno **dentro** la riga da 32 px (14 px, wdth 80).
- Indice: triangolo bianco + numero corrente in Tektur 20 / 600 / wdth 85 su
  nero pieno, arrotondato ai 5 cm. Da 768 sta a sinistra dell'asta; **sul
  telefono sta sopra l'asta stessa** (etichetta 32 × 24) per non entrare nella
  colonna del testo.
- Le quote 0, 20, 80, 180 sono link con area 44 × 44 allineata alla tacca.
- Dopo la prenotazione: tacca "il tuo ponte" in bianco pieno a sinistra dello 0.

### Punto toccabile (tampone)

- `<button>` 44 × 44 (`--ssc-punto-area`) con dentro un cerchio di 26 px
  (`--ssc-punto-cerchio`): centro verde, anello bianco 2 px interno, alone nero
  2 px esterno. È l'unico oggetto tondo del DOM.
- Attivo (scheda aperta su quel punto): centro bianco pieno.
- Etichetta: targhetta a destra del cerchio, fondo `--ssc-velo-targhetta`,
  Red Hat 15-16 / 700 bianco, padding 4 × 8, raggio 0. Sempre visibile a 180
  cm; alle quote basse solo al fuoco e al passaggio.
- Linea di richiamo (punto agganciato al bordo della zona): 1 px bianco.

### Pannello di quota (quote 20, 80, 180)

- Fondo `--ssc-pannello` + `--ssc-martellata` (`background-size:
  var(--ssc-martellata-misura)`), padding `--ssc-pannello-padding` (20 / 28 /
  32), larghezza `--ssc-banco`, raggio 0, nessun bordo, nessuna ombra.
- Ordine: cifra `quota` con "cm" → **linea a terra** (bordo inferiore
  `--ssc-linea-terra` 4/6 px bianco, larga quanto il pannello, 12 px sotto la
  cifra) → `h2` → corpo → dati → elenco "Da qui si vede".
- Tabelle: intestazioni `etichetta` con filo 1 px gesso sotto; righe separate
  da un filo 1 px nero al 35%; cifre in `targhetta`. Nessuna riga zebrata.
- Secondario (didascalie, "Convergenza 45 €") in `--ssc-pannello-secondario`.

### Scheda del punto

- Stesso materiale del pannello (verde ombra + martellata), 400 px a 1440,
  foglio dal basso fino al 55% sul telefono (padding inferiore 88 px per la
  zona del bottone di ritorno), livello `--ssc-z-pannelli`.
- Testa: `h3` Tektur + "Chiudi" a contorno 44 × 44. Ogni lavoro: nome in Red
  Hat 700, "da 90 €" in `prezzo` con la durata in `piccolo` gesso sulla stessa
  riga di base, bottone interruttore "Aggiungi al lavoro". Tra i lavori un filo
  1 px nero al 35%.

### Barra "Il tuo lavoro"

- Verde ombra pieno (senza martellata: è piccola), alta 64 (56 telefono),
  raggio 0. "Il tuo lavoro" in gesso `piccolo`, il riepilogo in Tektur 20 / 600
  ("Tagliando + pastiglie · 2 h 30"), a destra il bottone principale.
- Mai nella zona del bottone di ritorno (72 px in basso a sinistra sotto 640).

### Striscia dei giorni

- Caselle 96 × 72 su `--ssc-nero-alto`, raggio 0. Giorno della settimana in
  `nota`, numero in `giorno`. Scelto: contorno bianco 2 px interno +
  `aria-checked`. Pieno: numero e parola "pieno" in zincato. Sabato: "solo
  gomme" in `nota`.

### Planning dei tre ponti

- Corsia: `--ssc-corsia` (verde ombra), alta 88 px (desktop) o colonna da 96 px
  (telefono), raggio 0, 8 px tra le corsie.
- Etichetta della corsia: `targhetta`, "Ponte 1 · due colonne · 3500 kg".
- **Occupato**: `--ssc-occupato` (nero) con bordo interno 1 px zincato, tipo di
  lavoro in `nota` zincato in alto a sinistra. Mai nomi o targhe.
- **Libero**: la corsia scoperta con una **linea tratteggiata bianca a terra**
  (2 px, tratto 10, vuoto 6: `--ssc-tratteggio-orizzontale` o `-verticale`)
  sul bordo inferiore (desktop) o sinistro (telefono), orario o durata scritti
  in `nota` bianco ("libero 9:30-11:10", "50'").
- **Passato** (oggi, prima di adesso + 60'): `--ssc-passato`, senza testo.
- **Chiuso** (pausa): fascia fissa di 40 px nero grasso con "chiuso" in `nota`
  zincato; non è in scala.
- **Il tuo blocco**: pieno bianco, testo nero ("il tuo lavoro" in `nota` 700 +
  orario in Tektur 20 / 600). Parcheggiato o rifiutato: fondo trasparente con
  contorno **tratteggiato** bianco 2 px e la stessa scritta in bianco.
  Inviato: da tratteggiato a pieno (400 ms, motion).
- Ore: asse con `numerale` zincato e tacche come l'asta (linea 2 px zincato).
- Corsie non adatte: opacità `--ssc-opacita-corsia-no`.

### Campi

- Etichetta sopra (`etichetta`), campo alto 56 px, fondo `--ssc-campo-fondo`,
  bordo 1 px `--ssc-campo-bordo`, **filo inferiore 2 px bianco**, raggio 0,
  testo `campo`. Aiuto sotto in `piccolo` gesso (su pannello) o zincato (su nero).
- Errore: bordo tratteggiato bianco 2 px tutto intorno + frase sotto in Red Hat
  700 bianco. Niente rosso, niente icone di avviso.
- Placeholder mai come etichetta; se c'è, zincato.

### Cartellino del deposito

- Rettangolo nero grasso con bordo interno 2 px zincato (il cartoncino appeso
  alla gomma), numero in `cartellino` bianco, sotto "la tua targa" in `nota`
  zincato. Nessuna rotazione, nessun buco disegnato, nessuna corda.

### Foto vere (deposito, officina, fallback)

- Mai cornici, mai didascalie sovrapposte, mai testo sopra la foto.
- Trattamento in CSS, uguale per tutte (non si "cuoce" nei file):
  ```css
  .ssc-root .ssc-<sezione>__foto { position: relative; overflow: hidden; }
  .ssc-root .ssc-<sezione>__foto img { filter: var(--ssc-foto-filtro); }
  .ssc-root .ssc-<sezione>__foto::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background: var(--ssc-foto-velo);
    mix-blend-mode: var(--ssc-foto-velo-fusione);
    opacity: var(--ssc-foto-velo-opacita);
  }
  ```
  Saturazione al 40%, tinta spostata verso il verde (fusione `color` al 26%),
  un filo più scura. Provato su due foto sature (carrello rosso, gomme gialle e
  blu): i colori veri restano riconoscibili ma non gridano più.

## 5. Layout Principles

### La griglia: la pianta della postazione

Non colonne uguali da sito vetrina, ma la pianta di una postazione di
officina vista dall'alto, con tre zone per riga:

```
| margine | BANCO (si legge)   | POSTAZIONE (sta l'auto) |  CORSIA DELL'ASTA |
| 64      | c1-c5, max 576     | c6-c12, vuota di DOM    |  96, fuori griglia|
```

- **Banco**: la colonna dei pannelli e del testo. Sempre a sinistra, mai
  centrata. `--ssc-banco`.
- **Postazione**: lo spazio dell'auto. Nel DOM ci stanno **solo** i punti
  toccabili (e la scheda, che si apre dalla parte opposta al pezzo). Niente
  testo, niente immagini decorative.
- **Corsia dell'asta**: fuori griglia, fissa, larga `--ssc-corsia-asta`; il
  testo che scorre non ci entra mai (margine destro).

| | Telefono (< 768) | Tablet (768-1023) | Desktop (≥ 1024) |
|---|---|---|---|
| Colonne | 4 | 8 | 12 |
| Canalino | 16 | 20 | 24 |
| Margine sinistro | 16 | 32 | 48 → 64 |
| Corsia dell'asta | 48 | 64 | 96 |
| Asta | 32 | 40 | 48 |
| Banco | larghezza utile (311 a 375) | 52% della finestra | c1-c5 (519 a 1440), max 576 |
| Marchio | larghezza utile | banco | c1-c6 (628 a 1440) |

Variabili: `--ssc-colonne`, `--ssc-canalino`, `--ssc-margine`,
`--ssc-corsia-asta`, `--ssc-asta`, `--ssc-larghezza-utile`, `--ssc-colonna`,
`--ssc-banco`, `--ssc-misura-marchio`. Oltre 1680 px la griglia smette di
crescere; la scena no.

**Sul telefono la griglia è la lavagna**: nel planning verticale le colonne
sono la scala delle ore (`--ssc-planning-scala` 44 px) più tre corsie da
`--ssc-planning-corsia` 96 px, e l'asta si ritira. Le tabelle del listino a 375
usano la stessa divisione in tre (misura, prezzo, tempo).

### Ritmo verticale

- Scala a multipli di 4 (`--ssc-sp-1` 4 px … `--ssc-sp-10` 128 px), in rem.
- Dentro un pannello 8-24; tra blocchi di un pannello 24-32; tra sezioni decide
  lo scroll del ponte (plateau), non uno spazio fisso.
- Ogni pannello "sta in piedi" su una linea a terra: la cifra della quota ha
  sotto la sua striscia bianca, come l'auto sta sul pavimento.

### Segni ammessi

1. **Linea a terra**: striscia bianca piena `--ssc-linea-terra` (4 / 6 px).
   Solo sotto la cifra di quota. Nel planning diventa tratteggiata (buchi).
2. **Asta graduata** e il suo linguaggio di tacche (anche nell'asse delle ore).

Nient'altro: niente filetti tra sezioni, niente cornici, niente reticoli.

## 6. Depth & Elevation

Il sito è piatto come il pavimento; la profondità la dà solo la scena 3D.

| Livello | Variabile | Cosa |
|---|---|---|
| 0 | `--ssc-z-scena` | fondale (poster, foto del fallback) e canvas |
| 1 | `--ssc-z-contenuto` | sezioni, pannelli, testo |
| 2 | `--ssc-z-punti` | punti toccabili (dentro il contenuto) |
| 5 | `--ssc-z-asta` | asta graduata |
| 6 | `--ssc-z-pannelli` | scheda del punto, barra "Il tuo lavoro", mensola |
| 10 | `--ssc-z-testata` | testata |

Regole: nessuna ombra in tutto il DOM (né morbida né dura), nessun bagliore,
nessun `backdrop-filter`. Un pannello si stacca dalla scena per colore (verde
ombra pieno), non per ombra. Le sezioni **non** creano un contesto di
sovrapposizione (niente `z-index` su `.ssc-stazione`): altrimenti i fissi che
ci stanno dentro restano intrappolati sotto l'asta (verificato nella prova).

### Texture: vernice martellata

`--ssc-martellata`: un solo SVG `feTurbulence` statico (240 × 240, frequenza
0,28, tre ottave, opacità 0,12) che **solo scurisce**, fino all'11% nel punto
più scuro. Ricorda la vernice martellata di torni e banchi. Solo su pannelli e
scheda, mai su nero, mai sulla barra. Si spegne con `prefers-contrast: more` e
`forced-colors`. I contrasti sono calcolati anche sul punto più scuro.

### La scena (per webgl-artist e shader-engineer)

`SCENA` in `tokens.ts`: clear color e nebbia **nero** (uguale al byte al fondo
di `.ssc-root`), pavimento nero, linee a terra bianche, colonne, carrelli,
bracci, carrozzeria e pezzi **verdi**, tamponi e gomme **neri**, cerchi, fanali
e metallo **zincati**, vetri neri al 70%, targhetta zincata con "3500 kg" in
Tektur 600 nero, pezzo evidenziato **bianco**. Materiali opachi e piatti: la
faccia più illuminata della carrozzeria non supera di molto il verde di
palette, così il DOM e la scena parlano lo stesso colore.

## 7. Do's and Don'ts

### Do

- Usare solo variabili `--ssc-*` e, nei componenti, i ruoli.
- Mettere il bianco pieno solo su ciò che è "tuo" o "da fare", e contarlo:
  sotto il 3% della finestra.
- Scrivere la larghezza di Tektur con `font-stretch`.
- Far stare in piedi ogni cifra di quota sulla sua linea a terra.
- Dire gli stati a parole e col tratteggio, mai solo col colore.
- Provare ogni schermata a 375 e 1440, con `?gl=0` e senza font.

### Don't

- Niente arancio, antracite con accento acceso, condensato maiuscolo pesante,
  titolo con una parola colorata (il bocciato).
- Niente campo pieno di verde come fondo; niente verde acqua o brillante.
- Niente pillole, niente raggi: solo i punti sono tondi.
- Niente ombre, glow, gradienti decorativi, vetro smerigliato.
- Niente occhielli numerati, maiuscoletto spaziato, monospace, "TAV.",
  "dal 19..", riga di numeri tra filetti.
- Niente strisce gialle e nere, scacchi, contagiri, carbonio, cromature.
- Niente icone di chiavi inglesi, ingranaggi, pistoni.
- Niente testo corrente sul verde pieno; niente zincato sui pannelli verdi.
- Niente testo sopra le foto, niente cornici, niente duotone.
- Niente trattini lunghi nei testi visibili; niente ✓ (non c'è nei font).

## 8. Responsive Behavior

### Punti di rottura

| Nome | Da | Cosa cambia |
|---|---|---|
| telefono | 0 | 4 colonne, margini 16 / 48, asta 32 con numeri dentro, testata 56, linea a terra 4 px, numerali 14 px wdth 80, velo apertura alto |
| bottone di ritorno | 640 | il bottone del sito passa in alto a sinistra (zona 260 × 72); la testata parte da 272 |
| tablet | 768 | 8 colonne, margini 32 / 64, asta 40, testata 64 con Deposito e Officina, banco al 52%, linea a terra 6 px |
| planning orizzontale | 900 | il planning passa da colonne (tempo in verticale) a corsie (tempo in orizzontale) |
| desktop | 1024 | 12 colonne, banco c1-c5, marchio c1-c6, asta 48, corsia 96 |
| largo | 1680 | la griglia smette di crescere |
| bassa | altezza < 520 | niente fissi tranne l'indicatore di quota, niente pin (ux §7.10) |

### Touch

Area minima 44 × 44 ovunque (punti, giorni, "10' prima / dopo", link di quota);
bottoni 48-56; campi 56.

### 375 px

- Il marchio riempie la larghezza utile (311 px, 44,8 px di corpo), su una
  riga; con il font di ripiego resta a 301 px (misurato).
- La cifra di quota è 96 px ("180" largo 143 px con "cm"), la linea a terra 4
  px.
- I pannelli sono in flusso, a tutta larghezza utile; la scheda è un foglio dal
  basso.

### Zoom e contrasto

- Tutti i corpi in rem: zoom al 200% senza perdite; il marchio si ricalcola
  sulla misura (`min()`), non esce mai.
- `prefers-contrast: more`: gesso e zincato diventano bianco, niente
  martellata, velo delle targhette pieno.
- `forced-colors: active`: niente texture né veli; fuoco `Highlight`.

## 9. Agent Prompt Guide

### Riferimento rapido dei colori

- Fondo: "nero grasso `#1C1D1B`, quasi nero appena verde, opaco come il
  pavimento in resina"
- Oggetti: "verde macchina utensile `#5E7564`, il verde grigio dei torni"
- Pannelli: "verde ombra `#44584A` con vernice martellata appena visibile"
- Accento unico: "bianco segnaletica `#F0EFE9`, il bianco delle linee a terra"
- Secondari: zincato `#A3AAA4` (su nero), gesso `#CDD2CB` (su verde ombra)

### Prompt d'esempio

- "Pannello a sinistra largo 519 px su una scena scura di officina: fondo verde
  ombra `#44584A` a spigolo vivo, in alto la cifra '80' in Tektur wdth 80 peso
  600 a 192 px bianca `#F0EFE9` con 'cm' piccolo accanto, sotto una striscia
  bianca piena di 6 px larga quanto il pannello, poi 'Freni e sospensioni' in
  Tektur 48 px peso 600, un paragrafo in Red Hat Text 18 px, due bottoni a
  contorno bianco 2 px senza raggio."
- "Planning di tre corsie orizzontali alte 88 px su nero `#1C1D1B`: corsie
  verde ombra `#44584A`, blocchi occupati neri con bordo interno 1 px zincato
  `#A3AAA4` e la parola del lavoro in 14 px zincato, buchi liberi segnati da
  una linea tratteggiata bianca sul fondo della corsia con l'orario scritto,
  il blocco del visitatore pieno bianco con 'il tuo lavoro' e '14:00-15:30' in
  Tektur 20 nero. Etichette a sinistra: 'Ponte 1 · due colonne · 3500 kg' in
  Tektur 20 wdth 90."
- "Punto toccabile sopra una scena 3D: cerchio di 26 px con centro verde
  `#5E7564`, anello bianco 2 px e alone nero 2 px, dentro un'area di tocco di
  44 px; a destra una targhetta nera al 90% con 'Scarico' in Red Hat Text 16
  bold bianco."

### Guida all'iterazione

1. Se una schermata sembra un'app SaaS scura, manca il mestiere: più cifre di
   quota, più targhette in Tektur, meno testo.
2. Se sembra un videogioco, c'è troppo bianco o troppo verde pieno nel DOM:
   riportare il bianco sotto il 3% e il verde sugli oggetti.
3. Se una cosa ha bisogno di "più profondità", la risposta è la scena, non
   un'ombra.
4. Coprire la scena con la mano: il banco da solo deve essere un listino
   completo e leggibile.
