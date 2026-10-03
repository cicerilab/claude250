/**
 * CONTROPELO · foto del riflesso (photo-editor, ondata 2)
 *
 * Tre foto vere di barberie (mai parrucchieri), una per specchio, nell'ordine
 * di BARBIERI in content/testi.ts: 0 Mattia "Il listino", 1 Denis "La barba",
 * 2 Samir "Dove e quando". Fonte: Wikimedia Commons (Unsplash bloccato
 * dall'anti-bot, vedi docs/photo-editor.md). Licenze CC BY-SA: attribuzione
 * obbligatoria nel pannello Informazioni, con licenza e "modificata".
 *
 * Già trattate a build-time con la ricetta dell'art-director (tokens.ts
 * RIFLESSO): specchiate in orizzontale, saturazione 60%, livelli con bianco
 * d'uscita #A7AFAE, sfocatura gaussiana 1,5 px (1600) / 0,75 px (800), webp.
 * Nessun filtro a runtime; la velatura #232A2C al 66% la mette il CSS.
 * Luminanza relativa massima misurata sui webp decodificati: tutte <= 0,416
 * (tetto 0,419), dettaglio per file in `luminanzaMax` e nel doc.
 *
 * Posizioni (`object-position` sulla foto GIÀ specchiata):
 * - `posizione`: specchio largo (>= 900 px, vetro circa 1,7:1 orizzontale);
 * - `posizioneStretta`: specchio stretto e verticale (tablet e telefono,
 *   circa 0,7-0,8:1), sceglie la parte che regge da sola in un taglio alto.
 */

import specchio1a800 from './specchio-1-800.webp';
import specchio1a1600 from './specchio-1-1600.webp';
import specchio2a800 from './specchio-2-800.webp';
import specchio2a1600 from './specchio-2-1600.webp';
import specchio3a800 from './specchio-3-800.webp';
import specchio3a1600 from './specchio-3-1600.webp';

export interface FotoSpecchio {
  /** Indice dello specchio (0, 1, 2), come BARBIERI. */
  readonly specchio: 0 | 1 | 2;
  /** Cosa si vede nel riflesso (per i doc e per chi scrive i testi, non per alt: le foto sono decorative). */
  readonly soggetto: string;
  /** URL della versione larga 800 px. */
  readonly src800: string;
  /** URL della versione larga 1600 px. */
  readonly src1600: string;
  /** "url800 800w, url1600 1600w". */
  readonly srcset: string;
  /** Misure intrinseche della 1600 (per width/height e aspect-ratio). */
  readonly larghezza: number;
  readonly altezza: number;
  /** Misure intrinseche della 800. */
  readonly larghezza800: number;
  readonly altezza800: number;
  /** object-position sullo specchio largo (>= 900 px). */
  readonly posizione: string;
  /** object-position sullo specchio stretto e verticale (< 900 px). */
  readonly posizioneStretta: string;
  /** Autore come lo chiede la licenza. */
  readonly autore: string;
  /** Pagina della foto su Wikimedia Commons (link del credito). */
  readonly url: string;
  readonly fonte: 'Wikimedia Commons';
  readonly licenza: 'CC BY-SA 2.0' | 'CC BY-SA 4.0';
  readonly licenzaUrl: string;
  /** Cosa è stato cambiato rispetto all'originale (obbligatorio per CC BY-SA). */
  readonly modifiche: string;
  /** Luminanza relativa WCAG massima misurata: [1600, 800]. Tetto 0,419. */
  readonly luminanzaMax: readonly [number, number];
}

const MODIFICHE = 'specchiata, desaturata, luci abbassate, sfocata';

export const FOTO_SPECCHI: readonly [FotoSpecchio, FotoSpecchio, FotoSpecchio] = [
  {
    specchio: 0,
    soggetto: 'il salone dalla prima poltrona: poltrone da barbiere in fila davanti agli specchi, mensole con flaconi, pavimento in legno',
    src800: specchio1a800,
    src1600: specchio1a1600,
    srcset: `${specchio1a800} 800w, ${specchio1a1600} 1600w`,
    larghezza: 1600,
    altezza: 1200,
    larghezza800: 800,
    altezza800: 600,
    posizione: '50% 80%',
    posizioneStretta: '32% 55%',
    autore: 'Palickap',
    url: 'https://commons.wikimedia.org/wiki/File:Lucca,_Swing_Hair_Shave.jpg',
    fonte: 'Wikimedia Commons',
    licenza: 'CC BY-SA 4.0',
    licenzaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    modifiche: MODIFICHE,
    luminanzaMax: [0.4132, 0.4035],
  },
  {
    specchio: 1,
    soggetto: 'una rasatura col rasoio a mano libera: il barbiere chino sul cliente sdraiato in poltrona, specchi e bancone dietro',
    src800: specchio2a800,
    src1600: specchio2a1600,
    srcset: `${specchio2a800} 800w, ${specchio2a1600} 1600w`,
    larghezza: 1600,
    altezza: 1081,
    larghezza800: 800,
    altezza800: 541,
    posizione: '50% 45%',
    posizioneStretta: '57% 50%',
    autore: 'Leonora Enking',
    url: 'https://commons.wikimedia.org/wiki/File:A_close_shave_in_Antigua_Guatemala.jpg',
    fonte: 'Wikimedia Commons',
    licenza: 'CC BY-SA 2.0',
    licenzaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    modifiche: MODIFICHE,
    luminanzaMax: [0.3892, 0.4068],
  },
  {
    specchio: 2,
    soggetto: 'il fondo del salone: specchio sopra il lavandino che riflette la vetrina sulla via, orologio, poltrone vuote in fila',
    src800: specchio3a800,
    src1600: specchio3a1600,
    srcset: `${specchio3a800} 800w, ${specchio3a1600} 1600w`,
    larghezza: 1600,
    altezza: 1067,
    larghezza800: 800,
    altezza800: 533,
    posizione: '50% 50%',
    posizioneStretta: '28% 50%',
    autore: 'Ramón Peco',
    url: 'https://commons.wikimedia.org/wiki/File:Barber_shop_Porto.jpg',
    fonte: 'Wikimedia Commons',
    licenza: 'CC BY-SA 2.0',
    licenzaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    modifiche: MODIFICHE,
    luminanzaMax: [0.4152, 0.3983],
  },
] as const;

/** `sizes` consigliato dal tech-architect (§9.2). */
export const FOTO_SIZES = '(min-width: 900px) 88vw, 100vw';
