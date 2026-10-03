/**
 * SOTTOSCOCCA · Freni e sospensioni · elenco "Da qui si vede"
 * (section-builder-freni-sospensioni).
 *
 * L'alternativa sempre visibile ai punti sulla scena (CD 4.3, ux §7.4): gli
 * stessi pezzi della quota 80 (freni, sospensioni), nello stesso ordine
 * davanti → dietro, come bottoni che aprono la stessa scheda dei punti
 * (`usePropsApriScheda` con origine 'elenco': aria-controls, aria-expanded,
 * ritorno del fuoco qui alla chiusura). Chi usa il lettore di schermo può
 * usare solo questo. Ogni sezione ha il suo elenco (file esclusivi per
 * builder): markup e classi `ssc-freni__*` sono di questa cartella.
 */

import type { IdPunto } from '../../content/lavori';
import { COMUNI, PUNTI_TESTI } from '../../content/testi';
import { usePropsApriScheda } from '../../interaction/useScheda';

const ID_ETICHETTA = 'ssc-freni-vista-etichetta';

interface PropsVoce {
  readonly id: IdPunto;
}

function Voce({ id }: PropsVoce) {
  const apri = usePropsApriScheda(id, 'elenco');
  const testi = PUNTI_TESTI[id];
  return (
    <li className="ssc-freni__voce">
      <button
        {...apri}
        className="ssc-freni__pezzo ssc-ix-premibile ssc-ix-premibile--contorno ssc-ix-tocco"
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
    <div className="ssc-freni__vista">
      <p id={ID_ETICHETTA} className="ssc-freni__vista-etichetta">
        {COMUNI.daQuiSiVede}
      </p>
      <ul className="ssc-freni__pezzi ssc-lista" role="list" aria-labelledby={ID_ETICHETTA}>
        {punti.map((id) => (
          <Voce key={id} id={id} />
        ))}
      </ul>
    </div>
  );
}
