/**
 * CONTROPELO · valori caldi (tech-architect §6.2).
 *
 * Oggetto mutabile letto e scritto fuori da React (mai in uno stato React):
 * il viewport visivo e la tastiera virtuale (core/viewport.ts) e il segnale
 * "le misure sono da rileggere" per il motore del vapore (fase `read` del
 * ticker). Le maschere del vapore, i tratti in coda, le gocce e le zone
 * protette NON stanno qui: vivono dentro `vapore/motore.ts`.
 *
 * `interaction/pulire.ts` legge `runtime.viewport.tastiera` per non pulire
 * mentre la tastiera è aperta. Nessun accesso al browser a livello di modulo.
 */

export interface ViewportRuntime {
  /** Larghezza e altezza della finestra in px CSS (`innerWidth`/`innerHeight`). */
  w: number;
  h: number;
  dpr: number;
  /** Altezza e scostamento dall'alto del `visualViewport` (= h e 0 se non c'è). */
  vvH: number;
  vvTop: number;
  /** true quando il viewport visivo è più basso della finestra di oltre `SOGLIA_TASTIERA` px. */
  tastiera: boolean;
}

export interface Runtime {
  viewport: ViewportRuntime;
  /** true dopo resize, font arrivati, cambio di layout: il vapore rilegge i rettangoli in `read`. */
  misureSporche: boolean;
  /** Rimette tutto ai valori iniziali (Contropelo.tsx, prima del primo render). */
  reset(): void;
}

function viewportIniziale(): ViewportRuntime {
  return { w: 0, h: 0, dpr: 1, vvH: 0, vvTop: 0, tastiera: false };
}

export const runtime: Runtime = {
  viewport: viewportIniziale(),
  misureSporche: true,
  reset(): void {
    runtime.viewport = viewportIniziale();
    runtime.misureSporche = true;
  },
};
