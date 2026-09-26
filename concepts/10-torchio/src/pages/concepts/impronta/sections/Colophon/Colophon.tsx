/**
 * IMPRONTA · 8 · Colophon (section-builder-colophon), giro 2.
 *
 * Composto come l'ultima pagina di un libro, tutto sull'asse della gabbia
 * (il centro dell'area viva, non dello schermo): il titolo piccolo e largo,
 * la frase del colophon in Hanken 21 px con la carta attiva, l'indice in una
 * riga sola, un solo bottone ("Prova la tua") con accanto "Ricomincia da capo"
 * in forma di link, poi il marchio IMPRONTA premuto a secco a tutta area viva
 * (è il fotogramma finale del sito) e sotto, piccola, la riga dello
 * stampatore: bottega e città, recapiti, finzione dichiarata, firma del
 * concept.
 *
 * Il sigillo senza WebGL è un SVG in linea (il path del vector-artist) con un
 * filtro di ombra e luce INTERNE: parete scura verso la luce, labbro chiaro
 * dall'altra parte, fondo del solco più scuro della carta. Niente maschere con
 * `url()` (il bug del giro 1: data URI con apici singoli dentro `url()` senza
 * virgolette) e niente secondo import del marchio (`?url`).
 *
 * Regole: testi solo da content/testi.ts; unico movimento la pressa leggera
 * del sigillo (PROFILI.colophonFirma), già premuto con reduced motion;
 * conferma di "Ricomincia da capo" in linea; i link `#` li gestisce il click
 * delegato di Impronta.tsx; nessun accesso a window/document a livello di
 * modulo.
 */
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import './colophon.css';

import { freccia, marchioImpronta } from '../../assets/svg';
import { CARTE, COLOPHON as TESTI, COMUNI, RECAPITI, TESTATA } from '../../content/testi';
import { CICERILAB_URL, EMAIL_URL, LAB_URL, MAPS_URL, TELEFONO_URL } from '../../core/links';
import { cambiaCarta } from '../../interaction/paperWave';
import { ATTESA_PRESSA, COLOPHON as MOTO } from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import { useRelief } from '../../relief/useRelief';
import { cartaPredefinita, ricominciaDaCapo, store, useImpronta, type Carta } from '../../state/store';

type FaseRicomincia = 'fermo' | 'domanda' | 'lavoro' | 'fatto';

/** Il path del marchio (un solo `path` pieno, viewBox 0 0 941 100): solo lavoro su stringhe. */
const MARCHIO_D = /\sd="([^"]+)"/.exec(marchioImpronta)?.[1] ?? '';

/** La freccia dei link esterni senza il suo `id` (inserita più volte nella pagina). */
const FRECCIA_SVG = freccia.replace(/\sid="[^"]*"/g, '');

function Freccia() {
  return <span className="imp-colophon__freccia" aria-hidden="true" dangerouslySetInnerHTML={{ __html: FRECCIA_SVG }} />;
}

/**
 * La frase del colophon con la carta in evidenza: il testo resta quello del
 * copywriter, qui si mette solo in `<strong>` il nome e la grammatura.
 */
function FraseCarta({ carta }: { carta: Carta }) {
  const frase = TESTI.testo(carta);
  const nome = `${CARTE[carta].nome} ${CARTE[carta].grammatura}`;
  const i = frase.indexOf(nome);
  if (i < 0) return <>{frase}</>;
  return (
    <>
      {frase.slice(0, i)}
      <strong className="imp-colophon__carta">{nome}</strong>
      {frase.slice(i + nome.length)}
    </>
  );
}

/**
 * Finestre sul marchio (viewBox 0 0 941 100). Sopra i 600 px il marchio è
 * intero; sotto va su due righe, IMPR / ONTA, così a 375 è alto 65 px invece
 * di 36. Le righe hanno la stessa scala: ONTA (514 unità) riempie l'area viva,
 * IMPR ne occupa l'82%. Il taglio cade nel vuoto tra la R (fine a 415) e la
 * O (inizio a 431).
 */
const FINESTRE = {
  intero: { x: 0, w: 941 },
  impr: { x: 0, w: 423 },
  onta: { x: 427, w: 514 },
} as const;
const RIGA_MAX = FINESTRE.onta.w;

type Finestra = keyof typeof FINESTRE;

/** Il markup del marchio con la finestra voluta: lo stesso che riceve lo shader. */
function marchioFinestra(f: Finestra): string {
  const { x, w } = FINESTRE[f];
  return marchioImpronta.replace(/viewBox="[^"]*"/, `viewBox="${x} 0 ${w} 100"`);
}

const SVG_FINESTRE: Record<Finestra, string> = {
  intero: marchioFinestra('intero'),
  impr: marchioFinestra('impr'),
  onta: marchioFinestra('onta'),
};

/**
 * Il marchio premuto a secco. Registrato come rilievo SVG (lo disegna lo
 * shader quando c'è); il fallback è l'SVG in linea con il solco nel filtro.
 */
function Sigillo({ finestra }: { finestra: Finestra }) {
  const ref = useRef<HTMLDivElement>(null);
  const { x, w } = FINESTRE[finestra];
  const idFiltro = `imp-colophon-solco-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const reliefId = useRelief(ref, {
    kind: 'svg',
    svg: SVG_FINESTRE[finestra],
    tecnica: 'secco',
    profondita: 1,
    tracking: 'doc',
    priorita: 1,
  });
  usePressione(ref, { profilo: MOTO.profilo, reliefId });

  return (
    <div
      ref={ref}
      {...ATTESA_PRESSA}
      className={`imp-colophon__marchio imp-colophon__marchio--${finestra} imp-relief`}
      style={
        {
          aspectRatio: `${w} / 100`,
          '--imp-colophon-riga': finestra === 'intero' ? 1 : w / RIGA_MAX,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <svg className="imp-colophon__marchio-svg" viewBox={`${x} 0 ${w} 100`} focusable="false">
        <defs>
          <filter id={idFiltro} x="-2%" y="-10%" width="104%" height="120%" colorInterpolationFilters="sRGB">
            {/* parete in ombra: la carta attorno, spostata via dalla luce, ritagliata dentro la lettera */}
            <feFlood className="imp-colophon__f-ombra" result="ombraPiena" />
            <feComposite in="ombraPiena" in2="SourceAlpha" operator="out" result="fuoriOmbra" />
            <feOffset in="fuoriOmbra" dx="2.2" dy="2.6" result="fuoriOmbraSpostata" />
            <feGaussianBlur in="fuoriOmbraSpostata" stdDeviation="0.9" result="ombraMorbida" />
            <feComposite in="ombraMorbida" in2="SourceAlpha" operator="in" result="ombraDentro" />
            {/* labbro in luce: lo stesso dall'altra parte, più corto e netto */}
            <feFlood className="imp-colophon__f-luce" result="lucePiena" />
            <feComposite in="lucePiena" in2="SourceAlpha" operator="out" result="fuoriLuce" />
            <feOffset in="fuoriLuce" dx="-1.1" dy="-1.3" result="fuoriLuceSpostata" />
            <feGaussianBlur in="fuoriLuceSpostata" stdDeviation="0.35" result="luceMorbida" />
            <feComposite in="luceMorbida" in2="SourceAlpha" operator="in" result="luceDentro" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="ombraDentro" />
              <feMergeNode in="luceDentro" />
            </feMerge>
          </filter>
        </defs>
        <path className="imp-colophon__marchio-solco" d={MARCHIO_D} filter={`url(#${idFiltro})`} />
      </svg>
    </div>
  );
}

function Ricomincia() {
  const [fase, setFase] = useState<FaseRicomincia>('fermo');
  const [cartaFatto, setCartaFatto] = useState<Carta>(() => cartaPredefinita());
  const bottoneRef = useRef<HTMLButtonElement>(null);
  const siRef = useRef<HTMLButtonElement>(null);
  /** Dove va il fuoco dopo il prossimo cambio di fase (solo se l'ha chiesto un comando). */
  const fuocoRef = useRef<'bottone' | 'si' | null>(null);
  const vivoRef = useRef(true);
  const idDomanda = useId();

  useEffect(() => {
    vivoRef.current = true;
    return () => {
      vivoRef.current = false;
    };
  }, []);

  useEffect(() => {
    const dove = fuocoRef.current;
    fuocoRef.current = null;
    if (dove === 'si') siRef.current?.focus();
    else if (dove === 'bottone') bottoneRef.current?.focus();
  }, [fase]);

  const chiedi = () => {
    fuocoRef.current = 'si';
    setFase('domanda');
  };

  const annulla = () => {
    fuocoRef.current = 'bottone';
    setFase('fermo');
  };

  const conferma = async () => {
    setFase('lavoro');
    const partenza = cartaPredefinita();
    if (store.get().carta !== partenza) {
      try {
        await cambiaCarta(partenza, siRef.current);
      } catch {
        /* l'onda è solo un effetto: il reset si fa comunque */
      }
    }
    ricominciaDaCapo();
    if (!vivoRef.current) return;
    fuocoRef.current = 'bottone';
    setCartaFatto(partenza);
    setFase('fatto');
  };

  const aperta = fase === 'domanda' || fase === 'lavoro';

  return (
    <div className="imp-colophon__ricomincia">
      {aperta ? (
        <div
          className="imp-colophon__domanda"
          role="group"
          aria-labelledby={idDomanda}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && fase === 'domanda') {
              e.stopPropagation();
              annulla();
            }
          }}
        >
          <p id={idDomanda} className="imp-colophon__domanda-testo">
            {TESTI.ricomincia.domanda}
          </p>
          <span className="imp-colophon__domanda-scelte">
            <button
              ref={siRef}
              type="button"
              className="imp-colophon__testo-bottone imp-colophon__testo-bottone--forte imp-ix-link"
              onClick={conferma}
              disabled={fase === 'lavoro'}
            >
              {TESTI.ricomincia.si}
            </button>{' '}
            <button
              type="button"
              className="imp-colophon__testo-bottone imp-ix-link"
              onClick={annulla}
              disabled={fase === 'lavoro'}
            >
              {TESTI.ricomincia.no}
            </button>
          </span>
        </div>
      ) : (
        <button ref={bottoneRef} type="button" className="imp-colophon__testo-bottone imp-ix-link" onClick={chiedi}>
          {TESTI.ricomincia.bottone}
        </button>
      )}
      <p className="imp-colophon__esito imp-ix-annuncio" aria-live="polite" role="status">
        {fase === 'fatto' ? TESTI.ricomincia.fattoCarta(cartaFatto) : ''}
      </p>
    </div>
  );
}

export default function Colophon() {
  const carta = useImpronta((s) => s.carta);
  const idTitolo = useId();

  return (
    <footer id="colophon" className="imp-colophon" aria-labelledby={idTitolo}>
      <div className="imp-page imp-colophon__pagina">
        <h2 id={idTitolo} className="imp-colophon__titolo" tabIndex={-1}>
          {TESTI.titolo}
        </h2>

        <p className="imp-colophon__testo">
          <FraseCarta carta={carta} />
        </p>
        <p className="imp-colophon__seconda imp-piccolo">{TESTI.secondaRiga}</p>

        <nav className="imp-colophon__indice" aria-label={TESTI.indiceAria}>
          <h3 className="imp-sr">{TESTI.indiceTitolo}</h3>
          <ul className="imp-lista imp-colophon__voci" role="list">
            {TESTI.indice.map((voce) => (
              <li key={voce.id} className="imp-colophon__voce-riga">
                <a href={voce.href} className="imp-colophon__voce imp-ix-link">
                  {voce.etichetta}
                </a>{' '}
              </li>
            ))}
          </ul>
        </nav>

        <div className="imp-colophon__comandi">
          <a href="#banco" className="imp-colophon__prova imp-lamina imp-ix-premibile" aria-label={TESTATA.provaAria}>
            {COMUNI.provaLaTua}
          </a>
          <Ricomincia />
        </div>

        <div className="imp-colophon__sigillo">
          <div className="imp-colophon__marchio-intero">
            <Sigillo finestra="intero" />
          </div>
          <div className="imp-colophon__marchio-righe">
            <Sigillo finestra="impr" />
            <Sigillo finestra="onta" />
          </div>
          <p className="imp-colophon__bottega imp-piccolo">
            <span className="imp-colophon__bottega-nome">{COMUNI.marchioSotto}</span>{' '}
            <span className="imp-colophon__bottega-citta">{COMUNI.citta}</span>
          </p>
        </div>

        <div className="imp-colophon__stampatore">
          <address className="imp-colophon__recapiti imp-piccolo">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="imp-colophon__recapito imp-ix-link">
              {RECAPITI.indirizzoRiga}
              <span className="imp-sr">, {COMUNI.nuovaScheda}</span>
              <Freccia />
            </a>{' '}
            <a href={TELEFONO_URL} className="imp-colophon__recapito imp-ix-link">
              {TESTI.telefono}
            </a>{' '}
            <a href={EMAIL_URL} className="imp-colophon__recapito imp-ix-link">
              {TESTI.email}
            </a>
          </address>
          <p className="imp-colophon__finzione imp-nota">{TESTI.finzione}</p>
          <p className="imp-colophon__firma imp-piccolo">
            <a href={CICERILAB_URL} target="_blank" rel="noopener" className="imp-colophon__firma-link imp-ix-link">
              {TESTI.conceptDi}
              <span className="imp-sr">, {COMUNI.nuovaScheda}</span>
              <Freccia />
            </a>{' '}
            <a href={LAB_URL} className="imp-colophon__firma-link imp-ix-link" aria-label={COMUNI.tornaLabAria}>
              {COMUNI.tornaLab}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
