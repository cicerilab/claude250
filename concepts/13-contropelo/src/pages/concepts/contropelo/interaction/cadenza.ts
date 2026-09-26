/**
 * CONTROPELO · cadenza anti-lampeggio.
 *
 * Limite del Lab (docs/ruoli-agent.md, interaction-designer): qualsiasi
 * cambio di colore di grandi superfici al massimo **1 ogni 500 ms**.
 * Nel concept le grandi superfici che cambiano per un comando sono:
 * - il pan della parete (o la dissolvenza da 200 ms in riduzione del
 *   movimento) quando si cambia specchio: tab, frecce, bordo, swipe, link;
 * - l'interruttore "Specchio pulito" (il vapore sparisce o torna su tutto il
 *   vetro);
 * - lo straccio della lista (cambio giorno o fascia) e il cambio di faccia
 *   su mobile (del motion-designer, che può usare `creaCadenza`).
 *
 * `creaCadenza(ms)` esegue subito se è passato abbastanza tempo dall'ultimo
 * cambio; altrimenti tiene **solo l'ultima** richiesta e la esegue appena il
 * limite lo consente. Tocchi a raffica non si sommano mai: l'ultimo vince.
 *
 * `setTimeout` qui non anima nulla: rimanda un comando. Nessun accesso al
 * browser a livello di modulo.
 */

import { store, vaiASpecchio, type IndiceSpecchio } from '../state/store';

export const INTERVALLO_CAMBI_MS = 500;

export type OrigineSpecchio = 'tab' | 'bordo' | 'swipe' | 'tastiera' | 'link';

export interface Cadenza {
  /** Esegue `fn` subito o appena possibile; una richiesta in attesa viene sostituita. */
  chiedi(fn: () => void): void;
  /** Cancella la richiesta in attesa (smontaggio). */
  ferma(): void;
  /** true se c'è una richiesta in attesa. */
  readonly inAttesa: boolean;
}

export function creaCadenza(intervallo: number = INTERVALLO_CAMBI_MS): Cadenza {
  let ultimo = Number.NEGATIVE_INFINITY;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let attesa: (() => void) | null = null;

  const esegui = (fn: () => void): void => {
    ultimo = performance.now();
    fn();
  };

  return {
    chiedi(fn: () => void): void {
      const ora = performance.now();
      if (timer === null && ora - ultimo >= intervallo) {
        esegui(fn);
        return;
      }
      attesa = fn;
      if (timer !== null) return;
      timer = setTimeout(
        () => {
          timer = null;
          const daFare = attesa;
          attesa = null;
          if (daFare !== null) esegui(daFare);
        },
        Math.max(0, ultimo + intervallo - ora),
      );
    },
    ferma(): void {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      attesa = null;
    },
    get inAttesa(): boolean {
      return attesa !== null;
    },
  };
}

/* ---------------------------------------------------------------------- */
/* Cambio di specchio: un solo limitatore per tutte le origini            */
/* ---------------------------------------------------------------------- */

let cadenzaSpecchio: Cadenza | null = null;
let bersaglio: IndiceSpecchio | null = null;

function cadenza(): Cadenza {
  if (cadenzaSpecchio === null) cadenzaSpecchio = creaCadenza(INTERVALLO_CAMBI_MS);
  return cadenzaSpecchio;
}

/**
 * Chiede di girare la testa verso lo specchio `i`. Da usare al posto di
 * `vaiASpecchio` in tutti i comandi dell'utente (tab, frecce, bordo del
 * vicino, swipe sulla mensola, link "pieno"). Rispetta il limite di un cambio
 * ogni 500 ms e tiene solo l'ultima destinazione chiesta.
 */
export function chiediSpecchio(i: IndiceSpecchio, origine: OrigineSpecchio): void {
  const c = cadenza();
  if (!c.inAttesa && store.get().specchio === i) return;
  bersaglio = i;
  c.chiedi(() => {
    bersaglio = null;
    if (store.get().specchio !== i) vaiASpecchio(i, origine);
  });
}

/**
 * Lo specchio verso cui si sta andando: quello in attesa, se c'è, altrimenti
 * quello attivo. Serve a chi calcola "il prossimo a destra" durante una
 * raffica (swipe ripetuti).
 */
export function specchioDestinazione(): IndiceSpecchio {
  return bersaglio ?? store.get().specchio;
}

/** Smontaggio: nessun cambio rimandato deve partire a concept smontato. */
export function fermaCadenze(): void {
  cadenzaSpecchio?.ferma();
  cadenzaSpecchio = null;
  bersaglio = null;
}

/** Porta un numero qualsiasi dentro 0..2. */
export function indiceValido(n: number): IndiceSpecchio {
  const r = Math.round(n);
  if (!(r > 0)) return 0;
  return r >= 2 ? 2 : 1;
}
