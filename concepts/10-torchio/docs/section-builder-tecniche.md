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
