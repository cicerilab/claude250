# Motion designer · Concept 20 · IMBRUNIRE

Ondata 2. Documento vincolante per chi muove qualcosa nel concept: scaffold,
section-builder (palazzo, stanza, lune, prenota, cielo, spazi, elenco) e
interaction-designer. Qui ci sono le curve, i tempi, la coreografia per
schermata, la telecamera d'entrata e d'uscita, le luci, le variabili CSS
esposte e i contratti che lo scaffold deve rispettare perché il mio codice
funzioni.

Letti: `docs/ruoli-agent.md`, `docs/processo-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `concepts/10-torchio/docs/integrazione-sito.md`, e in
questa cartella `creative-director.md` (tutto, in particolare §4, §6, §7.7,
§11, §12), `tech-architect.md` (tutto, in particolare §2.2-2.5, §5.2, §6.1-6.7),
`ux-architect.md` (tutto, in particolare §1, §2, §3, §5, §6, §7.7),
`trend-researcher.md` (P10, rischio 4.5), `brand-strategist.md`.
Skill: `design-taste-frontend` (§5, §6.A, §6.B), `full-output-enforcement`.
Il pilota `concepts/10-torchio/` solo per formato e per l'API del ticker.

File miei (tutti in `src/pages/concepts/imbrunire/motion/`):

| File | Contenuto |
|---|---|
| `easing.ts` | curve come funzioni e stringhe CSS (`CURVE`, `BEZIER_CSS`, `PUNTI_CURVA`), `cubicBezier`, utilità (`clamp`, `lerp`, `progressoTra`, `smoothstep01`, `seguiDt`) |
| `choreography.ts` | tutte le durate, ritardi, ordini e soglie: `ORDINE_ACCENSIONE`, `INTERVALLO_ACCENSIONE`, `ritardoAccensione()`, `ritardoLuce()`, `LUCE`, `CAMERA`, `PANNELLO`, `PASSAGGIO`, `PARALLASSE`, `NASTRO`, `INTERFACCIA`, `SUCCESSO`, `comportamentoScorrimento()` |
| `camera.ts` | `entra()`, `esci()`, `carrello()`, `scala()`, `annullaCamera()` (API di tech-architect §6.7) più `rilasciaCamera()` e `cameraInViaggio()` |
| `luci.ts` | `anticipaAccensione()`: accensione interrotta, le luci mancanti partono tutte insieme |
| `useParallasse.ts` | parallasse del tetto e del lato della scala, ≤ 2° |
| `variabili.ts` | `variabiliMotion(ridotto)` (stile della radice), `stileCella(slug)` (ritardi di una cella) |

`luci.ts` non è nell'elenco di tech-architect §4: è dentro `motion/` (che è
mio) e serve a una regola della ux (§3) che le transizioni CSS da sole non
possono rispettare (vedi §5.4).

**Verifiche fatte**
- `tsc` in `strict` + `noUncheckedIndexedAccess` + `noUnusedLocals/Parameters`
  e ESLint 9 (`typescript-eslint`, `react-hooks`, stesse regole del pilota) sui
  sei file, contro stub costruiti esattamente sui contratti del §8: zero
  errori, zero avvisi.
- **Telecamera provata in Chromium** con una scena di prova in HTML/CSS 3D
  (palazzo 1000 px con dieci celle-scatola, strato Dentro a tutto schermo con
  prospettiva 900 px e scatola profonda 648 px ferma a `translateZ(540px)`):
  animazioni fermate e spostate a 0, 150, 300, 450, 600, 800, 1100 ms,
  screenshot guardati. Il fondo della cella e il fondo dello strato Dentro
  restano allineati per tutto il viaggio (differenza di larghezza ≤ 0,5 px,
  centri coincidenti), la fine dell'animazione coincide con lo stato a riposo
  (nessun salto al rilascio), l'inversione a metà strada (entra, dopo 500 ms
  esci) parte dal punto esatto (spostamento del fondo tra prima e dopo: 0,1 px).
  Provati anche carrello, uscita, dissolvenze a 375 × 667: zero errori in
  console, zero animazioni rimaste dopo il rilascio.
- **Bug trovato e corretto in prova**: `will-change: opacity` su una scatola
  `preserve-3d` la appiattisce (il fondo si vedeva 2,5 volte più grande a fine
  viaggio). Su elementi `preserve-3d` la camera annuncia solo
  `translate, scale, rotate`. Vale per tutti: **mai `opacity` in
  `will-change` su un elemento `preserve-3d`**.
- `anticipaAccensione()` provata: a 1200 ms dall'inizio 3 stanze erano partite
  e 7 in attesa; dopo la chiamata 10 su 10 in dissolvenza, partite insieme.
- **Conteggio dei lampeggi** con uno script sui dati di `choreography.ts`
  (accensione + trascinamento di 3 s con aggiornamenti ogni 16 ms e limitatore
  a 500 ms + successo): intervallo minimo tra due cambi della stessa cella
  **500 ms**, massimo **2 partenze di luce al secondo** su tutta la sezione,
  dissolvenza di luce più breve **1100 ms**, carrello e scala con buio e
  rientro distanti **520 ms**.

---

## 0. Decisioni in breve

1. **Due velocità, mai armonizzate** (trend-researcher P10). L'interfaccia
   risponde in 180-420 ms; la luce e il corpo hanno i tempi di una casa:
   le lampade in 1100-1400 ms, il passo nella stanza in 1100 ms.
2. **Niente GSAP, niente lenis** (come tech-architect §2.2). Ho cercato un caso
   che non si reggesse: non c'è. La telecamera è WAAPI, le luci sono
   transizioni CSS di opacità, la parallasse è il ticker.
3. **La telecamera è una camminata, non uno zoom.** Il palazzo si ingrandisce
   verso la cella, lo strato Dentro resta agganciato al fondo della cella e
   intanto la sua scatola avanza verso chi guarda: pareti e soffitto, più
   vicini, crescono più del fondo ed escono dai bordi (§4).
4. **Proprietà individuali `translate`, `scale`, `rotate`** invece di
   `transform`: si sommano al `transform` scritto dai CSS delle sezioni senza
   sovrascriverlo. Chi costruisce può mettere un `transform` sulla scatola
   (per esempio `translateZ` di riposo) e la camera non lo tocca.
5. **Le luci sono solo opacità di veli**, in transizione CSS, con due ritardi
   costanti per cella (accensione e sfalsamento). Nessun timer, nessun
   `filter` animato.
6. **Intervallo d'accensione 500 ms, non 450** (CD §6.4). Deviazione voluta:
   `docs/ruoli-agent.md` chiede al più un cambio ogni 500 ms e la ux al più 2
   partenze al secondo; 450 ms ne dà 2,2. La sequenza dura 450 ms in più
   (5,9 s) e non blocca nulla.
7. **Reduced motion = stato finale immediato** per tutto ciò che si sposta.
   Restano solo dissolvenze di opacità, quelle che il CD chiede
   esplicitamente: entrata e uscita (250 ms), luci (250 ms, una partenza),
   seconda foto (250 ms), luna del successo (250 ms, senza salita). Carrello
   e scala con reduced motion cambiano stanza senza buio: un buio di 250 ms
   sarebbe un lampo scuro-chiaro su tutto lo schermo.

---

## 1. Principi (valgono anche per ciò che non è scritto qui)

- **Chi lo accende? Chi cammina?** Ogni movimento ha una causa del luogo: la
  lampada che si scalda, il passo sulla soglia, la testa che si volta verso la
  porta, il piede sul gradino, il portiere che gira le luci dalla scala. Se un
  movimento non ha una causa, non esiste.
- **Si muovono solo gli eventi elencati dal CD §12 e dalla ux §10**: accensione
  iniziale, luci su/giù, entrata/uscita, carrello, scala, nastro, luna del
  successo, parallasse ≤ 2°, bottone "Lune" su mobile, scorrimento della torre
  al successo. Niente fade-up, niente testi che entrano scorrendo, niente
  animazioni infinite, niente pulsazioni, niente tremolio "da candela".
- **Il contenuto non aspetta mai un'animazione.** Le celle sono cliccabili
  durante l'accensione; il pannello della stanza è nel DOM dal primo
  fotogramma (arriva visivamente a 680 ms ma il fuoco e il lettore di schermo
  lo trovano subito).
- **Solo `translate`/`scale`/`rotate`/`transform` e `opacity`.** Mai
  `top/left/width/height`, mai `filter` animato.
- **Anti-lampeggio**: ogni grande superficie cambia al massimo una volta ogni
  500 ms; al massimo 2 partenze di luce al secondo in tutta la sezione; ogni
  dissolvenza di luce ≥ 900 ms (250 ms ridotta).

---

## 2. Le curve (`easing.ts`)

Tutte le curve sono funzioni `(t) => number` in `CURVE` e stringhe in
`BEZIER_CSS` (le stesse per WAAPI e CSS). Nessun rimbalzo, nessuna molla:
un albergo da 140 € a notte non rimbalza (rischio "giocattolo", trend 4.2).

| Nome | cubic-bezier | Uso | Perché |
|---|---|---|---|
| `soglia` | `(.22, .7, .18, 1)` | entrare e uscire (1100/800 ms), passo breve sulla soglia | il passo di chi entra: parte deciso, frena lungo; è la curva fissata dal CD §6.2 |
| `accendi` | `(.5, .04, .3, 1)` | stanza che si accende, accensione iniziale, ora d'arrivo scelta | il filamento che si scalda: un attimo fermo, poi la luce sale e si posa |
| `spegni` | `(.3, .45, .2, 1)` | stanza che si spegne | cala subito, poi resta un bagliore caldo che si esaurisce |
| `carrelloVia` | `(.5, 0, .75, .35)` | la stanza vecchia che va al buio (carrello e scala) | la testa che si volta verso la porta: accelera uscendo |
| `carrello` | `(.2, .6, .2, 1)` | la stanza accanto che arriva | il passo nella stanza nuova, arriva e si ferma morbido |
| `scala` | `(.35, .3, .15, 1)` | la stanza del piano sopra o sotto che arriva | il piede sull'ultimo gradino: sale e si assesta, più pesante del carrello |
| `foglio` | `(.32, .72, 0, 1)` | fogli dal basso (nastro e stanza su mobile) | segue il pollice e si ferma senza rimbalzo |
| `interfaccia` | `(.2, .7, .3, 1)` | bottoni, fuoco, pannello della stanza | risposta rapida |
| `lineare` | `linear` | dissolvenze incrociate (ridotte, seconda foto, lune) | |

Valori di controllo: `soglia` a 0,25 → 0,63; a 0,5 → 0,89 (a metà tempo la
camera ha fatto l'89% del percorso: il resto è frenata). `accendi` a 0,2 →
0,10; a 0,5 → 0,62. `spegni` a 0,2 → 0,37; a 0,5 → 0,79.

---

## 3. Coreografia per schermata

Tempi in `choreography.ts`. Colonna "ridotto" = `prefers-reduced-motion`.

### 3.1 Il palazzo `#/` all'apertura

| Evento | Cosa succede | Tempi | Ridotto |
|---|---|---|---|
| Prima pittura | palazzo visibile e spento (foto scurite), cielo fermo, luna di stasera in struttura | 0 | palazzo già acceso |
| Fasi del nastro e luna di stasera | entrano in dissolvenza quando il calcolo è pronto | 300 ms, `lineare` | immediato |
| Accensione | una stanza ogni 500 ms: androne, Il Camino, La Loggia, La Corte, Il Noce, Sul Noncello, La Soffitta, Il Campanile, la colazione, **il portico** (il lampione, ultimo: la strada si accende a sera fatta). Ognuna 1400 ms, `accendi` | parte dopo i font o 600 ms; totale 5900 ms | nessuna sequenza |
| Interazione durante l'accensione | le stanze ancora spente partono **tutte insieme** in una sola dissolvenza (`anticipaAccensione()`) | 1400 ms | |
| Seconda visita nella sessione | luci già accese | 0 | |

### 3.2 Il palazzo al passaggio

| Evento | Cosa succede | Tempi | Ridotto |
|---|---|---|---|
| Puntatore o fuoco su una cella | velatura di luce +8% e "da … a notte" sotto il nome (interaction-designer) | entra 400 ms, esce 600 ms | immediato |
| Puntatore che si muove | tetto e lato della scala ruotano in `rotateY`, tetto ≤ 2°, scala ≤ 1,2° in verso opposto (volume leggero) | inseguimento esponenziale (6% a frame, 60 Hz), si ferma sotto 0,004° | spento |
| Camera che parte | il tetto torna diritto scivolando | stesso inseguimento | |

L'uscita del calore è più lenta dell'entrata (600 contro 400 ms) perché
passando veloce sopra una fila di celle una cella non faccia due cambi in
meno di 500 ms.

### 3.3 Le lune (`#/lune`) e le luci per le notti

| Evento | Cosa succede | Tempi | Ridotto |
|---|---|---|---|
| Selezione (trascinamento, tocco + tocco, tasti, campi data) | la riga di stato cambia subito; le luci del palazzo cambiano al più ogni 500 ms (limitatore dello store, §8.4) | | |
| Stanza che si spegne | velo notte sale, velo di luce scende | 1200 ms, `spegni`, ritardo di cella 0-480 ms | 250 ms, una partenza, nessun ritardo |
| Stanza che si riaccende | inverso | 1100 ms, `accendi`, stesso ritardo | 250 ms |
| Scorrimento del nastro al bordo | velocità quadratica fino a 900 px/s nella fascia di 56 px (interaction) | ticker | stesso, senza inerzia |
| Inerzia del nastro | `v *= exp(-4,2 · dt)`, si ferma sotto 14 px/s | ticker | nessuna |
| Frecce ‹ › (mese) | scorrimento nativo `smooth` | circa 420 ms | `auto` |
| Foglio del nastro su mobile | sale dal basso | 420 ms, `foglio` | immediato |
| Bottone "Lune" in basso a destra (mobile) | entra con `translate` dal bordo | 240 ms, `interfaccia` | immediato |

**Il ritardo di cella** (`ritardoLuce`) è fisso: 120 ms per colonna contata
dalla scala verso sinistra più 60 ms per piano contato dall'alto. Le luci
cambiano come se il portiere camminasse dalla scala lungo i corridoi,
dall'alto al basso: La Soffitta 0, Il Campanile 120, Il Noce 240, Sul
Noncello 60, La Loggia 180, Il Camino 300, La Corte 120, la colazione 240,
l'androne 360, il portico 480. Fisso per cella = due partenze della stessa
cella distano esattamente quanto le pubblicazioni dello store (≥ 500 ms).

### 3.4 Entrare in una stanza e uscire (firma)

| Evento | Cosa succede | Tempi | Ridotto |
|---|---|---|---|
| Entrare da una cella | camminata (§4): palazzo che si ingrandisce, strato Dentro agganciato che compare tra il 16% e il 50% del percorso, scatola che avanza | 1100 ms, `soglia` | dissolvenza incrociata 250 ms, nessun movimento |
| Pannello della stanza (desktop) | arriva da 24 px a destra con l'opacità, mentre il passo frena | ritardo 680 ms, 420 ms, `interfaccia` | con la dissolvenza |
| Pannello della stanza (torre) | il foglio sale dal basso (`translate: 0 100%` → `0 0`), senza opacità | stessi tempi | con la dissolvenza |
| Entrare dall'elenco o da un indirizzo aperto | la stanza è già inquadrata: dissolvenza, più un passo breve sulla soglia (la scatola avanza del 12% della camminata) | 250 ms + passo 700 ms `soglia` | 250 ms, nessun passo |
| Uscire (Torna al palazzo, Esc, indietro, swipe giù) | il pannello se ne va per primo; poi il percorso inverso, stessa curva: frena sul palazzo | pannello 180 ms; camera 800 ms, `soglia` | 250 ms |
| Tornare indietro a metà strada | il viaggio nuovo parte dal punto esatto in cui si era; durata proporzionale al tratto (min 280 ms) | | |
| Seconda foto ("guarda la finestra") | dissolvenza incrociata della parete | 600 ms, `lineare` | 250 ms |
| Foto che arriva dopo l'intonaco (S5) | dissolvenza | 300 ms | immediato |

### 3.5 Stanza accanto (carrello) e scala

| Evento | Cosa succede | Tempi | Ridotto |
|---|---|---|---|
| Porta laterale "stanza accanto" | la stanza vecchia scivola del 22% della larghezza dalla parte opposta, lo sguardo si volta di 3° verso la porta, l'elemento prospettiva va al buio (notte profonda dello strato); la stanza cambia al buio; la nuova arriva dall'altra parte | buio 480 ms `carrelloVia`; rientro 700 ms `carrello`, parte ≥ 520 ms dopo l'inizio | cambio immediato |
| Scala "piano di sopra/sotto" | come il carrello ma in verticale: 20% dell'altezza e 3° in `rotateX` (lo sguardo sale con i gradini) | buio 480 ms; rientro 700 ms `scala` | cambio immediato |
| Pannello | si svuota (180 ms) e si riempie (240 ms, dopo 200 ms dal rientro) | | con il cambio |

Il buio e il rientro distano almeno 520 ms: la parete di fondo cambia
luminosità al massimo una volta ogni 500 ms.

### 3.6 Prenotazione e successo

| Evento | Cosa succede | Tempi | Ridotto |
|---|---|---|---|
| "Quanti siete", campi, errori | nessun movimento; colore e bordo in 180 ms | 180 ms | immediato |
| Ora d'arrivo scelta | la finestra si accende (velo di luce in opacità), le altre si spengono | 400 ms, `accendi` | immediato |
| Invio in corso | il bottone resta premuto; nessuno spinner, nessuna animazione | | |
| Successo, 1 | si esce dalla stanza (3.4) | 800 ms | 250 ms |
| Successo, 2 | a fine uscita si spengono tutte le altre luci (1200 ms, ritardo di cella) | +0 ms | 250 ms |
| Successo, 3 | la luna di stasera lascia il posto a quella della prima notte: dissolvenza incrociata e la nuova sale di 18 px | +520 ms, 1200 ms | 250 ms, senza salita |
| Successo, 4 | la frase compare (solo opacità, al suo posto) e prende il fuoco subito | +1040 ms, 300 ms | immediata |
| Successo su mobile | la torre scorre alla tua stanza | `scrollIntoView` `smooth` | `auto` |
| "Torna al palazzo" | le luci si riaccendono (una partenza, ritardo di cella) | 1100 ms | 250 ms |

Tre eventi distinti del successo sono distanti ≥ 500 ms l'uno dall'altro.

### 3.7 Elenco, spazi comuni, testata

- **Elenco** (`#/elenco`): il pannello notte compare in 180 ms di opacità
  sopra il palazzo; nessuno spostamento. Il palazzo dietro non si muove.
- **Spazi comuni** (androne, colazione, portico): stessa camera delle camere.
- **Testata e nastro durante la camera**: non sono nel contenitore che la
  camera trasforma. Il nastro nel cielo si nasconde in opacità in 180 ms
  quando `data-imb-camera` diventa `entra` e ricompare con `ferma` (CSS del
  builder lune con `--imb-dur-rapida`). Il cielo **resta fermo** mentre il
  palazzo si ingrandisce: il cielo è infinitamente lontano, chi cammina verso
  una casa non vede ingrandirsi la luna. È questo che rende credibile il passo.

---

## 4. La telecamera (`camera.ts`)

### 4.1 Geometria

Si misura tutto una volta, a riposo, all'inizio del viaggio:
- `F`: rettangolo del fondo della cella nel palazzo; `Fd`: rettangolo del
  fondo dello strato Dentro a riposo;
- `sE = max(Fd.w / F.w, Fd.h / F.h)`: la scala finale del palazzo, quella per
  cui il fondo della cella copre il fondo Dentro;
- il palazzo si ingrandisce attorno a un **punto fisso** `X` scelto in modo
  che il centro del fondo della cella arrivi sul centro del fondo Dentro;
  la scala è interpolata in logaritmo (`s = sE^p`): velocità percepita
  costante, come un passo, non uno zoom che accelera;
- la scatola Dentro parte arretrata di `dz = 0,55 × prospettiva` e arriva a
  riposo; la grandezza del suo fondo a `z` arretrato si **misura davvero**
  (animazione in pausa sul primo fotogramma), quindi la camera non deve
  conoscere profondità e prospettiva scelte dall'art-director;
- lo strato Dentro è scalato e spostato in modo che il suo fondo coincida con
  il fondo della cella del palazzo in ogni istante (`k = (s / sE) / f`).

Tre animazioni WAAPI (palazzo, strato, scatola) con la stessa durata, la stessa
curva `soglia` e **32 fotogrammi chiave campionati** dalla stessa funzione:
restano agganciate (differenza misurata ≤ 0,5 px). Il pannello ha la sua
animazione breve.

Se il viaggio non ha senso (cella fuori dalla finestra, fondo non misurabile,
ingrandimento < 1,05, strato non registrato) si entra in dissolvenza.

### 4.2 Contratto con il DOM (per section-builder-palazzo e -stanza)

1. **Palazzo** (`scena.registraPalazzo(el)`): il contenitore di tetto, piani e
   scala. **Senza `transform` nei CSS** (la camera usa `translate` e `scale`
   individuali con la sua `transform-origin`, che legge). Il cielo e la luna
   non ci stanno dentro. Durante `dentro` può avere `visibility: hidden`,
   **mai** `display: none` (serve misurare le celle all'uscita).
2. **Cella** (`scena.registraCella`): `fondo` è la faccia di fondo (quella con
   la foto), figlia della scatola.
3. **Strato Dentro** (`scena.registraDentro`): struttura
   `strato (fixed, inset 0, overflow hidden, fondo --imb-notte-profonda opaco)
   > elemento prospettiva (perspective, inset 0) > scatola (preserve-3d) > facce`.
   Lo strato **senza `transform` nei CSS**; la scatola può avere un `transform`
   di riposo (es. `translateZ(...)`): la camera usa `translate` e lo somma.
   Lo strato è **visibile nei CSS sia in `entra` sia in `dentro`** (ed `esce`),
   nascosto solo in `ferma`.
4. **Pannello**: fratello dello strato, **non dentro** (non vive in un livello
   scalato, tech-architect §2.5). La camera anima `opacity` e `translate` del
   pannello; se `useFoglio` sposta il foglio su mobile, deve usare `transform`
   (non `translate`): le due proprietà si sommano senza litigare.
5. **Niente `opacity`, `filter`, `will-change: opacity` sulla scatola.** La
   camera mette e toglie `will-change` da sola.

### 4.3 Sequenza per `sections/Stanza/useCamera.ts`

```ts
// palazzo → stanza
impostaCamera('entra', slug);                       // commit: strato visibile
useLayoutEffect(() => { void entra(slug, { ridotto, layout, origine }).then((e) => {
  if (e.completata) { impostaCamera('dentro', slug); /* fuoco sul titolo */ }
}); }, [/* fase 'entra' appena scritta */]);

// stanza → palazzo (o lune, elenco)
impostaCamera('esce', slug);                        // commit: palazzo visibile
useLayoutEffect(() => { void esci(slug, { ridotto, layout, origine }).then((e) => {
  if (e.completata) impostaCamera('ferma', null);
}); });
useLayoutEffect(() => { if (fase === 'ferma') rilasciaCamera(); }, [fase]); // dopo il commit

// stanza → stanza accanto / altro piano
void carrello(da, a, { ridotto, layout, alBuio: () => impostaCamera('dentro', a) });
void scala(da, a, { ridotto, layout, alBuio: () => impostaCamera('dentro', a) });
```

- `origine: 'dissolvenza'` quando si entra dall'elenco o da un indirizzo
  aperto direttamente, e quando si esce verso l'elenco.
- Una chiamata nuova annulla quella in corso (la vecchia promessa si risolve
  con `completata: false`) e riparte dal punto in cui si era: il tasto
  indietro durante l'entrata esce dal punto raggiunto.
- `esci` nella torre porta la cella d'arrivo al centro (`scrollIntoView`
  istantaneo) se è fuori schermo, prima di misurare.
- `annullaCamera()` allo smontaggio di `Imbrunire.tsx` e quando la vista salta
  senza camera.
- Durante `entra` e `esce` le celle del palazzo non ricevono clic (`inert` o
  `pointer-events: none` sul palazzo, già previsto da tech-architect §6.4).

---

## 5. Luci e variabili CSS

### 5.1 `variabiliMotion(ridotto)` sulla radice

| Variabile | Pieno | Ridotto |
|---|---|---|
| `--imb-luce-accensione-durata` | 1400ms | 250ms |
| `--imb-luce-accendi-durata` / `--imb-luce-spegni-durata` | 1100ms / 1200ms | 250ms |
| `--imb-luce-accendi-curva` / `--imb-luce-spegni-curva` | `accendi` / `spegni` | linear |
| `--imb-luce-calore-entra` / `--imb-luce-calore-esce` | 400ms / 600ms | 0ms |
| `--imb-luce-sfalsa` | 1 | 0 |
| `--imb-camera-dissolvenza` | 250ms | 250ms |
| `--imb-foto-seconda-durata` | 600ms | 250ms |
| `--imb-foto-caricata-durata` | 300ms | 0ms |
| `--imb-dur-rapida` / `--imb-curva-rapida` | 180ms / `interfaccia` | 0ms |
| `--imb-dur-foglio` / `--imb-curva-foglio` | 420ms / `foglio` | 0ms |
| `--imb-dur-bottone-lune` | 240ms | 0ms |
| `--imb-dur-ora-arrivo` / `--imb-curva-ora-arrivo` | 400ms / `accendi` | 0ms |
| `--imb-dur-fasi-luna` | 300ms | 0ms |
| `--imb-luna-successo-durata` / `-salita` / `-ritardo` | 1200ms / 18px / 520ms | 250ms / 0px / 0ms |
| `--imb-frase-successo-durata` / `-ritardo` | 300ms / 1040ms | 0ms / 0ms |

### 5.2 `stileCella(slug)` su ogni cella (in render, costante)

`--imb-accensione-ritardo` (0-4500 ms) e `--imb-luce-ritardo` (0-480 ms).

### 5.3 CSS delle luci per il builder del palazzo (tecnica vincolante, colori dell'art-director)

```css
/* veli figli della faccia di fondo (mai sulla scatola preserve-3d) */
.imb-root .imb-scatola__velo-notte,
.imb-root .imb-scatola__velo-luce,
.imb-root .imb-scatola__alone {
  transition-property: opacity;
  transition-duration: var(--imb-luce-spegni-durata);
  transition-timing-function: var(--imb-luce-spegni-curva);
  transition-delay: calc(var(--imb-luce-ritardo) * var(--imb-luce-sfalsa));
}
.imb-root .imb-palazzo__cella[data-imb-luce='accesa'] .imb-scatola__velo-luce,
.imb-root .imb-palazzo__cella[data-imb-luce='accesa'] .imb-scatola__alone,
.imb-root .imb-palazzo__cella[data-imb-luce='spenta'] .imb-scatola__velo-notte {
  transition-duration: var(--imb-luce-accendi-durata);
  transition-timing-function: var(--imb-luce-accendi-curva);
}
/* accensione iniziale: durata e ritardo propri */
.imb-root[data-imb-accensione='in-corso'] .imb-scatola__velo-notte,
.imb-root[data-imb-accensione='in-corso'] .imb-scatola__velo-luce,
.imb-root[data-imb-accensione='in-corso'] .imb-scatola__alone {
  transition-duration: var(--imb-luce-accensione-durata);
  transition-timing-function: var(--imb-luce-accendi-curva);
  transition-delay: calc(var(--imb-accensione-ritardo) * var(--imb-luce-sfalsa));
}
```

Le opacità (quanto è scuro il velo notte, quanto è caldo il velo di luce) le
decide l'art-director. Nota: la regola "accesa" prende le curve e le durate
dell'accensione per i veli che salgono verso la luce; chi scende usa quelle
dello spegnimento. Se l'art-director preferisce una sola durata per coppia di
veli, si tiene quella della direzione del cambio (accendi o spegni) su
entrambi.

### 5.4 Accensione interrotta (`luci.ts`)

Una transizione CSS già creata tiene il suo ritardo anche se il CSS cambia.
`anticipaAccensione()` legge le transizioni di opacità ancora nel ritardo
(`palazzo.getAnimations({ subtree: true })`) e le fa partire adesso, tutte
nello stesso istante (`currentTime = delay`): un solo cambio per l'intera
sezione. Chi la chiama: lo store, alla prima azione dell'utente che cambia
luci o vista durante `accensione: 'in-corso'` (selezione di notti, entrata in
una stanza), poi `impostaAccensione('fatta')`.

---

## 6. Parallasse (`useParallasse.ts`)

```ts
useParallasse(refTetto);                              // tetto, fino a 2°
useParallasse(refLatoScala, { gradiMax: 1.2, verso: -1 }); // lato della scala, in verso opposto
```

- L'elemento deve avere `data-imb-var`. Scrive solo `--imb-parallasse`
  (`"1.234deg"`), nella fase `write` del ticker, solo quando cambia.
- Attiva solo con layout `sezione`, senza reduced motion, con
  `(hover: hover) and (pointer: fine)`, e segue il puntatore solo con la
  camera `ferma` (altrimenti scivola a 0°).
- CSS del builder: `transform: perspective(1400px) rotateY(var(--imb-parallasse, 0deg))`
  sull'elemento foglia, `transform-origin` al centro in basso per il tetto.

---

## 7. Anti-lampeggio: come è garantito

| Regola | Dove è garantita | Verifica |
|---|---|---|
| Stessa superficie: ≤ 1 cambio ogni 500 ms | accensione a 500 ms; limitatore dello store a 500 ms con ritardo di cella fisso; carrello/scala con rientro ≥ 520 ms dopo il buio; successo con eventi a 0/520/1040 ms; calore che esce in 600 ms | script: minimo 500 ms |
| Sezione: ≤ 2 partenze al secondo | idem | script: massimo 2 |
| Dissolvenze di luce ≥ 900 ms | `LUCE`, `DURATA_ACCENSIONE` | minimo 1100 ms |
| Nessuna animazione infinita | nessuna è definita; il ticker dorme a riposo | |
| Accensione interrotta: un solo cambio | `anticipaAccensione()` + `PAUSA_DOPO_ANTICIPO` | provato in Chromium |

---

## 8. Contratti richiesti allo scaffold

I miei file importano questi moduli con queste firme. Sono quelle di
tech-architect §6; dove lui non le fissava le fisso qui (uguali al pilota).

### 8.1 `core/ticker.ts`

```ts
export type FaseTicker = 'read' | 'update' | 'write' | 'render';
export type TickFn = (dt: number, now: number) => boolean | void; // dt in s (≤ 0,05), now in ms (base performance.now)
export interface Ticker {
  add(fn: TickFn, fase?: FaseTicker): () => void; // default 'update'; sveglia il ticker; ritorna la rimozione
  wake(): void;
  readonly running: boolean;
  attiva(): () => void;                           // pausa con la scheda nascosta
}
export const ticker: Ticker;
```

Semantica come il pilota (`concepts/10-torchio/src/pages/concepts/impronta/core/ticker.ts`,
senza lenis): una fn che ritorna `true` chiede un altro frame; aggiungere e
togliere durante un frame è sicuro (la camera si toglie da sola nella fase
`read`); un'eccezione in una fn non ferma il ciclo.

### 8.2 `core/scena.ts`

Esattamente tech-architect §6.6 (`PartiCella`, `PartiDentro` esportati come
tipi, `scena.palazzo()`, `scena.cella()`, `scena.dentro()`, i tre
`registra*`, `focaCella`).

### 8.3 `state/runtime.ts` e `state/store.ts`

- `runtime.puntatore: { x: number; y: number; attivo: boolean; tipo: 'mouse' | 'touch' | 'pen' }`
  con `x`, `y` normalizzati -1..1 sulla finestra.
- `state/store.ts` esporta i tipi `SlugCella`, `Layout` e
  `useImbrunire(sel)`; lo stato ha `layout`, `reducedMotion`, `camera.fase`.

### 8.4 Luci nello store

1. `selezioneLuci` segue `selezione` con limitatore **leading + trailing a
   `INTERVALLO_MIN_LUCE` (500 ms)** (già deciso da tech-architect §6.1).
2. Se una selezione arriva durante `accensione: 'in-corso'`: chiamare
   `anticipaAccensione()`, poi `impostaAccensione('fatta')`, e pubblicare la
   prima `selezioneLuci` non prima di `PAUSA_DOPO_ANTICIPO` (500 ms) dopo.
   Stessa cosa (senza la pausa) quando si entra in una stanza durante
   l'accensione.
3. `impostaAccensione('fatta')` a fine sequenza dopo `DURATA_ACCENSIONE_TOTALE`
   (5900 ms) dall'inizio; l'attesa iniziale è il primo tra `fontsReady()` e
   `ATTESA_MAX_ACCENSIONE` (600 ms). Per l'unico `setTimeout` ammesso dallo
   store va bene, oppure `ticker` con un confronto di tempi.

### 8.5 Radice e pagina

- `Imbrunire.tsx` applica `variabiliMotion(reducedMotion)` come `style` della
  radice.
- `html:has(.imb-root) { scrollbar-gutter: stable; }` in `base.css`: quando la
  camera mette `overflow: hidden` su `html` (torre) la barra di scorrimento
  non deve sparire e spostare le celle tra misura e animazione.

---

## Richieste ad altri agent

1. **scaffold-engineer**: §8 per intero (ticker come il pilota senza lenis,
   limitatore delle luci, `anticipaAccensione` alla prima interazione,
   `scrollbar-gutter`, `variabiliMotion` sulla radice). In
   `useCelleTastiera`/store: le celle non si attivano durante `entra`/`esce`.
2. **section-builder-palazzo**: contratto DOM §4.2 punti 1-2 e 5; CSS delle
   luci §5.3; `style={stileCella(slug)}` su ogni cella; `useParallasse` sul
   tetto e sul lato della scala con `data-imb-var`; il cielo fuori dal
   contenitore registrato con `registraPalazzo`.
3. **section-builder-stanza**: contratto §4.2 punti 3-5 e sequenza §4.3 in
   `useCamera.ts`; lo strato mostra la stanza di `camera.slug` (non di
   `vista`), così il carrello cambia stanza solo al buio (`alBuio`).
4. **section-builder-lune**: nastro nascosto in opacità (`--imb-dur-rapida`)
   con `data-imb-camera` diverso da `ferma`; fasi in dissolvenza con
   `--imb-dur-fasi-luna`; scorrimento delle frecce con
   `comportamentoScorrimento(ridotto)`.
5. **section-builder-cielo / prenota**: luna del successo con
   `--imb-luna-successo-*` (dissolvenza incrociata di due `<Luna/>`, la nuova
   con `translate` da `0 var(--imb-luna-successo-salita)` a `0 0`); frase con
   `--imb-frase-successo-*` solo in opacità; spegnimento delle altre luci a
   fine uscita (lo fa già il selettore con `conferma`).
6. **interaction-designer**: dopo aver scritto `runtime.puntatore` chiamare
   `ticker.wake()` (la parallasse ascolta comunque `pointermove` solo per
   svegliarlo); `useFoglio` usa `transform` (la camera usa `translate` sul
   pannello); costanti di inerzia, bordo, tenuta e soglia del nastro da
   `NASTRO`; calore delle celle con `--imb-luce-calore-entra/esce`.
7. **art-director**: nessuna `opacity`/`filter`/`will-change: opacity` sulla
   scatola `preserve-3d`; lo strato Dentro con fondo notte profonda opaco;
   profondità e prospettiva le decidi tu (la camera le misura).
