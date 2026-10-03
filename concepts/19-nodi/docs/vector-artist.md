# Vector artist · Concept 19 · NODI

Ondata 2. File esclusivi: `src/pages/concepts/nodi/assets/svg/*`,
`public/favicon.svg`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/creative-director.md`
(§2.1, §2.2 regola 1, §4.1, §4.4, §4.7, §4.10), `docs/tech-architect.md` (§1.3, §3,
§4, §5.2, §8.2, §8.4, §10, "Richieste ad altri agent"), `docs/trend-researcher.md`
(§2.2-2.4, richieste al vector-artist), `docs/ux-architect.md` (testata, piano del
suono, bottega), `docs/brand-strategist.md` (§5.0), `scripts/modi/contorno.mjs` del
webgl-artist (chi legge il mio SVG), `styles/tokens.ts` dell'art-director, il
pilota `concepts/10-torchio/docs/vector-artist.md` (solo formato),
`.claude/skills/full-output-enforcement/SKILL.md`, `.claude/skills/image-to-svg/SKILL.md`.
`DESIGN.md` non c'era ancora quando ho lavorato: palette presa da `styles/tokens.ts`.

## 0. Cosa ho consegnato

| File | viewBox | Peso | Contenuto |
|---|---|---|---|
| `assets/svg/tavola.svg` | `-16 -16 240 388` (mm) | 3.035 B | la tavola: `#nod-contorno`, `#nod-filetto`, `#nod-effe-bassi`, `#nod-effe-acuti` |
| `assets/svg/altoparlante.svg` | `0 0 24 24` | 322 B | icona del bottone "Senti la voce" |
| `assets/svg/uscita.svg` | `0 0 16 16` | 224 B | freccia dei link esterni (Maps, CiceriLab, crediti) |
| `assets/svg/index.ts` | | | `?raw`, `TAVOLA`, `RIQUADRO`, `RAPPORTO_RIQUADRO`, `MISURE_TAVOLA`, `ICONE`, `USO_ICONE` |
| `public/favicon.svg` | `0 0 64 64` | 1.841 B | "N" di IM Fell DW Pica in ebano su abete |

Totale SVG 5,4 KB (budget del tech-architect: 12 KB; contorno della tavola 3,0 KB
contro un limite di 6 KB).

**Niente marchio in SVG.** Il cartiglio "NODI / liuteria in Pordenone" è testo vivo
in IM Fell (CD §4.1) ed è anche il bottone del menu sotto i 1200 px (ux §2.6): un
SVG sarebbe un doppione meno accessibile. Il favicon è l'unico posto dove la lettera
diventa disegno (vedi §4).

**Niente image-to-svg.** Non c'è un raster da vettorializzare: la tavola è
ricostruita come geometria, le icone sono disegnate a mano. Una foto vera è servita
solo da **riscontro di misura** (§1.2), non è stata ricalcata né entra nel repo.

## 1. `tavola.svg`, l'unico disegno del sito

### 1.1 Convenzioni (per GL, layout, script dei modi)

- Unità: **millimetri**. La tavola occupa `x 0..208`, `y 0..356`; il viewBox è il
  **riquadro** con 16 mm di margine per lato per l'ombra: `-16 -16 240 388`.
  Disegnare l'SVG a tutto riquadro = tavola e ombra allineate a poster, fermi e
  canvas.
- Orientamento: **riccio in alto** (y = 0 è il bordo dal lato del manico), vista
  dall'alto. Lato dei **bassi a sinistra** di chi guarda (corda di Sol, catena),
  lato degli **acuti a destra**.
- Tracciati (id unici nel concept, prefisso `nod-`):
  - `#nod-contorno`: contorno chiuso, `fill="none"`, tratto `currentColor` 0,5 mm;
  - `#nod-filetto`: linea mediana del filetto a 4 mm dal bordo, chiusa, tratto 0,9 mm
    al 50 %; **facoltativo** (vedi §1.5);
  - `#nod-effe-bassi`, `#nod-effe-acuti`: le due effe come tracciati **chiusi e
    pieni** (`currentColor`), cioè buchi veri, tacche comprese.
- Comandi usati: solo `M m C c l v Z z` (svgo configurato con `makeArcs: false`,
  `convertToQ: false`, `curveSmoothShorthands: false`): **niente archi**, che
  `contorno.mjs` rifiuta, e niente `S/T`, che il suo parser rifletterebbe in modo
  diverso dal browser. Verificato con `grep` sui `d`.
- Nessun `transform`, nessun `style`, nessun colore fisso: il colore lo decide chi
  inserisce (`currentColor`).

### 1.2 Il contorno

Forma di violino 4/4 ricostruita come fanno i liutai, curva per curva, sulle misure
del CD §2.2: **lunghezza 356, spalle alte 168, C 110, spalle basse 208**. Controllo
di plausibilità contro una foto frontale reale di violino
(`commons.wikimedia.org/wiki/File:Violin_VL100.png`, usata solo per misurare): ho
estratto il profilo della sagoma riga per riga, scalato alle misure sopra, e adattato
le maniglie delle curve ai minimi quadrati (errore medio sotto 1,3 mm sui tratti
lunghi). Sovrapposizione in `qa/vector-artist/tavola-su-foto-riferimento.png`.

Metà destra (x dal centro, y dal riccio), dodici cubiche; la sinistra è speculare:

| Tratto | Da | Controlli | A |
|---|---|---|---|
| spalla alta | 0, 0 | 78.2, 0 · 84, 45.7 | 84, 62 (massimo) |
| verso l'angolo | 84, 62 | 84, 91.9 · 77.2, 95.8 | 77.2, 108 |
| angolo alto, fianco | 77.2, 108 | 77.2, 116 · 81.6, 116.4 | 81.8, 120.4 |
| angolo alto, testa | 81.8, 120.4 | 81.9, 121.7 · 81.6, 123 | 81.4, 124.3 |
| angolo alto, raccordo | 81.4, 124.3 | 81.3, 125.1 · 80.5, 125.5 | 79.6, 125.5 |
| C, metà alta | 79.6, 125.5 | 67.3, 126.1 · 55, 123 | 55, 151 (vita) |
| C, metà bassa | 55, 151 | 55, 170.4 · 61, 203 | 78, 202 |
| angolo basso, lato C | 78, 202 | 83, 201.7 · 86.6, 201.1 | 91.6, 201.3 |
| angolo basso, raccordo | 91.6, 201.3 | 92.7, 201.4 · 93.4, 202.3 | 93.6, 203.4 |
| angolo basso, testa | 93.6, 203.4 | 94, 205.4 · 93.6, 207.5 | 93, 209.4 |
| angolo basso, ritorno | 93, 209.4 | 92, 212.8 · 89.8, 215.5 | 89.8, 218.5 |
| spalla bassa | 89.8, 218.5 | 89.8, 227.1 · 104, 248.1 | 104, 272 (massimo) |
| fondo | 104, 272 | 104, 323 · 76, 356 | 0, 356 |

Gli **angoli** sono a testa smussata (circa 4 mm in alto, 6 mm in basso), come nella
foto e come nelle forme cremonesi: non punte affilate, non "orecchie" tonde. Le C
stanno tra y 125 e y 202 (circa 77 mm), proporzione giusta per un 4/4: il contorno di
riserva di `contorno.mjs` aveva le C più lunghe (fino a y 245) e ora non si usa più.
Area della tavola 55.998 mm², perimetro 1.059 mm.

### 1.3 Le effe

Disegnate come un unico tratto a spessore variabile lungo un asse a "∫"
(specchiato sul lato degli acuti), più i due occhi, unite in un solo contorno:

- **occhio alto** verso il centro: centro (±25,9 dal centro, y 159,4), raggio 3,2;
- **arco** sopra l'occhio alto, poi **stelo** quasi dritto che scende verso
  l'esterno, largo al massimo 4,9 mm a metà;
- **ricciolo** in basso che risale nell'**occhio basso**, più grande e più esterno:
  centro (±59,6, y 212,6), raggio 4,1;
- due **tacche** a V sui due fianchi dello stelo a **y 196**, cioè circa 195 mm dal
  bordo alto: la misura di diapason della cassa, dove sta il ponticello.

Ingombro di ogni effe: y 151,9 → 220,7 (69 mm), x 126,7 → 167,7 sugli acuti. Area
400 mm² ciascuna. Posizione e forma confrontate con la stessa foto
(`qa/vector-artist/effe-3000.png`, a 3000 px di altezza della tavola). Le effe
servono anche alla fisica: aprono l'anello del modo 5 alle C (trend-researcher §2.2).

### 1.4 Prova con lo script del webgl-artist

`node -e` con `scripts/modi/contorno.mjs` (`leggiTavola()` e
`costruisciMaschera(t, 96, 168)`): `sorgente: 'svg'`, rettangolo 208 × 356, contorno
418 punti, effe 428 punti l'una, **11.914 celle dentro** su 16.128, **204 celle tolte
dalle effe**. La stampa a caratteri della maschera mostra effe, angoli e C al posto
giusto. Attenzione: l'arco sopra l'occhio alto è largo circa 2,2 mm, cioè una cella
della griglia 96 × 168; con la regola "3 campioni su 4" in qualche riga sparisce.
Per i campi dei modi non conta; per la maschera disegnata a schermo (`maschera.ts`)
conviene usare `new Path2D(TAVOLA.effeBassi)` a piena risoluzione.

### 1.5 Il filetto (facoltativo)

Una tavola vera ha il filetto (la doppia linea nera intarsiata a 4 mm dal bordo) e
un liutaio nota se manca. Lo consegno come tracciato separato `#nod-filetto`
(offset del contorno a 4 mm con giunti a spigolo: negli angoli forma la punta
verso l'esterno, come la "punta d'ape" vera). **Non è un ornamento aggiunto**: è
parte della tavola. Se usarlo nello shader (una linea ebano al 35-45 %, mai più
scura del contorno) lo decidono webgl-artist e art-director; se non serve, basta
non leggerlo.

## 2. `altoparlante.svg`

Cassa e cono a spigolo vivo (`stroke-linejoin="miter"`, `stroke-linecap="square"`,
coerente con il "raggio 0" del CD §4.1) e **due onde**, tratto 1,8 su 24. Sostituisce
"l'icona da libreria" del CD §4.4 e dello ux: nessuna libreria di icone nel concept
(tech-architect §1.2). `aria-hidden="true"`, nessun id. Misura: 20 px accanto al testo
"Senti la voce" a 17 px, 18 px se il testo è a 15 px. Provata in Spline Sans su
abete (`qa/vector-artist/prova-1440.png`, `prova-375.png`): a 20 px le due onde
restano separate.

Non serve all'interruttore "Suono": il CD lo vuole **di solo testo** ("Suono
spento" / "Suono acceso"), e un altoparlante lì lo farebbe sembrare un richiamo.

## 3. `uscita.svg`

Freccia diagonale in alto a destra, tratto 1,5 su 16, punta a spigolo vivo. Da
mettere **dopo** il testo dei link che escono dal sito ("Apri in Maps", "CiceriLab",
autori delle foto nel piede), a `1em`, contenitore `aria-hidden`. Il testo del link
resta l'etichetta; se serve dire che si apre fuori, lo fa il copywriter in un
`sr-only` o nell'aria-label. Non va sui link interni né su "La voce che vorresti".

## 4. `public/favicon.svg`

Quadrato abete `#E6D4AC` a spigolo vivo con la **"N" di IM Fell DW Pica** in ebano
`#16120F`: il primo carattere del cartiglio, con la sua stampa irregolare da
carattere del Seicento (contorno del glifo estratto con fontTools dal file del font,
licenza OFL: si usa il disegno della lettera, non si ridistribuisce il font).
Nessuna variante scura: il CD vuole un tema chiaro unico e il quadrato abete si
legge su barre chiare e scure (`qa/vector-artist/favicon.png`, 16/32/64/180 px su
bianco e su grigio scuro). A 16 px la N resta leggibile.

È l'unico file con colori fissi (un favicon non eredita `currentColor`); i due hex
sono quelli di `styles/tokens.ts`. Ho scartato la sagoma del violino: a 16 px
diventa una macchia e richiama le icone generiche da "scuola di musica".

## 5. `index.ts`

```ts
import { TAVOLA, RIQUADRO, RAPPORTO_RIQUADRO, MISURE_TAVOLA, altoparlante, uscita } from '../../assets/svg'

// layout (palco): leggero, non si porta dietro i tracciati
style={{ aspectRatio: `${RIQUADRO.w} / ${RIQUADRO.h}` }}

// GL (maschera.ts): coordinate mm, origine nell'angolo della tavola
const ctx = canvas.getContext('2d')!
ctx.translate(TAVOLA.origine.x * scala, TAVOLA.origine.y * scala) // se il canvas copre il riquadro
ctx.scale(scala, scala)
ctx.fill(new Path2D(TAVOLA.contorno))
ctx.globalCompositeOperation = 'destination-out'
ctx.fill(new Path2D(TAVOLA.effeBassi)); ctx.fill(new Path2D(TAVOLA.effeAcuti))

// icone inline
<span aria-hidden="true" dangerouslySetInnerHTML={{ __html: altoparlante }} />
```

- `TAVOLA = { viewBox, viewBoxNumeri, mm: {w: 208, h: 356}, riquadro: {w: 240, h: 388},
  origine: {x: 16, y: 16}, contorno, effeBassi, effeAcuti, filetto }`: la forma chiesta
  dal tech-architect (§"Richieste", vector-artist) più `origine`, `viewBoxNumeri` e
  `filetto`. Le `d` sono **lette dalla stringa `?raw` con una regex** al caricamento
  del modulo: nessun `DOMParser`, nessun accesso a `window`/`document`, una sola copia
  dei tracciati nel bundle (niente doppioni da tenere allineati a mano). Se un id
  mancasse, il modulo lancia un errore chiaro al primo import.
- `RIQUADRO` e `RAPPORTO_RIQUADRO` (0,6186) sono costanti a parte: chi ha bisogno solo
  delle proporzioni non si porta dietro 3 KB di tracciati nel chunk iniziale (`TAVOLA`
  con i tracciati serve al GL, che è lazy).
- `MISURE_TAVOLA`: lunghezza, larghezze e y di spalle e vita, angoli, tacche
  (y 196), centri e raggi degli occhi, ingombro delle effe, distanza del filetto. Per
  il webgl-artist (cuscinetti, controlli) e per eventuali testi del copywriter
  ("circa 195 mm").
- `ICONE` e `USO_ICONE` per un eventuale componente `<Icona nome="…" />`.

Typecheck: `tsc` 5.6 con `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
`noUnusedParameters` e un modulo `*?raw` dichiarato → verde. Prova di esecuzione
(import `?raw` sostituiti dalle stringhe): `TAVOLA` completo, `effeBassi` 620 caratteri,
`effeAcuti` 609, `filetto` 913.

## 6. Verifiche fatte

- Render in Chromium headless (playwright globale, `/opt/pw-browsers`): tavola
  sovrapposta alla foto di riferimento; tavola a 3000 px per effe e angoli; tavola e
  icone in pagina con IM Fell e Spline Sans veri (woff2 scaricati con curl e serviti
  inline, `document.fonts.check` vero per entrambi) a 1440 × 1 e a 375 × 2;
  favicon a 16/32/64/180 px su fondo chiaro e scuro. Immagini in `qa/vector-artist/`
  (cartella ignorata da git).
- Tre giri sulla forma: (1) effe con gli occhi in capo allo stelo, sbagliate (nelle
  effe vere gli occhi stanno in fondo ai riccioli, da parti opposte); (2) C troppo
  lunghe e angoli bassi troppo in basso (lower corner a y 236 invece di 205);
  (3) angoli a punta troppo affilati, sostituiti dalla testa smussata della foto.
- svgo 4.1 via `npx` (multipass, precisione 1 decimale = 0,1 mm, `cleanupIds` spento
  per tenere gli id, niente archi né Q/S/T): tavola da 4,7 a 3,0 KB, nessuna
  differenza visibile a 3000 px.
- Id: `nod-contorno`, `nod-filetto`, `nod-effe-bassi`, `nod-effe-acuti`; nessun id
  nelle icone e nel favicon. La tavola va inserita inline al massimo una volta per
  pagina (oggi nessuno la inserisce inline: GL e script leggono le stringhe).

## Richieste ad altri agent

- **scaffold-engineer**: `vite-env.d.ts` con `/// <reference types="vite/client" />`
  (per `?raw`); in `index.html` `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
- **webgl-artist**: `contorno.mjs` legge già `tavola.svg` (`sorgente: 'svg'`); rilancia
  `npm run modi` con il contorno nuovo (C più corte e angoli più alti del contorno di
  riserva). In `maschera.ts` usa `TAVOLA.*` con `Path2D` (§5) e la regola di
  riempimento di default; `#nod-filetto` è facoltativo (§1.5). `MISURE_TAVOLA` ha
  centri degli occhi e tacche se servono per i controlli delle linee nodali.
- **section-builder-palco**: `aspect-ratio` del riquadro da `RIQUADRO` (non da
  `TAVOLA`, per non portare i tracciati nel chunk iniziale).
- **section-builder-voce**: `altoparlante` inline a 20 px prima di "Senti la voce",
  contenitore `aria-hidden`, colore dal testo (`currentColor`).
- **section-builder-bottega**: `uscita` a `1em` dopo "Apri in Maps", "CiceriLab" e i
  link dei crediti foto; `aria-hidden`.
- **art-director**: i due hex del favicon (abete, ebano) sono l'unica eccezione alla
  regola "nessun hex fuori da `styles/tokens.*`"; se cambiano i token, va rifatto
  il favicon.
