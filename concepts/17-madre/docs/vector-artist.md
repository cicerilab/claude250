# Vector artist · Concept 17 · MADRE

Ondata 2. File esclusivi (tech-architect §4): `src/pages/concepts/madre/assets/svg/*`,
`public/favicon.svg`, questo documento. Porta assegnata 9174: non usata, la
verifica è fatta con Chromium headless (più Firefox e WebKit per le misure) su
una pagina statica con i font veri (Bricolage Grotesque e Karla scaricati con
curl da Google Fonts).

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, riga e paragrafo 17 di
`docs/matrice-concept-11-20.md`, `docs/creative-director.md` (tutto: 4.1 forme,
4.3 la prova del dito, 4.7 cosa non fare), `docs/tech-architect.md` (§3, §3.1,
§4, §5, §10: budget SVG ≤ 12 KB), `docs/ux-architect.md` (§2 testata e riga dei
banchi, 5.3 "Scelto con spunta", 5.7 meno/più e maniglia, 5.8 barra con "leggi
tutto"/"chiudi" e "Vai all'invio", 5.9 "Apri in Maps", tabella degli stati),
`docs/brand-strategist.md`, `docs/trend-researcher.md` (P6: la crosta in tre
ruoli e basta, P7: niente frecce per dire "continua"), `styles/tokens.css` e
`content/testi.ts` già scritti dall'ondata 2, pilota (solo formato).
`DESIGN.md` dell'art-director non c'era ancora.

## 0. Cosa serve (e cosa no)

MADRE è fatto di impasto (WebGL), foto macro e Bricolage. I vettori sono solo
due cose: **il marchio** e le **icone di servizio** che stanno sempre accanto a
un testo. Niente altro.

| Serve a | Asset |
|---|---|
| Testata (desktop e mobile), piede: il nome della bottega | `marchio-madre.svg` |
| "Apri in Maps", crediti foto, "Un concept di CiceriLab" | `freccia-esterna.svg` |
| "Vai all'invio" nella barra del riassunto a 375 | `freccia-giu.svg` |
| "leggi tutto" (girato di 180°) e "chiudi" della barra, gruppi apribili | `chevron-giu.svg` |
| Quantità nelle righe dei giorni (bottoni 44×44) | `meno.svg`, `piu.svg` |
| "posala" della striscia "In mano", chiusure in linea | `chiudi.svg` |
| "Nel pane fisso" → "Scelto", "Sul vassoio" acceso | `spunta.svg` |
| Errori sotto i campi e sotto l'invio (il segno "!" del copywriter, in forma) | `avviso.svg` |
| Maniglia `aria-hidden` delle righe trascinabili del pane fisso | `maniglia.svg` |
| Scheda del browser | `public/favicon.svg` |

Scartati di proposito (CD 4.7 e 4.1): spighe, mattarelli, fruste, mani, dita,
sacchetti, lavagnette, vapore, farina che vola, figure; icone di telefono,
mappa, orologio, calendario (i link dicono "Chiama", "Apri in Maps", "Aggiungi
al calendario"); frecce di scorrimento della vetrina (il pezzo tagliato dice
"continua", trend P7); un'icona per il vassoio (è un oggetto CSS con gli angoli
piegati, dell'art-director); un'icona del pane fisso (il richiamo è solo
testo). Nessun colore fisso negli SVG tranne il favicon.

## 1. Metodo

- **Nessun raster da vettorializzare**: la bottega è inventata, non esiste un
  logo. `image-to-svg` non si usa (vale solo per raster reali). Tutto è
  disegnato a mano come geometria.
- **Marchio**: script Python (`qa/vector-artist/sorgenti/marchio.py`, shapely)
  che costruisce le cinque lettere come unione di ellissi e rettangoli su una
  griglia (altezza x 100, asta 28, testa degli archi 23, base 21), con raggi
  diversi per angoli convessi (6) e concavi (4). I contorni passano da
  poligoni a **curve cubiche** con un adattamento di Schneider scritto apposta
  (`bezier.py`): i lati lunghi restano rette, i tratti curvi diventano al più
  2-3 cubiche ciascuno. Risultato: 112 comandi `C`, 1,9 KB.
- **Icone**: tracciati scritti a mano su griglia 24, tratto 2, capi e giunti
  tondi (sono "morbide" come il Bricolage in minuscolo; lo spigolo vivo è del
  pilota, qui no). Tutte con `width`/`height` = `1em`, `aria-hidden="true"`,
  `focusable="false"`, `currentColor`.
- **Ottimizzazione**: `npx svgo@4.1.0`, `multipass`, precisione 1 (marchio) e 2
  (icone), `convertShapeToPath` spento (i cerchi della maniglia e dell'avviso
  restano cerchi), `aria-*` e `role` conservati, `sortAttrs`. Config in
  `qa/vector-artist/sorgenti/svgo.*.mjs`, sorgenti non ottimizzati in
  `qa/vector-artist/sorgenti/svg-non-ottimizzati/`.
- **Verifica a vista** (screenshot in `qa/vector-artist/`): `tavola-2x.png`
  (testata a 1440 su farina e su carta da zucchero con le tre voci e il
  bottone, testata mobile 375 con e senza foglio azzurro, marchio a 120 px in
  farina su inchiostro, icone a 16/20/24/48 px sui tre fondi, icone dentro
  bottoni 44×44, link, bottone crosta e bottone inchiostro, riga d'errore,
  maniglia, striscia "In mano"), `marchio-grande.png` (560 px: controllo delle
  curve), `favicon.png` (16, 32, 64, 180 e dentro una scheda chiara e una
  scura), `icone-in-uso.png`. Quattro giri di correzione sul marchio: le
  controforme di a e d avevano un angolo vivo dove la fossetta tocca l'asta
  (ora arrotondato), la d aveva una gobba sulla spalla (cupola rifatta entrando
  nell'asta come nella m), la r era staccata dall'asta e poi con una tacca
  (ora è "mezza m"), le controforme della m erano storte.
- **Verifiche automatiche**: geometria dentro il viewBox in tutti i file,
  **zero `id`** in tutti gli SVG (si possono inserire inline più volte senza
  conflitti), `width: auto` del marchio inline uguale in Chromium, Firefox e
  WebKit (180,3×50 a 50 px). `index.ts` e `Icona.tsx` passano typecheck
  (`strict`, `noUncheckedIndexedAccess`) ed eslint con la config del pilota.

## 2. Elenco degli asset

| File | viewBox | Peso | Contenuto |
|---|---|---|---|
| `assets/svg/marchio-madre.svg` | `0 0 512 142` | 1.962 B | parola "madre", un solo `path` pieno |
| `assets/svg/freccia-esterna.svg` | `0 0 24 24` | 256 B | freccia diagonale in alto a destra |
| `assets/svg/freccia-giu.svg` | `0 0 24 24` | 261 B | freccia in giù con asta |
| `assets/svg/chevron-giu.svg` | `0 0 24 24` | 250 B | chevron in giù (si gira in CSS per "su") |
| `assets/svg/meno.svg` | `0 0 24 24` | 246 B | meno |
| `assets/svg/piu.svg` | `0 0 24 24` | 254 B | più |
| `assets/svg/chiudi.svg` | `0 0 24 24` | 258 B | crocetta |
| `assets/svg/spunta.svg` | `0 0 24 24` | 259 B | spunta |
| `assets/svg/avviso.svg` | `0 0 24 24` | 349 B | cerchio con punto esclamativo |
| `assets/svg/maniglia.svg` | `0 0 24 24` | 341 B | sei punti (2×3), pieni |
| `assets/svg/index.ts` | | | export `?raw`, misure del marchio, `ICONE`, `NomeIcona` |
| `assets/svg/Icona.tsx` | | | componente `<Icona nome>` (span `mad-icona`, `aria-hidden`) |
| `public/favicon.svg` | `0 0 64 64` | 795 B | la m del marchio sul piano del bancone |

Totale SVG: **5,2 KB** (budget del tech-architect: 12 KB).

## 3. Il marchio `marchio-madre.svg`

**Idea**: ogni lettera è una pagnotta. Testa a cupola, fianchi dritti, base
piatta che **poggia** (le lettere stanno tutte sulla stessa riga, come i pani
sul piano del bancone); le controforme di a, d, e sono ellissi un po' storte,
più larghe in alto: la fossetta della prova del dito. Minuscolo, come i titoli
in Bricolage (CD 4.1), ma è un segno disegnato a parte, indipendente dal font:
nessun corsivo, nessun serif, nessuna scritta "panificio" dentro il marchio (il
sottotitolo "panificio e pasticceria" è testo del copywriter, `COMUNI.marchioSotto`).

- **Un solo `path`** `fill="currentColor"`, regola nonzero: esterni in senso
  orario, controforme antiorario. Spessore minimo 21 unità su 142: a 22 px di
  altezza l'asta è 4,3 px, le controforme restano aperte (verificato a 22 e
  26 px su farina, zucchero e inchiostro).
- `role="img"` e `aria-label="MADRE"` dentro il file. Dentro un link che ha già
  `aria-label` "MADRE, torna all'impasto" (`TESTATA.marchioAria`) mettere
  `aria-hidden="true"` sullo span che lo contiene, così non si legge due volte.
- Proporzioni: larghezza = altezza × **3,606** (`MARCHIO_RAPPORTO`). Altezza
  consigliata (cima della d → base): 26 px in testata desktop (94 px di
  larghezza, entra nei 272 px tra x 248 e le voci a 520), 22 px su mobile
  (79 px), 40 px nel piede. Minimo 18 px.
- Allineamento a un testo: la base del viewBox è la linea di base; l'altezza
  della x è 100/142 dell'altezza (`MARCHIO_ALTEZZA_X`), le cupole sporgono di
  3 unità.
- Colore: inchiostro su farina e su zucchero, farina su inchiostro (piede).
  Mai crosta (la crosta ha tre ruoli e basta, trend P6).
- Uso: inline con `dangerouslySetInnerHTML={{ __html: marchioMadre }}` dentro
  uno span `display:block` con `svg { height: 26px; width: auto; display: block }`.

## 4. Icone

- Griglia 24, tratto 2 (`stroke-width` dentro il file), `stroke-linecap` e
  `stroke-linejoin` round; `fill="none"` tranne `maniglia.svg` (pieno) e il
  punto dell'avviso. A 16-17 px accanto a Karla il tratto vale 1,4 px: si legge
  (visto nella tavola) e non pesa più del testo.
- `1em` di lato: dentro un bottone 44×44 con `font-size: 20px` l'icona è 20 px;
  accanto a un link da 17 px è 17 px. Chi la inserisce dà `vertical-align:
  -0.14em` allo `svg` (nella tavola di prova è così) per centrarla sulla x.
- Sono tutte decorative: il testo visibile ("Apri in Maps", "chiudi", "Scelto")
  o l'`aria-label` del bottone ("Meno, integrale") dicono cosa fa. Nessuna
  icona sta mai da sola, nemmeno meno e più (hanno l'aria-label dello ux 6.6).
- `chevron-giu` per "leggi tutto" (barra chiusa) si gira con
  `.mad-icona--su svg { transform: rotate(180deg) }`: una sola icona, nessun
  file in più. Niente transizione sulla rotazione con reduced motion.
- `spunta` nel bottone "Scelto" (inchiostro pieno, testo farina) e in "Sul
  vassoio" su zucchero (inchiostro pieno): visto in tavola, leggibile.
- `avviso` sta a sinistra del messaggio d'errore in inchiostro, non in rosso
  (nessun quarto colore, CD 4.1); è il segno "!" di `COMUNI.erroreSegno` in
  forma, e il testo "Errore:" per lo screen reader resta quello del copywriter.
- `maniglia` solo `aria-hidden` sulle righe trascinabili (ux 5.7): l'azione da
  tastiera è il meno.

## 5. `public/favicon.svg`

Quadrato carta da zucchero `#9BB2C5` con raggio 6/64, la **m** del marchio in
inchiostro `#2F3D4C` (larga 44/64, alta 32/64) che poggia su una fascia crosta
`#9C5B2A` alta 8/64: il pane sul piano del bancone, i tre colori del concept
in un segno. Niente variante scura: lo zucchero regge sia nella scheda chiara
che in quella scura (visto in `favicon.png`). A 16 px la m si legge ancora come
due archi su una riga. Colori scritti in chiaro perché il favicon non eredita
`currentColor`; sono gli stessi hex di `styles/tokens.css`. Collegamento in
`index.html` (scaffold): `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.

## 6. Uso negli import

```ts
import { marchioMadre, MARCHIO_RAPPORTO, MARCHIO_ALTEZZA_CONSIGLIATA, ICONE } from '../../assets/svg'
import Icona from '../../assets/svg/Icona'

// marchio inline (nella Testata, dentro il link con TESTATA.marchioAria)
<a href="#impasto" aria-label={TESTATA.marchioAria}>
  <span className="mad-testata__marchio" aria-hidden="true" dangerouslySetInnerHTML={{ __html: marchioMadre }} />
</a>

// icona accanto a un testo
<a href={MAPS_URL} target="_blank" rel="noopener">Apri in Maps <Icona nome="freccia-esterna" /></a>
<button aria-label="Meno, integrale"><Icona nome="meno" /></button>
<button aria-expanded={aperta}>leggi tutto <Icona nome="chevron-giu" className={aperta ? '' : 'mad-icona--su'} /></button>
```

`?raw` richiede `/// <reference types="vite/client" />` in `vite-env.d.ts`
(scaffold). `index.ts` e `Icona.tsx` non toccano `window` né `document`: vanno
bene per il prerender. Nessun asset in `public/` tranne il favicon.

## 7. Richieste ad altri agent

- **scaffold-engineer**: `vite-env.d.ts` con il riferimento a `vite/client`;
  `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` in `index.html`;
  in `base.css` le due regole condivise delle icone:
  `.mad-root .mad-icona { display: inline-block; line-height: 0 }`,
  `.mad-root .mad-icona svg { vertical-align: -0.14em }`,
  `.mad-root .mad-icona--su svg { transform: rotate(180deg) }`.
- **section-builder-impasto** (Testata): marchio inline alto 26 px a 1440 e
  22 px a 375, base allineata a x 248 (desktop) e 20 px (mobile), inchiostro;
  `aria-hidden` sullo span perché il link ha già `TESTATA.marchioAria`.
- **section-builder-bottega** (Piede): marchio a 40 px in farina su inchiostro;
  `freccia-esterna` sui crediti foto, su "Apri in Maps" e sul link a CiceriLab.
- **section-builder-pane-fisso**: `meno`/`piu` nei bottoni 44×44 con
  `font-size: 20px`; `maniglia` `aria-hidden`; `avviso` davanti agli errori;
  `chevron-giu` (+ `mad-icona--su`) e `freccia-giu` nella barra a 375; `chiudi`
  accanto a "posala".
- **section-builder-pane / domenica**: `spunta` dentro "Scelto" e "Sul vassoio"
  acceso.
- **art-director**: se nel DESIGN.md vuoi un'altezza del marchio diversa dai
  26/22/40 px proposti, basta cambiare l'altezza: la larghezza segue.
