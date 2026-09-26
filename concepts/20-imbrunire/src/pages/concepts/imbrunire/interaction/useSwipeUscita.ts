/**
 * IMBRUNIRE · uscire dalla stanza con uno swipe verso il basso sulla foto
 * (interaction-designer; creative-director §5.3 "Come si naviga", ux-architect 2.3, 7.3).
 *
 * Solo dito e penna (col mouse si esce con "Torna al palazzo" o Esc). Il gesto
 * è una scorciatoia: il bottone "Torna al palazzo" resta sempre l'alternativa.
 *
 * - L'area (la foto a tutto schermo dello strato Dentro, `propsArea`) ha
 *   `touch-action: pan-x pinch-zoom` (interaction.css): il movimento verticale
 *   del dito è nostro, lo zoom a due dita resta del browser.
 * - Mentre il dito scende, la foto lo segue con resistenza (40% dello
 *   spostamento) tramite `--imb-ix-swipe-y` sull'area (elemento marcato
 *   data-imb-var, un involucro NON 3D: la camera anima le facce, noi no).
 * - Si esce se lo spostamento verso il basso supera max(96 px, 18% dello
 *   schermo), oppure con un lancio (≥ 0,6 px/ms) di almeno 40 px, in entrambi
 *   i casi con direzione quasi verticale (|dx| < 0,75·dy). Altrimenti la foto
 *   torna al suo posto (transizione CSS).
 * - Un secondo dito annulla (è un pizzico). Con reduced motion la foto non
 *   segue il dito: resta solo la soglia.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ticker } from '../core/ticker';
import { useImbrunire } from '../state/store';

const SOGLIA_MIN_PX = 96;
const SOGLIA_QUOTA = 0.18;
const LANCIO_PX_MS = 0.6;
const LANCIO_MIN_PX = 40;
const DIREZIONE = 0.75;
const RESISTENZA = 0.4;
/** Spostamento prima di decidere se il gesto è nostro. */
const AVVIO_PX = 10;
const FINESTRA_VELOCITA_MS = 90;

export interface OpzioniSwipeUscita {
  /** false = nessun gesto (sezione, stanza in viaggio, foglio a tutta altezza sopra la foto). */
  attivo: boolean;
  /** Esce dalla stanza (di norma chiudiStratoAlto() o vai({ tipo: 'palazzo' })). */
  onEsci: () => void;
}

export interface PropsAreaSwipe {
  ref: (el: HTMLElement | null) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  /** 'fermo' | 'segue' (il dito sta tirando giù) | 'spento'. */
  'data-imb-ix-swipe': 'fermo' | 'segue' | 'spento';
  'data-imb-var': '';
}

interface Tocco {
  id: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  nostro: boolean;
  campioni: { t: number; y: number }[];
}

export function useSwipeUscita(o: OpzioniSwipeUscita): PropsAreaSwipe {
  const ridotto = useImbrunire((s) => s.reducedMotion);
  const [segue, setSegue] = useState(false);

  const opz = useRef(o);
  opz.current = o;
  const ridottoRef = useRef(ridotto);
  ridottoRef.current = ridotto;

  const nodo = useRef<HTMLElement | null>(null);
  const tocco = useRef<Tocco | null>(null);
  const daScrivere = useRef<number | null>(null);
  const scritta = useRef('');

  const ref = useCallback((el: HTMLElement | null) => {
    nodo.current = el;
  }, []);

  useEffect(() => {
    const scrivi = (): boolean => {
      const y = daScrivere.current;
      const el = nodo.current;
      if (y === null || !el) return false;
      daScrivere.current = null;
      const valore = `${Math.round(y)}px`;
      if (valore !== scritta.current) {
        scritta.current = valore;
        el.style.setProperty('--imb-ix-swipe-y', valore);
      }
      return false;
    };
    return ticker.add(scrivi, 'write');
  }, []);

  const azzera = useCallback(() => {
    tocco.current = null;
    setSegue(false);
    daScrivere.current = 0;
    ticker.wake();
  }, []);

  /* spento a metà gesto (es. il foglio va a tutta altezza): la foto torna a posto */
  useEffect(() => {
    if (!o.attivo && tocco.current !== null) azzera();
  }, [o.attivo, azzera]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!opz.current.attivo) return;
      if (e.pointerType === 'mouse') return;
      if (tocco.current !== null) {
        // secondo dito: è un pizzico, non uno swipe
        if (e.pointerId !== tocco.current.id) azzera();
        return;
      }
      const bersaglio = e.target instanceof Element ? e.target : null;
      if (bersaglio && bersaglio.closest('button, a[href], input, select, textarea, [role="option"]')) return;
      const t = performance.now();
      tocco.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, nostro: false, campioni: [{ t, y: e.clientY }] };
    },
    [azzera],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const p = tocco.current;
    if (p === null || e.pointerId !== p.id) return;
    p.x = e.clientX;
    p.y = e.clientY;
    const t = performance.now();
    p.campioni.push({ t, y: e.clientY });
    while (p.campioni.length > 2 && t - (p.campioni[0]?.t ?? t) > FINESTRA_VELOCITA_MS) p.campioni.shift();
    const dx = p.x - p.x0;
    const dy = p.y - p.y0;
    if (!p.nostro) {
      if (Math.abs(dx) < AVVIO_PX && Math.abs(dy) < AVVIO_PX) return;
      if (dy > 0 && Math.abs(dx) < dy * DIREZIONE) {
        p.nostro = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_e) {
          /* già rilasciato */
        }
        setSegue(true);
      } else {
        tocco.current = null; // orizzontale o verso l'alto: non è uno swipe d'uscita
        return;
      }
    }
    if (!ridottoRef.current) {
      daScrivere.current = Math.max(0, dy) * RESISTENZA;
      ticker.wake();
    }
  }, []);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const p = tocco.current;
      if (p === null || e.pointerId !== p.id) return;
      const dx = p.x - p.x0;
      const dy = p.y - p.y0;
      const primo = p.campioni[0];
      const ultimo = p.campioni[p.campioni.length - 1];
      const v = primo && ultimo && ultimo.t - primo.t > 8 ? (ultimo.y - primo.y) / (ultimo.t - primo.t) : 0;
      const soglia = Math.max(SOGLIA_MIN_PX, SOGLIA_QUOTA * window.innerHeight);
      const verticale = dy > 0 && Math.abs(dx) < dy * DIREZIONE;
      const esce = p.nostro && verticale && (dy >= soglia || (v >= LANCIO_PX_MS && dy >= LANCIO_MIN_PX));
      azzera();
      if (esce) opz.current.onEsci();
    },
    [azzera],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const p = tocco.current;
      if (p === null || e.pointerId !== p.id) return;
      azzera();
    },
    [azzera],
  );

  const stato: PropsAreaSwipe['data-imb-ix-swipe'] = !o.attivo ? 'spento' : segue ? 'segue' : 'fermo';

  return useMemo(
    () => ({
      ref,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      'data-imb-ix-swipe': stato,
      'data-imb-var': '',
    }),
    [ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, stato],
  );
}
