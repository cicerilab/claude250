/**
 * EVIDENZIA · l'interazione firma: passare l'evidenziatore su un annuncio
 * (interaction-designer; CD 4.4, ux-architect 5.7 A e 6.4).
 *
 * `useEvidenziatore(ref, id)` si monta sull'`<article data-evd-annuncio>`.
 * Non restituisce stato React: durante il gesto scrive solo in
 * `runtime.tratti` e sul canale `segni`; lo store cambia una volta, al
 * rilascio (INP: un solo `store.set`).
 *
 * Regole del gesto
 * - Mouse e penna: si preme ovunque sull'annuncio (tranne il bottone
 *   Evidenzia e i link) e si trascina. Dopo 6 px: se il movimento è entro 30°
 *   dall'orizzontale parte il tratto, altrimenti il foglio passa alla mano
 *   (`avviaPanDaPuntatore`, trend R2).
 * - Dito sul foglio (≥ 640 px): il tratto parte solo dalla riga d'attacco
 *   (zona di presa alta almeno 44 px), il resto dell'annuncio sposta il
 *   foglio. Dito sulla colonna (< 640 px): da tutto l'annuncio. In entrambi i
 *   casi serve un movimento di 12 px entro 30°; il verticale scorre (il CSS
 *   dà `touch-action: pan-y`, e il browser ci manda `pointercancel`).
 * - Col dito il gesto non parte a meno di 24 px dal bordo della finestra
 *   (il bordo è "indietro" del sistema, trend R5).
 * - Il tratto parte dal punto premuto e segue il puntatore sulla riga
 *   d'attacco, agganciato alla sua linea di base (il puntatore guida la
 *   lunghezza, non l'altezza). Tornando indietro si accorcia. Se il
 *   puntatore scende sotto la prima riga quando questa è coperta al 90%, il
 *   tratto continua sulla seconda (al massimo due righe).
 * - Rilascio: copertura della prima riga ≥ 55% → il tratto si completa e
 *   l'annuncio entra nel giro; sotto → si ritira.
 * - Annullamento (WCAG 2.5.2): uscire dall'annuncio di oltre 40 px in
 *   verticale, Esc, perdita del puntatore, cambio di vista, finestra in
 *   secondo piano → il tratto si ritira, nulla cambia.
 * - Ripasso: lo stesso gesto su un annuncio già nel giro lo toglie (≥ 55%);
 *   mentre passa, il rosa si fa più pallido.
 * - Quinto annuncio: con quattro case nel giro il gesto non segna. Appena
 *   supera la soglia l'evidenziatore "è scarico" (tratto pallido a strisce,
 *   si ferma a metà, si ritira da solo) e lo store riceve il tentativo
 *   (`evidenzia` → 'pieno', che mostra la riga del quinto).
 * - In Pagina intera nessun tratto: il clic porta a Leggi (usePan).
 * - Il clic che il browser manda dopo un trascinamento su un bottone
 *   (l'attacco apre la scheda) viene assorbito: un tratto non apre schede.
 *
 * L'alternativa senza gesto è il bottone Evidenzia dell'annuncio (WCAG
 * 2.5.1, 2.5.7), che chiama `alterna(id, 'bottone')`: il tratto si disegna
 * da solo (Tratto.tsx lo vede dallo store).
 */

import { useEffect, type RefObject } from 'react';
import { MAX_GIRO } from '../content/annunci';
import { ticker } from '../core/ticker';
import { registro, type RigaTratto } from '../state/registro';
import { runtime } from '../state/runtime';
import { evidenzia, store, togli, type IdAnnuncio } from '../state/store';
import { segni, type ModoTratto } from './segni';
import { avviaPanDaPuntatore } from './usePan';

/** Soglie del CD 4.4 e dell'ux-architect 6.4. */
export const SOGLIA_MOUSE_PX = 6;
export const SOGLIA_TOUCH_PX = 12;
export const ANGOLO_MAX_GRADI = 30;
export const SOGLIA_COMPLETA = 0.55;
export const USCITA_VERTICALE_PX = 40;
export const BORDO_TOUCH_PX = 24;
export const PRESA_MIN_PX = 44;
/** Quanto deve essere coperta la prima riga perché il tratto scenda alla seconda. */
const PASSA_A_SECONDA = 0.9;
/** Inerzia della punta: la carta frena appena l'inchiostro (1/s). */
const INSEGUIMENTO = 38;
/** Finestra in cui il clic "gemello" di un trascinamento viene assorbito. */
const CLIC_GEMELLO_MS = 450;

const TAN_ANGOLO = Math.tan((ANGOLO_MAX_GRADI * Math.PI) / 180);
const ESCLUSI = '[data-evd-no-tratto], a[href], input, select, textarea, [contenteditable="true"]';

type Fase = 'attesa' | 'tratto' | 'consumato';

interface Gesto {
  fase: Fase;
  pointerId: number;
  tipo: 'mouse' | 'pen' | 'touch';
  modo: ModoTratto;
  /** punto di pressione, px client */
  cx0: number;
  cy0: number;
  /** misure lette UNA volta alla pressione */
  rettLeft: number;
  rettTop: number;
  scala: number;
  altezzaLocale: number;
  scrollX0: number;
  scrollY0: number;
  righe: readonly RigaTratto[];
  totale: number;
  /** posizione di partenza lungo le righe, px locali */
  pos0: number;
  /** posizione corrente lungo le righe, px locali */
  pos: number;
  togliUpdate: (() => void) | null;
  /** ultimi due campioni (tempo ms, bersaglio) per la velocità al rilascio */
  tPrec: number;
  bPrec: number;
  velocita: number;
}

function nuovoGesto(): Gesto {
  return {
    fase: 'attesa',
    pointerId: -1,
    tipo: 'mouse',
    modo: 'segna',
    cx0: 0,
    cy0: 0,
    rettLeft: 0,
    rettTop: 0,
    scala: 1,
    altezzaLocale: 0,
    scrollX0: 0,
    scrollY0: 0,
    righe: [],
    totale: 0,
    pos0: 0,
    pos: 0,
    togliUpdate: null,
    tPrec: 0,
    bPrec: 0,
    velocita: 0,
  };
}

function limita(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Righe dell'attacco dal registro (unità locali non scalate), al massimo due. */
function righeDi(id: IdAnnuncio): readonly RigaTratto[] {
  const voce = registro.get(id);
  if (voce === undefined) return [];
  return voce.righe.slice(0, 2);
}

function totaleRighe(righe: readonly RigaTratto[]): number {
  let t = 0;
  for (const r of righe) t += r.w;
  return t;
}

/** Il punto (locale) è nella zona di presa della riga d'attacco? (touch sul foglio) */
function inZonaPresa(righe: readonly RigaTratto[], y: number): boolean {
  if (righe.length === 0) return false;
  let alto = Infinity;
  let basso = -Infinity;
  for (const r of righe) {
    alto = Math.min(alto, r.y);
    basso = Math.max(basso, r.y + r.h);
  }
  const mancante = Math.max(0, PRESA_MIN_PX - (basso - alto)) / 2;
  return y >= alto - mancante && y <= basso + mancante;
}

/** Posizione lungo le righe (px locali, 0..totale) per un punto locale. */
function posizioneSuRighe(g: Gesto, x: number, y: number): number {
  const r0 = g.righe[0];
  if (r0 === undefined) return 0;
  const r1 = g.righe[1];
  const suPrima = limita(x - r0.x, 0, r0.w);
  if (r1 !== undefined && y > r0.y + r0.h && g.pos >= r0.w * PASSA_A_SECONDA) {
    return r0.w + limita(x - r1.x, 0, r1.w);
  }
  return suPrima;
}

/** Copertura della prima riga, 0..1 (è quella che decide: CD 4.4). */
function copertura(g: Gesto): number {
  const r0 = g.righe[0];
  if (r0 === undefined || r0.w <= 0) return 0;
  return limita((Math.min(g.pos, r0.w) - g.pos0) / r0.w, 0, 1);
}

function aLocale(g: Gesto, clientX: number, clientY: number): { x: number; y: number } {
  const f = runtime.foglio;
  // se il foglio (o la finestra) scorre durante il gesto, l'annuncio si è spostato
  const dx = f.x - g.scrollX0;
  const dy = f.y - g.scrollY0;
  return {
    x: (clientX - g.rettLeft + dx) / g.scala,
    y: (clientY - g.rettTop + dy) / g.scala,
  };
}

function assorbiClicGemello(): void {
  const assorbi = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    window.removeEventListener('click', assorbi, true);
  };
  window.addEventListener('click', assorbi, true);
  window.setTimeout(() => {
    window.removeEventListener('click', assorbi, true);
  }, CLIC_GEMELLO_MS);
}

export function useEvidenziatore(ref: RefObject<HTMLElement>, id: IdAnnuncio): void {
  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;

    let g: Gesto = nuovoGesto();
    let attivo = false;

    const voceRuntime = () => {
      let v = runtime.tratti.get(id);
      if (v === undefined) {
        v = { avanzamento: 0, bersaglio: 0, riga: 0, gesto: false };
        runtime.tratti.set(id, v);
      }
      return v;
    };

    /** Fase update del ticker: la punta insegue il bersaglio. */
    const insegui = (dt: number): boolean => {
      const v = runtime.tratti.get(id);
      if (v === undefined || !v.gesto) return false;
      const diff = v.bersaglio - v.avanzamento;
      if (Math.abs(diff) < 0.0008) {
        v.avanzamento = v.bersaglio;
        return false;
      }
      v.avanzamento += diff * (1 - Math.exp(-dt * INSEGUIMENTO));
      return true;
    };

    const staccaDocumento = (): void => {
      document.removeEventListener('keydown', suTasto, true);
      window.removeEventListener('blur', suBlur);
    };

    const rilascia = (): void => {
      if (g.pointerId >= 0 && el.hasPointerCapture(g.pointerId)) {
        try {
          el.releasePointerCapture(g.pointerId);
        } catch {
          // già rilasciato
        }
      }
      g.togliUpdate?.();
      g.togliUpdate = null;
      const v = runtime.tratti.get(id);
      if (v !== undefined) v.gesto = false;
      staccaDocumento();
      attivo = false;
    };

    /** Chiude il gesto con l'esito deciso. `conferma` false = annullato. */
    const chiudi = (conferma: boolean): void => {
      if (!attivo) return;
      const fase = g.fase;
      if (fase === 'tratto') {
        const v = voceRuntime();
        const da = v.avanzamento;
        const cop = copertura(g);
        const ok = conferma && cop >= SOGLIA_COMPLETA;
        if (g.modo === 'segna') {
          if (ok) {
            segni.attendi(id, 'aggiunta');
            segni.emetti(id, { tipo: 'completa', da, velocita: Math.max(0, g.velocita) });
            const esito = evidenzia(id, 'gesto');
            if (esito === 'pieno') {
              segni.annullaAttesa(id);
              segni.emetti(id, { tipo: 'scarico' });
            } else if (esito === 'gia') {
              segni.annullaAttesa(id);
            }
          } else {
            segni.emetti(id, { tipo: 'ritira', da, a: segni.inizio(id) });
          }
        } else if (g.modo === 'ripasso') {
          if (ok) {
            segni.attendi(id, 'rimozione');
            segni.emetti(id, { tipo: 'toglie' });
            togli(id, 'gesto');
          } else {
            segni.emetti(id, { tipo: 'ripristina' });
          }
        }
        assorbiClicGemello();
      } else if (fase === 'consumato') {
        assorbiClicGemello();
      }
      rilascia();
      if (fase !== 'attesa') segni.emetti(id, { tipo: 'fine' });
      g = nuovoGesto();
    };

    const suTasto = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && g.fase !== 'attesa') {
        e.preventDefault();
        e.stopPropagation();
        chiudi(false);
      }
    };
    const suBlur = (): void => {
      chiudi(false);
    };

    /** Soglia superata: la punta tocca la carta. */
    const partiTratto = (e: PointerEvent): void => {
      const s = store.get();
      const segnato = s.segnati.includes(id);
      const pieno = s.segnati.length >= MAX_GIRO;
      const modo: ModoTratto = segnato ? 'ripasso' : pieno ? 'scarico' : 'segna';
      g.modo = modo;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // senza cattura il gesto funziona finché il puntatore resta sull'annuncio
      }

      if (modo === 'scarico') {
        g.fase = 'consumato';
        segni.impostaInizio(id, 0);
        segni.emetti(id, { tipo: 'inizio', modo });
        segni.emetti(id, { tipo: 'scarico' });
        evidenzia(id, 'gesto');
        return;
      }

      g.fase = 'tratto';
      const inizio = g.totale > 0 ? g.pos0 / g.totale : 0;
      const v = voceRuntime();
      v.gesto = true;
      v.riga = 0;
      if (modo === 'segna') {
        segni.impostaInizio(id, inizio);
        v.avanzamento = inizio;
        v.bersaglio = inizio;
      } else {
        segni.impostaRipasso(id, 0);
        v.avanzamento = 1;
        v.bersaglio = 1;
      }
      segni.emetti(id, { tipo: 'inizio', modo });
      g.togliUpdate = ticker.add(insegui, 'update');
      muovi(e);
    };

    const muovi = (e: PointerEvent): void => {
      const p = aLocale(g, e.clientX, e.clientY);
      if (p.y < -USCITA_VERTICALE_PX || p.y > g.altezzaLocale + USCITA_VERTICALE_PX) {
        chiudi(false);
        return;
      }
      g.pos = posizioneSuRighe(g, p.x, p.y);
      const v = voceRuntime();
      const r0 = g.righe[0];
      v.riga = r0 !== undefined && g.pos > r0.w ? 1 : 0;
      if (g.modo === 'segna') {
        v.bersaglio = g.totale > 0 ? Math.max(g.pos0, g.pos) / g.totale : 0;
        const dtMs = e.timeStamp - g.tPrec;
        if (g.tPrec > 0 && dtMs > 4) {
          const istantanea = ((v.bersaglio - g.bPrec) * 1000) / dtMs;
          // media mobile corta: un ultimo campione nervoso non decide lo slancio
          g.velocita = g.velocita * 0.4 + istantanea * 0.6;
        }
        g.tPrec = e.timeStamp;
        g.bPrec = v.bersaglio;
      } else {
        segni.impostaRipasso(id, limita(copertura(g) / SOGLIA_COMPLETA, 0, 1));
      }
      ticker.wake();
    };

    const suPointerDown = (e: PointerEvent): void => {
      if (attivo || segni.gestoCorrente !== null) return;
      if (!e.isPrimary || e.button !== 0) return;
      const s = store.get();
      if (s.vista !== 'leggi' || runtime.pan.spazio) return;
      const bersaglio = e.target instanceof Element ? e.target : null;
      if (bersaglio !== null && bersaglio.closest(ESCLUSI) !== null) return;

      const righe = righeDi(id);
      if (righe.length === 0) return;
      const tipo = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse';

      if (tipo === 'touch') {
        const larghezza = window.innerWidth;
        if (e.clientX < BORDO_TOUCH_PX || e.clientX > larghezza - BORDO_TOUCH_PX) return;
      }

      // misure una volta sola, alla pressione (mai durante il movimento)
      const rett = el.getBoundingClientRect();
      const larghezzaLocale = el.offsetWidth;
      const scala = larghezzaLocale > 0 ? rett.width / larghezzaLocale : 1;

      g = nuovoGesto();
      g.pointerId = e.pointerId;
      g.tipo = tipo;
      g.cx0 = e.clientX;
      g.cy0 = e.clientY;
      g.rettLeft = rett.left;
      g.rettTop = rett.top;
      g.scala = scala > 0 ? scala : 1;
      g.altezzaLocale = el.offsetHeight;
      g.scrollX0 = runtime.foglio.x;
      g.scrollY0 = runtime.foglio.y;
      g.righe = righe;
      g.totale = totaleRighe(righe);

      const p = aLocale(g, e.clientX, e.clientY);
      if (tipo === 'touch' && s.layout === 'foglio' && !inZonaPresa(righe, p.y)) return;

      const r0 = righe[0];
      g.pos0 = r0 === undefined ? 0 : limita(p.x - r0.x, 0, r0.w);
      g.pos = g.pos0;
      attivo = true;
      document.addEventListener('keydown', suTasto, true);
      window.addEventListener('blur', suBlur);
    };

    const suPointerMove = (e: PointerEvent): void => {
      if (!attivo || e.pointerId !== g.pointerId) return;
      if (g.fase === 'consumato') return;
      if (g.fase === 'tratto') {
        e.preventDefault();
        muovi(e);
        return;
      }
      const dx = e.clientX - g.cx0;
      const dy = e.clientY - g.cy0;
      const soglia = g.tipo === 'touch' ? SOGLIA_TOUCH_PX : SOGLIA_MOUSE_PX;
      if (Math.hypot(dx, dy) < soglia) return;
      const orizzontale = Math.abs(dy) <= Math.abs(dx) * TAN_ANGOLO;
      if (orizzontale) {
        e.preventDefault();
        partiTratto(e);
        return;
      }
      // gesto verticale: il tratto non parte
      const tipo = g.tipo;
      rilascia();
      g = nuovoGesto();
      if (tipo !== 'touch') avviaPanDaPuntatore(e);
    };

    const suPointerUp = (e: PointerEvent): void => {
      if (!attivo || e.pointerId !== g.pointerId) return;
      if (g.fase === 'tratto') {
        muovi(e);
        if (!attivo) return;
      }
      chiudi(true);
    };

    const suPointerCancel = (e: PointerEvent): void => {
      if (!attivo || e.pointerId !== g.pointerId) return;
      chiudi(false);
    };

    /** Il trascinamento nativo di immagini e testo non deve rubare il gesto. */
    const suDragStart = (e: DragEvent): void => {
      e.preventDefault();
    };

    const annullaSeCambiaVista = store.subscribe(() => {
      if (attivo && store.get().vista !== 'leggi') chiudi(false);
    });

    el.addEventListener('pointerdown', suPointerDown);
    el.addEventListener('pointermove', suPointerMove);
    el.addEventListener('pointerup', suPointerUp);
    el.addEventListener('pointercancel', suPointerCancel);
    el.addEventListener('lostpointercapture', suPointerCancel);
    el.addEventListener('dragstart', suDragStart);

    return () => {
      annullaSeCambiaVista();
      el.removeEventListener('pointerdown', suPointerDown);
      el.removeEventListener('pointermove', suPointerMove);
      el.removeEventListener('pointerup', suPointerUp);
      el.removeEventListener('pointercancel', suPointerCancel);
      el.removeEventListener('lostpointercapture', suPointerCancel);
      el.removeEventListener('dragstart', suDragStart);
      if (attivo) chiudi(false);
    };
  }, [ref, id]);
}
