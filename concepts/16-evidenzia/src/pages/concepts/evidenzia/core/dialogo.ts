/**
 * EVIDENZIA · i due livelli sopra il foglio: scheda e giro (tech-architect
 * §9.1, ux-architect §1 "history", 6.6, 6.9).
 *
 * `useDialogo(ref, opz)` si monta nel componente del pannello (Scheda.tsx,
 * Giro.tsx), che Evidenzia.tsx monta SOLO quando il livello è aperto. Fa:
 * - **history**: all'apertura `pushState` con l'hash del livello
 *   (`#scheda-214`, `#giro`) sulla stessa rotta; se l'URL ha già quell'hash
 *   (arrivo diretto) non aggiunge voci. Il tasto indietro (popstate verso una
 *   voce non nostra) chiude il livello chiamando `onChiudi('storia')`. Alla
 *   chiusura dal bottone o con Esc (smontaggio) fa `history.back()` solo se
 *   la voce in cima è la nostra, altrimenti `replaceState` senza hash: indietro
 *   non esce mai dal concept per sbaglio e le voci non si accumulano;
 * - **inert** su tutto il resto di `.evd-root` (foglio, molo, salti), tranne
 *   il pannello stesso, la regione live (`data-evd-vivo`) e il bottone
 *   "Torna in Ciceri Lab" del sito (resta cliccabile, fuori dal ciclo di Tab);
 * - **trappola del fuoco**: Tab e Maiusc+Tab girano dentro il pannello;
 * - **Esc**: `onChiudi('esc')` (se nessun altro l'ha già usato: il gesto del
 *   tratto e il trascinamento delle tappe fermano l'evento);
 * - **fuoco**: all'apertura su `fuocoIniziale` (il titolo, `tabIndex={-1}`);
 *   allo smontaggio su `ritornoFuoco()` (l'attacco dell'annuncio, il bottone
 *   Prepara il giro).
 *
 * `onChiudi` NON smonta niente da sé: il pannello fa la sua animazione di
 * chiusura (rimetti, nascondiVelo) e poi chiama `chiudiScheda()` /
 * `chiudiGiro()`. Nessun accesso al browser a livello di modulo.
 */

import { useEffect, useRef, type RefObject } from 'react';

export type TipoLivello = 'scheda' | 'giro';
export type MotivoChiusura = 'esc' | 'storia';

export const HASH_GIRO = '#giro';

/** "#scheda-214" da "214" o "rif-214". */
export function hashScheda(rif: string): string {
  return `#scheda-${rif.replace(/^rif-/, '')}`;
}

export interface OpzioniDialogo {
  readonly tipo: TipoLivello;
  /** `hashScheda(a.rif)` o `HASH_GIRO` */
  readonly hash: string;
  readonly onChiudi: (motivo: MotivoChiusura) => void;
  readonly fuocoIniziale?: RefObject<HTMLElement>;
  readonly ritornoFuoco?: () => HTMLElement | null;
}

const FOCALIZZABILI =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

function visibile(el: HTMLElement): boolean {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
}

function focalizzabili(radice: HTMLElement): HTMLElement[] {
  return Array.from(radice.querySelectorAll<HTMLElement>(FOCALIZZABILI)).filter(
    (el) => !el.closest('[inert]') && visibile(el),
  );
}

interface StatoStoria {
  evd?: TipoLivello;
  [k: string]: unknown;
}

function statoStoria(): StatoStoria | null {
  const s: unknown = window.history.state;
  return typeof s === 'object' && s !== null ? (s as StatoStoria) : null;
}

function urlSenzaHash(): string {
  return `${window.location.pathname}${window.location.search}`;
}

/** Chiusura rimandata di un tick: regge il doppio montaggio di StrictMode senza voci doppie. */
let chiusuraInSospeso: { tipo: TipoLivello; timer: number } | null = null;

export function useDialogo(ref: RefObject<HTMLElement>, opz: OpzioniDialogo): void {
  const opzRef = useRef(opz);
  opzRef.current = opz;

  // history (una volta per montaggio)
  useEffect(() => {
    const { tipo, hash } = opzRef.current;
    let origine: 'push' | 'url';
    if (chiusuraInSospeso !== null && chiusuraInSospeso.tipo === tipo) {
      // rimontaggio immediato (StrictMode): la voce è ancora la nostra
      window.clearTimeout(chiusuraInSospeso.timer);
      chiusuraInSospeso = null;
      origine = statoStoria()?.evd === tipo ? 'push' : 'url';
    } else if (window.location.hash === hash) {
      origine = 'url';
    } else {
      origine = 'push';
      window.history.pushState({ ...(statoStoria() ?? {}), evd: tipo }, '', `${urlSenzaHash()}${hash}`);
    }

    let chiusoDaStoria = false;
    const suPop = (): void => {
      if (window.location.hash === hash) return;
      chiusoDaStoria = true;
      opzRef.current.onChiudi('storia');
    };
    window.addEventListener('popstate', suPop);

    return () => {
      window.removeEventListener('popstate', suPop);
      if (chiusoDaStoria) return;
      const timer = window.setTimeout(() => {
        chiusuraInSospeso = null;
        if (origine === 'push' && statoStoria()?.evd === tipo && window.location.hash === hash) {
          window.history.back();
        } else if (window.location.hash === hash) {
          window.history.replaceState(statoStoria(), '', urlSenzaHash());
        }
      }, 0);
      chiusuraInSospeso = { tipo, timer };
    };
  }, []);

  // inert, trappola del fuoco, Esc, fuoco iniziale e di ritorno
  useEffect(() => {
    const pannello = ref.current;
    if (pannello === null) return undefined;
    const radice = pannello.closest<HTMLElement>('.evd-root');
    const resi: { el: HTMLElement; prima: boolean }[] = [];
    if (radice !== null) {
      for (const figlio of Array.from(radice.children)) {
        if (!(figlio instanceof HTMLElement)) continue;
        if (figlio.contains(pannello) || figlio.hasAttribute('data-evd-vivo') || figlio.classList.contains('cl-backbtn')) continue;
        if (figlio.tagName === 'STYLE' || figlio.tagName === 'SCRIPT') continue;
        resi.push({ el: figlio, prima: figlio.inert });
        figlio.inert = true;
      }
    }

    const suTasto = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (e.defaultPrevented) return;
        e.preventDefault();
        opzRef.current.onChiudi('esc');
        return;
      }
      if (e.key !== 'Tab') return;
      const elenco = focalizzabili(pannello);
      const primo = elenco[0];
      const ultimo = elenco[elenco.length - 1];
      if (primo === undefined || ultimo === undefined) {
        e.preventDefault();
        return;
      }
      const attivo = document.activeElement;
      const dentro = attivo instanceof Node && pannello.contains(attivo);
      if (e.shiftKey && (attivo === primo || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (attivo === ultimo || !dentro)) {
        e.preventDefault();
        primo.focus();
      }
    };
    document.addEventListener('keydown', suTasto);

    const iniziale = opzRef.current.fuocoIniziale?.current ?? null;
    (iniziale ?? pannello).focus({ preventScroll: true });

    return () => {
      document.removeEventListener('keydown', suTasto);
      for (const r of resi) r.el.inert = r.prima;
      const ritorno = opzRef.current.ritornoFuoco?.() ?? null;
      ritorno?.focus({ preventScroll: true });
    };
  }, [ref]);
}
