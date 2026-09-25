# Vector artist · Concept 10 · IMPRONTA

Ondata 2. File esclusivi: `src/pages/concepts/impronta/assets/svg/*`,
`public/favicon.svg`, questo documento.

Letti: `docs/creative-director.md` (§3, §4.2 sezione 5, §4.5), `docs/trend-researcher.md`,
`docs/ux-architect.md` (§5.5 Legatoria), `docs/tech-architect.md` (§3, §3.1, §4, §8),
`.claude/skills/image-to-svg/SKILL.md`, `.claude/skills/full-output-enforcement/SKILL.md`.

## 0. Metodo (e perché niente image-to-svg)

La skill `image-to-svg` serve a vettorializzare raster esistenti. Qui non ce ne sono:
la bottega è immaginaria, non esiste un logo raster da ricalcare, la rete verso le
banche immagini è bloccata e il CD vieta foto e illustrazioni figurative. Per questo
**tutti gli SVG sono disegnati a mano**, come geometria:

- il marchio con uno script Python che costruisce le lettere su una griglia (altezza
  100, asta 27, traversa 22) come poligoni e rettangoli a raggio fisso;
- gli schemi di cucitura con uno script che descrive il percorso del filo in 3D
  (x lungo il blocco, y lungo il dorso, z nello spessore) e lo proietta in
  assonometria obliqua, così ogni passaggio "dentro il foglio" resta visibile come
  segmento reale e il filo è un'unica polilinea continua.

Nessun raster è stato generato, quindi nessun passaggio di `image-to-svg`.
Ottimizzazione: `svgo@4` via `npx` (multipass, precisione 1 decimale, `cleanupIds`,
`removeTitle`, `removeViewBox` e `convertShapeToPath` disattivati per tenere id,
titoli e cerchi dei fori). Il favicon è rimasto a mano: svgo spostava i colori in
`style` inline e rompeva la variante scura.

Verifica: ogni SVG renderizzato in PNG con Chromium headless (playwright globale,
`/opt/pw-browsers`) su Citrino e su Grafite, a 1× e 2×, più il marchio a 24 px di
altezza, come maschera (`<img>`, nero su trasparente) e in argento su Grafite, e lo
stato a metà animazione (`stroke-dashoffset` = 50 %) di due schemi. Controllati a
vista e corretti fino a quattro giri (distanza dei fori dal dorso nella giapponese,
cappio della catenella, fascicolo del punto metallico).

## 1. Elenco degli asset

| File | viewBox | Peso | Contenuto |
|---|---|---|---|
| `assets/svg/marchio-impronta.svg` | `0 0 941 100` | 819 B | parola IMPRONTA, un solo `path` pieno |
| `assets/svg/filo-brossura.svg` | `0 0 240 300` | 1,5 KB | brossura cucita a filo refe, 3 segnature, 4 stazioni |
| `assets/svg/filo-cartonato.svg` | `0 0 240 300` | 2,0 KB | cartonato cucito su 2 fettucce, 3 segnature, 6 stazioni |
| `assets/svg/filo-giapponese.svg` | `0 0 240 300` | 1,2 KB | legatura giapponese a 4 fori (yotsume toji) |
| `assets/svg/filo-punto-metallico.svg` | `0 0 240 300` | 1,2 KB | fascicolo con 2 graffe sulla piega |
| `assets/svg/freccia.svg` | `0 0 16 16` | 213 B | freccia diagonale per i link esterni |
| `assets/svg/index.ts` | | | export `?raw` + dati per l'animazione (`FILI`) |
| `public/favicon.svg` | `0 0 64 64` | 312 B | "IM" su Citrino, variante Grafite in modo scuro |

Totale SVG: 7,2 KB (budget del tech-architect: 25 KB).

Regole comuni: nessun `transform`, nessun `style` inline, nessun colore fisso (tutto
`currentColor`) tranne il favicon, che non può ereditare un colore. Spigoli vivi nel
marchio e nella freccia (`stroke-linecap="square"`), come chiede il CD.

## 2. Marchio `marchio-impronta.svg`

- Tipografico, maiuscolo, esteso e nero, in famiglia con Anybody largo ma
  disegnato a parte: il marchio è un segno fisso, indipendente dal font caricato.
- **Un solo `path id="marchio"`**, `fill="currentColor"`, regola di riempimento
  nonzero: contorni esterni in senso orario, controforme (P, R, O, A) in senso
  antiorario. Niente tratti, niente sovrapposizioni, niente parti sotto 22 unità
  su 100: a 24 px di altezza l'asta è 6,5 px e la traversa 5,3 px, leggibile e
  valido come **maschera per rilievo e lamina** (il `maskPainter` lo disegna pieno
  nel canale B o R senza artefatti).
- Proporzione: larghezza = altezza × 9,41 (`MARCHIO_RAPPORTO` in `index.ts`).
  Minimo consigliato 20 px di altezza (190 px di larghezza); nella Testata 24-28 px.
- Accessibilità: `role="img"` con `<title id="marchio-titolo">IMPRONTA</title>`.
  Se sta dentro un link che ha già il testo "IMPRONTA, torna all'inizio", mettere
  `aria-hidden="true"` sul contenitore.
- Per la maschera WebGL: caricato come `Image` da blob, `currentColor` vale nero.
  Se serve bianco, sostituire nella stringa `fill="currentColor"` con
  `fill="#fff"` prima di creare il blob.

## 3. Schemi di cucitura

### 3.1 Convenzioni comuni ai quattro

- viewBox **240 × 300**, stesso formato per tutti: si impilano in colonna.
- Il filo **entra in (16, 0) ed esce in (16, 300)** in tutti e quattro: il
  section-builder può tracciare il filo della sezione come una linea verticale a
  x = 16/240 della larghezza dello schema e il percorso resta continuo da una
  fermata all'altra. Il primo e l'ultimo tratto (dal bordo al primo foro e
  dall'ultimo punto al bordo) sono il filo della sezione che arriva e riparte,
  non fanno parte della cucitura.
- Vista: assonometria obliqua. Nelle segnature e nel punto metallico il dorso è
  in verticale (testa in alto) e l'**interno della piega sta in alto a destra**
  del dorso: ogni passaggio nel foro è il breve tratto diagonale, il tratto
  interno corre parallelo al dorso, spostato. Nella giapponese la profondità va
  in alto a sinistra, verso il piatto posteriore.
- Elementi e id (prefisso = nome della legatura):
  - `<path id="filo-…">` il filo: `stroke-width="2.4"`, capi e giunti tondi,
    **un solo sottotracciato continuo** (verificato: Chromium riparte il
    tratteggio a ogni sottotracciato, per questo niente `M` intermedi);
  - `<path id="…-carta">` pieghe, piatti, dorso: `stroke-width="1"`, `opacity=".5"`;
  - `<g id="…-fori">` cerchi r 3,2 sui fori esterni;
  - `<g id="…-numeri">` numeri dei fori, `<text>` in Hanken Grotesk 600, corpo
    10 unità (12 px con lo schema largo 288 px);
  - solo cartonato: `<path id="cartonato-fettucce">` (riempimento al 10 %).
- Gli id sono unici tra i file, ma un file inserito due volte nella stessa pagina
  li duplica: inserire ogni schema una volta sola (o rimuovere gli id dalla copia).

### 3.2 Lunghezze per l'animazione

Misurate con `getTotalLength()` in Chromium sui file ottimizzati.

| Legatura | Path | Lunghezza | Inizio cucitura | Fine cucitura |
|---|---|---|---|---|
| brossura | `#filo-brossura` | **1224,6** | 0,110 | 0,895 |
| cartonato | `#filo-cartonato` | **1330,5** | 0,098 | 0,906 |
| giapponese | `#filo-giapponese` | **1697,7** | 0,114 | 0,857 |
| punto metallico | `#filo-punto-metallico` | **300** | (non cuce) | |
| punto metallico | `#graffa-1` | **99,9** | | |
| punto metallico | `#graffa-2` | **99,9** | | |
| servizio | `#freccia` | 23,6 | | |

"Inizio" e "fine" sono frazioni del path: prima di "inizio" il filo scende dal bordo
al primo foro, dopo "fine" riparte verso il bordo. Nella brossura, fermate utili per
lo scrub: 0,299 fine della prima segnatura, 0,518 fine della seconda, 0,629 inizio
della terza. Nel cartonato: 0,301, 0,531, 0,633.

Uso minimo (i valori sono anche in `FILI` di `index.ts`):

```ts
const filo = contenitore.querySelector<SVGPathElement>('#filo-brossura')!
filo.style.strokeDasharray = '1224.6'
filo.style.strokeDashoffset = String(1224.6 * (1 - progresso)) // progresso 0 → 1
```

In alternativa si aggiunge `pathLength="1"` al path e si anima l'offset da 1 a 0;
l'ho lasciato fuori dai file perché cambia anche eventuali tratteggi del CSS.
Reduced motion: niente dasharray, filo già intero (è lo stato di riposo dei file).

### 3.3 Brossura cucita a filo refe `filo-brossura.svg`

Tre segnature viste dal dorso, quattro stazioni (1 e 4 di catenella, 2 e 3
centrali). Percorso:

1. il filo arriva dalla testa e resta fuori come coda (nodo più tardi);
2. **segnatura 1, testa → piede**: entra in 1, corre dentro fino a 2, esce, corre
   sul dorso fino a 3, entra, dentro fino a 4, esce;
3. **segnatura 2, piede → testa**: entra in 4, dentro fino a 3, esce, sul dorso fino
   a 2, entra, dentro fino a 1, esce;
4. **nodo in testa** con la coda della segnatura 1 (il cappio sopra il foro 1);
5. **segnatura 3, testa → piede**, come la 1;
6. **punto a catenella al piede**: il filo passa dietro il tratto che collega le
   segnature 1 e 2 alla stazione 4 e torna nel proprio cappio (il cerchio sotto);
7. il filo riparte verso il bordo.

La copertina incollata della brossura non è disegnata: lo schema mostra solo il filo,
che è la parte "cucita a filo refe" di cui parla il testo.

### 3.4 Cartonato `filo-cartonato.svg`

Stesso blocco di tre segnature, cucito **su due fettucce** (le bande orizzontali che
sporgono ai lati: verranno incollate ai cartoni). Sei stazioni: 1 e 6 di catenella,
2-3 attorno alla prima fettuccia, 4-5 attorno alla seconda. In ogni segnatura il filo
è dentro tra 1-2, 3-4, 5-6 e **fuori sopra la fettuccia** tra 2-3 e 4-5, cioè la
abbraccia. Stesso ordine della brossura: 1 testa → piede, 2 piede → testa, nodo in
testa, 3 testa → piede, catenella al piede.

### 3.5 Legatura giapponese a 4 fori `filo-giapponese.svg`

Blocco visto di tre quarti: piatto anteriore, faccia di testa, faccia del dorso a
sinistra. Fori a 38 unità dal dorso, numerati 1-4 dalla testa. Il filo nascosto tra i
fogli parte dal foro 2 (il vertice dove arriva e riparte il filo della sezione).
Sequenza vera, 12 tratti visibili, ognuno una volta sola:

| Passo | Tratto | Lato |
|---|---|---|
| a | giro sul dorso al foro 2 | dietro → davanti → dietro |
| b | 2 → 3 | dietro |
| c | giro sul dorso al foro 3 | |
| d | 3 → 4 | davanti |
| e | giro sul dorso al foro 4 | |
| f | giro sul piede al foro 4 | |
| g | 4 → 3 | dietro |
| h | 3 → 2 | davanti |
| i | 2 → 1 | dietro |
| j | giro sul dorso al foro 1 | |
| k | giro sulla testa al foro 1 | |
| l | 1 → 2, nodo tra i fogli al foro 2 | davanti |

Risultato: su entrambi i piatti la linea continua testa-1-2-3-4-piede e i quattro
giri orizzontali sul dorso, come nella legatura finita.

### 3.6 Punto metallico `filo-punto-metallico.svg`

Qui **non c'è filo refe**: la cucitrice forma due graffe da filo metallico. Per
onestà lo schema lo dice con il disegno:

- `#filo-punto-metallico` è il filo della sezione che passa accanto, dritto, da
  (16, 0) a (16, 300), senza cucire;
- `#graffa-1` (fori 1-2) e `#graffa-2` (fori 3-4) sono due path continui separati:
  gamba ribattuta all'interno, passaggio nella piega, corona sul dorso, passaggio,
  gamba ribattuta verso l'altra. Si animano con lo stesso metodo (lunghezza 99,9),
  meglio **insieme**, come le teste della cucitrice che battono in un colpo solo.
- Il fascicolo è mezzo aperto (le due facciate esterne ai lati della piega), così
  si capisce che le gambe si chiudono dentro, al centro del fascicolo.

## 4. `freccia.svg`

Freccia diagonale in alto a destra, tratto 1,8 su 16, `stroke-linecap="square"`
(spigolo vivo), `aria-hidden="true"`. Da usare a `1em` accanto al testo dei link
esterni (Apri in Maps, CiceriLab): il testo del link resta l'etichetta, la freccia è
solo segnale. Non va usata per link interni né per "Prova la tua".

## 5. `public/favicon.svg`

Quadrato Citrino `#E4CF3F` a spigolo vivo con "IM" del marchio in verde notte
`#17231D`; con `prefers-color-scheme: dark` diventa Grafite `#2A2C2F` con lettere
`#ECEBE6`. Verificato a 16, 32, 64 e 180 px: a 16 px la M resta distinta. Collegamento
in `index.html` (scaffold): `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.

## 6. Uso negli import

```ts
import { marchioImpronta, freccia, FILI, ORDINE_LEGATURE } from '../../assets/svg'
// inline: <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: FILI.brossura.svg }} />
```

`?raw` richiede i tipi di Vite (`/// <reference types="vite/client" />` in
`vite-env.d.ts`, file dello scaffold). `index.ts` non tocca `window` né `document`:
va bene per il prerender. Nessun asset sta in `public/` tranne il favicon, come da
regole di porting.

## 7. Richieste ad altri agent

- **scaffold-engineer**: `vite-env.d.ts` con `/// <reference types="vite/client" />`
  (per `?raw`) e il `<link rel="icon">` al favicon in `index.html`.
- **section-builder-legatoria**: inserire gli schemi inline (non come `<img>`: il
  colore viene da `currentColor` e il path va animato), contenitore `aria-hidden`,
  larghezza consigliata 240-300 px su desktop; il filo verticale tra una fermata e
  l'altra a x = 16/240 della larghezza dello schema. Su 375 px, se lo schema non
  entra nel margine di 56 px, mostrare solo il filo verticale e lo schema ridotto
  sopra il testo di ogni fermata.
- **webgl-artist**: per il marchio in lamina usare la stringa `marchioImpronta` con
  `fill` sostituito in bianco (§2).
