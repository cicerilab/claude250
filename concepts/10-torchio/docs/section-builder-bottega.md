# Section builder · La bottega (`#bottega`)

File: `src/pages/concepts/impronta/sections/Bottega/Bottega.tsx`, `bottega.css`.

## 1. Composizione

Frontespizio ancorato al margine interno (ux-architect §5.7), carta vuota
verso il margine esterno:

1. H2 "Portaci la bozza" (`tabIndex=-1`, per il fuoco dopo il salto
   all'ancora) e intro in corpo lead.
2. **Indirizzo**: l'`<address>` in inchiostro (si legge) e sotto le due righe
   `riga1` / `riga2` premute a secco, `.imp-pressa .imp-secco`, larghe quanto
   l'area viva. Contenitore `aria-hidden` (RILIEVI.bottegaIndirizzo è
   decorativo). Ogni riga è un `ReliefText` con il suo `usePressione`
   (profilo `BOTTEGA` di choreography, innesco sul blocco al 25% dal fondo,
   `indice` 0/1 per lo sfasamento).
3. **Orari** + **stato adesso** (colonne 1-5) e **recapiti** (7-11 da 1024).
4. **Chi c'è**: `BOTTEGA.chi` diviso in tre frasi; il nome in Anybody largo
   (wdth 150 / 800, corpo H2), cosa fa accanto in Hanken. Legge come la frase
   originale.
5. **Le macchine**: `BOTTEGA.storia` a sinistra, otto macchine in due colonne.
6. Piede: tempi, spedizione, il "no" alle grandi tirature.

Niente schede, bordini, numeri di sezione, mappa disegnata. Il telefono è
l'unico pieno d'inchiostro su mobile; nessuna lamina (resta ai tre usi).

## 2. Corpo dell'indirizzo premuto

Come la parola dell'hero: `font-size = area viva / em`. Misurate nel browser
su Anybody 800 (tracking -0,01em incluso), riga più lunga "33170 Pordenone":
10,695 em a wdth 112,5 e 14,372 a wdth 150. In CSS 10,75 e 14,45 (margine di
sicurezza). Risultato: 31 px a 375, 59 px a 768, 82 px a 1440, sempre dentro
l'area viva (335 / 630 / 1181), mai tagliato. Con il font di ripiego (Arial
tarato) la riga è più stretta, mai più larga.

**Deviazione nota**: a 375 il secco (31 px) è circa 2 volte il gemello in
inchiostro (15 px), non 4 (DESIGN §3). Per arrivare a 4 servirebbe
spezzare l'indirizzo o scendere sotto wdth 112,5, che l'art-director non
ammette per l'indirizzo. Da 768 il rapporto è ≥ 4.

## 3. Stato "aperto adesso / chiuso adesso"

- Ora vera di Pordenone con `Intl.DateTimeFormat(… timeZone: 'Europe/Rome')`,
  qualunque sia il fuso di chi guarda. Letta solo in un effetto (nessun
  accesso al browser a livello di modulo; il prerender esce senza stato, lo
  spazio della riga è riservato con `min-block-size`: niente CLS).
- Aggiornata ogni 20 s e al ritorno sulla scheda (`visibilitychange`).
- Orario in minuti (stessi numeri di `BOTTEGA.orari`): lunedì e domenica
  chiuso; martedì-venerdì 9.00-12.30 e 15.00-19.00; sabato 9.30-12.30.
- Frasi: "Fino alle 19.00." / "Chiude alle 12.30, tra 20 minuti." (ultimi 30')
  / "Apre oggi alle 9.00." / "Riapre oggi alle 15.00." / "Riapre domani
  alle 9.30." / "Riapre martedì alle 9.00.", più "A Pordenone sono le 17.42."
- Chiuso = parola in `--imp-inchiostro-velato` (AA); lo stato è sempre anche
  scritto, mai solo colore. La riga di oggi negli orari è sottolineata 2 px e
  porta ", oggi".

## 4. Testi fuori da `testi.ts` (richiesta al copywriter)

In `TESTI_SEZIONE` in cima a Bottega.tsx, da spostare in `BOTTEGA` quando il
copywriter vuole: `chiTitolo` "Chi c'è", `macchineTitolo` "Le macchine",
`recapitiAria`, `oggi`, `statoAria`, `aperto` "aperto adesso", `chiuso`
"chiuso adesso", le frasi dello stato (§3) e `macchine[]` (nomi e usi dal
brand-strategist §1.5). Tutto il resto viene da `BOTTEGA`; il link a Maps
usa `MAPS_URL` di `core/links.ts` (ricerca della via, nuova scheda,
`rel="noopener noreferrer"`), il testo `maps.testo` senza "↗" perché la
freccia la disegna `freccia.svg`. Telefono ed email sono quelli di esempio
(`tel:+390434000000`, `bottega@impronta.example`).

## 5. Responsive

- **375**: tutto in colonna; "Chiama 0434 000 000" (inchiostro pieno) e
  "Apri in Maps" (foglio `--imp-carta-luce` con costa) a larghezza piena,
  52 px, uno sotto l'altro; poi email e parcheggio.
- **600-1023**: orari su due colonne (giorno / ore), persone nome | mestiere,
  macchine in due colonne; recapiti ancora bottoni.
- **≥ 1024**: il numero diventa una riga di stampa grande (Anybody wdth 125,
  corpo H2) sottolineata, allineata a "aperto adesso"; Maps link con freccia.

Nessuno scroll orizzontale (verificato `scrollWidth` = viewport).

## 6. Movimento

Solo la pressa sull'indirizzo (motion-designer §6.7). Con reduced motion
`usePressione` mette subito lo stato finale; il CSS della sezione non ha
animazioni proprie (le transizioni dei bottoni sono di interaction.css).

## 7. Verifica

Dev server `npx vite --port 8107 --strictPort`, Playwright Chromium con
SwiftShader, anche `?gl=0`. Screenshot in `/tmp/claude-0/shots-bottega/`
(375, 768, 1440, e `-gl0`). Durante la verifica le altre sezioni erano in
scrittura (errori di sintassi transitori in Hero/Tecniche): per isolare la
bottega lo script ha sostituito i loro moduli con uno stub via
`page.route`, senza toccare i file. `tsc` e `eslint` puliti sui file della
sezione.
