/**
 * IMPRONTA · la leva "tieni premuto per stampare" (section-builder-banco).
 *
 * Solo il markup e gli stati visibili: la logica del gesto è di
 * interaction/useHoldToConfirm.ts (900 ms, doppia pressione breve entro 6 s,
 * clic dei lettori di schermo, Spazio e Invio tenuti, annunci), il magnete
 * sobrio della maniglia è attachMagnete (6 px, si spegne man mano che la leva
 * scende). Giro 2: niente più pista in lamina. La guida è un solco inciso
 * nella carta, il manico tondo in lamina ci scorre dentro fino al fermo (il
 * punto in cui la pressa tocca il foglio); la corsa fatta resta scura nel
 * solco. Il manico è l'unico tondo del sito.
 *
 * - `button` vero, nome accessibile = etichetta visibile, `aria-describedby` →
 *   promessa e totale (sopra la leva, scritti dal Banco);
 * - l'etichetta visibile cambia con lo stato: "Premi di nuovo per
 *   confermare" quando è armata, "La pressa è giù" mentre si spedisce;
 * - `aria-disabled` (non `disabled`) mentre si spedisce: il fuoco non si perde;
 * - la regione `aria-live="polite"` sotto la leva ha l'altezza riservata:
 *   i messaggi non spostano nulla.
 *
 * Il Banco chiama `reset()` dopo un invio fallito (la carta risale).
 */

import { forwardRef, useImperativeHandle } from 'react';
import { ANNUNCI, BANCO } from '../../content/testi';
import { useHoldToConfirm, type HoldMotivo, type HoldVia } from '../../interaction/useHoldToConfirm';

export interface ComandiLeva {
  reset(): void;
}

export interface LevaProps {
  /** id degli elementi che descrivono la leva (promessa, totale). */
  descrittaDa: string;
  /** Spedizione in corso: la pressa resta giù. */
  inCorso: boolean;
  /** Messaggio del Banco per la regione sotto la leva (ha la precedenza su quelli del gesto). */
  messaggio: string | null;
  puoPartire: () => boolean;
  onBloccato: () => void;
  onInizio: () => void;
  onAnnulla: (motivo: HoldMotivo) => void;
  onProgress: (p: number) => void;
  onCompleta: (via: HoldVia) => void;
}

const Leva = forwardRef<ComandiLeva, LevaProps>(function Leva(
  { descrittaDa, inCorso, messaggio, puoPartire, onBloccato, onInizio, onAnnulla, onProgress, onCompleta },
  refComandi,
) {
  const leva = useHoldToConfirm({
    testi: { armato: ANNUNCI.confermaDiNuovo, annullato: BANCO.leva.presto },
    disabilitato: inCorso,
    puoPartire,
    onBloccato,
    onInizio,
    onAnnulla,
    onProgress,
    onCompleta,
    magnete: 6,
  });

  useImperativeHandle(refComandi, () => ({ reset: leva.reset }), [leva.reset]);

  const etichetta = inCorso
    ? BANCO.leva.inCorso
    : leva.stato === 'armato'
      ? BANCO.leva.confermaDiNuovo
      : BANCO.leva.istruzione;

  // Il gesto annuncia "premi di nuovo" (ANNUNCI) ma sotto la leva, a vista,
  // il testo lungo "Hai lasciato presto…" è quello del copywriter (BANCO).
  // Mentre si tiene premuto il vecchio avviso si toglie: si ricomincia pulito.
  const sotto = messaggio ?? (leva.stato === 'tenendo' ? '' : leva.annuncio);

  return (
    <div className="imp-banco__leva-blocco">
      <button
        {...leva.buttonProps}
        className="imp-banco__leva imp-ix-leva"
        aria-describedby={descrittaDa}
        data-in-corso={inCorso ? '' : undefined}
      >
        <span className="imp-banco__leva-premuta" aria-hidden="true" />
        <span className="imp-ix-leva__binario" aria-hidden="true">
          <span className="imp-banco__leva-fermo" />
          <span className="imp-ix-leva__corsa">
            <span className="imp-ix-leva__carrello">
              <span className="imp-ix-leva__maniglia" />
            </span>
          </span>
        </span>
        {/* Il nome accessibile è l'etichetta visibile (WCAG 2.5.3): cambia con lo stato. */}
        <span className="imp-ix-leva__testo imp-banco__leva-testo">
          {etichetta}
        </span>
      </button>
      <p className="imp-ix-annuncio imp-banco__leva-messaggio" aria-live="polite">
        {sotto}
      </p>
    </div>
  );
});

export default Leva;
