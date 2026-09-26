# bangbangforever.com

Fonte: https://bangbangforever.com · catturato 26/09/2026 a 1440x900 e 375x812 (Playwright, richieste servite via curl). Screenshot in `concepts/12-sottopelle/qa/taste/`.

# Design Map

## Spacing Scale
12, 17, 33.6, 80, 100 px (base: ~17 (non sistematico))

## Font Hierarchy
- hero wordmark: 72px / 400 / bebas-neue, tracking ~12px
- nome artista h2: 33.6px / 400 / bebas-neue
- bottone VIEW GALLERY: 21px / 400 / bebas-neue, sottolineato
- testo: 12px / 400 / Droid Sans Mono, lh 19.2px

## Color Palette
- fondo (85.7% area): `#151515`
- testo corpo: `#A8A8A8`
- testo secondario: `#C2C2C2`
- titoli: `#FFFFFF`
- fondo ritratti (foto): `#FFFFFF`
- banner cookie: `#EDEDED`

## Image Ratios
- ritratti artisti: 1:1, 215px
- hero/galleria: 16:9 e 1.9:1

## Component Tokens
- raggi: 0px (bottoni, foto), 50% (4 icone)
- ombre: rgba(0,0,0,0.1) 0 0 75px (invisibile su #151515)
- griglia: {'max_width': '~960px (4 colonne da 215px)', 'columns': 4, 'gutter': '~34px'}

---

# Taste DNA

### Il nero pieno come muro, la foto come luce
- **Trigger**: Studio con 30+ artisti da presentare in una pagina
- **Decision**: Fondo unico #151515 su 85.7% della superficie, ritratti in bianco e nero su fondo bianco che fanno da unici punti luminosi, invece di alternare sezioni chiare e scure
- **Reason**: In una pagina lunghissima (17113px) l'occhio si orienta sulle macchie chiare: ogni ritratto e' un segnaposto visivo
- **Evidence**: bg #151515 area 85.7%; ritratti 1:1 con fondo #FFF; nessuna sezione chiara

### Monospace ovunque: la trappola
- **Trigger**: Dare un tono 'da studio' ai testi biografici
- **Decision**: Droid Sans Mono 12px per tutto il corpo (943 elementi) invece di un grotesk da lettura
- **Reason**: Legge come carattere di cartellino, ma a 12px con righe di 30 caratteri i paragrafi di 8 righe stancano: e' esattamente la ricetta vietata
- **Evidence**: body 12px/19.2px mono; colonne da 215px; nessun max-width in ch

### Il nome in maiuscolo condensato, niente decoro
- **Trigger**: Ogni artista ha bisogno di un'etichetta forte
- **Decision**: Bebas maiuscolo 33.6px + bottone quadrato a contorno 'VIEW GALLERY', zero ombre e zero raggi
- **Reason**: La ripetizione identica 32 volte rende la pagina un catalogo di schede uguali: chiarezza, ma nessuna gerarchia tra lavori
- **Evidence**: h2 33.6px x54; radius 0; stesso modulo ripetuto
