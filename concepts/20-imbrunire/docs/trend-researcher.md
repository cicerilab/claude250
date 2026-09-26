# Trend researcher · Concept 20 · IMBRUNIRE (albergo di sette stanze, Pordenone)

Ondata 1. Input letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`,
`docs/concept-lab.md` (ricetta bocciata), riga e paragrafo 20 di
`docs/matrice-concept-11-20.md` con la verifica incrociata,
`concepts/20-imbrunire/docs/creative-director.md` (vincolante da §4),
`.claude/skills/taste/SKILL.md`, formato di `concepts/10-torchio/docs/trend-researcher.md`.

Scopo: dare all'ondata 2 (art-director, motion-designer, interaction-designer,
copywriter, vector-artist, photo-editor) **principi da reinterpretare**, **cose da
non fare** e i **rischi veri** del concept. Nessun codice. Il creative-director
ha già fissato palette, font, struttura e meccanica: qui non si ridiscute nulla
di questo, si danno ragioni e misure per eseguirlo bene.

---

## 1. Fonti e cosa è stato bloccato

### 1.1 /taste sui siti reali (fatto davvero, 26/09/2026)

Playwright MCP non è installato in questa sessione, quindi la pipeline di
`/taste` è stata eseguita con uno script Playwright equivalente (Chromium di
`/opt/pw-browsers`, finestra 1440×900, attesa 9 s + scorrimento completo per
il lazy-load, screenshot della finestra + intera o metà/piede, `references/extract.js`
per i dati DOM). Screenshot in `concepts/20-imbrunire/qa/taste/` (ignorati da
git), risultati in `concepts/20-imbrunire/docs/taste/{dominio}.md` e `.json`
(Design Map + Taste DNA, controllo anti-slop a 0, JSON validi).

Criterio di scelta: piccoli alberghi di palazzo o di casa, poche stanze, ogni
stanza diversa, identità presa dal luogo.

| Sito | Perché è coerente | Esito |
|---|---|---|
| **palazzoexperimental.com** (palazzo a Venezia, Dorsoduro) | palazzo storico italiano, materiali veri come marchio | **analizzato**, cattura completa |
| **hotel-henriette.com** (piccolo albergo a Vienna) | navigazione che mette le stanze prima di tutto | **analizzato**; il video d'apertura non si carica in headless |
| **etthem.se** (casa di 12 stanze a Stoccolma) | tono di casa privata, pochissime parole | **analizzato** al terzo tentativo; foto d'apertura non caricata |
| **hotelparticulier.com** (maison a Montmartre) | "si guarda dentro una casa" | **analizzato** in modo parziale: le foto restano grigie, valori d'immagine approssimati |
| lesirenuse.it / sirenuse.it | palazzo a Positano | **rifiutato** (403) |
| hotelsanders.com, casacook.com, palazzodaniele.com | piccoli alberghi d'autore | **rifiutati** (`ERR_TOO_MANY_RETRIES`) |
| masseriamoroseta.it | poche stanze, Puglia | **errore del server** (Cloudflare 520) |
| sextantio.it (albergo diffuso) | pietra, stanze tutte diverse | caricato ma **vuoto** dietro il banner cookie: scartato |
| jkplace.com | palazzo a Firenze | **fermo sul preloader** dopo 9 s: scartato (e il preloader è già un pattern da evitare) |
| hotellesdeuxgares.com, hoteltassel.com, villalena.it | vari | nessuna risposta |

Limite dichiarato: 3 siti su 4 hanno la foto o il video d'apertura non
caricato in headless; per quei siti ho usato solo struttura, tipografia,
colori e gerarchia, non il trattamento fotografico.

### 1.2 Sistemi da `design-references/awesome-design-md/design-md/` (letti)

| Sistema | Perché serve a IMBRUNIRE | Cosa ne prendo (principio, non stile) |
|---|---|---|
| **bugatti** | fondo quasi nero, nessun accento, "la fotografia è l'unico elemento di profondità", niente ombre né gradienti, 120 px tra le bande | su un sito scuro la profondità la danno le foto e la luce, non la cromatura dell'interfaccia; il vuoto scuro attorno alla foto la fa pesare |
| **spacex** | canvas nero, foto a tutto campo, un solo bottone per banda, nav fissa minima | un solo gesto per schermata; testo chiaro diretto sul nero, nessun pannello |
| **apple** | "l'interfaccia arretra perché il prodotto parli", un solo colore d'interazione, nessuna ombra sulla cromatura | la luce `#F2C77C` come unico colore d'interazione, esattamente come l'Action Blue: ogni cosa toccabile e nient'altro |
| **airbnb** (controesempio) | il calendario di prenotazione più copiato: griglia mensile, giorno selezionato in pillola piena `#222`, barra "Dove / Quando / Chi" a pillola | è esattamente ciò che il nastro delle lune **non** deve richiamare: niente pillola piena che collega i giorni, niente griglia 7×5, niente barra di ricerca segmentata |

---

## 2. Principi da reinterpretare (10)

### P1 · Il marchio è un materiale del posto, fotografato o costruito
*Da: palazzoexperimental.com (l'apertura è una lastra di terrazzo con le lettere incise, foto a tutto schermo, nessun titolo HTML sopra).*
**In IMBRUNIRE**: il nome non è un logo in testata, è l'iscrizione ALBERGO
IMBRUNIRE sulla parete dell'androne, "incisa" nell'intonaco (Marcellus maiuscolo
tono su tono con ombra interna corta, non oro). In testata resta solo il nome
piccolo in alto al centro. L'art-director tratta l'iscrizione come un materiale
(intonaco scavato), non come un titolo.

### P2 · Le stanze prima dell'albergo
*Da: hotel-henriette.com (il primo link della navigazione è "Rooms & Offers", prima del racconto dell'albergo).*
**In IMBRUNIRE**: il palazzo in sezione è già questo principio portato
all'estremo: la prima cosa che si vede sono le sette stanze. Conseguenza per il
copywriter: nessun paragrafo "chi siamo" prima delle stanze; la frase su chi
tiene l'albergo sta sotto il cornicione ed è una riga.

### P3 · Pochissime parole, tutte concrete
*Da: etthem.se (home con una frase sola, testo a 380 px di larghezza massima).*
**In IMBRUNIRE**: ogni cella dice tre cose (nome, "da 132 € a notte",
"occupata" se serve). Il pannello di stanza ha due righe di carattere e poi
dati (metri, letto, bagno, piano, scale). Regola misurabile per il
copywriter: nessuna frase di pannello sopra 90 caratteri, nessun aggettivo
senza un fatto accanto ("luminosa" no, "finestra alta sul campanile" sì).

### P4 · Due registri di fondo, il cambio fa da divisore
*Da: palazzoexperimental.com (nero pieno per le bande di titolo, sabbia per il testo, confine netto senza filetti).*
**In IMBRUNIRE**: i registri sono **notte** (cielo, pannelli, testo) e
**intonaco/poché** (il palazzo). Dove si incontrano non serve nessuna linea: il
bordo del muro tagliato è il divisore. Nessun filetto, nessuna onda, nessun
bordo sottile di pannello: il pannello della stanza si stacca dalla foto solo
per il fondo notte al 92%.

### P5 · La profondità la fanno foto e luce, non l'interfaccia
*Da: bugatti ("photography is the only depth element", niente ombre né gradienti), apple (nessuna ombra sulla cromatura).*
**In IMBRUNIRE**: le uniche ombre ammesse stanno **dentro le scatole** (angoli
tra parete e pavimento, sotto il solaio) e sono fisiche: calde, corte,
coerenti con una lampada nella stanza. Bottoni, pannelli, nastro: nessun
`box-shadow`, nessun vetro sfocato. Se un elemento dell'interfaccia sembra
"sollevato", è sbagliato.

### P6 · Un solo colore d'interazione, e coincide con la luce accesa
*Da: apple (un solo blu per tutto ciò che si tocca), bugatti (nessun accento).*
**In IMBRUNIRE**: `#F2C77C` significa "acceso/scelto/toccabile": stanza
libera, luna selezionata, ora d'arrivo scelta, bottone primario, focus. Mai su
decorazioni, mai su icone informative, mai sui link di piede (che stanno in
luna). Così la metafora e l'interfaccia dicono la stessa cosa: dove c'è luce,
puoi andare.

### P7 · Guardare dentro una casa: la cornice fa il gesto
*Da: hotelparticulier.com (il video d'apertura sta dentro un passe-partout nero di 50 px: si guarda "dentro").*
**In IMBRUNIRE**: la cornice è il poché. Lo spessore dei muri e dei solai
tagliati è l'elemento che rende credibile la sezione: l'art-director lo fissi in
misure assolute (indicativo: muri 16-20 px a 1440, solai 20-24 px, a 375 i 16 px
già decisi dal creative-director) e non lo assottigli mai per "fare spazio".
Un poché sottile trasforma la sezione in una griglia di schede.

### P8 · Un gesto per schermata
*Da: spacex (un solo bottone per banda), creative-director §4 punto 3.*
**In IMBRUNIRE**: sul palazzo si tocca, sul nastro si trascina, nel pannello si
compila. L'interaction-designer verifichi che nessuna schermata chieda due
gesti diversi nello stesso punto (per esempio: niente trascinamento sul palazzo
a mobile mentre il foglio delle lune è aperto; il palazzo ridotto lì è solo da
guardare, un tocco al massimo).

### P9 · L'indirizzo è una firma
*Da: hotelparticulier.com ("23, avenue Junot, pavillon D" come didascalia sul video).*
**In IMBRUNIRE**: il portico, in fondo, chiude con l'indirizzo di esempio sotto
i portici e i minuti a piedi. È il posto dove il luogo diventa concreto. Il
copywriter non lo ripete in testata né in un piede lungo: una volta, bene, nel
portico, più il link "Apri in Maps".

### P10 · Il movimento ha la velocità dell'ora
*Da: nessun sito in particolare; è la conclusione del confronto con i siti catturati, dove tutte le transizioni sono 0,15-0,5 s (hotelparticulier `0.5s ease-in-out`, henriette `color 0.3s`, `opacity 0.2s`).*
**In IMBRUNIRE**: le transizioni dell'interfaccia (hover, focus, bottoni)
restano rapide (150-250 ms); **la luce** invece ha i tempi lunghi del
creative-director (900-1400 ms). Il contrasto tra le due velocità è la firma:
l'interfaccia risponde subito, le stanze si accendono come lampade vere. Il
motion-designer non deve "armonizzare" le due cose portando tutto a 400 ms.

---

## 3. Pattern inflazionati da evitare (10)

I primi quattro sono la ricetta bocciata di `docs/concept-lab.md` (divieto
assoluto), gli altri vengono dai siti visti e da ciò che oggi rende un sito di
albergo "di maniera".

1. **La ricetta bocciata, per intero**: titolo serif corsivo + sottotitolo
   sans; sezioni "01 ·" con maiuscoletto spaziato o monospace; schede bianche
   con bordino e ombra; fade-up uguale ovunque; onde e filetti; mappa
   disegnata; prenotazione a passi che finisce in cartolina/scontrino; figure
   umane in SVG. Il bocciato SETTE CHIAVI li aveva quasi tutti.
2. **Serif con una parola in corsivo colorato** ("at *Il Palazzo
   Experimental*" sul sito veneziano, "gancio" in oro nel bocciato). Marcellus
   non ha corsivo e non si simula.
3. **Maiuscolo spaziato largo per tutto** (hotelparticulier: nav 11,3 px
   maiuscolo; J.K. Place: "P L A C E"). In IMBRUNIRE il maiuscolo è solo
   Marcellus a +0,04em; Commissioner è sempre in tondo.
4. **Prenotazione a passi numerati con cartolina finale**: la chiusura è la
   stanza che resta accesa e la luna della prima notte.
5. **Calendario a griglia con pillola piena tra arrivo e partenza** (il
   date-picker di airbnb, copiato da quasi tutti i motori di prenotazione):
   niente griglia 7×5, niente barra riempita che unisce le notti; sul nastro
   la selezione è alone + base di luce sotto ogni luna.
6. **Preloader con logo al centro** (jkplace.com: dopo 9 s ancora fermo sul
   riquadro con il logo). Il palazzo si vede subito, spento, e si accende:
   quella è l'apertura, non un caricamento.
7. **Video d'apertura a tutto schermo con una frase sopra** ("Naturally
   different. Sustainably unique." su henriette): generico e pesante; nel
   nostro caso sarebbe un secondo protagonista che ruba la scena al palazzo.
8. **Barra dei vantaggi o due bottoni di pari peso** (henriette: ENQUIRE +
   BOOK affiancati, barra "best price guarantee" fissa). Un solo intento
   primario: "Scegli le lune". Niente "miglior prezzo garantito", niente
   stelle, niente punteggi o loghi di portali.
9. **Cielo al tramonto sfumato viola-arancio con stelle che brillano**: è la
   scorciatoia visiva di ogni "sera" su Dribbble. Il cielo è `#1F2638` fermo,
   al massimo 3-4 punti di luminosità vicino ai tetti.
10. **Casa di bambola isometrica illustrata** (i riferimenti "dollhouse" di
    Dribbble: palazzine isometriche con mobili vettoriali, personaggi nelle
    finestre, colori pastello). La nostra sezione è frontale, fatta di scatole
    CSS con foto vere; niente mobili disegnati, niente sagome.

---

## 4. Rischi del concept e come riconoscerli

### 4.1 Sezione piatta (il rischio numero uno)
Se le scatole non hanno profondità credibile, il palazzo diventa una griglia
di foto su fondo terracotta: cioè una galleria con un bordo. **Segnali**: la
foto di fondo occupa più del 70% della cella vista da fuori; pareti laterali
e soffitto più stretti di 12-15 px a 1440; stessa luminosità su pavimento e
parete. **Rimedio** (per art-director): profondità ≈ 0,7 × altezza cella come
da creative-director; pavimento più chiaro verso la foto e scuro sul fronte;
soffitto con travi solo dove previsto; poché spesso (P7).

### 4.2 Effetto giocattolo
"Casa di bambola" può scivolare nel gioco per bambini, e un albergo da 112-178 €
a notte perde credibilità. **Segnali**: colori saturi, angoli arrotondati,
tetto troppo appuntito, comignoli "da disegno", rimbalzi. **Rimedio**: raggi 0
su tutto il palazzo; tetto a falde basse (pendenza da coppi veneti, circa
30-35%, non 45°); nessun easing con rimbalzo; tutte le finiture vengono dalle
foto.

### 4.3 Foto incoerenti
Sette foto da sette alberghi diversi si vedono subito una accanto all'altra,
molto più che in una galleria che scorre. **Segnali**: una foto fredda tra
calde; una camera "scandinava" bianca; prospettive diverse (una frontale,
una d'angolo). **Rimedio** (per photo-editor): preferire foto frontali o quasi,
con la parete di fondo parallela al piano dell'immagine (si incastrano nella
scatola); stesso bilanciamento in export; scartare foto d'angolo anche se
belle, perché dentro una scatola frontale sembrano storte.

### 4.4 Buio illeggibile
Un sito tutto notte con stanze spente al 38% di luminosità rischia di non dire
niente alla prima occhiata, e su schermi di telefono all'aperto sparisce.
**Segnali**: più di 3 stanze spente senza il testo "occupata" visibile; nomi
sopra la foto senza velo. **Rimedio**: nome e stato sempre su poché/notte (già
vincolante), stanze spente comunque con la foto riconoscibile (non nere), e lo
stato vuoto sempre con tutto acceso.

### 4.5 Luci che "lampeggiano"
Accensioni sfalsate, aggiornamenti durante il trascinamento e successo finale
possono sommarsi. **Segnali**: più di 2-3 cambi di luce al secondo sommando
tutte le celle; dissolvenze sotto 900 ms. **Rimedio**: un solo orologio che
raggruppa gli aggiornamenti (400 ms, come da creative-director); il
motion-designer lo verifica contando i cambi con uno script.

### 4.6 Il nastro delle lune come curiosità
Le lune sono belle ma la domanda vera è "quali date?". **Segnali**: la data non
si legge senza passare sopra la luna; l'utente non capisce che si trascina.
**Rimedio**: giorno e iniziale del giorno sempre visibili sotto ogni luna; riga
di stato in parole sempre presente; i due campi data nativi raggiungibili in un
tocco. Le fasi sono un di più di significato, mai l'unico modo di leggere la
data.

### 4.7 Vicini
Da tenere lontano: 11 TAJUT (carte piatte in CSS 3D), 15 NOVANTA (rosati
chiari), 1 e 3 (blu notte come testo su crema), 16 EVIDENZIA (scegliere un posto
leggendo). La prova rapida: se una schermata di IMBRUNIRE, tolto il palazzo,
potrebbe stare in uno di questi, c'è troppo "pagina" e poco "edificio".

---

## 5. Note puntuali per l'ondata 2

- **art-director**: prendi P1, P4, P5, P6, P7 e i rischi 4.1-4.4. Il DESIGN.md
  fissi in px lo spessore del poché e la profondità delle scatole ai quattro
  punti di rottura.
- **motion-designer**: P10 e 4.5. Due velocità, nessuna armonizzazione.
- **interaction-designer**: P8, pattern 5, rischio 4.6.
- **copywriter**: P2, P3, P9, pattern 8. Niente slogan d'apertura (pattern 7).
- **photo-editor**: rischio 4.3 (foto frontali, parete di fondo parallela).
- **vector-artist**: pattern 10: niente mobili, facciate o sagome disegnate;
  l'unico SVG generato è la luna (calcolata) e il favicon.

## Richieste ad altri agent

Nessuna.
