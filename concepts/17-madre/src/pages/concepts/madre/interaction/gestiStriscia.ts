/**
 * MADRE · gesti della vetrina orizzontale (interaction-designer §3,
 * tech-architect §6.3, ux-architect §5.2 e §6.4).
 *
 * La striscia si muove SOLO con lo scroll verticale del documento (lo
 * traduce in cammino `vetrina/cammino.ts`, scaffold). Questo file aggiunge
 * due strade in più che finiscono nello stesso scroll verticale, senza mai
 * bloccare quello nativo:
 *
 * 1. **trackpad orizzontale**: `wheel` passivo; se lo spostamento è più
 *    orizzontale che verticale, `deltaX` diventa scroll verticale 1:1;
 * 2. **swipe orizzontale col dito** sulla striscia: la striscia ha
 *    `touch-action: pan-y pinch-zoom` (interaction.css), quindi il pollice in
 *    verticale resta scroll del browser e lo zoom a due dita resta possibile;
 *    un gesto che parte orizzontale (10 px, entro 30° dall'orizzontale)
 *    diventa scroll verticale 1:1 a ogni mossa, con una breve inerzia al
 *    rilascio (niente inerzia con reduced motion).
 *
 * Limiti: i gesti orizzontali non portano mai la pagina più fuori dalla
 * vetrina di quanto già non sia (la striscia "finisce" ai suoi bordi);
 * nel modo in colonna (finestra bassa, zoom forte) non fanno nulla.
 * Il clic che il browser potrebbe mandare alla fine di uno swipe su un
 * bottone della striscia viene assorbito.
 *
 * Nessun listener `scroll`, nessun requestAnimationFrame: l'inerzia gira nel
 * ticker (fase update). Nessun accesso al browser a livello di modulo.
 */

import { useEffect, type RefObject } from 'react';
import { ticker } from '../core/ticker';
import { passoInerzia as spostamentoInerzia } from '../motion/easing';
import { runtime } from '../state/runtime';
import { store } from '../state/store';

/** Finestra bassa (telefono in orizzontale, zoom forte): la vetrina è una colonna. */
export const MODO_COLONNA_MQ = '(max-height: 539px)';

/** Movimento minimo prima di decidere la direzione dello swipe. */
export const SOGLIA_SWIPE_PX = 10;
/** Oltre questo angolo dall'orizzontale lo swipe è verticale (scroll del browser). */
export const ANGOLO_SWIPE_MAX_GRADI = 30;
/** Costante di tempo dell'attrito dell'inerzia (s). */
const TAU_INERZIA_S = 0.325;
/** Sotto questa velocità l'inerzia si ferma (px/s). */
const VELOCITA_MINIMA = 40;
/** Tetto della velocità di partenza dell'inerzia (px/s). */
const VELOCITA_MASSIMA = 5000;
/** Campioni usati per la velocità al rilascio (ms). */
const FINESTRA_VELOCITA_MS = 90;
/** Dopo uno swipe, un clic entro questo tempo è assorbito. */
const CLIC_DOPO_SWIPE_MS = 350;
/** Righe e pagine della rotella (deltaMode 1 e 2) in px. */
const PX_PER_RIGA = 16;

export interface OpzioniGestiStriscia {
  /** Dove ascoltare la rotella (default: il binario). Di solito la finestra sticky. */
  area?: HTMLElement | null;
}

interface Campione {
  t: number;
  x: number;
}

/** Scroll verticale che porta il cammino di `delta` px, dentro i bordi della vetrina. */
function scorriStriscia(delta: number, daY: number): boolean {
  const { top, corsa } = runtime.vetrina;
  const minimo = Math.min(daY, top);
  const massimo = Math.max(daY, top + corsa);
  const meta = Math.max(minimo, Math.min(massimo, daY + delta));
  if (Math.abs(meta - daY) < 0.5) return false;
  window.scrollTo({ top: meta, behavior: 'instant' });
  ticker.wake();
  return true;
}

function deltaInPx(valore: number, modo: number): number {
  if (modo === 1) return valore * PX_PER_RIGA;
  if (modo === 2) return valore * window.innerWidth;
  return valore;
}

/**
 * Collega trackpad e swipe al binario della vetrina. Restituisce la funzione
 * che stacca tutto e ferma l'inerzia.
 */
export function collegaGestiStriscia(binario: HTMLElement, opz: OpzioniGestiStriscia = {}): () => void {
  const area = opz.area ?? binario;
  const colonna = window.matchMedia(MODO_COLONNA_MQ);

  let swipe: { id: number; x0: number; y0: number; ultimoX: number; stato: 'indeciso' | 'orizzontale'; campioni: Campione[] } | null = null;
  let sopprimiClicFino = 0;
  const inerzia = { v: 0 };
  let togliInerzia: (() => void) | null = null;

  function attiva(): boolean {
    return runtime.vetrina.corsa > 0 && !colonna.matches;
  }

  /* -------------------------------------------------------------- inerzia */

  function fermaInerzia(): void {
    inerzia.v = 0;
    if (togliInerzia !== null) {
      togliInerzia();
      togliInerzia = null;
      window.removeEventListener('pointerdown', fermaInerzia, true);
      window.removeEventListener('wheel', fermaInerzia, true);
      window.removeEventListener('keydown', fermaInerzia, true);
    }
  }

  function passoInerzia(dt: number): boolean {
    if (inerzia.v === 0) return false;
    // Spostamento esatto sul dt (motion/easing.ts): non dipende dai frame.
    const mosso = scorriStriscia(spostamentoInerzia(inerzia, dt, TAU_INERZIA_S), runtime.scrollY);
    if (!mosso || Math.abs(inerzia.v) < VELOCITA_MINIMA) {
      // Fine: si stacca fuori dal frame (rimozione sicura anche qui dentro).
      queueMicrotask(fermaInerzia);
      return false;
    }
    return true;
  }

  function avviaInerzia(v: number): void {
    fermaInerzia();
    if (store.get().reducedMotion) return;
    if (Math.abs(v) < VELOCITA_MINIMA * 4) return;
    inerzia.v = Math.max(-VELOCITA_MASSIMA, Math.min(VELOCITA_MASSIMA, v));
    togliInerzia = ticker.add(passoInerzia, 'update');
    // Qualsiasi nuovo input ferma l'inerzia subito.
    window.addEventListener('pointerdown', fermaInerzia, true);
    window.addEventListener('wheel', fermaInerzia, { capture: true, passive: true });
    window.addEventListener('keydown', fermaInerzia, true);
  }

  /* ------------------------------------------------------------- rotella */

  function rotella(e: WheelEvent): void {
    if (!attiva() || e.ctrlKey) return;
    const dx = deltaInPx(e.deltaX, e.deltaMode);
    const dy = deltaInPx(e.deltaY, e.deltaMode);
    if (dx === 0 || Math.abs(dx) <= Math.abs(dy)) return;
    scorriStriscia(dx, window.scrollY);
  }

  /* --------------------------------------------------------------- swipe */

  function giu(e: PointerEvent): void {
    if (e.pointerType !== 'touch') return;
    if (!e.isPrimary) {
      // Secondo dito (pizzico): lo swipe in corso finisce senza inerzia.
      swipe = null;
      return;
    }
    if (!attiva()) return;
    swipe = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ultimoX: e.clientX, stato: 'indeciso', campioni: [] };
  }

  function muove(e: PointerEvent): void {
    const s = swipe;
    if (s === null || e.pointerId !== s.id) return;
    if (s.stato === 'indeciso') {
      const dx = e.clientX - s.x0;
      const dy = e.clientY - s.y0;
      if (Math.hypot(dx, dy) < SOGLIA_SWIPE_PX) return;
      const angolo = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
      if (angolo > ANGOLO_SWIPE_MAX_GRADI) {
        // Verticale: è lo scroll del browser (arriverà pointercancel).
        swipe = null;
        return;
      }
      s.stato = 'orizzontale';
      s.ultimoX = s.x0;
    }
    const passo = s.ultimoX - e.clientX;
    s.ultimoX = e.clientX;
    if (passo !== 0) scorriStriscia(passo, window.scrollY);
    const ora = e.timeStamp;
    s.campioni.push({ t: ora, x: e.clientX });
    while (s.campioni.length > 2 && ora - (s.campioni[0]?.t ?? ora) > FINESTRA_VELOCITA_MS) s.campioni.shift();
  }

  function su(e: PointerEvent): void {
    const s = swipe;
    if (s === null || e.pointerId !== s.id) return;
    swipe = null;
    if (s.stato !== 'orizzontale') return;
    sopprimiClicFino = performance.now() + CLIC_DOPO_SWIPE_MS;
    const primo = s.campioni[0];
    const ultimo = s.campioni[s.campioni.length - 1];
    if (primo === undefined || ultimo === undefined || ultimo.t - primo.t <= 0) return;
    if (e.timeStamp - ultimo.t > FINESTRA_VELOCITA_MS) return; // il dito si era fermato
    const vDito = ((ultimo.x - primo.x) / (ultimo.t - primo.t)) * 1000;
    avviaInerzia(-vDito);
  }

  function annullato(e: PointerEvent): void {
    if (swipe !== null && e.pointerId === swipe.id) swipe = null;
  }

  function clic(e: MouseEvent): void {
    if (performance.now() < sopprimiClicFino) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function cambioColonna(): void {
    if (colonna.matches) {
      swipe = null;
      fermaInerzia();
    }
  }

  area.addEventListener('wheel', rotella, { passive: true });
  binario.addEventListener('pointerdown', giu);
  binario.addEventListener('pointermove', muove);
  binario.addEventListener('pointerup', su);
  binario.addEventListener('pointercancel', annullato);
  binario.addEventListener('click', clic, true);
  colonna.addEventListener('change', cambioColonna);

  return () => {
    area.removeEventListener('wheel', rotella);
    binario.removeEventListener('pointerdown', giu);
    binario.removeEventListener('pointermove', muove);
    binario.removeEventListener('pointerup', su);
    binario.removeEventListener('pointercancel', annullato);
    binario.removeEventListener('click', clic, true);
    colonna.removeEventListener('change', cambioColonna);
    swipe = null;
    fermaInerzia();
  };
}

/** Versione React: collega i gesti al binario (e la rotella all'area) al mount. */
export function useGestiStriscia(binario: RefObject<HTMLElement>, area?: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = binario.current;
    if (el === null) return undefined;
    return collegaGestiStriscia(el, { area: area?.current ?? null });
  }, [binario, area]);
}
