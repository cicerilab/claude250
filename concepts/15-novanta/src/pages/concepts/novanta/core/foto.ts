/**
 * NOVANTA · foto pronte prima della dissolvenza (tech-architect §9.4).
 *
 * Dopo l'evento `load` della pagina e in un momento di quiete
 * (`requestIdleCallback`, 2000 ms di tetto; Safari `setTimeout` 500 ms),
 * decodifica le foto degli angoli che non sono in vista al primo frame, con
 * lo stesso `srcset`/`sizes` che usano le sezioni (`SIZES_FOTO`): quando il
 * braccio ci arriva, la dissolvenza non mostra mai un'immagine a metà.
 * Solo Novanta.tsx. Nessun accesso al browser a livello di modulo.
 */

import { FOTO, type ChiaveFoto } from '../assets/foto';

/**
 * `sizes` delle foto a filo del bordo (280 px su desktop) e della fascia a
 * 375 (tutta la larghezza meno i margini). Le sezioni usano QUESTO valore,
 * così la foto decodificata qui è la stessa che mostrano.
 */
export const SIZES_FOTO = '(min-width: 47.5em) 280px, calc(100vw - 40px)';

type FinestraIdle = Window & {
  requestIdleCallback?: (fn: () => void, o?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

function decodifica(src: string, srcset: string): void {
  const img = new Image();
  img.decoding = 'async';
  img.sizes = SIZES_FOTO;
  img.srcset = srcset;
  img.src = src;
  img.decode().catch(() => undefined);
}

/** Prepara le foto delle chiavi date (di solito quelle non visibili all'arrivo). Restituisce la pulizia. */
export function preparaFoto(chiavi: readonly ChiaveFoto[]): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const w = window as FinestraIdle;
  let idle = 0;
  let timer = 0;
  let chiuso = false;

  const esegui = (): void => {
    if (chiuso) return;
    for (const k of chiavi) {
      const f = FOTO[k];
      if (f === undefined) continue;
      decodifica(f.src, f.srcset);
      if (f.fascia !== undefined) decodifica(f.fascia.src, f.fascia.srcset);
    }
  };

  const programma = (): void => {
    if (typeof w.requestIdleCallback === 'function') idle = w.requestIdleCallback(esegui, { timeout: 2000 });
    else timer = window.setTimeout(esegui, 500);
  };

  if (document.readyState === 'complete') programma();
  else window.addEventListener('load', programma, { once: true });

  return () => {
    chiuso = true;
    window.removeEventListener('load', programma);
    if (idle !== 0) w.cancelIdleCallback?.(idle);
    window.clearTimeout(timer);
  };
}
