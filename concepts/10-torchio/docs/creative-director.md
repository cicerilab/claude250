# Creative director · Concept 10 · Tipografia e legatoria (Pordenone)

Ondata 0. Rotta `/concept-10`. Documento di direzione per tutti gli agent delle
ondate successive: quello che è scritto qui sotto "Direzione scelta" è vincolante.

Materiale letto: `CLAUDE.md`, `docs/concept-lab.md`, `docs/processo-agent.md`,
`.claude/skills/design-taste-frontend/SKILL.md` (sezioni 0, 1, 4, 9), screenshot
`docs/concept-attuali/concept-1…20.jpg`.

---

## 0. Cosa ho visto negli screenshot (base delle scelte)

**Concept 1-9 (il livello da raggiungere)**: ognuno ha un "oggetto" suo
(l'orologio 3D, la montagna, lo scaffale, il titolo svizzero gigante, la ghisa, il
cono, la luce, il bicchiere, lo studio clinico). Palette già occupate:
crema + blu notte (1, 3), foto scura + arancio (2), bianco + nero + rosso (4),
nero + viola (5), crema + rosa + salvia (6), nero assoluto (7), crema + bordeaux (8),
bianco + azzurro (9). Tipografie già occupate: serif classico (1, 3, 7, 8),
condensato maiuscolo (2, 5), grottesco extended nero (4), serif morbido (6),
sans arrotondato (9).

**Concept 10-20 (la ricetta bocciata)**: stessa impaginazione in tutti: testo a
sinistra con occhiello spaziato, titolo serif con una parola colorata, riga di
numeri, due bottoni, foto a destra con didascalia "Tav. I". Il vecchio TORCHIO in
più: carta crema, nero, rosso, condensato grottesco e monospace, timbro "BOZZA".

**Conseguenza**: il nuovo 10 non può essere né "crema + inchiostro", né "foto a
destra", né "serif elegante". E non ha foto. Deve essere un oggetto tattile che
si regge da solo.

---

## 1. Design Read e dial

**Design Read**: *Reading this as: vetrina commerciale di una tipografia e
legatoria artigiana per privati, professionisti ed editori del Friuli, con un
linguaggio tattile e materico in cui il carattere stesso è il prodotto, leaning
toward una sola superficie di carta colorata resa in WebGL (rilievo, luce
radente, lamina) + tipografia variabile a larghezza estrema + CSS nativo, senza
fotografie.*

| Dial | Valore | Perché |
|---|---|---|
| `DESIGN_VARIANCE` | **8** | Vetrina da Awwwards, struttura nata dall'oggetto (il foglio), non da un modello a colonne. Non 10: deve restare leggibile per una coppia che cerca le partecipazioni. |
| `MOTION_INTENSITY` | **6** | Il movimento è la luce che scorre e la pressa che scende: lento, fisico, pochi eventi forti. Niente coreografia continua. |
| `VISUAL_DENSITY` | **3** | Carta che respira. Una cosa per volta sul foglio, come in un biglietto ben composto. |

---

## 2. Tre direzioni creative

### Direzione A · REGISTRO

**Metafora**: il sito è una stampa a due colori fuori registro, che si mette a
registro mentre la leggi.

- **Hero**: una parola enorme stampata in due lastre (rosa fluo e blu) in
  sovrapposizione moltiplicativa, sfalsate di 12-20 px; scrollando le lastre
  scivolano una sull'altra fino a combaciare e nasce il nero-viola della
  sovrastampa.
- **Struttura**: ogni sezione è una "lastra" di colore; le sezioni si
  sovrappongono tra loro come passaggi di stampa successivi.
- **Interazione firma**: il cursore/dito sposta la lastra blu; i crocini di
  registro diventano il mirino per centrare.
- **WebGL**: shader di mezzitoni e retino rotante (angoli 15°/75°), grana della
  carta, piccola sbavatura d'inchiostro sui bordi.
- **Preventivo**: "Mettilo a registro": ogni scelta (formato, colori, tiratura)
  è una lastra; quando tutte le lastre sono a registro il preventivo è pronto e
  il prezzo appare dove i colori combaciano.
- **Palette**: carta grigio freddo `#D8DBDC`, rosa fluo `#FF4F8B`, blu stampa
  `#2F5BEA`, sovrastampa risultante `#3B2350` circa, testo `#1C1D22`.
- **Font**: *Bricolage Grotesque* (display, assi opsz/width) + *Atkinson
  Hyperlegible* (testo).
- **Rischi**: l'estetica risograph è inflazionata su Dribbble; il fuori registro
  a riposo può sembrare un errore di rendering; rosa + blu in multiply vira verso
  il viola vietato; parla più a grafici e artisti che a sposi e notai. Poco
  "legatoria".

### Direzione B · SEGNATURA

**Metafora**: il sito è un unico grande foglio stampato che, scrollando, viene
piegato, cucito e diventa un libro.

- **Hero**: un foglio intero visto dall'alto con l'imposizione di 16 pagine
  (pagine capovolte, segni di taglio); il titolo è letto "sottosopra" come sul
  foglio vero.
- **Struttura**: ogni piega (in 2, in 4, in 8, in 16) apre una sezione;
  l'ultima sezione è il libro chiuso con il dorso cucito.
- **Interazione firma**: scroll che piega il foglio in 3D lungo le linee di
  piega, con la carta che fa la sua curvatura naturale; un filo colorato cuce le
  segnature.
- **WebGL**: mesh di carta suddivisa, piegature per vertex shader, ombre di
  contatto tra i lembi, filo come tubo animato.
- **Preventivo**: "Imposta il tuo libro": scegli pagine, formato, carta e
  legatura; il foglio si ri-impone davanti a te e ti mostra quante segnature
  servono, e il prezzo deriva da lì.
- **Palette**: bianco freddo `#EEF0EE`, inchiostro verde notte `#18221C`, filo
  verde acqua `#1FA38A`, segni di taglio `#8A928C`.
- **Font**: *Gloock* (display serif ad alto contrasto) + *Instrument Sans*
  (testo).
- **Rischi**: la piegatura 3D multipla con testo leggibile è la cosa più
  difficile di tutte da fare bene in un giorno; il testo che ruota e si capovolge
  è scomodo su 375 px; parla soprattutto a chi fa libri e poco a chi vuole 120
  partecipazioni; il serif display avvicina ai concept 1, 3, 8.

### Direzione C · IMPRONTA

**Metafora**: il sito è un foglio di carta colorata spessa in cui le lettere sono
state premute dal torchio: le leggi con la luce, come si leggono con le dita.

- **Hero**: tutto lo schermo è carta colorata (non crema: giallo citrino). La
  parola del titolo è stampata *a secco*, cioè solo rilievo, senza inchiostro.
  Una luce radente segue il cursore (o il dito, o l'inclinazione del telefono) e
  fa emergere il solco delle lettere. Sotto, la frase vera è stampata in
  inchiostro, leggibile sempre.
- **Struttura**: niente colonne testo + foto. Ogni sezione è una "prova" sullo
  stesso foglio infinito: un blocco di composizione messo in pagina come si fa
  sul bancone, con margini veri da tipografia (grandi, asimmetrici, il margine di
  piede più alto di quello di testa).
- **Interazione firma**: "Luce radente" + "Pressione". La luce muove il rilievo;
  lo scroll fa scendere la pressa su ogni blocco (il rilievo passa da piatto a
  profondo), al posto di qualsiasi fade-up.
- **WebGL**: shader di rilievo: testo e segni disegnati su canvas 2D come mappa
  di altezza, sfocata a gradini per fare lo smusso del piombo; normali calcolate
  nello shader; fibra della carta da rumore; lamina a caldo resa come metallo
  anisotropo. Un solo piano, costo bassissimo, gira bene su mobile.
- **Preventivo**: "Il banco di prova": scrivi il tuo testo (i nomi degli sposi,
  il tuo nome e mestiere, il titolo del libro) e lo vedi premuto dal vivo nella
  carta e nella tecnica che scegli; la carta che scegli diventa la carta di tutto
  il sito. Per inviare, tieni premuta la leva: la pressa scende sul tuo testo.
  La promessa: ti spediamo a casa una prova vera, gratuita, sulla carta scelta.
- **Palette**: carta Citrino `#E4CF3F`, luce `#F5E97E`, ombra `#9C8A1E`,
  inchiostro verde notte `#17231D`, lamina argento `#C8CDD2` (resa metallica).
  Carte alternative scelte dall'utente: Cotone `#F1F1EE`, Cipria `#E8B9B3`,
  Grafite `#2A2C2F` (modo scuro).
- **Font**: *Anybody* (display variabile, larghezza 50-150, peso 100-900) +
  *Hanken Grotesk* (testo).
- **Rischi**: la stampa a secco è bassa di contrasto per natura (va gestita:
  l'informazione non vive mai solo nel rilievo); WebGL che non parte (serve un
  fallback CSS bello); il giallo pieno può stancare su pagine lunghe (si regola con
  il ritmo degli spazi vuoti, non mischiando carte: una carta per volta, la
  cambia l'utente).

---

## 3. La scelta: IMPRONTA (direzione C)

**Perché vince**

1. È l'unica delle tre in cui il visitatore *fa* quello che fa il tipografo:
   sceglie una carta, scrive un testo, lo vede premuto. Il potenziale cliente
   di CiceriLab (un tipografo vero) guarda il suo mestiere funzionare dentro uno
   schermo: "lo voglio anch'io" nasce da lì.
2. Risolve il vincolo delle foto trasformandolo in forza: non c'è niente da
   fotografare, perché il prodotto (la lettera premuta nella carta) è generato
   dal vivo, con la luce vera che si muove. Sembra più vero di una foto.
3. Parla a tutti e tre i pubblici con lo stesso gesto: gli sposi vedono i loro
   nomi a secco su Cipria, il commercialista vede il suo biglietto su Cotone con
   lamina, l'editore vede la copertina con il titolo in rilievo.
4. È la più costruibile in un giorno di agent: un piano, uno shader di
   illuminazione su mappa di altezza, DOM vero sopra. Il wow è grande, il rischio
   tecnico è piccolo.

**Perché è di questo mestiere e non di un altro**

La stampa a caratteri mobili e la stampa a secco sono le uniche tecniche in cui
la stampa si *tocca*: il valore che un tipografo artigiano vende contro il
digitale online è il solco nella carta di cotone. Il sito lo rende visibile con
la luce radente, che è esattamente come in bottega si controlla una prova
(inclinando il foglio sotto la lampada). La lamina, le carte colorate, la
grammatura: sono le parole che un cliente sente al bancone.

**Perché non somiglia a nessuno degli altri 19**

- **Palette**: nessun concept ha un campo pieno di colore saturo come fondo.
  1-9 sono crema, bianco o foto scura; il giallo citrino con inchiostro verde
  notte e argento non è in nessuno. Via crema, rosso e nero del vecchio TORCHIO.
- **Tipografia**: Anybody extra-largo e pesante, che cambia larghezza con la
  pressione, non somiglia né ai serif (1, 3, 6, 7, 8), né ai condensati (2, 5,
  vecchio 10), né al grottesco svizzero del 4 (lì il contrasto è
  pieno/contorno, qui è rilievo/luce). Niente monospace.
- **Struttura**: niente split testo/foto, niente riga di numeri sotto al
  titolo, niente schede. Un foglio unico con blocchi composti come una pagina
  stampata.
- **Interazione**: l'unico concept in cui la luce è il controllo. Il 7
  (CONTROLUCE) parla di luce ma è una galleria di foto; qui la luce è
  interattiva e rivela il materiale.
- **Preventivo**: non è un form, non è un calendario, non finisce in cartolina o
  scontrino. È una prova di stampa dal vivo che cambia il sito intero e si
  chiude con un gesto fisico (tieni premuto) e con una promessa fisica (la prova
  vera per posta).

**Nome**: **IMPRONTA**, *tipografia e legatoria*, Pordenone. "Torchio" era il
nome della ricetta bocciata; "impronta" dice il segno lasciato dalla pressione
e, insieme, l'impronta del dito che tocca la carta. Rotta invariata
`/concept-10`. Indirizzo di esempio verosimile (da decidere al copywriter), mai
dati legali inventati.

---

## 4. La direzione scelta nel dettaglio

### 4.1 Sistema visivo in breve (base per art-director e webgl-artist)

- **Una carta per volta**. Il fondo di tutta la pagina è una sola carta, resa
  dallo shader (fibra leggera, niente texture fotografica). Default: **Citrino**.
  L'utente può cambiarla nella sezione "La carta" e nel banco di prova; la scelta
  si salva in `localStorage` (con try/catch) e vale per tutto il sito.

  | Carta | Fondo | Luce rilievo | Ombra rilievo | Inchiostro testo | Uso |
  |---|---|---|---|---|---|
  | Citrino 300 g | `#E4CF3F` | `#F5E97E` | `#9C8A1E` | `#17231D` | default, identità |
  | Cotone 600 g | `#F1F1EE` | `#FFFFFF` | `#B9BAB3` | `#17231D` | biglietti, carta intestata |
  | Cipria 350 g | `#E8B9B3` | `#F7D8D3` | `#A9776F` | `#2A1A1C` | partecipazioni |
  | Grafite 400 g | `#2A2C2F` | `#44474B` | `#141517` | `#ECEBE6` (inchiostro bianco) | modo scuro, editoria d'arte |

  Accento unico: **lamina argento** (`#C8CDD2` come colore di fallback), usata
  solo dove c'è lamina vera: il marchio, il prezzo nel banco di prova, il
  bottone di invio. Nessun altro colore d'accento in nessuna sezione.
- **Tipografia**:
  - *Anybody* per titoli e per tutto ciò che è premuto. Usare gli assi: il
    rilievo profondo corrisponde a larghezza 130-150 e peso 800-900; i titoli
    secondari larghezza 100. Niente corsivo (Anybody ha il corsivo: non si usa,
    l'enfasi si fa con larghezza e peso).
  - *Hanken Grotesk* 400/500/600 per il testo, 17-18 px, interlinea 1.55,
    massimo 62 caratteri per riga. Niente maiuscolo spaziato come etichetta.
  - Le "etichette" non esistono: dove serve un nome di sezione si usa una
    parola in Anybody larghezza 150 a 18-20 px, in minuscolo, attaccata al
    titolo.
- **Forme**: tutto spigolo vivo (raggio 0), come un foglio rifilato. Unica
  eccezione documentata: il manico della leva del banco di prova (tondo, è un
  oggetto fisico).
- **Griglia**: margini da libro (canone rinascimentale semplificato): margine
  interno stretto, esterno largo, piede più alto della testa. Su desktop il
  blocco di testo sta volutamente fuori centro. Su 375 px margini laterali 20 px,
  piede di sezione 96 px: la pagina resta "una pagina", non una colonna
  schiacciata.
- **Fallback senza WebGL** (e per i lettori di schermo il DOM è sempre la
  fonte): rilievo in CSS con due `text-shadow` (luce in alto a sinistra, ombra
  in basso a destra, colori dalla tabella), fondo pieno della carta, lamina come
  gradiente lineare leggerissimo a due toni di grigio. Deve essere già bello da
  solo.

### 4.2 Sezioni del sito (8)

1. **Hero · "la pressa"**
   Tutto lo schermo è carta Citrino. Al centro-sinistra, enorme, la parola
   *impronta* a secco (Anybody 150/900, su mobile spezzata in due righe
   "impron-" / "ta" solo se serve, altrimenti la parola ridotta a larghezza
   piena). Sotto, in inchiostro verde notte, il titolo leggibile, una frase
   sola, per esempio "Stampiamo cose che si leggono anche a occhi chiusi."
   e due righe di testo. Un solo bottone: **"Prova la tua"** (porta al banco di
   prova; è l'unica etichetta per l'intento "preventivo" in tutto il sito). In
   alto: marchio IMPRONTA in lamina argento, tre voci di menu, torna a CiceriLab.
   Apertura: la pressa scende una volta sola (il rilievo passa da 0 a pieno in
   circa 1,1 s, con un leggero ritorno elastico della carta), niente preloader a
   percentuale.

2. **Per chi · "tre lavori sul bancone"**
   Tre pezzi reali composti e premuti dal vivo nello shader, mai foto: una
   partecipazione (su Cipria, nomi a secco, data in inchiostro), un biglietto
   da visita (su Cotone, nome in lamina, retro a secco), una copertina di
   libretto d'artista (su Grafite, titolo in inchiostro bianco). Non sono tre
   schede uguali in fila: sono appoggiati sul foglio a scala diversa e con
   rotazioni leggere e diverse (-2°, 1,5°, -0,5°), come sparsi sul bancone. Ogni
   pezzo ha accanto due righe in inchiostro: per chi è, da quanto si parte
   (es. "100 partecipazioni con busta, da 390 €"). Su 375 px si impilano con
   sovrapposizione parziale e si sfogliano con swipe orizzontale.

3. **Le tecniche · "la stessa parola, quattro volte"**
   Sezione fissata allo scroll (pinned). Una sola parola campione (il nome
   dell'utente se lo ha già scritto nel banco di prova, altrimenti "Pordenone")
   resta al centro e cambia tecnica mentre scorri: *a secco* (solo rilievo),
   *a un colore* (rilievo + inchiostro che riempie il solco), *lamina a caldo*
   (argento, riflesso che segue la luce), *taglio colorato* (il bordo del
   foglio che si tinge, visto di tre quarti). Accanto, per ogni tecnica, tre
   righe: cos'è, su cosa rende meglio, quanto costa in più. Lo scroll qui non fa
   comparire testi: cambia solo il materiale.

4. **La carta · "tocca prima di scegliere"**
   Le quattro carte come quattro strisce verticali a tutta altezza (su mobile,
   orizzontali), ognuna con nome, grammatura e spessore reso come costa vista di
   taglio (lo spessore visibile cresce con la grammatura). Toccare una carta la
   stende su tutto il sito: transizione in cui il nuovo colore si propaga dal
   punto toccato come carta che assorbe (onda morbida, 700 ms, nessun lampo).
   Questa è anche la levetta del modo scuro (Grafite).

5. **Legatoria · "il filo"**
   Un unico filo (SVG, un solo tratto continuo, colore inchiostro) attraversa la
   sezione e si cuce da solo mentre scorri, passando dentro e fuori dal foglio
   con i punti veri delle legature: *brossura cucita*, *cartonato*, *legatura
   giapponese*, *punto metallico*. Ogni punto del filo si ferma accanto al nome
   della legatura e a due righe di testo e prezzo indicativo. Il filo è un
   segno di lavoro, non un divisore decorativo: mostra davvero il percorso di
   cucitura di ogni legatura.

6. **Il banco di prova · preventivo** (vedi 4.4). È il cuore del sito e la
   sezione più alta.

7. **La bottega · "portaci la bozza"**
   Indirizzo, orari, telefono di esempio, un link "Apri in Maps" che porta alla
   mappa vera. Niente mappa disegnata. Il blocco è composto come il frontespizio
   di un libro (tutto a sinistra, grandi spazi, l'indirizzo in Anybody largo a
   secco + inchiostro). Una sola frase su chi lavora in bottega, senza figure
   né ritratti.

8. **Colophon · piede**
   Il piede del sito è un colophon da libro vero, in Hanken Grotesk: "Questo
   sito è composto in Anybody e Hanken Grotesk, stampato a secco su carta
   Citrino (o la carta scelta dall'utente) nella tipografia IMPRONTA di
   Pordenone." Più link utili, "Un concept di CiceriLab" e torna al Concept Lab.

### 4.3 Interazione firma: "Luce radente" + "Pressione"

**Luce radente**
- Una sola luce direzionale bassa sulla carta (elevazione 18-25°). Il suo
  azimut segue:
  - desktop: la posizione del puntatore rispetto al centro della finestra,
    con inerzia (lerp 0,08 per frame) così il rilievo "si gira" morbido;
  - mobile: il dito quando trascina sulla carta (non sui testi) e, se
    l'utente lo concede, l'inclinazione del telefono (`deviceorientation`,
    chiedere permesso solo al primo tocco su iOS, mai all'avvio);
  - senza input: la luce compie un arco lentissimo (un giro ogni 40 s) solo
    nell'hero, poi si ferma a 135°.
- Il cursore di sistema resta quello normale (niente cursore custom): è la luce
  a rispondere, non una pallina che segue il mouse.
- La lamina argento ha un riflesso speculare stretto che scorre sulla lettera
  quando la luce ci passa sopra. Intensità massima limitata: nessun bagliore,
  nessun lampo, nessun cambio di luminosità più veloce di 3 volte al secondo.

**Pressione**
- Ogni blocco premuto ha un valore `pressione` 0→1. Quando il blocco entra
  nello schermo la pressa "scende" (0→1 in 600-900 ms con easing che frena
  alla fine e un micro rimbalzo della carta dell'1-2%), una volta sola.
  Questo sostituisce il fade-up: il testo in inchiostro invece è **già lì**,
  fermo, dall'inizio.
- Il valore di pressione pilota anche gli assi di Anybody nei titoli DOM
  (larghezza da 120 a 150, peso da 700 a 900), così il titolo leggibile e il
  suo rilievo nello shader "si allargano" insieme sotto la pressa.

**Reduced motion**
- Luce ferma a 135°, elevazione 22°, nessun arco automatico, nessuna
  pressione animata (tutto già premuto), nessun tilt. Il cambio carta avviene
  con una dissolvenza di 200 ms. Il sito resta completo e bello.

**Accessibilità del rilievo**
- Nessuna informazione vive solo nel rilievo: ogni scritta a secco è
  decorativa (`aria-hidden` sul canvas) e ha il suo testo vero nel DOM, in
  inchiostro con contrasto AA sulla carta attiva, oppure è la ripetizione
  materica di un titolo già leggibile.

### 4.4 Meccanica unica del preventivo: "Il banco di prova"

Idea: il cliente non compila un modulo, **compone la sua prova** e la vede
stampata nella carta. Il preventivo è quello che gli costa quella prova in
quella tiratura.

**Il banco (layout)**
- Desktop: a sinistra la lastra grande (la prova premuta dal vivo nello
  shader, proporzionata al formato scelto: 85×55 per il biglietto, 148×105
  per la partecipazione, A4 per la carta intestata, 150×210 per il libro); a
  destra il "compositoio", cioè le scelte. Su 375 px: la prova sta in alto,
  fissa, alta circa 42% dello schermo, e le scelte scorrono sotto; la prova
  si aggiorna sempre in vista.

**Le scelte (in ordine libero, non a passi numerati)**
1. *Cosa stampi*: partecipazione, biglietto da visita, carta intestata, libro
   o libretto. Cambia il formato della prova e propone un testo di esempio
   modificabile.
2. *Il tuo testo*: due o tre campi veri (per la partecipazione: i due nomi e
   la data; per il biglietto: nome e mestiere; per il libro: titolo e autore).
   Mentre scrivi, le lettere entrano nella prova come caratteri che cadono nel
   compositoio e vengono premute (una lettera = una piccola pressione
   locale, non un'animazione su tutto il foglio).
3. *La carta*: le quattro carte. Cambia la carta della prova **e di tutto il
   sito**.
4. *La tecnica*: a secco, a un colore, lamina argento, e il taglio colorato
   come aggiunta.
5. *Quante*: tiratura con valori veri del mestiere (50, 100, 150, 250, 500,
   1000; per i libri 30, 50, 100, 300), scelta toccando i numeri, non con uno
   slider.

**Il prezzo**
- Il prezzo indicativo si aggiorna dal vivo ed è **impresso in lamina** sul
  margine della prova, come il prezzo che il tipografo segna sul campione.
  Sotto, in inchiostro e in parole semplici, da cosa dipende ("impianto a
  secco 60 €, carta Cotone 600 g, 100 pezzi con busta"). Tabella prezzi di
  esempio verosimile, definita dal copywriter e dal ux-architect.

**L'invio: "tieni premuto per stampare"**
- Un solo campo di contatto in più: email o telefono (etichetta sopra il campo,
  errore sotto il campo, niente placeholder come etichetta), più un
  facoltativo "quando ti serve".
- Il bottone di invio è una **leva**: si tiene premuto (mouse, dito o barra
  spaziatrice/Invio tenuti premuti) per circa 900 ms. Mentre si tiene premuto,
  la pressa scende davvero sulla prova e il rilievo si approfondisce; se si
  lascia prima, la carta torna su e non parte niente. A pressione completa la
  richiesta è inviata. Per tastiera e lettori di schermo esiste anche la
  conferma normale (un clic/Invio semplice dopo un avviso "tieni premuto o
  premi di nuovo per confermare").
- **Dopo l'invio non compare nessuna cartolina, ricevuta o scontrino.** La
  prova resta dov'è, premuta, e accanto compare una sola frase in inchiostro:
  "Ricevuto. Domani ti scriviamo il prezzo esatto e ti spediamo a casa questa
  prova, stampata davvero, sulla carta Cipria." In più: il titolo dell'hero,
  se l'utente torna su, porta il suo testo (i suoi nomi) premuto al posto di
  *impronta*. Il sito diventa il suo campione.
- La promessa "ti spediamo la prova vera" è il gancio commerciale per il
  tipografo cliente di CiceriLab: trasforma il preventivo online in un oggetto
  in mano, cioè nel suo punto di forza.
- Stati obbligatori: vuoto (prova con testo di esempio già premuto, mai
  bianca), errore (campo contatto non valido, detto sotto il campo), invio in
  corso (la pressa resta giù, niente spinner), invio fallito (la carta risale
  e il messaggio dice cosa fare, con telefono).

### 4.5 Cosa NON fare (anti-pattern specifici per IMPRONTA)

**Dalla ricetta bocciata e dal vecchio TORCHIO**
- Niente fondo crema, avorio o "carta antica"; niente nero + rosso; niente
  font condensato grottesco; niente monospace, nemmeno per prezzi o orari.
- Niente serif corsivo, niente Cormorant/Playfair/Fraunces, niente corsivo
  di Anybody.
- Niente occhielli "01 ·", niente maiuscoletto spaziato, niente "Tav. I",
  niente timbro "BOZZA", niente didascalie poetiche.
- Niente schede bianche con bordino, niente griglia di card, niente bento,
  niente tre colonne uguali.
- Niente fade-up allo scroll: l'unico ingresso è la pressione, e solo sui
  blocchi premuti. Il testo in inchiostro è fermo.
- Niente filetti, onde o divisori tra le sezioni: si passa da una sezione
  all'altra con lo spazio bianco della carta. (Il filo della legatoria è un
  contenuto, non un divisore: compare solo lì.)
- Niente mappa disegnata; niente figure umane o mani in SVG; niente
  illustrazioni di torchi, caratteri mobili o macchine in SVG disegnato a mano.
- Il preventivo non è a passi numerati e non finisce in cartolina, scontrino,
  ricevuta, busta che si chiude o "certificato".

**Specifici di questo concept**
- Non usare fotografie, né foto finte di caratteri in piombo (il vecchio 10
  ne aveva una): tutto il materiale è generato.
- Non mettere informazioni solo nel rilievo a secco. Mai testo di lettura a
  secco. Contrasto AA su ognuna delle quattro carte, verificato carta per carta.
- Non far girare la luce da sola fuori dall'hero, e mai con cambi di
  luminosità rapidi. Niente riflessi della lamina che "sfarfallano".
- Non trasformare la lamina in un gradiente oro o in un effetto "glow": è
  argento, sobrio, e solo su marchio, prezzo e leva.
- Non aggiungere un secondo colore d'accento (niente CTA di un altro colore,
  niente badge colorati). Il colore del sito è la carta.
- Non mischiare carte nella stessa schermata tranne nella sezione "Per chi"
  (dove i tre pezzi sono oggetti appoggiati sul foglio) e nella scelta carte.
- Niente cursore custom, niente cerchio che segue il mouse, niente testo
  magnetico sui bottoni.
- Niente contatori finti ("1.240 lavori consegnati"), niente riga di numeri
  sotto il titolo dell'hero, niente "dal 1956" come occhiello.
- Niente scritte verticali ruotate, niente strip decorative in fondo all'hero,
  niente "Scorri", niente coordinate GPS.
- Niente trattini lunghi (né `—` né `–`) in nessun testo visibile.
- Non mettere due bottoni con lo stesso intento: "Prova la tua" è l'unico
  richiamo al preventivo (menu, hero, piede).
- Su 375 px: la parola dell'hero non va tagliata a caso dal bordo; il banco di
  prova non diventa un modulo lungo senza la prova in vista; i tre pezzi di
  "Per chi" non si riducono a una colonna di rettangoli.

### 4.6 Note per le ondate successive

- **tech-architect / webgl-artist**: un solo `<Canvas>` fisso a tutta pagina,
  dietro al DOM, con piani che seguono i rettangoli dei blocchi DOM premuti
  (drei `View` o tracciamento manuale). Mappe di altezza generate su canvas 2D
  da testo vero con i font già caricati (`document.fonts.ready`), sfocatura a
  2-3 passaggi per lo smusso, risoluzione limitata (DPR massimo 1,75 su mobile).
  Pausa del rendering quando la scheda non è visibile e quando nessun input
  cambia (render on demand). Fallback CSS se WebGL manca.
- **motion-designer**: gli unici eventi di movimento sono: pressione dei
  blocchi, luce, pinned delle tecniche, propagazione della carta, filo della
  legatura, leva. Nient'altro si muove.
- **copywriter**: italiano da bottega di Pordenone, frasi brevi e concrete
  (grammature, formati, prezzi, tempi di consegna in giorni lavorativi).
  Nessun verbo da startup. Nessun dato legale inventato.
- **Riferimenti da cercare (trend-researcher)**: siti di letterpress e cartotecnica
  premium, lavori con relief/normal-map su testo in WebGL, siti Awwwards che
  usano un solo materiale come interfaccia. Estrarre principi, non copiare.
