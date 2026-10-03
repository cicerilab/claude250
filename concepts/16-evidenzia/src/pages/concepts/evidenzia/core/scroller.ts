/**
 * EVIDENZIA · la sorgente dello scroll (tech-architect §2.1, §6.3).
 *
 * In layout 'foglio' scorre `.evd-foglio` (nei due assi); in 'colonna' scorre
 * la finestra. Questo modulo nasconde la differenza: tutti leggono lo scroll da
 * `runtime.foglio` (scritto qui nella fase `read` del ticker) e spostano con
 * `vaiA()` / `mostraElemento()`. Nessun altro ascolta l'evento `scroll`.
 *
 * Coordinate del CONTENUTO = px della pagina non scalata (`.evd-pagina`), le
 * stesse di `registro.posizione`, della minipagina e del punto fisso della
 * vista. Lo scroll che porta il punto (x, y) nell'angolo in alto a sinistra è
 * (x × scala, y × scala).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { runtime } from '../state/runtime';
import { prefersReducedMotion } from './capabilities';
import { ticker } from './ticker';

let scroller: HTMLElement | null = null;
let pagina: HTMLElement | null = null;
let registrato = false;

/** Lo scroller del foglio (layout 'foglio'), o null quando scorre la finestra. */
export function getScroller(): HTMLElement | null {
  return scroller;
}

/** La pagina (`.evd-pagina`), o null prima del montaggio. */
export function getPagina(): HTMLElement | null {
  return pagina;
}

/** Fase `read`: lo scroll e l'area visibile in `runtime.foglio`. */
function leggiScroll(): boolean {
  const f = runtime.foglio;
  if (scroller !== null) {
    f.x = scroller.scrollLeft;
    f.y = scroller.scrollTop;
    f.w = scroller.clientWidth;
    f.h = scroller.clientHeight;
  } else if (typeof window !== 'undefined') {
    f.x = window.scrollX;
    f.y = window.scrollY;
    f.w = window.innerWidth;
    f.h = window.innerHeight;
  }
  return false;
}

const suScroll = (): void => {
  ticker.wake();
};

/**
 * Solo foglio/Foglio.tsx. `el` = lo scroller in layout 'foglio', null in
 * 'colonna' (scorre la finestra). Restituisce lo smontaggio.
 */
export function registraScroller(el: HTMLElement | null): () => void {
  if (typeof window === 'undefined' || registrato) {
    if (import.meta.env.DEV && registrato) console.warn('[evidenzia/scroller] scroller già registrato');
    return () => undefined;
  }
  registrato = true;
  scroller = el;
  const bersaglio: HTMLElement | Window = el ?? window;
  bersaglio.addEventListener('scroll', suScroll, { passive: true });
  const togliLettura = ticker.add(leggiScroll, 'read');
  leggiScroll();
  return () => {
    bersaglio.removeEventListener('scroll', suScroll);
    togliLettura();
    if (scroller === el) scroller = null;
    registrato = false;
  };
}

/** Solo foglio/Foglio.tsx: la pagina scalabile. Restituisce lo smontaggio. */
export function registraPagina(el: HTMLElement | null): () => void {
  pagina = el;
  return () => {
    if (pagina === el) pagina = null;
  };
}

function scala(): number {
  return runtime.foglio.scala > 0 ? runtime.foglio.scala : 1;
}

/**
 * Porta il punto (x, y) del contenuto non scalato nell'angolo in alto a
 * sinistra dell'area visibile (limitato dal browser ai bordi).
 * `liscio` (default false): scorrimento nativo `smooth`; sempre istantaneo
 * con reduced motion.
 */
export function vaiA(x: number, y: number, opz?: { liscio?: boolean }): void {
  if (typeof window === 'undefined') return;
  const liscio = (opz?.liscio ?? false) && !prefersReducedMotion();
  const behavior: ScrollBehavior = liscio ? 'smooth' : 'auto';
  const s = scala();
  if (scroller !== null) {
    scroller.scrollTo({ left: Math.max(0, x * s), top: Math.max(0, y * s), behavior });
  } else {
    // colonna: la pagina sta nel documento, il suo inizio non è per forza a 0
    let dx = 0;
    let dy = 0;
    if (pagina !== null) {
      const r = pagina.getBoundingClientRect();
      dx = r.left + window.scrollX;
      dy = r.top + window.scrollY;
    }
    window.scrollTo({ left: Math.max(0, dx + x), top: Math.max(0, dy + y), behavior });
  }
  ticker.wake();
}

export interface OpzioniMostra {
  /** 'nearest' (default): il minimo spostamento; 'start': l'elemento in cima (rubrica da ?rubrica=). */
  blocco?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
  /** default true (sempre false con reduced motion) */
  liscio?: boolean;
}

/**
 * Fa vedere `el` intero nel foglio (o nella finestra), rispettando gli
 * `scroll-padding` dello scaffold (ConceptBackButton, molo, barra del giro)
 * più `margine` px intorno. Nativo: `scrollIntoView` con `scroll-margin`
 * temporaneo.
 */
export function mostraElemento(el: HTMLElement, margine = 0, opz?: OpzioniMostra): void {
  const liscio = (opz?.liscio ?? true) && !prefersReducedMotion();
  const prima = el.style.scrollMargin;
  if (margine > 0) el.style.scrollMargin = `${margine}px`;
  el.scrollIntoView({
    block: opz?.blocco ?? 'nearest',
    inline: opz?.inline ?? 'nearest',
    behavior: liscio ? 'smooth' : 'auto',
  });
  el.style.scrollMargin = prima;
  ticker.wake();
}

/** Da un punto dello schermo (clientX/Y) alle coordinate del contenuto non scalato. */
export function aCoordinateContenuto(clientX: number, clientY: number): { x: number; y: number } {
  if (pagina === null) {
    const f = runtime.foglio;
    return { x: clientX + f.x, y: clientY + f.y };
  }
  const r = pagina.getBoundingClientRect();
  const w = pagina.offsetWidth;
  const s = w > 0 && r.width > 0 ? r.width / w : 1;
  return { x: (clientX - r.left) / s, y: (clientY - r.top) / s };
}
