/**
 * IMPRONTA · store dei valori lenti (tech-architect §6.1, motion-designer
 * §4.3, interaction-designer §11.3, copywriter §9).
 *
 * Piccolo store esterno senza librerie, letto con `useSyncExternalStore` e un
 * selettore: un componente si ri-renderizza solo quando cambia la fetta che
 * usa. I valori caldi (luce, scroll, pressioni) NON stanno qui: sono in
 * `state/runtime.ts`.
 *
 * Semantica:
 * - `store.set` e le azioni sono SINCRONE: dopo la chiamata `store.get()`
 *   riflette il cambio, e gli abbonati sono già stati avvisati.
 * - Lo store è un singleton di modulo, ma `inizializzaStore()` lo rifà da capo
 *   al mount di Impronta.tsx (leggendo la memoria del browser e l'URL): così
 *   navigare via e tornare nel sito vero non lascia stati sporchi.
 * - Le sezioni chiamano le AZIONI, non `store.set` (eccezioni: `cartaWave`,
 *   scritto da interaction/paperWave.ts, e i campi di sistema scritti da
 *   Impronta.tsx).
 *
 * Nessun accesso al browser a livello di modulo: lo stato iniziale del
 * modulo è neutro (Citrino, niente bozza) e va bene anche per il prerender.
 */

import { useRef, useSyncExternalStore } from 'react';
import type { Carta, Legatura, Prodotto, Quando, Tecnica } from '../content/prezzi';
import { LEGATURA_DEFAULT, TIRATURA_DEFAULT, TIRATURE } from '../content/prezzi';
import { CAMPI_TESTO, TECNICHE } from '../content/testi';
import { annullaRimandato, CHIAVI, leggi, leggiJSON, rimuovi, scrivi, scriviJSON, scriviJSONRimandato } from './persist';

/* ------------------------------------------------------------------ tipi */

/** I tipi di dominio sono quelli di content/prezzi.ts (copywriter): una sola fonte. */
export type { Carta, Legatura, Prodotto, Quando, Tecnica };

export const CARTE_VALIDE: readonly Carta[] = ['citrino', 'cotone', 'cipria', 'grafite'];
export const PRODOTTI_VALIDI: readonly Prodotto[] = ['biglietto', 'partecipazione', 'intestata', 'libro'];
export const TECNICHE_VALIDE: readonly Tecnica[] = ['secco', 'colore', 'lamina'];
export const LEGATURE_VALIDE: readonly Legatura[] = ['brossura', 'cartonato', 'giapponese', 'punto'];
export const QUANDO_VALIDI: readonly Quando[] = ['quindici', 'mese', 'avanti'];

/** Onda di cambio carta in corso (la scrive interaction/paperWave.ts). */
export interface CartaWave {
  x: number;
  y: number;
  from: Carta;
  to: Carta;
  /** performance.now() dell'inizio. */
  t0: number;
}

/** La prova del banco. Il contatto NON sta qui (non si salva mai). */
export interface Prova {
  prodotto: Prodotto;
  /** Chiavi da CAMPI_TESTO[prodotto] (content/testi.ts). Vuoto = testo di esempio. */
  campi: Record<string, string>;
  tecnica: Tecnica;
  taglioColorato: boolean;
  tiratura: number;
  /** Solo per il prodotto "libro" (copywriter §9). */
  legatura: Legatura;
  /** Campo facoltativo "Quando ti serve": null = non scelto. */
  quando: Quando | null;
}

export type StatoInvio = 'idle' | 'holding' | 'sending' | 'sent' | 'error';
export type StatoGL = 'pending' | 'on' | 'off';

export interface ImprontaState {
  /** Carta del sito. Persistita (localStorage 'impronta:carta'). */
  carta: Carta;
  cartaWave: CartaWave | null;
  prova: Prova;
  /** true se all'avvio c'era una bozza salvata (stato "Bozza ritrovata" del banco). */
  bozzaRitrovata: boolean;
  /** Testo premuto dopo l'invio, mostrato nell'hero (localStorage 'impronta:inviata'). */
  testoCliente: string | null;
  invio: StatoInvio;
  /** Stato del WebGL, riflesso su `.imp-root[data-gl]`. */
  gl: StatoGL;
  /** Perché il GL è spento (diagnostica), o null. */
  glMotivo: string | null;
  /** `prefers-reduced-motion`, giusto già al primo render lato client. */
  reducedMotion: boolean;
  /** `?invio=ko` nell'URL: l'invio simulato del banco deve fallire (QA). */
  simulaErroreInvio: boolean;
}

export type PatchStato = Partial<ImprontaState> | ((s: ImprontaState) => Partial<ImprontaState>);

/** Patch della prova: `campi` si FONDE con quelli esistenti (non li sostituisce). */
export type PatchProva = Partial<Omit<Prova, 'campi'>> & { campi?: Record<string, string> };

/* ------------------------------------------------------------------ validazione */

function eUno<T extends string>(valori: readonly T[], v: unknown): v is T {
  return typeof v === 'string' && (valori as readonly string[]).includes(v);
}

export function eCarta(v: unknown): v is Carta {
  return eUno(CARTE_VALIDE, v);
}

export function eProdotto(v: unknown): v is Prodotto {
  return eUno(PRODOTTI_VALIDI, v);
}

function tiratureDi(prodotto: Prodotto): readonly number[] {
  return TIRATURE[prodotto] as readonly number[];
}

/** Tiratura valida per il prodotto, o quella di partenza del prodotto. */
export function tiraturaValida(prodotto: Prodotto, tiratura: number): number {
  return tiratureDi(prodotto).includes(tiratura) ? tiratura : TIRATURA_DEFAULT[prodotto];
}

function eRecordStringhe(v: unknown): v is Record<string, string> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  return Object.values(v).every((x) => typeof x === 'string');
}

interface BozzaSalvata {
  prodotto: Prodotto;
  campi: Record<string, string>;
  tecnica: Tecnica;
  taglioColorato: boolean;
  tiratura: number;
  legatura: Legatura;
  quando: Quando | null;
}

function eBozza(v: unknown): v is BozzaSalvata {
  if (typeof v !== 'object' || v === null) return false;
  const b = v as Record<string, unknown>;
  return (
    eProdotto(b.prodotto) &&
    eRecordStringhe(b.campi) &&
    eUno(TECNICHE_VALIDE, b.tecnica) &&
    typeof b.taglioColorato === 'boolean' &&
    typeof b.tiratura === 'number' &&
    eUno(LEGATURE_VALIDE, b.legatura) &&
    (b.quando === null || eUno(QUANDO_VALIDI, b.quando))
  );
}

interface InviataSalvata {
  testo: string;
}

function eInviata(v: unknown): v is InviataSalvata {
  return typeof v === 'object' && v !== null && typeof (v as Record<string, unknown>).testo === 'string';
}

/* ------------------------------------------------------------------ valori iniziali */

/** Prova di partenza (nessuna bozza): biglietto a secco, tiratura del prodotto. */
export function provaIniziale(prodotto: Prodotto = 'biglietto'): Prova {
  return {
    prodotto,
    campi: {},
    tecnica: 'secco',
    taglioColorato: false,
    tiratura: TIRATURA_DEFAULT[prodotto],
    legatura: LEGATURA_DEFAULT,
    quando: null,
  };
}

function statoIniziale(): ImprontaState {
  return {
    carta: 'citrino',
    cartaWave: null,
    prova: provaIniziale(),
    bozzaRitrovata: false,
    testoCliente: null,
    invio: 'idle',
    gl: 'pending',
    glMotivo: null,
    reducedMotion: false,
    simulaErroreInvio: false,
  };
}

/* ------------------------------------------------------------------ nucleo */

let stato: ImprontaState = statoIniziale();
const ascoltatori = new Set<() => void>();

function avvisa(): void {
  for (const fn of [...ascoltatori]) fn();
}

function cambiato(patch: Partial<ImprontaState>): boolean {
  for (const chiave of Object.keys(patch) as (keyof ImprontaState)[]) {
    if (!Object.is(patch[chiave], stato[chiave])) return true;
  }
  return false;
}

export const store = {
  get(): ImprontaState {
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
  stato: ImprontaState;
  selettore: (s: ImprontaState) => T;
  valore: T;
}

function subscribeStore(fn: () => void): () => void {
  return store.subscribe(fn);
}

/**
 * Legge una fetta dello store. Ri-renderizza solo quando la fetta cambia
 * secondo `isEqual` (default `Object.is`). Il selettore può essere una
 * funzione inline: se restituisce un oggetto nuovo ma uguale per `isEqual`,
 * il valore precedente viene riusato.
 */
export function useImpronta<T>(selector: (s: ImprontaState) => T, isEqual: (a: T, b: T) => boolean = Object.is): T {
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

/* ------------------------------------------------------------------ URL e avvio */

export interface ParametriUrl {
  /** `?carta=`: vince sulla memoria solo alla prima visita. */
  carta: Carta | null;
  /** `?prova=`: preseleziona "Cosa stampi". */
  prodotto: Prodotto | null;
  /** `?invio=ko`: l'invio simulato fallisce. */
  invioKo: boolean;
}

export function leggiParametriUrl(search: string): ParametriUrl {
  const q = new URLSearchParams(search);
  const carta = q.get('carta');
  const prodotto = q.get('prova');
  return {
    carta: eCarta(carta) ? carta : null,
    prodotto: eProdotto(prodotto) ? prodotto : null,
    invioKo: q.get('invio') === 'ko',
  };
}

export interface OpzioniAvvio {
  /** `location.search`. */
  search: string;
  /** `prefers-reduced-motion` adesso. */
  reducedMotion: boolean;
  /** `prefers-color-scheme: dark` adesso (carta della prima visita). */
  scuro: boolean;
}

let cartaDiPartenza: Carta = 'citrino';

/** Carta della prima visita: Grafite se il sistema è scuro, altrimenti Citrino (ux-architect §1). */
export function cartaPredefinita(): Carta {
  return cartaDiPartenza;
}

/**
 * Rifà lo store da capo: memoria del browser + URL. La chiama Impronta.tsx
 * nell'inizializzatore di `useState`, prima che le sezioni si renderizzino,
 * così `carta` e `reducedMotion` sono giusti al primo render (niente salti).
 * Idempotente: chiamarla due volte (StrictMode) dà lo stesso stato.
 */
export function inizializzaStore({ search, reducedMotion, scuro }: OpzioniAvvio): ImprontaState {
  const url = leggiParametriUrl(search);
  cartaDiPartenza = scuro ? 'grafite' : 'citrino';

  const salvata = leggi(CHIAVI.carta);
  let carta: Carta;
  if (eCarta(salvata)) {
    carta = salvata;
  } else if (url.carta !== null) {
    carta = url.carta;
    scrivi(CHIAVI.carta, url.carta);
  } else {
    carta = cartaDiPartenza;
  }

  const bozza = leggiJSON(CHIAVI.bozza, eBozza);
  let prova: Prova;
  if (bozza !== null) {
    prova = {
      prodotto: bozza.prodotto,
      campi: { ...bozza.campi },
      tecnica: bozza.tecnica,
      taglioColorato: bozza.taglioColorato,
      tiratura: tiraturaValida(bozza.prodotto, bozza.tiratura),
      legatura: bozza.legatura,
      quando: bozza.quando,
    };
  } else {
    prova = provaIniziale();
  }
  if (url.prodotto !== null && url.prodotto !== prova.prodotto) {
    prova = { ...prova, prodotto: url.prodotto, tiratura: tiraturaValida(url.prodotto, prova.tiratura) };
  }

  const inviata = leggiJSON(CHIAVI.inviata, eInviata);
  const testo = inviata?.testo.trim() ?? '';

  const nuovo: ImprontaState = {
    carta,
    cartaWave: null,
    prova,
    bozzaRitrovata: bozza !== null,
    testoCliente: testo.length > 0 ? testo : null,
    invio: 'idle',
    gl: 'pending',
    glMotivo: null,
    reducedMotion,
    simulaErroreInvio: url.invioKo,
  };
  stato = nuovo;
  if (ascoltatori.size > 0) avvisa();
  return nuovo;
}

/* ------------------------------------------------------------------ azioni */

/**
 * Cambia la carta del sito e la salva. NON anima: l'onda è di
 * interaction/paperWave.ts (`cambiaCarta`), che chiama questa al momento
 * dello scambio. `origine` resta nella firma per chi la passa (analytics).
 */
export function scegliCarta(carta: Carta, origine?: { x: number; y: number }): void {
  void origine;
  scrivi(CHIAVI.carta, carta);
  store.set({ carta });
}

function salvaBozza(prova: Prova): void {
  const bozza: BozzaSalvata = {
    prodotto: prova.prodotto,
    campi: prova.campi,
    tecnica: prova.tecnica,
    taglioColorato: prova.taglioColorato,
    tiratura: prova.tiratura,
    legatura: prova.legatura,
    quando: prova.quando,
  };
  scriviJSONRimandato(CHIAVI.bozza, bozza);
}

/**
 * Aggiorna la prova del banco e salva la bozza (rimandata di 300 ms, mai il
 * contatto). `campi` si fonde con i campi esistenti. Se cambia il prodotto e
 * la tiratura non vale per il nuovo prodotto, torna quella di partenza.
 */
export function aggiornaProva(patch: PatchProva): void {
  const prima = stato.prova;
  const { campi, ...resto } = patch;
  const prodotto = resto.prodotto ?? prima.prodotto;
  const tiratura = tiraturaValida(prodotto, resto.tiratura ?? prima.tiratura);
  const prova: Prova = {
    ...prima,
    ...resto,
    prodotto,
    tiratura,
    campi: campi !== undefined ? { ...prima.campi, ...campi } : prima.campi,
  };
  store.set({ prova });
  salvaBozza(prova);
}

/** Stato della leva e dell'invio (section-builder-banco). */
export function impostaInvio(invio: StatoInvio): void {
  store.set({ invio });
}

/** Testo di default per l'hero: il primo campo scritto della prova, o null. */
export function testoDallaProva(prova: Prova): string | null {
  for (const campo of CAMPI_TESTO[prova.prodotto]) {
    const v = prova.campi[campo.chiave]?.trim() ?? '';
    if (v.length > 0) return v;
  }
  return null;
}

/**
 * Dopo l'invio riuscito: il testo del cliente torna nell'hero (ux-architect
 * 5.1) e resta salvato. Senza argomento usa il primo campo scritto della
 * prova; il banco può passare il testo esatto da premere.
 */
export function confermaTestoCliente(testo?: string): void {
  const t = (testo ?? testoDallaProva(stato.prova) ?? '').trim();
  if (t.length === 0) return;
  scriviJSON(CHIAVI.inviata, { testo: t } satisfies InviataSalvata);
  store.set({ testoCliente: t });
}

/**
 * "Prova un'altra cosa" / "Ricomincia" del banco: reset leggero. La prova
 * torna quella di partenza (stesso prodotto), la bozza salvata sparisce,
 * carta e testo dell'hero restano.
 */
export function svuotaBozza(): void {
  annullaRimandato(CHIAVI.bozza);
  rimuovi(CHIAVI.bozza);
  store.set({ prova: provaIniziale(stato.prova.prodotto), bozzaRitrovata: false, invio: 'idle' });
}

/**
 * "Ricomincia da capo" del colophon: svuota carta, bozza e testo premuto.
 * La carta torna quella della prima visita (`cartaPredefinita()`): chi vuole
 * l'onda chiama prima `cambiaCarta(cartaPredefinita(), …)` di paperWave.ts.
 */
export function ricominciaDaCapo(): void {
  annullaRimandato(CHIAVI.bozza);
  rimuovi(CHIAVI.bozza);
  rimuovi(CHIAVI.inviata);
  rimuovi(CHIAVI.carta);
  store.set({
    carta: cartaDiPartenza,
    prova: provaIniziale(),
    bozzaRitrovata: false,
    testoCliente: null,
    invio: 'idle',
  });
}

/** Stato del WebGL (Impronta.tsx per 'off', lo shader-engineer per 'on' e per lo spegnimento). */
export function impostaGL(gl: StatoGL, motivo: string | null = null): void {
  store.set({ gl, glMotivo: gl === 'off' ? motivo : null });
}

/* ------------------------------------------------------------------ selettori */

/**
 * La parola campione delle Tecniche (tech-architect §6.1):
 * testo del cliente ?? primo campo scritto della prova ?? "Pordenone".
 */
export function selParolaCampione(s: ImprontaState): string {
  return s.testoCliente ?? testoDallaProva(s.prova) ?? TECNICHE.parolaCampione;
}

export function selCarta(s: ImprontaState): Carta {
  return s.carta;
}

export function selReducedMotion(s: ImprontaState): boolean {
  return s.reducedMotion;
}

export function selGL(s: ImprontaState): StatoGL {
  return s.gl;
}
