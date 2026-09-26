<!-- /taste · https://pankhurstlondon.com · catturato 26/09/2026 con Playwright (Chromium 1440x900) + references/extract.js -->

# Design Map

## Spacing Scale
16px, 24px, 40px, 48px (unità base: 8)

## Font Hierarchy
- hero statement: 40px / 400 / Fraunces
- h2: 48px / 400 / Fraunces
- body: 16px / 400 / Red Hat Text
- nav/meta: 12-14px / 400 / Red Hat Text

## Color Palette
- background: `#FFFFFF`
- surface-alt: `#F4F4F4`
- text/CTA: `#000000`
- text on photo: `#FFFFFF / rgba(255,255,255,.8)`
- muted: `#666666 / #999999`

## Image Ratios
- ritratto: 0.67:1
- prodotto: 1:1

## Component Tokens
- raggi: 0px
- ombre: inset 0 0 0 1px (bordi bottone)
- griglia: {"max_width": "1360px", "columns": 3, "gutter": "40px margini laterali"}

---

# Taste DNA

### Un messaggio, un bottone
- **Trigger**: Quando si apre la prima schermata
- **Decision**: Scelti una frase di 40px, una riga di 16px e un solo bottone nero rettangolare 'BOOK NOW', invece di due CTA o di un carosello
- **Reason**: Chi arriva deve capire che si prenota; un solo gesto possibile toglie la scelta
- **Evidence**: screenshot 1440: un solo bottone 64x51 circa a x=40; nessun secondo CTA nella prima schermata

### Nessun colore
- **Trigger**: Quando si sceglie l'accento
- **Decision**: Scelto solo nero/bianco/grigi (#000, #FFF, #F4F4F4, #666) invece di un colore di marca
- **Reason**: Lusso inglese: il colore lo mettono le foto; per noi l'insegnamento è l'opposto speculare, un solo colore con un solo significato
- **Evidence**: accentCandidates: solo #000 e #FFF; radius unico 0px

### Il tempo come promessa
- **Trigger**: Quando si scrive il posizionamento
- **Decision**: Scelta la frase 'every visit is an opportunity to slow the clock' invece di elenchi di servizi
- **Reason**: Vende il tempo passato in poltrona, non il taglio; per un barbiere di quartiere va tradotto in concreto (le mezz'ore della lista), non in slogan
- **Evidence**: riga di 16px sotto il titolo nella prima schermata
