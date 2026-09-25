# Copywriter · Concept 10 · IMPRONTA, tipografia e legatoria (Pordenone)

Ondata 2. File miei: `src/pages/concepts/impronta/content/testi.ts`,
`src/pages/concepts/impronta/content/prezzi.ts`, questo documento.

Letti: `docs/processo-agent.md`, `docs/concept-lab.md`,
`concepts/10-torchio/docs/creative-director.md`, `brand-strategist.md`,
`ux-architect.md`, `tech-architect.md`, `trend-researcher.md` (per contesto),
`.claude/skills/full-output-enforcement/SKILL.md`,
`.claude/skills/design-taste-frontend/SKILL.md` sez. 9.

Controlli fatti sui due file: `tsc --strict --noImplicitReturns
--noUnusedLocals` verde; nessun trattino lungo o medio, nessun puntino di sospensione né punto esclamativo nei testi
(l'unico `!` è il segno d'errore del campo contatto chiesto dall'ux-architect);
nessuna parola della lista "da evitare" del brand-strategist; nessun "01 ·";
due soli "·" (sottotitolo della vetrina e `META.title`, uno per riga).

---

## 1. Come si usa

```ts
import TESTI, { BANCO, CARTE, euro } from '../../content/testi';
import { PREZZO_BASE, SUPPLEMENTO_TECNICA } from '../../content/prezzi';
```

- Ogni stringa visibile, ogni `aria-label`, ogni testo alternativo e ogni
  annuncio `aria-live` è in `testi.ts`. I componenti non scrivono testo.
  Se manca qualcosa, si chiede: non si inventa nel componente.
- Tutto è `as const`: le chiavi sono tipizzate, un refuso nel nome della chiave
  non compila. `type Testi = typeof TESTI`.
- Le stringhe con valori variabili (carta scelta, prezzo, nomi) sono
  **funzioni** con parametri tipizzati. Non calcolano prezzi: ricevono numeri
  già calcolati da `sections/Banco/calcolaPrezzo.ts`.
- `euro(n)` formatta all'italiana: `1.090 €`, `8,50 €`, `0,40 €`. Serve
  scritto a mano perché `Intl` in `it-IT` non mette il punto su 4 cifre
  (`1090`). `numero(n)` fa lo stesso per le tirature (`1.000`).
- I tipi `Carta`, `Tecnica`, `Prodotto`, `Legatura`, `Quando` sono esportati da
  `prezzi.ts` e coincidono con `state/store.ts` del tech-architect. Lo scaffold
  può importarli da qui o ridefinirli uguali.

---

## 2. Mappa delle chiavi di `testi.ts`

| Esportazione | Sezione / uso | Chiavi principali |
|---|---|---|
| `META` | `<title>`, description, Open Graph | `title`, `description`, `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA` | voce `CONCEPTS` in `site.ts` del sito vero (solo proposta) | `tag`, `title`, `subtitle`, `desc`, `perche`, `mestieri` |
| `COMUNI` | ovunque | `marchio`, `marchioSotto`, `provaLaTua`, `seiSulBanco`, `tornaLab`, `tornaLabBreve`, `tornaLabAria`, `nuovaScheda`, `ivaInclusa`, `indicativo` |
| `SALTI` | link di salto | `contenuto`, `banco` |
| `TESTATA` | testata desktop | `navAria`, `marchioAria`, `voci[]` (id, etichetta, href), `provaAria` |
| `SEGNAPAGINA` | striscia mobile in basso | `aria`, `indice`, `apriAria(sezione)` |
| `INDICE` | foglio dell'indice mobile | `titolo`, `chiudi`, `chiudiAria`, `seiQui`, `cartaTitolo`, `luceTelefono`, `luceSi`, `luceNo` |
| `SEZIONI`, `ORDINE_SEZIONI` | nomi delle 8 sezioni | per id: `indice` (lungo), `segnapagina` (max 10 caratteri) |
| `HERO` | la pressa | `parola`, `titolo` (h1), `sottotitolo`, `dopoInvio`, `parolaCliente(a, b?)`, `tilt.{frase, attiva, lascia}` |
| `LUCE` | dial della luce (hero e banco) | `aria`, `etichetta`, `valore(gradi)` → `aria-valuetext` |
| `PER_CHI` | tre lavori sul bancone | `titolo`, `intro`, `pezzi[]` (id, titolo, perChi, righe, prezzo, nomeBreve, provaAria, preset, rilievo[], alt), `fila.{aria, precedente, successivo, inVista()}` |
| `TECNICHE` | la stessa parola, quattro volte | `titolo`, `intro`, `parolaCampione`, `elencoAria`, `segnoCorrente`, `correnteSr`, `tornaAlBanco`, `voci[]` (id, nome, breve, titolo, cosa, suCosa, costo), `rilievoAlt(parola, tecnica, carta)` |
| `CARTA` | tocca prima di scegliere | `titolo`, `intro`, `campioni`, `gruppoAria`, `scelta`, `spessoreSr(carta)` |
| `CARTE`, `ORDINE_CARTE` | le quattro carte, ovunque | per carta: `nome`, `grammatura`, `spessore`, `uso`, `descrizione`, `radioAria` |
| `LEGATORIA` | il filo | `titolo`, `intro`, `segnatura`, `voci[]` (id, titolo, testo, perCosa, prezzo, filoAlt), `tiraturaMinima`, `tesi`, `restauro`, `provaAria` |
| `LEGATURE_NOMI` | legature nel banco e nel riepilogo | per legatura: `nome`, `breve` |
| `PRODOTTI` | "Cosa stampi" | per prodotto: `nome`, `breve` (bottoni), `formato`, `unita`, `unitaUno` |
| `TECNICHE_NOMI` | "La tecnica" nel banco | per tecnica: `nome`, `breve` |
| `CAMPI_TESTO` | "Il tuo testo" per prodotto | `chiave` (va in `prova.campi`), `etichetta`, `esempio` (placeholder e testo premuto di esempio), `max`, `autocomplete` |
| `BANCO` | il banco di prova, tutti gli stati | vedi §4 |
| `RECAPITI` | dati di esempio della bottega | `via`, `cap`, `citta`, `provincia`, `indirizzoRiga`, `telefono`, `telefonoHref`, `email`, `mapsQuery` |
| `BOTTEGA` | portaci la bozza | `titolo`, `intro`, `indirizzo.{riga1, riga2}`, `orariTitolo`, `orari[]`, `senzaAppuntamento`, `appuntamento`, `telefono.{testo, bottone, aria, href}`, `email`, `maps.{testo, aria, query}`, `parcheggio`, `chi`, `storia`, `tempi`, `spedizione`, `noGrandi` |
| `COLOPHON` | piede | `titolo`, `testo(carta)`, `secondaRiga`, `indiceTitolo`, `indiceAria`, `indice[]`, `recapiti`, `ricomincia.{bottone, domanda, si, no, fatto}`, `finzione`, `conceptDi` |
| `RILIEVI` | testo alternativo di ogni superficie premuta | per rilievo: `decorativo`, `alt` oppure `vedi` |
| `ANNUNCI` | regione `aria-live="polite"` | vedi §5 |
| `TESTI` | tutto quanto sopra in un oggetto (default export) | |

---

## 3. Lunghezze massime (testate per 375 px)

Misure ricavate dai wireframe dell'ux-architect: area viva 335 px, Anybody
larghezza 100 a 30 px circa 20 caratteri per riga, Hanken 17 px circa 38
caratteri per riga, Hanken 16 px nei bottoni circa 8,5 px a carattere.
Chi cambia un testo resta sotto questi limiti o avvisa art-director e builder.

| Testo | Adesso | Massimo | Perché |
|---|---|---|---|
| `HERO.titolo` (h1) | 51 | 60 | 3 righe a 375 px, 2 a 1440 (colonne c1-c8 a 3,4vw) |
| `HERO.sottotitolo` | 115 | 150 | 4 righe Hanken 17 px; massimo 20 parole |
| `HERO.dopoInvio` | 25 | 38 | una riga |
| `HERO.parola` | 8 | 8 | la parola a secco riempie 335 px con l'asse width |
| h2 di sezione | 16-31 | 32 | 2 righe a 30 px (`TECNICHE.titolo` è il più lungo: 31) |
| intro di sezione | 54-107 | 120 | 3 righe su mobile |
| `COMUNI.provaLaTua` | 12 | 12 | sta nel 40% del segnapagina (134 px) |
| `SEZIONI.*.segnapagina` | 7-10 | 10 | "indice" + nome nel 60% del segnapagina (201 px) in Anybody largo; se non ci sta, "indice" sopra e nome sotto |
| `PRODOTTI.*.breve` | 5-15 | 15 | bottoni 2×2 da 160×52 |
| `TECNICHE.voci[].breve` | 6-11 | 11 | fila di 4 bottoni sticky sotto l'h2 |
| `PER_CHI.pezzi[].righe` | 59-72 | 76 | 2 righe sotto il pezzo (280 px di larghezza) |
| `PER_CHI.pezzi[].prezzo` | 23-31 | 34 | una riga |
| `CARTE.*.nome` + grammatura | 12-13 | 16 | una riga nella fascia mobile |
| `BANCO.contatto.placeholder` | 15 | 32 | campo 335 px, testo 17 px |
| `BANCO.leva.istruzione` | 26 | 32 | una riga sopra la leva |
| `BANCO.quando.opzioni` | 11-15 | 20 | bottoni in colonna |
| `BOTTEGA.indirizzo.riga1` | 17 | 18 | Anybody largo adattato alla larghezza |
| `BOTTEGA.telefono.bottone` | 17 | 22 | bottone pieno 52 px |
| `META.title` | 58 | 60 | risultati di ricerca |
| `META.description` | 149 | 155 | risultati di ricerca |

Campi del banco (`CAMPI_TESTO`): limiti dell'ux-architect, esempi dentro il
limite.

| Prodotto | Campo | Esempio | Max |
|---|---|---|---|
| biglietto | Nome e cognome | Chiara Zanin (12) | 28 |
| biglietto | Mestiere | Restauratrice (13) | 32 |
| partecipazione | Primo nome | Irene (5) | 18 |
| partecipazione | Secondo nome | Davide (6) | 18 |
| partecipazione | Data | sabato 12 giugno 2027 (21) | 24 |
| intestata | Nome o studio | Studio Bortolin (15) | 32 |
| intestata | Indirizzo breve | Via Mazzini 7, Pordenone (24) | 40 |
| libro | Titolo | Sul Noncello (12) | 36 |
| libro | Autore | Ada Gerometta (13) | 28 |

Il 12 giugno 2027 è davvero un sabato. Gli esempi del banco sono gli stessi
testi premuti sui tre pezzi di "Tre lavori sul bancone": chi clicca "Prova la
tua" su un pezzo ritrova nel banco lo stesso oggetto.

---

## 4. Banco di prova: stato per stato

Stati dell'ux-architect (§5.6) e chiave da usare.

| Stato | Dove | Chiave |
|---|---|---|
| Vuoto / primo arrivo | sotto la legenda "Il tuo testo" | `BANCO.tuoTesto.esempio`; prova con `CAMPI_TESTO[prodotto][i].esempio`, che è anche il `placeholder` del campo |
| Campo svuotato | nessun messaggio | la prova torna a `esempio` di quel campo |
| Testo lungo | sotto il campo | `BANCO.tuoTesto.lungo(max)`; contatore `contatore(usate, max)` solo negli ultimi 5 caratteri, con `contatoreAria` |
| Segno non disponibile | sotto il campo | `BANCO.tuoTesto.segnoMancante` |
| Bozza ritrovata | sopra il compositoio | `BANCO.bozza.frase` + bottone `BANCO.bozza.ricomincia` (`ricominciaAria`); annuncio `ANNUNCI.bozzaRitrovata`, poi `ANNUNCI.bozzaSvuotata` |
| Contatto non valido (blur) | sotto il campo | `BANCO.contatto.erroreSegno` (visivo) + `erroreSr` (`.imp-sr`) + `nonValido` |
| Leva senza contatto | sotto il campo contatto, focus lì | `BANCO.contatto.vuoto` |
| Primo tocco breve | etichetta della leva per 6 s | `BANCO.leva.confermaDiNuovo`; annuncio `ANNUNCI.confermaDiNuovo` |
| Rilascio anticipato | sotto la leva | `BANCO.leva.presto`; annuncio `ANNUNCI.presto` |
| Invio in corso | sotto la leva, `aria-live` | `BANCO.leva.inCorso`; annuncio `ANNUNCI.inCorso` |
| Successo | accanto alla prova (desktop) o al posto della leva (mobile), focus qui | `BANCO.successo.frase(carta, giorno)` + `firma` + bottone `altra` (`altraAria`) |
| Invio fallito | sotto la leva, focus qui | `BANCO.fallito.frase` + link `telefono`/`telefonoHref` + `chiusura`, poi `rassicura` |
| Senza WebGL | nessun messaggio a vista | `BANCO.senzaWebgl.messaggio` è `null`; `BANCO.senzaWebgl.sr` va in `.imp-sr` nella figure in tutti e due i casi |

Altre chiavi del banco: `titolo`, `intro`, `cosaStampi.legenda`,
`carta.{legenda, gruppoAria, scelta, notaIntestata, notaLibro}`,
`tecnica.{legenda, cosE, cosEAria, taglio, taglioNota, taglioNonDisponibile, notaLibro}`,
`legatura.{legenda, notaPunto}`, `quante.{legenda, aria(n, prodotto)}`,
`prova.{figureAria, alt(...)}`,
`prezzo.{totale, iva, dipende, ristampa, voci, riepilogo(...), rigaMobile(totale)}`,
`contatto.{etichetta, aiuto, placeholder}`,
`quando.{legenda, facoltativo, opzioni, notaLibroFretta}`,
`leva.{promessa, istruzione, aria}`.

**Il giorno nella frase di successo.** `successo.frase(carta, giorno)`:
`giorno` è `'domani'` se si invia da martedì a venerdì, oppure `'martedì'` se
si invia da sabato a lunedì (lunedì la bottega stampa a porta chiusa e non
risponde). Il builder del banco lo decide con `new Date().getDay()`. Così la
promessa "entro un giorno lavorativo" resta vera.

**Riepilogo in parole.** `prezzo.riepilogo({...})` riceve dal calcolo le voci
già scelte fra `prezzo.voci` (solo quelle diverse dalla base, come dice
l'ux-architect) e il totale arrotondato. Esempio reale di uscita:

> Biglietto da visita 85×55 mm, Cotone 600 g, lamina argento, 250 biglietti.
> Cliché per la lamina 80 € al posto della lastra. Indicativo 400 €, IVA
> inclusa. Pronti in 8-12 giorni lavorativi dalla prova approvata.

---

## 5. Annunci `aria-live`

Tutti `polite`, nessuno a ogni lettera.

| Chiave | Quando |
|---|---|
| `ANNUNCI.carta(carta)` | cambio carta da uno qualsiasi dei tre gruppi |
| `ANNUNCI.prodotto(prodotto)` | cambio di "Cosa stampi" |
| `ANNUNCI.prezzo(totale, cambiato?)` | prezzo cambiato, debounce 800 ms; `cambiato` è il nome della scelta nuova (per esempio `'lamina argento'`) |
| `ANNUNCI.bancoImpostato(prodotto, carta)` | arrivo al banco da un "Prova la tua" con preset |
| `ANNUNCI.bozzaRitrovata`, `bozzaSvuotata` | bozza |
| `ANNUNCI.confermaDiNuovo`, `presto`, `inCorso`, `successo(carta, giorno)`, `fallito` | leva e invio |
| `ANNUNCI.indiceAperto`, `indiceChiuso` | indice mobile |
| `ANNUNCI.tecnica(nome)` | tecnica corrente nel pin (solo se cambiata da un bottone dell'elenco) |
| `ANNUNCI.lavoroInVista(nome, n)` | fila dei tre lavori su mobile |
| `ANNUNCI.ricominciato` | "Ricomincia da capo" confermato |
| `ANNUNCI.tiltAttivo`, `tiltSpento` | luce col telefono |

---

## 6. Rilievi e testi alternativi

Regola del creative-director: nessuna informazione vive solo nel rilievo.
`RILIEVI` elenca ogni superficie premuta.

- `decorativo: true` (marchio, parola dell'hero, nomi delle carte, prezzo in
  lamina, indirizzo della bottega): il rilievo ripete un testo già leggibile
  nel DOM. Canvas e fantasma CSS restano `aria-hidden`, niente altro.
- `decorativo: false`: il testo va in un elemento `.imp-sr` accanto:
  - pezzi di "Tre lavori": `PER_CHI.pezzi[].alt`;
  - parola delle tecniche: `TECNICHE.rilievoAlt(parola, tecnica, carta)`;
  - filo della legatoria: `LEGATORIA.voci[].filoAlt`;
  - prova del banco: `BANCO.prova.alt({...})` più la figcaption (riepilogo);
  - nomi del cliente nell'hero dopo l'invio: `RILIEVI.heroParolaCliente.alt(testo)`.

---

## 7. Come si legge `prezzi.ts`

Solo dati. Formula per `calcolaPrezzo.ts` (section-builder-banco):

```
base      = PREZZO_BASE[prodotto][tiratura]
carta     = base × (1 + SUPPLEMENTO_CARTA[carta])
tecnica   = SUPPLEMENTO_TECNICA[tecnica].impianto + SUPPLEMENTO_TECNICA[tecnica].aPezzo × tiratura
taglio    = se scelto e TAGLIO_COLORATO.disponibile[prodotto]:
              max(TAGLIO_COLORATO.aPezzo × tiratura, TAGLIO_COLORATO.minimo)
legatura  = solo libro: SUPPLEMENTO_LEGATURA[legatura] × tiratura
totale    = arrotonda ai 5 € (ARROTONDAMENTO) di carta + tecnica + taglio + legatura
tempi     = TEMPI_GIORNI[prodotto]
```

Prove fatte a mano, già coerenti con le didascalie:

| Caso | Conto | Totale |
|---|---|---|
| 100 partecipazioni, Cotone, secco | base | 390 € |
| 100 partecipazioni, Cotone, lamina | 390 + 20 + 60 | 470 € |
| 100 biglietti, Cotone, secco | base | 160 € |
| 100 biglietti, Cotone, lamina | 160 + 20 + 60 | 240 € |
| 250 biglietti, Cotone, lamina | 230 + 20 + 150 | 400 € |
| 50 libri, Grafite, a un colore, brossura | 650 × 1,12 + 40 + 10 = 778 | 780 € |

Tirature: 50, 100, 150, 250, 500, 1000 (per il libro 30, 50, 100, 300).
Default: biglietto 100, partecipazione 100, carta intestata 250, libro 30.

**Scostamenti dai documenti precedenti, decisi qui** (i due documenti avevano
tabelle diverse; ho tenuto il brand-strategist come riferimento):

- Biglietto base: 160 € per 100 e 230 € per 250 (brand-strategist), non 150 e
  220 (tabella segnaposto dell'ux-architect).
- Lamina: +20 € di impianto (cliché da 80 € al posto della lastra da 60 €) e
  0,60 € a pezzo, non +90 € e 0,45 €: così 100 partecipazioni in lamina fanno
  470 €, come nel brand-strategist.
- A un colore: +40 € e 0,20 € a pezzo (non 0,25). Taglio colorato: 0,40 € a
  pezzo, minimo 40 € (brand-strategist), non 0,30 € e 30 €.
- Carta intestata: 250 fogli con buste a 420 € (brand-strategist). La carta
  intestata usa la tinta scelta in 120 g, perché i fogli devono passare in
  stampante; niente taglio colorato sulla intestata.
- Libro: base 30 copie 480 €, 50 copie 650 €, 100 copie 1.090 €, 300 copie
  2.550 €; così il libretto su Grafite a un colore da 50 copie fa 780 €, come
  nel brand-strategist. La didascalia del pezzo in "Tre lavori" diventa
  "50 copie da 48 pagine, da 780 €" (l'ux-architect aveva 100 copie a 1.350 €).
- Didascalia del biglietto in "Tre lavori": "100 biglietti, da 160 €".
- Il biglietto con lamina e taglio colorato fa 280 € (240 + 40), non 260: la
  formula del banco è una sola e vale per tutto.
- Tempi: 8-12 giorni lavorativi (ux-architect), libri 15-20.

Prezzi della legatoria (`LEGATORIA_A_COPIA`, sola legatura su 100 copie):
brossura cucita 6 €, cartonato 10 €, giapponese 8,50 €, punto metallico 4,50 €.
Tesi 55 € la prima copia, 38 € le altre. Restauro da 90 €.

---

## 8. Scelte di testo e perché

- **H1**: "Stampiamo cose che si leggono anche a occhi chiusi." È la frase del
  creative-director e dice il messaggio chiave del brand-strategist (si
  riconoscono con le dita) in modo più corto. Compare una volta.
- **Sottotitolo**: dice mestiere, città e le due stanze (stampa e legatoria)
  con verbi da bottega: premiamo, cuciamo.
- **Persone**: Marta, Franco, Elia compaiono solo in una frase della bottega e
  nella firma "Mandi, Marta" dopo l'invio (l'unico "Mandi" del sito, come
  chiede il brand-strategist). Nessun cognome, nessun ritratto.
- **Storia**: una sola frase in bottega (legatoria dagli anni Settanta,
  platina da Sacile). Nessun anno di fondazione in evidenza.
- **Il no detto con calma**: `BOTTEGA.noGrandi` e
  `BANCO.tecnica.taglioNonDisponibile`.
- **Termini tecnici spiegati alla prima occorrenza**: a secco, lamina a caldo,
  impianto (nel banco), segnatura (`LEGATORIA.segnatura`), cliché.
- **Finzione dichiarata**: `COLOPHON.finzione` dice che indirizzo, telefono,
  nomi e prezzi sono di esempio. Il repo è pubblico e il sito è un concept.

---

## 9. Dati di esempio e cose da confermare

- Indirizzo: Via Cavallotti 18, 33170 Pordenone (via vera, civico inventato).
  Parcheggio detto in modo generico (zona piazza XX Settembre). Maps cerca la
  via, non un'attività (`RECAPITI.mapsQuery`).
- Telefono `0434 000 000`, email `bottega@impronta.example`. Il link
  `telefonoHref` è `tel:+390434000000`: numero inesistente. Se il
  tech-architect preferisce nessun link `tel:`, basta non usare `href`.
- Orari del brand-strategist (lunedì chiuso), non quelli segnaposto
  dell'ux-architect.
- **Per lo scaffold / builder banco**: lo store (§6.1 del tech-architect) non
  ha ancora `legatura` né `quando` in `prova`; i tipi sono in `prezzi.ts`.
  Il default della legatura è `LEGATURA_DEFAULT` (brossura).
- **Per l'interaction-designer**: `LUCE.valore(gradi)` usa 0° = luce da
  destra, 90° = dall'alto, 135° = da sinistra in alto (riposo). Se in
  `interaction/light.ts` la convenzione è diversa, me lo dite e cambio l'ordine
  di `DIREZIONI_LUCE`.
- **Per chi porta il concept nel sito**: `VETRINA` è una proposta per la voce
  di `CONCEPTS` in `src/content/site.ts`; decide Luca.

---

## Giro 2 (dopo la giuria: Contenuto 7)

Fonti: `docs/awwwards-jury.md` §1 Contenuto, §2 per sezione, §5 riga
copywriter; `docs/seo-engineer.md` P3, P10, P11. Nessuna chiave tolta o
rinominata: sono cambiati dei valori e ci sono chiavi nuove. `npm run
typecheck` verde.

### Cosa è cambiato nei valori

- **Recapiti senza segnaposto a vista.** Il numero e l'email non compaiono più
  come testo. Il telefono è un link con scritto "Chiama la bottega" (href
  `tel:` di esempio), l'email un link "Scrivi alla bottega". Gli `aria-label`
  dicono "(numero di esempio)" e "(indirizzo di esempio)". Non ho messo un
  numero "verosimile" come proponeva la giuria: il repo è pubblico e un numero
  vero di Pordenone può essere di qualcuno.
  - `RECAPITI.telefono` ora vale "Chiama la bottega" (il colophon lo mostra
    già così dentro il link `tel:`).
  - `RECAPITI.email` resta l'indirizzo perché `core/links.ts` ci costruisce il
    `mailto:`. **Il colophon deve mostrare `COLOPHON.email` (o
    `RECAPITI.emailEtichetta`) al posto di `RECAPITI.email`**: finché non lo fa,
    l'indirizzo `.example` resta visibile lì.
  - `BOTTEGA.telefono.{testo, bottone}` = "Chiama la bottega",
    `BOTTEGA.email.testo` = "Scrivi alla bottega". Il testo grande a 60 px
    del telefono va tolto dal builder della bottega (giuria: Hanken 20 px).
  - `BANCO.fallito`: "...tieni premuto di nuovo, oppure" + link "chiama la
    bottega" + ".". `ANNUNCI.fallito` senza numero.
  - `COLOPHON.recapiti`: indirizzo più la riga che dice che telefono ed email
    sono di esempio. `COLOPHON.finzione` riscritta.
  - `BANCO.contatto.placeholder`: solo "nome@esempio.it" (via il numero).
- **Title e description (SEO P3, P11)**: `META.title` = "Concept 10 ·
  IMPRONTA, tipografia e legatoria | Ciceri Lab" (58 caratteri),
  `META.description` dice "Concept di Ciceri Lab" e "inventata" (149
  caratteri). `ogTitle` e `ogDescription` con "Ciceri Lab"; commento che li
  copia il prerender (P10). `COLOPHON.conceptDi` = "Un concept di Ciceri Lab".
- **Micro-frasi sotto i titoli tolte**: `BANCO.intro` e `TECNICHE.intro` ora
  sono stringhe vuote. I builder non rendono il `<p>` se la stringa è vuota.
- **Ripetizioni tolte**:
  - `LEGATORIA.intro` non ripete più "nella stanza accanto" (è già
    nell'hero).
  - `BANCO.prezzo.dipende` più corto (una frase).
  - `CARTA.campioni` non ripete più la promessa della prova a casa (sta già
    sopra la leva).
  - `BOTTEGA.tempi` in una frase.
  - `COLOPHON.secondaRiga` non ripete più la via.
  - Legatoria: la cifra grande e il testo accanto dicevano due volte "6 €".
    Nuova chiave `voci[].prezzoDopoCifra` ("a copia, solo la legatura") da
    usare accanto alla cifra, che a quel punto **non** deve essere
    `aria-hidden`. Più una riga comune `LEGATORIA.riferimento` ("Prezzi su 100
    copie. Si parte da 30.") al posto delle quattro code "su 100 copie".
- **Ricomincia da capo**: `COLOPHON.ricomincia.fatto` resta una stringa
  (compatibilità), ora vera con qualsiasi carta di partenza. Nuova
  `COLOPHON.ricomincia.fattoCarta(carta)`, cioè il `fatto(carta)` chiesto dal
  colophon: "Fatto. Il sito è tornato su Grafite e il banco è vuoto."

### Chiavi nuove

| Chiave | Valore / uso |
|---|---|
| `RECAPITI.telefonoEtichetta` | "Chiama la bottega" |
| `RECAPITI.telefonoNumero` | "0434 000 000", solo dato, mai a vista |
| `RECAPITI.emailEtichetta` | "Scrivi alla bottega" |
| `RECAPITI.nota` | "Telefono ed email sono di esempio: la bottega non esiste." |
| `BOTTEGA.recapitiNota` | = `RECAPITI.nota`, piccola sotto i link |
| `BOTTEGA.stato.{aperto, chiuso}` | "Adesso siamo aperti." / "Adesso siamo chiusi.": lo stato orario come riga di testo, non come titolo a 60 px (il builder oggi usa testi locali) |
| `COLOPHON.telefono`, `COLOPHON.email` | etichette dei due link del colophon |
| `COLOPHON.ricomincia.fattoCarta(carta)` | esito di "Ricomincia da capo" con la carta vera |
| `LEGATORIA.voci[].prezzoDopoCifra` | testo accanto alla cifra grande |
| `LEGATORIA.riferimento` | riga comune sotto le quattro legature |

### Per i section-builder (cosa passare dal vecchio al nuovo)

- **colophon**: `RECAPITI.email` → `COLOPHON.email`; `ricomincia.fatto` →
  `ricomincia.fattoCarta(carta)`.
- **bottega**: `BOTTEGA.stato.*` al posto dei testi locali "aperto adesso /
  chiuso adesso"; `BOTTEGA.recapitiNota` sotto i link; togliere lo span del
  telefono a 60 px.
- **legatoria**: `prezzoDopoCifra` + `riferimento`, cifra leggibile dai
  lettori di schermo.
- **banco, tecniche**: non rendere `<p>` con `intro` vuota. Nel banco
  `dipende` e `ristampa` sono resi due volte (in `Prova.tsx` e in
  `Compositoio.tsx`): una basta.
