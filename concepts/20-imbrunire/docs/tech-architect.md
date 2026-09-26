# Tech architect · Concept 20 · IMBRUNIRE

Ondata 1. Documento vincolante per le ondate 2 e 3 su stack, cartelle, file di
competenza, contratti tra moduli, stato condiviso, budget, caricamento e
comandi. Dove questo documento e `concepts/10-torchio/docs/integrazione-sito.md`
sono in conflitto vale `integrazione-sito.md`.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`,
riga e paragrafo 20 di `docs/matrice-concept-11-20.md`,
`concepts/20-imbrunire/docs/creative-director.md` (tutto, in particolare §5.3,
§6, §7, §9, §10, §12), `concepts/10-torchio/docs/tech-architect.md` e
`scaffold-engineer.md` (come formato e architettura), e il codice del pilota
(`vite.config.ts`, `App.tsx`, `Concept10.tsx`, `lib/analytics.ts`,
`components/ConceptBackButton.tsx`, `index.html`, `.gitignore`).
Registry npm verificato il 2026-09-26 con `npm view`; Node disponibile 22.22.

Abbreviazioni: **CD** = creative-director di questo concept; tutti i percorsi di
codice sotto sono relativi a `src/pages/concepts/imbrunire/` salvo dove scritto.

---

## 0. Decisioni chiave in breve

1. **App autonoma Vite 5 + React 18 + React Router 6 + TS** in
   `concepts/20-imbrunire/`, stessa forma del pilota: tutto il concept in
   `src/pages/concepts/imbrunire/`, `src/pages/Concept20.tsx` sottile. Il porting
   è copiare quella cartella e `Concept20.tsx`.
2. **Niente WebGL, niente three, niente R3F, niente GSAP, niente lenis.** Il CD
   lo esclude (§11, §12) e non serve: la scena è CSS 3D (scatole con
   `preserve-3d`), le animazioni sono transizioni CSS e Web Animations API, lo
   scorrimento è nativo. Su desktop la pagina **non scorre** (è un luogo con
   stati), sotto la soglia "torre" scorre in verticale in modo nativo (CD §10).
3. **Un router a hash interno al concept** (`core/rotta.ts`) costruito sopra
   `useLocation`/`useNavigate` di react-router: la rotta del sito resta
   `/concept-20`, gli stati (`#/stanza/il-camino`, `#/lune?dal=…`) cambiano solo
   l'hash, il tasto indietro del browser funziona sempre.
4. **Due strati per entrare in una stanza**: il palazzo (celle con scatole 3D
   piccole) e lo strato **Dentro** (fisso, a tutto schermo, con la sua scatola
   della stessa stanza). La telecamera anima il palazzo verso la cella e poi
   consegna allo strato Dentro. Così la foto dentro è a 1600 px, il taglio 3:4
   del mobile funziona, e il pannello non vive dentro un livello scalato.
5. **Stato lento in uno store con `useSyncExternalStore`** (vista, notti scelte,
   camera, luci, prenotazione); **valori caldi** (puntatore, trascinamento del
   nastro, parallasse) in un oggetto mutabile letto da **un solo ticker** con
   fasi `read → update → write → render`.
6. **Le luci sono solo opacità.** Acceso/spento = opacità di due veli sopra la
   foto (velo notte e velo di luce), in transizione CSS; mai `filter` animato,
   mai opacità sull'elemento `preserve-3d`. Le accensioni in sequenza si fanno
   con `transition-delay` per cella, non con timer.
7. **Moduli puri testati**: `luna/*` (Meeus cap. 49, fasi alle 21:00 di
   Europe/Rome, disegno del disco), `dati/disponibilita.ts` (seme
   deterministico), `core/rotta.ts` (parse/format dell'hash). Test con Vitest
   in `test/`, **fuori** dalla cartella che si porta.
8. **Nessun accesso a window/document/storage/matchMedia a livello di modulo**:
   il sito fa prerender. Nel prerender si vede il palazzo, le lune del nastro
   sono dischi vuoti, la luna di stasera appare dopo il montaggio.

---

## 1. Stack esatto

### 1.1 Dipendenze (versioni esatte nel `package.json` standalone)

| Pacchetto | Versione | Note |
|---|---|---|
| `react`, `react-dom` | `18.3.1` | come il sito |
| `react-router-dom` | `6.30.6` | nello standalone: `BrowserRouter`, `Routes`, `Route`, `Navigate`, `lazy`; nel concept solo `useLocation` e `useNavigate` (in `core/rotta.ts`) |

Nient'altro a runtime.

### 1.2 Dev

| Pacchetto | Versione | Note |
|---|---|---|
| `vite` | `5.4.21` | |
| `@vitejs/plugin-react` | `4.7.0` | |
| `typescript` | `5.6.3` | |
| `@types/react` / `@types/react-dom` | `18.3.31` / `18.3.7` | |
| `@types/node` | `22.20.4` | solo `vite.config.ts` e test |
| `vitest` | `2.1.9` | ultima 2.x, `peer vite ^5`; solo per `test/`, non si porta |
| `eslint`, `@eslint/js` | `9.39.5` | |
| `typescript-eslint` | `8.70.1` | |
| `eslint-plugin-react-hooks` | `5.2.0` | |
| `eslint-plugin-react-refresh` | `0.4.26` | |
| `globals` | `15.15.0` | |

**Non installati di proposito**: `three`, `@types/three`, `@react-three/*`,
`lenis`, `gsap`, Tailwind, librerie di stato, librerie di date (`date-fns`,
`dayjs`: bastano `Intl` e l'aritmetica sulle date civili di `core/date.ts`),
librerie astronomiche (`suncalc`, `astronomy-engine`: il CD vuole Meeus con i
suoi casi di prova, e sono 3-4 KB nostri contro 30-100 KB), `@fontsource`.

### 1.3 Font

Google Fonts, `<link>` iniettato in `useEffect` (come i Concept 1-9), più
`preconnect` a `fonts.googleapis.com` e `fonts.gstatic.com`:

```
https://fonts.googleapis.com/css2?family=Commissioner:wght@400..600&family=Marcellus&display=swap
```

Solo latin (automatico con `unicode-range`), nessun corsivo. L'URL esatto vive
in `styles/tokens.ts` (`FONT_CSS_URL`, art-director), lo inietta
`core/fonts.ts` (scaffold). L'art-director definisce in `tokens.css` due
`@font-face` di ripiego locali con `size-adjust` / `ascent-override` tarati su
Marcellus e Commissioner, così il cambio font non sposta nulla (CLS).

### 1.4 Ambiente

- Alias `@/` → `src/` in `vite.config.ts` e `tsconfig.app.json` (`paths`).
- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `jsx: react-jsx`, `moduleResolution: bundler`,
  `types: ["vite/client"]`, `include: ["src"]`.
- `tsconfig.test.json`: estende l'app, `include: ["test"]`,
  `types: ["vite/client", "node"]` (i test importano `describe/it/expect` da
  `vitest`, niente globali).
- Dev server porta **9200** (`strictPort`), preview **9201** (vedi §11 per le
  porte di ogni agent).
- Target build `es2020`. Chunk manuale solo per `react` (+ `scheduler`,
  `react-router`), il resto nel chunk `Concept20`.

---

## 2. Scelte motivate

### 2.1 CSS 3D invece di WebGL

La scena è fatta di dieci scatole a cinque facce con una foto sul fondo, più
poché, scala e tetto: tutto rettangoli. CSS 3D dà gratis quello che in WebGL
costerebbe molto codice: testo vero e accessibile, fuoco, `srcset`, `alt`,
`object-fit`, clic sulle celle, stampa, zoom al 400%. Il peso resta sotto i
40 KB gz totali del concept. Nessun fallback "senza WebGL" da mantenere:
`transform-style: preserve-3d` è supportato da tutti i browser di destinazione;
dove il 3D non si compone (casi limite, vedi §7.4) la stanza resta leggibile
perché la foto è comunque sul fondo e il fronte è aperto.

### 2.2 Niente GSAP e niente lenis

Movimenti ammessi dal CD (§12): accensione iniziale, luci su/giù, entrata e
uscita, carrello tra stanze vicine, scala, nastro, luna del successo,
parallasse ≤ 2° del tetto.

| Movimento | Come si fa |
|---|---|
| Accensione iniziale | stato `accensione: 'in-corso'` + `transition-delay` per cella da `motion/choreography.ts` (variabile CSS `--imb-luce-ritardo` scritta una volta in render). Nessun timer |
| Luci su/giù | attributo `data-imb-luce="accesa|spenta"` sulla cella; opacità dei veli in transizione CSS (1200-1400 ms) con ritardo sfalsato (120 ms) |
| Entrata / uscita / carrello / scala | Web Animations API (`el.animate`) su `transform` del palazzo e delle facce dello strato Dentro: compositore, promesse `finished`, `reverse()` e `cancel()` esatti. In `motion/camera.ts` |
| Nastro | scorrimento nativo (`overflow-x: auto`); inerzia del trascinamento dello spazio vuoto e scorrimento al bordo durante la selezione nel ticker |
| Luna del successo | dissolvenza incrociata CSS di due `<Luna/>` |
| Parallasse del tetto | lerp nel ticker su `runtime.puntatore`, variabile CSS `--imb-parallasse` scritta solo sull'elemento foglia `data-imb-var` del tetto, solo se cambia |

Nessun movimento richiede timeline annidate o ScrollTrigger. Lenis non serve:
su desktop non c'è scroll di pagina, su mobile il CD chiede scroll nativo
(§10). Se il motion-designer dimostrasse un caso che non si regge, `gsap@3.15.0`
si aggiunge solo nel chunk che lo usa e va detto a Luca (il sito non lo ha).

### 2.3 Un solo ciclo rAF

`core/ticker.ts` è l'unico `requestAnimationFrame` del concept. Ordine in ogni
frame:

1. **read**: letture di layout indispensabili (rettangolo del nastro al bordo
   durante la selezione, `scrollLeft` del nastro);
2. **update**: lerp della parallasse, inerzia e scorrimento al bordo del
   nastro, posizione del foglio mobile durante il trascinamento, fusione degli
   eventi puntatore del nastro in **al massimo un aggiornamento di stato per
   frame**;
3. **write**: variabili CSS sugli elementi `data-imb-var` (solo se cambiate),
   `scrollLeft` del nastro;
4. **render**: fase tenuta per uniformità con gli altri concept; qui non la usa
   nessuno (niente canvas). Resta nell'API.

Nessun altro modulo chiama `requestAnimationFrame` o `setInterval` per
animare (le WAAPI e le transizioni CSS non sono cicli nostri). Il ticker si
ferma quando nessuna funzione chiede un altro frame, e sempre con la scheda
nascosta.

### 2.4 Router a hash sopra react-router

Il CD vuole un indirizzo per ogni stato e il tasto indietro sempre valido. Il
sito usa `BrowserRouter`: se il concept scrivesse `history.pushState` da solo,
lo stato interno di react-router resterebbe vecchio e un `navigate` successivo
(anche del sito) lo riscriverebbe. Quindi `core/rotta.ts` usa `useLocation()`
per leggere e `useNavigate()` per scrivere, sempre con
`{ pathname: location.pathname, search: location.search, hash }` (un `to` con
solo `hash` in react-router 6 **perde la query**, per esempio `?invio=ko`).
Nel prerender `useLocation` funziona e l'hash è vuoto: si rende il palazzo.

### 2.5 Due strati: palazzo e Dentro

Zoomare la sola cella non basta: su 375 px la cella è larga e bassa (≈ 56%
della larghezza) e lo schermo è alto; scalare la cella non lo copre mai in 3:4
(CD §10). E una foto da 480 px scalata ×4 è sgranata. Quindi:

- **Palazzo**: celle con scatole 3D piccole, foto 480/900 px.
- **Dentro**: strato `position: fixed` a tutto schermo con **una** scatola 3D
  della stanza scelta (stessa componente `Scatola`, `modo="dentro"`), foto 1600
  px (`sizes="100vw"`), pannello della stanza.
- **La telecamera** (motion-designer, `motion/camera.ts`): il palazzo trasla e
  scala verso la cella (FLIP) e, nello stesso tempo, lo strato Dentro parte dal
  rettangolo della cella (scala e posizione calcolate) e arriva a tutto
  schermo con la parete di fondo che avanza in `translateZ`. Visivamente è una
  sola camminata; tecnicamente sono due livelli composti. L'uscita è l'inverso
  esatto. Con reduced motion: dissolvenza incrociata di 250 ms tra i due
  strati (CD §6.6).

---

## 3. Struttura delle cartelle

Legenda: **[S]** solo app standalone, non si porta. **[P]** si porta nel sito.
Tra parentesi il proprietario (dettagli in §4).

```
concepts/20-imbrunire/
├─ DESIGN.md                                    [S*] (art-director)  resta nel repo come documento
├─ docs/                                        [S]  un .md per agent
├─ qa/                                          [S]  screenshot di QA (ignorati da git)
├─ package.json  package-lock.json              [S]  (scaffold)
├─ vite.config.ts                               [S]  (scaffold)  alias @, dev 9200, preview 9201, chunk react
├─ vitest.config.ts                             [S]  (scaffold)  environment 'node', include test/**/*.test.ts, TZ=UTC
├─ tsconfig.json  tsconfig.app.json  tsconfig.node.json  tsconfig.test.json  [S] (scaffold)
├─ eslint.config.js  .gitignore                 [S]  (scaffold)
├─ index.html                                   [S]  (scaffold)  lang="it", color-scheme dark, fondo notte inline, preconnect font
├─ public/
│  └─ favicon.svg                               [S]  (vector-artist)
├─ test/                                        [S]  (scaffold)  fuori dal porting: il sito non ha vitest
│  ├─ luna.test.ts                              i 4 casi del CD §7.4 passo 5 + notti etichettate + frazione/crescente
│  ├─ disponibilita.test.ts                     stabilità del seme, quote weekend/settimana, chiusura gennaio, proposte vicine
│  ├─ rotta.test.ts                             parse/format dell'hash, andata e ritorno, valori non validi
│  └─ date.test.ts                              aritmetica civile attraverso i cambi d'ora (29/03 e 25/10/2026)
└─ src/
   ├─ main.tsx                                  [S]  (scaffold)
   ├─ App.tsx                                   [S]  (scaffold)  /concept-20 lazy; / e * → Navigate
   ├─ vite-env.d.ts                             [S]  (scaffold)
   ├─ lib/analytics.ts                          [S]  (scaffold)  copia dello stub del pilota
   ├─ components/ConceptBackButton.tsx          [S]  (scaffold)  copia fedele del pilota
   └─ pages/
      ├─ Concept20.tsx                          [P]  (scaffold)  export default () => <Imbrunire/>
      └─ concepts/imbrunire/                    [P]  TUTTO il concept
         ├─ index.ts                            (scaffold)  export { default } from './Imbrunire'
         ├─ Imbrunire.tsx                       (scaffold)  radice .imb-root, montaggio, ordine degli strati (§6.4)
         │
         ├─ core/                               (scaffold)
         │  ├─ ticker.ts                        unico rAF (§2.3)
         │  ├─ capabilities.ts                  prefersReducedMotion + ascolto, isCoarsePointer, saveData
         │  ├─ layout.ts                        MQ_SEZIONE, leggiLayout(), ascoltaLayout()
         │  ├─ viewport.ts                      runtime.viewport su resize e visualViewport
         │  ├─ fonts.ts                         injectFonts(), fontsReady()
         │  ├─ links.ts                         LAB_URL, MAPS_URL, TELEFONO_URL, EMAIL_URL
         │  ├─ rotta.ts                         router a hash (§6.3)
         │  ├─ date.ts                          date civili Europe/Rome (§6.5)
         │  ├─ scena.ts                         registro degli elementi della scena per la telecamera (§6.6)
         │  ├─ annunci.ts                       annuncia(testo) → regione aria-live unica della radice
         │  └─ foto.ts                          precaricaFoto(slug, misura), srcsetDi(slug), stato di caricamento
         │
         ├─ state/                              (scaffold)
         │  ├─ store.ts                         store lento + azioni + selettori (§6.1)
         │  ├─ runtime.ts                       valori caldi (§6.2)
         │  └─ persist.ts                       session/localStorage con try/catch
         │
         ├─ luna/                               (scaffold)  puro, senza window
         │  ├─ roma.ts                          istanteRoma(dataISO, ora, minuti) → ms UTC; partiRoma(ms)
         │  ├─ meeus.ts                         fasePrincipale(k, tipo) → JDE; jdeAUtc(); ΔT = 69 s documentato
         │  ├─ fasi.ts                          lunaDellaNotte(dataISO) → InfoLuna; lunePerIntervallo(dal, n)
         │  ├─ disegno.ts                       pathLuna(p, r) → stringa `d` SVG (disco + terminatore)
         │  ├─ Luna.tsx                         <Luna info r etichetta?/>: svg con due path, classi imb-luna__*
         │  └─ index.ts                         re-export
         │
         ├─ dati/                               (scaffold)  puro
         │  ├─ palazzo.ts                       pianta: piani, celle, slug, tipo, larghezze relative, vicini, scala
         │  ├─ disponibilita.ts                 seme deterministico, occupata(), libereNelle(), proposteVicine(), nottiLibereVicine()
         │  └─ prezzo.ts                        prezzoNotte(), totaleSoggiorno(), prezzoDa() da content/prezzi.ts
         │
         ├─ motion/                             (motion-designer)
         │  ├─ easing.ts                        curve (funzioni + stringhe cubic-bezier)
         │  ├─ choreography.ts                  durate, ritardi, ordine di accensione, sfalsamenti, soglie
         │  ├─ camera.ts                        entra(), esci(), carrello(), scala(), annullaCamera() (§6.7)
         │  ├─ useParallasse.ts                 tetto ≤ 2°, solo desktop e puntatore fine
         │  └─ variabili.ts                     variabiliMotion(ridotto) → stile inline della radice (durate/easing come CSS var)
         │
         ├─ interaction/                        (interaction-designer)
         │  ├─ useCelleTastiera.ts              roving tabindex spaziale sul palazzo (← → ↑ ↓, Home/Fine, Invio, Esc)
         │  ├─ useSelezioneLune.ts              trascinamento, tocco + tocco, tastiera del listbox (§6.8)
         │  ├─ useNastroScorrimento.ts          rotella orizzontale, spazio vuoto trascinabile, frecce, inerzia
         │  ├─ useFoglio.ts                     foglio dal basso trascinabile (pannello stanza e nastro su mobile)
         │  ├─ useSwipeUscita.ts                swipe verso il basso per uscire dalla stanza (mobile)
         │  ├─ useCaloreCella.ts                hover/focus: velatura +8% e "da … a notte" (400 ms), precarica la foto 1600
         │  └─ interaction.css                  stati :hover/:focus-visible/:active, anello di fuoco, aree di tocco
         │
         ├─ content/                            (copywriter)
         │  ├─ testi.ts                         tutti i testi, per sezione, per slug; META; RECAPITI
         │  └─ prezzi.ts                        prezzi di esempio per stanza, maggiorazione weekend, tassa, letto aggiunto
         │
         ├─ styles/
         │  ├─ tokens.css                       (art-director) variabili --imb-*, @font-face di ripiego
         │  ├─ tokens.ts                        (art-director) COLORI, FONT_CSS_URL, FONT_DA_CARICARE, misure numeriche per JS
         │  ├─ luna.css                         (art-director) .imb-luna, disco in ombra, luce, anello "stasera"
         │  ├─ base.css                         (scaffold) radice, reset scoped, tipografia base, .imb-sr, .imb-salto
         │  └─ layout.css                       (scaffold) strati fissi, z-index, .imb-main, zone libere del ConceptBackButton
         │
         ├─ assets/
         │  ├─ svg/                             (vector-artist) icone di servizio + index.ts
         │  └─ foto/                            (photo-editor) *.webp in 3 misure + index.ts (§6.9)
         │
         └─ sections/
            ├─ Cielo/     Cielo.tsx  cielo.css  Testata.tsx  testata.css                        (section-builder-cielo)
            ├─ Palazzo/   Palazzo.tsx  palazzo.css  Cella.tsx  Scatola.tsx  scatola.css
            │             Tetto.tsx  Scala.tsx                                                   (section-builder-palazzo)
            ├─ Stanza/    Stanza.tsx  stanza.css  PannelloStanza.tsx  Porte.tsx  useCamera.ts   (section-builder-stanza)
            ├─ Lune/      Lune.tsx  lune.css  Nastro.tsx  RigaStato.tsx  ScriviDate.tsx          (section-builder-lune)
            ├─ Prenota/   PannelloPrenota.tsx  prenota.css  OraArrivo.tsx  Successo.tsx
            │             successo.css  invio.ts  ics.ts                                         (section-builder-prenota)
            ├─ Spazi/     Androne.tsx  Colazione.tsx  Portico.tsx  Strada.tsx  spazi.css         (section-builder-spazi)
            └─ Elenco/    Elenco.tsx  elenco.css                                                 (section-builder-elenco)
```

### 3.1 Sezioni e nomi del creative-director

Le cartelle seguono le schermate del CD §5.3 e le parti della prenotazione di
§7. Se l'ux-architect le chiama in modo diverso nella sua lista "Sezioni da
costruire", **si tiene questa mappa** e cambiano solo i testi:

| Cartella / builder | Schermate e parti del CD |
|---|---|
| `cielo` | cielo notte, luna di stasera (e luna della prima notte dopo il successo), testata fissa: nome dell'albergo in alto al centro, bottone "Scegli le lune" in alto a destra, barretta in basso su mobile dopo il primo scroll (§5.3, §10) |
| `palazzo` | Il palazzo (`#/`): tetto con comignoli e frase di chi siamo sotto il cornicione, poché, tre piani, dieci celle con scatole 3D e luci, scala a destra, portico; torre su mobile con binario della scala; vista ridotta a tre piani interi quando il nastro è aperto su mobile (§2, §5.3, §6.1, §6.4, §10) |
| `stanza` | Dentro una camera (`#/stanza/<slug>`) e contenitore dello strato Dentro anche per gli spazi comuni: telecamera, pannello della stanza, seconda foto ("guarda la finestra"), porte laterali, scala ↑ ↓ ai pianerottoli, "Torna al palazzo", Esc, swipe giù (§6.2, §6.3, §6.5) |
| `lune` | Le lune aperte (`#/lune`): nastro nel cielo (desktop) o nel foglio dal basso (mobile), gesto, tastiera, "Scrivi le date", riga di stato `aria-live`, errori di selezione, "siamo pieni" con proposte vicine, filtro di una stanza (§7.2, §7.3, §7.7) |
| `prenota` | Il pannello di prenotazione dentro la stanza (totale, quanti siete, ora d'arrivo a finestre, nome, contatto, nota), invio simulato, errori, invio fallito, successo (luci, frase, .ics, torna al palazzo) (§7.5, §7.7) |
| `spazi` | L'androne (`#/androne`, iscrizione e regole), la colazione (`#/colazione`), il portico (`#/portico`, a piedi da qui, Apri in Maps) e la strada sotto il palazzo come piede (nota "attività inventata", recapiti come link) (§5.3) |
| `elenco` | Le stanze in elenco (`#/elenco`), con libera/occupata quando ci sono notti scelte (§9) |

---

## 4. File di competenza esclusiva

Regola: **ogni file ha un solo proprietario**. Tutti possono leggere e
importare tutto. Chi ha bisogno di una modifica in un file altrui la scrive
nel proprio `docs/<agent>.md`, sezione "Richieste ad altri agent".

**Stub**: lo scaffold crea i componenti di sezione con la **firma definitiva**
(§6.10) e un corpo minimo, perché il build sia verde dal primo minuto. A fine
scaffold la proprietà passa al builder indicato, che **non cambia la firma**
senza una richiesta (altri builder importano quei componenti).

### Ondata 2

| Agent | File esclusivi | Cosa NON tocca |
|---|---|---|
| **art-director** | `DESIGN.md`, `docs/art-director.md`, `styles/tokens.css`, `styles/tokens.ts`, `styles/luna.css` | CSS delle sezioni, `base.css`, `layout.css` |
| **motion-designer** | `docs/motion-designer.md`, `motion/easing.ts`, `motion/choreography.ts`, `motion/camera.ts`, `motion/useParallasse.ts`, `motion/variabili.ts` | il ticker (usa la sua API), CSS delle sezioni |
| **interaction-designer** | `docs/interaction-designer.md`, `interaction/*` (i sette file di §3) | niente cursore custom, niente preloader, niente testo magnetico (CD §11) |
| **copywriter** | `docs/copywriter.md`, `content/testi.ts`, `content/prezzi.ts` | nessun testo scritto nei componenti |
| **vector-artist** | `docs/vector-artist.md`, `assets/svg/*`, `public/favicon.svg` | niente facciate, mattoni, persiane, chiavi, lune disegnate, figure umane (CD §11) |
| **photo-editor** | `docs/photo-editor.md`, `assets/foto/*.webp`, `assets/foto/index.ts` | niente filtri CSS; niente immagini generate (CD §8.4) |
| **webgl-artist** | non partecipa (nessun WebGL) | |

### Ondata 3

| Agent | File esclusivi |
|---|---|
| **scaffold-engineer** (prima, da solo) | `docs/scaffold-engineer.md`; tutti i file **[S]** di §3 tranne `DESIGN.md`, `docs/*` altrui e `public/favicon.svg`; `test/*`; `src/pages/Concept20.tsx`; `imbrunire/index.ts`, `imbrunire/Imbrunire.tsx`; `core/*`; `state/*`; `luna/*`; `dati/*`; `styles/base.css`, `styles/layout.css`; stub iniziali di `sections/*/*` (poi passano ai builder) |
| **section-builder-cielo** | `sections/Cielo/Cielo.tsx`, `cielo.css`, `Testata.tsx`, `testata.css`, `docs/section-builder-cielo.md` |
| **section-builder-palazzo** | `sections/Palazzo/Palazzo.tsx`, `palazzo.css`, `Cella.tsx`, `Scatola.tsx`, `scatola.css`, `Tetto.tsx`, `Scala.tsx`, `docs/section-builder-palazzo.md` |
| **section-builder-stanza** | `sections/Stanza/Stanza.tsx`, `stanza.css`, `PannelloStanza.tsx`, `Porte.tsx`, `useCamera.ts`, `docs/section-builder-stanza.md` |
| **section-builder-lune** | `sections/Lune/Lune.tsx`, `lune.css`, `Nastro.tsx`, `RigaStato.tsx`, `ScriviDate.tsx`, `docs/section-builder-lune.md` |
| **section-builder-prenota** | `sections/Prenota/PannelloPrenota.tsx`, `prenota.css`, `OraArrivo.tsx`, `Successo.tsx`, `successo.css`, `invio.ts`, `ics.ts`, `docs/section-builder-prenota.md` |
| **section-builder-spazi** | `sections/Spazi/Androne.tsx`, `Colazione.tsx`, `Portico.tsx`, `Strada.tsx`, `spazi.css`, `docs/section-builder-spazi.md` |
| **section-builder-elenco** | `sections/Elenco/Elenco.tsx`, `elenco.css`, `docs/section-builder-elenco.md` |
| **shader-engineer** | non partecipa (nessun WebGL) |

Note:
- `Scatola.tsx` è del builder del palazzo ma la usa anche lo strato Dentro
  (builder stanza). La firma (§6.10) la fissa lo scaffold.
- Lo strato Dentro (builder stanza) ospita il contenuto del pannello degli
  altri: `PannelloPrenota` (prenota) quando ci sono notti scelte e la stanza è
  libera, `Androne`/`Colazione`/`Portico` (spazi) per gli spazi comuni.
- `invio.ts` è **simulato**: nessuna rete, risolve in 700-1200 ms, fallisce se
  `store.get().simulaErroreInvio` (`?invio=ko`).
- Gli `alt` delle foto sono del photo-editor (`assets/foto/index.ts`): è
  l'unico che le guarda. Tutti gli altri testi, `aria-label` compresi, sono del
  copywriter.

---

## 5. Convenzioni

### 5.1 CSS

- File `.css` per sezione, importati dal componente. Niente CSS modules, niente
  Tailwind (come il pilota e i Concept 1-9).
- **Prefisso `imb-`** su ogni classe, BEM leggero: `imb-<sezione>__<elemento>--<variante>`
  (`imb-palazzo__cella`, `imb-scatola__fondo`, `imb-lune__luna--scelta`).
- **Ogni selettore inizia con `.imb-root`**. Niente `html`, `body`, `:root`,
  `*` nudi. Unica eccezione ammessa: `html:has(.imb-root)` per
  `scroll-padding` e `color-scheme` (scaffold, `base.css`).
- **Variabili `--imb-*`**: solo l'art-director le definisce (`tokens.css`); le
  sezioni possono definire variabili locali `--imb-<sezione>-*`. **Nessun hex
  fuori da `styles/tokens.*`**, con una sola eccezione: il colore del pavimento
  campionato da ogni foto in `assets/foto/index.ts` (è un dato della foto).
- **Attributi di stato sulla radice** (li scrive solo `Imbrunire.tsx` dallo
  store): `data-imb-layout="sezione|torre"`, `data-imb-motion="full|reduced"`,
  `data-imb-vista="palazzo|stanza|spazio|lune|elenco"`,
  `data-imb-camera="ferma|entra|dentro|esce"`,
  `data-imb-accensione="spenta|in-corso|fatta"`.
- **Attributi di stato sulla cella** (li scrive `Cella.tsx` dai selettori):
  `data-imb-luce="accesa|spenta"`, `data-imb-occupata="true|false"`,
  `data-imb-scelta` (la stanza confermata dopo il successo).
- **Soglia torre/sezione**: una sola, `(min-width: 720px) and (min-height: 560px)`
  = sezione, altrimenti torre. È `MQ_SEZIONE` in `core/layout.ts`; nei CSS si
  scrive letterale `@media (min-width: 720px) and (min-height: 560px)`. Con zoom
  al 400% su 1440 si passa da soli alla torre (reflow WCAG 1.4.10).
- **z-index** come token (art-director): cielo 0, palazzo 1, testata 20, nastro
  25, strato Dentro 30, pannello 35, foglio mobile 40, successo 45. Il
  `ConceptBackButton` del sito sta sopra tutto (2147483000).
- Altezze a schermo in `dvh`/`svh`, mai `100vh` puro. Misure fluide con
  `clamp()`. Cifre tabellari per prezzi, date e orari.

### 5.2 Regole del 3D (valgono per palazzo, stanza, art-director, motion)

- `perspective` sulla **cella** (≈ 900 px sezione, ≈ 600 px torre,
  `perspective-origin` al centro della cella); `transform-style: preserve-3d`
  solo sulla **scatola**. Le cinque facce sono figli della scatola.
- Su un elemento `preserve-3d` **mai** `opacity < 1`, `filter`,
  `mix-blend-mode`, `overflow` diverso da `visible`, `clip-path`, `isolation`:
  appiattiscono il 3D. Luci, veli e dissolvenze vanno sulle **facce** o su veli
  figli delle facce. `overflow: hidden` va sulla cella (che non è 3D).
- **Luci = opacità di veli**: sulla faccia di fondo, sopra la foto, un velo
  notte profonda (spenta) e un velo di luce `radial-gradient` (accesa); sul
  pavimento un alone. Si anima solo `opacity`. La desaturazione della stanza
  spenta è un velo fermo in `mix-blend-mode: saturation` (o `color`) che entra
  anch'esso in opacità; **nessun `filter` in transizione** (costa un repaint
  per frame su dieci foto). L'art-director sceglie colori e opacità, non la
  tecnica.
- `will-change: transform` solo durante i viaggi della telecamera (lo mette e
  lo toglie `motion/camera.ts`), mai fisso: con scala ×3-4 terrebbe in memoria
  una texture enorme.
- Facce accostate con 0,5 px di sovrapposizione per non vedere fessure tra
  pavimento e pareti (Safari).
- Sulla faccia di fondo `<img>` vero con `object-fit: cover` e
  `object-position` dal dato della foto (sezione/torre/dentro). Se la foto non
  carica: `data-imb-foto="assente"` e la parete resta intonaco in luce con il
  nome inciso (CD §8.4 punto 3).

### 5.3 JS/TS

- Componenti di sezione: default export; hook con prefisso `use`; nomi in
  italiano come nel pilota.
- Nessun accesso a `window`, `document`, `localStorage`, `matchMedia`,
  `navigator` a livello di modulo o durante il render: solo in effetti,
  handler, o funzioni chiamate da loro.
- Nessun `requestAnimationFrame` fuori da `core/ticker.ts`; nessun
  `setInterval`; `setTimeout` ammesso solo per l'invio simulato e per il
  raggruppamento delle luci (scaffold).
- Nessun listener `scroll` diretto sulla finestra fuori da `core/`
  (l'indicatore di piano della torre usa `IntersectionObserver`).
- Testi solo da `content/testi.ts`; date e prezzi solo con `Intl` in `it-IT`
  (formattatori in `core/date.ts` e `dati/prezzo.ts`).
- Nessun `—` né `–` in stringhe visibili (CD §11).

---

## 6. Contratti tra moduli

### 6.1 Store lento: `state/store.ts`

Store esterno senza librerie, letto con `useSyncExternalStore` (con
`getServerSnapshot` = stato iniziale, per il prerender) e un selettore.

```ts
// tipi di base (definiti in dati/palazzo.ts e core/date.ts, re-esportati qui)
export type SlugCamera = 'il-noce' | 'il-campanile' | 'la-soffitta'
  | 'il-camino' | 'la-loggia' | 'sul-noncello' | 'la-corte';
export type SlugSpazio = 'androne' | 'colazione' | 'portico';
export type SlugCella = SlugCamera | SlugSpazio;
export type DataISO = `${number}-${number}-${number}`;       // data civile a Pordenone, 'YYYY-MM-DD'
export type Layout = 'sezione' | 'torre';

export interface Selezione { dal: DataISO; notti: number }  // prima notte, numero di notti (partenza = dal + notti)

export type Vista =
  | { tipo: 'palazzo' }
  | { tipo: 'stanza'; slug: SlugCamera }
  | { tipo: 'spazio'; slug: SlugSpazio }
  | { tipo: 'lune'; filtro: SlugCamera | null }
  | { tipo: 'elenco' };

export type MotivoSelezione = 'troppe-notti' | 'chiuso' | 'minimo-notti' | 'notte-occupata';
export type FaseCamera = 'ferma' | 'entra' | 'dentro' | 'esce';
export type Accensione = 'spenta' | 'in-corso' | 'fatta';
export type StatoInvio = 'idle' | 'sending' | 'error';

export interface Conferma {
  slug: SlugCamera; selezione: Selezione; ora: string; ospiti: 1 | 2 | 3;
}

export interface ImbrunireState {
  oggi: DataISO | null;              // null nel prerender; al mount da core/date (o ?oggi=)
  layout: Layout;
  reducedMotion: boolean;
  vista: Vista;                      // la scrive SOLO core/rotta.ts (dall'hash)
  selezione: Selezione | null;       // viva: nastro e riga di stato
  selezioneLuci: Selezione | null;   // raggruppata: palazzo ed elenco (al più 1 cambio ogni 500 ms)
  motivoSelezione: MotivoSelezione | null;
  camera: { fase: FaseCamera; slug: SlugCella | null };
  accensione: Accensione;
  prenotazione: { ospiti: 1 | 2 | 3; ora: string | null; invio: StatoInvio };
  conferma: Conferma | null;         // dopo il successo; "Torna al palazzo" la toglie
  simulaErroreInvio: boolean;        // ?invio=ko
}

export const store: {
  get(): ImbrunireState;
  set(patch: Partial<ImbrunireState> | ((s: ImbrunireState) => Partial<ImbrunireState>)): void;
  subscribe(fn: () => void): () => void;
};
export function useImbrunire<T>(sel: (s: ImbrunireState) => T, isEqual?: (a: T, b: T) => boolean): T;
```

**Azioni** (le sezioni chiamano queste, mai `store.set`):

| Azione | Chi la chiama | Effetto |
|---|---|---|
| `scegliNotti(sel: Selezione \| null, o?: { filtro?: SlugCamera })` | lune (anche a ogni passo del trascinamento) | valida (min/max, chiusura, notti occupate della stanza filtro), tronca all'ultima notte valida, scrive `selezione` e `motivoSelezione` subito, programma `selezioneLuci` (vedi sotto), aggiorna la query dell'hash con `replace` |
| `svuotaNotti()` | lune, successo | selezione a null |
| `impostaCamera(fase, slug)` | solo `sections/Stanza/useCamera.ts` | fasi della telecamera |
| `impostaAccensione(a)` | solo `Imbrunire.tsx` | `'in-corso'` al primo mount della sessione, `'fatta'` a fine sequenza (o subito se già fatta / reduced motion / `?accensione=0`) |
| `aggiornaPrenotazione(patch)` | prenota | ospiti, ora, stato invio |
| `confermaPrenotazione(c: Conferma)` | prenota (invio riuscito) | `conferma`, stato invio `'idle'` |
| `tornaAlPalazzo()` | successo, "Torna al palazzo" | toglie `conferma`, vista palazzo (via rotta) |

**Raggruppamento delle luci**: `selezioneLuci` segue `selezione` con un
limitatore *leading + trailing* a **500 ms** (regola anti-lampeggio di
`docs/ruoli-agent.md`, più severa dei 400 ms del CD §7.3). Così durante il
trascinamento una cella cambia al massimo una volta ogni 500 ms, e le
transizioni di 1200 ms sfalsate di 120 ms restano ≤ 2-3 cambi al secondo su
tutta la sezione. Unico `setTimeout` dello store.

**Selettori** (puri, `useImbrunire(selX)`):

```ts
selStatoCella(s, slug: SlugCella): {
  luce: 'accesa' | 'spenta';
  occupata: boolean;               // per le notti di selezioneLuci
  scelta: boolean;                 // è la stanza della conferma
}
// regole: accensione 'spenta' → tutte spente; conferma → accesa solo la scelta
// (più l'androne); nessuna selezione → tutte accese; selezione → accese le libere,
// androne sempre acceso ("c'è qualcuno"), colazione e portico accesi.
selLibere(s): SlugCamera[];        // per selezione (viva): riga di stato
selLibereLuci(s): SlugCamera[];    // per selezioneLuci: palazzo, elenco
selLunaTetto(s): DataISO | null;   // conferma?.selezione.dal ?? oggi
selVistaCorrente(s): Vista;
selInDentro(s): boolean;           // camera 'entra' | 'dentro' | 'esce'
```

Il **contatto** (nome, email o telefono, nota) non entra mai nello store né
nello storage: è stato locale di `PannelloPrenota`.

### 6.2 Valori caldi: `state/runtime.ts`

```ts
export interface Runtime {
  viewport: { w: number; h: number; dpr: number };   // core/viewport.ts
  puntatore: { x: number; y: number; attivo: boolean; tipo: 'mouse' | 'touch' | 'pen' };
  // puntatore: lo scrivono solo interaction/* (normalizzato -1..1 sul viewport per la parallasse)
  nastro: { trascina: boolean; indice: number | null; bordo: -1 | 0 | 1 };
  // nastro: lo scrive solo interaction/useSelezioneLune.ts; il ticker lo usa per lo scorrimento al bordo
  reset(): void;                                     // Imbrunire.tsx al mount
}
export const runtime: Runtime;
```

Mai in React state. Chi scrive variabili CSS dal ticker lo fa solo sugli
elementi marcati `data-imb-var` e solo se il valore è cambiato.

### 6.3 Router a hash: `core/rotta.ts`

Grammatica (unica fonte; la selezione vive nella query dell'hash, così ogni
stato si può condividere e ricaricare):

| Hash | Vista |
|---|---|
| `#/` o vuoto | palazzo |
| `#/stanza/<slug-camera>` | stanza |
| `#/androne`, `#/colazione`, `#/portico` | spazio |
| `#/lune` | lune, senza filtro |
| `#/lune/<slug-camera>` | lune filtrate su una stanza ("Le mie notti qui") |
| `#/elenco` | elenco |
| qualsiasi di questi + `?dal=YYYY-MM-DD&notti=N` | con selezione |

Valori non validi (slug sconosciuto, data passata, notti fuori limite) → si
cade sul palazzo o si scarta la selezione, **mai** un errore.

```ts
export function leggiHash(hash: string): { vista: Vista; selezione: Selezione | null };  // puro, testato
export function scriviHash(vista: Vista, selezione: Selezione | null): string;            // puro, testato
export function useRotta(): void;          // SOLO Imbrunire.tsx: sincronizza location.hash → store.vista/selezione
export function vai(vista: Vista, o?: { sostituisci?: boolean }): void;   // naviga (push o replace), tiene selezione e query
```

- `vai` usa il `navigate` registrato da `useRotta` con
  `{ pathname, search, hash }` (vedi §2.4). Entrare, uscire, aprire le lune,
  aprire l'elenco = **push**; cambiare notti, carrello tra stanze vicine,
  scala = **replace** (il tasto indietro riporta al palazzo, non stanza per
  stanza).
- `Imbrunire.tsx` ha un solo ascoltatore di clic delegato: i link
  `a[href^="#/"]` (link di salto, elenco) passano da `vai` con
  `preventDefault()`. Le sezioni usano `<a href={scriviHash(...)}>` per i
  collegamenti veri e `vai()` per i bottoni.
- **Esc** chiude lo strato più alto (foglio, poi stanza, poi lune, poi elenco)
  con `history.back()` se l'ingresso era un push del concept, altrimenti
  `vai({ tipo: 'palazzo' })`. La logica è in `rotta.ts` (`chiudiStratoAlto()`),
  l'ascolto del tasto è di `useCelleTastiera` / `Stanza.tsx`.

### 6.4 La radice: `Imbrunire.tsx`

```html
<div class="imb-root" data-imb-layout data-imb-motion data-imb-vista data-imb-camera data-imb-accensione
     style="(variabiliMotion)">
  <a class="imb-salto" href="#/elenco">Vai alle stanze in elenco</a>
  <ConceptBackButton/>                         <!-- @/components/ConceptBackButton, del sito -->
  <Testata/>                                   <!-- Cielo: nome al centro, "Scegli le lune" a destra -->
  <main id="imb-contenuto" class="imb-main" inert={inDentro || elenco}>
    <Cielo/>                                   <!-- cielo, luna di stasera, fascia riservata al nastro -->
    <Palazzo/>
    <Strada/>                                  <!-- Spazi: il piede sotto il portico -->
  </main>
  <Lune/>                                      <!-- fascia fissa nel cielo (sezione) o foglio (torre) -->
  <Stanza/>                                    <!-- strato Dentro, fisso; vuoto quando camera 'ferma' -->
  <Elenco/>                                    <!-- solo con vista elenco -->
  <Successo/>                                  <!-- Prenota: solo con conferma -->
  <p class="imb-sr" aria-live="polite" data-imb-annunci/>   <!-- core/annunci.ts -->
</div>
```

Al montaggio, in quest'ordine:
1. `useLayoutEffect` (prima della prima pittura, niente discrepanze con il
   prerender): `runtime.reset()`, `inizializzaStore({ search, hash, reducedMotion, layout, oggi })`
   (legge `?oggi=`, `?invio=ko`, `?accensione=0`, sessionStorage
   `imbrunire:accese`);
2. `track('apri_concept', { concept: 20 })` una volta (guardia StrictMode);
3. `document.title` e `meta[name=description]` da `META` (content), ripristinati allo smontaggio;
4. fondo di `<html>` e `<body>` = notte (inline, niente strisce chiare nel rimbalzo iOS), `color-scheme: dark`; ripristinati;
5. `injectFonts()`; tolti allo smontaggio solo se aggiunti qui;
6. ascolto di reduced motion e di `MQ_SEZIONE` → store;
7. `ticker.attiva()`, `osservaViewport()`;
8. `useRotta()`;
9. accensione: se non fatta nella sessione e non ridotta → `impostaAccensione('in-corso')`
   dopo `fontsReady()` o 600 ms (il primo che arriva), poi `'fatta'` alla fine
   della sequenza (durata totale da `choreography`), sessionStorage scritto;
10. con camera non ferma: `html` con `overflow: hidden` (torre) e ripristino.

### 6.5 Date: `core/date.ts`

Tutte le date del concept sono **date civili di Pordenone** (`DataISO`).
L'aritmetica si fa su `Date.UTC(y, m-1, d, 12)` (mezzogiorno UTC, immune ai
cambi d'ora), la data di oggi e gli istanti con `Intl.DateTimeFormat` e
`timeZone: 'Europe/Rome'`. Mai offset scritti a mano.

```ts
export function oggiRoma(ora?: number): DataISO;                  // ora = Date.now() di default
export function aggiungiGiorni(d: DataISO, n: number): DataISO;
export function differenzaGiorni(a: DataISO, b: DataISO): number; // b - a
export function giornoSettimana(d: DataISO): 0|1|2|3|4|5|6;      // 0 = domenica
export function eWeekend(d: DataISO): boolean;                    // notte di venerdì o sabato
export function formatta(d: DataISO, stile: 'giorno' | 'lungo' | 'breve' | 'mese'): string; // it-IT
export function eDataISO(v: unknown): v is DataISO;
export const ORIZZONTE_NOTTI = 240;
export const NOTTI_MAX = 14;
export function chiuso(d: DataISO): boolean;                      // 7-28 gennaio (esempio, CD §7.2)
export function minimoNotti(sel: Selezione): 1 | 2;              // 2 se include un sabato di agosto
```

### 6.6 Registro della scena: `core/scena.ts`

La telecamera deve misurare e animare elementi di due builder diversi. Nessuno
passa ref a mano: si registrano.

```ts
export interface PartiCella { cella: HTMLElement; scatola: HTMLElement; fondo: HTMLElement }
export interface PartiDentro { strato: HTMLElement; scatola: HTMLElement; fondo: HTMLElement; pannello: HTMLElement | null }
export const scena: {
  registraPalazzo(el: HTMLElement): () => void;            // Palazzo.tsx: il contenitore che la camera trasforma
  registraCella(slug: SlugCella, p: PartiCella): () => void; // Cella.tsx
  registraDentro(p: PartiDentro): () => void;              // Stanza.tsx
  palazzo(): HTMLElement | null;
  cella(slug: SlugCella): PartiCella | undefined;
  dentro(): PartiDentro | undefined;
  focaCella(slug: SlugCella): void;                        // rimette il fuoco sulla cella (uscita)
};
```

### 6.7 Telecamera: `motion/camera.ts` (motion-designer)

```ts
export interface OpzioniCamera { ridotto: boolean; layout: Layout }
export interface EsitoCamera { completata: boolean }   // false se annullata da un'altra camera
export function entra(slug: SlugCella, o: OpzioniCamera): Promise<EsitoCamera>;   // 1100 ms, CD §6.2
export function esci(slug: SlugCella, o: OpzioniCamera): Promise<EsitoCamera>;    // 800 ms, inverso esatto
export function carrello(da: SlugCella, a: SlugCella, o: OpzioniCamera): Promise<EsitoCamera>; // stanza accanto
export function scala(da: SlugCella, a: SlugCella, o: OpzioniCamera): Promise<EsitoCamera>;    // su/giù dal pianerottolo
export function annullaCamera(): void;                 // porta tutto allo stato finale corrente, senza salti
```

- Legge gli elementi da `scena`, misura con `getBoundingClientRect` **una
  volta** all'inizio del viaggio, anima solo `transform` e `opacity` con
  `el.animate(...)`, mette e toglie `will-change`.
- Una sola camera alla volta: una nuova chiamata annulla quella in corso
  (tasto indietro durante l'entrata = uscita dal punto in cui si era).
- Con `ridotto`: dissolvenza incrociata di 250 ms tra palazzo e Dentro, niente
  trasformazioni del palazzo; `carrello` e `scala` diventano la stessa
  dissolvenza.
- **Chi la chiama**: solo `sections/Stanza/useCamera.ts`, che osserva
  `vista` nello store e decide: palazzo → stanza = `entra`; stanza → stanza
  vicina sullo stesso piano = `carrello`; stanza → stanza di un altro piano =
  `scala`; stanza → palazzo/lune/elenco = `esci`. Aggiorna `camera` con
  `impostaCamera`, sposta il fuoco (titolo della stanza all'arrivo,
  `scena.focaCella` all'uscita).

### 6.8 Selezione delle lune: `interaction/useSelezioneLune.ts`

```ts
export interface OpzioniSelezione {
  lune: readonly DataISO[];                  // ordine del nastro
  passo: number;                             // px tra i centri delle lune (da token)
  filtro: SlugCamera | null;
  onCambia(sel: Selezione | null): void;     // di norma scegliNotti
}
export function useSelezioneLune(nastro: RefObject<HTMLElement>, o: OpzioniSelezione): {
  attiva: number;                            // indice della luna attiva (roving)
  propsListbox: HTMLAttributes<HTMLElement>; // role listbox, aria-multiselectable, aria-activedescendant, tastiera
  propsLuna(i: number): HTMLAttributes<HTMLElement>;  // role option, id, aria-selected
};
```

- Puntatore: `pointerdown` + `setPointerCapture`; l'indice si calcola
  dall'ascissa (`(x + scrollLeft − margine) / passo`), **mai**
  `elementFromPoint` a ogni movimento. Gli eventi si fondono nel ticker: al
  più un `onCambia` per frame.
- `touch-action: none` sulla fila delle lune, `pan-x` sulla fascia dei giorni
  (è da lì che si scorre col dito); lo decide l'interaction-designer con l'ux.
- Tastiera come CD §9 (← → luna attiva, Maiusc+← → allarga, Invio/Spazio
  fissa inizio e fine, Pag↑/Pag↓ mese, Home stasera).

### 6.9 Foto: `assets/foto/index.ts` (photo-editor) e `core/foto.ts` (scaffold)

```ts
// assets/foto/index.ts
export interface Taglio { sezione: string; torre: string; dentro: string } // object-position
export interface Foto {
  s480: string; s900: string; s1600: string;   // URL da import '...webp' (asset di Vite, mai public/)
  w: number; h: number;                         // del file 1600
  alt: string;                                  // descrive la foto vera
  taglio: Taglio;
  pavimento: string;                            // hex campionato dalla foto (unica eccezione ai token)
  autore: string; url: string;                  // credito Unsplash/Pexels
}
export const FOTO: Record<SlugCamera | 'colazione', { principale: Foto; seconda: Foto | null }>;
```

```ts
// core/foto.ts
export function srcsetDi(f: Foto): string;                   // "s480 480w, s900 900w, s1600 1600w"
export function sizesPer(modo: 'cella-sezione' | 'cella-torre' | 'dentro'): string;
export function precaricaFoto(f: Foto): Promise<void>;       // new Image() + decode(), una volta per URL
```

`useCaloreCella` (interaction) chiama `precaricaFoto` della 1600 al primo
hover, focus o `pointerdown` di una cella, così all'arrivo dentro la foto è già
decodificata. Nelle celle: `loading="lazy"` e `decoding="async"` su tutto
**tranne** le tre foto del sottotetto (`loading="eager"`, prime in torre, CD §12).

### 6.10 Firme dei componenti (fissate dallo scaffold)

```ts
// sections/Palazzo/Scatola.tsx
export type FondoScatola =
  | { tipo: 'foto'; foto: Foto; quale: 'principale' | 'seconda' }
  | { tipo: 'intonaco'; contenuto: ReactNode };            // androne, portico, foto mancante
export interface ScatolaProps {
  slug: SlugCella;
  modo: 'cella' | 'dentro';
  fondo: FondoScatola;
  travi?: boolean; soffittoInclinato?: 'sinistra' | 'destra' | null;
  pavimento: string;                                      // colore (dato della foto) o token
  luce: 'accesa' | 'spenta';
  onParti?: (p: { scatola: HTMLElement; fondo: HTMLElement }) => void;   // per la registrazione in scena
}
export default function Scatola(p: ScatolaProps): JSX.Element;

// sections/Prenota/PannelloPrenota.tsx
export default function PannelloPrenota(p: { slug: SlugCamera; titoloId: string }): JSX.Element;
// sections/Prenota/Successo.tsx
export default function Successo(): JSX.Element | null;
// sections/Spazi/Androne.tsx | Colazione.tsx | Portico.tsx
export default function Androne(p: { titoloId: string }): JSX.Element;
// sections/Spazi/Strada.tsx, sections/Cielo/Cielo.tsx, Testata.tsx, Palazzo.tsx,
// Stanza.tsx, Lune.tsx, Elenco.tsx: default export senza prop
```

### 6.11 Luna: `luna/*` (scaffold, algoritmo del CD §7.4)

```ts
export type NomeFase = 'nuova' | 'falce-crescente' | 'primo-quarto' | 'gibbosa-crescente'
  | 'piena' | 'gibbosa-calante' | 'ultimo-quarto' | 'falce-calante';
export interface InfoLuna {
  data: DataISO;
  p: number;              // 0..1, 0 = nuova, 0,5 = piena (interpolata a tratti sulle 4 fasi vere)
  eta: number;            // giorni dalla nuova
  frazione: number;       // (1 − cos 2πp) / 2
  crescente: boolean;
  fase: NomeFase;
  esatta: boolean;        // la fase principale cade in quella notte (12:00 → 11:59 del giorno dopo)
  percento: number;       // intero 0..100
}
export function lunaDellaNotte(d: DataISO): InfoLuna;            // istante = d alle 21:00 Europe/Rome
export function lunePerIntervallo(dal: DataISO, n: number): InfoLuna[];  // calcola le lunazioni una volta
export function istanteFase(tipo: 'nuova' | 'primo-quarto' | 'piena' | 'ultimo-quarto', vicinoA: number): number; // ms UTC
export function pathLuna(p: number, r: number): { ombra: string; luce: string }; // due `d` SVG, emisfero nord
```

- Meeus cap. 49 con almeno 8 termini periodici per nuova e piena e i termini
  principali + `W` per i quarti; ΔT = 69 s costante (commentato); conversione
  JDE → ms UTC → `Europe/Rome` solo con `Intl`.
- `lunePerIntervallo(oggi, 240)` si chiama una volta (`useMemo` nel nastro);
  < 3 ms su mobile medio, misurato dallo scaffold.
- `test/luna.test.ts`: 17/02/2026 nuova ~12:01 UTC, 03/03/2026 piena ~11:38
  UTC, 12/08/2026 nuova ~17:37 UTC, 28/08/2026 piena ~04:18 UTC, tolleranza
  ±15 min, più la notte etichettata giusta per ognuna.

### 6.12 Disponibilità e prezzi: `dati/*` (scaffold)

```ts
// dati/disponibilita.ts (dato di esempio, stabile: dipende solo da slug e data, non da oggi)
export function occupata(slug: SlugCamera, d: DataISO): boolean;
export function libereNelle(sel: Selezione): SlugCamera[];
export function libereLaNotte(d: DataISO): number;                         // per l'etichetta di ogni luna
export function proposteVicine(sel: Selezione, quante?: number): { selezione: Selezione; libere: SlugCamera[] }[]; // default 2
export function nottiLibereVicine(slug: SlugCamera, d: DataISO): Selezione | null;  // "Libera dal 19 al 21"
// dati/prezzo.ts
export function prezzoNotte(slug: SlugCamera, d: DataISO): number;       // base + 15% ven/sab
export function totaleSoggiorno(slug: SlugCamera, sel: Selezione, ospiti: 1|2|3): { notti: number; camera: number; lettoAggiunto: number; tassa: number; totale: number };
export function prezzoDa(slug: SlugCamera): number;
export function euro(n: number): string;                                  // Intl it-IT, senza decimali se interi
```

Seme: FNV-1a di `slug + data` → mulberry32; blocchi di soggiorni lunghi di 2-5
notti generati per settimana ISO; quote ≈ 70% venerdì e sabato, ≈ 35% in
settimana; chiusura 7-28 gennaio. Coperto da `test/disponibilita.test.ts`.

---

## 7. Budget di performance

Misurati dal performance-auditor (ondata 4) sulla build standalone (`vite
preview`), Lighthouse mobile e desktop.

| Voce | Budget |
|---|---|
| JS del concept (chunk `Concept20`, senza react/router) | ≤ **60 KB gz** (atteso ~35) |
| JS iniziale totale standalone | ≤ **115 KB gz** |
| CSS totale del concept | ≤ **24 KB gz** |
| WebGL | **0** (non c'è) |
| SVG (assets/svg + favicon) | ≤ **12 KB** non gz |
| Font woff2 latin | ≤ **110 KB** (Marcellus 1 peso + Commissioner variabile 400-600) |
| Foto scaricate all'apertura, sezione 1440 | ≤ **380 KB** (7 camere + colazione a 480w) |
| Foto scaricate all'apertura, torre 375 | ≤ **300 KB** (3 del sottotetto a 900w; le altre lazy) |
| Foto per stanza aperta | 1 × 1600w ≤ **260 KB** (precaricata all'intenzione) |
| Totale foto su disco (3 misure) | ≤ **4,5 MB** |
| LCP | ≤ **2,5 s** mobile, ≤ **1,5 s** desktop |
| CLS | ≤ **0,02** (celle a proporzione fissa con `aspect-ratio`, font di ripiego tarati, nessun contenuto iniettato sopra il palazzo) |
| INP | ≤ **150 ms** (trascinamento delle lune: 1 aggiornamento per frame, lune `memo`, palazzo aggiornato ogni 500 ms; entrare: la risposta visiva è la prima frame dell'animazione) |
| TBT | ≤ **150 ms** mobile |
| Calcolo lune (240 notti) | ≤ **5 ms** su CPU ×4 |
| FPS durante la telecamera | 60 desktop, ≥ 50 mobile medio; solo `transform`/`opacity` animati |
| Frame a riposo | **0** (ticker fermo, nessuna animazione infinita) |
| Livelli compositi a riposo | nessun `will-change` fisso |

Pesi delle foto: WebP q ≈ 62 (480, 900) e q ≈ 70 (1600). Nel palazzo in
sezione le celle mostrano la foto a ~200-260 px CSS: il 480w basta fino a DPR 2.

---

## 8. Strategia di caricamento

1. **HTML + CSS** (prima pittura): fondo notte già in `index.html` (inline) e
   sulla radice; il palazzo è DOM puro con i suoi colori di intonaco e poché,
   quindi il sito è riconoscibile prima di qualsiasi foto. Le celle hanno
   `aspect-ratio` fisso: le foto entrano senza spostare nulla.
2. **Stato iniziale** in `useLayoutEffect` (§6.4): layout, reduced motion,
   hash, `oggi`, accensione. Nessun salto tra prerender e client.
3. **Font**: preconnect + `<link>` iniettato, `display=swap`, ripieghi tarati.
4. **Foto**: `srcset` + `sizes` per modo (§6.9); eager solo il sottotetto;
   1600 solo all'intenzione di entrare. `fetchpriority="high"` sulla foto di Il
   Camino in sezione (la più grande, probabile LCP) e sulla prima del sottotetto
   in torre.
5. **Lune**: nel prerender e al primo render il nastro ha la sua struttura
   (dischi in luna spenta); `lunePerIntervallo` gira in un effetto dopo il
   montaggio e le fasi entrano in dissolvenza di 300 ms (CD §7.4). La luna di
   stasera nel cielo segue la stessa regola.
6. **Accensione**: palazzo visibile e spento; parte dopo i font (o 600 ms) e
   non blocca nulla: le celle sono cliccabili da subito.
7. **Reduced motion**: nessuna sequenza (tutte accese subito), camera =
   dissolvenza 250 ms, niente parallasse, niente inerzia.
8. **Pausa**: `visibilitychange` → ticker fermo; le WAAPI in corso le gestisce
   il browser.
9. **Smontaggio** (navigazione nel sito): ticker fermo, `annullaCamera()`,
   listener rimossi, `html`/`body` (fondo, overflow, color-scheme) ripristinati,
   `<link>` dei font tolto solo se aggiunto dal concept, `document.title` e
   meta ripristinati.

**Nessun fallback WebGL** da prevedere. Il fallback che conta è quello delle
foto (CD §8.4): se un'immagine fallisce, parete in intonaco con il nome inciso.

---

## 9. Analytics

`import { track } from '@/lib/analytics'`, firma del sito
`track(event: TrackEvent, params?)`, `TrackEvent` chiusa (copiata nello stub).

| Evento | Quando | Params |
|---|---|---|
| `apri_concept` | montaggio di `Imbrunire.tsx`, una volta | `{ concept: 20 }` |
| `demo_prenotazione` | invio riuscito (`PannelloPrenota`) | `{ concept: 20, stanza: slug, notti, ospiti }` |

Nient'altro, mai nome, contatto o nota.

---

## 10. Porting nel sito

- Si copiano `src/pages/Concept20.tsx` e `src/pages/concepts/imbrunire/`.
  **Non** si copiano `test/`, `lib/analytics.ts`, `components/ConceptBackButton.tsx`,
  i file di configurazione.
- Dentro `imbrunire/` nessun import fuori dalla cartella tranne
  `@/lib/analytics`, `@/components/ConceptBackButton` e i pacchetti npm
  (`react`, `react-router-dom`).
- Foto importate come asset di Vite (`import s900 from './il-camino-900.webp'`),
  mai da `public/`: il porting non tocca `public/` del sito.
- Da verificare al porting: `LAB_URL`, che il prerender del sito renda
  `/concept-20` dentro un router (serve a `useLocation`), che nessun Lenis
  globale sia tornato nel sito.
- Nessuna dipendenza nuova per il sito.

---

## 11. Comandi e porte

Dalla cartella `concepts/20-imbrunire/`:

| Comando | Cosa fa |
|---|---|
| `npm install` | versioni esatte (lockfile) |
| `npm run dev` | Vite su http://localhost:9200 (`/` → `/concept-20`), `--strictPort` |
| `npm run build` | build in `dist/` |
| `npm run preview` | `dist/` su http://localhost:9201, fallback SPA |
| `npm run typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `npm run typecheck:node` | `tsconfig.node.json` (vite e vitest config) |
| `npm run typecheck:test` | `tsconfig.test.json` |
| `npm run test` | `vitest run` (luna, disponibilità, rotta, date) |
| `npm run lint` | `eslint src test` |
| `npm run check` | typecheck (tutti) + lint + test + build: **prima di dire "fatto"** |

URL di prova:

| URL | Effetto |
|---|---|
| `/concept-20?oggi=2026-10-14` | "stasera" fissata (screenshot ripetibili; la luna e il nastro partono da lì) |
| `/concept-20?accensione=0` | niente sequenza di accensione, luci già accese |
| `/concept-20?invio=ko` | l'invio simulato fallisce |
| `/concept-20#/stanza/il-camino` | dentro Il Camino |
| `/concept-20#/lune?dal=2026-10-15&notti=3` | nastro aperto con tre notti scelte |
| `/concept-20#/elenco` | vista elenco |

**Porte** (intervallo 9200-9219, sempre `--strictPort`, ognuno chiude il suo
server): scaffold dev 9200 e preview 9201 · section-builder cielo 9202,
palazzo 9203, stanza 9204, lune 9205, prenota 9206, spazi 9207, elenco 9208 ·
art-director 9209 · motion-designer 9210 · interaction-designer 9211 ·
vector-artist 9212 · photo-editor 9213 · responsive-tester 9214 ·
accessibility-auditor 9215 · performance-auditor 9216 · cross-browser-tester
9217 · seo-engineer 9218 · awwwards-jury 9219. Comando:
`npx vite --port 92xx --strictPort` (o `npx vite preview --port 92xx --strictPort`).

---

## 12. Checklist per chi scrive codice

- `design-taste-frontend` e `full-output-enforcement`: niente file troncati,
  niente TODO, niente placeholder.
- Solo i tuoi file (§4). Costanti condivise da store, dati, token: non
  duplicarle.
- Niente rAF fuori dal ticker, niente `setInterval`, niente listener `scroll`
  diretti, niente `filter` animati, niente opacità su elementi `preserve-3d`.
- Nessun hex fuori dai token (eccezione: `pavimento` delle foto).
- Nessun accesso al browser a livello di modulo o nel render.
- Ogni cambio di luce è una dissolvenza ≥ 900 ms (250 ms con reduced motion),
  mai più di un cambio ogni 500 ms per la stessa cella.
- Aree di tocco ≥ 44 px; `Esc` chiude; fuoco gestito in entrata e in uscita.
- Prima di consegnare: `npm run check` verde.

---

## Richieste ad altri agent

1. **photo-editor**: tre misure per foto (480, 900, 1600 px di lato lungo, non
   due): il palazzo in sezione mostra dieci pareti di fondo insieme a ~200-260
   px CSS e con 900w supererebbe il budget di §7 (≈ 700 KB all'apertura). Nomi
   `<slug>-<quale>-<misura>.webp` (es. `il-camino-principale-900.webp`) e
   `assets/foto/index.ts` con il tipo di §6.9, compresi `alt`, `taglio` e
   `pavimento` campionato. Se un nome di stanza cambia per adattarsi alla foto
   (CD §8.2), dirlo nel doc: lo slug cambia in `dati/palazzo.ts` (scaffold) e
   nel copywriter.
2. **copywriter**: testi per slug (`Record<SlugCamera, …>`) con gli slug di
   §6.1; `RECAPITI` con `telefonoHref`, `email` (.example) e `mapsQuery`;
   `META` (title, description con "Concept di Ciceri Lab"); le frasi della riga
   di stato e del successo come funzioni tipizzate
   (`(p: { dal: string; al: string; notti: number; libere: string[] }) => string`),
   non template da concatenare nei componenti.
3. **art-director**: soglia torre/sezione `(min-width: 720px) and (min-height: 560px)`
   (§5.1) nei token e nel DESIGN.md; z-index come token (§5.1); passo e
   diametro delle lune come numeri anche in `tokens.ts` (li usa
   `useSelezioneLune`); veli di luce e spegnimento solo in opacità (§5.2).
4. **ux-architect**: su mobile dentro una stanza il CD mette "Torna al
   palazzo" in alto a destra, dove sta anche "Scegli le lune": decidere quale
   dei due resta in quella posizione dentro la stanza (proposta: dentro la
   stanza "Scegli le lune" diventa "Le mie notti qui" nel pannello, e in alto a
   destra resta solo "Torna al palazzo"). Allineare i nomi delle "Sezioni da
   costruire" alle sette cartelle di §3.1.
5. **motion-designer**: API di `motion/camera.ts` esattamente come §6.7;
   ordine e ritardi dell'accensione in `choreography.ts` come
   `ORDINE_ACCENSIONE: readonly SlugCella[]` e `INTERVALLO_ACCENSIONE = 450`.
