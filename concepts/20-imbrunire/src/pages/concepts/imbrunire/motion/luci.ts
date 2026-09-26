/**
 * IMBRUNIRE · accensione interrotta.
 *
 * L'accensione iniziale è fatta di transizioni CSS con `transition-delay`
 * diverso per cella (CD §6.4, tech-architect §2.2). Se il visitatore tocca
 * qualcosa prima della fine, le luci ancora spente devono accendersi
 * **tutte insieme in una sola dissolvenza** (ux §3). Cambiare il ritardo in
 * CSS non basta: una transizione già creata tiene il suo ritardo. Qui si
 * prendono le transizioni ancora in attesa e le si fa partire adesso, tutte
 * nello stesso istante: un solo cambio per l'intera sezione.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { scena } from '../core/scena';

function eTransizioneOpacita(a: Animation): a is CSSTransition {
  return typeof CSSTransition !== 'undefined' && a instanceof CSSTransition && a.transitionProperty === 'opacity';
}

/**
 * Fa partire subito le accensioni ancora in attesa del loro ritardo.
 * Restituisce quante ne ha anticipate (0 se la sequenza era già finita).
 * La chiama lo store (azione di selezione o apertura di una stanza durante
 * `accensione: 'in-corso'`) prima di passare ad `accensione: 'fatta'`.
 * Le transizioni già partite continuano: nessuna salta.
 */
export function anticipaAccensione(): number {
  const palazzo = scena.palazzo();
  if (palazzo === null || typeof palazzo.getAnimations !== 'function') return 0;
  let anticipate = 0;
  for (const animazione of palazzo.getAnimations({ subtree: true })) {
    if (!eTransizioneOpacita(animazione)) continue;
    const effetto = animazione.effect;
    if (effetto === null) continue;
    const tempi = effetto.getComputedTiming();
    const ritardo = typeof tempi.delay === 'number' ? tempi.delay : 0;
    const locale = typeof tempi.localTime === 'number' ? tempi.localTime : null;
    if (locale === null || ritardo <= 0 || locale >= ritardo) continue;
    animazione.currentTime = ritardo;
    anticipate += 1;
  }
  return anticipate;
}
