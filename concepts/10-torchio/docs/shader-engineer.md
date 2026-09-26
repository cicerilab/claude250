# Shader engineer · Concept 10 · IMPRONTA

Ondata 3, in parallelo ai section-builder. Integrazione della scena WebGL nel
layout: renderer, canvas, atlante, culling, render on demand, resize e DPR,
qualità adattiva, perdita di contesto, onda della carta, sincronia con lenis,
smontaggio.

Letti: `tech-architect.md` (§2, §6, §7, §8, §9), `scaffold-engineer.md` (API di
`core/`, `state/`, `relief/`), `webgl-artist.md` (§3, §4, §9, §10, §12),
`art-director.md` (spegnimento del fallback con `data-gl`), `motion-designer.md`
(§6, §7.5, §10), il codice di `webgl/` del webgl-artist, `core/*`,
`state/*`, `relief/*`, `interaction/paperWave.ts`, `interaction/light.ts`,
`styles/layout.css`, `styles/relief-fallback.css`. Seguite
`full-output-enforcement` (file completi, nessun segnaposto).

---

## 0. Esito

| Controllo | Esito |
|---|---|
| `npm run typecheck` | verde |
| `npm run lint` (`eslint src`) | verde (tutto `src/`) |
| `npm run build` | verde |
| **Chunk WebGL lazy** | `index-*.js` (webgl/ + shader) **22,3 KB gz** + `three-*.js` **112,8 KB gz** = **135,1 KB gz** (budget 160) |
| Draw call per frame | **1** nei frame normali (letto da `renderer.info`), 1 + 3 × cotture solo nei frame in cui si cuoce una maschera |
| Frame a pagina ferma | **0** render in 3 s (reduced motion, luce ferma) |
| Errori in console | **0** errori del codice in tutte le prove. Unico messaggio: `ERR_TOO_MANY_RETRIES` del proxy della sandbox su Google Fonts (ambiente, già in scaffold §11.1) |

Prove fatte con Playwright (Chromium di `/opt/pw-browsers`, `--use-angle=swiftshader
--enable-unsafe-swiftshader --ignore-gpu-blocklist`) sul mio dev server
`npx vite --port 8109 --strictPort`. Screenshot in `/tmp/claude-0/shots-shader/`:

| File | Cosa mostra |
|---|---|
| `smoke-1440.png` | primo avvio: hero con la parola *impronta* premuta dallo shader |
| `align-0.png`, `align-mid.png`, `align-1300.png`, `align-2700.png` | **allineamento DOM/GL**: i fantasmi resi rossi e bordati di blu (stile iniettato solo nel test) sopra il rilievo, a scroll 0, **a metà di un'animazione di lenis** (scrollY 692 → 700, `isScrolling: 'smooth'`), a 1300 e a 2700. Rilievo e glifi del DOM coincidono; i fogli di "Per chi" (carta disegnata dallo shader) coincidono con i riquadri del DOM anche ruotati |
| `resize-375.png` | stessa pagina ridimensionata da 1440 a 375: buffer 375×812, maschere ricotte alla nuova misura |
| `contesto-perso-375.png` | dopo `WEBGL_lose_context.loseContext()`: `data-gl="off"`, torna il rilievo CSS |
| `contesto-ripristinato-375.png` | dopo `restoreContext()`: maschere ricotte, `data-gl="on"` |
| `mobile-390-dpr3.png` | telefono DPR 3 (touch): DPR del canvas **1,749** (tetto 1,75), buffer 682×1477 |
| `gl0-1440.png` | `?gl=0`: nessun canvas, `data-gl="off"`, fallback CSS |
| `qualita-spento-1440.png` | SwiftShader senza forzatura: la qualità spegne il GL (`glMotivo: 'qualita'`), il canvas sparisce dopo la dissolvenza |

Numeri misurati (diagnostica `window.__improntaGL`, vedi §8):

| Prova | Risultato |
|---|---|
| Avvio a 1440×900 | `data-gl="on"` al primo frame con le maschere pronte; atlante 2048² HalfFloat |
| Scroll a 1300 / 2700 | 4 blocchi sullo schermo, 4 disegnati, 1 draw call |
| Resize 1440 → 375 | `css [375,812]`, `buffer [375,812]`, canvas 375×812 |
| Perdita e ripristino del contesto | `off` subito → `on` dopo le ricotture; `contestiPersi: 1` |
| Smontaggio (`dispose()` diretto) | abbonati del ticker 19 → 21 → **19**, contesto `isContextLost() === true`, stato `smontato` |
| Mobile DPR 3 | DPR 1,749, atlante a 8 bit (puntatore grossolano) |
| Qualità, SwiftShader non forzato | media ~44-48 ms al DPR minimo → `off` con motivo `qualita`, canvas rimosso |

---

## 1. File (tutti in `src/pages/concepts/impronta/webgl/`)

| File | Cosa fa |
|---|---|
| `index.ts` | `export { default } from './ImprontaCanvas'`: ingresso del chunk lazy (contratto di `core/glLoader.ts`) |
| `ImprontaCanvas.tsx` | componente senza prop: crea a mano il `<canvas class="imp-gl" aria-hidden="true">`, monta `ImprontaGL`, lo smonta; dopo uno spegnimento per qualità aspetta `GL.spegnimento` e non rende più niente |
| `ImprontaGL.ts` | la classe: renderer three, ciclo nel ticker (fasi `read` e `render`), cotture, onda, luce, resize, DPR, qualità, contesto, diagnostica, `dispose()` |
| `atlas.ts` | `Atlante`: render target 2048², allocatore a scaffali con 2 texel di gutter, appoggi RT A / RT B del blur, formato HalfFloat o 8 bit |
| `blocks.ts` | stato GL per blocco, culling (max 8), ordine di disegno, impacchettamento negli uniform, quando ridisegnare una maschera |
| `quality.ts` | DPR per canvas (tetti e pixel massimi), media mobile del tempo frame, decisione "abbassa" / "spegni" |

I file del webgl-artist (`materials.ts`, `maskPainter.ts`, `fiber.ts`,
`presets.ts`, `shaders/*`) sono usati così come sono: nessuna modifica.

---

## 2. Il ciclo del frame

Tutto dentro il ticker (unico rAF del concept). Due funzioni registrate:

**Fase `read` → `preparazione`**
1. `applicaViewport()`: solo se cambiano `runtime.viewport` (w, h, dpr) o la
   riduzione adattiva, legge `clientWidth/Height` del canvas, calcola il DPR
   (`dprPerCanvas`), `setPixelRatio` + `setSize(…, false)` (lo stile del canvas
   resta quello di `layout.css`). DPR effettivo = `larghezzaBuffer / larghezzaCss`,
   così i blocchi cadono sul pixel del DOM anche con DPR frazionari.
2. Dopo la comparsa, una sola volta: appena la radice ha davvero
   `data-gl="on"`, tutte le maschere si ridisegnano (vedi §4, "assi di arrivo").
3. Avvio dei disegni delle maschere (canvas 2D, leggono il layout del
   fantasma, quindi stanno qui): al massimo 2 per frame, in quest'ordine:
   blocchi a slot riservato (Banco), blocchi sullo schermo, blocchi entro una
   viewport (IntersectionObserver del registro).

**Fase `render` → `render`**
1. Cotture delle maschere pronte: 6 per frame prima della comparsa (canvas
   invisibile), **1 per frame** dopo (3 draw call in più, budget §8); prima
   gli slot riservati.
2. Culling (`selezionaBlocchi`): tra i visibili del registro, quelli che
   toccano davvero lo schermo (+48 px, + mezza diagonale se ruotati); se più
   di 8, per `spec.priorita` e poi per distanza dal centro.
3. Prima comparsa: si disegna solo quando TUTTI i blocchi selezionati hanno
   nello slot la loro versione corrente (o un disegno fallito); dopo 3 s si
   parte comunque.
4. **Render on demand**: si disegna solo se `runtime.dirty`, una cottura, un
   cambio di viewport, di `runtime.scrollY`, di azimut/elevazione della luce,
   di carta, o un'onda in corso. Altrimenti il frame è saltato (0 draw call)
   e la fn non chiede altri frame.
5. Uniform globali (`impostaVista`, `impostaLuce`, onda o carta attiva),
   ordine di disegno (pezzi con carta propria prima: stanno "sotto"),
   `impacchetta` → `scriviBlocco` per ogni blocco cotto, `impostaNumeroBlocchi`.
6. `renderer.render`: **1 draw call**. Poi `runtime.dirty = false`.
7. Attributo `data-imp-gl="fuori"` sui fantasmi sullo schermo che il GL non
   sta disegnando (§7, richiesta all'art-director).
8. Prima volta: `impostaGL('on')`.
9. Qualità (§5).

### Sincronia con lo scroll (niente scollamento DOM/GL)

Il ticker chiama `lenis.raf(now)` all'inizio del frame: lenis scrive lo scroll
del documento e `runtime.scrollY`; il registro porta i rettangoli dei blocchi
in coordinate viewport nella fase `read` **dello stesso frame**, senza leggere
il layout; qui si disegna nella fase `render` dello stesso frame. DOM e canvas
escono nello stesso fotogramma del compositore. Verificato a metà di
un'animazione di lenis (`align-mid.png`). La fibra dello shader è ancorata al
documento con `uView.w = runtime.scrollY`, quindi scorre con la pagina.

Con reduced motion non c'è lenis e lo scroll è nativo: il browser può scorrere
il DOM sul thread del compositore un frame prima del main thread. È il limite
di qualsiasi canvas su scroll nativo; con reduced motion il rilievo è fermo e
lo scarto non si nota.

---

## 3. Atlante (`atlas.ts`)

- `WebGLRenderTarget` 2048², senza depth né stencil, `LinearFilter`,
  `ClampToEdge`, niente mipmap.
- **Formato**: HalfFloat se il contesto lo sa renderizzare (WebGL2 con
  `EXT_color_buffer_float`) **e** il puntatore è fine (desktop, 32 MB);
  8 bit sui telefoni (16 MB, il budget di tech-architect §8). La richiesta del
  webgl-artist ("half float se supportato") è rispettata dove la memoria c'è.
  Differenza consapevole, vedi §9.
- **Scaffali**: uno scaffale è alto quanto il primo slot che lo apre
  (arrotondato a 8 texel). Nuovo slot: slot liberato più piccolo che basta →
  coda di uno scaffale alto al massimo 1,5× → scaffale nuovo sopra → niente.
  **2 texel di gutter** tra slot e tra scaffali (webgl-artist §3).
- **Coordinate**: quelle di `viewport.set`, y dal basso: `uBlockUv.y` (v0) è
  il bordo basso dello slot, come vuole `relief.frag.glsl`.
- **Slot riservati** (`spec.slot`, testo del Banco che cambia a ogni tasto):
  lo slot si alloca alla misura massima dichiarata
  (`(maxW + 2·pad) × scala`), così i tasti successivi ricuociono nello stesso
  posto; il canvas 2D del blocco è riusato.
- **Atlante pieno**: si liberano i blocchi non visibili dal meno usato di
  recente (LRU su `ultimoUso`); se non basta, **compattazione**: l'atlante si
  svuota, il blocco corrente prende il primo slot, gli altri visibili si
  ridisegnano nei frame dopo. Con i blocchi di oggi l'occupazione a 1440 è del
  7-15%.

**Cottura** (`ImprontaGL.cuoci`): `CanvasTexture` della maschera (`flipY`,
lineare, `NoColorSpace`) → blur orizzontale in RT A → blur verticale in RT B
→ composite con viewport e scissor sullo slot. RT A e RT B si riallocano solo
se cambia la misura. La texture della maschera si libera subito dopo.

---

## 4. Quando si ridisegna una maschera

Solo quando cambia qualcosa che la cambia (`serveDisegno` in `blocks.ts`):

| Evento | Come arriva |
|---|---|
| versione nuova (testo del cliente, testo del Banco, tecnica, layer, svg) | `block.versione` sale (registry `update`/`ridisegna`) |
| misura del blocco diversa da quella cotta (> 0,75 px) | `rectDoc` dal ResizeObserver del registro; si aspetta **150 ms** di misura stabile (durante un resize non si ricuoce a ogni passo; nel frattempo il rilievo resta alla misura cotta, ancorato in alto a sinistra, senza stirarsi) |
| font arrivati | `document.fonts` `loadingdone` → tutte da rifare (un font di ripiego con `size-adjust` non cambia la scatola ma cambia i glifi) |
| DPR del dispositivo che cambia la scala di cottura | `min(dprCanvas senza riduzione, 1.5)` diversa → tutte da rifare |
| **comparsa del GL (assi di arrivo)** | una volta, appena la radice ha `data-gl="on"` (vedi sotto) |
| ripristino del contesto | tutte (il contenuto dei render target è perso) |
| carta | **no**: la maschera non dipende dalla carta. Carta del foglio e carta dei pezzi sono uniform (`uCarteAttive`, `uBlockA.w`) |

Mai due disegni insieme per lo stesso blocco, e mai mentre una maschera
aspetta la cottura (il canvas riusato dei blocchi a slot riservato verrebbe
sovrascritto). Una versione il cui disegno fallisce non si riprova (e non
blocca la comparsa).

**Assi di arrivo.** Durante l'attesa (`data-gl="pending"`) il fantasma
dell'hero ha gli assi a metà pressa (`.imp-pressa` con `--imp-press`) e a
volte il font di ripiego; con `data-gl="on"` `relief-fallback.css` lo porta
agli assi di arrivo. La scatola del blocco non cambia (la dà il contenitore),
quindi il ResizeObserver non se ne accorge. Trovato con la prova di
allineamento: la prima maschera era quella stretta. Soluzione: una tornata di
ridisegni appena React ha scritto `data-gl="on"` sulla radice. Il canvas in
quel momento sta ancora entrando in dissolvenza (300 ms), e la ricottura
arriva in 1-2 frame.

---

## 5. DPR e qualità (`quality.ts`)

- **DPR** = min(devicePixelRatio, **1,75** con puntatore grossolano / **1,5**
  con puntatore fine, √(3,5 M / pixel CSS)) − riduzione adattiva, mai sotto 1
  (o sotto il DPR del dispositivo se è già minore).
- **Media mobile** su 30 campioni del `dt` del ticker, nei frame disegnati
  senza cotture. Il primo frame dopo un sonno del ticker (dt = 1/60 per
  contratto di `core/ticker.ts`) non conta e interrompe il conteggio dei 3 s.
  I frame saltati (per esempio l'arco della luce nell'hero a 30 fps) **non**
  interrompono: trovato in prova, prima la qualità non si spegneva mai
  nell'hero.
- Media > **20 ms** → DPR − 0,25 (poi la media riparte da zero).
- Al DPR minimo, media > **41,7 ms** (sotto 24 fps) per **3 s** di orologio
  → `impostaGL('off', 'qualita')`: il canvas svanisce in 300 ms lineari
  (`layout.css`), i fantasmi riprendono il rilievo CSS, poi il componente
  smonta tutto.
- **`?gl=1`**: il DPR scende lo stesso, ma il GL non si spegne mai per
  lentezza. Serve alle prove in headless (SwiftShader disegna un frame in
  centinaia di ms) e a chi vuole il GL comunque.

---

## 6. Comparsa, spegnimento, contesto, smontaggio

- **Comparsa**: il canvas nasce a opacità 0 (`layout.css`); il primo frame
  valido (tutte le maschere sullo schermo pronte, o 3 s) chiama
  `impostaGL('on')`: canvas a 1 in `--imp-dur-gl` (300 ms lineari) e fantasmi
  trasparenti nello stesso istante (motion-designer §7.5). La pressa dell'hero
  il GL la riprende dal registro (`block.pressione`) dallo stesso valore.
- **Perdita di contesto**: `preventDefault`, `impostaGL('off',
  'contesto-perso')` subito (torna il fallback CSS, e `paperWave` torna al velo
  DOM). Al `webglcontextrestored` three rifà da solo programmi e texture;
  l'atlante si azzera, tutte le maschere si ricuociono, e al primo frame valido
  `impostaGL('on')`. Il componente **non** smonta: aspetta.
- **Smontaggio** (`dispose()`, idempotente): toglie le due fn del ticker, gli
  abbonamenti a registry, store e `document.fonts`, i listener del contesto
  (prima di `forceContextLoss`, per non scrivere `off` nello store allo
  smontaggio), gli attributi `data-imp-gl` dai fantasmi; libera geometria, tre
  materiali, fibra, atlante e i due RT del blur, `renderLists`, `renderer.dispose()`,
  `renderer.forceContextLoss()`; il componente toglie il canvas e la
  diagnostica.
- **StrictMode / rimontaggi**: il canvas si crea a mano dentro l'effetto (un
  canvas il cui contesto è stato perso non ne dà uno nuovo). L'ospite è uno
  `<span style="display: contents">`, che non genera box: il canvas resta di
  fatto figlio di `.imp-root`. Al montaggio, se lo store non è `pending`, si
  rimette `pending`.

---

## 7. Onda, luce, carta

- **Onda**: se `store.cartaWave` c'è, `getPaperWave(now)` di
  `interaction/paperWave.ts` → `impostaOnda({ x, y, raggio, sfumatura: bordo }
  × dpr, da, a })`; la fn del render chiede frame finché l'onda dura. A onda
  finita `impostaOnda(null, carta)`. Stessa geometria del velo DOM
  (`statoOnda` del motion-designer). A GL acceso `paperWave` non crea il velo.
- **Luce**: `runtime.light.azimuth/elevation` a ogni frame in cui cambiano
  (li scrive `interaction/light.ts`, che segna anche `markDirty`).
- **Carta**: `store.get().carta` → `impostaCartaAttiva` quando cambia senza
  onda (per esempio "Ricomincia da capo"). Carta dei pezzi: `spec.carta`
  (parametri statici del blocco, ricalcolati se cambia).

---

## 8. Diagnostica e prove

In sviluppo, o con `?gl=1`, `window.__improntaGL` espone
`ImprontaGL.diagnostica`: `stato` (`avvio|attesa|acceso|perso|spento|smontato`),
`frameDisegnati`, `frameSaltati`, `drawCallUltimoFrame`,
`drawCallFrameNormale` (deve essere 1), `cotture`, `disegniMaschera`,
`compattazioni`, `blocchiDisegnati`, `blocchiSulloSchermo`, `dpr`, `buffer`,
`css`, `atlante { lato, halfFloat, slot, occupazione }`,
`qualita { media, riduzione }`, `contestiPersi`. Utile al performance-auditor.

**WebGL in headless.** Con gli argomenti `--use-angle=swiftshader
--enable-unsafe-swiftshader --ignore-gpu-blocklist` il `detectWebGL()` dello
scaffold oggi **accetta** SwiftShader (il GL parte anche senza forzature, poi
la qualità lo spegne per lentezza, come deve). Per prove stabili ho usato
comunque `?gl=1` più uno script di init di Playwright che toglie
`failIfMajorPerformanceCaveat` dalle chiamate a `getContext` (solo nel browser
di prova, nessun file del progetto toccato). Gli script sono nella scratchpad
della sessione
(`/tmp/claude-0/-home-user-claude250/72613ce9-a18f-5d71-bb71-d39c705d752e/scratchpad/shader/`:
`comune.mjs`, `smoke*.mjs`, `align.mjs`, `resto.mjs`, `qual.mjs`).

Per simulare la perdita di contesto dalla console:

```js
const lc = document.querySelector('canvas.imp-gl').getContext('webgl2').getExtension('WEBGL_lose_context');
lc.loseContext();     // data-gl → off
lc.restoreContext();  // ricotture, poi data-gl → on
```

---

## 9. Differenze consapevoli rispetto ai documenti

| Punto | Documento | Scelta | Perché |
|---|---|---|---|
| Atlante 4096² su desktop | tech-architect §7.4 | sempre 2048², con LRU e compattazione | 4096² costa 64-128 MB di GPU; con i blocchi di oggi 2048² è occupato al 7-15% |
| Half float | webgl-artist §3: "se renderizzabile" | solo su desktop (puntatore fine) | a 2048² sono 32 MB contro i 16 del budget §8; sui telefoni resta a 8 bit (provato dal webgl-artist) |
| Pre-cottura in idle dei blocchi lontani | — | no | i blocchi si disegnano quando entrano nella viewport di margine dell'IO (una viewport prima di essere sullo schermo): basta anche per il viaggio alle ancore |
| Rettangolo durante un cambio di misura | — | misura cotta, non quella del DOM, per 150 ms | il rilievo non si stira durante il resize |
| Ricottura alla comparsa | — | una tornata con `data-gl="on"` | vedi §4, "assi di arrivo" |

---

## 10. Richieste ad altri agent

- **art-director** (`styles/relief-fallback.css`): scrivo
  `data-imp-gl="fuori"` sui fantasmi **sullo schermo** che il GL non sta
  disegnando in quel frame (oltre gli 8 blocchi, o maschera non ancora cotta,
  o disegno fallito). Oggi con `data-gl="on"` quei fantasmi restano
  trasparenti. Serve una regola che li riporti al rilievo CSS, per esempio:
  `.imp-root[data-gl="on"] .imp-relief[data-imp-gl="fuori"]:is(.imp-secco,
  .imp-inchiostro, .imp-caldo) { color: revert-layer; -webkit-text-fill-color:
  revert-layer; text-shadow: …come in pending… }`, più gli equivalenti per
  `.imp-foglio`/`.imp-costa` e `.imp-segno-caldo`. Oppure riscrivere le regole
  dello spegnimento con `:not([data-imp-gl="fuori"])`.
- **section-builder** (tutti): evitare più di 8 blocchi a rilievo sullo
  schermo nello stesso momento; se capita, `priorita` più alta ai blocchi da
  tenere nel GL.
- **section-builder-per-chi**: il biglietto "Chiara Zanin" esce dal bordo
  destro del pezzo a 1440 (`align-1300.png`): è il layout del pezzo, non lo
  shader (lo shader lo disegna fin dove arriva la carta del pezzo).
- **performance-auditor**: tempi GPU veri su iPhone 12 e Pixel 6a (in
  SwiftShader un frame 1440×900 costa ~0,5-1 s e non significa nulla); usare
  `window.__improntaGL` con `?gl=1` sulla build di preview.
- **scaffold-engineer** (nota, nessuna modifica necessaria): nel test con gli
  argomenti SwiftShader indicati `detectWebGL()` dà `ok`, al contrario di
  quanto scritto in scaffold §11.2. Il comportamento resta corretto perché la
  qualità spegne il GL su una GPU software.

Osservazioni fuori dai miei file (nessuna blocca il build): CSS del concept
20,66 KB gz (budget 20) e chunk `Concept10` 62,3 KB gz (budget 60, sezioni in
costruzione): da ricontrollare quando i section-builder hanno finito.

---

## 11. Aperto

- Tempi reali su GPU mobile e prova su Safari/WebKit (cross-browser-tester):
  `EXT_color_buffer_float` e la resa a 8 bit.
- Smontaggio nel sito vero: provato chiamando `dispose()` direttamente (ticker
  e contesto tornano puliti); la navigazione tra pagine va provata al porting,
  come per lo scaffold.

---

## Giro 2

Richieste: giuria (`awwwards-jury.md` §5, riga shader-engineer: copertina
"Sul Noncello" vuota a 2560 col GL) e `performance-auditor.md` (P5 avvio in un
task lungo, P6 atlante 32 MB). Toccati solo `ImprontaGL.ts`, `blocks.ts`,
`atlas.ts` e questo documento. I file del webgl-artist non sono toccati.

### Esito

| Controllo | Esito |
|---|---|
| typecheck, lint (`eslint src`), build | verdi |
| Chunk WebGL | `index-*.js` 23,7 KB gz + three 112,8 KB gz = **136,6 KB gz** (budget 160) |
| Copertina a 2560×1440 (`?gl=1`) | **disegnata**: 4 blocchi sullo schermo, 4 disegnati, nessun `fuori`, entro ~1 s dall'arrivo sulla sezione (`giro2-perchi-2560.png`) |
| Copertina a 1440×900 | disegnata e premuta, allineata al DOM (`giro2-perchi-1440-premuto.png`) |
| Avvio del GL | spezzato in task separati, tracciati con `performance.mark('impronta-gl:…')` (vedi sotto) |
| Errori in console | 0 del codice (solo `ERR_TOO_MANY_RETRIES` dei font nella sandbox) |

Prove con Playwright (argomenti SwiftShader, `?gl=1`) su
`npx vite --port 8113 --strictPort`, chiuso alla fine. Nel browser di prova
il WebSocket dell'HMR di Vite è finto (script di init): altri agent modificano
file in parallelo e ogni aggiornamento rimontava il canvas a metà prova (è
quello che dava la diagnostica "vuota" nelle prime misure). Durante il giro
`interaction/light.ts` era a metà modifica (`ReferenceError:
arcoVietatoQui`, file altrui); nelle misure finali l'errore non c'è più.

### 1. Copertina vuota a 2560

**Causa.** Il limite degli 8 blocchi non c'entrava: a 2560 sulla sezione ci
sono 4 blocchi. Il problema era la portata delle cotture. Dopo un salto
nella pagina entrano 3-4 pezzi insieme, e le maschere si disegnavano e
cuocevano in ordine di registrazione, una cottura per frame. In più, alla
comparsa si ridisegnavano TUTTE le maschere (§4, "assi di arrivo"), e la
copertina aspettava in coda dietro all'hero ricotto. Nel frattempo il pezzo
restava fuori dal GL: DOM trasparente sopra la carta Grafite, cioè una
copertina nera e vuota. A 1440 lo stesso succedeva per meno tempo.

**Correzioni.**
- `blocks.ts`: `punteggio()` = `spec.priorita`, poi **area in vista** (px²
  del rettangolo dentro lo schermo), poi vicinanza al centro. Lo usano il
  culling oltre gli 8 blocchi e l'ordine di disegno e cottura: i pezzi grandi
  in vista passano per primi.
- `ImprontaGL.ts`: disegni e cotture in ordine di urgenza (slot riservato →
  sullo schermo per punteggio → entro una viewport).
- Cotture per frame a GL acceso: **2 quando un blocco sullo schermo aspetta
  la sua maschera**, 1 altrimenti (3 draw call in più, budget §8).
- Ricottura alla comparsa **solo per i fantasmi il cui stile è cambiato**:
  `firmaStile(el)` (famiglia, corpo, assi, peso, larghezza, spaziatura del
  blocco e dei suoi primi 12 discendenti), registrata a ogni disegno e
  confrontata quando la radice ha `data-gl="on"`. Di solito si ricuoce solo
  la parola dell'hero.
- Un blocco sullo schermo non disegnato (maschera in arrivo, oltre gli 8,
  disegno fallito) ha sempre `data-imp-gl="fuori"`, e **Per chi** e **Banco**
  lo usano già nel loro CSS per tornare al rilievo CSS: la copertina non è
  mai vuota, al massimo per qualche frame è in CSS. Resta aperta per
  l'art-director la regola generale in `relief-fallback.css` per gli altri
  fantasmi (richiesta del giro 1, §10).

### 2. P5 · avvio in un task lungo

Prima: compilazione e primo uso dei tre programmi nello stesso task. Adesso
`avvia()` fa, per ciascun programma (blur, composite, rilievo), due passi in
**task separati** (un `setTimeout(0)` tra l'uno e l'altro):
1. `renderer.compileAsync(scene, camera)`: con `KHR_parallel_shader_compile`
   il driver compila e collega in parallelo, three aspetta senza bloccare;
2. primo uso su un bersaglio di 1 texel (link, uniform, allocazione del
   render target). Per il composite il bersaglio è l'atlante, quindi anche
   l'allocazione dei suoi 16/32 MB ha un task suo.

Le cotture prima della comparsa scendono da 6 a **3 per frame**.

Siccome three controlla i programmi di `compileAsync` con un `setTimeout`,
uno smontaggio durante la compilazione non perde più il contesto subito
(altrimenti three interrogherebbe all'infinito): `dispose()` stacca tutto il
resto e libera il GPU quando la compilazione finisce (`liberaGpu()`).

Misura a 1440×900 in SwiftShader (segni `impronta-gl:*` e long task):

| Passo | Task |
|---|---|
| fibra (a pezzi) | 55 / 131 ms |
| primo uso blur | 895 ms |
| primo uso composite + allocazione atlante | 2182 ms |
| primo uso rilievo | 1036 ms |

SwiftShader non ha `KHR_parallel_shader_compile` e compila e alloca in
software, quindi tutto il costo finisce sul primo uso e i valori assoluti non
significano nulla. Conta la forma: tre task separati invece di uno, con il
main thread libero tra l'uno e l'altro. Su GPU vera con l'estensione (Chrome
desktop e Android recenti) la compilazione esce dal main thread. **Da misurare
su iPhone 12 / Pixel 6a** (performance-auditor), con i segni
`impronta-gl:avvio`, `fibra`, `compilato-*`, `primo-uso-*`, `primo-frame`.

### 3. P6 · atlante 32 MB su desktop

`tipoTexel()` in `atlas.ts`: HalfFloat solo se WebGL2 con
`EXT_color_buffer_float`, puntatore fine **e** `navigator.deviceMemory ≥ 8`.
Senza `deviceMemory` (Safari, Firefox) o sotto gli 8 GB si resta a 8 bit
(16 MB, nel budget §8). Quindi 32 MB solo su macchine che dichiarano 8 GB o
più. Il webgl-artist ha provato che a 8 bit la resa regge. Se il
tech-architect preferisce 16 MB sempre, basta alzare `MEMORIA_HALF_FLOAT_GB`
a un valore irraggiungibile.

### 4. Richieste

- **art-director**: la regola generale per `[data-imp-gl="fuori"]` in
  `relief-fallback.css` (giro 1, §10). Per chi e Banco l'hanno già nel loro
  CSS.
- **performance-auditor**: rimisurare P5 su device con i segni
  `impronta-gl:*`.
- **interaction-designer**: `light.ts` durante il giro lanciava
  `ReferenceError: arcoVietatoQui` a ogni frame (modifica in corso?).
  Controllare che la versione finale sia pulita.

---

## Giro 3

Richiesta: priorità 1 della giuria (`awwwards-jury.md`, "Giro 2"). Blocchi GL
fuori posto dopo cambi di layout o di font: indirizzo della bottega a 375
(sopra i link), marchio del colophon a 1440 (~30 px più in basso), Per chi a
1440 (~35 px), lamina pallida della prova a 2560; e `urto` per blocco
(webgl-artist, "Giro 2"). Toccati solo `ImprontaGL.ts`, `blocks.ts` e questo
documento. **Nessuna richiesta allo scaffold**: il registro espone già
`invalidate()`, e basta chiamarlo.

### Esito

| Controllo | Esito |
|---|---|
| typecheck, lint (`eslint src`), build | verdi |
| Chunk WebGL | `index-*.js` 24,6 KB gz + three 112,8 KB gz = **137,4 KB gz** (budget 160) |
| Allineamento, 375 / 1440 / 2560, **dopo aver scrollato dall'alto fino in fondo** | Per chi, bottega, colophon: scarto verticale tra rettangolo del registro e DOM **0 px** per ogni blocco in vista, tutti disegnati, nessuno `fuori`; rilievo sotto il DOM rosso negli screenshot |
| Errori in console | 0 |

Prove su `npx vite --port 8113 --strictPort` (chiuso alla fine), Chromium
con gli argomenti SwiftShader e `?gl=1`, **font veri serviti in locale** con
`route` (senza, il proxy della sandbox li blocca e i cambi di layout dovuti al
font non si vedono: è così che nel giro 1 il difetto mi era sfuggito), HMR
finto nel browser di prova. Screenshot in `/tmp/claude-0/shots-shader/`:
`giro3-{375,1440,2560}-{lavori,bottega,colophon}.png` e le versioni
`-rosso.png` (fantasmi in rosso sopra il rilievo),
`giro3-2560-banco-lamina.png`.

### 1. Causa vera dei blocchi fuori posto (due difetti)

**A · Rettangoli "doc" non rinfrescati quando cambia una sezione sopra.**
Misura con i font veri a 1440: subito dopo la comparsa, **tutti i blocchi da
Per chi in giù erano 47 px più in basso del DOM** (`rectDoc.y − y reale =
+47`). L'hero si ricompone quando Anybody arriva e si accorcia. Il registro
rimisura un blocco quando cambia la *sua* misura (ResizeObserver
dell'elemento), a resize della finestra e a `fonts.ready`/`loadingdone`. Non
lo fa quando si sposta perché una sezione *sopra* ha cambiato altezza dopo:
nessun evento lo dice. Da qui colophon e Per chi fuori posto a 1440, e la
bottega a 375.

Correzione (`ImprontaGL.osservaLayout`): un ResizeObserver su
`.imp-contenuto`, sui suoi figli e sulle sezioni di `<main>`. Qualsiasi cambio
di misura porta a `registry.invalidate()` nella fase `read` successiva, al
massimo ogni 100 ms, con l'ultima rimisura sempre garantita (il ticker resta
sveglio fino ad allora). Dopo la correzione lo scarto è 0 a 375, 1440 e 2560,
con 1 rimisura all'avvio (diagnostica `rimisureLayout`). Il costo è una
lettura di `getBoundingClientRect` per blocco, solo quando una sezione cambia
misura, mai durante lo scroll.

Richiesta facoltativa allo scaffold: lo stesso osservatore starebbe bene
anche in `relief/registry.ts` (vale per chiunque usi il registro). Oggi non
serve: nel concept il registro lo usa solo il GL.

**B · Maschera cotta con gli assi sbagliati (bottega a 2560, parola larga al
76%).** Il blocco si disegna una viewport prima di entrare in vista. Il
disegno (`disegnaMaschera`) aspetta i font, e nel frattempo il blocco entra in
vista ancora senza maschera, diventa `data-imp-gl="fuori"`, e
`relief-fallback.css` (`:not([data-imp-gl="fuori"])`) gli rimette gli assi
della pressa: a pressione 0 sono stretti. La maschera usciva stretta, ma la
firma di stile era stata presa **prima** del disegno (larga), quindi nessun
controllo la trovava diversa. Verificato: la stessa `disegnaMaschera` chiamata
a mano a blocco fermo dava l'inchiostro largo giusto (4-1267 px contro
0-1273 px del testo DOM), quella cotta no; col canvas nascosto il testo
stretto spariva.

Correzioni:
- la firma (`firmaStile`) si prende **dopo** il disegno, cioè dallo stato
  che la maschera ha visto davvero, e comprende anche la misura del testo
  composto (Range sul contenuto), così si vede anche il font vero che
  sostituisce il ripiego a stile calcolato invariato;
- la firma si ricontrolla (al massimo 4 blocchi per frame) quando un blocco
  entra in vista, quando cambia misura o layout, quando smette di essere
  `fuori` e quando la sua pressa si ferma. Se è diversa, la maschera si rifà
  **una volta**: da lì il blocco resta disegnato con gli assi di arrivo.

A 2560 la bottega converge con 2 ricotture in più (16 → 18) ed è allineata.

### 2. Lamina pallida della prova a 2560

Riprodotta con `aggiornaProva({ tecnica: 'lamina' })` a 2560
(`giro3-2560-banco-lamina.png`): a maschera cotta "Chiara Zanin" e "250 €"
sono metallo grigio spazzolato con il filo scuro, non un secco. Il pallido
visto dalla giuria è l'intervallo tra il cambio di tecnica (versione nuova del
blocco) e la cottura della maschera nuova: fino ad allora resta quella a
secco, con i parametri della lamina. In SwiftShader a 2560 dura secondi (un
frame ≈ 3-5 s), su GPU vera 1-2 frame. Con il giro 2 (2 cotture per frame
quando manca qualcosa in vista) il recupero è già il più rapido che il budget
permette. Resa del metallo: webgl-artist.

### 3. Urto per blocco

`motion/usePressione` scrive l'urto come variabile inline
`--imp-press-urto` sull'elemento premuto, che è lo stesso del blocco. A ogni
frame, per i soli blocchi selezionati (≤ 8), `ImprontaGL` legge
`el.style.getPropertyValue('--imp-press-urto')` (stile inline, nessun
layout), lo passa a `scriviBlocco` come `urto` (campo facoltativo del
webgl-artist, impacchettato in `uBlockB.z`), e segna il frame da ridisegnare
quando cambia. Non serve `registry.setUrto`: la richiesta allo scaffold del
webgl-artist si può chiudere così.

### 4. Richieste

- **art-director**: con la regola `:not([data-imp-gl="fuori"])` gli assi del
  fantasma cambiano quando il GL lo prende in carico. Adesso il GL lo gestisce
  (ricottura una tantum), ma costa una cottura in più per blocco alla prima
  comparsa. Alternativa più economica, se va bene al disegno: tenere gli assi
  di arrivo anche con `fuori` sui blocchi `.imp-pressa` la cui pressa è già
  finita (`[data-imp-pressa="premuta"]`).
- **scaffold-engineer** (facoltativa): ResizeObserver delle sezioni nel
  registro, vedi 1.A.
- **performance-auditor / cross-browser-tester**: le prove con il GL vanno
  fatte con i font veri (in locale), altrimenti i cambi di layout dovuti al
  font non si vedono.
