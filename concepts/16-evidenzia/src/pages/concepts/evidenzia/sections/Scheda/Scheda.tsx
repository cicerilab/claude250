/**
 * EVIDENZIA · Scheda: STUB dello scaffold-engineer.
 * Proprietario da adesso: section-builder-scheda (docs/scaffold-engineer.md §6).
 *
 * Evidenzia.tsx la monta SOLO quando `schedaAperta !== null` e la smonta
 * quando `chiudiScheda()` azzera lo stato. Lo stub collega già il dialogo
 * (history `#scheda-<rif>`, inert, Tab, Esc, fuoco) con `useDialogo`; chiude
 * senza animazione. Il builder aggiunge velo, stacco/rimetti, contenuto.
 */
import { useRef } from 'react';
import { annuncioDa } from '../../content/annunci';
import { SCHEDA } from '../../content/testi';
import { hashScheda, useDialogo } from '../../core/dialogo';
import { chiudiScheda, useEvidenzia } from '../../state/store';
import './scheda.css';

export default function Scheda() {
  const id = useEvidenzia((s) => s.schedaAperta);
  const a = id === null ? undefined : annuncioDa(id);
  const ref = useRef<HTMLDivElement>(null);
  useDialogo(ref, {
    tipo: 'scheda',
    hash: hashScheda(a?.rif ?? ''),
    onChiudi: () => {
      chiudiScheda();
    },
    ritornoFuoco: () => (id === null ? null : document.getElementById(id)),
  });
  return (
    <div
      ref={ref}
      className="evd-scheda"
      role="dialog"
      aria-modal="true"
      aria-label={a?.attacco ?? SCHEDA.dialogoDescrizione}
      tabIndex={-1}
    />
  );
}
