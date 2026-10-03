/**
 * NODI · la nota d'esempio di "Senti la voce" (chunk lazy).
 *
 * Solo su tocco (CD §4.4). Una nota sintetica di circa 1,8 s: La 440 per il
 * violino, Do 131 per la viola, Do 65 per il violoncello (content/listino.ts).
 * Non è il campione di un musicista: due onde a dente di sega appena
 * scordate (il fruscio dell'arco), un vibrato leggero che entra dopo mezzo
 * secondo, un filtro passa-basso. Il punto del piano del suono dà il colore:
 * - scuro → brillante (x): il filtro si apre da 3,5 a 14 volte la fondamentale;
 * - morbido → pronto (y): l'attacco va da 220 a 35 ms.
 * Volume massimo 0,04 come l'altoparlante, che intanto va a zero.
 * Una nota per volta: una nuova ferma la precedente.
 */

import { STRUMENTI } from '../content/listino';
import type { Strumento } from '../content/listino';
import { clamp, clamp01, lerp } from '../motion/easing';
import { attenua } from './altoparlante';
import { GUADAGNO_MAX, allaChiusura, contesto, prendi, rilascia, riprendi, uscita } from './contesto';

/** Durata della nota, secondi. */
export const DURATA_NOTA_S = 1.8;
const RILASCIO_S = 0.32;
const ATTACCO_MORBIDO_S = 0.22;
const ATTACCO_PRONTO_S = 0.035;
const FILTRO_SCURO = 3.5;
const FILTRO_BRILLANTE = 14;
const VIBRATO_HZ = 5.3;
/** Profondità del vibrato in cent, raggiunta dopo 0,9 s. */
const VIBRATO_CENT = 12;
/** Scordatura delle due sorgenti, in cent. */
const SCORDATURA_CENT = 3;
/** Le due sorgenti sommate restano sotto 1 anche col piccolo picco del filtro. */
const MISCELA = 0.42;
/** Uscita rapida quando la si ferma o ne parte un'altra. */
const STACCO_S = 0.06;

export type EsitoNota = 'finita' | 'fermata' | 'non-disponibile';

export interface VoceNota {
  strumento: Strumento;
  x: number;
  y: number;
}

interface Nota {
  sorgenti: OscillatorNode[];
  nodi: AudioNode[];
  inviluppo: GainNode;
  timer: ReturnType<typeof setTimeout> | null;
  risolvi: (e: EsitoNota) => void;
}

let corrente: Nota | null = null;
let staccaChiusura: (() => void) | null = null;

function fondamentale(s: Strumento): number {
  return STRUMENTI.find((v) => v.strumento === s)?.notaEsempio.hz ?? 440;
}

function concludi(n: Nota, esito: EsitoNota, staccoS: number, restituisci = true): void {
  if (corrente === n) corrente = null;
  if (n.timer !== null) {
    clearTimeout(n.timer);
    n.timer = null;
  }
  const c = contesto();
  if (c !== null && staccoS > 0) {
    const t = c.currentTime;
    n.inviluppo.gain.cancelScheduledValues(t);
    n.inviluppo.gain.setValueAtTime(n.inviluppo.gain.value, t);
    n.inviluppo.gain.linearRampToValueAtTime(0, t + staccoS);
    for (const s of n.sorgenti) {
      try {
        s.stop(t + staccoS + 0.02);
      } catch (_e) {
        // già fermata
      }
    }
  }
  const ultima = n.sorgenti[0];
  const scollega = (): void => {
    for (const s of n.sorgenti) s.disconnect();
    for (const x of n.nodi) x.disconnect();
  };
  if (ultima !== undefined) ultima.onended = scollega;
  else scollega();
  if (corrente === null && restituisci) attenua(false);
  rilascia();
  n.risolvi(esito);
}

/** Suona la nota d'esempio. Si risolve a fine nota, o quando la si ferma. */
export async function suonaNotaEsempio(v: VoceNota): Promise<EsitoNota> {
  // Una nuova nota ferma la precedente senza ridare voce all'altoparlante nel mezzo.
  if (corrente !== null) concludi(corrente, 'fermata', STACCO_S, false);
  const pronto = await riprendi();
  const c = contesto();
  const out = uscita();
  if (!pronto || c === null || out === null) {
    if (corrente === null) attenua(false);
    return 'non-disponibile';
  }
  if (staccaChiusura === null) {
    staccaChiusura = allaChiusura(() => {
      if (corrente !== null) {
        const n = corrente;
        corrente = null;
        if (n.timer !== null) clearTimeout(n.timer);
        n.risolvi('fermata');
      }
      staccaChiusura = null;
    });
  }

  const f0 = fondamentale(v.strumento);
  const x = clamp01(v.x);
  const y = clamp01(v.y);
  const t0 = c.currentTime + 0.01;
  const attacco = lerp(ATTACCO_MORBIDO_S, ATTACCO_PRONTO_S, y);
  const fine = t0 + DURATA_NOTA_S;

  const a = c.createOscillator();
  a.type = 'sawtooth';
  a.frequency.value = f0;
  a.detune.value = -SCORDATURA_CENT;
  const b = c.createOscillator();
  b.type = 'sawtooth';
  b.frequency.value = f0;
  b.detune.value = SCORDATURA_CENT;

  const lfo = c.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = VIBRATO_HZ;
  const profondita = c.createGain();
  profondita.gain.setValueAtTime(0, t0);
  profondita.gain.setValueAtTime(0, t0 + 0.45);
  profondita.gain.linearRampToValueAtTime(VIBRATO_CENT, t0 + 0.9);
  lfo.connect(profondita);
  profondita.connect(a.detune);
  profondita.connect(b.detune);

  const miscela = c.createGain();
  miscela.gain.value = MISCELA;
  const filtro = c.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = clamp(f0 * lerp(FILTRO_SCURO, FILTRO_BRILLANTE, x), 320, 9000);
  filtro.Q.value = 0.7;

  const inviluppo = c.createGain();
  inviluppo.gain.setValueAtTime(0, t0);
  inviluppo.gain.linearRampToValueAtTime(GUADAGNO_MAX, t0 + attacco);
  inviluppo.gain.setValueAtTime(GUADAGNO_MAX, fine - RILASCIO_S);
  inviluppo.gain.linearRampToValueAtTime(0, fine);

  a.connect(miscela);
  b.connect(miscela);
  miscela.connect(filtro);
  filtro.connect(inviluppo);
  inviluppo.connect(out);

  const sorgenti = [a, b, lfo];
  for (const s of sorgenti) {
    s.start(t0);
    s.stop(fine + 0.05);
  }
  attenua(true);
  prendi();

  return new Promise<EsitoNota>((risolvi) => {
    const n: Nota = {
      sorgenti,
      nodi: [profondita, miscela, filtro, inviluppo],
      inviluppo,
      timer: null,
      risolvi,
    };
    corrente = n;
    n.timer = setTimeout(() => {
      n.timer = null;
      concludi(n, 'finita', 0);
    }, (DURATA_NOTA_S + 0.08) * 1000);
  });
}

/** "Ferma la nota". */
export function fermaNotaEsempio(): void {
  if (corrente !== null) concludi(corrente, 'fermata', STACCO_S);
}
