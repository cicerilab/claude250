/**
 * BATTIFILO · attività dell'utente e origine dell'ultimo spostamento del tempo
 * (interaction-designer).
 *
 * - `segnaInput()`: aggiorna `runtime.ultimoInput`. La chiamano tutti gli
 *   input di questa cartella a ogni gesto vero.
 * - `segnaSpostamento(origine)`: un gesto dell'utente ha chiesto di muovere il
 *   tempo (trascinamento, tasto, tacca, rotella, swipe, mese prima/dopo, clic
 *   sulla linea). Serve a due cose:
 *   1. far sparire l'istruzione "Tira il filo per far passare i mesi" al primo
 *      spostamento reale, qualunque sia il modo (ux-architect §5.1). La battuta
 *      automatica d'apertura e l'arrivo da `?mese=` NON passano di qui: non
 *      sono gesti dell'utente;
 *   2. dire a `useCassetta.ts` da dove è venuto l'ultimo spostamento, perché
 *      l'annuncio `aria-live` si fa solo se il cambio non viene dallo slider a
 *      fuoco (lì parla già `aria-valuetext`; ux-architect §5.3.5).
 * - `ascoltaAttivita(bersaglio)`: ascoltatori passivi in cattura sulla radice,
 *   così anche scrivere nei campi di Misura o scorrere Tutti i mesi conta come
 *   attività. Lo monta `Battifilo.tsx` (richiesta allo scaffold).
 *
 * Nessun accesso a window o document a livello di modulo: il Set degli
 * ascoltatori è un oggetto JS puro, svuotato da `azzeraAttivita()` al mount.
 */

import { runtime } from '../state/runtime';

/** Da dove arriva la richiesta di muovere il tempo. */
export type OrigineSpostamento =
  | 'trascina' // la cassetta o il nastro presi col puntatore
  | 'tastiera' // tasti dello slider a fuoco
  | 'tacca' // tocco, clic o Invio su una tacca
  | 'linea' // clic sulla linea fuori dalle tacche (tacca più vicina)
  | 'passo' // bottoni "mese prima" / "mese dopo"
  | 'rotella' // rotella o trackpad a scatti
  | 'swipe'; // swipe sulla foto o sulla lastra

type Ascoltatore = (origine: OrigineSpostamento) => void;

const ascoltatori = new Set<Ascoltatore>();
let ultima: OrigineSpostamento | null = null;
let quando = Number.NEGATIVE_INFINITY;

/** Aggiorna l'istante dell'ultimo input dell'utente. */
export function segnaInput(): void {
  runtime.ultimoInput = performance.now();
}

/** Millisecondi trascorsi dall'ultimo input (Infinity se non c'è mai stato). */
export function inattivoDa(now: number = performance.now()): number {
  if (!runtime.ultimoInput) return Number.POSITIVE_INFINITY;
  return Math.max(0, now - runtime.ultimoInput);
}

/**
 * Un gesto dell'utente ha chiesto di muovere il tempo. Da chiamare PRIMA di
 * comandare la cassetta (`vaA`, `passo`, `trascina`), così chi riceve
 * `fermaTappa` sa già da dove viene.
 */
export function segnaSpostamento(origine: OrigineSpostamento): void {
  segnaInput();
  ultima = origine;
  quando = performance.now();
  for (const fn of Array.from(ascoltatori)) fn(origine);
}

/**
 * Origine dell'ultimo spostamento se è più recente di `entroMs` (default 3 s:
 * copre volo di 500 ms, battuta e sosta), altrimenti `null`. `null` vuol dire
 * "non è stato un gesto": apertura automatica, URL, popstate.
 */
export function ultimaOrigine(entroMs = 3000, now: number = performance.now()): OrigineSpostamento | null {
  if (ultima === null || now - quando > entroMs) return null;
  return ultima;
}

/**
 * Vero se l'annuncio `aria-live` della fase va fatto: il cambio non viene
 * dallo slider a fuoco (ux-architect §5.3.5). Il trascinamento conta come
 * slider solo se la cassetta ha il fuoco (la presa col puntatore la mette a
 * fuoco: vedi trascina.ts `focusSu`).
 */
export function annunciaCambio(sliderAFuoco: boolean, now: number = performance.now()): boolean {
  const o = ultimaOrigine(3000, now);
  if (o === null) return false;
  if ((o === 'tastiera' || o === 'trascina') && sliderAFuoco) return false;
  return true;
}

/** Ascolta ogni spostamento chiesto dall'utente. Restituisce la rimozione. */
export function ascoltaSpostamenti(fn: Ascoltatore): () => void {
  ascoltatori.add(fn);
  return () => {
    ascoltatori.delete(fn);
  };
}

/**
 * Chiama `fn` una volta sola, al primo spostamento dell'utente (per
 * `Istruzione.tsx` → `store.segnaIstruzione()`). Restituisce la rimozione.
 */
export function alPrimoSpostamento(fn: (origine: OrigineSpostamento) => void): () => void {
  const una: Ascoltatore = (origine) => {
    ascoltatori.delete(una);
    fn(origine);
  };
  ascoltatori.add(una);
  return () => {
    ascoltatori.delete(una);
  };
}

/** Al mount di `Battifilo.tsx`: dimentica l'origine della visita precedente. */
export function azzeraAttivita(): void {
  ultima = null;
  quando = Number.NEGATIVE_INFINITY;
}

const EVENTI_ATTIVITA = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input'] as const;

/**
 * Segna come attività qualunque gesto dentro `bersaglio` (di solito
 * `.btf-root`). Ascoltatori passivi in cattura: non bloccano niente e arrivano
 * prima di quelli delle sezioni. Restituisce la funzione di pulizia.
 */
export function ascoltaAttivita(bersaglio: EventTarget): () => void {
  const opzioni: AddEventListenerOptions = { capture: true, passive: true };
  const gestisci = (): void => segnaInput();
  for (const tipo of EVENTI_ATTIVITA) bersaglio.addEventListener(tipo, gestisci, opzioni);
  return () => {
    for (const tipo of EVENTI_ATTIVITA) bersaglio.removeEventListener(tipo, gestisci, opzioni);
  };
}
