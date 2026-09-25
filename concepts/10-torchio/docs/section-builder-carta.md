# Section builder · La carta (`#carta`) · Concept 10 IMPRONTA

Ondata 3. File miei: `src/pages/concepts/impronta/sections/Carta/Carta.tsx`,
`carta.css`, questo documento. Nessun altro file toccato.

Letti prima: `DESIGN.md`, `scaffold-engineer.md`, `creative-director.md` (4.2
sezione 4), `ux-architect.md` (5.4, 6.5), `copywriter.md` + `content/testi.ts`
(`CARTA`, `CARTE`, `ORDINE_CARTE`, `ANNUNCI.carta`), `art-director.md` (costa
3 / 6 / 4 / 5 px, strisce a vivo, regole §3.4), `motion-designer.md` (6.4,
7.1), `interaction-designer.md` (§4 magnete, §5 anello interno, §7 onda),
`integrazione-sito.md`.

---

## 1. Cosa c'è

Design read: pagina di campionario di una tipografia; quattro carte come
campioni fisici stesi sul banco, a vivo, uno accanto all'altro, senza
canalini. Tutto il testo che conta è inchiostro nel DOM; il rilievo è solo
materia.

```
<section id="carta" class="imp-carta imp-block" aria-labelledby="…-titolo">
  <div class="imp-page">
    <header class="imp-carta__testa imp-griglia">  H2 "Tocca prima di scegliere" + riga Hanken
    <div role="radiogroup" aria-label="La carta del sito" class="imp-carta__gruppo imp-a-vivo">
      <button role="radio" aria-checked data-carta="citrino" class="imp-carta__striscia imp-ix-anello-interno">
        <span class="imp-carta__foglio imp-fibra imp-costa imp-ix-solleva">
          <span class="imp-carta__campo-secco" aria-hidden>  <span class="imp-carta__secco imp-secco">Citrino</span>
          <span class="imp-carta__scelta" aria-hidden>✓ la carta del sito</span>
          <span class="imp-carta__dati"> nome · grammatura · calibro + spessore · uso · descrizione · (sr) spessore
      … cotone, cipria, grafite
    <p class="imp-carta__campioni">  "Vengono da cartiere italiane…"
    <p class="imp-sr" role="status" aria-live="polite">  annuncio
```

Testi: solo `CARTA.titolo`, `CARTA.intro`, `CARTA.campioni`,
`CARTA.gruppoAria`, `CARTA.scelta`, `CARTA.spessoreSr(carta)`,
`CARTE[c].nome/grammatura/spessore/uso/descrizione/radioAria`,
`ANNUNCI.carta(carta)`. Nessuna stringa scritta nel componente.

## 2. Layout

| Larghezza | Forma | Dettagli |
|---|---|---|
| < 600 | 4 fasce orizzontali a vivo, alte max(120 px, 22svh) | colonna sinistra: nome a secco (decorativo) che riempie la sua colonna; destra: "✓ la carta del sito", nome, grammatura, calibro + spessore, uso. La descrizione resta per i lettori di schermo (`aria-describedby`) ma non si vede: a 375 la fascia non la regge |
| 600-1023 | fasce orizzontali, 3 colonne | secco / dati / descrizione (la descrizione "esce" da `.imp-carta__dati` con `display: contents`, l'ordine del DOM resta uno) |
| ≥ 1024 | 4 strisce verticali da 25vw, alte `clamp(34rem, 72svh, 54rem)` | il nome a secco corre in verticale (`writing-mode: vertical-rl`) lungo il bordo destro come il dorso di un campionario; in basso a sinistra nome, misure, uso, filetto e descrizione; in alto la scelta |

- **Corpo del nome a secco calcolato, non scelto.** Sotto 1024 il campo è un
  contenitore `inline-size` e il nome è `max(2rem, 22cqi)`: riempie la sua
  colonna e non tocca mai il testo accanto (prima versione a `17cqi` del
  foglio intero: a 375 e 768 il nome passava sotto i dati, visto negli
  screenshot e corretto). Da 1024 il nome si misura sul foglio (`container-type:
  size`): `min(14.5cqh, 30cqi)`.
- **Costa.** `.imp-costa` dell'art-director sul foglio (3 / 6 / 4 / 5 px) più
  una costa ferma in `::after` sul bottone: quando il magnete solleva il foglio
  di 2 px (`.imp-ix-solleva`), la costa ferma resta sotto e se ne vede un filo
  in più (interaction §4). Sotto 1024 le fasce si sovrappongono da Citrino a
  Grafite (z-index 4 → 1): la costa di ognuna cade sulla successiva.
- **Calibro.** Accanto allo spessore in mm, una barretta d'inchiostro alta
  esattamente `--imp-spessore` della carta: la grammatura si vede anche come
  segno. Decorativo (`aria-hidden`), la misura è anche in parole.
- **La carta scelta si confonde col sito**, apposta: diventa "il foglio".
  Restano il bordo interno d'inchiostro da 3 px (`::before`,
  `--imp-bordo-scelto`) e la scritta "✓ la carta del sito" (spazio sempre
  riservato con `visibility`, nessun salto quando la scelta si sposta).
- Nessun hex, solo `var(--imp-*)`; i colori di ogni striscia arrivano da
  `data-carta` sul bottone (tokens.css vale anche per `[data-carta]` interni).
  Nessuna ridefinizione di `color` / `text-shadow` sulle classi materiali.

## 3. Interazione e accessibilità

- `role="radiogroup"` con `aria-label` = `CARTA.gruppoAria` e
  `aria-describedby` sulla riga d'intro. Ogni striscia è un `<button
  type="button" role="radio">` con `aria-checked`, `aria-label` =
  `CARTE[c].radioAria` e `aria-describedby` = spessore (sr) + descrizione.
- **Fuoco mobile**: un solo radio tabulabile. Si entra sulla carta scelta;
  frecce (← ↑ indietro, → ↓ avanti, a giro), Home, Fine spostano **solo il
  fuoco** (`preventDefault`, niente scroll). Spazio, Invio o il tocco
  scelgono. Uscendo dal gruppo il fuoco mobile torna alla carta scelta
  (ux 6.5: il sito non cambia mentre si tabula). Verificato in Chromium:
  due frecce → fuoco su Cipria, sito ancora Citrino; Spazio → Grafite;
  Tab fuori e Shift+Tab dentro → fuoco sulla carta scelta; `scrollY` fermo.
- **Onda**: `cambiaCarta(carta, origineDaEvento(e), { root })` di
  `interaction/paperWave.ts`. Dal tocco parte dal punto toccato; da tastiera
  (`detail === 0`) dal centro della striscia. Mai `scegliCarta` diretto.
  Ritocco della carta già scelta: niente.
- **Annuncio**: a Promise risolta (onda finita, o dissolvenza di 200 ms con
  reduced motion) `ANNUNCI.carta(carta)` nella regione `role="status"
  aria-live="polite"` della sezione, solo se la carta del sito è ancora quella
  scelta qui (se un altro gruppo l'ha cambiata nel frattempo, annuncia lui).
  Un annuncio uguale al precedente riceve uno spazio indivisibile in coda,
  così viene ripetuto. Il fuoco non si sposta, la pagina non scorre.
- **Anello di fuoco**: `.imp-ix-anello-interno` (interaction.css), rientrato
  nella striscia nell'inchiostro di quella carta; il bordo della scelta sta a
  0, l'anello a 6 px: si leggono entrambi.
- **Pressione**: `usePressione` sul nome a secco di ogni striscia, profilo
  `CARTA.profilo` (= `PROFILI.cartaNome`: 640 ms, sfasamento 90 ms per indice,
  riposo 0,84), osservando il gruppo intero (entra al 30%): quattro colpi da
  sinistra a destra, dall'alto in basso su mobile. `{...ATTESA_PRESSA}` nel
  markup: il nome nasce piatto, niente lampo. Hover (solo puntatore non
  touch) e fuoco → `hover(true)`, il nome si preme a 1.
- **Magnete**: `useMagnete(foglioRef)` senza spostamento: solo `--imp-mag-t`,
  che `.imp-ix-solleva` traduce in 2 px di sollevamento. Puntatore fine e
  hover reale soltanto (lo decide `attachMagnete`).
- **Reduced motion**: la pressa è già completa (`usePressione`), niente
  sollevamento (interaction.css), niente transizioni proprie (doppia guardia:
  `data-motion="reduced"` e la media query), l'onda diventa la dissolvenza di
  paperWave. Verificato: clic su Cotone → `data-carta` cambia subito.
- Colori forzati: bordo della scelta in `Highlight`, filo attorno ai fogli,
  costa tolta.

## 4. Scelte consapevoli

| Punto | Documento | Scelta | Perché |
|---|---|---|---|
| Strisce e shader | ux 5.4 segna le strisce con ▒ (superficie dello shader) | le strisce sono fogli **opachi del DOM** sopra al canvas, non blocchi del registro; il nome a secco è rilievo CSS (`.imp-secco`, senza `.imp-relief`) | lo shader disegna sotto al contenuto: un foglio DOM opaco lo coprirebbe, e un blocco registrato col GL acceso diventa trasparente (relief-fallback.css). Quattro strisce da 25vw × 72vh userebbero metà degli 8 blocchi dello shader. Così la sezione è identica con `data-gl` pending / on / off, e verificata nei tre casi |
| Onda dietro le strisce | cd: "la stende su tutto il sito" | l'onda passa sul foglio del sito attorno alle strisce (titolo, riga dei campioni, resto della pagina); le strisce restano i loro campioni | sono campioni fisici: non cambiano colore. La striscia scelta si confonde col foglio a onda finita |
| Descrizione a 375 | ux 5.4 (375) non la mette | visibile da 600 px, sempre in `aria-describedby` | a 375 la fascia supererebbe i 22svh del wireframe |
| Tablet | ux 5.4 non lo disegna | fasce orizzontali fino a 1023, strisce verticali da 1024 | a 768 una striscia da 25vw è larga 192 px: il testo non ci sta con il nome verticale |
| Nome a secco verticale | ux 5.4 lo disegna orizzontale in cima | verticale lungo il dorso da 1024 | a wdth 150 / 60 px "Citrino" è più largo della striscia (≈ 300 px su 312 utili); in verticale riempie l'altezza, come l'etichetta di un campionario |
| Asse `wdth` del secco | secco-grande 112,5 / 112,5 / 150 | usato così (token) | nessuna deroga |

## 5. Verifica

- `npx tsc -p tsconfig.app.json --noEmit` e `npx eslint
  src/pages/concepts/impronta/sections/Carta`: verdi, nessun avviso.
- Dev server mio: `npx vite --port 8104 --strictPort`. Playwright Chromium
  (`/opt/pw-browsers`, `--use-angle=swiftshader --enable-unsafe-swiftshader
  --ignore-gpu-blocklist`), font di Google serviti via `page.route` + `curl`
  perché il Chromium della sandbox non li raggiunge.
- Screenshot in `/tmp/claude-0/shots-carta/`:
  - `carta-{375,768,1440}-{citrino,cotone,cipria,grafite}.png`: la sezione
    su ogni carta del sito;
  - `onda-{375,768,1440}[-gl0]-{140ms,300ms,460ms,fine}.png`: l'onda da
    Citrino a Grafite toccando la striscia Grafite, con il tempo della pagina
    rallentato 8 volte (`performance.now` e rAF avvolti nello script di
    prova) per fotografare i fotogrammi veri; con WebGL (`data-gl="on"`) e
    con `?gl=0` (velo DOM).
- Nessuno scroll orizzontale (`scrollWidth` = larghezza del viewport a 375,
  768, 1440). Annuncio letto dopo l'onda: "Carta Grafite 400 g. Tutto il
  sito ora è su Grafite.".

## 6. Per gli altri

- **section-builder-banco / indice**: i tre gruppi sono sincronizzati dallo
  store (`selCarta`); questa sezione annuncia solo i cambi partiti da qui.
- **shader-engineer**: nessun blocco registrato da questa sezione; nulla da
  disegnare sotto le strisce oltre al foglio e all'onda.
- **copywriter**: nessuna stringa mancante.

---

## Giro 2

Da `awwwards-jury.md` (Carta 7), `accessibility-auditor.md` (M4),
`responsive-tester.md` (intro rientrata). Solo `Carta.tsx` e `carta.css`.

| Richiesta | Fatto |
|---|---|
| Niente `writing-mode` verticale (tell 9.F, CD §4.5) | Il nome a secco è **orizzontale, enorme**, in testa a ogni striscia, e il bordo destro lo taglia come un campione tagliato dal foglio: `.imp-carta__campo-secco` arriva fino al bordo (margine negativo = padding) con `overflow-x: clip` e `overflow-y: visible` (ascendenti e discendenti interi, nessun `overflow: hidden` sulla riga a 0,86). Corpo sulla larghezza del foglio: 27cqi (< 600), 21cqi (600-1023), 44cqi (≥ 1024). Riempie anche la metà alta della striscia, prima vuota |
| Strisce a vivo a 2560 | Il gruppo è largo `100vw` e parte dal bordo della finestra (`margin-inline-start: (100vw - --imp-vw) / -2 - margine interno`), non più da `.imp-a-vivo` (che si fermava a 1680). Striscia alta `clamp(34rem, 72svh, 50rem)` |
| Intro allineata al margine interno | Titolo e riga Hanken nella stessa campata (c1-c7), stesso x |
| Filetto sotto "per tutto" (tell 9.F) | Tolto |
| Nomi a secco di Cipria e Grafite poco visibili | `--imp-rilievo` locale sul nome: 1,3 (Citrino, Cotone), 1,5 Cipria, 1,7 Grafite. Verificato a schermo su tutte e quattro con pressione a riposo 0,84 |
| "Da listino" a 375 | Le fasce ora hanno il nome enorme tagliato in testa e sotto due colonne (nome e misure / scelta e uso): stessa idea della 1440 |
| M4: le frecce spostano il fuoco ma non scelgono | Schema radio WAI-ARIA vero: le frecce (e Home/Fine) spostano il fuoco **e** scelgono; `aria-checked` segue subito, il sito segue quando ci si ferma per `INTERVALLO_MINIMO_MS` (450 ms, da paperWave): una raffica di frecce fa un'onda sola. Col tocco l'onda parte subito, salvo un'altra partita da meno di 450 ms (allora aspetta il resto; paperWave accoda comunque). Tab non cambia mai carta. Verificato: 3 frecce di fila → un solo cambio di `data-carta` (Grafite), annuncio a onda finita, `scrollY` fermo; uguale con reduced motion |

Verifica: dev server mio sulla 8108 (chiuso a fine giro). Font serviti via
`page.route` (curl, perché il fetch di Node non passa dal proxy della
sandbox). Screenshot di finestra, non di pagina intera: la cattura a pagina
intera ridimensiona la finestra e rifotografa i nomi a metà pressa (sembravano
spariti su Cipria e Grafite; con la cattura della finestra e la pressa finita
si vedono). In `/tmp/claude-0/shots-carta/giro2/`:
`carta-{375,768,1440,2560}-{citrino,cotone,cipria,grafite}-gl0.png` e
`carta-{375,768,1440,2560}-{cotone,grafite}.png` (WebGL acceso).
Typecheck e lint verdi.
