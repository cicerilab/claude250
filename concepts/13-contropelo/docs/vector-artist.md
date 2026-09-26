# Vector artist · Concept 13 · CONTROPELO

Ondata 2. File esclusivi (tech-architect §4): `src/pages/concepts/contropelo/assets/svg/icone.ts`,
`tratti.ts`, `Icona.tsx`, `public/favicon.svg`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/creative-director.md` (tutto, in particolare §4.3,
§5.3, §6.4, §7, §9, §12), `docs/tech-architect.md` (§0.8, §3, §4, §8, §12, richieste),
`docs/ux-architect.md` (§2.2-2.3, §5.2-5.8, §6, §8), `docs/trend-researcher.md`
(divieto 4, §6), `docs/brand-strategist.md`, `concepts/10-torchio/docs/vector-artist.md`
e `concepts/20-imbrunire/docs/vector-artist.md` (solo formato).

## 0. Cosa NON ho disegnato, e perché

CD §4.3, §9, §12 e trend-researcher (divieto 4): niente forbici, rasoi, pettini, baffi,
palo a strisce (nemmeno nel favicon), sagome, figure umane, logo disegnato (l'insegna è
testo in Limelight), mappa. Il vapore è il canvas, non un SVG. Qui ci sono solo:

- **7 icone di servizio** (5 Phosphor Light copiate come path + 2 disegnate a mano
  sulla stessa griglia), sempre accanto a un testo o dentro un bottone con `aria-label`;
- **4 tratti a pennarello** generati alla misura vera: sottolineatura del nome,
  trattino del posto libero (3 varianti), tratteggio della seconda mezz'ora, cerchio
  del fuoco;
- il **favicon**.

Nessun raster da vettorializzare: `image-to-svg` non serve. Nessuna dipendenza
`@phosphor-icons/*` (tech-architect §0.8): il pacchetto `@phosphor-icons/core@2.1.1` è
stato scaricato con `npm pack` in una cartella temporanea solo per copiare i path.

## 1. Elenco degli asset

| File | Contenuto | Peso |
|---|---|---|
| `assets/svg/icone.ts` | `ICONE` (7 icone come dati: `modo`, `d`), `NomeIcona`, `VIEWBOX_ICONA`, `TRATTO_ICONA`, `USO_ICONE` | 1,6 KB di path |
| `assets/svg/tratti.ts` | funzioni pure `sottolineatura()`, `trattino()`, `tratteggio()`, `cerchio()`; `SPESSORE_TRATTO`, `TRATTEGGIO`, `STACCO_CERCHIO` | generati (0,1-1,1 KB a tratto) |
| `assets/svg/Icona.tsx` | componenti `<Icona />` e `<Tratto />` | |
| `public/favicon.svg` | lo specchio appannato con la passata e il trattino turchese | 678 B |

SVG consegnato al browser: ≈ 2,3 KB di path + favicon 0,7 KB, dentro il budget di
12 KB (tech-architect §8). I file sorgente pesano di più solo per i commenti.

Regole comuni: **nessun id** nelle icone e nei tratti (si ripetono liberamente nella
pagina); **nessun colore fisso** (`currentColor`); nessun `style` inline nei path;
nessun accesso al DOM né `Math.random` (i tratti sono deterministici: stesso input =
stesso disegno, anche al prerender). Unico SVG con colori e un id è il favicon, che
non può ereditare colore: id `ctp-fav-vapore`, col prefisso del concept.

## 2. Icone (`icone.ts` + `<Icona />`)

Griglia 256, tratto Light di Phosphor (12 unità: 0,94 px a 20 px, 1,03 px a 22 px).
Sul pennarello `#FAFAF6` su parete o vetro si leggono bene da 16 px in su (verificato).

| Nome | Origine | Dove (ux) | Misura |
|---|---|---|---|
| `info` | Phosphor `info` Light | fascia alta < 640 px: bottone "Informazioni" solo icona, 44 × 44, `aria-label` sul bottone | 22 px |
| `chiudi` | Phosphor `x` Light | pannello Informazioni, "chiudi" 44 × 44 | 20 px |
| `avviso` | Phosphor `warning-circle` Light | prima di ogni errore (L6e, L8), Figtree 15 | 18 px |
| `esterna` | Phosphor `arrow-up-right` Light | dopo "Apri in Maps" | 0,8 em |
| `telefono` | Phosphor `phone` Light | prima di "Chiama" (vetro di Samir, riga di stato, invio fallito) | 0,8 em |
| `vapore` | a mano | interruttore "Specchio pulito" con `aria-pressed="false"` | 22 px |
| `pulito` | a mano | interruttore "Specchio pulito" con `aria-pressed="true"` | 22 px |

**Le due icone dello specchio** (ux §8.4: l'etichetta non cambia, cambia l'icona):
stesso quadrato a spigolo vivo (giunti `miter`, come il bisello degli specchi, CD §4.3);
`vapore` ha tre righe spezzate nella metà bassa (il vapore è più fitto in basso, CD §6.2),
`pulito` ha i due riflessi obliqui in alto a sinistra. Si distinguono per forma, non per
colore. Sono a tratto (`modo: 'tratto'`), le Phosphor sono piene (`modo: 'pieno'`):
`<Icona />` gestisce i due casi.

Le frecce "domani →", "← oggi", "la lista →" **non sono icone**: sono caratteri scritti a
pennarello (brand-strategist §3, "→" è un segno che il barbiere disegna davvero).

### API

```tsx
import { Icona } from '../../assets/svg/Icona'

<Icona nome="avviso" dimensione={18} />            // aria-hidden (predefinito)
<Icona nome="esterna" />                            // 1em: segue il corpo del testo
<button aria-label="Informazioni"><Icona nome="info" dimensione={22} /></button>
<Icona nome={pulito ? 'pulito' : 'vapore'} dimensione={22} />
```

Props: `nome: NomeIcona`, `dimensione?: number | string` (predefinito `'1em'`),
`etichetta?: string` (solo se l'icona è l'unico contenuto e il controllo non ha
`aria-label`: allora diventa `role="img"`), `className?`, `style?`. Classe base
`ctp-icona`, attributo `data-icona="<nome>"`, sempre `focusable="false"`. Allineamento
verticale e margini li decide chi la usa (consiglio `vertical-align: -0.125em` accanto al
testo, `flex: none` nei flex).

## 3. Tratti a pennarello (`tratti.ts` + `<Tratto />`)

Un pennarello ha tratto uniforme e capi tondi: tutti i tratti sono un solo `path` a
tratto, `stroke-linecap/linejoin="round"`, `currentColor` (chi li usa mette
`color: var(--ctp-turchese)` sul contenitore). Sono generati **alla misura vera in px**
(`viewBox` = larghezza × altezza), così lo spessore non si deforma su nessuna lunghezza.
Tutti tranne il tratteggio hanno `pathLength="1"`: per tracciarli basta
`stroke-dasharray: 1; stroke-dashoffset: 1 → 0` in CSS, qualunque sia la lunghezza. Il
path ha la classe `ctp-tratto__segno`; l'svg ha `ctp-tratto ctp-tratto--<tipo>` ed è
sempre `aria-hidden` (il significato sta nel testo nascosto della riga).

| Tipo | Uso | Misura | Spessore |
|---|---|---|---|
| `sottolineatura` | il tuo nome dopo "Segna" (L10, L13); si traccia in 400 ms | larghezza = larghezza del nome **misurata** (`offsetWidth`), altezza 14 | 3 px |
| `trattino` | posto libero al posto del nome (CD §7.1); varianti 0/1/2 | larghezza predefinita 48 (consiglio 56 su Mansalva 28), altezza 12 | 3 px |
| `tratteggio` | seconda mezz'ora di "taglio e barba" (CD §7.2) | predefinita 96, altezza 12, `stroke-dasharray: 5 7` | 3 px |
| `cerchio` | fuoco da tastiera attorno al posto libero (CD §4.3, §11) | rettangolo da circondare; sborda da sé | 2 px |

**Sottolineatura**: un colpo solo che parte un po' basso, scende appena a un terzo e
risale con un guizzo finale (la punta che si stacca dal vetro). `seme` (es. indice della
mezz'ora) cambia di poco l'andamento: ogni nome ha la sua.

**Trattino**, tre mani: 0 dritto che sale appena, 1 leggera pancia in giù, 2 con
l'attacco della punta a sinistra. Differenze volutamente minime (è la stessa mano).
Suggerimento: `variante = indiceMezzora % 3`.

**Cerchio del fuoco**: giro a mano libera, non chiuso: parte in alto a sinistra, fa un
giro e un pezzo, la fine passa un po' fuori dall'inizio; forma tra ellisse e rettangolo
(superellisse di grado 4), leggermente ruotata, così abbraccia righe basse e larghe
invadendo poco le righe vicine. Il bordo interno del tratto resta **almeno 2 px** fuori
dal rettangolo in ogni punto (`STACCO_CERCHIO`, CD §11: 2 px di stacco). Si posiziona da
solo: `position: absolute; left/top: -sborda; pointer-events: none`, quindi il genitore
dev'essere `position: relative`. Su 56 × 22 (il trattino) il tratto esce di circa 9 px
sopra e sotto (l'svg è più grande: `sborda` 16): in una riga da 44 px con il trattino
alto 22 px resta dentro la riga e non tocca i nomi sopra e sotto. Attorno a un bottone
alto 44 px esce di circa 11 px: meglio circondare il trattino, non tutto il bottone.

### API

```tsx
import { Tratto } from '../../assets/svg/Icona'

<Tratto tipo="trattino" variante={(i % 3) as 0 | 1 | 2} larghezza={56} />
<Tratto tipo="tratteggio" larghezza={96} />
<Tratto tipo="sottolineatura" larghezza={larghezzaNome} seme={i} className="ctp-lista__sotto" />
<span style={{ position: 'relative' }}>   {/* il bottone del posto libero */}
  <Tratto tipo="cerchio" larghezza={56} altezza={22} seme={i} />
</span>
```

I dati puri (`sottolineatura(w, seme)`, `trattino(v, w)`, `tratteggio(w)`,
`cerchio(w, h, seme)`) restituiscono `{ larghezza, altezza, viewBox, d, spessore, sborda }`
se a qualcuno serve il path senza componente.

## 4. Favicon (`public/favicon.svg`)

Lo specchio visto da vicino: quadrato vetro `#232A2C` coperto di vapore `#CDD5D4`
(più fitto in basso, 0,82 → 0,96), attraversato da **una passata ad arco** del palmo che
lo pulisce, e sul vetro pulito **un trattino turchese** `#2A9D96`: "qui c'è posto".
Bordo `#48555A` di 2/64 come il bisello. Nessun palo, nessuna forbice, nessuna lettera.
Una sola variante (il sito ha un solo tema scuro, CD §4.1); leggibile anche su fondo
chiaro delle schede del browser, perché il quadrato ha il suo fondo.

Provate due versioni (screenshot `qa/vector-artist/favicon-a-b.png`): A con la passata
dritta in diagonale (a 256 px sembrava una capsula, un oggetto) e **B con la passata ad
arco** (si legge come un gesto): tenuta B. A 16 px resta "quadrato grigio chiaro con
un'arcata scura"; il turchese si vede da 32 px.

## 5. Licenza Phosphor

Icone `info`, `chiudi` (x), `avviso` (warning-circle), `esterna` (arrow-up-right),
`telefono` (phone), peso Light, da `@phosphor-icons/core` 2.1.1
(https://github.com/phosphor-icons/core), file `assets/light/<nome>-light.svg`.

```
MIT License

Copyright (c) 2023 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Il copywriter può citarla nel pannello Informazioni ("Icone: Phosphor, licenza MIT").

## 6. Metodo e verifiche

- Icone Phosphor: path copiati identici dai file `assets/light/*-light.svg` del
  pacchetto (verificato con `diff` per `phone`). Già ottimizzati all'origine.
- Icone a mano e tratti: scritti come geometria (comandi relativi, 1 decimale).
- Favicon: `svgo@4` via `npx` (multipass, precisione 2, `cleanupIds` disattivato per
  tenere l'id col prefisso): 726 → 678 B.
- Typecheck: `tsc` 5.6.3 con le opzioni del tech-architect (`strict`,
  `noUncheckedIndexedAccess`, `noUnused*`, `jsx: react-jsx`) sui tre file: verde.
- Resa: i tre file compilati con `tsx` e renderizzati con `react-dom/server`
  (`renderToStaticMarkup`, cioè il markup vero dei componenti), pagina di prova con i
  font veri (Mansalva, Figtree da Google) e i colori della palette, screenshot in
  Chromium headless a 2× (`qa/vector-artist/prove-svg.png`), **guardati**:
  icone a 16/20/24/48 px su parete; icone accanto a testo su vetro (errore, "Apri in
  Maps", "Chiama", interruttore nei due stati); lista a Mansalva 28 con trattini 0/1/2,
  cerchio del fuoco e tratteggio; sottolineatura sotto nomi da 48 a 150 px e a metà
  tracciamento (`dashoffset .5`); cerchio su 56×22, 120×40, 30×30, 200×44; favicon a
  16/32/64/256 su scuro e chiaro. Nessun id nel markup generato.

## Richieste ad altri agent

- **section-builder-lista**: per la sottolineatura misurare la larghezza del nome
  (`useLayoutEffect` + `offsetWidth` dello span del nome, già con Mansalva caricato)
  e passarla a `<Tratto tipo="sottolineatura" />`; il genitore del cerchio del fuoco
  dev'essere `position: relative`. Il cerchio va mostrato solo con `:focus-visible`
  (si può rendere sempre e mostrarlo via CSS: `.ctp-tratto--cerchio { opacity: 0 }`,
  `:focus-visible > .ctp-tratto--cerchio { opacity: 1 }`), e in quel caso il bottone
  toglie l'outline standard.
- **motion-designer**: la sottolineatura (400 ms) e un eventuale tracciamento del
  trattino dopo "cancella" usano `stroke-dasharray: 1` e `stroke-dashoffset` da 1 a 0
  su `.ctp-tratto__segno`; con reduced motion `stroke-dashoffset: 0` subito.
- **section-builder-mensola / fascia**: l'interruttore usa
  `<Icona nome={premuto ? 'pulito' : 'vapore'} dimensione={22} />`; "Informazioni" su
  mobile `<Icona nome="info" dimensione={22} />` dentro il bottone con `aria-label`.
- **scaffold-engineer**: `index.html` con
  `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.
