# drwoo.com

Fonte: https://www.drwoo.com · catturato 26/09/2026 a 1440x900 e 375x812 (Playwright, richieste servite via curl). Screenshot in `concepts/12-sottopelle/qa/taste/`.

# Design Map

## Spacing Scale
4, 10, 11, 20, 30 px (base: ~10)

## Font Hierarchy
- logo: ~28px / n/d / lettering
- barra (citta', ora, Rx): 11px / 400 / MaisonNeue mono-like, maiuscolo
- titoli interni: 21.6-39.6px / 500 / futura-pt

## Color Palette
- foto a tutta finestra scurita: `~#2A2826 medio`
- testo barra: `#FFFFFF`
- unico testo rosso: `#D2232A`

## Image Ratios
- hero: a tutta finestra 1440x900 e 375x812 (cover)

## Component Tokens
- raggi: 0px
- ombre: nessuna
- griglia: {'max_width': 'nessuno', 'columns': 0, 'gutter': '30px margini'}

---

# Taste DNA

### Il lavoro guarito e' la prima schermata
- **Trigger**: Come si presenta un tatuatore di linea fine famoso
- **Decision**: Una sola foto di due avambracci con rose in nero e grigio a tutta finestra, niente titolo, niente bottone, invece di un hero con slogan
- **Reason**: Chi cerca un tatuatore giudica le linee e i neri: mostrare subito la pelle vera e' la prova piu' forte
- **Evidence**: viewport 1440x900 occupato al 100% dalla foto; nessun h1; testo solo nella barra a 11px

### Foto abbassata di tono e con grana
- **Trigger**: Unificare foto di provenienza diversa
- **Decision**: Esposizione ridotta e grana visibile su tutta la foto invece della foto nitida a colori veri
- **Reason**: Crea atmosfera notturna coerente, ma nasconde proprio i dettagli (linee, pelle) che un cliente vuole valutare
- **Evidence**: foto media ~#2A2826; grana fine a tutto schermo; contrasto delle linee ridotto

### Nessuna struttura visibile: il sito e' un'immagine
- **Trigger**: Navigazione
- **Decision**: Un '+' in alto a sinistra apre un menu, barra con 'LOS ANGELES 11:00PM PST Rx', nessun elenco dei servizi
- **Reason**: Funziona solo per chi ha gia' deciso; per chi arriva la prima volta non c'e' un percorso (e l'ora nella barra e' un vezzo vietato qui)
- **Evidence**: 8 link totali; body 11px; nessun contenuto oltre la foto a 375
