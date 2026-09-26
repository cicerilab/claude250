/**
 * CONTROPELO · design tokens per TypeScript e per il canvas del vapore
 * (art-director).
 *
 * Specchio numerico di tokens.css: stessi valori, stessi nomi. Il canvas non
 * legge le variabili CSS (niente getComputedStyle per frame): legge da qui.
 * Solo dati e funzioni pure: nessun accesso a window/document a livello di
 * modulo (il sito fa prerender).
 *
 * Contrasti misurati: docs/art-director.md §2.
 */

/* ------------------------------------------------------------------ colori */

/** Colori in esadecimale: vanno bene sia per il CSS sia per ctx.fillStyle. */
export const COLORI = {
  specchio: '#232A2C',
  vapore: '#CDD5D4',
  turchese: '#2A9D96',
  pennarello: '#FAFAF6',
  parete: '#171C1D',
  bisello: '#48555A',
  biselloOmbra: '#0E1213',
  turcheseVetro: '#4BC3BC',
  suTurchese: '#171C1D',
  vaporeLuce: '#E4EAE9',
  vaporeOmbra: '#B9C2C1',
  riflessoLuce: '#343E41',
} as const;

export type NomeColore = keyof typeof COLORI;

export type Rgb = readonly [number, number, number];

/** Gli stessi colori come terne 0-255, per ImageData e gradienti del canvas. */
export const RGB: { readonly [K in NomeColore]: Rgb } = {
  specchio: [35, 42, 44],
  vapore: [205, 213, 212],
  turchese: [42, 157, 150],
  pennarello: [250, 250, 246],
  parete: [23, 28, 29],
  bisello: [72, 85, 90],
  biselloOmbra: [14, 18, 19],
  turcheseVetro: [75, 195, 188],
  suTurchese: [23, 28, 29],
  vaporeLuce: [228, 234, 233],
  vaporeOmbra: [185, 194, 193],
  riflessoLuce: [52, 62, 65],
};

/** `rgba(...)` di un colore della palette, per gradienti e riempimenti. */
export function rgba(nome: NomeColore, alfa: number): string {
  const [r, g, b] = RGB[nome];
  const a = Math.min(1, Math.max(0, alfa));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* ------------------------------------------------------------------ vapore */

/**
 * Aspetto del vapore (il QUANDO sta in motion/tempi.ts).
 * Opacità massime del vapore pieno: più fitto in basso, dove sta l'asciugamano
 * caldo. Lo specchio non è mai un muro: a vapore pieno si intuiscono scritte e
 * salone (misurato a schermo: docs/art-director.md §5).
 */
export const VAPORE = {
  /** opacità del vapore pieno in cima al vetro */
  alto: 0.78,
  /** opacità del vapore pieno in fondo al vetro */
  basso: 0.9,
  /** da che altezza (0 = cima, 1 = fondo) il vapore è già al valore "basso" */
  pienoDa: 0.72,
  /** tappa intermedia del gradiente di densità, a metà vetro */
  meta: 0.83,
  /** grana statica: lato della tessera di rumore, px interni */
  granaLato: 256,
  /** grana: variazione massima di opacità (± sul valore del punto) */
  granaAmpiezza: 0.045,
  /** grana: frequenza del rumore a bassa frequenza (cicli per tessera) */
  granaFrequenza: 5,
  /** grana chiara e scura: i due colori che il rumore mescola al vapore */
  granaChiara: COLORI.vaporeLuce,
  granaScura: COLORI.vaporeOmbra,
  /** pennello: frazione del raggio pulita piena, il resto sfuma (bordo quasi netto) */
  nocciolo: 0.7,
  /** filo d'acqua sul bordo della traccia: colore, alfa, spessore in frazione del raggio */
  filoAcqua: { colore: COLORI.vaporeLuce, alfa: 0.3, spessore: 0.12 },
  /** gocce: testa appena più chiara, scia pulita larga così */
  goccia: { raggioTesta: 3.5, alfaTesta: 0.55, larghezzaScia: 3 },
  /** risoluzione interna rispetto ai px CSS (tech-architect §7.3) */
  scala: 0.5,
} as const;

/**
 * L'alone fermo sui bordi del vetro (modo "fermo" del canvas e versione CSS
 * .ctp-alone in materia.css). Distanze in px CSS dal bordo; il testo non sta mai
 * a meno di 20 px dal bordo, dove l'alone vale al massimo `interno`.
 */
export const ALONE = {
  bordo: 0.34,
  interno: 0.16,
  lati: { interno: 14, fine: 36 },
  alto: { interno: 10, fine: 28 },
  basso: { interno: 18, fine: 64 },
} as const;

/* ------------------------------------------------------------------ riflesso */

/** Velatura specchio sopra la foto (CSS: --ctp-velatura). */
export const VELATURA = {
  normale: 0.66,
  vetrinaLunga: 0.8,
  contrastoAlto: 0.86,
} as const;

/**
 * Ricetta del trattamento foto (photo-editor, a build-time, mai a runtime).
 * Il tetto delle alte luci è ciò che garantisce il pennarello >= 7:1 su ogni
 * punto del riflesso con velatura 66% (docs/art-director.md §2 e §4).
 */
export const RIFLESSO = {
  specchiata: true,
  /** saturazione residua (1 = originale): -40% */
  saturazione: 0.6,
  /** livelli: bianco d'uscita per canale; raffredda e taglia le alte luci insieme */
  biancoUscita: [0xa7, 0xaf, 0xae] as Rgb,
  biancoUscitaHex: '#A7AFAE',
  /** luminanza relativa WCAG massima ammessa di un pixel della foto trattata */
  luminanzaMax: 0.419,
  /** sfocatura gaussiana (raggio px) sulle due misure */
  sfocatura: { w1600: 1.5, w800: 0.75 },
  formato: { tipo: 'webp', qualita: 70 },
} as const;

/* ------------------------------------------------------------------ opacità */

export const OPACITA = {
  passata: 0.62,
  fallito: 0.55,
} as const;

/* ------------------------------------------------------------------ font */

export const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Limelight&family=Mansalva&display=swap';

/** Combinazioni da attendere con document.fonts.load() (core/fonts.ts). */
export const FONT_DA_CARICARE = [
  '400 28px Limelight',
  '400 28px Mansalva',
  '400 16px Figtree',
  '600 16px Figtree',
] as const;

/**
 * Metriche misurate con fontTools sui woff2 latin (26/09/2026). Servono a chi
 * calcola altezze di riga o larghezze prima che il font arrivi.
 */
export const METRICHE_FONT = {
  mansalva: {
    ascesa: 1.112,
    discesa: 0.466,
    altezzaX: 0.384,
    altezzaMaiuscole: 0.702,
    /** larghezze delle cifre in em: niente cifre tabellari */
    cifre: { '0': 0.564, '1': 0.469, '2': 0.624, '3': 0.457, '4': 0.592, '5': 0.7, '6': 0.547, '7': 0.611, '8': 0.548, '9': 0.523 },
    /** voce più lunga del listino, "macchinetta, un'altezza" */
    voceMax: 10.49,
    /** frecce ← → assenti: si disegnano (vector-artist, tratti.ts) */
    frecce: false,
  },
  figtree: { ascesa: 0.95, discesa: 0.25, altezzaX: 0.5, frecce: false },
  limelight: { ascesa: 0.91, discesa: 0.307, altezzaX: 0.521, frecce: false },
} as const;

/* ------------------------------------------------------------------ scala */

/** Corpi in px a 375 e a 1440 (fluidi in mezzo), e a 2560 dove crescono ancora. */
export const TIPO = {
  nome: { min: 28, max: 40, xl: 60 },
  titolo: { min: 24, max: 30, xl: 40 },
  riga: { min: 22, max: 32, xl: 44 },
  prezzo: { min: 26, max: 36, xl: 50 },
  ora: { min: 24, max: 27, xl: 36 },
  nota: { min: 22, max: 24, xl: 30 },
  link: { min: 24, max: 26, xl: 32 },
  scelta: { min: 24, max: 24, xl: 24 },
  campo: { min: 26, max: 30, xl: 30 },
  chiuso: { min: 64, max: 96, xl: 96 },
  insegna: { min: 22, max: 28, xl: 36 },
  barbiere: { min: 20, max: 20, xl: 24 },
  uiPiccolo: { min: 14, max: 14, xl: 14 },
  ui: { min: 15, max: 16, xl: 16 },
  bottone: { min: 15, max: 17, xl: 17 },
} as const;

/* ------------------------------------------------------------------ scritte */

/** Inclinazione delle scritte, in gradi. Mai sui campi della riga di scrittura. */
export const ROTAZIONI = {
  affiancate: [
    { vetro: -1.5, lista: 0.8 },
    { vetro: -0.9, lista: 1.2 },
    { vetro: -1.8, lista: 0.6 },
  ],
  alternateM: { vetro: -1, lista: 0.6 },
  alternateS: { vetro: -0.8, lista: 0.5 },
  vetrinaLunga: { vetro: 0, lista: 0 },
} as const;

/* ------------------------------------------------------------------ livelli */

export const Z = {
  riflesso: 0,
  pennarello: 1,
  vapore: 2,
  scrittura: 3,
  pannello: 3,
  parete: 4,
} as const;

/* ------------------------------------------------------------------ contrasto */

function lineare(canale: number): number {
  const v = canale / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function daHex(hex: string): Rgb {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Luminanza relativa WCAG 2.x di un colore esadecimale. */
export function luminanza(hex: string): number {
  const [r, g, b] = daHex(hex);
  return 0.2126 * lineare(r) + 0.7152 * lineare(g) + 0.0722 * lineare(b);
}

/** Rapporto di contrasto WCAG 2.x tra due colori esadecimali. */
export function contrasto(a: string, b: string): number {
  const la = luminanza(a);
  const lb = luminanza(b);
  const [alto, basso] = la > lb ? [la, lb] : [lb, la];
  return (alto + 0.05) / (basso + 0.05);
}
