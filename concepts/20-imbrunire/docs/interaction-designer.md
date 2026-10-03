# Interaction designer · Concept 20 · IMBRUNIRE

Ondata 2. Rotta `/concept-20`. Seguiti `design-taste-frontend` (4.5, 5.D, 6.B,
9.A, 9.G) e `full-output-enforcement`: codice completo, niente segnaposto.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `creative-director.md`
(tutto, in particolare §5.3, §6, §7, §9, §10, §11), `trend-researcher.md`
(P8, pattern 5, rischio 4.6), `brand-strategist.md` (indice e 5.6), `ux-architect.md`
(tutto: 1, 2, 5.4, 6.1, 7), `tech-architect.md` (tutto, in particolare §2.3,
§4, §5, §6.1-6.10), e i file scritti in parallelo da art-director
(`styles/tokens.css`, `styles/luna.css`, `docs/art-director.md`) e
motion-designer (`motion/easing.ts`, `motion/choreography.ts`,
`motion/variabili.ts`, `motion/useParallasse.ts`, `docs/motion-designer.md`).

## 0. File consegnati

Tutti in `src/pages/concepts/imbrunire/interaction/`:

| File | Cosa fa | gz |
|---|---|---|
| `useSelezioneLune.ts` | "Scegli le lune": trascinamento sulle lune (mouse, penna, dito), tocco + tocco, tastiera del listbox, limiti (chiusura, notti occupate della stanza filtro, 14 notti), annullamento, annunci solo a gesto fermo | 9,0 KB |
| `useNastroScorrimento.ts` | Il nastro che scorre: rotella verticale → orizzontale, trascinamento dello spazio vuoto con inerzia, frecce ‹ › per mese, scorrimento al bordo durante la selezione, prima/ultima luna in vista. Esporta anche `misuraNastro`, `scorriAIndice`, `inizioMesi` | 6,0 KB |
| `useCelleTastiera.ts` | Roving tabindex spaziale sul palazzo (← → sul piano, ↑ ↓ tra piani sulla cella più vicina, Home/Fine, Spazio sui link, Esc). Esporta `unisciProps` | 3,6 KB |
| `useCaloreCella.ts` | Calore della cella al passaggio o al fuoco (+8% di luce, "da … a notte"), limitato a un cambio ogni 500 ms per cella; precarica la foto 1600 all'intenzione. Più `usePuntatoreScena()`, unico scrittore di `runtime.puntatore` per la parallasse | 2,9 KB |
| `useFoglio.ts` | Foglio dal basso della torre (pannello stanza 'meta'/'tutto', nastro solo 'meta'): maniglia trascinabile, lancio, bottone "Apri tutto"/"Riduci", Esc, fuoco restituito, tastiera virtuale | 4,8 KB |
| `useSwipeUscita.ts` | Swipe verso il basso sulla foto per uscire dalla stanza (dito e penna), con la foto che segue al 40% | 2,6 KB |
| `interaction.css` | Anello di fuoco a due toni, bottoni/link/aree di tocco, velo di calore e prezzo delle celle, stati delle lune (base di luce, arrivo fissato, anteprima, "fuori"), finestre delle ore, meccanica del foglio e dello swipe, reduced motion, contrasto forzato | 4,6 KB |

Peso totale del JS non minificato ≈ 30 KB gz (minificato molto meno): dentro il
budget di 60 KB del chunk insieme al resto del concept.

---

## 1. Cursore custom e preloader: nessuno

Il prompt dell'ondata chiede "cursore custom, hover magnetici, preloader". Per
IMBRUNIRE sono esclusi dal creative-director (§11: "Niente cursore custom,
niente testo magnetico, niente Scorri") e dalla skill (9.A). Al loro posto:

- **La luce è il cursore.** Il puntatore di sistema resta normale (mano sulle
  celle e sulle lune, "mano aperta" sullo spazio vuoto del nastro, freccia
  doppia durante la selezione). A rispondere è la stanza: si scalda di un 8%
  e dice il suo prezzo. Toccabile = acceso, come vuole P6 del trend-researcher.
- **L'accensione è l'apertura.** Nessun preloader: il palazzo c'è dal primo
  frame, spento, e si accende (motion-designer). Le celle sono cliccabili da
  subito.

---

## 2. L'interazione firma, dalla parte dell'interazione

La camera che entra è del motion-designer (`motion/camera.ts`). Qui sta tutto
quello che porta a entrare e a scegliere:

1. **Guardare**: il palazzo risponde al puntatore solo con il calore della
   cella e la parallasse del tetto (≤ 2°, motion; il puntatore lo scrivo io).
2. **Entrare**: clic, tocco, Invio o Spazio sulla cella. Con la tastiera il
   palazzo si percorre come un palazzo: un Tab per entrare, frecce per muoversi
   tra stanze e piani.
3. **Scegliere le notti**: si trascina sulle lune. Le stanze occupate si
   spengono mentre il dito si muove (lo store raggruppa le luci ogni 500 ms).
4. **Uscire**: Esc, indietro, "Torna al palazzo", swipe giù sulla foto.

Un gesto per zona (P8): sul palazzo si tocca; sul nastro si trascina; sulla
maniglia del foglio si tira; sulla foto si scende. Nessuna zona ha due gesti
di trascinamento in competizione: lo spazio vuoto del nastro scorre, le lune
selezionano.

---

## 3. Le lune (`useSelezioneLune.ts`)

### 3.1 Gesto col puntatore

| Puntatore | Quando parte la selezione | Annulla |
|---|---|---|
| Mouse, penna | dopo 4 px di spostamento orizzontale partito da una luna | rilascio a più di 36 px sopra o sotto il nastro (stato `fuori`: le basi si velano), pointercancel |
| Dito | dopo **120 ms di tenuta** o dopo **8 px** in orizzontale partiti da una luna (`NASTRO.tenuta`, `NASTRO.sogliaSelezione`) | come sopra, più un secondo dito; uno spostamento verticale > 10 px prima dell'avvio lascia il gesto al browser (il foglio scorre) |

- **Indice dall'ascissa**, mai `elementFromPoint`: al pointerdown si misura la
  luna toccata e la sua vicina (il **passo vero** impaginato, il token è il
  ripiego), poi `round((x − sinistra + scrollLeft − base − d/2) / passo)`.
  Verificato in Chromium: il passo misurato evita l'errore di una luna quando
  la sezione impagina con un passo diverso dal token.
- Gli eventi si fondono nel ticker: fase `read` (rettangolo e scrollLeft del
  nastro), fase `update` (indice, bordo, "fuori", `onCambia`): **al più un
  `onCambia` per frame**.
- **Scorrimento al bordo**: nella fascia `NASTRO.zonaBordo` (56 px, al massimo
  un quarto del nastro) scrivo `runtime.nastro.bordo` (−1/0/1) e
  `runtime.nastro.spinta` (0..1, profondità nella fascia);
  `useNastroScorrimento` scorre a `NASTRO.velocitaBordo · spinta²` px/s.
- **Da una notte chiusa o occupata non parte nessuna selezione**: il tocco
  la rifiuta e la riga di stato dice perché.

### 3.2 Tocco + tocco

Primo tocco = arrivo fissato (stato P3: `ancora`, la base piena sotto quella
luna, il palazzo non cambia). Col mouse le lune fino al puntatore sono in
**anteprima** (basi velate al 45%). Secondo tocco = ultima notte (prima o dopo
l'arrivo: l'ordine si sistema da solo). Lo stesso tocco due volte = una notte.
Un clic senza puntatore (lettore di schermo che attiva l'opzione) vale come
tocco; un clic gemello entro 600 ms da un gesto si ignora.

### 3.3 Tastiera (listbox, `aria-activedescendant`)

| Tasto | Effetto |
|---|---|
| ← → | luna attiva precedente/successiva (portata in vista, morbido salvo reduced motion) |
| Maiusc + ← → | allarga o stringe la selezione dalla luna fissata (o dall'altro capo della selezione esistente); al rilascio di Maiusc si conferma e si annuncia |
| Invio / Spazio | fissa l'arrivo, poi l'ultima notte |
| Pag↑ / Pag↓ | inizio del mese precedente / successivo |
| Home / Fine | stasera / ultima notte dell'orizzonte |
| Esc | annulla la cosa più interna (gesto, estensione, arrivo fissato); se non c'è niente, `onEsc` (chiude `#/lune`) |
| Canc / ⌫ | svuota |

Il fuoco resta sul listbox; l'anello si disegna sulla luna attiva
(`[data-imb-ix-attiva]`), non su tutto il nastro.

### 3.4 Limiti e motivi

Applicati **dall'ancoraggio verso il puntatore**, così anche un trascinamento
all'indietro si ferma dalla parte giusta (lo store, che tronca dal `dal` in
avanti, non potrebbe saperlo):

| Motivo (`MotivoSelezione`) | Quando |
|---|---|
| `troppe-notti` | oltre 14 notti (`NOTTI_MAX`) |
| `chiuso` | si attraversa o si tocca una notte di chiusura (`chiuso(d)`) |
| `notte-occupata` | con il filtro di una stanza ("Le mie notti qui"), si attraversa o si tocca una sua notte occupata |

Il minimo di agosto resta dello store (P9: luci non aggiornate, selezione
tratteggiata).

### 3.5 Annunci

`onCambia(sel, { motivo, stabile })`. `stabile: true` a fine gesto, a ogni
tocco o Invio, al rilascio di Maiusc e dopo **500 ms fermi** durante un
gesto (`NASTRO.annuncio`). Il valore restituito `inCorso` dice alla riga di
stato di non annunciare (ux 7.4): il testo visibile si aggiorna dal vivo,
`aria-live` parla solo a gesto fermo.

### 3.6 API

```ts
const s = useSelezioneLune(nastroRef, {
  lune,                 // DataISO[] da lunePerIntervallo(oggi, 240)
  passo,                // misureLune(...).passo (ripiego: si misura dal DOM)
  filtro,               // SlugCamera | null
  onCambia: (sel, info) => scegliNotti(sel, { filtro, motivo: info.motivo }),
  onEsc: chiudiStratoAlto,
});
// s.attiva, s.ancora, s.anteprima, s.inCorso, s.fuori, s.vaiA(i), s.annullaAncora()
<div ref={nastroRef} {...scorrimento.propsScorrevole}>         // contenitore che scorre
  <div aria-label={...} aria-describedby={...} {...s.propsListbox}>
    {lune.map((info, i) => <LunaNastro key={info.data} {...s.propsLuna(i)} info={info} />)}
  </div>
  <div aria-hidden="true">…giorni e iniziali…</div>               // fascia dei giorni: scorre col dito
</div>
```

`propsLuna(i)` contiene solo primitivi e un `onClick` stabile: `LunaNastro` in
`React.memo` si ridisegna solo se cambia il suo stato. L'etichetta di ogni luna
(`aria-label`) è del copywriter e la mette la sezione.

**Struttura richiesta**: le opzioni (`[role=option]`) sono le **aree delle
lune** (44 × 44, disco dentro); giorni e iniziali stanno in una fila separata
`aria-hidden` (il nome della luna li contiene già). Così il dito sulle lune
seleziona e il dito sui giorni scorre (`touch-action: pan-y` sulle lune,
default sui giorni).

---

## 4. Il nastro che scorre (`useNastroScorrimento.ts`)

- **Rotella**: deltaY → scrollLeft, solo se il nastro può ancora scorrere in
  quella direzione (ai bordi la rotella torna alla pagina); Ctrl+rotella
  (zoom) non si tocca; deltaX resta nativo.
- **Spazio vuoto** (mouse, penna): tutto ciò che non è opzione, bottone, link
  o campo. Inerzia `v·e^(−4,2·t)` fino a 14 px/s (`NASTRO`), spenta con
  reduced motion. Il dito usa lo scorrimento nativo.
- **Frecce ‹ ›**: `propsIndietro` / `propsAvanti` (con `aria-disabled` ai
  capi); vanno all'inizio del mese precedente/successivo con `scrollTo`
  morbido (auto con reduced motion). `meseCorrente` e `meseSuccessivo` danno
  gli indici per i nomi dei mesi sulle frecce.
- `primo` / `ultimo`: lune interamente in vista, aggiornate solo quando
  cambiano (lettura nel ticker, `ResizeObserver` sul nastro, nessun listener
  sulla finestra).
- `overscroll-behavior-x: contain`: a fine nastro il trackpad non fa "pagina
  indietro".

---

## 5. Il palazzo (`useCelleTastiera.ts`, `useCaloreCella.ts`)

### 5.1 Tastiera

Geometria dalla **pianta** (larghezze % di ux 2.2), non dal DOM: vale uguale
in sezione, torre e palazzo ridotto. ↑ ↓ scelgono la cella del piano vicino
con il centro più vicino (a parità vince la sinistra). Verificato: Il Noce →
Il Campanile → ↓ La Loggia → ↓ La colazione; Fine → La Corte; un solo
`tabIndex=0`. Nella torre la cella col fuoco va in vista con
`scrollIntoView({ block: 'nearest' })` (morbido salvo reduced motion; lo
`scroll-padding` per la testata è di `base.css`). Il ritorno del fuoco
all'uscita (`scena.focaCella`) aggiorna da solo la cella attiva (`onFocus`).

```ts
const celle = useCelleTastiera({ piani: PIANI_DA_dati_palazzo, onEsc: () => chiudiSeLune() });
const calore = useCaloreCella({ foto: FOTO[slug]?.principale ?? null, attivo: camera === 'ferma' });
<button {...unisciProps(celle.propsCella(slug), calore)} aria-label={...} onClick={entra}>…</button>
```

### 5.2 Calore

- Attributo `data-imb-ix-calda` scritto sul DOM nella fase `write` (nessun
  render React). CSS: il velo `[data-imb-ix-velo-calore]` (lo mette la Scatola
  sulla faccia di fondo, sopra la foto) passa a opacità 1: un gradiente di luce
  a `--imb-calore` (8%); entra in `--imb-luce-calore-entra` (400 ms), esce in
  `--imb-luce-calore-esce` (600 ms).
- `[data-imb-ix-prezzo]` (il "da … a notte") compare al calore o al fuoco
  **solo nella sezione**; nella torre è sempre visibile. Solo opacità.
- **Anti-lampeggio**: una cella cambia calore al massimo una volta ogni 500 ms
  (verificato: uscita dopo 100 ms → ancora calda, dopo 600 ms → fredda).
- **Intenzione**: 150 ms di passaggio, fuoco o pointerdown → `precaricaFoto`
  della 1600, una volta per cella.

### 5.3 Puntatore della scena

`usePuntatoreScena()` (una volta, in `Palazzo.tsx`): `pointermove` passivo
sulla finestra → `runtime.puntatore` normalizzato −1..1 + `ticker.wake()`;
solo sezione, solo puntatore fine, mai con reduced motion; uscita dalla
finestra o blur → riposo.

---

## 6. Il foglio (`useFoglio.ts`) e lo swipe (`useSwipeUscita.ts`)

### 6.1 Foglio

```ts
const foglio = useFoglio({
  attivo: layout === 'torre' && !finestraBassa,   // < 480 px di altezza: nel flusso (ux 2.4)
  aperto, quota: 0.5,                              // nastro: quota 0.36, quotaMin 240, posizioni ['meta'], titoloId
  onChiudi: chiudiStratoAlto,
});
<section {...foglio.propsFoglio}>
  <div {...foglio.propsManiglia}>  <button {...foglio.propsInterruttore}>{foglio.posizione === 'tutto' ? RIDUCI : APRI_TUTTO}</button></div>
  <div data-imb-ix-foglio-corpo>…</div>
</section>
```

- Il foglio resta **montato** anche chiuso (`data-imb-ix-foglio="chiuso"`:
  fuori schermo e `visibility: hidden` dopo la transizione), così si apre e si
  chiude con la curva `foglio`. Se montato già aperto, `@starting-style` lo fa
  salire.
- Solo `transform` (la camera usa `translate` sul pannello: nessun conflitto,
  come chiede il motion-designer).
- Rilascio: oltre il 35% sotto 'meta' o lancio giù > 0,9 px/ms → `onChiudi`;
  lancio > 0,5 px/ms sceglie la posizione nella sua direzione; altrimenti la
  più vicina. Sopra 'tutto' resistenza al 25%.
- `--imb-ix-foglio-meta` (px) scritto da JS al resize; `--imb-ix-tastiera`
  da `visualViewport` (≥ 80 px = tastiera): il foglio sale e il campo attivo
  resta in vista.
- Fondo: `--imb-riserva-fondo` + safe area: la riga d'azioni sta sopra la
  fascia del `ConceptBackButton` (la parte sinistra di 224 px la lascia libera
  la sezione).
- Esc chiude (se un controllo interno non l'ha già usato); alla chiusura il
  fuoco torna a chi ha aperto il foglio.
- Nastro: `dialog` non modale (`aria-modal=false`, `aria-labelledby`);
  l'`inert` del resto della torre è della radice.

### 6.2 Swipe d'uscita

`{...useSwipeUscita({ attivo: layout === 'torre' && camera === 'dentro', onEsci })}`
su un **involucro non 3D** della foto dello strato Dentro (la camera anima le
facce). `touch-action: pan-x pinch-zoom`. Esce oltre max(96 px, 18% della
finestra) o con un lancio ≥ 0,6 px/ms di almeno 40 px, direzione quasi
verticale. Il bottone "Torna al palazzo" resta l'alternativa sempre visibile.

---

## 7. Alternative a ogni gesto (accessibilità)

| Gesto | Alternativa da tastiera | Alternativa senza gesto |
|---|---|---|
| Passaggio sulla cella (calore, prezzo) | il fuoco fa lo stesso | prezzo sempre scritto nella torre e nel nome accessibile |
| Entrare in una cella | Invio / Spazio | clic, tocco, "Entra" nell'elenco |
| Trascinare sulle lune | Maiusc + ← → | tocco + tocco; "Scrivi le date" (campi nativi, sezione lune) |
| Scorrere il nastro | ← → / Pag↑ Pag↓ / Home / Fine (la luna attiva si porta in vista) | frecce ‹ › |
| Tirare il foglio | "Apri tutto" / "Riduci" (`aria-expanded`), Esc | stessi bottoni, "Fatto"/"Chiudi" |
| Swipe giù sulla foto | Esc | "Torna al palazzo" |

- Anello di fuoco 2 px luce a 3 px + filo di notte (art-director), mai tolto,
  `Highlight` in contrasto forzato.
- Aree di tocco ≥ 44 px su lune, finestre delle ore, maniglia, `.imb-ix-tocco`.
- Libera/occupata e scelta non sono solo colore: base di luce per **forma**
  (segmenti, più lunghi su arrivo e ultima notte), `aria-selected`, parole
  nella riga di stato.

## 8. Anti-lampeggio e reduced motion

- Grandi superfici: il calore ≤ 1 cambio / 500 ms per cella; le luci delle
  notti le raggruppa lo store (500 ms); io non accendo né spengo stanze.
- Durante il trascinamento `onCambia` al più una volta per frame; il palazzo
  cambia comunque al più ogni 500 ms (`selezioneLuci`).
- Reduced motion: niente inerzia, scorrimenti `auto`, nessun puntatore della
  scena, la foto non segue lo swipe, nessuna spinta su bottoni e lune; le durate
  arrivano a 0 (o 250 ms per le luci) da `motion/variabili.ts`.

## 9. Verifica fatta

- `tsc` strict (`noUncheckedIndexedAccess`, `noUnusedLocals`) ed `eslint` con
  `react-hooks` verdi, in un progetto di prova
  (`scratchpad/interaction-20/`) con stub di store, runtime, ticker (copia del
  pilota), date, disponibilità e foto scritti come i contratti del
  tech-architect §6. CSS validato con postcss; 4,6 KB gz.
- **Harness Vite su porta 9211 + Playwright Chromium**, zero errori in
  console: trascinamento 2→5 = 4 notti con basi inizio/mezzo/fine;
  trascinamento all'indietro 10→7 = dal 7 per 4 notti; rilascio lontano =
  annullato (selezione di prima); tocco + tocco col dito 3→6; tastiera
  (Home, →→, Invio, Maiusc+→→ = 3 notti, Pag↓ al 1° novembre, Canc, Esc);
  rotella, frecce di mese, inerzia; limite 14 notti con motivo
  `troppe-notti` e scorrimento al bordo; celle (frecce spaziali, Fine, un solo
  tabIndex 0, Esc); calore limitato a 500 ms; foglio (meta → tutto, `--imb-ix-foglio-meta`
  = 50% della finestra, trascinamento giù → chiude); swipe col dito → esce.
  Screenshot degli stati delle lune guardati (arrivo pieno, anteprima velata,
  segmenti separati senza pillola, anello sulla luna attiva).
- Server chiuso a fine prova.

---

## Richieste ad altri agent

1. **scaffold-engineer** (contratti usati dai miei file; il resto è già come
   tech-architect §6):
   - `state/runtime.ts`: `nastro` ha anche **`spinta: number`** (0..1,
     profondità del puntatore nella zona del bordo; 0 a riposo e in `reset()`).
   - `state/store.ts`, azione `scegliNotti(sel, o?)`: accettare
     **`o.motivo?: MotivoSelezione | null`** e usarlo come `motivoSelezione` se
     la sua validazione non ne trova uno proprio; accettare anche `sel === null`
     con un motivo (luna chiusa toccata senza selezione) e `sel` identica a
     quella corrente con un motivo nuovo (solo la riga di stato cambia).
     Aggiornare la query dell'hash solo con `info.stabile` (o con `replace` a
     ogni chiamata: è comunque ≤ 1 per frame).
   - `core/ticker.ts`: stessa API del pilota (`add(fn, fase) → rimuovi`,
     `wake()`, rimozione sicura durante il frame, `attiva()`).
   - Usati: `core/date` (`NOTTI_MAX`, `chiuso`, `differenzaGiorni`),
     `dati/disponibilita` (`occupata`), `core/foto` (`precaricaFoto(f): Promise<void>`),
     `assets/foto` (tipo `Foto`), `useImbrunire` (`layout`, `reducedMotion`,
     `selezione`).
   - `Imbrunire.tsx`: importare `interaction/interaction.css` dopo
     `layout.css` (ordine già scritto dall'art-director §3.1).
2. **section-builder-lune**: struttura di §3.6 (opzioni = aree delle lune,
   giorni in una fila separata `aria-hidden`); `LunaNastro` in `React.memo`;
   aggiungere `imb-luna--scelta` alla luna con `aria-selected` (alone
   dell'art-director) e lasciare a me la base (`::after`); riga di stato con
   `aria-live` solo quando `!s.inCorso`; messaggio P3 da `s.ancora`; "Vai alle
   lune" → `s.vaiA(indiceStaseraOPrimaNotte)` e fuoco al listbox. Nella torre il
   foglio delle lune con `--imb-ix-foglio-altezza: var(--imb-ix-foglio-meta)`.
3. **section-builder-palazzo**: `useCelleTastiera` con la pianta di
   `dati/palazzo.ts`; `useCaloreCella` per cella + `unisciProps`;
   `<span data-imb-ix-velo-calore aria-hidden="true">` sulla faccia di fondo
   della Scatola (non sull'elemento `preserve-3d`); `data-imb-ix-prezzo` sul
   "da … a notte"; `usePuntatoreScena()` una volta in `Palazzo.tsx`. Il
   palazzo ridotto del foglio usa una sua istanza con `attivo: false` per il
   calore.
4. **section-builder-stanza**: `useFoglio` (quota 0,5, posizioni
   `['meta','tutto']`, `imposta('tutto')` quando il pannello diventa
   prenotazione) e `useSwipeUscita` sull'involucro della foto.
5. **section-builder-prenota**: le finestre delle ore possono usare
   `.imb-ix-finestra` (label con radio `imb-sr` dentro); bottone primario
   `.imb-ix-bottone .imb-ix-bottone--grande`, durante l'invio `aria-busy="true"`
   (resta premuto, nessuno spinner).
6. **copywriter**: servono testi per "Apri tutto" / "Riduci" della maniglia
   del foglio e per il nome accessibile delle frecce ‹ › ("Mese precedente:
   settembre" / "Mese successivo: novembre", con il mese come parametro), se
   non già presenti in `content/testi.ts`.
