/**
 * NODI · coreografia: tutte le durate, gli sfasamenti e le soglie.
 *
 * Il creative-director ammette cinque movimenti e nient'altro (§4.10):
 * caduta iniziale delle foglie, migrazione delle foglie, spostamento dei
 * cuscinetti, dissolvenze dei testi al cambio modo, riduzione del riquadro
 * della tavola su mobile. L'ux-architect ne aggiunge due già previsti:
 * crescita del riquadro mobile nella salita 1 e velo del margine di lettura
 * al salto dal righello. Ogni valore qui serve a uno di questi sette.
 *
 * Unità: millisecondi per le durate CSS/DOM, secondi dove lo dice il nome
 * (`...S`), millimetri della tavola per le distanze del GL.
 * Modulo puro: nessun accesso a window/document.
 */

import { BEZIER_CSS, clamp01, cuscinetto, lerp, posa, smoothstep01, velo } from './easing';

/* ------------------------------------------------------------------ */
/* 1. Caduta iniziale delle foglie (una volta sola per visita)         */
/* ------------------------------------------------------------------ */

/**
 * Le foglie si versano dall'alto, in pianta: ognuna compare in 420 ms con
 * scala 0,9 → 1 e opacità 0 → 1 (CD §4.2), niente rimbalzo. La versata ha
 * un punto di partenza (dove il liutaio inclina il barattolo, poco sopra il
 * centro della tavola) e si allarga verso il bordo: l'ordine è dato per il
 * 62% dalla distanza da quel punto e per il 38% dal caso, così non si vede
 * un'onda circolare ma un mucchio che si sparge.
 */
export const CADUTA = {
  /** Durata totale, dall'inizio della prima foglia alla fine dell'ultima. */
  durata: 1200,
  /** Comparsa di una foglia. */
  perFoglia: 420,
  /** Scala iniziale (in pianta, la foglia "arriva" sul legno). */
  scalaDa: 0.9,
  /** L'opacità arriva a 1 in questa frazione della comparsa (prima della scala). */
  opacitaEntro: 0.55,
  /** Punto della versata in coordinate normalizzate della tavola (u larghezza, v lunghezza, v = 0 al riccio). */
  versata: { u: 0.47, v: 0.44 },
  /** Peso della distanza nell'ordine di comparsa (il resto è caso). */
  pesoDistanza: 0.62,
  /** Attesa dopo che il canvas è comparso (300 ms) prima della prima foglia. */
  attesa: 120,
} as const;

/**
 * Istante di comparsa (ms dall'inizio della caduta) di una foglia in (u, v)
 * con un numero casuale `caso` in [0, 1) dal generatore con seme della
 * simulazione. Il webgl-artist lo scrive in `t0` (attributo statico).
 */
export function t0Caduta(u: number, v: number, caso: number): number {
  // La tavola è lunga 1,7 volte la larghezza: le distanze si misurano in mm relativi.
  const du = (u - CADUTA.versata.u) * 1;
  const dv = (v - CADUTA.versata.v) * 1.7;
  const dMax = Math.hypot(0.55, 0.56 * 1.7);
  const d = clamp01(Math.hypot(du, dv) / dMax);
  const ordine = CADUTA.pesoDistanza * smoothstep01(d) + (1 - CADUTA.pesoDistanza) * clamp01(caso);
  return ordine * (CADUTA.durata - CADUTA.perFoglia);
}

/**
 * Scala e opacità di una foglia `ms` millisecondi dopo l'inizio della
 * caduta. Stessa formula nel vertex shader (versione GLSL in
 * `docs/motion-designer.md` §3.1). Le foglie non cambiano mai colore né
 * luminosità: l'opacità esiste solo durante la comparsa.
 */
export function comparsaFoglia(ms: number, t0: number): { scala: number; opacita: number } {
  const t = clamp01((ms - t0) / CADUTA.perFoglia);
  const k = posa(t);
  return {
    scala: lerp(CADUTA.scalaDa, 1, k),
    opacita: clamp01(t / CADUTA.opacitaEntro),
  };
}

/* ------------------------------------------------------------------ */
/* 2. Migrazione verso le linee nodali                                 */
/* ------------------------------------------------------------------ */

/**
 * Tempo perché la figura sia nitida (CD §2.2 regola 5: 2,5-4 s). Il
 * webgl-artist tara la simulazione su questi numeri: a `prontezza` p, il
 * 90% delle foglie è entro `nitida.mm` dalla linea nodale dopo
 * `tempoFormazione(p)` ms di risonanza piena.
 */
export const FORMAZIONE = {
  /** prontezza 0 (voce "morbida"). */
  lenta: 4000,
  /** prontezza 1 (voce "pronta"). */
  pronta: 2500,
  /** Prontezza dei modi 1 e 2 e del modo 5 senza voce scelta (foglia al centro). */
  prontezzaBase: 0.5,
  /** Criterio di "figura nitida". */
  nitida: { quota: 0.9, mm: 1.2 },
  /** Prima del 25% del tempo le foglie si staccano appena: niente scatto all'ingresso in banda. */
  avvio: 0.25,
  /** Velocità massima di una foglia (mm/s): nessuna salta da un capo all'altro (regola 5). */
  velocitaMaxMm: 22,
  /** Sotto questa velocità (mm/s) per tutte le foglie la simulazione dorme. */
  quieteMm: 0.08,
} as const;

/** Tempo di formazione in ms per una prontezza 0..1 (lineare: la differenza deve sentirsi). */
export function tempoFormazione(prontezza: number): number {
  return lerp(FORMAZIONE.lenta, FORMAZIONE.pronta, clamp01(prontezza));
}

/**
 * Tremolio delle foglie sui ventri (CD §4.3): rumore liscio, al massimo 3
 * cambi al secondo, ampiezza al massimo 2 px CSS, scalato dall'ampiezza
 * locale. Mai un tremolio frame per frame.
 */
export const TREMOLIO = {
  /** Nodi di rumore al secondo (≤ 3). */
  cambiAlSecondo: 2.4,
  /** Ampiezza massima in px CSS (il GL la converte in mm con la scala del riquadro). */
  ampiezzaPx: 2,
  /** Sotto questa ampiezza locale |w| (0..1) il tremolio è zero: le foglie sui nodi sono ferme. */
  soglia: 0.12,
} as const;

/* ------------------------------------------------------------------ */
/* 3. Cuscinetti di gommapiuma                                         */
/* ------------------------------------------------------------------ */

/**
 * Il liutaio sposta i quattro cuscinetti **prima** di cercare il modo
 * nuovo: il cambio parte all'inizio della salita verso quel modo
 * (`modoCuscinetti` di percorso.ts), così i cuscinetti annunciano dove si
 * formeranno le linee. Non scivolano sul legno: la tavola si alza, i
 * cuscinetti vecchi svaniscono, quelli nuovi compaiono sui nodi (CD §2.2
 * regola 6, "dissolvenza lenta"). Un solo uniform `mix` 0 → 1 nel tempo,
 * da cui il vertex shader ricava le due opacità.
 */
export const CUSCINETTI = {
  durata: 1400,
  /** Frazioni di `mix` in cui svaniscono i vecchi e compaiono i nuovi (si sovrappongono poco). */
  uscita: [0, 0.55] as const,
  entrata: [0.4, 1] as const,
  /** Con reduced motion: stessa dissolvenza, più corta (tech §9.3). */
  durataRidotta: 400,
  /** Opacità piena di un cuscinetto (ebano al 25%: CD §2.2 regola 6). */
  alfa: 0.25,
} as const;

/** Opacità relative (0..1) dei cuscinetti vecchi e nuovi a un dato `mix`. */
export function alfaCuscinetti(mix: number): { vecchi: number; nuovi: number } {
  const m = clamp01(mix);
  const fuori = clamp01((m - CUSCINETTI.uscita[0]) / (CUSCINETTI.uscita[1] - CUSCINETTI.uscita[0]));
  const dentro = clamp01((m - CUSCINETTI.entrata[0]) / (CUSCINETTI.entrata[1] - CUSCINETTI.entrata[0]));
  return { vecchi: 1 - cuscinetto(fuori), nuovi: cuscinetto(dentro) };
}

/** `mix` dopo `ms` dall'inizio del cambio. */
export function mixCuscinetti(ms: number, ridotto: boolean): number {
  return clamp01(ms / (ridotto ? CUSCINETTI.durataRidotta : CUSCINETTI.durata));
}

/* ------------------------------------------------------------------ */
/* 4. Dissolvenze (testi, nome del modo, figure ferme, canvas)         */
/* ------------------------------------------------------------------ */

export const DISSOLVENZE = {
  /** Testi che cambiano al cambio modo (descrizione visibile, frase della zona). */
  testo: 200,
  /** Nome del modo sotto il valore del righello ("modo 2"). */
  nomeModo: 300,
  /** Fermi immagine del fallback e disposizioni ferme del reduced motion. */
  fermo: 400,
  /** Al massimo un cambio di fermo ogni 500 ms (regola anti-lampeggio). */
  intervalloMinimo: 500,
  /** Poster → canvas al primo frame GL (identici: non si vede). */
  canvas: 300,
  /** Poster "vuota" → fermo "riposo" nel fallback: la caduta di chi non ha WebGL. */
  cadutaFallback: 1200,
  /** Canvas → fermo quando la qualità crolla o il contesto si perde. */
  versoFallback: 400,
} as const;

/** Ritardo dell'annuncio `aria-live` dopo l'ultimo cambio di modo (ux §3.3). */
export const ANNUNCIO_RITARDO = 600;

/* ------------------------------------------------------------------ */
/* 5. Riquadro mobile e velo del margine di lettura                    */
/* ------------------------------------------------------------------ */

/**
 * La riduzione 54svh → 34svh è legata allo scroll (`palcoDaPercorso`) e
 * filtrata da `TAU.palco` di molle.ts: non ha durata. Qui solo il velo del
 * margine di lettura quando un trascinamento del righello sposta la pagina
 * di più di una finestra in un frame (ux §3.2): il testo non si muove, si
 * vela un attimo e torna (mai sotto 0,35, mai più di un ciclo ogni 500 ms).
 */
export const VELO_SALTO = {
  /** Salto minimo, in finestre, per velare. */
  soglia: 1,
  /** Opacità minima del margine durante il salto. */
  minimo: 0.35,
  /** Discesa e risalita (ms). */
  discesa: 120,
  risalita: 200,
  /** Il margine torna pieno dopo questa quiete del trascinamento. */
  quiete: 150,
  intervalloMinimo: 500,
} as const;

/** Opacità del velo `ms` dopo l'ultimo salto, 1 = nessun velo. */
export function opacitaVelo(msDalSalto: number): number {
  if (msDalSalto < 0) return 1;
  if (msDalSalto < VELO_SALTO.discesa) {
    return lerp(1, VELO_SALTO.minimo, velo(msDalSalto / VELO_SALTO.discesa));
  }
  const r = msDalSalto - VELO_SALTO.discesa - VELO_SALTO.quiete;
  if (r <= 0) return VELO_SALTO.minimo;
  return lerp(VELO_SALTO.minimo, 1, velo(clamp01(r / VELO_SALTO.risalita)));
}

/* ------------------------------------------------------------------ */
/* 6. Comandi sulle foglie                                             */
/* ------------------------------------------------------------------ */

/**
 * "Rimetti le foglie" (CD §4.3, 1,2 s): le foglie si sollevano (opacità
 * 1 → 0 e scala 1 → 0,94 in 300 ms, sfasate di 0-160 ms) e ricadono sparse
 * con la stessa comparsa della caduta, compressa nei 900 ms rimanenti.
 */
export const RIMETTI = {
  durata: 1200,
  sollevamento: 300,
  sfasamentoSollevamento: 160,
  scalaSollevata: 0.94,
  /** La ricaduta usa CADUTA con durata ridotta a questo valore. */
  ricaduta: 900,
} as const;

/**
 * Invio della voce in corso (CD §4.4, ux T7): "l'anello si ricompone
 * lentamente". Una spinta casuale piccola (la tavola eccitata a banda larga
 * per un istante), poi la formazione a prontezza 0. Niente spinner.
 */
export const RICOMPONI = {
  /** Spostamento massimo casuale (mm) dato in `spinta` ms. */
  spintaMm: 3,
  spinta: 500,
  /** Prontezza forzata durante la ricomposizione. */
  prontezza: 0,
} as const;

/* ------------------------------------------------------------------ */
/* 7. Scroll verso le ancore                                           */
/* ------------------------------------------------------------------ */

/**
 * Lo scroll verso ancore, scorciatoie dei modi e magnetismo al rilascio usa
 * lo scroll liscio nativo (`behavior: 'smooth'`), istantaneo con reduced
 * motion: nessuna curva nostra, nessuna libreria (tech §2.2).
 */
export function comportamentoScroll(ridotto: boolean): ScrollBehavior {
  return ridotto ? 'auto' : 'smooth';
}

/* ------------------------------------------------------------------ */
/* Riepilogo per CSS                                                   */
/* ------------------------------------------------------------------ */

/** Transizioni CSS pronte (durata + curva), per chi le scrive inline o nei test. */
export const TRANSIZIONI_CSS = {
  testo: `opacity ${DISSOLVENZE.testo}ms ${BEZIER_CSS.velo}`,
  nomeModo: `opacity ${DISSOLVENZE.nomeModo}ms ${BEZIER_CSS.velo}`,
  fermo: `opacity ${DISSOLVENZE.fermo}ms ${BEZIER_CSS.velo}`,
  canvas: `opacity ${DISSOLVENZE.canvas}ms ${BEZIER_CSS.velo}`,
  cadutaFallback: `opacity ${DISSOLVENZE.cadutaFallback}ms ${BEZIER_CSS.posa}`,
} as const;
