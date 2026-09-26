/**
 * EVIDENZIA · il foglio da tastiera (interaction-designer; CD 4.4,
 * ux-architect 5.3, 6.2, 6.3).
 *
 * - Frecce, Pagina su/giù, Home/Fine: native del contenitore scorrevole
 *   (`tabindex="0"`), qui non si toccano.
 * - `+` e `-` con il fuoco dentro il foglio: Leggi / Pagina intera. Non sono
 *   scorciatoie globali (WCAG 2.1.4: attive solo col fuoco sul componente);
 *   mai con Ctrl/Cmd/Alt (Ctrl + `+` è lo zoom del browser e resta suo);
 *   mai dentro un campo. Un tasto tenuto giù non ripete (anti-lampeggio,
 *   vedi cambioVista.ts).
 * - Fuoco da tastiera su un elemento dentro un annuncio: il foglio mostra
 *   l'annuncio intero, non solo il bottone (`mostraElemento`, con gli
 *   scroll-padding dello scaffold per molo e ConceptBackButton). Con il
 *   mouse non si sposta nulla: chi clicca vede già ciò che clicca.
 * - Fuoco che entra nel foglio in Pagina intera: si torna a Leggi centrati
 *   sull'elemento (la regione live lo dice, via `impostaVista`).
 * Vale anche nella colonna (< 640 px): lì scorre la finestra e `+`/`-` non
 * fanno nulla.
 */

import { useEffect, type RefObject } from 'react';
import { aCoordinateContenuto, mostraElemento } from '../core/scroller';
import { store } from '../state/store';
import { chiediVista } from './cambioVista';

/** Margine intorno all'annuncio mostrato (px), oltre agli scroll-padding. */
const MARGINE_FUOCO = 16;

function editabile(el: EventTarget | null): boolean {
  return el instanceof Element && el.closest('input, textarea, select, [contenteditable="true"]') !== null;
}

function fuocoDaTastiera(el: Element): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

/** Centro di un elemento in coordinate del contenuto non scalato. */
function centroDi(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return aCoordinateContenuto(r.left + r.width / 2, r.top + r.height / 2);
}

export function useTastieraFoglio(scrollerRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = scrollerRef.current;
    if (el === null) return undefined;

    const suKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (editabile(e.target)) return;
      const s = store.get();
      if (s.layout !== 'foglio') return;
      const piu = e.key === '+' || e.key === '=' || e.code === 'NumpadAdd';
      const meno = e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract';
      if (!piu && !meno) return;
      e.preventDefault();
      if (e.repeat) return;
      if (meno) {
        chiediVista('intera');
        return;
      }
      const attivo = document.activeElement;
      const punto =
        attivo !== null && attivo !== el && el.contains(attivo)
          ? centroDi(attivo)
          : (() => {
              const r = el.getBoundingClientRect();
              return aCoordinateContenuto(r.left + r.width / 2, r.top + r.height / 2);
            })();
      chiediVista('leggi', punto);
    };

    const suFocusIn = (e: FocusEvent): void => {
      const bersaglio = e.target;
      if (!(bersaglio instanceof HTMLElement) || bersaglio === el) return;
      const s = store.get();
      const annuncio = bersaglio.closest<HTMLElement>('[data-evd-annuncio]');
      const daMostrare = annuncio ?? bersaglio;

      if (s.layout === 'foglio' && s.vista === 'intera') {
        chiediVista('leggi', centroDi(daMostrare), { forza: true });
        return;
      }
      if (!fuocoDaTastiera(bersaglio)) return;
      if (annuncio !== null) mostraElemento(annuncio, MARGINE_FUOCO);
    };

    el.addEventListener('keydown', suKeyDown);
    el.addEventListener('focusin', suFocusIn);
    return () => {
      el.removeEventListener('keydown', suKeyDown);
      el.removeEventListener('focusin', suFocusIn);
    };
  }, [scrollerRef]);
}
