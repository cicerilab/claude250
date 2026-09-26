/**
 * BATTIFILO · sequenza di battute sui lati della finestra (Misura e manda).
 *
 * Contratto di tech-architect §7.2. Quando entrambe le misure sono valide il
 * filo batte quattro volte (sopra, destra, sotto, sinistra, 120 ms tra una
 * battuta e l'altra) e traccia il rettangolo della luce; se cambia una misura
 * si ribatte solo il lato che cambia; con l'invio in corso c'è una battuta
 * lunga su tutto il perimetro.
 *
 * Ogni lato ha due valori, entrambi 0..1:
 * - `alzata(lato)`: il filo su quel lato si solleva (primo 35% del lato) e
 *   ricade. Chi disegna lo usa come `alza` di `pathFiloTra()` moltiplicato
 *   per `FINESTRA.ampiezzaAlzata` (negativo = fuori dal rettangolo);
 * - `progresso(lato)`: il gesso del lato, che dopo l'impatto si apre dal
 *   CENTRO verso i due capi (il filo colpisce prima dove è stato lasciato).
 *   Per lo `stroke-dasharray` c'è `trattoDalCentro()`.
 *
 * Reduced motion: `avvia` porta subito i lati a 1, nessuna alzata.
 * Nessun accesso a window/document: il tempo è il dt del ticker.
 */

import { FINESTRA } from './choreography';
import { clamp01, posa } from './easing';

export type Lato = 'sopra' | 'destra' | 'sotto' | 'sinistra';

/** Ordine della battuta a quattro lati (in senso orario, come si traccia in cantiere). */
export const LATI: readonly Lato[] = ['sopra', 'destra', 'sotto', 'sinistra'];

export interface Battute {
  /** Batte i `lati` in ordine, `passoMs` tra l'inizio di uno e il successivo. Gli altri lati restano come sono. */
  avvia(lati: readonly Lato[], passoMs?: number, durataLatoMs?: number): void;
  /** Battuta lunga su tutto il perimetro (invio in corso): un lato dopo l'altro, senza pause. */
  perimetro(durataMs?: number): void;
  /** 0..1: quanto gesso c'è sul lato (1 = battuto). */
  progresso(lato: Lato): number;
  /** 0..1: quanto è sollevato il filo sul lato in questo istante (0 fuori dalla battuta). */
  alzata(lato: Lato): number;
  /** Porta i lati (tutti se omesso) a battuto, senza animazione (bozza ritrovata, già mandata). */
  completa(lati?: readonly Lato[]): void;
  /** Porta i lati (tutti se omesso) a non battuto (filo teso o tratteggiato). */
  azzera(lati?: readonly Lato[]): void;
  /** true se almeno un lato sta battendo. */
  readonly inCorso: boolean;
  /** Fase 'update' del ticker. true = ancora in moto. */
  tick(dt: number): boolean;
}

interface StatoLato {
  /** Valore a riposo (0 o 1) o di partenza. */
  valore: number;
  /** ms dell'orologio interno in cui parte la battuta; null = fermo. */
  inizio: number | null;
  durata: number;
  /** Frazione del lato dedicata all'alzata del filo prima del colpo. */
  frazioneAlzata: number;
}

function nuovoLato(): StatoLato {
  return { valore: 0, inizio: null, durata: FINESTRA.durataLato, frazioneAlzata: FINESTRA.alzata };
}

/** Alzata del filo in 0..1 per `k` in 0..1 della sua fase: sale per il 60%, ricade accelerando. */
function curvaAlzata(k: number): number {
  const x = clamp01(k);
  if (x < 0.6) {
    const s = x / 0.6;
    return 1 - (1 - s) * (1 - s);
  }
  const d = (x - 0.6) / 0.4;
  return 1 - d * d;
}

export function creaBattute(ridotto: () => boolean): Battute {
  const lati: Record<Lato, StatoLato> = {
    sopra: nuovoLato(),
    destra: nuovoLato(),
    sotto: nuovoLato(),
    sinistra: nuovoLato(),
  };
  let orologio = 0;

  const u = (l: StatoLato): number => {
    if (l.inizio === null) return -1;
    return (orologio - l.inizio) / Math.max(1, l.durata);
  };

  const imposta = (quali: readonly Lato[], valore: number): void => {
    for (const lato of quali) {
      const l = lati[lato];
      l.valore = valore;
      l.inizio = null;
    }
  };

  const programma = (quali: readonly Lato[], passo: number, durata: number, frazioneAlzata: number): void => {
    if (ridotto()) {
      imposta(quali, 1);
      return;
    }
    const partenza = orologio;
    quali.forEach((lato, i) => {
      const l = lati[lato];
      l.valore = 0;
      l.inizio = partenza + i * Math.max(0, passo);
      l.durata = Math.max(1, durata);
      l.frazioneAlzata = frazioneAlzata;
    });
  };

  const inCorso = (): boolean => LATI.some((lato) => lati[lato].inizio !== null);

  return {
    avvia(quali: readonly Lato[], passoMs: number = FINESTRA.passo, durataLatoMs: number = FINESTRA.durataLato): void {
      programma(quali, passoMs, durataLatoMs, FINESTRA.alzata);
    },

    perimetro(durataMs: number = FINESTRA.invio.durata): void {
      const quarto = Math.max(1, durataMs / LATI.length);
      programma(LATI, quarto, quarto, FINESTRA.invio.alzata);
    },

    progresso(lato: Lato): number {
      const l = lati[lato];
      const t = u(l);
      if (t < 0) return l.valore;
      if (t <= l.frazioneAlzata) return 0;
      if (t >= 1) return 1;
      return posa((t - l.frazioneAlzata) / (1 - l.frazioneAlzata));
    },

    alzata(lato: Lato): number {
      const l = lati[lato];
      const t = u(l);
      if (t <= 0 || t >= l.frazioneAlzata) return 0;
      return curvaAlzata(t / l.frazioneAlzata);
    },

    completa(quali: readonly Lato[] = LATI): void {
      imposta(quali, 1);
    },

    azzera(quali: readonly Lato[] = LATI): void {
      imposta(quali, 0);
    },

    get inCorso(): boolean {
      return inCorso();
    },

    tick(dt: number): boolean {
      if (!inCorso()) {
        orologio = 0;
        return false;
      }
      orologio += Math.max(0, dt) * 1000;
      for (const lato of LATI) {
        const l = lati[lato];
        if (l.inizio !== null && orologio - l.inizio >= l.durata) {
          l.valore = 1;
          l.inizio = null;
        }
      }
      return inCorso();
    },
  };
}

/**
 * `stroke-dasharray` e `stroke-dashoffset` per un lato lungo `lunghezza` di
 * cui è battuta la frazione `p`, aperta dal centro: visibile il tratto
 * [(L − a)/2, (L + a)/2] con a = L · p. Numeri nelle unità del path.
 */
export function trattoDalCentro(p: number, lunghezza: number): { dasharray: string; dashoffset: number } {
  const L = Math.max(0, lunghezza);
  const a = L * clamp01(p);
  return {
    dasharray: `${round2(a)} ${round2(L + 1)}`,
    dashoffset: round2(-(L - a) / 2),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
