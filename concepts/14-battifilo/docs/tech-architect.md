# Tech architect · Concept 14 · BATTIFILO

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, convenzioni, contratti tra moduli, stato, budget, caricamento e
comandi. Dove un fatto del sito vero è in conflitto con questo documento vale
`concepts/10-torchio/docs/integrazione-sito.md`.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`, la
riga e il paragrafo 14 di `docs/matrice-concept-11-20.md` (più la verifica
incrociata), `concepts/14-battifilo/docs/creative-director.md` (tutto),
`concepts/10-torchio/docs/tech-architect.md`,
`concepts/10-torchio/docs/scaffold-engineer.md`,
`concepts/10-torchio/docs/RIEPILOGO.md`, il codice del pilota
(`package.json`, `src/lib/analytics.ts`, `core/`, `state/`) e, come confronto
di formato, `concepts/15-novanta/docs/tech-architect.md` (l'altro concept
senza WebGL).

Verifiche fatte oggi (26/09/2026): registry npm raggiungibile (versioni sotto
controllate con `npm view`); Node 22.22; Google Fonts serve sia
`Big Shoulders Stencil` (variabile, assi `opsz` 10..72 e `wght`) sia la
vecchia famiglia statica `Big Shoulders Stencil Display`; pesi woff2 latin
misurati con curl (§1.3); `@phosphor-icons/core` 2.1.1 (MIT) scaricabile da
jsDelivr.

Cartella del concept: `concepts/14-battifilo/`. Codice:
`src/pages/concepts/battifilo/`. Prefisso CSS `btf-`, variabili `--btf-`,
chiavi di memoria `battifilo:`. Rotta `/concept-14`. Porte **9140-9149**.

**Nomi delle sezioni.** Uso le schermate del creative-director (§4.2-4.4):
fascia, foto, apertura (S0), scheda (S1), chiavi (S2), linea (l'interazione
firma "Tira il filo"), misura (S3), cartello (S4), mesi (S5). L'ux-architect
lavora in parallelo: se cambia titoli o testi, cambiano `content/*`, non i
nomi di cartelle, file e agent. Se toglie o aggiunge una schermata,
l'orchestratore aggiorna la tabella di §4 prima dell'ondata 3.

---

## 0. Decisioni chiave in breve

1. **Stessa app standalone del pilota**: Vite 5 + React 18.3 + React Router 6
   + TypeScript 5.6, stesse versioni esatte (verdi nel pilota). Tutto il
   concept in `src/pages/concepts/battifilo/`; `src/pages/Concept14.tsx` è un
   file sottile. Porting = copiare la cartella e il file.
2. **Foto + CSS + un solo segno SVG. Niente three, R3F, drei, WebGL, lenis,
   GSAP.** Il creative-director lo chiede (§4.5, §4.9) e non serve: la pagina
   non scorre, il tempo si muove con un controllo. Nessun webgl-artist né
   shader-engineer. **Sì photo-editor** (16 foto + la texture della lastra).
3. **Un palcoscenico fisso, non una pagina a sezioni.** In modo "palco" la
   radice è alta `100dvh`, html e body non scorrono (`core/pagina.ts`), e le
   16 tappe (0 apertura, 1-14 mesi, 15 chiavi) stanno **sovrapposte nella
   stessa area della lastra**: il cambio di tappa non sposta niente (CLS 0).
   Tre schermate a tutto schermo (misura, cartello, mesi) sono sempre nel DOM,
   inerti quando chiuse, aperte da URL (`#misura`, `#cartello`, `#mesi`).
4. **Modo "documento" automatico** quando lo schermo è troppo basso (telefono
   orizzontale, zoom 400%, testo molto ingrandito) o senza JavaScript: tutto
   torna nel flusso, la pagina scorre, niente si sovrappone. Stesse soglie in
   `core/modo.ts` e in `layout.css` (§7.6).
5. **Un solo ciclo `requestAnimationFrame`** (`core/ticker.ts`, API del
   pilota, fasi `read | update | write | render`), fermo quando niente si
   muove. È l'unico posto dove si scrivono posizione della cassetta, forma del
   filo, scorrimento del nastro su mobile.
6. **Valori caldi fuori da React** (`state/runtime.ts`): posizione continua
   della cassetta (0..15 con i decimali), molla del filo, geometria della
   linea. React si ri-renderizza solo quando cambia la **tappa** (a metà mese),
   al massimo **una volta ogni 500 ms durante il trascinamento** (limite
   anti-lampeggio sulle grandi superfici: la foto), sempre alla fermata.
7. **Store lento con `useSyncExternalStore`** e selettori, azioni nominate,
   re-inizializzato al mount (come il pilota).
8. **La linea battuta non ricalcola mai filtri**: la polvere è una tessera
   SVG con `feTurbulence stitchTiles="stitch"` usata come `mask-image`
   ripetuta su un nastro color cobalto; la tessera si rasterizza una volta,
   l'avanzamento è un `clip-path: inset()` su un elemento foglia (§7.3).
9. **Ritaglio sulla linea di terra calcolato, non a mano per breakpoint**:
   ogni foto dichiara dove sta la sua linea di terra (`terra`, 0..1 in
   altezza) e il suo centro utile (`fuoco`, 0..1 in larghezza);
   `core/ritaglio.ts` calcola `object-position` per il riquadro reale a ogni
   resize. Regge 375, 768, 1440, 2560 e qualsiasi altezza (§7.5).
10. **Icone Phosphor Regular copiate come file** (MIT, licenza annotata) in
    `assets/svg/icone/`, nessuna dipendenza npm (il sito ha solo
    `lucide-react`).
11. **Bottone "Torna in Ciceri Lab" vero** (`@/components/ConceptBackButton`):
    zona libera in alto a sinistra ~230×44 px su desktop (il marchio parte da
    260 px), in basso a sinistra ~210×44 px sotto i 640 px (fascia bassa di
    64 px: bottone a sinistra, "Misura e manda" a destra).

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte, niente `^`)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | solo nell'app standalone (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy`); il concept non importa il router |

Nient'altro a runtime.

### 1.2 Dev

| Pacchetto | Versione |
|---|---|
| `vite` | `5.4.21` |
| `@vitejs/plugin-react` | `4.7.0` |
| `typescript` | `5.6.3` |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` |
| `@types/node` | `22.20.4` (solo `vite.config.ts` e `scripts/`) |
| `eslint`, `@eslint/js` | `9.39.5` |
| `typescript-eslint` | `8.70.1` |
| `eslint-plugin-react-hooks` | `5.2.0` |
| `eslint-plugin-react-refresh` | `0.4.26` |
| `globals` | `15.15.0` |

**Non installati di proposito**: `three`, `@types/three`, `@react-three/*`
(nessun 3D: CD §4.5), `lenis` (la pagina non scorre; in modo documento lo
scroll nativo è quello giusto), `gsap` (i movimenti sono quattro: molla del
filo, volo della cassetta, dissolvenze, polvere; CSS + rAF bastano, CD §4.3),
`framer-motion`, Tailwind, `zustand` (store nostro), librerie di icone,
`@fontsource`, librerie di date (servono solo "oggi" e un mese per nome:
`Intl.DateTimeFormat('it-IT')`), librerie di form o di validazione (due numeri
e un contatto: `valida.ts` nostro).

Strumenti per l'ondata 2 **fuori dal bundle**, lanciati con `npx` e non
aggiunti al `package.json`: `svgo` (vector-artist), `sharp-cli` oppure
`cwebp` se presente (photo-editor). Se `npx` non li scarica, il photo-editor
usa Python + Pillow (presente nel contenitore) e lo dichiara nel suo doc.

### 1.3 Font

Google Fonts iniettati con un `<link>` al mount (`core/fonts.ts`), più
`preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`. L'URL vero lo
fissa l'art-director in `styles/tokens.ts` → `FONT_CSS_URL`. Misure prese oggi
(woff2, solo latin):

| Richiesta | Peso |
|---|---|
| `Big+Shoulders+Stencil:opsz,wght@10..72,700..900` (variabile, due assi) | 60 KB |
| `Big+Shoulders+Stencil:wght@700..900` (solo peso, dimensione ottica di default) | 37 KB |
| `Big+Shoulders+Stencil+Display:wght@700;900` (vecchia famiglia statica, esiste ancora) | ~2 file statici |
| `Chivo:wght@400..700` (un solo file variabile per 400, 500, 700) | 33 KB |

Proposta: `family=Big+Shoulders+Stencil:opsz,wght@10..72,700..900&family=Chivo:wght@400..700&display=swap`
e `font-variation-settings: "opsz" 72` sulle marcature (è il taglio Display
che il CD nomina). Se l'art-director vede che a 20-24 px il taglio 72 è troppo
fine, usa `font-optical-sizing: auto`. Totale font ≤ **100 KB**.

- Solo latin (automatico con `unicode-range`). Niente corsivi.
- Cifre dei prezzi in Chivo con `font-variant-numeric: tabular-nums`
  (l'art-director verifica che Chivo abbia `tnum`: lo ha la versione
  variabile di Google). Le cifre a stencil grandi (costo del mese) cambiano
  larghezza tra un mese e l'altro: stanno in un riquadro di larghezza fissa
  dimensionato sul valore più largo (§8, CLS).
- `@font-face` di ripiego locale con `size-adjust` / `ascent-override`
  tarati su Big Shoulders Stencil (ripiego: `Arial Narrow`, `Roboto
  Condensed`, `sans-serif` condensato) e su Chivo (ripiego: `Arial`) in
  `tokens.css` (art-director). È la prima difesa del CLS.
- `FONT_DA_CARICARE` in `tokens.ts`: le specifiche per `document.fonts.load()`
  (es. `'900 40px "Big Shoulders Stencil"'`, `'400 17px Chivo'`). La cassetta
  non aspetta i font: niente di quello che si muove dipende dalla metrica.

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json` (`paths`).
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`, `jsx: react-jsx`,
  `moduleResolution: bundler`, `types: ["vite/client"]`, target `ES2020`.
- `vite.config.ts`: dev **9140** `strictPort`, preview **9141** `strictPort`,
  `host: true`, `build.target: 'es2020'`, `manualChunks` solo per react
  (`node_modules/react*`, `scheduler`) come nel pilota,
  `build.assetsInlineLimit: 0` (le foto e le tessere SVG restano file,
  cacheabili, mai data URI nel JS).
- Node 22.

---

## 2. Architettura in una figura

```
 input                        controller                  valori caldi                ticker (unico rAF)
 ─────                        ──────────                  ────────────                ──────────────────
 dito/mouse sulla cassetta ─┐
 frecce, Pag, Home, Fine  ──┤  interaction/*   ──►  motion/cassetta.ts ──► runtime.cassetta {pos,…}   'update': cassetta.tick, filo.tick
 rotella a scatti         ──┤  (pixel → mesi,       (segue il dito,         runtime.filo {alza,vel}              │
 swipe sulla foto         ──┤   passi ±1)            sosta 500 ms,                                               ▼
 tocco su una tacca       ──┘                        aggancio, volo)                                 'write': x della cassetta,
                                                         │                                            d del filo, nastro mobile,
                                                         │ a metà mese (≤ 1 ogni 500 ms)              clip della linea (solo al cambio)
                                                         ▼
                                           store.mostraTappa(t)  ──► React: data-tappa sulla radice,
                                                         │            foto A/B in dissolvenza, scheda entra/esce
                                                         │ alla fermata
                                                         ▼
                                           store.fermaTappa(t)   ──► battuta del filo + polvere, linea battuta,
                                                                      aria-valuenow/valuetext, aria-live, ?mese=t
```

Regola d'oro: **niente `setState` a ogni frame**. Durante un trascinamento
da marzo ad aprile dell'anno dopo React si ri-renderizza al massimo due volte
al secondo.

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo standalone, non si porta. **[P]** si porta nel sito.
Tra parentesi il proprietario (dettaglio in §4).

```
concepts/14-battifilo/
├─ DESIGN.md                                  [S*] (art-director)  formato Stitch, resta nel repo come doc
├─ docs/                                      [S]  un .md per agent
├─ qa/                                        [S]  screenshot e build di QA (ignorati da git)
├─ scripts/
│  ├─ contrasti.mjs                           [S]  (art-director) calcolo WCAG dei token, stampa la tabella del suo doc
│  └─ size.mjs                                [S]  (scaffold) pesi gz dei chunk di dist/ contro il budget di §8
├─ package.json  package-lock.json            [S]  (scaffold)
├─ vite.config.ts                             [S]  (scaffold)
├─ tsconfig.json tsconfig.app.json tsconfig.node.json   [S] (scaffold)
├─ eslint.config.js  .gitignore               [S]  (scaffold)  .gitignore: node_modules, dist, qa
├─ index.html                                 [S]  (scaffold)  lang="it", meta, preconnect, fondo ferro inline, preload foto S0
├─ public/
│  └─ favicon.svg                             [S]  (vector-artist)
└─ src/
   ├─ main.tsx                                [S]  (scaffold)  StrictMode + <App/>
   ├─ App.tsx                                 [S]  (scaffold)  BrowserRouter flag v7; /concept-14 lazy; / e * → redirect
   ├─ vite-env.d.ts                           [S]  (scaffold)
   ├─ lib/analytics.ts                        [S]  (scaffold)  copia del pilota: TrackEvent chiuso del sito, stessa firma
   ├─ components/ConceptBackButton.tsx        [S]  (scaffold)  copia fedele del pilota (location.href = "/")
   └─ pages/
      ├─ Concept14.tsx                        [P]  (scaffold)  export default () => <Battifilo/>
      └─ concepts/
         └─ battifilo/                        [P]  TUTTO il concept
            ├─ index.ts                       (scaffold)  export { default } from './Battifilo'
            ├─ Battifilo.tsx                  (scaffold)  radice .btf-root, ordine, salti, aria-live, mount/unmount
            │
            ├─ core/                          (scaffold)
            │  ├─ ticker.ts                   unico rAF, fasi read | update | write | render (§6.3)
            │  ├─ capabilities.ts             prefersReducedMotion(), ascoltaReducedMotion(), isCoarsePointer(), saveData()
            │  ├─ fonts.ts                    injectFonts(), fontsReady()
            │  ├─ viewport.ts                 runtime.viewport + --btf-vv-h (visualViewport, tastiera del telefono)
            │  ├─ modo.ts                     soglie e decidiModo(): palco | documento, largo | stretto (§7.6)
            │  ├─ pagina.ts                   blocca/ripristina overflow e overscroll di html/body in modo palco
            │  ├─ url.ts                      ?mese= ⇄ tappa (replace), #misura/#cartello/#mesi ⇄ vista (push), popstate
            │  ├─ params.ts                   parametri di QA dell'URL (§11)
            │  ├─ tempo.ts                    geometria del tempo: tappe, pos ⇄ x, buchi, segmenti battuti (§7.1)
            │  ├─ ritaglio.ts                 object-position dalla linea di terra (§7.5)
            │  ├─ precarica.ts                precaricaFoto(): Image + decode, cache delle promesse
            │  └─ links.ts                    LAB_URL, MAPS_URL, TELEFONO_URL, EMAIL_URL (da content/impresa.ts)
            │
            ├─ state/                         (scaffold)
            │  ├─ store.ts                    store + useBattifilo(selector) + azioni (§6.1)
            │  ├─ runtime.ts                  valori caldi mutabili (§6.2)
            │  └─ persist.ts                  local/sessionStorage in try/catch (copia del pilota, chiavi battifilo:)
            │
            ├─ layout/                        (scaffold)
            │  ├─ Tappa.tsx                   involucro di ogni tappa sulla lastra: <article id="tappa-N"> + stato (§3.1)
            │  └─ Schermata.tsx               involucro delle tre schermate a tutto schermo: inert, fuoco, Esc, chiudi (§3.1)
            │
            ├─ motion/                        (motion-designer)
            │  ├─ easing.ts                   curve (funzioni + stringhe cubic-bezier)
            │  ├─ molla.ts                    molla smorzata integrata sul dt del ticker
            │  ├─ cassetta.ts                 controller della cassetta: segue, sosta, aggancio, volo (§7.2)
            │  ├─ filo.ts                     tensione e battuta del filo (molla sul punto di controllo) (§7.2)
            │  ├─ battute.ts                  sequenza di N battute (i 4 lati della finestra, ribattuta di un lato)
            │  ├─ choreography.ts             costanti: durate, soglie, ampiezze; variabiliMotion(ridotto)
            │  └─ motion.css                  dissolvenze tappa/foto, polvere (keyframes), varianti reduced
            │
            ├─ interaction/                   (interaction-designer)
            │  ├─ trascina.ts                 useTrascinaOrizzontale(): puntatore → px e velocità
            │  ├─ rotella.ts                  useRotellaAScatti(): un passo per gesto, blocco 400 ms
            │  ├─ swipe.ts                    useSwipe(): swipe orizzontale sulla foto, il verticale passa
            │  ├─ tastiera.ts                 tastiSlider(): mappa tasti per role="slider"
            │  ├─ attivita.ts                 segnaInput(): runtime.ultimoInput (sparizione dell'istruzione)
            │  └─ interaction.css             focus visibile, hover, touch-action, stati della maniglia
            │
            ├─ content/                       (copywriter)
            │  ├─ testi.ts                    META, fascia, apertura, schede, chiavi, misura (tutti gli stati), cartello, mesi, aria
            │  ├─ cantiere.ts                 MESI (1-14): fase, costo, fatto, chi c'era, fermi con date, consiglio; BILANCIO
            │  ├─ prezzi.ts                   tariffe della forbice (dati, niente calcolo) (§7.4)
            │  └─ impresa.ts                  RECAPITI di esempio, orari, comuni serviti, query Maps
            │
            ├─ styles/
            │  ├─ tokens.css                  (art-director) variabili --btf-*, @font-face di ripiego
            │  ├─ tokens.ts                   (art-director) COLORI hex, FONT_CSS_URL, FONT_DA_CARICARE, misure usate in TS
            │  ├─ lastra.css                  (art-director) materiale lastra, marcatura a spruzzo .btf-stencil, fascette
            │  ├─ base.css                    (scaffold) reset scoped, tipografia base, .btf-sr, .btf-salto
            │  └─ layout.css                  (scaffold) griglia del palco, modo documento, zone riservate, schermate
            │
            ├─ assets/
            │  ├─ svg/                        (vector-artist)
            │  │  ├─ polvere-tessera.svg      tessera ripetibile della polvere del battifilo (maschera)
            │  │  ├─ polvere-bordo.svg        bordo sfrangiato della marcatura a spruzzo (maschera, se serve all'art-director)
            │  │  ├─ gancio.svg               il gancetto del filo al punto zero
            │  │  ├─ schema-misura.svg        la finestra vista da dentro con 3 frecce orizzontali e 3 verticali
            │  │  ├─ icone/avviso.svg telefono.svg email.svg mappa.svg esterno.svg menu.svg chiudi.svg
            │  │  │        meno.svg piu.svg prima.svg dopo.svg elenco.svg   (Phosphor Regular 2.1.1, MIT)
            │  │  └─ index.ts                 export degli SVG (?raw) e degli URL (?url)
            │  └─ foto/                       (photo-editor)
            │     ├─ <id>-900.webp <id>-1600.webp      16 foto (tappe 0-15), vedi §7.5
            │     ├─ lastra-800.webp lastra-1600.webp  texture del getto (una sola per tutto il sito)
            │     └─ index.ts                 FOTO, FOTO_DELLE_TAPPE, LASTRA (§7.5)
            │
            └─ sections/
               ├─ Fascia/     Fascia.tsx  MenuMobile.tsx  FasciaBassa.tsx  fascia.css           (section-builder-fascia)
               ├─ Foto/       Foto.tsx  useRitaglio.ts  foto.css                                 (section-builder-foto)
               ├─ Apertura/   Apertura.tsx  apertura.css                                         (section-builder-apertura)
               ├─ Scheda/     Schede.tsx  SchedaMese.tsx  scheda.css                             (section-builder-scheda)
               ├─ Chiavi/     Chiavi.tsx  chiavi.css                                             (section-builder-chiavi)
               ├─ Linea/      Linea.tsx  Cassetta.tsx  Filo.tsx  LineaBattuta.tsx  Tacche.tsx
               │              Polvere.tsx  Istruzione.tsx  useCassetta.ts  linea.css             (section-builder-linea)
               ├─ Misura/     Misura.tsx  Tracciamento.tsx  Forbice.tsx  Campi.tsx  Invio.tsx
               │              forbice.ts  valida.ts  scala.ts  invio.ts  misura.css              (section-builder-misura)
               ├─ Cartello/   Cartello.tsx  cartello.css                                         (section-builder-cartello)
               └─ Mesi/       Mesi.tsx  mesi.css                                                 (section-builder-mesi)
```

### 3.1 La pagina montata da `Battifilo.tsx`

```html
<div class="btf-root" data-modo="palco|documento" data-formato="largo|stretto"
     data-tappa="0..15" data-vista="cronaca|misura|cartello|mesi"
     data-foto="si|no" data-trascina="0|1" data-motion="full|reduced" data-pronto="0|1"
     style="…variabiliMotion(ridotto)…">
  <a class="btf-salto" href="#tappa-attiva">Salta alla cronaca</a>
  <a class="btf-salto" href="#misura">Vai a Misura e manda</a>
  <ConceptBackButton/>                                    <!-- del sito, fisso, z 2147483000 -->
  <Fascia/>                                               <!-- <header>: marchio, 3 voci; su mobile bottone Menu -->
  <main id="cronaca" class="btf-palco" inert={vista≠cronaca}>
    <Foto/>                                               <!-- <figure> due livelli A/B, aria-hidden (l'alt sta in una didascalia sr) -->
    <div class="btf-lastra">                              <!-- materiale di lastra.css -->
      <div class="btf-tappe">                             <!-- tutte nella stessa cella di griglia -->
        <Apertura/>                                       <!-- <Tappa n={0}> -->
        <Schede/>                                         <!-- 14 × <Tappa n={1..14}><SchedaMese/></Tappa> -->
        <Chiavi/>                                         <!-- <Tappa n={15}> -->
      </div>
      <Linea/>                                            <!-- filo, linea battuta, tacche, cassetta role=slider, istruzione -->
    </div>
  </main>
  <Misura/>                                               <!-- <Schermata id="misura">   -->
  <Cartello/>                                             <!-- <Schermata id="cartello"> -->
  <Mesi/>                                                 <!-- <Schermata id="mesi">     -->
  <FasciaBassa/>                                          <!-- solo stretto: 64 px, zona del bottone del sito a sinistra, "Misura e manda" a destra -->
  <p class="btf-sr" aria-live="polite">{annuncio}</p>     <!-- fase alla fermata, esito dell'invio -->
</div>
```

- **`layout/Tappa.tsx`** (scaffold): `<Tappa n={N} titoloId?>` rende
  `<article id="tappa-N" class="btf-tappa" data-n="N" data-stato="attiva|entra|esce|spenta" aria-labelledby="tappa-N-titolo">`.
  Le tappe non attive hanno `inert` e `aria-hidden="true"` in modo palco (le
  mette `Tappa`, non la sezione). Anche in modo documento sulla lastra resta
  visibile solo la tappa attiva: la cronaca completa da leggere di seguito è
  la schermata "mesi", sempre raggiungibile.
  L'elemento con `id="tappa-attiva"` per il link di salto è un `<span>` messo
  da `Tappa` nella tappa attiva. Ogni sezione mette il proprio `h2` con
  `id="tappa-N-titolo"`.
- **`layout/Schermata.tsx`** (scaffold): `<Schermata id="misura|cartello|mesi" titoloId>`
  rende `<section id=… class="btf-schermata btf-schermata--{id}" role="region" aria-labelledby>`
  con: bottone "Torna alla cronaca" (testo da `testi.ts`, in alto a destra,
  mai nella zona del bottone del sito), `inert` + `hidden`-visivo quando
  chiusa, fuoco sul titolo all'apertura, ritorno del fuoco all'elemento che
  l'ha aperta alla chiusura, `Esc` chiude, scroll interno proprio
  (`overflow-y: auto`, `overscroll-behavior: contain`). Non è un `<dialog>`
  modale: è una schermata con indirizzo (`#misura`), il tasto indietro del
  browser la chiude.
- Tutti i componenti di sezione sono **default export senza prop**.
- Id stabili (li usano URL, salti, link, test): `tappa-0` … `tappa-15`,
  `tappa-attiva`, `cronaca`, `misura`, `cartello`, `mesi`, `mese-1` … `mese-14`
  (voci dell'elenco in `Mesi`).

---

## 4. File di competenza esclusiva

Regola: **ogni file ha un solo proprietario**. Chi ha bisogno di una modifica
in un file altrui la scrive nel proprio `docs/<agent>.md` (sezione
"Richieste ad altri agent") e l'orchestratore la gira. Tutti possono
**leggere e importare** tutto. Percorsi relativi a
`src/pages/concepts/battifilo/` salvo dove scritto.

**Passaggio degli stub**: lo scaffold crea gli stub di tutte le sezioni
(default export che rende la propria `Tappa`/`Schermata`/`header` con il solo
titolo) perché il build sia verde subito. A fine scaffold la proprietà passa
ai section-builder e lo scaffold non li tocca più.

### Ondata 2 (in parallelo)

| Agent | File esclusivi | Cosa NON tocca / vincoli |
|---|---|---|
| **art-director** | `DESIGN.md` (root del concept), `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts`, `styles/lastra.css`, `scripts/contrasti.mjs` | CSS di sezione, `base.css`, `layout.css`, i file delle foto. Nessun colore fuori dai sei del CD §4.1 e dai loro derivati. La texture della lastra la sceglie **con** il photo-editor (lui la scarica e la tratta, l'art-director decide tinta, `mix-blend-mode` e verifica i contrasti con lo script). |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*` (webp + `index.ts`) | nessun trattamento a runtime (correzione colore fatta sui file, CD §4.3); nessuna foto non guardata con Read; piano B del CD (dettaglio, poi `null` = solo lastra), mai immagini generate. |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/molla.ts`, `motion/cassetta.ts`, `motion/filo.ts`, `motion/battute.ts`, `motion/choreography.ts`, `motion/motion.css` | il ticker (ne usa l'API), gli input (interaction), il DOM delle sezioni. Solo i movimenti del CD §4.9: niente fade-up, niente reveal. |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/trascina.ts`, `interaction/rotella.ts`, `interaction/swipe.ts`, `interaction/tastiera.ts`, `interaction/attivita.ts`, `interaction/interaction.css` | niente cursore custom, niente preloader, niente bottoni magnetici (CD §4.8). |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/cantiere.ts`, `content/prezzi.ts`, `content/impresa.ts` | nessun testo nei componenti; niente `—`/`–`; niente "01 ·"; recapiti di esempio, nessun dato legale; cifre del cantiere "sporche" e dichiarate come esempio. |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*` (compreso `icone/` e `index.ts`), `public/favicon.svg` | nessuna casa, gru, casco, betoniera, operaio, cazzuola, metro, sagoma umana (CD §4.5). La porta di riferimento non è un file: la disegna il codice di Misura (un rettangolo con maniglia). |
| ~~webgl-artist~~ | **non previsto** (niente WebGL, §1.2). Se l'orchestratore lo lancia comunque, il suo unico output è un `docs/webgl-artist.md` che conferma la rinuncia. | — |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file **[S]** di §3 tranne `DESIGN.md`, i `docs/*` altrui, `scripts/contrasti.mjs` e `public/favicon.svg`; `src/pages/Concept14.tsx`; `index.ts`, `Battifilo.tsx`; `core/*`; `state/*`; `layout/*`; `styles/base.css`, `styles/layout.css`; stub iniziali di `sections/*/*` (poi passano ai proprietari) |
| **section-builder-fascia** | `sections/Fascia/Fascia.tsx`, `MenuMobile.tsx`, `FasciaBassa.tsx`, `fascia.css`, `docs/section-builder-fascia.md` |
| **section-builder-foto** | `sections/Foto/Foto.tsx`, `useRitaglio.ts`, `foto.css`, `docs/section-builder-foto.md` |
| **section-builder-apertura** (S0) | `sections/Apertura/Apertura.tsx`, `apertura.css`, `docs/section-builder-apertura.md` |
| **section-builder-scheda** (S1, mesi 1-14) | `sections/Scheda/Schede.tsx`, `SchedaMese.tsx`, `scheda.css`, `docs/section-builder-scheda.md` |
| **section-builder-chiavi** (S2) | `sections/Chiavi/Chiavi.tsx`, `chiavi.css`, `docs/section-builder-chiavi.md` |
| **section-builder-linea** (interazione firma) | `sections/Linea/Linea.tsx`, `Cassetta.tsx`, `Filo.tsx`, `LineaBattuta.tsx`, `Tacche.tsx`, `Polvere.tsx`, `Istruzione.tsx`, `useCassetta.ts`, `linea.css`, `docs/section-builder-linea.md` |
| **section-builder-misura** (S3, prenotazione) | `sections/Misura/Misura.tsx`, `Tracciamento.tsx`, `Forbice.tsx`, `Campi.tsx`, `Invio.tsx`, `forbice.ts`, `valida.ts`, `scala.ts`, `invio.ts`, `misura.css`, `docs/section-builder-misura.md` |
| **section-builder-cartello** (S4) | `sections/Cartello/Cartello.tsx`, `cartello.css`, `docs/section-builder-cartello.md` |
| **section-builder-mesi** (S5, vista elenco) | `sections/Mesi/Mesi.tsx`, `mesi.css`, `docs/section-builder-mesi.md` |

Note:
- Nessuno shader-engineer (niente WebGL).
- **section-builder-linea** è il più delicato: collega `interaction/*` e
  `motion/cassetta.ts` + `motion/filo.ts` alla cassetta in `useCassetta.ts`,
  chiama `store.mostraTappa()` / `store.fermaTappa()`, fa l'apertura
  automatica (il filo si tende fino al mese 1 dopo 600 ms, CD §4.2), la
  sparizione dell'istruzione, la tacca "TU". Parte in parallelo agli altri:
  il contratto con loro passa solo da store, runtime e `core/tempo.ts`.
- **section-builder-foto** gestisce anche lo swipe sulla foto
  (`useSwipe` → `cassetta.vaA(tappa ± 1)`: gli serve il controller, che
  `useCassetta.ts` espone come singleton di modulo con `cassettaCorrente()`,
  vedi §7.2).
- **section-builder-misura** scrive `invio.ts` come **invio simulato**
  (nessuna rete): risolve dopo ~900 ms; con `?invio=ko` fallisce. La tacca
  "TU" nella cronaca la disegna la linea leggendo `store.tuo`.
- **section-builder-scheda** mette anche la didascalia della foto (cosa si
  vede + autore) sotto la scheda del mese, il link "Leggi tutti i mesi" e,
  nei mesi 7 e 12, "Quanto costerebbe la tua finestra?".
- Il copywriter scrive i testi come dati tipizzati; i section-builder non
  inventano testo. Se manca una stringa, la chiedono.

### Porte (regola di `docs/lab-operativo.md`, sempre `--strictPort`, ognuno chiude il suo server)

| Porta | Ondata 2 | Ondata 3 | Ondata 4 |
|---|---|---|---|
| 9140 | | scaffold (prima, da solo) · poi section-builder-fascia | |
| 9141 | | section-builder-foto | performance-auditor |
| 9142 | art-director | section-builder-apertura | responsive-tester |
| 9143 | motion-designer | section-builder-scheda | accessibility-auditor |
| 9144 | interaction-designer | section-builder-chiavi | cross-browser-tester |
| 9145 | vector-artist | section-builder-linea | seo-engineer |
| 9146 | photo-editor | section-builder-misura | awwwards-jury (se gli serve un server) |
| 9147 | copywriter (se gli serve) | section-builder-cartello | |
| 9148 | | section-builder-mesi | |
| 9149 | riserva dell'orchestratore | riserva | riserva |

Le ondate non si sovrappongono, quindi il riuso di una porta tra ondate è
sicuro. Comando di sviluppo per chi non è lo scaffold:
`npx vite --port 914x --strictPort` dalla cartella del concept.

**QA in parallelo e `dist/`**: nell'ondata 4 ognuno fa la **sua** build in una
cartella propria, così nessuno sovrascrive quella di un altro mentre la serve:
`npx vite build --outDir qa/dist-<agent>` e poi
`npx vite preview --outDir qa/dist-<agent> --port 914x --strictPort`.

---

## 5. Convenzioni CSS

- **Un file `.css` per sezione**, importato dal componente. Niente CSS
  modules, niente Tailwind (come il pilota: classi leggibili negli screenshot,
  selettori di stato su attributi della radice senza `:global`).
- **Prefisso `btf-`** con BEM leggero: `btf-<blocco>`, `btf-<blocco>__<el>`,
  `btf-<blocco>--<variante>`. Esempi: `btf-linea__cassetta`,
  `btf-linea__buco`, `btf-misura__forbice-tratto--pvc`, `btf-cartello__fascetta`.
  Classi condivise: `btf-root`, `btf-palco`, `btf-lastra`, `btf-tappe`,
  `btf-tappa`, `btf-schermata`, `btf-sr`, `btf-salto` (scaffold),
  `btf-stencil` (art-director, `lastra.css`).
- **Tutti i selettori iniziano con `.btf-root`**. Niente regole su `html`,
  `body`, `:root`, `*` nudi; l'unica eccezione è in `base.css` (scaffold) con
  `html:has(.btf-root)`, come nel pilota. Il fondo è sulla radice e, inline
  al mount, su html/body (niente strisce nel rimbalzo iOS), ripristinato allo
  smontaggio.
- **Variabili `--btf-*` solo in `tokens.css`** (art-director); variabili
  locali di sezione con prefisso di sezione (`--btf-linea-…`). **Nessun hex
  fuori da `styles/tokens.*`.** Il cobalto piccolo usa sempre il token del
  "cobalto fondo" (CD §4.1).
- **Variabili scritte da JS: solo su elementi foglia marcati `data-btfvar`**
  e solo quando il valore cambia (regola del motion-designer in
  `docs/ruoli-agent.md`). Elenco chiuso:

  | Variabile | Elemento foglia | Chi la scrive | Quando |
  |---|---|---|---|
  | `--btf-cassetta-x` (px) | `.btf-linea__cassetta` (largo) | `useCassetta.ts` nella fase `write` | ogni frame in movimento |
  | `--btf-nastro-x` (px) | `.btf-linea__nastro` (stretto: la linea scorre, la cassetta sta al centro) | `useCassetta.ts`, fase `write` | ogni frame in movimento |
  | `--btf-battuto` (px) | `.btf-linea__gesso--nuovo` | `LineaBattuta.tsx`, fase `write` | alla battuta (e per la durata del tratto che si posa) |
  | `--btf-massimo` (px) | `.btf-linea__gesso--vecchio` | `LineaBattuta.tsx` | quando cresce il massimo |
  | `--btf-vv-h` (px) | `.btf-root` (unica eccezione: la legge tutto il layout) | `core/viewport.ts` | resize del visualViewport |

  L'attributo `d` del filo (`<path>`) lo scrive `Filo.tsx` nella fase
  `write`, ogni frame in movimento: è un attributo, non una variabile.
  `object-position` delle due foto lo scrive `useRitaglio.ts` al resize e al
  cambio foto, mai per frame.
- **Attributi di stato su `.btf-root`** (li scrive solo `Battifilo.tsx` dallo
  store): `data-modo`, `data-formato`, `data-tappa`, `data-vista`,
  `data-foto`, `data-trascina`, `data-motion`, `data-pronto` (`1` dopo il
  mount: da lì valgono le transizioni; prima, niente transizioni).
- **Z-index** (token dell'art-director, nomi fissi): foto 0, lastra 1,
  cassetta e filo 2, fascia 10, schermate 20, fascia bassa 25. Il bottone del
  sito sta a 2147483000 e nessuno lo supera né lo copre.
- **Unità**: `rem` per il testo, `clamp()` per le misure fluide, `dvh`/`svh`
  per le altezze (mai `100vh` puro su mobile), `env(safe-area-inset-*)` sulla
  fascia bassa e ai bordi del palco.
- **Raggio 0 ovunque** (CD: spigolo vivo come un cassero). Unica eccezione la
  maniglia della cassetta (6 px). Nessuna ombra portata, niente bordino +
  ombra sulle superfici.
- **Media query in `em`** (lo zoom e il testo ingrandito spostano davvero la
  soglia): `40em` = 640 px (bottone del sito), `60em` = 960 px (largo /
  stretto), `34em` = 544 px e `22.5em` = 360 px di altezza (palco /
  documento, §7.6).
- **Ordine dei CSS** in `Battifilo.tsx`: `tokens.css` → `base.css` →
  `layout.css` → `lastra.css` → `motion/motion.css` →
  `interaction/interaction.css` → CSS di sezione (ordine del DOM di §3.1).
- **Transizioni**: solo `opacity`, `transform`, `clip-path` e `color`. Mai
  transizioni su `width`, `height`, `top`, `left`, `filter` o
  `background-position`.

---

## 6. Stato condiviso

### 6.1 Store lento: `state/store.ts`

Store esterno di modulo (niente librerie), letto con `useSyncExternalStore`
più selettore ed eguaglianza opzionale, **re-inizializzato al mount** di
`Battifilo.tsx`. Il tipo `Tappa` viene da `core/tempo.ts` (una fonte).

```ts
type Tappa = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
type Vista = 'cronaca' | 'misura' | 'cartello' | 'mesi';
type Modo = 'palco' | 'documento';
type Formato = 'largo' | 'stretto';
type TipoFinestra = 'un-anta' | 'due-ante' | 'portafinestra' | 'scorrevole';   // da content/prezzi.ts
type Materiale = 'pvc' | 'legno-alluminio' | 'legno';                            // da content/prezzi.ts
type Quando = 'mattina' | 'pomeriggio' | 'sabato';
type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';

interface Tuo {                        // la tua finestra dopo l'invio (localStorage 'battifilo:tuo')
  tipo: TipoFinestra; larghezza: number; altezza: number;   // cm
  quante: number; comune: string; data: string;             // 'AAAA-MM-GG'
}

interface BattifiloState {
  tappa: Tappa;                // tappa mostrata (foto + scheda); cambia a metà mese, max 1 ogni 500 ms in trascinamento
  tappaFerma: Tappa;           // ultima tappa su cui la cassetta si è agganciata: aria-valuenow, ?mese=, annuncio
  massimo: Tappa;              // fin dove il filo ha battuto (gesso vecchio al 55%)
  trascina: boolean;           // la cassetta è in mano (data-trascina)
  vista: Vista;
  modo: Modo;                  // core/modo.ts
  formato: Formato;            // core/modo.ts
  reducedMotion: boolean;
  istruzioneVista: boolean;    // "Tira il filo…" già sparita (sessionStorage 'battifilo:istruzione')
  aperturaFatta: boolean;      // il filo si è già teso da solo fino al mese 1
  oggi: string | null;         // 'AAAA-MM-GG' al mount (o ?oggi=); null nel prerender
  misura: {
    tipo: TipoFinestra;
    larghezza: string;         // testo del campo, così "118,5" e "1180" restano come scritti
    altezza: string;
    quante: number;            // 1..20
    materialeVisto: Materiale | null;   // ultima riga della forbice toccata/a fuoco (per analytics)
    invio: StatoInvio;
  };
  tuo: Tuo | null;
  simula: { invioKo: boolean };        // da core/params.ts
}

store.get(): BattifiloState
store.subscribe(fn: () => void): () => void
useBattifilo<T>(sel: (s: BattifiloState) => T, isEqual?: (a: T, b: T) => boolean): T
```

Azioni nominate (le sezioni chiamano queste, mai `store.set` diretto):

| Azione | Chi la chiama |
|---|---|
| `mostraTappa(t)` | `useCassetta.ts` (a metà mese, con il limite di 500 ms) |
| `fermaTappa(t)` | `useCassetta.ts` (aggancio); aggiorna `massimo`, `?mese=` (replace), annuncio |
| `impostaTrascina(b)` | `useCassetta.ts` |
| `apriVista(v, origine?: HTMLElement)` / `chiudiVista()` | fascia, apertura, scheda (mesi 7 e 12), cartello, fascia bassa, `Schermata`; scrivono l'hash con `push` |
| `segnaIstruzione()` / `segnaApertura()` | `Istruzione.tsx` / `useCassetta.ts` |
| `aggiornaMisura(patch)` | Misura (`tipo`, `larghezza`, `altezza`, `quante`, `materialeVisto`) |
| `impostaInvio(stato)` | Misura |
| `registraTuo(tuo)` / `dimenticaTuo()` | Misura (successo) / Misura ("Rifai le misure") |
| `aggiornaModo({ modo, formato })`, `impostaReducedMotion(b)`, `impostaOggi(d)` | solo `Battifilo.tsx` |

**Nome, telefono/email, comune e fascia oraria non entrano nello store**:
restano stato locale di `Campi.tsx` (la schermata Misura è sempre montata,
quindi i valori non si perdono chiudendola). In `Tuo` entra solo il comune,
perché la frase di successo lo cita ("sopralluogo a Porcia").

Memoria: `battifilo:tuo` (localStorage, JSON validato),
`battifilo:istruzione` (sessionStorage). Niente altro.

### 6.2 Valori caldi: `state/runtime.ts`

Oggetto mutabile, **mai** in React state, letto e scritto nel ticker e dagli
handler di input:

```ts
interface StatoCassetta {
  pos: number;              // 0..15 con i decimali: dove sta la cassetta ora
  target: number;           // dove sta andando
  vel: number;              // tappe al secondo
  stato: 'fermo' | 'trascina' | 'sosta' | 'aggancio' | 'volo';
  ultimoMovimento: number;  // performance.now() dell'ultimo spostamento del dito (per la sosta di 500 ms)
}
interface StatoFilo {
  alza: number;             // spostamento del punto di controllo centrale, px (negativo = su)
  vel: number;
  battendo: boolean;
}
interface GeometriaLinea {  // la scrive Linea.tsx con ResizeObserver, mai per frame
  x0: number;               // px, gancio (tappa 0) nel sistema della linea
  passo: number;            // px per tappa
  larghezza: number;        // px del contenitore
  formato: 'intera' | 'nastro';   // largo: 16 tappe in vista; stretto: nastro che scorre sotto la cassetta fissa
  centro: number;           // px: dove sta la cassetta ferma nel formato nastro
  sinistraPagina: number;   // px viewport del contenitore (per il puntatore), aggiornato al resize e a inizio trascinamento
}
runtime.cassetta: StatoCassetta
runtime.filo: StatoFilo
runtime.linea: GeometriaLinea
runtime.viewport: { w: number; h: number; vvH: number; dpr: number }
runtime.ultimoCambioTappa: number     // performance.now() dell'ultimo mostraTappa (limite 500 ms)
runtime.ultimoInput: number           // interaction/attivita.ts
runtime.reset(): void                 // Battifilo.tsx al mount
```

Chi scrive cosa:
- `runtime.cassetta`: **solo** il controller (`motion/cassetta.ts`),
  comandato da `useCassetta.ts` (e dallo swipe della foto tramite
  `cassettaCorrente()`).
- `runtime.filo`: **solo** `motion/filo.ts`.
- `runtime.linea`: `Linea.tsx` (ResizeObserver, `document.fonts.ready`),
  mai nel ticker.
- Letture di layout (`getBoundingClientRect`) solo su resize,
  ResizeObserver, inizio trascinamento. **Mai nel ticker**: la fase `read`
  resta disponibile ma in questo concept non ha abbonati fissi.

### 6.3 Ticker: `core/ticker.ts`

API del pilota, identica (§4.1 di `concepts/10-torchio/docs/scaffold-engineer.md`),
**senza** lenis:

```ts
export type FaseTicker = 'read' | 'update' | 'write' | 'render';
export type TickFn = (dt: number, now: number) => boolean | void;   // true = ho ancora da muovermi
export interface Ticker {
  add(fn: TickFn, fase?: FaseTicker): () => void;   // default 'update'; sveglia; restituisce la rimozione
  wake(): void;
  readonly running: boolean;
  attiva(): () => void;                              // pausa con visibilitychange; solo Battifilo.tsx
  readonly abbonati: number;
}
export const ticker: Ticker;
```

`dt` in secondi, in [0, 0,05], 1/60 al primo frame dopo un risveglio. Il
ciclo si ferma quando nessuna fn ritorna `true` e nessuno ha chiamato
`wake()`. **Nessun altro `requestAnimationFrame`, `setInterval` o animazione
JS nel concept.** Dissolvenze e polvere sono CSS.

Uso delle fasi in questo concept:

| Fase | Chi | Cosa |
|---|---|---|
| `read` | nessuno di fisso | (riservata; niente letture di layout per frame) |
| `update` | `useCassetta.ts` | `cassetta.tick(dt)`, `filo.tick(dt)`; calcolo della tappa a metà mese e chiamata a `mostraTappa` se passati 500 ms dall'ultima; `fermaTappa` all'aggancio |
| `update` | `Tracciamento.tsx` | `battute.tick(dt)` per i 4 lati della finestra (solo mentre battono) |
| `write` | `useCassetta.ts` | `--btf-cassetta-x` o `--btf-nastro-x` (solo se cambiato di ≥ 0,1 px) |
| `write` | `Filo.tsx` | `d` del filo |
| `write` | `LineaBattuta.tsx` | `--btf-battuto` durante il tratto che si posa (≤ 200 ms) |
| `write` | `Tracciamento.tsx` | `stroke-dashoffset` dei lati della finestra che battono |
| `render` | nessuno | (niente canvas; la polvere è CSS) |

---

## 7. Contratti tra moduli (firme da rispettare già nell'ondata 2)

Gli agent dell'ondata 2 scrivono contro queste firme; lo scaffold le
implementa (quelle di `core/`) e verifica con il typecheck che coincidano.

### 7.1 `core/tempo.ts` (scaffold): la geometria del tempo

Convenzione unica: **pos** è un numero continuo in [0, 15]. La tappa `n` sta
a `pos = n`. Il mese `m` (1..14) occupa il tratto `[m − 1, m]`: fermarsi su
`m` vuol dire "il mese m è fatto", e la linea battuta arriva fino a `m`. La
tappa 15 (CHIAVI) chiude l'ultimo tratto `[14, 15]` (consegna). Le tacche dei
mesi sono marcate sotto il loro tratto; il punto d'aggancio è la fine del
tratto.

```ts
export const ULTIMA_TAPPA = 15;
export const TAPPE: readonly Tappa[];                                  // [0..15]
export type Tappa = 0 | 1 | … | 15;
export function eTappa(v: unknown): v is Tappa;
export function limitaPos(pos: number): number;                        // clamp 0..15
export function tappaDaPos(pos: number): Tappa;                        // Math.round: cambia a metà tratto
export function tappaVicina(pos: number): Tappa;                       // = tappaDaPos, nome parlante per l'aggancio

export interface GeometriaLinea { x0: number; passo: number; larghezza: number;
  formato: 'intera' | 'nastro'; centro: number; sinistraPagina: number }
export function xDaPos(pos: number, g: GeometriaLinea): number;        // px nel sistema della linea
export function posDaX(x: number, g: GeometriaLinea): number;          // inverso, non limitato
export function spostamentoNastro(pos: number, g: GeometriaLinea): number;   // formato 'nastro': translateX della linea

export interface Buco {                                                // interruzione della linea battuta
  mese: number;                  // 1..14
  da: number; a: number;         // in pos (es. agosto 4-22 → 5,10..5,71)
  giorni: number;                // giorni di cantiere fermo
  chiave: string;                // id del fermo in content/cantiere.ts (per il testo "Ferie: …")
}
export function calcolaBuchi(mesi: typeof MESI): Buco[];                // dalle date dei fermi del copywriter
export function segmentiBattuti(finoA: number, buchi: readonly Buco[]): Array<readonly [number, number]>;  // tratti [da, a] in pos, già senza buchi
export function valoreParlante(t: Tappa): string;                      // aria-valuetext da content/testi.ts + cantiere.ts
```

`calcolaBuchi` usa il mese e l'anno di ogni tappa (dal copywriter) e i giorni
del mese veri (`new Date(anno, mese, 0).getDate()`), solo aritmetica di date
locale: nessun fuso, nessun `Intl`.

### 7.2 `motion/*` (motion-designer)

```ts
// motion/molla.ts
export interface Molla { x: number; v: number; target: number }
export function passoMolla(m: Molla, dt: number, rigidezza: number, smorzamento: number): boolean;  // true se ancora in moto

// motion/cassetta.ts
export interface OpzioniCassetta {
  stato: StatoCassetta;                 // runtime.cassetta
  min: 0; max: 15;
  sosta: number;                        // ms fermo col dito prima dell'aggancio (CD: 500)
  durataVolo: number;                   // ms da tacca a tacca col tocco (CD: 500)
  ridotto: () => boolean;               // reduced motion: salto secco all'aggancio, niente volo
  onAggancio: (t: Tappa) => void;       // la cassetta si è fermata su t: batte il filo, fermaTappa
}
export interface Cassetta {
  trascina(pos: number): void;          // segue il dito 1:1 (niente ritardo), aggiorna ultimoMovimento
  rilascia(velTappeAlSecondo: number): void;   // niente inerzia lunga: aggancio alla tappa vicina (al massimo +1 nel verso se vel alta)
  vaA(t: Tappa, opz?: { subito?: boolean }): void;   // tacca, tasti, swipe, URL, apertura automatica
  passo(delta: number): void;           // rotella / "mese prima" "mese dopo": vaA(tappaFerma + delta)
  tick(dt: number, now: number): boolean;
}
export function creaCassetta(o: OpzioniCassetta): Cassetta;

// motion/filo.ts
export interface Filo {
  tendi(): void;                        // durante il trascinamento: filo dritto e teso (alza → 0 senza oscillare)
  batti(): void;                        // su di pochi px, giù con due oscillazioni smorzate (CD: 350 ms in tutto)
  molle(): void;                        // la corda molle (usata dalla Misura in errore): curva che pende, ferma
  tick(dt: number): boolean;
}
export function creaFilo(stato: StatoFilo, ridotto: () => boolean): Filo;
export function pathFilo(xGancio: number, xCassetta: number, y: number, alza: number): string;   // "M … Q … …"

// motion/battute.ts (i 4 lati della finestra, 120 ms tra uno e l'altro; ribattuta di un solo lato)
export interface Battute {
  avvia(lati: readonly ('sopra' | 'destra' | 'sotto' | 'sinistra')[], passoMs?: number): void;
  progresso(lato: 'sopra' | 'destra' | 'sotto' | 'sinistra'): number;   // 0..1
  tick(dt: number): boolean;
}
export function creaBattute(ridotto: () => boolean): Battute;          // ridotto: tutti a 1 subito
```

`motion/choreography.ts` esporta almeno: `SOSTA` (500), `VOLO` (500),
`BATTUTA` (350), `POLVERE` (800), `DISSOLVENZA_TAPPA` (250),
`DISSOLVENZA_FOTO` (450), `DISSOLVENZA_FOTO_RIDOTTA` (150),
`LIMITE_CAMBIO_TAPPA` (500: vedi §0 punto 6), `ATTESA_APERTURA` (600),
`PASSO_BATTUTE` (120), `BLOCCO_ROTELLA` (400), `OPACITA_GESSO_VECCHIO`
(0.55), e `variabiliMotion(ridotto)` → oggetto di variabili CSS
(`--btf-dur-*`, `--btf-ease-*`) che `Battifilo.tsx` mette sulla radice.
`motion.css` usa `[data-stato]` di `Tappa` e `data-motion` della radice.

**La polvere** (CD §4.3): 8-12 `<span>` (o `<circle>`) in `Polvere.tsx`,
animati da **keyframes CSS** di `motion.css` (solo `transform` e `opacity`,
opacità bassa, 800 ms), fatti ripartire cambiando una `key` React al momento
della battuta. Niente canvas. Con reduced motion o `saveData` non si
renderizzano.

`useCassetta.ts` (section-builder-linea) crea **un** controller al mount della
linea e lo espone con:

```ts
export function cassettaCorrente(): Cassetta | null;   // per lo swipe della foto e per ?mese= al popstate
```

### 7.3 La linea battuta (section-builder-linea, vector-artist, art-director)

- **Tessera della polvere** (`assets/svg/polvere-tessera.svg`,
  vector-artist): SVG di circa 240×24 con `feTurbulence`
  (`stitchTiles="stitch"`, così si ripete senza cuciture) + soglia alfa, in
  bianco su trasparente: è una **maschera**, non ha colore. Densità del gesso
  non uniforme, bordi polverosi, altezza utile 5-6 px al centro.
- **Resa**: ogni tratto battuto è un `<span>` con
  `background: var(--btf-cobalto)` e
  `mask: url(tessera) repeat-x 0 50% / auto 100%` (con `-webkit-mask`). La
  tessera si rasterizza una volta; nessun filtro SVG vive nel DOM della
  pagina.
- **Buchi**: i tratti sono già spezzati da `segmentiBattuti()` (§7.1): nei
  buchi non c'è nessun elemento. Sopra ogni buco un bottone invisibile grande
  quanto la tacca (almeno 44 px di altezza) mostra la riga "Ferie: cantiere
  chiuso dal 4 al 22 agosto." al passaggio e al fuoco.
- **Avanzamento**: due strati identici, "vecchio" (opacità 0,55, fino a
  `massimo`) e "nuovo" (fino a `tappaFerma`), ognuno dentro un contenitore
  foglia con `clip-path: inset(0 calc(100% - var(--btf-…)) 0 0)`. Il
  contenitore ha `will-change: clip-path` **solo** mentre la linea si posa,
  poi lo toglie.
- **Nastro su mobile**: la linea intera (16 tappe a `passo` ≥ 64 px) sta in
  `.btf-linea__nastro`, spostato con `translate: var(--btf-nastro-x) 0`;
  cassetta ferma al centro; due bottoni 44 px "mese prima" / "mese dopo" ai
  lati (CD §4.7).
- **Filo**: un `<svg>` sopra la linea, `aria-hidden`, con un `<path>` da
  gancio a cassetta scritto da `Filo.tsx` con `pathFilo()`. Tratto 1,5 px
  ferro, `vector-effect: non-scaling-stroke`.
- **Cassetta**: un `<div role="slider" tabindex="0">` 44×56 px disegnato in
  CSS (corpo ferro, maniglia con raggio 6 px), con `aria-valuemin="0"`,
  `aria-valuemax="15"`, `aria-valuenow={tappaFerma}`,
  `aria-valuetext={valoreParlante(tappaFerma)}`, `aria-label` da testi. Il
  valore ARIA si aggiorna **alla fermata**, non per frame. La regione
  `aria-live` annuncia la fase alla fermata.
- **Tacche**: `<button>` veri (nome completo del mese e fase in
  `aria-label`), tocco → `cassetta.vaA(m)`. Stencil sotto la linea ("MAR" …
  "APR", "CHIAVI"). Su mobile ogni tacca ≥ 44 px (il nastro scorre).
- **Tacca "TU"** (dopo l'invio, `store.tuo`): un bottone prima del gancio con
  "TU" e "118 × 142" a stencil piccolo; apre `#misura` con le misure salvate.
  Non è una tappa dello slider (lo slider resta 0..15).

### 7.4 Misura e manda (section-builder-misura, copywriter)

`content/prezzi.ts` (copywriter, solo dati):

```ts
export const TIPI: readonly { id: TipoFinestra; coefficiente: number; davanzale: number }[];
// un-anta 1, due-ante 1, portafinestra 1.1 (davanzale 0), scorrevole 1.6 (davanzale 0); davanzale in cm (90 per le finestre)
export const MATERIALI: readonly { id: Materiale; euroM2: readonly [number, number] }[];
// pvc [450, 650], legno [650, 900], legno-alluminio [800, 1100] (CD §4.4, da rifinire)
export const POSA: readonly [number, number];          // € a pezzo, smontaggio del vecchio compreso: [160, 240]
export const MINIMO_M2: number;                        // 1
export const LIMITI: { min: 40; max: 300; mmDa: 400; mmA: 3000 };   // cm; 400..3000 = probabilmente millimetri
export const QUANTE: { min: 1; max: 20 };
export const ARROTONDA: number;                        // 10 €
export const PORTA: { larghezza: 80; altezza: 210 };  // riferimento di scala
```

`sections/Misura/forbice.ts` (section-builder-misura), **puro e testabile**:

```ts
export interface Forbice { materiale: Materiale; min: number; max: number; totaleMin: number; totaleMax: number }
export function superficie(l: number, h: number): number;                     // m², minimo MINIMO_M2
export function forbici(l: number, h: number, tipo: TipoFinestra, quante: number): Forbice[];
// per pezzo: superficie × euroM2 × coefficiente + POSA; arrotondato a ARROTONDA; totale × quante
export function asse(forbici: readonly Forbice[]): readonly [number, number]; // asse comune dei tre tratti
```

`sections/Misura/valida.ts`:

```ts
export type EsitoMisura =
  | { stato: 'vuoto' }
  | { stato: 'ok'; cm: number }
  | { stato: 'fuori'; cm: number }             // < 40 o > 300 (fuori dai millimetri)
  | { stato: 'millimetri'; cm: number };       // 400..3000: propone cm = valore / 10 ("Usa 118")
export function leggiMisura(testo: string): EsitoMisura;   // accetta "118", "118,5", "118.5", spazi; niente unità
export function contattoValido(testo: string): 'telefono' | 'email' | null;
```

`sections/Misura/scala.ts`: `viewBox` in **centimetri** (porta 80×210 e
finestra alla stessa scala per costruzione), minimo 460×260 cm, cresce se la
finestra non ci sta; linea di terra in basso; porta a sinistra; finestra sul
davanzale del tipo.

`sections/Misura/invio.ts`: `inviaMisure(dati, { ko }): Promise<void>`,
~900 ms, rifiuta con `?invio=ko`. Al successo: `registraTuo()`,
`impostaInvio('sent')`, annuncio, `track('demo_prenotazione', …)` (§7.7).

Il disegno della finestra usa lo stesso gesso della linea (tessera in
maschera) per i lati battuti, un `<path>` per lato con `stroke-dashoffset`
guidato da `battute.progresso(lato)`. Filo molle in errore:
`pathFilo(…, alza)` con `alza` fisso positivo (curva che pende), nessun
cambio di colore (CD §4.4).

### 7.5 Foto (photo-editor, section-builder-foto)

`assets/foto/index.ts` (photo-editor):

```ts
export interface Foto {
  id: string;                      // es. 'scavo', 'platea-ferri', 'chiavi-porta'
  src900: string; src1600: string; // import …?url
  larghezza: number; altezza: number;   // del file 1600 (per aspect-ratio e ritaglio)
  terra: number;                   // 0..1 dall'alto: dove sta la linea di terra (suolo, pavimento, bordo del solaio)
  fuoco: number;                   // 0..1 da sinistra: il centro utile da tenere in vista su schermi stretti
  terraStretto?: number;           // solo se su mobile serve una linea diversa (es. un dettaglio)
  fuocoStretto?: number;
  alt: string;                     // la verità: "Cantiere di un'altra casa: posa dei ferri della platea."
  cosa: string;                    // didascalia breve: cosa si vede (senza autore)
  autore: string; url: string;     // pagina della foto (Unsplash / Openverse / Commons)
  licenza: string;                 // "Unsplash License", "CC BY 2.0", …
}
export const FOTO: Readonly<Record<string, Foto>>;
export const FOTO_DELLE_TAPPE: readonly (string | null)[];   // lunghezza 16; null = piano B "solo lastra"
export const LASTRA: { src800: string; src1600: string };    // texture del getto
```

- `alt` e `cosa` sono dati della foto (li scrive chi la guarda), nel tono del
  copywriter; il copywriter può chiederne la modifica.
- Correzione colore fatta **sui file** (CD §4.3: bianchi verso la calce, neri
  alzati verso il ferro, saturazione −15%, un filo di freddo).
- Pesi: 1600w ≤ **200 KB**, 900w ≤ **90 KB**; texture 1600w ≤ **70 KB**,
  800w ≤ **30 KB** (è un grigio con bolle: comprime molto).

`core/ritaglio.ts` (scaffold):

```ts
export function posizioneSullaTerra(
  foto: { larghezza: number; altezza: number; terra: number; fuoco: number },
  riquadro: { w: number; h: number },
): { x: number; y: number };   // percentuali per object-position con object-fit: cover
```

Con `s = max(w / larghezza, h / altezza)`, altezza scalata `H = altezza·s`:
lo scostamento verticale è `terra·H − h` limitato a `[0, H − h]`, e la
percentuale è `scostamento / (H − h)`; se `H = h`, 50%. Stesso conto in
orizzontale con `fuoco·W − w/2`. Risultato: la linea di terra cade sul bordo
della lastra a ogni misura di finestra; se la foto non ha abbastanza cielo o
terreno per farlo, la più vicina possibile.

`Foto.tsx` (section-builder-foto): due `<img>` sovrapposti A/B (`srcset`
900w/1600w, `sizes="100vw"`, `width`/`height`, `decoding="async"`);
al cambio di `tappa` aspetta `precaricaFoto()` della nuova (decodificata),
poi dissolvenza incrociata di `opacity` (450 ms, 150 ms ridotta; le due foto
sempre sovrapposte, mai bianco o nero in mezzo). Se nel frattempo la tappa è
cambiata di nuovo, salta alla più recente (mai una coda di dissolvenze).
Precarica tappa ±1 in idle dopo ogni fermata. `useRitaglio.ts` applica
`posizioneSullaTerra()` con ResizeObserver sul riquadro.

`core/precarica.ts` (scaffold):

```ts
export function precaricaFoto(f: Foto, larghezzaCss: number, dpr: number): Promise<void>;  // sceglie 900 o 1600, Image + decode; non rifiuta mai
export function precaricaInIdle(ids: readonly string[]): () => void;                       // requestIdleCallback (Safari: setTimeout 300)
```

### 7.6 Modo e zone riservate (`core/modo.ts`, scaffold)

```ts
export const MQ_LARGO = '(min-width: 60em)';
export const MQ_PALCO_LARGO = '(min-width: 60em) and (min-height: 34em)';
export const MQ_PALCO_STRETTO = '(max-width: 59.99em) and (min-height: 34em) and (min-width: 20em)';
export function decidiModo(): { modo: Modo; formato: Formato };
export function ascoltaModo(fn: (m: { modo: Modo; formato: Formato }) => void): () => void;
```

- **Palco largo** (≥ 960 px e altezza ≥ 544 px): fascia 56 px; sotto, foto
  (circa 62% dell'altezza restante) e lastra (il resto, almeno 300 px). Le
  proporzioni esatte le fissa l'art-director come token
  (`--btf-foto-quota`); `layout.css` le usa. Il marchio della fascia parte da
  260 px (zona del bottone del sito).
- **Palco stretto** (< 960 px, altezza ≥ 544 px): fascia 48 px, foto circa
  42 svh, lastra, linea, poi fascia bassa di `64 px + env(safe-area-inset-bottom)`
  con la zona del bottone del sito a sinistra (~210 px) e "Misura e manda" a
  destra (da x = 236 px). Tra 640 e 960 px il bottone del sito è in alto a
  sinistra: la fascia bassa resta (è il posto del richiamo), la zona di
  sinistra resta libera lo stesso per semplicità e coerenza.
- **Documento** (altezza < 544 px, larghezza < 320 px, `@media (scripting: none)`,
  o `?modo=documento`): niente blocco dello scroll, tutto nel flusso: fascia,
  foto (aspect-ratio 3/2), lastra con la tappa attiva, linea, fascia bassa
  non fissa. Le schermate restano a tutto schermo con scroll interno. È il
  modo dello zoom 400% (1280 px a 400% = 320×~200 px CSS).
- `layout.css` ripete le stesse soglie a mano, con un commento che rimanda a
  `core/modo.ts`. **La prima pittura è già giusta senza JS**: il CSS sceglie
  palco o documento dalle media query; `data-modo` serve solo a JS e ai QA.

### 7.7 Analytics

`import { track } from '@/lib/analytics'` (stub dello scaffold, copia del
pilota: `TrackEvent` **chiuso** e firma del sito). Solo due eventi:

| Evento | Quando | Params |
|---|---|---|
| `apri_concept` | una volta per mount (guardia StrictMode), in `Battifilo.tsx` | `{ concept: 14 }` |
| `demo_prenotazione` | al successo dell'invio, in `Misura` | `{ concept: 14, tipo, quante, materiale_visto: materialeVisto ?? 'nessuno' }` |

Mai nome, contatto, comune o misure nei params. Nessun altro evento: non
compila.

---

## 8. Budget di performance

Misurati dal performance-auditor sulla build standalone (sua build in
`qa/dist-performance`, preview su 9141), Lighthouse mobile (Moto G Power, 4G
lento) e desktop.

| Voce | Budget |
|---|---|
| JS del concept (chunk `Concept14`, senza react/react-dom/router) | ≤ **60 KB gz** (atteso 25-35: niente three, lenis, gsap) |
| JS iniziale totale standalone (react + router + concept) | ≤ **110 KB gz** |
| CSS totale del concept | ≤ **24 KB gz** |
| WebGL | **0** (nessun chunk; il budget di 160 KB gz lazy non si usa) |
| SVG in file (tessere, gancio, schema, icone, favicon) | ≤ **16 KB** non gz |
| Font woff2 (latin) | ≤ **100 KB** (§1.3) |
| Foto: prima vista 1440 | ≤ **270 KB** (foto S0 1600w + texture 1600w) |
| Foto: prima vista 375 | ≤ **130 KB** (foto S0 900w + texture 800w) |
| Foto: ogni cambio di tappa | 1 foto (già precaricata in idle) |
| Nodi DOM del palco | ≤ **1 500** (16 tappe sovrapposte + linea + 3 schermate) |
| **LCP** | ≤ **2,5 s** mobile, ≤ 1,5 s desktop. Candidato: la foto di S0 (`loading="eager"`, `fetchpriority="high"`, `width`/`height`; nello standalone `<link rel="preload" as="image" imagesrcset imagesizes>` in `index.html`). Il titolo a stencil non deve essere LCP più tardi della foto: font `swap` + ripiego tarato |
| **CLS** | ≤ **0,02**: righe della griglia del palco fissate da CSS (non dall'immagine), tappe sovrapposte nella stessa cella, riquadro del costo a stencil di larghezza fissa, font di ripiego tarati, foto con `aspect-ratio` in modo documento, fascia bassa sempre presente su stretto |
| **INP** | ≤ **150 ms**: gli handler di input scrivono solo `runtime` e chiamano `ticker.wake()`; il cambio di tappa ri-renderizza 2 `Tappa` (entra/esce), la foto e la radice; la validazione di Misura a ogni tasto è solo `leggiMisura` (puro, microsecondi) e il disegno si aggiorna in rAF |
| TBT | ≤ 150 ms mobile |
| Trascinamento | 60 fps desktop, ≥ 55 su mobile medio a 4× CPU; per frame: ≤ 1 `setProperty`, 1 `setAttribute` (filo), nessuna lettura di layout, nessun `setState` |
| Grandi superfici | ≤ 1 cambio di foto ogni 500 ms (limite anti-lampeggio), dissolvenze ≥ 250 ms |
| Frame a riposo | **0** (ticker fermo) |

Verifica: il performance-auditor registra un profilo di 3 s di trascinamento
avanti e indietro a 390 px con CPU 4× e controlla con "Paint flashing" che la
linea battuta non ridipinga la tessera durante il `clip-path`.

---

## 9. Strategia di caricamento

1. **HTML + CSS = prima pittura completa.** Il componente rende tutto il
   DOM: fascia, foto di S0 nel livello A, lastra con le 16 tappe (solo la 0
   visibile), la linea con la cassetta a 0 e il primo tratto **non** ancora
   battuto, le tre schermate chiuse. Il CSS sceglie palco o documento (§7.6).
   `data-pronto="0"` fino al mount: nessuna transizione sulla prima pittura.
   Il fondo ferro è inline in `index.html` (standalone) e sulla radice; la
   texture della lastra è un `background-image` con la tinta piena sotto,
   quindi prima che arrivi la lastra è già del colore giusto (niente salto di
   contrasto: la texture sta entro ±6% di luminosità, CD §4.1).
2. **Mount** (`Battifilo.tsx`, nell'inizializzatore di `useState` e in
   `useLayoutEffect` prima della pittura, con guardia `typeof window`):
   `runtime.reset()`, `inizializzaStore({ search, hash, reducedMotion })`
   (`?mese=`, vista dall'hash, `battifilo:tuo`, `battifilo:istruzione`,
   `?invio=ko`, `?oggi=`, `?misura=`), `decidiModo()`, cassetta **subito**
   alla tappa dell'URL (nessun volo d'arrivo). Poi: `track('apri_concept')`,
   `document.title`/meta da `META` (ripristinati allo smontaggio), fondo su
   html/body, `injectFonts()`, `ticker.attiva()`, `osservaViewport()`,
   `core/pagina.ts` (in palco: `overflow: hidden` e
   `overscroll-behavior: none` su html/body; ripristino esatto allo
   smontaggio e al passaggio a documento), `ascoltaUrl` (popstate),
   `impostaOggi()`, `data-pronto="1"`.
3. **Apertura** (CD §4.2): se la tappa iniziale è 0 e nessuna preferenza di
   riduzione, dopo `ATTESA_APERTURA` (600 ms) `useCassetta` fa
   `vaA(1)` + battuta, una volta sola (`segnaApertura`). Con reduced motion o
   `?mese=` il primo tratto è già battuto e la cassetta ferma dove deve.
   Nessun preloader, nessuna attesa dei font.
4. **Font**: `display=swap` + `@font-face` di ripiego tarati.
5. **Foto**: S0 `eager` + `fetchpriority="high"`; dopo l'evento `load` della
   pagina, in idle, precarico e decodifica delle tappe 1 e 2 (la cassetta
   andrà lì per prima); a ogni fermata, tappa ±1. Le foto di `Mesi` sono
   `loading="lazy"` 900w. Con `saveData`: niente precarico in idle, solo la
   foto della tappa richiesta.
6. **Misura**: il codice è nel chunk del concept (è piccolo: dati + calcolo +
   SVG); nessun `import()` separato, perché `#misura` può essere la prima
   schermata aperta (link diretto dalle inserzioni).
7. **Reduced motion**: cassetta a salto secco, niente battuta animata (la
   linea compare già battuta), niente oscillazione del filo, niente polvere,
   foto in dissolvenza di 150 ms, scheda senza spostamento, finestra di
   Misura disegnata intera. Il trascinamento resta (è un controllo), la
   rotella resta a scatti.
8. **Pausa**: `visibilitychange` → ticker fermo.
9. **Smontaggio** (navigazione nel sito vero): ticker fermo, listener tolti
   (wheel non passivo compreso), html/body ripristinati (overflow,
   overscroll, fondo), `<link>` dei font tolto solo se aggiunto da noi,
   titolo e meta ripristinati, `history.state` intatto.

### 9.1 Senza JavaScript / prerender

Il prerender del sito rende l'HTML senza browser: nessun modulo tocca
`window`, `document`, `localStorage`, `matchMedia`, `history`,
`performance`, `Image`, `ResizeObserver` a livello di modulo (solo in
effetti, handler, o funzioni chiamate da effetti). Senza JS
(`@media (scripting: none)`): modo documento, S0 con la sua foto, e **la
schermata Mesi mostrata nel flusso** sotto la lastra (tutti i 14 mesi con
costi e fermi, `<ol>`), poi il cartello con recapiti e "Apri in Maps". La
linea è visibile ma inerte; "Misura e manda" è un link `#misura` che porta
alla schermata con istruzioni e il numero di esempio (niente disegno).

### 9.2 Fallback

Non c'è WebGL, quindi non c'è un fallback grafico da mantenere. I casi
limite gestiti:
- **mask-image non supportato** (browser vecchi): `@supports not (mask-image: url(x))`
  → tratto cobalto pieno 5 px con bordo sfumato in `linear-gradient`
  (art-director in `lastra.css`, section-builder-linea lo applica);
- **foto che non si carica**: `onError` → la tappa passa a "solo lastra"
  (`data-foto="no"`), la fase marcata grande a stencil (piano B del CD), mai
  un'icona di immagine rotta;
- **storage bloccato**: `persist.ts` restituisce `null` / `false`, il sito
  funziona uguale (niente "TU", l'istruzione ricompare);
- **dispositivo lento** (`saveData` o `hardwareConcurrency ≤ 4` e puntatore
  grosso): niente polvere, dissolvenza foto 250 ms.

---

## 10. Porting nel sito

- Dentro `battifilo/` **nessun import fuori da `battifilo/`** tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` e `react`.
- Asset importati con `?url` / `?raw` di Vite, mai da `public/`.
- `ConceptBackButton` e `analytics` dello standalone **non** si copiano.
- Il preload della foto S0 di `index.html` non esiste nel sito: lì l'HTML del
  prerender contiene già l'`<img>` con `fetchpriority="high"`.
- Nessun Lenis globale nel sito (`integrazione-sito.md` punto 4): non ci
  riguarda.
- `?mese=` e l'hash convivono con React Router: `core/url.ts` usa
  `history.replaceState/pushState(history.state, '', …)` e non tocca mai
  `location.hash` direttamente.
- Si portano: `src/pages/Concept14.tsx` e `src/pages/concepts/battifilo/`.
  Poi rotta, `site.ts`, prerender, sitemap e immagine della vetrina come nel
  pilota (RIEPILOGO del pilota, punto 1). Crediti delle foto nel cartello e
  in `Mesi` (già nel codice).

---

## 11. Comandi

Dalla cartella `concepts/14-battifilo/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | `vite --port 9140 --strictPort` → http://localhost:9140/concept-14 (`/` e `*` → `/concept-14`) |
| `npm run build` | build in `dist/` |
| `npm run preview` | `vite preview --port 9141 --strictPort` (fallback SPA: `/concept-14` regge il ricaricamento) |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` (stesso comando del sito) |
| `npm run typecheck:node` | typecheck di `vite.config.ts` e `scripts/` |
| `npm run lint` | `eslint src` |
| `npm run check` | typecheck + lint + build: **verde prima di dire "fatto"** |
| `npm run size` | `node scripts/size.mjs`: pesi gz di JS e CSS di `dist/` contro §8 |
| `node scripts/contrasti.mjs` | (art-director) tabella dei contrasti WCAG dei token |

Porta personale: tabella di §4, `npx vite --port 914x --strictPort`; chiudere
il proprio server alla fine, mai uccidere processi altrui.

Parametri di prova (`core/params.ts`):

| URL | Effetto |
|---|---|
| `/concept-14?mese=8` | apre sul mese 8 (impianti), linea battuta fino a lì, niente apertura automatica |
| `/concept-14?mese=15` | le chiavi |
| `/concept-14#misura` · `#cartello` · `#mesi` | apre la schermata |
| `/concept-14?misura=118x142&tipo=due-ante#misura` | Misura con le due misure già scritte (screenshot dei disegni) |
| `/concept-14?invio=ko#misura` | invio simulato che fallisce |
| `/concept-14?oggi=2026-10-05` | data fissa per la marcatura di successo (screenshot stabili) |
| `/concept-14?modo=documento` | forza il modo documento |
| `/concept-14?motion=ridotto` | forza reduced motion (per i QA senza toccare il sistema) |

Per svuotare la memoria del concept:
`localStorage.removeItem('battifilo:tuo'); sessionStorage.removeItem('battifilo:istruzione')`.

Screenshot: regole di `docs/lab-operativo.md` (font di Google serviti con
`page.route` + curl, `document.fonts.ready`, scatti della **finestra**).
Niente args SwiftShader: niente WebGL. Per le foto, attendere anche
`img.decode()` del livello visibile prima di scattare.

---

## 12. Checklist per chi scrive codice

- `design-taste-frontend` e `full-output-enforcement`: niente file troncati,
  niente placeholder, niente TODO.
- Solo i tuoi file (§4). Ciò che è condiviso passa da store, runtime,
  `core/tempo.ts`, `core/ritaglio.ts`, controller e token: non duplicare
  costanti, date o conti.
- Nessun `requestAnimationFrame`, `setInterval`, animazione JS o `setState`
  per frame fuori dal ticker; nessuna lettura di layout nel ticker.
- Variabili CSS scritte da JS solo sugli elementi foglia `data-btfvar` di §5,
  solo quando il valore cambia.
- Nessun hex fuori da `styles/tokens.*`; nessun testo visibile fuori da
  `content/*` (e da `assets/foto/index.ts` per `alt`/`cosa`).
- Nessun accesso al browser a livello di modulo.
- Niente nelle zone del bottone del sito (§7.6); niente testo sopra le foto.
- Cassetta `role="slider"` con `aria-valuetext` parlante aggiornato alla
  fermata; tacche e buchi raggiungibili da tastiera; `aria-live` solo per la
  fase alla fermata e l'esito dell'invio.
- Target ≥ 44 px (cassetta, tacche su mobile, meno/più, mese prima/dopo).
- Reduced motion rispettato; niente lampeggi (≤ 1 cambio di grande
  superficie ogni 500 ms).
- Prima di consegnare: `npm run check` verde e zero errori in console a 1440 e
  375.

---

## Richieste ad altri agent

- **ux-architect** (ondata 1, in parallelo): confermare o correggere in
  `ux-architect.md` gli stati dell'URL di §7.6 e §11 (`?mese=N` con
  `replaceState`, `#misura` / `#cartello` / `#mesi` con `pushState`, così il
  tasto indietro chiude la schermata senza passare per 15 mesi); la regola
  "in modo documento sulla lastra c'è solo la tappa attiva, la cronaca
  completa è la schermata Mesi"; il limite di **un cambio di foto ogni
  500 ms** durante il trascinamento (il CD ne permette 3 al secondo, la regola
  anti-lampeggio di `docs/ruoli-agent.md` ne permette 2: vale la più severa). Se la sua
  "Sezioni da costruire" usa nomi diversi dai nove di §4, l'orchestratore
  allinea i nomi degli agent a quelli di questo documento o aggiorna §4.
- **copywriter** (ondata 2): in `content/cantiere.ts` ogni mese ha `anno`,
  `mese` (1-12) e i fermi con `giornoDa`, `giornoA`, `motivo`: servono a
  `calcolaBuchi()`. Il bilancio delle chiavi (`BILANCIO`) con preventivo,
  finale e le due varianti, come dati.
- **photo-editor + art-director** (ondata 2): `terra` e `fuoco` misurati
  guardando ogni foto (non stimati), con una prova a 375×812, 1440×900 e
  2560×1440 usando la formula di §7.5.
