/**
 * SOTTOSCOCCA · Asta graduata (section-builder-asta-testata).
 *
 * Stub dello scaffold. Contratto: default export senza prop, una
 * `<nav aria-label={ASTA.navAria}>` fissa a destra, montata da Radice.tsx
 * dentro `.ssc-contenuto` subito dopo la Testata (ordine di tabulazione:
 * ux §7.3). Indice con `useMotionVars(ref, CALCOLI.quotaAsta)`, numero con
 * `useTestoCaldo(ref, CALCOLI.numeroQuota)`; `aria-current` dalla quota di
 * plateau (`useSottoscocca(selQuotaPlateau)`); link `#inizio`, `#gomme`,
 * `#freni`, `#sottoscocca` (li gestisce il clic delegato di Radice).
 */

import './asta.css';

export default function Asta() {
  return <nav className="ssc-asta" hidden />;
}
