/**
 * MADRE · i gettoni del pane fisso in volo (motion-designer,
 * docs/motion-designer.md §6.6; tech-architect §6.4, ux-architect 5.7).
 *
 * Tre voli, tutti nel ticker (misura in 'read', conto in 'update',
 * scrittura di transform e opacity in 'write'), nessun rAF proprio:
 * - torna  il clone trascinato e lasciato fuori da un giorno valido scivola
 *          dritto sopra il suo gettone (circa 320 ms), poi lo si toglie;
 * - posa   il clone lasciato su un giorno valido va sulla riga nuova del
 *          giorno, con un piccolo arco, si rimpicciolisce e ci si scioglie;
 * - porta  "tocca e poi tocca": un doppio del gettone (o della miniatura in
 *          "In mano") vola fino alla riga nuova e ci si scioglie.
 * Reduced motion: nessun volo. Il clone sparisce subito e il gettone è dove
 * era (ux 5.7); la riga nuova compare al suo posto.
 *
 * Contratto per chi passa un elemento a `vola` (il clone di usePrendiPosa):
 * `position: fixed; left: 0; top: 0; margin: 0`, posizionato SOLO con
 * `transform: translate3d(x, y, 0)`, grande come `da.w × da.h`. Da quel
 * momento il transform lo scrive questo modulo finché non chiama `allaFine`.
 *
 * L'arrivo si indica con l'elemento stesso o con una chiave: l'elemento con
 * `data-mad-volo="<chiave>"` (per esempio "mar-segale-500g" sulla riga
 * nuova). Lo si cerca nei frame dopo il render di React (fino a 3) e lo si
 * rimisura a ogni frame, così il volo arriva giusto anche se la pagina
 * scorre. Se non c'è, o è tutto fuori dalla finestra, niente volo.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { ticker } from '../core/ticker';
import { VOLI, VOLO_TENTATIVI_MISURA, type TipoVolo } from './choreography';
import { clamp, clamp01, lerp, posa as curvaPosa, smoothstep01, torna as curvaTorna } from './easing';

export type { TipoVolo } from './choreography';

/** Rettangolo in px della finestra (come getBoundingClientRect). */
export interface Rett {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Dove sta l'elemento in volo in un istante: angolo in alto a sinistra, scala uniforme, opacità. */
export interface PosaVolo {
  x: number;
  y: number;
  s: number;
  opacita: number;
}

export interface OpzioniVolo {
  tipo: 'torna' | 'posa';
  /** Dove sta adesso l'elemento (il clone sotto il dito): già noto, non si misura. */
  da: Rett;
  /** Elemento d'arrivo, o valore del suo `data-mad-volo`. */
  verso: HTMLElement | string;
  ridotto: boolean;
  /** Chiamata nella fase 'write' a fine volo (true) o se il volo non parte o si annulla (false). */
  allaFine?: (arrivato: boolean) => void;
}

/** Converte un DOMRect (o simile) nel nostro rettangolo. */
export function rettDi(r: { left: number; top: number; width: number; height: number }): Rett {
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

/** Durata (ms) di un volo lungo `distanza` px: più lontano, un po' più lungo, entro i limiti. */
export function durataVolo(tipo: TipoVolo, distanza: number): number {
  const p = VOLI[tipo];
  return clamp(p.base + p.perPx * Math.max(0, distanza), p.min, p.max);
}

/**
 * Dove si ferma un elemento grande `da` che arriva su `a`: centrato, scala
 * uniforme per starci dentro (tra 0,2 e 1,5). Funzione pura.
 */
export function arrivoVolo(da: Rett, a: Rett): { x: number; y: number; s: number } {
  const sx = da.w > 0 ? a.w / da.w : 1;
  const sy = da.h > 0 ? a.h / da.h : 1;
  const s = clamp(Math.min(sx, sy), 0.2, 1.5);
  return { x: a.x + (a.w - da.w * s) / 2, y: a.y + (a.h - da.h * s) / 2, s };
}

/** La posa a `t` (0..1 del tempo) di un volo da `da` ad `a`. Funzione pura, scrive in `out`. */
export function posaVolo(tipo: TipoVolo, t: number, da: Rett, a: Rett, out?: PosaVolo): PosaVolo {
  const r = out ?? { x: da.x, y: da.y, s: 1, opacita: 1 };
  const p = VOLI[tipo];
  const e = tipo === 'torna' ? curvaTorna(clamp01(t)) : curvaPosa(clamp01(t));
  const fine = arrivoVolo(da, a);
  const dx = fine.x - da.x;
  const dy = fine.y - da.y;
  const arco = Math.min(p.arcoMax, Math.hypot(dx, dy) * p.arcoPerPx);
  r.x = da.x + dx * e;
  r.y = da.y + dy * e - arco * Math.sin(Math.PI * e);
  r.s = lerp(1, fine.s, e);
  r.opacita = p.dissolvenzaDa >= 1 ? 1 : 1 - smoothstep01((e - p.dissolvenzaDa) / (1 - p.dissolvenzaDa));
  return r;
}

interface Volo {
  tipo: TipoVolo;
  el: HTMLElement | null;
  /** Per 'porta': l'elemento da copiare, misurato al primo frame. */
  sorgente: HTMLElement | null;
  /** true se l'elemento in volo l'ha creato questo modulo (va tolto a fine volo). */
  proprio: boolean;
  da: Rett | null;
  a: Rett | null;
  verso: HTMLElement | string;
  tentativi: number;
  /** ms, calcolata quando si conoscono partenza e arrivo. */
  durata: number;
  /** 0..1 del tempo. */
  t: number;
  stato: 'attesa' | 'volo' | 'arrivato' | 'saltato';
  posa: PosaVolo;
  allaFine: ((arrivato: boolean) => void) | null;
}

let voli: Volo[] = [];
let staccaFasi: (() => void) | null = null;

function cercaArrivo(verso: HTMLElement | string, radice: ParentNode | null): HTMLElement | null {
  if (typeof verso !== 'string') return verso.isConnected ? verso : null;
  const chiave = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(verso) : verso.replace(/["\\]/g, '\\$&');
  return (radice ?? document).querySelector<HTMLElement>(`[data-mad-volo="${chiave}"]`);
}

function fuoriDallaFinestra(r: Rett): boolean {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return r.x + r.w <= 0 || r.y + r.h <= 0 || r.x >= w || r.y >= h;
}

function radiceDi(el: HTMLElement | null): HTMLElement | null {
  return el?.closest<HTMLElement>('.mad-root') ?? null;
}

/** Fase 'read': partenza (solo 'porta'), arrivo cercato e rimisurato a ogni frame. */
function leggi(): boolean {
  let ancora = false;
  for (const volo of voli) {
    if (volo.stato !== 'attesa' && volo.stato !== 'volo') continue;
    ancora = true;

    if (volo.da === null && volo.sorgente !== null) {
      if (!volo.sorgente.isConnected) {
        volo.stato = 'saltato';
        continue;
      }
      volo.da = rettDi(volo.sorgente.getBoundingClientRect());
      if (volo.da.w <= 0 || volo.da.h <= 0 || fuoriDallaFinestra(volo.da)) {
        volo.stato = 'saltato';
        continue;
      }
    }

    const arrivo = cercaArrivo(volo.verso, radiceDi(volo.sorgente ?? volo.el));
    if (arrivo === null) {
      volo.tentativi += 1;
      if (volo.stato === 'volo' || volo.tentativi > VOLO_TENTATIVI_MISURA) volo.stato = 'saltato';
      continue;
    }
    const a = rettDi(arrivo.getBoundingClientRect());
    if (volo.stato === 'attesa' && volo.tipo !== 'torna' && fuoriDallaFinestra(a)) {
      volo.stato = 'saltato';
      continue;
    }
    volo.a = a;
    if (volo.stato === 'attesa' && volo.da !== null) {
      const fine = arrivoVolo(volo.da, a);
      volo.durata = durataVolo(volo.tipo, Math.hypot(fine.x - volo.da.x, fine.y - volo.da.y));
      volo.stato = 'volo';
    }
  }
  return ancora;
}

/** Fase 'update': avanza il tempo e calcola la posa. */
function aggiorna(dt: number): boolean {
  let ancora = false;
  for (const volo of voli) {
    if (volo.stato !== 'volo' || volo.da === null || volo.a === null) continue;
    volo.t = Math.min(1, volo.t + (dt * 1000) / volo.durata);
    posaVolo(volo.tipo, volo.t, volo.da, volo.a, volo.posa);
    if (volo.t >= 1) volo.stato = 'arrivato';
    else ancora = true;
  }
  return ancora;
}

function creaDoppio(volo: Volo): void {
  const sorgente = volo.sorgente;
  const da = volo.da;
  if (sorgente === null || da === null) return;
  const doppio = sorgente.cloneNode(true) as HTMLElement;
  doppio.removeAttribute('id');
  doppio.removeAttribute('data-mad-volo');
  for (const figlio of Array.from(doppio.querySelectorAll('[id], [data-mad-volo], [tabindex]'))) {
    figlio.removeAttribute('id');
    figlio.removeAttribute('data-mad-volo');
    figlio.removeAttribute('tabindex');
  }
  doppio.setAttribute('aria-hidden', 'true');
  doppio.setAttribute('inert', '');
  doppio.setAttribute('data-mad-doppio', '');
  const st = doppio.style;
  st.position = 'fixed';
  st.left = '0';
  st.top = '0';
  st.margin = '0';
  st.boxSizing = 'border-box';
  st.width = `${da.w}px`;
  st.height = `${da.h}px`;
  st.pointerEvents = 'none';
  st.zIndex = 'var(--mad-z-trascinato)';
  st.transformOrigin = '0 0';
  st.willChange = 'transform, opacity';
  st.transform = `translate3d(${da.x}px, ${da.y}px, 0)`;
  (radiceDi(sorgente) ?? document.body).appendChild(doppio);
  volo.el = doppio;
}

function chiudi(volo: Volo, arrivato: boolean): void {
  // Il doppio è nostro e si toglie qui. Il clone di chi chiama resta com'è
  // (anche trasparente, a fine 'posa'): lo toglie `allaFine`.
  if (volo.proprio && volo.el !== null) volo.el.remove();
  const fine = volo.allaFine;
  volo.allaFine = null;
  if (fine !== null) fine(arrivato);
}

/** Fase 'write': transform e opacity; a fine volo `allaFine` e pulizia. */
function scrivi(): boolean {
  const restano: Volo[] = [];
  for (const volo of voli) {
    if (volo.stato === 'saltato') {
      chiudi(volo, false);
      continue;
    }
    if (volo.stato === 'attesa') {
      restano.push(volo);
      continue;
    }
    if (volo.proprio && volo.el === null) creaDoppio(volo);
    const el = volo.el;
    if (el !== null) {
      const { x, y, s, opacita } = volo.posa;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      el.style.opacity = opacita >= 1 ? '' : opacita.toFixed(3);
    }
    if (volo.stato === 'arrivato') chiudi(volo, true);
    else restano.push(volo);
  }
  voli = restano;
  if (voli.length === 0 && staccaFasi !== null) {
    staccaFasi();
    staccaFasi = null;
  }
  return voli.length > 0;
}

function aggiungi(volo: Volo): () => void {
  voli = [...voli, volo];
  if (staccaFasi === null) {
    const r = ticker.add(leggi, 'read');
    const u = ticker.add(aggiorna, 'update');
    const w = ticker.add(scrivi, 'write');
    staccaFasi = () => {
      r();
      u();
      w();
    };
  }
  ticker.wake();
  return () => {
    if (volo.stato === 'attesa' || volo.stato === 'volo') {
      volo.stato = 'saltato';
      ticker.wake();
    }
  };
}

function nuovoVolo(tipo: TipoVolo, verso: HTMLElement | string): Volo {
  return {
    tipo,
    el: null,
    sorgente: null,
    proprio: false,
    da: null,
    a: null,
    verso,
    tentativi: 0,
    durata: 1,
    t: 0,
    stato: 'attesa',
    posa: { x: 0, y: 0, s: 1, opacita: 1 },
    allaFine: null,
  };
}

/**
 * Fa volare `el` (il clone trascinato) da `da` all'arrivo. Restituisce la
 * funzione che annulla il volo (allaFine(false) al frame dopo). Con reduced
 * motion non vola: `allaFine(false)` subito, nel gestore stesso.
 */
export function vola(el: HTMLElement, opz: OpzioniVolo): () => void {
  if (opz.ridotto) {
    opz.allaFine?.(false);
    return () => undefined;
  }
  const volo = nuovoVolo(opz.tipo, opz.verso);
  volo.el = el;
  volo.da = { ...opz.da };
  volo.posa = { x: opz.da.x, y: opz.da.y, s: 1, opacita: 1 };
  volo.allaFine = opz.allaFine ?? null;
  el.style.transformOrigin = '0 0';
  return aggiungi(volo);
}

/**
 * "Tocca e poi tocca": un doppio di `sorgente` (la foto del gettone, o la
 * miniatura nella striscia "In mano"; meglio non un <button>) vola fino
 * all'arrivo e ci si scioglie. Il doppio è `aria-hidden`, `inert`, senza id,
 * e viene tolto a fine volo. Se la sorgente è fuori dalla finestra, niente
 * volo. Con reduced motion non fa niente.
 */
export function portaFantasma(sorgente: HTMLElement, verso: HTMLElement | string, ridotto: boolean): () => void {
  if (ridotto) return () => undefined;
  const volo = nuovoVolo('porta', verso);
  volo.sorgente = sorgente;
  volo.proprio = true;
  return aggiungi(volo);
}

/** Annulla tutti i voli (smontaggio): i doppi spariscono, ogni `allaFine` riceve false. */
export function fermaVoli(): void {
  const tutti = voli;
  voli = [];
  if (staccaFasi !== null) {
    staccaFasi();
    staccaFasi = null;
  }
  for (const volo of tutti) chiudi(volo, false);
}

/** Voli in attesa o in corso (diagnostica e test). */
export function voliInCorso(): number {
  return voli.length;
}
