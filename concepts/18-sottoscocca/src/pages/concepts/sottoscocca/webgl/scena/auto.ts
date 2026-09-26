/**
 * SOTTOSCOCCA · l'auto (webgl-artist).
 *
 * Legge `modelli/auto.bin`, scritto offline da `scripts/glb-a-bin.mjs` a
 * partire da Kenney Car Kit `sedan.glb` (CC0): niente GLTFLoader, niente
 * texture, un solo fetch. Formato nel commento di testa dello script.
 *
 * Sistema di riferimento dell'auto: metri, y = 0 a terra sotto le gomme,
 * z verso il muso, x verso il lato sinistro dell'auto, origine a meta' passo.
 */

import { BufferAttribute, BufferGeometry, Group, Mesh } from 'three';
import type { Material } from 'three';
import autoBinUrl from '../modelli/auto.bin?url';
import type { Materiali } from './materiali';

export type Vec3 = [number, number, number];

export type PosizioneRuota = 'anteriore-sinistra' | 'anteriore-destra' | 'posteriore-sinistra' | 'posteriore-destra';
export const POSIZIONI_RUOTA: readonly PosizioneRuota[] = [
  'anteriore-sinistra',
  'anteriore-destra',
  'posteriore-sinistra',
  'posteriore-destra',
];

type NomeMesh = 'corpo' | 'ruota-sx' | 'ruota-dx';

export interface MisureAuto {
  /** Lunghezza, larghezza e altezza della scocca (m). */
  lunghezza: number;
  larghezza: number;
  altezza: number;
  /** Quota del pianale nel punto piu' basso (m, auto a terra). */
  fondoY: number;
  /** Estremi della scocca in z (coda, muso). */
  zMin: number;
  zMax: number;
  /** Passo e carreggiata tra i centri delle ruote (m). */
  passo: number;
  carreggiata: number;
  /** Meta' larghezza interna dei passaruota (m). */
  passaruotaX: number;
  raggioRuota: number;
  larghezzaRuota: number;
}

interface IntestazioneMesh {
  vertici: number;
  triangoli: number;
  posizioni: { offset: number; min: Vec3; passo: Vec3 };
  normali: { offset: number };
  indici: { offset: number; conta: number };
  gruppi: { nome: string; inizio: number; conta: number }[];
}

interface Intestazione {
  formato: 'SSC1';
  misure: MisureAuto;
  ruote: Record<PosizioneRuota, { mesh: 'ruota-sx' | 'ruota-dx'; centro: Vec3 }>;
  mesh: Record<NomeMesh, IntestazioneMesh>;
}

export interface DatiAuto {
  misure: MisureAuto;
  ruote: Record<PosizioneRuota, { mesh: 'ruota-sx' | 'ruota-dx'; centro: Vec3 }>;
  geometrie: Record<NomeMesh, BufferGeometry>;
  /** Nomi dei gruppi per geometria, nell'ordine dei `geometry.groups`. */
  gruppi: Record<NomeMesh, string[]>;
}

/** Decodifica il binario (sincrono, ~1 ms). Lancia se il formato non torna. */
export function leggiAuto(buf: ArrayBuffer): DatiAuto {
  const dv = new DataView(buf);
  const magia = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
  if (magia !== 'SSC1') throw new Error('auto.bin: formato sconosciuto');
  const lung = dv.getUint32(4, true);
  const testo = new TextDecoder().decode(new Uint8Array(buf, 8, lung));
  const h = JSON.parse(testo) as Intestazione;

  const geometrie = {} as Record<NomeMesh, BufferGeometry>;
  const gruppi = {} as Record<NomeMesh, string[]>;
  for (const nome of ['corpo', 'ruota-sx', 'ruota-dx'] as const) {
    const m = h.mesh[nome];
    const q = new Int16Array(buf, m.posizioni.offset, m.vertici * 3);
    const nq = new Int8Array(buf, m.normali.offset, m.vertici * 3);
    const pos = new Float32Array(m.vertici * 3);
    const nor = new Float32Array(m.vertici * 3);
    for (let i = 0; i < m.vertici * 3; i++) {
      const a = i % 3;
      pos[i] = m.posizioni.min[a] + ((q[i] ?? 0) + 32768) * m.posizioni.passo[a];
      nor[i] = (nq[i] ?? 0) / 127;
    }
    const idx = new Uint16Array(buf.slice(m.indici.offset, m.indici.offset + m.indici.conta * 2));
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('normal', new BufferAttribute(nor, 3));
    g.setIndex(new BufferAttribute(idx, 1));
    m.gruppi.forEach((gr, i) => {
      if (gr.conta > 0) g.addGroup(gr.inizio, gr.conta, i);
    });
    g.computeBoundingSphere();
    geometrie[nome] = g;
    gruppi[nome] = m.gruppi.map((gr) => gr.nome);
  }
  return { misure: h.misure, ruote: h.ruote, geometrie, gruppi };
}

/** Scarica e decodifica `auto.bin` (circa 22 KB, 11 KB gz). */
export async function caricaAuto(signal?: AbortSignal): Promise<DatiAuto> {
  const r = await fetch(autoBinUrl, { signal });
  if (!r.ok) throw new Error(`auto.bin: HTTP ${r.status}`);
  return leggiAuto(await r.arrayBuffer());
}

export interface Auto {
  /** Radice dell'auto: la si alza (y) per la quota. Contiene scocca, ruote e pezzi. */
  gruppo: Group;
  /** Un Group per ruota, posizionato al centro ruota: ruota su x per farla girare. */
  ruote: Record<PosizioneRuota, Group>;
  misure: MisureAuto;
  centri: Record<PosizioneRuota, Vec3>;
  /** Angolo delle ruote (rad) attorno all'asse; positivo = marcia avanti. */
  impostaRotazioneRuote(rad: number): void;
  dispose(): void;
}

function materialiPer(nomi: string[], mappa: Record<string, Material>): Material[] {
  return nomi.map((n) => {
    const m = mappa[n];
    if (!m) throw new Error(`auto: nessun materiale per il gruppo ${n}`);
    return m;
  });
}

/**
 * Monta l'auto con i materiali della palette. La ruota anteriore sinistra (lato
 * camera) ha gomma e cerchio che si aprono in trasparenza; le gomme anteriori
 * e posteriori hanno materiali propri per l'evidenza.
 */
export function costruisciAuto(dati: DatiAuto, mat: Materiali): Auto {
  const gruppo = new Group();
  gruppo.name = 'auto';

  const scocca = new Mesh(
    dati.geometrie.corpo,
    materialiPer(dati.gruppi.corpo, {
      carrozzeria: mat.carrozzeria,
      fascia: mat.fascia,
      fondo: mat.fondo,
      vetri: mat.vetri,
      fanali: mat.fanali,
    }),
  );
  scocca.name = 'scocca';
  gruppo.add(scocca);

  const ruote = {} as Record<PosizioneRuota, Group>;
  const centri = {} as Record<PosizioneRuota, Vec3>;
  for (const pos of POSIZIONI_RUOTA) {
    const info = dati.ruote[pos];
    const anteriore = pos.startsWith('anteriore');
    const aperta = pos === 'anteriore-sinistra';
    const m = new Mesh(
      dati.geometrie[info.mesh],
      materialiPer(dati.gruppi[info.mesh], {
        gomma: aperta ? mat.gommaAperta : anteriore ? mat.gommaAnteriore : mat.gommaPosteriore,
        cerchio: aperta ? mat.cerchioAperto : mat.cerchio,
      }),
    );
    m.name = `ruota-${pos}`;
    // la ruota che si apre va disegnata dopo i pezzi opachi e l'ombra a terra
    if (aperta) m.renderOrder = 2;
    const perno = new Group();
    perno.name = `perno-${pos}`;
    perno.position.set(info.centro[0], info.centro[1], info.centro[2]);
    perno.add(m);
    gruppo.add(perno);
    ruote[pos] = perno;
    centri[pos] = [info.centro[0], info.centro[1], info.centro[2]];
  }

  let angolo = 0;
  return {
    gruppo,
    ruote,
    misure: dati.misure,
    centri,
    impostaRotazioneRuote(rad: number) {
      if (rad === angolo) return;
      angolo = rad;
      for (const pos of POSIZIONI_RUOTA) ruote[pos].rotation.x = rad;
    },
    dispose() {
      for (const g of Object.values(dati.geometrie)) g.dispose();
    },
  };
}
