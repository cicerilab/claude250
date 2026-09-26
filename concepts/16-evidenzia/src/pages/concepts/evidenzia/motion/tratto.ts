/**
 * EVIDENZIA · movimenti del tratto dell'evidenziatore (WAAPI).
 *
 * Contratto (tech-architect §2.2, §7.3; docs/motion-designer.md §4):
 * - `el` è il nodo foglia del tratto marcato `data-evdvar`, quello il cui
 *   `clip-path` legge `--evd-avanzamento` (0 = niente, 1 = riga intera; con
 *   due righe la ripartizione tra le righe la decide il CSS di Tratto).
 * - Si anima la proprietà registrata `--evd-avanzamento` (`<number>`,
 *   ereditata, iniziale 0): WAAPI la interpola come un numero, quindi ogni
 *   `calc()` che la usa segue, qualunque sia il numero di righe.
 * - A fine animazione il valore finale si scrive inline sullo stesso nodo
 *   (solo se cambia), si aggiorna `runtime.tratti` se è dato `id`, e
 *   l'animazione si annulla: resta lo stato finale, nessun effetto appeso.
 * - Reduced motion (o browser senza `CSS.registerProperty`): stato finale
 *   immediato e ritorno `null`. Unica eccezione dichiarata: `scarico` in
 *   reduced motion mostra il tratto pallido fermo a metà per 600 ms e poi lo
 *   toglie senza movimento (ux-architect 6.4): è un cambio di stato, non
 *   un'animazione, e restituisce l'Animation discreta che lo regge.
 * - Una nuova chiamata sullo stesso nodo ferma quella in corso partendo dal
 *   valore visibile in quel momento: nessuno scatto.
 *
 * Nessun requestAnimationFrame, nessun accesso al browser a livello di modulo.
 */

import { runtime } from '../state/runtime';
import { store } from '../state/store';
import {
  PENDENZA_SLANCIO_DEFAULT,
  clamp01,
  easingCss,
  pendenzaSlancio,
  slancioCss,
} from './easing';
import { SCARICO, TRATTO, durataPerDistanza } from './durate';

export const VAR_AVANZAMENTO = '--evd-avanzamento';

export interface OpzioniTratto {
  /** Forza (o esclude) il reduced motion; default: `store.get().reducedMotion`. */
  ridotto?: boolean;
  /** Id dell'annuncio: a fine animazione `runtime.tratti` resta coerente. */
  id?: string;
  /** Chiamata a fine movimento (anche in reduced motion), non se annullato. */
  onFine?: () => void;
}

export interface OpzioniCompleta extends OpzioniTratto {
  /**
   * Velocità della mano al rilascio, in frazioni di riga al secondo (positiva
   * verso destra). Il tratto prosegue con quello slancio e si ferma a fine riga.
   */
  velocita?: number;
}

export interface OpzioniRitira extends OpzioniTratto {
  /**
   * Dove torna la punta: il punto in cui si era posata (`segni.inizio(id)`,
   * il tratto parte dal punto premuto, CD 4.4). Default 0. A fine ritiro il
   * tratto è vuoto e l'avanzamento si scrive 0.
   */
  verso?: number;
}

export interface OpzioniDimostrativo extends OpzioniTratto {
  /** Attesa prima del tratto, in ms. Default `TRATTO.dimostrativoAttesa`. */
  ritardo?: number;
}

export interface OpzioniScarico extends OpzioniTratto {
  /** Seme dell'annuncio (core/semi.ts): sposta di poco il punto in cui l'inchiostro finisce. */
  seme?: number;
  /** Punto in cui la punta si è posata (0..1). Il tratto scarico parte da lì. Default 0. */
  inizio?: number;
}

/* ------------------------------------------------------------------ */
/* Proprietà registrata                                                */
/* ------------------------------------------------------------------ */

let statoRegistrazione: boolean | null = null;

/**
 * Registra `--evd-avanzamento` come `<number>` (una volta sola). true se la
 * proprietà è animabile come numero. Nessun altro file dichiara `@property`
 * per questa variabile (docs/motion-designer.md, richieste).
 */
export function registraAvanzamento(): boolean {
  if (statoRegistrazione !== null) return statoRegistrazione;
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') {
    statoRegistrazione = false;
    return false;
  }
  try {
    CSS.registerProperty({ name: VAR_AVANZAMENTO, syntax: '<number>', inherits: true, initialValue: '0' });
    statoRegistrazione = true;
  } catch (e) {
    // InvalidModificationError: già registrata (per esempio dopo un HMR). Va bene.
    statoRegistrazione = e instanceof DOMException && e.name === 'InvalidModificationError';
  }
  return statoRegistrazione;
}

/* ------------------------------------------------------------------ */
/* Stato per nodo                                                      */
/* ------------------------------------------------------------------ */

const inCorso = new WeakMap<Element, Animation>();

function ridottoDa(opz: OpzioniTratto | undefined): boolean {
  if (opz?.ridotto !== undefined) return opz.ridotto;
  return store.get().reducedMotion;
}

function formatta(v: number): string {
  return String(Math.round(clamp01(v) * 10000) / 10000);
}

function controllaFoglia(el: HTMLElement | SVGElement): void {
  if (import.meta.env.DEV && !el.hasAttribute('data-evdvar')) {
    console.warn('[evidenzia/motion] il tratto va animato sul nodo foglia data-evdvar', el);
  }
}

/** Scrive l'avanzamento inline, solo se cambia. */
function scrivi(el: HTMLElement | SVGElement, v: number): void {
  const s = formatta(v);
  if (el.style.getPropertyValue(VAR_AVANZAMENTO).trim() !== s) {
    el.style.setProperty(VAR_AVANZAMENTO, s);
  }
}

function aggiornaRuntime(id: string | undefined, v: number): void {
  if (!id) return;
  const t = runtime.tratti.get(id);
  if (!t) return;
  t.avanzamento = v;
  t.bersaglio = v;
  t.gesto = false;
}

/** Valore visibile adesso (animazione compresa). */
export function avanzamentoCorrente(el: HTMLElement | SVGElement): number {
  const s = getComputedStyle(el).getPropertyValue(VAR_AVANZAMENTO).trim();
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? clamp01(n) : 0;
}

/**
 * Ferma il movimento in corso sul nodo lasciando il valore visibile adesso
 * (scritto inline) e lo restituisce. Da chiamare quando un gesto nuovo
 * prende un tratto che si sta ancora muovendo.
 */
export function ferma(el: HTMLElement | SVGElement): number {
  const a = inCorso.get(el);
  if (!a) return avanzamentoCorrente(el);
  const v = avanzamentoCorrente(el);
  scrivi(el, v);
  // Anche l'opacità di `scolora` torna quella del CSS.
  inCorso.delete(el);
  a.cancel();
  return v;
}

/** true se il nodo ha un movimento del tratto in corso. */
export function inMovimento(el: Element): boolean {
  return inCorso.has(el);
}

/* ------------------------------------------------------------------ */
/* Motore comune                                                       */
/* ------------------------------------------------------------------ */

interface Corsa {
  el: HTMLElement | SVGElement;
  keyframes: Keyframe[];
  durata: number;
  easing: string;
  ritardo?: number;
  finale: number;
  opz: OpzioniTratto | undefined;
}

function avvia(c: Corsa): Animation {
  const vecchia = inCorso.get(c.el);
  if (vecchia) {
    inCorso.delete(c.el);
    vecchia.cancel();
  }
  const anim = c.el.animate(c.keyframes, {
    duration: Math.max(1, c.durata),
    delay: c.ritardo ?? 0,
    easing: c.easing,
    fill: 'both',
  });
  inCorso.set(c.el, anim);
  anim.finished.then(
    () => {
      if (inCorso.get(c.el) !== anim) return;
      scrivi(c.el, c.finale);
      aggiornaRuntime(c.opz?.id, c.finale);
      inCorso.delete(c.el);
      anim.cancel();
      c.opz?.onFine?.();
    },
    () => {
      /* annullata: chi l'ha annullata ha già messo il suo valore */
    },
  );
  return anim;
}

/** Stato finale immediato (reduced motion o proprietà non animabile). */
function subito(el: HTMLElement | SVGElement, v: number, opz: OpzioniTratto | undefined): null {
  const vecchia = inCorso.get(el);
  if (vecchia) {
    inCorso.delete(el);
    vecchia.cancel();
  }
  scrivi(el, v);
  aggiornaRuntime(opz?.id, v);
  opz?.onFine?.();
  return null;
}

function kf(v: number, extra?: Keyframe): Keyframe {
  return { [VAR_AVANZAMENTO]: formatta(v), ...extra };
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Rilascio oltre la soglia: il tratto prosegue dal punto `da` fino a fine
 * riga in 160 ms (meno se manca poco), con lo slancio della mano.
 */
export function completa(el: HTMLElement | SVGElement, da: number, opz?: OpzioniCompleta): Animation | null {
  controllaFoglia(el);
  if (ridottoDa(opz) || !registraAvanzamento()) return subito(el, 1, opz);
  const inizio = clamp01(da);
  const distanza = 1 - inizio;
  if (distanza <= 0.001) return subito(el, 1, opz);
  const durata = durataPerDistanza(TRATTO.completa, TRATTO.completaMin, distanza, TRATTO.completaDistanzaRif);
  const pendenza =
    opz?.velocita === undefined ? PENDENZA_SLANCIO_DEFAULT : pendenzaSlancio(opz.velocita, distanza, durata);
  return avvia({
    el,
    keyframes: [kf(inizio), kf(1)],
    durata,
    easing: slancioCss(pendenza),
    finale: 1,
    opz,
  });
}

/** Rilascio sotto la soglia (o annullamento): il tratto torna all'inizio della riga. */
export function ritira(el: HTMLElement | SVGElement, da: number, opz?: OpzioniRitira): Animation | null {
  controllaFoglia(el);
  if (ridottoDa(opz) || !registraAvanzamento()) return subito(el, 0, opz);
  const inizio = clamp01(da);
  const verso = Math.min(inizio, clamp01(opz?.verso ?? 0));
  const distanza = inizio - verso;
  if (distanza <= 0.001) return subito(el, 0, opz);
  const durata = durataPerDistanza(TRATTO.ritira, TRATTO.ritiraMin, distanza, 0.55);
  return avvia({
    el,
    keyframes: [kf(inizio), kf(verso)],
    durata,
    easing: easingCss('rientro'),
    finale: 0,
    opz,
  });
}

/**
 * L'annuncio esce dal giro: il rosa si scolora in 250 ms dove si trova (non
 * si ritira), poi l'avanzamento torna a 0 e l'opacità torna quella del CSS.
 */
export function scolora(el: HTMLElement | SVGElement, opz?: OpzioniTratto): Animation | null {
  controllaFoglia(el);
  if (ridottoDa(opz)) return subito(el, 0, opz);
  const corrente = inCorso.has(el) ? ferma(el) : avanzamentoCorrente(el);
  if (corrente <= 0.001) return subito(el, 0, opz);
  const opacita = Number.parseFloat(getComputedStyle(el).opacity);
  const da = Number.isFinite(opacita) ? opacita : 1;
  return avvia({
    el,
    keyframes: [kf(corrente, { opacity: String(da) }), kf(corrente, { opacity: '0' })],
    durata: TRATTO.scolora,
    easing: easingCss('asciuga'),
    finale: 0,
    opz,
  });
}

/**
 * Bottone Evidenzia (e posti del giro, toggle della scheda): il tratto si
 * disegna da solo da sinistra a destra in 350 ms con la curva della mano.
 * Se un tratto era già in parte visibile, riparte da lì con la durata residua.
 */
export function disegnaDaBottone(el: HTMLElement | SVGElement, opz?: OpzioniTratto): Animation | null {
  controllaFoglia(el);
  if (ridottoDa(opz) || !registraAvanzamento()) return subito(el, 1, opz);
  const da = inCorso.has(el) ? ferma(el) : avanzamentoCorrente(el);
  if (da >= 0.999) return subito(el, 1, opz);
  const durata = Math.round(TRATTO.disegnaDaBottone * Math.max(0.35, 1 - da));
  return avvia({
    el,
    keyframes: [kf(da), kf(1)],
    durata,
    easing: da > 0.001 ? slancioCss(PENDENZA_SLANCIO_DEFAULT) : easingCss('mano'),
    finale: 1,
    opz,
  });
}

/**
 * Il tratto dimostrativo sulla parola "Segna" del riquadro di testa: una
 * volta sola, 600 ms con la curva della mano, dopo `ritardo` ms. Chi lo
 * chiama aspetta prima i font (al massimo `TRATTO.attesaFontMax`), perché il
 * tratto deve cadere sulla parola già composta.
 */
export function dimostrativo(el: HTMLElement | SVGElement, opz?: OpzioniDimostrativo): Animation | null {
  controllaFoglia(el);
  if (ridottoDa(opz) || !registraAvanzamento()) return subito(el, 1, opz);
  return avvia({
    el,
    keyframes: [kf(0), kf(1)],
    durata: TRATTO.dimostrativo,
    ritardo: Math.max(0, opz?.ritardo ?? TRATTO.dimostrativoAttesa),
    easing: easingCss('mano'),
    finale: 1,
    opz,
  });
}

/** Punto in cui l'inchiostro finisce per un dato seme (deterministico). */
export function fermaScarico(seme: number | undefined): number {
  if (seme === undefined) return SCARICO.fermaA;
  const u = ((Math.abs(Math.floor(seme)) * 2654435761) >>> 0) / 4294967296;
  return SCARICO.fermaA + (u * 2 - 1) * SCARICO.fermaVariazione;
}

/**
 * Il quinto annuncio: il tratto (forma "scarico" del vector-artist) esce
 * pallido, rallenta e muore a metà riga, resta fermo un attimo e si ritira.
 * Totale 680 ms. In reduced motion: fermo a metà per 600 ms, poi via.
 */
export function scarico(el: HTMLElement | SVGElement, opz?: OpzioniScarico): Animation | null {
  controllaFoglia(el);
  const partenza = clamp01(opz?.inizio ?? 0);
  const meta = partenza + (1 - partenza) * fermaScarico(opz?.seme);
  const vecchia = inCorso.get(el);
  if (vecchia) {
    inCorso.delete(el);
    vecchia.cancel();
  }
  if (ridottoDa(opz) || !registraAvanzamento()) {
    // Cambio di stato discreto: nessuna interpolazione, anche senza proprietà registrata.
    return avvia({
      el,
      keyframes: [kf(meta), kf(meta)],
      durata: SCARICO.sostaRidotta,
      easing: 'linear',
      finale: 0,
      opz,
    });
  }
  const totale = SCARICO.esce + SCARICO.sosta + SCARICO.rientra;
  const o1 = SCARICO.esce / totale;
  const o2 = (SCARICO.esce + SCARICO.sosta) / totale;
  return avvia({
    el,
    keyframes: [
      kf(partenza, { offset: 0, easing: easingCss('esaurisce') }),
      kf(meta, { offset: o1, easing: 'linear' }),
      kf(meta, { offset: o2, easing: easingCss('rientro') }),
      kf(partenza, { offset: 1 }),
    ],
    durata: totale,
    easing: 'linear',
    finale: 0,
    opz,
  });
}
