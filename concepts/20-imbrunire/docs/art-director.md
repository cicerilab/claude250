# Art director · Concept 20 · IMBRUNIRE

Ondata 2. Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, riga e paragrafo 20 di `docs/matrice-concept-11-20.md`,
tutti i doc dell'ondata 1 in `concepts/20-imbrunire/docs/` (creative-director,
trend-researcher con i quattro `taste/*.md`, brand-strategist, ux-architect,
tech-architect), `concepts/10-torchio/DESIGN.md` e `docs/art-director.md` (solo
formato), la skill `design-taste-frontend`. Ho letto anche i file già scritti
dagli altri agent dell'ondata 2 (`motion/variabili.ts`, `motion/useParallasse.ts`,
`interaction/useSelezioneLune.ts`, `content/testi.ts`) per allineare i nomi.

## File consegnati

| File | Contenuto |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: tema, palette con ruoli, tipografia, componenti, layout, profondità, do/don't, responsive, guida per agent |
| `src/pages/concepts/imbrunire/styles/tokens.css` | `@font-face` di ripiego tarati; colori (con terne RGB), ruoli, scala tipografica fluida, spazi, geometria del palazzo e della scatola 3D, materiali (grana, pareti, soffitto, travi, pavimento), veli delle luci, lune, livelli; varianti torre, tablet, schermo basso, schermo grande, contrasto forzato |
| `src/pages/concepts/imbrunire/styles/tokens.ts` | `COLORI`, `FONT_CSS_URL`, `FONT_DA_CARICARE`, `FAMIGLIE`, soglie e media query, `LUNE` + `misureLune()`, `Z`, `PALAZZO` + `spessori()`, `geometriaPalazzo()`, `larghezzaPalazzo()`, `SCATOLA` + `misureScatola()`, `VELI`, `UI`. Modulo puro |
| `src/pages/concepts/imbrunire/styles/luna.css` | la luna generata: disco in ombra, parte illuminata, stati vuota / stasera / scelta / chiusa / cielo, contrasto forzato |

**Verifiche fatte**
- `tsc --strict --noUncheckedIndexedAccess --noUnusedLocals --noUnusedParameters` su `tokens.ts`: verde.
- Pagina di prova (scratch, fuori dal repo) che usa i **veri** `tokens.css` e
  `luna.css` con i woff2 di Google Fonts (Commissioner v24, Marcellus v14,
  `document.fonts.check` vero per entrambi), foto di prova da Openverse (solo
  per la geometria, non sono le foto del sito), palazzo in sezione con scatole
  3D, nastro di lune con fasi, pannello con finestre delle ore, strato Dentro.
  Screenshot guardati a 1440 × 900, 1366 × 768, 768 × 1024, 1920 × 1080,
  2560 × 1440, 375 × 667 (torre, pagina intera) e Dentro a 1440. Copie in
  `concepts/20-imbrunire/qa/art-director/` (ignorata da git).
- `--imb-palazzo-w` (CSS) e `larghezzaPalazzo()` (TS) confrontati in Chromium
  su 8 finestre: stessi valori al decimo di pixel; `--imb-luna-passo` uguale a
  `misureLune().passo` su tutte.
- Contrasti calcolati con script (§2, script in appendice): tutte le coppie in
  uso passano.

---

## 1. Decisioni

### 1.1 Tipografia: Marcellus + Commissioner, misurati

File woff2 latin misurati con fontTools:
- **Commissioner** v24: un file variabile `wght` 100-900 (si carica 400..600),
  upm 2000, ascent 1,017, descent 0,206, x-height 0,496. Testo italiano di
  prova: larghezza 99,04% di Arial. Ripiego `Imbrunire Commissioner Ripiego`
  (Arial/Liberation Sans) con `size-adjust: 99.04%`, `ascent-override:
  102.69%`, `descent-override: 20.8%`.
- **Marcellus** v14: un peso, upm 2048, ascent 0,974, descent 0,280. È quasi
  sempre in maiuscolo, quindi il ripiego è tarato sulle capitali: Times
  (Liberation Serif) al 94,94%, `ascent-override: 102.6%`,
  `descent-override: 29.47%`.
- Pesi dei font: 36,7 KB + 14,6 KB = **51 KB** (budget 110).

Regole: Marcellus sempre maiuscolo, +0,04em (+0,08em solo nell'iscrizione
incisa, che è un logotipo); Commissioner sempre in tondo, cifre tabellari su
tutto ciò che è numero. Scala fluida da 375 a 1440 in `tokens.css` §3 (formula
`clamp(min, min − p·375 + p·100vw, max)`), più un gradino a 1920 × 1000.

### 1.2 Palette: i sette colori del CD, più i derivati che servivano

Tengo i sette colori del CD §5.1 senza ritocchi (i rapporti dichiarati dal CD
tornano tutti: 12,37 / 9,50 / 5,79 / 5,53 / 4,15). Aggiungo derivati nella
stessa famiglia, nessun colore nuovo di tinta:

| Derivato | Perché |
|---|---|
| `luna-velata` `#E6D7BC` | sul poché `luna-spenta` dà **2,59:1**: la riga piccola delle fasce ("da 128 € a notte", "occupata") non avrebbe passato AA. Luna velata dà 4,75:1 e resta distinta dalla luna |
| `poche-scuro` `#5E2F23` | falde del tetto tagliate e zoccolo; luna sopra 9,04:1 |
| `inciso` `#4E261C` | lettere incise nell'intonaco: 3,58:1 su intonaco, 4,66:1 su intonaco-luce (testo ≥ 24 px) |
| `intonaco-luce` / `intonaco-ombra` | la stessa parete accesa e in ombra (androne, pareti laterali delle scatole) |
| `soffitto`, `trave`, `pavimento-base` | superfici interne; nessun testo sopra |
| `cielo-basso` `#262E44` | lo schiarimento vicino ai tetti chiesto dal CD, stesso tono |
| `pietra` `#2B3247` | marciapiede: luna spenta sopra 4,89:1 |

**Fuoco a due toni**: `luce` su intonaco è **2,29:1**, sotto il 3:1 dei
componenti. L'anello quindi è `outline 2px luce` + alone `box-shadow 0 0 0 3px
notte` nello spazio dell'offset: luce contro notte 9,50:1, notte contro
intonaco 4,15:1. Si legge su qualsiasi fondo.

**Riverbero della stanza accesa**: la prima versione era una velatura di luce
al 14% sulla fascia sotto il nome. Lo script l'ha bocciata (nome a 4,35:1,
riga piccola a 3,74:1). Ora è un **filo di luce di 2 px** sul bordo del
solaio, sopra il testo: la fascia resta poché pieno.

### 1.3 Geometria del palazzo (misurata a schermo, con due deviazioni)

Prima prova con le misure dei doc dell'ondata 1 (tetto come triangolo sopra
il sottotetto, fascia del nome in più sotto ogni cella, `larghezza = altezza ×
1,18`): a 1440 × 900 il palazzo **copriva il nastro delle lune** (alto 820 px
per 767 di larghezza) e a 1366 × 768 le fasce andavano su tre righe. Cosa ho
cambiato, e ora regge da 720 × 640 a 2560 × 1440:

1. **Il sottotetto sta dentro il tetto** (come chiedono CD §2 e ux §2.2: "le
   falde tagliano Il Noce e la scala"): muretto d'imposta al 45% dell'altezza
   del sottotetto, falde a pendenza 0,33. Si risparmiano ~130 px e la sezione
   diventa un tetto vero.
2. **Il solaio è la fascia del nome**: sotto ogni piano un'unica fascia di
   poché alta 46 px (40 su schermi bassi) fa da solaio e da etichetta.
3. **Modulo** `u = larghezza / 7,2` (stanze più larghe che alte, come una
   sezione vera): altezze 0,95u / 1,2u / 1u.
4. Ne esce `altezza = 0,53 × larghezza + (3 fasce + manto + zoccolo)`, da cui
   `--imb-palazzo-w` (CSS) e `larghezzaPalazzo()` (TS). A 1440 × 900 il
   palazzo è largo 845 px; a 1366 × 768, 700; a 2560 × 1440, 1400.
5. **Nomi in cella tutti uguali e su una riga**: la misura dipende dalla
   larghezza del palazzo (`clamp(13px, 2.2cqi, 17→20px)`, il palazzo è un
   contenitore). Con misure per cella (prima prova) La Soffitta usciva a 10 px
   e Il Camino a 20: disordinato. Gli spazi comuni in cella usano il nome breve
   di `testi.ts` (`breve`: Portico, Androne, Colazione).
6. **Il palazzo poggia sempre sul marciapiede**: a 2560 galleggiava nel cielo
   con 300 px di vuoto sotto; ora il vuoto va sopra, nel cielo.

**Deviazione A · soglia della sezione a 640 px d'altezza** (il tech-architect
§5.1 dice 560, l'ux §2.4 dice 600). A 1024 × 600 il palazzo che entra
nell'altezza è largo meno di 400 px: le celle sono di 80-100 px e i nomi
scendono sotto i 12 px. Sotto 640 la **torre** (che scorre) è migliore.
`MQ_SEZIONE` in `tokens.ts` e i CSS usano `(min-width: 720px) and
(min-height: 640px)`. Richiesta allo scaffold in §4.

**Deviazione B · la frase di chi siamo nello zoccolo, non sotto il
cornicione**. Con il sottotetto dentro il tetto, lo spazio sopra le celle nel
timpano è un triangolo alto ~90 px e largo ~180 px all'altezza del testo: la
frase (64 caratteri in `testi.chiSiamo`) non ci sta. Va incisa nello
**zoccolo** di poché scuro sotto il piano terra, a tutta larghezza del
palazzo, una riga (due righe con `chiSiamoRighe` sotto 600 px di palazzo).

**Scala e portico**: colonna d'intonaco con rampe di gradini di poché (il
tratteggio dritto della prima prova sembrava un'ombreggiatura, non una scala:
le rampe vanno disegnate diagonali, una per piano); portico con due archi di
poché ritagliati da maschera.

### 1.4 La scatola 3D: prospettiva proporzionale all'altezza

Il CD §6.1 dice `perspective ≈ 900 px` e profondità 0,7 × altezza, e insieme
"la foto occupa il 55-60% della cella". Le due cose non stanno insieme: con
900 px e una cella di 150 px la parete di fondo è al 90% (la scatola sembra
piatta, il rischio 4.1 del trend-researcher). La scala della parete di fondo è
`p / (p + d)`: per il 58-60% con `d = 0,7h` serve `p ≈ h`.

Decisione: **`perspective = altezza della cella × 1,05`** (1,25 in torre,
dove le celle sono larghe e basse), profondità 0,7h, occhio al 42%
dall'alto (si vede più pavimento che soffitto, come stando sul
pianerottolo). Misurato a schermo: la foto è il 60% della cella in ogni piano
e a ogni larghezza; pareti, travi e pavimento si leggono. Lo strato
**Dentro** usa `perspective = altezza della finestra × 3`: la foto copre ~81%
dello schermo e le pareti restano ai bordi (con 1,1 la foto era il 60%:
troppo piccola per "la foto riempie la finestra"; con 3,6 le pareti
sparivano). In TS: `misureScatola('sezione' | 'torre' | 'dentro', h)`.

Materiali interni (variabili pronte da usare come `background`): pareti in
`intonaco-ombra` con grana, più scure verso il fronte (la luce viene dalla
lampada in fondo); soffitto chiaro, con travi di noce (`--imb-soffitto-travi`)
nel sottotetto e al piano nobile; pavimento del colore campionato dalla foto
con velo scuro verso il fronte; ombra calda negli angoli della parete di
fondo (`--imb-angoli-fondo`).

### 1.5 Le luci: solo veli, colori e opacità scelti a schermo

Acceso: velo `radial-gradient` di luce (55% → 18% → 0) in `soft-light` sulla
foto, alone sul pavimento. Spento: velo notte profonda al 64% (≈
`brightness(.38)` del CD, misurato a occhio sulle foto di prova: la stanza è
spenta ma la foto si riconosce ancora) più un velo grigio al 40% in
`saturation` (≈ `saturate(.6)`), e velo notte su pareti, soffitto e
pavimento. Passaggio del puntatore: +8% sul velo di luce. Durate, ritardi e
curve sono del motion-designer (`--imb-luce-*` da `motion/variabili.ts`).

### 1.6 Texture, foto, luna

- **Grana dell'intonaco**: `feTurbulence` frattale in SVG data URI (160 px,
  seme fisso), tono su tono; solo sulle superfici d'intonaco, mai sotto il
  testo, mai animata. Il poché è pieno. Il cielo è piatto, con lo
  schiarimento solo nel 45% basso.
- **Foto** (per il photo-editor): stesso ritocco su tutte in export
  (leggermente calde, ombre sollevate di poco, stessa nitidezza), nessun
  filtro CSS. **Frontali**, parete di fondo parallela all'immagine, soggetto
  al centro con margine sui quattro lati (la scatola mostra il 60% della cella
  e i tagli 4:3 / 3:4 devono reggere). Sulle foto di prova le camere viste
  d'angolo dentro la scatola frontale sembravano storte: conferma del rischio
  4.3 del trend-researcher.
- **Luna**: disco illuminato `luna`, parte in ombra `luna-spenta` al 22% (luce
  cinerea: si vede la luna intera anche quando è falce). Verificato a schermo
  su 34 notti consecutive: le fasi si leggono a 28, 34 e 40 px. Prima del
  calcolo il disco in ombra sale al 34% perché il nastro vuoto sembri già un
  nastro di lune. La transizione della parte illuminata usa
  `--imb-dur-fasi-luna` del motion-designer.

---

## 2. Contrasti WCAG 2.x (calcolati)

Formula di luminanza relativa sRGB del W3C, script in appendice. I composti
(pannello al 92% sopra la foto) sono calcolati sul caso peggiore (foto bianca
pura, e foto color luce piena). Soglie: 4,5:1 testo normale, 3:1 testo grande
(≥ 24 px) e componenti/segni grafici.

| Primo piano | Fondo | Rapporto | Soglia | Esito | Uso |
|---|---|---|---|---|---|
| luna `#F2E8D0` | notte `#1F2638` | 12.37:1 | 4.5:1 | passa | testo principale su cielo, pannelli, fogli |
| luna spenta `#9AA0B4` | notte `#1F2638` | 5.79:1 | 4.5:1 | passa | testo secondario, giorni sotto le lune (13 px) |
| luna `#F2E8D0` | cielo basso `#262E44` | 11.07:1 | 4.5:1 | passa | testo nel cielo vicino ai tetti |
| luna spenta `#9AA0B4` | cielo basso `#262E44` | 5.18:1 | 4.5:1 | passa | riga di stato bassa, luna di stasera |
| luna `#F2E8D0` | notte profonda `#171C2A` | 13.94:1 | 4.5:1 | passa | testo nei campi, ore nelle finestre spente |
| luna spenta `#9AA0B4` | notte profonda `#171C2A` | 6.52:1 | 4.5:1 | passa | testo d'aiuto nei campi |
| luna spenta `#9AA0B4` | pietra `#2B3247` | 4.89:1 | 4.5:1 | passa | riga "Albergo inventato" sul marciapiede |
| luna `#F2E8D0` | pietra `#2B3247` | 10.44:1 | 4.5:1 | passa | link sul marciapiede |
| luna `#F2E8D0` | pannello 92% su foto bianca `#313748` | 9.73:1 | 4.5:1 | passa | pannello stanza, caso peggiore |
| luna spenta `#9AA0B4` | pannello 92% su foto bianca `#313748` | 4.55:1 | 4.5:1 | passa | dati della stanza, caso peggiore |
| luna spenta `#9AA0B4` | pannello 92% su luce piena `#30333d` | 4.84:1 | 4.5:1 | passa | dati sopra la parte più calda della foto |
| luce `#F2C77C` | pannello 92% su foto bianca `#313748` | 7.48:1 | 3:1 | passa | segni di stato in luce nel pannello |
| notte `#1F2638` | luce `#F2C77C` | 9.50:1 | 4.5:1 | passa | bottone primario, finestra dell'ora scelta |
| luna `#F2E8D0` | poché `#8A4A38` | 5.53:1 | 4.5:1 | passa | nome della stanza nella fascia |
| luna velata `#E6D7BC` | poché `#8A4A38` | 4.75:1 | 4.5:1 | passa | "da 128 € a notte", "occupata" nella fascia |
| luna `#F2E8D0` | poché + velatura di luce 14% `#995c42` | 4.35:1 | 4.5:1 | non passa: vietato | VIETATO: velatura di luce sotto il nome (per questo il riverbero è un filo di 2 px sopra il testo) |
| luna `#F2E8D0` | poché scuro `#5E2F23` | 9.04:1 | 4.5:1 | passa | frase di chi siamo nello zoccolo |
| inciso `#4E261C` | intonaco `#BE7359` | 3.58:1 | 3:1 | passa | ALBERGO IMBRUNIRE inciso (≥ 24 px, logotipo) |
| inciso `#4E261C` | intonaco luce `#D08A6E` | 4.66:1 | 3:1 | passa | iscrizione sulla parete accesa dell'androne |
| notte `#1F2638` | intonaco `#BE7359` | 4.15:1 | 3:1 | passa | solo testo grande su intonaco (≥ 24 px) |
| luce (anello di fuoco) `#F2C77C` | notte (alone dell'anello) `#1F2638` | 9.50:1 | 3:1 | passa | fuoco: l'anello a due toni si legge su ogni fondo |
| luce (anello di fuoco) `#F2C77C` | poché `#8A4A38` | 4.25:1 | 3:1 | passa | fuoco sulle celle, anello sul muro |
| notte (alone) `#1F2638` | intonaco `#BE7359` | 4.15:1 | 3:1 | passa | fuoco su intonaco: alone notte contro il muro |
| luna spenta (bordo campo) `#9AA0B4` | notte profonda `#171C2A` | 6.52:1 | 3:1 | passa | bordo dei campi |
| luna spenta (bordo campo) `#9AA0B4` | pannello 92% su foto bianca `#313748` | 4.55:1 | 3:1 | passa | bordo dei campi, caso peggiore |
| luce (base luna scelta) `#F2C77C` | notte `#1F2638` | 9.50:1 | 3:1 | passa | base di luce sotto la luna scelta |
| luna (disco illuminato) `#F2E8D0` | notte `#1F2638` | 12.37:1 | 3:1 | passa | fase della luna |
| luna spenta (segno "occupata") `#9AA0B4` | notte `#1F2638` | 5.79:1 | 3:1 | passa | anello tratteggiato sul nastro filtrato |
| luce (finestra accesa) `#F2C77C` | notte profonda (finestra spenta) `#171C2A` | 10.71:1 | 3:1 | passa | ora scelta contro le altre |
| luna chiusa 35% `#696a6d` | notte `#1F2638` | 2.79:1 | 1:1 | passa | luna velata delle notti di chiusura (decorativa: la parola "chiuso" fa fede) |
| luce `#F2C77C` | intonaco `#BE7359` | 2.29:1 | 3:1 | non passa: vietato | VIETATO: luce da sola su intonaco (per questo l'anello ha l'alone notte) |
| luna spenta `#9AA0B4` | poché `#8A4A38` | 2.59:1 | 3:1 | non passa: vietato | VIETATO: luna spenta sul poché (si usa luna velata) |
| luna `#F2E8D0` | intonaco `#BE7359` | 2.98:1 | 3:1 | non passa: vietato | VIETATO: testo chiaro su intonaco |

Note:
- La coppia più stretta in uso è `luna-spenta` sul pannello sopra una foto
  **bianca pura** (4,55:1). Con foto reali (mai bianche piene sotto il
  pannello) il margine è più largo; se una foto ha una zona bianca grande in
  basso a destra, il photo-editor sposta il taglio (`taglio.dentro`).
- Le lune al 35% (chiuse) e il disco in ombra al 22% sono decorativi: lo stato
  è detto dalla parola ("chiuso") e dall'etichetta accessibile della luna.
- ALBERGO IMBRUNIRE inciso nella cella piccola dell'androne scende sotto i 24
  px: è un logotipo decorativo (`aria-hidden`), il nome vero è l'h1 in testata.

---

## 3. Come si usano token e classi

### 3.1 Ordine di import (scaffold, in `Imbrunire.tsx`)

```ts
import './styles/tokens.css';
import './styles/luna.css';
import './styles/base.css';
import './styles/layout.css';
import './interaction/interaction.css';
// poi i CSS delle sezioni, importati dai loro componenti
```

### 3.2 Variabili principali

| Serve per | Variabili |
|---|---|
| colori per ruolo | `--imb-fondo`, `--imb-testo`, `--imb-testo-2`, `--imb-testo-su-poche`, `--imb-testo-2-su-poche`, `--imb-azione`, `--imb-su-azione`, `--imb-pannello`, `--imb-foglio` |
| trasparenze | `rgb(var(--imb-luce-rgb) / .4)` e le altre terne `-rgb` |
| tipografia | `--imb-font-display`, `--imb-font-testo`, `--imb-spaziatura-display`, `--imb-t-*`, `--imb-lh-*`, `--imb-peso-*` |
| palazzo | `--imb-palazzo-w`, `--imb-muro`, `--imb-solaio`, `--imb-fascia-sezione`, `--imb-manto`, `--imb-gronda`, `--imb-zoccolo-h`, `--imb-pelle`, `--imb-modulo`, `--imb-h-*`, `--imb-ginocchio`, `--imb-tetto-pendenza`, `--imb-comignolo-*`, `--imb-gradino-*`, `--imb-binario-scala`, `--imb-sopra-palazzo`, `--imb-marciapiede-h` |
| nomi in cella | `--imb-nome-adatta`, `--imb-t-nome-min`, `--imb-t-sub-min`, `--imb-fregio-adatta` (il palazzo deve avere `container-type: inline-size`) |
| scatola | `--imb-prospettiva`, `--imb-profondita`, `--imb-occhio-y`, `--imb-prospettiva-dentro`, `--imb-profondita-dentro` |
| materiali | `--imb-sfondo-intonaco`, `--imb-sfondo-intonaco-luce`, `--imb-sfondo-intonaco-ombra`, `--imb-sfondo-poche`, `--imb-sfondo-cielo`, `--imb-parete-sx`, `--imb-parete-dx`, `--imb-soffitto-sfondo`, `--imb-soffitto-travi`, `--imb-pavimento-velo`, `--imb-angoli-fondo`, `--imb-grana` |
| luci | `--imb-velo-luce` (+ `--imb-velo-luce-blend`), `--imb-alone-pavimento`, `--imb-velo-spenta`, `--imb-velo-desatura` (+ `-blend`), `--imb-calore`, `--imb-riverbero` |
| lune | `--imb-luna-d`, `--imb-luna-passo`, `--imb-luna-cielo`, `--imb-luna-successo`, `--imb-luna-bottone`, `--imb-luna-base-h`, `--imb-luna-base-w`, `--imb-luna-alone-scelta`, `--imb-alone-cielo` |
| fuoco | `--imb-fuoco`, `--imb-fuoco-alone`, `--imb-fuoco-spessore`, `--imb-fuoco-distanza` |
| interfaccia | `--imb-s-1…9`, `--imb-margine`, `--imb-tocco`, `--imb-bottone-h`, `--imb-bottone-primario-h`, `--imb-pannello-w`, `--imb-testata-h`, `--imb-riserva-*`, `--imb-finestra-*`, `--imb-campo-*`, `--imb-errore-*` |
| livelli | `--imb-z-cielo … --imb-z-successo` |

### 3.3 Esempi (dalla pagina di prova, verificati a schermo)

```css
/* cella del palazzo: il vano non è 3D, la scatola sì */
.imb-root .imb-palazzo__vano {
  height: var(--imb-palazzo-h-cella);           /* lo calcola il builder dal modulo */
  overflow: hidden;
  perspective: calc(var(--imb-palazzo-h-cella) * var(--imb-prospettiva));
  perspective-origin: 50% var(--imb-occhio-y);
  background: var(--imb-notte-profonda);
}
.imb-root .imb-scatola__fondo {
  transform: translateZ(calc(var(--imb-palazzo-h-cella) * var(--imb-profondita) * -1));
  box-shadow: var(--imb-angoli-fondo);
}
.imb-root .imb-scatola__velo-luce { background: var(--imb-velo-luce); mix-blend-mode: var(--imb-velo-luce-blend); }
.imb-root .imb-scatola__velo-desatura { background: var(--imb-velo-desatura); mix-blend-mode: var(--imb-velo-desatura-blend); }
.imb-root .imb-scatola__velo-spenta { background: var(--imb-velo-spenta); }
.imb-root .imb-scatola__pavimento { background: var(--imb-pavimento-velo), var(--imb-pavimento, var(--imb-pavimento-base)); }
.imb-root .imb-scatola__parete--sx { background: var(--imb-parete-sx); }

/* fascia del nome, sezione */
.imb-root .imb-palazzo { container-type: inline-size; width: var(--imb-palazzo-w); }
.imb-root .imb-palazzo__fascia { height: var(--imb-fascia-sezione); padding: 5px 8px; background: var(--imb-poche); }
.imb-root .imb-palazzo__cella[data-imb-luce="accesa"] .imb-palazzo__fascia { background: var(--imb-riverbero), var(--imb-poche); }
.imb-root .imb-palazzo__nome {
  font: 400 clamp(var(--imb-t-nome-min), var(--imb-nome-adatta), var(--imb-t-nome-cella))/1.1 var(--imb-font-display);
  letter-spacing: var(--imb-spaziatura-display);
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--imb-testo-su-poche);
}

/* anello di fuoco (interaction.css) */
.imb-root :focus-visible {
  outline: var(--imb-fuoco-spessore) solid var(--imb-fuoco);
  outline-offset: var(--imb-fuoco-distanza);
  box-shadow: 0 0 0 var(--imb-fuoco-distanza) var(--imb-fuoco-alone);
}
```

### 3.4 Regole per i section-builder

- Nessun hex nei CSS delle sezioni: solo `var(--imb-*)` (eccezione: il
  pavimento della foto, passato come `--imb-pavimento` inline sulla scatola).
- Veli, `mix-blend-mode`, `clip-path`, `overflow` e opacità mai sull'elemento
  `preserve-3d`: sulle facce o sul vano.
- Il `clip-path` del tetto va sul contenitore del piano o sul vano, **mai sul
  bottone** della cella: taglierebbe l'anello di fuoco (visto nella prova su
  Il Noce).
- Testo solo su notte, pannello, poché, poché scuro, pietra. Su intonaco solo
  ≥ 24 px in `inciso` o `notte`.
- Nessuna `box-shadow` di elevazione, nessun `backdrop-filter`, raggio 0
  (dischi solo per lune e "Quanti siete").

---

## 4. Richieste ad altri agent

1. **scaffold-engineer**
   - `core/layout.ts`: `MQ_SEZIONE` e la soglia da `styles/tokens.ts`
     (`MQ_SEZIONE`, `SOGLIA_SEZIONE`): **720 × 640**, non 560 (deviazione A,
     §1.3). In `base.css`/`layout.css` la media query letterale è
     `(min-width: 720px) and (min-height: 640px)`.
   - `luna/Luna.tsx`: SVG con `viewBox` `-R -R 2R 2R`, `R = r +
     LUNA_MARGINE_SVG` (6), figli in quest'ordine: `<circle
     class="imb-luna__anello" r={r + 4}/>`, `<path class="imb-luna__ombra"/>`,
     `<path class="imb-luna__luce"/>`; classe radice `imb-luna` più i
     modificatori `imb-luna--vuota | --stasera | --scelta | --chiusa | --cielo`
     (props `stato`, `anello`, `cielo` o come preferisci, basta produrre
     queste classi). `aria-hidden` sull'SVG: il testo lo dà l'opzione.
   - `core/fonts.ts`: `FONT_CSS_URL` e `FONT_DA_CARICARE` da `tokens.ts`.
   - Ordine di import di §3.1.
2. **section-builder-palazzo**: geometria di §1.3 con `geometriaPalazzo()` /
   `--imb-palazzo-w`; il palazzo è `container-type: inline-size`; il solaio
   sotto ogni piano è la fascia del nome; sottotetto dentro il tetto;
   zoccolo con `testi.chiSiamo` (o `chiSiamoRighe` sotto 600 px); scatole con
   `misureScatola()`; spazi comuni col nome `breve`; in sezione "da … a notte"
   solo al passaggio/fuoco, "occupata" sempre.
3. **section-builder-stanza**: strato Dentro con `perspective = altezza
   finestra × --imb-prospettiva-dentro` (3); testata con fondo
   `--imb-pannello` quando si è dentro (verificato: sopra il soffitto chiaro il
   nome dell'albergo non si legge).
4. **section-builder-lune / interaction-designer**: `passo` da
   `misureLune(layout, w, h)`: 44 sezione, **38** su schermi bassi (≤ 820 px),
   50 grandi, 48 torre.
5. **section-builder-prenota**: finestre 52 × 44, spazio 6, muro 8 (entrano
   nei 360 px del pannello; con 60 px uscivano di 40 px).
6. **copywriter**: `chiSiamo` oggi è di 64 caratteri, su una riga nello zoccolo
   regge fino a ~70; non allungarla. Nomi `breve` degli spazi già presenti:
   vanno bene.
7. **photo-editor**: foto frontali, soggetto con margine sui quattro lati,
   niente zone bianche grandi in basso a destra del taglio `dentro` (ci sta il
   pannello); stesso ritocco per tutte (§1.6).
8. **responsive-tester**: controllare 720 × 640 (limite della sezione, il
   palazzo è a 480 px e ci sta al pixel), 1280 × 720 e 1366 × 768 (sezione
   bassa), che il palazzo non tocchi mai la riga di stato del nastro.

---

## Appendice: script dei contrasti

`node contrasti.mjs` stampa la tabella di §2.

```js
// IMBRUNIRE · contrasti WCAG 2.x (formula di luminanza relativa sRGB, W3C).
// node contrasti-finale.mjs  → tabella markdown
const C = {
  notte:'#1F2638', notteProfonda:'#171C2A', cieloBasso:'#262E44', pietra:'#2B3247',
  intonaco:'#BE7359', intonacoLuce:'#D08A6E', poche:'#8A4A38', pocheScuro:'#5E2F23', inciso:'#4E261C',
  luna:'#F2E8D0', lunaVelata:'#E6D7BC', lunaSpenta:'#9AA0B4', luce:'#F2C77C', bianco:'#FFFFFF',
};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lin=c=>{c/=255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4};
const L=h=>{const [r,g,b]=hex(h).map(lin);return 0.2126*r+0.7152*g+0.0722*b};
const cr=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
// sopra (a) con opacità t su sotto (b)
const su=(a,b,t)=>'#'+hex(a).map((v,i)=>Math.round(v*t+hex(b)[i]*(1-t)).toString(16).padStart(2,'0')).join('');
const pannelloBianco=su(C.notte,C.bianco,0.92);
const pannelloLuce=su(C.notte,C.luce,0.92);
const pocheRiverbero=su(C.luce,C.poche,0.14);
const lunaChiusa=su(C.luna,C.notte,0.35);
const righe=[
 // [testo/segno, fondo, soglia, uso]
 ['luna',C.luna,'notte',C.notte,4.5,'testo principale su cielo, pannelli, fogli'],
 ['luna spenta',C.lunaSpenta,'notte',C.notte,4.5,'testo secondario, giorni sotto le lune (13 px)'],
 ['luna',C.luna,'cielo basso',C.cieloBasso,4.5,'testo nel cielo vicino ai tetti'],
 ['luna spenta',C.lunaSpenta,'cielo basso',C.cieloBasso,4.5,'riga di stato bassa, luna di stasera'],
 ['luna',C.luna,'notte profonda',C.notteProfonda,4.5,'testo nei campi, ore nelle finestre spente'],
 ['luna spenta',C.lunaSpenta,'notte profonda',C.notteProfonda,4.5,'testo d\'aiuto nei campi'],
 ['luna spenta',C.lunaSpenta,'pietra',C.pietra,4.5,'riga "Albergo inventato" sul marciapiede'],
 ['luna',C.luna,'pietra',C.pietra,4.5,'link sul marciapiede'],
 ['luna',C.luna,'pannello 92% su foto bianca',pannelloBianco,4.5,'pannello stanza, caso peggiore'],
 ['luna spenta',C.lunaSpenta,'pannello 92% su foto bianca',pannelloBianco,4.5,'dati della stanza, caso peggiore'],
 ['luna spenta',C.lunaSpenta,'pannello 92% su luce piena',pannelloLuce,4.5,'dati sopra la parte più calda della foto'],
 ['luce',C.luce,'pannello 92% su foto bianca',pannelloBianco,3,'segni di stato in luce nel pannello'],
 ['notte',C.notte,'luce',C.luce,4.5,'bottone primario, finestra dell\'ora scelta'],
 ['luna',C.luna,'poché',C.poche,4.5,'nome della stanza nella fascia'],
 ['luna velata',C.lunaVelata,'poché',C.poche,4.5,'"da 128 € a notte", "occupata" nella fascia'],
 ['luna',C.luna,'poché + velatura di luce 14%',pocheRiverbero,4.5,'VIETATO: velatura di luce sotto il nome (per questo il riverbero è un filo di 2 px sopra il testo)'],
 ['luna',C.luna,'poché scuro',C.pocheScuro,4.5,'frase di chi siamo nello zoccolo'],
 ['inciso',C.inciso,'intonaco',C.intonaco,3,'ALBERGO IMBRUNIRE inciso (≥ 24 px, logotipo)'],
 ['inciso',C.inciso,'intonaco luce',C.intonacoLuce,3,'iscrizione sulla parete accesa dell\'androne'],
 ['notte',C.notte,'intonaco',C.intonaco,3,'solo testo grande su intonaco (≥ 24 px)'],
 // non testo, 3:1 (WCAG 1.4.11)
 ['luce (anello di fuoco)',C.luce,'notte (alone dell\'anello)',C.notte,3,'fuoco: l\'anello a due toni si legge su ogni fondo'],
 ['luce (anello di fuoco)',C.luce,'poché',C.poche,3,'fuoco sulle celle, anello sul muro'],
 ['notte (alone)',C.notte,'intonaco',C.intonaco,3,'fuoco su intonaco: alone notte contro il muro'],
 ['luna spenta (bordo campo)',C.lunaSpenta,'notte profonda',C.notteProfonda,3,'bordo dei campi'],
 ['luna spenta (bordo campo)',C.lunaSpenta,'pannello 92% su foto bianca',pannelloBianco,3,'bordo dei campi, caso peggiore'],
 ['luce (base luna scelta)',C.luce,'notte',C.notte,3,'base di luce sotto la luna scelta'],
 ['luna (disco illuminato)',C.luna,'notte',C.notte,3,'fase della luna'],
 ['luna spenta (segno "occupata")',C.lunaSpenta,'notte',C.notte,3,'anello tratteggiato sul nastro filtrato'],
 ['luce (finestra accesa)',C.luce,'notte profonda (finestra spenta)',C.notteProfonda,3,'ora scelta contro le altre'],
 ['luna chiusa 35%',lunaChiusa,'notte',C.notte,1,'luna velata delle notti di chiusura (decorativa: la parola "chiuso" fa fede)'],
 ['luce',C.luce,'intonaco',C.intonaco,3,'VIETATO: luce da sola su intonaco (per questo l\'anello ha l\'alone notte)'],
 ['luna spenta',C.lunaSpenta,'poché',C.poche,3,'VIETATO: luna spenta sul poché (si usa luna velata)'],
 ['luna',C.luna,'intonaco',C.intonaco,3,'VIETATO: testo chiaro su intonaco'],
];
console.log('| Primo piano | Fondo | Rapporto | Soglia | Esito | Uso |');
console.log('|---|---|---|---|---|---|');
for (const [a,ah,b,bh,s,u] of righe){const v=cr(ah,bh);const vieta=u.startsWith('VIETATO');console.log(`| ${a} \`${ah}\` | ${b} \`${bh}\` | ${v.toFixed(2)}:1 | ${s}:1 | ${vieta?(v>=s?'passa ma non si usa':'non passa: vietato'):(v>=s?'passa':'NON PASSA')} | ${u} |`)}
```
