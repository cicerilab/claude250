# Photo-editor · 18 SOTTOSCOCCA

Ondata 2. File miei: `docs/photo-editor.md`, `src/pages/concepts/sottoscocca/assets/foto/*`
(12 WebP + `index.ts`). Nessun altro file toccato.

## Fonti e metodo

- **Unsplash**: la ricerca (`unsplash.com/napi/search`) risponde 307 (controllo
  anti-bot). Senza la ricerca non posso sapere autore e URL di una foto, quindi
  **niente Unsplash**.
- **Openverse** (`api.openverse.org`, licenze commerciali e modificabili) per
  cercare in Wikimedia Commons, Flickr, StockSnap e rawpixel. **Commons**
  direttamente finché non ha risposto 429 (limite di richieste sull'IP condiviso);
  poi ho scaricato solo dagli URL delle miniature `upload.wikimedia.org`.
- Da Flickr ho preso la misura grande (`_k`, 2048 px) dalla pagina "sizes" e ho
  controllato lì la licenza.
- Circa 60 candidate scaricate in anteprima e **guardate una per una con Read**
  (fogli di provini), le 6 scelte guardate di nuovo a piena misura, e anche i
  ritagli finali coi punti disegnati sopra.
- Verifica TLS sempre attiva (proxy con il suo CA bundle), nessuna immagine generata.

## Le foto scelte

| File | Dove | Cosa si vede | Autore · fonte · licenza |
|---|---|---|---|
| `deposito-{l,s}` | Deposito | scaffali di ferro con gomme invernali su tre piani, muro di pietra, cartellini di carta | AnnSophieQ · [Flickr](https://www.flickr.com/photos/141281588@N05/50338426143) · CC BY-SA 2.0 |
| `officina-ponte-{l,s}` | Officina, foto 1 | interno di un gommista (Riga): auto col portellone aperto sulle pedane, scaffali di gomme e cerchi, travi di legno, neon | Андрей Романенко · [Commons](https://commons.wikimedia.org/wiki/File:Inside_a_tire_shop_in_Riga.jpg) · CC BY-SA 4.0 |
| `officina-attrezzatura-{l,s}` | Officina, foto 2 (verticale) | colonna blu di un ponte con quadro e centralina (targhetta "Hebebühnen Wartung"), retro di un'auto grigia | Shixart1985 · [Commons](https://commons.wikimedia.org/wiki/File:Car_lift_in_an_auto_repair_shop_with_vehicles_and_tools_present.jpg) · CC BY 2.0 |
| `ponte-0-{l,s}` | Fallback 0 e 20 cm | utilitaria grigia su ponte a due colonne blu, di lato; officina ordinata, linee gialle a terra | ANT Berezhnyi · [Commons](https://commons.wikimedia.org/wiki/File:Chery_A1_-_service_shop_in_Ukraine_(7).jpg) · CC BY 3.0 |
| `ponte-80-{l,s}` | Fallback 80 cm | ruota tolta: disco, pinza e mozzo in primo piano, sopra la molla blu e il tampone | jason.odonnell · [Flickr](https://www.flickr.com/photos/70317059@N00/4267833444) · CC BY 2.0 |
| `ponte-180-{l,s}` | Fallback 180 cm | sottoscocca da sotto: albero di trasmissione, giunto, culla; due mani in guanti blu | City of Greenville NC · [Flickr](https://www.flickr.com/photos/cityofgreenvillenc/50211830327) · pubblico dominio (PDM 1.0) |

Tutte ritagliate o ridimensionate (`modificata: true` nei crediti; per CC BY-SA
va detto).

### Ritagli e misure

| File | Ritaglio | l (px, KB) | s (px, KB) |
|---|---|---|---|
| deposito | nessuno | 1280×853, 112 | 720×480, 47 |
| officina-ponte | tolto il fondo del pavimento (fino a y 1300 su 1440) | 1600×1083, 113 | 800×542, 47 |
| officina-attrezzatura | nessuno | 1067×1600, 70 | 533×800, 26 |
| ponte-0 | nessuno (originale 1600, Commons dava solo 1280) | 1280×960, 111 | 800×600, 49 |
| ponte-80 | nessuno | 1600×1200, 113 | 800×600, 40 |
| ponte-180 | x 820-2047, y 0-1000 dell'originale: tolto il viso del meccanico, restano sottoscocca e mani | 1227×1000, 101 | 800×652, 47 |

Tutte entro il budget del tech-architect (≤ 120 KB la grande, ≤ 50 KB la piccola).
Deposito e officina-ponte hanno una sfocatura leggerissima (raggio 0,5) prima
della compressione: il battistrada delle gomme pesa tanto. **Nessuno
spostamento di colore nei file**: il trattamento verso il verde grigio lo fa il
CSS dell'art-director (DESIGN.md §4). Le foto hanno blu (colonne, molla, guanti)
e un po' di giallo a terra; nessuna è dominata dall'arancio.

## `assets/foto/index.ts`

- `FOTO_DEPOSITO`, `FOTO_OFFICINA.ponte`, `FOTO_OFFICINA.attrezzatura`: `l`, `s`
  (`src`, `w`, `h` veri), `altChiave` (chiave in `testi.ts`), `fuoco` (x, y in %
  per `object-position`), `soggetto`, `credito`.
- `FOTO_QUOTE: Record<Quota, FotoQuota>`: 0 e 20 → stessa foto, 80, 180. Le foto
  del fallback sono decorative (`altChiave: null` → `alt=""`, come dice il
  copywriter).
- `CREDITI_FOTO`: i 6 crediti senza doppioni, per il piede.
- `srcsetDi(foto)`: `"s 800w, l 1600w"`.

### Coordinate dei punti (in % della foto intera, prima del "cover")

| Quota | Punto | x | y | Dove |
|---|---|---|---|---|
| 0 / 20 | ruota-anteriore | 64,5 | 48 | centro della ruota anteriore |
| 0 / 20 | ruota-posteriore | 25,5 | 50 | centro della ruota posteriore |
| 80 | freni | 64 | 84 | pinza sul bordo del disco |
| 80 | sospensioni | 55 | 30 | molla blu |
| 180 | nessuno | | | nella foto non ci sono scarico, coppa dell'olio o ruote riconoscibili: resta l'elenco |

Verificati disegnando i cerchi sopra i file finali e guardandoli.
A 0 cm il `PUNTI` del copywriter non ha punti; le ruote servono a 20.

## Scartate (e perché)

- Tutte le foto dell'officina dei vigili del fuoco di Colonia (Kfz-Werkstatt,
  bellissime ma **dominate dall'arancio/rosso**).
- Le altre foto della flotta di Greenville (meccanico in primo piano, **persona
  protagonista**) e le foto Shixart1985 con il meccanico in tuta.
- "Underside" (El Camino col motore arancio, estetica muscle car), Miata su
  cavalletti, furgone Vanagon, sottoscocca di Pinzgauer militare, Porsche da
  corsa (wbaiv), cerchi Brembo/Alessio (estetica tuning).
- Taxi gialli a Taipei, officine in Ghana/Nigeria (non europee), Ford Focus
  sull'assetto (fondale viola), four-post di Kyiv (SUV, ponte a quattro colonne).
- Negozi di gomme dall'esterno (Ozolnieki, Tornio: insegne e marchi in vista),
  bancali di gomme con prezzi (Costco), gomme da corsa in un camion.
- "Reifenlager" in bianco e nero: soggetto giusto ma 756 px, troppo piccola.

**Esterno dell'officina**: non ho trovato un ingresso con la serranda alzata
senza insegne, marchi o targhe in vista. Il CD dice "se c'è": qui **non c'è**,
l'officina ha due foto (come nel wireframe dell'ux).

## Richieste ad altri agent

- **copywriter** (`content/testi.ts`):
  - `OFFICINA.fotoAlt.ponte`: la foto non è un ponte a due colonne ma un
    gommista con l'auto sulle pedane. Proposta: "L'interno di un gommista:
    un'auto sulle pedane col portellone aperto, scaffali pieni di gomme e cerchi."
  - `OFFICINA.fotoAlt.attrezzatura`: la foto è la colonna di un ponte, non il
    pavimento. Proposta: "La colonna blu di un ponte sollevatore con il quadro
    elettrico e la centralina, accanto a un'auto grigia."
  - `OFFICINA.fotoAlt.esterno`: nessuna foto, si può togliere.
  - `DEPOSITO_TESTI.fotoAlt` va bene (magari "contro un muro di pietra").
  - `PIEDE.foto(autore)` e `fotoAria(autore)` dicono "su Unsplash": nessuna foto
    viene da Unsplash. Servono funzioni che usino il credito intero, per
    esempio `foto(c: CreditoFoto)` → `"${c.autore}, ${c.fonte}, ${c.licenza}"`
    e un aria "Foto di … su … (si apre in una nuova scheda)". La licenza va
    linkata (`licenzaUrl`) almeno per CC BY e CC BY-SA.
- **section-builder-officina** (piede): elencare `CREDITI_FOTO` (6 righe o una
  riga con separatori), autore linkato a `url`, licenza linkata a `licenzaUrl`,
  più "ritagliata" dove `modificata` (basta una nota unica: "foto ritagliate e
  ridimensionate"). La foto verticale è `attrezzatura` (1067×1600): va bene per
  la foto 2 sfalsata del wireframe se il riquadro è più alto che largo, oppure
  con `object-position` al `fuoco`.
- **section-builder-asta** (Fondale): usare `FOTO_QUOTE[quota]`, `fuoco` per
  `object-position`, e convertire `punti` nella geometria cover come da §7.3;
  a 180 nessun punto.
- **section-builder-deposito**: `FOTO_DEPOSITO`, `srcsetDi`, `sizes` sulla
  larghezza reale (c1-c8 a 1440, 100vw a 375); `width`/`height` dai dati.
- **scaffold-engineer**: serve la dichiarazione dei moduli `*.webp` per TS (di
  solito `/// <reference types="vite/client" />` in `src/vite-env.d.ts`).
