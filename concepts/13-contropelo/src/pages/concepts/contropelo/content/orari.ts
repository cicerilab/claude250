/**
 * CONTROPELO · orari di esempio (copywriter).
 *
 * Fonte unica degli orari (tech-architect §6.4): le mezz'ore della lista
 * (sections/Lista/agenda.ts), i giorni prenotabili (core/date.ts) e le righe
 * scritte sul vetro dello specchio 3 "Dove e quando" leggono da qui.
 *
 * Mezz'ore che ne escono (brand-strategist §8.1):
 * - martedì-venerdì: 8:30 ... 12:00 (8 righe), riga "12:30-14:30 pranzo",
 *   14:30 ... 18:30 (9 righe). L'ultima mezz'ora inizia 30 minuti prima della
 *   chiusura di ogni intervallo.
 * - sabato: 8:00 ... 16:30 (18 righe), orario continuato, nessuna riga pranzo.
 * - domenica e lunedì: chiuso.
 *
 * Solo dati. Orari in 'HH:MM' a 24 ore, con lo zero davanti (come `Slot.ora`
 * di state/store.ts); per mostrarli si usa `oraVisibile()` di content/testi.ts.
 */

import { PASSO_MINUTI } from './prezzi';

/** 0 = domenica ... 6 = sabato, come `Date.prototype.getDay()`. */
export type GiornoSettimana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Un intervallo di apertura: [inizio, fine). La fine è l'ora di chiusura. */
export type Intervallo = readonly [string, string];

export const ORARI = {
  /** Minuti di una riga della lista. */
  passo: PASSO_MINUTI,
  /** Intervalli di apertura per giorno; `null` = chiuso. */
  settimana: {
    0: null,
    1: null,
    2: [['08:30', '12:30'], ['14:30', '19:00']],
    3: [['08:30', '12:30'], ['14:30', '19:00']],
    4: [['08:30', '12:30'], ['14:30', '19:00']],
    5: [['08:30', '12:30'], ['14:30', '19:00']],
    6: [['08:00', '17:00']],
  },
  /**
   * Tra due intervalli dello stesso giorno la lista scrive UNA riga di pausa
   * (vedi `LISTA.pranzo` in testi.ts). La chiave dice quale testo usare.
   */
  pausa: { etichetta: 'pranzo' },
  /**
   * Divisione della giornata in due fasce (mobile, CD §10): la fascia
   * "pomeriggio" comincia dalla prima mezz'ora uguale o successiva a questa ora.
   * Martedì-venerdì: mattina 8:30-12:00 (8 righe), pomeriggio 14:30-18:30 (9).
   * Sabato: mattina 8:00-12:00 (9 righe), pomeriggio 12:30-16:30 (9).
   */
  inizioPomeriggio: '12:30',
} as const satisfies {
  passo: number;
  settimana: Record<GiornoSettimana, readonly Intervallo[] | null>;
  pausa: { etichetta: string };
  inizioPomeriggio: string;
};

/** Giorni in cui il salone è chiuso, per i controlli rapidi. */
export const GIORNI_CHIUSI = [0, 1] as const satisfies readonly GiornoSettimana[];

/**
 * Le tre righe "parlate" degli orari sul vetro dello specchio 3
 * (trend-researcher P6): scritte a pennarello, trattino corto per gli
 * intervalli, niente tabella di sette giorni. Devono dire la stessa cosa di
 * ORARI.settimana: chi cambia l'uno cambia l'altro.
 * `sr` è la versione per il lettore di schermo (senza trattini tra i numeri).
 */
export const ORARI_VETRO = [
  {
    giorni: 'martedì-venerdì',
    ore: '8:30-12:30 e 14:30-19',
    sr: 'Da martedì a venerdì, dalle 8:30 alle 12:30 e dalle 14:30 alle 19.',
  },
  {
    giorni: 'sabato',
    ore: '8-17, senza pausa',
    sr: 'Sabato dalle 8 alle 17, senza pausa.',
  },
  {
    giorni: 'domenica e lunedì',
    ore: 'chiuso',
    sr: 'Domenica e lunedì chiuso.',
  },
] as const;
