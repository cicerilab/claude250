# Art director · Concept 10 · IMPRONTA

Ondata 2. Letti: `CLAUDE.md`, `docs/concept-lab.md`, `docs/processo-agent.md`,
tutti i documenti in `concepts/10-torchio/docs/` (creative-director,
trend-researcher, brand-strategist, ux-architect, tech-architect, e quelli
già presenti di copywriter e vector-artist), le skill `design-taste-frontend`
e `full-output-enforcement`, i DESIGN.md di `wired` e `lamborghini` in
`design-references/awesome-design-md/` (solo per la struttura Stitch).
Ho letto anche `webgl/presets.ts`, `webgl/materials.ts` e
`motion/choreography.ts` per allineare i contratti.

## File consegnati

| File | Contenuto |
|---|---|
| `DESIGN.md` (root del concept) | design system in formato Stitch: tema, palette con ruoli, tipografia, componenti, layout, profondità, do/don't, responsive, prompt guide |
| `src/pages/concepts/impronta/styles/tokens.css` | `@font-face` di ripiego tarati, token comuni su `.imp-root`, quattro carte su `[data-carta]`, token derivati, breakpoint |
| `src/pages/concepts/impronta/styles/tokens.ts` | `CARTE` (hex + vec3 sRGB + vec3 lineari), `LAMINA`, `FONT_CSS_URL`, stop del canvas, metriche e larghezze misurate di Anybody, scala `TIPO`, `GRIGLIA`, funzioni pure (margini, corpo dell'hero, assi di pressione, vettore luce, contrasto) |
| `src/pages/concepts/impronta/styles/relief-fallback.css` | classi materiali `.imp-secco`, `.imp-inchiostro`, `.imp-caldo`, `.imp-segno-caldo`, `.imp-lamina`, `.imp-foglio`, `.imp-taglio`, `.imp-costa`, `.imp-fibra`, `.imp-pressa`, `.imp-assi`, spegnimento con GL acceso, contrasto forzato |

Verifiche fatte: `tsc --strict --noUncheckedIndexedAccess` su `tokens.ts`
verde; pagina di prova (scratch, fuori dal repo) renderizzata con Chromium di
Playwright a 1440 e 375 su tutte e quattro le carte con i woff2 veri: la parola
dell'hero misura esattamente 1181 px a 1440 e 335 px a 375 (nessun overflow),
stili calcolati corretti (`text-shadow`, `filter`, `font-variation-settings`
che segue `--imp-press`: a 0,3 dà wdth 129 / wght 760).

---

## 1. Decisioni

### 1.1 Tipografia: confermo Anybody + Hanken Grotesk

Ho scaricato i due woff2 da Google Fonts (200, raggiungibili) e li ho misurati
con fontTools.
- **Anybody** v13: assi `wdth` 50-150, `wght` 100-900, upm 2000, ascent 0,795,
  descent 0,240, x-height 0,593. La larghezza cresce in modo lineare con
  l'asse (a peso 900 *impronta* va da 5,559 em a wdth 100 a 8,238 em a 150).
  È esattamente la "pressione" che serve: un solo carattere che fa tre voci.
- **Hanken Grotesk** v12: un unico file variabile per 400/500/600, larghezza
  media uguale ad Arial (100,2%): il ripiego non sposta le righe.

Totale font 92 KB (budget 180).

### 1.2 Regole di pressione sugli assi

- `.imp-pressa` solo su parole a riga singola in un blocco largo quanto il
  contenitore. Formula: `wdth = arrivo × (0,8 + 0,2 p)`, `wght = 700 +
  (arrivo − 700) p`. Lo 0,8 è lo stesso `stringiMin` dello shader.
- **Deviazione dal CD**: i titoli H1/H2/H3 hanno assi fissi. Allargare un
  titolo su più righe riscrive le righe e fa saltare il layout (CLS); la
  pressione su di loro si vede solo nel rilievo.
- **Larghezze di arrivo solo tra quelle che il canvas 2D sa disegnare**
  (`ctx.fontStretch` accetta solo parole chiave: 75, 87,5, 100, 112,5, 125,
  150). Per questo la parola dell'hero arriva a 100 (mobile), 125 (tablet),
  150 (desktop) e l'indirizzo a 112,5 / 150. Così maschera WebGL e DOM
  coincidono al pixel.
- **Mobile**: la parola *impronta* resta intera su una riga a wdth 100 e 61 px
  (non 110-120 come suggeriva il trend-researcher: a 120 sarebbe 50 px, troppo
  piccola per fare da materiale, e 120 non è uno stop del canvas).

### 1.3 Palette

Tengo i colori del CD con due ritocchi misurati:
- **Inchiostro Cipria** da `#2A1A1C` a `#231518`: con il vecchio valore il
  testo in inchiostro su una zona in ombra del rilievo scendeva a 4,40:1. Ora
  4,66:1 nel caso peggiore, 10,09:1 sulla carta.
- **Costa Grafite** più chiara della carta (`#373A3D`): sul fondo scuro una
  costa scura si confondeva con l'ombra.

Derivati nuovi: `inchiostro-velato` (72% composto, AA su tutte), `secco-fondo`,
`costa`, `taglio` (colore preso da un'altra carta del sistema: nessun nuovo
colore entra nel sito), `lamina-bordo` (filo che rende riconoscibile il bottone
argento su Citrino e Cipria, dove argento e carta hanno la stessa luminanza:
1,01:1 e 1,09:1).

### 1.4 Griglia da libro

Canone 2:3:4:6 semplificato su `u = clamp(20px, 6% pagina, 101px)`: interno 1u,
testa 1,5u, esterno 2u, piede 3u. A 1440 dà 86 / 173 px di margini (la UX
chiedeva 100 / 173: stesso esterno, interno un po' più stretto per stare nel
rapporto 1:2) e area viva 1181 px su 12 colonne da 76 px. Su mobile 20 / 20,
testa 48, piede 96 (come la UX). Pagina massima 1680. A vivo solo le strisce
della sezione carta.

### 1.5 Rilievo senza WebGL

- **Direzione corretta del solco**: il CD scriveva "luce in alto a sinistra,
  ombra in basso a destra" per le due `text-shadow`; quella combinazione fa
  sembrare le lettere *in rilievo* (sbalzo). Le lettere sono *premute*: la
  parete verso la luce è in ombra e il labbro opposto prende la luce. Nel CSS
  quindi la copia scura va verso la luce (in alto a sinistra) e quella chiara
  dal lato opposto. La luce resta in alto a sinistra, come chiesto.
- Bisello "a gradini": due livelli per lato (netto + sfumato), passo 0,016 em
  (min 0,6 px; 1 px sulla lamina), scalato da `--imp-press` e `--imp-rilievo`.
- A pressione 0 la lettera a secco ha il colore della carta: sparisce.
- Lamina: sfumatura ferma (riflesso in testa, `#7E868E` al piede), ripetuta a
  ogni riga (`1lh`), ombre con `drop-shadow` (le `text-shadow` coprirebbero il
  testo ritagliato). Niente oro, niente animazione, niente glow.
- Fibra: due strati SVG `feTurbulence` statici tinti con ombra e luce della
  carta, stirati in orizzontale. Controllata a schermo: su Grafite la prima
  taratura era troppo visibile, l'ho dimezzata.
- Pezzi appoggiati: costa di 1 / 1,8 / 1,1 / 1,3 px (gli stessi valori di
  `PRESET_CARTA.spessorePx` del webgl-artist, così lo scambio CSS → GL non
  cambia il pezzo). Le strisce della sezione carta usano invece la costa
  esagerata della UX (3 / 6 / 4 / 5 px).

---

## 2. Contrasti WCAG 2.x (calcolati)

Script node in appendice (luminanza relativa sRGB, formula WCAG 2.x). Soglie:
testo normale 4,5:1, testo grande 3:1, elementi non testuali 3:1. "Caso
peggiore shader" = il testo in inchiostro finisce sopra la luce o l'ombra del
rilievo (succede solo ai bordi dei blocchi premuti, ma deve reggere lo
stesso). **Tutte le 35 coppie con soglia passano.**

| Carta | Coppia | Primo piano | Fondo | Rapporto | Soglia | Esito |
|---|---|---|---|---|---|---|
| citrino | inchiostro su carta (testo normale, AA 4.5) | `#17231D` | `#E4CF3F` | **10.27:1** | 4.5:1 | passa |
| citrino | inchiostro su carta (testo grande, AA 3) | `#17231D` | `#E4CF3F` | **10.27:1** | 3:1 | passa |
| citrino | inchiostro su luce del rilievo (caso peggiore shader) | `#17231D` | `#F5E97E` | **13.01:1** | 4.5:1 | passa |
| citrino | inchiostro su ombra del rilievo (caso peggiore shader) | `#17231D` | `#9C8A1E` | **4.69:1** | 4.5:1 | passa |
| citrino | inchiostro velato 72% su carta (testo normale) | `#505327` | `#E4CF3F` | **5.10:1** | 4.5:1 | passa |
| citrino | anello di focus (inchiostro) su carta, non-testo 3:1 | `#17231D` | `#E4CF3F` | **10.27:1** | 3:1 | passa |
| citrino | bordo lamina su carta, non-testo 3:1 | `#17231D` | `#E4CF3F` | **10.27:1** | 3:1 | passa |
| citrino | inchiostro su fondo del solco (testo in un pezzo premuto) | `#17231D` | `#D8C43A` | **9.17:1** | 4.5:1 | passa |
| citrino | lamina (piena) su carta | `#C8CDD2` | `#E4CF3F` | 1.01:1 | nessuna | decorativo |
| citrino | fondo solco a secco su carta | `#D8C43A` | `#E4CF3F` | 1.12:1 | nessuna | decorativo |
| citrino | ombra rilievo su carta | `#9C8A1E` | `#E4CF3F` | 2.19:1 | nessuna | decorativo |
| citrino | luce rilievo su carta | `#F5E97E` | `#E4CF3F` | 1.27:1 | nessuna | decorativo |
| citrino | taglio colorato su carta | `#17231D` | `#E4CF3F` | 10.27:1 | nessuna | decorativo |
| citrino | costa su carta | `#BCA92D` | `#E4CF3F` | 1.50:1 | nessuna | decorativo |
| citrino | lamina profonda su carta | `#7E868E` | `#E4CF3F` | 2.34:1 | nessuna | decorativo |
| cotone | inchiostro su carta (testo normale, AA 4.5) | `#17231D` | `#F1F1EE` | **14.33:1** | 4.5:1 | passa |
| cotone | inchiostro su carta (testo grande, AA 3) | `#17231D` | `#F1F1EE` | **14.33:1** | 3:1 | passa |
| cotone | inchiostro su luce del rilievo (caso peggiore shader) | `#17231D` | `#FFFFFF` | **16.22:1** | 4.5:1 | passa |
| cotone | inchiostro su ombra del rilievo (caso peggiore shader) | `#17231D` | `#B9BAB3` | **8.29:1** | 4.5:1 | passa |
| cotone | inchiostro velato 72% su carta (testo normale) | `#545D58` | `#F1F1EE` | **6.02:1** | 4.5:1 | passa |
| cotone | anello di focus (inchiostro) su carta, non-testo 3:1 | `#17231D` | `#F1F1EE` | **14.33:1** | 3:1 | passa |
| cotone | bordo lamina su carta, non-testo 3:1 | `#17231D` | `#F1F1EE` | **14.33:1** | 3:1 | passa |
| cotone | inchiostro su fondo del solco (testo in un pezzo premuto) | `#17231D` | `#E8E8E5` | **13.21:1** | 4.5:1 | passa |
| cotone | lamina (piena) su carta | `#C8CDD2` | `#F1F1EE` | 1.41:1 | nessuna | decorativo |
| cotone | fondo solco a secco su carta | `#E8E8E5` | `#F1F1EE` | 1.08:1 | nessuna | decorativo |
| cotone | ombra rilievo su carta | `#B9BAB3` | `#F1F1EE` | 1.73:1 | nessuna | decorativo |
| cotone | luce rilievo su carta | `#FFFFFF` | `#F1F1EE` | 1.13:1 | nessuna | decorativo |
| cotone | taglio colorato su carta | `#E4CF3F` | `#F1F1EE` | 1.40:1 | nessuna | decorativo (si distingue per saturazione, e la tecnica è spiegata a parole) |
| cotone | costa su carta | `#D2D3CE` | `#F1F1EE` | 1.33:1 | nessuna | decorativo |
| cotone | lamina profonda su carta | `#7E868E` | `#F1F1EE` | 3.26:1 | nessuna | decorativo |
| cipria | inchiostro su carta (testo normale, AA 4.5) | `#231518` | `#E8B9B3` | **10.09:1** | 4.5:1 | passa |
| cipria | inchiostro su carta (testo grande, AA 3) | `#231518` | `#E8B9B3` | **10.09:1** | 3:1 | passa |
| cipria | inchiostro su luce del rilievo (caso peggiore shader) | `#231518` | `#F7D8D3` | **13.19:1** | 4.5:1 | passa |
| cipria | inchiostro su ombra del rilievo (caso peggiore shader) | `#231518` | `#A9776F` | **4.66:1** | 4.5:1 | passa |
| cipria | inchiostro velato 72% su carta (testo normale) | `#5A4343` | `#E8B9B3` | **5.18:1** | 4.5:1 | passa |
| cipria | anello di focus (inchiostro) su carta, non-testo 3:1 | `#231518` | `#E8B9B3` | **10.09:1** | 3:1 | passa |
| cipria | bordo lamina su carta, non-testo 3:1 | `#231518` | `#E8B9B3` | **10.09:1** | 3:1 | passa |
| cipria | inchiostro su fondo del solco (testo in un pezzo premuto) | `#231518` | `#DEAEA8` | **9.00:1** | 4.5:1 | passa |
| cipria | lamina (piena) su carta | `#C8CDD2` | `#E8B9B3` | 1.09:1 | nessuna | decorativo |
| cipria | fondo solco a secco su carta | `#DEAEA8` | `#E8B9B3` | 1.12:1 | nessuna | decorativo |
| cipria | ombra rilievo su carta | `#A9776F` | `#E8B9B3` | 2.16:1 | nessuna | decorativo |
| cipria | luce rilievo su carta | `#F7D8D3` | `#E8B9B3` | 1.31:1 | nessuna | decorativo |
| cipria | taglio colorato su carta | `#2A2C2F` | `#E8B9B3` | 8.02:1 | nessuna | decorativo |
| cipria | costa su carta | `#C5958E` | `#E8B9B3` | 1.49:1 | nessuna | decorativo |
| cipria | lamina profonda su carta | `#7E868E` | `#E8B9B3` | 2.11:1 | nessuna | decorativo |
| grafite | inchiostro su carta (testo normale, AA 4.5) | `#ECEBE6` | `#2A2C2F` | **11.73:1** | 4.5:1 | passa |
| grafite | inchiostro su carta (testo grande, AA 3) | `#ECEBE6` | `#2A2C2F` | **11.73:1** | 3:1 | passa |
| grafite | inchiostro su luce del rilievo (caso peggiore shader) | `#ECEBE6` | `#44474B` | **7.82:1** | 4.5:1 | passa |
| grafite | inchiostro su ombra del rilievo (caso peggiore shader) | `#ECEBE6` | `#141517` | **15.31:1** | 4.5:1 | passa |
| grafite | inchiostro velato 72% su carta (testo normale) | `#B6B6B3` | `#2A2C2F` | **6.89:1** | 4.5:1 | passa |
| grafite | anello di focus (inchiostro) su carta, non-testo 3:1 | `#ECEBE6` | `#2A2C2F` | **11.73:1** | 3:1 | passa |
| grafite | bordo lamina su carta, non-testo 3:1 | `#A7AEB5` | `#2A2C2F` | **6.24:1** | 3:1 | passa |
| grafite | inchiostro su fondo del solco (testo in un pezzo premuto) | `#ECEBE6` | `#232528` | **12.87:1** | 4.5:1 | passa |
| grafite | lamina (piena) su carta | `#C8CDD2` | `#2A2C2F` | 8.75:1 | nessuna | decorativo |
| grafite | fondo solco a secco su carta | `#232528` | `#2A2C2F` | 1.10:1 | nessuna | decorativo |
| grafite | ombra rilievo su carta | `#141517` | `#2A2C2F` | 1.30:1 | nessuna | decorativo |
| grafite | luce rilievo su carta | `#44474B` | `#2A2C2F` | 1.50:1 | nessuna | decorativo |
| grafite | taglio colorato su carta | `#E4CF3F` | `#2A2C2F` | 8.87:1 | nessuna | decorativo |
| grafite | costa su carta | `#373A3D` | `#2A2C2F` | 1.22:1 | nessuna | decorativo |
| grafite | lamina profonda su carta | `#7E868E` | `#2A2C2F` | 3.79:1 | nessuna | decorativo |
| lamina | testo su lamina chiara | `#17231D` | `#DDE1E5` | **12.34:1** | 4.5:1 | passa |
| lamina | testo su lamina base | `#17231D` | `#C8CDD2` | **10.13:1** | 4.5:1 | passa |
| lamina | testo su lamina scura (caso peggiore della sfumatura) | `#17231D` | `#A7AEB5` | **7.23:1** | 4.5:1 | passa |

Letture:
- Il secco e la lamina sono **bassi per natura** (1,01-2,3:1): per questo non
  portano mai informazione. Ogni scritta a secco ripete un testo già leggibile
  o è `aria-hidden`; il prezzo in lamina ha sempre il gemello in inchiostro.
- Il bottone in lamina si riconosce dal filo `--imp-lamina-bordo` (≥ 6,24:1),
  non dall'argento.
- Il testo sui campi (fondo `--imp-carta-luce`) passa: è la riga "inchiostro su
  luce".

---

## 3. Come si usano variabili e classi

### 3.1 Ordine di import (scaffold, in `Impronta.tsx`)

```ts
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/relief-fallback.css';
// poi i CSS delle sezioni, importati dai componenti
```

### 3.2 Variabili principali

| Gruppo | Variabili |
|---|---|
| Carta attiva (cambiano con `data-carta`) | `--imp-carta`, `--imp-carta-luce`, `--imp-carta-ombra`, `--imp-carta-costa`, `--imp-secco-fondo`, `--imp-inchiostro`, `--imp-inchiostro-velato`, `--imp-lamina-bordo`, `--imp-taglio`, `--imp-spessore`, `--imp-spessore-pezzo`, `--imp-fibra` |
| Carta del sito (anche dentro un pezzo) | `--imp-sito-carta`, `--imp-sito-ombra`, `--imp-sito-costa`, `--imp-sito-inchiostro` |
| Lamina | `--imp-lamina`, `-chiara`, `-scura`, `-riflesso`, `-profonda`, `--imp-su-lamina`, `--imp-lamina-sfumatura`, `--imp-lamina-sfumatura-premuta`, `--imp-lamina-sfumatura-testo` |
| Font | `--imp-font-display`, `--imp-font-testo` |
| Corpi | `--imp-fs-secco-hero`, `-secco-grande`, `-titolo-1/2/3`, `-nome`, `-prezzo`, `-marchio`, `-lead`, `-corpo`, `-piccolo`, `-nota`, `-bottone`, `-leva`, `-campo` |
| Interlinea / tracking | `--imp-lh-*`, `--imp-trk-*` |
| Assi | `--imp-wdth-*`, `--imp-wght-*` (valori di arrivo per voce), `--imp-hero-em` |
| Griglia | `--imp-margine-interno`, `--imp-margine-esterno`, `--imp-testa`, `--imp-piede`, `--imp-colonne`, `--imp-canalino`, `--imp-colonna`, `--imp-area-viva`, `--imp-giustezza`, `--imp-giustezza-stretta`, `--imp-pagina-max` |
| Spazi | `--imp-sp-1` … `--imp-sp-10` (4 → 128 px) |
| Misure UI | `--imp-tocco-min`, `--imp-bottone-h`, `--imp-bottone-h-grande`, `--imp-leva-h`, `--imp-campo-h`, `--imp-testata-h`, `--imp-testata-h-fissa`, `--imp-segnapagina-h`, `--imp-raggio`, `--imp-raggio-leva` |
| Stati | `--imp-focus-colore`, `--imp-focus-spessore`, `--imp-focus-distanza`, `--imp-sottolineatura(-hover, -distanza)`, `--imp-bordo-scelto`, `--imp-bordo-errore`, `--imp-opacita-disabilitato`, `--imp-selezione-fondo`, `--imp-selezione-testo` |
| Profondità | `--imp-ombra-costa`, `--imp-ombra-testata`, `--imp-ombra-segnapagina`, `--imp-ombra-indice`, `--imp-ombra-premuto` |
| Livelli | `--imp-z-canvas` 0, `--imp-z-contenuto` 1, `--imp-z-testata` 10, `--imp-z-onda` 20 |
| Pilotate da altri | `--imp-press` (motion), `--imp-rilievo` (profondità del blocco), `--imp-luce-x/y` (interaction) |

### 3.3 Esempi

Parola dell'hero (fantasma dello scaffold + classi mie):

```tsx
<ReliefText as="div" className="imp-hero__parola imp-pressa imp-secco" aria-hidden="true">impronta</ReliefText>
```
```css
.imp-root .imp-hero__parola {
  --imp-wdth-arrivo: var(--imp-wdth-hero);
  --imp-wght-arrivo: var(--imp-wght-hero);
  font-size: var(--imp-fs-secco-hero);
  line-height: var(--imp-lh-secco);
  letter-spacing: var(--imp-trk-secco);
}
```

Pezzo di "Per chi" su una carta diversa dal sito:

```tsx
<div className="imp-perchi__pezzo imp-foglio imp-relief" data-carta="cipria">
  <span className="imp-perchi__nomi imp-secco" aria-hidden="true">Giulia e Marco</span>
</div>
```

Biglietto con taglio colorato: `className="imp-foglio imp-taglio"`.

Prezzo in lamina (decorativo) + gemello in inchiostro:

```tsx
<span className="imp-banco__prezzo imp-caldo" aria-hidden="true">425 €</span>
<p className="imp-banco__totale">Totale indicativo 425 €</p>
```

Marchio in lamina senza WebGL (l'SVG del vector-artist come maschera):

```tsx
import marchioUrl from '../../assets/svg/marchio-impronta.svg?url';
<span className="imp-testata__marchio imp-segno-caldo" style={{ '--imp-segno': `url(${marchioUrl})` } as React.CSSProperties}>
  <span className="imp-segno-caldo__lamina" />
</span>
```
Il contenitore va dimensionato dal builder (altezza 20-24 px, larghezza ×
9,41). Nota: da `file://` la maschera è bloccata per CORS, dal dev server no.

Bottone e leva: `className="imp-hero__cta imp-lamina"`. Striscia della sezione
carta: `className="imp-carta__striscia imp-costa" data-carta="cotone"`.

### 3.4 Regole per i section-builder

1. Nessun hex nei CSS di sezione: solo `var(--imp-*)`.
2. Le classi materiali decidono colore e ombre del testo: non ridefinire
   `color` o `text-shadow` su un elemento `.imp-secco/.imp-inchiostro/.imp-caldo`.
3. Anybody mai sotto 20 px e mai per testo di lettura; H1/H2/H3 con gli assi
   fissi delle voci `titolo-*`.
4. Righe a interlinea 0,86 senza `overflow: hidden` sul contenitore.
5. Ogni schermata provata su `data-carta` citrino, cotone, cipria, grafite e
   con `?gl=0`.
6. La lamina solo su marchio, prezzo, "Prova la tua", leva.

---

## 4. Richieste ad altri agent

**scaffold-engineer**
- `base.css`: `.imp-root { background-color: var(--imp-carta); color:
  var(--imp-inchiostro); font-family: var(--imp-font-testo); font-size:
  var(--imp-fs-corpo); line-height: var(--imp-lh-corpo); }`,
  `.imp-root ::selection { background: var(--imp-selezione-fondo); color:
  var(--imp-selezione-testo); }`, `font-synthesis: none` su tutto ciò che usa
  `--imp-font-display`.
- `layout.css`: `.imp-page { max-inline-size: var(--imp-pagina-max);
  margin-inline: auto; padding-inline: var(--imp-margine-interno)
  var(--imp-margine-esterno); }` e sezioni con `padding-block: var(--imp-testa)
  var(--imp-piede)`; griglia con `--imp-colonne` e `--imp-canalino`.
- **Non** mettere `container-type` su `.imp-root`: crea contenimento di layout
  e il canvas `position: fixed` diventerebbe relativo alla pagina.
- `index.html`: colore di fondo inline `#E4CF3F` (Citrino), e `#2A2C2F` se
  parte Grafite.
- Ordine di import come in §3.1.
- In `base.css`, su `.imp-root`: `transition: color var(--imp-dur-inchiostro, 240ms) linear` (il testo semplice segue la carta come le mie classi; niente transizione sul fondo, lo cambia l’onda).

**motion-designer** (risolta, vedi §5)
- `ASSI_TITOLO` scriveva wdth 120→150 anche su mobile e tablet, dove la parola
  dell'hero arriva a 100 e 125 (altrimenti a 375 px sarebbe di 40 px). Due
  strade: (a) usare `assiPressione(wdthPer('seccoHero', vw), 900, p)` di
  `tokens.ts`; (b) scrivere solo `--imp-press` e lasciare che `.imp-pressa`
  calcoli gli assi. Io consiglio (b): una sola sorgente.
- Nessun asse animato sui titoli su più righe (§1.2).

**webgl-artist**
- `paletteCarta(CARTE[id])` funziona così com'è: `CARTE[id]` ha `fondo`,
  `luce`, `ombra`, `inchiostro` in hex. Ci sono anche `srgb` e `lin` se servono
  vec3. Lamina: `LAMINA.base` (e `LAMINA.chiara/scura/riflesso/profonda`).
- Le maschere del testo usano solo gli stop di `CANVAS_STRETCH`
  (`stretchPerCanvas(wdth)`) e precaricano `FONT_DA_CARICARE`.
- Ho adottato i vostri `spessorePx` per i pezzi (`spessorePezzoPx`); se li
  cambiate, ditemelo e aggiorno `--imp-spessore-pezzo`.
- La luce di riposo (135°, 22°) coincide con il fallback.

**interaction-designer**
- Nel fallback, scrivere `--imp-luce-x` / `--imp-luce-y` su `.imp-root` con
  `vettoreLuce(azimut)` (al massimo 30 Hz, e limitato all'arco di
  `limitaLuce`): le ombre CSS girano da sole.
- Stati con i token: focus `outline: var(--imp-focus-spessore) solid
  var(--imp-focus-colore); outline-offset: var(--imp-focus-distanza)`; hover
  della lamina `background-image: var(--imp-lamina-sfumatura-premuta)`; active
  `box-shadow: var(--imp-ombra-premuto)` + `translateY(1px)`; scelta con
  `--imp-bordo-scelto`. Nessun cambio di colore al passaggio.

**copywriter**: nessuna richiesta. Grammature nei testi coerenti con i token
(Citrino 300 g, Cotone 600 g, Cipria 350 g, Grafite 400 g).

**vector-artist**: nessuna. Il marchio `fill="currentColor"` funziona anche
come maschera in `.imp-segno-caldo` (verificato a schermo).

---

## 5. Risposta al motion-designer (docs/motion-designer.md §8 e §11)

**Fatto in `relief-fallback.css`** (verificato in Chromium):

1. **Prima pittura senza lampi.**
   `@media (prefers-reduced-motion: no-preference) { .imp-root:not([data-motion="reduced"]) [data-imp-pressa="attesa"] { --imp-press: 0; } }`.
   Il blocco prerenderizzato nasce piatto: il secco non si vede, la parola
   `.imp-pressa` è a wdth 120 / wght 700 dentro lo stesso box, l'inchiostro è
   pieno. Con reduced motion resta a 1 (verificato: wdth 150 / wght 900 con
   ombre). La variabile si eredita, quindi la regola vale anche se le classi
   materiali stanno su un figlio del blocco con l'attributo.
2. **Coerenza con gli altri stati del §8.3.** `in-corso` e `premuta` non
   hanno regole: il motion scrive `--imp-press` inline, e l'inline vince
   sull'attributo (verificato: inline 0,5 → wdth 135 / wght 800).
   `data-imp-agganciato` non tocca le mie classi (lo usa solo il CSS della
   Legatoria).
3. **Transizione dell'inchiostro al cambio carta.** `color` e
   `-webkit-text-fill-color` su `.imp-inchiostro`, `.imp-caldo`, `.imp-lamina`
   in `var(--imp-dur-inchiostro, 240ms)` lineare. Non metto transizioni su
   `text-shadow`, `filter` e sul colore di `.imp-secco`, perché dipendono da
   `--imp-press` e il ticker li cambia a ogni frame: una transizione li farebbe
   arrivare in ritardo. Le ombre cambiano colore insieme alla carta. Il
   colore base del testo (`.imp-root`, `base.css`) è dello scaffold: gli
   chiedo la stessa transizione.

**Gli assi li calcola solo il CSS.** Il motion scrive solo `--imp-press`;
`.imp-pressa` copre tutte le parole che si allargano:

| Blocco | Classi | `--imp-wdth-arrivo` | `--imp-wght-arrivo` |
|---|---|---|---|
| parola dell'hero (e i nomi dopo l'invio) | `.imp-pressa .imp-secco` | `var(--imp-wdth-hero)` (100 / 125 / 150) | `var(--imp-wght-hero)` (900) |
| indirizzo della bottega | `.imp-pressa .imp-secco` | `var(--imp-wdth-secco-grande)` (112,5 / 150) | `var(--imp-wght-secco-grande)` (800) |
| tutto il resto (titoli, pezzi, prova, prezzo, nomi carta) | nessuna `.imp-pressa` | assi fissi della voce | la pressione si vede solo nel rilievo |

`.imp-assi` resta disponibile ma, con i profili del motion senza `assi`,
non serve a nessun blocco. Quindi la richiesta al motion-designer del §4
(sul `wdth` 120→150 fisso) è chiusa.

---

## Appendice: script dei contrasti

Eseguito con `node colori.mjs` (Node 22). Riproduce la tabella del §2.

```js
const hex2rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
const rgb2hex = c => '#' + c.map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();
const lin = v => { v/=255; return v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4; };
const L = h => { const [r,g,b] = hex2rgb(h).map(lin); return 0.2126*r + 0.7152*g + 0.0722*b; };
const cr = (a,b) => { const [x,y] = [L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const mix = (a,b,t) => rgb2hex(hex2rgb(a).map((v,i)=> v*(1-t) + hex2rgb(b)[i]*t));
const over = (fg, bg, alpha) => mix(bg, fg, alpha);

const CARTE = {
  citrino: { carta:'#E4CF3F', luce:'#F5E97E', ombra:'#9C8A1E', inchiostro:'#17231D' },
  cotone:  { carta:'#F1F1EE', luce:'#FFFFFF', ombra:'#B9BAB3', inchiostro:'#17231D' },
  cipria:  { carta:'#E8B9B3', luce:'#F7D8D3', ombra:'#A9776F', inchiostro:'#231518' },
  grafite: { carta:'#2A2C2F', luce:'#44474B', ombra:'#141517', inchiostro:'#ECEBE6' },
};
const LAMINA = { base:'#C8CDD2', chiara:'#DDE1E5', scura:'#A7AEB5', suLamina:'#17231D', riflesso:'#EEF1F3', profonda:'#7E868E' };
const TAGLIO = { citrino:'#17231D', cotone:'#E4CF3F', cipria:'#2A2C2F', grafite:'#E4CF3F' };

const rows = []; const f = n => n.toFixed(2);
for (const [id, c] of Object.entries(CARTE)) {
  const d = { ...c,
    seccoFondo: mix(c.carta, c.ombra, id==='grafite' ? 0.30 : 0.16),
    costa: id==='grafite' ? mix(c.carta, c.luce, 0.5) : mix(c.carta, c.ombra, 0.55),
    velato: over(c.inchiostro, c.carta, 0.72),
    laminaBordo: id==='grafite' ? LAMINA.scura : c.inchiostro,
    taglio: TAGLIO[id] };
  const t = (nome, fg, bg, soglia) => rows.push([id, nome, fg, bg, f(cr(fg,bg)), soglia]);
  t('inchiostro su carta (testo normale)', d.inchiostro, d.carta, 4.5);
  t('inchiostro su carta (testo grande)', d.inchiostro, d.carta, 3);
  t('inchiostro su luce del rilievo', d.inchiostro, d.luce, 4.5);
  t('inchiostro su ombra del rilievo', d.inchiostro, d.ombra, 4.5);
  t('inchiostro velato 72% su carta', d.velato, d.carta, 4.5);
  t('anello di focus su carta', d.inchiostro, d.carta, 3);
  t('bordo lamina su carta', d.laminaBordo, d.carta, 3);
  t('lamina su carta', LAMINA.base, d.carta, 0);
  t('fondo solco su carta', d.seccoFondo, d.carta, 0);
  t('ombra rilievo su carta', d.ombra, d.carta, 0);
  t('luce rilievo su carta', d.luce, d.carta, 0);
  t('taglio colorato su carta', d.taglio, d.carta, 0);
  t('costa su carta', d.costa, d.carta, 0);
  t('lamina profonda su carta', LAMINA.profonda, d.carta, 0);
  t('inchiostro su fondo del solco', d.inchiostro, d.seccoFondo, 4.5);
}
rows.push(['lamina','testo su lamina chiara', LAMINA.suLamina, LAMINA.chiara, f(cr(LAMINA.suLamina,LAMINA.chiara)), 4.5]);
rows.push(['lamina','testo su lamina base', LAMINA.suLamina, LAMINA.base, f(cr(LAMINA.suLamina,LAMINA.base)), 4.5]);
rows.push(['lamina','testo su lamina scura', LAMINA.suLamina, LAMINA.scura, f(cr(LAMINA.suLamina,LAMINA.scura)), 4.5]);
for (const r of rows) console.log(`| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]}:1 | ${r[5] || 'nessuna'} | ${r[5] ? (+r[4] >= r[5] ? 'passa' : 'NON passa') : 'decorativo'} |`);
```
