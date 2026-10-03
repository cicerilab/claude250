/**
 * MADRE · il respiro dell'impasto (motion-designer, docs/motion-designer.md §5;
 * contratto tech-architect §7.2).
 *
 * L'unica cosa che si muove da sola in tutto il sito (creative-director 4.3):
 * la pasta sale lentissima e torna giù, un respiro ogni 8,6-9,6 s, ognuno un
 * poco diverso dall'altro (un impasto vivo non è un metronomo). Valore in
 * `runtime.impasto.respiro`, da 0 (a riposo) a 1 (respiro più alto): lo
 * shader lo moltiplica per l'ampiezza decisa dal webgl-artist. Mai negativo:
 * a riposo la pasta è alla sua quota, il respiro la alza e la riposa.
 *
 * - Parte al primo frame utile e respira finché passano 30 s senza input;
 *   poi il respiro in corso finisce e la pasta si ferma a riposo, con
 *   velocità nulla (mai tagliato a metà). Una nuova prova lo fa ripartire.
 * - Solo col GL acceso e con l'impasto in vista: il fallback (foto) non
 *   respira, e fuori vista non si spende un frame (la pasta torna a riposo
 *   quando nessuno la vede, quindi senza salti visibili).
 * - Aggiornato a 30 fps: il GL ridisegna la metà dei frame.
 * - Reduced motion: nessun respiro, valore 0.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { runtime } from '../state/runtime';
import { store } from '../state/store';
import { RESPIRO } from './choreography';
import { clamp01, smootherstep01 } from './easing';

interface StatoRespiro {
  inCorso: boolean;
  /** Indice del respiro (sceglie periodo e altezza nella sequenza). */
  ciclo: number;
  /** Secondi dall'inizio del respiro in corso. */
  t: number;
  /** Tempo accumulato dall'ultima scrittura (s): scrive a 30 fps. */
  accumulo: number;
}

const stato: StatoRespiro = { inCorso: false, ciclo: 0, t: 0, accumulo: 0 };

const PASSO_SCRITTURA = 1 / RESPIRO.fps;

/**
 * Forma di un respiro, fase 0..1 → 0..1..0: sale nel primo 58% del ciclo,
 * scende nel resto. Velocità e accelerazione nulle in cima e in fondo
 * (smootherstep), quindi nessuno scatto né all'inizio né alla fine.
 */
export function ondaRespiro(fase: number, salita: number = RESPIRO.salita): number {
  const x = clamp01(fase);
  if (x <= salita) return smootherstep01(x / salita);
  return 1 - smootherstep01((x - salita) / (1 - salita));
}

/** Periodo (s) del respiro numero `ciclo`. */
export function periodoRespiro(ciclo: number): number {
  const n = RESPIRO.periodi.length;
  return RESPIRO.periodi[((ciclo % n) + n) % n] ?? 9;
}

/** Altezza (0..1) del respiro numero `ciclo`. */
export function altezzaRespiro(ciclo: number): number {
  const n = RESPIRO.altezze.length;
  return RESPIRO.altezze[((ciclo % n) + n) % n] ?? 1;
}

/** Valore del respiro `ciclo` a `t` secondi dal suo inizio. Funzione pura, per i test. */
export function valoreRespiro(ciclo: number, t: number): number {
  return altezzaRespiro(ciclo) * ondaRespiro(t / periodoRespiro(ciclo));
}

function scrivi(valore: number): void {
  const imp = runtime.impasto;
  if (Math.abs(imp.respiro - valore) > 1e-5) {
    imp.respiro = valore;
    runtime.markDirty();
  }
}

function ferma(): void {
  stato.inCorso = false;
  stato.t = 0;
  stato.accumulo = 0;
  scrivi(0);
}

/**
 * Funzione di update per il ticker (`now` in ms, stessa base di
 * performance.now()). Restituisce true finché sta respirando.
 */
export function aggiornaRespiro(dt: number, now: number, ridotto: boolean): boolean {
  const imp = runtime.impasto;
  // Il conto dei 30 s parte dal primo frame dopo il montaggio.
  if (imp.ultimoInput <= 0) imp.ultimoInput = now;

  if (ridotto || store.get().gl !== 'on' || !imp.inVista) {
    if (stato.inCorso || imp.respiro !== 0) ferma();
    return false;
  }

  const vivo = now - imp.ultimoInput < RESPIRO.durata * 1000;

  if (!stato.inCorso) {
    if (!vivo) return false;
    stato.inCorso = true;
    stato.t = 0;
    stato.accumulo = PASSO_SCRITTURA;
  }

  stato.t += dt;
  const periodo = periodoRespiro(stato.ciclo);
  if (stato.t >= periodo) {
    stato.ciclo += 1;
    if (!vivo) {
      ferma();
      return false;
    }
    stato.t -= periodo;
  }

  stato.accumulo += dt;
  if (stato.accumulo < PASSO_SCRITTURA) return true;
  stato.accumulo %= PASSO_SCRITTURA;

  scrivi(valoreRespiro(stato.ciclo, stato.t));
  return true;
}

/** Ferma il respiro e riporta la sequenza all'inizio (smontaggio dell'impasto). */
export function azzeraRespiro(): void {
  stato.ciclo = 0;
  ferma();
}

/** true se in questo momento la pasta sta respirando (diagnostica e test). */
export function staRespirando(): boolean {
  return stato.inCorso;
}
