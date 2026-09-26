# Copywriter · Concept 18 · SOTTOSCOCCA, officina e gommista (Pordenone)

Ondata 2. File miei (tech-architect §4):
`src/pages/concepts/sottoscocca/content/testi.ts`,
`src/pages/concepts/sottoscocca/content/lavori.ts`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, riga e paragrafo 18 di `docs/matrice-concept-11-20.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, tutti i doc dell'ondata 0-1 in
`concepts/18-sottoscocca/docs/` (creative-director, brand-strategist,
ux-architect, tech-architect, trend-researcher), `concepts/10-torchio/docs/copywriter.md`
e il suo `testi.ts` (solo formato).

Controlli fatti sui due file:
- `tsc --strict --noUncheckedIndexedAccess --noUnusedLocals --noUnusedParameters --noImplicitReturns` verde;
- compilati in JS nello scratchpad e **eseguite le funzioni** con valori di
  esempio: le frasi escono come in §5 (niente "undefined", niente spazi doppi);
- script su tutte le stringhe: nessun `—` o `–`, nessun `!`, nessun `…`, `...`
  solo in "Invio..." (eccezione del creative-director), mai più di un `·` per
  stringa; nessuna parola della lista "da evitare" del brand-strategist, mai
  "prima di toccare", mai "Prenota" come comando, nessun "01 ·".
- nessun `✓` né `→` nelle stringhe (non esistono in Tektur né in Red Hat Text):
  `→` c'è solo nei commenti del codice; la spunta è detta a parole ("Nel tuo
  lavoro, togli"), la freccia dei link esterni è l'icona SVG del vector-artist.

---

## 1. Come si usa

```ts
import TESTI, { PONTE_LIBERO, durata, etichettaLavoro } from '../../content/testi';
import { LAVORI, PUNTI, ORARI, pontiAdatti, durataMinuti } from '../../content/lavori';
```

- **Ogni** stringa visibile, `aria-label`, `alt`, annuncio `aria-live`, meta è
  in `testi.ts`. I componenti non scrivono testo; se manca qualcosa si chiede.
- Tutto `as const`: un refuso nella chiave non compila.
- Le frasi con valori variabili sono **funzioni** con parametri tipizzati: non
  calcolano buchi, prezzi o date; ricevono numeri già calcolati.
- Orari sempre in **minuti da mezzanotte** (9:10 = 550). Giorni come
  `GiornoTesto = { settimana: 0..6 (come Date.getDay), numero: giorno del mese }`.
- `lavori.ts` è solo dati (più 6 funzioni pure di una riga, §3). Nessun accesso
  al browser in nessuno dei due file: si leggono in prerender.

### Aiuti di formato (`testi.ts`)

| Funzione | Esempio |
|---|---|
| `euro(n)` | `euro(1090)` → "1.090 €" (Intl it-IT non mette il punto a 4 cifre) |
| `prezzoLavoro(id)` | "da 190 € a 260 €", "55 €" |
| `durata(min)` | "40'", "1 h", "1 h 30", "2 h 10" |
| `durataParlata(min)` | "40 minuti", "1 ora", "2 ore e 30" (annunci e aria) |
| `ora(min)`, `intervallo(a, b)` | "9:10", "9:10-11:40" (trattino semplice) |
| `giorno(s, n)`, `Giorno(s, n)`, `giornoBreve(s, n)` | "martedì 7", "Martedì 7", "mar 7" |
| `nomeLavoro(ids)` | "Tagliando + pastiglie" |
| `nomeLavoroParlato(ids)` | "tagliando, pastiglie e scarico" |
| `etichettaLavoro(ids, min)` | "Tagliando + pastiglie · 2 h 30" (per `selEtichettaLavoro`) |
| `pontiTesto(ponti)` | "ponte 1 o 2", "ponte 3" |

---

## 2. Mappa delle esportazioni di `testi.ts`

| Esportazione | Chi la usa | Chiavi principali |
|---|---|---|
| `META` | Radice / seo | `title` (56 car.), `description` (151), `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA` | voce `CONCEPTS` del sito (proposta, decide Luca) | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri` |
| `COMUNI` | ovunque | `marchio`, `marchioSotto`, `trovaUnBuco`, `trovaUnBucoAria`, `seiSulPlanning`, `aggiungi`, `aggiunto`, `chiudi`, `ivaInclusa`, `daQuiSiVede` |
| `SALTI` | Radice | `contenuto`, `planning` |
| `TESTATA` | asta/testata | `marchioAria`, `navAria`, `voci[]` (Deposito, Officina) |
| `QUOTE` | asta, sezioni, `ponte/quota.ts` | per quota 0/20/80/180: `cifra`, `numero`, `nome`, `linkAria`, `annuncio` (plateau), `gruppoPuntiAria` |
| `ASTA` | asta | `navAria`, `indice(cm)`, `scala`, `tuoPonte(g, inizio)`, `tuoPonteAria(...)`, `compattoAria(cm)` |
| `APERTURA` | apertura | `titolo` (h1), `titoloAria`, `sottotitolo`, `frase`, `prezzoIngresso`, `posterAlt` |
| `GOMME` | gomme | `cifra`, `titolo`, `titoloSr`, `testo`, `battistrada`, `tabella.{caption, colonne, riga(), misuraAria()}`, `gommeNuove`, `convergenza`, `deposito.{testo, link, href}` |
| `FRENI` | freni | `cifra`, `titolo`, `titoloSr`, `testo`, `freni.{titolo, segnali, ogniQuanto, prezzo}`, `sospensioni.{...}`, `coppia` |
| `SOTTOSCOCCA` | sottoscocca | `cifra`, `titolo`, `titoloSr`, `testo`, `promessa`, `striscia`, `strisciaInvito`, `tempoElenco(min)` |
| `PUNTI_TESTI` | punti, elenchi "Da qui si vede", scheda | per `IdPunto`: `nome`, `aria`, `cosa`, `segnali[]` (3), `nota` |
| `SCHEDA` | scheda del punto | `chiudi`, `chiudiAria(nome)`, `cosaTitolo`, `segnaliTitolo`, `prezzo(id)`, `tempo(id)`, `tempoAria(id)`, `ponte(ponti)`, `aggiungi`, `aggiunto`, `aggiungiAria(id)`, `aggiuntoAria(id)`, `ivaInclusa` |
| `BARRA` | barra "Il tuo lavoro" | `regioneAria`, `titolo`, `riepilogo(ids, min)`, `riepilogoBreve(n, min)`, `riepilogoAria(...)`, `modifica`, `modificaAria`, `elencoAria`, `togli`, `togliAria(id)`, `trovaUnBuco` |
| `DEPOSITO_TESTI` (in `TESTI.DEPOSITO`) | deposito | `titolo`, `frase`, `come[]`, `prezzi[]`, `prezziCaption`, `cartellino.{codice, riga, aria}`, `conviene`, `aggiungi`, `aggiunto`, `aggiungiAria`, `fotoAlt` |
| `PONTE_LIBERO` | ponte-libero | vedi §4 |
| `RECAPITI` | officina, piede, P0, F5 | `indirizzoRiga1/2`, `indirizzoAria`, `chiama`, `chiamaAria`, `chiamaHref`, `scrivi`, `scriviAria`, `scriviHref`, `maps`, `mapsAria`, `mapsHref`, `nota` |
| `OFFICINA` | officina | `titolo`, `come`, `orariTitolo`, `orari[]`, `picchi`, `chi`, `storia`, `attesa`, `noFacciamo`, `voci[]` (3 recensioni), `vociAria`, `fotoAlt.{ponte, attrezzatura, esterno}` |
| `FALLBACK` | Fondale | `alt` (vuoto), `descrizione` per 0/80/180, `fermoAlt` (vuoto) |
| `PIEDE` | piede | `marchio`, `finzione`, `modello`, `modelloHref`, `modelloAria`, `fotoTitolo`, `foto(credito)`, `fotoAria(credito)`, `licenzaAria(credito)`, `fotoModificate`, `conceptDi`, `indiceTitolo`, `indiceAria`, `indice[]`, `trovaUnBuco`, `ricomincia`, `ricominciaAria`, `ricominciato` |
| `ANNUNCI` | regione `aria-live` | `plateau(q)`, `aggiunto(id, tot)`, `sostituito(nuovo, vecchio, tot)`, `tolto(id, tot)`, `schedaAperta(id)`, `ricominciato` |
| `LAVORI_NOMI` | scheda, parcheggio, barra | per `IdLavoro`: `nome`, `breve`, `parlato`, `nota` |
| `PONTI_TESTI` | planning | per ponte: `nome`, `targhetta`, `chi`, `aria` |
| `OCCUPATI_TESTI` | planning (`genera.ts`) | tipo di lavoro dei blocchi occupati |
| `TESTI` (default) | tutto quanto sopra | |

`titoloSr` (Gomme, Freni, Sottoscocca) va in uno `span.ssc-sr` subito dopo il
titolo visibile dentro l'`h2`: il nome accessibile diventa "Gomme, a 20
centimetri da terra" (ux §5.2). La cifra grande ("20 cm") è `aria-hidden`.

---

## 3. `lavori.ts`: dati e regole

Tipi `Quota`, `Ponte`, `IdPunto`, `IdPezzo`, `IdLavoro` **identici** al
tech-architect §6.4. Esportazioni:

| Nome | Contenuto |
|---|---|
| `PUNTI` | per punto: `quote`, `pezzi`, `lavori` (tabella sotto). Chiavi in ordine davanti → dietro |
| `ORDINE_PUNTI`, `puntiDellaQuota(q)` | gomme, freni, sospensioni, olio, scarico, convergenza (ruota posteriore) |
| `LAVORI` | per lavoro: `minuti`, `ponti`, `prezzoDa` (i tre campi del tech-architect) **più** `prezzoA` (fine della forbice o `null`) e `reparto` (`'gomme'` o `'meccanica'`) |
| `ORDINE_LAVORI` | ordine del parcheggio "Cosa facciamo?" |
| `ESCLUSIVI`, `esclusoDa(id)` | coppie che si sostituiscono: cambio gomme / gomme dal deposito; pastiglie / pastiglie e dischi |
| `haCambioGomme(ids)` | fa comparire la domanda del deposito |
| `durataMinuti(ids, gommeGiaInDeposito)` | somma; il cambio stagionale conta 30' se la risposta è Sì |
| `pontiAdatti(ids)` | **la regola del ponte**, vedi sotto |
| `PONTI`, `ORDINE_PONTI` | 1: due colonne 3500 kg; 2: due colonne 4000 kg; 3: forbice 3000 kg |
| `ORARI` | mattina `[480, 750]`, pomeriggio `[840, 1110]`, sabato `[480, 720]` |
| `PONTI_SABATO` | `[3]` |
| `PASSO_MINUTI` 10, `MINUTI_MAX_BLOCCO` 270, `GIORNI_MOSTRATI` 6, `ANTICIPO_MINIMO_MINUTI` 60 | regole del planning (ux §5.6) |
| `MISURE_GOMME` | 195/65 R15 48 €, 205/55 R16 56 €, 225/45 R17 64 €, tutte 40' |
| `GOMMA_NUOVA_DA` 74, `BATTISTRADA` | 1,6 / 3 / 4 mm |
| `DEPOSITO` | 40 € a stagione, 70 € l'anno, esempio `D-214` |
| `DEPOSITO_FORMATO`, `normalizzaDeposito(v)` | accetta `d214`, `D 214`, `D-214` → "D-214"; altrimenti `null` |
| `Occupato`, `OCCUPATI_PER_PONTE` | tipi di lavoro dei blocchi occupati per `genera.ts` (ponte 3 solo gomme e convergenza) |
| `RECAPITI_DATI` | via, civico, cap, telefono `0434 000 000`, `tel:+390434000000`, email `officina@sottoscocca.example`, `mailto:`, URL di Maps (ricerca della via), URL Kenney |

### Punti → pezzi → lavori

| `IdPunto` | Quote | Pezzi evidenziati | Lavori nella scheda |
|---|---|---|---|
| `ruota-anteriore` | 20, 180 | `ruota-anteriore` | `gomme-stagionali`, `gomme-deposito` |
| `freni` | 80, 180 | `disco`, `pinza` | `pastiglie`, `pastiglie-dischi` |
| `sospensioni` | 80, 180 | `molla`, `ammortizzatore` | `ammortizzatori` |
| `olio` | 180 | `olio` (coppa), `filtro` | `tagliando` |
| `scarico` | 180 | `scarico` (tubo), `catalizzatore`, `silenziatore` | `scarico` |
| `ruota-posteriore` | 20, 180 | `ruota-posteriore` | `convergenza` |

### Lavori

| `IdLavoro` | Nome | Sul ponte | Ponte da solo | Prezzo |
|---|---|---|---|---|
| `gomme-stagionali` | Cambio gomme con equilibratura | 40' | 3 | da 48 € a 64 € (per misura) |
| `gomme-deposito` | Cambio gomme già in deposito | 30' | 3 | da 48 € a 64 € |
| `convergenza` | Convergenza | 30' | 3 | 55 € |
| `pastiglie` | Pastiglie anteriori | 1 h | 1 o 2 | da 110 € a 160 € |
| `pastiglie-dischi` | Pastiglie e dischi anteriori | 1 h 30 | 1 o 2 | da 240 € a 340 € |
| `ammortizzatori` | Coppia di ammortizzatori | 2 h | 1 o 2 | da 280 € a 420 € |
| `tagliando` | Tagliando | 1 h 30 | 1 o 2 | da 190 € a 260 € |
| `scarico` | Silenziatore e controllo scarico | 1 h | 1 o 2 | da 160 € a 290 € (controllo gratis con altri lavori) |

### La regola del ponte (risposta alla domanda del tech-architect all'ux)

`selPontiAdatti` **non** deve essere un'intersezione dei `ponti` dei lavori:
con gomme + freni darebbe vuoto. La regola (ux §5.0, brand-strategist 7.3) è in
`pontiAdatti(ids)`: solo gomme e convergenza → `[3]`; basta un lavoro di
meccanica → `[1, 2]` (i ponti 1 e 2 fanno anche le gomme). Nessun lavoro → `[]`.

### Cambio gomme e deposito

Due strade che finiscono uguali:
- nella scheda della ruota anteriore si sceglie "Cambio gomme con
  equilibratura" (40') **oppure** "Cambio gomme già in deposito" (30'); si
  escludono;
- nel planning, se c'è `gomme-stagionali`, compare la domanda D0; con "Sì"
  `durataMinuti(ids, true)` conta 30'.

Suggerimento per chi costruisce (store/ponte-libero): se nel lavoro c'è
`gomme-deposito`, la domanda D0 parte già con "Sì" e mostra subito il campo
del numero.

---

## 4. Il ponte libero, stato per stato (ux §6)

Tutte le chiavi sono sotto `PONTE_LIBERO`.

| Stato ux | Cosa si scrive | Chiave |
|---|---|---|
| intestazione | titolo, intro | `titolo`, `intro` |
| striscia dei giorni | radiogroup, "oggi", "pieno", "solo gomme" | `giorni.{aria, oggi, pieno, soloGomme, radioAria(g, stato), scorriAria}` |
| asse e corsie | "chiuso", "passato", Mattina/Pomeriggio, targhette | `asseAria`, `chiuso`, `chiusoSabato`, `passato`, `mattina`, `pomeriggio`, `mezzaGiornataAria`, `corsiaAria(p)`, `PONTI_TESTI[p].{nome, targhetta, chi}` |
| intervalli delle corsie | occupato, passato, buco, buco corto | `intervalloOccupato(a, b, tipo)`, `intervalloPassato(a, b)`, `buco`, `bucoDurata(a, b)`, `bucoAria(p, a, b)`, `bucoCortoAria(a, b)` |
| P0 prima del montaggio | "Il planning si carica." Oppure [Chiama] | `stati.caricamento`, `stati.caricamentoAltro`, `stati.chiama`, `stati.chiamaAria` + `RECAPITI.chiamaHref` |
| P1 vuoto | "Cosa facciamo?", lavori come bottoni | `parcheggio.{titolo, aria, lavoroBottone(id), lavoroAria(id), vuoto, primoBuco, primoBucoAria}` |
| P2 composto | annuncio | `stati.composto(min, ponti, nBuchi, g)` |
| P3 trascinamento | corsie non adatte, sotto l'ombra | `corsiaNonAdatta.{soloGomme, gommeSulTre, sabato}`, `ciSta`, `nonCiSta(liberi)` |
| P4 piazzato | testo nel blocco, annuncio, spostamenti | `blocco.{etichetta, lavoro(), orario(a, b), aria(), cartellino(n), giornataIntera}`, `stati.piazzato(p, g, a, b)`, `stati.spostato(...)`, `stati.spostatoOccupato(p, dalle)`, `stati.ponteSaltato(p)` |
| P5 non ci sta | frase + [Mettilo alle 14:10] | `stati.nonCiSta(liberi, chiesti, alternativa)`, `stati.mettiloAlle(inizio)`, `stati.mettiloAlleAria(p, inizio)` |
| P6 ponte sbagliato | solo gomme su 1-2; misto su 3; meccanica su 3 | `stati.ponteSbagliatoGomme`, `stati.ponteSbagliatoMisto`, `stati.ponteSbagliatoMeccanica` |
| P7 fuori orario | pranzo o sera | `stati.fuoriOrarioPranzo(partenza, fine)`, `stati.fuoriOrarioSera(partenza, fine)` |
| P8 giorno pieno | frase + [Vai a lunedì 13] | `stati.giornoPieno(g, alt, p, inizio)`, `stati.vaiA(alt)` |
| P9 sabato con meccanica | frase + [Vai a ...] | `stati.sabatoMeccanica(lavoro, alt, inizio)` (passare il primo lavoro di meccanica), `stati.vaiA(alt)` |
| P10 troppo lungo | frase, [Togli un lavoro], [Lascia l'auto per la giornata] | `stati.troppoLungo`, `stati.troppoLungoAria`, `stati.togliUnLavoro`, `stati.giornataIntera`, `stati.giornataInteraSpiega`, `stati.giornataInteraNessuna` |
| P11 nessun buco | frase | `stati.nessunBuco(min)` |
| P12 lavoro cambiato | allungato, accorciato, cambia ponte | `stati.allungato(min)`, `stati.accorciato(min)`, `stati.oraServe(ponti)` |
| primo buco in un altro giorno | frase | `stati.primoBucoAltroGiorno(g, min, alt, p, inizio)` |
| P13 cambio giorno | annuncio | `stati.cambioGiorno(g, nBuchi)` (`nBuchi` numero o `null`), `stati.tornatoAlParcheggio` |
| P14 tutto tolto | annuncio | `stati.vuoto` |
| trascinamento annullato | annuncio | `stati.trascinamentoAnnullato` |
| rifinitura | 10' prima / dopo, mensola | `prima`, `dopo`, `primaAria`, `dopoAria`, `mensola(g, p, a, b)`, `mensolaAria` |
| istruzioni tastiera | orizzontale / verticale / parcheggio | `istruzioni.{orizzontale, verticale, parcheggio}` |
| elenco buchi | titolo, bottoni, nessuno | `buchi.{titolo(g), bottone(p, a, b), bottoneAria(...), nessuno(g, min), senzaLavoro}` |
| D0-D4 deposito | domanda, Sì/No, campo, formato, errori | `deposito.{domanda, si, no, etichetta, formato, erroreFormato, erroreVuoto, noSpiega, siAnnuncio, noAnnuncio}` + `invio.depositoGia(n)` / `invio.depositoNuovo(n)` in F4 |
| F1-F2 dati | etichette, aiuti, errori | `dati.{legenda, riepilogo(g, p, a, b), riepilogoGiornata(g, p), riepilogoSenzaOrario, nome, telefono, targa, nota, errori(campi), nomiCampi}` |
| F3 invio | bottone, "Invio...", annuncio | `invio.{bottone, inCorso, inCorsoAnnuncio}` |
| F4 successo | frase + richiamo + deposito + firma, [Un altro lavoro] | `invio.successo(g, inizio, p)` / `successoGiornata(g, p)` / `successoSenzaOrario`, poi `invio.richiamo(quando)`, poi `depositoGia`/`depositoNuovo`, poi `invio.firma`; `invio.altro`, `altroAria`, `altroAnnuncio` |
| F5 fallito | frase, [Riprova] oppure [Chiama] | `invio.{fallito, riprova, oppure, chiama, chiamaAria, fallitoAnnuncio}` + `RECAPITI.chiamaHref` |
| F6 ritorno dopo successo | frase | `invio.giaInPonte(g, inizio)`, `invio.giaInPonteGiornata(g)` |
| F7 un altro lavoro | annuncio | `invio.altroAnnuncio` |

**`richiamo(quando)`**: `'sera'` se l'invio avviene in un giorno aperto prima
delle 18:30 (sabato prima delle 12:00), altrimenti `'domani'` (promessa del
brand-strategist §8). Lo decide `ponte-libero` con l'ora del dispositivo.

**Numero di deposito nuovo (D4)**: lo genera `ponte-libero` (D e tre cifre,
diverso da `D-214`); il testo lo riceve già formattato.

**Esempio completo di successo** (uscita reale delle funzioni):

> Fatto. Martedì 7 alle 9:10 te la alziamo sul ponte 2. Ti richiama Erika
> entro sera per confermare. Se serve un ricambio da ordinare, te lo dice lei.
> Mandi, Erika.

È l'unico punto in cui il messaggio chiave torna, in forma diversa ("te la
alziamo"), come chiede il brand-strategist §10.

---

## 5. Uscite di prova (eseguite davvero)

```
etichettaLavoro(['tagliando','pastiglie'], 150) → Tagliando + pastiglie · 2 h 30
stati.composto(150, [1,2], 3, mar 7)            → Il tuo lavoro: 2 ore e 30 sul ponte 1 o 2. 3 buchi adatti martedì 7.
stati.nonCiSta(50, 90, {ponte 2, 850})          → Qui ci sono 50 minuti, il tuo lavoro ne chiede 1 ora e 30. Il ponte 2 è libero dalle 14:10.
stati.giornoPieno(ven 10, lun 13, 3, 480)       → Venerdì 10 è pieno. Lunedì 13 il ponte 3 è libero dalle 8:00.
stati.sabatoMeccanica('tagliando', lun 13, 480) → Il sabato facciamo solo gomme. Per il tagliando il primo buco è lunedì 13 alle 8:00.
mensola(mar 7, 2, 550, 640)                     → mar 7, ponte 2, 9:10-10:40
giorni.radioAria(sab 11, 'libero')              → Sabato 11, solo gomme, mattina
BARRA.riepilogoBreve(2, 150)                    → 2 lavori · 2 h 30
ANNUNCI.sostituito('pastiglie-dischi','pastiglie',90) → Pastiglie e dischi anteriori al posto di pastiglie anteriori. Il tuo lavoro: 1 ora e 30.
ASTA.tuoPonte(mar 7, 550)                       → il tuo ponte: mar 7, 9:10
durataMinuti(['gomme-stagionali','tagliando'], true) → 120
pontiAdatti(['gomme-stagionali','pastiglie'])   → [1, 2]
normalizzaDeposito('d214')                      → D-214
```

---

## 6. Lunghezze (per 375 px)

Area utile a 375: 375 − 16 − 48 (asta) = circa 311 px nei pannelli delle quote,
343 px nel planning. Red Hat Text 17 px circa 36-38 caratteri per riga.
Chi cambia un testo resta sotto questi limiti o avvisa art-director e builder.

| Testo | Adesso | Massimo | Nota |
|---|---|---|---|
| `APERTURA.titolo` (h1) | 11 | 11 | Tektur largo che riempie la larghezza utile |
| `APERTURA.frase` | 58 | 60 | 2 righe a 375, 1 o 2 a 1440. L'ux indicava 40 come segnaposto; il messaggio chiave del brand-strategist è vincolante e non si accorcia |
| `APERTURA.prezzoIngresso` | 42 | 44 | una riga a 1440, due a 375 |
| `COMUNI.trovaUnBuco` | 13 | 13 | bottone di testata a 375 insieme al marchio (56 px di testata) |
| `COMUNI.aggiunto` | 21 | 24 | bottone largo nella scheda |
| h2 di quota | 5-19 | 20 | "Freni e sospensioni" è il più lungo |
| testo di quota | 59-177 | 180 | massimo due frasi (trend P3) |
| `PUNTI_TESTI.*.nome` | 5-13 | 13 | etichetta accanto al cerchio: "Olio e filtri" il più lungo |
| `PUNTI_TESTI.*.segnali[]` | 20-56 | 60 | due righe nella scheda da 400 px |
| `LAVORI_NOMI.*.nome` | 9-32 | 32 | bottoni del parcheggio a 375 vanno a capo: altezza minima 44 px, non fissa |
| `BARRA.riepilogoBreve` | 16-18 | 20 | barra mobile 56 px, a sinistra del bottone |
| `PONTE_LIBERO.mensola(...)` | 26-27 | 28 | a sinistra di x 244 sulla mensola: se non ci sta va su due righe |
| `PONTI_TESTI.*.targhetta` | 17-21 | 22 | seconda riga della targhetta (200 px a 1440); a 375 nelle colonne da 96 px si mostra solo `nome` ("Ponte 1"), la targhetta resta nel nome accessibile |
| `PONTE_LIBERO.stati.*` | 30-130 | 140 | sotto il planning, 3 righe a 375 |
| `META.title` | 56 | 60 | |
| `META.description` | 151 | 155 | |

---

## 7. Scelte e scostamenti decisi qui

- **Id dei punti**: uso quelli del tech-architect §6.4 (`ruota-anteriore`,
  `ruota-posteriore`), non `ruota-ant`/`ruota-post` dell'ux §5.0. Stesso punto,
  stesso nome ("Gomme", "Convergenza").
- **Sabato 8:00-12:00** (brand-strategist §9, il creative-director chiede al
  copywriter di confermare), non 8:00-12:30 del wireframe ux. `ORARI.sabato` lo
  dice al planning.
- **Blocco massimo 4 h 30** (`MINUTI_MAX_BLOCCO` 270, ux P10: è mezza
  giornata), non le 4 h proposte dal brand-strategist "da confermare con ux".
  Oltre: "Togli un lavoro" o "Lascia l'auto per la giornata".
- **Prezzi e portate**: quelli del brand-strategist (convergenza 55 €, deposito
  40 € a stagione, ponte 2 da 4000 kg), non i segnaposto dei wireframe ux
  (45 €, 50 €, 3500 kg).
- **Listino gomme a 3 righe** (195/65 R15, 205/55 R16, 225/45 R17), come nel CD
  e nel wireframe: la 185/65 R15 ha lo stesso prezzo della 195/65 e non aggiunge
  niente. La gomma nuova è una riga sola (`GOMME.gommeNuove`).
- **Targhette su due righe**: "Ponte 1" / "due colonne · 3500 kg". Il formato
  "Ponte 1 · due colonne · 3500 kg" del brand-strategist ha due punti mediani,
  e la regola del CD è al massimo uno per riga.
- **"Un altro lavoro"** al posto di "Prenota un altro lavoro" (ux F4): "Prenota"
  non compare mai come comando. **"Mandi, Erika."** come firma dopo l'invio:
  l'unico "Mandi" del sito.
- **Link di salto al planning = "Trova un buco"** (tech-architect, CD: una sola
  etichetta per l'intento), non "Vai al ponte libero" dell'ux.
- **"Ciceri Lab"** con lo spazio in title, description e piede ("Un concept di
  Ciceri Lab"), come chiedono `ruoli-agent.md` e il pilota dopo la SEO; i doc
  dell'ondata 1 scrivevano "CiceriLab".
- **Recapiti**: numero ed email solo in `RECAPITI_DATI`; in vista solo i link
  "Chiama", "Scrivi", "Apri in Maps", con `aria-label` che dice "(numero di
  esempio)". Nessuna P.IVA, nessuna ragione sociale. Indirizzo: Via Nuova di
  Corva 94, Pordenone (via vera, civico inventato).
- **Invernali**: "servono dal 15 novembre al 15 aprile, e si montano già da
  metà ottobre" è il calendario reale degli obblighi invernali in Italia (il
  brand-strategist diceva "da metà ottobre a metà aprile").
- **Foto e fermi immagine**: il poster a 0 cm, le foto del fallback e i fermi
  sono decorativi (`alt=""`, il canvas è `aria-hidden` e il DOM dice tutto).
  Le foto di Deposito e Officina hanno `alt` descrittivi scritti **senza aver
  visto le foto** (il photo-editor lavora in parallelo): descrivono il soggetto
  cercato, mai "la nostra officina".
- **Recensioni**: le tre del brand-strategist, con nome e paese, senza stelle
  (`OFFICINA.voci`). Il builder dell'officina decide se usarle; se sì, una riga
  ciascuna, in Red Hat Text.
- **`APERTURA.prezzoIngresso`**: riga facoltativa (trend P4). Non è un orario,
  non è una riga di numeri tra filetti: un prezzo e un tempo in una frase.

---

## Richieste ad altri agent

- **scaffold-engineer**:
  - `state/store.ts`: `selDurata` usi `durataMinuti(lavori, deposito.gia)` e
    `selPontiAdatti` usi `pontiAdatti(lavori)` di `content/lavori.ts` (**non**
    l'intersezione: gomme + freni darebbe vuoto); `selEtichettaLavoro` usi
    `etichettaLavoro` di `testi.ts`; `aggiungiLavoro` tolga l'altro del gruppo
    con `esclusoDa(id)` e restituisca l'id tolto, così chi aggiunge annuncia
    `ANNUNCI.sostituito`.
  - `LAVORI` ha due campi in più dei tre del tech-architect (`prezzoA`,
    `reparto`); `ORARI` ha tuple `readonly`: tipizzare i parametri come
    `readonly [number, number]`.
  - `core/links.ts`: prendere `TELEFONO_URL`, `EMAIL_URL`, `MAPS_URL` da
    `RECAPITI_DATI` (`telefonoHref`, `emailHref`, `mapsHref`) invece di
    riscriverli.
  - `Radice.tsx`: `document.title = META.title`; link di salto con `SALTI`;
    annuncio di plateau con `QUOTE[q].annuncio`.
  - Parametri URL: l'ux usa `?lavoro=gomme,pastiglie,dischi` e
    `?deposito=si`, il tech-architect `?lavori=<IdLavoro>`. Se si tengono gli
    alias dell'ux: `gomme` → `gomme-stagionali` (con `deposito=si` →
    `gomme-deposito`), `dischi` → `pastiglie-dischi`, gli altri uguali.
- **section-builder-ponte-libero**: `genera.ts` usi solo `OCCUPATI_PER_PONTE`
  per i blocchi occupati; `richiamo('sera' | 'domani')` come in §4; numero di
  deposito nuovo diverso da `D-214`.
- **section-builder-officina**: indice del piede con gli id del
  tech-architect (`#inizio`, `#gomme`, `#freni`, `#sottoscocca`, ...) già in
  `PIEDE.indice`; se lo scaffold usa gli id dell'ux (`#quota-0`...), me lo dite e
  cambio gli `href`.
- **photo-editor**: se le foto scelte non corrispondono a
  `DEPOSITO_TESTI.fotoAlt` o `OFFICINA.fotoAlt.*` (soggetto diverso, nessuna foto
  per "esterno"), scrivetemi cosa si vede davvero e riscrivo l'`alt`.
  (Fatto, vedi "Giro foto" in fondo.)
- **art-director**: la cifra delle quote ("20 cm") è in `*.cifra`; le
  targhette dei ponti sono su due righe (`nome` + `targhetta`).
- **seo-engineer (ondata 4)**: `META` e `VETRINA` sono pronti; JSON-LD come
  WebPage/CreativeWork di Ciceri Lab, mai LocalBusiness.

---

## Giro foto (dopo il photo-editor)

Le 6 foto vengono da Wikimedia Commons e Flickr, nessuna da Unsplash. Le tre
di Deposito e Officina le ho guardate con Read e ho riscritto gli `alt` su
quello che si vede: `DEPOSITO_TESTI.fotoAlt` (scaffali di ferro, gomme
invernali, muro di pietra), `OFFICINA.fotoAlt.ponte` (interno di un gommista,
auto sulle pedane col portellone aperto), `OFFICINA.fotoAlt.attrezzatura`
(colonna blu del ponte con quadro e centralina). `OFFICINA.fotoAlt.esterno`
resta ma non è usata (nessuna foto). `FALLBACK.descrizione` allineata ai
soggetti veri (le foto del fallback restano decorative).
Crediti nel piede: `PIEDE.foto(c)` → "AnnSophieQ, Flickr, CC BY-SA 2.0",
`PIEDE.fotoAria(c)`, nuova `PIEDE.licenzaAria(c)` per il link alla licenza,
nuova `PIEDE.fotoModificate` ("Foto ritagliate e ridimensionate."). Il
parametro è `CreditoFotoTesto` (autore, fonte, licenza): `CreditoFoto` di
`assets/foto/index.ts` ci entra così com'è. Nessuna chiave rinominata,
typecheck verde. Il builder del piede passa ogni voce di `CREDITI_FOTO`.
