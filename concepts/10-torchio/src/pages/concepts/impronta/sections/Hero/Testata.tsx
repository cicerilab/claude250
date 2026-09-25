/**
 * IMPRONTA · Testata, segnapagina e indice (section-builder-hero).
 *
 * Montata da Impronta.tsx PRIMA del <main>, come fratello del contenuto:
 * `position: sticky` vale per tutta la pagina e il <header> resta il
 * landmark `banner` (scaffold §3).
 *
 * Tre pezzi, un solo file:
 * 1. **Testata** (<header>):
 *    - da 1024 px (ux-architect 2.2): marchio in lamina, tre voci (lavori,
 *      legatoria, bottega) con la voce corrente sottolineata e
 *      `aria-current="location"`, "Prova la tua" in lamina (nel banco diventa
 *      il testo "sei sul banco"). 64 px nell'hero, 56 px quando è attaccata in
 *      alto (trucco `top: -8px`: nessun salto di layout), fondo pieno della
 *      carta con la costa `--imp-ombra-testata`;
 *    - sotto 1024 px: una riga sola con il marchio e il bottone "indice · la
 *      sezione in cui sei". Resta attaccata in alto ma si toglie di mezzo
 *      scorrendo in giù e torna scorrendo in su (e sparisce durante un
 *      viaggio verso un'ancora: il titolo d'arrivo resta libero).
 * 2. **Richiamo "Prova la tua" in basso a destra** (sotto 1024 px): compare
 *    solo quando il bottone dell'hero è uscito dallo schermo, sparisce nel
 *    banco, nel colophon (che ha il suo), con la tastiera aperta e con
 *    l'indice aperto. Mai due "Prova la tua" visibili insieme su mobile.
 * 3. **Indice** (<dialog> modale, top layer): foglio che sale dal basso fino
 *    al 78%, con le otto sezioni ("sei qui" scritto), la carta del sito
 *    (radiogroup sincronizzato con lo store) e "Luce col telefono: sì / no".
 *    Si chiude con "chiudi", Esc, tocco fuori, trascinamento in giù, scelta
 *    di una voce. Focus intrappolato e contenuto dietro `inert` li dà
 *    `showModal()`; scroll della pagina bloccato mentre è aperto.
 *
 * Differenza voluta dall'ux-architect 2.3 (docs/section-builder-hero.md):
 * il bottone "Torna in Ciceri Lab" del sito sta IN BASSO A SINISTRA sotto i
 * 640 px (integrazione-sito.md, fatto 3, prevale): il segnapagina a tutta
 * larghezza in basso gli finirebbe sopra. Per questo "indice" sale nella
 * riga in alto e in basso resta solo "Prova la tua", a destra.
 * Nessun link "torna" del concept: c'è quello del sito.
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import './testata.css';

import marchioUrl from '../../assets/svg/marchio-impronta.svg?url';
import {
  ANNUNCI,
  BANCO,
  CARTE,
  COMUNI,
  INDICE as TESTI_INDICE,
  ORDINE_CARTE,
  ORDINE_SEZIONI,
  SEGNAPAGINA,
  SEZIONI,
  TESTATA,
  type SezioneId,
} from '../../content/testi';
import { getLenis } from '../../core/lenis';
import { ticker } from '../../core/ticker';
import { impostaLuceTelefono, useGyro } from '../../interaction/gyroPermission';
import { cambiaCarta } from '../../interaction/paperWave';
import { INDICE as MOTO_INDICE, LARGHEZZA_TESTATA } from '../../motion/choreography';
import { Molla, MOLLE } from '../../motion/spring';
import { viaggioAncora } from '../../motion/useScrollProgress';
import { runtime } from '../../state/runtime';
import { useImpronta, type Carta } from '../../state/store';

/* ------------------------------------------------------------------ costanti */

const ID_INDICE = 'imp-indice';
const ID_INDICE_TITOLO = 'imp-indice-titolo';
const ID_INDICE_LUCE = 'imp-indice-luce';

/** Oltre questo scroll (px) la testata è "attaccata": fondo pieno e costa. */
const SOGLIA_ATTACCATA = 4;
/** Scroll in su (px, sommato) che fa tornare la riga mobile dopo un'uscita. */
const RIENTRO_SU = 28;
/** Differenza tra altezza della finestra e della viewport visibile oltre cui la tastiera è aperta. */
const SOGLIA_TASTIERA = 150;
/** Banda di lettura per la sezione corrente: una riga al 38% dell'altezza. */
const BANDA_SEZIONE = '-38% 0px -61% 0px';

/**
 * Voce della testata desktop da accendere per ogni sezione (ux-architect 2.2):
 * le sezioni senza voce accendono la voce più vicina che le precede; nell'hero
 * e nel banco non si accende nulla.
 */
const VOCE_PER_SEZIONE: Readonly<Record<SezioneId, string | null>> = {
  inizio: null,
  lavori: 'lavori',
  tecniche: 'lavori',
  carta: 'lavori',
  legatoria: 'legatoria',
  banco: null,
  bottega: 'bottega',
  colophon: 'bottega',
};

/* ------------------------------------------------------------------ utilità */

function eLargo(): boolean {
  const w = runtime.viewport.w > 0 ? runtime.viewport.w : window.innerWidth;
  return w >= LARGHEZZA_TESTATA;
}

/** Sezione in cui si sta leggendo: quella che attraversa la banda al 38% dell'altezza. */
function useSezioneCorrente(): SezioneId {
  const [sezione, setSezione] = useState<SezioneId>('inizio');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const dentro = new Set<SezioneId>();
    const elementi = new Map<Element, SezioneId>();
    for (const id of ORDINE_SEZIONI) {
      const el = document.getElementById(id);
      if (el !== null) elementi.set(el, id);
    }
    const osservatore = new IntersectionObserver(
      (voci) => {
        for (const v of voci) {
          const id = elementi.get(v.target);
          if (id === undefined) continue;
          if (v.isIntersecting) dentro.add(id);
          else dentro.delete(id);
        }
        // Se due sezioni toccano la banda (bordo comune), vince la più avanti.
        let scelta: SezioneId | null = null;
        for (const id of ORDINE_SEZIONI) if (dentro.has(id)) scelta = id;
        if (scelta !== null) setSezione(scelta);
      },
      { rootMargin: BANDA_SEZIONE, threshold: 0 },
    );
    for (const el of elementi.keys()) osservatore.observe(el);
    return () => {
      osservatore.disconnect();
    };
  }, []);

  return sezione;
}

/** true finché il bottone "Prova la tua" dell'hero è (anche solo in parte) sullo schermo. */
function useCtaHeroVisibile(): boolean {
  const [visibile, setVisibile] = useState(true);
  useEffect(() => {
    const el = document.querySelector('[data-imp-hero-cta]');
    if (el === null || typeof IntersectionObserver === 'undefined') return undefined;
    const osservatore = new IntersectionObserver(
      (voci) => {
        const ultima = voci[voci.length - 1];
        if (ultima !== undefined) setVisibile(ultima.isIntersecting);
      },
      { threshold: 0 },
    );
    osservatore.observe(el);
    return () => {
      osservatore.disconnect();
    };
  }, []);
  return visibile;
}

/** true con la tastiera del telefono aperta (la viewport visibile si accorcia molto). */
function useTastieraAperta(): boolean {
  const [aperta, setAperta] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (vv === null || vv === undefined) return undefined;
    const misura = (): void => {
      setAperta(window.innerHeight - vv.height > SOGLIA_TASTIERA);
    };
    misura();
    vv.addEventListener('resize', misura);
    return () => {
      vv.removeEventListener('resize', misura);
    };
  }, []);
  return aperta;
}

/**
 * Stato della testata nel ticker (niente listener di scroll propri):
 * - `data-attaccata` appena la pagina scorre (fondo pieno e costa);
 * - `data-via` sotto 1024 px quando si scorre in giù o durante un viaggio
 *   verso un'ancora; torna scorrendo in su, in cima, o col fuoco dentro.
 */
function useStatoTestata(ref: RefObject<HTMLElement>, bloccata: boolean): void {
  const bloccataRef = useRef(bloccata);
  useEffect(() => {
    bloccataRef.current = bloccata;
    ticker.wake();
  }, [bloccata]);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return undefined;

    let ultimoY = runtime.scrollY;
    let su = 0;
    let attaccata = false;
    let via = false;
    let scrittoAttaccata: boolean | null = null;
    let scrittoVia: boolean | null = null;
    let fuocoDentro = false;

    const leggi = (): void => {
      const y = runtime.scrollY;
      const dy = y - ultimoY;
      ultimoY = y;
      attaccata = y > SOGLIA_ATTACCATA;

      if (eLargo() || bloccataRef.current || fuocoDentro) {
        via = false;
        su = 0;
        return;
      }
      const altezza = el.offsetHeight;
      if (viaggioAncora.attivo()) {
        via = y > altezza;
        su = 0;
      } else if (y <= altezza) {
        via = false;
        su = 0;
      } else if (dy > 0.5) {
        via = true;
        su = 0;
      } else if (dy < -0.5) {
        su += -dy;
        if (su >= RIENTRO_SU) via = false;
      }
    };

    const scrivi = (): void => {
      if (scrittoAttaccata !== attaccata) {
        scrittoAttaccata = attaccata;
        el.toggleAttribute('data-attaccata', attaccata);
      }
      if (scrittoVia !== via) {
        scrittoVia = via;
        el.toggleAttribute('data-via', via);
      }
    };

    const suFuocoDentro = (): void => {
      fuocoDentro = true;
      ticker.wake();
    };
    const suFuocoFuori = (e: FocusEvent): void => {
      fuocoDentro = e.relatedTarget instanceof Node && el.contains(e.relatedTarget);
      ticker.wake();
    };

    el.addEventListener('focusin', suFuocoDentro);
    el.addEventListener('focusout', suFuocoFuori);
    const togliLeggi = ticker.add(leggi, 'read');
    const togliScrivi = ticker.add(scrivi, 'write');
    const togliViaggio = viaggioAncora.ascolta(() => {
      ticker.wake();
    });

    return () => {
      el.removeEventListener('focusin', suFuocoDentro);
      el.removeEventListener('focusout', suFuocoFuori);
      togliLeggi();
      togliScrivi();
      togliViaggio();
    };
  }, [ref]);
}

/* ------------------------------------------------------------------ blocco dello scroll */

/** Blocca lo scroll della pagina mentre l'indice è aperto (lenis fermo, overflow di <html>). */
function bloccaScroll(): () => void {
  const html = document.documentElement;
  const prima = html.style.overflow;
  const lenis = getLenis();
  lenis?.stop();
  html.style.overflow = 'hidden';
  let sbloccato = false;
  return () => {
    if (sbloccato) return;
    sbloccato = true;
    html.style.overflow = prima;
    lenis?.start();
  };
}

/* ------------------------------------------------------------------ indice */

type StatoFoglio = 'chiuso' | 'sale' | 'aperto' | 'scende';

interface PropsIndice {
  aperto: boolean;
  sezione: SezioneId;
  onChiuso: () => void;
  annuncia: (testo: string) => void;
}

function Indice({ aperto, sezione, onChiuso, annuncia }: PropsIndice) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const foglioRef = useRef<HTMLDivElement>(null);
  const [stato, setStato] = useState<StatoFoglio>('chiuso');
  const ridotto = useImpronta((s) => s.reducedMotion);
  const carta = useImpronta((s) => s.carta);
  const gyro = useGyro();
  const sbloccaRef = useRef<(() => void) | null>(null);
  const timerRef = useRef(0);
  const ridottoRef = useRef(ridotto);
  const onChiusoRef = useRef(onChiuso);
  useEffect(() => {
    ridottoRef.current = ridotto;
    onChiusoRef.current = onChiuso;
  });

  const sblocca = useCallback((): void => {
    sbloccaRef.current?.();
    sbloccaRef.current = null;
  }, []);

  /** Chiusura con il foglio che scende; `subito` salta l'animazione. */
  const chiudi = useCallback(
    (subito = false): void => {
      const dialog = dialogRef.current;
      if (dialog === null || !dialog.open) return;
      sblocca();
      window.clearTimeout(timerRef.current);
      const durata = subito || ridottoRef.current ? 0 : MOTO_INDICE.scende;
      setStato('scende');
      timerRef.current = window.setTimeout(() => {
        if (dialog.open) dialog.close();
      }, durata);
    },
    [sblocca],
  );

  // Apertura: showModal (top layer, focus intrappolato, fondo inert), poi il
  // foglio sale al frame dopo, così la transizione parte da translateY(100%).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return undefined;
    if (aperto && !dialog.open) {
      window.clearTimeout(timerRef.current);
      setStato('chiuso');
      dialog.showModal();
      sbloccaRef.current = bloccaScroll();
      annuncia(ANNUNCI.indiceAperto);
      let passo2 = 0;
      const passo1 = window.requestAnimationFrame(() => {
        passo2 = window.requestAnimationFrame(() => {
          setStato('sale');
          timerRef.current = window.setTimeout(() => setStato('aperto'), ridottoRef.current ? 0 : MOTO_INDICE.sale);
        });
      });
      return () => {
        window.cancelAnimationFrame(passo1);
        window.cancelAnimationFrame(passo2);
      };
    }
    if (!aperto && dialog.open) chiudi();
    return undefined;
  }, [aperto, annuncia, chiudi]);

  // Eventi nativi del dialog: Esc (cancel) passa dalla chiusura animata;
  // `close` riporta lo stato e sblocca comunque lo scroll.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return undefined;
    const suCancel = (e: Event): void => {
      e.preventDefault();
      chiudi();
    };
    const suClose = (): void => {
      sblocca();
      window.clearTimeout(timerRef.current);
      setStato('chiuso');
      if (foglioRef.current !== null) foglioRef.current.style.transform = '';
      annuncia(ANNUNCI.indiceChiuso);
      onChiusoRef.current();
    };
    dialog.addEventListener('cancel', suCancel);
    dialog.addEventListener('close', suClose);
    return () => {
      dialog.removeEventListener('cancel', suCancel);
      dialog.removeEventListener('close', suClose);
    };
  }, [annuncia, chiudi, sblocca]);

  // Smontaggio: niente scroll bloccato, niente timer.
  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      sbloccaRef.current?.();
      sbloccaRef.current = null;
    },
    [],
  );

  /* ---------- tocco fuori dal foglio */
  const premutoSulFondo = useRef(false);
  const suPuntatoreGiuDialog = (e: ReactPointerEvent<HTMLDialogElement>): void => {
    premutoSulFondo.current = e.target === e.currentTarget;
  };
  const suClicDialog = (e: ReactMouseEvent<HTMLDialogElement>): void => {
    if (e.target === e.currentTarget && premutoSulFondo.current) chiudi();
    premutoSulFondo.current = false;
  };

  /* ---------- trascinamento verso il basso (dalla testa del foglio) */
  const trascina = useRef<{
    id: number;
    y0: number;
    dy: number;
    campioni: Array<{ y: number; t: number }>;
    altezza: number;
  } | null>(null);
  const mollaRef = useRef<Molla | null>(null);
  const togliTickRef = useRef<(() => void) | null>(null);

  const scriviSpostamento = useCallback((px: number): void => {
    const foglio = foglioRef.current;
    if (foglio === null) return;
    foglio.style.transform = px > 0.1 ? `translate3d(0, ${px.toFixed(1)}px, 0)` : '';
  }, []);

  const fermaTick = (): void => {
    togliTickRef.current?.();
    togliTickRef.current = null;
  };

  useEffect(
    () => () => {
      togliTickRef.current?.();
      togliTickRef.current = null;
    },
    [],
  );

  const suGiuTesta = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (e.button !== 0 || stato !== 'aperto') return;
    const bersaglio = e.target;
    if (bersaglio instanceof Element && bersaglio.closest('button, a, input, label') !== null) return;
    const foglio = foglioRef.current;
    if (foglio === null) return;
    fermaTick();
    mollaRef.current = null;
    e.currentTarget.setPointerCapture(e.pointerId);
    trascina.current = {
      id: e.pointerId,
      y0: e.clientY,
      dy: 0,
      campioni: [{ y: e.clientY, t: e.timeStamp }],
      altezza: foglio.offsetHeight,
    };
    foglio.setAttribute('data-trascina', '');
    togliTickRef.current = ticker.add(() => {
      const t = trascina.current;
      if (t !== null) scriviSpostamento(t.dy);
      return t !== null;
    }, 'write');
  };

  const suMuoviTesta = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const t = trascina.current;
    if (t === null || t.id !== e.pointerId) return;
    t.dy = Math.max(0, e.clientY - t.y0);
    t.campioni.push({ y: e.clientY, t: e.timeStamp });
    if (t.campioni.length > 5) t.campioni.shift();
    ticker.wake();
  };

  const suSuTesta = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const t = trascina.current;
    if (t === null || t.id !== e.pointerId) return;
    trascina.current = null;
    fermaTick();
    const foglio = foglioRef.current;
    if (foglio === null) return;
    foglio.removeAttribute('data-trascina');

    const primo = t.campioni[0];
    const ultimo = t.campioni[t.campioni.length - 1];
    const velocita =
      primo !== undefined && ultimo !== undefined && ultimo.t > primo.t ? (ultimo.y - primo.y) / (ultimo.t - primo.t) : 0;

    if (t.dy > t.altezza * MOTO_INDICE.sogliaChiusura || velocita > MOTO_INDICE.velocitaChiusura) {
      // Dalla posizione corrente il CSS porta il foglio giù (stato 'scende').
      scriviSpostamento(t.dy);
      window.requestAnimationFrame(() => {
        scriviSpostamento(0);
        chiudi();
      });
      return;
    }

    if (ridottoRef.current || t.dy < 0.5) {
      scriviSpostamento(0);
      return;
    }
    // Torna su con la molla morbida, senza curva a tempo.
    const molla = new Molla(t.dy, MOLLE.morbida);
    molla.verso(0);
    molla.spingi(-Math.max(0, velocita) * 1000);
    mollaRef.current = molla;
    foglio.setAttribute('data-trascina', '');
    togliTickRef.current = ticker.add((dt) => {
      const m = mollaRef.current;
      if (m === null) return false;
      const inMoto = m.passo(dt);
      scriviSpostamento(Math.max(0, m.valore));
      if (!inMoto) {
        mollaRef.current = null;
        foglio.removeAttribute('data-trascina');
        scriviSpostamento(0);
        togliTickRef.current?.();
        togliTickRef.current = null;
      }
      return inMoto;
    }, 'write');
  };

  const suAnnullaTesta = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const t = trascina.current;
    if (t === null || t.id !== e.pointerId) return;
    trascina.current = null;
    fermaTick();
    foglioRef.current?.removeAttribute('data-trascina');
    scriviSpostamento(0);
  };

  /* ---------- scelte */
  const suVoce = (): void => {
    // Il viaggio verso l'ancora lo fa Impronta.tsx (clic delegato sui link #):
    // qui si chiude il foglio e si sblocca lo scroll PRIMA che il viaggio parta.
    chiudi();
  };

  const suCarta = (c: Carta) => (e: ChangeEvent<HTMLInputElement>) => {
    const origine = e.currentTarget.closest('label') ?? e.currentTarget;
    void cambiaCarta(c, origine).then(() => {
      annuncia(ANNUNCI.carta(c));
    });
  };

  const suLuceTelefono = (acceso: boolean) => (): void => {
    // Con `true` va chiamata dentro il clic: su iOS apre il permesso di sistema.
    void impostaLuceTelefono(acceso).then((esito) => {
      annuncia(esito === 'attivo' ? ANNUNCI.tiltAttivo : ANNUNCI.tiltSpento);
    });
  };

  const mostraLuce = !ridotto && gyro.stato !== 'non-supportato';
  const luceAccesa = gyro.stato === 'attivo';

  return (
    <dialog
      ref={dialogRef}
      id={ID_INDICE}
      className="imp-indice"
      aria-labelledby={ID_INDICE_TITOLO}
      data-stato={stato}
      onPointerDown={suPuntatoreGiuDialog}
      onClick={suClicDialog}
    >
      <div ref={foglioRef} className="imp-indice__foglio">
        <div
          className="imp-indice__testa"
          onPointerDown={suGiuTesta}
          onPointerMove={suMuoviTesta}
          onPointerUp={suSuTesta}
          onPointerCancel={suAnnullaTesta}
        >
          <span className="imp-indice__linguetta" aria-hidden="true" />
          <h2 id={ID_INDICE_TITOLO} className="imp-indice__titolo">
            {TESTI_INDICE.titolo}
          </h2>
          <button
            type="button"
            className="imp-indice__chiudi imp-ix-premibile imp-ix-tocco"
            aria-label={TESTI_INDICE.chiudiAria}
            onClick={() => chiudi()}
          >
            <span aria-hidden="true">{TESTI_INDICE.chiudi}</span>
            <span className="imp-indice__croce" aria-hidden="true" />
          </button>
        </div>

        <div className="imp-indice__corpo">
          <nav aria-labelledby={ID_INDICE_TITOLO}>
            <ol className="imp-indice__voci imp-lista" role="list">
              {ORDINE_SEZIONI.map((id) => {
                const corrente = id === sezione;
                return (
                  <li key={id} className="imp-indice__riga">
                    <a
                      href={`#${id}`}
                      className="imp-indice__voce"
                      aria-current={corrente ? 'location' : undefined}
                      onClick={suVoce}
                    >
                      <span className="imp-indice__nome">{SEZIONI[id].indice}</span>
                      {corrente ? (
                        <span className="imp-indice__qui">
                          <span aria-hidden="true">◂ </span>
                          {TESTI_INDICE.seiQui}
                        </span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <fieldset className="imp-indice__carte">
            <legend className="imp-indice__sottotitolo">{TESTI_INDICE.cartaTitolo}</legend>
            <div className="imp-indice__campioni">
              {ORDINE_CARTE.map((c) => {
                const scelta = c === carta;
                return (
                  <label key={c} className="imp-indice__carta" data-scelta={scelta ? '' : undefined}>
                    <input
                      type="radio"
                      name="imp-indice-carta"
                      value={c}
                      className="imp-ix-scelta__input"
                      checked={scelta}
                      onChange={suCarta(c)}
                      aria-label={CARTE[c].radioAria}
                    />
                    <span className="imp-indice__campione imp-costa imp-fibra" data-carta={c} aria-hidden="true" />
                    <span className="imp-indice__carta-nome" aria-hidden="true">
                      {CARTE[c].nome}
                    </span>
                    <span className="imp-indice__carta-scelta" aria-hidden="true">
                      {scelta ? BANCO.carta.scelta : '\u00a0'}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {mostraLuce ? (
            <div className="imp-indice__luce" role="group" aria-labelledby={ID_INDICE_LUCE}>
              <p id={ID_INDICE_LUCE} className="imp-indice__sottotitolo">
                {TESTI_INDICE.luceTelefono}
              </p>
              <div className="imp-indice__interruttore">
                <button
                  type="button"
                  className="imp-indice__opzione imp-ix-premibile imp-ix-tocco"
                  aria-pressed={luceAccesa}
                  aria-busy={gyro.inAttesa || undefined}
                  onClick={suLuceTelefono(true)}
                >
                  {TESTI_INDICE.luceSi}
                </button>
                <button
                  type="button"
                  className="imp-indice__opzione imp-ix-premibile imp-ix-tocco"
                  aria-pressed={!luceAccesa}
                  onClick={suLuceTelefono(false)}
                >
                  {TESTI_INDICE.luceNo}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ testata */

export default function Testata() {
  const headerRef = useRef<HTMLElement>(null);
  const sezione = useSezioneCorrente();
  const ctaHeroVisibile = useCtaHeroVisibile();
  const tastiera = useTastieraAperta();
  const [indiceAperto, setIndiceAperto] = useState(false);
  const [annuncio, setAnnuncio] = useState('');

  useStatoTestata(headerRef, indiceAperto);

  const annuncia = useCallback((testo: string): void => {
    setAnnuncio((prima) => (prima === testo ? `${testo}\u00a0` : testo));
  }, []);

  const chiuso = useCallback((): void => {
    setIndiceAperto(false);
  }, []);

  const voceAccesa = VOCE_PER_SEZIONE[sezione];
  const nelBanco = sezione === 'banco';
  const richiamoVisibile = !ctaHeroVisibile && !nelBanco && sezione !== 'colophon' && !tastiera && !indiceAperto;

  const stileMarchio = { '--imp-segno': `url("${marchioUrl}")` } as CSSProperties;

  return (
    <>
      <header ref={headerRef} className="imp-testata">
        <div className="imp-testata__barra imp-page">
          <a href="#inizio" className="imp-testata__marchio" aria-label={TESTATA.marchioAria}>
            <span className="imp-testata__segno imp-segno-caldo" style={stileMarchio} aria-hidden="true">
              <span className="imp-segno-caldo__lamina" />
            </span>
          </a>

          <nav className="imp-testata__nav" aria-label={TESTATA.navAria}>
            <ul className="imp-testata__voci imp-lista" role="list">
              {TESTATA.voci.map((v) => (
                <li key={v.id}>
                  <a
                    href={v.href}
                    className="imp-testata__voce imp-ix-link"
                    aria-current={voceAccesa === v.id ? 'location' : undefined}
                  >
                    {v.etichetta}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="imp-testata__richiamo">
            {nelBanco ? (
              <span className="imp-testata__sul-banco">{COMUNI.seiSulBanco}</span>
            ) : (
              <a href="#banco" className="imp-testata__cta imp-lamina imp-ix-premibile" aria-label={TESTATA.provaAria}>
                {COMUNI.provaLaTua}
              </a>
            )}
          </div>

          <button
            type="button"
            className="imp-testata__indice imp-ix-premibile"
            aria-haspopup="dialog"
            aria-expanded={indiceAperto}
            aria-controls={ID_INDICE}
            aria-label={SEGNAPAGINA.apriAria(sezione)}
            onClick={() => setIndiceAperto(true)}
          >
            <span className="imp-testata__indice-parola">{SEGNAPAGINA.indice}</span>
            <span className="imp-testata__indice-sezione">{SEZIONI[sezione].segnapagina}</span>
          </button>
        </div>
      </header>

      <a
        href="#banco"
        className="imp-segnapagina imp-lamina imp-ix-premibile"
        aria-label={TESTATA.provaAria}
        data-visibile={richiamoVisibile ? '' : undefined}
        aria-hidden={richiamoVisibile ? undefined : true}
        tabIndex={richiamoVisibile ? undefined : -1}
      >
        {COMUNI.provaLaTua}
      </a>

      <Indice aperto={indiceAperto} sezione={sezione} onChiuso={chiuso} annuncia={annuncia} />

      <p className="imp-sr" aria-live="polite">
        {annuncio}
      </p>
    </>
  );
}
