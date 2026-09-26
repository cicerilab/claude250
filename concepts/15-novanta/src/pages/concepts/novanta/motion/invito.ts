/**
 * NOVANTA · l'invito della manopola (motion-designer).
 *
 * Creative-director §4.7: "alla prima visita, la manopola fa un solo piccolo
 * invito di 6° avanti e indietro dopo 3 s di inattività, una volta sola, e mai
 * con reduced motion". È l'unico movimento che non parte da un gesto: per
 * questo ha tutte le condizioni in un posto solo.
 *
 * Non usa rAF né tiene sveglio il ticker mentre aspetta (frame a riposo = 0):
 * un solo `setTimeout`, riarmato se nel frattempo c'è stato input. Quando
 * scade e tutto è in regola chiama `rotore.accenna()`, che muove il braccio
 * nel ticker come ogni altro viaggio. Qualsiasi gesto durante l'invito lo
 * interrompe da solo (il rotore passa al trascinamento o al nuovo viaggio).
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { INVITO } from './choreography';
import type { Rotore, StatoRotazione } from './rotore';

export interface OpzioniInvito {
  /** Il rotore del braccio. */
  rotore: Pick<Rotore, 'accenna'>;
  /** runtime.braccio: l'invito parte solo a braccio fermo. */
  stato: Pick<StatoRotazione, 'stato'>;
  /** runtime.ultimoInput (0 = mai). */
  ultimoInput: () => number;
  /**
   * Le condizioni del momento, lette alla scadenza. useBraccio passa:
   * vista quadrante, `!store.reducedMotion`, `!store.invitoFatto`,
   * `store.attivo === 0`, nessun hash d'arrivo diverso da #gradi-0.
   * Se è falsa alla scadenza l'invito non si ripropone più in questo mount.
   */
  consentito: () => boolean;
  /** Invito eseguito: `store.segnaInvito()` (memoria di sessione). */
  onFatto: () => void;
  /** Default INVITO.attesa (3000 ms). */
  attesa?: number;
  /** Default INVITO.ampiezza (6°). */
  ampiezza?: number;
  /** Orologio in ms. Default `performance.now()`. */
  ora?: () => number;
}

/**
 * Arma l'invito. Restituisce la funzione di pulizia (da chiamare allo
 * smontaggio o quando la vista passa a elenco).
 */
export function avviaInvito(o: OpzioniInvito): () => void {
  const attesa = o.attesa ?? INVITO.attesa;
  const ora = o.ora ?? ((): number => performance.now());
  const avvio = ora();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let chiuso = false;

  const arma = (ms: number): void => {
    if (chiuso) return;
    timer = setTimeout(controlla, Math.max(50, ms));
  };

  function controlla(): void {
    timer = null;
    if (chiuso) return;
    const adesso = ora();
    const quiete = adesso - Math.max(avvio, o.ultimoInput());
    if (quiete < attesa) {
      arma(attesa - quiete);
      return;
    }
    // Scheda nascosta o braccio in viaggio: si riprova tra un'attesa intera.
    const nascosta = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    if (nascosta || o.stato.stato !== 'fermo') {
      arma(attesa);
      return;
    }
    chiuso = true;
    if (!o.consentito()) return;
    if (o.rotore.accenna(o.ampiezza ?? INVITO.ampiezza)) o.onFatto();
  }

  arma(attesa);

  return () => {
    chiuso = true;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
}
