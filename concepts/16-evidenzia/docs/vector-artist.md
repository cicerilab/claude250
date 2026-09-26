# Vector artist · Concept 16 · EVIDENZIA

Ondata 2. File esclusivi (tech-architect §4): `src/pages/concepts/evidenzia/assets/svg/*`,
`src/pages/concepts/evidenzia/tratto/forma.ts`, `public/favicon.svg`, questo
documento. Porta 9165 non usata: la verifica è fatta con Chromium headless su una
pagina statica di prova (font veri da Google Fonts, carta `#E4DFD1`).

Letti: `docs/ruoli-agent.md`, `docs/creative-director.md` (tutto, in particolare
4.1 forme, 4.4 il tratto, 4.5 marcatori, 4.7 cosa non fare), `docs/tech-architect.md`
(§3, §4, §5, §7.2-7.3, §8, §12), `docs/ux-architect.md` (§5.3-5.6: bottoni
Evidenzia, Prima/Dopo, Rimetti nella pagina, striscia foto, marcatori),
`docs/trend-researcher.md` (P1, P8: "3-4 forme base di estremità combinate col
seme"), `docs/brand-strategist.md`, pilota `concepts/10-torchio/docs/vector-artist.md`
(solo formato).

## 0. Cosa serve (e cosa no)

EVIDENZIA è fatto di testo stampato: l'unica immagine disegnata è **il tratto
dell'evidenziatore**. Per questo il grosso del lavoro è `tratto/forma.ts`
(geometria), non le icone. Le icone sono solo di servizio, sempre accanto a un
testo.

Scartati di proposito: marchio SVG (la testata è `h1` in Libre Franklin 900,
testo vero), icone di telefono/casa/mappa/orologio/metri quadri (il giornale
scrive "Chiama", "tre camere"), spilli a goccia e mappa disegnata (CD 4.7), figure
umane, ornamenti, filetti (sono CSS), marcatori in SVG statico (i marcatori sono
tratti generati da `formaTratto`, vedi §3.4).

## 1. Metodo

- **Tutto disegnato a mano come geometria.** Nessun raster da vettorializzare,
  quindi nessun passaggio di `image-to-svg`.
- Icone: tracciati scritti a mano su griglia 24, tratto 2,25 (lo stesso spessore
  di Phosphor Bold a 24 px), `stroke-linecap="square"`, `stroke-linejoin="miter"`:
  spigolo vivo come chiede il CD 4.1.
- **Unica eccezione**: l'icona dell'evidenziatore è il tracciato di Phosphor
  "Highlighter" peso **Bold** (`@phosphor-icons/core` 2.1.1, `assets/bold/highlighter-bold.svg`,
  licenza MIT, Copyright (c) 2023 Phosphor Icons), come deciso da CD 4.4 e
  tech-architect §1.1. Scelto il Bold e non il Regular perché sta accanto a
  Libre Franklin 700-800 e le altre icone hanno lo stesso spessore.
- Ottimizzazione: `svgo@4` via `npx` (multipass, precisione 2, viewBox e
  `<title>` mantenuti). Guadagno piccolo: i file erano già scritti a mano.
- Verifica: pagina di prova renderizzata a 1× e 2× (tratti su righe vere in
  Libre Franklin 800 a 15, 16, 22, 34 px, 6 semi sulla stessa riga, due righe,
  scarico, macchie; icone a 24 e 20 px, dentro bottoni neri e a contorno;
  favicon a 16/32/64/128). Test automatico su 3.000 semi × 7 misure × pieno e
  scarico: **0** valori NaN, **0** punti fuori dal viewBox; tratto identico a
  parità di seme. Tempo di calcolo: 0,3 ms per tratto (Node 22). Screenshot in
  `concepts/16-evidenzia/qa/vector/` (`anteprima-2x.png`, `zoom.png`, `fav.png`).
  Due giri di correzione: NaN da potenze di numeri negativi per arrotondamento,
  punte "pressata" tagliate dal bordo del viewBox (ora il corpo sta dentro un
  margine orizzontale).

## 2. Elenco degli asset

| File | viewBox | Peso | Contenuto |
|---|---|---|---|
| `assets/svg/evidenziatore.svg` | `0 0 256 256` | 600 B | Phosphor Highlighter Bold, pieno |
| `assets/svg/freccia-su.svg` | `0 0 24 24` | 270 B | freccia in su (bottone **Prima**) |
| `assets/svg/freccia-giu.svg` | `0 0 24 24` | 271 B | freccia in giù (bottone **Dopo**) |
| `assets/svg/indietro.svg` | `0 0 24 24` | 269 B | freccia a sinistra ("Rimetti nella pagina", "Torna alla pagina" a 1440) |
| `assets/svg/chiudi.svg` | `0 0 24 24` | 260 B | croce ("Rimetti nella pagina ✕" sotto i 640 px) |
| `assets/svg/precedente.svg` | `0 0 24 24` | 255 B | chevron ‹ (striscia foto della scheda) |
| `assets/svg/successiva.svg` | `0 0 24 24` | 254 B | chevron › |
| `assets/svg/freccia-esterna.svg` | `0 0 24 24` | 261 B | freccia diagonale per i link che escono (OSM, Unsplash, CiceriLab) |
| `assets/svg/index.ts` | | | export `?raw`, mappa `ICONE`, `USO_ICONE` |
| `public/favicon.svg` | `0 0 64 64` | 362 B | "E" nera su carta con un tratto rosa sotto |
| `tratto/forma.ts` | | 13 KB sorgente | geometria del tratto (§3) |

Totale SVG: **5,1 KB** (budget tech-architect §8: ≤ 20 KB).

Regole comuni delle icone:
- `fill`/`stroke` in `currentColor`: il colore lo decide il CSS (sempre nero
  stampa o carta sul bottone nero; **mai rosa**, CD 4.7).
- `width="24" height="24"` come misura di riposo; chi le inserisce le ridimensiona
  da CSS (`.evd-… svg { width: 20px; height: 20px }`).
- `aria-hidden="true"` e `focusable="false"` già nel file; **nessun id**: il
  bottone Evidenzia compare in 20-24 annunci e gli id si duplicherebbero.
- Nessun `transform`, nessuno `style` inline.
- A 20 px il tratto di 2,25 unità diventa 1,9 px: leggibile a 1× e a 2× (verificato).

Import:

```ts
import { evidenziatore, frecciaSu, ICONE } from '../assets/svg'
<span className="evd-annuncio__icona" dangerouslySetInnerHTML={{ __html: evidenziatore }} />
```

## 3. Il tratto: `tratto/forma.ts`

### 3.1 API (contratto §7.2 del tech-architect, esteso senza rompere)

```ts
interface OpzioniForma { larghezza: number; altezza: number; seme: number; scarico?: boolean }
interface FormaTratto {
  d: string                       // corpo (un sottotracciato chiuso; nello scarico uno per striscia)
  striature: readonly string[]    // fili più chiari, tutti dentro il corpo
  inchiostro: string              // due pozze alle estremità ('' nello scarico)   ← aggiunto
  viewBox: string                 // "0 0 larghezza altezza": unità = px CSS
  punte: { inizio: Punta; fine: Punta }                                          ← aggiunto
  sbieco: number                  // px, sbieco della punta a scalpello           ← aggiunto
}
formaTratto(o): FormaTratto
variazione(seme): { dy: number; rotazione: number }   // |dy| ≤ 2 px, rotazione in [-0,6°, 0,6°]
semePerRiga(seme, riga): number                       // seme della seconda riga (riga 0 = seme stesso)
ingombroTratto(larghezzaRiga, corpo): { larghezza, altezza, sbordo }
PUNTE, RAPPORTO_ALTEZZA (1,15), DY_MAX (2), ROTAZIONE_MAX (0,6)
```

Pura: nessun DOM, nessun `Math.random` (PRNG mulberry32 interno, così il file
non dipende da `core/semi.ts`; il seme in ingresso lo dà `semeDa(id)` dello
scaffold). Stesse misure + stesso seme = stessa stringa, sempre.

### 3.2 Come è fatto

- **Corpo a parallelogramma "/"**: la punta a scalpello tenuta inclinata lascia
  due estremità parallele, sbieco da un angolo di 14-24° (mai più di un quinto
  della lunghezza). I bordi alto e basso ondeggiano di pochissimo (onda a due
  armoniche, ampiezza ≤ 3,2% dell'altezza e ≤ 1,1 px), con una leggera deriva e
  un po' più di spessore all'attacco, dove la punta preme.
- **Quattro forme d'estremità**, scelte dal seme separatamente per inizio e fine
  (16 combinazioni, più angolo e onde diverse: venti tratti in pagina non sono
  copie, trend-researcher P8):
  - `netta`: taglio pulito;
  - `consumata`: spigolo esterno arrotondato, punta usata;
  - `sfrangiata`: un dente in fuori e una rientranza, la punta che si alza;
  - `pressata`: pancia in fuori, l'inchiostro che si allarga quando la punta si ferma.
- **Striature**: 2 o 3 fili più chiari nel senso del tratto (1 sui tratti corti,
  0 sotto 2,2 × altezza), affusolati ai capi, sempre lontani dai bordi; sulle
  righe lunghe un filo si interrompe una volta.
- **Inchiostro**: due pozze che ripetono esattamente l'estremità del corpo e si
  chiudono verso l'interno con una curva inclinata come la punta. Stampate sopra
  il corpo danno "più inchiostro all'inizio e alla fine" (CD 4.4).
- **Scarico**: 4-6 strisce separate da vuoti, capi sfilacciati e di lunghezze
  diverse, niente pozze, niente striature. È la forma intera: il fermarsi a metà
  e il ritirarsi sono del motion-designer (`motion/tratto.ts` → `scarico()`).
- Il corpo sta dentro un margine orizzontale di `min(0,14 × altezza, 8% della
  larghezza)`: le punte che sporgono non vengono mai tagliate.

### 3.3 Resa consigliata (per `tratto/Tratto.tsx` e `tratto/tratto.css`, interaction-designer)

Verificata a schermo nella pagina di prova (vedi `qa/vector/zoom.png`):

```html
<svg class="evd-tratto" viewBox={f.viewBox} width={ing.larghezza} height={ing.altezza} aria-hidden="true">
  <path class="evd-tratto__corpo" d={f.d} />
  <path class="evd-tratto__inchiostro" d={f.inchiostro} />   <!-- se non vuoto -->
  {f.striature.map(s => <path class="evd-tratto__stria" d={s} />)}
</svg>
```

| Classe | Riempimento | Nota |
|---|---|---|
| `.evd-tratto` | `mix-blend-mode: multiply` sull'`<svg>` intero | il gruppo si compone prima, poi moltiplica sul testo: il nero resta nero |
| `__corpo` | `var(--evd-rosa)`, `fill-opacity: .8` | con le pozze sopra si arriva a circa 0,88 agli estremi: l'opacità 0,85 del CD in media |
| `__inchiostro` | `var(--evd-rosa)`, `fill-opacity: .42` | |
| `__stria` | `var(--evd-carta)`, `fill-opacity: .5` | colore carta sopra il rosa = rosa più chiaro; le striature non escono mai dal corpo, quindi non sporcano la carta |
| scarico | `__corpo` con `fill-opacity: .5` | pallido e a strisce |

Niente maschere e niente id: un tratto si può ripetere (annuncio, tappa del giro,
"Hai segnato") senza collisioni.

**Posizione sulla riga** (dalle `righe` del registro):
- `const ing = ingombroTratto(riga.w, corpo)`: altezza = 1,15 × corpo, `sbordo` =
  0,32 × altezza per lato, così lo sbieco copre anche la prima e l'ultima lettera;
- `left = riga.x - ing.sbordo`;
- centro verticale = centro della riga misurata **meno 0,07 × corpo** (con Libre
  Franklin il box della riga è sbilanciato verso il basso: senza questa
  correzione il tratto copre i discendenti e scopre la cima delle maiuscole;
  verificato a 15, 22 e 34 px);
- poi `translateY(dy)` e `rotate(rotazione deg)` da `variazione(semePerRiga(seme, riga))`,
  `transform-origin` a sinistra al centro;
- seconda riga: `semePerRiga(seme, 1)`, per avere punte diverse dalla prima.

`clip-path: inset(0 calc((1 - var(--evd-avanzamento)) * 100%) 0 0)` sul nodo foglia
funziona come previsto dal tech-architect: il bordo che avanza è un taglio
verticale, la punta a scalpello compare a fine corsa.

### 3.4 Altri usi della stessa forma

- **Marcatori della mappa** (section-builder-mappa): macchia `formaTratto({ larghezza: 38,
  altezza: 26, seme: semeDa(id) })` dentro il `divIcon`, numero di tappa sopra in
  Libre Franklin 800 nero. Verificata a schermo: si legge come una macchia di
  evidenziatore, non come uno spillo. Classi CSS come in §3.3, nessun colore in JS.
- **Posti della barra del giro** e **segni della minipagina**: `larghezza: 22,
  altezza: 12` (sotto 2,2 × altezza non ci sono striature: resta una pennellata
  netta).
- **Tratto dimostrativo su "Segna"** e **tappe del giro**: stesso componente, stesso
  seme dell'annuncio (le tappe riportano il tratto identico a quello del foglio).

## 4. Favicon `public/favicon.svg`

- Tessera carta `#E4DFD1`, "E" nera `#1C1C1A` disegnata come un solo poligono
  (asta 12, bracci 10: peso di un 900), sotto un tratto `formaTratto(58 × 24, seme 3)`
  che sporge a sinistra e a destra della lettera. È la testata evidenziata.
- Il rosa è **precalcolato** `#D54F82` (= `#EE5A9E` moltiplicato su `#E4DFD1`):
  il nero della E sta sopra, quindi il risultato è identico a un `multiply` senza
  dipendere dal supporto dei blend nei favicon.
- Nessuna variante scura: ha il suo fondo, si legge su barre chiare e scure.
- Colori esadecimali ammessi qui perché il file sta fuori dal CSS (non può leggere
  i token). `<title>EVIDENZIA</title>`.
- Verificato a 16, 32, 64 e 128 px (`qa/vector/fav.png`): a 16 px si leggono la E e
  la fascia rosa ai due lati.
- Nel sito vero il favicon è quello di CiceriLab: questo vale solo per l'app
  standalone (file **[S]**).

## 5. Porting

`assets/svg/*` e `tratto/forma.ts` stanno dentro `evidenzia/` e si copiano con il
concept; gli SVG si importano con `?raw` (serve `vite/client` nei tipi, già nel
sito). `public/favicon.svg` non si porta.

## Richieste ad altri agent

- **interaction-designer** (`tratto/Tratto.tsx`, `tratto/tratto.css`): usare la resa
  di §3.3 (tre livelli di path, multiply sull'`<svg>`, nessuna maschera) e la
  posizione con `ingombroTratto` e la correzione verticale di 0,07 × corpo.
- **art-director**: esporre `--evd-carta` e `--evd-rosa` in `tokens.css` (servono
  alle striature e al corpo); le icone prendono `currentColor`, quindi basta il
  colore del testo del bottone.
- **motion-designer**: `scarico()` anima una forma che è già a strisce
  (`formaTratto({ …, scarico: true })`); il fermarsi a metà è un `clip-path` al
  50% circa e il ritiro, nessuna forma diversa da chiedermi.
- **section-builder-mappa**: marcatori come in §3.4; il marcatore dell'agenzia [A]
  resta un quadrato CSS nero (non rosa), nessun SVG.
- **scaffold-engineer**: `vite-env.d.ts` con `/// <reference types="vite/client" />`
  per gli import `?raw` di `assets/svg/index.ts`; `core/semi.ts` restituisca semi
  interi a 32 bit senza segno (li uso con `>>> 0`, vanno bene anche con segno).
