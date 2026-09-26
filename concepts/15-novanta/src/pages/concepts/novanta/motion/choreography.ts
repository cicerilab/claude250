/**
 * NOVANTA · coreografia: tutte le durate, le soglie e le distanze del
 * movimento in un posto solo (motion-designer).
 *
 * Tre tempi e basta (trend-researcher P9): 180 ms il cambio di contenuto,
 * 350 ms l'aggancio del braccio, 400-600 ms l'arco del ciclo. Il resto sono
 * derivati di questi tre o soglie di input. Ogni movimento ha una causa: il
 * dito, la rotella o un clic muovono il braccio; il braccio cambia il
 * contenuto. Niente si muove da solo, tranne l'invito (una volta).
 *
 * `motion.css` ripete i valori CSS come variabili `--nov-motion-*` su
 * `.nov-root`: `variabiliMotion()` è la fonte e il doc spiega come verificare
 * che coincidano.
 *
 * Modulo puro: nessun accesso a window/document.
 */

import { FRENATA_CSS, clamp } from './easing';

/* ------------------------------------------------------------------ */
/* Il braccio                                                          */
/* ------------------------------------------------------------------ */

/** Aggancio del braccio su un salto di un angolo (30°), in ms. */
export const DUR_AGGANCIO = 350;

/** Raggio del magnete degli agganci, in gradi (metà del passo tra due angoli). */
export const MAGNETE = 15;

/** Un lancio veloce prosegue al massimo di un angolo, in gradi. */
export const INERZIA_MAX = 30;

/**
 * Tempo di proiezione del lancio (s): dove arriverebbe il braccio lasciato con
 * velocità v è `rilascio + v · TAU_LANCIO`, limitato a ±INERZIA_MAX. Con 0,12 s
 * serve un lancio di 250°/s (un gesto deciso) per guadagnare un angolo intero.
 */
export const TAU_LANCIO = 0.12;

/** Sotto questa velocità (°/s) il rilascio non ha inerzia: si aggancia sul posto. */
export const VEL_MIN_LANCIO = 90;

/**
 * Distanza (°) oltre la quale un tocco sul disco non sposta il braccio di
 * colpo: il braccio raggiunge il dito con la molla "presa" (circa 150 ms) e
 * da lì lo segue 1:1.
 */
export const SOGLIA_PRESA = 6;

/** Con la rotella: silenzio (ms) dopo cui il braccio si aggancia (ux-architect §6.3). */
export const QUIETE_ROTELLA = 140;

/**
 * Durata minima (ms) di una corsa che eredita un lancio molto veloce: sotto
 * questo tempo la frenata non si vedrebbe.
 */
export const DUR_CORSA_MIN = 120;

/** Durata massima (ms) di una corsa lunga (0 → 180 con un clic su una parola). */
export const DUR_CORSA_MAX = DUR_AGGANCIO + 210;

/**
 * Durata di una corsa del braccio (o dell'anello) in funzione della distanza.
 * - fino a 30°: da 55% a 100% di `base` (un aggancio corto di 4° dura ~210 ms,
 *   non 350: sembrerebbe pigro);
 * - oltre 30°: +70 ms per ogni 30° in più, fino a `base + 210` (0 → 90 in
 *   490 ms, 0 → 180 in 560 ms). Il braccio attraversa gli angoli intermedi ma
 *   il contenuto cambia una volta sola (vedi `contenutoDuranteIlMoto`).
 * Con `base` diverso (l'anello) le proporzioni restano le stesse.
 */
export function durataCorsa(distanzaGradi: number, base: number = DUR_AGGANCIO): number {
  const d = Math.abs(distanzaGradi);
  if (d <= 30) return base * (0.55 + 0.45 * (d / 30));
  const extra = ((d - 30) / 30) * (base * 0.2);
  return Math.min(base + extra, base * 1.6);
}

/* ------------------------------------------------------------------ */
/* L'invito                                                            */
/* ------------------------------------------------------------------ */

/**
 * L'invito della manopola (creative-director §4.7): dopo `attesa` ms senza
 * input, una volta per sessione, la manopola si alza di `ampiezza` gradi e
 * ridiscende in `durata` ms. Mai con reduced motion.
 */
export const INVITO = { attesa: 3000, ampiezza: 6, durata: 1100 } as const;

/* ------------------------------------------------------------------ */
/* Il contenuto                                                        */
/* ------------------------------------------------------------------ */

/** Dissolvenza incrociata tra due angoli, in ms. */
export const DUR_DISSOLVENZA = 180;

/** Dissolvenza con reduced motion: più corta, senza spostamento. */
export const DUR_DISSOLVENZA_RIDOTTA = 120;

/** Spostamento del testo nel verso della rotazione, in px. */
export const SPOSTA_TESTO_PX = 8;

/**
 * Isteresi (°) del cambio di contenuto durante il trascinamento: il testo
 * cambia a 15° + 3° dal centro dell'angolo, così il dito fermo sul confine non
 * fa tremolare il contenuto avanti e indietro.
 */
export const ISTERESI_CONTENUTO = 3;

/** Passo tra due angoli di contenuto. */
export const PASSO_ANGOLI = 30;

/* ------------------------------------------------------------------ */
/* La prenotazione                                                     */
/* ------------------------------------------------------------------ */

/** L'arco del ciclo si completa in 400-600 ms (creative-director §4.4). */
export const DUR_ARCO_CICLO = [400, 600] as const;

/** Chiusura dell'arco del ciclo all'invio (dentro DUR_ARCO_CICLO). */
export const DUR_CICLO_CHIUDE = 520;

/** L'arco torna indietro se l'invio fallisce (più svelto della chiusura). */
export const DUR_CICLO_APRE = DUR_ARCO_CICLO[0];

/** Comparsa della linea sottile del controllo proposto. */
export const DUR_CICLO_PROPOSTA = DUR_DISSOLVENZA;

/** Aggancio dell'anello a un'ora libera: un'ora è un passo corto, 280 ms. */
export const DUR_AGGANCIO_ANELLO = 280;

/** La tacca di un'ora presa nel frattempo si spegne (S10). */
export const DUR_SPEGNI = 320;

/** Dopo il successo le tacche non scelte si attenuano (S12). */
export const DUR_ATTENUA = 400;

/** Opacità delle tacche attenuate dopo il successo (decorative, non testo). */
export const OPACITA_ATTENUATA = 0.35;

/* ------------------------------------------------------------------ */
/* Cambi di impaginazione su mobile                                    */
/* ------------------------------------------------------------------ */

/** A 90° su mobile il quadrante si riduce a fascia da 64 px e sale l'anello. */
export const DUR_FASCIA = 320;

/** Entrando nei campi, l'anello si riduce a 140 px e resta in alto. */
export const DUR_RIDUCI_ANELLO = 240;

/** Il braccietto del mini arco a 30° sale da 0 all'obiettivo, una volta. */
export const DUR_MINI_SALE = 400;

/* ------------------------------------------------------------------ */
/* Variabili CSS                                                       */
/* ------------------------------------------------------------------ */

export type VariabiliMotion = Readonly<Record<`--nov-motion-${string}`, string>>;

const ms = (v: number): string => `${Math.round(v)}ms`;

/**
 * Le variabili CSS del movimento, per la versione piena o ridotta. Sono
 * **già** scritte in `motion.css` su `.nov-root` e `.nov-root[data-motion="reduced"]`
 * (e sotto `@media (prefers-reduced-motion: reduce)` per la prima pittura):
 * non vanno messe inline sulla radice (regola: variabili scritte da JS solo
 * sugli elementi foglia `data-nov-var`). La funzione resta la fonte dei
 * valori per le verifiche e per chi ne ha bisogno in TS.
 */
export function variabiliMotion(ridotto: boolean): VariabiliMotion {
  return {
    '--nov-motion-curva': FRENATA_CSS,
    '--nov-motion-sposta': ridotto ? '0px' : `${SPOSTA_TESTO_PX}px`,
    '--nov-motion-dur-dissolvenza': ms(ridotto ? DUR_DISSOLVENZA_RIDOTTA : DUR_DISSOLVENZA),
    '--nov-motion-dur-ciclo-chiude': ms(ridotto ? 0 : DUR_CICLO_CHIUDE),
    '--nov-motion-dur-ciclo-apre': ms(ridotto ? 0 : DUR_CICLO_APRE),
    '--nov-motion-dur-proposta': ms(ridotto ? 0 : DUR_CICLO_PROPOSTA),
    '--nov-motion-dur-spegni': ms(ridotto ? 0 : DUR_SPEGNI),
    '--nov-motion-dur-attenua': ms(ridotto ? 0 : DUR_ATTENUA),
    '--nov-motion-opacita-attenuata': String(OPACITA_ATTENUATA),
    '--nov-motion-dur-fascia': ms(ridotto ? 0 : DUR_FASCIA),
    '--nov-motion-dur-riduci': ms(ridotto ? 0 : DUR_RIDUCI_ANELLO),
    '--nov-motion-dur-mini': ms(ridotto ? 0 : DUR_MINI_SALE),
  };
}

/** Durata effettiva della dissolvenza (ms) per chi deve aspettarne la fine in TS. */
export function durataDissolvenza(ridotto: boolean): number {
  return ridotto ? DUR_DISSOLVENZA_RIDOTTA : DUR_DISSOLVENZA;
}

/** Durata effettiva (ms) della chiusura dell'arco del ciclo, dentro DUR_ARCO_CICLO. */
export function durataCicloChiude(ridotto: boolean): number {
  return ridotto ? 0 : clamp(DUR_CICLO_CHIUDE, DUR_ARCO_CICLO[0], DUR_ARCO_CICLO[1]);
}

/* ------------------------------------------------------------------ */
/* Cambi di misura accompagnati (FLIP)                                 */
/* ------------------------------------------------------------------ */

/**
 * Accompagna un cambio di impaginazione (quadrante → fascia a 90° su mobile,
 * anello → 140 px entrando nei campi) senza animare larghezze o altezze:
 * 1. legge il rettangolo prima del cambio;
 * 2. `applica()` cambia classi o attributi (il layout salta subito);
 * 3. legge il rettangolo dopo, mette l'elemento dove era con un `transform`
 *    inverso e al frame successivo lo toglie: la transizione di `.nov-m-fascia`
 *    / `.nov-m-riduci` (motion.css) lo porta al posto nuovo con la frenata.
 * Con `ridotto` applica e basta. Due letture di layout per cambio, mai nel
 * ticker. Lo chiamano i section-builder (quadrante, prenota) in un handler o
 * in un effetto, mai durante il render.
 */
export function accompagnaCambio(el: HTMLElement | SVGElement, applica: () => void, ridotto: boolean): void {
  if (ridotto) {
    applica();
    return;
  }
  const prima = el.getBoundingClientRect();
  applica();
  const dopo = el.getBoundingClientRect();
  if (dopo.width < 1 || dopo.height < 1) return;
  const dx = prima.left - dopo.left;
  const dy = prima.top - dopo.top;
  const sx = prima.width / dopo.width;
  const sy = prima.height / dopo.height;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.005 && Math.abs(sy - 1) < 0.005) return;
  const stile = el.style;
  const transizione = stile.transition;
  stile.transition = 'none';
  stile.transformOrigin = '0 0';
  stile.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  // Forza il calcolo dello stato di partenza, poi lascia fare alla transizione CSS.
  void el.getBoundingClientRect();
  stile.transition = transizione;
  stile.transform = '';
  const pulisci = (e: Event): void => {
    if (e.target !== el) return;
    stile.transformOrigin = '';
    el.removeEventListener('transitionend', pulisci);
  };
  el.addEventListener('transitionend', pulisci);
}
