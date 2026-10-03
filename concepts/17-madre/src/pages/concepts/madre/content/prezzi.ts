/**
 * MADRE · prodotti, pezzature, prezzi, giorni e regole del pane fisso (copywriter).
 *
 * Una sola fonte per tutto il sito (brand-strategist §7 e §10, tech-architect
 * §6.6). Qui ci sono DATI: nessun calcolo di totali. Le regole della settimana
 * le applica state/settimana.ts (scaffold) leggendo questi numeri; le frasi
 * le scrive content/testi.ts.
 *
 * Prezzi verosimili per un panificio di quartiere di Pordenone nel 2026, in
 * euro, IVA inclusa. Sono ESEMPI per un concept: l'attività è inventata,
 * nessun dato legale, recapiti che non esistono (il repo è pubblico).
 *
 * Nessun accesso al browser a livello di modulo: il formattatore degli euro si
 * crea alla prima chiamata.
 */

/* ================================================================== tipi (fissati dal tech-architect §6.6) */

export type IdPane = 'pagnotta' | 'segale' | 'sorc' | 'integrale' | 'ciabatta' | 'semola';
export type IdDolce = 'gubana' | 'strucolo' | 'crostata' | 'esse' | 'frolla' | 'pinza';
export type IdPasta = 'bigne' | 'cannoncini' | 'diplomatiche' | 'sfogliatine' | 'krapfen';
export type IdGiorno = 'lun' | 'mar' | 'mer' | 'gio' | 'ven' | 'sab' | 'dom';
export type IdPezzatura = '500g' | '1kg' | 'pezzo';
export type PesoVassoio = 500 | 750 | 1000;
export type Frequenza = 'ogni' | 'alterna';

export interface Pezzatura {
  readonly id: IdPezzatura;
  /** Come si scrive su bottoni e cartellini: "500 g", "1 kg", "circa 300 g". */
  readonly etichetta: string;
  /** Euro, IVA inclusa. */
  readonly prezzo: number;
}

export interface Pane {
  readonly id: IdPane;
  /** Nome per esteso, come sul cartellino. */
  readonly nome: string;
  /** Due righe: com'è dentro, poi con cosa si mangia o quanto dura. */
  readonly righe: readonly [string, string];
  /** Euro al chilo. */
  readonly alKg: number;
  /** In ordine dalla più piccola: la prima è quella che entra quando si mette il pane in un giorno. */
  readonly pezzature: readonly Pezzatura[];
  /** Giorni in cui si fa (ordine della settimana). */
  readonly giorni: readonly IdGiorno[];
  /** Gli stessi giorni a parole, senza articolo: "martedì e venerdì". */
  readonly giorniTesto: string;
  /** Solo testo, la validazione guarda i giorni (richiesta del brand-strategist). */
  readonly stagione?: string;
  /** Grandezza relativa sul bancone: 1 = pagnotta da 1 kg (altezza della foto, ux §5.3). */
  readonly scala: number;
}

export interface PezzoDolce {
  /** "piccola, 500 g", "una fetta", "un etto". */
  readonly etichetta: string;
  readonly prezzo: number;
}

export interface Dolce {
  readonly id: IdDolce;
  readonly nome: string;
  /** Due righe: cos'è davvero (ingredienti), poi quanto dura o come si prende. */
  readonly righe: readonly [string, string];
  /** Euro al chilo; null se si vende solo a pezzo. */
  readonly alKg: number | null;
  readonly pezzi: readonly PezzoDolce[];
  /** "tutto l'anno", "a Pasqua, su ordinazione". */
  readonly quando: string;
  readonly soloSuOrdinazione: boolean;
  /** Grandezza relativa sul bancone (1 = pagnotta da 1 kg). */
  readonly scala: number;
}

export interface Pasta {
  readonly id: IdPasta;
  /** Nome al plurale, come si chiede al banco: "Bignè", "Cannoncini". */
  readonly nome: string;
  /** Una riga: cosa c'è dentro. */
  readonly riga: string;
}

export interface Vassoio {
  readonly peso: PesoVassoio;
  /** Numero indicativo di paste ("circa 12"). */
  readonly paste: number;
  readonly prezzo: number;
}

/* ================================================================== euro */

let formatoEuro: Intl.NumberFormat | null = null;

/**
 * "5,80 €", "13,00 €", "25,50 €" (Intl it-IT, sempre due decimali; tra cifra
 * ed euro c'è uno spazio che non va a capo).
 */
export function euro(valore: number): string {
  if (formatoEuro === null) {
    formatoEuro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  }
  return formatoEuro.format(valore);
}

/* ================================================================== giorni */

/** Ordine della settimana del negozio: si parte dal lunedì (chiuso). */
export const ORDINE_GIORNI: readonly IdGiorno[] = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];

/** Il lunedì siamo chiusi. */
export const GIORNO_CHIUSO: IdGiorno = 'lun';

/* ================================================================== pani */

/**
 * I sei pani. L'ordine di ORDINE_PANI è quello della vetrina e della fila del
 * pane fisso (dal più comprato al più raro, ux §5.3).
 */
export const PANI_PER_ID: Readonly<Record<IdPane, Pane>> = {
  pagnotta: {
    id: 'pagnotta',
    nome: 'Pagnotta di madre',
    righe: [
      'Farina tipo 1, acqua, sale e la madre. Nient\'altro.',
      'Crosta spessa, mollica che resta morbida fino al terzo giorno.',
    ],
    alKg: 5.8,
    pezzature: [
      { id: '500g', etichetta: '500 g', prezzo: 2.9 },
      { id: '1kg', etichetta: '1 kg', prezzo: 5.8 },
    ],
    giorni: ['mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
    giorniTesto: 'da martedì a domenica',
    scala: 1,
  },
  ciabatta: {
    id: 'ciabatta',
    nome: 'Ciabatta',
    righe: [
      'Impasto morbido, con tanta acqua: dentro ha i buchi grandi.',
      'Crosta sottile. È la più buona in giornata, aperta col San Daniele.',
    ],
    alKg: 5,
    pezzature: [{ id: 'pezzo', etichetta: 'circa 300 g', prezzo: 1.5 }],
    giorni: ['mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
    giorniTesto: 'da martedì a domenica',
    scala: 0.56,
  },
  integrale: {
    id: 'integrale',
    nome: 'Integrale',
    righe: [
      'Tutta farina integrale, crusca compresa, e la madre.',
      'Mollica fitta e scura: si taglia sottile e tiene tre giorni.',
    ],
    alKg: 5.6,
    pezzature: [{ id: '500g', etichetta: '500 g', prezzo: 2.8 }],
    giorni: ['mar', 'gio', 'sab'],
    giorniTesto: 'martedì, giovedì e sabato',
    scala: 0.83,
  },
  segale: {
    id: 'segale',
    nome: 'Segale e cumino',
    righe: [
      'Metà segale e metà frumento, con i semi di cumino dentro.',
      'È il pane del formaggio e dello speck.',
    ],
    alKg: 7.2,
    pezzature: [{ id: '500g', etichetta: '500 g', prezzo: 3.6 }],
    giorni: ['mar', 'ven'],
    giorniTesto: 'martedì e venerdì',
    scala: 0.69,
  },
  semola: {
    id: 'semola',
    nome: 'Filone di semola',
    righe: [
      'Semola rimacinata di grano duro: la mollica è gialla.',
      'Lungo e stretto, si taglia a fette spesse. Tiene bene anche il giorno dopo.',
    ],
    alKg: 5.4,
    pezzature: [{ id: '500g', etichetta: '500 g', prezzo: 2.7 }],
    giorni: ['mer', 'gio', 'sab'],
    giorniTesto: 'mercoledì, giovedì e sabato',
    scala: 0.64,
  },
  sorc: {
    id: 'sorc',
    nome: 'Pan di sorc',
    righe: [
      'Mais, frumento e segale, con uvetta, fichi secchi e semi di finocchio.',
      'Viene dal Gemonese. Col formaggio, oppure da solo a merenda.',
    ],
    alKg: 9.6,
    pezzature: [{ id: '500g', etichetta: '500 g', prezzo: 4.8 }],
    giorni: ['ven', 'sab'],
    giorniTesto: 'venerdì e sabato',
    stagione: 'da ottobre a Pasqua',
    scala: 0.78,
  },
};

export const ORDINE_PANI: readonly IdPane[] = ['pagnotta', 'ciabatta', 'integrale', 'segale', 'semola', 'sorc'];

export const PANI: readonly Pane[] = ORDINE_PANI.map((id) => PANI_PER_ID[id]);

/** La domenica si fanno solo questi due (fino alle 12.30). */
export const DOMENICA_PANI: readonly IdPane[] = ['pagnotta', 'ciabatta'];

/** Più di 6 pezzi dello stesso pane in un giorno: si telefona. */
export const MAX_PEZZI = 6;

/* ================================================================== dolci */

export const DOLCI_PER_ID: Readonly<Record<IdDolce, Dolce>> = {
  gubana: {
    id: 'gubana',
    nome: 'Gubana',
    righe: [
      'Pasta lievitata avvolta a chiocciola, con noci, uvetta, pinoli e un goccio di grappa.',
      'Incartata dura una settimana: si porta anche in viaggio.',
    ],
    alKg: 26,
    pezzi: [
      { etichetta: 'piccola, 500 g', prezzo: 13 },
      { etichetta: 'grande, 1 kg', prezzo: 26 },
    ],
    quando: 'tutto l\'anno',
    soloSuOrdinazione: false,
    scala: 0.89,
  },
  strucolo: {
    id: 'strucolo',
    nome: 'Strucolo di mele',
    righe: [
      'Pasta tirata sottile e arrotolata con mele, uvetta, pinoli e cannella.',
      'Intero o a fette, come lo vuoi.',
    ],
    alKg: 20,
    pezzi: [
      { etichetta: 'intero, circa 800 g', prezzo: 16 },
      { etichetta: 'una fetta', prezzo: 2.5 },
    ],
    quando: 'tutto l\'anno',
    soloSuOrdinazione: false,
    scala: 0.56,
  },
  crostata: {
    id: 'crostata',
    nome: 'Crostata di marmellata',
    righe: [
      'Frolla al burro con marmellata di albicocche o di frutti di bosco.',
      'Tonda da 24 cm, con la grata di frolla sopra.',
    ],
    alKg: 18,
    pezzi: [{ etichetta: 'da 24 cm, circa 800 g', prezzo: 14.5 }],
    quando: 'tutto l\'anno',
    soloSuOrdinazione: false,
    scala: 0.83,
  },
  esse: {
    id: 'esse',
    nome: 'Esse',
    righe: [
      'Biscotti di frolla a forma di S, come si fanno a Raveo, in Carnia.',
      'Burro, uova e scorza di limone. Vanno bene inzuppati nel caffellatte.',
    ],
    alKg: 22,
    pezzi: [{ etichetta: 'sacchetto da 250 g', prezzo: 5.5 }],
    quando: 'tutto l\'anno',
    soloSuOrdinazione: false,
    scala: 0.5,
  },
  frolla: {
    id: 'frolla',
    nome: 'Biscotti di frolla',
    righe: [
      'Frolla al burro in sei forme, alcuni con la marmellata in mezzo.',
      'Si prendono a peso: un etto sono sei o sette biscotti.',
    ],
    alKg: 20,
    pezzi: [{ etichetta: 'un etto', prezzo: 2 }],
    quando: 'tutto l\'anno',
    soloSuOrdinazione: false,
    scala: 0.44,
  },
  pinza: {
    id: 'pinza',
    nome: 'Pinza',
    righe: [
      'Pasta lievitata con uova, burro e scorza di limone, tonda, con tre tagli sopra.',
      'Non è la pinza veneta dell\'Epifania. Si ordina entro il mercoledì santo.',
    ],
    alKg: 18,
    pezzi: [{ etichetta: 'circa 700 g', prezzo: 12.5 }],
    quando: 'a Pasqua, su ordinazione',
    soloSuOrdinazione: true,
    scala: 0.72,
  },
};

export const ORDINE_DOLCI: readonly IdDolce[] = ['gubana', 'strucolo', 'crostata', 'esse', 'frolla', 'pinza'];

export const DOLCI: readonly Dolce[] = ORDINE_DOLCI.map((id) => DOLCI_PER_ID[id]);

/** Dolci interi su ordinazione: almeno due giorni prima (brand-strategist §8). */
export const GIORNI_ANTICIPO_DOLCI = 2;

/* ================================================================== paste e vassoio della domenica */

export const PASTE_PER_ID: Readonly<Record<IdPasta, Pasta>> = {
  bigne: { id: 'bigne', nome: 'Bignè', riga: 'Alla crema o al cioccolato, un boccone.' },
  cannoncini: { id: 'cannoncini', nome: 'Cannoncini', riga: 'Sfoglia arrotolata, piena di crema.' },
  diplomatiche: { id: 'diplomatiche', nome: 'Diplomatiche', riga: 'Due strati di sfoglia, crema e pan di Spagna bagnato.' },
  sfogliatine: { id: 'sfogliatine', nome: 'Sfogliatine', riga: 'Sfoglia con la glassa di zucchero. Niente crema.' },
  krapfen: { id: 'krapfen', nome: 'Krapfen', riga: 'Piccoli, alla crema, con lo zucchero a velo.' },
};

export const ORDINE_PASTE: readonly IdPasta[] = ['bigne', 'cannoncini', 'diplomatiche', 'sfogliatine', 'krapfen'];

export const PASTE: readonly Pasta[] = ORDINE_PASTE.map((id) => PASTE_PER_ID[id]);

/** Il vassoio si vende a peso. Le paste costano 34,00 € al chilo. */
export const VASSOI: readonly Vassoio[] = [
  { peso: 500, paste: 12, prezzo: 17 },
  { peso: 750, paste: 18, prezzo: 25.5 },
  { peso: 1000, paste: 24, prezzo: 34 },
];

export const PASTE_AL_KG = 34;

/** Peso con cui parte il vassoio quando lo si crea dal gettone o dal banco della domenica. */
export const PESO_VASSOIO_INIZIALE: PesoVassoio = 750;

/** Fino a quattro paste preferite sul vassoio. */
export const MAX_PREFERITE = 4;

/* ================================================================== orari che servono alle regole */

/** Il sacchetto è pronto dall'apertura: "dalle 7", la domenica "dalle 7.30". */
export const ORA_PRONTO: Readonly<Record<IdGiorno, string | null>> = {
  lun: null,
  mar: '7',
  mer: '7',
  gio: '7',
  ven: '7',
  sab: '7',
  dom: '7.30',
};

/** Ora in formato .ics (HHMMSS) per gli eventi del calendario: apertura del giorno. */
export const ORA_PRONTO_ICS: Readonly<Record<IdGiorno, string | null>> = {
  lun: null,
  mar: '070000',
  mer: '070000',
  gio: '070000',
  ven: '070000',
  sab: '070000',
  dom: '073000',
};

/** Cambi e sospensioni entro le 12 del giorno prima (ora intera, 24 h). */
export const ORA_LIMITE_CAMBI = 12;

/* ================================================================== recapiti di esempio */

/**
 * Dati di contatto DI ESEMPIO. Via Cappuccini è una via vera di Pordenone, il
 * civico è di fantasia; telefono ed email non esistono (formato .example).
 * Il numero e l'indirizzo email non si mostrano mai come testo: a vista ci
 * sono solo i link "Chiama" e "Scrivi" (testi.ts, RECAPITI_TESTI).
 */
export const RECAPITI = {
  indirizzo: 'Via Cappuccini 31, 33170 Pordenone',
  via: 'Via Cappuccini 31',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  /** Ricerca per "Apri in Maps": la via, non un'attività. */
  mapsQuery: 'Via Cappuccini, 33170 Pordenone PN',
  /** Solo come dato, mai a vista. */
  telefono: '0434 000 000',
  telefonoHref: 'tel:+390434000000',
  /** Solo come dato, mai a vista. */
  email: 'bottega@madre.example',
} as const;
