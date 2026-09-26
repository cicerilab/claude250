/**
 * SOTTOSCOCCA · quale pezzo della scena diventa bianco segnaletica.
 *
 * Creative-director 4.3: "il pezzo toccato diventa bianco (solo quel pezzo),
 * gli altri restano verdi". ux-architect 7.4: al passaggio del puntatore
 * (puntatore fine) il pezzo si evidenzia. Qui si decide il BERSAGLIO (0 o 1
 * per pezzo); la transizione di 250 ms verso il bersaglio la fa
 * motion/molle.ts scrivendo `runtime.evidenza`, e il materiale la legge.
 *
 * Regole:
 * - un solo punto evidenziato alla volta;
 * - vince la scheda aperta; senza scheda, l'ultimo punto indicato (puntatore
 *   sopra o fuoco da tastiera);
 * - LIMITE ANTI-LAMPEGGIO: il bersaglio cambia al massimo una volta ogni
 *   500 ms. Chi passa col mouse su quattro punti in un secondo vede due cambi,
 *   non otto: l'ultimo desiderio vince alla scadenza della finestra. Vale per
 *   ogni origine (anche l'apertura della scheda), perché le ruote e il
 *   pianale sono superfici grandi.
 *
 * Senza WebGL il bersaglio non ha effetto sulla scena (le foto non cambiano),
 * ma `ascoltaEvidenza` resta utile a chi vuole segnare il punto.
 *
 * Nessun accesso a window/document a livello di modulo: il timer parte solo
 * da funzioni chiamate da handler ed effetti.
 */

import { PUNTI } from '../content/lavori';
import type { IdPezzo, IdPunto } from '../content/lavori';
import { ticker } from '../core/ticker';
import { runtime } from '../state/runtime';

/** Intervallo minimo tra due cambi del pezzo evidenziato (anti-lampeggio). */
export const EVIDENZA_INTERVALLO_MS = 500;

let puntoScheda: IdPunto | null = null;
let puntoIndicato: IdPunto | null = null;
let impegnato: IdPunto | null = null;
let pezziImpegnati: ReadonlySet<IdPezzo> = new Set<IdPezzo>();
let ultimoCambio = Number.NEGATIVE_INFINITY;
let timer: ReturnType<typeof setTimeout> | null = null;
const ascoltatori = new Set<(punto: IdPunto | null) => void>();

function desiderato(): IdPunto | null {
  return puntoScheda ?? puntoIndicato;
}

function annullaTimer(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

function impegna(punto: IdPunto | null, ora: number): void {
  impegnato = punto;
  ultimoCambio = ora;
  pezziImpegnati = new Set<IdPezzo>(punto ? PUNTI[punto].pezzi : []);
  runtime.markDirty();
  ticker.wake();
  ascoltatori.forEach((fn) => fn(punto));
}

function valuta(): void {
  const voluto = desiderato();
  if (voluto === impegnato) {
    annullaTimer();
    return;
  }
  const ora = performance.now();
  const attesa = ultimoCambio + EVIDENZA_INTERVALLO_MS - ora;
  if (attesa > 0) {
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
        valuta();
      }, attesa);
    }
    return;
  }
  annullaTimer();
  impegna(voluto, ora);
}

/**
 * Il puntatore è sopra un punto, o un punto ha il fuoco (`id`), oppure li ha
 * lasciati (`null`). `da` evita che l'uscita da A cancelli B già indicato:
 * con `id === null` si azzera solo se l'indicato è ancora `da`.
 */
export function segnalaIndicato(id: IdPunto | null, da?: IdPunto): void {
  if (id === null && da !== undefined && puntoIndicato !== da) return;
  if (puntoIndicato === id) return;
  puntoIndicato = id;
  valuta();
}

/** La scheda del punto `id` è aperta (`null`: nessuna scheda). */
export function segnalaScheda(id: IdPunto | null): void {
  if (puntoScheda === id) return;
  puntoScheda = id;
  valuta();
}

/** Bersaglio del pezzo: 1 se va evidenziato adesso, 0 altrimenti. Per motion/molle.ts. */
export function bersaglioEvidenza(pezzo: IdPezzo): 0 | 1 {
  return pezziImpegnati.has(pezzo) ? 1 : 0;
}

/** Pezzi evidenziati adesso (insieme non modificabile). */
export function pezziEvidenziati(): ReadonlySet<IdPezzo> {
  return pezziImpegnati;
}

/** Punto evidenziato adesso, o null. */
export function puntoEvidenziato(): IdPunto | null {
  return impegnato;
}

/** Avvisa a ogni cambio effettivo (già limitato a uno ogni 500 ms). */
export function ascoltaEvidenza(fn: (punto: IdPunto | null) => void): () => void {
  ascoltatori.add(fn);
  return () => {
    ascoltatori.delete(fn);
  };
}

/** Smontaggio del concept (Radice): nessun timer resta appeso, stato pulito. */
export function azzeraEvidenza(): void {
  annullaTimer();
  puntoScheda = null;
  puntoIndicato = null;
  impegnato = null;
  pezziImpegnati = new Set<IdPezzo>();
  ultimoCambio = Number.NEGATIVE_INFINITY;
  ascoltatori.clear();
}
