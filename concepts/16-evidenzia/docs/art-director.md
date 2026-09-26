# Art director · Concept 16 · EVIDENZIA

Ondata 2. Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`, `docs/matrice-concept-11-20.md`
(riga e paragrafo 16), `concepts/10-torchio/docs/integrazione-sito.md`, tutti i
doc dell'ondata 1 in `concepts/16-evidenzia/docs/` (creative-director,
trend-researcher, brand-strategist, ux-architect, tech-architect), le skill
`design-taste-frontend` e `full-output-enforcement`, e dal pilota
`DESIGN.md`, `docs/art-director.md`, `styles/tokens.*` (solo formato).

## File consegnati

| File | Contenuto |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: tema, palette con ruoli, tipografia, componenti, layout, profondità, texture, do/don't, responsive, prompt guide |
| `src/pages/concepts/evidenzia/styles/tokens.css` | tre `@font-face` di ripiego tarati, tutti i token `--evd-*` su `.evd-root` (colori, ruoli, tratto, mappa, corpi, interlinee, spazi, griglia, foto, molo, pannelli, fuoco, ombra, livelli z), override per la colonna (< 640), contrasto forzato |
| `src/pages/concepts/evidenzia/styles/tokens.ts` | `FONT_CSS_URL`, `FONT_PRECONNECT`, `FONT_STACK`, `FONT_DA_CARICARE`, `METRICHE`, `LARGHEZZE_EM`, `COLORI` (solo test), `OPACITA`, `TRATTO`, `TIPO` + `corpo()` e `altezzaTratto()`, `GRIGLIA` + `xColonna()`, `larghezzaSpan()`, `xFiletto()`, `FOTO`, `BREAKPOINT`, `COLONNA`, `MOLO`, `PANNELLI`, `MAPPA`, `UI`, `Z`, `scalaPaginaIntera()`, `contrasto()`, `multiply()` |

Nessun CSS di sezione (tech-architect §4). Verifiche: `tsc --strict
--noUncheckedIndexedAccess --noUnusedLocals --noUnusedParameters` su
`tokens.ts` verde; pagina di prova (scratchpad, fuori dal repo) con
`tokens.css` vero e i woff2 veri, fotografata con Chromium a 1440 × 900,
768 × 1024 e 375 × 667 e **guardata**: screenshot in
`concepts/16-evidenzia/qa/art-director/` (ignorati da git).

---

## 1. Decisioni

### 1.1 Palette: confermo i cinque colori della matrice, un solo accento

`#E4DFD1`, `#1C1C1A`, `#4F4C46`, `#8F8B82`, `#EE5A9E`. Il dubbio era la
carta: sulla carta del hex è un grigio-beige vicino alle "carte calde" che la
skill vieta come default. A schermo, accanto al nero stampa e al rosa fluo, si
legge come carta da quotidiano e non come crema (screenshot a 1440): il rosa
freddo la raffredda. La tengo, e la difendo con le regole, non cambiando
tinta: niente bianco, niente texture, niente seppia, niente ombre calde.
I derivati nascono tutti dai cinque (carta premuta = carta + 8% nero, velo =
nero 30%, ombra = carta scura, retino piatto = carta + 60% retino).

### 1.2 Tratto: tetto 0,85 composto, e l'inchiostro in più sta sotto il tetto

Il creative-director chiede "più inchiostro all'inizio e alla fine". A
opacità 1 in multiply il nero sotto il tratto scende a **4,28:1** (fallisce);
il limite calcolato è 0,945. Quindi il gruppo SVG del tratto sta a 0,85 e
dentro le opacità sono relative: corpo 0,88, striature 0,62, estremità 1.
Composti 0,75 / 0,53 / 0,85: il punto più scuro è proprio il limite del CD
(4,96:1), il corpo è più leggero (5,56:1). Così le estremità "caricano" senza
mai superare 0,85, e due tratti non si sovrappongono mai.

### 1.3 Tipografia: corpi fissi sul foglio, fluidi nella colonna e nei pannelli

Il foglio è un oggetto di 1840 px identico da 640 a 2560: se il corpo
cambiasse con la finestra, cambierebbe l'impaginato (altezze, pareggio,
minipagina). Quindi corpi fissi in rem da 640 in su, fluidi 320 → 639 nella
colonna, fluidi 375 → 1440 in scheda e giro. Misure fatte con i woff2 veri:
- testata 144 (non 132): *EVIDENZIA* = 808 px, riempie c1-c3 (844) come una
  testata vera; a 375 diventa 52 px = 0,85 della colonna;
- messaggio del riquadro 34 px: la frase lunga sta su una riga di 556 px;
- attacco P/F 16 px (non 17): ci stanno circa 32 caratteri a 268 px. I 38
  caratteri del brand-strategist vanno su due righe: va bene (il tratto
  regge due righe), ma il copywriter sappia che sotto i 32 sta su una;
- testo 15/1,4 invece di 15/1,38: riga da 21 px intera, niente decimali che
  si accumulano su 2060 px di pagina e pareggio delle colonne esatto.

### 1.4 Font: URL ristretto (224 → 109 KB)

L'URL del tech-architect (`Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400`)
scarica Newsreader latin da 132 KB e il corsivo da 63 KB: con Franklin 29 KB
fa 224 KB, oltre il budget di 200. Newsreader grassetto non serve (tutto ciò
che è grassetto è Franklin, regola P3), e il corsivo si usa solo a 18 px.
Nuovo URL in `tokens.ts`:
`family=Libre+Franklin:wght@400..900&family=Newsreader:ital,opsz,wght@0,6..72,400;1,18,400`
→ 29,3 + 57,3 + 22,9 = **109 KB**, risposta 200 verificata il 26/09/2026.

### 1.5 Ripieghi tarati su font con gemelli metrici

Ripiego di Newsreader su Times / Liberation Serif / Tinos, non Georgia
(proposta del tech-architect): Georgia non esiste su Linux e Android e non ha
un gemello metrico, quindi il `size-adjust` sarebbe giusto solo su Mac e
Windows. Misure (Chromium, testo italiano degli annunci): Franklin 800 contro
Arial Bold 101,1% (700: 100,3%, 900: 102,0%); Newsreader opsz 15-16 contro
Times 104,3-106,7% → 105,5%; corsivo 92,4%. Ascent e descent letti dai file
con fontTools.

### 1.6 Griglia

Presa dall'ux-architect come vincolo (5, 5.1): 66 + 6 × 268 + 5 × 20 + 66 =
1840, margine alto 72, spazio molo 360 × 320. Aggiungo come token gli span
(556, 844, 1132, 1708), il filetto a centro canaletto e le altezze fisse delle
foto. La griglia è "non convenzionale" perché è più larga della finestra e il
ritmo lo fanno i formati, non le sezioni.

### 1.7 Retino delle foto: doppio schermo, passo 3 px

Provato a schermo (stessa foto di prova, fuori dal repo) in tre versioni:
1. schermo unico con punti retino o neri secondo il tono, passo 4 px: macchie
   nere a grumi, sembra un filtro;
2. stesso a passo 3: meglio ma ancora a grumi;
3. **due schermi**: retino a 45° per tutti i toni + nero a 15° solo oltre il
   45% di tono, passo 3 px CSS (6 nel file 2×). Tono continuo, rosetta vera
   da stampa, la casa si riconosce. **Scelto.**
Lo script di prova è in appendice B come specifica per `scripts/retino.py`
(photo-editor). In Pagina intera il retino a scala 0,4 farebbe moiré: la foto
diventa un piatto `--evd-retino-piatto`.

### 1.8 Stati senza colore, e un cambio sui posti vuoti

- Posto vuoto del molo: l'ux-architect lo voleva "filetto retino" (2,55:1,
  sotto il 3:1 di WCAG 1.4.11 per un indicatore di stato). Diventa contorno
  **tratteggiato** `--evd-posto-vuoto` = secondario (6,43:1).
- Posto pieno: tratto rosa 36 × 18 con il numero di tappa nero Franklin 800
  14 dentro (4,96:1). Nella barra mobile (24 × 10) niente numero: pieno contro
  tratteggiato è già una differenza di forma.
- Errori: nessun rosso. Frase in nero Franklin 700 sotto il campo, bordo del
  campo a 2 px.

### 1.9 Contrasto forzato

In `forced-colors: active` rosa e multiply spariscono: le variabili passano
ai colori di sistema e `--evd-tratto-forzato: 1` dice a `tratto.css` di
disegnare il tratto come barra `Highlight` di 4 px **sotto** la riga (a opacità
piena sopra il testo lo coprirebbe).

---

## 2. Contrasti WCAG 2.x (calcolati)

Script Node in appendice A (luminanza relativa sRGB, formula WCAG 2.x;
multiply come lo fanno i browser: `base × (1 − a) + base × rosa × a`;
`grayscale(0.35)` dei tile con la matrice della specifica Filter Effects).
Soglie: testo 4,5:1, elementi non testuali 3:1. Colori OSM: palette standard
di openstreetmap-carto. **Tutte le coppie con soglia passano tranne le due
marcate VIETATO**, che esistono nella tabella per dimostrare le regole.

| Gruppo | Coppia | Primo piano | Fondo | Rapporto | Soglia | Esito |
|---|---|---|---|---|---|---|
| foglio | nero stampa su carta (testo) | `#1C1C1A` | `#E4DFD1` | **12,82:1** | 4,50:1 | passa |
| foglio | secondario su carta (Rif., date, zona) | `#4F4C46` | `#E4DFD1` | **6,43:1** | 4,50:1 | passa |
| foglio | carta su nero (barre rubrica, bottoni pieni) | `#E4DFD1` | `#1C1C1A` | **12,82:1** | 4,50:1 | passa |
| foglio | nero su carta scura 8% (hover riga, fondo premuto) | `#1C1C1A` | `#D4CFC2` | **10,97:1** | 4,50:1 | passa |
| foglio | secondario su carta scura 8% | `#4F4C46` | `#D4CFC2` | **5,50:1** | 4,50:1 | passa |
| foglio | retino su carta (filetti, punti foto) | `#8F8B82` | `#E4DFD1` | 2,55:1 | nessuna | decorativo |
| foglio | filo nero 1-3 px su carta (testata, bordo riquadro) | `#1C1C1A` | `#E4DFD1` | **12,82:1** | 3,00:1 | passa |
| tratto | nero sotto l'estremità del tratto (0,85, il massimo ammesso) | `#1C1C1A` | `#D7648D` | **4,96:1** | 4,50:1 | passa |
| tratto | nero sotto il corpo del tratto (0,85 × 0,88) | `#1C1C1A` | `#D97396` | **5,56:1** | 4,50:1 | passa |
| tratto | nero sotto una striatura (0,85 × 0,62) | `#1C1C1A` | `#DC93A7` | **7,13:1** | 4,50:1 | passa |
| tratto | nero sotto un tratto a opacità 1 (VIETATO: niente doppi passaggi) | `#1C1C1A` | `#D54F81` | **4,28:1** | 4,50:1 | NON passa |
| tratto | secondario sotto il tratto (VIETATO) | `#4F4C46` | `#D7648D` | **2,48:1** | 4,50:1 | NON passa |
| tratto | nero sotto il tratto scarico (0,35) | `#1C1C1A` | `#DFACB5` | **8,70:1** | 4,50:1 | passa |
| tratto | tratto 0,85 su carta (segno, non testo) | `#D7648D` | `#E4DFD1` | 2,59:1 | nessuna | decorativo |
| tratto | rosa pieno su carta (riferimento) | `#EE5A9E` | `#E4DFD1` | 2,39:1 | nessuna | decorativo |
| tratto | nero su rosa pieno (numero nel marcatore opaco) | `#1C1C1A` | `#EE5A9E` | **5,36:1** | 4,50:1 | passa |
| stati | anello di fuoco nero su carta (non testo) | `#1C1C1A` | `#E4DFD1` | **12,82:1** | 3,00:1 | passa |
| stati | anello di fuoco nero sul fondo nero via stacco carta 2 px | `#E4DFD1` | `#1C1C1A` | **12,82:1** | 3,00:1 | passa |
| stati | posto vuoto: filetto tratteggiato secondario su carta | `#4F4C46` | `#E4DFD1` | **6,43:1** | 3,00:1 | passa |
| stati | bordo campo nero 1 px su carta | `#1C1C1A` | `#E4DFD1` | **12,82:1** | 3,00:1 | passa |
| stati | carta su secondario (bottone "Mando il giro…" disattivo) | `#E4DFD1` | `#4F4C46` | **6,43:1** | 4,50:1 | passa |
| stati | numero di tappa nero nel posto pieno (0,85) | `#1C1C1A` | `#D7648D` | **4,96:1** | 4,50:1 | passa |
| stati | retino piatto (foto in Pagina intera) su carta | `#B1ADA2` | `#E4DFD1` | 1,68:1 | nessuna | decorativo |
| stati | selezione: carta su nero | `#E4DFD1` | `#1C1C1A` | **12,82:1** | 4,50:1 | passa |
| livelli | nero su velo 30% (foglio oscurato, inerte) | `#1C1C1A` | `#A8A59A` | 6,92:1 | nessuna | decorativo |
| livelli | carta su velo 30% (riferimento) | `#E4DFD1` | `#A8A59A` | 1,85:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su terreno (tile #F2EFE9 → #F1EFEB) | `#E89ABA` | `#F1EFEB` | 1,87:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su strada (tile #FFFFFF → #FFFFFF) | `#F6A4CA` | `#FFFFFF` | 1,90:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su primaria (tile #FCD6A4 → #F0D8B7) | `#E78B91` | `#F0D8B7` | 1,79:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su secondaria (tile #F7FABF → #F6F8D2) | `#EDA0A6` | `#F6F8D2` | 1,89:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su parco (tile #C8FACC → #D5F5D7) | `#CD9EAA` | `#D5F5D7` | 1,97:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su acqua (tile #AAD3DF → #B6D0D8) | `#AF86AB` | `#B6D0D8` | 1,91:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su edificio (tile #D9D0C9 → #D6D0CC) | `#CE86A1` | `#D6D0CC` | 1,82:1 | nessuna | decorativo |
| mappa | percorso rosa 0,55 multiply su residenziale (tile #E0DFDF → #E0DFDF) | `#D890B0` | `#E0DFDF` | 1,85:1 | nessuna | decorativo |
| mappa | numero nero nel marcatore (macchia 0,85 su terreno) | `#1C1C1A` | `#E36C9F` | **5,62:1** | 4,50:1 | passa |
| mappa | macchia del marcatore su terreno (non testo) | `#E36C9F` | `#F1EFEB` | 2,65:1 | nessuna | decorativo |
| mappa | numero nero nel marcatore (macchia 0,85 su primaria) | `#1C1C1A` | `#E2617C` | **5,07:1** | 4,50:1 | passa |
| mappa | macchia del marcatore su primaria (non testo) | `#E2617C` | `#F0D8B7` | 2,44:1 | nessuna | decorativo |
| mappa | numero nero nel marcatore (macchia 0,85 su parco) | `#1C1C1A` | `#C96E91` | **4,98:1** | 4,50:1 | passa |
| mappa | macchia del marcatore su parco (non testo) | `#C96E91` | `#D5F5D7` | 2,92:1 | nessuna | decorativo |
| mappa | marcatore agenzia: carta su nero | `#E4DFD1` | `#1C1C1A` | **12,82:1** | 4,50:1 | passa |
| mappa | attribuzione OSM: nero su carta 90% sopra tile | `#1C1C1A` | `#E5DECE` | **12,74:1** | 4,50:1 | passa |
| mappa | controlli zoom: bordo nero su carta | `#1C1C1A` | `#E4DFD1` | **12,82:1** | 3,00:1 | passa |

Letture:
- **Tratto**: regge solo sopra testo nero, e solo a opacità composta ≤ 0,85.
  Il limite calcolato è 0,945; tengo 0,85 per margine (antialias, schermi
  calibrati diversi). Mai secondario sotto il rosa: se la seconda riga del
  tratto finirebbe su testo secondario, quella riga si compone in nero.
- **Rosa sulla carta (2,39-2,59:1)** e **percorso sui tile (1,79-1,97:1)** sono
  sotto 3:1: non portano mai informazione da soli. Lo stato "nel giro" ha il
  bottone pieno con `aria-pressed` e l'etichetta "Nel giro"; i posti hanno
  numero o tratteggio; i marcatori hanno il numero nero (≥ 4,98:1 su ogni
  tile); il percorso ripete ciò che la colonna del giro dice per esteso.
- **Retino** (2,55:1) solo decorativo: filetti e punti delle foto.
- **Velo 30%**: il foglio sotto scheda e giro è inerte; i numeri sono di
  riferimento.

---

## 3. Come si usano variabili e classi

### 3.1 Ordine di import (scaffold, in `Evidenzia.tsx`)

```ts
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
// poi i CSS delle sezioni, importati dai componenti
```

### 3.2 Gruppi di variabili

| Gruppo | Variabili |
|---|---|
| Colori base | `--evd-carta`, `--evd-nero`, `--evd-secondario`, `--evd-retino`, `--evd-rosa` |
| Derivati | `--evd-carta-premuta`, `--evd-velo`, `--evd-ombra-tinta`, `--evd-retino-piatto`, `--evd-attribuzione-fondo` |
| Ruoli (da preferire) | `--evd-fondo`, `--evd-testo`, `--evd-testo-secondario`, `--evd-filetto-colore`, `--evd-filo-colore`, `--evd-bottone-fondo/-testo`, `--evd-bottone-disattivo-fondo`, `--evd-barra-fondo/-testo`, `--evd-campo-fondo/-bordo`, `--evd-errore-testo`, `--evd-selezione-fondo/-testo`, `--evd-posto-vuoto` |
| Tratto | `--evd-tratto-colore`, `-blend`, `-opacita`, `-corpo`, `-striatura`, `-estremita`, `-scarico`, `-altezza`, `-dy-max`, `-rotazione-max`, `-forzato` |
| Mappa | `--evd-mappa-filtro`, `--evd-percorso-colore/-opacita/-spessore`, `--evd-marcatore-l/-h`, `--evd-marcatore-agenzia` |
| Font e pesi | `--evd-font-titoli`, `--evd-font-testo`, `--evd-peso-testata/-attacco/-titolo/-prezzo/-interfaccia/-servizio/-testo` |
| Corpi foglio/colonna | `--evd-fs-testata`, `-riquadro`, `-sottotesto`, `-come-funziona`, `-barra`, `-attacco-t`, `-attacco-r`, `-attacco`, `-cerchiamo`, `-testo`, `-prezzo`, `-prezzo-grande`, `-box-titolo`, `-listino`, `-citazione`, `-sommario`, `-data`, `-bottone`, `-bottone-grande`, `-servizio` |
| Corpi pannelli | `--evd-fs-scheda-titolo`, `-scheda-prezzo`, `-confronto`, `-descrizione`, `-pannello-testo`, `-giro-titolo`, `-orario`, `-etichetta`, `-campo`, `-errore` |
| Interlinea, tracking, cifre | `--evd-lh-*` (testata, riquadro, titolo, attacco, barra, testo, sottotesto, lettura, interfaccia, servizio), `--evd-trk-*`, `--evd-cifre` |
| Spazi | `--evd-sp-1` … `--evd-sp-9` (4 → 64) |
| Griglia | `--evd-foglio-l/-h`, `--evd-colonne`, `--evd-colonna`, `--evd-canaletto`, `--evd-margine`, `--evd-margine-alto`, `--evd-foglio-spazio-destro/-basso`, `--evd-span-2/3/4/6`, `--evd-filetto`, `--evd-filo`, `--evd-filo-testata`, `--evd-bordo-riquadro`, `--evd-annunci-stacco`, `--evd-barra-h` |
| Foto | `--evd-foto-t-h`, `--evd-foto-f-h`, `--evd-foto-r-l/-h`, `--evd-retino-passo`, `--evd-scheda-foto-h` |
| Colonna (solo < 640) | `--evd-colonna-margine`, `--evd-colonna-fondo`, `--evd-barra-giro-h`, `--evd-striscia-h` |
| Molo | `--evd-molo-l`, `--evd-molo-distanza`, `--evd-molo-ridotto-h`, `--evd-minipagina-l/-h`, `--evd-posto-tratto-l/-h` |
| Pannelli | `--evd-scheda-l`, `--evd-scheda-testa-h`, `--evd-giro-l`, `--evd-giro-mappa-l`, `--evd-giro-colonna-l`, `--evd-giro-testa-h` |
| UI | `--evd-tocco`, `--evd-bottone-h`, `--evd-bottone-h-grande`, `--evd-campo-h`, `--evd-raggio` |
| Fuoco e link | `--evd-fuoco-colore/-spessore/-distanza/-alone`, `--evd-sottolineatura(-hover, -distanza)` |
| Profondità | `--evd-ombra-stacco`, `--evd-filo-pannello` |
| Livelli | `--evd-z-foglio` 0, `-comandi` 20, `-scarico` 25, `-velo` 30, `-scheda` 40, `-giro` 50 |

### 3.3 Esempi

Attacco di un annuncio P:

```css
.evd-root .evd-annuncio__attacco {
  font-family: var(--evd-font-titoli);
  font-weight: var(--evd-peso-attacco);
  font-size: var(--evd-fs-attacco);
  line-height: var(--evd-lh-attacco);
  letter-spacing: var(--evd-trk-attacco);
  color: var(--evd-testo);
}
```

Tratto (in `tratto.css`, interaction-designer):

```css
.evd-root .evd-tratto {
  mix-blend-mode: var(--evd-tratto-blend);
  opacity: var(--evd-tratto-opacita);
  fill: var(--evd-tratto-colore);
}
.evd-root .evd-tratto__corpo { fill-opacity: var(--evd-tratto-corpo); }
.evd-root .evd-tratto__striatura { fill-opacity: var(--evd-tratto-striatura); }
.evd-root .evd-tratto--scarico { opacity: var(--evd-tratto-scarico); }
```

Anello di fuoco (in `interaction.css`):

```css
.evd-root :focus-visible {
  outline: var(--evd-fuoco-spessore) solid var(--evd-fuoco-colore);
  outline-offset: var(--evd-fuoco-distanza);
  box-shadow: var(--evd-fuoco-alone);
}
```

Prezzo: `font-variant-numeric: var(--evd-cifre);`. Posizione di un blocco
nell'impaginato: `xColonna(4)` → 930, `larghezzaSpan(2)` → 556.

### 3.4 Regole per i section-builder

1. Nessun hex nei CSS di sezione: solo `var(--evd-*)`.
2. Rosa solo nei file elencati dal tech-architect (§5): tratto, molo, giro,
   mappa. Mai su testo, bottoni, link, fondi.
3. Sotto il tratto solo testo in `--evd-nero`, peso 800.
4. Franklin per ciò che si tocca o si scansiona; Newsreader per ciò che si
   legge; niente grassetto Newsreader (`font-synthesis: none`).
5. Corpi sotto 14 px vietati; testo di lettura mai sotto 15 (foglio) / 16
   (colonna).
6. I blocchi a più colonne hanno `background: var(--evd-fondo)` per coprire
   i filetti (nella prova il filetto attraversava il sottotesto del riquadro).
7. Raggio 0 ovunque, un'ombra sola (`--evd-ombra-stacco`) solo nello stacco.
8. Foto sul foglio: altezza fissa dai token, `width`/`height` sull'`<img>`.

---

## 4. Richieste ad altri agent

**scaffold-engineer**
- `base.css`: `.evd-root { background-color: var(--evd-fondo); color:
  var(--evd-testo); font-family: var(--evd-font-testo); font-size:
  var(--evd-fs-testo); line-height: var(--evd-lh-testo); font-synthesis: none;
  font-optical-sizing: auto; -webkit-text-size-adjust: 100%; }`,
  `.evd-root ::selection { background: var(--evd-selezione-fondo); color:
  var(--evd-selezione-testo); }`, `h1-h3` in `--evd-font-titoli` senza
  margini di default, `button` con `border-radius: var(--evd-raggio)`.
- `core/fonts.ts`: usa `FONT_CSS_URL` e `FONT_DA_CARICARE` di `tokens.ts`
  (URL cambiato rispetto al tech-architect, §1.4).
- `index.html`: fondo inline `#E4DFD1` (già previsto).
- `foglio.css`: filetti a `xFiletto(n)` (centro canaletto), 1 px
  `--evd-filetto-colore`; in `data-vista="intera"` le foto a retino si
  sostituiscono con `--evd-retino-piatto`.

**tech-architect**
- Aggiornare §1.3 con il nuovo URL dei font (109 KB invece di 224) e il
  ripiego serif su Times invece di Georgia.

**photo-editor**
- `scripts/retino.py`: retino a **due schermi** (retino `#8F8B82` a 45° su
  tutti i toni, nero `#1C1C1A` a 15° solo oltre il 45%), passo **6 px nel file
  2×** (3 px CSS), carta trasparente, contrasto automatico 1%; poi
  quantizzazione a palette (3 colori + trasparenza) per stare sotto 22 KB.
  Specifica eseguibile in appendice B. Questo corregge il "passo circa 4 px a
  2×" del tech-architect e il "non sotto 4 px CSS" del trend-researcher: a
  schermo 4 px CSS era un effetto, non una foto.

**vector-artist**
- `tratto/forma.ts`: il tratto è **un gruppo** con tre famiglie di path
  (corpo, striature, estremità) che la CSS colora con `fill-opacity`
  relative; nessuna opacità scritta nella geometria. Le striature sono
  **più chiare** (0,62 relativo), non tagli di colore carta.
- Posto del molo: tratto 36 × 18 (colonna 24 × 10).

**interaction-designer**
- `tratto.css`: le variabili di §3.3; `--evd-tratto-forzato: 1` →
  barra `Highlight` di 4 px sotto la riga, niente multiply.
- Mai due tratti sovrapposti sulla stessa riga (ripassare = togliere).

**copywriter**
- Attacco P/F: sotto 32 caratteri sta su una riga del foglio; fino a 38 va su
  due (accettato). Attacco T: fino a circa 48 su due righe.
- Errori dei campi come frasi complete ("Manca il telefono: serve per
  confermare il giro"): non c'è un colore d'errore.

**ux-architect**
- Posto vuoto: contorno tratteggiato secondario invece del filetto retino
  (§1.8, WCAG 1.4.11).

**section-builder (tutti)**
- Regole di §3.4. Controllo finale: screenshot a memoria vuota, il rosa deve
  essere solo sul tratto di "Segna".

---

## Appendice A: script dei contrasti

Eseguito con `node contrasti.mjs` (Node 22). Produce la tabella del §2.

```js
// Contrasti WCAG 2.x di EVIDENZIA (art-director, ondata 2). node contrasti.mjs
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const L = h => { const [r, g, b] = hex2rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => rgb2hex(hex2rgb(a).map((v, i) => v * (1 - t) + hex2rgb(b)[i] * t));   // t = quota di b
const over = (fg, bg, alpha) => mix(bg, fg, alpha);                                              // fg con opacità alpha su bg
// mix-blend-mode: multiply con opacità: out = base*(1-a) + base*blend*a (sRGB, come i browser)
const multiply = (base, blend, a) => rgb2hex(hex2rgb(base).map((v, i) => v * (1 - a) + (v * hex2rgb(blend)[i] / 255) * a));
// filter: grayscale(g) (matrice della specifica Filter Effects, in sRGB come fa Chromium sulle funzioni brevi)
const grayscale = (h, g) => { const [r, gg, b] = hex2rgb(h); const s = 1 - g;
  return rgb2hex([
    (0.2126 + 0.7874 * s) * r + (0.7152 - 0.7152 * s) * gg + (0.0722 - 0.0722 * s) * b,
    (0.2126 - 0.2126 * s) * r + (0.7152 + 0.2848 * s) * gg + (0.0722 - 0.0722 * s) * b,
    (0.2126 - 0.2126 * s) * r + (0.7152 - 0.7152 * s) * gg + (0.0722 + 0.9278 * s) * b]); };

export const C = {
  carta: '#E4DFD1', nero: '#1C1C1A', secondario: '#4F4C46', retino: '#8F8B82', rosa: '#EE5A9E',
};
const OPACITA_TRATTO = 0.85, OPACITA_SCARICO = 0.35, OPACITA_PERCORSO = 0.55, VELO = 0.30, GRIGIO_MAPPA = 0.35;
const D = {
  tratto: multiply(C.carta, C.rosa, OPACITA_TRATTO),
  trattoPieno: multiply(C.carta, C.rosa, 1),
  trattoCorpo: multiply(C.carta, C.rosa, OPACITA_TRATTO * 0.88),
  trattoStriatura: multiply(C.carta, C.rosa, OPACITA_TRATTO * 0.62),
  scarico: multiply(C.carta, C.rosa, OPACITA_SCARICO),
  velo: over(C.nero, C.carta, VELO),
  cartaScura: mix(C.carta, C.nero, 0.08),       // fondo di campi e righe "premute" (hover di un posto, riga pari del listino)
  disattivo: C.secondario,
};
// OSM standard (colori di carto-osm) dopo grayscale 35%
const OSM = { terreno: '#F2EFE9', strada: '#FFFFFF', primaria: '#FCD6A4', secondaria: '#F7FABF', parco: '#C8FACC', acqua: '#AAD3DF', edificio: '#D9D0C9', residenziale: '#E0DFDF' };
const OSMg = Object.fromEntries(Object.entries(OSM).map(([k, v]) => [k, grayscale(v, GRIGIO_MAPPA)]));

const rows = []; const f = n => n.toFixed(2).replace('.', ',');
const t = (gruppo, nome, fg, bg, soglia) => rows.push({ gruppo, nome, fg, bg, r: cr(fg, bg), soglia });

t('foglio', 'nero stampa su carta (testo)', C.nero, C.carta, 4.5);
t('foglio', 'secondario su carta (Rif., date, zona)', C.secondario, C.carta, 4.5);
t('foglio', 'carta su nero (barre rubrica, bottoni pieni)', C.carta, C.nero, 4.5);
t('foglio', 'nero su carta scura 8% (hover riga, fondo premuto)', C.nero, D.cartaScura, 4.5);
t('foglio', 'secondario su carta scura 8%', C.secondario, D.cartaScura, 4.5);
t('foglio', 'retino su carta (filetti, punti foto)', C.retino, C.carta, 0);
t('foglio', 'filo nero 1-3 px su carta (testata, bordo riquadro)', C.nero, C.carta, 3);
t('tratto', 'nero sotto l\'estremità del tratto (0,85, il massimo ammesso)', C.nero, D.tratto, 4.5);
t('tratto', 'nero sotto il corpo del tratto (0,85 × 0,88)', C.nero, D.trattoCorpo, 4.5);
t('tratto', 'nero sotto una striatura (0,85 × 0,62)', C.nero, D.trattoStriatura, 4.5);
t('tratto', 'nero sotto un tratto a opacità 1 (VIETATO: niente doppi passaggi)', C.nero, D.trattoPieno, 4.5);
t('tratto', 'secondario sotto il tratto (VIETATO)', C.secondario, D.tratto, 4.5);
t('tratto', 'nero sotto il tratto scarico (0,35)', C.nero, D.scarico, 4.5);
t('tratto', 'tratto 0,85 su carta (segno, non testo)', D.tratto, C.carta, 0);
t('tratto', 'rosa pieno su carta (riferimento)', C.rosa, C.carta, 0);
t('tratto', 'nero su rosa pieno (numero nel marcatore opaco)', C.nero, C.rosa, 4.5);
t('stati', 'anello di fuoco nero su carta (non testo)', C.nero, C.carta, 3);
t('stati', 'anello di fuoco nero sul fondo nero via stacco carta 2 px', C.carta, C.nero, 3);
t('stati', 'posto vuoto: filetto tratteggiato secondario su carta', C.secondario, C.carta, 3);
t('stati', 'bordo campo nero 1 px su carta', C.nero, C.carta, 3);
t('stati', 'carta su secondario (bottone "Mando il giro…" disattivo)', C.carta, D.disattivo, 4.5);
t('stati', 'numero di tappa nero nel posto pieno (0,85)', C.nero, D.tratto, 4.5);
t('stati', 'retino piatto (foto in Pagina intera) su carta', '#B1ADA2', C.carta, 0);
t('stati', 'selezione: carta su nero', C.carta, C.nero, 4.5);
t('livelli', 'nero su velo 30% (foglio oscurato, inerte)', C.nero, D.velo, 0);
t('livelli', 'carta su velo 30% (riferimento)', C.carta, D.velo, 0);
for (const [k, v] of Object.entries(OSMg)) {
  t('mappa', `percorso rosa 0,55 multiply su ${k} (tile ${OSM[k]} → ${v})`, multiply(v, C.rosa, OPACITA_PERCORSO), v, 0);
}
for (const k of ['terreno', 'primaria', 'parco']) {
  const macchia = multiply(OSMg[k], C.rosa, OPACITA_TRATTO);
  t('mappa', `numero nero nel marcatore (macchia 0,85 su ${k})`, C.nero, macchia, 4.5);
  t('mappa', `macchia del marcatore su ${k} (non testo)`, macchia, OSMg[k], 0);
}
t('mappa', 'marcatore agenzia: carta su nero', C.carta, C.nero, 4.5);
t('mappa', 'attribuzione OSM: nero su carta 90% sopra tile', C.nero, over(C.carta, OSMg.primaria, 0.9), 4.5);
t('mappa', 'controlli zoom: bordo nero su carta', C.nero, C.carta, 3);

// massimo scurimento ammesso sotto testo nero: luminanza minima del fondo per 4,5:1
const Lmin = 4.5 * (L(C.nero) + 0.05) - 0.05;
let aMax = 0; for (let a = 0; a <= 1.0001; a += 0.005) if (L(multiply(C.carta, C.rosa, a)) >= Lmin) aMax = a;

console.log('Derivati:', D);
console.log('OSM in grigio 35%:', OSMg);
console.log(`Luminanza minima del fondo per nero 4,5:1 = ${Lmin.toFixed(4)}; opacità massima del tratto in multiply sotto testo nero = ${aMax.toFixed(3)}`);
console.log('| Gruppo | Coppia | Primo piano | Fondo | Rapporto | Soglia | Esito |');
console.log('|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.gruppo} | ${r.nome} | \`${r.fg}\` | \`${r.bg}\` | ${r.soglia ? '**' + f(r.r) + ':1**' : f(r.r) + ':1'} | ${r.soglia ? f(r.soglia) + ':1' : 'nessuna'} | ${r.soglia ? (r.r >= r.soglia ? 'passa' : 'NON passa') : 'decorativo'} |`);
```

## Appendice B: specifica eseguibile del retino (per il photo-editor)

Eseguita con Python 3.11 + Pillow 12.3 sulla foto di prova (fuori dal repo):
`python3 retino2.py 6 retino.png`. Il 6 è il passo nel file 2×.

```python
import math, sys
from PIL import Image, ImageDraw, ImageOps
def schermo(d, im, W, H, passo, angolo, colore, tono, S):
    a = math.radians(angolo); ca, sa = math.cos(a), math.sin(a)
    R = int(max(W,H)*1.5/passo)+2
    for i in range(-R, R):
        for j in range(-R, R):
            x = (i*ca - j*sa)*passo + W/2; y = (i*sa + j*ca)*passo + H/2
            if not (-passo <= x < W+passo and -passo <= y < H+passo): continue
            px = im.getpixel((min(W-1,max(0,int(x))), min(H-1,max(0,int(y)))))
            t = tono(1 - px/255)
            if t <= 0.04: continue
            r = passo*0.5*math.sqrt(t)*1.15
            d.ellipse([(x-r)*S,(y-r)*S,(x+r)*S,(y+r)*S], fill=colore)
def retino(src, W, H, passo, out):
    im = ImageOps.autocontrast(ImageOps.fit(Image.open(src).convert('L'), (W, H)), cutoff=1)
    S=4; big = Image.new('RGBA', (W*S, H*S), (0,0,0,0)); d = ImageDraw.Draw(big)
    schermo(d, im, W, H, passo, 45, (0x8F,0x8B,0x82,255), lambda k: min(1, k*1.25), S)          # retino: tutti i toni
    schermo(d, im, W, H, passo, 15, (0x1C,0x1C,0x1A,255), lambda k: max(0, (k-0.45)/0.55)**1.1, S)  # nero: solo ombre
    big.resize((W,H), Image.LANCZOS).save(out)
retino('prova.jpg', 536, 336, int(sys.argv[1]), sys.argv[2])
```
