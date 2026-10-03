/**
 * SOTTOSCOCCA · Gomme · quota 20 cm (section-builder-gomme).
 *
 * La prima quota: il ponte stacca l'auto da terra e le ruote girano libere.
 * La sezione è quasi tutta scena: un vuoto in alto (l'auto che si stacca si
 * vede senza testo, motion §4.4), il pannello di testo sul banco, un vuoto
 * in basso (la salita 20 → 80 avviene con sola scena in vista, ux §3).
 *
 * Il pannello porta `data-ssc-pannello`: il motore del ponte lo misura e
 * tiene l'auto ferma a 20 cm finché lo si legge (regola dei plateau). Dentro,
 * in ordine (DESIGN.md §4 "Pannello di quota"): la cifra "20 cm" in piedi
 * sulla sua linea a terra (aria-hidden), l'h2 "Gomme" con il nome completo per
 * il lettore di schermo, il testo, il listino delle misure, gomme nuove e
 * convergenza, il rimando al deposito, l'elenco "Da qui si vede".
 * Dopo il pannello i punti proiettati della quota 20 (PuntiQuota), così la
 * tabulazione va: contenuto della quota, poi i suoi punti (CD 4.3).
 *
 * Contratto dello scaffold: default export senza prop, id "gomme" stabile,
 * `useStazione(ref, 'gomme')` sull'elemento radice. Testi solo da
 * content/testi.ts.
 */

import { useRef } from 'react';
import { puntiDellaQuota, type Quota } from '../../content/lavori';
import { COMUNI, GOMME, QUOTE } from '../../content/testi';
import { useStazione } from '../../ponte/useStazione';
import PuntiQuota from '../Punti/PuntiQuota';
import DaQuiSiVede from './DaQuiSiVede';
import Listino from './Listino';
import './gomme.css';

const QUOTA: Quota = 20;
const PUNTI = puntiDellaQuota(QUOTA);
const ID_TITOLO = 'ssc-gomme-titolo';

export default function Gomme() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'gomme');

  return (
    <section ref={ref} id="gomme" className="ssc-gomme ssc-stazione" aria-labelledby={ID_TITOLO}>
      <div className="ssc-gomme__gabbia ssc-pagina">
        <div className="ssc-gomme__pannello ssc-banco" data-ssc-pannello="">
          <p className="ssc-gomme__cifra" aria-hidden="true">
            {QUOTE[QUOTA].numero}
            <small className="ssc-gomme__unita">{COMUNI.centimetri}</small>
          </p>

          <h2 id={ID_TITOLO} className="ssc-gomme__titolo">
            {GOMME.titolo}
            <span className="ssc-sr">{GOMME.titoloSr}</span>
          </h2>

          <div className="ssc-gomme__testo">
            <p className="ssc-lead">{GOMME.testo}</p>
            <p>{GOMME.battistrada}</p>
          </div>

          <Listino />

          <ul className="ssc-gomme__note ssc-lista ssc-piccolo" role="list">
            <li>{GOMME.gommeNuove}</li>
            <li>{GOMME.convergenza}</li>
          </ul>

          <p className="ssc-gomme__deposito">
            {GOMME.deposito.testo}{' '}
            <a className="ssc-gomme__link ssc-ix-link" href={GOMME.deposito.href}>
              {GOMME.deposito.link}
            </a>
          </p>

          <DaQuiSiVede punti={PUNTI} />
        </div>
      </div>

      <PuntiQuota quota={QUOTA} etichette="al-focus" />
    </section>
  );
}
