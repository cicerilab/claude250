# palazzoexperimental.com

Fonte: https://www.palazzoexperimental.com  
Cattura: 2026-09-26, Chromium headless 1440x900, pagina 18085 px (viewport + metà + piede). Screenshot in `concepts/20-imbrunire/qa/taste/`.

## Design Map

### Colori

- **canvas**: #EFDAC9 (68% dell'area)
- **band-dark**: #000000 (13%)
- **scrim-foto**: rgba(0,0,0,.4) (10%)
- **text-on-dark**: #FFFFFF
- **text-on-light**: #000000

### Tipografia

- **display**: Nantes 400, h1 60/72 px, blocchi di sezione 120 px maiuscolo
- **text**: Linux Biolinum 18 px (685 nodi), paragrafi introduttivi 32/38 px
- **tracking**: +0,18 px sui titoli, nessun maiuscoletto spaziato

### Forme

- **radius**: 0 sulle foto e sulle bande; 999 px solo sul bottone BOOK NOW
- **shadow**: nessuna percepibile
- **container**: a tutta larghezza, padding laterale 30 px

## Taste DNA

### Il marchio è un oggetto fotografato
- Decisione: Aprire con un'insegna vera (terrazzo con lettere incise, foto a tutto schermo) invece di un logo disegnato
- Perché: L'identità del palazzo sta nei materiali veneziani: mostrarli fotografati dice 'posto vero' prima di qualsiasi frase
- Prova: viewport: lastra di terrazzo con lettere dorate incise su muro di mattoni, 1440x900, nessun titolo HTML sopra

### Due registri e basta
- Decisione: Nero pieno per le bande di titolo, sabbia #EFDAC9 per il testo lungo, nessun terzo fondo
- Perché: Il cambio di fondo fa da divisore: non servono filetti o onde
- Prova: mid: banda nera 'PRIVATE EVENTS' 120 px sopra la sabbia, confine netto senza linea

### Restrizione: niente decoro in pagina
- Decisione: Rinunciano a icone, schede, ombre; il decoro vive solo nella foto e nel logotipo
- Perché: Un palazzo storico pieno di materiali non ha bisogno di ornamento grafico aggiunto
- Prova: raggi 0 sulle foto, ombre assenti, un solo bottone a pillola in tutta la pagina
