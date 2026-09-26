/**
 * SOTTOSCOCCA · l'officina intorno al ponte (webgl-artist).
 *
 * - Pavimento: piano non illuminato (MeshBasic) con la texture delle linee a
 *   terra; il nero della texture coincide al byte con il fondo della scena e
 *   di `.ssc-root`, quindi il bordo del piano non si vede. Solo faccia in su:
 *   quando la camera scende sotto quota 0 per la pianta del sottoscocca il
 *   pavimento sparisce da solo (CD 4.3, "vista dal basso quasi zenitale").
 * - Nebbia verso il nero grasso: le postazioni vicine si perdono nel fondo.
 * - Macchia di contatto sotto l'auto, che si schiarisce mentre l'auto sale.
 * - Due neon a soffitto (tubi bianchi, accesi fissi: niente sfarfallio) e la
 *   luce: una principale dall'alto, un emisfero tenue e una luce di lavoro da
 *   sotto che rende leggibile il pianale. Tutte ferme, nessuna segue niente.
 */

import { Color, DirectionalLight, Fog, Group, HemisphereLight, Mesh, PlaneGeometry } from 'three';
import type { BufferGeometry, Scene } from 'three';
import { PALETTE, SCENA } from '../../styles/tokens';
import type { MisureAuto } from './auto';
import { scatola, unisci } from './geometria';
import type { Materiali } from './materiali';
import { LATO_PAVIMENTO } from './texture';

/** Intensita' delle luci (three 0.160, luci fisiche: π ≈ colore pieno). */
export const LUCI = {
  /** Neon dall'alto, un po' davanti e a sinistra dell'auto. */
  principale: { intensita: 2.3, posizione: [2.5, 6, 3.5] as const },
  /** Luce di lavoro da sotto (la lampada del meccanico, fissa): solo sulle facce rivolte in basso. */
  sotto: { intensita: 2.1, posizione: [0.8, -5, 1.2] as const },
  /** Emisfero: cielo bianco segnaletica, terra zincato. */
  emisfero: { intensita: 1.15 },
} as const;

/** Nebbia lineare (m dalla camera). */
export const NEBBIA = { vicino: 11, lontano: 27 } as const;

export interface Officina {
  gruppo: Group;
  /** Opacita' della macchia di contatto dalla quota (cm): piena a terra, 25% oltre 1 m. */
  impostaQuota(cm: number): void;
  dispose(): void;
}

/** Applica fondo e nebbia alla scena (colore = nero grasso, come `.ssc-root`). */
export function preparaScena(scena: Scene): void {
  const nero = new Color(PALETTE[SCENA.clear ?? 'nero'].hex);
  scena.background = nero;
  scena.fog = new Fog(new Color(PALETTE[SCENA.nebbia ?? 'nero'].hex), NEBBIA.vicino, NEBBIA.lontano);
}

export function costruisciOfficina(m: MisureAuto, mat: Materiali): Officina {
  const gruppo = new Group();
  gruppo.name = 'officina';
  const geometrie: BufferGeometry[] = [];

  const gp = new PlaneGeometry(LATO_PAVIMENTO, LATO_PAVIMENTO);
  gp.rotateX(-Math.PI / 2);
  geometrie.push(gp);
  const pavimento = new Mesh(gp, mat.pavimento);
  pavimento.name = 'pavimento';
  pavimento.renderOrder = -1;
  gruppo.add(pavimento);

  const go = new PlaneGeometry(m.larghezza * 1.35, m.lunghezza * 1.18);
  go.rotateX(-Math.PI / 2);
  go.translate(0, 0.003, (m.zMax + m.zMin) / 2);
  geometrie.push(go);
  const ombra = new Mesh(go, mat.ombra);
  ombra.name = 'ombra';
  ombra.renderOrder = 1;
  gruppo.add(ombra);

  const gn = unisci([scatola([0.95, 4.3, 0.2], [0.07, 0.05, 2.6]), scatola([-0.95, 4.3, 0.2], [0.07, 0.05, 2.6])]);
  geometrie.push(gn);
  const neon = new Mesh(gn, mat.neon);
  neon.name = 'neon';
  gruppo.add(neon);

  const bianco = new Color(PALETTE.bianco.hex);
  const zincato = new Color(PALETTE.zincato.hex);
  const emisfero = new HemisphereLight(bianco, zincato, LUCI.emisfero.intensita);
  const principale = new DirectionalLight(bianco, LUCI.principale.intensita);
  principale.position.set(...LUCI.principale.posizione);
  const sotto = new DirectionalLight(bianco, LUCI.sotto.intensita);
  sotto.position.set(...LUCI.sotto.posizione);
  gruppo.add(emisfero, principale, principale.target, sotto, sotto.target);

  let ultima = -1;
  return {
    gruppo,
    impostaQuota(cm: number) {
      const t = Math.min(1, Math.max(0, cm / 100));
      const o = 1 - 0.75 * t;
      if (Math.abs(o - ultima) < 1 / 256) return;
      ultima = o;
      mat.ombra.opacity = o;
    },
    dispose() {
      for (const g of geometrie) g.dispose();
    },
  };
}
