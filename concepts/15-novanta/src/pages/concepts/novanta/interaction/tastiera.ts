/**
 * NOVANTA · mappe dei tasti per i due `role="slider"` (interaction-designer).
 *
 * Funzioni pure: leggono il tasto e restituiscono un'azione, oppure `null` se
 * il tasto non riguarda lo slider. Chi le usa chiama `preventDefault()` solo
 * quando l'azione non è `null`; con Alt, Ctrl o Cmd premuti non si intercetta
 * mai niente (le scorciatoie del browser e del lettore di schermo restano).
 *
 * Braccio del goniometro (creative-director §4.3, ux-architect §6.2):
 *   → ↑ PagSu      +30° (angolo di contenuto successivo)
 *   ← ↓ PagGiù     -30°
 *   Maiusc + frecce ±1° (il contenuto segue l'angolo più vicino, niente aggancio)
 *   Home / Fine    0° / 180°
 *   Invio / Spazio entra nell'angolo (focus all'h2)            (aggiunta)
 *
 * Anello della settimana (ux-architect §6.5):
 *   → ↓            ora libera successiva
 *   ← ↑            ora libera precedente
 *   PagGiù / PagSu primo orario libero del giorno successivo / precedente
 *   Home / Fine    prima / ultima ora libera delle due settimane (aggiunta)
 *
 * Accetta sia il KeyboardEvent nativo sia quello di React (stessi campi).
 */

import { ANGOLI, limita } from '../dial/geometria';
import type { Angolo } from '../dial/geometria';

/** I campi del tasto che servono qui: vanno bene l'evento nativo e quello di React. */
export type TastoLetto = Pick<KeyboardEvent, 'key' | 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey'> & {
  isComposing?: boolean;
};

/** Passo tra due angoli di contenuto (creative-director §4.2). */
export const PASSO_ANGOLO = 30;
/** Passo fine con Maiuscole. */
export const PASSO_FINE = 1;

export type AzioneBraccio =
  | { tipo: 'passo'; gradi: number }
  | { tipo: 'vai'; g: number }
  | { tipo: 'entra' };

export type AzioneAnello =
  | { tipo: 'ora'; verso: 1 | -1 }
  | { tipo: 'giorno'; verso: 1 | -1 }
  | { tipo: 'estremo'; verso: 1 | -1 };

function conModificatori(e: TastoLetto): boolean {
  return e.altKey || e.ctrlKey || e.metaKey || e.isComposing === true;
}

/** Tasti dello slider del braccio. */
export function tastiBraccio(e: TastoLetto): AzioneBraccio | null {
  if (conModificatori(e)) return null;
  const passo = e.shiftKey ? PASSO_FINE : PASSO_ANGOLO;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return { tipo: 'passo', gradi: passo };
    case 'ArrowLeft':
    case 'ArrowDown':
      return { tipo: 'passo', gradi: -passo };
    case 'PageUp':
      return { tipo: 'passo', gradi: PASSO_ANGOLO };
    case 'PageDown':
      return { tipo: 'passo', gradi: -PASSO_ANGOLO };
    case 'Home':
      return { tipo: 'vai', g: 0 };
    case 'End':
      return { tipo: 'vai', g: 180 };
    case 'Enter':
    case ' ':
    case 'Spacebar':
      return e.shiftKey ? null : { tipo: 'entra' };
    default:
      return null;
  }
}

/** Tasti dello slider dell'anello della settimana. */
export function tastiAnello(e: TastoLetto): AzioneAnello | null {
  if (conModificatori(e)) return null;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return { tipo: 'ora', verso: 1 };
    case 'ArrowLeft':
    case 'ArrowUp':
      return { tipo: 'ora', verso: -1 };
    case 'PageDown':
      return { tipo: 'giorno', verso: 1 };
    case 'PageUp':
      return { tipo: 'giorno', verso: -1 };
    case 'Home':
      return { tipo: 'estremo', verso: -1 };
    case 'End':
      return { tipo: 'estremo', verso: 1 };
    default:
      return null;
  }
}

/** Tolleranza per considerare "già su un angolo" un valore con i decimali. */
const TOLLERANZA = 0.5;

/**
 * Angolo di contenuto successivo (verso 1) o precedente (verso -1) rispetto a
 * `g`, strettamente oltre. Da 47° in su si va a 60°, in giù a 30°. Ai bordi
 * resta 0° o 180°.
 */
export function prossimoAngolo(g: number, verso: 1 | -1): Angolo {
  const primo = ANGOLI[0];
  const ultimo = ANGOLI[ANGOLI.length - 1] ?? primo;
  if (verso > 0) {
    for (const a of ANGOLI) if (a > g + TOLLERANZA) return a;
    return ultimo;
  }
  for (let i = ANGOLI.length - 1; i >= 0; i -= 1) {
    const a = ANGOLI[i];
    if (a !== undefined && a < g - TOLLERANZA) return a;
  }
  return primo;
}

/**
 * Dove deve andare il braccio per un'azione da tastiera, partendo da `attuale`
 * (di solito `runtime.braccio.target`, così tre pressioni rapide sommano tre
 * angoli anche se il braccio è ancora in viaggio). `null` per `entra`.
 *
 * - passo ±30: prossimo angolo di contenuto nel verso (da 47° → 60° o 30°);
 * - passo ±1: un grado, limitato a 0..180, senza aggancio;
 * - vai: il valore.
 */
export function destinazioneBraccio(azione: AzioneBraccio, attuale: number): number | null {
  switch (azione.tipo) {
    case 'passo': {
      const verso: 1 | -1 = azione.gradi >= 0 ? 1 : -1;
      if (Math.abs(azione.gradi) >= PASSO_ANGOLO) return prossimoAngolo(attuale, verso);
      return limita(Math.round(attuale) + azione.gradi);
    }
    case 'vai':
      return limita(azione.g);
    case 'entra':
      return null;
  }
}

/** Vero se l'azione chiede un aggancio all'arrivo (tutti tranne il passo fine). */
export function azioneAggancia(azione: AzioneBraccio): boolean {
  return !(azione.tipo === 'passo' && Math.abs(azione.gradi) < PASSO_ANGOLO);
}
