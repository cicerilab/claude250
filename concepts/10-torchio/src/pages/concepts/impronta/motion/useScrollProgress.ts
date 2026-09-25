/**
 * IMPRONTA · progresso di scroll delle sezioni, filo della legatoria,
 * arrivo alle ancore.
 *
 * Niente listener `scroll`: il progresso si calcola nella fase
 * "aggiornamento" del ticker da `runtime.scrollY` (lenis) e dalla posizione
 * della sezione in coordinate documento, misurata solo al montaggio, su
 * ResizeObserver, su resize della finestra (150 ms) e a font pronti.
 * Le variabili CSS si scrivono nella fase "scrittura". Il calcolo è attivo
 * solo mentre la sezione è entro mezza viewport dallo schermo.
 *
 * Nessun accesso a window/document a livello di modulo (prerender).
 */

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { getLenis } from '../core/lenis';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { store, useImpronta } from '../state/store';
import { clamp01, scorrimento } from './easing';
import { Molla } from './spring';
import {
  ANCORE,
  ATTR,
  INTERVALLI,
  LEGATORIA,
  VAR,
  conSoste,
  durataAncora,
  indiceConIsteresi,
  margineAncora,
  progressoIntervallo,
  scrollPerProgresso,
  type Intervallo,
} from './choreography';

/* ------------------------------------------------------------------ */
/* Viaggio verso un'ancora                                             */
/* ------------------------------------------------------------------ */

type Ascoltatore = () => void;

let viaggiInCorso = 0;
const ascoltatoriViaggio = new Set<Ascoltatore>();

/**
 * Stato condiviso "stiamo viaggiando verso un'ancora". Mentre è attivo,
 * i blocchi sorvolati non consumano la loro pressa d'ingresso: la
 * ricevono all'arrivo se sono in vista, o più tardi quando il lettore ci
 * torna. Stato di modulo senza accessi al browser: sicuro nel prerender.
 */
export const viaggioAncora = {
  attivo(): boolean {
    return viaggiInCorso > 0;
  },
  inizia(): void {
    viaggiInCorso += 1;
  },
  finisce(): void {
    if (viaggiInCorso === 0) return;
    viaggiInCorso -= 1;
    if (viaggiInCorso === 0) {
      for (const fn of [...ascoltatoriViaggio]) fn();
    }
  },
  /** Chiamata alla fine di ogni viaggio. Restituisce la funzione per smettere. */
  ascolta(fn: Ascoltatore): () => void {
    ascoltatoriViaggio.add(fn);
    return () => {
      ascoltatoriViaggio.delete(fn);
    };
  },
};

export interface OpzioniArrivo {
  /** Forza o esclude il salto istantaneo. Default: `store.get().reducedMotion`. */
  readonly ridotto?: boolean;
  /** Chiamata all'arrivo (anche nel salto istantaneo). */
  readonly onArrivo?: () => void;
}

/**
 * Porta la pagina alla posizione `y` (px documento) come il carrello del
 * torchio: curva `scorrimento`, durata proporzionata alla distanza,
 * scroll dell'utente bloccato durante il viaggio. Con reduced motion o
 * senza lenis: salto istantaneo.
 */
export function arrivaAScroll(y: number, opzioni: OpzioniArrivo = {}): void {
  const ridotto = opzioni.ridotto ?? store.get().reducedMotion;
  const destinazione = Math.max(0, y);
  const lenis = ridotto ? null : getLenis();
  let concluso = false;
  viaggioAncora.inizia();

  const concludi = (): void => {
    if (concluso) return;
    concluso = true;
    viaggioAncora.finisce();
    opzioni.onArrivo?.();
  };

  if (lenis === null) {
    window.scrollTo({ top: destinazione, left: 0, behavior: 'instant' });
    concludi();
    return;
  }

  const durata = durataAncora(destinazione - lenis.scroll);
  const sicurezza = window.setTimeout(concludi, durata + ANCORE.margineSicurezza);
  lenis.scrollTo(destinazione, {
    duration: durata / 1000,
    easing: scorrimento,
    lock: true,
    force: true,
    onComplete: () => {
      window.clearTimeout(sicurezza);
      concludi();
    },
  });
}

export interface OpzioniAncora extends OpzioniArrivo {
  /** Sposta il fuoco sull'h2 della sezione all'arrivo (default true). */
  readonly fuoco?: boolean;
}

/**
 * Arrivo a un'ancora (`id` senza #): viaggio con `arrivaAScroll`, spazio
 * sopra per la testata, poi fuoco sull'h2 (tabindex -1) senza scorrere.
 * Restituisce false se l'ancora non esiste.
 */
export function arrivaAllAncora(id: string, opzioni: OpzioniAncora = {}): boolean {
  const sezione = document.getElementById(id);
  if (sezione === null) return false;
  const larghezza = runtime.viewport.w > 0 ? runtime.viewport.w : window.innerWidth;
  const y = sezione.getBoundingClientRect().top + window.scrollY - margineAncora(larghezza);
  arrivaAScroll(y, {
    ridotto: opzioni.ridotto,
    onArrivo: () => {
      if (opzioni.fuoco !== false) {
        const titolo = sezione.querySelector<HTMLElement>('h2, h1') ?? sezione;
        if (!titolo.hasAttribute('tabindex')) titolo.setAttribute('tabindex', '-1');
        titolo.focus({ preventScroll: true });
      }
      opzioni.onArrivo?.();
    },
  });
  return true;
}

/* ------------------------------------------------------------------ */
/* Progresso di una sezione                                            */
/* ------------------------------------------------------------------ */

export interface OpzioniScroll {
  /** Intervallo di scroll. Default: `INTERVALLI.pin` (contenitore alto con figlio sticky). */
  readonly intervallo?: Intervallo;
  /** Variabile CSS del progresso. Default `--imp-scroll-p`; null per non scriverla. */
  readonly variabile?: string | null;
  /** Altre variabili CSS calcolate dal progresso, scritte insieme. */
  readonly derivate?: Readonly<Record<string, (p: number) => number>>;
  /** Elemento su cui scrivere le variabili. Default: l'elemento misurato. */
  readonly bersaglio?: RefObject<HTMLElement | null>;
  /** Numero di passi discreti (es. 4 tecniche). */
  readonly passi?: number;
  /** Isteresi sui confini dei passi (frazione di progresso). Default 0,02. */
  readonly isteresi?: number;
  /** Chiamata nella fase aggiornamento quando il progresso cambia. */
  readonly onProgresso?: (p: number) => void;
  /** Chiamata quando cambia il passo. `precedente` vale -1 alla prima valutazione. */
  readonly onPasso?: (indice: number, precedente: number) => void;
  /** Progresso fisso con reduced motion. Default 1 (stato finale). */
  readonly valoreRidotto?: number;
  /** Passo fisso con reduced motion. Default 0. */
  readonly passoRidotto?: number;
  /** rootMargin entro cui il calcolo per frame è attivo. Default '50% 0px'. */
  readonly margineAttivo?: string;
}

export interface ProgressoScroll {
  /** Progresso corrente 0..1 (ultimo calcolato). */
  valore(): number;
  /** Passo corrente (0 se `passi` non è impostato). */
  passo(): number;
  /** Rimisura la sezione (dopo un cambio di layout dichiarato). */
  misura(): void;
  /** Posizione di scroll (px documento) a cui il progresso vale `p`, o null se non misurata. */
  scrollPer(p: number): number | null;
  /** Porta la pagina al progresso `p` con il viaggio delle ancore. */
  vaiA(p: number, opzioni?: OpzioniArrivo): void;
}

const QUIETE_PROGRESSO = 1e-5;

class MotoreScroll {
  opz: OpzioniScroll = {};
  el: HTMLElement | null = null;
  private topDoc = 0;
  private altezza = 0;
  private misurato = false;
  private p = -1;
  private indice = -1;
  private daScrivere = false;
  private stop: Array<() => void> | null = null;

  private intervallo(): Intervallo {
    return this.opz.intervallo ?? INTERVALLI.pin;
  }

  private altezzaViewport(): number {
    return runtime.viewport.h > 0 ? runtime.viewport.h : window.innerHeight;
  }

  valore(): number {
    return this.p < 0 ? 0 : this.p;
  }

  passoCorrente(): number {
    return this.indice < 0 ? 0 : this.indice;
  }

  misura(): void {
    const el = this.el;
    if (el === null) return;
    const r = el.getBoundingClientRect();
    this.topDoc = r.top + window.scrollY;
    this.altezza = r.height;
    this.misurato = true;
    this.valuta(window.scrollY, this.altezzaViewport());
    this.scrivi();
  }

  scrollPer(p: number): number | null {
    if (!this.misurato) this.misura();
    if (!this.misurato) return null;
    return scrollPerProgresso(this.intervallo(), p, this.topDoc, this.altezza, this.altezzaViewport());
  }

  private valuta(scrollY: number, altezzaViewport: number): void {
    if (!this.misurato) return;
    this.imposta(progressoIntervallo(this.intervallo(), scrollY, this.topDoc, this.altezza, altezzaViewport));
  }

  private imposta(p: number, forzaPasso?: number): void {
    const x = clamp01(p);
    if (Math.abs(x - this.p) < QUIETE_PROGRESSO && forzaPasso === undefined) return;
    this.p = x;
    this.daScrivere = true;
    this.opz.onProgresso?.(x);
    const n = this.opz.passi ?? 0;
    if (n > 1) {
      const nuovo =
        forzaPasso !== undefined
          ? Math.min(n - 1, Math.max(0, Math.floor(forzaPasso)))
          : indiceConIsteresi(x, n, this.indice, this.opz.isteresi ?? 0.02);
      if (nuovo !== this.indice) {
        const precedente = this.indice;
        this.indice = nuovo;
        this.opz.onPasso?.(nuovo, precedente);
      }
    }
  }

  private scrivi(): void {
    if (!this.daScrivere) return;
    this.daScrivere = false;
    const bersaglio = this.opz.bersaglio?.current ?? this.el;
    if (bersaglio === null) return;
    const p = this.valore();
    const nome = this.opz.variabile === undefined ? VAR.scrollP : this.opz.variabile;
    if (nome !== null) bersaglio.style.setProperty(nome, p.toFixed(4));
    const derivate = this.opz.derivate;
    if (derivate !== undefined) {
      for (const [variabile, fn] of Object.entries(derivate)) {
        bersaglio.style.setProperty(variabile, fn(p).toFixed(4));
      }
    }
  }

  private readonly aggiorna = (): boolean => {
    this.valuta(runtime.scrollY, this.altezzaViewport());
    return false;
  };

  private readonly scriviTick = (): boolean => {
    this.scrivi();
    return false;
  };

  attiva(): void {
    if (this.stop !== null) return;
    this.stop = [ticker.add(this.aggiorna, 'aggiornamento'), ticker.add(this.scriviTick, 'scrittura')];
  }

  /** Esce dal calcolo per frame, con un'ultima valutazione esatta (0 o 1 se si è saltato oltre). */
  disattiva(): void {
    this.smettiTick();
    if (this.el !== null && this.misurato) {
      this.valuta(window.scrollY, this.altezzaViewport());
      this.scrivi();
    }
  }

  smettiTick(): void {
    if (this.stop === null) return;
    for (const s of this.stop) s();
    this.stop = null;
  }

  /** Reduced motion: stato finale immediato, nessun abbonamento al ticker. */
  applicaRidotto(): void {
    this.smettiTick();
    const passo = this.opz.passoRidotto ?? 0;
    this.imposta(this.opz.valoreRidotto ?? 1, (this.opz.passi ?? 0) > 1 ? passo : undefined);
    this.daScrivere = true;
    this.scrivi();
  }
}

/**
 * Progresso 0..1 di una sezione legato allo scroll (tecniche fissate, filo,
 * qualsiasi scrub). Non provoca render React: legge i valori con
 * `valore()`/`passo()` o reagisci in `onProgresso`/`onPasso`, e disegna con
 * le variabili CSS scritte sul bersaglio.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  opzioni: OpzioniScroll = {},
): ProgressoScroll {
  const ridotto = useImpronta((s) => s.reducedMotion);
  const motoreRef = useRef<MotoreScroll | null>(null);
  if (motoreRef.current === null) motoreRef.current = new MotoreScroll();
  const motore = motoreRef.current;

  // Opzioni sempre fresche per i callback del ticker, senza rifare gli effetti.
  useEffect(() => {
    motore.opz = opzioni;
  });

  const margineAttivo = opzioni.margineAttivo ?? '50% 0px';

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;
    motore.el = el;

    if (ridotto) {
      motore.applicaRidotto();
      return () => {
        motore.el = null;
      };
    }

    motore.misura();

    const io = new IntersectionObserver(
      (voci) => {
        for (const voce of voci) {
          if (voce.isIntersecting) motore.attiva();
          else motore.disattiva();
        }
      },
      { rootMargin: margineAttivo, threshold: 0 },
    );
    io.observe(el);

    const ro = new ResizeObserver(() => {
      motore.misura();
    });
    ro.observe(el);

    let timer = 0;
    const suResize = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        motore.misura();
      }, 150);
    };
    window.addEventListener('resize', suResize, { passive: true });

    let vivo = true;
    void document.fonts.ready.then(() => {
      if (vivo) motore.misura();
    });

    return () => {
      vivo = false;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', suResize);
      window.clearTimeout(timer);
      motore.smettiTick();
      motore.el = null;
    };
  }, [ref, ridotto, margineAttivo, motore]);

  return useMemo<ProgressoScroll>(
    () => ({
      valore: () => motore.valore(),
      passo: () => motore.passoCorrente(),
      misura: () => {
        motore.misura();
      },
      scrollPer: (p: number) => motore.scrollPer(p),
      vaiA: (p: number, o?: OpzioniArrivo) => {
        const y = motore.scrollPer(p);
        if (y !== null) arrivaAScroll(y, o);
      },
    }),
    [motore],
  );
}

/* ------------------------------------------------------------------ */
/* Il filo della legatoria                                             */
/* ------------------------------------------------------------------ */

export interface OpzioniFilo {
  /** Le fermate: un elemento per legatura, nello stesso ordine di `soste`. */
  readonly fermate: RefObject<ReadonlyArray<HTMLElement | null>>;
  /** Frazioni del tracciato in cui stanno le fermate. Default `LEGATORIA.soste`. */
  readonly soste?: readonly number[];
  /** Dove scrivere `--imp-filo-p`. Default: la sezione misurata. */
  readonly bersaglio?: RefObject<HTMLElement | null>;
  /** Ultima fermata agganciata (-1 nessuna): serve a "Prova la tua" in fondo al filo. */
  readonly onSosta?: (indice: number) => void;
}

export interface ProgressoFilo extends ProgressoScroll {
  /** Lunghezza cucita 0..1 (con le soste applicate). */
  filo(): number;
  /** Ultima fermata agganciata, -1 se nessuna. */
  sosta(): number;
}

class MotoreFilo {
  opz: OpzioniFilo | null = null;
  ridotto = false;
  filo = 0;
  sostaCorrente = -1;
  private molle: Molla[] = [];
  private scritti: number[] = [];
  private stop: Array<() => void> | null = null;

  soste(): readonly number[] {
    return this.opz?.soste ?? LEGATORIA.soste;
  }

  private allinea(): void {
    const n = this.soste().length;
    while (this.molle.length < n) {
      this.molle.push(new Molla(0, LEGATORIA.mollaAggancio));
      this.scritti.push(Number.NaN);
    }
    if (this.molle.length > n) {
      this.molle.length = n;
      this.scritti.length = n;
    }
  }

  progresso(filo: number): void {
    this.filo = filo;
    this.allinea();
    let ultima = -1;
    const soste = this.soste();
    for (let i = 0; i < soste.length; i += 1) {
      const s = soste[i] ?? 1;
      const agganciata = filo >= s - LEGATORIA.anticipoAggancio;
      const molla = this.molle[i];
      if (molla !== undefined) {
        if (this.ridotto) molla.salta(agganciata ? 1 : 0);
        else molla.verso(agganciata ? 1 : 0);
      }
      if (agganciata) ultima = i;
    }
    if (ultima !== this.sostaCorrente) {
      this.sostaCorrente = ultima;
      this.opz?.onSosta?.(ultima);
    }
    if (this.ridotto) this.scriviTutto(true);
    else this.attiva();
  }

  private readonly aggiorna = (_t: number, dt: number): boolean => {
    let inMoto = false;
    for (const molla of this.molle) {
      if (molla.passo(dt)) inMoto = true;
    }
    return inMoto;
  };

  private readonly scriviTick = (): boolean => {
    this.scriviTutto(false);
    if (this.molle.every((m) => m.ferma)) this.smetti();
    return false;
  };

  private scriviTutto(forza: boolean): void {
    const fermate = this.opz?.fermate.current;
    if (fermate === null || fermate === undefined) return;
    for (let i = 0; i < this.molle.length; i += 1) {
      const nodo = fermate[i];
      const molla = this.molle[i];
      if (nodo === null || nodo === undefined || molla === undefined) continue;
      const v = clamp01(molla.valore);
      const prima = this.scritti[i] ?? Number.NaN;
      if (forza || Number.isNaN(prima) || Math.abs(v - prima) > 1e-4) {
        nodo.style.setProperty(VAR.filoAggancio, v.toFixed(4));
        this.scritti[i] = v;
      }
      nodo.toggleAttribute(ATTR.agganciato, molla.obiettivo >= 1);
    }
  }

  attiva(): void {
    if (this.stop !== null) return;
    this.stop = [ticker.add(this.aggiorna, 'aggiornamento'), ticker.add(this.scriviTick, 'scrittura')];
  }

  smetti(): void {
    if (this.stop === null) return;
    for (const s of this.stop) s();
    this.stop = null;
  }
}

/**
 * Il filo che si cuce con lo scroll. Scrive `--imp-filo-p` (lunghezza cucita
 * 0..1 con le soste) sul bersaglio e `--imp-filo-aggancio` (0..1, molla
 * `tiro`) su ogni fermata, più `data-imp-agganciato` quando il filo l'ha
 * raggiunta. Con reduced motion: filo interamente cucito, tutte agganciate.
 *
 * Nel SVG: `<path pathLength="1" style="stroke-dasharray: 1;
 * stroke-dashoffset: calc(1 - var(--imp-filo-p))">`.
 */
export function useFilo(ref: RefObject<HTMLElement | null>, opzioni: OpzioniFilo): ProgressoFilo {
  const ridotto = useImpronta((s) => s.reducedMotion);
  const motoreRef = useRef<MotoreFilo | null>(null);
  if (motoreRef.current === null) motoreRef.current = new MotoreFilo();
  const motore = motoreRef.current;

  useEffect(() => {
    motore.opz = opzioni;
    motore.ridotto = ridotto;
  });

  const derivate = useMemo(
    () => ({
      [VAR.filoP]: (p: number) => conSoste(p, motore.soste(), LEGATORIA.sosta),
    }),
    [motore],
  );

  const onProgresso = useMemo(
    () => (p: number) => {
      motore.progresso(conSoste(p, motore.soste(), LEGATORIA.sosta));
    },
    [motore],
  );

  const scroll = useScrollProgress(ref, {
    intervallo: LEGATORIA.intervallo,
    variabile: null,
    derivate,
    bersaglio: opzioni.bersaglio,
    valoreRidotto: 1,
    onProgresso,
  });

  useEffect(() => {
    if (ridotto) {
      motore.ridotto = true;
      motore.progresso(1);
    }
    return () => {
      motore.smetti();
    };
  }, [ridotto, motore]);

  return useMemo<ProgressoFilo>(
    () => ({
      ...scroll,
      filo: () => motore.filo,
      sosta: () => motore.sostaCorrente,
    }),
    [scroll, motore],
  );
}
