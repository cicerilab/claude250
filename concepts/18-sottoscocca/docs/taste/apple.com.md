# apple.com · /taste per SOTTOSCOCCA

Fonte: https://www.apple.com/it/airpods-pro/ (catturata il 26/09/2026, Playwright 1.56, 1440x900). Perché è qui: pagina prodotto con scroll che guida un oggetto e testi a tappe.

## Design Map

**colori**
- fondo: #F5F5F7 (81,7%)
- bianco: #FFFFFF (12,5%)
- inchiostro: #1D1D1F
- secondario: #6E6E73
- azione: #0071E3 bottone, #0066CC link

**tipografia**
- display: SF Pro Display 600: h3 96px / 100px tracking -1,44px; h2 56px / 59,5px
- corpo: SF Pro Text 17px, grande 21-28px grigio con parole chiave in nero
- piccolo: 12px per note e navigazione

**spaziatura**
- altezza_documento: 27.914px
- barra_prodotto: barra sticky 52px con Panoramica / Specifiche / Confronta / Acquista

**raggi**: 28px (52); 50%; 980px pillola

**ombre**: nessuno

**movimento**: background-color 0.24s cubic-bezier(0.4,0,0.6,1); prefers-reduced-motion gestito (true)

## Taste DNA

### Una frase, un fatto, un'immagine per schermo
- Trigger: Prodotto con molte caratteristiche tecniche
- Decisione: Ogni schermata ha un titolo da 56-96px e un paragrafo, niente liste
- Ragione: Lo scroll diventa la sequenza di una dimostrazione
- Evidenza: mid1: 'Solo per le tue orecchie.' 96px centrato, un paragrafo di 5 righe

### Prezzo e azione nell'apertura
- Trigger: Pagina emozionale lunga
- Decisione: '€ 249' + 'Acquista' in una capsula già nella prima schermata
- Ragione: Chi ha già deciso non deve scorrere 28.000px
- Evidenza: viewport: capsula prezzo+bottone sotto il titolo

### Barra locale sticky
- Trigger: Pagina da 27.914px
- Decisione: Barra sticky con nome prodotto e 3 ancore + Acquista
- Ragione: Orientarsi senza tornare su
- Evidenza: mid1: barra 52px bianca in alto

### Restrizione: nessuna ombra
- Trigger: Oggetto bianco su fondo chiaro
- Decisione: shadows: [] nel DOM, profondità solo nelle foto
- Ragione: L'interfaccia non compete con il rendering del prodotto
- Evidenza: effects.shadows vuoto
