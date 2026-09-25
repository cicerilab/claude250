/**
 * IMPRONTA · sezione 4, "La carta · tocca prima di scegliere" (`#carta`).
 * Proprietà: section-builder-carta (docs/section-builder-carta.md).
 *
 * Le quattro carte come campioni veri, a vivo: strisce verticali a tutta
 * altezza da 1024 px in su, fasce orizzontali sotto. Ogni striscia è un radio
 * del gruppo "La carta del sito": sceglierne una la stende su tutto il sito
 * con l'onda che parte dal punto toccato (interaction/paperWave.ts).
 *
 * Accessibilità (ux-architect 5.4 e 6.5):
 * - `role="radiogroup"` con 4 `role="radio"` (bottoni veri), tabulazione a
 *   fuoco mobile: nel gruppo si entra sulla carta scelta, le frecce spostano
 *   SOLO il fuoco, Spazio (o Invio, o il tocco) sceglie. Il sito non cambia
 *   carta mentre si tabula;
 * - nome accessibile completo (`CARTE[c].radioAria`), descrizione e spessore
 *   in `aria-describedby`;
 * - scelta detta a parole ("✓ la carta del sito") e con il bordo interno
 *   d'inchiostro da 3 px, mai solo dal colore;
 * - annuncio `aria-live="polite"` a onda finita (`ANNUNCI.carta`); il fuoco
 *   non si sposta e la pagina non scorre.
 *
 * Le strisce NON sono blocchi dello shader: sono fogli opachi del DOM
 * (fondo, fibra e costa in CSS) sopra al canvas, uguali con WebGL acceso,
 * spento o in attesa. Il nome a secco di ogni striscia è quindi rilievo CSS
 * (`.imp-secco`), premuto da `usePressione` senza `reliefId`.
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import './carta.css';

import { ANNUNCI, CARTA as TESTI, CARTE, ORDINE_CARTE } from '../../content/testi';
import { useMagnete } from '../../interaction/light';
import { cambiaCarta, origineDaEvento } from '../../interaction/paperWave';
import { ATTESA_PRESSA, CARTA as COREOGRAFIA } from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import { selCarta, store, useImpronta, type Carta as TipoCarta } from '../../state/store';

/** Spazio indivisibile: rende "nuovo" per aria-live un annuncio ripetuto. */
const NBSP = ' ';

/* ------------------------------------------------------------------ striscia */

interface PropsStriscia {
  carta: TipoCarta;
  indice: number;
  scelta: boolean;
  tabulabile: boolean;
  idBase: string;
  /** Il gruppo delle strisce: la pressa dei nomi parte quando entra al 30%. */
  gruppoRef: RefObject<HTMLDivElement>;
  registra: (indice: number, el: HTMLButtonElement | null) => void;
  onScegli: (carta: TipoCarta, e: ReactMouseEvent<HTMLButtonElement>) => void;
  onFuoco: (indice: number) => void;
}

function Striscia({ carta, indice, scelta, tabulabile, idBase, gruppoRef, registra, onScegli, onFuoco }: PropsStriscia) {
  const dati = CARTE[carta];
  const bottoneRef = useRef<HTMLButtonElement | null>(null);
  const foglioRef = useRef<HTMLSpanElement>(null);
  const nomeRef = useRef<HTMLSpanElement>(null);

  // Il nome a secco si preme all'ingresso, uno dopo l'altro (motion 6.4).
  const pressa = usePressione(nomeRef, {
    profilo: COREOGRAFIA.profilo,
    indice,
    osserva: gruppoRef,
  });

  // Magnete sobrio: nessuno spostamento, solo la vicinanza che solleva il
  // foglio di 2 px (.imp-ix-solleva) e lascia vedere più costa.
  useMagnete(foglioRef);

  // Hover (solo puntatore fine) e fuoco premono di più il nome.
  const sopra = useRef(false);
  const aFuoco = useRef(false);
  const aggiornaHover = useCallback(() => {
    pressa.hover(sopra.current || aFuoco.current);
  }, [pressa]);

  const suEntra = (e: ReactPointerEvent<HTMLButtonElement>): void => {
    if (e.pointerType === 'touch') return;
    sopra.current = true;
    aggiornaHover();
  };
  const suEsce = (): void => {
    if (!sopra.current) return;
    sopra.current = false;
    aggiornaHover();
  };
  const suFuoco = (): void => {
    aFuoco.current = true;
    aggiornaHover();
    onFuoco(indice);
  };
  const suSfuoco = (): void => {
    aFuoco.current = false;
    aggiornaHover();
  };

  const collega = useCallback(
    (el: HTMLButtonElement | null) => {
      bottoneRef.current = el;
      registra(indice, el);
    },
    [registra, indice],
  );

  const idSpessore = `${idBase}-${carta}-spessore`;
  const idDescrizione = `${idBase}-${carta}-descrizione`;

  return (
    <button
      ref={collega}
      type="button"
      role="radio"
      aria-checked={scelta}
      aria-label={dati.radioAria}
      aria-describedby={`${idSpessore} ${idDescrizione}`}
      tabIndex={tabulabile ? 0 : -1}
      data-carta={carta}
      data-scelta={scelta ? 'si' : 'no'}
      className={`imp-carta__striscia imp-carta__striscia--${carta} imp-ix-anello-interno`}
      onClick={(e) => onScegli(carta, e)}
      onPointerEnter={suEntra}
      onPointerLeave={suEsce}
      onPointerCancel={suEsce}
      onFocus={suFuoco}
      onBlur={suSfuoco}
    >
      <span ref={foglioRef} className="imp-carta__foglio imp-fibra imp-costa imp-ix-solleva">
        <span ref={nomeRef} {...ATTESA_PRESSA} className="imp-carta__secco imp-secco" aria-hidden="true">
          {dati.nome}
        </span>

        <span className="imp-carta__scelta" aria-hidden="true">
          {TESTI.scelta}
        </span>

        <span className="imp-carta__dati">
          <span className="imp-carta__nome">{dati.nome}</span>
          <span className="imp-carta__misure">
            <span className="imp-carta__grammatura">{dati.grammatura}</span>
            <span className="imp-carta__spessore" aria-hidden="true">
              <span className="imp-carta__calibro" />
              {dati.spessore}
            </span>
          </span>
          <span className="imp-carta__uso">{dati.uso}</span>
          <span id={idDescrizione} className="imp-carta__descrizione">
            {dati.descrizione}
          </span>
          <span id={idSpessore} className="imp-sr">
            {TESTI.spessoreSr(carta)}
          </span>
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ sezione */

export default function Carta() {
  const carta = useImpronta(selCarta);
  const idBase = useId().replace(/:/g, '');
  const idTitolo = `${idBase}-titolo`;
  const idIntro = `${idBase}-intro`;

  const gruppoRef = useRef<HTMLDivElement>(null);
  const bottoni = useRef<(HTMLButtonElement | null)[]>([]);
  const vivo = useRef(true);

  // Fuoco mobile: null = nessun fuoco nel gruppo, si entra sulla carta scelta.
  const [fuoco, setFuoco] = useState<number | null>(null);
  const [annuncio, setAnnuncio] = useState('');

  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
    };
  }, []);

  const indiceScelto = Math.max(0, ORDINE_CARTE.indexOf(carta));
  const indiceTabulabile = fuoco ?? indiceScelto;

  const registra = useCallback((indice: number, el: HTMLButtonElement | null) => {
    bottoni.current[indice] = el;
  }, []);

  const annuncia = useCallback((testo: string) => {
    setAnnuncio((prima) => (prima === testo ? `${testo}${NBSP}` : testo));
  }, []);

  const scegli = useCallback(
    (nuova: TipoCarta, e: ReactMouseEvent<HTMLButtonElement>) => {
      if (store.get().carta === nuova) return;
      const origine = origineDaEvento(e);
      const root = e.currentTarget.closest<HTMLElement>('.imp-root');
      void cambiaCarta(nuova, origine, { root }).then(() => {
        if (!vivo.current) return;
        // Annuncio solo se la carta del sito è ancora quella scelta qui
        // (un altro gruppo potrebbe averla cambiata durante l'onda).
        if (store.get().carta === nuova) annuncia(ANNUNCI.carta(nuova));
      });
    },
    [annuncia],
  );

  const spostaFuoco = (indice: number): void => {
    const n = ORDINE_CARTE.length;
    const i = ((indice % n) + n) % n;
    setFuoco(i);
    bottoni.current[i]?.focus();
  };

  const suTasto = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    const attuale = fuoco ?? indiceScelto;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        spostaFuoco(attuale + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        spostaFuoco(attuale - 1);
        break;
      case 'Home':
        e.preventDefault();
        spostaFuoco(0);
        break;
      case 'End':
        e.preventDefault();
        spostaFuoco(ORDINE_CARTE.length - 1);
        break;
      default:
        break;
    }
  };

  const suEscedalGruppo = (e: ReactFocusEvent<HTMLDivElement>): void => {
    const verso = e.relatedTarget;
    if (verso instanceof Node && e.currentTarget.contains(verso)) return;
    setFuoco(null);
  };

  return (
    <section id="carta" className="imp-carta imp-block" aria-labelledby={idTitolo}>
      <div className="imp-page">
        <header className="imp-carta__testa imp-griglia">
          <h2 id={idTitolo} className="imp-carta__titolo" tabIndex={-1}>
            {TESTI.titolo}
          </h2>
          <p id={idIntro} className="imp-carta__intro">
            {TESTI.intro}
          </p>
        </header>

        <div
          ref={gruppoRef}
          role="radiogroup"
          aria-label={TESTI.gruppoAria}
          aria-describedby={idIntro}
          className="imp-carta__gruppo imp-a-vivo"
          onKeyDown={suTasto}
          onBlur={suEscedalGruppo}
        >
          {ORDINE_CARTE.map((c, i) => (
            <Striscia
              key={c}
              carta={c}
              indice={i}
              scelta={c === carta}
              tabulabile={i === indiceTabulabile}
              idBase={idBase}
              gruppoRef={gruppoRef}
              registra={registra}
              onScegli={scegli}
              onFuoco={setFuoco}
            />
          ))}
        </div>

        <p className="imp-carta__campioni">{TESTI.campioni}</p>

        <p className="imp-sr" role="status" aria-live="polite" aria-atomic="true">
          {annuncio}
        </p>
      </div>
    </section>
  );
}
