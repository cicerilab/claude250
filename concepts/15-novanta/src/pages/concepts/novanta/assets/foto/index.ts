/**
 * NOVANTA · foto (art-director)
 *
 * Piano B del creative-director (§4.5) attivo: nessuna foto. La ricerca del
 * 26/09/2026 non ha trovato uno studio di fisioterapia VUOTO, credibile e con
 * licenza libera (dettaglio in docs/art-director.md §6). Le sezioni leggono
 * `FOTO[chiave]` e, se manca, mostrano il numero dei gradi più grande e il
 * testo: nessun riquadro vuoto, nessun segnaposto.
 *
 * Per aggiungere una foto al porting: file 640w e 1200w .webp in questa
 * cartella, import con `?url`, voce qui sotto con autore e URL della pagina.
 */

export type ChiaveFoto = 'studio' | 'attrezzi' | 'ingresso';

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
}

export const FOTO: Readonly<Partial<Record<ChiaveFoto, FotoNovanta>>> = {};

/** true se almeno una foto è presente: le sezioni scelgono il layout. */
export const CI_SONO_FOTO: boolean = Object.keys(FOTO).length > 0;
