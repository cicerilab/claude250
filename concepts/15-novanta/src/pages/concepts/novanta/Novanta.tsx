/**
 * NOVANTA · radice del concept (scaffold-engineer, tech-architect §3.1 e §9).
 *
 * Cosa fa, in ordine:
 * 1. prima del primo render (inizializzatore di useState): runtime e storia
 *    da capo, store dalla memoria e dall'URL (vista, invito, prenotazione
 *    salvata, `?oggi=`, `?invio=ko`, `?posto=preso`, `?motivo=`, frammento),
 *    misure e decisione della vista (core/modo.ts): il primo render è già
 *    quadrante o elenco, con il contenuto già all'angolo del frammento;
 * 2. rende `.nov-root` con `data-modo`, `data-geo`, `data-attivo`, `data-dir`,
 *    `data-motion`, `data-pronto`; i link di salto; il bottone "Torna in
 *    Ciceri Lab" del sito; testata, avviso dell'elenco, quadrante, `<main>`
 *    con il Palco e i sette angoli, piede; la regione aria-live degli angoli;
 * 3. al mount: variabili del perno sulla radice, frammento corretto,
 *    `track('apri_concept')`, titolo e description, fondo di html/body,
 *    font, reduced motion, ticker, attività, viewport e vista al resize,
 *    blocco dello scroll in vista quadrante, Indietro/Avanti, foto pronte;
 * 4. esegue le richieste d'angolo quando nessun braccio è montato (vista
 *    elenco), porta il fuoco all'h2 dopo un salto o un cambio di vista;
 * 5. allo smontaggio rimette html/body, titolo, description, font com'erano.
 *
 * Nessun accesso a window/document a livello di modulo (prerender del sito).
 */

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import ConceptBackButton from '@/components/ConceptBackButton';
import { track } from '@/lib/analytics';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './dial/arco.css';
import './motion/motion.css';
import './interaction/interaction.css';

import { ANNUNCI, META, SALTI } from './content/testi';
import { ascoltaReducedMotion, prefersReducedMotion } from './core/capabilities';
import { injectFonts } from './core/fonts';
import { preparaFoto } from './core/foto';
import { guidaPresente } from './core/guida';
import { annotaArrivo, ascoltaPopstate, azzeraStoria, leggiHash, scriviHash, segnaScritto, togliHash } from './core/hash';
import { idAngolo, idTitolo, ID_CONTENUTO } from './core/ids';
import { applicaModo, decidiModo, misureCorrenti, type DecisioneModo } from './core/modo';
import { bloccaPagina, impostaFondoPagina, ripristinaPagina } from './core/pagina';
import { ticker } from './core/ticker';
import { misuraViewport, osservaViewport } from './core/viewport';
import { ANGOLI, eAngolo, type Angolo } from './dial/geometria';
import { ascoltaAttivita } from './interaction/attivita';
import { runtime } from './state/runtime';
import {
  aggiornaModo,
  dataIso,
  impostaAttivo,
  impostaReducedMotion,
  inizializzaStore,
  richiediAngolo,
  store,
  useNovanta,
  type OrigineRichiesta,
} from './state/store';
import { COLORI } from './styles/tokens';

import Palco from './layout/Palco';
import AvvisoElenco from './sections/Elenco/AvvisoElenco';
import Piede from './sections/Elenco/Piede';
import Esercizi from './sections/Esercizi/Esercizi';
import Osteopatia from './sections/Osteopatia/Osteopatia';
import Prenota from './sections/Prenota/Prenota';
import PrezziDove from './sections/PrezziDove/PrezziDove';
import PrimoIncontro from './sections/PrimoIncontro/PrimoIncontro';
import Quadrante from './sections/Quadrante/Quadrante';
import Testata from './sections/Testata/Testata';
import Trattamenti from './sections/Trattamenti/Trattamenti';
import Zero from './sections/Zero/Zero';

const ORIGINI: readonly OrigineRichiesta[] = ['parola', 'prenota', 'hash', 'popstate', 'salto', 'passo', 'tastiera', 'elenco'];

/** Calcola la vista dalle misure di adesso (al mount e nel debounce del resize). */
function decidiOra(): DecisioneModo {
  misuraViewport();
  const s = store.get();
  return decidiModo(misureCorrenti(s.preferenzaVista, s.modo));
}

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

/** Porta il fuoco all'h2 di un angolo; in elenco prima lo porta in vista. */
function fuocoAlTitolo(a: Angolo, elenco: boolean, ridotto: boolean): void {
  const titolo = document.getElementById(idTitolo(a));
  if (titolo === null) return;
  if (elenco) {
    document.getElementById(idAngolo(a))?.scrollIntoView({ behavior: ridotto ? 'auto' : 'smooth', block: 'start' });
  }
  titolo.focus({ preventScroll: true });
}

/** In elenco: la sezione più visibile nella finestra (per tornare al quadrante sullo stesso angolo). */
function angoloPiuVisibile(): Angolo | null {
  let migliore: Angolo | null = null;
  let area = 0;
  const h = window.innerHeight;
  for (const a of ANGOLI) {
    const el = document.getElementById(idAngolo(a));
    if (el === null) continue;
    const r = el.getBoundingClientRect();
    const visibile = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
    if (visibile > area) {
      area = visibile;
      migliore = a;
    }
  }
  return migliore;
}

export default function Novanta() {
  const rootRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  // 1. Tutto da capo, PRIMA del primo render delle sezioni.
  const [avvio] = useState<DecisioneModo | null>(() => {
    runtime.reset();
    azzeraStoria();
    if (typeof window === 'undefined') return null;
    inizializzaStore({
      search: window.location.search,
      hash: window.location.hash,
      reducedMotion: prefersReducedMotion(),
      oggi: dataIso(new Date()),
    });
    const d = decidiOra();
    aggiornaModo(d, d.perno.r);
    return d;
  });

  const modo = useNovanta((s) => s.modo);
  const geometria = useNovanta((s) => s.geometria);
  const attivo = useNovanta((s) => s.attivo);
  const direzione = useNovanta((s) => s.direzione);
  const ridotto = useNovanta((s) => s.reducedMotion);
  const preferenza = useNovanta((s) => s.preferenzaVista);
  const richiesta = useNovanta((s) => s.richiesta);
  const [pronto, setPronto] = useState(false);

  // 3. Variabili del perno sulla radice e frammento corretto, prima della pittura.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    if (avvio !== null) applicaModo(root, avvio);
    const l = leggiHash(window.location.hash);
    if (l.tipo === 'angolo') {
      if (!l.esatto) scriviHash(l.angolo, 'replace');
      segnaScritto(l.angolo);
      if (store.get().modo === 'elenco' && l.angolo !== 0) {
        document.getElementById(idAngolo(l.angolo))?.scrollIntoView({ block: 'start' });
      }
    } else {
      if (l.tipo === 'sconosciuto') togliHash();
      segnaScritto(0);
    }
  }, [avvio]);

  useEffect(() => {
    setPronto(true);
  }, []);

  useMetaPagina();

  // Apertura del prototipo: una volta per montaggio (guardia per StrictMode).
  const tracciato = useRef(false);
  useEffect(() => {
    if (tracciato.current) return;
    tracciato.current = true;
    track('apri_concept', { concept: 15 });
  }, []);

  // Fondo albicocca su html/body (niente strisce nel rimbalzo), rimesso allo smontaggio.
  useEffect(() => {
    impostaFondoPagina(COLORI.albicocca);
    return () => {
      ripristinaPagina();
    };
  }, []);

  useEffect(() => injectFonts(), []);

  useEffect(() => ascoltaReducedMotion(impostaReducedMotion), []);

  // Ticker (pausa con la scheda nascosta) e attività dell'utente (invito, trackpad).
  useEffect(() => {
    const root = rootRef.current;
    const staccaTicker = ticker.attiva();
    const staccaAttivita = root !== null ? ascoltaAttivita(root) : () => undefined;
    return () => {
      staccaAttivita();
      staccaTicker();
    };
  }, []);

  // Viewport e vista al resize (debounce 100 ms).
  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return undefined;
    return osservaViewport(root, () => {
      applicaModo(root, decidiOra());
    });
  }, []);

  // Cambio di preferenza (testata): si ricalcola subito. Uscendo dall'elenco
  // si torna all'angolo della sezione più visibile (ux-architect §5.9).
  const preferenzaPrima = useRef(preferenza);
  useLayoutEffect(() => {
    if (preferenzaPrima.current === preferenza) return;
    preferenzaPrima.current = preferenza;
    const root = rootRef.current;
    if (root === null) return;
    if (store.get().modo === 'elenco') {
      const a = angoloPiuVisibile();
      if (a !== null) impostaAttivo(a);
    }
    applicaModo(root, decidiOra());
  }, [preferenza]);

  // Scroll della pagina bloccato in vista quadrante, libero in elenco.
  useEffect(() => {
    bloccaPagina(modo === 'quadrante');
  }, [modo]);

  // Indietro / Avanti del browser.
  useEffect(
    () =>
      ascoltaPopstate((a) => {
        richiediAngolo(a, 'popstate', false);
      }),
    [],
  );

  // Foto degli angoli che non si vedono all'arrivo.
  useEffect(() => preparaFoto(['attrezzi', 'ingresso']), []);

  // 4. Richieste d'angolo senza un braccio montato (vista elenco, o quadrante
  //    non ancora montato): angolo subito, hash, scroll in elenco.
  useEffect(() => {
    if (richiesta === null) return;
    const s = store.get();
    if (s.modo === 'quadrante' && guidaPresente()) return;
    impostaAttivo(richiesta.angolo);
    if (s.modo === 'elenco') {
      if (richiesta.origine !== 'popstate') scriviHash(richiesta.angolo, 'replace');
      if (!richiesta.fuoco) {
        document.getElementById(idAngolo(richiesta.angolo))?.scrollIntoView({ behavior: s.reducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    } else if (richiesta.origine !== 'popstate') {
      annotaArrivo(richiesta.angolo);
    }
  }, [richiesta]);

  // Fuoco all'h2 quando l'angolo richiesto è in vista (subito in elenco,
  // all'arrivo del braccio in quadrante).
  const focoFatto = useRef(0);
  useEffect(() => {
    if (richiesta === null || !richiesta.fuoco || richiesta.n === focoFatto.current) return;
    if (richiesta.angolo !== attivo) return;
    focoFatto.current = richiesta.n;
    fuocoAlTitolo(attivo, modo === 'elenco', store.get().reducedMotion);
  }, [richiesta, attivo, modo]);

  // Cambio di vista: fuoco all'h2 dell'angolo corrente nella nuova vista, annuncio.
  const modoPrima = useRef(modo);
  useEffect(() => {
    if (modoPrima.current === modo) return;
    modoPrima.current = modo;
    const live = liveRef.current;
    if (live !== null) live.textContent = modo === 'elenco' ? ANNUNCI.vistaElenco : ANNUNCI.vistaQuadrante;
    fuocoAlTitolo(store.get().attivo, modo === 'elenco', store.get().reducedMotion);
  }, [modo]);

  // Annuncio del nome dell'angolo a ogni cambio (non all'arrivo).
  const attivoPrima = useRef(attivo);
  useEffect(() => {
    if (attivoPrima.current === attivo) return;
    attivoPrima.current = attivo;
    const live = liveRef.current;
    if (live !== null && store.get().modo === 'quadrante') live.textContent = ANNUNCI.angolo(attivo);
  }, [attivo]);

  // Link interni `#gradi-N`: un solo ascoltatore delegato (parole del
  // quadrante, "Prenota", link di salto, rimandi tra angoli, vista elenco).
  // `data-nov-origine` sul link dice chi chiama (default 'parola').
  const suClic = (e: ReactMouseEvent<HTMLDivElement>): void => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const bersaglio = e.target;
    if (!(bersaglio instanceof Element)) return;
    const link = bersaglio.closest<HTMLAnchorElement>('a[href^="#gradi-"]');
    if (link === null || !e.currentTarget.contains(link)) return;
    const l = leggiHash(link.getAttribute('href') ?? '');
    if (l.tipo !== 'angolo') return;
    e.preventDefault();
    const o = link.dataset['novOrigine'];
    const origine = ORIGINI.find((x) => x === o) ?? (store.get().modo === 'elenco' ? 'elenco' : 'parola');
    richiediAngolo(l.angolo, origine, true);
  };

  return (
    <div
      ref={rootRef}
      className="nov-root"
      data-modo={modo}
      data-geo={geometria}
      data-attivo={eAngolo(attivo) ? attivo : 0}
      data-dir={direzione}
      data-motion={ridotto ? 'reduced' : 'full'}
      data-pronto={pronto ? '1' : '0'}
      onClick={suClic}
    >
      <a className="nov-salto" href={`#${idAngolo(attivo)}`} data-nov-origine="salto">
        {SALTI.contenuto}
      </a>
      <a className="nov-salto" href={`#${idAngolo(90)}`} data-nov-origine="prenota">
        {SALTI.prenotazione}
      </a>

      <ConceptBackButton />

      <Testata />
      <AvvisoElenco />
      <Quadrante />

      <main id={ID_CONTENUTO} className="nov-main">
        <Palco>
          <Zero />
          <PrimoIncontro />
          <Trattamenti />
          <Prenota />
          <Osteopatia />
          <Esercizi />
          <PrezziDove />
        </Palco>
      </main>

      <Piede />

      <p ref={liveRef} className="nov-sr" aria-live="polite" />
    </div>
  );
}
