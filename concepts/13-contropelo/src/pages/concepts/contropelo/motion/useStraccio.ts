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
 * Nessun requestAnimationFrame proprio (tech-architect §12): le righe che
 * si riscrivono sono @keyframes che partono da sole quando compare la
 * classe; il FLIP parte con una lettura forzata di layout (`offsetWidth`)
 * nel layout effect. `setTimeout` qui rimanda fasi, non anima.
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
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
   * riscrive. Se uno straccio è partito da meno di 500 ms o è ancora in
   * corso, questa richiesta aspetta e sostituisce quelle già in attesa.
   */
  avvia(cambia: () => void): void;
  /** Classe da mettere sul contenitore (`ctp-mov-straccio` + modificatore della fase). */
  classeContenitore: string;
  /** Classe da mettere su ogni riga che si riscrive. */
  classeRiga: string;
  /** Stile del contenitore: `--ctp-passo-riga` (cambia solo se cambia il numero di righe). */
  stileContenitore: Record<string, string>;
  /** Stile di una riga: `--ctp-riga` = indice (0 = titolo del giorno, 1.. = righe). */
  stileRiga(indice: number): Record<string, string>;
}

/**
 * @param righe   quante righe si riscrivono (per stringere lo sfasamento se sono tante).
 * @param onFine  chiamata quando l'ultima riga è scritta (annuncio, fuoco).
 */
export function useStraccio(righe: number, onFine?: () => void): Straccio {
  const ridotto = useContropelo((s) => s.motion === 'reduced');
  const [fase, setFase] = useState<FaseStraccio>('fermo');
  const faseRef = useRef<FaseStraccio>('fermo');
  const ultimoAvvio = useRef<number>(Number.NEGATIVE_INFINITY);
  const attesa = useRef<(() => void) | null>(null);
  const attesaProgrammata = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onFineRef = useRef(onFine);
  const righeRef = useRef(righe);
  const ridottoRef = useRef(ridotto);

  useEffect(() => {
    onFineRef.current = onFine;
    righeRef.current = righe;
    ridottoRef.current = ridotto;
  });

  useEffect(
    () => () => {
      for (const t of timer.current) clearTimeout(t);
      timer.current = [];
      attesa.current = null;
    },
    [],
  );

  const imposta = useCallback((f: FaseStraccio): void => {
    faseRef.current = f;
    setFase(f);
  }, []);

  const dopo = useCallback((ms: number, fn: () => void): void => {
    const t = setTimeout(() => {
      timer.current = timer.current.filter((x) => x !== t);
      fn();
    }, Math.max(0, ms));
    timer.current.push(t);
  }, []);

  const esegui = useCallback(
    (cambia: () => void): void => {
      const r = ridottoRef.current;
      ultimoAvvio.current = performance.now();
      imposta('via');
      dopo(r ? TEMPI.straccioRidotto : TEMPI.straccioVia, () => {
        // Tra 'via' e 'riscrive': i dati nuovi arrivano mentre il contenitore
        // è ancora cancellato; le righe partono con la loro animazione.
        cambia();
        imposta('riscrive');
        dopo(durataRiscrittura(righeRef.current, r), () => {
          imposta('fermo');
          const fn = onFineRef.current;
          if (fn !== undefined) fn();
          const prossimo = attesa.current;
          if (prossimo !== null && !attesaProgrammata.current) {
            attesa.current = null;
            const resto = TEMPI.codaStracci - (performance.now() - ultimoAvvio.current);
            if (resto <= 0) esegui(prossimo);
            else {
              attesaProgrammata.current = true;
              dopo(resto, () => {
                attesaProgrammata.current = false;
                const p = attesa.current ?? prossimo;
                attesa.current = null;
                esegui(p);
              });
            }
          }
        });
      });
    },
    [dopo, imposta],
  );

  const avvia = useCallback(
    (cambia: () => void): void => {
      const trascorso = performance.now() - ultimoAvvio.current;
      if (faseRef.current === 'fermo' && !attesaProgrammata.current && trascorso >= TEMPI.codaStracci) {
        attesa.current = null;
        esegui(cambia);
        return;
      }
      // Solo l'ultima richiesta conta. Se lo straccio è in corso partirà alla
      // sua fine; se è fermo ma troppo vicino al precedente, allo scadere dei 500 ms.
      attesa.current = cambia;
      if (faseRef.current === 'fermo' && !attesaProgrammata.current) {
        attesaProgrammata.current = true;
        dopo(TEMPI.codaStracci - trascorso, () => {
          attesaProgrammata.current = false;
          const prossimo = attesa.current;
          attesa.current = null;
          if (prossimo !== null) esegui(prossimo);
        });
      }
    },
    [dopo, esegui],
  );

  const passo = passoRiga(righe, ridotto);
  const stileContenitore = useMemo(() => ({ '--ctp-passo-riga': `${Math.round(passo)}ms` }), [passo]);
  const stileRiga = useCallback((indice: number) => ({ '--ctp-riga': String(Math.max(0, Math.floor(indice))) }), []);

  const classeContenitore =
    fase === 'via'
      ? 'ctp-mov-straccio ctp-mov-straccio--via'
      : fase === 'riscrive'
        ? 'ctp-mov-straccio ctp-mov-straccio--riscrive'
        : 'ctp-mov-straccio';

  return {
    fase,
    inCorso: fase !== 'fermo',
    avvia,
    classeContenitore,
    classeRiga: 'ctp-mov-riga',
    stileContenitore,
    stileRiga,
  };
}

/* ------------------------------------------------------------------ */
/* La raccolta delle righe lontane                                     */
/* ------------------------------------------------------------------ */

export interface Raccolta {
  /**
   * Da chiamare nel gestore che apre o chiude la riga di scrittura, PRIMA
   * dell'azione dello store: misura le posizioni di partenza del FLIP.
   */
  misura(): void;
  /** Classe per una riga della lista: lontana (svanisce) o vicina (resta). */
  classeRiga(lontana: boolean): string;
  /** true quando le righe lontane vanno nascoste davvero (`hidden`), dopo la dissolvenza. */
  nascondiLontane: boolean;
  /** Classe per la riga di scrittura (compare da sola al montaggio). */
  classeRigaScrittura: string;
}

/** useLayoutEffect nel browser, useEffect nel prerender (nessun avviso di React). */
const useEffettoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const ATTR_RIAPPARE = 'data-ctp-riappare';

/**
 * Raccolta delle righe lontane quando si apre la riga di scrittura (ux 5.5).
 *
 * Aprendo: la riga di scrittura prende il posto del trattino e compare per
 * opacità; le righe lontane svaniscono (180 ms), poi vengono nascoste
 * (`nascondiLontane`) e quelle vicine si stringono con un FLIP (300 ms).
 * Chiudendo: le righe lontane tornano visibili (220 ms, attributo
 * `data-ctp-riappare` messo qui fuori da React) e le vicine tornano al loro
 * posto con il FLIP.
 *
 * FLIP = First (misura), Last (posizioni dopo il render), Invert (transform
 * inline senza transizione, nel layout effect, prima della pittura), Play
 * (al giro dopo: classe di transizione e transform azzerato). Solo
 * transform: nessuna altezza animata.
 *
 * @param contenitore  il `<ol>` della lista (righe = figli diretti)
 * @param aperta       true quando la riga di scrittura è aperta
 */
export function useRaccolta(contenitore: RefObject<HTMLElement | null>, aperta: boolean): Raccolta {
  const ridotto = useContropelo((s) => s.motion === 'reduced');
  const prime = useRef<Map<Element, number> | null>(null);
  const nascosteRef = useRef<Element[]>([]);
  const [nascondi, setNascondi] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dopo = useCallback((ms: number, fn: () => void): void => {
    const t = setTimeout(() => {
      timer.current = timer.current.filter((x) => x !== t);
      fn();
    }, Math.max(0, ms));
    timer.current.push(t);
  }, []);

  const misura = useCallback((): void => {
    const el = contenitore.current;
    if (el === null || ridotto) {
      prime.current = null;
      return;
    }
    const mappa = new Map<Element, number>();
    for (const riga of Array.from(el.children)) {
      // Le righe nascoste non hanno posizione: non partecipano al FLIP.
      if (riga instanceof HTMLElement && riga.hidden) continue;
      const r = riga.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      mappa.set(riga, r.top);
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

  // Aprendo: dopo la dissolvenza delle lontane, si misura e si nascondono.
  // Chiudendo: le lontane tornano subito nel layout.
  useEffect(() => {
    if (!aperta) {
      setNascondi(false);
      return;
    }
    if (ridotto) {
      setNascondi(true);
      return;
    }
    dopo(TEMPI.raccoltaVia, () => {
      misura();
      setNascondi(true);
    });
  }, [aperta, ridotto, dopo, misura]);

  const nascondiLontane = aperta && nascondi;

  // Last + Invert prima della pittura, Play al giro dopo.
  useEffettoLayout(() => {
    const el = contenitore.current;
    const first = prime.current;
    prime.current = null;
    if (el === null) return;

    // Righe che erano nascoste e tornano: ricompaiono per opacità.
    if (!nascondiLontane && nascosteRef.current.length > 0) {
      const tornate = nascosteRef.current.filter((r) => r.isConnected);
      nascosteRef.current = [];
      if (!ridotto) {
        for (const r of tornate) r.setAttribute(ATTR_RIAPPARE, '');
        dopo(TEMPI.raccoltaVia + TEMPI.riappare, () => {
          for (const r of tornate) r.removeAttribute(ATTR_RIAPPARE);
        });
      }
    }
    if (nascondiLontane) {
      nascosteRef.current = Array.from(el.children).filter((r) => r instanceof HTMLElement && r.hidden);
    }

    if (first === null || ridotto) return;
    const mosse: HTMLElement[] = [];
    for (const riga of Array.from(el.children)) {
      if (!(riga instanceof HTMLElement) || riga.hidden) continue;
      const prima = first.get(riga);
      if (prima === undefined) continue;
      riga.classList.remove('ctp-mov-flip--flip');
      riga.style.transform = '';
      const dy = prima - riga.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) continue;
      riga.style.transform = `translateY(${dy.toFixed(1)}px)`;
      mosse.push(riga);
    }
    if (mosse.length === 0) return;
    // Lettura forzata: il browser registra il transform inverso come stato
    // di partenza, così la transizione parte davvero.
    void el.offsetWidth;
    for (const riga of mosse) {
      riga.classList.add('ctp-mov-flip--flip');
      riga.style.transform = '';
    }
    dopo(TEMPI.raccoltaFlip, () => {
      for (const riga of mosse) riga.classList.remove('ctp-mov-flip--flip');
    });
  }, [aperta, nascondiLontane, contenitore, ridotto, dopo]);

  const classeRiga = useCallback(
    (lontana: boolean): string => (aperta && lontana ? 'ctp-mov-raccolta--lontana' : ''),
    [aperta],
  );

  return {
    misura,
    classeRiga,
    nascondiLontane,
    classeRigaScrittura: 'ctp-mov-riga-scrittura',
  };
}
