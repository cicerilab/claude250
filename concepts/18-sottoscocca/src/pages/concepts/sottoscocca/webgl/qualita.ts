/**
 * SOTTOSCOCCA · qualità adattiva del WebGL (shader-engineer).
 *
 * Due decisioni, tutte e due da tech-architect §10:
 *
 * 1. QUANTI PIXEL. Il DPR del canvas è il minore tra:
 *    - il devicePixelRatio del dispositivo;
 *    - il tetto per tipo di dispositivo: 1,5 con puntatore grossolano
 *      (telefoni, tablet), 2 con puntatore fine (desktop);
 *    - quello che tiene il drawing buffer sotto i 3,5 milioni di pixel;
 *    - meno la riduzione adattiva (passi di 0,25), mai sotto 1 (o sotto il
 *      DPR del dispositivo, se è già minore di 1).
 *    In modalità fermo (`?fermo=`) il DPR è quello del dispositivo: i fermi
 *    immagine hanno misure esatte (1600 × 900 a DPR 1, 750 × 1624 a DPR 2).
 *
 * 2. SE CONTINUARE. Media mobile del tempo frame su 30 frame disegnati di
 *    fila (la scena disegna solo quando qualcosa cambia):
 *    - sopra 20 ms si scende di 0,25 di DPR e si riparte a contare;
 *    - già al DPR minimo, se la media resta sotto i 24 fps per 3 secondi di
 *      orologio, si passa al fallback (`impostaGL('off', 'qualita')`).
 *    Con `?gl=1` o `?fermo=` il GL non si spegne mai per lentezza: serve alle
 *    prove in Chromium headless, dove SwiftShader impiega centinaia di ms.
 *
 * Modulo puro: nessun accesso al browser, nessun import di three.
 */

/** Tetto del DPR con puntatore grossolano (telefoni e tablet). */
export const DPR_MAX_MOBILE = 1.5;
/** Tetto del DPR con puntatore fine (desktop). */
export const DPR_MAX_DESKTOP = 2;
/** Pixel massimi del drawing buffer. */
export const PIXEL_MAX = 3_500_000;
/** Passo della riduzione adattiva del DPR. */
export const PASSO_DPR = 0.25;
/** DPR minimo a cui scende la riduzione adattiva. */
export const DPR_MINIMO = 1;
/** Campioni della media mobile. */
export const CAMPIONI = 30;
/** Sopra questa media (ms) si abbassa il DPR. */
export const SOGLIA_ABBASSA_MS = 20;
/** Sopra questa media (ms), al DPR minimo, si conta verso lo spegnimento (24 fps). */
export const SOGLIA_SPEGNI_MS = 1000 / 24;
/** Per quanto tempo (ms di orologio) la media deve restare sopra la soglia di spegnimento. */
export const DURATA_SPEGNI_MS = 3000;
/** Due render più distanti di così non sono "di fila": il campione non conta. */
export const DISTANZA_MAX_CAMPIONE_MS = 120;

export type EsitoQualita = 'nulla' | 'abbassa' | 'spegni';

/** Tetto del DPR per tipo di dispositivo. */
export function dprMassimo(grossolano: boolean): number {
  return grossolano ? DPR_MAX_MOBILE : DPR_MAX_DESKTOP;
}

/**
 * DPR da usare per il canvas.
 * @param dprDispositivo window.devicePixelRatio
 * @param w larghezza del canvas in px CSS
 * @param h altezza del canvas in px CSS
 * @param grossolano puntatore grossolano (telefono, tablet)
 * @param riduzione riduzione adattiva accumulata (multipli di PASSO_DPR)
 * @param esatto true in modalità fermo: il DPR del dispositivo, senza tetti
 */
export function dprPerCanvas(
  dprDispositivo: number,
  w: number,
  h: number,
  grossolano: boolean,
  riduzione: number,
  esatto = false,
): number {
  const dispositivo = Number.isFinite(dprDispositivo) && dprDispositivo > 0 ? dprDispositivo : 1;
  if (esatto) return dispositivo;
  const area = Math.max(1, w) * Math.max(1, h);
  const perPixel = Math.sqrt(PIXEL_MAX / area);
  const tetto = Math.min(dispositivo, dprMassimo(grossolano), perPixel);
  const pavimento = Math.min(DPR_MINIMO, dispositivo, perPixel);
  return Math.max(pavimento, tetto - Math.max(0, riduzione));
}

/** true se una riduzione in più non cambierebbe più il DPR (si è già al minimo). */
export function dprAlMinimo(dprDispositivo: number, w: number, h: number, grossolano: boolean, riduzione: number): boolean {
  const adesso = dprPerCanvas(dprDispositivo, w, h, grossolano, riduzione);
  const dopo = dprPerCanvas(dprDispositivo, w, h, grossolano, riduzione + PASSO_DPR);
  return dopo >= adesso - 1e-6;
}

export interface OpzioniQualita {
  /** false = mai spegnere per lentezza (`?gl=1`, `?fermo=`). */
  readonly puoSpegnere: boolean;
  /** false = mai abbassare il DPR (`?fermo=`: misure esatte). */
  readonly puoAbbassare: boolean;
}

/**
 * Media mobile del tempo frame e decisione. Una istanza per ScenaGL.
 * Non alloca a regime: buffer circolare fisso.
 */
export class Qualita {
  /** Riduzione adattiva del DPR accumulata (0, 0.25, 0.5 …). */
  riduzione = 0;

  private readonly puoSpegnere: boolean;
  private readonly puoAbbassare: boolean;
  private readonly buffer = new Float32Array(CAMPIONI);
  private indice = 0;
  private pieni = 0;
  private somma = 0;
  /** ms (orologio) da cui la media è sotto i 24 fps al DPR minimo; NaN = no. */
  private lentoDa = Number.NaN;
  /** Orologio dell'ultimo render (ms); NaN = nessuno. */
  private ultimoRender = Number.NaN;

  constructor(opzioni: OpzioniQualita) {
    this.puoSpegnere = opzioni.puoSpegnere;
    this.puoAbbassare = opzioni.puoAbbassare;
  }

  /** Media corrente in ms (0 se non ci sono ancora campioni). */
  get media(): number {
    return this.pieni === 0 ? 0 : this.somma / this.pieni;
  }

  /** Numero di campioni nella media. */
  get campioni(): number {
    return this.pieni;
  }

  /** Svuota la media (dopo un cambio di DPR, un resize, un ripristino di contesto). */
  azzera(): void {
    this.buffer.fill(0);
    this.indice = 0;
    this.pieni = 0;
    this.somma = 0;
    this.lentoDa = Number.NaN;
    this.ultimoRender = Number.NaN;
  }

  /**
   * Un render è avvenuto all'orologio `now` (ms). Se il precedente era di
   * fila (meno di DISTANZA_MAX_CAMPIONE_MS prima) la distanza tra i due è un
   * campione; altrimenti il render continuo era interrotto e il conteggio dei
   * 3 s di lentezza riparte (la media resta: è fatta di frame veri).
   * @param alMinimo il DPR è già al minimo (vedi dprAlMinimo)
   * @returns 'abbassa' = `riduzione` è già cresciuta di PASSO_DPR, va
   *          ridimensionato il canvas; 'spegni' = passare al fallback; 'nulla'.
   */
  render(now: number, alMinimo: boolean): EsitoQualita {
    const prima = this.ultimoRender;
    this.ultimoRender = now;
    if (Number.isNaN(prima)) return 'nulla';
    const ms = now - prima;
    if (!(ms > 0) || ms > DISTANZA_MAX_CAMPIONE_MS) {
      this.lentoDa = Number.NaN;
      return 'nulla';
    }
    return this.campione(ms, now, alMinimo);
  }

  private campione(ms: number, now: number, alMinimo: boolean): EsitoQualita {
    const v = Math.max(0, Math.min(100, ms));
    const vecchio = this.buffer[this.indice] ?? 0;
    this.buffer[this.indice] = v;
    this.indice = (this.indice + 1) % CAMPIONI;
    if (this.pieni < CAMPIONI) this.pieni += 1;
    else this.somma -= vecchio;
    this.somma += v;

    if (this.pieni < CAMPIONI) return 'nulla';
    const media = this.somma / this.pieni;

    if (!alMinimo && this.puoAbbassare) {
      this.lentoDa = Number.NaN;
      if (media > SOGLIA_ABBASSA_MS) {
        this.riduzione += PASSO_DPR;
        this.azzera();
        return 'abbassa';
      }
      return 'nulla';
    }

    if (media > SOGLIA_SPEGNI_MS) {
      if (Number.isNaN(this.lentoDa)) this.lentoDa = now;
      if (this.puoSpegnere && now - this.lentoDa >= DURATA_SPEGNI_MS) return 'spegni';
      return 'nulla';
    }
    this.lentoDa = Number.NaN;
    return 'nulla';
  }
}
