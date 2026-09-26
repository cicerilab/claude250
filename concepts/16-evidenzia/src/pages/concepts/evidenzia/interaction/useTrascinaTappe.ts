/**
 * EVIDENZIA · riordinare le tappe del giro trascinandole (ux-architect 5.6,
 * 6.9). È solo un'aggiunta per mouse e penna: i bottoni Prima / Dopo restano
 * sempre e fanno lo stesso (WCAG 2.5.7). Col dito non si trascina: la
 * colonna del giro deve scorrere.
 *
 * Uso (section-builder-giro):
 *   const listaRef = useRef<HTMLOListElement>(null);
 *   useTrascinaTappe(listaRef, { ids, attivo: ids.length > 1, onRiordina });
 *   <ol ref={listaRef}> <li data-evd-tappa={id} className="evd-ix-tappa"> … </li> </ol>
 *
 * - La maniglia è tutta la tappa, tranne bottoni, link e campi.
 * - Dopo 4 px di movimento la tappa segue il puntatore in verticale; le
 *   altre si spostano per fare posto (150 ms, nessuna animazione con
 *   reduced motion). Rilasciando, `onRiordina(nuoviIds, id, nuovaPosizione)`
 *   una volta sola, e solo se l'ordine è cambiato. Esc annulla.
 * - Le misure si leggono una volta alla pressione; lo spostamento si scrive
 *   nella fase `write` del ticker come variabile `--evd-ix-sposta` sulle sole
 *   tappe (nodi foglia marcati `data-evdvar`).
 * - Il clic che il browser manda dopo il trascinamento viene assorbito.
 */

import { useEffect, useRef, type RefObject } from 'react';
import { ticker } from '../core/ticker';
import type { IdAnnuncio } from '../state/store';

export interface OpzioniTrascinaTappe {
  readonly ids: readonly IdAnnuncio[];
  /** false con una tappa sola, durante l'invio o a giro mandato. */
  readonly attivo: boolean;
  readonly onRiordina: (ids: readonly IdAnnuncio[], id: IdAnnuncio, posizione: number) => void;
}

const SOGLIA_PX = 4;
const ESCLUSI = 'button, a[href], input, select, textarea, label, [role="radio"], [contenteditable="true"]';

interface Misura {
  id: IdAnnuncio;
  el: HTMLElement;
  top: number;
  h: number;
}

interface Trascina {
  stato: 'pronto' | 'trascina';
  pointerId: number;
  id: IdAnnuncio;
  da: number;
  y0: number;
  dy: number;
  misure: Misura[];
  passo: number;
  indice: number;
  scritti: Map<HTMLElement, number>;
}

function limita(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function useTrascinaTappe(listaRef: RefObject<HTMLElement>, opz: OpzioniTrascinaTappe): void {
  const opzRef = useRef(opz);
  opzRef.current = opz;

  useEffect(() => {
    const lista = listaRef.current;
    if (lista === null) return undefined;

    let t: Trascina | null = null;
    let togliScrittura: (() => void) | null = null;

    const scrivi = (): boolean => {
      if (t === null) return false;
      for (let i = 0; i < t.misure.length; i += 1) {
        const m = t.misure[i];
        if (m === undefined) continue;
        let v = 0;
        if (i === t.da) {
          v = t.dy;
        } else if (t.da < t.indice && i > t.da && i <= t.indice) {
          v = -t.passo;
        } else if (t.da > t.indice && i < t.da && i >= t.indice) {
          v = t.passo;
        }
        const arrotondato = Math.round(v * 10) / 10;
        if (t.scritti.get(m.el) !== arrotondato) {
          m.el.style.setProperty('--evd-ix-sposta', `${arrotondato}px`);
          t.scritti.set(m.el, arrotondato);
        }
      }
      return false;
    };

    const pulisci = (): void => {
      if (t === null) return;
      for (const m of t.misure) {
        m.el.style.removeProperty('--evd-ix-sposta');
        delete m.el.dataset.evdTrascina;
      }
      if (lista.hasPointerCapture(t.pointerId)) {
        try {
          lista.releasePointerCapture(t.pointerId);
        } catch {
          // già rilasciato
        }
      }
      delete lista.dataset.evdTrascina;
      togliScrittura?.();
      togliScrittura = null;
      document.removeEventListener('keydown', suTasto, true);
      t = null;
    };

    const assorbiClic = (): void => {
      const assorbi = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener('click', assorbi, true);
      };
      window.addEventListener('click', assorbi, true);
      window.setTimeout(() => {
        window.removeEventListener('click', assorbi, true);
      }, 400);
    };

    const suTasto = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape' || t === null) return;
      e.preventDefault();
      e.stopPropagation();
      const eraTrascinata = t.stato === 'trascina';
      pulisci();
      if (eraTrascinata) assorbiClic();
    };

    const suPointerDown = (e: PointerEvent): void => {
      const o = opzRef.current;
      if (!o.attivo || t !== null) return;
      if (e.pointerType === 'touch' || e.button !== 0 || !e.isPrimary) return;
      if (!(e.target instanceof Element) || e.target.closest(ESCLUSI) !== null) return;
      const voce = e.target.closest<HTMLElement>('[data-evd-tappa]');
      if (voce === null || !lista.contains(voce)) return;
      const id = voce.dataset.evdTappa;
      if (id === undefined) return;

      const elementi = Array.from(lista.querySelectorAll<HTMLElement>('[data-evd-tappa]'));
      const misure: Misura[] = elementi.map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.dataset.evdTappa ?? '', el, top: r.top, h: r.height };
      });
      const da = misure.findIndex((m) => m.el === voce);
      if (da < 0) return;
      const seconda = misure[1];
      const prima = misure[0];
      const passo =
        prima !== undefined && seconda !== undefined ? seconda.top - prima.top : (misure[da]?.h ?? 0);

      t = {
        stato: 'pronto',
        pointerId: e.pointerId,
        id,
        da,
        y0: e.clientY,
        dy: 0,
        misure,
        passo,
        indice: da,
        scritti: new Map(),
      };
      document.addEventListener('keydown', suTasto, true);
    };

    const suPointerMove = (e: PointerEvent): void => {
      if (t === null || e.pointerId !== t.pointerId) return;
      const dy = e.clientY - t.y0;
      if (t.stato === 'pronto') {
        if (Math.abs(dy) < SOGLIA_PX) return;
        t.stato = 'trascina';
        try {
          lista.setPointerCapture(e.pointerId);
        } catch {
          // senza cattura si continua finché il puntatore resta sulla lista
        }
        lista.dataset.evdTrascina = '1';
        const m = t.misure[t.da];
        if (m !== undefined) m.el.dataset.evdTrascina = '1';
        togliScrittura = ticker.add(scrivi, 'write');
      }
      e.preventDefault();
      const primo = t.misure[0];
      const ultimo = t.misure[t.misure.length - 1];
      const corrente = t.misure[t.da];
      if (primo === undefined || ultimo === undefined || corrente === undefined) return;
      // la tappa non esce dalla lista
      t.dy = limita(dy, primo.top - corrente.top, ultimo.top - corrente.top);
      const centro = corrente.top + corrente.h / 2 + t.dy;
      let indice = 0;
      for (let i = 0; i < t.misure.length; i += 1) {
        const m = t.misure[i];
        if (m !== undefined && centro > m.top + m.h / 2) indice = i;
      }
      if (centro < primo.top + primo.h / 2) indice = 0;
      t.indice = indice;
      ticker.wake();
    };

    const suPointerUp = (e: PointerEvent): void => {
      if (t === null || e.pointerId !== t.pointerId) return;
      const { stato, da, indice, id, misure } = t;
      pulisci();
      if (stato !== 'trascina') return;
      assorbiClic();
      if (indice === da) return;
      const ids = misure.map((m) => m.id);
      ids.splice(da, 1);
      ids.splice(indice, 0, id);
      opzRef.current.onRiordina(ids, id, indice);
    };

    const suPointerCancel = (e: PointerEvent): void => {
      if (t !== null && e.pointerId === t.pointerId) pulisci();
    };

    lista.addEventListener('pointerdown', suPointerDown);
    lista.addEventListener('pointermove', suPointerMove);
    lista.addEventListener('pointerup', suPointerUp);
    lista.addEventListener('pointercancel', suPointerCancel);
    return () => {
      lista.removeEventListener('pointerdown', suPointerDown);
      lista.removeEventListener('pointermove', suPointerMove);
      lista.removeEventListener('pointerup', suPointerUp);
      lista.removeEventListener('pointercancel', suPointerCancel);
      pulisci();
    };
  }, [listaRef]);
}
