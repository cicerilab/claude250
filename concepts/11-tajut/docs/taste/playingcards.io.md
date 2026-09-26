# playingcards.io

Fonte: https://playingcards.io/  
Cattura: 2026-09-26, 1440x900 e 375x812, metodo curl; solo la home pubblica (le stanze richiedono un codice). Screenshot e dati DOM in `concepts/11-tajut/qa/taste-curl/` (file `playingcards.io-*`).

## Design Map

### Colori

- **canvas**: #83D8FF (71%) azzurro
- **surface**: #FFFFFF (29%) fascia del codice stanza
- **ink**: #333333 testo, #79399C link dell'abbonamento

### Tipografia

- **display**: wigwag-bold bianco 38 px ('Game Night is Online!')
- **body**: Noto Sans Variable 18/27 px

### Forme e movimento

- **hero**: illustrazione a raggiera con due ragazzi, carte, fiches, pedine
- **cta**: campo 'Enter Room Code' + JOIN, raggio 6 px, maiuscolo 15 px
- **radius**: 5-8 px, 200 px sulle pillole

## Taste DNA

### L'azione principale subito sotto l'immagine
- Decisione: Il campo del codice stanza sta in una fascia bianca tra hero e testo
- Perché: Chi arriva col codice di un amico deve entrare in un gesto
- Prova: viewport: fascia 60 px a y 680

### Oggetti sparsi come promessa
- Decisione: Carte, fiches e pedine volano nell'illustrazione
- Perché: Promette 'tavolo libero' dove si può spostare tutto
- Prova: hero

### Restrizione (da non imitare): figure disegnate e raggiera
- Decisione: Personaggi cartoon, sole a raggi, fiches da casinò
- Perché: È esattamente il repertorio vietato a TAJUT: figure umane, casinò, fumetto
- Prova: viewport 1440

### Scarso focus visibile
- Decisione: focusVisible non rilevato dall'estrattore
- Perché: TAJUT deve avere contorno prugna 2 px con 3 px di distanza anche sulle carte ruotate
- Prova: DOM: focusVisible false
