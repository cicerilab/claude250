# Copywriter · Concept 14 · BATTIFILO, impresa edile e serramenti (Cordenons)

Ondata 2. File miei, in `src/pages/concepts/battifilo/content/`:
`testi.ts`, `cantiere.ts`, `prezzi.ts`, `impresa.ts`, più questo documento.

Letti: `docs/ruoli-agent.md`, `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, riga e paragrafo 14 di `docs/matrice-concept-11-20.md`,
tutti i doc dell'ondata 1 in `concepts/14-battifilo/docs/` (creative-director,
brand-strategist, ux-architect, tech-architect, trend-researcher), e per il
formato `concepts/10-torchio/docs/copywriter.md` col suo `content/testi.ts`.

Controlli fatti sui quattro file:
- `tsc --strict --noImplicitReturns --noUnusedLocals --noUncheckedIndexedAccess --exactOptionalPropertyTypes` verde;
- uno script (compila in JS e percorre tutte le stringhe) conferma: nessun
  trattino lungo o medio, nessun punto esclamativo, nessun puntino di
  sospensione, nessun "01 ·", mai due "·" nella stessa stringa; nessuna parola
  della lista "da evitare" del brand-strategist (unica eccezione voluta:
  "infissi" tra le parole chiave di ricerca di `VETRINA.mestieri`, mai a vista);
- somma dei 14 mesi = 412.500 € = preventivo 398.000 € + varianti 14.500 €;
  scostamento 3,64% → "3,6%"; fermi per il meteo = 11 giorni;
- forbice di controllo (due ante 118 × 142, superficie 1,68 m²): PVC da 920 € a
  1.330 €, legno-alluminio da 1.500 € a 2.090 €, legno da 1.250 € a 1.750 €,
  posa compresa; 9 pezzi PVC da 8.280 € a 11.970 €;
- lunghezze dentro i limiti dell'ux-architect (tabella §3).

Apostrofi: a vista sempre tipografici (’). Telefono ed email esistono solo
come `href` in `impresa.ts`: a vista ci sono "Chiama", "Scrivi", "Chiama
Loris", "chiama l'ufficio".

---

## 1. Come si usa

```ts
import TESTI, { SCHEDA, LINEA, MISURA, valoreParlante, euro, minuscola } from '../../content/testi';
import { MESI, mese, TOTALE, FERMI, BILANCIO, GIORNI_METEO, type Mese, type Fermo } from '../../content/cantiere';
import { TIPI, MATERIALI, POSA, LIMITI, QUANTE, PORTA, type TipoFinestra, type Materiale } from '../../content/prezzi';
import { RECAPITI, COMUNI_SERVITI, ALTRO_COMUNE, QUANDO, type Quando } from '../../content/impresa';
```

- Ogni stringa visibile, `aria-label`, `aria-valuetext`, annuncio `aria-live`
  è qui. I componenti non scrivono testo; se manca una stringa si chiede.
  `alt` e `cosa` delle foto restano del photo-editor (`assets/foto/index.ts`).
- Tutto è `as const` (con `satisfies` dove serve il controllo di forma).
- Le frasi con valori sono **funzioni** che ricevono numeri già calcolati
  (la forbice la calcola `sections/Misura/forbice.ts`).
- **Stencil**: le marcature (h1, fasi, tacche, quote, data, marchio) sono
  scritte in minuscolo normale; il maiuscolo lo mette il CSS
  (`text-transform: uppercase`), così il lettore di schermo non le compita.
- `TipoFinestra` e `Materiale` stanno in `prezzi.ts`, `Quando` in
  `impresa.ts`: coincidono con i tipi dello store del tech-architect (§6.1).

## 2. Mappa delle esportazioni

### `cantiere.ts` (unica fonte delle cifre)

| Esportazione | Cosa |
|---|---|
| `MESI` | 14 × `Mese`: `n`, `anno`, `mese` (1-12), `nome`, `tacca` ("Ott"), `fase`, `costo`, `finora` (calcolato), `fatto`, `chi`, `giorni`, `fermi[]`, `controlla`, `finestra` (true nei mesi 7 e 12) |
| `Fermo` | `id` (= `Buco.chiave`), `motivo`, `giornoDa`, `giornoA`, `giorniLavorativi`, `meteo`, `riga` (testo del buco), `breve` (dentro "chi c'era"), `parlato` (dentro l'`aria-valuetext`) |
| `mese(n)`, `TOTALE`, `GIORNI_METEO`, `FERMI` | accesso e somme |
| `BILANCIO` | `inizio`, `chiavi`, `durataMesi`, `superficieM2`, `preventivo`, `varianti[]`, `finale`, `scostamentoPercento` |

### `prezzi.ts` (solo dati, firma del tech-architect §7.4 più tre aggiunte)

`TIPI` (con `ante`), `TIPO_INIZIALE`, `MATERIALI` (ordine della forbice: PVC,
legno-alluminio, legno), `POSA`, `MINIMO_M2`, **`DECIMALI_M2`** (2),
`LIMITI` (più `metriDa`/`metriA`), `QUANTE`, `ARROTONDA`, `PORTA`,
**`COERENZA`** (soglie degli avvisi A1), **`A_PARTE`** (tapparelle, scuri).

### `impresa.ts`

`RECAPITI` (via, indirizzo, `telefonoHref`, `capocantiereHref`, `emailHref`,
`mapsHref`), `ORARI`, `COMUNI_SERVITI`, `ALTRO_COMUNE`, `RAGGIO_KM`, `QUANDO`,
`PROMESSE`.

### `testi.ts`

| Esportazione | Uso | Chiavi principali |
|---|---|---|
| aiuti | ovunque | `euro`, `euroParlati`, `numero`, `metriQuadri`, `misure` ("118 × 142"), `percento`, `dataLunga` ("26 settembre"), `dataStencil` ("26 set"), `richiamata(oggi)`, `quanteFinestre`, `minuscola`, `meseERango` ("ottobre, mese 8"), `meseERangoMaiuscolo` |
| `META` | title, description, OG | `title` (58 car.), `description` (146), `ogTitle`, `ogDescription`, `ogImageAlt` |
| `VETRINA` | proposta per `site.ts` | `tag`, `title`, `subtitle`, `desc` (con l'argomento "le foto vere del tuo cantiere"), `perche`, `mestieri[]` |
| `COMUNI` | ovunque | `marchio`, `marchioAria`, `misuraEManda` (l'unica etichetta del richiamo), `tornaAllaCronaca`, `leggiTuttiIMesi`, `diPiu`/`meno`, `fotoDiverse`(+`Breve`), `cifreEsempio`, `conceptDi`, `finzione`, `finzioneLunga` |
| `SALTI` | link di salto | `filo`, `misura`, `mesi` |
| `FASCIA` | fascia alta, menu, fascia bassa | `navAria`, `scorciatoieAria`, `cronaca`, `cartello`, `menu`/`chiudiMenu` (+aria), `tuttiIMesi`, `ciSei`, `seiQui(voce)` |
| `APERTURA` | S0 | `titolo` (h1), `riga`, `dichiarazione`, `istruzione`, `tacca` ("Prima"), `taccaAria` |
| `SCHEDA` | S1 | `fatto`, `chiCera`, `controlla`, `fermi` (etichette), `finora(n)`, `chiERiga(mese)` (fermi compresi), `fermiTesto(fermi)`, `tuaFinestra`(+aria), `diPiuAria`/`menoAria`, `didascalia(cosa, autore, fonte)`, `senzaFotoSr`, `h1Sr` |
| `CHIAVI` | S2 | `titolo`, `tacca`, `taccaAria`, `totale`, `totaleSotto`, `tempi`/`tempiTesto`, `soldi`/`soldiTesto`, `consegna`/`consegnaVoci[]`, `dopo`/`dopoTesto`, `chiamaLoris`(+aria, href), `cartello`, `rileggi`, `diPiuAria` |
| `LINEA` | filo del tempo | `sliderAria`, `sliderIstruzioniSr`, `taccheAria`, `taccaAria(m)`, `taccaTitolo(m)` (riga al passaggio), `bucoAria(fermo)`, `mesePrima`/`meseDopo`, `annuncio(m)`, `annuncioPrima`, `annuncioChiavi`, `tu`, `tuMisure`, `tuDoppia`, `tuAria(...)`, `tuTitolo(data)` |
| `valoreParlante(t)` | `aria-valuetext` delle 16 posizioni | 0, 1-14 con fermi, 15 |
| `TIPI_NOMI`, `MATERIALI_NOMI`, `QUANDO_NOMI` | nomi in Misura | `nome`, `breve`, `inFrase`, `articolo`; `carattere` dei materiali |
| `MISURA` | S3, tutti gli stati | vedi §4 |
| `CARTELLO` | S4 | righe del `<dl>` (`impresa`, `chiSiamo`, `sede`, `orari`+`orariRighe`, `dove`, `nonFacciamo`, `contatti`), `chiama`/`scrivi`/`maps` (+aria, href), `esempio`, `pagamenti`, `crediti`, `nota`, `ricomincia.{bottone, domanda, si, no, fatto}` |
| `MESI_VISTA` | S5 | `titolo`, `intro`, `indiceAria`, `voceTitolo(m)`, `voceCosto(m)`, `vedilo`/`vediloAria`, `chiaviTitolo`, `crediti`, `creditiRiga(...)`, `piede`, `stampaSr` |
| `ANNUNCI` | `aria-live` generici | `vistaAperta(titolo)`, `vistaChiusa`, `menuAperto`, `menuChiuso` |
| `TESTI` (default) | tutto in un oggetto | |

## 3. Lunghezze (limiti dell'ux-architect, misurate)

| Testo | Adesso | Massimo |
|---|---|---|
| `APERTURA.riga` | 88 | 110 |
| fase | 8-20 | 22 |
| `fatto` | ≤ 180 | 180 |
| `SCHEDA.chiERiga` | 34-80 (dicembre 80) | 80 |
| `controlla` | ≤ 130 | 130 |
| `META.title` / `description` | 58 / 146 | 60 / 155 |

La didascalia (≤ 90) dipende dal `cosa` del photo-editor: `cosa` ≤ 50
caratteri lascia spazio ad autore e fonte.

## 4. Misura e manda: stato per stato (ux-architect §5.5.6)

| Stato | Chiave |
|---|---|
| P0 vuoto | `MISURA.piano.vuoto`, `forbice.vuota`, `invio.mancano(['le misure','un recapito'])` con i pezzi di `invio.pezzi`; sr `piano.descrizioneVuotaSr` |
| P0b bozza | `MISURA.bozza.{frase, cancella, cancellaAria}` (solo se lo scaffold tiene la bozza) |
| P1 parziale | `piano.descrizioneParzialeSr(lato, cm)`; `invio.mancano([...])` |
| P2 valide | `piano.luce(m2)`, `piano.davanzale(cm)`, `piano.descrizioneSr(...)`, `forbice.pezzo`, `forbice.rigaAria`, `forbice.totale`, `forbice.totaleAria`, `forbice.compreso`, `aParte`, `detrazioni`, `posatori` |
| E1 piccola | `errori.troppoPiccola(cm)` |
| E2 grande | `errori.troppoGrande` |
| E3 millimetri | `errori.millimetri(mm, cm)` + `errori.usa(cm)` / `usaAria(cm, lato)` |
| E4 metri | `errori.metri(m, cm)` + `usa` |
| E5 testo | `errori.nonNumero` |
| E6 enorme | `errori.enorme` |
| A1 coerenza | `coerenza.forseFinestra(tipo, cm)` + `faiFinestra`; `coerenza.forsePortafinestra(cm)` + `faiPortafinestra` |
| Q1 quantità | `quante.massimo`, `quante.riportato(n)`, `quante.annuncio(n)` |
| C1 / C2 / C3 | `invio.nomeMancante`, `invio.contattoNonValido`, `contatti.altroComune` + `contatti.altroComuneRiga`, `invio.comuneMancante` |
| I0 incompleto | `invio.mancano(...)`, `invio.riepilogoAria(...)` |
| I1 in corso | `invio.inCorso` (senza puntini), `invio.inCorsoAria` |
| OK successo | `dataStencil(oggi)` a spruzzo, `successo.frase(comune, oggi)`, `successo.chiChiama`, `successo.tempi`, `successo.saluto` ("Mandi.", l'unico del sito), `successo.altra`, `successo.torna`, `successo.annuncio(oggi)` |
| OK2 già mandata | `successo.giaMandata(tipo, l, h, data)` |
| OK3 seconda | `successo.ancheQueste`, `LINEA.tuDoppia` |
| F1 fallito | `fallito.frase` + link `fallito.chiama` (`chiamaAria`, `chiamaHref`) + `fallito.chiusura`; `fallito.annuncio`. Nessun numero a vista |

Sempre visibili: `MISURA.intro`, `comeSiMisura.{titolo, righe, schemaAlt}`,
`contatti.rassicura`, `contatti.promessa`, `invio.simulato`.

## 5. Scelte fatte (e perché)

1. **Fermi** come chiesto dal brand-strategist: pioggia **5** giorni (14-18
   aprile), gelo **6** (16-23 dicembre) = 11 giorni per il meteo; ferie dal 4
   al 22 agosto. **In più** la chiusura di Natale dal 24 al 31 dicembre,
   subito dopo il gelo: un cantiere friulano chiude a Natale, e la linea che
   "dice la verità" non poteva mostrarlo aperto. A vista resta **un buco solo**
   a dicembre (gelo + Natale contigui), quindi i buchi restano tre.
2. **Calendario vero** (marzo 2025 → aprile 2026, feste comprese): i "giorni
   in cantiere" del brand-strategist che superavano i giorni lavorativi
   disponibili sono corretti: giugno 20 (era 21, c'è il 2 giugno), agosto 6
   (era 7), dicembre 10 (era 14). Gennaio 20 torna.
3. **Forbice con posa** (920-1.330 € nell'esempio): coefficiente due ante
   **1,0** (brand-strategist e tech-architect), non 1,05 dell'ux-architect; la
   superficie si arrotonda al centesimo prima del conto (`DECIMALI_M2`),
   perché è il numero che il cliente vede e può rifare a mano. Senza
   arrotondamento il minimo PVC verrebbe 910 €.
4. **Varianti dentro i mesi**: la finestra in più in cucina a luglio (mese 5,
   dove il consiglio dice "ultimo momento comodo per cambiarne una") e il
   rovere a marzo (mese 13), già comprese nei costi di quei mesi.
5. **"Entro domani"** solo quando è vero: `richiamata(oggi)` dice "lunedì" se
   l'invio è di venerdì o sabato (promessa del brand: giorno lavorativo dopo).
6. Il messaggio chiave sta nella forma (titolo, cifre, buchi) e torna in
   parole nel bilancio delle chiavi; la riga sotto l'h1 resta quella del
   creative-director, più corta del limite.

## Richieste ad altri agent

- **scaffold-engineer**: `core/tempo.ts` → `valoreParlante(t)` può
  riesportare quella di `testi.ts`; `calcolaBuchi` deve gestire **due fermi
  nello stesso mese** (dicembre: `gelo-dicembre` 16-23 e `natale-dicembre`
  24-31) e `segmentiBattuti` li fonde in un buco solo. Parametro `?tipo=`:
  l'ux-architect usa `anta`/`alzante`, i tipi veri sono `un-anta`/`scorrevole`
  (accettare entrambi in `core/params.ts`).
- **section-builder-misura**: in `forbice.ts` arrotondare la superficie con
  `DECIMALI_M2` prima del conto; in `valida.ts` aggiungere gli esiti `metri`,
  `testo`, `enorme` (le frasi E4-E6 esistono già); avvisi A1 con le soglie di
  `COERENZA`; `MISURA.successo.frase` e `annuncio` vogliono `store.oggi`.
- **section-builder-linea**: sui due buchi contigui di dicembre i bottoni
  invisibili possono essere due (uno per fermo, `LINEA.bucoAria`) oppure uno
  con le due righe unite; la tacca di dicembre ha `aria-describedby` su
  entrambe.
- **section-builder-scheda / mesi**: "chi c'era" è `SCHEDA.chiERiga(mese)`
  (i fermi sono già dentro); nella vista elenco e in "Di più" i fermi per
  esteso sono `SCHEDA.fermiTesto(mese.fermi)`.
- **photo-editor**: `cosa` al massimo 50 caratteri, che finisca con il
  punto, nel tono "Cantiere di un'altra casa: ...".
- **seo-engineer**: `META` pronto; nessun dato di LocalBusiness.
