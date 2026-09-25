/**
 * IMPRONTA · invio della richiesta dal banco di prova (section-builder-banco).
 *
 * È un concept: l'invio è SIMULATO. Nessuna rete, nessun dato che esce dal
 * browser. `inviaRichiesta` aspetta circa 1,2 s (il tempo in cui la pressa
 * resta giù) e poi risolve, oppure rifiuta se:
 * - l'URL aveva `?invio=ko` (store.simulaErroreInvio, per il collaudo);
 * - il browser dice di essere senza rete (`navigator.onLine === false`), così
 *   la storia di Anna in treno (ux-architect 4.3) si prova davvero.
 *
 * Qui vivono anche le due regole che servono all'invio: il contatto valido
 * (email o telefono italiano) e il giorno della risposta ("domani", oppure
 * "martedì" se si invia da sabato a lunedì: il lunedì la bottega stampa a
 * porta chiusa).
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import type { Carta, Legatura, Prodotto, Quando, Tecnica } from '../../content/prezzi';

/* ------------------------------------------------------------------ contatto */

export type TipoContatto = 'email' | 'telefono';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Solo cifre, dopo aver tolto spazi, punti, trattini, barre e parentesi. */
function cifreTelefono(valore: string): string | null {
  const pulito = valore.replace(/[\s.\-/()]/g, '');
  if (!/^\+?\d+$/.test(pulito)) return null;
  return pulito;
}

/**
 * Telefono italiano: fisso (0…) o cellulare (3…), 6-11 cifre, con o senza
 * prefisso +39 / 0039. Numeri esteri con + e 8-15 cifre sono accettati: chi
 * scrive dall'estero non va respinto.
 */
function eTelefono(valore: string): boolean {
  const c = cifreTelefono(valore);
  if (c === null) return false;
  let n = c;
  if (n.startsWith('+39')) n = n.slice(3);
  else if (n.startsWith('0039')) n = n.slice(4);
  else if (n.startsWith('+')) return n.length >= 9 && n.length <= 16;
  return /^[03]\d{5,10}$/.test(n);
}

/** Tipo del contatto scritto, o null se non è né un'email né un telefono. */
export function tipoContatto(valore: string): TipoContatto | null {
  const v = valore.trim();
  if (v.length === 0) return null;
  if (EMAIL.test(v)) return 'email';
  if (eTelefono(v)) return 'telefono';
  return null;
}

/**
 * Tastiera da proporre, dal primo carattere (ux-architect 5.6): cifra o "+"
 * → tastiera del telefono, altrimenti quella dell'email.
 */
export function tastieraPer(valore: string): 'tel' | 'email' {
  const primo = valore.trimStart().charAt(0);
  return /[\d+]/.test(primo) ? 'tel' : 'email';
}

/* ------------------------------------------------------------------ giorno della risposta */

/**
 * "domani" da martedì a venerdì, "martedì" da sabato a lunedì (copywriter §4,
 * integrazione: il giorno di consegna salta il lunedì). `giornoSettimana` è
 * `Date.getDay()`: 0 domenica … 6 sabato.
 */
export function giornoRisposta(giornoSettimana: number): 'domani' | 'martedì' {
  return giornoSettimana >= 2 && giornoSettimana <= 5 ? 'domani' : 'martedì';
}

/* ------------------------------------------------------------------ invio simulato */

/** Quello che partirebbe davvero (nel concept non parte niente). */
export interface Richiesta {
  readonly prodotto: Prodotto;
  readonly carta: Carta;
  readonly tecnica: Tecnica;
  readonly taglioColorato: boolean;
  readonly tiratura: number;
  readonly legatura: Legatura | null;
  readonly quando: Quando | null;
  readonly righe: readonly string[];
  readonly totale: number;
  readonly contatto: string;
  readonly tipoContatto: TipoContatto;
}

export interface OpzioniInvio {
  /** `?invio=ko`: fallisce sempre. */
  readonly fallisci: boolean;
  /** Per annullare se il banco si smonta a metà. */
  readonly segnale?: AbortSignal;
  /** Durata della simulazione (ms). Default 1200. */
  readonly durata?: number;
}

export const DURATA_INVIO_MS = 1200;

export class ErroreInvio extends Error {
  readonly motivo: 'simulato' | 'offline' | 'annullato';

  constructor(motivo: 'simulato' | 'offline' | 'annullato') {
    super(`invio non riuscito: ${motivo}`);
    this.name = 'ErroreInvio';
    this.motivo = motivo;
  }
}

/**
 * Invio simulato: nessuna rete. Risolve dopo `durata` ms, o rifiuta con
 * `ErroreInvio`. La richiesta resta in memoria solo per il tempo della
 * chiamata: il contatto non viene salvato da nessuna parte.
 */
export function inviaRichiesta(richiesta: Richiesta, opzioni: OpzioniInvio): Promise<void> {
  const durata = Math.max(0, opzioni.durata ?? DURATA_INVIO_MS);
  return new Promise<void>((risolvi, rifiuta) => {
    if (opzioni.segnale?.aborted) {
      rifiuta(new ErroreInvio('annullato'));
      return;
    }
    const senzaRete = typeof navigator !== 'undefined' && navigator.onLine === false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const suAnnulla = (): void => {
      if (timer !== null) clearTimeout(timer);
      rifiuta(new ErroreInvio('annullato'));
    };
    opzioni.segnale?.addEventListener('abort', suAnnulla, { once: true });
    timer = setTimeout(() => {
      timer = null;
      opzioni.segnale?.removeEventListener('abort', suAnnulla);
      // La richiesta non va da nessuna parte: nel concept basta sapere che è completa.
      void richiesta;
      if (opzioni.fallisci) {
        rifiuta(new ErroreInvio('simulato'));
      } else if (senzaRete) {
        rifiuta(new ErroreInvio('offline'));
      } else {
        risolvi();
      }
    }, durata);
  });
}
