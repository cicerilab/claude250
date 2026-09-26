/**
 * BATTIFILO · tasti dello slider del tempo e del gruppo delle tacche
 * (interaction-designer).
 *
 * Funzioni pure: leggono il tasto e restituiscono un'azione, oppure `null` se
 * il tasto non le riguarda. Chi le usa chiama `preventDefault()` solo quando
 * l'azione non è `null`. Con Alt, Ctrl o Cmd premuti non si intercetta mai
 * niente (restano le scorciatoie del browser e del lettore di schermo).
 *
 * Cassetta, `role="slider"` 0..15 (creative-director §4.6, ux-architect §6.4):
 *   → ↑            +1 (mese dopo)
 *   ← ↓            −1 (mese prima)
 *   PagSu / PagGiù ±3 (un trimestre di cantiere)
 *   Home / Fine    0 (PRIMA) / 15 (CHIAVI)
 *   Esc            durante un trascinamento lo annulla (lo gestisce trascina.ts)
 * Tasto tenuto premuto: un passo ogni 250 ms, la ripetizione più rapida del
 * sistema si ignora (`creaRipetizione`), così la foto non cambia più di due
 * volte al secondo nemmeno da tastiera (regola anti-lampeggio).
 *
 * Gruppo delle tacche, `<ol>` di `<button>` con tabindex mobile (ux-architect §6.5):
 *   → ↓            fuoco alla tacca dopo (senza cambiare mese, senza giro)
 *   ← ↑            fuoco alla tacca prima
 *   Home / Fine    fuoco alla prima / all'ultima
 *   Invio / Spazio li gestisce il `<button>` nativo (click → cassetta.vaA)
 *
 * Accetta sia il KeyboardEvent nativo sia quello di React (stessi campi).
 */

import { ULTIMA_TAPPA } from '../core/tempo';
import type { Tappa } from '../core/tempo';

/** I campi del tasto che servono: vanno bene l'evento nativo e quello di React. */
export type TastoLetto = Pick<KeyboardEvent, 'key' | 'altKey' | 'ctrlKey' | 'metaKey'> & {
  repeat?: boolean;
  isComposing?: boolean;
};

/** Passo di Pagina su / Pagina giù (creative-director §4.6). */
export const PASSO_PAGINA = 3;
/** Intervallo minimo tra due passi con il tasto tenuto premuto (ux-architect §6.4). */
export const RIPETIZIONE_MS = 250;

export type AzioneSlider = { tipo: 'passo'; delta: number } | { tipo: 'vai'; tappa: Tappa };

export type AzioneTacche = { tipo: 'fuoco'; indice: number };

function conModificatori(e: TastoLetto): boolean {
  return e.altKey || e.ctrlKey || e.metaKey || e.isComposing === true;
}

/** Tasti della cassetta (`role="slider"`). */
export function tastiSlider(e: TastoLetto): AzioneSlider | null {
  if (conModificatori(e)) return null;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return { tipo: 'passo', delta: 1 };
    case 'ArrowLeft':
    case 'ArrowDown':
      return { tipo: 'passo', delta: -1 };
    case 'PageUp':
      return { tipo: 'passo', delta: PASSO_PAGINA };
    case 'PageDown':
      return { tipo: 'passo', delta: -PASSO_PAGINA };
    case 'Home':
      return { tipo: 'vai', tappa: 0 };
    case 'End':
      return { tipo: 'vai', tappa: ULTIMA_TAPPA as Tappa };
    default:
      return null;
  }
}

/** Limita e arrotonda a una tappa valida. */
export function aTappa(v: number): Tappa {
  const n = Math.max(0, Math.min(ULTIMA_TAPPA, Math.round(v)));
  return n as Tappa;
}

/**
 * Dove deve andare la cassetta per un'azione da tastiera, partendo da
 * `attuale`. Usare `runtime.cassetta.target` (non `pos`): tre pressioni rapide
 * sommano tre mesi anche se la cassetta è ancora in volo verso il primo.
 */
export function destinazioneSlider(azione: AzioneSlider, attuale: number): Tappa {
  if (azione.tipo === 'vai') return azione.tappa;
  return aTappa(Math.round(attuale) + azione.delta);
}

/**
 * Filtro della ripetizione del tasto tenuto premuto. Restituisce una funzione
 * da chiamare a ogni `keydown` già riconosciuto: `true` = esegui, `false` =
 * ignora (ma chiama comunque `preventDefault`, se no la pagina scorre).
 * La prima pressione passa sempre; le ripetizioni una ogni `intervallo` ms.
 */
export function creaRipetizione(intervallo: number = RIPETIZIONE_MS): (e: TastoLetto, now?: number) => boolean {
  let ultimo = Number.NEGATIVE_INFINITY;
  return (e: TastoLetto, now: number = performance.now()): boolean => {
    if (!e.repeat) {
      ultimo = now;
      return true;
    }
    if (now - ultimo < intervallo) return false;
    ultimo = now;
    return true;
  };
}

/**
 * Tasti del gruppo delle tacche: sposta solo il fuoco. `indice` è la tacca a
 * fuoco, `totale` quante tacche ci sono (16, o 17 con la tacca TU in testa).
 */
export function tastiTacche(e: TastoLetto, indice: number, totale: number): AzioneTacche | null {
  if (conModificatori(e) || totale <= 0) return null;
  const ultimo = totale - 1;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return { tipo: 'fuoco', indice: Math.min(ultimo, indice + 1) };
    case 'ArrowLeft':
    case 'ArrowUp':
      return { tipo: 'fuoco', indice: Math.max(0, indice - 1) };
    case 'Home':
      return { tipo: 'fuoco', indice: 0 };
    case 'End':
      return { tipo: 'fuoco', indice: ultimo };
    default:
      return null;
  }
}

/**
 * Tasti dei bottoni "mese prima" / "mese dopo" quando hanno
 * `aria-disabled="true"` (restano a fuoco, ux-architect §5.3.4): Invio e Spazio
 * non fanno niente e non devono far scorrere niente. Vero = assorbi il tasto.
 */
export function tastoSuPassoDisattivato(e: TastoLetto): boolean {
  if (conModificatori(e)) return false;
  return e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar';
}
