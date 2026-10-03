/**
 * EVIDENZIA · memoria del browser (localStorage).
 *
 * Tutto in try/catch: in navigazione privata, con i cookie bloccati o nel
 * prerender lo storage può mancare o lanciare, e il concept deve funzionare
 * uguale nella sessione (ux-architect §1). Nessun accesso al browser a
 * livello di modulo.
 *
 * Una sola chiave, decisa dall'orchestratore: `evidenzia:giro` (il giro:
 * annunci segnati, ordine, partenza, da dove, sabato scelto, mandato).
 * MAI nome, telefono, email o nota.
 */

export const CHIAVI = {
  giro: 'evidenzia:giro',
} as const;

function area(): Storage | null {
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
    return area()?.getItem(chiave) ?? null;
  } catch {
    return null;
  }
}

/** Salva una stringa. Restituisce false se non è stato possibile. */
export function scrivi(chiave: string, valore: string): boolean {
  try {
    const s = area();
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
    area()?.removeItem(chiave);
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
