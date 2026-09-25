/**
 * IMPRONTA · onda di cambio carta.
 *
 * Toccare una carta la stende su tutto il sito: il nuovo colore si propaga dal
 * punto toccato come carta che assorbe (creative-director 4.2 sezione 4,
 * ux-architect 5.4). Tempi, curve, bordo bagnato e istante di scambio sono
 * del motion-designer (motion/choreography.ts, CARTA.onda e statoOnda):
 * qui c'è solo il meccanismo.
 *
 * Come funziona (movimento pieno, 700 ms):
 * 1. `store.cartaWave = { x, y, from, to, t0 }`: se il WebGL è acceso lo
 *    shader disegna l'onda leggendo `getPaperWave(now)` (uniform uWave);
 * 2. se il WebGL NON è acceso (`data-gl="pending|off"`), un velo DOM
 *    `.imp-ix-onda` al livello del canvas (sotto l'inchiostro) mostra la
 *    carta nuova DENTRO un cerchio dal bordo sfumato che cresce;
 * 3. a `CARTA.onda.scambio` (45%) si chiama `scegliCarta(to)`: la radice passa
 *    alla carta nuova, l'inchiostro cambia colore in 240 ms, e il velo si
 *    inverte: ora mostra la carta VECCHIA fuori dal cerchio, che continua a
 *    crescere fino a coprire tutto;
 * 4. a onda finita `cartaWave = null` e il velo si toglie.
 *
 * Reduced motion: il cambio è immediato (`scegliCarta` subito). Il velo con la
 * carta vecchia svanisce in 200 ms di dissolvenza lineare, senza movimento.
 *
 * Nessun lampo: un solo cambio di colore per punto dello schermo, mai
 * ripetuto. Nessun accesso a window/document a livello di modulo.
 */

import { ticker } from '../core/ticker';
import { CARTA, raggioFinaleOnda, statoOnda } from '../motion/choreography';
import { runtime } from '../state/runtime';
import { scegliCarta, store } from '../state/store';
import type { Carta } from '../state/store';

/* ------------------------------------------------------------------ costanti */

export const PAPER_WAVE_MS = CARTA.onda.durata;
export const PAPER_WAVE_REDUCED_MS = CARTA.onda.dissolvenza;

/* ------------------------------------------------------------------ tipi */

export interface Punto {
  x: number;
  y: number;
}

/**
 * Un fotogramma dell'onda, in px CSS del viewport (lo shader moltiplica per
 * il DPR). Con `invertita` la radice è già sulla carta `to`.
 */
export interface PaperWaveFrame {
  x: number;
  y: number;
  raggio: number;
  raggioMax: number;
  /** Larghezza del bordo bagnato (px). */
  bordo: number;
  /** 0..1 lineare nel tempo. */
  progresso: number;
  invertita: boolean;
  from: Carta;
  to: Carta;
}

interface EventoConPunto {
  clientX: number;
  clientY: number;
  detail: number;
  currentTarget: EventTarget | null;
}

interface OndaAttiva {
  from: Carta;
  to: Carta;
  ridotta: boolean;
  velo: HTMLElement | null;
  scambiata: boolean;
  togliTick: () => void;
  risolvi: () => void;
}

let onda: OndaAttiva | null = null;

/* ------------------------------------------------------------------ geometria */

function limita(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function dimensioniViewport(): { w: number; h: number } {
  const finestra = typeof window !== 'undefined';
  const w = runtime.viewport.w > 0 ? runtime.viewport.w : finestra ? window.innerWidth : 0;
  const h = runtime.viewport.h > 0 ? runtime.viewport.h : finestra ? window.innerHeight : 0;
  return { w, h };
}

/** Centro di un elemento in coordinate viewport (scelta da tastiera). */
export function puntoDaElemento(el: Element): Punto {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Punto d'origine da un evento di clic/tocco. Se il clic arriva da tastiera
 * (detail 0) o senza coordinate, usa il centro dell'elemento (ux-architect:
 * "da centro striscia se scelto da tastiera").
 */
export function origineDaEvento(e: EventoConPunto): Punto {
  const daTastiera = e.detail === 0 || (e.clientX === 0 && e.clientY === 0);
  if (!daTastiera) return { x: e.clientX, y: e.clientY };
  if (e.currentTarget instanceof Element) return puntoDaElemento(e.currentTarget);
  const { w, h } = dimensioniViewport();
  return { x: w / 2, y: h / 2 };
}

/**
 * Stato dell'onda a un istante (`performance.now()`), per lo shader-engineer:
 * uWave = (x, y, raggio, bordo) × dpr, più indici di `from` e `to`.
 * null se nessuna onda è in corso.
 */
export function getPaperWave(now: number): PaperWaveFrame | null {
  const w = store.get().cartaWave;
  if (!w) return null;
  const { w: vw, h: vh } = dimensioniViewport();
  const g = { x: w.x, y: w.y, w: vw, h: vh };
  const s = statoOnda(now - w.t0, g, false);
  return {
    x: w.x,
    y: w.y,
    raggio: s.raggio,
    raggioMax: raggioFinaleOnda(g),
    bordo: s.bordo,
    progresso: s.progresso,
    invertita: s.invertita,
    from: w.from,
    to: w.to,
  };
}

/* ------------------------------------------------------------------ velo DOM */

function creaVelo(root: HTMLElement, carta: Carta, x: number, y: number, ridotta: boolean): HTMLElement {
  const velo = document.createElement('div');
  velo.className = ridotta ? 'imp-ix-onda imp-ix-onda--dissolvenza' : 'imp-ix-onda';
  velo.setAttribute('aria-hidden', 'true');
  velo.dataset.carta = carta;
  velo.style.setProperty('--imp-onda-x', `${x.toFixed(1)}px`);
  velo.style.setProperty('--imp-onda-y', `${y.toFixed(1)}px`);
  velo.style.setProperty('--imp-onda-r', '0px');
  velo.style.setProperty('--imp-onda-bordo', `${CARTA.onda.bordoDa}px`);
  velo.style.setProperty('--imp-onda-o', '1');
  root.appendChild(velo);
  return velo;
}

function chiudi(o: OndaAttiva): void {
  o.togliTick();
  o.velo?.remove();
  o.velo = null;
  if (onda === o) onda = null;
}

/* ------------------------------------------------------------------ API */

/**
 * Chiude subito l'onda in corso (se c'è): la carta di destinazione diventa
 * quella del sito. La chiama Impronta.tsx allo smontaggio, e startPaperWave
 * quando arriva un nuovo cambio prima della fine del precedente.
 */
export function concludiPaperWave(): void {
  const o = onda;
  if (!o) return;
  if (!o.scambiata) {
    o.scambiata = true;
    scegliCarta(o.to);
  }
  if (store.get().cartaWave) store.set({ cartaWave: null });
  runtime.markDirty();
  o.risolvi();
  chiudi(o);
}

export interface OpzioniOnda {
  /** `.imp-root`. Se assente si cerca nel documento. */
  root?: HTMLElement | null;
}

/**
 * Cambia la carta del sito con l'onda che parte da (x, y), in px CSS del
 * viewport (clientX/clientY). La Promise si risolve quando l'onda è finita
 * (la carta nello store è cambiata già allo scambio, o subito con reduced motion).
 */
export function startPaperWave(x: number, y: number, carta: Carta, opzioni: OpzioniOnda = {}): Promise<void> {
  if (typeof window === 'undefined') {
    scegliCarta(carta);
    return Promise.resolve();
  }

  concludiPaperWave();

  const s = store.get();
  if (s.carta === carta) return Promise.resolve();

  const ridotta = s.reducedMotion;
  const root = opzioni.root ?? document.querySelector<HTMLElement>('.imp-root');
  const { w, h } = dimensioniViewport();
  const cx = limita(x, 0, w);
  const cy = limita(y, 0, h);
  const g = { x: cx, y: cy, w, h };
  const t0 = performance.now();
  const from = s.carta;

  // Il velo DOM serve se il WebGL non disegna la carta, e sempre per la
  // dissolvenza ridotta (che il GL non fa: lì la carta cambia di colpo sotto al velo).
  const serveVelo = !!root && (ridotta || s.gl !== 'on');
  // Nel caso ridotto il velo porta la carta VECCHIA; altrimenti quella nuova (fino allo scambio).
  const velo = serveVelo && root ? creaVelo(root, ridotta ? from : carta, cx, cy, ridotta) : null;

  if (ridotta) {
    scegliCarta(carta);
  } else {
    store.set({ cartaWave: { x: cx, y: cy, from, to: carta, t0 } });
  }
  runtime.markDirty();

  return new Promise<void>((risolvi) => {
    const o: OndaAttiva = {
      from,
      to: carta,
      ridotta,
      velo,
      scambiata: ridotta,
      togliTick: () => undefined,
      risolvi,
    };

    const passo = (_dt: number, now: number): boolean => {
      if (onda !== o) return false;
      const st = statoOnda(now - t0, g, o.ridotta);
      runtime.markDirty();

      if (!o.scambiata && st.invertita) {
        o.scambiata = true;
        scegliCarta(o.to);
        if (o.velo) {
          o.velo.dataset.carta = o.from;
          o.velo.classList.add('imp-ix-onda--invertita');
        }
      }

      if (o.velo) {
        o.velo.style.setProperty('--imp-onda-r', `${st.raggio.toFixed(1)}px`);
        o.velo.style.setProperty('--imp-onda-bordo', `${st.bordo.toFixed(1)}px`);
        o.velo.style.setProperty('--imp-onda-o', st.opacita.toFixed(3));
      }

      if (st.finita) {
        if (!o.ridotta) store.set({ cartaWave: null });
        o.risolvi();
        chiudi(o);
        return false;
      }
      return true;
    };

    onda = o;
    o.togliTick = ticker.add(passo, 'write');
    ticker.wake();
  });
}

/**
 * Comodità per le sezioni: origine da evento, da elemento o centro schermo.
 *   onClick={(e) => cambiaCarta('cotone', origineDaEvento(e))}
 *   cambiaCarta('grafite', strisciaEl)   // scelta da tastiera: centro della striscia
 */
export function cambiaCarta(carta: Carta, origine?: Punto | Element | null, opzioni: OpzioniOnda = {}): Promise<void> {
  if (typeof window === 'undefined') {
    scegliCarta(carta);
    return Promise.resolve();
  }
  let p: Punto;
  if (origine instanceof Element) {
    p = puntoDaElemento(origine);
  } else if (origine) {
    p = origine;
  } else {
    const { w, h } = dimensioniViewport();
    p = { x: w / 2, y: h / 2 };
  }
  return startPaperWave(p.x, p.y, carta, opzioni);
}
