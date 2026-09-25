/**
 * IMPRONTA · il ticker: l'UNICO requestAnimationFrame del concept.
 *
 * Contratto (docs/motion-designer.md §4.1, interaction-designer §11.1,
 * tech-architect §2.3). Ordine fisso di ogni frame:
 *   1. `lenis.raf(now)` (se lenis esiste);
 *   2. `runtime.scrollY` aggiornato (lenis.animatedScroll o window.scrollY);
 *   3. fase `read`   → letture di layout (solo i blocchi "live" del registro);
 *   4. fase `update` → molle, curve, luce, progressi di scroll, onda;
 *   5. fase `write`  → variabili CSS e attributi sul DOM;
 *   6. fase `render` → WebGL, solo se qualcosa è sporco.
 *
 * Semantica:
 * - `dt` in secondi, limitato a [0, 0.05]; il primo frame dopo un risveglio
 *   riceve 1/60. `now` è il timestamp di rAF (base di performance.now()).
 * - Una fn che restituisce `true` chiede un altro frame. Il ciclo si ferma
 *   quando nessuna fn l'ha chiesto, nessuno ha chiamato `wake()` durante il
 *   frame e lenis non sta scorrendo.
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

import { runtime } from '../state/runtime';
import { getLenis } from './lenis';

export type FaseTicker = 'read' | 'update' | 'write' | 'render';

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
   * quando torna visibile. La chiama Impronta.tsx al mount; restituisce la
   * funzione di smontaggio (che ferma anche il ciclo in corso).
   */
  attiva(): () => void;
  /** Numero di fn registrate (diagnostica e test). */
  readonly abbonati: number;
}

export const FASI_TICKER: readonly FaseTicker[] = ['read', 'update', 'write', 'render'];

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

const elenchi: ElenchiFasi = { read: [], update: [], write: [], render: [] };

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
    console.error('[impronta/ticker] errore in una fn del ticker', errore);
  }
}

function pianifica(): void {
  if (rafId !== 0 || nascosta || !haFinestra()) return;
  rafId = window.requestAnimationFrame(frame);
  inCorso = true;
}

function aggiornaScroll(): boolean {
  const lenis = getLenis();
  if (lenis !== null) {
    runtime.scrollY = lenis.animatedScroll;
    return lenis.isScrolling !== false;
  }
  runtime.scrollY = window.scrollY;
  return false;
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

  const lenis = getLenis();
  if (lenis !== null) {
    try {
      lenis.raf(now);
    } catch (errore) {
      segnalaErrore(errore);
    }
  }
  if (aggiornaScroll()) ancora = true;

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
