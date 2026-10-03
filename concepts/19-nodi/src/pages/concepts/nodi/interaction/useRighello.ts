/**
 * NODI · "Accordare la tavola": il righello delle frequenze (interaction-designer).
 *
 * Logica pura del gesto firma, senza markup né testi: il markup e il CSS sono
 * del section-builder-righello (sections/Righello/*), i testi del copywriter
 * (content/testi.ts) arrivano come funzioni nelle opzioni.
 *
 * Contratto (creative-director §4.3, ux-architect §3.2 e §7.3,
 * tech-architect §7.1):
 * - UNA SOLA VERITÀ, lo scroll. Il righello non ha uno stato suo: trascinare
 *   il cursore salva solo `runtime.righello.hzPuntatore`; nella fase `write`
 *   del ticker questo hook fa UN `scrollTo` per frame; la frequenza la
 *   ricalcola `risonanza/frequenza.ts` dallo scroll al frame dopo.
 * - Trascinamento (mouse, dito, penna) con pointer capture. Il cursore si
 *   prende dove lo si tocca (nessun salto sotto il dito). Un clic sul binario
 *   porta il cursore lì e continua come trascinamento (come un range nativo).
 *   Con il dito il binario aspetta: un tocco porta lì, uno scorrimento
 *   verticale resta lo scroll della pagina (`touch-action`).
 * - Magnetismo SOLO al rilascio del puntatore: entro ±6 Hz da un picco (92,
 *   168, voce) la pagina va al pianerottolo con scroll liscio. Mai durante il
 *   trascinamento, mai con la tastiera.
 * - Tastiera da slider (ux §7.3): frecce ±1 Hz, PagSu/PagGiù ±10 Hz, Inizio
 *   = spento (pagina in cima), Fine = 420. Da 0 la freccia su va a 60, da 60
 *   la freccia giù va a 0. Nella coda (riparazioni in giù, spento) la prima
 *   freccia porta a 420, cioè risale alla prova.
 * - Valore 0 = "spento": `aria-valuemin` è 0 (ux §7.3), i valori sono 0 e
 *   60-420.
 * - `aria-valuenow`/`aria-valuetext` NON seguono lo scroll a 60 Hz: cambiano
 *   a ogni tasto, al rilascio, e quando la frequenza è ferma da 400 ms (sui
 *   pianerottoli e dopo uno scroll). Il numero visibile lo scrive il ticker.
 * - Il ticker scrive il `transform` del cursore e il numero del valore solo
 *   quando cambiano; durante il trascinamento il cursore segue il dito, fuori
 *   dal trascinamento segue `runtime.righello.cursore` (lerp di motion/molle).
 *
 * Markup richiesto (dettagli in docs/interaction-designer.md §2.6):
 *   <div ref={refScala} {...propsScala} class="… nod-ix-scala">   ← il tratto 60→420 Hz, niente padding
 *     <div ref={refCursore} {...propsCursore} class="… nod-ix-cursore">   ← ancorato al punto dei 60 Hz
 *       <span class="nod-ix-cursore__segno"/>   <span ref={refValore}>0</span> Hz
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { ticker } from '../core/ticker';
import { clamp, lerp } from '../motion/easing';
import { HZ_MAX, HZ_MIN, U_SPENTO, hzDaU, uDaHz } from '../motion/percorso';
import { magnete, modoInRisonanza } from '../risonanza/modi';
import { runtime } from '../state/runtime';
import type { Modo } from '../state/store';
import { HZ_SPENTO, vaiAllaFrequenza } from './comandi';

/* ------------------------------------------------------------------ costanti */

/** Dopo questo spostamento (px) un mouse o una penna stanno trascinando. */
const SOGLIA_PUNTATORE_PX = 3;
/** Il dito sul binario orizzontale: oltre questo spostamento laterale trascina. */
const SOGLIA_DITO_PX = 8;
/** Un tocco del dito è un tocco se finisce entro questo tempo. */
const TOCCO_MAX_MS = 600;
/** La frequenza deve stare ferma tanto prima di aggiornare aria-valuenow. */
const ASSESTAMENTO_MS = 400;
/** Tasti ravvicinati: si parte dall'ultimo valore chiesto, non dallo scroll (che arriva al frame dopo). */
const RAFFICA_TASTI_MS = 600;
/** Variazione minima (in u, 0..1) per riscrivere il transform del cursore. */
const SOGLIA_U = 0.0004;

/* ------------------------------------------------------------------ tipi */

export type OrientamentoRighello = 'verticale' | 'orizzontale';

/** Cosa serve al copywriter per l'aria-valuetext (content/testi.ts, valuetextRighello). */
export interface StatoRighelloTesto {
  /** Hz interi; null = altoparlante spento. */
  hz: number | null;
  /** Modo in risonanza (entro la banda), altrimenti null. */
  modo: Modo | null;
  /** Spento perché si è nella coda (riparazioni, bottega, piede), non in cima. */
  inCoda: boolean;
}

export interface OpzioniRighello {
  orientamento: OrientamentoRighello;
  /** Testo parlante del valore: "168 hertz, modo 2, Costruire uno strumento", "spento". */
  valuetext: (s: StatoRighelloTesto) => string;
  /** La prima freccia nella coda riporta alla prova (420 Hz): il builder annuncia "Torni alla prova: 420 hertz." */
  onRitornoAllaProva?: () => void;
  /** Prerender e invio della voce: il cursore si vede ma non risponde. */
  disabilitato?: boolean;
}

export interface PropsScala {
  'data-orientamento': OrientamentoRighello;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
}

export interface PropsCursore {
  role: 'slider';
  tabIndex: 0 | -1;
  'aria-valuemin': 0;
  'aria-valuemax': 420;
  'aria-valuenow': number;
  'aria-valuetext': string;
  'aria-orientation': 'vertical' | 'horizontal';
  'aria-disabled': true | undefined;
  'data-trascinando': '' | undefined;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
}

export interface Righello {
  /** Il tratto 60→420 Hz: la sua lunghezza (alto o largo) è la scala. */
  refScala: RefObject<HTMLDivElement>;
  propsScala: PropsScala;
  /** Il ticker scrive il transform qui (fase write). */
  refCursore: RefObject<HTMLDivElement>;
  propsCursore: PropsCursore;
  /** Il ticker scrive qui il numero intero (0 = spento), solo quando cambia. */
  refValore: RefObject<HTMLSpanElement>;
  trascinando: boolean;
  /** Valore annunciato (0 = spento), lo stesso di aria-valuenow. */
  valore: number;
  modo: Modo | null;
  inCoda: boolean;
}

/* ------------------------------------------------------------------ funzioni pure */

/** Valore intero del righello per una frequenza (null o ≤ 0 = spento). */
export function valoreDaHz(hz: number | null): number {
  if (hz === null || !(hz > 0)) return HZ_SPENTO;
  return Math.round(clamp(hz, HZ_MIN, HZ_MAX));
}

/**
 * Posizione sulla scala (0 = 60 Hz, 1 = 420 Hz, U_SPENTO = fermo "spento")
 * di un valore mostrato. Tra 0 e 60 (il cursore che passa da spento a 60 in
 * lerp) la posizione scorre in modo lineare tra il fermo e i 60 Hz.
 */
export function uDaHzMostrati(hz: number): number {
  if (!(hz > 0)) return U_SPENTO;
  if (hz < HZ_MIN) return lerp(U_SPENTO, 0, hz / HZ_MIN);
  return uDaHz(hz);
}

/** Numero intero mostrato accanto al cursore. */
export function numeroMostrato(hz: number): number {
  if (!(hz > 0) || hz < HZ_MIN / 2) return 0;
  return Math.round(clamp(hz, HZ_MIN, HZ_MAX));
}

/** Frequenza (0 = spento) di una posizione sulla scala. */
export function hzDaPosizione(u: number): number {
  return hzDaU(clamp(u, U_SPENTO, 1)) ?? HZ_SPENTO;
}

/** Il nuovo valore dopo un tasto, o null se il tasto non è del righello. */
export function valoreDopoTasto(tasto: string, base: number, inCoda: boolean): number | null {
  const su = (passo: number): number => (base <= 0 ? HZ_MIN : Math.min(HZ_MAX, base + passo));
  const giu = (passo: number): number => {
    if (base <= 0) return HZ_SPENTO;
    if (base <= HZ_MIN) return HZ_SPENTO;
    return Math.max(HZ_MIN, base - passo);
  };
  switch (tasto) {
    case 'ArrowUp':
    case 'ArrowRight':
      return inCoda ? HZ_MAX : su(1);
    case 'ArrowDown':
    case 'ArrowLeft':
      return inCoda ? HZ_MAX : giu(1);
    case 'PageUp':
      return inCoda ? HZ_MAX : su(10);
    case 'PageDown':
      return inCoda ? HZ_MAX : giu(10);
    case 'Home':
      return HZ_SPENTO;
    case 'End':
      return HZ_MAX;
    default:
      return null;
  }
}

/** Spento perché si è oltre la prova (coda), non a riposo in cima. */
function siamoInCoda(): boolean {
  return runtime.hz.target === null && runtime.percorso >= 1;
}

function modoDi(valore: number): Modo | null {
  return valore > 0 ? modoInRisonanza(valore, runtime.hzModo5) : null;
}

/* ------------------------------------------------------------------ stato del gesto */

interface Gesto {
  id: number;
  el: HTMLElement;
  dito: boolean;
  origine: 'cursore' | 'binario';
  /** Asse misurato al pointerdown: inizio (px finestra) e lunghezza della scala. */
  inizio: number;
  lunghezza: number;
  /** Posizione del puntatore lungo l'asse (px dal 60 Hz) al pointerdown. */
  p0: number;
  /** Per il dito: coordinate iniziali e istante, per distinguere tocco e scroll. */
  x0: number;
  y0: number;
  t0: number;
  /** u del cursore al pointerdown (solo origine cursore: lo si prende dov'è). */
  u0: number;
  mosso: boolean;
  staccatori: Array<() => void>;
}

interface StatoAria {
  valore: number;
  modo: Modo | null;
  inCoda: boolean;
}

/* ------------------------------------------------------------------ hook */

export function useRighello(opz: OpzioniRighello): Righello {
  const { orientamento, disabilitato = false } = opz;
  const verticale = orientamento === 'verticale';

  const refScala = useRef<HTMLDivElement>(null);
  const refCursore = useRef<HTMLDivElement>(null);
  const refValore = useRef<HTMLSpanElement>(null);

  const [trascinando, setTrascinando] = useState(false);
  const [aria, setAria] = useState<StatoAria>({ valore: HZ_SPENTO, modo: null, inCoda: false });

  const gesto = useRef<Gesto | null>(null);
  const lunghezza = useRef(0);
  const ariaRef = useRef<StatoAria>(aria);
  const ultimoTasto = useRef<{ valore: number; t: number } | null>(null);
  const opzRef = useRef(opz);
  opzRef.current = opz;

  const impostaAria = useCallback((s: StatoAria) => {
    const prima = ariaRef.current;
    if (prima.valore === s.valore && prima.modo === s.modo && prima.inCoda === s.inCoda) return;
    ariaRef.current = s;
    setAria(s);
  }, []);

  /* ---- misura della scala: solo su ResizeObserver, mai durante il gesto */
  useEffect(() => {
    const scala = refScala.current;
    if (scala === null) return undefined;
    const misura = (): void => {
      const l = verticale ? scala.clientHeight : scala.clientWidth;
      if (l !== lunghezza.current) {
        lunghezza.current = l;
        ticker.wake();
      }
    };
    misura();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', misura);
      return () => window.removeEventListener('resize', misura);
    }
    const ro = new ResizeObserver(misura);
    ro.observe(scala);
    return () => ro.disconnect();
  }, [verticale]);

  /* ---- ticker: scroll del trascinamento, cursore, numero; aria quando la frequenza è ferma */
  useEffect(() => {
    let ultimoScrollHz = Number.NaN;
    let ultimaU = Number.NaN;
    let ultimaLunghezza = -1;
    let ultimoNumero = -1;
    let candidato = '';
    let candidatoDa = 0;

    const scrivi = (): void => {
      const r = runtime.righello;
      // 1. Un solo scrollTo per frame, solo se il dito ha chiesto un valore nuovo.
      if (r.trascinando && r.hzPuntatore !== null && r.hzPuntatore !== ultimoScrollHz) {
        ultimoScrollHz = r.hzPuntatore;
        vaiAllaFrequenza(r.hzPuntatore, false);
      }
      if (!r.trascinando) ultimoScrollHz = Number.NaN;

      // 2. Cursore: segue il dito mentre trascina, la molla del motion-designer altrimenti.
      const hz = r.trascinando && r.hzPuntatore !== null ? r.hzPuntatore : r.cursore;
      const u = uDaHzMostrati(hz);
      const l = lunghezza.current;
      const cursore = refCursore.current;
      if (cursore !== null && (Math.abs(u - ultimaU) > SOGLIA_U || l !== ultimaLunghezza)) {
        ultimaU = u;
        ultimaLunghezza = l;
        const px = Math.round(u * l * 100) / 100;
        cursore.style.transform = verticale ? `translate3d(0, ${-px}px, 0)` : `translate3d(${px}px, 0, 0)`;
      }

      // 3. Numero intero accanto al cursore.
      const n = numeroMostrato(hz);
      const valore = refValore.current;
      if (valore !== null && n !== ultimoNumero) {
        ultimoNumero = n;
        valore.textContent = String(n);
      }
    };

    const sorveglia = (_dt: number, now: number): boolean => {
      if (runtime.righello.trascinando) return false;
      const t = ultimoTasto.current;
      if (t !== null && now - t.t < RAFFICA_TASTI_MS) return true;
      const valore = valoreDaHz(runtime.hz.target);
      const inCoda = siamoInCoda();
      const chiave = `${valore}|${inCoda ? 1 : 0}`;
      if (chiave !== candidato) {
        candidato = chiave;
        candidatoDa = now;
      }
      const a = ariaRef.current;
      if (a.valore === valore && a.inCoda === inCoda) return false;
      if (now - candidatoDa < ASSESTAMENTO_MS) return true;
      impostaAria({ valore, modo: modoDi(valore), inCoda });
      return false;
    };

    const togliScrivi = ticker.add(scrivi, 'write');
    const togliSorveglia = ticker.add(sorveglia, 'update');
    return () => {
      togliScrivi();
      togliSorveglia();
    };
  }, [verticale, impostaAria]);

  /* ---- fine del gesto */
  const chiudiGesto = useCallback(
    (comeFinisce: 'rilascio' | 'annullato') => {
      const g = gesto.current;
      if (g === null) return;
      gesto.current = null;
      for (const stacca of g.staccatori) stacca();
      try {
        if (g.el.hasPointerCapture(g.id)) g.el.releasePointerCapture(g.id);
      } catch (_e) {
        // il puntatore è già stato rilasciato dal browser
      }

      const r = runtime.righello;
      const finale = r.hzPuntatore;
      r.trascinando = false;
      r.hzPuntatore = null;
      setTrascinando(false);

      if (comeFinisce === 'rilascio' && finale !== null) {
        const picco = finale > 0 ? magnete(finale, runtime.hzModo5) : null;
        if (picco !== null) {
          // Il cursore "si appoggia" sul picco: la pagina va al pianerottolo
          // (liscio; istantaneo con reduced motion, lo decide vaiAllaFrequenza).
          vaiAllaFrequenza(picco, true);
        } else {
          // L'ultimo valore del dito, esatto (il write del frame potrebbe non esserci stato).
          vaiAllaFrequenza(finale, false);
        }
        const valore = valoreDaHz(picco ?? (finale > 0 ? finale : null));
        ultimoTasto.current = null;
        impostaAria({ valore, modo: modoDi(valore), inCoda: false });
      }
      ticker.wake();
    },
    [impostaAria],
  );

  useEffect(() => () => chiudiGesto('annullato'), [chiudiGesto]);

  useEffect(() => {
    if (disabilitato) chiudiGesto('annullato');
  }, [disabilitato, chiudiGesto]);

  /* ---- inizio del gesto (cursore o binario) */
  const iniziaGesto = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, origine: 'cursore' | 'binario') => {
      if (disabilitato || gesto.current !== null) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const scala = refScala.current;
      if (scala === null) return;
      const rect = scala.getBoundingClientRect();
      const lung = verticale ? rect.height : rect.width;
      if (!(lung > 0)) return;
      const inizio = verticale ? rect.bottom : rect.left;
      const pos = verticale ? inizio - e.clientY : e.clientX - inizio;
      const dito = e.pointerType === 'touch';
      const el = e.currentTarget;

      if (origine === 'cursore') {
        // Niente selezione del testo né eventi mouse di compatibilità; il
        // fuoco va comunque al cursore, così dopo il gesto valgono le frecce.
        e.preventDefault();
        e.stopPropagation();
        el.focus({ preventScroll: true });
      }

      const r = runtime.righello;
      const hzOra = r.cursore;
      const g: Gesto = {
        id: e.pointerId,
        el,
        dito,
        origine,
        inizio,
        lunghezza: lung,
        p0: pos,
        x0: e.clientX,
        y0: e.clientY,
        t0: e.timeStamp,
        u0: uDaHzMostrati(hzOra),
        mosso: false,
        staccatori: [],
      };
      gesto.current = g;

      try {
        el.setPointerCapture(e.pointerId);
      } catch (_e) {
        // senza capture il gesto funziona lo stesso finché il puntatore resta sopra
      }

      const posizione = (ev: PointerEvent): number => (verticale ? g.inizio - ev.clientY : ev.clientX - g.inizio);

      const portaA = (ev: PointerEvent): void => {
        const p = posizione(ev);
        const u = g.origine === 'cursore' ? g.u0 + (p - g.p0) / g.lunghezza : p / g.lunghezza;
        r.hzPuntatore = hzDaPosizione(u);
        r.trascinando = true;
        ticker.wake();
      };

      const avvia = (): void => {
        g.mosso = true;
        setTrascinando(true);
      };

      // Mouse e penna sul binario: il cursore va subito lì (come un range nativo).
      if (origine === 'binario' && !dito) {
        avvia();
        portaA(e.nativeEvent);
      }

      const muovi = (ev: PointerEvent): void => {
        if (ev.pointerId !== g.id) return;
        if (!g.mosso) {
          const dx = ev.clientX - g.x0;
          const dy = ev.clientY - g.y0;
          if (g.dito && g.origine === 'binario') {
            // Il dito sul binario: trascina solo se va di lato (righello orizzontale).
            if (verticale || Math.abs(dx) < SOGLIA_DITO_PX || Math.abs(dx) < Math.abs(dy)) return;
          } else {
            const soglia = g.dito ? SOGLIA_DITO_PX : SOGLIA_PUNTATORE_PX;
            if (Math.hypot(dx, dy) < soglia) return;
          }
          avvia();
        }
        portaA(ev);
      };

      const su = (ev: PointerEvent): void => {
        if (ev.pointerId !== g.id) return;
        if (!g.mosso && g.dito && g.origine === 'binario' && ev.timeStamp - g.t0 <= TOCCO_MAX_MS) {
          // Un tocco sul binario: il cursore va lì, poi vale il magnetismo.
          portaA(ev);
        }
        if (!g.mosso && g.origine === 'cursore') {
          // Un clic sul cursore senza muoverlo non cambia niente.
          chiudiGesto('annullato');
          return;
        }
        chiudiGesto(runtime.righello.hzPuntatore !== null ? 'rilascio' : 'annullato');
      };

      const annulla = (ev: PointerEvent): void => {
        if (ev.pointerId !== g.id) return;
        chiudiGesto('annullato');
      };

      el.addEventListener('pointermove', muovi);
      el.addEventListener('pointerup', su);
      el.addEventListener('pointercancel', annulla);
      el.addEventListener('lostpointercapture', annulla);
      g.staccatori.push(
        () => el.removeEventListener('pointermove', muovi),
        () => el.removeEventListener('pointerup', su),
        () => el.removeEventListener('pointercancel', annulla),
        () => el.removeEventListener('lostpointercapture', annulla),
      );
    },
    [disabilitato, verticale, chiudiGesto],
  );

  const onPointerDownCursore = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => iniziaGesto(e, 'cursore'),
    [iniziaGesto],
  );
  const onPointerDownScala = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Il cursore sta dentro la scala: il suo pointerdown ferma la propagazione.
      iniziaGesto(e, 'binario');
    },
    [iniziaGesto],
  );

  /* ---- tastiera */
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabilitato || e.altKey || e.ctrlKey || e.metaKey) return;
      const ora = e.timeStamp;
      const raffica = ultimoTasto.current !== null && ora - ultimoTasto.current.t < RAFFICA_TASTI_MS;
      const inCoda = !raffica && siamoInCoda();
      const base = raffica && ultimoTasto.current !== null ? ultimoTasto.current.valore : valoreDaHz(runtime.hz.target);
      const nuovo = valoreDopoTasto(e.key, base, inCoda);
      if (nuovo === null) return;
      e.preventDefault();
      ultimoTasto.current = { valore: nuovo, t: ora };
      vaiAllaFrequenza(nuovo, false);
      impostaAria({ valore: nuovo, modo: modoDi(nuovo), inCoda: false });
      if (inCoda && nuovo === HZ_MAX) opzRef.current.onRitornoAllaProva?.();
      ticker.wake();
    },
    [disabilitato, impostaAria],
  );

  const valuetext = opz.valuetext({
    hz: aria.valore > 0 ? aria.valore : null,
    modo: aria.modo,
    inCoda: aria.inCoda,
  });

  return {
    refScala,
    propsScala: {
      'data-orientamento': orientamento,
      onPointerDown: onPointerDownScala,
    },
    refCursore,
    propsCursore: {
      role: 'slider',
      tabIndex: disabilitato ? -1 : 0,
      'aria-valuemin': 0,
      'aria-valuemax': 420,
      'aria-valuenow': aria.valore,
      'aria-valuetext': valuetext,
      'aria-orientation': verticale ? 'vertical' : 'horizontal',
      'aria-disabled': disabilitato ? true : undefined,
      'data-trascinando': trascinando ? '' : undefined,
      onPointerDown: onPointerDownCursore,
      onKeyDown,
    },
    refValore,
    trascinando,
    valore: aria.valore,
    modo: aria.modo,
    inCoda: aria.inCoda,
  };
}
