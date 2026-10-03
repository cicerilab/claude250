# CONTROPELO · photo-editor (ondata 2)

File miei: `src/pages/concepts/contropelo/assets/foto/` (6 webp + `index.ts`)
e questo doc. Prove visive in `qa/photo-editor/` (ignorata da git).

## In breve

- **Tre foto vere di barberie**, una per specchio, come chiede il CD §8
  (piano A). Piano B e C non servono.
- Fonte **Wikimedia Commons**, tutte **CC BY-SA** (attribuzione, licenza e
  "modificata" obbligatorie nel pannello Informazioni).
- Trattate con la ricetta dell'art-director (§1.3, §1.10, §6; `tokens.ts`
  `RIFLESSO`). **Nessun pixel più chiaro di `#A7AFAE` in nessun canale**,
  luminanza massima ≤ 0,407 (tetto 0,419), verificato con uno script sui
  webp decodificati. Pennarello sul punto più chiaro di ogni foto, sotto la
  velatura al 66%: **da 7,08:1 a 7,28:1** (≥ 7:1).
- Pesi: 1600 px da 38 a 54 KB (budget 140), 800 px da 18 a 26 KB (budget 60);
  le tre 800 insieme fanno 67 KB (budget mobile 180).

## Fonti provate

| Fonte | Esito |
|---|---|
| Unsplash, ricerca (`unsplash.com/napi/search/photos`, `unsplash.com/s/photos/...`) con curl | 401 "Authorization required" / 307 verso la pagina anti-bot: la ricerca è chiusa. Senza ricerca non posso risalire ad autore e pagina di una foto, quindi niente Unsplash (stesso esito del photo-editor del 15). |
| Openverse (`api.openverse.org/v1/images`) | funziona (max 20 risultati per pagina da anonimi); per "barbershop" restituisce soprattutto incisioni antiche, rawpixel e Wikimedia. |
| Wikimedia Commons (API `generator=search`, poi categorie) | funziona con pause tra le richieste (altrimenti 429). Gli originali su `upload.wikimedia.org` rispondono 429: si scaricano solo le **miniature a misure standard** (1280, 1920 px). |

TLS sempre verificato (curl con il bundle del proxy), nessun flag.

## Le tre foto

Ordine = `BARBIERI` in `content/testi.ts`.

| Specchio | File | Cosa si vede | Autore | Licenza | Pagina |
|---|---|---|---|---|---|
| 1 · Mattia · Il listino | `specchio-1-{800,1600}.webp` | il salone visto dalla prima poltrona: quattro poltrone da barbiere classiche in fila davanti agli specchi, mensole con flaconi, pavimento in legno, porta grigia in fondo. Barberia "Swing Hair Shave", Lucca, 2019 | Palickap | CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Lucca,_Swing_Hair_Shave.jpg |
| 2 · Denis · La barba | `specchio-2-{800,1600}.webp` | una rasatura vera col rasoio a mano libera: barbiere anziano chino sul cliente sdraiato in poltrona, specchi ad arco e bancone dietro. Antigua Guatemala, 1998 (descrizione dell'autore: "a real old-fashioned barber with a cut throat razor") | Leonora Enking | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:A_close_shave_in_Antigua_Guatemala.jpg |
| 3 · Samir · Dove e quando | `specchio-3-{800,1600}.webp` | il fondo di una barberia all'antica: specchio sopra il lavandino che riflette la vetrina sulla strada (con passanti), orologio, tre poltrone vuote in fila, il barbiere in camice seduto di lato che aspetta. Porto, 2009, in bianco e nero all'origine | Ramón Peco | CC BY-SA 2.0 | https://commons.wikimedia.org/wiki/File:Barber_shop_Porto.jpg |

Tutte guardate con Read prima e dopo il trattamento. Controlli del CD §8:

- **Barbiere, mai parrucchiere**: tre barberie con poltrone da barbiere
  idrauliche, clienti uomini; nessun casco, stagnola, colore, piega lunga.
  Nota sulla 1: in fondo (a destra, dopo lo specchiamento) ci sono due
  lavatesta con poltroncina: sono quelli da barberia (la bottega si chiama
  "Hair Shave"), non una postazione da signora; dietro velatura e sfocatura
  sono due macchie grigie.
- **Volti**: nessuno guarda in camera, nessun primo piano. Il barbiere della 2
  è di profilo e chino; l'uomo della 3 è a figura intera, piccolo, sul bordo
  sinistro (dopo lo specchiamento) e su desktop sta sotto la colonna del
  vetro scritto.
- **Scritte**: nessuna leggibile a quella misura dopo sfocatura e velatura (la
  scatola "NIZORAL" della 3 sparisce sul bordo). L'orologio della 3 è al
  contrario, come in uno specchio vero.
- **Il bocciato** (pelle marrone calda, lampadine a filamento): la 1 ha legno
  caldo e due lampade a gabbia in alto; il trattamento (saturazione 60%,
  rosso tagliato più del verde) le porta al grafite e la `posizione` desktop
  `50% 80%` taglia il soffitto. Nessuna pelle marrone in primo piano.
- **Profondità** (trend-researcher P5): 1 e 3 sono file di poltrone in
  prospettiva; la 2 è l'unica scena d'azione, voluta perché è lo specchio
  della barba.

## Trattamento (ricetta art-director, nell'ordine)

1. ridimensionata a 1600 e 800 px di larghezza (Lanczos);
2. specchiata in orizzontale;
3. saturazione 60% (`ImageEnhance.Color(0.6)`);
4. livelli per canale con bianco d'uscita `#A7AFAE`
   (`R×167/255`, `G×175/255`, `B×174/255`);
5. sfocatura gaussiana 1,5 px (1600) / 0,75 px (800);
6. webp q 70, `method=6`.

Il webp con perdita (YUV 4:2:0) fa sforare di qualche livello i canali sulle
alte luci (fino a R 172 alla prima prova). Per rispettare alla lettera "nessun
pixel più chiaro di `#A7AFAE`", lo script decodifica ogni webp e, se un canale
supera il tetto o la luminanza supera 0,416 (margine sotto 0,419 per piccole
differenze di decodifica tra browser), abbassa il bianco d'uscita del 0,5% e
riprova. Fattore finale (`scala`) tra 0,935 e 1,000: differenza invisibile.

Nessuna velatura cotta (è CSS al 66%), nessun filtro a runtime.

**La 2 è ingrandita**: Commons dà al massimo 1280 px di miniatura e
l'originale (1685 px) risponde 429. La 1600 è un ingrandimento Lanczos da
1280 (×1,25); con la sfocatura da 1,5 px e la velatura la differenza non si
vede (controllato a 1440 in `qa/photo-editor/ritagli.jpg`).

## Verifica (script `verifica.py` in appendice, sui file su disco)

| File | Misure | Peso | Luminanza max | Canali max (R G B) | Vetro più chiaro (velatura 66%) | Pennarello `#FAFAF6` |
|---|---|---|---|---|---|---|
| specchio-1-1600.webp | 1600 × 1200 | 38 666 B | 0,3940 | 164 170 169 | `rgb(79 86 85)` | 7,18:1 |
| specchio-1-800.webp | 800 × 600 | 17 814 B | 0,3910 | 164 169 168 | `rgb(79 85 86)` | 7,26:1 |
| specchio-2-1600.webp | 1600 × 1081 | 50 018 B | 0,3892 | 163 169 169 | `rgb(78 85 86)` | 7,28:1 |
| specchio-2-800.webp | 800 × 541 | 23 046 B | 0,4068 | 167 173 174 | `rgb(79 87 87)` | 7,08:1 |
| specchio-3-1600.webp | 1600 × 1067 | 53 584 B | 0,3988 | 167 171 169 | `rgb(80 86 86)` | 7,15:1 |
| specchio-3-800.webp | 800 × 533 | 25 990 B | 0,3983 | 167 170 170 | `rgb(80 86 86)` | 7,15:1 |

Tetto: luminanza ≤ 0,419 e canali ≤ 167 / 175 / 174. Tutte passano. Per
l'accessibility-auditor: rifare la misura sui file della build (il nome cambia
con l'hash, il contenuto no).

## `assets/foto/index.ts`

`FOTO_SPECCHI` (tupla di 3, indice = specchio) con, per ogni foto: `src800`,
`src1600`, `srcset`, `larghezza`/`altezza` (della 1600), `larghezza800`/
`altezza800`, `posizione`, `posizioneStretta`, `autore`, `url`, `fonte`,
`licenza`, `licenzaUrl`, `modifiche`, `luminanzaMax`, `soggetto`. In più
`FOTO_SIZES` (`(min-width: 900px) 88vw, 100vw`, tech-architect §9.2).
Import nativi di Vite (`import x from './x.webp'`): serve il tipo `*.webp` di
`vite/client`. Typecheck `--strict --noUncheckedIndexedAccess` verde.

Posizioni (`object-position` sulla foto già specchiata), provate in
`qa/photo-editor/ritagli.jpg` a 1267 × 752 (vetro a 1440), 351 × 503 (375) e
704 × 876 (768), con la velatura:

| Specchio | `posizione` (≥ 900 px) | `posizioneStretta` (< 900 px) | Cosa resta nel taglio stretto |
|---|---|---|---|
| 1 | `50% 80%` (taglia il soffitto e le lampade) | `32% 55%` | la prima poltrona davanti, la fila di specchi a sinistra |
| 2 | `50% 45%` | `57% 50%` | barbiere e testa del cliente sul rasoio |
| 3 | `50% 50%` | `28% 50%` | la vetrina riflessa, il lavandino, le poltrone; l'uomo seduto resta fuori o sul bordo |

## Frase del riflesso (domanda del copywriter)

La frase attuale `INFORMAZIONI.riflesso` ("Dietro al vetro c'è un salone vero,
riflesso come in uno specchio: le poltrone in fila, la mensola, la porta sulla
via.") **non corrisponde del tutto**:
- non sono un salone solo ma **tre barberie vere** diverse (Lucca, Antigua,
  Porto): "un salone vero" sarebbe falso;
- manca la rasatura, che è lo specchio 2;
- nel 3 non c'è una porta ma la **vetrina sulla strada** vista nello specchio
  sopra il lavandino.

Proposta: *"Dietro al vetro ci sono barberie vere, riflesse come in uno
specchio: le poltrone in fila, una barba fatta col rasoio, la vetrina sulla
strada."*

## Richieste ad altri agent

- **copywriter**:
  1. `INFORMAZIONI.riflesso`: la frase sopra (o una tua equivalente che dica
     "barberie vere", plurale).
  2. `INFORMAZIONI.foto(autore)` dice "su Unsplash": è sbagliato e la licenza
     CC BY-SA chiede autore, licenza con link e indicazione delle modifiche.
     Proposta di firma `foto(autore, licenza)` →
     `{ prima: 'Foto di ', link: autore, dopo: `, ${licenza}, da Wikimedia Commons, modificata.` }`
     (link dell'autore = `url`, licenza linkata a `licenzaUrl` se il builder
     vuole un secondo link; i dati sono tutti in `FOTO_SPECCHI`).
- **section-builder-parete**: `<img className="ctp-riflesso__foto"
  src={foto.src1600} srcSet={foto.srcset} sizes={FOTO_SIZES}
  width={foto.larghezza} height={foto.altezza} alt="" decoding="async">`,
  `fetchpriority` come tech-architect §9.2. Passare entrambe le posizioni:
  `--ctp-riflesso-posizione: foto.posizione` e
  `--ctp-riflesso-posizione-stretta: foto.posizioneStretta`.
- **art-director** (`materia.css`): sotto i 900 px usare la posizione stretta,
  per esempio `@media (max-width: 899px) { .ctp-root .ctp-riflesso__foto {
  object-position: var(--ctp-riflesso-posizione-stretta,
  var(--ctp-riflesso-posizione)); } }`. Senza, sul telefono si vede il centro
  della foto (nella 3 l'uomo seduto invece della vetrina).
- **scaffold-engineer**: tipi `vite/client` (import `*.webp`); il `<link
  rel="preload" as="image">` dello standalone usa `specchio-1` (800/1600).
- **seo-engineer / accessibility-auditor**: le foto hanno `alt=""` (decorative,
  ux-architect); il salone è raccontato dal testo `riflesso`.

---

## Appendice A: script di trattamento (`tratta.py`, Pillow 12 + NumPy)

Sorgenti scaricate con curl dalle miniature standard di Commons
(`.../thumb/<hash>/<file>/1920px-<file>`, e `1280px-` per la 2).

```python
import io, numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

OUT = 'concepts/13-contropelo/src/pages/concepts/contropelo/assets/foto'
BIANCO = (0xA7, 0xAF, 0xAE)
LMAX = 0.416  # margine sotto il tetto 0,419 per differenze di decodifica webp tra browser
FOTO = [('specchio-1', 'orig/lucca.jpg'), ('specchio-2', 'orig/antigua.jpg'), ('specchio-3', 'orig/porto.jpg')]
MISURE = [(1600, 1.5, 140_000), (800, 0.75, 60_000)]

def lin(a):
    a = a / 255.0
    return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)

def lum_max(im):
    a = np.asarray(im.convert('RGB'), dtype=np.float64)
    L = 0.2126 * lin(a[..., 0]) + 0.7152 * lin(a[..., 1]) + 0.0722 * lin(a[..., 2])
    return float(L.max()), float(L.mean())

def tratta(src, w, raggio, scala=1.0):
    im = Image.open(src).convert('RGB')
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im = ImageOps.mirror(im)                          # specchiata
    im = ImageEnhance.Color(im).enhance(0.6)          # saturazione 60%
    a = np.asarray(im, dtype=np.float64)              # livelli: bianco d'uscita #A7AFAE
    a = a * (np.array(BIANCO, dtype=np.float64) * scala / 255.0)
    im = Image.fromarray(np.clip(np.rint(a), 0, 255).astype(np.uint8))
    return im.filter(ImageFilter.GaussianBlur(raggio))  # sfocatura

for nome, src in FOTO:
    for w, raggio, budget in MISURE:
        q, scala = 70, 1.0
        while True:
            im = tratta(src, w, raggio, scala)
            buf = io.BytesIO(); im.save(buf, 'WEBP', quality=q, method=6)
            dec = Image.open(io.BytesIO(buf.getvalue()))
            lmax, _ = lum_max(dec)
            canali = np.asarray(dec.convert('RGB')).reshape(-1, 3).max(axis=0)
            if lmax > LMAX or any(int(c) > t for c, t in zip(canali, BIANCO)):
                scala -= 0.005; continue
            if buf.tell() > budget and q > 50:
                q -= 4; continue
            break
        open(f'{OUT}/{nome}-{w}.webp', 'wb').write(buf.getvalue())
```

## Appendice B: verifica (`verifica.py`)

```python
import glob, os, numpy as np
from PIL import Image
D = 'concepts/13-contropelo/src/pages/concepts/contropelo/assets/foto'
def lin(a):
    a = a / 255.0; return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
P = np.array([0xFA, 0xFA, 0xF6]); S = np.array([0x23, 0x2A, 0x2C])
L = lambda c: 0.2126 * lin(c[..., 0]) + 0.7152 * lin(c[..., 1]) + 0.0722 * lin(c[..., 2])
for f in sorted(glob.glob(D + '/*.webp')):
    a = np.asarray(Image.open(f).convert('RGB'), dtype=np.float64)
    v = np.rint(a * (1 - 0.66) + S * 0.66)            # velatura specchio 66%, in sRGB
    cr = (L(P.astype(float)) + 0.05) / (L(v).max() + 0.05)
    print(os.path.basename(f), 'Lmax %.4f' % L(a).max(),
          'canali', a.reshape(-1, 3).max(axis=0).astype(int), 'pennarello %.2f:1' % cr,
          'ok' if L(a).max() <= 0.419 and (a.reshape(-1, 3).max(axis=0) <= [167, 175, 174]).all() else 'SUPERA')
```
