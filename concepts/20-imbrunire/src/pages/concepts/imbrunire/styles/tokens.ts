/* ==========================================================================
   IMBRUNIRE · token per JavaScript (art-director)
   --------------------------------------------------------------------------
   Gli stessi valori di tokens.css, per chi misura o calcola in TS (lune del
   nastro, geometria del palazzo, scatole 3D, caricamento dei font).
   Modulo puro: nessun accesso a window, document o matchMedia (prerender).
   Se cambi un valore qui, cambialo anche in tokens.css (e viceversa).
   ========================================================================== */

/* --------------------------------------------------------------------------
   Colori
   -------------------------------------------------------------------------- */
export const COLORI = {
  notte: '#1F2638',
  notteProfonda: '#171C2A',
  cieloBasso: '#262E44',
  pietra: '#2B3247',
  intonaco: '#BE7359',
  intonacoLuce: '#D08A6E',
  intonacoOmbra: '#9C5A45',
  poche: '#8A4A38',
  pocheScuro: '#5E2F23',
  inciso: '#4E261C',
  soffitto: '#D7B59A',
  trave: '#4B2F24',
  pavimentoBase: '#7A5540',
  luna: '#F2E8D0',
  lunaVelata: '#E6D7BC',
  lunaSpenta: '#9AA0B4',
  luce: '#F2C77C',
} as const;

export type NomeColore = keyof typeof COLORI;

/* --------------------------------------------------------------------------
   Font
   -------------------------------------------------------------------------- */
/** URL del foglio Google Fonts (lo inietta core/fonts.ts). Solo latin, nessun corsivo. */
export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Commissioner:wght@400..600&family=Marcellus&display=swap';

/** Descrittori per document.fonts.load() prima di dire "font pronti". */
export const FONT_DA_CARICARE: readonly string[] = [
  '400 16px "Commissioner"',
  '600 16px "Commissioner"',
  '400 16px "Marcellus"',
];

export const FAMIGLIE = {
  display: '"Marcellus", "Imbrunire Marcellus Ripiego", "Times New Roman", Georgia, serif',
  testo: '"Commissioner", "Imbrunire Commissioner Ripiego", Arial, "Helvetica Neue", sans-serif',
} as const;

/* --------------------------------------------------------------------------
   Soglie (le stesse media query scritte letterali nei CSS)
   -------------------------------------------------------------------------- */
/** Sezione se larghezza ≥ 720 e altezza ≥ 560, altrimenti torre (tech-architect §5.1). */
export const SOGLIA_SEZIONE = { larghezza: 720, altezza: 560 } as const;
export const MQ_SEZIONE = '(min-width: 720px) and (min-height: 560px)';
/** Sezione su schermo basso: nastro compatto. */
export const MQ_SEZIONE_BASSA = '(min-width: 720px) and (min-height: 560px) and (max-height: 820px)';
/** Schermi grandi: palazzo fino a 1400 px e testi più grandi. */
export const MQ_GRANDE = '(min-width: 1920px) and (min-height: 1000px)';
/** Sotto questa larghezza il ConceptBackButton passa in basso a sinistra. */
export const SOGLIA_BACK_BUTTON = 640;

export type LayoutToken = 'sezione' | 'torre';
export type Misura = 'normale' | 'bassa' | 'grande';

/** Quale variante di misure vale per una finestra (puro: riceve le misure). */
export function misuraPer(larghezza: number, altezza: number): Misura {
  if (larghezza >= 1920 && altezza >= 1000) return 'grande';
  if (larghezza >= SOGLIA_SEZIONE.larghezza && altezza >= SOGLIA_SEZIONE.altezza && altezza <= 820) return 'bassa';
  return 'normale';
}

/* --------------------------------------------------------------------------
   Lune (useSelezioneLune usa `passo`, il nastro e il cielo `d`)
   -------------------------------------------------------------------------- */
export interface MisureLune {
  /** diametro del disco sul nastro, px */
  d: number;
  /** distanza tra i centri di due lune sul nastro, px (= larghezza di un'opzione) */
  passo: number;
  /** luna di stasera nel cielo */
  cielo: number;
  /** luna della prima notte al successo */
  successo: number;
}

export const LUNE: Record<'sezione' | 'sezioneBassa' | 'sezioneGrande' | 'torre', MisureLune> = {
  sezione: { d: 34, passo: 44, cielo: 48, successo: 96 },
  sezioneBassa: { d: 28, passo: 38, cielo: 48, successo: 96 },
  sezioneGrande: { d: 38, passo: 50, cielo: 64, successo: 96 },
  torre: { d: 40, passo: 48, cielo: 40, successo: 72 },
};

/** Margine attorno al disco nell'SVG della luna (anello a r+4, alone): R = r + 6. */
export const LUNA_MARGINE_SVG = 6;
export const LUNA_BOTTONE = 24;
export const LUNA_OMBRA_OPACITA = 0.22;

export function misureLune(layout: LayoutToken, larghezza: number, altezza: number): MisureLune {
  if (layout === 'torre') return LUNE.torre;
  const m = misuraPer(larghezza, altezza);
  if (m === 'grande') return LUNE.sezioneGrande;
  if (m === 'bassa') return LUNE.sezioneBassa;
  return LUNE.sezione;
}

/* --------------------------------------------------------------------------
   Livelli
   -------------------------------------------------------------------------- */
export const Z = {
  cielo: 0,
  palazzo: 1,
  testata: 20,
  nastro: 25,
  dentro: 30,
  pannello: 35,
  foglio: 40,
  successo: 45,
} as const;

/* --------------------------------------------------------------------------
   Il palazzo (sezione). Geometria verificata a schermo a 1366, 1440, 768,
   2560: vedi docs/art-director.md §1.3.
   -------------------------------------------------------------------------- */
export const PALAZZO = {
  /** u = larghezza / MODULO: altezza di riferimento di un piano */
  modulo: 7.2,
  /** altezze delle scatole in u */
  altezze: { sottotetto: 0.95, nobile: 1.2, terra: 1 },
  /** muretto d'imposta del tetto, frazione dell'altezza del sottotetto */
  ginocchio: 0.45,
  /** pendenza delle falde (coppi veneti, ~18°) */
  pendenza: 0.33,
  /** sporto delle falde oltre i muri, × muro */
  gronda: 1.4,
  /** coefficiente altezza/larghezza (vedi geometriaPalazzo) */
  k: 0.53,
  max: 1180,
  maxAlto: 1400,
  min: 540,
  /** frazione della larghezza della finestra: 0,82 da 1024, 0,92 sotto */
  vw: 0.82,
  vwTablet: 0.92,
  /** spazio sopra il palazzo (testata + nastro + riga di stato) */
  sopra: { normale: 222, bassa: 188, grande: 222 },
  marciapiede: 36,
  /** fascia del nome (il solaio) in sezione */
  fascia: { normale: 46, bassa: 40, grande: 46 },
  /** torre */
  torre: { muro: 16, solaio: 20, zoccolo: 32, cellaRapporto: 0.56, camino: 0.64, soffitta: 0.5, cellaMaxSvh: 70 },
} as const;

/** clamp(min, v, max) */
function tra(min: number, v: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Spessori del poché in sezione per una larghezza di finestra (come tokens.css). */
export function spessori(larghezzaFinestra: number): { muro: number; solaio: number; manto: number; zoccolo: number } {
  const vw = larghezzaFinestra / 100;
  return {
    muro: tra(14, 1.25 * vw, 24),
    solaio: tra(18, 1.55 * vw, 28),
    manto: tra(14, 1.5 * vw, 26),
    zoccolo: tra(30, 2.4 * vw, 40),
  };
}

export interface GeometriaPalazzo {
  /** larghezza del palazzo */
  w: number;
  u: number;
  /** altezze delle scatole (senza fascia) */
  hSottotetto: number;
  hNobile: number;
  hTerra: number;
  /** altezza del muretto d'imposta sopra il pavimento del sottotetto */
  ginocchio: number;
  /** dal colmo (esterno) al pavimento del sottotetto */
  colmo: number;
  /** altezza totale dal colmo alla base dello zoccolo */
  altezza: number;
}

/**
 * Geometria verticale del palazzo in sezione.
 * altezza = colmo + 3 fasce + hNobile + hTerra + zoccolo
 * colmo   = ginocchio·hSottotetto + pendenza·w/2 + manto
 * ⇒ altezza = k·w + (3·fascia + manto + zoccolo), con
 *   k = (ginocchio·0,95 + 1,2 + 1)/7,2 + pendenza/2 ≈ 0,53
 * (il sottotetto sta DENTRO il triangolo del tetto: le falde tagliano Il Noce
 * a sinistra e la scala a destra, come chiede l'ux-architect).
 */
export function geometriaPalazzo(w: number, fascia: number, manto: number, zoccolo: number): GeometriaPalazzo {
  const u = w / PALAZZO.modulo;
  const hSottotetto = PALAZZO.altezze.sottotetto * u;
  const hNobile = PALAZZO.altezze.nobile * u;
  const hTerra = PALAZZO.altezze.terra * u;
  const ginocchio = PALAZZO.ginocchio * hSottotetto;
  const colmo = ginocchio + (PALAZZO.pendenza * w) / 2 + manto;
  const altezza = colmo + 3 * fascia + hNobile + hTerra + zoccolo;
  return { w, u, hSottotetto, hNobile, hTerra, ginocchio, colmo, altezza };
}

/** Larghezza del palazzo in sezione per una finestra (stessa formula di --imb-palazzo-w). */
export function larghezzaPalazzo(larghezzaFinestra: number, altezzaFinestra: number): number {
  const m = misuraPer(larghezzaFinestra, altezzaFinestra);
  const s = spessori(larghezzaFinestra);
  const max = m === 'grande' ? PALAZZO.maxAlto : PALAZZO.max;
  const quotaVw = larghezzaFinestra < 1024 ? PALAZZO.vwTablet : PALAZZO.vw;
  const fissi = 3 * PALAZZO.fascia[m] + s.manto + s.zoccolo;
  const perAltezza = (altezzaFinestra - PALAZZO.sopra[m] - PALAZZO.marciapiede - fissi) / PALAZZO.k;
  return Math.max(PALAZZO.min, Math.min(max, quotaVw * larghezzaFinestra, perAltezza));
}

/* --------------------------------------------------------------------------
   Scatola di una stanza (CSS 3D)
   -------------------------------------------------------------------------- */
export const SCATOLA = {
  sezione: { prospettiva: 1.05, profondita: 0.7, occhioY: 0.42 },
  torre: { prospettiva: 1.25, profondita: 0.7, occhioY: 0.4 },
  /** strato Dentro: prospettiva × altezza della finestra */
  dentro: { prospettiva: 3, profondita: 0.7, occhioY: 0.42 },
} as const;

export interface MisureScatola {
  /** valore per `perspective`, px */
  prospettiva: number;
  /** translateZ negativo della parete di fondo e lato di pavimento/soffitto/pareti, px */
  profondita: number;
  /** `perspective-origin` verticale, frazione 0..1 dall'alto */
  occhioY: number;
  /** scala apparente della parete di fondo vista dal fronte (0..1) */
  scalaFondo: number;
}

/**
 * Misure della scatola per una cella alta `h` px (o per lo strato Dentro,
 * con h = altezza della finestra). La prospettiva è proporzionale
 * all'altezza: così la foto di fondo occupa ~59% della cella in ogni piano
 * (~55% in torre) e ~81% dentro.
 */
export function misureScatola(modo: 'sezione' | 'torre' | 'dentro', h: number): MisureScatola {
  const s = SCATOLA[modo];
  const prospettiva = s.prospettiva * h;
  const profondita = s.profondita * h;
  return { prospettiva, profondita, occhioY: s.occhioY, scalaFondo: prospettiva / (prospettiva + profondita) };
}

/* --------------------------------------------------------------------------
   Luci (opacità dei veli; le durate sono del motion-designer)
   -------------------------------------------------------------------------- */
export const VELI = {
  spentaOpacita: 0.64,
  desaturaOpacita: 0.4,
  /** calore al passaggio del puntatore: +8% sul velo luce */
  calore: 0.08,
} as const;

/* --------------------------------------------------------------------------
   Misure dell'interfaccia usate anche in JS
   -------------------------------------------------------------------------- */
export const UI = {
  tocco: 44,
  pannello: 360,
  testata: { normale: 64, bassa: 56, torre: 56 },
  riservaBack: { sezione: { w: 244, h: 58 }, torre: { w: 224, h: 58 } },
  riservaFondo: 72,
  finestra: { w: 52, h: 44, spazio: 6, muro: 8 },
  bottone: 48,
  bottonePrimario: 52,
} as const;
