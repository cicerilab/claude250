# Art director · Concept 15 · NOVANTA

Ondata 2. Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, la riga 15 di
`docs/matrice-concept-11-20.md`, tutti i doc dell'ondata 0-1 in
`concepts/15-novanta/docs/` (creative-director, trend-researcher,
brand-strategist, ux-architect, tech-architect), la skill
`design-taste-frontend` (§4.1, 4.2, 6.C, 8, 9), `DESIGN.md` e
`docs/art-director.md` del pilota (solo per formato).

## File consegnati

| File | Contenuto |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: tema, palette con ruoli, tipografia, componenti, griglia polare, profondità, foto, do/don't, responsive, prompt guide |
| `src/pages/concepts/novanta/styles/tokens.css` | `@font-face` di ripiego tarati, variabili `--nov-*` (colori, ruoli, scala fluida, pesi, spazi, forme, focus, misure dello strumento, foto, livelli), geometria bordo/fondo (media query di prima pittura + `[data-geo]`), `prefers-contrast: more`, `forced-colors` |
| `src/pages/concepts/novanta/styles/tokens.ts` | `COLORI`, `OMBRA_BRACCIO`, `FONT_CSS_URL`, `FONT_DA_CARICARE`, `FAMIGLIE`, `CIFRE_EPILOGUE` (metriche misurate), `TIPO`, `GRADI`, `STRUMENTO` (bordo/fondo/mini), `raggioMaxFondo()`, `RAGGI`, `ALTEZZE`, `FOCUS`, `SPAZI`, `COLONNA`, `Z`, `SOGLIE_EM`, `FOTO_TRATTAMENTO`, `luminanza()`, `contrasto()` |
| `src/pages/concepts/novanta/assets/foto/index.ts` | tipi `ChiaveFoto`, `FotoNovanta`; `FOTO = {}` e `CI_SONO_FOTO = false` (piano B) |
| `qa/art-director/s_*.png` | prove a schermo (1440×900, 1024×700, 375×667) |

Verifiche: `tsc --strict --noUncheckedIndexedAccess --noUnusedLocals` su
`tokens.ts` e `assets/foto/index.ts` verde. Pagina di prova (scratch, fuori
dal repo) con `tokens.css` vero, quadrante SVG disegnato con le misure di
`STRUMENTO`, font veri serviti con `page.route` (verificati con
`document.fonts.check`), Chromium Playwright: 1440×900 (0°, 30°), 1024×700
(150°), 375×667 (0°, 60°). `scrollWidth` = larghezza in tutti i casi.

---

## 1. Decisioni

### 1.1 Tipografia: confermo Epilogue + Lexend, con `tnum`

- **Epilogue ha `tnum`** (letto nel GSUB del woff2 v20; ha anche `pnum`,
  `frac`, niente `ss`). A 800 ogni cifra tabellare avanza 0,6095 em (le
  proporzionali vanno da 0,467 a 0,668: il "1" è stretto e "111" ballerebbe).
  Quindi **niente tre box per cifra**: `font-variant-numeric: tabular-nums`
  e una scatola di 2,17 em (3 cifre + "°" a 300). Decisione chiesta dal
  creative-director §4.10 e dal tech-architect §1.3.
- Il "°" a 300 visto a schermo a 234 px: anello sottile in alto a destra,
  legge come unità di misura, non come decorazione. Tenuto.
- **Cinque taglie per raddoppio** (trend P3): nota 14, corpo 17→18, titolo
  28→36, misura 56→72, gradi 104 / 26 svh; più il logotipo 22→28. Divergenze:
  gradi in vista elenco **72/56** (l'ux chiedeva 96/72: sarebbe una sesta
  taglia); h2 mobile 28 (ux 26: arrotondato alla scala).
- **Gradi desktop a 26 svh** (144-280 px), non 22: il piano B senza foto è
  attivo (vedi §6) e l'ux stesso prevede 26vh senza foto. A 90° 16 svh.
- Pesi: 800 / 700 / 500 / 300 di Epilogue, 400 / 500 di Lexend. Nessun 600.
- Font caricati: un solo file per famiglia (variabili), latin 35,7 + 39,7 KB.

### 1.2 Palette

Tre colori del creative-director, invariati. Derivati calcolati e composti
(nessuna trasparenza lasciata alle sezioni). Differenze dal creative-director,
tutte per contrasto misurato:
- testo secondario **petrolio 78%** (`#415E63`, 5,03:1), non 72% (4,31:1,
  non passa);
- parole inattive del quadrante **petrolio pieno**, distinte per peso e
  sottolineatura (il 60% era 3,24:1);
- **tacche non percorse in petrolio 34% su gesso** (`#ABB8B9`), non
  albicocca scura: sul gesso l'albicocca scura (1,60:1) sembrava una macchia
  e l'arco "percorso" non si leggeva; il petrolio spento contro il petrolio
  pieno legge come una misura presa (5,77:1 tra i due stati). L'albicocca
  scura resta per lo spicchio chiuso, le pillole in hover e la selezione;
- **contorno 1,5 px petrolio sull'arco del disco**: gesso su albicocca è
  1,31:1, senza contorno il disco a 375 spariva (trend §4.1).

### 1.3 Un solo tema

Deciso (l'ux lo lasciava a me): **solo chiaro**, `color-scheme: light`.
Motivazione in `DESIGN.md` §2.6 (identità del campo albicocca, rischio di
somiglianza con 20 IMBRUNIRE in un modo scuro petrolio, luminanza 0,70 non
abbagliante). Coperti invece `prefers-contrast: more` e `forced-colors`.

### 1.4 Griglia polare

Nessuna griglia a colonne: tutto si misura dal perno (anelli a R−78, R−44, R,
R+40, R+66, colonna da R+220, linea di lettura = y del perno). Dettaglio in
`DESIGN.md` §5.1.

### 1.5 Texture

Nessuna grana, carta o rumore: il campo è pieno (trend P6). La texture è la
graduazione (181 tacche a tre lunghezze). Vista a schermo: dà al disco una
"pelle" fitta e precisa che a 1440 regge da sola il vuoto a destra.

### 1.6 Misure dello strumento (viste a schermo)

`STRUMENTO` in `tokens.ts` e variabili in `tokens.css`. Due correzioni nate
dalla prova:
1. **Parole a 66 px dall'arco su desktop** (non 28): con il braccio 40 px
   oltre l'arco e la manopola di 28, a 28 px la manopola si posava sopra la
   parola dell'angolo attivo (visto a 30° e a 150°). A 66 px resta 12 px
   d'aria. A 1024×700 la parola dei 180° cade a y ≈ 86, sotto la fascia del
   bottone del sito.
2. **Numeri 0 e 180 spostati di 16 px verso il campo** su desktop: sul bordo
   dello schermo venivano tagliati a metà.
Su mobile la manopola sta **sull'arco** (sporgenza 0): con il raggio 150 a
375 la manopola disegnata è a x = 37,5 a 0° e 337,5 a 180°, dentro lo
schermo
(`raggioMaxFondo(375)` = 158,5, trend §4.2).

---

## 2. Contrasti WCAG 2.x (calcolati)

Script `contrasti.mjs` in appendice (luminanza relativa sRGB, formula WCAG
2.x). Soglie: testo 4,5:1, elementi non testuali 3:1. **Tutte le coppie con
soglia usate nel sito passano**; le righe RIFERIMENTO sono i valori scartati, e l'unica coppia reale che non passa è segnata come
combinazione vietata e scritta nelle regole di `DESIGN.md`.

| Coppia | Primo piano | Fondo | Rapporto | Soglia | Esito |
|---|---|---|---|---|---|
| petrolio su albicocca: testo | `#0E3D49` | `#F4D5C0` | **8.49:1** | 4.5:1 | passa |
| petrolio su gesso: testo (disco, campi, listino) | `#0E3D49` | `#FCF8F3` | **11.14:1** | 4.5:1 | passa |
| gesso su petrolio: testo del bottone pieno | `#FCF8F3` | `#0E3D49` | **11.14:1** | 4.5:1 | passa |
| gesso su petrolio profondo: bottone pieno in hover/premuto | `#FCF8F3` | `#0A2C35` | **13.94:1** | 4.5:1 | passa |
| petrolio quieto su albicocca: testo secondario | `#415E63` | `#F4D5C0` | **5.03:1** | 4.5:1 | passa |
| petrolio quieto su gesso: testo secondario sul disco/campi | `#415E63` | `#FCF8F3` | **6.61:1** | 4.5:1 | passa |
| petrolio quieto su albicocca scura | `#415E63` | `#E9BFA3` | **4.14:1** | 4.5:1 | NON passa: **combinazione vietata** (sull'albicocca scura solo petrolio pieno) |
| petrolio su albicocca scura: pillola in hover, selezione, "chiuso" | `#0E3D49` | `#E9BFA3` | **6.98:1** | 4.5:1 | passa |
| petrolio su gesso: parola del quadrante sul disco | `#0E3D49` | `#FCF8F3` | **11.14:1** | 4.5:1 | passa |
| anello di focus petrolio su albicocca (non testo) | `#0E3D49` | `#F4D5C0` | **8.49:1** | 3:1 | passa |
| anello di focus petrolio su gesso (non testo) | `#0E3D49` | `#FCF8F3` | **11.14:1** | 3:1 | passa |
| contorno del disco petrolio su albicocca (non testo) | `#0E3D49` | `#F4D5C0` | **8.49:1** | 3:1 | passa |
| bordo del campo petrolio quieto su albicocca (non testo) | `#415E63` | `#F4D5C0` | **5.03:1** | 3:1 | passa |
| bordo del campo petrolio quieto su gesso (non testo) | `#415E63` | `#FCF8F3` | **6.61:1** | 3:1 | passa |
| bordo pillola contorno petrolio su albicocca (non testo) | `#0E3D49` | `#F4D5C0` | **8.49:1** | 3:1 | passa |
| bottone pieno petrolio su albicocca (non testo) | `#0E3D49` | `#F4D5C0` | **8.49:1** | 3:1 | passa |
| manopola petrolio su gesso (non testo) | `#0E3D49` | `#FCF8F3` | **11.14:1** | 3:1 | passa |
| manopola petrolio su albicocca (oltre l'arco, non testo) | `#0E3D49` | `#F4D5C0` | **8.49:1** | 3:1 | passa |
| tacca percorsa petrolio su gesso (non testo) | `#0E3D49` | `#FCF8F3` | **11.14:1** | 3:1 | passa |
| tacca spenta su gesso (decorativa: lo stato lo dice il numero) | `#ABB8B9` | `#FCF8F3` | **1.93:1** | nessuna | decorativo |
| tacca spenta contro tacca percorsa (differenza di stato) | `#ABB8B9` | `#0E3D49` | **5.77:1** | nessuna | decorativo |
| gesso su albicocca: disco sul fondo (il bordo lo fa il contorno) | `#FCF8F3` | `#F4D5C0` | **1.31:1** | nessuna | decorativo |
| albicocca scura su gesso: spicchio "chiuso" (c'è la parola) | `#E9BFA3` | `#FCF8F3` | **1.60:1** | nessuna | decorativo |
| albicocca scura su albicocca | `#E9BFA3` | `#F4D5C0` | **1.22:1** | nessuna | decorativo |
| filetto su albicocca (decorativo) | `#C1B4A6` | `#F4D5C0` | **1.46:1** | nessuna | decorativo |
| inattivo su albicocca (disabilitato, esente) | `#8D918A` | `#F4D5C0` | **2.31:1** | nessuna | decorativo |
| contrasto aumentato: tacca spenta #6E8488 su gesso | `#6E8488` | `#FCF8F3` | **3.73:1** | 3:1 | passa |
| RIFERIMENTO petrolio 72% su albicocca (scartato) | `#4E686A` | `#F4D5C0` | **4.31:1** | 4.5:1 | NON passa |
| RIFERIMENTO petrolio 60% su albicocca (scartato) | `#6A7A79` | `#F4D5C0` | **3.24:1** | 4.5:1 | NON passa |
| RIFERIMENTO albicocca scura su gesso come tacca (scartata) | `#E9BFA3` | `#FCF8F3` | **1.60:1** | 3:1 | NON passa |

Letture:
- Tutto il testo è petrolio pieno o petrolio quieto su albicocca o gesso:
  minimo 5,03:1.
- Il bottone pieno si riconosce per il fondo (8,49:1 sul campo), la pillola
  per il bordo petrolio (8,49:1), il campo per il bordo quieto (5,03:1).
- Tacca spenta, filetto, spicchio chiuso, disco sul fondo sono decorativi per
  costruzione: lo stato lo dicono sempre il numero, la parola o la forma.

---

## 3. Come si usano variabili e classi

### 3.1 Ordine di import (scaffold, `Novanta.tsx`, tech-architect §5)

`tokens.css` → `base.css` → `layout.css` → `dial/arco.css` →
`motion/motion.css` → `interaction/interaction.css` → CSS di sezione.

### 3.2 Regole per i section-builder

- Solo ruoli e variabili `--nov-*`; nessun hex, nessun `rgba()` nuovo.
- Il numero dei gradi: classe della sezione con
  `font-family: var(--nov-font-misura); font-weight: var(--nov-peso-gradi);
  font-size: var(--nov-fs-gradi); line-height: var(--nov-lh-gradi);
  letter-spacing: var(--nov-trk-gradi); font-variant-numeric: var(--nov-cifre);
  inline-size: var(--nov-gradi-larghezza)`; il "°" in uno `span` con
  `font-weight: var(--nov-peso-simbolo)`.
- Superfici: `background: var(--nov-superficie); border-radius:
  var(--nov-raggio)`; niente ombre.
- Bottoni e pillole: `border-radius: var(--nov-pillola)`, altezze
  `--nov-h-bottone` / `--nov-h-pillola`, campi `--nov-h-campo`.
- Focus: `outline: var(--nov-focus-anello); outline-offset:
  var(--nov-focus-distanza)`.
- Foto: leggere `FOTO[chiave]` da `assets/foto`; se `undefined`, niente
  elemento (piano B). Nessun riquadro vuoto.
- Nel codice TS: `import { COLORI, STRUMENTO, FONT_CSS_URL } from
  '../styles/tokens'` (percorso relativo alla sezione).

---

## 4. Richieste ad altri agent

**scaffold-engineer**
- `core/fonts.ts`: usare `FONT_CSS_URL` e, per `fontsReady()`,
  `FONT_DA_CARICARE` da `styles/tokens.ts`.
- `core/modo.ts`: nel calcolo di `r` in geometria `fondo` aggiungere il
  limite `raggioMaxFondo(w)` di `tokens.ts` (manopola dentro lo schermo con
  16 px di margine). In `bordo` il limite del tech-architect (`(h − T)/2 − 16
  − 64`) va bene con le parole a 66 px.
- `base.css`: `.nov-root ::selection { background: var(--nov-selezione-fondo);
  color: var(--nov-selezione-testo); }`; `.nov-root` con
  `font-family: var(--nov-font-testo)`, `font-size: var(--nov-fs-corpo)`,
  `line-height: var(--nov-lh-corpo)`, `-webkit-font-smoothing: antialiased`.
- `index.html`: fondo inline `#F4D5C0` (= `COLORI.albicocca`) e
  `<meta name="theme-color" content="#F4D5C0">`, `<meta name="color-scheme"
  content="light">`.

**vector-artist** (`dial/`)
- Leggere lunghezze, spessori, distanze di numeri e parole da `STRUMENTO`
  (bordo/fondo/mini) invece di costanti proprie; colori solo via
  `var(--nov-strumento)`, `var(--nov-superficie)`, `var(--nov-tacca-spenta)`
  in `arco.css`.
- Contorno 1,5 px petrolio **solo sull'arco** (non sul lato dritto: è il
  bordo dello schermo o il basamento).
- Numeri 0 e 180 in geometria bordo spostati di 16 px verso il campo.
- Favicon: mezzo disco gesso con contorno petrolio e braccio petrolio a 90°
  su quadrato albicocca (niente testo).

**section-builder-quadrante**
- Oblò (finestrella) tondo sul braccio a `R − rientroFinestrella`, bordo 3 px
  petrolio, fondo gesso, numero intero Epilogue 700 12 px tnum
  **controruotato** (mai testo storto). Ombra `--nov-ombra-braccio` sul
  gruppo braccio + oblò + manopola + perno, non sul disco.
- A 375 le parole vicine all'arco agli angoli 0° e 180° vanno ancorate verso
  l'interno dello schermo (nella prova "primo incontro" usciva a sinistra).

**section-builder-prenota**
- Lettura al centro dell'anello su due righe (giorno / ora) in titolo: su
  una riga "ven 2 · 18:00" a 36 px è circa 290 px, più largo del foro
  dell'anello.

**copywriter**
- Il marchio è un logotipo maiuscolo ("NOVANTA"); tutti gli altri testi in
  minuscolo naturale (nessun maiuscolo decorativo).

**ux-architect / responsive-tester**
- Gradi in vista elenco 72/56 (non 96/72) e parole a 66 px dall'arco su
  desktop: da considerare nei wireframe a 1440.

---

## 5. Cosa non ho fatto (di proposito)

- Nessun modo scuro (§1.3).
- Nessuna foto (§6).
- Nessuna texture, nessuna seconda ombra, nessun colore nuovo.
- Nessuna durata o curva di movimento: sono del motion-designer.

---

## 6. Foto: ricerca e piano B

Obiettivo del creative-director: al massimo tre foto dello **studio vuoto**
(lettino con luce di finestra, spalliera, elastici/rullo appoggiati,
ingresso), senza persone. Ricerca del 26/09/2026:

| Fonte | Esito |
|---|---|
| Unsplash, `unsplash.com/napi/search` (curl) | 307 → pagina anti-bot "Making sure you're not a bot!" |
| Unsplash in Chromium Playwright (pagina di ricerca e API) | il controllo anti-bot non si risolve; poi `ERR_TOO_MANY_RETRIES` |
| Bing Immagini (per trovare URL `images.unsplash.com`) | risultati non pertinenti (paesaggi, moto, ritratti), anche con `site:` |
| DuckDuckGo Immagini | l'endpoint JSON rifiuta la richiesta |
| Openverse (`api.openverse.org`), licenze cc0/pdm/by/by-sa: "physiotherapy room", "massage table", "treatment room", "physiotherapy clinic", "therapy room", "physio room", "resistance bands", "wall bars", "osteopathy", "spa room" | solo facciate di cliniche, reparti ospedalieri d'archivio, pazienti con terapisti, loghi |
| Wikimedia Commons (API): "Physiotherapiepraxis", "kinésithérapie cabinet", "physiotherapy treatment room" | facciate (Estrablin 01-03, CC BY 4.0: esterno trasandato), stanze d'ospedale storiche; una sala riabilitativa (Hilahalumit) ha il logo di un'altra attività sul muro e scatole con numeri "04" che farebbero concorrenza ai gradi |

Guardate con Read le miniature di tutti i candidati pertinenti (tre fogli di
provini): nessuna è uno studio di fisioterapia vuoto, credibile, senza
persone e senza marchi altrui. **Piano B attivo**, come il creative-director
(§4.5) e il trend-researcher (§4.8) prevedevano: nessuna foto nel sito,
`FOTO = {}`, numero dei gradi a 26 svh. La prova a schermo a 1440 conferma
che il quadrante regge il campo da solo. Se Luca vuole foto vere dello studio
di un cliente, il trattamento è in `DESIGN.md` §7 e il contratto in
`assets/foto/index.ts`. Domini da sbloccare per riprovare: `unsplash.com`
(la ricerca; `images.unsplash.com` scarica già).

---

## Appendice: script dei contrasti

Eseguito con `node contrasti.mjs` (Node 22); riproduce la tabella del §2.

```js
// NOVANTA · contrasti WCAG 2.x (luminanza relativa sRGB). node contrasti.mjs
const hex2rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
const rgb2hex = c => '#' + c.map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const lin = v => { v/=255; return v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4; };
const L = h => { const [r,g,b] = hex2rgb(h).map(lin); return 0.2126*r + 0.7152*g + 0.0722*b; };
const cr = (a,b) => { const [x,y] = [L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const over = (fg, bg, a) => rgb2hex(hex2rgb(bg).map((v,i)=> v*(1-a) + hex2rgb(fg)[i]*a));

const C = { albicocca:'#F4D5C0', petrolio:'#0E3D49', gesso:'#FCF8F3' };
const D = {
  petrolioQuieto: over(C.petrolio, C.albicocca, 0.78),      // testo secondario (su albicocca e su gesso)
  petrolioProfondo: rgb2hex(hex2rgb(C.petrolio).map(v=>v*0.72)), // hover/premuto del bottone pieno
  albicoccaScura: '#E9BFA3',                                 // spicchio chiuso, fondo hover delle pillole, selezione
  taccaSpenta: over(C.petrolio, C.gesso, 0.34),              // tacche non percorse sul disco, ore occupate
  filetto: over(C.petrolio, C.albicocca, 0.22),              // filo tra le voci del listino
  inattivo: over(C.petrolio, C.albicocca, 0.45),             // controlli disabilitati (esenti)
};
const rows = [];
const t = (nome, fg, bg, soglia) => rows.push([nome, fg, bg, cr(fg,bg), soglia]);
t('petrolio su albicocca: testo', C.petrolio, C.albicocca, 4.5);
t('petrolio su gesso: testo (disco, campi, listino)', C.petrolio, C.gesso, 4.5);
t('gesso su petrolio: testo del bottone pieno', C.gesso, C.petrolio, 4.5);
t('gesso su petrolio profondo: bottone pieno in hover/premuto', C.gesso, D.petrolioProfondo, 4.5);
t('petrolio quieto su albicocca: testo secondario', D.petrolioQuieto, C.albicocca, 4.5);
t('petrolio quieto su gesso: testo secondario sul disco/campi', D.petrolioQuieto, C.gesso, 4.5);
t('petrolio quieto su albicocca scura: secondario su pillola in hover', D.petrolioQuieto, D.albicoccaScura, 4.5);
t('petrolio su albicocca scura: pillola in hover, selezione, "chiuso"', C.petrolio, D.albicoccaScura, 4.5);
t('petrolio su gesso: parola del quadrante sul disco', C.petrolio, C.gesso, 4.5);
t('anello di focus petrolio su albicocca (non testo)', C.petrolio, C.albicocca, 3);
t('anello di focus petrolio su gesso (non testo)', C.petrolio, C.gesso, 3);
t('contorno del disco petrolio su albicocca (non testo)', C.petrolio, C.albicocca, 3);
t('bordo del campo petrolio quieto su albicocca (non testo)', D.petrolioQuieto, C.albicocca, 3);
t('bordo del campo petrolio quieto su gesso (non testo)', D.petrolioQuieto, C.gesso, 3);
t('bordo pillola contorno petrolio su albicocca (non testo)', C.petrolio, C.albicocca, 3);
t('bottone pieno petrolio su albicocca (non testo)', C.petrolio, C.albicocca, 3);
t('manopola petrolio su gesso (non testo)', C.petrolio, C.gesso, 3);
t('manopola petrolio su albicocca (oltre l\'arco, non testo)', C.petrolio, C.albicocca, 3);
t('tacca percorsa petrolio su gesso (non testo)', C.petrolio, C.gesso, 3);
t('tacca spenta su gesso (decorativa: lo stato lo dice il numero)', D.taccaSpenta, C.gesso, 0);
t('tacca spenta contro tacca percorsa (differenza di stato)', D.taccaSpenta, C.petrolio, 0);
t('gesso su albicocca: disco sul fondo (il bordo lo fa il contorno)', C.gesso, C.albicocca, 0);
t('albicocca scura su gesso: spicchio "chiuso" (c\'è la parola)', D.albicoccaScura, C.gesso, 0);
t('albicocca scura su albicocca', D.albicoccaScura, C.albicocca, 0);
t('filetto su albicocca (decorativo)', D.filetto, C.albicocca, 0);
t('inattivo su albicocca (disabilitato, esente)', D.inattivo, C.albicocca, 0);
t('contrasto aumentato: tacca spenta #6E8488 su gesso', '#6E8488', C.gesso, 3);
t('RIFERIMENTO petrolio 72% su albicocca (scartato)', over(C.petrolio,C.albicocca,.72), C.albicocca, 4.5);
t('RIFERIMENTO petrolio 60% su albicocca (scartato)', over(C.petrolio,C.albicocca,.60), C.albicocca, 4.5);
t('RIFERIMENTO albicocca scura su gesso come tacca (scartata)', D.albicoccaScura, C.gesso, 3);
console.log('Derivati:', JSON.stringify(D));
console.log('| Coppia | Primo piano | Fondo | Rapporto | Soglia | Esito |');
console.log('|---|---|---|---|---|---|');
for (const [n,f,b,r,s] of rows) console.log(`| ${n} | \`${f}\` | \`${b}\` | **${r.toFixed(2)}:1** | ${s ? s+':1' : 'nessuna'} | ${s ? (r >= s ? 'passa' : 'NON passa') : 'decorativo'} |`);
```
