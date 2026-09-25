# Interaction designer · Concept 10 · IMPRONTA

Ondata 2. Rotta `/concept-10`. Seguiti `design-taste-frontend` (sez. 4.5,
5.D, 6.B, 9.A) e `full-output-enforcement`: codice completo, niente segnaposto.

Letti: `docs/processo-agent.md`, `creative-director.md`, `trend-researcher.md`,
`brand-strategist.md`, `ux-architect.md` (sez. 2, 5.1, 5.2, 5.4, 5.6, 6),
`tech-architect.md` (tutto, in particolare §4 e §6), e i file già scritti in
parallelo da copywriter (`content/testi.ts`), motion-designer
(`motion/easing.ts`, `motion/spring.ts`, `motion/choreography.ts`) e
art-director (`styles/tokens.css`, `styles/relief-fallback.css`).

## 0. File consegnati

Tutti in `src/pages/concepts/impronta/interaction/`:

| File | Cosa fa |
|---|---|
| `light.ts` | Luce radente: puntatore con inerzia, dito sulla carta, giroscopio (solo se attivato), arco dell'hero, dial "Direzione della luce" (`useLuceDial`), variabili CSS del fallback. Contiene anche il magnetismo sobrio (`attachMagnete`, `useMagnete`). |
| `gyroPermission.ts` | Stato della "luce col telefono": sensore, permesso iOS, invito una volta per visita, interruttore dell'indice (`useGyro`). |
| `useHoldToConfirm.ts` | La leva "tieni premuto per stampare": mouse, dito, Spazio/Invio tenuti, doppia pressione breve, clic dei lettori di schermo, progress 0→1, annunci. |
| `paperWave.ts` | Onda di cambio carta dal punto toccato (`startPaperWave`, `cambiaCarta`), stato per lo shader (`getPaperWave`). |
| `useSwipeDeck.ts` | I tre lavori di "Per chi" da sfogliare sotto i 1024 px, con nomi-bottone e frecce. |
| `interaction.css` | Anello di focus, stati hover/active/focus, scelte come fogli, dial, leva, mazzo, velo dell'onda, reduced motion. |

Verifica: i sei file passano `tsc` (strict, `noUncheckedIndexedAccess`,
`noUnusedLocals`) ed `eslint` con `react-hooks` in un progetto di prova con
gli stub di `store`, `runtime`, `ticker` e `analytics` scritti esattamente
come nella sezione 11. Il CSS passa il parser di lightningcss.

---

## 1. Cursore custom e preloader: cosa li sostituisce

Il prompt originale dell'ondata chiede "cursore custom" e "preloader
memorabile". Per IMPRONTA sono **vietati** dal creative-director (4.3 e 4.5:
"niente cursore custom, niente cerchio che segue il mouse, niente testo
magnetico sui bottoni"; 4.2: "niente preloader a percentuale") e dal
trend-researcher (divieti 12 e 13). La skill li classifica come AI tell (9.A:
"NO custom mouse cursors"). Rispetto il divieto. Al loro posto:

**La luce radente è il cursore.** Il puntatore di sistema resta quello
normale (freccia, mano sui link, testo sui paragrafi: ognuno dice cosa si può
fare). A rispondere è la lampada: dove porti il mouse, da lì arriva la luce che
rade la carta e fa emergere il solco delle lettere. È un cursore senza oggetto:
non copre niente, non ritarda niente, non si perde sui bordi, non ha bisogno di
nascondere quello vero. Ha anche una causa fisica leggibile (trend P11): chi
controlla una prova in bottega inclina il foglio sotto la lampada.

**La prima pressa dell'hero è l'unico momento di attesa.** Nessuna schermata
di caricamento, nessuna percentuale, nessun contenuto bloccato. Dal primo
frame ci sono il titolo in inchiostro, il sottotitolo e "Prova la tua",
cliccabili (LCP = H1 nel DOM). Sopra, la parola *impronta* viene premuta una
volta sola (0 → 1 in circa 1,1 s, con la curva `pressa` del motion-designer):
parte sul rilievo CSS e, se il WebGL arriva dopo, lo shader la riprende dallo
stesso valore (tech-architect §9.6). È un'attesa che *mostra il mestiere*
invece di nasconderlo, e dura meno dei 1,5 s che il trend-researcher indica
come soglia. Con reduced motion la parola è già premuta.

Cosa fa questo documento, allora, del mandato "cursore, hover magnetici,
micro-interazioni, preloader": la luce al posto del cursore, il magnetismo solo
su due oggetti fisici, le micro-interazioni come stati di carta e inchiostro, e
nessun preloader.

---

## 2. Luce radente (`light.ts`)

### 2.1 Convenzione

Azimut = direzione **da cui** arriva la luce, in gradi, sullo schermo con y
verso l'alto: 0 da destra, 90 dall'alto, **135 da sinistra in alto (riposo)**,
180 da sinistra, 270 dal basso. Elevazione = gradi sopra il foglio, sempre
tra 18 e 25 (22 a riposo): la luce resta radente, il rilievo non sparisce mai
e non "ricompare di colpo" (trend 5.2). È la stessa convenzione di
`LUCE.valore()` del copywriter e delle variabili `--imp-luce-x/-y`
dell'art-director (vettore verso la luce, y in basso: `cos`, `-sin`).

### 2.2 Fonti (vince l'ultima che si muove)

| Fonte | Come | Limiti |
|---|---|---|
| **Puntatore fine** | `pointermove` su `window` (passivo). Posizione normalizzata nella finestra → `luceDaPosizione(nx, ny)`. | Arco di ±50° attorno a 135 (85-185°): come inclinare un foglio, non girargli attorno. La mappatura è continua (nessun salto sulla diagonale). |
| **Dito** | `pointerdown` di tipo touch su `.imp-root`, solo se il bersaglio è **carta**: non un controllo (`a, button, input, label, [role=radio]…`, `.imp-ix-dial`, `[data-imp-no-luce]`) e non un testo (`p, h1-h6, li, dd…`). Il rilievo `.imp-relief` conta come carta. | Le superfici hanno `touch-action: pan-y` (`[data-imp-luce]`): lo scroll verticale resta del browser (arriva `pointercancel`), si muove la luce solo con i tocchi fermi e i trascinamenti orizzontali. Selezione del testo intatta. |
| **Giroscopio** | `deviceorientation`, solo con `gyroPermission` in stato `attivo`. Posizione neutra = primo evento, ricentraggio lento (0,2% per evento), rotazione dello schermo gestita. ±25° di inclinazione = bordo della finestra. | Ignorato mentre un dito è sulla carta. Mai all'avvio (vedi §3). |
| **Dial** | `input type=range` 0-345, passo 15. | Precedenza di 1,5 s sul puntatore, e il puntatore sopra il dial non conta: trascinarlo col mouse non si auto-sovrascrive. Può fare il giro intero: è una scelta esplicita. |
| **Nessun input** | Arco automatico solo con l'hero in vista (IntersectionObserver, soglia 15%): 135 ± 45°, **un solo periodo di 40 s per visita**, obiettivo aggiornato a 30 Hz. Il primo input (puntatore, dito, tasto, fuoco su un controllo) lo ferma per sempre. Non parte nel fallback CSS su puntatore grossolano. Fuori dall'hero la luce torna a 135° e si ferma. | Parte sempre da 135 (fase zero): nessuno scatto. Giro 2. |

### 2.3 Inerzia

L'inseguimento è `seguiAngoloDt(…, 0,08, dt)` e `seguiDt` del
motion-designer: 0,08 della distanza per frame a 60 Hz, indipendente dal frame
rate, sempre per la via più corta. La luce "arriva dopo" il cursore, come una
lampada spostata a mano. Sotto 0,02° si ferma esattamente e il ticker può
dormire (render on demand, 0 frame da fermo).

### 2.4 Uscite

- `runtime.light.{azimuth, elevation}` (letti dal WebGL) e `runtime.markDirty()`
  a ogni cambio.
- `--imp-luce-x`, `--imp-luce-y` **sulle sole foglie che le leggono e sono in
  vista** (giro 2, mai su `.imp-root`), calcolate con
  `vettoreLuce(azimut)` di `styles/tokens.ts` (art-director), **solo** con
  `data-gl` diverso da `on`, al massimo 30 volte al secondo: il `text-shadow`
  del fallback CSS gira con la luce.
- `--imp-ix-dial-az` sui soli contenitori dei dial (l'icona ruota anche col
  WebGL acceso), stesso limite di 30 Hz.
- Nessun evento di analytics: nel sito vero `track()` accetta solo
  `apri_concept` e `demo_prenotazione` (docs/integrazione-sito.md), e la luce
  mossa non è un evento utile. Nessun mio file chiama `track`.

### 2.5 Reduced motion

Luce ferma a 135° / 22°, nessun listener di puntatore, dito o giroscopio (si
staccano anche se la preferenza cambia a pagina aperta), nessun arco. Il dial
resta e sposta la luce **di scatto**, senza inseguimento.

### 2.6 Nessun lampo

La luce cambia solo per azimut ed elevazione, lentamente: la luminosità di un
punto non oscilla mai più di una volta per movimento e l'arco ha un periodo di
40 s. Nessuna intensità animata, nessun "flash" all'arrivo.

---

## 3. Luce col telefono (`gyroPermission.ts`)

Stati: `non-supportato`, `da-chiedere`, `invito`, `attivo`, `spento`,
`rifiutato`.

- **Supportato** solo se esiste `DeviceOrientationEvent` e il puntatore è
  grossolano. Dopo "Attiva" si aspetta un dato valido per 1,5 s: se non
  arriva, il sensore è muto e lo stato diventa `non-supportato` (niente UI
  inutile).
- **Invito**: al rilascio del primo tocco sulla carta (`pointerup` touch, che
  su iOS è un gesto valido), una volta per visita (`sessionStorage`
  `impronta:luce-telefono`). L'hero mostra la riga `HERO.tilt.frase` con i
  bottoni `HERO.tilt.attiva` e `HERO.tilt.lascia`.
- **Attiva**: `attivaGyro()` va chiamata dentro il clic. Su iOS chiama
  `DeviceOrientationEvent.requestPermission()` in modo sincrono nel gesto (nessun
  `await` prima). `denied` → `rifiutato`, e l'invito non torna. Un
  `NotAllowedError` (gesto non valido) non conta come rifiuto.
- **Lascia stare**: `rifiutaInvito()`. L'invito non torna; l'indice resta.
- **Indice**: "Luce col telefono: sì / no" → `impostaLuceTelefono(true|false)`,
  il "sì" dentro un clic. Visibile se `stato !== 'non-supportato'` e non c'è
  reduced motion.
- **Ricaricamento su iOS** con la luce accesa: il permesso va richiesto di
  nuovo dentro un gesto; lo facciamo in silenzio al primo tocco sulla carta.
- Reduced motion: niente invito, `attivaGyro()` non fa nulla.
- Annunci (copywriter): `ANNUNCI.tiltAttivo` / `ANNUNCI.tiltSpento` nella
  regione `aria-live` della pagina, dopo l'esito della Promise.

---

## 4. Magnetismo sobrio

Divieto del CD: niente bottoni magnetici, niente testo che segue il cursore.
Il magnete esiste **solo dove ha un senso fisico**, cioè dove la mano tocca
un oggetto, e non sposta mai testo.

| Dove | Effetto | Perché |
|---|---|---|
| **Leva del banco** | La maniglia si inclina verso il puntatore di al massimo 6 px lungo il binario (`magnete: 6` in `useHoldToConfirm`), e il magnete si spegne man mano che la leva scende (`--imp-mag-x × (1 − --imp-hold)`). | È una maniglia: la mano che ci si appoggia la sposta appena, prima di tirarla. |
| **Tre lavori di "Per chi"** | Nessuno spostamento (ux-architect 5.2). `useMagnete(ref, { onVicinanza })` dà la vicinanza 0..1: la sezione la somma alla pressione del pezzo (profilo `hover` del motion-designer, molla `morbida`). | Una mano sopra un cartoncino lo preme un poco. |
| **Strisce di "La carta"** | `.imp-ix-solleva` + `useMagnete(ref)`: il foglio si alza di 2 px, la sua costa (`.imp-costa`) resta sotto e se ne vede un filo in più. | Si sente lo spessore prima di sceglierla. |

Solo con `(hover: hover) and (pointer: fine)`. Con reduced motion: nessuno
spostamento, vicinanza di scatto. Variabili scritte sull'elemento:
`--imp-mag-x`, `--imp-mag-y` (px), `--imp-mag-t` (0..1). Il rettangolo si
misura all'ingresso e si rimisura solo se è cambiato lo scroll.

---

## 5. Micro-interazioni e anello di focus (`interaction.css`)

Principio: ogni stato è un gesto su carta e inchiostro. Niente glow, niente
ombre nere, niente colori nuovi, raggio 0 (salvo il manico della leva).

**Anello di focus** (tutto il sito, `.imp-root :focus-visible`): riga
d'inchiostro 3 px a 3 px di distanza, spigolo vivo, come il filo con cui si
cerchia una correzione sulla bozza. Il colore è l'inchiostro **della carta del
sito** (`--imp-sito-inchiostro`, risolto sulla radice): dentro un pezzo su
un'altra carta (Per chi, prova del banco) l'anello resta leggibile sulla carta
attorno. Varianti:
- `.imp-ix-anello-interno`: per gli elementi a vivo (strisce della carta),
  anello rientrato di 6 px nell'inchiostro di quella carta (`--imp-focus-colore`);
- titoli raggiunti con i salti (`tabindex="-1"`): distanza 8 px;
- `forced-colors`: `Highlight`.

**Classi da applicare** (le sezioni le aggiungono accanto alle proprie):

| Classe | Stati |
|---|---|
| `imp-ix-link` | sottolineatura `--imp-sottolineatura` → `-hover` al passaggio → × 1,4 premuto: l'inchiostro si allarga, il colore non cambia. |
| `imp-ix-premibile` | hover: solco interno tinto della carta; active: scende di 1 px nella carta (60 ms) con solco più profondo; disabilitato: `--imp-opacita-disabilitato`. |
| `imp-lamina imp-ix-premibile` | active: la sfumatura della lamina si rovescia (`--imp-lamina-sfumatura-premuta`) e compare `--imp-ombra-premuto`. Mai più luminosa. |
| `imp-ix-scelta` + `imp-ix-scelta__input` | radio/checkbox veri a copertura del foglio; hover: la costa inferiore da 1 a 2 px; scelta: bordo interno inchiostro 3 px (e il testo "scelta" lo scrive la sezione); focus: anello sul foglio. |
| `imp-ix-tocco` | area minima 44×44. |
| `imp-ix-solleva` | vedi §4. |
| `imp-ix-annuncio` | regione dei messaggi della leva, altezza riservata (nessun salto di layout). |

Touch: `-webkit-tap-highlight-color: transparent` solo dove c'è un `:active`
che lo sostituisce; `touch-action: manipulation` sui premibili.

---

## 6. La leva "tieni premuto per stampare" (`useHoldToConfirm.ts`)

### 6.1 Tempi (da `motion/choreography.ts`, `LEVA`)

- Pressione piena: **900 ms** (uguale con reduced motion: è un gesto, non
  un'animazione).
- Pressione breve: sotto **250 ms**.
- Finestra di conferma dopo una pressione breve: **6 s**.
- Risalita dopo un rilascio anticipato: molla `LEVA.mollaRisalita` (critica,
  nessun rimbalzo); con reduced motion, immediata.
- Discesa dopo la doppia pressione: 220 ms (la pressa si vede scendere anche
  quando non si è tenuto premuto).

### 6.2 Cosa succede

| Gesto | Esito | Stato | Annuncio |
|---|---|---|---|
| Tieni premuto (mouse, dito, penna, Spazio, Invio) fino a 900 ms | stampa | `tenendo` → `completo`, `onCompleta('tenuta')` | quello dello stato di invio (sezione) |
| Pressione breve (< 250 ms) | arma | `armato` per 6 s | `testi.armato` |
| Seconda pressione breve entro 6 s | stampa | `completo`, `onCompleta('doppia')` | come sopra |
| Rilascio tra 250 e 900 ms | la carta risale, nulla parte | `annullato` | `testi.annullato`, non punitivo |
| Dito che esce dalla leva tenendo | come il rilascio anticipato (se era una pressione breve, in silenzio) | `annullato` | `testi.annullato` |
| Scroll che parte dalla leva (`pointercancel`), perdita di focus, scheda nascosta | la carta risale in silenzio | `pronto` (o `armato` se lo era) | nessuno |
| Clic senza gesto (lettori di schermo, controllo vocale, switch) | come una pressione breve: arma, poi conferma | `armato` / `completo` | `testi.armato` |
| `puoPartire()` falso (manca il contatto) | la pressa non scende | `bloccato`, `onBloccato()` | `testi.bloccato` (facoltativo: il banco sposta il focus al campo e mostra `BANCO.contatto.vuoto` sotto) |

Dettagli che contano:
- **Tastiera**: `keydown` di Spazio/Invio con `preventDefault` (niente clic
  nativo), ripetizione automatica ignorata (`e.repeat`), si conta dal primo
  `keydown` al `keyup`.
- **Dito**: la cattura implicita del puntatore viene rilasciata al
  `pointerdown`, altrimenti "sposta il dito fuori per annullare" non
  funzionerebbe. `touch-action: pan-y` sulla leva: lo scroll che parte da lì
  resta possibile e annulla (la leva non si attiva mai con lo scroll).
  `onContextMenu` bloccato e `-webkit-touch-callout: none`: nessun menu sulla
  pressione lunga.
- **Clic nativo gemello**: dopo un gesto gestito, il clic che il browser
  manda entro 500 ms viene ignorato. Un clic che arriva da solo è quello dei
  lettori di schermo e vale come pressione breve.
- **Ripartenza**: se si ripreme mentre la carta sta risalendo, la pressa
  riparte da dov'è, senza scatti.
- **Annunci ripetuti**: se lo stesso testo va annunciato due volte di fila,
  un NBSP in coda lo rende nuovo per `aria-live`.
- `aria-disabled` (non `disabled`) quando `disabilitato` o `completo`: il
  bottone resta nel percorso di tabulazione e il focus non si perde.

### 6.3 Uso nel banco (per section-builder-banco)

```tsx
const leva = useHoldToConfirm({
  testi: { armato: ANNUNCI.confermaDiNuovo, annullato: BANCO.leva.presto },
  disabilitato: invio === 'sending' || invio === 'sent',
  puoPartire: () => contattoValido(),
  onBloccato: () => campoContatto.current?.focus(),
  onInizio: () => impostaInvio('holding'),
  onAnnulla: () => impostaInvio('idle'),
  onProgress: (p) => registry.setPressione(idProva, pressioneLeva(p, BANCO_RIPOSO)),
  onCompleta: (via) => { track('demo_prenotazione', { concept: 10, prodotto, tecnica, tiratura, via }); void invia(); },
  magnete: 6,
});

<p id="leva-istruzione">{BANCO.leva.istruzione}</p>
<button className="imp-banco__leva imp-ix-leva" {...leva.buttonProps}
        aria-describedby="leva-istruzione leva-totale">
  <span className="imp-ix-leva__binario" aria-hidden="true">
    <span className="imp-ix-leva__corsa">
      <span className="imp-ix-leva__carrello"><span className="imp-ix-leva__maniglia" /></span>
    </span>
  </span>
  <span className="imp-ix-leva__testo">
    {leva.stato === 'armato' ? BANCO.leva.confermaDiNuovo : BANCO.leva.istruzione}
  </span>
</button>
<p className="imp-ix-annuncio" aria-live="polite">{leva.annuncio}</p>
```

- Il nome accessibile del bottone resta "Tieni premuto per stampare"; quando è
  armata l'etichetta visibile cambia e l'annuncio lo dice.
- `pressioneLeva(p, riposo)` è del motion-designer: il progress è lineare nel
  tempo, la curva `leva` la applica lui. Al completamento il motion fa l'`urto`.
- Dopo un invio fallito: `leva.reset()` (la carta risale, stato `pronto`),
  messaggio `BANCO.fallito` e focus sul messaggio.
- `--imp-hold` (0..1) è già scritto sul bottone ogni frame: la maniglia scorre
  da sola con il CSS di `interaction.css`.

---

## 7. Onda di cambio carta (`paperWave.ts`)

Tempi, curva (`assorbe`), bordo bagnato (12 → 56 px) e istante di scambio
(45%) sono del motion-designer (`CARTA.onda`, `statoOnda`). Il meccanismo:

1. Scelta di una carta (sezione "La carta", banco, indice):
   `cambiaCarta('cotone', origineDaEvento(e))`. Da tastiera (clic con
   `detail === 0`) l'onda parte dal centro della striscia.
2. `store.cartaWave = { x, y, from, to, t0 }`. Col WebGL acceso lo shader
   disegna l'onda da `getPaperWave(performance.now())`
   (`x, y, raggio, bordo, invertita, from, to`, px CSS: moltiplicare per il DPR).
3. Col WebGL non acceso, un velo `.imp-ix-onda` al livello del canvas (sotto
   l'inchiostro, mai sopra il testo) mostra la carta nuova dentro un cerchio
   dal bordo sfumato (`mask-image: radial-gradient`).
4. Al 45% `scegliCarta(to)`: la radice cambia carta, l'inchiostro ereditato
   cambia colore in 240 ms, il velo si **inverte** e tiene la carta vecchia
   fuori dal cerchio, che continua a crescere. Così ogni punto dello schermo
   cambia colore una volta sola: nessun lampo, e testo e carta nuovi arrivano
   quasi insieme.
5. A 700 ms `cartaWave = null`, il velo si toglie, la Promise si risolve.

Un nuovo cambio prima della fine chiude il precedente
(`concludiPaperWave()`). **Reduced motion**: cambio immediato nello store; il
velo con la carta vecchia svanisce in 200 ms di dissolvenza, senza cerchio.
L'annuncio `ANNUNCI.carta(carta)` lo fa la sezione che ha chiamato
`cambiaCarta`, dopo la Promise; il focus non si sposta, la pagina non scorre.

---

## 8. "Per chi" su mobile (`useSwipeDeck.ts`)

- Attivo sotto i 1024 px (`MAZZO_MEDIA`) con almeno 2 pezzi; sopra, i pezzi
  sono sparsi sul bancone e nomi e frecce sono nascosti dal CSS.
- Lo swipe è lo scroll orizzontale nativo con `scroll-snap-type: x mandatory`
  e `scroll-snap-stop: always` (un pezzo per volta, inerzia del sistema).
  Nessun trascinamento simulato, nessun listener di scroll: il pezzo in vista
  si rileva con IntersectionObserver (radice = la fila, soglia 55%).
- Nomi-bottone con `aria-controls` = id della fila e `aria-current="true"` sul
  pezzo in vista (sottolineato e peso 600, non solo un colore). Frecce ‹ › da
  44×44 con `aria-disabled` ai bordi.
- Tastiera: il focus su un link di un pezzo fa scorrere la fila a quel pezzo;
  frecce sinistra/destra dentro la fila passano al pezzo accanto e portano il
  focus al suo primo elemento attivabile.
- Reduced motion: `behavior: 'auto'` (salto, niente scorrimento morbido).

Uso (section-builder-per-chi):

```tsx
const mazzo = useSwipeDeck({ count: 3, onCambio: (i) => annuncia(ANNUNCI.lavoroInVista(nomi[i], i + 1)) });

<div className="imp-perchi__fila imp-ix-mazzo" {...mazzo.filaProps}>
  {PER_CHI.pezzi.map((p, i) => (
    <article key={p.id} className="imp-perchi__pezzo imp-ix-mazzo__pezzo" {...mazzo.pezzoProps(i)}>
      <div className="imp-perchi__foglio" style={{ rotate: … }}>…</div>
    </article>
  ))}
</div>
{mazzo.attivo && (
  <nav className="imp-ix-mazzo-nav" aria-label="…">
    <button className="imp-ix-mazzo-nav__freccia imp-ix-premibile" aria-label="…" {...mazzo.precedenteProps}>‹</button>
    {PER_CHI.pezzi.map((p, i) => (
      <button key={p.id} className="imp-ix-mazzo-nav__nome" {...mazzo.nomeProps(i)}>…</button>
    ))}
    <button className="imp-ix-mazzo-nav__freccia imp-ix-premibile" aria-label="…" {...mazzo.successivoProps}>›</button>
  </nav>
)}
```

Il wrapper `imp-ix-mazzo__pezzo` **non** è ruotato (la rotazione va
sull'elemento interno), così snap e misure del registro restano esatti
(tech-architect §7.2). Larghezza pezzo, passo e margine sono variabili
(`--imp-ix-mazzo-pezzo` 280 px, `--imp-ix-mazzo-passo` 12 px,
`--imp-ix-mazzo-margine` 20 px) che la sezione può ridefinire.

Nota: l'ux-architect chiede i nomi non correnti "in inchiostro al 70%". Non lo
faccio: inchiostro al 70% su Citrino e Cipria rischia di scendere sotto 4,5:1.
Il corrente si distingue con sottolineatura 2 px e peso 600, gli altri
restano a inchiostro pieno.

---

## 9. Dial "Direzione della luce" (hero desktop e lastra del banco)

```tsx
const dial = useLuceDial(); // etichetta LUCE.aria, valore a parole con LUCE.valore + gradi
<div className="imp-ix-dial" {...dial.contenitoreProps}>
  <span className="imp-ix-dial__icona" aria-hidden="true" />
  <input className="imp-ix-dial__input" {...dial.inputProps} />
</div>
```

- Un `input type=range` vero (0-345, passo 15) a copertura dell'icona, con
  opacità 0: frecce, Pagina su/giù, Home/Fine, lettori di schermo e
  trascinamento funzionano come in ogni slider. Anello di focus sul contenitore.
- `aria-valuetext`: "luce da sinistra in alto, 135 gradi" (le parole sono di
  `LUCE.valore`, i gradi li aggiungo io perché due passi dello stesso ottavo si
  distinguano all'ascolto).
- L'icona è un semicerchio d'inchiostro: la metà in ombra sta dal lato opposto
  alla luce e ruota con `--imp-ix-dial-az`.
- Il valore segue anche puntatore, dito e giroscopio (a passi di 15°): il dial
  dice sempre dove sta la luce.
- La `figure` della prova non riceve focus: il controllo della luce è uno solo.

---

## 10. Checklist di accessibilità (per l'accessibility-auditor)

- [ ] Nessun cursore custom; `cursor: grab/grabbing` solo sulla leva.
- [ ] Anello di focus visibile su ogni controllo, su tutte e 4 le carte, anche
      dentro i pezzi su un'altra carta; `forced-colors` → `Highlight`.
- [ ] Leva: tenuta con mouse, dito, Spazio, Invio; doppia pressione; clic del
      lettore di schermo; rilascio anticipato non invia; uscita col dito
      annulla; scroll che parte dalla leva annulla; annunci in `aria-live`.
- [ ] Dial raggiungibile da tastiera, valore a parole, nessun secondo
      controllo della luce.
- [ ] Giroscopio mai all'avvio; invito una volta; rifiuto definitivo.
- [ ] Onda: nessun lampo, nessun punto che cambia colore più di una volta,
      focus fermo, pagina ferma, annuncio dopo il cambio.
- [ ] Mazzo: nomi-bottone e frecce da 44×44, `aria-current`, tastiera.
- [ ] Reduced motion (preferenza e `data-motion="reduced"`): luce ferma,
      nessun magnete, nessun `:active` che si sposta, cambio carta in 200 ms
      di dissolvenza, mazzo senza scorrimento morbido.
- [ ] Trascinare il dito sulla carta non blocca lo scroll e non impedisce di
      selezionare il testo.

---

## 11. Contratti richiesti allo scaffold

Firme TypeScript esatte che i miei file importano. Sono coerenti con
tech-architect §6; le uniche aggiunte sono segnate con **(aggiunta)**.

### 11.1 `core/ticker.ts`

**Unico contratto per tutti: quello del motion-designer, docs/motion-designer.md
§4.1** (fasi `read | update | write | render`, `TickFn = (dt, now) => boolean |
void`, `add(fn, fase?)`, `wake()`, `running`, dt in secondi limitato a
[0, 0.05], `now` = timestamp di rAF sulla base di `performance.now()`,
aggiunta e rimozione sicure durante il frame, arresto a riposo e con la
scheda nascosta). I miei file usano solo `ticker.add(fn, 'update' | 'write')`
e `ticker.wake()`, e reggono `now` leggermente precedente ai
`performance.now()` letti negli handler (differenze negative limitate a 0).

### 11.2 `state/runtime.ts`

```ts
/** (aggiunta) 'dial' alla lista di tech-architect §6.2. */
export type LuceFonte = 'idle' | 'pointer' | 'touch' | 'gyro' | 'dial';

export interface Runtime {
  scrollY: number;
  /** Aggiornato dallo scaffold su resize: px CSS del viewport. */
  viewport: { w: number; h: number; dpr: number };
  pointer: { x: number; y: number; active: boolean; tipo: 'mouse' | 'touch' | 'pen' };
  light: {
    azimuth: number;
    elevation: number;
    targetAzimuth: number;
    targetElevation: number;
    fonte: LuceFonte;
  };
  dirty: boolean;
  markDirty(): void;
}

export const runtime: Runtime;
```

`runtime.pointer` e `runtime.light` li scrive solo `interaction/light.ts`
(anche il lerp, dentro il ticker in fase `update`). Valori iniziali della luce:
135 / 22, fonte `idle`.

### 11.3 `state/store.ts`

```ts
export type Carta = 'citrino' | 'cotone' | 'cipria' | 'grafite';

/** Come in tech-architect §6.1, con il tipo nominato. */
export interface CartaWave { x: number; y: number; from: Carta; to: Carta; t0: number }

export interface ImprontaState {
  carta: Carta;
  cartaWave: CartaWave | null;
  gl: 'pending' | 'on' | 'off';
  reducedMotion: boolean;
  // …più tutti gli altri campi di tech-architect §6.1
}

export const store: {
  get(): ImprontaState;
  set(patch: Partial<ImprontaState> | ((s: ImprontaState) => Partial<ImprontaState>)): void;
  subscribe(fn: () => void): () => void;
};

export function useImpronta<T>(selector: (s: ImprontaState) => T, isEqual?: (a: T, b: T) => boolean): T;

export function scegliCarta(carta: Carta, origine?: { x: number; y: number }): void;
```

Semantica richiesta:
- `store.set` e `scegliCarta` sono sincroni (dopo la chiamata `store.get()`
  riflette il cambio) e notificano i `subscribe` in modo sincrono.
- `scegliCarta` **non anima**: salva (`localStorage 'impronta:carta'`) e
  cambia `carta`. L'animazione è di `paperWave.ts`; `origine`, se passata, può
  servire solo all'analytics. Le sezioni cambiano carta con
  `cambiaCarta()` di `paperWave.ts`, non con `scegliCarta` diretto.
- `Carta` deve coincidere con quella di `content/prezzi.ts` (già uguale).

### 11.4 `@/lib/analytics`

Non lo importo più. Firma del sito (docs/integrazione-sito.md):
`track(event: TrackEvent, params?)`, con `apri_concept` e `demo_prenotazione`
per i concept; l'esempio della leva in §6.3 usa `demo_prenotazione`.

### 11.4 bis Zona del "Torna in Ciceri Lab"

`ConceptBackButton` del sito è fisso in alto a sinistra (desktop) e in basso a
sinistra sotto i 640 px. Nessun mio elemento è fisso lì: l'unico elemento
fisso è il velo dell'onda (a tutto schermo, sotto il contenuto,
`pointer-events: none`). L'invito "luce col telefono" sta nel flusso
dell'hero, sotto il bottone "Prova la tua", non fisso: il section-builder-hero
non deve metterlo in basso a sinistra né renderlo `position: fixed`.

### 11.5 `Impronta.tsx`

- `import './interaction/interaction.css'` dopo `tokens.css` e
  `relief-fallback.css`.
- `useLuce(rootRef)` (da `interaction/light.ts`) dopo che le sezioni sono
  montate; l'hero deve avere `id="inizio"` (ux-architect).
- Allo smontaggio: `concludiPaperWave()` (da `interaction/paperWave.ts`).
- Attributi su `.imp-root` come da §5: `data-carta`, `data-gl`, `data-motion`.
- Il contenuto (`main`, testata, segnapagina) deve stare a `z-index`
  `--imp-z-contenuto` (1) con `position: relative`, così il velo dell'onda
  (livello del canvas) resta sotto l'inchiostro.

---

## 12. Richieste ad altri agent

- **art-director**: fatto quanto chiesto in art-director.md: `vettoreLuce()`
  per `--imp-luce-x/y`; focus con `--imp-focus-spessore/-distanza`; hover
  della lamina con `--imp-lamina-sfumatura-premuta`; active con
  `--imp-ombra-premuto` + `translateY(1px)`; scelta con `--imp-bordo-scelto`;
  nessun cambio di colore al passaggio. Unica differenza voluta: il colore
  dell'anello è `--imp-sito-inchiostro` (non `--imp-focus-colore`) perché
  dentro un pezzo su un'altra carta l'anello cade sulla carta del sito;
  `.imp-ix-anello-interno` usa `--imp-focus-colore`. La funzione `limitaLuce`
  citata nel tuo doc non esiste in `tokens.ts`: puntatore, dito e giroscopio
  sono già limitati a 85-185°, il dial no (scelta esplicita). `--imp-z-onda: 20` in `tokens.css` metterebbe l'onda
  **sopra** il testo. Il velo usa `--imp-z-canvas` (0): va bene lasciare
  `--imp-z-onda` inutilizzato o allinearlo a 0. Ho usato i tuoi token
  (`--imp-focus-*`, `--imp-sito-inchiostro`, `--imp-sottolineatura*`,
  `--imp-lamina-sfumatura*`, `--imp-ombra-premuto`, `--imp-lamina-bordo`,
  `--imp-leva-h`, `--imp-raggio-leva`, `--imp-opacita-disabilitato`); i default
  di `--imp-luce-x/-y` restano solo in `tokens.css`.
- **motion-designer**: lo scambio al 45% con velo invertito e bordo sfumato
  (`statoOnda`) è già in `paperWave.ts`; la transizione dell'inchiostro usa
  `--imp-dur-inchiostro`. Uso `seguiAngoloDt`, `seguiDt`, `Molla`,
  `LEVA.durata`, `LEVA.mollaRisalita`, `CARTA.onda`, `statoOnda`. La
  variabile `--imp-hold` sul bottone è il progress lineare; la pressione della
  prova la calcoli tu con `pressioneLeva`.
- **copywriter**: la convenzione dei gradi coincide con la tua. Uso
  `LUCE.aria`, `LUCE.valore`, `HERO.tilt.*`, `INDICE.luceTelefono/luceSi/luceNo`,
  `BANCO.leva.*`, `ANNUNCI.confermaDiNuovo/presto/tiltAttivo/tiltSpento/carta`.
  Nessun testo scritto nei miei file.
- **shader-engineer**: onda da `getPaperWave(now)`; luce da `runtime.light`.
- **section-builder** (hero, per chi, carta, banco, indice nella testata):
  classi e hook descritti nelle sezioni 4-9; le superfici di carta vuota
  dell'hero e delle sezioni vanno marcate `data-imp-luce`.

---

## Giro 2 (LOOP, correzioni dai QA)

| Voce | Da | Correzione | Verifica |
|---|---|---|---|
| **A4** lampeggio (WCAG 2.3.1) | accessibility-auditor | `paperWave.ts`: al massimo un cambio di carta ogni **450 ms** (`INTERVALLO_MINIMO_MS`). Le richieste nel frattempo vanno in coda e resta solo l'ultima; tutte le Promise in attesa si risolvono quando parte e finisce quella. Vale anche con reduced motion. Nessuna modifica richiesta alle sezioni. | Playwright, 1440, `?gl=0`: ArrowRight tenuta 3 s (ripetizione ~30 Hz) sui radio carta del banco → 5 cambi di `data-carta`, **1,67/s**, intervallo minimo 550 ms. Sui radio di `#carta` le frecce non scelgono (M4 del section-builder-carta), 0 cambi. |
| **P1** luce a 30 Hz su `.imp-root` | performance-auditor | `light.ts`: `--imp-luce-x/y` non si scrivono più sulla radice. Si scrivono solo sui consumatori (`.imp-secco, .imp-inchiostro, .imp-caldo, .imp-segno-caldo, .imp-colophon__marchio`) **in vista** (IntersectionObserver, margine 25%; elenco riletto con MutationObserver, attesa 250 ms), solo se il valore arrotondato cambia, al massimo a 30 Hz. Un consumatore che entra in vista riceve subito il valore corrente. Nel fallback con puntatore grossolano l'arco non parte. Soglia di quiete da 0,02° a 0,15° (P8). | Playwright `?gl=0`, CPU 4×: 0 scritture di stile su `.imp-root` (prima 36/s). Mobile 390, 3 s nell'hero: 0 long task, 0 scritture della luce. Desktop, 3 s d'arco: 0 long task (~100 scritture/s su 3-4 foglie). Scroll 6 s: lo scroll avanza 5095 px a 390 (prima 365 px). Restano 13 long task (max 333 ms): dal trace sono ricalcoli di stile dovuti a `--imp-press` e alle variabili delle Tecniche (`.imp-carta__secco` 258 scritture, `.imp-tecniche__parola` 181, `.imp-tecniche__pin` 131 in 5 s), non a `light.ts` (5 ms di script in 5 s). Da girare a motion-designer e section-builder-tecniche. |
| **M3** dial che cambia da solo, arco non fermabile | accessibility-auditor | L'arco fa un solo giro (40 s) e si ferma per sempre al primo input; `focusin` su qualunque controllo e ogni `keydown` contano come input. Col fuoco sul dial il valore non cambia più da solo; su mobile l'arco finisce dopo 40 s, al primo tocco o non parte affatto (fallback). | Logica verificata con tsc/eslint; nessun timer ricorrente resta attivo dopo il giro. |
| **B2** leva e frame lenti | cross-browser-tester | `useHoldToConfirm.termina()`: se `(ora - t0) / durata >= 1` completa come "tenuta" anche se il ticker non ha ancora visto il 100% (tranne per scroll, perdita di fuoco o scheda nascosta). | tsc/eslint. |
| **Giuria §5** onda con fotogramma memorabile | awwwards-jury | Il velo ha due strati: `__foglio` (la carta, solo senza WebGL) e **`__costa`**: il bordo del foglio nuovo avanza con la sua costa tinta (`--imp-carta-costa`, larga 2 × `--imp-spessore`: Cotone 600 g ha la costa più alta), un filo di luce sul labbro e un'ombra corta e tinta sul foglio vecchio. La costa c'è anche col WebGL acceso: il velo sta al livello del canvas, sotto l'inchiostro. Bordo della carta netto (lo fa la costa). Reduced motion: niente costa, solo dissolvenza. | CSS validato; sempre sotto 2,5 cambi/s grazie ad A4. |

Non fatto in questo giro: **O5** (`:has()` senza ripiego, bassa). Nei browser
senza `:has()` lo stato "scelta" resta detto dal testo della sezione.

Typecheck: `npm run typecheck` dà un solo errore, in
`sections/Carta/Carta.tsx:282`, che non è un mio file; i miei sono puliti.
`eslint` su `interaction/` è pulito. Nessun commit.
