/**
 * IMPRONTA · 8 · Colophon (section-builder-colophon).
 *
 * L'ultima pagina di un libro ben fatto: di cosa è fatto il sito (caratteri,
 * carta attiva, tecnica, città), l'indice, i due comandi finali ("Prova la
 * tua" e "Ricomincia da capo"), i recapiti essenziali e la firma del concept.
 * Chiude il foglio il marchio IMPRONTA premuto a secco a tutta area viva, come
 * il sigillo a secco dell'editore sull'ultima pagina.
 *
 * Regole rispettate (docs/ux-architect.md §5.8, motion-designer §6.8,
 * scaffold-engineer §2 e §4.8, art-director §3.4):
 * - `<footer id="colophon" class="imp-colophon">`, nessuna prop;
 * - testi SOLO da content/testi.ts; la carta nel testo è quella attiva e
 *   cambia secca con `data-carta` (nessuna animazione del testo);
 * - l'unico movimento è la pressa leggera del marchio (`PROFILI.colophonFirma`);
 *   con reduced motion è già premuto;
 * - "Ricomincia da capo" chiede conferma in linea (niente popup), poi onda
 *   verso la carta di partenza e `ricominciaDaCapo()`; esito in `aria-live`;
 * - i link `#` li gestisce il click delegato di Impronta.tsx;
 * - nessun accesso a window/document a livello di modulo.
 */
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import './colophon.css';

import { freccia, marchioImpronta } from '../../assets/svg';
import marchioUrl from '../../assets/svg/marchio-impronta.svg?url';
import { CARTE, COLOPHON as TESTI, COMUNI, RECAPITI, TESTATA } from '../../content/testi';
import { CICERILAB_URL, EMAIL_URL, LAB_URL, MAPS_URL, TELEFONO_URL } from '../../core/links';
import { cambiaCarta } from '../../interaction/paperWave';
import { ATTESA_PRESSA, COLOPHON as MOTO } from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import { useRelief } from '../../relief/useRelief';
import { cartaPredefinita, ricominciaDaCapo, store, useImpronta, type Carta } from '../../state/store';

type FaseRicomincia = 'fermo' | 'domanda' | 'lavoro' | 'fatto';

/** Freccia dei link esterni (vector-artist), sempre decorativa. */
function Freccia() {
  return <span className="imp-colophon__freccia" aria-hidden="true" dangerouslySetInnerHTML={{ __html: freccia }} />;
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

/** Il marchio premuto a secco: registrato come rilievo SVG, con il suo fallback CSS a maschera. */
function Sigillo() {
  const ref = useRef<HTMLSpanElement>(null);
  const reliefId = useRelief(ref, {
    kind: 'svg',
    svg: marchioImpronta,
    tecnica: 'secco',
    profondita: 0.9,
    tracking: 'doc',
    priorita: 1,
  });
  usePressione(ref, { profilo: MOTO.profilo, reliefId });

  return (
    <span
      ref={ref}
      {...ATTESA_PRESSA}
      className="imp-colophon__marchio imp-relief"
      style={{ '--imp-segno': `url(${marchioUrl})` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="imp-colophon__marchio-solco" />
    </span>
  );
}

function Ricomincia() {
  const [fase, setFase] = useState<FaseRicomincia>('fermo');
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
    setFase('fatto');
  };

  const aperta = fase === 'domanda' || fase === 'lavoro';

  return (
    <div className="imp-colophon__ricomincia">
      {aperta ? (
        <div className="imp-colophon__domanda" role="group" aria-labelledby={idDomanda}>
          <p id={idDomanda} className="imp-colophon__domanda-testo">
            {TESTI.ricomincia.domanda}
          </p>
          <div className="imp-colophon__domanda-scelte">
            <button
              ref={siRef}
              type="button"
              className="imp-colophon__bottone imp-colophon__bottone--pieno imp-ix-premibile"
              onClick={conferma}
              disabled={fase === 'lavoro'}
            >
              {TESTI.ricomincia.si}
            </button>
            <button
              type="button"
              className="imp-colophon__bottone imp-ix-premibile"
              onClick={annulla}
              disabled={fase === 'lavoro'}
            >
              {TESTI.ricomincia.no}
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={bottoneRef}
          type="button"
          className="imp-colophon__bottone imp-ix-premibile"
          onClick={chiedi}
        >
          {TESTI.ricomincia.bottone}
        </button>
      )}
      <p className="imp-colophon__esito imp-ix-annuncio" aria-live="polite" role="status">
        {fase === 'fatto' ? TESTI.ricomincia.fatto : ''}
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
        <div className="imp-griglia imp-colophon__griglia">
          <h2 id={idTitolo} className="imp-colophon__titolo" tabIndex={-1}>
            {TESTI.titolo}
          </h2>

          <div className="imp-colophon__stampa">
            <p className="imp-colophon__testo">
              <FraseCarta carta={carta} />
            </p>
            <p className="imp-colophon__seconda">{TESTI.secondaRiga}</p>

            <div className="imp-colophon__comandi">
              <a
                href="#banco"
                className="imp-colophon__prova imp-lamina imp-ix-premibile"
                aria-label={TESTATA.provaAria}
              >
                {COMUNI.provaLaTua}
              </a>
              <Ricomincia />
            </div>
          </div>

          <nav className="imp-colophon__indice" aria-label={TESTI.indiceAria}>
            <h3 className="imp-colophon__etichetta">{TESTI.indiceTitolo}</h3>
            <ul className="imp-lista imp-colophon__voci" role="list">
              {TESTI.indice.map((voce) => (
                <li key={voce.id}>
                  <a href={voce.href} className="imp-colophon__voce imp-ix-link">
                    {voce.etichetta}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <address className="imp-colophon__recapiti">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="imp-colophon__recapito imp-ix-link">
              {RECAPITI.indirizzoRiga}
              <span className="imp-sr">, {COMUNI.nuovaScheda}</span>
              <Freccia />
            </a>
            <a href={TELEFONO_URL} className="imp-colophon__recapito imp-ix-link">
              {RECAPITI.telefono}
            </a>
            <a href={EMAIL_URL} className="imp-colophon__recapito imp-ix-link">
              {RECAPITI.email}
            </a>
          </address>
        </div>

        <div className="imp-colophon__sigillo">
          <Sigillo />
        </div>

        <div className="imp-griglia imp-colophon__piede">
          <p className="imp-colophon__bottega">
            <span className="imp-colophon__bottega-nome">{COMUNI.marchioSotto}</span>
            <span className="imp-colophon__bottega-citta">{COMUNI.citta}</span>
          </p>
          <p className="imp-colophon__finzione">{TESTI.finzione}</p>
          <p className="imp-colophon__firma">
            <a
              href={CICERILAB_URL}
              target="_blank"
              rel="noopener"
              className="imp-colophon__firma-link imp-ix-link"
            >
              {TESTI.conceptDi}
              <span className="imp-sr">, {COMUNI.nuovaScheda}</span>
              <Freccia />
            </a>
            <a href={LAB_URL} className="imp-colophon__firma-link imp-ix-link" aria-label={COMUNI.tornaLabAria}>
              {COMUNI.tornaLab}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
