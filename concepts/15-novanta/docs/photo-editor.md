# Photo-editor · Concept 15 · NOVANTA

Ondata 2. File miei: `src/pages/concepts/novanta/assets/foto/*` (i file .webp e
`index.ts`) e questo documento. L'art-director aveva lasciato `FOTO = {}` (piano B):
su indicazione dell'orchestratore ho sovrascritto `index.ts` tenendo gli stessi
export (`FOTO`, `CI_SONO_FOTO`, `ChiaveFoto`, `FotoNovanta`) e aggiungendo solo
campi nuovi.

## 1. Esito

**Piano A: tre foto dello studio vuoto.** Nessuna persona, nessuna mano, nessun
modello anatomico, nessun marchio leggibile. Tutte e tre vengono dalla stessa
serie su Wikimedia Commons (un piccolo studio di terapia tedesco fotografato
vuoto nel 2023), quindi hanno la stessa luce e gli stessi pavimenti: sembrano
davvero un unico studio.

| Chiave | Angolo | Cosa si vede | File (1200w / 640w) | Peso 1200w / 640w |
|---|---|---|---|---|
| `studio` | 0° | Stanza stretta, lettino con cuscino per il viso e rullo arancio, finestra con tenda chiara e due piante, quadro del pontile | `studio-1200.webp` 1200×2400 / `studio-640.webp` 640×1280 | 101,7 KB / 45,1 KB |
| `attrezzi` | 60° | Tappetino blu arrotolato, cuscino di equilibrio, tappetini rossi, tavolette propriocettive, un rullo, sedia; in fondo una porzione di lettino | `attrezzi-1200.webp` 1200×1801 / `attrezzi-640.webp` 640×961 | 80,9 KB / 29,9 KB |
| `ingresso` | 180° | Angolo d'attesa: poltrona grigia, lampada di carta accesa, tavolino (striscia 1:2) | `ingresso-1200.webp` 1200×2400 / `ingresso-640.webp` 640×1280 | 102,8 KB / 42,0 KB |
| `ingresso.fascia` | 180° mobile | Stesso angolo, due poltrone, lampada, termosifone (taglio 12:5 per la fascia 335×140) | `ingresso-fascia-1200.webp` 1200×500 / `ingresso-fascia-640.webp` 640×267 | 41,4 KB / 13,1 KB |

Budget del tech-architect rispettati: ogni 1200w ≤ 110 KB, ogni 640w ≤ 50 KB,
massimo tre foto. A 375 si scarica solo la fascia di 180° (≈ 41 KB a DPR 3).

Nota: la chiave `ingresso` resta per non rompere il contratto e `ALT_FOTO` del
copywriter, ma la foto è **l'angolo d'attesa**, non una porta: il CD accettava
"foto dell'ingresso o della sala". Nessuna foto credibile di un ingresso vuoto
senza insegne altrui.

## 2. Crediti (obbligatori, CC BY 4.0)

Autore di tutte e tre: **PantheraLeo1359531**, Wikimedia Commons, licenza
**CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). Modifiche: ritaglio,
ridimensionamento, conversione in .webp.

| Chiave | Pagina della fonte |
|---|---|
| `studio` | https://commons.wikimedia.org/wiki/File:Praxis_Ergotherapie_J%C3%BCrgen_Renner_20231018_HOF00895-HDR_RAW-Export.png |
| `attrezzi` | https://commons.wikimedia.org/wiki/File:Praxis_Ergotherapie_J%C3%BCrgen_Renner_20231018_HOF00850-HDR_RAW-Export_cens.png |
| `ingresso` | https://commons.wikimedia.org/wiki/File:Praxis_Ergotherapie_J%C3%BCrgen_Renner_20231018_HOF00990-HDR_RAW-Export.png |

`index.ts` esporta `CREDITI_FOTO` con la riga da mettere nel piede
("Foto: PantheraLeo1359531, Wikimedia Commons, CC BY 4.0 (ritagliate).").
Il nome dello studio della fonte non va scritto da nessuna parte nel sito.

## 3. Tagli (verificati uno per uno con Read)

Sorgente: miniature 3840 px di Commons (gli originali da 6000+ px erano bloccati
dal limite di richieste di Wikimedia; 3840 basta per il 1200w senza ingrandire).

- **studio**: da HOF00895, fascia verticale 1:2 da x 51,5% della larghezza, tutta
  l'altezza. Esclusi di proposito: il pupazzo a forma di rana sopra lo scaffale,
  la sedia con l'asciugamano, il bastone oscillante.
- **attrezzi**: da HOF00850, x 0-32%, y 30-80%, 2:3. Esclusi: il tavolo con i
  pennarelli (è uno studio di ergoterapia), il lampadario di carta. In basso resta
  un pezzo di sgabello bianco da bagno: accettabile, si può spingere fuori con
  `object-position` (`fuoco`).
- **ingresso**: da HOF00990, striscia 1:2 da x 45,5%; fascia 12:5 x 6-86%,
  y 30-72%. Esclusa la finestra a destra, che ha adesivi per bambini sul vetro.

Scartate (guardate con Read): tutte le altre 47 foto della stessa serie (stanze
per bambini con altalene, parete da arrampicata, calciobalilla, banco da
falegname; due con una sagoma sfocata dietro il vetro di una porta: persona,
vietato); HeilkundePraxis Werder (poster anatomico sul muro, e in un'altra foto
un uomo in piedi); MEDIMAX Tel Aviv (logo di un'altra attività, box con "04");
Curezone (scritta "PHYSIO THERAPY" e marchio); Karelia 2009 (apparecchi di
elettroterapia datati, aria da ospedale); spalliera di Ivan Radic su Flickr
(persone riflesse nello specchio e 1024 px al massimo); lettino abbandonato di
zeitfaenger.at (stanza in rovina); tutte le altre con terapisti o pazienti.

## 4. Fonti provate

| Fonte | Esito |
|---|---|
| Unsplash (`unsplash.com/napi/search`, pagina di ricerca) con curl | 307/401 → pagina anti-bot "Making sure you're not a bot!" |
| Openverse `api.openverse.org`, licenze commerciali, 22 ricerche (EN/IT/DE/FR) | candidati utili solo da Wikimedia; Flickr quasi sempre persone o 1024 px |
| Wikimedia Commons API | trovata la serie; limite di richieste 429 frequente (IP condiviso): gestito con richieste raggruppate e attese |

TLS sempre verificato (curl con il bundle del proxy), nessun flag allentato.

## 5. Uso nelle sezioni

- Leggere `FOTO[chiave]`; se `undefined` resta il piano B già previsto.
- `<img src srcset sizes width={w} height={h} alt decoding="async">`, `aspect-ratio`
  dal `w/h`, `object-fit: cover` e `object-position: fuoco` nella striscia 280 px.
- 180° a 375: usare `FOTO.ingresso.fascia` (src/srcset/w/h propri), stesso `alt`.
- Trattamento: velatura albicocca `multiply` 12% + filtro di `FOTO_TRATTAMENTO`.
  Le foto sono calde (legno, muri tortora): con la velatura stanno nella palette.

## Richieste ad altri agent

- **art-director**: in `docs/art-director.md` §6 e nella tabella dei file il piano B
  risulta attivo; ora ci sono tre foto. Aggiornare (e rivedere la scelta "gradi a
  26 svh", pensata per il caso senza foto) e controllare le foto velate a schermo.
- **copywriter**: `ALT_FOTO` in `content/testi.ts` non corrisponde più. Proposte
  sulle foto vere (sono anche in `index.ts`): studio "Una stanza dello studio
  vuota: il lettino con il cuscino per il viso e un rullo, la luce della finestra
  e due piante sul davanzale."; attrezzi "Attrezzi appoggiati al muro: un
  tappetino arrotolato, un cuscino di equilibrio, le tavolette propriocettive e un
  rullo."; ingresso "L'angolo d'attesa dello studio: una poltrona grigia accanto a
  una lampada di carta accesa." Aggiungere nel piede i crediti (`CREDITI_FOTO`).
- **scaffold-engineer**: `index.ts` importa i .webp con `?url` (serve
  `vite/client` nei tipi). Campi nuovi: `licenza`, `fuoco`, `fascia?`.
- **creative-director**: se tre foto dello stesso studio tedesco (prese tedesche
  sul muro) sembrano poco "Pordenone", togliere una chiave da `FOTO` basta a
  tornare al piano B per quell'angolo; la più sacrificabile è `attrezzi`.
