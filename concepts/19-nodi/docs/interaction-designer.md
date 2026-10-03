# Interaction designer · Concept 19 · NODI

Ondata 2. Rotta `/concept-19`. Seguiti `design-taste-frontend` (4.5, 4.6,
5.D, 6.A, 6.B) e `full-output-enforcement`: file completi, niente segnaposto.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `creative-director.md` (tutto), `ux-architect.md`
(§2, §3, §5.0, §5.1, §5.4, §6, §7, §9, §10), `tech-architect.md` (tutto),
`brand-strategist.md` (tono, piano del suono), `trend-researcher.md`, il doc e
il codice dell'interaction-designer del pilota (`concepts/10-torchio`, solo
come formato). File già scritti in parallelo e usati: `motion/easing.ts`,
`motion/percorso.ts` (motion-designer), `styles/tokens.css` e `tokens.ts`
(art-director), `content/listino.ts` (copywriter); arrivati durante il
lavoro e allineati: `motion/molle.ts` e `docs/motion-designer.md`
(inseguitore del cursore in posizione di scala), `content/testi.ts`
(`valuetextRighello`, `VOCE.piano.valuetextX/Y`). Il codice dello scaffold
non esiste ancora: le firme che importo sono quelle del tech-architect e
stanno al §9.

---

## 0. File consegnati

Tutti in `src/pages/concepts/nodi/`.

| File | Cosa fa |
|---|---|
| `interaction/useRighello.ts` | L'interazione firma "Accordare la tavola": trascinamento del cursore e clic sul binario che **scrivono lo scroll**, magnetismo al rilascio, tastiera da slider, `aria-valuenow`/`valuetext` che non seguono lo scroll a 60 Hz, transform del cursore e numero scritti dal ticker. |
| `interaction/usePianoVoce.ts` | La foglia della voce sul piano del suono: trascinamento, tocco sul piano, frecce, due range accessibili, `runtime.voce` subito e store una volta per frame, `onAssestata` per l'annuncio, metodo usato per `track`. |
| `interaction/useMenuMobile.ts` | Menu a comparsa dal marchio: disclosure non modale, fuoco alla prima voce, Esc, clic fuori, Tab oltre l'ultima voce, scelta di una voce. |
| `interaction/comandi.ts` | `vaiAllaFrequenza(hz, liscio)`, `vaiAlModo(modo)` (scorciatoie), `rimettiFoglie()`. |
| `interaction/suono.ts` | Lato pagina del suono (chunk del concept, piccolo): `audioDisponibile`, sblocco del contesto **dentro il gesto**, `alternaSuono`, `sentiLaVoce`, `fermaLaNota`, `chiudiSuono`. Carica `audio/` solo al primo tocco. |
| `interaction/interaction.css` | Anello di focus, selezione, stati di link, bottone ebano, bottoni di testo e interruttore, radio come parole sottolineate, righello, piano, foglia, range che compaiono al fuoco, pannello del menu, reduced motion. |
| `audio/index.ts` | Ingresso del chunk lazy. |
| `audio/contesto.ts` | Il contesto unico consegnato da `suono.ts`, uscita comune, conto di chi suona, sospensione dopo 2 s di silenzio, chiusura. |
| `audio/altoparlante.ts` | La sinusoide alla frequenza del righello (guadagno ≤ 0,04, −50 % fuori risonanza, 180 ms di attacco e rilascio, spegnimenti automatici). |
| `audio/notaEsempio.ts` | La nota d'esempio di 1,8 s (La 440 / Do 131 / Do 65) con filtro dal punto scuro↔brillante e attacco dal punto morbido↔pronto. |

Verifiche (§10): `tsc` strict con le opzioni del concept e `eslint` con le
regole del sito verdi su tutti i file, con stub dello scaffold scritti
esattamente come al §9; build Vite: chunk audio **2,1 KB gz** (budget 4), CSS
1,7 KB gz; prova in Chromium headless (Playwright) di righello, magnetismo,
tastiera, coda, piano, range, menu e audio, **zero errori in console**;
screenshot degli stati con i token veri, guardati.

---

## 1. Cursore custom e preloader: niente

Il prompt dell'ondata chiede "cursore custom, hover magnetici, preloader". Il
creative-director li esclude (§4.7: "niente cursore custom, niente testo
magnetico", "niente particelle che seguono il cursore"; §4.2: "nessun
preloader a percentuale") e la skill li chiama AI tell. Rispetto il divieto.

- **Il cursore è quello del sistema**, e dice cosa si può fare: mano sui
  link e sui bottoni, presa (`grab` / `grabbing`) sul cursore del righello e
  sulla foglia, freccia altrove. Niente cerchi che seguono il mouse.
- **Il "magnetismo" esiste una volta sola, ed è fisico**: al rilascio del
  cursore entro ±6 Hz da un picco la pagina scivola al pianerottolo, come
  il liutaio che lascia la manopola del generatore sulla risonanza. Nessun
  bottone si sposta verso il puntatore.
- **Nessun preloader**: la pagina è leggibile dal primo frame (titolo,
  bottone, righello a 0 Hz, poster della tavola). L'unica attesa è la
  caduta delle foglie, che è del motion-designer e mostra il mestiere.

---

## 2. Interazione firma: "Accordare la tavola" (`useRighello.ts`)

### 2.1 Una sola verità

Il righello non ha uno stato suo. Il gesto salva solo
`runtime.righello.hzPuntatore`; nella fase `write` del ticker l'hook fa **un
solo `scrollTo` per frame** verso `scrollDaHz(hz)`; dallo scroll
`risonanza/frequenza.ts` ricava la frequenza al frame dopo. Scroll e
trascinamento quindi non litigano mai (CD §4.3, ux §2.1, tech §0.5).

Valori del righello: **0 = spento** e 60-420 Hz interi. Nel trascinamento il
valore è continuo (frazioni di Hz), così lo scroll è fluido.

### 2.2 Il gesto

| Dove | Mouse / penna | Dito |
|---|---|---|
| Cursore (`touch-action: none`) | si prende dove lo si tocca (nessun salto); trascina oltre 3 px | trascina oltre 8 px |
| Binario orizzontale (`pan-y`) | il cursore va subito sotto il puntatore e si continua a trascinare (come un range) | scorrimento verticale = pagina; di lato oltre 8 px = trascina; tocco (≤ 600 ms, fermo) = il cursore va lì |
| Binario verticale (`manipulation`) | come sopra | solo il tocco; lo scorrimento resta della pagina |

- Pointer capture sull'elemento toccato; misura della scala **una volta al
  `pointerdown`** (getBoundingClientRect nell'handler), lunghezza tenuta
  aggiornata da `ResizeObserver`. Nessuna lettura di layout nel ticker.
- Sotto i 60 Hz c'è il fermo "spento" (`U_SPENTO` di `motion/percorso.ts`,
  circa 40 px sotto il 60 a 1440, ux §5.0): portare il cursore lì = spento =
  pagina in cima.
- `pointercancel` / `lostpointercapture` chiudono il gesto senza magnetismo.
  Un clic sul cursore senza muoverlo non cambia niente (così nella coda non
  si torna in cima per sbaglio).
- Al `pointerdown` il cursore prende il fuoco (`preventScroll`): dopo il
  gesto le frecce funzionano subito.
- **Chi muove il cursore**: durante il trascinamento sta esattamente sotto
  il dito (posizione del puntatore, senza il frame di ritardo dello
  scroll); fuori dal trascinamento segue l'inseguitore del motion-designer
  (`CursoreRighello` di `motion/molle.ts`, copiato dallo scaffold in
  `runtime.righello.u` e `runtime.righello.cursore`). Il `transform` lo
  scrive solo `useRighello`, in px misurati.

### 2.3 Magnetismo (solo al rilascio)

Al `pointerup`, se `magnete(hz, runtime.hzModo5)` restituisce un picco (92,
168 o la voce, entro ±6 Hz) la pagina va al pianerottolo con scroll liscio
(istantaneo con reduced motion). Altrimenti uno scroll esatto all'ultimo
valore del dito. Mai durante il trascinamento, mai con la tastiera (ux §7.3).
Provato: rilascio a 163,4 Hz → la pagina arriva al pianerottolo dei 168.

### 2.4 Tastiera (`role="slider"`, ux §7.3)

| Tasto | Effetto |
|---|---|
| Freccia su / destra | +1 Hz (da 0 va a 60) |
| Freccia giù / sinistra | −1 Hz (da 60 va a 0) |
| Pagina su / giù | ±10 Hz (da 0 su va a 60; giù non scende sotto 60, da 60 va a 0) |
| Inizio | spento: pagina in cima |
| Fine | 420 Hz |
| Qualsiasi freccia o Pagina nella **coda** (riparazioni in giù) | 420 Hz: si torna alla prova; il builder annuncia con `onRitornoAllaProva` |

`preventDefault` sui tasti gestiti (la pagina non scorre due volte). Tasti
ravvicinati (< 600 ms) partono dall'ultimo valore chiesto, non dallo scroll
(che arriva al frame dopo): la raffica di frecce non perde passi.

### 2.5 ARIA

- `aria-valuemin` **0** (non 60 come nel tipo del tech-architect §7.1: lo
  spento è un valore vero, ux §7.3), `aria-valuemax` 420, `aria-orientation`
  dall'opzione.
- `aria-valuenow` e `aria-valuetext` cambiano a ogni tasto, al rilascio e
  quando la frequenza resta ferma 400 ms (pianerottoli, fine di uno scroll):
  mai 60 volte al secondo. Il numero **visibile** lo scrive il ticker.
- Il testo lo dà il copywriter tramite l'opzione `valuetext(stato)` con
  `{ hz: number | null, modo: Modo | null, inCoda: boolean }`, da passare a
  `valuetextRighello(hz, modo, { coda: inCoda, tuaVoce })` di
  `content/testi.ts`; `tuaVoce` lo calcola il builder (`richiesta?.hz === hz`).

### 2.6 Contratto per il section-builder-righello

```tsx
const r = useRighello({
  orientamento: largo ? 'verticale' : 'orizzontale',
  valuetext: ({ hz, modo, inCoda }) =>
    valuetextRighello(hz, modo, { coda: inCoda, tuaVoce: richiesta !== null && richiesta.hz === hz }),
  onRitornoAllaProva: () => annuncia(TAVOLA.tornaAllaProva(420)),
  disabilitato: !montato,
});

<div ref={r.refScala} {...r.propsScala} className="nod-righello__scala nod-ix-scala">
  {/* tacche, cifre, segni "trovato" e "la tua voce": posizione = uDaHz(hz) × 100 % */}
  <div ref={r.refCursore} {...r.propsCursore} aria-label={PROVA.cursoreAria}
       className="nod-righello__cursore nod-ix-cursore">
    <span className="nod-righello__segno nod-ix-cursore__segno" aria-hidden="true" />
    <span className="nod-righello__valore" aria-hidden="true">
      <span ref={r.refValore}>0</span> Hz
    </span>
  </div>
</div>
```

- `refScala` è **esattamente il tratto 60 → 420 Hz** (niente padding): la
  sua altezza (verticale) o larghezza (orizzontale) è la scala.
- Il cursore è ancorato in CSS al punto dei 60 Hz (verticale: `bottom: 0`
  centrato sul binario con `translateY(50%)` sul figlio, non sul cursore;
  orizzontale: `left: 0`). L'hook scrive `transform: translate3d(…)` sul
  cursore: **il builder non deve mettere un transform suo sul cursore**
  (lo metta su un figlio).
- `refValore` riceve solo il numero (0 a spento): "Hz" e "spento" sono testo
  del builder (`PROVA.unita`, `PROVA.spento`).
- `--nod-cursore` del motion-designer (`useMotionVars`) **non** va usata per
  il `transform` del cursore (lo scrive l'hook): il builder può usarla solo
  per altro (per esempio tenere il valore dentro il righello vicino ai capi).
- Tacche, cifre e segni usano `uDaHz` / `U_SPENTO` di `motion/percorso.ts`
  (stessa formula del cursore).
- Il valore restituito `trascinando` serve alla classe
  `nod-righello__cursore--trascinato` se il builder ne vuole una; lo stato è
  già in `data-trascinando`.

### 2.7 Scorciatoie e "Rimetti le foglie" (`comandi.ts`)

- `vaiAlModo(1 | 2 | 5)`: scroll liscio all'inizio del pianerottolo (il 5
  alla frequenza della voce, `runtime.hzModo5`); istantaneo con reduced
  motion; il fuoco resta sul bottone (ux §2.7).
- `rimettiFoglie()`: `runtime.foglie.comando = 'sparpaglia'`, `markDirty`,
  `wake`. L'annuncio "Foglie rimesse sulla tavola." è del builder.
- `vaiAllaFrequenza(hz, liscio)`: la usa tutto quello che porta a una
  frequenza (è il `vaiAFrequenza(f)` chiesto dall'ux, §Richieste). Ai due
  capi (60 e 420) mira un pixel dentro la salita, perché lo scroll a pixel
  interi può cadere nel riposo o nella coda spenta (vedi Richieste al
  motion-designer).

---

## 3. Il piano del suono (`usePianoVoce.ts`)

### 3.1 Il gesto

- Punto `(x, y)` in 0..1: x scuro → brillante, y morbido (in basso) →
  pronto (in alto). Il centro è "equilibrata" (zona del 18 %, selettore
  dello store).
- **Foglia** (`touch-action: none`): si prende dove la si tocca, si
  trascina con pointer capture (soglia 2 px mouse, 4 px dito). Solo mentre
  la si tiene lo scroll è bloccato (CD §4.9).
- **Piano** (`touch-action: pan-y`): con mouse e penna la foglia va subito
  sotto il puntatore e si continua a trascinare; col dito solo un tocco
  (≤ 10 px, ≤ 600 ms) la porta lì, uno scorrimento resta della pagina.
- Durante il gesto: `runtime.voce` subito (la tavola rifà l'anello), la
  foglia si sposta nella fase `write`, `impostaVoce` una volta per frame
  (frase della zona, righello, range). Se la rotella scorre la pagina
  durante il trascinamento, il calcolo compensa lo scroll (nessun salto).
- **Trascinare non suona mai** (CD §4.4).

### 3.2 Tastiera e range

- Sulla foglia (`role="application"`, ux §7.8): frecce = 5 % sulla griglia
  di 21 posizioni, Maiusc+frecce = 25 %, Inizio = centro.
- Due `input type="range"` (0-100, passo 5) "Da scuro a brillante" e "Da
  morbido a pronto", con `aria-valuetext` dalle funzioni del copywriter
  (`VOCE.piano.valuetextX/Y`, che ricevono il valore 0-100 del range). Visivamente nascosti finché uno dei due non
  ha il fuoco, poi compaiono sotto il piano (`.nod-ix-range-voce`, ux §7.8).
  Provato: Tab dalla foglia → il range compare e la freccia muove la foglia.
- `onAssestata(punto, metodo)`: al rilascio, al tocco, e 600 ms dopo l'ultimo
  tasto o range (mai durante il gesto). Il builder ci collega l'annuncio
  "Voce scura e pronta, 336 hertz." nella regione `aria-live` del form (V3).
- `metodo()` restituisce `'trascina' | 'tocco' | 'tastiera' | 'nessuno'` per
  il parametro `metodo` di `track('demo_prenotazione')` (ux §6.1).
- `disabilitato` (V0 prerender, V6 invio in corso): niente risposta,
  `aria-disabled`, la foglia esce dall'ordine di tabulazione.

### 3.3 Contratto per il section-builder-voce

```tsx
const piano = usePianoVoce({
  valuetextX: VOCE.piano.valuetextX,
  valuetextY: VOCE.piano.valuetextY,
  onAssestata: (p) => annunciaForm(fraseVoce(p)),
  disabilitato: invio === 'sending' || !montato,
});

<div ref={piano.refPiano} {...piano.propsPiano} className="nod-voce__piano nod-ix-piano">
  {/* assi e quattro parole */}
  <div ref={piano.refFoglia} {...piano.propsFoglia}
       aria-roledescription={VOCE.piano.roledescription} aria-label={VOCE.piano.fogliaAria}
       aria-describedby="nod-voce-zona nod-voce-istruzioni"
       className="nod-voce__foglia nod-ix-foglia">
    <svg className="nod-ix-foglia__segno" viewBox="…" aria-hidden="true"><path d={FORME_FOGLIA[0]} /></svg>
  </div>
</div>
<div className="nod-ix-range-voce">
  <label htmlFor="nod-voce-x">…</label><input id="nod-voce-x" className="nod-ix-range" {...piano.propsRangeX} />
  <label htmlFor="nod-voce-y">…</label><input id="nod-voce-y" className="nod-ix-range" {...piano.propsRangeY} />
</div>
```

- Il piano **non ha padding** (un bordo sì: è escluso dal calcolo): il suo
  lato interno è la scala dei due assi.
- La foglia è ancorata in CSS **al centro del piano** (`left: calc(50% -
  22px); top: calc(50% - 22px)`): nel prerender sta già al centro
  ("equilibrata", V0) senza JavaScript; l'hook scrive
  `translate3d(dx, dy, 0)` dal centro. Niente transform del builder sulla
  foglia (lo metta sul figlio, come `.nod-ix-foglia__segno`).

---

## 4. Il menu a comparsa (`useMenuMobile.ts`)

Segue l'ux-architect (§2.6, §7.5), più specifico del tech-architect (§3
diceva "trappola del fuoco"): il pannello è **non modale**, una trappola del
fuoco qui sarebbe sbagliata perché il pannello non copre la pagina.

- `propsBottone` sul marchio "NODI": `aria-expanded`, `aria-controls`.
- Apertura dal marchio → fuoco alla prima voce. Esc → chiude, fuoco al
  marchio. Clic o tocco fuori → chiude, fuoco dov'era. Marchio di nuovo →
  chiude. Tab oltre l'ultima voce → chiude, il fuoco prosegue nel documento.
- Scelta di una voce: il builder chiama `menu.scelta()` nell'`onClick` del
  link; il fuoco lo porta il salto all'`h2` (`vaiAllAncora` dello scaffold).
- `attivo: false` (colonna del banco visibile) chiude il menu se era aperto.
- Stato nello store (`menuAperto`, `apriMenu`); allo smontaggio si chiude.
- Pannello: classe `.nod-ix-pannello` + `{...propsPannello}`: chiuso è
  `visibility: hidden` (fuori dal tab e dall'albero di accessibilità), si
  apre in 200 ms (opacità e 6 px di discesa, curva `velo`), a scatto con
  reduced motion. Provato: apertura → fuoco su "I legni", Esc → fuoco su
  "NODI", Tab oltre → chiuso.

---

## 5. Il suono (`interaction/suono.ts` + `audio/*`)

### 5.1 Sblocco dentro il gesto

Safari vuole che l'`AudioContext` nasca e riparta **in modo sincrono** nel
gestore del tocco. Per questo il contesto lo crea `sbloccaAudio()` in
`interaction/suono.ts` (nel chunk del concept, qualche centinaio di byte) e
il chunk `audio/` lo riceve con `usaContesto(ctx)` quando arriva. Prima del
primo tocco su "Suono" o "Senti la voce" non esiste nessun `AudioContext`
(provato: contatore a 0 fino al clic, 1 dopo).

### 5.2 L'altoparlante (`audio/altoparlante.ts`)

| Parametro | Valore |
|---|---|
| Onda | sinusoide pura alla frequenza del righello (`runtime.hz.valore`, se no `target`) |
| Guadagno massimo | 0,04 (circa −28 dBFS) |
| Fuori risonanza | da 50 % a 100 %, continuo con l'ampiezza del modo più vicino (`runtime.ampiezze`) |
| Attacco / rilascio | costante di tempo 50 ms: 97 % in circa 180 ms, niente click |
| Inseguimento della frequenza | `setTargetAtTime`, 20 ms: niente gradini |
| A 0 Hz | silenzio |

Spegnimenti automatici, ognuno con `impostaSuono(false)` (l'interruttore
torna "spento", `aria-pressed="false"`): scheda nascosta; passaggio da una
frequenza a spento (si esce dalla prova, in cima o nella coda; acceso a
riposo resta acceso e tace finché non si scende); 20 s senza cambi di
frequenza, con dissolvenza di 1 s; qualunque altra via che metta
`store.suono` a false. Il tempo è quello del contesto: il ticker passa solo i
valori (fase `update`), il conto dei 20 s è un `setTimeout`, nessun rAF.

### 5.3 La nota d'esempio (`audio/notaEsempio.ts`)

- 1,8 s, fondamentale da `content/listino.ts` (La 440, Do 131, Do 65).
- Due dente di sega a ±3 cent (il fruscio dell'arco), miscela 0,42, filtro
  passa-basso con Q 0,7 a **3,5 → 14 volte la fondamentale** da scuro a
  brillante (tra 320 e 9.000 Hz), vibrato di 5,3 Hz che entra dopo 0,45 s
  fino a 12 cent.
- Attacco **220 → 35 ms** da morbido a pronto, rilascio 320 ms, picco 0,04.
- Mentre suona, l'altoparlante va a zero (ux V4) e torna dopo. Una nota
  nuova ferma la precedente senza ridare voce all'altoparlante nel mezzo.
- `sentiLaVoce(v)` si risolve con `'finita' | 'fermata' | 'non-disponibile'`:
  il builder mostra "Ferma la nota" finché la promessa è aperta e chiama
  `fermaLaNota()` sul secondo tocco.
- Niente compressore come limitatore sull'uscita: il `DynamicsCompressorNode`
  di Web Audio aggiunge un guadagno di compensazione automatico che
  alzerebbe i suoni bassi. Il tetto lo tengono le sorgenti.

### 5.4 Senza Web Audio (V13)

`audioDisponibile()` (da chiamare in un effetto, non nel render del
prerender) è false: il builder sostituisce "Senti la voce" con la frase del
copywriter e nasconde l'interruttore "Suono". Se lo sblocco fallisce
comunque, `alternaSuono()` lascia `suono` a false e `sentiLaVoce()` dà
`'non-disponibile'`.

### 5.5 Uso nei builder

```tsx
<button type="button" className="nod-ix-testo-bottone" aria-pressed={suono}
        aria-describedby="nod-suono-nota" onClick={alternaSuono}>
  <span className="nod-ix-testo-bottone__testo">{TESTI.suono.nome}</span>{' '}
  <span aria-hidden="true">{suono ? TESTI.suono.acceso : TESTI.suono.spento}</span>
</button>
```

---

## 6. Micro-interazioni e stati (`interaction.css`)

Tutte le classi sono `nod-ix-*`, sotto `.nod-root`, senza hex (token
dell'art-director), raggio 0 tranne la foglia. Si muovono solo `transform`,
`opacity` e lo spessore della sottolineatura.

| Classe | Riposo | Puntatore sopra (solo `hover: hover` e `pointer: fine`) | Premuto / attivo |
|---|---|---|---|
| `:focus-visible` (tutto) | anello 2 px ebano a 2 px | | |
| `nod-ix-link` | filo tè 1 px | filo 2 px | filo 2 px, scende di un soffio; `aria-current`: testo e filo ebano 2 px |
| `nod-ix-azione` (bottone ebano) | ebano, testo abete, una riga | fondo tè | tè e giù di 1 px (60 ms); `aria-disabled`: nessuna risposta |
| `nod-ix-testo-bottone` (+ `__testo`) | filo tè 1 px sotto la parola, area 44 × 44 | filo 2 px | `aria-pressed="true"`: testo ebano, filo ebano 2 px |
| `nod-ix-scelta` (+ `__input`, `__testo`) | radio vero invisibile, parola | filo tè 1 px | scelto: parola ebano, filo ebano 2 px; anello sulla parola |
| `nod-ix-scala` | `pointer` | | `touch-action` per orientamento |
| `nod-ix-cursore` (+ `__segno`) | `grab`, 44 × 44 | segno vernice lungo +25 % | `grabbing`, segno +50 % |
| `nod-ix-piano` | `pointer`, `pan-y` | | |
| `nod-ix-foglia` (+ `__segno`) | tonda 44 × 44, `grab` | la scaglia ruota di 8° | `grabbing`, scala 1,12 (nessuna ombra) |
| `nod-ix-range-voce`, `nod-ix-range` | nascosti alla vista | | visibili al fuoco: filo tè 1 px, pollice ebano 16 px quadrato |
| `nod-ix-pannello` | invisibile | | aperto: dissolvenza 200 ms e 6 px di discesa |
| `nod-ix-marchio` | | | aperto: filo ebano sotto "NODI" |
| `nod-ix-tocco` | minimo 44 × 44 | | |

Screenshot guardati (bottone ebano a fuoco e sotto il puntatore, link,
indice corrente, interruttore spento/acceso, radio scelto e a fuoco, foglia,
range comparso al fuoco): l'anello d'ebano si legge sull'abete e, con lo
stacco d'abete, attorno al bottone ebano; nessuna informazione solo nel
colore.

---

## 7. Movimento, lampeggi, tatto

- **Reduced motion** (preferenza o `data-motion="reduced"`): tutte le
  transizioni dei miei stati a zero, pannello senza discesa, magnetismo e
  scorciatoie con scroll istantaneo. I gesti restano identici (sono
  manipolazione diretta, non animazione).
- **Lampeggi**: nessun cambio di colore di superfici grandi. Le uniche
  superfici che cambiano colore sono il bottone ebano (ebano ↔ tè, un cambio
  per gesto) e il pannello del menu (solo opacità). Le foglie non cambiano
  mai colore: nessun mio file le tocca.
- **Mai suono senza un tocco**: né al passaggio del mouse, né al
  trascinamento della foglia, né al caricamento.

---

## 8. Checklist per l'accessibility-auditor

- Righello: `role="slider"` sul cursore, 0-420, valuetext parlante, frecce /
  Pagina / Inizio / Fine come al §2.4, coda → 420, nessun annuncio a ogni
  hertz, fuoco preso al pointerdown.
- Scorciatoie modo 1/2/5: bottoni veri, fuoco fermo.
- Piano: foglia con `role="application"` e frecce, due range etichettati che
  compaiono al fuoco, annuncio solo a gesto finito, nessun suono.
- Menu: disclosure non modale, fuoco alla prima voce, Esc al marchio, Tab
  oltre chiude.
- Suono: `aria-pressed`, nessun `AudioContext` prima di un tocco, spento da
  solo con `aria-pressed` coerente.
- Bersagli 44 × 44 (cursore, foglia, bottoni di testo, radio).
- Focus 2 px ebano a 2 px, mai solo colore.

---

## 9. Contratti richiesti allo scaffold

Firme esatte che i miei file importano (coerenti con tech-architect §2.3,
§6, §7). Con queste firme `tsc` ed `eslint` sono verdi.

```ts
// core/ticker.ts (API del pilota)
export type FaseTicker = 'read' | 'update' | 'write' | 'render';
export type TickFn = (dt: number, now: number) => boolean | void;
export const ticker: { add(fn: TickFn, fase?: FaseTicker): () => void; wake(): void };
// `now` = timestamp di rAF; una fn che restituisce true chiede un altro frame.

// core/scroll.ts
export function vaiAScroll(y: number, liscio?: boolean): void;   // window.scrollTo, 'smooth' | 'auto'

// state/runtime.ts (campi usati)
runtime.percorso: number;
runtime.hz: { target: number | null; valore: number | null };
runtime.ampiezze: Float32Array;          // 3 valori in [0, 1]
runtime.hzModo5: number;
runtime.voce: { x: number; y: number; trascinando: boolean };
runtime.righello: {
  trascinando: boolean;
  hzPuntatore: number | null;   // scritto da useRighello
  cursore: number | null;       // Hz mostrati, null = spento (CursoreRighello.hz, motion-designer)
  u: number;                    // posizione di scala U_SPENTO..1 (CursoreRighello.u)
};
runtime.foglie: { comando: 'nessuno' | 'sparpaglia' | 'ricomponi'; … };
runtime.markDirty(): void;

// state/store.ts
export type Modo = 1 | 2 | 5;
export interface Voce { strumento: Strumento; x: number; y: number }
store.get(): NodiState;                   // usati: suono, voce, menuAperto, reducedMotion
store.subscribe(fn: () => void): () => void;
export function useNodi<T>(selector: (s: NodiState) => T, isEqual?: (a: T, b: T) => boolean): T;
export function impostaVoce(patch: Partial<Voce>): void;
export function impostaSuono(acceso: boolean): void;
export function apriMenu(aperto: boolean): void;

// risonanza/modi.ts
export const MODI: { 1: 92; 2: 168; 5: 348 };
export function magnete(hz: number, hzModo5?: number): number | null;
export function modoInRisonanza(hz: number | null, hzModo5?: number): Modo | null;

// risonanza/frequenza.ts
export function scrollDaHz(hz: number): number;   // px documento, per 60-420 (anche frazionari)
```

Semantica che serve:
- `runtime.righello.u` e `cursore` come chiede il motion-designer
  (`avanzaCursoreRighello` nella fase `update`, con `trascinando` per il tau
  corto). `hzPuntatore` è `null` fuori dal gesto; durante il gesto è 0
  (spento) o 60-420, anche frazionario.
- Fuori dal trascinamento `frequenza.ts` legge la voce dallo **store**;
  durante (`runtime.voce.trascinando`) da `runtime.voce` (tech §6.2).
- `impostaVoce`, `impostaSuono`, `apriMenu` sono sincroni e notificano
  subito (`useSyncExternalStore`).
- `Radice.tsx`: `import './interaction/interaction.css'` **dopo**
  `tokens.css`, `base.css`, `layout.css` e prima dei CSS di sezione; allo
  smontaggio **`chiudiSuono()` di `interaction/suono.ts`** al posto di
  `chiudiAudio()` del §9.4 (così Radice non importa il chunk lazy:
  `chiudiSuono` lo chiude se c'è, o chiude il contesto se il chunk non è mai
  arrivato).

---

## 10. Verifiche fatte

Progetto di prova nello scratchpad con i miei file, `motion/easing.ts`,
`motion/percorso.ts`, `content/listino.ts` veri e gli stub del §9; i
`node_modules` (stesse versioni) del pilota.

- `tsc -p tsconfig.app.json --noEmit` (strict, `noUncheckedIndexedAccess`,
  `noUnusedLocals/Parameters`): verde. `eslint` (config del sito): verde.
- `vite build`: `audio/` in un chunk suo, **2,1 KB gz**; `interaction.css`
  **1,7 KB gz**.
- Chromium headless (Playwright, dev server sulla 9193, poi spento):
  trascinamento del cursore da spento a 143 Hz → scroll esatto a
  `scrollDaHz(142,5)`, `aria-valuenow` aggiornato solo al rilascio;
  rilascio a 163,4 Hz → magnetismo al pianerottolo dei 168; tastiera Inizio
  0, ↑ 60, ↑ 61, PagSu 71, ↓ 70, Fine 420; nella coda una freccia riporta a
  420; clic sul binario → valore sotto il puntatore; foglia trascinata di
  (+80, −80) px → (0,75; 0,75) e transform giusto; clic sul piano → (0,1;
  0,1); frecce e Maiusc+frecce sulla griglia; Inizio → centro; Tab → range
  visibile e funzionante; menu (fuoco, Esc, Tab oltre); nessun
  `AudioContext` prima del clic su "Suono", uno dopo; risalendo in cima il
  suono si spegne da solo; nota d'esempio suonata e conclusa. **Zero errori
  e zero avvisi in console.**

---

## Richieste ad altri agent

- **motion-designer** (`motion/percorso.ts`): ai due capi della scala il
  valore cade fuori dalla salita per un solo pixel. `percorsoDaHz(420)`
  restituisce esattamente il punto in cui `hzDaPercorso` passa a `null`
  (`tr.u >= 0.5` nella salita dopo la voce), e `percorsoDaHz(60)` l'inizio
  esatto della salita 1, dove un pixel in meno è il riposo spento. Con lo
  scroll a pixel interi "Fine" mostra 419 o spento. Proposta: un piccolo
  pianerottolo ai capi (per esempio l'ultimo 3 % della mezza salita 4 dà
  sempre 420 e il primo 3 % della salita 1 dà sempre 60), con
  `percorsoDaHz(420)` e `percorsoDaHz(60)` al centro di quei tratti. Io
  intanto miro un pixel dentro (`comandi.ts`), che con il pianerottolo dà
  420 e 60 esatti. Allineato a `molle.ts`: il cursore fuori dal gesto segue
  il tuo `CursoreRighello` (`runtime.righello.u` e `cursore`); il
  `transform` però lo scrive `useRighello` in px (durante il trascinamento
  dal dito, senza ritardo): `--nod-cursore` resta una variabile a
  disposizione, non deve muovere il cursore. Magnetismo e scorciatoie usano
  `vaiAScroll(y, liscio)` con `liscio = !reducedMotion` (equivale al tuo
  `comportamentoScroll`). `runtime.ultimoSalto` conviene calcolarlo nello
  scaffold (confronto di `scrollY` tra due frame): copre trascinamento,
  tastiera e indice.
- **scaffold-engineer**: §9 (firme, `runtime.righello.cursore` a 0 se
  spento, ordine dei CSS, `chiudiSuono()` allo smontaggio). `scrollDaHz`
  deve accettare frequenze frazionarie (il trascinamento è continuo).
- **section-builder-righello**: markup del §2.6 (scala senza padding,
  cursore ancorato ai 60 Hz e senza transform proprio, numero in
  `refValore`); scorciatoie con `vaiAlModo`; "Rimetti le foglie" con
  `rimettiFoglie()`; interruttore con `alternaSuono` e la struttura del §5.5;
  annuncio di `onRitornoAllaProva`.
- **section-builder-voce**: markup del §3.3 (piano senza padding, foglia
  ancorata al centro, range dentro `.nod-ix-range-voce`); "Senti la voce"
  con `sentiLaVoce({ strumento, x, y })` e "Ferma la nota" con
  `fermaLaNota()`; `audioDisponibile()` in un effetto per V13; `metodo()` nel
  `track`; `onAssestata` per l'annuncio V3; bottone di invio con
  `nod-ix-azione` e `aria-disabled` in V6; radio con `nod-ix-scelta`.
- **section-builder-apertura**: menu con `useMenuMobile({ attivo })` (§4),
  marchio con `nod-ix-testo-bottone nod-ix-marchio`, pannello con
  `nod-ix-pannello`, `menu.scelta()` sul clic delle voci; "La voce che
  vorresti" con `nod-ix-azione`.
- **section-builder-riparazioni**: sabati con `nod-ix-scelta`, invio con
  `nod-ix-azione`.
- **copywriter**: firme già allineate (`valuetextRighello(v, modo, { coda,
  tuaVoce })`, `VOCE.piano.valuetextX/Y` su 0-100, `PROVA.cursoreAria`,
  `VOCE.piano.roledescription` e `fogliaAria`, `TAVOLA.tornaAllaProva(420)` per
  `onRitornoAllaProva`, "Ferma la nota" e la frase senza audio di V13).
  Nessuna richiesta aperta.
- **tech-architect / orchestratore** (per conoscenza): due scostamenti
  motivati dal §7: `aria-valuemin` del righello è 0 (ux §7.3) e
  `useRighello` prende anche `valuetext`, `onRitornoAllaProva` e
  `disabilitato` (gli hook non contengono testi); `usePianoVoce` prende
  `valuetextX/Y`, `onAssestata`, `disabilitato` e restituisce anche
  `propsPiano` e `metodo`; il menu non ha trappola del fuoco (ux §7.5); il
  wrapper `interaction/suono.ts` sta nel chunk del concept per creare il
  contesto audio nel gesto (Safari).
