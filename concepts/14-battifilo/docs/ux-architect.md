# UX architect · Concept 14 · BATTIFILO, impresa edile e serramenti (Pordenone)

Ondata 1. Rotta `/concept-14`. Base vincolante: `docs/creative-director.md`
(variante B, LA LASTRA). Questo documento decide **struttura, URL, percorsi,
ordine di lettura, stati e accessibilità**. Non decide colori, font, easing o
testi definitivi (art-director, motion-designer, copywriter): i testi tra
virgolette sono segnaposto di lunghezza e di tono, da riscrivere.

Materiale letto: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, riga e paragrafo 14 di
`docs/matrice-concept-11-20.md`, `concepts/14-battifilo/docs/creative-director.md`,
`concepts/10-torchio/docs/ux-architect.md` (solo formato e livello),
`concepts/10-torchio/src/components/ConceptBackButton.tsx` (misure reali del
bottone condiviso).

Regole di scrittura rispettate anche qui: niente trattini lunghi nei testi
visibili, niente occhielli numerati, niente maiuscoletto spaziato come
etichetta, un solo richiamo per intento con una sola etichetta:
**"Misura e manda"**.

Nomi dei pubblici nelle storie (sez. 4): sono miei, compatibili con quelli che
sceglierà il brand-strategist; se i suoi sono diversi valgono i suoi.

---

## 1. Sitemap e URL

### 1.1 Mappa

Una SPA, una rotta, **nessuno scroll di pagina** (tranne le viste documento).
Un palcoscenico con 16 posizioni del tempo e tre viste a tutto schermo sopra
di lui.

```
/                                   ← Ciceri Lab (uscita: ConceptBackButton condiviso)
└── /concept-14                     BATTIFILO
    ├── LA CRONACA (palcoscenico)   <main id="cronaca">
    │   ├── ?mese=0 (o nessun param)  S0  Apertura, "mese zero"      posizione 0  "PRIMA"
    │   ├── ?mese=1 … ?mese=14        S1  Scheda del mese 1…14       posizioni 1-14 "MAR"…"APR"
    │   └── ?mese=15                  S2  Le chiavi                  posizione 15 "CHIAVI"
    ├── #misura                     S3  Misura e manda (prenotazione)   vista a tutto schermo
    ├── #cartello                   S4  Il cartello (chi, dove, orari)  vista a tutto schermo
    └── #mesi                       S5  Tutti i mesi (vista elenco)     vista a tutto schermo, scorre
```

- Le tre viste (S3, S4, S5) si aprono **sopra** la cronaca, che resta montata
  sotto (inerte) con il suo mese: chiudendo si torna esattamente dov'eri.
- `?mese` e l'hash convivono: `/concept-14?mese=12#misura` apre Misura e manda
  con la cronaca ferma a febbraio (posa dei serramenti) sotto.
- Nessuna sottorotta: il sito vero ha solo `/concept-14` e le rotte non si
  toccano (regola del Lab).

### 1.2 Parametri di ingresso (per post e inserzioni di Luca)

Letti una volta all'avvio. Quelli non validi si ignorano in silenzio e si
tolgono dall'URL con `replaceState`.

| Parametro | Valori | Effetto |
|---|---|---|
| `?mese=` | `0`…`15` | apre la cronaca su quella posizione, linea già battuta fino lì, **senza** animazione d'apertura |
| `#misura` | | apre S3 subito (sopra S0 o sopra il mese dato) |
| `#cartello` | | apre S4 |
| `#mesi` | | apre S5, scorre alla voce del mese dato se c'è `?mese` |
| `?tipo=` | `anta`, `due-ante`, `portafinestra`, `alzante` | preseleziona "Che cosa" in S3 (vale solo con `#misura`; vince sulla bozza salvata) |
| `?invio=errore` | | solo per QA e demo: l'invio simulato fallisce sempre |

Esempi:
- inserzione "Quanto costa la tua finestra?": `/concept-14?tipo=due-ante#misura`
- post sui tempi del cantiere: `/concept-14?mese=6` (agosto, il buco delle ferie)
- post sui serramenti: `/concept-14?mese=12`

### 1.3 Regole della cronologia del browser

1. **Cambiare mese non crea voci di cronologia.** Quando la cassetta si ferma
   su un mese, il sito scrive `?mese=N` con `replaceState` (mese 0 = nessun
   parametro). Così un mese si può copiare e mandare, e "Indietro" non fa
   ripercorrere 14 mesi uno per uno.
2. **Aprire una vista crea una voce** (`pushState` con l'hash e
   `history.state = { btf: "vista" }`): "Indietro" del browser o del telefono
   chiude la vista e torna alla cronaca.
3. **Chiudere una vista col suo bottone o con Esc**: se l'ha aperta il sito
   (`history.state.btf === "vista"`) si fa `history.back()`; se si è entrati
   direttamente con l'hash, `replaceState` senza hash (non si esce dal sito).
4. **Passare da una vista all'altra** (dal cartello a Misura e manda, da Tutti
   i mesi al cartello): `replaceState`, una sola voce di vista alla volta.
5. `popstate` è l'unica fonte di verità: il sito legge URL e hash e si
   allinea (vista aperta o chiusa, mese). Nessun salto di scroll del browser
   (`history.scrollRestoration = "manual"` mentre il concept è montato,
   ripristinato allo smontaggio).
6. Il `<title>` non cambia né con i mesi né con le viste (resta quello del
   prerender, deciso dal seo-engineer). Il lettore di schermo sa dove sei dal
   fuoco sull'`h2` (sez. 6).

### 1.4 Stato che sopravvive al ricaricamento

`localStorage`, chiavi con prefisso `btf:`, ogni lettura e scrittura in
try/catch; se è vuoto o bloccato il sito funziona uguale.

| Chiave | Contenuto | Quando si scrive | Uso |
|---|---|---|---|
| `btf:visto` | numero 0-15, il mese più lontano raggiunto | a ogni battuta, solo se cresce | la linea "già battuta" chiara (55%) oltre la cassetta al rientro |
| `btf:bozza` | `{ tipo, l, h, quante, materiale }` | a ogni modifica valida in S3 | "Abbiamo tenuto le misure dell'ultima volta" |
| `btf:inviata` | `{ tipo, l, h, quante, comune, data }` | al successo dell'invio | tacca **TU** nella cronaca e stato "già mandata" di S3 |

Mai salvati: nome, telefono, email. Nel cartello c'è **"Ricomincia da capo"**
che cancella le tre chiavi e riporta a S0.

### 1.5 Uscite

- ConceptBackButton condiviso (verso `/` nello standalone, verso il Lab nel
  sito vero).
- `tel:` e `mailto:` di esempio (cartello, errore d'invio).
- "Apri in Maps" (cartello): link esterno a Google Maps sull'indirizzo di
  esempio, `target="_blank"` + `rel="noopener"` + testo che dice "si apre in
  una nuova scheda".

---

## 2. Navigazione

### 2.1 Principio

Il sito non si scorre: il tempo si **tira**. La navigazione quindi ha due
soli livelli:
1. **il filo del tempo** in fondo alla lastra (dove sei nel cantiere, sempre
   visibile nella cronaca);
2. **la fascia ferro** in alto (le tre viste e il marchio che riporta
   all'inizio).

Elementi presenti a ogni larghezza:
1. due link di salto, nascosti fino al fuoco, primi due elementi tabulabili:
   "Vai al filo del tempo" (fuoco sulla cassetta) e "Leggi tutti i mesi"
   (apre S5);
2. il ConceptBackButton condiviso (non lo creiamo, lo montiamo, e lasciamo
   libera la sua zona);
3. il marchio BATTIFILO (stencil calce su ferro), link che chiude ogni vista e
   porta la cassetta a 0;
4. il richiamo unico **"Misura e manda"**.

### 2.2 Il bottone condiviso: misure reali e zone libere

Letto dal codice (`ConceptBackButton.tsx`): `position: fixed`, padding
11×16 px, mono 10 px spaziato, testo "TORNA IN CICERI LAB" con freccia.
Ingombro stimato **circa 200×38 px**.

| Larghezza | Dove sta | Zona che il concept lascia libera |
|---|---|---|
| > 640 px | in alto a sinistra, top `max(safe-area, 14px)`, left 14 | rettangolo 0-240 × 0-56 px: dentro la fascia ferro (56 px), il marchio parte da **260 px** (desktop) o **240 px** (641-1023) |
| ≤ 640 px | in basso a sinistra, bottom `max(safe-area, 14px)`, left 12 | rettangolo 0-216 × ultimi 64 px + area sicura: la **fascia bassa** del concept tiene il bottone a sinistra e "Misura e manda" a destra |

Il bottone ha fondo carta quasi bianca e bordo nero: sulla fascia ferro si
legge benissimo e non va "integrato" (è del Lab, non del concept).

### 2.3 Desktop (≥ 1024 px, disegnato a 1440)

**Fascia ferro** 56 px, fissa, in cima, sempre visibile (anche sopra le viste):

```
|[ ← TORNA IN CICERI LAB ]    BATTIFILO            Cronaca    Il cartello    [ Misura e manda ]|
 ^ bottone del Lab, 14 px      ^ marchio da 260 px  ^ Chivo 16 px, calce       ^ bottone cobalto,
   dal bordo (non nostro)        stencil calce 28 px   voci a destra              testo calce, 44 px alto
                                                                                  margine destro 32 px
```

- Voci: **Cronaca** (chiude la vista aperta; se sei già nella cronaca è testo
  con `aria-current="page"`, sottolineato 2 px calce), **Il cartello**
  (`#cartello`), **Misura e manda** (bottone cobalto, `#misura`).
- Con una vista aperta la voce corrispondente ha `aria-current="page"` e
  sottolineatura; "Misura e manda" dentro S3 resta visibile ma diventa testo
  calce sottolineato, non più bottone (niente bottone che porta dove sei già).
- "Tutti i mesi" non è in fascia (tre voci, come vuole la direzione): si apre
  dal link nella scheda, dal cartello, dal link di salto.

### 2.4 Tablet (641-1023 px, controllato a 768)

Fascia 56 px: marchio da 240 px, a destra **"Misura e manda"** (bottone) e
**"Menu"** (testo calce con bordo 1 px calce, 44 px). Tre voci più il marchio
non stanno in 528 px utili. Il menu è lo stesso del telefono (2.5). Niente
fascia bassa: il bottone del Lab è in alto.

### 2.5 Telefono (≤ 640 px, disegnato a 375)

**Fascia ferro alta** 48 px + area sicura in alto:

```
| BATTIFILO                                   [ Menu ] |
  stencil calce 24 px, da 16 px                ^ 44×44 min, testo "Menu", Chivo 15
```

**Fascia bassa** alta 64 px + `env(safe-area-inset-bottom)`, fondo ferro (la
stessa banda dell'alto: incornicia la lastra come due tavole di cassero):

```
| [ ← TORNA IN CICERI LAB ]            [ Misura e manda ] |
  ^ bottone del Lab (suo, ~200×36)       ^ cobalto, 44 px alto, max 146 px largo,
                                           Chivo 700 15 px, right 12 px, allineato
                                           al centro verticale del bottone del Lab
```

- A 375 px restano 146 px tra il bottone del Lab (fino a ~216 px) e il
  margine destro di 12 px: "Misura e manda" in Chivo 700 15 px sta in circa
  138 px. **Il responsive-tester lo verifica con il font vero**; se non ci sta
  si scende a 14 px, mai a un'etichetta diversa.
- Con una vista aperta: in S3 al posto del bottone cobalto non c'è niente
  (sei già lì); in S4 e S5 il bottone resta.
- Con la tastiera del telefono aperta la fascia bassa si nasconde
  (rilevato con `visualViewport`), il bottone del Lab resta dov'è (non è
  nostro): i campi hanno `scroll-margin-bottom` sufficiente.

**Il menu** (bottone "Menu" nella fascia alta): una lastra a tutto schermo tra
la fascia alta e quella bassa.

```
┌───────────────────────────────────────┐
│ BATTIFILO                    [Chiudi] │  fascia ferro: "Menu" diventa "Chiudi"
├───────────────────────────────────────┤
│                                       │  lastra calcestruzzo
│ Cronaca          ◂ ci sei             │  voci Chivo 700 26 px, righe 56 px,
│ Il cartello                           │  "ci sei" scritto (non solo evidenziato)
│ Tutti i mesi                          │
│ [ Misura e manda ]                    │  bottone cobalto largo 100%
│                                       │
│ Un concept di Ciceri Lab.             │  Chivo 15, ferro
│ L'impresa è inventata.                │
│                                       │
├───────────────────────────────────────┤
│ [← TORNA IN CICERI LAB]               │  fascia bassa: solo il bottone del Lab
└───────────────────────────────────────┘
```

Si chiude con "Chiudi", Esc, scelta di una voce, "Indietro" del telefono (il
menu apre una voce di cronologia come le viste). Mentre è aperto: focus
intrappolato, cronaca `inert`. Alla chiusura il focus torna a "Menu" o all'`h2`
della vista scelta. Entra con dissolvenza 200 ms (niente tendina che scende);
con reduced motion senza movimento.

### 2.6 Schermi grandi (≥ 1920, controllato a 2560)

- La foto non supera **1920 px** di larghezza: oltre, è centrata e ai lati
  continua la lastra (la foto "poggia" sul calcestruzzo anche di lato). Motivo:
  le foto sono WebP da 1600 px (direzione 4.5); oltre 1920 si vedrebbe la
  sgranatura. Richiesta al photo-editor per la sola foto di S0: una misura da
  2400 px.
- Il contenuto della lastra ha una larghezza massima di 1680 px, centrato; il
  filo del tempo invece corre per la stessa larghezza della foto, così le
  tacche restano sotto la scena.
- Fascia ferro a tutta larghezza.

---

## 3. Arco emotivo

L'arco è quello di un cantiere vero visto da chi lo paga: paura all'inizio,
fatica nel mezzo, sollievo alla fine, e poi la voglia di cominciare il
proprio. Il picco non è l'apertura: è **il mese con il buco** (onestà) e poi
**Misura e manda** (il primo gesto concreto).

| Momento | Posizione | Emozione di chi guarda | Cosa la provoca | Cosa lo porta avanti |
|---|---|---|---|---|
| Apertura | S0 | **curiosità inquieta** ("quanto mi costa, quanto ci vuole?") | un prato con i picchetti, la frase dei 14 mesi, il filo che batte da solo una volta | la cassetta da tirare; il bottone per chi ha solo finestre da cambiare |
| Scavo e fondazioni | 1-2 | **serietà** | cifre sporche e vere, i nomi veri dei lavori, i 3 giorni di pioggia ad aprile (primo buco) | "e poi?" la curiosità di vedere la casa salire |
| La casa sale | 3-5 | **concretezza** | muri, solaio, cordoli: il progressivo cresce, la linea blu si allunga | il consiglio "controlla tu" che fa sentire accompagnati |
| Agosto | 6 | **fiducia per onestà** | il buco lungo nella linea e la frase "cantiere chiuso dal 4 al 22 agosto" | è il momento in cui il sito smette di sembrare pubblicità |
| Tetto e controtelai | 7 | **riconoscimento** per chi ha solo le finestre | "Quanto costerebbe la tua finestra?" | primo invito contestuale a S3 |
| Impianti | 8 | **picco di spesa, e di attenzione** | il mese più caro (41.200 €), il consiglio sui tubi da fotografare | la sensazione "questi sanno cosa fanno" |
| Inverno | 9-11 | **pazienza** | gelo a dicembre (terzo buco), lavori dentro casa | la casa ormai si riconosce |
| Serramenti | 12 | **desiderio** | la posa delle finestre, secondo invito a S3 | chi è venuto per le finestre qui decide |
| Finiture | 13-14 | **attesa della fine** | cappotto, pavimenti, collaudi | la tacca CHIAVI a un passo |
| Le chiavi | S2 | **sollievo e verifica** | il bilancio: +3,6% e perché, cosa si consegna, la linea intera con i suoi tre buchi | "e il mio?": il marchio, la fascia, il cartello |
| Misura e manda | S3 | **potere, agire** | prendi il metro, scrivi due numeri, la tua finestra battuta accanto alla porta, il prezzo subito | "Manda le misure" |
| Dopo l'invio | S3 → cronaca | **appartenenza** | la data marcata a spruzzo, e nella cronaca la tacca **TU** prima di marzo | tornare: il tuo lavoro è nella linea |

Regole di ritmo:
- Ogni cambio di mese è un **passo** (dissolvenza della scheda 250 ms, foto
  450 ms): mai scorrimento continuo di contenuti. Il ritmo lo dà la mano di chi
  tira.
- I tre buchi (aprile, agosto, dicembre) sono gli unici "eventi" visivi della
  linea: la direzione vuole che l'onestà sia grafica, non testuale.
- Chi non vuole seguire l'arco ha sempre "Misura e manda" a un tocco (fascia
  alta o bassa) e "Leggi tutti i mesi" per leggere tutto in fila.
- Chi torna dopo aver inviato: la cronaca riparte da S0 (o dal `?mese`), la
  linea già battuta chiara arriva fin dove era arrivato, e c'è la tacca TU.

---

## 4. Tre user journey (dall'arrivo all'invio)

Il visitatore vero del Concept Lab è **un titolare di impresa edile o di
serramenti** che arriva da cicerilab.com e si immedesima nei suoi clienti. Le
tre storie sono i clienti che lui ha in testa; lui guarda come il sito li
porta alla richiesta di sopralluogo.

### 4.1 Renato, 64 anni, Porcia: nove finestre del 1984 (telefono, da un'inserzione)

1. Vede su Facebook l'inserzione "Misura la tua finestra, vedi quanto costa".
   Tocca: arriva su `/concept-14?tipo=due-ante#misura`.
2. Si apre S3 direttamente, "Che cosa" è già su **finestra a due ante**. Sul
   piano di tracciamento in alto: la porta disegnata, la linea di terra, e il
   filo teso non battuto con "Scrivi le tue due misure: la battiamo qui,
   accanto alla porta." (stato Vuoto).
3. Legge le tre righe su come si misura, prende il metro. Scrive la larghezza:
   `1180`. All'uscita dal campo: "Forse hai scritto in millimetri: 1180 mm sono
   118 cm." Tocca **"Usa 118"**. Il filo si tende sul lato orizzontale (stato
   Parziale).
4. Scrive l'altezza `142`. Il filo batte quattro volte e la finestra compare
   in blu accanto alla porta, con "118" e "142" a stencil e "1,68 m² di luce".
5. Con "più" porta "Quante uguali" a 9. La forbice: PVC da 950 € a 1.380 € a
   pezzo, e sotto "Per 9 finestre uguali: da 8.550 € a 12.420 €, posa e
   smontaggio compresi, IVA esclusa". Tocca la riga del **PVC** ("Quale ti
   interessa di più").
6. Scende: nome "Renato", telefono, comune **Porcia**, quando **sabato
   mattina**. "Manda le misure".
7. "Mando le misure…", il filo fa una battuta lunga sul perimetro. Poi, sulla
   lastra, a spruzzo: "26 SET" e "Ricevute. Ti chiamiamo entro domani per il
   sopralluogo a Porcia. Tieni il metro a portata di mano."
8. Tocca "Torna alla cronaca": prima di marzo c'è la tacca **TU** con la sua
   finestra in piccolo. Per curiosità tira il filo fino a febbraio (posa dei
   serramenti) e si ferma lì.

Punti critici verificati: tastiera numerica che non copre il disegno (5.5.4),
correzione dei millimetri con un tocco, prezzo visto prima di lasciare il
numero, bottone del Lab che non copre "Manda le misure" (spazio di 80 px in
fondo alla colonna).

### 4.2 Chiara e Davide, 38 e 41 anni, San Quirino: il terreno c'è, la casa no (desktop, da Google)

1. Cercano "costruire casa Pordenone quanto costa al metro quadro". Arrivano su
   `/concept-14` (S0). Leggono il titolo e la riga che dichiara il cantiere
   tipo. Dopo 600 ms il filo si alza e batte da solo sul primo tratto: capiscono
   che la linea in basso è da tirare. "Tira il filo per far passare i mesi."
2. Davide trascina la cassetta. Le schede passano: marzo (scavo), aprile
   (platea, tre giorni di pioggia: la linea ha un buco corto). Si ferma su
   **giugno**: "38.900 €, speso finora 115.700 € su 412.500 €".
3. Con la rotella del mouse (a scatti) arriva ad agosto: il buco lungo. Passa
   il puntatore sul buco: "Ferie: cantiere chiuso dal 4 al 22 agosto." Chiara:
   "almeno lo dicono".
4. A ottobre (impianti, il mese più caro) Chiara legge "Controlla tu:
   fotografa i tubi prima che chiudano le tracce". Copia l'URL
   (`?mese=8`) e lo manda a sua sorella.
5. Arrivano alle **CHIAVI**: +3,6% e perché, cosa si consegna. Aprono **Il
   cartello** dalla fascia: zone servite (San Quirino c'è), sabato mattina il
   magazzino è aperto. Chiara vuole anche sapere le finestre della casa nuova.
6. Nel cartello non c'è un richiamo (è già in fascia): usano la fascia,
   **Misura e manda**. Scelgono **scorrevole alzante**, 280 × 230:
   il rettangolo battuto è più largo della porta di tre volte e mezzo; la
   forbice mostra il legno-alluminio sopra i 7.000 €. Scrivono nome, email,
   comune **San Quirino**, "pomeriggio". Mandano.
7. Successo. Chiudono con "Indietro" del browser: tornano ad agosto, dove
   erano. La tacca TU è comparsa.

Punti critici: rotella a scatti che non "scappa" con l'inerzia del trackpad
(regola in 5.3.3), buco spiegato sia al passaggio sia nel testo della scheda,
"Indietro" che chiude la vista e non esce dal sito.

### 4.3 Paola, 52 anni, Sacile: segue la ristrutturazione dei genitori (tastiera e zoom, da un link su WhatsApp)

Paola ha la vista stanca: usa il portatile con lo zoom del browser al 200% e
naviga soprattutto da tastiera.

1. Il fratello le manda `/concept-14?mese=12`. Si apre la cronaca su
   **febbraio, posa dei serramenti**, linea battuta fino lì senza animazione.
2. A 200% (viewport 720×~400 css px) il sito è in **modo orizzontale corto**
   (5.9): foto a sinistra, lastra a destra che scorre. Legge tutto senza
   perdere pezzi.
3. Preme Tab: primo link di salto "Vai al filo del tempo". Invio: il fuoco è
   sulla cassetta, il lettore di schermo (lo usa a volte, VoiceOver) dice
   "Filo del tempo, regolatore, Mese 12, febbraio: posa dei serramenti.
   36.800 euro. Speso finora 347.800 euro."
4. Freccia sinistra due volte: dicembre. Il valore detto include "Cantiere
   fermo 4 giorni per gelo". Tab: il gruppo delle tacche (una sola fermata),
   frecce per scorrerle, sulla tacca di dicembre compare la riga del gelo
   anche a schermo.
5. Torna a febbraio con Invio sulla tacca. Tab fino a "Quanto costerebbe la
   tua finestra?": si apre S3 con "Che cosa" sul default **un'anta** (il mese
   non preseleziona nulla, solo `?tipo` lo fa). Sceglie portafinestra con le
   frecce nel gruppo radio.
6. Scrive `90` e `120`: avviso di coerenza (non errore) "Una portafinestra alta
   120 cm? Di solito è una finestra." con il bottone "Fai finestra". Si accorge
   di aver misurato male, corregge `220`.
7. Sbaglia l'email (`paola@`). All'invio il fuoco va al campo: "Scrivi un
   numero di telefono o un'email: ti richiamiamo lì." Corregge, invia. Il fuoco
   va alla frase di successo, che il lettore di schermo legge per intero.

Punti critici: `aria-valuetext` parlante, buchi raggiungibili da tastiera, zoom
200% e 400% senza scroll orizzontale, errori legati ai campi, fuoco gestito
dopo l'invio.

---

## 5. Wireframe testuali per schermata

Legenda: `[ … ]` bottone, `◆` link o controllo, `▒` foto, `≡` testo Chivo,
`STENCIL` marcatura a stencil, `━━` linea battuta cobalto, `┄┄` linea battuta
chiara (già vista), `···` filo teso (ferro, non battuto), `  ` buco nella
linea. Misure in px CSS. Le proporzioni sono per l'art-director, che può
spostarle di poco ma non cambiare l'ordine.

### 5.0 Geometria del palcoscenico (vale per S0, S1, S2)

| Larghezza | Fascia alta | Foto | Lastra (scheda + filo) | Fascia bassa |
|---|---|---|---|---|
| ≥ 1024 | 56 | il resto (min 38% dell'altezza) | `clamp(320px, 40vh, 440px)`: scheda circa 200-300 + filo 112 | no |
| 641-1023 | 56 | il resto (min 36%) | `clamp(340px, 46vh, 480px)`: scheda + filo 104 | no |
| ≤ 640 | 48 + area sicura | `42svh` (38svh se altezza < 700) | il resto: scheda + filo 88 | 64 + area sicura |

- Tutto è `100dvh` fisso, `overflow: hidden` su html/body **solo** finché il
  concept è montato (ripristinato allo smontaggio, come per Lenis nel pilota).
- La **linea di terra** di ogni foto cade sul bordo superiore della lastra
  (`object-position` per foto e per larghezza, lo fissa l'art-director).
- La lastra non ha bordi né ombre: il confine con la foto è il taglio netto.

### 5.1 S0 · Apertura, "mese zero"

**1440 × 900**

```
|[← TORNA IN CICERI LAB]   BATTIFILO                     Cronaca   Il cartello   [ Misura e manda ]|  56
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
|▒  il terreno com'era: prato o sterrato con picchetti, nessuna persona, orizzonte basso        ▒|  ~484
|▒  nessuna scritta sulla foto                                                                   ▒|
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|  ← linea di terra
|  QUATTORDICI MESI,                        ≡ La cronaca di un cantiere tipo    ≡ Terreno a Cordenons, |
|  DALLO SCAVO ALLE CHIAVI.  (h1 stencil     a Cordenons: cosa si fa ogni mese,   prima dello scavo.  |
|  ferro, 64-88 px, c1-c7)                   chi c'è, quanto costa. (≤ 20 parole) Foto di …, Unsplash |
|                                          ≡ Un cantiere tipo, raccontato con     (didascalia 14 px,  |
|                                            foto di cantieri diversi.            c10-c12)           |
|                                          [ Misura e manda ]                                        |
|                                                                                                    |
|  Tira il filo per far passare i mesi.  (Chivo 15, sopra la cassetta, sparisce al primo movimento)  |
|  ⊸━━━[▣]··············································································      |
|  PRIMA  MAR   APR   MAG   GIU   LUG   AGO   SET   OTT   NOV   DIC   GEN   FEB   MAR   APR   CHIAVI  |  112
|                                                              Un concept di Ciceri Lab. Attività inventata.|
```

- **Ordine di lettura** (DOM = visivo): h1 → riga descrittiva → riga della
  dichiarazione → bottone "Misura e manda" → didascalia della foto →
  istruzione → filo del tempo → nota del Lab.
- Un solo bottone. Nessun numero tra filetti, nessun orario, nessun "dal 19…".
- **La foto** è un `<figure>` con `<img alt>` e la didascalia nel
  `<figcaption>` che però sta visivamente sulla lastra (a destra); su telefono
  la didascalia va in "Di più" (5.2).
- **Movimento d'apertura** (precisazione rispetto alla direzione, da
  confermare al motion-designer): la posizione 0 ("PRIMA") è una tacca vera,
  distante un passo dal gancio. All'avvio la cassetta è ferma su PRIMA e il
  filo è già teso tra gancio e cassetta, **non battuto**. Dopo 600 ms il filo
  si solleva e batte una volta: resta il primo tratto blu (gancio → PRIMA) e un
  filo di polvere. La cassetta **non si sposta**, il valore dello slider resta
  0, la scheda resta S0. Così l'apertura mostra il gesto senza cambiare stato
  (nessun annuncio al lettore di schermo, nessun titolo che sparisce da solo).
  Con reduced motion il primo tratto è già lì. Se la scheda è nascosta
  (`document.hidden`), i 600 ms partono quando torna visibile.
- L'istruzione "Tira il filo per far passare i mesi." sparisce al primo
  spostamento reale (qualsiasi modo: trascinamento, tasto, tacca, rotella,
  swipe) e non torna più nella sessione.

**375 × 812**

```
| BATTIFILO                          [ Menu ] |  48
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
|▒  il terreno, ritaglio mobile dedicato    ▒|  42svh ≈ 341
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|  ← linea di terra
| QUATTORDICI MESI,                           |  h1 stencil 40-44 px, 3 righe max
| DALLO SCAVO                                 |
| ALLE CHIAVI.                                |
| ≡ La cronaca di un cantiere tipo a          |  Chivo 16, 2-3 righe
|   Cordenons: cosa si fa ogni mese, chi c'è, |
|   quanto costa.                             |
| ≡ Foto di cantieri diversi.  (14 px)        |
|                                             |
| Tira il filo per far passare i mesi.        |
| [‹]  ⊸━[▣]····|····|····|···  [›]           |  88: cassetta ferma al centro
|      PRIMA  MAR  APR  MAG                   |
|─────────────────────────────────────────────|
| [← TORNA IN CICERI LAB]    [ Misura e manda ]|  64 + area sicura
```

- Su telefono S0 **non ha** il bottone "Misura e manda" nella lastra: c'è già
  nella fascia bassa, sempre visibile (un richiamo per intento, mai due uguali
  nello stesso schermo).
- A 375×667 (iPhone SE) la foto scende a 38svh (253 px) e il titolo sta in 3
  righe da 36 px; la riga descrittiva si accorcia a 2 righe (limite per il
  copywriter: **110 caratteri**).

### 5.2 S1 · La scheda del mese (1-14)

**1440 × 900**

```
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ foto del mese (dissolvenza incrociata 450 ms) ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
|                                                      ≡ Tracce degli impianti in un'altra casa. Foto di …  | 14 px, a destra
|  IMPIANTI          41.200 €              ≡ Fatto: tracce nei muri, dorsali elettriche,              |
|  (h2 stencil        (stencil cobalto       tubi di carico e scarico, collettori del riscaldamento.  |
|   ferro 56-72)      48-64, c5-c8)          (≤ 180 caratteri, c8-c12)                                |
|  ≡ ottobre,        ≡ speso finora         ≡ Chi c'era: elettricisti 2, idraulici 2.                   |
|    mese 8            238.400 € su           19 giorni in cantiere. (≤ 80)                            |
|                      412.500 €            ≡ Controlla tu: prima che chiudano le tracce, fotografa    |
|                    ≡ cifre di un cantiere   i tubi. Un giorno ti servirà sapere dove passano. (≤ 130) |
|                      tipo, IVA esclusa     ◆ Leggi tutti i mesi                                      |
|                      (14 px)                                                                         |
|  ⊸━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[▣]┄┄┄┄┄┄┄┄┄·························     |
|  PRIMA  MAR   APR   MAG   GIU   LUG   AGO   SET   OTT   NOV   DIC   GEN   FEB   MAR   APR   CHIAVI  |
```

- I cinque pezzi della scheda, sempre nello stesso ordine DOM:
  1. `h2`: fase a stencil + "ottobre, mese 8" in Chivo (dentro l'`h2`, così
     il titolo detto è "Impianti, ottobre, mese 8");
  2. costo del mese (stencil cobalto, testo grande) + progressivo + nota "cifre
     di un cantiere tipo, IVA esclusa";
  3. **Fatto**;
  4. **Chi c'era** (+ fermi, se ci sono: "Fermi 3 giorni per pioggia.");
  5. **Controlla tu**;
  6. link contestuali: solo nei mesi 7 e 12 ◆ "Quanto costerebbe la tua
     finestra?" (cobalto fondo, prima di "Leggi tutti i mesi"); in tutti i mesi
     ◆ "Leggi tutti i mesi".
- Le etichette "Fatto", "Chi c'era", "Controlla tu" sono parole in Chivo 700
  in linea col testo, non occhielli in maiuscoletto.
- **Limiti per il copywriter** (per stare nella lastra a 1366×768): fase ≤ 22
  caratteri (a capo su due righe consentito solo a ≥ 1440), "fatto" ≤ 180,
  "chi c'era" ≤ 80 compresi i fermi, "controlla tu" ≤ 130, didascalia ≤ 90.
- **Cambio di mese**: la scheda vecchia esce e la nuova entra con dissolvenza
  250 ms (nessuno scorrimento); la foto con dissolvenza incrociata 450 ms. Il
  cambio avviene **quando la cassetta supera la metà del mese**, non a ogni
  pixel. Durante un trascinamento veloce foto e scheda si aggiornano al massimo
  3 volte al secondo, poi l'ultima (regola anti-lampeggio della direzione).
- **Altezze ridotte** (desktop con lastra a 320 px): "Controlla tu" si tronca
  a una riga con ◆ "Di più" (stesso comportamento del telefono, qui sotto).

**375 × 812**

```
| BATTIFILO                          [ Menu ] |
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|  42svh
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
| IMPIANTI                 ≡ ottobre, mese 8  |  h2: stencil 36-40 + Chivo 15 sulla stessa base
| 41.200 €                                    |  stencil cobalto 36
| ≡ speso finora 238.400 € su 412.500 €       |  Chivo 15, tabular
| ≡ Fatto: tracce nei muri, dorsali elettri-  |  2 righe, poi taglio
|   che, tubi di carico e scarico…            |
| ≡ Chi c'era: elettricisti 2, idraulici 2.   |  1 riga (solo se l'altezza ≥ 780)
| ◆ Di più                  ◆ Tutti i mesi    |  44 px alti
| [‹]  ━━━━━━|━━━━━━[▣]┄┄┄┄|····|···  [›]     |  88
|      SET    OTT     NOV   DIC               |
|─────────────────────────────────────────────|
| [← TORNA IN CICERI LAB]    [ Misura e manda ]|
```

- **"Di più"** (bottone con `aria-expanded`): la lastra **sale** sopra la
  foto (la foto resta visibile in una striscia di 20svh in alto, con la sua
  linea di terra), e mostra il testo completo: fatto, chi c'era, fermi,
  controlla tu, didascalia della foto, link contestuale nei mesi 7 e 12. Qui
  la lastra scorre in verticale se serve. Il filo del tempo resta in fondo e
  funziona: cambiando mese la scheda resta espansa. Si richiude con "Meno",
  Esc, o toccando la striscia della foto. È la stessa idea del "piano B" della
  direzione (la lastra che sale), usata come gesto.
- A 375×667: sotto il costo solo progressivo e "Fatto" in 2 righe; "Chi c'era"
  va sempre in "Di più".
- **Mesi con fermo**: sotto il filo, quando la cassetta è su quel mese,
  compare la riga del fermo ("Ferie: cantiere chiuso dal 4 al 22 agosto.",
  Chivo 14 ferro) al posto dei nomi delle tacche vicine. Nessun colore diverso.
- **Mese senza foto** (piano B della direzione o errore di caricamento): la
  lastra occupa anche l'area della foto e la fase è marcata grandissima
  (stencil 120-160 px desktop, 64 px telefono) dove sarebbe stata la foto. Il
  resto della scheda è identico. Se una foto non carica (`error`), succede la
  stessa cosa, senza messaggi d'errore.

### 5.3 Il filo del tempo (in tutte le posizioni della cronaca)

#### 5.3.1 Anatomia

```
   gancio   PRIMA        MAR        APR   (buco)   MAG   …        APR        CHIAVI
     ⊸━━━━━━━┿━━━━━━━━━━━┿━━━━━━━━━━┿━━━  ━━━━━━━━━┿━━━━ … ━━━━[▣]┄┄┄┄┄┄┄┄┄┄┄┿·······
             ▲ tacche: bottoni, 44 px alti min, larghi un passo                ▲ cassetta 44×56,
             nomi stencil 20 px sotto la linea                                  maniglia r=6 px
```

- 16 posizioni: 0 PRIMA, 1-14 i mesi (MAR … APR, due volte "MAR" e "APR":
  il nome accessibile completo li distingue, "Marzo, mese 1" / "Marzo, mese
  13"), 15 CHIAVI.
- **Tacca TU** (solo dopo un invio riuscito, 5.5.6): una tacca in più **a
  sinistra del gancio**, fuori dalla scala del tempo, con "TU" a stencil e la
  finestra battuta in piccolo (rettangolo proporzionale di 16-24 px). È un
  bottone che apre S3 nello stato "già mandata". Non è un valore dello slider.
- Linea battuta: dal gancio alla cassetta piena (cobalto); dalla cassetta a
  `btf:visto` chiara (55%); oltre, solo le tacche. Il filo teso va sempre e
  solo dal gancio alla cassetta.
- Buchi: nei mesi 2, 6, 10, lunghezza proporzionale ai giorni fermi (3/22,
  19/22, 4/22 di un passo, con 22 giorni lavorativi al mese; agosto circa tre
  quarti). Il buco sta nella posizione vera dei giorni (inizio agosto).

#### 5.3.2 Desktop e tablet ≥ 720 px: linea intera

- Tutte le 16 posizioni in vista. A 1440: passo di circa 84 px. A 768: circa
  44 px (le tacche hanno comunque 44 px di area di tocco; i nomi a 20 px
  stencil stanno in 3 lettere).
- **Trascinare la cassetta** (mouse, penna, dito): la cassetta segue il
  puntatore (pointer capture), il filo si allunga teso. Al rilascio aggancio al
  mese più vicino (500 ms per muoversi, poi la battuta).
- **Cliccare la linea** (fuori da tacche e cassetta): come cliccare la tacca
  più vicina.
- **Cliccare una tacca**: la cassetta ci va (500 ms) e il filo batte.
- **Fermarsi 500 ms** durante il trascinamento senza rilasciare: aggancio e
  battuta, poi si può continuare a tirare.
- **Passare sopra una tacca** (mouse): nessun cambio di stato, solo il nome
  completo del mese sopra la tacca ("Agosto: struttura del tetto") e, se ha un
  buco, la riga del fermo. Il testo è sulla lastra (Chivo 14 ferro), non un
  tooltip in un riquadro.

#### 5.3.3 Rotella e trackpad (solo sopra foto e lastra della cronaca)

- **Un passo per gesto**: un gesto finisce dopo 180 ms senza eventi `wheel`;
  tra due passi almeno 400 ms. Soglia per contare un gesto: 40 px accumulati
  (`deltaY` o `deltaX`, il maggiore). Giù/destra = mese dopo.
- Così l'inerzia dei trackpad non fa saltare tre mesi.
- `Ctrl` + rotella (zoom del browser) non viene toccato.
- Dentro le viste (S3, S4, S5) e nella scheda espansa la rotella scorre
  normalmente.

#### 5.3.4 Telefono e < 720 px: la linea che scorre sotto la cassetta

- La cassetta è **ferma al centro**, la linea scorre sotto di lei; passo di
  56 px, si vedono circa 4-5 mesi.
- **Trascinare in orizzontale** sulla striscia del filo (88 px) o sulla parte
  della lastra sotto la foto, se il gesto è orizzontale (angolo < 30°
  dall'orizzontale, dopo 8 px): la linea scorre, il filo si srotola, al
  rilascio aggancio e battuta. Un gesto verticale sulla lastra espansa la fa
  scorrere normalmente (`touch-action: pan-y` sulla lastra).
- **Swipe sulla foto**: un mese avanti (verso sinistra) o indietro. Soglia 48
  px o velocità > 0,4 px/ms, gesto orizzontale. Nessun trascinamento continuo
  sulla foto.
- **[‹] "Mese prima" e [›] "Mese dopo"**: 44×44, ai lati del filo. A 0 "Mese
  prima" è `aria-disabled="true"`; a 15 "Mese dopo" pure (restano a fuoco,
  non spariscono).
- Toccare una tacca visibile: ci va.
- Ai bordi (0 e 15) la linea non rimbalza.

#### 5.3.5 Dopo il cambio di mese

1. La cassetta si aggancia (o ci arriva), il filo batte (350 ms), polvere
   (800 ms).
2. `?mese=N` con `replaceState`.
3. `btf:visto` aggiornato se cresce.
4. Se il cambio **non** viene dallo slider a fuoco (tacca, rotella, swipe,
   [‹][›], link), la regione `aria-live="polite"` annuncia "Ottobre, mese 8:
   impianti. 41.200 euro." una volta, 500 ms dopo che il mese si è fermato. Se
   viene dallo slider a fuoco, parla già lo slider con il suo
   `aria-valuetext`: nessun doppio annuncio.

### 5.4 S2 · Le chiavi (posizione 15)

**1440**

```
|▒▒▒▒▒▒▒▒▒▒▒ porta d'ingresso nuova con la chiave nella serratura, niente mani ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
|▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒|
|  LE CHIAVI           ≡ Tempi: 14 mesi, 11 giorni di fermo.         ≡ Con le chiavi ti diamo:        |
|  (h2 stencil ferro)  ≡ Soldi: preventivo 398.000 €, finale         certificazione energetica,     |
|  412.500 €             412.500 €, +3,6%: una finestra in più in    dichiarazioni degli impianti,  |
|  (stencil cobalto)     cucina e un pavimento diverso al piano      libretto della pompa di calore,|
|                        terra, chiesti da voi.                      manuale dei serramenti.        |
|                                                                   ≡ Per il primo anno: ◆ Chiama il |
|                                                                     capocantiere                  |
|                     ◆ Il cartello: chi siamo e dove   ◆ Rileggi tutti i mesi                      |
|  ⊸━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━[▣]    |
|  PRIMA  MAR   APR   MAG   GIU   LUG   AGO   SET   OTT   NOV   DIC   GEN   FEB   MAR   APR   CHIAVI  |
```

- Quattro righe di bilancio, in un `<dl>` (Tempi, Soldi, Con le chiavi, Per il
  primo anno). La linea è tutta battuta con i suoi tre buchi: è il riassunto.
- "Chiama il capocantiere" è un `tel:` di esempio; niente numero in vista
  (regola del copywriter nel `ruoli-agent.md`).
- Nessun bottone "Misura e manda" in più: è già in fascia (desktop) o nella
  fascia bassa (telefono).

**375**: stesso ordine in una colonna: h2 + totale, "Tempi", "Soldi" (2-3
righe), poi ◆ "Di più" apre "Con le chiavi" e "Per il primo anno" (lastra che
sale come in S1). Sotto, ◆ "Il cartello".

### 5.5 S3 · Misura e manda (`#misura`), la schermata più importante

Vista a tutto schermo di sola lastra, sotto la fascia alta. Non ha passi
numerati: tutti i gruppi sono aperti, in qualsiasi ordine.

#### 5.5.1 Layout 1440 × 900

```
|[← TORNA IN CICERI LAB]   BATTIFILO                     Cronaca   Il cartello    Misura e manda   |  voce corrente
|┌──────────── PIANO DI TRACCIAMENTO (c1-c7, sticky, alto 100% - 56) ───────┐ COLONNA (c8-c12, scorre)|
|│  MISURA E MANDA  (h2 stencil ferro 56)                  [ Torna alla     │ ≡ Prendi il metro, scrivi|
|│                                                           cronaca ]      │   due numeri, vedi quanto|
|│                                                                          │   costa. Poi veniamo noi.|
|│                                                                          │ Come si misura la luce   |
|│          ┌────┐                                                          │  ┌─schema─┐ ≡ Misura la  |
|│          │    │         ┌─────────118────────┐                           │  │→ → →   │   larghezza  |
|│          │    │         │          ┃         │                           │  │↕ ↕ ↕   │   in alto, al|
|│          │   ●│      142│          ┃         │  (finestra a due ante,    │  └────────┘   centro e in|
|│          │    │         │          ┃         │   montante centrale)      │   basso… (3 righe)       |
|│          │    │         └────────────────────┘                           │ Che cosa (radio, 2×2)    |
|│   210    │    │          ↑ davanzale 90 cm                               │ ◆ un'anta ◆ due ante     |
|│          │    │                                                          │ ◆ portafinestra          |
|│  ━━━━━━━━┷━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  linea di terra   │ ◆ scorrevole alzante     |
|│          80                                                              │ Larghezza cm   Altezza cm|
|│   ≡ La porta è 80 × 210 cm. Stessa scala.                                │ [   118  ]    [  142   ] |
|│   ≡ 1,68 m² di luce                                                      │ tra 40 e 300  tra 40 e 300|
|└──────────────────────────────────────────────────────────────────────────┘ Quante uguali [−] 9 [+] |
|                                                                             La forbice (sez. 5.5.3) |
|                                                                             Dove ti richiamiamo     |
|                                                                             Nome [          ]       |
|                                                                             Telefono o email [    ] |
|                                                                             Comune [ Porcia     ▾ ] |
|                                                                             Quando: ◆ mattina       |
|                                                                               ◆ pomeriggio ◆ sabato |
|                                                                             [ Manda le misure ]     |
|                                                                             ≡ Mancano: … (se manca) |
|                                                                             zona messaggi (live)    |
|                                                                             ≡ Concept di Ciceri Lab:|
|                                                                               invio simulato.       |
```

- **Il piano è sticky**: resta fermo mentre la colonna scorre. La vista S3 è
  l'unico contenitore che scorre; la cronaca sotto è `inert`.
- **Scala fissa**: il piano rappresenta 480 cm in larghezza e 400 cm in
  altezza; la scala è `min(larghezza piano / 480, altezza piano utile / 400)`
  e non cambia con le misure (è la porta a dare il confronto, quindi la porta
  non deve mai cambiare dimensione). A 1440×900 circa 1,45 px/cm: porta 116×305
  px.
- Porta a sinistra (80×210 cm, contorno calcestruzzo ombra, quota a stencil),
  60 cm di spazio, poi la finestra. **Mai una sagoma umana.**
- Davanzale: 90 cm per "un'anta" e "due ante", 0 per portafinestra e
  scorrevole alzante.
- Ordine DOM: `h2` → "Torna alla cronaca" → colonna intera (intro, istruzioni,
  che cosa, misure, quante, forbice, contatti, invio, messaggi) → **dopo**, il
  piano come `<figure>` con `<figcaption>` testuale (vedi 6.8). Visivamente il
  piano è a sinistra, ma chi usa la tastiera parte dai campi.

#### 5.5.2 Layout 375 × 812

```
| BATTIFILO                        [ Chiudi ] |  48 ("Chiudi" = torna alla cronaca)
|┌───────────────────────────────────────────┐|
|│ PIANO sticky, top 48, alto 38svh (~308)   │|  scala ~0,71 px/cm:
|│   ┌─┐    ┌──118──┐                        │|  porta 57×150,
|│   │ │ 142│   ┃   │                        │|  finestra 84×101
|│   │●│    └───────┘                        │|
|│ ━━┷━┷━━━━━━━━━━━━━━━━━━━━━━  1,68 m²      │|
|└───────────────────────────────────────────┘|
| MISURA E MANDA   (h2 stencil 36)            |
| ≡ Prendi il metro, scrivi due numeri…       |
| Come si misura la luce  [schema 88×88]      |
| ≡ 3 righe                                   |
| Che cosa: 4 radio in colonna, 52 px l'uno   |
| Larghezza cm [ 118 ]  Altezza cm [ 142 ]    |  due campi affiancati 50/50, 56 px alti,
| tra 40 e 300           tra 40 e 300         |  testo 17 px (niente zoom iOS)
| Quante uguali  [−]  9  [+]                  |  bottoni 44×44
| La forbice (3 righe, asse comune)           |
| Totale per 9                                |
| Dove ti richiamiamo: nome, contatto, comune,|
| quando (3 radio in colonna)                 |
| [ Manda le misure ]  larghezza piena, 56    |
| ≡ Mancano: …                                |
| zona messaggi                               |
| ≡ Concept di Ciceri Lab: invio simulato.    |
| (spazio 96 px: il bottone del Lab)          |
|─────────────────────────────────────────────|
| [← TORNA IN CICERI LAB]                     |  fascia bassa senza bottone cobalto
```

- Il bottone "Manda le misure" non è mai attaccato al fondo (niente invii
  accidentali col pollice) ed è sempre raggiungibile scorrendo; la colonna ha
  `scroll-padding-bottom: 96px` perché il bottone del Lab non copra il campo a
  fuoco.

#### 5.5.3 La forbice

```
 Quale ti interessa di più? (facoltativo)
 ◉ PVC                  ━━━━━━━━━━                                   da 950 a 1.380 € a pezzo
   ≡ Non si vernicia mai, il più economico.
 ○ Legno-alluminio                          ━━━━━━━━━━━━━━          da 1.570 a 2.180 €
   ≡ Legno dentro, alluminio fuori: niente manutenzione all'esterno.
 ○ Legno                          ━━━━━━━━━━━━━                      da 1.300 a 1.820 €
   ≡ Caldo, si ripara, va riverniciato ogni 8-10 anni.
 ○ Non so ancora
   0 €  ·························· asse comune ·························  2.500 €
 ≡ Per 9 finestre uguali: da 8.550 € a 12.420 €. Posa e smontaggio del vecchio compresi, IVA esclusa.
 ≡ Detrazioni fiscali: te ne parliamo al sopralluogo.
```

- Ordine delle righe come la direzione: PVC, legno-alluminio, legno. Si
  distinguono per nome e posizione sull'asse, mai per colore (tutti cobalto).
- Ogni riga è un `radio` (nome accessibile: "PVC, da 950 a 1.380 euro a
  pezzo. Non si vernicia mai, il più economico."). "Non so ancora" è il
  default. Il valore finisce in `track()` come `materiale`.
- L'asse parte da 0 € e finisce al primo multiplo di 500 € sopra il massimo
  dei tre: la proporzione è onesta.

**Regole di calcolo** (un solo modulo puro e testabile, `forbice.ts`, del
tech-architect; valori di esempio da confermare con il copywriter):

```
A      = (L / 100) × (H / 100)            m² di luce
Af     = max(1,0 ; A)                      minimo fatturato 1 m² a pezzo
coeff  = anta 1,00 · due ante 1,05 · portafinestra 1,10 · scorrevole alzante 1,60
€/m²   = PVC 450-650 · legno 650-900 · legno-alluminio 800-1.100
posa   = 160 (min) - 240 (max) € a pezzo, smontaggio del vecchio compreso
pezzo_min = arrotonda10( Af × €min × coeff + 160 )
pezzo_max = arrotonda10( Af × €max × coeff + 240 )
totale    = pezzo × quante            (nessuno sconto quantità in vista)
```

Esempio di controllo (due ante 118×142, 9 pezzi): A = 1,68; PVC 950-1.380 €,
legno 1.300-1.820 €, legno-alluminio 1.570-2.180 €; totale PVC 8.550-12.420 €.
I numeri di esempio nei testi del copywriter devono uscire da questo modulo.

#### 5.5.4 Tastiera del telefono aperta

- Rilevata con `visualViewport` (altezza visibile < 75% di `innerHeight`).
- La fascia alta si nasconde (0 px), il piano si riduce a **30%** dell'altezza
  visibile (minimo 150 px) e resta in cima: porta e finestra sempre in vista
  mentre si scrive. La scala si ricalcola sull'altezza nuova (unica eccezione
  alla scala fissa, perché cambia lo spazio, non le misure).
- Il campo a fuoco scorre sotto il piano (`scroll-margin-top` = altezza del
  piano + 16).
- Chiusa la tastiera, tutto torna com'era senza salti bruschi (transizione di
  altezza 200 ms; con reduced motion immediata).

#### 5.5.5 Campi e validazione

| Campo | Controllo | Tipo | Obbligatorio | Validazione |
|---|---|---|---|---|
| Che cosa | 4 radio (`fieldset` + `legend`) | anta, due ante, portafinestra, alzante | sì (default "un'anta", o `?tipo`) | nessun errore possibile |
| Larghezza | `input type="text" inputmode="decimal"` | cm, virgola o punto, arrotondato a 0,5 | sì | all'uscita dal campo e all'invio; mentre scrivi solo "valido o no" per il disegno, nessun errore |
| Altezza | come sopra | | sì | come sopra |
| Quante uguali | campo numerico + [−] [+] 44×44 | 1-20 | sì (default 1) | fuori 1-20 si riporta al limite con messaggio |
| Materiale | radio della forbice | 4 | no | |
| Nome | `input autocomplete="name"` | | sì | vuoto all'invio |
| Telefono o email | `input type="text" autocomplete="on"`, `inputmode` scelto dal primo carattere (cifra o `+` → `tel`, lettera → `email`) | | sì | telefono: 6-15 cifre dopo aver tolto spazi, punti e `+39`; email: `x@y.z` |
| Comune | `<select>` nativo | Pordenone, Cordenons, Porcia, San Quirino, Fiume Veneto, Sacile, Altro comune | sì | con "Altro comune" compare subito sotto il campo "Quale comune?" (obbligatorio) |
| Quando | 3 radio | mattina, pomeriggio, sabato mattina | no | |

Etichette sempre sopra, aiuto sotto ("tra 40 e 300 cm"), errore sotto l'aiuto,
nessun placeholder come etichetta.

#### 5.5.6 Tutti gli stati della prenotazione

Testi segnaposto per il copywriter, senza trattini lunghi.

| # | Stato | Quando | Piano di tracciamento | Colonna / messaggi |
|---|---|---|---|---|
| P0 | **Vuoto** | primo arrivo, nessuna bozza | porta, linea di terra, al posto della finestra il **filo teso non battuto**: rettangolo tratteggiato ferro sottile di esempio (100×120 cm) con "Scrivi le tue due misure: la battiamo qui, accanto alla porta." | forbice senza cifre: tre tratti calcestruzzo ombra e "La forbice compare con le due misure."; sotto il bottone "Per mandarle mancano: le misure e un recapito." |
| P0t | **Vuoto con tipo** | `?tipo=` | come P0, e dentro il rettangolo tratteggiato il disegno del tipo (montante, binario) | "Che cosa" già scelto |
| P0b | **Bozza ritrovata** | `btf:bozza` presente | disegno della bozza già battuto (senza animazione) | sopra la colonna: "Abbiamo tenuto le misure dell'ultima volta." ◆ "Cancella" (torna a P0) |
| P1 | **Parziale** | una sola misura valida | il filo si tende su quel lato solo (lunghezza giusta, ancora ferro, non battuto); l'altro lato resta tratteggiato | forbice ancora senza cifre; "mancano: l'altezza" |
| P1d | **Scrittura in corso** | si sta digitando | il disegno si aggiorna solo quando il valore è valido e fermo da 400 ms | nessun errore durante la digitazione |
| P2 | **Misure valide** | due misure valide | il filo **batte quattro volte** (sopra, destra, sotto, sinistra, 120 ms tra le battute) e resta il rettangolo cobalto, poggiato sul davanzale; quote a stencil "118" e "142"; sotto "1,68 m² di luce"; dentro il disegno del tipo | forbice con cifre, totale per la quantità (live, debounce 800 ms) |
| P2c | **Correzione** | cambia una misura già battuta | ribattuto solo il lato che cambia (una battuta); il vecchio segno resta chiaro sotto | cifre aggiornate |
| P2t | **Cambio tipo** | altro radio in "Che cosa" | il disegno interno cambia; se cambia il davanzale (finestra ↔ portafinestra) il rettangolo scende o sale con una battuta | coefficiente e cifre aggiornati |
| E1 | **Troppo piccola** | valore < 40 (e non in metri) | filo **molle**: una curva che pende sul lato sbagliato; il battifilo non batte | sotto il campo, ferro, icona Phosphor di avviso, bordo campo 2 px: "Una finestra da 12 cm non esiste: controlla la misura." |
| E2 | **Troppo grande** | 300 < valore < 400 | filo molle | "Oltre 3 metri è una vetrata: scrivi fino a 300 e il resto lo misuriamo noi al sopralluogo." |
| E3 | **Forse millimetri** | 400 ≤ valore ≤ 3000 e valore/10 tra 40 e 300 | filo molle | "Forse hai scritto in millimetri: 1180 mm sono 118 cm." [ Usa 118 ] (sostituisce il valore, fuoco resta nel campo) |
| E4 | **Forse metri** | valore con decimali tra 0,4 e 3 | filo molle | "Forse hai scritto in metri: 1,18 m sono 118 cm." [ Usa 118 ] |
| E5 | **Non è un numero** | lettere o simboli | filo molle | "Scrivi solo i centimetri, per esempio 118." |
| E6 | **Numero enorme** | > 3000 | filo molle | "Controlla la misura: scrivila in centimetri, tra 40 e 300." |
| A1 | **Avviso di coerenza** (non errore, non blocca) | portafinestra o alzante con altezza < 180; finestra con altezza + 90 > 280 | il disegno c'è, battuto | sotto le misure: "Una portafinestra alta 120 cm? Di solito è una finestra." [ Fai finestra ] · oppure "Una finestra alta 220 cm di solito parte da terra: è una portafinestra?" [ Fai portafinestra ] |
| Q1 | **Quantità al limite** | [−] a 1 o [+] a 20 | invariato | il bottone al limite è `aria-disabled`; a 20: "Più di 20? Scrivilo nel messaggio al telefono: al sopralluogo le contiamo insieme." |
| C1 | **Nome mancante** | invio con nome vuoto | invariato | "Come ti chiami? Serve a chi ti richiama." |
| C2 | **Contatto non valido** | uscita dal campo o invio | invariato | "Scrivi un numero di telefono o un'email: ti richiamiamo lì." |
| C3 | **Altro comune** | scelto "Altro comune" | invariato | campo "Quale comune?" + riga "Lavoriamo fino a 30 km da Cordenons: ti diciamo subito se ci arriviamo." |
| I0 | **Invio incompleto** | "Manda le misure" con qualcosa che manca | se mancano misure: il filo tratteggiato fa un piccolo sussulto (no con reduced motion) | tutti gli errori mostrati insieme, **fuoco sul primo campo sbagliato**, riepilogo sopra il bottone: "Per mandarle mancano: la larghezza e un recapito." |
| I1 | **Invio in corso** | invio valido (simulato, circa 900 ms) | il filo fa **una battuta lunga su tutto il perimetro** | bottone disabilitato con "Mando le misure…", `aria-busy` sulla colonna, nessuno spinner |
| OK | **Successo** | risposta ok | il disegno resta dov'è | sulla lastra, accanto al disegno (desktop) o al posto del bottone (telefono), **marcati a spruzzo** la data ("26 SET") e "Ricevute. Ti chiamiamo entro domani per il sopralluogo a Porcia. Tieni il metro a portata di mano." ◆ "Misura un'altra finestra" ◆ "Torna alla cronaca". Fuoco sulla frase (tabindex -1). Si salva `btf:inviata`, si cancella `btf:bozza`. `track("demo_prenotazione", …)` (sez. 7). **Niente cartolina, ricevuta, scontrino, busta** |
| OK2 | **Già mandata** | si riapre S3 con `btf:inviata` (dalla fascia o dalla tacca TU) | il disegno mandato, battuto, e la data a spruzzo | "Hai mandato 118 × 142, due ante, il 26 settembre. Ti richiamiamo noi." ◆ "Misura un'altra finestra" (porta a P0 tenendo nome, contatto e comune della sessione, non salvati) |
| OK3 | **Seconda finestra mandata** | successo dopo OK2 | come OK | "Ricevute anche queste. Al sopralluogo le guardiamo tutte." La tacca TU mostra l'ultima finestra con "×2" |
| F1 | **Invio fallito** | offline (`navigator.onLine === false`), errore o `?invio=errore` | il filo torna **molle** su tutto il perimetro | "Non è partita. Riprova tra poco oppure ◆ Chiama l'ufficio." (link `tel:` di esempio, niente numero in vista). Tutti i dati restano nei campi; fuoco sul messaggio; il bottone torna attivo |
| RM | **Reduced motion** | `prefers-reduced-motion: reduce` | nessuna battuta animata: il rettangolo compare intero; niente filo che oscilla; il filo molle è una curva ferma; la battuta lunga dell'invio è sostituita dal solo testo | invariato |

Regole trasversali degli stati:
- **Nessun rosso, nessun verde**: gli stati si capiscono da testo, icona e
  forma del filo (teso, battuto, molle). L'unico colore è il cobalto del
  gesso.
- Il bottone "Manda le misure" non è mai `disabled` prima dell'invio (resta a
  fuoco e dice cosa manca); lo è solo durante I1.
- Nessun errore compare mentre si scrive; un errore già visibile sparisce
  appena il valore diventa valido.

### 5.6 S4 · Il cartello (`#cartello`)

**1440**

```
|[← TORNA IN CICERI LAB]   BATTIFILO                     Cronaca   Il cartello   [ Misura e manda ]|
|                                        lastra a tutto schermo                                    |
|                 ▭ fascetta                                          ▭ fascetta                    |
|        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  [ Torna alla   |
|        ┃  IL CARTELLO  (h2 stencil calce su ferro, bordo calce 4 px)            ┃    cronaca ]   |
|        ┃  Impresa esecutrice    BATTIFILO costruzioni e serramenti              ┃                |
|        ┃  Sede                  via … , Cordenons (PN) (di esempio)             ┃                |
|        ┃  Ufficio               lun-ven 8-12, 14-18                             ┃                |
|        ┃  Magazzino serramenti  lun-ven 14-18, sabato 8.30-12: vieni a vedere   ┃                |
|        ┃                        i campioni                                      ┃                |
|        ┃  Contatti              ◆ Chiama   ◆ Scrivi   (esempio)                 ┃                |
|        ┃  Dove lavoriamo        Pordenone, Cordenons, Porcia, San Quirino,      ┃                |
|        ┃                        Fiume Veneto, Sacile                            ┃                |
|        ┃  Chi siamo             3 righe: squadra propria di muratori, posatori  ┃                |
|        ┃                        dei serramenti interni all'impresa              ┃                |
|        ┃  ◆ Apri in Maps (nuova scheda)     ◆ Leggi tutti i mesi                 ┃                |
|        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛                |
|        ≡ Un concept di Ciceri Lab. L'impresa, le persone e i recapiti sono inventati.            |
|        ≡ Foto: ◆ crediti (apre Tutti i mesi, in fondo)    ◆ Ricomincia da capo                   |
```

- Il cartello è un `<dl>` dentro un `<article aria-labelledby>`. Le righe sono
  coppie termine/descrizione: il lettore di schermo le legge come tabella.
- Nessuna foto, nessuna mappa disegnata. Nessun dato legale (partita IVA,
  permessi, direttore lavori).
- "Ricomincia da capo" chiede conferma in linea (non un dialogo): il testo
  diventa "Sicuro? Cancella le misure salvate e la tua tacca." [ Sì, ricomincia
  ] [ No ]. Poi porta a S0 con il fuoco sul marchio.
- Il cartello non ha "Misura e manda" dentro: c'è in fascia.

**375**: il cartello a tutta larghezza con 16 px di margine, fascette in alto,
righe impilate (termine in Chivo 700 14 px sopra, descrizione 16 px sotto).
La vista scorre. In fondo 96 px liberi per il bottone del Lab.

### 5.7 S5 · Tutti i mesi (`#mesi`)

**1440**: colonna di lettura larga al massimo 720 px su lastra, a sinistra a
c2; la vista scorre.

```
|  TUTTI I MESI  (h2 stencil)                                             [ Torna alla cronaca ]   |
|  ≡ Un cantiere tipo, raccontato con foto di cantieri diversi. Cifre di esempio, IVA esclusa.       |
|  ◆ vai a: marzo · aprile · … · chiavi   (indice in linea, link alle ancore)                        |
|                                                                                                   |
|  <ol>                                                                                             |
|   Marzo, mese 1: tracciamento e scavo   (h3)                                                      |
|   14.600 € · speso finora 14.600 €                                                                |
|   ≡ Fatto …  ≡ Chi c'era …  ≡ Fermi: nessuno  ≡ Controlla tu …                   ▒ foto 320 px  |
|   ◆ Vedilo nella cronaca                                                          didascalia     |
|   …                                                                                               |
|   Le chiavi (h3): il bilancio                                                                     |
|  </ol>                                                                                            |
|  Crediti delle foto (h3, id="crediti"): elenco autore, fonte, licenza                             |
|  ≡ Un concept di Ciceri Lab. Attività inventata.                                                  |
```

- `<ol>` vero; ogni voce `id="mese-N"`; entrando con `?mese=N#mesi` si scorre
  a quella voce (istantaneo) e il fuoco va al suo `h3`.
- "Vedilo nella cronaca": imposta il mese, chiude la vista, fuoco sulla
  cassetta.
- Foto piccole in `loading="lazy"`.
- Stampa: `@media print` stampa solo questa vista, senza fasce, foto in scala
  di grigi 50 mm.
- **375**: stessa colonna, foto a tutta larghezza sopra il testo di ogni mese.

### 5.8 Stati del palcoscenico (riepilogo)

| Stato | Quando | Cosa si vede |
|---|---|---|
| Caricamento | foto S0 non ancora arrivata | fascia, lastra con tutto il testo di S0 (è il LCP), area foto in tinta calcestruzzo ombra con la texture; nessuno spinner |
| Apertura | S0, primo arrivo | 5.1, battuta automatica dopo 600 ms |
| Ingresso con `?mese` | link a un mese | scheda del mese, linea battuta fino lì senza animazione, nessuna istruzione "Tira il filo" |
| Trascinamento | cassetta afferrata | filo teso, foto e scheda per fasi (≤ 3 cambi/s) |
| Battuta | rilascio, pausa 500 ms, tacca, tasto, rotella, swipe | aggancio, battuta, polvere, URL, annuncio |
| Ritorno indietro | mese < `btf:visto` | oltre la cassetta la linea chiara 55% |
| Mese con fermo | 2, 6, 10 | buco nella linea, riga del fermo sotto il filo quando ci sei, riga "Fermi" nella scheda |
| Mesi 7 e 12 | | link "Quanto costerebbe la tua finestra?" |
| Mese senza foto | piano B o errore | la lastra sale, fase grandissima |
| Scheda espansa | "Di più" | lastra sopra la foto, striscia di 20svh |
| Chiavi | 15 | 5.4 |
| Con tacca TU | dopo un invio | tacca TU a sinistra del gancio |
| Vista aperta | S3, S4, S5, menu | cronaca `inert`, sotto, ferma |
| Senza localStorage | privato o bloccato | tutto uguale, niente linea chiara al rientro, niente TU |

### 5.9 Altezze corte, orizzontale e zoom

- **Telefono in orizzontale e finestre basse larghe** (altezza < 480 e
  larghezza ≥ 600): foto a sinistra (40% della larghezza, tutta l'altezza sotto
  la fascia), lastra a destra con scheda che scorre in verticale e filo del
  tempo fermo in fondo alla lastra. S3: piano a sinistra, colonna a destra.
- **Modo documento** (altezza < 480 e larghezza < 600; è il caso dello zoom al
  400%: 1440×900 diventa 360×225, 1280×720 diventa 320×180): il palcoscenico
  smette di essere fisso e **la pagina scorre**: fascia non fissa, foto
  (altezza 50vw), scheda intera, filo del tempo con [‹][›] e slider, niente
  "Di più" (tutto aperto). Nessuno scroll orizzontale a 320 px. Le viste S3,
  S4, S5 diventano flusso normale. È WCAG 1.4.10 (reflow).
- **Zoom 200%** su 1440×900 (720×450): larghezza 720 e altezza < 480 → modo
  orizzontale corto (Paola, 4.3).
- Il bottone del Lab (fisso, non nostro) può coprire contenuti con lo zoom:
  ogni contenitore che scorre ha `scroll-padding-bottom: 72px` sotto 640 px e
  `scroll-padding-top: 72px` sopra, così il fuoco non finisce mai sotto il
  bottone.

---

## 6. Accessibilità (per ogni interazione)

### 6.1 Base

- `lang="it"`. Punti di riferimento: `header` (fascia alta), `nav`
  "Principale" (voci della fascia), `main` (la cronaca), le viste come
  `section role="dialog" aria-modal="true" aria-labelledby` (a tutto schermo;
  la cronaca dietro è `inert`). La fascia bassa è dentro `nav` "Scorciatoie".
- **Un solo `h1`**: la frase di S0 ("Quattordici mesi, dallo scavo alle
  chiavi."). Visibile in S0; nei mesi resta nel DOM come testo per lettori di
  schermo (classe visually-hidden), così la pagina ha sempre il suo titolo.
  Ogni scheda ha un `h2` (fase + mese); le viste hanno un `h2`; i mesi di S5
  un `h3`.
- Fuoco visibile ovunque: contorno 3 px cobalto con distanza 3 px sulla
  lastra, calce sulla fascia ferro e sul cartello. Mai `outline: none` senza
  sostituto.
- Area di tocco ≥ 44×44 ovunque (cassetta 44×56, tacche, [‹][›], [−][+],
  radio resi come righe da 52 px).
- Nessuna informazione solo nella foto, nel colore o nella forma: il filo
  molle ha sempre il testo d'errore; il buco ha sempre la frase del fermo; il
  disegno della finestra ha la sua didascalia testuale.
- `forced-colors: active`: linea, filo e disegno usano `CanvasText` e
  `Highlight` (SVG con `fill: currentColor`), il bottone cobalto diventa
  `ButtonText` su `ButtonFace` con bordo.
- Testo ingrandibile al 200% senza perdita; spaziatura del testo (WCAG
  1.4.12) senza tagli: nessuna altezza fissa sui blocchi di testo della scheda
  tranne dove c'è "Di più".

### 6.2 `prefers-reduced-motion: reduce`

Nessuna battuta animata (la linea compare già battuta fino al mese), nessuna
oscillazione del filo, nessuna polvere, cassetta che salta alla tacca senza
scorrere, foto con dissolvenza 150 ms, scheda con dissolvenza 150 ms, apertura
senza movimento (primo tratto già segnato), rettangolo della finestra intero,
lastra che sale ("Di più") senza transizione, menu senza dissolvenza. Tutto
resta comprensibile: nessuno stato è detto solo dal movimento.

### 6.3 Link di salto

"Vai al filo del tempo" (fuoco alla cassetta; se c'è una vista aperta, prima
la chiude) e "Leggi tutti i mesi" (apre S5). Nascosti finché non hanno il
fuoco, poi visibili in alto a sinistra **a 260 px** (non sotto il bottone del
Lab), calce su ferro.

### 6.4 La cassetta (slider del tempo)

- `role="slider"`, nome "Filo del tempo", `aria-valuemin="0"`,
  `aria-valuemax="15"`, `aria-valuenow`, `aria-valuetext` parlante:
  - 0: "Prima dello scavo: il terreno.";
  - 1-14: "Mese 8, ottobre: impianti. 41.200 euro. Speso finora 238.400
    euro." + se c'è un fermo " Cantiere fermo 19 giorni per ferie.";
  - 15: "Le chiavi: 14 mesi, finale 412.500 euro."
- Tasti: frecce destra/su +1, sinistra/giù −1, Pagina su +3, Pagina giù −3,
  Home 0, Fine 15. Tasto tenuto premuto: un passo ogni 250 ms (si ignora la
  ripetizione più rapida), battuta corta.
- Il puntatore sulla cassetta: `touch-action: none` solo sulla cassetta e
  sulla striscia del filo; mai sulla pagina intera.
- Annullamento del puntatore (WCAG 2.5.2): trascinare cambia il mese in modo
  reversibile; nessuna azione irreversibile al rilascio.
- Alternativa al trascinamento (WCAG 2.5.7): tacche, [‹][›], tastiera.

### 6.5 Le tacche

- Un `<ol aria-label="Mesi del cantiere">` di `<button>`: una sola fermata di
  tabulazione (tabindex mobile: la tacca corrente è `0`, le altre `-1`),
  frecce sinistra/destra spostano il **fuoco** tra le tacche senza cambiare
  mese, Home/Fine alla prima e all'ultima, Invio o Spazio vanno al mese.
- Nome accessibile completo: "Agosto, mese 6: struttura del tetto". La tacca
  corrente ha `aria-current="step"`.
- Tacche con fermo: `aria-describedby` alla frase del fermo, che compare anche
  a schermo quando la tacca ha il fuoco (stessa riga del passaggio col mouse).
- Tacca TU, se c'è, è la prima del gruppo: "La tua finestra, due ante 118 per
  142, mandata il 26 settembre. Apri Misura e manda."
- Su telefono, poiché il fuoco si sposta tra le tacche senza cambiare mese,
  la linea scorre quanto basta a mostrare la tacca a fuoco e torna centrata
  sulla cassetta quando il fuoco esce dal gruppo.

### 6.6 Foto, swipe e rotella

- Foto: `alt` che dice la verità ("Cantiere di un'altra casa: posa dei ferri
  della platea di fondazione."). Nella dissolvenza la foto uscente ha
  `aria-hidden="true"` e alt vuoto.
- Swipe e rotella non hanno equivalenti obbligatori perché sono scorciatoie
  degli stessi passi di [‹][›], tacche e tastiera.
- La rotella non blocca mai lo zoom né lo scroll dentro le viste.

### 6.7 "Di più", menu e viste

- "Di più": `button aria-expanded aria-controls`; testo che cambia in "Meno".
  Il fuoco resta sul bottone; il contenuto espanso segue nel DOM.
- Menu: `button aria-expanded aria-controls`; pannello con focus intrappolato,
  resto `inert`, Esc chiude, fuoco di ritorno a "Menu".
- Viste S3, S4, S5: all'apertura fuoco sull'`h2` (tabindex -1); Esc chiude
  (tranne mentre un `select` nativo è aperto); "Torna alla cronaca" è il primo
  controllo dopo l'`h2`; alla chiusura il fuoco torna a chi l'ha aperta (o
  alla cassetta, se quell'elemento non c'è più). Cronaca `inert`.

### 6.8 Misura e manda

- Ogni gruppo di scelta è `fieldset` + `legend` con radio veri (resi come
  righe o bottoni della lastra). Frecce per muoversi, la scelta segue il
  fuoco come nei radio nativi.
- Campi: etichetta visibile sopra, aiuto e errore collegati con
  `aria-describedby`, `aria-invalid` sugli errori, `autocomplete` (`name`, e
  per il contatto nessun `type` rigido: un campo che accetta entrambi),
  `inputmode` coerente, testo 17 px minimo (niente zoom automatico di iOS).
- I bottoni "Usa 118", "Fai finestra" hanno nome completo ("Usa 118
  centimetri come larghezza").
- [−][+]: `aria-label` "Una finestra in meno" / "Una finestra in più",
  `aria-controls` sul campo; dopo il clic, annuncio live "9 finestre uguali".
- **Il disegno**: SVG `aria-hidden="true"` dentro una `<figure>` la cui
  `<figcaption>` (visibile in piccolo sotto il piano: "La porta è 80 × 210 cm.
  Stessa scala.") ha un testo per lettori di schermo aggiornato con debounce
  1 s: "La tua finestra a due ante, 118 per 142 centimetri, 1,68 metri quadri
  di luce, disegnata accanto a una porta da 80 per 210." Non è letto a ogni
  cifra.
- La forbice: il totale ha `aria-live="polite"` con debounce 800 ms e annuncia
  solo "PVC da 950 a 1.380 euro a pezzo; per 9, da 8.550 a 12.420 euro." L'asse
  grafico è `aria-hidden`.
- Invio: errori tutti insieme, fuoco sul primo campo sbagliato, riepilogo in
  `role="alert"` solo al clic di invio (mai mentre si scrive). Successo e
  fallimento: il fuoco va al messaggio.
- Tastiera del telefono: il campo a fuoco non finisce mai sotto il piano né
  sotto il bottone del Lab (5.5.4).

### 6.9 Il cartello e i link

- `<dl>` per le righe; link "Chiama" e "Scrivi" con nome completo ("Chiama
  l'ufficio, numero di esempio"). "Apri in Maps" dice che apre una nuova
  scheda.
- "Ricomincia da capo": conferma in linea, i due bottoni ricevono il fuoco in
  ordine, nessun dialogo.

### 6.10 Lampeggi

- Dissolvenze ≥ 250 ms (150 ms solo con reduced motion, dove non c'è
  sequenza). Mai più di 3 cambi di foto al secondo, anche trascinando veloce.
- Nessun cambio di colore di grandi superfici più di 1 volta ogni 500 ms
  (limite del Lab): la foto è l'unica grande superficie che cambia, e la regola
  dei 3 al secondo va quindi abbassata a **2 al secondo** durante il
  trascinamento (500 ms tra due foto). Questa regola vince su quella dei 3 al
  secondo della direzione, che resta valida per la scheda di testo.
- La polvere: opacità bassa, niente bagliori.

---

## 7. CTA e punti di conversione

**Un solo intento, una sola etichetta: "Misura e manda"** (→ `#misura`).

| Posizione | Forma | Origine (`origine` in track) |
|---|---|---|
| Fascia alta desktop | bottone cobalto | `fascia` |
| Fascia alta tablet | bottone cobalto | `fascia` |
| Fascia bassa telefono | bottone cobalto | `fascia_bassa` |
| S0 (solo ≥ 641 px) | unico bottone della lastra | `apertura` |
| Mesi 7 e 12 | link cobalto fondo "Quanto costerebbe la tua finestra?" | `mese_7`, `mese_12` |
| Menu telefono | bottone cobalto | `menu` |
| Tacca TU | bottone nella linea | `tu` |
| Arrivo con `#misura` | | `url` |

"Manda le misure" è l'atto dentro il flusso, non un secondo richiamo.

**Conversione principale**: invio di Misura e manda (richiesta di sopralluogo
con misure e forbice già viste).

**Conversioni alternative** (per chi non vuole scrivere): "Chiama" e "Scrivi"
nel cartello, "Chiama l'ufficio" nell'errore d'invio, "Apri in Maps" (sabato
mattina il magazzino è aperto: vedere i campioni è già metà vendita).

**Analytics** (regola del sito vero: solo due eventi, il resto come
parametri):
- `track("apri_concept", { concept: 14, mese: <param o 0>, vista: "misura" | "cartello" | "mesi" | undefined })`
  una volta al montaggio.
- `track("demo_prenotazione", { concept: 14, tipo, materiale, quante, origine, comune_servito: true|false, mese_max: btf:visto, ritorno: true|false })`
  al successo dell'invio. Nessun dato personale nei parametri.
- Nessun altro evento (niente tracciamento dei mesi visti uno per uno).

**Gancio che converte**: il prezzo è **sempre visibile prima** dell'invio
(niente "lascia l'email per sapere il prezzo"), e la promessa accanto al
bottone è piccola e vera: "Ti chiamiamo entro domani. Al sopralluogo
rimisuriamo noi al millimetro."

**Per Luca (meta-conversione)**: il titolare di un'impresa che guarda il
concept deve pensare "le foto del mio cantiere, una al mese col telefono, e
questo è il mio sito". La riga del Lab in fondo alla lastra e nel cartello lo
riporta a Ciceri Lab.

---

## 8. Richieste ad altri agent

- **tech-architect / scaffold-engineer**: store con `mese` (0-15),
  `posizione` continua (solo ticker, non React), `vista` (`null | "misura" |
  "cartello" | "mesi" | "menu"`), sincronizzato con URL secondo 1.3; modulo
  puro `forbice.ts` (5.5.3) e `validaMisura.ts` (stati E1-E6, A1) testabili;
  `visualViewport` per la tastiera; `inert` per cronaca e viste; overflow di
  html/body e `scrollRestoration` ripristinati allo smontaggio; `?invio=errore`
  per la demo del fallimento; `viewport-fit=cover` nel meta viewport (servono
  le `env(safe-area-*)`); una primitiva comune `VistaLastra` (contenitore a
  tutto schermo con h2 a fuoco, Esc, ritorno del fuoco) usata da S3, S4, S5.
- **motion-designer**: la battuta d'apertura come descritta in 5.1 (la
  cassetta non si muove, il valore resta 0); battuta a quattro lati, battuta
  del lato corretto, battuta lunga dell'invio, filo molle (curva ferma), la
  lastra che sale per "Di più"; regola dei 2 cambi di foto al secondo durante
  il trascinamento (6.10).
- **art-director**: `object-position` per foto e per le tre fasce di
  larghezza (≤ 640, 641-1023, ≥ 1024) più l'orizzontale corto; limite della
  foto a 1920 px con la lastra ai lati (2.6); lastra per il "mese senza foto".
- **photo-editor**: una versione 2400 px della sola foto di S0.
- **copywriter**: limiti di lunghezza in 5.1 e 5.2; tutti i testi degli stati
  P0-F1 (5.5.6); `aria-valuetext` per le 16 posizioni; recapiti come link
  senza numeri in vista (anche nell'errore d'invio, dove la direzione scriveva
  il numero: prevale la regola del Lab); cifre d'esempio calcolate con
  `forbice.ts`.
- **creative-director** (solo per conferma, nessuna modifica al suo file):
  precisazione della battuta d'apertura (5.1), tacca TU fuori dalla scala
  (5.3.1), niente "Misura e manda" nella lastra di S0 su telefono (5.1),
  regola dei 2 cambi al secondo (6.10).
- **accessibility-auditor**: sez. 6 è la checklist di collaudo; controllare il
  modo documento a 320×180 e 360×225.
- **responsive-tester**: "Misura e manda" nella fascia bassa a 375 e 360 con
  il font vero; piano di S3 visibile con tastiera aperta; bottone del Lab che
  non copre "Manda le misure" né l'ultima riga del cartello; S0 a 375×667 con
  titolo intero.

---

## Sezioni da costruire

Una per section-builder, nomi in kebab-case, allineati ai nomi del
creative-director. Tutte usano lo store e la primitiva `VistaLastra` dello
scaffold; testi solo da `content/testi.ts`.

1. **`fascia`**: fascia ferro alta (marchio che riporta a S0, voci
   "Cronaca", "Il cartello", bottone "Misura e manda" con stato corrente), link
   di salto, zona libera per il ConceptBackButton, menu del telefono e del
   tablet (pannello a tutto schermo con focus intrappolato), fascia bassa del
   telefono con "Misura e manda" accanto al bottone del Lab, comportamento con
   tastiera aperta.
2. **`palcoscenico`**: la regia della cronaca: geometria foto/lastra per
   larghezza (5.0), texture della lastra come fondo, doppio livello foto con
   dissolvenza incrociata e `<picture>`, precarico mese prima e dopo, linea di
   terra, piano B "mese senza foto", swipe sulla foto, rotella a scatti, modo
   orizzontale corto e modo documento (5.9), annuncio `aria-live` dei cambi.
3. **`scheda-mese`**: il contenuto sulla lastra per le 16 posizioni: S0 (h1,
   riga, dichiarazione, bottone, istruzione "Tira il filo"), schede 1-14 con i
   cinque pezzi, fermi, link contestuali dei mesi 7 e 12, "Leggi tutti i mesi",
   didascalie, "Di più" con la lastra che sale, S2 Le chiavi con il bilancio.
4. **`filo-del-tempo`**: cassetta come slider vero, gancio, filo teso e
   battuta, linea battuta con buchi e parte chiara (`btf:visto`), tacche
   (gruppo con tabindex mobile), riga del fermo, tacca TU, polvere, battuta
   d'apertura, linea intera ≥ 720 px e linea che scorre sotto la cassetta con
   [‹][›] sotto 720 px.
5. **`tracciamento`**: il piano di S3: scala fissa, porta 80×210, linea di
   terra, davanzale, rettangolo della finestra con disegno del tipo, quote a
   stencil, filo teso/parziale/molle, battuta a quattro lati, ribattuta del
   lato, battuta lunga d'invio, data e frase del successo marcate a spruzzo,
   `figcaption` testuale, compressione con tastiera aperta.
6. **`misura-e-manda`**: la colonna di S3: intro, istruzioni con schema "come
   si misura", "Che cosa", larghezza/altezza con validazione E1-E6 e A1,
   "Quante uguali", la forbice sull'asse comune con scelta del materiale e
   totale, contatti, invio simulato, tutti gli stati P0-F1, bozza e
   `btf:inviata`, `track("demo_prenotazione")`.
7. **`cartello`**: S4: il cartello ferro con bordo calce e fascette, `<dl>`
   delle righe, "Chiama"/"Scrivi"/"Apri in Maps", "Leggi tutti i mesi",
   crediti, nota del Lab, "Ricomincia da capo" con conferma in linea.
8. **`tutti-i-mesi`**: S5: vista documento che scorre, indice in linea,
   `<ol>` dei 14 mesi più le chiavi con foto piccole e didascalie, "Vedilo
   nella cronaca", crediti delle foto (`#crediti`), stile di stampa.
