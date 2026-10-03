/**
 * MADRE · variabili CSS scritte dal movimento (motion-designer,
 * docs/motion-designer.md §8).
 *
 * Regola (ruoli-agent, tech-architect §5): il movimento scrive variabili CSS
 * solo sugli elementi foglia marcati `data-madvar`, solo quando il valore
 * cambia, sempre nella fase 'write' del ticker. Mai React state per valori
 * caldi, mai `style` di elementi con figli che dipendono da quelle variabili.
 *
 * - `scriviVar(el, nome, valore)`: scrittura con memoria (WeakMap): se il
 *   valore è uguale all'ultimo scritto non tocca il DOM.
 * - `useMotionVar` / `useMotionVars`: registrano una funzione nella fase
 *   'write' che legge valori caldi (runtime, mai il layout) e li scrive.
 * - `useVarFoglio`: il foglio azzurro della vetrina (`--mad-foglio-x`).
 * - `useVariabiliMotion`: curve e durate su `.mad-root` (le usa Madre.tsx).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from 'react';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { store, useMadre } from '../state/store';
import { variabiliMotion } from './choreography';
import { geometriaFoglio, traslazioneFoglio } from './foglio';
import { mezzoPixel } from './easing';

export type NomeVar = `--mad-${string}`;
export type ValoreVar = string | number;

const ultimi = new WeakMap<HTMLElement, Map<string, string>>();
const avvisati = new WeakSet<HTMLElement>();

function controllaFoglia(el: HTMLElement): void {
  if (!import.meta.env.DEV || avvisati.has(el)) return;
  if (!el.hasAttribute('data-madvar')) {
    avvisati.add(el);
    console.warn('[madre/motion] variabile scritta su un elemento senza data-madvar', el);
  }
}

/**
 * Scrive `nome` su `el` solo se diverso dall'ultimo valore scritto da qui.
 * `null` toglie la variabile (torna il valore del CSS). Restituisce true se
 * ha toccato il DOM. Da chiamare solo nella fase 'write' del ticker.
 */
export function scriviVar(el: HTMLElement, nome: NomeVar, valore: string | null): boolean {
  controllaFoglia(el);
  let memoria = ultimi.get(el);
  if (memoria === undefined) {
    memoria = new Map<string, string>();
    ultimi.set(el, memoria);
  }
  const prima = memoria.get(nome);
  if (valore === null) {
    if (prima === undefined) return false;
    el.style.removeProperty(nome);
    memoria.delete(nome);
    return true;
  }
  if (prima === valore) return false;
  el.style.setProperty(nome, valore);
  memoria.set(nome, valore);
  return true;
}

/** Numero → stringa CSS con al massimo `decimali` cifre (niente "0.30000000000000004px"). */
export function formattaVar(valore: number, unita = '', decimali = 3): string {
  const n = Number(valore.toFixed(decimali));
  return `${Object.is(n, -0) ? 0 : n}${unita}`;
}

export interface OpzioniVar {
  /** Unità aggiunta ai numeri ('px', 'deg', ''…). Default ''. */
  unita?: string;
  /** Cifre decimali dei numeri. Default 3. */
  decimali?: number;
  /** false = non registra niente (e toglie la variabile). Default true. */
  attivo?: boolean;
}

/**
 * Registra nella fase 'write' la scrittura di una variabile sulla foglia
 * `ref`. `leggi` gira a ogni frame del ticker: deve leggere solo valori caldi
 * (runtime, store.get()), mai il layout. `null` = togli la variabile.
 * Allo smontaggio la variabile viene tolta.
 */
export function useMotionVar(
  ref: RefObject<HTMLElement | null>,
  nome: NomeVar,
  leggi: () => ValoreVar | null,
  opzioni: OpzioniVar = {},
): void {
  const { unita = '', decimali = 3, attivo = true } = opzioni;
  const leggiRef = useRef(leggi);

  useEffect(() => {
    leggiRef.current = leggi;
  });

  useEffect(() => {
    if (!attivo) return undefined;
    let ultimoEl: HTMLElement | null = null;
    const togli = ticker.add(() => {
      const el = ref.current;
      if (el === null) return;
      ultimoEl = el;
      const v = leggiRef.current();
      scriviVar(el, nome, v === null ? null : typeof v === 'number' ? formattaVar(v, unita, decimali) : v);
    }, 'write');
    return () => {
      togli();
      if (ultimoEl !== null) scriviVar(ultimoEl, nome, null);
    };
  }, [ref, nome, unita, decimali, attivo]);
}

/**
 * Come `useMotionVar` ma per più variabili sulla stessa foglia. I numeri
 * vanno già con l'unità come stringa ("12px"), oppure senza unità.
 * Una chiave assente nel risultato (o `null` come risultato) toglie le
 * variabili scritte prima.
 */
export function useMotionVars(
  ref: RefObject<HTMLElement | null>,
  leggi: () => Readonly<Partial<Record<NomeVar, ValoreVar>>> | null,
  attivo = true,
): void {
  const leggiRef = useRef(leggi);

  useEffect(() => {
    leggiRef.current = leggi;
  });

  useEffect(() => {
    if (!attivo) return undefined;
    let ultimoEl: HTMLElement | null = null;
    const scritte = new Set<NomeVar>();
    const togli = ticker.add(() => {
      const el = ref.current;
      if (el === null) return;
      ultimoEl = el;
      const valori = leggiRef.current();
      const viste = new Set<NomeVar>();
      if (valori !== null) {
        for (const chiave of Object.keys(valori) as NomeVar[]) {
          const v = valori[chiave];
          if (v === undefined) continue;
          viste.add(chiave);
          scritte.add(chiave);
          scriviVar(el, chiave, typeof v === 'number' ? formattaVar(v) : v);
        }
      }
      for (const chiave of scritte) {
        if (!viste.has(chiave)) {
          scriviVar(el, chiave, null);
          scritte.delete(chiave);
        }
      }
    }, 'write');
    return () => {
      togli();
      if (ultimoEl !== null) for (const chiave of scritte) scriviVar(ultimoEl, chiave, null);
    };
  }, [ref, attivo]);
}

export interface OpzioniFoglio {
  /**
   * px tra il bordo sinistro del banco dei dolci e il bordo del foglio a
   * riposo (positivo = il foglio comincia prima del cartello). Default 0.
   */
  rientro?: number;
}

/**
 * Il foglio azzurro della vetrina. Scrive `--mad-foglio-x` (px, tra 0 e la
 * larghezza della finestra) sulla foglia `ref` (sections/Bancone/Foglio.tsx),
 * nella fase 'write', dopo che vetrina/cammino.ts ha aggiornato
 * `runtime.vetrina.x` in 'update'. Finché la vetrina non è misurata, o se
 * non cammina (modo in colonna, prerender), toglie la variabile: il CSS deve
 * allora tenere il foglio fuori (`var(--mad-foglio-x, 100%)`).
 */
export function useVarFoglio(ref: RefObject<HTMLElement | null>, opzioni: OpzioniFoglio = {}): void {
  const rientro = opzioni.rientro ?? 0;
  useMotionVar(ref, '--mad-foglio-x', () => {
    const vetrina = runtime.vetrina;
    const w = runtime.viewport.w;
    const tratto = vetrina.tratti.dolci;
    if (tratto === undefined || vetrina.corsa <= 0 || w <= 0 || tratto.a <= tratto.da) return null;
    const g = geometriaFoglio(tratto.da - rientro, w);
    return `${mezzoPixel(traslazioneFoglio(vetrina.x, g, store.get().reducedMotion))}px`;
  });
}

/**
 * Curve e durate del movimento come style di `.mad-root`
 * (`<div className="mad-root" style={useVariabiliMotion()}>`), aggiornate
 * quando cambia la preferenza di reduced motion.
 */
export function useVariabiliMotion(): CSSProperties {
  const ridotto = useMadre((s) => s.reducedMotion);
  return useMemo<CSSProperties>(() => ({ ...variabiliMotion(ridotto) }), [ridotto]);
}
