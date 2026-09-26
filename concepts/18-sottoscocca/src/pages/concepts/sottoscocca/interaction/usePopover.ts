/**
 * SOTTOSCOCCA · piccolo pannello non modale legato a un bottone.
 *
 * Serve al "Modifica" della barra "Il tuo lavoro" (ux-architect 5.0 e 7.6):
 * un elenco dei lavori con "Togli" per ciascuno, sopra la barra.
 * - il bottone ha `aria-expanded` e `aria-controls`;
 * - all'apertura il fuoco va al primo controllo del pannello (o al pannello,
 *   se non ne ha); Esc chiude e riporta il fuoco al bottone;
 * - un clic o un tocco fuori da bottone e pannello chiude senza spostare il
 *   fuoco (chi ha toccato altrove ha già scelto dove andare);
 * - Tab che esce dal pannello lo chiude (il fuoco prosegue dove va);
 * - se l'elemento che aveva il fuoco sparisce (ultimo "Togli"), il fuoco torna
 *   al bottone invece di perdersi sul body: `riportaFuoco()`.
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';
import { focusabili } from './util';

export interface Popover {
  readonly aperto: boolean;
  apri(): void;
  chiudi(riportaFuoco?: boolean): void;
  commuta(): void;
  /** Riporta il fuoco al bottone (per esempio dopo aver tolto l'ultima voce). */
  riportaFuoco(): void;
  readonly propsBottone: {
    readonly ref: RefObject<HTMLButtonElement>;
    readonly type: 'button';
    readonly 'aria-expanded': boolean;
    readonly 'aria-controls': string;
    readonly onClick: () => void;
  };
  readonly propsPannello: {
    readonly ref: RefObject<HTMLDivElement>;
    readonly id: string;
    readonly hidden: boolean;
    readonly tabIndex: -1;
    readonly onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
    readonly onBlur: (e: ReactFocusEvent<HTMLElement>) => void;
  };
}

export function usePopover(id: string): Popover {
  const [aperto, setAperto] = useState(false);
  const refBottone = useRef<HTMLButtonElement>(null);
  const refPannello = useRef<HTMLDivElement>(null);
  const fuocoAlPannello = useRef(false);

  const riportaFuoco = useCallback(() => {
    refBottone.current?.focus();
  }, []);

  const chiudi = useCallback(
    (riporta = true) => {
      setAperto(false);
      if (riporta) riportaFuoco();
    },
    [riportaFuoco],
  );

  const apri = useCallback(() => {
    fuocoAlPannello.current = true;
    setAperto(true);
  }, []);

  const commuta = useCallback(() => {
    if (aperto) chiudi(false);
    else apri();
  }, [apri, aperto, chiudi]);

  // Fuoco dentro all'apertura.
  useEffect(() => {
    if (!aperto || !fuocoAlPannello.current) return;
    fuocoAlPannello.current = false;
    const pannello = refPannello.current;
    if (!pannello) return;
    const primo = focusabili(pannello)[0];
    (primo ?? pannello).focus();
  }, [aperto]);

  // Clic o tocco fuori: chiude senza spostare il fuoco.
  useEffect(() => {
    if (!aperto) return undefined;
    const doc = refPannello.current?.ownerDocument ?? document;
    const onDown = (e: PointerEvent) => {
      const bersaglio = e.target;
      if (!(bersaglio instanceof Node)) return;
      if (refPannello.current?.contains(bersaglio) || refBottone.current?.contains(bersaglio)) return;
      setAperto(false);
    };
    doc.addEventListener('pointerdown', onDown, true);
    return () => doc.removeEventListener('pointerdown', onDown, true);
  }, [aperto]);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      chiudi(true);
    },
    [chiudi],
  );

  const onBlur = useCallback((e: ReactFocusEvent<HTMLElement>) => {
    const verso = e.relatedTarget;
    if (verso === null) return; // fuoco perso per un elemento tolto: se ne occupa riportaFuoco()
    if (refPannello.current?.contains(verso) || refBottone.current === verso) return;
    setAperto(false);
  }, []);

  return useMemo(
    () => ({
      aperto,
      apri,
      chiudi,
      commuta,
      riportaFuoco,
      propsBottone: {
        ref: refBottone,
        type: 'button' as const,
        'aria-expanded': aperto,
        'aria-controls': id,
        onClick: commuta,
      },
      propsPannello: {
        ref: refPannello,
        id,
        hidden: !aperto,
        tabIndex: -1 as const,
        onKeyDown,
        onBlur,
      },
    }),
    [aperto, apri, chiudi, commuta, id, onBlur, onKeyDown, riportaFuoco],
  );
}
