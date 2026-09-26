# Vector artist · Concept 20 · IMBRUNIRE

Ondata 2. File esclusivi (tech-architect §4): `src/pages/concepts/imbrunire/assets/svg/*`,
`public/favicon.svg`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/creative-director.md` (tutto, in particolare §2,
§5.1, §6.2, §7.4 passo 4, §11), `docs/trend-researcher.md` (P5, P6, pattern 10, note
§5), `docs/ux-architect.md` (§2.1-2.3, §5.2-5.6, §6.3), `docs/tech-architect.md` (§3,
§4, §7), `docs/brand-strategist.md`, `styles/tokens.css` dell'art-director (colori),
`concepts/10-torchio/docs/vector-artist.md` (solo formato).

## 0. Cosa NON ho disegnato, e perché

Il CD (§8.4, §11) e il trend-researcher (pattern 10) vietano: facciata, mattoni,
cornici, persiane, balconi, mobili, sagome nelle finestre, figure umane, chiavi,
lune disegnate a mano, mappa. Il palazzo è fatto di scatole CSS, la ricchezza sta
nelle foto, la luna è **calcolata** da `luna/disegno.ts` (scaffold). Quindi qui ci
sono solo:

- **9 icone di servizio**, piccole e funzionali, sempre accanto a un testo;
- il **favicon**.

Nessun raster da vettorializzare: `image-to-svg` non serve. Tutto è disegnato a
mano come geometria su griglia 24 (icone) e 64 (favicon).

## 1. Elenco degli asset

| File | viewBox | Peso | Contenuto |
|---|---|---|---|
| `assets/svg/indietro.svg` | 24 | 270 B | freccia verso sinistra con asta: "Torna al palazzo" |
| `assets/svg/porta-sinistra.svg` | 24 | 172 B | triangolo pieno ◂: porta verso la stanza accanto, foto precedente, mese precedente |
| `assets/svg/porta-destra.svg` | 24 | 170 B | triangolo pieno ▸: porta verso la stanza accanto, foto successiva, mese successivo, "Entra" |
| `assets/svg/scala-su.svg` | 24 | 317 B | profilo di tre gradini che salgono + triangolo ▴: "piano di sopra" |
| `assets/svg/scala-giu.svg` | 24 | 310 B | profilo di tre gradini che scendono + triangolo ▾: "piano di sotto" |
| `assets/svg/chiudi.svg` | 24 | 258 B | croce: "Chiudi" del foglio lune, "Chiudi l'elenco" |
| `assets/svg/esterna.svg` | 24 | 256 B | freccia diagonale: "Apri in Maps", link fuori dal sito |
| `assets/svg/calendario.svg` | 24 | 324 B | foglio con due anelli e **un solo quadrato pieno** (la notte d'arrivo): "Aggiungi al calendario" |
| `assets/svg/avviso.svg` | 24 | 324 B | rombo con punto esclamativo: errore sotto un campo (F1) |
| `assets/svg/index.ts` | | | export `?raw`, `ICONE`, `USO_ICONE` (dove e a che misura) |
| `public/favicon.svg` | 64 | 390 B | il palazzo in sezione sul cielo notte, una sola stanza accesa |

Totale SVG: **3,2 KB** (budget tech-architect §7: 12 KB).

## 2. Regole comuni delle icone

- `currentColor` ovunque: prendono il colore del testo accanto (luna, luna spenta,
  notte sul bottone luce). **Nessun hex nelle icone.** Il colore luce `#F2C77C`
  non va mai su un'icona informativa (trend-researcher P6): sull'icona solo se è
  dentro un elemento che è già "acceso/scelto" (bottone primario, luna selezionata).
- Tratto **1,75** su 24 (a 20 px = 1,46 px), capi **piatti** (`butt`) e giunti
  **a spigolo** (`miter`): linee da disegno d'architetto, non da interfaccia
  arrotondata. Le parti "direzione" (◂ ▸ ▴ ▾) sono triangoli **pieni**, come i
  segni di sezione e di quota nelle tavole.
- Attributi fissi: `width="24" height="24"` (da sovrascrivere col CSS:
  `.imb-icona svg { width: 20px; height: 20px }`), `aria-hidden="true"`,
  `focusable="false"`. **Nessun id**, nessun `style`, nessun `transform`,
  nessun `<title>`: si possono ripetere quante volte serve nella stessa pagina.
- L'icona non porta mai significato da sola: il testo accanto dice sempre
  l'azione (UX §2.2: "le porte hanno il nome della destinazione, mai solo una
  freccia"). Un bottone con sola icona non esiste in questo concept.
- Allineamento: `display: inline-flex; align-items: center; gap: 6px` sul
  contenitore; l'icona `flex: none`. Frecce e triangoli sono centrati otticamente
  sulla griglia 24, quindi con la x-height di Commissioner a 16-17 px stanno in
  asse senza correzioni.

### 2.1 Misure consigliate

| Icona | px CSS | Posizione rispetto al testo |
|---|---|---|
| indietro | 20 | prima |
| porta-sinistra | 20 | prima |
| porta-destra | 20 | dopo |
| scala-su / scala-giu | 20 | prima (il testo è il nome della stanza d'arrivo) |
| chiudi | 20 | dopo |
| esterna | 14 | dopo, `margin-left: 2px` |
| calendario | 20 | prima |
| avviso | 16 | prima, allineata alla prima riga del messaggio |

Sotto i 16 px le icone della scala perdono i gradini: non usarle più piccole.

## 3. Favicon `public/favicon.svg`

- **Cosa è**: il palazzo in sezione ridotto al segno. Tetto a falde basso con i
  **due comignoli** del CD §2, tre piani di stanze di larghezze diverse (tre
  stanze sotto il tetto, una stanza larga + una normale al piano nobile, il
  **portico aperto fino a terra** + la colazione al piano terra), muri e solai
  spessi. **Una sola stanza accesa**, la larga del piano nobile (Il Camino): è
  l'immagine del successo (CD §7.7, "resta accesa solo la tua stanza").
- **Colori**: notte `#1F2638` (fondo, angoli raggio 12), intonaco `#BE7359`
  (palazzo), notte profonda `#171C2A` (stanze spente), luce `#F2C77C` (la stanza
  accesa). Nessun altro colore, nessun gradiente.
- **Perché non è "una facciata disegnata"**: non ci sono finestre, cornici,
  persiane o mattoni; sono le celle del palazzo tagliato, come nella pagina, in
  quattro colori piatti. Al primo giro era una "casetta" a capanna con quattro
  riquadri, cioè l'icona generica di una casa: scartata e rifatta più larga che
  alta, più bassa di tetto, con i comignoli e il portico, così si legge come
  palazzo di città.
- **Leggibilità**: muri e solai ≥ 4 unità su 64 (= 1 px a 16 px); a 16 px si
  leggono il tetto, i tre piani e la stanza accesa. Il fondo notte è pieno, quindi
  funziona uguale su barra chiara e scura: nessuna variante `prefers-color-scheme`
  (non serve, e svgo non la rompe).
- `<title>IMBRUNIRE</title>` per chi lo apre da solo. Non si porta nel sito
  (`public/` del sito non si tocca, tech-architect §10): è solo della standalone.

## 4. Ottimizzazione e verifica

- svgo 4 via `npx -y svgo@4`, `multipass`, `floatPrecision: 2`, preset default
  con `convertShapeToPath` e `removeUnknownsAndDefaults` spenti (tengono il
  `rect` del favicon e i `butt`/`miter` espliciti, che proteggono le icone da un
  `stroke-linecap` ereditato da CSS altrui). Guadagno minimo: i sorgenti erano già
  scritti a mano senza ridondanze.
- Render in Chromium headless (playwright globale, `/opt/pw-browsers`) a 1× e 2×:
  icone a 14, 20 e 24 px su notte (in luna e in luna spenta), a 20 px notte su
  luce (bottone primario) e luna su poché; favicon a 16, 32, 64 e 180 px su fondo
  bianco e su barra scura; tre coppie icona + testo reali ("Torna al palazzo",
  "Il Noce, piano di sopra", "Apri in Maps"). Guardati tutti. Tavole in
  `qa/vector-artist/sheet-1x.png` e `sheet-2x.png`.
- Correzioni fatte dopo il render: favicon rifatto (vedi §3); comignoli
  raccordati esattamente alla pendenza del tetto (niente scalini di 0,2 unità).
- Controllo id: `grep id=` sugli SVG delle icone = 0.

## 5. Uso nel codice

```ts
import { ICONE } from '../../assets/svg'
// dentro un bottone o link che ha già il testo:
<span className="imb-icona" dangerouslySetInnerHTML={{ __html: ICONE['indietro'] }} />
```

`?raw` richiede i tipi di `vite/client` (già in `vite-env.d.ts` dello scaffold).
L'alternativa senza `dangerouslySetInnerHTML` è un piccolo componente `Icona` che
fa lo stesso: lo decide chi lo usa; le stringhe sono costanti del modulo, quindi
nessun rischio di iniezione.

## Richieste ad altri agent

- **scaffold-engineer**: `vite-env.d.ts` con `/// <reference types="vite/client" />`
  (serve a `?raw`); `index.html` con `<link rel="icon" type="image/svg+xml"
  href="/favicon.svg">`.
- **section-builder-stanza / spazi / lune / prenota / elenco / cielo**: usare le
  icone solo come in §2.1, sempre con il testo; nessuna icona colorata in luce
  fuori da elementi già accesi; nessuna altra icona disegnata nei componenti (se
  ne serve una nuova, chiederla qui).
