/**
 * IMPRONTA · sezione 7, "La bottega · portaci la bozza" (section-builder-bottega).
 *
 * Giro 2: composta come un frontespizio (docs/awwwards-jury.md, Bottega).
 * 1. H2 e intro;
 * 2. l'indirizzo premuto a secco UNA volta, grande, largo quanto l'area viva
 *    (`.imp-pressa`, profilo `BOTTEGA` del motion-designer), e sotto il suo
 *    gemello leggibile in inchiostro (`<address>`) con i recapiti in corpo
 *    piccolo, come la riga dell'editore in fondo a un frontespizio:
 *    telefono, email, Google Maps (nuova scheda);
 * 3. una riga di testo con lo stato "aperto adesso / chiuso adesso",
 *    calcolato sull'ora vera di Pordenone (Europe/Rome);
 * 4. a sinistra gli orari, a destra "chi c'è" come frase, la storia e tre
 *    macchine, una riga ciascuna;
 * 5. piede: tempi, spedizione, il "no" detto con calma.
 *
 * Testi: tutto da `content/testi.ts` (BOTTEGA) e `core/links.ts`, tranne i
 * pochi di `TESTI_SEZIONE` qui sotto, che testi.ts non ha ancora
 * (docs/section-builder-bottega.md §4). I recapiti si leggono dalle chiavi,
 * mai dai valori: il copywriter può cambiarli.
 *
 * Nessun accesso a window/document a livello di modulo: l'ora di Roma si
 * legge solo dentro un effetto, quindi il prerender esce senza stato e la
 * riga dello stato compare al primo effetto nello spazio già riservato.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import './bottega.css';

import { freccia } from '../../assets/svg';
import { BOTTEGA as TESTI_BOTTEGA } from '../../content/testi';
import { EMAIL_URL, MAPS_URL } from '../../core/links';
import { ATTESA_PRESSA, BOTTEGA as MOTO_BOTTEGA } from '../../motion/choreography';
import { usePressione } from '../../motion/usePressione';
import { ReliefText } from '../../relief/ReliefText';

/* ------------------------------------------------------------------ */
/* Testi che testi.ts non ha (richiesta al copywriter nel doc §4)      */
/* ------------------------------------------------------------------ */

const TESTI_SEZIONE = {
  chiTitolo: 'Chi c\'è',
  recapitiAria: 'Telefono, email e mappa',
  oggi: 'oggi',
  aperto: 'Aperto adesso',
  chiuso: 'Chiuso adesso',
  /** Tre macchine dal brand-strategist §1.5, una riga ciascuna. */
  macchine: [
    { nome: 'La platina Heidelberg a stella', uso: 'stampa biglietti e partecipazioni, a secco e a un colore.' },
    { nome: 'La platina a caldo', uso: 'posa la lamina argento con la piastra riscaldata.' },
    { nome: 'La cucitrice a filo refe', uso: 'cuce le segnature di brossure e cartonati.' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Orario della bottega (gli stessi numeri di TESTI_BOTTEGA.orari)     */
/* ------------------------------------------------------------------ */

/** Una fascia di apertura in minuti dalla mezzanotte, ora di Roma. */
type Fascia = readonly [apre: number, chiude: number];

const MATTINA_FERIALE: Fascia = [9 * 60, 12 * 60 + 30];
const POMERIGGIO_FERIALE: Fascia = [15 * 60, 19 * 60];
const MATTINA_SABATO: Fascia = [9 * 60 + 30, 12 * 60 + 30];

/** Indice = giorno della settimana come Date#getDay (0 domenica … 6 sabato). */
const SETTIMANA: readonly (readonly Fascia[])[] = [
  [],
  [],
  [MATTINA_FERIALE, POMERIGGIO_FERIALE],
  [MATTINA_FERIALE, POMERIGGIO_FERIALE],
  [MATTINA_FERIALE, POMERIGGIO_FERIALE],
  [MATTINA_FERIALE, POMERIGGIO_FERIALE],
  [MATTINA_SABATO],
];

const NOMI_GIORNO = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'] as const;

/** Riga di TESTI_BOTTEGA.orari che vale per ogni giorno (null: domenica, non elencata). */
const RIGA_DEL_GIORNO: readonly (number | null)[] = [null, 0, 1, 1, 1, 1, 2];

const GIORNI_EN: Readonly<Record<string, number>> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

interface OraRoma {
  giorno: number;
  minuti: number;
}

let formatoRoma: Intl.DateTimeFormat | null = null;

/** Giorno e minuti ora a Pordenone, qualunque sia il fuso di chi guarda. */
function oraDiRoma(adesso: Date): OraRoma {
  formatoRoma ??= new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  let giorno = adesso.getDay();
  let ore = adesso.getHours();
  let minuti = adesso.getMinutes();
  for (const parte of formatoRoma.formatToParts(adesso)) {
    if (parte.type === 'weekday') giorno = GIORNI_EN[parte.value] ?? giorno;
    else if (parte.type === 'hour') ore = Number(parte.value) % 24;
    else if (parte.type === 'minute') minuti = Number(parte.value);
  }
  return { giorno, minuti: ore * 60 + minuti };
}

/** 540 → "9.00", 1110 → "18.30" (come negli orari scritti). */
function orario(minuti: number): string {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  return `${h}.${m < 10 ? '0' : ''}${m}`;
}

interface StatoBottega {
  aperta: boolean;
  /** Il seguito della frase: fino a quando, o quando riapre (minuscolo). */
  dettaglio: string;
  /** "A Pordenone sono le 17.42." */
  ora: string;
  /** Riga di TESTI_BOTTEGA.orari che vale oggi. */
  rigaOggi: number | null;
}

function calcolaStato({ giorno, minuti }: OraRoma): StatoBottega {
  const ora = `A Pordenone sono le ${orario(minuti)}.`;
  const rigaOggi = RIGA_DEL_GIORNO[giorno] ?? null;
  const oggi = SETTIMANA[giorno] ?? [];

  const inCorso = oggi.find(([apre, chiude]) => minuti >= apre && minuti < chiude);
  if (inCorso !== undefined) {
    const mancano = inCorso[1] - minuti;
    const dettaglio =
      mancano <= 30
        ? `chiude alle ${orario(inCorso[1])}, tra ${mancano} ${mancano === 1 ? 'minuto' : 'minuti'}.`
        : `fino alle ${orario(inCorso[1])}.`;
    return { aperta: true, dettaglio, ora, rigaOggi };
  }

  const piuTardi = oggi.find(([apre]) => apre > minuti);
  if (piuTardi !== undefined) {
    const giaAperta = oggi.some(([, chiude]) => chiude <= minuti);
    const verbo = giaAperta ? 'riapre' : 'apre';
    return { aperta: false, dettaglio: `${verbo} oggi alle ${orario(piuTardi[0])}.`, ora, rigaOggi };
  }

  for (let passo = 1; passo <= 7; passo += 1) {
    const g = (giorno + passo) % 7;
    const prima = SETTIMANA[g]?.[0];
    if (prima === undefined) continue;
    const quando = passo === 1 ? 'domani' : NOMI_GIORNO[g];
    return { aperta: false, dettaglio: `riapre ${quando} alle ${orario(prima[0])}.`, ora, rigaOggi };
  }

  return { aperta: false, dettaglio: '', ora, rigaOggi };
}

/** Stato della bottega, aggiornato ogni 20 s e al ritorno sulla scheda. */
function useStatoBottega(): StatoBottega | null {
  const [stato, setStato] = useState<StatoBottega | null>(null);

  useEffect(() => {
    let ultimo = '';
    const aggiorna = () => {
      const nuovo = calcolaStato(oraDiRoma(new Date()));
      const chiave = `${nuovo.aperta}|${nuovo.dettaglio}|${nuovo.ora}|${nuovo.rigaOggi}`;
      if (chiave === ultimo) return;
      ultimo = chiave;
      setStato(nuovo);
    };
    aggiorna();
    const timer = window.setInterval(aggiorna, 20_000);
    const alRitorno = () => {
      if (document.visibilityState === 'visible') aggiorna();
    };
    document.addEventListener('visibilitychange', alRitorno);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', alRitorno);
    };
  }, []);

  return stato;
}

/* ------------------------------------------------------------------ */
/* Persone: la frase del copywriter divisa in tre, nome per nome       */
/* ------------------------------------------------------------------ */

interface Persona {
  nome: string;
  cosaFa: string;
}

const PERSONE: readonly Persona[] = TESTI_BOTTEGA.chi
  .split(/(?<=\.)\s+/)
  .filter((frase) => frase.length > 0)
  .map((frase) => {
    const spazio = frase.indexOf(' ');
    return { nome: frase.slice(0, spazio), cosaFa: frase.slice(spazio + 1) };
  });

/** Testo del link a Maps senza la freccia di testo: la disegna freccia.svg. */
const MAPS_TESTO = TESTI_BOTTEGA.maps.testo.replace(/\s*↗\s*$/, '');

/* ------------------------------------------------------------------ */
/* Riga premuta dell'indirizzo                                          */
/* ------------------------------------------------------------------ */

function RigaPremuta({ testo, indice, osserva }: { testo: string; indice: number; osserva: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const [reliefId, setReliefId] = useState<string | null>(null);
  usePressione(ref, { profilo: MOTO_BOTTEGA.profilo, reliefId, indice, osserva });

  return (
    <ReliefText
      ref={ref}
      as="span"
      onRegistrato={setReliefId}
      {...ATTESA_PRESSA}
      tecnica="secco"
      profondita={1}
      className={`imp-bottega__premuto imp-bottega__premuto--${indice === 0 ? 'via' : 'citta'} imp-pressa imp-secco`}
    >
      {testo}
    </ReliefText>
  );
}

/* ------------------------------------------------------------------ */
/* Sezione                                                              */
/* ------------------------------------------------------------------ */

export default function Bottega() {
  const indirizzoRef = useRef<HTMLDivElement>(null);
  const stato = useStatoBottega();
  const t = TESTI_BOTTEGA;

  return (
    <section id="bottega" className="imp-bottega imp-block" aria-labelledby="imp-bottega-titolo">
      <div className="imp-page imp-griglia imp-bottega__gabbia">
        <header className="imp-bottega__testa">
          <h2 id="imp-bottega-titolo" className="imp-bottega__titolo" tabIndex={-1}>
            {t.titolo}
          </h2>
          <p className="imp-bottega__intro">{t.intro}</p>
        </header>

        {/* Il frontespizio: l'indirizzo premuto una volta, il gemello leggibile
            sotto con i recapiti, poi lo stato di adesso. Il rilievo è
            decorativo (RILIEVI.bottegaIndirizzo): ripete l'<address>. */}
        <div className="imp-bottega__frontespizio">
          <div ref={indirizzoRef} className="imp-bottega__rilievo" aria-hidden="true">
            <RigaPremuta testo={t.indirizzo.riga1} indice={0} osserva={indirizzoRef} />{' '}
            <RigaPremuta testo={t.indirizzo.riga2} indice={1} osserva={indirizzoRef} />
          </div>

          <div className="imp-bottega__editore">
            <address className="imp-bottega__stampato">
              {t.indirizzo.riga1}, {t.indirizzo.riga2}
            </address>
            <ul className="imp-bottega__recapiti imp-lista" aria-label={TESTI_SEZIONE.recapitiAria}>
              <li>
                <a className="imp-bottega__recapito imp-ix-link" href={t.telefono.href} aria-label={t.telefono.aria}>
                  {t.telefono.testo}
                </a>
              </li>
              <li>
                <a className="imp-bottega__recapito imp-ix-link" href={EMAIL_URL} aria-label={t.email.aria}>
                  {t.email.testo}
                </a>
              </li>
              <li>
                <a
                  className="imp-bottega__recapito imp-ix-link"
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.maps.aria}
                >
                  {MAPS_TESTO}
                  <span className="imp-bottega__freccia" aria-hidden="true" dangerouslySetInnerHTML={{ __html: freccia }} />
                </a>
              </li>
            </ul>
          </div>

          <p className="imp-bottega__stato" data-stato={stato === null ? 'attesa' : stato.aperta ? 'aperta' : 'chiusa'}>
            {stato !== null && (
              <>
                <strong className="imp-bottega__stato-parola">
                  {stato.aperta ? TESTI_SEZIONE.aperto : TESTI_SEZIONE.chiuso}
                </strong>
                , {stato.dettaglio} {stato.ora}
              </>
            )}
          </p>
        </div>

        {/* Orari, scritti come un tipografo. */}
        <div className="imp-bottega__orari">
          <h3 className="imp-bottega__h3">{t.orariTitolo}</h3>
          <dl className="imp-bottega__settimana">
            {t.orari.map((riga, i) => {
              const oggi = stato !== null && stato.rigaOggi === i;
              return (
                <div key={riga.giorni} className="imp-bottega__giorno" data-oggi={oggi ? 'si' : undefined}>
                  <dt>
                    {riga.giorni}
                    {oggi && <span className="imp-bottega__oggi">, {TESTI_SEZIONE.oggi}</span>}
                  </dt>
                  <dd>{riga.ore}</dd>
                </div>
              );
            })}
          </dl>
          <p className="imp-bottega__nota imp-piccolo">{t.senzaAppuntamento}</p>
          <p className="imp-bottega__nota imp-piccolo">{t.appuntamento}</p>
          <p className="imp-bottega__nota imp-piccolo">{t.parcheggio}</p>
        </div>

        {/* Chi c'è: una frase, con i nomi in evidenza; poi la storia e tre macchine. */}
        <div className="imp-bottega__chi">
          <h3 className="imp-bottega__h3">{TESTI_SEZIONE.chiTitolo}</h3>
          <p className="imp-bottega__persone">
            {PERSONE.map((p, i) => (
              <span key={p.nome} className="imp-bottega__persona">
                <strong className="imp-bottega__nome">{p.nome}</strong> {p.cosaFa}
                {i < PERSONE.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
          <p className="imp-bottega__storia">{t.storia}</p>
          <ul className="imp-bottega__macchine imp-lista">
            {TESTI_SEZIONE.macchine.map((m) => (
              <li key={m.nome} className="imp-bottega__macchina">
                <span className="imp-bottega__macchina-nome">{m.nome}</span> {m.uso}
              </li>
            ))}
          </ul>
        </div>

        {/* Tempi, spedizione, il no detto con calma. */}
        <div className="imp-bottega__piede imp-piccolo">
          <p>{t.tempi}</p>
          <p>{t.spedizione}</p>
          <p>{t.noGrandi}</p>
        </div>
      </div>
    </section>
  );
}
