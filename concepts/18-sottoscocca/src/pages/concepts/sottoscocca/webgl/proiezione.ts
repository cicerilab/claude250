/**
 * SOTTOSCOCCA · camera dal binario e proiezione dei punti (shader-engineer).
 *
 * Tech-architect §7.2: una fn nella fase `update`, DOPO il motore del ponte
 * (ponte/quota.ts è registrato prima da Radice):
 * - la posa della camera viene da `runtime.binario` e `runtime.discesa` con
 *   le chiavi del webgl-artist (`scena/binario.ts`), interpolate in modo
 *   LINEARE (motion-designer §12: l'easing è già nella quota, che sta ferma
 *   sulle chiavi; un secondo easing farebbe partire la camera in ritardo
 *   rispetto all'auto);
 * - `applicaPosa` solo se binario, discesa, orientamento o misura cambiano;
 * - i punti della quota più vicina (`plateauPiuVicino`) si proiettano in px
 *   CSS del viewport e finiscono in `runtime.punti`; gli altri sono
 *   `visibile: false`. Un punto dietro la camera o fuori dalla finestra è
 *   `visibile: false` (l'aggancio al bordo delle zone è dei Punti).
 *
 * La camera non si legge mai dal DOM. Nessun accesso al browser.
 */

import { PerspectiveCamera, Vector3 } from 'three';
import { ORDINE_PUNTI, PUNTI, type IdPunto, type Quota } from '../content/lavori';
import { plateauPiuVicino } from '../motion/percorso';
import type { Orientamento, PuntoProiettato } from '../state/runtime';
import { applicaPosa, creaPosa, posaDaBinario } from './scena';
import type { Scena } from './scena';

/** Interpolazione lineare delle chiavi (motion-designer §12). */
const lineare = (t: number): number => t;

/** Piano vicino e lontano della camera (m): la scena sta tutta tra 0,1 e 60. */
export const VICINO = 0.1;
export const LONTANO_CAMERA = 60;

export class Proiezione {
  readonly camera: PerspectiveCamera;

  private readonly posa = creaPosa();
  private readonly v = new Vector3();
  private binario = Number.NaN;
  private discesa = Number.NaN;
  private orient: Orientamento | '' = '';
  private w = 0;
  private h = 0;
  /** Versione della camera: cresce a ogni `applicaPosa` (per chi deve sapere se è cambiata). */
  versione = 0;

  constructor() {
    this.camera = new PerspectiveCamera(28, 16 / 9, VICINO, LONTANO_CAMERA);
  }

  /**
   * Porta la camera sulla posa del binario. Restituisce true se è cambiata
   * (serve un render e una nuova proiezione dei punti).
   */
  aggiornaCamera(binario: number, discesa: number, orient: Orientamento, w: number, h: number): boolean {
    if (
      binario === this.binario &&
      discesa === this.discesa &&
      orient === this.orient &&
      w === this.w &&
      h === this.h
    ) {
      return false;
    }
    this.binario = binario;
    this.discesa = discesa;
    this.orient = orient;
    this.w = w;
    this.h = h;
    posaDaBinario(binario, discesa, orient, this.posa, lineare);
    applicaPosa(this.camera, this.posa, orient, Math.max(1, w), Math.max(1, h));
    this.camera.updateMatrixWorld();
    this.versione += 1;
    return true;
  }

  /** Dimentica la posa: la prossima `aggiornaCamera` la ricalcola comunque. */
  invalida(): void {
    this.binario = Number.NaN;
  }

  /**
   * Proietta i punti della quota più vicina a `quotaCm` e li scrive in
   * `punti` (px CSS, origine in alto a sinistra della finestra). Scrive solo
   * i campi: nessuna allocazione.
   */
  proietta(scena: Scena, quotaCm: number, w: number, h: number, punti: Record<IdPunto, PuntoProiettato>): void {
    const q: Quota = plateauPiuVicino(quotaCm);
    for (const id of ORDINE_PUNTI) {
      const p = punti[id];
      const quote = PUNTI[id].quote as readonly Quota[];
      if (!quote.includes(q) || w <= 0 || h <= 0) {
        p.visibile = false;
        continue;
      }
      scena.ancoraMondo(id, q, this.v);
      this.v.project(this.camera);
      const x = (this.v.x * 0.5 + 0.5) * w;
      const y = (-this.v.y * 0.5 + 0.5) * h;
      const davanti = this.v.z > -1 && this.v.z < 1;
      p.x = x;
      p.y = y;
      p.visibile = davanti && x >= 0 && x <= w && y >= 0 && y <= h;
    }
  }
}
