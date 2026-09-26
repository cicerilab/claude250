/**
 * SOTTOSCOCCA · utilita' di geometria per le parti procedurali (webgl-artist).
 *
 * - `unisci`: fonde piu' geometrie (solo posizione e normale) in una sola, per
 *   avere una draw call per materiale. Evita di importare BufferGeometryUtils.
 * - `sbarra`: un box orientato tra due punti (bracci, assali, tubi dritti).
 * - `cilindroTra`: un cilindro tra due punti.
 * - `elica`: la molla, un tubo a spirale con pochi lati.
 *
 * Funzioni pure sulle geometrie: nessun accesso al browser.
 */

import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Curve,
  CylinderGeometry,
  Matrix4,
  Quaternion,
  TubeGeometry,
  Vector3,
} from 'three';

export type V3 = readonly [number, number, number];

/** Fonde geometrie indicizzate o no, tenendo solo `position` e `normal`. */
export function unisci(geometrie: BufferGeometry[]): BufferGeometry {
  let nv = 0;
  let ni = 0;
  for (const g of geometrie) {
    nv += g.getAttribute('position').count;
    ni += g.index ? g.index.count : g.getAttribute('position').count;
  }
  const pos = new Float32Array(nv * 3);
  const nor = new Float32Array(nv * 3);
  const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
  let ov = 0;
  let oi = 0;
  for (const g of geometrie) {
    const p = g.getAttribute('position');
    const n = g.getAttribute('normal');
    for (let i = 0; i < p.count; i++) {
      pos[(ov + i) * 3] = p.getX(i);
      pos[(ov + i) * 3 + 1] = p.getY(i);
      pos[(ov + i) * 3 + 2] = p.getZ(i);
      nor[(ov + i) * 3] = n.getX(i);
      nor[(ov + i) * 3 + 1] = n.getY(i);
      nor[(ov + i) * 3 + 2] = n.getZ(i);
    }
    if (g.index) {
      for (let i = 0; i < g.index.count; i++) idx[oi + i] = g.index.getX(i) + ov;
      oi += g.index.count;
    } else {
      for (let i = 0; i < p.count; i++) idx[oi + i] = ov + i;
      oi += p.count;
    }
    ov += p.count;
    g.dispose();
  }
  const out = new BufferGeometry();
  out.setAttribute('position', new BufferAttribute(pos, 3));
  out.setAttribute('normal', new BufferAttribute(nor, 3));
  out.setIndex(new BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
}

const SU = new Vector3(0, 1, 0);

function orienta(g: BufferGeometry, a: V3, b: V3): BufferGeometry {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const dir = vb.clone().sub(va);
  const lung = dir.length();
  const q = new Quaternion().setFromUnitVectors(SU, dir.normalize());
  const m = new Matrix4().compose(va.add(vb).multiplyScalar(0.5), q, new Vector3(1, 1, 1));
  g.scale(1, lung, 1);
  g.applyMatrix4(m);
  return g;
}

/** Box di sezione `larghezza` x `spessore` tra i punti a e b. */
export function sbarra(a: V3, b: V3, larghezza: number, spessore: number): BufferGeometry {
  return orienta(new BoxGeometry(larghezza, 1, spessore), a, b);
}

/** Cilindro di raggio `r` tra a e b, `lati` facce. */
export function cilindroTra(a: V3, b: V3, r: number, lati = 8, r2 = r): BufferGeometry {
  return orienta(new CylinderGeometry(r2, r, 1, lati, 1, false), a, b);
}

/** Box centrato, dimensioni in metri. */
export function scatola(centro: V3, dim: V3): BufferGeometry {
  const g = new BoxGeometry(dim[0], dim[1], dim[2]);
  g.translate(centro[0], centro[1], centro[2]);
  return g;
}

/** Cilindro con asse lungo x, y o z, centrato. */
export function cilindroAsse(centro: V3, asse: 'x' | 'y' | 'z', r: number, lung: number, lati = 12): BufferGeometry {
  const g = new CylinderGeometry(r, r, lung, lati, 1, false);
  if (asse === 'x') g.rotateZ(Math.PI / 2);
  else if (asse === 'z') g.rotateX(Math.PI / 2);
  g.translate(centro[0], centro[1], centro[2]);
  return g;
}

class Spirale extends Curve<Vector3> {
  constructor(
    private readonly base: V3,
    private readonly altezza: number,
    private readonly raggio: number,
    private readonly giri: number,
  ) {
    super();
  }
  override getPoint(t: number, out = new Vector3()): Vector3 {
    const a = t * this.giri * Math.PI * 2;
    return out.set(this.base[0] + Math.cos(a) * this.raggio, this.base[1] + t * this.altezza, this.base[2] + Math.sin(a) * this.raggio);
  }
}

/** Molla elicoidale verticale che parte da `base` e sale di `altezza`. */
export function elica(base: V3, altezza: number, raggio: number, giri: number, filo: number): BufferGeometry {
  return new TubeGeometry(new Spirale(base, altezza, raggio, giri), Math.round(giri * 12), filo, 5, false);
}

/** Tubo morbido lungo una polilinea (lo scarico). */
export function tubo(punti: readonly V3[], raggio: number, segmenti = 32): BufferGeometry {
  const curva = new CatmullRomCurve3(
    punti.map((p) => new Vector3(...p)),
    false,
    'catmullrom',
    0.2,
  );
  return new TubeGeometry(curva, segmenti, raggio, 7, false);
}
