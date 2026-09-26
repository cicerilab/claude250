# Interaction designer · Concept 18 · SOTTOSCOCCA

Ondata 2. Rotta `/concept-18`. Seguiti `design-taste-frontend` (4.5, 5.D,
6.A, 6.B, 9.A) e `full-output-enforcement`: file completi, nessun segnaposto.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/processo-agent.md`,
`docs/matrice-concept-11-20.md` (riga e paragrafo 18),
`concepts/10-torchio/docs/integrazione-sito.md`, tutti i doc dell'ondata 1 in
`concepts/18-sottoscocca/docs/` (creative-director, trend-researcher,
brand-strategist, ux-architect, tech-architect), il doc interaction-designer
del pilota (solo formato). Dopo la ripartenza del container ho letto anche
i file già scritti in parallelo: `styles/tokens.css` (art-director),
`motion/easing.ts`, `motion/choreography.ts`, `motion/molle.ts`
(motion-designer), `content/lavori.ts` e `content/testi.ts` (copywriter), e
ho allineato nomi, durate e curve.

## 0. File consegnati

Tutti in `src/pages/concepts/sottoscocca/interaction/`:

| File | Cosa fa |
|---|---|
| `navigaPunti.ts` | `useNavigaPunti(ids)`: roving tabindex tra i punti di una quota, frecce, Home/Fine, hover e fuoco che evidenziano il pezzo. |
| `evidenza.ts` | Quale pezzo della scena diventa bianco: scheda aperta > punto indicato; **limite anti-lampeggio di un cambio ogni 500 ms**. `evidenzeCorrenti()` per `IngressoPonte.evidenze` di `motion/molle.ts`. |
| `useScheda.ts` | `usePropsApriScheda(punto, origine)` per punti ed elenco; `useScheda()` per la scheda: dialog non modale, fuoco all'h3, Esc, ritorno del fuoco, Tab "come se fosse dopo il punto", chiusura al cambio di sezione, foglio mobile che si chiude trascinando giù. |
| `trascinaBlocco.ts` | `useTrascinaBlocco(opzioni)`: trascinamento del blocco (mouse subito oltre 4 px, dito solo dopo 400 ms fermo), anteprima agganciata a 10', rilascio, Esc, correzione dello scroll, aggancio FLIP. |
| `useBloccoTastiera.ts` | `useBloccoTastiera(opzioni)`: frecce ±10' e ponte (orientate secondo il layout), PagSu/PagGiù giorno, Home/Fine, Invio, Esc. `useAnnuncioFermo` per non accodare venti annunci con il tasto tenuto. |
| `usePopover.ts` | `usePopover(id)`: il "Modifica" della barra "Il tuo lavoro" (Esc, clic fuori, Tab fuori, ritorno del fuoco). |
| `util.ts` | `rendiNuovo` (annunci ripetuti), `unisciRef`, `focusabili`, `eVisibile`, `prossimoFocusabileDopo`, `eTastoModificato`, `adesso`. |
| `interaction.css` | Anello di fuoco, pulsantiera, link, tamponi, planning durante il trascinamento, blocco, ombra, buchi, scheda e maniglia, popover, reduced motion, colori forzati. 2,3 KB gz, nessun hex. |

**Verifica fatta**: i file TS passano `tsc` (strict, `noUncheckedIndexedAccess`,
`noUnusedLocals/Parameters`) ed `eslint` con `react-hooks` (0 errori, 0 avvisi)
in un progetto di prova nello scratchpad, con i file veri di `content/`,
`motion/`, `styles/` e stub di `state/store.ts`, `state/runtime.ts`,
`core/ticker.ts` scritti **esattamente** con le firme del tech-architect (§2.3,
§6.1, §6.2) e del ticker del pilota. Il CSS passa `lightningcss` senza errori.
Non ho potuto provarli nel browser: lo scaffold non c'è ancora (la prova
dal vivo tocca ai section-builder e al cross-browser-tester, §9).

---

## 1. Cursore, preloader, magnetismo: cosa c'è al loro posto

Il prompt generale chiede "cursore custom, hover magnetici, preloader
memorabile". Qui sono **tutti esclusi**: il creative-director (4.9: niente
cursore custom, niente testo magnetico, niente preloader a percentuale,
niente parallasse al puntatore, niente luce che segue il puntatore), il
trend-researcher (pattern 7) e la skill (9.A). Il puntatore resta quello di
sistema; cambia solo dove dice qualcosa di vero: `grab` / `grabbing` sul
blocco trascinabile, mano sui bottoni.

Al posto del preloader c'è il fermo immagine a 0 cm (webgl-artist, shader).
Al posto del magnetismo, **gesti fisici di officina**:

| Gesto | Dove | Perché |
|---|---|---|
| Il tampone si schiaccia (`scale 0.9`) sotto il dito o il clic, e diventa bianco pieno con il centro nero quando la sua scheda è aperta | punti toccabili | sono i tamponi di gomma dei bracci |
| Il blocco si stacca da terra (+3%, filo nero attorno) quando lo afferri | planning | lo sollevi per spostarlo |
| Sul telefono, tenendo premuto, una **barra bianca sale lungo il fianco** del blocco in 250 ms: quando è in cima il blocco è afferrato | planning | è il ponte che sale: dice "tieni ancora un attimo" senza parole |
| Il blocco rilasciato **scivola** nella sua tacca (160 ms, curva `aggancio`), anche quando torna indietro ("non ci sta") | planning | il fermo di sicurezza che scatta |
| Il bottone scende di 1 px quando lo premi; sul bottone pieno il passaggio del mouse mostra il **bordo della targhetta** (filo nero rientrato), senza cambiare colore | tutti i bottoni | pulsantiera di una macchina utensile |
| I buchi liberi: la linea tratteggiata a terra diventa piena sotto il puntatore | planning | la postazione che si "prenota" |

---

## 2. Punti toccabili (`navigaPunti.ts`, `evidenza.ts`)

### 2.1 Tastiera (ux-architect 7.4)

- Un solo punto per quota è nella tabulazione (tabindex 0): Tab entra nel
  gruppo ed esce con un colpo solo.
- **Frecce destra/giù**: punto successivo; **sinistra/su**: precedente;
  l'ordine è quello di `ids`, cioè `ORDINE_PUNTI` filtrato per quota
  (`puntiDellaQuota(quota)` del copywriter: davanti → dietro). Si gira in
  tondo. **Home/Fine**: primo/ultimo.
- Invio e Spazio: **clic nativo del `<button>`** (così funzionano anche
  lettori di schermo e controllo vocale, che non mandano tasti).
- Si saltano i punti non raggiungibili (`hidden`, antenato `hidden`/`inert`,
  senza box). Il fuoco usa `preventScroll`: i punti sono fissi e già in vista.
- Ctrl/Alt/Cmd lasciano passare il tasto.

### 2.2 Puntatore

- Solo **mouse e penna** fanno "hover": il pezzo si evidenzia e l'etichetta
  compare. Il dito non fa hover (evita l'evidenziazione fantasma dopo un tocco).
- Anche il **fuoco** evidenzia il pezzo ed è equivalente all'hover.
- Uscire col mouse da un punto che ha il fuoco non spegne l'evidenza.

### 2.3 Evidenza e anti-lampeggio

- Bersaglio: la scheda aperta vince; senza scheda, l'ultimo punto indicato.
  Un solo punto alla volta (CD 4.3: "solo quel pezzo").
- **Il bersaglio cambia al massimo una volta ogni 500 ms**, da qualunque
  origine: ruote e pianale sono superfici grandi. Chi passa col mouse su
  quattro punti in un secondo vede due cambi, non otto; alla scadenza vince
  l'ultimo desiderio. La transizione verso il bersaglio (250 ms, `vernice`) è
  del motion-designer; con reduced motion è immediata ma sempre limitata a un
  cambio ogni 500 ms.
- Uscite: `evidenzeCorrenti()` (array stabile finché non cambia, per
  `IngressoPonte.evidenze`), `bersaglioEvidenza(pezzo)`, `ascoltaEvidenza(fn)`.
  Ogni cambio chiama `runtime.markDirty()` e `ticker.wake()`.
- `azzeraEvidenza()` allo smontaggio (nessun timer appeso).

### 2.4 Uso (section-builder-punti)

```tsx
const ids = puntiDellaQuota(quota);
const nav = useNavigaPunti(ids);

<ul role="group" aria-label={...} data-ssc-etichette={etichette}>
  {ids.map((id) => <Punto key={id} id={id} quota={quota} nav={nav} />)}
</ul>

// Punto.tsx
const p = nav.propsPunto(id);
const apri = usePropsApriScheda(id, 'scena');
<li>
  <button {...apri} {...p} ref={unisciRef(p.ref, refRegistro)}
          className="ssc-ix-punto ..." aria-label={nomeAccessibile}>
    <span className="ssc-ix-punto__etichetta" aria-hidden="true">{nome}</span>
  </button>
</li>
```

`propsPunto` restituisce `ref` stabili per ogni id (non si ri-registrano a
ogni render), quindi comporli con il ref di `registraPunto` è sicuro.

---

## 3. Scheda del punto (`useScheda.ts`)

| Cosa | Comportamento |
|---|---|
| Apertura | `usePropsApriScheda(punto, origine)` dà `type`, `aria-controls="ssc-scheda"`, `aria-expanded`, `data-ssc-ix-scheda-per`, `data-ssc-ix-origine`, `onClick`. Stesso bottone premuto di nuovo = chiude. Un altro punto = sostituisce. |
| Fuoco | all'apertura va all'h3 (`tabindex="-1"`, id `ssc-scheda-titolo`), senza scroll. |
| Esc | da qualunque punto della pagina, se nessun altro l'ha già usato (`defaultPrevented`). Riporta il fuoco al bottone d'origine se il fuoco era nella scheda, sul bottone o perso. |
| Ritorno del fuoco | al bottone d'origine; se non c'è più (quota cambiata) al gemello visibile dello stesso punto, preferendo la stessa origine (`scena` o `elenco`). |
| Tab | la scheda è una sola in fondo a Radice, ma Tab dall'ultimo controllo va al primo tabulabile **dopo il punto** e Maiusc+Tab dal primo torna al punto (ux 7.5: "come se fosse subito dopo il gruppo"). |
| Cambio sezione | se la pagina passa a un'altra sezione la scheda si chiude, **tranne** se il fuoco è dentro (chi legge da tastiera non la perde). Nessuno spostamento di fuoco. |
| Foglio su telefono | maniglia `.ssc-ix-maniglia` (44 px di presa, `aria-hidden`, `touch-action: none`, nascosta da 640 px): il foglio segue il dito (`translate`, variabile `--ssc-ix-scheda-dy` scritta nella fase `write`); si chiude oltre il 25% dell'altezza (minimo 96 px) o con uno scatto oltre 0,5 px/ms, altrimenti rientra in 200 ms (`cassetto`). "Chiudi" c'è sempre. |
| Chiusura da fuori | `chiudiSchedaDa(motivo)`; `'silenziosa'` e `'sezione'` non spostano il fuoco. |

Il foglio usa la proprietà `translate` e non `transform`: l'apertura e la
chiusura del motion-designer (`schedaApri`, `foglioApri`) possono usare
`transform` sullo stesso elemento senza conflitti. Uso:

```tsx
const s = useScheda();
<section {...s.propsPannello} className="ssc-punti__scheda ssc-ix-scheda" hidden={!s.aperta}>
  <div {...s.propsManiglia} className="ssc-ix-maniglia" />
  <h3 {...s.propsTitolo}>{nome}</h3>
  ...
  <button type="button" className="ssc-ix-premibile ssc-ix-premibile--contorno ssc-ix-tocco" onClick={s.chiudi}>Chiudi</button>
</section>
```

---

## 4. Il blocco sul planning: trascinamento (`trascinaBlocco.ts`)

### 4.1 Gesti

| Puntatore | Inizio | Durante | Fine |
|---|---|---|---|
| Mouse, penna | tasto premuto + 4 px di movimento (sotto è un clic) | cattura del puntatore, il blocco segue 1:1 | rilascio |
| Dito | **fermo 400 ms** (tolleranza 8 px). A 150 ms compare la barra che sale; se il dito si muove prima, è uno scroll e il blocco resta dov'è | solo il blocco afferrato blocca lo scroll | rilascio |
| Qualunque | | Esc annulla (ascoltatore in cattura sulla finestra, prima di scheda e popover) | rilascio fuori dal planning = annullato |

**Perché anche il `touchmove` non passivo**: il CD chiede `touch-action: none`
solo sul blocco afferrato, ma il browser legge `touch-action` al `touchstart`,
cioè 400 ms prima che il blocco sia afferrato. Da solo non basterebbe. Il
modulo aggiunge al blocco un `touchmove` con `passive: false` che chiama
`preventDefault()` **solo** quando il blocco è afferrato: col dito fermo per
400 ms lo scroll non è ancora partito, il primo `touchmove` è cancellabile e
la pagina non scorre. Resto del planning e della pagina: scroll normale.

Pressione lunga: niente menu contestuale (Android) né fumetto di selezione
(iOS: `-webkit-touch-callout: none`, `user-select: none` sul blocco).

### 4.2 Contratto con la sezione

```ts
const presa = useTrascinaBlocco({
  abilitato: invio !== 'sending' && invio !== 'sent',
  misura: () => ({                       // chiamata alla presa: letture di layout ammesse
    asse: layout === 'orizzontale' ? 'x' : 'y',
    lunghezza: durata * pxAlMinuto,
    minutoDa: (coord) => ...,            // anche nella fascia "chiuso": la sezione dirà P7
    ponteDa: (coord) => ...,
  }),
  onAnteprima: setAnteprima,             // { ponte, inizio } agganciato a 10', solo quando cambia
  onPresa: () => ...,                    // per esempio nascondere la mensola
  onRilascio: (pos, esito) => {          // 'rilascio' | 'fuori' | 'annullato'
    // la sezione valuta con planning.ts: P4, P5, P6, P7, e aggiorna lo store
  },
});
<div className="ssc-ix-planning" data-ssc-trascina={presa.stato === 'afferrato' ? 'si' : undefined}>
  <ul className="ssc-ix-corsia" data-ssc-adatta={adatta ? 'si' : 'no'}>
    <li className="ssc-ix-corsia__perche">{perche}</li> ...
  {anteprima && <div className="ssc-ix-ombra" data-ssc-esito={ciSta ? 'ci-sta' : 'non-ci-sta'} ... />}
  <button className="ssc-ix-blocco ..." data-ssc-ix-trascinabile="si"
          ref={unisciRef(presa.ref, mioRef)} {...presa.props}
          onClick={...} onKeyDown={tastiera.onKeyDown} aria-describedby="istruzioni-blocco">
```

- `stato` per React: `'fermo' | 'in-attesa' | 'afferrato'`. Il dettaglio
  visivo è `data-ssc-presa`, che **scrive solo il modulo** sull'elemento (la
  sezione non lo mette nel JSX), come `--ssc-ix-dx/-dy`.
- Se la pagina scorre durante il gesto (rotella), blocco e anteprima restano
  giusti: si corregge con `runtime.scrollY`.
- Il clic nativo che segue un trascinamento viene ignorato (400 ms).
- Il blocco può cambiare genitore (dal parcheggio a una corsia) e quindi
  elemento: il ref riapplica lo stato visivo al nuovo elemento.
- `abilitato: false` durante un gesto lo annulla.

### 4.3 Aggancio (FLIP)

`preparaAggancio()` va chiamato **prima** di cambiare la posizione nello
store. Il modulo lo chiama da solo a ogni fine di trascinamento; la sezione
lo chiama prima di "Primo buco libero", di un buco dell'elenco, di "Mettilo
lì", di "10' prima/dopo" e degli spostamenti da tastiera. Sequenza: misura
del rettangolo visibile → la sezione rende la nuova posizione → fase `read`
del frame dopo: nuova misura → `write`: il blocco torna visivamente dov'era
senza transizione → frame dopo: transizione di `translate` fino a 0 in 160 ms
(`DURATE.bloccoAggancio`, curva `aggancio`). Solo `translate` e `scale`,
nessuna proprietà di layout. Con reduced motion: scatto diretto.

### 4.4 Stato visivo delle corsie (P3)

`.ssc-ix-planning[data-ssc-trascina="si"] .ssc-ix-corsia[data-ssc-adatta="no"]`
va a `--ssc-opacita-corsia-no` (0,4) in 200 ms e mostra
`.ssc-ix-corsia__perche` ("Il ponte 3 fa solo gomme"). È un cambio di una
grande superficie **una volta per trascinamento**: dentro il limite di uno
ogni 500 ms. L'ombra "non ci sta" è tratteggio fitto zincato, **mai rosso**.

---

## 5. Il blocco da tastiera (`useBloccoTastiera.ts`)

Mappa (identica alle istruzioni già scritte dal copywriter in `testi.ts`):

| Tasto | Parcheggiato | Piazzato, orizzontale (desktop) | Piazzato, verticale (telefono) |
|---|---|---|---|
| Invio | primo buco libero | conferma, fuoco al primo campo | uguale |
| Spazio | clic nativo | clic nativo | clic nativo |
| ← / → | niente | −10' / +10' | ponte precedente / successivo |
| ↑ / ↓ | niente | ponte precedente / successivo | −10' / +10' |
| PagSu / PagGiù | niente | giorno precedente / successivo | uguale |
| Home / Fine | niente | inizio / fine del buco corrente | uguale |
| Esc | niente | torna nel parcheggio (non chiude altro) | uguale |

- Le frecce del tempo si ripetono tenendo premuto; ponte, giorno, Invio ed
  Esc no. `info.ripetuto` arriva alla sezione, che con `useAnnuncioFermo`
  annuncia solo la posizione raggiunta dopo 350 ms di pausa ("Ponte 2, dalle
  9:10 alle 11:40, libero"), non ogni passo.
- `comandoPerTasto(tasto, layout)` è puro ed esportato per i test.
- Niente `role="application"`; Tab e Maiusc+Tab escono normalmente.

---

## 6. Popover "Modifica" (`usePopover.ts`)

`aria-expanded`/`aria-controls` sul bottone; fuoco al primo "Togli"
all'apertura; Esc chiude e riporta il fuoco a "Modifica"; clic o tocco fuori
chiude senza spostare il fuoco; Tab che esce chiude. Se l'ultima voce viene
tolta e l'elemento col fuoco sparisce, la sezione chiama `riportaFuoco()`.

---

## 7. Classi e micro-interazioni (`interaction.css`)

| Classe | Stati |
|---|---|
| (tutto) `:focus-visible` | token dell'art-director: `--ssc-fuoco-spessore` 2 px, `--ssc-fuoco-colore` bianco, `--ssc-fuoco-distanza` 3 px; titoli raggiunti con i salti a 8 px |
| `ssc-ix-su-bianco`, `ssc-ix-premibile--pieno`, blocco con `data-ssc-ix-pieno="si"` | fuoco su bianco: filo nero grasso rientrato di 6 px + alone nero 3 px + anello bianco 2 px fuori (ux 7.1) |
| `ssc-ix-premibile` | `:active` scende di 1 px; `--pieno` hover: bordo della targhetta; `--contorno` hover: contorno da 2 a 3 px; `--pannello` hover: linea a terra 3 px sotto |
| `ssc-ix-link` | sottolineatura 1 px → 2 px al passaggio e con `aria-current` |
| `ssc-ix-tocco` | minimo 44 × 44 |
| `ssc-ix-punto` + `__etichetta` | tampone da `--ssc-punto-cerchio` in `--ssc-punto-area`, anello bianco + alone nero grasso; hover +1 px; `:active` schiacciato; `aria-expanded="true"` bianco pieno con centro nero; etichetta sempre con `data-ssc-etichette="sempre"` sul gruppo, altrimenti a hover/fuoco/scheda aperta; `data-ssc-ix-etichetta="sinistra"` se il punto è vicino al bordo destro |
| `ssc-ix-planning`, `ssc-ix-corsia`, `__perche`, `ssc-ix-ombra`, `ssc-ix-buco` | §4.4 |
| `ssc-ix-blocco` | `grab`, barra che sale, afferrato, aggancio (§4) |
| `ssc-ix-scheda`, `ssc-ix-maniglia` | §3 |
| `ssc-ix-popover`, `ssc-ix-annuncio` | pannello nascosto; regione messaggi ad altezza riservata (due righe) |

Il fuoco non finisce sotto i fissi: `scroll-margin-top` 88 px (72 px sotto
640), `scroll-margin-bottom` 24 px (88 px sotto 640, zona del bottone di
ritorno), più altezza della barra + 16 px quando c'è un elemento con
`data-ssc-ix-barra="visibile"` (ux 2.2, 7.6).

**Reduced motion** (sia `.ssc-root[data-motion="reduced"]` sia la media
query): nessuna transizione di stato, nessuno spostamento di 1 px, nessuno
schiacciamento, blocco senza sollevamento né scivolamento, barra di presa
piena subito (il tempo di 400 ms resta: è un gesto, non un'animazione).

**Colori forzati**: fuoco `Highlight` (dal token), tamponi con bordo
`ButtonText`, blocco afferrato con contorno `Highlight`.

---

## 8. Checklist per l'accessibility-auditor

1. Tab entra ed esce da ogni gruppo di punti con un colpo; frecce, Home, Fine
   si muovono tra i punti; Invio/Spazio aprono la scheda.
2. Apertura scheda: fuoco sull'h3; Esc e "Chiudi" riportano il fuoco al
   punto (o all'elenco); Tab dall'ultimo controllo va dopo il punto.
3. Il pezzo evidenziato non cambia più di una volta ogni 500 ms (contare i
   cambi passando col mouse su tutti i punti a 180 cm).
4. Planning: blocco con istruzioni collegate; ogni tasto di §5; annunci solo a
   fermo; trascinamento annullabile con Esc; tutti gli altri modi di
   piazzare presenti (WCAG 2.5.7).
5. Telefono: lo scroll col dito sul planning scorre la pagina; il blocco si
   afferra solo tenendolo fermo 400 ms; nessun menu della pressione lunga.
6. Fuoco mai sotto testata, bottone di ritorno, barra o mensola.
7. Reduced motion: nessuna traslazione o scala.

---

## 9. Da verificare dal vivo (non possibile in questa ondata)

- Pressione lunga + `touchmove` non passivo su Chrome Android e Safari iOS
  (cross-browser-tester, emulazione touch di Playwright): la pagina non deve
  scorrere col blocco afferrato e deve scorrere prima della presa.
- FLIP dopo un cambio di genitore del blocco (parcheggio → corsia).
- Tab emulato fuori dalla scheda con i punti a roving tabindex.

---

## Richieste ad altri agent

- **scaffold-engineer**: le firme che uso sono quelle del tech-architect:
  `import { ticker } from '../core/ticker'` (API del pilota §4.1: `add(fn,
  fase)` → rimozione, `wake()`); `import { runtime } from '../state/runtime'`
  con `scrollY` e `markDirty()`; da `../state/store`: `store.get()`,
  `store.subscribe(fn)` (restituisce la disiscrizione), `useSottoscocca(sel)`,
  e le azioni **esportate per nome** `apriScheda(punto, origine)` e
  `chiudiScheda()`; nello stato `schedaAperta`, `sezione`, `reducedMotion`.
  In `Radice.tsx`: importare `interaction/interaction.css` e allo smontaggio
  chiamare `azzeraEvidenza()` di `interaction/evidenza.ts`.
- **motion-designer**: in `ponte/quota.ts` (o dove si costruisce
  `IngressoPonte`) passare `evidenze: evidenzeCorrenti()` di
  `interaction/evidenza.ts`: è già limitato a un cambio ogni 500 ms. I miei
  valori CSS copiano `DURATE.bloccoAggancio` (160), `foglioRitorno` (200),
  `corsieAttenua` (200) e le curve `aggancio` e `cassetto` di `BEZIER_CSS`:
  se le cambi, dimmelo (sono in cima a `interaction.css`). Il trascinamento del
  blocco e del foglio usa la proprietà `translate`: le tue animazioni di
  scheda, foglio e "sale sul ponte" possono usare `transform` senza
  sovrapporsi.
- **section-builder-punti**: §2.4 e §3; bottoni-punto con `aria-label`
  completo ed etichetta visibile `aria-hidden`; `data-ssc-etichette` sul
  gruppo; linea di richiamo dei punti agganciati al bordo della zona a carico
  tuo (è disegno, non interazione); `usePopover` per "Modifica" e
  `data-ssc-ix-barra="visibile"` sulla barra quando si vede.
- **section-builder-ponte-libero**: §4 e §5; `data-ssc-trascina` sul
  contenitore, `data-ssc-adatta` sulle corsie, `data-ssc-esito` sull'ombra,
  `preparaAggancio()` prima di ogni cambio di posizione; il blocco deve essere
  posizionato (`absolute` o `relative`) perché la barra di presa è il suo
  `::after` (riservato a interaction, non usarlo).
- **copywriter**: le istruzioni da tastiera del blocco combaciano già; se vuoi,
  aggiungi "Inizio e Fine portano ai bordi del buco" (il tasto funziona anche
  senza).
- **tech-architect / ux-architect** (nota di coerenza, non blocca me): l'ux
  usa `ruota-ant`/`ruota-post` e `?invio=errore`, il tech-architect e il
  copywriter `ruota-anteriore`/`ruota-posteriore` e `?invio=ko`. Il codice
  segue il tech-architect.
