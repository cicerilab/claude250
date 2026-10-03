# Art director · Concept 14 · BATTIFILO

Ondata 2. Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, tutti i doc
dell'ondata 1 in `concepts/14-battifilo/docs/` (creative-director,
trend-researcher, brand-strategist, ux-architect, tech-architect) e quelli
già scritti in parallelo (vector-artist, interaction-designer), le skill
`design-taste-frontend` e `full-output-enforcement`, il pilota
`concepts/10-torchio/` (DESIGN.md, art-director, tokens) solo come formato.

## File consegnati

| File | Contenuto |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: tema, palette con ruoli, tipografia, componenti, griglia del filo, profondità, do/don't, responsive, prompt guide |
| `src/pages/concepts/battifilo/styles/tokens.css` | `@font-face` di ripiego tarati; su `.btf-root` i 6 colori + 2 derivati, i ruoli, famiglie, scala fluida, interlinee, pesi, larghezze fisse delle cifre, spaziatura, griglia del filo, geometria del palco, oggetti, fuoco, z-index, parametri della lastra e dello spruzzo |
| `src/pages/concepts/battifilo/styles/tokens.ts` | `COLORI`, `RUOLI`, `FONT_CSS_URL`, `FONT_PRECONNECT`, `FONT_FAMIGLIE`, `FONT_STACK`, `FONT_DA_CARICARE`, `TIPO`, `STENCIL_MIN_PX`, `COBALTO_TESTO_MIN_PX`, `LARGHEZZA_CIFRE_EM`, `MISURE`, `PALCO`, `PIANO`, `SOGLIE_EM`, `Z`, `LASTRA_MAPPA`; funzioni pure `luminanza`, `contrasto`, `fluido` |
| `src/pages/concepts/battifilo/styles/lastra.css` | materiali: `.btf-lastra` (+ `--ombra`, `--ferma`), `.btf-stencil` (+ 9 misure, `--gesso`, `--calce`, riquadri di costo e totale), `.btf-cifre`, `.btf-rasatura`, `.btf-bottone-cobalto` (+ `--fascia`), `.btf-cartello` + fascette, `.btf-gesso` (+ `--vecchio`, ripiego senza mask), selezione, reduced motion, `forced-colors`, stampa |
| `scripts/contrasti.mjs` | legge gli hex da tokens.css e tokens.ts, controlla che coincidano e che i derivati tornino, calcola 48 coppie (tinta media e i due estremi della texture in soft-light), stampa la tabella di §3, esce con 1 se qualcosa non passa |

Verifiche fatte: `tsc 5.6.3 --strict --noUncheckedIndexedAccess
--noUnusedLocals` su `tokens.ts` verde; `node scripts/contrasti.mjs` → 37
coppie con soglia su 37 passano, hex coincidenti. Pagina di prova (scratch,
fuori dal repo) con `tokens.css` + `lastra.css` veri, i woff2 veri scaricati
da Google Fonts e le maschere del vector-artist, fotografata con Chromium a
1440×900, 1366×768, 768×1024, 375×812 e zoom 2x sulle marcature:
screenshot in `qa/art-director/` (ignorata da git). Il layout della prova è
mio e grezzo (la linea su telefono in particolare): serve a giudicare
materiali e misure, non è il layout del sito.

---

## 1. Decisioni

### 1.1 Font: confermo Big Shoulders Stencil + Chivo

Scaricati i woff2 latin da Google Fonts (oggi) e misurati con fontTools.

- **Big Shoulders Stencil** v4: una famiglia variabile `wght` 100-900 e
  `opsz` 10-72 (default 72 = taglio Display). upm 2000, ascent 0,9855,
  descent 0,2145, maiuscole 0,80. 60 KB. Nessun `tnum`: le cifre sono
  proporzionali (l'1 è largo 548 contro ~1000 delle altre a peso 900).
- **Chivo** v21: variabile `wght` 100-900, 33 KB, **ha `tnum`** (e `pnum`,
  `frac`). Larghezza a 400 = 105,7% di Arial.
- URL unico: `Big+Shoulders+Stencil:opsz,wght@10..72,700..900&family=Chivo:wght@400..700&display=swap`,
  93 KB in tutto (budget 100).
- **Dimensione ottica automatica** (`font-optical-sizing: auto`) invece di
  `"opsz" 72` fisso: a 20-24 px il taglio 72 ha ponti e controforme troppo
  stretti; con l'automatico le tacche usano il taglio aperto e da 72 px in su
  è il Display che chiede la direzione.
- **Pesi**: 850 per le marcature grandi, 800 per tacche e quote (il 900 a
  20 px impasta i ponti). Spaziatura 0,005 em in grande, 0,03 em a 20-24 px
  (sono sigle di tre lettere, non etichette spaziate).
- **Riquadri delle cifre**: il costo più largo dei 14 è 3,59 em, il caso
  peggiore a cinque cifre 3,69 em, "412.500 €" 3,86 em → riquadri 3,8 em e
  4,3 em, allineati all'inizio (prova a schermo: allineati a destra
  lasciavano un vuoto prima della cifra e la staccavano dalla sua tacca).
- **Ripieghi**: stencil su Arial Narrow Bold (size-adjust 88,4%) se c'è,
  altrimenti Arial Bold (72,5%); Chivo su Arial (105,7%); ascent e descent
  riportati in proporzione. In Linux senza font stretti scatta il secondo.

### 1.2 Palette: i sei colori della direzione, un ritocco, due derivati

- **Cobalto fondo da `#163E94` a `#143A8C`.** Con la texture il punto più
  scuro della lastra è `#B3AFA6`: il vecchio valore ci dava 4,43:1 (non AA
  per il testo piccolo). Il nuovo dà 5,04:1 sulla tinta e 4,78:1 nel caso
  peggiore. Stessa tinta, un passo più scuro.
- **Rasatura `#D2D0C9`** (45% calce sul calcestruzzo): il fondo dei campi.
  Una superficie lisciata sulla lastra, non un colore nuovo: testo ferro
  9,74:1, anello cobalto 4,96:1. Si riconosce dalla riga di base ferro, non
  dal fondo (1,34:1 sul calcestruzzo).
- **Gesso vecchio `#627BB0`** (cobalto al 55% composto): la linea già vista.
  2,04:1 sulla lastra: è un ausilio, non porta informazione necessaria (la
  posizione la dicono cassetta, tacche e `aria-valuetext`).
- **Porta di riferimento in ferro, non in calcestruzzo ombra** (deviazione
  dalla direzione §4.4): l'ombra sulla lastra fa 1,34:1 ed è l'oggetto che dà
  la scala, quindi deve vedersi. Contorno ferro 1,5 px (lo spessore del filo)
  contro il gesso cobalto di 6 px della finestra: resta secondaria per
  spessore, non per colore.
- **Calcestruzzo ombra** solo dove non serve vederlo bene: segnaposto della
  foto, tratti vuoti della forbice (accanto al testo che dice cosa manca).
- **Calce mai sulla lastra** (1,84:1). Per questo l'anello di fuoco sugli
  oggetti pieni (bottone, cassetta) è calce **dentro** l'oggetto, come ha
  proposto l'interaction-designer: confermato e riportato nel DESIGN.md.
- Nessun tema scuro: il sito è un materiale, non un tema (skill §8: la
  modalità chiara qui è "print-emulating", e la fascia ferro è già il notte).

### 1.3 La lastra: mappa di luminanza in soft-light

- La texture non è una foto colorata: è una **mappa di luminanza in grigio**
  (media 128, valori stretti tra 116 e 146) fusa sulla tinta con
  `background-blend-mode: soft-light`. Calcolo con la formula W3C: la
  luminanza della lastra va da ×0,942 a ×1,062 della tinta, cioè dentro il
  ±6% della direzione. I contrasti del caso peggiore sono in tabella.
- Perché così e non una texture già tinta nel file: il grigio si comprime
  meglio, la tinta resta un token (si può ritoccare senza rifare il file) e
  lo stesso file fa anche la lastra in ombra (segnaposto). `soft-light` su
  un solo elemento con `background-blend-mode` non crea livelli di
  composizione in più.
- Ripetuta a 800 px CSS (file 1600) sul largo, 400 px CSS (file 800) sullo
  stretto: sempre a 2x. Deve essere **ripetibile senza cuciture**.
- Prima che arrivi, la lastra è già tinta piena del colore giusto: nessun
  salto di contrasto.
- **Prova fatta** con "Cast Concrete Texture" di Andrei Pripasu (Flickr,
  CC0, `https://live.staticflickr.com/5647/20980043116_9bcb5e9286_b.jpg`):
  getto da cassero con segni delle tavole e fori dei distanziatori. Ricetta:
  scala di grigi → tolta la luce generale (sottratta una sfocatura gaussiana
  di raggio 40 px) → normalizzata sul 99,5° percentile → portata su 128 ±15 e
  tagliata a 116-146. Risultato a schermo: si legge come calcestruzzo, il
  testo resta pulito. Due difetti visti a 1440: i **fori dei distanziatori**
  si ripetono in griglia ogni 800 px (si nota la ripetizione) e i segni
  orizzontali delle tavole sono linee, mentre l'unica linea del sito deve
  essere quella battuta. Indicazioni al photo-editor in "Richieste".

### 1.4 Marcatura a spruzzo

Provato a schermo a 1x e 2x: maschera `polvere-bordo.svg` (vector-artist,
~4% di lacune) sì **da 32 px in su** (titolo, fase, costo, h2 delle
schermate, mese enorme, data); **no** su marchio (a 24-28 px sembrava
consumato, non marcato), tacche e quote (mangia le aste). Su tutto l'alone
`text-shadow` di 0,6 px dello stesso colore. Con `mask-image` non supportato
la maschera si toglie e resta l'alone.

### 1.5 Griglia del filo

La griglia non convenzionale è la linea del tempo stessa: gancio 48 px +
16 passi uguali, gap 0. Le campate della scheda partono sulle tacche (fase
PRIMA-MAG, costo GIU-SET, testo OTT-CHIAVI). Prova a 1440 e 1366: con il
costo su tre passi il progressivo "speso finora 238.400 € su 412.500 €"
sbordava nella colonna del testo; su quattro passi sta (328 px a 1440,
~308 a 1366). Il testo su sette passi resta sotto i 62 caratteri per riga.
Dettaglio delle campate per S0, S1, S2 nel DESIGN.md §5.

### 1.6 Scala tipografica e altezza

I titoli stencil hanno un doppio limite: la larghezza (fluido 375 → 1440)
e l'altezza (vh), perché la lastra è al massimo 40vh. A 1366×768 la fase
scende a 51 px e il costo a 45 px e la scheda resta tutta sopra il filo
(screenshot `qa/art-director/shot-1366.png`). A 375 fase e costo sono 36,
corpo 16, nota 14.

---

## 2. Ruoli dei token (per i section-builder)

- Testo di lettura, etichette, fase, tacche, quote della porta:
  `--btf-testo` / `--btf-marcatura` (ferro).
- Link e prezzi piccoli in cobalto: `--btf-link` (cobalto fondo). Il
  `--btf-cobalto` come testo solo da 24 px (`.btf-stencil--gesso`).
- Linea battuta, rettangolo della finestra, tratti della forbice:
  `--btf-gesso`; già visto `--btf-gesso-vecchio`.
- Filo teso, tratteggio del vuoto, porta: `--btf-filo` (ferro, 1,5 px).
- Fuoco: `--btf-fuoco-lastra` (cobalto, 3 px a 3 px) sulla lastra e sui
  campi; `--btf-fuoco-ferro` (calce) su fascia, cartello e **dentro** bottone
  e cassetta.
- Errore: `--btf-errore` = ferro. Nessun colore di stato.
- Geometria: `--btf-fascia-h`, `--btf-lastra-h`, `--btf-foto-h-stretto`,
  `--btf-filo-h*`, `--btf-griglia-filo`, `--btf-margine`,
  `--btf-passo-stretto`, `--btf-marchio-da`, `--btf-lab-zona-w*`,
  `--btf-foto-max`, `--btf-lastra-max`.
- Media query a mano (le variabili non entrano nelle media query): 40em,
  60em, altezza 34em, larghezza 20em, 120em (elenco commentato in
  `tokens.css`, valori in `SOGLIE_EM`).

---

## 3. Contrasti WCAG 2.x (calcolati con `node scripts/contrasti.mjs`)

Luminanza relativa sRGB, formula WCAG 2.x. Soglie: testo 4,5:1, testo
grande e elementi non testuali 3:1. "Informativo" = coppia senza soglia
(decorativa, ausilio o riga di controllo di un divieto).

Lastra: tinta `#B8B4AB`; mappa di luminanza 116-146 in soft-light → punto più scuro `#B3AFA6` (luminanza ×0.94), punto più chiaro `#BDB9B0` (×1.06).

| Uso | Primo piano | Fondo | Colore reale del fondo | Rapporto | Soglia | Esito |
|---|---|---|---|---|---|---|
| testo di lettura, fase, tacche, quote della porta (ferro) | `#23272B` | lastra, tinta media | `#B8B4AB` | **7.27:1** | 4.5:1 | passa |
| testo di lettura, fase, tacche, quote della porta (ferro) | `#23272B` | lastra, punto più scuro | `#B3AFA6` | **6.89:1** | 4.5:1 | passa |
| testo di lettura, fase, tacche, quote della porta (ferro) | `#23272B` | lastra, punto più chiaro | `#BDB9B0` | **7.68:1** | 4.5:1 | passa |
| link e prezzi in riga, testo piccolo cobalto (cobalto fondo) | `#143A8C` | lastra, tinta media | `#B8B4AB` | **5.04:1** | 4.5:1 | passa |
| link e prezzi in riga, testo piccolo cobalto (cobalto fondo) | `#143A8C` | lastra, punto più scuro | `#B3AFA6` | **4.78:1** | 4.5:1 | passa |
| link e prezzi in riga, testo piccolo cobalto (cobalto fondo) | `#143A8C` | lastra, punto più chiaro | `#BDB9B0` | **5.33:1** | 4.5:1 | passa |
| cifre a stencil ≥ 24 px, quote della finestra (cobalto) | `#1C4CB4` | lastra, tinta media | `#B8B4AB` | **3.70:1** | 3:1 | passa (solo testo grande) |
| cifre a stencil ≥ 24 px, quote della finestra (cobalto) | `#1C4CB4` | lastra, punto più scuro | `#B3AFA6` | **3.51:1** | 3:1 | passa |
| cifre a stencil ≥ 24 px, quote della finestra (cobalto) | `#1C4CB4` | lastra, punto più chiaro | `#BDB9B0` | **3.91:1** | 3:1 | passa |
| linea battuta, tratti della forbice, rettangolo della finestra (cobalto) | `#1C4CB4` | lastra, tinta media | `#B8B4AB` | **3.70:1** | 3:1 | passa (non testuale) |
| linea battuta, tratti della forbice, rettangolo della finestra (cobalto) | `#1C4CB4` | lastra, punto più scuro | `#B3AFA6` | **3.51:1** | 3:1 | passa |
| linea battuta, tratti della forbice, rettangolo della finestra (cobalto) | `#1C4CB4` | lastra, punto più chiaro | `#BDB9B0` | **3.91:1** | 3:1 | passa |
| anello di fuoco sulla lastra (cobalto, 3 px) | `#1C4CB4` | lastra, tinta media | `#B8B4AB` | **3.70:1** | 3:1 | passa (non testuale) |
| anello di fuoco sulla lastra (cobalto, 3 px) | `#1C4CB4` | lastra, punto più scuro | `#B3AFA6` | **3.51:1** | 3:1 | passa |
| anello di fuoco sulla lastra (cobalto, 3 px) | `#1C4CB4` | lastra, punto più chiaro | `#BDB9B0` | **3.91:1** | 3:1 | passa |
| bordo del bottone cobalto sulla lastra | `#1C4CB4` | lastra, tinta media | `#B8B4AB` | **3.70:1** | 3:1 | passa (non testuale) |
| bordo del bottone cobalto sulla lastra | `#1C4CB4` | lastra, punto più scuro | `#B3AFA6` | **3.51:1** | 3:1 | passa |
| bordo del bottone cobalto sulla lastra | `#1C4CB4` | lastra, punto più chiaro | `#BDB9B0` | **3.91:1** | 3:1 | passa |
| filo teso, porta, tratteggio del vuoto, fascette (ferro) | `#23272B` | lastra, tinta media | `#B8B4AB` | **7.27:1** | 3:1 | passa (non testuale) |
| filo teso, porta, tratteggio del vuoto, fascette (ferro) | `#23272B` | lastra, punto più scuro | `#B3AFA6` | **6.89:1** | 3:1 | passa |
| filo teso, porta, tratteggio del vuoto, fascette (ferro) | `#23272B` | lastra, punto più chiaro | `#BDB9B0` | **7.68:1** | 3:1 | passa |
| pannello del cartello (ferro) sulla lastra | `#23272B` | lastra, tinta media | `#B8B4AB` | **7.27:1** | 3:1 | passa (non testuale) |
| pannello del cartello (ferro) sulla lastra | `#23272B` | lastra, punto più scuro | `#B3AFA6` | **6.89:1** | 3:1 | passa |
| pannello del cartello (ferro) sulla lastra | `#23272B` | lastra, punto più chiaro | `#BDB9B0` | **7.68:1** | 3:1 | passa |
| gesso già visto (cobalto 55%) | `#627BB0` | lastra, tinta media | `#B8B4AB` | **2.04:1** | n/a | informativo (ausilio, non necessario: la posizione la dicono cassetta e tacche) |
| gesso già visto (cobalto 55%) | `#627BB0` | lastra, punto più scuro | `#B3AFA6` | **1.93:1** | n/a | informativo |
| gesso già visto (cobalto 55%) | `#627BB0` | lastra, punto più chiaro | `#BDB9B0` | **2.15:1** | n/a | informativo |
| tratti vuoti della forbice (calcestruzzo ombra) | `#9F9B92` | lastra, tinta media | `#B8B4AB` | **1.34:1** | n/a | informativo (segnaposto: il testo accanto dice cosa manca) |
| tratti vuoti della forbice (calcestruzzo ombra) | `#9F9B92` | lastra, punto più scuro | `#B3AFA6` | **1.27:1** | n/a | informativo |
| tratti vuoti della forbice (calcestruzzo ombra) | `#9F9B92` | lastra, punto più chiaro | `#BDB9B0` | **1.42:1** | n/a | informativo |
| testo nei campi (ferro su rasatura) | `#23272B` | rasatura | `#D2D0C9` | **9.74:1** | 4.5:1 | passa |
| riga di base del campo (ferro su rasatura) | `#23272B` | rasatura | `#D2D0C9` | **9.74:1** | 3:1 | passa (non testuale) |
| anello di fuoco cobalto sul campo | `#1C4CB4` | rasatura | `#D2D0C9` | **4.96:1** | 3:1 | passa (non testuale) |
| testo cobalto fondo nel campo (bottone "Usa 118") | `#143A8C` | rasatura | `#D2D0C9` | **6.76:1** | 4.5:1 | passa |
| campo sulla lastra (rasatura su calcestruzzo) | `#D2D0C9` | lastra, tinta media | `#B8B4AB` | **1.34:1** | n/a | informativo (il campo si riconosce dalla riga di base ferro) |
| testo del bottone (calce su cobalto) | `#F1F2EE` | cobalto | `#1C4CB4` | **6.81:1** | 4.5:1 | passa |
| testo del bottone premuto (calce su cobalto fondo) | `#F1F2EE` | cobalto fondo | `#143A8C` | **9.27:1** | 4.5:1 | passa |
| testo su fascia e cartello (calce su ferro) | `#F1F2EE` | ferro | `#23272B` | **13.37:1** | 4.5:1 | passa |
| anello di fuoco calce su ferro | `#F1F2EE` | ferro | `#23272B` | **13.37:1** | 3:1 | passa (non testuale) |
| bordo del cartello (calce su ferro) | `#F1F2EE` | ferro | `#23272B` | **13.37:1** | 3:1 | passa (non testuale) |
| cassetta (ferro) sulla lastra: vedi riga "filo teso" | `#23272B` | lastra, punto più chiaro | `#BDB9B0` | **7.68:1** | 3:1 | passa (non testuale) |
| bottone cobalto sulla fascia ferro | `#1C4CB4` | ferro | `#23272B` | **1.96:1** | n/a | informativo (il bottone si riconosce dal testo calce (6,8:1)) |
| anello di fuoco calce intorno al bottone nella fascia | `#F1F2EE` | ferro | `#23272B` | **13.37:1** | 3:1 | passa (non testuale) |
| anello di fuoco calce DENTRO il bottone cobalto (interaction-designer) | `#F1F2EE` | cobalto | `#1C4CB4` | **6.81:1** | 3:1 | passa (non testuale) |
| anello di fuoco calce DENTRO la cassetta (ferro) | `#F1F2EE` | ferro | `#23272B` | **13.37:1** | 3:1 | passa (non testuale) |
| calce sulla lastra (perché l’anello calce non va fuori dagli oggetti) | `#F1F2EE` | lastra, tinta media | `#B8B4AB` | **1.84:1** | n/a | informativo (troppo debole: mai calce sulla lastra) |
| testo sul segnaposto in ombra (vietato) | `#23272B` | calcestruzzo ombra, punto più scuro | `#9A968C` | **5.07:1** | n/a | informativo (nessun testo sull’ombra: riga di controllo) |

tokens.css e tokens.ts coincidono (8 colori); i derivati tornano con le loro formule.

37 coppie con soglia su 37 passano.

---

## 4. Trattamento foto (per photo-editor e section-builder-foto)

- La correzione si fa **sui file** (direzione §4.3): bianchi verso la calce
  `#F1F2EE`, neri alzati verso il ferro `#23272B` (nessun nero sotto ~
  `#1E2125`), saturazione −15%, un filo di freddo. Nessun `filter`, velatura
  o gradiente CSS sulle foto.
- Ritaglio sulla linea di terra calcolato da `terra` e `fuoco`
  (`core/ritaglio.ts`, tech-architect §7.5): non fisso `object-position` per
  fascia di larghezza, come chiedeva la ux, perché la formula li ricava per
  ogni riquadro. Chiedo solo che `terra` sia misurato sul **bordo netto**
  (suolo, pavimento, bordo del solaio) e non sull'orizzonte lontano.
- Foto al massimo 1920 px di larghezza (`--btf-foto-max`): oltre, centrata,
  e ai lati la lastra (2560).
- Segnaposto mentre carica: `.btf-lastra .btf-lastra--ombra` (stessa
  texture, tinta in ombra), mai bianco o nero, mai un'icona.
- Mese senza foto: la lastra normale sale e la fase va in
  `.btf-stencil--enorme` (64 → 152 px), ferro.

---

## Richieste ad altri agent

- **photo-editor** (ondata 2): consegnare `assets/foto/lastra-1600.webp` e
  `lastra-800.webp` con questi nomi esatti (`lastra.css` li importa con
  `url()`: se mancano, il build si rompe). Formato: **mappa di luminanza in
  grigio**, media 128 ±1, valori tutti tra 116 e 146 (verificabile con
  `LASTRA_MAPPA` di `tokens.ts`), **ripetibile senza cuciture**, getto liscio
  con bolle d'aria. Preferibilmente **senza fori di distanziatori e senza
  segni orizzontali delle tavole** (si ripetono in griglia e fanno linee che
  competono con la linea battuta); se si parte dalla CC0 di Andrei Pripasu
  (§1.3), ritoccare via fori e righe, oppure scegliere un getto liscio.
  Ricetta di trattamento in §1.3. Pesi del tech-architect: ≤ 70 KB e ≤ 30 KB.
- **section-builder-misura** (ondata 3): porta di riferimento in ferro
  1,5 px con quote ferro, non in calcestruzzo ombra (§1.2); campi con
  `.btf-rasatura`; bottone con `.btf-bottone-cobalto`.
- **section-builder-scheda / apertura / chiavi** (ondata 3): campate della
  griglia del filo come nel DESIGN.md §5 (costo su quattro passi);
  costo in `.btf-stencil .btf-stencil--costo .btf-stencil--gesso` con il
  riquadro `.btf-stencil--riquadro-costo`.
- **section-builder-linea** (ondata 3): la maschera della tessera va su un
  elemento con `.btf-gesso` (o `.btf-gesso--vecchio`) in `linea.css`; i nomi
  dei mesi con `.btf-stencil .btf-stencil--tacca`; il ripiego senza mask è
  già in `lastra.css`.
- **scaffold-engineer** (ondata 3): `core/fonts.ts` legge `FONT_CSS_URL`,
  `FONT_PRECONNECT`, `FONT_DA_CARICARE` da `styles/tokens.ts` (stessi nomi
  del pilota); ordine dei CSS del tech-architect §5 (`lastra.css` dopo
  `layout.css`); fondo ferro su html/body con `COLORI.ferro`.
- **accessibility-auditor** (ondata 4): campionare la texture vera sotto il
  testo e confrontare con gli estremi della tabella (`#B3AFA6`, `#BDB9B0`).
