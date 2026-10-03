/**
 * NOVANTA · vista e geometria dalle misure (tech-architect §7.4,
 * ux-architect §2.2, §2.3, §6.9, vector-artist §7, art-director §4).
 *
 * `decidiModo()` è una funzione pura sulle misure: la usano Novanta.tsx (al
 * mount e a ogni resize, via core/viewport.ts) e i test. `applicaModo()`
 * scrive `runtime.perno`, `--nov-r`, `--nov-perno-x/-y`, `--nov-basamento`
 * sulla radice (elemento foglia per queste variabili, `data-nov-var`) e chiama
 * `aggiornaModo` dello store solo se qualcosa cambia.
 *
 * Le soglie qui sono la fonte; `layout.css` e `tokens.css` le ripetono a mano
 * nelle media query della prima pittura (con un commento che rimanda qui).
 * Nessun accesso al browser a livello di modulo.
 */

import { raggioMassimoBordo, raggioMassimoFondo, misureArco } from '../dial/geometria';
import { runtime } from '../state/runtime';
import { aggiornaModo, type Geometria, type Modo, type ModoCalcolato, type MotivoElenco, type PreferenzaVista } from '../state/store';
import { raggioMaxFondo, SOGLIE_EM } from '../styles/tokens';

/** Soglie in em (tokens.ts SOGLIE_EM): larghezza per 'bordo', altezze minime. */
export const MQ_BORDO = { larghezzaEm: SOGLIE_EM.bordo, altezzaEm: SOGLIE_EM.altezzaBordo, rapportoMinimo: 1.1 } as const;
export const MQ_FONDO = { altezzaEm: SOGLIE_EM.altezzaFondo } as const;
/** Sotto questa larghezza il bottone del sito sta in basso a sinistra (ConceptBackButton). */
export const MQ_BOTTONE_SITO_EM = SOGLIE_EM.bottoneSito;

/** Fascia alta riservata in 'bordo': bottone del sito a sinistra, testata a destra (px). */
export const FASCIA_ALTA = 72;
/** Basamento mobile: bottone del sito 36 + 14 sotto + 12 sopra (px), più la safe area. */
export const BASAMENTO_BASE = 62;
/** Basamento in vista elenco (solo per non finire sotto il bottone del sito). */
export const BASAMENTO_ELENCO = 62;
/** 1rem oltre questa misura = testo ingrandito: vista elenco (ux-architect §6.9). */
export const REM_TESTO_GRANDE = 20;
/** Isteresi in px sulle soglie di altezza, per non oscillare (ux-architect §6.9). */
export const ISTERESI_PX = 40;
/** Colonna di lettura minima in 'bordo' (ux-architect §2.2). */
export const COLONNA_MINIMA = 360;
/** Spazio tra l'arco e la colonna di lettura in 'bordo' (parole + respiro). */
export const RIENTRO_COLONNA = 220;
/** Raggi limite del quadrante 'bordo' (tech-architect §7.4). */
export const RAGGIO_BORDO = { min: 220, max: 480 } as const;
/** Raggio massimo del quadrante 'fondo' (tech-architect §7.4). */
export const RAGGIO_FONDO_MAX = 190;

export interface MisureModo {
  /** Larghezza e altezza della finestra (px CSS). */
  readonly w: number;
  readonly h: number;
  /** Altezza del visualViewport (tastiera aperta). */
  readonly vvH: number;
  /** px di 1rem (core/capabilities.ts → remPx()). */
  readonly rem: number;
  /** env(safe-area-inset-bottom) in px. */
  readonly safeBasso: number;
  readonly preferenza: PreferenzaVista;
  /** Modo precedente, per l'isteresi (null al primo calcolo). */
  readonly modoPrima: Modo | null;
}

export interface DecisioneModo extends ModoCalcolato {
  /** Perno e raggio del quadrante in px del viewport (0 in elenco). */
  readonly perno: { readonly x: number; readonly y: number; readonly r: number };
  /** Altezza del basamento mobile (0 in 'bordo'). */
  readonly basamento: number;
}

function raggioBordo(w: number, h: number): number {
  const daAltezza = raggioMassimoBordo(h, FASCIA_ALTA);
  const daLarghezza = Math.floor(0.4 * w - 120);
  return Math.max(RAGGIO_BORDO.min, Math.min(RAGGIO_BORDO.max, daAltezza, daLarghezza));
}

function raggioFondo(w: number, vvH: number): number {
  return Math.floor(Math.max(80, Math.min(0.44 * w, 0.26 * vvH, RAGGIO_FONDO_MAX, raggioMassimoFondo(w), raggioMaxFondo(w))));
}

/** Regola definitiva di ux-architect §2.2 con le misure di tech-architect §7.4. */
export function decidiModo(m: MisureModo): DecisioneModo {
  const rem = m.rem > 0 ? m.rem : 16;
  const wEm = m.w / rem;
  const hEm = m.h / rem;
  const basamento = BASAMENTO_BASE + m.safeBasso;
  // isteresi: chi è già in elenco per l'altezza ha bisogno di 40 px in più per uscirne
  const extra = m.modoPrima === 'elenco' ? ISTERESI_PX / rem : 0;

  const orizzontale = m.w > m.h * MQ_BORDO.rapportoMinimo;
  const bordoPossibile = wEm >= MQ_BORDO.larghezzaEm && hEm >= MQ_BORDO.altezzaEm + extra && orizzontale;
  const fondoPossibile = hEm >= MQ_FONDO.altezzaEm + extra;

  let geometria: Geometria = 'fondo';
  let perno = { x: 0, y: 0, r: 0 };
  let ciSta = false;

  if (bordoPossibile) {
    const r = raggioBordo(m.w, m.h);
    const base = misureArco('quadrante', 'bordo', r).base;
    const colonna = m.w - (base + r + RIENTRO_COLONNA) - 32;
    if (colonna >= COLONNA_MINIMA) {
      geometria = 'bordo';
      perno = { x: base, y: FASCIA_ALTA + (m.h - FASCIA_ALTA) / 2, r };
      ciSta = true;
    }
  }
  if (!ciSta && fondoPossibile) {
    const r = raggioFondo(m.w, m.vvH > 0 ? m.vvH : m.h);
    const base = misureArco('quadrante', 'fondo', r).base;
    geometria = 'fondo';
    perno = { x: m.w / 2, y: m.h - basamento - base, r };
    ciSta = true;
  }

  const testoGrande = rem > REM_TESTO_GRANDE;
  const quadrantePossibile = ciSta && !testoGrande;
  let motivoElenco: MotivoElenco = null;
  if (!quadrantePossibile) {
    motivoElenco = testoGrande ? 'testo-grande' : hEm < MQ_FONDO.altezzaEm + extra ? 'finestra-bassa' : 'non-ci-sta';
  }

  let modo: Modo;
  if (m.preferenza === 'elenco') modo = 'elenco';
  else if (m.preferenza === 'quadrante') modo = quadrantePossibile ? 'quadrante' : 'elenco';
  else modo = quadrantePossibile ? 'quadrante' : 'elenco';
  if (m.preferenza !== 'auto' && modo === 'elenco' && quadrantePossibile) motivoElenco = null;

  const sottoBottone = wEm < MQ_BOTTONE_SITO_EM;
  return {
    modo,
    geometria,
    motivoElenco: modo === 'elenco' && m.preferenza === 'auto' ? motivoElenco : null,
    quadrantePossibile,
    perno: modo === 'quadrante' ? perno : { x: 0, y: 0, r: 0 },
    basamento: sottoBottone ? (modo === 'quadrante' && geometria === 'fondo' ? basamento : BASAMENTO_ELENCO + m.safeBasso) : 0,
  };
}

function scriviVar(root: HTMLElement, nome: string, valore: string): void {
  if (root.style.getPropertyValue(nome) !== valore) root.style.setProperty(nome, valore);
}

/**
 * Applica la decisione: runtime.perno, variabili sulla radice, store (solo se
 * modo, geometria o motivo cambiano). La chiama Novanta.tsx al mount e nel
 * debounce del resize, mai per frame.
 */
export function applicaModo(root: HTMLElement, d: DecisioneModo): void {
  runtime.perno.x = d.perno.x;
  runtime.perno.y = d.perno.y;
  runtime.perno.r = d.perno.r;
  scriviVar(root, '--nov-r', `${d.perno.r}px`);
  scriviVar(root, '--nov-perno-x', `${Math.round(d.perno.x * 100) / 100}px`);
  scriviVar(root, '--nov-perno-y', `${Math.round(d.perno.y * 100) / 100}px`);
  scriviVar(root, '--nov-basamento', `${Math.round(d.basamento)}px`);
  aggiornaModo(d, d.perno.r);
}
