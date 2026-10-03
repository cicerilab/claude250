/**
 * NODI · il suono, lato pagina (interaction-designer).
 *
 * Piccolo modulo nel chunk del concept: tutto il Web Audio vero sta in
 * `audio/` (chunk lazy, caricato al primo gesto). Qui ci sono solo:
 * - `audioDisponibile()`: c'è Web Audio? (stato V13 della voce);
 * - lo sblocco del contesto DENTRO il gesto: l'`AudioContext` si crea e si
 *   riprende in modo sincrono nel gestore del tocco (Safari lo esige), poi
 *   si passa al chunk lazy quando arriva;
 * - le azioni che i builder collegano ai bottoni: `alternaSuono()` per
 *   l'interruttore "Suono", `sentiLaVoce()` e `fermaLaNota()` per "Senti la
 *   voce" / "Ferma la nota", `chiudiSuono()` per lo smontaggio di Radice.
 *
 * Regole (creative-director §4.3-4.4, ux-architect §7.6): spento
 * all'apertura, sempre; nessun `AudioContext` prima di un gesto; nessun
 * suono al passaggio del mouse, al trascinamento della foglia o al
 * caricamento. Lo stato visibile è `store.suono` (aria-pressed).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import type { Strumento } from '../content/listino';
import { impostaSuono, store } from '../state/store';

type ModuloAudio = typeof import('../audio');

interface FinestraConAudio {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

let contesto: AudioContext | null = null;
let caricamento: Promise<ModuloAudio> | null = null;
let modulo: ModuloAudio | null = null;

function costruttore(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as FinestraConAudio;
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** C'è Web Audio in questo browser? Da chiamare in un effetto, non nel render del prerender. */
export function audioDisponibile(): boolean {
  return costruttore() !== null;
}

/**
 * Crea (una volta) e riprende il contesto. Va chiamata in modo SINCRONO
 * dentro il gestore di un gesto (click, keydown, pointerup).
 */
export function sbloccaAudio(): AudioContext | null {
  if (contesto !== null && contesto.state === 'closed') contesto = null;
  if (contesto === null) {
    const C = costruttore();
    if (C === null) return null;
    try {
      contesto = new C({ latencyHint: 'interactive' });
    } catch (_e) {
      return null;
    }
  }
  if (contesto.state === 'suspended') {
    contesto.resume().catch(() => undefined);
  }
  return contesto;
}

function caricaAudio(ctx: AudioContext): Promise<ModuloAudio> {
  if (caricamento === null) {
    caricamento = import('../audio').then((m) => {
      modulo = m;
      return m;
    });
    caricamento.catch(() => {
      caricamento = null;
    });
  }
  return caricamento.then((m) => {
    m.usaContesto(ctx);
    return m;
  });
}

/** Interruttore "Suono": accende o spegne l'altoparlante sotto la tavola. */
export function alternaSuono(): void {
  if (store.get().suono) {
    spegniSuono();
    return;
  }
  accendiSuono();
}

export function accendiSuono(): void {
  const ctx = sbloccaAudio();
  if (ctx === null) {
    impostaSuono(false);
    return;
  }
  impostaSuono(true);
  caricaAudio(ctx)
    .then((m) => {
      // Spento di nuovo mentre il chunk arrivava: non si accende.
      if (!store.get().suono) return undefined;
      return m.accendiAltoparlante();
    })
    .catch(() => impostaSuono(false));
}

export function spegniSuono(): void {
  impostaSuono(false);
  modulo?.spegniAltoparlante();
}

export interface VoceDaSentire {
  strumento: Strumento;
  x: number;
  y: number;
}

/** Com'è finita la nota d'esempio. */
export type EsitoNota = 'finita' | 'fermata' | 'non-disponibile';

/**
 * "Senti la voce": la nota d'esempio di circa 1,8 s col colore del punto.
 * Solo su tocco. La promessa si risolve a fine nota (il bottone torna da
 * "Ferma la nota" a "Senti la voce di esempio").
 */
export function sentiLaVoce(v: VoceDaSentire): Promise<EsitoNota> {
  const ctx = sbloccaAudio();
  if (ctx === null) return Promise.resolve('non-disponibile');
  return caricaAudio(ctx)
    .then((m) => m.suonaNotaEsempio(v))
    .catch((): EsitoNota => 'non-disponibile');
}

/** "Ferma la nota". */
export function fermaLaNota(): void {
  modulo?.fermaNotaEsempio();
}

/** Smontaggio di Radice: spegne tutto e chiude il contesto, senza caricare il chunk se non c'è. */
export function chiudiSuono(): void {
  if (modulo !== null) {
    modulo.chiudiAudio();
  } else if (contesto !== null && contesto.state !== 'closed') {
    contesto.close().catch(() => undefined);
  }
  contesto = null;
}
