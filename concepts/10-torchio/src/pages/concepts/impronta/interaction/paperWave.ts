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
 * Giro 2: al massimo un cambio ogni 450 ms (coda con l'ultima richiesta), e
 * il bordo del foglio nuovo avanza con la sua costa visibile.
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

let onda: OndaAttivaDom | null = null;

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

/*
 * Struttura del velo (al livello del canvas, sotto l'inchiostro):
 *   div.imp-ix-onda                       variabili --imp-onda-*
 *     div.imp-ix-onda__foglio[data-carta] la carta (solo se il GL non la disegna)
 *     div.imp-ix-onda__costa[data-carta]  il bordo del foglio nuovo che avanza:
 *                                         costa tinta + ombra corta sul vecchio
 * La costa c'è anche col WebGL acceso (giro 2, giuria §5): è il fotogramma
 * che si ricorda, un foglio vero che scorre sopra l'altro.
 */
interface Velo {
  el: HTMLElement;
  foglio: HTMLElement | null;
  costa: HTMLElement | null;
}

function creaVelo(
  root: HTMLElement,
  x: number,
  y: number,
  opz: { foglio: Carta | null; costa: Carta | null; ridotta: boolean },
): Velo {
  const el = document.createElement('div');
  el.className = opz.ridotta ? 'imp-ix-onda imp-ix-onda--dissolvenza' : 'imp-ix-onda';
  el.setAttribute('aria-hidden', 'true');
  el.style.setProperty('--imp-onda-x', `${x.toFixed(1)}px`);
  el.style.setProperty('--imp-onda-y', `${y.toFixed(1)}px`);
  el.style.setProperty('--imp-onda-r', '0px');
  el.style.setProperty('--imp-onda-bordo', `${CARTA.onda.bordoDa}px`);
  el.style.setProperty('--imp-onda-o', '1');
  let foglio: HTMLElement | null = null;
  let costa: HTMLElement | null = null;
  if (opz.foglio) {
    foglio = document.createElement('div');
    foglio.className = 'imp-ix-onda__foglio';
    foglio.dataset.carta = opz.foglio;
    el.appendChild(foglio);
  }
  if (opz.costa) {
    costa = document.createElement('div');
    costa.className = 'imp-ix-onda__costa';
    costa.dataset.carta = opz.costa;
    el.appendChild(costa);
  }
  root.appendChild(el);
  return { el, foglio, costa };
}

interface OndaAttivaDom extends OndaAttiva {
  veloDom: Velo | null;
}

function chiudi(o: OndaAttivaDom): void {
  o.togliTick();
  o.veloDom?.el.remove();
  o.veloDom = null;
  o.velo = null;
  if (onda === o) onda = null;
}

/* ------------------------------------------------------------------ limite di frequenza */

/**
 * Giro 2 (accessibilità A4, WCAG 2.3.1): una freccia tenuta sui radio delle
 * carte chiede un cambio a ogni ripetizione del tasto (fino a ~30 al secondo).
 * Si applica al massimo un cambio ogni INTERVALLO_MINIMO_MS; le richieste nel
 * frattempo si accodano e resta solo l'ultima. Vale anche con reduced motion.
 * 450 ms → al massimo 2,2 cambi di colore al secondo.
 */
export const INTERVALLO_MINIMO_MS = 450;

interface Richiesta {
  x: number;
  y: number;
  carta: Carta;
  opzioni: OpzioniOnda;
}

let ultimoAvvio = Number.NEGATIVE_INFINITY;
let inCoda: Richiesta | null = null;
let timerCoda: number | null = null;
let attesiCoda: Array<() => void> = [];

function svuotaCoda(): void {
  timerCoda = null;
  const r = inCoda;
  inCoda = null;
  const attesi = attesiCoda;
  attesiCoda = [];
  if (!r) {
    attesi.forEach((fn) => fn());
    return;
  }
  void avviaOnda(r.x, r.y, r.carta, r.opzioni).then(() => attesi.forEach((fn) => fn()));
}

/* ------------------------------------------------------------------ API */

/**
 * Chiude subito l'onda in corso (se c'è): la carta di destinazione diventa
 * quella del sito. La chiama Impronta.tsx allo smontaggio, e l'avvio di una
 * nuova onda quando la precedente non è finita. Svuota anche la coda.
 */
export function concludiPaperWave(): void {
  if (timerCoda !== null) {
    window.clearTimeout(timerCoda);
    timerCoda = null;
  }
  inCoda = null;
  const attesi = attesiCoda;
  attesiCoda = [];
  chiudiOndaCorrente();
  attesi.forEach((fn) => fn());
}

function chiudiOndaCorrente(): void {
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
 * (la carta nello store è cambiata già allo scambio, o subito con reduced
 * motion). Se arriva prima di INTERVALLO_MINIMO_MS dall'ultimo avvio, la
 * richiesta va in coda (resta solo l'ultima) e la Promise si risolve quando
 * parte e finisce quella.
 */
export function startPaperWave(x: number, y: number, carta: Carta, opzioni: OpzioniOnda = {}): Promise<void> {
  if (typeof window === 'undefined') {
    scegliCarta(carta);
    return Promise.resolve();
  }
  const ora = performance.now();
  const attesa = INTERVALLO_MINIMO_MS - (ora - ultimoAvvio);
  if (attesa > 0 || timerCoda !== null) {
    inCoda = { x, y, carta, opzioni };
    if (timerCoda === null) timerCoda = window.setTimeout(svuotaCoda, Math.max(0, attesa));
    return new Promise<void>((risolvi) => {
      attesiCoda.push(risolvi);
    });
  }
  return avviaOnda(x, y, carta, opzioni);
}

function avviaOnda(x: number, y: number, carta: Carta, opzioni: OpzioniOnda): Promise<void> {
  chiudiOndaCorrente();

  const s = store.get();
  if (s.carta === carta) return Promise.resolve();
  ultimoAvvio = performance.now();

  const ridotta = s.reducedMotion;
  const root = opzioni.root ?? document.querySelector<HTMLElement>('.imp-root');
  const { w, h } = dimensioniViewport();
  const cx = limita(x, 0, w);
  const cy = limita(y, 0, h);
  const g = { x: cx, y: cy, w, h };
  const t0 = ultimoAvvio;
  const from = s.carta;

  // Foglio DOM: se il WebGL non disegna la carta, e sempre per la dissolvenza
  // ridotta (carta VECCHIA che svanisce). Costa: solo con movimento pieno.
  const foglio: Carta | null = ridotta ? from : s.gl !== 'on' ? carta : null;
  const costa: Carta | null = ridotta ? null : carta;
  const velo = root && (foglio || costa) ? creaVelo(root, cx, cy, { foglio, costa, ridotta }) : null;

  if (ridotta) {
    scegliCarta(carta);
  } else {
    store.set({ cartaWave: { x: cx, y: cy, from, to: carta, t0 } });
  }
  runtime.markDirty();

  return new Promise<void>((risolvi) => {
    const o: OndaAttivaDom = {
      from,
      to: carta,
      ridotta,
      velo: velo?.el ?? null,
      veloDom: velo,
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
        if (o.veloDom?.foglio) {
          o.veloDom.foglio.dataset.carta = o.from;
          o.veloDom.el.classList.add('imp-ix-onda--invertita');
        }
      }

      if (o.veloDom) {
        const el = o.veloDom.el;
        el.style.setProperty('--imp-onda-r', `${st.raggio.toFixed(1)}px`);
        el.style.setProperty('--imp-onda-bordo', `${st.bordo.toFixed(1)}px`);
        el.style.setProperty('--imp-onda-o', st.opacita.toFixed(3));
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
