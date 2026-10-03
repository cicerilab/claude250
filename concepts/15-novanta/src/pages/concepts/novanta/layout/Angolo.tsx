/**
 * NOVANTA · involucro di ogni angolo (tech-architect §3.1, motion-designer
 * §7, ux-architect §1, §3, §5.9, §6.1, copywriter §8).
 *
 * Ogni sezione rende il proprio contenuto dentro `<Angolo gradi={N}>`:
 *
 *   <li class="nov-angolo" data-gradi="N" data-stato="attivo|entra|esce|spento" [inert aria-hidden]>
 *     <section id="gradi-N" class="nov-angolo__sezione [classe] [--libera]" aria-labelledby="gradi-N-titolo">
 *       <div class="nov-angolo__testa">                         ← numero + mini arco, solo in vista elenco
 *         <p class="nov-angolo__gradi" aria-hidden="true">N<span class="nov-angolo__simbolo">°</span></p>
 *         <svg class="nov-arco nov-arco--mini nov-angolo__mini" aria-hidden="true">…</svg>
 *       </div>
 *       <h2 id="gradi-N-titolo" class="nov-angolo__titolo" tabindex="-1">ANGOLI_TESTI[N].titolo</h2>
 *       <div class="nov-angolo__corpo" data-nov-ix-scorre>{children}<p class="nov-sr">continua sotto</p></div>
 *       <div class="nov-angolo__lato">{lato}</div>              ← solo se passato
 *     </section>
 *   </li>
 *
 * `data-stato` (motion-designer §7.1): attivo = in vista dal primo frame;
 * entra = diventato attivo per un cambio; esce = il precedente; spento = gli
 * altri. In vista quadrante gli angoli non attivi hanno `inert` e
 * `aria-hidden`; in vista elenco nessuno è inerte.
 *
 * Il corpo è l'area che scorre in vista quadrante: se il contenuto continua
 * sotto, l'angolo scrive `data-continua="1"` (maschera sfumata in layout.css)
 * e rende leggibile al lettore di schermo la frase `COMUNI.continuaSotto`.
 * Tornando attivo, il corpo riparte dall'alto.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { ANGOLI_TESTI, COMUNI } from '../content/testi';
import { idAngolo, idTitolo } from '../core/ids';
import Arco from '../dial/Arco';
import type { Angolo as Gradi } from '../dial/geometria';
import { useNovanta } from '../state/store';

export type StatoAngolo = 'attivo' | 'entra' | 'esce' | 'spento';

export interface AngoloProps {
  gradi: Gradi;
  children: ReactNode;
  /** Classe in più sulla `section` (es. `nov-zero`): i CSS di sezione partono da qui. */
  className?: string;
  /**
   * Foto a filo del bordo destro (0°, 60°, 180°): in vista quadrante bordo
   * sta nella colonna a destra del testo, solo se c'è posto (container query
   * del Palco); in elenco desktop sotto il testo; su mobile non si vede
   * (la fascia del 180° va nel corpo).
   */
  lato?: ReactNode;
  /**
   * 'libera' (solo 90°): niente colonna, niente testa, il corpo prende tutto
   * il Palco e il section-builder dispone titolo, anello e modulo.
   */
  impaginazione?: 'colonna' | 'libera';
}

interface FettaAngolo {
  readonly stato: StatoAngolo;
  readonly inerte: boolean;
  readonly quadrante: boolean;
}

const ugualeFetta = (a: FettaAngolo, b: FettaAngolo): boolean =>
  a.stato === b.stato && a.inerte === b.inerte && a.quadrante === b.quadrante;

/** Stato di un angolo dallo store. */
export function statoAngolo(gradi: Gradi, attivo: Gradi, precedente: Gradi | null): StatoAngolo {
  if (gradi === attivo) return precedente === null ? 'attivo' : 'entra';
  if (gradi === precedente) return 'esce';
  return 'spento';
}

/** Tiene `data-continua` e la frase per il lettore di schermo allineati allo scroll del corpo. */
function useContinuaSotto(corpo: React.RefObject<HTMLDivElement>, avviso: React.RefObject<HTMLParagraphElement>, attivo: boolean): void {
  useEffect(() => {
    const el = corpo.current;
    const sr = avviso.current;
    if (el === null || sr === null) return undefined;
    if (!attivo) {
      el.removeAttribute('data-continua');
      sr.hidden = true;
      return undefined;
    }
    const aggiorna = (): void => {
      const resta = el.scrollHeight - el.clientHeight - el.scrollTop;
      const continua = el.scrollHeight > el.clientHeight + 1 && resta > 2;
      if (continua) el.setAttribute('data-continua', '1');
      else el.removeAttribute('data-continua');
      sr.hidden = !(el.scrollHeight > el.clientHeight + 1);
    };
    aggiorna();
    el.addEventListener('scroll', aggiorna, { passive: true });
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(aggiorna) : null;
    ro?.observe(el);
    const primo = el.firstElementChild;
    if (primo !== null) ro?.observe(primo);
    return () => {
      el.removeEventListener('scroll', aggiorna);
      ro?.disconnect();
    };
  }, [corpo, avviso, attivo]);
}

export default function Angolo({ gradi, children, className, lato, impaginazione = 'colonna' }: AngoloProps) {
  const { stato, inerte, quadrante } = useNovanta(
    (s) => ({
      stato: statoAngolo(gradi, s.attivo, s.precedente),
      inerte: s.modo === 'quadrante' && gradi !== s.attivo,
      quadrante: s.modo === 'quadrante',
    }),
    ugualeFetta,
  );
  const corpoRef = useRef<HTMLDivElement>(null);
  const avvisoRef = useRef<HTMLParagraphElement>(null);
  const visibile = stato === 'attivo' || stato === 'entra';

  useContinuaSotto(corpoRef, avvisoRef, quadrante && visibile);

  // Tornando attivo, il corpo riparte dall'alto.
  useEffect(() => {
    if (stato === 'entra' && corpoRef.current !== null) corpoRef.current.scrollTop = 0;
  }, [stato]);

  const classi = [
    'nov-angolo__sezione',
    impaginazione === 'libera' ? 'nov-angolo__sezione--libera' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      className="nov-angolo"
      data-gradi={gradi}
      data-stato={stato}
      // `inert` è booleano nel DOM: React 18 lo scrive solo come stringa vuota.
      {...(inerte ? { inert: '' as unknown as boolean, 'aria-hidden': true } : {})}
    >
      <section id={idAngolo(gradi)} className={classi} aria-labelledby={idTitolo(gradi)}>
        <div className="nov-angolo__testa">
          <p className="nov-angolo__gradi" aria-hidden="true">
            {gradi}
            <span className="nov-angolo__simbolo">°</span>
          </p>
          <Arco variante="mini" geo="fondo" raggio={48} valore={gradi} className="nov-angolo__mini" />
        </div>
        <h2 id={idTitolo(gradi)} className="nov-angolo__titolo" tabIndex={-1}>
          {ANGOLI_TESTI[gradi].titolo}
        </h2>
        <div ref={corpoRef} className="nov-angolo__corpo" data-nov-ix-scorre="">
          {children}
          <p ref={avvisoRef} className="nov-sr">
            {COMUNI.continuaSotto}
          </p>
        </div>
        {lato !== undefined ? <div className="nov-angolo__lato">{lato}</div> : null}
      </section>
    </li>
  );
}
