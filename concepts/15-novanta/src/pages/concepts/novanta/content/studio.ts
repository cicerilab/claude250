/**
 * NOVANTA · dati dello studio (copywriter).
 *
 * Lo studio è INVENTATO. Il civico, il telefono, l'email, i nomi e i prezzi
 * sono di esempio. Nessun dato legale: niente P.IVA, ragione sociale,
 * autorizzazione sanitaria, numeri d'albo, direttore sanitario.
 *
 * Il numero di telefono e l'email sono SOLO dati per i link (`tel:`,
 * `mailto:`): non si mostrano mai a vista. A vista si usano le etichette
 * "Chiama" e "Scrivi" di `content/testi.ts`.
 *
 * `core/links.ts` (scaffold) costruisce da qui TELEFONO_URL e MAPS_URL.
 */

export const RECAPITI = {
  via: 'Via Montereale 21',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  /** Riga unica dell'indirizzo, per il testo a vista e per il file .ics. */
  indirizzoRiga: 'Via Montereale 21, 33170 Pordenone',
  /** Forma breve per il piede della vista elenco. */
  indirizzoBreve: 'Via Montereale 21, Pordenone',
  /** Numero di esempio, solo come dato: NON va mostrato a vista. */
  telefonoNumero: '0434 000 000',
  /** href del link telefono (testata, 180°, esito fallito, senza JavaScript). */
  telefonoHref: 'tel:+390434000000',
  /** Email di esempio, solo come dato: NON va mostrata a vista. */
  email: 'studio@novanta.example',
  emailHref: 'mailto:studio@novanta.example',
  /**
   * Testo da cercare in Maps: la via a Pordenone, non un'attività.
   * `core/links.ts`: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`.
   */
  mapsQuery: 'Via Montereale, 33170 Pordenone PN',
} as const;

/** Accesso, parcheggio, mezzi. Detti in modo generico, senza numeri di linea. */
export const ACCESSO = {
  piano: 'Primo piano, con ascensore.',
  ingresso: 'Ingresso senza gradini dal cortile.',
  parcheggio: 'Due posti per i pazienti nel cortile, altri parcheggi lungo la via.',
  autobus: 'La fermata dell\'autobus è a pochi passi.',
} as const;

/**
 * Le persone dello studio: solo nomi, niente cognomi, niente titoli,
 * niente ritratti. Compaiono solo dentro le frasi di `testi.ts`.
 */
export const PERSONE = {
  giulia: { nome: 'Giulia', ruolo: 'fisioterapista', cosa: 'spalla, collo e riabilitazione dopo un intervento; fa quasi tutte le prime visite' },
  davide: { nome: 'Davide', ruolo: 'fisioterapista', cosa: 'ginocchio, caviglia, schiena e ritorno allo sport' },
  chiara: { nome: 'Chiara', ruolo: 'osteopata', cosa: 'osteopatia, martedì e giovedì pomeriggio e sabato mattina' },
  paola: { nome: 'Paola', ruolo: 'segreteria', cosa: 'telefono, appuntamenti e fatture, la mattina' },
} as const;

export type Persona = keyof typeof PERSONE;
