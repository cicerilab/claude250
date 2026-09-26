/**
 * IMBRUNIRE · coreografia: tutte le durate, i ritardi, gli ordini e le soglie
 * del movimento. Unica fonte: CSS (tramite `variabili.ts`), telecamera,
 * interazioni e store leggono da qui.
 *
 * I soli eventi di movimento ammessi (CD §12, ux §10): accensione iniziale,
 * luci su/giù, entrata/uscita, carrello tra stanze vicine, scala, nastro,
 * luna del successo, parallasse ≤ 2° del tetto, comparsa del bottone "Lune"
 * su mobile, scorrimento della torre al successo. Nient'altro si muove.
 *
 * Regola anti-lampeggio (docs/ruoli-agent.md, ux §6.1): ogni grande superficie
 * cambia colore al massimo una volta ogni 500 ms; in tutta la sezione al
 * massimo 2 partenze di luce al secondo; ogni dissolvenza di luce dura
 * ≥ 900 ms (250 ms con reduced motion).
 *
 * Modulo puro: nessun accesso a window/document.
 */

import type { SlugCella } from '../state/store';

/* ------------------------------------------------------------------ */
/* Regola anti-lampeggio                                               */
/* ------------------------------------------------------------------ */

/** Intervallo minimo tra due cambi di luce della stessa superficie (ms). */
export const INTERVALLO_MIN_LUCE = 500;

/** Durata minima di una dissolvenza di luce a movimento pieno (ms). */
export const DISSOLVENZA_LUCE_MIN = 900;

/**
 * Dopo `anticipaAccensione()` (tutte le luci mancanti partono insieme) la
 * prima pubblicazione di `selezioneLuci` deve aspettare almeno questo tempo:
 * così nessuna cella appena partita verso "accesa" riparte verso "spenta"
 * prima di 500 ms.
 */
export const PAUSA_DOPO_ANTICIPO = INTERVALLO_MIN_LUCE;

/* ------------------------------------------------------------------ */
/* Accensione iniziale (CD §6.4)                                       */
/* ------------------------------------------------------------------ */

/**
 * Ordine della direzione: prima l'androne (c'è qualcuno), poi le camere in
 * ordine non meccanico, poi la colazione. Per ultimo il lampione del portico:
 * la strada si accende quando le finestre sono già calde.
 */
export const ORDINE_ACCENSIONE: readonly SlugCella[] = [
  'androne',
  'il-camino',
  'la-loggia',
  'la-corte',
  'il-noce',
  'sul-noncello',
  'la-soffitta',
  'il-campanile',
  'colazione',
  'portico',
];

/**
 * Intervallo tra un'accensione e la successiva (ms). Il CD dice 450; qui è
 * 500 per rispettare alla lettera "al massimo 1 cambio ogni 500 ms" e
 * "al massimo 2 partenze al secondo" (ux §6.1). La sequenza dura 450 ms in più.
 */
export const INTERVALLO_ACCENSIONE = 500;

/** Dissolvenza di ogni stanza nell'accensione iniziale (ms). */
export const DURATA_ACCENSIONE = 1400;

/** Ritardo d'accensione di una cella (ms dall'inizio della sequenza). */
export function ritardoAccensione(slug: SlugCella): number {
  const i = ORDINE_ACCENSIONE.indexOf(slug);
  return (i < 0 ? ORDINE_ACCENSIONE.length - 1 : i) * INTERVALLO_ACCENSIONE;
}

/** Durata totale della sequenza: dopo, lo store passa ad `accensione: 'fatta'`. */
export const DURATA_ACCENSIONE_TOTALE =
  (ORDINE_ACCENSIONE.length - 1) * INTERVALLO_ACCENSIONE + DURATA_ACCENSIONE;

/**
 * Attesa prima di far partire la sequenza dopo il montaggio: il primo tra
 * `fontsReady()` e questo tempo (tech-architect §6.4 punto 9).
 */
export const ATTESA_MAX_ACCENSIONE = 600;

/* ------------------------------------------------------------------ */
/* Luci su e giù per le notti scelte (CD §6.4, §7.3)                   */
/* ------------------------------------------------------------------ */

export const LUCE = {
  /** stanza che torna libera (o "Torna al palazzo" dopo il successo) */
  accendi: 1100,
  /** stanza occupata che si spegne */
  spegni: 1200,
  /** reduced motion: una sola partenza, stessa durata per su e giù */
  ridotta: 250,
  /** unità di sfalsamento tra celle vicine */
  sfalsamento: 120,
  /** calore al passaggio del puntatore o al fuoco (velatura +8%) */
  caloreEntra: 400,
  /** il calore che se ne va è più lento: nessun doppio cambio sotto 500 ms */
  caloreEsce: 600,
} as const;

/**
 * Posizione di ogni cella rispetto alla scala: colonna contata dalla scala
 * verso sinistra, piano contato dall'alto. Serve allo sfalsamento: le luci
 * cambiano come se il portiere camminasse dalla scala lungo i corridoi.
 */
const POSIZIONE: Readonly<Record<SlugCella, { colonna: number; piano: number }>> = {
  'la-soffitta': { colonna: 0, piano: 0 },
  'il-campanile': { colonna: 1, piano: 0 },
  'il-noce': { colonna: 2, piano: 0 },
  'sul-noncello': { colonna: 0, piano: 1 },
  'la-loggia': { colonna: 1, piano: 1 },
  'il-camino': { colonna: 2, piano: 1 },
  'la-corte': { colonna: 0, piano: 2 },
  colazione: { colonna: 1, piano: 2 },
  androne: { colonna: 2, piano: 2 },
  portico: { colonna: 3, piano: 2 },
};

/**
 * Ritardo fisso di una cella quando le luci cambiano per le notti (ms, 0..480).
 * È fisso per cella: due partenze consecutive della stessa cella restano
 * distanti quanto le partenze dello store (≥ 500 ms).
 */
export function ritardoLuce(slug: SlugCella): number {
  const p = POSIZIONE[slug];
  return p.colonna * LUCE.sfalsamento + p.piano * (LUCE.sfalsamento / 2);
}

/** Ritardo massimo di `ritardoLuce` (latenza massima della risposta visiva). */
export const RITARDO_LUCE_MAX = 3 * LUCE.sfalsamento + 2 * (LUCE.sfalsamento / 2);

/* ------------------------------------------------------------------ */
/* Telecamera (CD §6.2, §6.3, §6.6)                                    */
/* ------------------------------------------------------------------ */

export const CAMERA = {
  /** entrare: 1100 ms, curva soglia */
  entra: 1100,
  /** uscire: 800 ms, stessa curva sul percorso inverso */
  esci: 800,
  /** durata minima di un viaggio parziale (inversione a metà strada) */
  minimo: 280,
  /** dissolvenza incrociata con reduced motion, dall'elenco e da indirizzo diretto */
  dissolvenza: 250,
  /** campioni dei fotogrammi chiave: palazzo e strato Dentro restano agganciati */
  campioni: 32,
  /** lo strato Dentro compare tra questi due punti del percorso (0 = palazzo, 1 = dentro) */
  dissolvenzaDa: 0.16,
  dissolvenzaA: 0.5,
  /** di quanto la scatola Dentro avanza verso chi guarda, in frazioni della prospettiva */
  camminata: 0.55,
  /** passo breve nella stanza quando si entra in dissolvenza (senza reduced motion) */
  passoSoglia: 0.12,
  passoSogliaDurata: 700,
  /** prospettiva di ripiego se quella calcolata non si legge (px) */
  prospettivaRipiego: 900,
  /** il viaggio vero parte solo se il fondo della cella va ingrandito almeno così */
  scalaMinima: 1.05,
} as const;

/** Il pannello della stanza arriva quando il passo sta frenando. */
export const PANNELLO = {
  /** ritardo rispetto all'inizio dell'entrata (ms) */
  ritardo: 680,
  durata: 420,
  /** spostamento d'arrivo su desktop (px, da destra) */
  spostamento: 24,
  /** uscita del pannello prima dell'uscita della camera */
  uscita: 180,
  /** nel carrello e nella scala: rientro del pannello dopo la stanza nuova */
  rientroRitardo: 200,
  rientro: 240,
} as const;

/** Carrello laterale tra stanze dello stesso piano e scala tra i piani. */
export const PASSAGGIO = {
  /** la stanza vecchia si volta e va al buio */
  buio: 480,
  /** la stanza nuova arriva dalla parte opposta */
  rientro: 700,
  /**
   * Tempo minimo tra l'inizio del buio e l'inizio del rientro: la parete di
   * fondo cambia luminosità al massimo una volta ogni 500 ms.
   */
  pausaMinima: INTERVALLO_MIN_LUCE + 20,
  /** fotogrammi di attesa dopo il cambio di stanza (commit di React) */
  frameDopoCambio: 2,
  /** spostamento laterale in frazioni della larghezza dello strato */
  carrelloSpostamento: 0.22,
  /** rotazione della testa verso la porta (gradi) */
  carrelloRotazione: 3,
  /** spostamento verticale in frazioni dell'altezza dello strato */
  scalaSpostamento: 0.2,
  /** lo sguardo che sale o scende con i gradini (gradi) */
  scalaRotazione: 3,
} as const;

/* ------------------------------------------------------------------ */
/* Parallasse del tetto (CD §4, ux §2.2)                               */
/* ------------------------------------------------------------------ */

export const PARALLASSE = {
  /** rotazione massima (gradi), mai oltre 2 */
  gradiMax: 2,
  /** frazione di distanza coperta in un frame a 60 Hz */
  inseguimento: 0.06,
  /** sotto questa differenza (gradi) il valore si ferma e il ticker dorme */
  riposo: 0.004,
  /** decimali scritti nella variabile CSS */
  decimali: 3,
} as const;

/* ------------------------------------------------------------------ */
/* Nastro delle lune (CD §7.2-7.3, ux §5.4)                            */
/* ------------------------------------------------------------------ */

export const NASTRO = {
  /** attrito dell'inerzia: v *= exp(-attrito · dt) */
  attrito: 4.2,
  /** sotto questa velocità (px/s) l'inerzia si ferma */
  velocitaMinima: 14,
  /** fascia ai bordi in cui il nastro scorre da solo durante la selezione (px) */
  zonaBordo: 56,
  /** velocità massima dello scorrimento al bordo (px/s), crescita quadratica */
  velocitaBordo: 900,
  /** mobile: tenuta prima che il trascinamento su una luna selezioni (ms) */
  tenuta: 120,
  /** mobile: spostamento orizzontale che trasforma il gesto in selezione (px) */
  sogliaSelezione: 8,
  /** annuncio della riga di stato dopo l'ultimo cambio (ms) */
  annuncio: 500,
  /** frecce ‹ ›: scorrimento di un mese (ms, nativo "smooth") */
  frecce: 420,
  /** le fasi calcolate entrano in dissolvenza (CD §7.4) */
  fasi: 300,
} as const;

/* ------------------------------------------------------------------ */
/* Interfaccia (la velocità rapida)                                    */
/* ------------------------------------------------------------------ */

export const INTERFACCIA = {
  /** bottoni, fuoco, piccoli cambi di stato */
  rapida: 180,
  /** bottone "Lune" in basso a destra su mobile (transform) */
  bottoneLune: 240,
  /** fogli dal basso: apertura, chiusura, ritorno dopo il trascinamento */
  foglio: 420,
  /** seconda foto della stanza: dissolvenza incrociata, mai automatica */
  secondaFoto: 600,
  /** finestra dell'ora d'arrivo che si accende */
  oraArrivo: 400,
  /** foto della parete che arriva dopo l'intonaco (S5) */
  fotoCaricata: 300,
} as const;

/* ------------------------------------------------------------------ */
/* Successo (CD §7.7, ux §5.6)                                         */
/* ------------------------------------------------------------------ */

/**
 * Sequenza dopo l'invio riuscito, in ms dalla fine dell'uscita dalla stanza.
 * Tre eventi distinti, ognuno ≥ 500 ms dopo il precedente.
 */
export const SUCCESSO = {
  /** si spengono tutte le altre luci (LUCE.spegni, con ritardoLuce) */
  spegniAltre: 0,
  /** la luna di stasera lascia il posto a quella della prima notte */
  luna: 520,
  /** durata della dissolvenza delle due lune */
  lunaDurata: 1200,
  /** la luna nuova sale di poco mentre compare (px); 0 con reduced motion */
  lunaSalita: 18,
  /** la frase compare (solo opacità, nessuno spostamento) */
  frase: 1040,
  fraseDurata: 300,
} as const;

/** Comportamento dello scorrimento programmato (torre al successo, fuoco in torre). */
export function comportamentoScorrimento(ridotto: boolean): 'smooth' | 'auto' {
  return ridotto ? 'auto' : 'smooth';
}
