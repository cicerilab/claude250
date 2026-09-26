# Section-builder Tecniche · Concept 10 · IMPRONTA

Ondata 3. Sezione 3, "La stessa parola, quattro volte" (`#tecniche`).

File miei:

| File | Contenuto |
|---|---|
| `src/pages/concepts/impronta/sections/Tecniche/Tecniche.tsx` | componente (default export senza prop): resa con il pin e resa statica |
| `src/pages/concepts/impronta/sections/Tecniche/tecniche.css` | stili, tutti sotto `.imp-root` |
| `docs/section-builder-tecniche.md` | questo documento |

Letti: `DESIGN.md`, `docs/scaffold-engineer.md`, `creative-director.md`,
`ux-architect.md` (§3, §4.3, §5.3, §6.2, §6.8), `copywriter.md` e
`content/testi.ts` (`TECNICHE`), `art-director.md`, `motion-designer.md`
(§5.2, §6.3, §7.2, §8, §9), `webgl-artist.md` (§6.1, §12),
`integrazione-sito.md`, le skill `design-taste-frontend` e
`full-output-enforcement`.

---

## 1. Cosa fa

Una parola sola (il nome del cliente, se l'ha già scritto nel banco, con
`selParolaCampione`; altrimenti "Pordenone") è premuta in un biglietto 85 × 55
della stessa carta del sito. Scorrendo, il biglietto ripassa sotto la pressa:
a secco, a un colore, lamina a caldo, taglio colorato. Accanto, la
spiegazione della tecnica in vista: titolo, cos'è, su cosa rende, quanto
costa in più (il prezzo indicativo di `TECNICHE.voci[].costo`), sempre in
inchiostro Hanken.

Testi: solo `TECNICHE` di `content/testi.ts` (titolo, intro, voci, elenco,
segno "◂", "in vista", "Torna al banco", `rilievoAlt`). Nessuna stringa
scritta nel componente, a parte la virgola che separa "in vista" dal nome per
il lettore di schermo.

Tecniche: quattro, come nel copy e nel titolo ("quattro volte"). La
`cordonatura` esiste nel registro dei rilievi ma è una piega (layer `linea`
dei pezzi di Per chi), non ha testi nel copywriter e non è una tecnica di
stampa della parola: non l'ho aggiunta.

## 2. Il pin (movimento pieno)

```
section#tecniche.imp-tecniche                (display: flow-root; piede sotto)
  [.imp-page.imp-tecniche__testa-fuori]      solo sotto 768: h2 + intro scorrono via
  .imp-tecniche__pin                         400svh (350svh sotto 768), --imp-tecniche-p/-giro
    .imp-tecniche__palco[data-tecnica]       sticky, top 0, 100svh
      .imp-page.imp-tecniche__gabbia         griglia
        .imp-tecniche__testa                 h2 + intro (da 768)
        .imp-tecniche__indice                ol di 4 bottoni + corsa + "Torna al banco"
        .imp-tecniche__zona (aria-hidden)    container: size
          .imp-tecniche__foglio.imp-foglio[.imp-taglio]
            .imp-tecniche__parola            la parola (fantasma del rilievo)
            .imp-tecniche__costa             bordo visto di taglio (solo taglio)
        ol.imp-tecniche__voci                4 li impilati nella stessa cella
```

- **svh ovunque** (`350vh`/`400vh`/`100vh` come ripiego prima): l'altezza è
  quella con le barre di Safari aperte, quindi la barra che si ritira non
  ridimensiona il palco e non ci sono salti a metà pin.
- **Progresso**: `useScrollProgress(pinRef, { intervallo: TECNICHE.intervallo,
  variabile: VAR.tecnicheP, passi: 4, isteresi: 0.02, derivate:
  { [VAR.tecnicheGiro]: giroTecniche }, onPasso })`, tutti i valori da
  `motion/choreography.ts` (nessun numero di tempo mio).
- **onPasso**: la voce dell'elenco cambia subito (`passo`, è un indice); la
  parola, il titolo e le tre righe cambiano al fondo della ristampa
  (`pressa.ristampa(() => setMostrata(i))`). Prima valutazione (`-1`): cambio
  diretto senza ristampa.
- **Pressa d'ingresso**: `usePressione(parolaRef, { profilo: TECNICHE.profilo,
  reliefId, osserva: pinRef })`, una volta sola. La parola non ha
  `.imp-pressa` (assi fissi: `wdth` 100 sotto 600, 112,5 sopra, `wght` 900).
- **Rilievo**: `useRelief` con `kind: 'text'`, `tracking: 'live'` (è dentro
  un contenitore sticky), `tecnica` secco / colore / lamina, profondità 1 /
  0,85 / 0,8. Cambiare tecnica cambia la spec: una ricottura della maschera.
- **Taglio colorato**: DOM/CSS, come chiede il webgl-artist §12. Durante il
  taglio la parola esce dal registro (`attivo: false`, niente classe
  `imp-relief`) e la disegna il fallback `.imp-secco`: così ruota insieme al
  foglio. Il foglio prende `.imp-taglio` (filo tinto sul perimetro,
  `--imp-taglio` dell'art-director) e ruota con
  `perspective(1400px) rotateY(giro × -32deg)` (-18deg sotto 768); la faccia
  `.imp-tecniche__costa`, girata di -90° sul lato destro dietro al fronte,
  mostra il bordo dipinto, spesso 16 px (9 sotto 768), con le passate del
  pennello in `repeating-linear-gradient` tinto. Il giro vale solo con
  `data-tecnica="taglio"`: nella ristampa verso un'altra tecnica il foglio
  resta dritto. Origine al centro: la parte che viene avanti non esce dalla
  colonna.
- **Shader acceso** (`data-gl="on"`): il fronte del foglio diventa trasparente
  (la parola la preme lo shader sulla stessa carta del sito, che ha lo stesso
  colore); restano costa e ombra di appoggio. Nel taglio il fronte torna pieno
  perché la parola è del DOM.
- **Corpo della parola**: calcolato, non scelto.
  `min(84cqi / (n × em-per-carattere), 24cqi)` dentro il foglio (container
  `inline-size`), con `n` passato inline (`--imp-tecniche-n`) e 0,7 / 0,82 em
  per carattere a `wdth` 100 / 112,5. Occupa circa l'84% della larghezza del
  biglietto, rientro 8%, mai tagliata. Il foglio sta tutto dentro la zona:
  `inline-size: min(100cqi, 100cqb × 85/55)`.
- **Parole lunghe** (ux §5.3): oltre 12 caratteri sotto 768, oltre 18 sopra,
  si usa il primo nome.
- **Ancora `#tecniche`**: da 1024 l'arrivo lascia 80 px per la testata
  (`ANCORE.margineLargo`); il pin parte 80 px sopra la sezione
  (`margin-top: -80px`, dentro il piede vuoto della sezione precedente), così
  chi arriva trova il palco già fissato. Sotto 768 il titolo sta prima del pin
  e l'arrivo lo mostra a 24 px dall'alto.
- **Salto a una tecnica**: `progresso.vaiA(progressoSaltoTecnica(i))`, il
  fuoco resta sul bottone. Le ristampe attraversate si fondono.

### Composizione

| Larghezza | Palco |
|---|---|
| 1440 (da 1024) | titolo c1-c8 e intro c9-c12 in alto; biglietto grande c1-c8 (alto quanto resta, 779 × 504 a 1440 × 900); a destra, c9-c12, i quattro nomi con la corsa verticale e sotto la spiegazione, come una scheda accanto alla prova. Padding superiore = testata fissa + 32 |
| 768-1023 | colonna unica: titolo, fila dei quattro nomi, biglietto, spiegazione; padding superiore che lascia libero il bottone "Torna in Ciceri Lab" del sito (in alto a sinistra da 640) |
| 375 | titolo e intro prima del pin (scorrono via), nel palco: fila dei nomi brevi con la corsa orizzontale, biglietto largo 335, spiegazione a 16 px; padding inferiore di 72 px per il segnapagina e il bottone del sito in basso |

Ho spostato la spiegazione a destra su desktop (l'ux la metteva sotto il
foglio): con il titolo su due righe a 60 px, sotto il foglio restavano meno di
350 px per il biglietto a 1440 × 900; così il biglietto è largo 779 invece di
607 e l'occhio va dalla prova alla sua scheda.

### Accessibilità

- `section` con `aria-labelledby` sull'`h2` (`tabIndex -1` per l'arrivo alle
  ancore). Il biglietto è `aria-hidden`.
- Le quattro spiegazioni sono sempre nel DOM, in ordine (`ol` di `h3` +
  paragrafi), impilate nella stessa cella della griglia: altezza della più
  lunga, nessun salto di layout; quelle non in vista hanno `opacity: 0` (mai
  `display: none`), quindi il lettore di schermo le legge tutte. Ognuna ha
  prima delle tre righe la descrizione del rilievo (`rilievoAlt`) in `.imp-sr`:
  nessuna informazione solo nel rilievo o nel colore.
- Indice: `ol` con `aria-label` "Le quattro tecniche", bottoni veri alti
  44-48 px. La voce corrente ha `aria-current="true"`, ", in vista" per il
  lettore di schermo, peso 600 e "◂" su desktop, peso 600 e barra d'inchiostro
  di 3 px sotto su mobile (mai solo il colore). Le altre voci sono in
  `--imp-inchiostro-velato` (AA verificato dall'art-director). Su mobile il
  nome lungo resta al lettore di schermo, alla vista quello breve.
- Con la tastiera si esce dal pin tabulando oltre l'ultimo nome.
- "Torna al banco" compare solo se si è arrivati dal link "cos'è?" del banco
  (un `a[href="#tecniche"]` dentro `#banco`, ascoltato in cattura); porta a
  `#banco` con il delegato di `Impronta.tsx`.
- `forced-colors`: il foglio diventa un filo di sistema, il bordo del taglio
  `CanvasText`, la voce corrente sottolineata.

## 3. Reduced motion

`store.reducedMotion` → `TecnicheStatiche`: niente pin, niente
`useScrollProgress`, niente ristampe. Titolo e intro, poi quattro blocchi uno
sotto l'altro, ognuno con il suo biglietto già premuto nella sua tecnica
(`usePressione` con reduced motion dà lo stato finale subito) e la sua
spiegazione accanto (da 1024: biglietto c1-c7, testo c9-c12, blocchi alti
almeno 60svh; sotto: biglietto e testo impilati). Il taglio colorato è già
ruotato (`--imp-tecniche-giro: 1`). Rilievo `tracking: 'doc'`.

## 4. Verifica

- `npm run typecheck` (tutto `src/`) e `eslint` sui miei file: verdi.
- Dev server mio: `npx vite --port 8103 --strictPort`.
- Playwright (Chromium di `/opt/pw-browsers`, argomenti SwiftShader),
  screenshot in `/tmp/claude-0/shots-tecniche/`:
  - `{1440,768,375}-p{01,037,062,086,097}-gl0.png`: `?gl=0`, cinque punti
    del pin (secco, colore, lamina, inizio del giro, giro completo), ognuno
    catturato dopo che la ristampa è arrivata;
  - `1440-p02.png`: con lo shader acceso (`data-gl="on"`), parola premuta
    dallo shader nel foglio trasparente;
  - `768-p*-grafite.png`, `1440-p*-grafite.png`: carta Grafite;
  - `rm-375-*.png`, `rm-1440-*.png`: reduced motion (quattro blocchi statici).
- Nessuno scroll orizzontale (`scrollWidth` = larghezza) a 375, 768, 1440.
- Nessun errore in console tranne `ERR_TOO_MANY_RETRIES` dei font Google nel
  proxy della sandbox (scaffold §11.1, ambiente).

## 5. Note per altri agent

- **Headless**: con la fibra SVG e SwiftShader il ticker in Chromium headless
  gira a pochi frame al secondo, quindi una ristampa può impiegare secondi:
  chi fa screenshot delle Tecniche aspetti `data-tecnica` sul palco e
  `--imp-press` > 0,97 sulla parola.
- **shader-engineer**: la parola è `tracking: 'live'`, `priorita: 3`; nel taglio
  il blocco viene tolto dal registro (e rimesso tornando indietro), quindi il
  numero di blocchi cambia durante lo scroll. Il giro non serve allo shader.
- **section-builder-banco**: il link "cos'è?" deve essere un
  `<a href="#tecniche">` dentro `#banco`, così compare "Torna al banco".

---

## Giro 2

Voti di partenza (giuria): Tecniche 6/10. Fonti: `awwwards-jury.md` §5
(Tecniche) e riga del section-builder, `accessibility-auditor.md` A3 e B2,
`responsive-tester.md` punto 9, copywriter giro 2 (intro vuota),
motion-designer giro 2 (`data-imp-var`), orchestratore (long task).

### Cosa è cambiato

| Problema | Intervento |
|---|---|
| Split-header a 1440 (titolo a sinistra, paragrafo sollevato a destra) | Titolo in alto a sinistra (c1-c7), un solo blocco. L'intro, se il copy la dà, sta sotto il titolo; oggi `TECNICHE.intro` è vuota e il `<p>` non si rende |
| Lastra 780×500 con la parola al 60%, campo vuoto | Lastra 3:2 (679×453 a 1440, 910×607 a 2560) e parola all'85% della larghezza (574 px su 679): `85cqi / (n × em)`, em per carattere rimisurato con Anybody vero (0,8 a `wdth` 112,5, 0,71 a `wdth` 100) |
| Vuoti sopra e sotto la lastra | Desktop: riga della lastra `minmax(auto, 2/3 della larghezza)` accanto alla colonna destra (nomi + scheda, piede allineato al piede della lastra), blocco centrato nel palco. Mobile e tablet: la lastra cresce al massimo fino a 2/3 della sua larghezza, l'aria avanzata va tra i blocchi (`align-content: space-between`), non intorno alla lastra |
| Taglio colorato come filetto nero / wireframe | Pila vera: il biglietto in cima diventa Cotone 600 g (`data-carta="cotone"`), dietro altri sei; ruotando di tre quarti si vede la faccia di destra della pila, un blocco pieno di sette bordi dipinti affiancati (9 px ciascuno, 6 su mobile) con la riga dove un biglietto tocca l'altro e due toni alterni. Colore: il taglio della carta del sito (`--imp-taglio` fissato sulla sezione prima che il Cotone lo ridefinisca): Citrino sulla carta Cotone, verde notte sulla Citrino, Grafite sulla Cipria. Niente più contorno `.imp-taglio` sul fronte. La descrizione del rilievo per il lettore di schermo dice "carta Cotone" |
| A 375 si entrava nel pin senza titolo | L'h2 è sempre nel palco, in alto (30 px, due righe). Sui telefoni bassi (sotto 760 px) l'eventuale intro passa ai soli lettori di schermo |
| Indice con "◂" di testo | Tacca d'inchiostro 4 px sulla corsa verticale (desktop), barra 3 px sotto il nome (mobile), più peso 600 e ", in vista" per il lettore di schermo |
| A3: con finestra bassa o zoom 400% il pin taglia testo e prezzo | Resa statica anche con `(max-height: 34rem)`: `useMedia` su quella query, `ridotto \|\| bassa`. Verificato a 320×256: i quattro blocchi scorrono, tutto il testo si raggiunge |
| B2: salti "lamina" 43 e "taglio" 34 px | `min-inline-size: 44px`, centrati: a 375 misurano 52 / 76 / 44 / 44 px |
| Long task nello scroll (variabili scritte sul pin alto) | `--imp-tecniche-p` e `--imp-tecniche-giro` vanno solo sulle foglie marcate `data-imp-var` (la corsa e il biglietto), secondo il contratto del motion giro 2, e sono registrate con `@property … inherits: false`: cambiarle non ricalcola lo stile del resto della sezione. Le proprietà animate sono solo `transform` (corsa `scaleX/Y`, biglietto `rotateY`) e le ombre di `--imp-press` del fallback. La rotazione si applica solo con `data-tecnica="taglio"` |

### Misura dei long task nel pin

Playwright, Chromium senza argomenti SwiftShader, 390×844, `?gl=0`, CPU 4×
via CDP, rotella da 120 px ogni 60 ms per tutta l'altezza del pin,
`PerformanceObserver('longtask')`. Confronto A/B sugli stessi file
(variabili sul pin ed ereditate, contro foglie `data-imp-var` + `@property`
non ereditata), 6 giri ciascuno, alternati:

| | Long task per giro (media) | Somma per giro (media) | Max |
|---|---|---|---|
| prima | 5,3 | 441 ms | 170 ms |
| dopo | 1,7 | 116 ms | 103 ms |

Misura rumorosa (altri agent attivi, vite con HMR): in un giro "dopo"
preso durante una ricarica ci sono stati 12 long task, scartato. Il resto
dei long task non viene dalle variabili delle Tecniche (paint delle ombre
del fallback durante la ristampa, fibra SVG).

### Verifica giro 2

- `tsc` sul progetto: nessun errore nei miei file (in questo momento ce ne
  sono in `sections/Banco/Banco.tsx`, di un altro agent). ESLint sui miei
  file: verde.
- Dev server mio `npx vite --port 8109 --strictPort`, chiuso alla fine.
- Font veri via `page.route` + `curl` (Anybody e Hanken caricati).
- Screenshot in `/tmp/claude-0/shots-tecniche/`,
  `g2-{citrino,cotone}-{375,768,1440,2560}-p{01,037,062,086,097}.png`
  (secco, colore, lamina, inizio del giro, pila girata), ognuno preso dopo
  l'arrivo della ristampa; `g2-citrino-1440-gl-p037.png` e `-p097.png` con
  `?gl=1`; `g2-citrino-320-s{0..4}.png` (finestra 320×256, resa statica).
- Nessuno scroll orizzontale a nessuna larghezza.

### Scostamenti dichiarati

- Rotazione massima del taglio sotto 768: -24° invece di -18° (motion §6.3),
  perché a -18° la pila di 6 px per foglio si vedeva come una riga (la stessa
  critica della giuria). La parola a secco resta leggibile.
- La scheda su desktop è a destra della lastra e non sotto (già nel giro 1),
  ora col piede allineato al piede della lastra.

---

## Giro 3

Voto di partenza: Tecniche 7,5 (`awwwards-jury.md`, "Giro 2"). Tre difetti.

| Difetto | Intervento |
|---|---|
| "A secco" pallido in una lastra 680×450 quasi vuota (parola al 65%) | La lastra è una striscia 3:1 (679×226 a 1440, 335×112 a 375): la parola, all'85% della larghezza, ne occupa l'altezza utile. Nel ripiego CSS la parola a secco ha `--imp-rilievo: 1,6` (bisello più fondo), quindi si legge da lontano. Desktop ricomposto: colonna sinistra c1-c7 con titolo, lastra e sotto la scheda della tecnica; a destra, c9-c12, i quattro nomi all'altezza della lastra. Larghezza della lastra limitata da `(100svh - 26rem) × 3`, così titolo e scheda stanno sempre nella finestra. Correzione: da 1024 la zona è un contenitore solo in larghezza (prima la regola `size` generale la schiacciava sotto il biglietto) |
| Su Citrino il taglio si vedeva come un bordo scuro (verde notte = inchiostro) | Il bordo prende il colore di **un'altra carta del sistema**, mai l'inchiostro e mai la carta del sito: `CARTA_BORDO` nel componente mette `data-carta` sulla faccia della pila (Cipria sul Citrino; Citrino su Cotone, Cipria e Grafite) e il CSS usa fondo e ombra di quella carta (tinta calda, rosa ruggine su Citrino, giallo pieno su Cotone), con le righe tra un foglio e l'altro. Nessun token nuovo: sono i colori già in `tokens.css` |
| Col GL il testo restava indietro di uno stato rispetto all'indice | Un solo stato (`mostrata`) per parola, indice, titolo e righe, cambiato al fondo della ristampa con l'ultimo passo raggiunto (`ultimoPasso`). Se la platina tarda (ticker lento con lo shader in SwiftShader, scheda in secondo piano), una rete di sicurezza applica comunque l'ultimo passo alla fine della durata della ristampa (`RISTAMPA.risalita + discesa`, 690 ms). Scostamento dichiarato da motion §6.3: l'indice non cambia più all'istante del passo ma insieme al testo (170 ms dopo) |

Verifica: dev server 8109 (chiuso), font veri via `page.route` + `curl`,
screenshot `?gl=0` in `/tmp/claude-0/shots-tecniche/g2-{citrino,cotone}-{1440,375}-p{01,037,062,086,097}.png`
(gli ultimi scatti di questo giro: p01, p062, p097 rifatti dopo la correzione della zona),
tutti guardati. `tsc`: nessun errore nei miei file; ESLint sui miei file verde.
