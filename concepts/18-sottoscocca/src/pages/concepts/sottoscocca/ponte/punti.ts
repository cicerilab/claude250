/**
 * SOTTOSCOCCA · registro dei bottoni-punto e loro scrittura nel DOM
 * (tech-architect §7).
 *
 * I punti toccabili sono `<button>` DOM dentro la sezione della loro quota
 * (sections/Punti/PuntiQuota.tsx), `position: fixed; left: 0; top: 0`, e si
 * muovono SOLO con `transform: translate3d(x, y, 0)` scritto qui, nella fase
 * `write`, da `runtime.punti[id]` (proiezione GL in `update`, o Fondale senza
 * GL). Scrittura solo se il punto si è spostato di almeno 0,5 px.
 *
 * Su ogni bottone registrato si scrive anche `data-ssc-punto-attivo`:
 * - "si": il ponte è alla quota del punto (entro 2 cm, anche durante
 *   l'assestamento) e la proiezione lo dà visibile;
 * - "no": altrimenti (in salita, dietro la camera, fuori finestra, senza
 *   coordinate sulla foto). Il CSS dei punti lo nasconde (`visibility:
 *   hidden`, così esce anche dalla tabulazione); l'elenco "Da qui si vede"
 *   resta sempre.
 * Le proprietà `translate` e `scale` restano libere per interaction.css.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import type { IdPunto, Quota } from '../content/lavori';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';

export const ATTR_PUNTO_ATTIVO = 'data-ssc-punto-attivo';
/** Distanza (cm) dalla quota entro cui il punto è "a quota". */
const TOLLERANZA_QUOTA_CM = 2;
/** Spostamento minimo (px) per riscrivere il transform. */
const SOGLIA_PX = 0.5;

interface VocePunto {
  readonly el: HTMLElement;
  readonly id: IdPunto;
  readonly quota: Quota;
  x: number;
  y: number;
  attivo: boolean | null;
}

const voci = new Set<VocePunto>();

/** Registra un bottone-punto. Restituisce la rimozione (da chiamare allo smontaggio). */
export function registraPunto(el: HTMLElement, id: IdPunto, quota: Quota): () => void {
  const voce: VocePunto = { el, id, quota, x: Number.NaN, y: Number.NaN, attivo: null };
  voci.add(voce);
  ticker.wake();
  return () => {
    voci.delete(voce);
  };
}

function scrivi(): void {
  const q = runtime.quota.valore;
  voci.forEach((v) => {
    const p = runtime.punti[v.id];
    const attivo = Math.abs(q - v.quota) <= TOLLERANZA_QUOTA_CM && p.visibile;
    if (attivo !== v.attivo) {
      v.el.setAttribute(ATTR_PUNTO_ATTIVO, attivo ? 'si' : 'no');
      v.attivo = attivo;
    }
    if (!attivo) return;
    if (Math.abs(p.x - v.x) < SOGLIA_PX && Math.abs(p.y - v.y) < SOGLIA_PX) return;
    v.x = p.x;
    v.y = p.y;
    v.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
  });
}

/** Solo Radice.tsx: registra la scrittura nella fase `write`. Restituisce lo smontaggio. */
export function avviaPunti(): () => void {
  return ticker.add(() => {
    scrivi();
    return false;
  }, 'write');
}
