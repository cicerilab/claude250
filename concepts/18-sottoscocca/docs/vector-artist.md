# Vector artist · Concept 18 · SOTTOSCOCCA

Ondata 2. File esclusivi (tech-architect §4): `src/pages/concepts/sottoscocca/assets/svg/*`,
`public/favicon.svg`, questo documento. Porta assegnata 9183 (non usata: nessun dev
server serve per questo lavoro, la verifica è fatta con Chromium headless su pagina
statica).

Letti: `docs/ruoli-agent.md`, `docs/processo-agent.md`, riga 18 di
`docs/matrice-concept-11-20.md`, `docs/creative-director.md` (tutto, in particolare
§4.1 forme e segni ammessi, §4.9 cosa non fare), `docs/tech-architect.md` (§3
struttura, §3.1 porting, §4 file, §10 budget SVG ≤ 10 KB), `docs/ux-architect.md`
(§2 testata e asta, scheda del punto, officina, §10), `docs/brand-strategist.md`
(§1), `docs/trend-researcher.md`, pilota `concepts/10-torchio/docs/vector-artist.md`
(solo formato).

## 0. Cosa serve davvero (e cosa no)

Il concept ha **una sola immagine protagonista, la scena 3D**; tutto il resto è
DOM, Tektur e linee bianche. Il creative-director vieta icone decorative (chiavi
inglesi, ingranaggi, pistoni, carrello, borsa, figure), il trend-researcher chiede
"nessuna icona" nel planning, la ux-architect scrive "Chiudi" come testo. Il
tech-architect assegna a questo ruolo **solo icone di servizio**. Quindi il set è
volutamente minimo:

| Serve a | Asset | Perché non basta il CSS |
|---|---|---|
| Link esterni ("Apri in Maps", "Un concept di CiceriLab", credito Kenney, crediti foto) | `freccia-esterna.svg` | segnale standard di uscita dal sito, stesso tratto ovunque |
| Bottone "Chiudi" della scheda del punto (accanto al testo, mai da sola) | `chiudi.svg` | crocetta a spigolo vivo coerente con la freccia |
| Indice dell'asta graduata (il "triangolo bianco" di ux §2.3) | `indice.svg` | un triangolo pieno pulito a qualsiasi zoom, senza trucchi di bordi CSS |
| Scheda del browser | `public/favicon.svg` | l'unico segno d'identità fuori dalla pagina |

Scartati di proposito: marchio in SVG (il marchio è `h1` in Tektur, testo vero, e
la testata lo usa a 16-18 px: un SVG duplicherebbe il font caricato), icone di
telefono/mappa/orologio (i link dicono "Chiama", "Apri in Maps"), maniglia del
foglio mobile e tratteggi dei buchi (sono CSS: `border` e `repeating-linear-gradient`),
disegni di pezzi meccanici (li mostra la scena 3D, e un secondo linguaggio
figurativo farebbe concorrenza al modello).

## 1. Metodo

- **Nessun raster da vettorializzare**: l'officina è inventata, non c'è logo
  esistente; `image-to-svg` non si usa (la regola del ruolo lo riserva ai raster
  reali). Tutti gli SVG sono disegnati a mano come geometria su griglia intera.
- Ottimizzazione: `npx svgo@4`, `multipass`, precisione 2 decimali,
  `removeViewBox` e `convertShapeToPath` disattivati, attributi `aria-*`
  conservati, `sortAttrs`. Sorgenti leggibili e config nello scratchpad della
  sessione (non nel repo: sono solo input).
- Verifica: ogni file renderizzato in Chromium headless (playwright globale,
  `/opt/pw-browsers`) a 1× e 2×, in `currentColor` bianco segnaletica su nero
  grasso `#1C1D1B`, verde ombra `#44584A` e verde macchina `#5E7564`, a 16 px accanto
  al testo e a 64 px isolati; il favicon a 16, 32, 64 e 180 px. Guardati entrambi i
  giri (bozza e file finali installati): a 16 px il favicon si legge ancora come
  "auto alzata tra due colonne", freccia e crocetta restano nitide accanto al testo
  a 17 px.

## 2. Elenco degli asset

| File | viewBox | Peso | Contenuto |
|---|---|---|---|
| `assets/svg/freccia-esterna.svg` | `0 0 16 16` | 201 B | freccia diagonale in alto a destra, tratto 1,8 |
| `assets/svg/chiudi.svg` | `0 0 16 16` | 190 B | crocetta, tratto 1,8 |
| `assets/svg/indice.svg` | `0 0 12 12` | 132 B | triangolo pieno che punta a destra |
| `assets/svg/index.ts` | | | export `?raw` + mappa `ICONE` |
| `public/favicon.svg` | `0 0 32 32` | 339 B | ponte a due colonne con l'auto alzata |

**Totale SVG: 862 B** (budget tech-architect §10: ≤ 10 KB).

Regole comuni:
- colore sempre `currentColor` (tranne il favicon, che non eredita); nessun `style`
  inline, nessun `transform`, nessun hex fuori dai token nelle icone;
- **spigolo vivo** come chiede il CD 4.1: `stroke-linecap="square"`, giunti a
  mitra, triangolo senza arrotondamenti;
- `aria-hidden="true"` già nel file: sono segnali, l'etichetta è sempre il testo
  accanto;
- **nessun `id`** in nessun file: si possono inserire inline quante volte serve
  (la freccia compare almeno 4 volte tra Officina e Piede) senza id duplicati.

## 3. Uso

```ts
import { frecciaEsterna, chiudi, indice, ICONE } from '../../assets/svg'

// accanto al testo, larga 1em, eredita il colore del link
<a className="ssc-officina__maps" href={MAPS_URL} target="_blank" rel="noopener">
  {testi.officina.maps}
  <span className="ssc-icona" aria-hidden="true" dangerouslySetInnerHTML={{ __html: frecciaEsterna }} />
</a>
```

CSS consigliato (nel css della sezione che la usa, prefisso `ssc-`):
`.ssc-root .ssc-icona { display:inline-block; inline-size:1em; block-size:1em; flex:none }`
e `.ssc-root .ssc-icona > svg { display:block; inline-size:100%; block-size:100% }`.

Per sezione:
- **officina-piede**: `freccia-esterna` dopo il testo di ogni link che apre un altro
  sito (Maps, cicerilab.com, pagina Kenney, pagine Unsplash dei fotografi), sempre
  con `target="_blank" rel="noopener"` e testo che basta da solo. Non su
  "Chiama"/"Scrivi" (non escono dal sito in una scheda) né sui link interni
  (indice del piede, "Ricomincia da capo", "Trova un buco").
- **punti-lavoro**: `chiudi` a destra della parola "Chiudi" nel bottone 44 × 44 della
  scheda, a 16 px. Mai da sola: il nome accessibile resta "Chiudi" (testo), come da
  ux §7.5.
- **asta-testata**: `indice` a 12 × 12 px accanto all'asta, punta verso la riga
  (verso destra se l'etichetta del numero sta a sinistra dell'asta, come su mobile
  ux §2.4; per l'altro verso `transform: scaleX(-1)` sul contenitore, non sul file).
  Colore bianco segnaletica. Si muove con la variabile della quota sul contenitore,
  l'SVG resta fermo. In alternativa si può usare `?url` come `mask-image`, ma inline
  è più semplice e non costa una richiesta.

`index.ts` non tocca `window` né `document` (va bene per il prerender); `?raw` è un
suffisso nativo di Vite, come chiedono le regole di porting (§3.1).

## 4. `public/favicon.svg`

Quadrato nero grasso `#1C1D1B` a spigolo vivo: due colonne verdi `#5E7564` del ponte,
due bracci corti verdi, l'auto **bianco segnaletica** `#F0EFE9` alzata a metà colonna
(vista di lato, sagoma a tre volumi con i due finestrini ritagliati in nero), la
linea bianca a terra sotto. È la metafora in un segno solo: l'auto staccata da
terra sul ponte. Solo i tre colori del concept, nessuna chiave inglese o ingranaggio.

- Griglia 32 unità, bordi su interi: a 16 e 32 px le colonne e la linea a terra
  cadono su pixel pieni.
- Nessuna variante per il tema scuro: il fondo è già scuro e sulla barra schede
  chiara resta un quadrato netto; su quella scura verde e bianco si staccano dal
  bordo.
- Collegamento (scaffold, `index.html`):
  `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
- Al porting nel sito vero il favicon non si porta (è del sito cicerilab), come dice
  la legenda [S] del tech-architect.

## Richieste ad altri agent

- **scaffold-engineer**: in `index.html` il `<link rel="icon" href="/favicon.svg"
  type="image/svg+xml">`; in `vite-env.d.ts` `/// <reference types="vite/client" />`
  (serve per gli import `?raw` di `assets/svg/index.ts`); se si crea una classe
  condivisa per le icone, usare il CSS di §3 (altrimenti la mette ogni sezione).
- **section-builder-officina-piede**, **section-builder-punti-lavoro**,
  **section-builder-asta-testata**: uso come in §3. Nessuna icona senza testo
  accanto, nessuna icona aggiunta oltre a queste senza passare dal vector-artist.
- **copywriter**: nessuna richiesta di testo; le etichette dei link esterni devono
  bastare da sole (la freccia è `aria-hidden`). Se si vuole dire che il link apre
  un'altra scheda, lo si scrive nel testo nascosto `ssc-sr` ("si apre in un'altra
  scheda"), non nella freccia.
