---
version: 1
name: BATTIFILO-impresa-edile-e-serramenti
description: Sito di un'impresa edile e di serramenti di Cordenons costruito come un palco fisso, la cronaca di un cantiere tipo di 14 mesi. In alto la foto vera del mese, in basso una lastra di calcestruzzo su cui tutto è marcato a spruzzo con lo stencil; il tempo si muove tirando il filo blu del battifilo, che batte e lascia una linea polverosa con i buchi dei giorni fermi. Calcestruzzo, ferro, calce, un solo cobalto (la polvere del filo). Big Shoulders Stencil per le marcature, Chivo per leggere. Spigolo vivo ovunque tranne la maniglia della cassetta.

colors:
  calcestruzzo: "#B8B4AB"
  calcestruzzo-ombra: "#9F9B92"
  cobalto: "#1C4CB4"
  cobalto-fondo: "#143A8C"
  ferro: "#23272B"
  calce: "#F1F2EE"
  rasatura: "#D2D0C9"
  gesso-vecchio: "#627BB0"

typography:
  marcatura-titolo:
    fontFamily: Big Shoulders Stencil
    fontSize: 36px → 72px (mai più di 8vh)
    fontWeight: 850
    fontVariation: "opsz auto (= corpo in px, fino a 72)"
    lineHeight: 0.9
    letterSpacing: 0.005em
    textTransform: uppercase
  marcatura-fase:
    fontFamily: Big Shoulders Stencil
    fontSize: 36px → 60px (mai più di 6.7vh)
    fontWeight: 850
    lineHeight: 0.9
    textTransform: uppercase
  marcatura-costo:
    fontFamily: Big Shoulders Stencil
    fontSize: 36px → 52px (mai più di 5.8vh)
    fontWeight: 850
    lineHeight: 1
    color: "{colors.cobalto}"
    box: larghezza fissa 3.8em (totale 4.3em)
  marcatura-schermata:
    fontFamily: Big Shoulders Stencil
    fontSize: 36px → 56px
    fontWeight: 850
    lineHeight: 0.9
  marcatura-enorme:
    fontFamily: Big Shoulders Stencil
    fontSize: 64px → 152px
    fontWeight: 850
    lineHeight: 0.86
  marchio:
    fontFamily: Big Shoulders Stencil
    fontSize: 24px → 28px
    fontWeight: 850
    letterSpacing: 0.02em
    color: "{colors.calce}"
  data:
    fontFamily: Big Shoulders Stencil
    fontSize: 32px → 48px
    fontWeight: 850
    color: "{colors.cobalto}"
  quota:
    fontFamily: Big Shoulders Stencil
    fontSize: 24px
    fontWeight: 800
    letterSpacing: 0.03em
  tacca:
    fontFamily: Big Shoulders Stencil
    fontSize: 20px
    fontWeight: 800
    letterSpacing: 0.03em
  lead:
    fontFamily: Chivo
    fontSize: 17px → 19px
    fontWeight: 400
    lineHeight: 1.5
  mese:
    fontFamily: Chivo
    fontSize: 16px → 19px
    fontWeight: 500
    lineHeight: 1.2
  corpo:
    fontFamily: Chivo
    fontSize: 16px → 17px
    fontWeight: 400
    lineHeight: 1.5
  etichetta-in-linea:
    fontFamily: Chivo
    fontSize: come il corpo
    fontWeight: 700
  cifre-in-riga:
    fontFamily: Chivo
    fontFeature: "tnum, lnum"
  voce:
    fontFamily: Chivo
    fontSize: 16px
    fontWeight: 500
  bottone:
    fontFamily: Chivo
    fontSize: 16px (15px nella fascia bassa del telefono)
    fontWeight: 700
    lineHeight: 1.15
  campo:
    fontFamily: Chivo
    fontSize: 17px
    fontWeight: 400
  piccolo:
    fontFamily: Chivo
    fontSize: 15px
    lineHeight: 1.45
  nota:
    fontFamily: Chivo
    fontSize: 14px
    lineHeight: 1.45

rounded:
  none: 0px
  maniglia: 6px

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
  margine-lastra: 16px → 40px
  gancio: 48px
  passi: 16 (griglia del filo, largo)
  passo-stretto: 64px
  fascia: 56px (48px stretto)
  fascia-bassa: 64px + area sicura
  lastra: clamp(320px, 40vh, 440px) largo
  foto-stretto: 42svh (38svh se altezza < 700)
  filo: 112px / 104px / 88px

components:
  lastra:
    backgroundColor: "{colors.calcestruzzo}"
    texture: mappa di luminanza 116-146 in soft-light, ripetuta a 800px (400px stretto)
    textColor: "{colors.ferro}"
    rounded: "{rounded.none}"
  bottone-cobalto:
    backgroundColor: "{colors.cobalto}"
    textColor: "{colors.calce}"
    hover: "{colors.cobalto-fondo}"
    typography: "{typography.bottone}"
    height: 48px (44px nella fascia)
    rounded: "{rounded.none}"
    focus: anello calce 3px dentro il bottone
  campo:
    backgroundColor: "{colors.rasatura}"
    textColor: "{colors.ferro}"
    border: riga di base 2px ferro; in errore 2px pieno sui 4 lati
    height: 56px
    rounded: "{rounded.none}"
  cartello:
    backgroundColor: "{colors.ferro}"
    textColor: "{colors.calce}"
    border: 4px calce
    fascette: due rettangoli ferro 8 × 26
    rounded: "{rounded.none}"
  cassetta:
    backgroundColor: "{colors.ferro}"
    size: 44 × 56
    maniglia: calce, raggio 6px
  linea-battuta:
    color: "{colors.cobalto}"
    height: 6px utili (tessera 240 × 24 in maschera)
    vecchia: "{colors.gesso-vecchio}"
  filo:
    color: "{colors.ferro}"
    width: 1.5px
---

# BATTIFILO · Design system

Concept 14 del Concept Lab di CiceriLab, rotta `/concept-14`. Documento di
riferimento per chi costruisce. I valori vivono in
`src/pages/concepts/battifilo/styles/tokens.css` (CSS) e `tokens.ts` (TS);
i materiali (lastra, marcatura a spruzzo, rasatura, bottone, cartello,
gesso) in `styles/lastra.css`. I contrasti sono in `docs/art-director.md`
§3 e si ricalcolano con `node scripts/contrasti.mjs`.

## 1. Visual Theme & Atmosphere

Un cantiere, non una brochure. Lo schermo è diviso da un bordo netto: sopra
la fotografia vera del mese (il terreno, la platea, i muri, le tracce degli
impianti, la porta con la chiave), sotto una lastra di calcestruzzo vero su
cui la foto poggia con la sua linea di terra. Tutto quello che si legge sta
sulla lastra; niente testo sopra le foto, mai.

Sulla lastra le cose importanti sono **marcate a spruzzo con lo stencil**,
come i carpentieri numerano getti e pilastri: la fase del mese, i soldi, le
quote. Il resto è scritto in un sans da ufficio tecnico, piano e leggibile.

L'unico colore è il **cobalto** della polvere del battifilo. Compare solo
dove il filo ha battuto: la linea del tempo, le cifre dei costi, la finestra
disegnata in Misura e manda, il bottone che porta lì. Se il filo non ha
battuto, è ferro.

Densità: più dati del solito (costo del mese, progressivo, chi c'era, giorni
fermi), ma una fase per volta, sempre negli stessi cinque pezzi e senza un
solo riquadro: si reggono con l'allineamento alla griglia del filo.

Dial: varianza 7, movimento 5, densità 5 (creative-director §1).

## 2. Color Palette & Roles

Una sola palette, fredda e materica. **Nessun giallo, rosso o verde** in
tutto il sito, nemmeno per gli errori.

| Token | Hex | Ruolo |
|---|---|---|
| `calcestruzzo` | `#B8B4AB` | la lastra: fondo di ogni zona di lettura (tinta media sotto la texture) |
| `calcestruzzo-ombra` | `#9F9B92` | segnaposto della foto mentre carica, tratti vuoti della forbice. **Mai testo, mai un bordo che serve** (1,34:1) |
| `cobalto` | `#1C4CB4` | gesso: linea battuta, cifre a stencil da 24 px, rettangolo e quote della finestra, bottone, anello di fuoco sulla lastra |
| `cobalto-fondo` | `#143A8C` | cobalto per il testo piccolo sulla lastra (link, prezzi in riga), hover e premuto del bottone. Più scuro del `#163E94` della direzione: con la texture il vecchio valore scendeva a 4,43:1 |
| `ferro` | `#23272B` | ogni testo di lettura sulla lastra, fascia alta e bassa, cartello, cassetta, filo teso, porta di riferimento, riga di base dei campi |
| `calce` | `#F1F2EE` | testo su ferro e su cobalto, bordo del cartello, anelli di fuoco su ferro e dentro il bottone. **Mai sulla lastra** (1,84:1) |
| `rasatura` | `#D2D0C9` | derivato (45% calce su calcestruzzo): il fondo liscio dei campi |
| `gesso-vecchio` | `#627BB0` | derivato (cobalto al 55% sul calcestruzzo): la linea già vista oltre la cassetta. Solo ausilio |

Regola di controllo per ogni uso del cobalto: *qui il filo ha battuto?* Se
no, è ferro. Niente cobalto su icone, bordi di campo, hover di superfici,
errori, voci della fascia.

Niente "testo grigio": il secondario si fa con dimensione e peso di Chivo,
sempre in ferro.

## 3. Typography Rules

**Big Shoulders Stencil** (Google Fonts, una famiglia variabile: `wght`
100-900, `opsz` 10-72; non esiste più una "Stencil Display" separata).
Pesi usati 800 e 850 (900 a 20-24 px chiude i ponti). `font-optical-sizing:
auto`: sopra 72 px è il taglio Display, a 20-24 px il taglio aperto.

- Solo **marcature** sulla lastra: fase, mese delle tacche, cifre dei costi,
  quote, data del successo, titolo di S0, titoli delle tre schermate, il
  marchio. Maiuscolo (`text-transform`, il testo nei dati resta normale).
- Mai sopra una foto. Mai sotto 20 px. Mai frasi intere: la frase d'apertura
  in due o tre righe è il massimo.
- Mai più di **due misure** stencil nella stessa schermata oltre alle tacche
  (S1: fase + costo; S0: titolo; S3: titolo + quote).
- Calce in stencil grande solo sul marchio e sul titolo del cartello (è un
  cartello dipinto). Mai calce stencil sulla lastra.
- Le cifre a stencil sono proporzionali (l'1 è stretto): costo e totale
  stanno in un riquadro di **larghezza fissa** (3,8 em / 4,3 em, misurati con
  fontTools sul valore più largo), allineati all'inizio. Nessun salto tra un
  mese e l'altro.

**Chivo** 400/500/700 (un file variabile). Per tutto il resto. Ha `tnum`:
le cifre in riga (progressivo, forbice, totale) usano `.btf-cifre`.

- Corpo 16 → 17 px, interlinea 1,5; lead 17 → 19; nota minima 14 px.
- Etichette dentro il testo ("**Fatto:**", "**Chi c'era:**", "**Controlla
  tu:**") in Chivo 700 della stessa misura: **niente occhielli**, niente
  maiuscoletto spaziato, niente monospace, niente corsivi, niente serif.
- Campi a 17 px (niente zoom automatico di iOS).

**Ripieghi tarati** in `tokens.css`: stencil su Arial Narrow Bold (88,4%) o
Arial Bold (72,5%), Chivo su Arial (105,7%), con ascent/descent riportati:
il cambio font non sposta le righe.

Scala (375 → 1440, fluida, in rem; i titoli grandi hanno anche un tetto in
vh perché la lastra è alta al massimo 40vh):

| Ruolo | 375 | 1440 | Tetto |
|---|---|---|---|
| titolo S0 | 36 | 72 | 8vh |
| fase (h2 del mese, LE CHIAVI) | 36 | 60 | 6,7vh |
| costo, totale (cobalto) | 36 | 52 | 5,8vh |
| h2 delle schermate | 36 | 56 | |
| mese senza foto | 64 | 152 | |
| marchio | 24 | 28 | |
| data del successo (cobalto) | 32 | 48 | |
| quote | 24 | 24 | minimo per il cobalto |
| tacche | 20 | 20 | minimo stencil |

## 4. Component Stylings

**Lastra** (`.btf-lastra`): tinta calcestruzzo + texture di un getto vero
(mappa di luminanza in grigio, media 128, valori 116-146) fusa in
`soft-light` con `background-blend-mode`. La luminanza resta tra −5,8% e
+6,2% della tinta: tutti i contrasti del caso peggiore restano AA. Nessuna
velatura, nessun gradiente, nessuna ombra. La lastra non ha bordi: il
confine con la foto è un taglio netto.

**Marcatura a spruzzo** (`.btf-stencil` + misura + colore): alone di 0,6 px
dello stesso colore e, da 32 px in su, la maschera `polvere-bordo.svg`
(circa 4% di lacune minute). Tacche, quote e marchio senza maschera. Niente
gocce, schizzi, glow, animazione dello spruzzo.

**Bottone del gesso** (`.btf-bottone-cobalto`): cobalto pieno, testo calce
Chivo 700 16 px, alto 48 (44 in fascia), spigolo vivo. Hover e premuto:
cobalto fondo; premuto scende di 1 px. Fuoco: anello calce 3 px **dentro**
il bottone (6,81:1 sul cobalto). Un solo intento in tutto il sito: **Misura e
manda**. Mai un secondo bottone a contorno.

**Campi** (`.btf-rasatura`): rasatura liscia, testo ferro 17 px, alti 56,
riga di base 2 px ferro (il bordo del getto). Etichetta sopra in Chivo 700,
aiuto sotto in 15 px, errore sotto l'aiuto con l'icona Phosphor. In errore
il bordo diventa pieno sui quattro lati: **cambia la forma, non il colore**.
Fuoco: anello cobalto 3 px (4,96:1 sulla rasatura).

**Cartello** (`.btf-cartello`): pannello ferro, bordo calce 4 px, testo
calce, h2 stencil calce, link calce sottolineati. Due fascette ferro 8 × 26
che escono dal bordo superiore con il giro di calce di 2 px. Nessuna ombra:
lo stacca il bordo.

**Cassetta**: corpo ferro 44 × 56, maniglia calce con l'**unico raggio del
sito** (6 px). Fuoco: anello calce dentro il corpo.

**Linea battuta** (`.btf-gesso`): pieno cobalto con la tessera
`polvere-tessera.svg` come maschera (la mette `linea.css`); il già visto in
`gesso-vecchio`. Senza `mask-image`: tratto pieno 5 px con i bordi sfumati.
I buchi sono assenza di gesso, mai un altro colore.

**Filo**: 1,5 px ferro, `non-scaling-stroke`. Il tratteggio del vuoto di
Misura è lo stesso filo.

**Porta di riferimento** (Misura): contorno ferro 1,5 px con la maniglia,
quote stencil ferro 24 px. La finestra: gesso cobalto 6 px, quote cobalto
24 px. (La direzione voleva la porta in calcestruzzo ombra: 1,34:1, invisibile
per chi vede poco; il ferro sottile la tiene secondaria e leggibile.)

**Icone**: Phosphor Regular, `currentColor` (ferro sulla lastra, calce su
ferro).

## 5. Layout Principles

**La griglia del filo** (largo, da 960 px). Sulla lastra non c'è una griglia
a 12 colonne: le colonne sono i passi della linea del tempo.
`grid-template-columns: var(--btf-griglia-filo)` = gancio 48 px + 16 passi
uguali (0 PRIMA, 1-14 i mesi, 15 CHIAVI), gap 0, dentro il margine della
lastra (16 → 40 px). Ogni blocco della scheda comincia **esattamente sopra
una tacca**: la scheda e la linea sono lo stesso righello. Colonne di
griglia (la 1 è il gancio):

| Blocco (S1, scheda del mese) | Colonne | Passi | A 1440 |
|---|---|---|---|
| fase + "ottobre, mese 8" | 2 / 6 | PRIMA-MAG | ~328 px |
| costo + progressivo + nota | 6 / 10 | GIU-SET | ~328 px |
| fatto, chi c'era, controlla tu, link | 10 / 17 | OTT-CHIAVI | ~574 px (≤ 62ch) |
| didascalia della foto | 13 / 17, in alto a destra | | |

S0: titolo 2 / 9, frase e bottone 10 / 15, didascalia 15 / 17. S2: LE CHIAVI
+ totale 2 / 6, Tempi e Soldi 6 / 12, Con le chiavi 12 / 17. (Provato a
schermo: con il costo su 3 passi il progressivo sbordava nel testo.)

**Palco**: fascia 56 → foto (il resto, massimo 1920 px poi centrata con la
lastra ai lati) → lastra `clamp(320px, 40vh, 440px)` con la striscia del
filo 112 px in fondo. Contenuto della lastra massimo 1680 px.

**Stretto** (sotto 960): una colonna sul margine di 16 px, foto 42svh
(38svh sotto 700 di altezza), lastra, filo 88 px con passo 64 e cassetta
ferma al centro, fascia bassa 64 + area sicura (sotto 640).

**Zone del bottone del Lab**: 240 × 56 in alto a sinistra sopra 640 px (il
marchio parte da 260, 240 tra 641 e 959); 216 × 64 in basso a sinistra
fino a 640 px. Niente di nostro lì dentro.

**Misura e manda**: piano di tracciamento 55% a sinistra (sticky), colonna
campi al massimo 544 px; telefono: piano 38svh in alto, 30% con la tastiera.

Spaziatura a passi di 4 px (4, 8, 12, 16, 24, 32, 48, 64, 96).

## 6. Depth & Elevation

Nessuna ombra portata in tutto il sito. La profondità è di materiale: foto
sopra, lastra sotto, il cartello appeso con le fascette, la cassetta ferro
appoggiata sulla linea. Livelli: foto 0, lastra 1, filo e cassetta 2,
fascia 10, schermate 20, fascia bassa 25; il bottone del sito 2147483000.

## 7. Do's and Don'ts

Fai:
- tutto il testo sulla lastra, in ferro; il cobalto solo dove il filo ha
  battuto;
- marcature a stencil allineate a sinistra sulla tacca, come si marca un
  getto;
- errori e stati con testo, icona e forma (filo molle, bordo pieno);
- la texture entro 116-146: è lei che tiene i contrasti.

Non fare:
- testo o pillole sopra le foto, velature, gradienti, `filter` CSS sulle foto;
- giallo cantiere, strisce di pericolo, nastro bianco e rosso, verde oliva
  militare, stencil grunge con gocce;
- schede con bordino e ombra, bento, tre colonne uguali, divisori
  decorativi (l'unica linea è quella battuta);
- occhielli, "01 ·", maiuscoletto spaziato, monospace, corsivi, serif;
- un secondo raggio (solo la maniglia, 6 px), un secondo bottone a contorno;
- calce sulla lastra, testo sul calcestruzzo ombra, cobalto `#1C4CB4` sotto
  24 px;
- trattini lunghi in qualsiasi testo visibile.

## 8. Responsive Behavior

- **375**: versione piena, non ridotta: fase 36, costo 36 cobalto,
  progressivo e "Fatto" in vista, "Di più" per il resto; la linea scorre
  sotto la cassetta (passo 64, 4 mesi visibili tra i bottoni ‹ ›).
- **768**: stretto con la linea intera se la larghezza lo permette (ux
  ≥ 720): passo circa 44 px, tacche 20 px stencil di tre lettere.
- **1440**: griglia del filo, scheda su tre campate.
- **2560**: foto ferma a 1920 px centrata, lastra che continua ai lati,
  contenuto della lastra a 1680 px, margine 40.
- **Modo documento** (altezza < 544 o zoom 400%): tutto nel flusso, stessi
  materiali.
- `forced-colors`: niente texture né maschere, colori di sistema, bordi
  visibili su bottoni, campi e cartello.
- Niente tema scuro: il sito è un materiale (calcestruzzo e ferro), non un
  tema; la fascia ferro è già il "notte" del sistema.

## 9. Agent Prompt Guide

"Lastra di calcestruzzo `#B8B4AB` con texture di getto in soft-light; testo
ferro `#23272B` in Chivo 16-17 px; marcature Big Shoulders Stencil 850
maiuscole a sinistra, fase 60 px ferro, costo 52 px cobalto `#1C4CB4` in un
riquadro di 3,8 em; link `#143A8C`; un solo bottone cobalto con testo calce
`#F1F2EE`, spigolo vivo; colonne sulla griglia del filo (gancio 48 + 16
passi); nessuna ombra, nessun riquadro, nessun testo sulle foto."
