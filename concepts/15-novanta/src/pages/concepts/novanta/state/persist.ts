/**
 * NOVANTA · memoria del browser (localStorage / sessionStorage).
 *
 * Tutto in try/catch: in navigazione privata, con i cookie bloccati o nel
 * prerender lo storage può mancare o lanciare, e il sito deve funzionare
 * uguale (ux-architect §1.3). Nessun accesso al browser a livello di modulo.
 * Copia del pilota (concepts/10-torchio) con le chiavi di NOVANTA.
 *
 * Chiavi (prefisso `novanta:`):
 * - `novanta:vista`         'elenco' se scelta a mano (localStorage); assente = automatico;
 * - `novanta:invito`        '1' dopo l'invito della manopola (sessionStorage:
 *                           decisione dell'orchestratore, chi torna un altro
 *                           giorno ha dimenticato il gesto);
 * - `novanta:prenotazione`  dopo il successo, SOLO le due date e ore
 *                           (`{ prima, controllo }`), mai nome, telefono o
 *                           motivo (localStorage, ux-architect §1.3 e S14).
 */

export type AreaStorage = 'local' | 'session';

export const CHIAVI = {
  vista: 'novanta:vista',
  invito: 'novanta:invito',
  prenotazione: 'novanta:prenotazione',
} as const;

function area(tipo: AreaStorage): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return tipo === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Stringa salvata, o null (assente, storage bloccato, prerender). */
export function leggi(chiave: string, tipo: AreaStorage = 'local'): string | null {
  try {
    return area(tipo)?.getItem(chiave) ?? null;
  } catch {
    return null;
  }
}

/** Salva una stringa. Restituisce false se non è stato possibile. */
export function scrivi(chiave: string, valore: string, tipo: AreaStorage = 'local'): boolean {
  try {
    const s = area(tipo);
    if (s === null) return false;
    s.setItem(chiave, valore);
    return true;
  } catch {
    return false;
  }
}

/** Toglie una chiave (silenzioso se non si può). */
export function rimuovi(chiave: string, tipo: AreaStorage = 'local'): void {
  try {
    area(tipo)?.removeItem(chiave);
  } catch {
    // storage bloccato: niente da togliere
  }
}

/** JSON salvato e validato; null se assente, rotto o non valido. */
export function leggiJSON<T>(chiave: string, valida: (v: unknown) => v is T, tipo: AreaStorage = 'local'): T | null {
  const grezzo = leggi(chiave, tipo);
  if (grezzo === null) return null;
  try {
    const v: unknown = JSON.parse(grezzo);
    return valida(v) ? v : null;
  } catch {
    return null;
  }
}

/** Salva un valore come JSON. */
export function scriviJSON(chiave: string, valore: unknown, tipo: AreaStorage = 'local'): boolean {
  try {
    return scrivi(chiave, JSON.stringify(valore), tipo);
  } catch {
    return false;
  }
}

/**
 * Scrittura rimandata (per valori che cambiano spesso): un solo
 * timer per chiave, l'ultimo valore vince. `svuotaRimandati()` scrive subito
 * quelle in attesa (allo smontaggio e su `pagehide`).
 */
const rimandati = new Map<string, { timer: number; valore: unknown; tipo: AreaStorage }>();

export function scriviJSONRimandato(chiave: string, valore: unknown, ritardo = 300, tipo: AreaStorage = 'local'): void {
  if (typeof window === 'undefined') return;
  const prima = rimandati.get(chiave);
  if (prima !== undefined) window.clearTimeout(prima.timer);
  const timer = window.setTimeout(() => {
    rimandati.delete(chiave);
    scriviJSON(chiave, valore, tipo);
  }, ritardo);
  rimandati.set(chiave, { timer, valore, tipo });
}

/** Annulla una scrittura rimandata (valore appena tolto). */
export function annullaRimandato(chiave: string): void {
  const prima = rimandati.get(chiave);
  if (prima === undefined) return;
  if (typeof window !== 'undefined') window.clearTimeout(prima.timer);
  rimandati.delete(chiave);
}

export function svuotaRimandati(): void {
  for (const [chiave, voce] of rimandati) {
    if (typeof window !== 'undefined') window.clearTimeout(voce.timer);
    scriviJSON(chiave, voce.valore, voce.tipo);
  }
  rimandati.clear();
}
