/**
 * MADRE · forma dell'impasto, camera e luce (webgl-artist).
 *
 * Qui stanno TUTTI i numeri della scena: la pagnotta larga con le sue
 * gonfiature e la piega di chiusura, la forma della fossetta (polpastrello),
 * la camera con il leggero angolo dall'alto, la luce diffusa da in alto a
 * sinistra, le scale delle texture di spolvero. Gli shader li ricevono come
 * `defines` (costanti) e come uniform di composizione (`materiale.ts`).
 *
 * Unità "p": l'ALTEZZA del piano vale 1.
 *   p.x ∈ [-aspetto/2, +aspetto/2]   (sinistra → destra dello schermo)
 *   p.y ∈ [-1/2, +1/2]               (vicino → lontano = basso → alto dello schermo)
 *   z  = altezza dell'impasto sopra il tavolo, nelle stesse unità.
 * Il piano è un `PlaneGeometry(1, 1, …)` scalato con `scalaPiano()`: così
 * x, y e z restano nella stessa unità (normali e luce senza distorsioni).
 *
 * Nessun accesso a window/document qui: funzioni pure, sicure in prerender.
 */

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];

/* ------------------------------------------------------------------ camera */

/**
 * Camera prospettica stretta (poca deformazione, sguardo "da vicino") con un
 * leggero angolo dall'alto: il bordo lontano del tavolo è in alto nello schermo.
 * `up` resta (0, 1, 0): con `lookAt(0, 0, 0)` l'alto dello schermo è +y.
 */
export const CAMERA = {
  /** campo verticale in gradi */
  fov: 30,
  /** gradi dalla verticale (0 = perfettamente dall'alto) */
  inclinazione: 14,
  /** distanza dal centro del tavolo, unità mondo */
  distanza: 4,
  vicino: 0.5,
  lontano: 12,
} as const;

/** Posizione della camera (guarda sempre l'origine). */
export function posizioneCamera(): Vec3 {
  const t = (CAMERA.inclinazione * Math.PI) / 180;
  return [0, -CAMERA.distanza * Math.sin(t), CAMERA.distanza * Math.cos(t)];
}

/** Margine del piano oltre l'inquadratura (bordi rialzati, parallasse). */
const MARGINE_PIANO = 0.06;

export interface MisuraPiano {
  /** larghezza del piano in unità mondo */
  larghezza: number;
  /** altezza del piano in unità mondo (= 1 unità "p") */
  altezza: number;
  /** y del centro del piano in unità mondo (il piano NON è centrato sull'origine) */
  centroY: number;
  /** larghezza / altezza: è il valore di `uAspetto` */
  aspetto: number;
}

/**
 * Misura del piano che copre l'inquadratura per una finestra di proporzione
 * `aspettoFinestra` (larghezza / altezza in px CSS). Calcola dove i quattro
 * raggi d'angolo della camera toccano il tavolo (z = 0) e prende il
 * rettangolo che li contiene, più il margine.
 *
 * Uso (shader-engineer): `mesh.scale.set(...scalaPiano(m))`,
 * `mesh.position.set(0, m.centroY, 0)`, `impostaAspetto(materiale, m.aspetto)`.
 */
export function misuraPiano(aspettoFinestra: number): MisuraPiano {
  const a = Math.max(0.2, Math.min(5, aspettoFinestra));
  const t = (CAMERA.inclinazione * Math.PI) / 180;
  const T = Math.tan((CAMERA.fov * Math.PI) / 360);
  const [, cy, cz] = posizioneCamera();
  const ct = Math.cos(t);
  const st = Math.sin(t);
  // basi della camera (lookAt verso l'origine, up = +y): x = (1,0,0), y = (0, cos t, sin t), avanti = (0, sin t, -cos t)
  const tocca = (sx: number, sy: number): Vec2 => {
    const dx = sx * a * T;
    const dy = st + sy * T * ct;
    const dz = -ct + sy * T * st;
    const l = -cz / dz;
    return [dx * l, cy + dy * l];
  };
  const [xLontano, yLontano] = tocca(1, 1);
  const [xVicino, yVicino] = tocca(1, -1);
  const mezzaLarghezza = Math.max(Math.abs(xLontano), Math.abs(xVicino));
  const altezza = (yLontano - yVicino) * (1 + MARGINE_PIANO);
  const larghezza = 2 * mezzaLarghezza * (1 + MARGINE_PIANO);
  return {
    larghezza,
    altezza,
    centroY: (yLontano + yVicino) / 2,
    aspetto: larghezza / altezza,
  };
}

/** Scala da dare alla mesh (PlaneGeometry 1×1): z come y, così z è in unità "p". */
export function scalaPiano(m: MisuraPiano): Vec3 {
  return [m.larghezza, m.altezza, m.altezza];
}

/**
 * Segmenti della griglia. CD/tech-architect: 180×110 su desktop, 110×70 su
 * mobile. Il lato lungo della griglia segue il lato lungo del piano, così le
 * celle restano quasi quadrate anche in verticale (telefono).
 */
export function segmentiGriglia(aspetto: number, leggera: boolean): Vec2 {
  const [lungo, corto] = leggera ? [110, 70] : [180, 110];
  return aspetto >= 1 ? [lungo, corto] : [corto, lungo];
}

/* -------------------------------------------------------------------- luce */

/**
 * Luce diffusa da in alto a sinistra, alta: nessun riflesso speculare.
 * `avvolgimento` è il "wrap" del diffuso (la luce gira attorno alle
 * gonfiature come in una materia un po' traslucida); `ambiente` è la luce del
 * cielo che non lascia mai il nero. Con la superficie piatta il colore è
 * esattamente quello dei token (normalizzazione nello shader).
 */
export const LUCE = {
  direzione: [-0.56, 0.44, 0.7] as Vec3,
  avvolgimento: 0.35,
  ambiente: 0.26,
  /**
   * Profondità delle ombre: la tinta d'ombra dei token (farina-ombra) dà il
   * TONO; l'esponente dà quanto scende al buio pieno (1 = esattamente la
   * tinta, 2,4 ≈ due volte più scuro, sempre caldo, mai grigio né nero).
   */
  profonditaOmbra: 3.6,
  /** schiarita massima dei lati verso la luce (verso il bianco, 0..1) */
  schiarita: 0.55,
  /** quanto la curvatura convessa schiarisce (traslucenza dei bordi sottili) */
  bordoChiaro: 0.0016,
  /** quanto la curvatura concava scurisce (occlusione nelle pieghe) */
  occlusione: 0.0028,
} as const;

/* ---------------------------------------------------------------- pagnotta */

/**
 * Composizione per proporzione del piano. Due composizioni chiave:
 * - VERTICALE (telefono, aspetto ≈ 0,5): pagnotta quasi intera, il bordo alto
 *   passa sotto il titolo, la cima è nella zona del pollice;
 * - ORIZZONTALE (desktop, aspetto ≈ 1,7): pagnotta larga a destra, tagliata a
 *   destra e in basso; a sinistra il tavolo infarinato sotto il titolo.
 * Tra le due si interpola (tablet).
 *
 * centro: [x, y] in unità "p", riferito al centro del piano;
 * raggio: in "p"; altezza: in "p".
 */
interface ChiaveComposizione {
  aspetto: number;
  centro: Vec2;
  raggio: number;
  altezza: number;
}

const VERTICALE: ChiaveComposizione = {
  aspetto: 0.5,
  centro: [0.07, -0.19],
  raggio: 0.44,
  altezza: 0.15,
};

const ORIZZONTALE: ChiaveComposizione = {
  aspetto: 1.65,
  centro: [0.36, -0.13],
  raggio: 0.62,
  altezza: 0.2,
};

/**
 * Gonfiature (2-3 morbide) relative alla pagnotta: [dx, dy] in raggi dal
 * centro, raggio in raggi, ampiezza in frazioni dell'altezza.
 */
export const GONFIATURE: readonly Vec4[] = [
  [0.06, 0.2, 0.34, 0.1],
  [-0.34, -0.1, 0.27, 0.075],
  [0.3, -0.3, 0.26, 0.065],
];

/**
 * Piega di chiusura: un lembo ripiegato sopra la pagnotta. È un arco di
 * cerchio (centro e raggio relativi alla pagnotta); dalla parte del centro
 * dell'arco c'è il lembo con il labbro arrotondato, sulla linea il solco.
 * [centro dx, centro dy, raggio] in raggi; arco: [angolo centrale (rad),
 * semiampiezza (rad), larghezza del solco in "p", rilievo del labbro in
 * frazioni dell'altezza].
 */
export const PIEGA = {
  cerchio: [0.95, -1.05, 1.08] as Vec3,
  arco: [2.32, 0.42, 0.016, 0.07] as Vec4,
  /** profondità del solco in frazioni dell'altezza */
  solco: 0.05,
} as const;

/**
 * Profilo della cupola: h = H · (max_morbido(1 − d², 0)^esponente − piede)
 * (calotta arrotondata di una pagnotta rilassata). Il max morbido (raccordo)
 * fa scendere il bordo a ~40° invece che in verticale e lascia un piede basso
 * sul tavolo; `piede` toglie la coda lunga del piede.
 */
export const PROFILO = {
  esponente: 0.6,
  /** morbidezza del bordo (k del max morbido su 1 − d²) */
  raccordo: 0.05,
  /** soglia sotto cui il piede si appoggia al tavolo (frazione dell'altezza) */
  piede: 0.022,
  /** irregolarità del bordo: [ampiezza, frequenza, fase] × 3 */
  bordo: [
    [0.02, 3, 0.7],
    [0.024, 5, 2.1],
    [0.011, 9, 4.0],
  ] as readonly Vec3[],
} as const;

/**
 * Respiro: con `uRespiro` = 1 la cupola sale del 3,5% e si allarga dello
 * 0,4%; le crepe dello spolvero si aprono un poco. Mai di più: è lievitazione,
 * non pulsazione.
 */
export const RESPIRO = {
  altezza: 0.035,
  raggio: 0.004,
  crepe: 0.22,
} as const;

/* ---------------------------------------------------------------- fossetta */

/**
 * La fossetta del polpastrello: un'ellisse un po' asimmetrica (più profonda
 * verso la punta del dito), ruotata come un dito della mano destra che arriva
 * dal basso. Unità "p" (1 = altezza del piano: a 900 px, 0,05 ≈ 45 px).
 */
export const FOSSETTA = {
  /** semiasse trasversale e semiasse lungo il dito */
  semiassi: [0.05, 0.064] as Vec2,
  /** rotazione dell'asse del dito (rad, antiorario da +y) */
  rotazione: 0.32,
  /** profondità massima, in "p" */
  profondita: 0.024,
  /** quanto la punta è più profonda del tallone (0 = simmetrica) */
  asimmetria: 0.32,
  /** rigonfiamento attorno (l'impasto spostato), frazione della profondità */
  bordo: 0.16,
  /** profondità del segno che resta, frazione della profondità */
  segno: 0.14,
  /** profondità del segno del cliente (ux: 15%), frazione della profondità */
  segnoCliente: 0.15,
} as const;

/* ---------------------------------------------------------------- spolvero */

/**
 * Scale delle texture di `spolvero.ts` (ripetizioni per unità "p") e
 * soglie. Rapporti non interi e rotazioni diverse: la ripetizione della
 * texture 256² non si vede.
 */
export const SPOLVERO = {
  /** grana fine della farina (canale R) */
  grana: 1.75,
  /** alveoli sotto la pelle e grumi di farina sul tavolo (canale G) */
  alveoli: 0.97,
  /** chiazze dello spolvero e ondulazione della pelle (canale B) */
  chiazze: 1.45,
  /** rete delle crepe dello spolvero (canale A) */
  crepe: 2.15,
  /** rilievo degli alveoli e dell'ondulazione, in "p" */
  rilievoAlveoli: 0.0034,
  rilievoOnde: 0.0042,
  /** larghezza delle crepe a riposo (0..1 della distanza dal bordo cella) */
  crepaRiposo: 0.012,
  /** di quanto si aprono nella fossetta */
  crepaFossetta: 0.05,
} as const;

/* ---------------------------------------------------- composizione e quota */

export interface Composizione {
  /** cx, cy, raggio, altezza */
  pagnotta: Vec4;
  /** tre gonfiature: cx, cy, raggio (in "p"), ampiezza (in "p") */
  gonfiature: readonly [Vec4, Vec4, Vec4];
  /** centro x, centro y, raggio (in "p"), profondità del solco (in "p") */
  piega: Vec4;
  /** angolo centrale, semiampiezza, larghezza del solco, rilievo del labbro (in "p") */
  piegaArco: Vec4;
}

const liscio = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mescola = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Composizione della scena per la proporzione del PIANO (`MisuraPiano.aspetto`). */
export function composizione(aspetto: number): Composizione {
  const t = liscio(VERTICALE.aspetto, ORIZZONTALE.aspetto, aspetto);
  const cx = mescola(VERTICALE.centro[0], ORIZZONTALE.centro[0], t);
  const cy = mescola(VERTICALE.centro[1], ORIZZONTALE.centro[1], t);
  const r = mescola(VERTICALE.raggio, ORIZZONTALE.raggio, t);
  const h = mescola(VERTICALE.altezza, ORIZZONTALE.altezza, t);
  const g = (i: number): Vec4 => {
    const v = GONFIATURE[i] ?? [0, 0, 0.3, 0];
    return [cx + v[0] * r, cy + v[1] * r, v[2] * r, v[3] * h];
  };
  return {
    pagnotta: [cx, cy, r, h],
    gonfiature: [g(0), g(1), g(2)],
    piega: [cx + PIEGA.cerchio[0] * r, cy + PIEGA.cerchio[1] * r, PIEGA.cerchio[2] * r, PIEGA.solco * h],
    piegaArco: [PIEGA.arco[0], PIEGA.arco[1], PIEGA.arco[2], PIEGA.arco[3] * h],
  };
}

/* ------------------------------------------- altezza su CPU (per il raycast) */

/** Distanza normalizzata dal centro della pagnotta (1 = bordo), come nello shader. */
export function distanzaPagnotta(px: number, py: number, c: Composizione, respiro: number): number {
  const [cx, cy, r0] = c.pagnotta;
  const qx = px - cx;
  const qy = py - cy;
  const ang = Math.atan2(qy, qx + 1e-5);
  let mod = 1;
  for (const [amp, freq, fase] of PROFILO.bordo) mod += amp * Math.sin(freq * ang + fase);
  const r = r0 * (1 + RESPIRO.raggio * respiro) * mod;
  return Math.hypot(qx, qy) / r;
}

/**
 * Altezza della superficie (senza fossette né dettaglio) nel punto uv del
 * piano, in unità "p". È la stessa funzione del vertex shader: serve allo
 * shader-engineer per correggere il raycast sul tavolo (z = 0) e far cadere
 * la fossetta esattamente sotto il dito (2-3 iterazioni bastano, vedi doc).
 */
export function altezzaMacro(u: number, v: number, aspetto: number, c: Composizione, respiro = 0): number {
  const px = (u - 0.5) * aspetto;
  const py = v - 0.5;
  const H = c.pagnotta[3] * (1 + RESPIRO.altezza * respiro);
  const d = distanzaPagnotta(px, py, c, respiro);
  const s = 1 - d * d;
  const k = PROFILO.raccordo;
  const sm = 0.5 * (s + Math.sqrt(s * s + k * k));
  let h = (H * Math.max(Math.pow(sm, PROFILO.esponente) - PROFILO.piede, 0)) / (1 - PROFILO.piede);
  const cupola = 1 - liscio(0.55, 0.97, d);
  for (const [gx, gy, gr, ga] of c.gonfiature) {
    const dx = px - gx;
    const dy = py - gy;
    h += ga * Math.exp(-(dx * dx + dy * dy) / (gr * gr)) * cupola;
  }
  h += piega(px, py, c, d);
  return h;
}

function piega(px: number, py: number, c: Composizione, d: number): number {
  const [pcx, pcy, pr, solco] = c.piega;
  const [a0, semi, larghezza, labbro] = c.piegaArco;
  const qx = px - pcx;
  const qy = py - pcy;
  let da = Math.atan2(qy, qx + 1e-5) - a0;
  da = Math.atan2(Math.sin(da), Math.cos(da));
  const arco = 1 - liscio(semi * 0.45, semi, Math.abs(da));
  const sopra = 1 - liscio(0.62, 0.9, d);
  const sd = Math.hypot(qx, qy) - pr;
  const solcoH = -solco * Math.exp(-((sd / larghezza) ** 2));
  const l = (sd + 1.7 * larghezza) / (1.6 * larghezza);
  const labbroH = labbro * Math.exp(-(l * l));
  const lembo = labbro * 0.55 * liscio(-larghezza * 1.2, -larghezza * 6, sd);
  return (solcoH + labbroH + lembo) * arco * sopra;
}

/* -------------------------------------------------------- defines per GLSL */

const f = (x: number): string => {
  const s = Number.isInteger(x) ? x.toFixed(1) : String(x);
  return s.includes('e') ? x.toFixed(8) : s;
};
const v2 = (a: Vec2): string => `vec2(${f(a[0])}, ${f(a[1])})`;
const v3 = (a: Vec3): string => `vec3(${f(a[0])}, ${f(a[1])}, ${f(a[2])})`;

/** Costanti per gli shader (ShaderMaterial.defines). Tutte float GLSL. */
export function definesForma(): Record<string, string> {
  const [b0, b1, b2] = PROFILO.bordo;
  const bordo = (b: Vec3 | undefined): string => v3(b ?? [0, 1, 0]);
  const L = LUCE.direzione;
  const l = Math.hypot(L[0], L[1], L[2]);
  return {
    MAD_ESPONENTE: f(PROFILO.esponente),
    MAD_RACCORDO: f(PROFILO.raccordo),
    MAD_PIEDE: f(PROFILO.piede),
    MAD_BORDO_0: bordo(b0),
    MAD_BORDO_1: bordo(b1),
    MAD_BORDO_2: bordo(b2),
    MAD_RESPIRO_ALTEZZA: f(RESPIRO.altezza),
    MAD_RESPIRO_RAGGIO: f(RESPIRO.raggio),
    MAD_RESPIRO_CREPE: f(RESPIRO.crepe),
    MAD_FOSSETTA_SEMIASSI: v2(FOSSETTA.semiassi),
    MAD_FOSSETTA_ROTAZIONE: f(FOSSETTA.rotazione),
    MAD_FOSSETTA_PROFONDITA: f(FOSSETTA.profondita),
    MAD_FOSSETTA_ASIMMETRIA: f(FOSSETTA.asimmetria),
    MAD_FOSSETTA_BORDO: f(FOSSETTA.bordo),
    MAD_FOSSETTA_SEGNO: f(FOSSETTA.segno),
    MAD_FOSSETTA_SEGNO_CLIENTE: f(FOSSETTA.segnoCliente),
    MAD_LUCE: v3([L[0] / l, L[1] / l, L[2] / l]),
    MAD_AVVOLGIMENTO: f(LUCE.avvolgimento),
    MAD_AMBIENTE: f(LUCE.ambiente),
    MAD_PROFONDITA_OMBRA: f(LUCE.profonditaOmbra),
    MAD_SCHIARITA: f(LUCE.schiarita),
    MAD_BORDO_CHIARO: f(LUCE.bordoChiaro),
    MAD_OCCLUSIONE: f(LUCE.occlusione),
    MAD_S_GRANA: f(SPOLVERO.grana),
    MAD_S_ALVEOLI: f(SPOLVERO.alveoli),
    MAD_S_CHIAZZE: f(SPOLVERO.chiazze),
    MAD_S_CREPE: f(SPOLVERO.crepe),
    MAD_RILIEVO_ALVEOLI: f(SPOLVERO.rilievoAlveoli),
    MAD_RILIEVO_ONDE: f(SPOLVERO.rilievoOnde),
    MAD_CREPA_RIPOSO: f(SPOLVERO.crepaRiposo),
    MAD_CREPA_FOSSETTA: f(SPOLVERO.crepaFossetta),
  };
}
