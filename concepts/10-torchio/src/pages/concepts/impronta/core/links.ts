/**
 * IMPRONTA · link di uscita (costanti, nessun accesso al browser).
 *
 * Da verificare al porting (tech-architect §3.1): l'URL della pagina del
 * Concept Lab nel sito vero. Il ritorno "Torna in Ciceri Lab" lo fa il
 * componente condiviso ConceptBackButton; LAB_URL serve ai link nel testo
 * (colophon).
 */

import { RECAPITI } from '../content/testi';

/** Pagina del Concept Lab (nel sito: la home, che apre la vetrina dei concept). */
export const LAB_URL = '/';

/** Sito di CiceriLab (firma "Un concept di CiceriLab"). */
export const CICERILAB_URL = 'https://cicerilab.com';

/** Maps cerca la via, non un'attività (copywriter §9). */
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RECAPITI.mapsQuery)}`;

/** Telefono di esempio (numero inesistente: repo pubblico). */
export const TELEFONO_URL = RECAPITI.telefonoHref;

/** Email di esempio (dominio .example). */
export const EMAIL_URL = `mailto:${RECAPITI.email}`;
