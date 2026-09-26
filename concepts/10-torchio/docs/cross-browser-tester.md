# Cross-browser tester · Concept 10 · IMPRONTA

Ondata 4 (QA). Build di produzione (`npm run build`) servita con
`npx vite preview --port 8204 --strictPort` (chiusa alla fine), provata con
Playwright 1.56.1 da script Node (skill playwright-cli: stesse primitive,
guidate da script per poter ripetere le prove su tre motori). Nessun file
sorgente toccato.

## 0. In breve

- **Tre motori provati**: Chromium 141 (headless shell 1194, da
  `/opt/pw-browsers`), **Firefox 142** e **WebKit 26** (scaricati da
  cdn.playwright.dev al primo tentativo in `/tmp/claude-0/pw-extra` con
  `PLAYWRIGHT_BROWSERS_PATH`; librerie di sistema installate con
  `npx playwright install-deps firefox webkit`, eseguito come root).
- **Zero errori in console, zero `pageerror`, zero richieste fallite** in
  tutte le 7 configurazioni, a 1440 e a 375.
- **12 prove funzionali su 12 verdi** in ogni configurazione (tabella §2).
  Nella prima tornata c'erano due rossi: uno è un **bug vero di Firefox** (il
  filo della Legatoria non si cuce, §3 B1), l'altro era un artefatto
  dell'ambiente che però mostra un **difetto di logica della leva** (§3 B2).
- **Fallback senza WebGL**: provato in tre modi (`?gl=0`, Chromium con
  `--disable-webgl --disable-3d-apis`, e **Firefox headless, che WebGL non ce
  l'ha proprio**). Ogni volta `data-gl="off"`, nessun canvas, rilievo CSS
  completo, pagina intera e bella, nessun errore.
- **WebGL acceso**: WebKit (contesto WebGL2 con `failIfMajorPerformanceCaveat`,
  GL acceso senza forzature) e Chromium con SwiftShader (`?gl=1`). 1 draw call
  per frame, perdita di contesto → `off`, ripristino → `on`, in entrambi.
- **`ctx.fontStretch` assente in WebKit 26** (la nota del webgl-artist diceva
  "c'è da Safari 17": in questa build WebKit non c'è). La correzione
  orizzontale funziona: la parola dell'hero col GL ha lo stesso ingombro del
  DOM (1178 px su 1181 della gabbia), i glifi sono appena diversi (§4).

## 1. Ambiente e configurazioni

| Sigla | Motore | Come | `data-gl` 1440 / 375 |
|---|---|---|---|
| **CR** | Chromium 141 headless | nessun argomento | `off` / `off` (WebGL c'è, ma `failIfMajorPerformanceCaveat` lo rifiuta) |
| **CR-0** | Chromium 141 | `?gl=0` | `off` / `off` |
| **CR-noGL** | Chromium 141 | `--disable-webgl --disable-3d-apis` (niente WebGL1 né WebGL2) | `off` / `off` |
| **CR-GL** | Chromium 141 + SwiftShader | `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, `?gl=1`, init script che toglie `failIfMajorPerformanceCaveat` (come shader-engineer §8) | `on` / `on` |
| **FF** | Firefox 142 headless | nessun argomento: `AllowWebgl2:false`, "Exhausted GL driver options", **WebGL assente davvero** | `off` / `off` |
| **WK** | WebKit 26 (UA Safari 26) | nessun argomento: WebGL2 ok anche con il caveat | `on` / `on` |
| **WK-0** | WebKit 26 | `?gl=0` | `off` / `off` |

Font Google: il browser di prova non passa dal proxy, quindi le richieste a
`fonts.googleapis.com`/`fonts.gstatic.com` sono intercettate con `route` e
servite da Node (curl, cache su disco, CSS per user-agent). Anybody variabile
(wdth 50-150) e Hanken Grotesk risultano caricati in tutti e tre i motori.

Mobile a 375: `isMobile` + `hasTouch` in Chromium e WebKit (Firefox non
supporta `isMobile`: viewport 375 senza touch).

Script (nella scratchpad della sessione,
`/tmp/claude-0/-home-user-claude250/72613ce9-a18f-5d71-bb71-d39c705d752e/scratchpad/xb/`):
`comune.mjs` (avvio, font, stato GL), `smoke.mjs` (API e caricamento),
`test.mjs <motore> <auto|gl0|nogl> shots` (tutte le prove di §2),
`gl.mjs` (GL acceso, diagnostica, contesto perso), `filo.mjs`, `parola.mjs`,
`dbg2.mjs` (leva), `prezzo.mjs`, `zoom*.mjs`.

## 2. Matrice browser × funzione

✅ = verde, ⚠️ = funziona con riserva (vedi nota), ❌ = rotto. Tutte le prove
leggono il DOM, non solo lo screenshot.

| Funzione | CR | CR-0 | CR-noGL | CR-GL | FF | WK | WK-0 |
|---|---|---|---|---|---|---|---|
| Caricamento senza errori (console, pageerror, rete) | ✅ | ✅ | ✅ | ✅ | ✅ ¹ | ✅ ² | ✅ |
| Scroll hero → colophon, niente scroll orizzontale (1440, 375) | ✅ | ✅ | ✅ | — ⁶ | ✅ | ✅ | ✅ |
| Pin Tecniche: palco `sticky`, `top` 0 in 4 punti del pin, altezza = 100svh (900 / 812) | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| Filo Legatoria che si cuce con lo scroll (1440, 375) | ✅ | ✅ | ✅ | — | ❌ **B1** | ✅ | ✅ |
| Cambio carta con l'onda (radio in `#carta`, `data-carta` cambia, salvata) | ✅ velo DOM | ✅ velo DOM | ✅ velo DOM | ✅ onda GL | ✅ velo DOM | ✅ onda GL | ✅ velo DOM |
| Banco: scrivo, leva tenuta col **mouse** → "Ricevuto…" | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| Banco: leva tenuta con **Spazio** → "Ricevuto…" | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| Banco: `?invio=ko` → "Non siamo riusciti…", fuoco sull'esito | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| Leva: rilascio subito dopo i 900 ms con frame lenti | ⚠️ **B2** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Dialog indice a 375: `showModal`, `:modal`, fuoco su "chiudi", Esc chiude e ridà il fuoco, voce → `#banco` a 24 px | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| Rilievo CSS (`text-shadow` secco/inchiostro, lamina `background-clip:text` + `drop-shadow`) | ✅ | ✅ | ✅ | spento ³ | ✅ | spento ³ | ✅ |
| Parola dell'hero a fine pressa: 1178 px su gabbia 1181 (1440), 334 su 335 (375) | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| WebGL acceso, 1 draw call, perdita di contesto → `off` → `on` | n/a | n/a | n/a | ✅ | n/a | ✅ | n/a |
| Allineamento GL ↔ DOM senza `ctx.fontStretch` | n/a | n/a | n/a | n/a | n/a | ✅ ⁴ | n/a |
| Frame in 2 s (hero / tecniche / carta / legatoria / banco) ⁵ | 38/92/121/122/122 | 40/105/122/122/122 | 33/92/119/122/122 | 3/3/3/2/4 | 86/121/122/122/122 | 25/5/75/123/124 | 7/7/9/123/124 |

Note:
1. Firefox scrive due `JavaScript Warning` (non errori) quando
   `detectWebGL()` prova a creare il contesto: "Failed to create WebGL context".
   Sono del browser, attesi, e la pagina li gestisce.
2. WebKit scrive un avviso di preload: "`index-CB-HfJOE.js` was preloaded
   using link preload but not used within a few seconds". È l'entry di Vite
   che il loader dei chunk dinamici ri-precarica; innocuo (O4).
3. Con il GL acceso il rilievo CSS è spento per costruzione
   (`relief-fallback.css`: colore trasparente sui fantasmi); il rilievo lo
   disegna lo shader. Verificato che `.imp-hero__parola` abbia
   `color: rgba(0,0,0,0)`.
4. Vedi §4.
5. Headless senza GPU: i numeri servono solo a confrontare i motori tra loro
   nello stesso ambiente, non sono prestazioni reali. **CR-GL** a 1-2 fps è
   un artefatto: con gli argomenti SwiftShader anche il compositing di
   Chromium passa da SwiftShader (vedi §5). Per questo le prove funzionali di
   CR-GL sono limitate al GL (—).
6. "—": non ripetuto in CR-GL, dove un frame costa 0,5-1 s e ogni prova
   temporizzata misura l'ambiente, non la pagina.

### API usate e fallback

| API | Chromium 141 | Firefox 142 | WebKit 26 | Uso nel concept e fallback |
|---|---|---|---|---|
| `useSyncExternalStore` (React 18) | ✅ | ✅ | ✅ | store: nessun problema |
| `IntersectionObserver` / `ResizeObserver` | ✅ | ✅ | ✅ | pressa, blocchi GL, misure |
| CSS `linear()` | ✅ | ✅ | ✅ | `motion/easing.ts` ha le curve anche in `cubic-bezier` |
| `svh` / `dvh` | ✅ | ✅ | ✅ | pin Tecniche (400svh / 350svh, palco 100svh): misurato |
| `:has()` | ✅ | ✅ | ✅ | 21 regole senza `@supports` (stato "scelta" delle opzioni del banco, anelli di fuoco): O5 |
| container queries (`cqi`) | ✅ | ✅ | ✅ | corpo della parola dell'hero, con `@supports (inline-size: 1cqi)` e fallback in `font-size` |
| `color-mix()` anche con `calc()` | ✅ | ✅ | ✅ | secco che segue la pressione, sotto `@supports` |
| `background-clip: text` | ✅ | ✅ | ✅ | lamina, con `@supports not` di ripiego |
| unità `lh` | ✅ | ✅ | ✅ | sfumatura della lamina per riga |
| `<dialog>` `showModal` / `inert` | ✅ | ✅ | ✅ | indice |
| `requestIdleCallback` | ✅ | ✅ | ❌ | `core/glLoader.ts` ripiega su `setTimeout`: provato, GL acceso in WebKit |
| `ctx.fontStretch` (canvas 2D) | ✅ | ✅ | ❌ | `webgl/maskPainter.ts`: correzione orizzontale per carattere, §4 |
| `text-wrap: pretty` | ✅ | ❌ | ✅ | solo a capo più belli; in Firefox a capo normali (visibile negli screenshot delle Tecniche) |
| `animation-timeline`, View Transitions | ✅ | ❌ | ✅ | non usati dal concept |

## 3. Bug

### B1 · Firefox: il filo della Legatoria non si cuce, compare intero di colpo

- **Gravità**: media (l'effetto firma della sezione è degradato su Firefox,
  nessun contenuto perso, nessun errore).
- **Proprietario**: section-builder-legatoria (`sections/Legatoria/legatoria.css`).
- **Passi**: Firefox, `/concept-10?gl=0` (o senza parametri), scorrere a
  `#legatoria`, fermarsi a metà del primo schema.
- **Atteso**: il cucito dello schema si disegna man mano (`stroke-dashoffset`
  da 1 a 0, come Chromium `calc(0.1052px)` → `0%` e WebKit `0.648px` → `0px`).
- **Visto**: in Firefox `stroke-dashoffset` calcolato è sempre `0px`, prima e
  dopo; lo schema resta invisibile finché `opacity: calc(var(--filo-l) * 400)`
  non supera 0, poi appare **tutto cucito** in un colpo.
  Screenshot: `firefox-filo-10-1440.png`, `-18-`, `-30-` contro
  `chromium-filo-*.png` e `webkit-filo-*.png`.
- **Causa**: Firefox non accetta un `calc()` senza unità in
  `stroke-dashoffset` (`CSS.supports('stroke-dashoffset','calc(1 - 0.5)')` è
  `false` in Firefox, `true` negli altri due). La dichiarazione diventa
  invalida al calcolo e torna a 0.
- **Righe**: `legatoria.css:192` e `:297` (`calc(1 - var(--filo-l))`),
  `:200` (graffe del punto metallico, `calc(1 - var(--imp-filo-aggancio, 1))`).
- **Correzione proposta**: dare l'unità dentro il calcolo, che negli altri due
  motori dà lo stesso valore di oggi (Chromium già calcola `calc(1px)`):
  `stroke-dashoffset: calc((1 - var(--filo-l)) * 1px);` e
  `stroke-dashoffset: calc((1 - var(--imp-filo-aggancio, 1)) * 1px);`.
  Anche il commento d'esempio in `motion/useScrollProgress.ts:534`
  (motion-designer) ripete la forma senza unità.

### B2 · Leva: un rilascio dopo i 900 ms può valere "Hai lasciato presto"

- **Gravità**: bassa (con frame a 16 ms la finestra è di un frame; diventa
  visibile solo con frame lunghi: telefoni lenti, scheda sotto carico).
- **Proprietario**: interaction-designer (`interaction/useHoldToConfirm.ts`).
- **Passi**: in un ambiente con frame lenti (qui: Chromium con gli argomenti
  SwiftShader, `?gl=0&invio=ko`, frame da 0,4-1 s), compilare il banco,
  tenere premuta la leva col mouse **1,4 s** e rilasciare.
- **Visto**: 2 volte su 5 compare "Hai lasciato presto: tieni premuto…" anche
  se la pressione è durata 1,4 s contro i 900 ms richiesti (traccia:
  `pointerdown` 347 ms, `pointerup` 1755 ms, nessun completamento).
- **Causa**: il completamento avviene solo dentro il tick del ticker
  (`aggiorna`: `p >= 1` → `completa('tenuta')`); `termina()` al rilascio non
  ricalcola il tempo trascorso, quindi se il tick che avrebbe completato non
  è ancora arrivato, il rilascio annulla.
- **Correzione proposta**: in `termina()`, prima di annullare, calcolare
  `(ora - g.t0) / durataDi(opz.current)` e, se è `>= 1`, chiamare
  `completa('tenuta')`.

### Osservazioni (non bug, o da confermare fuori da headless)

- **O1 · rilievo CSS pesante in WebKit** (art-director, `styles/relief-fallback.css`;
  da misurare dal performance-auditor su Safari vero). Nello stesso ambiente
  software WebKit con `?gl=0` fa 7-9 frame in 2 s su hero, Tecniche e Carta,
  contro 40-122 di Chromium e 86-122 di Firefox; su Legatoria e Banco torna a
  123. Indiziati: i quattro `text-shadow` con `color-mix()` e i
  `drop-shadow` della lamina animati dalla pressa. Headless Linux non è
  Safari su Mac/iPhone: serve la prova su dispositivo.
- **O2 · `ctx.fontStretch` assente in WebKit 26** (webgl-artist,
  `webgl/maskPainter.ts`): vedi §4. Nessuna azione richiesta; aggiornare la
  nota del webgl-artist §13 ("c'è da Safari 17" non vale per questa build).
- **O3 · grana dell'inchiostro col GL in WebKit** (webgl-artist,
  `shaders/relief.frag.glsl`): "Pordenone" a un colore nelle Tecniche mostra
  una grana chiara nel pieno dell'inchiostro più visibile dei ±2% del doc
  (`webkitgl1-zoom-inchiostro.png` contro `webkitgl0-zoom-inchiostro.png`).
  Può essere la resa software di questo WebKit: da guardare su Safari vero.
- **O4 · avviso di preload in WebKit** (scaffold-engineer, `vite.config.ts`):
  il loader dei chunk dinamici ri-precarica l'entry `index-*.js` già
  eseguita. Innocuo, nessun byte in più (cache).
- **O5 · `:has()` senza fallback** (interaction-designer `interaction.css`,
  section-builder-banco `banco.css`): lo stato "scelta" delle opzioni del
  banco sparisce nei browser senza `:has()` (Firefox < 121, Safari < 15.4).
  Resta l'etichetta testuale "scelta" sotto l'opzione, quindi il dato non
  si perde. Bassa.
- **O6 · lamina a pressione 0: CSS e GL diversi** (art-director,
  `relief-fallback.css`). Il prezzo "170 €" sulla prova del banco aspetta la
  linea d'ingresso (`margine: 0 0 -25% 0`): con il GL è invisibile finché non
  la passa, con il rilievo CSS è già visibile in argento (la lamina CSS non
  sfuma con `--imp-press`, il secco sì). Voluto o no, i due rendering non
  coincidono prima della pressa (`webkit-gl1-banco-dopo-scrittura-1440.png`).

## 4. WebKit senza `ctx.fontStretch`

- `'fontStretch' in CanvasRenderingContext2D` è `false` in WebKit 26
  (`true` in Chromium 141 e Firefox 142). Misura: `IMPRONTA` a 100 px in
  Anybody 800 nel canvas = 554 px (larghezza 100), nel DOM con
  `font-stretch: 150%` = 832 px.
- `maskPainter` corregge per carattere: la parola dell'hero col GL
  (`webkitgl1-hero-fine-1440.png`) e col CSS (`webkitgl0-hero-fine-1440.png`)
  hanno lo stesso ingombro, da x≈86 a x≈1264, e le lettere cadono negli
  stessi punti. Col GL le aste sono appena più sottili e le curve un poco
  più "stirate", come previsto dal webgl-artist. Nelle righe della prova del
  banco ("Marta e Luca") il testo GL è leggibile e non si accavalla
  (`webkitgl1-zoom-prova.png`).
- Gravità: bassa. Nessuna correzione necessaria.

## 5. Nota per gli altri QA: SwiftShader rallenta tutto Chromium

Con `--use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist` il GL del concept parte, ma **anche il compositing
della pagina** passa da SwiftShader: 2-4 frame in 2 s in ogni sezione, anche
con `?gl=0`. Le animazioni allora restano a metà negli screenshot (la parola
dell'hero a 684 px invece di 1178) e le prove temporizzate falliscono per
colpa dell'ambiente (il filo "fermo" e la leva "presto" della prima tornata).
Per le prove DOM usare Chromium **senza** quegli argomenti (60 fps nelle
sezioni leggere); tenerli solo per le prove del GL. Senza argomenti questo
Chromium headless ha WebGL ma lo rifiuta con `failIfMajorPerformanceCaveat`:
`data-gl="off"`.

## 6. Screenshot

In `qa/cross-browser/` (116 file). Nomi: `<motore>-<config>-<vista>-<larghezza>.png`,
con config `auto`, `gl0`, `nogl`, `gl1`.

Confronto richiesto (hero / tecniche / banco, a 1440 e a 375, per motore):

| | Chromium | Chromium senza WebGL | Firefox (senza WebGL) | WebKit GL | WebKit `?gl=0` |
|---|---|---|---|---|---|
| hero | `chromium-auto-hero-{1440,375}` | `chromium-nogl-hero-*` | `firefox-auto-hero-*` | `webkit-auto-hero-*`, `webkit-gl1-hero-*` | `webkit-gl0-hero-*` |
| tecniche | `chromium-auto-tecniche-*` | `chromium-nogl-tecniche-*` | `firefox-auto-tecniche-*` | `webkit-auto-tecniche-*`, `webkit-gl1-tecniche-*` | `webkit-gl0-tecniche-*` |
| banco | `chromium-auto-banco-*` | `chromium-nogl-banco-*` | `firefox-auto-banco-*` | `webkit-auto-banco-*` | `webkit-gl0-banco-*` |

Anche: `*-colophon-*`, `*-legatoria-1440`, `*-onda-1440` (onda a metà),
`*-indice-375`, `*-banco-{mouse,tastiera,mouse-ko}-1440` (esiti del banco),
`*-hero-fine-*` (parola a fine pressa), `*-filo-{10,18,30}-1440` (B1),
`*-zoom-*` (O3, §4), `chromium-gl1-*` (GL SwiftShader, a metà animazione:
vedi §5). Gli screenshot `*-hero-*` presi 1,2 s dopo il caricamento mostrano
la pressa ancora in corso nei motori più lenti: per il confronto della
parola usare `*-hero-fine-*`.

## 7. Richieste ad altri agent

- **section-builder-legatoria**: B1, `legatoria.css` righe 192, 200, 297.
- **interaction-designer**: B2, `useHoldToConfirm.ts`, `termina()`; O5 in
  `interaction.css` se si vuole un ripiego senza `:has()`.
- **motion-designer**: il commento d'esempio di `useFilo`
  (`useScrollProgress.ts:534`) con l'unità, come in B1.
- **webgl-artist**: aggiornare la nota su `ctx.fontStretch` (O2); guardare
  O3 su Safari vero.
- **art-director**: O1 (peso del rilievo CSS in WebKit), O6.
- **performance-auditor**: O1 su Safari/iPhone; usare Chromium senza
  argomenti SwiftShader per le misure DOM (§5).

---

## Giro 3

Build nuova (`npm run build`, commit fino a `3df16f3`), preview su 8204
(chiusa alla fine), stessi motori: Chromium 141 headless, Firefox 142 e
WebKit 26 da `/tmp/claude-0/pw-extra`. Screenshot in `qa/cross-browser-g3/`
(78 file, stessi nomi del giro 1). Script in
`…/scratchpad/g3/` (`test.mjs` con la prova dei 450 ms in più, `onda.mjs`,
`ro.mjs`, `ro2.mjs`). Leva tenuta 1,3 s (non più 2,6 s).

### Matrice

| Funzione | CR | CR-noGL | FF (senza WebGL) | WK (GL) | WK `?gl=0` |
|---|---|---|---|---|---|
| Console senza errori (1440, 375) | ✅ | ✅ | ✅ | ❌ **B3** | ❌ **B3** |
| Scroll hero → colophon, niente scroll orizzontale | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pin Tecniche (`sticky`, top 0 in 4 punti, 100svh) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filo Legatoria che si cuce (1440, 375) | ✅ | ✅ | ✅ **B1 chiuso** | ✅ | ✅ |
| Onda carta, un cambio | ✅ velo | ✅ velo | ✅ velo | ✅ | ✅ velo |
| Onda carta, limite 450 ms (3 clic a 100 ms e a 300 ms) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Banco: leva col mouse → "Ricevuto…" | ✅ | ✅ | ✅ | ✅ ¹ | ✅ ¹ |
| Banco: leva con Spazio → "Ricevuto…" | ✅ | ✅ | ✅ | ✅ ¹ | ✅ ¹ |
| Banco: `?invio=ko` → "Non siamo riusciti…", fuoco sull'esito | ✅ | ✅ | ✅ | ✅ ¹ | ✅ ¹ |
| Leva con frame lenti (SwiftShader, tenuta 1,4 s, 5 prove) | ✅ 5/5 **B2 chiuso** | — | — | — | — |
| Dialog indice a 375 (`:modal`, fuoco, Esc, voce → `#banco` a 24 px) | ✅ | ✅ | ✅ | ✅ ¹ | ✅ ¹ |
| Rilievo CSS senza GL | ✅ | ✅ | ✅ | spento (GL) | ✅ |
| WebGL: acceso, 1 draw call, contesto perso `off` → ripristinato `on` | n/a | n/a (off) | n/a (off) | ✅ | n/a |
| Frame in 2 s (hero / tecniche / carta / legatoria / banco) | 87/123/114/121/111 | 121/122/122/122/122 | 97/122/122/122/122 | 46/78/70/123/117 | 7/56/88/120/101 |

1. La funzione va; la prova risulta rossa nello script solo per il
   `pageerror` di B3 che compare a ogni caricamento.

Note sui numeri:
- **Limite 450 ms**: con clic ogni 100 ms (Cotone, Cipria, Grafite) partono
  2 onde, la richiesta di mezzo viene scartata e alla fine vince Grafite
  (Chromium: avvii a 3 e 488 ms; Firefox: 4 e 453; WebKit: 5 e 706). Con clic
  ogni 300 ms partono 3 onde distanziate 445-700 ms. Il 445 ms di WebKit è
  il ritardo del `MutationObserver` rispetto al timer interno, non una
  violazione.
- **B1**: `CSS.supports('stroke-dashoffset','calc(1 - 0.5)')` resta falso in
  Firefox, ma ora le regole hanno l'unità: `stroke-dashoffset` passa da
  0,084 a 0,578 a 0,094 px durante lo scroll, come in Chromium e WebKit
  (`firefox-filo-{10,18,30}-1440.png`).
- **B2**: nell'ambiente SwiftShader (frame da 0,4-1 s), che al giro 1 dava
  "Hai lasciato presto" 2 volte su 5, ora 5 prove su 5 arrivano all'esito.
- WebKit con GL: atlante a 8 bit anche a 1440 (`halfFloat: false`, prima era
  `true`: scelta del giro 3 sulle prestazioni). Il cambio carta ora passa
  anche dal velo DOM.
- Firefox a 375: la parola dell'hero va su due righe ("impron / ta") a 1440:
  è il layout nuovo del giro 3, uguale nei tre motori.

### B3 · WebKit: `ResizeObserver loop completed with undelivered notifications` a ogni caricamento

- **Gravità**: media per il requisito "zero errori in console" (in WebKit è
  un evento `error` su `window`, quindi finisce anche nei tracciatori di
  errori); nessun effetto visibile, nessuna funzione rotta. Chromium e
  Firefox non lo segnalano.
- **Proprietari**: section-builder-hero (`sections/Hero/Hero.tsx`, RO della
  misura, riga ~254) e section-builder-legatoria
  (`sections/Legatoria/Legatoria.tsx`, RO del corpo, riga ~181).
- **Passi**: WebKit, `/concept-10` oppure `?gl=0`, a 1440 o 375, attendere
  l'arrivo dei font (~2 s): un `pageerror` a ogni caricamento.
- **Causa** (misurata avvolgendo `ResizeObserver` nel solo browser di prova):
  all'arrivo di Anybody, nello stesso giro di notifiche, il RO dell'Hero
  scrive `--imp-hero-em-misurato` (le righe dell'hero cambiano misura) e il
  RO della Legatoria rimisura e riscrive gli intervalli del filo (il corpo
  passa da 2841 a 2843 px). Il contenuto di Lenis, osservato più in alto
  nell'albero, cambia di nuovo e resta con una notifica non consegnata.
  Rinviando a `requestAnimationFrame` solo il callback dell'Hero l'errore
  resta a 1440; rinviando **Hero e Legatoria** sparisce a 1440 e a 375
  (0 errori su 4 caricamenti).
- **Correzione proposta**: nei due callback, rimandare il lavoro al frame
  dopo (`requestAnimationFrame(aggiorna)` / `requestAnimationFrame(misura)`,
  con un flag per non accodarne più di uno) invece di scrivere stili dentro
  il callback del ResizeObserver.

### Stato dei punti aperti

- B1 chiuso, B2 chiuso, B3 nuovo.
- O1 (rilievo CSS lento in WebKit): migliorato. Con `?gl=0` Tecniche e Carta
  passano da 7-9 a 56-88 frame in 2 s; l'hero resta a 7 (la pressa
  d'ingresso con i `text-shadow`). Da misurare su Safari vero.
- O2 (`ctx.fontStretch` assente in WebKit 26): invariato, la correzione
  regge.
- O3-O6: non rivisti in questo giro.

### Richieste (giro 3)

- **section-builder-hero** e **section-builder-legatoria**: B3.
