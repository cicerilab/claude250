# Copywriter · Concept 19 · NODI, liuteria (Pordenone)

Ondata 2. File miei: `src/pages/concepts/nodi/content/testi.ts`,
`src/pages/concepts/nodi/content/listino.ts`, questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`,
riga 19 di `docs/matrice-concept-11-20.md`, e in `concepts/19-nodi/docs/`:
`creative-director.md`, `brand-strategist.md`, `ux-architect.md` (tutti gli
stati V0-V13, R0-R8, T0-T10), `tech-architect.md` (§3, §4, §6, §7),
`trend-researcher.md` (§2.2 verifiche sulle fonti, P1, P3, P10, R10).
Formato di riferimento: `concepts/10-torchio/.../content/testi.ts` e
`docs/copywriter.md` del pilota.

Controlli fatti sui due file:
- `tsc` con `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `exactOptionalPropertyTypes`, `verbatimModuleSyntax`: verde.
- Eseguito il file compilato con Node: frasi composte lette una per una
  (lista, successo per viola e violino, valuetext, annunci, riparazioni).
- Ricerca automatica: nessun `—` `–` `…`, nessun `!` nei testi, nessun "01 ·",
  nessun "scorri", nessuna parola della lista "da evitare" del
  brand-strategist (§4). "anima" solo nelle riparazioni. Due soli "·":
  `META.title` e `VETRINA.subtitle`.
- Nessun numero di telefono né email a vista: solo "Chiama", "Scrivi",
  "chiamaci" come link; i dati di esempio stanno solo negli `href`.

---

## 1. Come si usa

```ts
import TESTI, { VOCE, PROVA, valuetextRighello, testoDaPezzi } from '../../content/testi';
import { LISTA, STRUMENTI, type Strumento } from '../../content/listino';
```

- Ogni stringa visibile, `aria-label`, alt e annuncio `aria-live` è in
  `testi.ts`. I componenti non scrivono testo; se manca qualcosa si chiede.
- Tutto è `as const`; i nomi delle chiavi sono tipizzati.
- Le frasi con valori (Hz, strumento, zona, data) sono **funzioni** con
  parametri tipizzati. Non calcolano niente: ricevono valori già pronti.
- **Cifre in vernice**: le frasi che mescolano cifre e testo escono anche come
  `Pezzo[]` (`{ t: string; cifra?: true }`). Il componente rende ogni pezzo con
  `cifra` in uno span vernice e il resto in tè; `testoDaPezzi()` dà la frase
  intera per aria e annunci. Usati in: `VOCE.lista.pezzi`,
  `VOCE.lista.giaInLista`, `VOCE.successo.prima`,
  `COSTRUIRE.strumenti[].prezzoPezzi` e `mesiPezzi`.
- Aiuti esportati: `euro(9500)` → "9.500 €", `prezzoDa(150)` → "da 150 €",
  `hz(168)` → "168 Hz", `hertz(168)` → "168 hertz" (per i lettori di
  schermo), `sabatoInParole(3, 10, oggi?)` → "sabato 3 ottobre" / "oggi,
  sabato 3 ottobre", `sabatoDaIso('2026-10-10')`.
- `listino.ts` ha i tipi del tech-architect §6.4 esatti (`Strumento`,
  `VoceListino`, `PostoInLista`, `Riparazione`, `STRUMENTI`, `LISTA`,
  `RIPARAZIONI`, `SABATO`, `STRUMENTI_ANNO`) più: `Modo`, `ZonaVoce`,
  `IdRiparazione`, `ORDINE_STRUMENTI`, `VARIANTI`, `SERVIZIO`,
  `RIPARAZIONI_VIOLONCELLO`, `SABATI_FESTIVI`, `MISURE`. `VoceListino` ha in
  più il campo `acconto`.

---

## 2. Mappa delle chiavi di `testi.ts`

| Esportazione | Chi la usa | Chiavi principali |
|---|---|---|
| `META` | scaffold (`<title>`, description), SEO | `title`, `description`, `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA` | voce `CONCEPTS` del sito vero (solo proposta) | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri[]` |
| `COMUNI` | tutti | `marchio`, `marchioSotto`, `laVoce`, `laVoceAria`, `nuovaScheda`, `circa`, `ivaInclusa`, `erroreSr` |
| `SALTI` | scaffold | `contenuto`, `voce` |
| `SEZIONI`, `NOME_DEL_MODO` | tutti | per id (`inizio`…`piede`): `nome`, `breve`, `modo` |
| `INDICE` | righello (indice) | `navAria`, `voci[]` (`id`, `href`, `etichetta`, `modo` a vista aria-hidden, `aria` nome completo) |
| `TESTATA` | apertura (testata e menu) | `marchioAria`, `menuAria`, `menuPannelloAria` |
| `PROVA` | righello | `sezioneAria`, `cursoreAria`, `valore(hz)`, `spento`, `nomeModo(m)`, `taccaTrovato(m)`, `laTuaVoce(hz)`, `laTuaVoceBreve`, `scorciatoie.{gruppoAria, voci[]}`, `suono.{nome, acceso, spento, nota}`, `rimetti`, `altriModi`, `banda` |
| `valuetextRighello(hz, modo, { coda?, tuaVoce? })` | righello / `useRighello` | vedi §4 |
| `FIGURE`, `GUARDA` | palco, legni, costruire, voce | per modo: la figura in parole; la frase "guarda" sotto il titolo |
| `TAVOLA` | palco (descrizione `aria-live`) | `riposo`, `modo(m, hz)`, `spenta`, `rimesse`, `tornaAllaProva(hz)` |
| `FERMI_ALT` | palco, fallback, modalità bassa | `vuota`, `riposo`, `modo1`, `modo2`, `modo5` |
| `FOTO_ALT`, `ChiaveFoto` | photo-editor, sezioni | `legni`, `costruire`, `bottega`, `dettaglio`, `abeteMacro` |
| `APERTURA` | apertura | `titolo` (h1), `frase`, `bottone`, `bottoneAria` |
| `LEGNI`, `PAROLE_DEL_MESTIERE` | legni | `titolo`, `guarda`, `misure[]` (`circa`, `valore`, `unita`, `sotto`, `aria`), `paragrafi[]`, `giunta`, `foto`, `paroleTitolo`, `parole[]` (`parola`, `vuolDire`) |
| `COSTRUIRE`, `STRUMENTI_NOMI` | costruire, voce | `intro`, `strumenti[]` (`nome`, `prezzo`, `prezzoPezzi`, `mesi`, `mesiPezzi`, `riga`, `aria`), `incluso`, `ivaInclusa`, `mesiNota`, `comeFunzionaTitolo`, `passi[]`, `ripensamento`, `apertura`, `varianti`, `nonFacciamo`, `parole[]`, `foto`, `link` |
| `ZONE` | voce | per zona: `breve`, `frase`, `dallaVoce` |
| `VOCE` | voce | vedi §3 |
| `RIPARAZIONI_SEZIONE`, `RIPARAZIONI_TESTI` | riparazioni | `titolo`, `spento`, `cosaTitolo`, `voci[]` (`nome`, `spiega`, `prezzo`, `tempo`, `vernice`, `aria`), `violoncello`, `prezzoPrima`, `restauro`, `prestito`, `nonFacciamo`, `sabatoTitolo`, `sabatoTesto`, `sabatoIrene` |
| `SABATI` | riparazioni (form) | vedi §3 |
| `BOTTEGA` | bottega | `chi`, `storia`, `nome`, `foto`, `indirizzo.{riga1, riga2, aria, descrizione, parcheggio}`, `orariTitolo`, `orari[]`, `telefonoOrari`, `chiama`, `scrivi`, `maps` (`testo`, `aria`, `href`), `recapitiNota` |
| `PIEDE` | piede | `conceptDi`, `finzione`, `simulazione`, `fotoPrima`, `fotoFonte`, `fotoAria(autore)`, `senzaFoto`, `laVoce`, `dimentica`, `dimenticaAiuto`, `dimenticato` |
| `RECAPITI` | bottega, form | `indirizzoRiga*`, `chiama*`, `telefonoHref`, `scrivi*`, `emailHref`, `maps*`, `nota` |
| `ANNUNCI` | tutte le regioni `aria-live` | vedi §3 |
| `TESTI` | default export | tutto quanto sopra |

---

## 3. Stati della prenotazione: dove sta ogni frase

### 3.1 La voce che vorresti (ux §6.1)

| Stato | Chiavi |
|---|---|
| V0 prima del montaggio | come V1 + `VOCE.invio.primaDelMontaggio` ("Oppure chiamaci", link `tel:`) |
| V1 vuoto | `VOCE.intro`, `VOCE.strumento.legenda`, `VOCE.strumento.radio.*`, `VOCE.piano.invito`, `VOCE.piano.assi.*`, `VOCE.piano.zona('equilibrata')`, `VOCE.piano.onesta`, `VOCE.piano.hutchins` (facoltativa), `VOCE.chi.*`, `VOCE.lista.pezzi(s)`, `VOCE.invio.bottone`, `VOCE.invio.nota` |
| V2 strumento cambiato | `VOCE.lista.pezzi(s)`; annuncio `ANNUNCI.strumento(s)` |
| V3 voce in scelta | `VOCE.piano.zona(z)` a vista; al rilascio `ANNUNCI.zona(z, hz)`; range: `VOCE.piano.rangeX/rangeY`, `valuetextX/Y(0..100)`; foglia: `fogliaAria`, `roledescription`, `istruzioni` |
| V4 nota d'esempio | `VOCE.nota.bottone`, `bottoneAria`, `ferma`, `quale(s)` (facoltativa), `didascalia`, `volume` |
| V5 errore | `VOCE.errori.nome`, `contattoVuoto`, `emailSenzaChiocciola`, `emailSenzaDominio`, `telefonoCorto`; prima del messaggio `COMUNI.erroreSr` in `.nod-sr`; all'invio `ANNUNCI.erroriVoce([...VOCE.errori.campi.*])` |
| V6 invio in corso | `VOCE.invio.inCorso` (il bottone va dimensionato su questa, la più lunga); `ANNUNCI.invioVoce` |
| V7 successo | `VOCE.successo.prima(s)` (pezzi), `seconda(s, z)`, `terza(s)`, `cambia`, `concept`; tacca `PROVA.laTuaVoce(hz)`; annuncio `ANNUNCI.successoVoce(s, z)` |
| V8 fallito | `VOCE.fallito.prima` + link `VOCE.fallito.link` (`linkAria`, href `RECAPITI.telefonoHref`) + `VOCE.fallito.dopo`; annuncio `ANNUNCI.fallitoVoce` |
| V9 cambia la voce | `VOCE.lista.giaInLista(s)` al posto della lista; annuncio `ANNUNCI.cambiaVoce` |
| V10 ritorno | come V7 (le tre righe non contengono dati personali) |
| V11 senza memoria | nessun testo |
| V12 senza WebGL | come sopra; in modalità bassa `VOCE.piano.zonaConHz(z, hz)` e `FERMI_ALT.modo5` |
| V13 senza audio | `VOCE.nota.senzaAudio` al posto del bottone |

Il contatore della nota: `VOCE.chi.contatore(rimasti)`, a vista solo sopra i
120 caratteri (`VOCE.chi.notaMax` = 140).

### 3.2 Il sabato di bottega (ux §6.2)

| Stato | Chiavi |
|---|---|
| R0 prima del montaggio | `SABATI.primaDelMontaggio` |
| R1 vuoto | `SABATI.legenda`, `SABATI.sabato(g, m, oggi)` per ogni radio, `SABATI.fascia` (aria: `fasciaAria`), `problema`, `problemaAiuto`, `nome`, `telefono`, `telefonoAiuto`, `invio` |
| R2 sabato scelto | nessun testo nuovo |
| R3 errore | `SABATI.errori.sabato`, `problema`, `nome`, `telefonoVuoto`, `telefonoCorto`; all'invio `ANNUNCI.erroriSabato([...SABATI.errori.campi.*])` |
| R4 in corso | `SABATI.inCorso` ("Un momento"); `ANNUNCI.invioSabato` |
| R5 fallito | `SABATI.fallito.prima/link/dopo`; `ANNUNCI.fallitoSabato` |
| R6 successo | `SABATI.successo(sabatoDaIso(iso))`, `SABATI.saluto` ("Mandi, Irene", l'unico "Mandi" del sito), `SABATI.concept`, `SABATI.altro`; annuncio `ANNUNCI.successoSabato(...)` |
| R7 altro sabato | `ANNUNCI.altroSabato` |
| R8 ritorno | `SABATI.ritorno(sabatoDaIso(iso))` |

### 3.3 La tavola e il righello (ux §3.3)

T0-T2: `TAVOLA.riposo` (testo fisso della descrizione, non annunciato).
T4: `TAVOLA.modo(m, hz)`. T8: `TAVOLA.spenta`. T9: `TAVOLA.rimesse`.
Dalla coda: `TAVOLA.tornaAllaProva(hz)`. T7 usa `ANNUNCI.invioVoce`.
Menu: `ANNUNCI.menuAperto` / `menuChiuso` (facoltativi: il disclosure si
annuncia già con `aria-expanded`).

---

## 4. Scelte e numeri

- **h1**: "Ascoltiamo il legno prima di chiuderlo." (39 caratteri, due righe a
  384 e a 335 px, richiesta dell'ux). La frase d'esempio del creative-director
  ne aveva 63. Il messaggio chiave torna nel successo: "Prima di chiuderlo,
  lo ascoltiamo insieme." (con "chiuderla, la" per la viola).
- **Frase dell'apertura**: 17 parole, dice chi, cosa e dove, e spiega l'oggetto
  ("ogni tavola passa sotto le foglie di tè").
- **Figure dei modi**: seguo le verifiche del trend-researcher su Jansson
  (cap. 5), non la tabella 2.1 del creative-director: il modo 2 della tavola
  di abete sono **due linee lungo la tavola che si avvicinano tra le effe
  senza toccarsi** (la X è del fondo di acero); il modo 5 è **un anello
  dentro il bordo che si apre all'altezza delle C**. Un liutaio se ne
  accorgerebbe. Le frasi stanno in un punto solo, `FIGURE`, da cui escono
  annunci, alt dei fermi e "guarda": se il webgl-artist ottiene figure
  diverse, si cambia lì.
- **"circa 70 g"**: non verificato sulle fonti, quindi presentato come "il
  peso della nostra tavola d'esempio, con la catena". Gli Hz di Legni portano
  la tolleranza "nelle tavole vere tra 80 e 100" (trend-researcher P3).
- **Frequenze**: 92 / 168 / 348 Hz, voce 330-366 Hz (`MISURE` in
  `listino.ts`, uguali a `risonanza/modi.ts` e `motion/percorso.ts`). Nei
  testi sempre "circa"; il valore del righello è una lettura, senza "circa".
- **Prezzi e lista**: quelli del brand-strategist §7 così come sono. Lista
  unica: numero 7 per tutti gli strumenti, cambia la consegna (violino
  primavera 2028, viola estate 2028, violoncello autunno 2028). Nei
  wireframe dell'ux c'erano 7/4/3: prevale il brand-strategist.
- **Riparazioni**: elenco corto di 8 voci (brand §5.5, ux §5.5) con la
  ricrinatura dell'archetto (trend-researcher P10). In vernice solo
  ponticello e crepa (`vernice: true`), gli altri prezzi in tè. Il
  violoncello in una riga a parte.
- **Orari**: brand-strategist §9 (sabato 9:00-12:30 senza appuntamento,
  martedì-venerdì su appuntamento 15:00-18:30, telefono martedì-sabato
  9:00-12:00). Nel wireframe dell'ux c'erano orari diversi: prevale il brand.
- **"archetto"** ovunque per l'oggetto (come CD e ux); "sotto l'arco" solo nel
  modo di dire dei musicisti.
- **Id delle sezioni**: quelli del tech-architect (`inizio`, non `riposo`).
- **Piede**: "Un concept di Ciceri Lab." è testo, non link (ux §5.7);
  Chladni nominato una volta sola, qui; la riga onesta sulle risonanze
  allargate (CD §2.2 regola 4) sta nel piede e, facoltativa, in
  `PROVA.banda`.
- **Sabati festivi**: `SABATI_FESTIVI` in `listino.ts` ("MM-DD", tutti i
  festivi nazionali fissi); nessuna ferie inventata.

---

## 5. Lunghezze (per 375 px)

| Testo | Lunghezza | Note |
|---|---|---|
| `APERTURA.titolo` | 39 caratteri | 2 righe a 34 px |
| `APERTURA.frase` | 17 parole, 97 caratteri | 3 righe a 17 px |
| `GUARDA[m]` | 12-13 parole | 2 righe |
| `ZONE[z].frase` | 70-100 caratteri | 2-3 righe sotto il piano |
| `VOCE.invio.inCorso` | 20 caratteri | il bottone si dimensiona su questa |
| `SABATI.invio` | 17 caratteri | "Un momento" ci sta dentro |
| `INDICE.voci[].etichetta` | max 20 caratteri ("La voce che vorresti") | colonna del banco 164 px a 15 px: 1 riga |
| `META.title` / `description` | 40 / 153 caratteri | |

---

## Richieste ad altri agent

- **creative-director**: aggiornare la tabella 2.1 e il 4.8 con le figure
  corrette dal trend-researcher (modo 2 a due linee, modo 5 aperto alle C).
  I testi sono già scritti così.
- **webgl-artist**: le figure calcolate devono essere quelle di `FIGURE` in
  `testi.ts`; se l'anello del modo 5 viene chiuso o le linee del modo 2 si
  toccano, dirmelo e cambio la frase.
- **photo-editor**: gli alt delle foto sono in `FOTO_ALT` per chiave
  (`legni`, `costruire`, `bottega`, `dettaglio`, `abeteMacro`); in
  `assets/foto/index.ts` usa queste chiavi. Se la foto scelta mostra altro,
  chiedimi la correzione invece di scrivere un alt nuovo. I crediti nel
  piede usano `PIEDE.fotoPrima` + autore + `PIEDE.fotoFonte`.
- **scaffold-engineer**: lo store può importare `Modo` e `ZonaVoce` da
  `content/listino.ts` invece di ridefinirli (sono identici al §6.1);
  `selPostoInLista` legge `LISTA`. Le regioni `aria-live` prendono i testi da
  `ANNUNCI` e `TAVOLA`.
- **section-builder-voce**: il bottone di invio ha larghezza minima pari a
  "Ti mettiamo in lista"; le cifre in vernice con `Pezzo[]`; gli errori con
  `COMUNI.erroreSr` in `.nod-sr` prima del messaggio.
- **section-builder-riparazioni**: `sabati.ts` salta `SABATI_FESTIVI` e,
  se oggi è sabato prima delle 12:30, passa `oggi = true` a
  `SABATI.sabato(...)`.
