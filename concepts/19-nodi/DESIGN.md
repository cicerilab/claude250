---
version: 1
name: NODI-liuteria
description: Sito di una bottega di liuteria di Pordenone costruito attorno a una sola tavola armonica di violino vista in pianta, ferma al centro dello schermo. Scorrendo, un altoparlante immaginario sale di frequenza e le foglie di tè sparse sulla tavola disegnano le figure di Chladni dei modi 1, 2 e 5; ogni figura porta un contenuto. Si prenota uno strumento nuovo posando una foglia su un piano del suono. Tema unico chiaro color abete, testo color tè, titoli in ebano con IM Fell DW Pica, vernice rossa bruna solo sulle cifre, Spline Sans per leggere e per i numeri. Spigolo vivo ovunque tranne gli oggetti (cuscinetti, foglia).

colors:
  abete: "#E6D4AC"
  abete-scuro: "#DCC593"
  abete-vena: "#D6BF8E"
  te: "#3B2B1D"
  te-chiaro: "#5D4D3A"
  vernice: "#8B3A1D"
  ebano: "#16120F"
  assi: "#7C6B53"
  tacca: "#7F6F56"
  cuscinetto: "#B2A485"
  ombra: "#C4B28F"

typography:
  titolo-1:
    fontFamily: IM Fell DW Pica
    fontSize: 34px → 48px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.005em
    note: un solo h1; al massimo 36 caratteri (due righe a 384 e a 335 px, misurato)
  titolo-2:
    fontFamily: IM Fell DW Pica
    fontSize: 32px → 56px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.005em
  titolo-3:
    fontFamily: IM Fell DW Pica
    fontSize: 24px → 28px
    fontWeight: 400
    lineHeight: 1.15
  marchio:
    fontFamily: IM Fell DW Pica
    fontSize: 28px → 40px
    fontWeight: 400
    lineHeight: 1
  marchio-riga-2:
    fontFamily: IM Fell DW Pica
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.2
    note: solo sul largo, unica eccezione alla soglia di 24 px
  radio-strumento:
    fontFamily: IM Fell DW Pica
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.2
  valore:
    fontFamily: Spline Sans
    fontSize: 24px → 44px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -0.01em
    fontVariantNumeric: tabular-nums
  cifra:
    fontFamily: Spline Sans
    fontSize: 24px → 32px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -0.01em
    fontVariantNumeric: tabular-nums
  lead:
    fontFamily: Spline Sans
    fontSize: 17px → 19px
    fontWeight: 400
    lineHeight: 1.5
    wordSpacing: 0.06em
  corpo:
    fontFamily: Spline Sans
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
    wordSpacing: 0.06em
    maxWidth: 60ch
  piccolo:
    fontFamily: Spline Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    wordSpacing: 0.06em
  nota:
    fontFamily: Spline Sans
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.45
    wordSpacing: 0.06em
  scala:
    fontFamily: Spline Sans
    fontSize: 11px → 12px
    fontWeight: 500
    lineHeight: 1
    fontVariantNumeric: tabular-nums
  modo:
    fontFamily: Spline Sans
    fontSize: 12px → 14px
    fontWeight: 500
    lineHeight: 1.2
  etichetta:
    fontFamily: Spline Sans
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.25
  bottone:
    fontFamily: Spline Sans
    fontSize: 17px
    fontWeight: 500
    lineHeight: 1
  campo:
    fontFamily: Spline Sans
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.3

rounded:
  none: 0px
  oggetto: 50%

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
  bordo: 20px (stretto) / 72px (largo, x del margine di lettura)
  lettura: clamp(320px, 26.7vw, 440px)
  tavola: min(86svh, 1000px) di altezza, rapporto 240 / 388
  cornice: 54svh → 34svh (stretto)
  regolo: 56px (stretto, orizzontale) / alto quanto la tavola (largo)
  banco: 180px, a 40px dal bordo destro (da 1200px)

components:
  bottone-principale:
    backgroundColor: "{colors.ebano}"
    textColor: "{colors.abete}"
    typography: "{typography.bottone}"
    rounded: "{rounded.none}"
    height: 52px
    padding: 0 24px
    pressed: backgroundColor "{colors.te}"
  link:
    textColor: "{colors.te}"
    underline: 1px "{colors.te}", offset 3px
    current: underline 2px "{colors.ebano}", offset 5px
  interruttore-suono:
    backgroundColor: transparent
    textColor: "{colors.te}"
    border: 1px "{colors.te}"
    height: 44px
    pressed: border 2px "{colors.ebano}", testo "Suono acceso"
  righello:
    binario: 1px "{colors.te}"
    tacca-10hz: 8px x 1px "{colors.tacca}"
    tacca-50hz: 14px x 1px "{colors.te}"
    cifre: "{typography.scala}" "{colors.te}"
    cursore: 20px x 3px "{colors.vernice}" in area 44 x 44
    valore: "{typography.valore}" "{colors.vernice}"
    trovato: 9px x 2px "{colors.ebano}"
  piano-del-suono:
    backgroundColor: "{colors.abete-scuro}"
    size: 320px (largo) / larghezza della colonna (stretto)
    assi: 1px "{colors.assi}"
    zona-equilibrata: cerchio tratteggiato 1px "{colors.assi}", raggio 18%
    foglia: 28px "{colors.te}" in area 44 x 44
    rounded: "{rounded.none}" (il piano), "{rounded.oggetto}" (area della foglia)
  campo:
    backgroundColor: "{colors.abete}"
    textColor: "{colors.te}"
    border: 1px "{colors.te}"
    height: 48px
    focus: border 2px "{colors.ebano}", backgroundColor "{colors.abete-scuro}"
    rounded: "{rounded.none}"
  errore:
    textColor: "{colors.te}"
    segno: barra 3px "{colors.vernice}" a sinistra del messaggio
  radio-strumento:
    typography: "{typography.radio-strumento}"
    textColor: "{colors.ebano}"
    selected: sottolineatura 2px "{colors.ebano}"
  menu-a-comparsa:
    backgroundColor: "{colors.abete}" al 98%
    border: 1px "{colors.ebano}"
    rounded: "{rounded.none}"
  foto:
    width: 360px (largo) / colonna (stretto)
    aspectRatio: 4 / 3
    backgroundColor: "{colors.abete-scuro}" (mentre carica)
    border: none
    rounded: "{rounded.none}"
---

# NODI · Design system

Concept 19 del Concept Lab di CiceriLab, rotta `/concept-19`. Documento di
riferimento per section-builder, webgl-artist, shader-engineer, motion e
interaction. I valori vivono in `src/pages/concepts/nodi/styles/tokens.css`
(variabili `--nod-*` su `.nod-root`) e `tokens.ts` (stessi valori in TS, con
le tre forme dei colori per three). Contrasti calcolati, misure dei font e
prove a schermo in `docs/art-director.md`. La direzione è quella di
`docs/creative-director.md` §4: qui diventa misura.

## 1. Visual Theme & Atmosphere

Un banco di bottega visto dall'alto. Tutta la pagina è dello stesso abete
saturo e dorato su cui sta la tavola: il sito non ha "sezioni", ha un solo
oggetto fermo al centro e due margini scritti, come le note a matita che il
liutaio lascia sul banco accanto alla tavola in prova. L'unica cosa che si
muove sono le foglie di tè.

Tre materiali e un colore di vernice, presi alla lettera dal gesto:
- **abete** `#E6D4AC`: la tavola e il banco. Più saturo e giallo delle creme
  dei concept 3, 6, 8 e dell'avorio dei siti di settore (`#F2EBE6`).
- **tè** `#3B2B1D`: le foglie e tutta la scrittura.
- **ebano** `#16120F`: tastiera e capotasto; qui titoli, bottone, contorno.
- **vernice** `#8B3A1D`: la vernice a olio del violino finito, che sulla
  tavola "in bianco" non c'è ancora. Per questo vive **solo sulle cifre**: è
  la misura scritta dal liutaio, non una decorazione.

Il carattere: laboratorio di acustica scritto con un cartiglio del Seicento.
IM Fell DW Pica porta la voce antica (i cartigli incollati dentro gli
strumenti), Spline Sans porta i numeri e la lettura. Nessuna cromatura, nessun
oro, nessun velluto, nessun nero di fondo.

## 2. Color Palette & Roles

### I quattro della direzione e i derivati

| Token | Hex | Ruolo |
|---|---|---|
| `--nod-abete` | `#E6D4AC` | fondo di tutta la pagina, base della tavola nello shader, testo sul bottone |
| `--nod-abete-scuro` | `#DCC593` | fondo del piano del suono e del campo a fuoco. Unica seconda superficie |
| `--nod-abete-vena` | `#D6BF8E` | solo le righe della vena nello shader. Mai nel DOM |
| `--nod-te` | `#3B2B1D` | testo, link, righello, bordi dei campi, foglie (tono scuro) |
| `--nod-te-chiaro` | `#5D4D3A` | tè all'80 % su abete: secondo tono delle foglie. Mai testo |
| `--nod-vernice` | `#8B3A1D` | **solo** cifre (Hz, euro, mesi, posto in lista, data di consegna), cursore del righello, tacca "la tua voce", segno d'errore |
| `--nod-ebano` | `#16120F` | titoli IM Fell, bottone principale, contorno della tavola, segni dei modi trovati, anello di fuoco |
| `--nod-assi` | `#7C6B53` | tè al 62 % su abete scuro: assi del piano del suono |
| `--nod-tacca` | `#7F6F56` | tè al 60 % su abete: tacche minori del righello |
| `--nod-cuscinetto` | `#B2A485` | ebano al 25 % su abete: i quattro cuscinetti nel GL |
| `--nod-ombra` | `#C4B28F` | tè al 20 % su abete: centro dell'ombra della tavola |

### Ruoli (nei componenti si usano questi, non i colori nudi)

`--nod-fondo`, `--nod-testo`, `--nod-titolo`, `--nod-cifra`, `--nod-cursore`,
`--nod-azione` / `--nod-azione-testo` / `--nod-azione-premuta`, `--nod-link`,
`--nod-regolo-*`, `--nod-piano-*`, `--nod-campo-*`, `--nod-errore-segno`,
`--nod-menu-*`, `--nod-selezione-*`, `--nod-fuoco`. Elenco completo con
commenti in `tokens.css`.

### Contrasti principali (tabella completa in `docs/art-director.md`)

tè su abete 9,28:1 · vernice su abete 5,28:1 · ebano su abete 12,75:1 · abete
su ebano 12,75:1 · tè su abete scuro 8,04:1 · assi su abete scuro 3,04:1 ·
tacche su abete 3,34:1 · bordo campo (tè) 9,28:1. Tutti calcolati con lo
script in appendice al doc.

### Divieti di colore

- Vernice mai su fondi, bottoni, titoli, link, icone, nel GL. Regola
  misurabile: la vernice copre **meno dell'1 %** dei pixel della finestra in
  ogni schermata (misurato sulla prova: 0,09-0,37 % a 1440, 0,75-0,98 % a 375).
  A 375 il margine è poco: niente cifre in vernice oltre a quelle previste.
- Nessun oro, ottone, ambra; nessun nero o marrone scuro come fondo; nessuna
  sezione invertita; nessun secondo tono di fondo oltre ad abete scuro (piano
  e campo a fuoco).
- Le foglie non cambiano mai colore né luminosità.
- Vernice su ebano (2,41:1) e tè su ebano (1,37:1) non esistono.

## 3. Typography Rules

### Famiglie

- **IM Fell DW Pica**, roman 400, mai il corsivo (non si chiede nemmeno
  nell'URL). Solo marchio, `h1`, `h2`, `h3`, radio dello strumento. Altezza
  della x 0,44 em: **mai sotto 24 px**; unica eccezione la seconda riga del
  marchio a 18 px, solo sul largo (provata a schermo: si legge come un
  cartiglio stampato). Niente cifre in IM Fell (non ha `tnum`).
- **Spline Sans** variabile 300-600: tutto il resto, e **tutte le cifre** con
  `font-variant-numeric: tabular-nums` (`tnum` verificato nel file).

### Gerarchia (375 → 1440, lineare in mezzo, ferma fuori)

| Ruolo | Famiglia | px | Peso | Interlinea |
|---|---|---|---|---|
| `h1` | IM Fell | 34 → 48 | 400 | 1,08 |
| `h2` | IM Fell | 32 → 56 | 400 | 1,05 |
| `h3` | IM Fell | 24 → 28 | 400 | 1,15 |
| marchio | IM Fell | 28 → 40 | 400 | 1 |
| radio strumento | IM Fell | 24 | 400 | 1,2 |
| valore del righello | Spline, cifre tabulari | 24 → 44 | 500 | 1 |
| cifre (Hz, euro, mesi) | Spline, cifre tabulari | 24 → 32 | 500 | 1 |
| lead (frase d'apertura) | Spline | 17 → 19 | 400 | 1,5 |
| corpo | Spline | 17 | 400 | 1,55 |
| piccolo (zona, invito) | Spline | 15 | 400 | 1,5 |
| nota | Spline | 13 | 400 | 1,45 |
| scala del righello | Spline, cifre tabulari | 11 → 12 | 500 | 1 |
| nome del modo | Spline | 12 → 14 | 500 | 1,2 |
| etichetta dei campi | Spline | 15 | 500 | 1,25 |
| bottone | Spline | 17 | 500 | 1 |
| campo | Spline | 17 | 400 | 1,3 |

### Regole

- L'enfasi si fa con la dimensione, mai con corsivo, colore o maiuscolo.
  Niente maiuscoletto spaziato, niente monospace, niente occhielli.
- **Spaziatura delle parole**: Spline Sans ha lo spazio stretto (0,18 em
  contro 0,28 di Arial); su tutto il testo Spline sotto i 20 px
  `word-spacing: var(--nod-spazio-parole)` (0,06 em). Sulle cifre grandi no.
- Corpo al massimo 60 caratteri per riga (`--nod-misura-riga`).
- `h1`: al massimo **36 caratteri** spazi compresi (a 48 px la frase intera su
  una riga deve stare sotto i 690 px). La frase d'esempio del CD (44
  caratteri) va a tre righe a 1440: misurato.
- Cifre in vernice, unità e parole attorno in tè: "da **9.500 €**",
  "**14** mesi", "Saresti il numero **7** in lista".
- Nessun trattino lungo in nessun testo.

### Ripiego dei font (niente salti)

`@font-face` locali in `tokens.css`: *Nod Fell Ripiego* (Times New Roman /
Liberation Serif, `size-adjust` 96,8 %) e *Nod Spline Ripiego* (Arial /
Liberation Sans, `size-adjust` 101,8 %), con `ascent`/`descent` tarati con
fontTools sui file di Google Fonts. Pile: `--nod-font-fell`, `--nod-font-spline`.

## 4. Component Stylings

### Bottone principale ("La voce che vorresti", "Mettimi in lista", "Ci vediamo sabato")
Fondo ebano, testo abete, Spline 17/500, alto 52 px, `padding` 0 24 px,
spigolo vivo, nessuna ombra. Premuto o sotto il puntatore: fondo tè (cambio
istantaneo, è una superficie piccola). Fuoco: anello ebano 2 px a 2 px di
distanza (l'abete in mezzo lo stacca). L'invio della voce è largo quanto
"Ti mettiamo in lista" in ogni stato.

### Link
Tè, sottolineati 1 px con 3 px di distanza. Elemento corrente (indice,
radio): sottolineatura 2 px ebano a 5 px. Nessun link colorato.

### Testata e marchio
"NODI" IM Fell 40 px ebano, "liuteria in Pordenone" IM Fell 18 px sotto (solo
sul largo). Nessuna cornice, nessun filetto. Su stretto "NODI" a 28 px è il
bottone del menu.

### Righello
- Binario 1 px tè. Tacche ogni 10 Hz 8 × 1 px in `--nod-tacca`; ogni 50 Hz
  14 × 1 px tè con la cifra (scala, 20 px dal binario). Su stretto cifre solo
  a 60, 100, 200, 300, 420.
- Cursore: segno vernice 20 × 3 px dentro un'area di 44 × 44.
- Valore corrente in vernice (valore, 24 → 44 px) su una **corsia sua** a
  64 px dal binario, centrato sul cursore; il nome del modo sotto, tè. Le
  cifre della scala entro 24 px dal cursore si nascondono (provato: a 352 Hz
  il "350" finiva sotto il valore).
- Modi trovati: segno ebano 9 × 2 px a cavallo del binario.
- "La tua voce": segno vernice 16 px a sinistra del binario, scritta 12 px tè.

### Indice (colonna del banco)
Righe da 40 px, nome a sinistra (Spline 15), "modo N" 12 px a destra con
`white-space: nowrap`. Voce corrente: sottolineatura 2 px ebano. La colonna è
larga 180 px (a 164 "modo 5" andava a capo: provato).

### Interruttore "Suono"
Bottone di testo con contorno 1 px tè, alto 44 px. Acceso: contorno 2 px
ebano e testo "Suono acceso". La nota sul volume (13 px) sta sempre sotto,
anche da spento.

### Piano del suono
Quadrato in abete scuro, 320 px sul largo, largo quanto la colonna su
stretto. Due assi 1 px in `--nod-assi` (il tè al 40 % del CD faceva 1,83:1,
sotto il 3:1 della grafica: corretto). Le quattro parole in Spline 14 px tè:
sul largo fuori dal quadrato, su stretto **dentro**, appoggiate sopra l'asse
orizzontale ai due estremi (fuori, "brillante" usciva dalla finestra a 375).
Zona "equilibrata": cerchio tratteggiato 1 px `--nod-assi`, raggio 18 %;
è l'unico tratteggio del sito. La foglia: scaglia tè 28 px, area 44 × 44.

### Radio dello strumento
IM Fell 24 px ebano, in riga sul largo e uno per riga su stretto; selezionato
= sottolineatura 2 px ebano. Niente pillole, niente pallini disegnati oltre
al cerchio nativo nascosto in modo accessibile.

### Campi
Fondo abete, bordo 1 px tè, alti 48 px, spigolo vivo, testo 17 px. A fuoco:
bordo 2 px ebano e fondo abete scuro. Etichetta sopra (Spline 15/500), errore
sotto: testo tè con una barra vernice 3 px a sinistra (non solo colore).

### Lista d'attesa, prezzi, riparazioni
Righe di testo, mai schede: frase in tè, cifre in vernice tabulari. Nessun
bordo, nessuna ombra, nessun filetto tra le righe; separazione con lo spazio
(32 px tra gli strumenti).

### Menu a comparsa (sotto i 1200 px)
Pannello abete al 98 %, contorno 1 px ebano, spigolo vivo, nessuna ombra.

### Foto
Rettangoli 4:3 senza cornice né didascalia poetica, 360 px sul largo,
colonna intera su stretto, fondo abete scuro mentre caricano, colori
naturali (nessun filtro, duotono o seppia). Mai sopra o dietro la tavola.

## 5. Layout Principles

### La griglia: il banco di prova

Non c'è una griglia a 12 colonne. Ci sono **due linee orizzontali**, il bordo
alto e il bordo basso del riquadro della tavola (`--nod-tavola-h`, centrato
in verticale), e **quattro corsie verticali**:

```
x  0    72              456       494          946   1000        1220     1400
   │ritorno│ lettura (scorre) │      │  TAVOLA   │      │ righello │  banco  │
   │ zona  │ 26,7vw 320-440   │      │ 86svh     │      │ binario  │ 180 px  │
```

- Tutto ciò che è fisso si allinea alle due linee: il righello va dal bordo
  alto al bordo basso della tavola; la colonna del banco finisce sul bordo
  basso; il blocco dell'apertura ha il fondo sul bordo basso (la "linea del
  banco").
- Il margine di lettura parte a x 72 e scorre; i testi lunghi vi scorrono
  sotto la linea alta (`top` 96 px al primo arrivo).
- La tavola è centrata sull'asse della finestra; l'asimmetria la fanno i
  margini (testo in basso a sinistra, righello a tutta altezza a destra,
  marchio in alto a destra).

### Ritmo verticale

Base 4 px (`--nod-sp-1` … `--nod-sp-10`). Titolo → testo 24 px, blocchi 32 px,
contenuti 64-96 px. Margine di piede di ogni contenuto 72 px (bottone del sito).

### Segni ammessi

Contorno della tavola (1 px ebano), binario e tacche, assi del piano,
sottolineature, barra d'errore. Nessun filetto decorativo, nessuna onda,
nessun divisore tra contenuti.

## 6. Depth & Elevation

- **Una sola ombra**: la tavola sul banco. Tè al 20 %, sfocatura 9 mm,
  spostamento 3 mm in basso (GL e poster: `OMBRA` in `tokens.ts`;
  `--nod-ombra-tavola` per il CSS se servisse al poster). Mai nera, mai su
  bottoni, campi, menu, foto.
- Nessuna elevazione nel DOM: il menu ha contorno, non ombra.

### Texture: la vena dell'abete (solo nello shader)

Righe dritte e fitte lungo la lunghezza, passo 1,4 mm al centro e 2,2 mm ai
fianchi (tagliato di quarto), ondulazione 0,18, contrasto 0,55 tra abete e
abete vena, giunta 0,25 mm al centro (`VENA` in `tokens.ts`). Nessuna
texture sul fondo della pagina: niente carta finta, niente grana.

### La scena (per webgl-artist e shader-engineer)

`SCENA` in `tokens.ts`: fondo e tavola abete, vena abete vena, contorno
ebano 1 px a DPR 1, ombra, foglie in due toni (tè e tè chiaro, scelti per
istanza e fissi), ombra delle foglie tè al 22 %, cuscinetti `#B2A485` pieno.
Il canvas deve combaciare **al byte** con l'abete CSS: fuori dal contorno
il frammento è trasparente; dentro, se si passano i colori `lin` alle uniform
di uno `ShaderMaterial`, includere `#include <colorspace_fragment>` (three
0.160) e verificare un pixel di tavola senza vena = `#E6D4AC` ±1.
Foglie: minimo 4 px sul lato lungo a schermo (`FOGLIE_SCHERMO`), su stretto
la scala si esagera fino a 2,2×.

## 7. Do's and Don'ts

### Do
- Lasciare che la tavola sia l'unica immagine forte della schermata.
- Cifre poche, grandi, in vernice, con la loro tolleranza in tè accanto.
- Spigolo vivo su tutto il DOM; tondo solo cuscinetti, foglia, radio.
- Usare i ruoli `--nod-*`, mai i colori nudi, mai hex fuori dai token.
- Provare ogni titolo a 384 e 335 px prima di consegnare.

### Don't
- Niente corsivo, maiuscolo spaziato, monospace, "01 ·", occhielli.
- Niente oro, nero di fondo, sezioni scure, secondo accento.
- Niente schede con bordo e ombra, pillole, filetti tra le sezioni.
- Niente bagliori, scie, particelle luminose, cambi di colore delle foglie.
- Niente icone decorative, illustrazioni di violini, note musicali, onde.
- Niente foto a tutta larghezza, in cornice, con "TAV.".

## 8. Responsive Behavior

### Punti di rottura
- **< 1100 px o rapporto < 5:4** (stretto): palco fisso in alto 54svh → 34svh,
  righello orizzontale 56 px sotto, testo a colonna con margini 20 px; a 768
  colonna `min(560px, 100% - 40px)` centrata.
- **≥ 1100 px e rapporto ≥ 5:4** (largo): tre corsie. Tra 1100 e 1199 la
  colonna del banco non c'è (marchio = menu, lettura `clamp(300px, 30vw,
  360px)`, tavola 80svh); da 1200 compare il banco.
- **2560**: la tavola non supera 1000 px di altezza; i margini crescono.

### Touch
Bersagli ≥ 44 × 44 (cursore, foglia, radio, sabati, interruttore).
`touch-action: pan-y` sulla tavola e sul piano, `none` solo sul cursore e
sulla foglia afferrata.

### 375 px
Marchio "NODI" 28 px in alto a destra, "Suono / spento" 13 px in alto a
sinistra, entrambi negli angoli vuoti del riquadro. `h1` 34 px su due righe,
`h2` 32 px. Cifre a 24 px. La seconda riga del marchio sta nel menu.

### Zoom e contrasto
A 400 % il testo resta in Spline 17 px equivalente; nessun testo dentro
immagini; tutti i contrasti ≥ 4,5:1 per il testo e ≥ 3:1 per la grafica dei
comandi.

## 9. Agent Prompt Guide

### Riferimento rapido dei colori
fondo abete `#E6D4AC` · testo tè `#3B2B1D` · titoli e bottone ebano
`#16120F` · cifre vernice `#8B3A1D` · piano abete scuro `#DCC593`.

### Prompt d'esempio
- "Scrivi la riga del violino in Costruire: `h3` IM Fell 28 px ebano
  'Violino', sotto una riga Spline con 'da' in tè 13 px e '9.500 €' in
  vernice 32 px tabulare, poi '14' vernice e 'mesi' tè; sotto una riga di
  corpo tè 17 px. Nessun bordo, 32 px prima dello strumento successivo."
- "Il valore del righello: Spline 500 44 px vernice tabulare, a 64 px dal
  binario, centrato sul cursore; 'modo 2' Spline 14 px tè sotto; nascondi le
  cifre della scala entro 24 px."

### Guida all'iterazione
Se una schermata sembra spoglia, non aggiungere ornamenti: aumenta la
dimensione del titolo o lascia più spazio alla tavola. Se sembra "beige da
artigiano", togli vernice, non aggiungere colore.
