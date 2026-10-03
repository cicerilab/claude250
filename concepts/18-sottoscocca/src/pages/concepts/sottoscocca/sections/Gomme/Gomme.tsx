/**
 * SOTTOSCOCCA · Gomme (section-builder-gomme).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<section id="gomme">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'gomme')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './gomme.css';

export default function Gomme() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'gomme');
  return <section ref={ref} id="gomme" className="ssc-gomme ssc-stazione" />;
}
