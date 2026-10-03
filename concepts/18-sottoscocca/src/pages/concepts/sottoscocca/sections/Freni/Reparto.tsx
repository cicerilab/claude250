/**
 * SOTTOSCOCCA · Freni e sospensioni · un reparto del pannello
 * (section-builder-freni-sospensioni).
 *
 * I due blocchi h3 dell'ux §5.3 (Freni, Sospensioni), ognuno con: prezzo e
 * tempo sul ponte, i segnali in parole normali ("fischia quando freni"),
 * ogni quanto. Nessuna tabella lunga: i dettagli dei lavori sono nella scheda
 * del punto. Il prezzo è la riga che si cerca, quindi è in Tektur
 * (`targhetta`), come le cifre del listino delle gomme; i segnali sono il
 * corpo; "ogni quanto" è il secondario in gesso.
 *
 * I testi arrivano già composti da content/testi.ts (`FRENI.freni`,
 * `FRENI.sospensioni`); "Te ne accorgi se" è `SCHEDA.segnaliTitolo`, la stessa
 * etichetta della scheda, così la pagina e la scheda parlano uguale.
 */

import type { IdPunto } from '../../content/lavori';
import { SCHEDA } from '../../content/testi';

export interface DatiReparto {
  readonly titolo: string;
  readonly segnali: string;
  readonly ogniQuanto: string;
  readonly prezzo: string;
}

interface PropsReparto {
  /** Id del punto corrispondente: dà l'id dell'h3 e lega il reparto al pezzo. */
  readonly id: IdPunto;
  readonly dati: DatiReparto;
}

export default function Reparto({ id, dati }: PropsReparto) {
  const idTitolo = `ssc-freni-reparto-${id}`;
  return (
    <article className="ssc-freni__reparto" aria-labelledby={idTitolo}>
      <h3 id={idTitolo} className="ssc-freni__reparto-titolo">
        {dati.titolo}
      </h3>
      <p className="ssc-freni__prezzo ssc-numeri">{dati.prezzo}</p>
      <dl className="ssc-freni__segnali">
        <dt className="ssc-freni__segnali-etichetta">{SCHEDA.segnaliTitolo}</dt>
        <dd className="ssc-freni__segnali-testo">{dati.segnali}</dd>
      </dl>
      <p className="ssc-freni__ogni-quanto ssc-piccolo">{dati.ogniQuanto}</p>
    </article>
  );
}
