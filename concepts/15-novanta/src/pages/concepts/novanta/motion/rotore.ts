/**
 * NOVANTA · rotore: il controller generico di rotazione (motion-designer).
 *
 * Lo usano il braccio del goniometro (agganci ogni 30°, 0..180) e l'anello
 * della settimana (agganci = ore libere, periodico ogni 360°). È l'**unico**
 * che scrive `runtime.braccio` e `runtime.anello` (tech-architect §6.2): gli
 * handler di input chiamano i suoi comandi, la fn del ticker chiama `tick(dt)`
 * nella fase `update`, la fase `write` legge `stato.deg` e lo porta nel DOM.
 *
 * Viaggi possibili (`rotore.viaggio`):
 * - `nessuno`  fermo, oppure trascinamento 1:1 (il braccio è il dito);
 * - `presa`    tocco lontano dal braccio: la molla "presa" lo porta al dito in
 *              ~180 ms, poi 1:1;
 * - `lancio`   rilascio: inerzia corta (al massimo `inerziaMax`) e frenata
 *              sull'aggancio, ereditando la velocità del dito;
 * - `salto`    comando (tasti, parole, Prenota, hash, Indietro, anello su
 *              un'ora scelta): frenata fino al punto esatto;
 * - `rotella`  i delta spostano un obiettivo che il braccio insegue con la
 *              molla "rotella"; dopo `QUIETE_ROTELLA` ms di silenzio si passa
 *              al lancio verso l'aggancio;
 * - `invito`   andata e ritorno di pochi gradi, una volta, senza `onFermo`.
 *
 * Nessun rimbalzo: la frenata è monotona (easing.ts), la molla non sorpassa
 * (molla.ts). Con `ridotto()` ogni viaggio è un salto secco allo stato finale;
 * il trascinamento resta 1:1 perché è un controllo, non un'animazione.
 *
 * Nessun accesso a window/document a livello di modulo. Il tempo arriva da
 * `ora()` (default `performance.now()`, letto solo dentro i comandi).
 */

import { A_FRENATA, A_MASSIMA, A_MINIMA, clamp, curvaInvito, hermite, hermiteVelocita } from './easing';
import { MOLLE, MollaCritica } from './molla';
import {
  DUR_CORSA_MIN,
  INVITO,
  ISTERESI_CONTENUTO,
  PASSO_ANGOLI,
  QUIETE_ROTELLA,
  SOGLIA_PRESA,
  TAU_LANCIO,
  VEL_MIN_LANCIO,
  durataCorsa,
} from './choreography';

/**
 * Forma dello stato scritto dal rotore. Coincide per struttura con
 * `Rotazione` di `state/runtime.ts` (tech-architect §6.2): si passa
 * direttamente `runtime.braccio` o `runtime.anello`.
 */
export interface StatoRotazione {
  deg: number;
  target: number;
  vel: number;
  stato: 'fermo' | 'trascina' | 'aggancio' | 'inerzia';
}

export type Viaggio = 'nessuno' | 'presa' | 'lancio' | 'salto' | 'rotella' | 'invito';

export interface OpzioniRotore {
  /** runtime.braccio o runtime.anello. */
  stato: StatoRotazione;
  /** Braccio 0..180; anello senza limiti. */
  min?: number;
  max?: number;
  /** Braccio: ANGOLI. Anello: angoli delle ore libere (cambiano: letti ogni volta). */
  agganci: () => readonly number[];
  /** Gradi entro cui un rilascio viene attirato dall'aggancio (braccio 15, anello Infinity). */
  magnete: number;
  /** Gradi massimi oltre il rilascio (un angolo = 30). */
  inerziaMax: number;
  /** Durata (ms) di un aggancio su un passo (braccio 350, anello 280). */
  durataAggancio: number;
  /** Reduced motion: salto secco, niente molla né inerzia. */
  ridotto: () => boolean;
  /** Arrivato e fermo (aggancio o punto esatto): aria-valuenow, hash, analytics. */
  onFermo?: (g: number) => void;

  /* ---- aggiunte facoltative, compatibili con il contratto §7.2 ---- */

  /** Periodo degli agganci e dell'angolo (anello: 360). Assente = nessuna periodicità. */
  periodo?: number;
  /** Chiamata dopo ogni comando: di solito `ticker.wake`. */
  sveglia?: () => void;
  /** Orologio in ms. Default `performance.now()`. */
  ora?: () => number;
}

export interface OpzioniVaA {
  /** Nessuna corsa: il valore arriva nello stesso frame. */
  subito?: boolean;
  /** Non chiama `onFermo` (montaggio, hash letto all'arrivo). */
  silenzioso?: boolean;
  /** Il punto viene attirato dall'aggancio più vicino (tocco sul disco). */
  aggancia?: boolean;
}

export interface Rotore {
  /** Durante il drag: segue il dito 1:1 (niente ritardo). */
  trascina(g: number): void;
  /** Rilascio: inerzia corta + aggancio. */
  rilascia(velGradiAlSecondo: number): void;
  /** Tasti, parole, hash, anello su ora scelta: frenata fino a `g`. */
  vaA(g: number, opz?: OpzioniVaA): void;
  /** Rotella/trackpad: accumula sull'obiettivo. */
  spingi(deltaGradi: number): void;
  /** Lo chiama la fn del ticker; true se ancora in moto. */
  tick(dt: number): boolean;

  /* ---- aggiunte ---- */

  /** Aggancio successivo (1) o precedente (-1) strettamente oltre la posizione; ritorna la meta o null. */
  passoAggancio(verso: 1 | -1): number | null;
  /** Aggancia subito all'aggancio più vicino all'obiettivo (fine gesto della rotella). */
  aggancia(): void;
  /** Esc durante il trascinamento: torna al punto di partenza. */
  annullaTrascina(): void;
  /** Invito: andata e ritorno di `ampiezza` gradi. False se non è il momento. */
  accenna(ampiezza?: number): boolean;
  /** Ferma tutto dov'è, senza `onFermo` (smontaggio, cambio di vista). */
  interrompi(): void;
  /** Tipo di viaggio in corso. */
  readonly viaggio: Viaggio;
  /** Dove il rotore sta andando (uguale a deg da fermo). */
  readonly meta: number;
}

/** Distanza sotto cui due angoli coincidono. */
const EPS = 0.01;
/** Distanza sotto cui la presa si considera arrivata al dito. */
const PRESA_ARRIVATA = 0.25;
/** Tolleranza per "strettamente oltre" nel passo tra agganci. */
const OLTRE = 0.5;
/** Smorzamento della stima di velocità del dito (media esponenziale). */
const PESO_VEL_DITO = 0.4;

export function creaRotore(o: OpzioniRotore): Rotore {
  const s = o.stato;
  const min = o.min ?? Number.NEGATIVE_INFINITY;
  const max = o.max ?? Number.POSITIVE_INFINITY;
  const periodo = o.periodo !== undefined && o.periodo > 0 ? o.periodo : 0;
  const ora = o.ora ?? ((): number => performance.now());
  const sveglia = o.sveglia ?? ((): void => undefined);

  let viaggio: Viaggio = 'nessuno';

  // Corsa (lancio, salto): hermite da `da` a `a` in `durata` secondi.
  let corsaDa = s.deg;
  let corsaA = s.deg;
  let corsaPendenza = A_FRENATA;
  let corsaDurata = 0;
  let corsaT = 0;
  let corsaNotifica = true;

  // Invito.
  let invitoBase = s.deg;
  let invitoAmpiezza = 0;
  let invitoT = 0;

  // Trascinamento.
  let origine = s.deg;
  let dito = s.deg;
  let ultimoDitoMs = 0;
  let velDito = 0;

  // Rotella.
  let ultimaSpinta = Number.NEGATIVE_INFINITY;
  let accumuloRidotto = s.deg;

  const molla = new MollaCritica(s.deg, MOLLE.rotella);

  const limita = (g: number): number => clamp(g, min, max);

  /** Rappresentante di `g` (modulo periodo) più vicino a `rif`. */
  const vicino = (g: number, rif: number): number =>
    periodo ? g + Math.round((rif - g) / periodo) * periodo : g;

  /** Aggancio più vicino a `p`, dentro i limiti. */
  const agganciopiuVicino = (p: number): { g: number; d: number } | null => {
    let migliore: { g: number; d: number } | null = null;
    for (const a of o.agganci()) {
      const g = vicino(a, p);
      if (g < min - EPS || g > max + EPS) continue;
      const d = Math.abs(g - p);
      if (!migliore || d < migliore.d) migliore = { g, d };
    }
    return migliore;
  };

  /** Dove si ferma un rilascio in `p`: l'aggancio se è nel magnete, altrimenti `p`. */
  const destinazione = (p: number): number => {
    const q = limita(p);
    const a = agganciopiuVicino(q);
    return a && a.d <= o.magnete ? limita(a.g) : q;
  };

  /** Posizione di riferimento per i comandi: la meta se in viaggio, altrimenti deg. */
  const base = (): number => (s.stato === 'fermo' || s.stato === 'trascina' ? s.deg : s.target);

  const fermati = (g: number, notifica: boolean): void => {
    s.deg = g;
    s.target = g;
    s.vel = 0;
    s.stato = 'fermo';
    viaggio = 'nessuno';
    if (notifica) o.onFermo?.(g);
  };

  /** Parte una frenata da deg (con la sua velocità) fino a `g`. */
  const avviaCorsa = (g: number, tipo: 'lancio' | 'salto', notifica: boolean): void => {
    if (o.ridotto()) {
      fermati(g, notifica);
      return;
    }
    const d = g - s.deg;
    if (Math.abs(d) < EPS && Math.abs(s.vel) < VEL_MIN_LANCIO) {
      fermati(g, notifica);
      return;
    }
    let durata = durataCorsa(d, o.durataAggancio) / 1000;
    let a = Math.abs(d) < EPS ? A_FRENATA : (s.vel * durata) / d;
    if (a > A_MASSIMA) {
      // Lancio più veloce di quanto la frenata assorba: si accorcia la corsa,
      // così la velocità resta continua e l'arrivo non viene superato.
      durata = Math.max((A_MASSIMA * d) / s.vel, DUR_CORSA_MIN / 1000);
      a = Math.min(A_MASSIMA, (s.vel * durata) / d);
    }
    if (a >= 0) a = Math.max(a, A_FRENATA);
    else a = Math.max(a, A_MINIMA);
    corsaDa = s.deg;
    corsaA = g;
    corsaPendenza = a;
    corsaDurata = durata;
    corsaT = 0;
    corsaNotifica = notifica;
    s.target = g;
    s.stato = 'aggancio';
    viaggio = tipo;
  };

  const tickCorsa = (dt: number): boolean => {
    corsaT += dt;
    const u = corsaDurata > 0 ? Math.min(1, corsaT / corsaDurata) : 1;
    const tragitto = corsaA - corsaDa;
    if (u >= 1) {
      fermati(corsaA, corsaNotifica);
      return false;
    }
    s.deg = corsaDa + tragitto * hermite(u, corsaPendenza);
    s.vel = corsaDurata > 0 ? (hermiteVelocita(u, corsaPendenza) * tragitto) / corsaDurata : 0;
    return true;
  };

  const rotore: Rotore = {
    get viaggio(): Viaggio {
      return viaggio;
    },

    get meta(): number {
      return s.stato === 'fermo' ? s.deg : s.target;
    },

    trascina(g: number): void {
      const adesso = ora();
      if (s.stato !== 'trascina') {
        origine = base();
        const primo = limita(vicino(g, s.deg));
        dito = primo;
        velDito = 0;
        ultimoDitoMs = adesso;
        s.stato = 'trascina';
        s.target = primo;
        if (!o.ridotto() && Math.abs(primo - s.deg) > SOGLIA_PRESA) {
          viaggio = 'presa';
          molla.imposta(MOLLE.presa);
          molla.obiettivo = primo;
          molla.riparti(s.deg, s.vel);
        } else {
          viaggio = 'nessuno';
          s.deg = primo;
          s.vel = 0;
        }
        sveglia();
        return;
      }
      const g1 = limita(vicino(g, dito));
      const dtMs = adesso - ultimoDitoMs;
      if (dtMs > 0) {
        const istantanea = ((g1 - dito) * 1000) / dtMs;
        velDito = velDito + (istantanea - velDito) * PESO_VEL_DITO;
      }
      ultimoDitoMs = adesso;
      dito = g1;
      s.target = g1;
      if (viaggio === 'presa') {
        molla.obiettivo = g1;
      } else {
        s.deg = g1;
        s.vel = velDito;
      }
      sveglia();
    },

    rilascia(velGradiAlSecondo: number): void {
      if (s.stato !== 'trascina') return;
      const vel = Number.isFinite(velGradiAlSecondo) ? velGradiAlSecondo : velDito;
      if (o.ridotto()) {
        fermati(destinazione(dito), true);
        sveglia();
        return;
      }
      const lancio =
        Math.abs(vel) >= VEL_MIN_LANCIO ? clamp(vel * TAU_LANCIO, -o.inerziaMax, o.inerziaMax) : 0;
      const meta = destinazione(dito + lancio);
      if (viaggio === 'presa') s.vel = molla.velocita;
      else s.vel = vel;
      avviaCorsa(meta, 'lancio', true);
      sveglia();
    },

    vaA(g: number, opz?: OpzioniVaA): void {
      // Con il periodo (anello) si gira per la via più corta da dove si è ora.
      let meta = limita(vicino(g, s.deg));
      if (opz?.aggancia) meta = destinazione(meta);
      const notifica = !opz?.silenzioso;
      if (opz?.subito || o.ridotto()) {
        fermati(meta, notifica);
        molla.salta(meta);
        accumuloRidotto = meta;
      } else {
        avviaCorsa(meta, 'salto', notifica);
      }
      sveglia();
    },

    spingi(deltaGradi: number): void {
      if (s.stato === 'trascina' || !Number.isFinite(deltaGradi) || deltaGradi === 0) return;
      const adesso = ora();
      if (o.ridotto()) {
        // Nessun inseguimento: si accumula in silenzio e il braccio salta
        // all'aggancio appena l'accumulo ne entra nel magnete.
        if (adesso - ultimaSpinta > QUIETE_ROTELLA) accumuloRidotto = s.deg;
        ultimaSpinta = adesso;
        accumuloRidotto = limita(accumuloRidotto + deltaGradi);
        const meta = destinazione(accumuloRidotto);
        if (Math.abs(meta - s.deg) > EPS) fermati(meta, true);
        sveglia();
        return;
      }
      if (viaggio !== 'rotella') {
        const partenza = base();
        molla.imposta(MOLLE.rotella);
        molla.riparti(s.deg, s.vel);
        s.target = partenza;
        viaggio = 'rotella';
        s.stato = 'inerzia';
      }
      ultimaSpinta = adesso;
      s.target = limita(s.target + deltaGradi);
      molla.obiettivo = s.target;
      sveglia();
    },

    aggancia(): void {
      if (s.stato === 'trascina') return;
      const meta = destinazione(s.stato === 'fermo' ? s.deg : s.target);
      if (s.stato === 'fermo' && Math.abs(meta - s.deg) < EPS) return;
      if (viaggio === 'rotella') s.vel = molla.velocita;
      avviaCorsa(meta, 'lancio', true);
      sveglia();
    },

    passoAggancio(verso: 1 | -1): number | null {
      const b = base();
      let migliore: number | null = null;
      for (const a of o.agganci()) {
        // Con il periodo si provano i rappresentanti vicini alla base.
        const candidati = periodo ? [vicino(a, b) - periodo, vicino(a, b), vicino(a, b) + periodo] : [a];
        for (const g of candidati) {
          if (g < min - EPS || g > max + EPS) continue;
          if (verso > 0 ? g > b + OLTRE : g < b - OLTRE) {
            if (migliore === null || (verso > 0 ? g < migliore : g > migliore)) migliore = g;
          }
        }
      }
      if (migliore === null) return null;
      rotore.vaA(migliore);
      return migliore;
    },

    annullaTrascina(): void {
      if (s.stato !== 'trascina') return;
      s.vel = viaggio === 'presa' ? molla.velocita : 0;
      avviaCorsa(origine, 'salto', true);
      sveglia();
    },

    accenna(ampiezza: number = INVITO.ampiezza): boolean {
      if (o.ridotto() || s.stato !== 'fermo') return false;
      const verso = s.deg + ampiezza <= max ? 1 : -1;
      if (verso < 0 && s.deg - ampiezza < min) return false;
      invitoBase = s.deg;
      invitoAmpiezza = ampiezza * verso;
      invitoT = 0;
      s.target = s.deg;
      s.stato = 'aggancio';
      viaggio = 'invito';
      sveglia();
      return true;
    },

    interrompi(): void {
      fermati(s.deg, false);
      molla.salta(s.deg);
      accumuloRidotto = s.deg;
    },

    tick(dt: number): boolean {
      const h = dt > 0 ? dt : 0;
      switch (viaggio) {
        case 'nessuno':
          return false;

        case 'presa': {
          molla.obiettivo = dito;
          molla.passo(h);
          s.deg = molla.valore;
          s.vel = molla.velocita;
          if (Math.abs(dito - s.deg) < PRESA_ARRIVATA) {
            s.deg = dito;
            s.vel = velDito;
            viaggio = 'nessuno';
            return false;
          }
          return true;
        }

        case 'lancio':
        case 'salto':
          return tickCorsa(h);

        case 'rotella': {
          if (ora() - ultimaSpinta >= QUIETE_ROTELLA) {
            s.vel = molla.velocita;
            avviaCorsa(destinazione(s.target), 'lancio', true);
            return (viaggio as Viaggio) === 'nessuno' ? false : tickCorsa(h);
          }
          molla.obiettivo = s.target;
          molla.passo(h);
          s.deg = molla.valore;
          s.vel = molla.velocita;
          // Anche a molla ferma resta in ascolto finché la quiete non scade.
          return true;
        }

        case 'invito': {
          invitoT += h;
          const u = Math.min(1, invitoT / (INVITO.durata / 1000));
          if (u >= 1) {
            fermati(invitoBase, false);
            return false;
          }
          s.deg = invitoBase + invitoAmpiezza * curvaInvito(u);
          s.vel = 0;
          return true;
        }
      }
    },
  };

  return rotore;
}

/* ------------------------------------------------------------------ */
/* Quale contenuto mostrare mentre il braccio si muove                  */
/* ------------------------------------------------------------------ */

export interface OpzioniContenuto {
  /** Angolo di contenuto oggi in vista (store.attivo). */
  attuale: number;
  /** Il rotore del braccio. */
  rotore: Pick<Rotore, 'viaggio' | 'meta'>;
  /** runtime.braccio. */
  stato: Pick<StatoRotazione, 'deg' | 'stato'>;
  /** `angoloDiContenuto` di dial/geometria.ts. */
  diContenuto: (g: number) => number;
  passo?: number;
  isteresi?: number;
}

/**
 * Regola unica del cambio di contenuto (ux-architect §3 "Regole di ritmo"):
 * - fermo: l'angolo più vicino, senza isteresi (Maiusc+freccia a 47° → 60°);
 * - trascinamento: cambia a metà strada più `isteresi` gradi, così il dito
 *   fermo sul confine non fa tremolare il testo;
 * - salto, lancio, rotella: il braccio attraversa gli angoli intermedi ma il
 *   contenuto cambia **una volta sola**, quando entra nella zona della meta;
 * - invito: mai.
 * Chi chiama (useBraccio) passa il risultato a `store.impostaAttivo` solo se
 * diverso da `attuale` (eventualmente attraverso la cadenza di interaction/attivita.ts).
 */
export function contenutoDuranteIlMoto(o: OpzioniContenuto): number {
  const passo = o.passo ?? PASSO_ANGOLI;
  const isteresi = o.isteresi ?? ISTERESI_CONTENUTO;
  const { deg } = o.stato;
  const v = o.rotore.viaggio;
  if (v === 'invito') return o.attuale;
  if (o.stato.stato === 'fermo') return o.diContenuto(deg);
  if (v === 'salto' || v === 'lancio' || v === 'rotella') {
    const meta = o.diContenuto(o.rotore.meta);
    return o.diContenuto(deg) === meta ? meta : o.attuale;
  }
  const qui = o.diContenuto(deg);
  if (qui === o.attuale) return o.attuale;
  return Math.abs(deg - o.attuale) > passo / 2 + isteresi ? qui : o.attuale;
}

/* ------------------------------------------------------------------ */
/* Scrittura nel DOM solo quando il valore cambia                      */
/* ------------------------------------------------------------------ */

const ultimeScritture = new WeakMap<Element, Map<string, string>>();

/**
 * Scrive la variabile CSS `nome` su `el` solo se il valore è cambiato.
 * Regola del Lab: le variabili scritte da JS vivono solo sugli elementi foglia
 * marcati `data-nov-var` (es. il gruppo del braccio, il nodo dei gradi).
 * Restituisce true se ha scritto.
 */
export function scriviVarSeCambia(el: HTMLElement | SVGElement, nome: `--${string}`, valore: string): boolean {
  let mappa = ultimeScritture.get(el);
  if (!mappa) {
    mappa = new Map();
    ultimeScritture.set(el, mappa);
  }
  if (mappa.get(nome) === valore) return false;
  mappa.set(nome, valore);
  el.style.setProperty(nome, valore);
  return true;
}

/** Il valore dell'angolo come testo per una variabile CSS (2 decimali, niente "-0.00"). */
export function formattaGradi(g: number): string {
  const v = Math.round(g * 100) / 100;
  return (Object.is(v, -0) ? 0 : v).toFixed(2);
}
