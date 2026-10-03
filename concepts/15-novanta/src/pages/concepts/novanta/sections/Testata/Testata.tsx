/**
 * NOVANTA · testata: marchio (h1), "Chiama", interruttore di vista
 * (section-builder-zero). Stub dello scaffold funzionante, il file passa al
 * proprietario, che lo riscrive per intero.
 */
import { COMUNI, TESTATA } from '../../content/testi';
import { TELEFONO_URL } from '../../core/links';
import { impostaVista, useNovanta } from '../../state/store';
import './testata.css';

export default function Testata() {
  const elenco = useNovanta((s) => s.modo === 'elenco');
  const possibile = useNovanta((s) => s.quadrantePossibile);
  return (
    <header className="nov-testata" aria-label={TESTATA.aria}>
      <h1 className="nov-testata__marchio">
        <span aria-hidden="true">{COMUNI.marchio}</span>
        <span className="nov-sr">{COMUNI.h1Sr}</span>
      </h1>
      <a className="nov-ix-link" href={TELEFONO_URL} aria-label={TESTATA.chiamaAria}>
        {TESTATA.chiama}
      </a>
      {elenco && !possibile ? null : (
        <button type="button" className="nov-ix-pillola" onClick={() => impostaVista(elenco ? 'auto' : 'elenco')}>
          {elenco ? TESTATA.vistaQuadrante : TESTATA.vistaElenco}
        </button>
      )}
    </header>
  );
}
