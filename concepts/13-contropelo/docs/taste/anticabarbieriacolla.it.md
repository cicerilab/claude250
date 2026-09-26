<!-- /taste · https://www.anticabarbieriacolla.it · catturato 26/09/2026 con Playwright (Chromium 1440x900) + references/extract.js -->

# Design Map

## Spacing Scale
8px, 20px, 24px, 28px, 40px (unità base: 4)

## Font Hierarchy
- h1/hero: 60px / 300 / IBM Plex Serif
- h2: 38px / 300 / IBM Plex Serif
- body: 18px / 400 / Inter
- nav: 15.2px / 400 / Inter (maiuscolo spaziato)
- small: 12px / 400 / Inter

## Color Palette
- background-alt: `#F7F5F1`
- background: `#FFFFFF`
- accent (bottoni): `#A6192E`
- top-bar: `#CABFA5`
- text: `#000000`
- text-muted: `#94886C`

## Image Ratios
- hero salone: 1.50:1 (1920x1278) a tutta larghezza
- prodotti: 1:1

## Component Tokens
- raggi: 40px, 32px, 4px
- ombre: 0 8px 48px rgba(0,0,0,.15)
- griglia: {"max_width": "1440px", "columns": 4, "gutter": "20px"}

---

# Taste DNA

### Il salone vero come prova
- **Trigger**: Quando si apre la home di una barbieria storica
- **Decision**: Scelta una foto larga del salone reale (specchi, poltrone bianche, pareti di ritratti) sotto velatura scura, invece di una foto di prodotto o di un modello
- **Reason**: Per chi deve entrare in un posto fisico la prova è il posto: gli specchi in fila dicono 'più poltrone, un mestiere' senza testo
- **Evidence**: hero-location-2026.jpg 1920x1278 a 1440px; screenshot: specchi e poltrone in prospettiva, velatura scura sotto il titolo

### Orari scritti come li dice il barbiere
- **Trigger**: Quando si comunicano orari e posizione
- **Decision**: Scelto testo corrente in tre righe ('Dal Martedì al Sabato / Mattino 9:30 – 13:00 · Pomeriggio 14:30 – 19:00 / Chiuso Domenica, Lunedì e Festivi') più 'Apri in mappa', invece di una tabella giorno per giorno o una mappa incorporata
- **Reason**: Il cliente vuole sapere se oggi è aperto; una frase si legge in un colpo, una tabella di 7 righe no
- **Evidence**: sezione 'Dove siamo' a metà pagina; bottone 'Apri in mappa' a contorno, raggio 40px

### Il prezzo del taglio non c'è (restrizione sbagliata)
- **Trigger**: Quando si decide cosa mostrare in home
- **Decision**: Scelto di mostrare i prezzi dei prodotti dello shop (€ 36-120) e nascondere quelli dei servizi dietro 'Prenota l'esperienza', invece di un listino dei servizi
- **Reason**: È una scelta commerciale (shop prima del salone); per una barberia di quartiere è l'errore da non fare: il prezzo della barba è la prima domanda
- **Evidence**: testo home: 8 prodotti con prezzo, 0 servizi con prezzo; due CTA pieni #A6192E 'Prenota l'esperienza' e 'Entra nello shop' affiancati
