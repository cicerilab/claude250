/**
 * SOTTOSCOCCA · Punti di una quota (section-builder-punti-lavoro).
 *
 * Stub dello scaffold con la FIRMA FINALE (tech-architect §7.1): lo importano
 * Gomme (quota 20), Freni (80) e Sottoscocca (180), che lavorano in parallelo.
 *
 *   import PuntiQuota from '../Punti/PuntiQuota';
 *   <PuntiQuota quota={80} etichette="al-focus" />
 *
 * Il builder rende un `<ul>` con un `<button>` per ogni punto di
 * `puntiDellaQuota(quota)`, registrati con `registraPunto(el, id, quota)` di
 * ponte/punti.ts (transform e `data-ssc-punto-attivo` li scrive lo scaffold),
 * roving tabindex con `useNavigaPunti`, scheda con `usePropsApriScheda`.
 */

import type { Quota } from '../../content/lavori';
import './punti.css';

export interface PropsPuntiQuota {
  readonly quota: Quota;
  /** 'sempre': etichette visibili; 'al-focus': solo con hover o fuoco (interaction.css). */
  readonly etichette: 'sempre' | 'al-focus';
}

export default function PuntiQuota({ quota, etichette }: PropsPuntiQuota) {
  return <ul className="ssc-punti" data-ssc-quota={quota} data-ssc-etichette={etichette} hidden />;
}
