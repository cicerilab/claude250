/**
 * IMPRONTA · hook di registrazione di un blocco a rilievo
 * (tech-architect §7.2, motion-designer §4.4).
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   const reliefId = useRelief(ref, { kind: 'text', tecnica: 'secco', profondita: 1, tracking: 'doc' });
 *   usePressione(ref, { profilo: PROFILI.titolo, reliefId });
 *
 * - Registra al mount (layout effect, prima della pittura) e toglie allo
 *   smontaggio. Restituisce l'id, null fino alla registrazione.
 * - La spec può essere un oggetto scritto inline: il hook confronta i campi
 *   a ogni render e chiama `registry.update` solo se qualcosa è cambiato
 *   (testo, tecnica, layer… incrementano la versione della maschera).
 * - `attivo: false` non registra (utile per blocchi presenti solo su una
 *   larghezza o solo dopo un evento).
 *
 * Nessun accesso al browser a livello di modulo; nel prerender non registra.
 */

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { registry } from './registry';
import type { ReliefSpec } from './types';

/** useLayoutEffect nel browser, useEffect nel prerender (niente avvisi di React). */
const useEffettoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function slotUguali(a: ReliefSpec['slot'], b: ReliefSpec['slot']): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  return a.maxW === b.maxW && a.maxH === b.maxH;
}

/** true se le due spec sono equivalenti (i layer si confrontano per contenuto). */
export function specUguali(a: ReliefSpec, b: ReliefSpec): boolean {
  if (
    a.kind !== b.kind ||
    a.text !== b.text ||
    a.svg !== b.svg ||
    a.tecnica !== b.tecnica ||
    a.carta !== b.carta ||
    a.profondita !== b.profondita ||
    a.rotazione !== b.rotazione ||
    a.tracking !== b.tracking ||
    a.priorita !== b.priorita ||
    !slotUguali(a.slot, b.slot)
  ) {
    return false;
  }
  if (a.layers === b.layers) return true;
  return JSON.stringify(a.layers ?? null) === JSON.stringify(b.layers ?? null);
}

export interface OpzioniUseRelief {
  /** false = non registrare (default true). */
  readonly attivo?: boolean;
}

/** Registra il blocco al mount e restituisce il suo id (null fino alla registrazione). */
export function useRelief(
  ref: RefObject<HTMLElement | null>,
  spec: ReliefSpec,
  opzioni: OpzioniUseRelief = {},
): string | null {
  const attivo = opzioni.attivo ?? true;
  const [id, setId] = useState<string | null>(null);
  const specCorrente = useRef<ReliefSpec>(spec);
  const idCorrente = useRef<string | null>(null);

  // Registrazione: una volta per elemento (e per ogni cambio di `attivo`).
  useEffettoLayout(() => {
    const el = ref.current;
    if (!attivo || el === null) {
      setId(null);
      return undefined;
    }
    const nuovo = registry.register(el, specCorrente.current);
    idCorrente.current = nuovo;
    setId(nuovo);
    return () => {
      registry.unregister(nuovo);
      if (idCorrente.current === nuovo) idCorrente.current = null;
    };
  }, [ref, attivo]);

  // Cambi di spec: confronto per contenuto a ogni render, update solo se serve.
  useEffettoLayout(() => {
    if (specUguali(specCorrente.current, spec)) return;
    specCorrente.current = spec;
    const corrente = idCorrente.current;
    if (corrente !== null) registry.update(corrente, spec);
  });

  return id;
}
