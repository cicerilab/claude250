# Section builder · Legatoria · Concept 10 · IMPRONTA

Ondata 3. File miei: `src/pages/concepts/impronta/sections/Legatoria/Legatoria.tsx`,
`legatoria.css`, `Filo.tsx`, questo documento.

Letti: `DESIGN.md`, `docs/scaffold-engineer.md`, `docs/creative-director.md` (§4.2
sezione 5), `docs/ux-architect.md` (§3, §4.3, §5.5, §6, §7), `docs/copywriter.md` e
`content/testi.ts`, `content/prezzi.ts`, `docs/art-director.md`,
`docs/motion-designer.md` (§5.3, §6.5, §8, §9), `docs/vector-artist.md` e
`assets/svg/index.ts`, `docs/integrazione-sito.md`, le skill `design-taste-frontend`
e `full-output-enforcement`, e il codice di `motion/useScrollProgress.ts`,
`motion/choreography.ts`, `state/store.ts`, `interaction/interaction.css`,
`styles/base.css`, `styles/layout.css`, `styles/relief-fallback.css`.

---

## 1. Cosa fa la sezione

Un solo filo d'inchiostro scende lungo il margine interno della pagina e, a ogni
fermata, passa nei fori veri della legatura (i quattro schemi del vector-artist,
inline, una volta sola ciascuno). Si cuce con lo scroll e si ferma a ogni legatura;
accanto a ogni schema il testo è già lì, fermo, in inchiostro:

| Blocco | Testo (tutto da `testi.ts`) |
|---|---|
| testa | `LEGATORIA.titolo` (h2), `intro`, `segnatura` (spiega la parola alla prima occorrenza) |
| fermata × 4 (`<ol>`) | h3 `voci[].titolo`; cos'è `testo`; quando sceglierla `perCosa` (in forte); prezzo `prezzo`, con la cifra grande `euro(LEGATORIA_A_COPIA[id])` `aria-hidden` accanto; `filoAlt` in `.imp-sr` |
| fine | `tiraturaMinima`, tempi `BOTTEGA.tempi` (libri 15-20 giorni), `tesi`, `restauro`; scelta della legatura (`BANCO.legatura.legenda`, `LEGATURE_NOMI[].breve`, "scelta" = `BANCO.carta.scelta`, `BANCO.legatura.notaPunto` se punto metallico); bottone `COMUNI.provaLaTua` con `LEGATORIA.provaAria` come descrizione |

Nessuna stringa è scritta nel componente. L'unico ritocco tipografico: lo spazio
prima di "€" diventa indivisibile (`unito()`), così "90 €" non va a capo a metà.

## 2. Il filo: come è costruito

Nel DOM il filo è una fila di pezzi (`Filo.tsx`):

```
ingresso ─ schema brossura ─ coda ─ schema cartonato ─ coda ─
schema giapponese ─ coda ─ schema punto metallico ─ coda ─ uscita ─ nodo
```

- **Schemi** (`SchemaFilo`): markup del vector-artist preparato una volta a livello di
  modulo (solo stringhe): `pathLength="1"` e classe sul path del filo; una copia del
  path **senza id** sotto (la "guida" a matita, tratteggio 1,5/3,5); `pathLength="1"`
  sulle graffe; `<title>`, `role` e `aria-labelledby` tolti perché il contenitore è
  `aria-hidden` (niente suggerimento del browser, testo vero in `filoAlt`). Ogni
  schema entra una volta: gli id restano unici (verificato: nessun id duplicato
  dalla sezione).
- **Tratti dritti** (`TrattoFilo`): `::before` tratteggio a matita, `::after` riga
  d'inchiostro larga quanto il filo degli schemi (2,4 unità × scala) che si srotola
  con `scaleY`. Solo `transform`.
- **Nodo** (`NodoFilo`): cerchio r 5 unità, `pathLength="1"`, si chiude
  all'altezza del centro del bottone "Prova la tua".
- **Allineamento**: tutti i pezzi hanno il filo alla stessa x (`--filo-x`): gli
  schemi entrano ed escono in (16, 0) e (16, 300) del loro viewBox, quindi lo schema
  si sposta di `--filo-x − 16 × scala`. Su 375 il filo è a 28 px dal bordo e il
  testo parte a 56 px (ux-architect 5.5); da 600 px il filo corre al bordo sinistro
  dello schema.

**Misura** (in `Legatoria.tsx`, `useLayoutEffect` + ResizeObserver del corpo + font
pronti; mai durante lo scroll): lunghezza vera di ogni pezzo in px (altezze dei
tratti, `FILI[].lunghezza × scala` per gli schemi, 2πr × scala per il nodo). Su ogni
pezzo si scrivono `--filo-da` e `--filo-a` (frazioni del totale). Nel CSS:

```css
--filo-l: clamp(0, (var(--imp-filo-p) - var(--filo-da)) / (var(--filo-a) - var(--filo-da)), 1);
/* schemi e nodo */ stroke-dasharray: 1 2; stroke-dashoffset: calc(1 - var(--filo-l));
/* tratti */        transform: scaleY(var(--filo-l));
```

`opacity: calc(var(--filo-l) * 400)` nasconde il puntino che il capo tondo
disegnerebbe a lunghezza 0.

**Soste vere**: per ogni legatura la frazione del filo in cui la cucitura è finita
(`FILI[].cucitura[1]` di brossura 0,895, cartonato 0,906, giapponese 0,857; per il
punto metallico 0,5, dove il filo passa accanto alle graffe), riportata sul totale.
Passate a `useFilo({ soste })`: il filo si ferma lì per il 7% dello scroll
(`conSoste` del motion-designer).

## 3. Contratto con il motion

- `useFilo(corpoRef, { fermate, soste })`: intervallo `LEGATORIA.intervallo`,
  `--imp-filo-p` scritto sul corpo, `--imp-filo-aggancio` e `data-imp-agganciato`
  su ogni `<li>`.
- L'aggancio (molla `tiro`) tocca **solo** i segni della cucitura: la guida a matita
  svanisce, i fori si riempiono d'inchiostro, i numeri dei fori passano da 50% a
  pieno, il filo dello schema si tende (spessore 2,1 → 2,4 unità, con la
  sovraelongazione della molla); nel punto metallico le due graffe battono insieme
  (`stroke-dashoffset` guidato dall'aggancio). Il testo non si muove mai.
- Prima della prima scrittura, con `data-motion="full"`, `--imp-filo-p: 0` e
  `--imp-filo-aggancio: 0` nel CSS: nessun lampo di filo intero.
- **Reduced motion**: `useFilo` scrive 1 e aggancia tutto; in più il CSS forza
  `--filo-l: 1` e `--imp-filo-aggancio: 1` (anche in stampa). Filo già cucito,
  nessun abbonamento al ticker.

## 4. "Prova la tua" con libro e legatura

UX 5.5 chiede la legatura "dell'ultima fermata vista"; arrivati in fondo il filo le
ha superate tutte, quindi conta il **tempo di lettura**: un IntersectionObserver con
una fascia al centro dello schermo (`-38% 0px -38% 0px`) somma per ogni fermata
quanto il suo testo resta sotto gli occhi; vince la più letta (almeno 700 ms), a
parità la più recente; sotto soglia resta `LEGATURA_DEFAULT` (brossura). È il caso
di Anna (ux 4.3), che "si ferma su legatura giapponese".

La scelta è **visibile e modificabile**: quattro radio veri (`imp-ix-scelta`
dell'interaction-designer, rettangoli di carta a raggio 0, 56 px, scelta = bordo
inchiostro 3 px + la parola "scelta"). Se il lettore sceglie a mano, il tempo di
lettura non la cambia più. Il clic sul bottone chiama
`aggiornaProva({ prodotto: 'libro', legatura })`; il viaggio a `#banco` lo fa il
listener delegato di `Impronta.tsx` (nessun gestore di scroll nella sezione).

Accessibilità del bottone: nome visibile "Prova la tua" (niente `aria-label` che lo
sostituisca, per la regola "etichetta nel nome"), `LEGATORIA.provaAria` come
descrizione (`aria-describedby`).

## 5. Layout

| Larghezza | Schema | Filo | Testo |
|---|---|---|---|
| 375 | 216 × 270 (scala 0,9) sopra il testo | x 28 px dallo schermo | da 56 px, riga ≤ 62ch |
| 600-1023 | 228 × 285 a sinistra, colonna di 3 colonne della griglia | bordo sinistro dello schema | dalla 4ª colonna |
| 1024-1199 | 264 × 330, colonna c1-c4 | idem | c5-c10, fermate pari sfalsate a c6-c11 |
| 1200 / 1400 / 1640 | scala 1,3 / 1,5 / 1,6 | idem | idem |

Nessuna scheda, nessun bordino, nessun divisore: la sezione è carta, filo e
inchiostro. Il margine esterno resta vuoto. Il nome della legatura si allinea al
primo foro dello schema. Nessun overflow orizzontale a 375, 768, 1440 (verificato
con `scrollWidth`).

## 6. Verifica

- `npx tsc -p tsconfig.app.json --noEmit` verde; `npx eslint src/pages/concepts/impronta/sections/Legatoria` zero errori e zero avvisi.
- Dev server mio: `npx vite --port 8105 --strictPort`. Playwright (Chromium di
  `/opt/pw-browsers`, `--use-angle=swiftshader --enable-unsafe-swiftshader
  --ignore-gpu-blocklist`, `ignoreHTTPSErrors`), screenshot in
  `/tmp/claude-0/shots-legatoria/`:
  - `1440-00…04.png` (`?gl=0`, dall'arrivo alla fine: filo che cuce, soste, nodo);
  - `1440-grafite-00/01.png` (carta Grafite, a metà cucitura);
  - `1440-gl-00.png` (WebGL acceso);
  - `768-00…03.png`, `768-fine-00.png` (scelta della legatura 2 × 2);
  - `375-00…05.png` (schema sopra il testo, filo nel margine);
  - `375-reduced-00/01.png` (reduced motion: tutto cucito e agganciato).
- Controllato nel browser: `--imp-filo-p` e `data-imp-agganciato` avanzano con lo
  scroll; salto diretto in fondo → filo 1 e quattro agganci; nessun id duplicato
  introdotto dalla sezione.

## 7. Note per gli altri

- **Ambiente**: con WebGL e luce attivi Chromium headless in SwiftShader scende a
  1-2 frame al secondo sull'intera pagina (pittura, non JS: il profilo CPU è quasi
  tutto idle): gli screenshot vanno fatti con attese lunghe. Non dipende da questa
  sezione (che non scrive nulla fuori dallo scroll).
- **Font**: il proxy a volte rifiuta Google Fonts (`ERR_TOO_MANY_RETRIES`): in
  alcuni scatti si vedono i ripieghi tarati.
- `BOTTEGA.tempi` è usato anche qui (tempi dei libri): se il copywriter vuole una
  riga dedicata alla legatoria, basta sostituire quella voce della lista.
- Id duplicato `freccia` nella pagina: non viene da questa sezione (è lo SVG della
  freccia inserito due volte altrove).

---

## Giro 2

Voti del giro 1 (giuria): Legatoria 6/10. Richieste applicate, solo nei miei
tre file (`Legatoria.tsx`, `legatoria.css`, `Filo.tsx`). Le sezioni 2-5 qui
sopra descrivono il giro 1: dove sono in conflitto vale questa.

### Cosa è cambiato

| Richiesta | Fatto |
|---|---|
| Filo protagonista a tutta area (non in 280 px) | Da 600 px **serpentina**: schemi grandi alternati a sinistra e a destra (4 colonne su 8, 5 su 12: 476 × 595 px a 1440, 560 × 700 a 2560), il filo attraversa la pagina in orizzontale da uno all'altro. Su 375 il filo corre nel margine esterno (10 px dal bordo), entra nello schema a sinistra, ne esce e torna nel margine passando sotto il nome. |
| Nomi agganciati ai punti del filo | Da 600 px un **laccio** parte dal primo foro dello schema (brossura 164,68; cartonato 92,64; giapponese 122,92) e arriva al nodo accanto al nome, che sta all'altezza di quel foro; si tende con l'aggancio (`scaleX(--imp-filo-aggancio)`). Nel punto metallico il filo non cuce: il laccio si aggancia al filo che passa accanto alle graffe (x 16), così non lo attraversa. Su 375 il filo stesso sottolinea il nome. I numeri grigi dei fori sono nascosti (quote da disegno tecnico, giuria punto 11). |
| Via il prezzo ripetuto | Cifra `euro(LEGATORIA_A_COPIA)` + `voci[].prezzoDopoCifra` ("a copia, solo la legatura"), cifra leggibile (non più `aria-hidden`), corpo titolo-3 invece del corpo prezzo. `LEGATORIA.riferimento` una volta sola in fondo; tolta `tiraturaMinima` (lo dice già il riferimento). |
| Via le scelte finali con bordino | Niente tile. La scelta della legatura è un **radio vero sul nodo** di ogni fermata (cerchio d'inchiostro 22-24 px, area di tocco 44 × 44, scelto = pieno con occhiello + parola "scelta"), dentro un `fieldset` con legenda `BANCO.legatura.legenda` per i lettori di schermo. |
| Testo a 375 non rientrato di 56 px | Testo a tutta area viva (335 px); rientra solo la riga del nome (36 px) per lasciare posto al nodo. |
| Un solo "Prova la tua" | Uno solo, **tipografico** (Anybody titolo-3, niente lamina: la lamina resta della testata): il filo scende dall'ultimo schema, lo sottolinea e si chiude nel nodo. Sopra, una riga dice cosa porterà al banco: "Libro o libretto, legatura giapponese". |
| B1 Firefox | Tutti gli `stroke-dashoffset` con l'unità: `calc((1 - var(--filo-l)) * 1px)`, graffe `calc((1 - var(--imp-filo-aggancio, 1)) * 1px)`, dasharray `1px 2px`. Verificato in Firefox 1495: la brossura si cuce a metà (`firefox-citrino-1440-00.png`). |
| B6 (la scelta cambia da sola) | I radio non si spuntano mai da soli. Il tempo di lettura vale solo come default del link, ed è scritto in chiaro sopra il link (e nella sua `aria-describedby`). |
| Motion giro 2, foglie `data-imp-var` | Ogni pezzo del filo (tratti, schemi, nodo) porta `data-imp-var="--imp-filo-p"`: il motion scrive la variabile solo lì, non più sul corpo della sezione. `--imp-filo-aggancio` resta sulle fermate. |
| Copywriter giro 2 | Intro accorciata, `prezzoDopoCifra`, `riferimento`, `BOTTEGA.tempi` in una frase: tutti usati. |

### Come è fatto il filo adesso

Pezzi per fermata, in ordine: `entra` (orizzontale in testa) ─ `scende` ─
schema ─ `esce` ─ `traversa` ─ `coda`; in fondo `fine-scende` ─
`fine-traversa` ─ nodo. Il CSS decide quali esistono per larghezza (su 375
`esce` e `traversa` portano il filo sotto il nome e nel margine; da 600 sono
`display: none` e misurano 0). Le x derivano tutte da `--filo-w`:
`--filo-xd` (schema a sinistra, 16/240), `--filo-xrov` (schema a destra,
`100% - w + xd`), `--filo-xr` (margine esterno, `100% + 10px`). La misura in
`Legatoria.tsx` somma larghezza dei tratti orizzontali, altezza dei
verticali, `FILI[].lunghezza × scala` degli schemi e la circonferenza del
nodo; le soste restano i punti di fine cucitura.

### Verifica giro 2

- `npx tsc -p tsconfig.app.json --noEmit` verde (l'errore segnalato veniva da
  un salvataggio a metà durante il lavoro); ESLint sulla cartella Legatoria:
  zero errori e zero avvisi.
- Dev server mio `npx vite --port 8110 --strictPort`, chiuso alla fine.
  Font veri via `page.route` + curl; le altre sezioni sostituite da stub per
  velocità.
- Screenshot in `/tmp/claude-0/shots-legatoria/g2/`, `?gl=0`:
  - Citrino: `chromium-citrino-375-00…06`, `-768-00…03`,
    `-1440-00…06`, `-2560-00…03` (tutti senza SwiftShader tranne 375 e 1440);
  - Cotone: `chromium-cotone-768-00…03`, `-1440-00…03`, `-2560-00…03`;
  - reduced motion: `chromium-cotone-375-rid-00/01` (tutto cucito);
  - Firefox: `firefox-citrino-1440-00/01`, `firefox-citrino-375-00/01`.
- Nessuno scroll orizzontale (scrollWidth = larghezza) a 375, 768, 1440 e 2560.
  Nessun id duplicato in `#legatoria`. Clic sul nodo della giapponese e poi su
  "Prova la tua": bozza `{"prodotto":"libro", …, "legatura":"giapponese"}`.
- Nota ambiente: in Chromium con `--use-angle=swiftshader` gli screenshot a
  768 e 2560 escono con riquadri ripetuti (artefatto di composizione della
  cattura, non della pagina): rifatti senza quei flag, la pagina è pulita.
