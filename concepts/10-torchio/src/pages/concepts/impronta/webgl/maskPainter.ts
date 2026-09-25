/**
 * IMPRONTA · pittore delle maschere (webgl-artist)
 *
 * Da una ReliefSpec (e dal suo elemento DOM "fantasma") disegna su un canvas
 * 2D la maschera che la cottura trasforma in mappa d'altezza:
 *
 *   R = altezza (forma netta; il valore dice quanto affonda: 1 = secco pieno)
 *   G = inchiostro
 *   B = lamina
 *   A = 255 (canvas opaco, fondo nero = foglio intatto)
 *
 * STESSA METRICA DEL DOM. Quando c'è l'elemento, ogni carattere viene
 * disegnato dove il browser l'ha davvero composto: si legge il rettangolo di
 * ogni carattere con un Range, si riporta il suo centro nel riferimento non
 * ruotato del blocco, e si allarga o stringe il glifo del canvas finché la sua
 * avanzata coincide con quella del DOM. Così crenatura, letter-spacing,
 * larghezze variabili di Anybody (anche quelle che il canvas non sa chiedere,
 * come wdth 130) e a capo coincidono al pixel con il testo vero, anche dentro
 * i pezzi ruotati di "Per chi".
 *
 * Senza elemento (testi generati, layer senza selettore) si compone sul canvas
 * con lo stile dato: a capo per parole, allineamento, interlinea.
 *
 * Nessun accesso a window/document a livello di modulo: tutto dentro le funzioni.
 */
import type { ReliefSpec } from '../relief/types';
import {
  CORPO_DEFAULT_PX,
  PRESET_TECNICA,
  margineMaschera,
  raggiSmusso,
  tecnicaGL,
  type TecnicaGL,
} from './presets';

/* ------------------------------------------------------------------------- */
/* Tipi                                                                       */
/* ------------------------------------------------------------------------- */

export interface StileMaschera {
  /** font-family completa come in CSS (con i ripieghi). */
  famiglia: string;
  /** font-size in px CSS. */
  dimensione: number;
  /** font-weight 1..1000 (Anybody: 100..900). */
  peso: number;
  /** Asse wdth / font-stretch in percento (Anybody: 50..150). */
  larghezza: number;
  /** letter-spacing in px CSS. */
  spaziatura: number;
  /** line-height in px CSS. */
  interlinea: number;
  allineamento: 'left' | 'center' | 'right';
  trasformazione: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Un layer di un pezzo composto (kind 'piece'): testi, svg e cordonature
 * posizionati in percentuale del rettangolo del pezzo. Forma richiesta a
 * `relief/types.ts` (vedi docs/webgl-artist.md, "Contratti richiesti").
 */
export interface LayerMaschera {
  kind: 'text' | 'svg' | 'linea';
  /** Riquadro in percento del blocco, 0..100. */
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  svg?: string;
  /** Tecnica del layer; se manca vale quella del blocco. */
  tecnica?: string;
  /** 0..1, moltiplica l'altezza della tecnica (0,25 = inchiostro "a bacio", quasi piatto). */
  profondita?: number;
  /** Elemento dentro il blocco da cui prendere testo, metrica e posizione vere. */
  selettore?: string;
  /** Stile per i layer senza selettore (o per forzare lo stato finale). */
  stile?: Partial<StileMaschera>;
}

export interface OpzioniMaschera {
  spec: ReliefSpec;
  /** Il fantasma DOM del blocco (ReliefText) o l'elemento del pezzo non ruotato. */
  el?: HTMLElement | null;
  /** Misura del blocco non ruotato in px CSS (usata se manca `el`). */
  larghezza: number;
  altezza: number;
  /** Texel per px CSS: di solito min(dpr, 1.5) (tech-architect §7.4). */
  scala: number;
  /** Lato massimo della maschera in texel (default 2048: il lato dell'atlante). */
  maxLato?: number;
  /**
   * Stile forzato per il testo del blocco. Se presente si compone sul canvas
   * (non si legge il DOM), per esempio per cuocere lo stato finale mentre il
   * DOM è ancora a metà animazione.
   */
  stile?: Partial<StileMaschera>;
  /** Canvas da riusare (evita allocazioni a ogni tasto nel Banco). */
  canvas?: HTMLCanvasElement | null;
  /** Salta `document.fonts.load` (quando si è certi che i font sono già pronti). */
  fontGiaPronti?: boolean;
}

export interface RisultatoMaschera {
  canvas: HTMLCanvasElement;
  /** Misura del canvas in texel. */
  larghezzaTexel: number;
  altezzaTexel: number;
  /** Scala effettiva (può essere minore di quella chiesta se si superava maxLato). */
  scala: number;
  /** Margine aggiunto per lato, px CSS: blocks.ts allarga il rettangolo di tanto. */
  padCss: number;
  /**
   * Misura coperta dal canvas in px CSS: blocco + 2 × padCss, più meno di un
   * texel di arrotondamento a destra e in basso. Il rettangolo per lo shader è
   * { x: blocco.x - padCss, y: blocco.y - padCss, w: larghezzaCss, h: altezzaCss }.
   */
  larghezzaCss: number;
  altezzaCss: number;
  /** [r1, r2, r3, rInk] in texel per il blur. */
  raggiTexel: [number, number, number, number];
  /** Corpo usato per profondità e smusso, px CSS. */
  corpoCss: number;
  tecnica: TecnicaGL;
}

/* ------------------------------------------------------------------------- */
/* Stile                                                                      */
/* ------------------------------------------------------------------------- */

const STRETCH_KEYWORD: ReadonlyArray<readonly [number, string]> = [
  [50, 'ultra-condensed'],
  [62.5, 'extra-condensed'],
  [75, 'condensed'],
  [87.5, 'semi-condensed'],
  [100, 'normal'],
  [112.5, 'semi-expanded'],
  [125, 'expanded'],
  [150, 'extra-expanded'],
  [200, 'ultra-expanded'],
];

/** La parola chiave di font-stretch più vicina (il canvas accetta solo parole chiave). */
function parolaStretch(percento: number): string {
  let migliore = 'normal';
  let dist = Infinity;
  for (const [v, k] of STRETCH_KEYWORD) {
    const d = Math.abs(v - percento);
    if (d < dist) {
      dist = d;
      migliore = k;
    }
  }
  return migliore;
}

function percentoStretch(valore: string): number {
  const v = valore.trim();
  if (v.endsWith('%')) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 100;
  }
  for (const [n, k] of STRETCH_KEYWORD) if (k === v) return n;
  return 100;
}

/** Legge un asse da font-variation-settings ('"wdth" 150, "wght" 900'). */
function asse(fvs: string, tag: string): number | null {
  const re = new RegExp(`["']${tag}["']\\s+(-?[0-9.]+)`);
  const m = re.exec(fvs);
  if (!m || m[1] === undefined) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

/** Stile tipografico calcolato di un elemento, come lo vede il browser. */
export function leggiStile(el: Element): StileMaschera {
  const cs = getComputedStyle(el);
  const dimensione = parseFloat(cs.fontSize) || 16;
  let peso = parseFloat(cs.fontWeight) || 400;
  let larghezza = percentoStretch(cs.fontStretch || '100%');
  const fvs = cs.fontVariationSettings || 'normal';
  if (fvs !== 'normal') {
    const w = asse(fvs, 'wdth');
    const g = asse(fvs, 'wght');
    if (w !== null) larghezza = w;
    if (g !== null) peso = g;
  }
  const ls = cs.letterSpacing;
  const spaziatura = ls === 'normal' ? 0 : parseFloat(ls) || 0;
  const lh = cs.lineHeight;
  const interlinea = lh === 'normal' ? dimensione * 1.2 : parseFloat(lh) || dimensione * 1.2;
  const ta = cs.textAlign;
  const allineamento: StileMaschera['allineamento'] =
    ta === 'center' ? 'center' : ta === 'right' || ta === 'end' ? 'right' : 'left';
  const tt = cs.textTransform;
  const trasformazione: StileMaschera['trasformazione'] =
    tt === 'uppercase' || tt === 'lowercase' || tt === 'capitalize' ? tt : 'none';
  return {
    famiglia: cs.fontFamily || 'sans-serif',
    dimensione,
    peso,
    larghezza,
    spaziatura,
    interlinea,
    allineamento,
    trasformazione,
  };
}

const STILE_BASE: StileMaschera = {
  famiglia: 'Anybody, sans-serif',
  dimensione: 48,
  peso: 900,
  larghezza: 150,
  spaziatura: 0,
  interlinea: 48 * 0.92,
  allineamento: 'left',
  trasformazione: 'none',
};

function completaStile(parziale: Partial<StileMaschera> | undefined, base: StileMaschera = STILE_BASE): StileMaschera {
  const s = { ...base, ...(parziale ?? {}) };
  if (parziale?.dimensione !== undefined && parziale.interlinea === undefined) {
    s.interlinea = parziale.dimensione * (base.interlinea / base.dimensione);
  }
  return s;
}

/** Stringa `ctx.font` equivalente allo stile (peso, larghezza, corpo, famiglia). */
export function fontCanvas(s: StileMaschera): string {
  const peso = Math.round(Math.max(1, Math.min(1000, s.peso)));
  return `${peso} ${parolaStretch(s.larghezza)} ${s.dimensione}px ${s.famiglia}`;
}

type Ctx2D = CanvasRenderingContext2D;

/**
 * Proprietà di testo recenti del canvas (fontStretch: Chrome 99, Safari 17;
 * letterSpacing: Chrome 99, Safari 18, Firefox 115). Si leggono come record
 * generico per sapere a runtime se il browser le ha davvero.
 */
function proprieta(ctx: Ctx2D): Record<string, unknown> {
  return ctx as unknown as Record<string, unknown>;
}

function haLetterSpacing(ctx: Ctx2D): boolean {
  return typeof proprieta(ctx)['letterSpacing'] === 'string';
}

function impostaLetterSpacing(ctx: Ctx2D, px: number): void {
  if (haLetterSpacing(ctx)) proprieta(ctx)['letterSpacing'] = `${px}px`;
}

function applicaFont(ctx: Ctx2D, s: StileMaschera): void {
  ctx.font = fontCanvas(s);
  const p = proprieta(ctx);
  if (typeof p['fontStretch'] === 'string') p['fontStretch'] = parolaStretch(s.larghezza);
  if (typeof p['fontKerning'] === 'string') p['fontKerning'] = 'normal';
  impostaLetterSpacing(ctx, 0);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

/** Ascendente e discendente del font corrente (come l'area del contenuto inline del DOM). */
function metricheVerticali(ctx: Ctx2D, dimensione: number): { asc: number; disc: number } {
  const m = ctx.measureText('Hgjpq');
  const asc = m.fontBoundingBoxAscent;
  const disc = m.fontBoundingBoxDescent;
  if (Number.isFinite(asc) && Number.isFinite(disc) && asc + disc > 0) return { asc, disc };
  return { asc: dimensione * 0.8, disc: dimensione * 0.2 };
}

function trasforma(ch: string, t: StileMaschera['trasformazione'], inizioParola: boolean): string {
  if (t === 'uppercase') return ch.toLocaleUpperCase('it');
  if (t === 'lowercase') return ch.toLocaleLowerCase('it');
  if (t === 'capitalize' && inizioParola) return ch.toLocaleUpperCase('it');
  return ch;
}

async function caricaFont(stili: StileMaschera[], testo: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const campione = testo.length > 0 ? testo.slice(0, 64) : 'Aa';
  const visti = new Set<string>();
  const attese: Promise<unknown>[] = [];
  for (const s of stili) {
    const f = fontCanvas(s);
    if (visti.has(f)) continue;
    visti.add(f);
    attese.push(document.fonts.load(f, campione).catch(() => []));
  }
  await Promise.all(attese);
}

/* ------------------------------------------------------------------------- */
/* Canali                                                                     */
/* ------------------------------------------------------------------------- */

interface Canali {
  altezza: number;
  inchiostro: boolean;
  lamina: boolean;
}

function canaliDi(tecnica: TecnicaGL, profondita = 1): Canali {
  const p = PRESET_TECNICA[tecnica];
  const k = Math.max(0, Math.min(1, profondita));
  return { altezza: p.altezza * k, inchiostro: p.inchiostro, lamina: p.lamina };
}

/** Colore da disegnare in modalità 'lighter' per scrivere i canali voluti. */
function coloreCanali(c: Canali): string {
  const r = Math.round(255 * Math.max(0, Math.min(1, c.altezza)));
  const g = c.inchiostro ? 255 : 0;
  const b = c.lamina ? 255 : 0;
  return `rgb(${r}, ${g}, ${b})`;
}

/* ------------------------------------------------------------------------- */
/* Disegno: testo dal DOM                                                     */
/* ------------------------------------------------------------------------- */

interface RiferimentoBlocco {
  /** Elemento del blocco (il riferimento delle coordinate locali). */
  el: HTMLElement;
  /** Misura non ruotata del blocco, px CSS. */
  W: number;
  H: number;
  /** Rotazione del blocco in radianti (oraria come CSS). */
  rot: number;
}

/**
 * Disegna il testo di `sorgente` (il blocco stesso o un suo discendente)
 * carattere per carattere, nelle posizioni composte dal browser, nel
 * riferimento locale non ruotato del blocco. Il contesto deve già avere la
 * trasformazione "px CSS locali → texel".
 */
function disegnaTestoDom(
  ctx: Ctx2D,
  sorgente: Element,
  rif: RiferimentoBlocco,
  colore: string,
  trasformazioneForzata?: StileMaschera['trasformazione'],
): void {
  const rb = rif.el.getBoundingClientRect();
  const c = Math.cos(rif.rot);
  const s = Math.sin(rif.rot);
  const ac = Math.abs(c);
  const as = Math.abs(s);
  // Scala di eventuali transform (scale) sugli antenati: rapporto tra il
  // riquadro misurato e quello atteso dalla sola rotazione.
  const atteso = rif.W * ac + rif.H * as;
  const scala = atteso > 0 && rb.width > 0 ? rb.width / atteso : 1;
  const cx = rb.left + rb.width / 2;
  const cy = rb.top + rb.height / 2;
  const det = c * c - s * s;

  const range = document.createRange();
  const walker = document.createTreeWalker(sorgente, NodeFilter.SHOW_TEXT);
  let stileCorrente: Element | null = null;
  let stile: StileMaschera = STILE_BASE;
  let asc = 0;
  let disc = 0;
  let prec = ' ';

  ctx.fillStyle = colore;

  for (let nodo = walker.nextNode(); nodo; nodo = walker.nextNode()) {
    const testo = nodo.nodeValue ?? '';
    if (testo.length === 0) continue;
    const padre = nodo.parentElement;
    if (!padre) continue;
    if (padre !== stileCorrente) {
      stileCorrente = padre;
      stile = leggiStile(padre);
      applicaFont(ctx, stile);
      const mv = metricheVerticali(ctx, stile.dimensione);
      asc = mv.asc;
      disc = mv.disc;
    }
    const tt = trasformazioneForzata ?? stile.trasformazione;

    let i = 0;
    while (i < testo.length) {
      const cp = testo.codePointAt(i) ?? 32;
      const len = cp > 0xffff ? 2 : 1;
      const grezzo = testo.slice(i, i + len);
      const spazio = /\s/.test(grezzo);
      if (!spazio) {
        range.setStart(nodo, i);
        range.setEnd(nodo, i + len);
        const rects = range.getClientRects();
        let r: DOMRect | null = null;
        for (let k = 0; k < rects.length; k++) {
          const cand = rects.item(k);
          if (cand && (cand.width > 0 || cand.height > 0)) {
            r = cand;
            break;
          }
        }
        if (r) {
          const glifo = trasforma(grezzo, tt, /\s/.test(prec));
          // Centro del carattere riportato nel riferimento locale non ruotato.
          const dx = (r.left + r.width / 2 - cx) / scala;
          const dy = (r.top + r.height / 2 - cy) / scala;
          const lx = c * dx + s * dy + rif.W / 2;
          const ly = -s * dx + c * dy + rif.H / 2;
          // Avanzata DOM (larghezza non ruotata del riquadro del carattere).
          let avanzata: number;
          if (Math.abs(det) > 0.3) {
            avanzata = (r.width * ac - r.height * as) / det / scala;
          } else {
            avanzata = ctx.measureText(glifo).width + stile.spaziatura;
          }
          const misura = ctx.measureText(glifo).width;
          const corpo = Math.max(0, avanzata - stile.spaziatura);
          const sx = misura > 0 ? Math.max(0.6, Math.min(1.6, corpo / misura)) : 1;
          const x0 = lx - avanzata / 2;
          const base = ly - (asc + disc) / 2 + asc;
          ctx.save();
          ctx.translate(x0, base);
          ctx.scale(sx, 1);
          ctx.fillText(glifo, 0, 0);
          ctx.restore();
        }
      }
      prec = grezzo;
      i += len;
    }
  }
  range.detach();
}

/* ------------------------------------------------------------------------- */
/* Disegno: testo composto sul canvas                                         */
/* ------------------------------------------------------------------------- */

interface Riquadro {
  x: number;
  y: number;
  w: number;
  h: number;
}

function larghezzaRiga(ctx: Ctx2D, riga: string, spaziatura: number, nativa: boolean): number {
  const w = ctx.measureText(riga).width;
  if (nativa) return w;
  return w + spaziatura * Array.from(riga).length;
}

function spezzaRighe(ctx: Ctx2D, testo: string, max: number, spaziatura: number, nativa: boolean): string[] {
  const righe: string[] = [];
  for (const paragrafo of testo.split(/\n/)) {
    const parole = paragrafo.split(/\s+/).filter((p) => p.length > 0);
    if (parole.length === 0) {
      righe.push('');
      continue;
    }
    let riga = parole[0] ?? '';
    for (let k = 1; k < parole.length; k++) {
      const prova = `${riga} ${parole[k] ?? ''}`;
      if (larghezzaRiga(ctx, prova, spaziatura, nativa) <= max) riga = prova;
      else {
        righe.push(riga);
        riga = parole[k] ?? '';
      }
    }
    righe.push(riga);
  }
  return righe;
}

function disegnaTestoLayout(
  ctx: Ctx2D,
  testoGrezzo: string,
  box: Riquadro,
  stile: StileMaschera,
  colore: string,
  verticale: 'alto' | 'centro',
): void {
  applicaFont(ctx, stile);
  const nativa = haLetterSpacing(ctx);
  if (nativa) impostaLetterSpacing(ctx, stile.spaziatura);
  const { asc, disc } = metricheVerticali(ctx, stile.dimensione);

  let testo = testoGrezzo;
  if (stile.trasformazione === 'uppercase') testo = testo.toLocaleUpperCase('it');
  else if (stile.trasformazione === 'lowercase') testo = testo.toLocaleLowerCase('it');
  else if (stile.trasformazione === 'capitalize') {
    testo = testo.replace(/(^|\s)(\S)/g, (_m, a: string, b: string) => a + b.toLocaleUpperCase('it'));
  }

  const righe = spezzaRighe(ctx, testo, box.w, stile.spaziatura, nativa);
  const lh = stile.interlinea;
  const totale = righe.length * lh;
  let y0 = box.y;
  if (verticale === 'centro') y0 = box.y + (box.h - totale) / 2;

  ctx.fillStyle = colore;
  righe.forEach((riga, n) => {
    const w = larghezzaRiga(ctx, riga, stile.spaziatura, nativa);
    let x = box.x;
    if (stile.allineamento === 'center') x = box.x + (box.w - w) / 2;
    else if (stile.allineamento === 'right') x = box.x + box.w - w;
    // Come il DOM: l'area del contenuto è centrata nella riga.
    const base = y0 + n * lh + (lh - (asc + disc)) / 2 + asc;
    if (nativa) {
      ctx.fillText(riga, x, base);
    } else {
      let cx = x;
      for (const ch of Array.from(riga)) {
        ctx.fillText(ch, cx, base);
        cx += ctx.measureText(ch).width + stile.spaziatura;
      }
    }
  });
  if (nativa) impostaLetterSpacing(ctx, 0);
}

/* ------------------------------------------------------------------------- */
/* Disegno: svg e cordonature                                                 */
/* ------------------------------------------------------------------------- */

/** Rapporto larghezza/altezza dal viewBox (o dagli attributi width/height). */
function proporzioneSvg(markup: string): number {
  const vb = /viewBox\s*=\s*["']\s*([-0-9.eE]+)[\s,]+([-0-9.eE]+)[\s,]+([-0-9.eE]+)[\s,]+([-0-9.eE]+)/.exec(markup);
  if (vb && vb[3] !== undefined && vb[4] !== undefined) {
    const w = parseFloat(vb[3]);
    const h = parseFloat(vb[4]);
    if (w > 0 && h > 0) return w / h;
  }
  const wm = /<svg[^>]*\swidth\s*=\s*["']([0-9.]+)/.exec(markup);
  const hm = /<svg[^>]*\sheight\s*=\s*["']([0-9.]+)/.exec(markup);
  if (wm && hm && wm[1] !== undefined && hm[1] !== undefined) {
    const w = parseFloat(wm[1]);
    const h = parseFloat(hm[1]);
    if (w > 0 && h > 0) return w / h;
  }
  return 1;
}

/**
 * Imposta width/height espliciti sulla radice, così ogni browser rasterizza
 * l'svg alla misura finale (Safari altrimenti lo rasterizza alla misura
 * intrinseca e lo ingrandisce sfocato).
 */
function svgAMisura(markup: string, w: number, h: number): string {
  return markup.replace(/<svg\b([^>]*)>/, (_m, attr: string) => {
    const pulito = attr.replace(/\s(width|height)\s*=\s*["'][^"']*["']/g, '');
    return `<svg${pulito} width="${Math.max(1, Math.round(w))}" height="${Math.max(1, Math.round(h))}">`;
  });
}

async function caricaImmagineSvg(markup: string): Promise<HTMLImageElement | null> {
  if (typeof document === 'undefined') return null;
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try {
    await img.decode();
    return img;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Disegna un svg come sagoma monocroma nei canali voluti: l'svg (con i suoi
 * colori, qualunque siano) va su un canvas di appoggio, poi 'source-in' lo
 * riempie del colore dei canali, poi si somma alla maschera in 'lighter'.
 */
async function disegnaSvg(
  ctx: Ctx2D,
  appoggio: HTMLCanvasElement,
  markup: string,
  box: Riquadro,
  colore: string,
  scala: number,
  pad: number,
): Promise<void> {
  const r = proporzioneSvg(markup);
  let w = box.w;
  let h = w / r;
  if (h > box.h) {
    h = box.h;
    w = h * r;
  }
  const x = box.x + (box.w - w) / 2;
  const y = box.y + (box.h - h) / 2;
  const img = await caricaImmagineSvg(svgAMisura(markup, w * scala, h * scala));
  if (!img) return;
  const a = appoggio.getContext('2d');
  if (!a) return;
  a.setTransform(1, 0, 0, 1, 0, 0);
  a.globalCompositeOperation = 'source-over';
  a.clearRect(0, 0, appoggio.width, appoggio.height);
  a.setTransform(scala, 0, 0, scala, pad * scala, pad * scala);
  a.drawImage(img, x, y, w, h);
  a.setTransform(1, 0, 0, 1, 0, 0);
  a.globalCompositeOperation = 'source-in';
  a.fillStyle = colore;
  a.fillRect(0, 0, appoggio.width, appoggio.height);
  a.globalCompositeOperation = 'source-over';

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(appoggio, 0, 0);
  ctx.restore();
}

/** Cordonatura: il riquadro stesso, con le estremità tonde. */
function disegnaLinea(ctx: Ctx2D, box: Riquadro, colore: string): void {
  ctx.fillStyle = colore;
  const r = Math.min(box.w, box.h) / 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(box.x, box.y, box.w, box.h, r);
  } else {
    ctx.rect(box.x, box.y, box.w, box.h);
  }
  ctx.fill();
}

/* ------------------------------------------------------------------------- */
/* Entrata                                                                    */
/* ------------------------------------------------------------------------- */

function creaCanvas(w: number, h: number, riuso?: HTMLCanvasElement | null): HTMLCanvasElement {
  const c = riuso ?? document.createElement('canvas');
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  return c;
}

/** Corpo del blocco: font-size del testo, o del blocco, o il corpo convenzionale. */
function corpoDi(spec: ReliefSpec, el: HTMLElement | null | undefined, stile?: Partial<StileMaschera>): number {
  if (stile?.dimensione) return stile.dimensione;
  if (el && (spec.kind === 'text' || spec.kind === 'piece')) {
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (Number.isFinite(fs) && fs > 0) return fs;
  }
  return CORPO_DEFAULT_PX;
}

/**
 * Disegna la maschera di un blocco. Asincrona perché può aspettare i font e
 * decodificare svg; con `fontGiaPronti` e senza svg si risolve al microtask.
 *
 * Il canvas copre il blocco più `padCss` per lato (tranne i pezzi, che hanno
 * il bordo della carta come confine e padCss = 0).
 */
export async function disegnaMaschera(opzioni: OpzioniMaschera): Promise<RisultatoMaschera> {
  const { spec } = opzioni;
  const el = opzioni.el ?? null;
  const tecnica = tecnicaGL(spec.tecnica);
  const W = el && el.offsetWidth > 0 ? el.offsetWidth : Math.max(1, opzioni.larghezza);
  const H = el && el.offsetHeight > 0 ? el.offsetHeight : Math.max(1, opzioni.altezza);
  const corpo = corpoDi(spec, el, opzioni.stile);
  const pad = spec.kind === 'piece' ? 0 : margineMaschera(tecnica, corpo);
  const maxLato = opzioni.maxLato ?? 2048;

  const cssW = W + pad * 2;
  const cssH = H + pad * 2;
  let scala = Math.max(0.25, opzioni.scala);
  const lato = Math.max(cssW, cssH) * scala;
  if (lato > maxLato) scala = maxLato / Math.max(cssW, cssH);
  const texW = Math.max(1, Math.ceil(cssW * scala));
  const texH = Math.max(1, Math.ceil(cssH * scala));

  const layers = (spec.kind === 'piece' ? (spec.layers ?? []) : []) as readonly LayerMaschera[];

  // Font: tutte le combinazioni che si useranno, prima di disegnare.
  if (!opzioni.fontGiaPronti) {
    const stili: StileMaschera[] = [];
    let campione = spec.text ?? '';
    if (opzioni.stile) stili.push(completaStile(opzioni.stile));
    else if (el) stili.push(leggiStile(el));
    for (const l of layers) {
      if (l.kind !== 'text') continue;
      campione += l.text ?? '';
      const target = l.selettore && el ? el.querySelector(l.selettore) : null;
      stili.push(target && !l.stile ? leggiStile(target) : completaStile(l.stile, el ? leggiStile(el) : STILE_BASE));
    }
    if (el && campione.length === 0) campione = el.textContent ?? '';
    await caricaFont(stili, campione);
  }

  const canvas = creaCanvas(texW, texH, opzioni.canvas);
  const ctx = canvas.getContext('2d', { alpha: false }) as Ctx2D | null;
  if (!ctx) throw new Error('impronta: canvas 2D non disponibile per la maschera');

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, texW, texH);
  // Da qui in poi si disegna in px CSS locali del blocco (0,0 = angolo del blocco).
  ctx.setTransform(scala, 0, 0, scala, pad * scala, pad * scala);
  ctx.globalCompositeOperation = 'lighter';

  const rot = ((spec.rotazione ?? 0) * Math.PI) / 180;
  const rif: RiferimentoBlocco | null = el ? { el, W, H, rot } : null;
  let appoggio: HTMLCanvasElement | null = null;
  const serveAppoggio = spec.kind === 'svg' || layers.some((l) => l.kind === 'svg');
  if (serveAppoggio) appoggio = creaCanvas(texW, texH, null);

  if (spec.kind === 'text') {
    const colore = coloreCanali(canaliDi(tecnica));
    if (rif && !opzioni.stile) {
      disegnaTestoDom(ctx, rif.el, rif, colore);
    } else {
      const base = el ? leggiStile(el) : STILE_BASE;
      const stile = completaStile(opzioni.stile, base);
      const testo = spec.text ?? el?.textContent ?? '';
      disegnaTestoLayout(ctx, testo, { x: 0, y: 0, w: W, h: H }, stile, colore, 'alto');
    }
  } else if (spec.kind === 'svg') {
    if (spec.svg && appoggio) {
      const colore = coloreCanali(canaliDi(tecnica));
      await disegnaSvg(ctx, appoggio, spec.svg, { x: 0, y: 0, w: W, h: H }, colore, scala, pad);
    }
  } else {
    for (const l of layers) {
      const tl = tecnicaGL(l.tecnica ?? spec.tecnica);
      const colore = coloreCanali(canaliDi(tl, l.profondita ?? 1));
      const box: Riquadro = { x: (l.x / 100) * W, y: (l.y / 100) * H, w: (l.w / 100) * W, h: (l.h / 100) * H };
      if (l.kind === 'linea') {
        disegnaLinea(ctx, box, colore);
      } else if (l.kind === 'svg') {
        if (l.svg && appoggio) await disegnaSvg(ctx, appoggio, l.svg, box, colore, scala, pad);
      } else {
        const target = l.selettore && el ? el.querySelector(l.selettore) : null;
        if (target && rif && !l.stile) {
          disegnaTestoDom(ctx, target, rif, colore);
        } else {
          const base = el ? leggiStile(el) : STILE_BASE;
          const stile = completaStile(l.stile, base);
          const testo = l.text ?? target?.textContent ?? '';
          disegnaTestoLayout(ctx, testo, box, stile, colore, 'centro');
        }
      }
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  return {
    canvas,
    larghezzaTexel: texW,
    altezzaTexel: texH,
    scala,
    padCss: pad,
    // Misura esatta coperta dal canvas (l'arrotondamento al texel va a destra e in basso).
    larghezzaCss: texW / scala,
    altezzaCss: texH / scala,
    raggiTexel: raggiSmusso(tecnica, corpo, scala),
    corpoCss: corpo,
    tecnica,
  };
}
