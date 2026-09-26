/**
 * IMBRUNIRE · il foglio dal basso (interaction-designer; creative-director
 * §6.2 e §10, ux-architect 2.3, 5.2, 5.5, 7.4).
 *
 * Due usi nella torre:
 * - il pannello della stanza: a metà altezza, trascinabile a tutta altezza
 *   (posizioni 'meta' e 'tutto'); diventa 'tutto' da solo quando è il
 *   pannello di prenotazione (la sezione chiama `imposta('tutto')`);
 * - il nastro delle lune: una "fetta di cielo" alta il 36% (min 240 px), solo
 *   'meta'; è un `dialog` non modale (il palazzo ridotto sopra resta toccabile).
 *
 * Gesti e alternative:
 * - trascinare la MANIGLIA (la fascia in cima al foglio: `propsManiglia`):
 *   su e giù tra le posizioni, oltre il 35% sotto 'meta' (o un lancio verso
 *   il basso) chiude; il contenuto del foglio scorre in modo nativo e non
 *   trascina il foglio (un gesto per zona, trend-researcher P8);
 * - il bottone "Apri tutto" / "Riduci" (`propsInterruttore`, aria-expanded);
 * - Esc chiude; il fuoco torna a chi ha aperto il foglio;
 * - con la tastiera virtuale aperta il foglio si alza della sua altezza
 *   (`--imb-ix-tastiera`, da visualViewport) e il campo attivo resta in vista.
 *
 * Con `attivo: false` (sezione, o altezza < 480 px CSS: ux 2.4) il foglio
 * non è un foglio: `data-imb-ix-foglio="spento"` e il contenuto sta nel flusso.
 *
 * Variabili CSS scritte SOLO sull'elemento del foglio (marcato data-imb-var)
 * e solo quando cambiano: --imb-ix-foglio-meta (altezza di 'meta' in px),
 * --imb-ix-foglio-y (spostamento durante il trascinamento), --imb-ix-tastiera.
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { ticker } from '../core/ticker';

/* ------------------------------------------------------------------ costanti */

/** Oltre questa frazione dell'altezza di 'meta' trascinata sotto 'meta', il foglio si chiude. */
const QUOTA_CHIUSURA = 0.35;
/** Lancio verso il basso che chiude (px/ms). */
const LANCIO_CHIUDI = 0.9;
/** Lancio che sceglie la posizione nella sua direzione (px/ms). */
const LANCIO_POSIZIONE = 0.5;
/** Resistenza oltre la posizione più alta. */
const ELASTICO = 0.25;
/** Spostamento minimo perché il premuto sulla maniglia diventi trascinamento. */
const SOGLIA_PX = 4;
const FINESTRA_VELOCITA_MS = 90;

/* ------------------------------------------------------------------ tipi */

export type PosizioneFoglio = 'meta' | 'tutto';

export interface OpzioniFoglio {
  /** false = niente foglio: contenuto nel flusso (sezione, o finestra bassa < 480 px). */
  attivo: boolean;
  aperto: boolean;
  /** Altezza di 'meta' come frazione della finestra (0,5 stanza; 0,36 lune). */
  quota: number;
  /** Minimo in px dell'altezza di 'meta' (240 per le lune). */
  quotaMin?: number;
  /** Posizioni ammesse, dal basso. Default ['meta', 'tutto']. */
  posizioni?: readonly PosizioneFoglio[];
  /** Posizione all'apertura. Default la prima ammessa. */
  iniziale?: PosizioneFoglio;
  /** Trascinato giù oltre la soglia, lanciato giù, o Esc. */
  onChiudi: () => void;
  /** Se presente il foglio è un dialog non modale con questo titolo (nastro delle lune). */
  titoloId?: string;
  /** Il fuoco torna a chi ha aperto il foglio alla chiusura. Default true. */
  ritornaFuoco?: boolean;
}

export type StatoFoglio = PosizioneFoglio | 'chiuso' | 'spento';

export interface PropsFoglio {
  ref: (el: HTMLElement | null) => void;
  id: string;
  'data-imb-ix-foglio': StatoFoglio;
  'data-imb-ix-trascina': 'true' | undefined;
  'data-imb-var': '';
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  role: 'dialog' | undefined;
  'aria-modal': false | undefined;
  'aria-labelledby': string | undefined;
}

export interface PropsManiglia {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  'data-imb-ix-maniglia': '';
}

export interface PropsInterruttore {
  type: 'button';
  'aria-expanded': boolean;
  'aria-controls': string;
  onClick: () => void;
}

export interface Foglio {
  /** Stato da mostrare (anche per scegliere l'etichetta "Apri tutto" / "Riduci"). */
  stato: StatoFoglio;
  posizione: PosizioneFoglio;
  trascina: boolean;
  imposta: (p: PosizioneFoglio) => void;
  alterna: () => void;
  propsFoglio: PropsFoglio;
  propsManiglia: PropsManiglia;
  propsInterruttore: PropsInterruttore;
}

interface Presa {
  id: number;
  y0: number;
  y: number;
  /** Spostamento (px dall'alto della posizione 'tutto') all'inizio del gesto. */
  base: number;
  altezza: number;
  meta: number;
  mosso: boolean;
  campioni: { t: number; y: number }[];
}

const CAMPI_TESTO = 'input:not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"]), textarea, select';

/* ------------------------------------------------------------------ hook */

export function useFoglio(o: OpzioniFoglio): Foglio {
  const posizioni = o.posizioni ?? ['meta', 'tutto'];
  const primaAmmessa: PosizioneFoglio = posizioni[0] ?? 'meta';
  const iniziale: PosizioneFoglio = o.iniziale !== undefined && posizioni.includes(o.iniziale) ? o.iniziale : primaAmmessa;
  const chiaveAmmesse = posizioni.join(',');

  const id = `imb-foglio-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const [posizione, setPosizione] = useState<PosizioneFoglio>(iniziale);
  const [trascina, setTrascina] = useState(false);

  const opz = useRef(o);
  opz.current = o;
  const posizioneRef = useRef(posizione);
  posizioneRef.current = posizione;
  const ammesseRef = useRef<readonly PosizioneFoglio[]>(posizioni);
  ammesseRef.current = posizioni;

  const nodo = useRef<HTMLElement | null>(null);
  const presa = useRef<Presa | null>(null);
  const yDaScrivere = useRef<number | null>(null);
  const yScritta = useRef<string>('');
  const metaScritta = useRef<string>('');
  const tastieraScritta = useRef<string>('');
  const apertoDa = useRef<HTMLElement | null>(null);

  const ref = useCallback((el: HTMLElement | null) => {
    nodo.current = el;
  }, []);

  const scriviVar = useCallback((nome: string, valore: string, ultimo: { current: string }) => {
    const el = nodo.current;
    if (!el || ultimo.current === valore) return;
    ultimo.current = valore;
    el.style.setProperty(nome, valore);
  }, []);

  /* ---------------------------------------------------------- apertura: posizione iniziale e fuoco */

  useEffect(() => {
    if (!o.aperto) return;
    setPosizione(iniziale);
    // chi ha aperto il foglio (per restituirgli il fuoco)
    const attivo = document.activeElement;
    if (attivo instanceof HTMLElement && !(nodo.current?.contains(attivo) ?? false) && attivo !== document.body) {
      apertoDa.current = attivo;
    }
    // la posizione iniziale conta solo all'apertura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.aperto]);

  useEffect(() => {
    if (o.aperto) return;
    const chi = apertoDa.current;
    apertoDa.current = null;
    if (opz.current.ritornaFuoco === false || !chi || !chi.isConnected) return;
    const qui = document.activeElement;
    const fuocoPerso = qui === null || qui === document.body || (nodo.current?.contains(qui) ?? false);
    if (fuocoPerso) chi.focus({ preventScroll: true });
  }, [o.aperto]);

  /* posizione non più ammessa (cambio di pannello): torna alla prima */
  useEffect(() => {
    if (!ammesseRef.current.includes(posizioneRef.current)) setPosizione(ammesseRef.current[0] ?? 'meta');
  }, [chiaveAmmesse]);

  /* ---------------------------------------------------------- altezza di 'meta' e tastiera virtuale */

  useEffect(() => {
    if (!o.attivo || typeof window === 'undefined') return undefined;
    const misura = (): void => {
      const h = window.innerHeight;
      const meta = Math.round(Math.max(opz.current.quotaMin ?? 0, opz.current.quota * h));
      scriviVar('--imb-ix-foglio-meta', `${meta}px`, metaScritta);
    };
    const vv = window.visualViewport;
    const suTastiera = (): void => {
      if (!vv) return;
      const coperto = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      // sotto 80 px è la barra del browser che si muove, non una tastiera
      scriviVar('--imb-ix-tastiera', `${coperto >= 80 ? coperto : 0}px`, tastieraScritta);
      const attivo = document.activeElement;
      if (coperto >= 80 && attivo instanceof HTMLElement && nodo.current?.contains(attivo) && attivo.matches(CAMPI_TESTO)) {
        attivo.scrollIntoView({ block: 'nearest' });
      }
    };
    misura();
    suTastiera();
    window.addEventListener('resize', misura);
    vv?.addEventListener('resize', suTastiera);
    vv?.addEventListener('scroll', suTastiera);
    return () => {
      window.removeEventListener('resize', misura);
      vv?.removeEventListener('resize', suTastiera);
      vv?.removeEventListener('scroll', suTastiera);
    };
  }, [o.attivo, o.quota, o.quotaMin, scriviVar]);

  /* ---------------------------------------------------------- ticker: scrive lo spostamento durante il trascinamento */

  useEffect(() => {
    const scrivi = (): boolean => {
      const y = yDaScrivere.current;
      if (y === null) return false;
      yDaScrivere.current = null;
      scriviVar('--imb-ix-foglio-y', `${Math.round(y)}px`, yScritta);
      return false;
    };
    return ticker.add(scrivi, 'write');
  }, [scriviVar]);

  /* ---------------------------------------------------------- trascinamento della maniglia */

  const offsetDi = useCallback((p: PosizioneFoglio, altezza: number, meta: number): number => {
    return p === 'tutto' ? 0 : Math.max(0, altezza - meta);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!opz.current.attivo || !opz.current.aperto) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (presa.current !== null) return;
      const bersaglio = e.target instanceof Element ? e.target : null;
      // i bottoni nella maniglia restano bottoni
      if (bersaglio && bersaglio !== e.currentTarget && bersaglio.closest('button, a[href], input, select, textarea')) return;
      const el = nodo.current;
      if (!el) return;
      const altezza = el.getBoundingClientRect().height;
      const meta = Math.min(altezza, Math.max(opz.current.quotaMin ?? 0, opz.current.quota * window.innerHeight));
      const base = offsetDi(posizioneRef.current, altezza, meta);
      const t = performance.now();
      presa.current = { id: e.pointerId, y0: e.clientY, y: e.clientY, base, altezza, meta, mosso: false, campioni: [{ t, y: e.clientY }] };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_e) {
        /* già rilasciato */
      }
    },
    [offsetDi],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const p = presa.current;
    if (p === null || e.pointerId !== p.id) return;
    p.y = e.clientY;
    const t = performance.now();
    p.campioni.push({ t, y: e.clientY });
    while (p.campioni.length > 2 && t - (p.campioni[0]?.t ?? t) > FINESTRA_VELOCITA_MS) p.campioni.shift();
    const dy = p.y - p.y0;
    if (!p.mosso) {
      if (Math.abs(dy) <= SOGLIA_PX) return;
      p.mosso = true;
      setTrascina(true);
    }
    let y = p.base + dy;
    if (y < 0) y *= ELASTICO;
    y = Math.min(p.altezza, y);
    yDaScrivere.current = y;
    ticker.wake();
  }, []);

  const rilascia = useCallback((e: ReactPointerEvent<HTMLElement>, valido: boolean) => {
    const p = presa.current;
    if (p === null || e.pointerId !== p.id) return;
    presa.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_e) {
      /* già rilasciato */
    }
    if (!p.mosso) return;
    setTrascina(false);
    if (!valido) return; // cancel: il foglio torna dov'era (transizione CSS)

    const primo = p.campioni[0];
    const ultimo = p.campioni[p.campioni.length - 1];
    const v = primo && ultimo && ultimo.t - primo.t > 8 ? (ultimo.y - primo.y) / (ultimo.t - primo.t) : 0;
    const y = Math.min(p.altezza, p.base + (p.y - p.y0));
    const ammesse = ammesseRef.current;
    const offMeta = ammesse.includes('meta') ? Math.max(0, p.altezza - p.meta) : 0;
    const altezzaBassa = ammesse.includes('meta') ? p.meta : p.altezza;

    const oltre = y > offMeta + altezzaBassa * QUOTA_CHIUSURA;
    const lancioGiu = v > LANCIO_CHIUDI && (posizioneRef.current === 'meta' || y > offMeta || !ammesse.includes('meta'));
    if (oltre || lancioGiu) {
      opz.current.onChiudi();
      return;
    }
    let scelta: PosizioneFoglio;
    if (v < -LANCIO_POSIZIONE && ammesse.includes('tutto')) scelta = 'tutto';
    else if (v > LANCIO_POSIZIONE && ammesse.includes('meta')) scelta = 'meta';
    else {
      scelta = ammesse[0] ?? 'meta';
      let d = Infinity;
      for (const q of ammesse) {
        const dq = Math.abs(y - (q === 'tutto' ? 0 : offMeta));
        if (dq < d) {
          d = dq;
          scelta = q;
        }
      }
    }
    setPosizione(scelta);
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => rilascia(e, true), [rilascia]);
  const onPointerCancel = useCallback((e: ReactPointerEvent<HTMLElement>) => rilascia(e, false), [rilascia]);

  /* ---------------------------------------------------------- bottoni e tastiera */

  const imposta = useCallback((p: PosizioneFoglio) => {
    if (!ammesseRef.current.includes(p)) return;
    setPosizione(p);
  }, []);

  const alterna = useCallback(() => {
    const ammesse = ammesseRef.current;
    if (ammesse.length < 2) return;
    setPosizione((p) => (p === 'tutto' ? 'meta' : 'tutto'));
  }, []);

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Escape' || !opz.current.aperto || !opz.current.attivo) return;
    if (e.defaultPrevented) return; // un controllo interno l'ha già usato (es. il nastro annulla l'arrivo fissato)
    e.preventDefault();
    e.stopPropagation();
    opz.current.onChiudi();
  }, []);

  /* ---------------------------------------------------------- uscita */

  const stato: StatoFoglio = !o.attivo ? 'spento' : !o.aperto ? 'chiuso' : posizione;
  const dialogo = o.titoloId !== undefined && o.attivo;

  const propsFoglio = useMemo<PropsFoglio>(
    () => ({
      ref,
      id,
      'data-imb-ix-foglio': stato,
      'data-imb-ix-trascina': trascina ? 'true' : undefined,
      'data-imb-var': '',
      onKeyDown,
      role: dialogo ? 'dialog' : undefined,
      'aria-modal': dialogo ? false : undefined,
      'aria-labelledby': dialogo ? o.titoloId : undefined,
    }),
    [ref, id, stato, trascina, onKeyDown, dialogo, o.titoloId],
  );

  const propsManiglia = useMemo<PropsManiglia>(
    () => ({ onPointerDown, onPointerMove, onPointerUp, onPointerCancel, 'data-imb-ix-maniglia': '' }),
    [onPointerDown, onPointerMove, onPointerUp, onPointerCancel],
  );

  const propsInterruttore = useMemo<PropsInterruttore>(
    () => ({ type: 'button', 'aria-expanded': posizione === 'tutto', 'aria-controls': id, onClick: alterna }),
    [posizione, id, alterna],
  );

  return { stato, posizione, trascina, imposta, alterna, propsFoglio, propsManiglia, propsInterruttore };
}
