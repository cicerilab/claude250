/**
 * SOTTOSCOCCA · il binario della camera (webgl-artist).
 *
 * Quattro chiavi, una per plateau (0, 20, 80, 180 cm), in due varianti:
 * `landscape` (riferimento 16:9) e `portrait` (riferimento 390 x 844).
 * Una quinta chiave, LONTANO, e' la camera che si allontana nel Ponte libero
 * (`runtime.discesa` 0..1).
 *
 * Regole (CD 4.3, trend P1, ux §5 "zone dei punti"):
 * - niente orbita, niente puntatore: la posa dipende solo da binario e discesa;
 * - tra 80 e 180 la camera fa un solo beccheggio (guarda la ruota, poi alza lo
 *   sguardo sotto il pianale): il vettore "alto" passa da +y a +x in
 *   landscape (muso a sinistra) e a +z in portrait (muso in alto), senza
 *   rollii da drone;
 * - a 180 cm la camera sta SOTTO il pavimento (y negativa) con FOV stretto:
 *   vista quasi ortografica del pianale. Il pavimento ha solo la faccia in su,
 *   quindi da sotto non si vede;
 * - il centro ottico si sposta (`spostamento`, in frazioni della finestra)
 *   per tenere l'auto nella zona dei punti: a destra del banco su desktop,
 *   nella meta' alta su telefono.
 *
 * Le chiavi sono in coordinate della scena e gia' tengono conto della quota
 * del loro plateau (a 80 cm il bersaglio e' il mozzo alzato di 0,80 m).
 */

import type { PerspectiveCamera } from 'three';
import { Vector3 } from 'three';
import { smootherstep01 } from '../../motion/easing';
import type { Easing } from '../../motion/easing';

export type Orientamento = 'landscape' | 'portrait';

export interface ChiaveCamera {
  posizione: readonly [number, number, number];
  bersaglio: readonly [number, number, number];
  /** Vettore "alto" della camera (non serve normalizzato). */
  alto: readonly [number, number, number];
  /** FOV verticale in gradi, all'aspetto di riferimento dell'orientamento. */
  fov: number;
  /** Spostamento del contenuto: [destra, su] in frazioni di larghezza e altezza. */
  spostamento: readonly [number, number];
}

/** Aspetto (larghezza/altezza) per cui sono tarate le chiavi. */
export const ASPETTO_RIFERIMENTO: Record<Orientamento, number> = {
  landscape: 16 / 9,
  portrait: 390 / 844,
};

type Quattro = readonly [ChiaveCamera, ChiaveCamera, ChiaveCamera, ChiaveCamera];

export const CHIAVI: Record<Orientamento, Quattro> = {
  landscape: [
    // 0 cm: tre quarti anteriore sinistro, ad altezza d'uomo
    { posizione: [6.6, 1.8, 7.9], bersaglio: [0.0, 0.85, -0.1], alto: [0, 1, 0], fov: 28, spostamento: [0.16, 0.0] },
    // 20 cm: un passo piu' vicino e piu' basso, le ruote staccate da terra
    { posizione: [7.4, 1.25, 5.2], bersaglio: [0.0, 0.85, -0.05], alto: [0, 1, 0], fov: 28, spostamento: [0.16, 0.0] },
    // 80 cm: la ruota anteriore sinistra negli occhi
    { posizione: [3.35, 1.3, 2.95], bersaglio: [0.62, 1.12, 1.25], alto: [0, 1, 0], fov: 28, spostamento: [0.17, 0.0] },
    // 180 cm: sotto il pavimento, sguardo in su, muso a sinistra
    { posizione: [0.0, -6.9, 0.0], bersaglio: [0.0, 1.95, 0.0], alto: [1, 0, 0], fov: 28, spostamento: [0.16, 0.0] },
  ],
  portrait: [
    // 0 cm: tre quarti, l'auto nella meta' alta (punti in y 10-54%)
    { posizione: [6.8, 2.6, 9.8], bersaglio: [0.0, 0.55, 0.1], alto: [0, 1, 0], fov: 48, spostamento: [0.02, 0.2] },
    { posizione: [6.2, 2.0, 8.6], bersaglio: [0.05, 0.7, 0.2], alto: [0, 1, 0], fov: 48, spostamento: [0.02, 0.2] },
    // 80 cm: la ruota riempie la meta' alta
    { posizione: [2.9, 1.35, 2.9], bersaglio: [0.62, 1.12, 1.3], alto: [0, 1, 0], fov: 46, spostamento: [0.0, 0.2] },
    // 180 cm: pianale in verticale, muso in alto (punti in y 10-78%)
    { posizione: [0.0, -5.6, 0.05], bersaglio: [0.0, 1.95, 0.05], alto: [0, 0, 1], fov: 48, spostamento: [-0.04, 0.06] },
  ],
};

/** Ponte libero: il ponte e' sceso a 0, la camera si allontana e l'auto sale nell'inquadratura. */
export const LONTANO: Record<Orientamento, ChiaveCamera> = {
  landscape: { posizione: [8.8, 3.6, 12.2], bersaglio: [0.2, -0.9, 0.2], alto: [0, 1, 0], fov: 28, spostamento: [0.12, 0.0] },
  portrait: { posizione: [10.5, 4.6, 15.5], bersaglio: [0.0, -2.2, 0.0], alto: [0, 1, 0], fov: 48, spostamento: [0.0, 0.0] },
};

export interface Posa {
  posizione: Vector3;
  bersaglio: Vector3;
  alto: Vector3;
  fov: number;
  spostamento: [number, number];
}

export function creaPosa(): Posa {
  return { posizione: new Vector3(), bersaglio: new Vector3(), alto: new Vector3(0, 1, 0), fov: 28, spostamento: [0, 0] };
}

const va = new Vector3();
const vb = new Vector3();

function mescola(out: Posa, a: ChiaveCamera, b: ChiaveCamera, t: number): void {
  out.posizione.set(...a.posizione).lerp(vb.set(...b.posizione), t);
  out.bersaglio.set(...a.bersaglio).lerp(vb.set(...b.bersaglio), t);
  out.alto.set(...a.alto).normalize().lerp(va.set(...b.alto).normalize(), t);
  if (out.alto.lengthSq() < 1e-6) out.alto.set(0, 1, 0);
  out.alto.normalize();
  out.fov = a.fov + (b.fov - a.fov) * t;
  out.spostamento[0] = a.spostamento[0] + (b.spostamento[0] - a.spostamento[0]) * t;
  out.spostamento[1] = a.spostamento[1] + (b.spostamento[1] - a.spostamento[1]) * t;
}

const posaLontano = creaPosa();

/**
 * Posa della camera per `binario` (0..3 continuo, runtime.binario) e
 * `discesa` (0..1, runtime.discesa). `curva` addolcisce ogni tratto tra due
 * chiavi (di default smootherstep: velocita' nulla sulle chiavi, cosi' il
 * plateau e' fermo davvero). Scrive in `out` e lo restituisce.
 */
export function posaDaBinario(
  binario: number,
  discesa: number,
  orient: Orientamento,
  out: Posa = creaPosa(),
  curva: Easing = smootherstep01,
): Posa {
  const chiavi = CHIAVI[orient];
  const b = binario <= 0 ? 0 : binario >= 3 ? 3 : binario;
  const i = Math.min(2, Math.floor(b));
  const a = chiavi[i] as ChiaveCamera;
  const c = chiavi[i + 1] as ChiaveCamera;
  mescola(out, a, c, curva(b - i));
  if (discesa > 0) {
    const l = LONTANO[orient];
    const d = curva(discesa >= 1 ? 1 : discesa);
    // la discesa parte dalla chiave a 0 cm (il ponte scende prima che la camera si allontani)
    mescola(posaLontano, chiavi[0], l, d);
    const k = discesa >= 1 ? 1 : discesa;
    out.posizione.lerp(posaLontano.posizione, k);
    out.bersaglio.lerp(posaLontano.bersaglio, k);
    out.alto.lerp(posaLontano.alto, k).normalize();
    out.fov += (posaLontano.fov - out.fov) * k;
    out.spostamento[0] += (posaLontano.spostamento[0] - out.spostamento[0]) * k;
    out.spostamento[1] += (posaLontano.spostamento[1] - out.spostamento[1]) * k;
  }
  return out;
}

/**
 * Applica la posa alla camera per una finestra di `larghezza` x `altezza` px.
 * Se la finestra e' piu' stretta dell'aspetto di riferimento il FOV verticale
 * cresce per tenere lo stesso campo orizzontale (l'auto non esce ai lati);
 * se e' piu' larga resta quello verticale. Lo spostamento usa `setViewOffset`.
 */
export function applicaPosa(camera: PerspectiveCamera, posa: Posa, orient: Orientamento, larghezza: number, altezza: number): void {
  const aspetto = larghezza / Math.max(1, altezza);
  const rif = ASPETTO_RIFERIMENTO[orient];
  let fov = posa.fov;
  if (aspetto < rif) {
    const h = Math.tan((posa.fov * Math.PI) / 360) * rif;
    fov = (Math.atan(h / aspetto) * 360) / Math.PI;
  }
  camera.fov = Math.min(fov, 75);
  camera.aspect = aspetto;
  camera.position.copy(posa.posizione);
  camera.up.copy(posa.alto);
  camera.lookAt(posa.bersaglio);
  camera.setViewOffset(larghezza, altezza, -posa.spostamento[0] * larghezza, posa.spostamento[1] * altezza, larghezza, altezza);
  camera.updateProjectionMatrix();
}
