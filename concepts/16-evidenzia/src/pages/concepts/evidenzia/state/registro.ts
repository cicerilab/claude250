/**
 * EVIDENZIA · registro degli annunci montati e delle loro righe d'attacco
 * (tech-architect §7.1, interaction-designer §8).
 *
 * Ogni `<article data-evd-annuncio>` si registra con la sua riga d'attacco
 * (lo `<span>` dentro il bottone dell'h3). Il registro misura:
 * - `righe`: i rettangoli del testo dell'attacco (Range.getClientRects),
 *   raggruppati per riga (stesso top entro 2 px), al massimo 2, in px CSS
 *   LOCALI dell'article e NON scalati (in Pagina intera si divide per la scala
 *   visiva dell'article: le righe restano le stesse in tutte e due le viste);
 * - `posizione`: il rettangolo dell'article nella pagina non scalata
 *   (minipagina, posti del giro, `mostraElemento`).
 *
 * Quando si misura (mai durante lo scroll, mai in un handler di gesto):
 * alla registrazione, su ResizeObserver dell'article (un solo osservatore per
 * tutti), su `invalida()` (Evidenzia.tsx: font pronti, `loadingdone`, cambio
 * di layout). Le misure in sospeso si fanno tutte insieme nella fase `read`
 * del ticker del frame dopo.
 *
 * Ogni rimisura che cambia qualcosa crea un OGGETTO NUOVO (e un array `righe`
 * nuovo) con `versione + 1`: `useVoceAnnuncio` lo restituisce e Tratto
 * ricalcola le forme con `useMemo([righe])`.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useSyncExternalStore } from 'react';
import { ticker } from '../core/ticker';
import { getPagina } from '../core/scroller';
import type { IdAnnuncio } from './store';

export interface RigaTratto {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Rettangolo {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface VoceAnnuncio {
  readonly id: IdAnnuncio;
  /** l'<article> */
  readonly el: HTMLElement;
  /** lo span della riga d'attacco */
  readonly attacco: HTMLElement;
  /** massimo 2 (CD 4.4) */
  readonly righe: readonly RigaTratto[];
  /** nel contenuto del foglio, non scalato */
  readonly posizione: Rettangolo;
  /** +1 a ogni rimisura che cambia qualcosa */
  readonly versione: number;
}

type Ascoltatore = (id: IdAnnuncio | null) => void;

const RIGHE_MAX = 2;
const STESSA_RIGA_PX = 2;
const TOLLERANZA = 0.25;

const voci = new Map<IdAnnuncio, VoceAnnuncio>();
const perElemento = new Map<Element, IdAnnuncio>();
const ascoltatori = new Set<Ascoltatore>();
const daMisurare = new Set<IdAnnuncio>();
let tuttiDaMisurare = false;
let togliLettura: (() => void) | null = null;
let osservatore: ResizeObserver | null = null;

function avvisa(id: IdAnnuncio | null): void {
  for (const fn of [...ascoltatori]) fn(id);
}

function arrotonda(v: number): number {
  return Math.round(v * 100) / 100;
}

function stessoRett(a: Rettangolo, b: Rettangolo): boolean {
  return (
    Math.abs(a.x - b.x) < TOLLERANZA &&
    Math.abs(a.y - b.y) < TOLLERANZA &&
    Math.abs(a.w - b.w) < TOLLERANZA &&
    Math.abs(a.h - b.h) < TOLLERANZA
  );
}

function stesseRighe(a: readonly RigaTratto[], b: readonly RigaTratto[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const ra = a[i];
    const rb = b[i];
    if (ra === undefined || rb === undefined || !stessoRett(ra, rb)) return false;
  }
  return true;
}

/** Righe dell'attacco in coordinate locali dell'article, non scalate. */
function misuraRighe(attacco: HTMLElement, base: DOMRect, s: number): RigaTratto[] {
  const range = document.createRange();
  range.selectNodeContents(attacco);
  const rett = Array.from(range.getClientRects()).filter((r) => r.width > 0.5 && r.height > 0.5);
  range.detach();
  const gruppi: { top: number; bottom: number; left: number; right: number }[] = [];
  for (const r of rett) {
    const g = gruppi.find((x) => Math.abs(x.top - r.top) <= STESSA_RIGA_PX * s);
    if (g !== undefined) {
      g.left = Math.min(g.left, r.left);
      g.right = Math.max(g.right, r.right);
      g.top = Math.min(g.top, r.top);
      g.bottom = Math.max(g.bottom, r.bottom);
    } else {
      gruppi.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
    }
  }
  gruppi.sort((a, b) => a.top - b.top);
  return gruppi.slice(0, RIGHE_MAX).map((g) => ({
    x: arrotonda((g.left - base.left) / s),
    y: arrotonda((g.top - base.top) / s),
    w: arrotonda((g.right - g.left) / s),
    h: arrotonda((g.bottom - g.top) / s),
  }));
}

function misuraVoce(v: VoceAnnuncio, pagina: DOMRect | null, scalaPagina: number): VoceAnnuncio | null {
  if (!v.el.isConnected || !v.attacco.isConnected) return null;
  const base = v.el.getBoundingClientRect();
  const larghezza = v.el.offsetWidth;
  const s = larghezza > 0 && base.width > 0 ? base.width / larghezza : 1;
  const righe = misuraRighe(v.attacco, base, s);
  const sp = scalaPagina > 0 ? scalaPagina : 1;
  const posizione: Rettangolo =
    pagina === null
      ? { x: arrotonda(base.left + window.scrollX), y: arrotonda(base.top + window.scrollY), w: arrotonda(larghezza), h: arrotonda(v.el.offsetHeight) }
      : {
          x: arrotonda((base.left - pagina.left) / sp),
          y: arrotonda((base.top - pagina.top) / sp),
          w: arrotonda(base.width / sp),
          h: arrotonda(base.height / sp),
        };
  if (stesseRighe(righe, v.righe) && stessoRett(posizione, v.posizione)) return null;
  return { ...v, righe, posizione, versione: v.versione + 1 };
}

/** Fase `read`: tutte le misure in sospeso in un solo passaggio. */
function leggi(): boolean {
  togliLettura?.();
  togliLettura = null;
  const ids = tuttiDaMisurare ? [...voci.keys()] : [...daMisurare];
  const generale = tuttiDaMisurare;
  tuttiDaMisurare = false;
  daMisurare.clear();
  if (ids.length === 0) return false;

  const paginaEl = getPagina();
  const pr = paginaEl?.getBoundingClientRect() ?? null;
  const pw = paginaEl?.offsetWidth ?? 0;
  const scalaPagina = pr !== null && pw > 0 ? pr.width / pw : 1;

  const cambiati: IdAnnuncio[] = [];
  for (const id of ids) {
    const v = voci.get(id);
    if (v === undefined) continue;
    const nuova = misuraVoce(v, pr, scalaPagina);
    if (nuova !== null) {
      voci.set(id, nuova);
      cambiati.push(id);
    }
  }
  if (generale) {
    if (cambiati.length > 0) avvisa(null);
  } else {
    for (const id of cambiati) avvisa(id);
  }
  return false;
}

function pianifica(id: IdAnnuncio | null): void {
  if (id === null) tuttiDaMisurare = true;
  else daMisurare.add(id);
  togliLettura ??= ticker.add(leggi, 'read');
  ticker.wake();
}

function osserva(el: Element): void {
  if (typeof ResizeObserver === 'undefined') return;
  osservatore ??= new ResizeObserver((voci) => {
    for (const v of voci) {
      const id = perElemento.get(v.target);
      if (id !== undefined) pianifica(id);
    }
  });
  osservatore.observe(el);
}

export const registro = {
  /**
   * Registra un annuncio (in un useLayoutEffect di Annuncio.tsx). Restituisce
   * la cancellazione. Registrare di nuovo lo stesso id sostituisce la voce.
   */
  registra(id: IdAnnuncio, el: HTMLElement, attacco: HTMLElement): () => void {
    const vecchia = voci.get(id);
    if (vecchia !== undefined && vecchia.el !== el) {
      perElemento.delete(vecchia.el);
      osservatore?.unobserve(vecchia.el);
    }
    const voce: VoceAnnuncio = {
      id,
      el,
      attacco,
      righe: [],
      posizione: { x: 0, y: 0, w: 0, h: 0 },
      versione: (vecchia?.versione ?? -1) + 1,
    };
    voci.set(id, voce);
    perElemento.set(el, id);
    osserva(el);
    pianifica(id);
    avvisa(id);
    return () => {
      if (voci.get(id)?.el !== el) return;
      voci.delete(id);
      perElemento.delete(el);
      osservatore?.unobserve(el);
      daMisurare.delete(id);
      avvisa(id);
    };
  },

  get(id: IdAnnuncio): VoceAnnuncio | undefined {
    return voci.get(id);
  },

  /** Tutte le voci, nell'ordine di registrazione (= ordine del DOM al primo montaggio). */
  tutti(): readonly VoceAnnuncio[] {
    return [...voci.values()];
  },

  /** `id` = la voce cambiata; null = rimisura generale. Restituisce la cancellazione. */
  subscribe(fn: Ascoltatore): () => void {
    ascoltatori.add(fn);
    return () => {
      ascoltatori.delete(fn);
    };
  },

  /** Rimisura tutto al prossimo frame (font, cambio di layout). */
  invalida(): void {
    if (voci.size === 0) return;
    pianifica(null);
  },

  /** Smontaggio del concept (Evidenzia.tsx). */
  azzera(): void {
    osservatore?.disconnect();
    osservatore = null;
    togliLettura?.();
    togliLettura = null;
    voci.clear();
    perElemento.clear();
    daMisurare.clear();
    tuttiDaMisurare = false;
    istantaneaSporca = true;
  },
};

/** La voce di un annuncio, aggiornata a ogni rimisura (oggetto nuovo). Per Tratto e Minipagina. */
export function useVoceAnnuncio(id: IdAnnuncio): VoceAnnuncio | undefined {
  const iscrivi = useCallback(
    (avvisaReact: () => void) =>
      registro.subscribe((cambiato) => {
        if (cambiato === null || cambiato === id) avvisaReact();
      }),
    [id],
  );
  const leggiVoce = useCallback(() => registro.get(id), [id]);
  return useSyncExternalStore(iscrivi, leggiVoce, () => undefined);
}

/** Tutte le voci (minipagina): un array nuovo a ogni cambio. */
let istantaneaTutti: readonly VoceAnnuncio[] = [];
let istantaneaSporca = true;
registro.subscribe(() => {
  istantaneaSporca = true;
});

function leggiTutti(): readonly VoceAnnuncio[] {
  if (istantaneaSporca) {
    istantaneaTutti = registro.tutti();
    istantaneaSporca = false;
  }
  return istantaneaTutti;
}

const VUOTO: readonly VoceAnnuncio[] = [];

export function useTuttiAnnunci(): readonly VoceAnnuncio[] {
  return useSyncExternalStore(registro.subscribe, leggiTutti, () => VUOTO);
}
