/**
 * EVIDENZIA · il foglio: il contenitore che scorre, non il contenuto
 * (scaffold; tech-architect §2.1, §3, §7; interaction-designer §8;
 * motion-designer §6.1).
 *
 * - layout 'foglio' (≥ 640 px): `.evd-foglio` è lo scroller nei due assi,
 *   focalizzabile (`tabIndex 0`, `role="region"`, nome "Pagina degli
 *   annunci", descrizione con i modi per spostarsi). Dentro, il
 *   dimensionatore e la pagina scalabile (Leggi / Pagina intera);
 * - layout 'colonna' (< 640 px): stesso DOM, nessun ruolo, scorre la finestra.
 *
 * Monta i tre hook del foglio dell'interaction-designer sullo scroller
 * (usePan, useTastieraFoglio, usePizzico: si spengono da soli nella colonna),
 * registra scroller e pagina in core/scroller.ts, misura area e contenuto
 * (ResizeObserver) per la scala di Pagina intera, e nel layout effect della
 * vista nuova esegue il passaggio animato (`prendiCambioVista` →
 * `cambiaVista`), come da protocollo del motion-designer.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { VISTA } from '../content/testi';
import { ID_AIUTO_FOGLIO } from '../core/ancore';
import { registraPagina, registraScroller } from '../core/scroller';
import { ticker } from '../core/ticker';
import { usePan } from '../interaction/usePan';
import { usePizzico } from '../interaction/usePizzico';
import { useTastieraFoglio } from '../interaction/useTastieraFoglio';
import { cambiaVista, fermaVista, scalaPaginaIntera } from '../motion/vista';
import { registro } from '../state/registro';
import { runtime } from '../state/runtime';
import { prendiCambioVista, useEvidenzia } from '../state/store';
import { MOLO, PAGINA_INTERA } from '../styles/tokens';
import './foglio.css';

interface Misure {
  /** area dello scroller (offsetWidth/Height: stabile con o senza barre di scorrimento) */
  areaW: number;
  areaH: number;
  /** la pagina non scalata */
  contenutoW: number;
  contenutoH: number;
}

const MISURE_VUOTE: Misure = { areaW: 0, areaH: 0, contenutoW: 0, contenutoH: 0 };

type Stile = CSSProperties & Record<`--evd-${string}`, string>;

function px(v: number): string {
  return `${Math.round(v * 100) / 100}px`;
}

export interface FoglioProps {
  readonly children: ReactNode;
}

export default function Foglio({ children }: FoglioProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const paginaRef = useRef<HTMLDivElement>(null);
  const layout = useEvidenzia((s) => s.layout);
  const vista = useEvidenzia((s) => s.vista);
  const [misure, setMisure] = useState<Misure>(MISURE_VUOTE);

  // scroller (o finestra) e pagina: prima di chiunque misuri
  useLayoutEffect(() => registraScroller(layout === 'foglio' ? scrollerRef.current : null), [layout]);
  useLayoutEffect(() => registraPagina(paginaRef.current), []);

  // i tre hook del foglio (interaction-designer §8)
  usePan(scrollerRef);
  useTastieraFoglio(scrollerRef);
  usePizzico(scrollerRef);

  // misure dell'area e della pagina, solo quando cambiano
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const pagina = paginaRef.current;
    if (scroller === null || pagina === null) return undefined;
    const misura = (): void => {
      const nuove: Misure = {
        areaW: scroller.offsetWidth,
        areaH: scroller.offsetHeight,
        contenutoW: pagina.offsetWidth,
        contenutoH: pagina.offsetHeight,
      };
      setMisure((m) =>
        m.areaW === nuove.areaW &&
        m.areaH === nuove.areaH &&
        m.contenutoW === nuove.contenutoW &&
        m.contenutoH === nuove.contenutoH
          ? m
          : nuove,
      );
    };
    misura();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(misura);
    ro.observe(scroller);
    ro.observe(pagina);
    return () => {
      ro.disconnect();
    };
  }, []);

  const intera = layout === 'foglio' && vista === 'intera';
  // area libera a sinistra del molo (ux-architect 5.3)
  const liberaW = Math.max(0, misure.areaW - MOLO.larghezza - MOLO.distanza);
  const scala =
    intera && misure.contenutoW > 0
      ? scalaPaginaIntera({
          larghezza: liberaW,
          altezza: misure.areaH,
          contenutoW: misure.contenutoW,
          contenutoH: misure.contenutoH,
          aria: PAGINA_INTERA.aria,
        })
      : 1;
  const interaX = intera ? Math.max(PAGINA_INTERA.aria, (liberaW - misure.contenutoW * scala) / 2) : 0;
  const interaY = intera ? Math.max(PAGINA_INTERA.aria, (misure.areaH - misure.contenutoH * scala) / 2) : 0;

  const stile: Stile | undefined = intera
    ? {
        '--evd-scala': String(Math.round(scala * 100000) / 100000),
        '--evd-intera-x': px(interaX),
        '--evd-intera-y': px(interaY),
        '--evd-area-w': px(misure.areaW),
        '--evd-area-h': px(misure.areaH),
      }
    : undefined;

  // valori caldi della scala per scroller, pan, minipagina e gesto
  useLayoutEffect(() => {
    const f = runtime.foglio;
    f.scala = scala;
    f.contenutoW = misure.contenutoW;
    f.contenutoH = misure.contenutoH;
    ticker.wake();
  }, [scala, misure.contenutoW, misure.contenutoH]);

  // Leggi ↔ Pagina intera: il passaggio animato sulla vista nuova, prima della pittura
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const pagina = paginaRef.current;
    const cambio = prendiCambioVista(vista);
    if (layout !== 'foglio' || scroller === null || pagina === null) return;
    if (cambio !== null) {
      void cambiaVista(pagina, cambio.foto, vista, cambio.punto, { scroller });
    } else if (vista === 'intera') {
      scroller.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    }
  }, [vista, layout]);

  // cambio di layout: niente passaggi a metà, righe da rimisurare
  useLayoutEffect(() => {
    fermaVista();
    registro.invalida();
  }, [layout]);

  const suFoglio = layout === 'foglio';

  return (
    <div
      ref={scrollerRef}
      className="evd-foglio"
      tabIndex={suFoglio ? 0 : undefined}
      role={suFoglio ? 'region' : undefined}
      aria-label={suFoglio ? VISTA.foglioAria : undefined}
      aria-describedby={suFoglio ? ID_AIUTO_FOGLIO : undefined}
    >
      {suFoglio ? (
        <p id={ID_AIUTO_FOGLIO} className="evd-sr">
          {VISTA.spostarsi}
        </p>
      ) : null}
      <div className="evd-dimensionatore" style={stile}>
        <div ref={paginaRef} className="evd-pagina">
          {children}
        </div>
      </div>
    </div>
  );
}
