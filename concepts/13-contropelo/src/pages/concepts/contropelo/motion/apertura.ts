/**
 * CONTROPELO · l'apertura: il vapore sale e la mano passa (motion-designer).
 *
 * Sequenza (creative-director §6.3, ux §5.1), tempi in tempi.ts `APERTURA`:
 *   t = 0          specchio pulito: riflesso e listino leggibili (nessun preloader);
 *   t ≥ 500 ms     (e font pronti, al massimo 2,5 s) il vapore sale dal basso
 *                  e copre il vetro in 2400 ms (curva `sale`, banda morbida);
 *   + 700 ms       una sola passata automatica, come col palmo, pulisce una
 *                  striscia sopra il prezzo del taglio (700 ms, raggio 60 px;
 *                  su vetri stretti orizzontale, raggio 44 px);
 *   + 0            sulla mensola compare il suggerimento del gesto
 *                  (`onSuggerimento(true)`), che sparisce al primo gesto.
 *
 * Non parte (o si ferma) se: riduzione del movimento, modo del vapore non
 * "vivo" (interruttore "Specchio pulito"), canvas spento, una riga di
 * scrittura aperta, pannello Informazioni aperto, layout "scorre", scheda
 * nascosta all'inizio (parte quando torna visibile, se le condizioni
 * reggono ancora). Se l'utente pulisce prima della passata, la passata è
 * annullata (ha già imparato il gesto); la salita continua per conto suo
 * nel motore, che non ricopre mai ciò che l'utente ha pulito.
 *
 * `setTimeout` qui non anima nulla: rimanda un comando al motore (che
 * anima nel ticker). Nessun accesso al browser a livello di modulo: tutto
 * nasce in `avviaApertura`, chiamata da un effetto di `Contropelo.tsx`.
 */

import { vapore } from '../vapore';
import { store, type ContropeloState, type IndiceSpecchio } from '../state/store';
import { fontsReady } from '../core/fonts';
import { APERTURA, INIZIO_PASSATA } from './tempi';

export interface Punto01 {
  readonly x: number;
  readonly y: number;
}

export interface OpzioniApertura {
  /** Lo specchio su cui fare l'apertura (di solito quello attivo all'avvio). */
  indice: IndiceSpecchio;
  /** L'elemento del vetro (per misurare larghezza e bersaglio). */
  vetro: HTMLElement;
  /**
   * L'elemento sopra cui passa il palmo: la riga del taglio nel listino
   * (`[data-ctp-bersaglio-passata]`). Se manca, la passata usa un
   * tracciato di default.
   */
  bersaglio?: HTMLElement | null;
  /** Chiamata con true quando il suggerimento del gesto deve comparire, false quando deve sparire. */
  onSuggerimento?: (visibile: boolean) => void;
  /** Chiamata quando la sequenza è finita o è stata annullata (per diagnostica e QA). */
  onFine?: (esito: EsitoApertura) => void;
}

export type EsitoApertura = 'completata' | 'saltata' | 'interrotta' | 'passata-annullata';

/** Tracciato di default della passata, in coordinate 0..1 del vetro. */
export const PASSATA_DEFAULT = {
  largo: { da: { x: 0.1, y: 0.44 }, a: { x: 0.62, y: 0.3 } },
  stretto: { da: { x: 0.06, y: 0.36 }, a: { x: 0.94, y: 0.36 } },
} as const;

/** Le condizioni sotto cui l'apertura ha senso. Pura. */
export function aperturaPossibile(s: ContropeloState): boolean {
  return (
    s.pronto &&
    s.motion === 'full' &&
    s.canvas === 'on' &&
    !s.pulito &&
    s.layout === 'fisso' &&
    s.scrittura === null &&
    !s.info
  );
}

/** Il canvas non ha ancora deciso: si può aspettare. Pura. */
function inAttesaDelCanvas(s: ContropeloState): boolean {
  return s.canvas === 'pending' && s.motion === 'full' && !s.pulito && s.layout === 'fisso';
}

/**
 * Calcola il tracciato della passata dal bersaglio (in 0..1 del vetro):
 * attraversa la riga del prezzo da sinistra a destra, leggermente in
 * diagonale sui vetri larghi (la mano scende un poco), orizzontale su
 * quelli stretti. Il raggio è quello del palmo.
 */
export function tracciatoPassata(vetro: DOMRect, bersaglio: DOMRect | null): { da: Punto01; a: Punto01; raggio: number } {
  const stretto = vetro.width < APERTURA.larghezzaStretta;
  const raggio = stretto ? APERTURA.raggioPassataStretto : APERTURA.raggioPassata;
  if (bersaglio === null || vetro.width <= 0 || vetro.height <= 0) {
    const d = stretto ? PASSATA_DEFAULT.stretto : PASSATA_DEFAULT.largo;
    return { da: d.da, a: d.a, raggio };
  }
  const cy = (bersaglio.top + bersaglio.height / 2 - vetro.top) / vetro.height;
  const x0 = Math.max(0.02, (bersaglio.left - vetro.left - raggio) / vetro.width);
  const x1 = Math.min(0.98, (bersaglio.right - vetro.left + raggio) / vetro.width);
  const pendenza = stretto ? 0 : 0.05;
  const da: Punto01 = { x: limita(x0), y: limita(cy + pendenza / 2) };
  const a: Punto01 = { x: limita(x1), y: limita(cy - pendenza / 2) };
  return { da, a, raggio };
}

function limita(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Avvia la sequenza d'apertura. Restituisce la funzione che la interrompe
 * (smontaggio, cambio di specchio prima dell'inizio, cambio di condizioni).
 * Idempotente: una sola apertura per montaggio.
 */
export function avviaApertura(opzioni: OpzioniApertura): () => void {
  const { indice, vetro, onSuggerimento, onFine } = opzioni;
  const partenza = performance.now();
  let fermata = false;
  let avviata = false;
  let finita = false;
  const timer: ReturnType<typeof setTimeout>[] = [];
  let staccaStore: (() => void) | null = null;
  let staccaGesto: (() => void) | null = null;
  let staccaVisibilita: (() => void) | null = null;

  const pulisci = (): void => {
    for (const t of timer) clearTimeout(t);
    timer.length = 0;
    if (staccaStore !== null) staccaStore();
    staccaStore = null;
    if (staccaGesto !== null) staccaGesto();
    staccaGesto = null;
    if (staccaVisibilita !== null) staccaVisibilita();
    staccaVisibilita = null;
  };

  const concludi = (esito: EsitoApertura): void => {
    if (finita) return;
    finita = true;
    pulisci();
    if (onFine !== undefined) onFine(esito);
  };

  const dopo = (ms: number, fn: () => void): void => {
    const t = setTimeout(() => {
      if (fermata || finita) return;
      fn();
    }, Math.max(0, ms));
    timer.push(t);
  };

  const sequenza = (): void => {
    if (avviata || fermata || finita) return;
    const s = store.get();
    if (!aperturaPossibile(s) || s.specchio !== indice) {
      concludi('saltata');
      return;
    }
    avviata = true;

    // 1. Il vapore sale dal basso.
    vapore.alza(indice, APERTURA.sale);

    // Se l'utente pulisce prima della passata, la passata è annullata.
    let passataAnnullata = false;
    staccaGesto = vapore.onPrimoGesto(() => {
      passataAnnullata = true;
      if (onSuggerimento !== undefined) onSuggerimento(false);
    });

    // Se le condizioni cambiano (interruttore, riga aperta, Informazioni,
    // cambio specchio), la passata non parte.
    staccaStore = store.subscribe(() => {
      const st = store.get();
      if (!aperturaPossibile(st) || st.specchio !== indice) {
        concludi('interrotta');
      }
    });

    // 2. Il suggerimento compare quando il vapore è salito.
    dopo(APERTURA.sale, () => {
      if (!passataAnnullata && onSuggerimento !== undefined) onSuggerimento(true);
    });

    // 3. La passata, dopo la pausa.
    dopo(INIZIO_PASSATA, () => {
      if (passataAnnullata) {
        concludi('passata-annullata');
        return;
      }
      const rettVetro = vetro.getBoundingClientRect();
      const b = opzioni.bersaglio ?? null;
      const rettBersaglio = b !== null ? b.getBoundingClientRect() : null;
      const { da, a, raggio } = tracciatoPassata(rettVetro, rettBersaglio);
      vapore.passata(indice, da, a, raggio, APERTURA.passata);
      dopo(APERTURA.passata, () => concludi('completata'));
    });
  };

  const attesaMinima = (): Promise<void> =>
    new Promise((risolvi) => {
      const rimasto = APERTURA.attesaMinima - (performance.now() - partenza);
      const t = setTimeout(() => risolvi(), Math.max(0, rimasto));
      timer.push(t);
    });

  const attesaFont = (): Promise<void> =>
    new Promise((risolvi) => {
      let fatto = false;
      const ok = (): void => {
        if (fatto) return;
        fatto = true;
        risolvi();
      };
      const t = setTimeout(ok, APERTURA.attesaFontMassima);
      timer.push(t);
      fontsReady().then(ok, ok);
    });

  /** Aspetta che il canvas decida (on/off), al massimo `attesaCanvasMassima`. */
  const attesaCanvas = (): Promise<void> =>
    new Promise((risolvi) => {
      if (!inAttesaDelCanvas(store.get())) {
        risolvi();
        return;
      }
      let fatto = false;
      let stacca: (() => void) | null = null;
      const ok = (): void => {
        if (fatto) return;
        fatto = true;
        if (stacca !== null) stacca();
        risolvi();
      };
      const t = setTimeout(ok, APERTURA.attesaCanvasMassima);
      timer.push(t);
      stacca = store.subscribe(() => {
        if (!inAttesaDelCanvas(store.get())) ok();
      });
    });

  /** Se la scheda è nascosta, l'apertura aspetta che torni visibile. */
  const attesaVisibile = (): Promise<void> =>
    new Promise((risolvi) => {
      if (typeof document === 'undefined' || document.visibilityState !== 'hidden') {
        risolvi();
        return;
      }
      const suCambio = (): void => {
        if (document.visibilityState === 'hidden') return;
        document.removeEventListener('visibilitychange', suCambio);
        staccaVisibilita = null;
        risolvi();
      };
      document.addEventListener('visibilitychange', suCambio);
      staccaVisibilita = () => document.removeEventListener('visibilitychange', suCambio);
    });

  Promise.all([attesaMinima(), attesaFont(), attesaCanvas()])
    .then(attesaVisibile)
    .then(() => {
      if (fermata || finita) return;
      sequenza();
    });

  return () => {
    if (fermata) return;
    fermata = true;
    if (!finita) concludi(avviata ? 'interrotta' : 'saltata');
  };
}
