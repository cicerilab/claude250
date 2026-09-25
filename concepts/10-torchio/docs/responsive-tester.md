# Responsive tester · Concept 10 · IMPRONTA

Ondata 4 (QA). Nessun file sorgente toccato. Build di produzione (`npm run build`)
servita con `npx vite preview --port 8201 --strictPort`, chiusa alla fine.

Letti: `docs/processo-agent.md`, `.claude/skills/playwright-cli/SKILL.md`,
`docs/ux-architect.md` (§2, §5), `docs/tech-architect.md` (§4, proprietari),
`docs/shader-engineer.md` (§5, §8), `docs/section-builder-tecniche.md`,
`-legatoria.md`, `-banco.md`.

---

## 1. Come ho provato

- Script Node con `playwright` globale e Chromium di `/opt/pw-browsers`,
  argomenti `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`
  e lo stesso script di init dello shader-engineer (toglie
  `failIfMajorPerformanceCaveat` solo nel browser di prova).
- **Font veri**: le richieste a `fonts.googleapis.com` / `fonts.gstatic.com` sono
  intercettate con `context.route` e servite da `fetch` di Node (che passa dal
  proxy), stesso `content-type`, `access-control-allow-origin: *`. Verificato a
  ogni larghezza: `document.fonts` con 17 facce, `Anybody` e `Hanken Grotesk`
  in stato `loaded`, larghezza di misura in canvas diversa dal ripiego
  (373 px contro 305). Nel giro 1440 `?gl=0` la lettura iniziale ha dato 2 facce
  (misura fatta troppo presto); ricontrollato a parte con una sonda: a 1440 i
  font Google sono caricati, e gli screenshot mostrano Anybody vero.
  **Nessun font di ripiego in nessuno screenshot.**
- Viewport: 375×812 e 768×1024 con `isMobile` + `hasTouch`; 1440×900 e
  2560×1440 desktop. DPR 1 ovunque (SwiftShader a DPR 2 non finisce il giro).
- Due giri completi: **GL** (`?gl=1`, attesa di `data-gl="on"`) e **fallback**
  (`?gl=0`, `data-gl="off"`). Prima di ogni scatto: `scrollTo`, attesa che i
  blocchi a rilievo sullo schermo abbiano `--imp-press` > 0,9 (tetto 10 s; alcuni
  blocchi si fermano di proposito a 0,78-0,86), poi 700 ms e, col GL, due frame
  disegnati in più (`__improntaGL.frameDisegnati`).
- Misure per scatto (in `qa/shots/misure/report-<gl|gl0>-<w>.json`):
  `scrollWidth`, elementi con testo sotto `.cl-backbtn`, elementi che escono dal
  bordo senza ritaglio, font dei titoli, `data-gl`, blocchi non premuti.
- Banco: campi del biglietto compilati (Stefano Brun, Commercialista), carta
  Cotone, lamina, tiratura 150, contatto email, leva tenuta 2,2 s col mouse.

### Dove sono gli screenshot

```
concepts/10-torchio/qa/shots/
  375/ 768/ 1440/ 2560/            giro GL (?gl=1)
  gl0/375/ … gl0/2560/             giro fallback (?gl=0)
  full-<w>-a|b|c.png               pagina intera a pezzi da 8000 px (giro ?gl=0)
  misure/report-*.json             misure per scatto
```

Nomi per sezione: `01-testata-hero`, `02-per-chi-lavori`, `03a/b/c-tecniche-inizio|meta|fine`
(10%, 50%, 90% della corsa del pin), `04-carta`, `05a/b-legatoria-inizio|fine`,
`06a-banco-vuoto`, `06b-banco-compilato`, `06c-banco-compilato-leva`,
`06d-banco-successo`, `07-bottega`, `08-colophon`.

Nota sulle pagine intere: sono scattate dopo l'invio (l'hero porta già "Stefano
Brun" e la carta è Cotone) e con la cattura a pagina intera le altezze in `svh`
del pin e dell'hero si accorciano: servono per vedere ritmo e vuoti, non il pin.

---

## 2. Scroll orizzontale

`document.documentElement.scrollWidth` = larghezza del viewport in **tutti i 56
scatti** (375, 768, 1440, 2560; GL e fallback). Nessun elemento con testo esce dal
bordo senza un antenato che lo ritagli. **Nessuno scroll orizzontale.**

---

## 3. Tabella sezione × larghezza

Gravità: **A** alta (si vede rotto o manca contenuto), **M** media (difetto
evidente, non blocca), **B** bassa (rifinitura). "Proprietario" dal
tech-architect §4.

| Sezione | 375 | 768 | 1440 | 2560 |
|---|---|---|---|---|
| **Testata + hero** (`01`) | M: vuoto di ~250 px tra la parola *impronta* (piccola, 40 px di corpo) e il titolo; la parola sembra un'intestazione, non la pressa. Testata con "indice ▴ la pressa" in alto a destra (va bene rispetto a integrazione-sito). | **A-M: vuoto di ~380 px** (y 190-570) tra *impronta* e il titolo: metà schermo di carta vuota. | B: ~230 px vuoti in fondo; colonna destra vuota. "Prova la tua" della testata finisce a 1267, margine destro 173 px contro 86 del contenuto a sinistra (la riga non è simmetrica al 7vw). | **M: metà inferiore dello schermo vuota** (y 600-1440 su 1440): l'hero non riempie il primo schermo grande. |
| **Per chi / #lavori** (`02`) | M: con la sezione in cima, il bottone del sito copre la freccia "‹" e l'inizio dei nomi della fila (`imp-perchi__freccia`, `nome-bottone`) e "Prova la tua" del segnapagina sta sopra il "Prova la tua" della scheda: **due "Prova la tua" visibili insieme**. | M: il "Prova la tua" fisso in basso a destra copre la freccia "›" della fila (y ≈ 968). | **M: "Sul Noncello" tagliato a destra** ("Noncellc"): il titolo della copertina esce dal pezzo (anche in fallback). | **A (solo GL): copertina "Sul Noncello" vuota**, niente titolo né autrice: il GL non la disegna e il fantasma è trasparente. In fallback c'è, ma tagliata a destra come a 1440. |
| **Tecniche** (`03a-c`) | B: ~120 px vuoti sopra e sotto il foglio; testo a 20 px dal segnapagina. Taglio colorato: il bordo si vede come filetto nero, non come colore. | B: un solo scatto (50%) mostrava indice su "lamina" ma voce "A secco" e parola sbiadita (dopo un salto 10%→50%); **non riprodotto** in due sonde successive (a 0,5, 3 e 8 s voce giusta): transitorio della ristampa. | ok. Voce corrente della testata resta "lavori" (regola ux: voce precedente). | come 768 (indice "lamina", voce "A secco" nello scatto 50%, transitorio). Palco con ~500 px vuoti sotto il foglio. |
| **Carta** (`04`) | B: la fila Grafite passa sotto il bottone del sito (scorrendo). | ok. | B: intro "La carta che scegli…" rientrata di 100 px rispetto al titolo (x 187 contro 86): sembra un errore di allineamento, non una scelta. | B: stesso rientro (x 514 contro 423). |
| **Legatoria** (`05a-b`) | B: il bottone del sito copre il testo della brossura mentre scorre. | B: ~150 px vuoti prima di "Si parte da 30 copie". | B: ~200 px vuoti sopra e ~240 sotto la fine; il filo passa sotto il bottone del sito. | ok. |
| **Banco vuoto** (`06a`) | ok (lastra sticky, "Totale indicativo" leggibile). Il bottone del sito copre "carta intestata" / "libro" scorrendo. | B: ~120 px vuoti tra l'intro e la lastra. Lastra alta ~48% dello schermo (0-494), più dei 42svh. | ok. | B: lastra con molta carta vuota attorno al biglietto. |
| **Banco compilato** (`06b-c`) | B: tornando su compare la testata e copre l'h2 "Il banco di prova". | M: con la leva a metà schermo, la **lastra sticky copre il bordo superiore della leva** (leva 476-547, lastra fino a 494). | ok. | ok. |
| **Banco successo** (`06d`) | M: nome della prova **sdoppiato** dopo l'invio (a pressione piena la lamina mostra una seconda copia sfalsata di ~2 px; prima dell'invio è pulito). Il fuoco porta la frase sotto la lastra, visibile (verificato: frase 413-615, lastra fino a 397). | M: stesso sdoppiamento. | M: stesso sdoppiamento (fallback). | ok. |
| **Bottega** (`07`) | B: bottone del sito + "Prova la tua" coprono le note degli orari scorrendo. | ok. | ok. | ok. |
| **Colophon** (`08`) | **A (fallback): il sigillo IMPRONTA è un rettangolo grigio pieno** invece del marchio premuto. Con GL il marchio c'è. | A (fallback): come 375. | A (fallback): rettangolo grigio 1180×127 px. | A (fallback): rettangolo grigio. |

### Note sul giro GL

- Rilievo presente con GL acceso a tutte le larghezze (hero, pezzi, tecniche,
  carta, bottega, marchio del colophon), tranne la copertina a 2560.
- **Leva col GL in SwiftShader**: a 768 e 1440 la tenuta di 2,2 s finisce in
  "Hai lasciato presto" (frame da centinaia di ms); a 375 e 2560 l'invio riesce.
  In fallback l'invio riesce a tutte le larghezze. È un limite della prova
  headless (lo dice anche il section-builder-banco §6), non un difetto di
  layout: gli scatti `768/06d` e `1440/06d` mostrano quindi il messaggio di
  rilascio anticipato, il successo è in `gl0/*/06d`.

---

## 4. Problemi in ordine di gravità, con proprietario

1. **A · Sigillo del colophon rettangolo grigio senza GL** (tutte le larghezze,
   `?gl=0`, cioè ogni telefono dove lo shader si spegne). Causa verificata:
   `--imp-segno` è vuoto sull'elemento (`getPropertyValue` = ''), `mask-image`
   calcolato `none`. In build Vite inlinea `marchio-impronta.svg?url` come
   `data:image/svg+xml,%3csvg%20xmlns='http://…'…` con apici singoli; scritto
   senza virgolette in `url(${marchioUrl})` è un *bad-url*, la proprietà viene
   scartata e resta il fondo pieno del solco. In `vite dev` non si vede (lì è un
   percorso). Correzione: `url("${marchioUrl}")`.
   → **section-builder-colophon**, `sections/Colophon/Colophon.tsx` riga 78.
2. **A · Copertina "Sul Noncello" vuota col GL a 2560**: titolo e autrice non
   disegnati, fantasma trasparente. Probabile superamento degli 8 blocchi sullo
   schermo o maschera non cotta; è il caso `data-imp-gl="fuori"` già segnalato
   dallo shader-engineer §10.
   → **art-director** (`styles/relief-fallback.css`, regola per `fuori`) e
   **section-builder-per-chi** (`priorita` dei pezzi).
3. **M · "Noncello" tagliato a destra** nella copertina a 1440 e 2560 (anche
   in fallback): il titolo è più largo del pezzo.
   → **section-builder-per-chi**, `per-chi.css` (corpo del titolo in `cqi` o a capo).
4. **M · Hero con metà schermo vuota** a 768 (~380 px tra la parola e il titolo)
   e a 2560 (metà inferiore); a 375 ~250 px e la parola *impronta* è piccola.
   → **section-builder-hero**, `hero.css`.
5. **M · Doppio "Prova la tua" e controlli sotto i fissi**: a 375 il
   segnapagina mostra "Prova la tua" accanto a quello delle schede del per-chi;
   a 375 il bottone del sito copre la freccia "‹" della fila dei lavori, a 768 il
   "Prova la tua" fisso copre la freccia "›".
   → **section-builder-hero** (`Testata.tsx`/`testata.css`, regola di comparsa)
   e **section-builder-per-chi** (`per-chi.css`, spazio sotto la fila).
6. **M · Nome della prova sdoppiato dopo l'invio** (lamina a pressione piena,
   375/768/1440 fallback e 768 GL): a `--imp-press` 1 l'ombra della lamina si
   legge come seconda copia sfalsata.
   → **art-director** (`relief-fallback.css`, `.imp-caldo`) o
   **section-builder-banco** (`banco.css`, profondità della prova).
7. **M · Lastra sticky sopra la leva a 768** (e lastra al 48% dello schermo tra
   600 e 1023 px).
   → **section-builder-banco**, `banco.css`.
8. **B · Intro della carta rientrata di ~100 px** rispetto al titolo a 1440 e
   2560. → **section-builder-carta**, `carta.css`.
9. **B · Taglio colorato** a fine pin: il bordo si vede come filetto nero, non
   come colore dipinto (375, 768, 1440). → **section-builder-tecniche**, `tecniche.css`.
10. **B · Tecniche, indice e voce disallineati per un attimo** dopo un salto
    lungo nel pin (visto una volta a 768 e 2560, non riprodotto).
    → **section-builder-tecniche**, da tenere d'occhio.
11. **B · Vuoti** in legatoria (fine, 1440) e sopra la lastra del banco (768);
    testata desktop non simmetrica (margine destro 173 px a 1440).
    → section-builder-legatoria, -banco, -hero.

Sotto il bottone "Torna in Ciceri Lab" non resta mai fermo nulla: le
sovrapposizioni misurate sono tutte di testo che ci scorre sotto, tranne la fila
del per-chi a 375 descritta al punto 5.

---

## 5. Richieste ad altri agent

- **section-builder-colophon**: `url("${marchioUrl}")` in `Colophon.tsx:78` (punto 1).
- **section-builder-per-chi**: titolo della copertina dentro il pezzo; spazio
  sotto la fila per il bottone del sito (375) e il "Prova la tua" fisso (768).
- **art-director / shader-engineer**: rilievo di ripiego per i fantasmi
  `data-imp-gl="fuori"` (copertina a 2560).
- **section-builder-hero**: riempire o accorciare il vuoto dell'hero a 768 e
  2560; segnapagina non insieme a un altro "Prova la tua" visibile.
- **section-builder-banco**: lastra sotto i 42svh tra 600 e 1023; sdoppiamento
  della lamina a pressione piena.
