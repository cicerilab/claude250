/**
 * SOTTOSCOCCA · il blocco "il tuo lavoro" usato con la tastiera.
 *
 * Contratto (creative-director 4.4, ux-architect 7.7):
 * - il blocco è un `<button>` con istruzioni visibili collegate da
 *   `aria-describedby` (testo del copywriter, due versioni: planning
 *   orizzontale e verticale); niente `role="application"`;
 * - NEL PARCHEGGIO: Invio lo mette nel primo buco libero (come il bottone
 *   "Primo buco libero"); Spazio resta il clic nativo del bottone;
 * - PIAZZATO, planning ORIZZONTALE (desktop): frecce sinistra/destra spostano
 *   di 10 minuti, su/giù cambiano ponte;
 *   planning VERTICALE (telefono, tempo dall'alto in basso): su/giù spostano
 *   di 10 minuti, sinistra/destra cambiano ponte. Così la freccia va sempre
 *   nella direzione in cui il blocco si muove sullo schermo;
 * - Pagina su / Pagina giù: giorno precedente / successivo;
 * - Home / Fine: inizio / fine del buco in cui si trova il blocco;
 * - Invio: conferma la posizione e porta il fuoco al primo campo dei dati
 *   (lo fa la sezione in `conferma`);
 * - Esc: riporta il blocco nel parcheggio;
 * - la ripetizione automatica del tasto è ammessa per le frecce (tenere
 *   premuto scorre di 10' in 10'); la sezione riceve `ripetuto` per annunciare
 *   solo la posizione finale (`annunciaFermo` qui sotto fa proprio questo);
 * - Ctrl, Alt e Cmd lasciano passare il tasto (comandi del browser e dei
 *   lettori di schermo); Maiusc+Tab e Tab escono normalmente.
 *
 * Ogni azione è della sezione (PonteLibero), che usa la logica pura di
 * planning.ts, salta i ponti non adatti annunciandolo e aggiorna lo store.
 * Per lo scivolamento visivo, prima di cambiare posizione la sezione chiama
 * `preparaAggancio()` di useTrascinaBlocco.
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { eTastoModificato } from './util';

/** Passo della tastiera sul tempo (uguale al passo di aggancio del planning). */
export const PASSO_TASTIERA_MINUTI = 10;
/** Dopo quanto dall'ultima ripetizione di una freccia si annuncia la posizione raggiunta. */
export const ANNUNCIO_FERMO_MS = 350;

export type LayoutPlanning = 'orizzontale' | 'verticale';

export interface InfoTasto {
  /** true se il tasto è tenuto premuto (ripetizione automatica). */
  readonly ripetuto: boolean;
}

export interface AzioniBloccoTastiera {
  /** Sposta il blocco di `minuti` (±10). */
  sposta(minuti: number, info: InfoTasto): void;
  /** Ponte precedente (-1) o successivo (+1), saltando quelli non adatti. */
  cambiaPonte(verso: -1 | 1, info: InfoTasto): void;
  /** Giorno precedente (-1) o successivo (+1) nella striscia. */
  cambiaGiorno(verso: -1 | 1, info: InfoTasto): void;
  /** Inizio o fine del buco corrente. */
  estremo(quale: 'inizio' | 'fine'): void;
  /** Invio sul blocco piazzato: conferma e porta il fuoco ai dati. */
  conferma(): void;
  /** Esc sul blocco piazzato: torna nel parcheggio. */
  parcheggia(): void;
  /** Invio sul blocco parcheggiato: primo buco libero. */
  primoBuco(): void;
}

export interface OpzioniBloccoTastiera {
  readonly layout: LayoutPlanning;
  /** true se il blocco è su una corsia (P4-P7), false se è nel parcheggio. */
  readonly piazzato: boolean;
  /** true durante l'invio e dopo il successo: nessun tasto fa niente. */
  readonly disabilitato?: boolean;
  readonly azioni: AzioniBloccoTastiera;
}

export interface BloccoTastiera {
  readonly onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

type Comando =
  | { readonly tipo: 'tempo'; readonly minuti: number }
  | { readonly tipo: 'ponte'; readonly verso: -1 | 1 }
  | { readonly tipo: 'giorno'; readonly verso: -1 | 1 }
  | { readonly tipo: 'estremo'; readonly quale: 'inizio' | 'fine' }
  | { readonly tipo: 'conferma' }
  | { readonly tipo: 'parcheggia' };

/** Tabella pura tasto → comando per un blocco piazzato. Esportata per i test e per le istruzioni. */
export function comandoPerTasto(tasto: string, layout: LayoutPlanning): Comando | null {
  const passo = PASSO_TASTIERA_MINUTI;
  if (layout === 'orizzontale') {
    if (tasto === 'ArrowLeft') return { tipo: 'tempo', minuti: -passo };
    if (tasto === 'ArrowRight') return { tipo: 'tempo', minuti: passo };
    if (tasto === 'ArrowUp') return { tipo: 'ponte', verso: -1 };
    if (tasto === 'ArrowDown') return { tipo: 'ponte', verso: 1 };
  } else {
    if (tasto === 'ArrowUp') return { tipo: 'tempo', minuti: -passo };
    if (tasto === 'ArrowDown') return { tipo: 'tempo', minuti: passo };
    if (tasto === 'ArrowLeft') return { tipo: 'ponte', verso: -1 };
    if (tasto === 'ArrowRight') return { tipo: 'ponte', verso: 1 };
  }
  if (tasto === 'PageUp') return { tipo: 'giorno', verso: -1 };
  if (tasto === 'PageDown') return { tipo: 'giorno', verso: 1 };
  if (tasto === 'Home') return { tipo: 'estremo', quale: 'inizio' };
  if (tasto === 'End') return { tipo: 'estremo', quale: 'fine' };
  if (tasto === 'Enter') return { tipo: 'conferma' };
  if (tasto === 'Escape') return { tipo: 'parcheggia' };
  return null;
}

export function useBloccoTastiera(opzioni: OpzioniBloccoTastiera): BloccoTastiera {
  const opz = useRef(opzioni);
  opz.current = opzioni;

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLElement>) => {
    const { azioni, disabilitato, layout, piazzato } = opz.current;
    if (disabilitato || eTastoModificato(e)) return;

    if (!piazzato) {
      // Nel parcheggio: solo Invio ha un significato proprio. Il resto (Spazio, Tab, frecce) resta del browser.
      if (e.key === 'Enter' && !e.shiftKey && !e.repeat) {
        e.preventDefault();
        azioni.primoBuco();
      }
      return;
    }

    const comando = comandoPerTasto(e.key, layout);
    if (!comando) return;
    // Maiusc cambia solo Tab (gestito dal browser): con le frecce si comporta come senza.
    const info: InfoTasto = { ripetuto: e.repeat };
    switch (comando.tipo) {
      case 'tempo':
        e.preventDefault();
        azioni.sposta(comando.minuti, info);
        return;
      case 'ponte':
        e.preventDefault();
        if (!e.repeat) azioni.cambiaPonte(comando.verso, info);
        return;
      case 'giorno':
        e.preventDefault();
        if (!e.repeat) azioni.cambiaGiorno(comando.verso, info);
        return;
      case 'estremo':
        e.preventDefault();
        azioni.estremo(comando.quale);
        return;
      case 'conferma':
        if (e.repeat) return;
        e.preventDefault();
        azioni.conferma();
        return;
      case 'parcheggia':
        if (e.repeat) return;
        // Esc qui è del blocco: non deve chiudere anche altro.
        e.preventDefault();
        e.stopPropagation();
        azioni.parcheggia();
        return;
    }
  }, []);

  return { onKeyDown };
}

/**
 * Annuncio "a fermo" per le frecce tenute premute: `annuncia(testo)` a ogni
 * passo, ma il testo arriva a `scrivi` solo quando i tasti si fermano per
 * ANNUNCIO_FERMO_MS (o subito, se il passo non era ripetuto). Evita che il
 * lettore di schermo metta in coda venti posizioni.
 *
 *   const annunciaFermo = useAnnuncioFermo(setAnnuncio);
 *   sposta: (m, info) => { ...; annunciaFermo(frase, info.ripetuto); }
 */
export function useAnnuncioFermo(scrivi: (testo: string) => void): (testo: string, ripetuto: boolean) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scriviRef = useRef(scrivi);
  scriviRef.current = scrivi;

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
    },
    [],
  );

  return useCallback((testo: string, ripetuto: boolean) => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    if (!ripetuto) {
      scriviRef.current(testo);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      scriviRef.current(testo);
    }, ANNUNCIO_FERMO_MS);
  }, []);
}
