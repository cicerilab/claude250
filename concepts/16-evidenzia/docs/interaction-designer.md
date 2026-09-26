# Interaction designer · Concept 16 · EVIDENZIA

Ondata 2. Rotta `/concept-16`. Ho seguito `design-taste-frontend` (4.5, 5.D,
6.B, 9.A) e `full-output-enforcement`: il codice è completo, senza segnaposto.

Ho letto: `docs/ruoli-agent.md`, `lab-operativo.md`, `concept-lab.md`,
`processo-agent.md`, `matrice-concept-11-20.md` (riga 16),
`10-torchio/docs/integrazione-sito.md` e `interaction-designer.md` (solo per il
formato), tutti i doc dell'ondata 1 (creative-director, trend-researcher,
brand-strategist, ux-architect, tech-architect). Ho letto anche i file già
scritti in parallelo: `tratto/forma.ts` e `docs/vector-artist.md`,
`motion/tratto.ts`, `motion/durate.ts`, `motion/vista.ts`,
`styles/tokens.css`, `styles/tokens.ts` e `content/annunci.ts`.

## 0. File consegnati

Tutti in `src/pages/concepts/evidenzia/`:

| File | Cosa fa |
|---|---|
| `interaction/useEvidenziatore.ts` | Il gesto firma su un annuncio: mouse e penna, dito su foglio e colonna, soglia del 55%, annullamento, ripasso che toglie, quinto annuncio "scarico", assorbimento del clic dopo il tratto, velocità al rilascio. |
| `interaction/segni.ts` | Canale tra gesto e tratto (eventi per id, punto di partenza, ripasso, "attesa" del cambio di store). Nessun accesso al browser. |
| `interaction/usePan.ts` | Spazio + trascina; trascina sugli spazi vuoti e sulle zone `data-evd-afferra`; tocco breve di spazio = una schermata; in Pagina intera un clic porta a Leggi e i clic sui controlli scalati non passano. Contiene `avviaPanDaPuntatore()`. |
| `interaction/useTastieraFoglio.ts` | `+` e `-` col fuoco nel foglio; con il fuoco da tastiera l'annuncio intero va in vista; se il fuoco entra in un annuncio in Pagina intera si torna a Leggi. |
| `interaction/usePizzico.ts` | Pizzico a due dita sul foglio da tablet, due soli livelli. |
| `interaction/cambioVista.ts` | `chiediVista()` / `alternaVista()`: unico ingresso per cambiare vista, con un limite anti-lampeggio (un cambio ogni 500 ms). |
| `interaction/useTrascinaTappe.ts` | Riordino delle tappe del giro trascinandole (solo mouse e penna, in aggiunta a Prima/Dopo). |
| `interaction/interaction.css` | Anello di fuoco, cursori di sistema, `touch-action` del gesto, selezione, classi `evd-ix-*` (attacco, interruttore, premibile, testo, link, tocco, tappa), reduced motion. |
| `tratto/Tratto.tsx` | `<Tratto id>` sull'annuncio e `<TrattoSu id modo>` su un testo qualunque (tappe, "Hai segnato", tratto dimostrativo su "Segna"). |
| `tratto/tratto.css` | Resa del tratto: `@property` per `--evd-inizio` e `--evd-ripasso`, ritaglio per riga, multiply, opacità dei token, forma scarico, contrasto forzato. |

**Verifica fatta.**
- Ho messo tutti i file in un progetto di prova nello scratchpad, con stub di
  `state/store`, `state/runtime`, `state/registro`, `core/ticker`,
  `core/scroller`, `core/semi` e `core/fonts` scritti come i contratti del
  tech-architect (§6-7) e del §8 qui sotto. Ho usato i file veri di `motion/`,
  `tratto/forma.ts`, `content/` e `styles/`. Risultato: `tsc` strict
  (`noUncheckedIndexedAccess`, `noUnused*`) ed `eslint` (react-hooks) puliti.
  I due CSS passano lightningcss, senza hex e senza trattini lunghi.
- Ho fatto una prova dal vivo su Vite (porta 9163, poi spenta) con Chromium e
  Playwright, usando un ticker e un registro minimi ma funzionanti:
  - gesto col mouse al 45% di una riga: non entra. All'85% entra. Al 30% non
    entra. Riga intera: entra;
  - quattro nel giro (due dal bottone), poi un gesto sul quinto: tratto
    scarico pallido che si ferma a metà (screenshot guardato), lo store resta
    a 4 con `scarico = rif-240`;
  - ripasso all'85%: toglie, e durante il gesto il rosa impallidisce
    (screenshot guardato);
  - dito sulla colonna: il gesto orizzontale che parte dalla descrizione
    segna, quello verticale no;
  - a riposo: **0 frame del ticker** in 1 s.
- La prova col dito ha trovato un bug, già corretto: il `lostpointercapture`
  dei figli risale fino all'articolo e annullava il gesto. Ora conta solo
  quello dell'articolo (stessa correzione in `usePan`).

---

## 1. Cursore, preloader, "magnetismo": cosa c'è al loro posto

Cursore personalizzato, preloader e bottoni magnetici sono **vietati** dal
creative-director (4.4, 4.7: "cursore di sistema", "niente entra, è già
stampato") e dalla skill (9.A). Non li ho fatti.

- **Il cursore è quello del sistema, e dice cosa fa la mano.** `text` sugli
  annunci (lì si passa l'evidenziatore), `pointer` sull'attacco (apre la
  scheda), `grab` sugli spazi vuoti, `grabbing` mentre si trascina, `zoom-in`
  in Pagina intera. Sono tutti cursori nativi, quindi accessibili e senza
  ritardo, e insieme fanno da piccola guida senza scritte "trascina".
- **Nessun preloader.** L'unico movimento all'apertura è il tratto
  dimostrativo su "Segna" (600 ms, una volta sola, dopo i font), fatto con
  `<TrattoSu modo="dimostrativo">`. Insegna il gesto. Non trattiene nulla:
  la pagina è già tutta leggibile.
- **Nessun magnete.** Qui la mano "stampa": al passaggio l'inchiostro del
  bordo si ispessisce (filo interno) e alla pressione il bottone scende di
  1 px. Nessun colore cambia al passaggio, e il rosa non compare mai per
  hover (il rosa è solo ciò che l'utente ha fatto).

---

## 2. Il gesto firma: l'evidenziatore (`useEvidenziatore.ts`)

### 2.1 Chi può partire, e da dove

| Input | Dove parte il gesto | Soglia di avvio | Se il movimento non è orizzontale |
|---|---|---|---|
| Mouse, penna (foglio e colonna) | Ovunque sull'annuncio, tranne `[data-evd-no-tratto]` (bottone Evidenzia), link e campi | 6 px, entro 30° dall'orizzontale | Il foglio passa alla mano (`avviaPanDaPuntatore`, trend R2). Nella colonna non succede nulla |
| Dito sul foglio (640-1023 px) | Solo nella **zona di presa** della riga d'attacco (alta almeno 44 px) | 12 px entro 30° | Scorre il browser (`pointercancel`) |
| Dito sulla colonna (< 640 px) | Tutto l'annuncio | 12 px entro 30° | Scorre il browser |
| Qualsiasi, in Pagina intera | Mai | | Il clic porta a Leggi (usePan) |
| Qualsiasi, con spazio premuto | Mai (vince la mano) | | |

- Col dito il gesto non parte se il tocco inizia a meno di **24 px dal bordo**
  della finestra, perché lì il bordo è "indietro" del sistema (trend R5).
- Si fa un solo gesto alla volta (`segni.gestoCorrente`).
- Scelta dichiarata: il CD dice "spostare il foglio non usa mai il
  trascinamento sugli annunci". Io aggiungo **solo** il trascinamento
  verticale col mouse, come chiede il trend-researcher (R2). La selezione
  del testo sugli annunci è spenta, quindi senza questa aggiunta quel gesto
  non farebbe nulla. Il criterio dei 30° è lo stesso del dito, quindi il
  comportamento è uguale per tutti gli input, e i due gesti non si
  sovrappongono mai.

### 2.2 Come corre il tratto

- Il tratto **parte dal punto premuto** (CD 4.4): `segni.inizio(id)` diventa
  `--evd-inizio`. Poi segue il puntatore **lungo** la riga d'attacco (solo la
  lunghezza, l'altezza resta agganciata alla riga). Tornando indietro si
  accorcia, ma mai prima del punto di partenza.
- **Due righe**: se il puntatore scende sotto la prima riga quando questa è
  coperta almeno al 90%, il tratto continua sulla seconda. Una sola variabile
  `--evd-avanzamento` (0..1 sulla lunghezza di tutte le righe) guida entrambe:
  il CSS di ogni riga ne ricava la sua parte (`--evd-riga-o`, `--evd-riga-f`).
- La punta ha un po' d'inerzia (inseguimento esponenziale a 38/s nella fase
  `update` del ticker), come la carta che frena l'inchiostro. Quando la punta
  raggiunge il bersaglio il ticker dorme.
- Le misure si leggono **una volta, alla pressione**: il rettangolo
  dell'articolo, la scala e le righe dal registro. Se durante il gesto il foglio
  scorre (rotella), la differenza di scroll si corregge da `runtime.foglio`.

### 2.3 Esiti

| Situazione | Esito | Evento su `segni` | Store |
|---|---|---|---|
| Rilascio con la prima riga coperta ≥ 55% | il tratto si completa fino a fine riga (160 ms, con lo slancio della mano); l'inizio rientra alla prima lettera con una transizione CSS di 160 ms | `completa { da, velocita }` | `evidenzia(id, 'gesto')` (la vibrazione di 10 ms la fa lo store) |
| Rilascio sotto il 55% | il tratto si ritira (200 ms) | `ritira` | nessun cambio |
| Annullamento: esce dall'articolo di oltre 40 px in verticale, Esc, `pointercancel`, finestra in secondo piano, cambio di vista | il tratto si ritira | `ritira` | nessun cambio |
| Ripasso su un annuncio nel giro: il rosa impallidisce man mano (fino a -60%) | ≥ 55%: si scolora (250 ms) | `toglie` | `togli(id, 'gesto')` |
| Ripasso sotto il 55% o annullato | torna pieno (transizione CSS di 200 ms) | `ripristina` | nessun cambio |
| Quinto annuncio (4 nel giro), appena superata la soglia | tratto scarico (pallido, a strisce, si ferma a metà e si ritira: 680 ms). Il resto del gesto è ignorato | `scarico` | `evidenzia(id, 'gesto')` → `'pieno'`, lo store mette `scarico = id` (la riga d'avviso la mostra la sezione Annunci) |

- Dopo ogni gesto che ha davvero disegnato, il **clic gemello** che il
  browser manda sull'attacco (che è un bottone) viene assorbito per 450 ms:
  un tratto non apre la scheda. Un clic senza trascinamento apre la scheda
  normalmente.
- Il bottone **Evidenzia** non passa di qui: chiama `alterna(id, 'bottone')`
  e `Tratto.tsx` vede il cambio nello store, poi disegna da solo in 350 ms (o
  scolora). Lo stesso vale per scheda, giro e posti del giro.

### 2.4 Reduced motion

Il gesto resta identico, perché è un'azione e non un'animazione. Durante il
trascinamento il tratto segue il dito, altrimenti non si vedrebbe cosa si
sta facendo. Al rilascio `motion/tratto.ts` dà subito lo stato finale:
tratto intero o sparito, senza completamento, ritiro o scolorimento
animati. Lo scarico è un tratto pallido fermo a metà per 600 ms, poi sparisce.
Le transizioni CSS di `--evd-inizio` e `--evd-ripasso` sono spente con
`data-motion="reduced"` e con la media query.

---

## 3. Il tratto (`tratto/Tratto.tsx`, `tratto/tratto.css`)

### 3.1 Resa

Segue `docs/vector-artist.md` §3.3: un `<svg>` per riga con corpo, pozze
d'inchiostro e striature, `mix-blend-mode: multiply` sull'svg intero, nessuna
maschera e nessun id. La posizione viene da `ingombroTratto(riga.w, corpo)`:
lo sbordo è di 0,32 × altezza per lato e il centro della riga si alza di
0,07 × corpo. Dy e rotazione vengono da `variazione(semePerRiga(seme, riga))`.
Il seme è `semeDa(id)`, quindi il tratto è identico a ogni ritorno e lo stesso
nelle tappe del giro.

**Opacità: ho seguito i token dell'art-director, non i valori del
vector-artist.** I due doc non coincidono. L'art-director è il riferimento per
i contrasti (tetto calcolato di 0,945 composto sotto il nero):
- svg: `opacity: var(--evd-tratto-opacita)` (0,85);
- corpo: `fill-opacity: var(--evd-tratto-corpo)` (0,88);
- pozze: portano gli estremi a `--evd-tratto-estremita` (1);
- striature: carta sopra il rosa fino all'opacità composta
  `--evd-tratto-striatura` (0,62);
- scarico: `opacity: var(--evd-tratto-scarico)` (0,35);
- contrasto forzato: niente rosa né multiply, una barra `Highlight` alta 4 px
  sotto la riga.

Controllato a schermo con i font di ripiego: il nero dell'attacco resta nero
sotto il rosa, le punte a scalpello si vedono, e con due righe (Torre,
trilocale con garage) le righe hanno punte diverse.

### 3.2 Variabili (sul nodo foglia `.evd-tratto__segno[data-evdvar]`)

| Variabile | Chi la scrive | Note |
|---|---|---|
| `--evd-avanzamento` | durante il gesto: `Tratto.tsx` nella fase `write` del ticker, solo se cambia. Dopo: `motion/tratto.ts` (WAAPI) | registrata dal motion-designer (`registraAvanzamento`); io **non** la dichiaro |
| `--evd-inizio` | `Tratto.tsx` (all'inizio del gesto; torna a 0 con una transizione CSS) | `@property` in tratto.css |
| `--evd-ripasso` | `Tratto.tsx` nella fase `write` durante il ripasso | `@property` in tratto.css |

Al montaggio il tratto è già nel suo stato finale: intero se l'annuncio è nel
giro (ritrovato o arrivato da `?segna=`), altrimenti vuoto. Al caricamento
**nessun tratto "entra"**, tranne il dimostrativo.

### 3.3 Uso (per i section-builder)

**Annunci** (`sections/Annunci/Annuncio.tsx`):

```tsx
const ref = useRef<HTMLElement>(null);
const attaccoRef = useRef<HTMLSpanElement>(null);
useLayoutEffect(() => (ref.current && attaccoRef.current ? registro.registra(id, ref.current, attaccoRef.current) : undefined), [id]);
useEvidenziatore(ref, id);

<article ref={ref} id={id} data-evd-annuncio="" className="evd-annuncio">   {/* position: relative */}
  <h3 className="evd-annuncio__titolo">
    <button type="button" className="evd-ix-attacco" data-evd-attacco="" aria-haspopup="dialog" onClick={() => apriScheda(id)}>
      <span ref={attaccoRef}>{a.attacco}</span>
    </button>
  </h3>
  …testo, prezzo…
  <button type="button" className="evd-ix-interruttore" data-evd-no-tratto="" aria-pressed={segnato}
          aria-label={…nome accessibile del copywriter…} onClick={() => alterna(id, 'bottone')}>
    <span dangerouslySetInnerHTML={{ __html: ICONA_EVIDENZIA }} aria-hidden="true" />
    {segnato ? TESTO_NEL_GIRO : TESTO_EVIDENZIA}
  </button>
  <Tratto id={id} />
</article>
```

- L'`article` deve essere `position: relative`. Nessun antenato fino al
  foglio può avere `isolation`, `filter`, `opacity < 1` o `z-index` su un
  elemento posizionato, altrimenti il multiply col testo si rompe
  (tech-architect §5).
- `<Tratto>` va **dopo** il testo nel DOM, così si dipinge sopra.
- I "Cerchiamo" **non** hanno `data-evd-annuncio`, né `useEvidenziatore`, né
  `<Tratto>`.

**Testata / riquadro di testa**:
`<TrattoSu id="segna" modo="dimostrativo">Segna</TrattoSu> le case che vuoi vedere.`

**Giro (tappe) e "Hai segnato"**:
`<TrattoSu id={a.id}>{a.attacco}</TrattoSu>`. Il tratto è intero, con lo stesso
seme del foglio.

`TrattoSu` misura da sé le sue righe (Range, ResizeObserver, font pronti,
`loadingdone`), al massimo due, e compensa la scala di Pagina intera.

---

## 4. Il foglio e la mano (`usePan.ts`)

| Gesto | Dove | Cosa succede |
|---|---|---|
| Spazio tenuto + trascina (mouse, penna) | ovunque sul foglio, anche sopra annunci e link | il foglio segue la mano (`vaiA` nella fase `write`); cursore `grab`, poi `grabbing` |
| Spazio toccato (< 250 ms, senza trascinare) | fuoco sul foglio | scende di 0,85 schermate (Maiusc: sale), come farebbe il browser: la funzione nativa di spazio non si perde |
| Trascina senza spazio | lo scroller stesso, `.evd-pagina`, `.evd-colonne` (i canaletti), `[data-evd-afferra]` | come sopra, dopo 3 px (un clic su una barra resta un clic) |
| Trascina verticale partito da un annuncio (mouse) | annunci | passa qui da `useEvidenziatore` |
| Clic o tocco fermo (≤ 6 px, ≤ 600 ms) in Pagina intera | tutto il foglio | `chiediVista('leggi', punto sotto il dito)` |
| Clic del puntatore su bottoni o link in Pagina intera | foglio scalato | assorbito (`detail > 0`); i clic da tastiera passano |

- Lo spazio non viene mai rubato a bottoni, link, radio o campi, e funziona
  solo con il fuoco sul foglio (o sul body) in Leggi, senza scheda o giro
  aperti.
- Il dito non trascina mai: nel foglio lo scroll nativo col dito è già la
  mano.
- Stato per il CSS: `data-evd-pan="spazio|trascina"` **sullo scroller** (non
  su `.evd-root`, vedi §8). Valori caldi: `runtime.pan.spazio` e
  `runtime.pan.trascina`.

## 5. Tastiera, pizzico, vista (`useTastieraFoglio.ts`, `usePizzico.ts`, `cambioVista.ts`)

- `+` (anche `=` e il `+` del tastierino) porta a Leggi, `-` (e `_`) a Pagina
  intera. Funzionano solo col fuoco dentro il foglio (WCAG 2.1.4), mai con
  Ctrl, Cmd o Alt (lo zoom del browser resta suo), mai nei campi, mai sulla
  ripetizione automatica.
- Con il fuoco da tastiera (`:focus-visible`) dentro un annuncio: parte
  `mostraElemento(article, 16)`, così si vede l'annuncio intero e non solo il
  bottone. Con il mouse non si sposta niente.
- Se il fuoco entra nel foglio in Pagina intera, si torna a Leggi centrati
  sull'annuncio (`forza: true`: succede una volta sola).
- Pizzico (solo `layout = 'foglio'`): eventi touch passivi, rapporto ≤ 0,78 →
  Pagina intera, ≥ 1,28 → Leggi centrato tra le dita. Uno scatto per gesto.
  Il foglio ha `touch-action: pan-x pan-y`: niente zoom del browser **dentro
  il foglio**, ma nessun `user-scalable=no`. Nella scheda, nel giro e fuori
  dal foglio lo zoom resta (WCAG 1.4.4).
- **Anti-lampeggio**: cambiare vista cambia la luminosità di tutta la
  finestra. Per questo `chiediVista` lascia passare **al massimo un cambio
  ogni 500 ms**, da qualunque sorgente, e scarta le richieste in eccesso
  senza coda, così un tasto tenuto giù non fa altalena. Nella colonna non
  cambia mai vista.
- **Anche i bottoni Leggi / Pagina intera del molo devono passare da
  `chiediVista`** (section-builder-comandi), mai da `impostaVista` diretto.

## 6. Classi e attributi per le sezioni (`interaction.css`)

| Classe / attributo | Dove | Effetto |
|---|---|---|
| `data-evd-annuncio` | `<article>` evidenziabile | selezione spenta, `cursor: text`, `touch-action: pan-y` nella colonna |
| `data-evd-attacco` + `evd-ix-attacco` | bottone dell'attacco dentro l'`h3` | reset del bottone, sottolineatura al passaggio (1 → 2 px), col dito un'area di presa di 44 px (pseudo-elemento, senza toccare l'impaginato), `touch-action: pan-y` sul foglio |
| `data-evd-no-tratto` | bottone Evidenzia (e ogni altro controllo dentro l'annuncio) | il gesto non parte da lì |
| `evd-ix-interruttore` | Evidenzia, "Evidenzia per il giro" | 44 px; spento: contorno nero 1 px; `aria-pressed="true"`: pieno nero, testo carta (stato **non cromatico**, trend R1); icona 20 px |
| `evd-ix-premibile` | Prepara il giro, Manda il giro | al passaggio filo interno; premuto: scende di 1 px; `aria-disabled` senza effetti |
| `evd-ix-testo` | Prima, Dopo, Togli, Rimetti nella pagina | premuto: `--evd-carta-premuta` |
| `evd-ix-link` | link di testo | sottolineatura 1 → 2 px (3 px alla pressione) |
| `evd-ix-tocco` | ogni controllo piccolo | minimo 44 × 44 |
| `data-evd-afferra` | barre di rubrica, testata, piede, contenitori delle fasce | trascinabili per spostare il foglio, `cursor: grab` |
| `data-evd-no-pan` | eventuali zone da escludere dal trascinamento | |
| `evd-ix-tappa` + `data-evd-tappa={id}` | `<li>` delle tappe del giro | maniglia di trascinamento (vedi §7) |

Anello di fuoco su tutto `.evd-root`: `outline` nero di 2 px, 2 px di stacco
riempito di carta (`--evd-fuoco-alone`). Si vede su carta, su barre nere e su
bottoni neri. Sul foglio l'anello sta dentro il bordo. Sui titoli raggiunti
con i salti lo stacco è di 6 px. In contrasto forzato si usa `Highlight`.

## 7. Tappe trascinabili (`useTrascinaTappe.ts`)

```tsx
const listaRef = useRef<HTMLOListElement>(null);
useTrascinaTappe(listaRef, {
  ids: tappe.map((t) => t.id),
  attivo: tappe.length > 1 && invio !== 'sending',
  onRiordina: (ids, id, pos) => { riordina([...ids]); annuncia(voceRiordino(id, pos)); },
});
<ol ref={listaRef}>{tappe.map((t) => <li key={t.id} data-evd-tappa={t.id} data-evdvar="" className="evd-ix-tappa">…</li>)}</ol>
```

Funziona solo con mouse e penna, dopo 4 px. La tappa segue il puntatore, le
altre fanno posto (150 ms, nessuna animazione con reduced motion). Esc annulla.
`onRiordina` parte una sola volta, e solo se l'ordine è cambiato. Il clic
gemello viene assorbito. Prima e Dopo restano sempre (WCAG 2.5.7).

## 8. Contratti richiesti allo scaffold

Sono le firme che i miei file importano. Coincidono con il tech-architect
§6-7, con **un'aggiunta** e una nota.

- `state/store.ts`: `store.get/subscribe`, `useEvidenzia(sel)`,
  `evidenzia(id, origine)` → `'aggiunto' | 'gia' | 'pieno'`,
  `togli(id, origine)`, `type IdAnnuncio`, `type Vista`. Stato letto:
  `segnati`, `vista`, `layout`, `schedaAperta`, `giroAperto`,
  `reducedMotion`.
  **(aggiunta)** `impostaVista(v: Vista, puntoFisso?: { x: number; y: number } | null): void`.
  Il punto è in coordinate del contenuto **non scalato** (`PuntoFisso` di
  `motion/vista.ts`). Dentro, lo scaffold segue il protocollo del
  motion-designer: `fotografaVista(pagina)` **prima** di `store.set`, poi
  `cambiaVista(pagina, foto, v, puntoFisso ?? null, { scroller })` nel
  layout effect di `Foglio.tsx`. Poi manda l'annuncio in `aria-live` ("Vista
  Leggi" / "Vista Pagina intera…", testi del copywriter). Io non scrivo testi.
- `state/runtime.ts`: `runtime.foglio {x, y, scala}`,
  `runtime.tratti: Map<id, {avanzamento, bersaglio, riga, gesto}>`,
  `runtime.pan {spazio, trascina}`.
- `state/registro.ts`: `registro.get(id)` con `righe` (unità locali non
  scalate dell'`article`, al massimo 2) e `attacco`; `useVoceAnnuncio(id)`
  deve restituire un **nuovo oggetto** (o un nuovo array `righe`) a ogni
  rimisura, perché `Tratto` ricalcola le forme con `useMemo([righe])`;
  `type RigaTratto`.
- `core/ticker.ts`: `ticker.add(fn, 'update' | 'write')`, `ticker.wake()`.
- `core/scroller.ts`: `vaiA(x, y, { liscio })`, `mostraElemento(el, margine)`,
  `aCoordinateContenuto(clientX, clientY)` (contenuto non scalato).
- `core/semi.ts`: `semeDa(id): number`. `core/fonts.ts`: `fontsReady(): Promise<void>`.
- **Montaggio**: `Foglio.tsx` chiama `usePan(ref)`, `useTastieraFoglio(ref)` e
  `usePizzico(ref)` sullo scroller, nei due layout (i hook si spengono da soli
  nella colonna dove serve). `Evidenzia.tsx` importa `interaction/interaction.css`
  dopo `tokens.css` e `base.css`, e allo smontaggio chiama `segni.azzera()` e
  `azzeraCambioVista()`.
- **Nota**: `data-pan` su `.evd-root` (tech-architect §5) non serve. Il mio
  CSS legge `data-evd-pan` sullo scroller, scritto da `usePan`, solo quando
  cambia.
- Lo scroller in `layout = 'foglio'` deve avere la classe `evd-foglio`, la
  pagina `evd-pagina` e la griglia `evd-colonne`: le uso come zone vuote
  trascinabili.

## 9. Checklist per l'accessibility-auditor

- [ ] Nessun cursore personalizzato; solo `text`, `pointer`, `grab`,
      `grabbing`, `zoom-in` di sistema.
- [ ] Ogni gesto ha il suo bottone: Evidenzia / Nel giro (tratto), Togli, Prima
      e Dopo (trascinamento delle tappe), Leggi e Pagina intera (pizzico, `+`
      e `-`), frecce (spazio + trascina).
- [ ] Tratto annullabile: uscita verticale oltre 40 px, Esc, rilascio sotto il
      55% (WCAG 2.5.2).
- [ ] Il tratto è `aria-hidden`; lo stato "nel giro" si capisce da
      `aria-pressed`, dal testo "Nel giro" e dal bottone pieno nero, non solo
      dal rosa.
- [ ] `+` e `-` solo col fuoco nel foglio, mai con modificatori; lo zoom del
      browser funziona ovunque fuori dal foglio e a 400% (colonna).
- [ ] Anti-lampeggio: cambi di vista al massimo 1 ogni 500 ms (tasto tenuto
      premuto, pizzichi, clic a raffica). Il tratto cambia colore solo su
      superfici piccole (una riga).
- [ ] Reduced motion: stato finale immediato del tratto, nessuna transizione
      per tappe e interruttori, nessun "salto" di 1 px alla pressione.
- [ ] Anello di fuoco visibile su carta, su barre nere e su bottoni neri; sul
      foglio dentro il bordo; `Highlight` in contrasto forzato.
- [ ] Col dito: il gesto non parte a meno di 24 px dal bordo; il verticale
      scorre sempre; l'area di presa dell'attacco è di 44 px.

## Richieste ad altri agent

- **scaffold-engineer**: §8 (in particolare `impostaVista` con il punto
  fisso e il protocollo `fotografaVista`/`cambiaVista`, e il montaggio dei
  tre hook).
- **section-builder-annunci**: markup di §3.3 e attributi di §6. Sulle barre
  di rubrica e sui contenitori delle fasce va `data-evd-afferra`. L'avviso
  del quinto (8 s, `SCARICO.avvisoMs`) si mostra quando
  `store.scarico === id`.
- **section-builder-testata**: `<TrattoSu id="segna" modo="dimostrativo">`
  su "Segna" (nessun'altra parola evidenziata: trend, pattern 10);
  `data-evd-afferra` sulla testata (non sui link del sommario).
- **section-builder-comandi**: Leggi / Pagina intera con
  `chiediVista('leggi' | 'intera')`, mai con `impostaVista` diretto; nei
  bottoni `evd-ix-interruttore` (`aria-pressed`) o `evd-ix-premibile`.
  Il rettangolo della minipagina chiama `vaiA(..., { liscio: false })` (il
  trascinamento è suo). "Hai segnato" usa `<TrattoSu id>`.
- **section-builder-giro**: `useTrascinaTappe` come in §7; tratti delle tappe
  con `<TrattoSu id>`; Prepara/Manda il giro con `evd-ix-premibile`, Prima,
  Dopo e Togli con `evd-ix-testo evd-ix-tocco`.
- **section-builder-scheda**: "Evidenzia per il giro" con
  `evd-ix-interruttore` e `alterna(id, 'scheda')`: il tratto sul foglio si
  disegna da solo.
- **section-builder-piede / box**: `data-evd-afferra` sul piede. **Non** sui
  box redazionali: lì il testo si deve poter selezionare.
- **motion-designer**: uso `completa(el, da, { id, velocita })`,
  `ritira(el, da, { id, onFine })`, `scolora(el, { id, onFine })`,
  `disegnaDaBottone(el, { id })`, `dimostrativo(el)`,
  `scarico(el, { seme, onFine })` e `ferma(el)`. Non dichiaro `@property`
  per `--evd-avanzamento`. Nota: `ritira` va a 0 e non al punto di partenza
  del tratto: per me va bene, perché sotto `--evd-inizio` il ritaglio è già
  vuoto (il ritiro visibile dura un po' meno di 200 ms). La `velocita` che
  passo è in frazioni della lunghezza totale del tratto al secondo, che su una
  riga sola coincide con la tua.
- **art-director / vector-artist**: le due tabelle di opacità del tratto non
  coincidono (vector-artist corpo 0,8, striature carta 0,5; art-director corpo
  0,88, striatura composta 0,62, estremità 1). Ho seguito i token
  dell'art-director (§3.1). Se volete un valore diverso, cambiate i token, non
  il mio CSS.
