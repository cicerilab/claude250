/**
 * EVIDENZIA · Comandi: STUB dello scaffold-engineer.
 * Proprietario da adesso: section-builder-comandi (docs/scaffold-engineer.md §6).
 * Molo (foglio) o barra del giro (colonna), minipagina, Leggi / Pagina intera. Fuori dal foglio, fisso.
 */
import { BARRA } from '../../content/testi';
import './comandi.css';

export default function Comandi() {
  return <aside className="evd-comandi" aria-label={BARRA.aria} />;
}
