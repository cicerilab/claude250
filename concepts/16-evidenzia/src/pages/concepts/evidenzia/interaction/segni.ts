/**
 * EVIDENZIA · canale tra il gesto e il tratto (interaction-designer).
 *
 * `useEvidenziatore` (il gesto) e `tratto/Tratto.tsx` (il disegno) non si
 * conoscono: si parlano qui. Il gesto scrive i valori caldi in
 * `runtime.tratti` (avanzamento, bersaglio, riga, gesto) e manda eventi
 * discreti su questo canale; il tratto li ascolta e lancia le animazioni del
 * motion-designer. Tutto è per id di annuncio.
 *
 * Valori aggiuntivi che non stanno in `runtime.tratti` (tech-architect §6.2):
 * - `inizio`: frazione 0..1 del punto in cui la punta si è posata (il tratto
 *   parte dal punto premuto, CD 4.4);
 * - `ripasso`: 0..1, quanto il gesto di ripasso ha coperto la riga (per
 *   scolorire un poco il tratto mentre lo si toglie);
 * - `attesa`: il cambio di store che il gesto sta per provocare, così il
 *   tratto non lo anima una seconda volta come se venisse da un bottone.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import type { IdAnnuncio } from '../state/store';

/** Che cosa sta facendo la punta. */
export type ModoTratto = 'segna' | 'ripasso' | 'scarico';

export type EventoTratto =
  /** il gesto è partito (dopo la soglia): il tratto segue il runtime da ora */
  | { readonly tipo: 'inizio'; readonly modo: ModoTratto }
  /** rilascio oltre il 55%: il tratto si completa da `da` fino a fine riga (160 ms) */
  | {
      readonly tipo: 'completa';
      readonly da: number;
      /** velocità della mano al rilascio, frazioni di riga al secondo (per lo slancio di motion/tratto.ts) */
      readonly velocita?: number;
    }
  /** rilascio sotto il 55% o gesto annullato: il tratto torna al punto di partenza (200 ms) */
  | { readonly tipo: 'ritira'; readonly da: number; readonly a: number }
  /** ripasso oltre il 55%: il rosa si scolora (250 ms) */
  | { readonly tipo: 'toglie' }
  /** ripasso annullato: il tratto torna pieno */
  | { readonly tipo: 'ripristina' }
  /** quinto annuncio: evidenziatore scarico, pallido, a metà, poi si ritira */
  | { readonly tipo: 'scarico' }
  /** il gesto è finito, qualunque sia l'esito: il tratto smette di leggere il runtime */
  | { readonly tipo: 'fine' };

export type Ascoltatore = (evento: EventoTratto) => void;

const ascoltatori = new Map<IdAnnuncio, Set<Ascoltatore>>();
const inizi = new Map<IdAnnuncio, number>();
const ripassi = new Map<IdAnnuncio, number>();
const attese = new Map<IdAnnuncio, 'aggiunta' | 'rimozione'>();
const modi = new Map<IdAnnuncio, ModoTratto>();

/** L'annuncio su cui è in corso un gesto (uno solo alla volta), o null. */
let gestoCorrente: IdAnnuncio | null = null;

export const segni = {
  ascolta(id: IdAnnuncio, fn: Ascoltatore): () => void {
    let insieme = ascoltatori.get(id);
    if (insieme === undefined) {
      insieme = new Set();
      ascoltatori.set(id, insieme);
    }
    insieme.add(fn);
    return () => {
      const s = ascoltatori.get(id);
      if (s === undefined) return;
      s.delete(fn);
      if (s.size === 0) ascoltatori.delete(id);
    };
  },

  emetti(id: IdAnnuncio, evento: EventoTratto): void {
    if (evento.tipo === 'inizio') {
      modi.set(id, evento.modo);
      gestoCorrente = id;
    }
    const s = ascoltatori.get(id);
    if (s !== undefined) {
      for (const fn of [...s]) fn(evento);
    }
    if (evento.tipo === 'fine') {
      modi.delete(id);
      ripassi.delete(id);
      if (gestoCorrente === id) gestoCorrente = null;
    }
  },

  /** Punto di partenza del tratto, 0..1 sulla lunghezza di tutte le righe. */
  inizio(id: IdAnnuncio): number {
    return inizi.get(id) ?? 0;
  },
  impostaInizio(id: IdAnnuncio, valore: number): void {
    inizi.set(id, valore);
  },

  ripasso(id: IdAnnuncio): number {
    return ripassi.get(id) ?? 0;
  },
  impostaRipasso(id: IdAnnuncio, valore: number): void {
    ripassi.set(id, valore);
  },

  modo(id: IdAnnuncio): ModoTratto | null {
    return modi.get(id) ?? null;
  },

  /** Il gesto annuncia che sta per cambiare lo store: il tratto non rifarà l'animazione. */
  attendi(id: IdAnnuncio, cambio: 'aggiunta' | 'rimozione'): void {
    attese.set(id, cambio);
  },
  /** Il tratto consuma l'attesa: true se il cambio era già stato animato dal gesto. */
  consumaAttesa(id: IdAnnuncio, cambio: 'aggiunta' | 'rimozione'): boolean {
    if (attese.get(id) !== cambio) {
      attese.delete(id);
      return false;
    }
    attese.delete(id);
    return true;
  },
  /** Il cambio annunciato non è avvenuto (es. store pieno): si dimentica l'attesa. */
  annullaAttesa(id: IdAnnuncio): void {
    attese.delete(id);
  },

  get gestoCorrente(): IdAnnuncio | null {
    return gestoCorrente;
  },

  /** Smontaggio del concept (Evidenzia.tsx): azzera tutto. */
  azzera(): void {
    ascoltatori.clear();
    inizi.clear();
    ripassi.clear();
    attese.clear();
    modi.clear();
    gestoCorrente = null;
  },
};
