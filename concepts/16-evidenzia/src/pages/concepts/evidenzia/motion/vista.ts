/**
 * EVIDENZIA · Leggi ↔ Pagina intera.
 *
 * La vista è una scala (`transform: scale()` su `.evd-pagina`, decisa dal CSS
 * di foglio.css secondo `data-vista`): qui si anima soltanto il passaggio,
 * con la tecnica FLIP.
 *
 * Protocollo (docs/motion-designer.md §6):
 *   1. prima di cambiare lo stato: `const foto = fotografaVista(paginaEl)`;
 *   2. `impostaVista(a)` nello store;
 *   3. nel `useLayoutEffect` che vede la nuova vista (prima della pittura):
 *      `cambiaVista(paginaEl, foto, a, puntoFisso, { scroller })`.
 *
 * `cambiaVista` porta lo scroll dove deve stare (in Leggi il punto scelto al
 * centro della finestra), misura la posizione finale e anima dalla vecchia
 * alla nuova con uno zoom **intorno al punto fisso geometrico** delle due
 * viste e con la scala interpolata in modo **geometrico** (12 fotogrammi
 * chiave): da 0,4 a 1 lo zoom sembra uniforme all'occhio invece di
 * accelerare in fondo. Durante il passaggio lo scroller non scorre
 * (overflow nascosto, 300-340 ms), così la pagina in volo non allarga
 * l'area scorrevole e non fa comparire barre.
 *
 * Reduced motion: lo scroll si imposta, nessuna animazione (ux 6.3).
 * Nessun rAF, nessun accesso al browser a livello di modulo.
 */

import { store } from '../state/store';
import { clamp, easingCss, lerpLog } from './easing';
import { VISTA } from './durate';

export type VistaPagina = 'leggi' | 'intera';

/** Dove stava la pagina sullo schermo prima del cambio. */
export interface FotoVista {
  /** Bordo sinistro e alto della pagina in coordinate della finestra (px). */
  left: number;
  top: number;
  /** Scala visiva (larghezza a schermo / larghezza di layout). */
  scala: number;
}

/** Un punto del contenuto della pagina, in px non scalati (come `registro.posizione`). */
export interface PuntoFisso {
  x: number;
  y: number;
}

export interface OpzioniVista {
  /** Il contenitore che scorre (`.evd-foglio`). */
  scroller: HTMLElement;
  ridotto?: boolean;
}

/* ------------------------------------------------------------------ */
/* Misure                                                              */
/* ------------------------------------------------------------------ */

/** Fotografia della posizione a schermo della pagina (anche a metà di un passaggio). */
export function fotografaVista(paginaEl: HTMLElement): FotoVista {
  const r = paginaEl.getBoundingClientRect();
  const w = paginaEl.offsetWidth;
  return { left: r.left, top: r.top, scala: w > 0 ? r.width / w : 1 };
}

/**
 * Il punto del contenuto sotto un clic (per esempio in Pagina intera: il
 * punto in cui si vuole entrare a leggere).
 */
export function puntoDaClic(clientX: number, clientY: number, paginaEl: HTMLElement): PuntoFisso {
  const f = fotografaVista(paginaEl);
  const s = f.scala > 0 ? f.scala : 1;
  return { x: (clientX - f.left) / s, y: (clientY - f.top) / s };
}

/** Il punto del contenuto che sta adesso al centro dell'area visibile dello scroller. */
export function puntoAlCentro(scroller: HTMLElement, paginaEl: HTMLElement): PuntoFisso {
  const sr = scroller.getBoundingClientRect();
  return puntoDaClic(
    sr.left + scroller.clientLeft + scroller.clientWidth / 2,
    sr.top + scroller.clientTop + scroller.clientHeight / 2,
    paginaEl,
  );
}

/**
 * La scala di Pagina intera: la più grande che fa stare il foglio intero
 * nell'area libera (finestra meno il molo) con `aria` px intorno (ux 5.3).
 * Mai sopra 1. Funzione pura: la usa foglio/Foglio.tsx per `--evd-scala`.
 */
export function scalaPaginaIntera(o: {
  larghezza: number;
  altezza: number;
  contenutoW: number;
  contenutoH: number;
  aria?: number;
}): number {
  const aria = o.aria ?? VISTA.ariaPx;
  if (o.contenutoW <= 0 || o.contenutoH <= 0) return 1;
  const s = Math.min((o.larghezza - 2 * aria) / o.contenutoW, (o.altezza - 2 * aria) / o.contenutoH);
  return clamp(s, 0.05, 1);
}

/* ------------------------------------------------------------------ */
/* Trasformazione calcolata                                            */
/* ------------------------------------------------------------------ */

interface Matrice {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

function leggiMatrice(t: string): Matrice {
  if (!t || t === 'none') return { sx: 1, sy: 1, tx: 0, ty: 0 };
  const m = /^matrix(3d)?\(([^)]+)\)$/.exec(t.trim());
  if (!m) return { sx: 1, sy: 1, tx: 0, ty: 0 };
  const v = (m[2] ?? '').split(',').map((x) => Number.parseFloat(x));
  const n = (i: number, d: number): number => {
    const x = v[i];
    return x !== undefined && Number.isFinite(x) ? x : d;
  };
  if (m[1]) return { sx: n(0, 1), sy: n(5, 1), tx: n(12, 0), ty: n(13, 0) };
  return { sx: n(0, 1), sy: n(3, 1), tx: n(4, 0), ty: n(5, 0) };
}

function leggiOrigine(o: string): [number, number] {
  const p = o.split(' ').map((x) => Number.parseFloat(x));
  const x = p[0];
  const y = p[1];
  return [x !== undefined && Number.isFinite(x) ? x : 0, y !== undefined && Number.isFinite(y) ? y : 0];
}

/* ------------------------------------------------------------------ */
/* Cambio di vista                                                     */
/* ------------------------------------------------------------------ */

let inCorso: { anim: Animation; ripristina: () => void } | null = null;

function interrompi(): void {
  if (!inCorso) return;
  const c = inCorso;
  inCorso = null;
  c.anim.cancel();
  c.ripristina();
}

/** Scroll istantaneo (ignora un eventuale `scroll-behavior: smooth` del CSS). */
function scorriSubito(el: HTMLElement, left: number, top: number): void {
  el.scrollTo({ left, top, behavior: 'instant' as ScrollBehavior });
}

/**
 * Anima il passaggio alla vista `a`, già applicata dal CSS.
 *
 * da: fotografia presa prima del cambio (`fotografaVista`).
 * puntoFisso: solo per `a === 'leggi'`: il punto del contenuto da portare al
 *   centro dello scroller (clic in Pagina intera, annuncio che riceve il
 *   fuoco, pizzico). null = si tiene il punto che era al centro.
 * Risolve a passaggio finito (subito con reduced motion).
 */
export function cambiaVista(
  paginaEl: HTMLElement,
  da: FotoVista,
  a: VistaPagina,
  puntoFisso: PuntoFisso | null,
  opz: OpzioniVista,
): Promise<void> {
  interrompi();
  const { scroller } = opz;
  const ridotto = opz.ridotto ?? store.get().reducedMotion;

  // 1. Lo scroll della vista nuova.
  if (a === 'intera') {
    scorriSubito(scroller, 0, 0);
  } else {
    const pre = paginaEl.getBoundingClientRect();
    const w = paginaEl.offsetWidth;
    const s1 = w > 0 ? pre.width / w : 1;
    const sr = scroller.getBoundingClientRect();
    const offX = pre.left - sr.left - scroller.clientLeft + scroller.scrollLeft;
    const offY = pre.top - sr.top - scroller.clientTop + scroller.scrollTop;
    // Senza punto scelto: il punto che era al centro prima del cambio.
    const p =
      puntoFisso ??
      ((): PuntoFisso => {
        const s0 = da.scala > 0 ? da.scala : 1;
        return {
          x: (sr.left + scroller.clientLeft + scroller.clientWidth / 2 - da.left) / s0,
          y: (sr.top + scroller.clientTop + scroller.clientHeight / 2 - da.top) / s0,
        };
      })();
    scorriSubito(
      scroller,
      Math.max(0, offX + s1 * p.x - scroller.clientWidth / 2),
      Math.max(0, offY + s1 * p.y - scroller.clientHeight / 2),
    );
  }

  if (ridotto) return Promise.resolve();

  // 2. Dove sta adesso (vista nuova, scroll nuovo).
  const r1 = paginaEl.getBoundingClientRect();
  const w = paginaEl.offsetWidth;
  const h = paginaEl.offsetHeight;
  if (w <= 0 || h <= 0) return Promise.resolve();
  const s1 = r1.width / w;
  const s0 = da.scala > 0 ? da.scala : 1;
  if (Math.abs(s1 - s0) < 1e-3 && Math.abs(r1.left - da.left) < 0.5 && Math.abs(r1.top - da.top) < 0.5) {
    return Promise.resolve();
  }

  // Posizione di layout della pagina (senza la sua trasformazione), in finestra.
  const cs = getComputedStyle(paginaEl);
  const m = leggiMatrice(cs.transform);
  const [ox, oy] = leggiOrigine(cs.transformOrigin);
  const layX = r1.left - (m.tx + ox * (1 - m.sx));
  const layY = r1.top - (m.ty + oy * (1 - m.sy));

  // 3. Fotogrammi: zoom intorno al punto fisso, scala geometrica.
  const n = Math.max(2, VISTA.fotogrammi);
  const fotogrammi: Keyframe[] = [];
  const traslazione = Math.abs(s1 - s0) < 1e-4;
  const qx = traslazione ? 0 : (da.left - r1.left) / (s1 - s0);
  const qy = traslazione ? 0 : (da.top - r1.top) / (s1 - s0);
  const fx = da.left + s0 * qx;
  const fy = da.top + s0 * qy;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    let s: number;
    let left: number;
    let top: number;
    if (traslazione) {
      s = s1;
      left = da.left + (r1.left - da.left) * u;
      top = da.top + (r1.top - da.top) * u;
    } else {
      s = lerpLog(s0, s1, u);
      left = fx - s * qx;
      top = fy - s * qy;
    }
    fotogrammi.push({
      transform: `translate(${(left - layX).toFixed(2)}px, ${(top - layY).toFixed(2)}px) scale(${s.toFixed(5)})`,
      transformOrigin: '0px 0px',
      offset: u,
    });
  }

  // 4. Lo scroller resta fermo mentre la pagina è in volo.
  const overflowPrima = scroller.style.overflow;
  scroller.style.overflow = 'hidden';
  const ripristina = (): void => {
    scroller.style.overflow = overflowPrima;
  };

  const anim = paginaEl.animate(fotogrammi, {
    duration: a === 'intera' ? VISTA.allontana : VISTA.avvicina,
    easing: easingCss('obiettivo'),
    fill: 'backwards',
  });
  const questo = { anim, ripristina };
  inCorso = questo;

  return anim.finished.then(
    () => {
      if (inCorso !== questo) return;
      inCorso = null;
      anim.cancel();
      ripristina();
    },
    () => undefined,
  );
}

/** Ferma un passaggio in corso lasciando la vista finale (smontaggio, cambio di layout). */
export function fermaVista(): void {
  interrompi();
}
