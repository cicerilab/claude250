/**
 * EVIDENZIA · store dei valori lenti (tech-architect §6.1,
 * interaction-designer §8, motion-designer §6.1 e §8, copywriter).
 *
 * Piccolo store esterno senza librerie, letto con `useSyncExternalStore` e un
 * selettore: un componente si ri-renderizza solo quando cambia la fetta che
 * usa. I valori caldi (scroll, avanzamento del tratto, pan) NON stanno qui:
 * sono in `state/runtime.ts`.
 *
 * Semantica:
 * - `store.set` e le azioni sono SINCRONE: dopo la chiamata `store.get()`
 *   riflette il cambio e gli abbonati sono già stati avvisati;
 * - singleton di modulo, rifatto da capo da `inizializzaStore()` al mount di
 *   Evidenzia.tsx (memoria del browser + URL), così tornare nel sito vero non
 *   lascia stati sporchi;
 * - le sezioni chiamano le AZIONI, mai `store.set` (eccezioni dichiarate:
 *   nessuna, oggi);
 * - il giro si salva in localStorage (`evidenzia:giro`, decisione
 *   dell'orchestratore) a ogni azione che lo cambia. Il contatto del modulo
 *   "Chi sei" non entra MAI né qui né in memoria.
 *
 * Nessun accesso al browser a livello di modulo: lo stato iniziale del modulo
 * è neutro e va bene anche per il prerender.
 */

import { useRef, useSyncExternalStore } from 'react';
import { MAX_GIRO, annuncioDa, idDaRif } from '../content/annunci';
import { ANNUNCIO, LIVE, voceAggiunto, voceTolto } from '../content/testi';
import { CALENDARIO } from '../content/zone';
import { vibra } from '../core/capabilities';
import type { Layout } from '../core/layout';
import { adessoRoma, calendario, giornoDa, leggiOggiFinto, type Calendario, type Sabato } from '../core/sabato';
import { getPagina } from '../core/scroller';
import { SOGLIE_GESTO } from '../motion/durate';
import { fotografaVista, type FotoVista, type PuntoFisso } from '../motion/vista';
import { CHIAVI, leggiJSON, scriviJSON } from './persist';

/* ------------------------------------------------------------------ tipi */

/**
 * Id di un annuncio ("rif-214"). Nello store è una stringa qualunque: in
 * memoria può esserci un Rif. che non esiste più, e i moduli del gesto
 * leggono gli id dal DOM (`data-evd-tappa`). Il tipo letterale degli annunci
 * in pagina è `IdAnnuncio` di content/annunci.ts ed è assegnabile a questo.
 */
export type IdAnnuncio = string;
export type Vista = 'leggi' | 'intera';
export type { Layout };
export type Partenza = (typeof CALENDARIO.partenze)[number];
export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
export type StatoMappa = 'chiusa' | 'caricamento' | 'pronta' | 'errore';
/** Da dove arriva un'aggiunta o una rimozione (vibrazione solo per gesto e bottone). */
export type Origine = 'gesto' | 'bottone' | 'scheda' | 'giro';
export type EsitoEvidenzia = 'aggiunto' | 'gia' | 'pieno';
export type EsitoAlterna = 'aggiunto' | 'tolto' | 'pieno';

export const PARTENZE: readonly Partenza[] = CALENDARIO.partenze;
export { MAX_GIRO };

/** Il giro mandato con successo (persistito). `impronta` serve a dire "Cambiato dopo l'invio". */
export interface GiroMandato {
  /** ISO del sabato, "2026-10-03" */
  readonly sabato: string;
  /** tappe nell'ordine mandato */
  readonly tappe: readonly IdAnnuncio[];
  readonly partenza: Partenza;
  readonly daAgenzia: boolean;
  readonly impronta: string;
}

export interface Simula {
  /** `?invio=ko`: l'invio simulato del giro fallisce */
  readonly invioKo: boolean;
  /** `?mappa=ko`: la mappa va subito in errore, senza chiedere tile */
  readonly mappaKo: boolean;
  /** `?oggi=2026-10-03` (o con ora): data finta per il calendario */
  readonly oggi: string | null;
}

export interface EvidenziaState {
  /** ordine di aggiunta, massimo MAX_GIRO (persistito) */
  segnati: readonly IdAnnuncio[];
  /** ordine scelto a mano nel giro; null = il più breve, calcolato da sections/Giro/calcolo.ts (persistito) */
  ordine: readonly IdAnnuncio[] | null;
  /** persistito, default '09:00' */
  partenza: Partenza;
  /** true = si parte dall'agenzia; false = "ci vediamo alla prima casa" (persistito) */
  daAgenzia: boolean;
  /** 0 = primo sabato proposto, 1 = quello dopo (persistito come data ISO) */
  sabato: 0 | 1;
  /** calendario del concept (testata, sabati del giro, tardi, chiuso); null prima dell'avvio (prerender) */
  calendario: Calendario | null;
  /** ISO di un sabato salvato ormai passato ("Il giro di sabato 3 ottobre è passato…"), o null */
  sabatoPassato: string | null;
  /** Rif. salvati che non esistono più in pagina ("Una casa che avevi segnato non è più in pagina…") */
  sparite: number;
  vista: Vista;
  layout: Layout;
  schedaAperta: IdAnnuncio | null;
  giroAperto: boolean;
  /** il livello aperto arriva dall'URL (#scheda-214, #giro, ?scheda=, ?giro=1): niente stacco, chiusura con replaceState */
  aperturaDaUrl: boolean;
  invio: StatoInvio;
  /** persistito: "Giro mandato per sabato 3 ottobre" */
  mandato: GiroMandato | null;
  /** annuncio su cui è stato tentato il quinto tratto (riga d'avviso), o null */
  scarico: IdAnnuncio | null;
  mappa: StatoMappa;
  /** ultimo messaggio per la regione aria-live (si sostituisce, non si accumula) */
  voceLive: string;
  /** contatore dei messaggi: la regione rimonta il testo anche se è uguale al precedente */
  voceLiveN: number;
  /** annunci segnati da `?segna=` all'avvio (0 = nessuno): Evidenzia.tsx lo annuncia una volta */
  daUrl: number;
  reducedMotion: boolean;
  simula: Simula;
}

export type PatchStato = Partial<EvidenziaState> | ((s: EvidenziaState) => Partial<EvidenziaState>);

/* ------------------------------------------------------------------ stato */

function statoNeutro(): EvidenziaState {
  return {
    segnati: [],
    ordine: null,
    partenza: '09:00',
    daAgenzia: true,
    sabato: 0,
    calendario: null,
    sabatoPassato: null,
    sparite: 0,
    vista: 'leggi',
    layout: 'foglio',
    schedaAperta: null,
    giroAperto: false,
    aperturaDaUrl: false,
    invio: 'idle',
    mandato: null,
    scarico: null,
    mappa: 'chiusa',
    voceLive: '',
    voceLiveN: 0,
    daUrl: 0,
    reducedMotion: false,
    simula: { invioKo: false, mappaKo: false, oggi: null },
  };
}

let stato: EvidenziaState = statoNeutro();
const ascoltatori = new Set<() => void>();

function cambiato(p: Partial<EvidenziaState>): boolean {
  for (const k of Object.keys(p) as (keyof EvidenziaState)[]) {
    if (!Object.is(p[k], stato[k])) return true;
  }
  return false;
}

function avvisa(): void {
  for (const fn of [...ascoltatori]) fn();
}

export const store = {
  get(): EvidenziaState {
    return stato;
  },
  /** Sincrono; nessun avviso se nulla cambia. Solo per le azioni qui sotto. */
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
  stato: EvidenziaState;
  selettore: (s: EvidenziaState) => T;
  valore: T;
}

function subscribeStore(fn: () => void): () => void {
  return store.subscribe(fn);
}

/**
 * Legge una fetta dello store. Ri-renderizza solo quando la fetta cambia
 * secondo `isEqual` (default `Object.is`). Selettori inline ammessi; se il
 * selettore costruisce oggetti o array nuovi, passare `isEqual`.
 */
export function useEvidenzia<T>(
  selector: (s: EvidenziaState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is,
): T {
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

/** Confronto per array di id (per selettori che filtrano o copiano liste). */
export function stessiId(a: readonly IdAnnuncio[] | null, b: readonly IdAnnuncio[] | null): boolean {
  if (a === b) return true;
  if (a === null || b === null || a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/* ------------------------------------------------------------------ memoria */

interface GiroSalvato {
  versione: 1;
  segnati: string[];
  ordine: string[] | null;
  partenza: Partenza;
  daAgenzia: boolean;
  /** ISO del sabato scelto, o null */
  sabato: string | null;
  mandato: GiroMandato | null;
}

function eListaStringhe(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function ePartenza(v: unknown): v is Partenza {
  return typeof v === 'string' && (PARTENZE as readonly string[]).includes(v);
}

function eMandato(v: unknown): v is GiroMandato {
  if (typeof v !== 'object' || v === null) return false;
  const m = v as Record<string, unknown>;
  return (
    typeof m.sabato === 'string' &&
    eListaStringhe(m.tappe) &&
    ePartenza(m.partenza) &&
    typeof m.daAgenzia === 'boolean' &&
    typeof m.impronta === 'string'
  );
}

function eGiroSalvato(v: unknown): v is GiroSalvato {
  if (typeof v !== 'object' || v === null) return false;
  const g = v as Record<string, unknown>;
  return (
    g.versione === 1 &&
    eListaStringhe(g.segnati) &&
    (g.ordine === null || eListaStringhe(g.ordine)) &&
    ePartenza(g.partenza) &&
    typeof g.daAgenzia === 'boolean' &&
    (g.sabato === null || typeof g.sabato === 'string') &&
    (g.mandato === null || eMandato(g.mandato))
  );
}

function sabatoIso(s: EvidenziaState): string | null {
  return s.calendario?.proposti[s.sabato].iso ?? null;
}

function salva(): void {
  const s = stato;
  const g: GiroSalvato = {
    versione: 1,
    segnati: [...s.segnati],
    ordine: s.ordine === null ? null : [...s.ordine],
    partenza: s.partenza,
    daAgenzia: s.daAgenzia,
    sabato: sabatoIso(s),
    mandato: s.mandato,
  };
  scriviJSON(CHIAVI.giro, g);
}

/** L'impronta del giro com'è adesso (sabato, partenza, da dove, case, ordine a mano). */
function improntaDi(s: EvidenziaState): string {
  const casi = [...s.segnati].sort().join(',');
  const ordine = s.ordine === null ? '-' : s.ordine.join(',');
  return `${sabatoIso(s) ?? '-'}|${s.partenza}|${s.daAgenzia ? 'agenzia' : 'prima'}|${casi}|${ordine}`;
}

/** Tiene in `ordine` solo i segnati, e aggiunge in fondo quelli che mancano. */
function ordineCoerente(ordine: readonly IdAnnuncio[] | null, segnati: readonly IdAnnuncio[]): IdAnnuncio[] | null {
  if (ordine === null) return null;
  const tenuti = ordine.filter((id, i) => segnati.includes(id) && ordine.indexOf(id) === i);
  for (const id of segnati) if (!tenuti.includes(id)) tenuti.push(id);
  return tenuti.length === 0 ? null : tenuti;
}

/* ------------------------------------------------------------------ azioni */

/** Messaggio nella regione aria-live unica (si sostituisce al precedente). */
export function annuncia(testo: string): void {
  store.set((s) => ({ voceLive: testo, voceLiveN: s.voceLiveN + 1 }));
}

/**
 * Mette un annuncio nel giro. 'pieno' con quattro case già nel giro: non
 * aggiunge, imposta `scarico = id` e dice la riga del quinto in live.
 * Vibra 10 ms (dove si può) dopo un'aggiunta col gesto o col bottone.
 */
export function evidenzia(id: IdAnnuncio, origine: Origine): EsitoEvidenzia {
  const s = stato;
  const a = annuncioDa(id);
  if (a === undefined || s.segnati.includes(id)) return 'gia';
  if (s.segnati.length >= MAX_GIRO) {
    store.set({ scarico: id });
    annuncia(ANNUNCIO.scarico);
    return 'pieno';
  }
  const segnati = [...s.segnati, id];
  store.set({ segnati, ordine: s.ordine === null ? null : [...s.ordine, id], scarico: null });
  annuncia(voceAggiunto(a, segnati.length));
  if (origine === 'gesto' || origine === 'bottone') vibra(SOGLIE_GESTO.vibrazioneMs);
  salva();
  return 'aggiunto';
}

/** Toglie un annuncio dal giro (e dal foglio: il tratto si scolora). */
export function togli(id: IdAnnuncio, _origine: Origine): void {
  const s = stato;
  if (!s.segnati.includes(id)) return;
  const segnati = s.segnati.filter((x) => x !== id);
  store.set({ segnati, ordine: ordineCoerente(s.ordine, segnati), scarico: null });
  const a = annuncioDa(id);
  if (a !== undefined) annuncia(voceTolto(a, segnati.length));
  salva();
}

/** Bottone Evidenzia, toggle della scheda: dentro ↔ fuori. */
export function alterna(id: IdAnnuncio, origine: Origine): EsitoAlterna {
  if (stato.segnati.includes(id)) {
    togli(id, origine);
    return 'tolto';
  }
  return evidenzia(id, origine) === 'pieno' ? 'pieno' : 'aggiunto';
}

/**
 * Prima / Dopo nel giro: fissa l'ordine a mano. `base` = l'ordine mostrato
 * adesso (quello più breve calcolato da sections/Giro/calcolo.ts) quando
 * `ordine` è ancora null; senza `base` si parte dall'ordine di aggiunta.
 */
export function sposta(id: IdAnnuncio, verso: -1 | 1, base?: readonly IdAnnuncio[]): void {
  const s = stato;
  const corrente = s.ordine ?? ordineCoerente(base ?? s.segnati, s.segnati) ?? [];
  const i = corrente.indexOf(id);
  const j = i + verso;
  if (i < 0 || j < 0 || j >= corrente.length) return;
  const nuovo = [...corrente];
  const altro = nuovo[j];
  if (altro === undefined) return;
  nuovo[j] = id;
  nuovo[i] = altro;
  store.set({ ordine: nuovo });
  salva();
}

/** Trascinamento delle tappe: il nuovo ordine intero. */
export function riordina(ids: readonly IdAnnuncio[]): void {
  const ordine = ordineCoerente(ids, stato.segnati);
  if (stessiId(ordine, stato.ordine)) return;
  store.set({ ordine });
  salva();
}

/** "Rimetti l'ordine più breve". */
export function ordineAutomatico(): void {
  if (stato.ordine === null) return;
  store.set({ ordine: null });
  salva();
}

export function impostaPartenza(p: Partenza): void {
  store.set({ partenza: p });
  salva();
}

export function impostaDaAgenzia(b: boolean): void {
  store.set({ daAgenzia: b });
  salva();
}

export function impostaSabato(n: 0 | 1): void {
  store.set({ sabato: n, sabatoPassato: null });
  salva();
}

/* ---------- vista: protocollo del motion-designer (§6.1) ---------- */

export interface CambioVistaInAttesa {
  readonly a: Vista;
  readonly foto: FotoVista;
  readonly punto: PuntoFisso | null;
}

let cambioInAttesa: CambioVistaInAttesa | null = null;

/**
 * Leggi ↔ Pagina intera. Le sezioni NON la chiamano: passano da
 * `chiediVista()` di interaction/cambioVista.ts (anti-lampeggio 500 ms).
 * Fotografa la pagina PRIMA del cambio di stato; foglio/Foglio.tsx, nel
 * layout effect della vista nuova, prende la foto con `prendiCambioVista()` e
 * chiama `cambiaVista()`. `puntoFisso` (contenuto non scalato): il punto da
 * portare al centro tornando a Leggi; null = quello che era al centro.
 * Mai Pagina intera nella colonna. Dice la vista nuova in aria-live.
 */
export function impostaVista(v: Vista, puntoFisso?: PuntoFisso | null): void {
  const s = stato;
  if (s.vista === v) return;
  if (v === 'intera' && s.layout !== 'foglio') return;
  const pagina = getPagina();
  cambioInAttesa = pagina === null ? null : { a: v, foto: fotografaVista(pagina), punto: puntoFisso ?? null };
  store.set({ vista: v });
  annuncia(v === 'intera' ? LIVE.vistaIntera : LIVE.vistaLeggi);
}

/** Solo foglio/Foglio.tsx: la foto presa da `impostaVista` per la vista `v` (una volta sola). */
export function prendiCambioVista(v: Vista): CambioVistaInAttesa | null {
  const c = cambioInAttesa;
  cambioInAttesa = null;
  return c !== null && c.a === v ? c : null;
}

/* ---------- livelli ---------- */

/** Apre la scheda di un annuncio (un livello alla volta: chiude il giro). */
export function apriScheda(id: IdAnnuncio): void {
  if (annuncioDa(id) === undefined) return;
  store.set({ schedaAperta: id, giroAperto: false, aperturaDaUrl: false });
}

export function chiudiScheda(): void {
  store.set({ schedaAperta: null, aperturaDaUrl: false });
}

/** Apre il pannello del giro (anche vuoto). */
export function apriGiro(): void {
  store.set({ giroAperto: true, schedaAperta: null, aperturaDaUrl: false, scarico: null });
}

export function chiudiGiro(): void {
  store.set((s) => ({
    giroAperto: false,
    aperturaDaUrl: false,
    mappa: 'chiusa',
    invio: s.invio === 'sending' ? 'idle' : s.invio,
  }));
}

/** La riga del quinto annuncio è stata chiusa (o sono passati gli 8 s). */
export function chiudiScarico(): void {
  store.set({ scarico: null });
}

/** Solo mappa/. */
export function impostaMappa(m: StatoMappa): void {
  store.set({ mappa: m });
}

/** Solo sections/Giro. */
export function impostaInvio(i: StatoInvio): void {
  store.set({ invio: i });
}

/**
 * Solo sections/Giro, al successo dell'invio. Partenza, da dove e impronta li
 * prende dallo stato attuale; si salva in memoria.
 */
export function segnaMandato(g: { sabato: string; tappe: readonly IdAnnuncio[] }): void {
  const s = stato;
  store.set({
    mandato: {
      sabato: g.sabato,
      tappe: [...g.tappe],
      partenza: s.partenza,
      daAgenzia: s.daAgenzia,
      impronta: improntaDi(s),
    },
    invio: 'sent',
  });
  salva();
}

/* ---------- di sistema: solo Evidenzia.tsx ---------- */

export function impostaReducedMotion(r: boolean): void {
  store.set({ reducedMotion: r });
}

/** Passaggio foglio ↔ colonna: nella colonna non c'è Pagina intera. */
export function impostaLayout(l: Layout): void {
  if (stato.layout === l) return;
  cambioInAttesa = null;
  store.set({ layout: l, vista: l === 'colonna' ? 'leggi' : stato.vista });
}

/* ------------------------------------------------------------------ selettori */

export const selQuanti = (s: EvidenziaState): number => s.segnati.length;
export const selPieno = (s: EvidenziaState): boolean => s.segnati.length >= MAX_GIRO;
/** Ordine scelto a mano, o null (il più breve lo calcola sections/Giro/calcolo.ts). */
export const selOrdineGiro = (s: EvidenziaState): readonly IdAnnuncio[] | null => s.ordine;
/** Il sabato scelto per il giro (null prima dell'avvio). Oggetto stabile: va bene con Object.is. */
export const selSabato = (s: EvidenziaState): Sabato | null => s.calendario?.proposti[s.sabato] ?? null;
/** Il sabato della pagina (testata e piede); null nel prerender: si stampa DATA_PRERENDER. */
export const selSabatoTestata = (s: EvidenziaState): Sabato | null => s.calendario?.testata ?? null;
export const selReducedMotion = (s: EvidenziaState): boolean => s.reducedMotion;
/** Il giro è cambiato dopo l'invio ("Cambiato dopo l'invio", "Mandalo di nuovo"). */
export const selCambiatoDopoInvio = (s: EvidenziaState): boolean =>
  s.mandato !== null && improntaDi(s) !== s.mandato.impronta;

/** `useEvidenzia(selSegnato(id))`: il selettore è nuovo a ogni render, ma il valore è un booleano. */
export function selSegnato(id: IdAnnuncio): (s: EvidenziaState) => boolean {
  return (s) => s.segnati.includes(id);
}

/* ------------------------------------------------------------------ avvio */

/** true dopo un avvio che ha cambiato il giro rispetto alla memoria (vedi `salvaAvvio`). */
let daSalvareAllAvvio = false;

export interface IngressiStore {
  /** location.search */
  search: string;
  /** location.hash ("#scheda-214", "#giro") */
  hash?: string;
  reducedMotion: boolean;
  layout: Layout;
  /** solo test: l'istante "adesso" (default new Date()) */
  adesso?: Date;
}

/** Rif. di `?segna=214,229` (anche "rif-214"), esistenti e senza doppioni, al massimo MAX_GIRO. */
function segnatiDaUrl(valore: string | null): IdAnnuncio[] {
  if (valore === null) return [];
  const ids: IdAnnuncio[] = [];
  for (const parte of valore.split(',')) {
    const id = idDaRif(parte);
    if (id !== undefined && !ids.includes(id)) ids.push(id);
    if (ids.length >= MAX_GIRO) break;
  }
  return ids;
}

/**
 * Solo Evidenzia.tsx, nell'inizializzatore di useState (prima del primo
 * render delle sezioni). Ordine: memoria (`evidenzia:giro`), poi `?segna=`
 * solo se la memoria è vuota, poi gli altri parametri e l'hash.
 */
export function inizializzaStore(o: IngressiStore): EvidenziaState {
  cambioInAttesa = null;
  const q = new URLSearchParams(o.search);
  const simula: Simula = {
    invioKo: q.get('invio') === 'ko',
    mappaKo: q.get('mappa') === 'ko',
    oggi: leggiOggiFinto(o.search),
  };
  const cal = calendario(adessoRoma(simula.oggi, o.adesso));
  const salvato = leggiJSON(CHIAVI.giro, eGiroSalvato);

  // annunci segnati: memoria, poi ?segna=
  let segnati: IdAnnuncio[] = [];
  let sparite = 0;
  if (salvato !== null) {
    for (const id of salvato.segnati) {
      if (annuncioDa(id) !== undefined && !segnati.includes(id)) segnati.push(id);
      else if (annuncioDa(id) === undefined) sparite += 1;
    }
    segnati = segnati.slice(0, MAX_GIRO);
  }
  let daUrl = 0;
  if (segnati.length === 0) {
    const daParametro = segnatiDaUrl(q.get('segna'));
    if (daParametro.length > 0) {
      segnati = daParametro;
      daUrl = daParametro.length;
    }
  }

  // sabato salvato: uno dei due proposti, oppure passato
  let sabato: 0 | 1 = 0;
  let sabatoPassato: string | null = null;
  const iso = salvato?.sabato ?? null;
  if (iso !== null && giornoDa(iso) !== null) {
    if (iso === cal.proposti[1].iso) sabato = 1;
    else if (iso < cal.oggi.iso) sabatoPassato = iso;
  }
  const mandato = salvato?.mandato !== undefined && salvato.mandato !== null && salvato.mandato.sabato >= cal.oggi.iso
    ? salvato.mandato
    : null;

  // livelli aperti dall'URL
  const hash = (o.hash ?? '').replace(/^#/, '');
  let schedaAperta: IdAnnuncio | null = null;
  const schedaParam = q.get('scheda');
  if (schedaParam !== null) schedaAperta = idDaRif(schedaParam) ?? null;
  if (hash.startsWith('scheda-')) schedaAperta = idDaRif(hash.slice('scheda-'.length)) ?? schedaAperta;
  const giroAperto = schedaAperta === null && (q.get('giro') === '1' || hash === 'giro');

  stato = {
    ...statoNeutro(),
    segnati,
    ordine: ordineCoerente(salvato?.ordine ?? null, segnati),
    partenza: salvato?.partenza ?? '09:00',
    daAgenzia: salvato?.daAgenzia ?? true,
    sabato,
    calendario: cal,
    sabatoPassato,
    sparite,
    vista: q.get('vista') === 'intera' && o.layout === 'foglio' ? 'intera' : 'leggi',
    layout: o.layout,
    schedaAperta,
    giroAperto,
    aperturaDaUrl: schedaAperta !== null || giroAperto,
    mandato,
    daUrl,
    reducedMotion: o.reducedMotion,
    simula,
  };
  // la memoria si riscrive dopo il montaggio (`salvaAvvio`), non qui: in
  // sviluppo StrictMode chiama due volte l'inizializzatore di useState, e la
  // seconda chiamata non deve trovare già salvato il giro arrivato da ?segna=
  daSalvareAllAvvio = daUrl > 0 || sparite > 0 || (salvato !== null && salvato.mandato !== mandato);
  avvisa();
  return stato;
}

/** Solo Evidenzia.tsx, in un effetto di montaggio: salva il giro ripulito o arrivato da `?segna=`. */
export function salvaAvvio(): void {
  if (!daSalvareAllAvvio) return;
  daSalvareAllAvvio = false;
  salva();
}
