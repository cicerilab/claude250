<!-- /taste · https://www.fellowbarber.com · catturato 26/09/2026 con Playwright (Chromium 1440x900) + references/extract.js -->

# Design Map

## Spacing Scale
13px, 15px, 39px, 42px, 75px (unità base: irregolare)

## Font Hierarchy
- statement: 42px / 400 / reckless
- h3: 24px / 500 / reckless
- nav: 16px / 400 / NeueHaasGroteskText Std
- button: 16px / 500 / maiuscolo, tracking 3.2px

## Color Palette
- header/background: `#EBE7DF`
- accent: `#00B373`
- dark surface/button: `#363636`
- footer: `#2B2B2B`
- text: `#363636`

## Image Ratios
- prodotto: 0.65:1
- hero video: 2.4:1

## Component Tokens
- raggi: 0px
- ombre: 0 2px 10px rgba(54,54,54,.15)
- griglia: {"max_width": "1440px", "columns": 4, "gutter": "variabile"}

---

# Taste DNA

### Il verde come filo
- **Trigger**: Quando si separano le voci di navigazione
- **Decision**: Scelti filetti verticali verdi #00B373 da 1px tra le voci invece di spaziature o puntini
- **Reason**: L'accento compare in un dettaglio funzionale piccolo e poi a campo pieno nella fascia stampa: riconoscibile, ma al 21.7% della superficie diventa decorazione
- **Evidence**: nav: Book | Shop | Discover | Special Events | Careers con separatori verdi; background #00B373 areaPct 21.7

### 'Book' è la prima voce
- **Trigger**: Quando si ordina la navigazione
- **Decision**: Scelto 'Book' come prima voce e un bottone 'BOOK NOW' pieno #363636 a destra, invece di relegare la prenotazione a una pagina interna
- **Reason**: Una catena di saloni vive di appuntamenti; ripeterlo in due posti nella stessa fascia è la loro misura di priorità (noi ne teniamo uno solo)
- **Evidence**: header 112px con due richiami alla prenotazione; bottone maiuscolo tracking 3.2px, raggio 0

### Hero che dipende da un terzo (errore)
- **Trigger**: Quando la prima schermata è un video incorporato
- **Decision**: Scelto un iframe YouTube come hero invece di un'immagine propria
- **Reason**: Se il video non è disponibile la prima schermata diventa 'Video unavailable': 600px di nero con il logo di un altro
- **Evidence**: screenshot 1440: 'YouTube Video unavailable' al posto dell'hero; focusVisible false, reducedMotion false
