/**
 * NODI · variabili CSS scritte dal movimento.
 *
 * Regola del tech-architect (§5.1): il movimento scrive variabili CSS solo
 * sugli elementi foglia marcati `data-nodvar`, e solo quando il valore
 * cambia. Qui c'è un registro unico con **una sola** funzione nella fase
 * `write` del ticker: per ogni elemento registrato legge i valori (dal
 * runtime, già calcolati nella fase `update`), li quantizza e chiama
 * `style.setProperty` solo se il valore quantizzato è diverso dall'ultimo
 * scritto. Nessuna lettura di layout, nessuna allocazione per frame.
 *
 * Uso tipico (builder del palco, layout stretto):
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   useMotionVars(ref, {
 *     '--nod-palco': { leggi: () => runtime.palco, passo: 0.001 },
 *   });
 *   <div ref={ref} data-nodvar className="nod-palco__riquadro" />
 *
 * e nel CSS `transform: scale(var(--nod-palco, 1))`.
 *
 * La funzione di scrittura non tiene sveglio il ticker: scrive quando il
 * ticker gira per altri motivi (scroll, simulazione, inseguimenti). Alla
 * registrazione scrive subito una volta, così il primo frame è giusto.
 */

import { useEffect, useRef, type RefObject } from 'react';
import { ticker } from '../core/ticker';

/** Una variabile: come leggerla e con che passo quantizzarla. */
export interface SpecVar {
  /** Valore corrente (dal runtime). Deve essere economica: è chiamata ogni frame. */
  readonly leggi: () => number;
  /** Quantizzazione: sotto questo passo un cambio non viene scritto. Default 0,001. */
  readonly passo?: number;
  /** Unità aggiunta al numero ('px', 'deg', '%'). Default nessuna (numero puro). */
  readonly unita?: string;
}

export type NomeVar = `--nod-${string}`;
export type SpecVars = Readonly<Record<NomeVar, SpecVar>>;

interface Voce {
  readonly nome: NomeVar;
  readonly spec: () => SpecVar | undefined;
  ultimo: number;
}

interface Registrazione {
  readonly el: HTMLElement;
  readonly voci: Voce[];
}

const registro = new Set<Registrazione>();
let rimuoviFase: (() => void) | null = null;

function quantizza(v: number, passo: number): number {
  if (!Number.isFinite(v)) return Number.NaN;
  return passo > 0 ? Math.round(v / passo) * passo : v;
}

function decimali(passo: number): number {
  if (!(passo > 0) || passo >= 1) return 0;
  return Math.min(6, Math.ceil(-Math.log10(passo)));
}

function scriviVoce(el: HTMLElement, voce: Voce): void {
  const spec = voce.spec();
  if (!spec) return;
  const passo = spec.passo ?? 0.001;
  const q = quantizza(spec.leggi(), passo);
  if (Number.isNaN(q) || q === voce.ultimo) return;
  voce.ultimo = q;
  el.style.setProperty(voce.nome, `${q.toFixed(decimali(passo))}${spec.unita ?? ''}`);
}

function scriviTutto(): void {
  for (const r of registro) {
    for (const v of r.voci) scriviVoce(r.el, v);
  }
}

function assicuraFase(): void {
  if (rimuoviFase || registro.size === 0) return;
  rimuoviFase = ticker.add(() => {
    scriviTutto();
  }, 'write');
}

function liberaFaseSeVuoto(): void {
  if (registro.size > 0 || !rimuoviFase) return;
  rimuoviFase();
  rimuoviFase = null;
}

/**
 * Registra le variabili di un elemento foglia. Le chiavi devono restare le
 * stesse tra un render e l'altro (le funzioni `leggi` possono cambiare:
 * si usa sempre l'ultima). Con `attivo = false` non registra nulla e
 * rimuove le variabili scritte (il CSS torna al suo valore di ripiego).
 */
export function useMotionVars(ref: RefObject<HTMLElement>, specs: SpecVars, attivo = true): void {
  const ultimeSpecs = useRef<SpecVars>(specs);
  ultimeSpecs.current = specs;
  const chiavi = Object.keys(specs).sort().join('|');

  useEffect(() => {
    const el = ref.current;
    if (!el || !attivo || chiavi === '') return undefined;
    if (import.meta.env.DEV && !el.hasAttribute('data-nodvar')) {
      console.warn('[nodi/motion] useMotionVars su un elemento senza data-nodvar:', el);
    }
    const nomi = chiavi.split('|') as NomeVar[];
    const reg: Registrazione = {
      el,
      voci: nomi.map((nome) => ({ nome, spec: () => ultimeSpecs.current[nome], ultimo: Number.NaN })),
    };
    registro.add(reg);
    for (const v of reg.voci) scriviVoce(el, v);
    assicuraFase();
    ticker.wake();
    return () => {
      registro.delete(reg);
      for (const nome of nomi) el.style.removeProperty(nome);
      liberaFaseSeVuoto();
    };
  }, [ref, chiavi, attivo]);
}

/**
 * Forza la riscrittura di tutte le variabili al prossimo frame (per esempio
 * dopo un cambio di layout largo/stretto, quando lo stesso valore deve
 * essere riapplicato a un elemento appena rimontato).
 */
export function invalidaMotionVars(): void {
  for (const r of registro) {
    for (const v of r.voci) v.ultimo = Number.NaN;
  }
  ticker.wake();
}
