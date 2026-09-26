# WebGL artist · Concept 18 · SOTTOSCOCCA

Ondata 2. Modello, sottoscocca, ponte, officina, materiali, binario della
camera, ancore dei punti, fermi immagine. Seguiti `design-taste-frontend`
(niente effetto demo, niente post-processing, materiali piatti) e
`full-output-enforcement` (file completi, niente segnaposto).

Letti: `docs/ruoli-agent.md`, `creative-director.md` (tutto), `tech-architect.md`
(tutto, vincolante: three 0.160 puro, niente R3F, niente GLTFLoader),
`ux-architect.md` (zone dei punti §5, mappa punti §5.0, sottoscocca §5.4,
consegne §9), `trend-researcher.md` (P1, P2, R1, R7), `brand-strategist.md`
(ponti e targhette), e dell'ondata 2 già scritti: `styles/tokens.ts`,
`content/lavori.ts`, `motion/easing.ts`, `motion/choreography.ts`,
`interaction/evidenza.ts`.

---

## 0. In breve

- **Kenney Car Kit 3.1 `sedan.glb` (CC0)**, scaricato da kenney.nl il
  26/09/2026, convertito **offline** da `scripts/glb-a-bin.mjs` in un solo
  `auto.bin` da **21,3 KB (10,7 KB gz)** con intestazione JSON incorporata.
  Niente GLTFLoader, niente texture a runtime, nessuna dipendenza nello
  script (PNG letto con zlib di Node: `pngjs` non serve più).
- **Proporzioni**: scala 1,15 e **allungamento del solo tratto centrale**
  della scocca (+1,25 m tra i passaruota): passaruota, paraurti e ruote non si
  deformano. Risultato 4,18 × 1,73 × 1,50 m, passo 2,77, ruote r 0,345.
- **Colori Kenney scartati**: ogni triangolo è classificato dalla cella della
  colormap (carrozzeria, fascia, fondo, vetri, fanali; gomma, cerchio) e
  riceve un Lambert piatto della palette.
- **Sottoscocca procedurale che pende sotto il pianale** (il pianale Kenney è
  una piastra chiusa, verificato dal basso): coppa, filtro, scarico con
  catalizzatore e silenziatore, dischi e pinze, montanti con molla davanti,
  molle e ammortizzatori dietro, assale, traversa.
- **Ponte a due colonne procedurale** con carrelli, quattro bracci, quattro
  tamponi tondi e targhetta "PORTATA / 3500 kg" disegnata in Tektur.
- **30 draw call** a 0 e 180 cm, 26 a 80 cm; ~5.700 triangoli; 5 programmi.
- **Chunk WebGL stimato ~125-130 KB gz** (three tree-shaken + 9,3 KB gz di
  scena), sotto i 160.
- **Fermi immagine** delle 4 quote × 2 formati: 88 KB in tutto (poster
  `quota-0-l` 13 KB, `quota-0-p` 9 KB).
- Typecheck (strict, `noUncheckedIndexedAccess`, `@types/three` 0.160.0) e
  ESLint del pilota **verdi**; resa verificata in Chromium headless
  SwiftShader con screenshot guardati (§8).

---

## 1. File

| File | Cosa fa |
|---|---|
| `sorgenti/kenney/sedan.glb`, `colormap.png`, `License.txt` | originali Kenney, solo input dello script, mai nel bundle |
| `scripts/glb-a-bin.mjs` | GLB → `webgl/modelli/auto.bin` (`npm run modello`; `--controllo` stampa e non scrive). Deterministico: rilanciato dà un file identico |
| `scripts/fermi-immagine.mjs` | fermi immagine con Playwright + SwiftShader (`npm run fermi -- <url>`), WebP codificato da Chromium |
| `webgl/modelli/auto.bin` | il modello (formato nel commento di testa dello script) |
| `webgl/modelli/LICENSE-kenney.txt` | licenza CC0 di Kenney |
| `webgl/scena/index.ts` | **ingresso unico**: `costruisciScena()` + setter + riesporta il binario |
| `webgl/scena/auto.ts` | `caricaAuto` (fetch di `auto.bin?url`), `leggiAuto`, `costruisciAuto` (scocca + 4 ruote su perno) |
| `webgl/scena/pezzi.ts` | `layoutPezzi` (misure pure) + `costruisciPezzi` (mesh per pezzo, evidenza) |
| `webgl/scena/ponte.ts` | colonne, targhetta, carrelli, bracci, tamponi; `impostaQuota` |
| `webgl/scena/officina.ts` | pavimento, macchia di contatto, luci, nebbia, fondo |
| `webgl/scena/materiali.ts` | materiali dalla palette, evidenza, apertura della ruota |
| `webgl/scena/texture.ts` | canvas 2D: pavimento con linee a terra, ombra, targhetta |
| `webgl/scena/binario.ts` | 4 chiavi × {landscape, portrait} + LONTANO; `posaDaBinario`, `applicaPosa` |
| `webgl/scena/ancore.ts` | posizione 3D dei sei punti, per quota |
| `webgl/scena/geometria.ts` | `unisci` (merge senza BufferGeometryUtils), sbarre, cilindri, molla, tubo |
| `assets/fermi/quota-{0,20,80,180}-{l,p}.webp` + `index.ts` | fermi immagine, `FERMI[quota].l/.p`, `MISURE_FERMO`, `srcsetFermo` |

Nessun file accede a `window`/`document` a livello di modulo (texture e fetch
solo dentro funzioni). Nessun hex scritto: tutto da `PALETTE`/`SCENA`/`OPACITA`
di `styles/tokens.ts`. Import di three sempre per nome.

---

## 2. Il modello

**Verifiche sul GLB** (fatte, non stimate): 5 nodi (`body` + 4 ruote), una
primitiva ciascuno, un materiale `colormap` con texture **esterna**
`Textures/colormap.png` (512², griglia 8 × 4 celle da 64 px, gradienti).
Solo traslazioni nei nodi. Scala Kenney: ruote r 0,30, scocca 2,55 × 1,50.
Il pianale visto dal basso (render con colori di debug) è una **piastra
piatta e chiusa** a 0,15 m: nessun buco, ma anche niente dietro cui vedere.

**Classificazione per cella** (colonna, riga):

| Cella | Colore Kenney | Triangoli | Gruppo | Colore nostro |
|---|---|---|---|---|
| 6,1 | arancio | 134 | carrozzeria | verde macchina |
| 3,2 | grigio | 368 (−34 rivolti in basso) | fascia (fascia bassa, paraurti) | verde ombra |
| 3,2 con normale in giù, 2,2 | grigio / grigio scuro | 34 + 164 | fondo (pianale, passaruota) | verde ombra |
| 0,3 | azzurro chiaro | 10 | vetri | nero grasso schiarito al 30% verso zincato (`OPACITA.vetri`), opaco |
| 6,2, 1,3, 2,3 | bianco, giallo, rosso | 28 | fanali | zincato (niente rosso né giallo) |
| ruota 2,2 / 5,2 | | 214 / 118 | gomma / cerchio | nero grasso / zincato |

Celle non elencate → carrozzeria (così lo script regge anche
`hatchback-sports.glb`, dove la vernice è la cella 3,1).

**Perché il pianale non è nero** (deviazione da una lettura letterale del CD):
provato, una scocca nero grasso vista dal basso su fondo nero grasso
**sparisce**, restano pezzi verdi sospesi nel vuoto. La scala dei valori a 180
cm è: fondo nero < pianale verde ombra < pezzi verde macchina < metallo
zincato < evidenza bianca. La sagoma si legge, il pezzo toccato salta fuori.

**Ruote**: riportate al centro geometrico (in Kenney l'origine del nodo sta
sulla faccia esterna) e allargate di 10 cm per lato (carreggiata 1,18 m: nel
giocattolo erano rientrate sotto la scocca).

---

## 3. Sottoscocca e ponte

Tutto in coordinate auto: y = 0 a terra, z verso il muso, x verso il lato
sinistro (il lato della camera). Una mesh per pezzo evidenziabile, le quattro
ruote già unite:

| Mesh (nome = IdPezzo) | Cosa | Dove si vede |
|---|---|---|
| `olio` | coppa con bordo e tappo | 180 (davanti all'asse anteriore) |
| `filtro` | filtro olio a cartuccia | 180 |
| `scarico` | tubo continuo dal collettore + terminale | 180 |
| `catalizzatore`, `silenziatore` | cilindro, ovale trasversale dietro l'assale | 180 |
| `disco`, `pinza` | 4 dischi con mozzo, 4 pinze | 80 (dentro la ruota aperta), 180 (attraverso la ruota aperta) |
| `ammortizzatore`, `molla` | montanti McPherson davanti; ammortizzatori e molle dietro | 80 (davanti), 180 (dietro, anelli sull'assale) |
| `meccanica` (non evidenziabile) | assale dietro, traversa, bracci oscillanti, semiassi | zincato |

`content/lavori.ts` (`PUNTI[id].pezzi`) usa esattamente questi nomi. Gli
`IdPezzo` `freni` e `sospensioni` sono alias (disco+pinza, molla+ammortizzatore);
`ruota-anteriore` evidenzia le due gomme anteriori, `ruota-posteriore` le due
posteriori.

**La ruota che si apre**: CD 4.2 dice "opacità del cerchio al 35%". Con il
solo cerchio al 35% la gomma copre ancora montante e molla: si apre **tutta
la ruota anteriore sinistra** (gomma + cerchio, `OPACITA.cerchioAperto`),
curva liscia 1 → 0,35 tra 20 e 80 cm, e **resta aperta fino a 180**: da sotto
si vede la pinza bianca quando si tocca "Freni". Le altre tre ruote restano
piene. Materiali sempre `transparent` (il flag non cambia a runtime),
`depthWrite: false`, `forceSinglePass`, `renderOrder` 2.

**Ponte** (brand-strategist: ponte 1, due colonne, 3500 kg): colonne 2,85 m a
x = ±1,48, piastre a terra, cappello, centralina sulla colonna lontana;
carrelli zincati, bracci verdi dal carrello ai quattro punti di presa sotto i
sottoporta, tamponi di gomma tondi (nero grasso) con la vite. Targhetta
zincata con bordo e quattro rivetti sulla faccia della colonna sinistra
rivolta al muso, testo in `fontTarghetta()` dei token. Il gruppo mobile e
l'auto salgono insieme di `cm/100`.

**Officina**: pavimento `MeshBasic` (non illuminato: il nero della texture
coincide col fondo della scena e di `.ssc-root`, il bordo del piano non si
vede), solo faccia in su; linee a terra della postazione del ponte 1 e delle
due vicine, tacche di fermo; nebbia 11 → 27 m verso il nero; macchia di
contatto sotto l'auto che passa dal 100% al 25% tra 0 e 100 cm. Luci ferme:
principale dall'alto (2,3), emisfero bianco/zincato (1,15), luce di lavoro da
sotto (2,1) che rende leggibile il pianale. **Deviazione**: i tubi dei neon
non si disegnano. Provati: da sotto sembravano un contorno bianco dell'auto,
nella vista lontana due trattini sospesi nel nero. Restano come luce.

---

## 4. Binario della camera (`binario.ts`)

| Chiave | Landscape (rif. 16:9) | Portrait (rif. 390 × 844) |
|---|---|---|
| 0 cm | tre quarti anteriore sinistro ad altezza d'uomo, FOV 28, contenuto spostato a destra del 16% | tre quarti, FOV 48, auto nella metà alta (+20%) |
| 20 cm | quasi di fianco, più bassa: tutte e due le ruote sinistre libere dalla colonna | idem |
| 80 cm | la ruota anteriore sinistra negli occhi, FOV 28 | la ruota nella metà alta, FOV 46 |
| 180 cm | **sotto il pavimento** (y −6,9), sguardo in su, alto = +x: muso a sinistra | y −5,6, alto = +z: muso in alto |
| LONTANO (discesa) | lontana e alta, auto piccola e in alto | idem |

- Tra 80 e 180 la camera fa **un solo beccheggio**: l'alto passa da +y a +x
  (o +z) come succede alzando lo sguardo, niente rollio da drone.
- Ogni tratto tra due chiavi è addolcito con `smootherstep01` di
  `motion/easing.ts` (velocità nulla sulle chiavi: sul plateau la camera è
  ferma davvero). Si può passare un'altra curva.
- `applicaPosa`: sotto l'aspetto di riferimento il FOV verticale cresce per
  tenere il campo orizzontale (a 1024 × 768 l'auto non esce ai lati); lo
  spostamento è un `setViewOffset` (niente rotazione della camera).
- Verificato a 1440 × 900, 2560 × 1440, 1024 × 768, 768 × 1024, 390 × 844:
  tutti i punti dentro le zone di ux §5 (tabella in §8).

---

## 5. Ancore dei punti (`ancore.ts`)

Id di `content/lavori.ts` / tech-architect §6.4 (**non** quelli brevi di ux:
`ruota-anteriore`, non `ruota-ant`).

| Punto | A 20 / 80 cm | A 180 cm (dal basso) |
|---|---|---|
| `ruota-anteriore` | fianco della gomma anteriore sinistra, sopra il mozzo | battistrada dell'anteriore **destra** |
| `ruota-posteriore` | fianco della posteriore sinistra | battistrada della posteriore destra |
| `freni` | pinza anteriore sinistra | anteriore sinistra (aperta) |
| `sospensioni` | molla del montante anteriore sinistro | molla posteriore sinistra |
| `olio` | | fondo della coppa |
| `scarico` | | silenziatore |

A 180 i sei punti stanno su tre colonne e due righe, mai due sullo stesso
pezzo; distanza minima misurata 89 px a 390 × 844, 121 px a 1440 (regola: 56).

---

## 6. Istruzioni per lo shader-engineer

```ts
import { costruisciScena, posaDaBinario, applicaPosa, creaPosa } from './scena';
const s = await costruisciScena({ testiTarghetta: TESTI.scena.targhetta, signal });
// renderer: WebGLRenderer({ antialias: true }), outputColorSpace SRGB (default),
// nessun tone mapping, camera PerspectiveCamera(28, a, 0.1, 60).
// fontsReady(['600 48px Tektur']).then(() => { s.ridisegnaTarghetta(); runtime.markDirty(); });

// fase update (dopo ponte/quota.ts):
let sporco = s.impostaQuota(runtime.quota.valore);
sporco = s.impostaRuote(runtime.ruote) || sporco;
sporco = s.impostaEvidenza(runtime.evidenza) || sporco;
posaDaBinario(runtime.binario, runtime.discesa, runtime.viewport.orient, posa);
applicaPosa(camera, posa, runtime.viewport.orient, w, h);   // solo se binario/discesa/viewport cambiano
for (const id of puntiDellaQuota(store.quotaPlateau)) {
  s.ancoraMondo(id, quotaPlateau, v).project(camera);       // → runtime.punti[id] in px CSS
}
// render: renderer.render(s.scena, camera) solo se sporco o la camera è cambiata
// smontaggio: s.dispose(); renderer.dispose(); renderer.forceContextLoss();
```

- I setter restituiscono `true` solo se cambiano qualcosa (confronto a 1/512
  per colori e opacità): servono a `runtime.markDirty()`, render on demand.
- `costruisciScena` è a passi (`await` tra fetch, auto, pezzi, ponte): TBT.
  Accetta `signal` (AbortError) e `dati` già letti.
- La luce, la nebbia e il fondo stanno nella scena: il clear color del
  renderer non serve (lo fa `scene.background`, nero grasso esatto).
- **Modalità fermo** attesa da `scripts/fermi-immagine.mjs`: con
  `?fermo=<quota>` la pagina nasconde il DOM, mette quota e binario sul
  plateau (`binario` = 0, 1, 2, 3; `discesa` 0; evidenze 0; ruote 0), usa
  DPR = `devicePixelRatio`, fa un render e mette
  `data-ssc-fermo="pronto"` su un elemento (per esempio `.ssc-root`). Poi
  `npm run fermi` (dev server acceso, porta 9180) rigenera i WebP; confrontare
  `quota-0-*` con il primo frame (stessa camera: sì, se si usa `applicaPosa`).
- Punto fuori dalla zona: lo aggancio al bordo è di ux §5 (proiezione /
  section-builder-punti), non della scena.

---

## 7. Budget

| Voce | Misura | Budget |
|---|---|---|
| `auto.bin` | 21,3 KB, **10,7 KB gz** | ≤ 40 KB gz |
| codice `webgl/scena/*` (+ tokens, easing) minificato | 23 KB, **9,3 KB gz** | parte dei 160 |
| three tree-shaken + scena (esbuild, three incluso) | 131 KB gz (Rollup di Vite di solito un po' meno) | ≤ 160 KB gz |
| draw call | 30 (0 e 180 cm), 26 (80 cm) | ≤ 30, max 40 |
| triangoli | ~5.700 | |
| programmi shader | 5 (Lambert flat, Lambert flat trasparente, Basic, Basic trasparente, Basic con map) | |
| fermi immagine | 13,2 / 14,4 / 14,7 / 8,0 KB (l); 8,9 / 9,5 / 10,0 / 8,1 KB (p) | poster ≤ 80 / ≤ 45 KB |

---

## 8. Verifica fatta

Pagina di prova nello scratchpad (`ssc18-webgl/lab/`, Vite 5.4.21 del pilota
sulla porta **9182**, i miei file collegati con symlink, `three` 0.160.1):
costruisce la scena con `costruisciScena`, applica binario e quota da URL,
sovrappone le zone di ux §5 e i punti proiettati. Screenshot con Playwright
1.56 (Chromium `/opt/pw-browsers`, `--use-angle=swiftshader`), **guardati
tutti**. Zero errori in console e in pagina. Server spento alla fine.

| Vista | Esito |
|---|---|
| 0 cm, 1440 × 900 | auto di tre quarti sui bracci dentro la zona x 40-92%, colonne, targhetta leggibile, linee a terra che si perdono nella nebbia |
| 20 cm | ruote staccate da terra, ruota posteriore non coperta dalla colonna (prima versione lo era: camera spostata di fianco) |
| 80 cm | ruota aperta al 35%: disco, pinza, montante e molla leggibili; freni (925, 398) e sospensioni (856, 307) a 110 px |
| 180 cm, 1440 | pianta del pianale muso a sinistra; 6 punti dentro la zona, tutti su pezzi diversi |
| 180 cm, 390 × 844 | pianale in verticale muso in alto, punti tra y 157 e 608 (zona 84-658) |
| 180 cm, 1024 × 768 e 768 × 1024 | auto intera, punti dentro |
| 20 cm, 2560 × 1440, ruote a 1,2 rad | ruote girate sull'asse giusto |
| evidenza disco+pinza (80), olio+filtro (180), ruota-anteriore (180) | solo quei pezzi bianchi |
| transizioni b = 0,5 / 1,5 / 2,3 / 2,7 e discesa = 1 | nessun salto; nel tratto 20 → 80 il baricentro dell'auto a schermo si sposta più del 15% di trend P1 (la camera va dalla vista d'insieme alla ruota): vedi §10 |
| typecheck | `tsc` strict + `noUncheckedIndexedAccess` + `noUnused*`, `types: ["vite/client"]`: verde |
| lint | ESLint 9 con la config del pilota: verde |

**Cosa non è misurato**: i tempi GPU veri (SwiftShader non fa testo) e il
peso finale del chunk con il Rollup della build vera: li misura il
performance-auditor.

---

## 9. Richieste ad altri agent

- **copywriter**: aggiungere in `content/testi.ts` i testi della targhetta in
  scena, per esempio `scena: { targhetta: { sopra: 'PORTATA', sotto: '3500 kg' } }`
  (tipo `TestiTarghetta` di `webgl/scena/texture.ts`). Oggi la scena li riceve
  come parametro e non ha testi suoi.
- **scaffold-engineer**: `pngjs` **non** serve più (lo script decodifica il PNG
  con zlib), toglierlo dalle dev dipendenze del tech-architect §1.2. Script
  `"modello": "node scripts/glb-a-bin.mjs"` e
  `"fermi": "node scripts/fermi-immagine.mjs"` (Playwright: quello del
  progetto se installato, altrimenti quello globale in `/opt/node22`).
  `tsconfig.app.json` con `types: ["vite/client"]` (serve per `auto.bin?url`
  e i `.webp`). Il modello è **un solo file** `auto.bin` con l'intestazione
  JSON dentro: niente `auto.json` (il tech-architect ne prevedeva due; uno
  solo evita un secondo fetch e metadati disallineati).
- **shader-engineer**: §6 (uso, modalità fermo, render on demand).
- **motion-designer**: il binario addolcisce già ogni tratto tra due chiavi;
  se `binarioDaPercorso` è a sua volta addolcito, conviene che resti lineare
  dentro la salita (altrimenti la camera parte troppo piano). Le ruote girano
  su `rotation.x` positivo = marcia avanti.
- **section-builder-punti / proiezione**: a 20 cm su telefono l'etichetta di
  `ruota-posteriore` (x ≈ 77%) va messa a sinistra del cerchio.
- **art-director**: in `SCENA` manca un ruolo per il pianale e la fascia
  bassa; uso `verdeOmbra` direttamente (motivo in §2). Se lo si vuole nella
  mappa: `pianale: 'verdeOmbra'`.
- **creative-director / orchestratore**: tre deviazioni motivate e già
  provate a schermo: pianale verde ombra invece di nero (§2), ruota anteriore
  sinistra aperta tutta e fino a 180 cm (§3), neon non disegnati (§3).

---

## 10. Aperto

- Tratto 20 → 80: l'auto si sposta a schermo più del 15% (trend P1). È il
  passaggio dalla vista d'insieme alla ruota: il motion-designer può
  accorciare il tratto di scroll in cui avviene, o io posso avvicinare la
  chiave 20 alla ruota se la giuria lo segnala.
- Il piano B procedurale del CD (scocca da profilo estruso) non è servito: la
  sagoma Kenney ricolorata e allungata non sembra un giocattolo nei render.
