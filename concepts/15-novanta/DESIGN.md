---
version: 1
name: NOVANTA-fisioterapia-e-osteopatia
description: Sito di uno studio di fisioterapia e osteopatia di Pordenone costruito come un unico strumento, il goniometro del fisioterapista. Un mezzo disco di gesso graduato grado per grado, appoggiato al bordo dello schermo su un campo pieno di albicocca; un braccio petrolio che si alza da 0° a 180° ed è la navigazione. Epilogue pesante per i gradi, Lexend per leggere. Tre colori, nessuna foto (piano B), un solo raggio, una sola ombra.

colors:
  albicocca: "#F4D5C0"
  petrolio: "#0E3D49"
  gesso: "#FCF8F3"
  petrolio-quieto: "#415E63"
  petrolio-profondo: "#0A2C35"
  albicocca-scura: "#E9BFA3"
  tacca-spenta: "#ABB8B9"
  filetto: "#C1B4A6"
  inattivo: "#8D918A"

typography:
  gradi:
    fontFamily: Epilogue
    fontSize: 104px (fondo, max 15.6svh) | clamp(144px, 26svh, 280px) (bordo)
    fontWeight: 800
    fontFeature: tnum
    lineHeight: 0.84
    letterSpacing: -0.03em
  simbolo-grado:
    fontFamily: Epilogue
    fontSize: come le cifre
    fontWeight: 300
  misura:
    fontFamily: Epilogue
    fontSize: 56px → 72px
    fontWeight: 800
    fontFeature: tnum
    lineHeight: 0.9
    letterSpacing: -0.02em
  titolo:
    fontFamily: Epilogue
    fontSize: 28px → 36px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -0.015em
  marchio:
    fontFamily: Epilogue
    fontSize: 22px → 28px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0.04em
    textTransform: uppercase
  scala:
    fontFamily: Epilogue
    fontSize: 14px
    fontWeight: 500
    fontFeature: tnum
  corpo:
    fontFamily: Lexend
    fontSize: 17px → 18px
    fontWeight: 400
    lineHeight: 1.6
  interfaccia:
    fontFamily: Lexend
    fontSize: 17px → 18px
    fontWeight: 500
    lineHeight: 1.25
  nota:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0.01em

rounded:
  superficie: 14px
  pillola: 999px

spacing:
  sp-1: 4px
  sp-2: 8px
  sp-3: 12px
  sp-4: 16px
  sp-5: 24px
  sp-6: 32px
  sp-7: 48px
  sp-8: 64px
  sp-9: 96px
  sp-10: 120px
  margine: 20px → 48px
  colonna: 520px
  colonna-stretta: 352px

components:
  bottone-pieno:
    backgroundColor: "{colors.petrolio}"
    textColor: "{colors.gesso}"
    typography: "{typography.interfaccia}"
    rounded: "{rounded.pillola}"
    height: 56px
  pillola-contorno:
    backgroundColor: transparent (hover "{colors.albicocca-scura}")
    textColor: "{colors.petrolio}"
    border: 1.5px "{colors.petrolio}"
    typography: "{typography.interfaccia}"
    rounded: "{rounded.pillola}"
    height: 44px
  campo:
    backgroundColor: "{colors.gesso}"
    textColor: "{colors.petrolio}"
    border: 1.5px "{colors.petrolio-quieto}" (focus 2px "{colors.petrolio}" + anello)
    rounded: "{rounded.superficie}"
    height: 52px
  disco:
    backgroundColor: "{colors.gesso}"
    border: 1.5px "{colors.petrolio}" solo sull'arco
  braccio:
    color: "{colors.petrolio}"
    thickness: 10px (bordo) | 8px (fondo)
    shadow: 0 3px 3px petrolio 12%
---

# NOVANTA · Design system

Concept 15 del Concept Lab di CiceriLab, rotta `/concept-15`. Documento di
riferimento per tutti i section-builder. I valori vivono in
`src/pages/concepts/novanta/styles/tokens.css` (variabili `--nov-*`) e
`tokens.ts` (stessi numeri per il codice). Contrasti calcolati e prove a
schermo in `docs/art-director.md`.

## 1. Visual Theme & Atmosphere

Il sito è **uno strumento solo**: il goniometro di plastica che il
fisioterapista appoggia sulla spalla alla prima visita. Non un sito con dentro
un'illustrazione di goniometro: il goniometro è il menu, il titolo di sezione
e il calendario.

Il campo è **albicocca pieno** a tutta finestra, senza sfumature, senza grana,
senza vignettatura. Sopra ci sta un oggetto chiaro e preciso, il mezzo disco
di **gesso**, graduato in **petrolio** grado per grado (181 tacche), con un
braccio pieno che si afferra. Il resto è testo fermo, orizzontale, allineato.

L'atmosfera è quella di uno studio luminoso di mattina: caldo ma misurato,
niente camici, niente ospedale, niente benessere da spa. Precisione senza
freddezza.

**Caratteristiche chiave**
- Un campo pieno di un colore che nessun altro concept usa (albicocca).
- Un solo oggetto sollevato, il braccio: unica ombra del sito.
- Il numero dei gradi enorme, pesante, a cifre fisse: è l'unico "titolo di
  sezione" (niente "01 ·", niente occhielli).
- Due famiglie con ruoli netti: Epilogue misura, Lexend spiega.
- Tondo solo su ciò che si afferra o si preme; 14 px sulle superfici; nessun
  altro raggio.
- Nessuna foto (piano B del creative-director, attivo: §7 di
  `docs/art-director.md`). Nessuna figura, nessun corpo, nessuna icona
  decorativa.

**La texture è la graduazione.** Non c'è rumore, carta o grana: la trama del
sito sono le tacche, 1 ogni grado, media ogni 5, lunga ogni 10. Da lontano il
disco ha la "pelle" fitta e regolare di uno strumento stampato; da vicino è
leggibile tacca per tacca.

## 2. Color Palette & Roles

### 2.1 I tre colori

| Nome | Hex | Variabile | Ruolo |
|---|---|---|---|
| **albicocca** | `#F4D5C0` | `--nov-albicocca` → `--nov-fondo` | Il campo. Fondo di tutto, sempre: quadrante, 90°, vista elenco, prerender. |
| **petrolio** | `#0E3D49` | `--nov-petrolio` → `--nov-testo`, `--nov-strumento`, `--nov-primario`, `--nov-focus` | Unico scuro e unico accento: testo, braccio, tacche percorse, perno, contorni, bottone pieno, anello di focus. |
| **gesso** | `#FCF8F3` | `--nov-gesso` → `--nov-superficie`, `--nov-su-primario` | Faccia del goniometro, basamento mobile, campi, disclosure delle ore, spicchi dell'anello, testo sul bottone pieno. **Mai fondo pagina.** |

### 2.2 Derivati (composti su uno dei tre, nessun colore nuovo)

| Nome | Hex | Composizione | Uso | Regola |
|---|---|---|---|---|
| petrolio quieto | `#415E63` | petrolio 78% su albicocca | testo secondario, righe "di esempio", bordo dei campi | 5,03:1 su albicocca, 6,61:1 su gesso. **Mai sopra albicocca scura** (4,14:1). |
| petrolio profondo | `#0A2C35` | petrolio × 0,72 | bottone pieno in hover e premuto | gesso sopra 13,94:1 |
| albicocca scura | `#E9BFA3` | (dal creative-director) | spicchio "chiuso" della domenica, fondo delle pillole in hover, selezione del testo | sopra solo petrolio **pieno** (6,98:1) |
| tacca spenta | `#ABB8B9` | petrolio 34% su gesso | tacche non ancora percorse, ore occupate dell'anello | decorativo (1,93:1): lo stato lo dicono il numero e la forma |
| filetto | `#C1B4A6` | petrolio 22% su albicocca | filo di 1 px tra le voci di un elenco (listino, trattamenti) | decorativo |
| inattivo | `#8D918A` | petrolio 45% su albicocca | solo controlli disabilitati | esente (WCAG 1.4.3) |

Scartati dopo il calcolo: petrolio al 72% (4,31:1) e al 60% (3,24:1) come
testo; albicocca scura come colore delle tacche sul gesso (1,60:1, sembra una
macchia). Le parole inattive del quadrante restano **petrolio pieno**: attiva
e inattive si distinguono per **peso** (500 contro 400) e sottolineatura, non
per colore.

### 2.3 Accento

Non c'è un secondo colore. L'accento è il petrolio **pieno** contro il
petrolio **spento** (tacca percorsa contro tacca spenta), e il petrolio
**pieno** contro il vuoto (bottone pieno contro pillola a contorno).

### 2.4 Stati senza colori di stato

- **Errore**: testo petrolio + icona "cerchio barrato" (Tabler) prima del
  messaggio, bordo del campo 2 px petrolio. Niente rosso, niente vibrazione.
- **Successo**: le due tacche scelte diventano pallini pieni petrolio uniti
  dall'arco del ciclo (3 px petrolio); tutto il resto dell'anello passa a
  tacca spenta. Niente verde.
- **Occupato / chiuso / passato**: forma (tacca corta) + parola ("chiuso"),
  mai solo colore.
- **Selezione del testo**: `--nov-selezione-fondo` / `--nov-selezione-testo`.

### 2.5 Divieti di colore

- Nessun hex fuori da `styles/tokens.*`. Nessun `rgba()` inventato nelle
  sezioni: le trasparenze sono già composte nei derivati.
- Niente bianco `#FFFFFF`, niente nero, niente azzurro (LUME), niente
  terracotta (IMBRUNIRE), niente verde/giallo/rosso di stato (il quadrante non
  è un cruscotto).
- Niente gradienti, mesh, vetro, `backdrop-filter`, vignettature.
- Gesso mai come fondo pagina (è vicino alle creme vietate dalla skill:
  resta la faccia di un oggetto).

### 2.6 Un solo tema

Il sito ha **un solo tema, chiaro**, e dichiara `color-scheme: light`.
Motivo (skill `design-taste-frontend` §8.C, "unless the brand insists"): il
campo albicocca è l'identità del concept (creative-director §4.1, trend
P6); un modo scuro petrolio-su-notte cadrebbe sul territorio di 20
IMBRUNIRE. L'albicocca ha luminanza 0,70: abbaglia molto meno del bianco
per chi ha il sistema in modo scuro. Accessibilità coperta invece da:
- `prefers-contrast: more`: secondario → petrolio pieno, tacche spente più
  scure (`#6E8488`), filetto → petrolio quieto, bordi 2 px;
- `forced-colors: active`: tutti i ruoli passano ai colori di sistema
  (`Canvas`, `CanvasText`, `Highlight`...), ombra tolta.

## 3. Typography Rules

### 3.1 Famiglie

| Famiglia | Pesi | Ruolo |
|---|---|---|
| **Epilogue** (variabile, Google Fonts, 300-800) | 800 cifre e marchio · 700 titoli e prezzi · 500 numeri della scala · 300 il "°" | tutto ciò che **misura**: gradi, titoli, numeri, marchio |
| **Lexend** (variabile, 400-500) | 400 testo · 500 interfaccia | tutto ciò che **spiega**: testo, parole del quadrante, bottoni, campi |

URL: `FONT_CSS_URL` in `tokens.ts`. Ripieghi tarati in `tokens.css`
(`Novanta Epilogue Ripiego`, `Novanta Lexend Ripiego`), già nelle variabili
`--nov-font-misura` e `--nov-font-testo`. Niente corsivo, niente monospace,
niente maiuscoletto spaziato. L'unico testo maiuscolo è il logotipo NOVANTA.

### 3.2 Scala (cinque taglie per raddoppio, più il logotipo)

| Variabile | 375 | 1440 | Famiglia / peso | Interlinea | Uso |
|---|---|---|---|---|---|
| `--nov-fs-nota` | 14 | 14 | Lexend 400, o Epilogue 500 per la scala | 1.45 | nota tecnica, riga "di esempio", numeri 0-30-...-180 sul disco, durate |
| `--nov-fs-corpo` | 17 | 18 | Lexend 400 / 500 | 1.6 / 1.25 | testo, parole del quadrante, bottoni, etichette, campi (17 = niente zoom iOS) |
| `--nov-fs-titolo` | 28 | 36 | Epilogue 700 | 1.08 | `h2` dell'angolo (max 6 parole, max 2 righe), `h3`, lettura dell'anello |
| `--nov-fs-misura` | 56 | 72 | Epilogue 800 tnum | 0.9 | gradi in vista elenco, gradi a 90° su mobile, prezzo in evidenza |
| `--nov-fs-gradi` | 104 (≤ 15,6 svh) | 26 svh (144-280) | Epilogue 800 tnum + "°" 300 | 0.84 | il numero dei gradi |
| `--nov-fs-marchio` | 22 | 28 | Epilogue 800 maiuscolo +0,04em | 1 | NOVANTA in testata (è un logotipo, fuori scala) |

Varianti del numero: `--nov-fs-gradi-prenota` (a 90°: 56 su mobile,
16 svh tra 96 e 144 su desktop) e `--nov-fs-gradi-elenco` (= misura). In
vista elenco i gradi sono 72/56, non 96: la scala non ha una sesta taglia
(trend P3). Se un testo non ci sta, si accorcia il testo.

### 3.3 Il numero dei gradi

- Epilogue **ha `tnum`** (verificato sul file v20): ogni cifra a 800 avanza
  0,6095 em. Si usa `font-variant-numeric: var(--nov-cifre)` (tabular-nums):
  **niente box per cifra**.
- La scatola del numero è larga `--nov-gradi-larghezza` (2,17 em = tre cifre
  + "°") e allineata a sinistra: il numero non spinge nulla quando passa da
  "90" a "120". Il "°" è uno `span` a peso 300, `aria-hidden` come tutto il
  numero (la lettura accessibile è l'`h2` e il `aria-valuetext`).
- Il "°" a 300 è un anello sottile che galleggia in alto a destra delle cifre
  pesanti: è voluto, è il contrasto misura/unità. Nessun `vertical-align`.
- Il numero non ha colore diverso, non ha ombra, non "conta" all'ingresso: si
  aggiorna grado per grado mentre il braccio gira (motion-designer).

### 3.4 Principi

- Misura della riga: `--nov-colonna` (520 px ≈ 56 caratteri di Lexend 18).
- Titoli in minuscolo naturale; niente punto esclamativo; un solo `·` per riga.
- Le cifre in tabelle e durate (listino, "45 min") usano `tnum` e stanno a
  destra; il prezzo in Epilogue 700, il nome della voce in Lexend 500.
- I marcatori delle liste ordinate (`ol` del primo incontro) sono le cifre in
  Epilogue 700: niente cerchietti numerati.
- Link nel testo: petrolio, sottolineatura 1,5 px a 4 px dal testo;
  in hover la sottolineatura diventa 3 px.

## 4. Component Stylings

### 4.1 Il quadrante (lo strumento)

Numeri in `STRUMENTO.bordo` / `STRUMENTO.fondo` di `tokens.ts` e nelle
variabili `--nov-tacca-*`, `--nov-braccio-*`, `--nov-manopola`,
`--nov-perno`, `--nov-finestrella`, `--nov-distanza-parole`,
`--nov-rientro-numeri` (cambiano con la geometria).

| Parte | Bordo (desktop) | Fondo (mobile) | Colore |
|---|---|---|---|
| Disco | mezzo disco sul bordo sinistro | mezzo disco sul basamento | gesso, **contorno 1,5 px petrolio solo sull'arco** |
| Tacche (dal bordo verso il perno) | 10 / 16 / 26 px, spessore 1,25 / 2,5 | 7 / 11 / 18 px, spessore 1 / 2 | percorse petrolio, oltre tacca spenta |
| Numeri 0-180 ogni 30 | Epilogue 500 14 px, a 44 px dal bordo | a 32 px | petrolio; **0 e 180 spostati di 16 px verso il campo** (sul bordo verrebbero tagliati) |
| Parole dei sette angoli | Lexend 18, a **66 px** fuori dall'arco | Lexend 15-17, a 22 px | petrolio pieno; attiva 500 + sottolineata, inattive 400 |
| Braccio | 10 px, estremità tonde, 40 px oltre l'arco | 8 px, finisce sull'arco | petrolio, ombra `--nov-ombra-braccio` |
| Manopola | Ø 28 disegnata, 48 toccabile, anello gesso interno 1,5 px | Ø 26, 48 toccabile | petrolio |
| Oblò (finestrella) | Ø 30 a 78 px dal bordo verso il perno, bordo 3 px petrolio | Ø 26 a 58 px | fondo gesso, numero intero Epilogue 700 12 px **controruotato** (sempre dritto) |
| Perno (rivetto) | Ø 20 petrolio con anello gesso 3 px | Ø 16 | petrolio |
| Basamento (solo fondo) | non c'è | fascia gesso a tutta larghezza, bordo alto 2 px petrolio (il diametro) | gesso |

Regole viste a schermo (prova in `qa/art-director/`):
- La parola sta a **66 px** dall'arco su desktop perché la manopola arriva a
  40 + 14 px: a 28 px (valore dell'ux) la manopola si posava sulla parola
  dell'angolo attivo.
- Il braccio copre il numero della scala del proprio angolo: è corretto, il
  numero lo mostra l'oblò.
- A 375 con la manopola sull'arco il raggio massimo è
  `raggioMaxFondo(375) = 158,5 px`; con l'altezza < 700 il raggio di 150 px
  dell'ux va bene.
- Mini archi (30°, 150°, elenco): `STRUMENTO.mini`, niente tacche corte,
  braccio 4 px, niente oblò, stesso disco gesso con contorno.

### 4.2 Bottone pieno (Prenota, Fissa le due visite)

Petrolio, testo gesso Lexend 500 corpo, pillola, alto 56, padding 0 32 px
(larghezza piena a 375). Hover e premuto: `--nov-primario-premuto`. Nessuna
freccia, nessuna ombra, nessun gradiente. È **l'unico** pieno per schermata.

### 4.3 Pillola a contorno (Leggi in elenco, prima/dopo, passi ±30°, suggerimenti del motivo)

Trasparente, bordo 1,5 px petrolio, testo petrolio Lexend 500, alta 44.
Hover: fondo albicocca scura. Scelta attiva (suggerimento selezionato):
fondo petrolio, testo gesso (come il bottone pieno, ma alta 44).

### 4.4 Campi

Etichetta sopra (Lexend 500 corpo), campo gesso, raggio 14, alto 52, bordo
1,5 px petrolio quieto, testo petrolio corpo 17-18. Focus: bordo 2 px
petrolio + anello di focus. Errore sotto il campo, nota 14 in petrolio
**pieno** con l'icona. Niente placeholder come etichetta.

### 4.5 Superfici di lettura (listino, disclosure "Tutte le ore libere")

Gesso, raggio 14, padding 24 (16 a 375), nessuna ombra, nessun bordo. Le voci
sono separate da un filetto 1 px (`--nov-filetto`), mai da schede.

### 4.6 L'anello della settimana

Spicchi gesso separati da filetto; tacca libera = petrolio lunga, occupata =
tacca spenta corta; domenica = spicchio albicocca scura con la parola
"chiuso" in petrolio; indice fisso = braccio corto petrolio con manopola
(`STRUMENTO.mini`); ora scelta = pallino pieno petrolio Ø 12 con anello gesso
3 px; arco del ciclo 3 px petrolio. Lettura al centro: giorno in Epilogue 700
titolo, ora sotto sulla riga successiva (due righe: "ven 2" / "18:00"),
"prima visita, 60 min" in Lexend nota quieto.

### 4.7 Focus

`outline: var(--nov-focus-anello); outline-offset: var(--nov-focus-distanza)`
(3 px petrolio a 3 px) ovunque. Sulla manopola l'anello è un cerchio attorno
alla manopola, non attorno al braccio. Mai `outline: none` senza sostituto.

### 4.8 Testata

Marchio NOVANTA (logotipo), "Chiama" come link sottolineato, "Leggi in
elenco" come pillola a contorno. Nessuna barra, nessun fondo, nessuna ombra:
sta sull'albicocca.

## 5. Layout Principles

### 5.1 Griglia polare

Il sito non ha colonne a 12: ha un **perno**. Tutto si misura da lì.

- **P** (perno): `(0, T + (h − T)/2)` su desktop, `(w/2, h − basamento)` su
  mobile. **R**: raggio (core/modo.ts).
- Anelli di riferimento, dal perno: `R − 78` oblò, `R − 44` numeri, `R`
  arco, `R + 40` punta del braccio, `R + 66` parole.
- **Linea di lettura** = la y del perno su desktop: l'`h2` di ogni angolo
  poggia lì, il numero sta sopra, il testo sotto. Cambiando angolo l'occhio
  non si sposta.
- **Colonna di lettura**: parte da `R + 220` (desktop), larga al massimo
  `--nov-colonna`; a 90° si apre su due colonne (anello a sinistra, colonna
  stretta 352 px a destra).
- Il campo a destra della colonna resta **albicocca vuota**: è il respiro
  dello strumento, non spazio da riempire (piano B, niente foto).
- Mobile: numero, titolo e testo allineati a sinistra con `--nov-margine`
  (20 px); il quadrante sotto, il basamento sotto ancora.

### 5.2 Spazi

Base 4: `--nov-sp-1` … `--nov-sp-10` (4, 8, 12, 16, 24, 32, 48, 64, 96,
120). Numero → titolo: 28-32 px desktop, 12-16 px mobile. Titolo → testo:
16. Tra paragrafi: 12. Vista elenco, tra un angolo e l'altro:
`--nov-vuoto-elenco` (72 → 120), nessun divisore.

## 6. Depth & Elevation

Un solo piano sollevato: **il braccio**, con
`--nov-ombra-braccio` (`drop-shadow(0 3px 3px` petrolio 12%`)`), applicata al
gruppo SVG di braccio, oblò, manopola e perno. Tutto il resto è piatto:
disco, campi, listino, bottoni, testata. Niente `box-shadow` nelle sezioni.

## 7. Foto

**Piano B attivo: nessuna foto nel sito** (ricerca in
`docs/art-director.md` §6). `assets/foto/index.ts` esporta `FOTO = {}` e
`CI_SONO_FOTO = false`: le sezioni 0°, 60°, 180° leggono la chiave e, se
manca, non mostrano nessun riquadro.

Trattamento previsto se al porting Luca porta foto vere dello studio (solo
stanza vuota, luce di finestra, attrezzi appoggiati, ingresso; mai persone,
mani, camici, scheletri): nessuna cornice, a filo del bordo destro su desktop
(da `x = w − 280` a tutta altezza sotto la testata) o fascia 335 × 140 a 375;
`filter: var(--nov-foto-filtro)`; velatura `--nov-foto-velatura` in
`mix-blend-mode: multiply` all'opacità `--nov-foto-velatura-opacita` (12%);
nessuna didascalia sopra la foto.

## 8. Do's and Don'ts

### Do
- Usa sempre i ruoli (`--nov-testo`, `--nov-superficie`, `--nov-strumento`),
  non i nomi dei colori.
- Numeri con `tabular-nums`; il "°" a 300.
- Un bottone pieno per schermata, il resto a contorno o link.
- Testo sempre orizzontale e fermo, anche le parole del quadrante.
- Stato = forma + parola + colore, mai solo colore.

### Don't
- Niente serif, corsivo, monospace, maiuscoletto spaziato, "01 ·".
- Niente schede con bordo e ombra, griglie di card, caroselli.
- Niente seconda ombra, secondo raggio, secondo accento.
- Niente testo lungo l'arco o ruotato con il braccio.
- Niente zone colorate sul quadrante (verde/giallo/rosso), niente lancetta
  rossa, niente scala del dolore.
- Niente sagome, mani, braccia umane, scheletri: il braccio è dello strumento.
- Niente petrolio quieto sopra l'albicocca scura.

## 9. Responsive Behavior

| Larghezza / condizione | Geometria | Numero | Note |
|---|---|---|---|
| < 47.5em, o verticale | fondo (mobile, perno in basso) | 104 (≤ 15,6 svh) | basamento 62 px + safe area, parole: attiva + vicine |
| ≥ 47.5em, orizzontale, altezza ≥ 35em | bordo (perno a sinistra) | 26 svh (144-280) | colonna da R + 220 |
| altezza < 35em, testo grande, zoom 400% | vista elenco | 56 / 72 | stesso campo albicocca, mini arco accanto ai gradi |

Le soglie sono in `em` (lo zoom sposta la soglia); in `tokens.css` la media
query della geometria bordo serve alla prima pittura, poi valgono
`[data-geo]`. 375 px: il mezzo disco gesso sul basamento **è** l'immagine del
sito, non una versione ridotta.

## 10. Agent Prompt Guide

### Riferimento rapido

- Fondo `var(--nov-fondo)` albicocca · testo `var(--nov-testo)` petrolio ·
  secondario `var(--nov-testo-quieto)` · superfici `var(--nov-superficie)`
  gesso · strumento `var(--nov-strumento)`.
- Gradi: `font: var(--nov-peso-gradi) var(--nov-fs-gradi)/var(--nov-lh-gradi)
  var(--nov-font-misura); font-variant-numeric: var(--nov-cifre)`.
- Titolo: `font: var(--nov-peso-titolo) var(--nov-fs-titolo)/var(--nov-lh-titolo)
  var(--nov-font-misura); letter-spacing: var(--nov-trk-titolo)`.
- Testo: `font: var(--nov-peso-testo) var(--nov-fs-corpo)/var(--nov-lh-corpo)
  var(--nov-font-testo)`.

### Prompt d'esempio

- "Voce di listino: `dt` Lexend 500 corpo a sinistra, prezzo Epilogue 700
  corpo tnum a destra, `dd` nota quieta sotto; filetto 1 px `--nov-filetto`
  tra le voci; il blocco su superficie gesso, raggio 14, padding 24, niente
  ombra."
- "Pillola 'prima': alta 44, bordo 1,5 px strumento, testo interfaccia,
  hover albicocca scura, focus anello 3/3."

### Guida all'iterazione

Se una sezione sembra vuota senza foto, **ingrandisci il numero o accorcia il
testo**, non aggiungere decorazione. Se sembra affollata, togli, non
rimpicciolire sotto 14 px. Se serve un colore nuovo, la risposta è no.
