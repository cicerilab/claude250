/**
 * IMPRONTA · molla integrata sul dt del ticker.
 *
 * Soluzione analitica dell'oscillatore armonico smorzato a ogni passo:
 * stabile con qualsiasi dt (anche dopo un frame lungo), identica a 30, 60
 * o 120 Hz. Parametri espressi come frequenza propria (Hz) e rapporto di
 * smorzamento (zeta): 1 = critica (nessun rimbalzo), < 1 = sotto-smorzata.
 *
 * Modulo puro: nessun accesso a window/document.
 */

export interface ParametriMolla {
  /** Frequenza propria in Hz. Più alta = più rapida. */
  readonly frequenza: number;
  /** Rapporto di smorzamento (zeta). 1 = critico. */
  readonly smorzamento: number;
}

/**
 * Molle con un nome di bottega. Sovraelongazione indicativa per un salto
 * unitario: carta 2,8%, battuta 4,6%, tiro 1,5%, morbida e risalita 0%.
 */
export const MOLLE = {
  /** La carta che cede e torna: interruzioni della pressa, cambi di obiettivo. */
  carta: { frequenza: 3.6, smorzamento: 0.75 },
  /** Il colpo di una lettera nuova nel banco: breve, secco, un'eco sola. */
  battuta: { frequenza: 7.5, smorzamento: 0.7 },
  /** Hover e fuoco: la pressione si approfondisce senza rimbalzi. */
  morbida: { frequenza: 2.6, smorzamento: 1 },
  /** Il filo che si tende arrivando a una sosta della legatura. */
  tiro: { frequenza: 3.2, smorzamento: 0.8 },
  /** La carta che risale quando la leva si lascia prima del tempo. */
  risalita: { frequenza: 2.2, smorzamento: 1 },
} as const satisfies Record<string, ParametriMolla>;

export type NomeMolla = keyof typeof MOLLE;

/** Soglie di quiete: sotto queste la molla si ferma esattamente sull'obiettivo. */
const QUIETE_POSIZIONE = 1e-4;
const QUIETE_VELOCITA = 1e-3;
/** Passo massimo accettato (s): oltre, il frame è considerato una pausa. */
const DT_MASSIMO = 0.1;

export class Molla {
  valore: number;
  velocita: number;
  obiettivo: number;
  private omega = 0;
  private zeta = 1;

  constructor(iniziale = 0, parametri: ParametriMolla = MOLLE.carta) {
    this.valore = iniziale;
    this.velocita = 0;
    this.obiettivo = iniziale;
    this.imposta(parametri);
  }

  /** Cambia rigidità e smorzamento senza toccare posizione e velocità. */
  imposta(parametri: ParametriMolla): void {
    this.omega = 2 * Math.PI * Math.max(0.01, parametri.frequenza);
    this.zeta = Math.max(0, parametri.smorzamento);
  }

  /** Nuovo obiettivo: la molla ci va conservando la velocità attuale. */
  verso(obiettivo: number): void {
    this.obiettivo = obiettivo;
  }

  /** Salto immediato (reduced motion, reset): posizione = obiettivo, velocità 0. */
  salta(valore: number): void {
    this.valore = valore;
    this.obiettivo = valore;
    this.velocita = 0;
  }

  /** Aggiunge una velocità (unità di valore al secondo). */
  spingi(velocita: number): void {
    this.velocita += velocita;
  }

  get ferma(): boolean {
    return (
      Math.abs(this.valore - this.obiettivo) < QUIETE_POSIZIONE &&
      Math.abs(this.velocita) < QUIETE_VELOCITA
    );
  }

  /**
   * Avanza di `dt` secondi. Restituisce true se la molla è ancora in moto
   * dopo il passo, false se si è fermata (e allora vale esattamente l'obiettivo).
   */
  passo(dt: number): boolean {
    if (this.ferma) {
      this.valore = this.obiettivo;
      this.velocita = 0;
      return false;
    }
    const h = dt <= 0 ? 0 : Math.min(dt, DT_MASSIMO);
    if (h === 0) return true;

    const w = this.omega;
    const z = this.zeta;
    const x0 = this.valore - this.obiettivo;
    const v0 = this.velocita;
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

    this.valore = this.obiettivo + x;
    this.velocita = v;

    if (this.ferma) {
      this.valore = this.obiettivo;
      this.velocita = 0;
      return false;
    }
    return true;
  }
}

/**
 * Inseguimento esponenziale indipendente dal frame rate.
 * `fattore60` è la frazione di distanza coperta in un frame a 60 Hz
 * (la luce radente usa 0,08, come da creative director).
 */
export function seguiDt(corrente: number, obiettivo: number, fattore60: number, dt: number): number {
  const f = Math.min(Math.max(fattore60, 0), 1);
  const k = 1 - Math.pow(1 - f, Math.max(0, dt) * 60);
  return corrente + (obiettivo - corrente) * k;
}

/** Come `seguiDt` ma per angoli in gradi: prende sempre la via più corta. */
export function seguiAngoloDt(corrente: number, obiettivo: number, fattore60: number, dt: number): number {
  let delta = ((obiettivo - corrente) % 360 + 540) % 360 - 180;
  if (delta === -180) delta = 180;
  const f = Math.min(Math.max(fattore60, 0), 1);
  const k = 1 - Math.pow(1 - f, Math.max(0, dt) * 60);
  return (((corrente + delta * k) % 360) + 360) % 360;
}
