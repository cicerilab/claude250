/**
 * MADRE · "prendi in mano / posa" del pane fisso (interaction-designer §5,
 * tech-architect §6.4, ux-architect §5.7, §5.8 e §6.6, creative-director §4.4).
 *
 * Tre modi equivalenti per mettere un pane in un giorno (o una pasta, o il
 * vassoio, sulla domenica):
 *
 * 1. **tocca e poi tocca** (il modo principale su mobile, e anche il clic del
 *    mouse): un tocco sul gettone lo prende in mano (`prendiInMano`), i tocchi
 *    sui giorni lo mettono (`metti`: un secondo tocco sullo stesso giorno
 *    aggiunge un pezzo), un altro tocco sul gettone lo posa;
 * 2. **trascina** (mouse, penna, dito): col mouse parte dopo 8 px; col dito
 *    dopo 250 ms di pressione quasi ferma (prima è un tocco o uno scroll, e la
 *    fila dei gettoni su mobile scorre di lato come sempre). Un clone del
 *    gettone segue il puntatore; i giorni dove quel pane si fa diventano
 *    carta da zucchero; il giorno sotto il puntatore ha il filo d'inchiostro.
 *    Rilascio su un giorno: si mette. Fuori o su un giorno sbagliato: il
 *    clone torna al suo posto (con reduced motion sparisce e il gettone
 *    riappare). Esc, scroll del browser o finestra che perde il fuoco
 *    annullano. Vicino ai bordi della finestra la pagina scorre da sola;
 * 3. **tastiera**: il gettone e i giorni sono `<button>`; Invio o Spazio sul
 *    gettone lo prende, sui giorni lo mette; Esc lo posa. Senza niente in
 *    mano, Invio su un giorno porta il fuoco al primo gettone.
 *
 * In più `useRigaTrascinabile`: una riga già messa si toglie trascinandola
 * fuori dal suo scomparto per la maniglia (l'alternativa è il meno).
 *
 * Gli annunci `aria-live` li fanno le azioni dello store (tech-architect
 * §6.1): qui nessun testo. Il colore "si fa" dei giorni cambia al massimo
 * una volta ogni 500 ms (antiLampeggio.ts).
 *
 * Contratto per le sezioni: il gettone e il suo clone vivono sotto
 * `.mad-root`; gli stili del gettone non devono dipendere da antenati
 * diversi da `.mad-root` e da `[data-mad-fondo]` (il clone li copia).
 *
 * Nessun accesso al browser a livello di modulo (prerender).
 */

import { useEffect, useRef, useState, useSyncExternalStore, type ButtonHTMLAttributes, type HTMLAttributes, type RefObject } from 'react';
import type { IdGiorno } from '../content/prezzi';
import { ANNUNCI } from '../content/testi';
import { annuncia } from '../core/annunci';
import { ticker } from '../core/ticker';
import { VOLI, type ParametriVolo } from '../motion/choreography';
import { posa as curvaPosa, torna as curvaTorna, type Easing } from '../motion/easing';
import { puoStare } from '../state/settimana';
import {
  metti,
  mettiSulVassoio,
  mettiVassoio,
  posa,
  prendiInMano,
  store,
  togli,
  useMadre,
  type EsitoMetti,
  type InMano,
  type MadreState,
} from '../state/store';
import { useValoreLento } from './antiLampeggio';

/* ------------------------------------------------------------------ tipi */

/** Quello che si può avere in mano: un pane, una pasta, il vassoio. */
export type Cosa = Exclude<InMano, null>;

/** Dove si può posare: un giorno della settimana o il vassoio della domenica. */
export type Bersaglio = { tipo: 'giorno'; giorno: IdGiorno } | { tipo: 'vassoio' };

type AttributiDati = {
  'data-mad-ix': string;
  'data-mad-in-mano'?: '';
  'data-mad-valido'?: 'true' | 'false';
  'data-mad-sopra'?: '';
};

export type PropsPresa = ButtonHTMLAttributes<HTMLButtonElement> & AttributiDati;
export type PropsBersaglio = ButtonHTMLAttributes<HTMLButtonElement> & AttributiDati;
export type PropsManiglia = HTMLAttributes<HTMLElement> & AttributiDati;

/* ----------------------------------------------------------------- soglie */

/** Movimento del mouse o della penna oltre il quale il clic diventa trascinamento. */
export const SOGLIA_TRASCINA_PX = 8;
/** Pressione ferma del dito che fa partire il trascinamento di un gettone. */
export const ATTESA_TRASCINA_TOUCH_MS = 250;
/** Fascia vicino ai bordi della finestra (oltre i fissi) che fa scorrere la pagina. */
export const ZONA_BORDO_PX = 48;
/** Velocità massima dello scorrimento ai bordi (px/s). */
const VELOCITA_BORDO = 900;
/** Dopo un trascinamento, il clic gemello sul gettone è assorbito. */
const CLIC_DOPO_TRASCINA_MS = 400;

/** Inclinazione e ingrandimento del gettone sollevato (niente con reduced motion). */
const SOLLEVATO = { ruota: -2, scala: 1.04 } as const;

/* ------------------------------------------------------------- regole */

/** Chiave stabile di una cosa: 'pane:segale', 'pasta:bigne', 'vassoio'. */
export function chiaveCosa(c: Cosa): string {
  return c.tipo === 'vassoio' ? 'vassoio' : `${c.tipo}:${c.id}`;
}

function chiaveBersaglio(b: Bersaglio): string {
  return b.tipo === 'vassoio' ? 'vassoio' : `giorno:${b.giorno}`;
}

function bersaglioDaChiave(k: string): Bersaglio {
  return k === 'vassoio' ? { tipo: 'vassoio' } : { tipo: 'giorno', giorno: k.slice(7) as IdGiorno };
}

function ugualeInMano(a: InMano, b: InMano): boolean {
  if (a === null || b === null) return a === b;
  return chiaveCosa(a) === chiaveCosa(b);
}

/** Il giorno vero di un bersaglio (il vassoio sta nella domenica). */
function giornoDi(b: Bersaglio): IdGiorno {
  return b.tipo === 'giorno' ? b.giorno : 'dom';
}

/** Questa cosa può stare lì? (per colorare i giorni "si fa" mentre è in mano) */
export function eValido(cosa: Cosa, b: Bersaglio): boolean {
  switch (cosa.tipo) {
    case 'pane':
      return puoStare(cosa.id, giornoDi(b)).ok;
    case 'pasta':
    case 'vassoio':
      return giornoDi(b) === 'dom';
  }
}

/**
 * Posa la cosa sul bersaglio passando dalle azioni dello store (che
 * validano, mettono l'errore nello scomparto e annunciano).
 * - pane su un giorno → `metti(giorno, pane)`; pane sul vassoio → domenica;
 * - pasta sulla domenica o sul vassoio → `mettiSulVassoio(pasta)`;
 * - vassoio sulla domenica → `mettiVassoio('dom')`;
 * - pasta o vassoio su un altro giorno → `mettiVassoio(giorno)`, che non
 *   cambia nulla e restituisce l'errore "il vassoio è solo la domenica".
 */
export function deponi(cosa: Cosa, b: Bersaglio): EsitoMetti {
  const giorno = giornoDi(b);
  switch (cosa.tipo) {
    case 'pane':
      return metti(giorno, cosa.id);
    case 'pasta':
      return giorno === 'dom' ? mettiSulVassoio(cosa.id) : mettiVassoio(giorno);
    case 'vassoio':
      return mettiVassoio(giorno);
  }
}

/** La cosa è già lì? (per `aria-pressed` del bersaglio) */
function giaLi(s: MadreState, b: Bersaglio): boolean | null {
  const c = s.inMano;
  if (c === null) return null;
  const giorno = giornoDi(b);
  switch (c.tipo) {
    case 'pane':
      return s.settimana[giorno].some((r) => r.pane === c.id);
    case 'pasta':
      return giorno === 'dom' && s.vassoio !== null && s.vassoio.preferite.includes(c.id);
    case 'vassoio':
      return giorno === 'dom' && s.vassoio !== null;
  }
}

function settimanaBloccata(s: MadreState): boolean {
  return s.invio === 'sending' || s.invio === 'sent';
}

/* ------------------------------------------------ registro (solo nel browser) */

interface VoceBersaglio {
  readonly el: HTMLElement;
  bersaglio: Bersaglio;
  impostaSopra(v: boolean): void;
}

/** Bersagli montati, per trovarli sotto il puntatore. */
const bersagli = new Map<Element, VoceBersaglio>();
/** Gettoni montati, per "prendi prima un pane" (il primo in ordine di pagina). */
const prese = new Set<HTMLElement>();

function visibile(el: HTMLElement): boolean {
  return el.isConnected && el.closest('[hidden], [inert]') === null && el.getClientRects().length > 0;
}

function primaPresa(): HTMLElement | null {
  const ordinate = Array.from(prese)
    .filter(visibile)
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  return ordinate[0] ?? null;
}

/* ------------------------------------- cosa trascinata (store di questo file) */

let cosaTrascinata: Cosa | null = null;
const ascoltaTrascinata = new Set<() => void>();

function impostaTrascinata(c: Cosa | null): void {
  if (c === cosaTrascinata) return;
  cosaTrascinata = c;
  for (const fn of ascoltaTrascinata) fn();
}

function iscriviTrascinata(fn: () => void): () => void {
  ascoltaTrascinata.add(fn);
  return () => {
    ascoltaTrascinata.delete(fn);
  };
}

function useCosaTrascinata(): Cosa | null {
  return useSyncExternalStore(
    iscriviTrascinata,
    () => cosaTrascinata,
    () => null,
  );
}

/* --------------------------------------------------------- sessione unica */

interface Sessione {
  tipo: 'gettone' | 'riga';
  pointerId: number;
  /** L'elemento che resta al suo posto, velato (gettone o riga). */
  origine: HTMLElement;
  /** L'elemento che ha la cattura del puntatore (gettone o maniglia). */
  cattura: HTMLElement;
  cosa: Cosa | null;
  riga: { giorno: IdGiorno; indice: number } | null;
  clone: HTMLElement;
  /** Punto del clone sotto il puntatore (px dal suo angolo in alto a sinistra). */
  presa: { x: number; y: number };
  x: number;
  y: number;
  scrittoX: number;
  scrittoY: number;
  sopra: VoceBersaglio | null;
  daRileggere: boolean;
  bordoAlto: number;
  bordoBasso: number;
  velocitaBordo: number;
  ridotto: boolean;
  stacca: Array<() => void>;
}

let sessione: Sessione | null = null;

/** C'è un trascinamento in corso? (gestiStriscia lo usa per non scambiarlo per uno swipe) */
export function trascinamentoInCorso(): boolean {
  return sessione !== null;
}

function trasformaClone(x: number, y: number, sollevato: number, ridotto: boolean): string {
  if (ridotto) return `translate3d(${x}px, ${y}px, 0)`;
  const r = SOLLEVATO.ruota * sollevato;
  const sc = 1 + (SOLLEVATO.scala - 1) * sollevato;
  return `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(${sc})`;
}

function creaClone(el: HTMLElement, r: DOMRect): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;
  const pulisci = (n: Element): void => {
    for (const a of ['id', 'tabindex', 'aria-pressed', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'data-mad-origine']) {
      n.removeAttribute(a);
    }
  };
  pulisci(clone);
  clone.querySelectorAll('[id], [tabindex], [aria-describedby], [aria-labelledby]').forEach(pulisci);
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('inert', '');
  clone.setAttribute('data-mad-ix', 'clone');
  const fondo = el.closest('[data-mad-fondo]')?.getAttribute('data-mad-fondo');
  if (fondo !== undefined && fondo !== null) clone.setAttribute('data-mad-fondo', fondo);
  clone.style.width = `${r.width}px`;
  clone.style.height = `${r.height}px`;
  const radice = el.closest('.mad-root') ?? document.body;
  radice.appendChild(clone);
  return clone;
}

function leggiPadding(valore: string): number {
  const n = Number.parseFloat(valore);
  return Number.isFinite(n) ? n : 0;
}

/** Scorrimento ai bordi: fascia di 48 px oltre i fissi (scroll-padding di html). */
function velocitaAiBordi(s: Sessione): number {
  const alto = s.bordoAlto + ZONA_BORDO_PX;
  const basso = window.innerHeight - s.bordoBasso - ZONA_BORDO_PX;
  if (s.y < alto) return -VELOCITA_BORDO * Math.min(1, (alto - s.y) / ZONA_BORDO_PX);
  if (s.y > basso) return VELOCITA_BORDO * Math.min(1, (s.y - basso) / ZONA_BORDO_PX);
  return 0;
}

function bersaglioSotto(x: number, y: number): VoceBersaglio | null {
  let n: Element | null = document.elementFromPoint(x, y);
  while (n !== null) {
    const voce = bersagli.get(n);
    if (voce !== undefined) return voce;
    n = n.parentElement;
  }
  return null;
}

function cambiaSopra(s: Sessione, voce: VoceBersaglio | null): void {
  if (voce === s.sopra) return;
  s.sopra?.impostaSopra(false);
  s.sopra = voce;
  voce?.impostaSopra(true);
}

/* fasi del ticker */

function leggiSessione(): void {
  const s = sessione;
  if (s === null || !s.daRileggere) return;
  s.daRileggere = false;
  cambiaSopra(s, bersaglioSotto(s.x, s.y));
  s.velocitaBordo = velocitaAiBordi(s);
}

function aggiornaSessione(dt: number): boolean {
  const s = sessione;
  if (s === null) return false;
  if (s.velocitaBordo === 0) return false;
  window.scrollBy({ top: s.velocitaBordo * dt, behavior: 'instant' });
  s.daRileggere = true;
  return true;
}

function scriviSessione(): void {
  const s = sessione;
  if (s === null) return;
  const x = Math.round(s.x - s.presa.x);
  const y = Math.round(s.y - s.presa.y);
  if (x === s.scrittoX && y === s.scrittoY) return;
  s.scrittoX = x;
  s.scrittoY = y;
  s.clone.style.transform = trasformaClone(x, y, 1, s.ridotto);
}

/* voli del clone dopo il rilascio (nel ticker, fase write) */

/** Durata di un volo per la distanza, coi parametri del motion-designer (VOLI). */
function durataVolo(p: ParametriVolo, distanza: number): number {
  return Math.max(p.min, Math.min(p.max, p.base + p.perPx * distanza));
}

/**
 * Il clone, lasciato andare, vola da `da` ad `a` (angolo in alto a sinistra,
 * px della finestra) e poi sparisce:
 * - `torna` (rifiutato o annullato): dritto al posto del gettone, curva
 *   `torna`, circa 320 ms, si rimette dritto;
 * - `posa` (messo): un piccolo arco fino al giorno, curva `posa`, e si
 *   scioglie nel giorno dal 62% del tragitto.
 * Con reduced motion niente volo: il clone sparisce e il gettone riappare.
 */
function volaVia(clone: HTMLElement, da: { x: number; y: number }, a: { x: number; y: number }, tipo: 'torna' | 'posa', ridotto: boolean, fine: () => void): void {
  if (ridotto || !Number.isFinite(da.x) || !Number.isFinite(da.y)) {
    clone.remove();
    fine();
    return;
  }
  const parametri = VOLI[tipo];
  const curva: Easing = tipo === 'torna' ? curvaTorna : curvaPosa;
  const distanza = Math.hypot(a.x - da.x, a.y - da.y);
  const durata = durataVolo(parametri, distanza);
  const arco = Math.min(parametri.arcoMax, parametri.arcoPerPx * distanza);
  let t = 0;
  let togli: (() => void) | null = null;
  const passo = (dt: number): boolean => {
    t = Math.min(1, t + (dt * 1000) / durata);
    const k = curva(t);
    const x = da.x + (a.x - da.x) * k;
    const y = da.y + (a.y - da.y) * k - arco * Math.sin(Math.PI * k);
    clone.style.transform = trasformaClone(x, y, 1 - k, false);
    if (parametri.dissolvenzaDa < 1 && k > parametri.dissolvenzaDa) {
      clone.style.opacity = String(Math.max(0, 1 - (k - parametri.dissolvenzaDa) / (1 - parametri.dissolvenzaDa)));
    }
    if (t >= 1) {
      clone.remove();
      fine();
      togli?.();
      return false;
    }
    return true;
  };
  togli = ticker.add(passo, 'write');
}

function iniziaSessione(opz: {
  tipo: Sessione['tipo'];
  pointerId: number;
  origine: HTMLElement;
  cattura: HTMLElement;
  cosa: Cosa | null;
  riga: Sessione['riga'];
  x: number;
  y: number;
  x0: number;
  y0: number;
}): void {
  if (sessione !== null) return;
  const r = opz.origine.getBoundingClientRect();
  const stile = getComputedStyle(document.documentElement);
  const ridotto = store.get().reducedMotion;
  const clone = creaClone(opz.origine, r);
  const s: Sessione = {
    tipo: opz.tipo,
    pointerId: opz.pointerId,
    origine: opz.origine,
    cattura: opz.cattura,
    cosa: opz.cosa,
    riga: opz.riga,
    clone,
    presa: { x: opz.x0 - r.left, y: opz.y0 - r.top },
    x: opz.x,
    y: opz.y,
    scrittoX: Number.NaN,
    scrittoY: Number.NaN,
    sopra: null,
    daRileggere: true,
    bordoAlto: leggiPadding(stile.scrollPaddingTop),
    bordoBasso: leggiPadding(stile.scrollPaddingBottom),
    velocitaBordo: 0,
    ridotto,
    stacca: [],
  };
  sessione = s;
  // Prima posizione scritta subito: il clone non compare mai nell'angolo.
  scriviSessione();
  opz.origine.setAttribute('data-mad-origine', '');
  try {
    opz.cattura.setPointerCapture(opz.pointerId);
  } catch {
    /* il puntatore non c'è più: si chiuderà col primo evento */
  }
  s.stacca.push(ticker.add(leggiSessione, 'read'), ticker.add(aggiornaSessione, 'update'), ticker.add(scriviSessione, 'write'));
  const tasto = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      concludiSessione(false);
    }
  };
  const perde = (): void => concludiSessione(false);
  const nascosta = (): void => {
    if (document.visibilityState === 'hidden') concludiSessione(false);
  };
  window.addEventListener('keydown', tasto, true);
  window.addEventListener('blur', perde);
  document.addEventListener('visibilitychange', nascosta);
  s.stacca.push(
    () => window.removeEventListener('keydown', tasto, true),
    () => window.removeEventListener('blur', perde),
    () => document.removeEventListener('visibilitychange', nascosta),
  );
  if (opz.cosa !== null) impostaTrascinata(opz.cosa);
  ticker.wake();
}

function muoviSessione(x: number, y: number): void {
  const s = sessione;
  if (s === null) return;
  s.x = x;
  s.y = y;
  s.daRileggere = true;
  ticker.wake();
}

/**
 * Chiude il trascinamento. `rilascio` = il puntatore si è alzato (si prova a
 * posare); altrimenti è un annullamento (Esc, scroll del browser, perdita
 * del fuoco) e la cosa torna al suo posto.
 */
function concludiSessione(rilascio: boolean, senzaVolo = false): void {
  const s = sessione;
  if (s === null) return;
  sessione = null;
  for (const f of s.stacca) f();
  try {
    if (s.cattura.hasPointerCapture(s.pointerId)) s.cattura.releasePointerCapture(s.pointerId);
  } catch {
    /* già rilasciato */
  }

  let posato = false;
  let arrivo: DOMRect | null = null;
  if (rilascio) {
    const sotto = bersaglioSotto(s.x, s.y);
    if (s.tipo === 'gettone' && s.cosa !== null && sotto !== null) {
      posato = deponi(s.cosa, sotto.bersaglio).ok;
      if (posato) arrivo = sotto.el.getBoundingClientRect();
    } else if (s.tipo === 'riga' && s.riga !== null && sotto === null) {
      // Fuori da ogni scomparto: la riga si toglie. Su un altro giorno no:
      // per spostare un pane si toglie e si rimette.
      togli(s.riga.giorno, s.riga.indice);
      posato = true;
    }
  }
  cambiaSopra(s, null);
  impostaTrascinata(null);

  const da = { x: s.scrittoX, y: s.scrittoY };
  const sblocca = (): void => s.origine.removeAttribute('data-mad-origine');
  if (senzaVolo || !s.origine.isConnected) {
    s.clone.remove();
    sblocca();
    return;
  }
  if (posato) {
    // Messo: il clone si posa al centro del giorno (o, per una riga tolta, dove è) e si scioglie.
    const w = s.clone.offsetWidth;
    const h = s.clone.offsetHeight;
    const a = arrivo === null ? da : { x: Math.round(arrivo.left + arrivo.width / 2 - w / 2), y: Math.round(arrivo.top + arrivo.height / 2 - h / 2) };
    volaVia(s.clone, da, a, 'posa', s.ridotto, sblocca);
    ticker.wake();
    return;
  }
  const r = s.origine.getBoundingClientRect();
  volaVia(s.clone, da, { x: Math.round(r.left), y: Math.round(r.top) }, 'torna', s.ridotto, sblocca);
  ticker.wake();
}

/* --------------------------------------------- gesto sul gettone o maniglia */

interface Partenza {
  pointerId: number;
  tipo: string;
  x0: number;
  y0: number;
  timer: ReturnType<typeof setTimeout> | null;
  /** Col dito: la pressione ferma è durata abbastanza, si può trascinare. */
  pronto: boolean;
}

interface OpzioniGesto {
  /** Il dito deve tenere fermo prima di trascinare (gettoni: sì; maniglia: no). */
  attesaTouch: boolean;
  bloccato: () => boolean;
  avvia: (p: Partenza, x: number, y: number) => void;
  /** Ultimo trascinamento finito su questo elemento (per assorbire il clic). */
  segnaFine: () => void;
}

/** Collega pointer e touch di un elemento al trascinamento. Restituisce lo stacco. */
function collegaGesto(el: HTMLElement, opz: OpzioniGesto): () => void {
  let p: Partenza | null = null;

  function chiudiPartenza(): void {
    if (p?.timer != null) clearTimeout(p.timer);
    p = null;
    el.removeEventListener('pointermove', muove);
    el.removeEventListener('pointerup', su);
    el.removeEventListener('pointercancel', annulla);
    el.removeEventListener('lostpointercapture', persa);
  }

  function giu(e: PointerEvent): void {
    if (!e.isPrimary || sessione !== null || p !== null) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (opz.bloccato()) return;
    p = { pointerId: e.pointerId, tipo: e.pointerType, x0: e.clientX, y0: e.clientY, timer: null, pronto: !opz.attesaTouch || e.pointerType !== 'touch' };
    if (e.pointerType === 'touch' && opz.attesaTouch) {
      const questa = p;
      questa.timer = setTimeout(() => {
        questa.timer = null;
        questa.pronto = true;
      }, ATTESA_TRASCINA_TOUCH_MS);
    }
    el.addEventListener('pointermove', muove);
    el.addEventListener('pointerup', su);
    el.addEventListener('pointercancel', annulla);
    el.addEventListener('lostpointercapture', persa);
    if (e.pointerType !== 'touch') {
      // Mouse e penna: si seguono anche fuori dal gettone, prima della soglia.
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* puntatore già sparito */
      }
    }
  }

  function muove(e: PointerEvent): void {
    if (sessione !== null && sessione.pointerId === e.pointerId && sessione.cattura === el) {
      e.stopPropagation();
      muoviSessione(e.clientX, e.clientY);
      return;
    }
    const q = p;
    if (q === null || e.pointerId !== q.pointerId) return;
    const distanza = Math.hypot(e.clientX - q.x0, e.clientY - q.y0);
    if (distanza < SOGLIA_TRASCINA_PX) return;
    if (!q.pronto) {
      // Il dito si è mosso prima dei 250 ms: è uno scroll (o la fila che scorre).
      chiudiPartenza();
      return;
    }
    e.stopPropagation();
    chiudiPartenzaSenzaAscolto();
    opz.avvia(q, e.clientX, e.clientY);
  }

  /** Il gesto diventa trascinamento: i listener restano per la sessione. */
  function chiudiPartenzaSenzaAscolto(): void {
    if (p?.timer != null) clearTimeout(p.timer);
    p = null;
  }

  function su(e: PointerEvent): void {
    if (sessione !== null && sessione.pointerId === e.pointerId && sessione.cattura === el) {
      e.stopPropagation();
      opz.segnaFine();
      chiudiPartenza();
      concludiSessione(true);
      return;
    }
    if (p !== null && e.pointerId === p.pointerId) chiudiPartenza();
  }

  function annulla(e: PointerEvent): void {
    if (sessione !== null && sessione.pointerId === e.pointerId && sessione.cattura === el) {
      opz.segnaFine();
      chiudiPartenza();
      concludiSessione(false);
      return;
    }
    if (p !== null && e.pointerId === p.pointerId) chiudiPartenza();
  }

  /**
   * Cattura persa. Conta solo quella di questo elemento: quando la cattura
   * passa da un figlio (l'immagine toccata dal dito) a qui, il figlio riceve
   * un lostpointercapture che risale fin qui e non deve chiudere niente.
   */
  function persa(e: PointerEvent): void {
    if (e.target !== el) return;
    annulla(e);
  }

  /** Col dito, dopo la pressione ferma, la pagina non deve scorrere: si blocca qui. */
  function touchmove(e: TouchEvent): void {
    const inCorso = sessione !== null && sessione.cattura === el;
    if ((inCorso || (p !== null && p.pronto && p.tipo === 'touch')) && e.cancelable) e.preventDefault();
  }

  function menu(e: Event): void {
    // Niente menu del sistema durante la pressione lunga o il trascinamento.
    if (p !== null || (sessione !== null && sessione.cattura === el)) e.preventDefault();
  }

  function trascinaNativo(e: DragEvent): void {
    // Niente drag and drop HTML5 delle immagini: il gettone si trascina da qui.
    e.preventDefault();
  }

  el.addEventListener('pointerdown', giu);
  el.addEventListener('touchmove', touchmove, { passive: false });
  el.addEventListener('contextmenu', menu);
  el.addEventListener('dragstart', trascinaNativo);

  return () => {
    el.removeEventListener('pointerdown', giu);
    el.removeEventListener('touchmove', touchmove);
    el.removeEventListener('contextmenu', menu);
    el.removeEventListener('dragstart', trascinaNativo);
    chiudiPartenza();
    if (sessione !== null && (sessione.cattura === el || sessione.origine === el)) concludiSessione(false, true);
  };
}

/* ------------------------------------------------------------- usePresa */

/**
 * Il gettone (un pane, una pasta o il vassoio) da prendere in mano.
 * La sezione rende un `<button>` con `{...props}` e la classe `mad-gettone`
 * (o quella che vuole): `aria-pressed` vale "in mano".
 */
export function usePresa(ref: RefObject<HTMLElement>, cosa: Cosa): { props: PropsPresa; inMano: boolean } {
  const chiave = chiaveCosa(cosa);
  const cosaCorrente = useRef<Cosa>(cosa);
  cosaCorrente.current = cosa;

  const inMano = useMadre((s) => s.inMano !== null && chiaveCosa(s.inMano) === chiave);
  const bloccato = useMadre(settimanaBloccata);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    prese.add(el);
    let assorbiFino = 0;

    const staccaGesto = collegaGesto(el, {
      attesaTouch: true,
      bloccato: () => settimanaBloccata(store.get()),
      avvia: (q, x, y) => {
        iniziaSessione({ tipo: 'gettone', pointerId: q.pointerId, origine: el, cattura: el, cosa: cosaCorrente.current, riga: null, x, y, x0: q.x0, y0: q.y0 });
      },
      segnaFine: () => {
        assorbiFino = performance.now() + CLIC_DOPO_TRASCINA_MS;
      },
    });

    function clic(e: MouseEvent): void {
      if (performance.now() < assorbiFino) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (settimanaBloccata(store.get())) return;
      const c = cosaCorrente.current;
      if (ugualeInMano(store.get().inMano, c)) posa();
      else prendiInMano(c);
    }

    el.addEventListener('click', clic);
    return () => {
      el.removeEventListener('click', clic);
      staccaGesto();
      prese.delete(el);
    };
  }, [ref]);

  // Esc posa il gettone in mano (solo quello in mano ascolta).
  useEffect(() => {
    if (!inMano) return undefined;
    function tasto(e: KeyboardEvent): void {
      if (e.key !== 'Escape' || e.defaultPrevented || sessione !== null) return;
      if (!ugualeInMano(store.get().inMano, cosaCorrente.current)) return;
      e.preventDefault();
      posa();
    }
    document.addEventListener('keydown', tasto);
    return () => {
      document.removeEventListener('keydown', tasto);
    };
  }, [inMano]);

  const props: PropsPresa = {
    type: 'button',
    'aria-pressed': inMano,
    'aria-disabled': bloccato ? true : undefined,
    'data-mad-ix': 'gettone',
    'data-mad-in-mano': inMano ? '' : undefined,
  };
  return { props, inMano };
}

/* ---------------------------------------------------------- useBersaglio */

export interface OpzioniBersaglio {
  /**
   * false per uno scomparto che non è un bottone (il lunedì chiuso): riceve
   * i trascinamenti e i tocchi, ma non entra nel Tab e non ha aria-pressed.
   */
  bottone?: boolean;
  /**
   * L'area più grande dove si può lasciare cadere (lo scomparto intero, `li`),
   * se il bottone "metti qui" è solo una parte dello scomparto. Le righe dei
   * pani messi stanno dentro la zona. Riceve `propsZona`.
   */
  zona?: RefObject<HTMLElement>;
}

export interface EsitoBersaglio {
  /** Sul `<button>` del giorno (o sullo scomparto del lunedì). */
  props: PropsBersaglio;
  /** Sullo scomparto intero, se si usa `opz.zona`. */
  propsZona: PropsManiglia;
  /** null = niente in mano; true = "si fa" (carta da zucchero); false = non si fa. */
  valido: boolean | null;
  /** Il trascinamento è qui sopra. */
  sopra: boolean;
}

/**
 * Un giorno della settimana (o il vassoio) dove posare quello che si ha in
 * mano. `valido` cambia al massimo una volta ogni 500 ms (antiLampeggio).
 */
export function useBersaglio(ref: RefObject<HTMLElement>, bersaglio: Bersaglio, opz: OpzioniBersaglio = {}): EsitoBersaglio {
  const chiave = chiaveBersaglio(bersaglio);
  const bottone = opz.bottone ?? true;
  const zona = opz.zona;
  const [sopra, setSopra] = useState(false);

  const inMano = useMadre((s) => s.inMano, ugualeInMano);
  const trascinata = useCosaTrascinata();
  const attiva = trascinata ?? inMano;
  const validoOra = attiva === null ? null : eValido(attiva, bersaglioDaChiave(chiave));
  const valido = useValoreLento<boolean | null>(validoOra);
  const premuto = useMadre((s) => giaLi(s, bersaglioDaChiave(chiave)));
  const bloccato = useMadre(settimanaBloccata);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    const voce: VoceBersaglio = { el, bersaglio: bersaglioDaChiave(chiave), impostaSopra: setSopra };
    const zonaEl = zona?.current ?? null;
    bersagli.set(el, voce);
    if (zonaEl !== null) bersagli.set(zonaEl, voce);

    function clic(e: MouseEvent): void {
      if (settimanaBloccata(store.get())) return;
      const c = store.get().inMano;
      if (c === null) {
        // Niente in mano: si va a prendere un pane (il fuoco va alla fila).
        e.preventDefault();
        annuncia(ANNUNCI.prendiPrima);
        primaPresa()?.focus();
        return;
      }
      deponi(c, voce.bersaglio);
    }

    el.addEventListener('click', clic);
    return () => {
      el.removeEventListener('click', clic);
      if (bersagli.get(el) === voce) bersagli.delete(el);
      if (zonaEl !== null && bersagli.get(zonaEl) === voce) bersagli.delete(zonaEl);
      if (sessione?.sopra === voce) sessione.sopra = null;
    };
  }, [ref, zona, chiave]);

  const stato = {
    'data-mad-valido': valido === null ? undefined : valido ? ('true' as const) : ('false' as const),
    'data-mad-sopra': sopra ? ('' as const) : undefined,
  };
  const props: PropsBersaglio = { 'data-mad-ix': 'bersaglio', ...stato };
  if (bottone) {
    props.type = 'button';
    props['aria-pressed'] = premuto ?? undefined;
    props['aria-disabled'] = bloccato ? true : undefined;
  }
  const propsZona: PropsManiglia = { 'data-mad-ix': 'zona', ...stato };
  return { props, propsZona, valido, sopra };
}

/* -------------------------------------------------- useRigaTrascinabile */

/**
 * Una riga già messa in un giorno, da togliere trascinandola fuori dal suo
 * scomparto per la maniglia (che è `aria-hidden`: da tastiera c'è il meno).
 * La maniglia ha `touch-action: none` (interaction.css): col dito parte
 * subito dopo 8 px, senza attesa.
 */
export function useRigaTrascinabile(
  riga: RefObject<HTMLElement>,
  maniglia: RefObject<HTMLElement>,
  dove: { giorno: IdGiorno; indice: number },
): { props: PropsManiglia } {
  const posizione = useRef(dove);
  posizione.current = dove;

  useEffect(() => {
    const el = maniglia.current;
    if (el === null) return undefined;
    return collegaGesto(el, {
      attesaTouch: false,
      bloccato: () => settimanaBloccata(store.get()),
      avvia: (q, x, y) => {
        const origine = riga.current;
        if (origine === null) return;
        iniziaSessione({
          tipo: 'riga',
          pointerId: q.pointerId,
          origine,
          cattura: el,
          cosa: null,
          riga: { giorno: posizione.current.giorno, indice: posizione.current.indice },
          x,
          y,
          x0: q.x0,
          y0: q.y0,
        });
      },
      segnaFine: () => undefined,
    });
  }, [riga, maniglia]);

  return { props: { 'data-mad-ix': 'maniglia', 'aria-hidden': true } };
}
