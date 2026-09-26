/**
 * IMBRUNIRE · la telecamera: entrare, uscire, stanza accanto, scala.
 *
 * Due strati (tech-architect §2.5): il PALAZZO (celle con scatole 3D piccole)
 * e lo strato DENTRO (fisso, a tutto schermo, con la scatola 3D della stanza
 * scelta e la foto a 1600 px). Entrare è una sola camminata fatta da tre
 * animazioni WAAPI con la stessa durata e la stessa curva:
 *
 * 1. il palazzo si ingrandisce verso il fondo della cella (zoom attorno a un
 *    punto fisso, scala interpolata in logaritmo: velocità percepita costante)
 *    finché il fondo della cella coincide con il fondo dello strato Dentro;
 * 2. lo strato Dentro resta agganciato al fondo della cella per tutto il
 *    viaggio (stessa geometria campionata in 32 fotogrammi chiave) e compare
 *    in dissolvenza tra il 16% e il 50% del percorso;
 * 3. la scatola Dentro avanza verso chi guarda (`translate` in z): le pareti
 *    e il soffitto, più vicini, crescono più in fretta del fondo e escono dai
 *    bordi. È questo che fa "camminare dentro" invece di "zoomare".
 *
 * Uscire è lo stesso percorso al contrario con la stessa curva (frena sul
 * palazzo). Se si torna indietro a metà strada il viaggio nuovo parte dal
 * punto esatto in cui si era, senza salti.
 *
 * Solo `translate`, `scale`, `rotate` (proprietà individuali, che si sommano
 * al `transform` scritto dai CSS delle sezioni senza sovrascriverlo) e
 * `opacity`. Mai `opacity` sulla scatola `preserve-3d`: la dissolvenza sta
 * sullo strato e sul suo elemento prospettiva. `will-change` messo all'inizio
 * e tolto alla fine di ogni viaggio.
 *
 * Contratto con chi chiama (solo `sections/Stanza/useCamera.ts`, §6.7):
 * - `entra` va chiamata in un `useLayoutEffect` dopo il commit che rende
 *   visibile lo strato Dentro (fase 'entra'): le animazioni partono prima
 *   della prima pittura, nessun fotogramma con lo strato già pieno;
 * - `esci` va chiamata con la fase 'esce' già scritta (palazzo visibile);
 *   alla fine lo strato resta nascosto dalle animazioni finché useCamera,
 *   dopo il commit della fase 'ferma', chiama `rilasciaCamera()`;
 * - `carrello` e `scala` chiamano `o.alBuio()` quando la stanza vecchia è al
 *   buio: lì useCamera cambia la stanza mostrata (`impostaCamera`); il rientro
 *   parte due fotogrammi dopo (commit di React).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import type { Layout, SlugCella } from '../state/store';
import { scena, type PartiDentro } from '../core/scena';
import { ticker } from '../core/ticker';
import { BEZIER_CSS, clamp, lerp, progressoTra, smoothstep01 } from './easing';
import { CAMERA, PANNELLO, PASSAGGIO } from './choreography';

/* ------------------------------------------------------------------ */
/* API pubblica                                                        */
/* ------------------------------------------------------------------ */

export interface OpzioniCamera {
  ridotto: boolean;
  layout: Layout;
  /**
   * Solo `entra` ed `esci`: 'cella' (predefinito) fa il viaggio dalla cella;
   * 'dissolvenza' entra o esce senza viaggio (dall'elenco, da un indirizzo
   * aperto direttamente, verso l'elenco).
   */
  origine?: 'cella' | 'dissolvenza';
  /**
   * Solo `carrello` e `scala`: chiamata quando la stanza vecchia è al buio.
   * Qui si cambia la stanza mostrata dallo strato Dentro.
   */
  alBuio?: () => void | Promise<void>;
}

export interface EsitoCamera {
  /** false se il viaggio è stato annullato da un'altra chiamata o da `annullaCamera` */
  completata: boolean;
}

/* ------------------------------------------------------------------ */
/* Stato del modulo                                                    */
/* ------------------------------------------------------------------ */

type TipoViaggio = 'entra' | 'esci' | 'carrello' | 'scala';

interface Tratto {
  /** parametro del percorso all'inizio: 0 = palazzo intero, 1 = dentro la stanza */
  da: number;
  a: number;
}

interface Viaggio {
  readonly tipo: TipoViaggio;
  animazioni: Animation[];
  elementi: HTMLElement[];
  /** solo per i viaggi sul percorso palazzo ↔ dentro */
  tratto: Tratto | null;
  /** animazione da cui leggere il progresso (quella del palazzo o dello strato) */
  guida: Animation | null;
  chiuso: boolean;
  risolvi: (e: EsitoCamera) => void;
}

interface Trattenute {
  animazioni: Animation[];
  elementi: HTMLElement[];
}

let corrente: Viaggio | null = null;
/** animazioni finite che tengono lo stato finale finché useCamera non rilascia */
let trattenute: Trattenute | null = null;

const WILL_CHANGE = 'translate, scale, rotate, opacity';

/* ------------------------------------------------------------------ */
/* Geometria                                                           */
/* ------------------------------------------------------------------ */

interface Punto {
  x: number;
  y: number;
}

interface Rett {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rett(el: Element): Rett {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

function centro(r: Rett): Punto {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

function viewport(): Rett {
  const vv = window.visualViewport;
  const w = vv !== null && vv !== undefined ? vv.width : window.innerWidth;
  const h = vv !== null && vv !== undefined ? vv.height : window.innerHeight;
  return { x: 0, y: 0, w, h };
}

function siIntersecano(a: Rett, b: Rett): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Origine delle trasformazioni di `el` in coordinate della finestra. */
function origineTrasformazione(el: HTMLElement, r: Rett): Punto {
  const parti = getComputedStyle(el).transformOrigin.split(' ');
  const ox = Number.parseFloat(parti[0] ?? '');
  const oy = Number.parseFloat(parti[1] ?? '');
  return {
    x: r.x + (Number.isFinite(ox) ? ox : r.w / 2),
    y: r.y + (Number.isFinite(oy) ? oy : r.h / 2),
  };
}

/** Prospettiva dell'elemento che contiene la scatola (px). */
function prospettivaDi(scatola: HTMLElement): number {
  const genitore = scatola.parentElement;
  if (genitore === null) return CAMERA.prospettivaRipiego;
  const v = Number.parseFloat(getComputedStyle(genitore).perspective);
  return Number.isFinite(v) && v > 0 ? v : CAMERA.prospettivaRipiego;
}

/** L'elemento con la prospettiva: qui si fa il buio del carrello (mai sulla scatola 3D). */
function elementoProspettiva(d: PartiDentro): HTMLElement {
  const genitore = d.scatola.parentElement;
  return genitore !== null && genitore !== d.strato && d.strato.contains(genitore) ? genitore : d.strato;
}

interface Geometria {
  /** origine delle trasformazioni del palazzo */
  O: Punto;
  /** origine delle trasformazioni dello strato Dentro */
  Os: Punto;
  /** punto fisso dello zoom del palazzo */
  X: Punto;
  /** centro del fondo della cella a palazzo fermo */
  fc: Punto;
  /** centro del fondo Dentro a riposo */
  Fdc: Punto;
  /** scala finale del palazzo: il fondo della cella copre il fondo Dentro */
  sE: number;
  /** grandezza del fondo Dentro con la scatola arretrata, rispetto al riposo */
  g: number;
  /** di quanto arretra la scatola Dentro all'inizio (px) */
  dz: number;
}

/**
 * Misura tutto a riposo (nessuna animazione applicata). Restituisce null se
 * il viaggio non ha senso (cella nascosta o fuori dalla finestra, strato non
 * misurabile, scala troppo piccola): in quel caso si entra in dissolvenza.
 */
function misura(slug: SlugCella, dentro: PartiDentro): Geometria | null {
  const palazzo = scena.palazzo();
  const cella = scena.cella(slug);
  if (palazzo === null || cella === undefined) return null;

  const V = viewport();
  const Pr = rett(palazzo);
  const F = rett(cella.fondo);
  const S = rett(dentro.strato);
  const Fd = rett(dentro.fondo);
  if (F.w < 2 || F.h < 2 || Fd.w < 2 || Fd.h < 2 || S.w < 2 || S.h < 2) return null;
  if (!siIntersecano(F, V)) return null;

  const sE = Math.max(Fd.w / F.w, Fd.h / F.h);
  if (!Number.isFinite(sE) || sE < CAMERA.scalaMinima) return null;

  const fc = centro(F);
  const Fdc = centro(Fd);
  const X = {
    x: (Fdc.x - sE * fc.x) / (1 - sE),
    y: (Fdc.y - sE * fc.y) / (1 - sE),
  };

  const dz = CAMERA.camminata * prospettivaDi(dentro.scatola);
  // Grandezza del fondo Dentro con la scatola arretrata di dz: si misura
  // davvero, con un'animazione in pausa sul primo fotogramma.
  const prova = dentro.scatola.animate([{ translate: `0px 0px ${-dz}px` }, { translate: `0px 0px ${-dz}px` }], {
    duration: 1,
    fill: 'both',
  });
  prova.pause();
  prova.currentTime = 0;
  const Fd0 = rett(dentro.fondo);
  prova.cancel();
  const g = clamp(Fd0.w / Fd.w, 0.05, 1);

  return {
    O: origineTrasformazione(palazzo, Pr),
    Os: origineTrasformazione(dentro.strato, S),
    X,
    fc,
    Fdc,
    sE,
    g,
    dz,
  };
}

interface StatoPercorso {
  palazzo: { tx: number; ty: number; s: number };
  strato: { tx: number; ty: number; s: number; opacita: number };
  z: number;
}

/** Tutto il percorso in funzione di p (0 = palazzo intero, 1 = dentro). */
function statoPercorso(G: Geometria, p: number): StatoPercorso {
  const s = Math.pow(G.sE, p);
  // Il fondo della cella nella finestra: M_p(x) = X + s (x − X).
  const mfc = { x: G.X.x + s * (G.fc.x - G.X.x), y: G.X.y + s * (G.fc.y - G.X.y) };
  // Grandezza relativa del fondo Dentro: 1/f è lineare nella profondità.
  const inversoF = lerp(1 / G.g, 1, p);
  const k = (s / G.sE) * inversoF;
  return {
    palazzo: {
      tx: (1 - s) * (G.X.x - G.O.x),
      ty: (1 - s) * (G.X.y - G.O.y),
      s,
    },
    strato: {
      tx: (1 - k) * (G.Fdc.x - G.Os.x) + (mfc.x - G.Fdc.x),
      ty: (1 - k) * (G.Fdc.y - G.Os.y) + (mfc.y - G.Fdc.y),
      s: k,
      opacita: smoothstep01(progressoTra(CAMERA.dissolvenzaDa, CAMERA.dissolvenzaA, p)),
    },
    z: -G.dz * (1 - p),
  };
}

function n3(v: number): string {
  return (Math.abs(v) < 1e-4 ? 0 : v).toFixed(3);
}

interface Fotogrammi {
  palazzo: Keyframe[];
  strato: Keyframe[];
  scatola: Keyframe[];
}

function fotogrammi(G: Geometria, da: number, a: number): Fotogrammi {
  const out: Fotogrammi = { palazzo: [], strato: [], scatola: [] };
  const n = CAMERA.campioni;
  for (let i = 0; i <= n; i += 1) {
    const q = i / n;
    const st = statoPercorso(G, lerp(da, a, q));
    out.palazzo.push({ offset: q, translate: `${n3(st.palazzo.tx)}px ${n3(st.palazzo.ty)}px`, scale: n3(st.palazzo.s) });
    out.strato.push({
      offset: q,
      translate: `${n3(st.strato.tx)}px ${n3(st.strato.ty)}px`,
      scale: n3(st.strato.s),
      opacity: n3(st.strato.opacita),
    });
    out.scatola.push({ offset: q, translate: `0px 0px ${n3(st.z)}px` });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Gestione dei viaggi                                                 */
/* ------------------------------------------------------------------ */

function metteWillChange(elementi: readonly HTMLElement[]): void {
  for (const el of elementi) el.style.willChange = WILL_CHANGE;
}

function togliWillChange(elementi: readonly HTMLElement[]): void {
  for (const el of elementi) el.style.removeProperty('will-change');
}

function cancella(animazioni: readonly Animation[]): void {
  for (const a of animazioni) a.cancel();
}

function rilasciaTrattenute(): void {
  if (trattenute === null) return;
  cancella(trattenute.animazioni);
  togliWillChange(trattenute.elementi);
  trattenute = null;
}

function chiudi(v: Viaggio, esito: EsitoCamera): void {
  if (v.chiuso) return;
  v.chiuso = true;
  if (corrente === v) corrente = null;
  v.risolvi(esito);
}

/** Interrompe il viaggio in corso (promessa risolta con completata: false). */
function interrompi(): void {
  const v = corrente;
  if (v === null) return;
  cancella(v.animazioni);
  togliWillChange(v.elementi);
  chiudi(v, { completata: false });
}

function nuovoViaggio(tipo: TipoViaggio): { v: Viaggio; promessa: Promise<EsitoCamera> } {
  interrompi();
  rilasciaTrattenute();
  let risolvi: (e: EsitoCamera) => void = () => undefined;
  const promessa = new Promise<EsitoCamera>((ok) => {
    risolvi = ok;
  });
  const v: Viaggio = { tipo, animazioni: [], elementi: [], tratto: null, guida: null, chiuso: false, risolvi };
  corrente = v;
  return { v, promessa };
}

/** Punto del percorso palazzo ↔ dentro in cui si trova la camera adesso. */
function puntoAttuale(predefinito: number): number {
  const v = corrente;
  if (v !== null && v.tratto !== null && v.guida !== null) {
    const effetto = v.guida.effect;
    const progresso = effetto !== null ? effetto.getComputedTiming().progress : null;
    if (typeof progresso === 'number') return lerp(v.tratto.da, v.tratto.a, progresso);
    return v.guida.playState === 'finished' ? v.tratto.a : v.tratto.da;
  }
  if (v === null && trattenute !== null) return 0;
  return predefinito;
}

/** Opacità attuale dello strato (per le dissolvenze interrotte). */
function opacitaAttuale(strato: HTMLElement, predefinita: number): number {
  if (corrente === null && trattenute === null) return predefinita;
  const v = Number.parseFloat(getComputedStyle(strato).opacity);
  return Number.isFinite(v) ? clamp(v, 0, 1) : predefinita;
}

async function attendiFine(v: Viaggio, animazioni: readonly Animation[]): Promise<boolean> {
  try {
    await Promise.all(animazioni.map((a) => a.finished));
  } catch (_errore) {
    // AbortError: animazione cancellata da un viaggio nuovo.
    return false;
  }
  return !v.chiuso;
}

/** Aspetta almeno `frame` fotogrammi del ticker e l'istante `finoA` (ms, base performance.now). */
function attendi(frame: number, finoA: number): Promise<void> {
  return new Promise((ok) => {
    let contati = 0;
    let fatto = false;
    const togli = ticker.add((_dt, now) => {
      if (fatto) return false;
      contati += 1;
      if (contati >= frame && now >= finoA) {
        fatto = true;
        togli();
        ok();
        return false;
      }
      return true;
    }, 'read');
  });
}

function registra(v: Viaggio, a: Animation): Animation {
  v.animazioni.push(a);
  return a;
}

function spostamentoPannello(layout: Layout): string {
  return layout === 'sezione' ? `${PANNELLO.spostamento}px 0px` : '0px 100%';
}

/* ------------------------------------------------------------------ */
/* Dissolvenze (reduced motion, elenco, indirizzo diretto)             */
/* ------------------------------------------------------------------ */

async function dissolviEntrata(v: Viaggio, dentro: PartiDentro, o: OpzioniCamera, partenza: number): Promise<void> {
  const durata = Math.max(80, CAMERA.dissolvenza * (1 - partenza));
  const elementi = [dentro.strato];
  if (dentro.pannello !== null) elementi.push(dentro.pannello);
  if (!o.ridotto) elementi.push(dentro.scatola);
  v.elementi = elementi;
  metteWillChange(elementi);

  const animazioni: Animation[] = [
    registra(
      v,
      dentro.strato.animate([{ opacity: n3(partenza) }, { opacity: '1' }], {
        duration: durata,
        easing: BEZIER_CSS.lineare,
        fill: 'both',
      }),
    ),
  ];
  if (dentro.pannello !== null) {
    animazioni.push(
      registra(
        v,
        dentro.pannello.animate([{ opacity: n3(partenza) }, { opacity: '1' }], {
          duration: durata,
          easing: BEZIER_CSS.lineare,
          fill: 'both',
        }),
      ),
    );
  }
  if (!o.ridotto && partenza < 0.5) {
    // Un passo breve oltre la soglia: la stanza è già inquadrata, non c'è viaggio.
    const dz = CAMERA.passoSoglia * CAMERA.camminata * prospettivaDi(dentro.scatola);
    animazioni.push(
      registra(
        v,
        dentro.scatola.animate([{ translate: `0px 0px ${n3(-dz)}px` }, { translate: '0px 0px 0px' }], {
          duration: CAMERA.passoSogliaDurata,
          easing: BEZIER_CSS.soglia,
          fill: 'both',
        }),
      ),
    );
  }

  if (!(await attendiFine(v, animazioni))) return;
  // Stato finale = stato a riposo dello strato Dentro: si cancella subito.
  cancella(v.animazioni);
  togliWillChange(v.elementi);
  chiudi(v, { completata: true });
}

async function dissolviUscita(v: Viaggio, dentro: PartiDentro, partenza: number): Promise<void> {
  const durata = Math.max(80, CAMERA.dissolvenza * partenza);
  const elementi = [dentro.strato];
  if (dentro.pannello !== null) elementi.push(dentro.pannello);
  v.elementi = elementi;
  metteWillChange(elementi);

  const animazioni: Animation[] = [
    registra(
      v,
      dentro.strato.animate([{ opacity: n3(partenza) }, { opacity: '0' }], {
        duration: durata,
        easing: BEZIER_CSS.lineare,
        fill: 'both',
      }),
    ),
  ];
  if (dentro.pannello !== null) {
    animazioni.push(
      registra(
        v,
        dentro.pannello.animate([{ opacity: n3(partenza) }, { opacity: '0' }], {
          duration: durata,
          easing: BEZIER_CSS.lineare,
          fill: 'both',
        }),
      ),
    );
  }

  if (!(await attendiFine(v, animazioni))) return;
  // Lo strato resta nascosto dalle animazioni finché useCamera non rilascia.
  trattenute = { animazioni: [...v.animazioni], elementi: [...v.elementi] };
  v.animazioni = [];
  chiudi(v, { completata: true });
}

/* ------------------------------------------------------------------ */
/* Entrare e uscire                                                    */
/* ------------------------------------------------------------------ */

/** Entrare in una cella: 1100 ms, curva soglia (CD §6.2). */
export function entra(slug: SlugCella, o: OpzioniCamera): Promise<EsitoCamera> {
  const pDa = puntoAttuale(0);
  const dentroPrima = scena.dentro();
  const partenza = dentroPrima !== undefined ? opacitaAttuale(dentroPrima.strato, 0) : 0;
  const { v, promessa } = nuovoViaggio('entra');

  const dentro = scena.dentro();
  if (dentro === undefined || typeof dentro.strato.animate !== 'function') {
    chiudi(v, { completata: true });
    return promessa;
  }

  const geometria = o.ridotto || o.origine === 'dissolvenza' ? null : misura(slug, dentro);
  if (geometria === null) {
    void dissolviEntrata(v, dentro, o, partenza);
    return promessa;
  }

  void viaggia(v, geometria, dentro, o, pDa, 1);
  return promessa;
}

/** Uscire all'indietro: 800 ms, stessa curva sul percorso inverso (CD §6.3). */
export function esci(slug: SlugCella, o: OpzioniCamera): Promise<EsitoCamera> {
  const pDa = puntoAttuale(1);
  const dentroPrima = scena.dentro();
  const partenza = dentroPrima !== undefined ? opacitaAttuale(dentroPrima.strato, 1) : 1;
  const { v, promessa } = nuovoViaggio('esci');

  const dentro = scena.dentro();
  if (dentro === undefined || typeof dentro.strato.animate !== 'function') {
    chiudi(v, { completata: true });
    return promessa;
  }

  if (o.layout === 'torre' && !o.ridotto && o.origine !== 'dissolvenza') {
    // Nella torre la cella d'arrivo può essere fuori schermo (dopo carrello o
    // scala): la si porta al centro prima di misurare, senza animazione (lo
    // strato Dentro copre ancora tutto).
    const cella = scena.cella(slug);
    if (cella !== undefined && !siIntersecano(rett(cella.cella), viewport())) {
      cella.cella.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    }
  }

  const geometria = o.ridotto || o.origine === 'dissolvenza' ? null : misura(slug, dentro);
  if (geometria === null) {
    void dissolviUscita(v, dentro, partenza);
    return promessa;
  }

  void viaggia(v, geometria, dentro, o, pDa, 0);
  return promessa;
}

async function viaggia(
  v: Viaggio,
  G: Geometria,
  dentro: PartiDentro,
  o: OpzioniCamera,
  da: number,
  a: number,
): Promise<void> {
  const palazzo = scena.palazzo();
  if (palazzo === null) {
    chiudi(v, { completata: true });
    return;
  }

  const verso = a > da ? 'entra' : 'esci';
  const base = verso === 'entra' ? CAMERA.entra : CAMERA.esci;
  const durata = Math.max(CAMERA.minimo, base * Math.abs(a - da));
  const tempi: KeyframeAnimationOptions = { duration: durata, easing: BEZIER_CSS.soglia, fill: 'both' };
  const kf = fotogrammi(G, da, a);

  const elementi = [palazzo, dentro.strato, dentro.scatola];
  if (dentro.pannello !== null) elementi.push(dentro.pannello);
  v.elementi = elementi;
  metteWillChange(elementi);

  const guida = registra(v, palazzo.animate(kf.palazzo, tempi));
  registra(v, dentro.strato.animate(kf.strato, tempi));
  registra(v, dentro.scatola.animate(kf.scatola, tempi));
  v.tratto = { da, a };
  v.guida = guida;

  const pannello = dentro.pannello;
  if (pannello !== null) {
    if (verso === 'entra') {
      // Il pannello arriva quando il passo frena (a 680 ms di 1100).
      const quota = durata / CAMERA.entra;
      registra(
        v,
        pannello.animate(
          [
            { opacity: o.layout === 'sezione' ? '0' : '1', translate: spostamentoPannello(o.layout) },
            { opacity: '1', translate: '0px 0px' },
          ],
          {
            duration: PANNELLO.durata,
            delay: PANNELLO.ritardo * quota,
            easing: BEZIER_CSS.interfaccia,
            fill: 'both',
          },
        ),
      );
    } else {
      // Il pannello se ne va per primo, alla velocità dell'interfaccia.
      registra(
        v,
        pannello.animate(
          [
            { opacity: '1', translate: '0px 0px' },
            { opacity: o.layout === 'sezione' ? '0' : '1', translate: spostamentoPannello(o.layout) },
          ],
          { duration: PANNELLO.uscita, easing: BEZIER_CSS.interfaccia, fill: 'both' },
        ),
      );
    }
  }

  if (!(await attendiFine(v, v.animazioni))) return;

  if (verso === 'entra') {
    // Stato finale = riposo dello strato Dentro (visibile, identità, scatola a
    // z 0, pannello al suo posto). Il palazzo ingrandito torna all'identità
    // sotto uno strato opaco: nessun salto visibile.
    cancella(v.animazioni);
    togliWillChange(v.elementi);
    chiudi(v, { completata: true });
    return;
  }

  // Uscita: il palazzo è già all'identità (riposo). Strato, scatola e pannello
  // restano nascosti dalle animazioni finché useCamera non rilascia.
  guida.cancel();
  togliWillChange([palazzo]);
  const tenute = v.animazioni.filter((x) => x !== guida);
  trattenute = { animazioni: tenute, elementi: v.elementi.filter((el) => el !== palazzo) };
  v.animazioni = [];
  chiudi(v, { completata: true });
}

/* ------------------------------------------------------------------ */
/* Stanza accanto e scala                                              */
/* ------------------------------------------------------------------ */

function verso(da: SlugCella, a: SlugCella, asse: 'x' | 'y'): 1 | -1 {
  const cDa = scena.cella(da);
  const cA = scena.cella(a);
  if (cDa === undefined || cA === undefined) return 1;
  const pDa = centro(rett(cDa.cella));
  const pA = centro(rett(cA.cella));
  const d = asse === 'x' ? pA.x - pDa.x : pA.y - pDa.y;
  return d < 0 ? -1 : 1;
}

async function passaggio(tipo: 'carrello' | 'scala', da: SlugCella, a: SlugCella, o: OpzioniCamera): Promise<EsitoCamera> {
  const asse = tipo === 'carrello' ? 'x' : 'y';
  const dir = verso(da, a, asse);
  const { v, promessa } = nuovoViaggio(tipo);

  const dentro = scena.dentro();
  if (o.ridotto || dentro === undefined || typeof dentro.strato.animate !== 'function') {
    // Stato finale immediato: la stanza cambia, nessun movimento, nessun buio.
    await o.alBuio?.();
    if (!v.chiuso) chiudi(v, { completata: true });
    return promessa;
  }

  const inizio = performance.now();
  const S = rett(dentro.strato);
  const spostamento =
    tipo === 'carrello' ? PASSAGGIO.carrelloSpostamento * S.w : PASSAGGIO.scalaSpostamento * S.h;
  const rotazione = tipo === 'carrello' ? PASSAGGIO.carrelloRotazione : PASSAGGIO.scalaRotazione;
  const asseRot = tipo === 'carrello' ? 'y' : 'x';
  // Si va verso la stanza nuova: la vecchia scivola dalla parte opposta e lo
  // sguardo si volta verso la porta (o sale con i gradini).
  const via = (segno: number): Keyframe => ({
    translate: asse === 'x' ? `${n3(segno * spostamento)}px 0px 0px` : `0px ${n3(segno * spostamento)}px 0px`,
    rotate: `${asseRot} ${n3((asse === 'x' ? segno : -segno) * rotazione)}deg`,
  });
  const fermo: Keyframe = { translate: '0px 0px 0px', rotate: `${asseRot} 0deg` };

  const prospettiva = elementoProspettiva(dentro);
  const elementiVia = [prospettiva, dentro.scatola];
  if (dentro.pannello !== null) elementiVia.push(dentro.pannello);
  v.elementi = elementiVia;
  metteWillChange(elementiVia);

  const tempiVia: KeyframeAnimationOptions = {
    duration: PASSAGGIO.buio,
    easing: BEZIER_CSS.carrelloVia,
    fill: 'both',
  };
  const uscita: Animation[] = [
    registra(v, prospettiva.animate([{ opacity: '1' }, { opacity: '0' }], tempiVia)),
    registra(v, dentro.scatola.animate([fermo, via(-dir)], tempiVia)),
  ];
  if (dentro.pannello !== null) {
    uscita.push(
      registra(
        v,
        dentro.pannello.animate([{ opacity: '1' }, { opacity: '0' }], {
          duration: PANNELLO.uscita,
          easing: BEZIER_CSS.interfaccia,
          fill: 'both',
        }),
      ),
    );
  }

  if (!(await attendiFine(v, uscita))) return promessa;

  await o.alBuio?.();
  if (v.chiuso) return promessa;
  await attendi(PASSAGGIO.frameDopoCambio, inizio + PASSAGGIO.pausaMinima);
  if (v.chiuso) return promessa;

  // Lo strato può essere stato rimontato: si rileggono le parti.
  const nuovo = scena.dentro() ?? dentro;
  const prospettivaNuova = elementoProspettiva(nuovo);
  const elementiRientro = [prospettivaNuova, nuovo.scatola];
  if (nuovo.pannello !== null) elementiRientro.push(nuovo.pannello);

  const tempiRientro: KeyframeAnimationOptions = {
    duration: PASSAGGIO.rientro,
    easing: tipo === 'carrello' ? BEZIER_CSS.carrello : BEZIER_CSS.scala,
    fill: 'both',
  };
  // Prima si creano le animazioni di rientro (stesso compito, nessuna
  // pittura in mezzo), poi si cancellano quelle d'uscita: nessun fotogramma
  // con la stanza nuova piena e ferma.
  const rientro: Animation[] = [
    prospettivaNuova.animate([{ opacity: '0' }, { opacity: '1' }], tempiRientro),
    nuovo.scatola.animate([via(dir), fermo], tempiRientro),
  ];
  if (nuovo.pannello !== null) {
    rientro.push(
      nuovo.pannello.animate([{ opacity: '0' }, { opacity: '1' }], {
        duration: PANNELLO.rientro,
        delay: PANNELLO.rientroRitardo,
        easing: BEZIER_CSS.interfaccia,
        fill: 'both',
      }),
    );
  }
  cancella(uscita);
  togliWillChange(elementiVia);
  v.animazioni = [...rientro];
  v.elementi = elementiRientro;
  metteWillChange(elementiRientro);

  if (!(await attendiFine(v, rientro))) return promessa;
  // Stato finale = riposo: si cancella subito.
  cancella(v.animazioni);
  togliWillChange(v.elementi);
  chiudi(v, { completata: true });
  return promessa;
}

/** Stanza accanto sullo stesso piano: carrello laterale (buio 480 ms, rientro 700 ms). */
export function carrello(da: SlugCella, a: SlugCella, o: OpzioniCamera): Promise<EsitoCamera> {
  return passaggio('carrello', da, a, o);
}

/** Piano di sopra o di sotto dal pianerottolo: la scala (buio 480 ms, rientro 700 ms). */
export function scala(da: SlugCella, a: SlugCella, o: OpzioniCamera): Promise<EsitoCamera> {
  return passaggio('scala', da, a, o);
}

/* ------------------------------------------------------------------ */
/* Annullare e rilasciare                                              */
/* ------------------------------------------------------------------ */

/**
 * Ferma tutto e riporta ogni elemento al suo stato a riposo (quello dei CSS):
 * la promessa in corso si risolve con `completata: false`. La chiamano lo
 * smontaggio di Imbrunire.tsx e useCamera quando la vista salta (per esempio
 * da una stanza all'elenco senza passare dal palazzo).
 */
export function annullaCamera(): void {
  interrompi();
  rilasciaTrattenute();
}

/**
 * Toglie le animazioni finite che tengono lo strato Dentro nascosto dopo
 * un'uscita. useCamera la chiama in un `useLayoutEffect` dopo il commit della
 * fase 'ferma' (lo strato è già vuoto o nascosto dal suo CSS).
 */
export function rilasciaCamera(): void {
  rilasciaTrattenute();
}

/** true mentre una camera è in viaggio (per la diagnostica e i test). */
export function cameraInViaggio(): boolean {
  return corrente !== null;
}
