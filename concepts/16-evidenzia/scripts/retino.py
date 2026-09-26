#!/usr/bin/env python3
"""Retino da giornale per le foto del foglio di EVIDENZIA (concept 16).

Strumento offline: non entra nel bundle. Richiede Python 3.11 e pillow==12.3.0
(`pip3 install --user pillow==12.3.0`).

Da una foto vera (in scala di grigi) disegna un retino a punti a 45 gradi, come
la stampa dei piccoli annunci:
  - punti chiari in #8F8B82 (retino) per i mezzitoni;
  - punti neri (#111111) sopra, solo nelle ombre;
  - carta trasparente: sotto c'e' il colore del foglio (#E4DFD1).
Il risultato e' un PNG indicizzato a 3 colori (trasparente, retino, nero),
senza dithering: i bordi dei punti sono netti come l'inchiostro.

Uso:
  python3 scripts/retino.py foto.jpg uscita.png --w 536 --h 336 \
      [--fuoco 0.5,0.5] [--passo 4] [--ritaglio x0,y0,x1,y1]

  --w / --h     misura finale in px (2x della misura CSS: 268x168 -> 536x336)
  --fuoco       punto (0-1) che resta al centro quando si ritaglia al rapporto
  --passo       distanza tra i punti in px finali (4 = circa 50 lpi a 2x)
  --ritaglio    ritaglio preliminare in frazioni della foto (per togliere
                dettagli da non mostrare), prima del ritaglio al rapporto
"""
from __future__ import annotations

import argparse
import math

from PIL import Image, ImageDraw, ImageFilter, ImageOps

RETINO = (0x8F, 0x8B, 0x82)
NERO = (0x11, 0x11, 0x11)
SUPER = 4  # sovracampionamento per punti tondi e netti


def ritaglia(im: Image.Image, w: int, h: int, fuoco: tuple[float, float]) -> Image.Image:
    """Ritaglia al rapporto w:h attorno al punto di fuoco, poi ridimensiona."""
    sw, sh = im.size
    r = w / h
    if sw / sh > r:
        cw, ch = round(sh * r), sh
    else:
        cw, ch = sw, round(sw / r)
    x0 = min(max(round(fuoco[0] * sw - cw / 2), 0), sw - cw)
    y0 = min(max(round(fuoco[1] * sh - ch / 2), 0), sh - ch)
    return im.crop((x0, y0, x0 + cw, y0 + ch)).resize((w, h), Image.Resampling.LANCZOS)


def retino(im: Image.Image, w: int, h: int, passo: float = 4.0,
           fuoco: tuple[float, float] = (0.5, 0.5)) -> Image.Image:
    grigio = ImageOps.grayscale(ritaglia(im.convert('RGB'), w, h, fuoco))
    # contrasto da carta di giornale: neri non pieni, bianchi puliti
    grigio = ImageOps.autocontrast(grigio, cutoff=1)
    grigio = grigio.filter(ImageFilter.GaussianBlur(passo * 0.2))
    px = grigio.load()

    W, H = w * SUPER, h * SUPER
    tela = Image.new('P', (W, H), 0)
    tela.putpalette([*(0xE4, 0xDF, 0xD1), *RETINO, *NERO] + [0] * (256 - 3) * 3)
    d = ImageDraw.Draw(tela)

    ang = math.radians(45)
    ca, sa = math.cos(ang), math.sin(ang)
    diag = math.hypot(w, h)
    n = int(diag / passo) + 2
    raggio_max = passo * 0.72  # a 1.0 di scuro i punti si toccano e chiudono
    punti = []
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            # griglia ruotata di 45 gradi attorno al centro dell'immagine
            u, v = i * passo, j * passo
            x = w / 2 + u * ca - v * sa
            y = h / 2 + u * sa + v * ca
            if -passo <= x <= w + passo and -passo <= y <= h + passo:
                xs = min(max(int(x), 0), w - 1)
                ys = min(max(int(y), 0), h - 1)
                scuro = 1 - px[xs, ys] / 255
                # curva da carta di giornale: compensa l'allargamento del punto,
                # le ombre restano aperte (mai nero pieno)
                scuro = 0.9 * scuro ** 1.35
                punti.append((x, y, scuro))
    # mezzitoni in retino
    for x, y, s in punti:
        if s > 0.06:
            r = raggio_max * math.sqrt(s) * SUPER
            cx, cy = x * SUPER, y * SUPER
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=1)
    # ombre in nero, sopra
    for x, y, s in punti:
        if s > 0.55:
            r = raggio_max * math.sqrt((s - 0.55) / 0.35) * 0.8 * SUPER
            cx, cy = x * SUPER, y * SUPER
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=2)

    piccola = tela.convert('RGB').resize((w, h), Image.Resampling.BOX)
    pal = Image.new('P', (1, 1))
    pal.putpalette([*(0xE4, 0xDF, 0xD1), *RETINO, *NERO] + [0] * (256 - 3) * 3)
    fin = piccola.quantize(palette=pal, dither=Image.Dither.NONE)
    fin.info['transparency'] = 0
    return fin


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('foto')
    p.add_argument('uscita')
    p.add_argument('--w', type=int, required=True)
    p.add_argument('--h', type=int, required=True)
    p.add_argument('--passo', type=float, default=4.0)
    p.add_argument('--fuoco', default='0.5,0.5')
    p.add_argument('--ritaglio', default=None)
    a = p.parse_args()
    im = Image.open(a.foto)
    if a.ritaglio:
        x0, y0, x1, y1 = (float(t) for t in a.ritaglio.split(','))
        sw, sh = im.size
        im = im.crop((round(x0 * sw), round(y0 * sh), round(x1 * sw), round(y1 * sh)))
    fx, fy = (float(t) for t in a.fuoco.split(','))
    out = retino(im, a.w, a.h, a.passo, (fx, fy))
    out.save(a.uscita, optimize=True, transparency=0)


if __name__ == '__main__':
    main()
