# WebGL artist · Concept 10 · IMPRONTA

Ondata 2. Materiale della carta, rilievo, inchiostro, lamina e luce radente.
Seguiti `design-taste-frontend` (niente effetto "demo", niente
post-processing, un solo materiale) e `full-output-enforcement` (file
completi, nessun segnaposto).

Letti: `creative-director.md`, `trend-researcher.md` (§5.2 soprattutto),
`tech-architect.md` (§2, §6, §7, §8, §9), `ux-architect.md` (le parti su luce,
pezzi e banco), `brand-strategist.md`, e, perché nel frattempo erano già
scritti, `styles/tokens.ts`, `docs/art-director.md`, `interaction/light.ts`.

---

## 0. In breve

- **Un piano, un materiale, una draw call.** Il fragment shader disegna il
  foglio ovunque e, dentro i rettangoli di al massimo 8 blocchi, legge la mappa
  d'altezza dall'atlante e ne ricava le normali.
- **Carta opaca, luce e ombra tinte della carta.** Sul foglio piatto il colore
  è esattamente il `fondo` dei token (si lavora in sRGB apposta); le pareti del
  solco vanno verso `luce` o `ombra` della carta stessa, mai verso bianco o
  nero. Speculare solo sulla lamina.
- **Rilievo basso.** Solco di 1-4,5 px CSS, ombra portata di pochi px, smusso a
  tre gradini (spigolo, spalla, coda) fatto con blur separabile a tre raggi.
- **Pressione 0→1 per blocco**: profondità, larghezza del rilievo (0,8→1,
  ancorata a sinistra), comparsa dell'inchiostro e della lamina quando la forma
  tocca la carta.
- **Maschere con la metrica del DOM**: ogni carattere va dove il browser l'ha
  composto (anche nei pezzi ruotati), con correzione orizzontale del glifo.
- **Compila e gira** in Chromium headless su WebGL2 e su WebGL1 (§11).

---

## 1. File (tutti in `src/pages/concepts/impronta/webgl/`)

| File | Cosa fa |
|---|---|
| `shaders/fullscreen.vert.glsl` | Vertex a schermo intero, comune ai tre materiali (PlaneGeometry 2×2, già in clip space). |
| `shaders/relief.frag.glsl` | Il frame: carta, fibra, onda di cambio carta, pezzi appoggiati (costa e ombra di contatto), rilievo, ombra portata, inchiostro, lamina. |
| `shaders/blur.frag.glsl` | Blur gaussiano separabile a quattro raggi in un colpo (r1, r2, r3 sull'altezza, rInk sull'inchiostro). Solo in cottura. |
| `shaders/composite.frag.glsl` | Somma i tre raggi nel profilo a gradini, aggiunge il cuscinetto, scrive lo slot dell'atlante. Solo in cottura. |
| `materials.ts` | Crea i tre `ShaderMaterial`, documenta il layout degli uniform, offre i setter (vista, luce, carte, onda, blocchi, cottura). |
| `maskPainter.ts` | ReliefSpec + elemento DOM → canvas 2D (R altezza, G inchiostro, B lamina). |
| `fiber.ts` | Fibra procedurale 256² RGBA ripetibile, deterministica, generabile a pezzi. |
| `presets.ts` | Numeri di materiale: tecniche, carte, luce, lamina; conversione dei token colore; parametri statici per blocco. |

Nessun file accede a `window`/`document` a livello di modulo. Gli shader si
importano con `?raw`. Nessun colore hex scritto in questi file: i colori
arrivano da `styles/tokens.ts`.

---

## 2. Il materiale, regola per regola

| Regola (CD §4.3, trend §5.2) | Come è fatta nello shader |
|---|---|
| Carta opaca, niente plastica | Solo diffusione sulla carta. `t = (N·L − L.z) × sensibilità`: vale 0 sul piano, quindi la carta piatta non cambia colore; le facce verso la luce vanno verso `luce`, le altre verso `ombra` con una curva `1 − e^(−1,25 t)` che non satura di colpo. |
| Ombre tinte, mai nere | Tutte le ombre (pareti, ombra portata, fondo del solco, ombra di contatto dei pezzi, costa) mescolano verso `ombra` della carta, pesata da `ombraForza` della carta. |
| Rilievo basso, smusso morbido | Profondità in em del corpo con limiti in px (tabella §6). Smusso: tre blur gaussiani (0,6 px → 8 px) sommati con pesi del profilo; ombra portata con 4 passi verso la luce, lunga al massimo `profondità / tan(elevazione)`. |
| Luce bassa, escursione limitata | La luce arriva da `runtime.light` (135°/22° a riposo, elevazione 18-25° già limitata da `interaction/light.ts`). `presets.limitaLuce()` offre anche il limite d'arco ±55° per chi lo vuole. |
| Fibra quasi invisibile | Pendenza della fibra 0,018 (una pendenza di 0,02 sposta il colore dello 0,3% circa); macchie di formazione ±2% di albedo. Sotto inchiostro, lamina e sul fondo del solco la fibra si attenua (la carta schiacciata è più liscia). Ancorata al documento: scorre con la pagina. |
| Inchiostro opaco, bevuto dalla fibra | Inchiostro morbido (blur 0,4-0,45 px) tagliato con una soglia spostata dalla fibra (±0,2 al massimo): il bordo trema di decimi di px, non cola. Il film segue un terzo della luce del solco e lascia passare la formazione (±2%). |
| Lamina argento sobria | Ward anisotropo con venatura lungo x del blocco (il rullo), lobo stretto (tetto 0,42) per il riflesso che scorre sugli spigoli, lobo largo per il satinato, spazzolatura dalla fibra stirata ×12. Colore base dai token (`LAMINA.base`), poca diffusione. Niente gradiente oro, niente iridescenza, niente glow; tutto limitato a 0,97. |
| Niente post-processing, niente tempo | Nessun bloom, vignetta, aberrazione, grana animata. Lo shader non ha `uTime`: l'immagine cambia solo se cambia un uniform (render on demand). L'arco della luce nell'hero è del ticker. |

Controllo di qualità fatto (trend §5.2): screenshot fermo dell'hero senza
cursore. Il solco a secco su Citrino si legge come una foto di carta premuta:
pareti in alto a sinistra in ombra ocra, pareti in basso a destra con il
labbro chiaro, fondo appena più scuro, fibra visibile solo da vicino.

---

## 3. Pipeline di cottura (una volta per versione del blocco)

```
ReliefSpec + el ─ maskPainter.disegnaMaschera() ─▶ canvas 2D  (R altezza, G inchiostro, B lamina)
canvas ─ CanvasTexture (flipY true, Linear, niente mipmap)
       ─ BLUR passaggio 0 (orizzontale) ─▶ RT A   R=blur(h,r1) G=blur(h,r2) B=blur(h,r3) A=blur(ink,rInk)
RT A   ─ BLUR passaggio 1 (verticale)   ─▶ RT B   ogni canale con il suo raggio
maschera + RT B ─ COMPOSITE, viewport/scissor sullo slot ─▶ ATLANTE
```

Layout dello slot nell'atlante (letto da `relief.frag.glsl`):

| Canale | Contenuto |
|---|---|
| R | altezza con profilo a gradini; **foglio = `HEIGHT_BIAS` (0,12)**, fondo del solco = 1. Sotto il bias c'è il cuscinetto (carta che si gonfia attorno al solco, circa 5% della profondità). |
| G | inchiostro morbido |
| B | lamina, netta |
| A | altezza "stretta" (solo r1): scurimento del fondo del solco |

Requisiti per `atlas.ts` (shader-engineer):
- RT A e RT B alla misura della maschera, `ClampToEdge`, `LinearFilter`,
  niente depth; blending spento (i materiali hanno già `NoBlending`).
- Atlante: se il contesto sa renderizzare in `HalfFloatType` (WebGL2 con
  `EXT_color_buffer_float`) usarlo, altrimenti `UnsignedByteType`. A 8 bit
  va bene (la fibra fa da dithering; testato), a 16 bit le pareti sono più
  pulite nei corpi molto grandi.
- **2 texel di spazio tra gli slot.** Lo shader tiene comunque i campioni
  dentro lo slot (mezzo texel), ma il filtro lineare legge il vicino.
- `uBlockUv = [x/W, y/H, w/W, h/H]` con **y = bordo basso dello slot** in
  coordinate del render target (quelle di `viewport.set`).

---

## 4. Layout degli uniform del rilievo (1 draw call)

Tutto in `materials.ts` (commento in testa e setter). Spazio "pagina" = px
del drawing buffer, origine **in alto a sinistra**, y in basso, come il DOM.

| Uniform | Contenuto | Chi lo scrive, quando |
|---|---|---|
| `uView` | [w_buffer, h_buffer, dpr, scrollY in px CSS] | `impostaVista` su resize/DPR e a ogni frame (scroll) |
| `uMeta` | [w_atlante, h_atlante, n_blocchi, 0] | `impostaAtlante`, `impostaNumeroBlocchi` |
| `uLight` | [lx, ly, lz, intensità]: direzione verso la luce | `impostaLuce(azimut, elevazione, intensità)` a ogni frame in cui la luce si muove |
| `uLightPos` | [x, y, altezza, peso]: lampada del riflesso della lamina | `impostaLuce` la mette fuori schermo lungo l'azimut; `impostaLampada` la può mettere sopra il puntatore |
| `uPaper` | [pendenza fibra, sensibilità luce, ombra di contatto, fondo solco] | alla creazione (da `CARTA_GLOBALE`) |
| `uLamina`, `uLaminaParam` | argento sRGB; [venaturaX, venaturaY, riflessoMax, satinato] | `impostaLamina(LAMINA.base)` alla creazione |
| `uWave`, `uCarteAttive` | onda del cambio carta; [carta foglio, carta in arrivo, onda attiva, 0] | `impostaOnda` durante l'onda, `impostaCartaAttiva` a riposo |
| `uCarte[16]` | 4 carte × [fondo+fibra, luce+luceForza, ombra+ombraForza, inchiostro+assorbimento] | `impostaCarte(palette)` alla creazione |
| `uBlockRect[8]` | [x, y, w, h] px buffer, rettangolo NON ruotato, già allargato del margine della maschera | `scriviBlocco` a ogni frame |
| `uBlockUv[8]` | [u0, v0 basso, du, dv] | `scriviBlocco` |
| `uBlockA[8]` | [pressione, rotazione rad, profondità px buffer, carta del pezzo o −1] | `scriviBlocco` |
| `uBlockB[8]` | [inchiostro 0/1, lamina 0/1, stringiMin, spessore costa px buffer] | `scriviBlocco` |

Totale **57 vec4** nel fragment (9 + 16 + 32): sotto i 64 che anche i
telefoni WebGL1 danno in pratica; WebGL2 ne garantisce 224. Campionatori: 2
(`tAtlas`, `tFiber`). Nomi rispetto a tech-architect §7.4: `uRect` →
`uBlockRect`, `uAtlas` → `uBlockUv`, `uParam` → `uBlockA` + `uBlockB`,
`uCarta[4]` → `uCarte[16]` (tutte e quattro le carte, servono ai pezzi di "Per
chi" e all'onda). Non c'è `uTime` (vedi §2).

Ordine dei blocchi: dove due blocchi si coprono vince l'ultimo scritto; per
"Per chi" scrivere prima i pezzi che stanno sotto.

Costo per pixel: fuori dai blocchi 1 lettura (fibra) + 8 test di distanza;
dentro un blocco 10 letture dell'atlante (centro, 4 per le normali, 4 per
l'ombra portata) + 1 per la spazzolatura se c'è lamina. Nessuna estensione,
nessuna derivata.

---

## 5. Pressione

`uBlockA.x`, scritta dal registro (`registry.setPressione` →
`motion/usePressione`). Nello shader:

- profondità = `profondità × pressione` (il micro rimbalzo fino a ~1,03 è
  ammesso, `scriviBlocco` taglia a 1,08);
- larghezza del rilievo = `mix(stringiMin, 1, pressione)`, ancorata al bordo
  sinistro del rettangolo (stesso 0,8 dell'art-director, §1.2 del suo doc);
- inchiostro: compare tra pressione 0,05 e 0,35; lamina tra 0,15 e 0,55
  (la forma deve toccare la carta prima di lasciare il segno).

A pressione 0 il blocco è carta piatta: nessun salto quando la pressa inizia.

---

## 6. Preset (`presets.ts`)

### 6.1 Tecniche

| Tecnica | Canali maschera | Profondità (em, min-max px) | Smusso r1/r2/r3 (em) | Profilo (pesi, cuscinetto) | stringiMin |
|---|---|---|---|---|---|
| `secco` (a secco) | R 1 | 0,018 (0,8-4,5) | 0,006 / 0,014 / 0,03 | 0,5 0,3 0,2 · 0,12 | 0,8 |
| `colore` (a un colore, inchiostro) | R 0,85 + G | 0,014 (0,6-3,6) | 0,005 / 0,012 / 0,026 | 0,55 0,3 0,15 · 0,08 | 0,8 |
| `lamina` (a caldo) | R 0,8 + B | 0,012 (0,6-3) | 0,004 / 0,01 / 0,022 | 0,6 0,3 0,1 · 0,05 | 0,8 |
| `cordonatura` (piega) | R 1 | 0,05 (1-3) | 0,03 / 0,06 / 0,1 | 0,15 0,35 0,5 · 0,25 | 1 |

Esempio: *impronta* a 170 px → solco di 3,1 px, smusso 1 / 2,4 / 5,1 px.
Per le forme senza testo (svg, cordonature) il corpo convenzionale è 40 px.
Un layer di un pezzo con `profondita: 0.3` e tecnica `colore` è l'inchiostro
"a bacio": quasi piatto, per date e indirizzi dei pezzi.

### 6.2 Carte (materiale; i colori sono dei token)

| Carta | Fibra (×) | luceForza | ombraForza | Assorbimento | Costa px |
|---|---|---|---|---|---|
| Citrino 300 g | 1 | 0,85 | 0,8 | 0,5 | 1 |
| Cotone 600 g | 1,25 | 0,95 | 0,85 | 0,7 | 1,8 |
| Cipria 350 g | 1,05 | 0,85 | 0,8 | 0,55 | 1,1 |
| Grafite 400 g | 0,7 | 0,8 | 1 | 0,4 | 1,3 |

La costa coincide con `spessorePezzoPx` dell'art-director. I colori si
passano così: `paletteCarta(CARTE[id])` (accetta hex o vec3 0..1 o 0..255).

### 6.3 Luce e lamina

- Convenzione identica a `interaction/light.ts`: azimut = da dove arriva la
  luce, y in alto, 0 = da destra, 90 = dall'alto, 135 = in alto a sinistra.
  `direzioneLuce()` la porta nello spazio pagina (y in basso).
- Lamina: `venaturaX 0,22`, `venaturaY 0,75`, `riflessoMax 0,42`,
  `satinato 0,35`. Con luce a 90-135° la lamina si accende di più (luce
  trasversale alla venatura), verso 180° si spegne: è il comportamento del
  metallo spazzolato, e non cambia mai più in fretta della luce (che ha il
  suo lerp).

---

## 7. `maskPainter.ts`

```ts
disegnaMaschera({ spec, el, larghezza, altezza, scala, maxLato?, stile?, canvas?, fontGiaPronti? })
  → Promise<{ canvas, larghezzaTexel, altezzaTexel, scala, padCss,
              larghezzaCss, altezzaCss, raggiTexel, corpoCss, tecnica }>
leggiStile(el) → StileMaschera     fontCanvas(stile) → stringa ctx.font
```

- **Metrica del DOM**: per ogni carattere un `Range` dà il rettangolo
  composto dal browser; il centro viene riportato nel riferimento non
  ruotato del blocco (serve per i pezzi ruotati, dove i rettangoli sono già
  ruotati), l'avanzata DOM viene ricavata invertendo la rotazione, e il
  glifo del canvas viene stretto o allargato (0,6-1,6) finché la sua
  avanzata coincide. Così contano crenatura, `letter-spacing`, `text-transform`,
  a capo, e anche larghezze che il canvas non sa chiedere. Lo stile si legge
  dal genitore di ogni nodo di testo (span con pesi diversi funzionano).
  Verificato a schermo con il DOM in rosso sopra il rilievo: coincidono.
- **Senza elemento** (o con `stile` forzato): composizione sul canvas con a
  capo per parole, allineamento, interlinea come il DOM (area del contenuto
  centrata nella riga), `letterSpacing` nativo dove c'è.
- `kind: 'svg'`: l'svg (qualunque colore) diventa sagoma monocroma
  (`source-in`), rasterizzato alla misura finale (width/height forzati, per
  Safari), contenuto nel rettangolo.
- `kind: 'piece'`: layer in percentuale; `text` (con `selettore` per usare la
  metrica DOM di un figlio), `svg`, `linea` (cordonatura: il riquadro con
  estremità tonde).
- **Margine**: `padCss` per lato (0 per i pezzi) perché blur e cuscinetto non
  vengano tagliati. Il rettangolo per lo shader è
  `{ x: blocco.x − padCss, y: blocco.y − padCss, w: larghezzaCss, h: altezzaCss }`.
- Fa `document.fonts.load()` di tutte le combinazioni usate prima di
  disegnare, salvo `fontGiaPronti`. Il canvas si può riusare (Banco).
- Misurati in headless: 1-10 ms per maschera (hero 5 ms, pezzi 1-2 ms).

---

## 8. `fiber.ts`

- 256×256 RGBA: RG pendenza del micro rilievo (normale xy), B formazione
  (nuvole di 16-64 px), A soglia di assorbimento dell'inchiostro. 1 texel =
  1 px CSS. Circa 730 fibre di 6-30 px, orientate per il 62% lungo la
  direzione di macchina, più un feltro a 2 e 4 px.
- `generaFibra()` sincrona (18-24 ms a JIT caldo, ~50 ms a freddo su un
  portatile), oppure **`generaFibraAPezzi(cedi)`** che cede il thread tra i
  passi: passo più lungo misurato 3,8 ms, risultato identico al byte. Da usare
  questa in `ImprontaGL` per non creare un task lungo (TBT ≤ 150 ms).
- `creaTexturaFibra(dati)` → `DataTexture` Repeat/Linear senza mipmap. Se si
  cambia il lato, passare `latoFibra` a `creaMaterialeRilievo`.

---

## 9. Istruzioni per lo shader-engineer (uso dei miei file)

```ts
// creazione (in idle, dopo i font)
const fibra = creaTexturaFibra(await generaFibraAPezzi(() => new Promise(r => setTimeout(r, 0))));
const rilievo = creaMaterialeRilievo({ atlante: atlas.texture, fibra, larghezzaAtlante: W, altezzaAtlante: H });
impostaCarte(rilievo, { citrino: paletteCarta(CARTE.citrino), cotone: paletteCarta(CARTE.cotone),
                        cipria: paletteCarta(CARTE.cipria), grafite: paletteCarta(CARTE.grafite) });
impostaLamina(rilievo, LAMINA.base);
impostaCartaAttiva(rilievo, store.get().carta);
const blur = creaMaterialeBlur(), comp = creaMaterialeComposite(), geo = creaGeometriaSchermo();

// cottura di un blocco (nuova versione)
const m = await disegnaMaschera({ spec, el, larghezza, altezza, scala: Math.min(dpr, 1.5) });
impostaBlur(blur, maskTex, m.larghezzaTexel, m.altezzaTexel, 0, m.raggiTexel);  // → RT A
impostaBlur(blur, rtA.texture, m.larghezzaTexel, m.altezzaTexel, 1, m.raggiTexel); // → RT B
impostaComposite(comp, maskTex, rtB.texture, m.tecnica);                         // → slot atlante
const statici = parametriBlocco({ tecnica: spec.tecnica, profondita: spec.profondita,
  corpoPx: m.corpoCss, dpr, carta: spec.carta ?? null, pezzo: spec.kind === 'piece' });

// ogni frame
impostaVista(rilievo, bw, bh, dpr, runtime.scrollY);
impostaLuce(rilievo, runtime.light.azimuth, runtime.light.elevation, intensitaIngresso);
scriviBlocco(rilievo, i, { x, y, w, h, u0, v0, du, dv, pressione, rotazioneGradi, statici }); // per i visibili
impostaNumeroBlocchi(rilievo, n);
```

Note:
- `parametriBlocco` va ricalcolato quando cambiano spec, corpo o DPR.
- La carta di un pezzo (`spec.carta`) è indipendente dalla carta del sito: i
  pezzi di "Per chi" restano Cipria/Cotone/Grafite anche se il foglio cambia.
  Per la prova del Banco passare la carta scelta nel compositoio.
- Onda: `impostaOnda(rilievo, { x, y, raggio, sfumatura, da, a })` in px del
  buffer, poi `impostaOnda(rilievo, null, a)` a fine onda.
- Dissolvenza d'ingresso del canvas: si può anche portare `intensita` di
  `impostaLuce` da 0 a 1 (la carta resta piatta e poi prende il rilievo).
- Reduced motion: `impostaLuce(rilievo, 135, 22)` fisso, pressione 1.

---

## 10. Contratti richiesti

### 10.1 `relief/types.ts` (scaffold) · coerente con tech-architect §7.1

Uso questi campi, con due piccole aggiunte:

```ts
type Tecnica = 'secco' | 'colore' | 'lamina' | 'cordonatura';   // + cordonatura

interface ReliefSpec {
  kind: 'text' | 'svg' | 'piece';
  text?: string;
  svg?: string;
  layers?: ReliefLayer[];
  tecnica: Tecnica;
  carta?: Carta;
  profondita: number;          // 0..1
  rotazione?: number;          // gradi, orari come CSS
  tracking: 'doc' | 'live';
  slot?: { maxW: number; maxH: number };
  priorita?: number;
}

// forma dei layer dei pezzi (tech-architect non la fissava): uguale a
// LayerMaschera di maskPainter.ts, che la legge così
interface ReliefLayer {
  kind: 'text' | 'svg' | 'linea';
  x: number; y: number; w: number; h: number;   // percento del pezzo, 0..100
  text?: string;
  svg?: string;
  tecnica?: Tecnica;           // se manca, quella del pezzo
  profondita?: number;         // 0..1; 0,3 = inchiostro "a bacio"
  selettore?: string;          // figlio del pezzo da cui prendere testo e metrica
  stile?: Partial<{ famiglia: string; dimensione: number; peso: number; larghezza: number;
                    spaziatura: number; interlinea: number;
                    allineamento: 'left' | 'center' | 'right';
                    trasformazione: 'none' | 'uppercase' | 'lowercase' | 'capitalize' }>;
}
```

`maskPainter.ts` importa solo `type { ReliefSpec }`. Se lo scaffold non vuole
`cordonatura` in `Tecnica`, basta che accetti una stringa: `tecnicaGL()` la
normalizza (valori ignoti → `secco`).

### 10.2 Altri contratti

- **Registro**: per i pezzi ruotati il rettangolo da passare è quello non
  ruotato (`offsetWidth/Height`) centrato sul centro del riquadro misurato;
  la rotazione va in `rotazioneGradi` (tech-architect §7.2, già così).
- **ReliefText (fantasma DOM)**: la maschera si cuoce leggendo il fantasma,
  quindi il fantasma deve avere **gli assi finali** (non animati) quando si
  cuoce. Con la scelta dell'art-director (titoli con assi fissi, pressione solo
  nel rilievo) è già così. Se un fantasma è a metà animazione, passare a
  `disegnaMaschera` lo `stile` finale: si compone sul canvas.
- **Token**: uso `CARTE[id].fondo/luce/ombra/inchiostro` e `LAMINA.base`,
  come indicato dall'art-director.
- **runtime.light**: azimut/elevazione in gradi con la convenzione di
  `interaction/light.ts` (identica alla mia).

---

## 11. Verifica: compilazione e resa in Chromium headless

Script di prova (fuori dal repo, nella scratchpad della sessione):
`/tmp/claude-0/-home-user-claude250/72613ce9-a18f-5d71-bb71-d39c705d752e/scratchpad/gltest/`

- `sync.sh` copia i miei file in `src/webgl/` accanto a uno stub di
  `relief/types.ts` (il contratto §10.1);
- `npx tsc -p tsconfig.json`: **typecheck verde** con `strict`,
  `noUncheckedIndexedAccess`, `noUnusedLocals`, `@types/three@0.160.0`;
- `build.mjs` (esbuild con plugin `?raw`) crea `prova.js`; `prova.html` ha
  fantasmi DOM veri in Anybody e Hanken (font scaricati in locale) e fa la
  pipeline completa: maschera → blur ×2 → composite nell'atlante 2048² →
  rilievo a schermo, con 7 blocchi (secco, colore, lamina, cordonatura svg, tre
  pezzi ruotati su Cipria, Cotone, Grafite);
- `corri.mjs` apre la pagina con Playwright (Chromium di `/opt/pw-browsers`,
  ANGLE/SwiftShader), raccoglie errori console e `renderer.info.programs`, fa
  screenshot anche ingranditi.

Esito (25/09/2026):

| Caso | Contesto | Programmi (blur, composite, rilievo) | Errori | Draw call |
|---|---|---|---|---|
| Citrino, DPR 1 e 2 | WebGL2 | 3/3 eseguibili | 0 | 1 |
| Grafite, Cotone, Cipria | WebGL2 | 3/3 | 0 | 1 |
| Onda Citrino → Cotone | WebGL2 | 3/3 | 0 | 1 |
| Pressione 0,35, luce 80° | WebGL2 | 3/3 | 0 | 1 |
| Cotone, luce 190° | **WebGL1** (`WebGL1Renderer`) | 3/3 | 0 (solo l'avviso di three sulla deprecazione di WebGL1) | 1 |

Controlli visivi fatti sugli screenshot: solco a secco con pareti tinte e
fibra appena visibile; inchiostro pieno con bordo appena irregolare anche a
15 px; lamina spazzolata che si spegne con la luce radente lungo la venatura;
pezzi con costa, ombra di contatto tinta e bordo con antialias (prima
dell'antialias il bordo di un pezzo ruotato di 0,5° faceva gradini: corretto);
DOM in rosso sovrapposto al rilievo: coincide. Tarature cambiate dopo gli
screenshot: fibra dimezzata (sembrava carta stropicciata), soglia
dell'inchiostro limitata (a 15 px colava), spazzolatura sulla lamina (senza
sembrava stagnola), macchie di formazione dal 3 al 2%.

**Cosa non è misurato**: i tempi GPU. SwiftShader è una GPU software (800 ms
a frame a 1280×720, senza significato). Le stime per GPU vera sono in §4
(10-11 letture per pixel dentro i blocchi, 1 fuori): vanno misurate dal
performance-auditor su un telefono vero.

---

## 12. Richieste ad altri agent

- **scaffold-engineer**: `relief/types.ts` come in §10.1 (aggiunta
  `cordonatura` e forma di `ReliefLayer`).
- **shader-engineer**: §3 (atlante con 2 texel di spazio, v0 in basso, half
  float se renderizzabile), §9 (sequenza), `generaFibraAPezzi` in idle.
  Ordine dei blocchi: pezzi sotto prima.
- **section-builder-per-chi**: i pezzi come `kind: 'piece'` con layer a
  `selettore` (vedi `LayerMaschera`), carta propria, rotazioni -2 / 1,5 /
  -0,5. La cordonatura di una partecipazione piegata è un layer
  `{ kind: 'linea', tecnica: 'cordonatura', h: 1 }`.
- **section-builder-tecniche**: il "taglio colorato" (bordo del foglio visto di
  tre quarti) **non è nello shader**: è una vista di taglio, non un rilievo.
  Va fatto in DOM/CSS con `CARTE[id].taglio` dell'art-director. Le altre tre
  tecniche della sezione sono `secco`, `colore`, `lamina` sulla stessa maschera
  (cambia solo la spec, quindi una ricottura per cambio tecnica).

---

## 13. Aperto

- Tempi reali su GPU mobile (performance-auditor).
- WebKit: `ctx.fontStretch` **non c'è in WebKit 26** (cross-browser-tester
  §4; la mia nota "c'è da Safari 17" era sbagliata). Il canvas disegna
  Anybody a larghezza 100 e la correzione orizzontale per carattere (fino a
  1,6) recupera la larghezza: ingombro e posizioni identici al DOM,
  verificato dal cross-browser-tester; aste appena più sottili. Tiene.

---

## Giro 2 (loop; voti giuria: design 6, usabilità 5,5, creatività 7,5, contenuto 7)

Richieste: rilievo più profondo e netto (è il prodotto del sito), luce più
radente (14-16° a riposo), lamina il cui riflesso scorre davvero, lamina
visibile su Citrino (section-builder-banco), grana dell'inchiostro in WebKit
(cross-browser-tester O3), nota su `ctx.fontStretch` (aggiornata in §13),
urto del motion-designer (G2.4). Toccati solo i miei file; il contratto con
lo shader-engineer resta quello di §4 e §9 (stesse funzioni, stessi uniform,
un solo campo facoltativo in più).

### Cosa è cambiato

| Tema | Prima | Ora |
|---|---|---|
| Luce | elevazione di `runtime.light` usata così com'è (riposo 22°) | `impostaLuce` passa l'elevazione per `elevazioneShader()`: 18-25° dell'interazione → **12-18°** nello shader, **riposo 15,4°**. `light.ts` e il fallback CSS restano come sono. |
| Profondità | secco 0,018 em (max 4,5 px) | secco **0,02 em** (1,2-5 px), colore 0,016, lamina 0,014 |
| Smusso | r1/r2/r3 0,006/0,014/0,03 em, fino a 8 px | **0,0028/0,006/0,013 em, massimo 3,2 px**, peso 0,72 su r1: parete ripida, labbro di luce netto, fondo piatto. r1 resta sotto 1 px fino a corpi di circa 300 px. |
| Ombra | parete e ombra portata a metà strada verso `ombra` (forza 0,8, portata ×0,55) | **piena**: `ombraForza` 1 su tutte le carte, portata ×0,9, sensibilità della luce 3,2 (era 2,2), curva più ripida |
| Lunghezza ombra | fino a 2,6 profondità | **ferma a 2 profondità**: con luce a 15° l'ombra geometrica sarebbe 3,6 volte e sembrerebbe un'estrusione. Piena e corta. |
| Fibra | pendenza 0,018 | 0,011: con la luce più forte deve restare quasi invisibile |
| Lamina | venatura orizzontale, lampada fuori schermo: riflesso quasi fermo | venatura verticale e rugosità stretta lungo di essa: **banda di riflesso orizzontale** sotto una lampada che sta dentro lo schermo e si sposta con l'azimut (puntatore, dito, giroscopio, dial). In più scorrere la pagina "gira il foglio" (il testo delle Tecniche dice "brilla quando giri il foglio"): la lampada oscilla di ±32% dello schermo per schermata di scroll, quindi anche nel pin delle Tecniche, dove la parola è ferma, il riflesso le passa sopra. Ferma se scroll e luce sono fermi. Tetto 0,5, mai oltre 0,97. |
| Lamina su Citrino | metallo 0,44-0,7 × argento ≈ luminanza del Citrino: spariva | metallo più scuro (0,42-0,68) fuori dalla banda e **filo scuro**: le pareti lontane dalla luce e l'ombra portata portano il metallo a 0,3 × argento. Contorno leggibile su tutte le carte anche a luce ferma. |
| Inchiostro (WebKit, O3) | densità variabile 0,93-1 con la fibra e formazione ±2% dentro il pieno: in WebKit una grana chiara | pieno **uniforme**: niente densità variabile, niente formazione; il film segue solo un quinto della luce del solco. Il bordo resta appena irregolare (soglia della fibra, già limitata a 0,3-0,7). |
| Urto (G2.4) | assente | `DatiBloccoFrame.urto?` (facoltativo, 0 se manca). Nello shader: alone di carta schiacciata **attorno** al solco (4 campioni a 6 px, spostati lontano dalla luce, spento dentro le lettere), fino a un terzo verso `ombra`, solo mentre l'urto è acceso. Margine delle maschere portato ad almeno 11 px perché l'alone non venga tagliato. |

Impacchettamento dell'urto senza nuovi uniform (restano 57 vec4):
`uBlockB.z = round(stringiMin × 100) + urto × 0,99`; lo shader legge
`floor(z) / 100` e `fract(z) / 0,99`. Lo scrive `scriviBlocco`, quindi per
`blocks.ts` cambia solo che può passare `urto`.

### Verifica

- Pipeline in `scratchpad/gltest` (la stessa di §11, con i parametri nuovi
  `scroll` e `urto`): blur, composite e rilievo **compilano e girano in
  WebGL2 e WebGL1**, 0 errori, 1 draw call, su Citrino, Cotone, Cipria e
  Grafite, con urto 0,5 e 1. Guardati gli zoom: solco netto con labbro di luce
  e ombra piena; lamina che passa da grigio metallo ad argento chiaro quando la
  banda la attraversa (scroll 200 → 330 → 450); alone dell'urto solo attorno.
- `tsc -p tsconfig.app.json` ed `eslint` sui file di `webgl/`: verdi.
- **Pagina vera**: `npx vite --port 8105 --strictPort` (chiuso alla fine),
  Chromium con `--use-angle=swiftshader --enable-unsafe-swiftshader
  --ignore-gpu-blocklist`, `?gl=1&carta=…`, font serviti in locale con
  `route` (dal browser headless il proxy dell'ambiente rifiuta i certificati
  di Google Fonts). `data-gl="on"` in tutti i casi. Guardati:
  - hero a 1440 e 375 su Citrino, a 1440 su Cotone e Grafite: *impronta* ora
    si legge come carta premuta a fondo, anche su Cotone (dove prima spariva)
    e su Grafite; a 375 le due righe "impron / ta" hanno rilievo pieno;
  - Per chi a 1440 su Citrino e Cotone: la partecipazione su Cipria ha i nomi
    a secco netti e la data in inchiostro; biglietto e copertina negli
    screenshot sono ancora vuoti (con SwiftShader la pressa sfalsata non
    arriva in tempo, come già scritto dal cross-browser-tester §5);
  - Tecniche a 1440: a secco su Citrino e Grafite, taglio su Cotone, lamina su
    Citrino. "Pordenone" in lamina ora è un metallo leggibile con il filo
    scuro, non più argento su giallo invisibile.
- Script: `scratchpad/pagina.mjs` (hero, Per chi, Tecniche per carta e
  larghezza) e `scratchpad/pagina-lamina.mjs`.

### Visto, non mio

- Sulla copertina Grafite di "Per chi" c'è una "L" chiara di 3-4 px sul lato
  destro e in basso, spostata dal pezzo. Non viene dallo shader (con luce da
  sinistra la costa GL sul lato destro è scura): sembra la costa CSS del pezzo
  rimasta accesa con `data-gl="on"` (section-builder-per-chi / art-director).

### Richieste

- **shader-engineer** (`blocks.ts`): passare `urto` a `scriviBlocco` quando il
  registro lo espone, e tenere il frame "sporco" finché l'urto è > 0. Al
  registro (scaffold) serve `urto` accanto a `pressione`
  (`registry.setUrto(id, v)`, scritto da `motion/usePressione`, che lo
  calcola già). Finché manca vale 0 e non cambia nulla.
- **art-director**: la luce del fallback CSS resta a 22° (scala
  dell'interazione). Per lo stesso carattere radente, le ombre del fallback
  possono allungarsi del 40% circa, cioè il rapporto tra tan(22°) e
  tan(15,4°).
