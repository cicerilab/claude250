# playbalatro.com

Fonte: https://www.playbalatro.com/  
Cattura: 2026-09-26, 1440x900 e 375x812, metodo curl; full page 2763 px. Screenshot e dati DOM in `concepts/11-tajut/qa/taste-curl/` (file `playbalatro.com-*`).

## Design Map

### Colori

- **canvas**: #121017 (84%) con righe orizzontali da schermo e fumo rosso/blu
- **links**: #00D5A9 verde acqua per la nav
- **accents**: rosso #900204 e blu #0E62A5 solo nel fumo del marchio

### Tipografia

- **all**: m6x11 (font a pixel) 30/48,75 px per il testo, anche in nav
- **display**: marchio disegnato, carta dell'asso incastrata tra le lettere

### Forme e movimento

- **card**: jolly grande ruotato circa -3°, bordo bianco, ombra rgba(0,0,0,.85) 0 12px 20px
- **radius**: 6 px sulle carte, 9999 px sui badge
- **motion**: opacity 0,15 s cubic-bezier(.4,0,.2,1); entrata lenta 1,3 s; prefers-reduced-motion gestito

## Taste DNA

### La carta dentro il nome
- Decisione: L'asso di picche prende il posto di una lettera nel marchio
- Perché: Il logo dice il gioco senza sottotitolo
- Prova: viewport: 'BAL[A]TRO'

### Un solo font, anche per leggere
- Decisione: Il font a pixel regge tutto il sito a 30 px
- Perché: Coerenza assoluta col gioco; si paga in leggibilità di frasi lunghe (per noi Bagel resta sotto le 4 parole)
- Prova: DOM: una sola famiglia, body 30 px

### Ombra grande e scura per staccare la carta
- Decisione: Sulla carta del jolly ombra 0 12px 20px all'85%
- Perché: Su fondo scuro serve un'ombra piena; su formica chiara TAJUT usa ombre prugna al 14-22%, corte
- Prova: DOM shadows

### Restrizione: tutto il resto in secondo piano
- Decisione: Una carta, una frase, i badge dei premi: niente spiegazione delle regole
- Perché: Chi arriva sa già di cosa si tratta; il sito serve a far scaricare il gioco
- Prova: full page: 3 blocchi di contenuto
