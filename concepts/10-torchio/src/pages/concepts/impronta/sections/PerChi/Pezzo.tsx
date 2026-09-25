/**
 * IMPRONTA · un lavoro sul bancone (section-builder-per-chi).
 *
 * Un `<article>` con due parti:
 * - il **piano**: l'oggetto vero, composto in DOM sulla sua carta
 *   (`.imp-foglio` + `data-carta`), ruotato di poco e registrato come pezzo
 *   composto (`kind: 'piece'`) con i layer agganciati ai figli tramite
 *   `selettore`. Lo shader lo preme dal vivo; senza WebGL lo stesso DOM è il
 *   rilievo CSS. Tutto il piano è `aria-hidden`: il suo contenuto è ripetuto
 *   per intero dal testo alternativo `.imp-sr` (copywriter §6);
 * - la **didascalia** da catalogo in inchiostro: h3, una nota (per chi è,
 *   carta e formato), il prezzo "da" e un link testuale al banco
 *   ("Prova la tua partecipazione", `provaAria`), che imposta il banco (vedi
 *   PerChi.tsx). Anche l'oggetto è cliccabile. Niente bottoni: giro 2.
 *
 * Dettagli d'oggetto (docs/section-builder-per-chi.md §3):
 * - la partecipazione ha sotto la sua busta, un secondo pezzo Cipria con la
 *   piega della patta in cordonatura (registrato prima: nello shader sta sotto);
 * - la copertina ha la cerniera della brossura in cordonatura e il taglio
 *   delle pagine che spunta a destra e in basso (fuori dal rettangolo del
 *   pezzo, così con il WebGL acceso non copre la copertina disegnata).
 *
 * La rotazione sta sul wrapper `.imp-perchi__foglio` e nella spec, mai
 * sull'elemento registrato (tech-architect §7.2). Pressione: `usePressione`
 * con il profilo `perChiPezzo`, innesco sulla sezione, sfasamento per indice;
 * hover e fuoco la portano a 1 senza spostare nulla (motion-designer §6.2).
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import {
  useCallback,
  useId,
  useRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { PER_CHI } from '../../content/testi';
import { ATTESA_PRESSA, PER_CHI as MOTO_PER_CHI } from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import type { ReliefLayer, TecnicaRilievo, TrackingRilievo } from '../../relief/types';
import { useRelief } from '../../relief/useRelief';

/* ------------------------------------------------------------------ tipi */

export type TestiPezzo = (typeof PER_CHI.pezzi)[number];
export type IdPezzo = TestiPezzo['id'];

/** Classe materiale del fallback CSS (relief-fallback.css). */
type Materiale = 'secco' | 'inchiostro' | 'caldo';

interface Strato {
  /** Indice in `PER_CHI.pezzi[].rilievo`. */
  readonly riga: number;
  /** Nome del ruolo: classe `imp-perchi__riga--<ruolo>` e `data-strato`. */
  readonly ruolo: string;
  readonly materiale: Materiale;
  /** 0..1: 1 = pressione piena, 0,3 = inchiostro "a bacio". */
  readonly profondita: number;
  /**
   * Riquadro in percento del pezzo [x, y, w, h]. Lo shader lo usa solo se il
   * figlio non si trova (con il DOM presente, testo e posizione sono quelli veri).
   */
  readonly riquadro: readonly [number, number, number, number];
}

interface Composizione {
  /** Tecnica di base del pezzo (quella dei layer senza tecnica propria). */
  readonly tecnica: TecnicaRilievo;
  readonly profondita: number;
  readonly strati: readonly Strato[];
  /** Layer senza testo (cordonature). */
  readonly segni: readonly ReliefLayer[];
}

const TECNICA_DI: Record<Materiale, TecnicaRilievo> = {
  secco: 'secco',
  inchiostro: 'colore',
  caldo: 'lamina',
};

/**
 * Come è composto ogni pezzo. I testi sono quelli di `PER_CHI.pezzi[].rilievo`
 * (copywriter); qui solo ruolo, materiale e profondità, come nelle `righe`:
 * partecipazione "nomi a secco, data in inchiostro"; biglietto "nome in
 * lamina argento"; copertina "titolo in inchiostro bianco".
 */
const COMPOSIZIONI: Record<IdPezzo, Composizione> = {
  partecipazione: {
    tecnica: 'secco',
    profondita: 0.85,
    strati: [
      { riga: 0, ruolo: 'nomi', materiale: 'secco', profondita: 1, riquadro: [8, 16, 84, 30] },
      { riga: 1, ruolo: 'annuncio', materiale: 'inchiostro', profondita: 0.3, riquadro: [8, 50, 84, 9] },
      { riga: 2, ruolo: 'data', materiale: 'inchiostro', profondita: 0.3, riquadro: [8, 61, 84, 10] },
      { riga: 3, ruolo: 'luogo', materiale: 'inchiostro', profondita: 0.3, riquadro: [8, 74, 84, 9] },
    ],
    segni: [],
  },
  biglietto: {
    tecnica: 'lamina',
    profondita: 0.8,
    strati: [
      { riga: 0, ruolo: 'nome', materiale: 'caldo', profondita: 1, riquadro: [10, 48, 80, 22] },
      { riga: 1, ruolo: 'mestiere', materiale: 'inchiostro', profondita: 0.3, riquadro: [10, 72, 80, 12] },
    ],
    segni: [],
  },
  libro: {
    tecnica: 'colore',
    profondita: 0.75,
    strati: [
      // "poesie" in testa come nome di collana, titolo sotto, autrice al piede.
      { riga: 2, ruolo: 'genere', materiale: 'inchiostro', profondita: 0.3, riquadro: [15, 8, 76, 5] },
      { riga: 0, ruolo: 'titolo', materiale: 'inchiostro', profondita: 0.35, riquadro: [15, 16, 76, 30] },
      { riga: 1, ruolo: 'autore', materiale: 'inchiostro', profondita: 0.3, riquadro: [15, 84, 76, 7] },
    ],
    // La cerniera della brossura: cordonatura verticale a 7% dal dorso.
    segni: [{ kind: 'linea', x: 6.6, y: 0, w: 0.7, h: 100, tecnica: 'cordonatura', profondita: 0.7 }],
  },
};

/** La patta della busta: una V di cordonatura, stesso disegno per shader e DOM. */
const PATTA_VIEWBOX = '0 0 162 64';
const PATTA_PATH = 'M0 0 L81 58 L162 0';
const PATTA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${PATTA_VIEWBOX}"><path d="${PATTA_PATH}" fill="none" stroke="#000" stroke-width="1.6" stroke-linejoin="miter"/></svg>`;
/** Altezza della patta sulla busta 162×114 mm: 64/114 = 56,1%. */
const PATTA_ALTEZZA = (64 / 114) * 100;
/**
 * Priorità per lo shader (al massimo 8 blocchi sullo schermo, webgl/blocks.ts):
 * i tre pezzi prima della busta, così a 2560 la copertina non resta fuori
 * dal GL (responsive-tester, giro 1). Sotto la prova del banco (9-10).
 */
const PRIORITA_PEZZO = 4;
const PRIORITA_BUSTA = 2;
/** La busta è ruotata così rispetto al bancone (la partecipazione sta a -2°). */
const ROTAZIONE_BUSTA = 3;

function testoRiga(pezzo: TestiPezzo, riga: number): string {
  return (pezzo.rilievo as readonly string[])[riga] ?? '';
}

function selettoreStrato(ruolo: string): string {
  return `[data-strato="${ruolo}"]`;
}

function stileRotazione(gradi: number): CSSProperties {
  return { '--imp-perchi-rot': `${gradi}deg` } as CSSProperties;
}

/* ------------------------------------------------------------------ busta */

interface PropsBusta {
  readonly indice: number;
  readonly sezioneRef: RefObject<HTMLElement | null>;
  readonly tracking: TrackingRilievo;
}

/** La busta sotto la partecipazione ("100 con busta"): pezzo Cipria, patta in cordonatura. */
function Busta({ indice, sezioneRef, tracking }: PropsBusta) {
  const ref = useRef<HTMLDivElement>(null);
  const reliefId = useRelief(ref, {
    kind: 'piece',
    tecnica: 'cordonatura',
    carta: 'cipria',
    profondita: 0.6,
    rotazione: ROTAZIONE_BUSTA,
    tracking,
    priorita: PRIORITA_BUSTA,
    layers: [{ kind: 'svg', x: 0, y: 0, w: 100, h: PATTA_ALTEZZA, svg: PATTA_SVG, tecnica: 'cordonatura' }],
  });
  usePressione(ref, { profilo: MOTO_PER_CHI.profilo, reliefId, indice, osserva: sezioneRef });

  return (
    <div className="imp-perchi__busta-foglio" style={stileRotazione(ROTAZIONE_BUSTA)}>
      <div ref={ref} {...ATTESA_PRESSA} className="imp-perchi__busta imp-foglio imp-relief" data-carta="cipria">
        <svg className="imp-perchi__patta" viewBox={PATTA_VIEWBOX} preserveAspectRatio="none" focusable="false">
          <path className="imp-perchi__patta-luce" d={PATTA_PATH} />
          <path className="imp-perchi__patta-ombra" d={PATTA_PATH} />
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pezzo */

export interface PropsPezzo {
  readonly pezzo: TestiPezzo;
  readonly indice: number;
  /** La sezione: l'ingresso della pressa scatta quando entra al 30%. */
  readonly sezioneRef: RefObject<HTMLElement | null>;
  /** true sopra i 1024 px (pezzi sparsi, misura 'doc'); false nel mazzo (misura 'live'). */
  readonly largo: boolean;
  /** Link al banco: imposta il banco con il preset del pezzo. Il viaggio a #banco lo fa Impronta.tsx. */
  readonly onProva: (pezzo: TestiPezzo, origine: HTMLElement) => void;
}

export default function Pezzo({ pezzo, indice, sezioneRef, largo, onProva }: PropsPezzo) {
  const ref = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const idGrezzo = useId();
  const idTitolo = `imp-perchi-${pezzo.id}-${idGrezzo.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const composizione = COMPOSIZIONI[pezzo.id];
  const rotazione = MOTO_PER_CHI.rotazioni[indice] ?? 0;
  const tracking: TrackingRilievo = largo ? 'doc' : 'live';

  const layers: ReliefLayer[] = [
    ...composizione.strati.map(
      (s): ReliefLayer => ({
        kind: 'text',
        x: s.riquadro[0],
        y: s.riquadro[1],
        w: s.riquadro[2],
        h: s.riquadro[3],
        text: testoRiga(pezzo, s.riga),
        tecnica: TECNICA_DI[s.materiale],
        profondita: s.profondita,
        selettore: selettoreStrato(s.ruolo),
      }),
    ),
    ...composizione.segni,
  ];

  const reliefId = useRelief(ref, {
    kind: 'piece',
    tecnica: composizione.tecnica,
    carta: pezzo.preset.carta,
    profondita: composizione.profondita,
    rotazione,
    tracking,
    priorita: PRIORITA_PEZZO,
    layers,
  });

  const pressa = usePressione(ref, { profilo: MOTO_PER_CHI.profilo, reliefId, indice, osserva: sezioneRef });

  // Hover e fuoco si sommano: la pressione torna a riposo solo quando mancano entrambi.
  const sopra = useRef(false);
  const fuoco = useRef(false);
  const aggiornaHover = useCallback(() => {
    pressa.hover(sopra.current || fuoco.current);
  }, [pressa]);

  const suEntra = (e: ReactPointerEvent<HTMLElement>): void => {
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
    fuoco.current = true;
    aggiornaHover();
  };
  const suSfuoco = (e: ReactFocusEvent<HTMLElement>): void => {
    const verso = e.relatedTarget;
    if (verso instanceof Node && e.currentTarget.contains(verso)) return;
    fuoco.current = false;
    aggiornaHover();
  };

  const suProva = (e: ReactMouseEvent<HTMLAnchorElement>): void => {
    onProva(pezzo, e.currentTarget);
  };

  // L'oggetto stesso porta al banco: comodità per il puntatore. Tastiera e
  // lettori di schermo usano il link della didascalia (l'oggetto è aria-hidden).
  const suOggetto = (): void => {
    linkRef.current?.click();
  };

  return (
    <article
      className={`imp-perchi__lavoro imp-perchi__lavoro--${pezzo.id}`}
      aria-labelledby={idTitolo}
      onPointerEnter={suEntra}
      onPointerLeave={suEsce}
      onFocus={suFuoco}
      onBlur={suSfuoco}
    >
      <div className="imp-perchi__tavolo" aria-hidden="true" onClick={suOggetto}>
        <div className="imp-perchi__piano">
          {pezzo.id === 'partecipazione' ? <Busta indice={indice} sezioneRef={sezioneRef} tracking={tracking} /> : null}
          <div className="imp-perchi__foglio" style={stileRotazione(rotazione)}>
            {pezzo.id === 'libro' ? (
              <>
                <span className="imp-perchi__pagine imp-perchi__pagine--taglio" data-carta="cotone" />
                <span className="imp-perchi__pagine imp-perchi__pagine--piede" data-carta="cotone" />
              </>
            ) : null}
            <div
              ref={ref}
              {...ATTESA_PRESSA}
              className={`imp-perchi__pezzo imp-perchi__pezzo--${pezzo.id} imp-foglio imp-relief`}
              data-carta={pezzo.preset.carta}
            >
              {pezzo.id === 'libro' ? <span className="imp-perchi__cerniera" /> : null}
              {composizione.strati.map((s) => (
                <span
                  key={s.ruolo}
                  data-strato={s.ruolo}
                  className={`imp-perchi__riga imp-perchi__riga--${s.ruolo} imp-${s.materiale}`}
                  style={{ '--imp-rilievo': String(s.profondita) } as CSSProperties}
                >
                  {testoRiga(pezzo, s.riga)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="imp-perchi__didascalia">
        <h3 id={idTitolo} className="imp-perchi__nome">
          {pezzo.titolo}
        </h3>
        <p className="imp-sr">{pezzo.alt}</p>
        <p className="imp-perchi__nota">
          <span className="imp-perchi__per-chi">{pezzo.perChi}</span>
          <span className="imp-perchi__righe">{pezzo.righe}</span>
        </p>
        <p className="imp-perchi__prezzo">{pezzo.prezzo}</p>
        <a ref={linkRef} className="imp-perchi__prova imp-ix-link" href="#banco" onClick={suProva}>
          {pezzo.provaAria}
          <span className="imp-perchi__freccina" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
