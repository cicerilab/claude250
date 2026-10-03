/**
 * SOTTOSCOCCA · Deposito (section-builder-deposito).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<section id="deposito">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'deposito')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './deposito.css';

export default function Deposito() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'deposito');
  return <section ref={ref} id="deposito" className="ssc-deposito ssc-stazione" />;
}
