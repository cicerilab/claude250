# hotelparticulier.com

Fonte: https://www.hotelparticulier.com  
Cattura: 2026-09-26, 1440x900, pagina 5345 px; le foto non si caricano in headless (riquadri #E0E0E0), valori di immagine approssimati. Screenshot in `concepts/20-imbrunire/qa/taste/`.

## Design Map

### Colori

- **nav**: #DFBEB7 rosa cipria (41% dell'area)
- **frame**: #000000 cornice nera attorno al video (37%)
- **text**: #FFFFFF, #424242

### Tipografia

- **display**: Gotham Medium 38 px maiuscolo
- **text**: Roboto 300 14/20 px, tracking largo
- **nav**: 11,3 px maiuscolo spaziato

### Forme

- **radius**: 2 px
- **shadow**: una sola, 0 0 8px rgba(0,0,0,.3)
- **frame**: video d'apertura dentro una cornice nera di 50 px

## Taste DNA

### La casa come cornice
- Decisione: Il video d'apertura sta dentro un passe-partout nero di 50 px, non al vivo
- Perché: Suggerisce 'si guarda dentro una casa': è la stessa idea della sezione, fatta con un bordo
- Prova: viewport: riquadro 1340x780 dentro nero

### Indirizzo come firma
- Decisione: '23, AVENUE JUNOT, PAVILLON D' in basso sul video
- Perché: Il luogo preciso vale più di uno slogan
- Prova: fullpage: didascalia 11 px bianca sotto il video

### Da non seguire: testo 14 px peso 300 su rosa
- Decisione: Corpo sottile e piccolo su rosa cipria
- Perché: Contrasto e leggibilità bassi; in IMBRUNIRE il corpo è 16-17 px peso 400 su notte
- Prova: DOM body Roboto 300 14 px
