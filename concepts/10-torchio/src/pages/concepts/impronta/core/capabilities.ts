/**
 * IMPRONTA · rilevamento delle capacità del dispositivo (tech-architect §9.3).
 *
 * Tutte funzioni: nessun accesso al browser a livello di modulo. Chiamate da
 * Impronta.tsx al mount (e dallo store all'inizializzazione per il reduced
 * motion, che deve essere giusto già al primo render lato client).
 */

export type VersioneWebGL = 0 | 1 | 2;

export interface EsitoWebGL {
  readonly ok: boolean;
  readonly versione: VersioneWebGL;
  /** Perché no, se `ok` è false. */
  readonly motivo: 'nessuna-finestra' | 'nessun-contesto' | 'niente-highp' | null;
}

/** Forzatura da URL: `?gl=0` → spento, `?gl=1` → acceso anche con saveData. */
export type ForzaturaGL = 'auto' | 'on' | 'off';

const QUERY_REDUCED = '(prefers-reduced-motion: reduce)';
const QUERY_COARSE = '(pointer: coarse)';
const QUERY_SCURO = '(prefers-color-scheme: dark)';

function mediaQuery(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  try {
    return window.matchMedia(query);
  } catch {
    return null;
  }
}

/**
 * Prova a creare un contesto WebGL2 (poi WebGL1) su un canvas scartato
 * subito, con `failIfMajorPerformanceCaveat` (niente GPU software) e controlla
 * che il fragment shader abbia `highp`.
 */
export function detectWebGL(): EsitoWebGL {
  if (typeof document === 'undefined') return { ok: false, versione: 0, motivo: 'nessuna-finestra' };
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const attributi: WebGLContextAttributes = {
    failIfMajorPerformanceCaveat: true,
    antialias: false,
    depth: false,
    stencil: false,
    alpha: false,
    preserveDrawingBuffer: false,
  };
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let versione: VersioneWebGL = 0;
  try {
    gl = canvas.getContext('webgl2', attributi);
    if (gl !== null) versione = 2;
    if (gl === null) {
      gl = canvas.getContext('webgl', attributi);
      if (gl !== null) versione = 1;
    }
  } catch {
    gl = null;
  }
  if (gl === null) return { ok: false, versione: 0, motivo: 'nessun-contesto' };

  let highp = true;
  try {
    const precisione = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    highp = precisione !== null && precisione.precision > 0;
  } catch {
    highp = false;
  }
  // Il canvas di prova si scarta subito, liberando il contesto.
  try {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    // niente: il contesto verrà raccolto con il canvas
  }
  if (!highp) return { ok: false, versione, motivo: 'niente-highp' };
  return { ok: true, versione, motivo: null };
}

/** `prefers-reduced-motion: reduce` adesso. */
export function prefersReducedMotion(): boolean {
  return mediaQuery(QUERY_REDUCED)?.matches ?? false;
}

/** Ascolta i cambi di `prefers-reduced-motion`. Restituisce la funzione per smettere. */
export function ascoltaReducedMotion(fn: (ridotto: boolean) => void): () => void {
  const mq = mediaQuery(QUERY_REDUCED);
  if (mq === null) return () => undefined;
  const suCambio = (e: MediaQueryListEvent): void => {
    fn(e.matches);
  };
  mq.addEventListener('change', suCambio);
  return () => {
    mq.removeEventListener('change', suCambio);
  };
}

/** Puntatore principale grossolano (dito). */
export function isCoarsePointer(): boolean {
  return mediaQuery(QUERY_COARSE)?.matches ?? false;
}

/** Sistema in modo scuro (usato solo per la carta della prima visita: Grafite). */
export function prefersDark(): boolean {
  return mediaQuery(QUERY_SCURO)?.matches ?? false;
}

interface ConnessioneRisparmio {
  readonly saveData?: boolean;
}

/** `navigator.connection.saveData`: con il risparmio dati il WebGL non si carica. */
export function saveData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: ConnessioneRisparmio }).connection;
  return conn?.saveData === true;
}

/** Legge `?gl=` da una query string (`location.search`). */
export function leggiForzaturaGL(search: string): ForzaturaGL {
  const valore = new URLSearchParams(search).get('gl');
  if (valore === '0' || valore === 'off' || valore === 'no') return 'off';
  if (valore === '1' || valore === 'on' || valore === 'si') return 'on';
  return 'auto';
}
