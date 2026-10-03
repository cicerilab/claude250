/**
 * MADRE · la prova del dito: dinamica delle fossette
 * (motion-designer, docs/motion-designer.md §4; contratto tech-architect §7.2).
 *
 * Tre fossette al massimo, in `runtime.impasto.fossette`. Gli input
 * (interaction/provaDito.ts) chiamano `premi` e `rilascia`; il ticker chiama
 * `aggiornaFossette` nella fase 'update'; due disegnatori leggono gli stessi
 * numeri: lo shader (uFossette[i] = vec4(u, v, profondita, segno)) e le
 * fossette CSS del fallback (`resaFossettaCss`). Stesso gesto, stessi tempi.
 *
 * La fisica, in breve (numeri in choreography.ts → FOSSETTA):
 * - premuta: il dito affonda con una molla critica, 95% del fondo in 0,5 s,
 *   mai oltre. Lo spolvero si apre dietro al dito (ritardo di 0,14 s).
 * - un clic è una prova completa: se il dito si alza prima di 0,6 di
 *   profondità, la fossetta finisce di scendere fin lì e poi torna.
 * - rilasciata: la parte elastica torna su piano piano (risposta
 *   sovrasmorzata: si stacca dal dito senza scatto, 90% in circa 2 s, mai un
 *   rimbalzo). Resta la parte plastica, il segno leggerissimo (al massimo il
 *   7% della profondità, meno se il tocco è stato breve), ferma fino a 1,8 s e
 *   cancellata entro 6,2 s. Lo spolvero si richiude per ultimo: metà con la
 *   pasta, metà ferma fino a 2,2 s e chiusa entro 6,8 s.
 * - reduced motion: niente geometria (lo shader legge uRidotto), solo
 *   ombreggiatura a velocità costante: 0,4 s per apparire, 0,6 s per sparire.
 *   Mai più di un ciclo pieno al secondo, quindi nessun lampeggio.
 *
 * Tutto è calcolato sul dt con soluzioni esatte: lo stesso movimento a 30,
 * 60 o 120 Hz. Nessun accesso al browser a livello di modulo.
 */

import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { store } from '../state/store';
import { FOSSETTA, FOSSETTA_FINE_RILASCIO } from './choreography';
import { avvicina, clamp01, passoCritico, smootherstep01, smoothstep01, sovrasmorzata, type PosVel } from './easing';
import { aggiornaRespiro, azzeraRespiro } from './respiro';

/** Una fossetta come la leggono shader e fallback (tech-architect §7.2). */
export interface Fossetta {
  /** Centro sul piano, 0..1 (u verso destra, v verso l'alto, come le uv di three). */
  u: number;
  v: number;
  /** 0..1: profondità visibile (con reduced motion: intensità dell'ombreggiatura). */
  profondita: number;
  /** true tra la pressione e il rilascio effettivo (anche durante la discesa minima di un clic). */
  premuta: boolean;
  /** 0..1: quanto è aperto lo spolvero (impasto nudo, tono più caldo). Si richiude per ultimo. */
  segno: number;
  /** Secondi dall'ultimo evento (pressione o rilascio effettivo). */
  eta: number;
}

/** Valori di una fossetta a riposo: lo scaffold li usa in runtime.ts (vedi doc §9.2). */
export const FOSSETTA_A_RIPOSO: Readonly<Fossetta> = {
  u: 0.5,
  v: 0.5,
  profondita: 0,
  premuta: false,
  segno: 0,
  eta: 0,
};

type Fase = 'riposo' | 'premuta' | 'rilascio';

/** Stato interno, parallelo alle tre fossette pubbliche. */
interface Interno {
  fase: Fase;
  /** Modo in cui la fossetta sta andando (cambia se l'utente cambia la preferenza a metà). */
  ridotto: boolean;
  /** Velocità della discesa (1/s), per la molla critica. */
  vel: number;
  /** Secondi passati premuta (plasticità del segno). */
  tenuta: number;
  /** rilascia() è arrivato prima della profondità minima. */
  rilascioChiesto: boolean;
  /** Profondità, segno plastico e spolvero al rilascio effettivo. */
  pRil: number;
  rRil: number;
  sRil: number;
  /** Ordine di pressione (per scegliere la più vecchia). */
  ordine: number;
  /** Ultimi valori scritti: se non coincidono, qualcuno ha azzerato il runtime (mount). */
  scrittaP: number;
  scrittaS: number;
  scrittaPremuta: boolean;
}

function nuovoInterno(): Interno {
  return {
    fase: 'riposo',
    ridotto: false,
    vel: 0,
    tenuta: 0,
    rilascioChiesto: false,
    pRil: 0,
    rRil: 0,
    sRil: 0,
    ordine: 0,
    scrittaP: 0,
    scrittaS: 0,
    scrittaPremuta: false,
  };
}

const interni: readonly Interno[] = [nuovoInterno(), nuovoInterno(), nuovoInterno()];
const passo: PosVel = { x: 0, v: 0 };
let contatore = 0;

/** Superficie di riferimento per la distanza tra due prove quando la finestra non è ancora misurata. */
const SUPERFICIE_DI_RIPIEGO = { w: 1280, h: 800 } as const;

function fossette(): readonly Fossetta[] {
  return runtime.impasto.fossette;
}

function ricorda(s: Interno, f: Fossetta): void {
  s.scrittaP = f.profondita;
  s.scrittaS = f.segno;
  s.scrittaPremuta = f.premuta;
}

function aRiposo(f: Fossetta, s: Interno): void {
  f.profondita = 0;
  f.segno = 0;
  f.premuta = false;
  s.fase = 'riposo';
  s.vel = 0;
  s.rilascioChiesto = false;
  ricorda(s, f);
}

/**
 * Sceglie dove mettere una prova nuova:
 * 1. una fossetta che sta tornando su a meno di 40 px dal punto: la si
 *    riprende da dov'è (premere due volte nello stesso punto approfondisce la
 *    stessa fossetta, anche da tastiera, senza salti);
 * 2. una fossetta a riposo;
 * 3. la meno visibile tra quelle che tornano (è anche la più vecchia);
 * 4. tre dita già giù: la quarta pressione non fa niente (null).
 */
function scegli(u: number, v: number): { indice: number; riprendi: boolean } | null {
  const fs = fossette();
  const w = runtime.viewport.w > 0 ? runtime.viewport.w : SUPERFICIE_DI_RIPIEGO.w;
  const h = runtime.viewport.h > 0 ? runtime.viewport.h : SUPERFICIE_DI_RIPIEGO.h;

  let vicina = -1;
  let distanzaVicina = Number.POSITIVE_INFINITY;
  for (let i = 0; i < interni.length; i += 1) {
    const s = interni[i];
    const f = fs[i];
    if (s === undefined || f === undefined || s.fase !== 'rilascio') continue;
    const d = Math.hypot((u - f.u) * w, (v - f.v) * h);
    if (d < FOSSETTA.stessoPuntoPx && d < distanzaVicina) {
      vicina = i;
      distanzaVicina = d;
    }
  }
  if (vicina >= 0) return { indice: vicina, riprendi: true };

  for (let i = 0; i < interni.length; i += 1) {
    if (interni[i]?.fase === 'riposo' && fs[i] !== undefined) return { indice: i, riprendi: false };
  }

  let meno = -1;
  let visibilita = Number.POSITIVE_INFINITY;
  let ordine = Number.POSITIVE_INFINITY;
  for (let i = 0; i < interni.length; i += 1) {
    const s = interni[i];
    const f = fs[i];
    if (s === undefined || f === undefined || s.fase !== 'rilascio') continue;
    const quanto = f.profondita + f.segno;
    if (quanto < visibilita - 1e-6 || (Math.abs(quanto - visibilita) <= 1e-6 && s.ordine < ordine)) {
      meno = i;
      visibilita = quanto;
      ordine = s.ordine;
    }
  }
  if (meno >= 0) return { indice: meno, riprendi: false };
  return null;
}

function prossimoIndice(): 0 | 1 | 2 {
  for (let i = 0; i < interni.length; i += 1) {
    if (interni[i]?.fase === 'riposo') return i as 0 | 1 | 2;
  }
  let meno = 0;
  let ordine = Number.POSITIVE_INFINITY;
  for (let i = 0; i < interni.length; i += 1) {
    const s = interni[i];
    if (s !== undefined && s.fase === 'rilascio' && s.ordine < ordine) {
      meno = i;
      ordine = s.ordine;
    }
  }
  return meno as 0 | 1 | 2;
}

function plasticita(tenuta: number): number {
  const base = FOSSETTA.plasticitaBase;
  return base + (1 - base) * (1 - Math.exp(-tenuta / FOSSETTA.plasticitaTau));
}

function avviaRilascio(f: Fossetta, s: Interno): void {
  s.fase = 'rilascio';
  s.rilascioChiesto = false;
  s.vel = 0;
  s.pRil = f.profondita;
  s.sRil = f.segno;
  s.rRil = s.ridotto ? 0 : FOSSETTA.residuo * plasticita(s.tenuta) * f.profondita;
  f.premuta = false;
  f.eta = 0;
}

/**
 * Una prova comincia nel punto `uv` (0..1 sul piano). Restituisce l'indice
 * della fossetta usata, da ripassare a `rilascia`; -1 se tre dita sono già
 * sull'impasto (la quarta non lascia segno). Sveglia il ticker e il respiro.
 */
export function premi(uv: { u: number; v: number }): number {
  const u = clamp01(uv.u);
  const v = clamp01(uv.v);
  const scelta = scegli(u, v);
  if (scelta === null) return -1;

  const { indice, riprendi } = scelta;
  const f = fossette()[indice];
  const s = interni[indice];
  if (f === undefined || s === undefined) return -1;

  if (!riprendi) {
    f.u = u;
    f.v = v;
    f.profondita = 0;
    f.segno = 0;
  }
  f.premuta = true;
  f.eta = 0;
  s.fase = 'premuta';
  s.ridotto = store.get().reducedMotion;
  s.vel = 0;
  s.tenuta = 0;
  s.rilascioChiesto = false;
  contatore += 1;
  s.ordine = contatore;
  ricorda(s, f);

  runtime.impasto.prossima = prossimoIndice();
  runtime.impasto.ultimoInput = performance.now();
  runtime.markDirty();
  ticker.wake();
  return indice;
}

/**
 * Il dito si alza (pointerup, pointercancel, keyup). Se la fossetta non ha
 * ancora raggiunto la profondità minima, il rilascio parte appena ci arriva.
 * Indici fuori da 0..2 (anche il -1 di `premi`) non fanno niente.
 */
export function rilascia(indice: number): void {
  if (!Number.isInteger(indice)) return;
  const f = fossette()[indice];
  const s = interni[indice];
  if (f === undefined || s === undefined || s.fase !== 'premuta') return;
  if (f.profondita < FOSSETTA.profonditaMinimaRilascio) {
    s.rilascioChiesto = true;
  } else {
    avviaRilascio(f, s);
    ricorda(s, f);
  }
  runtime.impasto.ultimoInput = performance.now();
  ticker.wake();
}

/** Valori del rilascio a `t` secondi (modo pieno). Funzione pura, esportata per i test. */
export function rilascioA(
  t: number,
  pRil: number,
  rRil: number,
  sRil: number,
): { profondita: number; segno: number } {
  if (t >= FOSSETTA_FINE_RILASCIO) return { profondita: 0, segno: 0 };
  const elastica = (pRil - rRil) * sovrasmorzata(t, FOSSETTA.tau1, FOSSETTA.tau2);
  const plastica = rRil * (1 - smootherstep01((t - FOSSETTA.segnoTenuta) / FOSSETTA.segnoSvanisce));
  const parziale = FOSSETTA.spolveroParziale;
  const chiusura =
    parziale * Math.exp(-t / FOSSETTA.spolveroTau) +
    (1 - parziale) * (1 - smootherstep01((t - FOSSETTA.spolveroTenuta) / FOSSETTA.spolveroSvanisce));
  return { profondita: Math.max(0, elastica + plastica), segno: Math.max(0, sRil * chiusura) };
}

function verso(x: number, bersaglio: number, massimo: number): number {
  if (x < bersaglio) return Math.min(bersaglio, x + massimo);
  if (x > bersaglio) return Math.max(bersaglio, x - massimo);
  return x;
}

function cambiaModo(f: Fossetta, s: Interno, ridotto: boolean): void {
  s.ridotto = ridotto;
  s.vel = 0;
  if (s.fase === 'rilascio') {
    // Riparte da dov'è, senza salti: nel modo pieno senza segno plastico.
    s.pRil = f.profondita;
    s.sRil = f.segno;
    s.rRil = 0;
    f.eta = 0;
  }
}

/**
 * Funzione di update per il ticker: avanza le tre fossette di `dt` secondi.
 * Restituisce true finché almeno una si muove. Chiama runtime.markDirty() a
 * ogni cambio visibile. Se il runtime è stato azzerato da fuori (mount di
 * Madre.tsx), le fossette interessate tornano a riposo senza scrivere nulla.
 */
export function aggiornaFossette(dt: number, ridotto: boolean): boolean {
  const fs = fossette();
  let ancora = false;

  for (let i = 0; i < interni.length; i += 1) {
    const s = interni[i];
    const f = fs[i];
    if (s === undefined || f === undefined || s.fase === 'riposo') continue;

    if (f.profondita !== s.scrittaP || f.segno !== s.scrittaS || f.premuta !== s.scrittaPremuta) {
      s.fase = 'riposo';
      s.vel = 0;
      s.rilascioChiesto = false;
      continue;
    }
    if (s.ridotto !== ridotto) cambiaModo(f, s, ridotto);

    f.eta += dt;
    let p = f.profondita;
    let seg = f.segno;

    if (s.fase === 'premuta') {
      s.tenuta += dt;
      if (ridotto) {
        const rata = dt / FOSSETTA.ridottoEntrata;
        p = Math.min(1, p + rata);
        seg = verso(seg, p, rata);
      } else {
        passoCritico(p, s.vel, 1, FOSSETTA.omegaAffonda, dt, passo);
        p = Math.min(1, Math.max(0, passo.x));
        s.vel = p >= 1 ? 0 : passo.v;
        seg = Math.min(p, avvicina(seg, p, dt, FOSSETTA.aperturaTau));
      }
      f.profondita = p;
      f.segno = seg;
      if (s.rilascioChiesto && p >= FOSSETTA.profonditaMinimaRilascio) avviaRilascio(f, s);
      ancora = true;
    } else {
      if (ridotto) {
        const rata = dt / FOSSETTA.ridottoUscita;
        p = Math.max(0, p - rata);
        seg = verso(seg, p, rata);
      } else {
        const valori = rilascioA(f.eta, s.pRil, s.rRil, s.sRil);
        p = valori.profondita;
        seg = valori.segno;
      }
      const finita = ridotto ? p <= 0 && seg <= 0 : f.eta >= FOSSETTA_FINE_RILASCIO;
      if (finita || (p < FOSSETTA.epsilon && seg < FOSSETTA.epsilon && f.eta > FOSSETTA.spolveroTenuta)) {
        aRiposo(f, s);
        runtime.markDirty();
        continue;
      }
      f.profondita = p;
      f.segno = seg;
      ancora = true;
    }

    if (Math.abs(f.profondita - s.scrittaP) > 1e-6 || Math.abs(f.segno - s.scrittaS) > 1e-6 || f.premuta !== s.scrittaPremuta) {
      runtime.markDirty();
    }
    ricorda(s, f);
  }

  return ancora;
}

/** Riporta tutte le fossette a riposo (smontaggio dell'impasto, "Ricomincia da capo"). */
export function azzeraFossette(): void {
  const fs = fossette();
  for (let i = 0; i < interni.length; i += 1) {
    const s = interni[i];
    const f = fs[i];
    if (s === undefined) continue;
    if (f === undefined) {
      s.fase = 'riposo';
      continue;
    }
    f.u = FOSSETTA_A_RIPOSO.u;
    f.v = FOSSETTA_A_RIPOSO.v;
    f.eta = 0;
    aRiposo(f, s);
  }
  runtime.impasto.prossima = 0;
  runtime.markDirty();
}

/** Quante fossette non sono a riposo (diagnostica, test, `aria-busy` se servisse). */
export function fossetteAttive(): number {
  let n = 0;
  for (const s of interni) if (s.fase !== 'riposo') n += 1;
  return n;
}

/** Come disegnare una fossetta CSS del fallback (FossetteCss.tsx), dagli stessi numeri del GL. */
export interface ResaFossettaCss {
  /** Diametro relativo dell'elemento (1 = diametro pieno del polpastrello). */
  scala: number;
  /** Opacità dello strato d'ombra interna e luce sul bordo. */
  ombra: number;
  /** Opacità dello strato di impasto nudo (spolvero aperto). */
  nudo: number;
}

/**
 * Traduzione per il fallback: la fossetta si allarga mentre affonda (dal 62%
 * al 100% del diametro), l'ombra segue la profondità, l'impasto nudo segue lo
 * spolvero. Con reduced motion il diametro resta fermo: cambia solo l'ombra.
 */
export function resaFossettaCss(f: Fossetta, ridotto: boolean, out?: ResaFossettaCss): ResaFossettaCss {
  const r = out ?? { scala: 1, ombra: 0, nudo: 0 };
  const p = clamp01(f.profondita);
  r.scala = ridotto ? 1 : 0.62 + 0.38 * smoothstep01(p);
  r.ombra = Math.min(1, p * 1.25);
  r.nudo = clamp01(f.segno) * 0.85;
  return r;
}

/**
 * Registra nel ticker (fase 'update') la dinamica delle fossette e il
 * respiro, leggendo reduced motion dallo store a ogni frame. La chiama
 * sections/Impasto/Impasto.tsx al mount; la funzione restituita toglie tutto
 * e rimette fossette e respiro a riposo.
 */
export function registraImpasto(): () => void {
  const togliFossette = ticker.add((dt) => aggiornaFossette(dt, store.get().reducedMotion), 'update');
  const togliRespiro = ticker.add((dt, now) => aggiornaRespiro(dt, now, store.get().reducedMotion), 'update');
  return () => {
    togliFossette();
    togliRespiro();
    azzeraFossette();
    azzeraRespiro();
  };
}
