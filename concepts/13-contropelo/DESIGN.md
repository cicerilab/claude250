---
version: 1
name: CONTROPELO-barberia
description: Sito di una barberia di quartiere a Pordenone costruito come lo specchio del salone. Un solo schermo senza scroll, una parete di grafite verdastra con tre specchi affiancati (tre poltrone, tre barbieri). Dietro ogni vetro la foto vera del salone, specchiata e velata; sul vetro il listino, gli orari e la lista del giorno scritti a pennarello bianco in Mansalva; sopra, il vapore dell'asciugamano caldo in Canvas 2D, che si pulisce col dito e torna lento. Un solo colore, il turchese del disinfettante, con un solo significato, "qui c'è posto". Limelight per l'insegna e i nomi, Figtree per l'interfaccia. Raggio zero, nessuna ombra, nessuna card, nessuna illustrazione.

colors:
  specchio: "#232A2C"
  vapore: "#CDD5D4"
  turchese: "#2A9D96"
  turchese-vetro: "#4BC3BC"
  pennarello: "#FAFAF6"
  parete: "#171C1D"
  bisello: "#48555A"
  bisello-ombra: "#0E1213"
  su-turchese: "#171C1D"
  vapore-luce: "#E4EAE9"
  vapore-ombra: "#B9C2C1"
  riflesso-luce: "#343E41"

typography:
  nome:
    fontFamily: Mansalva
    fontSize: 28px → 40px (60px a 2560)
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: 0.004em
  titolo:
    fontFamily: Mansalva
    fontSize: 24px → 30px
    fontWeight: 400
    lineHeight: 1.12
  riga:
    fontFamily: Mansalva
    fontSize: 22px → 32px (44px a 2560)
    fontWeight: 400
    lineHeight: 1.12
  prezzo:
    fontFamily: Mansalva
    fontSize: 26px → 36px (50px a 2560)
    fontWeight: 400
    lineHeight: 1
  ora:
    fontFamily: Mansalva
    fontSize: 24px → 27px (36px a 2560)
    fontWeight: 400
    lineHeight: 1.12
  nota:
    fontFamily: Mansalva
    fontSize: 22px → 24px
    fontWeight: 400
    lineHeight: 1.12
  link-vetro:
    fontFamily: Mansalva
    fontSize: 24px → 26px
    fontWeight: 400
    lineHeight: 1.12
    textDecoration: underline 2px, offset 0.2em
  scelta:
    fontFamily: Mansalva
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.12
  campo:
    fontFamily: Mansalva
    fontSize: 26px → 30px
    fontWeight: 400
    lineHeight: 1.2
  chiuso:
    fontFamily: Mansalva
    fontSize: 64px → 96px
    fontWeight: 400
    lineHeight: 0.9
  insegna:
    fontFamily: Limelight
    fontSize: 22px → 28px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.015em
  barbiere:
    fontFamily: Limelight
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1
  ui:
    fontFamily: Figtree
    fontSize: 15px → 16px
    fontWeight: 400 (etichette 500)
    lineHeight: 1.45
  ui-piccolo:
    fontFamily: Figtree
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  bottone:
    fontFamily: Figtree
    fontSize: 15px → 17px
    fontWeight: 600
    lineHeight: 1.15

rounded:
  none: 0px

spacing:
  sp-1: 4px
  sp-2: 8px
  sp-3: 12px
  sp-4: 16px
  sp-5: 24px
  sp-6: 32px
  sp-7: 48px
  sp-8: 64px
  fascia: 48px (S) / 60px (M, L)
  mensola: 48px + 56px (S) / 88px (M, L)
  bordo-vicino: 12px (S) / 32px (M) / 86px (L)
  parete-gutter: 12px (S) / 16px (M) / 24px (L)
  vetro-pad: 20px (S) / 40px (M) / 56px (L)
  riga-lista: 44px (dito) / 40px (mouse) / 52px (2560)
  nicchia-lab: 212px in basso a sinistra (S) / 260px in alto a sinistra (M, L)

components:
  bottone-turchese:
    backgroundColor: "{colors.turchese}"
    textColor: "{colors.su-turchese}"
    typography: "{typography.bottone}"
    rounded: "{rounded.none}"
    height: 48px
  trattino-libero:
    stroke: "{colors.turchese-vetro}"
    strokeWidth: 4px
    length: 3.2em della riga
  campo:
    backgroundColor: transparent
    borderBottom: 2px solid {colors.pennarello} (3px tratteggiato in errore)
    textColor: "{colors.pennarello}"
    typography: "{typography.campo}"
    rounded: "{rounded.none}"
    height: 48px
  specchio:
    backgroundColor: "{colors.specchio}"
    bevel: 1px {colors.bisello} in alto e a sinistra, 1px {colors.bisello-ombra} in basso e a destra
    outline: 1px {colors.bisello-ombra}
    rounded: "{rounded.none}"
  riflesso:
    image: foto trattata (specchiata, saturazione 60%, alte luci tagliate a #A7AFAE, sfocatura 1,5px)
    overlay: "{colors.specchio}" al 66% (80% in vetrina lunga)
  pannello-vetro:
    backgroundColor: "{colors.specchio}" al 94%
    rounded: "{rounded.none}"
---

# CONTROPELO · Design system

Concept 13 del Concept Lab di Ciceri Lab, rotta `/concept-13`. Documento di
riferimento per tutti i section-builder. I valori vivono in
`src/pages/concepts/contropelo/styles/tokens.css` (CSS) e `tokens.ts` (TS e
canvas); la resa dei materiali in `styles/materia.css`. I numeri dei contrasti
e le prove a schermo sono in `docs/art-director.md`.

## 1. Visual Theme & Atmosphere

Sei seduto in poltrona e guardi lo specchio. Non è un sito scuro con una foto
sotto: è **un vetro**. Ha tre strati, e ogni strato ha una resa diversa:

1. **Il riflesso**, in fondo: la foto vera del salone, specchiata come in uno
   specchio, fredda, un po' sfocata (è dietro il vetro), coperta da una
   velatura grafite. Non si guarda mai da sola: si intuisce.
2. **Il pennarello**, sul vetro: bianco caldo `#FAFAF6`, nitido, in Mansalva.
   È l'unica cosa che si legge. Le scritte sono inclinate di un grado o due,
   come le fa una mano, e ogni specchio è stato scritto in un momento diverso.
3. **Il vapore**, sopra: grigio-verde `#CDD5D4`, più fitto in basso, con una
   grana ferma. Col dito lo togli, e torna piano.

Intorno al vetro c'è **la parete**: grafite più scura `#171C1D` con una grana
appena percettibile di intonaco. La fascia alta e la mensola sono parete; il
loro testo è piccolo, uniforme, in Figtree. Due registri e basta: il pennarello
grande sul vetro, l'interfaccia piccola sulla parete. Niente in mezzo.

Il **turchese** `#2A9D96` è il disinfettante dei pettini sul bancone. Compare
solo dove c'è posto per te: il trattino di una mezz'ora libera, la
sottolineatura del tuo nome, il tratto sotto il barbiere che hai davanti, il
fuoco da tastiera, il bottone "Scrivi il tuo nome". Sul vetro si usa una
versione più chiara `#4BC3BC` (il colore visto attraverso il vetro), sulla
parete quello della bottiglia. Nessuna superficie turchese è più grande del
bottone della mensola.

Temperatura: tutto freddo, verdastro. Niente marrone, niente oro, niente
crema, niente rosso, niente nero puro, niente bianco puro. Il tema è uno,
scuro, e non cambia con `prefers-color-scheme`: lo specchio è quello.

Dial: `DESIGN_VARIANCE` 8, `MOTION_INTENSITY` 4, `VISUAL_DENSITY` 3.

## 2. Color Palette & Roles

### I sei della parete e del vetro

| Token | Hex | Ruolo | Dove non va mai |
|---|---|---|---|
| `--ctp-specchio` | `#232A2C` | il vetro pulito; la velatura sopra la foto (66%); il fondo del pannello Informazioni (94%) | come testo |
| `--ctp-vapore` | `#CDD5D4` | il vapore (canvas) e l'alone fermo ai bordi | fondi di interfaccia, testo, bordi |
| `--ctp-turchese` | `#2A9D96` | bottone turchese, tratto del barbiere attivo (sulla parete) | testo, superfici più grandi del bottone |
| `--ctp-turchese-vetro` | `#4BC3BC` | trattini liberi, sottolineatura del tuo nome, cerchio e anello del fuoco, cursore di testo (sul vetro e sulla parete) | testo, fondi |
| `--ctp-pennarello` | `#FAFAF6` | tutto ciò che è scritto: pennarello sul vetro, insegna, nomi, testo di interfaccia, linee di base dei campi, link | fondi |
| `--ctp-parete` | `#171C1D` | la parete, la fascia, la mensola; il testo sul bottone turchese | sul vetro |

### Derivati (solo materia)

| Token | Hex | Ruolo |
|---|---|---|
| `--ctp-bisello` | `#48555A` | 1 px di luce in alto e a sinistra del vetro |
| `--ctp-bisello-ombra` | `#0E1213` | 1 px di ombra in basso e a destra, e il filo esterno del vetro |
| `--ctp-vapore-luce` | `#E4EAE9` | il filo d'acqua sul bordo di una traccia pulita; la testa di una goccia (canvas) |
| `--ctp-vapore-ombra` | `#B9C2C1` | la parte scura della grana del vapore (canvas) |
| `--ctp-riflesso-luce` | `#343E41` | piano C senza foto: la finestra alle spalle, banda verticale morbida |

### Trasparenze con ruolo

| Token | Valore | Ruolo |
|---|---|---|
| `--ctp-velatura` | specchio al 66% | sopra la foto trattata; con questa velatura e il tetto delle alte luci della foto, il pennarello resta ≥ 7:1 su ogni pixel |
| `--ctp-velatura-lunga` | specchio al 80% | vetrina lunga (altezza < 500 px, zoom 400%) |
| `--ctp-pannello-fondo` | specchio al 94% | pannello Informazioni |
| `--ctp-striscia-fondo` | parete al 96% | riga di stato su S, appoggiata al bordo basso del vetro |
| `--ctp-alone-bordo` / `--ctp-alone-interno` | vapore al 34% / 16% | alone fermo: al bordo, e a 14 px dal bordo dove può cominciare il testo |
| `--ctp-inchiostro-velo` | pennarello al 35% | sbavatura di 0,6 px del pennarello (text-shadow senza spostamento) |

### Stati

- **Posto libero**: trattino `turchese-vetro` di 4 px, disegnato (SVG del
  vector-artist), lungo 3,2 em. Mai un pallino, mai un chip.
- **Il tuo nome**: pennarello come gli altri, sottolineato `turchese-vetro`
  3 px.
- **Mezz'ora passata**: pennarello a opacità 0,62, nessun nome, nessun trattino.
- **Nome non arrivato**: pennarello a opacità 0,55, con il messaggio sotto.
- **Errore di campo**: linea di base 3 px tratteggiata, testo Figtree
  pennarello con icona Phosphor. Mai solo colore, mai rosso.
- **Fuoco**: anello `turchese-vetro` 2 px con 2 px di stacco, su vetro e su
  parete (interaction.css); sul vetro il vapore si pulisce attorno.
- **Selezione di testo**: fondo `turchese-vetro`, testo parete.

### Divieti di colore

Nessun rosso, nessun verde di "successo", nessun giallo di avviso: gli stati si
dicono con il testo, l'icona e il trattino. Nessun secondo accento. Nessun
gradiente colorato. Nessun bianco `#FFFFFF`, nessun nero `#000000`. Nessuna
superficie turchese più grande del bottone della mensola. Nessun turchese per
testo: il testo sul bottone è parete su turchese, non il contrario.

## 3. Typography Rules

### Famiglie

| Famiglia | Ruolo | Corpi | Mai |
|---|---|---|---|
| **Mansalva** 400 | tutto ciò che è scritto sul vetro: nomi dei barbieri in testa al vetro, titoli, listino, prezzi, la barba, orari, indirizzo, la lista, quello che digiti nei campi, "chiuso", i link sul vetro | 22-96 px (minimo 22 su 375, 24 per le ore della lista) | interfaccia, etichette, errori, testi legali, crediti; mai sotto 22 px; mai maiuscolo |
| **Limelight** 400 | l'insegna "Contropelo" e i tre nomi sulla mensola | 20-36 px | frasi, numeri (cifre larghissime), sotto 20 px |
| **Figtree** 400 / 500 / 600 | fascia e mensola, etichette dei campi, errori, riga di stato, testi lunghi del pannello Informazioni, bottoni | 14 / 15-16 / 15-17 px | sul vetro come scritta a mano |

Ripieghi metrici (`tokens.css`): Mansalva, Figtree e Limelight hanno ognuno un
`@font-face` locale su Arial / Liberation Sans con `size-adjust`,
`ascent-override`, `descent-override` tarati con fontTools sui woff2 veri, così
listino e lista non si spostano quando arrivano i font.

### Gerarchia

Sul vetro, per specchio, dall'alto: nome del barbiere (`--ctp-t-nome`, h2) >
titolo del vetro e giorno della lista (`--ctp-t-titolo`, h3) > prezzi
(`--ctp-t-prezzo`, più grandi delle voci: è ciò che si cerca) > voci, righe
della barba, orari (`--ctp-t-riga`) > righe della lista (`--ctp-t-ora`) > link
sul vetro (`--ctp-t-link`) > la riga sul barbiere (`--ctp-t-nota`).

Sulla parete: nomi dei barbieri (Limelight 20) > bottone turchese (Figtree 600)
> interruttore e riga di stato (Figtree 15-16) > "barberia, Pordenone" e
suggerimento del gesto (Figtree 14). Tre corpi di Figtree in tutto il sito.

### Mansalva: numeri e prezzi

Mansalva non ha cifre tabellari (larghezze da 457 a 700 su 1000: il "5" è il
più largo, il "3" il più stretto) e ha la x bassa (384/1000). Regole:

- ogni prezzo sta in una colonna a larghezza fissa `--ctp-prezzo-col`
  (1,45 × corpo del prezzo) e si allinea a destra da solo: `.ctp-colonna-prezzi`
  è una griglia `minmax(0, 1fr) var(--ctp-prezzo-col)`, `.ctp-prezzo` con
  `justify-self: end` e `white-space: nowrap`. Niente puntini, niente linee;
- il listino ha una larghezza massima `--ctp-listino-max` (30 rem a 1440,
  44 rem a 2560) così i prezzi restano vicini alle voci;
- le ore della lista sono in una colonna di 3,2 em; "10:30" misura 2,6 em;
- niente `font-variant-numeric`: non fa nulla; `calt` e `liga` restano accesi
  (variano la forma delle lettere ripetute: è la mano).

### Principi

- Niente maiuscoletto spaziato, niente occhielli, niente "01", niente
  monospace, niente corsivo, niente grassetto in Mansalva (non esiste, non si
  sintetizza: `font-synthesis: none`).
- Il testo sul vetro non scende sotto 22 px a 375 e non va mai a meno di
  20 px dal bordo del vetro (`--ctp-vetro-pad`), dove l'alone fermo vale al
  massimo il 16%.
- I link sul vetro ("Apri in Maps", "Chiama", "la lista", "domani") sono
  pennarello sottolineato 2 px, non turchese: il turchese è "posto libero".
- Trattini lunghi mai; ranges con trattino corto ("8:30-12:30").

### Rotazioni delle scritte

`rotate` (proprietà singola, così non litiga con i `transform` del motion) con
origine in alto a sinistra:

| Disposizione | Vetro | Lista |
|---|---|---|
| Affiancate, specchio 1 (Mattia) | -1,5° | +0,8° |
| Affiancate, specchio 2 (Denis) | -0,9° | +1,2° |
| Affiancate, specchio 3 (Samir) | -1,8° | +0,6° |
| Una faccia alla volta, M | -1° | +0,6° |
| Una faccia alla volta, S | -0,8° | +0,5° |
| Vetrina lunga | 0° | 0° |

I campi della riga di scrittura, le parole del servizio e "Segna" sono
sempre dritti (`rotate: 0deg` in `.ctp-campo`; il contenitore della riga di
scrittura annulla la rotazione della lista).

## 4. Component Stylings

### Lo specchio (`.ctp-bisello`)

Fondo `specchio`, spigolo vivo, filo esterno di 1 px `bisello-ombra`
(`box-shadow: 0 0 0 1px`), e un `::after` sopra tutto (quota del vapore) con il
bisello: `inset 1px 1px` di luce e `inset -1px -1px` di ombra. Il bisello resta
nitido a vapore pieno. Nessuna ombra portata: lo specchio è appeso alla parete,
non fluttua. I bordi degli specchi vicini usano la stessa classe: sono specchi
veri tagliati dal bordo dello schermo, con il loro riflesso e il loro vapore.

### Il riflesso (`.ctp-riflesso`)

`<img>` a `object-fit: cover` con `object-position` per specchio, sotto un
`::after` di velatura specchio al 66%. La foto arriva **già trattata** dal
photo-editor (ricetta in `tokens.ts` `RIFLESSO`): specchiata, saturazione 60%,
livelli con bianco d'uscita `#A7AFAE` (raffredda e taglia le alte luci in una
mossa), sfocatura 1,5 px sulla 1600 e 0,75 px sulla 800. Il pixel più chiaro
possibile, sotto velatura, è `#505758`: il pennarello lì fa 7,05:1.

`.ctp-riflesso--vuoto` (piano C, nessuna foto): niente immagine, una banda
verticale `riflesso-luce` fuori centro (58-92% della larghezza) che sfuma
dall'alto. Il sito regge anche così.

### Il pennarello (`.ctp-pennarello` + varianti)

Colore pennarello, Mansalva, `text-shadow: 0 0 0.6px` di pennarello al 35%
(la sbavatura sul vetro), `calt` e `liga` accesi. Varianti di corpo:
`--nome`, `--titolo`, `--ora`, `--nota`, `--link`, `--chiuso`. Stati:
`--passata` (0,62), `--fallito` (0,55). Inclinazione: `.ctp-scritta--vetro`,
`.ctp-scritta--lista`. La sezione mette il pennarello a `z-index` 1 sul suo
contenitore posizionato (il vetro), sotto il canvas.

### I segni turchesi (`.ctp-segno`)

SVG del vector-artist a `stroke: currentColor`, colore `turchese-vetro`,
estremi tondi. `--trattino`: 4 px. Sottolineatura del nome: 3 px, tracciata
con `stroke-dashoffset` (motion). Cerchio del fuoco su un posto libero: 2 px,
è una scritta a pennarello, non un componente.

### Il bottone turchese (`.ctp-bottone-turchese`)

Un solo tipo, per "Scrivi il tuo nome" (mensola) e "Segna" (riga di
scrittura). Fondo `turchese`, testo `parete` Figtree 600 15-17 px (5,21:1),
48 px di altezza, padding 24 px, raggio 0, nessuna ombra, nessun bordo. Al
passaggio il fondo diventa `turchese-vetro` (8,06:1), premuto si abbassa di
1 px (interaction.css). Sotto i 380 px "Scrivi il tuo nome" va su due righe
(interlinea 1,15) in 147 px: mai troncato. Il testo del bottone, misurato con
i woff2 veri, sta su una riga in 147 px da 380 px in su.

### I campi (`.ctp-campo`, `.ctp-etichetta`)

Nessuna scatola: fondo trasparente, linea di base pennarello 2 px, 48 px di
altezza, testo digitato già in Mansalva 26-30 px, cursore `turchese-vetro`.
Etichetta Figtree 500 sopra, sempre visibile (niente placeholder come
etichetta: il placeholder è trasparente). In errore (`aria-invalid="true"`) la
linea diventa 3 px tratteggiata e sotto compare `.ctp-messaggio` (Figtree,
pennarello) con icona Phosphor.

### Parole del servizio (taglio, barba, taglio e barba, rasatura)

Pennarello 24 px, area di tocco 44 px, nessuna scatola. La scelta si segna con
un **cerchio a pennarello turchese-vetro** attorno alla parola (SVG,
vector-artist), non con un fondo pieno. Accanto alla scelta compare il prezzo.

### Mensola

Parete. Tre nomi in Limelight 20 (`.ctp-insegna--barbiere`), area 44 px,
quello attivo con un tratto `turchese` di 3 px sotto (largo quanto il nome).
Interruttore "Specchio pulito": icona Phosphor Light + Figtree 15-16, senza
scatola, `aria-pressed`. La riga di stato e il suggerimento sono Figtree
14-16 pennarello. Sotto i 640 px la mensola ha due file: nomi (48 px) e, sotto
(56 px + area sicura), la nicchia del bottone Lab a sinistra (212 px, vuota) e
il bottone turchese a destra (147 px).

### Fascia alta

Parete, 48 px (S) / 60 px (M, L). Insegna "Contropelo" in Limelight e
"barberia, Pordenone" Figtree 14; su L/M a destra (la nicchia del bottone Lab
0-260 px resta vuota), su S a sinistra. Nessun menu.

### Pannello Informazioni (`.ctp-pannello-vetro`)

Sul vetro dello specchio attivo, fondo specchio al 94%, raggio 0, nessun bordo:
il barbiere ha passato lo straccio e lì il vetro è pulito e scuro. Titoli a
pennarello, testi lunghi in Figtree.

### Link

Sul vetro: pennarello sottolineato 2 px con offset 0,2 em. Sulla parete:
Figtree pennarello sottolineato 1 px. Mai turchese.

## 5. Layout Principles

### Gabbia: una parete con tre specchi

Un solo schermo `100dvh` a tre fasce: fascia alta, pista degli specchi,
mensola. Nella pista lo specchio attivo prende quasi tutto; ai lati si vedono
i bordi degli specchi vicini (12 / 32 / 86 px) separati da parete (12 / 16 /
24 px). Il primo specchio non ha nulla a sinistra, il terzo nulla a destra:
così si capisce che sono tre.

Misure risultanti: a 1440 × 900 il vetro è 1220 × 756; a 768 × 1024 è 672 ×
880; a 375 × 667 è 327 × 515; a 2560 × 1440 è 2340 × 1272.

### Dentro il vetro: scritte, non colonne

Le facce non sono colonne allineate: sono scritte fatte in momenti diversi.
Su L (vetro ≥ 960 px) convivono: la faccia vetro parte al 6% da sinistra e
dall'alto a 56 / 72 / 48 px secondo lo specchio, larga 50%; la lista parte al
62% e a 48 / 40 / 60 px, larga 32%. Su M e S una faccia per volta, che parte
dal margine interno del vetro (`--ctp-vetro-pad`) e prende tutta la larghezza.
A 2560 le scritte crescono (corpi `xl`) e partono più in basso (96 / 80 px).

Il listino sta nella **metà alta** del vetro a ogni misura, dove il vapore è
meno fitto (0,78): "taglio 22" si legge in tre secondi anche a vapore pieno.
"la lista" (S, M) sta in basso a destra, sopra il pollice.

### Ritmo

Nessun ritmo verticale da pagina: il vetro respira per sottrazione. La lista ha
righe da 44 px (dito) / 40 px (mouse) / 52 px (2560). Lo spazio tra il titolo e
la prima riga è mezzo em del titolo; tra listino e riga sul barbiere 0,8 em.

### Spazi

Scala base 4 (`--ctp-sp-1` … `--ctp-sp-8`). Margine interno del vetro 20 / 40
/ 56 px. Il testo di interfaccia sulla mensola ha 40 px tra i nomi (L), 24 px
(M).

## 6. Depth & Elevation

Niente ombre portate, niente card, niente `backdrop-filter`. La profondità è
fatta da **tre cose fisiche**:

1. il bisello di 2 px dello specchio (luce in alto a sinistra, ombra in basso
   a destra), che dice "vetro spesso appeso alla parete";
2. la differenza di nitidezza: foto sfocata 1,5 px dietro, pennarello nitido
   con sbavatura di 0,6 px davanti, vapore morbido (mezza risoluzione) sopra;
3. il vapore più fitto in basso (0,9) che in alto (0,78): l'asciugamano caldo
   è sotto lo specchio.

Il canvas del vapore è a `z-index` 2 sopra il pennarello (1) e il riflesso (0);
riga di scrittura e pannello Informazioni a 3; fascia e mensola a 4. Il
bottone del sito sta sopra da solo. Nient'altro ha una quota.

### Luce

Una sola direzione, alto-sinistra, e solo sul bisello. Nessun riflesso che
luccica, nessuna luce che passa sul vetro, nessun bagliore attorno al turchese.

### Texture

Due, entrambe statiche: la grana di intonaco della parete (SVG `feTurbulence`
in `background-image`, alfa 5,5%, tessera 180 px) e la grana del vapore
(rumore a bassa frequenza 256², ± 4,5% di opacità, generato una volta,
`tokens.ts` `VAPORE`). Nessuna grana sul pennarello, nessuna sulla foto.

## 7. Do's and Don'ts

### Do

- Mansalva solo per ciò che è scritto sul vetro; Figtree per tutto ciò che è
  interfaccia; Limelight per insegna e nomi. Due registri, niente vie di mezzo.
- Prezzi in colonna, allineati a destra, più grandi delle voci.
- Turchese solo dove c'è posto per te; sul vetro `turchese-vetro`.
- Foto trattata a build-time con il tetto delle alte luci `#A7AFAE`, poi
  velatura CSS al 66%.
- Rotazioni ± 2° al massimo, campi sempre dritti.
- Raggio 0 ovunque; la sola curva è il tratto del pennarello.
- Verificare ogni schermata anche con `?canvas=0`: senza vapore il sito deve
  essere completo e bello.

### Don't

- Niente crema, blu notte, rosso, marrone, oro, ottone, legno, pelle, lampadine
  a filamento: il "barber vintage" è il bocciato.
- Niente card, bordini, ombre, glassmorphism, `backdrop-filter`, gradienti
  colorati, bagliori.
- Niente pallini di stato, chip, pillole, badge, contatori, "in fila adesso".
- Niente maiuscoletto spaziato, occhielli, numeri di sezione, monospace,
  corsivi, trattini lunghi.
- Niente turchese per testo, a nessun corpo. Niente turchese come fondo più
  grande del bottone.
- Niente illustrazioni: forbici, rasoi, baffi, pali a strisce, sagome, mappa
  disegnata. Icone solo Phosphor Light, colore pennarello.
- Niente cursore custom, niente lente, niente testo magnetico, niente
  preloader.
- Niente foto di parrucchieri per signora, niente volti in camera, niente
  scritte leggibili nella foto (specchiate si leggono al contrario).
- Niente Mansalva sotto 22 px, niente Limelight per numeri o frasi.

## 8. Responsive Behavior

### Breakpoint (allineati all'ux-architect)

| Nome | Condizione | Cosa cambia nei token |
|---|---|---|
| S | < 640 px | fascia 48, mensola 48 + 56, bordi vicini 12, gutter 12, pad 20, nicchia Lab 212 in basso a sinistra, una faccia per volta, rotazioni -0,8° / +0,5° |
| M | 640-1023 px | fascia 60, mensola 88, bordi 32, gutter 16, pad 40, nicchia Lab 260 in alto a sinistra, una faccia per volta, rotazioni -1° / +0,6° |
| L | ≥ 1024 px | bordi 86, gutter 24, pad 56, facce affiancate (se il vetro è ≥ 960 px), rotazioni per specchio |
| XL | ≥ 1920 px | corpi `xl` (nome 60, riga 44, prezzo 50, ora 36 a 2560), righe da 52, lista al 64% larga 28%, listino max 44 rem |
| vetrina lunga | `data-layout="scorre"` (altezza < 500 o trabocco) | rotazioni 0, velatura 80%, pagina che scorre (layout.css) |

`pointer: fine`: righe della lista 40 px. `prefers-contrast: more`: velatura
86%, niente sbavatura, opacità delle scritte dimesse 0,78 / 0,7.
`forced-colors: active`: via foto, vapore, grana e alone; bisello come
`outline` di sistema; segni in `Highlight`; bottone con bordo `ButtonText`.

### Touch

Target 44 px: trattini, parole del servizio, nomi dei barbieri, interruttore,
"la lista", "domani", link sul vetro. Sul vetro un dito pulisce e basta
(`touch-action: none` solo lì).

### 375 px

Verificato a schermo (docs/art-director.md §5): il listino con sette voci e i
prezzi a 26 px sta nella metà alta del vetro (327 × 515), la voce più lunga
("macchinetta, un'altezza", 10,5 em) misura 231 px a 22 px e lascia 40 px alla
colonna dei prezzi; la lista a 4 fasce con 5 righe da 44 px ci sta con
"domani" e "la lista" in fondo; la nicchia del bottone Lab resta vuota; nessuno
scroll orizzontale.

### Zoom e contrasto alto

Tutto in `rem` e `clamp()`: al 200% le scritte crescono e le facce si
alternano; al 400% scatta la vetrina lunga con rotazioni a zero e velatura
forte. Contrasti in `docs/art-director.md` §2: tutte le coppie con soglia
passano, pennarello ≥ 7:1 su ogni pixel del riflesso.

## 9. Agent Prompt Guide

### Riferimento rapido dei colori

- Sfondo pagina: `var(--ctp-parete)`; vetro: `var(--ctp-specchio)`.
- Testo, sempre: `var(--ctp-pennarello)`. Sul bottone turchese: `var(--ctp-su-turchese)`.
- Posto libero, sottolineatura, fuoco: `var(--ctp-turchese-vetro)`.
- Bottone e tratto del barbiere attivo: `var(--ctp-turchese)`.
- Vapore: solo il canvas, da `COLORI.vapore` / `RGB.vapore` di `tokens.ts`.
- Nessun hex fuori da `styles/tokens.*`.

### Prompt d'esempio per componenti

- "Riga del listino": `<div class="ctp-colonna-prezzi"><dt>taglio</dt><dd
  class="ctp-prezzo">22<span class="ctp-sr"> euro</span></dd></div>` dentro un
  `dl.ctp-pennarello.ctp-scritta--vetro`; il prezzo prende `--ctp-t-prezzo`
  da solo.
- "Riga della lista": `li` a griglia `3.2em 1fr`, altezza
  `var(--ctp-riga-lista-h)`, ora e nome in `.ctp-pennarello--ora`; se libera,
  `button` con dentro l'SVG `.ctp-segno.ctp-segno--trattino`.
- "Nome del barbiere sulla mensola": `button[role=tab].ctp-insegna.ctp-insegna--barbiere`,
  area 44 px, e sotto un `::after` di 3 px `var(--ctp-turchese)` quando
  `aria-selected="true"`.
- "Campo del nome": `label.ctp-etichetta` + `input.ctp-campo`; l'errore in
  `p.ctp-messaggio` con `id` referenziato da `aria-describedby`.
- "Vetro di uno specchio": contenitore `position: relative; overflow: hidden`
  con classi `ctp-bisello ctp-alone`, dentro `.ctp-riflesso` (img + velatura),
  le facce a pennarello a `z-index: var(--ctp-z-pennarello)`, e il
  `canvas.ctp-vapore` a `z-index: var(--ctp-z-vapore)` con `pointer-events: none`.

### Guida all'iterazione

Se una schermata sembra "una clinica": c'è troppo turchese o troppo poco
riflesso. Se sembra "un sito scuro con foto": mancano bisello, bordi vicini o
la differenza di nitidezza tra foto e scritte. Se il listino non si legge in
tre secondi a 375: le scritte sono scese nella metà bassa del vetro o il corpo
è sotto 22 px. Se qualcosa ha un raggio, un'ombra o un bordo grigio: non è di
questo sito.
