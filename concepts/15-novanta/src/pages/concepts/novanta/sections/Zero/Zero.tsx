/**
 * NOVANTA · 0° da zero (section-builder-zero).
 * Stub dello scaffold: frase e "Prenota" (link a #gradi-90 con
 * `data-nov-origine="prenota"`: lo gestisce il clic delegato di Novanta.tsx).
 * Il file passa al proprietario, che lo riscrive per intero.
 */
import { ZERO } from '../../content/testi';
import Angolo from '../../layout/Angolo';
import './zero.css';

export default function Zero() {
  return (
    <Angolo gradi={0} className="nov-zero">
      <p>{ZERO.frase}</p>
      <p>
        <a className="nov-ix-pillola nov-ix-pillola--piena" href="#gradi-90" data-nov-origine="prenota">
          {ZERO.prenota}
        </a>
      </p>
    </Angolo>
  );
}
