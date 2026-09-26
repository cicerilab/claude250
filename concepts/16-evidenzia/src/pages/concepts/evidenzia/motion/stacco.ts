/**
 * EVIDENZIA · l'annuncio che si stacca e diventa scheda, e il ritorno.
 * Più il passaggio retino → colore della prima foto e il velo sul foglio.
 *
 * Creative-director 4.3: il rettangolo dell'annuncio si solleva di pochi
 * pixel con un'ombra tinta di carta, ruota di circa 1°, poi si apre nella
 * scheda (circa 420 ms). ux-architect 5.5: sul foglio resta il buco del
 * ritaglio mentre la scheda è aperta.
 *
 * Come funziona (docs/motion-designer.md §5):
 * - la scheda (`aEl`) è già montata nella sua posizione finale quando si
 *   chiama `stacca`: non si scala mai (niente testo deformato), si sposta e
 *   si ritaglia con `clip-path` da "rettangolo dell'annuncio" a "scheda intera";
 * - sopra viaggia un clone dell'annuncio (il ritaglio di carta), fuori dal
 *   foglio, che si solleva, ruota e svanisce mentre la scheda si apre sotto;
 * - l'annuncio vero prende `data-evd-stacco="fuori"` (lo stila Annunci come
 *   ritaglio vuoto) finché `rimetti` non lo riporta a posto.
 *
 * Tutto con WAAPI (compositore per transform e opacity), nessun rAF, nessun
 * accesso al browser a livello di modulo.
 */

import { store } from '../state/store';
import { easingCss } from './easing';
import { COLORE, STACCO, VELO } from './durate';

/** Attributo sull'annuncio del foglio mentre la sua scheda è aperta. */
export const ATTR_STACCO = 'data-evd-stacco';
export const STACCO_FUORI = 'fuori';
/** Attributo sul clone che viaggia (per chi volesse escluderlo da selettori). */
export const ATTR_CLONE = 'data-evd-clone';
/** Attributo sulla foto a colori della scheda: 'attesa' (nascosta dal CSS) | 'pronto'. */
export const ATTR_COLORE = 'data-evd-colore';

export interface OpzioniStacco {
  ridotto?: boolean;
  /** Rotazione del ritaglio in gradi (segno dal seme dell'annuncio). Default +1. */
  rotazione?: number;
  /**
   * Dove appendere il clone: un elemento dentro `.evd-root` e fuori dal foglio
   * scorrevole. Default: il genitore di `aEl`.
   */
  strato?: HTMLElement | null;
}

/* ------------------------------------------------------------------ */
/* Utilità                                                             */
/* ------------------------------------------------------------------ */

function ridottoDa(r: boolean | undefined): boolean {
  return r ?? store.get().reducedMotion;
}

function fine(a: Animation): Promise<void> {
  return a.finished.then(
    () => undefined,
    () => undefined,
  );
}

function inVista(r: DOMRect): boolean {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < w && r.top < h;
}

const PROPRIETA_EREDITATE = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-stretch',
  'font-feature-settings',
  'font-variation-settings',
  'font-optical-sizing',
  'font-kerning',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'color',
  'text-rendering',
  '-webkit-font-smoothing',
] as const;

/**
 * Il ritaglio che viaggia: copia dell'annuncio senza id (niente id doppi),
 * nascosta ai lettori di schermo, inerte, con la tipografia calcolata
 * dell'originale (fuori dal foglio perderebbe ciò che eredita dal foglio).
 */
function creaClone(daEl: HTMLElement, r: DOMRect, strato: HTMLElement): HTMLElement {
  const cs = getComputedStyle(daEl);
  const clone = daEl.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.removeAttribute(ATTR_STACCO);
  clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  clone.querySelectorAll('[data-evdvar]').forEach((n) => n.removeAttribute('data-evdvar'));
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('inert', '');
  clone.setAttribute(ATTR_CLONE, '');
  const s = clone.style;
  for (const p of PROPRIETA_EREDITATE) {
    const v = cs.getPropertyValue(p);
    if (v) s.setProperty(p, v);
  }
  s.position = 'fixed';
  s.left = `${r.left}px`;
  s.top = `${r.top}px`;
  s.width = `${r.width}px`;
  s.height = `${r.height}px`;
  s.margin = '0';
  s.boxSizing = 'border-box';
  s.zIndex = 'var(--evd-z-stacco, 45)';
  s.backgroundColor = 'var(--evd-carta)';
  s.pointerEvents = 'none';
  s.transformOrigin = '50% 50%';
  s.willChange = 'transform, opacity';
  strato.appendChild(clone);
  return clone;
}

interface Geometria {
  dx: number;
  dy: number;
  clipDestra: number;
  clipSotto: number;
  origine: string;
}

/** Dove sta il rettangolo dell'annuncio nelle coordinate della scheda. */
function geometria(r: DOMRect, a: DOMRect, alzata: number): Geometria {
  return {
    dx: r.left - a.left,
    dy: r.top - alzata - a.top,
    clipDestra: Math.max(0, a.width - r.width),
    clipSotto: Math.max(0, a.height - r.height),
    origine: `${Math.round(r.width / 2)}px ${Math.round(r.height / 2)}px`,
  };
}

function kfFinestra(g: Geometria, rot: number, extra?: Keyframe): Keyframe {
  return {
    transform: `translate(${g.dx}px, ${g.dy}px) rotate(${rot}deg)`,
    clipPath: `inset(0px ${g.clipDestra}px ${g.clipSotto}px 0px)`,
    transformOrigin: g.origine,
    ...extra,
  };
}

function kfIntera(g: Geometria, extra?: Keyframe): Keyframe {
  return {
    transform: 'translate(0px, 0px) rotate(0deg)',
    clipPath: 'inset(0px 0px 0px 0px)',
    transformOrigin: g.origine,
    ...extra,
  };
}

/* ------------------------------------------------------------------ */
/* Stato del passaggio in corso                                        */
/* ------------------------------------------------------------------ */

interface Passaggio {
  clone: HTMLElement | null;
  animazioni: Animation[];
}

let passaggio: Passaggio | null = null;
const tenuteScheda = new WeakMap<HTMLElement, Animation>();

/** Chiude di colpo un passaggio ancora in corso (apertura interrotta da chiusura, o viceversa). */
function chiudiPassaggio(): void {
  if (!passaggio) return;
  for (const a of passaggio.animazioni) a.cancel();
  passaggio.clone?.remove();
  passaggio = null;
}

/**
 * Libera la scheda dall'ultima animazione tenuta (per esempio se dopo
 * `rimetti` non viene smontata). Normalmente non serve: la si smonta.
 */
export function liberaScheda(aEl: HTMLElement): void {
  const a = tenuteScheda.get(aEl);
  if (a) {
    a.cancel();
    tenuteScheda.delete(aEl);
  }
}

/* ------------------------------------------------------------------ */
/* Stacca                                                              */
/* ------------------------------------------------------------------ */

/**
 * Annuncio → scheda. Da chiamare in un `useLayoutEffect` della scheda appena
 * montata (prima della prima pittura), con l'annuncio del foglio e il
 * contenitore della scheda già nella sua posizione finale.
 *
 * daEl: l'`<article>` dell'annuncio, o null (arrivo da `#scheda-214`: niente stacco).
 * Risolve quando la scheda è ferma e interamente visibile.
 */
export function stacca(daEl: HTMLElement | null, aEl: HTMLElement, opz?: OpzioniStacco): Promise<void> {
  chiudiPassaggio();
  liberaScheda(aEl);
  const ridotto = ridottoDa(opz?.ridotto);

  if (!daEl) {
    if (ridotto) return Promise.resolve();
    return fine(aEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: STACCO.dissolvenzaRidotta, easing: easingCss('velo') }));
  }

  // Il rettangolo si misura prima di nascondere il contenuto dell'annuncio
  // (il ritaglio vuoto conserva la stessa scatola: richiesta ad Annunci).
  const r = daEl.getBoundingClientRect();

  if (ridotto || !inVista(r)) {
    daEl.setAttribute(ATTR_STACCO, STACCO_FUORI);
    const durata = ridotto ? STACCO.dissolvenzaRidotta : STACCO.dissolvenzaFuoriVista;
    return fine(aEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: durata, easing: easingCss('velo') }));
  }

  // Il clone si fa dall'annuncio intero, poi l'originale diventa il buco.
  const strato = opz?.strato ?? aEl.parentElement ?? document.body;
  const clone = creaClone(daEl, r, strato);
  daEl.setAttribute(ATTR_STACCO, STACCO_FUORI);

  const a = aEl.getBoundingClientRect();
  const rot = opz?.rotazione ?? STACCO.rotazioneGradi;
  const g = geometria(r, a, STACCO.sollevaPx);

  const solleva = clone.animate(
    [
      { transform: 'translate(0px, 0px) rotate(0deg)', boxShadow: 'none' },
      {
        transform: `translate(0px, ${-STACCO.sollevaPx}px) rotate(${rot}deg)`,
        boxShadow: 'var(--evd-ombra-stacco, none)',
      },
    ],
    { duration: STACCO.solleva, easing: easingCss('solleva'), fill: 'forwards' },
  );

  const viaggio = clone.animate(
    [
      { transform: `translate(0px, ${-STACCO.sollevaPx}px) rotate(${rot}deg)` },
      { transform: `translate(${a.left - r.left}px, ${a.top - r.top}px) rotate(0deg)` },
    ],
    { duration: STACCO.apre, delay: STACCO.solleva, easing: easingCss('apre'), fill: 'forwards' },
  );

  const svanisce = clone.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: Math.round(STACCO.apre * STACCO.cloneSvanisce),
    delay: STACCO.solleva,
    easing: easingCss('velo'),
    fill: 'forwards',
  });

  const apre = aEl.animate([kfFinestra(g, rot), kfIntera(g)], {
    duration: STACCO.apre,
    delay: STACCO.solleva,
    easing: easingCss('apre'),
    fill: 'backwards',
  });

  const questo: Passaggio = { clone, animazioni: [solleva, viaggio, svanisce, apre] };
  passaggio = questo;

  return fine(apre).then(() => {
    if (passaggio !== questo) return;
    for (const an of questo.animazioni) an.cancel();
    clone.remove();
    passaggio = null;
  });
}

/* ------------------------------------------------------------------ */
/* Rimetti                                                             */
/* ------------------------------------------------------------------ */

/**
 * Scheda → annuncio. Da chiamare PRIMA di smontare la scheda: si smonta
 * quando la promessa risolve (la scheda resta nascosta dall'animazione
 * tenuta fino ad allora). Alla fine l'annuncio perde `data-evd-stacco` e
 * torna visibile; il fuoco sul suo titolo lo rimette chi chiude.
 */
export function rimetti(daEl: HTMLElement | null, aEl: HTMLElement, opz?: OpzioniStacco): Promise<void> {
  chiudiPassaggio();
  liberaScheda(aEl);
  const ridotto = ridottoDa(opz?.ridotto);

  const sparisci = (durata: number): Promise<void> => {
    const an = aEl.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: durata,
      easing: easingCss('velo'),
      fill: 'forwards',
    });
    tenuteScheda.set(aEl, an);
    return fine(an).then(() => {
      daEl?.removeAttribute(ATTR_STACCO);
    });
  };

  if (!daEl) return ridotto ? Promise.resolve() : sparisci(STACCO.dissolvenzaRidotta);

  const r = daEl.getBoundingClientRect();
  if (ridotto) return sparisci(STACCO.dissolvenzaRidotta);
  if (!inVista(r)) return sparisci(STACCO.dissolvenzaFuoriVista);

  const a = aEl.getBoundingClientRect();
  const rot = opz?.rotazione ?? STACCO.rotazioneGradi;
  const g = geometria(r, a, STACCO.sollevaPx);
  const totale = STACCO.chiude + STACCO.posa;
  const o = STACCO.chiude / totale;

  // La scheda si richiude nel rettangolo dell'annuncio, poi sparisce sotto il ritaglio.
  const chiude = aEl.animate(
    [
      kfIntera(g, { opacity: 1, offset: 0, easing: easingCss('chiude') }),
      kfFinestra(g, rot, { opacity: 1, offset: o }),
      kfFinestra(g, rot, { opacity: 0, offset: Math.min(1, o + 0.001) }),
      kfFinestra(g, rot, { opacity: 0, offset: 1 }),
    ],
    { duration: totale, easing: 'linear', fill: 'forwards' },
  );
  tenuteScheda.set(aEl, chiude);

  // Il clone parte dalla posizione della scheda, invisibile, e ricompare mentre arriva.
  daEl.removeAttribute(ATTR_STACCO);
  const strato = opz?.strato ?? aEl.parentElement ?? document.body;
  const clone = creaClone(daEl, r, strato);
  daEl.setAttribute(ATTR_STACCO, STACCO_FUORI);

  const arriva = clone.animate(
    [
      {
        transform: `translate(${a.left - r.left}px, ${a.top - r.top}px) rotate(0deg)`,
        boxShadow: 'var(--evd-ombra-stacco, none)',
        offset: 0,
        easing: easingCss('chiude'),
      },
      {
        transform: `translate(0px, ${-STACCO.sollevaPx}px) rotate(${rot}deg)`,
        boxShadow: 'var(--evd-ombra-stacco, none)',
        offset: o,
        easing: easingCss('posa'),
      },
      { transform: 'translate(0px, 0px) rotate(0deg)', boxShadow: 'none', offset: 1 },
    ],
    { duration: totale, easing: 'linear', fill: 'forwards' },
  );

  const ricompare = clone.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: Math.round(STACCO.chiude * STACCO.cloneRicompare),
    delay: Math.round(STACCO.chiude * (1 - STACCO.cloneRicompare)),
    easing: easingCss('velo'),
    fill: 'both',
  });

  const questo: Passaggio = { clone, animazioni: [arriva, ricompare] };
  passaggio = questo;

  return fine(arriva).then(() => {
    // Nello stesso compito: l'annuncio vero riappare e il clone sparisce.
    daEl.removeAttribute(ATTR_STACCO);
    if (passaggio === questo) {
      for (const an of questo.animazioni) an.cancel();
      passaggio = null;
    }
    clone.remove();
  });
}

/* ------------------------------------------------------------------ */
/* Retino → colore                                                     */
/* ------------------------------------------------------------------ */

export interface OpzioniColore {
  ridotto?: boolean;
  /** Attesa minima in ms prima dello sviluppo. Default `COLORE.dopoApertura`. */
  ritardo?: number;
}

function caricata(img: HTMLImageElement): Promise<boolean> {
  if (img.complete) return Promise.resolve(img.naturalWidth > 0);
  return new Promise<boolean>((ok) => {
    const fatto = (esito: boolean): void => {
      img.removeEventListener('load', siCarica);
      img.removeEventListener('error', errore);
      ok(esito);
    };
    const siCarica = (): void => fatto(true);
    const errore = (): void => fatto(false);
    img.addEventListener('load', siCarica);
    img.addEventListener('error', errore);
  });
}

/**
 * La prima foto della scheda passa dal retino (già in cache dal foglio) al
 * colore, come una stampa che si sviluppa: 520 ms, solo opacità della foto a
 * colori sopra quella a retino. Aspetta che la foto a colori sia caricata e
 * decodificata; finché non lo è resta il retino (nessuno scheletro).
 *
 * `imgColore` parte con `data-evd-colore="attesa"` (il CSS della scheda la
 * tiene a opacità 0) e finisce con `"pronto"`. Risolve true se il colore è
 * arrivato, false se la foto non si carica (resta l'attributo 'attesa': la
 * scheda la toglie dalla striscia).
 * `imgRetino` può essere null (la foto non era sul foglio): stesso effetto
 * sopra il fondo carta.
 */
export async function retinoAColore(
  imgRetino: HTMLImageElement | null,
  imgColore: HTMLImageElement,
  opz?: OpzioniColore,
): Promise<boolean> {
  void imgRetino;
  if (!imgColore.hasAttribute(ATTR_COLORE)) imgColore.setAttribute(ATTR_COLORE, 'attesa');
  const ok = await caricata(imgColore);
  if (!ok) return false;
  try {
    await imgColore.decode();
  } catch {
    if (imgColore.naturalWidth === 0) return false;
  }
  if (!imgColore.isConnected) return false;
  if (ridottoDa(opz?.ridotto)) {
    imgColore.setAttribute(ATTR_COLORE, 'pronto');
    return true;
  }
  const an = imgColore.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: COLORE.sviluppo,
    delay: Math.max(0, opz?.ritardo ?? COLORE.dopoApertura),
    easing: easingCss('sviluppo'),
    fill: 'both',
  });
  await fine(an);
  if (!imgColore.isConnected) return true;
  imgColore.setAttribute(ATTR_COLORE, 'pronto');
  an.cancel();
  return true;
}

/* ------------------------------------------------------------------ */
/* Velo                                                                */
/* ------------------------------------------------------------------ */

let ultimoCambioVelo = -Infinity;

function opacitaCss(el: HTMLElement): number {
  const n = Number.parseFloat(getComputedStyle(el).opacity);
  return Number.isFinite(n) ? n : 1;
}

/**
 * Il velo sul foglio (oscuramento del 30%, deciso dal CSS dell'art-director)
 * compare in 200 ms, una volta per apertura. Il velo è già montato con la sua
 * opacità finale nel CSS; qui si anima solo l'entrata.
 */
export function mostraVelo(el: HTMLElement, opz?: { ridotto?: boolean }): Animation | null {
  ultimoCambioVelo = performance.now();
  if (ridottoDa(opz?.ridotto)) return null;
  const finale = opacitaCss(el);
  const an = el.animate([{ opacity: 0 }, { opacity: finale }], {
    duration: VELO.entra,
    easing: easingCss('velo'),
    fill: 'backwards',
  });
  return an;
}

/**
 * Il velo se ne va (200 ms). Se è comparso da meno di 500 ms l'uscita si
 * allunga: mai due cambi di luminosità del foglio in meno di mezzo secondo.
 * Risolve quando è trasparente: allora lo si smonta.
 */
export function nascondiVelo(el: HTMLElement, opz?: { ridotto?: boolean }): Promise<void> {
  const ora = performance.now();
  const trascorso = ora - ultimoCambioVelo;
  ultimoCambioVelo = ora;
  if (ridottoDa(opz?.ridotto)) return Promise.resolve();
  const durata = Math.max(VELO.esce, VELO.intervalloMinimo - trascorso);
  const an = el.animate([{ opacity: opacitaCss(el) }, { opacity: 0 }], {
    duration: durata,
    easing: easingCss('velo'),
    fill: 'forwards',
  });
  return fine(an);
}
