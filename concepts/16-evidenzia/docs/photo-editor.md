# Photo editor · Concept 16 · EVIDENZIA

File miei: `scripts/retino.py`, `src/pages/concepts/evidenzia/assets/foto/*`
(41 immagini + `index.ts`), questo documento.

## 1. Esito in breve: si applica il piano B

**4 schede con foto** (il minimo del CD 4.6): **152, 118, 237, 171**. Gli
altri 6 annunci che l'ux-architect aveva previsto con foto (**214, 231, 226,
240, 209, 229**) restano **tipografici**, anche nella scheda ("Foto in
agenzia, su richiesta.").

Perché: una serie credibile vuol dire molte foto della stessa casa, prese
dalla stessa persona, con una licenza che permetta il retino (niente ND, niente
NC). Per le case singole e rurali ne ho trovate quattro. Per gli appartamenti
(condominio anni '70, bilocale in centro, palazzina nuova) non ne ho trovata
nessuna che non fosse una delle cose vietate: residence al mare riconoscibili
(Jesolo), un complesso **vero di Pordenone** (Corte del Bosco, scartato per la
regola del CD), bed and breakfast a Venezia con i canali dalla finestra, foto
singole senza serie.

## 2. Fonti e metodo

- **Unsplash non usato.** La ricerca (`unsplash.com/napi/search`) risponde
  307 verso un controllo anti-bot. Aggirarlo da un browser automatico è stato
  bloccato dal sistema di permessi e **non l'ho più tentato**: senza la
  ricerca non ho gli id delle foto da scaricare dal CDN. I crediti quindi
  **non sono Unsplash** (il CD e l'ux parlano di "link Unsplash" nel piede:
  vedi sezione 6).
- **Openverse** (`api.openverse.org/v1/images`, filtro `license=by,by-sa,cc0,pdm`)
  per cercare; **Flickr** per le pagine delle foto: dalla pagina di ogni foto
  ho letto la licenza attuale (non quella in cache di Openverse) e la misura
  2048 px da scaricare. Tutto con `curl` normale, TLS verificato dal bundle
  del proxy.
- **Ogni foto guardata con Read**: prima in fogli di anteprima (circa 250
  foto), poi a grandezza piena le 29 candidate, poi i risultati finali
  (webp e retino) di nuovo in un foglio.
- Gli originali 2048 px restano nello scratchpad, **non nel repo**.

## 3. Le quattro serie

| Annuncio | Serie | Autore | Licenza | Foto |
|---|---|---|---|---|
| 152 · Porcia, villetta singola anni '80 (T) | "CASA VENDITA": villetta bianca a un piano con portico, grande prato, interni vissuti | pj.sissi (Flickr) | CC BY 2.0 | 6 |
| 118 · Porcia, rustico con portico e fienile (F) | stessa proprietà, l'edificio in sasso che l'autore titola "RUSTICO", coperto di vite americana | pj.sissi (Flickr) | CC BY 2.0 | 4 |
| 237 · Roveredo in Piano, testa di schiera con taverna (F) | casa in sasso e intonaco rosso con portico e cortile in porfido (Medea, Gorizia) | Toprural (Flickr) | CC BY-SA 2.0 | 3 |
| 171 · Cordenons, bifamiliare (R) | casa colonica gialla a tre piani con giardino (Lugugnana di Portogruaro, Venezia) | Toprural (Flickr) | CC BY-SA 2.0 | 5 |

Coerenza per scheda: ogni scheda usa **una sola casa**, fotografata dalla
stessa persona nella stessa uscita (stessa luce, stessa stagione). 152 e 118
vengono dalla stessa proprietà ma da due edifici diversi. Ho scelto solo foto
dove l'altro edificio **non si vede**. Tutte e due sono date "Porcia" nel
casting, quindi due annunci vicini dello stesso venditore restano verosimili.

### Elenco completo (originale → file)

| File | Soggetto | Pagina originale |
|---|---|---|
| `152-1` (+ `152-retino.png`) | villetta, portico, prato | https://www.flickr.com/photos/29286352@N02/15147351759 |
| `152-2` | la casa in fondo al prato | https://www.flickr.com/photos/29286352@N02/15333852522 |
| `152-3` | portico in cotto | https://www.flickr.com/photos/29286352@N02/15310976026 |
| `152-4` | soggiorno con caminetto e scala | https://www.flickr.com/photos/29286352@N02/15330827421 |
| `152-5` | camera con due letti | https://www.flickr.com/photos/29286352@N02/15333918925 |
| `152-6` | portico in autunno | https://www.flickr.com/photos/29286352@N02/15330984331 |
| `118-1` (+ `118-retino.png`) | rustico in sasso e vite americana | https://www.flickr.com/photos/29286352@N02/15147466710 |
| `118-2` | scala esterna e ballatoio in legno | https://www.flickr.com/photos/29286352@N02/15147664777 |
| `118-3` | lato corto, nebbia | https://www.flickr.com/photos/29286352@N02/15310802566 |
| `118-4` | timpano e prato | https://www.flickr.com/photos/29286352@N02/15147029089 |
| `237-1` (+ `237-retino.png`) | testa di schiera, portico, cortile | https://www.flickr.com/photos/8920684@N05/4690345720 |
| `237-2` | giardino | https://www.flickr.com/photos/8920684@N05/4690345056 |
| `237-3` | ingresso in cotto (ritagliato a sinistra: via le bottiglie di vino) | https://www.flickr.com/photos/8920684@N05/4690350396 |
| `171-1` (+ `171-retino-1.png`) | facciata gialla con rose | https://www.flickr.com/photos/8920684@N05/4016640998 |
| `171-2` (+ `171-retino-2.png`) | giardino | https://www.flickr.com/photos/8920684@N05/4016641000 |
| `171-3` | cucina con piattaia | https://www.flickr.com/photos/8920684@N05/4015905477 |
| `171-4` | soggiorno con travi | https://www.flickr.com/photos/8920684@N05/4015905467 |
| `171-5` | camera | https://www.flickr.com/photos/8920684@N05/4015922291 |

Autori: pj.sissi → https://www.flickr.com/photos/29286352@N02/ ·
Toprural → https://www.flickr.com/photos/8920684@N05/

### Scartate (controllate con Read) e perché

- Setten Genesio "Corte del Bosco": **Pordenone vera**, riconoscibile. Merville
  Jesolo: torre al mare riconoscibile, piscine, pini marittimi.
- Toprural Vigne Correr (Salgareda): **palme** in facciata. Altre Toprural:
  camere d'albergo (asciugamani piegati sul letto, crocifissi, bottiglie in
  posa), castelli, ville liberty di Trieste.
- pj.sissi: foto con un'**auto e la sua targa** (15310982466, 15334122355), la
  foto che mostra insieme villetta e rustico, libreria in primo piano.
- Kogoj: la foto del carport con due auto e targhe; la pagina 4689713413 è
  sparita da Flickr (mai un 404).
- Venezia (fratella): canali dalla finestra; Cinque Terre, Toscana, California,
  Stati Uniti, Brasile: fuori contesto.
- Wikimedia: residenze CasaClima di San Donato Milanese (muro di cemento e
  cancello con targhetta in primo piano), facciata storica di Concorezzo (è
  riconoscibile).

## 4. Trattamento

### Colore (scheda)

- Ritaglio **3:2**, centrato in orizzontale, punto verticale scelto a mano per
  ogni foto (`build.py` nello scratchpad; parametri nella tabella del codice
  sotto). Il 3:2 sta in mezzo tra la striscia desktop 720 × 400 (1,8) e quella
  mobile 375 × 250 (1,5): con `object-fit: cover` si perde poco da entrambe le
  parti.
- **1600 × 1067** (≤ 190 KB) e **800 × 533** (≤ 75 KB), webp `method=6`.
  Qualità da 80 in giù fino a 50; le foto con più grana (compatte del
  2009-2014, fogliame) invece di scendere sotto 50 ricevono una sfocatura
  leggerissima (0,5-0,8 px) che toglie il rumore e non i dettagli. Valori
  finali: qualità 50-80, nessuna sfocatura su 26 file, 0,5-0,8 px su 10.
- Nessun ritocco di colore: sono foto da annuncio, devono sembrarlo.
- Pesi: 1600 tra 95 e 190 KB, 800 tra 37 e 75 KB. Tutti nel budget.

### Retino (foglio): `scripts/retino.py`

```
python3 scripts/retino.py foto.jpg uscita.png --w 536 --h 336 --fuoco 0.5,0.45
```

- Scala di grigi → autocontrasto (taglio 1%) → sfocatura di 0,8 px (0,2 × passo)
  per non campionare la grana.
- Griglia a **45°**, **passo 4 px** (a 2×, circa 50 lpi a schermo). Per ogni
  cella: `scuro = 0.9 × scuro^1.35` (compensa l'allargamento del punto; il nero
  pieno non esiste, le ombre restano aperte come sulla carta di giornale).
- Due inchiostri sugli stessi centri: punto **retino #8F8B82** per i
  mezzitoni (raggio ∝ √scuro), punto **nero #111111** sopra solo dove
  scuro > 0,55.
- Disegnato a 4× e ridotto, poi **PNG indicizzato a 3 colori senza dithering**:
  indice 0 = carta **trasparente** (sotto si vede `#E4DFD1` del foglio), 1 =
  retino, 2 = nero.
- Misure (2× della misura CSS dell'ux): T **536 × 400** (268 × 200), F
  **536 × 336** (268 × 168), R **516 × 320** ciascuna (258 × 160).
- Pesi: 12,8-18,5 KB l'una, **83 KB in tutto** (budget 22 KB l'una, 180 in
  tutto).

| Retino | Sorgente | Misura | Fuoco |
|---|---|---|---|
| `152-retino.png` | 15147351759 | 536 × 400 | 0.45, 0.5 |
| `118-retino.png` | 15147466710 | 536 × 336 | 0.5, 0.45 |
| `237-retino.png` | 4690345720 | 536 × 336 | 0.55, 0.55 |
| `171-retino-1.png` | 4016640998 | 516 × 320 | 0.5, 0.45 |
| `171-retino-2.png` | 4016641000 | 516 × 320 | 0.6, 0.5 |

Punto verticale del colore: 152 → 0.5, 0.45, 0.5, 0.5, 0.5, 0.45; 118 → 0.45,
0.5, 0.55, 0.5; 237 → 0.55, 0.5, 0.5 (237-3 prima ritagliato a x 0,28-1);
171 → 0.45, 0.5, 0.5, 0.5, 0.5.

## 5. `assets/foto/index.ts` (API)

Come in tech-architect §6.4, con due aggiunte compatibili:

```ts
interface FotoAnnuncio {
  retino?: { src; w; h };      // T e F, e la prima del riquadro R
  retino2?: { src; w; h };     // AGGIUNTA: seconda foto a retino del formato R (solo 171)
  colore: readonly { src; src800; w: 1600; h: 1067; alt }[];
  crediti: readonly Credito[];
}
interface Credito { autore; url; licenza; licenzaUrl }   // AGGIUNTA: licenza e link
export const FOTO: Partial<Record<IdAnnuncio, FotoAnnuncio>>;   // chiavi 'rif-152', 'rif-118', 'rif-237', 'rif-171'
export const CREDITI: readonly Credito[];                        // 2 voci, per il piede
```

`w`/`h` dei retino sono in pixel del file (2×): in pagina vanno a metà (o si
usano le misure CSS dell'ux). Gli `alt` descrivono quello che si vede, senza
promesse dell'annuncio.

## 6. Richieste ad altri agent

- **ux-architect / section-builder-annunci**: si applica la regola già
  scritta in ux 5.1. **214 e 229 (T)** restano T senza foto con attacco più
  grande; **231, 226, 209 (F)** diventano P e si aggiunge un Cerchiamo nella
  stessa colonna; **240 (R)** resta R senza foto (o diventa T/P: decidete
  voi, l'impaginato è vostro). Il formato R di 171 legge `retino` e `retino2`.
  Su mobile T 343 × 200 e F 343 × 190 hanno un rapporto diverso da desktop:
  `object-fit: cover` con `object-position` centrato va bene; **non**
  ingrandire il retino oltre 1,3× (punti sfocati): a 343 CSS su schermo 2× è
  1,28×, al limite.
- **copywriter**: allineare i testi alle foto, senza cambiare le forchette:
  - **152**: villetta a **un piano** con portico su pilastri su due lati,
    tetto in tegole scure, **soppalco** in legno sopra il soggiorno con
    caminetto, prato grande (i 600 m² vanno bene), camera con due letti.
  - **118**: rustico in **sasso**, due piani, coperto di vite americana,
    **scala esterna in legno** con ballatoio (il "fienile" è il piano alto).
    Colline sullo sfondo: "verso le colline di Porcia" è coerente.
  - **237**: muri in sasso e intonaco rosso, **portico-garage** e cortile in
    porfido, giardino dietro, ingresso con pavimento in cotto e scala.
    "Taverna" non si vede: resta nel testo, nessuna foto la contraddice.
  - **171**: nelle foto è una **casa colonica gialla a tre piani** con
    giardino e cucina con piattaia, travi a vista, cotto. Proposta:
    "Bifamiliare in casa colonica, metà con giardino" (tre piani, tetto
    rifatto). Se il testo resta "bifamiliare" anni '70 le foto non tornano.
  - **Crediti nel piede**: non "Unsplash". Formula proposta: "Foto: pj.sissi
    (CC BY 2.0) e Toprural (CC BY-SA 2.0) su Flickr. Le case fotografate non
    sono in vendita." Autore e licenza come link (`CREDITI` ha `url` e
    `licenzaUrl`). La seconda frase serve: sono case vere, fuori Pordenone.
- **section-builder del piede**: leggere `CREDITI` e mostrare anche la
  licenza (CC BY-SA la richiede).
- **scaffold-engineer**: i tipi per gli import `*.png` e `*.webp` vengono da
  `vite/client` (`/// <reference types="vite/client" />` in `vite-env.d.ts`).
- **creative-director / orchestratore**: le schede con foto sono 4 su 10.
  Per averne di più servono o la ricerca di Unsplash (bloccata dal controllo
  anti-bot) o una chiave dell'API di Unsplash messa nei segreti
  dell'ambiente.

## 7. Rischi residui

- 237 e 171 sono **agriturismi veri** (Medea, Gorizia, e Lugugnana,
  Venezia), non a Pordenone: la regola del CD è rispettata. Chi li conosce
  però può riconoscerli. Ho tolto il cartello "Casa Delser", le bottiglie in
  posa e le camere con gli asciugamani. In 237-3 si vedono piccoli adesivi
  sulla porta a vetri, in 171-4 una bacheca: non si leggono.
- Le foto pj.sissi sono di un annuncio vero del 2014 (zona prealpina, luogo
  non indicato). Nessun indirizzo, nessuna targa, nessuna persona.
- Qualità d'origine da compatta: a 1600 px su schermi grandi si vede la
  grana. È coerente con un annuncio d'agenzia; non è una rivista.
