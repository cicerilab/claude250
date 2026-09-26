# cardgames.io-escoba

Fonte: https://cardgames.io/escoba/  
Cattura: 2026-09-26, 1440x900 e 375x812, metodo curl; partita avviata con Deal e fotografata a 150/400/800/1600/3500 ms. Screenshot e dati DOM in `concepts/11-tajut/qa/taste-curl/` (file `cardgames.io-escoba-*`).

## Design Map

### Colori

- **page**: #AFCFFE cielo attorno al tavolo
- **table**: #00A000 (27%) con bordo bianco 4 px e raggio 30 px; su mobile #006400 a tutto schermo
- **card**: #FFFFFF, dorso a quadretti rossi
- **ui**: #CA0000 link, #EEEE55 riquadro dei messaggi

### Tipografia

- **logo**: Slackey (display gonfio) bianco con contorno
- **ui**: Arial 16 px nei bottoni, Verdana 11-12 px nei messaggi

### Forme e movimento

- **card**: 69x94 px (1:1,36), mazzo spagnolo da 40 con semi coppe/denari/spade/bastoni
- **hand**: tre carte sovrapposte, passo 35 px su 69 (metà coperta)
- **motion**: carta in mano: transform 0,1 s ease-in; distribuzione una carta per volta, circa 3,5 s per 16 carte
- **table**: 716x616 px, raggio 30 px, ombra rgba(0,20,0,.35) 0 2px 5px

## Taste DNA

### Una carta alla volta
- Decisione: La distribuzione manda una carta per volta dal mazzo al posto del giocatore; mai due in volo insieme
- Perché: L'occhio segue un solo oggetto: si capisce chi riceve cosa senza istruzioni
- Prova: frame 150/400/800 ms: sempre una sola carta in movimento

### Il posto dice il ruolo
- Decisione: Mazzo in alto a sinistra, mano in basso al centro, carte in tavola al centro, avversari sui lati
- Perché: La geometria del tavolo vero è già un'interfaccia: nessuna etichetta serve
- Prova: screenshot deal-3500

### Mano sovrapposta leggibile
- Decisione: Le carte in mano si coprono per metà ma l'indice d'angolo resta sempre visibile
- Perché: Numero e seme nell'angolo bastano per scegliere: il resto della faccia si vede solo giocando
- Prova: passo 35 px su carte da 69 px, indice 16 px in alto a sinistra

### Restrizione: niente fisica decorativa
- Decisione: Le carte non rimbalzano e non ruotano: scivolano dritte e si posano
- Perché: Priorità alla chiarezza del gioco; per TAJUT prendiamo la disciplina, non la rigidità (noi ruotiamo di pochi gradi)
- Prova: transition 0,1 s ease-in, nessuna rotazione misurata
