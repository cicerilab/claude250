/**
 * SOTTOSCOCCA · variabili CSS calde sulle foglie (motion-designer).
 *
 * Regola del concept: i valori che cambiano a ogni frame (quota, discesa,
 * opacità della scena) arrivano al CSS solo come variabili scritte inline su
 * elementi FOGLIA marcati `data-sscvar`, solo quando il valore cambia, nella
 * fase `write` del ticker unico. Mai uno stato React per frame, mai una
 * variabile su `.ssc-root` o su un contenitore (ricalcolerebbe gli stili di
 * tutta la pagina).
 *
 * Uso (section-builder-asta, per esempio):
 *
 *   const indice = useRef<HTMLSpanElement>(null);
 *   useMotionVars(indice, CALCOLI.quotaAsta);
 *   const numero = useRef<HTMLSpanElement>(null);
 *   useTestoCaldo(numero, CALCOLI.numeroQuota);
 *   <span ref={indice} data-sscvar className="ssc-asta__indice" />
 *   <span ref={numero} data-sscvar aria-hidden="true" className="ssc-asta__numero" />
 *
 * e nel CSS: `transform: translateY(calc(var(--ssc-quota-asta, 0) * -1 * var(--ssc-asta-corsa)))`.
 *
 * Nessun accesso al browser a livello di modulo: tutto parte in useEffect.
 */

import { useEffect, useRef, type RefObject } from 'react';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { PASSO_NUMERO_ASTA_CM, SCALA_ASTA_CM } from './choreography';

export type Runtime = typeof runtime;
export type NomeVariabile = `--ssc-${string}`;
export type VariabiliFoglia = Readonly<Record<NomeVariabile, number | string>>;
export type CalcolaVariabili = (rt: Runtime) => VariabiliFoglia;
export type CalcolaTesto = (rt: Runtime) => string;

export interface OpzioniVariabili {
  /** Cifre decimali per i numeri (default 4). Meno cifre = meno scritture. */
  readonly decimali?: number;
}

/** Numero → stringa corta e stabile ("0.1234", "1", "0"); le stringhe passano intatte. */
export function formatta(valore: number | string, decimali = 4): string {
  if (typeof valore === 'string') return valore;
  if (!Number.isFinite(valore)) return '0';
  const n = Number(valore.toFixed(decimali));
  return Object.is(n, -0) ? '0' : String(n);
}

function avvisa(messaggio: string, el: Element): void {
  if (import.meta.env.DEV) console.warn(`[sottoscocca/motion] ${messaggio}`, el);
}

/** L'elemento può ricevere variabili calde? Deve essere marcato e senza figli elemento. */
function fogliaValida(el: HTMLElement): boolean {
  if (!el.hasAttribute('data-sscvar')) {
    avvisa('useMotionVars: manca data-sscvar, nessuna variabile scritta', el);
    return false;
  }
  if (el.childElementCount > 0) {
    avvisa('useMotionVars: l’elemento non è una foglia, nessuna variabile scritta', el);
    return false;
  }
  return true;
}

/**
 * Scrive su `ref` le variabili restituite da `calcola`, nella fase `write`,
 * solo quando la stringa formattata cambia. `calcola` può cambiare a ogni
 * render: si usa sempre l'ultima, senza registrare di nuovo il ticker.
 * Allo smontaggio toglie le variabili scritte.
 */
export function useMotionVars<E extends HTMLElement>(
  ref: RefObject<E | null>,
  calcola: CalcolaVariabili,
  opzioni: OpzioniVariabili = {},
): void {
  const calcolaRef = useRef(calcola);
  const decimali = opzioni.decimali ?? 4;

  useEffect(() => {
    calcolaRef.current = calcola;
  });

  useEffect(() => {
    const el = ref.current;
    if (el === null || !fogliaValida(el)) return undefined;
    const scritte = new Map<string, string>();

    const togli = ticker.add(() => {
      const valori = calcolaRef.current(runtime);
      for (const nome in valori) {
        const v = valori[nome as NomeVariabile];
        if (v === undefined) continue;
        const testo = formatta(v, decimali);
        if (scritte.get(nome) !== testo) {
          el.style.setProperty(nome, testo);
          scritte.set(nome, testo);
        }
      }
      return false;
    }, 'write');

    return () => {
      togli();
      scritte.forEach((_, nome) => {
        el.style.removeProperty(nome);
      });
    };
  }, [ref, decimali]);
}

/**
 * Come `useMotionVars` ma per il testo di una foglia (il numero della quota
 * accanto all'indice dell'asta). Scrive `textContent` solo quando cambia.
 * La foglia deve essere `aria-hidden`: lo stato vero è `aria-current` e
 * l'annuncio a plateau.
 */
export function useTestoCaldo<E extends HTMLElement>(ref: RefObject<E | null>, calcola: CalcolaTesto): void {
  const calcolaRef = useRef(calcola);

  useEffect(() => {
    calcolaRef.current = calcola;
  });

  useEffect(() => {
    const el = ref.current;
    if (el === null || !fogliaValida(el)) return undefined;
    let ultimo: string | null = null;

    const togli = ticker.add(() => {
      const testo = calcolaRef.current(runtime);
      if (testo !== ultimo) {
        el.textContent = testo;
        ultimo = testo;
      }
      return false;
    }, 'write');

    return togli;
  }, [ref]);
}

/* ------------------------------------------------------------------ */
/* Calcoli pronti                                                      */
/* ------------------------------------------------------------------ */

/** Quota arrotondata al passo dell'asta (5 cm), mai negativa. */
export function quotaTonda(cm: number): number {
  const q = Math.round(cm / PASSO_NUMERO_ASTA_CM) * PASSO_NUMERO_ASTA_CM;
  return q <= 0 ? 0 : q;
}

export const CALCOLI = {
  /** `--ssc-quota-asta`: quota / fondo scala (0..0,9), per l'indice dell'asta. */
  quotaAsta: (rt: Runtime): VariabiliFoglia => ({ '--ssc-quota-asta': rt.quota.valore / SCALA_ASTA_CM }),
  /** `--ssc-quota`: quota in cm (con l'assestamento), per chi disegna in DOM (fallback). */
  quota: (rt: Runtime): VariabiliFoglia => ({ '--ssc-quota': rt.quota.valore }),
  /** `--ssc-discesa`: 0..1, camera lontana sopra il planning. */
  discesa: (rt: Runtime): VariabiliFoglia => ({ '--ssc-discesa': rt.discesa }),
  /** `--ssc-opacita-scena`: opacità del canvas (e del fondale nel fallback). */
  opacitaScena: (rt: Runtime): VariabiliFoglia => ({ '--ssc-opacita-scena': rt.opacitaScena }),
  /** Testo del numero accanto all'indice: "0", "5", ... "180". */
  numeroQuota: (rt: Runtime): string => String(quotaTonda(rt.quota.valore)),
} as const;
