# igloo.inc · /taste per SOTTOSCOCCA

Fonte: https://www.igloo.inc (catturata il 26/09/2026, Playwright 1.56, 1440x900). Perché è qui: Awwwards sito dell'anno 2024: un solo oggetto 3D con camera guidata dallo scroll.

## Design Map

**colori**
- fondo: #A0A5B1 (100% area, grigio azzurro freddo)
- linee: bianco pieno, spessore 1px, con numeri minuscoli ai vertici
- oggetto: igloo grigio chiaro con giunti bianchi

**tipografia**
- dom: nessun testo nel DOM (solo 'Times New Roman' di default): tutto il testo vive nel canvas

**spaziatura**
- altezza_documento: 900px: lo scroll è intercettato, non nativo

**raggi**: nessuno

**ombre**: nessuno

**movimento**: loader ASCII '==---==+==' circa 20s in headless; poi la rotella fa scendere la camera verso l'oggetto mentre il reticolo si infittisce

## Taste DNA

### Un oggetto, una camera, un asse
- Trigger: Scena 3D al centro di tutto
- Decisione: L'igloo resta fermo al centro; si muove solo la camera, avvicinandosi
- Ragione: L'occhio non deve cercare: il racconto è la distanza
- Evidenza: s2 e s4: stesso oggetto nella stessa posizione, cambia scala e densità del reticolo

### Struttura come ornamento
- Trigger: Oggetto low-poly che da solo sarebbe povero
- Decisione: Reticolo di linee bianche 1px e numeri ai nodi
- Ragione: Il wireframe dichiara 'questo è costruito', trasforma il low-poly in scelta
- Evidenza: s2: igloo in contorno bianco, numeri 2 cifre ai vertici

### Monocromia fredda
- Trigger: Scena con tanti segni
- Decisione: Solo #A0A5B1 e bianco
- Ragione: Con zero colori la gerarchia la fa la luminosità
- Evidenza: backgroundColors 100% un solo valore

### Prezzo pagato (restrizione rovesciata)
- Trigger: Esperienza tutta nel canvas
- Decisione: Nessun testo DOM, loader lungo, scroll intercettato
- Ragione: Sito-vetrina di uno studio: il pubblico è disposto ad aspettare
- Evidenza: DOM vuoto, scrollHeight 900, 20s di loader: tutto ciò che SOTTOSCOCCA NON può fare
