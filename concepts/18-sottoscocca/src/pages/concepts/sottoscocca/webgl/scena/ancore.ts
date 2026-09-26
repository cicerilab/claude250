/**
 * SOTTOSCOCCA · dove stanno i punti toccabili sulla scena (webgl-artist).
 *
 * Ogni punto ha una posizione 3D in coordinate dell'AUTO (si alza con lei),
 * eventualmente diversa per quota: a 20 cm la ruota si tocca sul fianco, a
 * 180 cm la si tocca da sotto. Le posizioni vengono dal layout dei pezzi, cosi'
 * il cerchio cade sul pezzo che diventa bianco.
 *
 * Distribuzione a 180 cm (vista dal basso, landscape muso a sinistra):
 * freni sulla ruota anteriore sinistra (aperta), gomme sulla anteriore
 * destra, olio sulla coppa, sospensioni sulla molla posteriore sinistra,
 * scarico sul silenziatore, convergenza sulla posteriore destra: sei punti su
 * tre colonne e due righe, mai due sullo stesso pezzo.
 *
 * Uso (webgl/proiezione.ts): `ancora(id, quota, out)` → `auto.gruppo.localToWorld(out)`
 * → `out.project(camera)`.
 */

import { Vector3 } from 'three';
import type { IdPunto, Quota } from '../../content/lavori';
import type { MisureAuto, PosizioneRuota, Vec3 } from './auto';
import type { LayoutPezzi } from './pezzi';
import type { V3 } from './geometria';

export interface AncoraPunto {
  /** Posizione di base (coordinate auto). */
  base: V3;
  /** Posizioni specifiche per quota, se diverse. */
  perQuota: Partial<Record<Quota, V3>>;
}

export type Ancore = Record<IdPunto, AncoraPunto>;

export function calcolaAncore(m: MisureAuto, centri: Record<PosizioneRuota, Vec3>, L: LayoutPezzi): Ancore {
  const as = centri['anteriore-sinistra'];
  const ad = centri['anteriore-destra'];
  const ps = centri['posteriore-sinistra'];
  const pd = centri['posteriore-destra'];
  const fianco = m.larghezzaRuota / 2; // dal centro ruota alla faccia esterna
  const pinza = L.freni['anteriore-sinistra'].pinza;
  const montante = L.montanti.sinistro;
  const mollaDavanti: V3 = [
    montante.basso[0] + (montante.alto[0] - montante.basso[0]) * 0.62,
    montante.basso[1] + (montante.alto[1] - montante.basso[1]) * 0.62,
    montante.basso[2] + (montante.alto[2] - montante.basso[2]) * 0.62,
  ];
  return {
    'ruota-anteriore': {
      // sul fianco della gomma, sopra il mozzo (a 20 cm la camera la vede di tre quarti)
      base: [as[0] + fianco, as[1] + m.raggioRuota * 0.55, as[2]],
      // da sotto: il battistrada della anteriore destra
      perQuota: { 180: [ad[0], 0.0, ad[2]] },
    },
    'ruota-posteriore': {
      base: [ps[0] + fianco, ps[1] + m.raggioRuota * 0.55, ps[2]],
      perQuota: { 180: [pd[0], 0.0, pd[2]] },
    },
    freni: {
      base: [pinza[0], pinza[1], pinza[2]],
      // da sotto: la pinza vista attraverso la ruota aperta, sul fondo del disco
      perQuota: { 180: [as[0], 0.02, as[2] - 0.04] },
    },
    sospensioni: {
      // a 80 cm: la molla del montante, sopra il disco
      base: mollaDavanti,
      // da sotto: la molla posteriore sinistra (un anello sull'assale)
      perQuota: { 180: L.molleDietro.sinistra },
    },
    olio: {
      base: [L.coppa.centro[0], L.coppa.centro[1] - L.coppa.dim[1] / 2, L.coppa.centro[2]],
      perQuota: {},
    },
    scarico: {
      base: [L.silenziatore.centro[0], L.silenziatore.centro[1] - L.silenziatore.r * 0.6, L.silenziatore.centro[2]],
      perQuota: {},
    },
  };
}

/** Scrive in `out` la posizione (coordinate auto) del punto `id` alla quota `quota`. */
export function ancoraPunto(ancore: Ancore, id: IdPunto, quota: Quota, out: Vector3 = new Vector3()): Vector3 {
  const a = ancore[id];
  const p = a.perQuota[quota] ?? a.base;
  return out.set(p[0], p[1], p[2]);
}
