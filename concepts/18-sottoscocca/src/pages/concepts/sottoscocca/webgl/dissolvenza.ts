/**
 * SOTTOSCOCCA · dissolvenza incrociata del GL con reduced motion
 * (shader-engineer; tech-architect §9.3, motion-designer §6.6).
 *
 * Con `prefers-reduced-motion` la quota scatta al plateau: la camera passa
 * da un'inquadratura ferma all'altra senza volo. Il salto non deve essere un
 * taglio netto di tutta la finestra (grandi superfici: mai un salto, al
 * massimo un cambio ogni 500 ms), quindi:
 *
 * 1. dopo ogni render in modalità ridotta il frame si copia su una tela 2D
 *    fuori schermo (`memoria`), nello stesso task del render (il drawing
 *    buffer è ancora valido anche senza `preserveDrawingBuffer`);
 * 2. quando ScenaGL vede uno scatto (binario o discesa che saltano tra due
 *    render), prima di disegnare la nuova inquadratura copia la memoria sulla
 *    tela sovrapposta (`sopra`, dentro lo strato GL, sopra il canvas) a
 *    opacità piena;
 * 3. nella fase `write` dei frame seguenti la tela sovrapposta si ridisegna
 *    con alpha che scende linearmente a 0 in 200 ms. Nessun rAF proprio,
 *    nessuna transizione CSS (l'opacità di tutto lo strato resta quella
 *    calda `--ssc-opacita-scena`, scritta da ScenaGL su entrambe le tele).
 *
 * La tela sovrapposta ha la stessa misura del drawing buffer del canvas GL.
 * Nessun accesso al browser a livello di modulo.
 */

import { DURATE } from '../motion/choreography';

/** Stili fissi della tela sovrapposta (stessa scatola del canvas GL). */
const STILE_SOPRA: Readonly<Record<string, string>> = {
  position: 'absolute',
  inset: '0',
  display: 'block',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  visibility: 'hidden',
};

export class Dissolvenza {
  /** Tela visibile sopra il canvas GL durante la dissolvenza. */
  readonly sopra: HTMLCanvasElement;

  private readonly memoria: HTMLCanvasElement;
  private readonly ctxSopra: CanvasRenderingContext2D | null;
  private readonly ctxMemoria: CanvasRenderingContext2D | null;
  private haMemoria = false;
  private inizio = Number.NaN;
  private ultimoAlpha = -1;
  private readonly durata: number;

  constructor(strato: HTMLElement) {
    this.durata = DURATE.dissolvenzaRidotta;
    this.sopra = document.createElement('canvas');
    this.sopra.className = 'ssc-gl-dissolvenza';
    this.sopra.setAttribute('aria-hidden', 'true');
    this.sopra.setAttribute('data-sscvar', '');
    Object.assign(this.sopra.style, STILE_SOPRA);
    strato.appendChild(this.sopra);
    this.memoria = document.createElement('canvas');
    this.ctxSopra = this.sopra.getContext('2d', { alpha: true });
    this.ctxMemoria = this.memoria.getContext('2d', { alpha: false });
  }

  /** true mentre la dissolvenza è in corso (il ticker deve restare sveglio). */
  get attiva(): boolean {
    return !Number.isNaN(this.inizio);
  }

  /** Misura del drawing buffer: le tele la seguono, la memoria si svuota. */
  ridimensiona(larghezza: number, altezza: number): void {
    const w = Math.max(1, Math.round(larghezza));
    const h = Math.max(1, Math.round(altezza));
    if (this.memoria.width !== w || this.memoria.height !== h) {
      this.memoria.width = w;
      this.memoria.height = h;
      this.sopra.width = w;
      this.sopra.height = h;
      this.haMemoria = false;
      this.ferma();
    }
  }

  /** Copia l'ultimo frame disegnato (chiamare subito dopo `renderer.render`). */
  ricorda(sorgente: HTMLCanvasElement): void {
    if (this.ctxMemoria === null || this.attiva) return;
    this.ctxMemoria.drawImage(sorgente, 0, 0, this.memoria.width, this.memoria.height);
    this.haMemoria = true;
  }

  /** Dimentica il frame ricordato (contesto perso, uscita dalla modalità ridotta). */
  dimentica(): void {
    this.haMemoria = false;
    this.ferma();
  }

  /**
   * Comincia la dissolvenza dall'ultimo frame ricordato (chiamare PRIMA di
   * disegnare la nuova inquadratura). Restituisce false se non c'è niente da
   * dissolvere.
   */
  avvia(now: number): boolean {
    if (!this.haMemoria || this.ctxSopra === null) return false;
    this.inizio = now;
    this.ultimoAlpha = -1;
    this.disegna(1);
    this.sopra.style.visibility = 'visible';
    return true;
  }

  /** Fase `write`: alpha lineare 1 → 0 in 200 ms. true = serve un altro frame. */
  passo(now: number): boolean {
    if (!this.attiva) return false;
    const t = (now - this.inizio) / this.durata;
    if (!(t < 1)) {
      this.ferma();
      return false;
    }
    this.disegna(1 - Math.max(0, t));
    return true;
  }

  dispose(): void {
    this.ferma();
    this.sopra.remove();
    this.memoria.width = 1;
    this.memoria.height = 1;
    this.sopra.width = 1;
    this.sopra.height = 1;
  }

  private disegna(alpha: number): void {
    const ctx = this.ctxSopra;
    if (ctx === null) return;
    const a = Math.round(alpha * 255) / 255;
    if (a === this.ultimoAlpha) return;
    this.ultimoAlpha = a;
    ctx.clearRect(0, 0, this.sopra.width, this.sopra.height);
    ctx.globalAlpha = a;
    ctx.drawImage(this.memoria, 0, 0);
    ctx.globalAlpha = 1;
  }

  private ferma(): void {
    this.inizio = Number.NaN;
    this.ultimoAlpha = -1;
    this.sopra.style.visibility = 'hidden';
  }
}
