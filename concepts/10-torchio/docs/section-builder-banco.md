# Section-builder banco · Concept 10 · IMPRONTA

Ondata 3. La sezione `#banco`, "Il banco di prova": il preventivo unico del
sito. Il cliente sceglie cosa stampa, scrive il suo testo, sceglie carta e
tecnica, vede la prova premuta dal vivo con il prezzo impresso in lamina,
lascia un contatto e invia tenendo premuta la leva. Dopo l'invio la prova
resta dov'è, una frase promette la prova vera a casa e l'hero porta il testo
del cliente al posto di *impronta*.

Letti: `DESIGN.md`, `docs/scaffold-engineer.md`, `creative-director.md` §4.4,
`ux-architect.md` §5.6 e §6, `copywriter.md` con `content/testi.ts` e
`content/prezzi.ts`, `art-director.md`, `motion-designer.md` §6.6,
`interaction-designer.md` §4-§9, `webgl-artist.md`, `shader-engineer.md`,
`integrazione-sito.md`, le skill `design-taste-frontend` e
`full-output-enforcement`.

---

## 1. File

Tutti in `src/pages/concepts/impronta/sections/Banco/`.

| File | Cosa fa |
|---|---|
| `Banco.tsx` | La sezione: testa, bozza ritrovata, compositoio, promessa, totale, leva, esito, lastra. Stato locale del contatto (mai nello store), invio, annunci `aria-live`, tastiera aperta su mobile (`visualViewport`), `track('demo_prenotazione')` al successo |
| `Compositoio.tsx` | Le scelte: cosa stampi, il tuo testo, la carta, la tecnica e il taglio colorato, la legatura (solo libro), quante, dove ti scriviamo, quando ti serve. `fieldset` + `legend`, radio veri, campi con etichetta sopra e avvisi sotto |
| `Prova.tsx` | La lastra (`figure`): la prova nella proporzione vera del formato, registrata come pezzo a rilievo, la pressa (`usePressione`), il prezzo in lamina, il dial della luce, la striscia con la tastiera aperta, la figcaption col riepilogo |
| `Leva.tsx` | Il markup della leva su `useHoldToConfirm`: pista in lamina, manico tondo, corsa premuta, etichetta per stato, regione dei messaggi |
| `calcolaPrezzo.ts` | La formula del copywriter §7 (verificata sui sei casi della sua tabella) e i due calcoli puri sul testo: righe da comporre e segni che la cassa non ha |
| `invio.ts` | Invio **simulato** (nessuna rete, 1,2 s), fallisce con `?invio=ko` o con `navigator.onLine === false`; validazione del contatto; giorno della risposta |
| `banco.css` | Tutto lo stile della sezione, solo variabili `--imp-*` |

---

## 2. Struttura e composizione

```
section#banco.imp-banco.imp-block   [data-invio, data-tastiera]
  .imp-page
    header: h2 "Il banco di prova" + riga
    .imp-banco__banco                       (desktop: griglia a 12 colonne)
      .imp-banco__colonna                   c8-c12, ordine di lettura e di tab
        [bozza ritrovata + Ricomincia]
        Compositoio (8 gruppi, in ordine libero, nessun numero)
        promessa · Totale indicativo 400 € IVA inclusa · Leva · messaggi · esito
      figure.imp-banco__lastra              c1-c6, sticky sotto la testata
        vassoio (area premuta nel foglio) > posa (formato vero) > prova + prezzo in lamina
        dial della luce, figcaption (riepilogo, da cosa dipende, ristampa), .imp-sr alt
  p.imp-sr[aria-live=polite]               annunci della sezione
```

- **La lastra** è un'area premuta nel foglio (`--imp-secco-fondo` con due fili
  di luce e ombra tinti): il letto della platina. Sopra, la prova è un
  `.imp-foglio` della carta scelta, nella proporzione vera (85×55, 148×105,
  A4, 150×210). Su desktop la "presenza" tiene il biglietto più piccolo del
  libro, come sul bancone; su mobile ogni formato usa tutta la lastra.
- **Composizione per prodotto** (misure in `cqi` del pezzo): biglietto con
  nome e mestiere in basso a sinistra; partecipazione con i due nomi al
  centro e la data sotto; carta intestata con l'intestazione in alto e il
  foglio libero; libro con titolo nel terzo alto, autore al piede e il dorso
  che mostra la legatura (brossura, cartonato con la cerniera, punti della
  giapponese, due punti metallici). Il dorso è decorativo: la legatura è
  scritta nel riepilogo.
- **Righe lunghe**: le righe grandi (Anybody) si stringono con l'asse `wdth`
  fino a 75 (una misura DOM per riga, solo quando cambiano testo, forma o
  misura), poi vanno a capo tra le parole. Anybody mai sotto 20 px.
- **La lettera nuova "cade"** nel compositoio: l'ultima lettera scritta scende
  di 0,42 em in 190 ms (in linea, niente `inline-block`: la parola non si
  spezza), mentre la pressa fa la battuta sul pezzo.
- **Prezzo**: in lamina sul margine della prova (decorativo, `aria-hidden`),
  in inchiostro sopra la leva (`Totale indicativo`, gemello leggibile) e nel
  riepilogo in parole. Sempre visibile prima dell'invio.
- **Leva**: pista in lamina 72 px, manico tondo (l'unico tondo del sito) che
  scorre con `--imp-hold`; la corsa già fatta si rovescia in lamina premuta.
  Magnete di 6 px sul manico, che si spegne man mano che la leva scende.

### Larghezze

| Larghezza | Lastra | Note |
|---|---|---|
| < 600 | in alto, `sticky`, 42svh, a vivo sui margini, sotto la testata quando è attaccata (`:has(.imp-testata[data-attaccata]:not([data-via]))`) | riga in cima al vassoio: totale in inchiostro a sinistra, luce a destra; riepilogo in parole nel compositoio |
| 600-1023 | come sopra; da 640 px la lastra parte da 0 e la prova comincia sotto il bottone "Torna in Ciceri Lab" (68 px) | quattro carte con più aria, tecniche e "quando" su tre colonne |
| ≥ 1024 | c1-c6, `sticky` a testata + 24 px, altezza `min(56svh, 100svh − 310 px)` | c7 vuota come canalino largo; figcaption sotto la lastra; 32vh di carta sotto la leva perché, con la leva a metà schermo, la lastra ferma sia ancora intera |

**Tastiera aperta** (sotto 1024, fuoco in un campo del banco): la lastra lascia
il suo posto nel flusso (niente salti) e il piano diventa una striscia
fissa al 28% del `visualViewport`, agganciata a `offsetTop` (+ testata se
c'è), con la sola riga che si sta scrivendo, premuta, a tutta larghezza
(`clip-path` in `--imp-dur-lastra`, 0 ms con reduced motion). Il campo attivo
scorre sotto la striscia (`scroll-margin` + `scrollIntoView` al ridimensionamento
del viewport).

---

## 3. I 14 stati

| Stato | Dove e come |
|---|---|
| Vuoto / primo arrivo | righe d'esempio di `CAMPI_TESTO` premute più leggere (`--imp-rilievo` ridotto; in inchiostro e lamina anche opacità), `BANCO.tuoTesto.esempio` sotto la legenda. Mai bianca |
| Campo svuotato | la riga torna all'esempio; la pressa va a `ESEMPIO_LEGGERO` (0,4) finché non si scrive di nuovo |
| Scrittura | battuta sulla prova (`pressa.battuta()`), lettera che cade; nessun annuncio per lettera |
| Testo lungo | la riga si stringe, poi va a capo; sotto il campo `lungo(max)`; contatore `contatore/contatoreAria` negli ultimi 5 caratteri; il campo non blocca |
| Segno non disponibile | `pulisciSegni`: emoji e segni fuori dal latino restano fuori dalla prova; sotto il campo `segnoMancante` |
| Bozza ritrovata | `BANCO.bozza.frase` + "Ricomincia" sopra il compositoio; `ANNUNCI.bozzaRitrovata` quando il banco entra in vista, `bozzaSvuotata` dopo |
| Contatto non valido | all'uscita dal campo (mai a ogni lettera): bordo 3 px, segno "!", `erroreSr` + `nonValido`, `aria-invalid`; sparisce appena il valore diventa valido |
| Leva senza contatto | `puoPartire()` falso: la pressa non scende, fuoco e scorrimento al campo, `BANCO.contatto.vuoto` sotto |
| Rilascio anticipato | la carta risale con la molla, sotto la leva `BANCO.leva.presto` (si toglie alla pressione successiva) |
| Primo tocco breve | la leva si arma: etichetta `confermaDiNuovo`, binario segnato, annuncio `ANNUNCI.confermaDiNuovo`; seconda pressione entro 6 s invia |
| Invio in corso | la pressa resta giù (`urto` al contatto), etichetta `inCorso`, `aria-disabled`, scelte ferme (`fieldset disabled`, contatto `readOnly`), annuncio `ANNUNCI.inCorso`, nessuno spinner |
| Successo | la leva sparisce, al suo posto `successo.frase(carta, giorno)` + "Mandi, Marta" + "Prova un'altra cosa"; fuoco sulla frase; la prova resta premuta; le scelte restano come record (quelle non scelte perdono il fondo) |
| Invio fallito | `leva.reset()`: la carta risale; sotto la leva `fallito.frase` + link `tel:` + `rassicura`; fuoco sul messaggio; tutte le scelte restano |
| Senza WebGL | fallback CSS completo; `BANCO.senzaWebgl.sr` nella figure in tutti e due i casi |

"Prova un'altra cosa" e "Ricomincia" chiamano `svuotaBozza()` (carta e testo
dell'hero restano), riportano la leva a riposo e il fuoco alla prima scelta.

---

## 4. Contratti usati

- **Store**: `useImpronta` per `carta`, `prova`, `bozzaRitrovata`, `invio`,
  `simulaErroreInvio`; azioni `aggiornaProva`, `impostaInvio`, `svuotaBozza`,
  `confermaTestoCliente(testo)`. Il testo per l'hero è quello scritto: per
  la partecipazione `HERO.parolaCliente(primo, secondo)` ("Giulia e Marco"),
  altrimenti la prima riga scritta; se non si è scritto niente l'hero resta
  com'è. Il contatto non entra mai nello store né nella memoria.
- **Carta**: `cambiaCarta(carta, etichetta)` di `paperWave.ts` (l'onda parte
  dal quadrato), `ANNUNCI.carta` dopo la Promise.
- **Rilievo**: la prova è `kind: 'piece'`, un layer `text` per riga con
  `selettore: [data-riga="i"]`, `profondita` 0,45 per le righe d'esempio,
  `text` = righe unite (la versione sale a ogni lettera), `tecnica` quella
  mostrata, `carta` quella scelta, `tracking: 'live'` (lastra sticky),
  `priorita: 10`. Il prezzo è `kind: 'text'`, `lamina`, `priorita: 9`.
  **Solo da 1024 px**: sotto, la lastra è un foglio opaco sopra il
  compositoio che scorre e il canvas (dietro a tutto) non si vedrebbe; lì
  il rilievo è sempre CSS e la classe `imp-relief` non c'è.
- **Con il GL acceso** (desktop): il vassoio diventa trasparente (resta il
  solco), le righe figlie del pezzo si spengono come il fantasma; se lo
  shader segna `data-imp-gl="fuori"` sul pezzo o sul prezzo torna il rilievo
  CSS di quei due.
- **Pressa**: `usePressione(foglio, { profilo: BANCO.prova })` e
  `usePressione(prezzo, { profilo: BANCO.prezzo })`; `ristampa` quando
  cambiano prodotto o tecnica (formato e righe cambiano sotto la platina),
  `battuta`, `verso(ESEMPIO_LEGGERO)`, `segui(pressioneLeva(p, 0,78))` a ogni
  frame della leva, `urto()` al contatto. La lastra riceve anche
  `--imp-banco-leva` (ombra della platina che si avvicina, pezzo che si
  schiaccia di 1 px, solco più profondo).
- **Leva**: `useHoldToConfirm` con `testi: { armato: ANNUNCI.confermaDiNuovo,
  annullato: BANCO.leva.presto }`, `puoPartire`, `onBloccato`, `onInizio`
  (`holding`), `onAnnulla` (`idle`), `onProgress`, `onCompleta`, `magnete: 6`.
- **Luce**: `useLuceDial()` nell'angolo della lastra; il vassoio ha
  `data-imp-luce` (il dito sulla prova sposta la luce).
- **Analytics**: `track('demo_prenotazione', { concept: 10, prodotto,
  tecnica, tiratura, carta, via })` solo all'invio riuscito. Mai testo né
  contatto.
- **Giorno**: `giornoRisposta(new Date().getDay())`: "domani" da martedì a
  venerdì, "martedì" da sabato a lunedì (il lunedì la bottega è chiusa).

---

## 5. Accessibilità

- Ordine DOM = ordine di lettura = tab: h2, riga, compositoio, leva, esito,
  poi la figure (che non riceve fuoco; l'unico controllo è il dial).
- Radio e caselle veri; "scelta" scritto accanto al foglio scelto, bordo
  3 px; le carte hanno il nome accessibile completo (`radioAria`).
- Campi con etichetta visibile sopra, `autocomplete`, `inputMode` del
  contatto scelto dal primo carattere (`tel` o `email`), 17 px, errori e
  avvisi collegati con `aria-describedby`.
- Un annuncio polite per la sezione: prezzo (800 ms dopo l'ultima scelta,
  col nome della scelta), prodotto, carta, bozza, esito; mai a ogni lettera.
  Il prodotto cambiato da fuori ("Prova la tua" di un pezzo) annuncia
  `bancoImpostato`.
- La leva ha nome costante "Tieni premuto per stampare", doppia pressione per
  chi non può tenere, Spazio e Invio tenuti, clic dei lettori di schermo.
- `prefers-reduced-motion` / `data-motion="reduced"`: niente caduta delle
  lettere, niente striscia che scorre, niente battuta né ristampa animata
  (lo fa il motion), la leva resta di 900 ms.
- `forced-colors`: fogli e campi con bordo di sistema, scelta in `Highlight`.
- Nessuna informazione solo nel rilievo: righe della prova nei campi e in
  `BANCO.prova.alt`, prezzo in inchiostro accanto, legatura nel riepilogo.

---

## 6. Verifica

- `npm run typecheck` verde, `eslint src` verde (zero avvisi).
- Dev server mio: `npx vite --port 8106 --strictPort`.
- Playwright (Chromium di `/opt/pw-browsers`, SwiftShader), flusso percorso
  davvero: scrittura, cambio carta con l'onda, tecnica, tiratura, contatto
  non valido, leva senza contatto, rilascio anticipato (messaggio
  "Hai lasciato presto…"), tenuta completa col mouse, doppia pressione
  (clic), Spazio tenuto, Invio doppio, invio riuscito (fuoco sulla frase,
  `impronta:inviata` = testo, hero con "Giulia e Marco", `track` con
  `demo_prenotazione`), `?invio=ko` (carta che risale, messaggio col
  telefono), bozza ritrovata dopo il ricaricamento, "Prova un'altra cosa",
  testo lungo (asse stretto a 75 e poi a capo, note sotto i campi), emoji,
  tastiera a 375 (viewport 375×380/390), reduced motion, `?gl=0` e GL
  acceso (`?gl=1`, contesto SwiftShader senza `failIfMajorPerformanceCaveat`):
  il pezzo e il prezzo li disegna lo shader. Nessun errore in console oltre
  ai font di Google rifiutati dal proxy della sandbox.
- Screenshot in `/tmp/claude-0/shots-banco/`.

Nota sulle prove automatiche: in SwiftShader un frame costa centinaia di
millisecondi, e uno screenshot fatto mentre si tiene la leva arriva spesso
dopo i 900 ms. Il gesto va provato su un dispositivo vero.

---

## 7. Richieste e osservazioni per altri agent

- **shader-engineer**: su Citrino la lamina a caldo (righe della prova in
  lamina e prezzo) nel GL si vede pochissimo, su Grafite bene
  (`1440-gl-on-scrivi.png` contro `1440-gl-on-colore-scrivi.png`). È il
  caso già segnato dall'art-director (argento e Citrino hanno la stessa
  luminanza): serve il filo scuro della lamina anche nello shader. Nella
  maschera del pezzo la seconda riga ("Restauratrice") esce con qualche
  spaziatura irregolare.
- **art-director**: la regola generica per `data-imp-gl="fuori"` chiesta
  dallo shader-engineer non c'è ancora in `relief-fallback.css`; per il
  pezzo e il prezzo del banco l'ho coperta in `banco.css`.
- **interaction-designer**: `.imp-ix-premibile:hover` ha specificità più
  alta di `.imp-ix-scelta:has(:checked)`, quindi su una scelta scelta il
  bordo di 3 px sparisce sotto il puntatore. Nel banco è coperto da regole
  più specifiche; le altre sezioni che usano le due classi insieme hanno lo
  stesso problema.
- **section-builder-hero**: la lastra su mobile legge
  `.imp-testata[data-attaccata]:not([data-via])` per stare sotto la testata
  quando c'è: se cambiate quei due attributi, avvisatemi.

---

## 8. Scelte consapevoli

| Punto | Documento | Scelta | Perché |
|---|---|---|---|
| Partecipazione | nomi uniti da "e" | due righe impilate, "e" solo nell'hero (`parolaCliente`) | ogni campo vuoto torna all'esempio da solo, più leggero; la composizione a due righe è quella classica |
| Intestata | intestazione | tutta in Hanken (nome 6,4 cqi, indirizzo 3,4 cqi) | su un A4 largo 280 px Anybody scenderebbe sotto 20 px |
| Riepilogo | "solo voci diverse dalla base" | anche lastra, busta, buste | dicono da cosa dipende il prezzo in parole semplici (creative-director 4.4: "impianto a secco 60 €, 100 pezzi con busta") |
| Carta nel compositoio | radio sincronizzato | la spunta segue lo scambio dell'onda (circa 300 ms) | la carta dello store cambia al 45% dell'onda; un secondo stato locale mentirebbe per 300 ms |
| Rilievo GL | tutta la sezione | pezzo e prezzo allo shader solo da 1024 px | sotto, la lastra è un foglio opaco che copre il canvas |
| Scelte dopo l'invio | non specificato | ferme e visibili, come la bolla di un ordine | la prova "resta dov'è"; "Prova un'altra cosa" le libera |

---

## Giro 2 (giuria: Banco 5; auditor accessibilità, prestazioni, responsive; art-director e copywriter giro 2)

| Punto | Cosa ho fatto | File |
|---|---|---|
| Schede con bordino (Cotone bianche, Citrino gialle) | Via tutte le tile. **Cosa stampi**: i quattro formati disegnati in scala (mm × `--imp-banco-k`, sagome `.imp-foglio` con costa e un segno d'inchiostro dove cadrebbe il testo; libro col dorso), si tocca la sagoma; su colonna < 440 px due per riga, stessa scala. **Tecnica**: le prime due lettere del testo del cliente stampate nella tecnica (secco, inchiostro, lamina) sopra il nome. **Quante**: numeri Anybody in riga. **Legatura, Quando**: parole in riga. Scelta = riga premuta d'inchiostro 3 px con labbro di luce + "scelta" | `Compositoio.tsx`, `banco.css` |
| Campi bianchi su bianco | `--imp-superficie` + `--imp-ombra-superficie` dell'art-director (campi, casella del taglio, "Prova un'altra cosa"); `--imp-carta-luce` resta solo labbro | `banco.css` |
| Prova = riquadro vuoto | Tolto il vassoio con bordo: il biglietto sta sulla carta del sito con costa e ombra, largo ~530 px a 1440 (margini 16 px, presenza 1). Rilievo del CSS più netto: `--imp-rilievo` 3,2 (esempio compreso, che ora si legge come la prova vera) + 0,8 con la leva; inchiostro 1,4 | `banco.css` |
| Nome sdoppiato dopo l'invio | Era mio: `--imp-rilievo` arrivava a 4 a leva piena e le due ombre nette della lamina diventavano una seconda copia. Ora la lamina delle righe ha profondità fissa 1,1 (e l'art-director ha messo un `clamp` in `.imp-caldo`); la leva approfondisce solo secco e inchiostro | `banco.css` |
| Leva = barra grigia | Solco inciso nella carta (fondo del solco, ombra interna, labbro), manico tondo in lamina (`--imp-lamina-grana` + `--imp-lamina-bordi`, riflesso sferico) che scorre fino al **fermo** d'inchiostro; la corsa fatta si scurisce nel solco; tenendo, il manico affonda. Etichetta Hanken 18/600 sopra il solco, mai sovrapposta | `Leva.tsx`, `banco.css` |
| Successo | Il nome si imprime ancora una volta (`urto`). Frase fuori dalla colonna: su mobile **sopra** la lastra (ordine −2), che smette di stare ferma; su desktop al posto della leva, riga 2 della griglia, con la lastra che copre le due righe (resta accanto) | `Banco.tsx`, `banco.css` |
| Vuoto sotto la leva (1440) | Tolti i 32vh di carta in fondo alla colonna e il piede ridotto | `banco.css` |
| Lastra a 768 che copre la leva; 42svh | Tra 600 e 1023 la lastra è 42svh **in tutto** (compresi i 64 px sotto il bottone del sito); scroll-margin sui controlli | `banco.css` |
| A1 "cos'è?" coperto | Link nel flusso sotto la legenda della tecnica, niente posizionamento assoluto | `banco.css` |
| A2 fuoco coperto | `scroll-margin-block` sull'elemento che riceve il fuoco (input, radio, leva, link, dial, bottoni, esito): mobile 42svh + testata, in basso posto per i fissi; desktop testata + 16 px | `banco.css` |
| A3 reflow al 400% | `@media (max-height: 34rem)`: lastra non ferma, vassoio `min(60vh, 20rem)`; `min-block-size: min(260px, 42svh)` | `banco.css` |
| M2 esito letto due volte | Niente annuncio di successo e di errore: il fuoco va sulla frase | `Banco.tsx` |
| M5 leva, nome ≠ etichetta | Tolti `aria-label` e `aria-hidden`: il nome è l'etichetta visibile, che cambia con lo stato | `Leva.tsx` |
| B3 prezzo annunciato da lontano | L'annuncio del prezzo parte solo se la scelta viene dal banco o il fuoco è nel banco | `Banco.tsx` |
| B8 errore contatto non annunciato | `role="status"` sul paragrafo dell'errore (sempre nel DOM, vuoto quando non c'è errore) | `Compositoio.tsx` |
| P2 INP: 17 layout per tasto | `adattaRighe` riscritta: una **sonda** invisibile per riga grande (stesso testo a wdth 100, senza a capo) dà la larghezza naturale; due funzioni fisse nel ticker leggono tutto in fase `read` e scrivono in fase `write`, al frame dopo il tasto (un layout per tutte le righe, zero letture nell'handler). Le righe della prova non hanno più la transizione del colore (il cambio di tecnica è una sostituzione secca sotto la platina) | `Prova.tsx`, `banco.css` |
| Copywriter giro 2 | `BANCO.intro` vuota: niente `<p>`. Riepilogo, `dipende` e `ristampa` resi **una volta sola**: sotto la lastra da 1024 px, nel compositoio sotto | `Banco.tsx`, `Compositoio.tsx`, `Prova.tsx` |
| Art-director giro 2 | Tolte le mie regole `data-imp-gl="fuori"` per pezzo e prezzo (ora le copre `relief-fallback.css`); resta solo lo spegnimento delle righe figlie | `banco.css` |

**Verifica**: typecheck e `eslint src/.../Banco` verdi. Dev server mio su 8102, riavviato con `--force` perché la cache dei moduli (HMR di `Filo.tsx`, non mio) bloccava la pagina, poi chiuso. Font serviti con `page.route` + curl. Screenshot in `/tmp/claude-0/shots-banco/giro2/`
`{375,768,1440,2560}-{citrino,cotone}-gl0-{1-vuoto,2-compilato,3-leva-a-meta,4-successo}.png` e
`{1440,375}-{citrino,cotone}-gl-….png` (GL acceso). La "leva a metà" si fotografa fermando `requestAnimationFrame` a metà tenuta.

**Da girare**:
- **shader-engineer**: col GL acceso su SwiftShader, dopo lo scroll verso la frase di successo il pezzo resta disegnato per un momento nel punto vecchio (`1440-cotone-gl-4-successo`): probabilmente è la lentezza del frame in headless, ma va visto su GPU vera. Il prezzo in lamina su Citrino nel GL resta quasi invisibile (già segnalato al giro 1).
- In headless a 2560 una ristampa (170 + 520 ms) può superare il secondo, perché i frame sono lenti: su una macchina vera va bene.
