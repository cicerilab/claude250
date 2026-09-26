/**
 * NOVANTA · attività dell'utente e cadenza dei cambi (interaction-designer).
 *
 * - `segnaInput()`: aggiorna `runtime.ultimoInput`. Lo chiamano trascina.ts e
 *   rotella.ts a ogni gesto vero; lo legge motion/invito.ts per l'invito di
 *   6° dopo 3 s di quiete (creative-director §4.7).
 * - `ascoltaAttivita(bersaglio)`: ascoltatori passivi in cattura su tutta la
 *   radice (dito, tasti, rotella), così anche scrivere nel modulo o scorrere il
 *   listino conta come attività. Lo monta Novanta.tsx.
 * - `creaCadenza()`: limite anti-lampeggio. Un cambio che accende o spegne una
 *   grande superficie (foto a filo del bordo, anello gesso della prenotazione,
 *   fascia a 90° su mobile) non può avvenire più di una volta ogni 500 ms,
 *   anche se il braccio attraversa tre angoli in un lancio o in tre scatti di
 *   rotella. Il valore intermedio si salta, l'ultimo arriva sempre.
 *
 * Nessun accesso a window/document a livello di modulo: tutto dentro funzioni.
 */

import { runtime } from '../state/runtime';

/** Intervallo minimo tra due cambi di grandi superfici (regola anti-lampeggio). */
export const CADENZA_MIN_MS = 500;

/** Aggiorna l'istante dell'ultimo input dell'utente. */
export function segnaInput(): void {
  runtime.ultimoInput = performance.now();
}

/** Millisecondi trascorsi dall'ultimo input (Infinity se non c'è mai stato). */
export function inattivoDa(now: number = performance.now()): number {
  if (!runtime.ultimoInput) return Number.POSITIVE_INFINITY;
  return Math.max(0, now - runtime.ultimoInput);
}

const EVENTI_ATTIVITA = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input'] as const;

/**
 * Segna come attività qualunque gesto dentro `bersaglio` (di solito `.nov-root`).
 * Ascoltatori passivi in fase di cattura: non bloccano niente e arrivano prima
 * di quelli delle sezioni. Restituisce la funzione di pulizia.
 */
export function ascoltaAttivita(bersaglio: EventTarget): () => void {
  const opzioni: AddEventListenerOptions = { capture: true, passive: true };
  const gestisci = (): void => segnaInput();
  for (const tipo of EVENTI_ATTIVITA) bersaglio.addEventListener(tipo, gestisci, opzioni);
  return () => {
    for (const tipo of EVENTI_ATTIVITA) bersaglio.removeEventListener(tipo, gestisci, opzioni);
  };
}

export interface OpzioniCadenza<T> {
  /** Millisecondi minimi tra due applicazioni. Default CADENZA_MIN_MS. */
  intervallo?: number;
  /** Applica davvero il valore (es. `store.impostaAttivo`). */
  applica: (valore: T) => void;
  /** Uguaglianza tra valori. Default `Object.is`. */
  uguale?: (a: T, b: T) => boolean;
}

export interface Cadenza<T> {
  /**
   * Propone un valore. Se dall'ultimo cambio è passato abbastanza tempo lo
   * applica subito; altrimenti lo tiene in attesa e applica l'ultimo proposto
   * appena scade l'intervallo (i valori intermedi si perdono di proposito).
   */
  proponi(valore: T): void;
  /** Applica subito, senza attesa (montaggio, frammento all'arrivo, vista elenco). */
  subito(valore: T): void;
  /** Cancella il valore in attesa e il timer (smontaggio). */
  annulla(): void;
}

export function creaCadenza<T>(o: OpzioniCadenza<T>): Cadenza<T> {
  const intervallo = o.intervallo ?? CADENZA_MIN_MS;
  const uguale = o.uguale ?? ((a: T, b: T) => Object.is(a, b));
  let applicato: { v: T } | null = null;
  let inAttesa: { v: T } | null = null;
  let ultimoCambio = Number.NEGATIVE_INFINITY;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const fermaTimer = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const esegui = (v: T, now: number): void => {
    inAttesa = null;
    if (applicato && uguale(applicato.v, v)) return;
    applicato = { v };
    ultimoCambio = now;
    o.applica(v);
  };

  const scade = (): void => {
    timer = null;
    if (inAttesa) esegui(inAttesa.v, performance.now());
  };

  return {
    proponi(valore: T): void {
      const now = performance.now();
      if (applicato && uguale(applicato.v, valore) && !inAttesa) return;
      const trascorso = now - ultimoCambio;
      if (trascorso >= intervallo && timer === null) {
        esegui(valore, now);
        return;
      }
      if (applicato && uguale(applicato.v, valore)) {
        // Si è tornati al valore già in vista: niente da cambiare.
        inAttesa = null;
        fermaTimer();
        return;
      }
      inAttesa = { v: valore };
      if (timer === null) timer = setTimeout(scade, Math.max(0, intervallo - trascorso));
    },
    subito(valore: T): void {
      fermaTimer();
      esegui(valore, performance.now());
    },
    annulla(): void {
      fermaTimer();
      inAttesa = null;
    },
  };
}
