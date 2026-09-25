/**
 * IMPRONTA · sezione 7, "La bottega · portaci la bozza" (section-builder-bottega).
 *
 * Composta come il frontespizio di un libro, tutta ancorata al margine
 * interno (ux-architect §5.7):
 * 1. H2 e intro;
 * 2. l'indirizzo, premuto a secco su due righe larghe quanto l'area viva
 *    (`.imp-pressa`, profilo `BOTTEGA` del motion-designer), con il suo
 *    gemello leggibile in inchiostro nell'`<address>` sopra;
 * 3. gli orari, con lo stato "aperto adesso / chiuso adesso" calcolato
 *    sull'ora vera di Pordenone (Europe/Rome), e i recapiti: telefono,
 *    email, Google Maps (nuova scheda). Su mobile telefono e Maps sono due
 *    bottoni pieni da 52 px, uno sotto l'altro;
 * 4. chi c'è: Marta, Franco, Elia, per nome e con cosa fanno;
 * 5. le macchine, con la frase sulla storia;
 * 6. tempi, spedizione e il "no" detto con calma.
 *
 * Testi: tutto da `content/testi.ts` (BOTTEGA, RECAPITI, RILIEVI), tranne i
 * pochi elencati in `TESTI_SEZIONE` qui sotto, che testi.ts non ha ancora
 * (vedi docs/section-builder-bottega.md §4).
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
  macchineTitolo: 'Le macchine',
  recapitiAria: 'Telefono, email e mappa',
  oggi: 'oggi',
  statoAria: 'La bottega adesso',
  aperto: 'aperto adesso',
  chiuso: 'chiuso adesso',
  /** Macchine e usi dal brand-strategist §1.5 (nomi veri, prova di credibilità). */
  macchine: [
    { nome: 'Platina Heidelberg a stella', uso: 'Biglietti, partecipazioni, cartoline. A secco e a un colore, formato utile 26×38 cm.' },
    { nome: 'Platina per lamina a caldo', uso: 'Lamina argento con la piastra riscaldata, e il secco profondo.' },
    { nome: 'Torchio tirabozze a cilindro', uso: 'Prove, manifesti piccoli, tirature d\'artista numerate.' },
    { nome: 'Cassettiere di caratteri', uso: 'Piombo e legno, per comporre a mano testi brevi e titoli.' },
    { nome: 'Taglierina a ghigliottina', uso: 'Rifila biglietti, blocchi e libri dopo la cucitura.' },
    { nome: 'Cordonatrice manuale', uso: 'Pieghe pulite anche sui cartoncini da 600 g.' },
    { nome: 'Cucitrice a filo refe', uso: 'Cuce le segnature di brossure e cartonati.' },
    { nome: 'Pressa da legatoria a vite', uso: 'Tiene in forma i libri mentre la colla asciuga.' },
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
  /** La frase sotto la parola: fino a quando, o quando riapre. */
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
        ? `Chiude alle ${orario(inCorso[1])}, tra ${mancano} ${mancano === 1 ? 'minuto' : 'minuti'}.`
        : `Fino alle ${orario(inCorso[1])}.`;
    return { aperta: true, dettaglio, ora, rigaOggi };
  }

  const piuTardi = oggi.find(([apre]) => apre > minuti);
  if (piuTardi !== undefined) {
    const giaAperta = oggi.some(([, chiude]) => chiude <= minuti);
    const verbo = giaAperta ? 'Riapre' : 'Apre';
    return { aperta: false, dettaglio: `${verbo} oggi alle ${orario(piuTardi[0])}.`, ora, rigaOggi };
  }

  for (let passo = 1; passo <= 7; passo += 1) {
    const g = (giorno + passo) % 7;
    const prima = SETTIMANA[g]?.[0];
    if (prima === undefined) continue;
    const quando = passo === 1 ? 'domani' : NOMI_GIORNO[g];
    return { aperta: false, dettaglio: `Riapre ${quando} alle ${orario(prima[0])}.`, ora, rigaOggi };
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

        {/* L'indirizzo: stampato (si legge) e premuto (si tocca). Il rilievo è
            decorativo (RILIEVI.bottegaIndirizzo): ripete l'<address>. */}
        <div className="imp-bottega__indirizzo">
          <address className="imp-bottega__stampato">
            {t.indirizzo.riga1}, {t.indirizzo.riga2}
          </address>
          <div
            ref={indirizzoRef}
            className="imp-bottega__rilievo"
            aria-hidden="true"
          >
            <RigaPremuta testo={t.indirizzo.riga1} indice={0} osserva={indirizzoRef} />
            <RigaPremuta testo={t.indirizzo.riga2} indice={1} osserva={indirizzoRef} />
          </div>
        </div>

        {/* Orari e stato di adesso. */}
        <div className="imp-bottega__orari">
          <h3 className="imp-bottega__h3">{t.orariTitolo}</h3>

          <p className="imp-bottega__stato" data-stato={stato === null ? 'attesa' : stato.aperta ? 'aperta' : 'chiusa'}>
            {stato !== null && (
              <>
                <span className="imp-sr">{TESTI_SEZIONE.statoAria}: </span>
                <span className="imp-bottega__stato-parola">
                  {stato.aperta ? TESTI_SEZIONE.aperto : TESTI_SEZIONE.chiuso}
                </span>
                <span className="imp-sr">. </span>
                <span className="imp-bottega__stato-dettaglio">
                  {stato.dettaglio} {stato.ora}
                </span>
              </>
            )}
          </p>

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

          <p className="imp-bottega__nota">{t.senzaAppuntamento}</p>
          <p className="imp-bottega__nota">{t.appuntamento}</p>
        </div>

        {/* Recapiti: le due conversioni del telefono, più l'email. */}
        <nav className="imp-bottega__recapiti" aria-label={TESTI_SEZIONE.recapitiAria}>
          <a className="imp-bottega__telefono imp-ix-premibile" href={t.telefono.href} aria-label={t.telefono.aria}>
            <span className="imp-bottega__telefono-largo" aria-hidden="true">{t.telefono.testo}</span>
            <span className="imp-bottega__telefono-bottone" aria-hidden="true">{t.telefono.bottone}</span>
          </a>
          <a className="imp-bottega__email imp-ix-link" href={EMAIL_URL} aria-label={t.email.aria}>
            {t.email.testo}
          </a>
          <a
            className="imp-bottega__maps imp-ix-premibile"
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.maps.aria}
          >
            <span className="imp-bottega__maps-testo">{MAPS_TESTO}</span>
            <span className="imp-bottega__freccia" aria-hidden="true" dangerouslySetInnerHTML={{ __html: freccia }} />
          </a>
          <p className="imp-bottega__nota imp-bottega__parcheggio">{t.parcheggio}</p>
        </nav>

        {/* Chi c'è: nome grande, cosa fa accanto. */}
        <div className="imp-bottega__chi">
          <h3 className="imp-bottega__h3">{TESTI_SEZIONE.chiTitolo}</h3>
          <ul className="imp-bottega__persone imp-lista">
            {PERSONE.map((p) => (
              <li key={p.nome} className="imp-bottega__persona">
                <span className="imp-bottega__nome">{p.nome}</span>{' '}
                <span className="imp-bottega__mestiere">{p.cosaFa}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Le macchine, con la storia in una frase. */}
        <div className="imp-bottega__macchine">
          <div className="imp-bottega__macchine-testa">
            <h3 className="imp-bottega__h3">{TESTI_SEZIONE.macchineTitolo}</h3>
            <p className="imp-bottega__storia">{t.storia}</p>
          </div>
          <dl className="imp-bottega__parco">
            {TESTI_SEZIONE.macchine.map((m) => (
              <div key={m.nome} className="imp-bottega__macchina">
                <dt>{m.nome}</dt>
                <dd>{m.uso}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tempi, spedizione, il no detto con calma. */}
        <div className="imp-bottega__piede">
          <p>{t.tempi}</p>
          <p>{t.spedizione}</p>
          <p>{t.noGrandi}</p>
        </div>
      </div>
    </section>
  );
}
