/**
 * IMPRONTA · "Il banco di prova", il preventivo (section-builder-banco).
 *
 * Il cliente non compila un modulo: compone la sua prova e la vede premuta
 * nella carta. Il prezzo è quello di quella prova in quella tiratura, sempre
 * visibile PRIMA dell'invio, impresso in lamina sul margine e scritto in
 * inchiostro accanto. Si invia tenendo premuta la leva; dopo, la prova resta
 * dov'è, premuta, e una frase in inchiostro promette la prova vera a casa.
 *
 * Struttura (ux-architect 5.6):
 *   h2 + riga → [bozza ritrovata] → compositoio (scelte e campi) → promessa,
 *   totale, leva, messaggi → lastra (figure, sticky; su mobile in alto al 42%)
 *
 * Stati (14, tutti qui o nei figli): vuoto, campo svuotato, scrittura, testo
 * lungo, segno non disponibile, bozza ritrovata, contatto non valido, leva
 * senza contatto, rilascio anticipato, primo tocco breve, invio in corso,
 * successo, invio fallito, senza WebGL.
 *
 * - Store: `prova` (bozza salvata dallo store), `carta`, `invio`,
 *   `simulaErroreInvio` (`?invio=ko`). Il contatto NON entra nello store.
 * - Invio simulato (./invio.ts), ~1,2 s, nessuna rete. Al successo:
 *   `track('demo_prenotazione', …)` senza testo né contatto,
 *   `confermaTestoCliente` (l'hero mostra i nomi del cliente).
 * - Con la tastiera aperta su mobile la lastra diventa una striscia al 28%
 *   dello schermo visibile (visualViewport) con la riga che si scrive.
 *
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FocusEvent } from 'react';
import { track } from '@/lib/analytics';
import { BANCO as MOTION_BANCO } from '../../motion/choreography';
import { ANNUNCI, BANCO, COMUNI, HERO, PRODOTTI, euro } from '../../content/testi';
import type { HoldVia } from '../../interaction/useHoldToConfirm';
import {
  confermaTestoCliente,
  impostaInvio,
  svuotaBozza,
  useImpronta,
  type Carta,
} from '../../state/store';
import { calcolaPrezzo, righeDellaProva } from './calcolaPrezzo';
import Compositoio, { type ErroreContatto } from './Compositoio';
import { ErroreInvio, giornoRisposta, inviaRichiesta, tastieraPer, tipoContatto } from './invio';
import Leva, { type ComandiLeva } from './Leva';
import Prova, { type ComandiProva } from './Prova';
import './banco.css';

/** Sotto questa larghezza la lastra sta in alto e la tastiera la comprime. */
const MEDIA_STRETTO = '(max-width: 1023.98px)';
/** Annuncio del prezzo: una volta ferme le scelte (ux-architect 6.7). */
const ATTESA_ANNUNCIO_PREZZO = 800;
/** Spazio indivisibile: rende "nuovo" per aria-live un annuncio ripetuto. */
const NBSP = ' ';

type Esito = { tipo: 'ok'; carta: Carta; giorno: string } | { tipo: 'ko' } | null;

/* ------------------------------------------------------------------ media query senza stato di modulo */

function iscriviStretto(avvisa: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => undefined;
  const mq = window.matchMedia(MEDIA_STRETTO);
  mq.addEventListener('change', avvisa);
  return () => mq.removeEventListener('change', avvisa);
}

function leggiStretto(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(MEDIA_STRETTO).matches;
}

function leggiStrettoServer(): boolean {
  return false;
}

/* ------------------------------------------------------------------ sezione */

export default function Banco() {
  const carta = useImpronta((s) => s.carta);
  const prova = useImpronta((s) => s.prova);
  const bozzaRitrovata = useImpronta((s) => s.bozzaRitrovata);
  const invio = useImpronta((s) => s.invio);
  const simulaErrore = useImpronta((s) => s.simulaErroreInvio);

  const sezioneRef = useRef<HTMLElement>(null);
  const provaRef = useRef<ComandiProva>(null);
  const levaRef = useRef<ComandiLeva>(null);
  const contattoRef = useRef<HTMLInputElement>(null);
  const esitoRef = useRef<HTMLDivElement>(null);
  const annullaInvio = useRef<AbortController | null>(null);

  const [contatto, setContatto] = useState('');
  const contattoValore = useRef('');
  const [erroreContatto, setErroreContatto] = useState<ErroreContatto>(null);
  const [esito, setEsito] = useState<Esito>(null);
  const [annuncio, setAnnuncio] = useState('');
  const [campoAttivo, setCampoAttivo] = useState<string | null>(null);

  const stretto = useSyncExternalStore(iscriviStretto, leggiStretto, leggiStrettoServer);
  const tastiera = stretto && campoAttivo !== null;

  /* ---------- prezzo, righe, parole */

  const prezzo = useMemo(
    () =>
      calcolaPrezzo({
        prodotto: prova.prodotto,
        carta,
        tecnica: prova.tecnica,
        tiratura: prova.tiratura,
        taglioColorato: prova.taglioColorato,
        legatura: prova.legatura,
      }),
    [prova.prodotto, carta, prova.tecnica, prova.tiratura, prova.taglioColorato, prova.legatura],
  );

  const righe = useMemo(() => righeDellaProva(prova.prodotto, prova.campi), [prova.prodotto, prova.campi]);

  const riepilogo = BANCO.prezzo.riepilogo({
    prodotto: prova.prodotto,
    carta,
    grammatura: prezzo.grammatura,
    tecnica: prova.tecnica,
    tiratura: prova.tiratura,
    legatura: prova.legatura,
    voci: prezzo.parole,
    totale: prezzo.totale,
    giorniDa: prezzo.giorniDa,
    giorniA: prezzo.giorniA,
  });

  const alt = BANCO.prova.alt({
    prodotto: prova.prodotto,
    carta,
    tecnica: prova.tecnica,
    righe: righe.map((r) => r.testo),
    taglio: prezzo.taglioApplicato,
  });

  /* ---------- annunci (una regione aria-live della sezione) */

  const annuncia = useCallback((testo: string) => {
    setAnnuncio((prima) => {
      const base = prima.endsWith(NBSP) ? prima.slice(0, -1) : prima;
      if (base === testo) return prima.endsWith(NBSP) ? testo : `${testo}${NBSP}`;
      return testo;
    });
  }, []);

  const cambiato = useRef<string | null>(null);
  const onCambiato = useCallback((nome: string) => {
    cambiato.current = nome;
  }, []);

  // Prezzo: annunciato 800 ms dopo l'ultima scelta, con il nome della scelta.
  const totaleAnnunciato = useRef(prezzo.totale);
  useEffect(() => {
    if (totaleAnnunciato.current === prezzo.totale) return undefined;
    const timer = window.setTimeout(() => {
      totaleAnnunciato.current = prezzo.totale;
      annuncia(ANNUNCI.prezzo(prezzo.totale, cambiato.current ?? undefined));
      cambiato.current = null;
    }, ATTESA_ANNUNCIO_PREZZO);
    return () => window.clearTimeout(timer);
  }, [prezzo.totale, annuncia]);

  // Prodotto cambiato da fuori ("Prova la tua" di un pezzo o del filo): il banco lo dice.
  const prodottoVisto = useRef(prova.prodotto);
  useEffect(() => {
    if (prodottoVisto.current === prova.prodotto) return;
    prodottoVisto.current = prova.prodotto;
    if (cambiato.current !== PRODOTTI[prova.prodotto].nome) {
      annuncia(ANNUNCI.bancoImpostato(prova.prodotto, carta));
    }
  }, [prova.prodotto, carta, annuncia]);

  // Bozza ritrovata: annunciata una volta, quando il banco entra in vista.
  const bozzaAnnunciata = useRef(false);
  useEffect(() => {
    const el = sezioneRef.current;
    if (!bozzaRitrovata || bozzaAnnunciata.current || el === null) return undefined;
    const io = new IntersectionObserver(
      (voci) => {
        if (voci.some((v) => v.isIntersecting) && !bozzaAnnunciata.current) {
          bozzaAnnunciata.current = true;
          annuncia(ANNUNCI.bozzaRitrovata);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -40% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [bozzaRitrovata, annuncia]);

  /* ---------- contatto (stato locale, mai salvato) */

  const onContatto = useCallback(
    (valore: string) => {
      contattoValore.current = valore;
      setContatto(valore);
      // Validazione all'uscita e all'invio, mai a ogni lettera; ma un errore
      // corretto sparisce subito, senza aspettare.
      if (erroreContatto !== null && tipoContatto(valore) !== null) setErroreContatto(null);
    },
    [erroreContatto],
  );

  const onEsciContatto = useCallback(() => {
    const v = contattoValore.current.trim();
    if (v.length === 0) {
      if (erroreContatto === 'nonValido') setErroreContatto(null);
      return;
    }
    setErroreContatto(tipoContatto(v) === null ? 'nonValido' : null);
  }, [erroreContatto]);

  /* ---------- la leva e l'invio */

  const puoPartire = useCallback((): boolean => {
    const v = contattoValore.current.trim();
    if (tipoContatto(v) !== null) return true;
    setErroreContatto(v.length === 0 ? 'vuoto' : 'nonValido');
    return false;
  }, []);

  const onBloccato = useCallback(() => {
    const campo = contattoRef.current;
    if (campo === null) return;
    campo.focus({ preventScroll: true });
    const blocco = campo.closest<HTMLElement>('.imp-banco__campo') ?? campo;
    blocco.scrollIntoView({ block: leggiStretto() ? 'start' : 'center', behavior: 'auto' });
  }, []);

  const onInizio = useCallback(() => {
    setEsito((e) => (e?.tipo === 'ko' ? null : e));
    impostaInvio('holding');
  }, []);

  const onAnnulla = useCallback(() => {
    impostaInvio('idle');
  }, []);

  const onProgress = useCallback((p: number) => {
    provaRef.current?.leva(p);
  }, []);

  const testoPerHero = (): string | undefined => {
    const scritte = righe.filter((r) => !r.esempio);
    if (scritte.length === 0) return undefined;
    if (prova.prodotto === 'partecipazione') {
      const primo = scritte.find((r) => r.chiave === 'primo');
      const secondo = scritte.find((r) => r.chiave === 'secondo');
      if (primo) return HERO.parolaCliente(primo.testo, secondo?.testo);
      if (secondo) return HERO.parolaCliente(secondo.testo);
    }
    return scritte[0]?.testo;
  };

  const onCompleta = (via: HoldVia): void => {
    provaRef.current?.contatto();
    impostaInvio('sending');
    annuncia(ANNUNCI.inCorso);
    const cartaInvio = carta;
    const valore = contattoValore.current.trim();
    const tipo = tipoContatto(valore) ?? 'email';
    const perHero = testoPerHero();
    const controllo = new AbortController();
    annullaInvio.current?.abort();
    annullaInvio.current = controllo;

    inviaRichiesta(
      {
        prodotto: prova.prodotto,
        carta: cartaInvio,
        tecnica: prova.tecnica,
        taglioColorato: prezzo.taglioApplicato,
        tiratura: prova.tiratura,
        legatura: prova.prodotto === 'libro' ? prova.legatura : null,
        quando: prova.quando,
        righe: righe.map((r) => r.testo),
        totale: prezzo.totale,
        contatto: valore,
        tipoContatto: tipo,
      },
      { fallisci: simulaErrore, segnale: controllo.signal },
    ).then(
      () => {
        if (controllo.signal.aborted) return;
        const giorno = giornoRisposta(new Date().getDay());
        impostaInvio('sent');
        setEsito({ tipo: 'ok', carta: cartaInvio, giorno });
        if (perHero !== undefined) confermaTestoCliente(perHero);
        track('demo_prenotazione', {
          concept: 10,
          prodotto: prova.prodotto,
          tecnica: prova.tecnica,
          tiratura: prova.tiratura,
          carta: cartaInvio,
          via,
        });
        annuncia(ANNUNCI.successo(cartaInvio, giorno));
      },
      (errore: unknown) => {
        if (errore instanceof ErroreInvio && errore.motivo === 'annullato') return;
        impostaInvio('error');
        levaRef.current?.reset();
        setEsito({ tipo: 'ko' });
        annuncia(ANNUNCI.fallito);
      },
    );
  };

  // Il fuoco va alla frase di esito (successo o errore).
  useEffect(() => {
    const el = esitoRef.current;
    if (esito === null || el === null) return;
    el.focus({ preventScroll: true });
    // Su mobile la lastra ferma copre il primo 42% dello schermo: la frase va
    // subito sotto (scroll-margin nel CSS); su desktop al centro, accanto alla prova.
    // Dopo un errore si riparte dalla leva: si porta in vista lei, il messaggio le sta sotto.
    const bersaglio =
      esito.tipo === 'ko' ? (sezioneRef.current?.querySelector<HTMLElement>('.imp-banco__leva-blocco') ?? el) : el;
    bersaglio.scrollIntoView({ block: leggiStretto() ? 'start' : 'center', behavior: 'auto' });
  }, [esito]);

  // Il banco si smonta a metà invio: niente aggiornamenti dopo.
  useEffect(
    () => () => {
      annullaInvio.current?.abort();
      annullaInvio.current = null;
    },
    [],
  );

  /* ---------- reset leggero: "Prova un'altra cosa" e "Ricomincia" */

  const ricomincia = useCallback(() => {
    annullaInvio.current?.abort();
    annullaInvio.current = null;
    svuotaBozza();
    setEsito(null);
    setErroreContatto(null);
    levaRef.current?.reset();
    annuncia(ANNUNCI.bozzaSvuotata);
  }, [annuncia]);

  const provaAltraCosa = useCallback(() => {
    ricomincia();
    // Il fuoco torna alla prima scelta, dove si ricomincia a comporre.
    window.setTimeout(() => {
      sezioneRef.current?.querySelector<HTMLInputElement>('.imp-banco__gruppo--prodotto input:checked')?.focus();
    }, 0);
  }, [ricomincia]);

  /* ---------- tastiera aperta (mobile): la striscia al 28% */

  const onFocusCompositoio = useCallback((e: FocusEvent<HTMLDivElement>) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement) || !el.classList.contains('imp-banco__input')) return;
    const chiave = el.closest<HTMLElement>('[data-chiave]')?.dataset.chiave ?? 'contatto';
    setCampoAttivo(chiave);
  }, []);

  const onBlurCompositoio = useCallback(() => {
    window.setTimeout(() => {
      const attivo = document.activeElement;
      const dentro =
        attivo instanceof HTMLInputElement &&
        attivo.classList.contains('imp-banco__input') &&
        sezioneRef.current?.contains(attivo) === true;
      if (!dentro) setCampoAttivo(null);
    }, 0);
  }, []);

  useEffect(() => {
    const sezione = sezioneRef.current;
    if (!tastiera || sezione === null) return undefined;
    const vv = window.visualViewport;
    const misura = (): void => {
      const alto = vv ? vv.height : window.innerHeight;
      const cima = vv ? vv.offsetTop : 0;
      sezione.style.setProperty('--imp-banco-striscia', `${Math.round(alto * MOTION_BANCO.lastraTastiera.altezzaTastiera)}px`);
      sezione.style.setProperty('--imp-banco-vv-cima', `${Math.round(cima)}px`);
    };
    const mettiInVista = (): void => {
      const attivo = document.activeElement;
      if (attivo instanceof HTMLElement && sezione.contains(attivo)) attivo.scrollIntoView({ block: 'nearest' });
    };
    misura();
    const timer = window.setTimeout(mettiInVista, 80);
    const suRidimensiona = (): void => {
      misura();
      mettiInVista();
    };
    vv?.addEventListener('resize', suRidimensiona);
    vv?.addEventListener('scroll', misura);
    return () => {
      window.clearTimeout(timer);
      vv?.removeEventListener('resize', suRidimensiona);
      vv?.removeEventListener('scroll', misura);
    };
  }, [tastiera]);

  /* ---------- markup */

  const fermo = invio === 'sending' || invio === 'sent';
  const inviata = esito?.tipo === 'ok' && invio === 'sent';

  return (
    <section
      ref={sezioneRef}
      id="banco"
      className="imp-banco imp-block"
      aria-labelledby="imp-banco-titolo"
      data-invio={invio}
      data-tastiera={tastiera ? '' : undefined}
    >
      <div className="imp-page">
        <header className="imp-banco__testa">
          <h2 id="imp-banco-titolo" className="imp-banco__titolo" tabIndex={-1}>
            {BANCO.titolo}
          </h2>
          <p className="imp-banco__intro">{BANCO.intro}</p>
        </header>

        <div className="imp-banco__banco">
          <div className="imp-banco__colonna" onFocus={onFocusCompositoio} onBlur={onBlurCompositoio}>
            {bozzaRitrovata && !inviata ? (
              <div className="imp-banco__bozza">
                <p>{BANCO.bozza.frase}</p>
                <button
                  type="button"
                  className="imp-banco__bozza-bottone imp-ix-link imp-ix-tocco"
                  aria-label={BANCO.bozza.ricominciaAria}
                  onClick={ricomincia}
                >
                  {BANCO.bozza.ricomincia}
                </button>
              </div>
            ) : null}

            <Compositoio
              prova={prova}
              carta={carta}
              fermo={fermo}
              riepilogo={riepilogo}
              contatto={contatto}
              contattoRef={contattoRef}
              tastieraContatto={tastieraPer(contatto)}
              erroreContatto={erroreContatto}
              onContatto={onContatto}
              onEsciContatto={onEsciContatto}
              onAnnuncia={annuncia}
              onCambiato={onCambiato}
            />

            <div className="imp-banco__stampa">
              <p className="imp-banco__promessa" id="imp-banco-promessa" hidden={inviata}>
                {BANCO.leva.promessa}
              </p>
              <p className="imp-banco__totale" id="imp-banco-totale">
                <span className="imp-banco__totale-nome">{BANCO.prezzo.totale}</span>
                <span className="imp-banco__totale-cifra">{euro(prezzo.totale)}</span>
                <span className="imp-banco__totale-iva">{COMUNI.ivaInclusa}</span>
              </p>

              <div hidden={inviata}>
                <Leva
                  ref={levaRef}
                  descrittaDa="imp-banco-promessa imp-banco-totale"
                  inCorso={fermo}
                  messaggio={invio === 'sending' ? '' : null}
                  puoPartire={puoPartire}
                  onBloccato={onBloccato}
                  onInizio={onInizio}
                  onAnnulla={onAnnulla}
                  onProgress={onProgress}
                  onCompleta={onCompleta}
                />
              </div>

              {esito?.tipo === 'ko' ? (
                <div ref={esitoRef} className="imp-banco__esito imp-banco__esito--ko" tabIndex={-1}>
                  <p>
                    {BANCO.fallito.frase}{' '}
                    <a className="imp-ix-link" href={BANCO.fallito.telefonoHref}>
                      {BANCO.fallito.telefono}
                    </a>
                    {BANCO.fallito.chiusura}
                  </p>
                  <p className="imp-banco__rassicura">{BANCO.fallito.rassicura}</p>
                </div>
              ) : null}

              {inviata && esito?.tipo === 'ok' ? (
                <div ref={esitoRef} className="imp-banco__esito imp-banco__esito--ok" tabIndex={-1}>
                  <p className="imp-banco__esito-frase">{BANCO.successo.frase(esito.carta, esito.giorno)}</p>
                  <p className="imp-banco__firma">{BANCO.successo.firma}</p>
                  <button
                    type="button"
                    className="imp-banco__altra imp-ix-premibile"
                    aria-label={BANCO.successo.altraAria}
                    onClick={provaAltraCosa}
                  >
                    {BANCO.successo.altra}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <Prova
            ref={provaRef}
            prodotto={prova.prodotto}
            carta={carta}
            tecnica={prova.tecnica}
            taglio={prezzo.taglioApplicato}
            legatura={prova.legatura}
            campi={prova.campi}
            totale={prezzo.totale}
            riepilogo={riepilogo}
            alt={alt}
            tastiera={tastiera}
            rigaAttiva={campoAttivo}
            bloccata={fermo}
            registraGL={!stretto}
          />
        </div>
      </div>

      <p className="imp-sr" aria-live="polite">
        {annuncio}
      </p>
    </section>
  );
}
