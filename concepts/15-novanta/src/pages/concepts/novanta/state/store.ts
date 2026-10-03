/**
 * NOVANTA · store dei valori lenti (tech-architect §6.1, ux-architect §1.2,
 * §1.3 e §5.5, copywriter §8).
 *
 * Piccolo store esterno senza librerie, letto con `useSyncExternalStore` e un
 * selettore: un componente si ri-renderizza solo quando cambia la fetta che
 * usa. I valori caldi (angolo continuo del braccio, dell'anello, viewport)
 * NON stanno qui: sono in `state/runtime.ts`.
 *
 * Semantica:
 * - `store.set` e le azioni sono SINCRONE: dopo la chiamata `store.get()`
 *   riflette il cambio e gli abbonati sono già stati avvisati; nessun avviso
 *   se nulla cambia (confronto per campo, `Object.is`).
 * - Lo store è un singleton di modulo, ma `inizializzaStore()` lo rifà da capo
 *   al mount di Novanta.tsx (memoria del browser, URL, preferenze): navigare
 *   via e tornare nel sito vero non lascia stati sporchi.
 * - Le sezioni chiamano le AZIONI, non `store.set`. `aggiornaModo`,
 *   `impostaReducedMotion` e `impostaOggi` sono solo di Novanta.tsx.
 * - Nome, telefono e motivo NON vanno mai nello storage (dati sanitari, anche
 *   se finti): in memoria restano solo le due date e ore dopo il successo.
 *
 * Nessun accesso al browser a livello di modulo: lo stato iniziale del
 * modulo è neutro (0°, vista automatica, niente date) e va bene anche per il
 * prerender.
 */

import { useRef, useSyncExternalStore } from 'react';
import type { IdMotivo } from '../content/testi';
import { ANGOLI, eAngolo, type Angolo } from '../dial/geometria';
import { leggiParametri } from '../core/params';
import { leggiAngoloDaHash } from '../core/hash';
import { CHIAVI, leggi, leggiJSON, rimuovi, scrivi, scriviJSON } from './persist';

/* ------------------------------------------------------------------ tipi */

export type { Angolo };
export { ANGOLI };

export type Modo = 'quadrante' | 'elenco';
export type Geometria = 'bordo' | 'fondo';
/** 'auto' = decide core/modo.ts dalle misure; 'elenco' / 'quadrante' = scelta a mano. */
export type PreferenzaVista = 'auto' | 'elenco' | 'quadrante';
/** Perché la vista è elenco anche se la preferenza è auto (riga role="status"). */
export type MotivoElenco = 'finestra-bassa' | 'testo-grande' | 'non-ci-sta' | null;
/** 'AAAA-MM-GG@HH:MM', ora locale. */
export type SlotId = string;
export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
export type AvvisoPrenota = 'posto-preso' | 'controllo-spostato' | 'settimana-piena' | null;
export type CampoPrenota = 'nome' | 'telefono' | 'motivo';

export interface CampiPrenota {
  nome: string;
  telefono: string;
  motivo: string;
}

export type ErroriPrenota = Partial<Record<'nome' | 'telefono', string>>;

/** Le due date e ore in memoria dopo il successo (S14). Nient'altro. */
export interface PrenotazioneSalvata {
  readonly prima: SlotId;
  readonly controllo: SlotId | null;
}

export interface StatoPrenota {
  /** Prima ora scelta; null solo prima che `oggi` ci sia (prerender). */
  prima: SlotId | null;
  /** Controllo proposto (+7…+10 giorni); null se tolto o non ancora proposto. */
  controllo: SlotId | null;
  /** true = prima visita + controllo (default); false = "solo la prima visita". */
  ciclo: boolean;
  campi: CampiPrenota;
  errori: ErroriPrenota;
  invio: StatoInvio;
  avviso: AvvisoPrenota;
  /** "Tutte le ore libere" aperto (in vista elenco è aperto di default). */
  elencoOreAperto: boolean;
  /** Prenotazione trovata in memoria all'avvio: stato "già fissato" (S14). */
  salvata: PrenotazioneSalvata | null;
}

/** Chi ha chiesto di andare a un angolo (analytics e focus). */
export type OrigineRichiesta = 'parola' | 'prenota' | 'hash' | 'popstate' | 'salto' | 'passo' | 'tastiera' | 'elenco';

/**
 * Richiesta di portare il braccio a un angolo. La scrive `richiediAngolo`
 * (parole del quadrante, "Prenota", link `#gradi-N`, popstate); la consuma
 * `useBraccio` (vista quadrante: `rotore.vaA`, poi focus all'h2) oppure
 * Novanta.tsx (vista elenco: scroll alla sezione, focus all'h2). `n` cresce
 * a ogni richiesta, così due richieste uguali di fila si distinguono.
 */
export interface RichiestaAngolo {
  readonly angolo: Angolo;
  readonly n: number;
  readonly origine: OrigineRichiesta;
  /** Portare il fuoco all'h2 dell'angolo all'arrivo (parole, Prenota, salto: sì; popstate: no). */
  readonly fuoco: boolean;
}

export interface NovantaState {
  /** Angolo di contenuto in vista (cambia a metà strada). */
  attivo: Angolo;
  /** Ultima richiesta di rotazione (vedi `richiediAngolo`); null all'avvio. */
  richiesta: RichiestaAngolo | null;
  /** Raggio del quadrante in px (core/modo.ts); 0 in vista elenco. Per chi rende l'SVG. */
  raggio: number;
  /** L'angolo prima dell'ultimo cambio (data-dir e dissolvenza). */
  precedente: Angolo | null;
  /** Verso dell'ultimo cambio, per `data-dir`. */
  direzione: 'avanti' | 'indietro';
  preferenzaVista: PreferenzaVista;
  /** Derivato da preferenza + misure (core/modo.ts). */
  modo: Modo;
  geometria: Geometria;
  motivoElenco: MotivoElenco;
  /** Il quadrante ci starebbe: "Torna al quadrante" ha senso. */
  quadrantePossibile: boolean;
  reducedMotion: boolean;
  /** L'invito della manopola è già stato fatto in questa sessione. */
  invitoFatto: boolean;
  /** C'era un frammento all'arrivo (l'invito non parte). */
  arrivoConHash: boolean;
  /** 'AAAA-MM-GG' impostato al mount (o ?oggi=); null nel prerender. */
  oggi: string | null;
  /** Suggerimento di `?motivo=` da precompilare. */
  motivoIniziale: IdMotivo | null;
  prenota: StatoPrenota;
  simula: { invioKo: boolean; postoPreso: boolean };
}

export type PatchStato = Partial<NovantaState> | ((s: NovantaState) => Partial<NovantaState>);

/* ------------------------------------------------------------------ stato iniziale */

function prenotaIniziale(): StatoPrenota {
  return {
    prima: null,
    controllo: null,
    ciclo: true,
    campi: { nome: '', telefono: '', motivo: '' },
    errori: {},
    invio: 'idle',
    avviso: null,
    elencoOreAperto: false,
    salvata: null,
  };
}

export function statoIniziale(): NovantaState {
  return {
    attivo: 0,
    richiesta: null,
    raggio: 0,
    precedente: null,
    direzione: 'avanti',
    preferenzaVista: 'auto',
    modo: 'elenco',
    geometria: 'fondo',
    motivoElenco: null,
    quadrantePossibile: true,
    reducedMotion: false,
    invitoFatto: false,
    arrivoConHash: false,
    oggi: null,
    motivoIniziale: null,
    prenota: prenotaIniziale(),
    simula: { invioKo: false, postoPreso: false },
  };
}

let stato: NovantaState = statoIniziale();
const ascoltatori = new Set<() => void>();

function avvisa(): void {
  for (const fn of ascoltatori) fn();
}

function cambiato(p: Partial<NovantaState>): boolean {
  for (const k of Object.keys(p) as (keyof NovantaState)[]) {
    if (!Object.is(p[k], stato[k])) return true;
  }
  return false;
}

export const store = {
  get(): NovantaState {
    return stato;
  },
  set(patch: PatchStato): void {
    const p = typeof patch === 'function' ? patch(stato) : patch;
    if (!cambiato(p)) return;
    stato = { ...stato, ...p };
    avvisa();
  },
  subscribe(fn: () => void): () => void {
    ascoltatori.add(fn);
    return () => {
      ascoltatori.delete(fn);
    };
  },
};

/* ------------------------------------------------------------------ hook */

interface CacheSelettore<T> {
  stato: NovantaState;
  selettore: (s: NovantaState) => T;
  valore: T;
}

function subscribeStore(fn: () => void): () => void {
  return store.subscribe(fn);
}

/**
 * Legge una fetta dello store. Ri-renderizza solo quando la fetta cambia
 * secondo `isEqual` (default `Object.is`). Il selettore può essere inline: se
 * restituisce un oggetto nuovo ma uguale per `isEqual`, si riusa il precedente.
 */
export function useNovanta<T>(selector: (s: NovantaState) => T, isEqual: (a: T, b: T) => boolean = Object.is): T {
  const cache = useRef<CacheSelettore<T> | null>(null);

  const getSnapshot = (): T => {
    const s = stato;
    const c = cache.current;
    if (c !== null && c.stato === s && c.selettore === selector) return c.valore;
    const nuovo = selector(s);
    if (c !== null && isEqual(c.valore, nuovo)) {
      cache.current = { stato: s, selettore: selector, valore: c.valore };
      return c.valore;
    }
    cache.current = { stato: s, selettore: selector, valore: nuovo };
    return nuovo;
  };

  return useSyncExternalStore(subscribeStore, getSnapshot, getSnapshot);
}

/* ------------------------------------------------------------------ validazione memoria */

const RE_SLOT = /^\d{4}-\d{2}-\d{2}@\d{2}:\d{2}$/;

export function eSlotId(v: unknown): v is SlotId {
  return typeof v === 'string' && RE_SLOT.test(v);
}

function ePrenotazioneSalvata(v: unknown): v is PrenotazioneSalvata {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return eSlotId(o['prima']) && (o['controllo'] === null || eSlotId(o['controllo']));
}

/* ------------------------------------------------------------------ avvio */

export interface OpzioniAvvio {
  readonly search: string;
  readonly hash: string;
  readonly reducedMotion: boolean;
  /** 'AAAA-MM-GG' di oggi, ora locale (Novanta.tsx la calcola nel mount). */
  readonly oggi: string;
}

/** Data locale come 'AAAA-MM-GG'. */
export function dataIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${g}`;
}

/**
 * Rifà lo stato da capo: memoria (vista, invito, prenotazione), parametri
 * dell'URL, frammento, reduced motion. Solo Novanta.tsx, prima del primo
 * render delle sezioni. Restituisce lo stato.
 */
export function inizializzaStore(o: OpzioniAvvio): NovantaState {
  const p = leggiParametri(o.search);
  const vistaSalvata = leggi(CHIAVI.vista);
  const preferenzaVista: PreferenzaVista =
    p.vista !== null ? p.vista : vistaSalvata === 'elenco' || vistaSalvata === 'quadrante' ? vistaSalvata : 'auto';
  const angoloHash = leggiAngoloDaHash(o.hash);
  const salvata = leggiJSON(CHIAVI.prenotazione, ePrenotazioneSalvata);
  const base = statoIniziale();
  stato = {
    ...base,
    attivo: angoloHash ?? 0,
    preferenzaVista,
    reducedMotion: o.reducedMotion,
    invitoFatto: leggi(CHIAVI.invito, 'session') === '1',
    arrivoConHash: angoloHash !== null && angoloHash !== 0,
    oggi: p.oggi ?? o.oggi,
    motivoIniziale: p.motivo,
    prenota: { ...base.prenota, salvata },
    simula: { invioKo: p.invioKo, postoPreso: p.postoPreso },
  };
  avvisa();
  return stato;
}

/* ------------------------------------------------------------------ azioni: angolo e vista */

/** Cambia l'angolo di contenuto (useBraccio via `contenutoDuranteIlMoto`, parole, hash, vista elenco). */
export function impostaAttivo(angolo: Angolo): void {
  if (!eAngolo(angolo)) return;
  store.set((s) => {
    if (s.attivo === angolo) return {};
    return { attivo: angolo, precedente: s.attivo, direzione: angolo > s.attivo ? 'avanti' : 'indietro' };
  });
}

/**
 * Chiede di portare il braccio (o l'elenco) all'angolo. Le sezioni chiamano
 * questa, non `impostaAttivo`: il contenuto cambia quando il braccio arriva.
 */
export function richiediAngolo(angolo: Angolo, origine: OrigineRichiesta, fuoco = true): void {
  if (!eAngolo(angolo)) return;
  store.set((s) => ({ richiesta: { angolo, n: (s.richiesta?.n ?? 0) + 1, origine, fuoco } }));
}

/** Scelta a mano della vista (testata). Salvata; 'auto' cancella la memoria. */
export function impostaVista(pref: PreferenzaVista): void {
  if (pref === 'auto') rimuovi(CHIAVI.vista);
  else scrivi(CHIAVI.vista, pref);
  store.set({ preferenzaVista: pref });
}

export interface ModoCalcolato {
  readonly modo: Modo;
  readonly geometria: Geometria;
  readonly motivoElenco: MotivoElenco;
  readonly quadrantePossibile: boolean;
}

/** Solo core/modo.ts (via Novanta.tsx): modo e geometria calcolati dalle misure. */
export function aggiornaModo(m: ModoCalcolato, raggio: number): void {
  store.set({ modo: m.modo, geometria: m.geometria, motivoElenco: m.motivoElenco, quadrantePossibile: m.quadrantePossibile, raggio });
}

/** Solo Novanta.tsx. */
export function impostaReducedMotion(ridotto: boolean): void {
  store.set({ reducedMotion: ridotto });
}

/** Solo Novanta.tsx (mount, o test). */
export function impostaOggi(oggi: string): void {
  store.set({ oggi });
}

/** L'invito della manopola è stato fatto: una volta per sessione. */
export function segnaInvito(): void {
  scrivi(CHIAVI.invito, '1', 'session');
  store.set({ invitoFatto: true });
}

/* ------------------------------------------------------------------ azioni: prenotazione */

function patchPrenota(fn: (p: StatoPrenota) => Partial<StatoPrenota>): void {
  store.set((s) => {
    const parziale = fn(s.prenota);
    let uguale = true;
    for (const k of Object.keys(parziale) as (keyof StatoPrenota)[]) {
      if (!Object.is(parziale[k], s.prenota[k])) {
        uguale = false;
        break;
      }
    }
    return uguale ? {} : { prenota: { ...s.prenota, ...parziale } };
  });
}

/** Prima visita scelta (anello, radio). Il controllo lo ricalcola chi chiama (`spostaControllo`). */
export function scegliPrima(slot: SlotId | null): void {
  patchPrenota(() => ({ prima: slot }));
}

/** Controllo proposto, spostato o tolto (null). */
export function spostaControllo(slot: SlotId | null): void {
  patchPrenota(() => ({ controllo: slot }));
}

/** true = due visite; false = solo la prima. */
export function impostaCiclo(ciclo: boolean): void {
  patchPrenota(() => ({ ciclo }));
}

export function aggiornaCampo(campo: CampoPrenota, valore: string): void {
  patchPrenota((p) => (p.campi[campo] === valore ? {} : { campi: { ...p.campi, [campo]: valore } }));
}

export function impostaErrori(errori: ErroriPrenota): void {
  patchPrenota(() => ({ errori }));
}

export function impostaInvio(invio: StatoInvio): void {
  patchPrenota(() => ({ invio }));
}

export function impostaAvviso(avviso: AvvisoPrenota): void {
  patchPrenota(() => ({ avviso }));
}

export function apriElencoOre(aperto: boolean): void {
  patchPrenota(() => ({ elencoOreAperto: aperto }));
}

/**
 * Successo (S12): salva SOLO le due date e ore per il ritorno (S14).
 * Il chiamante ha già messo `invio: 'sent'`.
 */
export function salvaPrenotazione(prima: SlotId, controllo: SlotId | null): void {
  const salvata: PrenotazioneSalvata = { prima, controllo };
  scriviJSON(CHIAVI.prenotazione, salvata);
  patchPrenota(() => ({ salvata }));
}

/** "Cambia" (S13) o ricomincia: campi e stati a zero, memoria tolta. `prima` resta (la ricalcola chi chiama se serve). */
export function ricominciaPrenota(): void {
  rimuovi(CHIAVI.prenotazione);
  patchPrenota((p) => ({ ...prenotaIniziale(), prima: p.prima, controllo: p.controllo, elencoOreAperto: p.elencoOreAperto }));
}

/* ------------------------------------------------------------------ selettori */

export const selAttivo = (s: NovantaState): Angolo => s.attivo;
export const selRichiesta = (s: NovantaState): RichiestaAngolo | null => s.richiesta;
export const selRaggio = (s: NovantaState): number => s.raggio;
export const selModo = (s: NovantaState): Modo => s.modo;
export const selGeometria = (s: NovantaState): Geometria => s.geometria;
export const selReducedMotion = (s: NovantaState): boolean => s.reducedMotion;
export const selOggi = (s: NovantaState): string | null => s.oggi;
export const selPrenota = (s: NovantaState): StatoPrenota => s.prenota;
/** true se la vista è elenco per scelta o per misure. */
export const selElenco = (s: NovantaState): boolean => s.modo === 'elenco';
