/**
 * IMPRONTA · registro dei blocchi a rilievo (tech-architect §7.2,
 * motion-designer §4.4, webgl-artist §10.2).
 *
 * Ogni blocco DOM premuto si registra (di solito con `useRelief`). Il
 * registro tiene il rettangolo in coordinate DOCUMENTO e a ogni frame (fase
 * 'read' del ticker) lo porta in coordinate VIEWPORT sottraendo
 * `runtime.scrollY`, senza leggere il layout: zero reflow durante lo scroll.
 *
 * Misure "doc" (default): `getBoundingClientRect()` + scroll, lette solo
 * - alla registrazione,
 * - su ResizeObserver dell'elemento,
 * - su resize della finestra (150 ms di attesa),
 * - a font pronti (`document.fonts.ready` e `loadingdone`),
 * - quando una sezione dichiara un cambio di layout (`registry.invalidate()`).
 *
 * Misure "live": per i blocchi dentro contenitori sticky, trasformati o che
 * scorrono in orizzontale. Il ticker li rilegge nella fase 'read', SOLO se
 * visibili, al massimo 4 per frame (in ordine di registrazione).
 *
 * Pezzi ruotati: il rettangolo è quello NON ruotato (offsetWidth ×
 * offsetHeight) centrato sul centro del riquadro misurato; la rotazione
 * arriva allo shader da `spec.rotazione`.
 *
 * Visibilità: un solo IntersectionObserver con `rootMargin: '100% 0px'`.
 * La scelta degli 8 blocchi per frame (priorità, distanza dal centro) è dello
 * shader-engineer (`webgl/blocks.ts`): qui `visible()` dà tutti i visibili.
 *
 * Nessun accesso al browser a livello di modulo: observer e listener nascono
 * con il primo blocco e muoiono con l'ultimo. Lo scroll orizzontale della
 * pagina è sempre 0 (nessuna sezione scorre la pagina in orizzontale), quindi
 * `rectView.x = rectDoc.x` per i blocchi "doc".
 */

import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import type { EventoRegistro, ReliefBlock, ReliefSpec, Rettangolo } from './types';

/** Blocchi "live" riletti per frame, al massimo (tech-architect §7.2). */
export const MAX_LIVE = 4;
/** Attesa dopo un resize della finestra prima di rimisurare (ms). */
export const RESIZE_ATTESA = 150;
/** Margine dell'IntersectionObserver di visibilità. */
export const MARGINE_VISIBILITA = '100% 0px';
/** Attributo messo sull'elemento registrato (utile in devtools e QA). */
export const ATTR_RELIEF = 'data-imp-relief';

type AscoltatoreRegistro = (evento: EventoRegistro) => void;

const blocchi = new Map<string, ReliefBlock>();
const perElemento = new WeakMap<Element, string>();
const ascoltatori = new Set<AscoltatoreRegistro>();

let contatore = 0;
let elencoCache: ReliefBlock[] | null = null;

let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;
let togliTick: (() => void) | null = null;
let togliGlobali: (() => void) | null = null;

/* ------------------------------------------------------------------ aiuti */

function limita01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function emetti(evento: EventoRegistro): void {
  for (const fn of [...ascoltatori]) {
    try {
      fn(evento);
    } catch (errore) {
      if (import.meta.env.DEV) console.error('[impronta/registry] errore in un ascoltatore', errore);
    }
  }
}

function uguale(a: Rettangolo, b: Rettangolo): boolean {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

/** Rettangolo viewport non ruotato del blocco, leggendo il layout. */
function leggiRettangoloView(b: ReliefBlock): Rettangolo {
  const r = b.el.getBoundingClientRect();
  const ruotato = (b.spec.rotazione ?? 0) !== 0;
  const w = ruotato ? b.el.offsetWidth : r.width;
  const h = ruotato ? b.el.offsetHeight : r.height;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Misura "doc": rilegge il layout e aggiorna rectDoc e rectView. */
function misuraDoc(b: ReliefBlock): boolean {
  if (!b.el.isConnected) return false;
  const v = leggiRettangoloView(b);
  const scrollY = window.scrollY;
  const doc: Rettangolo = { x: v.x, y: v.y + scrollY, w: v.w, h: v.h };
  const view: Rettangolo = { x: doc.x, y: doc.y - runtime.scrollY, w: doc.w, h: doc.h };
  const cambiato = !uguale(doc, b.rectDoc) || !uguale(view, b.rectView);
  b.rectDoc = doc;
  b.rectView = view;
  b.misurato = doc.w > 0 && doc.h > 0;
  return cambiato;
}

/** Specifiche che cambiano la maschera (serve ricuocere). */
function cambiaMaschera(prima: ReliefSpec, dopo: ReliefSpec): boolean {
  if (prima.kind !== dopo.kind || prima.text !== dopo.text || prima.svg !== dopo.svg || prima.tecnica !== dopo.tecnica) {
    return true;
  }
  if (prima.slot?.maxW !== dopo.slot?.maxW || prima.slot?.maxH !== dopo.slot?.maxH) return true;
  if (prima.layers === dopo.layers) return false;
  return JSON.stringify(prima.layers ?? null) !== JSON.stringify(dopo.layers ?? null);
}

/* ------------------------------------------------------------------ frame */

/** Fase 'read': rectView di tutti i visibili; i "live" rileggono il layout. */
function faseLettura(): boolean {
  let live = 0;
  let sporco = false;
  const scrollY = runtime.scrollY;
  for (const b of blocchi.values()) {
    if (!b.visibile) continue;
    if (b.spec.tracking === 'live' && live < MAX_LIVE && b.el.isConnected) {
      live += 1;
      const v = leggiRettangoloView(b);
      if (!uguale(v, b.rectView)) {
        b.rectView = v;
        b.rectDoc = { x: v.x, y: v.y + scrollY, w: v.w, h: v.h };
        b.misurato = v.w > 0 && v.h > 0;
        sporco = true;
      }
      continue;
    }
    const y = b.rectDoc.y - scrollY;
    if (y !== b.rectView.y || b.rectView.x !== b.rectDoc.x || b.rectView.w !== b.rectDoc.w || b.rectView.h !== b.rectDoc.h) {
      b.rectView = { x: b.rectDoc.x, y, w: b.rectDoc.w, h: b.rectDoc.h };
      sporco = true;
    }
  }
  if (sporco) runtime.markDirty();
  return false;
}

/* ------------------------------------------------------------------ osservatori */

function suIntersezione(voci: IntersectionObserverEntry[]): void {
  let cambiato = false;
  for (const voce of voci) {
    const id = perElemento.get(voce.target);
    if (id === undefined) continue;
    const b = blocchi.get(id);
    if (b === undefined || b.visibile === voce.isIntersecting) continue;
    b.visibile = voce.isIntersecting;
    cambiato = true;
    emetti({ tipo: 'visibilita', id });
  }
  if (cambiato) {
    runtime.markDirty();
    ticker.wake();
  }
}

function suRidimensiona(voci: ResizeObserverEntry[]): void {
  let cambiato = false;
  for (const voce of voci) {
    const id = perElemento.get(voce.target);
    if (id === undefined) continue;
    const b = blocchi.get(id);
    if (b === undefined) continue;
    if (misuraDoc(b)) {
      cambiato = true;
      emetti({ tipo: 'misura', id });
    }
  }
  if (cambiato) {
    runtime.markDirty();
    ticker.wake();
  }
}

function attaccaGlobali(): () => void {
  let timer = 0;
  let vivo = true;
  const suResize = (): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      registry.invalidate();
    }, RESIZE_ATTESA);
  };
  const suFont = (): void => {
    if (vivo) registry.invalidate();
  };
  window.addEventListener('resize', suResize, { passive: true });
  const fonts = 'fonts' in document ? document.fonts : null;
  fonts?.addEventListener('loadingdone', suFont);
  void fonts?.ready.then(suFont, () => undefined);
  return () => {
    vivo = false;
    window.clearTimeout(timer);
    window.removeEventListener('resize', suResize);
    fonts?.removeEventListener('loadingdone', suFont);
  };
}

function avvia(): void {
  if (typeof window === 'undefined') return;
  if (io === null && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(suIntersezione, { rootMargin: MARGINE_VISIBILITA, threshold: 0 });
  }
  if (ro === null && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(suRidimensiona);
  }
  if (togliTick === null) togliTick = ticker.add(faseLettura, 'read');
  if (togliGlobali === null) togliGlobali = attaccaGlobali();
}

function ferma(): void {
  io?.disconnect();
  io = null;
  ro?.disconnect();
  ro = null;
  togliTick?.();
  togliTick = null;
  togliGlobali?.();
  togliGlobali = null;
}

/* ------------------------------------------------------------------ API */

export const registry = {
  /**
   * Registra un elemento con la sua specifica. Misura subito e osserva
   * dimensioni e visibilità. Se l'elemento era già registrato, lo sostituisce.
   * Restituisce l'id del blocco.
   */
  register(el: HTMLElement, spec: ReliefSpec): string {
    const vecchio = perElemento.get(el);
    if (vecchio !== undefined) registry.unregister(vecchio);

    contatore += 1;
    const id = `r${contatore}`;
    const vuoto: Rettangolo = { x: 0, y: 0, w: 0, h: 0 };
    const blocco: ReliefBlock = {
      id,
      el,
      spec: { ...spec },
      rectDoc: vuoto,
      rectView: { ...vuoto },
      pressione: 0,
      versione: 1,
      visibile: false,
      ordine: contatore,
      misurato: false,
    };
    blocchi.set(id, blocco);
    perElemento.set(el, id);
    elencoCache = null;
    el.setAttribute(ATTR_RELIEF, id);

    avvia();
    if (typeof window !== 'undefined') misuraDoc(blocco);
    io?.observe(el);
    ro?.observe(el);

    emetti({ tipo: 'aggiunto', id });
    runtime.markDirty();
    ticker.wake();
    return id;
  },

  /** Toglie il blocco. Id sconosciuto: nessun effetto. */
  unregister(id: string): void {
    const b = blocchi.get(id);
    if (b === undefined) return;
    io?.unobserve(b.el);
    ro?.unobserve(b.el);
    if (b.el.getAttribute(ATTR_RELIEF) === id) b.el.removeAttribute(ATTR_RELIEF);
    perElemento.delete(b.el);
    blocchi.delete(id);
    elencoCache = null;
    emetti({ tipo: 'rimosso', id });
    runtime.markDirty();
    if (blocchi.size === 0) ferma();
  },

  /**
   * Cambia la specifica. Se cambia la maschera (testo, svg, layer, tecnica,
   * kind, slot) incrementa `versione` ed emette 'versione'; altrimenti
   * emette 'spec'. Un cambio di rotazione o di tracking rimisura.
   */
  update(id: string, patch: Partial<ReliefSpec>): void {
    const b = blocchi.get(id);
    if (b === undefined) return;
    const prima = b.spec;
    const dopo: ReliefSpec = { ...prima, ...patch };
    b.spec = dopo;
    if ((prima.rotazione ?? 0) !== (dopo.rotazione ?? 0) || prima.tracking !== dopo.tracking) {
      if (typeof window !== 'undefined') misuraDoc(b);
    }
    if (cambiaMaschera(prima, dopo)) {
      b.versione += 1;
      emetti({ tipo: 'versione', id });
    } else {
      emetti({ tipo: 'spec', id });
    }
    runtime.markDirty();
    ticker.wake();
  },

  /** Forza la ricottura della maschera (es. cambio di stile del fantasma non visibile nella spec). */
  ridisegna(id: string): void {
    const b = blocchi.get(id);
    if (b === undefined) return;
    b.versione += 1;
    emetti({ tipo: 'versione', id });
    runtime.markDirty();
    ticker.wake();
  },

  /**
   * v viene limitato a 0..1. Se il valore cambia, aggiorna block.pressione e
   * chiama runtime.markDirty(). Id sconosciuto (blocco già rimosso): nessun effetto.
   * Chiamata anche a ogni frame durante una pressa: O(1) (Map per id).
   */
  setPressione(id: string, v: number): void {
    const b = blocchi.get(id);
    if (b === undefined) return;
    const x = limita01(v);
    if (x === b.pressione) return;
    b.pressione = x;
    runtime.markDirty();
  },

  /** Il blocco con quell'id, o undefined. */
  get(id: string): ReliefBlock | undefined {
    return blocchi.get(id);
  },

  /** Tutti i blocchi, in ordine di registrazione. L'array è condiviso: non modificarlo. */
  all(): readonly ReliefBlock[] {
    if (elencoCache === null) elencoCache = [...blocchi.values()];
    return elencoCache;
  },

  /** I blocchi entro una viewport dallo schermo (IntersectionObserver). */
  visible(): ReliefBlock[] {
    const out: ReliefBlock[] = [];
    for (const b of blocchi.values()) if (b.visibile) out.push(b);
    return out;
  },

  /** Numero di blocchi registrati. */
  get size(): number {
    return blocchi.size;
  },

  /**
   * Ascolta aggiunte, rimozioni, cambi di versione/spec/misura/visibilità
   * (per lo shader-engineer). Restituisce la funzione per smettere.
   */
  subscribe(fn: AscoltatoreRegistro): () => void {
    ascoltatori.add(fn);
    return () => {
      ascoltatori.delete(fn);
    };
  },

  /**
   * Rimisura tutti i blocchi "doc" (una sezione ha cambiato layout: pin che
   * si stacca, testo lungo che va a capo, font arrivati). Legge il layout:
   * non chiamarla a ogni frame.
   */
  invalidate(): void {
    if (typeof window === 'undefined') return;
    let cambiato = false;
    for (const b of blocchi.values()) {
      if (misuraDoc(b)) {
        cambiato = true;
        emetti({ tipo: 'misura', id: b.id });
      }
    }
    if (cambiato) {
      runtime.markDirty();
      ticker.wake();
    }
  },

  /** Rimisura un solo blocco. */
  misura(id: string): void {
    const b = blocchi.get(id);
    if (b === undefined || typeof window === 'undefined') return;
    if (misuraDoc(b)) {
      emetti({ tipo: 'misura', id });
      runtime.markDirty();
      ticker.wake();
    }
  },
};

export type Registry = typeof registry;
