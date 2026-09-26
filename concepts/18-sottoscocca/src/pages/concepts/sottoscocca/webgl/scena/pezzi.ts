/**
 * SOTTOSCOCCA · il sottoscocca procedurale (webgl-artist).
 *
 * Il pianale Kenney e' una piastra piatta e chiusa a `fondoY` (17 cm da
 * terra): tutto quello che si deve vedere da sotto PENDE sotto la piastra,
 * come la coppa, lo scarico e l'assale su un'auto vera. Freni e montanti
 * stanno dentro la ruota anteriore sinistra, che si apre in trasparenza.
 *
 * Una mesh (una draw call) per pezzo evidenziabile, con le quattro ruote gia'
 * unite: dischi, pinze, molle e ammortizzatori si evidenziano insieme.
 * I nomi delle mesh sono gli `IdPezzo` di `content/lavori.ts`
 * ('olio' = coppa, 'scarico' = tubo); 'freni' e 'sospensioni' sono alias dei
 * loro pezzi, per chi evidenzia per punto.
 *
 * Coordinate: quelle dell'auto (auto.ts), metri.
 */

import { Group, Mesh } from 'three';
import type { BufferGeometry, Material } from 'three';
import type { IdPezzo } from '../../content/lavori';
import type { MisureAuto, PosizioneRuota, Vec3 } from './auto';
import { cilindroAsse, cilindroTra, elica, sbarra, scatola, tubo, unisci } from './geometria';
import type { V3 } from './geometria';
import { impostaEvidenza } from './materiali';
import type { MaterialeEvidenza, Materiali } from './materiali';

/** Misure dei pezzi, calcolate dalle misure dell'auto. Tutte in coordinate auto. */
export interface LayoutPezzi {
  fondo: number;
  coppa: { centro: V3; dim: V3 };
  filtro: { centro: V3; r: number; h: number };
  /** Punti dello scarico dal collettore al terminale. */
  scarico: V3[];
  catalizzatore: { a: V3; b: V3; r: number };
  silenziatore: { centro: V3; r: number; lung: number };
  terminale: { a: V3; b: V3 };
  /** Per ruota: centro del disco, raggio, spessore; centro della pinza. */
  freni: Record<PosizioneRuota, { disco: V3; r: number; pinza: V3 }>;
  /** Anteriori: montante McPherson dentro la ruota. */
  montanti: { sinistro: { basso: V3; alto: V3 }; destro: { basso: V3; alto: V3 } };
  /** Posteriori: molle sull'assale, viste da sotto come anelli. */
  molleDietro: { sinistra: V3; destra: V3; h: number; r: number };
  ammortizzatoriDietro: { sinistro: { a: V3; b: V3 }; destro: { a: V3; b: V3 } };
  assaleDietro: { a: V3; b: V3 };
  traversaDavanti: { centro: V3; dim: V3 };
}

/** Il layout dipende solo dalle misure: lo usano pezzi.ts e ancore.ts. */
export function layoutPezzi(m: MisureAuto, centri: Record<PosizioneRuota, Vec3>): LayoutPezzi {
  const f = m.fondoY; // 0,172
  const zA = centri['anteriore-sinistra'][2]; // asse anteriore
  const zP = centri['posteriore-sinistra'][2]; // asse posteriore
  const xR = centri['anteriore-sinistra'][0]; // centro ruota
  const yR = centri['anteriore-sinistra'][1]; // raggio = altezza del mozzo
  const xDisco = xR - m.larghezzaRuota * 0.22; // dentro il cerchio, verso il centro auto

  const freni = {} as LayoutPezzi['freni'];
  for (const pos of ['anteriore-sinistra', 'anteriore-destra', 'posteriore-sinistra', 'posteriore-destra'] as const) {
    const c = centri[pos];
    const s = c[0] > 0 ? 1 : -1;
    const ant = pos.startsWith('anteriore');
    const r = ant ? m.raggioRuota * 0.44 : m.raggioRuota * 0.38;
    // pinza dietro il mozzo, a ore 2 guardando dal lato sinistro (muso a destra)
    const ang = ant ? 0.62 : 0.7;
    freni[pos] = {
      disco: [s * xDisco, c[1], c[2]],
      r,
      pinza: [s * (xDisco + 0.012), c[1] + Math.sin(ang) * r * 0.86, c[2] - Math.cos(ang) * r * 0.86],
    };
  }

  const g = f - 0.075; // quota sotto cui pende la linea di scarico
  return {
    fondo: f,
    coppa: { centro: [0.02, f - 0.04, zA + 0.36], dim: [0.46, 0.08, 0.34] },
    filtro: { centro: [-0.27, f - 0.045, zA + 0.2], r: 0.048, h: 0.09 },
    scarico: [
      [0.3, f + 0.02, zA + 0.42],
      [0.3, g + 0.01, zA + 0.12],
      [0.26, g, zA - 0.28],
      [0.2, g, zA - 0.8],
      [0.16, g, 0],
      [0.16, g, zP + 0.62],
      [0.14, g + 0.005, zP - 0.18],
    ],
    catalizzatore: { a: [0.27, g, zA - 0.2], b: [0.24, g, zA - 0.62], r: 0.068 },
    silenziatore: { centro: [-0.08, f - 0.085, zP - 0.42], r: 0.1, lung: 0.78 },
    terminale: { a: [-0.44, f - 0.085, zP - 0.42], b: [-0.5, f - 0.07, m.zMin - 0.04] },
    freni,
    montanti: {
      sinistro: { basso: [xR - 0.13, yR - 0.03, zA + 0.03], alto: [xR - 0.2, yR + 0.44, zA - 0.02] },
      destro: { basso: [-(xR - 0.13), yR - 0.03, zA + 0.03], alto: [-(xR - 0.2), yR + 0.44, zA - 0.02] },
    },
    molleDietro: { sinistra: [xR - 0.2, f - 0.085, zP + 0.14], destra: [-(xR - 0.2), f - 0.085, zP + 0.14], h: 0.08, r: 0.07 },
    ammortizzatoriDietro: {
      sinistro: { a: [xR - 0.1, f - 0.085, zP - 0.1], b: [xR - 0.2, f - 0.02, zP - 0.42] },
      destro: { a: [-(xR - 0.1), f - 0.085, zP - 0.1], b: [-(xR - 0.2), f - 0.02, zP - 0.42] },
    },
    assaleDietro: { a: [xR - 0.1, f - 0.1, zP + 0.14], b: [-(xR - 0.1), f - 0.1, zP + 0.14] },
    traversaDavanti: { centro: [0, f - 0.03, zA - 0.06], dim: [1.0, 0.06, 0.12] },
  };
}

/** Quali mesh evidenzia ogni IdPezzo. */
const MESH_DI: Record<IdPezzo, readonly NomeMeshPezzo[]> = {
  'ruota-anteriore': ['gomma-anteriore'],
  'ruota-posteriore': ['gomma-posteriore'],
  olio: ['coppa'],
  filtro: ['filtro'],
  scarico: ['tubo'],
  catalizzatore: ['catalizzatore'],
  silenziatore: ['silenziatore'],
  disco: ['disco'],
  pinza: ['pinza'],
  molla: ['molla'],
  ammortizzatore: ['ammortizzatore'],
  freni: ['disco', 'pinza'],
  sospensioni: ['molla', 'ammortizzatore'],
};

type NomeMeshPezzo =
  | 'coppa'
  | 'filtro'
  | 'tubo'
  | 'catalizzatore'
  | 'silenziatore'
  | 'disco'
  | 'pinza'
  | 'molla'
  | 'ammortizzatore'
  | 'gomma-anteriore'
  | 'gomma-posteriore';

export interface Pezzi {
  gruppo: Group;
  layout: LayoutPezzi;
  /**
   * Scrive l'evidenza (0..1 per IdPezzo, di solito `runtime.evidenza`).
   * Ogni materiale prende il massimo tra gli id che lo contengono.
   * Restituisce true se qualcosa e' cambiato (serve un render).
   */
  applicaEvidenza(ev: Partial<Record<IdPezzo, number>>): boolean;
  dispose(): void;
}

export function costruisciPezzi(m: MisureAuto, centri: Record<PosizioneRuota, Vec3>, mat: Materiali): Pezzi {
  const L = layoutPezzi(m, centri);
  const gruppo = new Group();
  gruppo.name = 'sottoscocca';
  const geometrie: BufferGeometry[] = [];

  function aggiungi(nome: string, g: BufferGeometry, materiale: Material): void {
    const mesh = new Mesh(g, materiale);
    mesh.name = nome;
    geometrie.push(g);
    gruppo.add(mesh);
  }

  // coppa dell'olio con il tappo di scarico
  aggiungi(
    'olio',
    unisci([
      scatola(L.coppa.centro, L.coppa.dim),
      scatola([L.coppa.centro[0], L.coppa.centro[1] + 0.035, L.coppa.centro[2]], [L.coppa.dim[0] + 0.06, 0.02, L.coppa.dim[2] + 0.06]),
      cilindroAsse([L.coppa.centro[0] + 0.1, L.coppa.centro[1] - 0.045, L.coppa.centro[2] - 0.08], 'y', 0.022, 0.018, 6),
    ]),
    mat.coppa,
  );
  aggiungi('filtro', cilindroAsse(L.filtro.centro, 'y', L.filtro.r, L.filtro.h, 10), mat.filtro);

  // scarico: tubo continuo + terminale; catalizzatore e silenziatore a parte
  aggiungi(
    'scarico',
    unisci([tubo(L.scarico, 0.026, 40), cilindroTra(L.terminale.a, L.terminale.b, 0.03, 8)]),
    mat.tubo,
  );
  aggiungi('catalizzatore', cilindroTra(L.catalizzatore.a, L.catalizzatore.b, L.catalizzatore.r, 10), mat.catalizzatore);
  {
    const s = cilindroAsse(L.silenziatore.centro, 'x', 1, L.silenziatore.lung, 12);
    // sezione ovale: piu' largo che alto
    s.translate(-L.silenziatore.centro[0], -L.silenziatore.centro[1], -L.silenziatore.centro[2]);
    s.scale(1, L.silenziatore.r * 0.62, L.silenziatore.r * 1.35);
    s.translate(L.silenziatore.centro[0], L.silenziatore.centro[1], L.silenziatore.centro[2]);
    aggiungi('silenziatore', s, mat.silenziatore);
  }

  // freni: quattro dischi con mozzo, quattro pinze
  const dischi: BufferGeometry[] = [];
  const pinze: BufferGeometry[] = [];
  for (const fr of Object.values(L.freni)) {
    dischi.push(cilindroAsse(fr.disco, 'x', fr.r, 0.028, 16));
    dischi.push(cilindroAsse(fr.disco, 'x', fr.r * 0.42, 0.07, 8));
    const d = fr.disco;
    const p = fr.pinza;
    const ang = Math.atan2(p[1] - d[1], p[2] - d[2]);
    const g = scatola([0, 0, 0], [0.075, 0.11, 0.065]);
    g.rotateX(-ang + Math.PI / 2);
    g.translate(p[0], p[1], p[2]);
    pinze.push(g);
  }
  aggiungi('disco', unisci(dischi), mat.disco);
  aggiungi('pinza', unisci(pinze), mat.pinza);

  // sospensioni: montanti davanti (ammortizzatore + molla), molle e ammortizzatori dietro
  const ammo: BufferGeometry[] = [];
  const molle: BufferGeometry[] = [];
  for (const lato of [L.montanti.sinistro, L.montanti.destro]) {
    ammo.push(cilindroTra(lato.basso, lato.alto, 0.028, 8));
    const t = 0.5;
    const base: V3 = [
      lato.basso[0] + (lato.alto[0] - lato.basso[0]) * t,
      lato.basso[1] + (lato.alto[1] - lato.basso[1]) * t,
      lato.basso[2] + (lato.alto[2] - lato.basso[2]) * t,
    ];
    molle.push(elica(base, (lato.alto[1] - lato.basso[1]) * 0.42, 0.072, 4, 0.012));
  }
  for (const a of [L.ammortizzatoriDietro.sinistro, L.ammortizzatoriDietro.destro]) ammo.push(cilindroTra(a.a, a.b, 0.024, 8));
  for (const c of [L.molleDietro.sinistra, L.molleDietro.destra]) {
    molle.push(elica([c[0], c[1] - L.molleDietro.h / 2, c[2]], L.molleDietro.h + 0.02, L.molleDietro.r, 3, 0.013));
  }
  aggiungi('ammortizzatore', unisci(ammo), mat.ammortizzatore);
  aggiungi('molla', unisci(molle), mat.molla);

  // meccanica non evidenziabile: assale dietro, traversa e bracci davanti
  const mec: BufferGeometry[] = [];
  mec.push(sbarra(L.assaleDietro.a, L.assaleDietro.b, 0.09, 0.07));
  mec.push(scatola(L.traversaDavanti.centro, L.traversaDavanti.dim));
  for (const s of [1, -1]) {
    const mozzo: V3 = [s * (L.freni['anteriore-sinistra'].disco[0] - 0.05), m.fondoY - 0.04, L.traversaDavanti.centro[2] + 0.06];
    mec.push(sbarra([s * 0.3, m.fondoY - 0.035, L.traversaDavanti.centro[2]], mozzo, 0.05, 0.03));
    mec.push(sbarra([s * 0.3, m.fondoY - 0.035, L.traversaDavanti.centro[2] - 0.32], mozzo, 0.05, 0.03));
    // semiasse visibile solo attraverso la ruota aperta
    mec.push(cilindroAsse([s * 0.3, centri['anteriore-sinistra'][1], centri['anteriore-sinistra'][2]], 'x', 0.022, 0.42, 6));
  }
  aggiungi('meccanica', unisci(mec), mat.meccanica);

  const materialiDi: Record<NomeMeshPezzo, MaterialeEvidenza> = {
    coppa: mat.coppa,
    filtro: mat.filtro,
    tubo: mat.tubo,
    catalizzatore: mat.catalizzatore,
    silenziatore: mat.silenziatore,
    disco: mat.disco,
    pinza: mat.pinza,
    molla: mat.molla,
    ammortizzatore: mat.ammortizzatore,
    // le gomme anteriori hanno due materiali (quella che si apre e l'altra)
    'gomma-anteriore': mat.gommaAnteriore,
    'gomma-posteriore': mat.gommaPosteriore,
  };
  const valori = new Map<NomeMeshPezzo, number>();

  return {
    gruppo,
    layout: L,
    applicaEvidenza(ev) {
      valori.clear();
      for (const [id, v] of Object.entries(ev) as [IdPezzo, number][]) {
        const nomi = MESH_DI[id];
        if (!nomi || !(v > 0)) continue;
        for (const n of nomi) valori.set(n, Math.max(valori.get(n) ?? 0, v));
      }
      let cambiato = false;
      for (const n of Object.keys(materialiDi) as NomeMeshPezzo[]) {
        const v = valori.get(n) ?? 0;
        if (impostaEvidenza(materialiDi[n], v)) cambiato = true;
        if (n === 'gomma-anteriore' && impostaEvidenza(mat.gommaAperta, v)) cambiato = true;
      }
      return cambiato;
    },
    dispose() {
      for (const g of geometrie) g.dispose();
    },
  };
}
