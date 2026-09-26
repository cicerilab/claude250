# Art director · Concept 18 · SOTTOSCOCCA

Ondata 2. Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/matrice-concept-11-20.md` (riga e paragrafo 18), la skill
`design-taste-frontend` (§4, §9), tutti i doc dell'ondata 1 in
`concepts/18-sottoscocca/docs/` (creative-director, trend-researcher e i file
`/taste`, brand-strategist, ux-architect, tech-architect; letti anche
copywriter e vector-artist arrivati nel frattempo), il `DESIGN.md`, il doc e i
token del pilota `concepts/10-torchio/` (solo come formato). Deviazione
approvata dall'orchestratore: three puro al posto di R3F (non cambia nulla
nei token: `tokens.ts` dà hex, sRGB e lineare per `new Color()` di three).

## File consegnati

| File | Contenuto |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: tema, palette e ruoli, tipografia, componenti (bottoni, asta, punti, pannello di quota, scheda, barra, giorni, planning in tutti gli stati, campi, cartellino, foto), griglia, livelli, texture, scena, do/don't, responsive, prompt guide |
| `src/pages/concepts/sottoscocca/styles/tokens.css` | 5 `@font-face` di ripiego tarati; tutte le variabili `--ssc-*` su `.ssc-root` (colori, ruoli, veli, scala fluida, spazi, griglia, livelli, segni, punti, fuoco, martellata, trattamento foto); override a 768 / 1024 / 1680, `prefers-contrast: more`, `forced-colors` |
| `src/pages/concepts/sottoscocca/styles/tokens.ts` | `PALETTE` (hex, srgb, lin, variabile, ruolo), `OPACITA`, `SCENA` (ruolo → colore per il GL), `FONT_CSS_URL`, `FONT_DA_CARICARE`, pile di famiglie, `fontTarghetta()`, `METRICHE` misurate, `TIPO` + `fluido()` / `corpoA()` / `corpoMarchio()`, `SPAZI`, `PUNTI_ROTTURA`, `GRIGLIA`, `LIVELLI`, `SEGNI`, `contrasto()` |
| `qa/art-director/*.png` | prove a schermo (ignorate da git) |

Verifiche: `tsc --strict --noUncheckedIndexedAccess --noUnusedLocals` su
`tokens.ts` verde; valori `srgb` ricontrollati contro gli hex; stringhe
`clamp()` del CSS generate con la stessa `fluido()` del TS.

---

## 1. Decisioni

### 1.1 Font: confermo Tektur + Red Hat Text, misurati

Scaricati i woff2 da Google Fonts (26/09/2026) e misurati con fontTools e in
Chromium:
- **Tektur v6**: assi `wdth` 75-100, `wght` 400-900, upm 1000, ascent 1,0,
  descent 0,3, altezza maiuscole 0,70; ha `tnum`. Latin **19 KB**.
- **Red Hat Text v19**: `wght` 300-700, ascent 1,018, descent 0,305; ha `tnum`.
  Latin **30 KB**.
- Google serve **lo stesso file** qualunque gamma si chieda, quindi
  `FONT_CSS_URL` chiede `Tektur:wdth,wght@75..100,400..900` e
  `Red+Hat+Text:wght@400..700`: due file, 49 KB (budget 150).
- Né l'uno né l'altro hanno ✓ (U+2713) e → (U+2192): vedi richieste.
- Larghezze misurate in Chromium con `tabular-nums` (em): "SOTTOSCOCCA"
  maiuscolo wdth 100 / 700 = 6,80; "180" wdth 80 / 600 = 1,53 (0,51 a cifra);
  " cm" 1,72; "D-214" wdth 80 / 700 = 2,34; "Trova un buco" 6,96.
- **Larghezza con `font-stretch`**, mai `font-variation-settings`: il
  descrittore `font-stretch` dei ripieghi fa scegliere al browser il ripiego
  giusto (largo o stretto).
- Tektur a wdth 75 è davvero condensato: lo uso a **80** solo per cifre
  (quota, cartellino), 85 per prezzi e giorni, 90 per le targhette, 100 per
  titoli, marchio e bottoni. Niente parole sotto wdth 90: resta lontano dal
  condensato maiuscolo del bocciato.

### 1.2 Scala

Fluida lineare tra 375 e 1440 (`clamp()` in rem, zoom al 200% sicuro), tabella
completa in DESIGN.md §3. Scelte non ovvie:
- **Quota 96 → 192 px**: a 1440 "180 cm" occupa 455 px del banco da 519 (misurato),
  è il display del sito come vuole il CD. Il "cm" sta a 0,3 em, wdth 100.
- **Marchio** = `min(fluido 45 → 92, misura / 6,94)`: riempie la misura (c1-c6 a
  desktop, 628 px; larghezza utile 311 px a 375) e non può uscire nemmeno a
  320 px o a zoom testo 200%. Misurato: 615 px a 1440, 304 px a 375.
- Tektur mai sotto 20 px per parole (regola R4 del trend-researcher); numerali
  dell'asta e delle ore a 14 px wdth 80 sul telefono (entrano nell'asta da 32
  px) e 15 px da 768.
- Bottone principale in **Tektur** 20 / 600 (targhetta), bottoni secondari in
  Red Hat 700: due voci diverse, e "l'azione" si riconosce anche dal carattere.

### 1.3 Palette

Tengo i cinque colori del CD con un ritocco e tre derivati:
- **Zincato** da `#9AA19B` a `#A3AAA4`: il bordo 1 px dei blocchi occupati sulla
  corsia verde ombra passa da 2,90 a 3,23:1 (soglia 3 per gli oggetti grafici),
  il testo secondario su nero da 6,40 a 7,13:1.
- **Gesso** `#CDD2CB`: secondario sui pannelli verde ombra (4,99:1). Lo zincato
  lì farebbe 3,23 e non basta per il testo.
- **Bianco premuto** `#D9DBD3` (hover/premuto del bianco, nero sopra 12,11:1).
- **Nero alto** `#2A2C29`: giorni della striscia, fascia "passato", hover su nero.
- Nero su verde ombra fa solo 2,21:1: per questo i blocchi occupati hanno il
  bordo zincato e la parola del lavoro scritta; i campi hanno il filo inferiore
  bianco 2 px e il bordo zincato.
- **Regola del bianco**: pieno come superficie solo per "il tuo" e "fai
  questo" (bottone principale, tuo blocco, lavoro aggiunto, punto attivo,
  indice). Nelle prove: apertura 0,9% della finestra, scheda aperta con un
  lavoro aggiunto e barra circa 1,5%.

### 1.4 Griglia non convenzionale: la pianta della postazione

Tre zone per riga come sul pavimento: **banco** (c1-c5, dove si legge),
**postazione** (c6-c12, vuota di DOM tranne i punti: è lo spazio dell'auto),
**corsia dell'asta** (fuori griglia, fissa). Sul telefono la griglia diventa la
lavagna del planning (scala 44 + tre corsie da 96). Unico segno ammesso oltre
all'asta: la **linea a terra** sotto la cifra di ogni quota (4 / 6 px), che
nel planning diventa il tratteggio dei buchi. Dettagli e numeri in DESIGN.md §5.

### 1.5 Texture: vernice martellata

Ho provato sei varianti di `feTurbulence` su verde ombra (`qa/art-director/tex.png`).
La prima (frequenza 0,16) sembrava mimetica militare; scelta frequenza 0,28,
tre ottave, opacità 0,12: si legge come la vernice martellata dei torni e dei
banchi, solo da vicino. Il filtro **solo scurisce** (al massimo 11%), quindi i
contrasti del testo sul pannello possono solo salire; sono calcolati anche sul
punto più scuro. Mai su nero, mai sulla barra.

### 1.6 Trattamento foto

Prove su due foto volutamente difficili (carrello rosso e cric blu; gomme
gialle, blu e verdi), varianti A-D in `qa/art-director/foto.png`. Scelta:
`saturate(0.4) contrast(1.06) brightness(0.9)` + velo verde in fusione
`color` al 26%. Il primo tentativo (saturazione 0,58 + luce morbida) lasciava
rossi e blu ancora accesi. Non è un duotone: si vede ancora che il carrello è
rosso, ma spento e tirato verso il verde grigio. Il trattamento è in CSS e vale
per tutte le foto (deposito, officina, fallback); il photo-editor consegna le
foto **al naturale**.

### 1.7 Veli sopra la scena

- Asta ed etichette dei punti su nero al 90%: anche sopra un pezzo evidenziato
  in bianco il testo bianco fa 11,19:1 e lo zincato 5,43:1.
- Apertura: velo dal basso (88% → 82% → 0) più un velo laterale; sul telefono
  resta a 82% fino al 55% dell'altezza perché lì il testo sale fino a metà
  finestra. Testo bianco sopra una linea a terra sotto il velo: 8,64:1.

### 1.8 Ripieghi metrici (niente CLS dai font)

Prova con i woff2 bloccati (`page.route` → abort) contro i font veri, stessa
pagina:

| Misura | 1440 veri | 1440 ripiego | 375 veri | 375 ripiego |
|---|---|---|---|---|
| Pannello quota (altezza) | 747 | 747 | 716 | 716 |
| Tabella listino (altezza) | 231 | 231 | 251 | 251 |
| Paragrafo (altezza) | 56 | 56 | 79 | 79 |
| Marchio (larghezza) | 615 | 612 | 304 | 301 |
| Cifra "20 cm" (larghezza) | 287 | 282 | 143 | 142 |
| h2 (larghezza) | 174 | 181 | 110 | 115 |

Il marchio con il ripiego generico usciva a 720 px (357 a 375, oltre la
misura): le maiuscole di Arial sono il 17% più larghe. Per questo c'è un
ripiego dedicato `Ssc Marchio Ripiego` (87,6%) e la pila `--ssc-font-marchio`.
Una frase breve con `max-width: 40ch` andava a capo solo col ripiego: le
larghezze brevi vanno in `em` (scritto in DESIGN.md).

## 2. Contrasti WCAG 2.x (calcolati con lo script in appendice)

Soglie: 4,5 testo normale, 3 testo grande e oggetti grafici (bordi, anelli,
tratteggi). I casi composti (velo, martellata, hover) sono calcolati mescolando
in sRGB come fa il browser.

| Primo piano | Fondo | Rapporto | Soglia | Esito | Uso |
|---|---|---|---|---|---|
| bianco `#F0EFE9` | nero `#1C1D1B` | 14,69:1 | 4,5 | passa | testo corrente sul fondo |
| zincato `#A3AAA4` | nero `#1C1D1B` | 7,13:1 | 4,5 | passa | testo secondario su nero, numeri dell'asta, "pieno" |
| gesso `#CDD2CB` | nero `#1C1D1B` | 11,02:1 | 4,5 | passa | gesso se finisce su nero |
| bianco `#F0EFE9` | verdeOmbra `#44584A` | 6,65:1 | 4,5 | passa | testo dei pannelli, scheda, barra, corsie |
| bianco `#F0EFE9` | verdeOmbra martellata (-11%) `#405245` | 7,26:1 | 4,5 | passa | testo sul punto più scuro della martellata |
| gesso `#CDD2CB` | verdeOmbra `#44584A` | 4,99:1 | 4,5 | passa | secondario sui pannelli (aiuti, "da", caption) |
| gesso `#CDD2CB` | verdeOmbra martellata (-11%) `#405245` | 5,45:1 | 4,5 | passa | secondario sulla martellata |
| zincato `#A3AAA4` | verdeOmbra `#44584A` | 3,23:1 | 3 | passa | bordo 1 px dei blocchi occupati (non testo) |
| nero `#1C1D1B` | bianco `#F0EFE9` | 14,69:1 | 4,5 | passa | testo sul bottone principale e sul tuo blocco |
| nero `#1C1D1B` | biancoPremuto `#D9DBD3` | 12,11:1 | 4,5 | passa | testo sul bottone premuto / hover |
| bianco `#F0EFE9` | verde `#5E7564` | 4,34:1 | 3 | passa | SOLO testo grande (≥ 24 px o 19 px bold) sul verde pieno |
| verde `#5E7564` | nero `#1C1D1B` | 3,39:1 | 3 | passa | verde come testo grande su nero / centro del punto (non testo) |
| zincato `#A3AAA4` | nero `#1C1D1B` | 7,13:1 | 3 | passa | bordo dei campi su nero (non testo) |
| bianco `#F0EFE9` | nero `#1C1D1B` | 14,69:1 | 3 | passa | filo inferiore dei campi, tratteggio su nero (non testo) |
| bianco `#F0EFE9` | verdeOmbra `#44584A` | 6,65:1 | 3 | passa | tratteggio dei buchi liberi sulla corsia (non testo) |
| bianco `#F0EFE9` | neroAlto `#2A2C29` | 12,23:1 | 4,5 | passa | testo sui giorni della striscia, fascia "passato" |
| zincato `#A3AAA4` | neroAlto `#2A2C29` | 5,93:1 | 4,5 | passa | "pieno" su un giorno pieno |
| zincato `#A3AAA4` | nero `#1C1D1B` | 7,13:1 | 4,5 | passa | testo dei blocchi occupati (nero) |
| bianco `#F0EFE9` | velo 0,9 su bianco `#313230` | 11,19:1 | 4,5 | passa | etichetta punto / numero asta sopra un pezzo bianco |
| zincato `#A3AAA4` | velo 0,9 su bianco `#313230` | 5,43:1 | 4,5 | passa | tacche e numeri dell'asta sopra un pezzo bianco |
| bianco `#F0EFE9` | velo 0,9 su verde `#232622` | 13,29:1 | 4,5 | passa | etichetta punto sopra la carrozzeria |
| bianco `#F0EFE9` | velo apertura 0,82 su bianco `#424340` | 8,64:1 | 4,5 | passa | testo dell'apertura sopra una linea a terra |
| bianco `#F0EFE9` | nero + hover 10% bianco `#313230` | 11,19:1 | 4,5 | passa | bottone a contorno in hover su nero |
| bianco `#F0EFE9` | verdeOmbra + hover 10% bianco `#55675A` | 5,25:1 | 4,5 | passa | bottone a contorno in hover su pannello |
| bianco `#F0EFE9` | nero `#1C1D1B` | 14,69:1 | 3 | passa | anello del fuoco su nero |
| bianco `#F0EFE9` | verdeOmbra `#44584A` | 6,65:1 | 3 | passa | anello del fuoco su pannello |
| bianco `#F0EFE9` | verde `#5E7564` | 4,34:1 | 3 | passa | anello bianco del punto sul centro verde |
| nero `#1C1D1B` | bianco `#F0EFE9` | 14,69:1 | 3 | passa | alone nero del punto su un pezzo evidenziato bianco |
| bianco `#F0EFE9` | zincato `#A3AAA4` | 2,06:1 | 1 | passa | bianco vs zincato: si distinguono per forma, non per colore (informativo) |

Coppie: 29, sotto soglia: 0

Note:
- Bianco su verde pieno 4,34:1: **solo testo grande** (≥ 24 px o 19 px bold).
  Nel DOM il verde pieno non fa da fondo a nessun testo; nella scena la
  targhetta è zincata con testo nero (7,13:1).
- Verde su nero 3,39:1: il verde come testo solo sopra i 24 px.
- Zincato sui pannelli verde ombra 3,23:1: solo bordi, mai testo (lì c'è il gesso).

## 3. Prove a schermo

Pagina di prova nello scratchpad (fuori dal repo) che usa `tokens.css` vero,
con una scena finta in SVG (pavimento, linee a terra, colonne, auto verdi),
servita su 9181 e fotografata con Playwright/Chromium con i woff2 veri, a
1440 × 900 e 375 × 667. Copie in `concepts/18-sottoscocca/qa/art-director/`:
apertura, pannello 20 cm con punti e asta, scheda + barra, planning con tutti i
tipi di blocco e campi con errore, deposito con cartellino e foto trattata,
375 apertura e pannello, confronto foto, confronto texture.

Cosa ho visto e corretto:
- martellata troppo grossa (mimetica) → frequenza più fine e opacità più bassa;
- foto ancora troppo sature → saturazione 0,4 e fusione `color`;
- marchio col ripiego fuori misura → ripiego dedicato;
- velo dell'apertura troppo basso sul telefono → override sotto 768;
- sul telefono l'indice dell'asta a sinistra della riga entra nella colonna del
  testo → in DESIGN.md l'indice sta **sopra** l'asta sotto 768;
- un fisso (scheda) dentro una sezione con `z-index` restava sotto l'asta: le
  sezioni non devono creare un contesto di sovrapposizione (richiesta allo
  scaffold);
- i `<button>` senza `font: inherit` escono in Arial (richiesta allo scaffold).

A 1440 l'apertura regge: marchio in Tektur largo sulla linea a terra, un solo
bottone bianco, asta a destra; il planning si legge come la lavagna del
capofficina (nero pieno = occupato, tratteggio = libero, bianco = tuo).

## 4. Come si usano variabili e classi

- `tokens.css` va importato **per primo** (in `Radice.tsx`, poi `base.css`,
  `layout.css`, poi i CSS di sezione). Contiene solo variabili su `.ssc-root` e
  `@font-face`: nessuna regola visiva.
- Nei componenti si usano i **ruoli** (`--ssc-pannello`, `--ssc-azione`,
  `--ssc-occupato`…), non i colori nudi; per il trasparente
  `rgb(var(--ssc-nero-rgb) / 0.35)`.
- Tipografia: per una voce `x` → `font-size: var(--ssc-t-x)`, `font-stretch:
  var(--ssc-t-x-wdth)`, `font-weight: var(--ssc-t-x-wght)`, `line-height:
  var(--ssc-t-x-lh)` (dove esistono) e `font-family: var(--ssc-font-tecnico)`
  o `var(--ssc-font-testo)`; il marchio usa `var(--ssc-font-marchio)`.
- Esempio, cifra di quota:
  ```css
  .ssc-root .ssc-gomme__cifra {
    font-family: var(--ssc-font-tecnico);
    font-size: var(--ssc-t-quota);
    font-stretch: var(--ssc-t-quota-wdth);
    font-weight: var(--ssc-t-quota-wght);
    line-height: var(--ssc-t-quota-lh);
    font-variant-numeric: tabular-nums;
    display: block;
    padding-bottom: var(--ssc-sp-3);
    border-bottom: var(--ssc-linea-terra) solid var(--ssc-bianco);
    margin-bottom: var(--ssc-sp-5);
  }
  .ssc-root .ssc-gomme__cifra small { font-size: var(--ssc-t-quota-unita); font-stretch: 100%; font-weight: 500; margin-left: 0.15em; }
  ```
- Pannello: `background-color: var(--ssc-pannello); background-image:
  var(--ssc-martellata); background-size: var(--ssc-martellata-misura);`.
- Fuoco: `outline: var(--ssc-fuoco-spessore) solid var(--ssc-fuoco-colore);
  outline-offset: var(--ssc-fuoco-distanza); box-shadow: var(--ssc-fuoco-alone);`.
- Foto: ricetta `::after` in DESIGN.md §4.
- GL: `new Color(PALETTE[SCENA.carrozzeria].hex)`; clear color
  `PALETTE.nero.hex`; vetri `OPACITA.vetri`; cerchio aperto `OPACITA.cerchioAperto`;
  targhetta `ctx.font = fontTarghetta(px)` dopo `fontsReady(FONT_DA_CARICARE)`.

## 5. Richieste ad altri agent

- **scaffold-engineer**: in `base.css` `button, input, select, textarea { font:
  inherit; color: inherit; }` sotto `.ssc-root`; `.ssc-root` con `background:
  var(--ssc-fondo); color: var(--ssc-testo); font-family: var(--ssc-font-testo);
  font-size: var(--ssc-t-corpo); line-height: var(--ssc-t-corpo-lh)`;
  `::selection` coi token; `index.html` con fondo inline `#1C1D1B`. In
  `layout.css` **nessun `z-index` né `transform` su `.ssc-stazione` e sulle
  sezioni** (i fissi dentro resterebbero sotto l'asta, visto in prova): il
  livello 1 lo dà `.ssc-contenuto`. `FONT_CSS_URL`, `FONT_PRECONNECT` e
  `FONT_DA_CARICARE` sono in `tokens.ts` per `core/fonts.ts`.
- **webgl-artist / shader-engineer**: colori solo da `PALETTE` e `SCENA`; clear
  color uguale al byte al fondo CSS (`#1C1D1B`, alpha 1); materiali opachi, la
  faccia più chiara della carrozzeria vicina a `#5E7564` (non molto più
  chiara); targhetta zincata con "3500 kg" nero in Tektur 600; evidenza bianca.
  I fermi immagine vanno fatti con gli stessi colori (sono il poster LCP).
- **interaction-designer**: fuoco e hover come §4 e DESIGN.md §2 (anello bianco
  con distanza riempita di nero; hover bianco → `--ssc-bianco-premuto`, contorno
  → `--ssc-velo-hover`); nessun cambio di colore di grandi superfici.
- **photo-editor**: foto al naturale (il trattamento è in CSS); scartare quelle
  con testo stampato sopra o dominate da un solo colore saturo; niente
  arancio.
- **copywriter**: non usare ✓ né → (non esistono in Tektur e Red Hat Text: il
  browser li prende da un altro font); "Nel tuo lavoro ✓ · Togli" (ux §5.0)
  diventa "Nel tuo lavoro, togli" o simile. Il maiuscolo solo in SOTTOSCOCCA.
- **ux-architect / section-builder-asta**: sotto 768 l'indice di quota sta
  sopra l'asta (etichetta 32 × 24), non alla sua sinistra, per non entrare
  nella colonna del testo (margine destro 48).
- **vector-artist**: icone di servizio a tratto 2 px, estremità squadrate,
  `currentColor`; favicon su nero grasso con bianco segnaletica.

## Appendice: script dei contrasti

`node contrasti.mjs` (Node 22, nessuna dipendenza). Stampa la tabella del §2.

```js
// Contrasti WCAG 2.x di SOTTOSCOCCA. Uso: node contrasti.mjs
const C = { nero: '#1C1D1B', neroAlto: '#2A2C29', verde: '#5E7564', verdeOmbra: '#44584A',
  bianco: '#F0EFE9', biancoPremuto: '#D9DBD3', zincato: '#A3AAA4', gesso: '#CDD2CB' };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const hex = a => '#' + a.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = h => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// composizione in sRGB come fanno i browser: top con alpha a sopra bottom
const sopra = (top, a, bot) => hex(rgb(top).map((t, i) => t * a + rgb(bot)[i] * (1 - a)));
// casi composti
const K = {
  'verdeOmbra martellata (-11%)': sopra(C.nero, 0.11, C.verdeOmbra),   // punto più scuro della texture: scurisce soltanto
  'velo 0,9 su bianco': sopra(C.nero, 0.9, C.bianco),                  // asta / etichetta punto sopra un pezzo evidenziato
  'velo 0,9 su verde': sopra(C.nero, 0.9, C.verde),
  'velo apertura 0,82 su bianco': sopra(C.nero, 0.82, C.bianco),       // testo apertura sopra una linea a terra
  'nero + hover 10% bianco': sopra(C.bianco, 0.1, C.nero),
  'verdeOmbra + hover 10% bianco': sopra(C.bianco, 0.1, C.verdeOmbra),
};
const col = { ...C, ...K };
const righe = [
  // [testo/primo piano, fondo, soglia, uso]
  ['bianco', 'nero', 4.5, 'testo corrente sul fondo'],
  ['zincato', 'nero', 4.5, 'testo secondario su nero, numeri dell\'asta, "pieno"'],
  ['gesso', 'nero', 4.5, 'gesso se finisce su nero'],
  ['bianco', 'verdeOmbra', 4.5, 'testo dei pannelli, scheda, barra, corsie'],
  ['bianco', 'verdeOmbra martellata (-11%)', 4.5, 'testo sul punto più scuro della martellata'],
  ['gesso', 'verdeOmbra', 4.5, 'secondario sui pannelli (aiuti, "da", caption)'],
  ['gesso', 'verdeOmbra martellata (-11%)', 4.5, 'secondario sulla martellata'],
  ['zincato', 'verdeOmbra', 3.0, 'bordo 1 px dei blocchi occupati (non testo)'],
  ['nero', 'bianco', 4.5, 'testo sul bottone principale e sul tuo blocco'],
  ['nero', 'biancoPremuto', 4.5, 'testo sul bottone premuto / hover'],
  ['bianco', 'verde', 3.0, 'SOLO testo grande (≥ 24 px o 19 px bold) sul verde pieno'],
  ['verde', 'nero', 3.0, 'verde come testo grande su nero / centro del punto (non testo)'],
  ['zincato', 'nero', 3.0, 'bordo dei campi su nero (non testo)'],
  ['bianco', 'nero', 3.0, 'filo inferiore dei campi, tratteggio su nero (non testo)'],
  ['bianco', 'verdeOmbra', 3.0, 'tratteggio dei buchi liberi sulla corsia (non testo)'],
  ['bianco', 'neroAlto', 4.5, 'testo sui giorni della striscia, fascia "passato"'],
  ['zincato', 'neroAlto', 4.5, '"pieno" su un giorno pieno'],
  ['zincato', 'nero', 4.5, 'testo dei blocchi occupati (nero)'],
  ['bianco', 'velo 0,9 su bianco', 4.5, 'etichetta punto / numero asta sopra un pezzo bianco'],
  ['zincato', 'velo 0,9 su bianco', 4.5, 'tacche e numeri dell\'asta sopra un pezzo bianco'],
  ['bianco', 'velo 0,9 su verde', 4.5, 'etichetta punto sopra la carrozzeria'],
  ['bianco', 'velo apertura 0,82 su bianco', 4.5, 'testo dell\'apertura sopra una linea a terra'],
  ['bianco', 'nero + hover 10% bianco', 4.5, 'bottone a contorno in hover su nero'],
  ['bianco', 'verdeOmbra + hover 10% bianco', 4.5, 'bottone a contorno in hover su pannello'],
  ['bianco', 'nero', 3.0, 'anello del fuoco su nero'],
  ['bianco', 'verdeOmbra', 3.0, 'anello del fuoco su pannello'],
  ['bianco', 'verde', 3.0, 'anello bianco del punto sul centro verde'],
  ['nero', 'bianco', 3.0, 'alone nero del punto su un pezzo evidenziato bianco'],
  ['bianco', 'zincato', 1.0, 'bianco vs zincato: si distinguono per forma, non per colore (informativo)'],
];
let ko = 0;
console.log('| Primo piano | Fondo | Rapporto | Soglia | Esito | Uso |');
console.log('|---|---|---|---|---|---|');
for (const [a, b, s, uso] of righe) {
  const r = cr(col[a], col[b]); const ok = r >= s; if (!ok) ko++;
  console.log(`| ${a} \`${col[a]}\` | ${b} \`${col[b]}\` | ${r.toFixed(2).replace('.', ',')}:1 | ${String(s).replace('.', ',')} | ${ok ? 'passa' : 'NO'} | ${uso} |`);
}
console.log(`\nCoppie: ${righe.length}, sotto soglia: ${ko}`);
```
