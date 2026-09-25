/**
 * IMPRONTA · scroll liscio (lenis) e sorgente di `runtime.scrollY`.
 *
 * Il sito vero NON ha un lenis globale (docs/integrazione-sito.md punto 4):
 * il concept ne crea uno suo al mount di Impronta.tsx e lo distrugge allo
 * smontaggio, ripristinando lo stato di <html>/<body> che ha toccato.
 *
 * - lenis nasce con `autoRaf: false`: lo guida il ticker (`lenis.raf(now)`
 *   all'inizio di ogni frame, core/ticker.ts);
 * - ogni input (`virtual-scroll`) e ogni scroll (`scroll`) svegliano il
 *   ticker;
 * - con reduced motion lenis NON si crea (tech-architect §9.7): un solo
 *   listener `scroll` passivo fa `ticker.wake()` e nient'altro (nessun calcolo
 *   nel listener); il valore si legge da `window.scrollY` nel frame.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import Lenis from 'lenis';
import { runtime } from '../state/runtime';
import { ticker } from './ticker';

let istanza: Lenis | null = null;

/** L'istanza creata da Impronta.tsx, o null (reduced motion, prerender, prima del mount, dopo lo smontaggio). */
export function getLenis(): Lenis | null {
  return istanza;
}

export interface OpzioniScroll {
  /** true = niente lenis, scroll nativo (reduced motion). */
  readonly ridotto: boolean;
}

/**
 * Avvia la sorgente di scroll. Restituisce la funzione di smontaggio, che
 * distrugge lenis e rimette com'erano gli stili inline di <html> toccati.
 * Sicura con StrictMode: un secondo avvio distrugge il primo.
 */
export function avviaScroll({ ridotto }: OpzioniScroll): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const html = document.documentElement;
  const scrollBehaviorPrima = html.style.scrollBehavior;

  runtime.scrollY = window.scrollY;

  if (ridotto) {
    const sveglia = (): void => {
      ticker.wake();
    };
    window.addEventListener('scroll', sveglia, { passive: true });
    ticker.wake();
    return () => {
      window.removeEventListener('scroll', sveglia);
    };
  }

  if (istanza !== null) {
    istanza.destroy();
    istanza = null;
  }

  // lenis vuole `scroll-behavior: auto` sulla radice (altrimenti il browser
  // anima di suo ogni scrollTo): stile inline, ripristinato allo smontaggio.
  html.style.scrollBehavior = 'auto';

  const lenis = new Lenis({
    autoRaf: false,
    anchors: false,
    smoothWheel: true,
    syncTouch: false,
    lerp: 0.1,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    autoResize: true,
    stopInertiaOnNavigate: true,
  });
  istanza = lenis;

  const sveglia = (): void => {
    ticker.wake();
  };
  const togliVirtuale = lenis.on('virtual-scroll', sveglia);
  const togliScroll = lenis.on('scroll', sveglia);
  ticker.wake();

  return () => {
    togliVirtuale();
    togliScroll();
    lenis.destroy();
    if (istanza === lenis) istanza = null;
    html.style.scrollBehavior = scrollBehaviorPrima;
    runtime.scrollY = window.scrollY;
  };
}
