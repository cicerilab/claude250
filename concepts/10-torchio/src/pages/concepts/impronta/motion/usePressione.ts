/**
 * IMPRONTA · la pressa sui blocchi.
 *
 * Ogni blocco premuto ha una pressione 0..1. Questo hook:
 * - la fa scendere una volta sola all'ingresso (IntersectionObserver, o al
 *   montaggio per l'hero) con la curva `pressa`: discesa, contatto,
 *   ritorno elastico della carta;
 * - la integra nel ticker (fase `update`) e la passa al registro dei
 *   rilievi con `registry.setPressione(id, v)`, che la porta allo shader;
 * - scrive nella fase `write` `--imp-press` (e, se il profilo lo chiede,
 *   `--imp-wdth` / `--imp-wght`) e `data-imp-pressa` sull'elemento, così il
 *   fallback CSS e i titoli DOM si muovono con lo stesso valore del GL;
 * - espone i gesti successivi: hover, battuta di una lettera, ristampa con
 *   un'altra tecnica, leva (premi, risali, urto).
 *
 * Nessun React state per i valori caldi, nessun rAF proprio, nessun accesso
 * al browser a livello di modulo. Con reduced motion: stato finale subito.
 */

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ticker } from '../core/ticker';
import { registry } from '../relief/registry';
import { useImpronta } from '../state/store';
import {
  clamp01,
  derivata,
  lerp,
  pressa,
  pressaSenzaRitorno,
  rilascio,
  ritornoElastico,
  type Easing,
} from './easing';
import { Molla, MOLLE, type ParametriMolla } from './spring';
import {
  ATTR,
  BATTUTA,
  HOVER,
  LEVA,
  RISTAMPA,
  VAR,
  assiPer,
  ritardoConSfasamento,
  type ProfiloPressione,
  type StatoPressa,
} from './choreography';
import { viaggioAncora } from './useScrollProgress';

/* ------------------------------------------------------------------ */
/* Animatore: curva a tempo o molla, sul dt del ticker                 */
/* ------------------------------------------------------------------ */

type Fase =
  | { readonly tipo: 'ferma' }
  | {
      readonly tipo: 'curva';
      /** Valore in funzione del progresso 0..1 della curva. */
      readonly valoreA: Easing;
      readonly ritardo: number;
      readonly durata: number;
      trascorso: number;
      readonly poi: (() => void) | null;
    }
  | { readonly tipo: 'molla' };

const FERMA: Fase = { tipo: 'ferma' };

class Animatore {
  valore: number;
  private fase: Fase = FERMA;
  private readonly molla: Molla;

  constructor(iniziale: number) {
    this.valore = iniziale;
    this.molla = new Molla(iniziale, MOLLE.carta);
  }

  get inMoto(): boolean {
    return this.fase.tipo !== 'ferma';
  }

  salta(valore: number): void {
    this.valore = valore;
    this.molla.salta(valore);
    this.fase = FERMA;
  }

  /** Curva a tempo: `valoreA(u)` per u da 0 a 1 in `durata` ms, dopo `ritardo` ms. */
  curva(valoreA: Easing, durata: number, ritardo = 0, poi: (() => void) | null = null): void {
    this.fase = {
      tipo: 'curva',
      valoreA,
      durata: Math.max(1, durata),
      ritardo: Math.max(0, ritardo),
      trascorso: 0,
      poi,
    };
  }

  /** Passa a una molla verso `obiettivo`, conservando la velocità attuale (nessuno scatto). */
  verso(obiettivo: number, parametri: ParametriMolla): void {
    const velocita = this.velocita();
    this.molla.imposta(parametri);
    this.molla.valore = this.valore;
    this.molla.velocita = velocita;
    this.molla.verso(obiettivo);
    this.fase = { tipo: 'molla' };
  }

  /** Velocità attuale in unità di pressione al secondo. */
  velocita(): number {
    const f = this.fase;
    if (f.tipo === 'molla') return this.molla.velocita;
    if (f.tipo === 'curva') {
      const tempo = f.trascorso - f.ritardo;
      if (tempo <= 0) return 0;
      const u = clamp01(tempo / f.durata);
      return derivata(f.valoreA, u) / (f.durata / 1000);
    }
    return 0;
  }

  /** Avanza di `dt` secondi. true se ancora in moto. */
  passo(dt: number): boolean {
    const f = this.fase;
    if (f.tipo === 'ferma') return false;
    if (f.tipo === 'molla') {
      const inMoto = this.molla.passo(dt);
      this.valore = this.molla.valore;
      if (!inMoto) this.fase = FERMA;
      return inMoto;
    }
    f.trascorso += Math.max(0, dt) * 1000;
    if (f.trascorso < f.ritardo) return true;
    const u = clamp01((f.trascorso - f.ritardo) / f.durata);
    this.valore = f.valoreA(u);
    if (u < 1) return true;
    this.fase = FERMA;
    if (f.poi !== null) f.poi();
    return this.inMoto;
  }
}

/* ------------------------------------------------------------------ */
/* Motore di un blocco premuto                                         */
/* ------------------------------------------------------------------ */

export interface OpzioniPremi {
  /** Durata in ms. Default: `profilo.durata`. */
  readonly durata?: number;
  /** Curva del progresso. Default: `pressa`. */
  readonly curva?: Easing;
  /**
   * Con reduced motion la pressione salta al valore finale, tranne quando il
   * tempo è parte del gesto (la leva): allora la discesa dura uguale ma
   * senza ritorno elastico.
   */
  readonly rispettaTempo?: boolean;
  /** Chiamata quando la curva arriva in fondo (subito, se il salto è immediato). */
  readonly poi?: () => void;
}

class MotorePressione {
  readonly anim = new Animatore(0);
  profilo: ProfiloPressione;
  indice = 0;
  ridotto = false;
  ingressoAvviato = false;
  private el: HTMLElement | null = null;
  private reliefId: string | null = null;
  private stop: Array<() => void> | null = null;
  private scritto = Number.NaN;
  private stato: StatoPressa | null = null;
  private hoverAttivo = false;
  private ultimaBattuta = Number.NEGATIVE_INFINITY;
  private ristampaFase: 'no' | 'su' | 'giu' = 'no';
  private ristampaAttesa: (() => void) | null = null;

  constructor(profilo: ProfiloPressione) {
    this.profilo = profilo;
  }

  riposo(): number {
    return clamp01(this.profilo.riposo);
  }

  /** Obiettivo a riposo tenendo conto dell'hover. */
  obiettivo(): number {
    const hover = this.profilo.hover;
    return this.hoverAttivo && hover !== null ? clamp01(hover) : this.riposo();
  }

  /* --- collegamenti ------------------------------------------------ */

  collega(el: HTMLElement): void {
    if (this.el !== el) {
      this.el = el;
      this.stato = null;
      this.scritto = Number.NaN;
    }
  }

  scollega(): void {
    this.smetti();
  }

  impostaRelief(id: string | null): void {
    this.reliefId = id;
    this.inviaRegistro();
  }

  private inviaRegistro(): void {
    if (this.reliefId !== null) registry.setPressione(this.reliefId, clamp01(this.anim.valore));
  }

  /* --- ticker ------------------------------------------------------ */

  private readonly aggiorna = (dt: number): boolean => {
    const inMoto = this.anim.passo(dt);
    this.inviaRegistro();
    return inMoto;
  };

  private readonly scriviTick = (): boolean => {
    this.scriviDom(false);
    if (!this.anim.inMoto) {
      this.scriviStato(this.ingressoAvviato ? 'premuta' : 'attesa');
      this.smetti();
    }
    return false;
  };

  private avvia(): void {
    if (this.stop !== null) return;
    this.stop = [ticker.add(this.aggiorna, 'update'), ticker.add(this.scriviTick, 'write')];
  }

  private smetti(): void {
    if (this.stop === null) return;
    for (const s of this.stop) s();
    this.stop = null;
  }

  /* --- scrittura DOM ----------------------------------------------- */

  private scriviDom(forza: boolean): void {
    const el = this.el;
    if (el === null) return;
    const v = clamp01(this.anim.valore);
    if (!forza && Math.abs(v - this.scritto) < 1e-4) return;
    this.scritto = v;
    el.style.setProperty(VAR.press, v.toFixed(4));
    const assi = this.profilo.assi;
    if (assi !== null) {
      const { wdth, wght } = assiPer(assi, v);
      el.style.setProperty(VAR.wdth, wdth.toFixed(2));
      el.style.setProperty(VAR.wght, wght.toFixed(1));
    }
  }

  private scriviStato(stato: StatoPressa): void {
    const el = this.el;
    if (el === null || this.stato === stato) return;
    this.stato = stato;
    el.setAttribute(ATTR.pressa, stato);
  }

  /* --- stati immediati --------------------------------------------- */

  /** Valore immediato, senza animazione. */
  imposta(valore: number): void {
    this.chiudiRistampa();
    this.anim.salta(clamp01(valore));
    this.inviaRegistro();
    this.scriviDom(true);
    this.scriviStato(this.ingressoAvviato ? 'premuta' : 'attesa');
    this.smetti();
  }

  /**
   * Valore pilotato da fuori a ogni frame (la leva): nessuna animazione
   * propria, il registro riceve il valore subito, il DOM nella fase `write`.
   */
  segui(valore: number): void {
    this.chiudiRistampa();
    this.ingressoAvviato = true;
    this.anim.salta(clamp01(valore));
    this.inviaRegistro();
    this.scriviStato('in-corso');
    this.avvia();
  }

  /** Valore imposto da fuori: il blocco conta come premuto (niente ingresso automatico dopo). */
  fissa(valore: number): void {
    this.ingressoAvviato = true;
    this.imposta(valore);
  }

  /** Blocco non ancora premuto: foglio piatto, in attesa dell'ingresso. */
  preparaAttesa(): void {
    this.anim.salta(0);
    this.inviaRegistro();
    this.scriviDom(true);
    this.scriviStato('attesa');
  }

  /** Reduced motion o salto: tutto già premuto. */
  completaSubito(): void {
    this.ingressoAvviato = true;
    this.imposta(this.obiettivo());
  }

  /** Dopo uno smontaggio temporaneo (StrictMode, cambio bersaglio): riprende da dove era. */
  ripristina(): void {
    this.scriviDom(true);
    if (this.anim.inMoto) {
      this.scriviStato('in-corso');
      this.avvia();
    } else {
      this.scriviStato('premuta');
    }
  }

  riarma(): void {
    this.chiudiRistampa();
    this.ingressoAvviato = false;
    this.hoverAttivo = false;
    this.preparaAttesa();
    this.smetti();
  }

  /* --- gesti ------------------------------------------------------- */

  /** La pressa d'ingresso: una volta sola per montaggio (o per `riarma`). */
  ingresso(): void {
    if (this.ingressoAvviato) return;
    this.ingressoAvviato = true;
    if (this.ridotto) {
      this.completaSubito();
      return;
    }
    const da = this.anim.valore;
    const a = this.obiettivo();
    this.anim.curva(
      (u) => lerp(da, a, pressa(u)),
      this.profilo.durata,
      ritardoConSfasamento(this.profilo, this.indice),
    );
    this.scriviStato('in-corso');
    this.avvia();
  }

  premi(obiettivo: number | undefined, opzioni: OpzioniPremi): void {
    this.chiudiRistampa();
    this.ingressoAvviato = true;
    const a = clamp01(obiettivo ?? this.obiettivo());
    const poi = opzioni.poi ?? null;
    if (this.ridotto && opzioni.rispettaTempo !== true) {
      this.imposta(a);
      if (poi !== null) poi();
      return;
    }
    const scelta = opzioni.curva ?? pressa;
    const curva = this.ridotto && scelta === pressa ? pressaSenzaRitorno : scelta;
    const da = this.anim.valore;
    this.anim.curva((u) => lerp(da, a, curva(u)), opzioni.durata ?? this.profilo.durata, 0, poi);
    this.scriviStato('in-corso');
    this.avvia();
  }

  verso(obiettivo: number, parametri: ParametriMolla): void {
    this.chiudiRistampa();
    const a = clamp01(obiettivo);
    if (this.ridotto) {
      this.imposta(a);
      return;
    }
    this.anim.verso(a, parametri);
    this.scriviStato('in-corso');
    this.avvia();
  }

  rilascia(obiettivo: number, durata: number): void {
    this.chiudiRistampa();
    const a = clamp01(obiettivo);
    if (this.ridotto) {
      this.imposta(a);
      return;
    }
    const da = this.anim.valore;
    this.anim.curva((u) => lerp(da, a, rilascio(u)), durata);
    this.scriviStato('in-corso');
    this.avvia();
  }

  /** Contatto finale della leva: la carta restituisce un poco e si riassesta. */
  urto(ampiezza: number, durata: number): void {
    this.chiudiRistampa();
    if (this.ridotto) return;
    const base = this.anim.valore;
    this.anim.curva((u) => clamp01(base - ampiezza * ritornoElastico(u)), durata);
    this.scriviStato('in-corso');
    this.avvia();
  }

  hover(attivo: boolean): void {
    this.hoverAttivo = attivo;
    if (this.profilo.hover === null || !this.ingressoAvviato || this.ristampaFase !== 'no') return;
    if (this.ridotto) {
      this.imposta(this.obiettivo());
      return;
    }
    this.anim.verso(this.obiettivo(), HOVER.molla);
    this.scriviStato('in-corso');
    this.avvia();
  }

  /** Una lettera nuova: piccolo affondo e ritorno con la molla `battuta`. */
  battuta(adesso: number): void {
    if (this.ridotto || !this.ingressoAvviato || this.ristampaFase !== 'no') return;
    if (adesso - this.ultimaBattuta < BATTUTA.intervalloMinimo) return;
    this.ultimaBattuta = adesso;
    const riposo = this.obiettivo();
    const segno = riposo + BATTUTA.ampiezza <= 1 ? 1 : -1;
    const picco = clamp01(riposo + segno * BATTUTA.ampiezza);
    const da = this.anim.valore;
    this.anim.curva(
      (u) => lerp(da, picco, 1 - (1 - u) * (1 - u)),
      BATTUTA.affondo,
      0,
      () => {
        this.anim.verso(riposo, BATTUTA.molla);
      },
    );
    this.scriviStato('in-corso');
    this.avvia();
  }

  /**
   * Ristampa: la platina si alza fino a `RISTAMPA.fondo`, lì si cambia la
   * forma (callback `alFondo`: nuova tecnica, nuovo testo), poi riscende con
   * la curva `pressa`. Richieste ravvicinate si fondono: vale l'ultima.
   */
  ristampa(alFondo: () => void): void {
    if (this.ridotto || !this.ingressoAvviato) {
      this.chiudiRistampa();
      alFondo();
      if (this.ingressoAvviato) this.imposta(this.obiettivo());
      return;
    }
    this.ristampaAttesa = alFondo;
    if (this.ristampaFase === 'su') return;
    this.ristampaFase = 'su';

    const da = this.anim.valore;
    const riposo = this.riposo();
    const fondo = riposo * RISTAMPA.fondo;
    const tratto = clamp01((da - fondo) / Math.max(1e-3, riposo - fondo));
    const durataSu = Math.max(60, RISTAMPA.risalita * tratto);

    this.anim.curva(
      (u) => lerp(da, fondo, rilascio(u)),
      durataSu,
      0,
      () => {
        const cambio = this.ristampaAttesa;
        this.ristampaAttesa = null;
        if (cambio !== null) cambio();
        this.ristampaFase = 'giu';
        const a = this.obiettivo();
        this.anim.curva(
          (u) => lerp(fondo, a, pressa(u)),
          RISTAMPA.discesa,
          0,
          () => {
            this.ristampaFase = 'no';
          },
        );
      },
    );
    this.scriviStato('in-corso');
    this.avvia();
  }

  /** Se una ristampa è a metà, applica subito il cambio in sospeso. */
  private chiudiRistampa(): void {
    const cambio = this.ristampaAttesa;
    this.ristampaAttesa = null;
    this.ristampaFase = 'no';
    if (cambio !== null) cambio();
  }

  smonta(): void {
    this.chiudiRistampa();
    this.smetti();
  }
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export type IngressoPressione = 'vista' | 'montaggio' | 'manuale';

export interface OpzioniPressione {
  /** Profilo da `PROFILI` in choreography.ts. */
  readonly profilo: ProfiloPressione;
  /** Id restituito da `useRelief`. Finché è null la pressione resta solo nel DOM. */
  readonly reliefId?: string | null;
  /**
   * 'vista' (default): quando l'elemento osservato passa la soglia del profilo.
   * 'montaggio': subito (hero), dopo `attendi` o `profilo.attesaMax` ms.
   * 'manuale': nessun ingresso automatico (la leva, o chi pilota da sé).
   */
  readonly ingresso?: IngressoPressione;
  /** Indice tra blocchi fratelli, per lo sfasamento del profilo. */
  readonly indice?: number;
  /** Elemento che fa scattare l'ingresso (es. la sezione intera). Default: `ref`. */
  readonly osserva?: RefObject<Element | null>;
  /** Elemento su cui scrivere variabili e stato. Default: `ref`. */
  readonly bersaglio?: RefObject<HTMLElement | null>;
  /** Solo per 'montaggio': promessa da aspettare prima di premere (i font). */
  readonly attendi?: () => Promise<unknown>;
}

export interface ComandiPressione {
  /** Pressione corrente 0..1. */
  valore(): number;
  /** Curva verso `obiettivo` (default: riposo del profilo). */
  premi(obiettivo?: number, opzioni?: OpzioniPremi): void;
  /** Molla verso `obiettivo` (default molla morbida). */
  verso(obiettivo: number, molla?: ParametriMolla): void;
  /** La platina si alza verso `obiettivo` (default 0) con la curva `rilascio`. */
  rilascia(obiettivo?: number, durata?: number): void;
  /** Contatto con ritorno elastico, a fine leva. */
  urto(ampiezza?: number, durata?: number): void;
  /** Una lettera nuova nel banco. */
  battuta(): void;
  /** Cambio di tecnica o di testo sotto la pressa. */
  ristampa(alFondo: () => void): void;
  /** Hover o fuoco sul blocco (solo se il profilo ha `hover`). */
  hover(attivo: boolean): void;
  /** Valore immediato, senza animazione. */
  imposta(valore: number): void;
  /** Valore pilotato da fuori a ogni frame (progresso della leva). */
  segui(valore: number): void;
  /** Torna piatto e ripreme al prossimo ingresso (es. testo del cliente nell'hero). */
  riarma(): void;
}

export function usePressione(
  ref: RefObject<HTMLElement | null>,
  opzioni: OpzioniPressione,
): ComandiPressione {
  const ridotto = useImpronta((s) => s.reducedMotion);
  const [armamento, setArmamento] = useState(0);
  const motoreRef = useRef<MotorePressione | null>(null);
  if (motoreRef.current === null) motoreRef.current = new MotorePressione(opzioni.profilo);
  const motore = motoreRef.current;
  const attendiRef = useRef(opzioni.attendi);

  const { profilo, ingresso = 'vista', osserva, bersaglio } = opzioni;
  const indice = opzioni.indice ?? 0;
  const reliefId = opzioni.reliefId ?? null;

  // Valori freschi per il motore, prima degli effetti che lo usano.
  useEffect(() => {
    attendiRef.current = opzioni.attendi;
    motore.profilo = profilo;
    motore.indice = indice;
    motore.ridotto = ridotto;
  });

  useEffect(() => {
    motore.impostaRelief(reliefId);
  }, [motore, reliefId]);

  useEffect(() => {
    const el = bersaglio?.current ?? ref.current;
    if (el === null) return undefined;
    motore.profilo = profilo;
    motore.indice = indice;
    motore.ridotto = ridotto;
    motore.collega(el);

    if (ridotto) {
      motore.completaSubito();
      return () => {
        motore.smonta();
      };
    }

    if (motore.ingressoAvviato) {
      motore.ripristina();
      return () => {
        motore.scollega();
      };
    }

    motore.preparaAttesa();
    if (ingresso === 'manuale') {
      return () => {
        motore.scollega();
      };
    }

    let vivo = true;
    const parti = (): void => {
      if (vivo) motore.ingresso();
    };

    if (ingresso === 'montaggio') {
      const attendi = attendiRef.current;
      if (attendi === undefined || profilo.attesaMax <= 0) {
        parti();
        return () => {
          vivo = false;
          motore.scollega();
        };
      }
      const timer = window.setTimeout(parti, profilo.attesaMax);
      const fine = (): void => {
        window.clearTimeout(timer);
        parti();
      };
      attendi().then(fine, fine);
      return () => {
        vivo = false;
        window.clearTimeout(timer);
        motore.scollega();
      };
    }

    const osservato: Element = osserva?.current ?? ref.current ?? el;
    let visibile = false;
    let io: IntersectionObserver | null = null;
    let smettiViaggio: (() => void) | null = null;
    const prova = (): void => {
      if (!vivo || !visibile || viaggioAncora.attivo()) return;
      io?.disconnect();
      smettiViaggio?.();
      parti();
    };
    io = new IntersectionObserver(
      (voci) => {
        for (const voce of voci) visibile = voce.isIntersecting;
        prova();
      },
      { rootMargin: profilo.margine, threshold: 0 },
    );
    io.observe(osservato);
    smettiViaggio = viaggioAncora.ascolta(prova);

    return () => {
      vivo = false;
      io?.disconnect();
      smettiViaggio?.();
      motore.scollega();
    };
  }, [ref, bersaglio, osserva, ingresso, profilo, indice, ridotto, armamento, motore]);

  useEffect(
    () => () => {
      motore.smonta();
    },
    [motore],
  );

  return useMemo<ComandiPressione>(
    () => ({
      valore: () => clamp01(motore.anim.valore),
      premi: (obiettivo?: number, o: OpzioniPremi = {}) => {
        motore.premi(obiettivo, o);
      },
      verso: (obiettivo: number, molla: ParametriMolla = HOVER.molla) => {
        motore.verso(obiettivo, molla);
      },
      rilascia: (obiettivo = 0, durata: number = LEVA.risalitaErrore) => {
        motore.rilascia(obiettivo, durata);
      },
      urto: (ampiezza: number = LEVA.ampiezzaUrto, durata: number = LEVA.urto) => {
        motore.urto(ampiezza, durata);
      },
      battuta: () => {
        motore.battuta(performance.now());
      },
      ristampa: (alFondo: () => void) => {
        motore.ristampa(alFondo);
      },
      hover: (attivo: boolean) => {
        motore.hover(attivo);
      },
      imposta: (valore: number) => {
        motore.fissa(valore);
      },
      segui: (valore: number) => {
        motore.segui(valore);
      },
      riarma: () => {
        motore.riarma();
        setArmamento((n) => n + 1);
      },
    }),
    [motore],
  );
}
