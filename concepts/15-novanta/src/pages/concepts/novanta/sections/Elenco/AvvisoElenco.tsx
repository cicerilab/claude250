/**
 * NOVANTA · riga role="status" del passaggio automatico alla vista elenco
 * (ux-architect §5.9, §6.9; section-builder-zero). Stub dello scaffold
 * funzionante, il file passa al proprietario, che lo riscrive per intero.
 */
import { ELENCO } from '../../content/testi';
import { useNovanta } from '../../state/store';
import './elenco.css';

export default function AvvisoElenco() {
  const motivo = useNovanta((s) => s.motivoElenco);
  if (motivo === null) return null;
  return (
    <p className="nov-avviso-elenco" role="status">
      {motivo === 'testo-grande' ? ELENCO.automatico.testoGrande : ELENCO.automatico.finestraBassa}{' '}
      {ELENCO.automatico.nonSiPuo}
    </p>
  );
}
