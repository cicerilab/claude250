# Copywriter · Concept 13 · CONTROPELO, barberia (Pordenone)

Ondata 2. File miei, in `src/pages/concepts/contropelo/content/`:
`testi.ts`, `prezzi.ts`, `orari.ts`, `nomi.ts`, più questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, riga 13 di `docs/matrice-concept-11-20.md`, e tutti i
doc dell'ondata 1 di questo concept (`creative-director.md`,
`brand-strategist.md`, `ux-architect.md`, `tech-architect.md`,
`trend-researcher.md`); come formato `concepts/10-torchio/docs/copywriter.md` e
i suoi `content/*.ts`.

Controlli fatti sui quattro file: `tsc --strict --noUncheckedIndexedAccess
--noUnusedLocals --noUnusedParameters --noImplicitReturns` verde; tutte le
funzioni eseguite con `tsx` e le frasi lette una per una; nessun trattino lungo
o medio, nessun punto esclamativo, nessun puntino di sospensione nei testi (i
"..." restano solo in due commenti di `orari.ts`); nessuna parola della lista
"da evitare" del brand-strategist (l'unico "unico" è in un commento); nessun
"01 ·"; il punto mediano solo in `META.title` e `VETRINA.subtitle`, come il
pilota.

---

## 1. Decisioni

1. **`prezzi.ts` e niente `listino.ts`.** Il tech-architect (§3) prevedeva
   `content/listino.ts`; il brand-strategist (§7) e l'orchestratore chiedono un
   solo `prezzi.ts` con prezzi, durate e la mappa parola → mezz'ore. Ho fatto
   così: **`listino.ts` non esiste**. Le etichette delle voci stanno in
   `testi.ts` (`VETRO_LISTINO.voci`), i numeri in `prezzi.ts` (`LISTINO`).
2. **Sette voci sul listino**, nell'ordine del brand-strategist: taglio 22,
   taglio e barba 34, barba 16, rasatura a panno caldo 20, sfumatura a pelle
   25, bambini fino a 12 anni 15, macchinetta un'altezza 15. Tutte ≤ 22
   caratteri (richiesta ux). "Rasatura con panno caldo" (24) diventa
   "Rasatura a panno caldo" a vista; la versione lunga è nel testo per il
   lettore di schermo.
3. **Sabato senza riga "pranzo".** L'ux-architect (§5.4) proponeva pause
   sfalsate per barbiere; il brand-strategist (§8.1) dice orario continuato
   senza pausa scritta, 18 righe. Tengo il brand-strategist: è più semplice
   per l'agenda e sul vetro c'è scritto "sabato 8-17, senza pausa".
   Divisione mobile: `ORARI.inizioPomeriggio = '12:30'` (sabato 9 + 9 righe,
   feriali 8 + 9).
4. **Nessun numero in vista.** "Chiama", "chiamaci", "Scrivi una email" sono
   sempre link; il numero e l'email di esempio sono solo in `RECAPITI` come
   dati (`tel:+390434000000`, `ciao@contropelo.example`). Ho riscritto tutte le
   frasi del CD con "0434 ..." (richiesta del brand-strategist).
5. **"Scrivi una email", non "Scrivi"**: la parola "Scrivi" da sola, accanto
   al richiamo "Scrivi il tuo nome", confonderebbe i due gesti.
6. **Messaggio chiave una volta sola**: `LISTA.promessa` ("Qui non si fa la
   fila: scrivi il nome in un buco, e alla tua mezz'ora la poltrona è tua."),
   riga Figtree sotto il titolo della lista, solo a riga di scrittura chiusa.
   Torna in altra forma nella conferma: "Segnato: ...".
7. **"Mandi" una volta**, in fondo alla conferma di successo.
8. **Bruno una volta**, nella frase di storia del pannello Informazioni.
9. **Prezzo accanto alla parola scelta** nella riga di scrittura (ux), preso
   da `SERVIZI[s].prezzo`. Per chi porta un bambino o vuole la sfumatura c'è
   una riga di aiuto: "Sfumatura, bambini o macchinetta: tocca taglio. Il
   prezzo è quello del listino." Nessun totale calcolato (brand-strategist §7).
10. **Riga di stato di successo senza servizio né prezzo**: l'ux ne metteva
    di più, ma su 375 px sarebbero quattro righe. Resta giorno, ora,
    barbiere, come disdire, saluto: 97 caratteri.

---

## 2. Come si usa

```ts
import TESTI, { BARBIERI, LISTA, SCRITTURA, ERRORI, euro, oraVisibile } from '../../content/testi';
import { LISTINO, SERVIZI, ORDINE_SERVIZI, type Servizio } from '../../content/prezzi';
import { ORARI, ORARI_VETRO } from '../../content/orari';
import { NOMI_PER_SPECCHIO, NOMI_VIETATI } from '../../content/nomi';
```

- Ogni stringa visibile, `aria-label`, testo nascosto `.ctp-sr` e annuncio è
  in `testi.ts`. I componenti non scrivono testo; se manca, si chiede.
- Tutto `as const`. Le frasi con valori (giorno, ora, nome, prezzo) sono
  **funzioni** che ricevono valori già pronti: giorni formattati da
  `core/date.ts` ("martedì 29"), ore in `'HH:MM'` (le funzioni chiamano
  `oraVisibile()` da sole: `'09:00'` → `9:00`).
- Messaggi con un link in mezzo (errori L6e, L11, L12 e la conferma):
  oggetti `{ prima, link, dopo }`; il componente rende
  `{prima}<a|button>{link}</a|button>{dopo}`.
- Aiuti esportati: `euro(n)` → `"22 €"` con spazio non separabile,
  `euroSr(n)` → `"22 euro"`, `oraVisibile(hhmm)`, `maiuscola(s)`,
  `postiLiberi(n)`.
- Tipi esportati: `Servizio`, `VoceListino` (da `prezzi.ts`, **uguali** a
  quelli dello store), `Relativo = 'oggi' | 'domani' | 'altro'`,
  `ChiaveErrore`, `BarbiereId`, `NomeCliente`, `GiornoSettimana`,
  `Intervallo`.

---

## 3. Mappa delle esportazioni

### `testi.ts`

| Esportazione | Dove | Chiavi principali | Voce |
|---|---|---|---|
| `RECAPITI` | vetro 3, link | `indirizzoRiga`, `indirizzoCompleto`, `telefonoHref`, `emailHref`, `mapsHref` (numero ed email solo come dati) | dati |
| `LINK` | `core/links.ts` | `lab` (`/`), `cicerilab`, `maps`, `telefono`, `email` | dati |
| `META` | `index.html`, `document.title` | `title` (58), `description` (153), `ogTitle`, `ogDescription`, `ogImageAlt` | |
| `VETRINA` | voce `CONCEPTS` del sito vero (proposta) | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri[]` | |
| `BARBIERI[0..2]` | ovunque | `id` (`listino`, `barba`, `orari`), `nome`, `poltrona`, `titoloVetro`, `riga`, `indietro`, `indietroAria` | nome: Limelight (mensola) / Mansalva (vetro) |
| `PARETE` | Parete, Specchio | `h2Sr(i)`, `bordoAria(i)`, `riflessoAlt` (`''`) | sr |
| `FASCIA` | Fascia | `insegna`, `sotto`, `informazioni`, `informazioniAria` | Limelight + Figtree |
| `SALTI` | link di salto | `lista` | Figtree |
| `VETRO_LISTINO` | VetroListino | `titolo`, `voci[id].{voce, sr}`, `ordine`, `prezzo(id)`, `prezzoSr(id)`, `durata`, `pagamento`, `elencoAria` | Mansalva |
| `VETRO_BARBA` | VetroBarba | `titolo`, `passaggi[k]`, `ordine`, `minuti(k)`, `minutiSr(k)`, `totale`, `totaleSr`, `lama`, `sensibile`, `barbaLunga`, `barbaLungaSr`, `contropeloSpiegato`, `matrimonio`, `elencoAria` | Mansalva |
| `VETRO_DOVE` | VetroDove | `titolo`, `orari` (= `ORARI_VETRO`), `orariAria`, `indirizzo`, `parcheggio`, `maps`, `mapsSr`, `chiama`, `chiamaAria`, `scrivi`, `scriviAria`, `regole[3]`, `regoleAria` | Mansalva (link inclusi) |
| `VETRO_COMUNE` | Vetro | `vaiAllaLista`, `vaiAllaListaAria(i)` | Mansalva |
| `LISTA` | Lista | vedi §4 | righe Mansalva, messaggi Figtree |
| `SCRITTURA` | RigaScrittura | `formAria`, `sostituisce`, `servizio.{legenda, parole, ordine, prezzo, radioAria, aiuto}`, `nome.etichetta`, `telefono.{etichetta, aiuto}`, `segna`, `lasciaStare`, `lasciaStareAria`, `inCorso` | etichette Figtree, parole e campi Mansalva |
| `ERRORI` | sotto i campi | `servizioVuoto`, `nomeVuoto`, `telefonoVuoto`, `telefonoNonValido` | Figtree + icona |
| `ERRORI_CON_LINK` | riga di scrittura | `mezzora(p \| null)`, `preso(p)`, `fallito.{prima, riprova, riprovaAria, mezzo, chiama, chiamaAria, dopo}` | Figtree |
| `CONFERMA` | riga di stato, lista | `segnato(p)`, `chiamaAria`, `giaSegnato(p)`, `cancellato`, `rimettilo`, `rimettiloAria(ora)`, `rimettiloPreso` | Figtree |
| `MENSOLA` | Mensola | `navAria`, `tablistAria`, `tabSr(i)`, `pulito`, `scriviIlTuoNome`, `scriviIlTuoNomeRighe`, `suggerimentoMouse`, `suggerimentoDito` | Figtree (nomi Limelight) |
| `INFORMAZIONI` | Informazioni | `titolo`, `chiudi`, `chiudiAria`, `finzione`, `storia`, `igiene`, `nonFacciamo`, `collo`, `bambini`, `ritardo`, `ferie`, `riflesso`, `fotoTitolo`, `foto(autore)`, `fotoLinkSr`, `font`, `icone`, `conceptDi`, `cicerilab`, `cicerilabSr`, `ricomincia.{bottone, domanda, si, no, fatto}` | titolo Mansalva, resto Figtree |
| `ANNUNCI` | `store.annuncia()` | `specchio(i)`, `facciaLista(i)`, `facciaVetro(i)`, `giorno(p)`, `chiuso(g)`, `pulitoAcceso`, `pulitoSpento`, `inCorso`, `segnato(p)`, `giaSegnato(p)`, `cancellato`, `ricominciato` | sr |
| `TESTI` | tutto sopra (default export) | | |

Ordine suggerito del pannello Informazioni (brand-strategist §5.9):
`finzione`, `storia`, `igiene`, `nonFacciamo`, `collo`, `bambini`,
`ritardo`, `ferie`, `riflesso`, crediti (`fotoTitolo` + `foto()` × 3, `font`,
`icone`), `conceptDi` con link `cicerilab`, `ricomincia`.

### `prezzi.ts`

| Esportazione | Cosa |
|---|---|
| `Servizio`, `VoceListino` | tipi |
| `PASSO_MINUTI` | 30 |
| `LISTINO[voce]` | `{ prezzo, minuti, servizio }` per le 7 voci |
| `ORDINE_LISTINO` | ordine delle voci sul vetro |
| `SERVIZI[servizio]` | `{ mezzore: 1 \| 2, prezzo, voce }` per le 4 parole della riga di scrittura |
| `ORDINE_SERVIZI` | taglio, barba, taglio e barba, rasatura |
| `RASATURA_PASSAGGI`, `ORDINE_RASATURA` | minuti della rasatura (3 + 2 + 10 + 10 + 3 = 28, dentro la mezz'ora) |
| `FUORI_LISTINO` | barba lunga 16 € (30'), collo e basette 8 € (10') |
| `REGOLE_NUMERI` | 5' prima, 10' di ritardo, bambini fino a 12, 6 giorni prenotabili, matrimonio 7 giorni prima |

### `orari.ts`

| Esportazione | Cosa |
|---|---|
| `ORARI` | `passo`, `settimana` (0 domenica ... 6 sabato, `null` = chiuso, intervalli `[inizio, fine)`), `pausa.etichetta`, `inizioPomeriggio` |
| `GIORNI_CHIUSI` | `[0, 1]` |
| `ORARI_VETRO` | tre righe parlate `{ giorni, ore, sr }` per il vetro 3 |

Regola per l'agenda: l'ultima mezz'ora di un intervallo inizia `passo`
minuti prima della sua fine (12:30 → ultima riga 12:00; 19:00 → 18:30;
17:00 → 16:30). Tra due intervalli dello stesso giorno, una riga
`LISTA.pranzo(fineMattina, inizioPomeriggio)`.

### `nomi.ts`

| Esportazione | Cosa |
|---|---|
| `NOMI` | 44 nomi + iniziale, tutti diversi |
| `NOMI_PER_SPECCHIO[0..2]` | 20 nomi per barbiere (Mattia clienti di sempre, Denis 30-60 anni, Samir ragazzi e bambini), gruppi sovrapposti: bastano per le 18 mezz'ore del sabato senza ripetere |
| `NOMI_VIETATI` | Mattia, Denis, Samir, Bruno: il generatore non li usa mai |

Rispetto alla lista del brand-strategist: tolto "Mattias R." (troppo simile a
Mattia), aggiunti Oleksandr M. (dall'ux), Nevio T., Dario C., Emanuele B.,
Ottavio G.

---

## 4. Lista e prenotazione: stato per stato

Stati dell'ux-architect (§6.3) e chiave da usare.

| Stato | Dove | Chiave |
|---|---|---|
| L0 prerender | h3 | `LISTA.titoloAttesa` |
| L1 a riposo | h3 con `<time>` | `LISTA.titolo(rel, giorno)`; sotto `LISTA.promessa`; righe: `liberoSr`, `occupatoSr`, `secondaMezzoraSr`, `passataSr`, `pranzo`/`pranzoSr`; `<ol aria-label>` = `elencoAria(nome)`; con `forced-colors` la parola `liberoParola` |
| Fasce | bottoni | `fasce.mattina`, `fasce.pomeriggio`, gruppo `fasceAria`; a 4 fasce il testo è `oraVisibile(da)` e l'aria `fasciaOraAria(da)` |
| Giorni | bottoni a pennarello | `avanti(rel, nomeGiorno)`, `indietro(rel, nomeGiorno)`, aria `vaiAGiornoAria(giorno)`; oltre i 6 giorni `oltre` + link `oltreChiama` (`oltreChiamaAria`) |
| L2 cambio giorno/fascia | annuncio | `ANNUNCI.giorno({ rel, giorno, fascia?, liberi })` |
| L3 chiuso | lista | `LISTA.chiuso` (grande), sr `chiusoSr(giorno)`; annuncio `ANNUNCI.chiuso(giorno)` |
| L4 pieno | lista, Figtree | `pieno(rel, giorno)` + link `pienoProposta(p)` con `aria-label` `pienoPropostaAria(p)`; se non c'è nulla: `pienoSettimana` + link `pienoSettimanaChiama` + `pienoSettimanaDopo` |
| L4b giornata finita | lista | `LISTA.finita` |
| L5 riga aperta | form | `SCRITTURA.formAria(ora, barbiere)`; `servizio.legenda`; su S il titolo diventa `LISTA.titoloConOra(rel, giorno, ora)` |
| L6 servizio scelto | accanto alla parola | `servizio.prezzo(s)`; radio `radioAria(s)`; sotto `servizio.aiuto` |
| L6e errore mezz'ora | sotto le parole | `ERRORI_CON_LINK.mezzora({ ora, giorno? })` o `mezzora(null)` se nel giorno non c'è un'ora libera |
| L8 errori di campo | sotto il campo | `ERRORI.servizioVuoto`, `nomeVuoto`, `telefonoVuoto`, `telefonoNonValido`; aiuto fisso `telefono.aiuto` |
| L9 invio | riga di stato | `SCRITTURA.inCorso` (= `ANNUNCI.inCorso`) |
| L10 successo | riga di stato | `CONFERMA.segnato(p)` con link `chiamaci` (`chiamaAria`); lista: `tuaSr`, `tuaSecondaSr`, `cancella`, `cancellaAria(ora)`; annuncio `ANNUNCI.segnato(p)` |
| L11 posto preso | riga di scrittura, `role="alert"` | `ERRORI_CON_LINK.preso({ ora, libera })` |
| L12 invio fallito | riga di scrittura, `role="alert"` | `ERRORI_CON_LINK.fallito` |
| L13 già segnato | riga di stato | `CONFERMA.giaSegnato(p)` |
| L14 cancellato | riga di stato, 10 s | `CONFERMA.cancellato` + `rimettilo` (`rimettiloAria(ora)`); se nel frattempo è preso `rimettiloPreso` |
| L15 una sola prenotazione | in testa alla riga | `SCRITTURA.sostituisce(p)` |
| Mensola | | `MENSOLA.pulito` (+ `ANNUNCI.pulitoAcceso`/`pulitoSpento`), `scriviIlTuoNome` / `scriviIlTuoNomeRighe`, `suggerimentoMouse` / `suggerimentoDito` |

Esempi reali (output delle funzioni):
- "Oggi, martedì 29" · "Domani, mercoledì 30, alle 9:30" · "Giovedì 1"
- "Da Denis domani alle 9:30 c'è posto"
- "Qui c'è solo mezz'ora: taglio, barba o rasatura. Per taglio e barba ci sono [le 16:00]."
- "Qualcuno ha scritto prima di te alle 17:00. [Le 17:30 sono libere]."
- "Segnato: martedì 29 alle 16:30 con Denis. Se non puoi venire, cancella il nome o [chiamaci]. Mandi."
- Annuncio: "Mercoledì 30, mattina: 4 posti liberi."

---

## 5. Lunghezze massime (375 px)

Base: vetro 327 px, area utile 287 px; Mansalva ha la x bassa e nessuna
cifra tabellare (trend-researcher 4.3), circa 24-26 caratteri per riga a 24 px.

| Testo | Adesso | Massimo | Note |
|---|---|---|---|
| `VETRO_LISTINO.voci[].voce` | 5-22 | 22 | prezzo a destra sulla stessa riga |
| `VETRO_BARBA.passaggi[]` | 10-23 | 23 | minuti a destra; "Panno freddo, dopobarba" può andare a capo (riga descrittiva, ux 5.3) |
| `BARBIERI[].riga` | 47-56 | 60 | 2-3 righe Mansalva piccola |
| `VETRO_DOVE.regole[]` | 26-43 | 45 | 2 righe al massimo |
| `ORARI_VETRO[].giorni` + `ore` | 29-37 | 40 | giorni sopra, ore sotto se non ci sta |
| `LISTA.promessa` | 88 | 90 | 2 righe Figtree 15 a 1440, 3 a 375: se non c'è posto, su S si omette |
| `CONFERMA.segnato` completa | ~97 | 110 | 2-3 righe nella striscia di stato |
| `MENSOLA.scriviIlTuoNome` | 18 | 18 | a due righe sotto 380 px (`scriviIlTuoNomeRighe`) |
| `META.title` | 58 | 60 | |
| `META.description` | 153 | 155 | |

Priorità sul vetro 2 e 3 se a 375 × 667 non ci sta tutto (in quest'ordine si
toglie, dal fondo): vetro 2 `matrimonio`, `contropeloSpiegato`, `barbaLunga`;
vetro 3 `parcheggio`, poi la terza regola. Mai togliere prezzi, orari,
indirizzo, "Apri in Maps", "Chiama", la riga del barbiere. Quello che si
toglie su S resta su L e nel pannello Informazioni (ritardo e bambini ci sono
comunque).

---

## 6. Tono: le regole applicate

- Sul vetro: frasi nominali, minuscole dove le scrive un barbiere ("tutto
  mezz'ora, taglio e barba un'ora", "lama nuova per ognuno"), titoli e voci
  del listino con l'iniziale maiuscola.
- Sulla mensola e negli stati: frasi intere, calme, "tu", nessun ordine in
  maiuscolo. Ogni regola ha la sua ragione ("il posto torna libero", "il
  barbiere deve sapere chi chiamare").
- Italiano del salone: sfumatura (mai "fade"), panno caldo (mai "hot towel"),
  contorno, collo e basette, rialzo non serve a vista.
- Niente anno di fondazione in evidenza: il 2017 compare solo nella frase di
  storia del pannello.

---

## Richieste ad altri agent

- **scaffold-engineer**: non creare `content/listino.ts` (tech-architect §3):
  prezzi e durate stanno solo in `content/prezzi.ts`. Il tipo `Servizio` di
  `state/store.ts` può essere `export type { Servizio } from
  '../content/prezzi'`. `core/links.ts` legge da `LINK` di `testi.ts`.
  `index.html`: `<title>` = `META.title`, description = `META.description`.
  Chiavi di `Scrittura.errori` nello store: i valori sono `ChiaveErrore`
  (`servizioVuoto`, `nomeVuoto`, `telefonoVuoto`, `telefonoNonValido`); il
  "preso" usa `ERRORI_CON_LINK.preso`.
- **section-builder-lista**: l'agenda legge `ORARI` (fine intervallo esclusa,
  pranzo solo tra due intervalli, sabato senza pranzo),
  `NOMI_PER_SPECCHIO[indice]`, `NOMI_VIETATI`, `SERVIZI[s].mezzore`.
- **section-builder-vetro**: prezzi con `VETRO_LISTINO.prezzo(id)` (a vista)
  e `prezzoSr(id)` (in `.ctp-sr`, dopo il numero); nessun puntino tra voce e
  prezzo (ux 5.2).
- **photo-editor**: `INFORMAZIONI.riflesso` descrive le foto come "le
  poltrone in fila, la mensola, la porta sulla via"; se le foto scelte
  mostrano altro, dimmelo e cambio la frase. `INFORMAZIONI.foto(autore)` usa
  il campo `autore` di `assets/foto/index.ts`.
- **seo-engineer**: `META` è pronto; JSON-LD WebPage/CreativeWork di Ciceri
  Lab, mai LocalBusiness.
