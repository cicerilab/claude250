# Accessibility auditor · IMPRONTA (concept 10) · ondata 4 QA

Audit WCAG 2.2 AA di `src/pages/concepts/impronta/` (sections/*, interaction/*,
relief/ReliefText.tsx, Impronta.tsx, styles/*.css). Nessun file sorgente
modificato. I proprietari dei file sono quelli di tech-architect.md §4.

## Metodo

- Skill `web-design-guidelines`: linee guida scaricate da
  `vercel-labs/web-interface-guidelines/command.md` e applicate a tutti i file.
- Dal vivo: `npm run build` (verde), `vite preview --port 8202` (chiuso a fine
  audit), Playwright 1.56 + Chromium 1194, `@axe-core/playwright` in
  `/tmp/claude-0/a11y/`.
- axe (wcag2a/aa, 21a/aa, 22aa) su 4 carte × 1440 e 375: **0 violazioni**. Il
  contrasto axe resta "incompleto" (fondi con sfumature e fibre), quindi l'ho
  **calcolato io**: per ogni nodo di testo visibile, colore reale (con
  opacità) sul fondo effettivo risalendo gli antenati. Fatto su tutte e 4 le
  carte (`?carta=`), 1440 e 375, movimento pieno e ridotto, WebGL spento e
  acceso (SwiftShader, `?gl=1`).
- Tastiera: Tab da "Salta al contenuto" fino all'ultimo link del colophon e
  ritorno (Shift+Tab), a 1440 e a 375, con controllo di anello visibile ed
  elemento coperto (9 punti per elemento, `elementFromPoint`).
- Lettore di schermo: albero di accessibilità (`ariaSnapshot`), landmark,
  titoli, id duplicati, registro di tutte le scritture nelle regioni `aria-live`.
- `emulateMedia` / `reducedMotion: 'reduce'`: scorrimento completo con
  `document.getAnimations()` e osservatore delle scritture di `transform`.
- Zoom: 1280 al 200% (640×400) e al 400% (320×256), più 720×450.
- Bersagli touch a 375 (indice mobile aperto compreso).

## Cosa va bene (verificato)

- Testo: tutti i testi leggibili superano 4,5:1 (3:1 i grandi) su tutte e 4 le
  carte; inchiostro 10,1-14,3:1, velato 5,1-6,9:1, testo su lamina scuro con
  bordo in inchiostro. Sotto soglia solo i rilievi a secco (1,07-1,12:1), tutti
  `aria-hidden` e ripetuti in chiaro (hero, Tecniche, strisce della carta,
  indirizzo in bottega, righe della prova, pezzi di Per chi).
- Nessuna informazione solo nel rilievo: ogni superficie premuta ha il suo
  gemello `.imp-sr` o ripete un testo visibile; canvas `aria-hidden`.
- Landmark: un `banner`, un `main`, un `contentinfo` (colophon), nav con nome.
  Titoli h1 → h2 → h3 senza salti in tutte le varianti (1440, 375, ridotto).
- Salti: "Salta al contenuto" porta il fuoco sull'h1, "Vai al banco di prova"
  sull'h2 del banco; i link della testata portano il fuoco sul titolo d'arrivo,
  lontano dalla testata (208 px sotto il bordo, testata 56 px).
- Anello di fuoco 3 px in inchiostro su tutti i controlli, anche su Grafite;
  `forced-colors` e `prefers-contrast` gestiti.
- Indice mobile: `<dialog>` modale, fuoco intrappolato, Esc chiude, il fuoco
  torna al bottone, `aria-expanded` corretto, scroll della pagina sbloccato.
- Leva: tenuta di Spazio e Invio (900 ms), doppia pressione breve, clic
  sintetico dei lettori di schermo (due `click()`), rilascio anticipato con
  messaggio, blocco senza contatto con fuoco sul campo, errore `?invio=ko`.
  Tutti verificati.
- Radiogroup delle carte: roving tabindex corretto, Home/End, Spazio e Invio
  scelgono, si rientra sulla carta scelta.
- Pin delle Tecniche: i quattro salti portano allo scroll giusto,
  `aria-current` segue; le quattro tecniche sono sempre tutte nel DOM.
- Reduced motion: zero animazioni o transizioni > 1 ms e zero scritture di
  `transform` in tutto lo scorrimento, Tecniche statiche, filo già cucito,
  lenis spento, onda della carta sostituita da una dissolvenza.
- Bersagli a 375: tutti ≥ 44×44 tranne due salti delle Tecniche (sotto).
- Nessuno scroll orizzontale a 320, 640, 720 px.

## Problemi

Gravità: **bloccante** (qualcuno non può completare un compito), **alta**
(criterio AA/A violato con effetto reale), **media**, **bassa**.

### A1 · alta · "cos'è?" delle tecniche nascosto sotto le carte della tecnica

- `sections/Banco/banco.css:136-147` (`.imp-banco__cose`, `position: absolute`,
  `inset-block-start: 0`, `margin-block-start: -10px`) e
  `sections/Banco/Compositoio.tsx:253`.
- WCAG 2.4.7 Focus visibile, 2.4.11 Fuoco non oscurato (minimo), 2.5.8.
- Dal vivo: a 1440 sta sotto "lamina argento", a 768 e a 375 sotto le
  scelte della tecnica: invisibile, non cliccabile (Playwright: `click`
  intercettato da `input[name=imp-banco-tecnica]`), raggiunto da Tab ma con
  l'anello coperto.
- Correzione: togliere il posizionamento assoluto e mettere legenda e link su
  una riga (`.imp-banco__gruppo--tecnica { display: grid; grid-template-columns: 1fr auto; }`,
  link in colonna 2 della prima riga, scelte `grid-column: 1 / -1`), oppure
  tenere l'assoluto ma riservare lo spazio (`padding-block-start: 44px` sul
  fieldset) e dare `z-index: 1` al link.
- Proprietario: section-builder-banco.

### A2 · alta · fuoco coperto da testata, lastra e comandi fissi (Shift+Tab e Tab)

- `styles/base.css` (manca `scroll-padding` sul documento),
  `sections/Banco/banco.css:1093-1095` e `:1185-1187` (lo `scroll-margin` è
  sui contenitori `.imp-banco__scelta/.imp-banco__campo`, ma il fuoco va
  all'`input` che sta dentro, con `scroll-margin` 0),
  `sections/Hero/Testata.tsx:240-249` (la riga mobile torna dopo 28 px di
  scroll in su e copre ciò che il fuoco ha appena portato in vista).
- WCAG 2.4.11 Fuoco non oscurato (minimo), AA.
- Dal vivo: a 1440 all'indietro 4 elementi coperti al 100% dalla testata
  (voci del colophon, scelte del banco). A 375, 19 elementi coperti: tutte le
  voci del colophon e i quattro salti delle Tecniche sotto la testata, i
  campi e le scelte del banco coperti al 100% dalla lastra ferma; in avanti i
  salti delle Tecniche e il secondo campo di testo finiscono sotto "Torna in
  Ciceri Lab" e "Prova la tua" in basso.
- Correzione:
  1. scaffold-engineer, `styles/base.css`: `html:has(.imp-root) { scroll-padding-block: calc(var(--imp-testata-h-fissa) + 16px) calc(var(--imp-segnapagina-h, 52px) + 24px + env(safe-area-inset-bottom)); }`
     (valori mobile in `@media (max-width: 1023.98px)`);
  2. section-builder-banco, `banco.css:1093` e `:1185`: aggiungere al
     selettore `.imp-banco__input, .imp-ix-scelta__input, .imp-banco__leva,
     .imp-banco__cose, .imp-ix-dial__input` (lo `scroll-margin` deve stare
     sull'elemento che riceve il fuoco);
  3. section-builder-hero, `Testata.tsx:240-249`: non far rientrare la riga
     se nei 400 ms precedenti è cambiato `document.activeElement` fuori dalla
     testata (un `focusin` sul documento che segna `ultimoFuoco = now`).
- Proprietari: scaffold-engineer, section-builder-banco, section-builder-hero.

### A3 · alta · al 400% la lastra del banco e il pin delle Tecniche coprono il contenuto

- `sections/Banco/banco.css:652-659` (lastra `position: sticky`,
  `block-size: 42svh`, `min-block-size: 260px`);
  `sections/Tecniche/tecniche.css:82-108` (pin 350/400svh, palco sticky 100svh)
  e `sections/Tecniche/Tecniche.tsx:381-387` (sceglie la resa solo da
  `reducedMotion`).
- WCAG 1.4.10 Reflow (AA), 1.4.4.
- Dal vivo a 320×256 (1280 al 400%): la lastra ferma è alta 260 px su 256 di
  finestra, quindi nel banco non si vede nessun campo mentre si compila. Nel
  pin delle Tecniche testo e costo della tecnica escono dal palco fermo e non
  si raggiungono scorrendo, e "Prova la tua" in basso li copre. Al 200%
  (640×400) la lastra occupa il 65% della finestra.
- Correzione:
  - banco.css: `@media (max-height: 34rem) { .imp-root .imp-banco__lastra { position: static; min-block-size: 0; block-size: auto; } }`
    e `min-block-size: min(260px, 42svh)`;
  - Tecniche.tsx: resa statica anche con finestra bassa
    (`const bassa = useSotto…` su `(max-height: 34rem)`, poi
    `ridotto || bassa ? <TecnicheStatiche/> : <TecnichePin/>`);
  - testata.css: nascondere `.imp-segnapagina` con `@media (max-height: 34rem)`.
- Proprietari: section-builder-banco, section-builder-tecniche,
  section-builder-hero (per la regola del segnapagina).

### A4 · alta · rischio lampeggio: cambi di carta a raffica su tutto lo schermo

- `interaction/paperWave.ts:193-224` (`startPaperWave` chiude l'onda in corso
  e applica subito la nuova, senza limite di frequenza), chiamato dai radio
  nativi di `sections/Banco/Compositoio.tsx:164-168` e
  `sections/Hero/Testata.tsx:558-563` (indice).
- WCAG 2.3.1 Tre lampeggiamenti (A), 2.3.3.
- Dal vivo: freccia tenuta sui radio carta del banco (i radio nativi scelgono
  a ogni freccia): 7 cambi di colore di tutta la pagina al secondo in
  Chromium headless, Cotone (L 0,88) ↔ Cipria (0,55) ↔ Grafite (0,025) ↔
  Citrino. Sono più di 3 coppie di transizioni opposte al secondo su tutto lo
  schermo, e con la ripetizione nativa del tasto (circa 30 Hz) si arriva a
  circa 15. Con reduced motion il cambio è immediato, quindi è anche peggio.
- Correzione: in `paperWave.ts`, niente più di un cambio di carta applicato
  ogni 400 ms. Una richiesta che arriva prima si mette in coda, e resta solo
  l'ultima: `if (now - ultimoScambio < 400) { inAttesa = carta; timer…; return promessa }`,
  valido anche in reduced motion. Al Compositoio e all'indice basta non fare
  nulla: la coda assorbe le frecce tenute.
- Proprietario: interaction-designer.

### M1 · media · annunci doppi e contraddittori dopo "Prova la tua" di Per chi

- `sections/PerChi/PerChi.tsx:75` e `sections/Banco/Banco.tsx:167-175`.
- WCAG 4.1.3 Messaggi di stato.
- Dal vivo: "Banco di prova: partecipazione su carta **Cipria**." (Per chi,
  210 ms), poi "Banco di prova: partecipazione su carta **Citrino**." (banco,
  422 ms, carta vecchia perché l'onda non ha ancora scambiato), poi
  "Indicativo 410 €.".
- Correzione: un solo annuncio. Togliere quello di Banco.tsx:167-175 quando il
  cambio viene da fuori (Per chi e il filo già annunciano) oppure, se si tiene
  quello del banco, leggere la carta **dopo** `cambiaCarta(...).then(...)` e
  togliere quello di PerChi.tsx:75.
- Proprietari: section-builder-banco, section-builder-per-chi.

### M2 · media · esito dell'invio letto due volte

- `sections/Banco/Banco.tsx:302` e `:309` (annuncio `aria-live`) e
  `:315-325` (fuoco sulla frase di esito, che il lettore legge a sua volta).
- WCAG 4.1.3.
- Dal vivo: "Ricevuto. Domani ti scriviamo…" arriva dal fuoco e subito dopo
  dalla regione. Per l'errore arrivano due testi diversi, "Non siamo riusciti…
  Puoi riprovare…" e "…Controlla la connessione…".
- Correzione: con il fuoco spostato sull'esito non annunciare
  `ANNUNCI.successo` e `ANNUNCI.fallito`, oppure tenere l'annuncio e non
  spostare il fuoco. Consiglio la prima.
- Proprietario: section-builder-banco.

### M3 · media · il dial "Direzione della luce" cambia valore da solo mentre ha il fuoco

- `interaction/light.ts:373-388` (arco automatico dell'hero dopo 8 s senza
  input; il fuoco non conta come input).
- WCAG 2.2.2 Pausa, stop, nascondi (A); 3.2.1 (cambio non richiesto sul
  controllo col fuoco).
- Dal vivo: fuoco sul dial, nessun tasto: in 14 s il valore passa da 150 a
  165, 180 e di nuovo 165 (`aria-valuetext` aggiornato, i lettori lo
  leggono). Sotto 1024 px il dial dell'hero non c'è, quindi non c'è modo di
  fermare l'arco, un movimento automatico senza fine.
- Correzione: `focusin` su qualunque controllo, e ogni tasto, contano come
  input; col fuoco sul dial l'arco è fermo (`L.fonte = 'dial'`). L'arco
  si ferma per sempre dopo il primo giro (40 s), oppure dopo il primo input.
- Proprietario: interaction-designer.

### M4 · media · radiogroup delle carte: le frecce spostano il fuoco ma non scelgono

- `sections/Carta/Carta.tsx:233-257`.
- WCAG 4.1.2 (il comportamento non è quello del ruolo `radio` dichiarato).
- Dal vivo: ArrowRight porta il fuoco su Grafite con `aria-checked="false"`
  e la carta resta Cipria. Con NVDA o VoiceOver si sente "non selezionato" su
  ogni carta: sembra che il gruppo non funzioni.
- Correzione: la scelta segue il fuoco (`spostaFuoco` chiama anche
  `scegli`), una volta risolto A4 con il limite di frequenza. In alternativa
  tenere la scelta manuale, ma allora niente `role="radio"`: bottoni con
  `aria-pressed` in un `role="group"`.
- Proprietario: section-builder-carta.

### M5 · media · la leva armata ha un nome diverso dall'etichetta visibile

- `sections/Banco/Leva.tsx:78` (`aria-label` fisso "Tieni premuto per
  stampare") e `:90` (etichetta visibile `aria-hidden` che diventa "Premi di
  nuovo per confermare" o "La pressa è giù…").
- WCAG 2.5.3 Etichetta nel nome (A).
- Correzione: `aria-label={etichetta}`, oppure togliere `aria-label` e
  l'`aria-hidden` dal testo visibile.
- Proprietario: section-builder-banco.

### B1 · bassa · link "Apri in Maps" e telefono su mobile: nome diverso dal testo

- `sections/Bottega/Bottega.tsx:327`: si vede "Apri in Maps", il nome è "Apri
  Via Cavallotti 18, Pordenone in Maps…" (parole non consecutive).
  `:315`: su 375 si vede "Chiama 0434…", il nome è "Telefona in bottega,
  0434…".
- WCAG 2.5.3.
- Correzione (copywriter, `content/testi.ts` BOTTEGA): `maps.aria = 'Apri in Maps: Via Cavallotti 18, Pordenone, in una nuova scheda'`;
  `telefono.aria = 'Chiama la bottega, 0434 000 000'` e
  `telefono.bottone = 'Chiama 0434 000 000'`, con il nome che comincia per
  "Chiama" come il testo visibile.
- Proprietari: copywriter, section-builder-bottega.

### B2 · bassa · salti delle Tecniche stretti a 375

- `sections/Tecniche/tecniche.css:248` (e la variante mobile a `:310`):
  "lamina" 43×44, "taglio" 34×44. Rispettano 2.5.8 (≥ 24 px) ma non il minimo
  di 44 del progetto.
- Correzione: `min-inline-size: 44px; justify-content: center;` su
  `.imp-tecniche__salto`.
- Proprietario: section-builder-tecniche.

### B3 · bassa · prezzo annunciato dal banco quando la carta cambia altrove

- `sections/Banco/Banco.tsx:155-165`: cambiando carta dalla sezione Carta o
  dall'indice si sente anche "Indicativo 160 €." di un banco non in vista.
- WCAG 4.1.3.
- Correzione: annunciare il prezzo solo se `cambiato.current !== null` (cioè
  la scelta è partita dal banco) o se il fuoco è dentro `#banco`.
- Proprietario: section-builder-banco.

### B4 · bassa · id duplicato `freccia` (×3)

- `assets/svg/freccia.svg:1` (`<path id="freccia">`), inserito inline più
  volte (`sections/Bottega/Bottega.tsx:330`, Colophon `Freccia`).
- WCAG 4.1.1 (obsoleto in 2.2), ma gli id duplicati rompono i riferimenti.
- Correzione: togliere l'`id` dal path.
- Proprietario: vector-artist.

### B5 · bassa · annunci "indice aperto/chiuso" ridondanti

- `sections/Hero/Testata.tsx:367` e `:398`: il `<dialog>` modale con
  `aria-labelledby` è già annunciato ("indice, finestra di dialogo"), e la
  chiusura si sente dal ritorno del fuoco.
- Correzione: togliere i due `annuncia(...)`.
- Proprietario: section-builder-hero.

### B6 · bassa · la legatura scelta cambia da sola scorrendo

- `sections/Legatoria/Legatoria.tsx:175-219`: il radio `checked` segue il
  tempo di lettura. Chi usa un lettore di schermo trova una scelta che non ha
  fatto.
- WCAG 3.2.2 (spirito, non lettera).
- Correzione: lasciare il radio senza `checked` finché l'utente non sceglie e
  usare il tempo di lettura solo come valore di default per "Prova la tua";
  oppure dire quale legatura è preselezionata e perché in una frase `.imp-sr`
  nella legenda.
- Proprietario: section-builder-legatoria.

### B7 · bassa · `<nav>` usato per i recapiti

- `sections/Bottega/Bottega.tsx:314`: telefono, email e mappa non sono
  navigazione del sito. Il landmark aggiunge rumore all'elenco delle nav.
- Correzione: `<div role="group" aria-label=…>` oppure `<ul>` semplice.
- Proprietario: section-builder-bottega.

### B8 · bassa · errore del contatto non annunciato all'uscita dal campo

- `sections/Banco/Compositoio.tsx:396-402`: l'errore compare al blur ma il
  fuoco è già altrove. Il lettore di schermo lo sente solo quando la leva
  rimanda al campo.
- WCAG 3.3.1 è rispettato (testo e `aria-invalid`). È un miglioramento.
- Correzione: `role="status"` sul `<p>` dell'errore (senza assertive).
- Proprietario: section-builder-banco.

## Fuori dal perimetro (sito, non concept)

- `ConceptBackButton` del sito (`cl-backbtn`): 194×36 a 375 (sotto i 44 del
  progetto) e fisso in basso a sinistra sopra i contenuti, vedi A2. Va a
  chi mantiene `@/components/ConceptBackButton` (integrazione-sito.md).

## Limiti dell'audit

- Lettori di schermo reali (NVDA, VoiceOver) non disponibili: sintesi da
  albero di accessibilità e registro delle regioni live.
- Lampeggio con WebGL acceso non misurato (SwiftShader troppo lento per i
  fotogrammi). La logica di scambio è la stessa del DOM, quindi A4 vale anche lì.
- Solo Chromium; Firefox e Safari li copre il cross-browser-tester.
