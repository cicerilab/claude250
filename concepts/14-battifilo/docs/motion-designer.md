# Motion designer · Concept 14 · BATTIFILO

Ondata 2. Documento vincolante per chi muove qualcosa nel concept: scaffold,
section-builder-linea, -foto, -scheda, -misura, -fascia, e per chi collauda
(accessibility, performance). Qui ci sono le curve, le molle, la battuta del
filo, il controller della cassetta, la coreografia schermata per schermata,
le variabili CSS e il contratto di classi che `motion.css` usa.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/processo-agent.md`,
`concepts/14-battifilo/docs/` tutti (creative-director, trend-researcher,
brand-strategist, ux-architect, tech-architect, e quelli dell'ondata 2 già su
disco: interaction-designer, vector-artist), `styles/tokens.css` e
`interaction/*` già scritti in parallelo, il motion del pilota
(`concepts/10-torchio/.../motion/` e il suo doc) solo come formato,
`.claude/skills/design-taste-frontend/SKILL.md` (sez. 5, 6.B) e
`full-output-enforcement`.

File miei (tutti in `src/pages/concepts/battifilo/motion/`):

| File | Contenuto |
|---|---|
| `easing.ts` | utilità numeriche, `cubicBezier`, le sette curve del cantiere (funzioni + `BEZIER_CSS`), `alzaBattuta()` (la battuta del filo), `alzaSussulto()`, `hermiteVelocita()`, `cssLinear()` |
| `molla.ts` | `Molla {x, v, target}`, `passoMolla()` analitica sul dt, `parametriMolla(Hz, ζ)`, preset `MOLLE` (tensione, cade, presa), `seguiDt()` |
| `choreography.ts` | tutte le costanti del contratto (§7.2 tech-architect) e le altre durate, `tappaConIsteresi()`, `attesaCambioTappa()`, `durataVolo()`, `durataAggancio()`, `pendenzaMolle()`, `granelliPolvere()`, `stileGranello()`, `fineCambioTappa()`, `variabiliMotion()` |
| `cassetta.ts` | `creaCassetta()`: segue, sosta, aggancio, volo; scrive solo `runtime.cassetta` |
| `filo.ts` | `creaFilo()`: tendi, batti (3 forze), molle, sussulta; `pathFilo()`, `pathFiloTra()` |
| `battute.ts` | `creaBattute()`: i quattro lati della finestra, ribattuta di un lato, perimetro dell'invio; `trattoDalCentro()` |
| `motion.css` | dissolvenze di scheda, foto, menu, schermate; posa del gesso; polvere; lastra che sale; varianti reduced. 4,5 KB minificato, 1,1 KB gz, zero hex |

**Verifiche fatte** (cartella di prova nello scratchpad, con stub di
`core/tempo.ts` e `state/runtime.ts` scritti sulle firme di tech-architect
§6.2 e §7.1, e `node_modules` del pilota):
- `tsc -p tsconfig.app.json` (strict, `noUncheckedIndexedAccess`,
  `noUnused*`) e ESLint 9 con le regole del progetto: zero errori, zero
  avvisi su tutti e sette i file.
- Prove numeriche (esbuild + node, 60 Hz simulati):
  - battuta piena: alzata −7 px a 70 ms, impatto (0 px) a 126 ms, due
    rimbalzi di −1,8 e −0,5 px, ferma a 0 a 350 ms; mai sotto il getto dopo
    l'impatto; una battuta che parte da un filo molle (+20 px) non salta;
  - molla: stesso valore con un passo da 0,1 s o sei da 1/60 s (errore 0
    alla sesta cifra); `tensione` sovraelonga dell'1,4% e si ferma in 10
    frame; `cade` senza sovraelongazione, 51 frame;
  - cassetta: volo 0→1 in 483 ms; dito fermo 500 ms a 1,42 → aggancio su 1
    con battuta, stato `sosta`; un tremolio di 0,03 tappe non la stacca;
    oltre 0,06 riparte; rilascio lanciato a 5 tappe/s da 2,2 → 3 (mai più di
    una tacca oltre); rilascio lento a 2,62 → 3; quattro "mese prima" da 3
    → 2, 1, 0 e il quarto non fa niente (niente rimbalzo al bordo); volo
    0→15 in 800 ms senza superare 15; cambio di meta in volo: velocità
    −4,76 → −4,64 tappe/s (nessuno scatto);
  - battute: quattro lati finiti a 250, 367, 483 e 600 ms; la ribattuta di
    un lato lascia gli altri a 1; perimetro dell'invio 900 ms; ridotto = 1
    subito;
  - isteresi: da 7 si passa a 8 solo a 7,56, da 8 si torna a 7 solo a 7,44;
  - polvere: 8-12 granelli, opacità ≤ 0,36, stesso seme = stessi granelli.
- Chromium headless (playwright globale), `motion.css` su un DOM di prova:
  le variabili dentro `@keyframes btf-polvere` funzionano (granello a
  opacità 0,31 e −17 px a 150 ms, 0 a 950 ms); cambio di scheda: a 120 ms
  l'uscente è a 0,20 e l'entrante a 0,06 (mai due testi sopra il 50%), a
  400 ms l'uscente è `hidden`; il gesso passa da 100 a 280 px in 60 ms e
  arriva a 300 px a 160 ms.

---

## 0. Decisioni in breve

1. **Niente librerie di animazione.** CSS per dissolvenze, posa del gesso e
   polvere; il ticker unico per cassetta, filo e battute della finestra.
   Nessun `requestAnimationFrame` mio, nessun `setInterval`, nessun DOM.
2. **Un solo verbo: battere.** Ogni movimento del sito è il filo che si
   tende, batte e lascia un segno, o la conseguenza di quel segno (polvere,
   foto e scheda nuove). La foto e la scheda non "entrano": si velano.
3. **La battuta è a tempo, le correzioni sono a molla.** La battuta è una
   curva deterministica (`alzaBattuta`, 350 ms, impatto esatto al 36%), così
   il segno nasce sempre nello stesso istante; tensione e corda molle sono
   molle che ereditano posizione e velocità (nessuno scatto se si afferra la
   cassetta a metà battuta).
4. **Il segno nasce all'impatto, non all'aggancio.** `onAggancio` dice "la
   tappa è ferma" (store, URL, ARIA); `onImpatto` del filo, 126 ms dopo, dice
   "il gesso si posa" (clip della linea, polvere). Così la linea blu compare
   quando il filo tocca il calcestruzzo, non prima.
5. **Apertura: la cassetta non si muove** (ux-architect 5.1, confermato con
   una modifica di geometria, §5.1). Differenza dichiarata rispetto a CD
   §4.2 e tech-architect §9.3 ("vaA(1)"): vedi Richieste.
6. **Anti-lampeggio**: foto al massimo una ogni 500 ms (non tre al secondo),
   dissolvenze ≥ 250 ms (150 ms solo con reduced motion), polvere a opacità
   ≤ 0,36, nessun cambio di colore: l'errore è una corda molle, non un rosso.
7. **Reduced motion = stato finale immediato**: cassetta a salto secco, linea
   già battuta, nessuna oscillazione, nessuna polvere, finestra intera. Le
   uniche durate che restano sono le velature di foto e scheda (150 ms),
   perché un taglio netto di un'intera foto è più brusco di una velatura corta.

---

## 1. Principi

- **Chi lo spinge?** La mano (trascinamento), il filo (volo verso una tacca),
  il colpo (battuta, polvere), il tempo del cantiere (foto e scheda che si
  velano). Se un movimento non ha una di queste cause, non esiste.
- **La linea significa sempre tempo o misura** (trend-researcher P8): nessuna
  linea si anima per decoro. Niente barra piena che segue la cassetta
  (nota 5.5): dietro la cassetta c'è il gesso, che compare solo alla battuta.
- **Il layout non si muove.** Nessuna sezione scorre, entra o esce: cambiano
  solo opacità, il clip del gesso, la posizione della cassetta e la forma del
  filo. Niente fade-up, niente reveal, niente stagger d'ingresso.
- **A scatti di mese, non continuo**: la cassetta segue il dito 1:1, ma foto
  e scheda cambiano solo a metà mese (con isteresi) e al massimo ogni 500 ms.

---

## 2. Curve (`easing.ts`)

| Nome | CSS | Chi lo spinge | Dove |
|---|---|---|---|
| `tiro` | `cubic-bezier(0.45, 0, 0.15, 1)` | il filo tira la cassetta: parte piano mentre si tende, attraversa, frena lunga sulla tacca | volo della cassetta (tocco, tasti, swipe, rotella, "mese prima/dopo") |
| `aggancio` | `cubic-bezier(0.3, 0, 0.1, 1)` | la cassetta lasciata si assesta | aggancio al rilascio e dopo la sosta |
| `velatura` | `cubic-bezier(0.35, 0, 0.25, 1)` | una foto o una scheda si posa sull'altra | dissolvenze di foto, scheda, menu, schermate, istruzione, riga del fermo |
| `posa` | `cubic-bezier(0.12, 0.7, 0.2, 1)` | il gesso che si posa dopo il colpo: 80% nei primi 60 ms | clip della linea battuta, lati della finestra, quote, marcatura del successo |
| `solleva` | `cubic-bezier(0.22, 0.8, 0.24, 1)` | la lastra sollevata sopra la foto | "Di più" su telefono |
| `scende` | `cubic-bezier(0.45, 0, 0.3, 1)` | la lastra che torna giù | "Meno", piano di Misura con tastiera |
| `sbuffo` | `cubic-bezier(0.15, 0.55, 0.3, 1)` | il granello che si alza e ricade | keyframe della polvere |

`tiro` e `aggancio` hanno pendenza nulla agli estremi: la velocità che la
cassetta ha già quando parte una corsa la aggiunge `hermiteVelocita(u)`
(h10 di Hermite), quindi un volo che ne interrompe un altro non scatta e
arriva sempre fermo. La velocità portata dentro è limitata a 12 tappe/s.

**La battuta del filo** (`alzaBattuta(u, ampiezza, alzaIniziale)`, px,
negativo = su), con i tempi della battuta piena:

| u | ms | Cosa succede |
|---|---|---|
| 0 → 0,20 | 0 → 70 | due dita alzano il filo al centro fino a −7 px (uscita rapida, frena in cima) |
| 0,20 → 0,36 | 70 → 126 | il filo lasciato cade accelerando |
| 0,36 | **126** | **impatto**: `onImpatto` → il gesso si posa, parte la polvere |
| 0,36 → 1 | 126 → 350 | due rimbalzi smorzati sopra il getto, −1,8 e −0,5 px, poi 0 esatto |

Forze (`FILO` in choreography): **piena** 7 px / 350 ms (ogni aggancio);
**corta** 3,5 px / 220 ms (tasto tenuto premuto, un passo ogni 250 ms);
**apertura** 10 px / 420 ms (la prima battuta, deve vedersi). Il
**sussulto** (2,5 px, 180 ms, nessun impatto) è per "Manda le misure" con le
misure mancanti.

## 3. Molle (`molla.ts`)

| Molla | Hz | ζ | Uso |
|---|---|---|---|
| `tensione` | 9 | 0,8 | il filo si tende quando si afferra la cassetta (1,4% di sovraelongazione, 170 ms) |
| `cade` | 2,4 | 1 | il filo molle che pende (Misura in errore, invio fallito): pesante, nessun rimbalzo, ~850 ms |
| `presa` | 7 | 1 | riservata: cassetta che torna sotto il dito (oggi la ripresa dopo la sosta è 1:1 oltre la soglia) |

`passoMolla(m, dt, rigidezza, smorzamento)` usa massa unitaria
(rigidezza = ω², smorzamento = 2ζω), come da firma del contratto; per pensare
in Hz c'è `parametriMolla()`, e `passoMollaCon(m, dt, MOLLE.x)`.

---

## 4. La cassetta (`cassetta.ts`)

Scrive solo `runtime.cassetta` (`pos`, `target`, `vel`, `stato`,
`ultimoMovimento`). La comanda `useCassetta.ts` (section-builder-linea); le
firme sono quelle di tech-architect §7.2, più due aggiunte compatibili:
`trascina(pos, now?)` (il `now` dell'evento, se c'è) e la proprietà `tappa`
(ultima tacca ferma).

| Stato | Entra quando | Esce quando |
|---|---|---|
| `fermo` | fine di ogni corsa | `trascina`, `vaA`, `passo` |
| `trascina` | `trascina(pos)`: `pos` = dito, 1:1, nessun ritardo; ferma subito un volo in corso (afferrare in volo, richiesta dell'interaction-designer) | dito fermo 500 ms (sposta < 0,02 tappe) → `aggancio`; `rilascia` |
| `aggancio` | rilascio o sosta: corsa `aggancio` di 160 + 240 ms × distanza (max 360) verso la tacca vicina, con la velocità del dito dentro | arriva → `onAggancio(t)` |
| `sosta` | aggancio finito col dito ancora giù | il dito si allontana di ≥ 0,06 tappe dalla tacca (tremolio ignorato) → `trascina`; `rilascia` → `fermo` **senza seconda battuta** |
| `volo` | `vaA(t)` / `passo(d)`: corsa `tiro` di 500 ms per una tappa, `500 × (1 + 0,25 log₂ d)` per salti lunghi, max 800 ms | arriva → `onAggancio(t)` |

- **Rilascio**: sotto 2,5 tappe/s va alla tacca più vicina; sopra, proietta
  la velocità per 120 ms e va al massimo **una tacca oltre** nel verso del
  lancio. Nessuna inerzia lunga. Il segno della velocità è quello del tempo
  (per il nastro su telefono lo inverte chi chiama: interaction-designer
  §7.2).
- **`passo(delta)`** parte dalla meta del volo in corso, non da `pos`: tre
  frecce di fila vanno avanti di tre. Al bordo non succede niente (né volo
  né battuta).
- **`vaA(t, { subito: true })`** e **reduced motion**: salto secco e
  `onAggancio(t)` subito. Con `subito` (URL, `?mese=`, popstate, annulla del
  puntatore) chi riceve l'aggancio **non** fa battere il filo (§6.1).
- **Scostamento dal CD**: l'aggancio al rilascio dura 160-360 ms, non 500
  (ux-architect 5.3.2): la distanza è al massimo mezza tappa, e 500 ms per 40
  px sembrano una cassetta che non risponde. Il volo da tacca a tacca resta
  500 ms come chiesto.

---

## 5. Coreografia schermata per schermata

Tempi in ms dall'evento. "Ticker" = fase `update` del ticker unico.

### 5.1 S0 · Apertura (mese zero)

| t | Cosa | Chi |
|---|---|---|
| 0 | prima pittura completa, nessuna transizione (`data-pronto="0"`); cassetta su PRIMA, filo teso tra gancio e PRIMA, **non battuto** | scaffold, linea |
| mount | `data-pronto="1"`; se la scheda è nascosta il conto parte quando torna visibile | scaffold |
| 600 | `filo.batti('apertura')`: il filo si alza di 10 px | linea (`ATTESA_APERTURA`) |
| 600 + 151 | impatto: compare il tratto d'apertura (gancio → PRIMA) con `posa` 160 ms, polvere (seme 0) | linea |
| 600 + 420 | filo fermo. `segnaApertura()` | linea |

- La cassetta **non si muove**, lo slider resta 0, il titolo resta, nessun
  annuncio. Il gesto insegnato è la battuta; l'istruzione "Tira il filo"
  insegna il tiro.
- **Geometria**: perché il tratto gancio → PRIMA esista, il gancio sta
  `APERTURA.gancioAnticipo` = 0,6 tappe prima della tacca 0 e si disegna a
  `xDaPos(-0.6, g)` (la formula di `core/tempo.ts` è lineare, accetta pos
  negativi; `pos` resta in 0..15). Il filo va sempre da `xDaPos(-0.6)` alla
  cassetta. Il tratto [−0,6, 0] resta battuto per sempre dopo l'apertura (e
  da subito con reduced motion, con `?mese=` o se l'apertura è già fatta).
- L'istruzione sparisce al primo spostamento: opacità in 250 ms
  (`.btf-linea__istruzione[data-vista="1"]`).

### 5.2 S1 · La cronaca, un cambio di mese trascinando

| t | Cosa |
|---|---|
| presa | `filo.tendi()` (molla `tensione`), `store.impostaTrascina(true)`; la maniglia si alza (interaction.css) |
| ogni frame | `cassetta.trascina()` → `--btf-cassetta-x` (o `--btf-nastro-x`) se cambia di ≥ 0,1 px; `d` del filo |
| metà mese + 0,06 | `tappaConIsteresi()` cambia; se `attesaCambioTappa(now, runtime.ultimoCambioTappa) === 0` → `store.mostraTappa(t)`, altrimenti si rimanda (tenendo solo l'ultima) |
| `mostraTappa` | foto: dissolvenza incrociata 450 ms (la nuova sopra, la vecchia opaca sotto); scheda: l'uscente sfuma in 250 ms, l'entrante dopo 100 ms in 250 ms |
| rilascio (o 500 ms fermo) | corsa `aggancio` 160-360 ms |
| aggancio | `onAggancio(t)`: `filo.batti('piena')`, `store.fermaTappa(t)` (ARIA, `?mese=`, massimo); se `t ≠ tappa` mostrata, `mostraTappa(t)` appena `attesaCambioTappa` torna 0 |
| aggancio + 126 | impatto: `--btf-battuto` scritto **una volta**, il clip si apre con `posa` 160 ms; `--btf-massimo` se cresce; polvere (seme = contatore delle battute), 800 ms |
| aggancio + 350 | filo fermo; ticker fermo se nient'altro si muove |
| aggancio + 500 | annuncio `aria-live` (se il cambio non viene dallo slider a fuoco) |

Tornando indietro il gesso nuovo si accorcia (stesso clip, stessa curva) e il
vecchio resta al 55% fino a `massimo`. Nei mesi con fermo il buco è già nella
geometria: il gesso non si "anima" nel buco.

**Tacca, tasto, rotella, swipe, "mese prima/dopo"**: `vaA` / `passo` → volo
`tiro` 500 ms, cambio di tappa a metà del volo (stesso limite di 500 ms),
all'arrivo battuta piena. **Tasto tenuto premuto** (un passo ogni 250 ms,
`creaRipetizione` di interaction): battuta **corta**, perché quattro battute
piene al secondo sarebbero un tremolio; lo decide chi chiama
(`onAggancio` sa se l'origine è la ripetizione da `ultimaOrigine()` o da un
proprio flag).

**Mese senza foto** (piano B): `data-foto="no"` sulla radice, la lastra
sull'area della foto con la stessa dissolvenza di 450 ms (`.btf-foto__vuoto`).

### 5.3 S2 · Le chiavi

Nessun movimento nuovo: l'arrivo a 15 è un aggancio come gli altri, e la
battuta, da gancio a CHIAVI, è l'unica volta in cui si vede il filo battere
tutta la linea con i suoi tre buchi. Polvere distribuita sul tratto nuovo.

### 5.4 S3 · Misura e manda (stati di ux-architect 5.5.6)

Il piano usa un **Filo per lato** (o uno solo per il filo teso dell'esempio)
creato con `creaFilo({ alza: 0, vel: 0, battendo: false }, ridotto)` e un
`creaBattute(ridotto)` per il gesso; i lati si disegnano con
`pathFiloTra(x0, y0, x1, y1, alza)` (unità del `viewBox`, cm) e il gesso con
`trattoDalCentro(battute.progresso(lato), lunghezza)` → `stroke-dasharray`,
`stroke-dashoffset` (si apre dal centro: il filo colpisce prima dove è stato
lasciato). Durante la battuta di un lato, il filo di quel lato si alza di
`battute.alzata(lato) × FINESTRA.ampiezzaAlzata` verso l'esterno.

| Stato | Movimento |
|---|---|
| P0 vuoto | nessuno: rettangolo tratteggiato fermo |
| P1 parziale | `filo.tendi()` sul lato scritto (dal molle o dal tratteggio, molla `tensione`) |
| P1d digitazione | il disegno si aggiorna solo dopo 400 ms di quiete su un valore valido (`FINESTRA.quieteDigitazione`) |
| P2 misure valide | `battute.avvia(LATI)`: sopra, destra, sotto, sinistra, 120 ms tra uno e l'altro, 240 ms a lato, 600 ms in tutto; le quote compaiono con il gesso del loro lato (`.btf-misura__quota[data-mostra]`, `posa`) |
| P2c correzione | il vecchio rettangolo resta al 55% (`.btf-misura__lato--vecchio`), `battute.avvia(['destra'])` sul solo lato cambiato (se cambia la larghezza: sopra e sotto, 120 ms tra i due) |
| P2t cambio tipo | se cambia il davanzale il rettangolo nuovo si batte intero (quattro lati), il vecchio resta chiaro |
| E1-E6 errore | `filo.molle(pendenzaMolle(lunghezzaLato))` sul lato sbagliato: la curva cade (molla `cade`) e resta ferma. Nessun cambio di colore |
| I0 invio incompleto | `filo.sussulta()` sul filo tratteggiato (nessun segno); niente con reduced motion |
| I1 invio in corso | `battute.perimetro(900)`: un lato dopo l'altro senza pause, sopra il segno già battuto |
| OK successo | il disegno resta; data e frase marcate a spruzzo: compaiono in 250 ms (`.btf-misura__marcatura[data-mostra]`, `posa`). **Nessuna animazione di spruzzo** (trend-researcher 5.4) |
| F1 invio fallito | `molle()` su tutti e quattro i lati |
| tastiera aperta | piano ridotto: il cambio d'altezza è di layout (una volta), il contenuto scala con `transform` in 200 ms (`.btf-misura__piano`) |

### 5.5 S4 · Il cartello e S5 · Tutti i mesi

Nessun movimento interno. La schermata si apre e si chiude con una
dissolvenza di 250 ms (`.btf-schermata[data-aperta]`), poi `visibility:
hidden`. Niente cartello che "si appende" oscillando: le fascette tengono.

### 5.6 Fascia, menu, "Di più", tacca TU

- **Menu del telefono**: dissolvenza 200 ms (`.btf-menu[data-aperto]`),
  nessuna tendina.
- **"Di più"**: la lastra sale con `translate` di `--btf-lastra-salita` (px,
  fissato da chi possiede la geometria della lastra: lascia 20svh di foto),
  320 ms `solleva`; "Meno" 260 ms `scende`. Solo transform.
- **Tacca TU** (dopo un invio riuscito): al primo ritorno in cronaca, 400 ms
  dopo (`TEMPI.tuAttesa`), la finestra in piccolo si batte con
  `battute.avvia(LATI, 80, 160)`. Una volta sola; con reduced motion è già lì.

---

## 6. Come si collega (per section-builder-linea, -foto, -misura)

### 6.1 `useCassetta.ts` (sketch, da adattare ai nomi dello scaffold)

```ts
const ridotto = () => store.get().reducedMotion;
let battute = 0;
const filo = creaFilo(runtime.filo, ridotto, {
  onImpatto: () => { scriviGesso(); polvere.riparti(granelliPolvere(++battute)); },
});
let subito = false;
const cassetta = creaCassetta({
  stato: runtime.cassetta, min: 0, max: 15, sosta: SOSTA, durataVolo: VOLO, ridotto,
  onAggancio: (t) => {
    if (subito) { subito = false; scriviGessoSenzaTransizione(); }
    else filo.batti(ripetizioneTasto ? 'corta' : 'piena');
    store.fermaTappa(t);
    vuoleTappa = t;                       // il cambio di foto rispetta comunque i 500 ms
  },
});
ticker.add((dt, now) => {
  const a = cassetta.tick(dt, now);
  const b = filo.tick(dt);
  const desiderata = vuoleTappa ?? tappaConIsteresi(runtime.cassetta.pos, store.get().tappa);
  if (desiderata !== store.get().tappa && attesaCambioTappa(now, runtime.ultimoCambioTappa) === 0) {
    store.mostraTappa(desiderata as Tappa);   // aggiorna runtime.ultimoCambioTappa
    vuoleTappa = null;
  }
  return a || b || desiderata !== store.get().tappa;   // resta sveglio finché il cambio rimandato non è fatto
}, 'update');
// presa: filo.tendi(); URL/popstate: subito = true; cassetta.vaA(t, { subito: true })
```

Regole: `mostraTappa` mai più di una volta ogni 500 ms, né durante il
trascinamento né tra un cambio e l'aggancio; una sola tappa in attesa (mai
una coda). `fermaTappa` non cambia la foto da sé (vedi Richieste allo
scaffold).

### 6.2 Foto

Due livelli `.btf-foto__livello`: quello che entra ha `data-visibile="1"` e
sta **sopra** (z-index), quello che esce ha `data-visibile="1"
data-sotto="1"` (resta opaco, senza transizione) finché la dissolvenza non è
finita (`DISSOLVENZA_FOTO`, 150 ms ridotta), poi `data-visibile="0"`. Mai
tutti e due trasparenti nello stesso istante. Se arriva un'altra tappa durante
la dissolvenza si salta alla più recente alla fine di quella in corso.

---

## 7. Contratto delle classi usate da `motion.css`

`motion.css` è importato dopo `lastra.css` e prima di `interaction.css`
(tech-architect §5). Si appoggia a questi nomi: chi possiede l'elemento li
mette, `motion.css` non ne cambia layout né colore.

| Selettore | Proprietario | Effetto |
|---|---|---|
| `.btf-root[data-pronto="0"] *` | scaffold | nessuna transizione né animazione prima del mount |
| `.btf-tappa[data-stato="attiva|entra|esce|spenta"]` | scaffold (`Tappa.tsx`) | opacità e `visibility` del cambio di scheda; `fineCambioTappa(ridotto)` dice quando passare da entra/esce ad attiva/spenta |
| `.btf-foto__livello[data-visibile][data-sotto]`, `.btf-foto__vuoto` + `.btf-root[data-foto="no"]` | foto | dissolvenza incrociata, piano B |
| `.btf-linea__gesso--nuovo` / `--vecchio` (+ `[data-posa="1"]` mentre si posa) | linea | `clip-path` da `--btf-battuto` / `--btf-massimo` con `posa` 160 ms; il vecchio al 55% |
| `.btf-linea__cassetta`, `.btf-linea__nastro` | linea | `translate` da `--btf-cassetta-x` / `--btf-nastro-x` (nessuna transizione: li muove il ticker) |
| `.btf-linea__istruzione[data-vista="1"]` | linea | sparisce in 250 ms |
| `.btf-linea__riga[data-mostra="1"]` | linea | riga del fermo / nome del mese, 250 ms |
| `.btf-polvere` › `.btf-polvere__granello` (stile da `stileGranello()`) | linea (`Polvere.tsx`) | keyframe `btf-polvere`, 800 ms; il contenitore è `position: relative`, largo quanto il tratto nuovo, alto 0 sulla linea |
| `.btf-misura__lato--vecchio`, `.btf-misura__quota[data-mostra]`, `.btf-misura__marcatura[data-mostra]`, `.btf-misura__piano` | misura | segno vecchio, quote, marcatura, piano con tastiera |
| `.btf-lastra[data-espansa="1"]` + `--btf-lastra-salita` | scheda (attributo), scaffold (`.btf-lastra` e la distanza) | "Di più" |
| `.btf-menu[data-aperto="1"]` | fascia | dissolvenza 200 ms + `visibility` |
| `.btf-schermata[data-aperta="1"]` | scaffold (`Schermata.tsx`) | dissolvenza 250 ms + `visibility` |

Variabili scritte da `variabiliMotion(ridotto)` sulla radice (statiche, si
ricalcolano solo se cambia la preferenza): `--btf-ease-{tiro, aggancio,
velatura, posa, solleva, scende, sbuffo}`, `--btf-dur-{tappa-esce,
tappa-entra, foto, polvere, posa, menu, schermata, lastra-sale,
lastra-scende, tastiera, istruzione, marcatura, riga-fermo}`,
`--btf-ritardo-tappa-entra`, `--btf-opacita-gesso-vecchio`. Nessun hex nel
motion: la polvere usa `--btf-gesso` dei token.

---

## 8. Reduced motion

| Cosa | Pieno | Ridotto |
|---|---|---|
| Cassetta | volo 500 ms, aggancio 160-360 | salto secco, `onAggancio` subito |
| Filo | tensione, battuta, rimbalzi | dritto; `batti()` chiama subito `onImpatto`; molle = curva ferma subito; niente sussulto |
| Gesso | clip con `posa` 160 ms | subito |
| Polvere | 8-12 granelli, 800 ms | non renderizzata (e spenta in CSS) |
| Apertura | battuta dopo 600 ms | primo tratto già battuto |
| Foto | 450 ms | 150 ms |
| Scheda | 250 + 100 di ritardo | 150 ms, nessun ritardo |
| Finestra (Misura) | 4 battute, 600 ms | intera subito; invio solo testo |
| Menu, schermate, "Di più", tastiera, istruzione, marcatura | 200-320 ms | 0 |

Il trascinamento resta (è un controllo, non un'animazione) e la rotella
resta a scatti. La preferenza si legge da `store.reducedMotion`
(`?motion=ridotto` compreso) attraverso la funzione `ridotto()` passata ai
controller: cambia a caldo, senza ricreare niente.

## 9. Lampeggi e prestazioni

- Grandi superfici: solo la foto cambia, al massimo una volta ogni 500 ms,
  con velatura ≥ 450 ms (150 ridotta): mai più di 2 cambi al secondo.
  Schermate e menu sono cambi chiesti con un gesto, uno per volta.
- Polvere: opacità di picco 0,16-0,36, un solo picco per granello, nessun
  bagliore. Il gesso compare una volta per battuta (nessun ripasso a
  intermittenza), la battuta lunga dell'invio è unica.
- Per frame, in movimento: una variabile (`--btf-cassetta-x` o
  `--btf-nastro-x`), un attributo `d`; nessuna lettura di layout, nessun
  `setState`. Il gesso e la polvere sono una scrittura per battuta e poi
  solo compositore (`clip-path`, `transform`, `opacity`).
- A riposo il ticker è fermo: cassetta, filo e battute restituiscono
  `false` appena fermi (la cassetta resta sveglia solo con il dito giù, per
  contare la sosta).

---

## Richieste ad altri agent

- **scaffold-engineer**:
  - in `state/runtime.ts` esportare i tipi `StatoCassetta` e `StatoFilo`
    con questi nomi (li importano `cassetta.ts` e `filo.ts`); `runtime.filo`
    inizializzato a `{ alza: 0, vel: 0, battendo: false }`;
  - `core/tempo.ts`: `xDaPos` lineare anche per pos negativi (il gancio sta a
    `xDaPos(-APERTURA.gancioAnticipo)`); `motion/` importa da lì solo il tipo
    `Tappa`;
  - **§9.3 di tech-architect cambia**: l'apertura non fa `vaA(1)`; dopo
    `ATTESA_APERTURA` la linea fa `filo.batti('apertura')` con la cassetta
    ferma su 0 (§5.1 qui, ux-architect 5.1);
  - `Battifilo.tsx`: `style={variabiliMotion(reducedMotion)}` sulla radice
    e ricalcolo al cambio di preferenza; `data-pronto` da `0` a `1` dopo il
    primo frame del mount;
  - `Tappa.tsx`: `data-stato` `entra`/`esce` al cambio, poi `attiva`/`spenta`
    dopo `fineCambioTappa(ridotto)` ms. `layout.css` **non** mette opacità,
    `visibility` né transizioni su `.btf-tappa`, `.btf-schermata` (le dà
    `motion.css`); `Schermata.tsx` scrive `data-aperta="1"` quando è aperta
    (oltre a `inert` quando è chiusa);
  - `fermaTappa(t)` aggiorna `tappaFerma`, `massimo`, URL e annuncio ma
    **non** `tappa` (la foto): il cambio di foto passa solo da `mostraTappa`,
    che `useCassetta` chiama rispettando i 500 ms. Se il tuo store lo fa
    comunque, `mostraTappa` deve almeno aggiornare `runtime.ultimoCambioTappa`.
  - `.btf-lastra`: definire `--btf-lastra-salita` (px o calc) per lo stretto,
    la distanza che lascia 20svh di foto.
- **section-builder-linea**: §5.1, §5.2, §6.1. Gancio a `xDaPos(-0,6)`,
  tratto d'apertura [−0,6, 0] battuto dopo l'apertura; battuta `'corta'` per
  la ripetizione dei tasti; `--btf-battuto` e `--btf-massimo` scritti una
  volta all'**impatto** (non all'aggancio) sugli elementi foglia
  `data-btfvar`, con `data-posa="1"` per i 160 ms della posa; polvere
  rinnovata con una `key` a ogni impatto e `granelliPolvere(contatore)`,
  posata sul tratto appena battuto; niente polvere con `saveData`.
- **section-builder-foto**: §6.2 (classi, `data-sotto`, mai due livelli
  trasparenti, una dissolvenza per volta, salto alla più recente).
- **section-builder-misura**: §5.4, con `creaFilo`, `creaBattute`,
  `pathFiloTra`, `trattoDalCentro`, `pendenzaMolle`; le classi di §7.
- **section-builder-scheda**: `data-espansa="1"` su `.btf-lastra` per "Di
  più" (o chiedere allo scaffold che lo metta lui dallo stato).
- **section-builder-fascia**: `data-aperto="1"` su `.btf-menu`.
- **interaction-designer** (risposta alle sue richieste): `trascina()` ferma
  un volo in corso, sì; `rilascia(vel)` vuole tappe/s con il segno del tempo,
  sì; la forza della battuta non passa da `vaA`: la sceglie `onAggancio`
  (`'corta'` per la ripetizione dei tasti).
- **creative-director** (solo per conferma): apertura senza spostamento
  della cassetta (resta S0 con il suo titolo, nessun annuncio non chiesto);
  aggancio al rilascio 160-360 ms invece di 500; foto al massimo ogni 500 ms.
- **accessibility-auditor / performance-auditor**: §8 e §9 sono la
  checklist; contare i cambi di foto trascinando avanti e indietro di
  continuo per 3 s (attesi ≤ 6), e verificare con "Paint flashing" che il
  gesso non ridipinga la tessera durante il clip.
