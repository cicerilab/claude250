/**
 * IMBRUNIRE · parallasse del tetto (CD §4 "accenno di volume").
 *
 * Il tetto e il lato destro della scala ruotano in `rotateY` seguendo il
 * puntatore, al massimo 2°. Solo sezione (desktop), solo puntatore fine,
 * solo con la camera ferma, spenta con reduced motion. Nient'altro segue il
 * puntatore.
 *
 * Scrive una sola variabile, `--imb-parallasse` (es. "1.234deg"), e solo
 * sull'elemento foglia passato, che deve avere l'attributo `data-imb-var`.
 * La scrive nella fase `write` del ticker e solo quando il valore cambia. Il
 * CSS del palazzo la usa così:
 *   .imb-root .imb-palazzo__tetto[data-imb-var] {
 *     transform: perspective(1400px) rotateY(var(--imb-parallasse, 0deg));
 *   }
 *
 * Legge `runtime.puntatore` (normalizzato -1..1, lo scrive interaction/*).
 * Per non dipendere da chi scrive il puntatore, ascolta anche `pointermove`
 * in modo passivo solo per svegliare il ticker (non scrive nulla).
 */

import { useEffect, type RefObject } from 'react';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { useImbrunire } from '../state/store';
import { clamp, seguiDt } from './easing';
import { PARALLASSE } from './choreography';

export interface OpzioniParallasse {
  /** rotazione massima in gradi per questo elemento (≤ 2; il lato della scala usa 1,2) */
  gradiMax?: number;
  /** verso: 1 il tetto segue il puntatore, -1 lo contrasta (lato della scala) */
  verso?: 1 | -1;
}

function formatta(gradi: number): string {
  return `${gradi.toFixed(PARALLASSE.decimali)}deg`;
}

export function useParallasse(ref: RefObject<HTMLElement>, o: OpzioniParallasse = {}): void {
  const consentita = useImbrunire((s) => s.layout === 'sezione' && !s.reducedMotion);
  // Con la camera in viaggio o dentro una stanza il tetto torna diritto
  // scivolando (nessun salto), poi il ticker dorme.
  const ferma = useImbrunire((s) => s.camera.fase === 'ferma');
  const gradiMax = clamp(o.gradiMax ?? PARALLASSE.gradiMax, 0, PARALLASSE.gradiMax);
  const verso = o.verso ?? 1;

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;

    const fine =
      typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const attiva = consentita && fine && gradiMax > 0;

    // Riparte dal valore già scritto (cambio di `ferma`): nessun salto.
    const letto = Number.parseFloat(el.style.getPropertyValue('--imb-parallasse'));
    let corrente = Number.isFinite(letto) ? letto : 0;
    let scritto = '';

    const scrivi = (gradi: number): void => {
      const valore = formatta(gradi);
      if (valore === scritto) return;
      scritto = valore;
      el.style.setProperty('--imb-parallasse', valore);
    };

    if (!attiva) {
      // Stato finale immediato: tetto diritto, nessun frame richiesto.
      scrivi(0);
      return () => {
        el.style.removeProperty('--imb-parallasse');
      };
    }

    const obiettivo = (): number => {
      const p = runtime.puntatore;
      if (!ferma || !p.attivo || p.tipo !== 'mouse') return 0;
      return clamp(p.x, -1, 1) * gradiMax * verso;
    };

    const aggiorna = (dt: number): boolean => {
      const meta = obiettivo();
      corrente = seguiDt(corrente, meta, PARALLASSE.inseguimento, dt);
      if (Math.abs(meta - corrente) < PARALLASSE.riposo) {
        corrente = meta;
        return false;
      }
      return true;
    };

    const scriviFase = (): boolean => {
      scrivi(corrente);
      return false;
    };

    if (corrente !== 0) scrivi(corrente);
    const togliAggiorna = ticker.add(aggiorna, 'update');
    const togliScrivi = ticker.add(scriviFase, 'write');

    const sveglia = (): void => {
      ticker.wake();
    };
    window.addEventListener('pointermove', sveglia, { passive: true });
    document.documentElement.addEventListener('pointerleave', sveglia, { passive: true });

    return () => {
      window.removeEventListener('pointermove', sveglia);
      document.documentElement.removeEventListener('pointerleave', sveglia);
      togliAggiorna();
      togliScrivi();
      // Il valore resta sull'elemento: l'effetto successivo riparte da lì.
    };
  }, [ref, consentita, ferma, gradiMax, verso]);
}
