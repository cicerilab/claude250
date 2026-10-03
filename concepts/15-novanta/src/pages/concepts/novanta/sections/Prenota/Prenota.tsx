/**
 * NOVANTA · 90° prenota: titolo, istruzione, prezzo, modulo, esiti
 * (section-builder-prenota). L'anello è di section-builder-anello (Anello.tsx).
 * Stub dello scaffold: impaginazione libera (layout.css §2.3).
 * Il file passa al proprietario, che lo riscrive per intero.
 */
import { PRENOTA } from '../../content/testi';
import Angolo from '../../layout/Angolo';
import Anello from './Anello';
import './prenota.css';

export default function Prenota() {
  return (
    <Angolo gradi={90} impaginazione="libera" className="nov-prenota">
      <p>{PRENOTA.istruzione}</p>
      <Anello />
    </Angolo>
  );
}
