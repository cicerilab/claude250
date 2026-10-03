/**
 * NOVANTA · il Palco: l'area di lettura del contenuto (tech-architect §3,
 * ux-architect §2.2, §2.3, interaction-designer §5).
 *
 *   <div class="nov-palco" data-nov-ix-scorre>
 *     <ol id="nov-angoli" class="nov-angoli">{children}</ol>
 *   </div>
 *
 * In vista quadrante i sette `li` sono sovrapposti nella stessa area (uno
 * solo visibile) e il CORPO dell'angolo attivo scorre se è lungo (vedi
 * Angolo.tsx): il titolo resta sulla linea di lettura e il testo non passa
 * mai sotto il numero grande. `data-nov-ix-scorre` (interaction.css): sul
 * Palco `touch-action: pan-y`, sul corpo anche lo scroll della rotella, che
 * prima scorre il corpo e poi ruota il braccio. In vista elenco è un flusso
 * verticale normale. Tutto in layout.css.
 */

import type { ReactNode } from 'react';
import { ID_ANGOLI } from '../core/ids';

export interface PalcoProps {
  children: ReactNode;
}

export default function Palco({ children }: PalcoProps) {
  return (
    <div className="nov-palco" data-nov-ix-scorre="">
      <ol id={ID_ANGOLI} className="nov-angoli">
        {children}
      </ol>
    </div>
  );
}
