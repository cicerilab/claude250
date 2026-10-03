/**
 * SOTTOSCOCCA · Officina (section-builder-officina-piede).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<section id="officina">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'officina')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './officina.css';

export default function Officina() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'officina');
  return <section ref={ref} id="officina" className="ssc-officina ssc-stazione" />;
}
