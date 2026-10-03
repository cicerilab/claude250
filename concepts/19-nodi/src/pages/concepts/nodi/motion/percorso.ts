/**
 * NODI · il percorso: scroll → frequenza → riquadro della tavola.
 *
 * Una sola verità (tech-architect §0.5): la posizione di scroll. Lo scaffold
 * la trasforma in un `percorso` continuo p = i + t, dove i è l'indice della
 * stazione che contiene la linea di lettura (0 inizio, 1 legni, 2 costruire,
 * 3 voce, 4 riparazioni, 5 bottega) e t in [0, 1) la frazione dentro di essa.
 * Ogni stazione è la sezione **più lo spazio di salita che la segue**
 * (`nod-salita` dell'ux-architect): la prima parte è il pianerottolo (la
 * frequenza sta ferma, si legge con la figura nitida), la parte finale è la
 * salita (la frequenza sale in scala logaritmica verso il pianerottolo
 * successivo, senza testo).
 *
 * Le tre funzioni chieste dal tech-architect (§6.3) sono pure, monotone e
 * coprono tutto 60-420 Hz con un solo punto di scroll per valore:
 *
 *   hzDaPercorso(p, hzModo5)    → Hz oppure null (altoparlante spento)
 *   percorsoDaHz(hz, hzModo5)   → p (inversa)
 *   palcoDaPercorso(p)          → 1 … 0,63 (riquadro mobile 54svh → 34svh)
 *
 * Il terzo argomento facoltativo è il `Profilo`: le proporzioni reali di
 * pianerottoli e salite, che lo scaffold ricava dalle misure delle stazioni
 * con `profiloDaMisure` (ux-architect §2.5 e §3.2). Senza, vale il profilo
 * nominale dell'ux a 1440 × 900. Modulo puro: niente window/document.
 */

import { clamp, clamp01, lerp, lerpLog, progressoLog, progressoTra, riquadro } from './easing';

/* ------------------------------------------------------------------ */
/* Costanti condivise con risonanza/modi.ts (stessi numeri del CD)     */
/* ------------------------------------------------------------------ */

export const HZ_MIN = 60;
export const HZ_MAX = 420;
export const HZ_MODO_1 = 92;
export const HZ_MODO_2 = 168;
/** Frequenza del modo 5 se nessuna voce è stata scelta. */
export const HZ_MODO_5_BASE = 348;

export type IndiceStazione = 0 | 1 | 2 | 3 | 4 | 5;
export const STAZIONI = ['inizio', 'legni', 'costruire', 'voce', 'riparazioni', 'bottega'] as const;
export type IdStazione = (typeof STAZIONI)[number];
export const N_STAZIONI = STAZIONI.length;

/** Riquadro mobile: 54svh → 34svh (tech-architect §5.3). */
export const PALCO_PIENO = 1;
export const PALCO_RIDOTTO = 34 / 54;
/** Con reduced motion il riquadro resta fisso a 44svh (ux §7.10). */
export const PALCO_REDUCED_MOTION = 44 / 54;

/**
 * Sui pianerottoli l'inversa restituisce l'inizio del pianerottolo più
 * questo margine (frazione di stazione), così la linea di lettura è già
 * dentro la sezione e l'h2 in vista (tech §6.3, ux §3.2).
 */
export const MARGINE_PIANEROTTOLO = 0.02;

/** Entro questa distanza (Hz) un valore è "il pianerottolo". */
export const TOLLERANZA_PIANEROTTOLO = 0.5;

/* ------------------------------------------------------------------ */
/* Profilo delle stazioni                                              */
/* ------------------------------------------------------------------ */

/**
 * Cosa fa il riquadro mobile in una stazione:
 * - `apertura`: parte dall'altezza calcolata dell'apertura e cresce a 54svh
 *   durante la salita 1;
 * - `pianerottolo`: 54svh all'ingresso, scende a 34svh dopo un tratto di
 *   lettura, risale prima della salita;
 * - `lungo`: 34svh per tutta la stazione (voce, bottega), con una rampa
 *   breve all'ingresso;
 * - `coda`: come un pianerottolo ma senza risalita (riparazioni: dopo viene
 *   la bottega, che è "lunga").
 */
export type TipoStazione = 'apertura' | 'pianerottolo' | 'lungo' | 'coda';

export interface TrattoStazione {
  readonly tipo: TipoStazione;
  /** Frazione finale della stazione occupata dalla salita (0 = nessuna). */
  readonly salita: number;
  /** Frazioni [da, a] della stazione in cui il riquadro scende a 0,63; null = non scende. */
  readonly giu: readonly [number, number] | null;
  /** Frazioni [da, a] in cui risale a 1; null = non risale. */
  readonly su: readonly [number, number] | null;
}

export type Profilo = readonly [
  TrattoStazione,
  TrattoStazione,
  TrattoStazione,
  TrattoStazione,
  TrattoStazione,
  TrattoStazione,
];

/** Misure delle stazioni in una stessa unità (svh o px): sezione e salita che la segue. */
export interface MisureStazioni {
  /** Altezza delle sei sezioni (inizio, legni, costruire, voce, riparazioni, bottega). */
  readonly sezioni: readonly [number, number, number, number, number, number];
  /** Altezza delle quattro salite (dopo inizio, legni, costruire, voce). */
  readonly salite: readonly [number, number, number, number];
  /** Altezza della finestra nella stessa unità (100 se svh). */
  readonly finestra: number;
}

/** Regole del riquadro mobile in svh (ux §2.5): lettura a 54, discesa, risalita. */
export const RIQUADRO_SVH = {
  /** Tratto letto a 54svh prima che il riquadro cominci a scendere. */
  lettura: 40,
  /** Lunghezza della discesa 54 → 34. */
  discesa: 30,
  /** Lunghezza della risalita 34 → 54 prima della salita successiva. */
  risalita: 30,
  /** Rampa all'ingresso di una stazione "lunga". */
  ingressoLungo: 12,
  /** Sotto questa lettura a 34 non vale la pena scendere: il riquadro resta a 54. */
  minimoRidotto: 20,
} as const;

const TIPI: readonly TipoStazione[] = ['apertura', 'pianerottolo', 'pianerottolo', 'lungo', 'coda', 'lungo'];

/**
 * Costruisce il profilo dalle misure reali. Lo scaffold lo chiama quando
 * rimisura le stazioni (`ResizeObserver`, resize, `fonts.ready`) e passa il
 * risultato a `hzDaPercorso`, `percorsoDaHz`, `palcoDaPercorso`.
 */
export function profiloDaMisure(m: MisureStazioni): Profilo {
  const svh = m.finestra / 100;
  const tratti: TrattoStazione[] = [];
  for (let i = 0; i < N_STAZIONI; i++) {
    const sez = Math.max(1, m.sezioni[i] ?? 1);
    const sal = i < 4 ? Math.max(0, m.salite[i] ?? 0) : 0;
    const tot = sez + sal;
    const tipo = TIPI[i] ?? 'pianerottolo';
    const salita = sal / tot;
    let giu: [number, number] | null = null;
    let su: [number, number] | null = null;
    const lettura = RIQUADRO_SVH.lettura * svh;
    const discesa = RIQUADRO_SVH.discesa * svh;
    const risalita = RIQUADRO_SVH.risalita * svh;
    if (tipo === 'pianerottolo') {
      const spazioRidotto = sez - lettura - discesa - risalita;
      if (spazioRidotto >= RIQUADRO_SVH.minimoRidotto * svh) {
        giu = [lettura / tot, (lettura + discesa) / tot];
        su = [(sez - risalita) / tot, sez / tot];
      }
    } else if (tipo === 'coda') {
      const spazioRidotto = sez - lettura - discesa;
      if (spazioRidotto >= RIQUADRO_SVH.minimoRidotto * svh) {
        giu = [lettura / tot, (lettura + discesa) / tot];
      }
    } else if (tipo === 'lungo') {
      const rampa = Math.min(RIQUADRO_SVH.ingressoLungo * svh, sez * 0.5);
      giu = [0, rampa / tot];
    }
    tratti.push({ tipo, salita, giu, su });
  }
  return tratti as unknown as Profilo;
}

/** Misure nominali dell'ux-architect (§3.2) a 1440 × 900, in svh. */
export const MISURE_UX_LARGO: MisureStazioni = {
  sezioni: [100, 150, 150, 150, 100, 80],
  salite: [70, 60, 60, 24],
  finestra: 100,
};

/** Misure nominali dell'ux-architect (§3.2) a 375 × 667, in svh. */
export const MISURE_UX_STRETTO: MisureStazioni = {
  sezioni: [100, 170, 170, 200, 140, 100],
  salite: [60, 50, 50, 20],
  finestra: 100,
};

export const PROFILO_LARGO: Profilo = profiloDaMisure(MISURE_UX_LARGO);
export const PROFILO_STRETTO: Profilo = profiloDaMisure(MISURE_UX_STRETTO);
/** Profilo usato quando nessuno ne passa uno. */
export const PROFILO_DEFAULT: Profilo = PROFILO_LARGO;

/* ------------------------------------------------------------------ */
/* Lettura del percorso                                                */
/* ------------------------------------------------------------------ */

export interface Tratto {
  readonly stazione: IndiceStazione;
  readonly id: IdStazione;
  /** Frazione dentro la stazione, 0..1. */
  readonly t: number;
  readonly fase: 'pianerottolo' | 'salita';
  /** Avanzamento dentro la fase, 0..1. */
  readonly u: number;
}

const P_MAX = N_STAZIONI - 1e-6;

function indice(p: number): IndiceStazione {
  return Math.floor(clamp(p, 0, P_MAX)) as IndiceStazione;
}

/** Dove siamo: stazione, frazione, e se è pianerottolo o salita. */
export function trattoDaPercorso(p: number, profilo: Profilo = PROFILO_DEFAULT): Tratto {
  const i = indice(p);
  const t = clamp01(clamp(p, 0, P_MAX) - i);
  const tr = profilo[i];
  const inizioSalita = 1 - tr.salita;
  if (tr.salita > 0 && t >= inizioSalita) {
    return { stazione: i, id: STAZIONI[i], t, fase: 'salita', u: clamp01((t - inizioSalita) / tr.salita) };
  }
  return { stazione: i, id: STAZIONI[i], t, fase: 'pianerottolo', u: inizioSalita > 0 ? clamp01(t / inizioSalita) : 0 };
}

/** Estremi in Hz della salita k (0..3) che segue la stazione k. */
export function estremiSalita(k: 0 | 1 | 2 | 3, hzModo5 = HZ_MODO_5_BASE): readonly [number, number] {
  const hz5 = clampHz5(hzModo5);
  switch (k) {
    case 0:
      return [HZ_MIN, HZ_MODO_1];
    case 1:
      return [HZ_MODO_1, HZ_MODO_2];
    case 2:
      return [HZ_MODO_2, hz5];
    default:
      return [hz5, HZ_MAX];
  }
}

/** Frequenza del pianerottolo della stazione i, null se l'altoparlante è spento. */
export function hzPianerottolo(i: IndiceStazione, hzModo5 = HZ_MODO_5_BASE): number | null {
  switch (i) {
    case 1:
      return HZ_MODO_1;
    case 2:
      return HZ_MODO_2;
    case 3:
      return clampHz5(hzModo5);
    default:
      return null;
  }
}

function clampHz5(hz5: number): number {
  // Il modo 5 della voce sta tra 330 e 366 (risonanza/modi.ts, VOCE_HZ);
  // qui basta tenerlo strettamente tra i vicini per restare monotoni.
  return Number.isFinite(hz5) ? clamp(hz5, HZ_MODO_2 + 1, HZ_MAX - 1) : HZ_MODO_5_BASE;
}

/**
 * Scroll → frequenza. `null` = altoparlante spento (a riposo, coda).
 * La salita 4 (voce → 420) occupa la prima metà del tratto tra voce e
 * riparazioni; nella seconda metà l'altoparlante è già spento (tech §6.3).
 */
export function hzDaPercorso(p: number, hzModo5 = HZ_MODO_5_BASE, profilo: Profilo = PROFILO_DEFAULT): number | null {
  const tr = trattoDaPercorso(p, profilo);
  if (tr.fase === 'pianerottolo') return hzPianerottolo(tr.stazione, hzModo5);
  const k = tr.stazione;
  if (k > 3) return null;
  const [a, b] = estremiSalita(k as 0 | 1 | 2 | 3, hzModo5);
  if (k === 3) {
    if (tr.u >= 0.5) return null;
    return lerpLog(a, b, tr.u * 2);
  }
  return lerpLog(a, b, tr.u);
}

/** Percorso del riposo (pagina in cima). */
export const PERCORSO_RIPOSO = 0;

/**
 * Frequenza → scroll (inversa). Sui pianerottoli (entro 0,5 Hz) restituisce
 * l'inizio del pianerottolo più un margine; sotto 60 dà l'inizio della
 * salita 1 (cioè 60 Hz); sopra 420 la fine della salita 4.
 */
export function percorsoDaHz(hz: number, hzModo5 = HZ_MODO_5_BASE, profilo: Profilo = PROFILO_DEFAULT): number {
  if (!Number.isFinite(hz)) return PERCORSO_RIPOSO;
  const pianerottoli: ReadonlyArray<readonly [IndiceStazione, number]> = [
    [1, HZ_MODO_1],
    [2, HZ_MODO_2],
    [3, clampHz5(hzModo5)],
  ];
  for (const [i, f] of pianerottoli) {
    if (Math.abs(hz - f) <= TOLLERANZA_PIANEROTTOLO) return i + MARGINE_PIANEROTTOLO;
  }
  const inizioSalita = (k: number): number => k + (1 - profilo[k as IndiceStazione].salita);
  const lunghezzaSalita = (k: number): number => profilo[k as IndiceStazione].salita;
  if (hz <= HZ_MIN) return inizioSalita(0);
  if (hz >= HZ_MAX) return inizioSalita(3) + lunghezzaSalita(3) * 0.5;
  for (let k = 0; k < 4; k++) {
    const [a, b] = estremiSalita(k as 0 | 1 | 2 | 3, hzModo5);
    if (hz > a && hz < b) {
      const u = progressoLog(a, b, hz);
      const quota = k === 3 ? 0.5 : 1;
      return inizioSalita(k) + lunghezzaSalita(k) * quota * u;
    }
  }
  // Solo se hz cade esattamente su un estremo non coperto sopra (60 o 420
  // già gestiti): si va all'inizio del pianerottolo più vicino.
  return hz < HZ_MODO_2 ? 1 + MARGINE_PIANEROTTOLO : 3 + MARGINE_PIANEROTTOLO;
}

/**
 * Riquadro della tavola su layout stretto: 1 = 54svh, 0,63 = 34svh.
 * `palcoApertura` è il rapporto (altezza calcolata dell'apertura / 54svh),
 * tra 38/54 e 1, che il builder dell'apertura misura al mount (ux §5.1);
 * durante la salita 1 il riquadro cresce da lì a 1. Sul layout largo lo
 * scaffold non chiama questa funzione: `runtime.palco` resta 1.
 */
export function palcoDaPercorso(p: number, profilo: Profilo = PROFILO_DEFAULT, palcoApertura = PALCO_PIENO): number {
  const tr = trattoDaPercorso(p, profilo);
  const conf = profilo[tr.stazione];
  if (conf.tipo === 'apertura') {
    const base = clamp(palcoApertura, PALCO_RIDOTTO, PALCO_PIENO);
    if (tr.fase === 'pianerottolo') return base;
    return lerp(base, PALCO_PIENO, riquadro(tr.u));
  }
  let v = PALCO_PIENO;
  if (conf.giu) {
    v = lerp(PALCO_PIENO, PALCO_RIDOTTO, riquadro(progressoTra(conf.giu[0], conf.giu[1], tr.t)));
  }
  if (conf.su && tr.t >= conf.su[0]) {
    v = lerp(PALCO_RIDOTTO, PALCO_PIENO, riquadro(progressoTra(conf.su[0], conf.su[1], tr.t)));
  }
  if (tr.fase === 'salita') return PALCO_PIENO;
  return v;
}

/**
 * Posizione sul righello (0 = 60 Hz, 1 = 420 Hz, scala logaritmica) di una
 * frequenza; `null` (spento) sta sotto lo zero, a U_SPENTO. Serve a cursore,
 * tacche e scala, così tutti usano la stessa formula.
 */
export const U_SPENTO = -0.055;

export function uDaHz(hz: number | null): number {
  if (hz === null || !(hz > 0)) return U_SPENTO;
  return progressoLog(HZ_MIN, HZ_MAX, clamp(hz, HZ_MIN, HZ_MAX));
}

export function hzDaU(u: number): number | null {
  if (u <= U_SPENTO / 2) return null;
  return lerpLog(HZ_MIN, HZ_MAX, clamp01(u));
}
