/**
 * IMPRONTA · valori caldi (tech-architect §6.2, motion-designer §4.2,
 * interaction-designer §11.2).
 *
 * Oggetto mutabile, MAI nello stato React: lo leggono e lo scrivono i moduli
 * dentro il ticker. Nessun accesso al browser qui: i valori iniziali sono
 * neutri (viewport 0 prima del mount) e li aggiornano core/lenis.ts,
 * core/viewport.ts e interaction/light.ts.
 *
 * Chi scrive cosa:
 * - `scrollY`: il ticker, prima della fase 'read' (lenis.animatedScroll o
 *   window.scrollY);
 * - `viewport`: core/viewport.ts su resize e visualViewport resize;
 * - `pointer`, `light`: solo interaction/light.ts (target e lerp in 'update');
 * - `dirty` / `markDirty()`: chiunque cambi qualcosa di visibile nel GL; lo
 *   azzera il renderer dopo aver disegnato.
 */

/** 'dial' aggiunto da interaction-designer §11.2. */
export type LuceFonte = 'idle' | 'pointer' | 'touch' | 'gyro' | 'dial';

export type TipoPuntatore = 'mouse' | 'touch' | 'pen';

export interface Viewport {
  /** px CSS (window.innerWidth). 0 prima del montaggio. */
  w: number;
  /** px CSS (window.innerHeight). 0 prima del montaggio. */
  h: number;
  /** devicePixelRatio. */
  dpr: number;
}

export interface Puntatore {
  x: number;
  y: number;
  active: boolean;
  tipo: TipoPuntatore;
}

export interface Luce {
  /** Gradi: direzione DA CUI arriva la luce (0 destra, 90 alto, 135 riposo). */
  azimuth: number;
  /** Gradi sopra il foglio (18-25). */
  elevation: number;
  targetAzimuth: number;
  targetElevation: number;
  fonte: LuceFonte;
}

export interface Runtime {
  /** px, scroll corrente: lenis.animatedScroll, o window.scrollY senza lenis. Aggiornato prima della fase 'read'. */
  scrollY: number;
  /** px CSS e DPR. h = window.innerHeight. Aggiornato su resize (e visualViewport resize). 0 prima del montaggio. */
  viewport: Viewport;
  pointer: Puntatore;
  light: Luce;
  /** Il GL deve ridisegnare. */
  dirty: boolean;
  /** Segna il GL come sporco (chiunque cambi qualcosa di visibile nel GL). */
  markDirty(): void;
  /** Rimette i valori iniziali (al mount di Impronta.tsx). */
  reset(): void;
}

/** Luce di riposo: da sinistra in alto, radente (creative-director, art-director). */
export const LUCE_RIPOSO = { azimuth: 135, elevation: 22 } as const;

export const runtime: Runtime = {
  scrollY: 0,
  viewport: { w: 0, h: 0, dpr: 1 },
  pointer: { x: 0, y: 0, active: false, tipo: 'mouse' },
  light: {
    azimuth: LUCE_RIPOSO.azimuth,
    elevation: LUCE_RIPOSO.elevation,
    targetAzimuth: LUCE_RIPOSO.azimuth,
    targetElevation: LUCE_RIPOSO.elevation,
    fonte: 'idle',
  },
  dirty: true,
  markDirty(): void {
    runtime.dirty = true;
  },
  reset(): void {
    runtime.scrollY = 0;
    runtime.pointer.x = 0;
    runtime.pointer.y = 0;
    runtime.pointer.active = false;
    runtime.pointer.tipo = 'mouse';
    runtime.light.azimuth = LUCE_RIPOSO.azimuth;
    runtime.light.elevation = LUCE_RIPOSO.elevation;
    runtime.light.targetAzimuth = LUCE_RIPOSO.azimuth;
    runtime.light.targetElevation = LUCE_RIPOSO.elevation;
    runtime.light.fonte = 'idle';
    runtime.dirty = true;
  },
};
