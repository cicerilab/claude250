# Vector artist · Concept 14 · BATTIFILO

Ondata 2. File esclusivi (tech-architect §4): `src/pages/concepts/battifilo/assets/svg/*`
(compresi `icone/` e `index.ts`), `public/favicon.svg`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/creative-director.md` (§2, §4.1, §4.3, §4.4, §4.5, §4.8),
`docs/tech-architect.md` (§0, §3, §4, §7.3, §8), `docs/ux-architect.md` (§5.3, §5.5),
`docs/trend-researcher.md` (P8), `docs/brand-strategist.md`, pilota
`concepts/10-torchio/docs/vector-artist.md` (solo formato).

## 0. Metodo

Nessun raster da vettorializzare: niente `image-to-svg`. Tutto **disegnato a mano** come
geometria o come filtro SVG. Regola del CD §4.5 e del trend-researcher P8: **un solo segno**,
il battifilo. Niente case, gru, caschi, betoniere, operai, cazzuole, metri, sagome umane. La
porta di riferimento di "Misura e manda" non è un file: la disegna `Tracciamento.tsx`.

Ottimizzazione: `svgo@4` via `npx` (multipass, precisione 2, `cleanupIds`, `removeViewBox`
e `convertShapeToPath` disattivati). Il favicon è rimasto a mano (quattro righe).

Verifica: ogni file renderizzato in Chromium headless (playwright globale) su calcestruzzo
`#B8B4AB`, a 1×, 2× e 3×; le due maschere anche in **Firefox e WebKit**
(`/tmp/claude-0/pw-extra`): rendono in tutti e tre (la grana di WebKit è un po' più morbida,
accettabile). Misurati con Pillow il profilo della tessera e la quota di lacune dello spruzzo.
Correzioni fatte a vista: tessera troppo pulita e uniforme al primo giro (aggiunta la
variazione di densità lungo la linea e la polvere ai bordi); spruzzo troppo bucato al primo
giro (sembrava rumore televisivo, poi terrazzo) e portato al 4%; gancio al primo giro
sembrava una spina elettrica, ridisegnato come cappio intorno a un chiodo; favicon al primo
giro sembrava una pila, tolta la cassetta.

## 1. Elenco

| File | viewBox | Peso | Uso |
|---|---|---|---|
| `assets/svg/polvere-tessera.svg` | 240 × 24 | 1,7 KB | **maschera** della linea battuta, ripetuta in x |
| `assets/svg/polvere-bordo.svg` | 160 × 160 | 0,6 KB | **maschera** "a spruzzo" per le marcature stencil grandi (facoltativa, art-director) |
| `assets/svg/gancio.svg` | 24 × 24 | 0,3 KB | gancio del filo al punto zero, inline |
| `assets/svg/schema-misura.svg` | 88 × 88 | 0,6 KB | "Come si misura la luce", inline |
| `assets/svg/icone/*.svg` (12) | 256 × 256 | 4,2 KB | Phosphor Regular 2.1.1, MIT, inline |
| `assets/svg/index.ts` | | | export `?url` delle maschere, `?raw` dei segni, dati (`TESSERA`, `SPRUZZO`, `GANCIO`, `SCHEMA_MISURA`, `ICONE`, `USO_ICONE`) |
| `public/favicon.svg` | 64 × 64 | 0,2 KB | linea battuta con il buco, gancio ferro, su calcestruzzo |

Totale SVG **8,0 KB** (budget tech-architect §8: 16 KB).

Regole comuni: i segni inline sono in `currentColor`, **senza id**, con `aria-hidden="true"`
(si possono ripetere nella stessa pagina: le tacche, i bottoni meno/più). Le due maschere
hanno id prefissati `btf-` (`btf-polvere-profilo`, `btf-polvere-filtro`,
`btf-spruzzo-filtro`), ma si usano solo come immagine in `mask-image`, quindi non entrano
nel DOM e non collidono. Spigoli vivi ovunque (`stroke-linejoin` miter di default,
`stroke-linecap="square"` sulle quote), come chiede il CD §4.1. Nessun colore fisso nei
file del concept, tranne `#fff` delle maschere (serve solo l'alfa) e il favicon.

## 2. La tessera della polvere `polvere-tessera.svg`

Cosa c'è dentro: un rettangolo 240 × 24 riempito con un gradiente verticale bianco (alfa 0
ai bordi, 1 al centro) passato in un filtro:

1. `feTurbulence` fine (`.7 1.1`, 2 ottave, `stitchTiles="stitch"`): la **grana del gesso**;
2. `feTurbulence` larga (`.025 .06`, `stitch`): la **dose** che cambia lungo la linea (il
   filo non carica la polvere in modo uniforme: tratti più pieni, tratti più scarichi);
3. due `feComposite arithmetic`: il profilo moltiplicato per la grana (ai bordi passano solo
   i granelli più forti, cioè la polvere), poi per la dose;
4. `feComponentTransfer` discreto a 7 livelli: grana netta, non sfocata.

Profilo misurato (Chromium, elemento 240 × 24, copertura media per riga):

| y | 0-5 | 6 | 7 | 8 | 9-14 | 15 | 16 | 17 | 18-23 |
|---|---|---|---|---|---|---|---|---|---|
| copertura | 0 | 5% | 32% | 60% | 82-90% | 69% | 39% | 8% | 0 |

Quindi: **nucleo di circa 6 px** (CD: 5-6 px), polvere che si dirada per 2-3 px sopra e
sotto, e 6 px vuoti in cima e in fondo (spazio per la battuta, così la maschera non taglia
mai la polvere). Asse della linea a metà altezza (y 12).

**Uso** (tech-architect §7.3, invariato):

```css
.btf-linea__tratto {
  height: 24px;                       /* TESSERA.altezzaCss; ammesso 20-28 */
  background: var(--btf-cobalto);
  -webkit-mask: var(--btf-tessera) repeat-x 0 50% / auto 100%;
          mask: var(--btf-tessera) repeat-x 0 50% / auto 100%;
}
```

con `--btf-tessera: url(<TESSERA.url>)` impostata una volta sulla radice (da `index.ts`,
oppure con `url()` relativo nel CSS: Vite lo risolve uguale, e con
`assetsInlineLimit: 0` resta un file). Con altezza 24 la tessera si ripete ogni 240 px
**senza cuciture** (verificato su 1200 px: 5 ripetizioni, giunti invisibili) e resta nitida
a 2× e 3× perché è vettoriale: il browser la rasterizza alla densità dello schermo, una
volta.

- **Buchi**: nessun elemento (i tratti sono spezzati da `segmentiBattuti()`). Il bordo di un
  tratto è un taglio netto: va bene, è il punto dove il filo non ha toccato.
- **Strato vecchio** (opacità 0,55): stessa maschera, controllato a vista, si legge come
  gesso più scarico.
- **Allineamento tra tratti**: tutti i tratti usano `mask-position: 0 50%` rispetto a sé
  stessi; se il section-builder vuole che la grana continui identica attraverso un buco, può
  usare `mask-position: calc(-1 * var(--btf-x-inizio)) 50%` (x del tratto sulla linea). Non
  è necessario: la grana è casuale e il salto non si nota.
- **La linea in "Misura e manda"** (rettangolo della finestra, tratti della
  forbice): stessa tessera. Per i lati verticali del rettangolo si ruota l'elemento
  (`rotate: 90deg` su uno span orizzontale), non serve una tessera verticale.
- Reduced motion: non cambia niente, la tessera è statica.

## 3. Lo spruzzo `polvere-bordo.svg` (facoltativo, per l'art-director)

Una tessera 160 × 160 quasi tutta piena con **lacune minute, circa il 4% della superficie**
(misurato), a macchie irregolari: la marcatura a spruzzo di una bomboletta sullo stencil,
non il rumore. Serve come `mask-image` sulle scritte Big Shoulders Stencil **grandi** (fase,
costo del mese, titolo di S0, quote di Misura).

```css
.btf-stencil--spruzzo {
  -webkit-mask: var(--btf-spruzzo) repeat 0 0 / 160px 160px;
          mask: var(--btf-spruzzo) repeat 0 0 / 160px 160px;
}
```

- **Solo da 32 px in su** (`SPRUZZO.corpoMinPx`): sotto, le lacune mangiano i tratti. Le
  tacche dei mesi (20-24 px) **non** la usano.
- Il contrasto: le lacune fanno vedere il calcestruzzo sotto per il 4% dei pixel; il testo
  resta testo vero (il lettore di schermo non cambia) e il colore del glifo non cambia.
  L'accessibility-auditor misura il contrasto sul colore pieno, che è quello di quasi tutti
  i pixel.
- È l'alternativa più sporca al `text-shadow` di 0,5 px del CD §4.1: sceglie l'art-director
  in `lastra.css`. Se non la usa, il file resta e pesa 0,6 KB.

## 4. Il gancio `gancio.svg`

Un **chiodo** (cerchio pieno, r 2,6) con il **filo annodato a cappio** intorno, che esce a
destra. È l'aggancio vero del battifilo: si pianta un chiodo o si aggancia un bordo, e da lì
si tira. Non è una figura: è l'inizio del filo.

- viewBox 24 × 24, tratto 1,5 (come il filo di `Filo.tsx`), `fill="none"`, chiodo pieno.
- **Il filo esce in (24, 12)** (`GANCIO.uscitaFilo`), a metà altezza: con il gancio alto
  24 px accanto al tratto battuto alto 24 px, l'asse del filo, il centro del gancio e l'asse
  della polvere coincidono. Il `<path>` di `Filo.tsx` parte da lì.
- **Il chiodo sta in (6, 12)** (`GANCIO.chiodo`): è il punto zero geometrico da cui parte il
  primo tratto blu (gancio → PRIMA).
- Colore: ferro (`color: var(--btf-ferro)`), come il filo.
- Accessibilità: `aria-hidden`; il gancio non è un controllo.
- Tacca "TU" (ux §5.3.1): sta a sinistra del gancio, il gancio non cambia.

## 5. Lo schema `schema-misura.svg`

La finestra vista **da dentro**: spalle e architrave in un tratto 1,5, il davanzale come
barra piena più larga della luce. Dentro, **tre quote orizzontali** (alto, centro, basso) e
**tre verticali** (sinistra, centro, destra), ognuna con le due punte che toccano il muro:
"da muro a muro", "dal davanzale all'architrave", come dice il testo del CD §4.4.

- viewBox 88 × 88, fatto per stare a **88 px** (ux §5.5: "schema 88×88", sia a 1440 sia a 375).
  Letto bene anche a 176 px.
- Due gruppi con classe, per colorarli dal CSS di Misura:
  - `.btf-schema-muro` → `color`/`stroke` ferro (default `currentColor`);
  - `.btf-schema-quote` → `stroke: var(--btf-cobalto)` ("stesso segno blu", CD §4.4). È un
    segno grafico, non testo: il cobalto pieno va bene (3,7:1 su calcestruzzo, sopra 3:1).
- Uso: inline con `dangerouslySetInnerHTML={{ __html: SCHEMA_MISURA.svg }}` dentro un
  contenitore `aria-hidden` (le tre righe di testo accanto dicono tutto). Nessuna
  informazione solo nel disegno.
- Niente frecce animate.

## 6. Icone `icone/*.svg`

Phosphor **Regular 2.1.1** (MIT, `@phosphor-icons/core@2.1.1` scaricato con `npm pack`),
una famiglia, tratto uniforme (CD §4.5). Aggiunti `aria-hidden="true"` e `width/height="1em"`
(ereditano la misura dal testo, si ridimensionano col `font-size` o con `width/height` nel
CSS). Nessun id.

| File | Phosphor | Dove (px) |
|---|---|---|
| `avviso.svg` | warning | errori sotto i campi, invio fallito (18) |
| `telefono.svg` | phone | "Chiama" nel cartello e nell'invio fallito (20) |
| `email.svg` | envelope-simple | "Scrivi" nel cartello (20) |
| `mappa.svg` | map-pin | riga sede del cartello (20) |
| `esterno.svg` | arrow-up-right | "Apri in Maps", link a Ciceri Lab (16) |
| `menu.svg` | list | bottone "Menu" sotto 720 px (20) |
| `chiudi.svg` | x | "Chiudi" di menu e viste (20) |
| `meno.svg` / `piu.svg` | minus / plus | "Quante uguali", bottoni 44 × 44 (20) |
| `prima.svg` / `dopo.svg` | caret-left / caret-right | "Mese prima/dopo" su mobile (20) |
| `elenco.svg` | list-numbers | "Leggi tutti i mesi" (18) |

Tutte accompagnate da testo visibile o da `aria-label` sul bottone. Le icone sono
arrotondate (è il disegno Phosphor): unica eccezione alla regola "spigolo vivo", accettata
dal CD che le nomina esplicitamente. Licenza in `LICENZA_ICONE` (`index.ts`): al porting va
tenuta anche nel repo del sito.

## 7. Favicon `public/favicon.svg`

Quadrato calcestruzzo `#B8B4AB`, **linea battuta cobalto `#1C4CB4` con un buco** (il fermo),
e il **gancio ferro `#23272B`** all'inizio. È il segno del concept ridotto all'osso: si
legge a 16 px come "linea blu interrotta" sia su linguetta chiara sia su scura (provato su
fondo ferro). Nessuna lettera (il marchio a stencil è un font, non un disegno), nessun
raggio. Senza variante scura: il quadrato calcestruzzo porta il suo fondo.

Lo scaffold lo collega in `index.html` con `<link rel="icon" type="image/svg+xml"
href="/favicon.svg">`. Al porting: il sito ha già il suo favicon, questo resta nello
standalone (tech-architect §3, [S]).

## 8. Come controllare

```bash
# pesi
du -cb src/pages/concepts/battifilo/assets/svg/*.svg src/pages/concepts/battifilo/assets/svg/icone/*.svg public/favicon.svg
```

Aspetto della linea: con il dev server, una tappa battuta a 1440 e a 375 (2×): la linea deve
sembrare gesso (grana, bordi polverosi, densità che cambia), non un nastro liscio né un
tratteggio.

## Richieste ad altri agent

- **section-builder-linea**: tratti battuti alti **24 px** (20-28 ammesso) con la tessera;
  gancio alto 24 px allineato sulla stessa riga, filo da `GANCIO.uscitaFilo`. Nel filo usare
  lo stesso tratto 1,5 del gancio.
- **section-builder-misura**: lati del rettangolo della finestra e tratti della forbice con
  la stessa tessera (lati verticali = span ruotato di 90°); schema a 88 px con
  `.btf-schema-quote { stroke: var(--btf-cobalto) }`.
- **art-director**: decidere se usare `polvere-bordo.svg` (da 32 px in su) o il
  `text-shadow` per la marcatura a spruzzo in `lastra.css`; in ogni caso le tacche a 20-24 px
  restano pulite.
- **scaffold-engineer**: `vite-env.d.ts` con `/// <reference types="vite/client" />` (servono
  i tipi di `?raw` e `?url`); `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.
