/**
 * EVIDENZIA · radice del concept (scaffold-engineer).
 *
 * Cosa fa, in ordine:
 * 1. prima del primo render (inizializzatore di useState): runtime da capo,
 *    registrazione di `--evd-avanzamento` (motion), store dalla memoria
 *    (`evidenzia:giro`) e dall'URL (`?segna=`, `?giro=1`, `?scheda=`,
 *    `?vista=`, `?invio=ko`, `?mappa=ko`, `?oggi=`, hash `#scheda-214` /
 *    `#giro`), layout e reduced motion: i tratti ritrovati sono già interi al
 *    primo render, nessuno "entra";
 * 2. rende `.evd-root` con `data-layout`, `data-vista`, `data-motion`,
 *    `data-pannello` e le variabili del motion, i link di salto, il bottone
 *    del sito, il foglio (testata, striscia, main, piede), i comandi, scheda
 *    e giro quando aperti, la regione aria-live unica;
 * 3. al mount: `track('apri_concept')`, titolo e description, fondo di
 *    html/body, font, ticker, viewport, ascolto di layout e reduced motion,
 *    rimisura delle righe ai font pronti, prefetch del giro in idle,
 *    `?rubrica=`, voce live di `?segna=`;
 * 4. allo smontaggio: rimette titolo, description e fondo, ferma il ticker,
 *    azzera registro, canale dei segni, anti-lampeggio della vista e passaggi
 *    in corso.
 *
 * Nessun accesso a window/document a livello di modulo (prerender del sito).
 */

import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import ConceptBackButton from '@/components/ConceptBackButton';
import { track } from '@/lib/analytics';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './foglio/foglio.css';
import './interaction/interaction.css';

import { ORDINE_RUBRICHE, type Rubrica } from './content/annunci';
import { LIVE, META, SALTI } from './content/testi';
import { ID_ANNUNCI, ID_LIVE, ID_PREPARA, idRubrica, vaiAllAncora } from './core/ancore';
import { ascoltaReducedMotion, prefersReducedMotion } from './core/capabilities';
import { fontsReady, injectFonts } from './core/fonts';
import { ascoltaLayout, leggiLayout } from './core/layout';
import { ticker } from './core/ticker';
import { osservaViewport } from './core/viewport';
import Foglio from './foglio/Foglio';
import { azzeraCambioVista } from './interaction/cambioVista';
import { segni } from './interaction/segni';
import { variabiliMotion } from './motion/durate';
import { registraAvanzamento } from './motion/tratto';
import { fermaVista } from './motion/vista';
import { registro } from './state/registro';
import { runtime } from './state/runtime';
import {
  annuncia,
  impostaLayout,
  impostaReducedMotion,
  inizializzaStore,
  salvaAvvio,
  selReducedMotion,
  store,
  useEvidenzia,
} from './state/store';
import { COLORI } from './styles/tokens';

import Rubriche from './sections/Annunci/Rubriche';
import Piede from './sections/Box/Piede';
import Comandi from './sections/Comandi/Comandi';
import Scheda from './sections/Scheda/Scheda';
import RiquadroTesta from './sections/Testata/RiquadroTesta';
import StrisciaRubriche from './sections/Testata/StrisciaRubriche';
import Testata from './sections/Testata/Testata';

/** Il giro è un chunk a parte, prefetchato in idle dopo il primo render (tech-architect §9.5). */
const caricaGiro = () => import('./sections/Giro/Giro');
const Giro = lazy(caricaGiro);

/** Attesa prima di dire in live che il giro arriva da un link (la regione deve esistere già). */
const ATTESA_VOCE_URL = 900;

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

/** Fondo di html e body = carta (niente strisce di un altro colore nel rimbalzo iOS). */
function useFondoDocumento(): void {
  useEffect(() => {
    const html = document.documentElement.style.backgroundColor;
    const body = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = COLORI.carta;
    document.body.style.backgroundColor = COLORI.carta;
    return () => {
      document.documentElement.style.backgroundColor = html;
      document.body.style.backgroundColor = body;
    };
  }, []);
}

function eRubrica(v: string | null): v is Rubrica {
  return v !== null && (ORDINE_RUBRICHE as readonly string[]).includes(v);
}

export default function Evidenzia() {
  // 1. runtime e store da capo, PRIMA del primo render delle sezioni
  useState(() => {
    runtime.reset();
    if (typeof window !== 'undefined') {
      registraAvanzamento();
      inizializzaStore({
        search: window.location.search,
        hash: window.location.hash,
        reducedMotion: prefersReducedMotion(),
        layout: leggiLayout(),
      });
    }
    return true;
  });

  const layout = useEvidenzia((s) => s.layout);
  const vista = useEvidenzia((s) => s.vista);
  const ridotto = useEvidenzia(selReducedMotion);
  const schedaAperta = useEvidenzia((s) => s.schedaAperta);
  const giroAperto = useEvidenzia((s) => s.giroAperto);
  const voceLive = useEvidenzia((s) => s.voceLive);
  const voceLiveN = useEvidenzia((s) => s.voceLiveN);

  const stileMotion = useMemo(() => variabiliMotion(ridotto) as CSSProperties, [ridotto]);
  const pannello = schedaAperta !== null ? 'scheda' : giroAperto ? 'giro' : 'nessuno';

  useMetaPagina();
  useFondoDocumento();

  // apertura del prototipo: una volta per montaggio (guardia per StrictMode);
  // il giro arrivato da ?segna= (o ripulito) si salva adesso, non nell'inizializzatore
  const tracciato = useRef(false);
  useEffect(() => {
    salvaAvvio();
    if (tracciato.current) return;
    tracciato.current = true;
    track('apri_concept', { concept: 16 });
  }, []);

  // font di Google (tokens.ts → FONT_CSS_URL): tolti allo smontaggio solo se aggiunti qui
  useEffect(() => injectFonts(), []);

  // ticker (pausa con la scheda del browser nascosta) e misura della finestra
  useEffect(() => {
    const staccaTicker = ticker.attiva();
    const staccaViewport = osservaViewport();
    return () => {
      staccaViewport();
      staccaTicker();
    };
  }, []);

  // reduced motion e layout che cambiano a pagina aperta
  useEffect(() => ascoltaReducedMotion(impostaReducedMotion), []);
  useEffect(() => ascoltaLayout(impostaLayout), []);

  // righe d'attacco rimisurate quando arrivano i font (tech-architect §7.1)
  useEffect(() => {
    let vivo = true;
    void fontsReady().then(() => {
      if (vivo) registro.invalida();
    });
    const fonti = typeof document !== 'undefined' && 'fonts' in document ? document.fonts : null;
    const suFonti = (): void => {
      registro.invalida();
    };
    fonti?.addEventListener('loadingdone', suFonti);
    return () => {
      vivo = false;
      fonti?.removeEventListener('loadingdone', suFonti);
    };
  }, []);

  // il giro (chunk lazy) scaricato in idle dopo il primo render
  useEffect(() => {
    const prefetch = (): void => {
      void caricaGiro();
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetch, { timeout: 2000 });
      return () => {
        window.cancelIdleCallback(id);
      };
    }
    const timer = window.setTimeout(prefetch, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // ?rubrica= (inizio della rubrica, senza animazione) e voce live di ?segna=
  useEffect(() => {
    const rubrica = new URLSearchParams(window.location.search).get('rubrica');
    let timerRubrica = 0;
    if (eRubrica(rubrica)) {
      timerRubrica = window.setTimeout(() => {
        vaiAllAncora(idRubrica(rubrica), { blocco: 'start', liscio: false });
      }, 0);
    }
    const n = store.get().daUrl;
    const timerVoce = n > 0 ? window.setTimeout(() => annuncia(LIVE.daUrl(n)), ATTESA_VOCE_URL) : 0;
    return () => {
      window.clearTimeout(timerRubrica);
      window.clearTimeout(timerVoce);
    };
  }, []);

  // smontaggio: niente stati appesi nel sito vero
  useEffect(
    () => () => {
      fermaVista();
      azzeraCambioVista();
      segni.azzera();
      registro.azzera();
    },
    [],
  );

  // link interni: un solo ascoltatore delegato per tutti gli `a[href^="#"]`
  // (salti, sommario, striscia, posti): stesso viaggio e stesso fuoco all'arrivo
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
    if (id.length > 0 && vaiAllAncora(id)) e.preventDefault();
  };

  return (
    <div
      className="evd-root"
      data-layout={layout}
      data-vista={vista}
      data-motion={ridotto ? 'reduced' : 'full'}
      data-pannello={pannello}
      style={stileMotion}
      onClick={suClic}
    >
      <a className="evd-salto" href={`#${idRubrica('appartamenti')}`}>
        {SALTI.annunci}
      </a>
      <a className="evd-salto" href={`#${ID_PREPARA}`}>
        {SALTI.giro}
      </a>

      <ConceptBackButton />

      <Foglio>
        <Testata />
        <StrisciaRubriche />
        <main id={ID_ANNUNCI} className="evd-annunci evd-colonne">
          <RiquadroTesta />
          <Rubriche />
        </main>
        <Piede />
      </Foglio>

      <Comandi />

      {schedaAperta !== null ? <Scheda key={schedaAperta} /> : null}
      {giroAperto ? (
        <Suspense fallback={null}>
          <Giro />
        </Suspense>
      ) : null}

      <div id={ID_LIVE} className="evd-live" role="status" aria-live="polite" aria-atomic="true" data-evd-vivo="">
        {voceLive.length > 0 ? <p key={voceLiveN}>{voceLive}</p> : null}
      </div>
    </div>
  );
}
