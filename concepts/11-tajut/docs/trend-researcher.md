# Trend researcher · Concept 11 · TAJUT (osteria di paese)

Ondata 1. Input letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md`, `docs/processo-agent.md`, riga 11 e paragrafo TAJUT di
`docs/matrice-concept-11-20.md`, `concepts/11-tajut/docs/creative-director.md`,
`.claude/skills/taste/SKILL.md` (e i quattro file `references/`), il pilota
`concepts/10-torchio/docs/trend-researcher.md` (solo formato).

Scopo: dare all'ondata 2 (art-director, motion-designer, interaction-designer,
copywriter, vector-artist, photo-editor) **principi da reinterpretare**, un elenco
di **pattern da evitare** e i **rischi veri** del concept. Nessun codice.

La richiesta del creative-director (4.10) era: interfacce "a oggetti su un tavolo"
e giochi di carte nel browser fatti bene, per i principi di lancio e appoggio.

---

## 1. Fonti

### 1.1 /taste eseguito davvero (4 siti)

Playwright MCP non c'è in questa sessione: ho eseguito la pipeline della skill
con `playwright` npm (Chromium di `/opt/pw-browsers`) e il **metodo curl** di
`docs/lab-operativo.md`: ogni richiesta del browser è intercettata con
`page.route` e scaricata da curl con `--cacert /root/.ccr/ca-bundle.crt`, quindi
TLS verificato. Per ogni sito: viewport 1440×900, full page o metà pagina,
375×812, `references/extract.js` sul DOM, poi i quattro passi (misura, pattern,
gusto, osservatore) condensati in `{dominio}.md` + `{dominio}.json`. Controllo
anti-slop (grep delle parole vietate) = 0 su tutti; JSON validi.

| Sito | Perché è coerente con TAJUT | File |
|---|---|---|
| **cardsagainsthumanity.com** | L'apertura è fatta solo di carte ruotate stampate a due colori; le carte si girano in 3D e si trascinano. È il riferimento più vicino a "il sito è una mano di carte". | `docs/taste/cardsagainsthumanity.com.md/.json` |
| **cardgames.io/escoba/** | Gioco di carte nel browser con il **mazzo spagnolo** (coppe, denari, spade, bastoni: gli stessi semi delle triestine); tavolo, mazzo, mano e presa disposti come dal vero. Ho avviato una partita e fotografato la distribuzione a 150/400/800/1600/3500 ms. | `docs/taste/cardgames.io-escoba.md/.json` |
| **playbalatro.com** | Sito del gioco di carte più premiato del 2024: una carta come marchio, un solo font, ombra della carta. | `docs/taste/playbalatro.com.md/.json` |
| **playingcards.io** | Tavolo virtuale per giocare a carte con gli amici: la promessa "oggetti liberi su un tavolo" e l'azione principale (entrare in una stanza) in primo piano. Utile soprattutto come esempio di cosa non fare. | `docs/taste/playingcards.io.md/.json` |

Screenshot e dati grezzi del DOM: `concepts/11-tajut/qa/taste-curl/` (ignorata da
git), compresi `escoba-deal-*.jpeg` (sequenza della distribuzione) e
`cah-drag-*.jpeg` (prova di trascinamento).

### 1.2 Domini rifiutati o scartati (dichiarati)

| Dominio | Esito | Sostituito da |
|---|---|---|
| `modiano.it` (Trieste, produttore delle triestine) | "Robot Challenge Screen": pagina anti-bot, nessun contenuto | cardgames.io/escoba (stessi semi) |
| `dalnegro.com` (Treviso, carte regionali) | "Robot Challenge Screen" | come sopra |
| `briscola.it` | "upstream request failed" | come sopra |
| `solitaired.com` | lo screenshot va in timeout (pubblicità che non finiscono di caricare) | playingcards.io |
| `neal.fun` | catturato, ma è una griglia di schede: nessun principio utile per un tavolo | nessuno |
| `awwwards.com` | connessione chiusa dal proxy (come nel pilota) | non serve: i quattro siti sono stati scelti a mano |

Nota per l'orchestratore: prima dell'interruzione avevo fatto una prima serie di
catture con `ignoreHTTPSErrors` (verifica TLS allentata). Le ho **rifatte tutte**
con il metodo curl in `qa/taste-curl/`; la vecchia cartella
`concepts/11-tajut/qa/taste/` non va usata. Non ho potuto cancellarla (il
controllo di sicurezza ha bloccato la rimozione): va cancellata a mano.

### 1.3 Libreria awesome-design-md (3 sistemi letti)

| Sistema | Perché è utile a TAJUT | Cosa ne prendo (principio, non stile) |
|---|---|---|
| **nintendo-2001** | Tratta la pagina come l'oggetto fisico del prodotto (la mascherina della console); il colore caldo è riservato a una sola funzione: "dove andare". | La pagina è **assemblata da oggetti**, non impaginata. E il colore caldo significa azione: da noi l'ocra sta solo su bottone di prenotazione, carta dell'oste e seconda tinta dei semi. Da non prendere: bevel, cromature, contorni sui titoli. |
| **starbucks** | Ospitalità vera; l'oro è riservato alla "cerimonia" dei premi, mai come accento generico; i prodotti fisici (le gift card) sono fotografati come oggetti veri. | **L'accento si guadagna**: l'ocra ha il suo momento cerimoniale, la carta dell'oste col numero del tavolo. Le carte sono trattate come prodotto stampato vero. Da non prendere: fondo crema (vietato), bottoni a pillola, bottone flottante. |
| **wise** | Display pesantissimo (900) con interlinea sotto 1, una sola tinta d'accento, fondo tinto invece del bianco. | Un display grasso regge solo se è **corto e grande**: Bagel Fat One sotto le 4 parole, interlinea 0,9-1. Un solo accento, mai un secondo. Il fondo è sempre tinto (formica), il bianco-carta solo sugli oggetti. Da non prendere: angoli a 24 px, verde lime. |

---

## 2. Principi da reinterpretare (10)

**P1 · Le carte sono il layout, non lo decorano.** (cardsagainsthumanity)
In apertura non c'è griglia: una decina di carte ruotate tra -14° e +8°,
alcune tagliate dal bordo, e il testo è stampato sopra le carte.
*Come si applica qui*: sul tavolo di TAJUT non esistono riquadri, colonne o
schede. Tutto ciò che si legge sta su una carta, sul dorso del mazzo o
direttamente sulla formica (massimo 4 elementi in apertura, come fissato in
4.2). Se un contenuto "non sta su una carta", va riscritto, non incorniciato.

**P2 · Due colori di stampa bastano.** (cardsagainsthumanity: nero 61%, bianco 22%, giallo 0,5%)
Il gioco stampato in due colori dà al sito un'identità più forte di una tavolozza.
*Come si applica qui*: facce stampate in prugna `#2B2238` e ocra `#D69A2D`,
nient'altro. La formica è il tavolo, non un terzo colore di stampa. Test: se
una carta si potesse stampare solo con due lastre, è giusta.

**P3 · Il giro è 3D, la carta resta piatta.** (cardsagainsthumanity)
Le carte si girano con `rotateY(180°)` ma senza ombre lunghe e senza spessore:
restano fogli. Misurato: matrix3d con scala Z -1, `box-shadow: none`.
*Come si applica qui*: prospettiva grande e quasi zenitale (1600-2200 px, come
in 4.3), nessuno spessore del cartoncino, ombra prugna corta che si stringe
all'atterraggio. La carta non galleggia mai sopra il tavolo più del volo.

**P4 · Un solo oggetto in movimento per volta.** (cardgames.io, frame 150/400/800 ms)
La distribuzione manda una carta per volta: l'occhio segue un oggetto e capisce
chi riceve cosa senza istruzioni.
*Come si applica qui*: conferma la regola "al massimo una carta in volo". Anche
l'arrivo delle sei carte in mano (400 ms totali) e delle tre della
prenotazione (120 ms di intervallo) deve leggersi come una fila, mai come uno
sciame che parte insieme.

**P5 · Il posto sul tavolo dice il ruolo.** (cardgames.io)
Mazzo in alto a sinistra, mano in basso, carte giocate al centro, avversari
sui lati: la geometria del tavolo vero è già la navigazione.
*Come si applica qui*: i posti sono fissi e non cambiano mai: mazzo con
briscola in alto a sinistra, posto dell'oste in alto a destra, lettura al
centro, presa a destra del centro, mano in basso. Nessuna etichetta "menu",
"contatti". Stessi posti a 375 (solo più stretti), come nel 4.8.

**P6 · Mano sovrapposta, indice sempre scoperto.** (cardgames.io: passo 35 px su carte da 69 px)
Le carte in mano si coprono per metà ma l'indice d'angolo resta visibile: basta
per scegliere.
*Come si applica qui*: nella mano di sei, la parte scoperta di ogni carta
(circa 58 px a 375) deve contenere indice (numero in Bagel + seme) **e** il
titolo breve. L'art-director fissa la zona scoperta come area di sicurezza
tipografica; se non ci sta, la mano scorre di lato (4.8), mai testo tagliato.

**P7 · La carta dentro il marchio.** (playbalatro: l'asso al posto di una lettera)
Il logo dice il gioco senza sottotitolo.
*Come si applica qui*: "Al Tajut" vive sul dorso del mazzo, cioè il marchio
**è** un oggetto del tavolo, non un'intestazione. Il titolo grande
dell'apertura riprende la stessa stampa del dorso, non un logo a parte.

**P8 · L'accento caldo significa una cosa sola.** (nintendo-2001, starbucks)
Colore caldo = azione (Nintendo) o cerimonia (l'oro di Starbucks, mai generico).
*Come si applica qui*: l'ocra pieno compare solo su "Prenota un tavolo", sulla
carta dell'oste e come seconda tinta dei semi. Mai su link, bordi, icone,
focus o stati di hover. Così la carta dell'oste che arriva ocra "suona" come
il momento importante.

**P9 · Display grasso, corto, stretto.** (wise: peso 900, interlinea 0,85)
Un carattere pesantissimo regge solo in poche parole grandi.
*Come si applica qui*: Bagel Fat One sempre sotto le 4 parole, interlinea
0,9-1, mai spaziato, mai tutto maiuscolo, mai sotto i 20 px (sotto si impasta).
Tutto il resto Literata. Il contrasto tra le due voci è la gerarchia.

**P10 · L'azione principale è un gesto normale, subito.** (playingcards.io: il campo del codice stanza sotto l'hero)
Chi arriva con uno scopo preciso deve poterlo fare in un tocco.
*Come si applica qui*: il gioco non si mette mai in mezzo. "Prenota un tavolo"
visibile in apertura, tocco semplice = lancio automatico, e la vista "Leggi
come un menù" sempre raggiungibile. Il trascinamento è il piacere, non la
porta d'ingresso.

---

## 3. Pattern inflazionati da evitare (10)

1. **La ricetta bocciata** (da `docs/concept-lab.md`): titoli in serif corsivo +
   sottotitolo sans; sezioni "01 ·" con maiuscoletto spaziato o monospace; griglie
   di schede bianche con bordino e ombra leggera; fade-up dal basso ovunque;
   onde, filetti e divisori tra sezioni; mappa disegnata; prenotazione a passi
   che finisce in cartolina o scontrino; figure umane in SVG. In TAJUT si
   traduce anche così: niente righe di orari tra filetti, niente conferma a
   ricevuta, niente cameriere o oste disegnato.
2. **Il ventaglio ad arco che ruota** attorno a un centro (il quadrante di 15
   NOVANTA e il cliché di tutti i "card carousel"). La mano è una fila
   irregolare.
3. **Il casinò**: panno verde scuro, fiches, carte francesi, neon, oro. È
   esattamente il repertorio di playingcards.io e di cardgames.io (verde
   `#00A000`/`#006400`, dorsi rossi a quadretti). Il nostro verde è formica
   chiara `#A8D5C5`.
4. **Carte da collezione**: riflesso olografico che segue il mouse, tilt 3D al
   passaggio (vanilla-tilt), bordi dorati, lucentezza. Molto diffuso nei siti
   "card" del 2024-2026; da noi la carta è cartoncino economico da osteria.
5. **Contenuto a caso a ogni visita** (cardsagainsthumanity cambia le frasi a
   ogni caricamento): va bene per le battute, non per un'osteria. Le carte
   stanno sempre nello stesso posto.
6. **Il preloader "sto mescolando il mazzo"** e ogni animazione d'attesa: il
   tavolo c'è già.
7. **Il suggerimento animato ripetuto** ("trascinami", carta che oscilla, mano
   che respira). Una sola apertura, poi nulla si muove da solo.
8. **Il velo scuro modale** dietro la carta aperta (il classico lightbox):
   il tavolo si abbassa del 30% di formica, non si oscura.
9. **Ombre nere lunghe e sfocate** sulle carte (tipo Balatro, `0 12px 20px`
   all'85%): su fondo chiaro fanno "sticker che galleggia". Ombre prugna corte
   al 14-22%.
10. **Fumetto e figure**: personaggi cartoon, sole a raggiera, testate
    gonfiate con contorno (Slackey di cardgames.io, i ragazzi di
    playingcards.io, i volti degli avversari). Niente figure, anche perché le
    triestine 8-9-10 sono figure e sono escluse.

Extra, specifici: niente carrello/scheda prodotto (cardsagainsthumanity
sotto la piega diventa una griglia di schede colorate: esattamente la bento che
TAJUT non deve diventare), niente seconda tinta d'accento per i semi (rosso per
coppe, blu per spade), niente font a pixel o "retrò da videogioco" per il testo.

---

## 4. Rischi del concept e come ridurli

### 4.1 Diventare un videogioco invece di un'osteria
Tutti i riferimenti più vicini (Balatro, cardgames.io, playingcards.io) sono
giochi. Se il tavolo è troppo "gioco", il sessantenne che cerca l'orario
chiude.
- Ogni carta in mano dice cosa contiene (titolo breve), non solo seme e numero.
- Tocco = gioca. Nessuna regola da imparare, nessun punteggio, nessun turno.
- Controllo di qualità: una persona che non ha mai giocato a briscola trova
  orari e telefono in due tocchi.

### 4.2 Leggibilità a 375 px
Il riferimento cardgames.io a 375 ha carte da 69×94 px: si gioca, ma non si
legge niente sopra. Da noi sulle carte si leggono menù e prezzi.
- Mano: area scoperta minima con indice + titolo (P6); sotto i 360 px scorre.
- Carta aperta: 88% di larghezza, testo Literata ≥ 16 px, scorrimento dentro la
  carta con l'indice fermo.
- La proporzione 1:1,9 delle triestine è stretta e alta: sui telefoni aiuta
  (verticale), su 1440 × 900 la carta aperta va limitata in altezza e la presa
  riempie il lato destro.

### 4.3 Il verde acqua chiaro a tutto schermo
`#A8D5C5` pieno è un colore da ospedale o da piscina se è digitale e piatto.
- La granitura finissima del laminato (2-3%) e il bordo di alluminio rigato
  sono ciò che lo rende materiale: non toglierli per peso.
- Nessun testo grigio sulla formica: il secondario si fa con dimensione, mai
  con un prugna schiarito.
- La carta `#FBF6EA` non supera il 35% dello schermo (regola 4.1 del
  creative-director): con una carta aperta a 375 px è il limite più facile da
  sforare. Verificare negli screenshot.

### 4.4 Fisica che stanca o che sembra finta
- Una frenata sola, 1-2% di assestamento, niente rimbalzi (P3, P4).
- 520-700 ms per il volo: oltre, chi apre la terza carta si spazientisce.
  cardgames.io usa 100 ms per la carta in mano e circa 200 ms per carta nella
  distribuzione: la nostra durata più lunga si giustifica solo perché capita
  una volta per contenuto.
- Reduced motion: dissolvenza 150 ms, nessun volo (già in 4.9).

### 4.5 Somiglianze con altri concept
- 15 NOVANTA: nessun arco (pattern 2).
- 20 IMBRUNIRE: camera ferma, niente ambiente in cui si entra (P3).
- 13 CONTROPELO: TAJUT è chiaro e fatto di oggetti da spostare, non una
  superficie da pulire.

### 4.6 Accessibilità del gesto
cardsagainsthumanity mette `cursor: pointer` su tutte le carte ma nessuna
alternativa evidente al trascinamento; playingcards.io non ha focus visibile
rilevabile. Per TAJUT: roving tabindex nella mano, focus prugna 2 px a 3 px di
distanza anche su carte ruotate, `touch-action: none` solo sulle carte.

---

## 5. Sintesi per l'ondata 2

- **art-director**: P1, P2, P7, P8, P9 e i rischi 4.2 e 4.3 (zona scoperta
  della mano come area di sicurezza tipografica, Bagel mai sotto 20 px,
  nessun testo grigio, carta ≤ 35%).
- **motion-designer**: P3, P4 e i pattern 6, 7, 8, 9; rischio 4.4.
- **interaction-designer**: P5, P6, P10 e rischio 4.6.
- **vector-artist**: P2 (semi a due lastre, prugna + campitura ocra), pattern
  3 e 10 (niente figure, niente decorazioni delle triestine vere).
- **copywriter**: P10 (i titoli brevi in mano sono il vero indice), pattern 5
  (niente frasi a caso).
- **photo-editor**: foto solo nel campo centrale della carta, stampa povera
  (P2): niente foto "lifestyle" lucide.

## Richieste ad altri agent

- **Orchestratore**: cancellare `concepts/11-tajut/qa/taste/` (catture della prima
  prova, fatte con verifica TLS allentata e quindi da non usare); quelle valide
  sono in `qa/taste-curl/`.
