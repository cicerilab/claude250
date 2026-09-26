# shamrocksocialclub.com

Fonte: https://www.shamrocksocialclub.com · catturato 26/09/2026 a 1440x900 e 375x812 (Playwright, richieste servite via curl). Screenshot in `concepts/12-sottopelle/qa/taste/`.

# Design Map

## Spacing Scale
8, 11, 16, 22.4, 32 px (base: ~8 (Squarespace fluid engine))

## Font Hierarchy
- wordmark gotico: ~130px / n/d (immagine/SVG) / blackletter
- h2 'New Location': 55.7px / 600 / ivymode
- corpo: 17.7px / 400 / athelas-web, lh 28.4px

## Color Palette
- fondo hero/sezioni scure (54.6%): `#000000`
- fondo sezioni chiare (44.4%): `#FFFFFF`
- bottoni pieni: `#2E2D2A`
- segnaposto mappa: `#E5E3DF`

## Image Ratios
- hero: 16:9 a tutta finestra
- ritratti artisti: 0.91:1

## Component Tokens
- raggi: 0px ovunque
- ombre: nessuna
- griglia: {'max_width': '1440px fluido', 'columns': 26, 'gutter': '11px'}

---

# Taste DNA

### Il gotico come firma, una volta sola
- **Trigger**: Dare identita' da tatuaggio tradizionale senza sembrare un negozio di souvenir
- **Decision**: Fraktur solo nel nome in grande sull'hero; tutto il resto in un serif da libro (athelas 17.7px) invece di gotico ovunque
- **Reason**: La fraktur a corpo grande e' leggibile e riconoscibile come 'lettering da pelle'; in un paragrafo diventa rumore
- **Evidence**: wordmark ~130px su 2 righe; corpo athelas-web 17.7px; nessun altro testo gotico

### Ritratto del fondatore invece dei lavori
- **Trigger**: Prima schermata
- **Decision**: Foto in bianco e nero del titolare a tutta finestra + macchinetta e guanti nella seconda sezione, invece di mostrare tatuaggi guariti
- **Reason**: Vende la leggenda della persona: funziona per un nome famoso, per uno studio di provincia sarebbe vuoto (e la macchinetta con guanti e' vietata qui)
- **Evidence**: hero 1440x810 ritratto; sezione 2: sessione in corso; illustrazioni rosa/teschio e aquila

### Nessuna ombra, nessun raggio
- **Trigger**: Componenti del modulo e bottoni
- **Decision**: Raggio 0 e ombre assenti su bottoni #2E2D2A e campi, invece dei default arrotondati del template
- **Reason**: Tiene il tono da insegna stampata anche dentro un template commerciale
- **Evidence**: radii []; shadows []; bottoni padding 22.4/32px
