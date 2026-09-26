/**
 * BATTIFILO · swipe: un gesto del dito = un mese (interaction-designer).
 *
 * Dove si usa (section-builder-foto e section-builder-linea/scheda):
 * - sulla **foto** (`orizzontale: true`, `verticale: 'passo'`): swipe a
 *   sinistra = mese dopo, a destra = mese prima; swipe in su = mese dopo, in
 *   giù = mese prima;
 * - sulla **lastra** della cronaca (`orizzontale: false`, perché in
 *   orizzontale sulla lastra si tira il nastro con trascina.ts):
 *   `verticale: 'passo'` quando la scheda è chiusa, `'nativo'` quando "Di più"
 *   l'ha espansa e la lastra deve scorrere.
 *
 * Decisione sullo swipe verticale (trend-researcher §5.1, concordata con
 * ux-architect §5.3.4; motivazione in docs/interaction-designer.md §4):
 * nel palco la pagina non scorre, quindi un dito che va in su non deve
 * trovare un sito "morto". Vale come UN passo, esattamente come uno scatto
 * della rotella: in su = mese dopo (è il verso in cui scorrerebbe il
 * contenuto, lo stesso di rotella giù e di swipe a sinistra). Mai scorrimento
 * continuo del tempo in verticale: solo il nastro orizzontale si tira.
 * Eccezioni in cui il verticale resta del browser: lastra espansa
 * (`'nativo'`), modo documento (`attivo()` falso e CSS), pagina ingrandita
 * col pizzico, aree che scorrono (`data-btf-ix-scorre`).
 *
 * Soglie (ux-architect §5.3.4): asse deciso nei primi 8 px con
 * `asseDelGesto()` (orizzontale entro 30°, verticale oltre 60°, in mezzo
 * incerto = niente); passo se lo spostamento sull'asse è ≥ 48 px oppure se è
 * ≥ 16 px con velocità finale > 0,4 px/ms. Un passo per gesto, sempre.
 *
 * Solo dito e penna: col mouse sulla foto si usa la rotella, e un
 * trascinamento del mouse deve poter selezionare il testo della lastra.
 *
 * Scrive sul proprio elemento due attributi, solo quando cambiano:
 * `data-btf-ix-verticale="passo|nativo"` (per il `touch-action` di
 * interaction.css) e `data-btf-ix-zoom="1"` mentre la pagina è ingrandita col
 * pizzico (touch-action torna libero, così il dito sposta la vista).
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { segnaInput } from './attivita';
import { asseDelGesto, eventiPresi, ingranditaColPizzico, puntatoriInPresa, SOGLIA_PRESA_PX } from './trascina';

export const SWIPE = {
  /** Spostamento sull'asse che basta da solo. */
  distanzaPx: 48,
  /** Con la velocità alta basta questo. */
  distanzaMinimaPx: 16,
  /** Velocità finale (px/ms) che fa passo anche sotto i 48 px. */
  velocitaPxMs: 0.4,
  /** Finestra per la velocità finale. */
  finestraMs: 100,
  /** Un gesto più lungo di così senza velocità è un "appoggio", non uno swipe. */
  durataMassimaMs: 900,
} as const;

export type AsseSwipe = 'orizzontale' | 'verticale';

export interface OpzioniSwipe {
  /** Letto a ogni pressione: se falso il gesto non parte. */
  attivo: () => boolean;
  /** Lo swipe orizzontale fa un passo? (foto: sì; lastra: no, lì si tira il nastro). */
  orizzontale: boolean;
  /** Il verticale: 'passo' = un mese; 'nativo' = scorrimento del browser (lastra espansa). */
  verticale: 'passo' | 'nativo';
  /** Un mese avanti (1) o indietro (-1). Il chiamante fa `segnaSpostamento('swipe')` e `cassetta.passo(verso)`. */
  onPasso: (verso: 1 | -1, asse: AsseSwipe) => void;
  /** Anche col mouse (default no). */
  mouse?: boolean;
}

interface Campione {
  t: number;
  v: number;
}

function velocitaFinale(campioni: readonly Campione[]): number {
  const ultimo = campioni[campioni.length - 1];
  if (!ultimo) return 0;
  let primo: Campione | undefined;
  for (const c of campioni) {
    if (ultimo.t - c.t <= SWIPE.finestraMs) {
      primo = c;
      break;
    }
  }
  if (!primo || ultimo.t - primo.t < 8) return 0;
  return (ultimo.v - primo.v) / (ultimo.t - primo.t);
}

/**
 * Decide se un gesto chiuso è un passo e in che verso. Pura, esportata per i
 * test. `spostamento` e `velocita` sono sull'asse del gesto (px e px/ms, con
 * segno: negativo = verso sinistra o verso l'alto).
 */
export function versoDelloSwipe(spostamento: number, velocita: number, durataMs: number): 1 | -1 | 0 {
  const d = Math.abs(spostamento);
  const veloce = Math.abs(velocita) > SWIPE.velocitaPxMs && Math.sign(velocita) === Math.sign(spostamento);
  const lungo = d >= SWIPE.distanzaPx && (durataMs <= SWIPE.durataMassimaMs || veloce);
  if (!lungo && !(veloce && d >= SWIPE.distanzaMinimaPx)) return 0;
  // Dito verso sinistra o verso l'alto = il contenuto va avanti = mese dopo.
  return spostamento < 0 ? 1 : -1;
}

export function useSwipe(ref: RefObject<HTMLElement>, o: OpzioniSwipe): void {
  const opz = useRef(o);
  useEffect(() => {
    opz.current = o;
  });

  // Attributo per il touch-action: scritto solo quando cambia.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getAttribute('data-btf-ix-verticale') !== o.verticale) el.setAttribute('data-btf-ix-verticale', o.verticale);
  }, [ref, o.verticale]);

  // Pizzico: finché la pagina è ingrandita, il dito sposta la vista.
  useEffect(() => {
    const el = ref.current;
    const vv = el?.ownerDocument.defaultView?.visualViewport;
    if (!el || !vv) return undefined;
    let zoom = false;
    const aggiorna = (): void => {
      const ora = ingranditaColPizzico(el);
      if (ora === zoom) return;
      zoom = ora;
      if (ora) el.setAttribute('data-btf-ix-zoom', '1');
      else el.removeAttribute('data-btf-ix-zoom');
    };
    aggiorna();
    vv.addEventListener('resize', aggiorna);
    return () => {
      vv.removeEventListener('resize', aggiorna);
      el.removeAttribute('data-btf-ix-zoom');
    };
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let id = -1;
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let asse: AsseSwipe | null = null;
    let campioni: Campione[] = [];

    const chiudi = (): void => {
      id = -1;
      asse = null;
      campioni = [];
    };

    const suGiu = (ev: PointerEvent): void => {
      if (id !== -1) {
        if (!ev.isPrimary) chiudi(); // secondo dito: pizzico, non swipe
        return;
      }
      if (eventiPresi.has(ev) || !ev.isPrimary) return;
      const o2 = opz.current;
      if (ev.pointerType === 'mouse' && !o2.mouse) return;
      if (!o2.attivo() || ingranditaColPizzico(el)) return;
      id = ev.pointerId;
      x0 = ev.clientX;
      y0 = ev.clientY;
      t0 = ev.timeStamp;
      asse = null;
      campioni = [];
    };

    const suMuovi = (ev: PointerEvent): void => {
      if (ev.pointerId !== id) return;
      if (puntatoriInPresa.has(id)) {
        chiudi(); // è diventato un trascinamento del nastro o della cassetta
        return;
      }
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      if (asse === null) {
        const a = asseDelGesto(dx, dy, SOGLIA_PRESA_PX.dito);
        if (a === null) return;
        const o2 = opz.current;
        const nostro = (a === 'orizzontale' && o2.orizzontale) || (a === 'verticale' && o2.verticale === 'passo');
        if (!nostro) {
          chiudi();
          return;
        }
        asse = a;
        segnaInput();
      }
      campioni.push({ t: ev.timeStamp, v: asse === 'orizzontale' ? dx : dy });
      if (campioni.length > 16) campioni = campioni.slice(-10);
    };

    const suSu = (ev: PointerEvent): void => {
      if (ev.pointerId !== id) return;
      const a = asse;
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      const durata = ev.timeStamp - t0;
      const vel = velocitaFinale(campioni);
      const preso = puntatoriInPresa.has(id);
      chiudi();
      if (a === null || preso) return;
      const verso = versoDelloSwipe(a === 'orizzontale' ? dx : dy, vel, durata);
      if (verso === 0) return;
      segnaInput();
      opz.current.onPasso(verso, a);
    };

    const suAnnullato = (ev: PointerEvent): void => {
      if (ev.pointerId === id) chiudi();
    };

    el.addEventListener('pointerdown', suGiu);
    el.addEventListener('pointermove', suMuovi);
    el.addEventListener('pointerup', suSu);
    el.addEventListener('pointercancel', suAnnullato);

    return () => {
      chiudi();
      el.removeEventListener('pointerdown', suGiu);
      el.removeEventListener('pointermove', suMuovi);
      el.removeEventListener('pointerup', suSu);
      el.removeEventListener('pointercancel', suAnnullato);
    };
  }, [ref]);
}
