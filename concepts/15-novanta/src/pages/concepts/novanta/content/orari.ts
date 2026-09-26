/**
 * NOVANTA · orari di apertura e schema di occupazione di ESEMPIO (copywriter).
 *
 * Solo dati per giorno della settimana, nessuna data: `sections/Prenota/calendario.ts`
 * li trasforma in ore con date vere a partire da `store.oggi`, solo nel
 * browser (mai nel prerender). Non è una disponibilità dal vivo e il sito lo
 * dice (`PRENOTA.anello.esempio` in `testi.ts`).
 *
 * Convenzioni:
 * - giorno della settimana 0 = lunedì … 6 = domenica (come l'anello: lunedì in alto);
 * - ore come stringhe 'HH:MM', 24 ore, ora locale di Pordenone;
 * - una tacca dell'anello = un orario d'inizio, ogni 30 minuti.
 */

export type GiornoSettimana = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Ora = `${number}${number}:${'00' | '30'}`;

/** Passo tra due orari d'inizio sull'anello. */
export const PASSO_MINUTI = 30;

/** Durate, in minuti (listino e file .ics). */
export const DURATA = {
  primaVisita: 60,
  controllo: 45,
} as const;

/** Il controllo cade tra +7 e +10 giorni dalla prima visita (creative-director 4.4). */
export const FINESTRA_CONTROLLO = { min: 7, max: 10 } as const;

/** Oggi si prenota solo da adesso + 2 ore in poi (ux-architect 5.5). */
export const ANTICIPO_MINIMO_ORE = 2;

/**
 * Apertura per le PRIME VISITE (60 min). Lo studio è aperto 8.00-20.00 dal
 * lunedì al venerdì: l'ultimo inizio di una prima visita è le 19:00. Sabato
 * 8.00-13.00: ultimo inizio le 12:00. Domenica chiuso.
 *
 * Tacche per giorno: lun-ven 23 (8:00 … 19:00), sabato 9 (8:00 … 12:00).
 */
export const APERTURA = {
  0: { aperto: true, primoInizio: '08:00', ultimoInizio: '19:00' },
  1: { aperto: true, primoInizio: '08:00', ultimoInizio: '19:00' },
  2: { aperto: true, primoInizio: '08:00', ultimoInizio: '19:00' },
  3: { aperto: true, primoInizio: '08:00', ultimoInizio: '19:00' },
  4: { aperto: true, primoInizio: '08:00', ultimoInizio: '19:00' },
  5: { aperto: true, primoInizio: '08:00', ultimoInizio: '12:00' },
  6: { aperto: false, primoInizio: null, ultimoInizio: null },
} as const satisfies Record<
  GiornoSettimana,
  { aperto: boolean; primoInizio: Ora | null; ultimoInizio: Ora | null }
>;

/**
 * Ore OCCUPATE di esempio, per pista. Tutte le altre ore dentro l'apertura
 * sono libere (salvo quelle già passate, che calcola `calendario.ts`).
 *
 * - `interna`: la settimana della prima visita;
 * - `esterna`: la settimana dopo, dove cade il controllo.
 *
 * Lo schema è verosimile: pieno presto la mattina e dopo le 17 (chi lavora),
 * qualche buco a pranzo. È costruito per far vedere gli stati dell'ux-architect
 * con dati normali, senza parametri:
 * - venerdì 18:00 libero in tutte e due le settimane (S2, il caso di Marta);
 * - mercoledì 13:30 libero nella prima settimana ma occupato nella seconda,
 *   con 14:00 libero (S4: "Alle 13:30 non c'è posto: ti proponiamo le 14:00");
 * - giovedì 13:30 libero nella seconda settimana (S3, "dopo").
 * Lo stato S5 (finestra 7-10 giorni tutta piena) non nasce da questi dati:
 * se serve per il collaudo lo simula `calendario.ts`.
 */
export const OCCUPATE = {
  interna: {
    0: ['08:00', '08:30', '09:00', '10:30', '11:00', '14:30', '15:00', '17:30', '18:00', '18:30', '19:00'],
    1: ['08:00', '08:30', '09:30', '10:00', '12:00', '15:30', '16:00', '17:00', '17:30', '18:30'],
    2: ['08:00', '09:00', '09:30', '11:30', '12:00', '16:30', '17:00', '17:30', '18:00', '19:00'],
    3: ['08:00', '08:30', '10:00', '10:30', '14:00', '14:30', '17:30', '18:00', '18:30', '19:00'],
    4: ['08:30', '09:00', '11:00', '11:30', '15:00', '16:00', '17:00', '17:30', '19:00'],
    5: ['08:30', '09:00', '09:30', '10:30', '11:00'],
    6: [],
  },
  esterna: {
    0: ['08:00', '08:30', '09:30', '10:00', '13:30', '16:00', '17:30', '18:00', '18:30'],
    1: ['08:00', '09:00', '09:30', '11:00', '15:00', '15:30', '17:00', '18:00', '18:30', '19:00'],
    2: ['08:00', '08:30', '10:30', '12:30', '13:00', '13:30', '17:30', '18:00', '18:30'],
    3: ['08:30', '09:00', '11:30', '12:00', '16:00', '16:30', '17:30', '18:00', '19:00'],
    4: ['08:00', '08:30', '09:00', '10:00', '14:30', '15:00', '17:30', '18:30', '19:00'],
    5: ['08:00', '08:30', '09:00', '10:00', '11:30'],
    6: [],
  },
} as const satisfies Record<'interna' | 'esterna', Record<GiornoSettimana, readonly Ora[]>>;

/**
 * Orari a vista (180°, piede della vista elenco, prenotazione senza
 * JavaScript). Testo già pronto, un giorno o un gruppo per riga.
 */
export const RIGHE_ORARI = [
  { giorni: 'lunedì-venerdì', ore: '8.00-20.00', nota: 'ultimo appuntamento alle 19.00' },
  { giorni: 'sabato', ore: '8.00-13.00', nota: null },
  { giorni: 'domenica', ore: 'chiuso', nota: null },
] as const;

/** L'osteopatia ha i suoi orari (Chiara). */
export const RIGA_ORARI_OSTEOPATIA = {
  titolo: 'Osteopatia',
  ore: 'martedì e giovedì 14.00-20.00, sabato 8.00-13.00',
} as const;

/** La segreteria al telefono. */
export const RIGA_ORARI_SEGRETERIA = {
  titolo: 'Al telefono',
  ore: 'lunedì-venerdì 8.30-12.30. Negli altri orari lascia un messaggio: ti richiamiamo entro il giorno lavorativo dopo.',
} as const;

/** Forma brevissima (0° e piede della vista elenco). */
export const ORARI_IN_BREVE = 'Lunedì-venerdì 8-20, sabato 8-13.';
