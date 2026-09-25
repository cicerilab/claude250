/**
 * IMPRONTA · coreografia.
 *
 * Unica fonte di durate, ritardi, soglie e mappature di scroll di tutto il
 * concept. Le sezioni importano da qui, non scrivono numeri propri.
 * Documentazione sezione per sezione: docs/motion-designer.md.
 *
 * Gli unici movimenti del sito (creative director 4.6 + ux-architect 8):
 * pressione dei blocchi, luce, tecniche fissate, propagazione della carta,
 * filo della legatura, leva, segnapagina, indice mobile, lastra del banco
 * con tastiera aperta. Nient'altro si muove.
 *
 * Modulo puro: nessun accesso a window/document, sicuro per il prerender.
 */

import {
  BEZIER_CSS,
  assorbe,
  clamp,
  clamp01,
  leva as curvaLeva,
  lerp,
  lineare,
  pressaCss,
  sfoglia,
  smootherstep,
  smootherstep01,
} from './easing';
import { MOLLE, type ParametriMolla } from './spring';

/* ------------------------------------------------------------------ */
/* Nomi condivisi                                                      */
/* ------------------------------------------------------------------ */

/** Variabili CSS scritte dal motion a runtime (inline sull'elemento indicato). */
export const VAR = {
  /** 0..1 su ogni blocco premuto. Il fallback CSS scala le ombre con questo. */
  press: '--imp-press',
  /**
   * 0..1 transitorio, solo mentre la pressa scende e si riassesta: la carta
   * intorno alle lettere schiacciata dall'urto (picco al contatto, 0 a riposo).
   * Per un alone d'ombra largo e morbido attorno alla parola che si stringe.
   */
  pressUrto: '--imp-press-urto',
  /** Progresso generico di una sezione, se non se ne indica un altro. */
  scrollP: '--imp-scroll-p',
  /** 0..1 lungo il pin delle Tecniche (sul contenitore alto della sezione). */
  tecnicheP: '--imp-tecniche-p',
  /** 0..1 rotazione di tre quarti del taglio colorato. */
  tecnicheGiro: '--imp-tecniche-giro',
  /** 0..1 lunghezza cucita del filo (con le soste già applicate). */
  filoP: '--imp-filo-p',
  /** 0..1 aggancio del filo, su ogni fermata della legatoria. */
  filoAggancio: '--imp-filo-aggancio',
  /** Onda della carta (strato DOM del fallback): centro, raggio, bordo, opacità. */
  ondaX: '--imp-onda-x',
  ondaY: '--imp-onda-y',
  ondaR: '--imp-onda-r',
  ondaBordo: '--imp-onda-bordo',
  ondaO: '--imp-onda-o',
} as const;

export type NomeVar = (typeof VAR)[keyof typeof VAR];

/** Attributi di stato scritti dal motion sugli elementi. */
export const ATTR = {
  /** Sui blocchi premuti: 'attesa' | 'in-corso' | 'premuta'. */
  pressa: 'data-imp-pressa',
  /** Sulle fermate della legatoria: presente quando il filo le ha raggiunte. */
  agganciato: 'data-imp-agganciato',
} as const;

export type StatoPressa = 'attesa' | 'in-corso' | 'premuta';

/**
 * Da spargere nel JSX di ogni blocco premuto, così anche l'HTML
 * prerenderizzato nasce "in attesa" e non c'è un lampo pieno, poi piatto,
 * poi pieno all'idratazione: `<div {...ATTESA_PRESSA} ref={ref}>`.
 */
export const ATTESA_PRESSA: Readonly<Record<'data-imp-pressa', StatoPressa>> = {
  'data-imp-pressa': 'attesa',
};

/** Soglia di larghezza sotto cui valgono le varianti "stretto" (mobile). */
export const LARGHEZZA_STRETTA = 768;
/** Soglia della testata desktop sticky (ux-architect 2.2). */
export const LARGHEZZA_TESTATA = 1024;

export function eStretto(larghezzaViewport: number): boolean {
  return larghezzaViewport > 0 && larghezzaViewport < LARGHEZZA_STRETTA;
}

/* ------------------------------------------------------------------ */
/* Profili di pressione                                                */
/* ------------------------------------------------------------------ */

export interface ProfiloPressione {
  readonly nome: string;
  /** Ritardo dall'innesco alla partenza della discesa (ms). */
  readonly ritardo: number;
  /** Durata della curva `pressa` (ms): discesa + ritorno elastico. */
  readonly durata: number;
  /** Sfasamento tra blocchi fratelli (ms), moltiplicato per l'indice. */
  readonly sfasamento: number;
  /** Pressione a riposo dopo l'ingresso (0..1). */
  readonly riposo: number;
  /** rootMargin dell'IntersectionObserver di ingresso. */
  readonly margine: string;
  /** Attesa massima (ms) del segnale `attendi` (font) prima di premere comunque. */
  readonly attesaMax: number;
  /** Pressione su hover/focus (feedback), o null se il blocco non reagisce. */
  readonly hover: number | null;
}

/*
 * Il motion scrive SOLO `--imp-press` (0..1). La traduzione in assi di
 * Anybody (wdth, wght) la fa il CSS dell'art-director (`.imp-pressa` in
 * relief-fallback.css), che conosce l'arrivo di ogni titolo e lo adatta alla
 * larghezza (a 375 px l'arrivo è più stretto). In JS, se servisse, c'è
 * `assiPressione()` in styles/tokens.ts. Nessun font-variation-settings qui.
 */

/** Il bordo inferiore della viewport arretrato del 30%: "la sezione entra al 30%". */
const ENTRA_AL_30 = '0px 0px -30% 0px';

export const PROFILI = {
  /** Hero: la parola *impronta*. Una volta sola, all'apertura. */
  heroParola: {
    nome: 'hero-parola',
    ritardo: 120,
    durata: 1100,
    sfasamento: 0,
    riposo: 1,
    margine: '0px',
    attesaMax: 450,
    hover: null,
  },
  /** Per chi: i tre pezzi sul bancone, sfasati di 150 ms. */
  perChiPezzo: {
    nome: 'per-chi-pezzo',
    ritardo: 0,
    durata: 820,
    sfasamento: 150,
    riposo: 0.86,
    margine: ENTRA_AL_30,
    attesaMax: 0,
    hover: 1,
  },
  /** Tecniche: la parola campione all'ingresso della sezione. */
  tecnicheParola: {
    nome: 'tecniche-parola',
    ritardo: 60,
    durata: 900,
    sfasamento: 0,
    riposo: 1,
    margine: '0px 0px -35% 0px',
    attesaMax: 0,
    hover: null,
  },
  /** Carta: il nome a secco di ogni striscia, da sinistra a destra. */
  cartaNome: {
    nome: 'carta-nome',
    ritardo: 0,
    durata: 640,
    sfasamento: 90,
    riposo: 0.84,
    margine: ENTRA_AL_30,
    attesaMax: 0,
    hover: 1,
  },
  /** Banco: la prova sulla lastra. Riposo 0,78 perché la leva possa ancora premere. */
  bancoProva: {
    nome: 'banco-prova',
    ritardo: 120,
    durata: 1100,
    sfasamento: 0,
    riposo: 0.78,
    margine: '0px 0px -25% 0px',
    attesaMax: 0,
    hover: null,
  },
  /** Banco: il prezzo in lamina sul margine della prova, dopo la prova. */
  bancoPrezzo: {
    nome: 'banco-prezzo',
    ritardo: 700,
    durata: 700,
    sfasamento: 0,
    riposo: 1,
    margine: '0px 0px -25% 0px',
    attesaMax: 0,
    hover: null,
  },
  /** Bottega: l'indirizzo a secco sotto la stessa riga in inchiostro. */
  bottegaIndirizzo: {
    nome: 'bottega-indirizzo',
    ritardo: 0,
    durata: 900,
    sfasamento: 0,
    riposo: 1,
    margine: '0px 0px -25% 0px',
    attesaMax: 0,
    hover: null,
  },
  /** Colophon: il marchio a secco, se il builder lo usa. Il colpo più leggero. */
  colophonFirma: {
    nome: 'colophon-firma',
    ritardo: 0,
    durata: 600,
    sfasamento: 0,
    riposo: 1,
    margine: '0px 0px -15% 0px',
    attesaMax: 0,
    hover: null,
  },
} as const satisfies Record<string, ProfiloPressione>;

export type NomeProfilo = keyof typeof PROFILI;

/** Ritardo effettivo di un blocco fratello con indice `indice`. */
export function ritardoConSfasamento(profilo: ProfiloPressione, indice: number): number {
  return profilo.ritardo + profilo.sfasamento * Math.max(0, Math.floor(indice));
}


/* ------------------------------------------------------------------ */
/* Gesti di pressione dopo l'ingresso                                  */
/* ------------------------------------------------------------------ */

/** Ristampa: la stessa forma ripassa sotto la pressa con un'altra tecnica. */
export const RISTAMPA = {
  /** Pressione minima raggiunta mentre la platina è su (frazione del riposo). */
  fondo: 0.3,
  /** Durata della risalita con curva `rilascio` (ms). */
  risalita: 170,
  /** Durata della nuova discesa con curva `pressa` (ms). */
  discesa: 520,
} as const;

/** Battuta: una lettera nuova scritta nel banco. */
export const BATTUTA = {
  /** Quanto la battuta aggiunge alla pressione a riposo (o toglie, se il riposo è già 1). */
  ampiezza: 0.08,
  /** Durata dell'affondo (ms), poi la molla `battuta` riporta al riposo. */
  affondo: 80,
  molla: MOLLE.battuta as ParametriMolla,
  /** Sotto questo intervallo tra due tasti (ms) la battuta non riparte da capo. */
  intervalloMinimo: 45,
} as const;

/** Leva del banco: "tieni premuto per stampare". */
export const LEVA = {
  /** Tempo di pressione continua richiesto (ms). Uguale anche con reduced motion. */
  durata: 900,
  /** Durata del contatto finale con ritorno elastico (ms). */
  urto: 320,
  /** Ampiezza del ritorno elastico al contatto (frazione del rilievo). */
  ampiezzaUrto: 0.022,
  /** Risalita dopo un invio fallito (ms, curva `rilascio`). */
  risalitaErrore: 420,
  /** Molla della carta che risale se si lascia prima del tempo. */
  mollaRisalita: MOLLE.risalita as ParametriMolla,
} as const;

/**
 * Pressione della prova mentre si tiene la leva: il progresso 0..1 della
 * leva (lineare nel tempo, da interaction/useHoldToConfirm) passa per la
 * curva `leva` e porta la prova dal suo riposo a 1. Nessun ritorno elastico
 * qui: arriva con `urto()` al completamento.
 */
export function pressioneLeva(progressoLeva: number, riposo: number): number {
  return lerp(riposo, 1, curvaLeva(progressoLeva));
}

/** Hover e fuoco sui blocchi con `profilo.hover`. */
export const HOVER = {
  molla: MOLLE.morbida as ParametriMolla,
} as const;

/** Un campo svuotato nel banco torna al testo d'esempio, più leggero. */
export const ESEMPIO_LEGGERO = 0.4;

/* ------------------------------------------------------------------ */
/* Intervalli di scroll                                                */
/* ------------------------------------------------------------------ */

export type Bordo = 'top' | 'center' | 'bottom';

/**
 * Un intervallo di scroll: il progresso vale 0 quando il bordo `inizio[0]`
 * dell'elemento sta alla frazione `inizio[1]` dell'altezza della viewport
 * (0 = cima, 1 = fondo), e 1 quando il bordo `fine[0]` sta a `fine[1]`.
 */
export interface Intervallo {
  readonly inizio: readonly [Bordo, number];
  readonly fine: readonly [Bordo, number];
}

export const INTERVALLI = {
  /** Contenitore alto con figlio sticky: 0 quando si fissa, 1 quando si stacca. */
  pin: { inizio: ['top', 0], fine: ['bottom', 1] },
  /** Dall'ingresso dal basso all'uscita dall'alto. */
  attraversa: { inizio: ['top', 1], fine: ['bottom', 0] },
} as const satisfies Record<string, Intervallo>;

/** Posizione di scroll (px documento) in cui il bordo dato tocca la frazione di viewport data. */
export function scrollPerBordo(
  bordo: Bordo,
  frazioneViewport: number,
  topDoc: number,
  altezza: number,
  altezzaViewport: number,
): number {
  const y = bordo === 'top' ? topDoc : bordo === 'center' ? topDoc + altezza / 2 : topDoc + altezza;
  return y - frazioneViewport * altezzaViewport;
}

/** Progresso 0..1 di un intervallo per una posizione di scroll. */
export function progressoIntervallo(
  intervallo: Intervallo,
  scrollY: number,
  topDoc: number,
  altezza: number,
  altezzaViewport: number,
): number {
  const s0 = scrollPerBordo(intervallo.inizio[0], intervallo.inizio[1], topDoc, altezza, altezzaViewport);
  const s1 = scrollPerBordo(intervallo.fine[0], intervallo.fine[1], topDoc, altezza, altezzaViewport);
  if (s1 - s0 <= 1e-3) return scrollY >= s0 ? 1 : 0;
  return clamp01((scrollY - s0) / (s1 - s0));
}

/** Posizione di scroll a cui l'intervallo vale `p` (per i salti programmati). */
export function scrollPerProgresso(
  intervallo: Intervallo,
  p: number,
  topDoc: number,
  altezza: number,
  altezzaViewport: number,
): number {
  const s0 = scrollPerBordo(intervallo.inizio[0], intervallo.inizio[1], topDoc, altezza, altezzaViewport);
  const s1 = scrollPerBordo(intervallo.fine[0], intervallo.fine[1], topDoc, altezza, altezzaViewport);
  return lerp(s0, s1, clamp01(p));
}

/**
 * Indice di passo (0..n-1) con isteresi: il cambio avviene solo quando il
 * progresso supera il confine di almeno `isteresi`. Evita lo sfarfallio tra
 * due tecniche quando lo scroll si ferma proprio sul confine.
 */
export function indiceConIsteresi(p: number, n: number, precedente: number, isteresi: number): number {
  const passi = Math.max(1, Math.floor(n));
  const x = clamp01(p);
  const grezzo = Math.min(passi - 1, Math.floor(x * passi));
  if (precedente < 0 || precedente >= passi || grezzo === precedente) return grezzo;
  if (grezzo > precedente) {
    const confine = (precedente + 1) / passi;
    return x >= confine + isteresi ? grezzo : precedente;
  }
  const confine = precedente / passi;
  return x <= confine - isteresi ? grezzo : precedente;
}

/* ------------------------------------------------------------------ */
/* 1 · Hero                                                            */
/* ------------------------------------------------------------------ */

export const HERO = {
  profilo: PROFILI.heroParola,
  /** Istante (ms dal montaggio) in cui la pressa dell'hero è ferma. */
  fine: PROFILI.heroParola.ritardo + PROFILI.heroParola.attesaMax + PROFILI.heroParola.durata,
} as const;

/* ------------------------------------------------------------------ */
/* 2 · Per chi                                                         */
/* ------------------------------------------------------------------ */

export const PER_CHI = {
  profilo: PROFILI.perChiPezzo,
  /** Rotazioni dei tre pezzi (gradi): statiche, mai animate. */
  rotazioni: [-2, 1.5, -0.5],
} as const;

/* ------------------------------------------------------------------ */
/* 3 · Tecniche                                                        */
/* ------------------------------------------------------------------ */

export const TECNICHE = {
  profilo: PROFILI.tecnicheParola,
  intervallo: INTERVALLI.pin,
  /** Altezza del contenitore della sezione in svh (il figlio sticky è 100svh). */
  altezzaSvh: { largo: 400, stretto: 350 },
  /** Quattro tecniche, quattro quarti del pin. */
  passi: 4,
  isteresi: 0.02,
  /** Finestra di progresso in cui il taglio colorato ruota di tre quarti. */
  giro: { da: 0.8, a: 0.96, gradiLargo: 32, gradiStretto: 18 },
  /** Punto di arrivo (progresso del pin) quando si clicca il nome di una tecnica. */
  salti: [0.08, 0.37, 0.62, 0.96],
  ristampa: RISTAMPA,
} as const;

/** 0..1 del giro di tre quarti del taglio colorato, dal progresso del pin. */
export function giroTecniche(p: number): number {
  return smootherstep(TECNICHE.giro.da, TECNICHE.giro.a, p);
}

/** Gradi massimi di rotazione del taglio colorato per la larghezza data. */
export function gradiGiroTecniche(larghezzaViewport: number): number {
  return eStretto(larghezzaViewport) ? TECNICHE.giro.gradiStretto : TECNICHE.giro.gradiLargo;
}

/** Progresso del pin a cui saltare per mostrare la tecnica `indice`. */
export function progressoSaltoTecnica(indice: number): number {
  const i = clamp(Math.floor(indice), 0, TECNICHE.salti.length - 1);
  return TECNICHE.salti[i] ?? 0;
}

/* ------------------------------------------------------------------ */
/* 4 · La carta: onda di cambio carta                                  */
/* ------------------------------------------------------------------ */

export const CARTA = {
  profilo: PROFILI.cartaNome,
  onda: {
    /** Durata della propagazione (ms), curva `assorbe`. */
    durata: 700,
    /** Sfumatura del bordo bagnato (px), cresce con il raggio. */
    bordoDa: 12,
    bordoA: 56,
    /**
     * Frazione della durata a cui si scambia `data-carta` sulla radice e lo
     * strato dell'onda si inverte (vedi docs, "Cambio carta"). A quel punto
     * l'inchiostro cambia colore in `inchiostro` ms.
     */
    scambio: 0.45,
    inchiostro: 240,
    /** Reduced motion: dissolvenza a tutto schermo (ms), lineare. */
    dissolvenza: 200,
  },
} as const;

export interface GeometriaOnda {
  /** Centro dell'onda in px viewport. */
  readonly x: number;
  readonly y: number;
  /** Dimensioni della viewport in px. */
  readonly w: number;
  readonly h: number;
}

export interface StatoOnda {
  /** 0..1 del tempo dell'onda. */
  readonly progresso: number;
  /** Raggio del cerchio di carta nuova (px). */
  readonly raggio: number;
  /** Larghezza della sfumatura del bordo (px). */
  readonly bordo: number;
  /** Opacità dello strato (1 durante l'onda; da 1 a 0 nella dissolvenza ridotta). */
  readonly opacita: number;
  /**
   * false: lo strato mostra la carta nuova DENTRO il cerchio.
   * true: `data-carta` è già la nuova, lo strato mostra la carta vecchia FUORI dal cerchio.
   */
  readonly invertita: boolean;
  /** true quando l'onda è finita e lo strato va tolto. */
  readonly finita: boolean;
}

/** Raggio che copre tutta la viewport partendo dal centro dato, più il bordo sfumato. */
export function raggioFinaleOnda(g: GeometriaOnda): number {
  const dx = Math.max(g.x, g.w - g.x);
  const dy = Math.max(g.y, g.h - g.y);
  return Math.hypot(dx, dy) + CARTA.onda.bordoA;
}

/** Stato dell'onda a `trascorsoMs` dall'inizio. Pura: la usano DOM (fallback) e GL (uWave). */
export function statoOnda(trascorsoMs: number, g: GeometriaOnda, ridotto: boolean): StatoOnda {
  const o = CARTA.onda;
  if (ridotto) {
    // Dissolvenza pura: `data-carta` cambia subito (invertita), lo strato
    // mostra la carta vecchia su tutto lo schermo (raggio 0 invertito) e
    // svanisce mentre l'inchiostro cambia colore nello stesso tempo.
    const u = clamp01(trascorsoMs / o.dissolvenza);
    return {
      progresso: u,
      raggio: 0,
      bordo: 0,
      opacita: 1 - lineare(u),
      invertita: true,
      finita: u >= 1,
    };
  }
  const u = clamp01(trascorsoMs / o.durata);
  const raggio = assorbe(u) * raggioFinaleOnda(g);
  return {
    progresso: u,
    raggio,
    bordo: lerp(o.bordoDa, o.bordoA, sfoglia(u)),
    opacita: 1,
    invertita: u >= o.scambio,
    finita: u >= 1,
  };
}

/* ------------------------------------------------------------------ */
/* 5 · Legatoria: il filo                                              */
/* ------------------------------------------------------------------ */

export const LEGATORIA = {
  /** Il filo parte quando la sezione è entrata del 25% e finisce prima che esca. */
  intervallo: { inizio: ['top', 0.75], fine: ['bottom', 0.85] } as Intervallo,
  /**
   * Frazioni della lunghezza del tracciato in cui si trovano le quattro
   * legature. Valori di partenza per un tracciato verticale a passo regolare:
   * il section-builder le sostituisce con le misure vere del suo SVG.
   */
  soste: [0.18, 0.42, 0.66, 0.9],
  /** Quota di scroll (0..1 dell'intervallo) in cui il filo resta fermo a ogni sosta. */
  sosta: 0.07,
  /** Anticipo (frazione di filo) con cui una fermata si considera raggiunta. */
  anticipoAggancio: 0.004,
  mollaAggancio: MOLLE.tiro as ParametriMolla,
} as const;

/**
 * Mappa il progresso di scroll sulla lunghezza del filo con soste: tra una
 * fermata e l'altra il filo accelera e frena (smootherstep), a ogni fermata
 * resta fermo per `larghezza` di scroll, così "si ferma accanto al nome".
 * Monotona, 0 in 0, 1 in 1.
 */
export function conSoste(p: number, soste: readonly number[], larghezza: number): number {
  const x = clamp01(p);
  const ordinate = [...soste].map(clamp01).sort((a, b) => a - b);
  const n = ordinate.length;
  if (n === 0) return smootherstep01(x);
  const h = clamp(larghezza, 0, 0.9 / n);
  const movimento = 1 - h * n;

  const chiavi: Array<readonly [number, number]> = [[0, 0]];
  let pCorrente = 0;
  let fPrecedente = 0;
  for (const f of ordinate) {
    const pIn = pCorrente + (f - fPrecedente) * movimento;
    const pOut = pIn + h;
    chiavi.push([pIn, f], [pOut, f]);
    pCorrente = pOut;
    fPrecedente = f;
  }
  chiavi.push([1, 1]);

  for (let i = 1; i < chiavi.length; i += 1) {
    const a = chiavi[i - 1];
    const b = chiavi[i];
    if (a === undefined || b === undefined) continue;
    const [p0, f0] = a;
    const [p1, f1] = b;
    if (x <= p1) {
      if (f1 === f0) return f0;
      if (p1 - p0 < 1e-6) return f1;
      return lerp(f0, f1, smootherstep01((x - p0) / (p1 - p0)));
    }
  }
  return 1;
}

/* ------------------------------------------------------------------ */
/* 6 · Banco                                                           */
/* ------------------------------------------------------------------ */

export const BANCO = {
  prova: PROFILI.bancoProva,
  prezzo: PROFILI.bancoPrezzo,
  battuta: BATTUTA,
  leva: LEVA,
  esempioLeggero: ESEMPIO_LEGGERO,
  /** Compressione della lastra con tastiera aperta (mobile): durata e altezze. */
  lastraTastiera: { durata: 220, altezzaAperta: 0.42, altezzaTastiera: 0.28 },
} as const;

/* ------------------------------------------------------------------ */
/* 7 · Bottega e 8 · Colophon                                          */
/* ------------------------------------------------------------------ */

export const BOTTEGA = {
  profilo: PROFILI.bottegaIndirizzo,
} as const;

export const COLOPHON = {
  profilo: PROFILI.colophonFirma,
} as const;

/* ------------------------------------------------------------------ */
/* Navigazione: segnapagina, indice, ancore                            */
/* ------------------------------------------------------------------ */

export const SEGNAPAGINA = {
  /** Entrata dal basso (translateY 100% a 0), curva `sfoglia`. */
  entra: 240,
  /** Uscita verso il basso, curva `sfogliaVia`. */
  esce: 200,
} as const;

export const INDICE = {
  /** Il foglio dell'indice sale fino al 78% dello schermo. */
  sale: 320,
  scende: 240,
  altezza: 0.78,
  /** Trascinamento verso il basso: chiude oltre questa frazione dell'altezza... */
  sogliaChiusura: 0.3,
  /** ...o sopra questa velocità (px/ms) al rilascio. */
  velocitaChiusura: 0.5,
} as const;

export const ANCORE = {
  /** Spazio sopra l'h2 all'arrivo (px): testata sticky desktop, niente testata su mobile. */
  margineLargo: 80,
  margineStretto: 24,
  /** Durata del viaggio: base + ms per px, limitata. */
  base: 480,
  msPerPx: 0.12,
  durataMin: 600,
  durataMax: 1400,
  /** Rete di sicurezza se lenis non chiama onComplete (ms oltre la durata). */
  margineSicurezza: 400,
  /** Con `#banco` nell'URL si parte dopo che la pressa dell'hero è ferma (ms dal montaggio). */
  attesaIniziale: HERO.fine + 120,
} as const;

/** Durata (ms) del viaggio verso un'ancora distante `distanzaPx`. */
export function durataAncora(distanzaPx: number): number {
  return clamp(ANCORE.base + Math.abs(distanzaPx) * ANCORE.msPerPx, ANCORE.durataMin, ANCORE.durataMax);
}

/** Spazio sopra l'ancora (px) per la larghezza data. */
export function margineAncora(larghezzaViewport: number): number {
  return larghezzaViewport >= LARGHEZZA_TESTATA ? ANCORE.margineLargo : ANCORE.margineStretto;
}

/* ------------------------------------------------------------------ */
/* WebGL                                                               */
/* ------------------------------------------------------------------ */

export const GL = {
  /** Il canvas va da 0 a 1 mentre i fantasmi perdono il text-shadow (ms, lineare). */
  comparsa: 300,
  /** Passaggio al fallback CSS se il GL rallenta o perde il contesto (ms, lineare). */
  spegnimento: 300,
} as const;

/* ------------------------------------------------------------------ */
/* Variabili CSS di curve e durate                                      */
/* ------------------------------------------------------------------ */

/**
 * Curve e durate per le transizioni CSS, da applicare come style inline su
 * `.imp-root` (lo fa Impronta.tsx). Con reduced motion i movimenti durano
 * 0 ms; restano solo le dissolvenze (inchiostro 200 ms, GL 300 ms).
 */
export function variabiliMotion(ridotto: boolean): Record<`--imp-${string}`, string> {
  const ms = (v: number): string => `${Math.round(v)}ms`;
  const mov = (v: number): string => (ridotto ? '0ms' : ms(v));
  return {
    '--imp-ease-pressa': pressaCss(),
    '--imp-ease-pressa-bezier': BEZIER_CSS.pressa,
    '--imp-ease-rilascio': BEZIER_CSS.rilascio,
    '--imp-ease-leva': BEZIER_CSS.leva,
    '--imp-ease-assorbe': BEZIER_CSS.assorbe,
    '--imp-ease-sfoglia': BEZIER_CSS.sfoglia,
    '--imp-ease-sfoglia-via': BEZIER_CSS.sfogliaVia,
    '--imp-dur-pressa': mov(PROFILI.perChiPezzo.durata),
    '--imp-dur-segnapagina-entra': mov(SEGNAPAGINA.entra),
    '--imp-dur-segnapagina-esce': mov(SEGNAPAGINA.esce),
    '--imp-dur-indice-sale': mov(INDICE.sale),
    '--imp-dur-indice-scende': mov(INDICE.scende),
    '--imp-dur-lastra': mov(BANCO.lastraTastiera.durata),
    '--imp-dur-inchiostro': ms(ridotto ? CARTA.onda.dissolvenza : CARTA.onda.inchiostro),
    '--imp-dur-gl': ms(GL.comparsa),
  };
}
