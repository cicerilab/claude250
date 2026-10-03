/**
 * SOTTOSCOCCA · il ticker: l'UNICO requestAnimationFrame del concept.
 *
 * Contratto (tech-architect §2.3, motion-designer §11, interaction-designer):
 * stessa API del pilota, senza lenis. Ordine fisso di ogni frame:
 *   1. `runtime.scrollY = window.scrollY` (una sola lettura);
 *   2. fase `read`   → rimisura delle stazioni solo se invalidate (ponte/stazioni.ts);
 *   3. fase `update` → percorso, motore del ponte, proiezione dei punti (GL);
 *   4. fase `write`  → DOM: transform dei punti, variabili sulle foglie data-sscvar, testo dell'asta;
 *   5. fase `render` → WebGL, solo se `runtime.dirty`.
 *
 * Semantica:
 * - `dt` in secondi, limitato a [0, 0.05]; il primo frame dopo un risveglio
 *   riceve 1/60. `now` è il timestamp di rAF (base di performance.now()).
 * - Una fn che restituisce `true` chiede un altro frame. Il ciclo si ferma
 *   quando nessuna fn l'ha chiesto e nessuno ha chiamato `wake()` (o `add()`)
 *   durante il frame.
 * - Aggiungere durante un frame è sicuro: la fn parte dal frame successivo.
 *   Togliere durante un frame è sicuro: la fn non viene più chiamata, neanche
 *   nelle fasi successive dello stesso frame.
 * - Un'eccezione in una fn non ferma il ciclo (in sviluppo va in console).
 * - Scheda nascosta: il ciclo si ferma; tornando visibile riparte (`attiva()`).
 *
 * Nessun accesso al browser a livello di modulo: il primo rAF si chiede alla
 * prima `add`/`wake`, e mai nel prerender (niente `window`).
 */

import { runtime } from '../state/runtime';

export type FaseTicker = 'read' | 'update' | 'write' | 'render';

/**
 * dt: secondi dal frame precedente, limitati a [0, 0.05]; 1/60 al risveglio.
 * now: timestamp del frame in ms (quello di requestAnimationFrame).
 * Ritorno: true = "serve un altro frame"; false/undefined = "posso dormire".
 */
export type TickFn = (dt: number, now: number) => boolean | void;

export interface Ticker {
  /** Registra fn nella fase indicata (default 'update'). Sveglia il ticker. Restituisce la rimozione. */
  add(fn: TickFn, fase?: FaseTicker): () => void;
  /** Chiede almeno un altro frame (input, IO, cambio di stato). */
  wake(): void;
  /** true se il ciclo rAF è attivo. */
  readonly running: boolean;
  /**
   * Collega il ticker alla pagina: pausa con la scheda nascosta, ripresa al
   * ritorno. La chiama Radice.tsx al mount; restituisce lo smontaggio (che
   * ferma anche il ciclo in corso).
   */
  attiva(): () => void;
  /** Ascolta il ritorno da scheda nascosta (il motore del ponte fa `salta`). */
  suRipresa(fn: () => void): () => void;
  /** Numero di fn registrate (diagnostica e test). */
  readonly abbonati: number;
}

export const FASI_TICKER: readonly FaseTicker[] = ['read', 'update', 'write', 'render'];

const DT_MAX = 0.05;
const DT_RISVEGLIO = 1 / 60;

interface Voce {
  readonly fn: TickFn;
  viva: boolean;
  readonly daFrame: number;
}

const elenchi: Record<FaseTicker, Voce[]> = { read: [], update: [], write: [], render: [] };
const ascoltatoriRipresa = new Set<() => void>();

let rafId = 0;
let inCorso = false;
let dentroFrame = false;
let contatoreFrame = 0;
let ultimoNow = 0;
let appenaSvegliato = true;
let richiestaAltroFrame = false;
let collegamenti = 0;
let nascosta = false;

function haFinestra(): boolean {
  return typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';
}

function segnalaErrore(errore: unknown): void {
  if (import.meta.env.DEV) console.error('[sottoscocca/ticker] errore in una fn del ticker', errore);
}

function pianifica(): void {
  if (rafId !== 0 || nascosta || !haFinestra()) return;
  rafId = window.requestAnimationFrame(frame);
  inCorso = true;
}

function eseguiFase(fase: FaseTicker, dt: number, now: number): boolean {
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

  runtime.scrollY = window.scrollY;

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
    ascoltatoriRipresa.forEach((fn) => {
      try {
        fn();
      } catch (errore) {
        segnalaErrore(errore);
      }
    });
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

  suRipresa(fn: () => void): () => void {
    ascoltatoriRipresa.add(fn);
    return () => {
      ascoltatoriRipresa.delete(fn);
    };
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
