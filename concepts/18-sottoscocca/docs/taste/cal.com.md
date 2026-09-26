# cal.com · /taste per SOTTOSCOCCA

Fonte: https://cal.com (catturata il 26/09/2026, Playwright 1.56, 1440x900). Perché è qui: strumento di prenotazione reale: come si rende leggibile uno slot di tempo.

## Design Map

**colori**
- fondo: #F4F4F4 (65,2%)
- schede: #FFFFFF (33,4%)
- inchiostro: #111111 / #242424
- testo_secondario: #898989
- giorni_liberi: #E0E0E0 caselle piene

**tipografia**
- display: Cal Sans 600, h1 64px / 70,4px, h2 48px
- corpo: Cal Sans UI Light 300, 14px / 19,6px
- numeri_calendario: 16px, grigio per giorni non prenotabili, nero su casella piena per i prenotabili

**spaziatura**
- contenitore: 1152px
- griglia: 2 colonne da 518px, gap 12px

**raggi**: pillola 100px (61); 12px (53, schede); 4px; 2px

**ombre**: inset 0 1px 1.9px rgba(0,0,0,.16) sui controlli

**movimento**: nessuna transizione rilevante oltre 'all'

## Taste DNA

### Il libero si vede pieno
- Trigger: Calendario mensile con giorni disponibili e no
- Decisione: Giorni prenotabili dentro una casella #E0E0E0 piena, gli altri numeri nudi
- Ragione: Il visitatore trova i buchi senza leggere legenda
- Evidenza: viewport: 15-30 maggio in caselle piene, 1-14 senza

### La durata si sceglie prima dell'ora
- Trigger: Evento con durate diverse
- Decisione: Selettore segmentato 15m / 30m / 45m / 1h sopra al calendario
- Ragione: Lo slot dipende dalla durata: chiederla prima evita slot impossibili
- Evidenza: scheda 'Partnerships Meeting': selettore sotto la descrizione

### Il prodotto è il visual
- Trigger: Hero di un software
- Decisione: Il widget vero di prenotazione a destra al posto dell'illustrazione
- Ragione: Mostrare l'interfaccia è la prova
- Evidenza: viewport: widget a 2 colonne dentro scheda bianca

### Restrizione cromatica
- Trigger: SaaS con molte funzioni
- Decisione: Nessun colore di marca: nero, bianco, 3 grigi
- Ragione: Il calendario del cliente deve restare neutro dentro altri siti
- Evidenza: accentCandidates: #111111; solo le stelle recensioni sono colorate
