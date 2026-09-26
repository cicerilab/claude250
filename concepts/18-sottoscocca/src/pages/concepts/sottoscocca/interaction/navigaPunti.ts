/**
 * SOTTOSCOCCA · tastiera e puntatore sui punti toccabili di una quota.
 *
 * ux-architect 7.4, creative-director 4.3:
 * - i punti di una quota sono un gruppo (`role="group"`, etichetta "Pezzi a
 *   80 centimetri", la scrive Punti/PuntiQuota.tsx); un solo punto del gruppo
 *   è nella tabulazione (ROVING TABINDEX): Tab entra nel gruppo e ne esce con
 *   un colpo solo, così chi usa la tastiera non attraversa sei cerchi;
 * - frecce destra/giù: punto successivo; sinistra/su: precedente (in ordine
 *   davanti → dietro, cioè l'ordine di `ids`); si gira in tondo;
 * - Home / Fine: primo / ultimo punto;
 * - Invio e Spazio aprono la scheda con il clic nativo del `<button>` (il
 *   componente mette `onClick`), quindi funziona anche con i lettori di
 *   schermo e il controllo vocale, che non mandano tasti;
 * - puntatore fine sopra il punto, o fuoco sul punto: il pezzo si evidenzia
 *   nella scena (interaction/evidenza.ts, al massimo un cambio ogni 500 ms) e
 *   l'etichetta compare (CSS di interaction.css). Il dito non fa "hover".
 *
 * Il fuoco non fa scorrere la pagina (`preventScroll`): i punti sono `fixed`
 * sopra la scena e già in vista, uno scroll li sposterebbe con il ponte.
 *
 * Uso (sections/Punti/PuntiQuota.tsx e Punto.tsx):
 *
 *   const nav = useNavigaPunti(idsDellaQuota);
 *   <ul role="group" aria-labelledby={...}>
 *     {idsDellaQuota.map((id) => {
 *       const p = nav.propsPunto(id);
 *       return <li key={id}><button type="button" {...p} ref={unisciRef(p.ref, refRegistro)} ...>;
 *     })}
 *   </ul>
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefCallback,
} from 'react';
import type { IdPunto } from '../content/lavori';
import { segnalaIndicato } from './evidenza';
import { eTastoModificato, eVisibile } from './util';

export type PassoPunti = 1 | -1 | 'primo' | 'ultimo';

export interface PropsPunto {
  readonly ref: RefCallback<HTMLElement>;
  readonly tabIndex: 0 | -1;
  readonly onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  readonly onFocus: (e: ReactFocusEvent<HTMLElement>) => void;
  readonly onBlur: (e: ReactFocusEvent<HTMLElement>) => void;
  readonly onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => void;
  readonly onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => void;
  /** Il punto che ha il tabindex 0 del gruppo (utile allo stile, non obbligatorio). */
  readonly 'data-ssc-ix-corrente': 'si' | undefined;
}

export interface NavigaPunti {
  /** Il punto del gruppo che riceve il Tab. */
  readonly corrente: IdPunto | null;
  /** Props da stendere sul `<button>` del punto `id`. */
  propsPunto(id: IdPunto): PropsPunto;
  /** Porta il fuoco a un punto del gruppo (per chi ne ha bisogno da fuori, es. ritorno dalla scheda). */
  focalizza(id: IdPunto): void;
}

const TASTI: Readonly<Record<string, PassoPunti>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
  Home: 'primo',
  End: 'ultimo',
};

function ePuntatoreFine(e: ReactPointerEvent<HTMLElement>): boolean {
  return e.pointerType === 'mouse' || e.pointerType === 'pen';
}

export function useNavigaPunti(ids: readonly IdPunto[]): NavigaPunti {
  const [scelto, setScelto] = useState<IdPunto | null>(null);
  const elementi = useRef(new Map<IdPunto, HTMLElement>());
  const refCache = useRef(new Map<IdPunto, RefCallback<HTMLElement>>());

  const corrente: IdPunto | null =
    scelto !== null && ids.includes(scelto) ? scelto : (ids[0] ?? null);

  const refDi = useCallback((id: IdPunto): RefCallback<HTMLElement> => {
    const esistente = refCache.current.get(id);
    if (esistente) return esistente;
    const nuovo: RefCallback<HTMLElement> = (el) => {
      if (el) elementi.current.set(id, el);
      else elementi.current.delete(id);
    };
    refCache.current.set(id, nuovo);
    return nuovo;
  }, []);

  const focalizza = useCallback((id: IdPunto) => {
    const el = elementi.current.get(id);
    if (!el) return;
    setScelto(id);
    el.focus({ preventScroll: true });
  }, []);

  const bersaglio = useCallback(
    (da: IdPunto, passo: PassoPunti): IdPunto | null => {
      // Solo i punti davvero raggiungibili adesso (non `hidden`, con un box).
      const vivi = ids.filter((id) => {
        const el = elementi.current.get(id);
        return el !== undefined && eVisibile(el);
      });
      if (vivi.length === 0) return null;
      if (passo === 'primo') return vivi[0] ?? null;
      if (passo === 'ultimo') return vivi[vivi.length - 1] ?? null;
      const i = vivi.indexOf(da);
      if (i < 0) return vivi[0] ?? null;
      const j = (i + passo + vivi.length) % vivi.length;
      return vivi[j] ?? null;
    },
    [ids],
  );

  const propsPunto = useCallback(
    (id: IdPunto): PropsPunto => ({
      ref: refDi(id),
      tabIndex: id === corrente ? 0 : -1,
      'data-ssc-ix-corrente': id === corrente ? 'si' : undefined,
      onKeyDown: (e) => {
        if (eTastoModificato(e)) return;
        const passo = TASTI[e.key];
        if (passo === undefined) return;
        const verso = bersaglio(id, passo);
        e.preventDefault();
        if (verso !== null && verso !== id) focalizza(verso);
      },
      onFocus: () => {
        setScelto(id);
        segnalaIndicato(id);
      },
      onBlur: () => {
        segnalaIndicato(null, id);
      },
      onPointerEnter: (e) => {
        if (ePuntatoreFine(e)) segnalaIndicato(id);
      },
      onPointerLeave: (e) => {
        if (!ePuntatoreFine(e)) return;
        // Se il punto ha ancora il fuoco, resta indicato.
        if (e.currentTarget.ownerDocument.activeElement === e.currentTarget) return;
        segnalaIndicato(null, id);
      },
    }),
    [bersaglio, corrente, focalizza, refDi],
  );

  return useMemo(() => ({ corrente, propsPunto, focalizza }), [corrente, propsPunto, focalizza]);
}
