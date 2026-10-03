/**
 * SOTTOSCOCCA · Freni (section-builder-freni-sospensioni).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<section id="freni">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'freni')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './freni.css';

export default function Freni() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'freni');
  return <section ref={ref} id="freni" className="ssc-freni ssc-stazione" />;
}
