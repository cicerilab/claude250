/**
 * SOTTOSCOCCA · Testata (section-builder-asta-testata).
 *
 * Stub dello scaffold. Contratto: default export senza prop, un `<header>`
 * (landmark banner) montato da Radice.tsx come primo figlio di
 * `.ssc-contenuto`, prima dell'asta e del `<main>` (sticky/fisso su tutta la
 * pagina). Su desktop parte da x = 272 px (zona del bottone del sito, ux §2.2);
 * in modalità bassa (`data-altezza="bassa"` sulla radice) torna in flusso.
 */

import './testata.css';

export default function Testata() {
  return <header className="ssc-testata" />;
}
