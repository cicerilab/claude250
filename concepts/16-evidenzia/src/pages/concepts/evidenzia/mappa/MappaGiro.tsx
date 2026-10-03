/**
 * EVIDENZIA · MappaGiro: STUB dello scaffold-engineer.
 * Proprietario da adesso: section-builder-mappa (docs/scaffold-engineer.md §6,
 * tech-architect §9.3).
 *
 * Contratto con sections/Giro (che la importa con `lazy(() => import('../../mappa'))`
 * dentro un `Suspense` con fallback il riquadro di carta): riceve le tappe
 * GIÀ calcolate (ordine e orari li calcola Giro/calcolo.ts); non calcola
 * niente. Lo stato di caricamento/errore va nello store con `impostaMappa()`.
 * Leaflet si importa SOLO dentro questa cartella (chunk `leaflet`).
 */
import type { ZonaId } from '../content/zone';
import type { IdAnnuncio } from '../state/store';

export interface TappaMappa {
  readonly id: IdAnnuncio;
  /** 1-4, il numero nel marcatore */
  readonly posizione: number;
  readonly zona: ZonaId;
  /** punto della zona + SCOSTAMENTI[id] (content/zone.ts) */
  readonly lat: number;
  readonly lng: number;
  /** "9:10" (orario già formattato) o minuti dalla mezzanotte */
  readonly arrivo: string | number;
}

export interface MappaGiroProps {
  readonly tappe: readonly TappaMappa[];
  /** true: si parte dall'agenzia (marcatore nero "A" e primo tratto del percorso) */
  readonly daAgenzia: boolean;
  /** "09:00" */
  readonly partenza: string;
}

export default function MappaGiro({ tappe, daAgenzia, partenza }: MappaGiroProps) {
  return (
    <div
      className="evd-mappa"
      data-tappe={tappe.length}
      data-da-agenzia={daAgenzia ? '1' : '0'}
      data-partenza={partenza}
    />
  );
}
