/*
 * NOVANTA · dial/geometria.ts (vector-artist)
 * --------------------------------------------------------------------------
 * Unica fonte della matematica polare del concept: quadrante, mini archi,
 * indice dell'anello, interazione, movimento e anello della settimana usano
 * queste funzioni. Nessun accesso al DOM, nessuno stato: solo numeri e
 * stringhe di path. Dettagli e figure in docs/vector-artist.md.
 *
 * Convenzione dei gradi del goniometro (g, 0..180), coordinate schermo/SVG
 * con y verso il basso:
 *   - 'bordo' (desktop): perno sul bordo sinistro; 0 = giù, 90 = destra,
 *     180 = su (flessione della spalla);
 *   - 'fondo' (mobile): perno al centro in basso; 0 = sinistra, 90 = su,
 *     180 = destra.
 * Convenzione "oraria" (anello della settimana): a in gradi, 0 = ore 12,
 * crescente in senso orario, 0..360.
 */

export type Geometria = 'bordo' | 'fondo';

export const ANGOLI = [0, 30, 60, 90, 120, 150, 180] as const;
export type Angolo = (typeof ANGOLI)[number];

/** Distanza tra due angoli di contenuto. */
export const PASSO_ANGOLI = 30;
/** Metà del passo: il contenuto cambia quando il braccio supera questa distanza. */
export const META_PASSO = PASSO_ANGOLI / 2;

const RAD = Math.PI / 180;

/* ------------------------------------------------------------------------ */
/* Numeri e formattazione                                                    */
/* ------------------------------------------------------------------------ */

/** Numero per un attributo `d`: due decimali, niente "-0", niente esponenti. */
export function n2(v: number): string {
  const r = Math.round(v * 100) / 100;
  return r === 0 ? '0' : String(r);
}

/** Vero se il numero è uno degli angoli di contenuto. */
export function eAngolo(v: number): v is Angolo {
  return (ANGOLI as readonly number[]).includes(v);
}

/* ------------------------------------------------------------------------ */
/* Gradi del goniometro                                                      */
/* ------------------------------------------------------------------------ */

/** Direzione unitaria del braccio a g gradi, nella geometria data. */
export function versore(g: number, geo: Geometria): { x: number; y: number } {
  const a = g * RAD;
  const x = geo === 'bordo' ? Math.sin(a) : -Math.cos(a);
  const y = geo === 'bordo' ? Math.cos(a) : -Math.sin(a);
  return { x: Math.abs(x) < 1e-12 ? 0 : x, y: Math.abs(y) < 1e-12 ? 0 : y };
}

/** Punto a distanza r dal perno (cx, cy), a g gradi. */
export function polare(cx: number, cy: number, r: number, g: number, geo: Geometria): { x: number; y: number } {
  const v = versore(g, geo);
  return { x: cx + r * v.x, y: cy + r * v.y };
}

/**
 * Gradi del goniometro del punto (px, py) visto dal perno (cx, cy).
 * NON limitato: il risultato sta in [-90, 270). La discontinuità è "dietro"
 * il goniometro (a sinistra del bordo in 'bordo', sotto il diametro in
 * 'fondo'), cioè lontana da 0..180: così un punto appena oltre lo 0 dà un
 * numero negativo piccolo e uno appena oltre il 180 un numero poco sopra 180,
 * e `limita()` li porta all'estremo giusto.
 * Sul perno esatto (distanza < 0,5) restituisce NaN: chi chiama lo ignora
 * (`Number.isFinite`).
 */
export function gradiDaPunto(px: number, py: number, cx: number, cy: number, geo: Geometria): number {
  const dx = px - cx;
  const dy = py - cy;
  if (dx * dx + dy * dy < 0.25) return Number.NaN;
  let g = geo === 'bordo' ? Math.atan2(dx, dy) / RAD : Math.atan2(-dy, -dx) / RAD;
  if (g < -90) g += 360;
  return g;
}

/** Limita g all'intervallo [min, max] (default 0..180). NaN resta NaN. */
export function limita(g: number, min = 0, max = 180): number {
  if (Number.isNaN(g)) return g;
  return g < min ? min : g > max ? max : g;
}

/** Angolo di contenuto più vicino a g (g limitato a 0..180). */
export function angoloPiuVicino(g: number): Angolo {
  const v = limita(Number.isFinite(g) ? g : 0);
  const i = Math.round(v / PASSO_ANGOLI);
  return ANGOLI[Math.min(ANGOLI.length - 1, Math.max(0, i))] ?? 0;
}

/**
 * L'angolo di contenuto da mettere nello store: cambia a metà strada (±15°).
 * Con `attuale` si aggiunge un'isteresi di `isteresi` gradi (default 2): un
 * braccio fermo proprio a 15° non fa lampeggiare il contenuto tra due angoli.
 */
export function angoloDiContenuto(g: number, attuale?: Angolo, isteresi = 2): Angolo {
  if (attuale !== undefined && Number.isFinite(g) && Math.abs(limita(g) - attuale) < META_PASSO + isteresi) {
    return attuale;
  }
  return angoloPiuVicino(g);
}

/** Angolo di contenuto successivo (verso = 1) o precedente (verso = -1), fermo agli estremi. */
export function angoloVicino(a: Angolo, verso: 1 | -1): Angolo {
  const i = ANGOLI.indexOf(a) + verso;
  return ANGOLI[Math.min(ANGOLI.length - 1, Math.max(0, i))] ?? a;
}

/** Rotazione CSS (gradi, senso orario positivo) che porta un braccio disegnato a 0 fino a g. bordo: -g; fondo: +g. */
export function rotazioneCss(g: number, geo: Geometria): number {
  return geo === 'bordo' ? -g : g;
}

/* ------------------------------------------------------------------------ */
/* Path                                                                      */
/* ------------------------------------------------------------------------ */

/** sweep-flag SVG per andare da g0 a g1 (g crescente: antiorario in 'bordo', orario in 'fondo'). */
function sweep(g0: number, g1: number, geo: Geometria): 0 | 1 {
  const crescente = g1 >= g0;
  const orarioSeCrescente = geo === 'fondo';
  return crescente === orarioSeCrescente ? 1 : 0;
}

/** Solo il comando "A" (senza M) da g0 a g1 sul cerchio di raggio r. Oltre 359,99° si spezza in due. */
function segmentoArco(cx: number, cy: number, r: number, g0: number, g1: number, geo: Geometria): string {
  const d = g1 - g0;
  if (Math.abs(d) >= 359.99) {
    const m = g0 + d / 2;
    return `${segmentoArco(cx, cy, r, g0, m, geo)} ${segmentoArco(cx, cy, r, m, g1, geo)}`;
  }
  const p1 = polare(cx, cy, r, g1, geo);
  const grande = Math.abs(d) > 180 ? 1 : 0;
  return `A${n2(r)} ${n2(r)} 0 ${grande} ${sweep(g0, g1, geo)} ${n2(p1.x)} ${n2(p1.y)}`;
}

/** Arco aperto da g0 a g1 (qualunque verso). g0 = g1 dà un solo "M". */
export function arcoPath(cx: number, cy: number, r: number, g0: number, g1: number, geo: Geometria): string {
  const p0 = polare(cx, cy, r, g0, geo);
  const m = `M${n2(p0.x)} ${n2(p0.y)}`;
  if (g0 === g1 || r <= 0) return m;
  return `${m} ${segmentoArco(cx, cy, r, g0, g1, geo)}`;
}

/**
 * Spicchio pieno (perno, arco da g0 a g1, chiusura). g0 = g1 dà una forma di
 * area nulla, che usata come clipPath nasconde tutto (corretto: nulla percorso).
 */
export function spicchioPath(cx: number, cy: number, r: number, g0: number, g1: number, geo: Geometria): string {
  if (g0 === g1 || r <= 0) return `M${n2(cx)} ${n2(cy)}Z`;
  const p0 = polare(cx, cy, r, g0, geo);
  return `M${n2(cx)} ${n2(cy)} L${n2(p0.x)} ${n2(p0.y)} ${segmentoArco(cx, cy, r, g0, g1, geo)} Z`;
}

/**
 * Forma della clipPath dello strato "percorso" del quadrante quando il braccio
 * è a g: uno spicchio da -2° a g + 0,4°, di raggio r + 4. Il margine sotto lo
 * zero accende per intero la tacca dello 0 (che corre lungo il diametro); il
 * +0,4° accende per intero la tacca del grado appena raggiunto e nessun pezzo
 * di quella dopo (a 1 grado di distanza). È la funzione da chiamare nel ticker
 * (fase 'write') al posto di `spicchioPath(…, 0, deg, geo)`.
 */
export function percorsoPath(cx: number, cy: number, r: number, g: number, geo: Geometria): string {
  const v = limita(Number.isFinite(g) ? g : 0);
  return spicchioPath(cx, cy, r + 4, -2, v + 0.4, geo);
}

/* ------------------------------------------------------------------------ */
/* Tacche                                                                    */
/* ------------------------------------------------------------------------ */

export interface Tacca {
  g: number;
  tipo: 'corta' | 'media' | 'lunga';
  numero: boolean;
}

/**
 * Tacche da `da` ad `a` compresi, ogni `passo` gradi (default 0..180, 1°):
 * lunga sui multipli di 10, media sui multipli di 5, corta altrove; `numero`
 * sui multipli di 30. Calcolate per indice intero: nessun errore che si somma.
 */
export function tacche(da = 0, a = 180, passo = 1): Tacca[] {
  const out: Tacca[] = [];
  if (passo <= 0 || a < da) return out;
  const n = Math.round((a - da) / passo);
  for (let i = 0; i <= n; i++) {
    const g = Math.round((da + i * passo) * 1000) / 1000;
    const gi = Math.round(g);
    const intero = Math.abs(g - gi) < 1e-6;
    const tipo: Tacca['tipo'] = intero && gi % 10 === 0 ? 'lunga' : intero && gi % 5 === 0 ? 'media' : 'corta';
    out.push({ g, tipo, numero: intero && gi % 30 === 0 });
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* Misure dello strumento                                                    */
/* ------------------------------------------------------------------------ */

export type VarianteArco = 'quadrante' | 'mini' | 'indice';

export interface MisureArco {
  /** spessore del lato dritto del goniometro, dietro il diametro (0 = nessuno) */
  base: number;
  /** quanto il braccio va oltre l'arco (fino al centro della manopola) */
  sporgenza: number;
  spessoreBraccio: number;
  /** diametro disegnato della manopola */
  manopola: number;
  /** diametro dell'area toccabile della manopola (0 = non si tocca) */
  manopolaTocco: number;
  /** diametro della finestrella tonda (lente) sul braccio; 0 = nessuna */
  lente: number;
  /** distanza dal perno del centro della lente e dei numeri della scala */
  distanzaLente: number;
  /** diametro del rivetto del perno e spessore del suo anello gesso */
  perno: number;
  pernoAnello: number;
  /** lunghezza delle tacche e loro rientro dal bordo del disco */
  tacca: { corta: number; media: number; lunga: number; rientro: number };
  /** passo delle tacche disegnate (1 sul quadrante, 10 sui mini archi) */
  passo: number;
  /** corpo dei numeri della scala (0 = niente numeri) */
  corpoNumeri: number;
  /** portata: distanza massima dal perno di qualunque cosa disegnata o toccabile */
  portata: number;
}

/** Margine dal bordo sinistro dello schermo in cui iOS e Android fanno partire il gesto "indietro". */
export const MARGINE_GESTO = 20;

/**
 * Misure in unità del viewBox. Per il quadrante 1 unità = 1 px: le misure
 * fisse coincidono con i token di `styles/tokens.css` (§4 di tokens: tacche,
 * braccio, manopola, perno, finestrella), mentre base, lente e numeri sono
 * decisi qui. I mini archi e l'indice sono proporzionali al raggio.
 */
export function misureArco(variante: VarianteArco, geo: Geometria, raggio: number): MisureArco {
  const r = Math.max(8, raggio);
  if (variante === 'quadrante') {
    const bordo = geo === 'bordo';
    const tacca = bordo
      ? { corta: 10, media: 16, lunga: 26, rientro: 3 }
      : { corta: 7, media: 11, lunga: 18, rientro: 3 };
    const corpoNumeri = bordo ? 14 : 12;
    const lente = bordo ? 30 : 26;
    const sporgenza = bordo ? 40 : 0;
    const manopola = bordo ? 28 : 26;
    const manopolaTocco = 48;
    const distanzaLente = r - tacca.rientro - tacca.lunga - 6 - lente / 2;
    return {
      base: bordo ? 24 : 12,
      sporgenza,
      spessoreBraccio: bordo ? 10 : 8,
      manopola,
      manopolaTocco,
      lente,
      distanzaLente,
      perno: bordo ? 20 : 16,
      pernoAnello: bordo ? 3.5 : 3,
      tacca,
      passo: 1,
      corpoNumeri,
      portata: r + sporgenza + manopolaTocco / 2,
    };
  }
  if (variante === 'mini') {
    const tacca = { corta: 0, media: r * 0.1, lunga: r * 0.18, rientro: r * 0.035 };
    const sporgenza = r * 0.14;
    const manopola = r * 0.17;
    return {
      base: r * 0.09,
      sporgenza,
      spessoreBraccio: Math.max(2, r * 0.065),
      manopola,
      manopolaTocco: 0,
      lente: 0,
      distanzaLente: 0,
      perno: r * 0.13,
      pernoAnello: r * 0.025,
      tacca,
      passo: 10,
      corpoNumeri: 0,
      // spazio per l'arco "ancora da fare" del confronto, appena fuori dal disco
      portata: Math.max(r + sporgenza + manopola / 2, r * 1.12) + 2,
    };
  }
  // indice: testina di lettura sopra l'anello, braccio lungo che entra nell'anello
  const tacca = { corta: 0, media: r * 0.12, lunga: r * 0.2, rientro: r * 0.04 };
  const sporgenza = r * 0.55;
  return {
    base: r * 0.14,
    sporgenza,
    spessoreBraccio: Math.max(3, r * 0.1),
    manopola: r * 0.22,
    manopolaTocco: 0,
    lente: 0,
    distanzaLente: 0,
    perno: r * 0.2,
    pernoAnello: r * 0.04,
    tacca,
    passo: 10,
    corpoNumeri: 0,
    portata: r + sporgenza + r * 0.11 + 1,
  };
}

export interface ImpaginazioneArco {
  variante: VarianteArco;
  geo: Geometria;
  raggio: number;
  misure: MisureArco;
  /** perno in unità del viewBox */
  cx: number;
  cy: number;
  larghezza: number;
  altezza: number;
  viewBox: string;
  /** `transform-origin` per ruotare il braccio con transform-box: view-box */
  origine: string;
  /** indice: punto in cui la punta del braccio tocca l'anello (per allinearlo a ore 12) */
  punta: { x: number; y: number };
}

/**
 * Dove sta il perno dentro l'SVG e quanto è grande l'SVG. Lo usano `Arco`
 * e `Braccio.tsx`: due SVG sovrapposti con lo stesso viewBox coincidono.
 *  - quadrante/mini 'bordo': lato dritto a sinistra (x 0..base), perno a
 *    (base, portata); SVG largo base + portata, alto 2 × portata.
 *  - quadrante/mini 'fondo': perno a (portata, portata), lato dritto sotto
 *    (y portata..portata + base); SVG largo 2 × portata, alto portata + base.
 *  - indice: il goniometro 'fondo' capovolto, lato dritto in alto, braccio a
 *    90° che punta in giù; SVG largo 2 × portata, alto base + portata.
 */
export function impaginaArco(variante: VarianteArco, geo: Geometria, raggio: number): ImpaginazioneArco {
  const misure = misureArco(variante, geo, raggio);
  const p = Math.ceil(misure.portata);
  const b = misure.base;
  let cx: number;
  let cy: number;
  let larghezza: number;
  let altezza: number;
  if (variante === 'indice') {
    cx = p;
    cy = b;
    larghezza = 2 * p;
    altezza = b + p;
  } else if (geo === 'bordo') {
    cx = b;
    cy = p;
    larghezza = b + p;
    altezza = 2 * p;
  } else {
    cx = p;
    cy = p;
    larghezza = 2 * p;
    altezza = p + b;
  }
  const punta =
    variante === 'indice'
      ? { x: cx, y: cy + raggio + misure.sporgenza }
      : polare(cx, cy, raggio + misure.sporgenza, 90, geo);
  return {
    variante,
    geo,
    raggio,
    misure,
    cx,
    cy,
    larghezza: Math.ceil(larghezza),
    altezza: Math.ceil(altezza),
    viewBox: `0 0 ${Math.ceil(larghezza)} ${Math.ceil(altezza)}`,
    origine: `${n2(cx)}px ${n2(cy)}px`,
    punta,
  };
}

/**
 * Raggio massimo del quadrante 'fondo' per una finestra larga w: la manopola
 * toccabile (48 px) non esce dallo schermo e non entra nei primi 20 px del
 * bordo sinistro (gesto "indietro"). 375 → 143; 320 → 116; 390 → 151.
 */
export function raggioMassimoFondo(w: number): number {
  const m = misureArco('quadrante', 'fondo', 100);
  return Math.floor(w / 2 - MARGINE_GESTO - m.manopolaTocco / 2 - m.sporgenza);
}

/**
 * Raggio massimo del quadrante 'bordo' per una finestra alta h con una fascia
 * alta riservata di `fasciaAlta` px (testata e bottone del sito): la manopola
 * toccabile a 0° e a 180° resta 16 px dentro l'area libera. 900, 72 → 334.
 */
export function raggioMassimoBordo(h: number, fasciaAlta: number): number {
  const m = misureArco('quadrante', 'bordo', 100);
  return Math.floor((h - fasciaAlta) / 2 - 16 - m.sporgenza - m.manopolaTocco / 2);
}

/* ------------------------------------------------------------------------ */
/* Convenzione oraria (anello della settimana)                               */
/* ------------------------------------------------------------------------ */

/** Riporta a in [0, 360). */
export function normalizza360(a: number): number {
  const v = a % 360;
  return v < 0 ? v + 360 : v;
}

/** Differenza con segno più breve da a a b, in (-180, 180]. */
export function differenzaAngolare(a: number, b: number): number {
  const d = normalizza360(b - a);
  return d > 180 ? d - 360 : d;
}

/** L'equivalente di a (a ± 360k) più vicino a `riferimento`: per seguire un trascinamento senza salti a mezzanotte. */
export function vicinoA(a: number, riferimento: number): number {
  return riferimento + differenzaAngolare(riferimento, a);
}

/** Direzione unitaria per l'angolo orario a (0 = ore 12, senso orario). */
export function versoreOrario(a: number): { x: number; y: number } {
  const t = a * RAD;
  const x = Math.sin(t);
  const y = -Math.cos(t);
  return { x: Math.abs(x) < 1e-12 ? 0 : x, y: Math.abs(y) < 1e-12 ? 0 : y };
}

export function polareOrario(cx: number, cy: number, r: number, a: number): { x: number; y: number } {
  const v = versoreOrario(a);
  return { x: cx + r * v.x, y: cy + r * v.y };
}

/** Angolo orario del punto visto dal centro, in [0, 360). NaN sul centro esatto. */
export function orarioDaPunto(px: number, py: number, cx: number, cy: number): number {
  const dx = px - cx;
  const dy = py - cy;
  if (dx * dx + dy * dy < 0.25) return Number.NaN;
  return normalizza360(Math.atan2(dx, -dy) / RAD);
}

function segmentoOrario(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const d = a1 - a0;
  if (Math.abs(d) >= 359.99) {
    const m = a0 + d / 2;
    return `${segmentoOrario(cx, cy, r, a0, m)} ${segmentoOrario(cx, cy, r, m, a1)}`;
  }
  const p1 = polareOrario(cx, cy, r, a1);
  return `A${n2(r)} ${n2(r)} 0 ${Math.abs(d) > 180 ? 1 : 0} ${d >= 0 ? 1 : 0} ${n2(p1.x)} ${n2(p1.y)}`;
}

/** Arco aperto da a0 ad a1 in convenzione oraria (a1 > a0 = senso orario). Per l'arco del "ciclo". */
export function arcoOrarioPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = polareOrario(cx, cy, r, a0);
  const m = `M${n2(p0.x)} ${n2(p0.y)}`;
  if (a0 === a1 || r <= 0) return m;
  return `${m} ${segmentoOrario(cx, cy, r, a0, a1)}`;
}

/**
 * Settore di corona circolare tra i raggi r0 < r1, da a0 ad a1 (orario):
 * uno spicchio di giorno su una pista dell'anello. r0 = 0 dà uno spicchio pieno.
 */
export function settorePath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  if (a0 === a1 || r1 <= 0) return `M${n2(cx)} ${n2(cy)}Z`;
  const esterno = arcoOrarioPath(cx, cy, r1, a0, a1);
  if (r0 <= 0) return `M${n2(cx)} ${n2(cy)} L${esterno.slice(1)} Z`;
  const q1 = polareOrario(cx, cy, r0, a1);
  return `${esterno} L${n2(q1.x)} ${n2(q1.y)} ${segmentoOrario(cx, cy, r0, a1, a0)} Z`;
}

/** Segmento radiale (una tacca dell'anello) all'angolo orario a, tra i raggi r0 e r1. */
export function raggioOrarioPath(cx: number, cy: number, r0: number, r1: number, a: number): string {
  const p = polareOrario(cx, cy, r0, a);
  const q = polareOrario(cx, cy, r1, a);
  return `M${n2(p.x)} ${n2(p.y)} L${n2(q.x)} ${n2(q.y)}`;
}
