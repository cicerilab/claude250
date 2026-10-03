# Art director · Concept 19 · NODI

Ondata 2. Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`, riga e paragrafo 19 di
`docs/matrice-concept-11-20.md`, tutti i doc dell'ondata 1 in
`concepts/19-nodi/docs/` (creative-director, trend-researcher,
brand-strategist, ux-architect, tech-architect), `docs/motion-designer.md`
(Richieste), screenshot `docs/concept-attuali/concept-1, 3, 6, 8, 12, 19.jpg`.
Formato preso da `concepts/18-sottoscocca` e dal pilota, non il design.

## File consegnati

| File | Cosa contiene |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: front matter con colori, tipografia, raggi, spaziature, componenti; poi tema, ruoli, tipografia, componenti, griglia, profondità, cosa fare e non fare, responsive, guida per gli agent |
| `src/pages/concepts/nodi/styles/tokens.css` | variabili `--nod-*` su `.nod-root`, ripieghi metrici dei font, blocco reduced motion |
| `src/pages/concepts/nodi/styles/tokens.ts` | specchio numerico: `PALETTE` (hex, srgb, lin), `ALFA`, `SCENA`, `VENA`, `OMBRA`, `FONT_CSS_URL`, `FONT_DA_CARICARE`, `FONT`, `TIPO` + `pxA()`, `MISURE`, `FOGLIE_SCHERMO`, `TEMPI`, `TEMPI_RIDOTTI`, `LIVELLI`, utilità pure (`hexAVec3`, `vec3Lineare`, `componi`, `contrasto`). Typecheck strict verde |
| `qa/art-director/` | prove a schermo (ignorate da git) |

Nessun `base.css`/`layout.css`/CSS di sezione toccato (sono di scaffold e builder).

---

## 1. Decisioni

### 1.1 Palette: confermo i quattro del CD, tre derivati in più

Abete, tè, vernice, ebano restano quelli del CD. Aggiunti:
- **abete scuro `#DCC593`**: il fondo del piano del suono ("abete leggermente
  più scuro", CD §4.4) e del campo a fuoco. È l'unica seconda superficie
  (trend R5: niente secondo tono di fondo per le sezioni).
- **tè chiaro `#5D4D3A`** (tè all'80 % su abete): secondo tono delle foglie.
- **assi `#7C6B53`** e **tacca `#7F6F56`**: tè al 62 % e al 60 %, perché
  il tè al 40 % del CD per gli assi fa **1,83:1** su abete scuro (sotto il 3:1
  della grafica dei comandi, trend R6) e le tacche al 45 % facevano 2,36:1.
- **cuscinetto `#B2A485`**, **ombra `#C4B28F`**: i valori del CD (ebano 25 %,
  tè 20 %) già composti, così il GL usa colori pieni identici al DOM.

Vernice: solo cifre, cursore, tacca "la tua voce", segno d'errore. Misurata
sui pixel delle prove (P4 del trend, soglia 1 %): 0,09-0,37 % a 1440,
0,29-0,61 % a 768, 0,75-0,98 % a 375. A 375 Costruire sta al limite: niente
altre cifre in vernice oltre a prezzo e mesi.

### 1.2 Tipografia: confermo IM Fell DW Pica + Spline Sans

Misure dai file di Google Fonts (fontTools): IM Fell altezza x 0,44 em,
larghezza media 0,38 em, solo `liga locl`; Spline Sans `tnum` presente,
spazio **0,18 em** (Arial 0,28). Decisioni:
- **`h1` 34 → 48 px** (non 52): misurato in Chromium con i font veri, la frase
  del CD "Prima di chiudere un violino, lo ascoltiamo." (44 caratteri) va a
  **tre righe** a 384 px anche a 44 e 48 px. A 48 px stanno in due righe le
  frasi fino a circa 36 caratteri ("Le foglie di tè ascoltano la tavola."
  sì). Regola per il copywriter: `h1` ≤ 36 caratteri. A 335 px e 34 px la
  frase lunga sta in due righe.
- `h2` 32 → 56: "Costruire uno strumento" e "La voce che vorresti" vanno a due
  righe a 384 px, bene così (il titolo è grande e la colonna stretta).
- **`word-spacing: 0.06em`** su tutto il testo Spline sotto i 20 px: con lo
  spazio nativo le parole si attaccavano a 15-17 px (visto a schermo).
- Seconda riga del marchio IM Fell **18 px**, solo sul largo: unica eccezione
  alla soglia di 24 px del trend (P5). A schermo si legge e fa cartiglio; su
  stretto toccava il contorno della tavola, quindi lì va nel menu.
- Ripieghi metrici: Fell → Times New Roman / Liberation Serif `size-adjust`
  96,8 %, `ascent` 94,24 %, `descent` 34,91 %; Spline → Arial / Liberation Sans
  101,8 %, 94,64 %, 23,23 % (larghezza media su una frase italiana, metriche
  hhea). Georgia resta in fondo alla lista `local()` ma non è tarata.

### 1.3 Griglia: il banco di prova

Niente 12 colonne: due linee orizzontali (bordo alto e basso della tavola,
`min(86svh, 1000px)` centrata) e quattro corsie (zona del bottone del sito,
lettura `clamp(320px, 26.7vw, 440px)` da x 72, tavola sull'asse, righello con
binario a x 1000, banco 180 px a 40 px dal bordo). Il righello va da linea a
linea, il banco e l'apertura finiscono sulla linea bassa ("linea del banco").
Dettagli in `DESIGN.md` §5.

### 1.4 Righello (provato a schermo)

- Valore su una corsia sua a **64 px** dal binario: a 24 px il "352 Hz"
  copriva la cifra "350". Le cifre della scala entro 24 px dal cursore si
  nascondono.
- Cursore **20 × 3 px** (era 16 × 2): su stretto, tra le tacche, non si
  trovava.

### 1.5 Texture e profondità

Una sola ombra (la tavola, tè 20 %, 9 mm di sfocatura, 3 mm in basso). La
sola texture è la vena procedurale nello shader (`VENA`: passo 1,4 → 2,2 mm,
contrasto 0,55, ondulazione 0,18, giunta 0,25 mm). Nessuna grana sul fondo.

### 1.6 Foto

4:3, 360 px sul largo, colonna intera su stretto, nessuna cornice, nessun
filtro, fondo abete scuro mentre caricano, mai sopra o dietro la tavola.

---

## 2. Contrasti WCAG 2.x (calcolati)

Calcolati con lo script in appendice (luminanza relativa IEC 61966-2-1,
alfa composte in sRGB come fa il browser).

| Coppia | Rapporto | Soglia | Esito |
|---|---|---|---|
| tè su abete (corpo 17 px) | 9,28:1 | 4,5:1 | passa |
| tè su abete scuro (piano del suono, 14-15 px) | 8,04:1 | 4,5:1 | passa |
| tè su abete scuro (campo a fuoco, 17 px) | 8,04:1 | 4,5:1 | passa |
| vernice su abete (cifre 12-44 px) | 5,28:1 | 4,5:1 | passa |
| vernice su abete scuro (tacca "la tua voce") | 4,58:1 | 3:1 | passa |
| ebano su abete (titoli) | 12,75:1 | 4,5:1 | passa |
| abete su ebano (bottone) | 12,75:1 | 4,5:1 | passa |
| abete su tè (bottone premuto) | 9,28:1 | 4,5:1 | passa |
| tè chiaro su abete (foglie; anche come testo passerebbe) | 5,56:1 | 4,5:1 | passa |
| assi tè 62 % su abete scuro (grafica 1.4.11) | 3,04:1 | 3:1 | passa |
| assi tè 40 % (valore del CD, **scartato**) | 1,83:1 | 3:1 | non passa |
| tacche tè 60 % su abete (grafica) | 3,34:1 | 3:1 | passa |
| bordo campo tè 1 px su abete | 9,28:1 | 3:1 | passa |
| bordo campo a fuoco ebano 2 px su abete scuro | 11,04:1 | 3:1 | passa |
| contorno tavola ebano su abete | 12,75:1 | 3:1 | passa |
| anello di fuoco ebano su abete / abete scuro | 12,75 / 11,04:1 | 3:1 | passa |
| cuscinetto su abete (oggetto nel GL, non un comando) | 1,69:1 | n.a. | voluto: è gommapiuma sotto le foglie |
| abete vena / abete scuro su abete (superfici) | 1,23 / 1,15:1 | n.a. | decorativo |
| vernice su ebano, tè su ebano | 2,41 / 1,37:1 | 4,5:1 | **coppie vietate**, mai usate |

---

## 3. Prove a schermo

Pagina di prova nello scratchpad (tokens veri, font veri serviti in locale,
contorno della tavola approssimato a mano solo per la prova: quello vero è del
vector-artist), servita su **9191**, Chromium di `/opt/pw-browsers`, finestra
(non full page) a 1440 × 900, 768 × 1024, 375 × 667, schermate apertura,
Costruire (modo 2) e La voce (modo 5). `document.fonts.check` vero per
entrambe le famiglie in tutti gli scatti. Scatti in `qa/art-director/`.
Guardati uno per uno. Cosa ho visto e cambiato:
- palette: l'abete satura tiene la pagina lontana dalle creme di 3, 6, 8 e
  dal marrone di ANIMA; il rosso vernice resta un segno di misura;
- `h1` a tre righe → max 48 px e regola dei 36 caratteri (§1.2);
- parole attaccate in Spline → `word-spacing` (§1.2);
- "modo 5" a capo nell'indice a 164 px → banco 180 px e `nowrap` (§4 DESIGN);
- "352 Hz" sopra la cifra 350 → corsia del valore a 64 px (§1.4);
- cursore poco visibile su stretto → 20 × 3 px (§1.4);
- "brillante" fuori dalla finestra a 375 (scrollWidth 425) → su stretto le
  parole del piano stanno dentro il quadrato;
- seconda riga del marchio a 375 sopra il contorno → solo sul largo.

---

## 4. Come si usano

- Import (scaffold, in `Radice.tsx` o in `base.css`): `tokens.css` per primo,
  poi `base.css`, `layout.css`, CSS di sezione.
- Nei componenti solo ruoli (`--nod-testo`, `--nod-cifra`, `--nod-azione`…),
  mai `--nod-vernice` nudo fuori da `--nod-cifra`/`--nod-cursore`, mai hex.
- Cifre: `font-variant-numeric: tabular-nums; letter-spacing:
  var(--nod-tracking-cifra)`.
- Tempi e curve: `--nod-t-*` e `--nod-curva-*` (valori del motion-designer,
  `motion/easing.ts`); con `data-motion="reduced"` `--nod-t-caduta` è 0 e
  `--nod-t-cuscinetti` 400 ms.
- GL: `SCENA`, `VENA`, `OMBRA`, `FOGLIE_SCHERMO`, `MISURE.dprMax` da
  `tokens.ts`.

---

## Richieste ad altri agent

- **copywriter**: `h1` al massimo 36 caratteri spazi compresi (misurato); la
  frase del CD va accorciata o divisa tra `h1` e frase. Cifre separate dalle
  unità ("da" e "mesi" restano parole, non dentro la cifra). Nessuna data o
  stagione dentro un titolo.
- **scaffold-engineer**: in `base.css` su `.nod-root`: fondo `--nod-fondo`,
  colore `--nod-testo`, `font-family: var(--nod-font-spline)`,
  `word-spacing: var(--nod-spazio-parole)` (azzerato sugli elementi con
  `--nod-t-valore`/`--nod-t-cifra` e sui titoli IM Fell), `::selection` con
  `--nod-selezione-*`, `:focus-visible` con `--nod-fuoco`; titoli `h1-h3` in
  `--nod-font-fell` 400 senza `font-style: italic` né `font-synthesis`
  (`font-synthesis: none`). In `layout.css`: banco largo
  `var(--nod-banco-w)` a `right: var(--nod-banco-destra)`.
- **orchestratore / scaffold**: le soglie di ux (desktop ≥ 1200, stretto
  < 1024) e di tech (largo ≥ 1100 con rapporto ≥ 5:4) non coincidono. Ho
  scritto in `DESIGN.md` §8 la sintesi: largo da 1100 + 5:4 (tech, decide
  `core/viewport.ts`), colonna del banco da 1200 (ux), tra 1100 e 1199 il
  marchio è il menu.
- **section-builder-righello**: corsia del valore a `--nod-regolo-valore-x`,
  cifre della scala nascoste entro `--nod-regolo-vuoto` dal cursore, cursore
  `--nod-cursore-segno` × `--nod-cursore-spessore`, indice con "modo N" in
  `nowrap`.
- **section-builder-voce**: su stretto le parole "scuro" e "brillante"
  dentro il piano, sopra l'asse; cerchio "equilibrata" tratteggiato 1 px
  `--nod-piano-assi`.
- **webgl-artist / shader-engineer**: colori da `SCENA` (pieni, niente alfa
  sui cuscinetti); se si passano i `lin` alle uniform di uno
  `ShaderMaterial`, mettere `#include <colorspace_fragment>` e verificare un
  pixel di tavola senza vena = `#E6D4AC` ±1, perché canvas, poster e fondo
  devono combaciare. Foglie ≥ 4 px sul lato lungo (`FOGLIE_SCHERMO`).
- **vector-artist**: `--nod-tavola-rapporto` è 240 / 388 (riquadro del
  tech-architect); se `TAVOLA.riquadro` cambia, lo aggiorno io.
- **motion-designer**: fatto quanto chiesto (curve `--nod-curva-*` dai
  `BEZIER_CSS`, `--nod-t-canvas`, `--nod-t-cuscinetti`, blocco reduced
  motion); `--nod-ease-fermo` tolto.

---

## Appendice: script dei contrasti

```js
// node contrasti.mjs
const hex = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255);
const lin = v => v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4;
const L = c => 0.2126*lin(c[0]) + 0.7152*lin(c[1]) + 0.0722*lin(c[2]);
const ratio = (a,b) => { const [x,y] = [L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const blend = (fg, a, bg) => fg.map((v,i) => v*a + bg[i]*(1-a));
const P = { abete: hex('#E6D4AC'), abeteScuro: hex('#DCC593'), abeteVena: hex('#D6BF8E'),
  te: hex('#3B2B1D'), vernice: hex('#8B3A1D'), ebano: hex('#16120F') };
const D = { teChiaro: blend(P.te, 0.80, P.abete), assi: blend(P.te, 0.62, P.abete),
  tacca: blend(P.te, 0.60, P.abete), cuscinetto: blend(P.ebano, 0.25, P.abete),
  ombra: blend(P.te, 0.20, P.abete) };
// esempio: ratio(P.te, P.abete) → 9.28 ; ratio(D.assi, P.abeteScuro) → 3.04
```

Nota: gli assi sono composti su abete (come nel CSS, dove `--nod-assi` è un
colore pieno) e misurati su abete scuro, cioè il caso peggiore.
