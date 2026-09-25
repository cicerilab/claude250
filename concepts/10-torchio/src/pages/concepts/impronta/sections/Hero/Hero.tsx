/**
 * IMPRONTA · Hero, "la pressa" (`#inizio`). section-builder-hero.
 *
 * Cosa c'è (ux-architect 5.1, copywriter HERO, motion-designer 6.1):
 * - la parola *impronta* premuta a secco, larga esattamente quanto l'area
 *   viva della pagina (margini da libro), registrata nel registro dei rilievi
 *   (lo shader la disegna quando c'è, il fallback CSS la disegna da subito);
 *   la pressa scende una volta sola al montaggio, dopo i font;
 * - l'h1 in inchiostro, il sottotitolo e l'unico bottone "Prova la tua":
 *   fermi e leggibili dal primo frame (LCP = h1 nel DOM, mai il canvas);
 * - su desktop il dial "Direzione della luce" in basso a destra del blocco
 *   di testo (ux-architect 6.3);
 * - l'invito "luce col telefono" NEL FLUSSO sotto "Prova la tua", solo quando
 *   gyroPermission lo chiede (mai fisso, mai in basso a sinistra: lì c'è il
 *   bottone "Torna in Ciceri Lab" del sito);
 * - dopo l'invio dal banco: al posto di *impronta* il testo del cliente,
 *   adattato alla larghezza, e la riga "La tua prova è in stampa." al posto
 *   del sottotitolo; la pressa si riarma e riscende sui suoi nomi.
 *
 * Nessuna informazione vive solo nel rilievo: la parola è aria-hidden (ripete
 * il marchio) oppure, col testo del cliente, ha il suo gemello in `.imp-sr`.
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import './hero.css';

import { ANNUNCI, COMUNI, HERO as TESTI_HERO, LUCE, RILIEVI, TESTATA } from '../../content/testi';
import { attivaGyro, rifiutaInvito, useGyro } from '../../interaction/gyroPermission';
import { useLuceDial } from '../../interaction/light';
import { ATTESA_PRESSA, HERO as MOTO_HERO } from '../../motion/choreography';
import { usePressione, type ComandiPressione } from '../../motion/usePressione';
import { useRelief } from '../../relief/useRelief';
import { useImpronta } from '../../state/store';
import { stimaLarghezzaEm, TIPO } from '../../styles/tokens';

/** Id stabili (una sola hero nella pagina). */
const ID_TITOLO = 'imp-hero-titolo';
const ID_SOTTO = 'imp-hero-sotto';

/** Priorità del blocco nell'elenco dello shader: la parola dell'hero viene prima di tutto. */
const PRIORITA_PAROLA = 10;

/** Corpo (px) del gemello invisibile che misura il testo del cliente (vedi hero.css). */
const CORPO_MISURA = 100;

/**
 * Larghezza in em del testo del cliente alle tre larghezze d'arrivo della
 * parola (100 sotto 600 px, 125 fino a 1023, 150 da 1024), a peso 900 e con
 * il tracking della voce: il CSS sceglie quella giusta e calcola il corpo
 * perché il testo riempia l'area viva senza superarla.
 */
function variabiliCliente(testo: string): CSSProperties {
  const tracking = TIPO.seccoHero.trackingEm;
  const em = (wdth: number): string => stimaLarghezzaEm(testo, wdth, TIPO.seccoHero.wght, tracking).toFixed(4);
  return {
    '--imp-hero-em-s': em(TIPO.seccoHero.wdth.s),
    '--imp-hero-em-m': em(TIPO.seccoHero.wdth.m),
    '--imp-hero-em-l': em(TIPO.seccoHero.wdth.l),
  } as CSSProperties;
}

/** "Muovi la luce inclinando il telefono": riga nel flusso, sotto il bottone. */
function InvitoLuce({ onEsito }: { onEsito: (annuncio: string | null) => void }) {
  const gyro = useGyro();
  const ridotto = useImpronta((s) => s.reducedMotion);
  const visibile = !ridotto && (gyro.stato === 'invito' || (gyro.inAttesa && gyro.stato !== 'attivo'));
  if (!visibile) return null;

  const attiva = (): void => {
    // attivaGyro chiama requestPermission in modo sincrono: siamo nel clic.
    void attivaGyro().then((stato) => {
      onEsito(stato === 'attivo' ? ANNUNCI.tiltAttivo : ANNUNCI.tiltSpento);
    });
  };

  const lascia = (): void => {
    // Nessun annuncio: la luce non stava seguendo il telefono, cambia solo il fuoco.
    rifiutaInvito();
    onEsito(null);
  };

  return (
    <div className="imp-hero__invito imp-ix-invito" role="group" aria-labelledby="imp-hero-invito-frase">
      <p id="imp-hero-invito-frase" className="imp-hero__invito-frase">
        {TESTI_HERO.tilt.frase}
      </p>
      <div className="imp-hero__invito-azioni">
        <button
          type="button"
          className="imp-hero__invito-attiva imp-ix-premibile imp-ix-tocco"
          onClick={attiva}
          aria-busy={gyro.inAttesa || undefined}
        >
          {TESTI_HERO.tilt.attiva}
        </button>
        <button type="button" className="imp-hero__invito-lascia imp-ix-link imp-ix-tocco" onClick={lascia}>
          {TESTI_HERO.tilt.lascia}
        </button>
      </div>
    </div>
  );
}

/** Dial "Direzione della luce" (solo desktop, lo nasconde il CSS sotto 1024 px). */
function DialLuce() {
  const dial = useLuceDial();
  return (
    <div className="imp-hero__luce">
      <span className="imp-hero__luce-etichetta" aria-hidden="true">
        {LUCE.etichetta}
      </span>
      <div className="imp-ix-dial" {...dial.contenitoreProps}>
        <span className="imp-ix-dial__icona" aria-hidden="true" />
        <input className="imp-ix-dial__input" {...dial.inputProps} />
      </div>
    </div>
  );
}

export default function Hero() {
  const testoCliente = useImpronta((s) => s.testoCliente);

  const parola = testoCliente ?? TESTI_HERO.parola;
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const parolaRef = useRef<HTMLDivElement>(null);
  const [annuncio, setAnnuncio] = useState('');

  /*
   * Riarmo della pressa quando arriva il testo del cliente a pagina aperta
   * (motion-designer 6.1: prima riarma, poi cambia il testo). Questo effetto
   * è dichiarato PRIMA di useRelief, quindi nello stesso commit gira prima
   * dell'aggiornamento della spec nel registro.
   */
  const comandiRef = useRef<ComandiPressione | null>(null);
  const clientePrima = useRef<string | null>(testoCliente);
  useLayoutEffect(() => {
    if (clientePrima.current === testoCliente) return;
    clientePrima.current = testoCliente;
    comandiRef.current?.riarma();
  }, [testoCliente]);

  const reliefId = useRelief(parolaRef, {
    kind: 'text',
    text: parola,
    tecnica: 'secco',
    profondita: 1,
    tracking: 'doc',
    priorita: PRIORITA_PAROLA,
  });

  const attendiFont = useCallback((): Promise<unknown> => document.fonts.ready, []);
  const pressa = usePressione(parolaRef, {
    profilo: MOTO_HERO.profilo,
    reliefId,
    ingresso: testoCliente !== null ? 'vista' : 'montaggio',
    attendi: attendiFont,
  });
  comandiRef.current = pressa;

  const stileParola = useMemo(() => (testoCliente !== null ? variabiliCliente(testoCliente) : undefined), [testoCliente]);

  /*
   * Testo del cliente: la stima in em è buona al ±4%, la misura del DOM è
   * esatta. Un gemello invisibile a 100 px con gli assi d'ARRIVO (non quelli
   * che la pressa sta animando) dà la larghezza vera in em; il CSS la usa per
   * riempire l'area viva al pixel. Si rimisura quando cambia (font caricati,
   * larghezza d'arrivo diversa oltre 600 o 1024 px).
   */
  const pianoRef = useRef<HTMLDivElement>(null);
  const misuraRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const piano = pianoRef.current;
    const misura = misuraRef.current;
    if (piano === null || misura === null) return undefined;
    let vivo = true;
    const aggiorna = (): void => {
      if (!vivo) return;
      const larghezza = misura.getBoundingClientRect().width;
      if (larghezza > 0) piano.style.setProperty('--imp-hero-em-misurato', (larghezza / CORPO_MISURA).toFixed(4));
    };
    aggiorna();
    const osservatore = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(aggiorna) : null;
    osservatore?.observe(misura);
    void document.fonts.ready.then(aggiorna);
    return () => {
      vivo = false;
      osservatore?.disconnect();
      piano.style.removeProperty('--imp-hero-em-misurato');
    };
  }, [testoCliente]);

  const esitoInvito = useCallback((testo: string | null) => {
    // Un NBSP in coda rende "nuovo" lo stesso testo per aria-live.
    if (testo !== null) setAnnuncio((prima) => (prima === testo ? `${testo}\u00a0` : testo));
    // La riga dell'invito sparisce: il fuoco torna sul bottone che le sta sopra.
    ctaRef.current?.focus({ preventScroll: true });
  }, []);

  // Il clic su "Prova la tua" lo gestisce Impronta.tsx (link interni delegati).
  // data-imp-hero-cta serve alla testata mobile: il richiamo in basso compare
  // solo quando questo bottone è uscito dallo schermo.

  return (
    <section
      id="inizio"
      className="imp-hero imp-page"
      aria-labelledby={ID_TITOLO}
      data-imp-luce=""
    >
      <div ref={pianoRef} className="imp-hero__piano">
        <div
          ref={parolaRef}
          {...ATTESA_PRESSA}
          className="imp-hero__parola imp-relief imp-secco imp-pressa"
          data-cliente={testoCliente !== null ? '' : undefined}
          style={stileParola}
          aria-hidden="true"
        >
          {parola}
        </div>
        {/* "impronta" ripete il marchio (decorativa); il testo del cliente no: gemello per i lettori di schermo. */}
        {testoCliente !== null ? (
          <>
            <p className="imp-sr">{RILIEVI.heroParolaCliente.alt(testoCliente)}</p>
            <span className="imp-hero__misura" aria-hidden="true">
              <span ref={misuraRef} className="imp-hero__misura-testo">
                {testoCliente}
              </span>
            </span>
          </>
        ) : null}
      </div>

      <div className="imp-hero__testo imp-griglia">
        <h1 id={ID_TITOLO} className="imp-hero__titolo imp-inchiostro">
          {TESTI_HERO.titolo}
        </h1>

        <p id={ID_SOTTO} className="imp-hero__sotto">
          {testoCliente !== null ? TESTI_HERO.dopoInvio : TESTI_HERO.sottotitolo}
        </p>

        <div className="imp-hero__azioni">
          <a
            ref={ctaRef}
            href="#banco"
            className="imp-hero__cta imp-lamina imp-ix-premibile"
            aria-label={TESTATA.provaAria}
            data-imp-hero-cta=""
          >
            {COMUNI.provaLaTua}
          </a>
          <DialLuce />
        </div>

        <InvitoLuce onEsito={esitoInvito} />

        <p className="imp-sr" aria-live="polite">
          {annuncio}
        </p>
      </div>
    </section>
  );
}
