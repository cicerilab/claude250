/**
 * NODI · l'altoparlante sotto la tavola (chunk lazy).
 *
 * Fa sentire quello che si sente in bottega durante la prova delle tavole
 * libere: una sinusoide pura alla frequenza del righello (CD §4.3).
 * - Guadagno massimo 0,04 (circa -28 dBFS); fuori risonanza scende fino a
 *   metà, in modo continuo con l'ampiezza del modo più vicino.
 * - Attacco e rilascio di circa 180 ms (costante di tempo 50 ms): niente click.
 * - Frequenza inseguita con `setTargetAtTime` (20 ms): niente gradini.
 * - A riposo e nella coda (frequenza spenta) tace.
 * - Si spegne da solo, e lo dice allo store (`impostaSuono(false)`, quindi
 *   `aria-pressed` torna false): scheda nascosta; passaggio da una frequenza
 *   a "spento" (si esce dalla prova); 20 s senza cambi di frequenza, con una
 *   dissolvenza di 1 s.
 * - Mentre suona la nota d'esempio va a zero (ux §6.1 V4).
 * Il tempo dell'audio è quello del contesto: il ticker passa solo i valori
 * (fase `update`, nessun rAF proprio, nessun intervallo).
 */

import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { impostaSuono, store } from '../state/store';
import { GUADAGNO_MAX, allaChiusura, contesto, prendi, rilascia, riprendi, uscita } from './contesto';

/** Costante di tempo dell'attacco e dei cambi di volume: 97 % in circa 180 ms. */
const TAU_VOLUME = 0.05;
/** Costante di tempo dell'inseguimento della frequenza. */
const TAU_FREQUENZA = 0.02;
/** Rilascio normale (tocco sull'interruttore, uscita dalla prova). */
export const RILASCIO_MS = 180;
/** Dissolvenza dello spegnimento per silenzio. */
const DISSOLVENZA_SILENZIO_MS = 1000;
/** Senza cambi di frequenza per tanto, l'altoparlante si spegne. */
const SILENZIO_MS = 20_000;
/** Fuori risonanza il volume scende fino a questa quota. */
const QUOTA_FUORI_RISONANZA = 0.5;
/** Cambi più piccoli di questi non si riprogrammano. */
const SOGLIA_HZ = 0.05;
const SOGLIA_GUADAGNO = 0.0004;
/** Un cambio di frequenza di almeno tanto azzera il conto dei 20 s. */
const SOGLIA_CAMBIO_HZ = 0.5;

interface Sorgente {
  osc: OscillatorNode;
  volume: GainNode;
}

let sorgente: Sorgente | null = null;
let generazione = 0;
let attenuato = false;
let ultimoHz: number | null = null;
let ultimoGuadagno = -1;
let hzDelConto: number | null = null;
let eraSuUnaFrequenza = false;
let timerSilenzio: ReturnType<typeof setTimeout> | null = null;
const staccatori: Array<() => void> = [];

function frequenzaCorrente(): number | null {
  const hz = runtime.hz;
  return hz.valore !== null ? hz.valore : hz.target;
}

function ampiezzaMassima(): number {
  const a = runtime.ampiezze;
  let m = 0;
  for (let i = 0; i < a.length; i += 1) {
    const v = a[i] ?? 0;
    if (v > m) m = v;
  }
  return m > 1 ? 1 : m < 0 ? 0 : m;
}

function guadagnoVoluto(hz: number | null): number {
  if (hz === null || attenuato) return 0;
  const quota = QUOTA_FUORI_RISONANZA + (1 - QUOTA_FUORI_RISONANZA) * ampiezzaMassima();
  return GUADAGNO_MAX * quota;
}

function applicaGuadagno(g: number): void {
  const c = contesto();
  if (sorgente === null || c === null) return;
  if (Math.abs(g - ultimoGuadagno) < SOGLIA_GUADAGNO) return;
  ultimoGuadagno = g;
  sorgente.volume.gain.setTargetAtTime(g, c.currentTime, TAU_VOLUME);
}

function contaSilenzio(): void {
  if (timerSilenzio !== null) clearTimeout(timerSilenzio);
  timerSilenzio = setTimeout(() => {
    timerSilenzio = null;
    spegniDaSolo(DISSOLVENZA_SILENZIO_MS);
  }, SILENZIO_MS);
}

/** Fase `update` del ticker: segue la frequenza del righello. */
function segui(): boolean {
  const c = contesto();
  if (sorgente === null || c === null) return false;
  const hz = frequenzaCorrente();

  // Si esce dalla prova (da una frequenza a "spento"): l'altoparlante si spegne.
  if (hz === null) {
    if (eraSuUnaFrequenza) {
      spegniDaSolo(RILASCIO_MS);
      return false;
    }
  } else {
    eraSuUnaFrequenza = true;
  }

  if (hz !== null && (ultimoHz === null || Math.abs(hz - ultimoHz) > SOGLIA_HZ)) {
    ultimoHz = hz;
    sorgente.osc.frequency.setTargetAtTime(hz, c.currentTime, TAU_FREQUENZA);
  }
  if (hz !== null && (hzDelConto === null || Math.abs(hz - hzDelConto) >= SOGLIA_CAMBIO_HZ)) {
    hzDelConto = hz;
    contaSilenzio();
  }
  applicaGuadagno(guadagnoVoluto(hz));
  return false;
}

function pulisci(): void {
  while (staccatori.length > 0) staccatori.pop()?.();
  if (timerSilenzio !== null) {
    clearTimeout(timerSilenzio);
    timerSilenzio = null;
  }
  ultimoHz = null;
  ultimoGuadagno = -1;
  hzDelConto = null;
  eraSuUnaFrequenza = false;
}

function spegniDaSolo(dissolvenzaMs: number): void {
  spegniAltoparlante(dissolvenzaMs);
  impostaSuono(false);
}

/**
 * Accende l'altoparlante. Il contesto deve essere già stato sbloccato nel
 * gesto (interaction/suono.ts). Rifiuta se l'audio non parte.
 */
export async function accendiAltoparlante(): Promise<void> {
  const mia = ++generazione;
  const pronto = await riprendi();
  if (mia !== generazione) return; // spento mentre si riprendeva
  const c = contesto();
  const out = uscita();
  if (!pronto || c === null || out === null) throw new Error('altoparlante: audio non disponibile');
  if (sorgente !== null) return;

  const hz0 = frequenzaCorrente();
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = hz0 ?? 220;
  const volume = c.createGain();
  volume.gain.value = 0;
  osc.connect(volume);
  volume.connect(out);
  osc.start();
  sorgente = { osc, volume };
  prendi();

  ultimoHz = hz0;
  eraSuUnaFrequenza = hz0 !== null;
  hzDelConto = hz0;
  contaSilenzio();
  applicaGuadagno(guadagnoVoluto(hz0));

  staccatori.push(ticker.add(segui, 'update'));

  const visibilita = (): void => {
    if (document.visibilityState === 'hidden') spegniDaSolo(RILASCIO_MS);
  };
  document.addEventListener('visibilitychange', visibilita);
  staccatori.push(() => document.removeEventListener('visibilitychange', visibilita));

  // Se lo store dice "spento" per qualunque via, si spegne anche il suono.
  staccatori.push(
    store.subscribe(() => {
      if (!store.get().suono && sorgente !== null) spegniAltoparlante(RILASCIO_MS);
    }),
  );

  staccatori.push(
    allaChiusura(() => {
      generazione += 1;
      sorgente = null;
      pulisci();
    }),
  );
  ticker.wake();
}

/** Spegne con un rilascio morbido (180 ms di default, 1 s per il silenzio). */
export function spegniAltoparlante(dissolvenzaMs: number = RILASCIO_MS): void {
  generazione += 1;
  const s = sorgente;
  sorgente = null;
  pulisci();
  if (s === null) return;
  const c = contesto();
  if (c !== null) {
    const t = c.currentTime;
    const durata = Math.max(0.02, dissolvenzaMs / 1000);
    s.volume.gain.cancelScheduledValues(t);
    s.volume.gain.setValueAtTime(s.volume.gain.value, t);
    s.volume.gain.setTargetAtTime(0, t, durata / 4);
    s.osc.onended = () => {
      s.osc.disconnect();
      s.volume.disconnect();
    };
    s.osc.stop(t + durata + 0.08);
  }
  rilascia();
}

/** La nota d'esempio chiede silenzio all'altoparlante (true) e poi lo restituisce (false). */
export function attenua(si: boolean): void {
  attenuato = si;
  if (sorgente !== null) applicaGuadagno(guadagnoVoluto(frequenzaCorrente()));
}
