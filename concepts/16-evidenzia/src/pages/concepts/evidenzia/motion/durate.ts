/**
 * EVIDENZIA · durate, soglie e variabili di movimento.
 *
 * Unica fonte dei tempi del concept (creative-director 4.3-4.5, ux-architect
 * 5.7 e 8, docs/motion-designer.md §3). Chi anima qualcosa importa da qui,
 * mai numeri scritti a mano nei componenti.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { BEZIER_CSS, easingCss, type NomeCurva } from './easing';

/** Il tratto dell'evidenziatore (ms e frazioni di riga). */
export const TRATTO = {
  /** Completamento da solo fino a fine riga dopo un rilascio oltre la soglia (CD 4.4). */
  completa: 160,
  /** Il completamento più corto (tratto rilasciato quasi a fine riga). */
  completaMin: 70,
  /** Distanza di riferimento per `completa`: da 0,55 a 1. Distanze minori, durata in proporzione (radice). */
  completaDistanzaRif: 0.45,
  /** Ritiro del tratto corto (sotto il 55%). */
  ritira: 200,
  ritiraMin: 90,
  /** Il rosa che si scolora quando l'annuncio esce dal giro. */
  scolora: 250,
  /** Tratto disegnato dal bottone Evidenzia (e dai posti del giro). */
  disegnaDaBottone: 350,
  /** Tratto dimostrativo sulla parola "Segna" del riquadro di testa. */
  dimostrativo: 600,
  /** Attesa dopo i font pronti, prima del dimostrativo: l'occhio si posa sulla pagina. */
  dimostrativoAttesa: 450,
  /** Attesa massima dei font per il dimostrativo (tech-architect §9.2). */
  attesaFontMax: 3000,
} as const;

/** Il quinto annuncio: l'evidenziatore è scarico (CD 4.4, ux 5.7 A). */
export const SCARICO = {
  /** Il tratto pallido esce e rallenta. */
  esce: 300,
  /** Resta fermo, a metà. */
  sosta: 160,
  /** Si ritira. */
  rientra: 220,
  /** Dove muore l'inchiostro (frazione di riga). Il seme dell'annuncio la sposta di ±0,06. */
  fermaA: 0.48,
  fermaVariazione: 0.06,
  /** Reduced motion: tratto pallido fermo a metà, poi sparisce senza animazione (ux 6.4). */
  sostaRidotta: 600,
  /** Durata della riga d'avviso sotto l'attacco (ux 5.7 A). La gestisce chi la mostra. */
  avvisoMs: 8000,
} as const;

/** Lo stacco dell'annuncio in scheda e il ritorno (CD 4.3: FLIP in circa 420 ms). */
export const STACCO = {
  /** Fase 1: il ritaglio si solleva di pochi pixel e ruota di circa 1°. */
  solleva: 120,
  /** Fase 2: il ritaglio si apre nella scheda. */
  apre: 300,
  /** Parte della fase 2 in cui il ritaglio clonato svanisce (frazione). */
  cloneSvanisce: 0.45,
  /** Ritorno: la scheda si richiude nel ritaglio. */
  chiude: 260,
  /** Ritorno: il ritaglio si posa nel suo buco. */
  posa: 110,
  /** Parte della chiusura in cui il ritaglio clonato ricompare (dalla fine, frazione). */
  cloneRicompare: 0.4,
  sollevaPx: 4,
  rotazioneGradi: 1,
  /** Reduced motion: dissolvenza della scheda (CD 4.4). */
  dissolvenzaRidotta: 150,
  /** Se l'annuncio è fuori dalla finestra, niente stacco: dissolvenza di questa durata. */
  dissolvenzaFuoriVista: 180,
} as const;

/** La foto che passa dal retino al colore nella scheda (CD 2, idea 3). */
export const COLORE = {
  sviluppo: 520,
  /** Attesa minima dall'inizio dell'apertura della scheda, così si vede. */
  dopoApertura: 60,
} as const;

/** Oscuramento del foglio sotto scheda e giro (ux 6.1: 200 ms, una volta per apertura). */
export const VELO = {
  entra: 200,
  esce: 200,
  /**
   * Limite anti-lampeggio: tra l'inizio di due cambi del velo passano almeno
   * 500 ms. Se si chiude troppo presto, l'uscita si allunga fino a rispettarlo.
   */
  intervalloMinimo: 500,
} as const;

/** Leggi ↔ Pagina intera (ux 8: scala, circa 300 ms). */
export const VISTA = {
  /** Da Leggi a Pagina intera: la pagina si allontana. */
  allontana: 340,
  /** Da Pagina intera a Leggi: entri a leggere. */
  avvicina: 300,
  /** Fotogrammi chiave in scala geometrica (zoom uniforme per l'occhio). */
  fotogrammi: 12,
  /** Aria intorno al foglio in Pagina intera (ux 5.3). */
  ariaPx: 32,
} as const;

/** Il percorso rosa sulla mappa del giro (CD 4.5). Lo usa mappa/percorso.ts. */
export const PERCORSO = {
  durata: 900,
  /** Dopo il `fitBounds` e il primo tile: il percorso parte a mappa ferma. */
  attesa: 180,
  curva: 'mano' as NomeCurva,
} as const;

/**
 * Soglie del gesto (CD 4.4, ux 6.4, trend-researcher R5). Qui come fonte di
 * consultazione e per i test; il gesto le applica in interaction/.
 */
export const SOGLIE_GESTO = {
  avvioMousePx: 6,
  avvioTouchPx: 12,
  angoloTouchGradi: 30,
  completamento: 0.55,
  annullaVerticalePx: 40,
  margineBordoTouchPx: 24,
  vibrazioneMs: 10,
} as const;

/* ------------------------------------------------------------------ */
/* Variabili CSS per transizioni dichiarate nei fogli di stile         */
/* ------------------------------------------------------------------ */

export type VariabiliMotion = Record<`--evd-${string}`, string>;

const CURVE_ESPOSTE: readonly NomeCurva[] = [
  'mano',
  'rientro',
  'asciuga',
  'solleva',
  'apre',
  'chiude',
  'posa',
  'sviluppo',
  'obiettivo',
  'velo',
];

/**
 * Curve e durate come variabili CSS, da mettere nello `style` di `.evd-root`
 * (Evidenzia.tsx). Con reduced motion le durate valgono 0ms: una transizione
 * scritta come `transition: opacity var(--evd-durata-velo) var(--evd-ease-velo)`
 * diventa un cambio immediato senza altro codice.
 *
 * Solo nel client (easingCss verifica il supporto di `linear()`); nel
 * prerender si può chiamare con `client = false` per avere le sole bezier.
 */
export function variabiliMotion(ridotto: boolean, client = true): VariabiliMotion {
  const v: VariabiliMotion = {};
  for (const nome of CURVE_ESPOSTE) {
    v[`--evd-ease-${nome}`] = client ? easingCss(nome) : BEZIER_CSS[nome];
  }
  const ms = (n: number): string => (ridotto ? '0ms' : `${n}ms`);
  v['--evd-durata-velo'] = ms(VELO.entra);
  v['--evd-durata-scolora'] = ms(TRATTO.scolora);
  v['--evd-durata-tratto'] = ms(TRATTO.disegnaDaBottone);
  v['--evd-durata-colore'] = ms(COLORE.sviluppo);
  return v;
}

/** Durata proporzionale alla distanza (radice: i tratti brevi non diventano scatti). */
export function durataPerDistanza(base: number, minimo: number, distanza: number, distanzaRif: number): number {
  if (distanza <= 0) return 0;
  const r = Math.sqrt(Math.min(1, distanza / distanzaRif));
  return Math.round(Math.max(minimo, base * r));
}
