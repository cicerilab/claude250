# Copywriter · Concept 17 · MADRE, panificio e pasticceria (Pordenone)

Ondata 2. File miei: `src/pages/concepts/madre/content/testi.ts`,
`src/pages/concepts/madre/content/prezzi.ts`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`concepts/10-torchio/docs/integrazione-sito.md`, riga e paragrafo 17 di
`docs/matrice-concept-11-20.md`, tutti i doc dell'ondata 1 in
`concepts/17-madre/docs/` (creative-director, brand-strategist, ux-architect,
tech-architect, trend-researcher P9-P10), `concepts/10-torchio/.../content/testi.ts`
e il doc del copywriter di 20 IMBRUNIRE solo come formato. `DESIGN.md` non
c'era ancora: ho controllato i glifi sui due font fissati dal creative-director.

Controlli fatti:
- `tsc` 5.6.3 con `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitReturns`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`: verde sui due file.
- Scansione di tutte le 636 stringhe (script che percorre ogni esportazione)
  più ~60 frasi composte dalle funzioni con dati di prova: nessun trattino
  lungo o medio, nessun punto esclamativo, nessun "...", un solo "…"
  (`INVIO.inCorso`, "Un momento…", voluto dal creative-director §4.4).
- Nessuna parola delle liste vietate (brand-strategist §4 e §6, CD §4.7):
  esperienza, passione, genuino, fragrante, digeribile, sano, abbonamento,
  carrello, "appena sfornato", "cosa c'è adesso", "prenota per domani", "la
  notte", "Scorri", levain, baguette, croissant, specialità, delizie. "Leggero"
  compare solo in "segno leggero" (la fossetta, parole del CD), mai sul cibo.
- Glifi: tutti i caratteri usati (à è È ì ù € … · e lo spazio che non va a capo
  di Intl) sono presenti nei file latin di **Bricolage Grotesque** e **Karla**
  scaricati da Google Fonts (cmap verificata con fontTools). Nessuna freccia
  scritta come testo: "Apri in Maps", "Vai all'invio", "leggi tutto" hanno le
  icone del vector-artist.
- Nessun numero di telefono o email a vista: solo i link "Chiama", "Scrivi",
  "chiamaci" con `aria-label` che dice "(numero di esempio)".

---

## 1. Come si usa

```ts
import TESTI, { FRASE, ANNUNCI, ERRORI, PANE_FISSO, giorniAbituali } from '../../content/testi';
import { PANI, PANI_PER_ID, DOLCI, PASTE, VASSOI, euro } from '../../content/prezzi';
```

- Ogni stringa visibile, `aria-label`, `alt`, annuncio `aria-live`, meta è in
  `testi.ts`. I componenti non scrivono testo. Anche gli `alt` delle foto sono
  qui (`FOTO_ALT`, come chiede il tech-architect §6.8).
- Nomi, righe, prezzi, giorni e regole dei prodotti sono in `prezzi.ts` (una
  sola fonte, tech-architect §6.6): il nome sul cartellino è `PANI_PER_ID[id].nome`,
  le due righe sono `righe`, i giorni a vista sono `giorniTesto`.
- Tutto è `as const` / `readonly`; le tabelle per id sono
  `satisfies Record<IdPane | IdDolce | IdPasta | IdGiorno | IdBanco | IdFoto, …>`:
  se un id cambia, il build si rompe qui.
- **Le funzioni non calcolano prezzi.** I totali arrivano da
  `state/settimana.ts` come `TotaliFrase = { pane, vassoio }` (vedi §3). Le
  funzioni fanno solo lingua: giorni, articoli, generi, plurali.
- **Le date entrano già scritte** da `core/oggi.ts` ("martedì 6 ottobre") più
  il loro `IdGiorno`: serve per dire "dalle 7" o, la domenica, "dalle 7.30".
- I tipi in ingresso (`SettimanaTesti`, `VassoioTesti`, `ErroreTesti`) hanno la
  stessa forma di `Settimana`, `Vassoio`, `ErrorePaneFisso` dello store: si
  passano così come sono, senza conversioni. `IdBanco`, `IdFoto`,
  `CodiceErrore` sono ridefiniti identici in `testi.ts` (non esportati) perché
  lo store e le foto ancora non esistono.

### Aiuti di lingua esportati

| Funzione | Esempio |
|---|---|
| `giorniAbituali(giorni)` | `['mar','ven']` → "il martedì e il venerdì"; `mar…dom` → "dal martedì alla domenica"; `['mar','mer','gio','sab']` → "dal martedì al giovedì e il sabato" |
| `giorniBrevi(giorni)` | "mar e ven", "da mar a sab" (barra su 375) |
| `elenco(voci)` | "bignè, diplomatiche e sfogliatine" |
| `elencoPaste(ids)` | come sopra, dagli id |
| `inParole(n)`, `pezzi(n, aParole)` | "due"; "1 pezzo", "un pezzo", "tre pezzi" |
| `alChilo(n)` | "5,80 € al chilo" |
| `maiuscola(s)` | inizio frase |
| `euro(n)` (in `prezzi.ts`) | "5,80 €", "13,00 €" (Intl it-IT, formattatore creato alla prima chiamata) |
| `ancheDomenica(id)` | true per pagnotta e ciabatta |

I giorni si dicono **all'abituale** ("il martedì", "la domenica"): è come si
dice in italiano una cosa che si ripete ogni settimana, cioè il pane fisso.

---

## 2. Mappa delle chiavi

| Esportazione | Chi la usa | Chiavi |
|---|---|---|
| `META` | `Madre.tsx`, seo-engineer | `title` (56 car.), `description` (145), `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA_SITO` | voce `CONCEPTS` di `src/content/site.ts` al porting | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri` |
| `COMUNI` | ovunque | `marchio`, `marchioSotto`, `ilPaneFisso`, `tieniDaParte`, `nuovaScheda`, `erroreSegno`, `erroreSr`, `chiudi` |
| `SALTI` | `Madre.tsx` | `paneFisso` (primo del fuoco), `contenuto` |
| `RECAPITI_TESTI` | `core/links.ts`, bottega, dolci, pane fisso | `chiama`, `chiamaAria`, `chiamaci`, `chiamaciAria`, `scrivi`, `scriviAria`, `nota` |
| `TESTATA` | impasto (`Testata.tsx`) | `navAria`, `marchioAria`, `voci[3]`, `paneFisso`, `paneFissoAria`, `seiQui` ("sei al pane fisso") |
| `BANCHI`, `ORDINE_RIGA_BANCHI`, `RIGA_BANCHI` | bancone (`Etichette.tsx`) | per `IdBanco`: `riga`, `href`; `aria` ("Il bancone"), `conteggio(n)`, `paneFissoAria(n)` |
| `IMPASTO` | impasto | `titolo` (h1), `riga`, `rigaDopoInvio(nome)`, `paneFisso`, `paneFissoAria`, `provaAria`, `provaIstruzioni`, `spiegazione`, `punti`, `ordinePunti`, `puntoAria(p)` |
| `VETRINA` | `vetrina/Vetrina.tsx` | `aria` ("La vetrina") |
| `BANCO_PANE` | pane, `Prodotto` | `titolo`, `intro`, `dt`, `pezzo(p)`, `alChilo(pane)`, `giorni(pane)`, `domenica`, `azione`, `scelto(id)`, `azioneAria(id, premuto)` |
| `LA_MADRE` | la-madre | `titolo`, `frasi[3]` |
| `BANCO_DOLCI` | dolci | `titolo`, `intro`, `dt`, `pezzo(p)`, `alChilo(n)`, `intero.{titolo, testo, chiama…, scrivi…}` |
| `DOMENICA` | domenica | `titolo`, `intro`, `quante`, `azione`, `azioneAria(id)`, `vassoio.{aria, misto, conPaste(ids)}`, `misura(m)`, `alChilo`, `troppe`, `paneFisso`, `paneFissoAria` |
| `PANE_FISSO` | pane-fisso | `titolo`, `intro`, `come.{tocco, puntatore}`, `rassicurazioni[3]`, `regole[4]`, `bozza`, `fila`, `mano`, `settimana`, `riga`, `vassoio` (vedi §4) |
| `FRASE` | pane-fisso (`frase.ts`, `Frase.tsx`, barra) | vedi §3 |
| `INVIO`, `PrimoRitiro` | pane-fisso (`Invio.tsx`, `Esito.tsx`) | `legenda`, `nome.*`, `contatto.*`, `bottone`, `inCorso`, `demo`, `successo.*`, `fallito.*`, `noscript.*` |
| `BARRA` | pane-fisso (375) | `aria`, `vaiInvio`, `vaiInvioAria`, `leggi`, `leggiAria`, `chiudi`, `chiudiAria` |
| `ICS` | pane-fisso (`ics.ts`) | `nomeFile`, `prodid`, `titoloPane(ids)`, `titoloVassoio`, `descrizione(giorno)`, `luogo` |
| `BOTTEGA` | bottega | `titolo`, `indirizzo[2]`, `maps`, `mapsAria`, `mapsQuery`, `orariTitolo`, `orari[4]` (`giorni`, `ore` per il `dl`), `chi`, `parcheggio`, `nonFacciamoTitolo`, `nonFacciamo[4]`, `chiama…`, `scrivi…`, `recapitiNota` |
| `PIEDE` | bottega (`Piede.tsx`) | `aria`, `paneFisso`, `paneFissoAria`, `ricomincia.*`, `creditiTitolo`, `credito(id, autore, licenza)`, `creditoAria(id)`, `licenzaAria(l)`, `finzione`, `conceptDi`, `mandi` |
| `FOTO_ALT`, `FOTO_SOGGETTO` | `Prodotto`, la-madre, domenica, piede | per `IdFoto` |
| `ERRORI` | store (annunci), pane-fisso (scomparti) | `messaggio(e)` per codice, `durataMs` (6000) |
| `ANNUNCI` | azioni dello store via `annuncia()` | vedi §5 |
| `GIORNI`, `PAROLE_*` | chi compone frasi | nome, breve, abituale, generi, plurali, pesi, frequenze |
| `TESTI` (default) | tutto in un oggetto | `type Testi` |

Etichette accessibili: ogni `aria-label` **comincia con il testo visibile**
(WCAG 2.5.3): "Il pane fisso: fai la tua settimana", "Nel pane fisso: segale e
cumino", "Scelta: segale e cumino, nel pane fisso", "Metti qui la segale, il
martedì", "Chiama la bottega (numero di esempio)".

---

## 3. La frase che si scrive da sola

`frase.ts` (section-builder-pane-fisso) passa i dati dello store e i totali;
la lingua la fa `FRASE`.

| Funzione | Cosa rende |
|---|---|
| `FRASE.intera(settimana, vassoio, totali)` | la frase intera, oppure `FRASE.vuota` |
| `FRASE.pane(settimana)` | solo i pani |
| `FRASE.vassoio(vassoio)` | solo il vassoio |
| `FRASE.cifra(totali, vassoio)` | solo la cifra (anche per l'annuncio con debounce) |
| `FRASE.breve(settimana, vassoio)`, `FRASE.cifraBreve(totali, vassoio)` | le due righe della barra chiusa su 375 |
| `FRASE.primoRitiro(data, giorno, soloVassoio)` | "Il primo sacchetto è pronto martedì 6 ottobre, dalle 7." |
| `FRASE.sceltiDalBancone(ids)` | "Hai scelto la segale e la pagnotta sul bancone: mettile nei giorni." |
| `FRASE.sospendi` | "Lo sospendi quando vuoi, con un messaggio o una telefonata." |

`TotaliFrase = { pane, vassoio }`: `pane` = somma dei pani di una settimana
(prezzo della pezzatura per quantità), `vassoio` = prezzo di **un** vassoio
(da `VASSOI`), 0 se non c'è.

Regole (dall'ux §5.8, con due scelte mie):
- Le righe uguali (stesso pane, pezzatura, quantità) dei vari giorni diventano
  una voce sola; le voci vanno nell'ordine della settimana (il loro primo
  giorno), così si legge come una settimana: prima il martedì, poi il sabato.
- Tre o più giorni di fila: "dal martedì al giovedì". Uno o due: "il martedì e
  il venerdì".
- Quantità > 1 a parole e al plurale: "due ciabatte", "tre pani di segale".
- **La pezzatura si dice sempre per la pagnotta** (l'unico pane con due
  misure): "la pagnotta da mezzo chilo", "da un chilo". L'ux chiedeva di dirla
  solo se non è la più piccola, ma "la pagnotta il sabato" non dice quanto
  pesa, e la cifra senza peso non si capisce. Gli altri pani hanno una misura
  sola e non la ripetono.
- Voci separate da virgole; se una voce ha già una virgola dentro ("il
  martedì, il giovedì e il sabato") le voci si separano col punto e virgola.
- Cifra sempre "Circa … €" e sempre "si paga al ritiro". Vassoio "una domenica
  sì e una no": due cifre, mai una media.

Esempi verificati (prezzi del brand-strategist §7):

```
La tua settimana: la segale il martedì e il venerdì, la pagnotta da un chilo il sabato.
Il vassoio da 750 g ogni domenica, misto. Circa 38,50 € a settimana, si paga al ritiro.

La tua settimana: la ciabatta la domenica. Il vassoio da 750 g una domenica sì e una no,
con bignè, diplomatiche e sfogliatine. Circa 1,50 € a settimana di pane, più 25,50 € il
vassoio ogni due domeniche. Si paga al ritiro.

La tua settimana: due ciabatte dal martedì al giovedì e il sabato; l'integrale il martedì,
il giovedì e il sabato; il filone il mercoledì; ... Circa 30,00 € a settimana, si paga al ritiro.

barra 375: "segale mar e ven, pagnotta 1 kg sab, vassoio 750 g dom" / "circa 38,50 € a settimana"
```

La cifra del creative-director ("circa 21,40 €") non torna con i prezzi 2026:
con la sua stessa settimana fa 38,50 € (richiesta del brand-strategist,
accolta).

---

## 4. Il pane fisso: stati e microcopy

Tutti gli stati dell'ux §5.8, con la chiave da usare.

| Stato | Testo | Chiave |
|---|---|---|
| Vuoto | "La tua settimana è ancora vuota: comincia da un pane." + scomparti "qui il tuo pane" + fantasma "per esempio: la segale" | `FRASE.vuota`, `PANE_FISSO.settimana.vuoto`, `.esempio(id)` |
| Con scelte dal bancone | "Hai scelto la segale sul bancone: mettila nei giorni." (genere e numero giusti) | `FRASE.sceltiDalBancone(ids)`, `PANE_FISSO.fila.sceltoSulBancone(id)` |
| Bozza ritrovata | "Abbiamo tenuto la tua settimana di prima." + "Ricomincia" | `PANE_FISSO.bozza` |
| Pane in mano | "scegli i giorni" sul gettone; giorni "si fa" o "la segale si fa solo il martedì e il venerdì"; su 375 "In mano: segale" + "posala" | `fila.inMano`, `settimana.siFa`, `settimana.nonSiFa(id)`, `mano.*` |
| Bottone del giorno | "metti qui"; senza pane in mano "Prendi prima un pane" | `settimana.mettiQui`, `.prendiPrima`, `.giornoAria(g, id, valido)` |
| Lunedì / domenica | "lunedì siamo chiusi"; "solo pagnotta, ciabatta e vassoio, fino alle 12.30" | `settimana.lunedi`, `.domenica` |
| Riga nel giorno | gruppo "Segale e cumino, il martedì"; "Uno in meno" / "Uno in più" | `riga.*` |
| Errori per codice | giorno sbagliato, lunedì, domenica, oltre 6 pezzi, quinta pasta, settimana vuota | `ERRORI.messaggio(e)` |
| Vassoio fuori dalla domenica | "Il vassoio è solo la domenica." | `PANE_FISSO.vassoio.soloDomenica` |
| Blocco vassoio | "Quanto" (500 g / circa 12 paste, 17,00 €), "Quando", "Quali paste", "misto", "Togli il vassoio" | `PANE_FISSO.vassoio.*` |
| Campi | "Nome per il sacchetto", "Telefono o email", aiuti ed errori sotto il campo | `INVIO.nome.*`, `INVIO.contatto.*` |
| Invio in corso | "Un momento…" | `INVIO.inCorso` |
| Successo | "Fatto, Marta. Da martedì 6 ottobre la tua segale è pronta col tuo nome sul sacchetto, dalle 7." + "Aggiungi al calendario", "Cambia la settimana" | `INVIO.successo.frase(nome, primoRitiro)` |
| Da parte (ritorno) | "La tua settimana è da parte, Marta."; nell'impasto "Il tuo pane è da parte, Marta." | `INVIO.successo.daParte`, `IMPASTO.rigaDopoInvio` |
| Cambia la settimana | "Riscrivi il telefono o l'email: non lo teniamo salvato."; al nuovo invio "Aggiornato, Marta. Da … vale la settimana nuova." | `INVIO.contatto.riscrivi`, `INVIO.successo.aggiornato` |
| Invio fallito | "Non è partito. Riprova, o [chiamaci]." + "La tua settimana è ancora qui, com'era." | `INVIO.fallito` (prima + link + dopo) |
| Calendario che non scarica | "Apri il file del calendario" | `INVIO.successo.apriFile` |
| Senza JavaScript | "Il pane fisso si fa con due tocchi, ma qui serve JavaScript. Oppure [chiamaci]." | `INVIO.noscript` |

`INVIO.successo.frase` sceglie da sola: un pane ("la tua segale è pronta"),
più pani ("il tuo pane è pronto"), solo vassoio ("il tuo vassoio è pronto col
tuo nome sopra, dalle 7.30"), pane e vassoio la domenica.

`INVIO.demo` ("È un concept: nessun ordine parte davvero e il contatto non
esce da questa pagina.") va sotto il bottone, piccola: chiediamo un telefono a
chi prova il concept, ed è giusto dirgli che non va da nessuna parte.

---

## 5. Annunci `aria-live`

Una sola regione (`core/annunci.ts`); le azioni dello store chiamano queste
funzioni, i componenti non ripetono.

| Azione | Annuncio |
|---|---|
| prima prova del dito | `ANNUNCI.provaDito` (una volta per visita) |
| cambio punto da tastiera | `ANNUNCI.puntoProva(p)` |
| "Nel pane fisso" | "Segale scelta per il pane fisso." / "Segale tolta dal pane fisso." |
| "Sul vassoio" | "Bignè sul vassoio." / "Diplomatiche tolte dal vassoio." |
| prendi in mano / posa | "Pan di sorc in mano. Si fa il venerdì e il sabato, da ottobre a Pasqua. Scegli i giorni." / "Filone posato." |
| metti | "Integrale messo il giovedì, 500 grammi." |
| più / meno (debounce 600 ms) | "Segale, il martedì: due pezzi." |
| pezzatura | "Pagnotta, il sabato: un chilo." |
| togli | "Segale tolta dal martedì." |
| errore | `ANNUNCI.errore(e)` = stesso testo dello scomparto |
| vassoio | `vassoioMesso(v)`, `vassoioTolto`, `pesoVassoio(peso)`, `frequenzaVassoio(f)`, `vassoioMisto` |
| frase (debounce 800 ms) | `ANNUNCI.cifra(totali, vassoio)`: solo la cifra |
| invio | `inCorso`, `successo(nome, r)`, `aggiornato(nome, data)`, `fallito`, `settimanaSbloccata` |
| bozza, piede, barra | `bozzaRitrovata`, `bozzaSvuotata`, `ricominciato`, `barraAperta`, `barraChiusa` |

Generi e plurali sono giusti per ogni prodotto (`PAROLE_PANI`, `PAROLE_PASTE`):
segale, pagnotta, ciabatta femminili; integrale, filone, pan di sorc maschili.

---

## 6. Scelte di testo

- **h1** (unico): "premi. se torna su piano piano, è pronto." Quello del
  creative-director: è già la voce del panettiere e insegna il gesto. Riga
  sotto: "Questo è l'impasto della pagnotta. MADRE, panificio e pasticceria a
  Pordenone." (13 parole). Il messaggio chiave non si scrive qui (brand §5.1).
- **Spiegazione** dopo la prima prova: "Torna su piano piano e lascia un segno
  leggero: è pronto. Il pane di oggi l'abbiamo impastato ieri sera." (105
  caratteri, 3 righe a 375).
- **Madre spiegata alla prima occorrenza** (regola 3 del brand): l'intro del
  pane, che viene prima del banco della madre, dice "Sei pani, tutti dalla
  stessa madre, il lievito che teniamo vivo in bottega. Ognuno ha i suoi
  giorni." Il "rinfresco" è spiegato nel banco della madre, la "carta da
  zucchero" nell'intro della domenica.
- **La madre**: tre frasi, 260 caratteri, un solo numero (18 ore) e la
  conseguenza pratica (dura fino al terzo giorno). Il vasetto da Spilimbergo
  è l'unico pezzo di storia nella vetrina.
- **Dolci**: l'intro dice onestamente che nei lievitati c'è la madre con un po'
  di lievito di birra (brand §1.5). La pinza dice nelle sue righe che non è
  quella veneta dell'Epifania e che si ordina entro il mercoledì santo.
- **"Nel pane fisso"** sul bancone: da scelto il bottone dice "Scelta" o
  "Scelto" secondo il pane (la segale è scelta, il filone è scelto).
- **Prezzi a vista**: "5,80 € al chilo"; pezzi "500 g: 2,90 €",
  "piccola, 500 g: 13,00 €", "un etto: 2,00 €" (i biscotti di frolla si
  chiedono all'etto). Vassoio "500 g, circa 12 paste: 17,00 €".
- **Orari** una volta sola, nella bottega, come lista e a parole ("dalle 7
  alle 13 e dalle 16.30 alle 19.30"), senza trattini.
- **Cosa non facciamo** (brand §1.7) in quattro righe nella bottega: consegne,
  torte a piani, bar e pizza, senza glutine. Non è nel wireframe dell'ux:
  lo propongo al builder della bottega sotto "chi c'è" (vedi Richieste).
- **Friulano**: solo "Mandi." nel piede e i nomi dei prodotti (gubana,
  strucolo, pan di sorc, pinza, esse). Il San Daniele nella riga della
  ciabatta è l'unico nome di luogo in più, ed è quello che si mangia davvero.
- **Indirizzo**: Via Cappuccini 31, 33170 Pordenone (via vera, civico di
  fantasia, non usata dagli altri concept). Maps cerca la via, non
  un'attività. Telefono `0434 000 000` e `bottega@madre.example` solo come dato.
- **Ciceri Lab** scritto staccato, come nel pilota e in `ruoli-agent.md`.

---

## 7. `prezzi.ts` in breve

Tipi e id esattamente quelli del tech-architect §6.6 (`IdPane` con `semola`
per il filone). In più, tutti di sola lettura:
`PANI_PER_ID`, `ORDINE_PANI` (ordine della vetrina: pagnotta, ciabatta,
integrale, segale, filone, pan di sorc), `DOLCI_PER_ID`, `ORDINE_DOLCI`,
`PASTE_PER_ID`, `ORDINE_PASTE`, `ORDINE_GIORNI`, `GIORNO_CHIUSO`,
`PASTE_AL_KG` (34), `PESO_VASSOIO_INIZIALE` (750, come l'azione
`mettiSulVassoio` del tech §6.1), `GIORNI_ANTICIPO_DOLCI` (2), `ORA_PRONTO`
("7", domenica "7.30"), `ORA_PRONTO_ICS`, `ORA_LIMITE_CAMBI` (12),
`MisuraVassoio` (tipo di una voce di `VASSOI`; il nome non è `Vassoio` per non
scontrarsi col `Vassoio` dello store).

`scala` (1 = pagnotta da 1 kg) segue le altezze proposte dall'ux §5.3 e §5.5:
pagnotta 1, integrale 0,83, pan di sorc 0,78, segale 0,69, filone 0,64,
ciabatta 0,56; gubana 0,89, crostata 0,83, pinza 0,72, strucolo 0,56, esse
0,5, biscotti 0,44.

Prezzi: tabella del brand-strategist §7 senza cambi.

---

## Richieste ad altri agent

1. **tech-architect / scaffold-engineer (store)**: l'ux (§1, §5.3, §5.6) vuole
   "Nel pane fisso" e "Sul vassoio" come **interruttori che restano nella
   vetrina** (pani scelti persistiti in `scelti`, numero nella riga dei
   banchi); nel tech §6.1 `nelPaneFisso` fa `prendiInMano` + salto al pane
   fisso e lo store non ha `scelti`. I miei testi seguono l'ux
   (`BANCO_PANE.azioneAria(id, premuto)`, `RIGA_BANCHI.paneFissoAria(n)`,
   `FRASE.sceltiDalBancone`, `ANNUNCI.sceltoDalBancone`). Serve una decisione
   dell'orchestratore; se vale il tech, basta usare `premuto: false` e il
   resto non si rende.
2. **scaffold-engineer (`state/settimana.ts`)**: `totale()` del tech §6.4
   restituisce `{ settimana, mediaConVassoio }`; la frase vuole
   `TotaliFrase = { pane, vassoio }` (l'ux vieta la media per "una domenica sì
   e una no"). Esporre i due numeri separati, o calcolarli in `frase.ts`.
3. **scaffold-engineer (URL)**: l'ux usa `?pane=filone`, l'id è `semola`.
   Accettare entrambi.
4. **scaffold-engineer**: ancora `la-madre` (tech) e non `madre` (ux): i miei
   `href` usano gli id del tech §3.
5. **photo-editor**: gli `alt` sono in `FOTO_ALT`, scritti sulla lista foto del
   creative-director §4.6. Per ogni foto scelta controlla che la frase sia
   vera (per esempio: la segale ha i semini nella mollica? il pan di sorc ha i
   pezzi di fico?) e scrivi nel tuo doc la frase giusta se non lo è: la
   correggo io. L'impasto ha `alt` vuoto (sta sotto il bottone della prova,
   `aria-hidden`); i gettoni del pane fisso usano `alt=""`.
6. **section-builder-pane-fisso**: `frase.ts` chiama `FRASE.intera`,
   `FRASE.breve`, `FRASE.cifraBreve`; `ics.ts` deve fare l'escape di `,` `;`
   `\` nei testi di `ICS` (la descrizione ha virgole); `INVIO.demo` sotto il
   bottone; la riga "Lo sospendi…" (`FRASE.sospendi`) sotto la data del primo
   ritiro.
7. **section-builder-bottega**: blocco `BOTTEGA.nonFacciamo` (4 righe, brand
   §1.7) sotto "chi c'è" a 1440, dopo il parcheggio a 375. Se non ci sta,
   dirlo all'orchestratore prima di toglierlo.
8. **ux-architect / store**: peso iniziale del vassoio. Il tech (§6.1) dice
   750 g, l'ux in due righe dice 500 g. Ho messo `PESO_VASSOIO_INIZIALE = 750`:
   chi crea il vassoio lo legge da lì, così il numero è uno solo.
