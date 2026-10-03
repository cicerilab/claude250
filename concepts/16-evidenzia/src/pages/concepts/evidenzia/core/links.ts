/**
 * EVIDENZIA · link verso fuori (tech-architect §3).
 *
 * I recapiti stanno in un posto solo, `content/zone.ts` (AGENZIA, copywriter):
 * qui si rileggono, mai riscritti. Numero e email sono di esempio (repo
 * pubblico): si mostrano solo come link "Chiama" / "Scrivi", mai in vista.
 */

import { AGENZIA, ZONE, type ZonaId } from '../content/zone';
import { MAPPA } from '../content/testi';

/** Ritorno al Concept Lab (nel sito lo gestisce ConceptBackButton; da verificare al porting). */
export const LAB_URL = '/';
export const CICERILAB_URL = 'https://cicerilab.com';
export const TELEFONO_URL: string = AGENZIA.telefonoHref;
export const EMAIL_URL: string = AGENZIA.emailHref;
/** Ricerca della VIA dell'agenzia su Google Maps (non di un'attività, che non esiste). */
export const MAPS_URL: string = AGENZIA.mapsUrl;
/** Pagina dei diritti di OpenStreetMap: l'attribuzione della mappa porta qui. */
export const OSM_COPYRIGHT_URL: string = MAPPA.attribuzioneUrl;

/** La zona su openstreetmap.org (link del riquadro d'errore della mappa). */
export function osmZonaUrl(zona: ZonaId): string {
  const z = ZONE[zona];
  return MAPPA.osmUrl(z.lat, z.lng, z.zoomOsm);
}

/** L'agenzia su openstreetmap.org (riquadro d'errore con il giro vuoto). */
export function osmAgenziaUrl(): string {
  return MAPPA.osmUrl(AGENZIA.lat, AGENZIA.lng, 16);
}
