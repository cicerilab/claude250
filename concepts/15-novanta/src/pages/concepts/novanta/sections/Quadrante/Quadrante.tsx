/**
 * NOVANTA · il quadrante (section-builder-quadrante).
 * Stub dello scaffold: solo il `nav` delle sette parole (link `#gradi-N`,
 * gestiti dal clic delegato di Novanta.tsx), così la pagina si naviga già.
 * Il file passa al proprietario, che lo riscrive per intero (SVG, braccio,
 * LetturaGradi, basamento, useBraccio).
 */
import { NOMI_ANGOLI, QUADRANTE } from '../../content/testi';
import { ID_ANGOLI } from '../../core/ids';
import { ANGOLI } from '../../dial/geometria';
import { useNovanta } from '../../state/store';
import './quadrante.css';

export default function Quadrante() {
  const attivo = useNovanta((s) => s.attivo);
  return (
    <nav className="nov-quadrante" aria-label={QUADRANTE.navAria}>
      <ol className="nov-lista" aria-controls={ID_ANGOLI}>
        {ANGOLI.map((a) => (
          <li key={a}>
            <a
              className="nov-ix-parola"
              data-gradi={a}
              href={`#gradi-${a}`}
              aria-current={a === attivo ? 'location' : undefined}
            >
              {NOMI_ANGOLI[a].parola}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
