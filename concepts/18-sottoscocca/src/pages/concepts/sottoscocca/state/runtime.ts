/**
 * SOTTOSCOCCA · valori caldi (tech-architect §6.2, motion-designer §3 e §11).
 *
 * Oggetto mutabile, MAI in React state: letto e scritto nel ticker, una
 * volta per frame. Chi scrive cosa:
 * - `scrollY`: il ticker, prima della fase `read`;
 * - `viewport`: core/viewport.ts;
 * - `percorso`: ponte/quota.ts;
 * - `quota`, `binario`, `discesa`, `opacitaScena`, `ruote`, `evidenza`:
 *   `MotorePonte` di motion/molle.ts (chiamato da ponte/quota.ts);
 * - `punti`: webgl/proiezione.ts (shader-engineer) o Fondale.tsx senza GL;
 * - `puntoSotto`: sections/Punti (hover/fuoco di un punto);
 * - `dirty`: chi cambia qualcosa da ridisegnare (`markDirty`), azzerato dal
 *   renderer GL dopo aver disegnato.
 *
 * Nessun accesso al browser: `reset()` lo chiama Radice.tsx al mount.
 */

import type { IdPezzo, IdPunto } from '../content/lavori';

export type Orientamento = 'landscape' | 'portrait';

export interface Viewport {
  w: number;
  h: number;
  dpr: number;
  orient: Orientamento;
}

export interface QuotaPonte {
  /** Obiettivo in cm (0..180), dal profilo di scroll. */
  target: number;
  /** Valore inseguito, con l'assestamento sui fermi (cm). */
  valore: number;
}

export interface PuntoProiettato {
  /** px CSS del viewport. */
  x: number;
  y: number;
  /** false se dietro la camera, fuori dalla finestra o senza coordinate sulla foto. */
  visibile: boolean;
}

export interface Runtime {
  scrollY: number;
  viewport: Viewport;
  /** 0..6 continuo: stazione + frazione (tech §6.3). */
  percorso: number;
  quota: QuotaPonte;
  /** 0..3 continuo tra le 4 chiavi camera. */
  binario: number;
  /** 0..1: nel Ponte libero la camera si allontana. */
  discesa: number;
  /** 0..1: 1 fino al deposito, 0,2 nel planning, 0 in officina e piede. */
  opacitaScena: number;
  /** Angolo delle ruote (rad), si accumula. */
  ruote: number;
  /** Evidenza dei pezzi 0..1 (250 ms). */
  evidenza: Partial<Record<IdPezzo, number>>;
  /** Punti toccabili proiettati, px CSS del viewport. */
  punti: Record<IdPunto, PuntoProiettato>;
  /** Punto sotto il puntatore o con il fuoco (sections/Punti). */
  puntoSotto: IdPunto | null;
  dirty: boolean;
  markDirty(): void;
  reset(): void;
}

function puntiVuoti(): Record<IdPunto, PuntoProiettato> {
  return {
    'ruota-anteriore': { x: 0, y: 0, visibile: false },
    'ruota-posteriore': { x: 0, y: 0, visibile: false },
    freni: { x: 0, y: 0, visibile: false },
    sospensioni: { x: 0, y: 0, visibile: false },
    olio: { x: 0, y: 0, visibile: false },
    scarico: { x: 0, y: 0, visibile: false },
  };
}

export const runtime: Runtime = {
  scrollY: 0,
  viewport: { w: 0, h: 0, dpr: 1, orient: 'landscape' },
  percorso: 0,
  quota: { target: 0, valore: 0 },
  binario: 0,
  discesa: 0,
  opacitaScena: 1,
  ruote: 0,
  evidenza: {},
  punti: puntiVuoti(),
  puntoSotto: null,
  dirty: true,
  markDirty(): void {
    runtime.dirty = true;
  },
  reset(): void {
    runtime.scrollY = 0;
    runtime.percorso = 0;
    runtime.quota.target = 0;
    runtime.quota.valore = 0;
    runtime.binario = 0;
    runtime.discesa = 0;
    runtime.opacitaScena = 1;
    runtime.ruote = 0;
    runtime.evidenza = {};
    const p = runtime.punti;
    for (const id of Object.keys(p) as IdPunto[]) {
      const v = p[id];
      v.x = 0;
      v.y = 0;
      v.visibile = false;
    }
    runtime.puntoSotto = null;
    runtime.dirty = true;
  },
};
