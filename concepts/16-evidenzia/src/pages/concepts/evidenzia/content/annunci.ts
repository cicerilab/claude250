/**
 * EVIDENZIA · i 22 annunci del foglio e gli 8 "Cerchiamo" (copywriter).
 *
 * Case INVENTATE, zone vere, prezzi di esempio dentro le forchette del
 * brand-strategist (7.3). Nessun civico, nessuna via con numero, nessuna casa
 * reale riconoscibile. Italiano pieno: nessuna sigla da annuncio vecchio
 * (ammesse solo APE, IPE, IMU, m², €/m², Rif.).
 *
 * Ordine dell'array = ordine del DOM e della colonna mobile (ux-architect 5.4).
 * La posizione sul foglio la decide sections/Annunci/impaginato.ts.
 *
 * Anatomia sul foglio, in quest'ordine fisso (brand-strategist 5.3):
 *   attacco (h3, la riga che si evidenzia)
 *   novita (se c'è, in grassetto all'inizio del testo)
 *   testo | testoCorto (descrizione)
 *   dati (consistenza in riga) + energia (classe e riscaldamento)
 *   prezzo (formattato da testi.ts: prezzoAnnuncio)
 *   Rif. + bottone Evidenzia
 */

import type { ZonaId } from './zone';

export type Rubrica = 'appartamenti' | 'case' | 'rustici' | 'affitti';
export type Formato = 'piccolo' | 'foto' | 'riquadro' | 'testa';
/**
 * Decide la durata della visita nel calcolo del giro (DURATA_VISITA).
 * Aggiunto 'terreno' rispetto al tech-architect 6.4: l'ux-architect (5.6) dà
 * 15 minuti a terreni e box.
 */
export type Tipologia = 'appartamento' | 'monolocale' | 'casa' | 'rustico' | 'terreno' | 'box';
/** Con quale media del listino si confronta il prezzo in scheda (listino.ts). null = nessun confronto. */
export type Mercato = 'appartamenti' | 'case' | 'rustici' | 'terreni' | 'affitti';
export type ClasseEnergetica = 'A4' | 'A3' | 'A2' | 'A1' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

/** Una riga di consistenza nella scheda: termine e valore di un <dl>. */
export interface Voce {
  readonly t: string;
  readonly v: string;
}

export interface Annuncio {
  /** "rif-214": id dell'article, chiave dello store e di FOTO. */
  id: string;
  /** "214", mostrato come "Rif. 214". */
  rif: string;
  rubrica: Rubrica;
  formato: Formato;
  zona: ZonaId;
  tipologia: Tipologia;
  mercato: Mercato | null;
  /** Riga d'attacco: zona e tipologia, massimo 38 caratteri (una riga a 268 px nei formati P e F). */
  attacco: string;
  /** Novità o prezzo rivisto, scritti come frase in grassetto all'inizio del testo. Mai etichetta sulla foto. */
  novita?: string;
  /** Riga sotto il titolo nella scheda (il titolo della scheda è l'attacco, h2). */
  titoloScheda: string;
  /** Descrizione lunga sul foglio: 3 righe a 268 px nei formati P e F; 4-6 righe nei formati T e R. */
  testo: string;
  /** Descrizione corta: 2 righe a 268 px. Serve a pareggiare le colonne (ux 5.0). */
  testoCorto: string;
  /** Consistenza in riga: m², locali, bagni, piano, anno. */
  dati: string;
  /** Classe energetica e riscaldamento (obbligatoria negli annunci). */
  energia: string;
  /** Euro. Per gli affitti: canone al mese. */
  prezzo: number;
  affitto: boolean;
  /** Spese condominiali al mese in euro; null se non c'è condominio. */
  speseMese: number | null;
  /** Superficie commerciale (per il terreno: superficie del lotto). */
  mq: number;
  classe: ClasseEnergetica | null;
  /** Tre blocchi della consistenza in scheda (creative-director 4.3). */
  casa: readonly Voce[];
  costi: readonly Voce[];
  fuori: readonly Voce[];
  /** Descrizione in scheda, massimo 90 parole, con il difetto detto se c'è. */
  descrizione: string;
  /** Tre righe sulla zona: scuola, autobus, supermercato o farmacia, con i minuti. */
  vicino: readonly [string, string, string];
  /** Perché il prezzo al m² sta sopra o sotto la media della zona. null se non c'è confronto. */
  perchePrezzo: string | null;
}

/** Durata della visita in minuti per tipologia (ux-architect 5.6). */
export const DURATA_VISITA = {
  appartamento: 20,
  monolocale: 20,
  casa: 30,
  rustico: 30,
  terreno: 15,
  box: 15,
} as const satisfies Record<Tipologia, number>;

export const MAX_GIRO = 4;

export const ANNUNCI = [
  /* ================================================ Appartamenti in vendita */
  {
    id: 'rif-214',
    rif: '214',
    rubrica: 'appartamenti',
    formato: 'testa',
    zona: 'torre',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'Torre, trilocale con garage',
    titoloScheda: 'Secondo piano con ascensore, balcone verso il cortile.',
    testo:
      'Secondo piano con ascensore in una palazzina di otto famiglie. Cucina abitabile, due camere, balcone verso il cortile. Bagno e caldaia rifatti nel 2021. Garage al piano terra compreso nel prezzo.',
    testoCorto: 'Secondo piano con ascensore, cucina abitabile, due camere. Garage compreso.',
    dati: '82 m², tre locali, un bagno, secondo piano, 1988.',
    energia: 'Classe D, riscaldamento autonomo.',
    prezzo: 168000,
    affitto: false,
    speseMese: 70,
    mq: 82,
    classe: 'D',
    casa: [
      { t: 'Superficie', v: '82 m² commerciali, 72 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina abitabile, due camere' },
      { t: 'Bagni', v: 'uno, con finestra, rifatto nel 2021' },
      { t: 'Piano', v: 'secondo di tre, con ascensore' },
      { t: 'Anno', v: '1988' },
      { t: 'Libero', v: 'al rogito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '70 € al mese' },
      { t: 'Riscaldamento', v: 'autonomo, caldaia a condensazione del 2021' },
      { t: 'Classe energetica', v: 'D, IPE 142 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Garage', v: '18 m² al piano terra, compreso nel prezzo' },
      { t: 'Balcone', v: 'verso il cortile, esposto a est' },
      { t: 'Cantina', v: 'nessuna' },
    ],
    descrizione:
      'Si entra nel soggiorno, con la cucina abitabile separata da una porta scorrevole. Le due camere danno sul cortile interno, quindi la notte è silenziosa. Il bagno e la caldaia sono stati rifatti nel 2021. I serramenti invece sono quelli del 1988, in legno con vetro doppio: funzionano, ma nei prossimi anni vanno messi in conto. La palazzina ha otto famiglie e un amministratore che risponde.',
    vicino: [
      'Scuola primaria a 6 minuti a piedi.',
      'Fermata dell’autobus urbano a 3 minuti a piedi.',
      'Supermercato a 5 minuti a piedi.',
    ],
    perchePrezzo:
      'Sopra la media perché il prezzo comprende il garage, che da solo vale circa 20.000 euro, e perché bagno e caldaia sono del 2021.',
  },
  {
    id: 'rif-231',
    rif: '231',
    rubrica: 'appartamenti',
    formato: 'foto',
    zona: 'centro',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'Centro, bilocale ristrutturato',
    novita: 'Nuovo questa settimana.',
    titoloScheda: 'Primo piano in una casa del centro storico, a due passi da piazza Cavour.',
    testo:
      'Primo piano in una casa del centro storico. Rifatto nel 2023: impianti, pavimenti in rovere, bagno con doccia.',
    testoCorto: 'Primo piano nel centro storico, rifatto nel 2023. Bagno con doccia.',
    dati: '58 m², due locali, un bagno, primo piano, 2023.',
    energia: 'Classe C, riscaldamento autonomo.',
    prezzo: 139000,
    affitto: false,
    speseMese: 45,
    mq: 58,
    classe: 'C',
    casa: [
      { t: 'Superficie', v: '58 m² commerciali, 51 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno con angolo cottura, una camera' },
      { t: 'Bagni', v: 'uno, con doccia' },
      { t: 'Piano', v: 'primo di due, senza ascensore' },
      { t: 'Anno', v: 'casa dell’Ottocento, ristrutturata nel 2023' },
      { t: 'Libero', v: 'subito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '45 € al mese' },
      { t: 'Riscaldamento', v: 'autonomo, a pavimento' },
      { t: 'Classe energetica', v: 'C, IPE 98 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Posto auto', v: 'nessuno: parcheggi a pagamento in centro' },
      { t: 'Cantina', v: 'piccola, al piano terra' },
      { t: 'Balcone', v: 'nessuno' },
    ],
    descrizione:
      'Una casa del centro storico divisa in tre appartamenti, rifatta da capo nel 2023: impianti nuovi, riscaldamento a pavimento, pavimenti in rovere, finestre con vetro triplo. Il soggiorno ha due finestre sulla via, la camera guarda il cortile. Il posto auto non c’è: si parcheggia a pagamento, e per chi abita in centro c’è il permesso da residente. Adatto a chi vuole vivere a piedi.',
    vicino: [
      'Piazza Cavour a 2 minuti a piedi.',
      'Stazione dei treni a 8 minuti a piedi.',
      'Farmacia e alimentari a 1 minuto a piedi.',
    ],
    perchePrezzo:
      'Sopra la media perché è stato rifatto tutto nel 2023, impianti compresi: non c’è niente da spendere dopo il rogito.',
  },
  {
    id: 'rif-188',
    rif: '188',
    rubrica: 'appartamenti',
    formato: 'piccolo',
    zona: 'borgomeduna',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'Borgomeduna, trilocale da rinfrescare',
    novita: 'Prezzo rivisto: era € 118.000.',
    titoloScheda: 'Terzo piano senza ascensore, due camere e una grande cucina.',
    testo: 'Terzo piano senza ascensore. Grande cucina, due camere, bagno degli anni Novanta da rifare.',
    testoCorto: 'Terzo piano senza ascensore. Due camere, bagno da rifare.',
    dati: '88 m², tre locali, un bagno, terzo piano, 1974.',
    energia: 'Classe F, riscaldamento autonomo.',
    prezzo: 108000,
    affitto: false,
    speseMese: 55,
    mq: 88,
    classe: 'F',
    casa: [
      { t: 'Superficie', v: '88 m² commerciali, 78 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina abitabile, due camere' },
      { t: 'Bagni', v: 'uno, degli anni Novanta' },
      { t: 'Piano', v: 'terzo di tre, senza ascensore' },
      { t: 'Anno', v: '1974' },
      { t: 'Libero', v: 'subito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '55 € al mese' },
      { t: 'Riscaldamento', v: 'autonomo, caldaia del 2009' },
      { t: 'Classe energetica', v: 'F, IPE 210 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Posto auto', v: 'scoperto, nel cortile condominiale' },
      { t: 'Cantina', v: 'sì, 6 m²' },
      { t: 'Balconi', v: 'due, uno sulla cucina' },
    ],
    descrizione:
      'Tanto spazio per il prezzo, e i difetti si vedono subito: terzo piano senza ascensore, bagno degli anni Novanta, serramenti in legno originali, classe F. In cambio la cucina è grande davvero, le camere sono due matrimoniali e i balconi sono due. Chi ha un po’ di budget per i lavori ci fa una casa comoda. Il prezzo è stato rivisto questa settimana.',
    vicino: [
      'Scuola primaria a 8 minuti a piedi.',
      'Fermata dell’autobus urbano a 2 minuti a piedi.',
      'Supermercato a 4 minuti a piedi.',
    ],
    perchePrezzo:
      'Sotto la media perché è da rinfrescare (bagno, serramenti) e al terzo piano senza ascensore.',
  },
  {
    id: 'rif-197',
    rif: '197',
    rubrica: 'appartamenti',
    formato: 'piccolo',
    zona: 'villanova',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'Villanova, bilocale con giardino',
    titoloScheda: 'Piano terra con giardino privato di 90 m², recintato.',
    testo: 'Piano terra con giardino privato di 90 m², recintato. Soggiorno con cucina a vista, una camera.',
    testoCorto: 'Piano terra con giardino privato di 90 m². Una camera.',
    dati: '64 m², due locali, un bagno, piano terra, 1996.',
    energia: 'Classe E, riscaldamento autonomo.',
    prezzo: 99000,
    affitto: false,
    speseMese: 40,
    mq: 64,
    classe: 'E',
    casa: [
      { t: 'Superficie', v: '64 m² commerciali, 55 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno con cucina a vista, una camera' },
      { t: 'Bagni', v: 'uno, con vasca' },
      { t: 'Piano', v: 'terra' },
      { t: 'Anno', v: '1996' },
      { t: 'Libero', v: 'da gennaio 2027' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '40 € al mese' },
      { t: 'Riscaldamento', v: 'autonomo, caldaia del 2015' },
      { t: 'Classe energetica', v: 'E, IPE 165 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Giardino', v: '90 m² privato, recintato' },
      { t: 'Posto auto', v: 'coperto, sotto la palazzina' },
      { t: 'Cantina', v: 'nessuna' },
    ],
    descrizione:
      'Un bilocale al piano terra di una palazzina di sei famiglie, con un giardino privato recintato dove sta un tavolo per sei e un piccolo orto. Il soggiorno esce direttamente sul giardino. Buono per chi ha un cane o per chi vuole una prima casa senza scale. Il difetto: al piano terra d’inverno serve tenere acceso di più, e la classe è E.',
    vicino: [
      'Scuola dell’infanzia a 5 minuti a piedi.',
      'Fermata dell’autobus urbano a 4 minuti a piedi.',
      'Supermercato a 3 minuti in auto.',
    ],
    perchePrezzo: 'Sopra la media per il giardino privato di 90 m², raro in un appartamento.',
  },
  {
    id: 'rif-240',
    rif: '240',
    rubrica: 'appartamenti',
    formato: 'riquadro',
    zona: 'sanGregorio',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'San Gregorio, quadrilocale con terrazzo',
    titoloScheda: 'Tre camere, due bagni e un terrazzo di 25 m² esposto a sud.',
    testo:
      'Terzo piano con ascensore in una palazzina del 2008. Tre camere, due bagni, cucina separata e un terrazzo di 25 m² esposto a sud, dove si mangia da aprile a ottobre. Garage doppio e cantina.',
    testoCorto: 'Terzo piano con ascensore. Tre camere, due bagni, terrazzo di 25 m² a sud.',
    dati: '118 m², quattro locali, due bagni, terzo piano, 2008.',
    energia: 'Classe B, riscaldamento autonomo con pannelli solari.',
    prezzo: 229000,
    affitto: false,
    speseMese: 95,
    mq: 118,
    classe: 'B',
    casa: [
      { t: 'Superficie', v: '118 m² commerciali, 102 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina separata, tre camere' },
      { t: 'Bagni', v: 'due, uno con doccia e uno con vasca' },
      { t: 'Piano', v: 'terzo di quattro, con ascensore' },
      { t: 'Anno', v: '2008' },
      { t: 'Libero', v: 'al rogito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '95 € al mese, ascensore compreso' },
      { t: 'Riscaldamento', v: 'autonomo, con pannelli solari per l’acqua calda' },
      { t: 'Classe energetica', v: 'B, IPE 58 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Terrazzo', v: '25 m², esposto a sud' },
      { t: 'Garage', v: 'doppio, 32 m²' },
      { t: 'Cantina', v: 'sì, 8 m²' },
    ],
    descrizione:
      'Il soggiorno esce sul terrazzo, che è il vero motivo per venirlo a vedere: 25 m² esposti a sud, con la tenda da sole già montata. La zona notte è separata, con tre camere e due bagni. La palazzina è del 2008 e si tiene bene. Le spese condominiali, 95 euro al mese, sono più alte della media perché comprendono ascensore e pulizie.',
    vicino: [
      'Scuola primaria e media a 7 minuti a piedi.',
      'Fermata dell’autobus urbano a 2 minuti a piedi.',
      'Supermercato e farmacia a 5 minuti a piedi.',
    ],
    perchePrezzo: 'Sopra la media perché è del 2008, in classe B, con terrazzo e garage doppio.',
  },
  {
    id: 'rif-226',
    rif: '226',
    rubrica: 'appartamenti',
    formato: 'foto',
    zona: 'rorai',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'Rorai Grande, trilocale nuovo',
    titoloScheda: 'In una palazzina nuova di sei famiglie, consegna a marzo 2027.',
    testo:
      'In una palazzina nuova di sei famiglie, consegna a marzo 2027. Pompa di calore, pannelli fotovoltaici, giardino condominiale.',
    testoCorto: 'Palazzina nuova di sei famiglie, consegna a marzo 2027. Classe A2.',
    dati: '90 m², tre locali, due bagni, primo piano, 2027.',
    energia: 'Classe A2, pompa di calore a pavimento.',
    prezzo: 238000,
    affitto: false,
    speseMese: 60,
    mq: 90,
    classe: 'A2',
    casa: [
      { t: 'Superficie', v: '90 m² commerciali, 79 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno con cucina, due camere' },
      { t: 'Bagni', v: 'due' },
      { t: 'Piano', v: 'primo di due, con ascensore' },
      { t: 'Anno', v: 'in costruzione, consegna a marzo 2027' },
      { t: 'Finiture', v: 'da scegliere in capitolato fino a dicembre' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'stimate 60 € al mese' },
      { t: 'Riscaldamento', v: 'pompa di calore, a pavimento, con raffrescamento' },
      { t: 'Classe energetica', v: 'A2, di progetto' },
    ],
    fuori: [
      { t: 'Garage', v: 'singolo, 16 m²' },
      { t: 'Giardino', v: 'condominiale' },
      { t: 'Terrazza', v: '12 m², coperta' },
    ],
    descrizione:
      'Un appartamento ancora sulla carta, ma con il cantiere già al tetto: si può visitare la palazzina e vedere il campione delle finiture in agenzia. Pavimenti, piastrelle e porte si scelgono dal capitolato fino a dicembre. Il prezzo è quello del nuovo: se cerchi una casa da non toccare per vent’anni, è questa; se cerchi il prezzo più basso, no. Si acquista con un preliminare e acconti in tre rate, garantiti da fideiussione.',
    vicino: [
      'Scuola primaria a 9 minuti a piedi.',
      'Fermata dell’autobus urbano a 5 minuti a piedi.',
      'Supermercato a 4 minuti in auto.',
    ],
    perchePrezzo:
      'Molto sopra la media delle case usate perché è nuovo in classe A2: il nuovo a Pordenone costa tra 2.400 e 2.800 €/m².',
  },
  {
    id: 'rif-203',
    rif: '203',
    rubrica: 'appartamenti',
    formato: 'piccolo',
    zona: 'centro',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'Centro, attico con terrazzo',
    titoloScheda: 'Ultimo piano con ascensore, terrazzo di 30 m² sui tetti del centro.',
    testo: 'Ultimo piano con ascensore, terrazzo di 30 m² sui tetti. Due camere, due bagni, soffitti in legno.',
    testoCorto: 'Ultimo piano con ascensore, terrazzo di 30 m². Due camere.',
    dati: '105 m², tre locali, due bagni, quinto piano, 1972.',
    energia: 'Classe C, riscaldamento centralizzato con contabilizzatori.',
    prezzo: 259000,
    affitto: false,
    speseMese: 140,
    mq: 105,
    classe: 'C',
    casa: [
      { t: 'Superficie', v: '105 m² commerciali, 88 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina, due camere' },
      { t: 'Bagni', v: 'due' },
      { t: 'Piano', v: 'quinto e ultimo, con ascensore' },
      { t: 'Anno', v: '1972, attico rifatto nel 2016' },
      { t: 'Libero', v: 'al rogito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '140 € al mese, riscaldamento a parte' },
      { t: 'Riscaldamento', v: 'centralizzato con contabilizzatori' },
      { t: 'Classe energetica', v: 'C, IPE 104 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Terrazzo', v: '30 m², su due lati' },
      { t: 'Posto auto', v: 'coperto, nel cortile' },
      { t: 'Cantina', v: 'sì' },
    ],
    descrizione:
      'L’attico è stato rifatto nel 2016 con i soffitti in legno a vista e un terrazzo su due lati, da cui si vedono i tetti del centro e, nelle giornate chiare, le montagne. Il condominio è del 1972 e si sente: spese alte, 140 euro al mese, e facciata da sistemare nei prossimi anni, con i lavori già discussi in assemblea. Te lo diciamo prima: chiedi i verbali, te li diamo.',
    vicino: [
      'Piazza Cavour a 4 minuti a piedi.',
      'Stazione dei treni a 6 minuti a piedi.',
      'Supermercato a 3 minuti a piedi.',
    ],
    perchePrezzo: 'Sopra la media per il terrazzo di 30 m² e l’attico rifatto nel 2016.',
  },
  {
    id: 'rif-219',
    rif: '219',
    rubrica: 'appartamenti',
    formato: 'piccolo',
    zona: 'cordenons',
    tipologia: 'appartamento',
    mercato: 'appartamenti',
    attacco: 'Cordenons, trilocale con cantina',
    titoloScheda: 'Primo piano in una palazzina di quattro famiglie, posto auto e cantina.',
    testo: 'Primo piano in una palazzina di quattro famiglie. Due camere, cucina separata, cantina e posto auto.',
    testoCorto: 'Primo piano, due camere, cantina e posto auto coperto.',
    dati: '85 m², tre locali, un bagno, primo piano, 1992.',
    energia: 'Classe E, riscaldamento autonomo.',
    prezzo: 124000,
    affitto: false,
    speseMese: 35,
    mq: 85,
    classe: 'E',
    casa: [
      { t: 'Superficie', v: '85 m² commerciali, 75 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina separata, due camere' },
      { t: 'Bagni', v: 'uno, più una lavanderia' },
      { t: 'Piano', v: 'primo di due, senza ascensore' },
      { t: 'Anno', v: '1992' },
      { t: 'Libero', v: 'subito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '35 € al mese' },
      { t: 'Riscaldamento', v: 'autonomo, caldaia del 2018' },
      { t: 'Classe energetica', v: 'E, IPE 170 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Posto auto', v: 'coperto' },
      { t: 'Cantina', v: 'sì, 10 m²' },
      { t: 'Giardino', v: 'condominiale, con un posto per le biciclette' },
    ],
    descrizione:
      'Una palazzina piccola, quattro famiglie, in una via senza passaggio a cinque minuti dal centro di Cordenons. L’appartamento è tenuto bene e si può abitare subito: la cucina è del 2015, la caldaia del 2018. Il bagno è uno solo, ma c’è una lavanderia separata. Le spese sono basse perché il condominio lo gestiscono i proprietari.',
    vicino: [
      'Scuola primaria a 5 minuti a piedi.',
      'Fermata dell’autobus per Pordenone a 3 minuti a piedi.',
      'Supermercato a 4 minuti a piedi.',
    ],
    perchePrezzo: 'Sopra la media di Cordenons per il posto auto coperto e la cantina, compresi nel prezzo.',
  },

  /* ================================================ Case e villette */
  {
    id: 'rif-152',
    rif: '152',
    rubrica: 'case',
    formato: 'testa',
    zona: 'porcia',
    tipologia: 'casa',
    mercato: 'case',
    attacco: 'Porcia, villetta con giardino',
    titoloScheda: 'Villetta singola degli anni Ottanta su un lotto di 600 m², con taverna.',
    testo:
      'Villetta singola del 1984 su un lotto di 600 m². Tre camere al primo piano, soggiorno con fogolâr, taverna al piano seminterrato e garage doppio. Tetto rifatto nel 2019.',
    testoCorto: 'Villetta del 1984, lotto di 600 m², tre camere, taverna. Tetto rifatto.',
    dati: '180 m², sei locali, due bagni, due piani più taverna, 1984.',
    energia: 'Classe E, riscaldamento autonomo a metano.',
    prezzo: 289000,
    affitto: false,
    speseMese: null,
    mq: 180,
    classe: 'E',
    casa: [
      { t: 'Superficie', v: '180 m² commerciali, 150 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno con fogolâr, cucina, tre camere, studio' },
      { t: 'Bagni', v: 'due, più un servizio in taverna' },
      { t: 'Piani', v: 'terra e primo, più taverna seminterrata' },
      { t: 'Anno', v: '1984, tetto rifatto nel 2019' },
      { t: 'Libero', v: 'da febbraio 2027' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna, è una casa singola' },
      { t: 'Riscaldamento', v: 'autonomo a metano, caldaia del 2012' },
      { t: 'Classe energetica', v: 'E, IPE 175 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Giardino', v: '600 m² di lotto, con due alberi da frutto' },
      { t: 'Garage', v: 'doppio, 36 m²' },
      { t: 'Portico', v: 'sì, sul lato sud' },
    ],
    descrizione:
      'Una casa costruita dai proprietari nel 1984 e tenuta con cura: il tetto è stato rifatto nel 2019 con l’isolamento, la caldaia è del 2012. Al piano terra il soggiorno con il fogolâr, la cucina e uno studio; sopra tre camere e il bagno grande. La taverna ha un secondo camino e una cucina. Il cappotto non c’è e i serramenti sono del 1984: per salire di classe è il prossimo lavoro da fare.',
    vicino: [
      'Scuola primaria a 7 minuti a piedi.',
      'Fermata della corriera per Pordenone a 4 minuti a piedi.',
      'Centro di Porcia a 3 minuti in auto.',
    ],
    perchePrezzo:
      'In linea con la media delle case di Porcia: il tetto nuovo compensa serramenti e isolamento da rifare.',
  },
  {
    id: 'rif-171',
    rif: '171',
    rubrica: 'case',
    formato: 'riquadro',
    zona: 'cordenons',
    tipologia: 'casa',
    mercato: 'case',
    attacco: 'Cordenons, bifamiliare con giardino',
    titoloScheda: 'Metà di una bifamiliare, con ingresso e giardino propri. Tetto rifatto nel 2022.',
    testo:
      'Metà di una bifamiliare del 1979, con ingresso e giardino di 400 m² tutti suoi. Tre camere, due bagni, taverna. Il tetto è stato rifatto nel 2022; impianto elettrico e bagni sono da aggiornare.',
    testoCorto: 'Metà bifamiliare, giardino di 400 m², tre camere. Tetto rifatto nel 2022.',
    dati: '160 m², cinque locali, due bagni, due piani più taverna, 1979.',
    energia: 'Classe D, riscaldamento autonomo a metano.',
    prezzo: 245000,
    affitto: false,
    speseMese: null,
    mq: 160,
    classe: 'D',
    casa: [
      { t: 'Superficie', v: '160 m² commerciali, 132 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina abitabile, tre camere' },
      { t: 'Bagni', v: 'due, degli anni Ottanta' },
      { t: 'Piani', v: 'terra e primo, più taverna' },
      { t: 'Anno', v: '1979, tetto rifatto nel 2022' },
      { t: 'Libero', v: 'al rogito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna' },
      { t: 'Riscaldamento', v: 'autonomo a metano, caldaia del 2020' },
      { t: 'Classe energetica', v: 'D, IPE 130 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Giardino', v: '400 m², recintato, con ingresso proprio' },
      { t: 'Garage', v: 'singolo, più un posto auto scoperto' },
      { t: 'Portico', v: 'sì, 20 m²' },
    ],
    descrizione:
      'Una bifamiliare divisa a metà: questa parte ha il suo ingresso, il suo giardino e il suo garage, e con i vicini si condivide solo il muro. Il tetto è stato rifatto nel 2022 con l’isolamento e la caldaia è del 2020, quindi le spese grosse sono fatte. Restano da aggiornare l’impianto elettrico e i due bagni, che sono degli anni Ottanta: sono lavori che si fanno anche abitandoci.',
    vicino: [
      'Scuola primaria a 6 minuti a piedi.',
      'Fermata dell’autobus per Pordenone a 5 minuti a piedi.',
      'Supermercato a 3 minuti in auto.',
    ],
    perchePrezzo:
      'In linea con la media delle case di Cordenons: tetto e caldaia nuovi, bagni e impianto elettrico da rifare.',
  },
  {
    id: 'rif-237',
    rif: '237',
    rubrica: 'case',
    formato: 'foto',
    zona: 'roveredo',
    tipologia: 'casa',
    mercato: 'case',
    attacco: 'Roveredo, testa di schiera',
    titoloScheda: 'La prima casa della schiera, con tre lati liberi e taverna.',
    testo:
      'La prima della schiera, con tre lati liberi e giardino su due. Tre camere, due bagni, taverna con cucina.',
    testoCorto: 'Testa di schiera con giardino su due lati. Tre camere, taverna.',
    dati: '150 m², cinque locali, due bagni, due piani più taverna, 2004.',
    energia: 'Classe C, riscaldamento autonomo a pavimento.',
    prezzo: 262000,
    affitto: false,
    speseMese: 25,
    mq: 150,
    classe: 'C',
    casa: [
      { t: 'Superficie', v: '150 m² commerciali, 124 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina, tre camere' },
      { t: 'Bagni', v: 'due, più un servizio in taverna' },
      { t: 'Piani', v: 'terra e primo, più taverna' },
      { t: 'Anno', v: '2004' },
      { t: 'Libero', v: 'da dicembre 2026' },
    ],
    costi: [
      { t: 'Spese condominiali', v: '25 € al mese per le parti comuni della schiera' },
      { t: 'Riscaldamento', v: 'autonomo, a pavimento' },
      { t: 'Classe energetica', v: 'C, IPE 95 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Giardino', v: '220 m² su due lati' },
      { t: 'Garage', v: 'doppio, in taverna' },
      { t: 'Portico', v: 'sul retro' },
    ],
    descrizione:
      'Testa di schiera vuol dire che ha tre lati liberi: più finestre, più luce, e il giardino gira sull’angolo. La casa è del 2004 e non ha bisogno di lavori; il riscaldamento è a pavimento. La taverna con la sua cucina è dove la famiglia di adesso passa l’inverno. Il difetto: la camera piccola al primo piano è di 9 m², va bene per un bambino o per uno studio.',
    vicino: [
      'Scuola primaria a 6 minuti a piedi.',
      'Fermata della corriera per Pordenone a 4 minuti a piedi.',
      'Supermercato a 5 minuti a piedi.',
    ],
    perchePrezzo: 'Sopra la media di Roveredo perché è del 2004, in classe C, e perché è testa di schiera.',
  },
  {
    id: 'rif-209',
    rif: '209',
    rubrica: 'case',
    formato: 'foto',
    zona: 'fiumeVeneto',
    tipologia: 'casa',
    mercato: 'case',
    attacco: 'Fiume Veneto, villetta nuova',
    titoloScheda: 'Villetta singola nuova in classe A3, consegna in primavera 2027.',
    testo:
      'Villetta singola in costruzione, consegna ad aprile 2027. Classe A3, fotovoltaico, tre camere e giardino di 450 m².',
    testoCorto: 'Villetta nuova in classe A3, consegna ad aprile 2027. Tre camere.',
    dati: '145 m², cinque locali, due bagni, due piani, 2027.',
    energia: 'Classe A3, pompa di calore e fotovoltaico.',
    prezzo: 385000,
    affitto: false,
    speseMese: null,
    mq: 145,
    classe: 'A3',
    casa: [
      { t: 'Superficie', v: '145 m² commerciali, 126 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno con cucina, tre camere, lavanderia' },
      { t: 'Bagni', v: 'due' },
      { t: 'Piani', v: 'terra e primo' },
      { t: 'Anno', v: 'in costruzione, consegna ad aprile 2027' },
      { t: 'Finiture', v: 'da scegliere in capitolato' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna' },
      { t: 'Riscaldamento', v: 'pompa di calore a pavimento, con raffrescamento' },
      { t: 'Classe energetica', v: 'A3, di progetto' },
    ],
    fuori: [
      { t: 'Giardino', v: '450 m²' },
      { t: 'Posto auto', v: 'coperto, doppio, sotto una tettoia' },
      { t: 'Cantina', v: 'nessuna: c’è un ripostiglio esterno' },
    ],
    descrizione:
      'Una casa nuova che consuma poco: pompa di calore, fotovoltaico da 6 kW, cappotto e serramenti con vetro triplo. Si visita il cantiere e si vedono le finiture in agenzia. Garage chiuso non c’è: c’è una tettoia per due auto e un ripostiglio in giardino. È la casa più cara del foglio, e il prezzo è quello del nuovo in classe A. Si acquista con un preliminare e acconti garantiti da fideiussione.',
    vicino: [
      'Scuola primaria a 8 minuti a piedi.',
      'Stazione dei treni di Fiume Veneto a 4 minuti in auto.',
      'Supermercato a 3 minuti in auto.',
    ],
    perchePrezzo: 'Molto sopra la media perché è nuova in classe A3: il nuovo costa di più ovunque.',
  },
  {
    id: 'rif-244',
    rif: '244',
    rubrica: 'case',
    formato: 'piccolo',
    zona: 'torre',
    tipologia: 'casa',
    mercato: 'case',
    attacco: 'Torre, casa a schiera centrale',
    titoloScheda: 'Casa in mezzo alla schiera, tre camere, giardino davanti e dietro.',
    testo: 'In mezzo alla schiera, con giardino davanti e dietro. Tre camere, due bagni, garage e cantina.',
    testoCorto: 'Casa a schiera con tre camere, due bagni, garage.',
    dati: '135 m², cinque locali, due bagni, due piani, 1991.',
    energia: 'Classe D, riscaldamento autonomo.',
    prezzo: 228000,
    affitto: false,
    speseMese: null,
    mq: 135,
    classe: 'D',
    casa: [
      { t: 'Superficie', v: '135 m² commerciali, 112 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina, tre camere' },
      { t: 'Bagni', v: 'due' },
      { t: 'Piani', v: 'terra e primo, più cantina' },
      { t: 'Anno', v: '1991' },
      { t: 'Libero', v: 'al rogito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna' },
      { t: 'Riscaldamento', v: 'autonomo, caldaia del 2017' },
      { t: 'Classe energetica', v: 'D, IPE 128 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Giardino', v: '60 m² davanti e 80 m² dietro' },
      { t: 'Garage', v: 'singolo' },
      { t: 'Cantina', v: 'sì, 15 m²' },
    ],
    descrizione:
      'Una casa a schiera in una via chiusa di Torre, dove i bambini giocano fuori. Giardino piccolo davanti e più grande dietro, dove batte il sole del pomeriggio. Dentro è in ordine: la caldaia è del 2017, i bagni del 2010. Essendo in mezzo alla schiera, il soggiorno ha finestre solo davanti e dietro, ed è meno luminoso di una testa di schiera.',
    vicino: [
      'Scuola primaria a 5 minuti a piedi.',
      'Fermata dell’autobus urbano a 4 minuti a piedi.',
      'Supermercato a 6 minuti a piedi.',
    ],
    perchePrezzo: 'In linea con la media delle case a Torre.',
  },
  {
    id: 'rif-166',
    rif: '166',
    rubrica: 'case',
    formato: 'piccolo',
    zona: 'sanGregorio',
    tipologia: 'casa',
    mercato: 'case',
    attacco: 'San Gregorio, casa da sistemare',
    titoloScheda: 'Casa singola del 1962 su un lotto d’angolo di 700 m², tutta da rifare.',
    testo: 'Casa singola del 1962 su un lotto d’angolo di 700 m². Tutta da rifare, tetto compreso.',
    testoCorto: 'Casa del 1962, lotto d’angolo di 700 m². Tutta da rifare.',
    dati: '170 m², sei locali, un bagno, due piani, 1962.',
    energia: 'Classe G, riscaldamento a gasolio.',
    prezzo: 219000,
    affitto: false,
    speseMese: null,
    mq: 170,
    classe: 'G',
    casa: [
      { t: 'Superficie', v: '170 m² commerciali, 140 m² calpestabili' },
      { t: 'Locali', v: 'soggiorno, cucina, quattro camere' },
      { t: 'Bagni', v: 'uno' },
      { t: 'Piani', v: 'terra e primo, più soffitta' },
      { t: 'Anno', v: '1962' },
      { t: 'Libero', v: 'subito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna' },
      { t: 'Riscaldamento', v: 'caldaia a gasolio del 1998, da sostituire' },
      { t: 'Classe energetica', v: 'G, IPE 290 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Giardino', v: 'lotto d’angolo di 700 m²' },
      { t: 'Garage', v: 'singolo, staccato dalla casa' },
      { t: 'Soffitta', v: 'sì, praticabile' },
    ],
    descrizione:
      'Una casa di famiglia, venduta dagli eredi, in una delle zone più comode della città. Va rifatta: tetto, impianti, bagno, serramenti, caldaia a gasolio. Abbiamo fatto fare al geometra una stima dei lavori, tra 150.000 e 200.000 euro a seconda delle scelte: la trovi in agenzia. Chi cerca il posto e non la casa pronta, qui ha un lotto d’angolo di 700 m² a dieci minuti a piedi dal centro.',
    vicino: [
      'Scuola primaria e media a 5 minuti a piedi.',
      'Fermata dell’autobus urbano a 2 minuti a piedi.',
      'Centro città a 10 minuti a piedi.',
    ],
    perchePrezzo: 'Sotto la media perché è tutta da rifare: i lavori stimati sono tra 150.000 e 200.000 euro.',
  },

  /* ================================================ Rustici e terreni */
  {
    id: 'rif-118',
    rif: '118',
    rubrica: 'rustici',
    formato: 'testa',
    zona: 'porcia',
    tipologia: 'rustico',
    mercato: 'rustici',
    attacco: 'Porcia, rustico con portico',
    titoloScheda: 'Rustico in sasso e mattoni con portico e fienile, da ristrutturare.',
    testo:
      'Casa di campagna in sasso e mattoni con portico e fienile, su un terreno di 1.500 m². Da ristrutturare tutta. Il progetto di massima di un architetto è già in agenzia.',
    testoCorto: 'Rustico in sasso con portico e fienile, terreno di 1.500 m². Da ristrutturare.',
    dati: '210 m² tra casa e fienile, due piani, primi del Novecento.',
    energia: 'Classe G, nessun impianto di riscaldamento.',
    prezzo: 128000,
    affitto: false,
    speseMese: null,
    mq: 210,
    classe: 'G',
    casa: [
      { t: 'Superficie', v: '130 m² di casa e 80 m² di fienile' },
      { t: 'Locali', v: 'oggi cinque stanze, da ridisegnare' },
      { t: 'Bagni', v: 'uno, da rifare' },
      { t: 'Piani', v: 'terra e primo' },
      { t: 'Anno', v: 'primi del Novecento' },
      { t: 'Libero', v: 'subito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna' },
      { t: 'Riscaldamento', v: 'nessun impianto, solo una stufa a legna' },
      { t: 'Classe energetica', v: 'G, IPE 340 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Terreno', v: '1.500 m², in parte a prato' },
      { t: 'Portico', v: 'sì, 40 m², sul lato sud' },
      { t: 'Fienile', v: '80 m², recuperabile come abitazione' },
    ],
    descrizione:
      'Una casa di campagna vera, con i muri in sasso e mattoni, il portico a sud e il fienile attaccato. È da rifare tutta: tetto, impianti, solai del primo piano. Un architetto ha già disegnato un progetto di massima con due unità, casa e fienile: lo trovi in agenzia, insieme alla stima dei costi. Per la ristrutturazione ci sono le detrazioni fiscali in vigore: te le spiega il tuo tecnico, noi ti diamo i documenti.',
    vicino: [
      'Scuola primaria a 4 minuti in auto.',
      'Fermata della corriera a 6 minuti a piedi.',
      'Centro di Porcia a 5 minuti in auto.',
    ],
    perchePrezzo: 'In linea con i rustici da ristrutturare di Porcia.',
  },
  {
    id: 'rif-177',
    rif: '177',
    rubrica: 'rustici',
    formato: 'piccolo',
    zona: 'fiumeVeneto',
    tipologia: 'rustico',
    mercato: 'rustici',
    attacco: 'Fiume Veneto, casa di corte in sasso',
    titoloScheda: 'Casa di corte in sasso, con scoperto privato e accesso dal cortile comune.',
    testo: 'Casa in sasso che si affaccia su un cortile comune, con scoperto privato di 300 m². Da ristrutturare.',
    testoCorto: 'Casa di corte in sasso, scoperto di 300 m². Da ristrutturare.',
    dati: '190 m², due piani, fine Ottocento.',
    energia: 'Classe G, stufa a legna.',
    prezzo: 95000,
    affitto: false,
    speseMese: null,
    mq: 190,
    classe: 'G',
    casa: [
      { t: 'Superficie', v: '190 m² su due piani' },
      { t: 'Locali', v: 'cucina con fogolâr e sei stanze' },
      { t: 'Bagni', v: 'uno, esterno alla casa' },
      { t: 'Piani', v: 'terra e primo' },
      { t: 'Anno', v: 'fine Ottocento' },
      { t: 'Libero', v: 'subito' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna; il cortile comune si tiene insieme ai vicini' },
      { t: 'Riscaldamento', v: 'solo la stufa a legna' },
      { t: 'Classe energetica', v: 'G, IPE 360 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Scoperto', v: '300 m² privati, dietro la casa' },
      { t: 'Cortile', v: 'in comune con altre tre case' },
      { t: 'Posto auto', v: 'nello scoperto' },
    ],
    descrizione:
      'Una casa di corte è una delle case che stanno intorno a un cortile comune, come si costruiva nelle frazioni. Questa ha la cucina con il fogolâr originale e uno scoperto privato dietro. È da rifare tutta, e il cortile va usato d’accordo con i vicini: lo diciamo subito perché a qualcuno piace e ad altri no. Il bagno oggi è fuori casa.',
    vicino: [
      'Scuola primaria a 5 minuti in auto.',
      'Stazione dei treni di Fiume Veneto a 6 minuti in auto.',
      'Supermercato a 5 minuti in auto.',
    ],
    perchePrezzo: 'Sotto la media dei rustici perché si condivide il cortile e il bagno è da portare in casa.',
  },
  {
    id: 'rif-143',
    rif: '143',
    rubrica: 'rustici',
    formato: 'piccolo',
    zona: 'roveredo',
    tipologia: 'terreno',
    mercato: 'terreni',
    attacco: 'Roveredo, terreno edificabile',
    titoloScheda: 'Lotto di 1.100 m² in zona residenziale, già con accesso dalla strada.',
    testo: 'Lotto di 1.100 m² in zona residenziale, con accesso dalla strada e allacciamenti al confine.',
    testoCorto: 'Lotto edificabile di 1.100 m², allacciamenti al confine.',
    dati: '1.100 m² di terreno, indice per una casa singola o una bifamiliare.',
    energia: 'APE non richiesto: è un terreno.',
    prezzo: 92000,
    affitto: false,
    speseMese: null,
    mq: 1100,
    classe: null,
    casa: [
      { t: 'Superficie', v: '1.100 m²' },
      { t: 'Cosa ci si costruisce', v: 'una casa singola o una bifamiliare, fino a circa 660 m³' },
      { t: 'Forma', v: 'rettangolare, 25 per 44 metri' },
    ],
    costi: [
      { t: 'Spese condominiali', v: 'nessuna' },
      { t: 'Allacciamenti', v: 'acqua, gas, luce e fognatura al confine del lotto' },
      { t: 'Classe energetica', v: 'APE non richiesto per i terreni' },
    ],
    fuori: [
      { t: 'Accesso', v: 'diretto dalla strada comunale' },
      { t: 'Esposizione', v: 'il lato lungo guarda a sud' },
      { t: 'Vincoli', v: 'nessuno, secondo il certificato di destinazione urbanistica' },
    ],
    descrizione:
      'Un lotto edificabile in una zona di case singole, a Roveredo, con il lato lungo esposto a sud: la casa si orienta bene. Gli allacciamenti arrivano al confine. Il certificato di destinazione urbanistica è aggiornato a luglio 2026 e lo trovi in agenzia. I numeri su quanto si può costruire sono indicativi: il progetto lo verifica il tuo tecnico in comune.',
    vicino: [
      'Scuola primaria a 6 minuti a piedi.',
      'Fermata della corriera per Pordenone a 5 minuti a piedi.',
      'Pordenone centro a 12 minuti in auto.',
    ],
    perchePrezzo: 'In linea con i terreni edificabili di Roveredo.',
  },

  /* ================================================ Affitti */
  {
    id: 'rif-229',
    rif: '229',
    rubrica: 'affitti',
    formato: 'testa',
    zona: 'torre',
    tipologia: 'appartamento',
    mercato: 'affitti',
    attacco: 'Torre, trilocale in affitto',
    titoloScheda: 'Trilocale non arredato con cucina arredata, contratto 4+4.',
    testo:
      'Trilocale al primo piano con ascensore, non arredato ma con la cucina già montata. Due camere, balcone, posto auto coperto. Contratto 4+4, libero dal primo novembre.',
    testoCorto: 'Primo piano con ascensore, due camere, cucina arredata. Contratto 4+4.',
    dati: '80 m², tre locali, un bagno, primo piano, 1999.',
    energia: 'Classe D, riscaldamento autonomo.',
    prezzo: 690,
    affitto: true,
    speseMese: 60,
    mq: 80,
    classe: 'D',
    casa: [
      { t: 'Superficie', v: '80 m²' },
      { t: 'Locali', v: 'soggiorno, cucina arredata, due camere' },
      { t: 'Bagni', v: 'uno, con doccia' },
      { t: 'Piano', v: 'primo di tre, con ascensore' },
      { t: 'Arredo', v: 'solo la cucina' },
      { t: 'Libero', v: 'dal 1° novembre 2026' },
    ],
    costi: [
      { t: 'Canone', v: '690 € al mese' },
      { t: 'Spese condominiali', v: '60 € al mese' },
      { t: 'Contratto', v: '4+4, deposito di tre mensilità' },
      { t: 'Riscaldamento', v: 'autonomo' },
      { t: 'Classe energetica', v: 'D, IPE 135 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Posto auto', v: 'coperto' },
      { t: 'Balcone', v: 'sì, sul soggiorno' },
      { t: 'Cantina', v: 'nessuna' },
    ],
    descrizione:
      'Un trilocale per chi vuole portare i suoi mobili ma non comprare una cucina: quella c’è, del 2020, con lavastoviglie. Il proprietario chiede un contratto 4+4 e tre mensilità di deposito. Animali piccoli ammessi. Il balcone è sulla via, che di giorno ha un po’ di traffico; le camere sono sul retro.',
    vicino: [
      'Scuola primaria a 6 minuti a piedi.',
      'Fermata dell’autobus urbano a 2 minuti a piedi.',
      'Supermercato a 5 minuti a piedi.',
    ],
    perchePrezzo: 'In linea con gli affitti di Torre, con il posto auto compreso.',
  },
  {
    id: 'rif-248',
    rif: '248',
    rubrica: 'affitti',
    formato: 'piccolo',
    zona: 'centro',
    tipologia: 'monolocale',
    mercato: 'affitti',
    attacco: 'Centro, monolocale arredato',
    titoloScheda: 'Monolocale arredato, contratto a canone concordato 3+2.',
    testo: 'Monolocale arredato al secondo piano, rifatto nel 2022. Contratto 3+2 a canone concordato.',
    testoCorto: 'Monolocale arredato in centro. Contratto 3+2 concordato.',
    dati: '38 m², un locale, un bagno, secondo piano, 2022.',
    energia: 'Classe D, riscaldamento centralizzato.',
    prezzo: 520,
    affitto: true,
    speseMese: 50,
    mq: 38,
    classe: 'D',
    casa: [
      { t: 'Superficie', v: '38 m²' },
      { t: 'Locali', v: 'un locale con angolo cottura e letto alla francese' },
      { t: 'Bagni', v: 'uno, con doccia' },
      { t: 'Piano', v: 'secondo, con ascensore' },
      { t: 'Arredo', v: 'completo, rifatto nel 2022' },
      { t: 'Libero', v: 'subito' },
    ],
    costi: [
      { t: 'Canone', v: '520 € al mese' },
      { t: 'Spese condominiali', v: '50 € al mese, riscaldamento compreso' },
      { t: 'Contratto', v: '3+2 a canone concordato, deposito di due mensilità' },
      { t: 'Riscaldamento', v: 'centralizzato con contabilizzatori' },
      { t: 'Classe energetica', v: 'D, IPE 140 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Posto auto', v: 'nessuno' },
      { t: 'Cantina', v: 'nessuna' },
      { t: 'Biciclette', v: 'deposito comune al piano terra' },
    ],
    descrizione:
      'Per chi lavora in centro o in ospedale e vuole arrivare a piedi. Il monolocale è stato rifatto nel 2022, arredo compreso. Il contratto è a canone concordato 3+2: il canone sta nelle fasce dell’accordo comunale e ci sono vantaggi fiscali per entrambe le parti. Non c’è posto auto e non si accettano animali.',
    vicino: [
      'Piazza Cavour a 3 minuti a piedi.',
      'Stazione dei treni a 7 minuti a piedi.',
      'Supermercato a 2 minuti a piedi.',
    ],
    perchePrezzo: 'Sopra la media al metro quadro perché è piccolo e arredato: i monolocali costano sempre di più al m².',
  },
  {
    id: 'rif-235',
    rif: '235',
    rubrica: 'affitti',
    formato: 'piccolo',
    zona: 'borgomeduna',
    tipologia: 'appartamento',
    mercato: 'affitti',
    attacco: 'Borgomeduna, bilocale arredato',
    titoloScheda: 'Bilocale arredato vicino alla stazione, contratto 4+4.',
    testo: 'Bilocale arredato al piano rialzato, a 8 minuti a piedi dalla stazione. Contratto 4+4.',
    testoCorto: 'Bilocale arredato vicino alla stazione. Contratto 4+4.',
    dati: '55 m², due locali, un bagno, piano rialzato, 1980.',
    energia: 'Classe E, riscaldamento autonomo.',
    prezzo: 580,
    affitto: true,
    speseMese: 30,
    mq: 55,
    classe: 'E',
    casa: [
      { t: 'Superficie', v: '55 m²' },
      { t: 'Locali', v: 'soggiorno con angolo cottura, una camera' },
      { t: 'Bagni', v: 'uno, con vasca' },
      { t: 'Piano', v: 'rialzato' },
      { t: 'Arredo', v: 'completo' },
      { t: 'Libero', v: 'dal 15 ottobre 2026' },
    ],
    costi: [
      { t: 'Canone', v: '580 € al mese' },
      { t: 'Spese condominiali', v: '30 € al mese' },
      { t: 'Contratto', v: '4+4, deposito di tre mensilità' },
      { t: 'Riscaldamento', v: 'autonomo' },
      { t: 'Classe energetica', v: 'E, IPE 180 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Posto auto', v: 'scoperto, nel cortile' },
      { t: 'Cantina', v: 'sì, piccola' },
      { t: 'Balcone', v: 'nessuno' },
    ],
    descrizione:
      'Un bilocale arredato comodo per chi prende il treno ogni giorno. L’arredo è semplice e completo, la cucina ha il forno e la lavatrice sta in bagno. Il piano rialzato ha le finestre basse verso il cortile: chi tiene alla riservatezza lo sappia. Il proprietario preferisce un contratto lungo.',
    vicino: [
      'Stazione dei treni a 8 minuti a piedi.',
      'Fermata dell’autobus urbano a 2 minuti a piedi.',
      'Supermercato a 3 minuti a piedi.',
    ],
    perchePrezzo: 'Sopra la media di Borgomeduna perché è arredato.',
  },
  {
    id: 'rif-212',
    rif: '212',
    rubrica: 'affitti',
    formato: 'piccolo',
    zona: 'cordenons',
    tipologia: 'casa',
    mercato: 'affitti',
    attacco: 'Cordenons, schiera con giardino',
    titoloScheda: 'Casa a schiera in affitto, tre camere e giardino, contratto 4+4.',
    testo: 'Casa a schiera non arredata, tre camere, due bagni, giardino di 100 m² e garage. Contratto 4+4.',
    testoCorto: 'Casa a schiera con tre camere e giardino. Contratto 4+4.',
    dati: '130 m², cinque locali, due bagni, due piani, 2001.',
    energia: 'Classe C, riscaldamento autonomo.',
    prezzo: 850,
    affitto: true,
    speseMese: null,
    mq: 130,
    classe: 'C',
    casa: [
      { t: 'Superficie', v: '130 m²' },
      { t: 'Locali', v: 'soggiorno, cucina, tre camere' },
      { t: 'Bagni', v: 'due' },
      { t: 'Piani', v: 'terra e primo' },
      { t: 'Arredo', v: 'non arredata' },
      { t: 'Libero', v: 'dal 1° dicembre 2026' },
    ],
    costi: [
      { t: 'Canone', v: '850 € al mese' },
      { t: 'Spese condominiali', v: 'nessuna' },
      { t: 'Contratto', v: '4+4, deposito di tre mensilità' },
      { t: 'Riscaldamento', v: 'autonomo, caldaia del 2019' },
      { t: 'Classe energetica', v: 'C, IPE 92 kWh/m² anno' },
    ],
    fuori: [
      { t: 'Giardino', v: '100 m² sul retro' },
      { t: 'Garage', v: 'singolo' },
      { t: 'Cantina', v: 'nessuna' },
    ],
    descrizione:
      'Una casa intera in affitto, cosa rara: la proprietaria si è trasferita per lavoro e cerca una famiglia per almeno quattro anni. La casa è del 2001 e in ordine, con il giardino sul retro recintato. Si affitta vuota: la cucina va portata. Animali ammessi, con un deposito in più.',
    vicino: [
      'Scuola primaria a 7 minuti a piedi.',
      'Fermata dell’autobus per Pordenone a 5 minuti a piedi.',
      'Supermercato a 4 minuti in auto.',
    ],
    perchePrezzo: 'In linea con la media degli affitti di Cordenons.',
  },
  {
    id: 'rif-250',
    rif: '250',
    rubrica: 'affitti',
    formato: 'piccolo',
    zona: 'villanova',
    tipologia: 'box',
    mercato: null,
    attacco: 'Villanova, box auto singolo',
    titoloScheda: 'Box auto singolo con porta basculante, in un cortile chiuso.',
    testo: 'Box auto singolo con porta basculante e luce, in un cortile chiuso da un cancello automatico.',
    testoCorto: 'Box auto singolo, cortile con cancello automatico.',
    dati: '16 m², piano terra.',
    energia: 'APE non richiesto: è un box auto.',
    prezzo: 80,
    affitto: true,
    speseMese: null,
    mq: 16,
    classe: null,
    casa: [
      { t: 'Superficie', v: '16 m², 2,6 per 6,2 metri' },
      { t: 'Porta', v: 'basculante, manuale' },
      { t: 'Luce', v: 'sì, una presa' },
    ],
    costi: [
      { t: 'Canone', v: '80 € al mese' },
      { t: 'Spese', v: 'comprese nel canone' },
      { t: 'Contratto', v: 'annuale, rinnovabile, deposito di una mensilità' },
      { t: 'Classe energetica', v: 'APE non richiesto per i box' },
    ],
    fuori: [
      { t: 'Accesso', v: 'cortile con cancello automatico' },
      { t: 'Altezza', v: '2,1 metri: ci sta un’auto media, non un furgone' },
      { t: 'Libero', v: 'subito' },
    ],
    descrizione:
      'Un box in un cortile chiuso, con la luce e una presa: ci sta un’auto media e resta posto per le biciclette. La porta basculante è manuale. Contratto annuale, rinnovabile. Non ci stanno furgoni: l’altezza della porta è di 2,1 metri.',
    vicino: [
      'Fermata dell’autobus urbano a 3 minuti a piedi.',
      'Centro città a 6 minuti in auto.',
      'Supermercato a 4 minuti a piedi.',
    ],
    perchePrezzo: null,
  },
] as const satisfies readonly Annuncio[];

export type IdAnnuncio = (typeof ANNUNCI)[number]['id'];

/** Annuncio per id, oppure undefined (Rif. salvato che non esiste più, ?segna= sbagliato). */
export function annuncioDa(id: string): Annuncio | undefined {
  return (ANNUNCI as readonly Annuncio[]).find((a) => a.id === id);
}

/** Da "214" o "rif-214" all'id; undefined se non esiste. Serve a ?segna=214,229 e #scheda-214. */
export function idDaRif(rif: string): string | undefined {
  const pulito = rif.trim().toLowerCase().replace(/^rif-/, '');
  const trovato = (ANNUNCI as readonly Annuncio[]).find((a) => a.rif === pulito);
  return trovato?.id;
}

/** Ordine delle rubriche (sommario, striscia, colonna). */
export const ORDINE_RUBRICHE = ['appartamenti', 'case', 'rustici', 'affitti'] as const satisfies readonly Rubrica[];

/** I due annunci proposti nello stato vuoto del giro (brand-strategist 7.4, ux 5.7 B). */
export const DA_CUI_PARTIRE = ['rif-214', 'rif-231'] as const satisfies readonly IdAnnuncio[];

/* ================================================ Cerchiamo */

/**
 * Annunci "Cerchiamo" (ux-architect 5.0): tappabuchi onesti per pareggiare le
 * colonne. Non evidenziabili, non aprono schede, senza Rif. né bottoni.
 * Attacco in Libre Franklin 700, poi il testo di seguito nella stessa frase.
 * Due per rubrica: il primo (`principale: true`) chiude la rubrica anche
 * nella colonna mobile; il secondo serve solo al foglio.
 */
export interface Cerchiamo {
  id: string;
  rubrica: Rubrica;
  principale: boolean;
  attacco: string;
  testo: string;
}

export const CERCHIAMO = [
  {
    id: 'cerchiamo-a1',
    rubrica: 'appartamenti',
    principale: true,
    attacco: 'Cerchiamo per una coppia',
    testo: 'un bilocale in Centro o a Torre, fino a € 140.000. Anche al terzo piano, se c’è l’ascensore.',
  },
  {
    id: 'cerchiamo-a2',
    rubrica: 'appartamenti',
    principale: false,
    attacco: 'Cerchiamo a San Gregorio',
    testo: 'un trilocale con ascensore per una signora che lascia la casa grande. Anche da rinfrescare.',
  },
  {
    id: 'cerchiamo-c1',
    rubrica: 'case',
    principale: true,
    attacco: 'Cerchiamo per una famiglia',
    testo: 'una casa a schiera a Porcia o a Roveredo, con tre camere e un pezzo di giardino, fino a € 270.000.',
  },
  {
    id: 'cerchiamo-c2',
    rubrica: 'case',
    principale: false,
    attacco: 'Cerchiamo per due fratelli',
    testo: 'una bifamiliare da dividere, anche da sistemare, a Cordenons o a Villanova.',
  },
  {
    id: 'cerchiamo-r1',
    rubrica: 'rustici',
    principale: true,
    attacco: 'Cerchiamo un terreno',
    testo: 'edificabile tra 600 e 900 m² a Porcia, Roveredo o Fiume Veneto.',
  },
  {
    id: 'cerchiamo-r2',
    rubrica: 'rustici',
    principale: false,
    attacco: 'Cerchiamo un rustico',
    testo: 'con portico, anche da rifare tutto, entro venti minuti dal centro.',
  },
  {
    id: 'cerchiamo-f1',
    rubrica: 'affitti',
    principale: true,
    attacco: 'Cerchiamo per un’infermiera',
    testo: 'un bilocale arredato vicino all’ospedale, in affitto dal primo novembre.',
  },
  {
    id: 'cerchiamo-f2',
    rubrica: 'affitti',
    principale: false,
    attacco: 'Cerchiamo un box auto',
    testo: 'o un posto auto coperto in Centro, in affitto, per chi abita in zona pedonale.',
  },
] as const satisfies readonly Cerchiamo[];
