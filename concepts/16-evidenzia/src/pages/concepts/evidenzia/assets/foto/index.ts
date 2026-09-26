// Foto degli annunci di EVIDENZIA (photo-editor).
// Retino del foglio: PNG indicizzati a 3 colori (carta trasparente, retino
// #8F8B82, nero) generati da scripts/retino.py. Colore della scheda: webp 3:2
// in due misure (1600 e 800 px). Autori, licenze e link originali sono in
// docs/photo-editor.md; i crediti qui sotto vanno nel piede del foglio.
// Gli annunci senza voce in FOTO sono tipografici anche nella scheda
// ("Foto in agenzia, su richiesta", piano B del creative-director 4.6).

import r152 from './152-retino.png';
import r118 from './118-retino.png';
import r237 from './237-retino.png';
import r171a from './171-retino-1.png';
import r171b from './171-retino-2.png';

import c152a from './152-1.webp';
import c152a8 from './152-1-800.webp';
import c152b from './152-2.webp';
import c152b8 from './152-2-800.webp';
import c152c from './152-3.webp';
import c152c8 from './152-3-800.webp';
import c152d from './152-4.webp';
import c152d8 from './152-4-800.webp';
import c152e from './152-5.webp';
import c152e8 from './152-5-800.webp';
import c152f from './152-6.webp';
import c152f8 from './152-6-800.webp';

import c118a from './118-1.webp';
import c118a8 from './118-1-800.webp';
import c118b from './118-2.webp';
import c118b8 from './118-2-800.webp';
import c118c from './118-3.webp';
import c118c8 from './118-3-800.webp';
import c118d from './118-4.webp';
import c118d8 from './118-4-800.webp';

import c237a from './237-1.webp';
import c237a8 from './237-1-800.webp';
import c237b from './237-2.webp';
import c237b8 from './237-2-800.webp';
import c237c from './237-3.webp';
import c237c8 from './237-3-800.webp';

import c171a from './171-1.webp';
import c171a8 from './171-1-800.webp';
import c171b from './171-2.webp';
import c171b8 from './171-2-800.webp';
import c171c from './171-3.webp';
import c171c8 from './171-3-800.webp';
import c171d from './171-4.webp';
import c171d8 from './171-4-800.webp';
import c171e from './171-5.webp';
import c171e8 from './171-5-800.webp';

/** Id dell'annuncio, es. "rif-152" (stesso tipo di Annuncio.id). */
type IdAnnuncio = string;

export interface Credito {
  autore: string;
  url: string;
  licenza: string;
  licenzaUrl: string;
}

export interface FotoRetino {
  src: string;
  w: number;
  h: number;
}

export interface FotoColore {
  src: string;
  src800: string;
  w: number;
  h: number;
  alt: string;
}

export interface FotoAnnuncio {
  /** Prima (o unica) foto a retino del foglio. Formati T e F. */
  retino?: FotoRetino;
  /** Seconda foto a retino, solo per il formato a riquadro (R). */
  retino2?: FotoRetino;
  /** 0..6 foto a colori della scheda; la prima e' la stessa della retino. */
  colore: readonly FotoColore[];
  crediti: readonly Credito[];
}

const W = 1600;
const H = 1067;

const CC_BY = { licenza: 'CC BY 2.0', licenzaUrl: 'https://creativecommons.org/licenses/by/2.0/' } as const;
const CC_BY_SA = { licenza: 'CC BY-SA 2.0', licenzaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/' } as const;

const SISSI: Credito = { autore: 'pj.sissi', url: 'https://www.flickr.com/photos/29286352@N02/', ...CC_BY };
const TOPRURAL: Credito = { autore: 'Toprural', url: 'https://www.flickr.com/photos/8920684@N05/', ...CC_BY_SA };

export const FOTO: Partial<Record<IdAnnuncio, FotoAnnuncio>> = {
  'rif-152': {
    retino: { src: r152, w: 536, h: 400 },
    colore: [
      { src: c152a, src800: c152a8, w: W, h: H, alt: 'Villetta a un piano con intonaco bianco, portico su pilastri a sinistra e giardino davanti' },
      { src: c152b, src800: c152b8, w: W, h: H, alt: 'La casa vista da lontano, in fondo a un prato largo chiuso da una staccionata' },
      { src: c152c, src800: c152c8, w: W, h: H, alt: 'Il portico con pavimento in cotto, vasi di piante e scuri in legno scuro' },
      { src: c152d, src800: c152d8, w: W, h: H, alt: 'Soggiorno con caminetto, divani chiari e scala in legno che sale al soppalco' },
      { src: c152e, src800: c152e8, w: W, h: H, alt: 'Camera con due letti singoli a quadri verdi, comò e quadretti alle pareti' },
      { src: c152f, src800: c152f8, w: W, h: H, alt: "Il lato del portico con il timpano in legno, in autunno, con le foglie sul prato" },
    ],
    crediti: [SISSI],
  },
  'rif-118': {
    retino: { src: r118, w: 536, h: 336 },
    colore: [
      { src: c118a, src800: c118a8, w: W, h: H, alt: 'Rustico in sasso a due piani coperto di vite americana rossa, in mezzo al prato' },
      { src: c118b, src800: c118b8, w: W, h: H, alt: 'Scala esterna in legno che sale al ballatoio sotto il tetto, muro in sasso e porta in legno' },
      { src: c118c, src800: c118c8, w: W, h: H, alt: 'Il rustico visto dal lato corto, con la nebbia sulle colline dietro' },
      { src: c118d, src800: c118d8, w: W, h: H, alt: 'Il timpano del rustico con le finestre piccole e il prato davanti' },
    ],
    crediti: [SISSI],
  },
  'rif-237': {
    retino: { src: r237, w: 536, h: 336 },
    colore: [
      { src: c237a, src800: c237a8, w: W, h: H, alt: 'Testa di schiera con muri in sasso e intonaco rosso, portico e cortile in porfido' },
      { src: c237b, src800: c237b8, w: W, h: H, alt: 'Il giardino sul retro: prato, siepi e alberi, con il marciapiede in cotto' },
      { src: c237c, src800: c237c8, w: W, h: H, alt: "Ingresso con pavimento in cotto, divano a fiori e porta a vetri con inferriata" },
    ],
    crediti: [TOPRURAL],
  },
  'rif-171': {
    retino: { src: r171a, w: 516, h: 320 },
    retino2: { src: r171b, w: 516, h: 320 },
    colore: [
      { src: c171a, src800: c171a8, w: W, h: H, alt: 'Casa colonica gialla a tre piani con scuri in legno e rose rampicanti sulla facciata' },
      { src: c171b, src800: c171b8, w: W, h: H, alt: 'Il giardino con il prato e gli alberi davanti alla casa' },
      { src: c171c, src800: c171c8, w: W, h: H, alt: 'Cucina con tavolo apparecchiato, credenza azzurra e piattaia appesa al muro' },
      { src: c171d, src800: c171d8, w: W, h: H, alt: 'Soggiorno con travi a vista, pavimento in cotto, divano e poltrona chiari' },
      { src: c171e, src800: c171e8, w: W, h: H, alt: 'Camera con letto matrimoniale in legno, porta verde e pavimento in legno' },
    ],
    crediti: [TOPRURAL],
  },
};

export const CREDITI: readonly Credito[] = [SISSI, TOPRURAL];
