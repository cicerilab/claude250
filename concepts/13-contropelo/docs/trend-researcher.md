# Trend researcher · Concept 13 · CONTROPELO (barbiere, Pordenone)

Ondata 1. Input letti: `docs/ruoli-agent.md`, `docs/concept-lab.md` (ricetta
bocciata), `concepts/13-contropelo/docs/creative-director.md` (variante A, LA
PARETE), `.claude/skills/taste/SKILL.md` e i quattro `references/step*.md`,
`concepts/10-torchio/docs/trend-researcher.md` (solo formato).

Scopo: dare all'ondata 2 (art-director, motion-designer, interaction-designer,
copywriter, vector-artist, photo-editor) **principi da reinterpretare**, **pattern
da evitare** e i **rischi veri** del concept (gesto di pulire, vapore, pennarello
sul vetro, lista a mezz'ore). Nessun codice.

Tutti i file di /taste sono in `concepts/13-contropelo/docs/taste/`
(`{dominio}.md` + `{dominio}.json` + screenshot guardati).

---

## 1. Fonti

### 1.1 /taste eseguito davvero (4 siti)

Playwright MCP non è collegato in questa sessione: ho eseguito la stessa
pipeline della skill con uno script Playwright (Chromium 1440×900, attesa 5 s,
screenshot viewport + pagina intera o metà/piede, `references/extract.js`
passato intero a `evaluate`), poi i 4 passi (misura, pattern, gusto,
osservatore) e il controllo anti-slop (0 occorrenze su tutti i `.md`, 2 sezioni
"Design Map/Taste DNA" per file, JSON validi). Data: 26/09/2026.

| Sito | Perché | File |
|---|---|---|
| **Rain on Glass** (`rain-on-glass-production.up.railway.app`) | È esattamente il gesto della matrice: vetro appannato da pulire col dito, condensa che torna. Oltre al /taste l'ho **usato**: tratto di pennello simulato, screenshot a 300 ms, 4 s, 10 s, 20 s, e lettura del sorgente (un solo HTML) per i parametri. | `taste/rain-on-glass.*`, `rain-on-glass-wipe-*.jpeg` |
| **Antica Barbieria Colla** (Milano, dal 1904) | Barbieria italiana vera, foto del salone con specchi in fila, blocco orari scritto in italiano da barbiere. | `taste/anticabarbieriacolla.it.*` |
| **Pankhurst London** (Mayfair) | Barbiere di fascia alta: una frase, un bottone, nessun colore. Utile come disciplina. | `taste/pankhurstlondon.com.*` |
| **Fellow Barber** (catena USA) | Barbiere con un accento verde-acqua `#00B373` vicino al nostro turchese: mostra dove un accento così funziona e dove diventa decorazione. | `taste/fellowbarber.com.*` |

### 1.2 Tentativi scartati (dichiarati)

| URL | Esito |
|---|---|
| `awwwards.com` (schede Rendezvous Barbers, Frank Nitti, Balls barbershop) | bloccato dal proxy (egress) |
| `colorlib.com`, `mycodelesswebsite.com` (raccolte di siti di barbieri) | bloccati dal proxy |
| `codepen.io` (scratch reveal di Dudley Storey), `github.com/Rajath-KR/foggyglass` | 403 |
| `rendezvousbarbers.com/.ca`, `franknittibarbers.com`, `ballsbarbershop.com` | dominio che non risponde |
| `donbarber.com`, `porem.com.br`, `novacapillaire.fr` | raggiunti ma **non sono** i siti dei barbieri (pagina personale, agenzia, clinica tricologica): scartati e cancellati |
| `schorem.com` (Rotterdam) | solo schermata d'ingresso rossa con logo gotico anche dopo 14 s: niente da misurare. Tenuto lo screenshot come esempio di "barber vintage" |
| `murdocklondon.com`, `ruffians.co.uk`, `bullfrogbarbershop.com` | caricati, ma sono negozi online di cosmetica (popup "UNLOCK 15% OFF", barra spedizioni, carosello): nessun /taste completo, tenuti solo gli screenshot come **controesempi** (sezione 3) |

### 1.3 Sistemi da `design-references/awesome-design-md/design-md/` (3 letti)

| Sistema | Perché serve a CONTROPELO | Cosa prendo (principio, non stile) |
|---|---|---|
| **tesla** | Una foto a tutto schermo, UI quasi assente, **un solo colore** (`#3E6AE1`) usato solo per l'azione principale; testo quasi tutto a 14 px, due pesi. | L'accento vale perché è l'unico e fa una cosa sola. Da noi il turchese = "qui c'è posto / qui tocca a te". L'interfaccia (mensola) è piccola, uniforme e sta ai margini. Da non prendere: vetro smerigliato sulla nav, carosello a puntini. |
| **linear.app** | Tema scuro con scala di neutri freddi a gradini minimi (`#010102` → `#0f1011` → `#18191a`), accento solo su marchio, fuoco e pochi bottoni. | Il fuoco da tastiera **è** l'accento: nessun colore di stato in più. La parete `#171C1D` e lo specchio `#232A2C` devono stare a un gradino netto ma basso, come i suoi pannelli. Da non prendere: la densità da software, le card con bordino. |
| **spacex** | Nero, foto a tutta pagina, pochissima UI. | Soprattutto come **avvertimento**: occhielli in maiuscolo spaziato, bottoni-pillola a contorno, testo bianco su foto senza velatura calcolata. È il "sito scuro con foto" che non dobbiamo diventare. |

---

## 2. Principi da reinterpretare (10)

### P1 · Il vapore torna come un fenomeno, non come un timer
*Da: Rain on Glass (sorgente: `HOLD = 1.9`, `DECAY = .15`, maschera fbm "re-fogging nucleates in patches").*
Lì la zona pulita resta **pulita piena per circa 6 s** (il valore parte da 1,9
e scende di 0,15 al secondo, ma sopra 1 è ancora trasparente), poi si
ricopre in circa 6-7 s, **a chiazze**.
**Qui**: tenere i 14-18 s totali del creative-director, ma dividerli in un
**plateau di 4-5 s** in cui la zona resta pulita (il tempo di leggere un
prezzo) e un ritorno di 10-12 s pesato dalla maschera di rumore statico. Senza
plateau il vapore "insegue" l'occhio e diventa fastidioso; senza chiazze
sembra una transizione di opacità.

### P2 · La traccia ha un bordo e un peso
*Da: Rain on Glass (pennello 36 px, bordo netto, goccia dal bordo basso; screenshot `rain-on-glass-wipe-300ms.jpeg`).*
**Qui**: il pennello del creative-director (34/60 px mouse, 30/44 px dito) va
bene, ma il gradiente radiale del `destination-out` deve avere **un nocciolo
pieno di circa il 70% del raggio** e solo l'ultimo 30% sfumato. Un gradiente
morbido dal centro sembra una gomma di Photoshop; un bordo quasi netto con un
filo più chiaro (acqua accumulata) sembra un vetro vero. Le gocce partono solo
dal bordo **basso** della traccia, mai dal centro.

### P3 · Il gesto si insegna facendolo, una volta
*Da: Rain on Glass (una sola riga "Press and drag to wipe the glass", 15 px, centrata in basso, che resta).*
**Qui**: la passata automatica del creative-director (6.3) è migliore della
loro scritta fissa, perché mostra il risultato. La riga "Passa il dito sul
vetro" va sulla **mensola** (non sul vetro) e sparisce al primo gesto, come
già previsto. Mai due suggerimenti insieme, mai un'icona di mano animata.

### P4 · Un solo colore, un solo significato
*Da: tesla (blu solo sull'azione principale), linear.app (accento su fuoco e marchio), Pankhurst (nessun colore: nero, bianco, `#F4F4F4`).*
**Qui**: il turchese `#2A9D96` compare solo dove c'è un posto per te: trattini
liberi, sottolineatura del nome, fuoco, barbiere attivo, bottone "Scrivi il
tuo nome". Controprova da Fellow Barber: il loro verde funziona come filetto
di 1 px tra le voci di menu e smette di significare qualcosa quando diventa una
fascia piena (21,7% della superficie della home). Regola per l'art-director:
**nessuna superficie turchese più grande del bottone della mensola**.

### P5 · Il salone vero è la prova
*Da: Antica Barbieria Colla (foto del salone 1920×1278 a tutta larghezza, specchi e poltrone in fila, velatura scura).*
**Qui**: il riflesso deve mostrare **il posto**, non un volto: poltrone,
mensole, specchi che si riflettono. La loro foto funziona perché si vedono
più poltrone in prospettiva: "è un salone con più posti". Per il photo-editor:
preferire inquadrature con profondità (fila di poltrone, porta in fondo) a
dettagli ravvicinati (forbici, pennello), che dietro al vapore diventano
macchie illeggibili.

### P6 · Gli orari si scrivono come li dice il barbiere
*Da: Antica Barbieria Colla ("Dal Martedì al Sabato / Mattino 9:30 – 13:00 · Pomeriggio 14:30 – 19:00 / Chiuso Domenica, Lunedì e Festivi" + "Apri in mappa").*
**Qui**: sullo specchio 3 gli orari vanno in **tre righe parlate**, non in
una tabella di sette giorni: "martedì-venerdì 8:30-12:30 e 14:30-19",
"sabato 8-17", "domenica e lunedì chiuso". Il link alla mappa vera è un
link scritto, non un bottone. Nota per il copywriter: i trattini lunghi e
medi di Colla (`–`) nei nostri testi visibili diventano trattino corto `-`.

### P7 · Il prezzo del taglio sta davanti, non dietro
*Da: Antica Barbieria Colla (in home 8 prezzi di prodotti, zero prezzi di servizi: il listino è dietro "Prenota l'esperienza").*
**Qui**: è il principio al contrario. Il listino è la **prima cosa scritta
sul primo specchio** ed è visibile all'apertura prima che salga il vapore
(creative-director 6.3, passo 1). "Taglio 22" deve essere leggibile in meno
di tre secondi su 375 px: niente listino in un pannello secondario, niente
prezzo che compare solo pulendo.

### P8 · Un messaggio e un gesto per schermata
*Da: Pankhurst (una frase 40 px, una riga 16 px, un solo bottone "BOOK NOW", raggio 0).*
**Qui**: il concept ha già un solo richiamo ("Scrivi il tuo nome"). Il
rischio è che la mensola si riempia: tre nomi + toggle + richiamo +
suggerimento + "Informazioni". Priorità visive sulla mensola: nomi (Limelight
20 px) > richiamo turchese > toggle (Figtree 15-16 px) > "Informazioni" (13
px). Nessun'altra voce.

### P9 · L'interfaccia sta ai margini e parla piano
*Da: Rain on Glass (quattro corpi di testo tutti sotto i 15 px, un solo colore `#E8E3DA`, ai bordi), tesla (testo UI quasi tutto a 14 px, due pesi).*
**Qui**: tutto ciò che non è scritto sul vetro (mensola, fascia alta) usa
**un colore** (pennarello `#FAFAF6`) e al massimo **tre corpi** di Figtree.
Il contrasto di scala lo fa il pennarello sul vetro (22-34 px) contro l'UI
(14-17 px): due registri, niente vie di mezzo.

### P10 · Tutto funziona senza la parte "speciale"
*Da: Rain on Glass come controesempio (senza WebGL2 la pagina mostra solo "This demo needs WebGL2."; nessuna gestione di `prefers-reduced-motion`, rilevata anche dall'extractor).*
**Qui**: il vapore è un livello **sopra** un sito già completo. Verifica
per il QA: disabilitando il canvas (o con riduzione del movimento) la pagina
deve essere identica tranne il vapore, con listino, lista e prenotazione
intatti. Se senza vapore la pagina sembra vuota o "rotta", il vapore stava
facendo da stampella al design.

---

## 3. Pattern inflazionati da evitare (10)

I primi quattro sono la **ricetta bocciata** di `docs/concept-lab.md` (divieti
assoluti), gli altri vengono da ciò che ho visto nei siti misurati e dal genere
"barber" nel 2026.

1. **La ricetta bocciata, per intero**: titoli serif corsivi + sottotitolo
   sans; sezioni "01 ·" con maiuscoletto spaziato o monospace; griglie di
   schede bianche con bordino e ombra; lo stesso fade-up ovunque; onde e
   divisori decorativi. Nel bocciato TRE POLTRONE: crema, blu notte + rosso,
   slab serif, riga di tre numeri tra filetti, due bottoni pieno + contorno.
2. **Mappa disegnata** al posto del link alla mappa vera.
3. **Prenotazione a passi che finisce in cartolina, scontrino, biglietto o
   modale.** Qui la conferma è il tuo nome sottolineato nella lista.
4. **Figure umane, forbici, rasoi, baffi, pali a strisce in SVG**, anche nel
   favicon (il palo è nel logo del bocciato e nel link "Book" di Murdock).
5. **"Barber vintage"**: pelle marrone, legno scuro, lampadine a filamento,
   oro, gotico o script tipo insegna tatuata (vedi `schorem.com-viewport.jpeg`,
   rosso pieno + logo gotico). È il genere più inflazionato del settore.
6. **Barbiere come negozio di cosmetica**: barra promozionale in alto
   ("free delivery", "Free Shipping"), popup di sconto sopra l'hero, carosello
   di prodotti, recensioni stampa (Murdock, Ruffians, Bullfrog, Fellow Barber).
   Nessun prodotto in vendita su CONTROPELO.
7. **Hero che dipende da un terzo**: video YouTube/Vimeo incorporato come
   prima schermata. Fellow Barber, al momento della cattura, mostrava
   "Video unavailable" su 600 px di nero.
8. **Cursore custom e "mano" disegnata** che segue il puntatore (Rain on
   Glass: `cursor: none` e una mano guantata SVG da 46/84 px). Copre proprio
   la zona che si sta scoprendo; su CONTROPELO il cursore resta quello di
   sistema.
9. **Vetro smerigliato CSS (`backdrop-filter`) e glassmorphism** su barre e
   pannelli, e la sua variante "vetro appannato = `filter: blur` su tutta la
   foto". Il vapore è uno solo, in canvas, sul solo specchio.
10. **Il "gratta e vinci"**: rivelazione che serve a scoprire un premio o un
    messaggio nascosto, con coriandoli o "hai trovato...". È il gimmick per
    eccellenza del gesto di pulire (demo di CodePen, landing promozionali).
    Qui nulla è nascosto: si pulisce per vedere meglio ciò che già si
    intuisce (densità massima 0,78-0,9, creative-director 6.2).

---

## 4. Rischi del concept e come ridurli

### 4.1 Il gesto di pulire diventa un gimmick
Cosa lo rende un gimmick (dai riferimenti): serve a scoprire qualcosa che
altrimenti non si vede; è l'unica cosa da fare; dura più del contenuto; ha un
cursore disegnato; si ricopre subito.
Cosa lo rende soddisfacente: bordo netto (P2), plateau prima del ritorno
(P1), goccia rara, velocità che allarga appena la traccia, e soprattutto il
fatto che **dietro c'è qualcosa di utile** (il salone vero e i prezzi).
Controllo: dopo 10 secondi di uso, l'utente deve aver letto un prezzo e un
nome di barbiere. Se ha solo "giocato col vapore", il vapore è troppo fitto o
le scritte sono troppo piccole.

### 4.2 Il vapore nasconde l'informazione
La densità massima del creative-director (0,9 in basso, 0,78 in alto) lascia
intuire le scritte. Rischio: il listino dello specchio 1 sta in basso, dove il
vapore è più fitto. Proposta per l'art-director: il blocco del listino nella
metà alta del vetro su 375 px, oppure un'eccezione di densità (0,7) sulla
colonna dei prezzi. Il vapore non deve mai coprire la mensola né la riga di
scrittura.

### 4.3 Mansalva: prezzi e numeri
Misurato sul file Google Fonts (26/09/2026): **nessuna cifra tabellare**
(feature solo `calt`, `ccmp`, `dnom`, `frac`, `liga`, `locl`, `numr`),
larghezze delle cifre da 457 a 700 unità su 1000 (il "5" è il più largo,
il "3" il più stretto); **altezza della x 384/1000**, cioè bassa.
Conseguenze: i prezzi non si allineano con `font-variant-numeric`;
vanno allineati a destra per riga (ogni prezzo nel suo contenitore allineato a
destra). La x bassa vuol dire che Mansalva a 22 px ha la stessa altezza della x
di un sans a circa 16-17 px: 22 px è davvero il minimo, per le ore della lista
(9:00, 9:30) meglio 24 px su 375. Ha `€`, lettere accentate e spazio non
separabile. `calt` varia alcune forme: bene per la mano, ma da verificare che
"16" e "19" restino leggibili in tutte le combinazioni.
Limelight: cifre molto larghe (986-1477 su 2048), nessuna feature: non usarlo
mai per numeri.

### 4.4 Turchese che sa di ambulatorio
Turchese + grafite + bianco è anche la palette di dentisti e cliniche. Lo
tengono lontano: la foto del salone vero dietro, la calligrafia a pennarello,
il turchese **mai** come campo grande (P4), nessuna icona sanitaria, nessun
angolo arrotondato. Se una schermata sembra una clinica, di solito c'è troppo
turchese o troppo poco riflesso.

### 4.5 Tema scuro con foto = "sito scuro qualunque"
Tesla e SpaceX dimostrano che foto a tutto schermo + testo chiaro è un genere
già visto (e che 2, 5 e 7 del Lab hanno). Ciò che distingue CONTROPELO: la
foto è **specchiata e dietro un vetro** (sfocatura 1-2 px, velatura 62-72%),
il bisello di 2 px degli specchi, i bordi degli specchi vicini visibili ai
lati, il pennarello davanti nitido. Se un fotogramma senza vapore sembra "foto
scura con scritte sopra", mancano bisello, bordi vicini o la differenza di
nitidezza tra foto e scritte.

### 4.6 Pan orizzontale contro gesto di pulire su mobile
Il creative-director ha già deciso: sul vetro un dito pulisce e basta
(`touch-action: none`), si cambia specchio dalla mensola o dai bordi. Rain on
Glass mette `touch-action: none` su tutto il `body`: da **non** copiare,
perché bloccherebbe anche lo zoom e lo scorrimento della mensola. Solo sul
vetro.

### 4.7 Prestazioni del canvas
Rain on Glass usa WebGL2 con risoluzione limitata a DPR 2 (1,5 su puntatori
grossolani) e sfocature a risoluzione ridotta. Da noi niente WebGL e metà
risoluzione (creative-director 9): coerente. Rischio reale: il ritorno del
vapore tiene il loop acceso 14-18 s dopo ogni gesto; il loop va fermato quando
tutte le zone sono tornate e su `visibilitychange`.

### 4.8 Fotosensibilità e ritorno troppo veloce
Il ritorno a chiazze non deve pulsare: la maschera di nucleazione è
**statica** (non rumore animato), l'opacità in ogni punto sale e basta. Da
verificare in QA contando i cambi di luminosità al secondo su una zona pulita
che torna.

### 4.9 Lista credibile senza dati finti "live"
Il bocciato aveva la fila live con minuti di attesa. La lista a mezz'ore
generata dalla data va bene solo se sembra scritta a mano: nomi con iniziale
("Luca B."), qualche riga con un servizio da un'ora (due righe unite),
pausa pranzo in una riga. Mai contatori, mai "3 posti rimasti", mai
aggiornamenti che compaiono da soli.

---

## 5. Tabella rapida: prendere / non prendere

| Dal riferimento | Prendere | Non prendere |
|---|---|---|
| Rain on Glass | plateau + ritorno a chiazze, bordo netto, goccia dal bordo basso, UI ai margini in un colore | cursore custom, `touch-action: none` su tutto, niente senza WebGL, niente riduzione del movimento, suono |
| Antica Barbieria Colla | foto del salone vero con specchi in fila, orari in tre righe parlate, link "Apri in mappa" | prezzi dei servizi nascosti, due CTA pieni affiancati, raggi 40 px, occhiello "dal 1904" |
| Pankhurst London | una frase, un gesto, raggio 0, nessun colore superfluo | serif display (Fraunces), slogan astratti sul "tempo" |
| Fellow Barber | accento verde-acqua come filetto funzionale, prenotazione come prima voce | accento a fascia piena, video di terzi come hero, doppio richiamo alla prenotazione |
| tesla | un colore = un'azione, UI uniforme e piccola | vetro smerigliato, carosello |
| linear.app | neutri freddi a gradini bassi, accento sul fuoco | card con bordino, densità da software |
| spacex | nulla da copiare: avvertimento sul "sito scuro con foto" | occhielli maiuscoli spaziati, pillole a contorno |

---

## 6. Sintesi per l'ondata 2

- **art-director**: P4, P5, P8, P9, rischi 4.2, 4.3, 4.4, 4.5. Nel DESIGN.md:
  nessuna superficie turchese più grande del bottone; prezzi allineati a destra
  per riga (Mansalva non ha cifre tabellari); ore della lista a 24 px su 375;
  Limelight mai per numeri.
- **motion-designer**: P1, P2, P3, rischio 4.8. Plateau 4-5 s, ritorno 10-12 s
  a chiazze, maschera statica.
- **interaction-designer**: P2, P10, divieti 8 e 10, rischi 4.1, 4.6.
  Nocciolo pieno del pennello al 70% del raggio; `touch-action: none` solo sul
  vetro; cursore di sistema.
- **copywriter**: P6, P7, P8, rischio 4.9. Orari in tre righe parlate,
  trattino corto, listino come prima scritta.
- **photo-editor**: P5, rischio 4.5. Profondità (fila di poltrone) prima dei
  dettagli; niente vintage, niente parrucchiere.
- **vector-artist**: divieto 4 (niente palo, forbici, rasoi, nemmeno nel
  favicon).

## Richieste ad altri agent

Nessuna.
