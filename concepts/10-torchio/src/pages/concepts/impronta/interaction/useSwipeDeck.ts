/**
 * IMPRONTA · i tre lavori di "Per chi" da sfogliare su mobile.
 *
 * ux-architect 5.2 (375 px) e 6.8:
 * - fila orizzontale con scroll-snap nativo (un pezzo per volta, il
 *   successivo sporge da destra): lo swipe è quello del browser, fluido e
 *   con l'inerzia del sistema, nessun trascinamento simulato in JS;
 * - sotto, i tre nomi come bottoni (`aria-controls` sulla fila,
 *   `aria-current` sul pezzo in vista) più frecce ‹ › da 44×44: chi non fa
 *   swipe o usa la tastiera non ha bisogno del gesto;
 * - con la tastiera la fila scorre al pezzo che riceve il focus; frecce
 *   sinistra/destra dentro la fila passano al pezzo accanto;
 * - il DOM resta una lista di 3 `<article>` letta in ordine;
 * - il pezzo in vista si rileva con IntersectionObserver (nessun listener di
 *   scroll); sopra i 1024 px il mazzo è spento e i pezzi sono sparsi sul
 *   bancone (layout della sezione).
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useImpronta } from '../state/store';

/** Sotto questa larghezza il mazzo è attivo (mobile e tablet, ux-architect 2.4). */
export const MAZZO_MEDIA = '(max-width: 1023.98px)';

/** Quota visibile oltre la quale un pezzo è "in vista". */
const SOGLIA_IN_VISTA = 0.55;

const FOCUSABILI =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ media query */

function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (fn: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => undefined;
      const mq = window.matchMedia(query);
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', fn);
        return () => mq.removeEventListener('change', fn);
      }
      mq.addListener(fn);
      return () => mq.removeListener(fn);
    },
    [query],
  );
  const get = useCallback(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, get, () => false);
}

/* ------------------------------------------------------------------ tipi */

export interface OpzioniMazzo {
  /** Numero di pezzi (3 in "Per chi"). */
  count: number;
  /** Media query di attivazione. Default MAZZO_MEDIA. */
  media?: string;
  /** Chiamata quando cambia il pezzo in vista (per ANNUNCI.lavoroInVista, analytics). */
  onCambio?: (indice: number) => void;
}

export interface PropsFila {
  ref: (el: HTMLElement | null) => void;
  id: string;
  'data-imp-ix-mazzo': 'attivo' | 'spento';
  onFocus: (e: ReactFocusEvent<HTMLElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

export interface PropsPezzo {
  ref: (el: HTMLElement | null) => void;
  'data-imp-ix-indice': number;
  'data-imp-ix-in-vista': 'si' | 'no';
}

export interface PropsNome {
  type: 'button';
  'aria-controls': string;
  'aria-current': 'true' | undefined;
  onClick: () => void;
}

export interface PropsFreccia {
  type: 'button';
  'aria-controls': string;
  'aria-disabled': true | undefined;
  onClick: () => void;
}

export interface Mazzo {
  /** true sotto i 1024 px con almeno 2 pezzi: mostra nomi e frecce. */
  attivo: boolean;
  indice: number;
  count: number;
  vai: (indice: number, spostaFocus?: boolean) => void;
  precedente: () => void;
  successivo: () => void;
  /** Sul contenitore scorrevole (classe `imp-ix-mazzo`). */
  filaProps: PropsFila;
  /** Su ogni pezzo (classe `imp-ix-mazzo__pezzo`), wrapper NON ruotato. */
  pezzoProps: (indice: number) => PropsPezzo;
  /** Sui bottoni con il nome del pezzo. */
  nomeProps: (indice: number) => PropsNome;
  precedenteProps: PropsFreccia;
  successivoProps: PropsFreccia;
}

/* ------------------------------------------------------------------ hook */

export function useSwipeDeck({ count, media = MAZZO_MEDIA, onCambio }: OpzioniMazzo): Mazzo {
  const n = Math.max(0, Math.floor(count));
  const inMedia = useMedia(media);
  const attivo = inMedia && n > 1;
  const ridotto = useImpronta((s) => s.reducedMotion);

  const idGrezzo = useId();
  const filaId = `imp-mazzo-${idGrezzo.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const fila = useRef<HTMLElement | null>(null);
  const pezzi = useRef<(HTMLElement | null)[]>([]);
  const [indice, setIndice] = useState(0);
  const indiceRef = useRef(0);
  const attivoRef = useRef(attivo);
  attivoRef.current = attivo;
  const ridottoRef = useRef(ridotto);
  ridottoRef.current = ridotto;
  const cambio = useRef(onCambio);
  cambio.current = onCambio;

  const imposta = useCallback((i: number) => {
    if (i === indiceRef.current) return;
    indiceRef.current = i;
    setIndice(i);
    cambio.current?.(i);
  }, []);

  /* ---------- pezzo in vista: IntersectionObserver con radice la fila */

  useEffect(() => {
    if (!attivo) return undefined;
    const radice = fila.current;
    if (!radice || typeof IntersectionObserver === 'undefined') return undefined;
    const quote = new Map<Element, number>();
    const osservatore = new IntersectionObserver(
      (voci) => {
        for (const v of voci) quote.set(v.target, v.intersectionRatio);
        let migliore = -1;
        let massimo = 0;
        pezzi.current.forEach((el, i) => {
          if (!el || i >= n) return;
          const q = quote.get(el) ?? 0;
          if (q > massimo + 0.001) {
            massimo = q;
            migliore = i;
          }
        });
        if (migliore >= 0 && massimo >= SOGLIA_IN_VISTA) imposta(migliore);
      },
      { root: radice, threshold: [0, 0.25, SOGLIA_IN_VISTA, 0.75, 1] },
    );
    pezzi.current.forEach((el, i) => {
      if (el && i < n) osservatore.observe(el);
    });
    return () => osservatore.disconnect();
  }, [attivo, n, imposta]);

  /* ---------- se il numero di pezzi scende, l'indice resta valido */

  useEffect(() => {
    if (indiceRef.current > n - 1) imposta(Math.max(0, n - 1));
  }, [n, imposta]);

  /* ---------- navigazione */

  const vai = useCallback(
    (i: number, spostaFocus = false) => {
      if (n === 0) return;
      const bersaglio = Math.max(0, Math.min(n - 1, i));
      imposta(bersaglio);
      const radice = fila.current;
      const el = pezzi.current[bersaglio];
      if (!radice || !el) return;
      if (attivoRef.current) {
        const rf = radice.getBoundingClientRect();
        const rp = el.getBoundingClientRect();
        const stile = window.getComputedStyle(radice);
        const margine = Number.parseFloat(stile.scrollPaddingInlineStart || stile.scrollPaddingLeft);
        const sinistra = radice.scrollLeft + (rp.left - rf.left) - (Number.isFinite(margine) ? margine : 0);
        radice.scrollTo({ left: Math.max(0, sinistra), behavior: ridottoRef.current ? 'auto' : 'smooth' });
      }
      if (spostaFocus) {
        const primo = el.querySelector<HTMLElement>(FOCUSABILI);
        primo?.focus({ preventScroll: true });
      }
    },
    [n, imposta],
  );

  const precedente = useCallback(() => vai(indiceRef.current - 1), [vai]);
  const successivo = useCallback(() => vai(indiceRef.current + 1), [vai]);

  /* ---------- props */

  const refFila = useCallback((el: HTMLElement | null) => {
    fila.current = el;
  }, []);

  const onFocus = useCallback(
    (e: ReactFocusEvent<HTMLElement>) => {
      if (!attivoRef.current) return;
      const t = e.target;
      const i = pezzi.current.findIndex((el) => el !== null && el.contains(t));
      if (i >= 0 && i !== indiceRef.current) vai(i);
    },
    [vai],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (!attivoRef.current) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return;
      e.preventDefault();
      const dentro = pezzi.current.some((el) => el !== null && el.contains(t as Node));
      vai(indiceRef.current + (e.key === 'ArrowRight' ? 1 : -1), dentro);
    },
    [vai],
  );

  const refPezzi = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => (el: HTMLElement | null) => {
        pezzi.current[i] = el;
      }),
    [n],
  );

  const pezzoProps = useCallback(
    (i: number): PropsPezzo => ({
      ref: refPezzi[i] ?? (() => undefined),
      'data-imp-ix-indice': i,
      'data-imp-ix-in-vista': i === indice ? 'si' : 'no',
    }),
    [refPezzi, indice],
  );

  const nomeProps = useCallback(
    (i: number): PropsNome => ({
      type: 'button',
      'aria-controls': filaId,
      'aria-current': attivo && i === indice ? 'true' : undefined,
      onClick: () => vai(i),
    }),
    [filaId, attivo, indice, vai],
  );

  const filaProps = useMemo<PropsFila>(
    () => ({
      ref: refFila,
      id: filaId,
      'data-imp-ix-mazzo': attivo ? 'attivo' : 'spento',
      onFocus,
      onKeyDown,
    }),
    [refFila, filaId, attivo, onFocus, onKeyDown],
  );

  const precedenteProps = useMemo<PropsFreccia>(
    () => ({
      type: 'button',
      'aria-controls': filaId,
      'aria-disabled': indice <= 0 ? true : undefined,
      onClick: precedente,
    }),
    [filaId, indice, precedente],
  );

  const successivoProps = useMemo<PropsFreccia>(
    () => ({
      type: 'button',
      'aria-controls': filaId,
      'aria-disabled': indice >= n - 1 ? true : undefined,
      onClick: successivo,
    }),
    [filaId, indice, n, successivo],
  );

  return {
    attivo,
    indice,
    count: n,
    vai,
    precedente,
    successivo,
    filaProps,
    pezzoProps,
    nomeProps,
    precedenteProps,
    successivoProps,
  };
}
