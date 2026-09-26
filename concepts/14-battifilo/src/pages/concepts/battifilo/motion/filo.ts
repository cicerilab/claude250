/**
 * BATTIFILO · il filo: tensione, battuta, corda molle, sussulto.
 *
 * Contratto di tech-architect §7.2. Il filo è un `<path>` quadratico dal
 * gancio alla cassetta; si anima SOLO il punto di controllo centrale,
 * attraverso `stato.alza` (px, negativo = su). Chi disegna (Filo.tsx nella
 * fase 'write', Tracciamento.tsx per la finestra) legge `stato.alza` e
 * chiama `pathFilo()`; questo modulo non tocca mai il DOM.
 *
 * Quattro modi:
 * - teso    alza → 0 con la molla `tensione` (afferrare, trascinare);
 * - battuta curva a tempo `alzaBattuta` (350 ms): su, giù, due rimbalzi.
 *           All'impatto chiama `onImpatto` (il gesso si posa, parte la polvere);
 * - molle   alza → +pendenza con la molla `cade`, poi fermo (Misura in errore:
 *           il battifilo non batte con la corda molle);
 * - sussulto una piccola alzata senza impatto (Misura, invio incompleto).
 *
 * Reduced motion: nessuna oscillazione. `batti()` chiama subito `onImpatto`
 * e lascia il filo teso; `molle()` mette subito la curva ferma.
 *
 * Nessun accesso a window/document: i tempi vengono dal dt del ticker.
 */

import type { StatoFilo } from '../state/runtime';
import { FILO, type ForzaBattuta } from './choreography';
import { BATTUTA_FASI, alzaBattuta, alzaSussulto, clamp01 } from './easing';
import { MOLLE, passoMollaCon, type Molla, type ParametriMolla } from './molla';

export interface OpzioniFilo {
  /** Il filo tocca il getto: qui nasce il segno (gesso e polvere). Una volta per battuta. */
  onImpatto?: (forza: ForzaBattuta) => void;
}

export interface Filo {
  /** Durante il trascinamento: filo dritto e teso (alza → 0 senza oscillare). */
  tendi(): void;
  /** Su di pochi px, giù con due oscillazioni smorzate. 'piena' 350 ms, 'corta' 220, 'apertura' 420. */
  batti(forza?: ForzaBattuta): void;
  /** La corda molle: curva che pende e resta ferma. `pendenza` in px (default FILO.molle.max / 2). */
  molle(pendenza?: number): void;
  /** Piccola alzata senza impatto, 180 ms (niente segno, niente polvere). */
  sussulta(): void;
  /** Da chiamare nella fase 'update' del ticker. true = ancora in moto. */
  tick(dt: number): boolean;
  /** true dalla partenza della battuta alla fine dei rimbalzi. */
  readonly battendo: boolean;
  /** 'teso' | 'battuta' | 'molle' | 'sussulto': per i data-attribute di chi disegna. */
  readonly modo: ModoFilo;
}

export type ModoFilo = 'teso' | 'battuta' | 'molle' | 'sussulto';

interface CorsaBattuta {
  forza: ForzaBattuta;
  t: number;
  durata: number;
  ampiezza: number;
  alzaIniziale: number;
  impattoFatto: boolean;
}

interface CorsaSussulto {
  t: number;
  durata: number;
  ampiezza: number;
  base: number;
}

const PENDENZA_DEFAULT = FILO.molle.max / 2;

export function creaFilo(stato: StatoFilo, ridotto: () => boolean, opz: OpzioniFilo = {}): Filo {
  const molla: Molla = { x: stato.alza, v: stato.vel, target: 0 };
  let parametri: ParametriMolla = MOLLE.tensione;
  let modo: ModoFilo = 'teso';
  let battuta: CorsaBattuta | null = null;
  let sussulto: CorsaSussulto | null = null;
  let inMoto = false;

  const impatto = (b: CorsaBattuta): void => {
    if (b.impattoFatto) return;
    b.impattoFatto = true;
    opz.onImpatto?.(b.forza);
  };

  const scrivi = (alza: number, vel: number): void => {
    stato.alza = alza;
    stato.vel = vel;
  };

  const chiudiBattutaInSospeso = (): void => {
    // Se il filo viene ripreso prima di toccare il getto, il segno si posa
    // comunque: la tappa è già ferma e la linea deve dirlo.
    if (battuta && !battuta.impattoFatto) impatto(battuta);
    battuta = null;
    stato.battendo = false;
  };

  const versoMolla = (target: number, p: ParametriMolla, nuovoModo: ModoFilo): void => {
    chiudiBattutaInSospeso();
    sussulto = null;
    modo = nuovoModo;
    parametri = p;
    molla.x = stato.alza;
    molla.v = stato.vel;
    molla.target = target;
    if (ridotto()) {
      molla.x = target;
      molla.v = 0;
      scrivi(target, 0);
      inMoto = false;
      return;
    }
    inMoto = true;
  };

  return {
    tendi(): void {
      if (modo === 'teso' && !inMoto && stato.alza === 0) return;
      versoMolla(0, MOLLE.tensione, 'teso');
    },

    batti(forza: ForzaBattuta = 'piena'): void {
      chiudiBattutaInSospeso();
      sussulto = null;
      const b: CorsaBattuta = {
        forza,
        t: 0,
        durata: FILO.durata[forza],
        ampiezza: FILO.ampiezza[forza],
        // Da dove si trova ora (anche molle o a metà di un'altra battuta): niente salti.
        alzaIniziale: stato.alza,
        impattoFatto: false,
      };
      if (ridotto()) {
        modo = 'teso';
        molla.x = 0;
        molla.v = 0;
        molla.target = 0;
        scrivi(0, 0);
        inMoto = false;
        impatto(b);
        return;
      }
      modo = 'battuta';
      battuta = b;
      stato.battendo = true;
      inMoto = true;
    },

    molle(pendenza: number = PENDENZA_DEFAULT): void {
      versoMolla(Math.abs(pendenza), MOLLE.cade, 'molle');
    },

    sussulta(): void {
      if (ridotto()) return;
      if (modo === 'battuta') return;
      sussulto = {
        t: 0,
        durata: FILO.durata.sussulto,
        ampiezza: FILO.ampiezza.sussulto,
        base: modo === 'molle' ? molla.target : 0,
      };
      modo = 'sussulto';
      inMoto = true;
    },

    tick(dt: number): boolean {
      if (!inMoto) return false;
      const ms = Math.max(0, dt) * 1000;

      if (modo === 'battuta' && battuta) {
        const b = battuta;
        const prima = stato.alza;
        b.t += ms;
        const u = clamp01(b.t / b.durata);
        const alza = alzaBattuta(u, b.ampiezza, b.alzaIniziale);
        scrivi(alza, dt > 0 ? (alza - prima) / dt : 0);
        if (u >= BATTUTA_FASI.impatto) impatto(b);
        if (u >= 1) {
          battuta = null;
          stato.battendo = false;
          modo = 'teso';
          molla.x = 0;
          molla.v = 0;
          molla.target = 0;
          scrivi(0, 0);
          inMoto = false;
          return false;
        }
        return true;
      }

      if (modo === 'sussulto' && sussulto) {
        const s = sussulto;
        const prima = stato.alza;
        s.t += ms;
        const u = clamp01(s.t / s.durata);
        const alza = s.base + alzaSussulto(u, s.ampiezza);
        scrivi(alza, dt > 0 ? (alza - prima) / dt : 0);
        if (u >= 1) {
          sussulto = null;
          modo = s.base > 0 ? 'molle' : 'teso';
          molla.x = s.base;
          molla.v = 0;
          molla.target = s.base;
          scrivi(s.base, 0);
          inMoto = false;
          return false;
        }
        return true;
      }

      const ancora = passoMollaCon(molla, dt, parametri);
      scrivi(molla.x, molla.v);
      inMoto = ancora;
      return ancora;
    },

    get battendo(): boolean {
      return battuta !== null;
    },

    get modo(): ModoFilo {
      return modo;
    },
  };
}

/**
 * Il `d` del filo: una quadratica dal gancio alla cassetta alla quota `y`,
 * con il punto di controllo al centro spostato di `2 · alza`, così il punto
 * di mezzo della curva si sposta esattamente di `alza` (px, negativo = su).
 * Unità libere: px per la linea, centimetri per il piano di Misura.
 */
export function pathFilo(xGancio: number, xCassetta: number, y: number, alza: number): string {
  const r = (v: number): number => Math.round(v * 100) / 100;
  const x0 = r(xGancio);
  const x1 = r(xCassetta);
  const yy = r(y);
  if (Math.abs(x1 - x0) < 0.5 || Math.abs(alza) < 0.01) return `M ${x0} ${yy} L ${x1} ${yy}`;
  const xm = r((xGancio + xCassetta) / 2);
  const yc = r(y + 2 * alza);
  return `M ${x0} ${yy} Q ${xm} ${yc} ${x1} ${yy}`;
}

/**
 * Come `pathFilo` ma per un lato qualsiasi della finestra (anche verticale):
 * il punto di controllo si sposta lungo la normale al lato, verso l'esterno
 * se `alza` è negativo (sistema SVG: la normale di un lato orario punta fuori).
 */
export function pathFiloTra(x0: number, y0: number, x1: number, y1: number, alza: number): string {
  const r = (v: number): number => Math.round(v * 100) / 100;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const l = Math.hypot(dx, dy);
  if (l < 0.5 || Math.abs(alza) < 0.01) return `M ${r(x0)} ${r(y0)} L ${r(x1)} ${r(y1)}`;
  // Normale a destra del verso di percorrenza (in un giro orario sopra → destra
  // → sotto → sinistra punta verso l'interno); alza negativo la porta fuori.
  const nx = -dy / l;
  const ny = dx / l;
  const cx = (x0 + x1) / 2 + nx * 2 * alza;
  const cy = (y0 + y1) / 2 + ny * 2 * alza;
  return `M ${r(x0)} ${r(y0)} Q ${r(cx)} ${r(cy)} ${r(x1)} ${r(y1)}`;
}
