/**
 * IMBRUNIRE · il calore di una cella e il puntatore della scena
 * (interaction-designer; creative-director §5.3 "Come si naviga", ux-architect 2.2).
 *
 * useCaloreCella
 * - Al passaggio del puntatore (mouse, penna) o al fuoco la cella "si scalda":
 *   l'attributo `data-imb-ix-calda` sulla cella accende il velo di calore
 *   (+8% di luce, 400 ms, interaction.css) e mostra "da … a notte" sotto il
 *   nome. Il dito non ha passaggio: nella torre il prezzo è sempre scritto.
 * - Anti-lampeggio (docs/ruoli-agent.md): una cella cambia calore al massimo
 *   una volta ogni 500 ms. Chi passa di corsa sul palazzo non accende e
 *   spegne dieci veli al secondo: il cambio in eccesso si applica alla fine
 *   della finestra, e se nel frattempo il puntatore è già uscito non si
 *   applica affatto.
 * - Intenzione di entrare: 150 ms di passaggio, il fuoco o un pointerdown
 *   precaricano la foto da 1600 (core/foto: new Image + decode, una volta per
 *   URL). Così all'arrivo dentro la stanza la foto è già decodificata, senza
 *   scaricare dieci foto grandi a chi passa col mouse.
 * - L'attributo si scrive sul DOM nella fase 'write' del ticker (niente
 *   render React per il calore). React non gestisce quell'attributo, quindi
 *   non lo sovrascrive.
 *
 * usePuntatoreScena
 * - Unico scrittore di `runtime.puntatore` (tech-architect §6.2): posizione
 *   normalizzata −1..1 sulla finestra per la parallasse del tetto (≤ 2°,
 *   motion/useParallasse). Solo puntatore fine, solo nella sezione, spento
 *   con reduced motion. Il ticker viene svegliato; la parallasse fa il resto.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FocusEvent as ReactFocusEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { Foto } from '../assets/foto';
import { precaricaFoto } from '../core/foto';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { useImbrunire } from '../state/store';

/** Una cella cambia calore al massimo una volta in questo intervallo. */
export const INTERVALLO_CALORE_MS = 500;
/** Passaggio del puntatore che vale come intenzione di entrare. */
export const INTENZIONE_MS = 150;

export const ATTRIBUTO_CALDA = 'data-imb-ix-calda';

/* ------------------------------------------------------------------ useCaloreCella */

export interface OpzioniCalore {
  /** Foto principale della stanza (la 1600 si precarica all'intenzione); null per androne e portico. */
  foto: Foto | null;
  /** false = la cella non si scalda (palazzo ridotto del foglio, camera in viaggio). Default true. */
  attivo?: boolean;
}

export interface PropsCalore {
  onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onFocus: (e: ReactFocusEvent<HTMLElement>) => void;
  onBlur: (e: ReactFocusEvent<HTMLElement>) => void;
}

export function useCaloreCella(o: OpzioniCalore): PropsCalore {
  const attivo = o.attivo !== false;

  const fotoRef = useRef(o.foto);
  fotoRef.current = o.foto;
  const attivoRef = useRef(attivo);
  attivoRef.current = attivo;

  const el = useRef<HTMLElement | null>(null);
  const sopra = useRef(false);
  const fuoco = useRef(false);
  const applicata = useRef(false);
  const ultimoCambio = useRef(-Infinity);
  const sopraDa = useRef<number | null>(null);
  const precaricata = useRef(false);
  const togli = useRef<(() => void) | null>(null);

  const precarica = useCallback(() => {
    if (precaricata.current) return;
    const f = fotoRef.current;
    if (!f) return;
    precaricata.current = true;
    precaricaFoto(f).catch(() => {
      // la foto mancante la gestisce la scatola (parete d'intonaco): qui si riprova alla prossima intenzione
      precaricata.current = false;
    });
  }, []);

  const passo = useCallback((): boolean => {
    const ora = performance.now();
    let ancora = false;

    const inizio = sopraDa.current;
    if (inizio !== null && !precaricata.current) {
      if (ora - inizio >= INTENZIONE_MS) {
        sopraDa.current = null;
        precarica();
      } else {
        ancora = true;
      }
    }

    const voluta = attivoRef.current && (sopra.current || fuoco.current);
    const nodo = el.current;
    if (nodo !== null && voluta !== applicata.current) {
      if (ora - ultimoCambio.current >= INTERVALLO_CALORE_MS) {
        if (voluta) nodo.setAttribute(ATTRIBUTO_CALDA, 'true');
        else nodo.removeAttribute(ATTRIBUTO_CALDA);
        applicata.current = voluta;
        ultimoCambio.current = ora;
      } else {
        ancora = true;
      }
    }

    if (!ancora && togli.current !== null) {
      togli.current();
      togli.current = null;
    }
    return ancora;
  }, [precarica]);

  const programma = useCallback(() => {
    if (togli.current === null) togli.current = ticker.add(passo, 'write');
    else ticker.wake();
  }, [passo]);

  /* la cella viene spenta (es. si entra, o il foglio usa il palazzo ridotto): torna fredda */
  useEffect(() => {
    if (!attivo && applicata.current) programma();
  }, [attivo, programma]);

  useEffect(
    () => () => {
      if (togli.current !== null) togli.current();
      togli.current = null;
    },
    [],
  );

  const onPointerEnter = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === 'touch') return;
      el.current = e.currentTarget;
      sopra.current = true;
      if (!precaricata.current) sopraDa.current = performance.now();
      programma();
    },
    [programma],
  );

  const onPointerLeave = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === 'touch') return;
      el.current = e.currentTarget;
      sopra.current = false;
      sopraDa.current = null;
      programma();
    },
    [programma],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      el.current = e.currentTarget;
      precarica();
    },
    [precarica],
  );

  const onFocus = useCallback(
    (e: ReactFocusEvent<HTMLElement>) => {
      el.current = e.currentTarget;
      fuoco.current = true;
      precarica();
      programma();
    },
    [precarica, programma],
  );

  const onBlur = useCallback(
    (e: ReactFocusEvent<HTMLElement>) => {
      el.current = e.currentTarget;
      fuoco.current = false;
      programma();
    },
    [programma],
  );

  return useMemo(
    () => ({ onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur }),
    [onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur],
  );
}

/* ------------------------------------------------------------------ usePuntatoreScena */

/**
 * Da chiamare una volta (Palazzo.tsx). Scrive runtime.puntatore dal
 * movimento del puntatore fine sulla finestra, solo nella sezione e senza
 * reduced motion; altrimenti lo lascia a riposo (attivo: false, 0,0).
 */
export function usePuntatoreScena(): void {
  const layout = useImbrunire((s) => s.layout);
  const ridotto = useImbrunire((s) => s.reducedMotion);
  const acceso = layout === 'sezione' && !ridotto;

  useEffect(() => {
    const riposo = (): void => {
      if (!runtime.puntatore.attivo && runtime.puntatore.x === 0 && runtime.puntatore.y === 0) return;
      runtime.puntatore.attivo = false;
      runtime.puntatore.x = 0;
      runtime.puntatore.y = 0;
      ticker.wake();
    };

    if (!acceso || typeof window === 'undefined') {
      riposo();
      return undefined;
    }

    const suMovimento = (e: PointerEvent): void => {
      if (e.pointerType === 'touch') {
        runtime.puntatore.tipo = 'touch';
        riposo();
        return;
      }
      const w = runtime.viewport.w > 0 ? runtime.viewport.w : window.innerWidth;
      const h = runtime.viewport.h > 0 ? runtime.viewport.h : window.innerHeight;
      if (w <= 0 || h <= 0) return;
      const x = Math.max(-1, Math.min(1, (e.clientX / w) * 2 - 1));
      const y = Math.max(-1, Math.min(1, (e.clientY / h) * 2 - 1));
      const p = runtime.puntatore;
      p.tipo = e.pointerType === 'pen' ? 'pen' : 'mouse';
      if (p.attivo && Math.abs(p.x - x) < 0.001 && Math.abs(p.y - y) < 0.001) return;
      p.x = x;
      p.y = y;
      p.attivo = true;
      ticker.wake();
    };

    const suUscita = (e: PointerEvent): void => {
      // uscita dalla finestra: relatedTarget nullo
      if (e.relatedTarget === null && e.pointerType !== 'touch') riposo();
    };

    window.addEventListener('pointermove', suMovimento, { passive: true });
    document.addEventListener('pointerout', suUscita, { passive: true });
    window.addEventListener('blur', riposo);
    return () => {
      window.removeEventListener('pointermove', suMovimento);
      document.removeEventListener('pointerout', suUscita);
      window.removeEventListener('blur', riposo);
      riposo();
    };
  }, [acceso]);
}
