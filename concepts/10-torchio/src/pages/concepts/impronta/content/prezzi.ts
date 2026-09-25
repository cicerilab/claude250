/**
 * IMPRONTA · tabella prezzi di esempio (copywriter).
 *
 * Solo dati: nessun calcolo qui dentro. La formula che usa questi numeri vive in
 * sections/Banco/calcolaPrezzo.ts (section-builder-banco) ed è descritta in
 * docs/copywriter.md, sezione "Come si legge prezzi.ts".
 *
 * Prezzi verosimili per una bottega artigiana del Nord Est, anno 2026, in euro,
 * IVA inclusa, per privati. Sono ESEMPI per un concept: nessun dato legale.
 */

/* ------------------------------------------------------------------ tipi */

/** Devono coincidere con i tipi di state/store.ts (tech-architect, §6.1). */
export type Carta = 'citrino' | 'cotone' | 'cipria' | 'grafite';
export type Tecnica = 'secco' | 'colore' | 'lamina';
export type Prodotto = 'biglietto' | 'partecipazione' | 'intestata' | 'libro';
/** Solo per il prodotto "libro". Non è ancora nello store: va aggiunto. */
export type Legatura = 'brossura' | 'cartonato' | 'giapponese' | 'punto';
/** Campo facoltativo "Quando ti serve". Non entra nel prezzo. */
export type Quando = 'quindici' | 'mese' | 'avanti';

/* ------------------------------------------------------------ tirature */

/** Tirature proposte nel fieldset "Quante" (bottoni, niente slider). */
export const TIRATURE = {
  biglietto: [50, 100, 150, 250, 500, 1000],
  partecipazione: [50, 100, 150, 250, 500, 1000],
  intestata: [50, 100, 150, 250, 500, 1000],
  libro: [30, 50, 100, 300],
} as const;

/** Tiratura di partenza del banco per ogni prodotto. */
export const TIRATURA_DEFAULT = {
  biglietto: 100,
  partecipazione: 100,
  intestata: 250,
  libro: 30,
} as const;

/* ------------------------------------------------------------ prezzo base */

/**
 * Prezzo base in euro per tiratura: carta Cotone, stampa a secco, impianto
 * (lastra in fotopolimero da 60 €) già compreso, rifilo compreso.
 *
 * - biglietto: 85×55 mm, un lato.
 * - partecipazione: 148×105 mm, con busta in tinta.
 * - intestata: fogli A4 da 120 g della stessa tinta, con altrettante buste
 *   stampate (i fogli devono passare nella stampante dell'ufficio).
 * - libro: 48 pagine 150×210 mm, interno stampato in digitale su carta da
 *   120 g, copertina sulla carta scelta, brossura cucita a filo refe.
 */
export const PREZZO_BASE = {
  biglietto: { 50: 130, 100: 160, 150: 185, 250: 230, 500: 340, 1000: 530 },
  partecipazione: { 50: 260, 100: 390, 150: 480, 250: 650, 500: 1050, 1000: 1800 },
  intestata: { 50: 210, 100: 290, 150: 350, 250: 420, 500: 680, 1000: 1150 },
  libro: { 30: 480, 50: 650, 100: 1090, 300: 2550 },
} as const;

/* ------------------------------------------------------------ supplementi */

/**
 * Supplementi di tecnica, rispetto alla base a secco.
 * `impianto` si paga una volta, `aPezzo` si moltiplica per la tiratura.
 * - colore: inchiostro e lavaggio della macchina.
 * - lamina: il cliché in metallo costa 80 € invece della lastra da 60 €
 *   (quindi +20 € di impianto), più la pellicola a pezzo.
 * Per il libro la tecnica vale sulla copertina.
 */
export const SUPPLEMENTO_TECNICA = {
  secco: { impianto: 0, aPezzo: 0 },
  colore: { impianto: 40, aPezzo: 0.2 },
  lamina: { impianto: 20, aPezzo: 0.6 },
} as const;

/** Taglio colorato: il bordo dipinto a mano. */
export const TAGLIO_COLORATO = {
  aPezzo: 0.4,
  minimo: 40,
  /** Sulla carta intestata non si fa (i fogli vanno in stampante). */
  disponibile: {
    biglietto: true,
    partecipazione: true,
    intestata: false,
    libro: true,
  },
} as const;

/**
 * Supplemento carta in percentuale sul prezzo base (Cotone = 0).
 * Si applica prima dei supplementi di tecnica e taglio.
 */
export const SUPPLEMENTO_CARTA = {
  cotone: 0,
  citrino: 0.05,
  cipria: 0.05,
  grafite: 0.12,
} as const;

/**
 * Legatura del libro, in euro a copia rispetto alla brossura cucita (inclusa
 * nella base). Il punto metallico costa meno e vale fino a 48 pagine.
 */
export const SUPPLEMENTO_LEGATURA = {
  brossura: 0,
  cartonato: 4,
  giapponese: 2.5,
  punto: -1.5,
} as const;

export const LEGATURA_DEFAULT: Legatura = 'brossura';

/** Il totale indicativo si arrotonda ai 5 € più vicini. */
export const ARROTONDAMENTO = 5;

/* ------------------------------------------------------------ voci per il riepilogo */

/** Costi fissi citati nel riepilogo in parole e nella sezione tecniche. */
export const IMPIANTI = {
  lastra: 60,
  clicheLamina: 80,
  inchiostro: 40,
} as const;

/** Grammature reali delle carte, per prodotto (la intestata è sempre 120 g). */
export const GRAMMATURA = {
  citrino: 300,
  cotone: 600,
  cipria: 350,
  grafite: 400,
  intestata: 120,
  interno: 120,
} as const;

/** Spessore indicativo in millimetri, per la costa delle strisce. */
export const SPESSORE_MM = {
  citrino: 0.4,
  cotone: 0.7,
  cipria: 0.45,
  grafite: 0.5,
} as const;

/** Formati in millimetri (larghezza × altezza), per la proporzione della prova. */
export const FORMATO_MM = {
  biglietto: { l: 85, a: 55 },
  partecipazione: { l: 148, a: 105 },
  intestata: { l: 210, a: 297 },
  libro: { l: 150, a: 210 },
} as const;

/** Tempi dalla prova approvata, in giorni lavorativi. */
export const TEMPI_GIORNI = {
  biglietto: { da: 8, a: 12 },
  partecipazione: { da: 8, a: 12 },
  intestata: { da: 8, a: 12 },
  libro: { da: 15, a: 20 },
} as const;

/* ------------------------------------------------------------ altri prezzi citati nel sito */

/** Legatoria, sezione "Il filo": prezzo della sola legatura a copia, su 100 copie. */
export const LEGATORIA_A_COPIA = {
  brossura: 6,
  cartonato: 10,
  giapponese: 8.5,
  punto: 4.5,
  tiraturaRiferimento: 100,
  tiraturaMinima: 30,
} as const;

/** Lavori singoli di legatoria. */
export const LEGATORIA_SINGOLI = {
  tesiPrimaCopia: 55,
  tesiCopieSuccessive: 38,
  tesiPagineMax: 200,
  restauroDa: 90,
} as const;

/** Servizio: numeri delle promesse (brand-strategist §8). */
export const SERVIZIO = {
  bozzaGraficaInclusa: 1,
  modificheOrarie: 30,
  lastreConservateAnni: 2,
  rispostaGiorniLavorativi: 1,
  bustaInTintaAPezzo: 0.9,
} as const;

/**
 * Listino di esempio dei lavori tipici (brand-strategist §7), già coerente con
 * la formula del banco. Usato dalle didascalie di "Tre lavori sul bancone".
 * `prezzo` è il totale indicativo già arrotondato.
 */
export const ESEMPI = {
  partecipazione: {
    prodotto: 'partecipazione',
    carta: 'cipria',
    tecnica: 'secco',
    tiratura: 100,
    prezzo: 390,
    nota: 'prezzo "da": base Cotone, la Cipria aggiunge il 5%',
  },
  partecipazioneLamina: {
    prodotto: 'partecipazione',
    carta: 'cotone',
    tecnica: 'lamina',
    tiratura: 100,
    prezzo: 470,
    nota: '390 + 20 di cliché + 0,60 × 100',
  },
  biglietto: {
    prodotto: 'biglietto',
    carta: 'cotone',
    tecnica: 'secco',
    tiratura: 100,
    prezzo: 160,
    nota: 'base',
  },
  bigliettoLamina: {
    prodotto: 'biglietto',
    carta: 'cotone',
    tecnica: 'lamina',
    tiratura: 100,
    prezzo: 240,
    nota: '160 + 20 di cliché + 0,60 × 100',
  },
  libro: {
    prodotto: 'libro',
    carta: 'grafite',
    tecnica: 'colore',
    tiratura: 50,
    prezzo: 780,
    nota: '650 × 1,12 + 40 + 0,20 × 50 = 778, arrotondato a 780',
  },
} as const;
