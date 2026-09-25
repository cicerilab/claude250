/**
 * IMPRONTA · luce radente.
 *
 * La luce è il "cursore" di questo sito: il puntatore di sistema resta quello
 * normale e a rispondere è la lampada che rade la carta (creative-director
 * 4.3, trend-researcher divieto 12). Questo modulo scrive SOLO gli obiettivi
 * della luce in `runtime.light` e ne fa l'inseguimento dentro il ticker unico
 * (fase "update"); il WebGL legge `runtime.light`, il fallback CSS legge
 * `--imp-luce-x` / `--imp-luce-y` su `.imp-root` (scritte al massimo a 30 Hz).
 *
 * Fonti, in ordine di arrivo (vince l'ultima):
 * - puntatore fine: posizione rispetto alla finestra, con inerzia 0,08/frame;
 * - dito: trascinando sulla carta (non su testi e controlli), senza bloccare
 *   lo scroll verticale (`touch-action: pan-y` in interaction.css);
 * - giroscopio: solo se attivato esplicitamente (gyroPermission.ts);
 * - dial "Direzione della luce" (tastiera, lettori di schermo);
 * - nessun input: arco lentissimo solo nell'hero, poi riposo a 135°.
 *
 * Convenzione angoli (condivisa con content/testi.ts LUCE.valore e con lo
 * shader): azimut = direzione DA CUI arriva la luce, in gradi, sullo schermo
 * con y verso l'alto. 0 = da destra, 90 = dall'alto, 135 = da sinistra in alto
 * (riposo), 180 = da sinistra, 270 = dal basso. Elevazione in gradi sopra il
 * foglio, sempre bassa (18-25), così il rilievo non sparisce mai.
 *
 * Reduced motion: luce ferma a 135° / 22°, nessun listener di puntatore o
 * giroscopio, nessun arco. Il dial resta e sposta la luce di scatto.
 *
 * Contiene anche il magnetismo sobrio (attachMagnete / useMagnete): usa lo
 * stesso ticker e gli stessi criteri di puntatore, e vale solo per la leva e
 * per le carte (oggetti fisici che la mano può "sentire").
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ChangeEvent, RefObject } from 'react';
import { track } from '@/lib/analytics';
import { LUCE } from '../content/testi';
import { ticker } from '../core/ticker';
import { seguiAngoloDt, seguiDt } from '../motion/spring';
import { runtime } from '../state/runtime';
import type { LuceFonte } from '../state/runtime';
import { store } from '../state/store';
import { gyroAttivo, inizializzaGyro, segnalaToccoCarta, subscribeGyro } from './gyroPermission';

/* ------------------------------------------------------------------ costanti */

export const LUCE_RIPOSO_AZIMUT = 135;
export const LUCE_RIPOSO_ELEVAZIONE = 22;
/** Semiampiezza dell'arco coperto da puntatore, dito e giroscopio attorno al riposo. */
export const LUCE_ARCO = 50;
export const LUCE_ELEVAZIONE_MIN = 18;
export const LUCE_ELEVAZIONE_MAX = 25;
/** Frazione di distanza coperta in un frame a 60 Hz (creative-director). */
export const LUCE_INERZIA = 0.08;

export const DIAL_MIN = 0;
export const DIAL_MAX = 345;
export const DIAL_PASSO = 15;

/** Arco automatico dell'hero: ±45° attorno al riposo, un periodo ogni 40 s. */
const ARCO_AMPIEZZA = 45;
const ARCO_PERIODO_MS = 40_000;
/** L'arco aggiorna l'obiettivo a 30 Hz (tech-architect §8). */
const ARCO_PASSO_MS = 1000 / 30;
/** Dopo quanti ms senza input l'arco riparte (solo con l'hero in vista). */
const ARCO_DOPO_MS = 8_000;
/** Variabili CSS del fallback: al massimo 30 scritture al secondo. */
const CSS_PASSO_MS = 1000 / 30;
/** Dopo un cambio dal dial il puntatore non lo sovrascrive per questo tempo. */
const DIAL_PRECEDENZA_MS = 1_500;
/** Gradi di inclinazione che equivalgono al puntatore sul bordo della finestra. */
const GYRO_GRADI_PIENI = 25;
/** Ricentraggio lento della posizione neutra del telefono (per evento). */
const GYRO_DERIVA = 0.002;
/** Sotto questa distanza (gradi) la luce è considerata arrivata. */
const QUIETE_GRADI = 0.02;
/** Inseguimento del magnete: più rapido della luce, come un foglio sfiorato. */
const MAGNETE_INERZIA = 0.18;

/** Elementi su cui il dito NON muove la luce: controlli. */
const INTERATTIVI =
  'a,button,input,select,textarea,label,summary,[contenteditable="true"],[role="button"],[role="radio"],[role="slider"],[role="tab"],[role="switch"],.imp-ix-dial,[data-imp-no-luce]';
/** Elementi di testo: il dito li seleziona, non muove la luce. */
const TESTI = 'p,h1,h2,h3,h4,h5,h6,li,dt,dd,figcaption,blockquote,address,td,th';

/* ------------------------------------------------------------------ geometria */

function limita(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Angolo in [0, 360). */
export function normalizzaAngolo(gradi: number): number {
  const r = gradi % 360;
  return r < 0 ? r + 360 : r;
}

/** Differenza più corta da `da` ad `a`, in (-180, 180]. */
export function differenzaAngolo(da: number, a: number): number {
  let d = normalizzaAngolo(a) - normalizzaAngolo(da);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Posizione normalizzata (-1..1 su x e y, y verso il basso come lo schermo)
 * → luce. È continua su tutta la finestra (nessun salto sulla diagonale):
 * - puntatore a sinistra → luce da sinistra (fino a 185°);
 * - puntatore in alto → luce dall'alto (fino a 85°);
 * - angolo in alto a sinistra e in basso a destra → riposo (135°);
 * - verso l'alto a sinistra la lampada sale (25°), verso il basso a destra
 *   scende (18°): la luce resta sempre radente.
 */
export function luceDaPosizione(nx: number, ny: number): { azimuth: number; elevation: number } {
  const x = limita(nx, -1, 1);
  const y = limita(ny, -1, 1);
  const azimuth = LUCE_RIPOSO_AZIMUT + LUCE_ARCO * ((y - x) / 2);
  const elevation = limita(21.5 - 3.5 * ((x + y) / 2), LUCE_ELEVAZIONE_MIN, LUCE_ELEVAZIONE_MAX);
  return { azimuth: normalizzaAngolo(azimuth), elevation };
}

/** Valore del dial (multiplo di 15 in 0..345) più vicino a un azimut. */
export function dialDaAzimut(gradi: number): number {
  return (Math.round(normalizzaAngolo(gradi) / DIAL_PASSO) * DIAL_PASSO) % 360;
}

/**
 * Testo per aria-valuetext. Usa LUCE.valore del copywriter (ottavo più
 * vicino) e aggiunge i gradi, così due passi dello stesso ottavo si
 * distinguono all'ascolto.
 */
export function descriviLuce(gradi: number): string {
  const g = dialDaAzimut(gradi);
  const parole = LUCE.valore(g) ?? LUCE.aria;
  return `${parole}, ${g} gradi`;
}

/* ------------------------------------------------------------------ stato di modulo */

interface StatoLuce {
  root: HTMLElement | null;
  avviata: boolean;
  heroVisibile: boolean;
  ultimoInput: number;
  arcoAttivo: boolean;
  arcoInizio: number;
  arcoUltimoPasso: number;
  cssInSospeso: boolean;
  cssUltimo: number;
  dialPrecedenzaFino: number;
  dialValore: number;
  toccoAttivo: number | null;
  gyroBase: { beta: number; gamma: number } | null;
  primaInterazioneSegnalata: boolean;
}

const stato: StatoLuce = {
  root: null,
  avviata: false,
  heroVisibile: false,
  ultimoInput: Number.NEGATIVE_INFINITY,
  arcoAttivo: false,
  arcoInizio: 0,
  arcoUltimoPasso: 0,
  cssInSospeso: false,
  cssUltimo: Number.NEGATIVE_INFINITY,
  dialPrecedenzaFino: 0,
  dialValore: LUCE_RIPOSO_AZIMUT,
  toccoAttivo: null,
  gyroBase: null,
  primaInterazioneSegnalata: false,
};

const ascoltatoriDial = new Set<() => void>();
const elementiDial = new Set<HTMLElement>();

/* ------------------------------------------------------------------ obiettivi */

function aggiornaDial(): void {
  const v = dialDaAzimut(runtime.light.targetAzimuth);
  if (v === stato.dialValore) return;
  stato.dialValore = v;
  ascoltatoriDial.forEach((fn) => fn());
}

function segnalaPrimaInterazione(fonte: LuceFonte): void {
  if (stato.primaInterazioneSegnalata) return;
  stato.primaInterazioneSegnalata = true;
  track('c10_luce_mossa', { concept: 10, fonte });
}

function impostaObiettivo(azimuth: number, elevation: number, fonte: LuceFonte): void {
  const L = runtime.light;
  L.targetAzimuth = normalizzaAngolo(azimuth);
  L.targetElevation = limita(elevation, LUCE_ELEVAZIONE_MIN, LUCE_ELEVAZIONE_MAX);
  L.fonte = fonte;
  if (fonte !== 'idle') {
    stato.ultimoInput = performance.now();
    stato.arcoAttivo = false;
    segnalaPrimaInterazione(fonte);
  }
  aggiornaDial();
  ticker.wake();
}

function applicaPosizione(clientX: number, clientY: number, fonte: LuceFonte): void {
  const w = runtime.viewport.w > 0 ? runtime.viewport.w : window.innerWidth;
  const h = runtime.viewport.h > 0 ? runtime.viewport.h : window.innerHeight;
  if (w <= 0 || h <= 0) return;
  const { azimuth, elevation } = luceDaPosizione((clientX / w) * 2 - 1, (clientY / h) * 2 - 1);
  impostaObiettivo(azimuth, elevation, fonte);
}

/**
 * Il dial (o qualsiasi controllo esplicito) sposta la luce. Vince sul
 * puntatore per DIAL_PRECEDENZA_MS, così trascinare il dial col mouse non
 * viene sovrascritto dai movimenti del mouse stesso.
 */
export function impostaLuceDaDial(gradi: number): void {
  stato.dialPrecedenzaFino = performance.now() + DIAL_PRECEDENZA_MS;
  impostaObiettivo(dialDaAzimut(gradi), LUCE_RIPOSO_ELEVAZIONE, 'dial');
}

/* ------------------------------------------------------------------ input: puntatore e dito */

function tipoPuntatore(t: string): 'mouse' | 'touch' | 'pen' {
  if (t === 'touch') return 'touch';
  if (t === 'pen') return 'pen';
  return 'mouse';
}

function dentroDial(t: EventTarget | null): boolean {
  return t instanceof Element && t.closest('.imp-ix-dial') !== null;
}

/** true se il dito è sulla carta: non su un controllo, non su un testo da leggere. */
function suCarta(t: EventTarget | null): boolean {
  if (!(t instanceof Element)) return false;
  const root = stato.root;
  if (!root || !root.contains(t)) return false;
  if (t.closest(INTERATTIVI)) return false;
  // Il rilievo a secco è materia della carta anche se è fatto di lettere.
  if (t.closest('.imp-relief')) return true;
  return t.closest(TESTI) === null;
}

function suPointerMove(e: PointerEvent): void {
  const p = runtime.pointer;
  p.x = e.clientX;
  p.y = e.clientY;
  p.active = true;
  p.tipo = tipoPuntatore(e.pointerType);

  if (e.pointerType === 'touch') {
    if (stato.toccoAttivo === e.pointerId) applicaPosizione(e.clientX, e.clientY, 'touch');
    return;
  }
  if (performance.now() < stato.dialPrecedenzaFino) return;
  if (dentroDial(e.target)) return;
  applicaPosizione(e.clientX, e.clientY, 'pointer');
}

function suPointerDown(e: PointerEvent): void {
  if (e.pointerType !== 'touch') return;
  if (!e.isPrimary || !suCarta(e.target)) return;
  stato.toccoAttivo = e.pointerId;
  runtime.pointer.x = e.clientX;
  runtime.pointer.y = e.clientY;
  runtime.pointer.active = true;
  runtime.pointer.tipo = 'touch';
  applicaPosizione(e.clientX, e.clientY, 'touch');
}

function suPointerFine(e: PointerEvent): void {
  if (e.pointerType !== 'touch' || stato.toccoAttivo !== e.pointerId) return;
  stato.toccoAttivo = null;
  runtime.pointer.active = false;
  // pointerup di un dito è un gesto valido per requestPermission su iOS;
  // pointercancel (è partito lo scroll) no.
  if (e.type === 'pointerup') segnalaToccoCarta();
}

function suUscitaFinestra(): void {
  runtime.pointer.active = false;
}

function attaccaPuntatore(root: HTMLElement): () => void {
  const passivo: AddEventListenerOptions = { passive: true };
  const doc = document.documentElement;
  window.addEventListener('pointermove', suPointerMove, passivo);
  root.addEventListener('pointerdown', suPointerDown, passivo);
  window.addEventListener('pointerup', suPointerFine, passivo);
  window.addEventListener('pointercancel', suPointerFine, passivo);
  doc.addEventListener('pointerleave', suUscitaFinestra, passivo);
  return () => {
    window.removeEventListener('pointermove', suPointerMove);
    root.removeEventListener('pointerdown', suPointerDown);
    window.removeEventListener('pointerup', suPointerFine);
    window.removeEventListener('pointercancel', suPointerFine);
    doc.removeEventListener('pointerleave', suUscitaFinestra);
  };
}

/* ------------------------------------------------------------------ input: giroscopio */

function angoloSchermo(): number {
  const moderno = window.screen?.orientation?.angle;
  if (typeof moderno === 'number') return normalizzaAngolo(moderno);
  const legacy = (window as Window & { orientation?: number }).orientation;
  return typeof legacy === 'number' ? normalizzaAngolo(legacy) : 0;
}

/**
 * Come inclinare un foglio sotto una lampada fissa: abbassare il bordo destro
 * porta la luce da sinistra, abbassare il bordo alto la porta dall'alto.
 * La posizione neutra è quella del primo evento e si ricentra piano (deriva),
 * così chi cambia postura non resta con la luce storta.
 */
function suOrientamento(e: DeviceOrientationEvent): void {
  if (typeof e.beta !== 'number' || typeof e.gamma !== 'number') return;
  if (stato.toccoAttivo !== null) return;
  if (!stato.gyroBase) stato.gyroBase = { beta: e.beta, gamma: e.gamma };
  const base = stato.gyroBase;
  base.beta += (e.beta - base.beta) * GYRO_DERIVA;
  base.gamma += (e.gamma - base.gamma) * GYRO_DERIVA;

  const dx = e.gamma - base.gamma;
  const dy = e.beta - base.beta;
  let x = dx;
  let y = dy;
  const angolo = angoloSchermo();
  if (angolo === 90) {
    x = dy;
    y = -dx;
  } else if (angolo === 180) {
    x = -dx;
    y = -dy;
  } else if (angolo === 270) {
    x = -dy;
    y = dx;
  }
  const { azimuth, elevation } = luceDaPosizione(-x / GYRO_GRADI_PIENI, -y / GYRO_GRADI_PIENI);
  impostaObiettivo(azimuth, elevation, 'gyro');
}

function attaccaGyro(): () => void {
  window.addEventListener('deviceorientation', suOrientamento, { passive: true });
  return () => {
    window.removeEventListener('deviceorientation', suOrientamento);
  };
}

/* ------------------------------------------------------------------ ticker */

function segnaCambio(): void {
  runtime.markDirty();
  stato.cssInSospeso = true;
}

/** Fase "update": arco dell'hero e inseguimento con inerzia. */
function aggiornaLuce(dt: number, now: number): boolean {
  const L = runtime.light;

  if (store.get().reducedMotion) {
    if (L.fonte !== 'dial') {
      L.targetAzimuth = LUCE_RIPOSO_AZIMUT;
      L.targetElevation = LUCE_RIPOSO_ELEVAZIONE;
      L.fonte = 'idle';
      aggiornaDial();
    }
    stato.arcoAttivo = false;
    if (L.azimuth !== L.targetAzimuth || L.elevation !== L.targetElevation) {
      L.azimuth = L.targetAzimuth;
      L.elevation = L.targetElevation;
      segnaCambio();
    }
    return false;
  }

  const inattiva = now - stato.ultimoInput > ARCO_DOPO_MS;
  if (L.fonte !== 'dial' && inattiva) {
    if (stato.heroVisibile) {
      if (!stato.arcoAttivo) {
        stato.arcoAttivo = true;
        stato.arcoInizio = now;
        stato.arcoUltimoPasso = Number.NEGATIVE_INFINITY;
      }
      if (now - stato.arcoUltimoPasso >= ARCO_PASSO_MS) {
        stato.arcoUltimoPasso = now;
        const fase = ((now - stato.arcoInizio) % ARCO_PERIODO_MS) / ARCO_PERIODO_MS;
        L.targetAzimuth = normalizzaAngolo(LUCE_RIPOSO_AZIMUT + ARCO_AMPIEZZA * Math.sin(fase * Math.PI * 2));
        L.targetElevation = LUCE_RIPOSO_ELEVAZIONE;
        L.fonte = 'idle';
        aggiornaDial();
      }
    } else {
      stato.arcoAttivo = false;
      if (L.fonte === 'idle' && (L.targetAzimuth !== LUCE_RIPOSO_AZIMUT || L.targetElevation !== LUCE_RIPOSO_ELEVAZIONE)) {
        // Fuori dall'hero la luce senza input si ferma a riposo.
        L.targetAzimuth = LUCE_RIPOSO_AZIMUT;
        L.targetElevation = LUCE_RIPOSO_ELEVAZIONE;
        aggiornaDial();
      }
    }
  } else {
    stato.arcoAttivo = false;
  }

  const dAz = differenzaAngolo(L.azimuth, L.targetAzimuth);
  const dEl = L.targetElevation - L.elevation;
  if (Math.abs(dAz) < QUIETE_GRADI && Math.abs(dEl) < QUIETE_GRADI) {
    if (dAz !== 0 || dEl !== 0) {
      L.azimuth = L.targetAzimuth;
      L.elevation = L.targetElevation;
      segnaCambio();
    }
    return stato.arcoAttivo;
  }
  L.azimuth = seguiAngoloDt(L.azimuth, L.targetAzimuth, LUCE_INERZIA, dt);
  L.elevation = seguiDt(L.elevation, L.targetElevation, LUCE_INERZIA, dt);
  segnaCambio();
  return true;
}

function scriviVariabili(): void {
  const L = runtime.light;
  const az = L.azimuth.toFixed(1);
  elementiDial.forEach((el) => el.style.setProperty('--imp-ix-dial-az', az));
  const root = stato.root;
  if (!root || store.get().gl === 'on') return;
  const rad = (L.azimuth * Math.PI) / 180;
  // Direzione DA CUI arriva la luce, in coordinate CSS (y verso il basso).
  root.style.setProperty('--imp-luce-x', Math.cos(rad).toFixed(3));
  root.style.setProperty('--imp-luce-y', (-Math.sin(rad)).toFixed(3));
}

/** Fase "write": variabili CSS al massimo a 30 Hz. */
function scriviLuce(_dt: number, now: number): boolean {
  if (!stato.cssInSospeso) return false;
  if (now - stato.cssUltimo < CSS_PASSO_MS) return true;
  stato.cssUltimo = now;
  stato.cssInSospeso = false;
  scriviVariabili();
  return false;
}

/* ------------------------------------------------------------------ avvio */

export interface OpzioniLuce {
  /** L'elemento `.imp-root`. */
  root: HTMLElement;
  /** Dove gira l'arco automatico. Default: l'hero `#inizio` (ux-architect). */
  heroSelector?: string;
}

/**
 * Avvia la luce. La chiama Impronta.tsx in un effetto, dopo il mount delle
 * sezioni. Restituisce la funzione di smontaggio. Sicura con StrictMode
 * (doppio mount): il secondo avvio sostituisce il primo.
 */
export function startLight({ root, heroSelector = '#inizio' }: OpzioniLuce): () => void {
  stato.root = root;
  stato.avviata = true;
  stato.heroVisibile = false;
  stato.ultimoInput = Number.NEGATIVE_INFINITY;
  stato.arcoAttivo = false;
  stato.toccoAttivo = null;
  stato.gyroBase = null;
  stato.dialPrecedenzaFino = 0;

  const L = runtime.light;
  L.azimuth = LUCE_RIPOSO_AZIMUT;
  L.elevation = LUCE_RIPOSO_ELEVAZIONE;
  L.targetAzimuth = LUCE_RIPOSO_AZIMUT;
  L.targetElevation = LUCE_RIPOSO_ELEVAZIONE;
  L.fonte = 'idle';
  aggiornaDial();
  scriviVariabili();
  runtime.markDirty();

  inizializzaGyro();

  let osservatore: IntersectionObserver | null = null;
  const hero = root.querySelector<HTMLElement>(heroSelector);
  if (hero && typeof IntersectionObserver !== 'undefined') {
    osservatore = new IntersectionObserver(
      (voci) => {
        for (const v of voci) stato.heroVisibile = v.isIntersecting;
        ticker.wake();
      },
      { threshold: 0.15 },
    );
    osservatore.observe(hero);
  }

  const togliAggiorna = ticker.add(aggiornaLuce, 'update');
  const togliScrivi = ticker.add(scriviLuce, 'write');

  let staccaPuntatore: (() => void) | null = null;
  let staccaGyro: (() => void) | null = null;

  const configura = (): void => {
    const vuoleInput = !store.get().reducedMotion;
    if (vuoleInput && !staccaPuntatore) staccaPuntatore = attaccaPuntatore(root);
    if (!vuoleInput && staccaPuntatore) {
      staccaPuntatore();
      staccaPuntatore = null;
      stato.toccoAttivo = null;
    }
    const vuoleGyro = vuoleInput && gyroAttivo();
    if (vuoleGyro && !staccaGyro) staccaGyro = attaccaGyro();
    if (!vuoleGyro && staccaGyro) {
      staccaGyro();
      staccaGyro = null;
      stato.gyroBase = null;
    }
    ticker.wake();
  };

  configura();
  const togliStore = store.subscribe(configura);
  const togliGyro = subscribeGyro(configura);

  return () => {
    togliStore();
    togliGyro();
    togliAggiorna();
    togliScrivi();
    osservatore?.disconnect();
    if (staccaPuntatore) staccaPuntatore();
    if (staccaGyro) staccaGyro();
    stato.toccoAttivo = null;
    stato.gyroBase = null;
    stato.heroVisibile = false;
    stato.arcoAttivo = false;
    if (stato.root === root) {
      stato.root = null;
      stato.avviata = false;
    }
  };
}

/** Versione hook di startLight, per Impronta.tsx. */
export function useLuce(rootRef: RefObject<HTMLElement>, heroSelector = '#inizio'): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return startLight({ root, heroSelector });
  }, [rootRef, heroSelector]);
}

/* ------------------------------------------------------------------ dial "Direzione della luce" */

function subscribeDial(fn: () => void): () => void {
  ascoltatoriDial.add(fn);
  return () => {
    ascoltatoriDial.delete(fn);
  };
}

function getDial(): number {
  return stato.dialValore;
}

function getDialServer(): number {
  return LUCE_RIPOSO_AZIMUT;
}

export interface PropsContenitoreDial {
  ref: (el: HTMLElement | null) => void;
}

export interface PropsInputDial {
  type: 'range';
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  'aria-label': string;
  'aria-valuetext': string;
}

export interface LuceDial {
  /** Valore corrente (multiplo di 15). Segue anche puntatore, dito e giroscopio. */
  valore: number;
  /** Sul contenitore con classe `imp-ix-dial`: riceve `--imp-ix-dial-az` per ruotare l'icona. */
  contenitoreProps: PropsContenitoreDial;
  /** Sull'`<input>` con classe `imp-ix-dial__input`. */
  inputProps: PropsInputDial;
}

/**
 * Dial della luce (ux-architect 6.3): `input type=range` 0-345, passo 15,
 * frecce, Pagina su/giù, Home/Fine nativi. Il nome accessibile e il valore a
 * parole vengono da content/testi.ts (LUCE).
 */
export function useLuceDial(etichetta: string = LUCE.aria, descrivi: (gradi: number) => string = descriviLuce): LuceDial {
  const valore = useSyncExternalStore(subscribeDial, getDial, getDialServer);
  const elemento = useRef<HTMLElement | null>(null);

  const ref = useCallback((el: HTMLElement | null) => {
    if (elemento.current) elementiDial.delete(elemento.current);
    elemento.current = el;
    if (el) {
      elementiDial.add(el);
      el.style.setProperty('--imp-ix-dial-az', runtime.light.azimuth.toFixed(1));
    }
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.currentTarget.value);
    if (Number.isFinite(v)) impostaLuceDaDial(v);
  }, []);

  return {
    valore,
    contenitoreProps: { ref },
    inputProps: {
      type: 'range',
      min: DIAL_MIN,
      max: DIAL_MAX,
      step: DIAL_PASSO,
      value: valore,
      onChange,
      'aria-label': etichetta,
      'aria-valuetext': descrivi(valore),
    },
  };
}

/* ------------------------------------------------------------------ magnetismo sobrio */

export interface OpzioniMagnete {
  /** Spostamento massimo in px verso il puntatore. 0 = nessuno spostamento. Default 0. */
  spostamento?: number;
  /** Asse dello spostamento. Default 'x' (la leva scorre in orizzontale). */
  asse?: 'x' | 'y' | 'xy';
  /** Vicinanza 0..1 (1 = puntatore sopra), per approfondire la pressione del pezzo. */
  onVicinanza?: (t: number) => void;
}

/**
 * Il magnete scrive su `el`:
 * - `--imp-mag-x`, `--imp-mag-y` (px): spostamento verso il puntatore,
 *   entro `spostamento`, solo per la maniglia della leva e le costa delle carte;
 * - `--imp-mag-t` (0..1): vicinanza, usata per approfondire il rilievo.
 * Solo con puntatore fine e hover reale. Con reduced motion: niente
 * spostamento, vicinanza di scatto. Nessun effetto sui bottoni di testo.
 */
export function attachMagnete(el: HTMLElement, opzioni: OpzioniMagnete = {}): () => void {
  const massimo = Math.max(0, opzioni.spostamento ?? 0);
  const asse = opzioni.asse ?? 'x';
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  const s = {
    tx: 0,
    ty: 0,
    tt: 0,
    x: 0,
    y: 0,
    t: 0,
    daScrivere: false,
    rect: null as DOMRect | null,
    rectScrollY: 0,
  };

  const misura = (): DOMRect => {
    if (!s.rect || s.rectScrollY !== runtime.scrollY) {
      s.rect = el.getBoundingClientRect();
      s.rectScrollY = runtime.scrollY;
    }
    return s.rect;
  };

  const suMovimento = (e: PointerEvent): void => {
    if (e.pointerType === 'touch' || !fine.matches) return;
    const r = misura();
    if (r.width <= 0 || r.height <= 0) return;
    const nx = limita(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    const ny = limita(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    const m = store.get().reducedMotion ? 0 : massimo;
    s.tx = asse === 'y' ? 0 : nx * m;
    s.ty = asse === 'x' ? 0 : ny * m;
    s.tt = 1;
    ticker.wake();
  };

  const suUscita = (): void => {
    s.tx = 0;
    s.ty = 0;
    s.tt = 0;
    s.rect = null;
    ticker.wake();
  };

  const aggiorna = (dt: number): boolean => {
    const ridotto = store.get().reducedMotion;
    const px = s.x;
    const py = s.y;
    const pt = s.t;
    if (ridotto) {
      s.x = 0;
      s.y = 0;
      s.t = s.tt;
    } else {
      s.x = seguiDt(s.x, s.tx, MAGNETE_INERZIA, dt);
      s.y = seguiDt(s.y, s.ty, MAGNETE_INERZIA, dt);
      s.t = seguiDt(s.t, s.tt, MAGNETE_INERZIA, dt);
      if (Math.abs(s.x - s.tx) < 0.01) s.x = s.tx;
      if (Math.abs(s.y - s.ty) < 0.01) s.y = s.ty;
      if (Math.abs(s.t - s.tt) < 0.002) s.t = s.tt;
    }
    const cambiato = px !== s.x || py !== s.y || pt !== s.t;
    if (cambiato) {
      s.daScrivere = true;
      if (pt !== s.t) opzioni.onVicinanza?.(s.t);
    }
    return s.x !== s.tx || s.y !== s.ty || s.t !== s.tt;
  };

  const scrivi = (): boolean => {
    if (!s.daScrivere) return false;
    s.daScrivere = false;
    el.style.setProperty('--imp-mag-x', `${s.x.toFixed(2)}px`);
    el.style.setProperty('--imp-mag-y', `${s.y.toFixed(2)}px`);
    el.style.setProperty('--imp-mag-t', s.t.toFixed(3));
    return false;
  };

  const passivo: AddEventListenerOptions = { passive: true };
  el.addEventListener('pointerenter', suMovimento, passivo);
  el.addEventListener('pointermove', suMovimento, passivo);
  el.addEventListener('pointerleave', suUscita, passivo);
  el.addEventListener('pointercancel', suUscita, passivo);
  const togliAggiorna = ticker.add(aggiorna, 'update');
  const togliScrivi = ticker.add(scrivi, 'write');

  return () => {
    el.removeEventListener('pointerenter', suMovimento);
    el.removeEventListener('pointermove', suMovimento);
    el.removeEventListener('pointerleave', suUscita);
    el.removeEventListener('pointercancel', suUscita);
    togliAggiorna();
    togliScrivi();
    el.style.removeProperty('--imp-mag-x');
    el.style.removeProperty('--imp-mag-y');
    el.style.removeProperty('--imp-mag-t');
    if (s.t !== 0) opzioni.onVicinanza?.(0);
  };
}

/** Hook di attachMagnete. `onVicinanza` può cambiare a ogni render senza riattaccare. */
export function useMagnete(ref: RefObject<HTMLElement>, opzioni: OpzioniMagnete = {}): void {
  const { spostamento = 0, asse = 'x', onVicinanza } = opzioni;
  const vicinanza = useRef(onVicinanza);
  vicinanza.current = onVicinanza;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    return attachMagnete(el, {
      spostamento,
      asse,
      onVicinanza: (t) => vicinanza.current?.(t),
    });
  }, [ref, spostamento, asse]);
}
