# bendpak.com · /taste per SOTTOSCOCCA

Fonte: https://www.bendpak.com (catturata il 26/09/2026, Playwright 1.56, 1440x900). Perché è qui: produttore di ponti sollevatori (l'oggetto del concept).

## Design Map

**colori**
- hero_fondo: #1E1E1E circa (video scuro)
- superficie_chiara: #F0F2F4 (36,7% area)
- bianco: #FFFFFF (17,9%)
- navy_testo_e_bottoni: #152D45 (6,1%)
- inchiostro: #121C26
- giallo_cta: #FFDE17 (1,6% area, solo bottone hero, badge NEW, striscia promo)

**tipografia**
- display: Host Grotesk 700, h1 70px / 87,5px
- corpo: Inter 14-18px, 400/500
- etichette: Space Grotesk maiuscolo spaziato su bottoni e barra promo

**spaziatura**
- gap_sezioni: 172px
- griglia: 3 colonne da 425px, gap 32px

**raggi**: 20px (84 elementi, schede prodotto); pillola 999px (69, bottoni); 4px

**ombre**: rgba(63,63,68,.4) 0 4px 10px solo sul banner cookie

**movimento**: transizioni 0,3s cubic-bezier(0.4,0,0.2,1) su opacity/transform

## Taste DNA

### Lo slogan fa il lavoro dell'oggetto
- Trigger: Hero su video scuro con il ponte che non si vede nel primo fotogramma
- Decisione: Titolo 'We lift what moves you.' 70px centrato, un bottone giallo a pillola
- Ragione: Il catalogo è enorme (decine di modelli): la home non può mostrare un ponte, allora vende una promessa
- Evidenza: viewport 1440x900: nessun ponte visibile, 4 tessere categoria con icona e freccia in basso

### Giallo industriale razionato
- Trigger: Mondo attrezzatura d'officina con giallo/nero di sicurezza ovunque
- Decisione: #FFDE17 sotto il 2% dell'area, solo sulla CTA principale e sui badge
- Ragione: Il giallo resta un segnale e non diventa nastro di pericolo
- Evidenza: backgroundColors: #FFDE17 1,6%

### Schede prodotto su grigio
- Trigger: Prodotti scontornati di colori diversi (rosso, giallo, grigio)
- Decisione: Tessere #F0F2F4 raggio 20px, oggetto centrato
- Ragione: Uniformare un catalogo eterogeneo
- Evidenza: mid-page: fila di 4 schede grigie con equilibratrice, porta-ruote, cric

### Restrizione mancata
- Trigger: Pagina da 11.991px
- Decisione: Promo, banner, cookie, chat, torna-su, carosello: tutto insieme
- Ragione: E-commerce B2B che misura la conversione per sezione
- Evidenza: footer: 4 colonne di link, 3 numeri di telefono, fila di loghi dei marchi
