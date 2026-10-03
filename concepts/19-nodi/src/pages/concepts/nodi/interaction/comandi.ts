/**
 * NODI · comandi brevi (interaction-designer).
 *
 * Tre azioni senza stato proprio, usate dal righello, dalle scorciatoie dei
 * modi e dal link "Rimetti le foglie":
 *
 * - `vaiAllaFrequenza(hz, liscio)`  porta la pagina nel punto di scroll che
 *   dà quella frequenza (una sola verità: lo scroll, tech-architect §0.5).
 *   0 = altoparlante spento = pagina in cima (`#inizio`, ux §3.2).
 * - `vaiAlModo(modo)`  porta all'inizio del pianerottolo del modo 1, 2 o 5
 *   (il 5 alla frequenza della voce scelta). Liscio, istantaneo con reduced
 *   motion. Non sposta il focus (ux §2.7: salto da righello).
 * - `rimettiFoglie()`  chiede alla simulazione di spargere di nuovo le foglie
 *   (ux §3.3 T9). L'annuncio "Foglie rimesse sulla tavola." è del builder.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { vaiAScroll } from '../core/scroll';
import { ticker } from '../core/ticker';
import { clamp } from '../motion/easing';
import { HZ_MAX, HZ_MIN } from '../motion/percorso';
import { scrollDaHz } from '../risonanza/frequenza';
import { MODI } from '../risonanza/modi';
import { runtime } from '../state/runtime';
import { store } from '../state/store';
import type { Modo } from '../state/store';

/** Valore del righello che vuol dire "altoparlante spento". */
export const HZ_SPENTO = 0;

/**
 * Ai due capi della scala lo scroll in pixel interi può cadere appena fuori
 * dalla salita: a 60 Hz nel riposo (spento), a 420 Hz nella coda (spenta).
 * Si mira un pixel dentro la salita. Il valore mostrato resta 60 o 420
 * se motion/percorso.ts tiene un piccolo pianerottolo ai due capi (vedi
 * docs/interaction-designer.md, Richieste ad altri agent).
 */
const SCARTO_CAPI_PX = 1;

function yDaHz(hz: number): number {
  const h = clamp(hz, HZ_MIN, HZ_MAX);
  const y = scrollDaHz(h);
  if (h >= HZ_MAX - 0.5) return Math.max(0, y - SCARTO_CAPI_PX);
  if (h <= HZ_MIN + 0.5) return y + SCARTO_CAPI_PX;
  return y;
}

/**
 * Porta la pagina alla frequenza `hz` (0 = spento = in cima).
 * `liscio` vale solo fuori dal reduced motion.
 */
export function vaiAllaFrequenza(hz: number, liscio = false): void {
  const morbido = liscio && !store.get().reducedMotion;
  if (!(hz > 0)) {
    vaiAScroll(0, morbido);
    return;
  }
  vaiAScroll(yDaHz(hz), morbido);
}

/** Frequenza del pianerottolo di un modo (il 5 segue la voce). */
export function hzDelModo(modo: Modo): number {
  return modo === 5 ? runtime.hzModo5 : MODI[modo];
}

/** Scorciatoie "modo 1", "modo 2", "modo 5" accanto al righello. */
export function vaiAlModo(modo: Modo): void {
  vaiAllaFrequenza(hzDelModo(modo), true);
}

/** "Rimetti le foglie": la simulazione consuma il comando e lo rimette a 'nessuno'. */
export function rimettiFoglie(): void {
  runtime.foglie.comando = 'sparpaglia';
  runtime.markDirty();
  ticker.wake();
}
