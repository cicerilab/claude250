/**
 * NODI · il piano del suono: la foglia della voce (interaction-designer).
 *
 * Logica pura del gesto della prenotazione "La voce che vorresti", senza
 * markup né testi: markup e CSS sono del section-builder-voce
 * (sections/Voce/PianoSuono.tsx), le frasi arrivano dalle opzioni.
 *
 * Contratto (creative-director §4.4, ux-architect §5.4, §6.1 V3, §7.8,
 * tech-architect §7.2):
 * - Il punto (x, y) in 0..1: x da scuro (0) a brillante (1), y da morbido
 *   (0, in basso) a pronto (1, in alto). Il centro è "equilibrata".
 * - Trascinare la FOGLIA (mouse, dito, penna) con pointer capture: la foglia
 *   si prende dove la si tocca. `touch-action: none` solo sulla foglia: lo
 *   scroll è bloccato solo mentre la si tiene.
 * - Toccare il PIANO fuori dalla foglia la porta lì: col mouse e la penna
 *   subito (e si continua a trascinare), col dito solo se è un tocco (sul
 *   piano `touch-action: pan-y`, uno scorrimento verticale resta scroll).
 * - Mentre si trascina: `runtime.voce` subito (la tavola rifà l'anello), la
 *   foglia si sposta nella fase `write` del ticker, `impostaVoce` al massimo
 *   una volta per frame (frase della zona, righello, range).
 * - Tastiera sulla foglia: frecce = 5 % (21 posizioni per asse),
 *   Maiusc+frecce = 25 %, Inizio = centro. Le frecce non scorrono la pagina.
 * - Due `input type=range` (0-100, passo 5) muovono la stessa foglia: sono
 *   l'alternativa per lettori di schermo e tastiera (ux §7.8).
 * - `onAssestata` (per l'annuncio "Voce scura e pronta, 336 hertz."): al
 *   rilascio del puntatore, al tocco, e 600 ms dopo l'ultimo tasto o range.
 *   Mai durante il gesto.
 * - Trascinare non fa MAI suonare niente (CD §4.4): la nota parte solo da
 *   "Senti la voce" (interaction/suono.ts).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';
import { ticker } from '../core/ticker';
import { clamp01 } from '../motion/easing';
import { runtime } from '../state/runtime';
import { impostaVoce, store, useNodi } from '../state/store';

/* ------------------------------------------------------------------ costanti */

/** Passo delle frecce: 5 % (21 posizioni per asse). */
export const PASSO_VOCE = 0.05;
/** Passo con Maiusc: 25 %. */
export const PASSO_VOCE_LUNGO = 0.25;
/** Il gesto da tastiera o range è finito dopo questa pausa. */
const ASSESTAMENTO_MS = 600;
/** Il dito sul piano: oltre questo spostamento non è più un tocco. */
const SOGLIA_TOCCO_PX = 10;
const TOCCO_MAX_MS = 600;
/** Variazione minima (px) per riscrivere il transform della foglia. */
const SOGLIA_PX = 0.25;

/* ------------------------------------------------------------------ tipi */

/** Come è stata scelta la voce (parametro di track, ux §6.1). */
export type MetodoVoce = 'trascina' | 'tocco' | 'tastiera' | 'nessuno';

export interface PuntoVoce {
  x: number;
  y: number;
}

export interface OpzioniPianoVoce {
  /** aria-valuetext del range "Da scuro a brillante" (x 0..1): "un po' scura", "equilibrata"… */
  valuetextX: (x: number) => string;
  /** aria-valuetext del range "Da morbido a pronto" (y 0..1). */
  valuetextY: (y: number) => string;
  /** Il gesto è finito: il builder annuncia la zona e gli hertz nella regione aria-live del form. */
  onAssestata?: (punto: PuntoVoce, metodo: Exclude<MetodoVoce, 'nessuno'>) => void;
  /** Invio in corso (V6) e prerender (V0): la foglia si vede ma non risponde. */
  disabilitato?: boolean;
}

export interface PropsPiano {
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
}

export interface PropsFoglia {
  role: 'application';
  tabIndex: 0 | -1;
  'aria-disabled': true | undefined;
  'data-trascinando': '' | undefined;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
}

export interface PropsRange {
  type: 'range';
  min: 0;
  max: 100;
  step: 5;
  value: number;
  'aria-valuetext': string;
  'aria-disabled': true | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface PianoVoce {
  /** Il quadrato: niente padding, il suo lato interno è la scala dei due assi. */
  refPiano: RefObject<HTMLDivElement>;
  propsPiano: PropsPiano;
  /** La foglia, ancorata in CSS al centro del piano: il ticker scrive qui translate3d(dx, dy). */
  refFoglia: RefObject<HTMLDivElement>;
  propsFoglia: PropsFoglia;
  propsRangeX: PropsRange;
  propsRangeY: PropsRange;
  trascinando: boolean;
  /** Ultimo modo usato per scegliere la voce ('nessuno' se la foglia non è mai stata mossa). */
  metodo: () => MetodoVoce;
}

/* ------------------------------------------------------------------ funzioni pure */

/** Arrotonda alla griglia delle frecce (0, 0,05 … 1). */
export function suGriglia(v: number): number {
  return Math.round(clamp01(v) / PASSO_VOCE) * PASSO_VOCE;
}

/** Il punto dopo un tasto sulla foglia, o null se il tasto non è suo. */
export function puntoDopoTasto(tasto: string, lungo: boolean, p: PuntoVoce): PuntoVoce | null {
  const passo = lungo ? PASSO_VOCE_LUNGO : PASSO_VOCE;
  switch (tasto) {
    case 'ArrowRight':
      return { x: suGriglia(p.x + passo), y: p.y };
    case 'ArrowLeft':
      return { x: suGriglia(p.x - passo), y: p.y };
    case 'ArrowUp':
      return { x: p.x, y: suGriglia(p.y + passo) };
    case 'ArrowDown':
      return { x: p.x, y: suGriglia(p.y - passo) };
    case 'Home':
      return { x: 0.5, y: 0.5 };
    default:
      return null;
  }
}

/** Valore del range (0-100, multipli di 5) per una coordinata 0..1. */
export function valoreRange(v: number): number {
  return Math.round(clamp01(v) * 20) * 5;
}

/** Spostamento in px della foglia dal centro del piano di lato `lato`. */
export function spostamentoFoglia(p: PuntoVoce, lato: number): { dx: number; dy: number } {
  return { dx: (clamp01(p.x) - 0.5) * lato, dy: (0.5 - clamp01(p.y)) * lato };
}

/* ------------------------------------------------------------------ stato del gesto */

interface Gesto {
  id: number;
  el: HTMLElement;
  sulla: 'foglia' | 'piano';
  dito: boolean;
  /** Rettangolo del piano al pointerdown, e scroll di allora (la rotella può scorrere durante il gesto). */
  sinistra: number;
  alto: number;
  lato: number;
  scrollY0: number;
  /** Dove si è presa la foglia rispetto al suo centro (px). */
  presaX: number;
  presaY: number;
  x0: number;
  y0: number;
  t0: number;
  mosso: boolean;
  staccatori: Array<() => void>;
}

/* ------------------------------------------------------------------ hook */

export function usePianoVoce(opz: OpzioniPianoVoce): PianoVoce {
  const { disabilitato = false } = opz;
  const voce = useNodi((s) => s.voce);

  const refPiano = useRef<HTMLDivElement>(null);
  const refFoglia = useRef<HTMLDivElement>(null);
  const [trascinando, setTrascinando] = useState(false);

  const lato = useRef(0);
  const gesto = useRef<Gesto | null>(null);
  const metodo = useRef<MetodoVoce>('nessuno');
  const timerAssestata = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoScritto = useRef({ dx: Number.NaN, dy: Number.NaN });
  const opzRef = useRef(opz);
  opzRef.current = opz;

  /* ---- scrive la foglia (solo se si è spostata) */
  const scriviFoglia = useCallback((p: PuntoVoce) => {
    const foglia = refFoglia.current;
    if (foglia === null || !(lato.current > 0)) return;
    const { dx, dy } = spostamentoFoglia(p, lato.current);
    const u = ultimoScritto.current;
    if (Math.abs(dx - u.dx) < SOGLIA_PX && Math.abs(dy - u.dy) < SOGLIA_PX) return;
    ultimoScritto.current = { dx, dy };
    foglia.style.transform = `translate3d(${Math.round(dx * 100) / 100}px, ${Math.round(dy * 100) / 100}px, 0)`;
  }, []);

  /* ---- misura del lato: solo su ResizeObserver */
  useEffect(() => {
    const piano = refPiano.current;
    if (piano === null) return undefined;
    const misura = (): void => {
      const l = piano.clientWidth;
      if (l === lato.current) return;
      lato.current = l;
      ultimoScritto.current = { dx: Number.NaN, dy: Number.NaN };
      const r = runtime.voce;
      scriviFoglia(r.trascinando ? r : store.get().voce);
    };
    misura();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', misura);
      return () => window.removeEventListener('resize', misura);
    }
    const ro = new ResizeObserver(misura);
    ro.observe(piano);
    return () => ro.disconnect();
  }, [scriviFoglia]);

  /* ---- fuori dal gesto la foglia segue lo store (tastiera, range, "Cambia la voce", ripristino) */
  useEffect(() => {
    if (gesto.current !== null && gesto.current.mosso) return;
    runtime.voce.x = voce.x;
    runtime.voce.y = voce.y;
    scriviFoglia(voce);
  }, [voce, scriviFoglia]);

  /* ---- durante il gesto: foglia e store una volta per frame, nella fase write */
  useEffect(() => {
    let ultimaX = Number.NaN;
    let ultimaY = Number.NaN;
    const scrivi = (): void => {
      const r = runtime.voce;
      if (!r.trascinando) return;
      scriviFoglia(r);
      if (r.x !== ultimaX || r.y !== ultimaY) {
        ultimaX = r.x;
        ultimaY = r.y;
        impostaVoce({ x: r.x, y: r.y });
      }
    };
    return ticker.add(scrivi, 'write');
  }, [scriviFoglia]);

  /* ---- annuncio dopo una pausa (tastiera e range) */
  const programmaAssestata = useCallback((p: PuntoVoce) => {
    if (timerAssestata.current !== null) clearTimeout(timerAssestata.current);
    timerAssestata.current = setTimeout(() => {
      timerAssestata.current = null;
      opzRef.current.onAssestata?.(p, 'tastiera');
    }, ASSESTAMENTO_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerAssestata.current !== null) clearTimeout(timerAssestata.current);
    },
    [],
  );

  /* ---- fine del gesto */
  const chiudiGesto = useCallback((comeFinisce: 'rilascio' | 'tocco' | 'annullato') => {
    const g = gesto.current;
    if (g === null) return;
    gesto.current = null;
    for (const stacca of g.staccatori) stacca();
    try {
      if (g.el.hasPointerCapture(g.id)) g.el.releasePointerCapture(g.id);
    } catch (_e) {
      // già rilasciato dal browser
    }
    const r = runtime.voce;
    const eraTrascinata = r.trascinando;
    r.trascinando = false;
    setTrascinando(false);
    if (eraTrascinata || comeFinisce === 'tocco') {
      const p = { x: r.x, y: r.y };
      impostaVoce(p);
      if (comeFinisce !== 'annullato') {
        const m = comeFinisce === 'tocco' ? 'tocco' : 'trascina';
        metodo.current = m;
        opzRef.current.onAssestata?.(p, m);
      }
    }
    ticker.wake();
  }, []);

  useEffect(() => () => chiudiGesto('annullato'), [chiudiGesto]);

  useEffect(() => {
    if (disabilitato) chiudiGesto('annullato');
  }, [disabilitato, chiudiGesto]);

  /* ---- inizio del gesto */
  const iniziaGesto = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, sulla: 'foglia' | 'piano') => {
      if (disabilitato || gesto.current !== null) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const piano = refPiano.current;
      if (piano === null) return;
      const rect = piano.getBoundingClientRect();
      const l = piano.clientWidth;
      if (!(l > 0)) return;
      // Il bordo del piano (se il builder ne mette uno) non entra nella scala.
      const sinistra = rect.left + piano.clientLeft;
      const alto = rect.top + piano.clientTop;
      const dito = e.pointerType === 'touch';
      const el = e.currentTarget;

      const attuale = store.get().voce;
      let presaX = 0;
      let presaY = 0;
      if (sulla === 'foglia') {
        e.preventDefault();
        e.stopPropagation();
        el.focus({ preventScroll: true });
        presaX = e.clientX - (sinistra + clamp01(attuale.x) * l);
        presaY = e.clientY - (alto + (1 - clamp01(attuale.y)) * l);
      }

      const g: Gesto = {
        id: e.pointerId,
        el,
        sulla,
        dito,
        sinistra,
        alto,
        lato: l,
        scrollY0: window.scrollY,
        presaX,
        presaY,
        x0: e.clientX,
        y0: e.clientY,
        t0: e.timeStamp,
        mosso: false,
        staccatori: [],
      };
      gesto.current = g;
      runtime.voce.x = attuale.x;
      runtime.voce.y = attuale.y;

      try {
        el.setPointerCapture(e.pointerId);
      } catch (_e) {
        // senza capture il gesto funziona finché il puntatore resta sopra
      }

      const punto = (ev: PointerEvent): PuntoVoce => {
        const deriva = window.scrollY - g.scrollY0;
        const x = (ev.clientX - g.presaX - g.sinistra) / g.lato;
        const y = 1 - (ev.clientY - g.presaY - (g.alto - deriva)) / g.lato;
        return { x: clamp01(x), y: clamp01(y) };
      };

      const porta = (ev: PointerEvent): void => {
        const p = punto(ev);
        const r = runtime.voce;
        r.x = p.x;
        r.y = p.y;
        r.trascinando = true;
        runtime.markDirty();
        ticker.wake();
      };

      const avvia = (): void => {
        g.mosso = true;
        setTrascinando(true);
      };

      // Mouse e penna sul piano: la foglia va subito lì e si continua a trascinare.
      if (sulla === 'piano' && !dito) {
        avvia();
        porta(e.nativeEvent);
      }

      const muovi = (ev: PointerEvent): void => {
        if (ev.pointerId !== g.id) return;
        if (!g.mosso) {
          // Il dito sul piano non trascina: aspetta il tocco (lo scroll verticale è della pagina).
          if (g.sulla === 'piano' && g.dito) return;
          if (Math.hypot(ev.clientX - g.x0, ev.clientY - g.y0) < (g.dito ? 4 : 2)) return;
          avvia();
        }
        porta(ev);
      };

      const su = (ev: PointerEvent): void => {
        if (ev.pointerId !== g.id) return;
        if (g.sulla === 'piano' && g.dito) {
          const fermo = Math.hypot(ev.clientX - g.x0, ev.clientY - g.y0) <= SOGLIA_TOCCO_PX;
          if (fermo && ev.timeStamp - g.t0 <= TOCCO_MAX_MS) {
            const p = punto(ev);
            runtime.voce.x = p.x;
            runtime.voce.y = p.y;
            runtime.markDirty();
            scriviFoglia(p);
            chiudiGesto('tocco');
            return;
          }
          chiudiGesto('annullato');
          return;
        }
        chiudiGesto(g.mosso ? 'rilascio' : 'annullato');
      };

      const annulla = (ev: PointerEvent): void => {
        if (ev.pointerId !== g.id) return;
        chiudiGesto(g.mosso ? 'rilascio' : 'annullato');
      };

      el.addEventListener('pointermove', muovi);
      el.addEventListener('pointerup', su);
      el.addEventListener('pointercancel', annulla);
      el.addEventListener('lostpointercapture', annulla);
      g.staccatori.push(
        () => el.removeEventListener('pointermove', muovi),
        () => el.removeEventListener('pointerup', su),
        () => el.removeEventListener('pointercancel', annulla),
        () => el.removeEventListener('lostpointercapture', annulla),
      );
    },
    [disabilitato, chiudiGesto, scriviFoglia],
  );

  const onPointerDownPiano = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => iniziaGesto(e, 'piano'),
    [iniziaGesto],
  );
  const onPointerDownFoglia = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => iniziaGesto(e, 'foglia'),
    [iniziaGesto],
  );

  /* ---- tastiera sulla foglia */
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabilitato || e.altKey || e.ctrlKey || e.metaKey) return;
      const p = puntoDopoTasto(e.key, e.shiftKey, store.get().voce);
      if (p === null) return;
      e.preventDefault();
      metodo.current = 'tastiera';
      impostaVoce(p);
      runtime.markDirty();
      ticker.wake();
      programmaAssestata(p);
    },
    [disabilitato, programmaAssestata],
  );

  /* ---- i due range */
  const cambiaAsse = useCallback(
    (asse: 'x' | 'y', e: ChangeEvent<HTMLInputElement>) => {
      if (disabilitato) return;
      const v = clamp01(Number(e.currentTarget.value) / 100);
      if (!Number.isFinite(v)) return;
      const attuale = store.get().voce;
      const p = asse === 'x' ? { x: v, y: attuale.y } : { x: attuale.x, y: v };
      metodo.current = 'tastiera';
      impostaVoce(p);
      runtime.markDirty();
      ticker.wake();
      programmaAssestata(p);
    },
    [disabilitato, programmaAssestata],
  );
  const onChangeX = useCallback((e: ChangeEvent<HTMLInputElement>) => cambiaAsse('x', e), [cambiaAsse]);
  const onChangeY = useCallback((e: ChangeEvent<HTMLInputElement>) => cambiaAsse('y', e), [cambiaAsse]);

  const leggiMetodo = useCallback((): MetodoVoce => metodo.current, []);

  const ariaDisabilitato = disabilitato ? true : undefined;

  return {
    refPiano,
    propsPiano: { onPointerDown: onPointerDownPiano },
    refFoglia,
    propsFoglia: {
      role: 'application',
      tabIndex: disabilitato ? -1 : 0,
      'aria-disabled': ariaDisabilitato,
      'data-trascinando': trascinando ? '' : undefined,
      onPointerDown: onPointerDownFoglia,
      onKeyDown,
    },
    propsRangeX: {
      type: 'range',
      min: 0,
      max: 100,
      step: 5,
      value: valoreRange(voce.x),
      'aria-valuetext': opz.valuetextX(voce.x),
      'aria-disabled': ariaDisabilitato,
      onChange: onChangeX,
    },
    propsRangeY: {
      type: 'range',
      min: 0,
      max: 100,
      step: 5,
      value: valoreRange(voce.y),
      'aria-valuetext': opz.valuetextY(voce.y),
      'aria-disabled': ariaDisabilitato,
      onChange: onChangeY,
    },
    trascinando,
    metodo: leggiMetodo,
  };
}
