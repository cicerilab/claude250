/**
 * CONTROPELO · un solo hook per il vetro di uno specchio.
 *
 * Il section-builder-parete lo chiama in `Specchio.tsx` sul contenitore del
 * vetro (lo stesso elemento che `VaporeCanvas` registra nel motore):
 *
 *   const vetroRef = useRef<HTMLDivElement>(null);
 *   useVetro(vetroRef, indice);
 *   <div ref={vetroRef} className="ctp-specchio__vetro ctp-ix-vetro"> … </div>
 *
 * Collega il gesto di pulire (`pulire.ts`) e la pulizia da fuoco
 * (`fuocoPulisce.ts`). Tutti e tre gli specchi lo montano: sugli specchi non
 * attivi il gesto non fa nulla (`vetroPulibile`) e il fuoco non entra
 * (`inert`).
 */

import { useEffect, type RefObject } from 'react';
import type { IndiceSpecchio } from '../state/store';
import { collegaPulitura } from './pulire';
import { collegaFuocoPulisce } from './fuocoPulisce';

export function useVetro(ref: RefObject<HTMLElement>, indice: IndiceSpecchio): void {
  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    const staccaPulitura = collegaPulitura(el, indice);
    const staccaFuoco = collegaFuocoPulisce(el, indice);
    return () => {
      staccaPulitura();
      staccaFuoco();
    };
  }, [ref, indice]);
}
