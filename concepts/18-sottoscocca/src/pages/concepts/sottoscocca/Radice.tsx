/**
 * SOTTOSCOCCA · radice del concept (scaffold-engineer).
 *
 * Cosa fa, in ordine:
 * 1. prima del primo render (inizializzatore di useState) rifà runtime e
 *    store (memoria del browser + URL: `?lavori=`, `?lavoro=`, `?deposito=`,
 *    `?giorno=`, `?invio=ko`, `?fermo=`) e legge reduced motion e altezza;
 * 2. rende `.ssc-root` con `data-gl`, `data-motion`, `data-orient`,
 *    `data-quota`, `data-scheda`, `data-altezza`, `data-asta` (e
 *    `data-fermo`), i link di salto, il bottone del sito, il Fondale, lo
 *    strato GL quando arriva, il contenuto (Testata, Asta, main con le sette
 *    sezioni, Piede), la barra, la scheda e la regione aria-live;
 * 3. al mount: `track('apri_concept')`, titolo e description, fondo di
 *    html/body, font, ticker, viewport, scroll, stazioni, ponte, punti,
 *    hash iniziale, WebGL lazy (tetto 8 s);
 * 4. allo smontaggio rimette tutto com'era (titolo, description, fondo,
 *    `scrollRestoration`, font aggiunti, ascoltatori, evidenza).
 *
 * Nessun accesso a window/document a livello di modulo (prerender del sito).
 */

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import ConceptBackButton from '@/components/ConceptBackButton';
import { track } from '@/lib/analytics';

import './styles/tokens.css';
import './styles/motion-vars.css';
import './styles/base.css';
import './styles/layout.css';
import './interaction/interaction.css';

import { META, SALTI } from './content/testi';
import { ascoltaReducedMotion, detectWebGL, leggiForzaturaGL, prefersReducedMotion, saveData } from './core/capabilities';
import { fontsReady, injectFonts } from './core/fonts';
import { caricaGL, decidiGL, type ComponenteGL } from './core/glLoader';
import { avviaScroll, risolviAncora, vaiA } from './core/scroll';
import { ticker } from './core/ticker';
import { ALTEZZA_BASSA, osservaViewport } from './core/viewport';
import { azzeraEvidenza } from './interaction/evidenza';
import { avviaPunti } from './ponte/punti';
import { avviaPonte, saltaPonte } from './ponte/quota';
import { osservaStazioni } from './ponte/stazioni';
import { collegaAnnuncio } from './state/annuncio';
import { svuotaRimandati } from './state/persist';
import { runtime, type Orientamento } from './state/runtime';
import { impostaGL, inizializzaStore, store, useSottoscocca } from './state/store';
import { PALETTE } from './styles/tokens';

import Apertura from './sections/Apertura/Apertura';
import Asta from './sections/Asta/Asta';
import Deposito from './sections/Deposito/Deposito';
import Fondale from './sections/Fondale/Fondale';
import Freni from './sections/Freni/Freni';
import Gomme from './sections/Gomme/Gomme';
import Officina from './sections/Officina/Officina';
import Piede from './sections/Piede/Piede';
import PonteLibero from './sections/PonteLibero/PonteLibero';
import BarraLavoro from './sections/Punti/BarraLavoro';
import Scheda from './sections/Punti/Scheda';
import Sottoscocca from './sections/Sottoscocca/Sottoscocca';
import Testata from './sections/Testata/Testata';

/** Id del <main> (bersaglio di "Salta al contenuto"). */
const ID_CONTENUTO = 'contenuto';
const ID_PLANNING = 'ponte-libero';
/** Tetto per import + modello + primo frame del WebGL (tech-architect §9.1). */
const TETTO_GL_MS = 8000;

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

/** Fondo di <html> e <body> nero grasso (niente strisce nel rimbalzo iOS), ripristinato. */
function useFondoDocumento(): void {
  useEffect(() => {
    const html = document.documentElement.style.backgroundColor;
    const body = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = PALETTE.nero.hex;
    document.body.style.backgroundColor = PALETTE.nero.hex;
    return () => {
      document.documentElement.style.backgroundColor = html;
      document.body.style.backgroundColor = body;
    };
  }, []);
}

function hashIniziale(): string {
  try {
    return risolviAncora(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    return '';
  }
}

export default function Radice() {
  const contenutoRef = useRef<HTMLDivElement>(null);
  const annuncioRef = useRef<HTMLDivElement>(null);

  // 1. Runtime e store da capo, PRIMA del primo render delle sezioni.
  useState(() => {
    runtime.reset();
    if (typeof window !== 'undefined') {
      inizializzaStore({
        search: window.location.search,
        reducedMotion: prefersReducedMotion(),
        bassa: window.innerHeight < ALTEZZA_BASSA,
      });
    }
    return true;
  });

  const gl = useSottoscocca((s) => s.gl);
  const glMotivo = useSottoscocca((s) => s.glMotivo);
  const ridotto = useSottoscocca((s) => s.reducedMotion);
  const quota = useSottoscocca((s) => s.quotaPlateau);
  const schedaAperta = useSottoscocca((s) => s.schedaAperta !== null);
  const bassa = useSottoscocca((s) => s.bassa);
  const modoAsta = useSottoscocca((s) => s.modoAsta);
  const fermo = useSottoscocca((s) => s.fermo);
  const [orient, setOrient] = useState<Orientamento>('landscape');
  const [Scena, setScena] = useState<ComponenteGL | null>(null);

  useMetaPagina();
  useFondoDocumento();

  // Apertura del prototipo: una volta per montaggio (guardia per StrictMode).
  const tracciato = useRef(false);
  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    track('apri_concept', { concept: 18 });
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

  // Regione aria-live (annunci di plateau e delle sezioni).
  useEffect(() => collegaAnnuncio(annuncioRef.current), []);

  // Ticker, viewport, scroll, stazioni, ponte, punti. Ordine delle fasi nel ticker:
  // read (stazioni) → update (ponte, poi proiezione GL) → write (punti, variabili) → render.
  useEffect(() => {
    const staccaTicker = ticker.attiva();
    const staccaViewport = osservaViewport((m) => {
      setOrient(m.orient);
      store.set({ bassa: m.bassa });
    });
    const staccaScroll = avviaScroll();
    const staccaStazioni = osservaStazioni(contenutoRef.current);
    const staccaPonte = avviaPonte();
    const staccaPunti = avviaPunti();
    return () => {
      staccaPunti();
      staccaPonte();
      staccaStazioni();
      staccaScroll();
      staccaViewport();
      staccaTicker();
      azzeraEvidenza();
    };
  }, []);

  // Numero di deposito: le scritture rimandate partono subito su pagehide e allo smontaggio.
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

  // Hash iniziale (#freni, #quota-80, #ponte-libero…): la pagina va all'ancora
  // senza animazione e il ponte è GIÀ a quell'altezza (ux §1.1). Se i font
  // arrivano dopo e spostano il layout, si riallinea (solo se nessuno ha scorso).
  useEffect(() => {
    const storia = window.history;
    const ripristinoPrima = storia.scrollRestoration;
    const id = hashIniziale();
    let vivo = true;
    let timer = 0;
    if (id.length > 0 && document.getElementById(id) !== null) {
      storia.scrollRestoration = 'manual';
      const arriva = (): void => {
        if (!vivo) return;
        vaiA(id, { ridotto: true, fuoco: false });
        saltaPonte();
      };
      timer = window.setTimeout(() => {
        arriva();
        const dove = window.scrollY;
        void fontsReady().then(() => {
          if (vivo && Math.abs(window.scrollY - dove) < 2) arriva();
        });
      }, 0);
    }
    return () => {
      vivo = false;
      window.clearTimeout(timer);
      storia.scrollRestoration = ripristinoPrima;
    };
  }, []);

  // WebGL: decisione subito, caricamento lazy dopo `load` e quiete, tetto 8 s.
  useEffect(() => {
    const search = window.location.search;
    const conFermo = store.get().fermo !== null;
    const decisione = decidiGL({
      forzatura: conFermo ? 'on' : leggiForzaturaGL(search),
      saveData: saveData(),
      webgl: detectWebGL({ permettiSoftware: conFermo }),
    });
    if (!decisione.carica) {
      impostaGL('off', decisione.motivo);
      return undefined;
    }
    impostaGL('pending');
    const controllo = new AbortController();
    const tetto = conFermo
      ? 0
      : window.setTimeout(() => {
          if (store.get().gl === 'pending') impostaGL('off', 'tempo');
        }, TETTO_GL_MS);
    void caricaGL(controllo.signal, () => {
      impostaGL('off', 'errore-import');
    }).then((componente) => {
      if (componente !== null && !controllo.signal.aborted && store.get().glMotivo !== 'tempo') {
        setScena(() => componente);
      }
    });
    return () => {
      controllo.abort();
      window.clearTimeout(tetto);
    };
  }, []);

  // Link interni: un solo ascoltatore delegato per tutti gli `a[href^="#"]`
  // (salti, testata, asta, piede, barra): stesso viaggio, stesso fuoco.
  const suClic = (e: ReactMouseEvent<HTMLDivElement>): void => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const bersaglio = e.target;
    if (!(bersaglio instanceof Element)) return;
    const link = bersaglio.closest<HTMLAnchorElement>('a[href^="#"]');
    if (link === null || !e.currentTarget.contains(link)) return;
    let id = '';
    try {
      id = decodeURIComponent((link.getAttribute('href') ?? '').slice(1));
    } catch {
      return;
    }
    if (id.length === 0) return;
    if (vaiA(id, { ridotto: store.get().reducedMotion })) e.preventDefault();
  };

  // Lo strato GL resta montato anche se va 'off' per contesto perso o qualità
  // (lo shader-engineer può tornare 'on'); si smonta solo dopo il tetto degli 8 s.
  const mostraScena = Scena !== null && !(gl === 'off' && glMotivo === 'tempo');

  return (
    <div
      className="ssc-root"
      lang="it"
      data-gl={gl}
      data-motion={ridotto ? 'reduced' : 'full'}
      data-orient={orient}
      data-quota={quota}
      data-scheda={schedaAperta ? 'aperta' : undefined}
      data-altezza={bassa ? 'bassa' : undefined}
      data-asta={modoAsta}
      data-fermo={fermo === null ? undefined : fermo}
      onClick={suClic}
    >
      <a className="ssc-salto" href={`#${ID_CONTENUTO}`}>
        {SALTI.contenuto}
      </a>
      <a className="ssc-salto" href={`#${ID_PLANNING}`}>
        {SALTI.planning}
      </a>

      <ConceptBackButton />

      <Fondale />
      {mostraScena && Scena !== null ? <Scena /> : null}

      <div ref={contenutoRef} className="ssc-contenuto">
        <Testata />
        <Asta />
        <main id={ID_CONTENUTO} className="ssc-main">
          <Apertura />
          <Gomme />
          <Freni />
          <Sottoscocca />
          <Deposito />
          <PonteLibero />
          <Officina />
        </main>
        <Piede />
      </div>

      <BarraLavoro />
      <Scheda />

      <div ref={annuncioRef} className="ssc-sr" aria-live="polite" aria-atomic="true" />
    </div>
  );
}
