# Copywriter · Concept 15 · NOVANTA, fisioterapia e osteopatia (Pordenone)

Ondata 2. File miei, in `src/pages/concepts/novanta/content/`:
`testi.ts`, `listino.ts`, `orari.ts`, `studio.ts`, più questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, riga 15 di `docs/matrice-concept-11-20.md`, tutti i
doc dell'ondata 1 in `concepts/15-novanta/docs/` (creative-director,
brand-strategist, ux-architect, tech-architect, trend-researcher), e per il
formato `concepts/10-torchio/docs/copywriter.md` e il suo `content/testi.ts`.

Controlli fatti sui quattro file: `tsc --strict --noImplicitReturns
--noUnusedLocals --noUncheckedIndexedAccess --exactOptionalPropertyTypes`
verde. Nessun trattino lungo o medio, nessun punto esclamativo; puntini solo in
"Fissiamo..." (eccezione del creative-director); nessuna parola della lista "da
evitare" del brand-strategist; nessun "01 ·"; mai due "·" nella stessa riga
(anche le funzioni ne inseriscono al massimo uno). Numero ed email di esempio
esistono solo come `href`: a vista ci sono "Chiama" e "Scrivi".

---

## 1. Come si usa

```ts
import TESTI, { PRENOTA, NOMI_ANGOLI, quandoBreve, type Quando } from '../../content/testi';
import { LISTINO, euro, prezzoVoce, rigaListinoSr } from '../../content/listino';
import { APERTURA, OCCUPATE, FINESTRA_CONTROLLO, RIGHE_ORARI } from '../../content/orari';
import { RECAPITI, ACCESSO } from '../../content/studio';
```

- Ogni stringa visibile, ogni `aria-label` / `aria-valuetext`, ogni `alt`,
  ogni annuncio `aria-live` è in `testi.ts`. I componenti non scrivono testo;
  se manca qualcosa si chiede, non si inventa.
- Tutto è `as const` (con `satisfies` dove serve un controllo di forma).
- Le frasi con valori (date, ore, gradi, nomi) sono **funzioni** tipizzate:
  ricevono dati già calcolati (da `calendario.ts`, dal rotore), non calcolano.
- Il tipo `Quando` (`giorno` 0 = lunedì … 6 = domenica, `data`, `mese`
  0-11, `ora` `'HH:MM'`) è il formato con cui `sections/Prenota/calendario.ts`
  passa un momento a tutte le funzioni di data.
- `GradiAngolo` in `testi.ts` è strutturalmente identico ad `Angolo` di
  `dial/geometria.ts`: si passano l'uno per l'altro senza conversioni.

---

## 2. Mappa delle esportazioni

### `testi.ts`

| Esportazione | Uso | Chiavi principali |
|---|---|---|
| `META` | `<title>`, description, Open Graph | `title` (58 car., "Concept di Ciceri Lab"), `description` (159 car., inizia con "Concept di Ciceri Lab"), `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA` | proposta per `site.ts` del sito vero | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri[]` |
| `COMUNI` | ovunque | `marchio`, `marchioSotto`, `h1Sr`, `gradi(n)` → "90°", `gradiParlati(n)` → "90 gradi", `conceptDi`, `finzione`, `nuovaScheda`, `continuaSotto`, `obbligatorio`, `facoltativo` |
| `CONTATTI` | link di contatto | `chiama.{testo, aria, href}`, `scrivi.{…}`, `maps.{testo, aria, query}`, `nota` |
| `SALTI` | link di salto | `contenuto`, `prenotazione` |
| `TESTATA` | header | `chiama`, `chiamaAria`, `vistaElenco` / `vistaElencoBreve` / `vistaElencoAria`, `vistaQuadrante` / `…Breve` / `…Aria` |
| `NOMI_ANGOLI` | quadrante, passi, annunci | per angolo: `parola` (sul quadrante), `annuncio`, `frammento` |
| `QUADRANTE` | braccio e `nav` | `navAria`, `sliderAria`, `valoreSr(gradi, vicino)`, `passoPrecedente/Successivo` ("‹ 30°" "30° ›"), `passo…Aria(verso)`, `passoFermoInizio/Fine`, `fasciaPrecedente/Successivo(verso)` (fascia mobile a 90°), `finestrella(gradi)` |
| `ZERO` | 0° | `titolo`, `frase`, `nota`, `orario`, `prenota`, `oChiama`, `oChiamaAria` |
| `PRIMO_INCONTRO` | 30° | `titolo`, `momenti[]` (`parola` + `resto`), `durata`, `portare`, `chi`, `misura.{articolazione, oggi, obiettivo, didascalia}`, `nota` |
| `TRATTAMENTI` | 60° | `titolo`, `intro`, `voci[]` (`id`, `nome`, `frase`, `durata`, `durataSr`), `quante`, `noMacchine`, `rimando.{prima, link, aria}` |
| `PRENOTA` | 90°, tutti gli stati | vedi §4 |
| `OSTEOPATIA` | 120° | `titolo`, `cosa`, `quandoSiTitolo`, `quandoSi`, `quandoNoTitolo`, `quandoNo`, `medico`, `chi`, `durata` |
| `ESERCIZI` | 150° | `titolo`, `intro`, `voci[]` (`id`, `nome`, `articolazione`, `obiettivo` numero per il mini arco, `obiettivoVista`, `come`, `quanto`, `obiettivoSr`), `avvertenza`, `nota` |
| `PREZZI_DOVE` | 180° | `titolo`, `prezziTitolo`, `prezziNota`, `listinoAria`, `pagamento`, `cicli`, `detrazione`, `assicurazioni`, `disdetta`, `accessoDiretto`, `doveTitolo`, `indirizzo.{riga1, riga2}`, `accesso`, `parcheggio`, `orariTitolo`, `orariAria`, `chiama`, `scrivi`, `maps`, `recapitiNota`, `conceptDi`, `finzione` |
| `ANGOLI_TESTI` | `Angolo` / `h2` | per angolo: `parola`, `annuncio`, `frammento`, `titolo` |
| `ELENCO` | vista elenco | `automatico.{finestraBassa, testoGrande, nonSiPuo}`, `piede.{aria, dove, chiama, maps, conceptDi, finzione}` |
| `ALT_FOTO` | `alt` delle tre foto vere (Wikimedia Commons, guardate) | `studio`, `attrezzi`, `ingresso` (è l'angolo d'attesa) |
| `CREDITI_FOTO` | attribuzione CC BY 4.0 obbligatoria, anche in `PREZZI_DOVE.creditiFoto` e `ELENCO.piede.creditiFoto` | `riga`, `prima`, `autore`, `fonte`, `licenza`, `licenzaAria`, `licenzaHref`, `modifiche`, `fontiTitolo`, `fonti.{studio, attrezzi, ingresso}`, `fontiAria.*`, `nota` |
| `ANNUNCI` | `aria-live` | vedi §5 |
| aiuti di data | ovunque | `GIORNI.{lungo, breve}`, `MESI`, `oraVista`, `oraFrase`, `oraSr`, `giornoBreve`, `giornoLungo`, `quandoBreve`, `quandoFrase`, `quandoSr` |
| `TESTI` | tutto in un oggetto (default export) | |

### `listino.ts`

`euro(n)` ("65 €", "1.200 €"), `PREZZI` (numeri), `LISTINO` (tre gruppi:
Fisioterapia, Osteopatia, In più; ogni voce `id`, `nome`, `dettaglio`,
`durata`, `durataSr`, `prezzo`, `notaPrezzo`), `prezzoVoce(voce)`,
`rigaListinoSr(voce)`, tipi `IdVoce`, `VoceListino`.

### `orari.ts`

`GiornoSettimana`, `Ora`, `PASSO_MINUTI` (30), `DURATA` (60 / 45),
`FINESTRA_CONTROLLO` (7-10), `ANTICIPO_MINIMO_ORE` (2), `APERTURA` (per
giorno: `aperto`, `primoInizio`, `ultimoInizio`), `OCCUPATE.{interna,
esterna}` (per giorno, ore piene), `RIGHE_ORARI`, `RIGA_ORARI_OSTEOPATIA`,
`RIGA_ORARI_SEGRETERIA`, `ORARI_IN_BREVE`.

### `studio.ts`

`RECAPITI` (`via`, `cap`, `citta`, `provincia`, `indirizzoRiga`,
`indirizzoBreve`, `telefonoNumero` e `email` **solo come dato**,
`telefonoHref` `tel:+390434000000`, `emailHref`, `mapsQuery`), `ACCESSO`
(`piano`, `ingresso`, `parcheggio`, `autobus`), `PERSONE` (Giulia, Davide,
Chiara, Paola: solo nome, ruolo, cosa fanno).

---

## 3. Scelte di testo per angolo

| Angolo | `h2` (≤ 6 parole) | Perché |
|---|---|---|
| 0° da zero | Misuriamo il movimento, lavoriamo per riprenderlo. | È il messaggio chiave del brand, detto una volta sola. Due righe a 375 px (23 + 26 caratteri). La frase sotto (18 parole) dice chi siamo e per chi. |
| 30° primo incontro | La prima visita, un'ora. | Durata subito, poi i quattro momenti. |
| 60° trattamenti | Con le mani e con l'esercizio. | Posizione contro i centri "a macchine". |
| 90° prenota | Prenota la prima visita. | Dice cosa si prenota; l'istruzione sotto spiega il ciclo. |
| 120° osteopatia | Osteopatia, detta semplice. | Promette solo una spiegazione. |
| 150° esercizi | Tre cose da fare a casa. | Autonomia, niente promesse. |
| 180° prezzi e dove | Quanto costa, e dove siamo. | Le due domande di chi arriva con Fine. |

**L'esempio 70° → 90° è il ginocchio dopo una protesi** (brand-strategist
5.2): a 30° il mini arco è etichettato "ginocchio dopo una protesi", "oggi
70°", "obiettivo 90°", e la `figcaption` dice che 90 è "un traguardo comune
delle prime settimane, non il punto d'arrivo per tutti". Lo stesso 90 torna a
150° come obiettivo del "Tallone che scivola" (ginocchio, dopo una protesi) e
a 60° nella frase "Dopo una protesi di ginocchio di solito servono 2 sedute a
settimana per 6-8 settimane". Non si scrive mai che 90 sia la guarigione né
che 180 sia il massimo.

**Linguaggio sanitario** (brand regola 3): verbi della professione
(misuriamo, guardiamo, trattiamo, ti diciamo); "diagnosi" mai; ogni termine
tecnico spiegato alla prima occorrenza ("escursione articolare" a 30°,
"carico progressivo… cioè gradi, forza e test semplici" a 60°, taping "è un
aiuto, non una cura"). "Se serve un medico te lo diciamo" a 120°; "Quando no"
elenca urgenze e ciò che lo studio non tratta. Il dolore compare solo come
limite di sicurezza negli esercizi ("fin dove il dolore non aumenta",
"fermati e parlane con noi"), mai come scala.

**Didascalie di strumento** (trend-researcher P8): una riga piccola a 0°, 30°
e 150°, sempre un fatto del servizio, mai un dato clinico generale.

**Friulano**: un solo "Mandi." nella chiusa del successo.

---

## 4. Prenotazione: frasi per stato (ux-architect 5.5)

| Stato | Chiave in `PRENOTA` | Testo (esempio con valori) |
|---|---|---|
| S0 arrivo | `istruzione`, `prezzo`, `anello.lettura`, `anello.letturaSotto`, `controllo.inAttesa`, `anello.esempio` | "Gira l'anello fino a un'ora che ti va. Il controllo lo fissiamo noi, una settimana dopo." |
| S1 rotazione | `anello.occupata` | "occupata" sotto la lettura |
| S2 scelta | `controllo.lettura(q)`, `controllo.prima/dopo`, `controllo.togli` | "controllo: ven 9 · 18:00" |
| S3 spostato | `controllo.limite` (ai limiti) | "Il controllo resta tra 7 e 10 giorni dalla prima visita." |
| S4 ora diversa | `stati.oraDiversa(oraChiesta, proposto, stessoGiorno)` | "Alle 13:30 non c'è posto: ti proponiamo le 14." / "…ti proponiamo giovedì 15 alle 13:30." |
| S5 settimana piena | `stati.settimanaPiena` + `invio.bottone.una` | "La settimana dopo è piena: il controllo lo fissiamo insieme alla prima visita." |
| S6 solo prima | `stati.soloPrima`, `controllo.rimetti` | "Fissi solo la prima visita. Il controllo lo decidiamo insieme in studio." |
| S7 compilazione | `campi.*.etichetta/aiuto`, `campi.suggerimenti` | etichette sopra, "obbligatorio" a parole (`COMUNI.obbligatorio`) |
| S8 errore campo | `campi.nome.erroreVuoto/erroreCorto`, `campi.telefono.erroreVuoto/erroreIncompleto` | "Il numero sembra incompleto: controlla le cifre." |
| S9 invio | `invio.inCorso` | "Fissiamo..." |
| S10 posto preso | `stati.postoPreso(perso, nuovo)`, `stati.postoPresoDopo` | "Mercoledì alle 13:30 qualcuno ha appena prenotato. Ti abbiamo spostato alle 14, sempre mercoledì." |
| S11 fallito | `stati.fallito.prima(due) + link + dopo` | "Non siamo riusciti a fissare le visite. I tuoi dati sono ancora qui. Riprova tra poco o [chiamaci]." |
| S12 successo | `successo.frase(prima, controllo)`, `successo.chiusa`, `successo.promemoria`, `successo.riassunto(nome, cifre)`, `successo.calendario`, `successo.cambia` | "Ci vediamo venerdì 2 alle 18. Il controllo è venerdì 9 alle 18." |
| S13 cambia | `invio.sposta.due/una` | "Sposta le visite" |
| S14 già fissato | `successo.giaFissato`, `successo.altraPersona` | "Prenota un'altra persona" |
| S15 senza JS | `senzaScript.frase + link + dopo`, `senzaScript.orari` | "Per prenotare [chiamaci]. Fissiamo insieme la prima visita e il controllo della settimana dopo." |
| .ics | `ics.*` | due eventi, "Prima visita · NOVANTA" e "Controllo · NOVANTA", luogo di esempio, descrizione che dice che l'appuntamento non è vero |

Bottone: `invio.bottone.due` "Fissa le due visite" / `.una` "Fissa la visita"
(S5, S6). Singolare/plurale: le funzioni con `due: boolean` lo gestiscono.

---

## 5. Annunci (`ANNUNCI`)

`angolo(g)` (solo il nome: "Trattamenti"), `scelta(prima, controllo)`,
`controlloSpostato(q)`, `controlloTolto`, `controlloRimesso(q)`,
`suggerimento(testo)`, `inCorso(due)`, `fallito(due)`, `successo(prima,
controllo)`, `cambia(due)`, `vistaElenco`, `vistaQuadrante`. S4, S5 e S10
annunciano la stessa frase che mostrano (`PRENOTA.stati.*`).

---

## 6. Dove mi discosto dai segnaposto dell'ux-architect (e perché)

| Segnaposto ux | Scelta | Motivo |
|---|---|---|
| Prima visita 60 €, seduta 50 €, osteopatia 50 min 65 €, cinque sedute 225 € | 65 €, 55 €, osteopatia 60 min 70 € poi 45 min 60 €, ciclo di 5 a 250 € | Listino del brand-strategist §7, vincolante per i prezzi. |
| "secondo piano con ascensore" | "Primo piano, con ascensore." | Brand §9. |
| "☎ 0434 000 000" in testata, "chiamaci allo 0434 000 000" in S11 e S15 | "Chiama" / "chiamaci" come link `tel:`, nessun numero a vista | Regola del ruolo: recapiti come link, niente numeri finti in vista. |
| Terzo esercizio "Rotazione con l'elastico, fino a 45°" | "Tallone che scivola", ginocchio dopo una protesi, obiettivo 90° | Brand §5.6; lega il 90 del nome al ginocchio operato. |
| Tacche lun-ven 8:00-19:30 (24), sab 8:00-12:30 (10) | lun-ven 8:00-19:00 (23), sab 8:00-12:00 (9) | La prima visita dura 60 min e lo studio chiude alle 20 e alle 13 (brand: "ultimo appuntamento alle 19.00"). |
| "fattura sanitaria, detraibile come spesa medica" | formula prudente del brand, senza promessa | Brand §7: niente percentuali né promesse sulla detraibilità. |
| `ANGOLI` in `testi.ts` (tech-architect §3) | `ANGOLI_TESTI` + `NOMI_ANGOLI` | `ANGOLI` è già la tupla dei gradi in `dial/geometria.ts`: stesso nome, forma diversa, import in conflitto. |

---

## 7. Lunghezze (375 px, Lexend 17 px ≈ 36-38 caratteri per riga)

- `h2`: tutti ≤ 6 parole, ≤ 2 righe a 26 px.
- 0°: frase 18 parole (≈ 4 righe) + nota + bottone: sta nel primo schermo
  solo se la nota e l'orario vanno in una riga piccola. **Se a 375 × 667
  "Prenota" non sta nel primo schermo, il section-builder nasconde `ZERO.nota`
  e `ZERO.orario` sotto 700 px di altezza** (restano in 30° e 180°).
- 30°, 60°, 150°, 180°: superano 6 righe e scorrono nell'area (ux 3); il
  primo blocco visibile è sempre quello che conta (momenti, prima voce, primo
  esercizio, prima riga del listino).
- 120°: cosa + quando sì + quando no ≈ 14 righe a 375, scorre dalla riga
  "Quando no" come previsto dall'ux.

---

## 8. Richieste ad altri agent

- **scaffold-engineer**: in `layout/Angolo.tsx` l'`h2` viene da
  `ANGOLI_TESTI[gradi].titolo` (non esiste un `ANGOLI` in `content/`).
  `core/links.ts`: `TELEFONO_URL = RECAPITI.telefonoHref`, `MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(RECAPITI.mapsQuery)`.
  `Novanta.tsx`: `document.title = META.title` e meta description da
  `META.description`. `?motivo=intervento` → suggerimento con `id:
  'intervento'`, testo "dopo un intervento".
- **section-builder-prenota**: `calendario.ts` legge `APERTURA`,
  `OCCUPATE.interna/esterna`, `PASSO_MINUTI`, `FINESTRA_CONTROLLO`,
  `ANTICIPO_MINIMO_ORE`, e passa alle frasi oggetti `Quando`. Lo stato S5 va
  simulato (i dati di default non lo producono).
- **photo-editor / section-builder**: `ALT_FOTO` è riscritto sulle tre foto
  vere; `FOTO[k].alt` in `assets/foto/index.ts` può restare o puntare ad
  `ALT_FOTO[k]` (stesso contenuto, preferibile `ALT_FOTO`).
- **section-builder-prezzi-dove e vista elenco**: nel piede i crediti da
  `creditiFoto` (autore, "Wikimedia Commons", link alla licenza
  `licenzaHref`, link alle tre pagine `FOTO[k].url` con le etichette
  `fonti.*`, `modifiche`). Obbligatori finché c'è almeno una foto
  (`CI_SONO_FOTO`).
- **section-builder-quadrante**: le parole sul quadrante sono
  `NOMI_ANGOLI[g].parola` (minuscolo); `aria-valuetext` da
  `QUADRANTE.valoreSr(gradi, angoloPiuVicino(gradi))`.
- **seo-engineer**: `META` è pronto; nessun `LocalBusiness`.
