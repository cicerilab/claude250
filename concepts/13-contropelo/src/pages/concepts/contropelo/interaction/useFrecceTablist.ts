/**
 * CONTROPELO · la tablist dei tre barbieri, da tastiera.
 *
 * Pattern "tabs" con attivazione automatica (ux-architect §8.5):
 * - ←/→ spostano il fuoco sul barbiere accanto e girano la parete;
 * - Home/Fine vanno al primo/ultimo;
 * - la parete non gira in tondo (creative-director §3 A, ux §2.1): da Mattia
 *   non si va a sinistra, da Samir non si va a destra. Le frecce si fermano
 *   ai bordi, come lo sguardo sulla parete;
 * - tabindex mobile: solo il barbiere attivo è nel giro del Tab;
 * - Tab dalla tab attiva entra nel pannello (ordine DOM dello scaffold).
 *
 * Ogni cambio passa da `chiediSpecchio` (un cambio ogni 500 ms al massimo,
 * vince l'ultima richiesta). Il fuoco si sposta subito sul nome scelto; la
 * parete lo raggiunge appena il limite lo consente.
 *
 * Uso (section-builder-mensola):
 *
 *   const tabs = useFrecceTablist();
 *   <div {...tabs.tablistProps} aria-label={MENSOLA.poltrone} className="ctp-mensola__barbieri">
 *     {BARBIERI.map((b, i) => (
 *       <button key={b.id} {...tabs.tabProps(i)} className="ctp-mensola__barbiere ctp-ix-tab">
 *         {b.nome}
 *       </button>
 *     ))}
 *   </div>
 */

import { useCallback, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { useContropelo, type IndiceSpecchio } from '../state/store';
import { chiediSpecchio, indiceValido } from './cadenza';
import { mettiFuoco } from './fuoco';

export const NUMERO_SPECCHI = 3;

export interface PropsTablist {
  role: 'tablist';
  'aria-orientation': 'horizontal';
}

export interface PropsTab {
  id: string;
  type: 'button';
  role: 'tab';
  'aria-selected': boolean;
  'aria-controls': string;
  tabIndex: 0 | -1;
  'data-ctp-tab': number;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  ref: (el: HTMLButtonElement | null) => void;
}

export interface FrecceTablist {
  tablistProps: PropsTablist;
  tabProps: (i: IndiceSpecchio | number) => PropsTab;
}

/** Id stabili (tech-architect §5.2). */
export const idTab = (i: number): string => `ctp-tab-${i}`;
export const idPannello = (i: number): string => `ctp-specchio-${i}`;

function indiceDaBottone(el: HTMLElement): IndiceSpecchio {
  return indiceValido(Number(el.dataset.ctpTab ?? '0'));
}

export function useFrecceTablist(): FrecceTablist {
  const specchio = useContropelo((s) => s.specchio);
  const tabs = useRef<(HTMLButtonElement | null)[]>([null, null, null]);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const da = indiceDaBottone(e.currentTarget);
    let verso: number;
    switch (e.key) {
      case 'ArrowRight':
        verso = da + 1;
        break;
      case 'ArrowLeft':
        verso = da - 1;
        break;
      case 'Home':
        verso = 0;
        break;
      case 'End':
        verso = NUMERO_SPECCHI - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const a = indiceValido(verso);
    if (a === da) return;
    mettiFuoco(tabs.current[a]);
    chiediSpecchio(a, 'tastiera');
  }, []);

  const onClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    chiediSpecchio(indiceDaBottone(e.currentTarget), 'tab');
  }, []);

  const tabProps = (i: IndiceSpecchio | number): PropsTab => {
    const k = indiceValido(i);
    const selezionato = k === specchio;
    return {
      id: idTab(k),
      type: 'button',
      role: 'tab',
      'aria-selected': selezionato,
      'aria-controls': idPannello(k),
      tabIndex: selezionato ? 0 : -1,
      'data-ctp-tab': k,
      onKeyDown,
      onClick,
      ref: (el: HTMLButtonElement | null) => {
        tabs.current[k] = el;
      },
    };
  };

  return {
    tablistProps: { role: 'tablist', 'aria-orientation': 'horizontal' },
    tabProps,
  };
}
