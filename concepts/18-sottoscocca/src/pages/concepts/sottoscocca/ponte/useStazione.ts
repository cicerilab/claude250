/**
 * SOTTOSCOCCA · hook con cui una sezione si dichiara stazione del ponte
 * (tech-architect §6.3).
 *
 * Uso (section-builder):
 *
 *   const ref = useRef<HTMLElement>(null);
 *   useStazione(ref, 'freni');
 *   <section ref={ref} id="freni" className="ssc-freni ssc-stazione">
 *     <div data-ssc-pannello className="ssc-freni__pannello">…</div>
 *   </section>
 *
 * Registra in un layout effect (prima della pittura), così la prima misura
 * del ticker vede già tutte le sezioni. Il pannello di testo va marcato
 * `data-ssc-pannello` (motion-designer §4.4); lo stadio sticky del
 * sottoscocca `data-ssc-pin`.
 */

import { useLayoutEffect, type RefObject } from 'react';
import type { IdSezione } from '../state/store';
import { registraStazione } from './stazioni';

export function useStazione(ref: RefObject<HTMLElement | null>, id: IdSezione): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    return registraStazione(id, el);
  }, [ref, id]);
}
