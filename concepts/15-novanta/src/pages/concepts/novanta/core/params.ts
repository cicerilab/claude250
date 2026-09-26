/**
 * NOVANTA · parametri dell'URL (tech-architect §11, ux-architect §1.2).
 * Letti una volta al mount da Novanta.tsx (`inizializzaStore`), mai riscritti.
 *
 * | Parametro | Effetto |
 * |---|---|
 * | `?vista=elenco` / `?vista=quadrante` | forza la vista per questa visita (la scelta salvata perde) |
 * | `?oggi=AAAA-MM-GG` | data fissa per screenshot stabili |
 * | `?invio=ko` (o `?simula=rete`) | l'invio simulato fallisce |
 * | `?posto=preso` (o `?simula=posto`) | la prima ora risulta presa nel frattempo, una volta |
 * | `?motivo=spalla…` | precompila "Cosa ti porta da noi" con il suggerimento |
 *
 * Funzione pura sulla stringa `search`: nessun accesso al browser.
 */

import type { IdMotivo } from '../content/testi';

export interface ParametriNovanta {
  readonly vista: 'elenco' | 'quadrante' | null;
  readonly oggi: string | null;
  readonly invioKo: boolean;
  readonly postoPreso: boolean;
  readonly motivo: IdMotivo | null;
}

const MOTIVI: readonly IdMotivo[] = ['spalla', 'schiena', 'collo', 'ginocchio', 'intervento'];

/** 'AAAA-MM-GG' valida (anche come data vera: niente 31 febbraio). */
export function eDataIso(v: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (m === null) return false;
  const anno = Number(m[1]);
  const mese = Number(m[2]);
  const giorno = Number(m[3]);
  const d = new Date(anno, mese - 1, giorno);
  return d.getFullYear() === anno && d.getMonth() === mese - 1 && d.getDate() === giorno;
}

export function eMotivo(v: unknown): v is IdMotivo {
  return typeof v === 'string' && (MOTIVI as readonly string[]).includes(v);
}

export function leggiParametri(search: string): ParametriNovanta {
  const q = new URLSearchParams(search);
  const vista = q.get('vista');
  const oggi = q.get('oggi');
  const simula = q.getAll('simula');
  const motivo = q.get('motivo');
  return {
    vista: vista === 'elenco' || vista === 'quadrante' ? vista : null,
    oggi: oggi !== null && eDataIso(oggi) ? oggi : null,
    invioKo: q.get('invio') === 'ko' || simula.includes('rete'),
    postoPreso: q.get('posto') === 'preso' || simula.includes('posto'),
    motivo: eMotivo(motivo) ? motivo : null,
  };
}
