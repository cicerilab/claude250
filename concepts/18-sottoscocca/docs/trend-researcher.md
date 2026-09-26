# Trend researcher · Concept 18 · SOTTOSCOCCA (officina e gommista, Pordenone)

Ondata 1. Input letti: `docs/ruoli-agent.md`, `docs/concept-lab.md` (ricetta
bocciata), `docs/matrice-concept-11-20.md` (riga e paragrafo 18, verifica
incrociata), `concepts/18-sottoscocca/docs/creative-director.md` (direzione C,
QUOTA, vincolante da 4 in poi), `.claude/skills/taste/SKILL.md` e i suoi
`references/`, `concepts/10-torchio/docs/trend-researcher.md` (solo formato).

Scopo: dare all'ondata 2 (art-director, motion-designer, webgl-artist,
interaction-designer, copywriter, vector-artist, photo-editor) **principi da
reinterpretare**, **pattern da evitare** e i **rischi veri** del concept.
Nessun codice, nessuna copia di stile.

---

## 1. Fonti e metodo

### 1.1 /taste su siti reali (fatto davvero, 26/09/2026)

A differenza del pilota, stavolta la rete funziona. Playwright 1.56 (Chromium
in `/opt/pw-browsers`), viewport 1440x900, attesa 6 s, screenshot viewport +
pagina intera o 4 punti di scroll, `references/extract.js` eseguito nella
pagina. Output secondo la skill in `concepts/18-sottoscocca/docs/taste/`:
`{dominio}.md` + `{dominio}.json` (JSON validati, controllo anti-slop a 0
occorrenze, "Design Map" e "Taste DNA" presenti), screenshot scelti in
`docs/taste/shots/`.

| Sito | Perché è coerente col concept | Esito |
|---|---|---|
| `bendpak.com` | Produttore americano di ponti sollevatori: l'oggetto del concept visto da chi lo vende | Catturato. Utile soprattutto **come controesempio** del settore |
| `igloo.inc` | Sito dell'anno Awwwards 2024: un solo oggetto 3D, camera guidata dallo scroll | Catturato con WebGL SwiftShader (25 s di attesa, poi 4 colpi di rotella). DOM vuoto: le misure vengono dagli screenshot |
| `cal.com` | Strumento di prenotazione vero: come si legge uno slot di tempo libero | Catturato |
| `apple.com/it/airpods-pro/` | Pagina prodotto con scroll a tappe su un oggetto, testi brevi per schermata | Catturato |

**Rifiutati o scartati, dichiarati**: `euromaster.it`, `autodoc.it`,
`stertil-koni.com`, `ravaglioli.com`, `kwik-fit.com`, `driver-italia.it`
(connessione rifiutata dal proxy, codice 000); `norauto.it`, `fixter.co.uk`
(403); `awwwards.com` (000, il sito di raccolta non è raggiungibile).
`maha.de` (attrezzature d'officina tedesche) è stato catturato ma non ha
meritato un file /taste: lo cito solo come controesempio in 3.
Nessun gommista o officina di quartiere italiana è risultato raggiungibile:
il riferimento "di mestiere" resta quindi BendPak + MAHA, cioè i fornitori.

### 1.2 Sistemi dalla libreria locale `awesome-design-md` (letti)

| Sistema | Perché serve a SOTTOSCOCCA | Principio preso (non lo stile) |
|---|---|---|
| **spacex** | Fondo nero pieno, un solo oggetto tecnico protagonista, nessun colore di marca, "più titolo di film che landing page" | Austerità: nero, bianco e l'oggetto. Una frase e un'azione per fascia. Da **non** prendere: maiuscolo D-DIN spaziato e bottone pillola a contorno |
| **ibm** (Carbon) | Spigoli 0-4 px, un solo accento, gerarchia per peso e dimensione, pensato per dati densi | Il dato tecnico si mostra piatto, allineato, tabellare; il raggio 0 comunica "strumento", non "app" |
| **tesla** | Automobile con zero decorazione: niente ombre, niente gradienti, un solo colore d'azione, transizioni a 0,33 s | L'interfaccia non compete con il veicolo. Da **non** prendere: foto da concessionaria, carosello nell'apertura, chatbot fisso |
| **renault** | Auto per tutti (non lusso), superficie "configuratore" con pallini d'accento | Solo come controesempio: il configuratore con colori e pallini è il territorio di MERIDIANA e del Concept 2, non nostro |

---

## 2. Cosa hanno detto le misure (sintesi dei file /taste)

- **BendPak** apre con un video scuro dove il ponte **non si vede**, titolo
  Host Grotesk 700 a 70 px centrato ("We lift what moves you."), un bottone
  giallo `#FFDE17` a pillola. Il giallo copre l'1,6% dell'area. Sotto: schede
  grigie `#F0F2F4` a raggio 20 px, foto con operaio in casco e pollice sul
  lavoro, promo, cookie, chat, torna-su, carosello. È il sito di un catalogo,
  non di un luogo.
- **igloo.inc**: documento alto 900 px, lo scroll è catturato dal canvas;
  fondo unico `#A0A5B1` (100% dell'area), l'oggetto resta al centro e **si
  muove solo la camera**, un reticolo di linee bianche da 1 px con numeri ai
  nodi dichiara la costruzione del low-poly. Prezzo: 20 s di loader ASCII e
  zero testo nel DOM.
- **cal.com**: i giorni prenotabili stanno in una casella piena `#E0E0E0`,
  quelli no sono numeri nudi; la **durata si sceglie prima** (15m / 30m / 45m /
  1h) e poi compaiono gli slot. Il widget vero è il visual dell'apertura.
  Pillole ovunque (61 elementi a 100 px di raggio), schede bianche su
  `#F4F4F4`.
- **apple.com (AirPods Pro)**: documento di 27.914 px, ogni schermata ha **un
  titolo** (56-96 px, tracking negativo) e **un paragrafo**; prezzo "€ 249" e
  "Acquista" già nella prima schermata; barra locale sticky da 52 px con tre
  ancore; nessuna ombra nel DOM; `prefers-reduced-motion` gestito.

---

## 3. Principi da reinterpretare (10)

Ogni principio: da dove viene, poi **come si applica qui**.

### P1 · Si muove la camera, non il mondo
*Da: igloo.inc (oggetto fermo al centro, camera che si avvicina), spacex.*
**Qui**: nel binario del creative-director l'auto sale, ma deve restare
**sempre nella stessa zona dell'inquadratura** mentre la camera scende. Regola
per webgl-artist e motion-designer: il baricentro dell'auto a schermo non si
sposta più del 15% dell'altezza della finestra tra due chiavi. L'occhio non
insegue niente: capisce la salita da quello che cambia intorno (pavimento che
si allontana, colonne che scorrono, asta graduata).

### P2 · Il low-poly diventa scelta se dichiara la sua costruzione
*Da: igloo.inc (reticolo bianco 1 px con numeri ai vertici).*
**Qui**: non un reticolo astratto, ma **le quote vere**. Le linee bianche a
terra, la targhetta "3500 kg" sulla colonna e l'asta graduata sono il nostro
"reticolo": segni tecnici con numeri che dicono che il modello è in scala.
Materiali piatti in palette, nessuna texture Kenney. Niente wireframe
dell'auto (sarebbe il "blueprint" scartato con la variante A).

### P3 · Una quota, un fatto, un'azione
*Da: apple.com (un titolo e un paragrafo per schermata), spacex (una frase e
un'azione per fascia).*
**Qui**: a ogni plateau (20, 80, 180 cm) il DOM mostra **una** quota enorme in
Tektur, **una** frase, il listino di quella quota e i punti. Mai due
argomenti nella stessa schermata. Il copywriter scrive per plateau: massimo
2 frasi di corpo, poi numeri (euro, minuti, misure).

### P4 · Prezzo e azione alla prima schermata
*Da: apple.com ("€ 249 · Acquista" nell'apertura).*
**Qui**: "Trova un buco" è già nell'apertura (creative-director). Aggiungo:
accanto al bottone una riga sola con un **prezzo vero di ingresso** (per
esempio il cambio gomme stagionale) in Tektur tabellare. Il visitatore che
vuole solo il prezzo ce l'ha a 0 cm senza scorrere. Niente seconda CTA.

### P5 · La durata viene prima dell'orario
*Da: cal.com (selettore 15m / 30m / 45m / 1h sopra al calendario).*
**Qui**: è esattamente "Il ponte libero": il blocco nasce dai lavori scelti e
**la sua lunghezza** decide quali buchi sono validi. Regola per interaction e
ux: nel planning i buchi troppo corti non si nascondono, si mostrano con la
loro durata scritta ("50'") così il visitatore capisce perché non ci sta.
Differenza da cal.com: là si sceglie la durata da una lista astratta, qui la
durata è la somma dei pezzi toccati sotto l'auto.

### P6 · Il libero deve sembrare pieno, non vuoto
*Da: cal.com (giorni prenotabili in casella piena, gli altri nudi).*
**Qui**: rovesciamo con la metafora dell'officina: il **buco libero** è la
corsia scoperta con **linea tratteggiata bianca a terra** (creative-director),
cioè ha un segno proprio e non è semplice assenza. I blocchi occupati sono
nero grasso, pieni. Nella striscia dei giorni, i giorni con buchi hanno la
cifra in bianco pieno, quelli "pieno" in zincato con la parola scritta.

### P7 · Il prodotto vero è il visual
*Da: cal.com (widget reale al posto dell'illustrazione).*
**Qui**: il planning dei tre ponti non va "annunciato" con un'immagine: il
planning **è** la sezione. Nessuna foto di un calendario, nessuna icona. Il
blocco bianco del visitatore è l'elemento più luminoso della pagina dopo
l'asta.

### P8 · Un colore d'azione, razionato
*Da: bendpak (giallo all'1,6% dell'area), tesla (un solo blu), ibm (un solo
accento).*
**Qui**: l'accento è il **bianco segnaletica**. Regola misurabile per
l'art-director: il bianco pieno come superficie (bottone principale, blocco
del visitatore, punti attivi, indice di quota) sotto il **3% dell'area** della
finestra in ogni schermata; il bianco come testo non conta. Se supera, si
perde il segnale.

### P9 · Spigolo vivo = strumento
*Da: ibm (0-4 px), spacex (nessuna forma decorativa); controesempio bendpak e
cal.com (20 px e pillole ovunque).*
**Qui**: raggio 0 su tutto come da creative-director; l'unica rotondità sono i
tamponi (punti toccabili). È proprio il contrasto con le pillole dei siti del
settore e dei SaaS a dare identità: nessun bottone a pillola, nemmeno piccolo.

### P10 · Orientarsi senza tornare su
*Da: apple.com (barra locale sticky con 3 ancore).*
**Qui**: la barra non serve, perché l'**asta graduata** fa lo stesso lavoro
con un segno di mestiere: quote cliccabili, `aria-current`, numero corrente.
Principio da rispettare: deve essere sempre visibile e toccabile a 375 px
(32 px di larghezza, target 44 px in altezza per ogni quota) e non va
duplicata da un menu a sezioni.

---

## 4. Pattern inflazionati da evitare (10)

1. **La ricetta bocciata** (concept-lab): serif corsivo nei titoli, sezioni
   "01 ·" con maiuscoletto o monospace, schede bianche con bordino e ombra,
   dissolvenza dal basso ovunque, onde e divisori, mappa disegnata,
   prenotazione a passi che finisce in cartolina/scontrino, figure umane SVG.
2. **Il bocciato CHIAVE DEL TREDICI**: antracite + arancio pieno, condensato
   maiuscolo pesante, split testo/foto in cornice con "TAV. I", riga di
   quattro numeri tra filetti, libretto di manutenzione, sette spie, etichetta
   "Prenota il ponte".
3. **Hero da produttore di attrezzature** (bendpak, maha): video scuro dove
   l'oggetto non si vede, slogan centrato, CTA gialla a pillola, 4 tessere
   categoria con icona e freccia. È il sito di chi vende ponti, non di chi ci
   lavora sopra.
4. **Giallo e nero di sicurezza / estetica racing**: strisce di pericolo,
   bandiera a scacchi, contagiri, carbonio, fiamme. Il settore ne abusa
   (BendPak usa proprio il giallo); da noi zero.
5. **Stock posato col meccanico in casco o col pollice alzato** (bendpak
   mid-page: operaio in posa sul smontagomme). Il photo-editor lo scarta.
6. **Numeri-vanto aziendali in fila** (maha: "430.000 prodotti / 1.000
   dipendenti / 140 partner / 150 paesi" su fascia blu). Per un'officina di
   quartiere è falso e ricorda la riga di numeri del bocciato.
7. **Loader a percentuale o ASCII e scroll dirottato** (igloo.inc: 20 s di
   caricamento, documento da 900 px, testo solo nel canvas). Da noi: fermo
   immagine subito, scroll nativo, testo nel DOM.
8. **Configuratore auto**: rotazione libera, scelta colore, pallini d'accento
   su scheda bianca (renault, tesla). Territorio di MERIDIANA e del Concept 2.
9. **Pillole e schede grigie arrotondate da SaaS** (cal.com: 61 pillole,
   schede a 12 px; bendpak: 20 px). Contraddicono la lamiera tagliata.
10. **Chat fissa, torna-su, banner promo in cima** (bendpak, tesla): tre
    oggetti fissi che competono con asta graduata, barra "Il tuo lavoro" e
    `ConceptBackButton`. Nessun elemento fisso oltre a questi tre.

---

## 5. Rischi del concept (e cosa fare)

**R1 · Effetto giocattolo del Kenney.** Anche ricolorato, un'auto low-poly
vista da sotto può sembrare un gioco per bambini. *Mitigazione*: materiali
piatti della palette, il sottoscocca procedurale (coppa, scarico, dischi) con
proporzioni vere, scala coerente con il ponte e con la targhetta "3500 kg";
confronto con gli screenshot di igloo.inc: il low-poly regge quando la luce è
uniforme e i segni intorno sono tecnici. Piano B procedurale già previsto.

**R2 · Scroll lungo che stanca.** 4 quote con plateau possono fare 5-6
schermate prima di arrivare al prezzo dei freni. *Mitigazione*: P4 (prezzo
nell'apertura), asta cliccabile, elenco semplice sotto ogni quota; ux verifichi
che ogni plateau abbia altezza di scroll ≤ 1,2 finestre.

**R3 · Pagina che si legge solo nel canvas.** È l'errore di igloo.inc.
*Mitigazione*: tutto il testo (prezzi, tempi, punti) nel DOM; canvas
`aria-hidden`; test con WebGL spento fin dalla prima build.

**R4 · Contrasto sul verde.** Bianco su `#5E7564` circa 4,3:1: solo testo
grande. Tektur a larghezza 75 sotto i 24 px diventa fitto e perde leggibilità.
*Mitigazione*: Tektur mai sotto 20 px e mai per testo corrente (verificato:
Google Fonts serve Tektur con asse larghezza 75-100 e Red Hat Text, entrambi
rispondono 200).

**R5 · Planning illeggibile a 375 px.** Tre corsie da circa 96 px con blocchi
da 30' rischiano altezze di pochi pixel. *Mitigazione*: scala verticale
minima 1,2 px al minuto (30' = 36 px, sopra i 44 px dal blocco da 40'); il
blocco del visitatore mai sotto 44 px anche se 30'; etichette dei blocchi
occupati ridotte al tipo di lavoro.

**R6 · Trascinamento che litiga con lo scroll** (touch). Già gestito dal
creative-director (tocca il buco, tieni premuto per trascinare). Aggiungo:
l'elenco dei buchi compatibili come bottoni deve essere **visibile**, non solo
per lettore di schermo, perché su telefono sarà il metodo più usato.

**R7 · Peso e tempo di caricamento.** GLB circa 170 KB + three: il fermo
immagine WebP deve essere l'LCP, non il canvas. Mai loader (pattern 7).

**R8 · Vicinanza ad altri concept.** Scena 3D su fondo scuro può ricordare
12/13 se compare qualunque luce che segue il puntatore o una rivelazione;
verde con campo pieno ricorderebbe IMPRONTA. *Mitigazione*: luce piena e
ferma, verde solo su oggetti e pannelli (creative-director 4.9).

---

## 6. Note per agent

- **art-director**: P8 (bianco sotto il 3% dell'area), P9 (raggio 0, nessuna
  pillola), R4 (Tektur ≥ 20 px). Guardare `docs/taste/shots/bendpak.com-*.jpeg`
  come elenco di cosa non fare.
- **webgl-artist / motion-designer**: P1 (baricentro dell'auto stabile),
  P2 (i segni tecnici fanno da reticolo), R1, R7.
- **interaction-designer / ux**: P5, P6, R5, R6.
- **copywriter**: P3 (una quota, un fatto), P4 (un prezzo nell'apertura),
  pattern 6 (niente numeri-vanto).
- **photo-editor**: pattern 5 (niente operaio in posa), pattern 4.

## Richieste ad altri agent

Nessuna.
