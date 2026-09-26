# Copywriter · Concept 20 · IMBRUNIRE, albergo di sette stanze (Pordenone)

Ondata 2. File miei: `src/pages/concepts/imbrunire/content/testi.ts`,
`src/pages/concepts/imbrunire/content/prezzi.ts`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/matrice-concept-11-20.md` (riga e paragrafo
20, verifica incrociata), tutti i doc dell'ondata 1 in `concepts/20-imbrunire/docs/`
(creative-director, brand-strategist, ux-architect, tech-architect,
trend-researcher), `concepts/10-torchio/docs/copywriter.md` e i suoi due file
`content/*` solo come formato.

Controlli fatti sui due file:
- `tsc --strict --noUnusedLocals --noUncheckedIndexedAccess --exactOptionalPropertyTypes
  --verbatimModuleSyntax` verde.
- Scansione di tutte le 495 stringhe (script che percorre l'oggetto `TESTI`) e
  delle frasi composte dalle funzioni con dati di prova: nessun trattino lungo o
  medio, nessun punto esclamativo, nessun "...", un solo "…" (`PRENOTA.invio.inCorso`,
  voluto dal creative-director §7.7).
- Nessuna parola delle liste "da evitare" (brand-strategist §4 e §6.4): niente
  esperienza, unico, charme, relax, suite, superior, comfort, check-in, booking,
  staff, "prenota ora", "a due passi", "cuore della città".
- Nessun "01 ·", nessun occhiello. Il "·" compare solo in `META.title` e
  `VETRINA.subtitle`.
- Date d'esempio verificate con `Intl`: 15/10/2026 giovedì, 23/10 venerdì,
  24/10 sabato, 10/11 martedì, 5/12 sabato.

---

## 1. Come si usa

```ts
import TESTI, { CAMERE, RIGA_STATO, PRENOTA, dalAl, giorno, maiuscola } from '../../content/testi';
import { PREZZO_BASE, LETTO_AGGIUNTO, TASSA_SOGGIORNO } from '../../content/prezzi';
```

- Ogni stringa visibile, ogni `aria-label`, ogni annuncio `aria-live` è in
  `testi.ts`. I componenti non scrivono testo. Gli `alt` delle foto sono del
  photo-editor (`assets/foto/index.ts`), come dice il tech-architect §4.
- Tutto è `as const`; gli oggetti per stanza sono `satisfies Record<SlugCamera, …>`,
  quindi se manca una stanza o uno slug cambia, il build si rompe qui.
- **Le date entrano come `PartiData`** (`{ settimana, giorno, mese, anno }`,
  scomposte con `Intl` da `core/date.ts`), non come stringhe già scritte. Motivo:
  le frasi devono decidere da sole se ripetere il mese ("da giovedì 15 a sabato 17
  ottobre" contro "da sabato 31 ottobre a lunedì 2 novembre"), mettere "1°" e
  scegliere "dall'8 all'11". Il tech-architect chiedeva
  `(p: { dal: string; al: string; … })`: con due stringhe già formattate queste
  regole non si possono rispettare. Vedi Richieste, punto 1.
- **Gli importi entrano come stringhe** già formattate da `euro()` di
  `dati/prezzo.ts` ("422 €"). `testi.ts` non calcola e non formatta numeri.
- **La luna entra come `LunaPerTesto`** (`{ fase, percento, crescente }`): è un
  sottoinsieme di `InfoLuna` (tech-architect §6.11), quindi si passa `InfoLuna`
  così com'è. `NomeFase` è ridefinito identico.
- I tipi `SlugCamera`, `SlugSpazio`, `SlugCella`, `Ospiti` sono esportati da
  `prezzi.ts` e coincidono con `state/store.ts` (§6.1).

### Aiuti di lingua esportati

| Funzione | Esempio |
|---|---|
| `giorno(d, conAnno?)` | "giovedì 15 ottobre", "domenica 1° novembre", con anno "… 2026" |
| `giornoBreve(d)` | "15 ottobre" |
| `dalAl(primo, ultimo)` | "da giovedì 15 a sabato 17 ottobre"; "da sabato 31 ottobre a lunedì 2 novembre"; "da mercoledì 30 dicembre 2026 a sabato 2 gennaio 2027"; una notte: "venerdì 23 ottobre" |
| `dalAlBreve(primo, ultimo)` | "dal 30 al 31 ottobre", "dall'8 all'11 novembre", "dal 1° al 2 novembre", una notte: "il 23 ottobre", "l'8 novembre" |
| `maiuscola(s)` | per l'inizio frase |
| `elenco(nomi)` | "Il Noce, La Corte e La Soffitta" |
| `notti(n)`, `persone(n)` | "1 notte", "3 notti", "2 persone" |
| `inParole(n)` | "due" (fino a dieci) |
| `lunaE(l)` | dopo "la luna è": "piena", "nuova, non si vede", "al primo quarto", "crescente, illuminata al 42%" |
| `lunaNome(l)` | nelle etichette: "luna piena", "primo quarto", "luna crescente illuminata al 42%" |
| `nomiCamere(slugs)`, `nomeCella(slug)` | nomi in ordine |

`dalAl` va **dalla prima all'ultima notte** (non alla partenza), come nel
creative-director §7.3 e nell'ux §4.3. Per togliere l'ambiguità il pannello di
prenotazione aggiunge sempre `PRENOTA.partenza(g)`: "Riparti domenica 18 ottobre
entro le 11."

---

## 2. Mappa delle chiavi di `testi.ts`

| Esportazione | Chi la usa | Chiavi principali |
|---|---|---|
| `META` | `Imbrunire.tsx` (title, description), seo-engineer | `title` (58 car.), `description` (151), `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA` | voce `CONCEPTS` in `src/content/site.ts` al porting (proposta) | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri` |
| `COMUNI` | ovunque | `nome` ("ALBERGO IMBRUNIRE"), `nomeBreve`, `h1`, `scegliLeLune`, `lune`, `leMieNottiQui`, `tieniMiLaStanza`, `tornaAlPalazzo`, `chiudi`, `fatto`, `occupata`, `libera`, `laTuaStanza`, `stasera`, `chiuso`, `nuovaScheda`, `finzione`, `finzioneRecapiti`, `daANotte(p)`, `daANotteColazione(p)` |
| `RECAPITI` | `core/links.ts`, spazi, prenota | `via`, `cap`, `citta`, `indirizzoRiga`, `indirizzo[2]`, `telefono` ("Chiama la reception"), `telefonoBreve`, `telefonoAria`, `telefonoHref`, `emailEtichetta` ("Scrivici"), `emailAria`, `email`, `mapsQuery` |
| `SALTI` | `Imbrunire.tsx` | `elenco`, `lune` |
| `TESTATA` | cielo (`Testata.tsx`) | `nomeAria`, `elenco`, `elencoAria`, `scegliLeLune`, `chiudiLune`, `chiudiLuneAria`, `tornaAlPalazzo`, `tornaAlPalazzoAria`, `bottoneLune`, `bottoneLuneAria` |
| `CIELO` | cielo | `lunaStasera(l)`, `lunaStaseraAttesa`, `lunaPrimaNotte(g, l)`, `chiSiamo`, `chiSiamoRighe[2]` |
| `PIANI` | palazzo, elenco | per piano `nome`, `inFrase`, `vai` (tacche del binario) |
| `PALAZZO` | palazzo | `aria`, `istruzioni`, `binarioAria`, `solaio.{nobile,terra}`, `occupata`, `laTuaStanza`, `ridottoAria` |
| `CAMERE`, `ORDINE_CAMERE` | palazzo, stanza, elenco, lune | per slug: `nome`, `breve`, `piano`, `numero`, `carattere[2]`, `fatti[]`, `limite`, `scale`, `lettoBreve`, `mq`, `ospiti`, `ospitiAria`, `guarda.{principale,seconda}` |
| `SPAZI_NOMI` | palazzo, stanza, elenco | per spazio: `nome`, `breve`, `inFrase`, `parola` (al posto del prezzo), `piano`, `cellaAria` |
| `CELLA` | palazzo | `aria(slug, prezzoDa, stato)`, `ariaSpazio(slug)`, `fotoAssente` |
| `STANZA` | stanza | `numero(n)`, `prezzoDa(p)`, `guardaAria`, `porta(nome)`, `portaAria(nome)`, `scalaSu/Giu(nome)` e `…Aria`, `porteAria`, `foglioApri`, `foglioRiduci`, `foglioAria(nome)`, `occupataIl(quando)`, `proposta(testo)`, `sempreOccupata`, `guardaLeLibere`, `nuoveNottiOccupata` |
| `ANDRONE` | spazi | `titolo`, `iscrizione`, `intro`, `banco`, `regoleTitolo`, `regole[]` (`termine`, `definizione`: per il `dl`), `contattiIntro`, `chiama`, `chiamaAria`, `scrivi`, `scriviAria` |
| `COLAZIONE` | spazi | `titolo`, `orario`, `inclusa`, `righe[3]`, `esigenze`, `storia` |
| `PORTICO` | spazi | `titolo`, `intro`, `indirizzo[2]`, `aPiediTitolo`, `aPiedi[]` (`luogo`, `minuti`), `minuti(n)`, `minutiAria(luogo, n)`, `comeArrivareTitolo`, `comeArrivare[]` (`mezzo`, `testo`), `maps`, `mapsAria`, `finzione` |
| `SPAZIO_CON_NOTTI` | stanza (S4) | `libere(n)`, `torna`, `scegliLeLune` |
| `STRADA` | spazi (`Strada.tsx`) | `finzione`, `recapiti`, `aPiediTitolo`, `maps`, `mapsAria`, `chiama…`, `scrivi…` |
| `NASTRO` | lune | vedi §4 |
| `RIGA_STATO` | lune | vedi §4 |
| `SCRIVI_DATE` | lune (`ScriviDate.tsx`) | `legenda`, `arrivo`, `partenza`, `aiuto`, `usa`, `chiudi`, errori `arrivoVuoto`, `partenzaVuota`, `partenzaPrima`, `arrivoPassato`, `oltre(ultima)`, `troppeNotti`, `chiuso`, `minimoAgosto` |
| `ORE_ARRIVO`, `OraArrivo` | prenota (`OraArrivo.tsx`) | 15 orari 14:00-21:00, tre file da cinque |
| `PRENOTA` | prenota | vedi §5 |
| `SUCCESSO`, `ICS` | prenota (`Successo.tsx`, `ics.ts`) | vedi §5 |
| `ELENCO` | elenco | `titolo`, `intro`, `perLeNotti(s)`, `caption`, `captionConNotti`, `ordina`, `ordini`, `ordiniAria`, `colonne.*`, `libera(totale, ospiti)`, `occupata`, `entra`, `entraAria(slug)`, `spaziTitolo`, `spazioAria(slug)`, `scegliLeLune`, `chiudi` |
| `ANNUNCI` | `core/annunci.ts` e chi annuncia | `luciAccese`, `nottiTolte`, `ordinato(o)`, `invioInCorso`, `invioFallito`, `nuoveNottiOccupata`, `bozzaRitrovata`, `luneAperte`, `luneChiuse`, `palazzoRiacceso` |
| `NOMI_FASE`, `INIZIALI_GIORNO` | lune | nome breve per fase; iniziali d l m m g v s (indice = `getUTCDay`) |
| `TESTI` (default) | tutto in un oggetto | `type Testi` |

### Maiuscolo

`COMUNI.nome` e `ANDRONE.iscrizione` sono già in maiuscolo (iscrizioni in
Marcellus). I nomi delle stanze sono scritti "Il Noce": sulle celle e nel titolo
il maiuscolo lo fa il CSS (`text-transform: uppercase`), così il lettore di
schermo legge "Il Noce" e non una sigla. Commissioner mai in maiuscolo.

---

## 3. Le stanze: cosa ho deciso

Dati del brand-strategist §1.5 e §7.1, carattere riscritto con la regola del
trend-researcher P3 (nessuna frase di pannello oltre 90 caratteri, nessun
aggettivo senza un fatto accanto). Ogni stanza ha **un limite detto con calma**,
non solo La Soffitta:

| Stanza | n. | Carattere (2 righe) | Limite |
|---|---|---|---|
| Il Noce | 5 | Travi e pavimento di noce. / La luce arriva dall'alto, da un lucernario. | Dal letto si vede il cielo, non la strada. |
| Il Campanile | 6 | Una finestra alta sotto le travi. / Dentro la finestra, il campanile di San Marco. | Le campane suonano le ore, dalle 7 alle 22. |
| La Soffitta | 7 | La più piccola, sotto la falda del tetto. / Il soffitto scende fino a 1,60 m dal lato del letto. | Se sei alto, scegli Il Noce. |
| Il Camino | 2 | La più grande, al piano nobile. / Camino in pietra e soffitto alto 3,90 m. | Il camino è di pietra vera, ma non si accende. |
| La Loggia | 3 | Una porta finestra ad arco / su un piccolo balcone sopra il corso. | La sera si sente il passeggio fino alle 23. |
| Sul Noncello | 4 | Due finestre sul retro, / verso il fiume e gli alberi del parco. | Senza TV. È la più silenziosa. |
| La Corte | 1 | Al piano terra, porta finestra sulla corte interna. / Nessun gradino dalla strada. | La luce è più bassa che ai piani. |

- Numeri di stanza: La Corte 1, piano nobile 2-4, sottotetto 5-7 (Il Campanile è
  la 6, come nel wireframe dell'ux §5.2). Solo come "camera 6", piccolo.
- `fatti[]` è nell'ordine del brand-strategist §5.2: piano e rampe, m², letto,
  bagno, ospiti, TV. La Corte ha in più "porte larghe 90 cm".
- `guarda.seconda` è una **mia ipotesi** su cosa mostrerà la seconda foto
  (lucernario, finestra, bagno, balcone, corte). Si usa solo se
  `FOTO[slug].seconda` esiste. Vedi Richieste, punto 4.

---

## 4. Nastro e riga di stato: stato per stato

Stati dell'ux-architect §6.1 e chiave da usare.

| Stato | Chiave |
|---|---|
| P0, P2 vuoto | `RIGA_STATO.vuoto` = "Trascina sulle lune delle notti che vuoi." |
| P3 prima luna fissata | `RIGA_STATO.arrivoFissato(g)` → "Arrivo giovedì 15 ottobre. Ora scegli l'ultima notte." |
| P4 selezione in corso | stessa di P5, annunciata solo a fine gesto (regola ux) |
| P5 notti scelte | `RIGA_STATO.scelte(s, libere, prezzoDa)` → "Da giovedì 15 a sabato 17 ottobre, 3 notti. Libere: Il Camino, La Corte, Il Noce e La Soffitta. Da 112 € a notte." Con una sola: "Libera solo La Corte."; con tutte: "Tutte e sette le stanze sono libere." |
| P6 pieno | `RIGA_STATO.pieno` + due bottoni `RIGA_STATO.proposta(s, libere)` → "Da giovedì 22 a sabato 24 ottobre si liberano Il Noce e La Corte" (gruppo: `propostaAria`) |
| P7 oltre 14 | `troppeNotti` + link `troppeNottiLink` ("scrivici", mailto di esempio) + `troppeNottiFine` |
| P8 chiusura | `RIGA_STATO.chiuso` = "Dal 7 al 28 gennaio siamo chiusi: rifacciamo le stanze." |
| P9 minimo agosto | `minimoAgosto` + bottoni `aggiungiDomenica`, `aggiungiVenerdi` |
| motivo `notte-occupata` | `RIGA_STATO.notteOccupata(slug, g)` → "La Loggia è occupata sabato 24 ottobre: le notti si fermano alla sera prima." |
| P10 filtrato, vuoto | `filtroVuoto(slug)` → "La Corte: le lune col punto di luce sono le notti in cui è libera." |
| P10 filtrato, libera | `filtroLibera(slug, s, totale, ospiti)` |
| P10 filtrato, occupata | `filtroOccupata(slug, g, alternative)` → "La Loggia: occupata sabato 24 ottobre. Libera venerdì 23 ottobre, oppure dal 30 al 31 ottobre." (`alternative` già scritte con `giorno()` o `dalAlBreve()`) |
| P11 date scritte | `SCRIVI_DATE.*` sotto il campo |
| P12 notti dall'URL | `RIGA_STATO.nottiNonValide` |
| P13 svuota | `RIGA_STATO.vuoto` + `ANNUNCI.nottiTolte` |

Altre chiavi del nastro (`NASTRO`): `titolo` (h2 nascosto), `listboxAria`,
`meseAria(mese, anno)`, `istruzione`, `istruzioneTastiera` (per
`aria-describedby`), `meseIndietro`, `meseAvanti`, `stasera`, `chiuso`, `arrivo`,
`ultimaNotte`, `notaWeekend` (il +15% detto una volta, piccolo), `legendaFiltro`
("Punto di luce: libera. Trattino: occupata."), `scriviLeDate`, `svuota`,
`svuotaAria`, `lunaAria(g, l, libere)` → "Giovedì 15 ottobre, luna crescente
illuminata al 42%, 4 stanze libere", `lunaAriaFiltro(g, l, slug, libera)`,
`lunaAriaChiusa(g)`, `staseraAria` (da aggiungere in coda), `foglioAria`,
`fatto`, `chiudi`, `chiudiAria`, `fasciaStanza(slug)` → "Le notti di La Corte".
Prima del calcolo delle fasi (prerender) si passa `l = null`: l'etichetta resta
completa senza la luna.

Scelta di lingua: scrivo **"Da giovedì 15 a sabato 17 ottobre"** e non "Dal
giovedì 15 al sabato 17" dei segnaposto: in italiano parlato l'articolo davanti
al giorno della settimana suona da modulo. Con la sola data resta l'articolo
("dal 30 al 31 ottobre").

---

## 5. Pannello di prenotazione, invio e successo

| Stato (ux §6.2, §6.3) | Chiave |
|---|---|
| S0 dentro, senza notti | `CAMERE[slug]` + `STANZA.numero(n)` + `STANZA.prezzoDa(p)` + `COMUNI.leMieNottiQui` |
| S3 occupata | `STANZA.occupataIl(giorno o dalAlBreve)` + bottoni `STANZA.proposta(dalAlBreve)` → "Libera dal 30 al 31 ottobre: usa queste lune"; senza proposte `sempreOccupata` + `guardaLeLibere` |
| S4 spazio comune con notti | `SPAZIO_CON_NOTTI.libere(n)` + `torna` |
| S6 foto assente | `CELLA.fotoAssente` (in `.imb-sr`) |
| S2 prenotazione | `PRENOTA.notti(s)`, `PRENOTA.partenza(g)`, `cambiaNotti`, `ospiti.*`, `totale.*`, `dettaglio.*`, `ora.*`, `campi.*` |
| F1 errori | messaggi `PRENOTA.ora.errore`, `campi.nomeErrore`, `campi.contattoErrore`; riepilogo `PRENOTA.errori.riepilogo([PRENOTA.errori.ora, PRENOTA.errori.contatto])` → "Mancano due cose: l'ora d'arrivo e il contatto." |
| F2 invio | `PRENOTA.invio.inCorso` sul bottone, `ANNUNCI.invioInCorso` |
| F3 fallito | `fallitoPrima` + link `fallitoLink` (tel di esempio) + `fallitoDopo`; annuncio `ANNUNCI.invioFallito` |
| F4 notti cambiate | `STANZA.nuoveNottiOccupata` |
| F5 successo | `SUCCESSO.frase({ arrivo, ora, luna, dopo21 })`, `firma`, `calendario`, `calendarioAria`, `torna`; `.ics` da `ICS` |

Note per il builder del pannello:
- Sotto il bottone, sempre: `PRENOTA.invio.promessa` ("Non paghi niente adesso.
  Cancelli gratis fino a 3 giorni prima.") e `PRENOTA.invio.conferma` (o
  `confermaDopo21` se in quel momento a Pordenone sono passate le 21).
- Riga delle 21 in tre pezzi per mettere il link in mezzo: `ora.dopo21Prima`,
  `ora.dopo21Link` ("chiamaci", `tel:` di esempio), `ora.dopo21Dopo`; la stessa
  frase intera in `ora.dopo21Intera` per `aria-describedby`.
- Quanti siete: sotto il gruppo `ospiti.singola` se 1, `ospiti.terzo(slug)` se 3
  (Il Camino dice "divano letto", La Corte "letto aggiunto"), e `ospiti.culla`
  nelle due stanze da tre.
- La nota facoltativa ha due aiuti: `campi.notaAiuto` e, nelle tre stanze del
  sottotetto, `campi.notaAiutoSottotetto` (niente animali, scale strette).
- Tassa: `totale.tassa(importo, ospiti)` → "Tassa di soggiorno a parte: 9 € in
  due, si paga qui." e `totale.tassaNota`.
- Successo: "Ti aspettiamo giovedì 15 ottobre verso le 19:30. Quella sera la luna
  è crescente, illuminata al 42%. Ti scriviamo entro stasera per confermare."
  `SUCCESSO.firma` ("Mandi, Giovanna") è l'unico "Mandi" del sito: riga piccola
  sotto la frase, fuori dall'`h2`. Nessuna cartolina, ricevuta, numero di pratica.
- `ICS.titolo(slug)`, `ICS.descrizione`, `ICS.luogo`, `ICS.nomeFile`: `ics.ts` fa
  l'escape di virgole e punti e virgola (RFC 5545).

---

## 6. Lunghezze (controllate per 375 px)

Area viva della torre 343 px meno padding; Commissioner 16 px circa 40-42
caratteri per riga; Marcellus 24 px circa 18 caratteri.

| Testo | Adesso | Massimo | Perché |
|---|---|---|---|
| nome stanza sulla cella | 7-12 | 14 | una riga di Marcellus nella fascia di poché anche a 24 px |
| `CAMERE.*.breve` | 4-9 | 9 | palazzo ridotto nel foglio lune, 12 px |
| `CAMERE.*.carattere` (per riga) | 23-52 | 55 | 2 righe nel pannello da 360 px |
| `CAMERE.*.limite` | 28-67 | 80 | 2 righe |
| `ANDRONE.regole[].definizione` | 20-79 | 90 | regola del trend-researcher P3 |
| `COLAZIONE.righe` | 66-83 | 90 | idem |
| `RIGA_STATO.scelte` con 4 libere | 113 | 160 | 3-4 righe nel foglio a 375; mai tagliata (l'ux vieta altezze fisse) |
| `COMUNI.nomeBreve` | 9 | 9 | testata torre accanto a "Scegli le lune" |
| `COMUNI.scegliLeLune` | 14 | 16 | bottone in alto a destra |
| `PRENOTA.invio.inCorso` | 21 | 24 | stessa larghezza di "Tienimi la stanza" (17): il bottone non deve saltare |
| `CIELO.chiSiamo` | 64 | 70 | una riga sotto il cornicione su sezione; su torre `chiSiamoRighe` |
| `META.title` | 58 | 60 | risultati di ricerca |
| `META.description` | 151 | 155 | risultati di ricerca |

---

## 7. Come si legge `prezzi.ts`

Solo dati, dal brand-strategist §7. Le formule le scrive lo scaffold in
`dati/prezzo.ts`:

- notte = `PREZZO_BASE[slug]`, meno `SCONTO_USO_SINGOLA` (15) se 1 ospite; poi,
  se la notte è di venerdì o sabato (`NOTTI_WEEKEND` = [5, 6]),
  `Math.round(notte × (1 + MAGGIORAZIONE_WEEKEND))`;
- letto aggiunto (3 ospiti, solo dove `OSPITI_MAX` è 3) = `LETTO_AGGIUNTO` × notti,
  senza maggiorazione;
- totale = somma delle notti + letto aggiunto (colazione inclusa);
- tassa = `TASSA_SOGGIORNO.perPersonaNotte` × ospiti × min(notti, `nottiMassime`),
  **fuori** dal totale;
- `ACCESSORI`, `PARCHEGGIO_METRI`, `CANCELLAZIONE_GRATIS_GIORNI`: dati detti nei
  testi (i testi li scrivono in chiaro, stessi numeri);
- lo sconto 7+ notti non esiste (omesso dall'ux §5.5).

`CASI_DI_CONTROLLO` sono cinque soggiorni con il risultato atteso (La Loggia
522 €, Il Campanile 422 €, Sul Noncello 340 €, La Soffitta in uno 291 €, Il
Camino in tre venerdì e sabato 480 € + tassa 9 €): da mettere tali e quali in
`test/`.

---

## Richieste ad altri agent

1. **scaffold-engineer**, `core/date.ts`: aggiungere
   `partiData(d: DataISO): PartiData` (tipo esportato da `content/testi.ts`) con
   `Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'long',
   month: 'long' })` in minuscolo. Tutte le frasi con date lo usano. Il
   formattatore `formatta()` resta per le etichette dei mesi sul nastro.
2. **scaffold-engineer**, `dati/prezzo.ts`: `euro()` deve mettere il punto delle
   migliaia anche a 4 cifre ("1.090 €"). `Intl.NumberFormat('it-IT')` di default
   scrive "1090 €" (verificato con Node 22); usare `useGrouping: 'always'`
   (verificato: dà "1.090 €") o un raggruppamento a mano come nel pilota. Un
   soggiorno di 14 notti supera i 1.000 €. Leggere le costanti da
   `content/prezzi.ts` (nomi in §7) e mettere `CASI_DI_CONTROLLO` nel test.
3. **scaffold-engineer**, `core/links.ts` e `Imbrunire.tsx`: `TELEFONO_URL =
   RECAPITI.telefonoHref`, `EMAIL_URL = 'mailto:' + RECAPITI.email`, `MAPS_URL`
   dalla `mapsQuery` (come nel pilota); `document.title` e description da
   `META`; l'`h1` è `COMUNI.h1` in `.imb-sr` vicino al nome visibile.
4. **photo-editor**: se una stanza cambia nome per adattarsi alla foto (CD §8.2),
   scrivilo nel tuo doc: aggiorno `CAMERE` (nome, breve, carattere, limite,
   `guarda`). Dimmi anche cosa mostra ogni seconda foto: le etichette
   `guarda.seconda` sono ipotesi (lucernario, finestra, bagno, balcone, corte).
5. **art-director / section-builder-palazzo e stanza**: i nomi delle stanze
   arrivano in maiuscolo e minuscolo; il maiuscolo lo fa il CSS. Le fasce di
   poché devono crescere in altezza (ux §7.8): nessun testo qui è pensato per
   stare in un'altezza fissa.
6. **section-builder-lune**: la riga di stato usa `RIGA_STATO.*` con
   `ScelteTesto` (`primo`, `ultimo` come `PartiData`, `notti`); le alternative del
   nastro filtrato si scrivono con `giorno()` (una notte) o `dalAlBreve()`.
7. **section-builder-prenota**: `dopo21` del successo si calcola all'invio con
   l'ora di `Europe/Rome` (`core/date.ts`), non con l'ora del dispositivo.
