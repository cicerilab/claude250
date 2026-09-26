/**
 * BATTIFILO · "Tira il filo": puntatore → pixel e velocità (interaction-designer).
 *
 * Un solo hook per i tre posti in cui si tira il tempo:
 *
 * | Dove                          | `presa`     | `asse`         | Cosa passa al chiamante                          |
 * |-------------------------------|-------------|----------------|--------------------------------------------------|
 * | la cassetta (tutti i formati) | 'immediata' | 'libero'       | x del dito: la cassetta lo segue con lo scarto   |
 * | la striscia del filo (largo)  | 'soglia'    | 'libero'       | tocco = tacca più vicina; oltre soglia, x assoluta|
 * | striscia + lastra (stretto)   | 'soglia'    | 'orizzontale'  | dx dal punto di presa: il nastro scorre sotto    |
 *
 * Il hook NON converte in mesi e non muove niente: `useCassetta.ts`
 * (section-builder-linea) trasforma px in `pos` con `posDaX()` di
 * `core/tempo.ts` e comanda `motion/cassetta.ts` (`trascina`, `rilascia`,
 * `vaA`). Così il contratto con il motion-designer resta uno solo.
 *
 * Regole (creative-director §4.3, ux-architect §5.3.2, §5.3.4, §6.4):
 * - Pointer Events con `setPointerCapture`: il gesto non si perde quando il
 *   dito esce dalla striscia. Solo il puntatore primario, solo tasto sinistro.
 * - 'immediata': si afferra al `pointerdown` (la cassetta è un oggetto: la
 *   prendi e basta). Afferrarla mentre vola verso una tacca la ferma, come
 *   una mano (il controller lo fa quando riceve `trascina`).
 * - 'soglia': fino a 8 px (dito e penna) o 3 px (mouse) è un tocco; oltre, un
 *   trascinamento. Il tocco su un punto non interattivo chiama `onTocco(x)`;
 *   sopra un bottone (una tacca, "mese prima") lascia fare al clic nativo.
 * - 'orizzontale': la presa scatta solo se i primi 8 px sono entro 30°
 *   dall'orizzontale (`asseDelGesto`). Un gesto verticale non è nostro: lo
 *   prende `useSwipe` (un mese) o lo scorrimento nativo della lastra espansa.
 * - Un trascinamento partito sopra una tacca non la attiva al rilascio: il
 *   clic che segue viene assorbito (se no, tirando il nastro su mobile si
 *   finirebbe sempre sulla tacca da cui si è partiti).
 * - Esc durante la presa: `onAnnulla()`, il chiamante torna dove era.
 *   `pointercancel` (il sistema si è preso il gesto): `onAnnulla()` se c'è,
 *   altrimenti `onFine(0)`.
 * - Un secondo dito (pizzico per lo zoom): il gesto si annulla e il pizzico
 *   resta al browser. Con la pagina già ingrandita col pizzico
 *   (`visualViewport.scale > 1`) il dito sulla lastra sposta la vista, non il
 *   tempo: niente presa 'orizzontale' (la cassetta resta afferrabile).
 * - Velocità al rilascio in px/s sugli ultimi 90 ms; se il dito è rimasto
 *   fermo più di 70 ms prima di alzarsi, 0 (niente lancio: il controller
 *   aggancia alla tappa vicina, al massimo +1 nel verso se la velocità è alta).
 * - Durante la presa l'elemento porta `data-btf-ix-presa="1"` (cursore
 *   "grabbing", niente selezione di testo: interaction.css). È l'unico
 *   attributo che questo hook scrive, e solo all'inizio e alla fine.
 *
 * Eventi nativi agganciati in un effetto: nessun setState, nessuna lettura di
 * layout (le misure della linea le legge il chiamante in `onInizio`, l'unico
 * momento in cui è permesso: tech-architect §6.2).
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { segnaInput } from './attivita';

/** Tolleranza tra tocco e trascinamento, in px CSS. */
export const SOGLIA_PRESA_PX = { dito: 8, mouse: 3 } as const;
/** Angolo massimo dall'orizzontale per un gesto orizzontale (ux-architect §5.3.4). */
export const ANGOLO_ORIZZONTALE = 30;
/** Angolo minimo dall'orizzontale per un gesto verticale (sotto: gesto incerto, ignorato). */
export const ANGOLO_VERTICALE = 60;
/** Finestra di stima della velocità al rilascio. */
export const FINESTRA_VEL_MS = 90;
/** Se il dito è fermo da più di così al rilascio, la velocità è 0. */
export const FERMO_PRIMA_MS = 70;
/** Per quanto si assorbe il clic dopo un trascinamento partito sopra un bottone. */
const ASSORBI_CLIC_MS = 400;

export type Asse = 'orizzontale' | 'verticale' | 'incerto';

/**
 * Asse di un gesto dal punto di partenza. `null` finché lo spostamento è sotto
 * `soglia` px. Stessa funzione per trascina.ts e swipe.ts: i due hook, attaccati
 * allo stesso elemento, si dividono il gesto senza parlarsi.
 */
export function asseDelGesto(dx: number, dy: number, soglia: number = SOGLIA_PRESA_PX.dito): Asse | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.hypot(ax, ay) < soglia) return null;
  const gradi = (Math.atan2(ay, ax) * 180) / Math.PI;
  if (gradi <= ANGOLO_ORIZZONTALE) return 'orizzontale';
  if (gradi >= ANGOLO_VERTICALE) return 'verticale';
  return 'incerto';
}

/** La pagina è ingrandita col pizzico (visualViewport). Solo in handler ed effetti. */
export function ingranditaColPizzico(el: Element): boolean {
  const vv = el.ownerDocument.defaultView?.visualViewport;
  return !!vv && vv.scale > 1.01;
}

/**
 * `pointerdown` già presi da un elemento annidato (la cassetta sta dentro la
 * striscia): chi li ritrova risalendo li ignora. WeakSet di modulo, nessun
 * accesso al browser. Lo usa anche swipe.ts.
 */
export const eventiPresi = new WeakSet<Event>();

/**
 * Puntatori che in questo momento stanno tirando il tempo (fase 'presa').
 * swipe.ts lo guarda: un gesto già diventato trascinamento non è anche uno
 * swipe. Set di numeri di modulo: nessun accesso al browser.
 */
export const puntatoriInPresa = new Set<number>();

/** Elementi che hanno un'azione propria al clic: il tocco lo lascia a loro. */
const SELETTORE_INTERATTIVI =
  'button, a[href], input, select, textarea, label, [role="slider"], [role="button"], [tabindex]:not([tabindex="-1"])';

export interface InizioPresa {
  /** clientX del `pointerdown` (punto di presa). */
  x0: number;
  /** clientX attuale (uguale a x0 con presa immediata). */
  x: number;
  /** Tipo di puntatore: il chiamante può scegliere curve diverse per dito e mouse. */
  puntatore: string;
}

export interface OpzioniTrascina {
  /** Letto a ogni pressione: se falso il gesto non parte (vista aperta, modo documento…). */
  attivo: () => boolean;
  /** 'immediata' per la cassetta; 'soglia' per striscia e lastra. */
  presa: 'immediata' | 'soglia';
  /** 'libero': qualunque direzione oltre soglia. 'orizzontale': solo entro 30°. */
  asse: 'libero' | 'orizzontale';
  /** Inizio della presa. Qui il chiamante può leggere il layout (sinistraPagina). */
  onInizio: (p: InizioPresa) => void;
  /** Ogni spostamento: clientX e differenza dal punto di presa (x − x0). */
  onMuovi: (x: number, dx: number) => void;
  /** Rilascio: velocità orizzontale in px/s (positiva verso destra). */
  onFine: (velPxAlSecondo: number) => void;
  /** Tocco senza trascinamento su un punto non interattivo (solo presa 'soglia'). */
  onTocco?: (x: number) => void;
  /** Esc o gesto preso dal sistema durante la presa. Se manca: onFine(0). */
  onAnnulla?: () => void;
  /** Elemento da mettere a fuoco alla presa (la cassetta, così le frecce continuano da lì). */
  focusSu?: () => HTMLElement | null;
  /** Tipi di puntatore accettati. Default tutti. La lastra su mobile: ['touch', 'pen']. */
  puntatori?: readonly ('mouse' | 'touch' | 'pen')[];
}

interface Campione {
  t: number;
  x: number;
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
  return ((ultimo.x - primo.x) / (ultimo.t - primo.t)) * 1000;
}

export function useTrascinaOrizzontale(ref: RefObject<HTMLElement>, o: OpzioniTrascina): void {
  const opz = useRef(o);
  useEffect(() => {
    opz.current = o;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const finestra = el.ownerDocument.defaultView;
    if (!finestra) return undefined;

    type Fase = 'riposo' | 'attesa' | 'presa';
    let fase: Fase = 'riposo';
    let idPuntatore = -1;
    let tipoPuntatore = 'mouse';
    let soglia: number = SOGLIA_PRESA_PX.dito;
    let x0 = 0;
    let y0 = 0;
    let ultimoX = 0;
    let partitoSuInterattivo = false;
    let campioni: Campione[] = [];
    let assorbiClicFino = Number.NEGATIVE_INFINITY;

    const campiona = (t: number, x: number): void => {
      campioni.push({ t, x });
      if (campioni.length > 14) campioni = campioni.slice(-8);
    };

    const suEsc = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape' || fase === 'riposo') return;
      e.preventDefault();
      e.stopPropagation();
      annulla();
    };

    const chiudi = (): void => {
      // Prima lo stato, poi il rilascio: `lostpointercapture` trova già 'riposo'.
      const id = idPuntatore;
      if (fase === 'presa') puntatoriInPresa.delete(id);
      idPuntatore = -1;
      fase = 'riposo';
      campioni = [];
      if (id >= 0) {
        try {
          if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
        } catch (_e) {
          /* il puntatore è già stato rilasciato dal browser */
        }
      }
      el.removeAttribute('data-btf-ix-presa');
      finestra.removeEventListener('keydown', suEsc, true);
    };

    const annulla = (): void => {
      const eraPresa = fase === 'presa';
      chiudi();
      if (!eraPresa) return;
      const o2 = opz.current;
      if (o2.onAnnulla) o2.onAnnulla();
      else o2.onFine(0);
    };

    const iniziaPresa = (x: number): void => {
      if (puntatoriInPresa.has(idPuntatore)) {
        // Un elemento annidato (più interno) ha già preso questo gesto.
        chiudi();
        return;
      }
      fase = 'presa';
      puntatoriInPresa.add(idPuntatore);
      el.setAttribute('data-btf-ix-presa', '1');
      try {
        el.setPointerCapture(idPuntatore);
      } catch (_e) {
        /* capture non disponibile: il gesto regge finché il dito resta sopra */
      }
      const o2 = opz.current;
      o2.focusSu?.()?.focus({ preventScroll: true });
      segnaInput();
      o2.onInizio({ x0, x, puntatore: tipoPuntatore });
      ultimoX = x;
      campiona(performance.now(), x);
      if (x !== x0) o2.onMuovi(x, x - x0);
    };

    const suGiu = (ev: PointerEvent): void => {
      if (eventiPresi.has(ev)) return;
      if (fase !== 'riposo') {
        // Un secondo dito mentre il primo tira: è un pizzico, il gesto è del browser.
        if (!ev.isPrimary) annulla();
        return;
      }
      if (!ev.isPrimary || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      const o2 = opz.current;
      const tipi = o2.puntatori;
      if (tipi && !tipi.includes(ev.pointerType as 'mouse' | 'touch' | 'pen')) return;
      if (!o2.attivo()) return;
      if (o2.asse === 'orizzontale' && ev.pointerType !== 'mouse' && ingranditaColPizzico(el)) return;

      // Solo la presa immediata "possiede" il pointerdown: con la soglia il
      // gesto resta aperto anche a swipe.ts attaccato allo stesso elemento.
      if (o2.presa === 'immediata') eventiPresi.add(ev);
      idPuntatore = ev.pointerId;
      tipoPuntatore = ev.pointerType;
      soglia = ev.pointerType === 'mouse' ? SOGLIA_PRESA_PX.mouse : SOGLIA_PRESA_PX.dito;
      x0 = ev.clientX;
      y0 = ev.clientY;
      campioni = [];
      const bersaglio = ev.target instanceof Element ? ev.target : null;
      const interattivo = bersaglio?.closest(SELETTORE_INTERATTIVI) ?? null;
      partitoSuInterattivo = interattivo !== null && interattivo !== el && el.contains(interattivo);
      finestra.addEventListener('keydown', suEsc, true);

      if (o2.presa === 'immediata') {
        // Niente selezione di testo né trascinamento dell'immagine del browser.
        ev.preventDefault();
        iniziaPresa(ev.clientX);
      } else {
        fase = 'attesa';
      }
    };

    const suMuovi = (ev: PointerEvent): void => {
      if (fase === 'riposo' || ev.pointerId !== idPuntatore) return;
      const x = ev.clientX;
      if (fase === 'attesa') {
        const dx = x - x0;
        const dy = ev.clientY - y0;
        const o2 = opz.current;
        if (o2.asse === 'orizzontale') {
          const asse = asseDelGesto(dx, dy, soglia);
          if (asse === null) return;
          if (asse !== 'orizzontale') {
            // Gesto verticale o incerto: non è nostro.
            chiudi();
            return;
          }
        } else if (Math.hypot(dx, dy) < soglia) {
          return;
        }
        iniziaPresa(x);
        return;
      }
      if (x === ultimoX) return;
      ultimoX = x;
      segnaInput();
      campiona(performance.now(), x);
      opz.current.onMuovi(x, x - x0);
    };

    const suSu = (ev: PointerEvent): void => {
      if (fase === 'riposo' || ev.pointerId !== idPuntatore) return;
      const o2 = opz.current;
      const eraAttesa = fase === 'attesa';
      const vel = velocita(campioni, performance.now());
      const suInterattivo = partitoSuInterattivo;
      chiudi();
      segnaInput();
      if (eraAttesa) {
        // Un tocco. Sopra un bottone decide il clic nativo; altrove, la tacca più vicina.
        if (!suInterattivo) o2.onTocco?.(ev.clientX);
        return;
      }
      if (suInterattivo) assorbiClicFino = performance.now() + ASSORBI_CLIC_MS;
      o2.onFine(vel);
    };

    const suAnnullato = (ev: PointerEvent): void => {
      if (fase === 'riposo' || ev.pointerId !== idPuntatore) return;
      annulla();
    };

    const suClic = (ev: MouseEvent): void => {
      if (performance.now() > assorbiClicFino) return;
      assorbiClicFino = Number.NEGATIVE_INFINITY;
      ev.preventDefault();
      ev.stopPropagation();
    };

    // L'immagine trascinata dal browser (desktop) ruberebbe il gesto.
    const suDragStart = (ev: DragEvent): void => {
      if (fase !== 'riposo') ev.preventDefault();
    };

    el.addEventListener('pointerdown', suGiu);
    el.addEventListener('pointermove', suMuovi);
    el.addEventListener('pointerup', suSu);
    el.addEventListener('pointercancel', suAnnullato);
    el.addEventListener('lostpointercapture', suAnnullato);
    el.addEventListener('click', suClic, true);
    el.addEventListener('dragstart', suDragStart);

    return () => {
      annulla();
      el.removeEventListener('pointerdown', suGiu);
      el.removeEventListener('pointermove', suMuovi);
      el.removeEventListener('pointerup', suSu);
      el.removeEventListener('pointercancel', suAnnullato);
      el.removeEventListener('lostpointercapture', suAnnullato);
      el.removeEventListener('click', suClic, true);
      el.removeEventListener('dragstart', suDragStart);
    };
  }, [ref]);
}
