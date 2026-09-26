# Motion designer · Concept 18 · SOTTOSCOCCA

Ondata 2. Documento vincolante per chi muove qualcosa nel concept: scaffold
(`ponte/quota.ts`, `Radice.tsx`), section-builder, interaction-designer,
webgl-artist, shader-engineer. Qui ci sono le curve, il legame scroll → ponte,
il motore del ponte, la coreografia per schermata, le transizioni, le
variabili CSS e i contratti.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`, riga
e paragrafo 18 di `docs/matrice-concept-11-20.md`, tutti i doc dell'ondata 1 in
`concepts/18-sottoscocca/docs/` (creative-director, trend-researcher,
brand-strategist, ux-architect, tech-architect), `design-taste-frontend` (5.D,
6.A, 6.B, dial), `full-output-enforcement`, il pilota (`motion-designer.md`,
`motion/easing.ts`, `spring.ts`, `core/ticker.ts`) solo per formato. Letti in
parallelo i file già scritti da art-director (`styles/tokens.ts`) e copywriter
(`content/lavori.ts`, per i tipi `Quota`, `IdPezzo`).

**Deviazione approvata** dall'orchestratore: three puro, niente R3F
(tech-architect §2.1). Nessun impatto sul motion: tutto passa dal ticker unico.

File miei (tutti in `src/pages/concepts/sottoscocca/motion/`):

| File | Contenuto |
|---|---|
| `easing.ts` | utilità numeriche, `cubicBezier`, 8 curve di mestiere + `ruotaLibera` e `fermo`, `BEZIER_CSS` |
| `choreography.ts` | tutte le durate (normali e ridotte), soglie del ponte e dello scroll, anti-lampeggio, foglio mobile, `variabiliMotion()` |
| `percorso.ts` | stazioni, `profiloDaGeometria`, `statoDaScroll`, `binarioDaQuota`, `aperturaCerchio`, le 4 funzioni `...DaPercorso` del contratto |
| `molle.ts` | `seguiDt`, `avvicina`, classe `MotorePonte` (quota, assestamento, binario, discesa, opacità, ruote, evidenze) |
| `useMotionVars.ts` | `useMotionVars`, `useTestoCaldo`, `CALCOLI` pronti (quota dell'asta, numero, discesa, opacità) |

---

## 0. Decisioni in breve

1. **Un solo movimento vero: il ponte.** Tutto il resto (scheda, barra,
   mensola, asta, blocco) sono pannelli su guide: entrano, si fermano, escono.
   Niente fade-up, niente stagger, niente parallasse, niente movimenti al
   caricamento. `MOTION_INTENSITY 6` è tutto nella salita.
2. **Le soglie sono in px di scroll, calcolate dalla geometria vera dei
   pannelli** (regola dei plateau dell'ux §3) una volta per misura, non a ogni
   frame. Il "percorso" 0..6 del tech-architect resta disponibile (funzioni
   `...DaPercorso`), ma la valutazione per frame è `statoDaScroll(profilo,
   scrollY)`: in unità di percorso una curva stesa su due stazioni di altezza
   diversa cambierebbe velocità al confine.
3. **La camera segue la quota** (`binario = binarioDaQuota(quota inseguita)`):
   l'auto resta nella stessa zona dell'inquadratura (trend P1) e c'è un solo
   easing, quello della salita. Il GL interpola le chiavi **linearmente**.
4. **Il motore è una classe pura** (`MotorePonte`) chiamata dal ticker nella
   fase `update`, scrive direttamente in `runtime`, nessuna allocazione per
   frame, identico a 30/60/120 Hz (lerp normalizzato sul dt).
5. **Reduced motion = stato finale immediato**: la quota scatta al plateau,
   al massimo uno scatto ogni 500 ms (anti-lampeggio), ruote ferme,
   pannelli senza traslazione; restano solo le dissolvenze che la direzione
   chiede (GL 200 ms) e le variazioni di luminosità di grandi superfici, mai
   nette (200 ms).
6. **Nessun GSAP, nessun lenis** (tech §2.2): scroll nativo, transizioni CSS
   con le curve di `BEZIER_CSS`, il resto nel ticker.

---

## 1. Principi (valgono anche per ciò che non è scritto qui)

- **Chi lo muove?** Ogni movimento ha una causa d'officina: la centralina
  idraulica (salita), la valvola (discesa), i fermi di sicurezza
  (assestamento), la mano del meccanico (ruota), una guida metallica
  (pannelli), un dente (aggancio del blocco). Se non c'è una causa, non si
  muove.
- **Niente elastico.** Nessuna curva supera 1, nessuna molla sotto-smorzata.
  L'unico "ritorno" è l'assestamento sui fermi, che è una posa verso il basso
  di 3,5 mm e una ripresa, mai un'oscillazione (verificato: minimo e massimo
  delle curve in 0..1, §13).
- **Il testo si legge a ponte fermo.** La salita avviene solo quando in vista
  c'è la scena, non un pannello.
- **Solo `transform` e `opacity`** nel DOM (e `clip-path` per la scheda). Mai
  `top/left/width/height`.
- **Variabili calde solo su foglie `data-sscvar`**, solo quando cambiano.

---

## 2. Le curve (`easing.ts`)

| Nome | cubic-bezier | Dove | Perché |
|---|---|---|---|
| `colonna` | `0.42, 0, 0.22, 1` | salita del ponte (tratto di scroll tra due quote), riempimento "sale sul ponte" del blocco | la pompa prende il carico senza strappo, sale costante, accosta lungo al dente |
| `sfiato` | `0.5, 0.04, 0.26, 1` | discesa 180 → 0 verso il planning, invio fallito (il bianco scende) | la valvola si apre, il peso accelera, i bracci si posano |
| `cassetto` | `0.2, 0.7, 0.2, 1` | entrata di scheda, foglio, barra, mensola, ritorno dell'asta; allontanamento della camera | pannello su guide: parte deciso, si ferma morbido |
| `via` | `0.5, 0, 0.75, 0.3` | uscita degli stessi pannelli, ritiro dell'asta | prende velocità e sparisce, niente coda |
| `aggancio` | `0.15, 0.9, 0.3, 1` | blocco che scatta nella tacca dei 10', ombra di aggancio | il dente: rapidissimo, frena secco |
| `ritorno` | `0.35, 0, 0.2, 1` | blocco che torna al bordo del buco o nel parcheggio | si stacca, scivola, si ferma |
| `vernice` | `0.4, 0, 0.6, 1` | pezzo da verde a bianco (GL, 250 ms) | simmetrica, il colore non "rimbalza" |
| `lineare` | `linear` | solo opacità | dissolvenze senza accelerazioni di luminosità |
| `ruotaLibera(t)` | solo JS | mezzo giro delle ruote | velocità massima subito (spinta), decadimento esponenziale per attrito del mozzo |
| `fermo(t)` | solo JS | assestamento sui fermi | 0 → 1 quadratico in 32% del tempo (caduta sul dente), 1 → 0 smootherstep (idraulica che riprende) |

Tutte esportate come funzioni (`CURVE`) e come stringhe CSS (`BEZIER_CSS`).

---

## 3. Il motore del ponte (`molle.ts`)

`MotorePonte.passo(dt, now, ingresso, uscita)`:

| Valore | Comportamento normale | Reduced motion |
|---|---|---|
| `quota.valore` | `seguiDt` verso l'obiettivo, 0,12 a frame a 60 Hz normalizzato sul dt; si posa sotto 0,01 cm | scatta all'obiettivo di plateau, al massimo uno scatto ogni 500 ms (salta direttamente all'ultimo) |
| assestamento | arrivando **salendo** a 20, 80 o 180: il carrello scende di 0,35 cm in 83 ms e torna in 177 ms (`fermo`), innesco a 0,2 cm dal plateau | nessuno |
| `binario` | `binarioDaQuota(quota inseguita)` senza l'assestamento (la camera è ferma, l'auto si posa) | idem, a scatti |
| `discesa` | `seguiDt` 0,12 | scatta con la quota |
| `opacitaScena` | insegue con velocità massima 1,6/s (anti-lampeggio: da 1 a 0,2 servono ≥ 0,5 s) | 200 ms lineari, agganciati allo scatto |
| `ruote` | quando la quota supera 6 cm salendo: +π in 1600 ms con `ruotaLibera`; riarmo sotto 1 cm; l'angolo si accumula (nessun salto all'indietro) | ferme; se il reduced arriva a metà giro, la ruota resta dov'è |
| `evidenza[id]` | 0 ↔ 1 lineare in 250 ms, scritta come `vernice(x)` | immediata |

- `salta(ingresso, uscita)`: porta tutto sugli obiettivi senza movimento né
  ruote. Si chiama al primo frame (lo fa `passo` da solo), all'arrivo da
  un'ancora nell'URL (ux §1.1: "il ponte è già a quell'altezza"), al cambio di
  orientamento, al ritorno da scheda nascosta.
- `plateauRaggiunto`: la quota di plateau se l'obiettivo è a plateau e la
  quota è entro 0,5 cm (l'assestamento resta dentro), altrimenti `null`. È
  l'unica fonte per `store.quotaPlateau`, `data-quota`, `aria-current` e
  l'annuncio `aria-live`.
- `cambiato`: true se l'ultimo passo ha cambiato qualcosa da ridisegnare
  (→ `runtime.markDirty()`). Il ritorno di `passo` dice se serve un altro frame.

---

## 4. Dallo scroll al ponte (`percorso.ts`)

### 4.1 Misure che servono (scaffold, fase `read`, solo se invalidate)

Per ognuna delle 6 stazioni, in px documento: `top`, `altezza`, e il
**pannello** di testo della quota (elemento con attributo
`data-ssc-pannello` dentro la sezione): `pannelloTop`, `pannelloAltezza`;
per il sottoscocca `fissa: true` se lo stadio sticky è attivo (non con
reduced motion né in modalità bassa sotto 520 px di altezza). Con queste,
`profiloDaGeometria(stazioni, vh, orient)` restituisce il profilo. Senza misure
valide (prerender, primo frame) si usa `profiloBase(vh, orient)` con le
altezze dell'ux §3.

### 4.2 Le soglie (px di scroll; E/U = soglie del pannello)

| Orientamento | E (il pannello entra: plateau comincia) | U (il fondo del pannello esce: plateau finisce) |
|---|---|---|
| landscape | bordo alto al 75% della finestra | bordo basso sopra il 20% |
| portrait | bordo alto all'80% | bordo basso sopra il 50% (sotto c'è la scena, ux §3) |

Ho tarato le soglie dell'ux (85% / 15%) a 75% / 20%: con 85/15 la finestra di
salita tra due pannelli è `vuoto − 0,7 vh` e con le altezze dell'ux diventava
30 vh per 60 cm, troppo brusca. Il principio resta: il pannello si legge a
ponte fermo (al 75% se ne vede solo la prima riga).

| Tratto | Da | A | Curva |
|---|---|---|---|
| 0 → 20 | scroll 0 | pannello gomme a E (almeno 0,45 vh) | `colonna` |
| plateau 20 | | fondo del pannello gomme oltre U | |
| 20 → 80 | | pannello freni a E | `colonna` |
| plateau 80 | | fondo del pannello freni oltre U | |
| 80 → 180 | | **aggancio dello stadio sticky** (bordo alto del sottoscocca a 0); senza pin: pannello a E | `colonna` |
| plateau 180 | tutto il sottoscocca e il deposito | | |
| 180 → 0 | bordo alto del ponte libero a 95% | a 35% (60 vh, ux §3) | `sfiato` |
| discesa camera 0 → 1 | bordo alto del ponte libero a 60% | a 15% | `cassetto` |
| scena 1 → 0,2 | bordo alto del ponte libero a 40% | a 5% | `lineare` |
| scena 0,2 → 0 | bordo basso del ponte libero (officina) a 90% | a 45% | `lineare` |

Ogni salita dura almeno 0,3 vh: se due pannelli sono troppo vicini la salita
si allarga attorno al centro del vuoto. Le soglie sono rese monotone (una
misura strana non inverte mai il tempo).

**L'arrivo a 180 coincide con il pin**: il ponte sale mentre lo stadio del
sottoscocca entra dal basso e si ferma esattamente quando lo stadio si
aggancia. È il momento firma: pagina ferma, auto ferma, vista dal basso.

### 4.3 Profilo con la geometria di riferimento (misurato con lo script, §13)

Landscape, vh 900 (stazioni: inizio 1 vh, gomme 1,8, freni 1,8, sottoscocca
3,2, deposito 1,1, ponte libero 1,3; pannelli a +0,25 vh, alti 0,8 vh):

| Scroll (vh) | 0 | 0,25 | 0,5 | 1,85 | 2,0 | 2,3 | 3,65 | 4,0 | 4,6 | 7,95 | 8,25 | 8,55 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| quota (cm) | 0 | 15 | 20 | 20 | 45 | 80 | 80 | 131 | 180 | 180 | 52 | 0 |

Portrait, vh 667: 0 → 20 entro 0,75 vh; 20 → 80 tra 2,05 e 2,85; 80 → 180 tra
4,15 e 5,2; discesa tra 8,15 e 8,75.

### 4.4 Richieste di layout ai section-builder delle quote

- Il pannello di testo di gomme, freni e sottoscocca porta `data-ssc-pannello`.
- Gomme: il pannello comincia **almeno 20 vh dopo** l'inizio della sezione
  (l'auto che si stacca da terra si vede senza testo). Freni: il vuoto di
  sola scena tra il fondo del pannello gomme e l'inizio del pannello freni è
  di almeno 100 vh (landscape) / 110 svh (portrait). Stesso vuoto tra freni e
  lo stadio del sottoscocca.
- Mai due pannelli nella stessa finestra (ux §3).

### 4.5 Altre funzioni

- `binarioDaQuota(cm)`: 0 cm → 0, 20 → 1, 80 → 2, 180 → 3, lineare a tratti.
  `segmentoBinario(b)` → `{ k, f }` per interpolare le chiavi.
- `aperturaCerchio(binario)`: 0 → 1 tra 1,4 e 1,9, 1 fino a 2,3, → 0 a 2,7
  (curva `colonna`). Il cerchio anteriore a 80 cm va al 35% così, non di colpo.
- `percorsoDaScroll`, `scrollDaPercorso` (inverso esatto, errore 0 px),
  `quotaDaPercorso`, `binarioDaPercorso`, `discesaDaPercorso`,
  `opacitaDaPercorso` (contratto tech §6.3), `scrollDelPlateau(profilo, q)`
  (per i fermi immagine e i test).

---

## 5. Coreografia per schermata

Tempi di scroll della geometria di riferimento landscape; cosa si muove e
cosa no.

### 5.1 Apertura · 0 cm
- **Caricamento**: nessuna animazione d'ingresso. Il poster WebP è già la
  scena a 0 cm; il canvas compare sopra con opacità 0 → 1 in 300 ms lineari
  quando ha disegnato davvero il primo frame (shader). Testi fermi.
- **Primo scroll**: il ponte si stacca subito (0 → 20 in 0,5 vh, `colonna`),
  a 6 cm le ruote fanno mezzo giro lento (1,6 s, `ruotaLibera`): è la
  spiegazione del gesto, niente "Scorri".
- "Trova un buco" della testata compare quando quello dell'apertura esce
  (opacità 160 ms + `visibility`).

### 5.2 Gomme · 20 cm
- Arrivo al plateau con assestamento sui fermi (3,5 mm). Pannello in flusso,
  fermo rispetto alla pagina (nessuna animazione propria).
- Punti: comparsa senza movimento (seguono solo la proiezione).

### 5.3 Freni e sospensioni · 80 cm
- 20 → 80 in circa 0,45 vh: la camera scende all'altezza del mozzo con
  l'auto. Il cerchio anteriore si apre al 35% mentre la camera arriva
  (`aperturaCerchio`). Assestamento all'arrivo.

### 5.4 Il sottoscocca · 180 cm (firma)
- 80 → 180 lungo il vuoto e l'ingresso dello stadio (circa 1 vh), camera che
  passa sotto e guarda in su; si ferma esattamente all'aggancio del pin, con
  l'assestamento. Poi tutto fermo per 3 finestre: si toccano i punti.
- Tocco di un punto: pezzo verde → bianco in 250 ms (`vernice`); scheda che
  si apre (§6.1).

### 5.5 Deposito
- Ponte fermo a 180. La foto copre la scena: nessuna dissolvenza (ux: netta).

### 5.6 Il ponte libero
- Entrando: 180 → 0 in 60 vh (`sfiato`, la camera torna su con l'auto), poi
  la camera si allontana (`cassetto`) e la scena sfuma al 20% (opacità
  limitata a 1,6/s). L'asta si ritira a destra (420 ms, `via`) quando
  `modoAsta` diventa `ore`; torna (`cassetto`) uscendo.
- Planning: vedi §6.5.

### 5.7 L'officina e 5.8 Piede
- La scena va a 0 mentre l'officina entra. Niente altro si muove.

### 5.9 Elementi fissi
- Asta: indice che segue `runtime.quota.valore` (variabile calda
  `--ssc-quota-asta`), numero arrotondato a 5 cm (`useTestoCaldo`), nessuna
  transizione CSS sull'indice (è già inseguito).
- Testata: fondo trasparente → nero pieno in 200 ms lineari, con isteresi
  (vedi §9).

---

## 6. Transizioni (CSS, con le variabili di §8)

### 6.1 Scheda del punto (desktop)
Pannello su guide che esce **dal lato del punto**: `clip-path: inset(0 100%
0 0)` → `inset(0)` (o dal lato opposto se il punto è a destra) in 280 ms
`cassetto`, più `translateX(16px → 0)` nella stessa direzione. Niente
opacità. Chiusura 180 ms `via`. Cambiando punto con una scheda aperta: la
vecchia chiude e la nuova apre in sequenza stretta (nessuna sovrapposizione
di due schede).

### 6.2 Foglio mobile
`translateY(100% → 0)` 320 ms `cassetto`; chiusura 220 ms `via`. Trascina giù
(interaction-designer): il foglio segue il dito 1:1 verso il basso, non sale
oltre la posizione aperta; al rilascio chiude se oltre il 30% dell'altezza o
con velocità > 0,6 px/ms, altrimenti torna in 200 ms `cassetto`
(`FOGLIO` in choreography).

### 6.3 Barra "Il tuo lavoro" e mensola
Entrano dal basso `translateY(calc(100% + 24px) → 0)`, 280 / 240 ms
`cassetto`; escono 200 / 180 ms `via`. Il testo della somma cambia senza
animazione.

### 6.4 Asta
Ritiro `translateX(calc(100% + 16px))` 420 ms `via`; ritorno 420 ms
`cassetto`. Guidato da `data-asta="ore"` (o classe) scritto da React, non
dal ticker.

### 6.5 Blocco del planning
- Trascinamento: il blocco segue il puntatore 1:1 (niente ritardo); l'ombra
  di aggancio salta di tacca in 90 ms `aggancio`.
- Rilascio valido: `transform` alla posizione agganciata, 160 ms `aggancio`.
- Non ci sta / ponte sbagliato / fuori orario: torna in 260 ms `ritorno`.
- "Sale sul ponte" (invio): uno strato bianco interno `scaleY(0 → 1)` con
  `transform-origin: bottom`, 400 ms `colonna` (il bianco sale come il
  ponte). Invio fallito: `scaleY(1 → 0)` 240 ms `sfiato`.
- Corsie non adatte al 40%: 200 ms lineari all'afferrare, stesso tempo al
  rilascio.
- Cambio giorno: contenuto delle corsie in dissolvenza 200 ms, **al massimo un
  cambio visibile ogni 500 ms** (frecce tenute premute sui radio: la
  selezione segue subito, il planning salta all'ultimo giorno scelto).

### 6.6 GL e fondale
Canvas on: 0 → 1 in 300 ms. On → off (fallback): 300 ms. Foto del fallback al
plateau: dissolvenza 300 ms. Reduced motion: dissolvenza incrociata del GL tra
due inquadrature ferme in 200 ms (`webgl/dissolvenza.ts`).

---

## 7. Reduced motion (riepilogo)

| Cosa | Normale | Ridotto |
|---|---|---|
| Ponte e camera | salita continua, assestamento | scatto al plateau (a metà del tratto), max 1 ogni 500 ms, dissolvenza GL 200 ms |
| Ruote | mezzo giro | ferme |
| Evidenza pezzo | 250 ms | immediata |
| Opacità scena | ≤ 1,6/s | 200 ms |
| Scheda, foglio, barra, mensola, asta, blocco | traslazioni | 0 ms (stato finale) |
| Canvas on/off, fondo testata | 300 / 200 ms | 200 ms (grandi superfici: mai un salto netto) |
| Foto fallback | 300 ms | immediate |
| Sottoscocca | pin | niente pin (`fissa: false`: la salita si calcola sul pannello) |
| Link dell'asta | `smooth` | istantanei (scaffold) |

Le durate ridotte sono in `DURATE_RIDOTTE` e nelle variabili ridefinite su
`.ssc-root[data-motion="reduced"]` (§8).

---

## 8. Variabili CSS

### 8.1 Statiche (per `tokens.css`, art-director)

Generate da `variabiliMotion(ridotto)`. Su `.ssc-root` i valori normali, su
`.ssc-root[data-motion="reduced"]` quelli ridotti.

| Variabile | Normale | Ridotto |
|---|---|---|
| `--ssc-curva-colonna` | `cubic-bezier(0.42, 0, 0.22, 1)` | uguale |
| `--ssc-curva-sfiato` | `cubic-bezier(0.5, 0.04, 0.26, 1)` | uguale |
| `--ssc-curva-cassetto` | `cubic-bezier(0.2, 0.7, 0.2, 1)` | uguale |
| `--ssc-curva-via` | `cubic-bezier(0.5, 0, 0.75, 0.3)` | uguale |
| `--ssc-curva-aggancio` | `cubic-bezier(0.15, 0.9, 0.3, 1)` | uguale |
| `--ssc-curva-ritorno` | `cubic-bezier(0.35, 0, 0.2, 1)` | uguale |
| `--ssc-curva-vernice` | `cubic-bezier(0.4, 0, 0.6, 1)` | uguale |
| `--ssc-curva-lineare` | `linear` | uguale |
| `--ssc-durata-evidenza` | 250ms | 0ms |
| `--ssc-durata-scheda-apri` / `-chiudi` | 280ms / 180ms | 0ms |
| `--ssc-durata-foglio-apri` / `-chiudi` / `-ritorno` | 320 / 220 / 200ms | 0ms |
| `--ssc-durata-barra-entra` / `-esce` | 280 / 200ms | 0ms |
| `--ssc-durata-mensola-entra` / `-esce` | 240 / 180ms | 0ms |
| `--ssc-durata-asta-ritiro` / `-ritorno` | 420 / 420ms | 0ms |
| `--ssc-durata-blocco-aggancio` / `-ritorno` | 160 / 260ms | 0ms |
| `--ssc-durata-blocco-sale` / `-scende` | 400 / 240ms | 0ms |
| `--ssc-durata-ombra-tacca` | 90ms | 0ms |
| `--ssc-durata-corsie-attenua` | 200ms | 0ms |
| `--ssc-durata-planning-giorno` | 200ms | 0ms |
| `--ssc-durata-testata-fondo` | 200ms | 200ms |
| `--ssc-durata-testata-bottone` | 160ms | 0ms |
| `--ssc-durata-gl-comparsa` / `-spegni` | 300 / 300ms | 200 / 200ms |
| `--ssc-durata-fondale-foto` | 300ms | 0ms |
| `--ssc-durata-dissolvenza-ridotta` | 200ms | 200ms |

### 8.2 Calde (inline sulle foglie `data-sscvar`, via `useMotionVars`)

| Variabile | Valore | Chi la usa |
|---|---|---|
| `--ssc-quota-asta` | quota / 200 (0..0,9) | indice dell'asta |
| `--ssc-quota` | cm | fondale del fallback, se serve |
| `--ssc-discesa` | 0..1 | chi deve seguire l'allontanamento in DOM |
| `--ssc-opacita-scena` | 0..1 | `<canvas>` e immagine del fondale |

Testo caldo: numero della quota (`CALCOLI.numeroQuota`, "0".."180" a passi
di 5) con `useTestoCaldo`, su una foglia `aria-hidden`.

---

## 9. Anti-lampeggio

- Nessuna curva o molla oscilla; nessun cambio di luminosità > 3/s.
- Grandi superfici (canvas, corsie, testata): al massimo un cambio ogni
  500 ms (`INTERVALLO_MINIMO_GRANDI_SUPERFICI`). Il motore lo garantisce per
  la scena (velocità dell'opacità limitata; scatti ridotti distanziati di
  500 ms, verificato: scroll avanti e indietro ogni 166 ms → cambi a 0,17 s,
  0,67 s, 1,17 s, 1,67 s). Testata e planning: isteresi/limite a carico di chi
  li costruisce, con questa costante.
- I neon della scena non si accendono mai: sono accesi dal primo frame.

---

## 10. API dei moduli (firme esatte)

```ts
// percorso.ts
export const STAZIONI: readonly ['inizio','gomme','freni','sottoscocca','deposito','ponte-libero'];
export interface GeometriaStazione { top: number; altezza: number; pannelloTop?: number | null; pannelloAltezza?: number | null; fissa?: boolean }
export function profiloDaGeometria(stazioni: readonly GeometriaStazione[], vh: number, orient: 'landscape' | 'portrait'): ProfiloPonte;
export function profiloBase(vh: number, orient: Orientamento): ProfiloPonte;
export function creaStatoPonte(): StatoPonte;   // { quota, binario, discesa, opacita, plateau }
export function statoDaScroll(profilo: ProfiloPonte, scrollY: number, ridotto: boolean, out: StatoPonte): StatoPonte;
export function percorsoDaScroll(scrollY: number, vh: number, stazioni: readonly GeometriaStazione[]): number;
export function binarioDaQuota(cm: number): number;
export function segmentoBinario(b: number): { k: 0 | 1 | 2; f: number };
export function aperturaCerchio(binario: number): number;

// molle.ts
export class MotorePonte {
  cambiato: boolean;
  readonly plateauRaggiunto: Quota | null;
  salta(ingresso: IngressoPonte, uscita: UscitaPonte): void;
  passo(dt: number, now: number, ingresso: IngressoPonte, uscita: UscitaPonte): boolean;
}
// IngressoPonte = { obiettivo: StatoPonte; ridotto: boolean; evidenze: readonly IdPezzo[] }
// UscitaPonte = campi di runtime: quota{target,valore}, binario, discesa, opacitaScena, ruote, evidenza

// useMotionVars.ts
export function useMotionVars(ref, calcola: (rt) => Record<`--ssc-${string}`, number | string>, opzioni?: { decimali?: number }): void;
export function useTestoCaldo(ref, calcola: (rt) => string): void;
export const CALCOLI: { quotaAsta, quota, discesa, opacitaScena, numeroQuota };

// choreography.ts
export const DURATE, DURATE_RIDOTTE, CURVA_DI, PONTE, SOGLIE_PANNELLO, SOGLIE_PERCORSO, FOGLIO, ...;
export function durata(nome: NomeDurata, ridotto: boolean): number;
export function variabiliMotion(ridotto: boolean): Record<`--ssc-${string}`, string>;
```

---

## 11. Contratti richiesti allo scaffold

Importo: `../core/ticker` (`ticker.add(fn, fase)` che restituisce la
rimozione, fasi `read|update|write|render`, `TickFn = (dt, now) => boolean |
void`, stessa semantica del pilota senza lenis), `../state/runtime` (oggetto
`runtime` con i campi di tech §6.2), `../content/lavori` (tipi `Quota`,
`IdPezzo`: già conformi). Verificati con stub identici a queste firme.

`ponte/quota.ts` (scaffold) deve essere, nella sostanza:

```ts
const obiettivo = creaStatoPonte();
const motore = new MotorePonte();
const ingresso = { obiettivo, ridotto: false, evidenze: [] as IdPezzo[] };
let profilo = profiloBase(900, 'landscape');

// fase read, solo con stazioni invalidate:
profilo = profiloDaGeometria(geometrie, runtime.viewport.h, runtime.viewport.orient);

// fase update (dopo la lettura di scrollY):
runtime.percorso = percorsoDaScroll(runtime.scrollY, runtime.viewport.h, geometrie);
ingresso.ridotto = store.get().reducedMotion;
ingresso.evidenze = pezziEvidenziati(); // PUNTI[scheda].pezzi ∪ PUNTI[puntoSotto].pezzi, array riusato
statoDaScroll(profilo, runtime.scrollY, ingresso.ridotto, obiettivo);
const inMoto = motore.passo(dt, now, ingresso, runtime);
if (motore.cambiato) runtime.markDirty();
const pl = motore.plateauRaggiunto;
if (pl !== null && pl !== store.get().quotaPlateau) { /* store, data-quota, aria-live */ }
return inMoto;
```

Richieste precise:
1. **Il motore scrive** `quota.valore`, `quota.target`, `binario`,
   `discesa`, `opacitaScena`, `ruote`, `evidenza` (tech §6.2 dava discesa e
   opacità a `ponte/quota.ts`: qui passano dal motore per essere smorzate e
   limitate, `quota.ts` fornisce solo gli obiettivi).
2. `runtime.puntoSotto: IdPunto | null` (hover/fuoco del punto, lo scrive
   `sections/Punti`), per le evidenze al passaggio (ux §7.4).
3. `motore.salta(...)` all'arrivo da hash, al cambio di orientamento e al
   ritorno da scheda nascosta.
4. Stazioni: misurare anche `[data-ssc-pannello]` e il flag `fissa` (§4.1).
5. `data-motion` su `.ssc-root` già previsto (tech §5): serve alle variabili
   ridotte.

---

## 12. Note per webgl-artist e shader-engineer

- Le chiavi del binario si interpolano **linearmente** su `f` di
  `segmentoBinario(runtime.binario)`; l'easing è già nella quota.
- Il gruppo auto+bracci si alza di `runtime.quota.valore / 100` m (compreso
  l'assestamento); la camera usa `binario`, non la quota: così l'assestamento
  si vede come una posa dell'auto.
- `runtime.discesa` fonde la posa corrente con la posa "lontana" (auto più
  piccola e in alto), da definire in `binario.ts` per landscape e portrait.
- Ruote: rotazione attorno all'asse del mozzo di `runtime.ruote` rad.
- Evidenza: `lerp(verde, bianco, runtime.evidenza[id])` sul materiale del
  pezzo; cerchio: `lerp(1, 0.35, max(aperturaCerchio(binario), evidenza.disco ?? 0))`.
- Fermi immagine: `scrollDelPlateau(profilo, quota)` dà lo scroll del centro
  di ogni plateau.
- Render solo con `runtime.dirty`; a scena ferma il motore restituisce
  `false` e il ticker dorme.

---

## 13. Verifiche fatte

- `tsc` strict (+ `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`) ed
  ESLint 9 con le regole del progetto, sui 5 file, contro stub del ticker e del
  runtime con le firme di §11 e il `content/lavori.ts` vero del copywriter:
  zero errori, zero avvisi.
- Script numerico (esbuild + node, nello scratchpad): profili landscape e
  portrait (§4.3), inverso percorso/scroll con errore 0 px, curve sempre in
  0..1 (nessuna sovraelongazione), `fermo` con un solo minimo, motore a 30,
  60 e 120 Hz: stesso istante di plateau (0,567 s), assestamento visto, mezzo
  giro esatto (π), evidenza che torna a 0, `inMoto = false` a riposo;
  reduced: cambi distanziati di 500 ms.
- Nessun trattino lungo, nessun TODO, nessun accesso al browser a livello di
  modulo.

---

## Richieste ad altri agent

- **scaffold-engineer**: §11 (punti 1-5).
- **art-director**: riportare in `tokens.css` le variabili di §8.1 (normali su
  `.ssc-root`, ridotte su `.ssc-root[data-motion="reduced"]`); i valori sono
  quelli di `variabiliMotion()`.
- **section-builder gomme / freni / sottoscocca**: `data-ssc-pannello` sul
  pannello e vuoti di scena di §4.4.
- **section-builder-asta**: indice con `useMotionVars(ref, CALCOLI.quotaAsta)`,
  numero con `useTestoCaldo(ref, CALCOLI.numeroQuota)`, ritiro di §6.4.
- **section-builder-punti**: scheda e foglio come §6.1-6.2; scrive
  `runtime.puntoSotto`.
- **section-builder-ponte-libero** e **interaction-designer**: blocco,
  corsie, cambio giorno come §6.5 (limite di 500 ms); foglio con `FOGLIO`.
- **shader-engineer / webgl-artist**: §12.
