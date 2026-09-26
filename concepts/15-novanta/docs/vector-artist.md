# Vector artist · Concept 15 · NOVANTA

Ondata 2. File esclusivi (tech-architect §4): `src/pages/concepts/novanta/dial/geometria.ts`,
`dial/Arco.tsx`, `dial/arco.css`, `assets/svg/*`, `public/favicon.svg`, questo documento.

Letti: `docs/ruoli-agent.md`, `concepts/15-novanta/docs/creative-director.md`
(tutto, in particolare §4.2, §4.6, §4.7), `tech-architect.md` (tutto, §7.1 è il
contratto), `ux-architect.md` (§2.2, §2.3, §5.0-5.4, §5.7, §5.9, sezioni da
costruire), `trend-researcher.md` (tutto, in particolare §1.3 contrasti e §4.2
misure a 375), `brand-strategist.md` (per il marchio), i file già scritti
dell'ondata 2 (`styles/tokens.css` dell'art-director, `interaction/tastiera.ts`
che importa `ANGOLI` e `limita`), il doc del vector-artist del pilota (solo formato).

## 0. Metodo

- **Niente image-to-svg**: non ci sono raster da vettorializzare. Il quadrante,
  i mini archi e l'indice dell'anello sono **generati da codice** (tacche in un
  ciclo, come chiede il CD §4.6), le icone vengono da Tabler, il favicon è
  geometria scritta a mano con uno script e ottimizzata.
- **svgo 4** via `npx` (multipass, precisione 2, `removeViewBox` e
  `convertShapeToPath` spenti) su icone e favicon.
- **Verifica visiva**: pagina di prova resa con `react-dom/server` dai file veri
  (`Arco`, `FormaBraccio`, `tokens.css` dell'art-director, `arco.css`, font
  Epilogue e Lexend veri), fotografata in Chromium headless a 1440×900 (1×) e
  375×667 (2×) con il braccio a 0, 30, 90, 137 e 180 gradi, più una tavola con
  tutti i mini archi, l'indice sopra un anello, le icone e il favicon a 64/32/16
  px. Guardate e corrette (vedi §6). Scatti in `concepts/15-novanta/qa/vector-artist/`.
- **Typecheck e lint** dei miei file con il tsconfig e l'eslint del pilota
  (stesse regole: `strict`, `noUncheckedIndexedAccess`, react-hooks,
  react-refresh): verdi, zero avvisi.
- Nessun corpo, sagoma, mano, scheletro, faccina, croce: solo lo strumento.

## 1. Elenco dei file

| File | Cosa | Peso |
|---|---|---|
| `dial/geometria.ts` | matematica polare unica (goniometro e anello), tacche, misure, impaginazione dell'SVG | 15 KB sorgente, nessuna dipendenza |
| `dial/Arco.tsx` | `Arco` (default e named) e `FormaBraccio`, presentazionali | 10 KB sorgente |
| `dial/arco.css` | colori e spessori, solo token `--nov-*` | 3,5 KB |
| `assets/svg/icone/*.svg` | 8 icone Tabler (MIT) | 2,3 KB in tutto |
| `assets/svg/icone/LICENSE-tabler.txt` | licenza MIT di Tabler Icons | |
| `assets/svg/index.ts` | `ICONE` (markup `?raw`) e `NomeIcona` | |
| `public/favicon.svg` | goniometro a 90° su albicocca | 575 B |

Totale SVG in file: 2,9 KB (budget 12 KB). Il quadrante sta nel budget dei nodi
con ampio margine: **tutte le tacche di un tipo sono un solo `<path>`**, quindi
il quadrante completo con i due strati è ~20 nodi (faccia, diametro, 3+3 path di
tacche, clipPath, contorno, 7 numeri) invece dei 375 previsti; con il braccio
~32 (budget 420).

Il **marchio non è un file**: nei token dell'art-director NOVANTA è testo
(Epilogue 800, `--nov-fs-marchio`, unico testo maiuscolo). Nessun
`marchio-novanta.svg`.

## 2. Convenzioni geometriche (una fonte: `dial/geometria.ts`)

**g** = gradi del goniometro 0..180, coordinate SVG con y verso il basso.

```
 'bordo' (desktop)                 'fondo' (mobile, sotto il pollice)
  lato dritto a sinistra                        90
  │  180                                        │
  │   ╲                               60 ╲      │      ╱ 120
  │    ╲                                   ╲    │    ╱
  ●────── 90                        0 ──────────●────────── 180
  │    ╱                            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  lato dritto (12)
  │   ╱                             ════════════════════════  basamento (scaffold)
  │  0
```

| Funzione | Note |
|---|---|
| `versore(g, geo)`, `polare(cx, cy, r, g, geo)` | bordo: (sin g, cos g); fondo: (−cos g, −sin g). Verificati a 0/90/180. |
| `gradiDaPunto(px, py, cx, cy, geo)` | **non limitato**, risultato in [−90, 270): la discontinuità è dietro il goniometro, quindi un punto appena oltre lo 0 dà −5,7 e uno oltre il 180 dà 185,7; `limita()` li porta all'estremo giusto. Sul perno esatto restituisce `NaN` (chi trascina lo ignora con `Number.isFinite`). |
| `limita(g, min=0, max=180)` | NaN resta NaN. |
| `angoloPiuVicino(g)` | arrotonda al multiplo di 30. |
| `angoloDiContenuto(g, attuale?, isteresi=2)` | cambia a metà strada; con `attuale` aggiunge 2° di isteresi, così un braccio fermo a 15° non fa oscillare il contenuto (16 con attuale 0 → 0; 18 → 30). |
| `angoloVicino(a, ±1)` | angolo di contenuto precedente/successivo, fermo agli estremi (passi del basamento, frecce). |
| `rotazioneCss(g, geo)` | bordo −g, fondo +g: il braccio si disegna a 0 e si ruota con `rotate`. |
| `arcoPath`, `spicchioPath` | qualunque verso; oltre 360° si spezzano in due archi. `spicchioPath` con g0 = g1 dà una forma di area nulla (clip che nasconde tutto). |
| **`percorsoPath(cx, cy, r, g, geo)`** | forma della clipPath dello strato "percorso": spicchio da −2° a g + 0,4°, raggio r + 4. Accende per intero la tacca dello 0 (che corre sul diametro) e quella del grado raggiunto, senza sbavature sulla successiva. **Da usare nel ticker al posto di `spicchioPath(…, 0, deg, geo)`** (tech-architect §6.3 punto 2). |
| `tacche(da, a, passo)` | per indice intero (niente errore che si somma); lunga ogni 10, media ogni 5, numero ogni 30. |
| `misureArco(variante, geo, raggio)`, `impaginaArco(...)` | vedi §3. |
| `raggioMassimoFondo(w)`, `raggioMassimoBordo(h, fasciaAlta)` | vedi §4. |
| `eAngolo`, `n2`, `PASSO_ANGOLI`, `META_PASSO`, `MARGINE_GESTO` | utilità. |

**Convenzione oraria per l'anello della settimana** (0 = ore 12, senso orario):
`normalizza360`, `differenzaAngolare(a, b)` (con segno, (−180, 180]),
`vicinoA(a, rif)` (per seguire un trascinamento senza salto a mezzanotte),
`versoreOrario`, `polareOrario`, `orarioDaPunto` ([0, 360), NaN sul centro),
`arcoOrarioPath` (arco del "ciclo"), `settorePath(cx, cy, r0, r1, a0, a1)`
(spicchio di un giorno su una pista), `raggioOrarioPath` (una tacca radiale di
un'ora). Così `Anello.tsx` non riscrive matematica polare.

## 3. Lo strumento disegnato (`Arco.tsx`)

### 3.1 Forma

Un goniometro vero ha un **lato dritto spesso** oltre il diametro. L'ho messo in
entrambe le geometrie (`misure.base`):

- **bordo, 24 px** a sinistra del diametro. Serve davvero: con il perno a
  x = 0 il braccio a 0° e a 180° correrebbe lungo il bordo dello schermo e metà
  manopola sarebbe fuori. Con il perno a x = 24 il braccio sdraiato si vede per
  intero sopra il gesso, e la manopola (28 px) sta tutta nello schermo.
- **fondo, 12 px** sotto il diametro, dello stesso gesso del basamento
  dell'ux: si fondono in un unico lato dritto. Serve a tenere la manopola a 0° e
  180° (diametro 26, area di tocco 48) sopra il bottone del sito, che a 375 sta
  12 px sotto il bordo alto del basamento: senza questi 12 px l'area di tocco
  della manopola a 0° entrerebbe nel bottone.

Elementi, dal basso: faccia gesso (mezzo disco + lato dritto) → diametro
petrolio 1 px (sul quadrante si interrompe prima dei numeri 0 e 180) → strato
di tacche spente (`--nov-tacca-spenta`) → strato di tacche percorse (petrolio,
ritagliato) → contorno petrolio `--nov-contorno-disco` (senza, il gesso
sull'albicocca a 1,31:1 sparisce: trend-researcher §4.1). Il contorno è aperto
dal lato del bordo dello schermo (bordo) e del basamento (fondo), chiuso nei
mini archi e nell'indice. Numeri 0-30-…-180 in Epilogue 500, cifre tabellari,
sempre orizzontali, **alla stessa distanza dal perno della finestrella del
braccio**: a braccio fermo la lente incornicia il numero stampato (il "90"
dentro la lente a 90° nello scatto `desk-90.png`).

### 3.2 Misure (unità del viewBox; quadrante: 1 unità = 1 px)

Quelle fisse coincidono con i token dell'art-director (`tokens.css` §4); base,
lente e numeri sono decisi qui.

| | bordo | fondo | token |
|---|---|---|---|
| tacche corta / media / lunga | 10 / 16 / 26 | 7 / 11 / 18 | `--nov-tacca-*` |
| rientro delle tacche dal bordo | 3 | 3 | |
| spessori tacche (CSS, px veri) | 1,25 / 2,5 lunga | 1 / 2 lunga | `--nov-tacca-spessore*` |
| braccio: spessore | 10 | 8 | `--nov-braccio-spessore` |
| sporgenza oltre l'arco | 40 | **0** | `--nov-braccio-sporgenza` |
| manopola disegnata / toccabile | 28 / 48 | 26 / 48 | `--nov-manopola`, `--nov-manopola-tocco` |
| lente (finestrella tonda) | 30 | 26 | `--nov-finestrella` |
| perno (diametro) | 20 | 16 | `--nov-perno` |
| lato dritto `base` | 24 | 12 | nuovo |
| corpo dei numeri | 14 | 12 | |
| distanza lente/numeri dal perno | r − 50 | r − 37 | |

Mini archi e indice sono proporzionali al raggio (tacche ogni 10°, lunghe ogni
30°, niente numeri: i numeri stanno nel testo o nella `figcaption`).

### 3.3 `impaginaArco(variante, geo, raggio)`

Restituisce `cx, cy` (perno nel viewBox), `larghezza, altezza, viewBox`,
`origine` (stringa per `transform-origin` con `transform-box: view-box`),
`misure` e, per l'indice, `punta` (dove la punta del braccio tocca l'anello).
"Portata" = r + sporgenza + manopola toccabile / 2.

| Variante | Perno | SVG |
|---|---|---|
| quadrante/mini `bordo` | (base, portata) | base + portata × 2·portata |
| quadrante/mini `fondo` | (portata, portata) | 2·portata × portata + base |
| indice | (portata, base) | 2·portata × base + portata |

Esempi reali: bordo r 334 → viewBox `0 0 422 796`, perno (24, 398); fondo r 143
→ `0 0 334 179`, perno (167, 167). **Il fondo dell'SVG in `fondo` è il fondo del
lato dritto**: va appoggiato sul bordo alto del basamento.

### 3.4 API dei componenti

```tsx
<Arco variante="quadrante" geo={geo} raggio={r} percorsoClipId="nov-percorso" valore={deg0} />
<Arco variante="mini" geo="fondo" raggio={48} valore={120} />                 // esercizio: fino a 120°
<Arco variante="mini" geo="fondo" raggio={96} valore={90} confronto={70} />   // 30°: oggi 70, obiettivo 90
<Arco variante="indice" geo="fondo" raggio={26} />                           // testina dell'anello
<FormaBraccio variante="quadrante" geo={geo} raggio={r} />                   // in Braccio.tsx, a 0°
```

- Props del contratto §7.1 più `children` (solo decorativi: l'SVG è
  `aria-hidden`, niente controlli dentro). L'SVG ha `width`/`height` =
  dimensioni del viewBox (nessun salto di layout); il CSS può scalarlo, e i
  tratti restano in px veri (`vector-effect: non-scaling-stroke`).
- **`percorsoClipId`**: `Arco` rende la `<clipPath id={percorsoClipId}>` con
  dentro `<path id="{percorsoClipId}-forma">` (d iniziale da `valore`, default
  0). useBraccio scrive nel ticker:
  `formaEl.setAttribute('d', percorsoPath(cx, cy, r - 3, deg, geo))` (r − 3 =
  bordo esterno delle tacche, `raggio - misure.tacca.rientro`). Senza
  `percorsoClipId` lo strato percorso è statico fino a `valore`.
- **mini**: braccio pieno a `confronto ?? valore`, tacche percorse fino allo
  stesso angolo; con `confronto` anche il braccio **tratteggiato** con manopola
  vuota a `valore` e l'**arco "che manca"** appena fuori dal disco tra i due.
- **indice**: goniometro `fondo` capovolto (lato dritto in alto), tacche tutte
  petrolio, braccio a 90° che punta giù dentro l'anello. `geo` è ignorato.
  Per allinearlo: `left = centroAnello.x − punta.x`, `top = bordoAnello.y − punta.y`.
- **`FormaBraccio`**: asta a capi tondi, lente tonda (vuota: il numero lo scrive
  Braccio), manopola con un punto gesso di presa, rivetto del perno con anello
  gesso. Prop `g` per un angolo statico; il braccio vivo resta a 0 e ruota con CSS.

### 3.5 Come si monta il braccio vivo (per section-builder-quadrante)

Provato nella pagina di prova, funziona così:

```tsx
const lay = impaginaArco('quadrante', geo, r);
<svg viewBox={lay.viewBox} width={lay.larghezza} height={lay.altezza} aria-hidden="true">  {/* sovrapposto ad Arco */}
  <g style={{ filter: 'var(--nov-ombra-braccio)' }}>          {/* ombra su un genitore FERMO */}
    <g style={{ transformBox: 'view-box', transformOrigin: lay.origine,
                rotate: 'calc(var(--nov-deg) * -1deg)' /* bordo; fondo: * 1deg */ }}>
      <FormaBraccio variante="quadrante" geo={geo} raggio={r} />
      <text x={lente0.x} y={lente0.y} /* polare(cx, cy, misure.distanzaLente, 0, geo) */
            textAnchor="middle" dominantBaseline="central"
            style={{ transformBox: 'fill-box', transformOrigin: 'center',
                     rotate: 'calc(var(--nov-deg) * 1deg)' /* controrotazione, bordo */ }} />
    </g>
  </g>
</svg>
```

- L'ombra `--nov-ombra-braccio` (drop-shadow 0 3px) va su un gruppo **che non
  ruota**, altrimenti lo scostamento gira con il braccio e la luce "si muove".
- La cifra nella lente si controruota con la stessa `--nov-deg`: il testo resta
  orizzontale (CD §4.7) senza scritture in più per frame.
- Lo slider accessibile (`role="slider"`) e l'area di tocco da 48 px **non**
  stanno dentro un SVG `aria-hidden`: sono un elemento HTML sovrapposto o fuori.

## 4. Misure a 375 e a 1440 (le segnalazioni del trend-researcher)

Il problema del §4.2 del trend-researcher (a 375 con raggio 165 e sporgenza 40 la
manopola esce dallo schermo a −17,5 e 392,5 px) è chiuso da tre cose:

1. l'art-director ha messo `--nov-braccio-sporgenza: 0` sotto il pollice (la
   manopola sta sull'arco);
2. `raggioMassimoFondo(w) = floor(w/2 − 20 − 24 − sporgenza)`: l'area di tocco
   della manopola resta nello schermo e fuori dai primi 20 px del bordo sinistro
   (gesto "indietro" di iOS). 320 → **116**, 360 → 136, **375 → 143**, 390 →
   151, 414 → 163, 430 → 171.
3. il lato dritto di 12 px (§3.1) tiene la manopola a 0° e 180° sopra il bottone
   del sito.

A 375: manopola a 0° centrata in x = 187,5 − 143 = 44,5 (tocco da 20,5); altezza
del disco con il lato dritto 155 px; con la manopola a 90° e la parola attiva
sopra, il quadrante resta intorno ai 200 px (ux: 195-210).

`raggioMassimoBordo(h, fasciaAlta) = floor((h − T)/2 − 16 − 40 − 24)`, identico
alla formula del tech-architect §7.4: 900 → **334**, 800 → 284, 720 → 244,
560 → 164, 1080 → 424 (poi il limite 480 e `0,40·w − 120` restano allo scaffold).

## 5. Icone e favicon

Tabler Icons **3.48.0**, licenza MIT (© 2020-2026 Paweł Kuna), copiate come
file (nessuna dipendenza npm, tech-architect decisione 9). Ripulite dal
rettangolo di ingombro e dalle classi, con `aria-hidden="true"`
`focusable="false"`, `currentColor`, tratto 2 su viewBox 24.

| File | Icona Tabler | Uso |
|---|---|---|
| `telefono.svg` | `phone` | link `tel:` ("chiama") |
| `calendario.svg` | `calendar-plus` | "Aggiungi al calendario" |
| `errore.svg` | `ban` (cerchio barrato, CD §4.4) | errore di campo, sempre con il messaggio scritto |
| `esterno.svg` | `arrow-up-right` | "Apri in Maps" |
| `elenco.svg` | `list` | "Leggi in elenco" |
| `quadrante.svg` | `angle` | "Torna al quadrante" |
| `precedente.svg` / `successivo.svg` | `chevron-left` / `chevron-right` | passi ±30° del basamento, "prima / dopo" |

Uso: `import { ICONE } from '../assets/svg'` e
`<span className="nov-…__icona" dangerouslySetInnerHTML={{ __html: ICONE.telefono }} />`,
misura con `width/height` sullo `svg` figlio (18-20 px accanto a Lexend 17-18).

**Favicon** (`public/favicon.svg`, 64×64): quadrato albicocca a raggio 14, mezzo
disco gesso con contorno petrolio, 7 tacche ogni 30°, braccio a 90° dritto in
su con manopola e perno: il "novanta". Unica eccezione alla regola "nessun hex
fuori dai token" (un favicon non eredita variabili), colori identici ai token.
Letto a 16 px: resta un mezzo disco con un'asta verticale, riconoscibile. Un
solo tema: l'albicocca regge sia sulle schede chiare sia su quelle scure.

## 6. Cosa ho visto negli scatti e corretto

- **Giro 1**: i numeri 0 e 180, spostati verso l'interno per non stare sul
  diametro, restavano mezzi visibili sopra la lente a braccio fermo (a 0°).
  Corretto: numeri 0 e 180 esattamente sulla posizione della lente e diametro
  interrotto prima di loro, come nei goniometri veri. Ora a braccio fermo la
  lente copre sempre per intero il numero stampato.
- A 1440 (r 334) tacca ogni grado leggibile, percorso petrolio contro spento
  grigio-petrolio ben distinti; a 375 (r 143, 2×) le 181 tacche restano
  separate (2,5 px di passo sul bordo). A 16 px il favicon si legge.
- Mini a 48 e 24 px: a 0° la manopola sporge a sinistra del disco di metà del
  suo diametro (come il braccio vero sdraiato): accettato, è coerente col
  quadrante.

## 7. Richieste ad altri agent

**scaffold-engineer (`core/modo.ts`, `layout.css`)**
1. Perno in `bordo`: `x = misureArco('quadrante','bordo',r).base` (24), non 0.
   Il lato dritto sta tra x 0 e 24, sul bordo dello schermo.
2. Perno in `fondo`: `y = h − B − 12` (B = basamento dell'ux): il fondo
   dell'SVG del quadrante poggia sul bordo alto del basamento.
3. Raggi: usare `raggioMassimoFondo(w)` e `raggioMassimoBordo(h, T)` da
   `dial/geometria.ts` (una fonte), poi gli altri limiti del §7.4. A 375 il
   raggio è **143**, non 165.
4. `index.html`: `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.
5. Ordine CSS già previsto: `dial/arco.css` dopo `layout.css` (Arco non lo importa).

**section-builder-quadrante**
- `Arco` con `raggio` in px veri (ri-render al cambio di raggio, non per frame).
- Nel ticker `percorsoPath(...)` al posto di `spicchioPath(…, 0, deg, geo)`, sul
  path `#{percorsoClipId}-forma`; montaggio del braccio come §3.5.

**section-builder-prenota**
- Matematica dell'anello da `geometria.ts` (convenzione oraria, §2); indice con
  `<Arco variante="indice" …>` allineato con `punta`.

**section-builder-primo-incontro / esercizi / vista elenco**
- `<Arco variante="mini" geo="fondo" raggio={48} …>` e misura via CSS (width
  200 / 96 / 64 / 48 px): i tratti restano sottili a ogni scala.

**art-director**
- In `tokens.ts` (specchio numerico) le misure di tacche, braccio, manopola,
  perno e finestrella devono restare uguali a quelle di `misureArco()` (§3.2);
  se ne cambi una nel CSS, cambiala anche in `geometria.ts` (chiedimelo).

**tech-architect** (nota): §6.3 punto 2 va letto con `percorsoPath`; §7.4
"perno x = 0" diventa x = 24.
