/**
 * NOVANTA · rotella e trackpad che ruotano invece di scorrere (interaction-designer).
 *
 * Il punto più fragile del concept (trend-researcher §4.3). Regole:
 *
 * 1. Due modi, riconosciuti evento per evento:
 *    - **scatto** (rotella del mouse): uno scatto = un angolo. Chrome e Safari
 *      mandano circa 100-120 px per scatto, Firefox 3 righe: con "1° ogni
 *      4 px" uno scatto farebbe 25° o 12°, mai un angolo pulito. Quindi lo
 *      scatto non passa dai pixel: chiama `onScatto(verso)` (il braccio va al
 *      prossimo angolo, l'anello alla prossima ora libera) oppure, se manca,
 *      `onDelta(±passoScatto)`.
 *    - **continuo** (trackpad, rotelle "lisce"): 1° ogni `pxPerGrado` px
 *      (creative-director: 4), dopo una soglia di `sogliaTrackpad` px per gesto
 *      (ux-architect: 12) che assorbe i tremolii. Un gesto muove al massimo
 *      `maxPerGesto` gradi (braccio: un angolo) e finisce dopo 140 ms senza
 *      delta: `onFine({ verso, percorso })` e il chiamante aggancia.
 *    Dopo la fine di un gesto continuo c'è un blocco di 350 ms (rinnovato dai
 *    delta dell'inerzia del trackpad): la coda dell'inerzia non attraversa tre
 *    angoli. Un nuovo colpo deciso (delta che torna a crescere) rompe il blocco.
 *
 * 2. Precedenza allo scorrimento interno: se il puntatore è sopra un'area che
 *    scorre (`scrollInterno()` o un elemento con `data-nov-ix-scorre`) e
 *    quell'area può ancora scorrere nel verso del gesto, scorre lei (evento
 *    nativo, niente `preventDefault`). Arrivata in fondo, lo stesso gesto viene
 *    assorbito finché non c'è una pausa di 300 ms: serve un gesto nuovo per
 *    ruotare (ux-architect §6.3).
 *
 * 3. Mai rotazione sopra i campi (`input`, `textarea`, `select`,
 *    `contenteditable`) né dentro `data-nov-ix-rotella="blocca"` (la colonna
 *    del modulo a 90°): lì resta lo scorrimento del browser.
 *
 * 4. Pizzico del trackpad (`ctrlKey`): mai intercettato, è lo zoom.
 *
 * 5. Oggetti annidati: l'anello ascolta sul proprio elemento e chiama
 *    `preventDefault`; l'ascoltatore del braccio sulla radice vede
 *    `defaultPrevented` e non fa niente. Così "sopra l'anello la rotella gira
 *    l'anello" senza coordinamento esplicito.
 *
 * Ascoltatore `wheel` con `{ passive: false }` e `preventDefault` solo quando
 * ruota davvero. I timer sono `setTimeout` brevi; nessun rAF, nessun setState.
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { QUIETE_ROTELLA } from '../motion/choreography';
import { segnaInput } from './attivita';

export interface EsitoGesto {
  /** -1 indietro, 1 avanti, 0 gesto troppo corto (torna dov'era). */
  verso: -1 | 0 | 1;
  /** Gradi percorsi nel gesto (con segno), già limitati da maxPerGesto. */
  percorso: number;
}

export interface OpzioniRotella {
  /** Pixel di delta per grado nel modo continuo (creative-director: 4). */
  pxPerGrado: number;
  /** Pixel di delta ignorati all'inizio di ogni gesto continuo (ux-architect: 12). */
  sogliaTrackpad: number;
  /** Letto a ogni evento: se falso l'evento resta al browser. */
  attivo: () => boolean;
  /** L'area che scorre (il Palco): se il puntatore è sopra e può scorrere, scorre lei. */
  scrollInterno: () => HTMLElement | null;
  /** Gradi da aggiungere al bersaglio (→ rotore.spingi). */
  onDelta: (gradi: number) => void;

  /* ---- aggiunte facoltative (compatibili con il contratto di tech-architect §7.3) ---- */

  /** Gradi di uno scatto quando `onScatto` manca. Default 30. */
  passoScatto?: number;
  /** Uno scatto di rotella: braccio → prossimo angolo, anello → prossima ora libera. */
  onScatto?: (verso: 1 | -1) => void;
  /** Gradi massimi di un gesto continuo. Default 30 (un angolo). Anello: Infinity. */
  maxPerGesto?: number;
  /** Fine di un gesto continuo (140 ms senza delta): il chiamante aggancia. */
  onFine?: (esito: EsitoGesto) => void;
  /** Gradi minimi perché un gesto continuo conti come "avanti/indietro". Default 6. */
  sogliaVerso?: number;
}

/** Costanti di taratura (documentate in docs/interaction-designer.md §3). */
export const ROTELLA = {
  /** Quiete che chiude un gesto continuo. */
  fineGestoMs: QUIETE_ROTELLA,
  /** Blocco dopo un gesto continuo, rinnovato dalla coda d'inerzia. */
  bloccoMs: 350,
  /** Pausa che separa lo scorrimento interno dalla rotazione. */
  pausaScrollMs: 300,
  /** Un delta che torna a crescere oltre questo fattore è un gesto nuovo. */
  fattoreNuovoGesto: 1.8,
  /** ...e deve superare questi px. */
  minNuovoGestoPx: 10,
  /** Sopra questi px (modo pixel, senza wheelDelta) un evento isolato è uno scatto. */
  scattoMinPx: 50,
  /** Tra due scatti, meno di così: stesso colpo di rotella "ad alta risoluzione". */
  scattoMinIntervalloMs: 40,
} as const;

const SELETTORE_CAMPI = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
const SELETTORE_BLOCCA = '[data-nov-ix-rotella="blocca"]';
const SELETTORE_SCORRE = '[data-nov-ix-scorre]';

/** Evento wheel con i campi legacy di Chrome e Safari (assenti in Firefox). */
type WheelLegacy = WheelEvent & { wheelDeltaY?: number; wheelDeltaX?: number };

/** Delta in px, normalizzato tra deltaMode pixel / righe / pagine. */
function deltaPx(e: WheelEvent, altezzaPagina: number): { dx: number; dy: number } {
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? altezzaPagina : 1;
  return { dx: e.deltaX * k, dy: e.deltaY * k };
}

/**
 * Scatto di rotella o trackpad? Euristica nota e conservativa:
 * - righe o pagine (Firefox con il mouse) → scatto;
 * - Chrome/Safari espongono wheelDelta: sul trackpad vale -3 × delta, sul
 *   mouse è un multiplo di 120 (o comunque diverso);
 * - delta con decimali → continuo;
 * - altrimenti un delta grande è uno scatto.
 * Un errore di classificazione cambia solo la sensazione: entrambi i modi
 * portano a un angolo agganciato.
 */
function eScatto(e: WheelLegacy, d: number): boolean {
  if (e.deltaMode !== 0) return true;
  const legacy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.wheelDeltaY : e.wheelDeltaX;
  const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (typeof legacy === 'number' && legacy !== 0) {
    if (Math.abs(legacy + 3 * delta) <= 1.5) return false;
    return Math.abs(legacy) % 120 === 0 || Math.abs(d) >= ROTELLA.scattoMinPx;
  }
  if (!Number.isInteger(d)) return false;
  return Math.abs(d) >= ROTELLA.scattoMinPx;
}

function puoScorrere(el: HTMLElement, dy: number): boolean {
  if (el.scrollHeight <= el.clientHeight + 1) return false;
  if (dy > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
  if (dy < 0) return el.scrollTop > 1;
  return false;
}

/** L'area che scorre sotto il puntatore, dentro la radice dell'ascoltatore. */
function areaCheScorre(bersaglio: Element | null, radice: Element, interno: HTMLElement | null): HTMLElement | null {
  let n: Element | null = bersaglio;
  while (n && n !== radice.parentElement) {
    if (n instanceof HTMLElement && (n === interno || n.matches(SELETTORE_SCORRE))) return n;
    if (n === radice) break;
    n = n.parentElement;
  }
  return null;
}

export function useRotella(ref: RefObject<Element>, o: OpzioniRotella): void {
  const opz = useRef(o);
  useEffect(() => {
    opz.current = o;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const vista = el.ownerDocument.defaultView;
    if (!vista) return undefined;

    /* stato del gesto continuo */
    let inGesto = false;
    let accumuloPx = 0;
    let sogliaSuperata = false;
    let percorso = 0;
    let ultimoAbs = 0;
    let calando = false;
    let timerFine: ReturnType<typeof setTimeout> | null = null;
    let bloccoFino = 0;

    /* stato degli scatti */
    let ultimoScatto = Number.NEGATIVE_INFINITY;
    let versoScatto: 1 | -1 = 1;

    /* scorrimento interno */
    let ultimoScrollNativo = Number.NEGATIVE_INFINITY;

    const fermaTimer = (): void => {
      if (timerFine !== null) {
        clearTimeout(timerFine);
        timerFine = null;
      }
    };

    const chiudiGesto = (): void => {
      timerFine = null;
      if (!inGesto) return;
      const o2 = opz.current;
      const soglia = o2.sogliaVerso ?? 6;
      const verso: -1 | 0 | 1 = percorso >= soglia ? 1 : percorso <= -soglia ? -1 : 0;
      const esito: EsitoGesto = { verso, percorso };
      inGesto = false;
      accumuloPx = 0;
      sogliaSuperata = false;
      percorso = 0;
      calando = false;
      bloccoFino = performance.now() + ROTELLA.bloccoMs;
      o2.onFine?.(esito);
    };

    const continuo = (d: number, now: number): void => {
      const o2 = opz.current;
      const abs = Math.abs(d);

      if (!inGesto) {
        // Coda d'inerzia dopo un gesto: assorbita, e allunga il blocco.
        const nuovoColpo = calando && abs > ultimoAbs * ROTELLA.fattoreNuovoGesto && abs >= ROTELLA.minNuovoGestoPx;
        if (now < bloccoFino && !nuovoColpo) {
          if (abs < ultimoAbs) calando = true;
          ultimoAbs = abs;
          bloccoFino = now + ROTELLA.bloccoMs;
          return;
        }
        inGesto = true;
        accumuloPx = 0;
        sogliaSuperata = false;
        percorso = 0;
        calando = false;
      } else if (calando && abs > ultimoAbs * ROTELLA.fattoreNuovoGesto && abs >= ROTELLA.minNuovoGestoPx) {
        // Un colpo nuovo arrivato dentro la coda del precedente: chiudo e riparto.
        fermaTimer();
        chiudiGesto();
        bloccoFino = 0;
        inGesto = true;
      }
      if (inGesto && abs < ultimoAbs) calando = true;
      else if (abs > ultimoAbs) calando = false;
      ultimoAbs = abs;

      fermaTimer();
      timerFine = setTimeout(chiudiGesto, ROTELLA.fineGestoMs);

      if (!sogliaSuperata) {
        accumuloPx += d;
        if (Math.abs(accumuloPx) < o2.sogliaTrackpad) return;
        sogliaSuperata = true;
        d = accumuloPx - Math.sign(accumuloPx) * o2.sogliaTrackpad;
      }
      const max = o2.maxPerGesto ?? 30;
      const voluto = percorso + d / o2.pxPerGrado;
      const limitato = Math.max(-max, Math.min(max, voluto));
      const passo = limitato - percorso;
      if (passo === 0) return;
      percorso = limitato;
      o2.onDelta(passo);
    };

    const scatto = (d: number, now: number): void => {
      const o2 = opz.current;
      const verso: 1 | -1 = d > 0 ? 1 : -1;
      // Rotelle ad alta risoluzione mandano più eventi per uno scatto: uno solo conta.
      if (now - ultimoScatto < ROTELLA.scattoMinIntervalloMs && verso === versoScatto) return;
      ultimoScatto = now;
      versoScatto = verso;
      if (inGesto) {
        fermaTimer();
        chiudiGesto();
      }
      bloccoFino = 0;
      if (o2.onScatto) o2.onScatto(verso);
      else o2.onDelta(verso * (o2.passoScatto ?? 30));
    };

    const suRotella = (ev: Event): void => {
      const e = ev as WheelLegacy;
      if (e.defaultPrevented || e.ctrlKey) return;
      const o2 = opz.current;
      if (!o2.attivo()) return;
      const bersaglio = e.target instanceof Element ? e.target : null;
      if (bersaglio && (bersaglio.closest(SELETTORE_CAMPI) || bersaglio.closest(SELETTORE_BLOCCA))) return;

      const { dx, dy } = deltaPx(e, vista.innerHeight);
      const verticale = Math.abs(dy) >= Math.abs(dx);
      const d = verticale ? dy : dx;
      if (d === 0) return;
      const now = performance.now();

      if (verticale) {
        const area = areaCheScorre(bersaglio, el, o2.scrollInterno());
        if (area) {
          if (puoScorrere(area, dy)) {
            ultimoScrollNativo = now;
            segnaInput();
            return;
          }
          if (now - ultimoScrollNativo < ROTELLA.pausaScrollMs) {
            // In fondo al testo: lo stesso gesto non diventa rotazione.
            ultimoScrollNativo = now;
            e.preventDefault();
            return;
          }
        }
      }

      e.preventDefault();
      segnaInput();
      if (eScatto(e, d)) scatto(d, now);
      else continuo(d, now);
    };

    el.addEventListener('wheel', suRotella, { passive: false });
    return () => {
      el.removeEventListener('wheel', suRotella);
      fermaTimer();
    };
  }, [ref]);
}
