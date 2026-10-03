/**
 * NOVANTA · misura del viewport (tech-architect §3, §7.4).
 *
 * `osservaViewport(onCambio)`: scrive `runtime.viewport` (w, h, vvH, dpr) su
 * `resize` della finestra e del `visualViewport` (tastiera del telefono),
 * scrive `--nov-vv-h` sulla radice (elemento foglia per quella variabile,
 * marcato `data-nov-var`), e chiama `onCambio` con debounce di 100 ms. Solo
 * Novanta.tsx. Nessun accesso al browser a livello di modulo.
 */

import { runtime } from '../state/runtime';

export const ATTESA_RESIZE = 100;

export function misuraViewport(): void {
  if (typeof window === 'undefined') return;
  const vv = window.visualViewport;
  runtime.viewport.w = window.innerWidth;
  runtime.viewport.h = window.innerHeight;
  runtime.viewport.vvH = vv !== null && vv !== undefined ? Math.round(vv.height) : window.innerHeight;
  runtime.viewport.dpr = window.devicePixelRatio || 1;
}

function scriviVvH(root: HTMLElement): void {
  const v = `${runtime.viewport.vvH}px`;
  if (root.style.getPropertyValue('--nov-vv-h') !== v) root.style.setProperty('--nov-vv-h', v);
}

/**
 * Misura subito e poi a ogni resize. `onCambio` arriva con debounce (mai per
 * frame): core/modo.ts ci ricalcola perno e vista. Restituisce la pulizia.
 */
export function osservaViewport(root: HTMLElement, onCambio: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  let timer = 0;
  const applica = (): void => {
    misuraViewport();
    scriviVvH(root);
  };
  const suResize = (): void => {
    applica();
    window.clearTimeout(timer);
    timer = window.setTimeout(onCambio, ATTESA_RESIZE);
  };
  applica();
  window.addEventListener('resize', suResize);
  const vv = window.visualViewport;
  vv?.addEventListener('resize', suResize);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener('resize', suResize);
    vv?.removeEventListener('resize', suResize);
    root.style.removeProperty('--nov-vv-h');
  };
}
