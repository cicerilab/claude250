/**
 * SOTTOPELLE · il programma della tessera: compila, collega, mappa le uniform.
 *
 * Contratto con lo shader-engineer (PareteGL.ts). Uso tipico per frame:
 *
 *   usaProgramma(p);                                  // useProgram + attributo del quad
 *   impostaComuni(p, { larghezza, altezza, modulo, nero, grigio });
 *   for (ogni istanza visibile con texture pronta) {
 *     gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
 *     impostaTessera(p, valori);                      // oggetto riusato, niente allocazioni
 *     gl.drawArrays(gl.TRIANGLE_STRIP, 0, QUAD_VERTICI);
 *   }
 *
 * Stato GL richiesto: niente blending (lo shader mescola già con uNero, le
 * tessere non si sovrappongono), niente depth test, clear color = nero dei
 * token. Texture: RGBA, LINEAR, CLAMP_TO_EDGE, niente mipmap,
 * UNPACK_FLIP_Y_WEBGL false (uv 0,0 = angolo in alto a sinistra della foto),
 * UNPACK_PREMULTIPLY_ALPHA_WEBGL false.
 *
 * GLSL ES 1.00: lo stesso sorgente compila su WebGL1 e WebGL2. Serve highp
 * nel fragment: senza, creaProgramma() risponde { ok: false, motivo: 'highp' }
 * e il concept resta nel fallback DOM. Nessun accesso al browser a livello di
 * modulo.
 */
import sorgenteVertex from './shaders/tessera.vert.glsl?raw';
import sorgenteFragment from './shaders/tessera.frag.glsl?raw';
import { definizioniGLSL } from './presets';

export type ContestoGL = WebGLRenderingContext | WebGL2RenderingContext;
export type Vec3 = readonly [number, number, number];

export type TipoUniform = 'float' | 'vec2' | 'vec3' | 'vec4' | 'sampler2D';

/** Tutte le uniform del programma, con il loro tipo GLSL. */
export const UNIFORM = {
  /** Canvas in px fisici (w, h). Comune. */
  uRisoluzione: 'vec2',
  /** Px fisici di un modulo della parete: runtime.modulo × DPR del canvas. Comune. */
  uModulo: 'float',
  /** Colore del fondo e dell'inchiostro, rgb 0..1 (COLORI del nero in tokens.ts). Comune. */
  uNero: 'vec3',
  /** Grigio sfumato, rgb 0..1: filamenti e arretramento. Comune. */
  uGrigio: 'vec3',
  /** Tessera in px fisici (x, y, w, h), origine in alto a sinistra del canvas. */
  uRett: 'vec4',
  /** Texture della foto, unità 0. */
  uFoto: 'sampler2D',
  /** Avanzamento dello sboccio 0..1 LINEARE nel tempo (la frenata è nello shader); 1 = posata. */
  uSboccio: 'float',
  /** Punto d'ingresso in uv della tessera (0,0 in alto a sinistra). Il centro (0,5; 0,5) = nuvola tonda. */
  uIngresso: 'vec2',
  /** Seme 0..1 della forma della nuvola, uno per foto. */
  uSeme: 'float',
  /** Increspatura: u, v del punto toccato, t in secondi dall'avvio; t < 0 = nessuna. */
  uIncr: 'vec3',
  /** Arretramento dei filtri 0..1 (0 = foto piena). */
  uArretra: 'float',
  /** Opacità 0..1 sul nero: 1 sempre, tranne la dissolvenza di 150 ms in reduced motion. */
  uOpacita: 'float',
} as const satisfies Readonly<Record<string, TipoUniform>>;

export type NomeUniform = keyof typeof UNIFORM;

/** L'unico attributo: l'angolo del quad unitario, legato alla posizione 0. */
export const ATTRIBUTO_ANGOLO = 'aAngolo';
export const POSIZIONE_ANGOLO = 0;

/** Quad unitario per TRIANGLE_STRIP: (0,0) (1,0) (0,1) (1,1). Due float per vertice. */
export const QUAD_ANGOLI: readonly number[] = [0, 0, 1, 0, 0, 1, 1, 1];
export const QUAD_VERTICI = 4;

export interface Programma {
  readonly gl: ContestoGL;
  readonly programma: WebGLProgram;
  readonly u: { readonly [K in NomeUniform]: WebGLUniformLocation | null };
}

export type MotivoErrore = 'contesto' | 'highp' | 'vertex' | 'fragment' | 'link';

export type EsitoProgramma =
  | { readonly ok: true; readonly programma: Programma }
  | { readonly ok: false; readonly motivo: MotivoErrore; readonly log: string };

/** Valori comuni a tutte le tessere di un frame. */
export interface ValoriComuni {
  /** Canvas in px fisici. */
  larghezza: number;
  altezza: number;
  /** Modulo della parete in px fisici. */
  modulo: number;
  nero: Vec3;
  grigio: Vec3;
}

/** Valori di una tessera: oggetto piatto, da riusare tra un disegno e l'altro. */
export interface ValoriTessera {
  /** Rettangolo in px fisici: (mondo − pan) × DPR. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** 0..1 lineare; 1 = posata. */
  sboccio: number;
  ingressoU: number;
  ingressoV: number;
  seme: number;
  /** Increspatura: incrT < 0 = nessuna. */
  incrU: number;
  incrV: number;
  incrT: number;
  arretra: number;
  opacita: number;
}

/** Una tessera posata, ferma, piena: base da copiare nell'oggetto riusato. */
export const TESSERA_POSATA: Readonly<ValoriTessera> = {
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  sboccio: 1,
  ingressoU: 0.5,
  ingressoV: 0.5,
  seme: 0,
  incrU: 0.5,
  incrV: 0.5,
  incrT: -1,
  arretra: 0,
  opacita: 1,
};

/** I sorgenti completi (intestazione dei preset + file .glsl), utili anche per le prove. */
export function sorgenti(): { vertex: string; fragment: string } {
  const intestazione = definizioniGLSL();
  return {
    vertex: `${intestazione}\n${sorgenteVertex}`,
    fragment: `${intestazione}\n${sorgenteFragment}`,
  };
}

/** true se il fragment shader ha float highp (serve al rumore e alle coordinate in moduli). */
export function haHighp(gl: ContestoGL): boolean {
  const formato = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  return formato !== null && formato.precision > 0;
}

function compila(
  gl: ContestoGL,
  tipo: number,
  sorgente: string,
): { shader: WebGLShader } | { log: string } {
  const shader = gl.createShader(tipo);
  if (!shader) return { log: 'createShader ha restituito null' };
  gl.shaderSource(shader, sorgente);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'compilazione fallita senza log';
    gl.deleteShader(shader);
    return { log };
  }
  return { shader };
}

/**
 * Compila e collega il programma. Imposta i valori di partenza (sampler
 * sull'unità 0, opacità 1, nessuna increspatura, niente arretramento).
 * Non lancia: in caso di errore restituisce il motivo e il log del driver.
 */
export function creaProgramma(gl: ContestoGL): EsitoProgramma {
  if (gl.isContextLost()) return { ok: false, motivo: 'contesto', log: 'contesto perso' };
  if (!haHighp(gl)) return { ok: false, motivo: 'highp', log: 'highp non disponibile nel fragment' };

  const { vertex, fragment } = sorgenti();
  const vs = compila(gl, gl.VERTEX_SHADER, vertex);
  if (!('shader' in vs)) return { ok: false, motivo: 'vertex', log: vs.log };
  const fs = compila(gl, gl.FRAGMENT_SHADER, fragment);
  if (!('shader' in fs)) {
    gl.deleteShader(vs.shader);
    return { ok: false, motivo: 'fragment', log: fs.log };
  }

  const programma = gl.createProgram();
  if (!programma) {
    gl.deleteShader(vs.shader);
    gl.deleteShader(fs.shader);
    return { ok: false, motivo: 'link', log: 'createProgram ha restituito null' };
  }
  gl.attachShader(programma, vs.shader);
  gl.attachShader(programma, fs.shader);
  gl.bindAttribLocation(programma, POSIZIONE_ANGOLO, ATTRIBUTO_ANGOLO);
  gl.linkProgram(programma);
  const collegato = gl.getProgramParameter(programma, gl.LINK_STATUS) === true;
  gl.detachShader(programma, vs.shader);
  gl.detachShader(programma, fs.shader);
  gl.deleteShader(vs.shader);
  gl.deleteShader(fs.shader);
  if (!collegato) {
    const log = gl.getProgramInfoLog(programma) ?? 'link fallito senza log';
    gl.deleteProgram(programma);
    return { ok: false, motivo: 'link', log };
  }

  const nomi = Object.keys(UNIFORM) as NomeUniform[];
  const u = {} as { [K in NomeUniform]: WebGLUniformLocation | null };
  for (const nome of nomi) u[nome] = gl.getUniformLocation(programma, nome);

  const p: Programma = { gl, programma, u };
  gl.useProgram(programma);
  gl.uniform1i(u.uFoto, 0);
  impostaTessera(p, TESSERA_POSATA);
  return { ok: true, programma: p };
}

/**
 * useProgram + attributo del quad. `buffer` è il buffer con QUAD_ANGOLI
 * (Float32Array, STATIC_DRAW) creato da PareteGL.
 */
export function usaProgramma(p: Programma, buffer: WebGLBuffer): void {
  const { gl } = p;
  gl.useProgram(p.programma);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(POSIZIONE_ANGOLO);
  gl.vertexAttribPointer(POSIZIONE_ANGOLO, 2, gl.FLOAT, false, 0, 0);
}

/** Crea il buffer statico del quad unitario. */
export function creaQuad(gl: ContestoGL): WebGLBuffer | null {
  const buffer = gl.createBuffer();
  if (!buffer) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_ANGOLI), gl.STATIC_DRAW);
  return buffer;
}

/** Uniform comuni: dopo usaProgramma, a ogni frame che disegna (costano poco). */
export function impostaComuni(p: Programma, v: ValoriComuni): void {
  const { gl, u } = p;
  gl.uniform2f(u.uRisoluzione, v.larghezza, v.altezza);
  gl.uniform1f(u.uModulo, v.modulo);
  gl.uniform3f(u.uNero, v.nero[0], v.nero[1], v.nero[2]);
  gl.uniform3f(u.uGrigio, v.grigio[0], v.grigio[1], v.grigio[2]);
}

/** Uniform di una tessera, prima del suo drawArrays. */
export function impostaTessera(p: Programma, v: Readonly<ValoriTessera>): void {
  const { gl, u } = p;
  gl.uniform4f(u.uRett, v.x, v.y, v.w, v.h);
  gl.uniform1f(u.uSboccio, v.sboccio);
  gl.uniform2f(u.uIngresso, v.ingressoU, v.ingressoV);
  gl.uniform1f(u.uSeme, v.seme);
  gl.uniform3f(u.uIncr, v.incrU, v.incrV, v.incrT);
  gl.uniform1f(u.uArretra, v.arretra);
  gl.uniform1f(u.uOpacita, v.opacita);
}

/** Libera il programma (allo smontaggio o prima di WEBGL_lose_context). */
export function distruggiProgramma(p: Programma): void {
  if (!p.gl.isContextLost()) p.gl.deleteProgram(p.programma);
}
