/**
 * IMPRONTA · qualità adattiva del WebGL (shader-engineer)
 *
 * Due decisioni, tutte e due da tech-architect §8:
 *
 * 1. QUANTI PIXEL. Il DPR del canvas è il minore tra:
 *    - il devicePixelRatio del dispositivo;
 *    - il tetto per tipo di dispositivo: 1,75 con puntatore grossolano
 *      (telefoni, tablet), 1,5 con puntatore fine (desktop);
 *    - quello che tiene il drawing buffer sotto i 3,5 milioni di pixel;
 *    - meno la riduzione adattiva (passi di 0,25), mai sotto 1 (o sotto il
 *      DPR del dispositivo, se è già minore di 1).
 *
 * 2. SE CONTINUARE. Media mobile del tempo frame su 30 campioni:
 *    - sopra 20 ms si scende di 0,25 di DPR (poi si riparte a contare da zero,
 *      così ogni passo si giudica sui suoi frame);
 *    - già al DPR minimo, se la media resta sopra 1000/24 ms (sotto 24 fps)
 *      per 3 secondi di orologio, si passa al fallback CSS.
 *
 * Il campione è il `dt` del ticker (secondi, limitato a 50 ms): si prende
 * solo nei frame in cui si è disegnato E anche il frame prima aveva
 * disegnato (render continuo: scroll, luce, pressa, onda), e mai nei frame
 * di cottura delle maschere. Il limite a 50 ms del ticker non conta: 50 ms
 * sta già sopra entrambe le soglie. Il primo frame dopo un risveglio del
 * ticker vale 1/60 per contratto: è un campione ottimista, innocuo.
 *
 * Con `?gl=1` (forzatura del test o di chi lo vuole acceso) il DPR scende lo
 * stesso ma il GL non si spegne mai per lentezza: serve alle prove in
 * Chromium headless, dove SwiftShader (GPU software) disegna un frame in
 * centinaia di ms.
 *
 * Modulo puro: nessun accesso al browser, nessun import di three.
 */

/** Tetto del DPR con puntatore grossolano (telefoni e tablet). */
export const DPR_MAX_MOBILE = 1.75;
/** Tetto del DPR con puntatore fine (desktop). */
export const DPR_MAX_DESKTOP = 1.5;
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
 */
export function dprPerCanvas(
  dprDispositivo: number,
  w: number,
  h: number,
  grossolano: boolean,
  riduzione: number,
): number {
  const dispositivo = Number.isFinite(dprDispositivo) && dprDispositivo > 0 ? dprDispositivo : 1;
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
  /** false = mai spegnere per lentezza (forzatura `?gl=1`). */
  readonly puoSpegnere: boolean;
}

/**
 * Media mobile del tempo frame e decisione. Una istanza per ImprontaGL.
 * Non alloca a regime: buffer circolare fisso.
 */
export class Qualita {
  /** Riduzione adattiva del DPR accumulata (0, 0.25, 0.5 …). */
  riduzione = 0;

  private readonly puoSpegnere: boolean;
  private readonly buffer = new Float32Array(CAMPIONI);
  private indice = 0;
  private pieni = 0;
  private somma = 0;
  /** ms (orologio) da cui la media è sotto i 24 fps al DPR minimo; NaN = no. */
  private lentoDa = Number.NaN;
  constructor(opzioni: OpzioniQualita) {
    this.puoSpegnere = opzioni.puoSpegnere;
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
  }

  /**
   * Il render continuo si è interrotto (il ticker ha dormito): i 3 s di
   * lentezza devono essere consecutivi, quindi il conteggio riparte. La
   * media resta: è fatta di frame veri.
   */
  interrompi(): void {
    this.lentoDa = Number.NaN;
  }

  /**
   * Registra un frame di render continuo.
   * @param ms durata del frame (dt del ticker × 1000)
   * @param now orologio del frame (ms)
   * @param alMinimo il DPR è già al minimo (vedi dprAlMinimo)
   * @returns 'abbassa' = aumentare `riduzione` di PASSO_DPR (già fatto qui) e
   *          ridimensionare; 'spegni' = passare al fallback CSS; 'nulla'.
   */
  campione(ms: number, now: number, alMinimo: boolean): EsitoQualita {
    const v = Number.isFinite(ms) ? Math.max(0, Math.min(100, ms)) : 0;
    const vecchio = this.buffer[this.indice] ?? 0;
    this.buffer[this.indice] = v;
    this.indice = (this.indice + 1) % CAMPIONI;
    if (this.pieni < CAMPIONI) this.pieni += 1;
    else this.somma -= vecchio;
    this.somma += v;

    if (this.pieni < CAMPIONI) return 'nulla';
    const media = this.somma / this.pieni;

    if (!alMinimo) {
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
