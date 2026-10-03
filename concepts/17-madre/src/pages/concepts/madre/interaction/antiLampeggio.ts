/**
 * MADRE · limite anti-lampeggio (interaction-designer §6).
 *
 * Regola del Lab: una grande superficie cambia colore al massimo UNA volta
 * ogni 500 ms, qualunque cosa faccia l'utente (tocchi ripetuti su un gettone,
 * scroll avanti e indietro sul confine tra due banchi, tasto tenuto).
 *
 * Come funziona: il primo cambio passa subito; i cambi chiesti prima che
 * siano passati 500 ms dall'ultimo applicato aspettano la scadenza e, se nel
 * frattempo ne arrivano altri, vince l'ultimo. Se il valore chiesto torna a
 * essere quello già mostrato, l'attesa si annulla: nessun cambio.
 *
 * Chi lo usa:
 * - `useBersaglio` (usePrendiPosa.ts): i giorni che diventano carta da
 *   zucchero quando un pane è in mano;
 * - Testata, Madre.tsx, Foglio: il colore del bottone "Il pane fisso" e il
 *   fondo che cambia col banco attivo (vedi "Richieste" nel doc).
 *
 * Nessun accesso al browser a livello di modulo (prerender).
 */

import { useEffect, useRef, useState } from 'react';

/** Intervallo minimo tra due cambi di colore di una grande superficie. */
export const INTERVALLO_ANTI_LAMPEGGIO_MS = 500;

export interface ValoreLento<T> {
  /** Chiede di mostrare `valore`: subito se si può, altrimenti alla scadenza (vince l'ultimo). */
  chiedi(valore: T): void;
  /** Il valore applicato in questo momento. */
  readonly attuale: T;
  /** Annulla un'eventuale attesa (smontaggio). Il limitatore resta usabile. */
  chiudi(): void;
}

export interface OpzioniValoreLento<T> {
  /** Intervallo minimo in ms (default 500). */
  ms?: number;
  /** Uguaglianza tra due valori (default Object.is). */
  uguale?: (a: T, b: T) => boolean;
  /** Orologio (default performance.now), sostituibile nei test. */
  ora?: () => number;
}

export function creaValoreLento<T>(
  iniziale: T,
  applica: (valore: T) => void,
  opzioni: OpzioniValoreLento<T> = {},
): ValoreLento<T> {
  const ms = opzioni.ms ?? INTERVALLO_ANTI_LAMPEGGIO_MS;
  const uguale = opzioni.uguale ?? Object.is;
  const ora = opzioni.ora ?? (() => performance.now());

  let attuale = iniziale;
  let ultimoCambio = Number.NEGATIVE_INFINITY;
  let inAttesa: { valore: T } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function annullaTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function applicaOra(valore: T): void {
    attuale = valore;
    ultimoCambio = ora();
    applica(valore);
  }

  function scadenza(): void {
    timer = null;
    const richiesta = inAttesa;
    inAttesa = null;
    if (richiesta === null || uguale(richiesta.valore, attuale)) return;
    const mancano = ultimoCambio + ms - ora();
    if (mancano > 1) {
      // Il timer è partito un filo prima (arrotondamenti): si riprova.
      inAttesa = richiesta;
      timer = setTimeout(scadenza, mancano);
      return;
    }
    applicaOra(richiesta.valore);
  }

  return {
    chiedi(valore: T): void {
      if (uguale(valore, attuale)) {
        // Torna a quello che si vede già: nessun cambio in coda.
        inAttesa = null;
        annullaTimer();
        return;
      }
      const passati = ora() - ultimoCambio;
      if (passati >= ms && timer === null) {
        inAttesa = null;
        applicaOra(valore);
        return;
      }
      inAttesa = { valore };
      if (timer === null) timer = setTimeout(scadenza, Math.max(0, ms - passati));
    },
    get attuale(): T {
      return attuale;
    },
    chiudi(): void {
      inAttesa = null;
      annullaTimer();
    },
  };
}

/**
 * Versione React: restituisce `valore` con al massimo un cambio ogni `ms`.
 * Da usare per tutto ciò che decide il colore di una grande superficie
 * (fondo di un banco, scomparti della settimana, bottone in testata).
 */
export function useValoreLento<T>(
  valore: T,
  ms: number = INTERVALLO_ANTI_LAMPEGGIO_MS,
  uguale: (a: T, b: T) => boolean = Object.is,
): T {
  const [mostrato, setMostrato] = useState<T>(valore);
  const limitatore = useRef<ValoreLento<T> | null>(null);
  if (limitatore.current === null) {
    // Creazione pura: nessun timer finché non si chiama chiedi() in un effetto.
    limitatore.current = creaValoreLento<T>(valore, (v) => setMostrato(() => v), { ms, uguale });
  }

  useEffect(() => {
    limitatore.current?.chiedi(valore);
  }, [valore]);

  useEffect(() => {
    const l = limitatore.current;
    return () => {
      l?.chiudi();
    };
  }, []);

  return mostrato;
}
