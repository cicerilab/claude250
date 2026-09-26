# UX architect · Concept 19 · NODI, liuteria (Pordenone)

Ondata 1. Rotta `/concept-19`. Base vincolante:
`concepts/19-nodi/docs/creative-director.md` (variante A, LA TAVOLA INTERA,
sezione 4). Questo documento decide **struttura, percorsi, ordine di lettura,
geometria delle zone, corrispondenza scroll → frequenza, stati della
prenotazione e accessibilità**. Non decide colori, font, easing o testi
definitivi (art-director, motion-designer, copywriter): le frasi tra virgolette
qui sotto sono segnaposto di lunghezza e di tono, da sostituire. Numeri in
lista, prezzi e tempi citati nei wireframe sono di esempio e li fissano
brand-strategist e copywriter; le **frequenze** (92, 168, 348 Hz, scala
60-420 Hz, banda ±8 Hz, magnetismo ±6 Hz) sono quelle del creative-director e
qui diventano regola.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, riga e paragrafo 19 e
verifica incrociata di `docs/matrice-concept-11-20.md`,
`concepts/19-nodi/docs/creative-director.md`,
`concepts/10-torchio/docs/ux-architect.md` e
`concepts/18-sottoscocca/docs/ux-architect.md` (solo formato e livello).

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, niente occhielli numerati, niente maiuscoletto spaziato, niente
"scorri". **Un solo intento di prenotazione con una sola etichetta: "La voce
che vorresti"**; l'invio del form si chiama **"Mettimi in lista"**. Le
riparazioni hanno un invio loro ("Ci vediamo sabato", nome provvisorio) ma
nessun richiamo in testata.

Prefisso CSS e di attributi: `nod-` (`data-nodvar` per le variabili del
motion-designer). Porte del concept: 9190-9199.

---

## 1. Sitemap

SPA a pagina singola. Una rotta, sette schermate con ancora, quattro
**salite** (tratti di scroll senza testo in cui sale la frequenza) e un'uscita
(il `ConceptBackButton` condiviso). Le schermate non sono sezioni numerate:
sono stati della stessa tavola.

```
/                                   ← Ciceri Lab (uscita: ConceptBackButton condiviso)
└── /concept-19                     NODI (pagina unica, una sola scena)
    ├── #riposo        A riposo · 0 Hz, altoparlante spento      <section> (h1)
    │   (salita 1: 60 → 92 Hz)
    ├── #legni         Modo 1 · I legni · 92 Hz                  <section>
    │   (salita 2: 92 → 168 Hz)
    ├── #costruire     Modo 2 · Costruire uno strumento · 168 Hz <section>
    │   (salita 3: 168 → frequenza della voce, 348 Hz di partenza)
    ├── #voce          Modo 5 · La voce che vorresti             <section> (cuore)
    │   (salita 4, "oltre": voce → 420 Hz)
    ├── #riparazioni   Tavola ferma · Riparazioni e restauri     <section>
    ├── #bottega       La bottega                                <section>
    └── #piede         Piede                                     <footer>
```

Elementi fissi, fuori dal flusso del testo:
- **Riquadro della tavola** (`nod-cornice`): il `canvas` WebGL
  (`aria-hidden="true"`), sotto di lui l'immagine ferma della tavola a riposo
  (poster e LCP), e la regione `aria-live` che descrive la figura.
- **Banco di prova** (`<section aria-label="Prova della tavola">`): il
  righello delle frequenze (`role="slider"`), il valore corrente, il nome del
  modo, l'interruttore "Suono", il link "Rimetti le foglie".
- **Testata**: marchio NODI a cartiglio in alto a destra; sotto i 1200 px è
  anche il bottone del menu a comparsa.
- **Indice** (`<nav aria-label="Contenuti">`): colonna destra su desktop,
  menu a comparsa sotto i 1200 px.

Le quattro salite sono `div` vuoti `aria-hidden="true"` con classe
`nod-salita` e attributi `data-nod-da` e `data-nod-a` (frequenze agli
estremi). Non contengono testo né controlli: servono solo a dare spazio di
scroll alla migrazione delle foglie.

### 1.1 Parametri di ingresso (per post e inserzioni di Luca)

Tutti facoltativi, letti una volta al montaggio, mai riscritti nell'URL dal
sito.

| Parametro | Valori | Effetto |
|---|---|---|
| `#legni`, `#costruire`, `#voce`, `#riparazioni`, `#bottega` | ancore | dopo il primo paint la pagina va all'inizio del pianerottolo; le foglie cadono (1,2 s) e poi migrano verso la figura del modo |
| `?strumento=` | `violino`, `viola`, `violoncello` | preseleziona lo strumento nel form della voce (e quindi il numero in lista e la consegna) |
| `?voce=` | `scura-morbida`, `scura-pronta`, `brillante-morbida`, `brillante-pronta`, `equilibrata` | mette la foglia al centro della zona indicata; la tavola usa la frequenza corrispondente |
| `?invio=errore` | | ogni invio (voce e sabato) finisce nello stato "Invio fallito" (serve al QA) |
| `?suono=` | ignorato | il suono non si accende mai da URL: nessun parametro lo fa |

Esempi: inserzione per genitori `/concept-19?strumento=violino#voce`; post
sulle riparazioni `/concept-19#riparazioni`; post sul gesto `/concept-19`.

### 1.2 Stato che sopravvive al ricaricamento

`localStorage`, chiavi con prefisso `nodi:`, **ogni lettura e scrittura in
try/catch**; con memoria vuota o bloccata il sito funziona uguale e riparte
"vuoto".
- `nodi:trovati`: i modi già trovati almeno una volta (`[1, 2, 5]`), per le
  tacche ebano sul righello.
- `nodi:voce`: ultima richiesta riuscita: strumento, zona della voce, Hz,
  numero in lista, consegna. Serve alla tacca "la tua voce" e allo stato di
  ritorno V10. **Mai** nome, email, telefono, nota.
- `nodi:sabato`: ultimo sabato prenotato (data ISO), per lo stato R8.
- Nel piede: "Dimentica le mie prove" cancella le tre chiavi e rimette le
  foglie.

---

## 2. Navigazione

### 2.1 Principio

La navigazione vera è **il righello**: dice a che frequenza sei, e spostando
il cursore la pagina va nel punto che corrisponde. Accanto c'è un indice
di cinque voci per chi vuole saltare a un contenuto. Niente barra di menu in
alto, niente panino su desktop largo. La prenotazione si raggiunge sempre con
un tocco ("La voce che vorresti" nell'apertura e nell'indice) e si esce sempre
verso Ciceri Lab con il bottone condiviso.

**Una sola verità: la posizione di scroll.** La frequenza è calcolata dallo
scroll (§3.2). Il righello non ha uno stato suo: trascinarlo scrive lo scroll,
e lo scroll riscrive il righello. Scroll e trascinamento non possono litigare.

Elementi presenti su ogni larghezza:
1. link di salto nascosti fino al focus: "Salta al contenuto" e "Vai alla
   voce che vorresti";
2. `ConceptBackButton` (del sito, non nostro);
3. marchio NODI (porta a `#riposo`; sotto i 1200 px apre il menu);
4. righello con valore e nome del modo;
5. interruttore "Suono";
6. indice (colonna o menu).

### 2.2 Convivenza con il ConceptBackButton

Il bottone è `position: fixed`, z-index altissimo, con una zona sua in cui
nessun elemento interattivo del concept può stare.

| Larghezza | Posizione del bottone | Zona riservata (nessun nostro controllo dentro) |
|---|---|---|
| ≥ 640 px | in alto a sinistra, top 14, left 14 | rettangolo `0,0 → 260 × 72` px |
| < 640 px | in basso a sinistra, bottom 14, left 14 | rettangolo `0, (100svh − 72) → 232 × 72` px, più `env(safe-area-inset-bottom)` |

Conseguenze:
- **Desktop**: il marchio va in alto **a destra** (il creative-director lo
  vuole lì proprio per questo). Il testo del margine sinistro comincia sotto
  y = 96 px quando è in alto; nell'apertura è allineato in basso, quindi
  lontano dalla zona.
- **Mobile**: nessun elemento fisso nostro sta in basso a sinistra. Il
  riquadro della tavola e il righello sono in alto. Il bottone "La voce che
  vorresti" dell'apertura e i bottoni di invio non finiscono mai sotto la zona
  (regole in §5.1 e §5.4). L'ultima riga di ogni contenuto ha 72 px di margine
  di piede, e il piede ha `padding-bottom: calc(88px + env(safe-area-inset-bottom))`.
- Il focus non finisce mai sotto il bottone: su mobile ogni elemento
  tabulabile del contenuto ha `scroll-margin-bottom: 88px`.

### 2.3 Desktop (≥ 1200 px, disegnato a 1440 × 900)

Tre colonne, tutte fisse tranne la prima che scorre:

```
x:  0    72            456  494                 946  1000        1236      1400 1440
    ┌────┬──────────────┬───┬───────────────────┬────┬───────────┬─────────┬──┐
    │back│ margine di   │   │                   │    │ righello  │ NODI    │  │ y 32
    │btn │ lettura      │   │     TAVOLA        │    │ verticale │ liuteria│  │
    │zona│ (scorre,     │   │  in pianta,       │    │ 420 in    │ in Porde│  │
    │    │  nativo)     │   │  ferma, fissa,    │    │ alto,     │ none    │  │
    │    │ larga 384    │   │  86% dell'altezza │    │ 60 in     │         │  │
    │    │              │   │  (774 × 452)      │    │ basso,    │         │  │
    │    │              │   │                   │    │ "spento"  │ Suono   │  │
    │    │              │   │                   │    │ sotto     │ Rimetti │  │
    │    │              │   │                   │    │           │ Indice  │  │ y 837
    └────┴──────────────┴───┴───────────────────┴────┴───────────┴─────────┴──┘
```

- **Tavola**: `position: fixed`, altezza `min(86svh, 1000px)`, proporzione
  1 : 1,71, centrata sull'asse della finestra. A 1440 × 900: x 494-946,
  y 63-837.
- **Margine di lettura** (sinistra): colonna in flusso, larga
  `clamp(320px, 26.7vw, 440px)`, x da 72. Contiene tutti i testi, le foto
  (360 px), il form della voce e quello del sabato. Scroll nativo del
  documento.
- **Righello** (destra, fisso): alto quanto la tavola, allineato ai suoi
  bordi, binario a x = 1000. Valore corrente grande accanto al cursore, nome
  del modo sotto il valore. Dettagli in §5.0.
- **Colonna del banco** (x 1236-1400, fissa): in alto il marchio a
  cartiglio; allineati in basso, dall'alto: interruttore "Suono" con la nota,
  "Rimetti le foglie", indice. Il creative-director mette l'indice "sotto il
  righello": con il righello alto quanto la tavola non c'è spazio sotto, quindi
  sta **accanto**, allineato in basso con il piede del righello, e si legge
  come la sua legenda. Il righello non si accorcia.

### 2.4 Desktop stretto (1024-1199 px) e finestre basse

- Margine di lettura `clamp(300px, 30vw, 360px)`; la tavola è centrata nello
  spazio tra il margine e il righello (non più sull'asse della finestra),
  altezza `min(80svh, 1000px)`.
- La colonna del banco sparisce: il marchio in alto a destra diventa il
  bottone del menu (come su mobile, §2.6), l'interruttore "Suono" sta sotto il
  marchio, "Rimetti le foglie" e l'indice stanno nel menu.
- Desktop con altezza tra 520 e 700 px (portatili a 1366 × 640): tutto come
  sopra, la tavola resta all'86% (circa 550 px); nella colonna del banco la
  nota del suono passa sotto l'indice in 12 px (resta visibile, collegata con
  `aria-describedby`) e il marchio perde la seconda riga.

### 2.5 Mobile (< 1024 px, disegnato a 375 × 667, pensato per primo)

```
375 × 667, a un pianerottolo:
┌───────────────────────────────────────┐ y 0
│Suono          ╭───╮             NODI  │  angoli vuoti del riquadro:
│spento        ╱     ╲            ≡     │  a sinistra l'interruttore,
│             │       │                 │  a destra marchio e menu
│              ╲  )(  ╱                 │
│              │ ) ( │   TAVOLA         │  riquadro fisso, 54svh (360)
│              ╱  )(  ╲  210 × 360      │  tavola centrata
│             │       │                 │
│              ╲     ╱                  │
│               ╰───╯                   │ y 360
├───────────────────────────────────────┤
│ spento▕▏▏▏▏▏▏▏▏▏●▏▏▏▏▏▏▏▏▏  168 Hz    │ righello orizzontale, 56 px
│                              modo 2   │ y 416
├───────────────────────────────────────┤
│ il testo scorre qui, sotto il         │ area di lettura 251 px
│ riquadro, in colonna piena            │ (diventa 384 px quando il
│ (margini 20 px)                       │  riquadro si riduce al 34%)
│[ Torna in Ciceri Lab ]                │ ← zona del bottone del sito
└───────────────────────────────────────┘ y 667
```

- **Riquadro della tavola** + righello = un unico blocco `position: fixed`
  in alto, fondo abete opaco. Il testo è in flusso con `padding-top` pari
  all'altezza **massima** del blocco (54svh + 56 px): il blocco copre il testo
  che gli scorre sotto, e quando si riduce scopre righe già in pagina.
  Nessun reflow, nessun CLS.
- **Altezza del riquadro** (variabile `--nod-cornice`, scritta dal ticker):
  - apertura: calcolata (§5.1), tra 38svh e 54svh;
  - salite: 54svh;
  - pianerottoli: 54svh all'ingresso; dopo 40svh di lettura scende al 34svh
    in 30svh di scroll (legata allo scroll, niente scatti); risale al 54svh
    negli ultimi 30svh prima della salita successiva;
  - `#voce`: 34svh per tutto il form (la tavola resta visibile mentre si
    sceglie la voce);
  - `#riparazioni`: come un pianerottolo; `#bottega` e piede: 34svh.
- **Angoli**: la tavola occupa il centro del riquadro; negli angoli in alto
  (fuori dal contorno del violino, che lì è stretto) stanno a sinistra
  l'interruttore "Suono / spento" su due righe (x 12-76, 44 px di altezza) e
  a destra "NODI" con il segno del menu (x 299-363). Il responsive-tester
  verifica a 360 px che non tocchino il contorno.
- **Righello**: orizzontale, alto 56 px, cursore 44 × 44 trascinabile col
  pollice; binario x 20-271, valore in vernice a destra (x 283-355) con il
  nome del modo sotto. Il binario ha `touch-action: pan-y`: il pollice che
  scivola in verticale scorre la pagina, quello che scivola di lato muove il
  cursore. La tavola ha `touch-action: pan-y`: la pagina scorre sempre anche se
  il dito parte dalla tavola.
- **Scorciatoie dei modi**: su mobile non hanno una fila loro (non c'è
  spazio senza coprire il testo): sono le voci dell'indice nel menu, che
  portano agli stessi pianerottoli.
- **768 px** (tablet in verticale): stesso schema; colonna di testo larga
  `min(560px, 100% − 40px)` centrata; la tavola a 54svh è circa 553 × 323.

### 2.6 Menu a comparsa (sotto i 1200 px)

- Si apre dal marchio: `button` "NODI" con `aria-expanded` e
  `aria-controls`, nome accessibile "Indice di NODI".
- Pannello **non modale** che scende dall'angolo in alto a destra, largo
  `min(320px, 100% − 32px)`, fondo abete, contorno ebano 1 px, spigolo vivo.
  Contiene: seconda riga del marchio ("liuteria in Pordenone"), l'indice
  (cinque voci, le tre dei modi con "modo 1", "modo 2", "modo 5" sotto il
  nome), "Rimetti le foglie", la nota sul suono.
- Si chiude: scegliendo una voce, con Esc, con un tocco fuori, con il marchio.
  Alla chiusura con Esc o col marchio il focus torna al marchio; scegliendo
  una voce il focus va all'`h2` di arrivo.
- Il pannello non scende mai nella zona del bottone di ritorno (su mobile è in
  alto, quindi non succede).

### 2.7 Salti e focus

- Ogni voce dell'indice è un link `<a href="#legni">`. Al clic: scroll
  all'inizio del pianerottolo (smooth, istantaneo con reduced motion), poi
  focus all'`h2` (`tabindex="-1"`). Il ticker aggiorna frequenza e figura.
- Salto da righello: nessun focus spostato (il focus resta sul cursore).
- `scroll-padding-top` sul documento = `--nod-cornice` + 56 px + 16 px su
  mobile, 32 px su desktop: gli `h2` di arrivo non finiscono sotto il
  riquadro.
- Ogni elemento tabulabile del contenuto ha `scroll-margin-top` uguale: il
  focus non è mai coperto dal riquadro fisso (WCAG 2.4.11).

---

## 3. Flusso narrativo dello scroll (arco emotivo)

### 3.1 L'arco

| Tratto | Frequenza | Cosa fa la tavola | Cosa prova il visitatore | Cosa gli diamo |
|---|---|---|---|---|
| A riposo | 0 Hz | foglie appena versate, ferme | curiosità: "cos'è quella forma con dei semi sopra?" | un titolo che promette un gesto, un solo bottone, il righello a zero |
| Salita 1 | 60 → 92 | le foglie tremano appena, poi si muovono | sorpresa: "si muove quando scendo" | niente testo: solo la tavola e il numero che sale |
| I legni | 92 | la croce della torsione | meraviglia, poi fiducia | la materia (abete di Paneveggio, acero), una misura vera |
| Salita 2 | 92 → 168 | la croce resta intera finché non si scompone | anticipazione: ha capito il gioco | di nuovo solo il numero |
| Costruire | 168 | la X | concretezza | cosa si costruisce, quanti l'anno, prezzi "da", tempi |
| Salita 3 | 168 → 348 | la X resta, poi si apre | desiderio: "qual è la mia?" | il numero sale verso la voce |
| La voce che vorresti | 348 (o la voce scelta) | l'anello, che si allarga o si stringe con la foglia | partecipazione: sceglie, sente, chiede | il piano del suono, la lista d'attesa, l'invio |
| Salita 4 (oltre) | → 420 | l'anello resta (sopra non c'è risonanza) | chiusura della prova | nessun testo, 24svh |
| Riparazioni | spento | l'altoparlante si spegne, l'anello **resta** | sollievo: c'è anche chi ripara | il sabato di bottega, prezzi "da" |
| La bottega | spento | ferma | orientamento | dove, quando, come |
| Piede | spento | ferma | firma | Ciceri Lab, crediti, come è fatta la simulazione |

La curva emotiva sale fino a `#voce` e poi scende piano: la parte bassa della
pagina è pratica, la tavola ferma con l'anello è la "foto ricordo" della
prova.

### 3.2 Corrispondenza scroll → frequenza (regola per scaffold e ticker)

**Linea di lettura**: su desktop a metà della finestra (`0.5 × innerHeight`);
su mobile a metà dell'area di lettura sotto il blocco fisso
(`cornice + 56 + (innerHeight − cornice − 56) / 2`). La frequenza dipende da
quale elemento del flusso sta sotto la linea di lettura:

| Elemento sotto la linea | Frequenza `f` | Stato dell'altoparlante |
|---|---|---|
| `#riposo` | 0 | spento |
| salita k (`data-nod-da` = a, `data-nod-a` = b) | `a × (b / a)^t`, con `t` = frazione della salita già passata (0-1), scala logaritmica; per la salita 1 `a = 60` | acceso (virtuale) |
| `#legni` | 92 | acceso |
| `#costruire` | 168 | acceso |
| `#voce` | `fVoce` (348 di partenza, 330-366 secondo la foglia) | acceso |
| `#riparazioni`, `#bottega`, `#piede` | 0 | spento |

La salita 3 va da 168 a `fVoce`; la salita 4 da `fVoce` a 420. "Altoparlante
acceso" è lo stato fisico della simulazione, non l'audio (l'audio è sempre
dietro l'interruttore).

**Altezze** (si regolano, il creative-director lo permette; i minimi sono
vincolanti per il builder):

| Elemento | Desktop | Mobile |
|---|---|---|
| `#riposo` | 100svh | 100svh |
| salita 1 | 70svh | 60svh |
| `#legni` | `max(150svh, contenuto + 50svh)` | `max(170svh, contenuto + 60svh)` |
| salita 2 | 60svh | 50svh |
| `#costruire` | `max(150svh, contenuto + 50svh)` | `max(170svh, contenuto + 60svh)` |
| salita 3 | 60svh | 50svh |
| `#voce` | `max(150svh, contenuto + 40svh)` | `contenuto + 60svh` |
| salita 4 | 24svh | 20svh |
| `#riparazioni` | `max(100svh, contenuto + 30svh)` | `contenuto + 40svh` |
| `#bottega` | `max(80svh, contenuto)` | contenuto |
| piede | contenuto | contenuto |

Il testo di ogni pianerottolo comincia 8svh sotto il bordo alto della sezione:
l'`h2` entra dal basso durante l'ultima metà della salita, mentre il numero sta
ancora salendo, ed è a metà finestra quando la figura comincia a formarsi.

**Inverso (righello → scroll)**, usato dal trascinamento, dalla tastiera e
dalle scorciatoie:
- `f = 0` con la pagina sopra `#riparazioni` → `scrollY = 0`.
- `f` dentro una salita → il punto della salita che dà `f`.
- `f` uguale al valore di un pianerottolo (entro 0,5 Hz) → **inizio del
  pianerottolo** (bordo alto della sezione sulla linea di lettura, più lo
  scarto che mette l'`h2` in vista).
- Sotto 60 → `f = 0`; sopra 420 → 420.
- Nella coda (`#riparazioni` e sotto) il righello mostra "spento": il primo
  movimento del cursore (o la prima freccia) porta la pagina alla salita
  corrispondente, cioè **risale la pagina**. L'annuncio lo dice (§7.3).
- Durante il trascinamento lo scroll è istantaneo (`behavior: "auto"`), un
  solo `scrollTo` per frame dal ticker. Se il salto supera una finestra, il
  margine di lettura fa una dissolvenza di 200 ms (l'unica "animazione" del
  testo, quella che il creative-director ammette al cambio modo).
- **Magnetismo**: solo al rilascio, entro ±6 Hz da un picco (92, 168,
  `fVoce`) il cursore si appoggia sul picco e la pagina va all'inizio del
  pianerottolo. Mai durante il trascinamento.

**Risonanza** (per la simulazione e per le etichette): un modo è "in
risonanza" se `|f − picco| ≤ 8 Hz`. Il nome del modo compare sotto il valore
solo in risonanza. Fuori banda le foglie restano dove sono.

### 3.3 Stati della tavola

| # | Stato | Quando | Foglie | Righello | Annuncio (`aria-live="polite"`) |
|---|---|---|---|---|---|
| T0 | prima del montaggio | HTML prerender | immagine ferma "a riposo" | "0 Hz", cursore fermo, disabilitato | nessuno |
| T1 | caduta | primo montaggio, 1,2 s | cadono in pianta (scala 0,9 → 1 e dissolvenza) | "0 Hz" | nessuno |
| T2 | a riposo | `f = 0` in `#riposo` | sparse, ferme | "0 Hz", sotto "spento" | nessuno |
| T3 | in salita, fuori risonanza | `f` tra i picchi | restano nell'ultima figura (o sparse) | valore che sale o scende | nessuno |
| T4 | risonanza, figura che si forma | `|f − picco| ≤ 8` | migrano verso i nodi, 2,5-4 s | valore + "modo N" in dissolvenza 300 ms | "Modo 1 a 92 hertz: le foglie formano una croce, una linea lungo la giunta e una di traverso all'altezza delle C." (una volta per ingresso nel modo) |
| T5 | figura ferma | foglie quasi ferme | ferme; render si ferma | come T4 | nessuno |
| T6 | la voce cambia | la foglia del piano si sposta | l'anello si rifà un po' più largo o stretto | cursore segue `fVoce` | nessuno durante il trascinamento; al rilascio la frase della zona (§6) |
| T7 | invio in corso | V6 | l'anello si ricompone lentamente | fermo su `fVoce` | "Ti mettiamo in lista." |
| T8 | spento | coda | restano nella figura in cui erano (di solito l'anello) | "0 Hz", "spento" | "Altoparlante spento: le foglie restano dove erano." (solo la prima volta per visita) |
| T9 | rimetti le foglie | link | si spargono uniformi (1,2 s), poi se in risonanza rifanno la figura | invariato | "Foglie rimesse sulla tavola." |
| T10 | fermo per visibilità | scheda nascosta | pausa | invariato | nessuno |

Gli annunci T4 non partono mentre il visitatore trascina il righello o usa
le frecce (troppi): parte solo quello del modo in cui si ferma, 600 ms dopo
l'ultimo cambio.

---

## 4. Tre user journey (dall'arrivo all'invio)

Persone di esempio: il brand-strategist le conferma o le sostituisce.

### 4.1 Elena, Porcia, 44 anni · mobile, inserzione Instagram "il primo violino vero"

Contesto: la figlia Giulia, 15 anni, studia al conservatorio di Udine e il
violino di studio non le basta più. Elena non sa niente di liuteria, teme di
spendere troppo e di non capire.

1. Tocca l'inserzione → `/concept-19?strumento=violino#voce`. Il riquadro
   mostra la tavola, le foglie cadono e in 3 s disegnano l'anello: non sa cosa
   sia, ma è bello e ha l'aria di una prova seria.
2. Legge sotto: "Sposta la foglia dove senti il tuo strumento. Se non lo sai,
   lasciala al centro: ne parliamo in bottega." Lascia la foglia al centro
   ("equilibrata"). Vede subito, in vernice, "Saresti il numero 7 in lista.
   Consegna prevista: primavera 2028." Si ferma: il tempo è lungo.
3. Vuole capire il prezzo prima di lasciare dati: apre il menu (NODI in alto
   a destra), tocca "Costruire". La pagina risale, la tavola passa alla X,
   legge "violino da 9.500 €" (esempio) e "si viene in bottega a provare".
4. Torna con il menu a "La voce che vorresti". Tocca "Senti la voce": una
   nota breve, bassa. Legge la didascalia onesta.
5. Scrive nome e telefono (niente email), una riga "per mia figlia, 15 anni,
   studia al conservatorio". "Mettimi in lista".
6. Successo V7: tre righe, "Sei in lista, al numero 7...". Sul righello in
   alto la tacca "la tua voce, 348 Hz". Chiude la pagina tranquilla: nessun
   pagamento, ti richiamano.

Punti critici: il bottone "Mettimi in lista" visibile sopra la zona del
bottone di ritorno; il prezzo raggiungibile senza perdere il form (i dati in
memoria restano, §6.3); la tastiera `tel` giusta.

### 4.2 Marco, Pordenone, 38 anni · desktop, Google "liutaio Pordenone violoncello"

Contesto: violoncellista professionista in un'orchestra regionale. Sa cos'è
una tavola libera, ha visto le figure di Chladni. È diffidente verso i siti
"artistici" che non dicono niente.

1. Arriva su `/concept-19`. Legge il titolo, guarda il righello a 0 Hz. Non
   tocca il bottone: prende il cursore del righello e lo trascina su.
2. Le foglie si muovono a 92 Hz: riconosce la torsione. Il testo a sinistra
   è già quello dei legni: Paneveggio, acero dei Balcani, "circa 70 g la
   tavola". Controlla: è plausibile.
3. Accende "Suono": sente la sinusoide bassa. La spegne dopo pochi secondi.
4. Continua a trascinare fino a 168 (X) e poi 348: il magnetismo al rilascio
   lo aiuta. Nota le tacche ebano che compaiono sui modi trovati.
5. In `#voce`: sceglie "violoncello" (il numero in lista cambia: "numero 3,
   autunno 2028"), porta la foglia in alto a sinistra: "scura e pronta". Il
   righello segue a 336 Hz; l'anello si allarga di poco.
6. Preme "Senti la voce": un Do grave sintetico. Sorride della didascalia.
7. Compila con email, nota "orchestra, cerco proiezione", "Mettimi in lista".
   Successo. Scende a "La bottega" e copia l'indirizzo con "Apri in Maps".

Punti critici: il righello deve funzionare anche prima di aver letto (il
gesto è la prova di serietà); le frequenze sempre "circa"; nessun effetto
che un professionista giudicherebbe falso (figure sbagliate, foglie ai ventri).

### 4.3 Giorgio, Sacile, 67 anni · desktop con zoom del browser al 200% e tastiera

Contesto: suona la viola in un'orchestra amatoriale; il ponticello si è
piegato. Usa poco il mouse, ingrandisce tutto.

1. Arriva da un link del gruppo WhatsApp dell'orchestra su `/concept-19`.
   Con lo zoom al 200% la finestra CSS è 720 × 450: layout mobile, altezza
   sotto 480 px, quindi **modalità bassa** (§7.11): la tavola è in cima alla
   pagina in flusso, non fissa, e ogni modo ha la sua figura ferma accanto al
   testo.
2. Tab: "Salta al contenuto", "Vai alla voce che vorresti", marchio NODI
   (menu). Apre il menu con Invio, sceglie "Riparazioni" con le frecce e
   Invio. Il focus va all'`h2` "Riparazioni e restauri".
3. Legge "ponticello nuovo da 60 €" (esempio). Tab sui quattro sabati
   (gruppo di radio: frecce per scegliere), sceglie "sabato 10 ottobre".
4. Scrive "viola, ponticello piegato", nome, telefono. Invio con Invio.
   Dimentica il telefono: errore sotto il campo, focus sul campo. Lo scrive.
5. Successo R6: "Ti aspettiamo sabato 10 ottobre tra le 9 e mezzogiorno e
   mezzo. Porta anche l'archetto." Letto dal lettore di schermo di sistema che
   usa ogni tanto.

Punti critici: nessuna parte del form coperta da elementi fissi a zoom
alto; i sabati come radio veri; il focus visibile su abete.

### 4.4 Percorso minimo

Da qualsiasi punto della pagina, "La voce che vorresti" (apertura, indice o
menu) porta a `#voce` con un tocco; nel form l'unico dato obbligatorio oltre
al nome è **uno** tra email e telefono. Percorso minimo verificato: apertura
→ bottone → nome → telefono → "Mettimi in lista" = 4 azioni, nessuna scelta
obbligatoria sulla voce (la foglia al centro è una risposta valida).

---

## 5. Wireframe testuali per schermata

Misure a 1440 × 900 e 375 × 667. Il margine di lettura desktop è x 72-456
(384 px). Su mobile la colonna è x 20-355 (335 px) sotto il blocco fisso.

### 5.0 Elementi fissi comuni

**Righello, desktop** (a destra della tavola, y 63-837):

```
          x 1000
   420 ─┤▔▔                        │
        ┤                          │
   400 ─┤  400                     │ cifre ogni 50 Hz, 12 px, tè
        ┤                          │ tacche ogni 10 Hz
   350 ─┤▬ 350   ← tacca ebano "trovato"
        ┤
        ●━━  348 Hz               ← cursore 44 × 44 (area), segno vernice;
        ┤    modo 5                 valore 44 px vernice; nome modo 14 px tè
   300 ─┤  300
        ┤
   ...  ┤
   150 ─┤▬ 150   (tacca 168 segnata se trovato)
   100 ─┤▬ 100   (tacca 92 segnata se trovato)
    60 ─┤  60
        ┤
spento  ○  0 Hz                   ← fermo "spento" 40 px sotto il 60
```

- Scala logaritmica 60-420 su (altezza − 40 px); a 1440 × 900: 734 px.
  Posizioni dal basso del 60: 92 → 161 px, 168 → 388 px, 348 → 663 px.
- Il valore corrente segue il cursore sul lato destro; vicino ai bordi si
  ferma dentro il righello (non esce dalla finestra).
- Tacca "la tua voce" (dopo V7): segno vernice lungo 16 px sul lato sinistro
  del binario con scritto "la tua voce, 352 Hz" in 12 px tè; se si
  sovrappone al valore corrente, il valore vince e la scritta si nasconde.
- Le tacche ebano dei modi trovati hanno accanto "modo 1", "modo 2",
  "modo 5" in 12 px, **visive** (`aria-hidden`): la versione accessibile è
  nell'indice.

**Righello, mobile** (orizzontale, 56 px, sotto la tavola):

```
x 20                                      271   283        355
│○ ▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏│    348 Hz        │ 24 px vernice
 spento 60   100       200      300    420      modo 5       │ 11 px tè
```

- Cifre solo a 60, 100, 200, 300, 420 (le altre ogni 50 Hz si
  toccherebbero). Tacche ogni 10 Hz.
- Tacca "la tua voce": segno vernice sopra il binario; la scritta "la tua
  voce" compare al posto del nome del modo quando il cursore è lì.

**Colonna del banco, desktop** (x 1236-1400):

```
y 32   NODI                          ← IM Fell 40 px, ebano (link a #riposo)
       liuteria in Pordenone         ← IM Fell 16 px

       ...vuoto...

y ~480 [ Suono spento ]              ← interruttore testo, 44 px, aria-pressed
       Suono basso. Con le cuffie
       abbassa il volume.            ← 13 px tè
       Rimetti le foglie             ← link-bottone testo, 44 px
       ─────────────────
       I legni          modo 1       ← indice: 5 link, 40 px l'uno;
       Costruire        modo 2          "modo N" 12 px tè a destra
       La voce che vorresti  modo 5
       Riparazioni
       La bottega                    ← y 837 (piede allineato alla tavola)
```

La voce dell'indice del pianerottolo corrente ha `aria-current="location"`
e una sottolineatura ebano 2 px (non solo colore).

**Regione descrittiva** (dentro il riquadro, visivamente nascosta):
`<p aria-live="polite" class="nod-sr">` con le frasi di §3.3.

### 5.1 A riposo (`#riposo`)

**1440 × 900**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│[Torna in Ciceri Lab]                                              NODI       │
│                                                        420┤     liuteria in  │
│                         ╭──────╮                          ┤     Pordenone    │
│                        ╱ · ·  · ╲                         ┤                  │
│                       │ ·  ·  ·  │                        ┤                  │
│                        ╲ ·  )(· ╱                         ┤                  │
│                        │ ·) (·  │  foglie sparse,         ┤                  │
│  Prima di chiudere     ╱ ·  )(  ·╲  ferme                 ┤    Suono spento  │
│  un violino, lo       │ ·  ·   · │                        ┤    nota          │
│  ascoltiamo.   (h1)    ╲  ·   · ╱                         ┤    Rimetti le f. │
│                         ╰──────╯                        60┤    I legni       │
│  Una frase, massimo                                        ○ 0 Hz  Costruire │
│  20 parole.                                                spento  La voce...│
│  [ La voce che vorresti ]                                          Riparazioni│
│                                                                    La bottega│
└──────────────────────────────────────────────────────────────────────────────┘
```

- Margine sinistro **allineato in basso**: il blocco finisce a y = 837
  (piede della tavola). Ordine: `h1` (IM Fell), frase (Spline 17 px),
  bottone "La voce che vorresti" (ebano, testo abete, alto 52 px, largo
  quanto il testo + 32 px). Niente altro: niente numeri, niente seconda
  azione, niente "scorri".
- **Vincolo sul titolo**: massimo due righe a 384 px e a 335 px. Con IM Fell
  a 48 px desktop e 34 px mobile sono circa 40 caratteri. La frase d'esempio
  del creative-director (63 caratteri) va a 3-4 righe: il copywriter la
  accorcia o la divide tra `h1` e frase.
- `h1` unico della pagina. Il marchio NODI in testata è un link, non un
  titolo.
- Il bottone porta a `#voce` (smooth; istantaneo con reduced motion) e mette
  il focus sull'`h2` di `#voce`.

**375 × 667**: impaginazione "ancorata in basso" calcolata una volta al
montaggio e a ogni resize.

```
┌───────────────────────────────────────┐ y 0
│Suono          ╭────╮            NODI  │
│spento        ╱ · · ╲            ≡     │
│             │ · ·  ·│                 │ riquadro = 100svh − 80
│              ╲ )( ·╱                  │   − blocco testo − 76
│              │·) (·│                  │   (qui ≈ 289 px = 43svh)
│              ╱ )(· ╲                  │
│              ╲ · · ╱                  │
│               ╰────╯                  │ y 289
│ ○▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏   0 Hz    │ righello y 297-353
│ spento                       spento   │
│                                       │
│ Prima di chiudere un                  │ h1 34 px, 2 righe, y 369
│ violino, lo ascoltiamo.               │
│ Una frase, massimo 20 parole,         │ frase 16-17 px, 3 righe
│ in tre righe al più.                  │
│              [ La voce che vorresti ] │ bottone allineato a DESTRA,
│[Torna in Ciceri Lab]                  │ fondo ≤ 100svh − 80 px
└───────────────────────────────────────┘ y 667
```

- Regola: il blocco testo è ancorato con il fondo a `100svh − 80 px`; il
  righello sta subito sopra; il riquadro prende l'altezza che resta, tra
  **38svh e 54svh**, con la tavola centrata dentro.
- Il bottone è allineato a destra (x ≥ 244 se la riga cade nella zona
  riservata; con la regola di ancoraggio non ci cade, l'allineamento a destra
  è una seconda garanzia).
- Finestre basse (svh < 600, per esempio Safari su iPhone SE con le barre,
  circa 553 px): il riquadro scende al minimo 38svh e la frase va **sotto** il
  bottone (ordine visivo con `order`, il DOM resta `h1`, frase, bottone: la
  frase non è interattiva, l'ordine di tabulazione non cambia).
- Durante la salita 1 il riquadro cresce da quest'altezza a 54svh, legato
  allo scroll.

### 5.2 I legni (`#legni`, modo 1, 92 Hz)

**1440**

```
margine sinistro (scorre):
┌──────────────────────────────┐
│ I legni                (h2)  │ IM Fell 56 px, ebano
│                              │
│ 92 Hz          circa 70 g    │ cifre in vernice, Spline 32 px, tabellari;
│ la tavola in prova   la tav. │ sotto ognuna 13 px tè che dice cos'è
│                              │
│ Testo, 2-3 paragrafi,        │ Spline 17/1,55, max 60 caratteri:
│ abete di Paneveggio, acero   │ abete rosso di risonanza della Val di
│ dei Balcani, stagionatura,   │ Fiemme, acero per fondo e fasce, anni di
│ taglio di quarto.            │ stagionatura, perché di quarto
│                              │
│ ┌──────────────────────────┐ │
│ │ foto: tavole di abete    │ │ 360 × 270 (4:3), niente cornice,
│ │ accatastate              │ │ niente didascalia poetica
│ └──────────────────────────┘ │
│ Parole del mestiere, una     │ elenco `dl` breve: tavola, fondo, fasce,
│ volta: tavola, fondo, fasce  │ catena, "di quarto" (spiegati una volta)
└──────────────────────────────┘
tavola: la croce della torsione.  righello: 92 Hz, "modo 1".
```

- Le due misure sono **le sole cifre** della schermata, in vernice, con
  "circa" nel testo sotto. Non stanno tra filetti, non sono una riga di
  numeri: sono due, affiancate, con la loro spiegazione.
- L'`h2` ha `id` per `aria-labelledby` della sezione.
- Le parole del mestiere (se il copywriter le vuole qui) sono un `dl` senza
  bordi; su mobile restano `dl` a una colonna.

**375**: stesso ordine in colonna piena; le due cifre affiancate (160 px
l'una); foto larga 335 × 251, `loading="lazy"`; il riquadro scende al 34svh
dopo i primi 40svh di lettura.

### 5.3 Costruire uno strumento (`#costruire`, modo 2, 168 Hz)

**1440**

```
┌──────────────────────────────┐
│ Costruire uno strumento (h2) │
│                              │
│ Frase: quanti strumenti      │ "Ne facciamo sei l'anno." (esempio)
│ l'anno, perché pochi.        │
│                              │
│ Violino                (h3)  │ IM Fell 28 px
│ da 9.500 €     14 mesi       │ vernice: prezzo e attesa
│ Una riga su cosa lo rende    │ tè 17 px
│ suo.                         │
│                              │
│ Viola                  (h3)  │
│ da 11.000 €    16 mesi       │
│ Una riga.                    │
│                              │
│ Violoncello            (h3)  │
│ da 19.000 €    22 mesi       │
│ Una riga.                    │
│                              │
│ Come funziona          (h3)  │ tre frasi in un `ol` senza numeri visibili
│ Vieni a provare. Scegliamo   │ (`list-style: none`, l'ordine è nel
│ la voce. Un acconto e sei in │  testo): prova, voce, acconto
│ lista.                       │
│ ┌──────────────────────────┐ │
│ │ foto: tavola in lavoraz. │ │ 360 × 270
│ └──────────────────────────┘ │
│ La voce che vorresti  →      │ link di testo (NON bottone), stessa
└──────────────────────────────┘ etichetta del CTA, porta a #voce
tavola: la X.  righello: 168 Hz, "modo 2".
```

- **Tre righe per strumento, non tre schede**: niente bordi, niente
  ombre, niente griglia a colonne. Ogni strumento è un blocco `h3` + riga di
  cifre + riga di testo, separato dal successivo solo da spazio (32 px).
- Prezzi e mesi: `font-variant-numeric: tabular-nums`, allineati a sinistra,
  in vernice. Il "da" e "mesi" in tè.
- Il link finale è l'unico richiamo alla prenotazione dentro i contenuti,
  con la stessa etichetta; è un link di testo per non fare concorrenza al
  bottone dell'apertura.

**375**: stesso ordine; cifre di ogni strumento su una riga (prezzo a
sinistra, mesi a destra); foto 335 × 251 lazy.

### 5.4 La voce che vorresti (`#voce`, modo 5), il cuore

**1440**

```
margine sinistro (x 72-456):
┌──────────────────────────────────────┐
│ La voce che vorresti          (h2)   │ IM Fell 56 px
│ Due righe su cosa succede qui.       │
│                                      │
│ Lo strumento                  (legend)│
│ (•) Violino  ( ) Viola  ( ) Violoncello│ radio in IM Fell 24 px, sottolineatura
│                                      │ ebano sul selezionato; 44 px di altezza
│ Sposta la foglia dove senti il tuo   │ invito (V0), 15 px
│ strumento. Se non lo sai, lasciala   │
│ al centro: ne parliamo in bottega.   │
│              pronto                  │
│      ┌─────────────┼─────────────┐   │ piano 320 × 320, fondo abete scuro,
│      │             │             │   │ due assi tè 40%, nessun bordo spesso
│ scuro├─────────────❦─────────────┤brillante
│      │             │             │   │ ❦ = la foglia, 28 px disegnata,
│      │             │             │   │     area di presa 44 × 44
│      └─────────────┼─────────────┘   │
│              morbido                 │
│ Equilibrata: né scura né brillante.  │ frase della zona, aggiornata (15 px)
│ È un modo per parlarne, non una      │ nota onesta, 13 px
│ promessa di laboratorio.             │
│ [🔈 Senti la voce]                   │ bottone di testo con icona (libreria)
│ Suono sintetico d'esempio, per       │ 13 px
│ orientarti. In bottega si prova lo   │
│ strumento vero.                      │
│                                      │
│ Chi sei                     (legend) │
│ Nome                                 │ etichetta sopra
│ [____________________________]       │ 48 px
│ Come ti troviamo: email o telefono,  │ (legend del gruppo)
│ basta uno dei due                    │
│ Email                                │
│ [____________________________]       │
│ Telefono                             │
│ [____________________________]       │
│ Per chi è, che musica suoni          │ facoltativo, dichiarato nell'etichetta
│ (facoltativo)                        │
│ [____________________________]       │
│                                      │
│ Saresti il numero 7 in lista.        │ vernice (solo le cifre e la data in
│ Consegna prevista: primavera 2028.   │ vernice, la frase in tè)
│ [ Mettimi in lista ]                 │ ebano, testo abete, 52 px, largo fisso
│ È un concept: la richiesta non       │ 13 px
│ parte davvero.                       │
└──────────────────────────────────────┘
tavola: l'anello a fVoce.  righello: fVoce, "modo 5"; il cursore segue la foglia.
```

- Ordine di lettura e di tabulazione: strumento → piano (foglia) → "Senti
  la voce" → nome → email → telefono → nota → "Mettimi in lista". L'ordine è
  libero nell'uso (si può scrivere prima e scegliere dopo), nessun passo è
  bloccato da un altro.
- **Piano del suono**: quadrato con quattro parole agli estremi degli assi
  ("scuro" a sinistra, "brillante" a destra, "pronto" in alto, "morbido" in
  basso), Spline 14 px tè. Cinque zone: quattro quadranti e un disco
  centrale "equilibrata" di raggio 18% del lato. Il punto della foglia è
  `(x, y)` in 0-1.
  - `fVoce = round(330 + 36 × x)` Hz (0 → 330, 0,5 → 348, 1 → 366).
  - `y` (pronto in alto) regola la velocità di migrazione delle foglie e
    l'attacco della nota d'esempio.
  - Toccare un punto qualsiasi del piano sposta lì la foglia; trascinare la
    foglia la sposta; la frase della zona si aggiorna al rilascio (durante il
    trascinamento solo il testo visivo, non l'annuncio).
- **Lista d'attesa**: frase fissa per strumento (esempio: violino 7,
  primavera 2028; viola 4, inverno 2027; violoncello 3, autunno 2028). Cambia
  subito quando cambia lo strumento; nessun contatore che si muove da solo.
- Il bottone di invio è largo come la sua etichetta più lunga ("Ti mettiamo
  in lista"), così in V6 non cambia larghezza.

**375** (riquadro al 34svh: tavola 227 × 133 con l'anello visibile; righello
sotto; area di lettura circa 384 px):

```
┌───────────────────────────────────────┐
│Suono        ╭──╮               NODI   │ riquadro 34svh
│spento      │ ◯  │              ≡      │ anello visibile
│             ╰──╯                      │
│ ○▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏●▏▏▏  352 Hz   │
│                              modo 5   │
├───────────────────────────────────────┤
│ La voce che vorresti           (h2)   │
│ Lo strumento                          │
│ (•) Violino                           │ radio uno per riga, 44 px
│ ( ) Viola                             │
│ ( ) Violoncello                       │
│ Sposta la foglia dove senti...        │
│               pronto                  │
│ ┌──────────────────┼───────────────┐  │ piano largo quanto la colonna
│ │                  │               │  │ (≈ 300 × 300, centrato)
│ scuro──────────────❦──────brillante│  │
│ │                  │               │  │
│ └──────────────────┼───────────────┘  │
│              morbido                  │
│ Frase della zona.                     │
│ [🔈 Senti la voce]                    │
│ ...campi uno per riga...              │ type=email / type=tel, autocomplete
│ Saresti il numero 7 in lista...       │
│ [      Mettimi in lista      ]        │ largo 335 px; quando la riga del
│                                       │ bottone sarebbe nella zona riservata
│ (72 px liberi)                        │ il testo scorre, non è fisso: basta
└───────────────────────────────────────┘ che non ci sia un fisso sopra
```

- Il bottone di invio è in flusso: può passare sotto il bottone di ritorno
  scorrendo, ma a scroll fermo dopo il focus (`scroll-margin-bottom: 88px`)
  non ci resta mai sotto. Sotto l'invio 72 px liberi prima della salita 4.
- Sul piano: `touch-action: pan-y` sul quadrato (la pagina scorre se il
  pollice scivola in verticale fuori dalla foglia, un tocco sposta la foglia),
  `touch-action: none` **solo sulla foglia** mentre è afferrata: lo scroll è
  bloccato solo dentro il piano durante il trascinamento.
- Campi: `autocomplete="name"`, `"email"`, `"tel"`; `inputmode` giusti;
  font 17 px (niente zoom automatico di iOS).

### 5.5 Riparazioni e restauri (`#riparazioni`, tavola ferma)

**1440**

```
┌──────────────────────────────────────┐
│ Riparazioni e restauri        (h2)   │
│ Una frase: l'altoparlante è spento,  │
│ le foglie restano dove erano.        │
│                                      │
│ Cosa ripariamo                (h3)   │ `ul` senza pallini, una riga per voce:
│ Ponticello nuovo        da 60 €      │ nome in tè, prezzo in vernice
│ Anima riposizionata     da 40 €      │ ("anima" solo qui, come voce di elenco)
│ Crepe della tavola      da 180 €     │
│ Tasto spianato          da 90 €      │
│ Cavigliere rotto        da 250 €     │
│                                      │
│ Il sabato di bottega          (h3)   │
│ Il sabato mattina la bottega è       │
│ aperta: porti lo strumento e lo      │
│ guardiamo insieme.                   │
│                                      │
│ Scegli un sabato            (legend) │ V: "Scegli un sabato" se nessuno
│ ( ) sabato 3 ottobre                 │ radio, 44 px, testo intero della
│ ( ) sabato 10 ottobre                │ data in parole; sotto ognuno
│ ( ) sabato 17 ottobre                │ "9:00-12:30" in 13 px tè
│ ( ) sabato 24 ottobre                │
│ Lo strumento e il problema           │
│ [____________________________]       │ una riga
│ Nome                                 │
│ [____________________________]       │
│ Telefono                             │
│ [____________________________]       │
│ [ Ci vediamo sabato ]                │ ebano, stesso stile dell'invio voce
└──────────────────────────────────────┘
tavola: l'anello resta (o l'ultima figura). righello: "0 Hz", "spento".
```

- Sabati: i prossimi quattro a partire dalla data vera (fuso Europe/Rome),
  saltando i sabati festivi (elenco fisso nei dati: 1 novembre, 8 dicembre,
  25 e 26 dicembre, 25 aprile, 2 giugno, 15 agosto quando cadono di sabato) e
  il sabato di oggi dopo le 12:30. Se oggi è sabato prima delle 12:30, il
  primo è "oggi, sabato 3 ottobre".
- Radio in colonna su desktop (lettura rapida), in colonna anche su mobile.
- **Nessun orario a slot**, nessun calendario a griglia.

**375**: stesso ordine; elenco delle riparazioni con prezzo a destra sulla
stessa riga (se non ci sta, sotto il nome); invio largo 335 px.

### 5.6 La bottega (`#bottega`)

**1440**

```
┌──────────────────────────────────────┐
│ La bottega                    (h2)   │
│ Una frase su chi lavora in bottega   │ due nomi di persona (brand-strategist),
│ (senza ritratti).                    │ nessun "allievo di" reali
│ ┌──────────────────────────┐         │
│ │ foto: banco con forme e  │         │ 360 × 270, solo se il photo-editor
│ │ strumenti in bianco      │         │ la trova giusta; altrimenti niente
│ └──────────────────────────┘         │
│ Via di esempio, Pordenone            │ `address`
│ Martedì-venerdì 9:00-12:30,          │ orari in `dl` (giorno / fascia)
│ 15:00-19:00                          │
│ Sabato 9:00-12:30, bottega aperta    │
│ Domenica e lunedì chiuso             │
│ Chiama   Scrivi   Apri in Maps       │ tre link di testo 44 px; nessun
└──────────────────────────────────────┘ numero finto in vista
tavola: ferma.  righello: spento.
```

- "Chiama" (`tel:` di esempio), "Scrivi" (`mailto:` di esempio), "Apri in
  Maps" (URL vero di Google Maps sull'indirizzo di esempio, `target="_blank"`
  con `rel="noopener"` e "si apre in una nuova scheda" nel nome accessibile).
- Niente mappa disegnata, niente mappa incorporata.

**375**: colonna piena, riquadro al 34svh, stessi elementi; i tre link su una
riga se ci stanno (335 px), altrimenti a capo.

### 5.7 Piede (`#piede`, `<footer>`)

```
1440 (margine sinistro) e 375 (colonna):
Un concept di CiceriLab.
NODI è un'attività inventata: nomi, indirizzo, prezzi e tempi sono esempi.
Le figure sono calcolate da una tavola di violino di esempio.
Foto: Nome Cognome, Nome Cognome (Unsplash).        ← link agli autori
Dimentica le mie prove                               ← bottone testo
(padding-bottom 88 px + safe area su mobile)
```

- **Nessun link "torna al Concept Lab"**: il creative-director lo mette nel
  piede, ma `integrazione-sito.md` (che prevale) dice che il concept non
  crea un proprio link di ritorno: l'unico è il `ConceptBackButton`. "Un
  concept di CiceriLab" è testo, non un link.
- Niente indice ripetuto nel piede (c'è già l'indice sempre raggiungibile).

---

## 6. Stati della prenotazione

Tutti gli stati, con cosa si vede, cosa si annuncia e dove va il focus.
L'errore non si dice mai solo col colore: testo sotto il campo e segno vernice
a sinistra del messaggio. Le foglie non reagiscono mai agli errori.

### 6.1 "La voce che vorresti" (`#voce`)

| # | Stato | Quando | Cosa si vede | Annuncio (`aria-live="polite"` del form) | Focus |
|---|---|---|---|---|---|
| V0 | **Prima del montaggio** | HTML prerender, prima dell'idratazione | tutto il form in HTML con la foglia disegnata al centro, radio "Violino" selezionato, frase della zona "equilibrata", lista "numero 7"; controlli `disabled` finché React non monta; sotto l'invio "Oppure chiamaci" (`tel:`) | nessuno | nessuno |
| V1 | **Vuoto** (all'arrivo) | montato | foglia al centro, violino, campi vuoti con etichette, invito sopra il piano, anello a 348 Hz. **Mai un piano grigio e vuoto** | nessuno | invariato |
| V2 | **Strumento cambiato** | radio | frase della lista aggiornata (numero e consegna), nota d'esempio cambia (La 440 / Do 131 / Do 65) | "Viola: saresti il numero 4, consegna prevista inverno 2027." | invariato |
| V3 | **Voce in scelta** | trascinamento o frecce | foglia che si sposta; frase della zona aggiornata a vista; `fVoce` e righello seguono; l'anello si rifà | nessuno durante il gesto; al rilascio o 600 ms dopo l'ultima freccia: "Voce scura e pronta, 336 hertz." | resta sulla foglia |
| V4 | **Nota d'esempio** | "Senti la voce" | il bottone diventa "Ferma la nota" per 1,8 s, poi torna; se "Suono" è acceso, la sinusoide del righello si abbassa a zero durante la nota | nessuno (il cambio di etichetta basta) | resta sul bottone |
| V5 | **Errore** | all'uscita da un campo e al tentativo di invio | sotto il campo: "Serve un nome per sapere chi cercare." / sotto il gruppo: "Scrivi un'email o un numero di telefono, ci basta uno dei due." / "Questa email non sembra completa: manca la chiocciola?" / "Questo numero sembra corto: controlla le cifre." Il messaggio sparisce appena il campo diventa valido (all'input, non a ogni tasto prima del primo errore) | all'invio: "Due cose da sistemare: nome, email o telefono." | all'invio: sul **primo** campo con errore |
| V6 | **Invio in corso** | invio valido | bottone "Ti mettiamo in lista" (stessa larghezza), `aria-disabled="true"` (resta focalizzabile), form `aria-busy="true"`, campi `readonly`; sulla tavola l'anello si ricompone lentamente; **niente spinner** | "Ti mettiamo in lista." | invariato |
| V7 | **Successo** | risposta simulata (1.200 ms) | il form lascia il posto a tre righe: "Sei in lista, al numero 7. Hai chiesto un violino dalla voce scura e pronta. Ti scriviamo entro due giorni per fissare una prova in bottega." + link "Cambia la voce" + in piccolo "Questo è un concept di CiceriLab: la richiesta non è stata inviata a nessuno." L'anello resta fermo a `fVoce`; sul righello la tacca permanente vernice "la tua voce, 336 Hz"; salvataggio `nodi:voce` | le tre righe | sul paragrafo del successo (`tabindex="-1"`) |
| V8 | **Invio fallito** | `?invio=errore` oppure `navigator.onLine === false` | sotto il bottone: "Non è partita. Riprova tra poco o chiamaci al numero della bottega, rispondiamo dal martedì al sabato." + link "Chiama"; bottone torna "Mettimi in lista"; campi conservati e modificabili | la frase | sul bottone "Mettimi in lista" |
| V9 | **Cambia la voce** | link in V7 | il form torna con **tutti i dati conservati** (in memoria), foglia dov'era; la frase della lista dice "Sei già in lista al numero 7: aggiorniamo la tua richiesta"; il bottone resta "Mettimi in lista" | "Puoi cambiare la voce. I tuoi dati sono ancora qui." | sul radio dello strumento selezionato |
| V10 | **Ritorno dopo un successo** (ricarica) | `nodi:voce` presente | come V7 (tre righe ricostruite con strumento, zona, numero) ma senza dati personali; "Cambia la voce" riapre il form con strumento e foglia salvati e campi vuoti | nessuno | invariato |
| V11 | **Senza memoria** | `localStorage` bloccato | tutto funziona; dopo la ricarica si riparte da V1; nessun messaggio | nessuno | invariato |
| V12 | **Senza WebGL** | fallback | tutto uguale; al posto dell'anello che si rifà, l'immagine ferma del modo 5 (non cambia larghezza con `fVoce`); la frase della zona e il righello bastano | come sopra | come sopra |
| V13 | **Senza audio** | Web Audio assente o bloccato | "Senti la voce" è sostituito dalla frase "Qui non possiamo farti sentire la nota: in bottega si prova lo strumento vero." | nessuno | invariato |

Regole di validazione:
- Nome: obbligatorio, almeno 2 caratteri dopo il trim.
- Email **o** telefono: almeno uno. Se l'email è scritta deve avere `@` e un
  punto dopo; se il telefono è scritto deve avere almeno 6 cifre (spazi, `+`,
  `/`, `.` ammessi). Se uno dei due è valido e l'altro è scritto male, vale
  l'errore sul secondo (non si manda un dato sbagliato).
- Nota: facoltativa, massimo 140 caratteri, contatore visibile solo sopra i
  120 ("Ancora 20 caratteri").
- La voce non è mai un errore: la foglia al centro è una risposta.

Evento: al passaggio V5 → V6 (invio valido), una volta per invio:
`track("demo_prenotazione", { concept: 19, tipo: "strumento", strumento:
"violino", voce: "scura-pronta", hz: 336, contatto: "email" | "telefono" |
"entrambi", metodo: "trascina" | "tocco" | "tastiera" | "nessuno" })`.

### 6.2 Il sabato di bottega (`#riparazioni`)

| # | Stato | Quando | Cosa si vede | Annuncio | Focus |
|---|---|---|---|---|---|
| R0 | prima del montaggio | prerender | le quattro date calcolate **alla build** non vanno bene (sarebbero vecchie): al loro posto la frase "Il sabato mattina la bottega è aperta, dalle 9 alle 12:30." e i controlli arrivano al montaggio, in uno spazio riservato della loro altezza (niente CLS) | nessuno | nessuno |
| R1 | vuoto | montato | quattro sabati, nessuno scelto; sopra "Scegli un sabato"; campi vuoti | nessuno | invariato |
| R2 | sabato scelto | radio | il sabato con sottolineatura ebano e "9:00-12:30" | nessuno (il radio si annuncia da sé) | invariato |
| R3 | errore | uscita dal campo e invio | "Scegli un sabato." (sotto il gruppo) / "Scrivi lo strumento e cosa non va, basta una riga." / "Serve un nome." / "Serve un numero di telefono per richiamarti." | all'invio: elenco breve degli errori | primo errore (il primo radio se manca il sabato) |
| R4 | invio in corso | valido | bottone "Un momento" (stessa larghezza), `aria-disabled`, `aria-busy` | "Un momento." | invariato |
| R5 | fallito | `?invio=errore` o offline | "Non è partita. Riprova tra poco o chiamaci." + "Chiama"; dati conservati | la frase | sul bottone |
| R6 | successo | risposta simulata | al posto del form una frase: "Ti aspettiamo sabato 10 ottobre tra le 9 e mezzogiorno e mezzo. Porta anche l'archetto." + "È un concept: la richiesta non è partita." + link "Scegli un altro sabato" | la frase | sulla frase (`tabindex="-1"`) |
| R7 | altro sabato | link in R6 | form di nuovo, dati conservati, nessun sabato scelto | "Scegli un altro sabato." | sul primo radio |
| R8 | ritorno | `nodi:sabato` nel futuro | sopra il form: "Ti aspettiamo sabato 10 ottobre." e il form resta usabile; se la data è passata, la chiave si cancella | nessuno | invariato |

Evento: all'invio valido, una volta:
`track("demo_prenotazione", { concept: 19, tipo: "riparazione", sabato:
"2026-10-10" })`.

### 6.3 Regole comuni ai due form

- Invio **simulato**, nessun backend, nessun dato inviato né salvato oltre a
  quanto detto in §1.2. Ritardo 1.200 ms (voce) e 900 ms (sabato).
- I dati scritti in un form restano in memoria finché la pagina è aperta,
  anche se si va altrove con l'indice e si torna.
- Nessun bottone disabilitato senza motivo: l'invio è sempre attivo e dice
  cosa manca.
- Nessun placeholder come etichetta; i formati d'esempio (se servono) stanno
  sotto il campo, non dentro.
- Ai tentativi ripetuti con `?invio=errore` il messaggio non si accumula: è
  uno solo, sostituito.

---

## 7. Accessibilità (per ogni interazione)

### 7.1 Base di pagina

- `lang="it"` sul wrapper. Punti di riferimento: `header` (marchio, menu),
  `nav aria-label="Contenuti"` (indice), `section aria-label="Prova della
  tavola"` (righello e controlli), `main` (le sette schermate tranne il
  piede), `footer`. Un solo `h1` (`#riposo`), un `h2` per schermata, `h3`
  per i blocchi interni (strumenti, "Cosa ripariamo", "Il sabato di
  bottega").
- Ordine del DOM: link di salto → header → nav → banco di prova → main →
  footer. Su desktop visivamente il banco e l'indice sono a destra: l'ordine
  di tabulazione li mette prima del contenuto, come una barra di strumenti.
- Il DOM è la fonte: ogni frequenza, figura, prezzo e data esiste come
  testo. Il canvas è `aria-hidden="true"` e non è focalizzabile.
- Focus visibile: anello 2 px ebano a 2 px di distanza (sul bottone ebano:
  anello ebano esterno a 2 px, visibile perché c'è abete in mezzo).
- Obiettivi di tocco ≥ 44 × 44 px ovunque: cursore del righello, foglia,
  radio, sabati, link dell'indice, "Suono", "Rimetti le foglie", "Chiama",
  "Scrivi", "Apri in Maps".
- Nessuna informazione solo nel colore: la vernice è sempre accompagnata da
  parole (Hz, €, mesi, "numero"); il selezionato ha la sottolineatura; gli
  errori hanno testo e segno.
- Niente lampeggi: foglie e tavola non cambiano mai colore o luminosità;
  tremolio con rumore liscio al massimo 3 cambi al secondo e 2 px; nessun
  cambio di colore di grandi superfici (non ce ne sono).

### 7.2 Scroll (la frequenza sale)

- Scroll nativo: nessuno scroll-jacking, nessuno smorzamento globale, nessun
  Lenis obbligatorio. Frecce, Spazio, Pagina giù, rotella funzionano come
  sempre.
- Un solo listener di scroll passivo; il ticker legge la posizione una volta
  per frame.
- Annunci solo all'ingresso in un modo (§3.3 T4) e allo spegnimento (T8),
  mai le frequenze intermedie.

### 7.3 Righello (`role="slider"`)

- Elemento: il cursore, `tabindex="0"`, `role="slider"`, `aria-label="Frequenza
  dell'altoparlante"`, `aria-orientation` verticale (desktop) o orizzontale
  (mobile), `aria-valuemin="0"`, `aria-valuemax="420"`, `aria-valuenow` =
  frequenza intera.
- Valori ammessi: 0 ("spento") e 60-420. `aria-valuetext` parlante:
  "spento", "150 hertz", "168 hertz, modo 2, Costruire uno strumento",
  "352 hertz, modo 5, la tua voce".
- Tasti: Freccia su/destra +1 Hz; giù/sinistra −1 Hz; Pagina su +10 Hz,
  Pagina giù −10 Hz; Inizio = spento (torna a `#riposo`); Fine = 420. Da 0,
  freccia su va a 60; da 60, freccia giù va a 0. Ogni tasto scrive lo scroll
  (§3.2).
- Nella coda (`#riparazioni` in giù) il valore è "spento": la prima freccia
  su porta a 420 (fine della salita 4, cioè sopra, subito dopo il form della
  voce); Inizio porta a `#riposo`. L'annuncio in quel caso: "Torni alla
  prova: 420 hertz."
- Trascinamento con puntatore: pointer capture sul cursore; clic sul binario
  sposta il cursore lì (come un range nativo). Magnetismo solo al rilascio
  (§3.2), mai con la tastiera (con la tastiera il passo è esatto).
- Le frecce dentro il righello non scorrono la pagina due volte:
  `preventDefault` sui tasti gestiti.
- Con il lettore di schermo in modalità lettura il righello si usa con i
  tasti del lettore per gli slider; in alternativa l'indice porta agli stessi
  punti.

### 7.4 Indice e scorciatoie dei modi

- Lista di cinque link veri (`<a href="#...">`), nomi completi: "I legni,
  modo 1", "Costruire uno strumento, modo 2", "La voce che vorresti, modo 5",
  "Riparazioni e restauri", "La bottega". Il "modo N" visivo è `aria-hidden`
  perché è già nel nome.
- `aria-current="location"` sulla voce del pianerottolo corrente (nessuna
  durante le salite: resta l'ultima raggiunta; nessuna in `#riposo`).
- Attivare un link = scroll al pianerottolo + focus all'`h2` (§2.7). È anche
  la scorciatoia verso il modo: il righello si aggiorna da sé.

### 7.5 Menu a comparsa (sotto i 1200 px)

- Disclosure: `button aria-expanded aria-controls`, pannello non modale,
  nessuna trappola del focus.
- All'apertura il focus va alla prima voce; Tab e Maiusc+Tab scorrono le voci;
  Esc chiude e riporta il focus al marchio; un Tab oltre l'ultima voce chiude
  il pannello e prosegue nel documento.
- Il pannello non copre mai il bottone di ritorno.

### 7.6 Interruttore "Suono"

- `button aria-pressed="false"`, etichetta visibile "Suono spento" / "Suono
  acceso" (il nome accessibile resta "Suono", lo stato lo dà `aria-pressed`:
  nel DOM il testo è "Suono" + `<span aria-hidden>spento</span>`, così il
  lettore non dice "Suono spento, premuto").
- Nessun `AudioContext` prima del primo tocco. Acceso: sinusoide alla
  frequenza del righello, guadagno massimo 0,04, attacco e rilascio 150-200
  ms, −50% fuori risonanza, zero a 0 Hz.
- Si spegne da solo (con `aria-pressed` che torna `false` e la scritta che
  torna "spento"): scheda nascosta, `f = 0` (apertura o coda), 20 s senza
  cambi di frequenza (dissolvenza 1 s). Nessun annuncio per lo spegnimento
  automatico: lo stato visibile e `aria-pressed` bastano; il suono che smette
  è già il segnale.
- La nota "Suono basso. Con le cuffie abbassa il volume." è collegata con
  `aria-describedby`.
- Quando è acceso l'interruttore è **sempre visibile** (desktop: colonna del
  banco o sotto il marchio; mobile: angolo del riquadro, anche al 34svh).

### 7.7 "Rimetti le foglie"

- `button` con aspetto di link. Esegue T9. Annuncio "Foglie rimesse sulla
  tavola." Focus invariato. Con reduced motion: dissolvenza incrociata di
  400 ms tra la disposizione corrente e quella finale (le foglie non
  "volano").
- In `#riposo` e nella coda: le foglie si spargono e restano sparse
  (altoparlante spento: nessuna figura), ed è giusto così.

### 7.8 Piano del suono

- La **foglia** è l'elemento focalizzabile del piano: `tabindex="0"`,
  `role="application"` (così i lettori di schermo lasciano passare le
  frecce), `aria-roledescription="piano del suono"`, `aria-label="Foglia
  della voce"`, `aria-describedby` → frase della zona e istruzioni ("Frecce
  sinistra e destra: da scuro a brillante. Su e giù: da morbido a pronto.").
- Tasti sulla foglia: frecce = passo del 5% (21 posizioni per asse);
  Maiusc+frecce = 25%; Inizio = centro ("equilibrata").
- **Alternativa**: due `input type="range"` veri, "Da scuro a brillante" e
  "Da morbido a pronto" (0-100, passo 5, `aria-valuetext` in parole: "un po'
  scura", "equilibrata", "molto brillante"), che muovono la stessa foglia.
  Stanno subito dopo il piano, **visivamente nascosti finché uno dei due non
  ha il focus**; quando hanno il focus compaiono sotto il piano come due
  righelli sottili, così chi usa la tastiera vede cosa sta cambiando. Sono la
  strada per chi usa il lettore di schermo in modalità lettura.
- Puntatore: tocco sul piano = foglia lì; trascinamento della foglia con
  pointer capture. Il gesto non è mai l'unico modo.
- Nessun suono parte al trascinamento o alla tastiera.
- La frase della zona è testo visibile; l'annuncio arriva al rilascio (V3).

### 7.9 Radio, campi, invio

- Strumento: `fieldset` + `legend` "Lo strumento", tre `input type="radio"`
  nativi (frecce per cambiare, un solo Tab). Stessa cosa per i sabati.
- Campi con `label` sopra, `aria-describedby` verso formato ed errore,
  `aria-invalid="true"` in errore; il gruppo email/telefono è un `fieldset`
  con `legend` "Come ti troviamo: email o telefono, basta uno dei due" e
  l'errore di gruppo è collegato a entrambi i campi.
- Messaggi di errore in un contenitore già presente nel DOM (vuoto) per non
  spostare il layout più del necessario; la riga d'errore riserva la sua
  altezza solo quando compare (niente buchi vuoti fissi).
- "Senti la voce": `button`, nome "Senti la voce di esempio"; durante la nota
  "Ferma la nota". Con Web Audio assente: V13.
- Invio: `button type="submit"`; in corso `aria-disabled` (non `disabled`,
  così il focus non si perde); doppio invio ignorato.
- Regione `aria-live="polite"` **una per form**, separata da quella della
  tavola, così gli annunci non si coprono.

### 7.10 Reduced motion (`prefers-reduced-motion: reduce`)

- Nessuna caduta iniziale: le foglie sono già sparse.
- Nessuna migrazione: al pianerottolo le foglie sono già nella figura
  (posizioni finali precalcolate); il passaggio tra due figure è una
  dissolvenza incrociata di 400 ms tra due disposizioni ferme. Nessun
  tremolio.
- Nelle salite la tavola mostra l'ultima figura ferma (fuori risonanza non
  cambia niente, come nella fisica).
- Il riquadro mobile **non** cambia altezza con lo scroll: resta al 44svh
  fisso (compromesso tra 54 e 34), senza transizioni.
- Scroll dei link e del bottone dell'apertura senza `smooth`.
- Piano del suono: l'anello cambia con dissolvenza di 400 ms tra due
  disposizioni, non si "rifà".
- Invio in corso: l'anello non si ricompone, il bottone cambia etichetta e
  basta.
- Il suono resta disponibile e spento di default.
- Il testo non si muove mai (già così anche senza la preferenza), la
  dissolvenza di 200 ms del margine di lettura al salto dal righello diventa
  un cambio netto.

### 7.11 Zoom 400% e finestre basse (reflow)

A 1280 × 1024 con zoom 400% la finestra è 320 × 256 px CSS; a 1440 × 900
è 360 × 225. Un riquadro fisso non ci sta.

- Larghezza < 1024: layout mobile (e sotto 640 il bottone di ritorno va in
  basso a sinistra).
- **Altezza < 480 px CSS** (zoom forte, telefono in orizzontale, finestra
  bassa): **modalità bassa**.
  - Riquadro e righello **non fissi**: stanno in flusso in cima a `#riposo`
    (tavola alta `max(60svh, 240px)`, righello orizzontale sotto).
    L'interruttore "Suono" e il marchio sono in flusso nella testata.
  - Ogni schermata dei modi mostra all'inizio la **sua figura ferma**
    (immagine del webgl-artist, larga 160 px, a sinistra del primo paragrafo
    se c'è spazio, sopra altrimenti) con alt: "Le foglie formano una X
    all'altezza delle effe".
  - `#voce`: sopra il piano la figura ferma dell'anello; la frequenza della
    voce è scritta nella frase della zona ("scura e pronta, circa 336 Hz").
  - Nessun elemento fisso, quindi nessun focus coperto.
  - Il righello resta usabile quando è in vista; il contenuto non dipende da
    lui.
- Un telefono in orizzontale (per esempio 844 × 390) ha altezza sotto 480
  e va quindi in modalità bassa. Con larghezza tra 640 e 1023 e altezza tra
  480 e 640 (tablet piccoli in orizzontale, finestre basse) il layout è
  **affiancato**: tavola fissa
  a sinistra alta 88svh, righello verticale accanto, testo a destra in colonna
  di `min(420px, 50vw)`; il bottone di ritorno è in alto a sinistra sopra la
  tavola (zona 260 × 72 riservata: la tavola comincia a y 80).
- Testo ingrandibile al 200% senza perdita; nessun testo in immagine; nessun
  contenitore ad altezza fissa con testo dentro (le altezze delle sezioni
  sono minimi, mai massimi).
- Nessuno scroll orizzontale a 320 px CSS: il piano del suono è
  `min(300px, 100%)`, i prezzi vanno a capo, i tre link della bottega vanno a
  capo.

### 7.12 Senza WebGL e prima del montaggio

- Senza WebGL (contesto non disponibile o perso senza ripristino): stessa
  pagina, stesso righello, stesso indice. Al posto del canvas quattro
  immagini ferme (a riposo, modo 1, modo 2, modo 5) generate dalla stessa
  simulazione, cambiate con dissolvenza di 300 ms quando si entra in
  risonanza (cambio netto con reduced motion). Nessun messaggio "il tuo
  browser non supporta".
- "Rimetti le foglie" senza WebGL: torna all'immagine a riposo se
  l'altoparlante è spento, altrimenti non fa niente di visibile e quindi è
  nascosto.
- Prima del montaggio (prerender): l'immagine "a riposo" è l'LCP, con
  dimensioni fissate (niente CLS); il canvas si sovrappone solo quando ha
  davvero disegnato il primo frame.

### 7.13 Uso con il lettore di schermo, riassunto

Un utente che non vede la tavola deve poter: sentire cosa succede sulla
tavola (annunci T4/T8), capire la frequenza (valuetext), leggere tutti i
contenuti in ordine senza toccare il righello, scegliere la voce con due
slider parlanti, inviare con errori chiari, sapere di essere in lista.
L'accessibility-auditor lo prova con NVDA o Orca e con VoiceOver su WebKit.

---

## 8. Conversione

**Un solo intento, una sola etichetta: "La voce che vorresti"** (→ `#voce`).

| Posizione | Forma | Note |
|---|---|---|
| Apertura (`#riposo`) | bottone ebano, l'unico della schermata | primo richiamo, sempre sopra la piega (§5.1) |
| Indice (desktop) / menu (mobile) | voce di elenco con la stessa etichetta | sempre raggiungibile |
| Fine di `#costruire` | link di testo con la stessa etichetta | il momento in cui il prezzo è chiaro |
| Link di salto | "Vai alla voce che vorresti" | per tastiera e lettore |

Nessun richiamo in `#legni` (lì si costruisce fiducia), nessuna barra fissa
"prenota", nessun popup.

**Conversione principale**: invio della voce ("Mettimi in lista", V7).

**Conversione secondaria**: il sabato di bottega ("Ci vediamo sabato", R6).
Non ha un richiamo in testata: chi ha uno strumento rotto lo cerca con
l'indice ("Riparazioni") o arriva da `#riparazioni`.

**Conversioni alternative**: "Chiama" e "Scrivi" (bottega, V0, V8, R5),
"Apri in Maps" (bottega).

**Micro-conversioni**: il `TrackEvent` del sito è chiuso. Si tracciano solo:
- `track("apri_concept", { concept: 19 })` al montaggio, una volta;
- `track("demo_prenotazione", …)` con `tipo: "strumento"` (§6.1) o `tipo:
  "riparazione"` (§6.2), all'invio valido.
Nessun evento per suono, righello, modi trovati: se servono, vanno come
parametri dell'invio (`modiTrovati: 3`, `suono: true`), non come eventi.

**Ganci che convertono**:
- il prezzo "da" e il tempo di attesa stanno **prima** del form, senza
  lasciare dati;
- la foglia al centro è già una risposta: nessuno si blocca sulla scelta;
- il numero in lista è concreto e fisso ("numero 7"), non un contatore;
- basta un recapito, email **o** telefono;
- la conferma dice cosa succede dopo ("ti scriviamo entro due giorni").

**Per Luca (meta-conversione)**: un liutaio che guarda deve pensare "questa è
la mia prova delle tavole, e il sito la fa vedere a chi non l'ha mai vista".
Il piede firma "Un concept di CiceriLab".

---

## 9. Consegne ad altri agent

- **tech-architect / scaffold**: frequenza derivata dallo scroll con la
  linea di lettura e le salite (§3.2), inverso per righello e tastiera,
  magnetismo al rilascio, un solo `scrollTo` per frame; variabile
  `--nod-cornice` scritta dal ticker (mobile); modalità "bassa" sotto 480 px
  di altezza e "affiancata" (§7.11); parametri URL (§1.1); `localStorage` in
  try/catch con le tre chiavi (§1.2); invio simulato con `?invio=errore` e
  offline; sabati calcolati al montaggio in Europe/Rome con festivi; due
  regioni `aria-live` per i form e una per la tavola.
- **webgl-artist / shader-engineer**: la tavola si disegna dentro il
  riquadro con le altezze di §2.3-2.5 (e 60svh in modalità bassa), centrata;
  gli angoli alti del riquadro mobile restano liberi per interruttore e
  marchio; `fVoce` 330-366 Hz cambia il raggio dell'anello; velocità di
  migrazione da `y` del piano; immagini ferme a riposo e dei modi 1, 2, 5 (e
  due varianti dell'anello a 330 e 366 per il fallback, se il budget lo
  permette) per poster, fallback e modalità bassa.
- **motion-designer**: oltre ai movimenti del creative-director, qui ne
  aggiungo solo due già previsti: crescita del riquadro mobile durante la
  salita 1 (da quello dell'apertura a 54svh) e la dissolvenza di 200 ms del
  margine di lettura al salto dal righello. Versioni reduced motion in §7.10.
- **interaction-designer**: trascinamento del cursore (pointer capture,
  `touch-action: pan-y` sul binario mobile), magnetismo al rilascio, piano
  del suono (tocco, trascinamento, tasti, due range che compaiono al focus),
  "Rimetti le foglie", menu a comparsa.
- **copywriter**: `h1` di massimo 40 caratteri (§5.1); frasi T4 per i tre
  modi e T8; cinque frasi delle zone della voce e `aria-valuetext` dei due
  range; tutte le frasi di V0-V13 e R0-R8; `aria-valuetext` del righello;
  nomi completi dell'indice; didascalie delle foto; alt delle figure ferme.
- **brand-strategist**: numeri in lista e consegne per strumento, prezzi "da"
  di costruzione e riparazioni, orari, nomi in bottega (qui sono solo di
  lunghezza).
- **accessibility-auditor**: §7 è la checklist; in più: focus mai sotto il
  riquadro fisso (mobile) o il bottone di ritorno; annunci non ripetuti
  durante il trascinamento.
- **responsive-tester**: controlli obbligatori: a 375 × 667 "La voce che
  vorresti" visibile al primo colpo e fuori dalla zona del bottone di
  ritorno; a 360 px interruttore e marchio fuori dal contorno della tavola;
  a 2560 la tavola ≤ 1000 px; a 1024 il margine di lettura ≥ 300 px senza
  toccare la tavola; nessun controllo fisso sopra "Mettimi in lista"; zoom
  400% in modalità bassa senza elementi fissi.

---

## 10. Sezioni da costruire

Una per section-builder, in kebab-case. I nomi coincidono con le schermate
del creative-director (4.2); gli elementi fissi condivisi (righello e
testata) hanno due builder dedicati perché servono a tutte le schermate. Le
salite (`nod-salita`) sono semplici spacer e le crea lo scaffold; il canvas è
dello shader-engineer.

1. **`righello`** · Banco di prova fisso: righello verticale (desktop) e
   orizzontale (mobile) con scala logaritmica, fermo "spento", tacche, cifre,
   valore in vernice, nome del modo, tacche "trovato" e "la tua voce";
   `role="slider"` con tastiera e valuetext; trascinamento con scrittura dello
   scroll e magnetismo; interruttore "Suono" con la nota; "Rimetti le
   foglie"; regione `aria-live` della tavola con le frasi T4/T8/T9. §3.2,
   §3.3, §5.0, §7.3, §7.6, §7.7.
2. **`testata`** · Link di salto, marchio a cartiglio (link a `#riposo`,
   bottone del menu sotto i 1200 px), indice a cinque voci con
   `aria-current` (colonna del banco su desktop), menu a comparsa non modale,
   geometria della colonna del banco e degli angoli del riquadro mobile.
   §2, §7.4, §7.5.
3. **`riposo`** · `#riposo`: `h1`, frase, unico bottone "La voce che
   vorresti", impaginazione ancorata in basso (desktop e mobile, calcolo
   dell'altezza del riquadro dell'apertura, regola sotto 600 svh), poster
   della tavola a riposo come LCP. §5.1.
4. **`legni`** · `#legni`: `h2`, due misure in vernice con spiegazione,
   testo, foto 1, `dl` delle parole del mestiere. §5.2.
5. **`costruire`** · `#costruire`: frase, tre strumenti (`h3` + cifre +
   riga), "Come funziona", foto 2, link "La voce che vorresti". §5.3.
6. **`voce`** · `#voce`, il cuore: radio dello strumento, piano del suono
   (foglia, tocco, trascinamento, tasti, due range al focus, cinque zone,
   `fVoce`), "Senti la voce" (Web Audio solo al tocco), campi, lista
   d'attesa, invio simulato, **tutti gli stati V0-V13**, tacca "la tua voce",
   `track("demo_prenotazione")`. §5.4, §6.1, §6.3, §7.8, §7.9.
7. **`riparazioni`** · `#riparazioni`: elenco delle riparazioni con prezzi
   "da", il sabato di bottega (quattro sabati calcolati con i festivi, campi,
   invio simulato, **stati R0-R8**, `track`). §5.5, §6.2, §6.3.
8. **`bottega-piede`** · `#bottega` + `<footer id="piede">`: frase sulle
   persone, foto 3 (se c'è), indirizzo, orari in `dl`, "Chiama", "Scrivi",
   "Apri in Maps"; piede con "Un concept di CiceriLab", nota "attività
   inventata", riga sulla simulazione, crediti foto, "Dimentica le mie
   prove". §5.6, §5.7.

---

## Richieste ad altri agent

- **tech-architect**: la tabella dei file esclusivi usi gli otto nomi sopra.
  Nello store servono: `f` corrente, pianerottolo corrente, `fVoce`, punto
  `(x, y)` della voce, strumento, modi trovati, stato del suono, altezza del
  riquadro (`cornice`), modalità (`normale` | `bassa` | `affiancata`), stato
  del form voce (V) e del sabato (R), `invioErrore` da URL. `righello` e
  `voce` scrivono lo scroll solo tramite una funzione del core
  (`vaiAFrequenza(f)`), mai con `scrollTo` propri.
- **creative-director** (per conoscenza): due scostamenti motivati. L'indice
  sta accanto al righello e non sotto (§2.3), perché il righello è alto
  quanto la tavola; il piede non ha un link "torna al Concept Lab" (§5.7),
  perché `integrazione-sito.md` lo vieta. In reduced motion il riquadro
  mobile resta fisso al 44svh (§7.10).
- **copywriter**: il titolo d'esempio del creative-director (63 caratteri)
  supera le due righe: serve un `h1` di massimo 40 caratteri.
- **brand-strategist**: confermare o sostituire le tre persone di §4 e i
  numeri d'esempio dei wireframe (lista 7/4/3, consegne, prezzi "da").
