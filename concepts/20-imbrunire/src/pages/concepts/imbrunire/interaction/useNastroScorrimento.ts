/**
 * IMBRUNIRE · scorrimento del nastro delle lune (interaction-designer).
 *
 * Il nastro è un contenitore con `overflow-x: auto` (scorrimento nativo).
 * Questo hook aggiunge solo quello che il nativo non fa:
 * - rotella verticale del mouse → scorrimento orizzontale (su desktop la
 *   pagina non scorre, quindi la rotella sopra il nastro serve al nastro);
 * - trascinamento dello SPAZIO VUOTO col mouse o la penna (sopra o sotto le
 *   lune, sui giorni, tra i mesi), con inerzia al rilascio; il dito usa lo
 *   scorrimento nativo (`touch-action: pan-x` sulla fascia dei giorni);
 * - frecce ‹ › che portano all'inizio del mese precedente o successivo;
 * - scorrimento automatico al bordo mentre si seleziona (lo chiede
 *   useSelezioneLune scrivendo `runtime.nastro.bordo`);
 * - l'indice della prima e dell'ultima luna in vista (per i nomi dei mesi
 *   sulle frecce e per `aria-disabled`).
 *
 * Trascinare SU una luna non scorre: seleziona (useSelezioneLune). La
 * distinzione è per bersaglio: ogni `[role="option"]`, bottone o link è
 * escluso dal trascinamento dello spazio vuoto.
 *
 * Un solo ciclo: le funzioni stanno nel ticker (read → update → write), il
 * DOM si scrive solo in 'write' e solo se lo scorrimento cambia.
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import type { DataISO } from '../state/store';
import { useImbrunire } from '../state/store';
import { runtime } from '../state/runtime';
import { ticker } from '../core/ticker';
import { NASTRO } from '../motion/choreography';

/* ------------------------------------------------------------------ costanti */

/** Attributo che ogni luna porta con il suo indice (lo mette propsLuna). */
export const ATTRIBUTO_INDICE = 'data-imb-ix-indice';

/** Bersagli che non avviano il trascinamento dello spazio vuoto. */
const NON_SPAZIO_VUOTO = '[role="option"], button, a[href], input, select, textarea, label, summary';

/** Spostamento oltre il quale un premuto diventa trascinamento (mouse, penna). */
const SOGLIA_TRASCINA_PX = 4;

/*
 * Attrito, velocità minima e velocità al bordo sono del motion-designer
 * (motion/choreography.ts, NASTRO): v(t) = v0 · e^(−attrito · t); al bordo
 * la velocità cresce col quadrato di quanto il puntatore è dentro la zona
 * (runtime.nastro.spinta, 0..1).
 */
const ATTRITO = NASTRO.attrito;
const V_MIN_PX_S = NASTRO.velocitaMinima;

/** Massima velocità d'inerzia (un lancio forte non attraversa l'orizzonte in un colpo). */
const V_MAX_PX_S = 3200;

/** Finestra dei campioni per la velocità al rilascio. */
const FINESTRA_VELOCITA_MS = 90;

/** Righe e pagine della rotella in px. */
const PX_RIGA = 16;

/* ------------------------------------------------------------------ geometria (pura sul DOM, senza stato) */

export interface GeometriaNastro {
  /** x, nelle coordinate del contenuto scorrevole, del bordo sinistro della luna 0. */
  base: number;
  /** Distanza tra i centri di due lune (token --imb-luna-passo / LUNE.passo). */
  passo: number;
  /** Larghezza di un'area luna (misurata). */
  diametro: number;
  /** Larghezza visibile del nastro. */
  larghezza: number;
  scrollLeft: number;
  scrollMax: number;
}

/** Misura il nastro. null se le lune non sono ancora nel DOM. Solo in handler, effetti o fase 'read'. */
export function misuraNastro(scroller: HTMLElement, passo: number): GeometriaNastro | null {
  const prima = scroller.querySelector<HTMLElement>(`[${ATTRIBUTO_INDICE}="0"]`);
  if (!prima) return null;
  const rs = scroller.getBoundingClientRect();
  const rp = prima.getBoundingClientRect();
  return {
    base: rp.left - rs.left + scroller.scrollLeft,
    passo,
    diametro: rp.width,
    larghezza: scroller.clientWidth,
    scrollLeft: scroller.scrollLeft,
    scrollMax: Math.max(0, scroller.scrollWidth - scroller.clientWidth),
  };
}

/** Prima e ultima luna interamente in vista. */
export function lunaInVista(g: GeometriaNastro, totale: number): { primo: number; ultimo: number } {
  if (totale <= 0 || g.passo <= 0) return { primo: 0, ultimo: -1 };
  const primo = Math.ceil((g.scrollLeft - g.base) / g.passo - 0.001);
  const ultimo = Math.floor((g.scrollLeft + g.larghezza - g.base - g.diametro) / g.passo + 0.001);
  return {
    primo: Math.max(0, Math.min(totale - 1, primo)),
    ultimo: Math.max(0, Math.min(totale - 1, ultimo)),
  };
}

export type Allineamento = 'inizio' | 'centro' | 'vicino';

/**
 * scrollLeft che porta la luna `i` in vista.
 * - 'inizio': la luna i dove sta la luna 0 a riposo (il margine sinistro del nastro resta uguale);
 * - 'centro': al centro del nastro;
 * - 'vicino': il minimo spostamento che la mostra con una luna di margine; null se è già in vista.
 */
export function scrollPerIndice(g: GeometriaNastro, i: number, allinea: Allineamento): number | null {
  const sinistra = g.base + i * g.passo;
  const destra = sinistra + g.diametro;
  let bersaglio: number;
  if (allinea === 'inizio') {
    bersaglio = i * g.passo;
  } else if (allinea === 'centro') {
    bersaglio = sinistra + g.diametro / 2 - g.larghezza / 2;
  } else {
    const margine = g.passo;
    if (sinistra - margine < g.scrollLeft) bersaglio = sinistra - margine;
    else if (destra + margine > g.scrollLeft + g.larghezza) bersaglio = destra + margine - g.larghezza;
    else return null;
  }
  return Math.max(0, Math.min(g.scrollMax, Math.round(bersaglio)));
}

/**
 * Scorre il nastro fino alla luna `i`. Usata dalla tastiera del listbox
 * (useSelezioneLune) e dalle frecce dei mesi. Solo in handler o effetti.
 */
export function scorriAIndice(
  scroller: HTMLElement,
  i: number,
  passo: number,
  o: { allinea?: Allineamento; morbido?: boolean } = {},
): void {
  const g = misuraNastro(scroller, passo);
  if (!g) return;
  const x = scrollPerIndice(g, i, o.allinea ?? 'vicino');
  if (x === null || Math.abs(x - g.scrollLeft) < 1) return;
  scroller.scrollTo({ left: x, behavior: o.morbido === true ? 'smooth' : 'auto' });
}

/** Indici in cui comincia un mese (la luna 0 conta sempre come inizio). */
export function inizioMesi(lune: readonly DataISO[]): number[] {
  const inizi: number[] = [];
  lune.forEach((d, i) => {
    if (i === 0 || d.endsWith('-01')) inizi.push(i);
  });
  return inizi;
}

/* ------------------------------------------------------------------ hook */

export interface OpzioniScorrimento {
  /** Le notti del nastro in ordine (le stesse di useSelezioneLune). */
  lune: readonly DataISO[];
  /** Distanza tra i centri delle lune in px (tokens.ts, LUNE.passo della sezione o della torre). */
  passo: number;
}

export interface PropsScorrevole {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  onScroll: () => void;
  /** 'fermo' | 'trascina' (cursore "mano chiusa" in interaction.css). */
  'data-imb-ix-scorre': 'fermo' | 'trascina';
}

export interface PropsFreccia {
  type: 'button';
  'aria-disabled': true | undefined;
  onClick: () => void;
}

export interface NastroScorrimento {
  /** Prima luna interamente in vista (indice). */
  primo: number;
  /** Ultima luna interamente in vista (indice). */
  ultimo: number;
  /** Indice di inizio del mese della prima luna in vista (per il nome del mese a sinistra). */
  meseCorrente: number;
  /** Indice di inizio del mese successivo, o null se è l'ultimo (per il nome sulla freccia ›). */
  meseSuccessivo: number | null;
  puoIndietro: boolean;
  puoAvanti: boolean;
  /** Porta all'inizio del mese precedente (−1) o successivo (+1). */
  mese: (verso: -1 | 1) => void;
  /** Porta in vista la luna i. */
  vaiAIndice: (i: number, allinea?: Allineamento) => void;
  /** Da spargere sul contenitore scorrevole (lo stesso elemento del ref). */
  propsScorrevole: PropsScorrevole;
  /** Da spargere sui bottoni ‹ e › (etichette e icone le mette la sezione). */
  propsIndietro: PropsFreccia;
  propsAvanti: PropsFreccia;
}

interface Campione {
  t: number;
  x: number;
}

export function useNastroScorrimento(nastro: RefObject<HTMLElement>, o: OpzioniScorrimento): NastroScorrimento {
  const { lune, passo } = o;
  const totale = lune.length;
  const ridotto = useImbrunire((s) => s.reducedMotion);

  const mesi = useMemo(() => inizioMesi(lune), [lune]);

  const [vista, setVista] = useState<{ primo: number; ultimo: number }>({ primo: 0, ultimo: 0 });
  const [scorre, setScorre] = useState<'fermo' | 'trascina'>('fermo');

  /* valori letti dal ticker: mai dallo stato React */
  const ridottoRef = useRef(ridotto);
  ridottoRef.current = ridotto;
  const passoRef = useRef(passo);
  passoRef.current = passo;
  const totaleRef = useRef(totale);
  totaleRef.current = totale;
  const vistaRef = useRef(vista);
  vistaRef.current = vista;

  /** Da rileggere nella prossima fase 'read' (scroll, resize, cambio di lune). */
  const daMisurare = useRef(true);
  /** scrollLeft letto in 'read'. */
  const letto = useRef(0);
  const massimo = useRef(0);
  /** scrollLeft da scrivere in 'write' (null = niente da scrivere). */
  const daScrivere = useRef<number | null>(null);

  /* trascinamento dello spazio vuoto */
  const pan = useRef<{ id: number; x0: number; sl0: number; mosso: boolean; x: number; campioni: Campione[] } | null>(null);
  /* inerzia in px/s (positiva = contenuto verso sinistra, scrollLeft che cresce) */
  const inerzia = useRef(0);

  /* ---------------------------------------------------------- ticker */

  useEffect(() => {
    const leggi = (): boolean => {
      const el = nastro.current;
      if (!el) return false;
      const serveGeometria = daMisurare.current;
      const serveScroll = serveGeometria || pan.current !== null || inerzia.current !== 0 || runtime.nastro.bordo !== 0;
      if (!serveScroll) return false;
      letto.current = el.scrollLeft;
      massimo.current = Math.max(0, el.scrollWidth - el.clientWidth);
      if (serveGeometria) {
        daMisurare.current = false;
        const g = misuraNastro(el, passoRef.current);
        if (g) {
          const v = lunaInVista(g, totaleRef.current);
          if (v.primo !== vistaRef.current.primo || v.ultimo !== vistaRef.current.ultimo) {
            vistaRef.current = v;
            setVista(v);
          }
        }
      }
      return false;
    };

    const aggiorna = (dt: number): boolean => {
      let ancora = false;
      const p = pan.current;
      if (p !== null) {
        if (p.mosso) daScrivere.current = p.sl0 - (p.x - p.x0);
      } else if (runtime.nastro.trascina && runtime.nastro.bordo !== 0) {
        inerzia.current = 0;
        const spinta = Math.max(0, Math.min(1, runtime.nastro.spinta));
        daScrivere.current = letto.current + runtime.nastro.bordo * NASTRO.velocitaBordo * spinta * spinta * dt;
        ancora = true;
      } else if (inerzia.current !== 0) {
        const v = inerzia.current;
        daScrivere.current = letto.current + v * dt;
        const nuova = v * Math.exp(-ATTRITO * dt);
        const aiBordi = (v < 0 && letto.current <= 0) || (v > 0 && letto.current >= massimo.current);
        inerzia.current = Math.abs(nuova) < V_MIN_PX_S || aiBordi ? 0 : nuova;
        ancora = inerzia.current !== 0;
      }
      return ancora;
    };

    const scrivi = (): boolean => {
      const el = nastro.current;
      const x = daScrivere.current;
      daScrivere.current = null;
      if (!el || x === null) return false;
      const limitato = Math.max(0, Math.min(massimo.current, Math.round(x)));
      if (Math.abs(limitato - letto.current) >= 1) {
        el.scrollLeft = limitato;
        letto.current = limitato;
        daMisurare.current = true;
        return true;
      }
      return false;
    };

    const togliLeggi = ticker.add(leggi, 'read');
    const togliAggiorna = ticker.add(aggiorna, 'update');
    const togliScrivi = ticker.add(scrivi, 'write');
    return () => {
      togliLeggi();
      togliAggiorna();
      togliScrivi();
      pan.current = null;
      inerzia.current = 0;
    };
  }, [nastro]);

  /* nuove lune o nuovo passo (torre ↔ sezione): rimisura */
  useEffect(() => {
    daMisurare.current = true;
    ticker.wake();
  }, [totale, passo]);

  /* ridimensionamento del nastro: rimisura (niente listener sulla finestra) */
  useEffect(() => {
    const el = nastro.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => {
      daMisurare.current = true;
      ticker.wake();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [nastro]);

  /* reduced motion: nessuna inerzia */
  useEffect(() => {
    if (ridotto) inerzia.current = 0;
  }, [ridotto]);

  /* ---------------------------------------------------------- rotella */

  useEffect(() => {
    const el = nastro.current;
    if (!el) return undefined;
    const suRotella = (e: WheelEvent): void => {
      if (e.ctrlKey) return; // pizzico sul trackpad = zoom del browser, non nostro
      const verticale = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (!verticale) return; // orizzontale: lo fa il browser
      const scala = e.deltaMode === 1 ? PX_RIGA : e.deltaMode === 2 ? el.clientWidth : 1;
      const d = e.deltaY * scala;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const puo = (d < 0 && el.scrollLeft > 0) || (d > 0 && el.scrollLeft < max);
      if (!puo) return; // ai bordi la rotella torna alla pagina (torre, foglio)
      e.preventDefault();
      inerzia.current = 0;
      const base = daScrivere.current ?? el.scrollLeft;
      daScrivere.current = base + d;
      letto.current = el.scrollLeft;
      massimo.current = max;
      ticker.wake();
    };
    el.addEventListener('wheel', suRotella, { passive: false });
    return () => el.removeEventListener('wheel', suRotella);
  }, [nastro]);

  /* ---------------------------------------------------------- spazio vuoto col mouse */

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch') return; // il dito scorre in modo nativo
    if (e.button !== 0) return;
    if (runtime.nastro.trascina) return; // una selezione è partita da una luna
    const bersaglio = e.target instanceof Element ? e.target : null;
    if (bersaglio && bersaglio.closest(NON_SPAZIO_VUOTO)) return;
    const el = e.currentTarget;
    inerzia.current = 0;
    const t = performance.now();
    pan.current = { id: e.pointerId, x0: e.clientX, sl0: el.scrollLeft, mosso: false, x: e.clientX, campioni: [{ t, x: e.clientX }] };
    letto.current = el.scrollLeft;
    massimo.current = Math.max(0, el.scrollWidth - el.clientWidth);
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_e) {
      /* puntatore già rilasciato: il trascinamento finisce al prossimo up */
    }
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const p = pan.current;
    if (p === null || e.pointerId !== p.id) return;
    p.x = e.clientX;
    const t = performance.now();
    p.campioni.push({ t, x: e.clientX });
    while (p.campioni.length > 2 && t - (p.campioni[0]?.t ?? t) > FINESTRA_VELOCITA_MS) p.campioni.shift();
    if (!p.mosso && Math.abs(p.x - p.x0) > SOGLIA_TRASCINA_PX) {
      p.mosso = true;
      setScorre('trascina');
    }
    if (p.mosso) ticker.wake();
  }, []);

  const chiudiPan = useCallback((e: ReactPointerEvent<HTMLElement>, conInerzia: boolean) => {
    const p = pan.current;
    if (p === null || e.pointerId !== p.id) return;
    pan.current = null;
    setScorre('fermo');
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_e) {
      /* già rilasciato */
    }
    if (!conInerzia || !p.mosso || ridottoRef.current) return;
    const primo = p.campioni[0];
    const ultimo = p.campioni[p.campioni.length - 1];
    if (!primo || !ultimo || ultimo.t - primo.t < 8) return;
    const vx = ((ultimo.x - primo.x) / (ultimo.t - primo.t)) * 1000; // px/s del puntatore
    const v = Math.max(-V_MAX_PX_S, Math.min(V_MAX_PX_S, -vx)); // il contenuto va al contrario
    if (Math.abs(v) >= V_MIN_PX_S * 4) {
      inerzia.current = v;
      ticker.wake();
    }
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => chiudiPan(e, true), [chiudiPan]);
  const onPointerCancel = useCallback((e: ReactPointerEvent<HTMLElement>) => chiudiPan(e, false), [chiudiPan]);

  const onScroll = useCallback(() => {
    daMisurare.current = true;
    ticker.wake();
  }, []);

  /* ---------------------------------------------------------- mesi e salti */

  const vaiAIndice = useCallback(
    (i: number, allinea: Allineamento = 'vicino') => {
      const el = nastro.current;
      if (!el || totaleRef.current === 0) return;
      inerzia.current = 0;
      const j = Math.max(0, Math.min(totaleRef.current - 1, Math.round(i)));
      scorriAIndice(el, j, passoRef.current, { allinea, morbido: !ridottoRef.current });
    },
    [nastro],
  );

  const mese = useCallback(
    (verso: -1 | 1) => {
      const el = nastro.current;
      if (!el) return;
      const g = misuraNastro(el, passoRef.current);
      const primo = g ? lunaInVista(g, totaleRef.current).primo : vistaRef.current.primo;
      let bersaglio: number;
      if (verso === 1) {
        bersaglio = mesi.find((m) => m > primo) ?? totaleRef.current - 1;
      } else {
        const prima = mesi.filter((m) => m < primo);
        bersaglio = prima.length > 0 ? (prima[prima.length - 1] ?? 0) : 0;
      }
      vaiAIndice(bersaglio, 'inizio');
    },
    [nastro, mesi, vaiAIndice],
  );

  /* ---------------------------------------------------------- uscita */

  const meseCorrente = useMemo(() => {
    let m = 0;
    for (const inizio of mesi) {
      if (inizio <= vista.primo) m = inizio;
      else break;
    }
    return m;
  }, [mesi, vista.primo]);

  const meseSuccessivo = useMemo(() => mesi.find((m) => m > vista.primo) ?? null, [mesi, vista.primo]);

  const puoIndietro = vista.primo > 0;
  const puoAvanti = totale > 0 && vista.ultimo < totale - 1;

  const indietro = useCallback(() => {
    if (vistaRef.current.primo > 0) mese(-1);
  }, [mese]);
  const avanti = useCallback(() => {
    if (vistaRef.current.ultimo < totaleRef.current - 1) mese(1);
  }, [mese]);

  const propsScorrevole = useMemo<PropsScorrevole>(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onScroll,
      'data-imb-ix-scorre': scorre,
    }),
    [onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onScroll, scorre],
  );

  const propsIndietro = useMemo<PropsFreccia>(
    () => ({ type: 'button', 'aria-disabled': puoIndietro ? undefined : true, onClick: indietro }),
    [puoIndietro, indietro],
  );
  const propsAvanti = useMemo<PropsFreccia>(
    () => ({ type: 'button', 'aria-disabled': puoAvanti ? undefined : true, onClick: avanti }),
    [puoAvanti, avanti],
  );

  return {
    primo: vista.primo,
    ultimo: vista.ultimo,
    meseCorrente,
    meseSuccessivo,
    puoIndietro,
    puoAvanti,
    mese,
    vaiAIndice,
    propsScorrevole,
    propsIndietro,
    propsAvanti,
  };
}
