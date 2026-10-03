/**
 * CONTROPELO · "ripassa lo straccio" e la raccolta delle righe (motion-designer).
 *
 * Due hook per la lista (section-builder-lista) e per le facce su mobile
 * (section-builder-parete / vetro):
 *
 * - `useStraccio`: le fasi 'fermo' → 'via' → 'riscrive' → 'fermo' con cui
 *   una lista (o una faccia) si cancella con lo straccio (400 ms) e si
 *   riscrive riga per riga (60 ms di sfasamento, 260 ms per riga). Il
 *   cambio di dati avviene tra 'via' e 'riscrive', dentro il callback che
 *   il builder passa a `avvia`. Due stracci non partono mai a meno di 500
 *   ms l'uno dall'altro (anti-lampeggio, ux 8.12): tocchi a raffica su
 *   "domani →" tengono solo l'ultimo. Con riduzione del movimento: 100 ms
 *   di uscita + 100 ms di entrata, senza righe.
 *
 * - `useRaccolta`: quando si apre la riga di scrittura, le righe lontane
 *   svaniscono (180 ms) e quelle vicine si stringono con un FLIP (300 ms,
 *   solo transform, misurato una volta). Chiudendo, tornano (220 ms).
 *
 * Le classi CSS sono in motion.css (ctp-mov-straccio*, ctp-mov-riga*,
 * ctp-mov-raccolta*, ctp-mov-flip*). I tempi in tempi.ts.
 * Nessun requestAnimationFrame proprio: il "frame dopo" del FLIP e della
 * riscrittura si prende con un `setTimeout(0)` dopo una lettura forzata di
 * layout (`offsetWidth`), che fa partire una transizione CSS senza toccare
 * il ticker (tech-architect §12: nessun rAF fuori dal ticker).
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useContropelo } from '../state/store';
import { TEMPI, durataRiscrittura, passoRiga } from './tempi';

export type FaseStraccio = 'fermo' | 'via' | 'riscrive';

export interface Straccio {
  /** La fase corrente. */
  fase: FaseStraccio;
  /** true da quando lo straccio parte a quando l'ultima riga è scritta. */
  inCorso: boolean;
  /**
   * Cancella, cambia i dati (`cambia`, chiamato tra 'via' e 'riscrive'),
   * riscrive. Se uno straccio è partito da meno di 500 ms, questa
   * richiesta aspetta e sostituisce quelle in attesa.
   */
  avvia(cambia: () => void): void;
  /** Classe da mettere sul contenitore (`ctp-mov-straccio` + modificatore). */
  classeContenitore: string;
  /** Classe da mettere su ogni riga (`ctp-mov-riga` + modificatore di partenza). */
  classeRiga: string;
  /** Stile del contenitore: `--ctp-passo-riga` per lo sfasamento (scritto solo quando cambia). */
  stileContenitore: Record<string, string>;
  /** Stile di una riga: `--ctp-riga` = indice (il builder lo passa a ogni riga). */
  stileRiga(indice: number): Record<string, string>;
}

/**
 * @param righe   quante righe si riscrivono (per stringere lo sfasamento se sono tante).
 * @param onFine  chiamata quando l'ultima riga è scritta (per l'annuncio o il fuoco).
 */
export function useStraccio(righe: number, onFine?: () => void): Straccio {
  const ridotto = useContropelo((s) => s.motion === 'reduced');
  const [fase, setFase] = useState<FaseStraccio>('fermo');
  const [daScrivere, setDaScrivere] = useState(false);
  const ultimoAvvio = useRef<number>(Number.NEGATIVE_INFINITY);
  const attesa = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onFineRef = useRef(onFine);
  onFineRef.current = onFine;
  const righeRef = useRef(righe);
  righeRef.current = righe;
  const ridottoRef = useRef(ridotto);
  ridottoRef.current = ridotto;

  const dopo = useCallback((ms: number, fn: () => void): void => {
    const t = setTimeout(fn, Math.max(0, ms));
    timer.current.push(t);
  }, []);

  useEffect(
    () => () => {
      for (const t of timer.current) clearTimeout(t);
      timer.current = [];
      attesa.current = null;
    },
    [],
  );

  const esegui = useCallback(
    (cambia: () => void): void => {
      const r = ridottoRef.current;
      ultimoAvvio.current = performance.now();
      const via = r ? TEMPI.straccioRidotto : TEMPI.straccioVia;
      setFase('via');
      dopo(via, () => {
        // Tra 'via' e 'riscrive': i dati nuovi, con le righe già mascherate.
        cambia();
        setDaScrivere(true);
        setFase('riscrive');
        // Frame dopo: si tolgono le maschere di partenza, le transizioni partono.
        dopo(0, () => {
          setDaScrivere(false);
          const totale = durataRiscrittura(righeRef.current, r);
          dopo(totale, () => {
            setFase('fermo');
            const fn = onFineRef.current;
            if (fn !== undefined) fn();
            const prossimo = attesa.current;
            attesa.current = null;
            if (prossimo !== null) esegui(prossimo);
          });
        });
      });
    },
    [dopo],
  );

  const avvia = useCallback(
    (cambia: () => void): void => {
      const ora = performance.now();
      const trascorso = ora - ultimoAvvio.current;
      if (fase === 'fermo' && trascorso >= TEMPI.codaStracci && attesa.current === null) {
        esegui(cambia);
        return;
      }
      // Tiene solo l'ultima richiesta; parte a fine straccio, o allo
      // scadere dei 500 ms se lo straccio è già fermo.
      const eraVuota = attesa.current === null;
      attesa.current = cambia;
      if (fase === 'fermo' && eraVuota) {
        dopo(TEMPI.codaStracci - trascorso, () => {
          const prossimo = attesa.current;
          attesa.current = null;
          if (prossimo !== null) esegui(prossimo);
        });
      }
    },
    [dopo, esegui, fase],
  );

  const passo = passoRiga(righe, ridotto);
  const stileContenitore = useMemo(() => ({ '--ctp-passo-riga': `${Math.round(passo)}ms` }), [passo]);
  const stileRiga = useCallback((indice: number) => ({ '--ctp-riga': String(Math.max(0, indice)) }), []);

  const classeContenitore =
    fase === 'via'
      ? 'ctp-mov-straccio ctp-mov-straccio--via'
      : fase === 'riscrive'
        ? daScrivere
          ? 'ctp-mov-straccio ctp-mov-straccio--riscrive ctp-mov-straccio--da-riscrivere'
          : 'ctp-mov-straccio ctp-mov-straccio--riscrive'
        : 'ctp-mov-straccio';
  const classeRiga = fase === 'riscrive' && daScrivere ? 'ctp-mov-riga ctp-mov-riga--da-scrivere' : 'ctp-mov-riga';

  return {
    fase,
    inCorso: fase !== 'fermo',
    avvia,
    classeContenitore,
    classeRiga,
    stileContenitore,
    stileRiga,
  };
}

/* ------------------------------------------------------------------ */
/* La raccolta delle righe lontane                                     */
/* ------------------------------------------------------------------ */

export interface Raccolta {
  /** Classe per una riga: lontana (svanisce) o vicina (resta). */
  classeRiga(lontana: boolean): string;
  /** Le righe lontane vanno nascoste davvero (`hidden`) dopo la dissolvenza. */
  nascondiLontane: boolean;
  /** Classe per la riga di scrittura appena montata. */
  classeRigaScrittura: string;
}

/**
 * FLIP delle righe vicine: prima che l'apertura cambi il layout il builder
 * chiama `misura()` (le posizioni "First"); al render successivo il hook
 * legge le posizioni nuove ("Last"), scrive il transform inverso inline
 * senza transizione, e al frame dopo lo azzera con la classe di
 * transizione. Solo transform: nessun cambio di altezza animato.
 *
 * @param contenitore  il `<ol>` della lista
 * @param aperta       true quando la riga di scrittura è aperta
 */
export function useRaccolta(contenitore: RefObject<HTMLElement | null>, aperta: boolean): Raccolta & { misura(): void } {
  const ridotto = useContropelo((s) => s.motion === 'reduced');
  const prime = useRef<Map<Element, number> | null>(null);
  const [nascondiLontane, setNascondi] = useState(false);
  const [daAprire, setDaAprire] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);

  const misura = useCallback((): void => {
    const el = contenitore.current;
    if (el === null || ridotto) return;
    const mappa = new Map<Element, number>();
    for (const riga of Array.from(el.children)) {
      mappa.set(riga, riga.getBoundingClientRect().top);
    }
    prime.current = mappa;
  }, [contenitore, ridotto]);

  useEffect(
    () => () => {
      for (const t of timer.current) clearTimeout(t);
      timer.current = [];
    },
    [],
  );

  // Last + Invert + Play, dopo il render che ha cambiato il layout.
  useEffect(() => {
    const el = contenitore.current;
    const first = prime.current;
    prime.current = null;
    if (el === null || first === null || ridotto) return;
    const mosse: HTMLElement[] = [];
    for (const riga of Array.from(el.children)) {
      if (!(riga instanceof HTMLElement)) continue;
      const prima = first.get(riga);
      if (prima === undefined) continue;
      const dy = prima - riga.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) continue;
      riga.classList.remove('ctp-mov-flip--flip');
      riga.style.transform = `translateY(${dy.toFixed(1)}px)`;
      mosse.push(riga);
    }
    if (mosse.length === 0) return;
    // Lettura forzata: il transform inverso è applicato prima della transizione.
    void el.offsetWidth;
    const t = setTimeout(() => {
      for (const riga of mosse) {
        riga.classList.add('ctp-mov-flip--flip');
        riga.style.transform = '';
      }
      const fine = setTimeout(() => {
        for (const riga of mosse) riga.classList.remove('ctp-mov-flip--flip');
      }, TEMPI.raccoltaFlip);
      timer.current.push(fine);
    }, 0);
    timer.current.push(t);
  }, [aperta, contenitore, ridotto]);

  // Le righe lontane spariscono davvero dopo la dissolvenza; la riga di
  // scrittura compare dopo il FLIP.
  useEffect(() => {
    if (aperta) {
      setDaAprire(!ridotto);
      const t1 = setTimeout(() => setNascondi(true), ridotto ? 0 : TEMPI.raccoltaVia);
      const t2 = setTimeout(() => setDaAprire(false), 0);
      timer.current.push(t1, t2);
      return;
    }
    setNascondi(false);
    setDaAprire(false);
  }, [aperta, ridotto]);

  const classeRiga = useCallback(
    (lontana: boolean): string => (aperta && lontana ? 'ctp-mov-raccolta ctp-mov-raccolta--lontana' : 'ctp-mov-raccolta'),
    [aperta],
  );

  return {
    classeRiga,
    nascondiLontane: aperta && nascondiLontane,
    classeRigaScrittura: daAprire ? 'ctp-mov-riga-scrittura ctp-mov-riga-scrittura--da-aprire' : 'ctp-mov-riga-scrittura',
    misura,
  };
}
