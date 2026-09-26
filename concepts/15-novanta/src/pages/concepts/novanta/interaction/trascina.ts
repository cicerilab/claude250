/**
 * NOVANTA · trascinamento attorno a un perno (interaction-designer).
 *
 * Un solo hook per tre oggetti: il braccio del goniometro (`tocco: 'braccio'`),
 * il disco gesso (`tocco: 'disco'`: toccarlo porta il braccio lì) e l'anello
 * della settimana (senza limiti, gira a giri interi). Non muove niente da solo:
 * traduce il puntatore in gradi e li passa al rotore (motion/rotore.ts).
 *
 * Regole (creative-director §4.3, ux-architect §6.2-6.3, tech-architect §7.3):
 * - Pointer Events con `setPointerCapture`: il gesto non si perde quando il
 *   dito esce dal disco. Solo il puntatore primario, solo il tasto sinistro.
 * - 'braccio': la presa conserva lo scarto tra dito e braccio (niente salto
 *   se lo si afferra un po' di lato) e parte subito: afferrare un braccio che
 *   sta ancora agganciando lo ferma, come una mano.
 * - 'disco': fino a 6 px (3 col mouse) è un tocco e il braccio va nel punto
 *   toccato con il movimento di aggancio (`onTocco`); oltre, è un
 *   trascinamento assoluto (il braccio sotto il dito).
 * - I gradi sono "srotolati": attraversare il lato opposto al disco non fa
 *   saltare il braccio da 180° a 0°. Per gli oggetti limitati lo srotolamento
 *   si ferma a 90° oltre i limiti, così tornando indietro il braccio riparte
 *   appena il dito rientra nell'arco.
 * - Vicino al perno (entro 14 px) l'angolo non è affidabile: si tiene l'ultimo.
 * - Esc durante il trascinamento: torna all'angolo di partenza (`onAnnulla`).
 * - Velocità al rilascio in gradi/s, stimata sugli ultimi 90 ms; se il dito è
 *   rimasto fermo più di 70 ms prima di alzarsi, è 0 (niente lancio).
 * - Durante la presa l'elemento porta `data-nov-ix-presa="1"` (cursore
 *   "grabbing" e niente selezione di testo, in interaction.css).
 *
 * Gli eventi sono nativi e agganciati in un effetto: nessun re-render per
 * mossa, nessuna lettura di layout (il perno arriva da `runtime`).
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { segnaInput } from './attivita';

export interface OpzioniTrascina {
  /** Perno in px della finestra (runtime.perno / runtime.pernoAnello). */
  perno: () => { x: number; y: number };
  /** Gradi dal punto del puntatore, di solito gradiDaPunto(…, geo). Non serve che sia limitato. */
  gradiDa: (px: number, py: number) => number;
  /** Letto a ogni pressione: se falso il gesto non parte. */
  attivo: () => boolean;
  onInizio?: () => void;
  /** Durante il trascinamento: → rotore.trascina(g). */
  onMuovi: (g: number) => void;
  /** Al rilascio: → rotore.rilascia(vel). */
  onFine: (velGradiAlSecondo: number) => void;
  /** 'braccio' (default): presa relativa immediata. 'disco': tocco = vai lì, trascinamento assoluto. */
  tocco?: 'braccio' | 'disco';

  /* ---- aggiunte facoltative (compatibili con il contratto di tech-architect §7.3) ---- */

  /** Valore attuale dell'oggetto (runtime.braccio.deg): serve alla presa relativa del braccio. */
  valore?: () => number;
  /** 'disco': tocco senza trascinamento. Se manca: onInizio, onMuovi(g), onFine(0). */
  onTocco?: (g: number) => void;
  /** Esc durante il trascinamento. Se manca: onMuovi(gInizio) e onFine(0). */
  onAnnulla?: (gInizio: number) => void;
  /** true (default): angoli circolari, srotolati. false: mappa lineare (fascia a 90° su mobile). */
  circolare?: boolean;
  /** Limiti dell'oggetto, solo per fermare lo srotolamento (braccio [0, 180]). */
  limiti?: readonly [number, number];
  /** Elemento da mettere a fuoco alla presa (lo slider). Default: l'elemento stesso se focalizzabile. */
  focusSu?: () => HTMLElement | SVGElement | null;
}

/** Tolleranza in px tra tocco e trascinamento. */
export const SOGLIA_TOCCO_PX = { dito: 6, mouse: 3 } as const;
/** Raggio attorno al perno in cui l'angolo non si aggiorna. */
export const ZONA_MORTA_PX = 14;
/** Finestra di stima della velocità al rilascio. */
export const FINESTRA_VEL_MS = 90;
/** Se il dito è fermo da più di così al rilascio, la velocità è 0. */
export const FERMO_PRIMA_MS = 70;
/** Margine di srotolamento oltre i limiti. */
const MARGINE_SROTOLA = 90;

/**
 * Eventi già presi da un oggetto annidato (il braccio sta sopra il disco):
 * chi li trova qui li ignora. WeakSet di modulo: nessun accesso al browser.
 */
const eventiPresi = new WeakSet<Event>();

interface Campione {
  t: number;
  g: number;
}

/** Porta una differenza di angoli in (-180, 180]. */
function differenza(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d <= -180) d += 360;
  if (d > 180) d -= 360;
  return d;
}

function velocita(campioni: readonly Campione[], ora: number): number {
  const ultimo = campioni[campioni.length - 1];
  if (!ultimo || ora - ultimo.t > FERMO_PRIMA_MS) return 0;
  let primo: Campione | undefined;
  for (const c of campioni) {
    if (ultimo.t - c.t <= FINESTRA_VEL_MS) {
      primo = c;
      break;
    }
  }
  if (!primo || ultimo.t - primo.t < 8) return 0;
  return ((ultimo.g - primo.g) / (ultimo.t - primo.t)) * 1000;
}

function focalizzabile(el: Element): el is HTMLElement | SVGElement {
  return (el instanceof HTMLElement || el instanceof SVGElement) && el.hasAttribute('tabindex');
}

export function useTrascinaAttorno(ref: RefObject<Element>, o: OpzioniTrascina): void {
  const opz = useRef(o);
  useEffect(() => {
    opz.current = o;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    type Fase = 'riposo' | 'attesa' | 'presa';
    let fase: Fase = 'riposo';
    let idPuntatore = -1;
    let sogliaPx = SOGLIA_TOCCO_PX.dito;
    let x0 = 0;
    let y0 = 0;
    let grezzoPrec = 0;
    let srotolato = 0;
    let scarto = 0;
    let gInizio = 0;
    let ultimoValore = 0;
    let campioni: Campione[] = [];

    const limitaSrotolato = (g: number): number => {
      const l = opz.current.limiti;
      if (!l) return g;
      return Math.min(l[1] + MARGINE_SROTOLA, Math.max(l[0] - MARGINE_SROTOLA, g));
    };

    const nelPerno = (px: number, py: number): boolean => {
      const p = opz.current.perno();
      return Math.hypot(px - p.x, py - p.y) < ZONA_MORTA_PX;
    };

    const leggi = (px: number, py: number): number => {
      const o2 = opz.current;
      const grezzo = o2.gradiDa(px, py);
      if (o2.circolare === false) {
        srotolato = grezzo;
      } else {
        srotolato = limitaSrotolato(srotolato + differenza(grezzo, grezzoPrec));
      }
      grezzoPrec = grezzo;
      return srotolato;
    };

    const campiona = (t: number, g: number): void => {
      campioni.push({ t, g });
      if (campioni.length > 12) campioni = campioni.slice(-8);
    };

    const suEsc = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape' || fase === 'riposo') return;
      e.preventDefault();
      e.stopPropagation();
      const eraPresa = fase === 'presa';
      chiudi();
      if (!eraPresa) return;
      const o2 = opz.current;
      if (o2.onAnnulla) o2.onAnnulla(gInizio);
      else {
        o2.onMuovi(gInizio);
        o2.onFine(0);
      }
    };

    const chiudi = (): void => {
      if (idPuntatore >= 0 && el.hasPointerCapture(idPuntatore)) {
        try {
          el.releasePointerCapture(idPuntatore);
        } catch (_e) {
          /* il puntatore è già stato rilasciato dal browser */
        }
      }
      idPuntatore = -1;
      fase = 'riposo';
      campioni = [];
      el.removeAttribute('data-nov-ix-presa');
      el.ownerDocument.defaultView?.removeEventListener('keydown', suEsc, true);
    };

    const iniziaPresa = (px: number, py: number): void => {
      const o2 = opz.current;
      fase = 'presa';
      el.setAttribute('data-nov-ix-presa', '1');
      const dito = leggi(px, py);
      const attuale = o2.valore ? o2.valore() : dito;
      gInizio = attuale;
      scarto = (o2.tocco ?? 'braccio') === 'braccio' ? attuale - dito : 0;
      ultimoValore = dito + scarto;
      o2.onInizio?.();
      if (scarto === 0) o2.onMuovi(ultimoValore);
      campiona(performance.now(), ultimoValore);
    };

    const suGiu = (ev: Event): void => {
      const e = ev as PointerEvent;
      if (fase !== 'riposo' || eventiPresi.has(e)) return;
      if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const o2 = opz.current;
      if (!o2.attivo()) return;
      eventiPresi.add(e);
      e.preventDefault();
      segnaInput();

      idPuntatore = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_e) {
        /* capture non disponibile: il gesto funziona finché il dito resta sopra */
      }
      el.ownerDocument.defaultView?.addEventListener('keydown', suEsc, true);

      const bersaglio = o2.focusSu ? o2.focusSu() : focalizzabile(el) ? el : null;
      bersaglio?.focus({ preventScroll: true });

      x0 = e.clientX;
      y0 = e.clientY;
      sogliaPx = e.pointerType === 'mouse' ? SOGLIA_TOCCO_PX.mouse : SOGLIA_TOCCO_PX.dito;
      grezzoPrec = o2.gradiDa(x0, y0);
      srotolato = grezzoPrec;
      campioni = [];

      if ((o2.tocco ?? 'braccio') === 'disco') {
        fase = 'attesa';
      } else {
        iniziaPresa(x0, y0);
      }
    };

    const suMuovi = (ev: Event): void => {
      const e = ev as PointerEvent;
      if (fase === 'riposo' || e.pointerId !== idPuntatore) return;
      const px = e.clientX;
      const py = e.clientY;
      if (fase === 'attesa') {
        if (Math.hypot(px - x0, py - y0) < sogliaPx) return;
        segnaInput();
        iniziaPresa(px, py);
        return;
      }
      if (nelPerno(px, py)) return;
      segnaInput();
      const g = leggi(px, py) + scarto;
      if (g === ultimoValore) return;
      ultimoValore = g;
      campiona(performance.now(), g);
      opz.current.onMuovi(g);
    };

    const suSu = (ev: Event): void => {
      const e = ev as PointerEvent;
      if (fase === 'riposo' || e.pointerId !== idPuntatore) return;
      const o2 = opz.current;
      const eraAttesa = fase === 'attesa';
      const vel = velocita(campioni, performance.now());
      const px = e.clientX;
      const py = e.clientY;
      chiudi();
      segnaInput();
      if (eraAttesa) {
        if (nelPerno(px, py)) return;
        const g = o2.gradiDa(px, py);
        if (o2.onTocco) o2.onTocco(g);
        else {
          o2.onInizio?.();
          o2.onMuovi(g);
          o2.onFine(0);
        }
        return;
      }
      o2.onFine(vel);
    };

    const suAnnullato = (ev: Event): void => {
      const e = ev as PointerEvent;
      if (fase === 'riposo' || e.pointerId !== idPuntatore) return;
      const eraPresa = fase === 'presa';
      chiudi();
      if (eraPresa) opz.current.onFine(0);
    };

    const suPersaCattura = (ev: Event): void => {
      const e = ev as PointerEvent;
      if (fase === 'riposo' || e.pointerId !== idPuntatore) return;
      suAnnullato(ev);
    };

    el.addEventListener('pointerdown', suGiu);
    el.addEventListener('pointermove', suMuovi);
    el.addEventListener('pointerup', suSu);
    el.addEventListener('pointercancel', suAnnullato);
    el.addEventListener('lostpointercapture', suPersaCattura);

    return () => {
      const eraPresa = fase === 'presa';
      chiudi();
      if (eraPresa) opz.current.onFine(0);
      el.removeEventListener('pointerdown', suGiu);
      el.removeEventListener('pointermove', suMuovi);
      el.removeEventListener('pointerup', suSu);
      el.removeEventListener('pointercancel', suAnnullato);
      el.removeEventListener('lostpointercapture', suPersaCattura);
    };
  }, [ref]);
}
