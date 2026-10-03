/**
 * SOTTOSCOCCA · store dei valori lenti (tech-architect §6.1, copywriter
 * "Richieste allo scaffold", interaction-designer, ux-architect §1.1-1.2).
 *
 * Piccolo store esterno senza librerie, letto con `useSyncExternalStore` e un
 * selettore: un componente si ri-renderizza solo quando cambia la fetta che
 * usa. I valori caldi (quota, scroll, punti) NON stanno qui: `state/runtime.ts`.
 *
 * Semantica:
 * - `store.set` e le azioni sono SINCRONE: dopo la chiamata `store.get()`
 *   riflette il cambio e gli abbonati sono già stati avvisati;
 * - singleton di modulo, ma `inizializzaStore()` lo rifà da capo al mount di
 *   Radice.tsx (memoria del browser + URL): navigare via e tornare nel sito
 *   vero non lascia stati sporchi;
 * - le sezioni chiamano le AZIONI, mai `store.set`. Chi scrive cosa:
 *   `schedaAperta` solo Punti/ via interaction/useScheda.ts; `quotaPlateau` e
 *   `sezione` solo ponte/quota.ts; `gl`/`glMotivo` Radice e shader-engineer;
 *   `reducedMotion`, `bassa` solo Radice; `modoAsta` solo PonteLibero.
 * - nome, telefono, targa e nota NON entrano mai qui né nella memoria
 *   (stato locale di PonteLibero/Dati.tsx).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useRef, useSyncExternalStore } from 'react';
import type { IdLavoro, IdPunto, Ponte, Quota } from '../content/lavori';
import { durataMinuti, esclusoDa, LAVORI, normalizzaDeposito, pontiAdatti } from '../content/lavori';
import { etichettaLavoro } from '../content/testi';
import { annullaRimandato, CHIAVI, leggiJSON, rimuovi, scriviJSON, scriviJSONRimandato } from './persist';

/* ------------------------------------------------------------------ tipi */

export type { IdLavoro, IdPunto, Ponte, Quota };

export type IdStazione = 'inizio' | 'gomme' | 'freni' | 'sottoscocca' | 'deposito' | 'ponte-libero';
export type IdSezione = IdStazione | 'officina' | 'piede';

export const STAZIONI_ID: readonly IdStazione[] = ['inizio', 'gomme', 'freni', 'sottoscocca', 'deposito', 'ponte-libero'];
export const SEZIONI_ID: readonly IdSezione[] = [...STAZIONI_ID, 'officina', 'piede'];
export const LAVORI_VALIDI: readonly IdLavoro[] = [
  'gomme-stagionali',
  'gomme-deposito',
  'convergenza',
  'pastiglie',
  'pastiglie-dischi',
  'ammortizzatori',
  'tagliando',
  'scarico',
];
export const QUOTE_VALIDE: readonly Quota[] = [0, 20, 80, 180];

export type OrigineScheda = 'scena' | 'elenco';

export interface SchedaAperta {
  readonly punto: IdPunto;
  readonly origine: OrigineScheda;
}

/** Dove sta il blocco nel planning. */
export interface Posizione {
  /** 'YYYY-MM-DD' */
  readonly giorno: string;
  readonly ponte: Ponte;
  /** Minuti da mezzanotte. */
  readonly inizio: number;
}

/** Prenotazione riuscita (localStorage): tacca "il tuo ponte" e blocco pieno. */
export interface Confermata extends Posizione {
  readonly fine: number;
  readonly lavori: readonly IdLavoro[];
  readonly numeroDeposito: string | null;
}

export interface Deposito {
  /** Risposta alla domanda "le gomme sono già da noi?": null = non risposto. */
  readonly gia: boolean | null;
  /** Numero del cartellino nel formato 'D-214' (o come lo scrive l'utente). */
  readonly numero: string;
}

export type StatoInvio = 'idle' | 'sending' | 'sent' | 'error';
export type StatoGL = 'pending' | 'on' | 'off';
export type ModoAsta = 'quota' | 'ore';

export interface SottoscoccaState {
  /** Ultima quota di plateau raggiunta (aria-current, aria-live, data-quota). */
  quotaPlateau: Quota;
  /** Sezione che contiene la linea di lettura della finestra. */
  sezione: IdSezione;
  schedaAperta: SchedaAperta | null;
  /** "Il tuo lavoro": ordine di aggiunta, senza doppioni. */
  lavori: readonly IdLavoro[];
  deposito: Deposito;
  /** null = blocco parcheggiato. */
  posizione: Posizione | null;
  invio: StatoInvio;
  confermata: Confermata | null;
  modoAsta: ModoAsta;
  gl: StatoGL;
  glMotivo: string | null;
  reducedMotion: boolean;
  /** Finestra sotto 520 px di altezza (ux §7.10): niente pin, niente fissi. */
  bassa: boolean;
  /** `?giorno=AAAA-MM-GG` (ux §1.1): giorno da preselezionare, se è tra i mostrati. */
  giornoRichiesto: string | null;
  /** `?invio=ko` (o `?invio=errore`): l'invio simulato deve fallire. */
  simulaErroreInvio: boolean;
  /**
   * `?fermo=0|20|80|180` (tech-architect §8.4): scena ferma al plateau, DOM
   * nascosto, per `npm run fermi`. Lo legge lo shader-engineer.
   */
  fermo: Quota | null;
}

export type PatchStato = Partial<SottoscoccaState> | ((s: SottoscoccaState) => Partial<SottoscoccaState>);

/* ------------------------------------------------------------------ validazione */

function eUno<T extends string | number>(valori: readonly T[], v: unknown): v is T {
  return (typeof v === 'string' || typeof v === 'number') && (valori as readonly (string | number)[]).includes(v);
}

export function eLavoro(v: unknown): v is IdLavoro {
  return eUno(LAVORI_VALIDI, v);
}

export function eQuota(v: unknown): v is Quota {
  return eUno(QUOTE_VALIDE, v);
}

export function ePonte(v: unknown): v is Ponte {
  return v === 1 || v === 2 || v === 3;
}

const GIORNO_ISO = /^\d{4}-\d{2}-\d{2}$/;

function eGiornoIso(v: unknown): v is string {
  return typeof v === 'string' && GIORNO_ISO.test(v);
}

function eElencoLavori(v: unknown): v is IdLavoro[] {
  return Array.isArray(v) && v.every(eLavoro);
}

function eDeposito(v: unknown): v is Deposito {
  if (typeof v !== 'object' || v === null) return false;
  const d = v as Record<string, unknown>;
  return (d.gia === null || typeof d.gia === 'boolean') && typeof d.numero === 'string';
}

function eConfermata(v: unknown): v is Confermata {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    eGiornoIso(c.giorno) &&
    ePonte(c.ponte) &&
    typeof c.inizio === 'number' &&
    typeof c.fine === 'number' &&
    eElencoLavori(c.lavori) &&
    (c.numeroDeposito === null || typeof c.numeroDeposito === 'string')
  );
}

/** Toglie i doppioni mantenendo l'ordine, e toglie i lavori esclusi da uno successivo. */
export function normalizzaLavori(ids: readonly IdLavoro[]): IdLavoro[] {
  const out: IdLavoro[] = [];
  for (const id of ids) {
    if (!eLavoro(id)) continue;
    const escluso = esclusoDa(id);
    const senza = out.filter((x) => x !== id && x !== escluso);
    senza.push(id);
    out.length = 0;
    out.push(...senza);
  }
  return out;
}

/* ------------------------------------------------------------------ stato */

const DEPOSITO_INIZIALE: Deposito = { gia: null, numero: '' };

export function statoIniziale(): SottoscoccaState {
  return {
    quotaPlateau: 0,
    sezione: 'inizio',
    schedaAperta: null,
    lavori: [],
    deposito: DEPOSITO_INIZIALE,
    posizione: null,
    invio: 'idle',
    confermata: null,
    modoAsta: 'quota',
    gl: 'pending',
    glMotivo: null,
    reducedMotion: false,
    bassa: false,
    giornoRichiesto: null,
    simulaErroreInvio: false,
    fermo: null,
  };
}

let stato: SottoscoccaState = statoIniziale();
const abbonati = new Set<() => void>();

function avvisa(): void {
  abbonati.forEach((fn) => fn());
}

function subscribeStore(fn: () => void): () => void {
  abbonati.add(fn);
  return () => {
    abbonati.delete(fn);
  };
}

function applica(patch: PatchStato): void {
  const p = typeof patch === 'function' ? patch(stato) : patch;
  let cambiato = false;
  for (const k of Object.keys(p) as (keyof SottoscoccaState)[]) {
    if (!Object.is(p[k], stato[k])) {
      cambiato = true;
      break;
    }
  }
  if (!cambiato) return;
  stato = { ...stato, ...p };
  avvisa();
}

export const store = {
  get(): SottoscoccaState {
    return stato;
  },
  /** Sincrono; niente avviso se nulla cambia. Le sezioni usano le azioni, non questo. */
  set(patch: PatchStato): void {
    applica(patch);
  },
  subscribe: subscribeStore,
};

interface CacheSelettore<T> {
  stato: SottoscoccaState;
  selettore: (s: SottoscoccaState) => T;
  valore: T;
}

/**
 * Legge una fetta dello store. Ri-renderizza solo quando la fetta cambia
 * secondo `isEqual` (default `Object.is`). Il selettore può essere inline;
 * se costruisce oggetti, passare `isEqual`.
 */
export function useSottoscocca<T>(
  selector: (s: SottoscoccaState) => T,
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

/* ------------------------------------------------------------------ memoria */

function salvaLavori(): void {
  scriviJSON(CHIAVI.lavori, stato.lavori, 'session');
}

function salvaDeposito(): void {
  scriviJSONRimandato(CHIAVI.deposito, stato.deposito, 300, 'session');
}

/* ------------------------------------------------------------------ azioni */

export function apriScheda(punto: IdPunto, origine: OrigineScheda): void {
  applica({ schedaAperta: { punto, origine } });
}

export function chiudiScheda(): void {
  applica({ schedaAperta: null });
}

/**
 * Aggiunge un lavoro (senza doppioni). Se nel gruppo esclusivo c'era l'altro
 * (`esclusoDa`), lo toglie e lo restituisce: chi aggiunge annuncia
 * `ANNUNCI.sostituito(nuovo, tolto, minuti)`. Restituisce null altrimenti.
 */
export function aggiungiLavoro(id: IdLavoro): IdLavoro | null {
  if (!eLavoro(id)) return null;
  const escluso = esclusoDa(id);
  const tolto = escluso !== null && stato.lavori.includes(escluso) ? escluso : null;
  if (stato.lavori.includes(id) && tolto === null) return null;
  const lavori = [...stato.lavori.filter((x) => x !== id && x !== tolto), id];
  const deposito: Deposito =
    id === 'gomme-deposito' && stato.deposito.gia !== true ? { ...stato.deposito, gia: true } : stato.deposito;
  applica({ lavori, deposito });
  salvaLavori();
  if (deposito !== stato.deposito) salvaDeposito();
  return tolto;
}

export function togliLavoro(id: IdLavoro): void {
  if (!stato.lavori.includes(id)) return;
  applica({ lavori: stato.lavori.filter((x) => x !== id) });
  salvaLavori();
}

export function impostaDeposito(patch: Partial<Deposito>): void {
  applica({ deposito: { ...stato.deposito, ...patch } });
  salvaDeposito();
}

/** Dove sta il blocco (null = parcheggiato). Non si salva. */
export function piazzaBlocco(posizione: Posizione | null): void {
  applica({ posizione });
}

export function impostaInvio(invio: StatoInvio): void {
  applica({ invio });
}

/** Successo dell'invio: la prenotazione resta in memoria (mai nome e telefono). */
export function conferma(confermata: Confermata): void {
  applica({ confermata, invio: 'sent' });
  scriviJSON(CHIAVI.confermata, confermata, 'local');
}

/** "Ricomincia da capo" (piede) e "Un altro lavoro": lavori, deposito, blocco, prenotazione. */
export function ricomincia(): void {
  annullaRimandato(CHIAVI.deposito);
  applica({
    lavori: [],
    deposito: DEPOSITO_INIZIALE,
    posizione: null,
    invio: 'idle',
    confermata: null,
    schedaAperta: null,
  });
  rimuovi(CHIAVI.lavori, 'session');
  rimuovi(CHIAVI.deposito, 'session');
  rimuovi(CHIAVI.confermata, 'local');
}

export function impostaModoAsta(modoAsta: ModoAsta): void {
  applica({ modoAsta });
}

export function impostaGL(gl: StatoGL, motivo: string | null = null): void {
  applica({ gl, glMotivo: gl === 'off' ? motivo : null });
}

/* ------------------------------------------------------------------ URL e avvio */

export interface ParametriUrl {
  /** `?lavori=` (tech) o `?lavoro=` (ux, con alias `gomme`, `dischi`), già normalizzati. */
  lavori: IdLavoro[];
  /** `?deposito=si` */
  depositoSi: boolean;
  /** `?giorno=AAAA-MM-GG` */
  giorno: string | null;
  /** `?invio=ko` o `?invio=errore` */
  invioKo: boolean;
  /** `?fermo=0|20|80|180` */
  fermo: Quota | null;
}

const ALIAS_LAVORI: Readonly<Record<string, IdLavoro>> = {
  gomme: 'gomme-stagionali',
  dischi: 'pastiglie-dischi',
};

export function leggiParametriUrl(search: string): ParametriUrl {
  const q = new URLSearchParams(search);
  const depositoSi = q.get('deposito') === 'si';
  const grezzo = `${q.get('lavori') ?? ''},${q.get('lavoro') ?? ''}`;
  const lavori: IdLavoro[] = [];
  for (const voce of grezzo.split(',')) {
    const v = voce.trim();
    if (v.length === 0) continue;
    let id: IdLavoro | null = eLavoro(v) ? v : (ALIAS_LAVORI[v] ?? null);
    if (id === 'gomme-stagionali' && depositoSi) id = 'gomme-deposito';
    if (id !== null) lavori.push(id);
  }
  const giorno = q.get('giorno');
  const invio = q.get('invio');
  const fermoGrezzo = q.get('fermo');
  const fermo = fermoGrezzo === null ? null : Number(fermoGrezzo);
  return {
    lavori: normalizzaLavori(lavori),
    depositoSi,
    giorno: eGiornoIso(giorno) ? giorno : null,
    invioKo: invio === 'ko' || invio === 'errore',
    fermo: eQuota(fermo) ? fermo : null,
  };
}

export interface OpzioniAvvio {
  readonly search: string;
  readonly reducedMotion: boolean;
  readonly bassa?: boolean;
}

/**
 * Solo Radice.tsx, prima del primo render: memoria del browser, poi URL
 * (i lavori dell'URL si AGGIUNGONO a quelli salvati, in coda).
 */
export function inizializzaStore({ search, reducedMotion, bassa = false }: OpzioniAvvio): SottoscoccaState {
  const base = statoIniziale();
  const url = leggiParametriUrl(search);
  const salvati = leggiJSON(CHIAVI.lavori, eElencoLavori, 'session') ?? [];
  const lavori = normalizzaLavori([...salvati, ...url.lavori]);
  const depositoSalvato = leggiJSON(CHIAVI.deposito, eDeposito, 'session');
  let deposito: Deposito = depositoSalvato ?? DEPOSITO_INIZIALE;
  if (url.depositoSi || lavori.includes('gomme-deposito')) deposito = { ...deposito, gia: true };
  if (deposito.numero.length > 0 && normalizzaDeposito(deposito.numero) !== null) {
    deposito = { ...deposito, numero: normalizzaDeposito(deposito.numero) as string };
  }
  const confermata = leggiJSON(CHIAVI.confermata, eConfermata, 'local');
  stato = {
    ...base,
    lavori,
    deposito,
    confermata,
    reducedMotion,
    bassa,
    giornoRichiesto: url.giorno,
    simulaErroreInvio: url.invioKo,
    fermo: url.fermo,
  };
  avvisa();
  return stato;
}

/* ------------------------------------------------------------------ selettori */

/** Minuti totali del blocco, con la regola "gomme già in deposito → 30'" (content/lavori.ts). */
export function selDurata(s: SottoscoccaState): number {
  return durataMinuti(s.lavori, s.deposito.gia);
}

/** Ponti adatti al blocco: `pontiAdatti` (mai un'intersezione). Vuoto se non c'è nessun lavoro. */
export function selPontiAdatti(s: SottoscoccaState): Ponte[] {
  return pontiAdatti(s.lavori);
}

/** "Tagliando + pastiglie · 2 h 30" (testi del copywriter). Vuota senza lavori. */
export function selEtichettaLavoro(s: SottoscoccaState): string {
  return s.lavori.length === 0 ? '' : etichettaLavoro(s.lavori, selDurata(s));
}

/** C'è un cambio gomme nel lavoro (fa comparire la domanda del deposito). */
export function selHaGomme(s: SottoscoccaState): boolean {
  return s.lavori.includes('gomme-stagionali') || s.lavori.includes('gomme-deposito');
}

/** Prezzo "da" totale del blocco (somma dei `prezzoDa`). */
export function selPrezzoDa(s: SottoscoccaState): number {
  return s.lavori.reduce((tot, id) => tot + LAVORI[id].prezzoDa, 0);
}

export function selQuotaPlateau(s: SottoscoccaState): Quota {
  return s.quotaPlateau;
}

export function selSezione(s: SottoscoccaState): IdSezione {
  return s.sezione;
}

export function selReducedMotion(s: SottoscoccaState): boolean {
  return s.reducedMotion;
}

export function selGL(s: SottoscoccaState): StatoGL {
  return s.gl;
}

export function selBassa(s: SottoscoccaState): boolean {
  return s.bassa;
}

export function selSchedaAperta(s: SottoscoccaState): SchedaAperta | null {
  return s.schedaAperta;
}

export function selLavori(s: SottoscoccaState): readonly IdLavoro[] {
  return s.lavori;
}

export function selFermo(s: SottoscoccaState): Quota | null {
  return s.fermo;
}

export function selModoAsta(s: SottoscoccaState): ModoAsta {
  return s.modoAsta;
}
