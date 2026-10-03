/**
 * SOTTOSCOCCA · Gomme · listino delle misure (section-builder-gomme).
 *
 * Tabella HTML vera con `<caption>` (ux §5.2): misura, montaggio ed
 * equilibratura di quattro gomme, tempo sul ponte. Sotto i 360 px la tabella
 * a tre colonne non ci sta più: al suo posto un elenco di frasi
 * ("205/55 R16: 56 €, 40 minuti"). Le due forme sono entrambe nel DOM e il
 * CSS ne mostra una sola con `display: none`, così il lettore di schermo ne
 * legge sempre una sola.
 *
 * Dati da `content/lavori.ts` (MISURE_GOMME), testi da `content/testi.ts`.
 */

import { MISURE_GOMME } from '../../content/lavori';
import { GOMME, durata, durataParlata, euro } from '../../content/testi';

const ID_DIDASCALIA_ELENCO = 'ssc-gomme-listino-didascalia';

export default function Listino() {
  const t = GOMME.tabella;

  return (
    <div className="ssc-gomme__listino">
      <table className="ssc-gomme__tabella ssc-numeri">
        <caption className="ssc-gomme__didascalia">{t.caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="ssc-gomme__intestazione">
              {t.colonne.misura}
            </th>
            <th scope="col" className="ssc-gomme__intestazione ssc-gomme__intestazione--cifra">
              {t.colonne.montaggio}
            </th>
            <th scope="col" className="ssc-gomme__intestazione ssc-gomme__intestazione--cifra">
              {t.colonne.tempo}
            </th>
          </tr>
        </thead>
        <tbody>
          {MISURE_GOMME.map((m) => (
            <tr key={m.misura} className="ssc-gomme__riga">
              <th scope="row" className="ssc-gomme__misura">
                <span aria-hidden="true">{m.misura}</span>
                <span className="ssc-sr">{t.misuraAria(m.misura)}</span>
              </th>
              <td className="ssc-gomme__prezzo">{euro(m.montaggio)}</td>
              <td className="ssc-gomme__tempo">
                <span aria-hidden="true">{durata(m.minuti)}</span>
                <span className="ssc-sr">{durataParlata(m.minuti)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ssc-gomme__stretto">
        <p id={ID_DIDASCALIA_ELENCO} className="ssc-gomme__didascalia">
          {t.caption}
        </p>
        <ul className="ssc-gomme__righe ssc-lista ssc-numeri" role="list" aria-labelledby={ID_DIDASCALIA_ELENCO}>
          {MISURE_GOMME.map((m) => (
            <li key={m.misura} className="ssc-gomme__riga-stretta">
              {t.riga(m.misura, m.montaggio, m.minuti)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
