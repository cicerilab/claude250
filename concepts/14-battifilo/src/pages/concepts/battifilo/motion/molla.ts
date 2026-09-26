/**
 * BATTIFILO · molla smorzata integrata sul dt del ticker.
 *
 * Contratto di tech-architect §7.2: `interface Molla { x; v; target }` e
 * `passoMolla(m, dt, rigidezza, smorzamento)`. Massa unitaria:
 *   x'' = −rigidezza · (x − target) − smorzamento · x'
 * quindi rigidezza = ω² (1/s²) e smorzamento = 2ζω (1/s). Per pensare in
 * Hz e rapporto di smorzamento c'è `parametriMolla(frequenza, zeta)`.
 *
 * Soluzione analitica a ogni passo: stabile con qualsiasi dt, identica a 30,
 * 60 o 120 Hz, nessuna esplosione dopo un frame lungo.
 *
 * Modulo puro: nessun accesso a window/document.
 */

export interface Molla {
  /** Posizione attuale. */
  x: number;
  /** Velocità attuale (unità di x al secondo). */
  v: number;
  /** Dove la molla vuole andare. */
  target: number;
}

export interface ParametriMolla {
  /** ω² in 1/s² (massa unitaria). */
  readonly rigidezza: number;
  /** 2ζω in 1/s. */
  readonly smorzamento: number;
}

/** Da frequenza propria (Hz) e rapporto di smorzamento ζ ai parametri fisici. */
export function parametriMolla(frequenzaHz: number, zeta: number): ParametriMolla {
  const w = 2 * Math.PI * Math.max(0.01, frequenzaHz);
  return { rigidezza: w * w, smorzamento: 2 * Math.max(0, zeta) * w };
}

/**
 * Le molle del cantiere. Sovraelongazione indicativa per un salto unitario:
 * tensione 1,5%, presa 0%, cade 0%.
 */
export const MOLLE = {
  /** Il filo che si tende quando si afferra la cassetta: rapido, un'ombra di rimbalzo. */
  tensione: parametriMolla(9, 0.8),
  /** Il filo che si allenta e pende (Misura in errore): lento, pesante, nessun rimbalzo. */
  cade: parametriMolla(2.4, 1),
  /** La cassetta che torna sotto il dito dopo una sosta agganciata. */
  presa: parametriMolla(7, 1),
} as const satisfies Record<string, ParametriMolla>;

export type NomeMolla = keyof typeof MOLLE;

/** Soglie di quiete: sotto queste la molla si ferma esattamente sul target. */
const QUIETE_POSIZIONE = 1e-3;
const QUIETE_VELOCITA = 1e-2;
/** Passo massimo accettato (s): oltre, il frame è una pausa. */
const DT_MASSIMO = 0.1;

export function mollaFerma(m: Molla): boolean {
  return Math.abs(m.x - m.target) < QUIETE_POSIZIONE && Math.abs(m.v) < QUIETE_VELOCITA;
}

/**
 * Avanza la molla di `dt` secondi. Restituisce true se è ancora in moto dopo
 * il passo, false se si è fermata (e allora x vale esattamente target, v 0).
 */
export function passoMolla(m: Molla, dt: number, rigidezza: number, smorzamento: number): boolean {
  if (mollaFerma(m)) {
    m.x = m.target;
    m.v = 0;
    return false;
  }
  const h = dt <= 0 ? 0 : Math.min(dt, DT_MASSIMO);
  if (h === 0) return true;

  const w = Math.sqrt(Math.max(1e-6, rigidezza));
  const z = Math.max(0, smorzamento) / (2 * w);
  const x0 = m.x - m.target;
  const v0 = m.v;
  let x: number;
  let v: number;

  if (Math.abs(z - 1) < 1e-4) {
    // Critica: x(t) = (x0 + (v0 + w x0) t) e^{-wt}
    const e = Math.exp(-w * h);
    const c = v0 + w * x0;
    x = (x0 + c * h) * e;
    v = (v0 - w * c * h) * e;
  } else if (z < 1) {
    // Sotto-smorzata
    const wd = w * Math.sqrt(1 - z * z);
    const e = Math.exp(-z * w * h);
    const cos = Math.cos(wd * h);
    const sin = Math.sin(wd * h);
    const a = x0;
    const b = (v0 + z * w * x0) / wd;
    x = e * (a * cos + b * sin);
    v = e * (-z * w * (a * cos + b * sin) + (-a * wd * sin + b * wd * cos));
  } else {
    // Sovra-smorzata
    const r = Math.sqrt(z * z - 1);
    const r1 = -w * (z - r);
    const r2 = -w * (z + r);
    const c2 = (v0 - r1 * x0) / (r2 - r1);
    const c1 = x0 - c2;
    const e1 = Math.exp(r1 * h);
    const e2 = Math.exp(r2 * h);
    x = c1 * e1 + c2 * e2;
    v = c1 * r1 * e1 + c2 * r2 * e2;
  }

  m.x = m.target + x;
  m.v = v;

  if (mollaFerma(m)) {
    m.x = m.target;
    m.v = 0;
    return false;
  }
  return true;
}

/** Come `passoMolla` ma con un preset di `MOLLE`. */
export function passoMollaCon(m: Molla, dt: number, p: ParametriMolla): boolean {
  return passoMolla(m, dt, p.rigidezza, p.smorzamento);
}

/**
 * Inseguimento esponenziale indipendente dal frame rate: `fattore60` è la
 * frazione di distanza coperta in un frame a 60 Hz.
 */
export function seguiDt(corrente: number, obiettivo: number, fattore60: number, dt: number): number {
  const f = Math.min(Math.max(fattore60, 0), 1);
  const k = 1 - Math.pow(1 - f, Math.max(0, dt) * 60);
  return corrente + (obiettivo - corrente) * k;
}
