/**
 * IMBRUNIRE · il palazzo con la tastiera (interaction-designer;
 * creative-director §6.5, ux-architect 7.2).
 *
 * Roving tabindex SPAZIALE: un solo Tab entra nel palazzo (sulla cella
 * attiva, la prima volta Il Noce) e un altro Tab ne esce. Dentro:
 * - ← → cella accanto sullo stesso piano (niente giro: ai bordi si resta);
 * - ↑ ↓ piano di sopra o di sotto, sulla cella con il centro orizzontale più
 *   vicino (la scala è il passaggio: si sale e si scende come nel palazzo);
 * - Home / Fine prima e ultima cella (Il Noce, La Corte);
 * - Invio / Spazio entrano (sono `button` o link: il clic è nativo; Spazio su
 *   un link lo attiviamo noi, i link non lo fanno da soli);
 * - Esc: `onEsc` (di norma chiude `#/lune` quando il nastro è attivo nel cielo).
 *
 * La geometria viene dalla pianta (larghezze in % del piano), non dal DOM:
 * vale uguale nella sezione, nella torre (una cella per riga) e nel palazzo
 * ridotto del foglio delle lune, che usa una sua istanza di questo hook.
 * Nella torre la cella che riceve il fuoco viene portata in vista con
 * `scrollIntoView({ block: 'nearest' })`, senza animazione con reduced motion.
 *
 * Nessun cambio di contesto al solo fuoco: si entra solo con Invio, Spazio o clic.
 * Nessun accesso al browser a livello di modulo.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { SlugCella } from '../state/store';
import { useImbrunire } from '../state/store';

/* ------------------------------------------------------------------ unione di props (usata anche da useCaloreCella) */

type Qualsiasi = Record<string, unknown>;

/**
 * Unisce più oggetti di props: gli handler `on*` con lo stesso nome si
 * chiamano tutti in ordine; per `ref` si chiamano tutte le funzioni; per il
 * resto vince l'ultimo. Serve a mettere su una cella propsCella e propsCalore.
 */
export function unisciProps<A extends Qualsiasi, B extends Qualsiasi>(a: A, b: B): A & B {
  const out: Qualsiasi = { ...a };
  for (const chiave of Object.keys(b)) {
    const va = out[chiave];
    const vb = b[chiave];
    const concatena = (chiave === 'ref' || /^on[A-Z]/.test(chiave)) && typeof va === 'function' && typeof vb === 'function';
    if (concatena) {
      const fa = va as (...args: unknown[]) => unknown;
      const fb = vb as (...args: unknown[]) => unknown;
      out[chiave] = (...args: unknown[]) => {
        fa(...args);
        fb(...args);
      };
    } else {
      out[chiave] = vb;
    }
  }
  return out as A & B;
}

/* ------------------------------------------------------------------ tipi */

export interface CellaPianta {
  slug: SlugCella;
  /** Larghezza in % della luce interna del piano (ux-architect 2.2: es. 31, 31, 24). */
  larghezza: number;
}

export interface OpzioniCelleTastiera {
  /** Piani dall'alto (sottotetto, piano nobile, piano terra), celle da sinistra. Scala esclusa. */
  piani: readonly (readonly CellaPianta[])[];
  /** Cella attiva al primo ingresso (default: la prima del piano più alto). */
  iniziale?: SlugCella;
  /** Esc sulle celle. Restituisce true (o niente) se ha chiuso qualcosa; false lascia salire l'evento. */
  onEsc?: () => boolean | void;
}

export interface PropsCella {
  ref: (el: HTMLElement | null) => void;
  tabIndex: 0 | -1;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  onFocus: (e: ReactFocusEvent<HTMLElement>) => void;
  'data-imb-ix-cella': SlugCella;
}

export interface CelleTastiera {
  /** Cella che riceve il Tab. */
  attiva: SlugCella;
  /** Da spargere sul bottone/link di ogni cella (ref stabile per slug). */
  propsCella: (slug: SlugCella) => PropsCella;
  /** Sposta il fuoco su una cella (e la rende attiva). */
  foca: (slug: SlugCella) => void;
  /** Rende attiva una cella senza spostare il fuoco (es. dopo porte e scala dentro le stanze). */
  impostaAttiva: (slug: SlugCella) => void;
}

interface Posizione {
  piano: number;
  indice: number;
  /** Centro orizzontale della cella in % della larghezza del piano. */
  centro: number;
}

/* ------------------------------------------------------------------ hook */

export function useCelleTastiera(o: OpzioniCelleTastiera): CelleTastiera {
  const { piani, iniziale } = o;
  const layout = useImbrunire((s) => s.layout);
  const ridotto = useImbrunire((s) => s.reducedMotion);

  /* mappa slug → posizione, calcolata dalla pianta */
  const mappa = useMemo(() => {
    const m = new Map<SlugCella, Posizione>();
    piani.forEach((piano, p) => {
      const totale = piano.reduce((acc, c) => acc + Math.max(0, c.larghezza), 0) || 1;
      let x = 0;
      piano.forEach((c, i) => {
        const w = (Math.max(0, c.larghezza) / totale) * 100;
        m.set(c.slug, { piano: p, indice: i, centro: x + w / 2 });
        x += w;
      });
    });
    return m;
  }, [piani]);

  const prima = piani[0]?.[0]?.slug;
  const ultimoPiano = piani[piani.length - 1];
  const ultima = ultimoPiano?.[ultimoPiano.length - 1]?.slug;

  const [attivaStato, setAttivaStato] = useState<SlugCella | null>(iniziale ?? null);
  const attiva: SlugCella | undefined =
    attivaStato !== null && mappa.has(attivaStato) ? attivaStato : iniziale !== undefined && mappa.has(iniziale) ? iniziale : prima;

  const attivaRef = useRef<SlugCella | undefined>(attiva);
  attivaRef.current = attiva;
  const opz = useRef(o);
  opz.current = o;
  const mappaRef = useRef(mappa);
  mappaRef.current = mappa;
  const pianiRef = useRef(piani);
  pianiRef.current = piani;
  const torreRef = useRef(layout === 'torre');
  torreRef.current = layout === 'torre';
  const ridottoRef = useRef(ridotto);
  ridottoRef.current = ridotto;

  const elementi = useRef(new Map<SlugCella, HTMLElement>());
  const refPerSlug = useRef(new Map<SlugCella, (el: HTMLElement | null) => void>());

  const impostaAttiva = useCallback((slug: SlugCella) => {
    if (!mappaRef.current.has(slug)) return;
    setAttivaStato((s) => (s === slug ? s : slug));
  }, []);

  const foca = useCallback(
    (slug: SlugCella) => {
      impostaAttiva(slug);
      const el = elementi.current.get(slug);
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: torreRef.current && !ridottoRef.current ? 'smooth' : 'auto',
      });
    },
    [impostaAttiva],
  );

  /** Cella di arrivo per un tasto freccia, o null se non si va da nessuna parte. */
  const vicina = useCallback((da: SlugCella, tasto: string): SlugCella | null => {
    const pos = mappaRef.current.get(da);
    if (!pos) return null;
    const piani0 = pianiRef.current;
    if (tasto === 'ArrowLeft' || tasto === 'ArrowRight') {
      const piano = piani0[pos.piano];
      const j = pos.indice + (tasto === 'ArrowRight' ? 1 : -1);
      return piano?.[j]?.slug ?? null;
    }
    const p = pos.piano + (tasto === 'ArrowDown' ? 1 : -1);
    const piano = piani0[p];
    if (!piano || piano.length === 0) return null;
    let migliore: SlugCella | null = null;
    let distanza = Infinity;
    for (const c of piano) {
      const q = mappaRef.current.get(c.slug);
      if (!q) continue;
      const d = Math.abs(q.centro - pos.centro);
      // a parità di distanza vince la cella a sinistra (ordine di lettura)
      if (d < distanza - 0.01) {
        distanza = d;
        migliore = c.slug;
      }
    }
    return migliore;
  }, []);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const slug = e.currentTarget.getAttribute('data-imb-ix-cella') as SlugCella | null;
      if (slug === null) return;
      let bersaglio: SlugCella | null = null;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          bersaglio = vicina(slug, e.key);
          // anche senza meta la freccia è "nostra": niente scorrimento della pagina
          e.preventDefault();
          break;
        case 'Home':
          bersaglio = pianiRef.current[0]?.[0]?.slug ?? null;
          e.preventDefault();
          break;
        case 'End': {
          const ultimo = pianiRef.current[pianiRef.current.length - 1];
          bersaglio = ultimo?.[ultimo.length - 1]?.slug ?? null;
          e.preventDefault();
          break;
        }
        case ' ':
        case 'Spacebar':
          // i bottoni lo fanno da soli; un link no
          if (e.currentTarget.tagName === 'A') {
            e.preventDefault();
            e.currentTarget.click();
          }
          return;
        case 'Escape': {
          const esc = opz.current.onEsc;
          if (!esc) return;
          const esito = esc();
          if (esito !== false) {
            e.preventDefault();
            e.stopPropagation();
          }
          return;
        }
        default:
          return;
      }
      if (bersaglio !== null && bersaglio !== slug) foca(bersaglio);
    },
    [foca, vicina],
  );

  const onFocus = useCallback(
    (e: ReactFocusEvent<HTMLElement>) => {
      const slug = e.currentTarget.getAttribute('data-imb-ix-cella') as SlugCella | null;
      if (slug !== null && slug !== attivaRef.current) impostaAttiva(slug);
    },
    [impostaAttiva],
  );

  const refDi = useCallback((slug: SlugCella) => {
    let fn = refPerSlug.current.get(slug);
    if (!fn) {
      fn = (el: HTMLElement | null) => {
        if (el) elementi.current.set(slug, el);
        else elementi.current.delete(slug);
      };
      refPerSlug.current.set(slug, fn);
    }
    return fn;
  }, []);

  const propsCella = useCallback(
    (slug: SlugCella): PropsCella => ({
      ref: refDi(slug),
      tabIndex: slug === attiva ? 0 : -1,
      onKeyDown,
      onFocus,
      'data-imb-ix-cella': slug,
    }),
    [attiva, onFocus, onKeyDown, refDi],
  );

  return {
    attiva: attiva ?? ultima ?? 'androne',
    propsCella,
    foca,
    impostaAttiva,
  };
}
