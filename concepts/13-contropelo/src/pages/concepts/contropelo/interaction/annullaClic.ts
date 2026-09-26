/**
 * CONTROPELO · annullare il clic che segue un trascinamento.
 *
 * Regola (ux-architect §8.3, §4.1): un trascinamento oltre 8 px non attiva
 * mai l'elemento su cui è iniziato. Chi pulisce il vetro partendo da un
 * trattino libero, o chi fa uno swipe sulla mensola partendo dal nome di un
 * barbiere, non deve aprire la riga di scrittura né cambiare tab per sbaglio.
 *
 * Meccanica: chi gestisce il gesto chiama `arma()` al rilascio di un
 * trascinamento. Il primo `click` che arriva sull'elemento (in fase di
 * cattura, prima di React) viene fermato. L'armatura scade dopo
 * `SCADENZA_MS` e si disarma a ogni nuovo `pointerdown`: un tocco vero dopo
 * uno swipe (quando il browser non ha mandato nessun clic) funziona sempre.
 *
 * Nessun accesso al browser a livello di modulo.
 */

/** Distanza oltre la quale un gesto è un trascinamento e non più un tocco (px CSS). */
export const SOGLIA_TRASCINAMENTO_PX = 8;

/** Quanto resta armato l'annullamento dopo il rilascio (ms). */
const SCADENZA_MS = 600;

export interface AnnullaClic {
  /** Il prossimo clic sull'elemento (entro 600 ms) va ignorato. */
  arma(): void;
  /** Disarma subito (nuovo gesto). */
  disarma(): void;
  /** Stacca i listener. */
  stacca(): void;
}

export function creaAnnullaClic(el: HTMLElement): AnnullaClic {
  let scadenza = 0;

  const suClic = (e: MouseEvent): void => {
    if (scadenza === 0) return;
    const ora = performance.now();
    const valido = ora <= scadenza;
    scadenza = 0;
    // detail === 0: clic da tastiera o da tecnologia assistiva, mai annullato.
    if (valido && e.detail !== 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const suPointerDown = (): void => {
    scadenza = 0;
  };

  el.addEventListener('click', suClic, true);
  el.addEventListener('pointerdown', suPointerDown, true);

  return {
    arma(): void {
      scadenza = performance.now() + SCADENZA_MS;
    },
    disarma(): void {
      scadenza = 0;
    },
    stacca(): void {
      el.removeEventListener('click', suClic, true);
      el.removeEventListener('pointerdown', suPointerDown, true);
      scadenza = 0;
    },
  };
}
