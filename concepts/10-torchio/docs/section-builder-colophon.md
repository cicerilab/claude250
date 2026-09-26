# section-builder-colophon · 8 · Colophon (`#colophon`)

Ondata 3. File di proprietà:
`src/pages/concepts/impronta/sections/Colophon/Colophon.tsx`,
`src/pages/concepts/impronta/sections/Colophon/colophon.css`, questo documento.

## 1. L'idea

L'ultima pagina di un libro ben fatto, non un footer a colonne. Dice di cosa è
fatto il sito (caratteri, carta attiva con grammatura, stampa a secco,
Pordenone), dà l'indice e i due comandi finali, poi chiude il foglio con il
**marchio IMPRONTA premuto a secco su tutta l'area viva**: il sigillo
dell'editore in fondo al volume. Sotto il sigillo, la riga di piede: bottega e
città, la finzione dichiarata, la firma del concept con link a cicerilab.com.

Ordine nel DOM (e di lettura):

1. `h2` "colophon" (voce `titolo-2`, assi fissi di `base.css`, `tabIndex=-1`
   per l'arrivo dall'ancora);
2. la frase `COLOPHON.testo(carta)` in `lead`, 44ch, con **nome e grammatura
   della carta attiva in `<strong>`** (il testo resta quello del copywriter, si
   aggiunge solo l'evidenza); cambia secco con `data-carta` (motion §6.8);
3. `COLOPHON.secondaRiga` in `piccolo`;
4. comandi: "Prova la tua" (`.imp-lamina`, uno dei tre usi ammessi della
   lamina, `href="#banco"`, `aria-label` = `TESTATA.provaAria`) e
   "Ricomincia da capo" (bottone di carta con filo d'inchiostro 1 px);
5. `nav` "Indice del sito" (`COLOPHON.indiceAria`) con titolo visibile
   `indice` (`h3` in Hanken 600, non Anybody: è un'etichetta, non un titolo) e
   le sette voci di `COLOPHON.indice`;
6. `address` con i recapiti di esempio: indirizzo → Maps (nuova scheda,
   freccia del vector-artist, "si apre in una nuova scheda" in `.imp-sr`),
   telefono (`tel:` inesistente), email (`.example`);
7. sigillo: marchio a secco (decorativo, `aria-hidden`: `RILIEVI.marchio` è
   `decorativo: true`);
8. riga di piede: `COMUNI.marchioSotto` + `COMUNI.citta`, `COLOPHON.finzione`
   (nota 14 px), `COLOPHON.conceptDi` → `CICERILAB_URL` (nuova scheda) e
   `COMUNI.tornaLab` → `LAB_URL` (`aria-label` = `COMUNI.tornaLabAria`).

Tutti i testi vengono da `content/testi.ts`; nessuna stringa visibile scritta
nel componente.

## 2. Gabbia

| Larghezza | Disposizione |
|---|---|
| < 600 (4 col.) | tutto impilato; comandi a larghezza piena (52 px); voci dell'indice alte 48 px; recapiti su tre righe da 44 px |
| 600-1023 (8 col.) | stampa su 5 colonne, indice su 3 accanto; recapiti su una riga; piede: bottega 3 col., finzione 5, firma sotto su una riga |
| ≥ 1024 (12 col.) | stampa col. 1-6, indice col. 8-11, margine esterno vuoto; sigillo largo l'area viva (1181 px a 1440, alto 125); piede in tre campate 3 / 4 / 4 |

Blocchi ancorati al margine interno, niente centrato, niente filetti.

**Spazio in fondo** (`--_imp-colophon-fondo`):
- < 640: `segnapagina (56) + 14 + 44 + 32 + area sicura` = 146 px: il bottone
  fisso "Torna in Ciceri Lab" (in basso a sinistra) e il segnapagina cadono
  nella carta vuota, mai sopra l'ultimo link (verificato a 375: ultimo link
  a ~645 px, bottone a 764 px su 812);
- 640-1023: `segnapagina + 48 + area sicura`;
- ≥ 1024: `clamp(64px, 12vh, 128px)` (ux-architect §5.8, piede 12vh).

## 3. Il sigillo a secco

- `useRelief(ref, { kind: 'svg', svg: marchioImpronta, tecnica: 'secco',
  profondita: 0.9, tracking: 'doc', priorita: 1 })` e
  `usePressione(ref, { profilo: COLOPHON.profilo })` (= `PROFILI.colophonFirma`,
  600 ms, innesco al 15% dal fondo). `ATTESA_PRESSA` nel markup, classe
  `imp-relief` messa a mano (è `useRelief`, non `ReliefText`).
- **Fallback CSS** (`data-gl` pending/off): l'SVG (`?url`) come maschera su un
  fondo `color-mix(carta, secco-fondo, 100% × --imp-press)`; due
  `drop-shadow` sul contenitore (la maschera taglierebbe un filtro sullo stesso
  elemento): ombra `--imp-carta-ombra` verso la luce, labbro
  `--imp-carta-luce` dall'altra parte, passo `clamp(1px, 0.17vw, 2.6px) ×
  press × rilievo` proiettato su `--imp-luce-x/y` (la lampada di `light.ts` lo
  fa girare). Stesso linguaggio di `.imp-secco`.
- Con `data-gl="on"` il fantasma perde filtro e solco (`visibility: hidden`):
  lo disegna lo shader (verificato: in headless con SwiftShader il GL si accende
  e il marchio compare premuto nel canvas).
- `prefers-contrast: more` → solco in inchiostro pieno; `forced-colors` →
  `CanvasText`.

## 4. "Ricomincia da capo"

Conferma in linea, niente popup (ux-architect §5.8):

1. clic → il bottone lascia il posto a un gruppo (`role="group"`,
   `aria-labelledby` sulla domanda `COLOPHON.ricomincia.domanda`) con
   "Sì, ricomincia" (inchiostro pieno) e "No, lascia così"; il fuoco va su "Sì";
   Esc o "No" chiudono e riportano il fuoco sul bottone;
2. "Sì": se la carta attiva non è quella di partenza,
   `await cambiaCarta(cartaPredefinita(), bottoneSì)` (onda dal punto
   toccato; con reduced motion la dissolvenza la decide `paperWave.ts`), poi
   `ricominciaDaCapo()` (carta, bozza, testo inviato); durante l'onda i due
   bottoni sono disabilitati;
3. esito `COLOPHON.ricomincia.fatto` in un `<p role="status" aria-live="polite">`
   sempre presente nel DOM (vuoto a riposo), fuoco di nuovo sul bottone.

Nessuna animazione della conferma (motion §6.8); i blocchi già premuti restano
premuti.

## 5. Movimento

Il colophon è fermo. L'unico movimento è la pressa del sigillo (600 ms, il colpo
più leggero). Con reduced motion `usePressione` lo porta subito a riposo;
nessuna transizione propria (le poche ereditate da `imp-ix-*` sono già spente
da `interaction.css`, e il CSS di sezione le riazzera per sicurezza).

## 6. Verifiche

- `npm run typecheck`: nessun errore nei miei file; `eslint` sulla cartella
  `sections/Colophon`: pulito.
- Playwright (Chromium di `/opt/pw-browsers`, args SwiftShader), dev server
  mio su 8108, schermate in `/tmp/claude-0/shots-colophon/`:
  375, 768, 1440 (GL acceso e `?gl=0`), Grafite 1440, Cipria 375 con la
  domanda aperta, Cipria 768 dopo "Sì, ricomincia" (torna Citrino, messaggio
  visibile), 375 con reduced motion. Nessuno scroll orizzontale
  (`scrollWidth` = larghezza).
- I font Google nel contenitore a volte non arrivano (proxy): alcune schermate
  usano i ripieghi tarati; il layout regge.

## 7. Note per altri

- **copywriter**: `COLOPHON.ricomincia.fatto` dice "tornato su Citrino", ma
  `cartaPredefinita()` è Grafite per chi ha il sistema scuro. Se si vuole
  esatto, serve un `fatto(carta)`; il componente oggi usa la stringa fissa.
- **testata**: quando il colophon è in vista la voce corrente resta "bottega"
  (ux §2: le sezioni senza voce accendono la precedente): coerente.
- Il link "← Torna in Ciceri Lab" nel testo porta a `LAB_URL` (`/`): al porting
  va verificato insieme a `core/links.ts` (scaffold §11.3).

---

## Giro 2

Voti del giro 1: Colophon 4/10 (awwwards-jury §2 "Colophon", §5). Interventi
applicati, solo nei miei file.

### Bug del sigillo (A, responsive-tester §1, jury Usabilità 1)

Causa: `--imp-segno: url(${marchioUrl})` senza virgolette; in build Vite
inlinea l'SVG come data URI con apici singoli, la dichiarazione diventava non
valida e la maschera `none`, quindi rettangolo grigio pieno. Invece di
aggiungere solo le virgolette ho tolto la maschera: il sigillo di ripiego ora
è un **SVG in linea** con il `path` del marchio (estratto da `marchioImpronta`
`?raw` con una regex sulla stringa, a livello di modulo solo lavoro su
stringhe). Così spariscono anche l'import `?url` e il marchio doppio nel bundle
(performance-auditor P3, parte colophon).

### Rilievo profondo (jury: "marchio pallido")

Filtro SVG con ombra e luce **interne** (id per istanza da `useId`): parete in
`--imp-carta-ombra` verso la luce (offset 2,2/2,6 unità, sfocatura 0,9), labbro
in `--imp-carta-luce` dall'altra parte (1,1/1,3, 0,35), fondo del solco =
`secco-fondo` scurito del 14% verso l'ombra; opacità e fondo scalano con
`--imp-press`. Un filo di luce esterno (drop-shadow) segue `--imp-luce-x/y`.
Con `data-gl="on"` l'SVG è `visibility: hidden` (lo disegna lo shader,
`profondita` salita a 1). `prefers-contrast: more` → inchiostro pieno;
`forced-colors` → `CanvasText`.

### Ricomposizione da colophon di libro

- Tutto **sull'asse della gabbia** (centro dell'area viva di `.imp-page`, non
  dello schermo). Scostamento consapevole da DESIGN "mai centrato", chiesto
  dalla giuria: è l'unica pagina centrata, come il colophon di un volume.
- Titolo `h2` piccolo e largo (Anybody 22-30 px, wdth 150, 800).
- Frase in Hanken 18 → 21 (`lead`), 31em, `text-wrap: balance`, carta in
  `<strong>`; seconda riga in `.imp-piccolo`.
- Indice **in una riga** di voci separate da spazio (h3 "indice" solo per
  lettori di schermo; il `nav` ha `aria-label`), ogni voce alta 44 px.
- **Un solo bottone**: "Prova la tua" in lamina. "Ricomincia da capo" è un
  comando scritto come link (resta `<button>`); anche "Sì, ricomincia" /
  "No, lascia così" sono link-bottone. Esito con
  `COLOPHON.ricomincia.fattoCarta(carta)` (la carta a cui si torna davvero,
  Citrino o Grafite).
- Il sigillo è il fotogramma finale grande; sotto, una riga "tipografia e
  legatoria · Pordenone" e la riga dello stampatore, piccola e raccolta:
  indirizzo → Maps, "Chiama la bottega", "Scrivi alla bottega"
  (`COLOPHON.telefono` / `COLOPHON.email`: niente numero né `.example` a
  vista), finzione (`.imp-nota`), firma "Un concept di Ciceri Lab" →
  cicerilab.com e "← Torna in Ciceri Lab".

### Altri punti

- SEO 5.1.C: spazi veri tra i frammenti ("tipografia e legatoria Pordenone",
  voci dell'indice, recapiti, firma); il "·" è un `::before` decorativo.
- Accessibilità (fuoco coperto, WCAG 2.4.11): `scroll-margin-block` su tutti i
  link e bottoni del colophon (testata fissa sopra; segnapagina e bottone del
  sito sotto su mobile).
- Accessibilità B4: la freccia inline perde il suo `id` (niente id duplicati).
- Performance P4: uso `.imp-piccolo` / `.imp-nota` di `base.css` invece di
  ridichiarare la terna tipografica dove possibile.
- Font nelle prove: `page.route` sui domini Google, servito con `curl` da
  Node (i font arrivano: `document.fonts.check` vero).
- Durante il giro altri file erano a metà (Tecniche senza `default`,
  Legatoria con un errore di tipo): server riavviato a ogni rottura, nessun
  intervento sui loro file.

Schermate: `/tmp/claude-0/shots-colophon/g2/` (375, 768, 1440, 2560 × Citrino,
Cotone × GL e `?gl=0`, più la domanda aperta a 375 e reduced motion).

---

## Giro 3

- **Marchio a 375 più grande**: sotto 600 px il sigillo va su due righe,
  IMPR / ONTA, alla stessa scala (ONTA a tutta area viva, IMPR all'82%): da
  335 × 36 a 335 × 65 + 276 × 65. Sono due finestre sul path del marchio
  (`viewBox` 0-423 e 427-941, il taglio cade nel vuoto tra R e O); ogni riga è
  registrata come rilievo SVG con il suo markup a finestra, così lo shader
  disegna le stesse due righe. Da 600 px resta il marchio intero (l'altra
  variante è `display: none`, misura 0 × 0).
- **Vuoto finale ridotto**: piede a 1024+ da `clamp(64, 10vh, 96)` a
  `clamp(48, 6vh, 64)`; 640-1023 da segnapagina + 48 a + 24; sotto 640 da
  146 a 130 px (resta lo spazio per "Torna in Ciceri Lab" e per il
  "Prova la tua" fisso in basso a destra: l'ultimo link finisce sopra
  entrambi); stacco sigillo → riga dello stampatore da 64 a 48.
- **Link di salto sopra il testo**: non è un difetto della pagina ma delle
  catture a pagina intera (Chromium allarga la finestra e i fissi finiscono
  dentro il ritaglio). Misurato dal vivo: senza fuoco i due `.imp-salto` hanno
  `bottom = -36 px` (fuori dallo schermo), compaiono solo con il fuoco
  (`base.css`, scaffold). Da questo giro le schermate sono della finestra, non
  a pagina intera.
- Spostamento di 30 px del marchio col GL a 1440: dello shader-engineer.

Schermate: `/tmp/claude-0/shots-colophon/g3/` (375 e 1440, Citrino e Cotone,
`?gl=0`, `-testa` e `-fondo`).
