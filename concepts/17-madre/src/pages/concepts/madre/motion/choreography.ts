/**
 * MADRE · durate, soglie e parametri di tutto ciò che si muove
 * (motion-designer, docs/motion-designer.md §3 e §6).
 *
 * Una sola fonte per i numeri: fossetta.ts, respiro.ts, foglio.ts,
 * gettoni.ts e i CSS (tramite `variabiliMotion`) leggono da qui.
 * Gli eventi di movimento ammessi sono solo questi (creative-director 4.10,
 * ux-architect §8): fossetta e respiro dell'impasto, cammino della vetrina
 * (guidato dall'utente, 1:1), foglio azzurro, gettoni del pane fisso, pieghe
 * del vassoio, comparsa dei fissi, dissolvenze del GL. Nient'altro si muove:
 * nessun ingresso allo scroll, nessuna parallasse, nessun ciclo.
 *
 * Modulo puro: nessun accesso a window/document, sicuro per il prerender.
 */

import { INTERVALLO_ANTI_LAMPEGGIO_MS } from '../interaction/antiLampeggio';
import { BEZIER_CSS, RISALE_TAU1, RISALE_TAU2 } from './easing';

/* ------------------------------------------------------------------ */
/* La prova del dito (creative-director 4.3)                            */
/* ------------------------------------------------------------------ */

export const FOSSETTA = {
  /** Fossette contemporanee (tre dita, o tre prove una dopo l'altra). */
  quante: 3,
  /**
   * Discesa del dito: molla critica in rad/s. 95% del fondo in 0,50 s,
   * 78% in 0,30 s, 41% in 0,15 s: entra deciso e frena contro la pasta.
   */
  omegaAffonda: 9.5,
  /**
   * Un clic è una prova completa (ux-architect 6.3): se il dito si alza
   * prima, la fossetta finisce di scendere fino a questa profondità (circa
   * 0,21 s) e solo allora torna su. Vale anche da tastiera.
   */
  profonditaMinimaRilascio: 0.6,
  /** Ritorno elastico sovrasmorzato: due costanti (s). 90% recuperato in circa 2 s. */
  tau1: RISALE_TAU1,
  tau2: RISALE_TAU2,
  /** Parte plastica massima (il segno leggerissimo), frazione della profondità al rilascio. */
  residuo: 0.07,
  /** Plasticità: un tocco lascia meno segno di una prova tenuta (base + (1-base)(1-e^-t/tau)). */
  plasticitaBase: 0.45,
  plasticitaTau: 0.6,
  /** Il segno resta fermo per questo tempo dal rilascio (s)... */
  segnoTenuta: 1.8,
  /** ...poi si cancella in questo tempo (s): sparito a 6,2 s dal rilascio. */
  segnoSvanisce: 4.4,
  /** Lo spolvero si apre mentre il dito affonda, con un ritardo di primo ordine (s). */
  aperturaTau: 0.14,
  /** Metà dello spolvero si richiude insieme alla pasta (costante, s)... */
  spolveroParziale: 0.5,
  spolveroTau: 1.2,
  /** ...l'altra metà resta aperta fino a qui (s) e si richiude per ultima. */
  spolveroTenuta: 2.2,
  spolveroSvanisce: 4.6,
  /** Reduced motion: solo ombreggiatura, a velocità costante (s per il tratto intero). */
  ridottoEntrata: 0.4,
  ridottoUscita: 0.6,
  /** Una nuova pressione entro questo raggio (px) da una fossetta non premuta la riprende. */
  stessoPuntoPx: 40,
  /** Sotto questa soglia un valore è zero (niente scritture e niente render inutili). */
  epsilon: 1e-4,
} as const;

/** Istante (s dal rilascio) in cui la fossetta torna del tutto a riposo. */
export const FOSSETTA_FINE_RILASCIO = Math.max(
  FOSSETTA.segnoTenuta + FOSSETTA.segnoSvanisce,
  FOSSETTA.spolveroTenuta + FOSSETTA.spolveroSvanisce,
);

/* ------------------------------------------------------------------ */
/* Il respiro dell'impasto (creative-director 4.3)                      */
/* ------------------------------------------------------------------ */

export const RESPIRO = {
  /**
   * Durata di ogni respiro (s), in sequenza fissa: un impasto vivo non è un
   * metronomo. Tutti tra 8 e 10 s come chiede il creative-director.
   */
  periodi: [9.0, 9.6, 8.6, 9.3, 8.8] as readonly number[],
  /** Altezza di ogni respiro (frazione dell'ampiezza dello shader), stessa sequenza. */
  altezze: [1, 0.86, 0.95, 0.9, 0.82] as readonly number[],
  /** Frazione del ciclo in salita: sale piano (5,2 s), scende un po' prima (3,8 s). */
  salita: 0.58,
  /**
   * Secondi senza input dopo i quali non comincia un respiro nuovo; quello
   * in corso finisce e la pasta si ferma a riposo (mai tagliato a metà).
   */
  durata: 30,
  /** Aggiornamenti al secondo (tech-architect §10: respiro a 30 fps). */
  fps: 30,
} as const;

/* ------------------------------------------------------------------ */
/* Il foglio azzurro (creative-director 4.2, trend-researcher P8)       */
/* ------------------------------------------------------------------ */

export const FOGLIO = {
  /**
   * Quanto il foglio arriva "da più lontano" del suo posto, come frazione
   * dell'area viva (finestra meno margine sinistro). Il foglio non passa
   * mai a sinistra del suo posto: non copre mai i prezzi crosta del pane.
   */
  anticipo: 0.3,
  anticipoMin: 72,
  anticipoMax: 380,
} as const;

/* ------------------------------------------------------------------ */
/* I gettoni del pane fisso (ux-architect 5.7)                          */
/* ------------------------------------------------------------------ */

export type TipoVolo = 'torna' | 'posa' | 'porta';

export interface ParametriVolo {
  /** ms fissi + ms per pixel di distanza, limitati a [min, max]. */
  base: number;
  perPx: number;
  min: number;
  max: number;
  /** Altezza massima dell'arco (px) e frazione della distanza. 0 = traiettoria dritta. */
  arcoMax: number;
  arcoPerPx: number;
  /** Da quale frazione della curva il gettone si dissolve nel giorno (1 = mai). */
  dissolvenzaDa: number;
}

export const VOLI: Readonly<Record<TipoVolo, ParametriVolo>> = {
  /** Rilascio fuori da un giorno valido: dritto al suo posto, circa 320 ms (ux 5.7). */
  torna: { base: 200, perPx: 0.22, min: 240, max: 360, arcoMax: 0, arcoPerPx: 0, dissolvenzaDa: 1 },
  /** Rilascio su un giorno valido: dal dito alla riga nuova, si posa e si scioglie nella riga. */
  posa: { base: 220, perPx: 0.25, min: 260, max: 440, arcoMax: 24, arcoPerPx: 0.08, dissolvenzaDa: 0.62 },
  /** Tocca e poi tocca: un doppio del gettone vola dalla fila (o da "In mano") al giorno. */
  porta: { base: 260, perPx: 0.28, min: 300, max: 520, arcoMax: 36, arcoPerPx: 0.12, dissolvenzaDa: 0.62 },
};

/** Frame di attesa per trovare l'elemento d'arrivo dopo il render di React. */
export const VOLO_TENTATIVI_MISURA = 3;

/* ------------------------------------------------------------------ */
/* Tempi delle transizioni CSS (ms)                                    */
/* ------------------------------------------------------------------ */

export const TEMPI = {
  /** Il canvas entra sopra la superficie CSS dopo il primo frame (tech-architect 9.1). */
  glEntrata: 300,
  /** GL → fallback (contesto perso, lento): dissolvenza, mai un lampo. */
  glUscita: 300,
  /** Colore del bottone "Il pane fisso" in testata quando cambia il fondo del banco. */
  colore: 300,
  /** Fissi che arrivano: bottone in testata su mobile, riga dei banchi, barra del riassunto chiusa. */
  comparsa: 220,
  /** Fissi che se ne vanno: solo opacità. */
  scomparsa: 160,
  /** Angoli del vassoio (una volta, quando la prima pasta va sul vassoio). */
  piega: 300,
  /** Spunta di "Scelto" e "Sul vassoio". */
  spunta: 220,
  /** Barra del riassunto su mobile: "leggi tutto" / "chiudi". */
  barra: 240,
  /** Risposta al tocco e all'hover dei bottoni (colore, filo). */
  tocco: 140,
  /** Una grande superficie cambia colore al massimo una volta ogni... (regola del Lab). */
  intervalloSuperfici: INTERVALLO_ANTI_LAMPEGGIO_MS,
} as const;

/** Distanza di arrivo dei fissi che compaiono (px): due passi brevi, mai un fade-up da lontano. */
export const SPOSTAMENTO_COMPARSA = 8;

/* ------------------------------------------------------------------ */
/* Vetrina: swipe e salti                                              */
/* ------------------------------------------------------------------ */

export const INERZIA = {
  /** Costante di decadimento della velocità dopo lo swipe (s): inerzia breve. */
  tau: 0.22,
  /** Velocità massima presa in carico (px/s) e soglia sotto cui si ferma. */
  vMax: 3000,
  vMin: 24,
} as const;

export const SALTI = {
  /** Oltre questa distanza (in altezze di finestra) il salto a un banco è istantaneo (ux 2.6). */
  finestreMaxLiscio: 3,
} as const;

/**
 * Bordo sinistro dell'area viva della vetrina (px), lo stesso della gabbia
 * dell'art-director (`--mad-margine-sx` in tokens.css): 20 sotto 640 px,
 * 24 fino a 1024, poi 248 (l'asse di MADRE) più il centraggio oltre 1680.
 */
export function margineVivo(w: number): number {
  if (w >= 1024) return 248 + Math.max(0, (w - 1680) / 2);
  if (w >= 640) return 24;
  return 20;
}

/* ------------------------------------------------------------------ */
/* Variabili CSS scritte una volta su .mad-root                         */
/* ------------------------------------------------------------------ */

export type VariabiliMotion = Readonly<Record<`--mad-${'curva' | 'durata' | 'spostamento'}-${string}`, string>>;

function ms(valore: number): string {
  return `${Math.round(valore)}ms`;
}

/**
 * Curve e durate per le transizioni CSS. Le scrive Madre.tsx come style di
 * `.mad-root` (con `useVariabiliMotion()` di useMotionVars.ts). Con reduced
 * motion le durate di movimento sono 0 (stato finale immediato); resta solo
 * la dissolvenza del canvas GL, che protegge da un cambio brusco di
 * luminosità su una grande superficie (la pasta in 3D sopra quella in CSS).
 */
export function variabiliMotion(ridotto: boolean): VariabiliMotion {
  const movimento = (valore: number): string => ms(ridotto ? 0 : valore);
  return {
    '--mad-curva-affonda': BEZIER_CSS.affonda,
    '--mad-curva-risale': BEZIER_CSS.risale,
    '--mad-curva-stende': BEZIER_CSS.stende,
    '--mad-curva-posa': BEZIER_CSS.posa,
    '--mad-curva-torna': BEZIER_CSS.torna,
    '--mad-curva-piega': BEZIER_CSS.piega,
    '--mad-curva-compare': BEZIER_CSS.compare,
    '--mad-curva-lineare': BEZIER_CSS.lineare,
    '--mad-durata-gl': ms(TEMPI.glEntrata),
    '--mad-durata-gl-uscita': ms(TEMPI.glUscita),
    '--mad-durata-colore': movimento(TEMPI.colore),
    '--mad-durata-comparsa': movimento(TEMPI.comparsa),
    '--mad-durata-scomparsa': movimento(TEMPI.scomparsa),
    '--mad-durata-piega': movimento(TEMPI.piega),
    '--mad-durata-spunta': movimento(TEMPI.spunta),
    '--mad-durata-barra': movimento(TEMPI.barra),
    '--mad-durata-tocco': movimento(TEMPI.tocco),
    '--mad-spostamento-comparsa': `${ridotto ? 0 : SPOSTAMENTO_COMPARSA}px`,
  };
}
