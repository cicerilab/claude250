/**
 * IMPRONTA · luce col telefono (giroscopio), permesso e preferenza.
 *
 * Regole (creative-director 4.3, ux-architect 5.1 e 6.3):
 * - il giroscopio non parte mai da solo: serve un "Attiva" esplicito;
 * - l'invito compare solo dopo il primo tocco del dito sulla carta, una volta
 *   per visita, e solo su dispositivi a puntatore grossolano con sensore;
 * - su iOS il permesso si chiede con DeviceOrientationEvent.requestPermission()
 *   dentro il gesto dell'utente (clic su "Attiva"); se rifiuta, l'invito
 *   sparisce e non torna;
 * - dall'indice si può accendere e spegnere ("Luce col telefono: sì / no");
 * - con prefers-reduced-motion niente invito e niente tilt.
 *
 * Questo modulo tiene solo lo STATO (permesso, preferenza, invito). Gli eventi
 * deviceorientation che muovono la luce li ascolta light.ts, solo quando qui
 * lo stato è "attivo".
 *
 * Nessun accesso a window/document a livello di modulo: tutto dentro funzioni.
 */

import { useSyncExternalStore } from 'react';
import { store } from '../state/store';

/* ------------------------------------------------------------------ tipi */

export type GyroStato =
  /** Nessun sensore, puntatore fine (desktop) o sensore muto. Niente UI. */
  | 'non-supportato'
  /** Sensore presente, invito non ancora mostrato in questa visita. */
  | 'da-chiedere'
  /** Invito visibile nell'hero: "Muovi la luce inclinando il telefono" + Attiva. */
  | 'invito'
  /** La luce segue l'inclinazione. */
  | 'attivo'
  /** Disponibile ma spento (dall'indice, o invito già visto e ignorato). */
  | 'spento'
  /** Permesso negato o "Lascia stare": l'invito non torna. Resta l'indice. */
  | 'rifiutato';

export interface GyroSnapshot {
  readonly stato: GyroStato;
  /** true su iOS 13+: l'attivazione apre il dialogo di sistema. */
  readonly richiedePermesso: boolean;
  /** true mentre si attende il dialogo di sistema o il primo dato del sensore. */
  readonly inAttesa: boolean;
}

type Salvato = 'attivo' | 'spento' | 'rifiutato' | 'invito-visto';

type RispostaPermesso = 'granted' | 'denied' | 'default';

type CostruttoreOrientamento = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<RispostaPermesso>;
};

/* ------------------------------------------------------------------ costanti */

/** sessionStorage: la scelta vale per la visita, non per sempre. */
const CHIAVE = 'impronta:luce-telefono';
/** Se dopo l'attivazione non arriva nessun dato valido entro questo tempo, il sensore è muto. */
const ATTESA_SENSORE_MS = 1500;

const SNAPSHOT_SERVER: GyroSnapshot = Object.freeze({
  stato: 'non-supportato',
  richiedePermesso: false,
  inAttesa: false,
});

/* ------------------------------------------------------------------ stato di modulo */

let snapshot: GyroSnapshot = SNAPSHOT_SERVER;
let inizializzato = false;
/**
 * iOS: la visita precedente (stessa sessione) aveva la luce col telefono
 * accesa, ma dopo un ricaricamento il permesso va richiesto di nuovo dentro un
 * gesto. Lo facciamo al primo tocco sulla carta, senza mostrare l'invito.
 */
let daRiattivare = false;
const ascoltatori = new Set<() => void>();

/* ------------------------------------------------------------------ utilità */

function pubblica(patch: Partial<GyroSnapshot>): void {
  const prossimo: GyroSnapshot = { ...snapshot, ...patch };
  if (
    prossimo.stato === snapshot.stato &&
    prossimo.richiedePermesso === snapshot.richiedePermesso &&
    prossimo.inAttesa === snapshot.inAttesa
  ) {
    return;
  }
  snapshot = Object.freeze(prossimo);
  ascoltatori.forEach((fn) => fn());
}

function leggiSalvato(): Salvato | null {
  try {
    const v = window.sessionStorage.getItem(CHIAVE);
    return v === 'attivo' || v === 'spento' || v === 'rifiutato' || v === 'invito-visto' ? v : null;
  } catch {
    return null;
  }
}

function salva(v: Salvato): void {
  try {
    window.sessionStorage.setItem(CHIAVE, v);
  } catch {
    /* storage bloccato (navigazione privata, iframe): la scelta vale solo per questa pagina */
  }
}

function costruttore(): CostruttoreOrientamento | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.DeviceOrientationEvent === 'undefined') return null;
  return window.DeviceOrientationEvent as CostruttoreOrientamento;
}

function puntatoreGrossolano(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Aspetta il primo evento deviceorientation con beta/gamma validi.
 * Chrome desktop espone l'evento ma senza sensore manda null o niente.
 */
function sondaSensore(ms: number): Promise<boolean> {
  return new Promise((risolvi) => {
    let chiuso = false;
    const chiudi = (esito: boolean): void => {
      if (chiuso) return;
      chiuso = true;
      window.removeEventListener('deviceorientation', suEvento);
      window.clearTimeout(timer);
      risolvi(esito);
    };
    const suEvento = (e: DeviceOrientationEvent): void => {
      if (typeof e.beta === 'number' && typeof e.gamma === 'number') chiudi(true);
    };
    const timer = window.setTimeout(() => chiudi(false), ms);
    window.addEventListener('deviceorientation', suEvento, { passive: true });
  });
}

/* ------------------------------------------------------------------ API */

/**
 * Legge sensore, piattaforma e scelta salvata. Idempotente.
 * La chiama light.ts in startLight(); si può chiamare anche prima.
 */
export function inizializzaGyro(): void {
  if (inizializzato || typeof window === 'undefined') return;
  inizializzato = true;

  const c = costruttore();
  if (!c || !puntatoreGrossolano()) {
    pubblica({ stato: 'non-supportato', richiedePermesso: false, inAttesa: false });
    return;
  }

  const richiede = typeof c.requestPermission === 'function';
  const salvato = leggiSalvato();
  let stato: GyroStato = 'da-chiedere';

  if (salvato === 'rifiutato') {
    stato = 'rifiutato';
  } else if (salvato === 'spento' || salvato === 'invito-visto') {
    stato = 'spento';
  } else if (salvato === 'attivo') {
    if (richiede) {
      stato = 'spento';
      daRiattivare = true;
    } else {
      stato = 'attivo';
    }
  }

  pubblica({ stato, richiedePermesso: richiede, inAttesa: false });
}

/**
 * Da chiamare al rilascio del dito sulla carta (light.ts lo fa su pointerup
 * di tipo touch, che per iOS è un gesto valido per requestPermission).
 */
export function segnalaToccoCarta(): void {
  inizializzaGyro();
  if (store.get().reducedMotion) return;
  if (daRiattivare) {
    daRiattivare = false;
    void attivaGyro();
    return;
  }
  if (snapshot.stato !== 'da-chiedere') return;
  salva('invito-visto');
  pubblica({ stato: 'invito' });
}

/**
 * Accende la luce col telefono. Chiamarla SOLO dentro un handler di clic
 * (bottone "Attiva" dell'invito, "sì" nell'indice): su iOS apre il dialogo di
 * sistema, che fuori da un gesto viene rifiutato.
 */
export async function attivaGyro(): Promise<GyroStato> {
  inizializzaGyro();
  if (snapshot.stato === 'non-supportato' || snapshot.inAttesa) return snapshot.stato;
  if (store.get().reducedMotion) return snapshot.stato;

  const c = costruttore();
  if (!c) {
    pubblica({ stato: 'non-supportato', inAttesa: false });
    return 'non-supportato';
  }

  if (typeof c.requestPermission === 'function') {
    // requestPermission va chiamata in modo sincrono dentro il gesto:
    // nessun await prima di questa riga.
    const richiesta = c.requestPermission();
    pubblica({ inAttesa: true });
    try {
      const esito = await richiesta;
      if (esito !== 'granted') {
        salva('rifiutato');
        pubblica({ stato: 'rifiutato', inAttesa: false });
        return 'rifiutato';
      }
    } catch {
      // NotAllowedError: chiamata fuori da un gesto valido. Non è un rifiuto
      // dell'utente: si potrà riprovare dal bottone.
      pubblica({ inAttesa: false });
      return snapshot.stato;
    }
  } else {
    pubblica({ inAttesa: true });
  }

  const arriva = await sondaSensore(ATTESA_SENSORE_MS);
  if (!arriva) {
    pubblica({ stato: 'non-supportato', inAttesa: false });
    return 'non-supportato';
  }
  salva('attivo');
  pubblica({ stato: 'attivo', inAttesa: false });
  return 'attivo';
}

/** Spegne la luce col telefono (indice: "no"). Resta riattivabile. */
export function spegniGyro(): void {
  inizializzaGyro();
  daRiattivare = false;
  if (snapshot.stato === 'non-supportato') return;
  salva('spento');
  pubblica({ stato: 'spento', inAttesa: false });
}

/** "Lascia stare" sull'invito: l'invito non torna. L'indice resta. */
export function rifiutaInvito(): void {
  inizializzaGyro();
  daRiattivare = false;
  if (snapshot.stato === 'non-supportato') return;
  salva('rifiutato');
  pubblica({ stato: 'rifiutato', inAttesa: false });
}

/** Interruttore dell'indice. Con `true` va chiamata dentro un clic. */
export function impostaLuceTelefono(acceso: boolean): Promise<GyroStato> {
  if (acceso) return attivaGyro();
  spegniGyro();
  return Promise.resolve(snapshot.stato);
}

export function gyroAttivo(): boolean {
  return snapshot.stato === 'attivo';
}

export function getGyro(): GyroSnapshot {
  return snapshot;
}

export function subscribeGyro(fn: () => void): () => void {
  ascoltatori.add(fn);
  return () => {
    ascoltatori.delete(fn);
  };
}

function getGyroServer(): GyroSnapshot {
  return SNAPSHOT_SERVER;
}

/**
 * Hook per l'invito nell'hero e per l'interruttore dell'indice.
 * - mostra l'invito se `stato === 'invito'`;
 * - mostra l'interruttore se `stato !== 'non-supportato'` e non c'è reduced motion.
 */
export function useGyro(): GyroSnapshot {
  return useSyncExternalStore(subscribeGyro, getGyro, getGyroServer);
}
