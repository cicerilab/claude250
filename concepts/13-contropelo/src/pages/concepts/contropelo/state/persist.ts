/**
 * CONTROPELO · memoria del browser (tech-architect §6.3, ux-architect §1.2).
 *
 * Tutto in try/catch: in navigazione privata, con i cookie bloccati o nel
 * prerender lo storage può mancare o lanciare, e il sito funziona uguale per
 * la sessione, senza avvisi. Nessun accesso al browser a livello di modulo.
 *
 * Chiavi (prefisso `contropelo:`):
 * - `contropelo:pulito`        '1' / '0', scelta esplicita dell'interruttore "Specchio pulito";
 * - `contropelo:prenotazione`  JSON `Prenotazione` (specchio, giorno, ora, servizio, nome, creata):
 *                              MAI il telefono; scartata se il giorno è passato;
 * - `contropelo:bozza`         JSON `{ nome }`, per non riscrivere il nome riaprendo una riga.
 */

export const CHIAVI = {
  pulito: 'contropelo:pulito',
  prenotazione: 'contropelo:prenotazione',
  bozza: 'contropelo:bozza',
} as const;

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Stringa salvata, o null (assente, storage bloccato, prerender). */
export function leggi(chiave: string): string | null {
  try {
    return storage()?.getItem(chiave) ?? null;
  } catch {
    return null;
  }
}

/** Salva una stringa. Restituisce false se non è stato possibile. */
export function scrivi(chiave: string, valore: string): boolean {
  try {
    const s = storage();
    if (s === null) return false;
    s.setItem(chiave, valore);
    return true;
  } catch {
    return false;
  }
}

/** Toglie una chiave (silenzioso se non si può). */
export function rimuovi(chiave: string): void {
  try {
    storage()?.removeItem(chiave);
  } catch {
    // storage bloccato: niente da togliere
  }
}

/** JSON salvato e validato; null se assente, rotto o non valido. */
export function leggiJSON<T>(chiave: string, valida: (v: unknown) => v is T): T | null {
  const grezzo = leggi(chiave);
  if (grezzo === null) return null;
  try {
    const v: unknown = JSON.parse(grezzo);
    return valida(v) ? v : null;
  } catch {
    return null;
  }
}

/** Salva un valore come JSON. */
export function scriviJSON(chiave: string, valore: unknown): boolean {
  try {
    return scrivi(chiave, JSON.stringify(valore));
  } catch {
    return false;
  }
}

/** Svuota tutte le chiavi del concept ("Ricomincia da capo"). */
export function svuotaMemoria(): void {
  rimuovi(CHIAVI.pulito);
  rimuovi(CHIAVI.prenotazione);
  rimuovi(CHIAVI.bozza);
}
