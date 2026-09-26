/**
 * SOTTOSCOCCA · il ponte a due colonne (webgl-artist), tutto procedurale.
 *
 * Parte fissa: due colonne verdi con cappello e piastra a terra, la targhetta
 * "PORTATA 3500 kg" sulla faccia della colonna sinistra rivolta al muso.
 * Parte mobile (sale con la quota): due carrelli zincati, quattro bracci verdi
 * che dal carrello vanno ai punti di presa sotto i sottoporta, quattro
 * tamponi di gomma tondi (i "punti" nascono da qui, CD 4.1).
 *
 * Una draw call per materiale: colonne + bracci (verde, ma in due mesh perche'
 * una sta ferma e una sale), carrelli (zincato), tamponi (nero), targhetta.
 * Coordinate della scena: l'auto a quota 0 ha il centro del passo in origine.
 */

import { Group, Mesh, PlaneGeometry } from 'three';
import type { BufferGeometry } from 'three';
import type { MisureAuto } from './auto';
import { cilindroAsse, sbarra, scatola, unisci } from './geometria';
import type { V3 } from './geometria';
import type { Materiali } from './materiali';

export interface MisurePonte {
  /** x delle colonne (±), z del loro asse. */
  colonnaX: number;
  colonnaZ: number;
  altezzaColonna: number;
  /** Punti di presa sotto la scocca (coordinate auto a quota 0), uno per braccio. */
  prese: readonly V3[];
  /** Faccia della targhetta: centro e larghezza (m). */
  targhetta: { centro: V3; larghezza: number };
}

export function misurePonte(m: MisureAuto, zAnt: number, zPost: number): MisurePonte {
  const colonnaX = m.larghezza / 2 + 0.62;
  const altezzaColonna = 2.85;
  const presaX = m.larghezza / 2 - 0.16;
  const prese: V3[] = [
    [presaX, m.fondoY, zAnt - 0.62],
    [-presaX, m.fondoY, zAnt - 0.62],
    [presaX, m.fondoY, zPost + 0.58],
    [-presaX, m.fondoY, zPost + 0.58],
  ];
  return {
    colonnaX,
    colonnaZ: 0.05,
    altezzaColonna,
    prese,
    targhetta: { centro: [colonnaX, 1.42, 0.05 + 0.165], larghezza: 0.3 },
  };
}

export interface Ponte {
  fisso: Group;
  /** Carrelli, bracci e tamponi: y = quota in metri. */
  mobile: Group;
  misure: MisurePonte;
  impostaQuota(cm: number): void;
  dispose(): void;
}

export function costruisciPonte(m: MisureAuto, zAnt: number, zPost: number, mat: Materiali, aspettoTarghetta: number): Ponte {
  const P = misurePonte(m, zAnt, zPost);
  const geometrie: BufferGeometry[] = [];
  const fisso = new Group();
  fisso.name = 'ponte-fisso';
  const mobile = new Group();
  mobile.name = 'ponte-mobile';

  function mesh(g: BufferGeometry, materiale: Mesh['material'], nome: string, dove: Group): Mesh {
    geometrie.push(g);
    const x = new Mesh(g, materiale);
    x.name = nome;
    dove.add(x);
    return x;
  }

  // colonne: profilo a C reso con due box (fusto e spalla verso l'auto), cappello, piastra
  const colonne: BufferGeometry[] = [];
  const zC = P.colonnaZ;
  for (const s of [1, -1]) {
    const x = s * P.colonnaX;
    colonne.push(scatola([x + s * 0.03, P.altezzaColonna / 2, zC], [0.26, P.altezzaColonna, 0.33]));
    colonne.push(scatola([x, P.altezzaColonna + 0.03, zC], [0.36, 0.06, 0.42]));
    colonne.push(scatola([x, 0.012, zC], [0.5, 0.024, 0.56]));
    // centralina idraulica sulla colonna destra (lontana dalla camera)
    if (s < 0) colonne.push(scatola([x - 0.2, 0.62, zC + 0.02], [0.16, 0.34, 0.2]));
  }
  mesh(unisci(colonne), mat.ponte, 'colonne', fisso);

  // targhetta sulla faccia +z della colonna sinistra
  {
    const w = P.targhetta.larghezza;
    const g = new PlaneGeometry(w, w / aspettoTarghetta);
    g.translate(P.targhetta.centro[0], P.targhetta.centro[1], P.targhetta.centro[2] + 0.002);
    mesh(g, mat.targhetta, 'targhetta', fisso);
  }

  // parte mobile, costruita a quota 0
  const carrelli: BufferGeometry[] = [];
  const bracci: BufferGeometry[] = [];
  const tamponi: BufferGeometry[] = [];
  const hTampone = 0.05;
  const yBraccio = m.fondoY - hTampone - 0.035;
  for (const s of [1, -1]) {
    const xc = s * (P.colonnaX - 0.2);
    carrelli.push(scatola([xc, yBraccio + 0.25, zC], [0.2, 0.62, 0.3]));
    for (const presa of P.prese.filter((p) => Math.sign(p[0]) === s)) {
      const perno: V3 = [xc, yBraccio, zC + Math.sign(presa[2]) * 0.1];
      const fine: V3 = [presa[0], yBraccio, presa[2]];
      bracci.push(sbarra(perno, fine, 0.11, 0.07));
      // tampone: disco di gomma sul fine braccio, con la vite
      tamponi.push(cilindroAsse([presa[0], m.fondoY - hTampone / 2, presa[2]], 'y', 0.075, hTampone, 14));
      tamponi.push(cilindroAsse([presa[0], yBraccio + 0.005, presa[2]], 'y', 0.045, 0.05, 8));
    }
  }
  mesh(unisci(carrelli), mat.metallo, 'carrelli', mobile);
  mesh(unisci(bracci), mat.ponte, 'bracci', mobile);
  mesh(unisci(tamponi), mat.tampone, 'tamponi', mobile);

  return {
    fisso,
    mobile,
    misure: P,
    impostaQuota(cm: number) {
      mobile.position.y = cm / 100;
    },
    dispose() {
      for (const g of geometrie) g.dispose();
    },
  };
}
