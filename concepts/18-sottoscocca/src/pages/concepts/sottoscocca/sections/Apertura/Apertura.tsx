/**
 * SOTTOSCOCCA · Apertura (section-builder-apertura).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<section id="inizio">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'inizio')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './apertura.css';

export default function Apertura() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'inizio');
  return <section ref={ref} id="inizio" className="ssc-apertura ssc-stazione" />;
}
