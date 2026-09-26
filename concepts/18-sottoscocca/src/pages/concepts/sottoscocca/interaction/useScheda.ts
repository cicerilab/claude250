/**
 * SOTTOSCOCCA · apertura e chiusura della scheda del punto.
 *
 * Contratto (creative-director 4.3, ux-architect 5.0 e 7.5, tech-architect 6.1):
 * - una sola scheda aperta; aprirne un'altra chiude la precedente; lo stesso
 *   bottone premuto di nuovo la chiude (il suo `aria-expanded` lo dice);
 * - `role="dialog"` NON modale, `aria-labelledby` sull'h3; all'apertura il
 *   fuoco va all'h3 (`tabindex="-1"`);
 * - Esc (da qualunque punto della pagina, se nessun altro l'ha già usato) e
 *   "Chiudi" chiudono e riportano il fuoco al bottone che l'ha aperta, punto
 *   sulla scena o voce dell'elenco "Da qui si vede". Se quel bottone non c'è
 *   più (quota cambiata, punto nascosto), il fuoco va all'altro bottone dello
 *   stesso punto ancora visibile;
 * - la scheda sta UNA volta sola in fondo a Radice, ma per la tastiera si
 *   comporta come se fosse nel DOM subito dopo il suo punto (ux 7.5): Tab
 *   dall'ultimo controllo della scheda va al primo elemento tabulabile dopo il
 *   punto; Maiusc+Tab dal primo torna al punto;
 * - la scheda si chiude da sola se la pagina passa a un'altra sezione, ma solo
 *   se il fuoco non è dentro (chi la sta leggendo da tastiera non la perde);
 * - su telefono il foglio si chiude anche trascinando giù la maniglia
 *   (decorativa, `aria-hidden`): oltre il 25% dell'altezza del foglio (minimo
 *   96 px) o con uno scatto veloce verso il basso. Sotto soglia torna su.
 *   Durante il gesto il foglio segue il dito con `--ssc-ix-scheda-dy`,
 *   scritta nella fase `write` del ticker.
 *
 * Lo stato vive nello store (`schedaAperta`); lo scrivono solo questo modulo
 * e i componenti di Punti/ attraverso di lui. Il pezzo evidenziato nella scena
 * segue la scheda (interaction/evidenza.ts).
 *
 * Uso:
 *   // Punto.tsx e voci dell'elenco "Da qui si vede"
 *   const apri = usePropsApriScheda(id, 'scena');
 *   <button {...apri}>...</button>
 *
 *   // Scheda.tsx
 *   const s = useScheda();
 *   <section {...s.propsPannello} hidden={!s.aperta}>
 *     <div {...s.propsManiglia} className="ssc-ix-maniglia" />
 *     <h3 {...s.propsTitolo}>...</h3>
 *     <button type="button" onClick={s.chiudi}>Chiudi</button>
 *   </section>
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';
import type { IdPunto } from '../content/lavori';
import { ticker } from '../core/ticker';
import { apriScheda, chiudiScheda, store, useSottoscocca } from '../state/store';
import { segnalaScheda } from './evidenza';
import { adesso, eVisibile, focusabili, prossimoFocusabileDopo } from './util';

/* ------------------------------------------------------------------ costanti */

/** Id del pannello (una sola scheda nella pagina): `aria-controls` dei bottoni. */
export const ID_SCHEDA = 'ssc-scheda';
/** Id dell'h3 della scheda: `aria-labelledby` del pannello. */
export const ID_TITOLO_SCHEDA = 'ssc-scheda-titolo';
/** Soglia di chiusura del foglio trascinato: frazione dell'altezza del foglio. */
const SOGLIA_FRAZIONE = 0.25;
/** Soglia minima di chiusura in px (fogli bassi). */
const SOGLIA_MIN_PX = 96;
/** Velocità verso il basso oltre la quale il foglio si chiude comunque (px/ms). */
const SOGLIA_VELOCITA = 0.5;
/** Movimento minimo prima di considerare il gesto un trascinamento. */
const SOGLIA_AVVIO_PX = 4;

/* ------------------------------------------------------------------ tipi */

export type OrigineScheda = 'scena' | 'elenco';
/**
 * 'bottone', 'esc', 'trascina': il fuoco torna al bottone d'origine (se era
 * nella scheda). 'sezione' e 'silenziosa': il fuoco non si sposta.
 */
export type MotivoChiusura = 'bottone' | 'esc' | 'trascina' | 'sezione' | 'silenziosa';

type StatoStore = ReturnType<typeof store.get>;
type SezioneStore = StatoStore['sezione'];

export interface PropsApriScheda {
  readonly type: 'button';
  readonly 'aria-controls': string;
  readonly 'aria-expanded': boolean;
  readonly 'data-ssc-ix-scheda-per': IdPunto;
  readonly 'data-ssc-ix-origine': OrigineScheda;
  readonly onClick: (e: ReactMouseEvent<HTMLElement>) => void;
}

export interface Scheda {
  /** La scheda aperta, o null. */
  readonly aperta: { readonly punto: IdPunto; readonly origine: OrigineScheda } | null;
  /** Chiude e riporta il fuoco al bottone d'origine ("Chiudi"). */
  readonly chiudi: () => void;
  readonly propsPannello: {
    readonly id: string;
    readonly ref: RefObject<HTMLElement>;
    readonly role: 'dialog';
    readonly 'aria-modal': false;
    readonly 'aria-labelledby': string;
    readonly onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  };
  readonly propsTitolo: {
    readonly id: string;
    readonly ref: RefObject<HTMLHeadingElement>;
    readonly tabIndex: -1;
  };
  readonly propsManiglia: {
    readonly 'aria-hidden': true;
    readonly onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    readonly onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  };
}

/* ------------------------------------------------------------------ stato di modulo (una sola scheda) */

/** Il bottone che ha aperto la scheda corrente. */
let origineEl: HTMLElement | null = null;
/** La sezione in cui la scheda è stata aperta. */
let sezioneApertura: SezioneStore | null = null;
/** true tra l'apertura e il primo effetto che porta il fuoco all'h3. */
let fuocoDaDare = false;

function pannelloCorrente(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById(ID_SCHEDA);
}

function fuocoDentro(pannello: HTMLElement | null): boolean {
  if (!pannello) return false;
  const attivo = pannello.ownerDocument.activeElement;
  return attivo !== null && pannello.contains(attivo);
}

/** Il bottone a cui riportare il fuoco: quello d'origine se c'è ancora, altrimenti un gemello visibile. */
function bottoneDiRitorno(punto: IdPunto, origine: OrigineScheda): HTMLElement | null {
  if (origineEl && origineEl.isConnected && eVisibile(origineEl)) return origineEl;
  if (typeof document === 'undefined') return null;
  const gemelli = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-ssc-ix-scheda-per="${punto}"]`),
  ).filter((el) => eVisibile(el));
  const stessaOrigine = gemelli.find((el) => el.dataset.sscIxOrigine === origine);
  return stessaOrigine ?? gemelli[0] ?? null;
}

function chiudiInterno(motivo: MotivoChiusura): void {
  const stato = store.get().schedaAperta;
  if (!stato) return;
  const pannello = pannelloCorrente();
  const doc = pannello?.ownerDocument ?? (typeof document === 'undefined' ? null : document);
  const attivo = doc?.activeElement ?? null;
  const daRiportare =
    motivo !== 'sezione' &&
    motivo !== 'silenziosa' &&
    (fuocoDentro(pannello) || attivo === null || attivo === doc?.body || attivo === origineEl);
  const ritorno = daRiportare ? bottoneDiRitorno(stato.punto, stato.origine) : null;

  chiudiScheda();
  segnalaScheda(null);
  fuocoDaDare = false;
  if (ritorno) ritorno.focus({ preventScroll: stato.origine === 'scena' });
  origineEl = null;
  sezioneApertura = null;
}

/**
 * Apre la scheda del punto dal bottone `el` (punto sulla scena o voce
 * dell'elenco). Se la stessa scheda è già aperta dallo stesso bottone, la
 * chiude (il bottone è un interruttore: `aria-expanded`).
 */
export function apriSchedaDa(el: HTMLElement | null, punto: IdPunto, origine: OrigineScheda): void {
  const stato = store.get();
  const corrente = stato.schedaAperta;
  if (corrente && corrente.punto === punto && origineEl === el) {
    chiudiInterno('bottone');
    return;
  }
  origineEl = el;
  sezioneApertura = stato.sezione;
  fuocoDaDare = true;
  apriScheda(punto, origine);
  segnalaScheda(punto);
  ticker.wake();
}

/** Chiude la scheda (se aperta) da fuori: per esempio "Aggiungi al lavoro" su telefono, se la sezione lo vuole. */
export function chiudiSchedaDa(motivo: MotivoChiusura = 'bottone'): void {
  chiudiInterno(motivo);
}

/** Props dei bottoni che aprono la scheda di `punto` (punti proiettati e voci dell'elenco). */
export function usePropsApriScheda(punto: IdPunto, origine: OrigineScheda): PropsApriScheda {
  const aperto = useSottoscocca((s) => s.schedaAperta !== null && s.schedaAperta.punto === punto);
  const onClick = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      apriSchedaDa(e.currentTarget, punto, origine);
    },
    [punto, origine],
  );
  return useMemo(
    () => ({
      type: 'button' as const,
      'aria-controls': ID_SCHEDA,
      'aria-expanded': aperto,
      'data-ssc-ix-scheda-per': punto,
      'data-ssc-ix-origine': origine,
      onClick,
    }),
    [aperto, onClick, origine, punto],
  );
}

/* ------------------------------------------------------------------ hook della scheda */

interface GestoFoglio {
  id: number;
  y0: number;
  dy: number;
  altezza: number;
  avviato: boolean;
  /** Ultimi campioni (tempo, y) per la velocità di rilascio. */
  campioni: Array<{ t: number; y: number }>;
}

export function useScheda(): Scheda {
  const aperta = useSottoscocca((s) => s.schedaAperta);
  const refPannello = useRef<HTMLElement>(null);
  const refTitolo = useRef<HTMLHeadingElement>(null);
  const gesto = useRef<GestoFoglio | null>(null);
  const dyScritto = useRef<number>(0);
  const togliScrittura = useRef<(() => void) | null>(null);

  const punto = aperta?.punto ?? null;

  const chiudi = useCallback(() => {
    chiudiInterno('bottone');
  }, []);

  // Fuoco all'h3 quando si apre (o si passa a un altro punto).
  useEffect(() => {
    if (punto === null || !fuocoDaDare) return;
    fuocoDaDare = false;
    refTitolo.current?.focus({ preventScroll: true });
  }, [punto]);

  // Il pezzo evidenziato segue la scheda anche se lo store cambia da altrove (ricomincia, smontaggio).
  useEffect(() => {
    segnalaScheda(punto);
  }, [punto]);

  // Esc da qualunque punto della pagina, finché la scheda è aperta.
  useEffect(() => {
    if (punto === null) return undefined;
    const doc = refPannello.current?.ownerDocument ?? document;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      chiudiInterno('esc');
    };
    doc.addEventListener('keydown', onKey);
    return () => doc.removeEventListener('keydown', onKey);
  }, [punto]);

  // Chiusura quando la pagina passa a un'altra sezione (non se il fuoco è dentro).
  useEffect(
    () =>
      store.subscribe(() => {
        const s = store.get();
        if (!s.schedaAperta || sezioneApertura === null) return;
        if (s.sezione === sezioneApertura) return;
        if (fuocoDentro(refPannello.current)) {
          sezioneApertura = s.sezione;
          return;
        }
        chiudiInterno('sezione');
      }),
    [],
  );

  // Smontaggio: niente scritture appese.
  useEffect(
    () => () => {
      togliScrittura.current?.();
      togliScrittura.current = null;
    },
    [],
  );

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return;
    const pannello = refPannello.current;
    if (!pannello) return;
    const doc = pannello.ownerDocument;
    const attivo = doc.activeElement;
    const lista = focusabili(pannello);
    const primo = lista[0] ?? null;
    const ultimo = lista[lista.length - 1] ?? null;
    const origine = origineEl && origineEl.isConnected && eVisibile(origineEl) ? origineEl : null;
    if (!origine) return;
    if (e.shiftKey) {
      if (attivo === primo || attivo === refTitolo.current || lista.length === 0) {
        e.preventDefault();
        origine.focus({ preventScroll: true });
      }
      return;
    }
    if (attivo === ultimo || lista.length === 0) {
      const radice = pannello.closest('.ssc-root') ?? doc;
      const dopo = prossimoFocusabileDopo(origine, radice, pannello);
      if (dopo) {
        e.preventDefault();
        dopo.focus();
      }
    }
  }, []);

  /* ---- maniglia del foglio (telefono) ---- */

  const scriviDy = useCallback(() => {
    const pannello = refPannello.current;
    const g = gesto.current;
    const dy = g && g.avviato ? g.dy : 0;
    if (!pannello || dy === dyScritto.current) return false;
    dyScritto.current = dy;
    pannello.style.setProperty('--ssc-ix-scheda-dy', `${dy.toFixed(1)}px`);
    return false;
  }, []);

  const fineGesto = useCallback(
    (chiudere: boolean) => {
      const pannello = refPannello.current;
      gesto.current = null;
      if (pannello) {
        pannello.removeAttribute('data-ssc-ix-trascina');
        // Senza gesto il valore torna 0: CSS fa rientrare il foglio (o niente, con reduced motion).
        pannello.style.setProperty('--ssc-ix-scheda-dy', '0px');
      }
      dyScritto.current = 0;
      togliScrittura.current?.();
      togliScrittura.current = null;
      if (chiudere) chiudiInterno('trascina');
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0 || gesto.current) return;
      const pannello = refPannello.current;
      if (!pannello) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      gesto.current = {
        id: e.pointerId,
        y0: e.clientY,
        dy: 0,
        altezza: pannello.getBoundingClientRect().height,
        avviato: false,
        campioni: [{ t: adesso(), y: e.clientY }],
      };
      togliScrittura.current?.();
      togliScrittura.current = ticker.add(scriviDy, 'write');
    },
    [scriviDy],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    const dy = Math.max(0, e.clientY - g.y0);
    if (!g.avviato && dy >= SOGLIA_AVVIO_PX) {
      g.avviato = true;
      refPannello.current?.setAttribute('data-ssc-ix-trascina', 'si');
    }
    g.dy = dy;
    const t = adesso();
    g.campioni.push({ t, y: e.clientY });
    while (g.campioni.length > 2 && t - (g.campioni[0]?.t ?? t) > 100) g.campioni.shift();
    ticker.wake();
  }, []);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const g = gesto.current;
      if (!g || g.id !== e.pointerId) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      const primo = g.campioni[0];
      const t = adesso();
      const velocita = primo && t > primo.t ? (e.clientY - primo.y) / (t - primo.t) : 0;
      const soglia = Math.max(SOGLIA_MIN_PX, g.altezza * SOGLIA_FRAZIONE);
      const chiudere = g.avviato && (g.dy >= soglia || velocita >= SOGLIA_VELOCITA);
      fineGesto(chiudere);
    },
    [fineGesto],
  );

  const onPointerCancel = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const g = gesto.current;
      if (!g || g.id !== e.pointerId) return;
      fineGesto(false);
    },
    [fineGesto],
  );

  // Una scheda che si chiude (da qualunque parte) interrompe il gesto.
  useEffect(() => {
    if (punto === null && gesto.current) fineGesto(false);
  }, [fineGesto, punto]);

  return useMemo<Scheda>(
    () => ({
      aperta,
      chiudi,
      propsPannello: {
        id: ID_SCHEDA,
        ref: refPannello,
        role: 'dialog',
        'aria-modal': false,
        'aria-labelledby': ID_TITOLO_SCHEDA,
        onKeyDown,
      },
      propsTitolo: { id: ID_TITOLO_SCHEDA, ref: refTitolo, tabIndex: -1 },
      propsManiglia: {
        'aria-hidden': true,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
      },
    }),
    [aperta, chiudi, onKeyDown, onPointerCancel, onPointerDown, onPointerMove, onPointerUp],
  );
}
