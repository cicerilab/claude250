/**
 * IMPRONTA · la lastra del banco di prova (section-builder-banco).
 *
 * È la `figure` con la prova premuta dal vivo:
 * - il pezzo (`.imp-foglio`) nella proporzione vera del formato scelto
 *   (85×55, 148×105, A4, 150×210), sulla carta scelta, con le righe del
 *   cliente nella tecnica scelta (`.imp-secco`, `.imp-inchiostro`, `.imp-caldo`);
 * - registrato come pezzo a rilievo (`kind: 'piece'`, un layer per riga con
 *   `selettore`, `tracking: 'live'` perché la lastra è sticky), così lo
 *   shader lo preme quando c'è, e il CSS quando non c'è;
 * - la pressa (`usePressione`, profilo `bancoProva`, riposo 0,78): ingresso
 *   una volta, battuta a ogni lettera nuova, ristampa quando cambiano
 *   prodotto o tecnica, carta più leggera se un campo torna all'esempio, e la
 *   leva che la porta a 1 (`segui` + `urto`, comandati dal Banco con il ref);
 * - il prezzo impresso in lamina sul margine (decorativo, `aria-hidden`: il
 *   gemello in inchiostro è nel riepilogo e sopra la leva);
 * - la striscia con la tastiera aperta (mobile): solo la riga che si scrive,
 *   premuta, a tutta larghezza (ux-architect 5.6);
 * - la figcaption = riepilogo in parole; un `.imp-sr` con il testo
 *   alternativo della prova (nessuna informazione solo nel rilievo).
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { Carta, Legatura, Prodotto, Tecnica } from '../../content/prezzi';
import { FORMATO_MM } from '../../content/prezzi';
import { BANCO as TESTI_BANCO, LUCE, euro } from '../../content/testi';
import { ticker } from '../../core/ticker';
import { useLuceDial } from '../../interaction/light';
import { ATTESA_PRESSA, BANCO, pressioneLeva } from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import type { ReliefLayer } from '../../relief/types';
import { useRelief } from '../../relief/useRelief';
import { righeDellaProva, type RigaProva } from './calcolaPrezzo';

/* ------------------------------------------------------------------ comandi per il Banco */

export interface ComandiProva {
  /** Progresso lineare della leva (0..1): la prova scende dal riposo a 1. */
  leva(progresso: number): void;
  /** Contatto della pressa a leva completa. */
  contatto(): void;
}

export interface ProvaProps {
  prodotto: Prodotto;
  carta: Carta;
  tecnica: Tecnica;
  taglio: boolean;
  legatura: Legatura;
  /** Campi scritti (store.prova.campi): le righe si compongono sulla forma mostrata. */
  campi: Readonly<Record<string, string>>;
  totale: number;
  /** Riepilogo in parole (figcaption, da 1024 px); null sotto: sta nel compositoio. */
  riepilogo: string | null;
  /** Testo alternativo della prova (`BANCO.prova.alt`). */
  alt: string;
  /** Tastiera aperta su mobile: la lastra diventa la striscia. */
  tastiera: boolean;
  /** Chiave del campo che si sta scrivendo (per la striscia). */
  rigaAttiva: string | null;
  /** Richiesta inviata o in stampa: la prova resta giù. */
  bloccata: boolean;
  /**
   * La prova va allo shader. No sotto i 1024 px: lì la lastra è un foglio
   * fermo e opaco sopra il compositoio che scorre, e il canvas (dietro a
   * tutto) non si vedrebbe. Lì il rilievo è sempre quello CSS.
   */
  registraGL: boolean;
}

/** Presenza sulla lastra: il biglietto resta più piccolo del libro, come sul bancone. */
const PRESENZA: Readonly<Record<Prodotto, number>> = {
  biglietto: 0.8,
  partecipazione: 0.92,
  intestata: 1,
  libro: 1,
};

/** Larghezza di Anybody: +0,96% per ogni unità di wdth (misura dell'art-director, lineare). */
const WDTH_PER_UNITA = 0.0096;
const WDTH_MIN = 75;
const WDTH_MAX = 100;

/** Stato della caduta di una lettera nuova: riga e lunghezza a cui è caduta. */
interface Caduta {
  chiave: string;
  lunghezza: number;
}

/** Esito della misura di una riga grande. */
interface MisuraRiga {
  riga: HTMLElement;
  wdth: number;
  aCapo: boolean;
}

/**
 * Stringe le righe grandi con l'asse wdth fino a 75 perché stiano su una
 * riga; oltre, le lascia andare a capo (ux-architect 5.6, "Testo lungo").
 *
 * Giro 2 (performance-auditor P2): niente più scrittura e lettura alternate
 * per ogni riga. Accanto a ogni riga grande c'è una "sonda" invisibile con lo
 * stesso testo a wdth 100 e senza a capo: la sua larghezza è la larghezza
 * naturale, quindi basta LEGGERE (fase `read` del ticker, un solo layout per
 * tutte le righe) e poi SCRIVERE (fase `write`), al frame dopo il tasto.
 */
function misuraRighe(foglio: HTMLElement): MisuraRiga[] {
  const composizione = foglio.querySelector<HTMLElement>('.imp-banco__composizione');
  if (composizione === null) return [];
  const disponibile = composizione.clientWidth;
  const esito: MisuraRiga[] = [];
  foglio.querySelectorAll<HTMLElement>('[data-sonda]').forEach((sonda) => {
    const riga = foglio.querySelector<HTMLElement>(`[data-stringi][data-chiave="${sonda.dataset.sonda ?? ''}"]`);
    if (riga === null) return;
    const naturale = sonda.getBoundingClientRect().width;
    if (disponibile <= 0 || naturale <= disponibile + 0.5) {
      esito.push({ riga, wdth: WDTH_MAX, aCapo: false });
      return;
    }
    // Margine dell'1%: l'asse non è perfettamente lineare su tutte le lettere.
    const wdth = WDTH_MAX - (1 - (disponibile * 0.99) / naturale) / WDTH_PER_UNITA;
    esito.push(wdth >= WDTH_MIN ? { riga, wdth, aCapo: false } : { riga, wdth: WDTH_MIN, aCapo: true });
  });
  return esito;
}

function scriviRighe(misure: readonly MisuraRiga[]): void {
  for (const m of misure) {
    m.riga.style.setProperty('--imp-banco-wdth', m.wdth.toFixed(2));
    m.riga.toggleAttribute('data-a-capo', m.aCapo);
  }
}

/** Una riga della prova: l'ultima lettera appena scritta "cade" nel compositoio. */
function TestoRiga({ testo, caduta }: { testo: string; caduta: boolean }) {
  if (!caduta || testo.length === 0) return <>{testo}</>;
  const segni = Array.from(testo);
  const ultimo = segni.pop() ?? '';
  return (
    <>
      {segni.join('')}
      <span key={testo.length} className="imp-banco__cade">
        {ultimo}
      </span>
    </>
  );
}

const Prova = forwardRef<ComandiProva, ProvaProps>(function Prova(
  {
    prodotto,
    carta,
    tecnica,
    taglio,
    legatura,
    campi,
    totale,
    riepilogo,
    alt,
    tastiera,
    rigaAttiva,
    bloccata,
    registraGL,
  },
  refComandi,
) {
  const lastraRef = useRef<HTMLElement>(null);
  const foglioRef = useRef<HTMLDivElement>(null);
  const prezzoRef = useRef<HTMLSpanElement>(null);

  /* ---------- forma mostrata: cambia sotto la platina (ristampa) */

  const [forma, setForma] = useState<{ prodotto: Prodotto; tecnica: Tecnica }>({ prodotto, tecnica });
  const righe = useMemo(() => righeDellaProva(forma.prodotto, campi), [forma.prodotto, campi]);

  /* ---------- registro del rilievo: il pezzo e le sue righe */

  const layers: ReliefLayer[] = righe.map((r, i) => ({
    kind: 'text',
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    selettore: `[data-riga="${i}"]`,
    profondita: r.esempio ? 0.45 : 1,
  }));
  const provaId = useRelief(
    foglioRef,
    {
    kind: 'piece',
    // Il testo nella spec fa salire la versione della maschera a ogni lettera.
    text: righe.map((r) => r.testo).join('\n'),
    tecnica: forma.tecnica,
    carta,
    profondita: 1,
    rotazione: 0,
    tracking: 'live',
    layers,
    priorita: 10,
    },
    { attivo: registraGL },
  );

  const prezzoTesto = euro(totale);
  const prezzoId = useRelief(
    prezzoRef,
    { kind: 'text', text: prezzoTesto, tecnica: 'lamina', profondita: 1, tracking: 'live', priorita: 9 },
    { attivo: registraGL },
  );

  const pressa = usePressione(foglioRef, { profilo: BANCO.prova, reliefId: provaId });
  const pressaPrezzo = usePressione(prezzoRef, { profilo: BANCO.prezzo, reliefId: prezzoId });

  /* ---------- prodotto o tecnica cambiati: la platina si alza, cambia, riscende */

  useEffect(() => {
    if (forma.prodotto === prodotto && forma.tecnica === tecnica) return;
    pressa.ristampa(() => setForma({ prodotto, tecnica }));
  }, [prodotto, tecnica, forma.prodotto, forma.tecnica, pressa]);

  /* ---------- lettere: battuta, caduta, campo svuotato */

  const precedenti = useRef<Map<string, RigaProva>>(new Map());
  const cadute = useRef<Map<string, Caduta>>(new Map());
  const leggera = useRef(false);

  // Durante il render si decide quale lettera cade (idempotente con StrictMode).
  for (const r of righe) {
    const prima = precedenti.current.get(r.chiave);
    if (prima && !prima.esempio && !r.esempio && r.testo.length === prima.testo.length + 1 && r.testo.startsWith(prima.testo)) {
      cadute.current.set(r.chiave, { chiave: r.chiave, lunghezza: r.testo.length });
    } else if (prima && prima.esempio && !r.esempio && r.testo.length === 1) {
      cadute.current.set(r.chiave, { chiave: r.chiave, lunghezza: 1 });
    }
  }

  useEffect(() => {
    let cresciuta = false;
    let svuotata = false;
    for (const r of righe) {
      const prima = precedenti.current.get(r.chiave);
      if (!prima) continue;
      if (!r.esempio && (prima.esempio || r.testo.length > prima.testo.length)) cresciuta = true;
      if (r.esempio && !prima.esempio) svuotata = true;
    }
    precedenti.current = new Map(righe.map((r) => [r.chiave, r]));
    if (bloccata) return;
    if (svuotata) {
      leggera.current = true;
      pressa.verso(BANCO.esempioLeggero);
    } else if (cresciuta) {
      if (leggera.current) {
        leggera.current = false;
        pressa.verso(BANCO.prova.riposo);
      } else {
        pressa.battuta();
      }
    }
  }, [righe, pressa, bloccata]);

  /* ---------- il prezzo cambia: battuta sulla lamina */

  const totalePrima = useRef(totale);
  useEffect(() => {
    if (totalePrima.current === totale) return;
    totalePrima.current = totale;
    pressaPrezzo.battuta();
  }, [totale, pressaPrezzo]);

  /* ---------- righe grandi strette con l'asse wdth */

  const firmaRighe = righe.map((r) => r.testo).join('\u0001');
  const righeSporche = useRef(true);

  // Due funzioni fisse nel ticker: leggono e scrivono solo quando serve.
  useEffect(() => {
    const foglio = foglioRef.current;
    if (foglio === null) return undefined;
    let misure: MisuraRiga[] | null = null;
    const leggi = (): boolean => {
      if (!righeSporche.current) return false;
      righeSporche.current = false;
      misure = misuraRighe(foglio);
      return false;
    };
    const scrivi = (): boolean => {
      if (misure === null) return false;
      scriviRighe(misure);
      misure = null;
      return false;
    };
    const togliLeggi = ticker.add(leggi, 'read');
    const togliScrivi = ticker.add(scrivi, 'write');
    const segna = (): void => {
      righeSporche.current = true;
      ticker.wake();
    };
    const osservatore = new ResizeObserver(segna);
    osservatore.observe(foglio);
    const fonts = document.fonts;
    fonts.addEventListener('loadingdone', segna);
    void fonts.ready.then(segna);
    return () => {
      togliLeggi();
      togliScrivi();
      osservatore.disconnect();
      fonts.removeEventListener('loadingdone', segna);
    };
  }, []);

  useEffect(() => {
    righeSporche.current = true;
    ticker.wake();
  }, [firmaRighe, forma.prodotto, forma.tecnica]);

  /* ---------- la leva: comandi per il Banco */

  useImperativeHandle(
    refComandi,
    () => ({
      leva(progresso: number) {
        pressa.segui(pressioneLeva(progresso, BANCO.prova.riposo));
        lastraRef.current?.style.setProperty('--imp-banco-leva', progresso.toFixed(4));
      },
      contatto() {
        pressa.urto();
      },
    }),
    [pressa],
  );

  /* ---------- luce */

  const dial = useLuceDial();

  /* ---------- markup */

  const formato = FORMATO_MM[forma.prodotto];
  const stilePosa = {
    '--imp-banco-l': formato.l,
    '--imp-banco-a': formato.a,
    '--imp-banco-presenza': PRESENZA[forma.prodotto],
  } as CSSProperties;

  const classeTecnica = forma.tecnica === 'secco' ? 'imp-secco' : forma.tecnica === 'colore' ? 'imp-inchiostro' : 'imp-caldo';
  const attiva = righe.find((r) => r.chiave === rigaAttiva) ?? righe[0];

  return (
    <figure
      ref={lastraRef}
      className="imp-banco__lastra"
      aria-label={TESTI_BANCO.prova.figureAria}
      data-tastiera={tastiera ? '' : undefined}
    >
      <div className="imp-banco__piano">
        <div className="imp-banco__vassoio" style={stilePosa} data-prodotto={forma.prodotto} data-imp-luce="">
          <div className="imp-banco__posa">
            <div
              ref={foglioRef}
              {...ATTESA_PRESSA}
              className={`imp-banco__prova imp-foglio${registraGL ? ' imp-relief' : ''}${taglio ? ' imp-taglio' : ''}`}
              data-carta={carta}
              data-prodotto={forma.prodotto}
              data-legatura={forma.prodotto === 'libro' ? legatura : undefined}
              aria-hidden="true"
            >
              {forma.prodotto === 'libro' ? <span className="imp-banco__dorso" /> : null}
              <div className="imp-banco__composizione">
                {righe.map((r, i) => {
                  const caduta = cadute.current.get(r.chiave);
                  const cade = !r.esempio && caduta !== undefined && caduta.lunghezza === r.testo.length;
                  return (
                    <span
                      key={r.chiave}
                      data-riga={i}
                      data-chiave={r.chiave}
                      data-stringi={r.ruolo === 'principale' ? '' : undefined}
                      className={`imp-banco__riga imp-banco__riga--${r.ruolo} ${classeTecnica}${r.esempio ? ' imp-banco__riga--esempio' : ''}`}
                    >
                      <TestoRiga testo={r.testo} caduta={cade} />
                    </span>
                  );
                })}
                {righe
                  .filter((r) => r.ruolo === 'principale')
                  .map((r) => (
                    <span key={`sonda-${r.chiave}`} className="imp-banco__sonda imp-banco__riga--principale" data-sonda={r.chiave}>
                      {r.testo}
                    </span>
                  ))}
              </div>
            </div>
            <span
              ref={prezzoRef}
              {...ATTESA_PRESSA}
              className={`imp-banco__prezzo imp-caldo${registraGL ? ' imp-relief' : ''}`}
              aria-hidden="true"
            >
              {prezzoTesto}
            </span>
          </div>
          <div className="imp-banco__luce">
            <span className="imp-banco__luce-nome" aria-hidden="true">
              {LUCE.etichetta}
            </span>
            <div className="imp-ix-dial" {...dial.contenitoreProps}>
              <span className="imp-ix-dial__icona" aria-hidden="true" />
              <input className="imp-ix-dial__input" {...dial.inputProps} />
            </div>
          </div>
          <p className="imp-banco__totale-lastra">{TESTI_BANCO.prezzo.rigaMobile(totale)}</p>
        </div>
        <div className="imp-banco__striscia" data-carta={carta} aria-hidden="true">
          {attiva ? (
            <span
              key={`${attiva.chiave}-${forma.tecnica}`}
              className={`imp-banco__striscia-riga ${classeTecnica}${attiva.esempio ? ' imp-banco__riga--esempio' : ''}`}
            >
              {attiva.testo}
            </span>
          ) : null}
        </div>
      </div>
      {riepilogo !== null ? (
        <figcaption className="imp-banco__didascalia">
          <span className="imp-banco__riepilogo">{riepilogo}</span>
          <span className="imp-banco__dipende">{TESTI_BANCO.prezzo.dipende}</span>
          <span className="imp-banco__ristampa">{TESTI_BANCO.prezzo.ristampa}</span>
        </figcaption>
      ) : null}
      <p className="imp-sr">
        {alt} {TESTI_BANCO.senzaWebgl.sr}
      </p>
    </figure>
  );
});

export default Prova;
