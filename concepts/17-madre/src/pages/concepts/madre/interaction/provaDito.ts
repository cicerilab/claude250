/**
 * MADRE · "La prova del dito": gli INPUT (interaction-designer §2,
 * tech-architect §7.1, ux-architect §6.3, creative-director §4.3).
 *
 * Questo file traduce mouse, penna, dito, tastiera e clic senza puntatore
 * (lettori di schermo, controllo vocale) in `premi(uv)` / `rilascia(i)` di
 * `motion/fossetta.ts`. La dinamica (quanto scende, come torna su piano
 * piano) è del motion-designer; la resa è del WebGL o delle fossette CSS.
 * Qui non c'è nessun testo: la frase di spiegazione e i nomi dei punti
 * arrivano dalle opzioni (content/testi.ts, copywriter).
 *
 * Regole del gesto:
 * - mouse e penna: la fossetta parte al pointerdown, torna su al rilascio,
 *   anche se il rilascio avviene fuori (cattura del puntatore);
 * - dito: solo dentro la zona di prova; parte dopo 110 ms se il dito non è
 *   sceso o salito di più di 12 px (altrimenti è uno scroll, e lo scroll
 *   resta del browser: `touch-action: pan-y` sulla zona, interaction.css).
 *   Un tocco breve è una prova completa. Se lo scroll parte dopo,
 *   `pointercancel` rilascia la fossetta, che torna su piano piano;
 * - fino a 3 fossette insieme (la quarta prende il posto della più vecchia:
 *   lo decide `premi`, qui si tiene solo il conto di chi tiene cosa);
 * - tastiera: Invio o Spazio = fossetta nel punto corrente, tenuto premuto la
 *   approfondisce (la ripetizione automatica del tasto è ignorata), al
 *   rilascio torna su. Frecce = cinque punti (centro, sopra, destra, sotto,
 *   sinistra), con l'anello di fuoco disegnato attorno al punto
 *   (`--mad-prova-x/y` sull'elemento, interaction.css);
 * - clic senza puntatore né tasti (lettore di schermo): una prova completa
 *   nel punto corrente, tenuta 260 ms;
 * - premere non invia nulla e non c'è mai un "tieni premuto" che serva a
 *   qualcosa: la prova è sul rilascio e non ha conseguenze (WCAG 2.5.1/2.5.2);
 * - la frase di spiegazione si dice una volta per visita, al primo rilascio
 *   (`provaVista` nello store).
 *
 * Nessun accesso al browser a livello di modulo (prerender).
 */

import { useEffect, useRef, type RefObject } from 'react';
import { annuncia } from '../core/annunci';
import { ticker } from '../core/ticker';
import { premi, rilascia } from '../motion/fossetta';
import { runtime } from '../state/runtime';
import { segnaProvaVista, store } from '../state/store';

/* ------------------------------------------------------------------ punti */

export type PuntoProva = 'centro' | 'sopra' | 'destra' | 'sotto' | 'sinistra';

/** Ordine di lettura dei punti (per i testi del copywriter). */
export const PUNTI_PROVA: readonly PuntoProva[] = ['centro', 'sopra', 'destra', 'sotto', 'sinistra'];

/** Spostamento di ogni punto dal centro, in unità di `SCARTO_PUNTO`. */
const DIREZIONE: Readonly<Record<PuntoProva, readonly [number, number]>> = {
  centro: [0, 0],
  sopra: [0, -1],
  destra: [1, 0],
  sotto: [0, 1],
  sinistra: [-1, 0],
};

/** Distanza dei quattro punti laterali dal centro, in frazione del lato. */
export const SCARTO_PUNTO = 0.26;

/* ---------------------------------------------------------------- tempi */

/** Il dito deve restare quasi fermo per tanto prima che la prova parta. */
export const INTENZIONE_TOUCH_MS = 110;
/** Oltre questo spostamento verticale prima della partenza, è uno scroll. */
export const SOGLIA_SCROLL_PX = 12;
/** Un clic che arriva entro questo tempo da un gesto già gestito è il suo gemello. */
const CLIC_GEMELLO_MS = 500;
/** Durata della prova fatta con un clic senza puntatore (lettori di schermo). */
export const PRESSIONE_CLIC_MS = 260;

/* -------------------------------------------------------------- opzioni */

export interface OpzioniProvaDito {
  /**
   * Zona dove il DITO può fare la prova (default: il rettangolo dell'elemento).
   * Mouse e penna valgono su tutto l'elemento.
   */
  zonaTouch?: DOMRectReadOnly | (() => DOMRectReadOnly);
  /** Frase detta una volta per visita al primo rilascio (content/testi.ts). */
  spiegazione?: string;
  /** Testo da annunciare quando le frecce cambiano punto (content/testi.ts). */
  testoPunto?: (punto: PuntoProva) => string;
  /** Avviso al cambio di punto (per esempio per aggiornare un aria-describedby). */
  onPunto?: (punto: PuntoProva) => void;
  /** Avviso dopo la prima prova della visita (la riga visibile la mostra la sezione). */
  onPrimaProva?: () => void;
}

interface Pressione {
  /** Indice della fossetta in `runtime.impasto.fossette`, null se non partita. */
  indice: number | null;
  tipo: string;
  x0: number;
  y0: number;
  timer: ReturnType<typeof setTimeout> | null;
}

function dentro(r: DOMRectReadOnly, x: number, y: number): boolean {
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function eTastoPremi(e: KeyboardEvent): boolean {
  return e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar';
}

/** Punto successivo con le frecce: dal centro ai lati, da un lato al centro o all'altro asse. */
export function puntoDopo(corrente: PuntoProva, tasto: string): PuntoProva | null {
  const d: readonly [number, number] | null =
    tasto === 'ArrowUp' ? [0, -1] : tasto === 'ArrowDown' ? [0, 1] : tasto === 'ArrowLeft' ? [-1, 0] : tasto === 'ArrowRight' ? [1, 0] : null;
  if (d === null) return null;
  const [cx, cy] = DIREZIONE[corrente];
  let nx = cx + d[0];
  let ny = cy + d[1];
  if (Math.abs(nx) + Math.abs(ny) > 1) {
    // Da un lato verso l'altro asse (per esempio da destra con freccia su):
    // si va al lato indicato dalla freccia.
    nx = d[0];
    ny = d[1];
  }
  nx = Math.max(-1, Math.min(1, nx));
  ny = Math.max(-1, Math.min(1, ny));
  const trovato = PUNTI_PROVA.find((p) => DIREZIONE[p][0] === nx && DIREZIONE[p][1] === ny);
  return trovato ?? corrente;
}

/**
 * Collega il `<button>` "Fai la prova del dito sull'impasto" (della sezione
 * Impasto) alla dinamica delle fossette. Restituisce la funzione che stacca
 * tutto e fa tornare su le fossette ancora premute.
 */
export function collegaProvaDito(el: HTMLButtonElement, opz: OpzioniProvaDito = {}): () => void {
  const attive = new Map<number, Pressione>();
  let punto: PuntoProva = 'centro';
  /** Indice della fossetta tenuta con la tastiera, o null. */
  let tastiera: number | null = null;
  let ultimoGesto = Number.NEGATIVE_INFINITY;
  const timerClic = new Set<ReturnType<typeof setTimeout>>();

  el.setAttribute('data-mad-ix', 'prova');
  scriviPunto();

  function zona(): DOMRectReadOnly {
    const z = opz.zonaTouch;
    if (z === undefined) return el.getBoundingClientRect();
    return typeof z === 'function' ? z() : z;
  }

  function scriviPunto(): void {
    const [dx, dy] = DIREZIONE[punto];
    el.style.setProperty('--mad-prova-x', `${50 + dx * SCARTO_PUNTO * 100}%`);
    el.style.setProperty('--mad-prova-y', `${50 + dy * SCARTO_PUNTO * 100}%`);
  }

  function coordinatePunto(): { x: number; y: number } {
    const r = el.getBoundingClientRect();
    const [dx, dy] = DIREZIONE[punto];
    return { x: r.left + r.width * (0.5 + dx * SCARTO_PUNTO), y: r.top + r.height * (0.5 + dy * SCARTO_PUNTO) };
  }

  /** Fa partire una fossetta nel punto dello schermo (px CSS). Null se il punto è fuori dall'impasto. */
  function avvia(x: number, y: number): number | null {
    const uv = runtime.impasto.daSchermoAUv(x, y);
    if (uv === null) return null;
    const indice = premi(uv);
    // La quarta prende il posto della più vecchia: chi la teneva non la rilascia più.
    for (const p of attive.values()) if (p.indice === indice) p.indice = null;
    if (tastiera === indice) tastiera = null;
    runtime.impasto.ultimoInput = performance.now();
    el.setAttribute('data-mad-premuto', '');
    ticker.wake();
    return indice;
  }

  function lascia(indice: number | null): void {
    if (indice === null) return;
    rilascia(indice);
    runtime.impasto.ultimoInput = performance.now();
    ticker.wake();
    let ancora = tastiera !== null;
    for (const p of attive.values()) if (p.indice !== null) ancora = true;
    if (!ancora) el.removeAttribute('data-mad-premuto');
    dopoLaPrima();
  }

  function dopoLaPrima(): void {
    if (store.get().provaVista) return;
    if (opz.spiegazione !== undefined && opz.spiegazione !== '') annuncia(opz.spiegazione);
    segnaProvaVista();
    opz.onPrimaProva?.();
  }

  /* ---------------------------------------------------------- puntatore */

  function giu(e: PointerEvent): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (attive.has(e.pointerId)) return;

    if (e.pointerType === 'touch') {
      if (!dentro(zona(), e.clientX, e.clientY)) return;
      const p: Pressione = { indice: null, tipo: 'touch', x0: e.clientX, y0: e.clientY, timer: null };
      p.timer = setTimeout(() => {
        p.timer = null;
        if (attive.get(e.pointerId) === p) p.indice = avvia(p.x0, p.y0);
      }, INTENZIONE_TOUCH_MS);
      attive.set(e.pointerId, p);
      return;
    }

    // Mouse e penna: subito. Niente selezione di testo né fuoco "da mouse".
    e.preventDefault();
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* puntatore già sparito: niente cattura */
    }
    const p: Pressione = { indice: null, tipo: e.pointerType, x0: e.clientX, y0: e.clientY, timer: null };
    attive.set(e.pointerId, p);
    p.indice = avvia(e.clientX, e.clientY);
  }

  function muove(e: PointerEvent): void {
    const p = attive.get(e.pointerId);
    if (p === undefined || p.timer === null) return;
    if (Math.abs(e.clientY - p.y0) > SOGLIA_SCROLL_PX) {
      // Il dito sta scorrendo la pagina: non era una prova.
      clearTimeout(p.timer);
      p.timer = null;
      attive.delete(e.pointerId);
    }
  }

  function su(e: PointerEvent): void {
    const p = attive.get(e.pointerId);
    if (p === undefined) return;
    attive.delete(e.pointerId);
    ultimoGesto = performance.now();
    if (p.timer !== null) {
      // Tocco breve: è una prova completa, giù e subito su.
      clearTimeout(p.timer);
      p.timer = null;
      lascia(avvia(p.x0, p.y0));
      return;
    }
    lascia(p.indice);
  }

  function annullato(e: PointerEvent): void {
    const p = attive.get(e.pointerId);
    if (p === undefined) return;
    attive.delete(e.pointerId);
    ultimoGesto = performance.now();
    if (p.timer !== null) {
      clearTimeout(p.timer);
      p.timer = null;
      return;
    }
    // Lo scroll è partito dopo la prova: la fossetta torna su piano piano.
    lascia(p.indice);
  }

  function menu(e: Event): void {
    // Nessun menu sulla pressione lunga (dito tenuto sull'impasto).
    if (attive.size > 0 || performance.now() - ultimoGesto < CLIC_GEMELLO_MS) e.preventDefault();
  }

  /* ----------------------------------------------------------- tastiera */

  function tastoGiu(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (eTastoPremi(e)) {
      e.preventDefault();
      if (e.repeat || tastiera !== null) return;
      ultimoGesto = performance.now();
      const { x, y } = coordinatePunto();
      tastiera = avvia(x, y);
      return;
    }
    const nuovo = puntoDopo(punto, e.key);
    if (nuovo === null) return;
    e.preventDefault();
    if (nuovo === punto) return;
    punto = nuovo;
    scriviPunto();
    opz.onPunto?.(punto);
    const testo = opz.testoPunto?.(punto) ?? '';
    if (testo !== '') annuncia(testo);
  }

  function tastoSu(e: KeyboardEvent): void {
    if (!eTastoPremi(e)) return;
    e.preventDefault();
    ultimoGesto = performance.now();
    const indice = tastiera;
    tastiera = null;
    lascia(indice);
  }

  function perdeFuoco(): void {
    if (tastiera === null) return;
    const indice = tastiera;
    tastiera = null;
    lascia(indice);
  }

  /* ----------------------------------------- clic senza puntatore né tasti */

  function clic(e: MouseEvent): void {
    e.preventDefault();
    if (performance.now() - ultimoGesto < CLIC_GEMELLO_MS) return;
    // Lettore di schermo, controllo vocale, switch: una prova completa.
    ultimoGesto = performance.now();
    const { x, y } = coordinatePunto();
    const indice = avvia(x, y);
    if (indice === null) return;
    const t = setTimeout(() => {
      timerClic.delete(t);
      lascia(indice);
    }, PRESSIONE_CLIC_MS);
    timerClic.add(t);
  }

  /* --------------------------------------------------- scheda nascosta */

  function visibilita(): void {
    if (document.visibilityState !== 'hidden') return;
    rilasciaTutto();
  }

  function rilasciaTutto(): void {
    for (const p of attive.values()) {
      if (p.timer !== null) clearTimeout(p.timer);
      if (p.indice !== null) rilascia(p.indice);
    }
    attive.clear();
    for (const t of timerClic) clearTimeout(t);
    timerClic.clear();
    if (tastiera !== null) rilascia(tastiera);
    tastiera = null;
    el.removeAttribute('data-mad-premuto');
    ticker.wake();
  }

  el.addEventListener('pointerdown', giu);
  el.addEventListener('pointermove', muove);
  el.addEventListener('pointerup', su);
  el.addEventListener('pointercancel', annullato);
  el.addEventListener('lostpointercapture', annullato);
  el.addEventListener('contextmenu', menu);
  el.addEventListener('keydown', tastoGiu);
  el.addEventListener('keyup', tastoSu);
  el.addEventListener('blur', perdeFuoco);
  el.addEventListener('click', clic);
  document.addEventListener('visibilitychange', visibilita);

  return () => {
    el.removeEventListener('pointerdown', giu);
    el.removeEventListener('pointermove', muove);
    el.removeEventListener('pointerup', su);
    el.removeEventListener('pointercancel', annullato);
    el.removeEventListener('lostpointercapture', annullato);
    el.removeEventListener('contextmenu', menu);
    el.removeEventListener('keydown', tastoGiu);
    el.removeEventListener('keyup', tastoSu);
    el.removeEventListener('blur', perdeFuoco);
    el.removeEventListener('click', clic);
    document.removeEventListener('visibilitychange', visibilita);
    rilasciaTutto();
    el.removeAttribute('data-mad-ix');
    el.style.removeProperty('--mad-prova-x');
    el.style.removeProperty('--mad-prova-y');
  };
}

/**
 * Versione React di `collegaProvaDito`: si collega al mount e si stacca allo
 * smontaggio. Le opzioni possono cambiare a ogni render senza ricollegare.
 */
export function useProvaDito(ref: RefObject<HTMLButtonElement>, opz: OpzioniProvaDito = {}): void {
  const opzioni = useRef(opz);
  opzioni.current = opz;

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    return collegaProvaDito(el, {
      zonaTouch: () => {
        const z = opzioni.current.zonaTouch;
        if (z === undefined) return el.getBoundingClientRect();
        return typeof z === 'function' ? z() : z;
      },
      get spiegazione() {
        return opzioni.current.spiegazione;
      },
      testoPunto: (p) => opzioni.current.testoPunto?.(p) ?? '',
      onPunto: (p) => opzioni.current.onPunto?.(p),
      onPrimaProva: () => opzioni.current.onPrimaProva?.(),
    });
  }, [ref]);
}
