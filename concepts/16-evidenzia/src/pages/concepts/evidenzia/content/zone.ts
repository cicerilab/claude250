/**
 * EVIDENZIA · zone, agenzia e calendario (copywriter).
 *
 * Coordinate verificate una volta il 26/09/2026 su OpenStreetMap (ricerca
 * Nominatim di openstreetmap.org, fatta a mano in fase di sviluppo). In pagina
 * non si chiama mai Nominatim: i numeri stanno qui.
 *
 * Il marcatore di una casa sta sulla ZONA, non sull'indirizzo (le agenzie non
 * pubblicano il civico): punto del quartiere o del comune più uno scostamento
 * fisso per annuncio, entro 250 m (SCOSTAMENTI).
 */

export type ZonaId =
  | 'centro'
  | 'borgomeduna'
  | 'torre'
  | 'rorai'
  | 'villanova'
  | 'sanGregorio'
  | 'cordenons'
  | 'porcia'
  | 'roveredo'
  | 'fiumeVeneto';

export interface Zona {
  /** Nome come lo dice chi ci abita: è anche l'inizio della riga d'attacco. */
  nome: string;
  /** Per il luogo del file .ics e per la riga "Apri la zona su openstreetmap.org". */
  luogo: string;
  /** true se è un quartiere di Pordenone, false se è un comune della prima cintura. */
  quartiere: boolean;
  lat: number;
  lng: number;
  /** Zoom consigliato per il link a openstreetmap.org della zona. */
  zoomOsm: number;
}

/**
 * Fonte di ogni punto (OSM, 26/09/2026):
 * centro: corso Vittorio Emanuele II; torre, rorai, sanGregorio: nodo "suburb"
 * o "quarter"; borgomeduna: suburb "Borgo Meduna"; villanova: quarter
 * "Villanova" (Borgo Meduna); comuni: centro amministrativo del comune
 * (Fiume Veneto: centro abitato).
 */
export const ZONE = {
  centro: { nome: 'Centro', luogo: 'Pordenone centro', quartiere: true, lat: 45.9563, lng: 12.6597, zoomOsm: 16 },
  borgomeduna: { nome: 'Borgomeduna', luogo: 'Borgomeduna, Pordenone', quartiere: true, lat: 45.9509, lng: 12.6766, zoomOsm: 16 },
  torre: { nome: 'Torre', luogo: 'Torre, Pordenone', quartiere: true, lat: 45.9688, lng: 12.6792, zoomOsm: 16 },
  rorai: { nome: 'Rorai Grande', luogo: 'Rorai Grande, Pordenone', quartiere: true, lat: 45.9659, lng: 12.6368, zoomOsm: 16 },
  villanova: { nome: 'Villanova', luogo: 'Villanova, Pordenone', quartiere: true, lat: 45.9427, lng: 12.6691, zoomOsm: 16 },
  sanGregorio: { nome: 'San Gregorio', luogo: 'San Gregorio, Pordenone', quartiere: true, lat: 45.9487, lng: 12.6587, zoomOsm: 16 },
  cordenons: { nome: 'Cordenons', luogo: 'Cordenons (PN)', quartiere: false, lat: 45.9882, lng: 12.7068, zoomOsm: 15 },
  porcia: { nome: 'Porcia', luogo: 'Porcia (PN)', quartiere: false, lat: 45.9595, lng: 12.6134, zoomOsm: 15 },
  roveredo: { nome: 'Roveredo in Piano', luogo: 'Roveredo in Piano (PN)', quartiere: false, lat: 46.0111, lng: 12.6203, zoomOsm: 15 },
  fiumeVeneto: { nome: 'Fiume Veneto', luogo: 'Fiume Veneto (PN)', quartiere: false, lat: 45.928, lng: 12.7322, zoomOsm: 15 },
} as const satisfies Record<ZonaId, Zona>;

/** Ordine delle zone (listino, elenco delle zone nello stato vuoto del giro). */
export const ORDINE_ZONE = [
  'centro',
  'sanGregorio',
  'torre',
  'rorai',
  'villanova',
  'borgomeduna',
  'porcia',
  'roveredo',
  'cordenons',
  'fiumeVeneto',
] as const satisfies readonly ZonaId[];

/**
 * L'agenzia: via Giuseppe Mazzini esiste in centro a Pordenone (OSM,
 * 45,9578 N 12,6570 E), il civico 24 è di fantasia. È anche il punto di
 * partenza del giro.
 */
export const AGENZIA = {
  nome: 'EVIDENZIA',
  via: 'Via Mazzini 24',
  viaBreve: 'via Mazzini',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  indirizzoRiga: 'Via Mazzini 24, 33170 Pordenone',
  lat: 45.9578,
  lng: 12.657,
  /** Ricerca della VIA per "Apri in Maps" (non di un'attività, che non esiste). */
  mapsQuery: 'Via Mazzini, 33170 Pordenone PN',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Via%20Mazzini%2C%2033170%20Pordenone%20PN',
  /** Recapiti di esempio: repo pubblico, numero chiaramente fittizio. Mai in vista, solo come link. */
  telefono: '0434 000 000',
  telefonoHref: 'tel:+390434000000',
  email: 'agenzia@evidenzia.example',
  emailHref: 'mailto:agenzia@evidenzia.example?subject=Il%20giro%20del%20sabato',
} as const;

/**
 * Scostamento fisso del marcatore dal punto della zona, per annuncio.
 * Gradi: 0,001 di latitudine sono circa 111 m, 0,001 di longitudine circa 77 m
 * a questa latitudine. Tutti i valori stanno entro |dLat| 0,0015 e |dLng|
 * 0,0020, cioè entro circa 230 m dal punto della zona.
 */
export const SCOSTAMENTI = {
  'rif-214': { dLat: 0.0009, dLng: -0.0011 },
  'rif-231': { dLat: 0.0006, dLng: 0.0008 },
  'rif-188': { dLat: -0.0012, dLng: 0.0005 },
  'rif-197': { dLat: 0.0011, dLng: -0.0014 },
  'rif-240': { dLat: -0.0007, dLng: -0.0016 },
  'rif-226': { dLat: 0.0013, dLng: 0.0012 },
  'rif-203': { dLat: -0.0008, dLng: -0.0006 },
  'rif-219': { dLat: -0.0014, dLng: -0.0009 },
  'rif-152': { dLat: 0.0012, dLng: 0.0017 },
  'rif-171': { dLat: -0.0010, dLng: 0.0015 },
  'rif-237': { dLat: 0.0007, dLng: 0.0013 },
  'rif-209': { dLat: -0.0013, dLng: -0.0012 },
  'rif-244': { dLat: -0.0011, dLng: 0.0009 },
  'rif-166': { dLat: 0.0005, dLng: 0.0018 },
  'rif-118': { dLat: -0.0015, dLng: -0.0018 },
  'rif-143': { dLat: -0.0009, dLng: -0.0015 },
  'rif-177': { dLat: 0.0014, dLng: 0.0006 },
  'rif-229': { dLat: 0.0004, dLng: 0.0019 },
  'rif-248': { dLat: 0.0012, dLng: -0.0004 },
  'rif-235': { dLat: 0.0010, dLng: -0.0013 },
  'rif-212': { dLat: 0.0015, dLng: -0.0010 },
  'rif-250': { dLat: -0.0005, dLng: 0.0016 },
} as const satisfies Record<string, { dLat: number; dLng: number }>;

/**
 * Limiti della mappa (maxBounds di Leaflet): Pordenone e comuni della prima
 * cintura, con margine. [sud, ovest] e [nord, est].
 */
export const LIMITI_MAPPA = {
  sudOvest: [45.905, 12.585],
  nordEst: [46.03, 12.765],
} as const satisfies { sudOvest: readonly [number, number]; nordEst: readonly [number, number] };

/** Zoom della mappa del giro (regole d'uso dei tile OSM: tra 12 e 17). */
export const ZOOM_MAPPA = { min: 12, max: 17, iniziale: 13 } as const;

/**
 * Orari dell'agenzia e regole di calendario (brand-strategist 9.2 e 9.3).
 * Li usa core/sabato.ts (scaffold) per il sabato della testata e del giro, e
 * sections/Giro/calcolo.ts per lo sforamento delle 12:30.
 */
export const CALENDARIO = {
  fuso: 'Europe/Rome',
  /** Il sabato l'agenzia chiude alle 12:30: l'ultima visita dovrebbe finire entro quest'ora. */
  chiusuraSabato: '12:30',
  /** Entro venerdì a quest'ora il giro vale per il sabato che viene; dopo, per quello seguente. */
  scadenzaVenerdi: '12:00',
  /** Sara richiama entro venerdì a quest'ora. */
  richiamoVenerdi: '18:00',
  /** Sabati di chiusura d'esempio (data ISO): il giro salta al sabato dopo. */
  sabatiChiusi: ['2026-12-26', '2027-01-02'],
  partenze: ['09:00', '09:30', '10:00'],
} as const;
