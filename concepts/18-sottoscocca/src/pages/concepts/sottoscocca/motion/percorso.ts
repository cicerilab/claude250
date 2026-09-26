/**
 * SOTTOSCOCCA · dallo scroll al ponte (motion-designer).
 *
 * Funzioni pure che traducono la posizione di scroll in:
 * - quota del ponte in cm (0..180), con plateau a 20, 80 e 180;
 * - binario della camera (0..3 continuo tra le 4 chiavi);
 * - discesa (0..1): la camera che si allontana sopra il planning;
 * - opacità della scena (1 → 0,2 nel planning → 0 in officina).
 *
 * Come funziona. Le sezioni-stazione (tech-architect §6.3) vengono misurate
 * dallo scaffold solo quando cambiano (resize, font, ResizeObserver). Con
 * quelle misure `profiloDaGeometria` calcola UNA volta le soglie di scroll
 * in px documento (regola dei plateau dell'ux-architect, §3: il testo di una
 * quota si legge sempre con l'auto ferma; la salita avviene quando in vista
 * c'è solo scena). Poi a ogni frame `statoDaScroll` valuta il profilo: poche
 * comparazioni, nessuna lettura di layout, nessuna allocazione.
 *
 * Le soglie sono in px di scroll e non nel "percorso" 0..6, perché le
 * stazioni hanno altezze diverse: una curva stesa su due stazioni in unità di
 * percorso cambierebbe velocità al confine. Il percorso (i + t) resta
 * disponibile per chi lo usa (contratto del tech-architect): le funzioni
 * `...DaPercorso` lo riconvertono in scroll e valutano lo stesso profilo.
 *
 * Modulo puro: nessun accesso a window/document (prerender).
 */

import type { Quota } from '../content/lavori';
import { CURVE, clamp01, lerp, progressoTra, type NomeCurva } from './easing';
import { LINEA_DI_LETTURA, QUOTE_PLATEAU, SOGLIE_PANNELLO, SOGLIE_PERCORSO } from './choreography';

/* ------------------------------------------------------------------ */
/* Stazioni                                                            */
/* ------------------------------------------------------------------ */

/** Le sei sezioni che muovono il ponte, in ordine di pagina (tech-architect §6.3). */
export const STAZIONI = ['inizio', 'gomme', 'freni', 'sottoscocca', 'deposito', 'ponte-libero'] as const;
export type IdStazioneMotion = (typeof STAZIONI)[number];

/** Numero di stazioni: il percorso va da 0 a questo valore. */
export const PERCORSO_MAX = STAZIONI.length;

/** Quota che il ponte tiene nella stazione (a plateau). */
export const QUOTA_STAZIONE: Readonly<Record<IdStazioneMotion, Quota>> = {
  inizio: 0,
  gomme: 20,
  freni: 80,
  sottoscocca: 180,
  deposito: 180,
  'ponte-libero': 0,
};

/**
 * Misure di una stazione in px documento (scrollY + getBoundingClientRect().top).
 * `pannelloTop`/`pannelloAltezza`: il pannello di testo della quota, cioè
 * l'elemento marcato `data-ssc-pannello` dentro la sezione (se manca, si usa
 * la sezione intera). `fissa`: la sezione ha lo stadio sticky ATTIVO in questo
 * momento (sottoscocca senza reduced motion e con altezza sufficiente).
 */
export interface GeometriaStazione {
  readonly top: number;
  readonly altezza: number;
  readonly pannelloTop?: number | null;
  readonly pannelloAltezza?: number | null;
  readonly fissa?: boolean;
}

export type Orientamento = 'landscape' | 'portrait';

/* ------------------------------------------------------------------ */
/* Tracce                                                              */
/* ------------------------------------------------------------------ */

/** Una chiave di una traccia: a scroll `s` (px) il valore è `v`; `curva` porta dalla chiave precedente a questa. */
export interface Chiave {
  readonly s: number;
  readonly v: number;
  readonly curva: NomeCurva;
}

export type Traccia = readonly Chiave[];

/** Valuta una traccia a scroll `s`. Prima della prima chiave e dopo l'ultima il valore è costante. */
export function valutaTraccia(traccia: Traccia, s: number): number {
  const n = traccia.length;
  if (n === 0) return 0;
  const prima = traccia[0] as Chiave;
  if (s <= prima.s) return prima.v;
  for (let i = 1; i < n; i += 1) {
    const b = traccia[i] as Chiave;
    if (s <= b.s) {
      const a = traccia[i - 1] as Chiave;
      if (a.v === b.v) return a.v;
      const t = progressoTra(a.s, b.s, s);
      return lerp(a.v, b.v, CURVE[b.curva](t));
    }
  }
  return (traccia[n - 1] as Chiave).v;
}

/**
 * Come `valutaTraccia` ma a scatti (reduced motion): in ogni tratto che
 * cambia valore si tiene il valore di partenza fino a metà e quello d'arrivo
 * dopo. Nessun valore intermedio.
 */
export function valutaTracciaAScatti(traccia: Traccia, s: number): number {
  const n = traccia.length;
  if (n === 0) return 0;
  const prima = traccia[0] as Chiave;
  if (s <= prima.s) return prima.v;
  for (let i = 1; i < n; i += 1) {
    const b = traccia[i] as Chiave;
    if (s <= b.s) {
      const a = traccia[i - 1] as Chiave;
      return s < (a.s + b.s) / 2 ? a.v : b.v;
    }
  }
  return (traccia[n - 1] as Chiave).v;
}

/* ------------------------------------------------------------------ */
/* Profilo                                                             */
/* ------------------------------------------------------------------ */

export interface ProfiloPonte {
  /** Altezza della finestra con cui è stato calcolato (px CSS). */
  readonly vh: number;
  readonly orient: Orientamento;
  /** Misure usate (copiate), per convertire da/per il percorso. */
  readonly stazioni: readonly GeometriaStazione[];
  /** cm, 0..180. */
  readonly quota: Traccia;
  /** 0..1, camera che si allontana sopra il planning. */
  readonly discesa: Traccia;
  /** 0..1, opacità del canvas. */
  readonly opacita: Traccia;
}

/** Stato del ponte a una posizione di scroll: sono gli OBIETTIVI, prima delle molle. */
export interface StatoPonte {
  /** cm, 0..180. */
  quota: number;
  /** 0..3. */
  binario: number;
  /** 0..1. */
  discesa: number;
  /** 0..1. */
  opacita: number;
  /** Quota del plateau in cui ci si trova, o null durante una salita/discesa. */
  plateau: Quota | null;
}

export function creaStatoPonte(): StatoPonte {
  return { quota: 0, binario: 0, discesa: 0, opacita: 1, plateau: 0 };
}

/**
 * Binario della camera dalla quota: lineare tra le chiavi 0 (0 cm), 1 (20),
 * 2 (80), 3 (180). La camera segue la quota, quindi l'auto resta nella stessa
 * zona dell'inquadratura (trend-researcher P1) e l'easing è uno solo: quello
 * della salita. Chi interpola le chiavi lo fa in modo LINEARE sulla frazione
 * (vedi `segmentoBinario`): a ogni chiave la quota è a plateau, quindi la
 * velocità è già nulla e non si vede nessuno spigolo.
 */
export function binarioDaQuota(cm: number): number {
  const q = cm <= 0 ? 0 : cm >= 180 ? 180 : cm;
  if (q <= 20) return q / 20;
  if (q <= 80) return 1 + (q - 20) / 60;
  return 2 + (q - 80) / 100;
}

/** Scompone il binario in chiave di partenza (0..2) e frazione verso la successiva (0..1). */
export function segmentoBinario(binario: number): { k: 0 | 1 | 2; f: number } {
  const b = binario <= 0 ? 0 : binario >= 3 ? 3 : binario;
  if (b >= 2) return { k: 2, f: b - 2 };
  if (b >= 1) return { k: 1, f: b - 1 };
  return { k: 0, f: b };
}

/**
 * Quanto è "aperto" il cerchio della ruota anteriore (0 = opaco, 1 = al 35%
 * di opacità, CD 4.2 punto 3), in funzione del binario: si apre mentre la
 * camera scende all'altezza del mozzo (binario 1,4 → 1,9), resta aperto
 * intorno agli 80 cm, si richiude mentre la camera va sotto (2,3 → 2,7).
 * Il GL usa `opacita = lerp(1, OPACITA.cerchioAperto, apertura)`; con la
 * scheda dei freni aperta a 180 cm usa `max(apertura, evidenza.disco)`.
 */
export function aperturaCerchio(binario: number): number {
  if (binario <= 1.4 || binario >= 2.7) return 0;
  if (binario < 1.9) return CURVE.colonna(progressoTra(1.4, 1.9, binario));
  if (binario <= 2.3) return 1;
  return 1 - CURVE.colonna(progressoTra(2.3, 2.7, binario));
}

/** Il plateau più vicino a una quota (utile per chi riceve una quota qualunque). */
export function plateauPiuVicino(cm: number): Quota {
  let migliore: Quota = 0;
  let distanza = Number.POSITIVE_INFINITY;
  for (const q of QUOTE_PLATEAU) {
    const d = Math.abs(q - cm);
    if (d < distanza) {
      distanza = d;
      migliore = q;
    }
  }
  return migliore;
}

function pannelloDi(st: GeometriaStazione): { top: number; fondo: number } {
  const top = st.pannelloTop ?? st.top;
  const altezza = st.pannelloAltezza ?? st.altezza;
  return { top, fondo: top + Math.max(0, altezza) };
}

/** Allarga il tratto [da, a] attorno al suo centro fino a `minimo`, se è più corto. */
function almeno(da: number, a: number, minimo: number): [number, number] {
  if (a - da >= minimo) return [da, a];
  const c = (da + a) / 2;
  return [c - minimo / 2, c + minimo / 2];
}

/** Rende una sequenza di soglie non decrescente (una misura strana non deve invertire il tempo). */
function monotona(valori: number[]): number[] {
  const out: number[] = [];
  let ultimo = Number.NEGATIVE_INFINITY;
  for (const v of valori) {
    const x = Math.max(v, ultimo);
    out.push(x);
    ultimo = x;
  }
  return out;
}

function stazioniValide(stazioni: readonly GeometriaStazione[]): boolean {
  if (stazioni.length < PERCORSO_MAX) return false;
  for (let i = 0; i < PERCORSO_MAX; i += 1) {
    const st = stazioni[i];
    if (st === undefined || !(st.altezza > 0) || !Number.isFinite(st.top)) return false;
  }
  return true;
}

/**
 * Calcola il profilo dalle misure. Da chiamare solo quando le misure cambiano
 * (fase `read` con stazioni invalidate), mai a ogni frame.
 *
 * Soglie, in px di scroll (vh = altezza finestra; E/U = soglie di pannello
 * `entra`/`esce` dell'orientamento):
 * - 0 → 20: da scroll 0 a quando il pannello delle gomme arriva a E
 *   (almeno `primaSalitaMinima` finestre);
 * - plateau 20 finché il fondo del pannello delle gomme non sale oltre U;
 * - 20 → 80: fino a quando il pannello dei freni arriva a E;
 * - plateau 80 finché il fondo del pannello dei freni non sale oltre U;
 * - 80 → 180: fino all'aggancio dello stadio sticky del sottoscocca (bordo
 *   alto della sezione a 0), o, senza pin, a quando il suo pannello arriva a E;
 * - plateau 180 per tutto il sottoscocca e il deposito;
 * - 180 → 0 mentre il bordo alto del ponte libero passa da 0,95 a 0,35 della
 *   finestra; in parallelo la camera si allontana e la scena va al 20%;
 * - scena a 0 mentre il bordo basso del ponte libero (l'officina) passa da
 *   0,9 a 0,45.
 * Ogni salita dura almeno `salitaMinima` finestre: se i pannelli sono troppo
 * vicini, la salita si allarga attorno al centro del vuoto tra i due.
 */
export function profiloDaGeometria(
  stazioni: readonly GeometriaStazione[],
  vh: number,
  orient: Orientamento,
): ProfiloPonte {
  const h = vh > 0 ? vh : 1;
  if (!stazioniValide(stazioni)) return profiloBase(h, orient);

  const soglie = SOGLIE_PANNELLO[orient];
  const P = SOGLIE_PERCORSO;
  const st = (i: number): GeometriaStazione => stazioni[i] as GeometriaStazione;

  const gomme = pannelloDi(st(1));
  const freni = pannelloDi(st(2));
  const sotto = st(3);
  const sottoPannello = pannelloDi(sotto);
  const libero = st(5);
  const officinaTop = libero.top + libero.altezza;

  // 0 → 20
  const arrivo20 = Math.max(gomme.top - soglie.entra * h, P.primaSalitaMinima * h);
  // plateau 20, poi 20 → 80
  const [partenza20, arrivo80] = almeno(gomme.fondo - soglie.esce * h, freni.top - soglie.entra * h, P.salitaMinima * h);
  // plateau 80, poi 80 → 180
  const arrivo180Grezzo = sotto.fissa === true ? sotto.top : sottoPannello.top - soglie.entra * h;
  const [partenza80, arrivo180] = almeno(freni.fondo - soglie.esce * h, arrivo180Grezzo, P.salitaMinima * h);
  // plateau 180, poi 180 → 0
  const inizioDiscesa = libero.top - P.discesaQuota.inizio * h;
  const fineDiscesa = libero.top - P.discesaQuota.fine * h;

  const [s20, s20b, s80, s80b, s180, sGiu, sGiuFine] = monotona([
    arrivo20,
    partenza20,
    arrivo80,
    partenza80,
    arrivo180,
    inizioDiscesa,
    fineDiscesa,
  ]) as [number, number, number, number, number, number, number];

  const quota: Traccia = [
    { s: 0, v: 0, curva: 'lineare' },
    { s: s20, v: 20, curva: 'colonna' },
    { s: s20b, v: 20, curva: 'lineare' },
    { s: s80, v: 80, curva: 'colonna' },
    { s: s80b, v: 80, curva: 'lineare' },
    { s: s180, v: 180, curva: 'colonna' },
    { s: sGiu, v: 180, curva: 'lineare' },
    { s: sGiuFine, v: 0, curva: 'sfiato' },
  ];

  const [c0, c1] = monotona([libero.top - P.discesaCamera.inizio * h, libero.top - P.discesaCamera.fine * h]) as [
    number,
    number,
  ];
  const discesa: Traccia = [
    { s: c0, v: 0, curva: 'lineare' },
    { s: c1, v: 1, curva: 'cassetto' },
  ];

  const [o0, o1, o2, o3] = monotona([
    libero.top - P.opacitaPlanning.inizio * h,
    libero.top - P.opacitaPlanning.fine * h,
    officinaTop - P.opacitaOfficina.inizio * h,
    officinaTop - P.opacitaOfficina.fine * h,
  ]) as [number, number, number, number];
  const opacita: Traccia = [
    { s: o0, v: 1, curva: 'lineare' },
    { s: o1, v: P.opacitaPlanning.valore, curva: 'lineare' },
    { s: o2, v: P.opacitaPlanning.valore, curva: 'lineare' },
    { s: o3, v: 0, curva: 'lineare' },
  ];

  return { vh: h, orient, stazioni: stazioni.slice(0, PERCORSO_MAX), quota, discesa, opacita };
}

/**
 * Geometria di riferimento (altezze dell'ux-architect §3, desktop e mobile),
 * usata prima della prima misura e quando le misure non sono valide. Così le
 * funzioni restituiscono sempre valori sensati, anche nel prerender.
 */
export function geometriaBase(vh: number, orient: Orientamento): GeometriaStazione[] {
  const h = vh > 0 ? vh : 1;
  const altezze =
    orient === 'portrait'
      ? { inizio: 1, gomme: 2.1, freni: 2.1, sottoscocca: 2.6, deposito: 1.3, libero: 2 }
      : { inizio: 1, gomme: 1.8, freni: 1.8, sottoscocca: 3.2, deposito: 1.1, libero: 1.3 };
  const pannello = orient === 'portrait' ? { offset: 0.55, altezza: 1 } : { offset: 0.25, altezza: 0.8 };
  const lista: Array<[number, boolean]> = [
    [altezze.inizio, false],
    [altezze.gomme, true],
    [altezze.freni, true],
    [altezze.sottoscocca, false],
    [altezze.deposito, false],
    [altezze.libero, false],
  ];
  const out: GeometriaStazione[] = [];
  let top = 0;
  lista.forEach(([a, conPannello], i) => {
    const altezza = a * h;
    out.push({
      top,
      altezza,
      pannelloTop: conPannello ? top + pannello.offset * h : null,
      pannelloAltezza: conPannello ? pannello.altezza * h : null,
      fissa: i === 3,
    });
    top += altezza;
  });
  return out;
}

export function profiloBase(vh: number, orient: Orientamento): ProfiloPonte {
  return profiloDaGeometria(geometriaBase(vh, orient), vh, orient);
}

/* ------------------------------------------------------------------ */
/* Valutazione a ogni frame                                            */
/* ------------------------------------------------------------------ */

/** Plateau della traccia della quota a scroll `s`, o null se il ponte si sta muovendo. */
function plateauA(traccia: Traccia, s: number): Quota | null {
  const n = traccia.length;
  if (n === 0) return 0;
  const prima = traccia[0] as Chiave;
  if (s <= prima.s) return plateauPiuVicino(prima.v);
  for (let i = 1; i < n; i += 1) {
    const b = traccia[i] as Chiave;
    if (s <= b.s) {
      const a = traccia[i - 1] as Chiave;
      return a.v === b.v ? plateauPiuVicino(a.v) : null;
    }
  }
  return plateauPiuVicino((traccia[n - 1] as Chiave).v);
}

/**
 * Lo stato del ponte a una posizione di scroll, scritto in `out` (nessuna
 * allocazione: chiamata a ogni frame). Con `ridotto` (reduced motion) la
 * quota, la discesa e l'opacità scattano tra i valori di plateau e il
 * plateau non è mai null.
 */
export function statoDaScroll(profilo: ProfiloPonte, scrollY: number, ridotto: boolean, out: StatoPonte): StatoPonte {
  const s = scrollY > 0 ? scrollY : 0;
  if (ridotto) {
    const q = valutaTracciaAScatti(profilo.quota, s);
    out.quota = q;
    out.binario = binarioDaQuota(q);
    out.discesa = valutaTracciaAScatti(profilo.discesa, s);
    out.opacita = valutaTracciaAScatti(profilo.opacita, s);
    out.plateau = plateauPiuVicino(q);
    return out;
  }
  const q = valutaTraccia(profilo.quota, s);
  out.quota = q;
  out.binario = binarioDaQuota(q);
  out.discesa = clamp01(valutaTraccia(profilo.discesa, s));
  out.opacita = clamp01(valutaTraccia(profilo.opacita, s));
  out.plateau = plateauA(profilo.quota, s);
  return out;
}

/* ------------------------------------------------------------------ */
/* Percorso (contratto del tech-architect §6.3)                        */
/* ------------------------------------------------------------------ */

/**
 * Percorso continuo 0..6: `i + t`, con `i` la stazione che contiene la linea
 * di lettura (60% della finestra) e `t` la frazione dentro di essa. Tra due
 * stazioni non contigue vale l'intero successivo; oltre l'ultima vale 6.
 */
export function percorsoDaScroll(scrollY: number, vh: number, stazioni: readonly GeometriaStazione[]): number {
  if (!stazioniValide(stazioni)) return 0;
  const y = Math.max(0, scrollY) + LINEA_DI_LETTURA * vh;
  const prima = stazioni[0] as GeometriaStazione;
  if (y < prima.top) return 0;
  for (let i = PERCORSO_MAX - 1; i >= 0; i -= 1) {
    const st = stazioni[i] as GeometriaStazione;
    if (y >= st.top) {
      const t = clamp01((y - st.top) / st.altezza);
      return Math.min(PERCORSO_MAX, i + t);
    }
  }
  return 0;
}

/** Inverso di `percorsoDaScroll`: lo scroll a cui la linea di lettura sta al percorso `p`. */
export function scrollDaPercorso(p: number, profilo: ProfiloPonte): number {
  const lista = profilo.stazioni;
  if (lista.length < PERCORSO_MAX) return 0;
  const x = p <= 0 ? 0 : p >= PERCORSO_MAX ? PERCORSO_MAX : p;
  const i = Math.min(PERCORSO_MAX - 1, Math.floor(x));
  const st = lista[i] as GeometriaStazione;
  const y = st.top + (x - i) * st.altezza;
  return Math.max(0, y - LINEA_DI_LETTURA * profilo.vh);
}

const statoLavoro = creaStatoPonte();

/** Quota (cm) al percorso `p`. Profilo di default: geometria di riferimento a 900 px. */
export function quotaDaPercorso(p: number, profilo: ProfiloPonte = profiloDefault()): number {
  return statoDaScroll(profilo, scrollDaPercorso(p, profilo), false, statoLavoro).quota;
}

export function binarioDaPercorso(p: number, profilo: ProfiloPonte = profiloDefault()): number {
  return binarioDaQuota(quotaDaPercorso(p, profilo));
}

export function discesaDaPercorso(p: number, profilo: ProfiloPonte = profiloDefault()): number {
  return statoDaScroll(profilo, scrollDaPercorso(p, profilo), false, statoLavoro).discesa;
}

export function opacitaDaPercorso(p: number, profilo: ProfiloPonte = profiloDefault()): number {
  return statoDaScroll(profilo, scrollDaPercorso(p, profilo), false, statoLavoro).opacita;
}

let profiloDefaultMemo: ProfiloPonte | null = null;

function profiloDefault(): ProfiloPonte {
  if (profiloDefaultMemo === null) profiloDefaultMemo = profiloBase(900, 'landscape');
  return profiloDefaultMemo;
}

/**
 * Scroll a cui il ponte è fermo al plateau di una quota, utile a chi deve
 * portare la pagina "a 80 cm" senza passare dalle sezioni (es. fermi
 * immagine). Restituisce il centro del plateau.
 */
export function scrollDelPlateau(profilo: ProfiloPonte, quota: Quota): number {
  const t = profilo.quota;
  for (let i = 1; i < t.length; i += 1) {
    const a = t[i - 1] as Chiave;
    const b = t[i] as Chiave;
    if (a.v === quota && b.v === quota) return (a.s + b.s) / 2;
  }
  return 0;
}
