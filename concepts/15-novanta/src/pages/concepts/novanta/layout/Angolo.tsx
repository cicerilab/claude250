/**
 * NOVANTA · involucro di ogni angolo (tech-architect §3.1, motion-designer
 * §7, ux-architect §1, §6.1, copywriter §8).
 *
 * Ogni sezione rende il proprio contenuto dentro `<Angolo gradi={N}>`:
 *
 *   <li class="nov-angolo" data-gradi="N" data-stato="attivo|entra|esce|spento" [inert]>
 *     <section id="gradi-N" aria-labelledby="gradi-N-titolo">
 *       <p class="nov-angolo__gradi" aria-hidden="true">N<span>°</span></p>   ← solo in vista elenco (CSS)
 *       <h2 id="gradi-N-titolo" class="nov-angolo__titolo" tabindex="-1">…</h2>
 *       <div class="nov-angolo__corpo">{children}</div>
 *     </section>
 *   </li>
 *
 * `data-stato` (motion-designer §7.1):
 *   attivo  in vista dal primo frame, nessuna animazione;
 *   entra   diventato attivo per un cambio (resta `entra` finché non cambia di nuovo);
 *   esce    era l'attivo (`precedente`); spento = gli altri.
 * In vista quadrante gli angoli non attivi (compreso `esce`, che sta sparendo)
 * hanno `inert` e `aria-hidden`; in vista elenco nessuno è inerte.
 *
 * Il titolo viene da `ANGOLI_TESTI[gradi].titolo` (copywriter). Il numero dei
 * gradi in vista quadrante è quello grande del Palco (che scorre); qui c'è
 * solo quello della vista elenco, accanto al mini arco che il section-builder
 * della vista elenco può aggiungere via `prima`.
 */

import type { ReactNode } from 'react';
import { ANGOLI_TESTI } from '../content/testi';
import { idAngolo, idTitolo } from '../core/ids';
import type { Angolo as Gradi } from '../dial/geometria';
import { useNovanta } from '../state/store';

export type StatoAngolo = 'attivo' | 'entra' | 'esce' | 'spento';

export interface AngoloProps {
  gradi: Gradi;
  children: ReactNode;
  /** Classe in più sulla `section` (es. `nov-zero`). */
  className?: string;
  /** Contenuto reso prima del titolo, accanto al numero della vista elenco (mini arco). */
  prima?: ReactNode;
}

interface FettaAngolo {
  readonly stato: StatoAngolo;
  readonly inerte: boolean;
}

const ugualeFetta = (a: FettaAngolo, b: FettaAngolo): boolean => a.stato === b.stato && a.inerte === b.inerte;

/** Stato di un angolo dallo store (esportato per i test e per il Palco). */
export function statoAngolo(gradi: Gradi, attivo: Gradi, precedente: Gradi | null, primoFrame: boolean): StatoAngolo {
  if (gradi === attivo) return primoFrame ? 'attivo' : 'entra';
  if (gradi === precedente) return 'esce';
  return 'spento';
}

export default function Angolo({ gradi, children, className, prima }: AngoloProps) {
  const { stato, inerte } = useNovanta(
    (s) => ({
      stato: statoAngolo(gradi, s.attivo, s.precedente, s.precedente === null),
      inerte: s.modo === 'quadrante' && gradi !== s.attivo,
    }),
    ugualeFetta,
  );
  const testi = ANGOLI_TESTI[gradi];
  const classi = ['nov-angolo__sezione', className ?? ''].filter(Boolean).join(' ');

  return (
    <li
      className="nov-angolo"
      data-gradi={gradi}
      data-stato={stato}
      // `inert` è un attributo booleano: React 18 lo scrive solo come stringa.
      {...(inerte ? { inert: '' as unknown as boolean, 'aria-hidden': true } : {})}
    >
      <section id={idAngolo(gradi)} className={classi} aria-labelledby={idTitolo(gradi)}>
        <div className="nov-angolo__testa">
          <p className="nov-angolo__gradi" aria-hidden="true">
            {gradi}
            <span className="nov-angolo__simbolo">°</span>
          </p>
          {prima}
        </div>
        <h2 id={idTitolo(gradi)} className="nov-angolo__titolo" tabIndex={-1}>
          {testi.titolo}
        </h2>
        <div className="nov-angolo__corpo">{children}</div>
      </section>
    </li>
  );
}
