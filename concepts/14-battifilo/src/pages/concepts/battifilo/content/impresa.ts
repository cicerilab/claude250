/**
 * BATTIFILO · recapiti, orari e comuni (copywriter).
 *
 * Attività inventata. Indirizzo, telefono ed email sono DI ESEMPIO: il repo è
 * pubblico, quindi nessun numero che possa appartenere a qualcuno. Il telefono
 * e l'email non compaiono mai a vista: nel sito ci sono solo i link "Chiama",
 * "Scrivi", "Chiama Loris", "chiama l'ufficio".
 * Nessun dato legale (partita IVA, iscrizioni, permessi, direttore lavori).
 */

export const RECAPITI = {
  via: 'Via Sclavons 112',
  cap: '33084',
  citta: 'Cordenons',
  provincia: 'PN',
  /** Riga completa, come sul cartello. */
  indirizzo: 'Via Sclavons 112, 33084 Cordenons (PN)',
  /** Solo per l'href: non va mai scritto a vista. */
  telefono: '+39 0434 000000',
  telefonoHref: 'tel:+390434000000',
  /** Il capocantiere usa lo stesso numero di esempio. */
  capocantiereHref: 'tel:+390434000000',
  email: 'ufficio@battifilo.example',
  emailHref: 'mailto:ufficio@battifilo.example',
  /** Ricerca della via, mai un'attività. */
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Via+Sclavons+112+Cordenons',
} as const;

/** Righe degli orari del cartello: termine e descrizione. */
export const ORARI = [
  { chi: 'Ufficio', quando: 'dal lunedì al venerdì, 8:00-12:00 e 14:00-18:00' },
  {
    chi: 'Magazzino serramenti',
    quando: 'dal lunedì al venerdì 14:00-18:00, il sabato 8:30-12:00',
  },
  { chi: 'Cantieri', quando: 'dal lunedì al venerdì, 7:30-17:00. Il sabato no.' },
  { chi: 'Ferie', quando: 'tre settimane ad agosto e da Natale a Capodanno' },
] as const;

/** Comuni serviti, nell'ordine del cartello e del campo "Comune". */
export const COMUNI_SERVITI = [
  'Pordenone',
  'Cordenons',
  'Porcia',
  'San Quirino',
  'Fiume Veneto',
  'Sacile',
] as const;

export type ComuneServito = (typeof COMUNI_SERVITI)[number];

/** Valore dell'opzione "Altro comune" nel campo Comune. */
export const ALTRO_COMUNE = 'altro' as const;

/** Raggio di lavoro dichiarato, in km da Cordenons. */
export const RAGGIO_KM = 30;

/** Fasce del sopralluogo (campo "Quando"), stesso tipo dello store. */
export const QUANDO = ['mattina', 'pomeriggio', 'sabato'] as const;
export type Quando = (typeof QUANDO)[number];

/** Promesse di servizio, sempre uguali ovunque compaiano. */
export const PROMESSE = {
  /** giorni lavorativi entro cui arriva il prezzo scritto dopo il sopralluogo */
  prezzoScrittoGiorni: 5,
  /** settimane di consegna dei serramenti dall'ordine */
  consegnaSettimane: '6-8',
  /** finestre posate in una giornata */
  posaAlGiorno: '4-6',
} as const;
