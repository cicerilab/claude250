/**
 * SOTTOSCOCCA · Freni e sospensioni · quota 80 cm (section-builder-freni-sospensioni).
 *
 * La seconda quota: la camera scende all'altezza del mozzo e il cerchio
 * anteriore si apre in trasparenza per far vedere disco e pinza. Come per le
 * gomme, la sezione è un tratto di pavimento: vuoto di sola scena in alto (la
 * salita 20 → 80 si vede senza testo), il pannello sul banco, vuoto in basso
 * (la salita 80 → 180 avviene mentre lo stadio del sottoscocca entra, motion
 * §4.2). Le misure dei vuoti sono quelle della geometria di riferimento del
 * motion-designer (percorso.ts `geometriaBase`): 25 vh / 75 vh in
 * orizzontale, 55 svh / 55 svh in verticale.
 *
 * Il pannello porta `data-ssc-pannello`: il motore del ponte lo misura e
 * tiene l'auto ferma a 80 cm finché lo si legge. Dentro, in ordine
 * (DESIGN.md §4 "Pannello di quota"): la cifra "80 cm" in piedi sulla sua
 * linea a terra (aria-hidden), l'h2 "Freni e sospensioni" con il nome
 * completo per il lettore di schermo, la frase di quota, i due reparti
 * (Freni, Sospensioni: due h3, ux §5.3) ognuno con prezzo e tempo sul ponte
 * in Tektur, i segnali a parole e ogni quanto, la nota sulla coppia, l'elenco
 * "Da qui si vede". Dopo il pannello i punti proiettati della quota 80
 * (PuntiQuota), così la tabulazione va: contenuto della quota, poi i suoi
 * punti (CD 4.3).
 *
 * Contratto dello scaffold: default export senza prop, id "freni" stabile,
 * `useStazione(ref, 'freni')` sull'elemento radice. Testi solo da
 * content/testi.ts.
 */

import { useRef } from 'react';
import { puntiDellaQuota, type Quota } from '../../content/lavori';
import { COMUNI, FRENI, QUOTE } from '../../content/testi';
import { useStazione } from '../../ponte/useStazione';
import PuntiQuota from '../Punti/PuntiQuota';
import DaQuiSiVede from './DaQuiSiVede';
import Reparto from './Reparto';
import './freni.css';

const QUOTA: Quota = 80;
const PUNTI = puntiDellaQuota(QUOTA);
const ID_TITOLO = 'ssc-freni-titolo';

export default function Freni() {
  const ref = useRef<HTMLElement>(null);
  useStazione(ref, 'freni');

  return (
    <section ref={ref} id="freni" className="ssc-freni ssc-stazione" aria-labelledby={ID_TITOLO}>
      <div className="ssc-freni__gabbia ssc-pagina">
        <div className="ssc-freni__pannello ssc-banco" data-ssc-pannello="">
          <p className="ssc-freni__cifra" aria-hidden="true">
            {QUOTE[QUOTA].numero}
            <small className="ssc-freni__unita">{COMUNI.centimetri}</small>
          </p>

          <h2 id={ID_TITOLO} className="ssc-freni__titolo">
            {FRENI.titolo}
            <span className="ssc-sr">{FRENI.titoloSr}</span>
          </h2>

          <p className="ssc-freni__testo ssc-lead">{FRENI.testo}</p>

          <div className="ssc-freni__reparti">
            <Reparto id="freni" dati={FRENI.freni} />
            <Reparto id="sospensioni" dati={FRENI.sospensioni} />
          </div>

          <p className="ssc-freni__coppia ssc-piccolo">{FRENI.coppia}</p>

          <DaQuiSiVede punti={PUNTI} />
        </div>
      </div>

      <PuntiQuota quota={QUOTA} etichette="al-focus" />
    </section>
  );
}
