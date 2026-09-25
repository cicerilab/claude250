/**
 * IMPRONTA · sezione 3, "La stessa parola, quattro volte" (`#tecniche`).
 *
 * Una parola sola (il nome del cliente se l'ha già scritto, altrimenti
 * "Pordenone") ripassa sotto la pressa quattro volte: a secco, a un colore,
 * lamina a caldo, taglio colorato. Lo scroll cambia solo il materiale.
 *
 * Due rese, scelte da `store.reducedMotion`:
 * - **Pin** (movimento pieno): contenitore alto 400svh (350svh sotto 768 px)
 *   con un palco `position: sticky` alto 100svh. `useScrollProgress` dà il
 *   progresso con isteresi (4 passi) e scrive `--imp-tecniche-p` e
 *   `--imp-tecniche-giro` sul contenitore; a ogni cambio di passo la parola
 *   riceve una **ristampa** (platina su, cambio secco di tecnica e testi,
 *   platina giù). Il taglio colorato ruota il foglio di tre quarti in CSS,
 *   legato allo scroll (motion-designer §6.3).
 * - **Statica** (reduced motion): niente pin, quattro blocchi uno sotto
 *   l'altro, ognuno con la parola già premuta nella sua tecnica.
 *
 * Accessibilità: le quattro tecniche sono sempre tutte nel DOM, in ordine,
 * con titolo, descrizione del rilievo e tre righe; quelle non in vista sono
 * nascoste solo alla vista. Il foglio disegnato è `aria-hidden`. Nessuna
 * informazione vive solo nel rilievo, nella luce o nel colore.
 *
 * Il taglio colorato è DOM/CSS (webgl-artist §12): durante quella tecnica la
 * parola esce dal registro dei rilievi e la disegna il CSS, così ruota
 * insieme al foglio. Nessun accesso a window/document a livello di modulo.
 */

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { TECNICHE as TESTI } from '../../content/testi';
import {
  TECNICHE as MOTO,
  VAR,
  ATTESA_PRESSA,
  LARGHEZZA_STRETTA,
  LARGHEZZA_TESTATA,
  giroTecniche,
  progressoSaltoTecnica,
} from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import { useScrollProgress } from '../../motion/useScrollProgress';
import { useRelief } from '../../relief/useRelief';
import type { TecnicaRilievo } from '../../relief/types';
import { selParolaCampione, useImpronta, type Carta } from '../../state/store';
import './tecniche.css';

/* ------------------------------------------------------------------ dati */

type Voce = (typeof TESTI.voci)[number];
type IdTecnica = Voce['id'];

const VOCI: readonly Voce[] = TESTI.voci;

/** Classe materiale del fallback CSS (art-director, relief-fallback.css). */
const MATERIALE: Record<IdTecnica, string> = {
  secco: 'imp-secco',
  colore: 'imp-inchiostro',
  lamina: 'imp-caldo',
  // Il biglietto col taglio dipinto ha la parola a secco: il colore sta
  // solo sul bordo, come lo si fa in bottega.
  taglio: 'imp-secco',
};

/** Tecnica del rilievo nello shader (il taglio non passa dallo shader). */
const RILIEVO: Record<IdTecnica, TecnicaRilievo> = {
  secco: 'secco',
  colore: 'colore',
  lamina: 'lamina',
  taglio: 'secco',
};

/** Profondità del rilievo per tecnica: l'inchiostro e la lamina chiedono meno pressione. */
const PROFONDITA: Record<IdTecnica, number> = {
  secco: 1,
  colore: 0.85,
  lamina: 0.8,
  taglio: 1,
};

/** Id del titolo della sezione (aria-labelledby). */
const ID_TITOLO = 'imp-tecniche-titolo';

/** Lunghezza massima della parola campione (ux-architect §5.3). */
const MAX_CARATTERI = { stretto: 12, largo: 18 } as const;

/* ------------------------------------------------------------------ utilità */

/**
 * La parola da premere: se è troppo lunga per la larghezza, il primo nome
 * ("Giulia e Marco" diventa "Giulia"). Spazi ripuliti, mai vuota.
 */
function parolaPerLarghezza(parola: string, stretto: boolean): string {
  const pulita = parola.trim().replace(/\s+/g, ' ');
  if (pulita.length === 0) return TESTI.parolaCampione;
  const massimo = stretto ? MAX_CARATTERI.stretto : MAX_CARATTERI.largo;
  if (pulita.length <= massimo) return pulita;
  const primo = pulita.split(' ')[0];
  return primo !== undefined && primo.length > 0 ? primo : pulita;
}

/** Numero di caratteri che il CSS usa per dare il corpo alla parola. */
function stileParola(parola: string): CSSProperties {
  return { '--imp-tecniche-n': String(Math.max(3, Array.from(parola).length)) } as CSSProperties;
}

/**
 * true sotto una certa larghezza. Legge `matchMedia` solo nel browser, dentro
 * le funzioni di `useSyncExternalStore`; nel prerender vale `false`.
 */
function useSotto(larghezza: number): boolean {
  const query = `(max-width: ${larghezza - 1}px)`;
  return useSyncExternalStore(
    (avvisa) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', avvisa);
      return () => {
        mq.removeEventListener('change', avvisa);
      };
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * true dopo che il visitatore ha cliccato il link "cos'è?" del banco (un
 * `a[href="#tecniche"]` dentro `#banco`): solo allora compare "Torna al
 * banco". Ascolto in cattura, così vale anche se il clic viene poi gestito
 * dal delegato di Impronta.tsx.
 */
function useArrivoDalBanco(): boolean {
  const [dalBanco, setDalBanco] = useState(false);
  useEffect(() => {
    const suClic = (evento: MouseEvent): void => {
      const bersaglio = evento.target;
      if (!(bersaglio instanceof Element)) return;
      const link = bersaglio.closest('a[href="#tecniche"]');
      if (link !== null && link.closest('#banco') !== null) setDalBanco(true);
    };
    document.addEventListener('click', suClic, true);
    return () => {
      document.removeEventListener('click', suClic, true);
    };
  }, []);
  return dalBanco;
}

/* ------------------------------------------------------------------ pezzi comuni */

function Testa({ statica }: { statica: boolean }) {
  return (
    <header className={statica ? 'imp-tecniche__testa imp-tecniche__testa--statica' : 'imp-tecniche__testa'}>
      <h2 id={ID_TITOLO} className="imp-tecniche__titolo" tabIndex={-1}>
        {TESTI.titolo}
      </h2>
      <p className="imp-tecniche__intro">{TESTI.intro}</p>
    </header>
  );
}

/** Titolo e tre righe di una tecnica, con la descrizione del rilievo per chi non lo vede. */
function Spiegazione({ voce, parola, carta }: { voce: Voce; parola: string; carta: Carta }) {
  return (
    <>
      <h3 className="imp-tecniche__nome">{voce.titolo}</h3>
      <div className="imp-tecniche__righe">
        <p className="imp-sr">{TESTI.rilievoAlt(parola, voce.id, carta)}</p>
        <p className="imp-tecniche__riga">{voce.cosa}</p>
        <p className="imp-tecniche__riga">{voce.suCosa}</p>
        <p className="imp-tecniche__riga imp-tecniche__costo">{voce.costo}</p>
      </div>
    </>
  );
}

function TornaAlBanco() {
  return (
    <p className="imp-tecniche__ritorno">
      <a className="imp-ix-link imp-ix-tocco imp-tecniche__ritorno-link" href="#banco">
        {TESTI.tornaAlBanco}
      </a>
    </p>
  );
}

/* ------------------------------------------------------------------ resa con il pin */

function TecnichePin({ parola, carta, stretto }: { parola: string; carta: Carta; stretto: boolean }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const parolaRef = useRef<HTMLDivElement>(null);
  const dalBanco = useArrivoDalBanco();

  /** Voce corrente nell'elenco: cambia subito al passo (è un indice). */
  const [passo, setPasso] = useState(0);
  /** Tecnica sotto la pressa (parola, titolo e righe): cambia al fondo della ristampa. */
  const [mostrata, setMostrata] = useState(0);

  const voce = VOCI[mostrata] ?? VOCI[0];
  const id: IdTecnica = voce?.id ?? 'secco';
  const taglio = id === 'taglio';

  // La parola è nel registro dei rilievi per secco, colore e lamina; nel
  // taglio esce dal registro e la disegna il CSS, che la ruota col foglio.
  const reliefId = useRelief(
    parolaRef,
    {
      kind: 'text',
      text: parola,
      tecnica: RILIEVO[id],
      profondita: PROFONDITA[id],
      tracking: 'live',
      priorita: 3,
    },
    { attivo: !taglio },
  );

  const pressa = usePressione(parolaRef, {
    profilo: MOTO.profilo,
    reliefId,
    osserva: pinRef,
  });

  const progresso = useScrollProgress(pinRef, {
    intervallo: MOTO.intervallo,
    variabile: VAR.tecnicheP,
    passi: MOTO.passi,
    isteresi: MOTO.isteresi,
    derivate: { [VAR.tecnicheGiro]: giroTecniche },
    onPasso: (indice, precedente) => {
      setPasso(indice);
      if (precedente === -1) {
        setMostrata(indice);
        return;
      }
      pressa.ristampa(() => {
        setMostrata(indice);
      });
    },
  });

  const classiParola = [
    'imp-tecniche__parola',
    MATERIALE[id],
    taglio ? '' : 'imp-relief',
  ]
    .filter((c) => c.length > 0)
    .join(' ');

  return (
    <div ref={pinRef} className="imp-tecniche__pin">
      {stretto ? (
        <div className="imp-page imp-tecniche__testa-fuori">
          <Testa statica={false} />
        </div>
      ) : null}
      <div className="imp-tecniche__palco" data-tecnica={id}>
        <div className="imp-page imp-tecniche__gabbia">
          {stretto ? null : <Testa statica={false} />}

          <div className="imp-tecniche__indice">
            <ol className="imp-tecniche__elenco imp-lista" aria-label={TESTI.elencoAria}>
              {VOCI.map((v, i) => {
                const corrente = i === passo;
                return (
                  <li key={v.id} className="imp-tecniche__voce-indice">
                    <button
                      type="button"
                      className="imp-tecniche__salto imp-ix-premibile"
                      aria-current={corrente ? 'true' : undefined}
                      onClick={() => {
                        progresso.vaiA(progressoSaltoTecnica(i));
                      }}
                    >
                      <span className="imp-tecniche__salto-nome imp-tecniche__salto-nome--lungo">{v.nome}</span>
                      <span className="imp-tecniche__salto-nome imp-tecniche__salto-nome--breve" aria-hidden="true">
                        {v.breve}
                      </span>
                      {corrente ? (
                        <>
                          <span className="imp-tecniche__segno" aria-hidden="true">
                            {TESTI.segnoCorrente}
                          </span>
                          <span className="imp-sr">{`, ${TESTI.correnteSr}`}</span>
                        </>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="imp-tecniche__corsa" aria-hidden="true">
              <span className="imp-tecniche__corsa-fatta" />
            </div>
            {dalBanco ? <TornaAlBanco /> : null}
          </div>

          <div className="imp-tecniche__zona" aria-hidden="true">
            <div className={taglio ? 'imp-tecniche__foglio imp-foglio imp-taglio' : 'imp-tecniche__foglio imp-foglio'}>
              <div
                ref={parolaRef}
                {...ATTESA_PRESSA}
                className={classiParola}
                style={stileParola(parola)}
              >
                {parola}
              </div>
              <span className="imp-tecniche__costa" />
            </div>
          </div>

          <ol className="imp-tecniche__voci imp-lista">
            {VOCI.map((v, i) => (
              <li key={v.id} className="imp-tecniche__voce" data-corrente={i === mostrata ? 'true' : 'false'}>
                <Spiegazione voce={v} parola={parola} carta={carta} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ resa statica */

/** Un foglio già premuto nella sua tecnica (reduced motion). */
function FoglioStatico({ voce, parola }: { voce: Voce; parola: string }) {
  const parolaRef = useRef<HTMLDivElement>(null);
  const taglio = voce.id === 'taglio';
  const reliefId = useRelief(
    parolaRef,
    {
      kind: 'text',
      text: parola,
      tecnica: RILIEVO[voce.id],
      profondita: PROFONDITA[voce.id],
      tracking: 'doc',
      priorita: 1,
    },
    { attivo: !taglio },
  );
  usePressione(parolaRef, { profilo: MOTO.profilo, reliefId });

  const classi = ['imp-tecniche__parola', MATERIALE[voce.id], taglio ? '' : 'imp-relief']
    .filter((c) => c.length > 0)
    .join(' ');

  return (
    <div className="imp-tecniche__zona imp-tecniche__zona--statica" aria-hidden="true" data-tecnica={voce.id}>
      <div className={taglio ? 'imp-tecniche__foglio imp-foglio imp-taglio' : 'imp-tecniche__foglio imp-foglio'}>
        <div ref={parolaRef} className={classi} style={stileParola(parola)}>
          {parola}
        </div>
        <span className="imp-tecniche__costa" />
      </div>
    </div>
  );
}

function TecnicheStatiche({ parola, carta }: { parola: string; carta: Carta }) {
  const dalBanco = useArrivoDalBanco();
  return (
    <div className="imp-page imp-tecniche__statica">
      <Testa statica />
      <ol className="imp-tecniche__blocchi imp-lista" aria-label={TESTI.elencoAria}>
        {VOCI.map((v) => (
          <li key={v.id} className="imp-tecniche__blocco">
            <FoglioStatico voce={v} parola={parola} />
            <div className="imp-tecniche__testo-statico">
              <Spiegazione voce={v} parola={parola} carta={carta} />
            </div>
          </li>
        ))}
      </ol>
      {dalBanco ? <TornaAlBanco /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ sezione */

export default function Tecniche() {
  const ridotto = useImpronta((s) => s.reducedMotion);
  const carta = useImpronta((s) => s.carta);
  const campione = useImpronta(selParolaCampione);
  const stretto = useSotto(LARGHEZZA_TESTATA);
  const corto = useSotto(LARGHEZZA_STRETTA);
  const parola = parolaPerLarghezza(campione, corto);

  return (
    <section
      id="tecniche"
      className={ridotto ? 'imp-tecniche imp-tecniche--ridotta' : 'imp-tecniche'}
      aria-labelledby={ID_TITOLO}
    >
      {ridotto ? (
        <TecnicheStatiche parola={parola} carta={carta} />
      ) : (
        <TecnichePin parola={parola} carta={carta} stretto={stretto} />
      )}
    </section>
  );
}
