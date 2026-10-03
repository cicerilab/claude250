/**
 * SOTTOSCOCCA · Piede (section-builder-officina-piede).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<footer id="piede">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'piede')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './piede.css';

export default function Piede() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'piede');
  return <footer ref={ref} id="piede" className="ssc-piede ssc-stazione" />;
}
