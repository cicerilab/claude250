/**
 * IMPRONTA · contratto dei blocchi a rilievo (tech-architect §7.1, con le
 * aggiunte del webgl-artist §10.1: tecnica 'cordonatura' e forma di
 * ReliefLayer uguale a `LayerMaschera` di webgl/maskPainter.ts).
 *
 * Solo tipi: nessun codice, nessun accesso al browser.
 */

import type { Carta } from '../state/store';

/**
 * Tecnica di stampa del rilievo. Le prime tre sono quelle del banco
 * (content/prezzi.ts); 'cordonatura' è la piega di una partecipazione
 * (solo GL e layer 'linea', webgl-artist §10.1).
 */
export type TecnicaRilievo = 'secco' | 'colore' | 'lamina' | 'cordonatura';

/** Come si misura il blocco (§7.2). */
export type TrackingRilievo = 'doc' | 'live';

export type TipoRilievo = 'text' | 'svg' | 'piece';

/** Stile di un layer senza selettore (o per forzare lo stato finale). */
export interface StileLayer {
  famiglia: string;
  /** px CSS */
  dimensione: number;
  peso: number;
  /** asse wdth in percento (50..150) */
  larghezza: number;
  /** letter-spacing in px CSS */
  spaziatura: number;
  /** line-height in px CSS */
  interlinea: number;
  allineamento: 'left' | 'center' | 'right';
  trasformazione: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Un layer di un pezzo composto (kind 'piece'): testi, svg e cordonature
 * posizionati in percento del rettangolo del pezzo.
 */
export interface ReliefLayer {
  kind: 'text' | 'svg' | 'linea';
  /** Riquadro in percento del pezzo, 0..100. */
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  svg?: string;
  /** Se manca, quella del pezzo. */
  tecnica?: TecnicaRilievo;
  /** 0..1; 0,3 = inchiostro "a bacio". */
  profondita?: number;
  /** Figlio del pezzo da cui prendere testo, metrica e posizione vere. */
  selettore?: string;
  stile?: Partial<StileLayer>;
}

export interface ReliefSpec {
  /** 'piece' = pezzo composto di "Per chi" o la prova del Banco. */
  kind: TipoRilievo;
  /** Per kind 'text'. Se manca si usa il textContent del fantasma. */
  text?: string;
  /** Markup SVG (dal vector-artist) per kind 'svg'. */
  svg?: string;
  /** Per 'piece': testi/svg/linee posizionati in % del rettangolo. */
  layers?: ReliefLayer[];
  tecnica: TecnicaRilievo;
  /** Se assente = carta globale; presente solo in Per chi e Banco. */
  carta?: Carta;
  /** 0..1, massimo rilievo a pressione 1. */
  profondita: number;
  /** Gradi, orari come in CSS (Per chi: -2, 1.5, -0.5). */
  rotazione?: number;
  tracking: TrackingRilievo;
  /** Riserva nell'atlante per testi che cambiano (Banco), px CSS. */
  slot?: { maxW: number; maxH: number };
  /** Ordine di culling se i visibili superano il massimo (più alto = prima). */
  priorita?: number;
}

/** Rettangolo in px CSS. */
export interface Rettangolo {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ReliefBlock {
  readonly id: string;
  readonly el: HTMLElement;
  spec: ReliefSpec;
  /**
   * Coordinate documento (y include lo scroll al momento della misura), del
   * rettangolo NON ruotato: per i pezzi ruotati è offsetWidth × offsetHeight
   * centrato sul centro del riquadro misurato; la rotazione è in spec.rotazione.
   */
  rectDoc: Rettangolo;
  /** Coordinate viewport in px CSS, aggiornate a ogni frame (fase 'read'). */
  rectView: Rettangolo;
  /** 0..1, scritto da motion/usePressione con registry.setPressione. */
  pressione: number;
  /** Incrementa quando la maschera va ridisegnata (testo, svg, layer, tecnica, kind, slot). */
  versione: number;
  /** Da IntersectionObserver con margine di 1 viewport (rootMargin '100% 0px'). */
  visibile: boolean;
  /** Ordine di registrazione (stabile): a parità di priorità vince il più vecchio. */
  readonly ordine: number;
  /** true dopo la prima misura riuscita (w e h > 0). */
  misurato: boolean;
}

/** Eventi del registro per lo shader-engineer. */
export type EventoRegistro =
  | { readonly tipo: 'aggiunto'; readonly id: string }
  | { readonly tipo: 'rimosso'; readonly id: string }
  | { readonly tipo: 'versione'; readonly id: string }
  | { readonly tipo: 'spec'; readonly id: string }
  | { readonly tipo: 'misura'; readonly id: string }
  | { readonly tipo: 'visibilita'; readonly id: string };
