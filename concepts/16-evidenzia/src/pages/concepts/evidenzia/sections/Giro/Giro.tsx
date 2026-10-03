/**
 * EVIDENZIA · Giro: STUB dello scaffold-engineer.
 * Proprietario da adesso: section-builder-giro (docs/scaffold-engineer.md §6).
 *
 * Chunk lazy: Evidenzia.tsx lo importa con `lazy()` e lo prefetcha in idle;
 * lo monta SOLO quando `giroAperto` e lo smonta con `chiudiGiro()`. Lo stub
 * collega già il dialogo (history `#giro`, inert, Tab, Esc, fuoco) con
 * `useDialogo`. La mappa si importa da qui con `lazy(() => import('../../mappa'))`
 * (mai staticamente: Leaflet tocca `window`).
 */
import { useRef } from 'react';
import { GIRO } from '../../content/testi';
import { ID_PREPARA } from '../../core/ancore';
import { HASH_GIRO, useDialogo } from '../../core/dialogo';
import { chiudiGiro } from '../../state/store';
import './giro.css';

export default function Giro() {
  const ref = useRef<HTMLDivElement>(null);
  useDialogo(ref, {
    tipo: 'giro',
    hash: HASH_GIRO,
    onChiudi: () => {
      chiudiGiro();
    },
    ritornoFuoco: () => document.getElementById(ID_PREPARA),
  });
  return <div ref={ref} className="evd-giro" role="dialog" aria-modal="true" aria-label={GIRO.titolo} tabIndex={-1} />;
}
