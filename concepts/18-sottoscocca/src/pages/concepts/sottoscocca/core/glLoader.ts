/**
 * SOTTOSCOCCA · se e quando caricare il WebGL (tech-architect §9.1).
 *
 * `decidiGL()` è pura: dice se il WebGL va caricato e, se no, perché.
 * `caricaGL()` aspetta l'evento `load` della pagina E un momento di quiete
 * (`requestIdleCallback` con timeout 1500 ms; senza rIC, come su Safari,
 * `setTimeout` 300 ms), poi fa `import('../webgl')`. Il chunk (three +
 * webgl/) non è mai nel percorso critico. Il tetto degli 8 s (import +
 * modello + primo frame) lo tiene Radice.tsx.
 *
 * Con reduced motion il WebGL si carica lo stesso (dissolvenze tra
 * inquadrature ferme, motion-designer §7).
 */

import type { ComponentType } from 'react';
import type { EsitoWebGL, ForzaturaGL } from './capabilities';

export type MotivoNoGL = 'url' | 'save-data' | 'nessun-contesto' | 'niente-highp' | 'nessuna-finestra' | 'errore-import';

export interface DecisioneGL {
  readonly carica: boolean;
  readonly motivo: MotivoNoGL | null;
}

export interface IngressiDecisione {
  readonly forzatura: ForzaturaGL;
  readonly saveData: boolean;
  readonly webgl: EsitoWebGL;
}

/** `?gl=0` spegne sempre; senza contesto (o highp) mai; `saveData` spegne salvo `?gl=1`. */
export function decidiGL({ forzatura, saveData, webgl }: IngressiDecisione): DecisioneGL {
  if (forzatura === 'off') return { carica: false, motivo: 'url' };
  if (!webgl.ok) return { carica: false, motivo: webgl.motivo ?? 'nessun-contesto' };
  if (saveData && forzatura !== 'on') return { carica: false, motivo: 'save-data' };
  return { carica: true, motivo: null };
}

/**
 * Il componente esportato di default da `webgl/index.ts` (shader-engineer):
 * nessuna prop obbligatoria; legge store e runtime, registra la proiezione
 * nella fase `update` e il render nella fase `render`, e quando il primo
 * frame è a schermo chiama `impostaGL('on')`.
 */
export type ComponenteGL = ComponentType;

const IDLE_TIMEOUT = 1500;
const SENZA_IDLE_RITARDO = 300;

function attendiLoad(segnale: AbortSignal): Promise<void> {
  return new Promise<void>((risolvi) => {
    if (segnale.aborted || document.readyState === 'complete') {
      risolvi();
      return;
    }
    const fatto = (): void => {
      window.removeEventListener('load', fatto);
      risolvi();
    };
    window.addEventListener('load', fatto, { once: true });
    segnale.addEventListener('abort', fatto, { once: true });
  });
}

function attendiQuiete(segnale: AbortSignal): Promise<void> {
  return new Promise<void>((risolvi) => {
    if (segnale.aborted) {
      risolvi();
      return;
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => risolvi(), { timeout: IDLE_TIMEOUT });
      segnale.addEventListener('abort', () => {
        w.cancelIdleCallback?.(id);
        risolvi();
      });
      return;
    }
    const id = window.setTimeout(risolvi, SENZA_IDLE_RITARDO);
    segnale.addEventListener('abort', () => {
      window.clearTimeout(id);
      risolvi();
    });
  });
}

/**
 * Carica il chunk WebGL dopo `load` e quiete. Risolve con il componente, o
 * con null se annullato (smontaggio) o se l'import fallisce (allora `onErrore`).
 */
export async function caricaGL(segnale: AbortSignal, onErrore?: (errore: unknown) => void): Promise<ComponenteGL | null> {
  if (typeof window === 'undefined') return null;
  await attendiLoad(segnale);
  if (segnale.aborted) return null;
  await attendiQuiete(segnale);
  if (segnale.aborted) return null;
  try {
    const modulo = await import('../webgl');
    if (segnale.aborted) return null;
    return modulo.default as ComponenteGL;
  } catch (errore) {
    onErrore?.(errore);
    return null;
  }
}
