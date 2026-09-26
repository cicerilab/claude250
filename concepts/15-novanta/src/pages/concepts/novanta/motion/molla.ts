/**
 * NOVANTA · molla critica senza rimbalzo (motion-designer).
 *
 * Serve in due soli punti del rotore:
 * - **presa**: si tocca il disco lontano dal braccio, il braccio raggiunge il
 *   dito in circa 150 ms e da lì lo segue 1:1;
 * - **rotella**: i delta della rotella o del trackpad spostano un obiettivo e
 *   il braccio lo insegue morbido; quando la rotella tace, il rotore passa alla
 *   frenata verso l'aggancio.
 *
 * La molla è **critica** (smorzamento 1) e integrata in forma chiusa sul `dt`
 * del ticker: lo stesso risultato con 1 passo da 100 ms o 6 da 16,7 ms. In più
 * una regola impedisce il sorpasso: se la velocità verso l'obiettivo è così
 * alta da portare oltre (|v| > ω·|x|), viene ridotta al limite. Una molla
 * critica non oscilla, ma con una spinta forte può superare l'obiettivo una
 * volta: qui non succede mai (creative-director: "una spalla che si muove bene
 * non rimbalza").
 *
 * Modulo puro: nessun accesso a window/document.
 */

export interface ParametriMolla {
  /** Frequenza naturale in Hz: più alta, più rapida. */
  frequenza: number;
}

/**
 * Preset. Tempo di assestamento (entro 0,1° su un salto di 30°):
 * presa ≈ 0,19 s, rotella ≈ 0,33 s (vedi `tempoDiAssestamento`).
 */
export const MOLLE = {
  /** Il braccio che raggiunge il dito dopo un tocco lontano sul disco. */
  presa: { frequenza: 7 },
  /** Il braccio che insegue i delta della rotella e del trackpad. */
  rotella: { frequenza: 4 },
} as const satisfies Record<string, ParametriMolla>;

export type NomeMolla = keyof typeof MOLLE;

/** Sotto queste soglie la molla è ferma e vale esattamente l'obiettivo. */
const QUIETE_POSIZIONE = 0.01; // gradi
const QUIETE_VELOCITA = 0.5; // gradi al secondo
/** Passo massimo accettato (s): oltre, il frame è una pausa (il ticker limita già a 0,05). */
const DT_MASSIMO = 0.1;

export class MollaCritica {
  valore: number;
  velocita: number;
  obiettivo: number;
  private omega: number;

  constructor(iniziale = 0, parametri: ParametriMolla = MOLLE.rotella) {
    this.valore = iniziale;
    this.velocita = 0;
    this.obiettivo = iniziale;
    this.omega = 2 * Math.PI * Math.max(0.01, parametri.frequenza);
  }

  /** Cambia la rigidità senza toccare posizione e velocità. */
  imposta(parametri: ParametriMolla): void {
    this.omega = 2 * Math.PI * Math.max(0.01, parametri.frequenza);
  }

  /** Riparte da `valore` con velocità `velocita`, obiettivo invariato. */
  riparti(valore: number, velocita = 0): void {
    this.valore = valore;
    this.velocita = velocita;
  }

  /** Salto immediato: posizione = obiettivo = valore, velocità 0. */
  salta(valore: number): void {
    this.valore = valore;
    this.obiettivo = valore;
    this.velocita = 0;
  }

  get ferma(): boolean {
    return (
      Math.abs(this.valore - this.obiettivo) < QUIETE_POSIZIONE &&
      Math.abs(this.velocita) < QUIETE_VELOCITA
    );
  }

  /**
   * Avanza di `dt` secondi. Restituisce true se è ancora in moto dopo il
   * passo; false se si è fermata (e allora vale esattamente l'obiettivo).
   */
  passo(dt: number): boolean {
    if (this.ferma) {
      this.valore = this.obiettivo;
      this.velocita = 0;
      return false;
    }
    const h = dt <= 0 ? 0 : Math.min(dt, DT_MASSIMO);
    if (h === 0) return true;

    const w = this.omega;
    const x0 = this.valore - this.obiettivo;
    let v0 = this.velocita;

    // Nessun sorpasso: x(t) = (x0 + (v0 + w·x0)·t)·e^(−wt) attraversa lo zero
    // solo se v0 + w·x0 ha segno opposto a x0. Si limita v0 a −w·x0.
    if (x0 > 0 && v0 < -w * x0) v0 = -w * x0;
    else if (x0 < 0 && v0 > -w * x0) v0 = -w * x0;

    const e = Math.exp(-w * h);
    const c = v0 + w * x0;
    const x = (x0 + c * h) * e;
    const v = (v0 - w * c * h) * e;

    this.valore = this.obiettivo + x;
    this.velocita = v;

    if (this.ferma) {
      this.valore = this.obiettivo;
      this.velocita = 0;
      return false;
    }
    return true;
  }
}

/**
 * Tempo (s) perché una molla critica ferma, spostata di `distanza`, arrivi
 * entro `tolleranza` dall'obiettivo. Solo per documentazione e verifiche.
 */
export function tempoDiAssestamento(
  parametri: ParametriMolla,
  distanza: number,
  tolleranza: number,
): number {
  const w = 2 * Math.PI * Math.max(0.01, parametri.frequenza);
  const d = Math.abs(distanza);
  if (d <= tolleranza) return 0;
  // x(t) = d (1 + w t) e^(−w t): è decrescente, si cerca per bisezione.
  let basso = 0;
  let alto = 10;
  for (let i = 0; i < 60; i += 1) {
    const t = (basso + alto) / 2;
    const x = d * (1 + w * t) * Math.exp(-w * t);
    if (x > tolleranza) basso = t;
    else alto = t;
  }
  return alto;
}
