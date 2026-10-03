/**
 * SOTTOSCOCCA · Sottoscocca (section-builder-sottoscocca).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<section id="sottoscocca">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'sottoscocca')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './sottoscocca.css';

export default function Sottoscocca() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'sottoscocca');
  return <section ref={ref} id="sottoscocca" className="ssc-sottoscocca ssc-stazione" />;
}
