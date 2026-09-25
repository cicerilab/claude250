/**
 * IMPRONTA · blocchi per frame: stato GL, culling, impacchettamento uniform
 * (shader-engineer)
 *
 * Per ogni blocco del registro (relief/registry.ts) il WebGL tiene uno
 * `StatoBloccoGL`: lo slot nell'atlante, la maschera cotta (misure, margine,
 * corpo), la versione cotta, la parte statica degli uniform.
 *
 * A ogni frame:
 *   1. `selezionaBlocchi`: tra i blocchi che il registro dà per visibili
 *      (IntersectionObserver con una viewport di margine) si tengono quelli
 *      che toccano DAVVERO lo schermo (più un margine per ombre e cuscinetto),
 *      al massimo MAX_BLOCCHI = 8, per `spec.priorita` e poi per distanza dal
 *      centro dello schermo (tech-architect §7.2).
 *   2. `ordinaPerDisegno`: nello shader vince l'ultimo scritto dove due blocchi
 *      si coprono, quindi prima i pezzi con carta propria (stanno "sotto"),
 *      poi il resto; a parità, in ordine di registrazione (≈ ordine del DOM).
 *   3. `impacchetta`: scrive rettangolo, slot, pressione e parametri statici
 *      negli array uniform con `scriviBlocco` di materials.ts. Non alloca.
 *
 * Coordinate: `rectView` del registro è in px CSS del viewport, NON ruotato;
 * lo shader vuole px del drawing buffer (× dpr), origine in alto a sinistra,
 * rettangolo allargato del margine della maschera (`padCss`). La misura del
 * rettangolo è quella della maschera COTTA (non quella attuale del DOM): se il
 * blocco cambia misura, fino alla nuova cottura il rilievo resta com'era,
 * invece di stirarsi.
 *
 * Nessun accesso a window/document a livello di modulo.
 */
import type { ReliefBlock } from '../relief/types';
import { MAX_BLOCCHI, scriviBlocco, type DatiBloccoFrame, type MaterialeRilievo } from './materials';
import type { RisultatoMaschera } from './maskPainter';
import { parametriBlocco, type CartaGL, type ParametriBloccoGL, type TecnicaGL } from './presets';
import type { Slot } from './atlas';

/** Margine attorno allo schermo entro cui un blocco conta come "sullo schermo" (px CSS). */
export const MARGINE_SCHERMO = 48;
/** Attesa dopo un cambio di misura prima di ricuocere (ms): durante un resize non si ricuoce a ogni passo. */
export const ATTESA_MISURA = 150;
/** Differenza di misura (px CSS) sotto la quale la maschera cotta va ancora bene. */
const TOLLERANZA_MISURA = 0.75;

/** Quello che resta di una maschera dopo la cottura (il canvas si butta). */
export interface MascheraCotta {
  larghezzaTexel: number;
  altezzaTexel: number;
  padCss: number;
  larghezzaCss: number;
  altezzaCss: number;
  corpoCss: number;
  scala: number;
  tecnica: TecnicaGL;
  /** Misura del blocco (px CSS) al momento del disegno. */
  misuraW: number;
  misuraH: number;
}

/** Maschera disegnata sul canvas 2D, in attesa di andare sul GPU. */
export interface MascheraPronta {
  risultato: RisultatoMaschera;
  versione: number;
  misuraW: number;
  misuraH: number;
}

export interface StatoBloccoGL {
  readonly id: string;
  /** Slot nell'atlante (null = mai cotto, liberato o atlante azzerato). */
  slot: Slot | null;
  /** Misure della maschera che sta nello slot. */
  cotta: MascheraCotta | null;
  /** Versione del blocco che sta nello slot (0 = nessuna). */
  versioneCotta: number;
  /** Versione in disegno sul canvas 2D (0 = nessun disegno in corso). */
  inCorso: number;
  /** Maschera disegnata, da cuocere nel prossimo frame. */
  pronta: MascheraPronta | null;
  /** Ultima versione il cui disegno è fallito (non si riprova la stessa). */
  versioneFallita: number;
  /** Da ridisegnare anche se la versione non è cambiata (font arrivati, DPR, ripristino). */
  daRifare: boolean;
  /** Orologio (ms) da cui la misura del DOM è diversa da quella cotta; NaN = uguale. */
  diversoDa: number;
  /** Parte statica degli uniform e la chiave con cui è stata calcolata. */
  statici: ParametriBloccoGL | null;
  chiaveStatici: string;
  /** Ultimo frame in cui il blocco è andato allo shader (per liberare i più vecchi). */
  ultimoUso: number;
  /** Canvas 2D riusato (blocchi con slot riservato, che cambiano a ogni tasto). */
  canvas: HTMLCanvasElement | null;
  /** Sul fantasma c'è l'attributo "fuori dal GL" (vedi ImprontaGL). */
  fuori: boolean;
}

export function nuovoStato(id: string): StatoBloccoGL {
  return {
    id,
    slot: null,
    cotta: null,
    versioneCotta: 0,
    inCorso: 0,
    pronta: null,
    versioneFallita: 0,
    daRifare: false,
    diversoDa: Number.NaN,
    statici: null,
    chiaveStatici: '',
    ultimoUso: 0,
    canvas: null,
    fuori: false,
  };
}

/** Il blocco tocca lo schermo (più il margine)? Usa il rettangolo non ruotato allargato della diagonale se ruotato. */
export function sulloSchermo(b: ReliefBlock, vw: number, vh: number, margine: number = MARGINE_SCHERMO): boolean {
  if (!b.misurato) return false;
  const r = b.rectView;
  let mx = margine;
  let my = margine;
  if ((b.spec.rotazione ?? 0) !== 0) {
    // Riquadro del rettangolo ruotato: basta la mezza diagonale.
    const d = Math.hypot(r.w, r.h) * 0.5;
    mx += d - r.w * 0.5;
    my += d - r.h * 0.5;
  }
  return r.x + r.w > -mx && r.x < vw + mx && r.y + r.h > -my && r.y < vh + my;
}

/** Punteggio per il culling: priorità alta prima, poi vicino al centro dello schermo. */
function punteggio(b: ReliefBlock, vh: number): number {
  const cy = b.rectView.y + b.rectView.h * 0.5;
  const distanza = Math.abs(cy - vh * 0.5);
  return (b.spec.priorita ?? 0) * 1e6 - distanza;
}

/**
 * Riempie `out` con i blocchi da mandare allo shader in questo frame (non
 * ancora ordinati per disegno) e restituisce quanti sono. `tutti` = i blocchi
 * visibili del registro; `candidati` è un array di appoggio riusato.
 * Tiene anche i blocchi non ancora cotti: chi chiama decide se disegnarli.
 */
export function selezionaBlocchi(
  tutti: readonly ReliefBlock[],
  vw: number,
  vh: number,
  candidati: ReliefBlock[],
  out: ReliefBlock[],
  max: number = MAX_BLOCCHI,
): number {
  candidati.length = 0;
  for (const b of tutti) {
    if (b.visibile && sulloSchermo(b, vw, vh)) candidati.push(b);
  }
  if (candidati.length > max) {
    candidati.sort((a, c) => punteggio(c, vh) - punteggio(a, vh));
  }
  out.length = 0;
  const n = Math.min(max, candidati.length);
  for (let i = 0; i < n; i += 1) {
    const b = candidati[i];
    if (b !== undefined) out.push(b);
  }
  return n;
}

function comparaDisegno(a: ReliefBlock, b: ReliefBlock): number {
  const pa = a.spec.carta !== undefined && a.spec.kind === 'piece' ? 0 : 1;
  const pb = b.spec.carta !== undefined && b.spec.kind === 'piece' ? 0 : 1;
  if (pa !== pb) return pa - pb;
  return a.ordine - b.ordine;
}

/** Ordine di scrittura negli uniform: pezzi con carta propria prima (sotto), poi per registrazione. */
export function ordinaPerDisegno(sel: ReliefBlock[]): void {
  sel.sort(comparaDisegno);
}

/** Aggiorna la parte statica degli uniform se sono cambiati spec, corpo o DPR. */
export function aggiornaStatici(stato: StatoBloccoGL, b: ReliefBlock, dpr: number): ParametriBloccoGL | null {
  const c = stato.cotta;
  if (c === null) return null;
  const carta: CartaGL | null = b.spec.carta ?? null;
  const chiave = `${b.spec.tecnica}|${b.spec.profondita}|${c.corpoCss}|${dpr}|${carta ?? '-'}|${b.spec.kind}`;
  if (stato.statici !== null && stato.chiaveStatici === chiave) return stato.statici;
  stato.statici = parametriBlocco({
    tecnica: b.spec.tecnica,
    profondita: b.spec.profondita,
    corpoPx: c.corpoCss,
    dpr,
    carta,
    pezzo: b.spec.kind === 'piece',
  });
  stato.chiaveStatici = chiave;
  return stato.statici;
}

/**
 * Serve un nuovo disegno della maschera? (versione nuova, da rifare, o misura
 * del DOM diversa da quella cotta da almeno ATTESA_MISURA ms).
 * Aggiorna `diversoDa`.
 */
export function serveDisegno(b: ReliefBlock, stato: StatoBloccoGL, now: number): boolean {
  if (!b.misurato) return false;
  // Un disegno alla volta, e mai mentre una maschera aspetta la cottura: il
  // canvas riusato dei blocchi a slot riservato verrebbe sovrascritto.
  if (stato.inCorso !== 0 || stato.pronta !== null) return false;
  if (b.versione > stato.versioneCotta) return b.versione !== stato.versioneFallita;
  if (stato.daRifare) return true;
  const c = stato.cotta;
  if (c === null) return false;
  const diversa =
    Math.abs(b.rectDoc.w - c.misuraW) > TOLLERANZA_MISURA || Math.abs(b.rectDoc.h - c.misuraH) > TOLLERANZA_MISURA;
  if (!diversa) {
    stato.diversoDa = Number.NaN;
    return false;
  }
  if (Number.isNaN(stato.diversoDa)) stato.diversoDa = now;
  return now - stato.diversoDa >= ATTESA_MISURA;
}

/** C'è un cambio di misura in attesa (serve tenere vivo il ticker fino alla ricottura). */
export function misuraInAttesa(stato: StatoBloccoGL): boolean {
  return !Number.isNaN(stato.diversoDa);
}

/** Il blocco ha nello slot la sua versione corrente (o una versione fallita: non si aspetta oltre). */
export function aggiornato(b: ReliefBlock, stato: StatoBloccoGL | undefined): boolean {
  if (stato === undefined) return false;
  if (b.versione === stato.versioneFallita) return true;
  return stato.slot !== null && stato.versioneCotta >= b.versione && !stato.daRifare;
}

const appoggio: DatiBloccoFrame = {
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  u0: 0,
  v0: 0,
  du: 0,
  dv: 0,
  pressione: 0,
  rotazioneGradi: 0,
  statici: {
    profonditaBuffer: 0,
    inchiostro: 0,
    lamina: 0,
    stringiMin: 1,
    spessoreBuffer: 0,
    cartaIndice: -1,
  },
};

/**
 * Scrive negli uniform i blocchi selezionati che hanno uno slot cotto.
 * Restituisce quanti ne ha scritti (da passare a `impostaNumeroBlocchi`).
 * `disegnati` riceve gli id scritti (per l'attributo sui fantasmi).
 */
export function impacchetta(
  m: MaterialeRilievo,
  sel: readonly ReliefBlock[],
  stati: ReadonlyMap<string, StatoBloccoGL>,
  dpr: number,
  latoAtlante: number,
  frame: number,
  disegnati: Set<string>,
): number {
  disegnati.clear();
  let n = 0;
  for (const b of sel) {
    if (n >= MAX_BLOCCHI) break;
    const stato = stati.get(b.id);
    if (stato === undefined || stato.slot === null || stato.cotta === null) continue;
    const statici = aggiornaStatici(stato, b, dpr);
    if (statici === null) continue;
    const c = stato.cotta;
    const r = b.rectView;
    // Il rettangolo cotto si ancora all'angolo in alto a sinistra del blocco
    // (per i pezzi ruotati: al centro, perché la rotazione è attorno al centro).
    const ruotato = (b.spec.rotazione ?? 0) !== 0;
    const x0 = ruotato ? r.x + r.w * 0.5 - c.misuraW * 0.5 : r.x;
    const y0 = ruotato ? r.y + r.h * 0.5 - c.misuraH * 0.5 : r.y;
    appoggio.x = (x0 - c.padCss) * dpr;
    appoggio.y = (y0 - c.padCss) * dpr;
    appoggio.w = c.larghezzaCss * dpr;
    appoggio.h = c.altezzaCss * dpr;
    appoggio.u0 = stato.slot.x / latoAtlante;
    appoggio.v0 = stato.slot.y / latoAtlante;
    appoggio.du = c.larghezzaTexel / latoAtlante;
    appoggio.dv = c.altezzaTexel / latoAtlante;
    appoggio.pressione = b.pressione;
    appoggio.rotazioneGradi = b.spec.rotazione ?? 0;
    appoggio.statici = statici;
    scriviBlocco(m, n, appoggio);
    stato.ultimoUso = frame;
    disegnati.add(b.id);
    n += 1;
  }
  return n;
}
