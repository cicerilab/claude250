/**
 * CONTROPELO · la lista da tastiera.
 *
 * Creative-director §7.4, ux-architect §8.7 e §8.8:
 * - Tab entra solo sui posti liberi (gli occupati sono testo, le ore passate
 *   non sono raggiungibili): lo decide il markup della lista;
 * - ↑/↓ saltano da un posto libero all'altro **della fascia mostrata** e ai
 *   bordi si fermano (per cambiare fascia ci sono i bottoni fascia);
 *   Home/Fine vanno al primo/ultimo libero;
 * - Invio (o Spazio) su un posto libero apre la riga di scrittura: è il clic
 *   nativo del `<button>`, qui non serve nulla;
 * - Esc, con la riga di scrittura aperta e il fuoco dentro la lista, la
 *   chiude; il fuoco torna sul trattino (azione `chiudiScrittura` dello store,
 *   che emette `richiestaFuoco` di tipo 'trattino').
 *
 * Marcatura richiesta alla lista:
 * - ogni posto libero: `<button data-ctp-libero …>`;
 * - il contenitore della riga di scrittura: `data-ctp-scrittura`.
 *
 * Uso (section-builder-lista):
 *
 *   const listaRef = useRef<HTMLDivElement>(null);
 *   useRigheLibere(listaRef, { scritturaAperta, onChiudi: chiudiScrittura });
 */

import { useEffect, useRef, type RefObject } from 'react';
import { mettiFuoco, visibile } from './fuoco';

export const SELETTORE_LIBERO = '[data-ctp-libero]';
export const SELETTORE_SCRITTURA = '[data-ctp-scrittura]';

export interface OpzioniRigheLibere {
  /** true mentre la riga di scrittura è aperta in questa lista. */
  scritturaAperta: boolean;
  /** Chiude la riga (di solito `chiudiScrittura` dello store). */
  onChiudi: () => void;
}

/** Posti liberi raggiungibili, in ordine di lettura. */
export function postiLiberi(contenitore: HTMLElement): HTMLElement[] {
  const tutti = Array.from(contenitore.querySelectorAll<HTMLElement>(SELETTORE_LIBERO));
  return tutti.filter(
    (b) =>
      !b.hasAttribute('disabled') &&
      b.getAttribute('aria-disabled') !== 'true' &&
      b.closest('[hidden], [inert]') === null &&
      visibile(b),
  );
}

export function useRigheLibere(ref: RefObject<HTMLElement>, opz: OpzioniRigheLibere): void {
  // Le opzioni cambiano a ogni render: il listener legge sempre le ultime.
  const opzioni = useRef(opz);
  useEffect(() => {
    opzioni.current = opz;
  });

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;

    const suKeyDown = (e: KeyboardEvent): void => {
      if (e.defaultPrevented || e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;

      if (e.key === 'Escape') {
        if (!opzioni.current.scritturaAperta) return;
        e.preventDefault();
        e.stopPropagation();
        opzioni.current.onChiudi();
        return;
      }

      if (!t.matches(SELETTORE_LIBERO)) return;
      let passo: 'su' | 'giu' | 'primo' | 'ultimo';
      switch (e.key) {
        case 'ArrowDown':
          passo = 'giu';
          break;
        case 'ArrowUp':
          passo = 'su';
          break;
        case 'Home':
          passo = 'primo';
          break;
        case 'End':
          passo = 'ultimo';
          break;
        default:
          return;
      }
      // Le frecce non fanno scorrere nulla, nemmeno in vetrina lunga.
      e.preventDefault();
      const liberi = postiLiberi(el);
      const qui = liberi.indexOf(t);
      if (qui < 0 || liberi.length === 0) return;
      let dove = qui;
      if (passo === 'giu') dove = Math.min(liberi.length - 1, qui + 1);
      else if (passo === 'su') dove = Math.max(0, qui - 1);
      else if (passo === 'primo') dove = 0;
      else dove = liberi.length - 1;
      if (dove !== qui) mettiFuoco(liberi[dove]);
    };

    el.addEventListener('keydown', suKeyDown);
    return () => {
      el.removeEventListener('keydown', suKeyDown);
    };
  }, [ref]);
}
