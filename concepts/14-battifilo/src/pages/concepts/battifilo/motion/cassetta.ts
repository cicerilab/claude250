/**
 * BATTIFILO · il controller della cassetta: segue, sosta, aggancio, volo.
 *
 * Contratto di tech-architect §7.2. Scrive SOLO `runtime.cassetta`
 * (`pos`, `target`, `vel`, `stato`, `ultimoMovimento`); non tocca il DOM,
 * non conosce React. Lo comanda `useCassetta.ts` (section-builder-linea) e,
 * per lo swipe della foto, `cassettaCorrente()`.
 *
 * Stati (runtime.cassetta.stato):
 * - 'fermo'     sulla tacca, niente in moto;
 * - 'trascina'  in mano: `pos` segue il dito 1:1, nessun ritardo;
 * - 'aggancio'  corsa breve verso la tacca vicina (rilascio o sosta di 500 ms);
 * - 'sosta'     agganciata con battuta mentre il dito è ancora giù: riparte
 *               solo se il dito si allontana di `sogliaRipresa`;
 * - 'volo'      corsa a tempo verso una tacca (tocco, tasto, swipe, rotella,
 *               URL): curva `tiro`, la velocità d'ingresso si conserva.
 *
 * `onAggancio(t)` scatta ogni volta che la cassetta si ferma su una tacca:
 * lì il filo batte e `fermaTappa(t)` aggiorna lo store. Con reduced motion
 * niente corse: salto secco e `onAggancio` subito.
 *
 * Nessun accesso a window/document a livello di modulo; `performance.now()`
 * si usa solo dentro le funzioni chiamate dagli handler.
 */

import type { Tappa } from '../core/tempo';
import type { StatoCassetta } from '../state/runtime';
import { CASSETTA, durataAggancio, durataVolo } from './choreography';
import { aggancio as curvaAggancio, clamp, hermiteVelocita, lerp, tiro as curvaTiro, type Curva } from './easing';

export interface OpzioniCassetta {
  /** runtime.cassetta */
  stato: StatoCassetta;
  min: 0;
  max: 15;
  /** ms fermo col dito prima dell'aggancio (CD: 500). */
  sosta: number;
  /** ms da tacca a tacca col tocco (CD: 500). */
  durataVolo: number;
  /** reduced motion: salto secco all'aggancio, niente volo. */
  ridotto: () => boolean;
  /** La cassetta si è fermata su t: batte il filo, fermaTappa. */
  onAggancio: (t: Tappa) => void;
}

export interface Cassetta {
  /** Segue il dito 1:1 (niente ritardo), aggiorna ultimoMovimento. `now` in ms (performance.now()). */
  trascina(pos: number, now?: number): void;
  /** Niente inerzia lunga: aggancio alla tappa vicina (al massimo +1 nel verso se la velocità è alta). */
  rilascia(velTappeAlSecondo: number): void;
  /** Tacca, tasti, swipe, URL, apertura automatica. `subito`: senza volo. */
  vaA(t: Tappa, opz?: { subito?: boolean }): void;
  /** Rotella, "mese prima" / "mese dopo", frecce: vaA(ultima tacca + delta). */
  passo(delta: number): void;
  /** Fase 'update' del ticker. true = ancora in moto. */
  tick(dt: number, now: number): boolean;
  /** L'ultima tacca su cui si è fermata (o da cui è partita). */
  readonly tappa: Tappa;
}

interface Corsa {
  da: number;
  a: number;
  /** Velocità di partenza (tappe/s), portata dentro con `hermiteVelocita`. */
  v0: number;
  t: number;
  durata: number;
  curva: Curva;
  fine: 'fermo' | 'sosta';
}

function adesso(now?: number): number {
  if (typeof now === 'number' && Number.isFinite(now)) return now;
  return typeof performance !== 'undefined' ? performance.now() : 0;
}

export function creaCassetta(o: OpzioniCassetta): Cassetta {
  const s = o.stato;
  const limita = (p: number): number => clamp(p, o.min, o.max);
  const aTappa = (p: number): Tappa => limita(Math.round(p)) as Tappa;

  let corsa: Corsa | null = null;
  let ultimaTappa: Tappa = aTappa(s.pos);
  /** Stima della velocità del dito: ultima posizione e istante. */
  let posPrec = s.pos;
  let tPrec = 0;
  /** Il dito è ancora giù dopo un aggancio in sosta. */
  let ditoGiu = false;

  const fermaSu = (t: Tappa, stato: 'fermo' | 'sosta'): void => {
    corsa = null;
    s.pos = t;
    s.target = t;
    s.vel = 0;
    s.stato = stato;
    ultimaTappa = t;
    o.onAggancio(t);
  };

  const avviaCorsa = (a: number, durata: number, curva: Curva, fine: 'fermo' | 'sosta', stato: 'aggancio' | 'volo'): void => {
    const v0 = clamp(s.vel, -CASSETTA.velocitaMassima, CASSETTA.velocitaMassima);
    corsa = { da: s.pos, a, v0, t: 0, durata: Math.max(1, durata), curva, fine };
    s.target = a;
    s.stato = stato;
  };

  const vaiA = (t: Tappa, subito: boolean, curva: Curva, durata: number, fine: 'fermo' | 'sosta', stato: 'aggancio' | 'volo'): void => {
    if (subito || o.ridotto()) {
      fermaSu(t, fine);
      return;
    }
    if (Math.abs(s.pos - t) < 1e-3 && Math.abs(s.vel) < 1e-3) {
      fermaSu(t, fine);
      return;
    }
    avviaCorsa(t, durata, curva, fine, stato);
  };

  const vaA = (t: Tappa, opz?: { subito?: boolean }): void => {
    const meta = aTappa(t);
    ditoGiu = false;
    const distanza = meta - s.pos;
    vaiA(meta, opz?.subito === true, curvaTiro, durataVolo(distanza, o.durataVolo), 'fermo', 'volo');
  };

  return {
    vaA,

    trascina(pos: number, now?: number): void {
      const n = adesso(now);
      const p = limita(pos);
      ditoGiu = true;

      if (s.stato === 'sosta' || (s.stato === 'aggancio' && corsa?.fine === 'sosta')) {
        // Dopo un aggancio in sosta il tremolio della mano non stacca la
        // cassetta: si riparte solo oltre la soglia di ripresa.
        if (Math.abs(p - s.target) < CASSETTA.sogliaRipresa) return;
      }

      if (s.stato !== 'trascina') {
        corsa = null;
        s.stato = 'trascina';
        posPrec = s.pos;
        tPrec = n;
        s.vel = 0;
        s.ultimoMovimento = n;
      }

      const dtS = (n - tPrec) / 1000;
      if (dtS > 0.004) {
        s.vel = clamp((p - posPrec) / dtS, -CASSETTA.velocitaMassima, CASSETTA.velocitaMassima);
        posPrec = p;
        tPrec = n;
      }
      if (Math.abs(p - s.pos) >= CASSETTA.sogliaMovimento) s.ultimoMovimento = n;
      s.pos = p;
      s.target = p;
    },

    rilascia(velTappeAlSecondo: number): void {
      ditoGiu = false;
      if (s.stato === 'sosta') {
        // Già agganciata con battuta mentre il dito era giù: niente seconda battuta.
        s.stato = 'fermo';
        return;
      }
      if (s.stato === 'aggancio' && corsa) {
        // L'aggancio della sosta finisce da solo; quello del rilascio era già in corso.
        corsa.fine = 'fermo';
        return;
      }
      if (s.stato !== 'trascina') return;

      const v = clamp(Number.isFinite(velTappeAlSecondo) ? velTappeAlSecondo : s.vel, -CASSETTA.velocitaMassima, CASSETTA.velocitaMassima);
      s.vel = v;
      const vicina = Math.round(s.pos);
      let meta = vicina;
      if (Math.abs(v) >= CASSETTA.sogliaLancio) {
        const proiettata = Math.round(s.pos + v * CASSETTA.proiezione);
        // Al massimo una tacca oltre la vicina, nel verso del lancio.
        meta = clamp(proiettata, vicina - 1, vicina + 1);
        if (Math.sign(meta - s.pos) !== Math.sign(v) && meta !== vicina) meta = vicina;
      }
      const t = aTappa(meta);
      vaiA(t, false, curvaAggancio, durataAggancio(t - s.pos), 'fermo', 'aggancio');
    },

    passo(delta: number): void {
      const base = corsa ? Math.round(s.target) : ultimaTappa;
      const meta = aTappa(base + Math.trunc(delta));
      if (meta === base && !corsa && s.stato === 'fermo') {
        // Al bordo (0 o 15) non si rimbalza e non si ribatte.
        return;
      }
      vaA(meta);
    },

    tick(dt: number, now: number): boolean {
      if (s.stato === 'trascina') {
        if (ditoGiu && now - s.ultimoMovimento >= o.sosta) {
          // Fermo col dito da 500 ms: aggancio con battuta, poi si può continuare a tirare.
          const t = aTappa(s.pos);
          s.vel = 0;
          vaiA(t, false, curvaAggancio, durataAggancio(t - s.pos), 'sosta', 'aggancio');
          return corsa !== null;
        }
        // In mano: il ticker resta sveglio per la sosta e per il filo.
        return true;
      }

      if (!corsa) return false;
      const c = corsa;
      const prima = s.pos;
      c.t += Math.max(0, dt) * 1000;
      const u = Math.min(1, c.t / c.durata);
      const durataS = c.durata / 1000;
      const p = lerp(c.da, c.a, c.curva(u)) + c.v0 * durataS * hermiteVelocita(u);
      s.pos = limita(p);
      s.vel = dt > 0 ? (s.pos - prima) / dt : 0;
      if (u >= 1) {
        const fine = c.fine;
        fermaSu(aTappa(c.a), fine === 'sosta' && ditoGiu ? 'sosta' : 'fermo');
        return false;
      }
      return true;
    },

    get tappa(): Tappa {
      return ultimaTappa;
    },
  };
}
