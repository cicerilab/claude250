/**
 * NOVANTA · link esterni e di contatto (copywriter §8).
 * I dati sono in content/studio.ts: numero ed email sono di esempio e non si
 * mostrano mai a vista (a vista: "Chiama", "Scrivi").
 */

import { RECAPITI } from '../content/studio';

/** Vetrina del Concept Lab nel sito vero. Da verificare al porting (nello standalone `/` riporta al concept). */
export const LAB_URL = '/';

export const CICERILAB_URL = 'https://cicerilab.com';

/** Google Maps sulla via (nessuna attività finta). */
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RECAPITI.mapsQuery)}`;

/** `tel:` del numero di esempio (inesistente). */
export const TELEFONO_URL = RECAPITI.telefonoHref;

/** `mailto:` dell'indirizzo di esempio (dominio .example). */
export const EMAIL_URL = RECAPITI.emailHref;
