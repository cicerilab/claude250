/**
 * IMPRONTA · sezione 2, "Tre lavori sul bancone" (`#lavori`).
 * section-builder-per-chi. Riferimenti: ux-architect §5.2 e §6.8,
 * motion-designer §6.2, interaction-designer §8, webgl-artist §12,
 * copywriter (`PER_CHI`), art-director (`.imp-foglio`, `data-carta`).
 *
 * - Sopra i 1024 px: tre oggetti sparsi sul foglio del sito, a scala vera fra
 *   loro (millimetri comuni), ruotati di -2°, 1,5°, -0,5°, ad altezze
 *   sfalsate; la didascalia in inchiostro sotto ciascuno, sul suo bordo sinistro.
 * - Sotto i 1024 px: mazzo con scroll-snap nativo (`useSwipeDeck`), il pezzo
 *   successivo sporge da destra; sotto, nomi-bottone e frecce ‹ ›.
 * - "Prova la tua" (tre partenze, un solo richiamo): imposta "Cosa stampi",
 *   tecnica e tiratura del pezzo, cambia la carta del sito con l'onda
 *   (`cambiaCarta`, mai `scegliCarta` diretto) e lascia che il clic delegato
 *   di Impronta.tsx porti al banco. L'annuncio `bancoImpostato` e quello del
 *   pezzo in vista vanno nella regione `aria-live` locale.
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import './per-chi.css';
import { useCallback, useRef, useState } from 'react';
import { ANNUNCI, PER_CHI } from '../../content/testi';
import type { Legatura, Prodotto } from '../../content/prezzi';
import { cambiaCarta } from '../../interaction/paperWave';
import { useSwipeDeck } from '../../interaction/useSwipeDeck';
import { aggiornaProva } from '../../state/store';
import Pezzo, { type TestiPezzo } from './Pezzo';

/**
 * Tiratura con cui parte il banco dopo "Prova la tua": la stessa della
 * didascalia del pezzo ("100 con busta", "100 biglietti", "50 copie"), così
 * il banco ritrova lo stesso oggetto allo stesso prezzo "da".
 */
const TIRATURA_DEL_PEZZO: Record<Prodotto, number> = {
  partecipazione: 100,
  biglietto: 100,
  intestata: 250,
  libro: 50,
};

/** La copertina del libretto è in brossura cucita (`righe` del pezzo). */
const LEGATURA_DEL_LIBRO: Legatura = 'brossura';

/** Spazio indivisibile: rende "nuovo" per aria-live un annuncio uguale al precedente. */
const NBSP = ' ';

export default function PerChi() {
  const sezioneRef = useRef<HTMLElement>(null);
  const [annuncio, setAnnuncio] = useState('');

  const annuncia = useCallback((testo: string) => {
    setAnnuncio((prima) => (prima === testo ? `${testo}${NBSP}` : testo));
  }, []);

  const mazzo = useSwipeDeck({
    count: PER_CHI.pezzi.length,
    onCambio: (i) => {
      const pezzo = PER_CHI.pezzi[i];
      if (pezzo !== undefined) annuncia(ANNUNCI.lavoroInVista(pezzo.titolo, i + 1));
    },
  });

  const suProva = useCallback(
    (pezzo: TestiPezzo, origine: HTMLElement) => {
      const { prodotto, carta, tecnica } = pezzo.preset;
      aggiornaProva({
        prodotto,
        tecnica,
        taglioColorato: false,
        tiratura: TIRATURA_DEL_PEZZO[prodotto],
        ...(prodotto === 'libro' ? { legatura: LEGATURA_DEL_LIBRO } : {}),
      });
      void cambiaCarta(carta, origine);
      annuncia(ANNUNCI.bancoImpostato(prodotto, carta));
    },
    [annuncia],
  );

  return (
    <section ref={sezioneRef} id="lavori" className="imp-perchi imp-block" aria-labelledby="imp-perchi-titolo">
      <div className="imp-page">
        <header className="imp-perchi__testa">
          <h2 id="imp-perchi-titolo" className="imp-perchi__titolo">
            {PER_CHI.titolo}
          </h2>
          <p className="imp-perchi__intro">{PER_CHI.intro}</p>
        </header>

        <ul className="imp-perchi__fila imp-ix-mazzo imp-lista" role="list" {...mazzo.filaProps}>
          {PER_CHI.pezzi.map((pezzo, i) => (
            <li
              key={pezzo.id}
              className={`imp-perchi__posto imp-perchi__posto--${pezzo.id} imp-ix-mazzo__pezzo`}
              {...mazzo.pezzoProps(i)}
            >
              <Pezzo pezzo={pezzo} indice={i} sezioneRef={sezioneRef} largo={!mazzo.attivo} onProva={suProva} />
            </li>
          ))}
        </ul>

        {mazzo.attivo ? (
          <nav className="imp-perchi__sfoglia imp-ix-mazzo-nav" aria-label={PER_CHI.fila.aria}>
            <button
              className="imp-perchi__freccia imp-ix-mazzo-nav__freccia imp-ix-premibile"
              aria-label={PER_CHI.fila.precedente}
              {...mazzo.precedenteProps}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <span className="imp-perchi__nomi">
              {PER_CHI.pezzi.map((pezzo, i) => (
                <button key={pezzo.id} className="imp-perchi__nome-bottone imp-ix-mazzo-nav__nome" {...mazzo.nomeProps(i)}>
                  {pezzo.nomeBreve}
                </button>
              ))}
            </span>
            <button
              className="imp-perchi__freccia imp-ix-mazzo-nav__freccia imp-ix-premibile"
              aria-label={PER_CHI.fila.successivo}
              {...mazzo.successivoProps}
            >
              <span aria-hidden="true">›</span>
            </button>
          </nav>
        ) : null}

        <p className="imp-sr" aria-live="polite" aria-atomic="true">
          {annuncio}
        </p>
      </div>
    </section>
  );
}
