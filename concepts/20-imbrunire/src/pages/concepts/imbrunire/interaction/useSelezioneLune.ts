/**
 * IMBRUNIRE · "Scegli le lune": la selezione delle notti sul nastro
 * (interaction-designer; creative-director §7.3 e §9, ux-architect 5.4, 6.1, 7.4;
 * tech-architect §6.8).
 *
 * Tre vie, uno stesso stato (la stessa chiamata a `onCambia`):
 *
 * 1. TRASCINARE su una luna (mouse, penna, dito). Mouse e penna: il gesto
 *    parte dopo 4 px di spostamento orizzontale. Dito: parte dopo 120 ms di
 *    tenuta o dopo 8 px di spostamento orizzontale partito da una luna; uno
 *    spostamento verticale prima di allora lascia il dito al browser (le lune
 *    hanno `touch-action: pan-y`: il foglio e la torre scorrono). L'indice si
 *    calcola dall'ascissa, mai con `elementFromPoint`; gli eventi si fondono
 *    nel ticker (al più un `onCambia` per frame). Vicino ai bordi il nastro
 *    scorre da solo (runtime.nastro.bordo → useNastroScorrimento). Rilasciare
 *    lontano dal nastro, o un secondo dito, ANNULLA: la selezione torna com'era.
 * 2. TOCCO + TOCCO: il primo tocco fissa l'arrivo (stato P3, il palazzo non
 *    cambia), il secondo l'ultima notte; lo stesso tocco due volte = una notte.
 *    Col mouse, dopo il primo clic le lune fino al puntatore sono in anteprima.
 * 3. TASTIERA (listbox con aria-activedescendant): ← → luna attiva; Maiusc+← →
 *    allarga o stringe dalla luna fissata; Invio/Spazio fissa arrivo e poi
 *    ultima notte; Pag↑/Pag↓ mese; Home stasera; Fine ultima notte; Esc annulla
 *    la luna fissata, poi chiude (onEsc); Canc svuota.
 *
 * Limiti applicati QUI, a partire dalla luna d'ancoraggio (così anche un
 * trascinamento all'indietro si ferma dalla parte giusta): notti di chiusura,
 * notti occupate della stanza filtro ("Le mie notti qui"), massimo 14 notti.
 * Il motivo del fermo va a `onCambia` (lo store lo mostra nella riga di stato);
 * lo store resta la fonte di verità e rifà le sue validazioni (minimo di agosto).
 *
 * Annunci: `info.stabile` è true alla fine di un gesto, a ogni tocco o Invio,
 * e dopo 500 ms fermi durante un trascinamento o Maiusc+frecce. La riga di
 * stato annuncia solo quando `inCorso` è false (ux-architect 7.4).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';
import type { DataISO, MotivoSelezione, Selezione, SlugCamera } from '../state/store';
import { useImbrunire } from '../state/store';
import { runtime } from '../state/runtime';
import { ticker } from '../core/ticker';
import { NOTTI_MAX, chiuso, differenzaGiorni } from '../core/date';
import { occupata } from '../dati/disponibilita';
import { NASTRO } from '../motion/choreography';
import { ATTRIBUTO_INDICE, inizioMesi, scorriAIndice } from './useNastroScorrimento';

/* ------------------------------------------------------------------ costanti */

/* Tempi e soglie condivisi col motion-designer (motion/choreography.ts, NASTRO). */
/** Tenuta del dito su una luna prima che il gesto diventi selezione (ux 5.4). */
const TENUTA_DITO_MS = NASTRO.tenuta;
/** Spostamento orizzontale che trasforma il premuto in trascinamento. */
const SOGLIA_DITO_PX = NASTRO.sogliaSelezione;
const SOGLIA_MOUSE_PX = 4;
/** Spostamento verticale del dito che restituisce il gesto al browser. */
const SOGLIA_VERTICALE_DITO_PX = 10;
/** Zona ai bordi del nastro in cui parte lo scorrimento automatico. */
const ZONA_BORDO_PX = NASTRO.zonaBordo;
/** Oltre questa distanza sopra o sotto il nastro, il rilascio annulla. */
const FUORI_PX = 36;
/** Pausa dopo cui una selezione in corso si può annunciare. */
const PAUSA_ANNUNCIO_MS = NASTRO.annuncio;
/** Un clic che arriva così presto dopo un puntatore è lo stesso gesto: si ignora. */
const CLIC_GEMELLO_MS = 600;

/* ------------------------------------------------------------------ tipi */

export type MotivoFermo = Extract<MotivoSelezione, 'troppe-notti' | 'chiuso' | 'notte-occupata'>;

export interface InfoCambio {
  /** Perché la selezione si è fermata prima di dove voleva l'utente (o perché una luna è stata rifiutata). */
  motivo: MotivoFermo | null;
  /** true = fine del gesto o pausa: si può annunciare e aggiornare l'hash. */
  stabile: boolean;
}

export interface OpzioniSelezione {
  /** Le notti del nastro in ordine, consecutive, da stasera (lunePerIntervallo(oggi, 240)). */
  lune: readonly DataISO[];
  /** px tra i centri delle lune (tokens.ts, LUNE.passo della sezione o della torre). */
  passo: number;
  /** Stanza di "Le mie notti qui": la selezione non attraversa le sue notti occupate. */
  filtro: SlugCamera | null;
  /** Di norma: (sel, info) => scegliNotti(sel, { filtro, motivo: info.motivo }). */
  onCambia: (sel: Selezione | null, info: InfoCambio) => void;
  /** Esc senza niente da annullare: di norma chiudiStratoAlto() di core/rotta. */
  onEsc?: () => void;
}

export interface PropsListbox {
  role: 'listbox';
  'aria-multiselectable': true;
  'aria-orientation': 'horizontal';
  'aria-activedescendant': string | undefined;
  tabIndex: 0;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  onKeyUp: (e: ReactKeyboardEvent<HTMLElement>) => void;
  onBlur: (e: ReactFocusEvent<HTMLElement>) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  onLostPointerCapture: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => void;
  /** 'fermo' | 'trascina' | 'fuori' (rilasciando adesso si annulla). */
  'data-imb-ix-lune': 'fermo' | 'trascina' | 'fuori';
}

/** Solo valori primitivi e un handler stabile: una luna in React.memo non si ridisegna se non cambia. */
export interface PropsLuna {
  id: string;
  role: 'option';
  'aria-selected': boolean;
  'aria-disabled': true | undefined;
  'data-imb-ix-indice': number;
  /** La luna col fuoco (activedescendant): l'anello lo disegna interaction.css. */
  'data-imb-ix-attiva': 'true' | undefined;
  /** Posizione nella selezione: base di luce più lunga su inizio e fine. */
  'data-imb-ix-scelta': 'sola' | 'inizio' | 'mezzo' | 'fine' | undefined;
  /** L'arrivo fissato col primo tocco (P3). */
  'data-imb-ix-ancora': 'true' | undefined;
  /** Tra l'arrivo fissato e il puntatore o la luna attiva. */
  'data-imb-ix-anteprima': 'true' | undefined;
  onClick: (e: ReactMouseEvent<HTMLElement>) => void;
}

export interface SelezioneLune {
  /** Indice della luna attiva (fuoco virtuale del listbox). */
  attiva: number;
  /** Indice dell'arrivo fissato col primo tocco o Invio (P3), altrimenti null. */
  ancora: number | null;
  /** Intervallo in anteprima dopo il primo tocco (per "arrivo" / "ultima notte" sotto le lune). */
  anteprima: { da: number; a: number } | null;
  /** Trascinamento o Maiusc+frecce in corso: la riga di stato non annuncia. */
  inCorso: boolean;
  /** Durante il trascinamento il puntatore è lontano dal nastro: rilasciando si annulla. */
  fuori: boolean;
  propsListbox: PropsListbox;
  propsLuna: (i: number) => PropsLuna;
  /** Sposta la luna attiva (es. "Vai alle lune": stasera o prima notte scelta) e la porta in vista. */
  vaiA: (i: number) => void;
  /** Toglie l'arrivo fissato (P3) senza toccare la selezione. */
  annullaAncora: () => void;
}

type Gesto = 'fermo' | 'premuto' | 'trascina';

interface Premuto {
  id: number;
  tipo: 'mouse' | 'touch' | 'pen';
  x0: number;
  y0: number;
  t0: number;
  x: number;
  y: number;
  /** Luna su cui è partito il gesto (ancoraggio del trascinamento). */
  indice: number;
  /** x (contenuto scorrevole) del bordo sinistro della luna 0, misurata al pointerdown. */
  base: number;
  diametro: number;
  /** Selezione prima del gesto: ci si torna se il gesto si annulla. */
  prima: Selezione | null;
}

interface Intervallo {
  da: number;
  a: number;
  motivo: MotivoFermo | null;
}

interface Rettangolo {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function tipoPuntatore(t: string): 'mouse' | 'touch' | 'pen' {
  return t === 'touch' ? 'touch' : t === 'pen' ? 'pen' : 'mouse';
}

function indiceDa(target: EventTarget | null, radice: HTMLElement): number | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest(`[${ATTRIBUTO_INDICE}]`);
  if (!el || !radice.contains(el)) return null;
  const i = Number(el.getAttribute(ATTRIBUTO_INDICE));
  return Number.isInteger(i) ? i : null;
}

/* ------------------------------------------------------------------ hook */

export function useSelezioneLune(nastro: RefObject<HTMLElement>, o: OpzioniSelezione): SelezioneLune {
  const { lune, passo, filtro } = o;
  const n = lune.length;

  const selezione = useImbrunire((s) => s.selezione);
  const ridotto = useImbrunire((s) => s.reducedMotion);

  const idBase = `imb-luna-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const [attiva, setAttiva] = useState(0);
  const [ancora, setAncora] = useState<number | null>(null);
  const [puntata, setPuntata] = useState<number | null>(null);
  const [gesto, setGesto] = useState<Gesto>('fermo');
  const [fuori, setFuori] = useState(false);
  const [estensione, setEstensione] = useState(false);

  /* specchi per handler e ticker (mai stato React dentro il ticker, se non al cambio) */
  const opz = useRef(o);
  opz.current = o;
  const luneRef = useRef(lune);
  luneRef.current = lune;
  const filtroRef = useRef(filtro);
  filtroRef.current = filtro;
  const passoRef = useRef(passo);
  passoRef.current = passo;
  const ridottoRef = useRef(ridotto);
  ridottoRef.current = ridotto;
  const selezioneRef = useRef(selezione);
  selezioneRef.current = selezione;

  const attivaRef = useRef(0);
  const ancoraRef = useRef<number | null>(null);
  const puntataRef = useRef<number | null>(null);
  const gestoRef = useRef<Gesto>('fermo');
  const fuoriRef = useRef(false);
  const premuto = useRef<Premuto | null>(null);
  const rettangolo = useRef<Rettangolo | null>(null);
  const scroll = useRef(0);
  const ultimoIndice = useRef<number | null>(null);
  const ultimoIntervallo = useRef<Intervallo | null>(null);
  const ultimaChiave = useRef('');
  const ultimoDal = useRef<DataISO | null>(null);
  const ultimoCambioT = useRef(0);
  const stabileInviato = useRef(true);
  const ultimoPuntatoreT = useRef(-Infinity);
  /** Luna fissa di Maiusc+frecce (null = nessuna estensione in corso). */
  const perno = useRef<number | null>(null);
  const primaEstensione = useRef<Selezione | null>(null);

  /* ---------------------------------------------------------- piccoli setter che tengono lo specchio */

  const impostaAttiva = useCallback((i: number) => {
    if (attivaRef.current === i) return;
    attivaRef.current = i;
    setAttiva(i);
  }, []);

  const impostaAncora = useCallback((i: number | null) => {
    if (ancoraRef.current === i) return;
    ancoraRef.current = i;
    setAncora(i);
  }, []);

  const impostaPuntata = useCallback((i: number | null) => {
    if (puntataRef.current === i) return;
    puntataRef.current = i;
    setPuntata(i);
  }, []);

  const impostaGesto = useCallback((g: Gesto) => {
    if (gestoRef.current === g) return;
    gestoRef.current = g;
    setGesto(g);
  }, []);

  const impostaFuori = useCallback((f: boolean) => {
    if (fuoriRef.current === f) return;
    fuoriRef.current = f;
    setFuori(f);
  }, []);

  /* ---------------------------------------------------------- regole */

  const selezionabile = useCallback((i: number): boolean => {
    const d = luneRef.current[i];
    if (d === undefined) return false;
    if (chiuso(d)) return false;
    const f = filtroRef.current;
    return f === null || !occupata(f, d);
  }, []);

  const motivoDi = useCallback((i: number): MotivoFermo => {
    const d = luneRef.current[i];
    return d !== undefined && chiuso(d) ? 'chiuso' : 'notte-occupata';
  }, []);

  /** Dall'ancoraggio verso il bersaglio, fermandosi prima della prima notte non valida. */
  const limita = useCallback(
    (perno0: number, bersaglio: number): Intervallo => {
      const verso = bersaglio >= perno0 ? 1 : -1;
      let fine = perno0;
      let motivo: MotivoFermo | null = null;
      for (let k = perno0 + verso; verso > 0 ? k <= bersaglio : k >= bersaglio; k += verso) {
        if (Math.abs(k - perno0) + 1 > NOTTI_MAX) {
          motivo = 'troppe-notti';
          break;
        }
        if (!selezionabile(k)) {
          motivo = motivoDi(k);
          break;
        }
        fine = k;
      }
      return { da: Math.min(perno0, fine), a: Math.max(perno0, fine), motivo };
    },
    [selezionabile, motivoDi],
  );

  /* ---------------------------------------------------------- uscita verso lo store */

  const emettiSelezione = useCallback((sel: Selezione | null, motivo: MotivoFermo | null, stabile: boolean) => {
    const chiave = sel === null ? `vuota|${motivo ?? ''}` : `${sel.dal}|${sel.notti}|${motivo ?? ''}`;
    if (!stabile && chiave === ultimaChiave.current) return;
    ultimaChiave.current = chiave;
    ultimoDal.current = sel === null ? null : sel.dal;
    ultimoCambioT.current = performance.now();
    stabileInviato.current = stabile;
    opz.current.onCambia(sel, { motivo, stabile });
  }, []);

  const emetti = useCallback(
    (r: Intervallo, stabile: boolean) => {
      const dal = luneRef.current[r.da];
      if (dal === undefined) return;
      ultimoIntervallo.current = r;
      emettiSelezione({ dal, notti: r.a - r.da + 1 }, r.motivo, stabile);
    },
    [emettiSelezione],
  );

  const rifiuta = useCallback(
    (i: number) => {
      emettiSelezione(selezioneRef.current, motivoDi(i), true);
    },
    [emettiSelezione, motivoDi],
  );

  const portaInVista = useCallback(
    (i: number) => {
      const el = nastro.current;
      if (!el) return;
      scorriAIndice(el, i, passoRef.current, { allinea: 'vicino', morbido: !ridottoRef.current });
    },
    [nastro],
  );

  /* ---------------------------------------------------------- gesto col puntatore */

  const azzeraRuntime = useCallback(() => {
    runtime.nastro.trascina = false;
    runtime.nastro.bordo = 0;
    runtime.nastro.spinta = 0;
    runtime.nastro.indice = null;
  }, []);

  const iniziaTrascina = useCallback(() => {
    const p = premuto.current;
    if (p === null) return;
    if (!selezionabile(p.indice)) {
      // da una notte chiusa o occupata non parte nessuna selezione
      premuto.current = null;
      impostaGesto('fermo');
      ultimoPuntatoreT.current = performance.now();
      rifiuta(p.indice);
      return;
    }
    impostaGesto('trascina');
    impostaAncora(null);
    impostaPuntata(null);
    runtime.nastro.trascina = true;
    runtime.nastro.indice = p.indice;
    ultimoIndice.current = p.indice;
    emetti({ da: p.indice, a: p.indice, motivo: null }, false);
    ticker.wake();
  }, [emetti, impostaAncora, impostaGesto, impostaPuntata, rifiuta, selezionabile]);

  /** Chiude il gesto. conferma=false (annullato, cancel, secondo dito) → torna la selezione di prima. */
  const chiudiGesto = useCallback(
    (conferma: boolean): { era: Gesto; p: Premuto | null } => {
      const p = premuto.current;
      const era = gestoRef.current;
      const eraFuori = fuoriRef.current;
      premuto.current = null;
      impostaGesto('fermo');
      impostaFuori(false);
      azzeraRuntime();
      ultimoIndice.current = null;
      ultimoPuntatoreT.current = performance.now();
      if (era === 'trascina' && p !== null) {
        const r = ultimoIntervallo.current;
        if (conferma && !eraFuori && r !== null) emetti(r, true);
        else emettiSelezione(p.prima, null, true);
      }
      return { era, p };
    },
    [azzeraRuntime, emetti, emettiSelezione, impostaFuori, impostaGesto],
  );

  const tocco = useCallback(
    (i: number) => {
      if (!selezionabile(i)) {
        rifiuta(i);
        return;
      }
      impostaAttiva(i);
      const a = ancoraRef.current;
      if (a === null) {
        impostaAncora(i);
        impostaPuntata(null);
        return;
      }
      impostaAncora(null);
      impostaPuntata(null);
      emetti(limita(a, i), true);
    },
    [emetti, impostaAncora, impostaAttiva, impostaPuntata, limita, rifiuta, selezionabile],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const attuale = premuto.current;
      if (attuale !== null) {
        // secondo dito (o secondo puntatore): il gesto si annulla
        if (e.pointerId !== attuale.id) chiudiGesto(false);
        return;
      }
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const i = indiceDa(e.target, e.currentTarget);
      if (i === null || i < 0 || i >= luneRef.current.length) return;
      impostaAttiva(i);
      // anche una luna non scelgibile (chiusa, occupata nel filtro) apre un "premuto":
      // se diventa un tocco lo rifiuta tocco() e la riga di stato dice perché
      const el = nastro.current;
      const opzione = e.target instanceof Element ? e.target.closest(`[${ATTRIBUTO_INDICE}]`) : null;
      if (!el || !opzione) return;
      const rs = el.getBoundingClientRect();
      const ro = opzione.getBoundingClientRect();
      const sl = el.scrollLeft;
      rettangolo.current = { left: rs.left, right: rs.right, top: rs.top, bottom: rs.bottom };
      scroll.current = sl;
      premuto.current = {
        id: e.pointerId,
        tipo: tipoPuntatore(e.pointerType),
        x0: e.clientX,
        y0: e.clientY,
        t0: performance.now(),
        x: e.clientX,
        y: e.clientY,
        indice: i,
        base: ro.left - rs.left + sl - i * passoRef.current,
        diametro: ro.width,
        prima: selezioneRef.current,
      };
      impostaGesto('premuto');
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_e) {
        /* puntatore già rilasciato: il gesto si chiude al prossimo up o cancel */
      }
      if (e.pointerType === 'touch') ticker.wake(); // conta la tenuta
    },
    [chiudiGesto, impostaAttiva, impostaGesto, nastro],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const p = premuto.current;
      if (p !== null) {
        if (e.pointerId !== p.id) return;
        p.x = e.clientX;
        p.y = e.clientY;
        if (gestoRef.current === 'premuto') {
          const dx = Math.abs(p.x - p.x0);
          const dy = Math.abs(p.y - p.y0);
          const soglia = p.tipo === 'touch' ? SOGLIA_DITO_PX : SOGLIA_MOUSE_PX;
          if (dx > soglia && dx >= dy) {
            iniziaTrascina();
          } else if (p.tipo === 'touch' && dy > SOGLIA_VERTICALE_DITO_PX && dy > dx) {
            // il dito voleva scorrere il foglio o la torre: il gesto è del browser
            premuto.current = null;
            impostaGesto('fermo');
            ultimoPuntatoreT.current = performance.now();
          }
        } else if (gestoRef.current === 'trascina') {
          ticker.wake();
        }
        return;
      }
      // anteprima col mouse dopo il primo clic (P3)
      if (e.pointerType !== 'mouse' || ancoraRef.current === null) return;
      const i = indiceDa(e.target, e.currentTarget);
      if (i !== null) impostaPuntata(i);
    },
    [iniziaTrascina, impostaGesto, impostaPuntata],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const p = premuto.current;
      if (p === null || e.pointerId !== p.id) return;
      const { era } = chiudiGesto(true);
      if (era === 'premuto') tocco(p.indice);
    },
    [chiudiGesto, tocco],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const p = premuto.current;
      if (p === null || e.pointerId !== p.id) return;
      chiudiGesto(false);
    },
    [chiudiGesto],
  );

  const onPointerLeave = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && premuto.current === null) impostaPuntata(null);
    },
    [impostaPuntata],
  );

  /** Clic senza puntatore (lettori di schermo che "attivano" l'opzione): vale come tocco. */
  const onClickLuna = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (performance.now() - ultimoPuntatoreT.current < CLIC_GEMELLO_MS) return;
      if (premuto.current !== null) return;
      const v = Number(e.currentTarget.getAttribute(ATTRIBUTO_INDICE));
      if (!Number.isInteger(v)) return;
      tocco(v);
    },
    [tocco],
  );

  /* ---------------------------------------------------------- ticker: indice dal puntatore, bordo, pausa */

  useEffect(() => {
    const leggi = (): boolean => {
      if (gestoRef.current !== 'trascina') return false;
      const el = nastro.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      rettangolo.current = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      scroll.current = el.scrollLeft;
      return false;
    };

    const aggiorna = (): boolean => {
      let ancoraFrame = false;
      const ora = performance.now();
      const p = premuto.current;

      if (p !== null && gestoRef.current === 'premuto' && p.tipo === 'touch') {
        if (ora - p.t0 >= TENUTA_DITO_MS) iniziaTrascina();
        else ancoraFrame = true;
      }

      const r = rettangolo.current;
      if (p !== null && r !== null && gestoRef.current === 'trascina') {
        const totale = luneRef.current.length;
        const passo0 = passoRef.current;
        const grezzo = Math.round((p.x - r.left + scroll.current - p.base - p.diametro / 2) / passo0);
        const i = Math.max(0, Math.min(totale - 1, grezzo));
        const zona = Math.min(ZONA_BORDO_PX, (r.right - r.left) / 4);
        const dentroSx = r.left + zona - p.x;
        const dentroDx = p.x - (r.right - zona);
        const bordo: -1 | 0 | 1 = dentroSx > 0 ? -1 : dentroDx > 0 ? 1 : 0;
        runtime.nastro.bordo = bordo;
        runtime.nastro.spinta = bordo === 0 ? 0 : Math.min(1, Math.max(dentroSx, dentroDx) / zona);
        runtime.nastro.indice = i;
        impostaFuori(p.y < r.top - FUORI_PX || p.y > r.bottom + FUORI_PX);
        if (i !== ultimoIndice.current) {
          ultimoIndice.current = i;
          const lim = limita(p.indice, i);
          impostaAttiva(i >= p.indice ? lim.a : lim.da);
          emetti(lim, false);
        }
        if (bordo !== 0) ancoraFrame = true;
      }

      const inCorso = gestoRef.current === 'trascina' || perno.current !== null;
      if (inCorso && !stabileInviato.current && ultimoIntervallo.current !== null) {
        if (ora - ultimoCambioT.current >= PAUSA_ANNUNCIO_MS) emetti(ultimoIntervallo.current, true);
        else ancoraFrame = true;
      }
      return ancoraFrame;
    };

    const togliLeggi = ticker.add(leggi, 'read');
    const togliAggiorna = ticker.add(aggiorna, 'update');
    return () => {
      togliLeggi();
      togliAggiorna();
    };
  }, [nastro, emetti, iniziaTrascina, impostaAttiva, impostaFuori, limita]);

  /* smontaggio: il runtime non resta "in trascinamento" */
  useEffect(() => azzeraRuntime, [azzeraRuntime]);

  /* ---------------------------------------------------------- tastiera */

  const chiudiEstensione = useCallback(() => {
    if (perno.current === null) return;
    perno.current = null;
    primaEstensione.current = null;
    setEstensione(false);
    const r = ultimoIntervallo.current;
    if (r !== null && !stabileInviato.current) emetti(r, true);
  }, [emetti]);

  const muovi = useCallback(
    (j: number) => {
      const totale = luneRef.current.length;
      if (totale === 0) return;
      const k = Math.max(0, Math.min(totale - 1, j));
      impostaAttiva(k);
      if (ancoraRef.current !== null) impostaPuntata(k);
      portaInVista(k);
    },
    [impostaAttiva, impostaPuntata, portaInVista],
  );

  const intervalloAttuale = useCallback((): { da: number; a: number } | null => {
    const sel = selezioneRef.current;
    const prima = luneRef.current[0];
    if (sel === null || prima === undefined) return null;
    const da = differenzaGiorni(prima, sel.dal);
    return { da, a: da + sel.notti - 1 };
  }, []);

  const estendi = useCallback(
    (verso: -1 | 1) => {
      const totale = luneRef.current.length;
      if (totale === 0) return;
      const a = attivaRef.current;
      if (perno.current === null) {
        const r = intervalloAttuale();
        const fissata = ancoraRef.current;
        const p0 = fissata !== null ? fissata : r !== null && a === r.a ? r.da : r !== null && a === r.da ? r.a : a;
        if (!selezionabile(p0)) {
          rifiuta(p0);
          return;
        }
        perno.current = p0;
        primaEstensione.current = selezioneRef.current;
        impostaAncora(null);
        impostaPuntata(null);
        setEstensione(true);
      }
      const p0 = perno.current;
      const j = Math.max(0, Math.min(totale - 1, a + verso));
      const lim = limita(p0, j);
      const fine = j >= p0 ? lim.a : lim.da;
      impostaAttiva(fine);
      portaInVista(fine);
      emetti(lim, false);
    },
    [emetti, impostaAncora, impostaAttiva, impostaPuntata, intervalloAttuale, limita, portaInVista, rifiuta, selezionabile],
  );

  const conferma = useCallback(() => {
    if (perno.current !== null) {
      chiudiEstensione();
      return;
    }
    tocco(attivaRef.current);
  }, [chiudiEstensione, tocco]);

  /** Esc: annulla la cosa più interna. false = non c'era niente da annullare. */
  const annullaInterno = useCallback((): boolean => {
    if (premuto.current !== null) {
      chiudiGesto(false);
      return true;
    }
    if (perno.current !== null) {
      const prima = primaEstensione.current;
      perno.current = null;
      primaEstensione.current = null;
      setEstensione(false);
      emettiSelezione(prima, null, true);
      return true;
    }
    if (ancoraRef.current !== null) {
      impostaAncora(null);
      impostaPuntata(null);
      return true;
    }
    return false;
  }, [chiudiGesto, emettiSelezione, impostaAncora, impostaPuntata]);

  const meseDi = useCallback((i: number, verso: -1 | 1): number => {
    const mesi = inizioMesi(luneRef.current);
    if (verso === 1) return mesi.find((m) => m > i) ?? luneRef.current.length - 1;
    const prima = mesi.filter((m) => m < i);
    return prima.length > 0 ? (prima[prima.length - 1] ?? 0) : 0;
  }, []);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (luneRef.current.length === 0) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const a = attivaRef.current;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          const verso = e.key === 'ArrowRight' ? 1 : -1;
          if (e.shiftKey) estendi(verso);
          else muovi(a + verso);
          break;
        }
        case 'PageUp':
          muovi(meseDi(a, -1));
          break;
        case 'PageDown':
          muovi(meseDi(a, 1));
          break;
        case 'Home':
          muovi(0);
          break;
        case 'End':
          muovi(luneRef.current.length - 1);
          break;
        case 'Enter':
        case ' ':
        case 'Spacebar':
          if (e.repeat) break;
          conferma();
          break;
        case 'Escape':
          if (!annullaInterno()) {
            const esc = opz.current.onEsc;
            if (!esc) return;
            esc();
          }
          break;
        case 'Delete':
        case 'Backspace':
          annullaInterno();
          emettiSelezione(null, null, true);
          break;
        default:
          return;
      }
      e.preventDefault();
      e.stopPropagation();
    },
    [annullaInterno, conferma, emettiSelezione, estendi, meseDi, muovi],
  );

  const onKeyUp = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key === 'Shift') chiudiEstensione();
    },
    [chiudiEstensione],
  );

  const onBlur = useCallback(() => {
    chiudiEstensione();
  }, [chiudiEstensione]);

  /* ---------------------------------------------------------- sincronia con lo store */

  /* selezione cambiata da fuori (campi data, proposte, hash): la luna attiva va all'arrivo */
  useEffect(() => {
    if (selezione === null) {
      ultimoDal.current = null;
      return;
    }
    if (selezione.dal === ultimoDal.current) return;
    ultimoDal.current = selezione.dal;
    if (gestoRef.current !== 'fermo' || perno.current !== null) return;
    const prima = lune[0];
    if (prima === undefined) return;
    const da = differenzaGiorni(prima, selezione.dal);
    if (da >= 0 && da < lune.length) impostaAttiva(da);
  }, [selezione, lune, impostaAttiva]);

  /* meno lune (cambio di "oggi") o altro filtro: niente indici fuori posto */
  useEffect(() => {
    if (attivaRef.current > n - 1) impostaAttiva(Math.max(0, n - 1));
    impostaAncora(null);
    impostaPuntata(null);
  }, [n, filtro, impostaAttiva, impostaAncora, impostaPuntata]);

  /* ---------------------------------------------------------- props */

  const intervallo = useMemo(() => {
    const prima = lune[0];
    if (selezione === null || prima === undefined) return null;
    const da = differenzaGiorni(prima, selezione.dal);
    return { da, a: da + selezione.notti - 1 };
  }, [selezione, lune]);

  const anteprima = useMemo(() => {
    if (ancora === null) return null;
    const fine = puntata ?? ancora;
    return { da: Math.min(ancora, fine), a: Math.max(ancora, fine) };
  }, [ancora, puntata]);

  const idLuna = useCallback((i: number) => `${idBase}-${i}`, [idBase]);

  const propsLuna = useCallback(
    (i: number): PropsLuna => {
      const scelta = intervallo !== null && i >= intervallo.da && i <= intervallo.a;
      let posizione: PropsLuna['data-imb-ix-scelta'];
      if (scelta && intervallo !== null) {
        posizione =
          intervallo.da === intervallo.a ? 'sola' : i === intervallo.da ? 'inizio' : i === intervallo.a ? 'fine' : 'mezzo';
      }
      const inAnteprima = anteprima !== null && i >= anteprima.da && i <= anteprima.a;
      return {
        id: idLuna(i),
        role: 'option',
        'aria-selected': scelta,
        'aria-disabled': selezionabile(i) ? undefined : true,
        'data-imb-ix-indice': i,
        'data-imb-ix-attiva': i === attiva ? 'true' : undefined,
        'data-imb-ix-scelta': posizione,
        'data-imb-ix-ancora': i === ancora ? 'true' : undefined,
        'data-imb-ix-anteprima': inAnteprima ? 'true' : undefined,
        onClick: onClickLuna,
      };
    },
    // `filtro` e `lune` cambiano l'esito di selezionabile (che legge gli specchi)
    [intervallo, anteprima, attiva, ancora, idLuna, onClickLuna, selezionabile, filtro, lune],
  );

  const statoLune: PropsListbox['data-imb-ix-lune'] = gesto === 'trascina' ? (fuori ? 'fuori' : 'trascina') : 'fermo';

  const propsListbox = useMemo<PropsListbox>(
    () => ({
      role: 'listbox',
      'aria-multiselectable': true,
      'aria-orientation': 'horizontal',
      'aria-activedescendant': n > 0 ? idLuna(Math.min(attiva, n - 1)) : undefined,
      tabIndex: 0,
      onKeyDown,
      onKeyUp,
      onBlur,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: onPointerCancel,
      onPointerLeave,
      'data-imb-ix-lune': statoLune,
    }),
    [n, idLuna, attiva, onKeyDown, onKeyUp, onBlur, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave, statoLune],
  );

  const vaiA = useCallback((i: number) => muovi(i), [muovi]);

  const annullaAncora = useCallback(() => {
    impostaAncora(null);
    impostaPuntata(null);
  }, [impostaAncora, impostaPuntata]);

  return {
    attiva,
    ancora,
    anteprima,
    inCorso: gesto === 'trascina' || estensione,
    fuori,
    propsListbox,
    propsLuna,
    vaiA,
    annullaAncora,
  };
}
