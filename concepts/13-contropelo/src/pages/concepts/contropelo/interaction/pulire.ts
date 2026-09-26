/**
 * CONTROPELO · "Pulire lo specchio": dal puntatore al vapore.
 *
 * Contratto: tech-architect §7.2 (chi chiama cosa) e creative-director §6.1.
 * Questo file NON disegna: trasforma gli eventi del puntatore in tratti
 * (`PuntoTratto[]`, px CSS relativi al vetro) e li consegna a
 * `vapore.pulisci(indice, punti)`. Maschera, pennello, ritorno e gocce sono
 * del motore (`vapore/`).
 *
 * Il gesto:
 * - **Mouse**: pulisce al passaggio (raggio 34 px); tenendo premuto il
 *   pennello diventa il palmo (60 px). Cursore di sistema, nessun cerchio
 *   che segue il mouse.
 * - **Dito e penna**: trascinare pulisce (30 px; fino a 44 px se il tocco è
 *   largo, da `PointerEvent.width`). Sul vetro `touch-action: none` (in
 *   `interaction.css`, solo quando il vapore è vivo): il dito pulisce e
 *   basta, non cambia specchio.
 * - **Traccia continua**: `getCoalescedEvents()` + interpolazione tra due
 *   eventi a passi di 0,3 × raggio: nessun "puntino" a velocità alta.
 * - **Velocità**: il raggio cresce al massimo del 18% con la velocità
 *   (media esponenziale, niente tremolio).
 * - **Tocco o trascinamento**: un tocco fermo (< 8 px) su un elemento
 *   interattivo lo attiva normalmente e pulisce un ovale attorno; un
 *   trascinamento oltre 8 px non attiva mai l'elemento su cui è partito
 *   (`annullaClic.ts`).
 * - **Niente selezione di testo né trascinamento nativo** durante il gesto
 *   premuto (link e immagini non partono in drag-and-drop, il testo a
 *   pennarello non si colora di blu). I campi della riga di scrittura
 *   restano campi normali.
 *
 * Il vetro è pulibile solo se: canvas acceso, vapore vivo (interruttore
 * "Specchio pulito" spento), layout "fisso", specchio attivo, pannello
 * Informazioni chiuso, tastiera virtuale chiusa. Altrimenti gli eventi non
 * producono nulla (il vapore è fermo o assente).
 *
 * Nessun accesso al browser a livello di modulo: tutto nasce in
 * `collegaPulitura`.
 */

import { vapore, type PuntoTratto } from '../vapore';
import { store, type ContropeloState, type IndiceSpecchio } from '../state/store';
import { runtime } from '../state/runtime';
import { creaAnnullaClic, SOGLIA_TRASCINAMENTO_PX } from './annullaClic';
import { SELETTORE_CAMPO, SELETTORE_INTERATTIVO } from './fuoco';

/** Parametri del pennello (px CSS, ms). Il nocciolo pieno al 70% è del motore. */
export const PENNELLO = {
  /** Mouse al passaggio. */
  mouse: 34,
  /** Mouse premuto: il palmo. */
  mousePremuto: 60,
  /** Dito o penna, tocco normale. */
  dito: 30,
  /** Dito largo (pollice piatto). */
  ditoLargo: 44,
  /** Larghezza di contatto (`PointerEvent.width`) da cui il raggio inizia a crescere. */
  contattoMin: 24,
  /** Larghezza di contatto a cui il raggio arriva a `ditoLargo`. */
  contattoMax: 40,
  /** Distanza tra due punti interpolati, in frazione del raggio. */
  passo: 0.3,
  /** Passo minimo in px (evita migliaia di punti a raggi piccoli). */
  passoMinimo: 3,
  /** Tetto di punti per segmento tra due eventi. */
  maxPuntiSegmento: 80,
  /** Velocità (px/ms) a cui il raggio raggiunge l'aumento massimo. */
  velocitaPiena: 2.4,
  /** Aumento massimo del raggio con la velocità (18%). */
  aumentoVelocita: 0.18,
  /** Peso del nuovo campione nella media esponenziale della velocità. */
  pesoVelocita: 0.25,
  /** Margine attorno all'elemento toccato, per l'ovale pulito (px). */
  margineTocco: 14,
  /** Dopo quanti ms il rettangolo del vetro va riletto (la parete può essersi mossa). */
  rettangoloScade: 150,
} as const;

/** true se sul vetro dello specchio `indice` il gesto di pulire ha effetto. */
export function vetroPulibile(s: ContropeloState, indice: IndiceSpecchio): boolean {
  return (
    s.pronto &&
    s.canvas === 'on' &&
    !s.pulito &&
    s.layout === 'fisso' &&
    s.specchio === indice &&
    !s.info &&
    !runtime.viewport.tastiera
  );
}

type TipoPuntatore = 'mouse' | 'touch' | 'pen';

interface Tratto {
  tipo: TipoPuntatore;
  /** Ultimo punto consegnato (px CSS relativi al vetro); null = nessuna traccia da continuare. */
  x: number | null;
  y: number | null;
  r: number;
  t: number;
  /** Velocità media (px/ms). */
  vel: number;
  premuto: boolean;
  /** Punto di partenza della pressione (client px), per la soglia degli 8 px. */
  x0: number;
  y0: number;
  trascinato: boolean;
  /** Elemento interattivo su cui è partita la pressione. */
  interattivo: HTMLElement | null;
}

function tipoDi(e: PointerEvent): TipoPuntatore {
  return e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : 'mouse';
}

function limita(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Raggio base (senza velocità) per un evento. */
function raggioBase(e: PointerEvent, tipo: TipoPuntatore, premuto: boolean): number {
  if (tipo === 'mouse') return premuto ? PENNELLO.mousePremuto : PENNELLO.mouse;
  const contatto = Math.max(e.width || 0, e.height || 0);
  if (tipo === 'pen' || contatto <= 1) return PENNELLO.dito;
  const k = limita((contatto - PENNELLO.contattoMin) / (PENNELLO.contattoMax - PENNELLO.contattoMin), 0, 1);
  return PENNELLO.dito + (PENNELLO.ditoLargo - PENNELLO.dito) * k;
}

function eventiDi(e: PointerEvent): PointerEvent[] {
  if (typeof e.getCoalescedEvents === 'function') {
    const lista = e.getCoalescedEvents();
    if (lista.length > 0) return lista;
  }
  return [e];
}

function elementoDa(target: EventTarget | null): Element | null {
  return target instanceof Element ? target : null;
}

/**
 * Collega il gesto di pulire al vetro di uno specchio.
 *
 * `el` deve essere **lo stesso elemento** passato a `vapore.registra(i,
 * canvas, vetro)`: le coordinate dei punti sono relative al suo rettangolo.
 * Il canvas sopra ha `pointer-events: none`, quindi gli eventi arrivano qui
 * anche quando nascono su un testo o un bottone del vetro.
 *
 * Restituisce la funzione di smontaggio.
 */
export function collegaPulitura(el: HTMLElement, indice: IndiceSpecchio): () => void {
  const tratti = new Map<number, Tratto>();
  const annulla = creaAnnullaClic(el);

  let rect: DOMRect | null = null;
  let rectLetto = Number.NEGATIVE_INFINITY;
  let rectSporco = true;

  const osservatore =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          rectSporco = true;
        })
      : null;
  osservatore?.observe(el);

  const suResize = (): void => {
    rectSporco = true;
  };
  window.addEventListener('resize', suResize, { passive: true });

  /**
   * Rettangolo del vetro, riletto se vecchio o sporco. Se il vetro si è
   * spostato (pan della parete) le tracce in corso ripartono da capo: niente
   * linea che attraversa lo specchio.
   */
  const rettangolo = (ora: number): DOMRect => {
    if (rect === null || rectSporco || ora - rectLetto > PENNELLO.rettangoloScade) {
      const nuovo = el.getBoundingClientRect();
      if (rect !== null && (Math.abs(nuovo.left - rect.left) > 1 || Math.abs(nuovo.top - rect.top) > 1)) {
        for (const tr of tratti.values()) {
          tr.x = null;
          tr.y = null;
        }
      }
      rect = nuovo;
      rectLetto = ora;
      rectSporco = false;
    }
    return rect;
  };

  const attivo = (): boolean => vetroPulibile(store.get(), indice);

  const nuovoTratto = (e: PointerEvent, premuto: boolean): Tratto => {
    const tipo = tipoDi(e);
    const bersaglio = elementoDa(e.target);
    const interattivo = bersaglio?.closest<HTMLElement>(SELETTORE_INTERATTIVO) ?? null;
    return {
      tipo,
      x: null,
      y: null,
      r: raggioBase(e, tipo, premuto),
      t: e.timeStamp,
      vel: 0,
      premuto,
      x0: e.clientX,
      y0: e.clientY,
      trascinato: false,
      interattivo: interattivo !== null && el.contains(interattivo) ? interattivo : null,
    };
  };

  /**
   * Aggiunge a `out` i punti tra l'ultimo punto del tratto e (x, y),
   * interpolati, e aggiorna il tratto.
   */
  const accoda = (tr: Tratto, x: number, y: number, rBase: number, t: number, out: PuntoTratto[]): void => {
    if (tr.x === null || tr.y === null) {
      tr.x = x;
      tr.y = y;
      tr.t = t;
      tr.vel = 0;
      tr.r = rBase;
      out.push({ x, y, r: rBase, t });
      return;
    }
    const dx = x - tr.x;
    const dy = y - tr.y;
    const d = Math.hypot(dx, dy);
    const dt = Math.max(1, t - tr.t);
    tr.vel += (d / dt - tr.vel) * PENNELLO.pesoVelocita;
    const r1 = rBase * (1 + PENNELLO.aumentoVelocita * Math.min(1, tr.vel / PENNELLO.velocitaPiena));
    if (d < 0.5) {
      tr.r = r1;
      tr.t = t;
      return;
    }
    const passo = Math.max(PENNELLO.passoMinimo, Math.min(tr.r, r1) * PENNELLO.passo);
    const n = Math.min(PENNELLO.maxPuntiSegmento, Math.max(1, Math.ceil(d / passo)));
    const x0 = tr.x;
    const y0 = tr.y;
    const r0 = tr.r;
    const t0 = tr.t;
    for (let k = 1; k <= n; k += 1) {
      const f = k / n;
      out.push({ x: x0 + dx * f, y: y0 + dy * f, r: r0 + (r1 - r0) * f, t: t0 + (t - t0) * f });
    }
    tr.x = x;
    tr.y = y;
    tr.r = r1;
    tr.t = t;
  };

  /** Consegna al vapore i punti dell'evento (e dei suoi eventi coalescenti). */
  const traccia = (tr: Tratto, e: PointerEvent): void => {
    const r = rettangolo(e.timeStamp);
    const punti: PuntoTratto[] = [];
    for (const ev of eventiDi(e)) {
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const rBase = raggioBase(ev, tr.tipo, tr.premuto);
      // Fuori dal vetro (dito catturato che esce): la traccia si interrompe.
      if (x < -rBase || y < -rBase || x > r.width + rBase || y > r.height + rBase) {
        tr.x = null;
        tr.y = null;
        continue;
      }
      accoda(tr, x, y, rBase, ev.timeStamp, punti);
    }
    if (punti.length > 0) vapore.pulisci(indice, punti);
  };

  /** Ovale pulito attorno a un elemento toccato (tocco fermo). */
  const pulisciAttorno = (bersaglio: HTMLElement, t: number): void => {
    const r = rettangolo(t);
    const b = bersaglio.getBoundingClientRect();
    if (b.width === 0 && b.height === 0) return;
    const raggio = b.height / 2 + PENNELLO.margineTocco;
    const cy = b.top + b.height / 2 - r.top;
    const da = b.left - r.left + Math.min(b.width / 2, b.height / 2);
    const a = b.right - r.left - Math.min(b.width / 2, b.height / 2);
    const passo = Math.max(PENNELLO.passoMinimo, raggio * 0.5);
    const n = Math.max(1, Math.ceil((a - da) / passo));
    const punti: PuntoTratto[] = [];
    for (let k = 0; k <= n; k += 1) {
      punti.push({ x: da + ((a - da) * k) / n, y: cy, r: raggio, t });
    }
    vapore.pulisci(indice, punti);
  };

  const controllaTrascinamento = (tr: Tratto, e: PointerEvent): void => {
    if (tr.trascinato || !tr.premuto) return;
    if (Math.hypot(e.clientX - tr.x0, e.clientY - tr.y0) > SOGLIA_TRASCINAMENTO_PX) tr.trascinato = true;
  };

  /* -------------------------------- eventi ------------------------------- */

  const suEnter = (e: PointerEvent): void => {
    if (tipoDi(e) !== 'mouse') return;
    // Il mouse rientra: la traccia riparte dal punto d'ingresso.
    const tr = tratti.get(e.pointerId);
    if (tr !== undefined) {
      tr.x = null;
      tr.y = null;
    }
    rectSporco = true;
  };

  const suLeave = (e: PointerEvent): void => {
    if (tipoDi(e) !== 'mouse') return;
    tratti.delete(e.pointerId);
  };

  const suDown = (e: PointerEvent): void => {
    if (!e.isPrimary && tipoDi(e) === 'mouse') return;
    if (e.button !== 0) return;
    const bersaglio = elementoDa(e.target);
    // Dentro un campo della riga di scrittura il puntatore scrive, non pulisce.
    if (bersaglio?.closest(SELETTORE_CAMPO) != null) {
      tratti.delete(e.pointerId);
      return;
    }
    const precedente = tratti.get(e.pointerId);
    const tr = nuovoTratto(e, true);
    if (precedente !== undefined && tr.tipo === 'mouse') {
      // Il mouse era già in traccia al passaggio: il palmo continua da lì.
      tr.x = precedente.x;
      tr.y = precedente.y;
      tr.r = precedente.r;
      tr.t = precedente.t;
      tr.vel = precedente.vel;
    }
    tratti.set(e.pointerId, tr);
    if (!attivo()) return;
    // Il dito che si appoggia pulisce subito un tondo; il mouse allarga il pennello.
    traccia(tr, e);
  };

  const suMove = (e: PointerEvent): void => {
    const tipo = tipoDi(e);
    let tr = tratti.get(e.pointerId);
    if (tr === undefined) {
      // Al passaggio pulisce solo il mouse (la penna in hover no).
      if (tipo !== 'mouse' || e.buttons !== 0) return;
      tr = nuovoTratto(e, false);
      tratti.set(e.pointerId, tr);
    }
    if (tr.tipo === 'mouse' && tr.premuto && (e.buttons & 1) === 0) {
      // Rilascio perso (fuori finestra): torna al passaggio.
      tr.premuto = false;
      tr.trascinato = false;
    }
    if (tr.tipo !== 'mouse' && !tr.premuto) return;
    controllaTrascinamento(tr, e);
    if (!attivo()) {
      tr.x = null;
      tr.y = null;
      return;
    }
    traccia(tr, e);
  };

  const termina = (e: PointerEvent, annullato: boolean): void => {
    const tr = tratti.get(e.pointerId);
    if (tr === undefined) return;
    if (tr.premuto && tr.trascinato) {
      annulla.arma();
    } else if (!annullato && tr.premuto && tr.tipo !== 'mouse' && tr.interattivo !== null && attivo()) {
      pulisciAttorno(tr.interattivo, e.timeStamp);
    }
    if (tr.tipo === 'mouse' && !annullato) {
      // Il mouse resta sul vetro: si torna al pennello del passaggio, la traccia continua.
      tr.premuto = false;
      tr.trascinato = false;
      tr.interattivo = null;
      return;
    }
    tratti.delete(e.pointerId);
  };

  const suUp = (e: PointerEvent): void => termina(e, false);
  const suCancel = (e: PointerEvent): void => termina(e, true);

  /** true se un gesto premuto (qualsiasi puntatore) è in corso sul vetro. */
  const premutoInCorso = (): boolean => {
    for (const tr of tratti.values()) if (tr.premuto) return true;
    return false;
  };

  const suSelectStart = (e: Event): void => {
    if (!premutoInCorso()) return;
    if (elementoDa(e.target)?.closest(SELETTORE_CAMPO) != null) return;
    if (!attivo()) return;
    e.preventDefault();
  };

  const suDragStart = (e: DragEvent): void => {
    if (premutoInCorso() && attivo()) e.preventDefault();
  };

  const suContextMenu = (e: MouseEvent): void => {
    // Pressione lunga del dito sul vetro: nessun menu, si sta pulendo.
    for (const tr of tratti.values()) {
      if (tr.premuto && tr.tipo !== 'mouse' && attivo()) {
        e.preventDefault();
        return;
      }
    }
  };

  el.addEventListener('pointerenter', suEnter, { passive: true });
  el.addEventListener('pointerleave', suLeave, { passive: true });
  el.addEventListener('pointerdown', suDown, { passive: true });
  el.addEventListener('pointermove', suMove, { passive: true });
  el.addEventListener('pointerup', suUp, { passive: true });
  el.addEventListener('pointercancel', suCancel, { passive: true });
  el.addEventListener('selectstart', suSelectStart);
  el.addEventListener('dragstart', suDragStart);
  el.addEventListener('contextmenu', suContextMenu);

  return () => {
    el.removeEventListener('pointerenter', suEnter);
    el.removeEventListener('pointerleave', suLeave);
    el.removeEventListener('pointerdown', suDown);
    el.removeEventListener('pointermove', suMove);
    el.removeEventListener('pointerup', suUp);
    el.removeEventListener('pointercancel', suCancel);
    el.removeEventListener('selectstart', suSelectStart);
    el.removeEventListener('dragstart', suDragStart);
    el.removeEventListener('contextmenu', suContextMenu);
    window.removeEventListener('resize', suResize);
    osservatore?.disconnect();
    annulla.stacca();
    tratti.clear();
  };
}
