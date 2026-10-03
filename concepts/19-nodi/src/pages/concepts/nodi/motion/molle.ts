/**
 * NODI · inseguimenti normalizzati sul dt del ticker.
 *
 * Niente molle che rimbalzano: sulla tavola nulla sovraelonga. Qui c'è solo
 * l'inseguimento esponenziale (lerp normalizzato su dt), identico a 30, 60 o
 * 120 Hz: dopo `tau` secondi resta il 37% della distanza, dopo 3 tau il 5%.
 *
 * Usi (tech-architect §2.2 e §6.2):
 * - il cursore del righello che segue la frequenza (in posizione di scala,
 *   così può scendere fino al fermo "spento" che non ha un valore in Hz);
 * - il riquadro mobile 54svh → 34svh, che segue `palcoDaPercorso` senza
 *   scatti quando un salto di scroll (righello, indice) lo sposta di colpo;
 * - il mix dei cuscinetti e ogni valore "di avvicinamento".
 *
 * Con reduced motion ogni inseguimento salta al valore finale.
 * Modulo puro: nessun accesso a window/document.
 */

import { HZ_MAX, HZ_MIN, U_SPENTO, hzDaU, uDaHz } from './percorso';

/** dt oltre il quale il frame è una pausa (scheda tornata visibile): si salta. */
export const DT_PAUSA = 0.25;

/** Costanti di tempo (s). */
export const TAU = {
  /** Cursore del righello quando la frequenza viene dallo scroll. */
  cursore: 0.12,
  /** Cursore mentre lo si trascina: deve stare sotto il dito. */
  cursoreTrascinato: 0.035,
  /** Riquadro mobile: assorbe i salti di scroll senza ritardare lo scroll lento. */
  palco: 0.09,
  /** Avvicinamenti generici (valori di stato che non hanno una durata propria). */
  morbido: 0.2,
} as const;

/** Fattore di avvicinamento per un passo `dt` con costante di tempo `tau`. */
export function fattore(dt: number, tau: number): number {
  if (!(dt > 0)) return 0;
  if (!(tau > 0) || dt >= DT_PAUSA) return 1;
  return 1 - Math.exp(-dt / tau);
}

/**
 * Un passo di inseguimento. Sotto `soglia` si ferma esattamente
 * sull'obiettivo (così il ticker può dormire).
 */
export function insegui(attuale: number, obiettivo: number, dt: number, tau: number, soglia = 1e-4): number {
  if (Math.abs(obiettivo - attuale) <= soglia) return obiettivo;
  const v = attuale + (obiettivo - attuale) * fattore(dt, tau);
  return Math.abs(obiettivo - v) <= soglia ? obiettivo : v;
}

/** Stato mutabile di un inseguimento (nessuna allocazione per frame). */
export interface Inseguitore {
  valore: number;
  obiettivo: number;
}

export function creaInseguitore(iniziale: number): Inseguitore {
  return { valore: iniziale, obiettivo: iniziale };
}

/**
 * Avanza l'inseguitore. Restituisce true se si è mosso (il chiamante segna
 * `dirty` / tiene sveglio il ticker), false se era già fermo.
 */
export function avanza(s: Inseguitore, dt: number, tau: number, ridotto: boolean, soglia = 1e-4): boolean {
  const prima = s.valore;
  s.valore = ridotto ? s.obiettivo : insegui(s.valore, s.obiettivo, dt, tau, soglia);
  return s.valore !== prima;
}

/* ------------------------------------------------------------------ */
/* Cursore del righello                                                */
/* ------------------------------------------------------------------ */

/**
 * Il cursore insegue in **posizione di scala** u (0 = 60 Hz, 1 = 420 Hz,
 * U_SPENTO = fermo "spento" 40 px sotto il 60): così va e torna dallo
 * spento con lo stesso movimento, e in scala logaritmica la velocità
 * percepita è uguale in basso e in alto.
 */
export interface CursoreRighello {
  /** Posizione mostrata, U_SPENTO..1. La usa il builder del righello per il transform. */
  u: number;
  /** Hz mostrati (interi), null = "spento". La usa per il testo "168 Hz". */
  hz: number | null;
}

export function creaCursoreRighello(): CursoreRighello {
  return { u: U_SPENTO, hz: null };
}

/** Soglia di quiete in u: circa 0,04 px su un righello di 734 px. */
const SOGLIA_U = 5e-5;

/**
 * Un passo del cursore verso `obiettivoHz` (runtime.hz.valore, null =
 * spento). Restituisce true se posizione o valore mostrato sono cambiati.
 *
 * - trascinando: tau corto, il cursore resta sotto il dito;
 * - ridotto (reduced motion): salto immediato (tech §9.3);
 * - il valore mostrato è l'intero della posizione, e diventa `null` solo
 *   quando il cursore è arrivato al fermo (non c'è un "12 Hz" di passaggio:
 *   sotto 60 Hz il righello non ha valori).
 */
export function avanzaCursoreRighello(
  c: CursoreRighello,
  obiettivoHz: number | null,
  dt: number,
  opz: { readonly trascinando: boolean; readonly ridotto: boolean },
): boolean {
  const obiettivo = uDaHz(obiettivoHz);
  const primaU = c.u;
  const primaHz = c.hz;
  if (opz.ridotto) {
    c.u = obiettivo;
  } else {
    const tau = opz.trascinando ? TAU.cursoreTrascinato : TAU.cursore;
    c.u = insegui(c.u, obiettivo, dt, tau, SOGLIA_U);
  }
  if (obiettivoHz === null && c.u <= 0) {
    c.hz = c.u === obiettivo ? null : HZ_MIN;
  } else {
    const hz = hzDaU(Math.max(0, c.u));
    c.hz = hz === null ? HZ_MIN : Math.round(Math.min(HZ_MAX, Math.max(HZ_MIN, hz)));
    if (c.u === obiettivo && obiettivoHz !== null) c.hz = Math.round(obiettivoHz);
  }
  return c.u !== primaU || c.hz !== primaHz;
}

/** Porta il cursore subito su una frequenza (montaggio, ritorno da pausa). */
export function saltaCursoreRighello(c: CursoreRighello, hz: number | null): void {
  c.u = uDaHz(hz);
  c.hz = hz === null ? null : Math.round(hz);
}
