/**
 * IMPRONTA · Hero, "la pressa" (`#inizio`). section-builder-hero, giro 2.
 *
 * Composizione (giuria giro 1, §2 Hero): la parola *impronta* è l'OGGETTO,
 * non un'intestazione. È spezzata in due righe premute, "impron" e "ta",
 * alla stessa misura di corpo: la prima riempie l'area viva al pixel, la
 * seconda è allineata al margine esterno. Insieme occupano circa il 40%
 * dell'altezza della prima schermata. Il blocco in inchiostro (h1,
 * sottotitolo, "Prova la tua") è agganciato alla parola:
 * - da 1024 px sta nel vuoto a sinistra di "ta", appeso alla sua linea
 *   della x (il titolo pende dalla parola come una didascalia dal cliché);
 * - sotto i 1024 px sta subito sotto "ta", a 24-40 px dalla linea di base.
 * L'hero è alto quanto il suo contenuto: nessun vuoto a nessuna larghezza.
 *
 * Tecnica (invariata dal giro 1 dove non detto):
 * - ogni riga è un blocco a rilievo (`useRelief`) con la sua pressa
 *   (`usePressione`, profilo dell'hero, al montaggio dopo i font);
 * - il corpo si calcola dalla riga più lunga: stima in em alle tre larghezze
 *   d'arrivo prima della misura, poi misura del DOM (gemelli invisibili a
 *   100 px con gli assi d'arrivo) e `100cqi / em` in CSS, con un tetto sul
 *   42% dell'altezza della finestra;
 * - dopo l'invio dal banco il testo del cliente prende il posto della parola
 *   (una o due righe, spezzate tra le parole), la riga "La tua prova è in
 *   stampa." sostituisce il sottotitolo, la pressa si riarma e riscende;
 * - l'invito "luce col telefono" resta nel flusso, sotto il bottone.
 * Il dial della luce (solo desktop) sta sotto "ta", chiuso sul margine
 * esterno come la parola (giuria: allineato alla gabbia, accanto alla parola).
 *
 * Nessuna informazione solo nel rilievo; nessun accesso a window/document a
 * livello di modulo.
 */

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import './hero.css';

import { ANNUNCI, COMUNI, HERO as TESTI_HERO, LUCE, RILIEVI, TESTATA } from '../../content/testi';
import { attivaGyro, rifiutaInvito, useGyro } from '../../interaction/gyroPermission';
import { useLuceDial } from '../../interaction/light';
import { ATTESA_PRESSA, HERO as MOTO_HERO } from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import { useRelief } from '../../relief/useRelief';
import { useImpronta } from '../../state/store';
import { stimaLarghezzaEm, TIPO } from '../../styles/tokens';

const ID_TITOLO = 'imp-hero-titolo';

/** Priorità dei blocchi dell'hero nell'elenco dello shader. */
const PRIORITA_PAROLA = 10;

/** Corpo (px) dei gemelli invisibili che misurano le righe (vedi hero.css). */
const CORPO_MISURA = 100;

/** Lettere che restano sulla seconda riga della parola: im·pron / ta. */
const CODA_PAROLA = 2;

/**
 * Le righe della parola premuta.
 * - "impronta" → "impron" / "ta" (l'ultima sillaba scende, come in un
 *   manifesto composto a mano);
 * - testo del cliente con più parole → due righe spezzate tra le parole,
 *   il più possibile uguali;
 * - una parola sola → una riga.
 */
function righeDi(testo: string, cliente: boolean): string[] {
  const t = testo.trim();
  if (!cliente) return [t.slice(0, -CODA_PAROLA), t.slice(-CODA_PAROLA)];
  const parole = t.split(/\s+/).filter((p) => p.length > 0);
  if (parole.length < 2) return [t];
  let migliore = 1;
  let scarto = Number.POSITIVE_INFINITY;
  for (let i = 1; i < parole.length; i += 1) {
    const a = parole.slice(0, i).join(' ').length;
    const b = parole.slice(i).join(' ').length;
    const d = Math.abs(a - b);
    if (d < scarto) {
      scarto = d;
      migliore = i;
    }
  }
  return [parole.slice(0, migliore).join(' '), parole.slice(migliore).join(' ')];
}

/** Stima (em) della riga più lunga alle tre larghezze d'arrivo, prima della misura del DOM. */
function variabiliStima(righe: readonly string[]): CSSProperties {
  const tracking = TIPO.seccoHero.trackingEm;
  const em = (wdth: number): string =>
    Math.max(...righe.map((r) => stimaLarghezzaEm(r, wdth, TIPO.seccoHero.wght, tracking))).toFixed(4);
  return {
    '--imp-hero-em-s': em(TIPO.seccoHero.wdth.s),
    '--imp-hero-em-m': em(TIPO.seccoHero.wdth.m),
    '--imp-hero-em-l': em(TIPO.seccoHero.wdth.l),
    '--imp-hero-righe': String(righe.length),
  } as CSSProperties;
}

interface PropsRiga {
  testo: string;
  indice: number;
  cliente: boolean;
}

/** Una riga premuta: blocco a rilievo con la sua pressa. */
function RigaPremuta({ testo, indice, cliente }: PropsRiga) {
  const ref = useRef<HTMLDivElement>(null);

  // Testo che cambia a pagina aperta (arriva il testo del cliente): prima la
  // pressa si riarma, poi cambia la spec (motion-designer 6.1). Questo effetto
  // è dichiarato prima di useRelief, quindi gira prima nello stesso commit.
  const comandiRef = useRef<ReturnType<typeof usePressione> | null>(null);
  const testoPrima = useRef(testo);
  useLayoutEffect(() => {
    if (testoPrima.current === testo) return;
    testoPrima.current = testo;
    comandiRef.current?.riarma();
  }, [testo]);

  const reliefId = useRelief(ref, {
    kind: 'text',
    text: testo,
    tecnica: 'secco',
    profondita: 1,
    tracking: 'doc',
    priorita: PRIORITA_PAROLA,
  });

  const attendiFont = useCallback((): Promise<unknown> => document.fonts.ready, []);
  comandiRef.current = usePressione(ref, {
    profilo: MOTO_HERO.profilo,
    reliefId,
    indice,
    ingresso: cliente ? 'vista' : 'montaggio',
    attendi: attendiFont,
  });

  return (
    <div
      ref={ref}
      {...ATTESA_PRESSA}
      className={`imp-hero__riga imp-hero__riga--${indice + 1} imp-relief imp-secco imp-pressa`}
      aria-hidden="true"
    >
      {testo}
    </div>
  );
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

/**
 * Dial "Direzione della luce" (solo da 1024 px): sotto "ta", chiuso sul
 * margine esterno come la parola, alla linea del bottone.
 */
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
  const cliente = testoCliente !== null;
  const parola = testoCliente ?? TESTI_HERO.parola;
  const righe = useMemo(() => righeDi(parola, cliente), [parola, cliente]);
  const chiaveRighe = righe.join('\n');

  const pianoRef = useRef<HTMLDivElement>(null);
  const misureRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [annuncio, setAnnuncio] = useState('');

  const stileStima = useMemo(() => variabiliStima(righe), [righe]);

  /*
   * Misura del DOM: i gemelli invisibili (100 px, assi d'ARRIVO, non quelli
   * che la pressa sta animando) danno la larghezza vera in em della riga più
   * lunga; il CSS la usa per riempire l'area viva al pixel. Si rimisura
   * quando i gemelli cambiano misura (font caricati, larghezza d'arrivo
   * diversa oltre 600 o 1024 px).
   */
  useLayoutEffect(() => {
    const piano = pianoRef.current;
    const misure = misureRef.current;
    if (piano === null || misure === null) return undefined;
    let vivo = true;
    const aggiorna = (): void => {
      if (!vivo) return;
      let massimo = 0;
      for (const figlio of Array.from(misure.children)) {
        massimo = Math.max(massimo, figlio.getBoundingClientRect().width);
      }
      if (massimo > 0) piano.style.setProperty('--imp-hero-em-misurato', (massimo / CORPO_MISURA).toFixed(4));
    };
    aggiorna();
    const osservatore = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(aggiorna) : null;
    for (const figlio of Array.from(misure.children)) osservatore?.observe(figlio);
    void document.fonts.ready.then(aggiorna);
    return () => {
      vivo = false;
      osservatore?.disconnect();
      piano.style.removeProperty('--imp-hero-em-misurato');
    };
  }, [chiaveRighe]);

  const esitoInvito = useCallback((testo: string | null) => {
    // Un NBSP in coda rende "nuovo" lo stesso testo per aria-live.
    if (testo !== null) setAnnuncio((prima) => (prima === testo ? `${testo}\u00a0` : testo));
    // La riga dell'invito sparisce: il fuoco torna sul bottone che le sta sopra.
    ctaRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section id="inizio" className="imp-hero" aria-labelledby={ID_TITOLO} data-imp-luce="">
      <div
        ref={pianoRef}
        className="imp-hero__piano"
        style={stileStima}
        data-righe={righe.length}
        data-cliente={cliente ? '' : undefined}
      >
        <div className="imp-hero__composizione">
          {righe.map((r, i) => (
            <RigaPremuta key={i} testo={r} indice={i} cliente={cliente} />
          ))}

          <div className="imp-hero__testo">
            <h1 id={ID_TITOLO} className="imp-hero__titolo imp-inchiostro">
              {TESTI_HERO.titolo}
            </h1>

            <p className="imp-hero__sotto">{cliente ? TESTI_HERO.dopoInvio : TESTI_HERO.sottotitolo}</p>

            {/* Il clic lo gestisce Impronta.tsx (link # delegati). data-imp-richiamo:
                la testata nasconde i suoi "Prova la tua" mentre questo è in vista. */}
            <a
              ref={ctaRef}
              href="#banco"
              className="imp-hero__cta imp-lamina imp-ix-premibile"
              aria-label={TESTATA.provaAria}
              data-imp-richiamo="hero"
            >
              {COMUNI.provaLaTua}
            </a>

            <InvitoLuce onEsito={esitoInvito} />

            <p className="imp-sr" aria-live="polite">
              {annuncio}
            </p>
          </div>

          <DialLuce />
        </div>

        {/* "impronta" ripete il marchio (decorativa); il testo del cliente no. */}
        {cliente ? <p className="imp-sr">{RILIEVI.heroParolaCliente.alt(parola)}</p> : null}

        <span ref={misureRef} className="imp-hero__misure" aria-hidden="true">
          {righe.map((r, i) => (
            <span key={i} className="imp-hero__misura">
              {r}
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}
