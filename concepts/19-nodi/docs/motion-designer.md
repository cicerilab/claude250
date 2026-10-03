# Motion designer · Concept 19 · NODI

Ondata 2. File miei (tech-architect §4): questo documento e
`src/pages/concepts/nodi/motion/` (`easing.ts`, `percorso.ts`, `molle.ts`,
`choreography.ts`, `useMotionVars.ts`).

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`,
`concepts/19-nodi/docs/` (creative-director, tech-architect, ux-architect,
brand-strategist, trend-researcher), i file motion del pilota (solo per
formato), e i file già scritti in parallelo dall'art-director
(`styles/tokens.css`, `styles/tokens.ts`) e dal copywriter (`content/listino.ts`).

Verifiche fatte (scratchpad, non nel repo): typecheck dei 5 file con
`tsc` 5.6 in modalità `strict` + `noUncheckedIndexedAccess` +
`noUnusedLocals` (stub di `core/ticker.ts` con l'API del pilota), e un test
numerico in Node:
- `hzDaPercorso` monotona su 60.000 punti per i profili largo e stretto e
  per voce 330 / 348 / 366 Hz;
- `percorsoDaHz` → `hzDaPercorso` torna al valore di partenza (errore
  < 0,6 Hz) per ogni valore da 60 a 420 a passi di 0,37 Hz: **ogni valore
  del righello ha un solo punto di scroll**;
- `palcoDaPercorso` sempre in [0,63; 1] e continuo (salto massimo tra due
  punti vicini < 0,01);
- nessuna curva sovraelonga (valori monotoni in [0, 1]);
- cursore del righello: da spento a 168 Hz in 68 frame (1,1 s), poi fermo
  e il ticker può dormire.

Non ho avviato un dev server: lo scaffold arriva in ondata 3. Porta
riservata a me per le prove dal tech-architect (§11) 9196; l'orchestratore
indicava 9191, che è dell'art-director nella tabella: non la uso.

---

## 0. Decisioni in breve

1. **Sulla pagina si muovono solo cose fisiche.** Le sette cose che si
   muovono sono quelle del CD §4.10 più le due dell'ux §9: caduta delle
   foglie, migrazione, cuscinetti, dissolvenze dei testi al cambio modo,
   riduzione del riquadro mobile, crescita del riquadro nella salita 1, velo
   del margine al salto dal righello. Nessun'altra animazione: niente
   ingressi del testo, niente hover animati oltre a quelli di colore
   dell'interaction-designer, niente parallasse.
2. **Nessuna curva rimbalza.** La tavola è appoggiata sulla gommapiuma, che
   smorza tutto: niente molle sotto-smorzate, niente sovraelongazione. Le
   "molle" di questo concept sono inseguimenti esponenziali (§3).
3. **Il tempo lo dà la fisica, non una timeline.** La migrazione non ha
   durata: ha un tempo di formazione (2,5-4 s) che la simulazione deve
   rispettare. Lo scroll non ha curva: è nativo. La salita della frequenza
   è legata allo scroll in scala logaritmica, come la manopola di un
   generatore di segnale.
4. **I cuscinetti anticipano.** Il liutaio sposta i cuscinetti sui nodi del
   modo che sta per cercare *prima* di alzare la frequenza. Qui i
   cuscinetti cambiano all'inizio della salita: il visitatore vede quattro
   tondi grigi spostarsi e, pochi secondi dopo, le foglie formano la linea
   che passa proprio sopra di loro. È l'unico "annuncio" della pagina ed è
   vero.
5. **Reduced motion = stato finale subito**: nessuna caduta, nessuna
   migrazione, nessun tremolio, riquadro mobile fisso a 44svh, cursore senza
   inseguimento; restano solo dissolvenze brevi tra stati fermi (§7).

---

## 1. Le curve (`easing.ts`)

Ogni curva risponde a "chi lo spinge?". Tutte monotone, nessuna esce da
[0, 1]. Punti di controllo in un solo posto (`PUNTI`), da cui escono sia le
funzioni TS sia le stringhe CSS (`BEZIER_CSS`).

| Nome | Bezier | Chi lo spinge | Dove si usa |
|---|---|---|---|
| `posa` | `cubic-bezier(0.3, 0.55, 0.2, 1)` | una foglia che tocca il legno: decisa, si ferma senza rimbalzo | comparsa delle foglie (caduta, ricaduta di "Rimetti"), poster → fermo "riposo" del fallback |
| `assesta` | `cubic-bezier(0.12, 0.42, 0.28, 1)` | una foglia che scivola verso il nodo: spinta dal ventre, frena dove il legno sta fermo | profilo di riferimento per tarare la migrazione (la distanza media dal nodo nel tempo deve somigliarle) |
| `cuscinetto` | `cubic-bezier(0.45, 0.02, 0.22, 1)` | il liutaio alza la tavola e sposta un cuscinetto: lento all'inizio e alla fine | opacità dei cuscinetti vecchi e nuovi |
| `velo` | `cubic-bezier(0.4, 0.15, 0.6, 0.85)` | nessuno: è una dissolvenza che non deve farsi notare | testi al cambio modo (200 ms), nome del modo (300 ms), fermi e disposizioni del reduced motion (400 ms), canvas (300 ms), velo del margine |
| `inseguito` | `cubic-bezier(0.2, 0.6, 0.25, 1)` | un dito: pronto, poi liscio | eventuali transizioni CSS di posizione (la foglia del piano del suono quando la si sposta da tastiera con i range, se il builder la anima in CSS) |
| `riquadro` | smootherstep (in CSS `riquadroCss()` = `linear(…)`, ripiego `ease-in-out`) | lo scroll | riduzione e crescita del riquadro mobile, legate allo scroll |

Utilità esportate: `clamp`, `clamp01`, `lerp`, `inverseLerp`,
`progressoTra`, `smoothstep01`, `smootherstep01`, `smootherstep`,
`lerpLog`, `progressoLog`, `cubicBezier`, `cssLinear`, `derivata`.

**Per lo shader** (comparsa delle foglie nel vertex shader): la bezier
`posa` si approssima con `1.0 - pow(1.0 - t, 2.9)` (errore massimo 0,054
sulla curva, cioè 0,005 sulla scala 0,9 → 1: invisibile). Codice in §3.1.

---

## 2. Il percorso: scroll → frequenza → riquadro (`percorso.ts`)

### 2.1 Un modello che mette d'accordo ux e tech

L'ux-architect (§1, §3.2) disegna sei sezioni e quattro **salite** come
spacer `nod-salita`; il tech-architect (§6.3) vuole `percorso = i + t` su sei
stazioni con "pianerottolo nella prima parte e salita nella parte finale".
Sono la stessa cosa se **una stazione è la sezione più la salita che la
segue**:

| i | Stazione | Contiene | Pianerottolo | Salita finale |
|---|---|---|---|---|
| 0 | `inizio` | `#inizio` + salita 1 | spento (0 Hz) | 60 → 92 |
| 1 | `legni` | `#legni` + salita 2 | 92 Hz, modo 1 | 92 → 168 |
| 2 | `costruire` | `#costruire` + salita 3 | 168 Hz, modo 2 | 168 → voce (348 di partenza, 330-366) |
| 3 | `voce` | `#voce` + salita 4 | voce, modo 5 | prima metà voce → 420, seconda metà spento |
| 4 | `riparazioni` | `#riparazioni` | spento, tavola ferma | nessuna |
| 5 | `bottega` | `#bottega` + piede | spento | nessuna |

Lo scaffold misura i bordi alti delle sei sezioni (ogni stazione va dal
bordo alto della sua sezione al bordo alto della sezione dopo, salita
compresa) e le altezze delle salite; da lì:

```ts
const profilo = profiloDaMisure({ sezioni: [h0..h5], salite: [s1..s4], finestra: innerHeight });
const p = percorsoDaLettura(yLettura, inizi, fine);           // i + t
runtime.hz.valore = hzDaPercorso(p, runtime.hzModo5, profilo);
runtime.palco    = palcoDaPercorso(p, profilo, palcoApertura); // solo layout stretto, poi filtrato (§3)
// righello → scroll:
const y = letturaDaPercorso(percorsoDaHz(hz, runtime.hzModo5, profilo), inizi, fine) - offsetLettura;
```

Le misure si rifanno solo quando lo scaffold rimisura le stazioni (mai
durante lo scroll). Senza profilo vale quello nominale dell'ux a 1440
(`PROFILO_LARGO`); c'è anche `PROFILO_STRETTO` (375).

### 2.2 Le funzioni

| Funzione | Cosa fa |
|---|---|
| `hzDaPercorso(p, hzModo5?, profilo?)` | Hz o `null` (spento). Sui pianerottoli costante; nelle salite `a × (b/a)^u` (scala logaritmica, la stessa del righello: il cursore scende a velocità costante mentre si scorre a velocità costante). Monotona. |
| `percorsoDaHz(hz, hzModo5?, profilo?)` | Inversa. Entro 0,5 Hz da un pianerottolo → inizio del pianerottolo + `MARGINE_PIANEROTTOLO` (0,02 di stazione, l'h2 è già in vista); ≤ 60 → inizio della salita 1; ≥ 420 → ultimo punto acceso della salita 4. |
| `palcoDaPercorso(p, profilo?, palcoApertura?)` | Scala del riquadro mobile, 1 = 54svh, 0,63 = 34svh (§2.3). |
| `statoTavolaDaPercorso(p)` | `'riposo' \| 1 \| 2 \| 5 \| 'salita' \| 'ferma'` per `store.tavola`, `data-modo`, aria-live. |
| `modoCuscinetti(p)` | Su quali nodi stanno i cuscinetti: già quelli del modo successivo dall'inizio della salita (§0.4). |
| `trattoDaPercorso(p)` | Stazione, frazione, fase (pianerottolo/salita) e avanzamento nella fase. |
| `percorsoDaLettura(y, inizi, fine)` / `letturaDaPercorso(p, inizi, fine)` | Linea di lettura in coordinate documento ↔ percorso. Pure. |
| `uDaHz(hz)` / `hzDaU(u)` | Posizione sul righello (0 = 60 Hz, 1 = 420 Hz, log) e inversa; `U_SPENTO = -0,055` = fermo "spento" 40 px sotto il 60 su 734 px. Una formula sola per cursore, tacche e scala. |

Valori del profilo stretto (375, misure nominali ux), voce a 348 Hz:

| p | fase | Hz | riquadro | tavola | cuscinetti |
|---|---|---|---|---|---|
| 0,50 | apertura | spento | apertura (es. 0,75) | riposo | riposo |
| 0,90 | salita 1 | 82 | 0,97 (cresce) | salita | modo 1 |
| 1,00 | pianerottolo | 92 | 1,00 | modo 1 | modo 1 |
| 1,50 | pianerottolo | 92 | 0,63 | modo 1 | modo 1 |
| 1,80 | salita 2 | 99 | 1,00 | salita | modo 2 |
| 2,95 | salita 3 | 297 | 1,00 | salita | modo 5 |
| 3,30 | voce | 348 | 0,63 | modo 5 | modo 5 |
| 3,95 | salita 4 | 412 | 1,00 (risale) | salita | modo 5 |
| 4,30 | riparazioni | spento | 1,00 | ferma | modo 5 |
| 4,90 | riparazioni | spento | 0,63 | ferma | modo 5 |

### 2.3 Il riquadro mobile (ux §2.5)

- **Apertura**: la scala calcolata dal builder dell'apertura
  (`palcoApertura` = altezza dell'apertura / 54svh, tra 38/54 e 1); nella
  salita 1 cresce a 1 con `riquadro`.
- **Pianerottoli (legni, costruire)**: 1 all'ingresso, dopo 40svh di
  lettura scende a 0,63 in 30svh, risale a 1 negli ultimi 30svh prima della
  salita. Se la sezione è troppo corta (meno di 20svh a 34), resta a 1.
- **Voce**: scende a 0,63 nei primi 12svh e ci resta per tutto il form (la
  tavola resta visibile mentre si sceglie la voce); risale nella prima metà
  della salita 4.
- **Riparazioni**: come un pianerottolo, senza risalita (dopo c'è la
  bottega).
- **Bottega e piede**: 0,63, con ingresso continuo dal valore precedente.
- **Largo**: lo scaffold non la chiama, `runtime.palco = 1`.
- **Reduced motion**: costante `PALCO_REDUCED_MOTION` (44/54), per tutta
  la visita, nessuna transizione (ux §7.10). Se l'apertura calcolata è più
  bassa, vale `min(palcoApertura, 44/54)`, sempre costante.

Le costanti in svh sono in `RIQUADRO_SVH` (lettura 40, discesa 30,
risalita 30, ingresso lungo 12, minimo ridotto 20).

---

## 3. Inseguimenti (`molle.ts`)

Lerp normalizzato su `dt`: `1 − e^(−dt/τ)`, stesso risultato a 30, 60 e
120 Hz; un frame più lungo di 0,25 s (scheda tornata visibile) salta al
valore finale. Sotto la soglia si ferma esattamente sull'obiettivo, così il
ticker dorme.

| Costante | τ (s) | Uso |
|---|---|---|
| `TAU.cursore` | 0,12 | cursore del righello quando la frequenza viene dallo scroll (la rotella scatta a 100 px: il cursore non deve scattare) |
| `TAU.cursoreTrascinato` | 0,035 | cursore mentre lo si trascina: resta sotto il dito |
| `TAU.palco` | 0,09 | `runtime.palco` dietro a `palcoDaPercorso`: assorbe i salti di scroll (indice, righello) senza ritardare lo scroll lento |
| `TAU.morbido` | 0,2 | avvicinamenti generici |

API: `fattore`, `insegui`, `creaInseguitore` / `avanza`
(`Inseguitore { valore, obiettivo }`, nessuna allocazione per frame),
`creaCursoreRighello` / `avanzaCursoreRighello(c, hz, dt, { trascinando,
ridotto })` / `saltaCursoreRighello`.

Il cursore insegue in **posizione di scala** `u` (log), non in Hz: così va
allo "spento" (che non ha un valore in Hz) con lo stesso movimento, e la
velocità percepita è uguale in basso e in alto. `c.hz` è l'intero mostrato
("168 Hz"), `null` solo quando il cursore è arrivato al fermo: sotto 60 Hz
il righello non mostra numeri di passaggio.

### 3.1 Per il webgl-artist: comparsa e cuscinetti nello shader

Comparsa di una foglia (vertex shader), stessa formula di
`comparsaFoglia` in `choreography.ts`:

```glsl
// uCaduta: ms dall'inizio della caduta (o della ricaduta di "Rimetti"),
//          un valore molto grande quando la caduta è finita o con reduced motion.
// aT0: attributo statico, t0Caduta(u, v, caso) in ms.
float tc = clamp((uCaduta - aT0) / 420.0, 0.0, 1.0);   // CADUTA.perFoglia
float k  = 1.0 - pow(1.0 - tc, 2.9);                     // ≈ posa
float scala   = mix(0.9, 1.0, k);                        // CADUTA.scalaDa
float opacita = clamp(tc / 0.55, 0.0, 1.0);              // CADUTA.opacitaEntro
```

Le foglie non cambiano mai colore né luminosità: l'opacità esiste solo
durante la comparsa e il sollevamento di "Rimetti".

Cuscinetti: invece di un `mix` da cui ricavare le opacità nello shader, il
ticker calcola `alfaCuscinetti(mixCuscinetti(ms, ridotto))` sulla CPU e
passa due uniform (`uAlfaVecchi`, `uAlfaNuovi`, da moltiplicare per
`CUSCINETTI.alfa` = 0,25). Così la curva `cuscinetto` è esatta e lo shader
resta banale.

---

## 4. Coreografia (`choreography.ts`)

### 4.1 Caduta iniziale (una volta per visita)

- Parte 120 ms (`CADUTA.attesa`) dopo che il canvas è comparso (300 ms
  sopra il poster identico): il visitatore vede prima il legno vuoto, poi
  le foglie.
- 1.200 ms in tutto; ogni foglia compare in 420 ms (scala 0,9 → 1 con
  `posa`, opacità piena al 55% della sua comparsa).
- **Ordine di comparsa: una versata, non un'onda.** `t0Caduta(u, v, caso)`
  mescola la distanza da un punto poco sopra il centro (u 0,47, v 0,44,
  dove il liutaio inclina il barattolo) al 62% e il caso del generatore con
  seme al 38%. Risultato misurato: le prime foglie a 6 ms, le ultime a 761
  ms, finite a 1.181 ms. Si vede un mucchio che si sparge, non un cerchio
  che si allarga.
- Con arrivo diretto a un'ancora (`#voce`) le foglie cadono sparse e poi
  migrano verso la figura: mai una figura già formata che "cade".
- Fallback senza WebGL: poster "vuota" → fermo "riposo" in 1.200 ms con
  `posa` (`DISSOLVENZE.cadutaFallback`).

### 4.2 Schermata per schermata

| Schermata | Tavola | Righello | Testo | Riquadro mobile |
|---|---|---|---|---|
| A riposo | caduta, poi tutto fermo (0 render) | cursore sullo "spento", nessun movimento | fermo, nessun ingresso | apertura calcolata |
| Salita 1 | cuscinetti → nodi del modo 1 (1.400 ms, all'inizio della salita); foglie ferme finché non si entra in banda (≥ 84 Hz), poi si staccano | il cursore sale con lo scroll (τ 0,12) | nessun testo nella salita; l'h2 dei legni entra dal basso per scroll | cresce a 54svh |
| I legni (92) | la croce si forma in circa 3,25 s (prontezza base 0,5), poi tutto si ferma | "modo 1" compare (300 ms, `velo`); tacca "trovato" segnata | descrizione visibile e aria-live dopo 600 ms | 54 → 34 → 54 |
| Salita 2 | cuscinetti → modo 2; la croce resta intera fuori banda e si scompone solo entrando nella banda del 168 | "modo 1" sparisce (300 ms) | | 54 |
| Costruire (168) | la X / le parentesi del modo 2 | "modo 2" | | 54 → 34 → 54 |
| Salita 3 | cuscinetti → modo 5 | | | 54 |
| La voce (348 o voce) | l'anello; spostando la foglia del piano l'anello si rifà più largo o stretto con la prontezza della voce (2,5-4 s) | il cursore segue la voce | frase della zona: cambio di testo in 200 ms al rilascio, non durante il trascinamento | 34 per tutto il form |
| Invio in corso | spinta casuale di 3 mm in 500 ms, poi l'anello si ricompone a prontezza 0 | fermo | il bottone cambia etichetta, stessa larghezza, nessuna animazione | 34 |
| Salita 4 | l'anello resta (sopra non c'è risonanza) | sale a 420, poi va allo "spento" | | risale a 54 |
| Riparazioni, bottega | **le foglie restano nell'anello** (lo fa la fisica), 0 render | "spento", "modo 5" sparisce | | 54 → 34, poi 34 |

La migrazione: `FORMAZIONE` dà il criterio di taratura per la simulazione
del webgl-artist. A prontezza p, dopo `tempoFormazione(p)` ms di
risonanza piena (4.000 ms a p = 0, 2.500 a p = 1, lineare: la differenza
morbido/pronto deve vedersi) il 90% delle foglie è entro 1,2 mm dalla linea
nodale. Nel primo 25% del tempo le foglie si staccano appena (niente scatto
all'ingresso in banda); velocità massima 22 mm/s (nessuna foglia salta);
sotto 0,08 mm/s per tutte la simulazione dorme.

Tremolio (`TREMOLIO`): rumore liscio con 2,4 nodi al secondo (≤ 3),
ampiezza massima 2 px CSS, zero sotto |w| = 0,12 (le foglie sui nodi sono
ferme del tutto).

### 4.3 Comandi

- **"Rimetti le foglie"** (`RIMETTI`, 1.200 ms): le foglie si sollevano
  (opacità 1 → 0, scala 1 → 0,94, 300 ms, sfasate fino a 160 ms), poi
  ricadono sparse con la comparsa della caduta compressa in 900 ms. Se la
  tavola è in risonanza, rifanno la figura. In reduced motion: dissolvenza
  di 400 ms tra la disposizione attuale e quella sparsa.
- **Annuncio aria-live**: 600 ms dopo l'ultimo cambio di modo (ux §3.3),
  mai durante il trascinamento.

---

## 5. Transizioni

| Cosa | Durata | Curva | Note |
|---|---|---|---|
| Nome del modo sul righello | 300 ms | `velo` | solo opacità; al massimo un cambio ogni 500 ms (se si passa veloce su due modi si salta all'ultimo) |
| Testi che cambiano (frase della zona, descrizione visibile) | 200 ms | `velo` | solo opacità, mai traslazioni |
| Fermi del fallback, disposizioni del reduced motion | 400 ms | `velo` | dissolvenza incrociata; un cambio ogni 500 ms al massimo |
| Poster → canvas | 300 ms | `velo` | i due sono identici: non si vede |
| Canvas → fermo (qualità, contesto perso) | 400 ms | `velo` | |
| Cuscinetti | 1.400 ms (400 ridotto) | `cuscinetto` | i vecchi svaniscono in 0-55%, i nuovi compaiono in 40-100%; non scivolano sul legno |
| Velo del margine al salto dal righello | 120 giù / 150 fermo / 200 su | `velo` | solo se un frame sposta la pagina di più di una finestra; mai sotto 0,35; un ciclo ogni 500 ms al massimo (`VELO_SALTO`, `opacitaVelo(ms)`) |
| Ancore, scorciatoie, magnetismo al rilascio | scroll liscio nativo | del browser | `comportamentoScroll(ridotto)`: `'smooth'` / `'auto'` |
| Uscita verso Ciceri Lab | nessuna | | il ConceptBackButton è del sito |

Regola anti-lampeggio: nessuna superficie grande cambia colore. Il velo del
margine cambia opacità del testo (non un fondo) e al massimo due volte al
secondo; la riduzione del riquadro è un `transform` su un fondo dello
stesso colore della pagina.

Transizioni pronte in `TRANSIZIONI_CSS` (per test e stili inline).

---

## 6. Variabili CSS (`useMotionVars.ts`)

`useMotionVars(ref, specs, attivo?)` registra un elemento **foglia** marcato
`data-nodvar` (in sviluppo avvisa in console se manca) con le sue variabili:

```ts
useMotionVars(refRiquadro, {
  '--nod-palco': { leggi: () => runtime.palco, passo: 0.001 },
});
```

- Una sola funzione nella fase `write` del ticker per tutte le
  registrazioni; quantizza (default 0,001) e scrive `style.setProperty`
  solo se il valore è cambiato. Non tiene sveglio il ticker.
- Alla registrazione scrive subito; allo smontaggio rimuove le variabili.
- `invalidaMotionVars()` forza la riscrittura (cambio di layout).

Variabili previste (i builder le dichiarano nel loro CSS con il ripiego,
es. `var(--nod-palco, 1)`):

| Variabile | Elemento (`data-nodvar`) | Valore | Builder |
|---|---|---|---|
| `--nod-palco` | riquadro della tavola e fondo del palco (stretto) | 0,63 … 1 | palco |
| `--nod-regolo-y` | regolo orizzontale (stretto) | `(palco − 1) × 54svh` in px, `unita: 'px'`, passo 0,5 | righello |
| `--nod-cursore` | cursore del righello | `cursore.u` (U_SPENTO … 1), passo 0,0005 | righello |
| `--nod-velo` | contenitore del contenuto di ogni sezione (non `.nod-testo`, che non deve avere `opacity` diverso: è il contenitore di sticky e fixed) | `opacitaVelo(ms)`, passo 0,01 | ogni section-builder (una riga) |

Il testo del valore ("168 Hz") non è una variabile: il ticker scrive
`textContent` di `refValore` solo quando `cursore.hz` cambia (tech §7.1).

---

## 7. Reduced motion, riepilogo

| Cosa | Normale | Reduced motion |
|---|---|---|
| Caduta iniziale | 1.200 ms | nessuna: foglie già sparse |
| Migrazione | 2,5-4 s | nessuna: dissolvenza 400 ms tra disposizioni ferme precalcolate |
| Tremolio | rumore liscio ≤ 2 px | nessuno |
| Cuscinetti | 1.400 ms | dissolvenza 400 ms, stessi due uniform |
| Cursore del righello | τ 0,12 / 0,035 | salto (`avanzaCursoreRighello` con `ridotto: true`) |
| Riquadro mobile | legato allo scroll | fisso a 44svh |
| Nome del modo, testi | 300 / 200 ms | uguali (sono dissolvenze brevi di testo, ammesse) |
| Velo del margine | 120/200 ms | nessuno (cambio netto: il testo non vela) |
| Scroll verso ancore | `smooth` | `auto` |
| "Rimetti le foglie" | sollevamento e ricaduta | dissolvenza 400 ms |
| Invio in corso | l'anello si ricompone | niente: cambia solo l'etichetta |

---

## Richieste ad altri agent

- **scaffold-engineer**
  - `risonanza/frequenza.ts`: usare `profiloDaMisure`, `percorsoDaLettura`,
    `hzDaPercorso`, `palcoDaPercorso`, `statoTavolaDaPercorso` come nel §2.1;
    `scrollDaHz` = `letturaDaPercorso(percorsoDaHz(...))` meno lo scarto
    della linea di lettura. Una stazione va dal bordo alto della sua
    sezione al bordo alto della sezione dopo (la salita è dentro). Passare
    a `palcoDaPercorso` la `palcoApertura` misurata dall'apertura (chiedo
    che sia un campo di `runtime`, scritto dal builder dell'apertura al
    mount e al resize, default 1).
  - `runtime.palco` = `insegui(runtime.palco, palcoDaPercorso(...), dt,
    TAU.palco)` sullo stretto (salto con reduced motion, costante 44/54);
    1 sul largo.
  - `runtime.righello`: aggiungere `u: number` (posizione di scala) accanto
    a `cursore` (Hz mostrati, `null` = spento): il ticker usa un
    `CursoreRighello` di `molle.ts` e copia `u` e `hz`.
  - `runtime.cuscinetti = { modo, mixMs }`: cambio di `modoCuscinetti(p)`
    → nuovo cambio (se ne arriva un altro durante il cambio, parte dalla
    posizione già visibile: si ricomincia da `mix` 0 con i "vecchi" = quelli
    con opacità più alta).
  - `risonanza/modi.ts`: 60, 420, 92, 168, 348 devono essere gli stessi di
    `percorso.ts` (li ho ripetuti lì per tenere `motion/` provabile senza
    il resto: se preferisci, `modi.ts` li importa da `percorso.ts`).
  - `core/ticker.ts` con l'API del pilota (`ticker.add(fn, 'write')`,
    `ticker.wake()`): `useMotionVars.ts` la usa così.
  - `runtime.ultimoSalto` (ms dell'ultimo frame in cui il trascinamento ha
    spostato la pagina di più di una finestra), per `opacitaVelo`.
- **art-director**: in `tokens.css` sostituire `--nod-ease-fermo` con le
  curve di §1 (`--nod-curva-posa`, `--nod-curva-velo`, `--nod-curva-cuscinetto`,
  `--nod-curva-inseguito`, valori di `BEZIER_CSS`) e aggiungere
  `--nod-t-canvas: 300ms`, `--nod-t-cuscinetti: 1400ms`; sotto
  `.nod-root[data-motion="reduced"]`: `--nod-t-caduta: 0ms`,
  `--nod-t-cuscinetti: 400ms`. I tempi 200 / 300 / 400 / 1200 che hai già
  sono giusti.
- **webgl-artist**: comparsa delle foglie con §3.1 e `t0Caduta`; taratura
  della migrazione su `FORMAZIONE` (criterio 90% entro 1,2 mm; 4.000 /
  2.500 ms; velocità massima 22 mm/s; quiete 0,08 mm/s); `TREMOLIO`;
  cuscinetti con due uniform di opacità (§3.1); comandi `sparpaglia` con
  `RIMETTI` e `ricomponi` con `RICOMPONI`.
- **shader-engineer**: dissolvenze del reduced motion e del passaggio al
  fallback con `DISSOLVENZE.fermo` e `versoFallback`; canvas con
  `DISSOLVENZE.canvas`; la caduta parte `CADUTA.attesa` ms dopo `on`.
- **interaction-designer**: durante il trascinamento del righello
  `runtime.righello.trascinando = true` (il cursore usa
  `TAU.cursoreTrascinato`); magnetismo e ancore con
  `comportamentoScroll(ridotto)`; nessuna animazione propria di hover oltre
  a colore/sottolineatura (CD §4.7).
- **section-builder (tutti)**: nessun ingresso animato del testo; una sola
  riga per il velo del margine (`data-nodvar` + `opacity: var(--nod-velo, 1)`
  sul contenitore del contenuto). Righello: `--nod-cursore` e
  `--nod-regolo-y`; nome del modo con `opacity` e `--nod-t-dissolvenza-modo`.
  Palco: `--nod-palco` su riquadro e fondo, origine in alto al centro.
- **ux-architect** (per conoscenza): le salite restano spacer `nod-salita`
  come nel tuo §1, ma per il percorso fanno parte della stazione che le
  precede; la salita 4 copre voce → 420 nella sua prima metà e lo spento
  nella seconda (come chiede il tech-architect); in reduced motion il
  riquadro mobile è a 44svh come hai scritto tu (il tech-architect diceva
  "a scatti": ho tenuto la tua versione, è più ferma).
