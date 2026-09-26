/**
 * SOTTOSCOCCA · trascinamento del blocco "il tuo lavoro" sul planning.
 *
 * Contratto (creative-director 4.4, ux-architect 6.1 P3-P7, 6.4, 7.7;
 * tech-architect 4, 6):
 * - MOUSE e PENNA: il trascinamento parte appena il puntatore si sposta di
 *   4 px con il tasto premuto; sotto quella soglia è un clic (la sezione lo
 *   usa: nel parcheggio "mettilo nel primo buco");
 * - DITO: il semplice scorrere col dito sul planning scorre la pagina. Il
 *   blocco si afferra solo TENENDOLO PREMUTO 400 ms senza muoversi (tolleranza
 *   8 px). Dopo 150 ms fermi il blocco mostra che "sta per staccarsi"
 *   (`data-ssc-presa="in-attesa"`, una linea che cresce sotto il blocco);
 *   a 400 ms è afferrato. Da quel momento, e solo per quel blocco, lo scroll
 *   è bloccato: `touch-action: none` sul blocco afferrato (CSS) e, perché
 *   `touch-action` il browser lo legge al `touchstart`, anche un `touchmove`
 *   NON passivo sul blocco che chiama `preventDefault` solo quando è
 *   afferrato. Tutto il resto della pagina scorre come sempre;
 * - mentre si trascina il blocco segue il puntatore liberamente
 *   (`--ssc-ix-dx`, `--ssc-ix-dy`, scritte nella fase `write` del ticker) e la
 *   sezione riceve l'ANTEPRIMA agganciata (ponte + inizio a passi di 10') solo
 *   quando cambia, per disegnare l'ombra di aggancio, la scritta "ci sta" /
 *   "non ci sta" e attenuare le corsie non adatte (P3);
 * - se la pagina scorre durante il gesto (rotella), blocco e anteprima
 *   restano giusti: si tiene conto di `runtime.scrollY`;
 * - RILASCIO: la sezione riceve la posizione (o `null` se fuori dal
 *   planning) e decide lo stato (P4 piazzato, P5 non ci sta, P6 ponte
 *   sbagliato, P7 fuori orario) con la logica pura di PonteLibero/planning.ts;
 *   l'azione avviene al rilascio (WCAG 2.5.2);
 * - ANNULLARE: Esc durante il gesto, oppure rilasciare fuori dal planning; il
 *   blocco torna dov'era;
 * - AGGANCIO: dopo il rilascio (e dopo ogni spostamento fatto dalla sezione,
 *   se chiama `preparaAggancio()` prima di cambiare stato) il blocco SCIVOLA
 *   dalla posizione in cui si trovava a quella nuova (FLIP: misura prima,
 *   misura dopo, transizione CSS del solo `transform`). Con reduced motion si
 *   aggancia di scatto;
 * - il clic che il browser manda dopo un trascinamento viene ignorato; il
 *   menu contestuale della pressione lunga (Android) e il fumetto di
 *   selezione (iOS) non compaiono mentre si afferra.
 *
 * Il trascinamento non è MAI l'unico modo (WCAG 2.5.7): tocco sul buco,
 * "Primo buco libero", elenco dei buchi e tastiera (useBloccoTastiera.ts)
 * portano allo stesso risultato.
 *
 * L'attributo `data-ssc-presa` e le variabili `--ssc-ix-dx/-dy` li gestisce
 * SOLO questo modulo, direttamente sull'elemento: la sezione non li mette nel
 * JSX (React li sovrascriverebbe). Lo stato grossolano per React è `stato`.
 *
 * Uso (sections/PonteLibero/Blocco.tsx):
 *
 *   const presa = useTrascinaBlocco({
 *     abilitato: invio !== 'sending' && invio !== 'sent',
 *     misura: () => misuraPlanning(refPlanning.current, durata),
 *     onAnteprima: setAnteprima,
 *     onRilascio: (pos, esito) => { presa.preparaAggancio(); piazzaDaTrascinamento(pos, esito); },
 *   });
 *   <button className="ssc-ix-blocco ..." ref={unisciRef(presa.ref, mioRef)} {...presa.props}
 *           onClick={...} onKeyDown={tastiera.onKeyDown} aria-describedby="...">
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefCallback,
} from 'react';
import type { Ponte } from '../content/lavori';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';
import { useSottoscocca } from '../state/store';
import { adesso } from './util';

/* ------------------------------------------------------------------ costanti */

/** Pressione del dito necessaria per afferrare il blocco (ux-architect 6.4). */
export const PRESA_TOUCH_MS = 400;
/** Dopo quanto il blocco mostra che "sta per staccarsi" (evita segnali durante lo scroll normale). */
export const ATTESA_VISIBILE_MS = 150;
/** Movimento del dito che, prima della presa, vuol dire "sto scorrendo". */
const TOLLERANZA_TOUCH_PX = 8;
/** Movimento del mouse che trasforma una pressione in trascinamento. */
const SOGLIA_MOUSE_PX = 4;
/** Passo di aggancio del planning (creative-director 4.4: 10 minuti). */
export const PASSO_MINUTI = 10;
/** Durata dello scivolamento di aggancio (uguale a `--ssc-ix-aggancio-ms` in interaction.css). */
export const AGGANCIO_MS = 220;
/** Finestra in cui il clic nativo dopo un trascinamento viene ignorato. */
const CLIC_GEMELLO_MS = 400;

/* ------------------------------------------------------------------ tipi */

/** Asse del TEMPO sullo schermo: 'x' planning orizzontale (desktop), 'y' verticale (telefono). */
export type AsseTempo = 'x' | 'y';

export interface PosizioneTrascinata {
  readonly ponte: Ponte;
  /** Minuti da mezzanotte, multipli di PASSO_MINUTI. */
  readonly inizio: number;
}

/**
 * Geometria del planning, misurata dalla sezione AL MOMENTO DELLA PRESA
 * (letture di layout ammesse: siamo in un handler, fuori dal ticker).
 * Coordinate in px CSS della finestra (clientX/clientY) al momento della
 * misura: il modulo corregge da solo lo scroll successivo.
 */
export interface MappaPlanning {
  readonly asse: AsseTempo;
  /**
   * Lunghezza in px, lungo l'asse del tempo, del blocco in scala (durata ×
   * px al minuto). Serve a tenere il puntatore "dentro" il blocco anche se nel
   * parcheggio il blocco è disegnato più lungo.
   */
  readonly lunghezza: number;
  /**
   * Coordinata lungo l'asse del tempo → minuti da mezzanotte (non agganciati).
   * Anche la fascia "chiuso" della pausa restituisce un minuto (12:30-14:00
   * in proporzione): è la sezione che, al rilascio, dice "fuori orario" (P7).
   * `null` solo fuori dal planning.
   */
  minutoDa(coord: number): number | null;
  /** Coordinata sull'asse traverso → ponte della corsia, `null` fuori dalle corsie. */
  ponteDa(coord: number): Ponte | null;
}

/** 'rilascio': lasciato sul planning; 'fuori': lasciato fuori (torna dov'era); 'annullato': Esc o gesto interrotto. */
export type EsitoTrascinamento = 'rilascio' | 'fuori' | 'annullato';

/** Stato grossolano per React (il dettaglio visivo è in `data-ssc-presa`). */
export type StatoPresa = 'fermo' | 'in-attesa' | 'afferrato';

export interface OpzioniTrascinaBlocco {
  /** false durante l'invio e dopo il successo: nessuna presa, il clic passa. */
  readonly abilitato: boolean;
  /** Misura il planning; `null` se non è in pagina (nessun trascinamento). */
  readonly misura: () => MappaPlanning | null;
  /** Anteprima agganciata cambiata (o `null` fuori dal planning). */
  readonly onAnteprima?: (pos: PosizioneTrascinata | null) => void;
  /** Il blocco è stato afferrato (per annunci o per chiudere la mensola). */
  readonly onPresa?: () => void;
  /** Fine del gesto. `pos` è `null` con 'fuori' e 'annullato'. */
  readonly onRilascio: (pos: PosizioneTrascinata | null, esito: EsitoTrascinamento) => void;
}

export interface TrascinaBlocco {
  readonly stato: StatoPresa;
  /** Da unire al ref del blocco (serve per misure, touchmove non passivo e scritture). */
  readonly ref: RefCallback<HTMLElement>;
  readonly props: {
    readonly onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onLostPointerCapture: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onClickCapture: (e: ReactMouseEvent<HTMLElement>) => void;
    readonly onContextMenu: (e: ReactMouseEvent<HTMLElement>) => void;
  };
  /**
   * Da chiamare PRIMA di cambiare la posizione del blocco nello store (dopo un
   * rilascio, "Primo buco libero", un buco dell'elenco, la tastiera, "10'
   * prima/dopo"): al frame dopo il blocco scivola dalla posizione vecchia
   * alla nuova. Senza effetto con reduced motion.
   */
  preparaAggancio(): void;
}

/* ------------------------------------------------------------------ utilità pure */

/** Aggancia i minuti al passo del planning. */
export function agganciaMinuti(minuti: number, passo: number = PASSO_MINUTI): number {
  return Math.round(minuti / passo) * passo;
}

/* ------------------------------------------------------------------ macchina del gesto */

type Fase = 'fermo' | 'attesa-mouse' | 'attesa-touch' | 'afferrato';

interface Gesto {
  fase: Fase;
  pointerId: number;
  tipo: string;
  x0: number;
  y0: number;
  scroll0: number;
  x: number;
  y: number;
  /** Distanza tra il puntatore e il bordo d'inizio del blocco, lungo l'asse del tempo. */
  scostamento: number;
  mappa: MappaPlanning | null;
  anteprima: PosizioneTrascinata | null;
  /** Ultimi valori scritti nel DOM. */
  dxScritto: number;
  dyScritto: number;
  dx: number;
  dy: number;
}

interface Flip {
  prima: DOMRect;
  passo: 'misura' | 'inizio' | 'via';
  dx: number;
  dy: number;
}

function gestoVuoto(): Gesto {
  return {
    fase: 'fermo',
    pointerId: -1,
    tipo: '',
    x0: 0,
    y0: 0,
    scroll0: 0,
    x: 0,
    y: 0,
    scostamento: 0,
    mappa: null,
    anteprima: null,
    dxScritto: 0,
    dyScritto: 0,
    dx: 0,
    dy: 0,
  };
}

function stessaPosizione(a: PosizioneTrascinata | null, b: PosizioneTrascinata | null): boolean {
  if (a === null || b === null) return a === b;
  return a.ponte === b.ponte && a.inizio === b.inizio;
}

export function useTrascinaBlocco(opzioni: OpzioniTrascinaBlocco): TrascinaBlocco {
  const [stato, setStato] = useState<StatoPresa>('fermo');
  const ridotto = useSottoscocca((s) => s.reducedMotion);

  const opz = useRef(opzioni);
  opz.current = opzioni;
  const ridottoRef = useRef(ridotto);
  ridottoRef.current = ridotto;

  const el = useRef<HTMLElement | null>(null);
  const g = useRef<Gesto>(gestoVuoto());
  const flip = useRef<Flip | null>(null);
  const presaAttr = useRef<string>('fermo');
  const ignoraClicFino = useRef<number>(0);
  const timerVisibile = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerPresa = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerFineAggancio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const togliTicker = useRef<Array<() => void>>([]);
  const togliFlip = useRef<Array<() => void>>([]);
  const togliEsc = useRef<(() => void) | null>(null);

  /* ---- attributo di stato sul DOM (solo questo modulo lo scrive) ---- */

  const impostaPresa = useCallback((valore: string) => {
    presaAttr.current = valore;
    const nodo = el.current;
    if (!nodo) return;
    if (valore === 'fermo') nodo.removeAttribute('data-ssc-presa');
    else nodo.setAttribute('data-ssc-presa', valore);
  }, []);

  const scriviSpostamento = useCallback((dx: number, dy: number) => {
    const nodo = el.current;
    if (!nodo) return;
    nodo.style.setProperty('--ssc-ix-dx', `${dx.toFixed(1)}px`);
    nodo.style.setProperty('--ssc-ix-dy', `${dy.toFixed(1)}px`);
  }, []);

  const pulisciTimer = useCallback(() => {
    if (timerVisibile.current !== null) clearTimeout(timerVisibile.current);
    if (timerPresa.current !== null) clearTimeout(timerPresa.current);
    timerVisibile.current = null;
    timerPresa.current = null;
  }, []);

  const staccaTicker = useCallback(() => {
    togliTicker.current.forEach((togli) => togli());
    togliTicker.current = [];
  }, []);

  const staccaEsc = useCallback(() => {
    togliEsc.current?.();
    togliEsc.current = null;
  }, []);

  /* ---- aggancio FLIP ---- */

  const fermaFlip = useCallback(() => {
    togliFlip.current.forEach((togli) => togli());
    togliFlip.current = [];
    flip.current = null;
    if (timerFineAggancio.current !== null) clearTimeout(timerFineAggancio.current);
    timerFineAggancio.current = null;
  }, []);

  const preparaAggancio = useCallback(() => {
    fermaFlip();
    const nodo = el.current;
    if (!nodo || ridottoRef.current) {
      scriviSpostamento(0, 0);
      if (g.current.fase === 'fermo') impostaPresa('fermo');
      return;
    }
    // "Prima": dove il blocco si vede adesso (con l'eventuale spostamento del trascinamento).
    const prima = nodo.getBoundingClientRect();
    // Da qui niente transizione e spostamento azzerato: la misura "dopo" deve vedere la sola posizione di layout.
    impostaPresa('aggancio-inizio');
    scriviSpostamento(0, 0);
    flip.current = { prima, passo: 'misura', dx: 0, dy: 0 };

    const leggi = () => {
      const f = flip.current;
      const nodoOra = el.current;
      if (!f || f.passo !== 'misura') return false;
      if (!nodoOra) {
        fermaFlip();
        return false;
      }
      const dopo = nodoOra.getBoundingClientRect();
      f.dx = f.prima.left - dopo.left;
      f.dy = f.prima.top - dopo.top;
      f.passo = 'inizio';
      return true;
    };

    const scrivi = () => {
      const f = flip.current;
      if (!f) return false;
      if (f.passo === 'inizio') {
        if (Math.abs(f.dx) < 0.5 && Math.abs(f.dy) < 0.5) {
          scriviSpostamento(0, 0);
          impostaPresa('fermo');
          fermaFlip();
          return false;
        }
        impostaPresa('aggancio-inizio');
        scriviSpostamento(f.dx, f.dy);
        f.passo = 'via';
        return true;
      }
      if (f.passo === 'via') {
        impostaPresa('aggancio');
        scriviSpostamento(0, 0);
        togliFlip.current.forEach((togli) => togli());
        togliFlip.current = [];
        flip.current = null;
        timerFineAggancio.current = setTimeout(() => {
          timerFineAggancio.current = null;
          if (presaAttr.current === 'aggancio') impostaPresa('fermo');
        }, AGGANCIO_MS + 60);
        return false;
      }
      return true;
    };

    togliFlip.current = [ticker.add(leggi, 'read'), ticker.add(scrivi, 'write')];
  }, [fermaFlip, impostaPresa, scriviSpostamento]);

  /* ---- ciclo del gesto ---- */

  const calcolaAnteprima = useCallback((gesto: Gesto): PosizioneTrascinata | null => {
    const mappa = gesto.mappa;
    if (!mappa) return null;
    const scorsa = runtime.scrollY - gesto.scroll0;
    // Coordinate nel sistema della misura (fatta alla presa).
    const xMisura = gesto.x;
    const yMisura = gesto.y + scorsa;
    const tempo = mappa.asse === 'x' ? xMisura - gesto.scostamento : yMisura - gesto.scostamento;
    const traverso = mappa.asse === 'x' ? yMisura : xMisura;
    const ponte = mappa.ponteDa(traverso);
    const minuto = mappa.minutoDa(tempo);
    if (ponte === null || minuto === null) return null;
    return { ponte, inizio: agganciaMinuti(minuto) };
  }, []);

  const aggiorna = useCallback(() => {
    const gesto = g.current;
    if (gesto.fase !== 'afferrato') return false;
    const scorsa = runtime.scrollY - gesto.scroll0;
    gesto.dx = gesto.x - gesto.x0;
    gesto.dy = gesto.y - gesto.y0 + scorsa;
    const pos = calcolaAnteprima(gesto);
    if (!stessaPosizione(pos, gesto.anteprima)) {
      gesto.anteprima = pos;
      opz.current.onAnteprima?.(pos);
    }
    return false;
  }, [calcolaAnteprima]);

  const scrivi = useCallback(() => {
    const gesto = g.current;
    if (gesto.fase !== 'afferrato') return false;
    if (Math.abs(gesto.dx - gesto.dxScritto) < 0.25 && Math.abs(gesto.dy - gesto.dyScritto) < 0.25) return false;
    gesto.dxScritto = gesto.dx;
    gesto.dyScritto = gesto.dy;
    scriviSpostamento(gesto.dx, gesto.dy);
    return false;
  }, [scriviSpostamento]);

  const concludi = useCallback(
    (esito: EsitoTrascinamento | null) => {
      const gesto = g.current;
      const eraAfferrato = gesto.fase === 'afferrato';
      pulisciTimer();
      staccaTicker();
      staccaEsc();
      const nodo = el.current;
      if (nodo && gesto.pointerId >= 0 && nodo.hasPointerCapture(gesto.pointerId)) {
        nodo.releasePointerCapture(gesto.pointerId);
      }
      g.current = gestoVuoto();
      setStato('fermo');

      if (!eraAfferrato) {
        impostaPresa('fermo');
        return;
      }
      ignoraClicFino.current = adesso() + CLIC_GEMELLO_MS;
      // L'ultimo spostamento calcolato potrebbe non essere ancora nel DOM: lo si scrive ora, così la
      // misura "prima" dell'aggancio è quella che l'utente vede.
      scriviSpostamento(gesto.dx, gesto.dy);
      opz.current.onAnteprima?.(null);
      // Il blocco scivolerà dalla posizione in cui è stato lasciato a quella decisa dalla sezione.
      preparaAggancio();
      if (esito === 'rilascio') {
        opz.current.onRilascio(gesto.anteprima, gesto.anteprima ? 'rilascio' : 'fuori');
      } else {
        opz.current.onRilascio(null, esito ?? 'annullato');
      }
    },
    [impostaPresa, preparaAggancio, pulisciTimer, staccaEsc, staccaTicker],
  );

  const afferra = useCallback(() => {
    const gesto = g.current;
    const nodo = el.current;
    if (!nodo || (gesto.fase !== 'attesa-mouse' && gesto.fase !== 'attesa-touch')) return;
    const mappa = opz.current.misura();
    if (!mappa) {
      concludi(null);
      return;
    }
    pulisciTimer();
    fermaFlip();
    const r = nodo.getBoundingClientRect();
    const lungo = mappa.asse === 'x' ? gesto.x0 - r.left : gesto.y0 - r.top;
    gesto.fase = 'afferrato';
    gesto.mappa = mappa;
    gesto.scostamento = Math.min(Math.max(lungo, 0), Math.max(mappa.lunghezza, 0));
    gesto.dxScritto = Number.NaN;
    gesto.dyScritto = Number.NaN;
    impostaPresa('afferrato');
    setStato('afferrato');

    staccaTicker();
    togliTicker.current = [ticker.add(aggiorna, 'update'), ticker.add(scrivi, 'write')];

    // Esc annulla: in cattura sulla finestra, prima di qualunque altro gestore (scheda, popover).
    const vista = nodo.ownerDocument.defaultView;
    if (vista) {
      const onEsc = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        concludi('annullato');
      };
      vista.addEventListener('keydown', onEsc, true);
      togliEsc.current = () => vista.removeEventListener('keydown', onEsc, true);
    }
    opz.current.onPresa?.();
  }, [aggiorna, concludi, fermaFlip, impostaPresa, pulisciTimer, scrivi, staccaTicker]);

  /* ---- gestori del puntatore ---- */

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!opz.current.abilitato) return;
      if (g.current.fase !== 'fermo') return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!e.isPrimary) return;
      const gesto = gestoVuoto();
      gesto.pointerId = e.pointerId;
      gesto.tipo = e.pointerType;
      gesto.x0 = gesto.x = e.clientX;
      gesto.y0 = gesto.y = e.clientY;
      gesto.scroll0 = runtime.scrollY;
      g.current = gesto;

      if (e.pointerType === 'touch') {
        gesto.fase = 'attesa-touch';
        timerVisibile.current = setTimeout(() => {
          timerVisibile.current = null;
          if (g.current.fase === 'attesa-touch') {
            impostaPresa('in-attesa');
            setStato('in-attesa');
          }
        }, ATTESA_VISIBILE_MS);
        timerPresa.current = setTimeout(() => {
          timerPresa.current = null;
          afferra();
        }, PRESA_TOUCH_MS);
        return;
      }
      // Mouse e penna: cattura subito, il trascinamento parte oltre la soglia.
      gesto.fase = 'attesa-mouse';
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [afferra, impostaPresa],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const gesto = g.current;
      if (gesto.fase === 'fermo' || e.pointerId !== gesto.pointerId) return;
      gesto.x = e.clientX;
      gesto.y = e.clientY;
      const spostato = Math.hypot(gesto.x - gesto.x0, gesto.y - gesto.y0);
      if (gesto.fase === 'attesa-touch') {
        // Il dito si è mosso prima della presa: è uno scroll, il blocco resta dov'è.
        if (spostato > TOLLERANZA_TOUCH_PX) concludi(null);
        return;
      }
      if (gesto.fase === 'attesa-mouse') {
        if (spostato >= SOGLIA_MOUSE_PX) afferra();
        return;
      }
      ticker.wake();
    },
    [afferra, concludi],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const gesto = g.current;
      if (gesto.fase === 'fermo' || e.pointerId !== gesto.pointerId) return;
      gesto.x = e.clientX;
      gesto.y = e.clientY;
      if (gesto.fase === 'afferrato') {
        // Posizione finale esatta, anche se l'ultimo pointermove non è stato elaborato.
        aggiorna();
        concludi('rilascio');
        return;
      }
      concludi(null);
    },
    [aggiorna, concludi],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const gesto = g.current;
      if (gesto.fase === 'fermo' || e.pointerId !== gesto.pointerId) return;
      concludi(gesto.fase === 'afferrato' ? 'annullato' : null);
    },
    [concludi],
  );

  const onLostPointerCapture = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const gesto = g.current;
      // Con il dito la cattura implicita si perde anche al rilascio normale: conta solo per il mouse.
      if (gesto.fase !== 'afferrato' || gesto.tipo === 'touch' || e.pointerId !== gesto.pointerId) return;
      concludi('annullato');
    },
    [concludi],
  );

  const onClickCapture = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (adesso() < ignoraClicFino.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const onContextMenu = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (g.current.fase !== 'fermo') e.preventDefault();
  }, []);

  /* ---- ref: touchmove non passivo e riapplicazione dello stato ---- */

  const togliTouch = useRef<(() => void) | null>(null);

  const ref = useCallback<RefCallback<HTMLElement>>(
    (nodo) => {
      togliTouch.current?.();
      togliTouch.current = null;
      el.current = nodo;
      if (!nodo) return;
      const onTouchMove = (e: TouchEvent) => {
        if (g.current.fase === 'afferrato' && e.cancelable) e.preventDefault();
      };
      nodo.addEventListener('touchmove', onTouchMove, { passive: false });
      togliTouch.current = () => nodo.removeEventListener('touchmove', onTouchMove);
      // Il blocco può essere rimontato (dal parcheggio a una corsia): lo stato visivo lo segue.
      if (presaAttr.current !== 'fermo') nodo.setAttribute('data-ssc-presa', presaAttr.current);
    },
    [],
  );

  /* ---- disabilitazione e smontaggio ---- */

  useEffect(() => {
    if (!opzioni.abilitato && g.current.fase !== 'fermo') concludi('annullato');
  }, [concludi, opzioni.abilitato]);

  useEffect(
    () => () => {
      pulisciTimer();
      staccaTicker();
      staccaEsc();
      fermaFlip();
      togliTouch.current?.();
      togliTouch.current = null;
    },
    [fermaFlip, pulisciTimer, staccaEsc, staccaTicker],
  );

  const props = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      onClickCapture,
      onContextMenu,
    }),
    [onClickCapture, onContextMenu, onLostPointerCapture, onPointerCancel, onPointerDown, onPointerMove, onPointerUp],
  );

  return useMemo(() => ({ stato, ref, props, preparaAggancio }), [preparaAggancio, props, ref, stato]);
}
