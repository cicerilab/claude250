/**
 * SOTTOSCOCCA · il motore del ponte (motion-designer).
 *
 * Prende gli OBIETTIVI calcolati da `percorso.ts` (quota, binario, discesa,
 * opacità, plateau) e li trasforma nei valori che la scena disegna:
 * - quota: inseguimento smorzato (lerp ~0,12 a frame, normalizzato sul dt,
 *   identico a 30, 60 o 120 Hz) + assestamento di 3,5 mm sui fermi quando
 *   arriva a un plateau salendo. Nessun rimbalzo, nessuna sovraelongazione;
 * - binario: sempre ricavato dalla quota inseguita (la camera va con l'auto);
 * - discesa: stesso inseguimento della quota;
 * - opacità della scena: inseguimento con velocità massima (anti-lampeggio);
 * - ruote: mezzo giro, una volta, quando le gomme si staccano da terra;
 * - evidenza dei pezzi: 0 → 1 in 250 ms con la curva `vernice`.
 *
 * Con reduced motion: quota, binario e discesa scattano al plateau (niente
 * valori intermedi, la dissolvenza la fa il GL), al massimo uno scatto ogni
 * 500 ms; ruote ferme; evidenza immediata; l'opacità passa in 200 ms.
 *
 * Nessun import dal browser: la classe vive nel ticker, riceve `dt` (s) e
 * `now` (ms) e scrive in un oggetto passato dal chiamante (di solito
 * `runtime`). Nessuna allocazione per frame.
 */

import type { IdPezzo, Quota } from '../content/lavori';
import { fermo, ruotaLibera, vernice } from './easing';
import { DURATE, INTERVALLO_MINIMO_GRANDI_SUPERFICI, PONTE, TOLLERANZA_PLATEAU_CM } from './choreography';
import { binarioDaQuota, type StatoPonte } from './percorso';

/* ------------------------------------------------------------------ */
/* Primitive                                                           */
/* ------------------------------------------------------------------ */

/** Passo massimo accettato (s): oltre, il frame è una pausa e non un salto. */
const DT_MASSIMO = 0.1;

/**
 * Lerp normalizzato sul tempo: `perFrame` è la frazione di distanza coperta
 * in un frame a 60 Hz. A qualsiasi frequenza il risultato dopo un secondo è
 * lo stesso. Sotto `quiete` si posa esattamente sull'obiettivo.
 */
export function seguiDt(corrente: number, obiettivo: number, perFrame: number, dt: number, quiete = 1e-4): number {
  const h = dt <= 0 ? 0 : Math.min(dt, DT_MASSIMO);
  const alfa = 1 - Math.pow(1 - perFrame, h * 60);
  const v = corrente + (obiettivo - corrente) * alfa;
  return Math.abs(obiettivo - v) < quiete ? obiettivo : v;
}

/** Avvicina `corrente` a `obiettivo` a velocità costante (unità al secondo). */
export function avvicina(corrente: number, obiettivo: number, velocita: number, dt: number): number {
  const h = dt <= 0 ? 0 : Math.min(dt, DT_MASSIMO);
  const passo = velocita * h;
  const d = obiettivo - corrente;
  if (Math.abs(d) <= passo) return obiettivo;
  return corrente + Math.sign(d) * passo;
}

/* ------------------------------------------------------------------ */
/* Contratto con il runtime                                            */
/* ------------------------------------------------------------------ */

/**
 * I campi di `state/runtime.ts` che il motore scrive (tech-architect §6.2).
 * `runtime` li ha tutti: lo scaffold passa direttamente `runtime`.
 */
export interface UscitaPonte {
  quota: { target: number; valore: number };
  binario: number;
  discesa: number;
  opacitaScena: number;
  ruote: number;
  evidenza: Partial<Record<IdPezzo, number>>;
}

/** Ingresso di un passo: obiettivi dal percorso, modalità, pezzi da evidenziare. */
export interface IngressoPonte {
  /** Da `statoDaScroll` (percorso.ts). */
  readonly obiettivo: StatoPonte;
  /** Reduced motion. */
  readonly ridotto: boolean;
  /**
   * Pezzi da evidenziare adesso: quelli del punto con la scheda aperta e
   * quelli del punto sotto il puntatore o con il fuoco (PUNTI[id].pezzi).
   */
  readonly evidenze: readonly IdPezzo[];
}

/* ------------------------------------------------------------------ */
/* Il motore                                                           */
/* ------------------------------------------------------------------ */

interface Transitorio {
  attivo: boolean;
  inizio: number;
}

export class MotorePonte {
  /** true se l'ultimo `passo` ha cambiato qualcosa che va ridisegnato. */
  cambiato = false;

  /** Quota "del carrello", senza assestamento. */
  private quota = 0;
  private discesa = 0;
  private opacita = 1;
  private inizializzato = false;

  /** Assestamento sui fermi. */
  private readonly assestamento: Transitorio = { attivo: false, inizio: 0 };
  private assestamentoArmato = false;
  private ultimoObiettivo = 0;

  /** Ruote. */
  private readonly giro: Transitorio = { attivo: false, inizio: 0 };
  private angoloBase = 0;
  private angolo = 0;
  private ruoteArmate = true;

  /** Evidenze: progresso lineare grezzo per pezzo (0..1). */
  private readonly grezzo = new Map<IdPezzo, number>();
  private readonly accesi = new Set<IdPezzo>();

  /** Reduced motion: ultimo scatto (ms) e stato mostrato. */
  private ultimoScatto = Number.NEGATIVE_INFINITY;
  private opacitaObiettivoRidotta = 1;

  /** Plateau raggiunto (entro 0,5 cm, fermo), o null. Per aria-current e aria-live. */
  get plateauRaggiunto(): Quota | null {
    return this.plateau;
  }

  private plateau: Quota | null = 0;

  /**
   * Porta tutto subito sugli obiettivi, senza movimento né ruote: primo
   * frame, arrivo da un'ancora nell'URL, cambio di orientamento, ritorno
   * da scheda nascosta. Le evidenze si allineano senza dissolvenza.
   */
  salta(ingresso: IngressoPonte, uscita: UscitaPonte): void {
    const o = ingresso.obiettivo;
    this.quota = o.quota;
    this.discesa = o.discesa;
    this.opacita = o.opacita;
    this.opacitaObiettivoRidotta = o.opacita;
    this.ultimoObiettivo = o.quota;
    this.assestamento.attivo = false;
    this.assestamentoArmato = false;
    this.giro.attivo = false;
    this.angoloBase = this.angolo;
    this.ruoteArmate = o.quota < PONTE.ruoteRiarmoCm;
    // Il salto non è un cambio visibile (primo frame, canvas non ancora in
    // vista, o ritorno da scheda nascosta): il prossimo scatto può partire subito.
    this.ultimoScatto = Number.NEGATIVE_INFINITY;
    this.accesi.clear();
    for (const id of ingresso.evidenze) this.accesi.add(id);
    this.grezzo.forEach((_, id) => {
      this.grezzo.set(id, this.accesi.has(id) ? 1 : 0);
    });
    this.accesi.forEach((id) => {
      this.grezzo.set(id, 1);
    });
    this.inizializzato = true;
    this.scrivi(uscita, o.quota, 0);
    this.plateau = o.plateau;
    this.cambiato = true;
  }

  /**
   * Un frame. Restituisce true se serve un altro frame (qualcosa si muove o
   * si aspetta lo scatto successivo). Dopo la chiamata `cambiato` dice se va
   * ridisegnato (runtime.markDirty()).
   */
  passo(dt: number, now: number, ingresso: IngressoPonte, uscita: UscitaPonte): boolean {
    if (!this.inizializzato) {
      this.salta(ingresso, uscita);
      return false;
    }
    this.cambiato = false;
    const o = ingresso.obiettivo;
    let inMoto = false;

    const q0 = this.quota;
    const d0 = this.discesa;
    const op0 = this.opacita;
    const a0 = this.angolo;

    if (ingresso.ridotto) {
      inMoto = this.passoRidotto(dt, now, o) || inMoto;
    } else {
      inMoto = this.passoPieno(dt, now, o) || inMoto;
    }

    // Opacità: mai più veloce di opacitaMaxAlSecondo (normale), 200 ms (ridotto).
    const velocitaOpacita = ingresso.ridotto
      ? 1000 / DURATE.dissolvenzaRidotta
      : PONTE.opacitaMaxAlSecondo;
    const obiettivoOpacita = ingresso.ridotto ? this.opacitaObiettivoRidotta : o.opacita;
    this.opacita = avvicina(this.opacita, obiettivoOpacita, velocitaOpacita, dt);
    if (this.opacita !== obiettivoOpacita) inMoto = true;

    // Evidenze.
    if (this.passoEvidenze(dt, ingresso)) inMoto = true;

    // Scarto dell'assestamento (solo verso il basso).
    let scarto = 0;
    if (this.assestamento.attivo) {
      const t = (now - this.assestamento.inizio) / PONTE.assestamentoMs;
      if (t >= 1) {
        this.assestamento.attivo = false;
      } else {
        scarto = -PONTE.assestamentoCm * fermo(t);
        inMoto = true;
      }
    }

    const valorePrima = uscita.quota.valore;
    const binarioPrima = uscita.binario;
    this.scrivi(uscita, o.quota, scarto);

    // Plateau raggiunto: obiettivo a plateau, quota ferma entro la tolleranza.
    const p = o.plateau;
    this.plateau =
      p !== null && Math.abs(this.quota - p) < TOLLERANZA_PLATEAU_CM && Math.abs(this.discesa - o.discesa) < 0.01
        ? p
        : null;

    this.cambiato =
      q0 !== this.quota ||
      d0 !== this.discesa ||
      op0 !== this.opacita ||
      a0 !== this.angolo ||
      valorePrima !== uscita.quota.valore ||
      binarioPrima !== uscita.binario ||
      this.evidenzeCambiate;

    return inMoto;
  }

  /* --------------------------- interni --------------------------- */

  private evidenzeCambiate = false;

  private passoPieno(dt: number, now: number, o: StatoPonte): boolean {
    let inMoto = false;

    // Armamento dell'assestamento: l'obiettivo è salito a un nuovo plateau.
    if (o.quota > this.ultimoObiettivo + 1e-6) this.assestamentoArmato = true;
    else if (o.quota < this.ultimoObiettivo - 1e-6) this.assestamentoArmato = false;
    this.ultimoObiettivo = o.quota;

    const primaQuota = this.quota;
    this.quota = seguiDt(this.quota, o.quota, PONTE.lerpPerFrame, dt, PONTE.quiete);
    if (this.quota !== o.quota) inMoto = true;

    // Arrivo su un plateau salendo: il carrello si posa sul dente.
    if (
      this.assestamentoArmato &&
      o.plateau !== null &&
      o.plateau > 0 &&
      o.quota === o.plateau &&
      o.plateau - this.quota < PONTE.assestamentoInnesco &&
      this.quota >= primaQuota
    ) {
      this.assestamentoArmato = false;
      this.assestamento.attivo = true;
      this.assestamento.inizio = now;
      inMoto = true;
    }

    this.discesa = seguiDt(this.discesa, o.discesa, PONTE.discesaLerpPerFrame, dt);
    if (this.discesa !== o.discesa) inMoto = true;

    // Ruote: mezzo giro quando le gomme si staccano salendo.
    if (this.quota < PONTE.ruoteRiarmoCm) this.ruoteArmate = true;
    if (this.ruoteArmate && primaQuota < PONTE.ruoteInnescoCm && this.quota >= PONTE.ruoteInnescoCm) {
      this.ruoteArmate = false;
      this.giro.attivo = true;
      this.giro.inizio = now;
      this.angoloBase = this.angolo;
    }
    if (this.giro.attivo) {
      const t = (now - this.giro.inizio) / PONTE.ruoteMs;
      if (t >= 1) {
        this.giro.attivo = false;
        this.angolo = this.angoloBase + PONTE.ruoteAngolo;
        this.angoloBase = this.angolo;
      } else {
        this.angolo = this.angoloBase + PONTE.ruoteAngolo * ruotaLibera(t);
        inMoto = true;
      }
    }

    return inMoto;
  }

  private passoRidotto(_dt: number, now: number, o: StatoPonte): boolean {
    // Niente assestamento né ruote.
    this.assestamento.attivo = false;
    this.assestamentoArmato = false;
    if (this.giro.attivo) {
      // Se il reduced motion arriva a metà giro, la ruota si ferma dov'è.
      this.giro.attivo = false;
      this.angoloBase = this.angolo;
    }
    this.ultimoObiettivo = o.quota;

    const diverso =
      o.quota !== this.quota || o.discesa !== this.discesa || o.opacita !== this.opacitaObiettivoRidotta;
    if (!diverso) return false;
    if (now - this.ultimoScatto < INTERVALLO_MINIMO_GRANDI_SUPERFICI) {
      // Aspetta: al prossimo scatto salta direttamente all'ultimo obiettivo.
      return true;
    }
    this.quota = o.quota;
    this.discesa = o.discesa;
    this.opacitaObiettivoRidotta = o.opacita;
    this.ultimoScatto = now;
    if (this.quota < PONTE.ruoteRiarmoCm) this.ruoteArmate = true;
    return false;
  }

  private passoEvidenze(dt: number, ingresso: IngressoPonte): boolean {
    this.evidenzeCambiate = false;
    this.accesi.clear();
    for (const id of ingresso.evidenze) {
      this.accesi.add(id);
      if (!this.grezzo.has(id)) this.grezzo.set(id, 0);
    }
    let inMoto = false;
    const velocita = 1000 / DURATE.evidenza;
    this.grezzo.forEach((valore, id) => {
      const obiettivo = this.accesi.has(id) ? 1 : 0;
      const nuovo = ingresso.ridotto ? obiettivo : avvicina(valore, obiettivo, velocita, dt);
      if (nuovo !== valore) {
        this.grezzo.set(id, nuovo);
        this.evidenzeCambiate = true;
      }
      if (nuovo !== obiettivo) inMoto = true;
    });
    return inMoto;
  }

  private scrivi(uscita: UscitaPonte, obiettivoQuota: number, scarto: number): void {
    uscita.quota.target = obiettivoQuota;
    uscita.quota.valore = this.quota + scarto;
    uscita.binario = binarioDaQuota(this.quota);
    uscita.discesa = this.discesa;
    uscita.opacitaScena = this.opacita;
    uscita.ruote = this.angolo;
    this.grezzo.forEach((valore, id) => {
      uscita.evidenza[id] = vernice(valore);
    });
  }
}
