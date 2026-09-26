/**
 * CONTROPELO · swipe orizzontale sulla mensola → specchio vicino.
 *
 * Creative-director §6.1 e ux-architect §2.1: sul vetro un dito pulisce e
 * basta; per girare la testa col dito si trascina **sulla mensola**. È
 * un'alternativa ai nomi dei barbieri, mai l'unico modo (la tastiera usa la
 * tablist, il mouse i nomi o il bordo del vicino).
 *
 * - Solo dito e penna (col mouse si clicca un nome).
 * - Direzione come una pila di fogli: trascinare verso sinistra porta allo
 *   specchio di destra (la parete scorre sotto il dito), verso destra a
 *   quello di sinistra. Ai bordi non succede nulla: la parete non gira in
 *   tondo.
 * - Soglia: 48 px, oppure un colpo veloce ≥ 0,35 px/ms con almeno 16 px.
 * - Se il gesto parte più verticale che orizzontale viene lasciato al
 *   browser (zoom, eventuale scroll della vetrina lunga).
 * - Uno swipe riuscito annulla il clic sul nome o sul bottone da cui è
 *   partito (`annullaClic.ts`).
 * - Solo in layout "fisso": in vetrina lunga la tablist va a capo e lo swipe
 *   non serve.
 * - `touch-action: pan-y pinch-zoom` sulla mensola (`.ctp-ix-mensola` in
 *   `interaction.css`): i movimenti orizzontali arrivano come eventi, lo
 *   zoom a due dita resta del browser.
 * - Nessun movimento che segue il dito: la parete si sposta solo a gesto
 *   concluso, con il pan del motion-designer (MOTION_INTENSITY 4).
 *
 * Uso (section-builder-mensola):
 *
 *   const mensolaRef = useRef<HTMLElement>(null);
 *   useSwipeMensola(mensolaRef);
 *   <nav ref={mensolaRef} className="ctp-mensola ctp-ix-mensola"> … </nav>
 */

import { useEffect, type RefObject } from 'react';
import { store } from '../state/store';
import { creaAnnullaClic, SOGLIA_TRASCINAMENTO_PX } from './annullaClic';
import { chiediSpecchio, indiceValido, specchioDestinazione } from './cadenza';

export const SWIPE = {
  /** Distanza orizzontale che basta da sola (px CSS). */
  distanza: 48,
  /** Velocità di un colpo (px/ms)… */
  velocita: 0.35,
  /** …con almeno questa distanza (px CSS). */
  distanzaColpo: 16,
  /** Finestra su cui si misura la velocità finale (ms). */
  finestraVelocita: 80,
} as const;

interface Campione {
  x: number;
  t: number;
}

interface Gesto {
  id: number;
  x0: number;
  y0: number;
  deciso: 'orizzontale' | 'verticale' | null;
  campioni: Campione[];
}

export function useSwipeMensola(ref: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    const annulla = creaAnnullaClic(el);
    let gesto: Gesto | null = null;

    const suDown = (e: PointerEvent): void => {
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      if (!e.isPrimary || store.get().layout !== 'fisso') {
        gesto = null;
        return;
      }
      gesto = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        deciso: null,
        campioni: [{ x: e.clientX, t: e.timeStamp }],
      };
    };

    const suMove = (e: PointerEvent): void => {
      const g = gesto;
      if (g === null || e.pointerId !== g.id) return;
      const dx = e.clientX - g.x0;
      const dy = e.clientY - g.y0;
      if (g.deciso === null && Math.hypot(dx, dy) > SOGLIA_TRASCINAMENTO_PX) {
        g.deciso = Math.abs(dx) >= Math.abs(dy) ? 'orizzontale' : 'verticale';
      }
      if (g.deciso === 'verticale') {
        gesto = null;
        return;
      }
      g.campioni.push({ x: e.clientX, t: e.timeStamp });
      // Tiene solo gli ultimi campioni utili alla velocità finale.
      const limite = e.timeStamp - SWIPE.finestraVelocita * 2;
      while (g.campioni.length > 2 && (g.campioni[0]?.t ?? limite) < limite) g.campioni.shift();
    };

    const suUp = (e: PointerEvent): void => {
      const g = gesto;
      gesto = null;
      if (g === null || e.pointerId !== g.id || g.deciso !== 'orizzontale') return;
      const dx = e.clientX - g.x0;
      const ultimo: Campione = { x: e.clientX, t: e.timeStamp };
      const inizio = g.campioni.find((c) => ultimo.t - c.t <= SWIPE.finestraVelocita) ?? g.campioni[0] ?? ultimo;
      const dtFinale = Math.max(1, ultimo.t - inizio.t);
      const velocita = Math.abs(ultimo.x - inizio.x) / dtFinale;
      const riuscito =
        Math.abs(dx) >= SWIPE.distanza || (Math.abs(dx) >= SWIPE.distanzaColpo && velocita >= SWIPE.velocita);
      // Un trascinamento oltre 8 px non preme mai il bottone da cui è partito.
      annulla.arma();
      if (!riuscito) return;
      const da = specchioDestinazione();
      const a = indiceValido(dx < 0 ? da + 1 : da - 1);
      if (a !== da) chiediSpecchio(a, 'swipe');
    };

    const suCancel = (e: PointerEvent): void => {
      if (gesto !== null && e.pointerId === gesto.id) gesto = null;
    };

    el.addEventListener('pointerdown', suDown, { passive: true });
    el.addEventListener('pointermove', suMove, { passive: true });
    el.addEventListener('pointerup', suUp, { passive: true });
    el.addEventListener('pointercancel', suCancel, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', suDown);
      el.removeEventListener('pointermove', suMove);
      el.removeEventListener('pointerup', suUp);
      el.removeEventListener('pointercancel', suCancel);
      annulla.stacca();
      gesto = null;
    };
  }, [ref]);
}
