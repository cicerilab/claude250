/**
 * IMPRONTA · materiali three e layout degli uniform (webgl-artist)
 *
 * Tre materiali, tutti su una PlaneGeometry(2, 2) a schermo intero:
 *
 *   1. RILIEVO   (relief.frag.glsl)    il frame: carta + blocchi. 1 draw call.
 *   2. BLUR      (blur.frag.glsl)      cottura, 2 passaggi per maschera.
 *   3. COMPOSITE (composite.frag.glsl) cottura, 1 passaggio nello slot dell'atlante.
 *
 * Cottura di un blocco (la orchestra atlas.ts dello shader-engineer):
 *
 *   maschera (canvas 2D, maskPainter) ──CanvasTexture──▶ BLUR passaggio 0 (orizz.) ─▶ RT A
 *   RT A ─▶ BLUR passaggio 1 (vert.) ─▶ RT B
 *   maschera + RT B ─▶ COMPOSITE con viewport/scissor sullo slot ─▶ atlante
 *
 * RT A e RT B hanno la misura della maschera, ClampToEdge, LinearFilter,
 * senza depth. Tutti i materiali di cottura hanno blending spento.
 *
 * Tutti i materiali sono ShaderMaterial (non Raw) scritti in GLSL ES 1.0:
 * three li converte da solo in GLSL 3.0 su WebGL2 e li usa così come sono su
 * WebGL1. Nessuna estensione richiesta (niente derivate, niente float render
 * target obbligatori).
 *
 * ---------------------------------------------------------------------------
 * LAYOUT DEGLI UNIFORM DEL RILIEVO (per frame, 1 draw call)
 *
 * Globali (9 vec4):
 *   uView         [w_buffer, h_buffer, dpr, scrollY_css]
 *   uMeta         [w_atlante, h_atlante, numero_blocchi, 0]
 *   uLight        [lx, ly, lz, intensità]   direzione verso la luce, spazio pagina (y in basso)
 *   uLightPos     [x_buffer, y_buffer, altezza_buffer, peso]  lampada del riflesso lamina
 *   uPaper        [pendenzaFibra, sensibilitàLuce, ombraContatto, fondoSolco]
 *   uLamina       [r, g, b, 1]  argento dai token, sRGB 0..1
 *   uLaminaParam  [venaturaX, venaturaY, riflessoMax, satinato]
 *   uWave         [cx_buffer, cy_buffer, raggio_buffer, sfumatura_buffer]
 *   uCarteAttive  [carta_foglio, carta_in_arrivo, onda_attiva(0/1), 0]
 *
 * Carte (16 vec4 = 4 carte × 4 colori, ordine ORDINE_CARTE di presets.ts):
 *   uCarte[c*4 + 0]  [fondo.rgb,      fibra]
 *   uCarte[c*4 + 1]  [luce.rgb,       luceForza]
 *   uCarte[c*4 + 2]  [ombra.rgb,      ombraForza]
 *   uCarte[c*4 + 3]  [inchiostro.rgb, assorbimento]
 *
 * Blocchi (4 vec4 × MAX_BLOCCHI = 32 vec4). Per il blocco i:
 *   uBlockRect[i]  [x, y, w, h]   px del buffer, origine in ALTO a sinistra,
 *                                  rettangolo NON ruotato, già allargato di
 *                                  `padCss * dpr` per lato (vedi maskPainter)
 *   uBlockUv[i]    [u0, v0, du, dv]  slot nell'atlante; v0 = bordo BASSO dello
 *                                  slot (coordinate texture GL). La maschera è
 *                                  caricata con flipY = true (default di three).
 *   uBlockA[i]     [pressione, rotazione_rad, profondità_buffer, carta_pezzo]
 *                   pressione 0..~1.03 (il micro rimbalzo può superare 1),
 *                   rotazione oraria come CSS, carta_pezzo -1 = foglio
 *   uBlockB[i]     [inchiostro 0/1, lamina 0/1, stringiMin, spessore_buffer]
 *
 * Totale: 9 + 16 + 32 = 57 vec4 nel fragment (sotto i 64 garantiti in
 * pratica anche dai telefoni WebGL1; WebGL2 ne garantisce 224).
 * Campionatori: tAtlas, tFiber.
 *
 * Ordine dei blocchi: l'ultimo scritto vince dove due blocchi si coprono
 * (serve per i pezzi di "Per chi": prima i pezzi più "sotto").
 * ---------------------------------------------------------------------------
 */
import {
  NoBlending,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector4,
  type IUniform,
  type Texture,
} from 'three';

import fullscreenVert from './shaders/fullscreen.vert.glsl?raw';
import reliefFrag from './shaders/relief.frag.glsl?raw';
import blurFrag from './shaders/blur.frag.glsl?raw';
import compositeFrag from './shaders/composite.frag.glsl?raw';

import { FIBRA_LATO } from './fiber';
import {
  CARTA_GLOBALE,
  LAMINA,
  ORDINE_CARTE,
  PRESET_CARTA,
  PRESET_TECNICA,
  direzioneLuce,
  hexARgb,
  indiceCarta,
  puntoLuce,
  type CartaGL,
  type PaletteCarta,
  type ParametriBloccoGL,
  type RGB,
  type TecnicaGL,
} from './presets';

/** Massimo di blocchi a rilievo per frame (tech-architect §7.2). */
export const MAX_BLOCCHI = 8;
/** Piano del foglio nel canale R dell'atlante (vedi composite.frag.glsl). */
export const HEIGHT_BIAS = 0.12;

/* ------------------------------------------------------------------------- */
/* Tipi degli uniform                                                         */
/* ------------------------------------------------------------------------- */

type U<T> = IUniform<T>;

export interface UniformiRilievo {
  [nome: string]: IUniform;
  tAtlas: U<Texture | null>;
  tFiber: U<Texture | null>;
  uView: U<Vector4>;
  uMeta: U<Vector4>;
  uLight: U<Vector4>;
  uLightPos: U<Vector4>;
  uPaper: U<Vector4>;
  uLamina: U<Vector4>;
  uLaminaParam: U<Vector4>;
  uWave: U<Vector4>;
  uCarteAttive: U<Vector4>;
  /** 16 vec4 appiattiti (64 float). */
  uCarte: U<Float32Array>;
  /** MAX_BLOCCHI vec4 appiattiti ciascuno (32 float). */
  uBlockRect: U<Float32Array>;
  uBlockUv: U<Float32Array>;
  uBlockA: U<Float32Array>;
  uBlockB: U<Float32Array>;
}

export interface UniformiBlur {
  [nome: string]: IUniform;
  tSrc: U<Texture | null>;
  uTexel: U<Vector2>;
  uDir: U<Vector2>;
  uRaggi: U<Vector4>;
  uPassaggio: U<number>;
}

export interface UniformiComposite {
  [nome: string]: IUniform;
  tMask: U<Texture | null>;
  tBlur: U<Texture | null>;
  uProfilo: U<Vector4>;
}

export type MaterialeRilievo = ShaderMaterial & { uniforms: UniformiRilievo };
export type MaterialeBlur = ShaderMaterial & { uniforms: UniformiBlur };
export type MaterialeComposite = ShaderMaterial & { uniforms: UniformiComposite };

/* ------------------------------------------------------------------------- */
/* Creazione                                                                  */
/* ------------------------------------------------------------------------- */

/** Geometria a schermo intero condivisa dai tre materiali (i vertici sono già in clip space). */
export function creaGeometriaSchermo(): PlaneGeometry {
  return new PlaneGeometry(2, 2);
}

const DEFINE_COMUNI = {
  MAX_BLOCCHI: String(MAX_BLOCCHI),
  HEIGHT_BIAS: HEIGHT_BIAS.toFixed(4),
  FIBRA_LATO: FIBRA_LATO.toFixed(1),
};

export interface OpzioniRilievo {
  atlante: Texture | null;
  fibra: Texture | null;
  larghezzaAtlante: number;
  altezzaAtlante: number;
  /** Lato della texture di fibra (DatiFibra.lato); default FIBRA_LATO. */
  latoFibra?: number;
}

/**
 * Crea il materiale del frame. Parte con carta Citrino (indice 0) e luce a
 * riposo; i colori veri vanno impostati subito con `impostaCarte()`.
 */
export function creaMaterialeRilievo(opzioni: OpzioniRilievo): MaterialeRilievo {
  const [lx, ly, lz] = direzioneLuce(135, 22);
  const uniforms: UniformiRilievo = {
    tAtlas: { value: opzioni.atlante },
    tFiber: { value: opzioni.fibra },
    uView: { value: new Vector4(1, 1, 1, 0) },
    uMeta: { value: new Vector4(opzioni.larghezzaAtlante, opzioni.altezzaAtlante, 0, 0) },
    uLight: { value: new Vector4(lx, ly, lz, 1) },
    uLightPos: { value: new Vector4(0, 0, 1000, 1) },
    uPaper: {
      value: new Vector4(
        CARTA_GLOBALE.pendenzaFibra,
        CARTA_GLOBALE.sensibilitaLuce,
        CARTA_GLOBALE.ombraContatto,
        CARTA_GLOBALE.fondoSolco,
      ),
    },
    uLamina: { value: new Vector4(0.78, 0.8, 0.82, 1) },
    uLaminaParam: {
      value: new Vector4(LAMINA.venaturaX, LAMINA.venaturaY, LAMINA.riflessoMax, LAMINA.satinato),
    },
    uWave: { value: new Vector4(0, 0, 0, 1) },
    uCarteAttive: { value: new Vector4(0, 0, 0, 0) },
    uCarte: { value: new Float32Array(64) },
    uBlockRect: { value: new Float32Array(MAX_BLOCCHI * 4) },
    uBlockUv: { value: new Float32Array(MAX_BLOCCHI * 4) },
    uBlockA: { value: new Float32Array(MAX_BLOCCHI * 4) },
    uBlockB: { value: new Float32Array(MAX_BLOCCHI * 4) },
  };
  const m = new ShaderMaterial({
    name: 'impronta-rilievo',
    uniforms,
    vertexShader: fullscreenVert,
    fragmentShader: reliefFrag,
    defines: { ...DEFINE_COMUNI, FIBRA_LATO: (opzioni.latoFibra ?? FIBRA_LATO).toFixed(1) },
    depthTest: false,
    depthWrite: false,
    transparent: false,
    blending: NoBlending,
  });
  return m as MaterialeRilievo;
}

export function creaMaterialeBlur(): MaterialeBlur {
  const uniforms: UniformiBlur = {
    tSrc: { value: null },
    uTexel: { value: new Vector2(1, 1) },
    uDir: { value: new Vector2(1, 0) },
    uRaggi: { value: new Vector4(1, 2, 4, 0.5) },
    uPassaggio: { value: 0 },
  };
  const m = new ShaderMaterial({
    name: 'impronta-blur',
    uniforms,
    vertexShader: fullscreenVert,
    fragmentShader: blurFrag,
    defines: { ...DEFINE_COMUNI },
    depthTest: false,
    depthWrite: false,
    transparent: false,
    blending: NoBlending,
  });
  return m as MaterialeBlur;
}

export function creaMaterialeComposite(): MaterialeComposite {
  const uniforms: UniformiComposite = {
    tMask: { value: null },
    tBlur: { value: null },
    uProfilo: { value: new Vector4(0.5, 0.3, 0.2, 0.12) },
  };
  const m = new ShaderMaterial({
    name: 'impronta-composite',
    uniforms,
    vertexShader: fullscreenVert,
    fragmentShader: compositeFrag,
    defines: { ...DEFINE_COMUNI },
    depthTest: false,
    depthWrite: false,
    transparent: false,
    blending: NoBlending,
  });
  return m as MaterialeComposite;
}

/* ------------------------------------------------------------------------- */
/* Cottura                                                                    */
/* ------------------------------------------------------------------------- */

/**
 * Prepara un passaggio di blur.
 * @param sorgente passaggio 0: la CanvasTexture della maschera; passaggio 1: RT A
 * @param larghezza/altezza misura in texel della sorgente
 * @param raggi [r1, r2, r3, rInk] in texel (da `RisultatoMaschera.raggiTexel`)
 */
export function impostaBlur(
  m: MaterialeBlur,
  sorgente: Texture,
  larghezza: number,
  altezza: number,
  passaggio: 0 | 1,
  raggi: readonly [number, number, number, number],
): void {
  const u = m.uniforms;
  u.tSrc.value = sorgente;
  u.uTexel.value.set(1 / Math.max(1, larghezza), 1 / Math.max(1, altezza));
  if (passaggio === 0) u.uDir.value.set(1, 0);
  else u.uDir.value.set(0, 1);
  u.uRaggi.value.set(raggi[0], raggi[1], raggi[2], raggi[3]);
  u.uPassaggio.value = passaggio;
}

/** Prepara il composite nello slot con il profilo della tecnica del blocco. */
export function impostaComposite(
  m: MaterialeComposite,
  maschera: Texture,
  blur: Texture,
  tecnica: TecnicaGL,
): void {
  const u = m.uniforms;
  const p = PRESET_TECNICA[tecnica].profilo;
  u.tMask.value = maschera;
  u.tBlur.value = blur;
  u.uProfilo.value.set(p[0], p[1], p[2], p[3]);
}

/* ------------------------------------------------------------------------- */
/* Frame: globali                                                             */
/* ------------------------------------------------------------------------- */

/** Da chiamare su resize, cambio DPR e a ogni frame per lo scroll. */
export function impostaVista(
  m: MaterialeRilievo,
  larghezzaBuffer: number,
  altezzaBuffer: number,
  dpr: number,
  scrollYCss: number,
): void {
  m.uniforms.uView.value.set(larghezzaBuffer, altezzaBuffer, dpr, scrollYCss);
}

export function impostaAtlante(m: MaterialeRilievo, atlante: Texture, larghezza: number, altezza: number): void {
  m.uniforms.tAtlas.value = atlante;
  m.uniforms.uMeta.value.x = larghezza;
  m.uniforms.uMeta.value.y = altezza;
}

export function impostaNumeroBlocchi(m: MaterialeRilievo, n: number): void {
  m.uniforms.uMeta.value.z = Math.max(0, Math.min(MAX_BLOCCHI, Math.floor(n)));
}

/**
 * Luce radente. `intensita` 0..1 serve solo alla dissolvenza d'ingresso del
 * canvas (a 0 la carta è piatta). Aggiorna anche la lampada del riflesso
 * della lamina, che dipende dalla misura del buffer: chiamarla dopo impostaVista.
 */
export function impostaLuce(
  m: MaterialeRilievo,
  azimutGradi: number,
  elevazioneGradi: number,
  intensita = 1,
): void {
  const [lx, ly, lz] = direzioneLuce(azimutGradi, elevazioneGradi);
  m.uniforms.uLight.value.set(lx, ly, lz, intensita);
  const v = m.uniforms.uView.value;
  const [px, py, pz] = puntoLuce(azimutGradi, elevazioneGradi, v.x, v.y);
  m.uniforms.uLightPos.value.set(px, py, pz, m.uniforms.uLightPos.value.w);
}

/**
 * Sposta la lampada del riflesso sotto il puntatore (opzionale: se non si
 * chiama, il riflesso segue solo l'azimut). `peso` 0..1 = quanto il riflesso
 * è pieno; 1 quando il puntatore è sulla pagina, 0,6 a riposo.
 */
export function impostaLampada(
  m: MaterialeRilievo,
  xBuffer: number,
  yBuffer: number,
  altezzaBuffer: number,
  peso: number,
): void {
  m.uniforms.uLightPos.value.set(xBuffer, yBuffer, Math.max(1, altezzaBuffer), Math.max(0, Math.min(1, peso)));
}

/** Colore della lamina dai token (hex o vec3). */
export function impostaLamina(m: MaterialeRilievo, colore: string | RGB): void {
  const c = typeof colore === 'string' ? hexARgb(colore) : colore;
  m.uniforms.uLamina.value.set(c[0], c[1], c[2], 1);
}

/**
 * Scrive i colori delle quattro carte (dai token, già passati da
 * `paletteCarta()`) e i parametri di materiale di PRESET_CARTA negli alpha.
 * Si chiama una volta alla creazione (e se i token cambiano in sviluppo).
 */
export function impostaCarte(m: MaterialeRilievo, palette: Readonly<Record<CartaGL, PaletteCarta>>): void {
  const a = m.uniforms.uCarte.value;
  ORDINE_CARTE.forEach((carta, c) => {
    const pal = palette[carta];
    const pre = PRESET_CARTA[carta];
    const o = c * 16;
    scriviVec4(a, o + 0, pal.fondo, pre.fibra);
    scriviVec4(a, o + 4, pal.luce, pre.luceForza);
    scriviVec4(a, o + 8, pal.ombra, pre.ombraForza);
    scriviVec4(a, o + 12, pal.inchiostro, pre.assorbimento);
  });
}

/** Carta del foglio a riposo (nessuna onda in corso). */
export function impostaCartaAttiva(m: MaterialeRilievo, carta: CartaGL): void {
  const i = Math.max(0, indiceCarta(carta));
  m.uniforms.uCarteAttive.value.set(i, i, 0, 0);
}

/**
 * Onda del cambio carta (la carta nuova si propaga dal punto toccato).
 * Passare `null` quando l'onda è finita: il foglio diventa `a` ovunque.
 * Coordinate e misure in px del buffer.
 */
export function impostaOnda(
  m: MaterialeRilievo,
  onda: { x: number; y: number; raggio: number; sfumatura: number; da: CartaGL; a: CartaGL } | null,
  cartaFinale?: CartaGL,
): void {
  if (!onda) {
    if (cartaFinale) impostaCartaAttiva(m, cartaFinale);
    else m.uniforms.uCarteAttive.value.z = 0;
    return;
  }
  m.uniforms.uWave.value.set(onda.x, onda.y, Math.max(0, onda.raggio), Math.max(1, onda.sfumatura));
  m.uniforms.uCarteAttive.value.set(
    Math.max(0, indiceCarta(onda.da)),
    Math.max(0, indiceCarta(onda.a)),
    1,
    0,
  );
}

/* ------------------------------------------------------------------------- */
/* Frame: blocchi                                                             */
/* ------------------------------------------------------------------------- */

export interface DatiBloccoFrame {
  /** Rettangolo NON ruotato in px del buffer, già allargato del margine della maschera. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Slot nell'atlante in coordinate uv (v0 = bordo basso dello slot). */
  u0: number;
  v0: number;
  du: number;
  dv: number;
  /** 0..~1.03 */
  pressione: number;
  /** Gradi, orari come in CSS. */
  rotazioneGradi: number;
  /** Parte statica, da `parametriBlocco()` di presets.ts. */
  statici: ParametriBloccoGL;
}

/**
 * Scrive il blocco `i` negli array uniform. Da chiamare in blocks.ts per ogni
 * blocco visibile, poi `impostaNumeroBlocchi(n)`. Non alloca nulla.
 */
export function scriviBlocco(m: MaterialeRilievo, i: number, b: DatiBloccoFrame): void {
  if (i < 0 || i >= MAX_BLOCCHI) return;
  const o = i * 4;
  const u = m.uniforms;
  const r = u.uBlockRect.value;
  r[o] = b.x;
  r[o + 1] = b.y;
  r[o + 2] = Math.max(1, b.w);
  r[o + 3] = Math.max(1, b.h);
  const uv = u.uBlockUv.value;
  uv[o] = b.u0;
  uv[o + 1] = b.v0;
  uv[o + 2] = Math.max(1e-6, b.du);
  uv[o + 3] = Math.max(1e-6, b.dv);
  const a = u.uBlockA.value;
  a[o] = Math.max(0, Math.min(1.08, b.pressione));
  a[o + 1] = (b.rotazioneGradi * Math.PI) / 180;
  a[o + 2] = b.statici.profonditaBuffer;
  a[o + 3] = b.statici.cartaIndice;
  const bb = u.uBlockB.value;
  bb[o] = b.statici.inchiostro;
  bb[o + 1] = b.statici.lamina;
  bb[o + 2] = b.statici.stringiMin;
  bb[o + 3] = b.statici.spessoreBuffer;
}

function scriviVec4(a: Float32Array, o: number, rgb: RGB, w: number): void {
  a[o] = rgb[0];
  a[o + 1] = rgb[1];
  a[o + 2] = rgb[2];
  a[o + 3] = w;
}
