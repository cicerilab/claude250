---
version: 1
name: EVIDENZIA-agenzia-immobiliare
description: Sito di un'agenzia immobiliare di Pordenone costruito come la pagina dei piccoli annunci del sabato di un quotidiano locale. Carta di giornale grigia, colonne fitte, grottesco nero Libre Franklin per chiamare, Newsreader per leggere, foto stampate a retino. Un solo colore, il rosa dell'evidenziatore, che esiste solo dove l'utente ha agito. Raggio zero, nessuna ombra, nessuna texture di carta.

colors:
  carta: "#E4DFD1"
  nero: "#1C1C1A"
  secondario: "#4F4C46"
  retino: "#8F8B82"
  rosa: "#EE5A9E"
  carta-premuta: "#D4CFC2"
  velo: "#1C1C1A4D"
  ombra-tinta: "#58503C"
  retino-piatto: "#B1ADA2"
  tratto-composto: "#D7648D"

typography:
  testata:
    fontFamily: Libre Franklin
    fontSize: 144px (foglio) · 52px a 375 (0,1516 × larghezza colonna)
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: -0.02em
  riquadro:
    fontFamily: Libre Franklin
    fontSize: 34px (foglio) · 28px → 36px (colonna 320 → 639)
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -0.015em
  barra-rubrica:
    fontFamily: Libre Franklin
    fontSize: 20px (foglio) · 18px (colonna)
    fontWeight: 800
    lineHeight: 1
    letterSpacing: -0.005em
  attacco-testa:
    fontFamily: Libre Franklin
    fontSize: 22px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.015em
  attacco-riquadro:
    fontFamily: Libre Franklin
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.1
  attacco:
    fontFamily: Libre Franklin
    fontSize: 16px (foglio) · 18px (colonna)
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.01em
  prezzo:
    fontFamily: Libre Franklin
    fontSize: 17px (P, F) · 20px (T, R) · 28px → 36px (scheda)
    fontWeight: 700
    fontFeature: tabular-nums lining-nums
  testo:
    fontFamily: Newsreader
    fontSize: 15px (foglio) · 16px (colonna)
    fontWeight: 400
    fontVariation: "opsz auto"
    lineHeight: 1.4 (foglio, riga di 21px) · 1.45 (colonna)
  sottotesto:
    fontFamily: Newsreader
    fontSize: 18px (foglio) · 16px → 18px (colonna)
    fontWeight: 400
    lineHeight: 1.45
  descrizione:
    fontFamily: Newsreader
    fontSize: 17px → 18px
    fontWeight: 400
    lineHeight: 1.5
  citazione:
    fontFamily: Newsreader
    fontSize: 18px
    fontStyle: italic
    fontWeight: 400
    lineHeight: 1.4
  bottone:
    fontFamily: Libre Franklin
    fontSize: 15px (foglio) · 16px (colonna) · 17px (Prepara il giro, Manda il giro)
    fontWeight: 700
    lineHeight: 1.15
  servizio:
    fontFamily: Libre Franklin
    fontSize: 14px (minimo assoluto)
    fontWeight: 500
    lineHeight: 1.35

rounded:
  none: 0px

spacing:
  sp-1: 4px
  sp-2: 8px
  sp-3: 12px
  sp-4: 16px
  sp-5: 20px
  sp-6: 24px
  sp-7: 32px
  sp-8: 48px
  sp-9: 64px
  foglio: 1840px = 66 + 6 × 268 + 5 × 20 + 66
  colonna: 268px
  canaletto: 20px
  margine-alto: 72px
  colonna-mobile: 343px a 375 (margini 16px)

components:
  bottone-pieno:
    backgroundColor: "{colors.nero}"
    textColor: "{colors.carta}"
    typography: "{typography.bottone}"
    rounded: "{rounded.none}"
    height: 44px (52px nel giro, 56px sotto 640)
  bottone-evidenzia:
    backgroundColor: "{colors.carta}"
    textColor: "{colors.nero}"
    border: 1px solid nero
    height: 44px
    pressed: fondo nero, testo carta, etichetta "Nel giro"
  barra-rubrica:
    backgroundColor: "{colors.nero}"
    textColor: "{colors.carta}"
    typography: "{typography.barra-rubrica}"
    height: 36px
  tratto:
    fill: "{colors.rosa}"
    blend: multiply
    opacity: 0.85 gruppo (corpo 0.88, striature 0.62, estremità 1, relative)
    height: 1.15 × corpo della riga
  campo:
    backgroundColor: "{colors.carta}"
    textColor: "{colors.nero}"
    border: 1px solid nero (errore 2px)
    height: 48px (56px sotto 640)
    rounded: "{rounded.none}"
---

# EVIDENZIA · Design system

Concept 16 del Concept Lab di CiceriLab, rotta `/concept-16`. Riferimento
per tutti i section-builder. I valori vivono in
`src/pages/concepts/evidenzia/styles/tokens.css` (CSS, prefisso `--evd-`) e
`tokens.ts` (numeri per impaginato, minipagina, font, test). I contrasti
calcolati sono in `docs/art-director.md`.

## 1. Visual Theme & Atmosphere

Il sabato mattina, il giornale aperto alla pagina delle case, un
evidenziatore in mano. Il sito è quella pagina: un foglio di 1840 px stampato
tutto insieme, fitto, a sei colonne, che si esplora spostandolo. Non entra
niente allo scroll, perché un giornale è già stampato.

- **Stampa economica, di oggi**: grottesco nerissimo per titoli e prezzi,
  serif da giornale per il testo, fili neri, filetti grigi, barre di rubrica in
  negativo. Niente nostalgia: niente carta ingiallita, macchie, pieghe,
  macchina da scrivere, testate gotiche.
- **Densità come metafora**: tante case, ne scegli quattro. La densità si
  governa con corpo, interlinea e filetti, mai con testo minuscolo.
- **Il rosa è tuo**: con la memoria vuota, la pagina appena aperta ha un solo
  segno rosa (il tratto dimostrativo su "Segna"). Ogni altro rosa è la
  conseguenza di un gesto dell'utente.
- **Grigio sulla pagina, colore nella casa**: sul foglio le foto sono a
  retino; nella scheda la stessa foto è a colori.

Dial: DESIGN_VARIANCE 7, MOTION_INTENSITY 4, VISUAL_DENSITY 8.

## 2. Color Palette & Roles

| Token | Hex | Ruolo |
|---|---|---|
| `--evd-carta` | `#E4DFD1` | Unico fondo: foglio, molo, scheda, giro, campi, riquadro della mappa. Niente bianco da nessuna parte. |
| `--evd-nero` | `#1C1C1A` | Testo, titoli, fili, barre di rubrica, bottoni pieni, anello di fuoco, marcatore dell'agenzia. 12,82:1 sulla carta. |
| `--evd-secondario` | `#4F4C46` | Testo secondario: Rif., date, zone nel molo, note di servizio; bottone disattivo; contorno dei posti vuoti. 6,43:1. **Mai sotto il tratto.** |
| `--evd-retino` | `#8F8B82` | Filetti di colonna e tra annunci, punti delle foto, sagome della minipagina. 2,55:1: **mai testo, mai unico confine di un comando.** |
| `--evd-rosa` | `#EE5A9E` | Solo gesti dell'utente: tratto, posti pieni, segni della minipagina, marcatori e percorso sulla mappa, tratto dimostrativo. **Mai testo, bottoni, link, fondi.** |

Derivati (tutti dai cinque sopra, nessun colore nuovo):

| Token | Valore | Uso |
|---|---|---|
| `--evd-carta-premuta` | `#D4CFC2` (carta + 8% nero) | `:active` dei bottoni di testo, tappa trascinata. |
| `--evd-velo` | `#1C1C1A4D` (nero 30%) | Foglio oscurato sotto scheda e giro. |
| `--evd-ombra-tinta` | `#58503C` | Unica ombra (stacco dell'annuncio), color carta scura, mai nera. |
| `--evd-retino-piatto` | `#B1ADA2` | Sostituisce le foto a retino in Pagina intera (niente moiré). |
| `--evd-attribuzione-fondo` | `#E4DFD1E6` | Fondo dell'attribuzione OSM sopra i tile. |

**Stati senza colore**: niente verde "disponibile", rosso "venduto" o
"errore", niente badge. L'errore è una frase in nero, Franklin 700, sotto il
campo, e il campo passa a bordo 2 px. "Nel giro" è bottone pieno nero con
`aria-pressed="true"` e etichetta cambiata, oltre al tratto. Il posto pieno
del molo ha il numero di tappa in nero dentro il tratto; il posto vuoto un
contorno tratteggiato `--evd-posto-vuoto` (6,43:1), non il retino.

**Tema chiaro bloccato** (`color-scheme: light`). Contrasto forzato di
Windows: il rosa diventa `Highlight` e il tratto una barra di 4 px sotto la
riga (variabile `--evd-tratto-forzato`).

## 3. Typography Rules

### Famiglie e compiti

- **Libre Franklin** (variabile, pesi usati 500, 700, 800, 900): tutto ciò che
  si **scansiona o si tocca**. Testata 900, attacchi e barre 800, prezzi,
  orari, bottoni, etichette 700, servizio 500.
- **Newsreader** (400 con asse `opsz` automatico; corsivo 400 solo per le
  citazioni): tutto ciò che si **legge**. Nessun grassetto di Newsreader è
  caricato: `font-synthesis: none`.
- Regole ferree: nessun elemento cliccabile in Newsreader; nessun testo oltre
  le due righe in Franklin; niente terzo font, niente mono, niente
  maiuscoletto spaziato, niente corsivo nei titoli, niente parola colorata.

### Scala

Il **foglio** (da 640 px in su) ha corpi fissi: è un oggetto stampato, identico
a 768 e a 2560. La **colonna** (sotto 640) ha corpi fluidi 320 → 639. I
**pannelli** (scheda, giro) sono fluidi 375 → 1440.

| Voce | Foglio | Colonna (375) | Peso | Interlinea |
|---|---|---|---|---|
| Testata *EVIDENZIA* | 144 | 52 | F 900 | 0,86, −0,02 em |
| Messaggio del riquadro (h2) | 34 | 29,4 | F 800 | 1,08, −0,015 em |
| Sottotesto, riga di testata | 18 | 16,3 | N 400 | 1,45 |
| Barra di rubrica | 20 | 18 | F 800 | 1 |
| Attacco T | 22 | 22 | F 800 | 1,1 |
| Attacco R | 20 | 20 | F 800 | 1,1 |
| Attacco P, F | 16 | 18 | F 800 | 1,2, −0,01 em |
| Cerchiamo (attacco) | 16 | 17 | F 700 | 1,2 |
| Testo annuncio | 15 | 16 | N 400 | 1,4 (21 px) / 1,45 |
| Prezzo P, F / T, R | 17 / 20 | 18 / 20 | F 700 tab. | 1,15 |
| Titolo box | 20 | 20 | F 800 | 1,1 |
| Listino €/m² | 15 | 16 | F 500 tab. | 1,6 |
| Citazione | 18 | 18 | N 400 corsivo | 1,4 |
| Data, sommario | 18 / 16 | 16 / 16 | F 700 | 1,2 |
| Bottone | 15 | 16 | F 700 | 1,15 |
| Servizio (Rif., piede, OSM) | 14 | 14 | F 500 | 1,35 |

Pannelli: titolo scheda 24 → 32 (F 800), prezzo scheda 28 → 36 (F 700),
confronto €/m² 18 → 20 (F 700, è un titolo secondario, non una nota),
descrizione 17 → 18 (N 400, 1,5), titolo giro 28 → 40, orario di tappa
24 → 30 (F 700 tabellare), etichette 16 (F 700), campi 17, errori 16 (F 700).

### Misure verificate (Chromium, woff2 veri)

- *EVIDENZIA* a 144 px = 808 px: sta in c1-c3 (844). A 375: 52 px su 343.
- "Il giro di sabato lo prepariamo noi." a 34 px = 530 px: una riga su 556.
- Attacco P/F a 16 px: circa **32 caratteri per riga** a 268 px. Più lungo va
  su due righe (il tratto regge due righe). A 18 px nella colonna: circa 36.
- Prezzi, orari, listino e riferimenti sempre `tabular-nums lining-nums`,
  formato italiano "€ 168.000".

### Ripiego

`@font-face` locali tarati in `tokens.css`: Arial Bold / Liberation Sans Bold
per Franklin (101,1%), Times / Liberation Serif per Newsreader (105,5%,
corsivo 92,4%), con ascent e descent dei file veri. I tratti si misurano
solo dopo `document.fonts.ready`. Il ripiego serif è Times e non Georgia:
Georgia manca su Linux e Android e non ha gemelli metrici.

## 4. Component Stylings

### Annuncio (quattro formati)
- Fondo carta, nessun bordo tranne il formato R (2 px nero). Tra due annunci
  della stessa colonna: filetto retino 1 px con 12 px sopra e sotto.
- Ordine: foto a retino (se c'è, altezza fissa) → attacco (h3 con bottone,
  Franklin 800) → testo (Newsreader) → prezzo (Franklin 700) → riga finale
  con "Rif. 214" (servizio, secondario) a sinistra e **Evidenzia** a destra.
- Attacco: sembra testo, non un bottone. Hover: sottolineatura 1 px nero;
  cursore `text` sul corpo dell'annuncio (il gesto del tratto).
- Formato C (Cerchiamo): attacco Franklin 700, niente Rif., niente bottoni.

### Tratto dell'evidenziatore
- SVG sopra la riga d'attacco, `mix-blend-mode: multiply`, gruppo a opacità
  0,85; dentro: corpo 0,88, due-tre striature 0,62, estremità a scalpello 1.
  Composti: 0,75 / 0,53 / 0,85. L'inchiostro nero resta nero: 4,96:1 nel
  punto più scuro.
- **Mai due tratti sovrapposti** (a opacità 1 il nero scende a 4,28:1).
- Copre **solo testo nero Franklin 800** (l'attacco). Mai `--evd-secondario`
  sotto il rosa (2,48:1).
- Altezza 1,15 × corpo, oscillazione ≤ 2 px, rotazione ≤ 0,6°.
- Scarico (quinto annuncio): stesso disegno, gruppo a 0,35 e a strisce.

### Bottoni
- **Pieno** (Prepara il giro, Manda il giro, Evidenzia premuto): nero, testo
  carta, raggio 0, 44 px (52 nel giro, 56 sotto 640). Un'etichetta sola per
  intento: "Prepara il giro" è l'unico richiamo alla visita.
- **Filo** (Evidenzia, Leggi, Pagina intera, Prima, Dopo, Togli): carta, filo
  nero 1 px, testo nero. `:active` → `--evd-carta-premuta`.
- **Disattivo** ("Mando il giro…"): fondo secondario, testo carta (6,43:1).
- Icona Phosphor "Highlighter" 20 px + testo; mai icona sola.

### Barre di rubrica
Nero pieno 36 px, nome in Franklin 800 20 px carta, in minuscolo con maiuscola
iniziale, rientro 10 px. Interrompono i filetti di colonna.

### Box redazionali
Titolo Franklin 800 20 px sopra un filo nero 3 px (non una barra); corpo
Newsreader 15. Listino: tabella senza righe zebrate, filetto retino tra le
righe, cifre tabellari allineate a destra. "Hanno comprato con noi": bordo
nero 2 px come il formato R, citazioni in Newsreader corsivo 18.

### Molo (comandi fissi, ≥ 640)
Ritaglio di carta con filo nero 1 px, niente ombra. Posti 44 × 44 con tratto
36 × 18: pieno = rosa con numero di tappa nero Franklin 800 14; vuoto =
contorno tratteggiato secondario 1 px. Minipagina 150 × 168: colonne in
retino, segni rosa, finestra come rettangolo nero 1,5 px.

### Campi
Fondo carta, bordo nero 1 px (2 px in errore o col fuoco), 48 px (56 sotto
640), testo 17 px. Etichetta sopra in Franklin 700 16, errore sotto in
Franklin 700 16 nero preceduto da "Manca" / "Controlla". Nessun segnaposto
come etichetta.

### Fuoco e link
Fuoco: `outline: 2px solid var(--evd-nero)`, `outline-offset: 2px`,
`box-shadow: var(--evd-fuoco-alone)` (alone carta 2 px che riempie lo stacco:
leggibile anche su barre e bottoni neri). Link: nero, sottolineato 1 px a
0,18 em, 2 px in hover.

### Mappa
Tile OSM standard con `grayscale(0.35)`, contenitore carta, spigolo vivo.
Percorso rosa 11 px, 0,55, multiply, estremità squadrate. Marcatori: macchia
rosa 40 × 26 a 0,85 con il numero nero Franklin 800 16 (≥ 4,98:1 su ogni
tile). Agenzia: quadrato nero 28 px con lettera carta. Controlli zoom nero su
carta, raggio 0. Attribuzione in Franklin 500 14, nero su carta al 90%.

## 5. Layout Principles

### Il foglio (≥ 640 px)
- 1840 × circa 2060 px: margini 66, sei colonne da 268, canaletti da 20.
  Colonne c1 66, c2 354, c3 642, c4 930, c5 1218, c6 1506.
- Margine alto 72 (sotto ConceptBackButton). Spazio a destra 360 e in basso
  320 perché il molo non copra mai un annuncio.
- **Filetti di colonna** 1 px retino al centro dei canaletti, continui dall'alto
  al piede, disegnati una volta dal fondo del contenitore. I blocchi a più
  colonne (riquadro di testa, formato R, box a 2 colonne, barre) hanno fondo
  carta e li interrompono.
- Un solo filo nero spesso (3 px) sotto la testata; filo nero 1 px sopra il
  piede. Niente doppi filetti, niente onde, niente spazi "di respiro" tra
  rubriche: la rubrica dopo comincia subito sotto.
- Ritmo: i formati P, F, T, R sono l'unica fonte di varietà. In ogni finestra
  a 1440 almeno un riquadro e al massimo due foto affiancate.
- Allineamento a sinistra ovunque, mai giustificato, niente sillabazione.

### La colonna (< 640 px)
- 343 px a 375 (margini 16). Testata compatta, striscia delle rubriche, barra
  del giro 48 px sticky, barre di rubrica sticky 36 px, filetto retino tra
  annunci, 88 px vuoti in fondo per ConceptBackButton.
- Niente filetti verticali, niente minipagina.

### Pannelli
Scheda 720 px a destra, giro 960 (mappa 520 + colonna 440), filo nero 1 px sul
bordo sinistro, velo nero 30% sul foglio. Sotto 640: tutto schermo.

## 6. Depth & Elevation

Tutto è piatto: è carta stampata. Un'unica ombra, `--evd-ombra-stacco`, color
carta scura (`#58503C` a 16% e 42%), solo durante lo stacco dell'annuncio.
Scheda, giro e molo si staccano con un filo nero, non con un'ombra. Livelli z:
foglio 0, comandi 20, avviso "scarico" 25, velo 30, scheda 40, giro 50.

### Texture: una sola, il retino delle foto
Niente grana o fibra di carta. Le foto sul foglio sono stampate a **retino a
due schermi** (file PNG preparati offline):
- schermo **retino** `#8F8B82` a 45° per tutti i toni;
- schermo **nero** `#1C1C1A` a 15° solo nelle ombre (tono oltre il 45%);
- passo **3 px CSS** (6 px nel file 2× da 536 px), punti tondi, carta
  trasparente, contrasto automatico all'1%.
Provato a schermo contro il passo 4 px e contro lo schermo unico a due
colori: il doppio schermo dà un tono continuo con la rosetta vera; il passo
4 px diventa un effetto grafico e perde la casa. In Pagina intera le foto
diventano un piatto `--evd-retino-piatto` (a scala 0,4 i punti farebbero
moiré). Nella scheda la stessa foto è a colori, a tutta larghezza, senza
cornice né didascalie sopra.

## 7. Do's and Don'ts

### Do
- Contare il rosa: pagina aperta a memoria vuota, rosa < 1% della superficie.
- Dare a ogni stato un segno non cromatico (etichetta, riempimento nero,
  numero, tratteggio).
- Tenere i corpi del foglio fissi e misurare l'impaginato dopo i font.
- Usare solo `var(--evd-*)`: nessun hex fuori da `styles/tokens.*`.
- Scrivere il nuovo in grassetto nell'attacco ("Nuovo: …"), come un giornale.

### Don't
- Niente rosa su testo, bottoni, link, fondi, titoli; niente secondo accento.
- Niente bianco, niente crema, niente carta ingiallita o texture.
- Niente raggi, niente ombre generiche, niente card con bordino e ombra.
- Niente Playfair, Cormorant, corsivi nei titoli, maiuscoletto spaziato,
  mono, sezioni "01 ·".
- Niente testo in retino; niente testo secondario sotto il tratto; niente
  tratti sovrapposti.
- Niente badge sulle foto, niente cuori, niente spilli a goccia.
- Niente tratto decorativo nei titoli oltre al solo "Segna".
- Niente bianco-nero-rosso svizzero (STUDIO FORMA) né cobalto (BATTIFILO).

## 8. Responsive Behavior

| Larghezza | Forma |
|---|---|
| < 640 | Colonna del giornale piegato, corpi fluidi 320 → 639 |
| 640 – 1023 | Foglio identico, 2-3 colonne visibili, molo (zone nascoste sotto 700) |
| ≥ 1024 | Foglio, molo completo |
| 2560 | Stesso foglio: la finestra ne mostra di più, niente si ingrandisce |

- Altezza < 560: molo a una riga (52 px). Colonna con altezza < 480: barre di
  rubrica non sticky.
- Touch: bersagli 44 × 44 minimi; il bottone Evidenzia sempre visibile.
- Zoom 400% da 1280: la finestra utile scende sotto 640 e diventa colonna;
  tutti i corpi sono in rem.
- Nessun `user-scalable=no`.

## 9. Agent Prompt Guide

### Riferimento rapido
carta `#E4DFD1` · nero `#1C1C1A` · secondario `#4F4C46` · retino `#8F8B82`
(mai testo) · rosa `#EE5A9E` (solo gesti, multiply 0,85). Franklin
900/800/700/500 per chiamare, Newsreader 400 per leggere. Raggio 0.

### Prompt d'esempio
- *Annuncio P*: "Articolo su carta, larghezza 268, attacco Franklin 800 16/1,2
  nero, testo Newsreader 15/1,4, prezzo Franklin 700 17 tabellare, riga finale
  Rif. 14 px secondario + bottone Evidenzia 44 px a filo nero; filetto retino
  1 px sotto con 12 px di aria."
- *Barra di rubrica*: "Nero pieno alto 36, testo carta Franklin 800 20,
  rientro 10, nessuna icona."
- *Tappa del giro*: "Orario Franklin 700 24 → 30 tabellare, attacco con il
  suo tratto rosa, prezzo, tragitto in Newsreader 16, bottoni Prima / Dopo /
  Togli a filo nero 44 px."

### Guida all'iterazione
Se una schermata sembra vuota, aggiungi contenuto vero, non aria. Se sembra
vecchia, togli, non aggiungere carta. Se il rosa si nota prima di aver
toccato qualcosa, è un errore.
