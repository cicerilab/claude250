/**
 * NODI · il contesto audio unico (chunk lazy).
 *
 * Il contesto lo crea interaction/suono.ts dentro il gesto e lo consegna con
 * `usaContesto`. Qui si tiene il conto di chi suona (altoparlante, nota
 * d'esempio): quando nessuno suona da 2 s il contesto si sospende, così il
 * processo audio del sistema non resta acceso per niente. Un'uscita comune
 * con un limitatore leggero garantisce che, anche sommando altoparlante e
 * nota, il volume non superi mai quello voluto.
 */

/** Guadagno massimo di tutto quello che esce (circa -28 dBFS, CD §4.3). */
export const GUADAGNO_MAX = 0.04;
/** Dopo quanto silenzio il contesto si sospende. */
const SOSPENDI_DOPO_MS = 2000;

let ctx: AudioContext | null = null;
let uscitaNodo: GainNode | null = null;
let utenti = 0;
let timer: ReturnType<typeof setTimeout> | null = null;

/** Riceve il contesto creato nel gesto (lo stesso per tutta la visita). */
export function usaContesto(c: AudioContext): void {
  if (ctx === c) return;
  if (ctx !== null && ctx.state !== 'closed') ctx.close().catch(() => undefined);
  ctx = c;
  uscitaNodo = null;
  utenti = 0;
}

export function contesto(): AudioContext | null {
  return ctx !== null && ctx.state !== 'closed' ? ctx : null;
}

/**
 * Nodo d'uscita comune: guadagno 1 e un compressore usato come limitatore
 * (soglia -30 dB, rapporto 20): somma di altoparlante e nota mai oltre.
 */
export function uscita(): AudioNode | null {
  const c = contesto();
  if (c === null) return null;
  if (uscitaNodo === null) {
    const limite = c.createDynamicsCompressor();
    limite.threshold.value = -30;
    limite.knee.value = 0;
    limite.ratio.value = 20;
    limite.attack.value = 0.003;
    limite.release.value = 0.12;
    const g = c.createGain();
    g.gain.value = 1;
    g.connect(limite);
    limite.connect(c.destination);
    uscitaNodo = g;
  }
  return uscitaNodo;
}

/** Riprende il contesto (dopo il gesto il browser lo permette). */
export async function riprendi(): Promise<boolean> {
  const c = contesto();
  if (c === null) return false;
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch (_e) {
      return false;
    }
  }
  return c.state === 'running';
}

/** Qualcuno comincia a suonare. */
export function prendi(): void {
  utenti += 1;
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

/** Qualcuno ha finito: se nessuno suona più, il contesto si sospende fra poco. */
export function rilascia(): void {
  utenti = Math.max(0, utenti - 1);
  if (utenti > 0 || timer !== null) return;
  timer = setTimeout(() => {
    timer = null;
    const c = contesto();
    if (c !== null && utenti === 0 && c.state === 'running') c.suspend().catch(() => undefined);
  }, SOSPENDI_DOPO_MS);
}

/** Smontaggio: chiude tutto (lo chiama interaction/suono.ts → chiudiSuono). */
export function chiudiAudio(): void {
  chiudiAscoltatori.forEach((f) => f());
  chiudiAscoltatori.clear();
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  if (ctx !== null && ctx.state !== 'closed') ctx.close().catch(() => undefined);
  ctx = null;
  uscitaNodo = null;
  utenti = 0;
}

/** Chi deve fermarsi quando si chiude tutto (altoparlante, nota). */
const chiudiAscoltatori = new Set<() => void>();

export function allaChiusura(f: () => void): () => void {
  chiudiAscoltatori.add(f);
  return () => chiudiAscoltatori.delete(f);
}
