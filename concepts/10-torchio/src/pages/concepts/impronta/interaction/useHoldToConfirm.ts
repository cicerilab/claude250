/**
 * IMPRONTA · la leva "tieni premuto per stampare".
 *
 * Logica pura del gesto, senza markup né testi propri: il markup è di
 * sections/Banco/Leva.tsx, i testi di content/testi.ts (BANCO.leva, ANNUNCI).
 *
 * Contratto (creative-director 4.4, ux-architect 6.6):
 * - puntatore (mouse, dito, penna): pressione mantenuta DURATA ms; rilasciare
 *   prima annulla (annullamento del puntatore, WCAG 2.5.2); uscire dalla leva
 *   col dito annulla; lo scroll (pointercancel) annulla in silenzio;
 * - tastiera: Spazio o Invio tenuti premuti, contati dal primo keydown al
 *   keyup, la ripetizione automatica del tasto è ignorata;
 * - alternativa senza tempo: una pressione breve arma la leva ("Premi di
 *   nuovo per confermare", annunciato), una seconda entro 6 s conferma.
 *   Vale per mouse, dito, tastiera e per il clic sintetico dei lettori di
 *   schermo (che non manda né pointerdown né keydown);
 * - progress 0..1 esposto (getProgress, subscribeProgress, onProgress e
 *   variabile CSS `--imp-hold` sul bottone), per far scendere la pressa;
 * - rilascio anticipato: la carta risale con la molla "risalita" (niente
 *   scatto), il messaggio spiega cosa fare, niente toni di errore;
 * - nessun suono, nessun lampeggio; con reduced motion la durata resta la
 *   stessa (è un gesto, non un'animazione), la risalita è immediata.
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { ticker } from '../core/ticker';
import { LEVA } from '../motion/choreography';
import { Molla } from '../motion/spring';
import { store } from '../state/store';
import { attachMagnete } from './light';

/* ------------------------------------------------------------------ costanti */

/** Tempo di pressione per stampare (creative-director: circa 900 ms; valore in motion/choreography.ts). */
export const HOLD_DURATA_MS = LEVA.durata;
/** Finestra per la seconda pressione breve (ux-architect: 6 s). */
export const HOLD_FINESTRA_MS = 6_000;
/** Sotto questa durata una pressione è "breve": arma o conferma, non annulla. */
export const HOLD_SOGLIA_BREVE_MS = 250;
/** Dopo un gesto gestito, il clic nativo che segue va ignorato per questo tempo. */
const CLIC_GEMELLO_MS = 500;
/** Spazio indivisibile: rende "nuovo" per aria-live un annuncio ripetuto. */
const NBSP = '\u00a0';
/** La pressa che scende dopo la doppia pressione: rapida ma visibile. */
const DISCESA_DOPPIA_MS = 220;

/* ------------------------------------------------------------------ tipi */

export type HoldStato =
  /** A riposo. */
  | 'pronto'
  /** Si sta tenendo premuto: il progress sale. */
  | 'tenendo'
  /** Una pressione breve: la prossima (entro 6 s) conferma. */
  | 'armato'
  /** Rilasciata presto o uscita dalla leva: la carta risale. */
  | 'annullato'
  /** `puoPartire()` ha detto no (per esempio manca il contatto). */
  | 'bloccato'
  /** Pressione completa: onCompleta è stata chiamata. */
  | 'completo';

export type HoldVia = 'tenuta' | 'doppia';
export type HoldMotivo = 'rilascio' | 'uscita' | 'interrotto';

export interface HoldTesti {
  /** Annuncio dopo una pressione breve. Es. ANNUNCI.confermaDiNuovo. */
  armato: string;
  /** Annuncio dopo un rilascio anticipato. Es. BANCO.leva.presto. */
  annullato: string;
  /** Annuncio quando `puoPartire()` blocca. Facoltativo: il banco sposta il focus al campo. */
  bloccato?: string;
  /** Annuncio a pressione completa. Facoltativo: di solito lo fa lo stato di invio. */
  completo?: string;
}

export interface HoldOpzioni {
  onCompleta: (via: HoldVia) => void;
  testi: HoldTesti;
  durata?: number;
  finestraConferma?: number;
  sogliaBreve?: number;
  /** Invio in corso o concluso: la leva non risponde (aria-disabled, resta focalizzabile). */
  disabilitato?: boolean;
  /** Controllo prima di partire. false → stato 'bloccato' e onBloccato. */
  puoPartire?: () => boolean;
  onBloccato?: () => void;
  onInizio?: () => void;
  onAnnulla?: (motivo: HoldMotivo) => void;
  /** Ogni frame in cui il progress cambia (fase update del ticker). */
  onProgress?: (p: number) => void;
  /** Magnete sobrio della maniglia, in px (0 = spento). Scrive --imp-mag-x sul bottone. */
  magnete?: number;
}

export interface HoldButtonProps {
  ref: (el: HTMLButtonElement | null) => void;
  type: 'button';
  'aria-disabled': true | undefined;
  'data-stato': HoldStato;
  onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerLeave: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onBlur: (e: ReactFocusEvent<HTMLButtonElement>) => void;
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  onContextMenu: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}

export interface HoldRisultato {
  stato: HoldStato;
  /** Testo per la regione aria-live="polite" sotto la leva (visibile anche a schermo). */
  annuncio: string;
  /** Progress 0..1 corrente (lineare nel tempo; la curva visiva la sceglie chi disegna). */
  getProgress: () => number;
  subscribeProgress: (fn: (p: number) => void) => () => void;
  /** Dopo un invio fallito: la carta risale e la leva torna pronta. */
  reset: () => void;
  buttonProps: HoldButtonProps;
}

interface Gesto {
  modo: 'puntatore' | 'tastiera';
  id: number | string;
  /** Origine del progress (arretrata se si riparte mentre la carta risale). */
  t0: number;
  /** Istante reale della pressione, per distinguere breve e lunga. */
  inizio: number;
}

interface Interno {
  el: HTMLButtonElement | null;
  gesto: Gesto | null;
  stato: HoldStato;
  armatoFino: number;
  ultimoGesto: number;
  progress: number;
  daScrivere: boolean;
  molla: Molla;
  timer: number | null;
}

function tastoLeva(key: string): boolean {
  return key === ' ' || key === 'Enter' || key === 'Spacebar';
}

function durataDi(o: HoldOpzioni): number {
  return Math.max(200, o.durata ?? HOLD_DURATA_MS);
}

function finestraDi(o: HoldOpzioni): number {
  return Math.max(1000, o.finestraConferma ?? HOLD_FINESTRA_MS);
}

function sogliaBreveDi(o: HoldOpzioni): number {
  return Math.max(50, o.sogliaBreve ?? HOLD_SOGLIA_BREVE_MS);
}

/* ------------------------------------------------------------------ hook */

export function useHoldToConfirm(opzioni: HoldOpzioni): HoldRisultato {
  const opz = useRef(opzioni);
  opz.current = opzioni;

  const [stato, setStato] = useState<HoldStato>('pronto');
  const [annuncio, setAnnuncio] = useState('');
  const [elemento, setElemento] = useState<HTMLButtonElement | null>(null);

  const m = useRef<Interno>({
    el: null,
    gesto: null,
    stato: 'pronto',
    armatoFino: 0,
    ultimoGesto: Number.NEGATIVE_INFINITY,
    progress: 0,
    daScrivere: false,
    molla: new Molla(0, LEVA.mollaRisalita),
    timer: null,
  });
  const ascoltatori = useRef(new Set<(p: number) => void>());

  /* ---------- utilità interne (stabili: leggono solo ref) */

  const cambiaStato = useCallback((s: HoldStato) => {
    m.current.stato = s;
    setStato(s);
  }, []);

  const annuncia = useCallback((testo: string) => {
    setAnnuncio((prima) => {
      if (!testo) return '';
      // Stesso testo di prima: un NBSP in coda lo rende "nuovo" per aria-live.
      const base = prima.endsWith(NBSP) ? prima.slice(0, -1) : prima;
      if (base === testo) return prima.endsWith(NBSP) ? testo : `${testo}${NBSP}`;
      return testo;
    });
  }, []);

  const impostaProgress = useCallback((p: number) => {
    const s = m.current;
    if (p === s.progress) return;
    s.progress = p;
    s.daScrivere = true;
    opz.current.onProgress?.(p);
    ascoltatori.current.forEach((fn) => fn(p));
  }, []);

  const pulisciTimer = useCallback(() => {
    const s = m.current;
    if (s.timer !== null) {
      window.clearTimeout(s.timer);
      s.timer = null;
    }
  }, []);

  const completa = useCallback(
    (via: HoldVia) => {
      const s = m.current;
      s.gesto = null;
      s.armatoFino = 0;
      pulisciTimer();
      if (via === 'tenuta' || store.get().reducedMotion) {
        s.molla.salta(1);
        impostaProgress(1);
      }
      cambiaStato('completo');
      annuncia(opz.current.testi.completo ?? '');
      ticker.wake();
      opz.current.onCompleta(via);
    },
    [annuncia, cambiaStato, impostaProgress, pulisciTimer],
  );

  const arma = useCallback(() => {
    const s = m.current;
    s.armatoFino = performance.now() + finestraDi(opz.current);
    cambiaStato('armato');
    annuncia(opz.current.testi.armato);
    pulisciTimer();
    s.timer = window.setTimeout(() => {
      s.timer = null;
      s.armatoFino = 0;
      if (m.current.stato === 'armato') {
        cambiaStato('pronto');
        annuncia('');
      }
    }, finestraDi(opz.current));
    ticker.wake();
  }, [annuncia, cambiaStato, pulisciTimer]);

  const bloccato = useCallback((): boolean => {
    const o = opz.current;
    if (!o.puoPartire || o.puoPartire()) return false;
    cambiaStato('bloccato');
    annuncia(o.testi.bloccato ?? '');
    o.onBloccato?.();
    return true;
  }, [annuncia, cambiaStato]);

  const inizia = useCallback(
    (modo: Gesto['modo'], id: Gesto['id']): void => {
      const s = m.current;
      const o = opz.current;
      if (o.disabilitato || s.stato === 'completo' || s.gesto) return;
      if (bloccato()) return;
      // Riparte dal punto in cui la carta sta risalendo, senza scatti.
      const ora = performance.now();
      s.gesto = { modo, id, t0: ora - s.progress * durataDi(o), inizio: ora };
      s.molla.salta(s.progress);
      cambiaStato('tenendo');
      o.onInizio?.();
      ticker.wake();
    },
    [bloccato, cambiaStato],
  );

  const termina = useCallback(
    (motivo: HoldMotivo): void => {
      const s = m.current;
      const g = s.gesto;
      if (!g) return;
      const ora = performance.now();
      s.gesto = null;
      s.ultimoGesto = ora;
      if (s.stato === 'completo') return;

      const breve = ora - g.inizio < sogliaBreveDi(opz.current);
      s.molla.salta(s.progress);
      s.molla.verso(0);
      ticker.wake();

      if (motivo === 'rilascio' && breve) {
        if (ora < s.armatoFino) {
          completa('doppia');
        } else {
          arma();
        }
        return;
      }

      if (motivo === 'interrotto' || (motivo === 'uscita' && breve)) {
        // Scroll, perdita di focus, scheda nascosta: nessuna colpa, nessun messaggio.
        cambiaStato(ora < s.armatoFino ? 'armato' : 'pronto');
        opz.current.onAnnulla?.('interrotto');
        return;
      }

      cambiaStato('annullato');
      annuncia(opz.current.testi.annullato);
      opz.current.onAnnulla?.(motivo);
    },
    [annuncia, arma, cambiaStato, completa],
  );

  const reset = useCallback(() => {
    const s = m.current;
    s.gesto = null;
    s.armatoFino = 0;
    pulisciTimer();
    s.molla.salta(s.progress);
    s.molla.verso(0);
    cambiaStato('pronto');
    annuncia('');
    ticker.wake();
  }, [annuncia, cambiaStato, pulisciTimer]);

  /* ---------- ticker: progress (update) e --imp-hold (write) */

  useEffect(() => {
    const aggiorna = (dt: number, ora: number): boolean => {
      const s = m.current;
      if (s.gesto) {
        const p = Math.min(1, Math.max(0, (ora - s.gesto.t0) / durataDi(opz.current)));
        impostaProgress(p);
        if (p >= 1) {
          completa('tenuta');
          return false;
        }
        return true;
      }
      if (s.stato === 'completo') {
        if (s.progress < 1) {
          const passo = store.get().reducedMotion ? 1 : (dt * 1000) / DISCESA_DOPPIA_MS;
          impostaProgress(Math.min(1, s.progress + passo));
          return s.progress < 1;
        }
        return false;
      }
      if (s.progress > 0) {
        if (store.get().reducedMotion) {
          s.molla.salta(0);
          impostaProgress(0);
          return false;
        }
        const inMoto = s.molla.passo(dt);
        impostaProgress(Math.min(1, Math.max(0, s.molla.valore)));
        return inMoto;
      }
      return false;
    };

    const scrivi = (): boolean => {
      const s = m.current;
      if (!s.daScrivere) return false;
      s.daScrivere = false;
      s.el?.style.setProperty('--imp-hold', s.progress.toFixed(4));
      return false;
    };

    const togliAggiorna = ticker.add(aggiorna, 'update');
    const togliScrivi = ticker.add(scrivi, 'write');
    return () => {
      togliAggiorna();
      togliScrivi();
    };
  }, [completa, impostaProgress]);

  /* ---------- scheda nascosta: annulla la tenuta in corso */

  useEffect(() => {
    const suVisibilita = (): void => {
      if (document.visibilityState === 'hidden') termina('interrotto');
    };
    document.addEventListener('visibilitychange', suVisibilita);
    return () => {
      document.removeEventListener('visibilitychange', suVisibilita);
    };
  }, [termina]);

  /* ---------- disabilitato mentre si tiene: interrompi */

  useEffect(() => {
    if (opzioni.disabilitato && m.current.gesto) termina('interrotto');
  }, [opzioni.disabilitato, termina]);

  /* ---------- magnete della maniglia */

  const magnete = opzioni.magnete ?? 0;
  useEffect(() => {
    if (!elemento || magnete <= 0) return undefined;
    return attachMagnete(elemento, { spostamento: magnete, asse: 'x' });
  }, [elemento, magnete]);

  /* ---------- pulizia */

  useEffect(
    () => () => {
      const s = m.current;
      if (s.timer !== null) window.clearTimeout(s.timer);
      s.timer = null;
      s.gesto = null;
    },
    [],
  );

  /* ---------- handler */

  const ref = useCallback((el: HTMLButtonElement | null) => {
    m.current.el = el;
    if (el) {
      el.style.setProperty('--imp-hold', m.current.progress.toFixed(4));
    }
    setElemento(el);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!e.isPrimary) return;
      const el = e.currentTarget;
      // Il dito ha una cattura implicita: senza rilasciarla pointerleave non
      // arriverebbe mai e "sposta il dito fuori per annullare" non funzionerebbe.
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      inizia('puntatore', e.pointerId);
    },
    [inizia],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const g = m.current.gesto;
      if (g && g.modo === 'puntatore' && g.id === e.pointerId) termina('rilascio');
      m.current.ultimoGesto = performance.now();
    },
    [termina],
  );

  const onPointerLeave = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const g = m.current.gesto;
      if (g && g.modo === 'puntatore' && g.id === e.pointerId) termina('uscita');
    },
    [termina],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      const g = m.current.gesto;
      if (g && g.modo === 'puntatore' && g.id === e.pointerId) termina('interrotto');
      m.current.ultimoGesto = performance.now();
    },
    [termina],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (!tastoLeva(e.key)) return;
      // Niente clic nativo (Invio lo manderebbe al keydown).
      e.preventDefault();
      if (e.repeat || m.current.gesto) return;
      inizia('tastiera', e.key);
      m.current.ultimoGesto = performance.now();
    },
    [inizia],
  );

  const onKeyUp = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (!tastoLeva(e.key)) return;
      // Niente clic nativo (Spazio lo manderebbe al keyup).
      e.preventDefault();
      const g = m.current.gesto;
      if (g && g.modo === 'tastiera' && g.id === e.key) termina('rilascio');
      m.current.ultimoGesto = performance.now();
    },
    [termina],
  );

  const onBlur = useCallback(() => {
    if (m.current.gesto) termina('interrotto');
  }, [termina]);

  const onClick = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      const s = m.current;
      if (performance.now() - s.ultimoGesto < CLIC_GEMELLO_MS) {
        // È il clic nativo che segue un gesto già gestito da pointer o tastiera.
        e.preventDefault();
        return;
      }
      // Clic "senza gesto": lettori di schermo, controllo vocale, switch.
      // Vale come pressione breve: arma, oppure conferma se già armata.
      const o = opz.current;
      if (o.disabilitato || s.stato === 'completo') return;
      if (bloccato()) return;
      if (performance.now() < s.armatoFino) {
        completa('doppia');
      } else {
        arma();
      }
    },
    [arma, bloccato, completa],
  );

  const onContextMenu = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    // Pressione lunga su touch: niente menu contestuale sopra la leva.
    e.preventDefault();
  }, []);

  const getProgress = useCallback(() => m.current.progress, []);

  const subscribeProgress = useCallback((fn: (p: number) => void) => {
    ascoltatori.current.add(fn);
    return () => {
      ascoltatori.current.delete(fn);
    };
  }, []);

  const disabilitato = opzioni.disabilitato === true || stato === 'completo';

  const buttonProps = useMemo<HoldButtonProps>(
    () => ({
      ref,
      type: 'button',
      'aria-disabled': disabilitato ? true : undefined,
      'data-stato': stato,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      onBlur,
      onClick,
      onContextMenu,
    }),
    [
      ref,
      disabilitato,
      stato,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      onBlur,
      onClick,
      onContextMenu,
    ],
  );

  return { stato, annuncio, getProgress, subscribeProgress, reset, buttonProps };
}
