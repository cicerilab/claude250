/**
 * EVIDENZIA · il pizzico a due dita sul foglio, solo tablet (CD 4.4,
 * ux-architect 6.3; trend-researcher R4).
 *
 * Due soli livelli: allargare le dita → Leggi (centrato fra le dita);
 * stringerle → Pagina intera. Uno scatto per gesto, niente zoom libero.
 *
 * Come: il CSS (interaction.css) dà al foglio `touch-action: pan-x pan-y`,
 * quindi il browser non fa il suo zoom dentro il foglio ma continua a
 * scorrere con un dito. Ascoltiamo gli eventi touch passivi (arrivano anche
 * durante lo scorrimento nativo) e misuriamo la distanza tra le dita.
 * Nessun `preventDefault`, nessun `user-scalable=no`: lo zoom del browser
 * fuori dal foglio, nella scheda e nel giro resta intatto (WCAG 1.4.4).
 * Solo `layout = 'foglio'` (≥ 640 px); nella colonna non si intercetta mai.
 */

import { useEffect, type RefObject } from 'react';
import { aCoordinateContenuto } from '../core/scroller';
import { store } from '../state/store';
import { chiediVista } from './cambioVista';

/** Rapporto di distanza oltre cui il pizzico decide. */
const CHIUDI = 0.78;
const APRI = 1.28;

interface Pizzico {
  d0: number;
  deciso: boolean;
}

function distanza(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export function usePizzico(scrollerRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = scrollerRef.current;
    if (el === null) return undefined;

    let p: Pizzico | null = null;

    const suStart = (e: TouchEvent): void => {
      if (store.get().layout !== 'foglio') return;
      if (e.touches.length !== 2) {
        if (e.touches.length > 2) p = null;
        return;
      }
      const a = e.touches[0];
      const b = e.touches[1];
      if (a === undefined || b === undefined) return;
      const d0 = distanza(a, b);
      p = d0 > 0 ? { d0, deciso: false } : null;
    };

    const suMove = (e: TouchEvent): void => {
      if (p === null || p.deciso || e.touches.length !== 2) return;
      const a = e.touches[0];
      const b = e.touches[1];
      if (a === undefined || b === undefined) return;
      const rapporto = distanza(a, b) / p.d0;
      if (rapporto <= CHIUDI) {
        p.deciso = true;
        chiediVista('intera');
      } else if (rapporto >= APRI) {
        p.deciso = true;
        chiediVista('leggi', aCoordinateContenuto((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2));
      }
    };

    const suEnd = (e: TouchEvent): void => {
      if (e.touches.length < 2) p = null;
    };

    el.addEventListener('touchstart', suStart, { passive: true });
    el.addEventListener('touchmove', suMove, { passive: true });
    el.addEventListener('touchend', suEnd, { passive: true });
    el.addEventListener('touchcancel', suEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', suStart);
      el.removeEventListener('touchmove', suMove);
      el.removeEventListener('touchend', suEnd);
      el.removeEventListener('touchcancel', suEnd);
    };
  }, [scrollerRef]);
}
