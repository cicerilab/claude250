/**
 * IMPRONTA · radice del concept (scaffold-engineer).
 *
 * Cosa fa, in ordine:
 * 1. prima del primo render (inizializzatore di useState) rifà lo store dalla
 *    memoria del browser e dall'URL (`?carta=`, `?prova=`, `?invio=ko`) e
 *    legge `prefers-reduced-motion`, così carta e movimento sono giusti al
 *    primo render e i blocchi non partono premuti per poi saltare;
 * 2. rende `.imp-root` con `data-carta`, `data-gl`, `data-motion` e le
 *    variabili del motion (`variabiliMotion`), i link di salto, il bottone
 *    "Torna in Ciceri Lab" del sito, il canvas WebGL (quando arriva) e le
 *    sezioni in ordine: Testata, Hero, Per chi, Tecniche, Carta, Legatoria,
 *    Banco, Bottega (dentro <main>), Colophon;
 * 3. al mount: `track('apri_concept')`, font, titolo e description, ticker,
 *    viewport, lenis (non con reduced motion), luce, hash iniziale, link
 *    interni delegati, caricamento lazy del WebGL dopo i font;
 * 4. allo smontaggio: distrugge lenis, ferma il ticker, chiude l'onda,
 *    rimette titolo, description, fondo di <html>/<body> e
 *    `history.scrollRestoration` com'erano.
 *
 * Nessun accesso a window/document a livello di modulo (prerender del sito).
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import ConceptBackButton from '@/components/ConceptBackButton';
import { track } from '@/lib/analytics';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/relief-fallback.css';
import './interaction/interaction.css';

import { META, SALTI } from './content/testi';
import {
  ascoltaReducedMotion,
  detectWebGL,
  leggiForzaturaGL,
  prefersDark,
  prefersReducedMotion,
  saveData,
} from './core/capabilities';
import { injectFonts } from './core/fonts';
import { caricaGL, decidiGL, type ComponenteGL } from './core/glLoader';
import { avviaScroll } from './core/lenis';
import { ticker } from './core/ticker';
import { osservaViewport } from './core/viewport';
import { useLuce } from './interaction/light';
import { concludiPaperWave } from './interaction/paperWave';
import { ANCORE, variabiliMotion } from './motion/choreography';
import { arrivaAllAncora } from './motion/useScrollProgress';
import { svuotaRimandati } from './state/persist';
import { runtime } from './state/runtime';
import { impostaGL, inizializzaStore, selCarta, selGL, selReducedMotion, store, useImpronta } from './state/store';
import { CARTE } from './styles/tokens';

import Banco from './sections/Banco/Banco';
import Bottega from './sections/Bottega/Bottega';
import Carta from './sections/Carta/Carta';
import Colophon from './sections/Colophon/Colophon';
import Hero from './sections/Hero/Hero';
import Testata from './sections/Hero/Testata';
import Legatoria from './sections/Legatoria/Legatoria';
import PerChi from './sections/PerChi/PerChi';
import Tecniche from './sections/Tecniche/Tecniche';

/** Id del <main> (bersaglio di "Salta al contenuto"). */
const ID_CONTENUTO = 'contenuto';
const ID_BANCO = 'banco';

/** Titolo e description della pagina, rimessi com'erano allo smontaggio. */
function useMetaPagina(): void {
  useEffect(() => {
    const titoloPrima = document.title;
    document.title = META.title;

    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const creata = meta === null;
    const contenutoPrima = meta?.getAttribute('content') ?? null;
    if (meta === null) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', META.description);

    return () => {
      document.title = titoloPrima;
      if (meta === null) return;
      if (creata) meta.remove();
      else if (contenutoPrima !== null) meta.setAttribute('content', contenutoPrima);
    };
  }, []);
}

/**
 * Fondo di <html> e <body> uguale alla carta (niente strisce di un altro
 * colore nel rimbalzo dello scroll su iOS). Stili inline, ripristinati.
 */
function useFondoDocumento(carta: keyof typeof CARTE): void {
  const prima = useRef<{ html: string; body: string } | null>(null);

  useEffect(() => {
    prima.current = {
      html: document.documentElement.style.backgroundColor,
      body: document.body.style.backgroundColor,
    };
    return () => {
      const p = prima.current;
      if (p === null) return;
      document.documentElement.style.backgroundColor = p.html;
      document.body.style.backgroundColor = p.body;
    };
  }, []);

  useEffect(() => {
    const fondo = CARTE[carta].fondo;
    document.documentElement.style.backgroundColor = fondo;
    document.body.style.backgroundColor = fondo;
  }, [carta]);
}

export default function Impronta() {
  const rootRef = useRef<HTMLDivElement>(null);

  // 1. Store e runtime da capo, PRIMA del primo render delle sezioni.
  useState(() => {
    runtime.reset();
    if (typeof window !== 'undefined') {
      inizializzaStore({
        search: window.location.search,
        reducedMotion: prefersReducedMotion(),
        scuro: prefersDark(),
      });
    }
    return true;
  });

  const carta = useImpronta(selCarta);
  const gl = useImpronta(selGL);
  const ridotto = useImpronta(selReducedMotion);
  const [Canvas, setCanvas] = useState<ComponenteGL | null>(null);

  const stileMotion = useMemo(() => variabiliMotion(ridotto) as CSSProperties, [ridotto]);

  useMetaPagina();
  useFondoDocumento(carta);

  // Apertura del prototipo: una volta per montaggio (la guardia regge il
  // doppio effetto di StrictMode in sviluppo).
  const tracciato = useRef(false);
  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    track('apri_concept', { concept: 10 });
  }, []);

  // Font di Google (tokens.ts → FONT_CSS_URL): tolti allo smontaggio solo se aggiunti qui.
  useEffect(() => injectFonts(), []);

  // Reduced motion che cambia a pagina aperta.
  useEffect(
    () =>
      ascoltaReducedMotion((r) => {
        store.set({ reducedMotion: r });
      }),
    [],
  );

  // Ticker (pausa con scheda nascosta) e misura del viewport.
  useEffect(() => {
    const staccaTicker = ticker.attiva();
    const staccaViewport = osservaViewport();
    return () => {
      staccaViewport();
      staccaTicker();
    };
  }, []);

  // Lenis (o scroll nativo con reduced motion): si ricrea se cambia la preferenza.
  useEffect(() => avviaScroll({ ridotto }), [ridotto]);

  // Luce radente (interaction-designer): dopo che le sezioni sono montate.
  useLuce(rootRef);

  // Hash iniziale (#banco …): la pressa scende nell'hero, poi il foglio
  // scorre all'ancora (motion-designer §4.6). L'hash nell'URL resta.
  useEffect(() => {
    const storia = window.history;
    const ripristinoPrima = storia.scrollRestoration;
    storia.scrollRestoration = 'manual';

    let timer = 0;
    let id = '';
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      id = '';
    }
    if (id.length > 0 && document.getElementById(id) !== null) {
      window.scrollTo(0, 0);
      timer = window.setTimeout(
        () => {
          arrivaAllAncora(id);
        },
        store.get().reducedMotion ? 0 : ANCORE.attesaIniziale,
      );
    }
    return () => {
      window.clearTimeout(timer);
      storia.scrollRestoration = ripristinoPrima;
    };
  }, []);

  // Onda del cambio carta: chiusa allo smontaggio (interaction-designer §11.5).
  useEffect(
    () => () => {
      concludiPaperWave();
    },
    [],
  );

  // Bozza del banco: le scritture rimandate partono subito su pagehide e allo smontaggio.
  useEffect(() => {
    const svuota = (): void => {
      svuotaRimandati();
    };
    window.addEventListener('pagehide', svuota);
    return () => {
      window.removeEventListener('pagehide', svuota);
      svuota();
    };
  }, []);

  // WebGL: decisione subito, caricamento lazy dopo font e quiete (tech-architect §9).
  useEffect(() => {
    const decisione = decidiGL({
      forzatura: leggiForzaturaGL(window.location.search),
      saveData: saveData(),
      webgl: detectWebGL(),
    });
    if (!decisione.carica) {
      impostaGL('off', decisione.motivo);
      return undefined;
    }
    impostaGL('pending');
    const controllo = new AbortController();
    void caricaGL(controllo.signal, () => {
      impostaGL('off', 'errore-import');
    }).then((componente) => {
      if (componente !== null && !controllo.signal.aborted) setCanvas(() => componente);
    });
    return () => {
      controllo.abort();
    };
  }, []);

  // Link interni: un solo ascoltatore delegato per tutti gli `a[href^="#"]`
  // (testata, segnapagina, indice, colophon, "Prova la tua", link di salto):
  // stesso viaggio e stesso fuoco all'arrivo (motion-designer §4.6).
  const suClic = (e: ReactMouseEvent<HTMLDivElement>): void => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const bersaglio = e.target;
    if (!(bersaglio instanceof Element)) return;
    const link = bersaglio.closest<HTMLAnchorElement>('a[href^="#"]');
    if (link === null || !e.currentTarget.contains(link)) return;
    const href = link.getAttribute('href') ?? '';
    let id = '';
    try {
      id = decodeURIComponent(href.slice(1));
    } catch {
      return;
    }
    if (id.length === 0) return;
    if (arrivaAllAncora(id)) e.preventDefault();
  };

  return (
    <div
      ref={rootRef}
      className="imp-root"
      data-carta={carta}
      data-gl={gl}
      data-motion={ridotto ? 'reduced' : 'full'}
      style={stileMotion}
      onClick={suClic}
    >
      <a className="imp-salto" href={`#${ID_CONTENUTO}`}>
        {SALTI.contenuto}
      </a>
      <a className="imp-salto" href={`#${ID_BANCO}`}>
        {SALTI.banco}
      </a>

      <ConceptBackButton />

      {Canvas !== null ? <Canvas /> : null}

      <div className="imp-contenuto">
        <Testata />
        <main id={ID_CONTENUTO} className="imp-main">
          <Hero />
          <PerChi />
          <Tecniche />
          <Carta />
          <Legatoria />
          <Banco />
          <Bottega />
        </main>
        <Colophon />
      </div>
    </div>
  );
}
