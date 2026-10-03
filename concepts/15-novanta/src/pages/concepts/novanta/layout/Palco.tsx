/**
 * NOVANTA · il Palco: l'area di lettura del contenuto (tech-architect §3,
 * ux-architect §2.2, §2.3, interaction-designer §5).
 *
 *   <div class="nov-palco" data-nov-ix-scorre>
 *     <ol id="nov-angoli" class="nov-angoli">{children}</ol>
 *   </div>
 *
 * In vista quadrante i sette `li` sono sovrapposti nella stessa area (uno
 * solo visibile) e il Palco scorre da solo se il contenuto è lungo
 * (`overflow: auto`, `touch-action: pan-y`: `data-nov-ix-scorre` è il gancio
 * di interaction.css e della rotella, che prima scorre qui e poi ruota). In
 * vista elenco è un flusso verticale normale. Tutto in layout.css.
 *
 * Il numero grande dei gradi che scorre, la linea di lettura e la maschera
 * sfumata sono del section-builder del quadrante (LetturaGradi.tsx) e del
 * CSS di layout: il Palco resta un contenitore senza stato.
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
