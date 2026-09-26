/**
 * NOVANTA · foto (photo-editor, ondata 2)
 *
 * Tre foto dello studio vuoto, nessuna persona e nessuna mano. Fonte:
 * Wikimedia Commons, serie "Praxis Ergotherapie Jürgen Renner" di
 * PantheraLeo1359531, licenza CC BY 4.0 (attribuzione obbligatoria nel piede
 * del concept). Ritagliate, ridimensionate e convertite in .webp: nessun altro
 * intervento; velatura albicocca e filtro li applica il CSS
 * (`FOTO_TRATTAMENTO` in styles/tokens.ts). Dettaglio in docs/photo-editor.md.
 *
 * Proporzioni: `studio` e `ingresso` 1:2 (striscia verticale a filo del bordo
 * destro su desktop), `attrezzi` 2:3, `ingresso.fascia` 12:5 (fascia mobile a
 * 180°, 335 × 140).
 */

import studio640 from './studio-640.webp?url';
import studio1200 from './studio-1200.webp?url';
import attrezzi640 from './attrezzi-640.webp?url';
import attrezzi1200 from './attrezzi-1200.webp?url';
import ingresso640 from './ingresso-640.webp?url';
import ingresso1200 from './ingresso-1200.webp?url';
import ingressoFascia640 from './ingresso-fascia-640.webp?url';
import ingressoFascia1200 from './ingresso-fascia-1200.webp?url';

export type ChiaveFoto = 'studio' | 'attrezzi' | 'ingresso';

/** Variante con un altro taglio della stessa foto (stessa licenza e autore). */
export interface TaglioFoto {
  readonly src: string;
  readonly srcset: string;
  readonly w: number;
  readonly h: number;
}

export interface FotoNovanta {
  /** URL della versione 1200w (import `?url`). */
  readonly src: string;
  /** "url640 640w, url1200 1200w". */
  readonly srcset: string;
  /** Misure intrinseche della versione 1200w (per width/height e aspect-ratio). */
  readonly w: number;
  readonly h: number;
  /** Testo alternativo descrittivo, in italiano. */
  readonly alt: string;
  readonly autore: string;
  /** Pagina della foto sulla fonte (licenza e attribuzione). */
  readonly url: string;
  /** Licenza, da citare nel piede insieme all'autore. */
  readonly licenza: string;
  /** Taglio orizzontale 12:5 per la fascia mobile (solo dove serve). */
  readonly fascia?: TaglioFoto;
  /** Punto di interesse per `object-position` quando la striscia taglia. */
  readonly fuoco: string;
}

const AUTORE = 'PantheraLeo1359531';
const LICENZA = 'CC BY 4.0';

export const FOTO: Readonly<Partial<Record<ChiaveFoto, FotoNovanta>>> = {
  studio: {
    src: studio1200,
    srcset: `${studio640} 640w, ${studio1200} 1200w`,
    w: 1200,
    h: 2400,
    alt: 'Una stanza dello studio vuota: il lettino con il cuscino per il viso e un rullo, la luce della finestra e due piante sul davanzale.',
    autore: AUTORE,
    url: 'https://commons.wikimedia.org/wiki/File:Praxis_Ergotherapie_J%C3%BCrgen_Renner_20231018_HOF00895-HDR_RAW-Export.png',
    licenza: LICENZA,
    fuoco: '40% 45%',
  },
  attrezzi: {
    src: attrezzi1200,
    srcset: `${attrezzi640} 640w, ${attrezzi1200} 1200w`,
    w: 1200,
    h: 1801,
    alt: 'Attrezzi appoggiati al muro: un tappetino arrotolato, un cuscino di equilibrio, le tavolette propriocettive e un rullo.',
    autore: AUTORE,
    url: 'https://commons.wikimedia.org/wiki/File:Praxis_Ergotherapie_J%C3%BCrgen_Renner_20231018_HOF00850-HDR_RAW-Export_cens.png',
    licenza: LICENZA,
    fuoco: '45% 55%',
  },
  ingresso: {
    src: ingresso1200,
    srcset: `${ingresso640} 640w, ${ingresso1200} 1200w`,
    w: 1200,
    h: 2400,
    alt: "L'angolo d'attesa dello studio: una poltrona grigia accanto a una lampada di carta accesa.",
    autore: AUTORE,
    url: 'https://commons.wikimedia.org/wiki/File:Praxis_Ergotherapie_J%C3%BCrgen_Renner_20231018_HOF00990-HDR_RAW-Export.png',
    licenza: LICENZA,
    fascia: {
      src: ingressoFascia1200,
      srcset: `${ingressoFascia640} 640w, ${ingressoFascia1200} 1200w`,
      w: 1200,
      h: 500,
    },
    fuoco: '55% 55%',
  },
};

/** true se almeno una foto è presente: le sezioni scelgono il layout. */
export const CI_SONO_FOTO: boolean = Object.keys(FOTO).length > 0;

/** Riga di crediti per il piede del concept (attribuzione CC BY 4.0). */
export const CREDITI_FOTO =
  'Foto: PantheraLeo1359531, Wikimedia Commons, CC BY 4.0 (ritagliate).' as const;
