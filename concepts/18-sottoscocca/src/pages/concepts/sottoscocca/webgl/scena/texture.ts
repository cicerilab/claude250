/**
 * SOTTOSCOCCA · texture disegnate su canvas 2D (webgl-artist).
 *
 * - pavimento: nero grasso con le linee bianche delle postazioni (le strisce
 *   larghe dipinte a terra in ogni officina). Niente foto, niente rumore.
 * - ombra: macchia di contatto morbida sotto l'auto, solo alpha.
 * - targhetta: la piastrina rivettata sulla colonna, "PORTATA / 3500 kg" in
 *   Tektur. I testi arrivano da fuori (content/testi.ts): qui solo il disegno.
 *
 * Tutto si crea al montaggio della scena (usa `document.createElement`), mai a
 * livello di modulo.
 */

import { CanvasTexture, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { PALETTE, SCENA, fontTarghetta, rgba } from '../../styles/tokens';

/** Lato del quadrato di pavimento disegnato, in metri (centrato sull'auto). */
export const LATO_PAVIMENTO = 24;

/** Linee a terra, in metri, nel sistema della scena (x sinistra dell'auto, z verso il muso). */
export const LINEE_A_TERRA = {
  /** Meta' larghezza della postazione: le due linee lunghe stanno a x = ±mezzaLarghezza. */
  mezzaLarghezza: 2.7,
  /** Spessore delle strisce (10 cm, come la vernice vera). */
  spessore: 0.1,
  /** z della linea trasversale di fondo postazione (dietro l'auto). */
  fondo: -3.6,
  /** z dove le linee lunghe finiscono verso il muso (la postazione resta aperta davanti). */
  apertura: 5.2,
  /** Postazioni vicine: linee a x = ±(mezzaLarghezza + passo). */
  passo: 5.4,
} as const;

function tela(larghezza: number, altezza: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = larghezza;
  canvas.height = altezza;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2D non disponibile');
  return { canvas, ctx };
}

/**
 * Pavimento: 2048 px per LATO_PAVIMENTO metri (~8,5 px per 10 cm). La texture
 * va su un piano ruotato a terra con u lungo +x e v lungo -z (PlaneGeometry
 * ruotata di -90 gradi su x): qui `px(x)` e `pz(z)` fanno il conto.
 */
export function creaTexturePavimento(): CanvasTexture {
  const N = 2048;
  const { canvas, ctx } = tela(N, N);
  const scala = N / LATO_PAVIMENTO;
  const px = (x: number): number => (x + LATO_PAVIMENTO / 2) * scala;
  // piano ruotato di -PI/2 su x: la riga 0 del canvas finisce a z = -LATO/2
  const pz = (z: number): number => (z + LATO_PAVIMENTO / 2) * scala;

  ctx.fillStyle = PALETTE[SCENA.pavimento ?? 'nero'].hex;
  ctx.fillRect(0, 0, N, N);

  const L = LINEE_A_TERRA;
  const s = L.spessore * scala;
  ctx.fillStyle = PALETTE[SCENA.lineeATerra ?? 'bianco'].hex;

  // postazione del ponte 1: due linee lunghe e il fondo
  for (const lato of [-1, 1]) {
    const x = px(lato * L.mezzaLarghezza) - s / 2;
    ctx.fillRect(x, pz(L.fondo), s, pz(L.apertura) - pz(L.fondo));
  }
  ctx.fillRect(px(-L.mezzaLarghezza) - s / 2, pz(L.fondo) - s / 2, px(L.mezzaLarghezza) - px(-L.mezzaLarghezza) + s, s);

  // postazioni vicine, solo accennate (la nebbia le porta via)
  for (const lato of [-1, 1]) {
    const x = px(lato * (L.mezzaLarghezza + L.passo)) - s / 2;
    ctx.fillRect(x, pz(L.fondo), s, pz(L.apertura) - pz(L.fondo));
    const x0 = lato > 0 ? px(L.mezzaLarghezza) : px(-L.mezzaLarghezza - L.passo);
    ctx.fillRect(x0, pz(L.fondo) - s / 2, L.passo * scala, s);
  }

  // tacche di fermo ruota davanti ai tamponi (brevi trasversali a 1,6 m dal centro)
  const tacca = 0.5 * scala;
  for (const lato of [-1, 1]) {
    const xi = lato > 0 ? px(L.mezzaLarghezza) - tacca : px(-L.mezzaLarghezza);
    ctx.fillRect(xi, pz(0) - s / 2, tacca, s);
  }

  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = ClampToEdgeWrapping;
  t.wrapT = ClampToEdgeWrapping;
  t.minFilter = LinearMipmapLinearFilter;
  t.magFilter = LinearFilter;
  t.anisotropy = 8;
  return t;
}

/** Macchia di contatto: ellisse morbida nera, solo alpha (il colore e' nel materiale). */
export function creaTextureOmbra(): CanvasTexture {
  const N = 256;
  const { canvas, ctx } = tela(N, N);
  ctx.clearRect(0, 0, N, N);
  const g = ctx.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  g.addColorStop(0, rgba('nero', 0.9));
  g.addColorStop(0.45, rgba('nero', 0.7));
  g.addColorStop(0.8, rgba('nero', 0.22));
  g.addColorStop(1, rgba('nero', 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, N, N);
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export interface TestiTarghetta {
  /** Riga piccola in alto, es. "PORTATA". */
  sopra: string;
  /** Riga grande, es. "3500 kg". */
  sotto: string;
}

export interface Targhetta {
  texture: CanvasTexture;
  /** Proporzione larghezza/altezza della piastrina (per la geometria). */
  aspetto: number;
  /** Ridisegna (dopo `fontsReady(['600 48px Tektur'])`: il primo disegno puo' usare il ripiego). */
  ridisegna(): void;
}

/**
 * Piastrina zincata con quattro rivetti e il testo in nero grasso. 512 x 256
 * px, sRGB. Il testo grande si stringe da solo se non ci sta.
 */
export function creaTarghetta(testi: TestiTarghetta): Targhetta {
  const W = 512;
  const H = 256;
  const { canvas, ctx } = tela(W, H);
  const fondo = PALETTE[SCENA.targhettaFondo ?? 'zincato'].hex;
  const inchiostro = PALETTE[SCENA.targhettaTesto ?? 'nero'].hex;

  function disegna(): void {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, W, H);
    // bordo stampato, 6 px dentro
    ctx.strokeStyle = inchiostro;
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    // rivetti
    ctx.fillStyle = inchiostro;
    for (const [x, y] of [
      [9, 9],
      [W - 9, 9],
      [9, H - 9],
      [W - 9, H - 9],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.font = fontTarghetta(42);
    ctx.fillText(testi.sopra, 44, 84);
    let corpo = 128;
    ctx.font = fontTarghetta(corpo);
    const misura = ctx.measureText(testi.sotto).width;
    const spazio = W - 88;
    if (misura > spazio) {
      corpo = Math.floor((corpo * spazio) / misura);
      ctx.font = fontTarghetta(corpo);
    }
    ctx.fillText(testi.sotto, 44, 206);
  }

  disegna();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return {
    texture,
    aspetto: W / H,
    ridisegna() {
      disegna();
      texture.needsUpdate = true;
    },
  };
}
