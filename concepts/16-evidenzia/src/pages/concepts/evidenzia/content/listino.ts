/**
 * EVIDENZIA · listino €/m² per zona (copywriter).
 *
 * Stime DI ESEMPIO dell'agenzia, settembre 2026, verosimili per Pordenone e
 * prima cintura (brand-strategist 7.2). Servono al box "Quanto costa al metro
 * quadro" (solo gli appartamenti) e al confronto con la zona nella scheda
 * della casa (tutti i mercati).
 */

import type { Annuncio, Mercato } from './annunci';
import { ZONE, type ZonaId } from './zone';

/** Appartamenti usati in buono stato, prezzo medio richiesto: la tabella del box. */
export const LISTINO_APPARTAMENTI = [
  { zona: 'centro', nome: 'Pordenone Centro', euroMq: 2150 },
  { zona: 'sanGregorio', nome: 'San Gregorio', euroMq: 1750 },
  { zona: 'torre', nome: 'Torre', euroMq: 1620 },
  { zona: 'rorai', nome: 'Rorai Grande', euroMq: 1420 },
  { zona: 'villanova', nome: 'Villanova', euroMq: 1380 },
  { zona: 'borgomeduna', nome: 'Borgomeduna', euroMq: 1300 },
  { zona: 'porcia', nome: 'Porcia', euroMq: 1450 },
  { zona: 'roveredo', nome: 'Roveredo in Piano', euroMq: 1480 },
  { zona: 'cordenons', nome: 'Cordenons', euroMq: 1320 },
  { zona: 'fiumeVeneto', nome: 'Fiume Veneto', euroMq: 1250 },
] as const satisfies readonly { zona: ZonaId; nome: string; euroMq: number }[];

/**
 * Medie per il confronto in scheda, per mercato e zona. Gli affitti sono in
 * euro al m² AL MESE (con i decimali). Una zona assente = nessun confronto.
 */
export const MEDIE: Record<Mercato, Partial<Record<ZonaId, number>>> = {
  appartamenti: Object.fromEntries(LISTINO_APPARTAMENTI.map((r) => [r.zona, r.euroMq])),
  case: {
    centro: 2000,
    sanGregorio: 1800,
    torre: 1700,
    rorai: 1500,
    villanova: 1450,
    borgomeduna: 1400,
    porcia: 1550,
    roveredo: 1650,
    cordenons: 1450,
    fiumeVeneto: 1400,
  },
  rustici: { porcia: 650, roveredo: 700, cordenons: 600, fiumeVeneto: 550 },
  terreni: { porcia: 85, roveredo: 80, cordenons: 75, fiumeVeneto: 70 },
  affitti: {
    centro: 11.5,
    sanGregorio: 9.2,
    torre: 8.4,
    rorai: 8.0,
    villanova: 7.8,
    borgomeduna: 9.0,
    porcia: 7.5,
    roveredo: 7.4,
    cordenons: 6.8,
    fiumeVeneto: 6.5,
  },
};

export interface Confronto {
  /** Prezzo al m² dell'annuncio (arrotondato: 10 € in vendita, 1 € sotto i 500 €/m², 0,10 € in affitto). */
  annuncioMq: number;
  mediaMq: number;
  affitto: boolean;
  /** Luogo con la preposizione: "in zona Torre" per i quartieri, "a Porcia" per i comuni. */
  dove: string;
  /** Tipo di bene con l'articolo: "degli appartamenti usati", "delle case usate"... */
  cosa: string;
}

const COSA: Record<Mercato, string> = {
  appartamenti: 'degli appartamenti usati',
  case: 'delle case usate',
  rustici: 'dei rustici da ristrutturare',
  terreni: 'dei terreni edificabili',
  affitti: 'degli affitti',
};

/**
 * Dati per la frase "2.050 €/m²: in zona Torre la media è 1.620" della scheda.
 * La frase la scrive testi.ts (SCHEDA.confronto). null per box e zone senza media.
 */
export function confrontoZona(a: Annuncio): Confronto | null {
  if (a.mercato === null || a.mq <= 0) return null;
  const media = MEDIE[a.mercato][a.zona];
  if (media === undefined) return null;
  const grezzo = a.prezzo / a.mq;
  const annuncioMq = a.affitto
    ? Math.round(grezzo * 10) / 10
    : grezzo >= 500
      ? Math.round(grezzo / 10) * 10
      : Math.round(grezzo);
  const zona = ZONE[a.zona];
  const dove = zona.quartiere ? `in zona ${zona.nome}` : `a ${zona.nome}`;
  return { annuncioMq, mediaMq: media, affitto: a.affitto, dove, cosa: COSA[a.mercato] };
}

/** Testi del box "Quanto costa al metro quadro" (i numeri sono in LISTINO_APPARTAMENTI). */
export const LISTINO_BOX = {
  titolo: 'Quanto costa al metro quadro',
  intestazioneZona: 'Zona',
  intestazionePrezzo: '€/m²',
  didascaliaTabella: 'Prezzo medio richiesto al metro quadro per zona, appartamenti usati in buono stato',
  spiegazione: 'Prezzo medio richiesto per appartamenti usati in buono stato.',
  nuovoEVecchio: 'Il nuovo in classe A costa di solito tra 2.400 e 2.800 €/m²; da ristrutturare, tra 800 e 1.100.',
  dichiarazione: 'Stime di esempio dell’agenzia, aggiornate a settembre 2026.',
} as const;
