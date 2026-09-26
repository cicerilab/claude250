/**
 * SOTTOSCOCCA · durate, soglie e parametri del movimento (motion-designer).
 *
 * Un solo posto per ogni numero di tempo: chi muove qualcosa (scaffold,
 * section-builder, interaction-designer, shader-engineer) prende da qui.
 * Le stesse durate e curve servono al CSS come variabili `--ssc-durata-*` e
 * `--ssc-curva-*`: i valori sono in `VARIABILI_MOTION` (e nella tabella di
 * docs/motion-designer.md §8), l'art-director li riporta in tokens.css.
 *
 * Regola del concept: si muovono solo il ponte, la camera, le ruote (mezzo
 * giro), il pezzo evidenziato, la scheda, la barra e la mensola, l'asta che
 * si ritira, il blocco del planning. Nient'altro.
 *
 * Modulo puro: nessun accesso a window/document (prerender).
 */

import { BEZIER_CSS, type NomeCurva } from './easing';

/* ------------------------------------------------------------------ */
/* Il ponte                                                            */
/* ------------------------------------------------------------------ */

/** Quote dei plateau, in centimetri. */
export const QUOTE_PLATEAU = [0, 20, 80, 180] as const;

/** Fondo scala dell'asta graduata (cm). L'indice si muove su 0..200. */
export const SCALA_ASTA_CM = 200;

/** Il numero accanto all'indice si arrotonda a questo passo (CD: "per non frullare"). */
export const PASSO_NUMERO_ASTA_CM = 5;

/** Plateau "raggiunto" (aria-current, aria-live, data-quota) se la quota è entro questa distanza. */
export const TOLLERANZA_PLATEAU_CM = 0.5;

export const PONTE = {
  /** Inseguimento della quota: frazione di distanza coperta in un frame a 60 Hz (CD: ~0,12). */
  lerpPerFrame: 0.12,
  /** Sotto questa distanza la quota si posa esattamente sull'obiettivo (cm). */
  quiete: 0.01,
  /** Assestamento sui fermi di sicurezza: di quanto si posa il carrello (cm, CD: 3-4 mm). */
  assestamentoCm: 0.35,
  /** Durata dell'assestamento (ms): 83 ms di caduta sul dente, 177 ms di ripresa. */
  assestamentoMs: 260,
  /** L'assestamento parte quando la quota è a meno di questo dal plateau, salendo (cm). */
  assestamentoInnesco: 0.2,
  /** Le ruote girano quando la quota supera questa altezza salendo (cm): le gomme sono staccate. */
  ruoteInnescoCm: 6,
  /** Le ruote si riarmano quando il ponte torna sotto questa altezza (cm). */
  ruoteRiarmoCm: 1,
  /** Mezzo giro (rad) e sua durata (ms): lento, una volta sola. */
  ruoteAngolo: Math.PI,
  ruoteMs: 1600,
  /** Opacità del canvas: variazione massima al secondo (anti-lampeggio, vedi doc §9). */
  opacitaMaxAlSecondo: 1.6,
  /** Inseguimento di discesa (allontanamento camera), come la quota. */
  discesaLerpPerFrame: 0.12,
} as const;

/* ------------------------------------------------------------------ */
/* Scroll → ponte (usate da motion/percorso.ts)                        */
/* ------------------------------------------------------------------ */

/**
 * Linea di lettura: frazione dell'altezza della finestra da cui si misura in
 * quale stazione ci si trova (tech-architect §6.3).
 */
export const LINEA_DI_LETTURA = 0.6;

/**
 * Regola dei plateau (ux-architect §3, tarata): il plateau di una quota
 * comincia quando il bordo alto del suo pannello arriva a `entra` della
 * finestra (dal alto) e finisce quando il bordo basso del pannello sale oltre
 * `esce`. La salita avviene solo in mezzo, con la sola scena in vista.
 * In verticale (portrait) il pannello scorre sotto la scena: esce prima.
 */
export const SOGLIE_PANNELLO = {
  landscape: { entra: 0.75, esce: 0.2 },
  portrait: { entra: 0.8, esce: 0.5 },
} as const;

export const SOGLIE_PERCORSO = {
  /** Tratto minimo di scroll per una salita, in finestre (se i pannelli sono troppo vicini). */
  salitaMinima: 0.3,
  /** La prima salita (0 → 20) dura almeno questo, in finestre: il gesto si deve capire. */
  primaSalitaMinima: 0.45,
  /**
   * Ponte libero, misurato sul bordo alto della sezione in frazioni di
   * finestra dall'alto. Discesa 180 → 0 mentre il bordo passa da 0,95 a 0,35
   * (60 vh, ux-architect §3); la camera si allontana da 0,6 a 0,15; la scena
   * sfuma al 20% da 0,4 a 0,05.
   */
  discesaQuota: { inizio: 0.95, fine: 0.35 },
  discesaCamera: { inizio: 0.6, fine: 0.15 },
  opacitaPlanning: { inizio: 0.4, fine: 0.05, valore: 0.2 },
  /** Officina (bordo basso del ponte libero): la scena va a 0 mentre il bordo passa da 0,9 a 0,45. */
  opacitaOfficina: { inizio: 0.9, fine: 0.45 },
} as const;

/* ------------------------------------------------------------------ */
/* Durate (ms)                                                         */
/* ------------------------------------------------------------------ */

export const DURATE = {
  /** Pezzo della scena da verde a bianco (CD 4.8). */
  evidenza: 250,
  /** Scheda del punto su desktop: si apre dal lato del punto come un pannello su guide. */
  schedaApri: 280,
  schedaChiudi: 180,
  /** Foglio dal basso su mobile. */
  foglioApri: 320,
  foglioChiudi: 220,
  /** Foglio lasciato a metà trascinamento che torna su. */
  foglioRitorno: 200,
  /** Barra "Il tuo lavoro". */
  barraEntra: 280,
  barraEsce: 200,
  /** Mensola del planning su mobile. */
  mensolaEntra: 240,
  mensolaEsce: 180,
  /** Asta graduata che si ritira entrando nel ponte libero e torna uscendo. */
  astaRitiro: 420,
  astaRitorno: 420,
  /** Blocco del planning. */
  bloccoAggancio: 160,
  bloccoRitorno: 260,
  /** "Sale sul ponte": il riempimento bianco dal basso all'invio (CD 4.4). */
  bloccoSale: 400,
  /** Invio fallito: il bianco scende e il blocco torna tratteggiato. */
  bloccoScende: 240,
  /** Ombra di aggancio durante il trascinamento: salto da una tacca di 10' all'altra. */
  ombraTacca: 90,
  /** Corsie non adatte che si attenuano al 40% quando si afferra il blocco. */
  corsieAttenua: 200,
  /** Cambio di giorno: dissolvenza del contenuto delle corsie. */
  planningGiorno: 200,
  /** Testata da trasparente a nero pieno. */
  testataFondo: 200,
  /** "Trova un buco" della testata che compare quando quello dell'apertura esce. */
  testataBottone: 160,
  /** Canvas che compare sopra il poster, e fallback che prende il posto del canvas. */
  glComparsa: 300,
  glSpegni: 300,
  /** Foto del fallback che cambiano al plateau (CD 4.3). */
  fondaleFoto: 300,
  /** Reduced motion: dissolvenza incrociata del GL tra due inquadrature ferme (CD 4.3). */
  dissolvenzaRidotta: 200,
} as const;

export type NomeDurata = keyof typeof DURATE;

/**
 * Reduced motion = stato finale immediato. Restano solo le dissolvenze che
 * la direzione chiede esplicitamente (GL tra due inquadrature, 200 ms) e le
 * variazioni di luminosità di grandi superfici, che non devono mai essere un
 * salto netto: canvas on/off e fondo della testata passano in 200 ms.
 * Tutto ciò che trasla o scala vale 0.
 */
export const DURATE_RIDOTTE: Readonly<Record<NomeDurata, number>> = {
  evidenza: 0,
  schedaApri: 0,
  schedaChiudi: 0,
  foglioApri: 0,
  foglioChiudi: 0,
  foglioRitorno: 0,
  barraEntra: 0,
  barraEsce: 0,
  mensolaEntra: 0,
  mensolaEsce: 0,
  astaRitiro: 0,
  astaRitorno: 0,
  bloccoAggancio: 0,
  bloccoRitorno: 0,
  bloccoSale: 0,
  bloccoScende: 0,
  ombraTacca: 0,
  corsieAttenua: 0,
  planningGiorno: 0,
  testataFondo: 200,
  testataBottone: 0,
  glComparsa: 200,
  glSpegni: 200,
  fondaleFoto: 0,
  dissolvenzaRidotta: 200,
};

export function durata(nome: NomeDurata, ridotto: boolean): number {
  return ridotto ? DURATE_RIDOTTE[nome] : DURATE[nome];
}

/** Curva associata a ogni durata (per chi anima in CSS o in JS con lo stesso nome). */
export const CURVA_DI: Readonly<Record<NomeDurata, NomeCurva>> = {
  evidenza: 'vernice',
  schedaApri: 'cassetto',
  schedaChiudi: 'via',
  foglioApri: 'cassetto',
  foglioChiudi: 'via',
  foglioRitorno: 'cassetto',
  barraEntra: 'cassetto',
  barraEsce: 'via',
  mensolaEntra: 'cassetto',
  mensolaEsce: 'via',
  astaRitiro: 'via',
  astaRitorno: 'cassetto',
  bloccoAggancio: 'aggancio',
  bloccoRitorno: 'ritorno',
  bloccoSale: 'colonna',
  bloccoScende: 'sfiato',
  ombraTacca: 'aggancio',
  corsieAttenua: 'lineare',
  planningGiorno: 'lineare',
  testataFondo: 'lineare',
  testataBottone: 'lineare',
  glComparsa: 'lineare',
  glSpegni: 'lineare',
  fondaleFoto: 'lineare',
  dissolvenzaRidotta: 'lineare',
};

/* ------------------------------------------------------------------ */
/* Anti-lampeggio                                                      */
/* ------------------------------------------------------------------ */

/**
 * Intervallo minimo tra due cambi di colore o luminosità della stessa grande
 * superficie (canvas, corsie del planning, testata). Vale per tutto il
 * concept: chi cambia una grande superficie a ripetizione (frecce tenute
 * premute sui giorni, scroll avanti e indietro sulla soglia) applica al
 * massimo un cambio ogni 500 ms e salta direttamente all'ultimo stato.
 */
export const INTERVALLO_MINIMO_GRANDI_SUPERFICI = 500;

/* ------------------------------------------------------------------ */
/* Scheda mobile: trascina giù per chiudere                            */
/* ------------------------------------------------------------------ */

export const FOGLIO = {
  /** Chiude se lasciato oltre questa frazione della sua altezza... */
  sogliaChiusura: 0.3,
  /** ...o se lasciato con questa velocità verso il basso (px/ms). */
  velocitaChiusura: 0.6,
  /** Oltre il bordo alto il foglio non sale: resistenza (frazione del movimento del dito). */
  resistenzaSu: 0,
} as const;

/* ------------------------------------------------------------------ */
/* Variabili CSS per tokens.css (art-director)                         */
/* ------------------------------------------------------------------ */

type VariabileMotion = `--ssc-${string}`;

function nomeCss(nome: string): string {
  return nome.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * Tutte le variabili di movimento per il CSS, nella versione normale o
 * ridotta. I nomi sono `--ssc-curva-<curva>` e `--ssc-durata-<durata>` in
 * kebab-case (es. `--ssc-durata-scheda-apri`). L'art-director le scrive in
 * tokens.css su `.ssc-root` e le ridefinisce su
 * `.ssc-root[data-motion="reduced"]`; i CSS di sezione usano solo queste.
 */
export function variabiliMotion(ridotto: boolean): Readonly<Record<VariabileMotion, string>> {
  const out: Record<VariabileMotion, string> = {};
  (Object.keys(BEZIER_CSS) as NomeCurva[]).forEach((c) => {
    out[`--ssc-curva-${nomeCss(c)}`] = BEZIER_CSS[c];
  });
  (Object.keys(DURATE) as NomeDurata[]).forEach((d) => {
    out[`--ssc-durata-${nomeCss(d)}`] = `${durata(d, ridotto)}ms`;
  });
  return out;
}
