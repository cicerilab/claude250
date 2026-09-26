# Copywriter · Concept 16 · EVIDENZIA, agenzia immobiliare (Pordenone)

Ondata 2. File miei (tech-architect §4), tutti in
`src/pages/concepts/evidenzia/content/`:

- `testi.ts`: ogni testo visibile, nome accessibile, voce aria-live, META, VETRINA;
- `annunci.ts`: i 22 annunci, gli 8 "Cerchiamo", tipi, durate delle visite;
- `zone.ts`: zone con coordinate verificate, agenzia e recapiti di esempio,
  scostamenti dei marcatori, limiti e zoom della mappa, calendario dell'agenzia;
- `listino.ts`: listino €/m², medie per il confronto in scheda, testi del box;
- questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `docs/matrice-concept-11-20.md` (riga 16),
`concepts/10-torchio/docs/integrazione-sito.md`, tutti i doc dell'ondata 0-1 di
EVIDENZIA (creative-director, brand-strategist, ux-architect, tech-architect,
trend-researcher), `concepts/10-torchio/docs/copywriter.md` e il suo
`testi.ts` (solo formato).

Controlli fatti sui quattro file: `tsc` 5.6.3 con `strict`,
`noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`,
`noImplicitReturns`: verde. Nessun trattino lungo o medio, nessun punto
esclamativo nei testi (l'unico `!` è `COMUNI.segnoErrore`, chiesto dall'ux
6.11), nessuna emoji, nessun "01 ·", nessuna parola della lista "da evitare"
del brand-strategist, nessuna sigla da annuncio vecchio. Apostrofo tipografico
`’` in tutti i testi visibili. Unico puntino di sospensione: "Mando il giro…",
lo stato di invio scritto così da creative-director e ux. Nessun accesso a
browser o data corrente a livello di modulo: `testi.ts` riceve le date già
calcolate.

---

## 1. Come si usa

```ts
import TESTI, { voceAggiunto, voceTolto, prezzoAnnuncio, euro, mq, euroMq, orario, sabatoLungo } from '../../content/testi';
import { ANNUNCI, CERCHIAMO, MAX_GIRO, DURATA_VISITA, DA_CUI_PARTIRE, ORDINE_RUBRICHE, annuncioDa, idDaRif } from '../../content/annunci';
import { ZONE, AGENZIA, SCOSTAMENTI, LIMITI_MAPPA, ZOOM_MAPPA, CALENDARIO } from '../../content/zone';
import { LISTINO_APPARTAMENTI, LISTINO_BOX, confrontoZona } from '../../content/listino';
```

- I componenti non scrivono testo. Se manca una stringa si chiede, non si
  inventa nel componente.
- Tutto è `as const` (o `satisfies`): un refuso nel nome di una chiave non
  compila. `type Testi = typeof TESTI`.
- Le frasi con valori variabili sono **funzioni pure** con parametri
  tipizzati. Non calcolano orari, ordine del giro o sabati: ricevono i valori
  già calcolati (`sections/Giro/calcolo.ts`, `core/sabato.ts`).
- **Date**: `core/sabato.ts` calcola il giorno in `Europe/Rome` e passa a
  `testi.ts` un `Giorno` `{ giorno, mese (1-12), anno }`. Da lì:
  `sabatoLungo` → "sabato 3 ottobre 2026" (testata, piede),
  `sabatoBreve` → "sabato 3 ottobre" (frasi), `sabatoTitolo` → "Sabato 3
  ottobre" (titolo colonna), `sabatoCorto` → "sabato 3 ott." (radio a 375).
  Nel prerender: `DATA_PRERENDER.testo` ("sabato") più uno spazio riservato
  largo quanto `DATA_PRERENDER.riservaLarghezza` (ux 6.14).
- **Numeri**: `euro(168000)` → "€ 168.000"; `prezzoAnnuncio(a)` → "€ 168.000"
  o "€ 690 al mese"; `speseAffitto(a)` → "più 60 € di spese" (solo affitti);
  `mq(1100)` → "1.100 m²"; `euroMq(2050)` → "2.050 €/m²",
  `euroMq(8.6, true)` → "8,60 €/m² al mese"; `orario('09:30')` o
  `orario(570)` → "9:30". Scritti a mano: `Intl` it-IT non mette il punto a
  4 cifre.
- **Conteggi in parole**: `caseN(2)` → "due case", `suQuattro(2)` → "Due case
  su quattro.", `elenco([...])` → "Torre, Centro e Porcia".

---

## 2. Mappa delle esportazioni di `testi.ts`

| Esportazione | Sezione / uso | Chiavi principali |
|---|---|---|
| `META` | `<title>`, description, OG | `title` (56), `description` (153), `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA` | voce `CONCEPTS` in `site.ts` del sito (proposta) | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri[]` |
| `COMUNI` | ovunque | `marchio`, `cosaE`, `tornaLab`, `nuovaScheda`, `segnoErrore`, `inventata` |
| `SALTI` | link di salto | `annunci`, `giro` |
| `RUBRICHE` | barre, sommario, striscia | per rubrica: `nome` (barra, h2), `breve` (sommario, striscia), `ancora` (id) |
| `TESTATA` | h1 e testata | `titolo`, `riga`, `sommarioAria`, `sommarioTitolo`, `correnteSr`, `orecchia.{titolo, testo}`, `dataAria(d)` |
| `RIQUADRO` | riquadro di testa (hero) | `parolaTratto`, `restoPrimaRiga`, `secondaRiga`, `titolo`, `testo`, `comeFunziona.{titolo, foglio, colonna, colonnaCorta}` |
| `ANNUNCIO` | componente annuncio | `evidenzia`, `evidenziaAria(a)`, `rif(a)`, `rifNelGiro(a)`, `nelGiro`, `apreScheda`, `retinoAlt(a)`, `scarico`, `scaricoLink` |
| `BARRA` | molo desktop e barra mobile | `aria`, `titolo`, `vuoto`, `pieno`, `mandato(d)`, `cambiato`, `prepara`, `gruppoAria(n)`, `postoAria(i, a)`, `postoLibero`, `zone(ids)` |
| `VISTA` | Leggi / Pagina intera, foglio | `gruppoAria`, `leggi`, `intera`, `spostarsi`, `foglioAria` |
| `HAI_SEGNATO` | riepilogo in fondo alla colonna | `titolo`, `vuoto`, `tornaAnnunci`, `vaiAria(a)` |
| `SCHEDA` | scheda della casa | `rimetti`, `rif(a)`, `foto.{regioneAria(n), precedente, successiva, contatore(i, n), altRiserva(a, i)}`, `senzaFoto`, `confronto(a)`, `blocchi.{casa, costi, fuori}`, `descrizioneTitolo`, `zonaTitolo(a)`, `planimetria`, `toggle`, `statoNelGiro`, `statoFuori`, `dialogoDescrizione` |
| `GIRO` | pannello e colonna del giro | vedi §4 |
| `MAPPA` | mappa Leaflet | `titoloSr`, `caricamento`, `errore`, `apriOsm`, `osmUrl(lat, lng, zoom)`, `avvicina`, `allontana`, `attribuzione`, `attribuzioneUrl`, `siglaAgenzia`, `marcatoreAria(i, zona, arrivo)`, `agenziaAria(partenza)`, `zonaEtichetta(zona)` |
| `ICS` | file `.ics` | `nomeFile`, `nomeCalendario`, `titolo(a)`, `luogo(zona)`, `descrizione(a)`, `titoloPartenza`, `luogoPartenza` |
| `voceAggiunto`, `voceTolto`, `LIVE` | regione aria-live unica | vedi §5 |
| `VENDI` | box *Vendi casa?* | `titolo`, `promessa`, `cosaServeTitolo`, `cosaServe[]`, `seManca`, `comeTitolo`, `come[]`, `provvigioneTitolo`, `provvigione`, `affitti`, `chiama`, `chiamaAria`, `passa`, `passaAria` |
| `AGENZIA_BOX` | box *L'agenzia* | `titolo`, `storia`, `persone[]`, `abilitati`, `dove`, `indirizzo`, `citta`, `parcheggio`, `maps`, `mapsAria`, `mapsHref`, `orariTitolo`, `orari[]`, `sabato`, `settimana`, `zona`, `chiama*`, `scrivi*` |
| `HANNO_COMPRATO` | box delle citazioni | `titolo`, `citazioni[].{testo, chi}` (virgolette « » già nel testo) |
| `PIEDE` | piede del foglio | `pagina`, `testata`, `data(d)`, `fotoTitolo`, `credito(autore)`, `creditoAria(autore)`, `mappaCredito`, `inventata`, `conceptDi`, `conceptDiHref` |
| `LISTINO_BOX` (in `listino.ts`) | box *Quanto costa al metro quadro* | `titolo`, `intestazioneZona`, `intestazionePrezzo`, `didascaliaTabella`, `spiegazione`, `nuovoEVecchio`, `dichiarazione` |
| `TESTI` | tutto in un oggetto (default export) | |

**Recapiti**: nessun numero né email in vista. `AGENZIA.telefonoHref`
(`tel:+390434000000`), `AGENZIA.emailHref`, `AGENZIA.mapsUrl` sono in
`zone.ts`; i box li espongono come `chiamaHref`, `scriviHref`, `mapsHref`
dietro le parole "Chiama", "Scrivi", "Apri in Maps".

---

## 3. I dati degli annunci (`annunci.ts`)

Il contratto del tech-architect (§6.4) è rispettato nei nomi e **ampliato**
dove i doc dell'ondata 1 chiedevano di più. Differenze da conoscere:

| Campo | Rispetto al tech-architect | Perché |
|---|---|---|
| `tipologia` | aggiunto `'terreno'` | l'ux (5.6) dà 15 minuti a terreni e box. Durate in `DURATA_VISITA` (20 appartamento e monolocale, 30 casa e rustico, 15 terreno e box) |
| `mercato` | nuovo | con quale media si confronta il prezzo (`listino.ts`); `null` per il box |
| `casa`, `costi`, `fuori` | `readonly Voce[]` con `{ t, v }`, non `string[]` | l'ux (6.6) vuole tre `<dl>` con termine e valore |
| `testo` / `testoCorto` | `testoCorto` nuovo | l'ux (5.0) chiede per ogni P e F una descrizione di 3 righe e una di 2 per pareggiare le colonne |
| `dati`, `energia` | nuovi | consistenza in riga e classe energetica, nell'ordine fisso del brand-strategist 5.3 |
| `speseMese`, `classe` | nuovi | spese per gli affitti sul foglio, classe per eventuali usi |
| `perchePrezzo` | nuovo | il brand-strategist 5.6 vuole spiegato perché il prezzo al m² sta sopra o sotto la zona |
| `novita` | come previsto | frase in grassetto all'inizio del testo, mai etichetta sulla foto |
| `titoloScheda` | significato fissato | è la **riga sotto** il titolo della scheda; il titolo (h2) della scheda è l'`attacco` |

Annuncio sul foglio, in ordine: `attacco` (h3 e bottone), `novita` in
grassetto, `testo` o `testoCorto`, `dati` + `energia`, `prezzoAnnuncio(a)` (e
per gli affitti `speseAffitto(a)`), `ANNUNCIO.rif(a)` + bottone Evidenzia.

Scheda: `attacco` (h2), `titoloScheda`, prezzo, `SCHEDA.confronto(a)` e sotto
`perchePrezzo`, toggle, tre blocchi `casa` / `costi` / `fuori`, `descrizione`
(h3 `SCHEDA.descrizioneTitolo`), `vicino` (h3 `SCHEDA.zonaTitolo(a)`),
`SCHEDA.planimetria` (non per terreno e box: lì non c'è planimetria di una
casa; il builder la mostri solo se `tipologia` non è `'terreno'` né `'box'`).

**Casting**: i 22 Rif. del brand-strategist 7.4, stessi formati e zone
dell'ux 5.1, prezzi dentro le forchette. Tutti hanno classe energetica o "APE
non richiesto" (terreno 143, box 250). Ogni scheda ha un difetto detto o un
limite scritto (serramenti, piano senza ascensore, spese alte, camera piccola,
cortile in comune...).

**Stato vuoto del giro**: `DA_CUI_PARTIRE = ['rif-214', 'rif-231']`.

**Parametri URL**: `idDaRif('214')` e `idDaRif('rif-214')` danno entrambi
`'rif-214'`: vale per `?segna=214,229` (formato dell'ux) e per
`?segna=rif-214` (formato del tech-architect), e per `#scheda-214`.

**Cerchiamo**: 8 (`CERCHIAMO`), due per rubrica. Quello con `principale:
true` chiude la rubrica anche nella colonna mobile (ux 5.4 punto 7); gli
altri solo sul foglio. Composizione: `attacco` in Franklin 700, poi `testo`
di seguito nella stessa frase ("Cerchiamo per una coppia un bilocale in
Centro..."). Lunghezze tra 84 e 125 caratteri: da 3 a 4 righe a 268 px.

---

## 4. Il giro del sabato: stato per stato

Stati dell'ux-architect 5.7. Dove c'è `d` è un `Giorno`.

**A. Sul foglio**

| Stato | Testo |
|---|---|
| Giro vuoto | `BARRA.vuoto` |
| Aggiunto / tolto | live `voceAggiunto(a, n)` / `voceTolto(a, n)`; riga Rif. diventa `ANNUNCIO.rifNelGiro(a)` |
| Pieno | `BARRA.pieno` al posto di `BARRA.titolo` |
| Quinto (scarico) | sotto l'attacco `ANNUNCIO.scarico` + link `ANNUNCIO.scaricoLink`; live `LIVE.scarico` |
| Giro mandato | `BARRA.mandato(d)` |
| Cambiato dopo l'invio | `BARRA.titolo` + `BARRA.cambiato` |
| Da URL | live `LIVE.daUrl(n)` |
| Vista | live `LIVE.vistaIntera` / `LIVE.vistaLeggi` |

**B. Nel pannello**

| Stato | Testo |
|---|---|
| Titolo del dialogo | visibile `GIRO.titolo`, nome `GIRO.titoloAria(d)`; chiudi `GIRO.chiudi` |
| Scelte | `GIRO.sabato.{legenda, opzione(d), opzioneCorta(d)}`, `GIRO.partenza.{legenda, opzione(hhmm), opzioneAria}`, `GIRO.daDove.{legenda, agenzia, primaCasa}` |
| Colonna | titolo `GIRO.data(d)`; partenza `GIRO.tappaAgenzia`; lista `GIRO.elencoAria`; per tappa `GIRO.arrivo(t)`, `GIRO.tappaAria(i, a, t)`, `GIRO.tragitto(min, da)` o `GIRO.tragittoPrima`, `GIRO.visita(min)` facoltativo; bottoni `prima`/`dopo`/`togli` con `primaAria(a)`/`dopoAria(a)`/`togliAria(a)`; `GIRO.onesta`; `GIRO.fine(t)`; riga facoltativa `GIRO.accompagna` |
| Apertura mappa | `MAPPA.caricamento` |
| Vuoto | `GIRO.vuoto.testo`, sopra i due annunci `GIRO.vuoto.daCuiPartire` |
| Una casa | `GIRO.unaCasa` |
| Riordino | live `LIVE.riordino(a, i, t)`; link `GIRO.rimettiOrdine`, poi live `LIVE.ordineBreve` |
| Sforamento 12:30 | `GIRO.sforamentoSr` (solo lettore) + `COMUNI.segnoErrore` + `GIRO.sforamento(fine, partenzaPiuPresto)`; `partenzaPiuPresto` è `'09:00'` se si parte più tardi, `null` se si parte già alle 9 |
| Cambio di scelta | live `LIVE.nuovaFine(t)` |
| Sabato troppo vicino / chiuso / passato | `GIRO.sabato.tardi(d)`, `GIRO.sabato.chiuso(d)`, `GIRO.sabato.passato(d)` |
| Casa sparita | `GIRO.caseSparite(n)` (con n = 1 è uguale a `GIRO.casaSparita`) |
| Mappa lenta / Leaflet non caricato | `MAPPA.errore` + link `MAPPA.apriOsm` a `MAPPA.osmUrl(...)` con `ZONE[z].zoomOsm`; live `LIVE.mappaErrore` |
| Modulo | `GIRO.chiSei.{legenda, nome, telefono, telefonoAiuto, email, nota, notaAiuto, contatore(restano), maxNota}` |
| Campi non validi | `GIRO.chiSei.errori.{nomeVuoto, telefonoVuoto, telefonoNonValido, emailNonValida, notaLunga}`; con 2 o più errori `riepilogo(nomi)` con `nomiCampi` |
| Sopra il bottone | `GIRO.promessa`; bottone `GIRO.manda` |
| Invio in corso | bottone `GIRO.mando`; live `LIVE.invioInCorso` |
| Successo | `GIRO.successo.frase`; modulo chiuso `GIRO.successo.aNome(nome, ultime2)` + `GIRO.successo.cambia` (`cambiaAria`); link `GIRO.calendario.link` (`aria(n)`), dopo il clic `GIRO.calendario.scaricato(n)`; live `LIVE.successo` |
| Mandato, riaperto | `GIRO.successo.riaperto(d)` |
| Cambiato dopo l'invio | `GIRO.cambiatoDopo` |
| Invio fallito | `GIRO.fallito.prima` + link `GIRO.fallito.link` (`href`, `linkAria`) + `GIRO.fallito.dopo`; live `LIVE.fallito` |

**Chi richiama**: **Sara** (brand-strategist 1.5; "Chiara" del
creative-director sostituita, già usata in 15 NOVANTA). La promessa è sempre
la stessa frase: "Sara ti richiama entro venerdì alle 18".

**Mappa e `.ics`**: `MAPPA.marcatoreAria(i, zona, t)` → "Tappa 2, Cordenons,
arrivo alle 9:45"; `MAPPA.agenziaAria(t)`; sigla `MAPPA.siglaAgenzia`;
evento `ICS.titolo(a)` → "Visita: Torre, trilocale con garage (Rif. 214)",
`ICS.luogo(zona)` → "Torre, Pordenone" o "Porcia (PN)", `ICS.descrizione(a)`.

---

## 5. Voci aria-live

Tutte `polite`, nella regione unica fuori dal foglio; si sostituiscono.

| Voce | Quando |
|---|---|
| `voceAggiunto(a, n)` | "Aggiunto al giro: Torre, trilocale con garage. Due case su quattro." |
| `voceTolto(a, n)` | "Tolto dal giro: ... Una casa su quattro." / "... Il giro è vuoto." |
| `LIVE.scarico` | quinto annuncio |
| `LIVE.daUrl(n)` | `?segna=` senza giro salvato |
| `LIVE.vistaIntera`, `LIVE.vistaLeggi` | cambio di vista (anche quando il fuoco riporta a Leggi) |
| `LIVE.riordino(a, i, t)`, `LIVE.ordineBreve`, `LIVE.nuovaFine(t)` | pannello del giro |
| `LIVE.mappaErrore`, `LIVE.invioInCorso`, `LIVE.successo`, `LIVE.fallito` | pannello del giro |

`voceAggiunto` e `voceTolto` sono le funzioni che il tech-architect (§6.1)
chiama da `store.ts` (`annuncia()`).

---

## 6. Lunghezze

Misure dai wireframe dell'ux: colonna 268 px, Newsreader 15 px circa 38
caratteri per riga; Franklin 800 dell'attacco circa 38 caratteri in 268 px.

| Testo | Adesso | Massimo | Perché |
|---|---|---|---|
| `attacco` (P, F, T) | 26-37 | 38 | una riga a 268 px (T su due righe, corpo più grande) |
| `attacco` di 240 (R) | 39 | 44 | il riquadro è largo 2 colonne |
| `testoCorto` | 49-75 | 76 | 2 righe |
| `testo` P e F | 86-115 | 115 | 3 righe |
| `testo` T e R | 165-195 | 230 | 4-6 righe (T) o 4-5 su due colonne interne (R) |
| `dati` + `energia` | 53-110 | 115 | 2-3 righe |
| `descrizione` (scheda) | 41-75 parole | 90 parole | brand-strategist 5.6 |
| `RIQUADRO.testo` | 18 parole | 20 parole | creative-director 4.2 |
| `RIQUADRO.titolo` | 67 | 2 righe a 556 px | messaggio chiave, non si accorcia mai |
| `RIQUADRO.comeFunziona.colonna` | 111 | 120 | se non sta nella prima schermata a 375, usare `colonnaCorta` (91) |
| `BARRA.prepara` | 15 | 16 | bottone da 150 px a 375 |
| `META.title` | 56 | 60 | risultati di ricerca |
| `META.description` | 153 | 155 | risultati di ricerca |

Chi cambia un testo resta sotto questi limiti o avvisa art-director e builder.

---

## 7. Scelte di scrittura da conoscere

- **Bottone Evidenzia**: testo visibile **sempre "Evidenzia"**, nome
  accessibile costante `ANNUNCIO.evidenziaAria(a)` ("Evidenzia per il giro,
  Rif. 214") con `aria-pressed`. Lo stato "nel giro" lo dice anche la riga del
  riferimento, che diventa `ANNUNCIO.rifNelGiro(a)` ("Rif. 214, nel giro"),
  più il bottone pieno nero dell'art-director. Motivo: cambiare l'etichetta di
  un bottone con `aria-pressed` confonde i lettori di schermo (lo stato
  verrebbe detto due volte, "Nel giro, premuto"), e un'etichetta visibile
  "Nel giro" non contenuta nel nome accessibile romperebbe WCAG 2.5.3. Così
  resta il segnale non cromatico chiesto dal trend-researcher (R1). Stesso
  schema per il toggle della scheda: `SCHEDA.toggle` costante più la riga
  `SCHEDA.statoNelGiro` / `statoFuori`. `ANNUNCIO.nelGiro` resta disponibile
  se l'ux preferisce comunque cambiare etichetta.
- **Confronto €/m²**: "2.050 €/m²: in zona Torre la media degli appartamenti
  usati è 1.620 €/m²." Quartieri con "in zona", comuni con "a" ("a Porcia la
  media delle case usate..."). Affitti in euro al m² al mese con i decimali.
  Sotto, `perchePrezzo` spiega la differenza in una frase.
- **Come funziona**: nessuna delle parole vietate "trascina" / "scorri"; si
  dice "passa l'evidenziatore", "passa il dito". `VISTA.spostarsi` spiega lo
  spostamento del foglio senza quelle parole: va come descrizione accessibile
  del foglio e, se l'interaction-designer lo vuole visibile, accanto a Leggi /
  Pagina intera (trend R2).
- **Le persone**: Marta, Denis, Sara solo per nome, solo nel box *L'agenzia*,
  nella promessa del giro e in `GIRO.accompagna`. Clienti: Elisa e Matteo
  (Rorai Grande), Loris e Graziella (Cordenons).
- **Friulano**: solo "fogolâr", nelle case che ne hanno uno (152, 177).
- **Piede**: `COMUNI.inventata` dichiara inventati annunci, prezzi, persone e
  recapiti, quindi anche le citazioni. Firma "Un concept di Ciceri Lab" (con
  lo spazio, come META e il pilota).

---

## 8. Coordinate (verificate una volta)

26/09/2026, ricerca Nominatim di openstreetmap.org fatta a mano con curl
(un pugno di richieste, con pausa di 1 s): nessuna chiamata in pagina.

| Zona | Punto OSM usato | lat, lng |
|---|---|---|
| Centro | corso Vittorio Emanuele II | 45,9563 12,6597 |
| Borgomeduna | suburb "Borgo Meduna" | 45,9509 12,6766 |
| Torre | suburb "Torre" | 45,9688 12,6792 |
| Rorai Grande | suburb "Rorai Grande" | 45,9659 12,6368 |
| Villanova | quarter "Villanova" | 45,9427 12,6691 |
| San Gregorio | quarter "San Gregorio" | 45,9487 12,6587 |
| Cordenons | comune | 45,9882 12,7068 |
| Porcia | comune | 45,9595 12,6134 |
| Roveredo in Piano | comune | 46,0111 12,6203 |
| Fiume Veneto | centro abitato | 45,9280 12,7322 |
| Agenzia | via Giuseppe Mazzini (civico 24 di fantasia) | 45,9578 12,6570 |

Rispetto ai "riferimenti da verificare" del creative-director: Borgomeduna,
Cordenons e Porcia corretti di poche centinaia di metri; Torre e Rorai
confermati entro 300 m. Piazza XX Settembre non risulta su OSM a Pordenone con
quel nome: negli annunci si cita solo piazza Cavour (verificata, 45,9586
12,6585). Scostamenti dei marcatori (`SCOSTAMENTI`) tutti entro circa 230 m.
`LIMITI_MAPPA`: da 45,905 12,585 a 46,030 12,765.

---

## 9. Per il photo-editor: foto attese e testi alternativi

Il campo `alt` di `assets/foto/index.ts` è del photo-editor, che vede le foto.
Regole mie da seguire perché tutti i testi suonino uguali:
- descrivi cosa si vede, in italiano pieno, senza aggettivi di vendita:
  "Cucina con finestra sul cortile", "Soggiorno con il fogolâr",
  "Portico in sasso visto dal prato", "Facciata della palazzina con i balconi";
- niente "foto di", niente "immagine di", niente nomi di zone che la foto non
  mostra, niente punto finale;
- massimo circa 60 caratteri.

Quello che gli annunci dicono (le foto non devono contraddirlo): 214
palazzina di tre piani con balconi, cucina abitabile; 231 casa del centro
storico, pavimenti in rovere; 226 palazzina nuova, soggiorno con cucina; 240
terrazzo con tenda da sole; 152 villetta anni Ottanta, fogolâr, giardino con
alberi da frutto; 237 schiera recente, taverna; 209 villetta nuova con
tettoia, niente garage chiuso; 171 bifamiliare con portico; 118 rustico in
sasso e mattoni con portico e fienile; 229 trilocale con cucina del 2020 e
balcone. Se una serie non combacia, si cambia la foto o si toglie
(creative-director 4.6, piano B), non il testo: chiedimelo e adatto
l'annuncio.

---

## Richieste ad altri agent

- **scaffold-engineer**: `core/links.ts` legga `TELEFONO_URL` ed `EMAIL_URL`
  da `AGENZIA.telefonoHref` / `AGENZIA.emailHref` (`content/zone.ts`), così i
  recapiti stanno in un posto solo. `core/sabato.ts` usi `CALENDARIO`
  (fuso, scadenza venerdì 12:00, sabati chiusi, chiusura 12:30) e passi a
  `testi.ts` oggetti `Giorno` con mese 1-12. `state/store.ts` chiami
  `voceAggiunto` / `voceTolto` per `annuncia()`. Per `?segna=` usare
  `idDaRif` (accetta "214" e "rif-214"). Lo scaffold importi i tipi
  `Annuncio`, `IdAnnuncio`, `Rubrica`, `Formato`, `Tipologia` da
  `content/annunci.ts` invece di ridefinirli.
- **scaffold / tech-architect**: la chiave di `localStorage` è scritta
  `evd-giro` dall'ux e `evidenzia:giro` dal tech-architect: sceglierne una.
  Non è mia, la segnalo.
- **section-builder-scheda**: `casa`, `costi`, `fuori` sono `{ t, v }` per i
  `<dl>` (§3); `SCHEDA.planimetria` solo per case e appartamenti; confronto e
  `perchePrezzo` uno sotto l'altro.
- **section-builder-giro**: `DURATA_VISITA` in `annunci.ts`; tipologia
  `'terreno'` in più; `GIRO.sforamento` vuole la partenza più presto o `null`.
- **section-builder-mappa**: attribuzione, link e testi in `MAPPA`; limiti e
  zoom in `zone.ts` (`LIMITI_MAPPA`, `ZOOM_MAPPA`), coordinate in `ZONE`,
  `AGENZIA`, `SCOSTAMENTI`.
- **interaction-designer / section-builder-annunci**: proposta del bottone
  Evidenzia a etichetta costante con la riga `rifNelGiro` (§7). Se si tiene
  l'etichetta che cambia dell'ux, usare `ANNUNCIO.nelGiro` e togliere
  `aria-pressed`.
- **photo-editor**: regole degli `alt` e soggetti attesi in §9.
- **seo-engineer** (ondata 4): `META` e `VETRINA` sono pronti; nel JSON-LD
  usare `META.description`.
