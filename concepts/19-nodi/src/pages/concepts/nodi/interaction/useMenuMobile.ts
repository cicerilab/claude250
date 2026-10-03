/**
 * NODI · il menu a comparsa dal marchio (interaction-designer).
 *
 * Sotto la colonna del banco (ux-architect §2.4-2.6) il marchio "NODI" in
 * alto a destra è un bottone che apre un pannello con l'indice, "Rimetti le
 * foglie" e la nota sul suono. Logica senza markup né testi: il markup è del
 * section-builder-apertura (sections/Apertura/Testata.tsx, Menu.tsx).
 *
 * Contratto (ux-architect §2.6 e §7.5, più specifico del tech-architect §3,
 * che parlava di trappola del fuoco: vedi docs/interaction-designer.md §4):
 * - disclosure: `button` con `aria-expanded` e `aria-controls`; pannello NON
 *   modale, nessuna trappola del fuoco;
 * - all'apertura il fuoco va alla prima voce del pannello;
 * - Esc chiude e riporta il fuoco al marchio; un tocco o un clic fuori chiude
 *   senza spostare il fuoco; il marchio di nuovo chiude (il fuoco resta lì);
 * - un Tab oltre l'ultima voce (o Maiusc+Tab fuori) chiude il pannello e il
 *   fuoco prosegue nel documento;
 * - scegliere una voce chiude il pannello SENZA riportare il fuoco al
 *   marchio: lo porta il salto all'`h2` di arrivo (ux §2.7);
 * - se il menu non serve più (la finestra diventa larga), si chiude.
 * Lo stato vive nello store (`menuAperto`, azione `apriMenu`): Radice lo
 * riflette in `data-menu="aperto"` su `.nod-root`.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useId, useRef } from 'react';
import type { FocusEvent as ReactFocusEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { apriMenu, useNodi } from '../state/store';

const FOCALIZZABILI =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface OpzioniMenu {
  /** false quando il menu non esiste (colonna del banco visibile): se è aperto si chiude. */
  attivo: boolean;
  /** id del pannello; se manca se ne genera uno. */
  idPannello?: string;
}

export interface PropsBottoneMenu {
  type: 'button';
  'aria-expanded': boolean;
  'aria-controls': string;
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}

export interface PropsPannelloMenu {
  id: string;
  'data-aperto': '' | undefined;
  onBlur: (e: ReactFocusEvent<HTMLDivElement>) => void;
}

export interface MenuMobile {
  aperto: boolean;
  refBottone: RefObject<HTMLButtonElement>;
  refPannello: RefObject<HTMLDivElement>;
  propsBottone: PropsBottoneMenu;
  propsPannello: PropsPannelloMenu;
  /** Chiude; con `fuocoAlBottone` riporta il fuoco al marchio. */
  chiudi: (fuocoAlBottone?: boolean) => void;
  /** Da chiamare nel clic di una voce: chiude senza toccare il fuoco. */
  scelta: () => void;
}

export function useMenuMobile(opz: OpzioniMenu): MenuMobile {
  const { attivo } = opz;
  const generato = useId();
  const idPannello = opz.idPannello ?? `nod-menu-${generato.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const aperto = useNodi((s) => s.menuAperto);
  const refBottone = useRef<HTMLButtonElement>(null);
  const refPannello = useRef<HTMLDivElement>(null);
  /** L'apertura è venuta da un gesto sul marchio: solo allora il fuoco entra nel pannello. */
  const apertoDaGesto = useRef(false);

  const chiudi = useCallback((fuocoAlBottone = false) => {
    apertoDaGesto.current = false;
    apriMenu(false);
    if (fuocoAlBottone) refBottone.current?.focus({ preventScroll: true });
  }, []);

  const scelta = useCallback(() => {
    apertoDaGesto.current = false;
    apriMenu(false);
  }, []);

  const onClick = useCallback(() => {
    if (aperto) {
      chiudi(false);
      return;
    }
    apertoDaGesto.current = true;
    apriMenu(true);
  }, [aperto, chiudi]);

  /* ---- all'apertura il fuoco va alla prima voce */
  useEffect(() => {
    if (!aperto || !apertoDaGesto.current) return;
    apertoDaGesto.current = false;
    const primo = refPannello.current?.querySelector<HTMLElement>(FOCALIZZABILI);
    primo?.focus({ preventScroll: true });
  }, [aperto]);

  /* ---- Esc e clic fuori, solo mentre è aperto */
  useEffect(() => {
    if (!aperto) return undefined;
    const tasto = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      chiudi(true);
    };
    const fuori = (e: PointerEvent): void => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (refPannello.current?.contains(t) || refBottone.current?.contains(t)) return;
      chiudi(false);
    };
    document.addEventListener('keydown', tasto);
    document.addEventListener('pointerdown', fuori, true);
    return () => {
      document.removeEventListener('keydown', tasto);
      document.removeEventListener('pointerdown', fuori, true);
    };
  }, [aperto, chiudi]);

  /* ---- il fuoco esce dal pannello (Tab oltre l'ultima voce): chiude, il fuoco prosegue */
  const onBlur = useCallback(
    (e: ReactFocusEvent<HTMLDivElement>) => {
      if (!aperto) return;
      const verso = e.relatedTarget;
      if (verso === null) return; // la finestra perde il fuoco: si resta come si è
      if (!(verso instanceof Node)) return;
      if (refPannello.current?.contains(verso) || refBottone.current?.contains(verso)) return;
      chiudi(false);
    },
    [aperto, chiudi],
  );

  /* ---- il menu non serve più */
  useEffect(() => {
    if (!attivo && aperto) chiudi(false);
  }, [attivo, aperto, chiudi]);

  /* ---- smontaggio: niente menu aperto lasciato nello store */
  useEffect(() => () => apriMenu(false), []);

  return {
    aperto,
    refBottone,
    refPannello,
    propsBottone: {
      type: 'button',
      'aria-expanded': aperto,
      'aria-controls': idPannello,
      onClick,
    },
    propsPannello: {
      id: idPannello,
      'data-aperto': aperto ? '' : undefined,
      onBlur,
    },
    chiudi,
    scelta,
  };
}
