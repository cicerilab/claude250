/**
 * SOTTOSCOCCA · PonteLibero (section-builder-ponte-libero).
 *
 * Stub dello scaffold con il contratto finale: default export senza prop,
 * `<section id="ponte-libero">` (id stabile: lo usano asta, testata, piede e gli hash),
 * stazione del ponte registrata con `useStazione(ref, 'ponte-libero')`.
 * Il builder sostituisce il contenuto; i testi vengono solo da content/testi.ts.
 */

import { useRef } from 'react';
import { useStazione } from '../../ponte/useStazione';
import './ponte-libero.css';

export default function PonteLibero() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'ponte-libero');
  return <section ref={ref} id="ponte-libero" className="ssc-ponte-libero ssc-stazione" />;
}
