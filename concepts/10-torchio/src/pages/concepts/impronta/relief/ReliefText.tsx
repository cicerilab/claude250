/**
 * IMPRONTA · il "fantasma" DOM di un testo a rilievo (tech-architect §7.3).
 *
 * È un elemento vero, con classe `imp-relief`, che:
 * - dà IL RETTANGOLO al registro (si registra da solo con `useRelief`);
 * - dà LO STILE alla maschera: webgl/maskPainter.ts legge il suo
 *   `getComputedStyle` (famiglia, corpo, assi, spaziatura, interlinea), così
 *   DOM e rilievo coincidono al pixel;
 * - è IL FALLBACK: con `data-gl="pending|off"` si vede con il rilievo in
 *   text-shadow di styles/relief-fallback.css; con `data-gl="on"` diventa
 *   trasparente (resta per layout, selezione e misura).
 *
 * Uso (art-director §3.3, motion-designer §6.1):
 *
 *   const ref = useRef<HTMLElement>(null);
 *   const [reliefId, setReliefId] = useState<string | null>(null);
 *   usePressione(ref, { profilo: HERO.profilo, reliefId, ingresso: 'montaggio' });
 *   <ReliefText ref={ref} as="div" onRegistrato={setReliefId} {...ATTESA_PRESSA}
 *     className="imp-hero__parola imp-pressa imp-secco" aria-hidden="true">impronta</ReliefText>
 *
 * `aria-hidden="true"` va messo da chi lo usa quando il testo ripete un testo
 * già leggibile altrove; altrimenti il fantasma è testo normale.
 */

import { createElement, forwardRef, useCallback, useEffect, useRef, type HTMLAttributes, type Ref } from 'react';
import type { Carta } from '../state/store';
import type { ReliefSpec, TecnicaRilievo, TrackingRilievo } from './types';
import { useRelief } from './useRelief';

export type TagFantasma =
  | 'span'
  | 'div'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'strong'
  | 'em'
  | 'li'
  | 'dt'
  | 'dd'
  | 'figcaption'
  | 'blockquote'
  | 'address';

export interface ReliefTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'slot'> {
  /** Il testo premuto (solo testo: è quello che finisce nella maschera). */
  children: string;
  /** Elemento da rendere. Default 'span'. */
  as?: TagFantasma;
  /** Default 'secco'. */
  tecnica?: TecnicaRilievo;
  /** 0..1, default 1. */
  profondita?: number;
  /** Default 'doc'; 'live' dentro contenitori sticky o trasformati. */
  tracking?: TrackingRilievo;
  /** Carta propria (solo dentro un pezzo di Per chi o la prova del Banco). */
  carta?: Carta;
  /** Gradi, orari. */
  rotazione?: number;
  /** Riserva nell'atlante (testo che cambia a ogni tasto): `spec.slot`. */
  slotAtlante?: ReliefSpec['slot'];
  priorita?: number;
  /** false = solo DOM, nessuna registrazione (default true). */
  registra?: boolean;
  /** Riceve l'id del registro (null prima della registrazione e dopo lo smontaggio). */
  onRegistrato?: (id: string | null) => void;
}

function assegnaRef<T>(ref: Ref<T> | undefined, valore: T | null): void {
  if (ref === undefined || ref === null) return;
  if (typeof ref === 'function') {
    ref(valore);
    return;
  }
  (ref as { current: T | null }).current = valore;
}

export const ReliefText = forwardRef<HTMLElement, ReliefTextProps>(function ReliefText(
  {
    children,
    as = 'span',
    tecnica = 'secco',
    profondita = 1,
    tracking = 'doc',
    carta,
    rotazione,
    slotAtlante,
    priorita,
    registra = true,
    onRegistrato,
    className,
    ...resto
  },
  refEsterno,
) {
  const interno = useRef<HTMLElement | null>(null);

  const spec: ReliefSpec = {
    kind: 'text',
    text: children,
    tecnica,
    profondita,
    tracking,
    carta,
    rotazione,
    slot: slotAtlante,
    priorita,
  };
  const id = useRelief(interno, spec, { attivo: registra });

  const avvisa = useRef(onRegistrato);
  useEffect(() => {
    avvisa.current = onRegistrato;
  });
  useEffect(() => {
    avvisa.current?.(id);
  }, [id]);

  const refUnito = useCallback(
    (el: HTMLElement | null) => {
      interno.current = el;
      assegnaRef(refEsterno, el);
    },
    [refEsterno],
  );

  const classi = className !== undefined && className.length > 0 ? `imp-relief ${className}` : 'imp-relief';

  return createElement(as, { ...resto, ref: refUnito, className: classi }, children);
});
