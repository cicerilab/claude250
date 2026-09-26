/**
 * BATTIFILO · rotella e trackpad a scatti: un mese per gesto (interaction-designer).
 *
 * Il sito non scorre, fa un passo (creative-director §4.3, ux-architect §5.3.3).
 * Si attacca al `<main id="cronaca">` (foto + lastra); dentro le schermate
 * Misura, Cartello e Mesi la rotella resta del browser (sono fuori da `main`
 * e comunque la cronaca è `inert` mentre sono aperte).
 *
 * Due modi, riconosciuti evento per evento (stessa euristica di NOVANTA,
 * già provata):
 * - **scatto** (rotella del mouse a tacche; Firefox in righe): ogni scatto può
 *   fare un passo, ma tra due passi passano almeno `BLOCCO_ROTELLA` (400 ms).
 *   Girare la rotella di corsa dà un passo ogni 400 ms, non quindici mesi.
 * - **continuo** (trackpad, rotelle lisce, Magic Mouse): i delta si sommano
 *   nel gesto; a 40 px accumulati parte UN passo e il resto del gesto è
 *   consumato. Il gesto finisce dopo 180 ms senza eventi. La coda d'inerzia
 *   del trackpad arriva senza pause, quindi fa parte dello stesso gesto e non
 *   fa saltare tre mesi (Chiara e Davide, ux-architect §4.2).
 *
 * Verso: giù e destra = mese dopo; su e sinistra = mese prima. Conta l'asse
 * con il delta maggiore (lo scorrimento orizzontale del trackpad va bene
 * quanto quello verticale).
 *
 * Mai intercettato: `ctrlKey` (pizzico del trackpad e Ctrl + rotella = zoom
 * del browser), i campi, gli elementi `data-btf-ix-rotella="libera"` e le aree
 * `data-btf-ix-scorre` che possono ancora scorrere nel verso del gesto (la
 * lastra espansa da "Di più"). Arrivati in fondo a un'area che scorre, lo
 * stesso gesto non diventa un passo: serve una pausa di 300 ms.
 *
 * Ascoltatore `wheel` con `{ passive: false }`; `preventDefault` solo quando
 * la rotella è nostra (niente rimbalzo della pagina, niente "indietro" del
 * browser col gesto orizzontale del trackpad su Mac). Timer brevi, niente rAF,
 * niente setState.
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { BLOCCO_ROTELLA } from '../motion/choreography';
import { segnaInput } from './attivita';

export const ROTELLA = {
  /** Quiete che chiude un gesto (ux-architect §5.3.3). */
  fineGestoMs: 180,
  /** Delta accumulato che fa un passo nel modo continuo. */
  sogliaPx: 40,
  /** Pausa che separa lo scorrimento di un'area interna da un passo. */
  pausaScrollMs: 300,
  /** Sopra questi px (modo pixel, senza wheelDelta) un evento isolato è uno scatto. */
  scattoMinPx: 50,
  /** Rotelle ad alta risoluzione: più eventi per uno scatto entro questo intervallo. */
  scattoMinIntervalloMs: 40,
} as const;

export interface OpzioniRotella {
  /** Letto a ogni evento: se falso l'evento resta al browser (vista aperta, modo documento). */
  attivo: () => boolean;
  /** Un mese avanti (1) o indietro (-1). Il chiamante fa `segnaSpostamento('rotella')` e `cassetta.passo(verso)`. */
  onPasso: (verso: 1 | -1) => void;
  /** Blocco tra due passi. Default `BLOCCO_ROTELLA` del motion-designer (400 ms). */
  bloccoMs?: number;
}

const SELETTORE_CAMPI = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const SELETTORE_LIBERA = '[data-btf-ix-rotella="libera"]';
const SELETTORE_SCORRE = '[data-btf-ix-scorre]';

/** Evento wheel con i campi legacy di Chrome e Safari (assenti in Firefox). */
type WheelLegacy = WheelEvent & { wheelDeltaY?: number; wheelDeltaX?: number };

/** Delta in px, normalizzato tra deltaMode pixel / righe / pagine. */
export function deltaPx(e: Pick<WheelEvent, 'deltaMode' | 'deltaX' | 'deltaY'>, altezzaPagina: number): { dx: number; dy: number } {
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? altezzaPagina : 1;
  return { dx: e.deltaX * k, dy: e.deltaY * k };
}

/**
 * Scatto di rotella o trackpad? Euristica conservativa:
 * - righe o pagine (Firefox col mouse) → scatto;
 * - Chrome e Safari espongono wheelDelta: sul trackpad vale −3 × delta, sulla
 *   rotella è un multiplo di 120 o comunque diverso;
 * - delta con decimali → continuo; altrimenti un delta grande è uno scatto.
 * Sbagliare cambia solo la sensazione: entrambi i modi fanno un passo.
 */
export function eScatto(e: WheelLegacy, d: number): boolean {
  if (e.deltaMode !== 0) return true;
  const verticale = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
  const legacy = verticale ? e.wheelDeltaY : e.wheelDeltaX;
  const delta = verticale ? e.deltaY : e.deltaX;
  if (typeof legacy === 'number' && legacy !== 0) {
    if (Math.abs(legacy + 3 * delta) <= 1.5) return false;
    return Math.abs(legacy) % 120 === 0 || Math.abs(d) >= ROTELLA.scattoMinPx;
  }
  if (!Number.isInteger(d)) return false;
  return Math.abs(d) >= ROTELLA.scattoMinPx;
}

function puoScorrere(el: HTMLElement, d: number, verticale: boolean): boolean {
  if (verticale) {
    if (el.scrollHeight <= el.clientHeight + 1) return false;
    return d > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 1;
  }
  if (el.scrollWidth <= el.clientWidth + 1) return false;
  return d > 0 ? el.scrollLeft + el.clientWidth < el.scrollWidth - 1 : el.scrollLeft > 1;
}

export function useRotellaAScatti(ref: RefObject<HTMLElement>, o: OpzioniRotella): void {
  const opz = useRef(o);
  useEffect(() => {
    opz.current = o;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const finestra = el.ownerDocument.defaultView;
    if (!finestra) return undefined;

    let inGesto = false;
    let consumato = false;
    let accumulo = 0;
    let timerFine: ReturnType<typeof setTimeout> | null = null;
    let ultimoPasso = Number.NEGATIVE_INFINITY;
    let ultimoScatto = Number.NEGATIVE_INFINITY;
    let versoScatto: 1 | -1 = 1;
    let ultimoScrollNativo = Number.NEGATIVE_INFINITY;

    const blocco = (): number => opz.current.bloccoMs ?? BLOCCO_ROTELLA;

    const fineGesto = (): void => {
      timerFine = null;
      inGesto = false;
      consumato = false;
      accumulo = 0;
    };

    const rinnovaGesto = (): void => {
      if (timerFine !== null) clearTimeout(timerFine);
      timerFine = setTimeout(fineGesto, ROTELLA.fineGestoMs);
    };

    const passo = (verso: 1 | -1, now: number): boolean => {
      if (now - ultimoPasso < blocco()) return false;
      ultimoPasso = now;
      opz.current.onPasso(verso);
      return true;
    };

    const suRotella = (ev: Event): void => {
      const e = ev as WheelLegacy;
      if (e.defaultPrevented || e.ctrlKey) return;
      if (!opz.current.attivo()) return;
      const bersaglio = e.target instanceof Element ? e.target : null;
      if (bersaglio && (bersaglio.closest(SELETTORE_CAMPI) || bersaglio.closest(SELETTORE_LIBERA))) return;

      const { dx, dy } = deltaPx(e, finestra.innerHeight);
      const verticale = Math.abs(dy) >= Math.abs(dx);
      const d = verticale ? dy : dx;
      if (d === 0) return;
      const now = performance.now();

      // Precedenza allo scorrimento di un'area interna (lastra espansa).
      const area = bersaglio?.closest(SELETTORE_SCORRE);
      if (area instanceof HTMLElement && el.contains(area)) {
        if (puoScorrere(area, d, verticale)) {
          ultimoScrollNativo = now;
          segnaInput();
          return;
        }
        if (now - ultimoScrollNativo < ROTELLA.pausaScrollMs) {
          ultimoScrollNativo = now;
          e.preventDefault();
          return;
        }
      }

      e.preventDefault();
      segnaInput();
      const verso: 1 | -1 = d > 0 ? 1 : -1;

      if (eScatto(e, d)) {
        // Rotelle ad alta risoluzione mandano più eventi per uno scatto: uno solo conta.
        if (now - ultimoScatto < ROTELLA.scattoMinIntervalloMs && verso === versoScatto) return;
        ultimoScatto = now;
        versoScatto = verso;
        if (timerFine !== null) clearTimeout(timerFine);
        fineGesto();
        passo(verso, now);
        return;
      }

      // Continuo: un passo per gesto.
      if (!inGesto) {
        inGesto = true;
        consumato = false;
        accumulo = 0;
      }
      rinnovaGesto();
      if (consumato) return;
      // Cambio di verso a metà gesto: si riparte da zero in quel verso.
      if (accumulo !== 0 && Math.sign(accumulo) !== Math.sign(d)) accumulo = 0;
      accumulo += d;
      if (Math.abs(accumulo) < ROTELLA.sogliaPx) return;
      if (passo(accumulo > 0 ? 1 : -1, now)) consumato = true;
      else accumulo = 0; // dentro il blocco: il gesto resta aperto e può ancora fare il suo passo
    };

    el.addEventListener('wheel', suRotella, { passive: false });
    return () => {
      el.removeEventListener('wheel', suRotella);
      if (timerFine !== null) clearTimeout(timerFine);
      timerFine = null;
    };
  }, [ref]);
}
