/**
 * SOTTOSCOCCA · registro delle sezioni-stazione (tech-architect §6.3,
 * motion-designer §4.1 e §11 punto 4).
 *
 * Ogni sezione si dichiara con `useStazione(ref, id)` (ponte/useStazione.ts).
 * Le misure sono in px DOCUMENTO e si rifanno SOLO quando qualcosa le
 * invalida: ResizeObserver delle sezioni e del contenuto, resize della
 * finestra (core/viewport.ts), font caricati, `invalidaStazioni()`. La misura
 * vera la fa ponte/quota.ts nella fase `read` del ticker: mai letture di
 * layout durante lo scroll.
 *
 * Per ogni stazione si misurano:
 * - `top`, `altezza` della sezione;
 * - il pannello di testo, cioè il primo `[data-ssc-pannello]` dentro la
 *   sezione (`pannelloTop`, `pannelloAltezza`); senza pannello: null;
 * - `fissa`: true se dentro c'è un `[data-ssc-pin]` con `position: sticky`
 *   calcolata in quel momento (il CSS del sottoscocca toglie lo sticky con
 *   reduced motion e in modalità bassa: la misura lo vede da sola).
 *
 * Officina e piede si registrano come le stazioni (servono a `sezione` dello
 * store), ma non entrano nella geometria del ponte.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import type { GeometriaStazione } from '../motion/percorso';
import { ticker } from '../core/ticker';
import { SEZIONI_ID, STAZIONI_ID, type IdSezione } from '../state/store';

/** Attributo del pannello di testo di una quota (lo mettono i section-builder). */
export const ATTR_PANNELLO = 'data-ssc-pannello';
/** Attributo dello stadio sticky del sottoscocca (section-builder-sottoscocca). */
export const ATTR_PIN = 'data-ssc-pin';
/** Attributo messo dallo scaffold sull'elemento registrato: valore = id. */
export const ATTR_STAZIONE = 'data-ssc-stazione';

export interface MisuraSezione {
  readonly id: IdSezione;
  readonly top: number;
  readonly fondo: number;
}

const elementi = new Map<IdSezione, HTMLElement>();
let invalide = true;
let versione = 0;
let geometrieCorrenti: GeometriaStazione[] = [];
let sezioniCorrenti: MisuraSezione[] = [];
let osservatore: ResizeObserver | null = null;

function sveglia(): void {
  invalide = true;
  ticker.wake();
}

function prendiOsservatore(): ResizeObserver | null {
  if (osservatore !== null) return osservatore;
  if (typeof ResizeObserver === 'undefined') return null;
  osservatore = new ResizeObserver(sveglia);
  elementi.forEach((el) => osservatore?.observe(el));
  return osservatore;
}

/**
 * Registra una sezione. Una sola per id: la seconda registrazione sostituisce
 * la prima (StrictMode monta due volte). Restituisce la rimozione.
 */
export function registraStazione(id: IdSezione, el: HTMLElement): () => void {
  const prima = elementi.get(id);
  if (prima !== undefined && prima !== el) osservatore?.unobserve(prima);
  elementi.set(id, el);
  el.setAttribute(ATTR_STAZIONE, id);
  prendiOsservatore()?.observe(el);
  sveglia();
  return () => {
    if (elementi.get(id) !== el) return;
    elementi.delete(id);
    osservatore?.unobserve(el);
    sveglia();
  };
}

/** Le misure vanno rifatte al prossimo frame (cambio di layout che il ResizeObserver non vede). */
export function invalidaStazioni(): void {
  sveglia();
}

export function stazioniInvalide(): boolean {
  return invalide;
}

/** Sale di 1 a ogni misura che cambia qualcosa. */
export function versioneStazioni(): number {
  return versione;
}

export function elementoSezione(id: IdSezione): HTMLElement | null {
  return elementi.get(id) ?? null;
}

function geometriaVuota(): GeometriaStazione {
  return { top: Number.NaN, altezza: 0, pannelloTop: null, pannelloAltezza: null, fissa: false };
}

function uguali(a: readonly GeometriaStazione[], b: readonly GeometriaStazione[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] as GeometriaStazione;
    const y = b[i] as GeometriaStazione;
    if (
      !Object.is(x.top, y.top) ||
      x.altezza !== y.altezza ||
      x.pannelloTop !== y.pannelloTop ||
      x.pannelloAltezza !== y.pannelloAltezza ||
      x.fissa !== y.fissa
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Rifà le misure (legge il layout: solo nella fase `read` o in un gestore di
 * evento). Restituisce true se la geometria delle stazioni è cambiata.
 */
export function misuraStazioni(): boolean {
  invalide = false;
  if (typeof window === 'undefined') return false;
  const sy = window.scrollY;
  const nuove: GeometriaStazione[] = STAZIONI_ID.map((id) => {
    const el = elementi.get(id);
    if (el === undefined || !el.isConnected) return geometriaVuota();
    const r = el.getBoundingClientRect();
    const pannello = el.querySelector<HTMLElement>(`[${ATTR_PANNELLO}]`);
    const rp = pannello?.getBoundingClientRect() ?? null;
    const pin = el.querySelector<HTMLElement>(`[${ATTR_PIN}]`);
    const fissa = pin !== null && window.getComputedStyle(pin).position === 'sticky';
    return {
      top: r.top + sy,
      altezza: r.height,
      pannelloTop: rp !== null && rp.height > 0 ? rp.top + sy : null,
      pannelloAltezza: rp !== null && rp.height > 0 ? rp.height : null,
      fissa,
    };
  });
  const sezioni: MisuraSezione[] = [];
  for (const id of SEZIONI_ID) {
    const el = elementi.get(id);
    if (el === undefined || !el.isConnected) continue;
    const r = el.getBoundingClientRect();
    sezioni.push({ id, top: r.top + sy, fondo: r.bottom + sy });
  }
  sezioni.sort((a, b) => a.top - b.top);
  sezioniCorrenti = sezioni;
  if (uguali(nuove, geometrieCorrenti)) return false;
  geometrieCorrenti = nuove;
  versione += 1;
  return true;
}

/** Le sei stazioni in ordine (`STAZIONI` di motion/percorso.ts). Vuoto prima della prima misura. */
export function geometrie(): readonly GeometriaStazione[] {
  return geometrieCorrenti;
}

/** La sezione che contiene la riga `y` (px documento), o la più vicina sopra. */
export function sezioneA(y: number): IdSezione | null {
  let trovata: IdSezione | null = null;
  for (const s of sezioniCorrenti) {
    if (s.top <= y) trovata = s.id;
    else break;
  }
  return trovata ?? sezioniCorrenti[0]?.id ?? null;
}

/**
 * Solo Radice.tsx: osserva anche il contenitore del contenuto (un fratello
 * che cambia altezza sposta le sezioni sotto senza ridimensionarle) e
 * rimisura quando arrivano i font. Restituisce lo smontaggio.
 */
export function osservaStazioni(contenuto: HTMLElement | null): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const ro = prendiOsservatore();
  if (contenuto !== null) ro?.observe(contenuto);
  const fonts = 'fonts' in document ? document.fonts : null;
  let vivo = true;
  void fonts?.ready.then(() => {
    if (vivo) sveglia();
  });
  fonts?.addEventListener('loadingdone', sveglia);
  return () => {
    vivo = false;
    fonts?.removeEventListener('loadingdone', sveglia);
    if (contenuto !== null) ro?.unobserve(contenuto);
    if (elementi.size === 0) {
      osservatore?.disconnect();
      osservatore = null;
    }
  };
}

/** Allo smontaggio di Radice: dimentica tutto (nel sito vero si torna con stato pulito). */
export function azzeraStazioni(): void {
  osservatore?.disconnect();
  osservatore = null;
  elementi.clear();
  geometrieCorrenti = [];
  sezioniCorrenti = [];
  invalide = true;
}
