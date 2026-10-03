/**
 * SOTTOSCOCCA · Gomme · elenco "Da qui si vede" (section-builder-gomme).
 *
 * L'alternativa sempre visibile ai punti sulla scena (CD 4.3, ux §7.4): gli
 * stessi pezzi della quota 20, nello stesso ordine davanti → dietro, come
 * bottoni che aprono la stessa scheda dei punti (`usePropsApriScheda` con
 * origine 'elenco': aria-controls, aria-expanded, ritorno del fuoco qui
 * alla chiusura). Chi usa il lettore di schermo può usare solo questo.
 */

import type { IdPunto } from '../../content/lavori';
import { COMUNI, PUNTI_TESTI } from '../../content/testi';
import { usePropsApriScheda } from '../../interaction/useScheda';

const ID_ETICHETTA = 'ssc-gomme-vista-etichetta';

interface PropsVoce {
  readonly id: IdPunto;
}

function Voce({ id }: PropsVoce) {
  const apri = usePropsApriScheda(id, 'elenco');
  const testi = PUNTI_TESTI[id];
  return (
    <li className="ssc-gomme__voce">
      <button
        {...apri}
        className="ssc-gomme__pezzo ssc-ix-premibile ssc-ix-premibile--contorno ssc-ix-tocco"
        aria-label={testi.aria}
      >
        {testi.nome}
      </button>
    </li>
  );
}

interface PropsDaQuiSiVede {
  readonly punti: readonly IdPunto[];
}

export default function DaQuiSiVede({ punti }: PropsDaQuiSiVede) {
  return (
    <div className="ssc-gomme__vista">
      <p id={ID_ETICHETTA} className="ssc-gomme__vista-etichetta">
        {COMUNI.daQuiSiVede}
      </p>
      <ul className="ssc-gomme__pezzi ssc-lista" role="list" aria-labelledby={ID_ETICHETTA}>
        {punti.map((id) => (
          <Voce key={id} id={id} />
        ))}
      </ul>
    </div>
  );
}
