/**
 * IMPRONTA · atlante delle mappe d'altezza (shader-engineer)
 *
 * Un solo WebGLRenderTarget quadrato (2048²) che contiene lo slot cotto di
 * ogni blocco a rilievo, più i due render target di appoggio del blur
 * separabile (RT A e RT B, alla misura della maschera che si sta cuocendo).
 *
 * ALLOCAZIONE A SCAFFALI. Gli slot si mettono in fila su "scaffali"
 * orizzontali; uno scaffale è alto quanto il primo slot che lo apre
 * (arrotondato a 8 texel, così slot di altezza simile lo riusano). Un nuovo
 * slot va:
 *   1. in uno slot liberato abbastanza grande (il più piccolo che basta);
 *   2. in coda a uno scaffale abbastanza alto ma non troppo (spreco ≤ 50%);
 *   3. su uno scaffale nuovo sopra gli altri;
 *   4. altrimenti niente: chi chiama libera i blocchi lontani (LRU) o, come
 *      ultima risorsa, azzera l'atlante e ricuoce i visibili.
 *
 * Tra due slot restano sempre GUTTER = 2 texel vuoti (richiesta del
 * webgl-artist, §3): lo shader tiene i campioni dentro lo slot a mezzo texel
 * dal bordo, ma il filtro lineare legge il vicino.
 *
 * COORDINATE. Quelle del render target, come `viewport.set`: x da sinistra,
 * y dal BASSO. Gli scaffali crescono verso l'alto. Così `uBlockUv.y` (v0) è
 * il bordo basso dello slot, come vuole relief.frag.glsl.
 *
 * FORMATO. HalfFloat se il contesto sa renderizzarci (WebGL2 con
 * EXT_color_buffer_float) e il dispositivo è un desktop (puntatore fine):
 * pareti più pulite nei corpi grandi, 32 MB di GPU. Sui telefoni resta a
 * 8 bit (16 MB, il budget di tech-architect §8): il webgl-artist l'ha
 * provato, la fibra fa da dithering.
 *
 * Nessun accesso a window/document.
 */
import {
  ClampToEdgeWrapping,
  HalfFloatType,
  LinearFilter,
  RGBAFormat,
  UnsignedByteType,
  WebGLRenderTarget,
  type TextureDataType,
  type WebGLRenderer,
} from 'three';

/** Lato dell'atlante in texel (tech-architect §7.4, budget §8). */
export const ATLANTE_LATO = 2048;
/** Texel vuoti tra due slot (webgl-artist §3). */
export const GUTTER = 2;
/** Gli scaffali nuovi si arrotondano a questo passo, per essere riusati. */
const PASSO_SCAFFALE = 8;
/** Spreco d'altezza massimo accettato mettendo uno slot su uno scaffale più alto. */
const SPRECO_MAX = 1.5;

export interface Slot {
  /** Progressivo, solo diagnostica. */
  readonly id: number;
  /** Angolo in basso a sinistra, texel del render target. */
  readonly x: number;
  readonly y: number;
  /** Capacità dello slot in texel (la maschera può occuparne meno). */
  readonly w: number;
  readonly h: number;
  libero: boolean;
}

interface Scaffale {
  readonly y: number;
  readonly h: number;
  /** Prima x libera in coda allo scaffale. */
  xLibero: number;
  readonly slot: Slot[];
}

/**
 * Tipo dei texel dei render target: HalfFloat solo se renderizzabile e su
 * desktop (vedi testa del file).
 */
export function tipoTexel(renderer: WebGLRenderer, grossolano: boolean): TextureDataType {
  if (grossolano) return UnsignedByteType;
  if (!renderer.capabilities.isWebGL2) return UnsignedByteType;
  return renderer.extensions.has('EXT_color_buffer_float') ? HalfFloatType : UnsignedByteType;
}

/** Render target senza depth, filtro lineare, ClampToEdge, niente mipmap. */
export function creaTarget(w: number, h: number, tipo: TextureDataType, nome: string): WebGLRenderTarget {
  const rt = new WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
    format: RGBAFormat,
    type: tipo,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    generateMipmaps: false,
    depthBuffer: false,
    stencilBuffer: false,
  });
  rt.texture.name = nome;
  return rt;
}

export class Atlante {
  /** Lato in texel. */
  readonly lato: number;
  /** Il render target che il materiale del rilievo legge come `tAtlas`. */
  readonly target: WebGLRenderTarget;
  /** Appoggi del blur (passaggio orizzontale → A, verticale → B). */
  readonly blurA: WebGLRenderTarget;
  readonly blurB: WebGLRenderTarget;
  readonly tipo: TextureDataType;

  private scaffali: Scaffale[] = [];
  private yLibero = 0;
  private contatore = 0;
  private usati = 0;

  constructor(tipo: TextureDataType, lato: number = ATLANTE_LATO) {
    this.lato = lato;
    this.tipo = tipo;
    this.target = creaTarget(lato, lato, tipo, 'impronta-atlante');
    this.blurA = creaTarget(64, 64, tipo, 'impronta-blur-a');
    this.blurB = creaTarget(64, 64, tipo, 'impronta-blur-b');
  }

  /** Lato massimo di una maschera che entra in uno slot. */
  get latoMaschera(): number {
    return this.lato - GUTTER * 2;
  }

  /** Frazione dell'area occupata dagli slot in uso (diagnostica). */
  get occupazione(): number {
    return this.usati / (this.lato * this.lato);
  }

  /** Slot in uso (diagnostica). */
  get numeroSlot(): number {
    let n = 0;
    for (const s of this.scaffali) for (const sl of s.slot) if (!sl.libero) n += 1;
    return n;
  }

  /**
   * Cerca spazio per una maschera w × h texel. null se l'atlante è pieno
   * (chi chiama libera qualcosa e riprova).
   */
  alloca(w: number, h: number): Slot | null {
    const lw = Math.ceil(w);
    const lh = Math.ceil(h);
    if (lw < 1 || lh < 1 || lw > this.latoMaschera || lh > this.latoMaschera) return null;

    // 1. Uno slot liberato che basta: il più piccolo.
    let migliore: Slot | null = null;
    for (const s of this.scaffali) {
      if (s.h < lh) continue;
      for (const sl of s.slot) {
        if (!sl.libero || sl.w < lw || sl.h < lh) continue;
        if (migliore === null || sl.w * sl.h < migliore.w * migliore.h) migliore = sl;
      }
    }
    if (migliore !== null) {
      migliore.libero = false;
      this.usati += migliore.w * migliore.h;
      return migliore;
    }

    // 2. In coda a uno scaffale già aperto, alto abbastanza ma non troppo.
    let scelto: Scaffale | null = null;
    for (const s of this.scaffali) {
      if (s.h < lh || s.h > lh * SPRECO_MAX + PASSO_SCAFFALE) continue;
      if (this.lato - s.xLibero < lw + GUTTER) continue;
      if (scelto === null || s.h < scelto.h) scelto = s;
    }
    if (scelto !== null) return this.inCoda(scelto, lw);

    // 3. Uno scaffale nuovo.
    const hScaffale = Math.min(this.latoMaschera, Math.ceil(lh / PASSO_SCAFFALE) * PASSO_SCAFFALE);
    if (this.yLibero + hScaffale + GUTTER > this.lato) return null;
    const nuovo: Scaffale = { y: this.yLibero + GUTTER, h: hScaffale, xLibero: GUTTER, slot: [] };
    this.yLibero += hScaffale + GUTTER;
    this.scaffali.push(nuovo);
    return this.inCoda(nuovo, lw);
  }

  /** Rende lo slot riusabile. Se è l'ultimo del suo scaffale, la coda si accorcia. */
  libera(slot: Slot): void {
    if (slot.libero) return;
    slot.libero = true;
    this.usati -= slot.w * slot.h;
    for (const s of this.scaffali) {
      const i = s.slot.indexOf(slot);
      if (i < 0) continue;
      // Accorcia la coda finché l'ultimo è libero.
      while (s.slot.length > 0) {
        const ultimo = s.slot[s.slot.length - 1];
        if (ultimo === undefined || !ultimo.libero) break;
        s.slot.pop();
        s.xLibero = ultimo.x;
      }
      break;
    }
    // Gli scaffali vuoti in cima tornano liberi.
    while (this.scaffali.length > 0) {
      const alto = this.scaffali[this.scaffali.length - 1];
      if (alto === undefined || alto.slot.length > 0) break;
      this.scaffali.pop();
      this.yLibero = alto.y - GUTTER;
    }
  }

  /** Dimentica tutti gli slot (compattazione, perdita di contesto). Il contenuto GPU resta finché non si ricuoce. */
  azzera(): void {
    this.scaffali = [];
    this.yLibero = 0;
    this.usati = 0;
  }

  /** Porta i due appoggi del blur alla misura della maschera (li rialloca solo se cambia). */
  preparaBlur(w: number, h: number): void {
    const lw = Math.max(1, Math.ceil(w));
    const lh = Math.max(1, Math.ceil(h));
    if (this.blurA.width !== lw || this.blurA.height !== lh) this.blurA.setSize(lw, lh);
    if (this.blurB.width !== lw || this.blurB.height !== lh) this.blurB.setSize(lw, lh);
  }

  dispose(): void {
    this.target.dispose();
    this.blurA.dispose();
    this.blurB.dispose();
    this.azzera();
  }

  private inCoda(s: Scaffale, lw: number): Slot {
    this.contatore += 1;
    const slot: Slot = { id: this.contatore, x: s.xLibero, y: s.y, w: lw, h: s.h, libero: false };
    s.slot.push(slot);
    s.xLibero += lw + GUTTER;
    this.usati += slot.w * slot.h;
    return slot;
  }
}
