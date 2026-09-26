/**
 * EVIDENZIA · spostare il foglio con la mano (interaction-designer).
 *
 * Il foglio scorre nativamente nei due assi (rotella, trackpad, Maiusc +
 * rotella, frecce, dito). Questo hook aggiunge solo ciò che il browser non fa:
 *
 * - **spazio + trascina** ovunque sul foglio, anche sopra gli annunci
 *   (come negli impaginatori: la mano). Un tocco breve di spazio senza
 *   trascinare fa quello che farebbe il browser: scende di una schermata
 *   (Maiusc + spazio: sale);
 * - **trascina sugli spazi vuoti**: il foglio stesso, la pagina, le colonne
 *   (i canaletti sono il fondo della griglia) e tutto ciò che le sezioni
 *   marcano `data-evd-afferra` (barre di rubrica, testata, piede). Mai su
 *   annunci, controlli, box redazionali (lì il testo si seleziona);
 * - **trascinamento verticale partito da un annuncio** con il mouse: lo
 *   passa `useEvidenziatore` con `avviaPanDaPuntatore()` quando il gesto non è
 *   orizzontale (trend-researcher R2);
 * - **Pagina intera**: un clic o un tocco in un punto torna a Leggi con quel
 *   punto al centro; i clic su bottoni e link del foglio scalato non passano
 *   (ux-architect 5.3: tutto il foglio è un unico bersaglio).
 *
 * Solo mouse e penna trascinano: col dito il foglio scorre da sé.
 * Nessun cursore personalizzato: `grab` / `grabbing` di sistema, dati da
 * interaction.css in base a `data-evd-pan` sullo scroller.
 * Lo spostamento passa da `vaiA()` nella fase `write` del ticker.
 */

import { useEffect, type RefObject } from 'react';
import { ticker } from '../core/ticker';
import { aCoordinateContenuto, vaiA } from '../core/scroller';
import { runtime } from '../state/runtime';
import { store } from '../state/store';
import { chiediVista } from './cambioVista';
import { segni } from './segni';

/** Movimento minimo (px) prima che una pressione diventi trascinamento. */
const SOGLIA_TRASCINA = 3;
/** Un clic in Pagina intera: movimento massimo e durata massima. */
const CLIC_MAX_PX = 6;
const CLIC_MAX_MS = 600;
/** Spazio tenuto meno di così senza trascinare = "scendi di una schermata". */
const SPAZIO_BREVE_MS = 250;
/** Quota di finestra percorsa da spazio (come il browser). */
const PAGINA = 0.85;

const INTERATTIVI =
  'a[href], button, input, select, textarea, summary, label, [role="button"], [role="link"], [role="radio"], [role="checkbox"], [contenteditable="true"], [data-evd-no-pan]';
const ZONE_VUOTE = '.evd-pagina, .evd-colonne';

type StatoPan = 'fermo' | 'pronto' | 'trascina';

interface Trascinamento {
  stato: StatoPan;
  pointerId: number;
  x0: number;
  y0: number;
  scrollX0: number;
  scrollY0: number;
  bersaglioX: number;
  bersaglioY: number;
  scala: number;
}

const tr: Trascinamento = {
  stato: 'fermo',
  pointerId: -1,
  x0: 0,
  y0: 0,
  scrollX0: 0,
  scrollY0: 0,
  bersaglioX: 0,
  bersaglioY: 0,
  scala: 1,
};

/** Lo scroller del foglio montato (uno solo), per l'aggancio da useEvidenziatore. */
let scrollerCorrente: HTMLElement | null = null;
let togliScrittura: (() => void) | null = null;

function segnaPan(el: HTMLElement, valore: '' | 'spazio' | 'trascina'): void {
  if (valore === '') {
    if (el.dataset.evdPan !== undefined) delete el.dataset.evdPan;
    return;
  }
  if (el.dataset.evdPan !== valore) el.dataset.evdPan = valore;
}

function scrivi(): boolean {
  if (tr.stato !== 'trascina') return false;
  const f = runtime.foglio;
  if (Math.abs(f.x - tr.bersaglioX) > 0.5 || Math.abs(f.y - tr.bersaglioY) > 0.5) {
    vaiA(tr.bersaglioX / tr.scala, tr.bersaglioY / tr.scala, { liscio: false });
  }
  return false;
}

function iniziaTrascinamento(el: HTMLElement, e: PointerEvent): void {
  tr.stato = 'pronto';
  tr.pointerId = e.pointerId;
  tr.x0 = e.clientX;
  tr.y0 = e.clientY;
  tr.scrollX0 = runtime.foglio.x;
  tr.scrollY0 = runtime.foglio.y;
  tr.bersaglioX = tr.scrollX0;
  tr.bersaglioY = tr.scrollY0;
  tr.scala = runtime.foglio.scala > 0 ? runtime.foglio.scala : 1;
  try {
    el.setPointerCapture(e.pointerId);
  } catch {
    // il puntatore potrebbe essere già stato rilasciato: il trascinamento resta valido finché arrivano eventi
  }
}

/**
 * Chiamata da useEvidenziatore quando un trascinamento del mouse partito da
 * un annuncio è verticale: il foglio passa alla mano. Restituisce false se
 * il pan non è possibile (colonna, Pagina intera, scroller assente).
 */
export function avviaPanDaPuntatore(e: PointerEvent): boolean {
  const el = scrollerCorrente;
  const s = store.get();
  if (el === null || s.layout !== 'foglio' || s.vista !== 'leggi') return false;
  if (e.pointerType === 'touch') return false;
  iniziaTrascinamento(el, e);
  tr.stato = 'trascina';
  runtime.pan.trascina = true;
  segnaPan(el, 'trascina');
  togliScrittura ??= ticker.add(scrivi, 'write');
  return true;
}

function afferrabile(bersaglio: EventTarget | null, scroller: HTMLElement): boolean {
  if (!(bersaglio instanceof Element)) return false;
  if (bersaglio.closest(INTERATTIVI) !== null) return false;
  if (bersaglio.closest('[data-evd-annuncio]') !== null) return false;
  if (bersaglio === scroller) return true;
  if (bersaglio.matches(ZONE_VUOTE)) return true;
  return bersaglio.closest('[data-evd-afferra]') !== null;
}

function editabile(el: Element | null): boolean {
  if (el === null) return false;
  return el.closest('input, textarea, select, [contenteditable="true"]') !== null;
}

/** Elementi dove lo spazio ha già un significato (premere un bottone, spuntare, scrivere). */
function spazioOccupato(el: Element | null): boolean {
  if (el === null) return false;
  return el.closest(INTERATTIVI) !== null;
}

export function usePan(scrollerRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const el = scrollerRef.current;
    if (el === null) return undefined;
    scrollerCorrente = el;

    let spazioGiu = 0;
    let spazioUsato = false;
    let clicIntera: { id: number; x: number; y: number; t: number } | null = null;
    let ultimoClicIntera = -Infinity;

    const fineTrascinamento = (): void => {
      if (tr.stato === 'fermo') return;
      if (tr.pointerId >= 0 && el.hasPointerCapture(tr.pointerId)) {
        try {
          el.releasePointerCapture(tr.pointerId);
        } catch {
          // già rilasciato
        }
      }
      tr.stato = 'fermo';
      tr.pointerId = -1;
      runtime.pan.trascina = false;
      segnaPan(el, runtime.pan.spazio ? 'spazio' : '');
      togliScrittura?.();
      togliScrittura = null;
    };

    const suPointerDown = (e: PointerEvent): void => {
      const s = store.get();
      if (s.layout !== 'foglio') return;

      if (s.vista === 'intera') {
        if (e.button !== 0) return;
        clicIntera = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
        return;
      }

      if (e.button !== 0 || e.pointerType === 'touch') return;
      if (segni.gestoCorrente !== null) return;
      const conSpazio = runtime.pan.spazio;
      if (!conSpazio && !afferrabile(e.target, el)) return;
      if (conSpazio) {
        spazioUsato = true;
        // con lo spazio premuto la mano vince su tutto: niente fuoco, niente tratto, niente selezione
        e.preventDefault();
        e.stopPropagation();
      }
      iniziaTrascinamento(el, e);
    };

    const suPointerMove = (e: PointerEvent): void => {
      if (tr.stato === 'fermo' || e.pointerId !== tr.pointerId) return;
      const dx = e.clientX - tr.x0;
      const dy = e.clientY - tr.y0;
      if (tr.stato === 'pronto') {
        if (Math.hypot(dx, dy) < SOGLIA_TRASCINA) return;
        tr.stato = 'trascina';
        runtime.pan.trascina = true;
        segnaPan(el, 'trascina');
        togliScrittura ??= ticker.add(scrivi, 'write');
      }
      e.preventDefault();
      // la mano tira la carta: il contenuto segue il puntatore, lo scroll va al contrario
      tr.bersaglioX = Math.max(0, tr.scrollX0 - dx);
      tr.bersaglioY = Math.max(0, tr.scrollY0 - dy);
      ticker.wake();
    };

    const suPointerUp = (e: PointerEvent): void => {
      if (clicIntera !== null && e.pointerId === clicIntera.id) {
        const c = clicIntera;
        clicIntera = null;
        const fermo = Math.hypot(e.clientX - c.x, e.clientY - c.y) <= CLIC_MAX_PX;
        const breve = e.timeStamp - c.t <= CLIC_MAX_MS;
        if (fermo && breve && store.get().vista === 'intera') {
          ultimoClicIntera = e.timeStamp;
          chiediVista('leggi', aCoordinateContenuto(e.clientX, e.clientY));
        }
        return;
      }
      if (e.pointerId === tr.pointerId) fineTrascinamento();
    };

    const suPointerCancel = (e: PointerEvent): void => {
      if (clicIntera !== null && e.pointerId === clicIntera.id) clicIntera = null;
      if (e.pointerId === tr.pointerId) fineTrascinamento();
    };

    /**
     * In Pagina intera i clic dentro il foglio non attivano bottoni e link
     * (il foglio è scalato e illeggibile): il clic serve solo a entrare.
     * I clic da tastiera (detail 0) passano: il fuoco ha già riportato a Leggi.
     */
    const suClicCattura = (e: MouseEvent): void => {
      const s = store.get();
      const appenaEntrato = e.timeStamp - ultimoClicIntera < CLIC_MAX_MS;
      if ((s.vista === 'intera' || appenaEntrato) && e.detail > 0) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const suKeyDown = (e: KeyboardEvent): void => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const s = store.get();
      if (s.layout !== 'foglio' || s.vista !== 'leggi' || s.schedaAperta !== null || s.giroAperto) return;
      const attivo = document.activeElement;
      const suFoglio = attivo === el || attivo === document.body || attivo === null;
      if (!suFoglio && (editabile(attivo) || spazioOccupato(attivo))) return;
      if (attivo !== null && attivo !== document.body && !el.contains(attivo)) return;
      e.preventDefault();
      if (e.repeat || runtime.pan.spazio) return;
      runtime.pan.spazio = true;
      spazioGiu = e.timeStamp;
      spazioUsato = false;
      segnaPan(el, 'spazio');
    };

    const suKeyUp = (e: KeyboardEvent): void => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (!runtime.pan.spazio) return;
      runtime.pan.spazio = false;
      const breve = e.timeStamp - spazioGiu < SPAZIO_BREVE_MS;
      if (tr.stato === 'fermo') segnaPan(el, '');
      if (breve && !spazioUsato && tr.stato === 'fermo') {
        const f = runtime.foglio;
        const verso = e.shiftKey ? -1 : 1;
        const scala = f.scala > 0 ? f.scala : 1;
        vaiA(f.x / scala, Math.max(0, (f.y + verso * f.h * PAGINA) / scala), {
          liscio: !store.get().reducedMotion,
        });
      }
    };

    const suPerditaFuoco = (): void => {
      runtime.pan.spazio = false;
      fineTrascinamento();
      segnaPan(el, '');
    };

    const suVisibilita = (): void => {
      if (document.visibilityState === 'hidden') suPerditaFuoco();
    };

    el.addEventListener('pointerdown', suPointerDown, { capture: true });
    el.addEventListener('pointermove', suPointerMove);
    el.addEventListener('pointerup', suPointerUp);
    el.addEventListener('pointercancel', suPointerCancel);
    el.addEventListener('lostpointercapture', suPointerCancel);
    el.addEventListener('click', suClicCattura, { capture: true });
    document.addEventListener('keydown', suKeyDown);
    document.addEventListener('keyup', suKeyUp);
    window.addEventListener('blur', suPerditaFuoco);
    document.addEventListener('visibilitychange', suVisibilita);

    return () => {
      el.removeEventListener('pointerdown', suPointerDown, { capture: true });
      el.removeEventListener('pointermove', suPointerMove);
      el.removeEventListener('pointerup', suPointerUp);
      el.removeEventListener('pointercancel', suPointerCancel);
      el.removeEventListener('lostpointercapture', suPointerCancel);
      el.removeEventListener('click', suClicCattura, { capture: true });
      document.removeEventListener('keydown', suKeyDown);
      document.removeEventListener('keyup', suKeyUp);
      window.removeEventListener('blur', suPerditaFuoco);
      document.removeEventListener('visibilitychange', suVisibilita);
      fineTrascinamento();
      runtime.pan.spazio = false;
      segnaPan(el, '');
      if (scrollerCorrente === el) scrollerCorrente = null;
    };
  }, [scrollerRef]);
}
