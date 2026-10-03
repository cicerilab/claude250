/**
 * MADRE · materiale dell'impasto (webgl-artist).
 *
 * Un solo ShaderMaterial, una draw call, una texture 256² (spolvero).
 * Niente luci di three, niente render target, niente post-processing.
 *
 * Layout degli uniform (tech-architect §8.2, più quelli di composizione che
 * scrive solo questo file):
 *
 * | Uniform            | Tipo        | Chi lo scrive                                      |
 * |--------------------|-------------|----------------------------------------------------|
 * | uFossette[3]       | vec4        | shader-engineer: scriviFossette() da runtime        |
 * |                    |             | (u, v, profondità 0..1, segno 0..1)                |
 * | uRespiro           | float       | shader-engineer: scriviRespiro(), -1..1            |
 * | uSegnoCliente      | vec3        | shader-engineer: scriviSegnoCliente() (u, v, 0/1)  |
 * | uRidotto           | float 0/1   | shader-engineer: scriviRidotto()                   |
 * | uRisoluzione       | vec2        | shader-engineer: scriviRisoluzione() px × dpr      |
 * | uAspetto           | float       | shader-engineer: impostaAspetto() (aspetto PIANO)  |
 * | uPagnotta          | vec4        | impostaAspetto(): cx, cy, raggio, altezza          |
 * | uGonfiature[3]     | vec4        | impostaAspetto(): cx, cy, raggio, ampiezza         |
 * | uPiega, uPiegaArco | vec4        | impostaAspetto(): piega di chiusura                |
 * | uFarina, uFarinaOmbra, uImpastoNudo | vec3 lineari | qui, da styles/tokens.ts         |
 * | uSpolvero          | sampler2D   | qui, da spolvero.ts (RepeatWrapping, mipmap)       |
 *
 * Coordinate: uv del PlaneGeometry (u da sinistra, v dal basso). Le fossette
 * usano le stesse uv (quelle del raycast sul piano, corrette con
 * forma.ts/altezzaMacro). Il renderer deve restare con outputColorSpace
 * SRGB (default di three 0.160) e toneMapping NoToneMapping (default): lo
 * shader lavora in lineare e converte all'uscita con <colorspace_fragment>.
 */
import { NoBlending, ShaderMaterial, Vector2, Vector3, Vector4 } from 'three';
import type { DataTexture, IUniform } from 'three';

import { COLORI_GL } from '../styles/tokens';
import { composizione, definesForma } from './forma';
import type { Composizione, Vec3 } from './forma';
import { creaSpolvero } from './spolvero';
import fragmentShader from './shaders/impasto.frag.glsl?raw';
import vertexShader from './shaders/impasto.vert.glsl?raw';

/** Colori dell'impasto in rgb LINEARE (0..1). */
export interface ColoriImpasto {
  farina: Vec3;
  farinaOmbra: Vec3;
  impastoNudo: Vec3;
}

export interface UniformImpasto {
  [nome: string]: IUniform;
  uFossette: IUniform<Vector4[]>;
  uRespiro: IUniform<number>;
  uSegnoCliente: IUniform<Vector3>;
  uRidotto: IUniform<number>;
  uRisoluzione: IUniform<Vector2>;
  uAspetto: IUniform<number>;
  uPagnotta: IUniform<Vector4>;
  uGonfiature: IUniform<Vector4[]>;
  uPiega: IUniform<Vector4>;
  uPiegaArco: IUniform<Vector4>;
  uFarina: IUniform<Vector3>;
  uFarinaOmbra: IUniform<Vector3>;
  uImpastoNudo: IUniform<Vector3>;
  uSpolvero: IUniform<DataTexture>;
}

export type MaterialeImpasto = ShaderMaterial & { uniforms: UniformImpasto };

/** Una fossetta come la scrive motion/fossetta.ts (solo i campi letti qui). */
export interface FossettaGL {
  u: number;
  v: number;
  profondita: number;
  segno: number;
}

export interface OpzioniImpasto {
  /** colori lineari; di default quelli di styles/tokens.ts */
  colori?: ColoriImpasto;
  /** aspetto del piano iniziale (forma.ts/misuraPiano().aspetto) */
  aspetto?: number;
}

const COLORI_TOKEN: ColoriImpasto = {
  farina: COLORI_GL.farina,
  farinaOmbra: COLORI_GL.farinaOmbra,
  impastoNudo: COLORI_GL.impastoNudo,
};

const v3 = (c: Vec3): Vector3 => new Vector3(c[0], c[1], c[2]);

/**
 * Crea il materiale. La texture dello spolvero nasce qui (15-25 ms, una
 * volta) e si libera con `liberaImpastoMaterial`.
 */
export function createImpastoMaterial(opz: OpzioniImpasto = {}): MaterialeImpasto {
  const colori = opz.colori ?? COLORI_TOKEN;
  const uniforms: UniformImpasto = {
    uFossette: { value: [new Vector4(0.5, 0.5, 0, 0), new Vector4(0.5, 0.5, 0, 0), new Vector4(0.5, 0.5, 0, 0)] },
    uRespiro: { value: 0 },
    uSegnoCliente: { value: new Vector3(0.5, 0.5, 0) },
    uRidotto: { value: 0 },
    uRisoluzione: { value: new Vector2(1280, 800) },
    uAspetto: { value: 1.6 },
    uPagnotta: { value: new Vector4() },
    uGonfiature: { value: [new Vector4(), new Vector4(), new Vector4()] },
    uPiega: { value: new Vector4() },
    uPiegaArco: { value: new Vector4() },
    uFarina: { value: v3(colori.farina) },
    uFarinaOmbra: { value: v3(colori.farinaOmbra) },
    uImpastoNudo: { value: v3(colori.impastoNudo) },
    uSpolvero: { value: creaSpolvero() },
  };
  const materiale = new ShaderMaterial({
    name: 'MadreImpasto',
    uniforms,
    vertexShader,
    fragmentShader,
    defines: definesForma(),
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
    transparent: false,
    fog: false,
    lights: false,
  }) as MaterialeImpasto;
  impostaAspetto(materiale, opz.aspetto ?? 1.6);
  return materiale;
}

/**
 * Proporzione del PIANO (non della finestra): scrive uAspetto e la
 * composizione (pagnotta, gonfiature, piega). Restituisce la composizione,
 * che serve a forma.ts/altezzaMacro per il raycast.
 */
export function impostaAspetto(m: MaterialeImpasto, aspetto: number): Composizione {
  const c = composizione(aspetto);
  const u = m.uniforms;
  u.uAspetto.value = aspetto;
  u.uPagnotta.value.set(c.pagnotta[0], c.pagnotta[1], c.pagnotta[2], c.pagnotta[3]);
  c.gonfiature.forEach((g, i) => {
    u.uGonfiature.value[i]?.set(g[0], g[1], g[2], g[3]);
  });
  u.uPiega.value.set(c.piega[0], c.piega[1], c.piega[2], c.piega[3]);
  u.uPiegaArco.value.set(c.piegaArco[0], c.piegaArco[1], c.piegaArco[2], c.piegaArco[3]);
  return c;
}

/** Copia le tre fossette (ne legge al più tre; quelle mancanti si spengono). */
export function scriviFossette(m: MaterialeImpasto, fossette: readonly FossettaGL[]): void {
  const dst = m.uniforms.uFossette.value;
  for (let i = 0; i < 3; i++) {
    const f = fossette[i];
    const v = dst[i];
    if (!v) continue;
    if (f) v.set(f.u, f.v, Math.max(0, Math.min(1, f.profondita)), Math.max(0, Math.min(1, f.segno)));
    else v.set(0.5, 0.5, 0, 0);
  }
}

export function scriviRespiro(m: MaterialeImpasto, respiro: number): void {
  m.uniforms.uRespiro.value = Math.max(-1, Math.min(1, respiro));
}

export function scriviSegnoCliente(m: MaterialeImpasto, segno: { u: number; v: number } | null): void {
  if (segno) m.uniforms.uSegnoCliente.value.set(segno.u, segno.v, 1);
  else m.uniforms.uSegnoCliente.value.set(0.5, 0.5, 0);
}

export function scriviRidotto(m: MaterialeImpasto, ridotto: boolean): void {
  m.uniforms.uRidotto.value = ridotto ? 1 : 0;
}

/** px del drawing buffer (larghezza × dpr, altezza × dpr). */
export function scriviRisoluzione(m: MaterialeImpasto, larghezza: number, altezza: number): void {
  m.uniforms.uRisoluzione.value.set(larghezza, altezza);
}

/** Libera texture e programma. */
export function liberaImpastoMaterial(m: MaterialeImpasto): void {
  m.uniforms.uSpolvero.value.dispose();
  m.dispose();
}
