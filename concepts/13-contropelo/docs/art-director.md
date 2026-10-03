# Art director · Concept 13 · CONTROPELO

Ondata 2. Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, riga 13 di `docs/matrice-concept-11-20.md`, tutti i doc
dell'ondata 1 in `concepts/13-contropelo/docs/` (creative-director,
trend-researcher e i file di `taste/`, brand-strategist, ux-architect,
tech-architect), le skill `design-taste-frontend` (§4, §9) e
`full-output-enforcement`, il formato Stitch del pilota
(`concepts/10-torchio/DESIGN.md`, `docs/art-director.md`). Letti anche i file
già scritti in parallelo: `content/*`, `assets/svg/tratti.ts`,
`interaction/interaction.css`, `motion/motion.css`, per allineare i nomi.

## File consegnati

| File | Contenuto |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: tema, palette con ruoli, tipografia, componenti, layout, profondità, do/don't, responsive, prompt guide |
| `src/pages/concepts/contropelo/styles/tokens.css` | `@font-face` di ripiego tarati con fontTools; tutti i token `--ctp-*` su `.ctp-root` (colori, trasparenze, scala fluida 375 → 1440 → 2560, spazi, misure della parete, materia, rotazioni e posizioni delle scritte, livelli); varianti per S/M/L/XL, `data-facce`, `data-layout="scorre"`, `pointer: fine`, `prefers-contrast` |
| `src/pages/concepts/contropelo/styles/tokens.ts` | `COLORI` (hex), `RGB` (terne), `rgba()`, `VAPORE`, `ALONE`, `VELATURA`, `RIFLESSO` (ricetta foto), `OPACITA`, `FONT_CSS_URL`, `FONT_DA_CARICARE`, `METRICHE_FONT`, `TIPO`, `ROTAZIONI`, `Z`, `luminanza()`, `contrasto()`. Solo dati e funzioni pure: typecheck `--strict --noUncheckedIndexedAccess` verde |
| `src/pages/concepts/contropelo/styles/materia.css` | parete con grana, `.ctp-bisello`, `.ctp-riflesso` (+ `--vuoto`), `.ctp-pennarello` (+ varianti e stati), `.ctp-scritta--vetro/--lista`, `.ctp-colonna-prezzi` / `.ctp-prezzo`, `.ctp-pennarello-link`, `.ctp-segno`, `.ctp-campo` / `.ctp-etichetta` / `.ctp-messaggio`, `.ctp-bottone-turchese`, `.ctp-insegna`, `.ctp-ui-piccolo`, `.ctp-alone`, `.ctp-pannello-vetro`, `.ctp-striscia-parete`, `forced-colors` |

Prove a schermo (fuori dal repo pubblico, `qa/` è ignorata):
`qa/art-director/s-*.png` e `qa/art-director/colori.mjs`.

---

## 1. Decisioni

### 1.1 Il turchese misurato: 4,42:1 sullo specchio, quindi due turchesi

Il CD stimava "turchese su grafite ~4,4:1". Misurato: `#2A9D96` su `#232A2C`
= **4,42:1**, su parete `#171C1D` = **5,21:1**. Non basta per il testo normale
(4,5) e, soprattutto, **sul riflesso non basta nemmeno per i segni**: sul pixel
più chiaro possibile del vetro (`#505758`, vedi 1.2) il turchese della
bottiglia fa 1,9:1, sotto la soglia dei 3:1 degli elementi non testuali
(WCAG 1.4.11). Il trattino del posto libero è l'informazione che fa prenotare:
deve passare ovunque.

Decisione:
- **`--ctp-turchese` `#2A9D96`** (quello della matrice) resta sulla **parete**:
  bottone turchese, tratto sotto il barbiere attivo.
- **`--ctp-turchese-vetro` `#4BC3BC`**, stessa tinta (hue 176°), più chiara e
  appena meno satura, per **tutto ciò che è scritto sul vetro**: trattini
  liberi, sottolineatura del tuo nome, cerchio a pennarello, anello del fuoco
  (anche sulla parete, così il fuoco ha un colore solo), cursore di testo,
  selezione. 3,46:1 sul pixel più chiaro del riflesso, 6,83:1 sullo specchio.
  È lo stesso disinfettante visto attraverso il vetro: non è un secondo
  accento.
- Ho provato tinte da `#2DA9A1` a `#5ED4CD`: sotto `#40BFB7` il trattino non
  passa sul pixel chiaro; sopra `#57C7C0` diventa acqua di piscina. `#4BC3BC`
  è il punto più scuro e meno saturo che passa con margine.

### 1.2 Il bottone: testo parete, turchese della matrice

Il CD proponeva testo specchio su turchese (4,42:1, **non passa** per Figtree
600 a 15-17 px, che non è "testo grande") oppure schiarire il fondo a
`#34B1A9`. Scelgo una terza via che tiene il colore della matrice: **testo
`--ctp-su-turchese` = parete `#171C1D` su `#2A9D96` = 5,21:1**. Al passaggio il
fondo diventa `turchese-vetro` (8,06:1). Nessuna superficie turchese più grande
del bottone (trend-researcher P4).

### 1.3 La velatura non bastava: tetto delle alte luci della foto

Il CD chiedeva "velatura 62-72%, pennarello ≥ 7:1 su ogni punto della foto".
Misurato sul caso peggiore (un pixel bianco: lampada, finestra, camice):
velatura 62% → 4,09:1, 72% → 5,57:1. Per avere 7:1 su un bianco servirebbe una
velatura dell'80%, che spegne il salone e trasforma lo specchio in un muro.

Soluzione in due parti, che insieme garantiscono il numero su **ogni** pixel:
1. **Il photo-editor taglia le alte luci a build-time** con i livelli: bianco
   d'uscita `#A7AFAE` per canale (R 167, G 175, B 174). È anche il
   raffreddamento verso il grafite (il rosso scende più del verde). Luminanza
   relativa massima di un pixel trattato: **0,419**.
2. **Velatura CSS specchio al 66%** (`--ctp-velatura`).

Il pixel più chiaro possibile sotto il vetro diventa `#505758`: pennarello
**7,05:1**. Il pixel nero diventa `#171C1D` (16,45:1). Provato su due foto vere
di Unsplash trattate con la ricetta (Pillow): luminanza massima misurata 0,414
e 0,408, sotto il tetto. Ricetta completa in `tokens.ts` `RIFLESSO` e nella
richiesta al photo-editor (§6).

### 1.4 Tipografia

- Confermo **Limelight + Figtree + Mansalva** della matrice. Misurati con
  fontTools sui woff2 latin: nessuna delle tre ha le frecce `←` `→` (vedi
  richieste §6); Mansalva ha `€`, accentate, `·`, trattino corto; Figtree ha
  `tnum` ma non serve.
- **Mansalva senza cifre tabellari** (feature solo `calt ccmp dnom frac liga
  locl numr`; cifre da 0,457 a 0,700 em, il "5" la più larga, x 0,384):
  i prezzi stanno in una colonna di larghezza fissa (`--ctp-prezzo-col` =
  1,45 × corpo del prezzo: il "25" misura 1,32 em) e si allineano a destra da
  soli; niente `font-variant-numeric`. Le ore della lista in una colonna di
  3,2 em ("10:30" = 2,6 em, 58 px a 24 px misurati).
- **I prezzi sono scritti più grandi delle voci** (`--ctp-t-prezzo` 26 → 36 px
  contro `--ctp-t-riga` 22 → 32): il barbiere ripassa il numero, ed è ciò che
  il cliente cerca. È anche ciò che fa stare il listino a 375: la voce più
  lunga ("macchinetta, un'altezza", 10,49 em) misura 231 px a 22 px, più 12 px
  di stacco e 38 px di colonna = 281 px nei 287 utili del vetro.
- **Corpi minimi**: 22 px per voci e note (CD), 24 px per le ore della lista e
  le parole del servizio (trend-researcher 4.3: la x bassa di Mansalva a 22 px
  equivale a un sans da 16), 26 px nei campi.
- **XL**: a 2560 il vetro è largo 2340 px e con i corpi del 1440 sembrava
  vuoto (screenshot). Da 1920 i corpi continuano a crescere fino a 2560 (nome
  60, riga 44, prezzo 50, ora 36), righe della lista 52 px.
- **Ripieghi metrici** (Arial / Liberation Sans, larghezza media misurata su
  frasi vere del concept): Mansalva `size-adjust` 96,69%, ascent 115,01%,
  descent 48,2%; Figtree 400-500 101,35% / 93,74% / 24,67%; Figtree 600 su
  Arial Bold 94,6% / 100,42% / 26,43%; Limelight 121,3% / 75,03% / 25,32%.

### 1.5 Fascia alta: 60 px sopra i 640

L'ux-architect diceva 56, il tech-architect ha misurato il bottone Lab fino a
y 49 e chiesto ≥ 58. Decido **60 px** su M e L, 48 su S (dove il bottone sta
in basso). Nicchia del bottone Lab: 260 px in alto a sinistra su M/L, 212 px in
basso a sinistra su S. Tutte le misure della parete sono token
(`--ctp-fascia-h`, `--ctp-mensola-*`, `--ctp-bordo-vicino`,
`--ctp-parete-gutter`, `--ctp-vetro-pad`, `--ctp-nicchia-lab-w`) consumati da
`layout.css` (richiesta allo scaffold, §6).

### 1.6 Vapore: confermo 0,78 in alto e 0,9 in basso

Guardato a schermo con un vapore simulato (canvas a mezza risoluzione,
gradiente di densità, grana ± 4,5%, traccia con nocciolo al 70% del raggio):
a vapore pieno listino e lista **si intuiscono** (1,45:1 in alto, 1,18:1 in
basso: è voluto, nessuna informazione sta solo lì) e il salone resta una
sagoma. Non abbasso le opacità: con meno vapore il gesto perde senso. Il
rischio 4.2 del trend-researcher (listino in basso dove il vapore è fitto) è
risolto con la posizione: **il listino sta nella metà alta del vetro a ogni
misura**. Tutti i parametri dell'aspetto del vapore (grana, nocciolo del
pennello, filo d'acqua, gocce) sono in `tokens.ts` `VAPORE`; i tempi restano
del motion-designer.

### 1.7 Alone fermo

Per il modo "fermo" del canvas e per il caso `data-canvas="off"` (versione
CSS `.ctp-alone`): vapore al 34% sul filo del bordo, 16% a 14 px (10 px in
alto, 18 px in basso), zero a 36 px (28 in alto, 64 in basso: l'asciugamano
caldo è sotto). Il testo non sta mai a meno di 20 px dal bordo
(`--ctp-vetro-pad`): lì il pennarello fa ancora ≥ 5,2:1. Il primo tentativo
(26% a 14 px) dava 4,31:1 e non passava.

### 1.8 Rotazioni e posizioni delle scritte (375 / 768 / 1440)

| Disposizione | Vetro | Lista | Posizione |
|---|---|---|---|
| L, specchio 1 | -1,5° | +0,8° | vetro x 6% y 56 px largo 50%; lista x 62% y 48 px largo 32% |
| L, specchio 2 | -0,9° | +1,2° | vetro y 72 px; lista y 40 px |
| L, specchio 3 | -1,8° | +0,6° | vetro y 48 px; lista y 60 px |
| XL (≥ 1920) | come L | come L | vetro y 96 px; lista x 64% y 80 px largo 28% |
| M (768), una faccia | -1° | +0,6° | dal margine interno 40 px, tutta la larghezza |
| S (375), una faccia | -0,8° | +0,5° | dal margine interno 20 px, tutta la larghezza |
| Vetrina lunga | 0° | 0° | in colonna |

Le variabili sono `--ctp-rot-vetro`, `--ctp-rot-lista`, `--ctp-vetro-x/-y/-w`,
`--ctp-lista-x/-y/-w`; le varianti per specchio usano gli id stabili
`#ctp-specchio-1` / `-2` del tech-architect (§5.2). Le posizioni sono relative
al vetro **dentro il margine interno** (`--ctp-vetro-pad`). Rotazione con la
proprietà `rotate`, origine in alto a sinistra: non tocca i `transform` del
motion. I campi della riga di scrittura stanno sempre dritti.

### 1.9 Griglia non convenzionale e texture

- La "griglia" è la parete: uno specchio attivo e due bordi di specchi vicini
  tagliati dallo schermo. Dentro il vetro nessuna colonna allineata: due
  scritte inclinate in modo diverso, attaccate a quote diverse per ogni
  specchio, come scritte in momenti diversi.
- Texture solo statiche: grana d'intonaco della parete (SVG `feTurbulence`,
  bianco con alfa 5,5% × rumore, tessera 180 px: alza la parete di circa il 3%,
  il pennarello resta > 15:1) e grana del vapore nel canvas. Profondità solo
  con il bisello di 2 px e la differenza di nitidezza foto / pennarello /
  vapore. Nessuna ombra, nessun `backdrop-filter`.

### 1.10 Trattamento foto (riassunto, dettaglio in §6)

Specchiata orizzontalmente; saturazione 60%; livelli con bianco d'uscita
`#A7AFAE`; sfocatura gaussiana 1,5 px (1600) / 0,75 px (800); webp q 70.
Nessun `filter` a runtime, velatura in CSS. Piano C senza foto:
`.ctp-riflesso--vuoto`, banda verticale `#343E41` fuori centro.

---

## 2. Contrasti WCAG 2.x (calcolati con lo script in appendice)

Formula WCAG 2.x (luminanza relativa sRGB). Composizione delle trasparenze in
sRGB come fa il browser. "Pixel più chiaro" = `#A7AFAE` (tetto della foto
trattata) sotto velatura 66% = `#505758`. Soglie: testo normale 4,5 (7 dove il
CD chiede di più), testo grande (≥ 24 px) 3, elementi non testuali 3.

**Tutte le coppie con soglia passano.** Le due righe "NON passa" sono volute:
la proposta del CD scartata (§1.2) e il controllo che mostra perché il tetto
delle alte luci è obbligatorio (§1.3).

vetro chiaro #505758 · vetro scuro #171C1D · vetrina lunga #3D4546 · alone #646B6C · foto non trattata #6E7274

| Gruppo | Coppia | Primo piano | Fondo | Rapporto | Soglia | Esito |
|---|---|---|---|---|---|---|
| vetro | pennarello su specchio pulito (foto assente) | `#FAFAF6` | `#232A2C` | **13.95:1** | 7:1 | passa |
| vetro | pennarello su vetro, pixel più chiaro della foto | `#FAFAF6` | `#505758` | **7.05:1** | 7:1 | passa |
| vetro | pennarello su vetro, pixel nero della foto | `#FAFAF6` | `#171C1D` | **16.45:1** | 7:1 | passa |
| vetro | pennarello su vetrina lunga, pixel più chiaro | `#FAFAF6` | `#3D4546` | **9.39:1** | 7:1 | passa |
| vetro | pennarello su alone fermo a 14 px dal bordo (16%) | `#FAFAF6` | `#646B6C` | **5.20:1** | 4.5:1 | passa |
| vetro | ora passata (pennarello 62%) su pixel più chiaro, testo >= 24 px | `#B9BCBA` | `#505758` | **3.85:1** | 3:1 | passa |
| vetro | ora passata (pennarello 62%) su specchio | `#A8ABA9` | `#232A2C` | **6.30:1** | 4.5:1 | passa |
| vetro | nome non arrivato (pennarello 55%) su pixel più chiaro, 30 px | `#AEB1AF` | `#505758` | **3.41:1** | 3:1 | passa |
| segni | trattino libero turchese-vetro su pixel più chiaro | `#4BC3BC` | `#505758` | **3.46:1** | 3:1 | passa |
| segni | trattino libero turchese-vetro su specchio | `#4BC3BC` | `#232A2C` | **6.83:1** | 3:1 | passa |
| segni | sottolineatura del nome turchese-vetro su pixel più chiaro | `#4BC3BC` | `#505758` | **3.46:1** | 3:1 | passa |
| segni | anello di fuoco turchese-vetro su pixel più chiaro | `#4BC3BC` | `#505758` | **3.46:1** | 3:1 | passa |
| segni | anello di fuoco turchese-vetro su parete | `#4BC3BC` | `#171C1D` | **8.06:1** | 3:1 | passa |
| segni | linea di base del campo (pennarello) su pixel più chiaro | `#FAFAF6` | `#505758` | **7.05:1** | 3:1 | passa |
| parete | pennarello (Figtree, Limelight) su parete | `#FAFAF6` | `#171C1D` | **16.45:1** | 4.5:1 | passa |
| parete | tratto barbiere attivo turchese su parete | `#2A9D96` | `#171C1D` | **5.21:1** | 3:1 | passa |
| parete | bottone turchese su parete (confine) | `#2A9D96` | `#171C1D` | **5.21:1** | 3:1 | passa |
| parete | testo parete su bottone turchese (Figtree 600 15-17 px) | `#171C1D` | `#2A9D96` | **5.21:1** | 4.5:1 | passa |
| parete | testo parete su bottone al passaggio (turchese-vetro) | `#171C1D` | `#4BC3BC` | **8.06:1** | 4.5:1 | passa |
| parete | testo specchio su bottone turchese (proposta del CD, scartata) | `#232A2C` | `#2A9D96` | **4.42:1** | 4.5:1 | NON passa |
| parete | selezione: parete su turchese-vetro | `#171C1D` | `#4BC3BC` | **8.06:1** | 4.5:1 | passa |
| decoro | anello di fuoco su vapore pieno (il vapore si pulisce attorno in 300 ms) | `#4BC3BC` | `#CDD5D4` | 1.43:1 | nessuna | decorativo |
| decoro | bisello luce su parete | `#48555A` | `#171C1D` | 2.23:1 | nessuna | decorativo |
| decoro | bisello ombra su parete | `#0E1213` | `#171C1D` | 1.09:1 | nessuna | decorativo |
| decoro | specchio su parete (bordo del vetro) | `#232A2C` | `#171C1D` | 1.18:1 | nessuna | decorativo |
| decoro | turchese su specchio (mai testo) | `#2A9D96` | `#232A2C` | 4.42:1 | nessuna | decorativo |
| decoro | vapore su specchio | `#CDD5D4` | `#232A2C` | 9.77:1 | nessuna | decorativo |
| decoro | specchio su vapore | `#232A2C` | `#CDD5D4` | 9.77:1 | nessuna | decorativo |
| decoro | riflesso-luce (piano C) su specchio | `#343E41` | `#232A2C` | 1.33:1 | nessuna | decorativo |
| decoro | pennarello sotto vapore 0.78 (si intuisce) | `#D7DDDB` | `#B2B9B9` | 1.45:1 | nessuna | decorativo |
| decoro | pennarello sotto vapore 0.9 (si intuisce) | `#D2D9D7` | `#C1C8C8` | 1.18:1 | nessuna | decorativo |
| controllo | pennarello su foto NON trattata (bianco puro, velatura 66%) | `#FAFAF6` | `#6E7274` | **4.64:1** | 7:1 | NON passa |

Letture:
- Il pennarello sul vetro sta tra **7,05:1** (pixel più chiaro) e **16,45:1**
  (pixel nero) **su ogni punto del riflesso**, purché la foto rispetti il
  tetto. Se la foto non è trattata (bianco puro) scende a 4,64:1: per questo
  il controllo del tetto è nel QA (§6).
- Ore passate e nome non arrivato sono scritte dimesse ma restano ≥ 3:1 sul
  caso peggiore (Mansalva ≥ 24 px = testo grande) e ≥ 6,3:1 sullo specchio.
  Il loro stato non è detto solo dall'opacità: niente nome né trattino per le
  passate, messaggio scritto per il nome non arrivato.
- Sotto il vapore pieno le scritte sono a 1,2-1,5:1: è lo stato "appannato",
  non portano mai informazione esclusiva (interruttore "Specchio pulito",
  fuoco che pulisce, DOM sempre letto dai lettori di schermo).
- L'anello del fuoco su vapore pieno farebbe 1,43:1, ma l'elemento col fuoco
  ha sempre il vapore pulito attorno (`fuocoPulisce.ts`, 300 ms): l'anello si
  posa sul vetro pulito (≥ 3,46:1).
- Bisello e bordo del vetro sono decorativi (1,1-2,2:1): il confine dello
  specchio non è un controllo.
- `prefers-contrast: more`: velatura 86%, dimesse a 0,78 / 0,7.
- `forced-colors`: via foto, vapore, grana e alone; restano testo e bordi di
  sistema.

---

## 3. Come si usano variabili e classi

### 3.1 Ordine di import (scaffold, in `Contropelo.tsx`)

```ts
import './styles/tokens.css';
import './styles/base.css';
import './styles/materia.css';
import './styles/layout.css';
import './motion/motion.css';
import './interaction/interaction.css';
```

`materia.css` dopo `base.css` (il reset non deve azzerare bisello e campi),
prima di `layout.css` e dei CSS di sezione.

### 3.2 Variabili principali

| Variabile | Uso |
|---|---|
| `--ctp-parete`, `--ctp-specchio` | fondi (la parete la mette già `materia.css` su `.ctp-root`) |
| `--ctp-pennarello` | ogni testo |
| `--ctp-turchese` / `--ctp-su-turchese` | bottone e tratto del barbiere attivo / testo sul bottone |
| `--ctp-turchese-vetro` | segni sul vetro e fuoco |
| `--ctp-t-*` | corpi (vedi DESIGN.md §3) |
| `--ctp-fascia-h`, `--ctp-mensola-h`, `--ctp-mensola-riga1-h`, `--ctp-mensola-riga2-h`, `--ctp-bordo-vicino`, `--ctp-parete-gutter`, `--ctp-vetro-pad`, `--ctp-nicchia-lab-w` | geometria della parete (layout.css) |
| `--ctp-vetro-x/-y/-w`, `--ctp-lista-x/-y/-w`, `--ctp-rot-vetro`, `--ctp-rot-lista` | posizione e inclinazione delle facce (parete, vetro, lista) |
| `--ctp-riga-lista-h` | altezza delle righe della lista (44 / 40 / 52) |
| `--ctp-prezzo-col`, `--ctp-listino-max` | colonna dei prezzi, larghezza del listino |
| `--ctp-z-*` | quote: riflesso 0, pennarello 1, vapore 2, scrittura e pannello 3, parete 4 |
| `--ctp-opacita-passata`, `--ctp-opacita-fallito`, `--ctp-opacita-raccolta` | stati delle scritte (il motion le usa nelle transizioni) |
| `--ctp-fuoco-colore/-spessore/-stacco` | anello del fuoco (interaction.css) |

### 3.3 Esempi

```tsx
{/* Un vetro (section-builder-parete) */}
<div id={`ctp-specchio-${i}`} role="tabpanel" className="ctp-parete__vetro ctp-bisello ctp-alone">
  <div className="ctp-riflesso" style={{ ['--ctp-riflesso-posizione' as string]: foto.posizione }}>
    <img className="ctp-riflesso__foto" srcSet={...} sizes={...} alt="" width={foto.larghezza} height={foto.altezza} />
  </div>
  <Vetro indice={i} />
  <Lista indice={i} />
  <VaporeCanvas indice={i} />
</div>
```

```tsx
{/* Il listino (section-builder-vetro) */}
<div className="ctp-vetro__faccia ctp-pennarello ctp-scritta--vetro">
  <h2 className="ctp-pennarello--nome">Mattia</h2>
  <h3 className="ctp-pennarello--titolo">Il listino</h3>
  <dl className="ctp-colonna-prezzi">
    <dt>taglio</dt>
    <dd className="ctp-prezzo">22<span className="ctp-sr"> euro</span></dd>
  </dl>
</div>
```

```tsx
{/* Posto libero e riga di scrittura (section-builder-lista) */}
<button className="ctp-ix-libero" data-ctp-libero>
  <svg className="ctp-segno ctp-segno--trattino">…tratto del vector-artist…</svg>
</button>
<label className="ctp-etichetta" htmlFor="ctp-nome">Il tuo nome</label>
<input id="ctp-nome" className="ctp-campo" aria-invalid={!!errore} aria-describedby="ctp-nome-errore" />
<p id="ctp-nome-errore" className="ctp-messaggio">…</p>
<button type="submit" className="ctp-bottone-turchese">Segna</button>
```

### 3.4 Regole per i section-builder

1. Nessun hex fuori da `styles/tokens.*`; per il canvas `COLORI`, `RGB`,
   `rgba()` da `tokens.ts`.
2. `.ctp-pennarello` non posiziona né mette `z-index`: il contenitore della
   faccia è `position: absolute` (o relativo) e porta `z-index:
   var(--ctp-z-pennarello)`. (Trovato a schermo: con `position: relative`
   nella classe le facce assolute finivano nel flusso.)
3. Il vetro è `position: relative; overflow: hidden` e ha `ctp-bisello` e
   `ctp-alone`; il riflesso è il primo figlio, il canvas `ctp-vapore`
   l'ultimo.
4. Mai testo sul vetro a meno di `--ctp-vetro-pad` dal bordo.
5. Il listino nella metà alta del vetro; "la lista" in basso a destra (S, M).
6. Turchese mai per testo; sul vetro sempre `turchese-vetro` tramite
   `.ctp-segno` (o `color: var(--ctp-turchese-vetro)` sul contenitore degli
   SVG di `tratti.ts`).
7. Su S il bottone della mensola usa `padding-inline: var(--ctp-sp-3)`:
   "Scrivi il tuo nome" misura 119 px a 15 px, nello slot di 147 px sta su una
   riga a 375 (143 px); sotto i 360 px va su due righe.
8. Su S gli orari dello specchio 3 vanno su due righe (giorno, poi ore):
   "martedì a venerdì 8:30-12:30 14:30-19" misura 389 px a 22 px.

---

## 4. Verifica a schermo

Pagina di prova statica (scratch, fuori dal repo) con `tokens.css` e
`materia.css` veri, font woff2 veri (Mansalva, Figtree, Limelight caricati e
verificati con `document.fonts`), foto Unsplash di prova trattate con la
ricetta, vapore simulato in canvas. Chromium di Playwright, server su 9136
chiuso a fine prova. Screenshot guardati uno per uno
(`qa/art-director/`):

| File | Misura | Cosa ho visto |
|---|---|---|
| `s-L.png` | 1440 × 900 | il vetro si legge come specchio: salone sfocato e scuro, scritte nitide e inclinate; listino in alto a sinistra con prezzi grandi e allineati; lista a destra con trattini turchesi chiari; tratto turchese sotto "Mattia"; bottone turchese con testo scuro; bordi degli specchi vicini visibili |
| `s-Lv.png` | 1440 × 900, vapore | vapore grigio-verde con grana; scritte e salone si intuiscono; la traccia pulita ha il bordo quasi netto e mostra il riflesso |
| `s-M.png` | 768 × 1024 | una faccia, listino nella metà alta, "la lista" in basso a destra |
| `s-S.png` | 375 × 667 | listino intero nei 287 px utili, prezzi allineati a destra, nessuno scroll orizzontale (`scrollWidth` 375); nicchia del bottone Lab libera |
| `s-Sv.png` | 375 × 667, vapore | "taglio e barba" e "barba" scoperti dalla passata; il resto si intuisce |
| `s-Sl.png` | 375 × 667, faccia lista | 8 righe, ore passate dimesse, trattini leggibili |
| `s-Sc.png` | 375 × 667, `canvas=off` + piano C | senza foto e senza vapore il vetro resta vetro grazie all'alone CSS e al bisello |
| `s-XL.png` | 2560 × 1440 | dopo l'aumento dei corpi `xl` le scritte occupano il vetro in proporzione |

Problemi trovati e corretti durante la prova: `position: relative` dentro
`.ctp-pennarello` (rompeva le facce assolute, tolto); listino che sbordava a
375 con prezzi alla stessa misura delle voci (risolto con prezzi più grandi in
colonna stretta e voci a 22 px); listino troppo largo a 1440 (aggiunto
`--ctp-listino-max`); scritte minuscole a 2560 (aggiunti i corpi `xl`); alone
al 26% sotto il testo (portato al 16%).

---

## 5. Cosa non ho deciso (di altri)

Tempi e curve (motion), geometria esatta della griglia e pan (scaffold,
builder della parete), tratti SVG (vector-artist), testi (copywriter), scelta
delle foto (photo-editor).

---

## 6. Richieste ad altri agent

- **photo-editor** (vincolante per il contrasto): trattare ogni foto così,
  nell'ordine: specchiare in orizzontale; saturazione al 60%
  (`ImageEnhance.Color(0.6)`); livelli per canale con bianco d'uscita
  `#A7AFAE` (`R×167/255`, `G×175/255`, `B×174/255`); sfocatura gaussiana
  1,5 px sulla 1600 e 0,75 px sulla 800; webp q 70. **Verificare per ogni
  file** che la luminanza relativa WCAG massima dei pixel sia ≤ **0,419**
  (con 0,414 e 0,408 sulle due foto di prova) e scriverla nel doc. Niente
  velatura cotta (è CSS al 66%). Preferire foto con profondità e poche luci
  dirette: con il tetto le lampade diventano macchie grigie, non bagliori.
  In `assets/foto/index.ts` il campo `posizione` per specchio, che la parete
  passa a `--ctp-riflesso-posizione`.
- **scaffold-engineer**: importare `materia.css` dopo `base.css` (§3.1);
  `layout.css` consuma i token di misura della parete (§3.2) invece di numeri
  propri: fascia **60 px sopra i 640** (non 56), mensola 48 + 56 su S e 88 su
  M/L, bordi vicini 12 / 32 / 86, gutter 12 / 16 / 24, nicchia Lab 212 / 260;
  `base.css` non mette fondo né colore su `.ctp-root` (li mette `materia.css`,
  con la grana). `index.html` fondo inline `#171C1D` come previsto.
- **section-builder-vapore**: il canvas ha la classe `ctp-vapore` (la usa
  `materia.css` per `forced-colors`); colori e aspetto da `tokens.ts`
  (`COLORI.vapore`, `VAPORE.alto/basso/pienoDa/meta`, grana, `nocciolo` 0,7,
  `filoAcqua`, `goccia`, `ALONE` per il modo fermo).
- **section-builder-parete**: vetro con `ctp-bisello ctp-alone`, riflesso con
  `ctp-riflesso` / `ctp-riflesso__foto` (`--vuoto` per il piano C), id
  `ctp-specchio-<i>` (servono alle rotazioni per specchio).
- **section-builder-vetro / -lista**: §3.4. Facce con `z-index:
  var(--ctp-z-pennarello)`; prezzi con `.ctp-colonna-prezzi` / `.ctp-prezzo`;
  stati con `.ctp-pennarello--passata` / `--fallito`.
- **copywriter + vector-artist**: **Mansalva e Figtree non hanno le frecce
  `←` `→`** (verificato nel cmap dei woff2). In `content/testi.ts` ci sono
  "la lista →", "domani →", "← il listino", "← oggi"…: così il browser
  prenderebbe la freccia da un font di sistema, diversa per ogni telefono e
  stonata accanto al pennarello. Proposta: il copywriter toglie le frecce
  dalle stringhe (o le espone separate, es. `{ testo: 'domani', freccia:
  'avanti' }`), il vector-artist aggiunge in `tratti.ts` due frecce a
  pennarello (`frecciaAvanti`, `frecciaIndietro`, `currentColor`,
  `aria-hidden`), i builder le mettono accanto al testo.
- **vector-artist**: il commento in `tratti.ts` dice `color:
  var(--ctp-turchese)` sul contenitore; sul vetro il colore giusto è
  `var(--ctp-turchese-vetro)` (§1.1, oppure la classe `.ctp-segno`).
- **interaction-designer**: nessuna modifica; confermo che i token usati in
  `interaction.css` esistono tutti. Il fuoco usa `--ctp-fuoco-colore` =
  `turchese-vetro` anche sulla parete (8,06:1).
- **accessibility-auditor / responsive-tester**: rifare `colori.mjs` (appendice)
  sulle foto vere: estrarre dai webp la luminanza massima e verificare ≤ 0,419;
  contare anche la grana della parete nel contrasto reale della mensola.

---

## Appendice: script dei contrasti

Eseguito con `node colori.mjs` (Node 22). Riproduce la tabella del §2.

```js
// Contrasti WCAG 2.x di CONTROPELO (art-director). node colori.mjs
const hex2rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
const rgb2hex = c => '#' + c.map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const lin = v => { v/=255; return v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4; };
const L = h => { const [r,g,b] = hex2rgb(h).map(lin); return 0.2126*r + 0.7152*g + 0.0722*b; };
const cr = (a,b) => { const [x,y] = [L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
// composizione in sRGB come fa il browser: fg con alfa a sopra bg
const over = (fg, bg, a) => rgb2hex(hex2rgb(bg).map((v,i)=> v*(1-a) + hex2rgb(fg)[i]*a));

const C = {
  specchio:'#232A2C', vapore:'#CDD5D4', turchese:'#2A9D96', turcheseVetro:'#4BC3BC',
  pennarello:'#FAFAF6', parete:'#171C1D', bisello:'#48555A', biselloOmbra:'#0E1213',
  vaporeLuce:'#E4EAE9', riflessoLuce:'#343E41',
};
const VELATURA = 0.66;          // specchio sopra la foto
const VELATURA_LUNGA = 0.80;    // vetrina lunga
const FOTO_MAX = '#A7AFAE';     // pixel più chiaro ammesso nella foto trattata (L <= 0.419)
const OP = { passata: 0.62, fallito: 0.55, alone: 0.16 };

const vetroChiaro = over(C.specchio, FOTO_MAX, VELATURA);   // caso peggiore: pixel più chiaro della foto
const vetroScuro  = over(C.specchio, '#000000', VELATURA);  // pixel nero della foto
const vetroLunga  = over(C.specchio, FOTO_MAX, VELATURA_LUNGA);
const vetroBianco = over(C.specchio, '#FFFFFF', VELATURA);  // foto NON trattata (errore del trattamento)
const alone       = over(C.vapore, vetroChiaro, OP.alone);
const sottoVapore = a => [over(C.vapore, C.pennarello, a), over(C.vapore, vetroChiaro, a)];

const rows = [];
const t = (gruppo, nome, fg, bg, soglia) => rows.push([gruppo, nome, fg, bg, cr(fg,bg), soglia]);
// Pennarello sul vetro
t('vetro','pennarello su specchio pulito (foto assente)', C.pennarello, C.specchio, 7);
t('vetro','pennarello su vetro, pixel più chiaro della foto', C.pennarello, vetroChiaro, 7);
t('vetro','pennarello su vetro, pixel nero della foto', C.pennarello, vetroScuro, 7);
t('vetro','pennarello su vetrina lunga, pixel più chiaro', C.pennarello, vetroLunga, 7);
t('vetro','pennarello su alone fermo a 14 px dal bordo (16%)', C.pennarello, alone, 4.5);
t('vetro','ora passata (pennarello 62%) su pixel più chiaro, testo >= 24 px', over(C.pennarello, vetroChiaro, OP.passata), vetroChiaro, 3);
t('vetro','ora passata (pennarello 62%) su specchio', over(C.pennarello, C.specchio, OP.passata), C.specchio, 4.5);
t('vetro','nome non arrivato (pennarello 55%) su pixel più chiaro, 30 px', over(C.pennarello, vetroChiaro, OP.fallito), vetroChiaro, 3);
// Segni turchesi sul vetro (non testo)
t('segni','trattino libero turchese-vetro su pixel più chiaro', C.turcheseVetro, vetroChiaro, 3);
t('segni','trattino libero turchese-vetro su specchio', C.turcheseVetro, C.specchio, 3);
t('segni','sottolineatura del nome turchese-vetro su pixel più chiaro', C.turcheseVetro, vetroChiaro, 3);
t('segni','anello di fuoco turchese-vetro su pixel più chiaro', C.turcheseVetro, vetroChiaro, 3);
t('segni','anello di fuoco turchese-vetro su parete', C.turcheseVetro, C.parete, 3);
t('segni','linea di base del campo (pennarello) su pixel più chiaro', C.pennarello, vetroChiaro, 3);
// Parete: fascia e mensola
t('parete','pennarello (Figtree, Limelight) su parete', C.pennarello, C.parete, 4.5);
t('parete','tratto barbiere attivo turchese su parete', C.turchese, C.parete, 3);
t('parete','bottone turchese su parete (confine)', C.turchese, C.parete, 3);
t('parete','testo parete su bottone turchese (Figtree 600 15-17 px)', C.parete, C.turchese, 4.5);
t('parete','testo parete su bottone al passaggio (turchese-vetro)', C.parete, C.turcheseVetro, 4.5);
t('parete','testo specchio su bottone turchese (proposta del CD, scartata)', C.specchio, C.turchese, 4.5);
t('parete','selezione: parete su turchese-vetro', C.parete, C.turcheseVetro, 4.5);
// Decorativi (nessuna soglia)
t('decoro','anello di fuoco su vapore pieno (il vapore si pulisce attorno in 300 ms)', C.turcheseVetro, C.vapore, 0);
t('decoro','bisello luce su parete', C.bisello, C.parete, 0);
t('decoro','bisello ombra su parete', C.biselloOmbra, C.parete, 0);
t('decoro','specchio su parete (bordo del vetro)', C.specchio, C.parete, 0);
t('decoro','turchese su specchio (mai testo)', C.turchese, C.specchio, 0);
t('decoro','vapore su specchio', C.vapore, C.specchio, 0);
t('decoro','specchio su vapore', C.specchio, C.vapore, 0);
t('decoro','riflesso-luce (piano C) su specchio', C.riflessoLuce, C.specchio, 0);
for (const a of [0.78, 0.9]) { const [fg,bg] = sottoVapore(a); t('decoro',`pennarello sotto vapore ${a} (si intuisce)`, fg, bg, 0); }
t('controllo','pennarello su foto NON trattata (bianco puro, velatura 66%)', C.pennarello, vetroBianco, 7);

const f = n => n.toFixed(2);
console.log(`vetro chiaro ${vetroChiaro} · vetro scuro ${vetroScuro} · vetrina lunga ${vetroLunga} · alone ${alone} · foto non trattata ${vetroBianco}\n`);
console.log('| Gruppo | Coppia | Primo piano | Fondo | Rapporto | Soglia | Esito |\n|---|---|---|---|---|---|---|');
for (const [g,n,fg,bg,r,s] of rows) console.log(`| ${g} | ${n} | \`${fg}\` | \`${bg}\` | ${s? '**'+f(r)+':1**' : f(r)+':1'} | ${s? s+':1':'nessuna'} | ${s ? (r >= s ? 'passa' : 'NON passa') : 'decorativo'} |`);
```
