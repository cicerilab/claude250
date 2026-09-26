# Section builder · Per chi · Concept 10 · IMPRONTA

Ondata 3. Sezione 2, "Tre lavori sul bancone" (`#lavori`).

File miei: `src/pages/concepts/impronta/sections/PerChi/PerChi.tsx`,
`Pezzo.tsx`, `per-chi.css`, questo documento. Nessun altro file toccato.

Letti: DESIGN.md, creative-director §2, ux-architect §5.2 / §6.8 / §7,
copywriter (`PER_CHI`, `ANNUNCI`, §6 rilievi), art-director §3 (`.imp-foglio`,
`data-carta`, regole), motion-designer §6.2 (`PROFILI.perChiPezzo`,
`PER_CHI.rotazioni`), interaction-designer §4 e §8 (`useSwipeDeck`),
webgl-artist §10 e §12 (layer a `selettore`), scaffold-engineer §4-§6,
integrazione-sito.md, le skill design-taste-frontend e full-output-enforcement.

---

## 1. Cosa c'è sullo schermo

**≥ 1024 px (disegnata a 1440).** H2 e intro in colonna (niente split-header).
Sotto, tre oggetti veri sparsi sul foglio del sito, **a scala vera fra loro**:
una sola unità `--imp-perchi-mm` (px per millimetro, tarata perché i 150 mm
della copertina riempiano 4 colonne) dà partecipazione 148×105 (c1-c4),
biglietto 85×55 (c6-c8, abbassato di ~2u) e copertina 150×210 (c9-c12,
abbassata di ~0,5u). Rotazioni -2°, 1,5°, -0,5°. Didascalia in inchiostro
sotto ogni oggetto, sul suo bordo sinistro, mai su una linea comune.

**< 1024 px (375 e 768).** Mazzo di `useSwipeDeck`: scroll-snap nativo, un
pezzo per volta. A 375 il posto è largo `100vw − margine − passo − 44px`
(300 px), il successivo sporge di ~43 px con il suo oggetto allineato a
sinistra, e la busta della partecipazione passa sotto al biglietto: si capisce
che si sfoglia. Una "tavola" di altezza comune tiene le didascalie alla stessa
quota. Sotto: `nav` con ‹, i tre `nomeBreve` come bottoni (`aria-current`,
sottolineato e 600), ›. A 768 due pezzi quasi interi in vista.

## 2. I pezzi (Pezzo.tsx)

Ogni pezzo è un `<article aria-labelledby=h3>` con:
- `.imp-perchi__tavolo` `aria-hidden`: l'oggetto composto in DOM sulla sua
  carta (`.imp-foglio imp-relief` + `data-carta` del preset), fibra, costa e
  ombra di appoggio dell'art-director. Nessuna scheda, nessun bordino.
- `.imp-sr` con `pezzo.alt` (copywriter §6): **nessuna informazione solo nel
  rilievo**. Didascalia visibile: `titolo` (h3), `perChi`, `righe`, `prezzo`,
  "Prova la tua".

Composizione (i testi sono solo `PER_CHI.pezzi[].rilievo`):

| Pezzo | Carta | Righe | Materiale DOM / tecnica GL |
|---|---|---|---|
| partecipazione | cipria | nomi · si sposano · data · luogo | nomi `.imp-secco`/`secco` 1; il resto `.imp-inchiostro`/`colore` 0,3 |
| biglietto | cotone | nome · mestiere | nome `.imp-caldo`/`lamina` 1; mestiere `colore` 0,3 |
| libro (copertina) | grafite | titolo · autore · poesie | tutto `colore` (inchiostro bianco di Grafite) |

Dettagli d'oggetto, perché siano oggetti e non rettangoli:
- **busta** sotto la partecipazione ("100 con busta"): secondo pezzo Cipria
  162×114, +3°, con la patta a V in `cordonatura` (layer `svg`, stesso path
  nel DOM). Registrata prima della partecipazione (componente figlio: layout
  effect prima) → nello shader sta sotto (webgl-artist §4).
- **copertina**: cerniera della brossura (layer `linea` verticale a 6,6%,
  `cordonatura`); taglio delle pagine (carta Cotone) che spunta 5 px a destra
  e in basso **fuori** dal rettangolo del pezzo, così con GL acceso il DOM non
  copre la copertina disegnata.
- Corpi in `cqi` (il pezzo è un contenitore `inline-size`), mai sotto 14 px
  (Anybody mai sotto 20 px).

Registrazione (scaffold §5 caso B): `useRelief` sull'elemento interno
**non ruotato**; la rotazione è su `.imp-perchi__foglio` (proprietà `rotate`
da `--imp-perchi-rot`) e in `spec.rotazione`. Layer `text` con `selettore`
`[data-strato="<ruolo>"]` (metrica e posizione dal DOM; `x/y/w/h` sono solo il
ripiego). `tracking: 'doc'` sopra 1024, `'live'` nel mazzo (al massimo 3 blocchi
visibili insieme: due pezzi e la busta, sotto `MAX_LIVE` 4).
Con `data-gl="on"` il CSS rende trasparenti i figli materiali del pezzo e
nasconde cerniera e patta (lo sfondo lo spegne relief-fallback.css).

## 3. Movimento

`usePressione(ref, { profilo: PER_CHI.profilo, reliefId, indice, osserva:
sezioneRef })`: ingresso quando la **sezione** entra al 30%, sfasamento 150 ms
per indice (la busta con l'indice della partecipazione), riposo 0,86. Hover
(solo puntatore non touch) e fuoco dentro l'articolo si sommano e chiamano
`hover(true|false)`: pressione a 1 con la molla morbida, niente spostamento,
niente scala. Rotazioni statiche. Reduced motion: tutto premuto subito (lo fa
`usePressione`), mazzo senza scorrimento morbido (interaction.css). Nel mazzo
lo swipe è scroll nativo, nessuna animazione aggiunta. Ho scelto `hover()` del
motion al posto di `useMagnete(onVicinanza)` dell'interaction (§4): stesso
effetto, una sola sorgente della pressione.

## 4. "Prova la tua"

Link `a[href="#banco"]` in lamina (`.imp-lamina imp-ix-premibile`), etichetta
visibile `COMUNI.provaLaTua`, `aria-label` = `provaAria` del pezzo (contiene
l'etichetta visibile). Al clic, prima del clic delegato di Impronta.tsx che fa
il viaggio a `#banco`:
1. `aggiornaProva({ prodotto, tecnica, taglioColorato: false, tiratura,
   legatura? })` con il `preset` del copywriter; la tiratura è quella della
   didascalia (100 / 100 / 50) e il libro riparte in brossura: il banco
   ritrova lo stesso oggetto allo stesso prezzo "da". I campi scritti restano.
2. `cambiaCarta(preset.carta, bottone)`: l'onda parte dal bottone (mai
   `scegliCarta` diretto). La carta del banco è la carta del sito (ux §6.5).
3. `ANNUNCI.bancoImpostato(prodotto, carta)` nella regione `aria-live`
   locale della sezione (lo scaffold non ha una regione di pagina).

## 5. Accessibilità

`section aria-labelledby` → h2; `ul role=list` di tre `li` > `article`, letti
in fila; ogni oggetto `aria-hidden` con il suo alt `.imp-sr`; nav del mazzo
con `aria-label` `PER_CHI.fila.aria`, frecce 44×44 con `aria-label` e
`aria-disabled` ai bordi, nomi 44 px di altezza; frecce ←/→ e fuoco nella
fila gestiti da `useSwipeDeck`; annuncio `lavoroInVista(titolo, n)` quando
cambia il pezzo in vista. Forced colors: bordo di sistema sui pezzi.

## 6. Verifica

- `npm run typecheck` verde; `eslint` sui miei file verde.
- Dev server mio: `npx vite --port 8102 --strictPort`. Playwright (Chromium di
  `/opt/pw-browsers`, SwiftShader) a 375, 768, 1440, con e senza `?gl=0`, e
  con reduced motion. Screenshot in `/tmp/claude-0/shots-per-chi/`.
- Con i flag SwiftShader il WebGL dello shader-engineer si accende
  (`data-gl="on"`): partecipazione e busta premute, patta in cordonatura,
  nome del biglietto in lamina, copertina con cerniera; i fantasmi DOM sono
  trasparenti e il taglio delle pagine resta DOM fuori dalla copertina. Su
  SwiftShader la cottura delle maschere richiede diversi secondi: a 2 s la
  copertina non c'era ancora, a 15 s sì (`per-chi-1440-gl-attesa*.png`).
- Screenshot: `per-chi-{375,768,1440}-gl0(-b).png` (rilievo CSS),
  `per-chi-{375,1440}-gl(-b).png` e `per-chi-1440-gl-attesa(-b).png` (WebGL),
  `per-chi-375-gl0-ridotto(-b).png` (reduced motion: tutto già premuto).
- In headless i font Google a volte non arrivano (proxy, scaffold §11.1):
  alcune catture sono con i ripieghi tarati.

## 7. Stringhe e note per altri agent

- **copywriter**: nessuna stringa mancante. `PER_CHI.fila.inVista` non serve
  (l'annuncio usa `ANNUNCI.lavoroInVista`); si può togliere o tenere.
  La tiratura con cui parte il banco (100/100/50) sta in `PerChi.tsx`
  (`TIRATURA_DEL_PEZZO`): se cambiano le didascalie, va allineata.
- **section-builder-banco**: arrivo dal pezzo = prodotto, tecnica, tiratura,
  legatura e carta già nello store; `bancoImpostato` è già annunciato da me,
  non ripeterlo (eventuale `ANNUNCI.prodotto` del banco su cambio da store si
  sommerebbe: meglio annunciare `prodotto` solo sui cambi fatti nel banco).
- **shader-engineer**: tre pezzi `kind: 'piece'` + la busta; `layers` di tipo
  `text` (con `selettore`), `svg` (patta, `cordonatura`) e `linea` (cerniera).
  Il taglio delle pagine è DOM fuori dal pezzo, non va nello shader.
- **accessibility-auditor**: provare l'anello di focus sul "Prova la tua"
  su Grafite (lamina con bordo `--imp-lamina-bordo`).

---

## Giro 2

Voti del giro 1: Per chi 6,5 (awwwards-jury §5), più responsive-tester
(punti 2, 3, 5), accessibility-auditor M1, shader-engineer ("Chiara Zanin").
Cosa è cambiato, solo nei miei tre file:

| Critica | Correzione |
|---|---|
| Tre bottoni "Prova la tua" in lamina in fila | Via. Sotto ogni pezzo un **link testuale** d'inchiostro (`imp-ix-link` + freccina disegnata col bordo) con il testo `provaAria` del copywriter: "Prova la tua partecipazione", "Prova il tuo biglietto", "Prova il tuo libro". Anche l'**oggetto è cliccabile** (clic sul tavolo = clic sul link; tastiera e lettori usano il link). Nessun bottone nella sezione. |
| "Noncello" tagliato (1440, 2560) | Titolo a 10,5cqi, wdth 112,5, a capo parola per parola: sta nei 76cqi interni della copertina a ogni larghezza (verificato con script: nessun figlio del pezzo supera il bordo, 375-2560). |
| Copertina enorme e vuota | Copertina al 70% della partecipazione; "poesie" in testa con filetto come nome di collana, titolo sotto, autrice al piede. |
| Biglietto minuscolo e isolato | Biglietto a 0,82 della partecipazione (≈ 310 px a 1440), **appoggiato sull'angolo** della partecipazione e sovrapposto di ~40 px (i pezzi si toccano, sono sul bancone). Nel mazzo 84% del posto. |
| "Chiara Zanin" esce dal biglietto | Nome a 9,6cqi (≈ 72cqi di riga, 82cqi disponibili). |
| Tre blocchi di testo uguali (la card tornata) | Didascalia da catalogo: nome (Anybody 20-22), una nota di due righe ("per chi si sposa." in 600 + righe velate), prezzo, link. Posizioni diverse: partecipazione sotto a sinistra, biglietto sotto il biglietto più in basso e rientrato, copertina **a bandiera destra** sotto il libro. |
| Composizione a 1440 | Tutti i posti in una sola cella della griglia, posizionati in frazioni di `--_p` (4 colonne): scala coerente fino a 2560, nessuna colonna vuota fissa. |
| Frecce coperte dai fissi (375, 768) | Nomi e frecce **sopra** la fila, subito dopo l'intro: con la sezione in vista non stanno più nella fascia dei fissi in basso. Sotto la fila, `padding-block-end` = piede + altezza del segnapagina. |
| Copertina vuota col GL a 2560 | `priorita` 4 ai tre pezzi e 2 alla busta (blocks.ts sceglie per priorità); le mie regole di trasparenza hanno `:not([data-imp-gl="fuori"])`: se il GL non disegna un pezzo, il DOM resta visibile. Il fondo del pezzo in quel caso dipende da `relief-fallback.css` (art-director). |
| M1, annuncio doppio Cipria/Citrino | Al clic prima `cambiaCarta(...)`, **poi** (a onda finita) `aggiornaProva`. Se il prodotto cambia annuncia il banco (Banco.tsx, carta già scambiata: giusta); se è lo stesso il banco tace e annuncio io `bancoImpostato`. Un solo annuncio, con la carta giusta. Il banco si aggiorna ~700 ms dopo il clic, mentre la pagina sta ancora viaggiando. |

Stringhe: la "collana" chiesta dalla giuria non c'è in `testi.ts`; uso
`rilievo[2]` ("poesie") come nome di collana. Se il copywriter vuole un nome
vero (per esempio una collana della casa editrice), va aggiunto a
`PER_CHI.pezzi[2].rilievo` e a `alt`.

Verifica giro 2: server mio `npx vite --port 8107 --strictPort` (chiuso alla
fine), Playwright con i font serviti da `page.route` + `fetch` di Node.
Screenshot in `/tmp/claude-0/shots-per-chi/giro2/`:
`{375,768,1440,2560}-{citrino,cotone}-{gl0,gl}(-b).png`.

Esito visivo giro 2: con `?gl=0` su Citrino e Cotone, a 375/768/1440/2560,
niente testi tagliati (controllo automatico sui figli dei pezzi), biglietto
appoggiato sulla partecipazione, copertina piena, frecce del mazzo sopra la
fila. Col GL (SwiftShader) a 2560 la copertina ora è disegnata (titolo,
collana, autrice). A 1440 GL una cattura mostra i pezzi del GL ~35 px sotto il
DOM: il registro ha le misure giuste (`rectDoc` = posizione vera, verificato
dal browser), quindi è il fotogramma in ritardo di SwiftShader dopo lo scroll,
non il layout. Da ricontrollare su GPU vera (shader-engineer).
Typecheck e lint verdi.

---

## Giro 3

- **375, spazio per i fissi**: sotto i 1024 px la sezione finisce con piede +
  `--imp-segnapagina-h` (56 px) + `env(safe-area-inset-bottom)`: l'ultimo
  link non resta sotto "Torna in Ciceri Lab" né sotto il segnapagina.
- **Biglietto Cotone "bianco"**: nel DOM il biglietto prende
  `--imp-superficie` della sua carta (Cotone #E2E3DF), non il bianco; con il
  GL il fondo DOM è spento da relief-fallback.css e la carta la disegna lo
  shader. Profondità del pezzo portata a 1 (nome in lamina più presente). Se
  col GL resta pallido, la resa della lamina su Cotone è dello
  shader-engineer: il layer del nome è già `lamina`, profondità 1.
- **Sovrapposizione**: controllo automatico (rettangoli dei testi della
  partecipazione contro il biglietto) da 1024 a 2560. A 1024 il biglietto
  copriva "Duomo di San Marco" (i corpi del pezzo toccano i 14 px minimi):
  tra 1024 e 1279 px il biglietto scende a 0,66·p e rientra a 0,93·p, e ora
  copre solo carta vuota a ogni larghezza provata (1024, 1100, 1200, 1280,
  1366, 1440, 2560).
- Link al banco: `inline-block` con la freccina in linea, così a capo resta
  attaccata all'ultima parola (1024).
- Screenshot: `/tmp/claude-0/shots-per-chi/giro3/{375,1440}-{citrino,cotone}-gl0(-b).png`,
  più `1024`, `2560` Citrino e `*-verifica.png`. Server 8107 chiuso;
  typecheck e lint verdi.
