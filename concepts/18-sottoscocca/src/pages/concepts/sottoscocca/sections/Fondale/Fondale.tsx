/**
 * SOTTOSCOCCA · Fondale (section-builder-apertura).
 *
 * Stub dello scaffold. Contratto (tech-architect §7.3, §9): default export
 * senza prop, montato da Radice.tsx come figlio diretto di `.ssc-root`
 * PRIMA dello strato GL; fisso, livello 0, `aria-hidden`. Mostra il poster a
 * 0 cm (`FERMI[0]`, elemento LCP, `fetchpriority="high"`) e, con
 * `data-gl="off"`, le foto per quota (`FOTO_QUOTE`) con dissolvenza; senza
 * GL scrive `runtime.punti` (coordinate % → geometria "cover") nella fase
 * `update` del ticker.
 */

import './fondale.css';

export default function Fondale() {
  return <div className="ssc-fondale" aria-hidden="true" />;
}
