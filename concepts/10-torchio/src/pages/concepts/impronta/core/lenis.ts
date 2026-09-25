/**
 * IMPRONTA · scroll liscio (lenis) e sorgente di `runtime.scrollY`.
 *
 * Il sito vero NON ha un lenis globale (docs/integrazione-sito.md punto 4):
 * il concept ne crea uno suo al mount di Impronta.tsx e lo distrugge allo
 * smontaggio, ripristinando lo stato di <html>/<body> che ha toccato.
 *
 * - lenis si carica con `import('lenis')` DINAMICO (giro 2, performance-auditor
 *   P3: ~8 KB gz fuori dal chunk iniziale). Finché non arriva, `getLenis()`
 *   resta null e lo scroll è nativo, esattamente come con reduced motion:
 *   tutti i chiamanti (ticker, motion/useScrollProgress, Testata) gestiscono
 *   già null;
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

import type Lenis from 'lenis';
import { runtime } from '../state/runtime';
import { ticker } from './ticker';

let istanza: Lenis | null = null;

/** L'istanza creata da Impronta.tsx, o null (reduced motion, prerender, prima del mount o del caricamento, dopo lo smontaggio). */
export function getLenis(): Lenis | null {
  return istanza;
}

export interface OpzioniScroll {
  /** true = niente lenis, scroll nativo (reduced motion). */
  readonly ridotto: boolean;
}

/**
 * Avvia la sorgente di scroll. Restituisce la funzione di smontaggio, che
 * distrugge lenis (o annulla il caricamento in corso) e rimette com'erano gli
 * stili inline di <html> toccati. Sicura con StrictMode: un secondo avvio
 * distrugge il primo.
 */
export function avviaScroll({ ridotto }: OpzioniScroll): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const html = document.documentElement;
  const scrollBehaviorPrima = html.style.scrollBehavior;

  runtime.scrollY = window.scrollY;

  // Scroll nativo: con reduced motion per sempre, altrimenti finché lenis
  // non è arrivato. Il listener sveglia soltanto il ticker.
  const sveglia = (): void => {
    ticker.wake();
  };
  window.addEventListener('scroll', sveglia, { passive: true });
  let nativoAttivo = true;
  const togliNativo = (): void => {
    if (!nativoAttivo) return;
    nativoAttivo = false;
    window.removeEventListener('scroll', sveglia);
  };
  ticker.wake();

  if (ridotto) return togliNativo;

  if (istanza !== null) {
    istanza.destroy();
    istanza = null;
  }

  let annullato = false;
  let lenis: Lenis | null = null;
  let togliEventi: (() => void) | null = null;

  import('lenis').then(
    ({ default: CostruttoreLenis }) => {
      if (annullato) return;
      // lenis vuole `scroll-behavior: auto` sulla radice (altrimenti il
      // browser anima di suo ogni scrollTo): stile inline, ripristinato.
      html.style.scrollBehavior = 'auto';
      const nuova = new CostruttoreLenis({
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
      lenis = nuova;
      istanza = nuova;
      const togliVirtuale = nuova.on('virtual-scroll', sveglia);
      const togliScroll = nuova.on('scroll', sveglia);
      togliEventi = () => {
        togliVirtuale();
        togliScroll();
      };
      togliNativo();
      ticker.wake();
    },
    (errore: unknown) => {
      // Senza lenis il sito funziona uguale: resta lo scroll nativo.
      if (import.meta.env.DEV) console.error('[impronta/lenis] caricamento fallito', errore);
    },
  );

  return () => {
    annullato = true;
    togliNativo();
    togliEventi?.();
    if (lenis !== null) {
      lenis.destroy();
      if (istanza === lenis) istanza = null;
      html.style.scrollBehavior = scrollBehaviorPrima;
    }
    runtime.scrollY = window.scrollY;
  };
}
