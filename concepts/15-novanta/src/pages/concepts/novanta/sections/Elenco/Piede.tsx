/**
 * NOVANTA · piede della vista elenco: dove siamo in breve, "Un concept di
 * Ciceri Lab", riga di finzione, crediti foto (section-builder-zero).
 * Stub dello scaffold funzionante, il file passa al proprietario, che lo
 * riscrive per intero.
 */
import { ELENCO } from '../../content/testi';
import { useNovanta } from '../../state/store';
import './elenco.css';

export default function Piede() {
  const elenco = useNovanta((s) => s.modo === 'elenco');
  if (!elenco) return null;
  return (
    <footer className="nov-piede" aria-label={ELENCO.piede.aria}>
      <p>{ELENCO.piede.dove}</p>
      <p>{ELENCO.piede.conceptDi}</p>
      <p className="nov-nota">{ELENCO.piede.finzione}</p>
    </footer>
  );
}
