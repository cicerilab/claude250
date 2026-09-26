/**
 * NOVANTA · il ticker: l'UNICO requestAnimationFrame del concept
 * (tech-architect §6.3). Stessa API del pilota, con due sole fasi:
 *   1. fase `update` → rotori (braccio, anello), molle;
 *   2. fase `write`  → `--nov-deg`, path della clipPath delle tacche,
 *      `textContent` dei gradi (useBraccio.ts, useAnello.ts).
 * Niente lenis, niente scroll: il quadrante ruota, la pagina non scorre.
 *
 * Semantica:
 * - `dt` in secondi, limitato a [0, 0.05]; il primo frame dopo un risveglio
 *   riceve 1/60. `now` è il timestamp di rAF (base di performance.now()).
 * - Una fn che restituisce `true` chiede un altro frame. Il ciclo si ferma
 *   quando nessuna fn l'ha chiesto e nessuno ha chiamato `wake()` durante il
 *   frame: a riposo, zero frame.
 * - Aggiungere durante un frame è sicuro: la fn parte dal frame successivo.
 *   Togliere durante un frame è sicuro: la fn non viene più chiamata, neanche
 *   nelle fasi successive dello stesso frame.
 * - `add()` sveglia sempre il ticker.
 * - Un'eccezione in una fn non ferma il ciclo (in sviluppo va in console).
 * - Scheda nascosta: il ciclo si ferma; tornando visibile riparte (`attiva()`).
 *
 * Nessun accesso al browser a livello di modulo: il primo rAF si chiede alla
 * prima `add`/`wake`, e mai durante il prerender (niente `window`).
 */

export type FaseTicker = 'update' | 'write';

/**
 * dt: secondi dal frame precedente, limitati a [0, 0.05]; il primo frame dopo
 *     un risveglio riceve 1/60.
 * now: timestamp del frame in ms (quello passato da requestAnimationFrame,
 *     stessa base di performance.now()).
 * Ritorno: true = "mi sto ancora muovendo, serve un altro frame".
 *     false o undefined = "per me si può dormire".
 */
export type TickFn = (dt: number, now: number) => boolean | void;

export interface Ticker {
  /** Registra fn nella fase indicata (default 'update'). Sveglia il ticker. Restituisce la funzione di rimozione. */
  add(fn: TickFn, fase?: FaseTicker): () => void;
  /** Chiede almeno un altro frame (input, IO, cambio di stato). */
  wake(): void;
  /** true se il ciclo rAF è attivo. */
  readonly running: boolean;
  /**
   * Collega il ticker alla pagina: pausa con la scheda nascosta, ripresa
   * quando torna visibile. La chiama Novanta.tsx al mount; restituisce la
   * funzione di smontaggio (che ferma anche il ciclo in corso).
   */
  attiva(): () => void;
  /** Numero di fn registrate (diagnostica e test). */
  readonly abbonati: number;
}

export const FASI_TICKER: readonly FaseTicker[] = ['update', 'write'];

const DT_MAX = 0.05;
const DT_RISVEGLIO = 1 / 60;

interface Voce {
  readonly fn: TickFn;
  /** false dopo la rimozione: la voce viene saltata anche nel frame in corso. */
  viva: boolean;
  /** Primo frame (contatore) in cui la voce può essere chiamata. */
  readonly daFrame: number;
}

type ElenchiFasi = Record<FaseTicker, Voce[]>;

const elenchi: ElenchiFasi = { update: [], write: [] };

let rafId = 0;
let inCorso = false;
let dentroFrame = false;
let contatoreFrame = 0;
let ultimoNow = 0;
let appenaSvegliato = true;
/** wake() chiamato (o add) dopo l'inizio del frame corrente. */
let richiestaAltroFrame = false;
let collegamenti = 0;
let nascosta = false;

function haFinestra(): boolean {
  return typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';
}

function segnalaErrore(errore: unknown): void {
  if (import.meta.env.DEV) {
    console.error('[novanta/ticker] errore in una fn del ticker', errore);
  }
}

function pianifica(): void {
  if (rafId !== 0 || nascosta || !haFinestra()) return;
  rafId = window.requestAnimationFrame(frame);
  inCorso = true;
}

function eseguiFase(fase: FaseTicker, dt: number, now: number): boolean {
  // Istantanea: le aggiunte durante il frame finiscono in un array nuovo
  // (vedi add/rimuovi), quindi questo ciclo non le vede.
  const voci = elenchi[fase];
  let ancora = false;
  for (let i = 0; i < voci.length; i += 1) {
    const voce = voci[i];
    if (voce === undefined || !voce.viva || voce.daFrame > contatoreFrame) continue;
    try {
      if (voce.fn(dt, now) === true) ancora = true;
    } catch (errore) {
      segnalaErrore(errore);
    }
  }
  return ancora;
}

function frame(now: number): void {
  rafId = 0;
  if (nascosta) {
    inCorso = false;
    appenaSvegliato = true;
    return;
  }

  const dt = appenaSvegliato ? DT_RISVEGLIO : Math.min(DT_MAX, Math.max(0, (now - ultimoNow) / 1000));
  appenaSvegliato = false;
  ultimoNow = now;
  contatoreFrame += 1;
  richiestaAltroFrame = false;
  dentroFrame = true;

  let ancora = false;

  for (const fase of FASI_TICKER) {
    if (eseguiFase(fase, dt, now)) ancora = true;
  }

  dentroFrame = false;

  if (ancora || richiestaAltroFrame) {
    pianifica();
  } else {
    inCorso = false;
    appenaSvegliato = true;
  }
}

function rimuovi(fase: FaseTicker, voce: Voce): void {
  if (!voce.viva) return;
  voce.viva = false;
  // Array nuovo: un eventuale ciclo in corso continua sulla sua istantanea
  // e salta la voce grazie a `viva = false`.
  elenchi[fase] = elenchi[fase].filter((v) => v !== voce);
}

function wake(): void {
  if (dentroFrame) {
    richiestaAltroFrame = true;
    return;
  }
  pianifica();
}

function suVisibilita(): void {
  nascosta = document.visibilityState === 'hidden';
  if (nascosta) {
    if (rafId !== 0 && haFinestra()) window.cancelAnimationFrame(rafId);
    rafId = 0;
    inCorso = false;
    appenaSvegliato = true;
  } else {
    appenaSvegliato = true;
    wake();
  }
}

export const ticker: Ticker = {
  add(fn: TickFn, fase: FaseTicker = 'update'): () => void {
    const voce: Voce = { fn, viva: true, daFrame: dentroFrame ? contatoreFrame + 1 : contatoreFrame };
    elenchi[fase] = [...elenchi[fase], voce];
    wake();
    return () => {
      rimuovi(fase, voce);
    };
  },

  wake,

  get running(): boolean {
    return inCorso;
  },

  get abbonati(): number {
    return FASI_TICKER.reduce((n, f) => n + elenchi[f].length, 0);
  },

  attiva(): () => void {
    if (typeof document === 'undefined') return () => undefined;
    collegamenti += 1;
    if (collegamenti === 1) {
      nascosta = document.visibilityState === 'hidden';
      document.addEventListener('visibilitychange', suVisibilita);
    }
    appenaSvegliato = true;
    wake();
    let staccato = false;
    return () => {
      if (staccato) return;
      staccato = true;
      collegamenti -= 1;
      if (collegamenti > 0) return;
      document.removeEventListener('visibilitychange', suVisibilita);
      if (rafId !== 0 && haFinestra()) window.cancelAnimationFrame(rafId);
      rafId = 0;
      inCorso = false;
      nascosta = false;
      appenaSvegliato = true;
    };
  },
};
