# ottografie.nl

Fonte: https://www.ottografie.nl · catturato 26/09/2026 a 1440x900 e 375x812 (Playwright, richieste servite via curl). Screenshot in `concepts/12-sottopelle/qa/taste/`.

# Design Map

## Spacing Scale
20, 30, 106, 211, 313 px (base: posizioni libere (scarti -68/-41/-15px))

## Font Hierarchy
- nome categoria: 180px / 400 / Big Caslon, tracking -5.4px
- contatore (09): ~20px / 400 / Big Caslon corsivo
- etichette: 14px / 400 / Suisse Intl maiuscolo

## Color Palette
- intro: `#000000`
- parete: `#F5F0EB`
- testo: `#181716`
- pillola 'View Project': `rgba(23,23,23,0.8)`

## Image Ratios
- tessere: 0.75:1 e 1.78:1 misti

## Component Tokens
- raggi: 100% (cursore), 53px (pillola), 0px (foto)
- ombre: nessuna
- griglia: {'max_width': 'nessuno (superficie trascinabile)', 'columns': 'libere', 'gutter': 'irregolare'}

---

# Taste DNA

### Parete libera, foto a distanze irregolari
- **Trigger**: Portfolio di centinaia di scatti
- **Decision**: Superficie trascinabile con foto di formati misti posate con scarti irregolari e molto vuoto, invece di una griglia a colonne
- **Reason**: Il vuoto tra le foto fa sembrare ogni scatto appeso, non impaginato: si guarda uno alla volta
- **Evidence**: foto 217x289 e 335x447 a distanze diverse; ~55% della finestra vuota; scarti negativi -68/-41/-15px

### Titolo gigante in mezzo alla parete
- **Trigger**: Orientarsi tra le categorie
- **Decision**: Nome della categoria a 180px al centro dello schermo mentre si trascina, invece di un menu fisso
- **Reason**: Dice dove sei senza chrome; ma copre le foto e fa da poster
- **Evidence**: h2 180px Big Caslon; contatore (09)

### Il desktop prima di tutto (rifiutato qui)
- **Trigger**: Telefono in verticale
- **Decision**: Mostra '(Please rotate your device)' a 375px invece di adattare la parete
- **Reason**: La parete a trascinamento e' pensata solo per mouse: l'esatto opposto di quello che serve a SOTTOPELLE
- **Evidence**: 375x812: solo la scritta di rotazione; cursore custom cerchio '+'; intro con conteggio e video prima della parete
