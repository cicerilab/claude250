/**
 * SOTTOSCOCCA · dallo scroll alla quota del ponte (tech-architect §6.3,
 * motion-designer §11).
 *
 * Tre funzioni nel ticker unico:
 * - fase `read`: se le stazioni sono invalidate (o cambia la finestra) le
 *   rimisura e ricalcola UNA volta il profilo (`profiloDaGeometria`);
 * - fase `update`: obiettivi da `statoDaScroll`, motore del ponte
 *   (`MotorePonte` di motion/molle.ts scrive quota, binario, discesa,
 *   opacità, ruote ed evidenze in `runtime`), percorso, plateau → store e
 *   annuncio, sezione corrente → store;
 * - (le scritture nel DOM dei punti sono in ponte/punti.ts, fase `write`).
 *
 * `salta` del motore (nessun movimento, nessuna ruota) al primo frame, al
 * cambio di orientamento, al ritorno da scheda nascosta e dopo l'arrivo da
 * un'ancora nell'URL (`saltaPonte()`).
 *
 * Con `?fermo=<quota>` (store.fermo) l'obiettivo è fisso a quel plateau e la
 * scena non segue lo scroll (fermi immagine, tech-architect §8.4).
 *
 * Nessun accesso al browser a livello di modulo.
 */

import type { IdPezzo, Quota } from '../content/lavori';
import { QUOTE } from '../content/testi';
import { ticker } from '../core/ticker';
import { evidenzeCorrenti } from '../interaction/evidenza';
import { MotorePonte } from '../motion/molle';
import {
  binarioDaQuota,
  creaStatoPonte,
  percorsoDaScroll,
  profiloBase,
  profiloDaGeometria,
  statoDaScroll,
  type Chiave,
  type ProfiloPonte,
  type StatoPonte,
} from '../motion/percorso';
import { annuncia } from '../state/annuncio';
import { runtime, type Orientamento } from '../state/runtime';
import { store, type IdSezione } from '../state/store';
import { geometrie, misuraStazioni, sezioneA, stazioniInvalide } from './stazioni';

/** Linea con cui si decide la sezione corrente (frazione della finestra dall'alto). */
const LINEA_SEZIONE = 0.5;
/** Dopo un salto dell'asta o di un link il plateau non si annuncia (ux §7.2) per al massimo questo tempo. */
const SILENZIO_MAX_MS = 2500;

const obiettivo: StatoPonte = creaStatoPonte();
const ingresso: { obiettivo: StatoPonte; ridotto: boolean; evidenze: readonly IdPezzo[] } = {
  obiettivo,
  ridotto: false,
  evidenze: [],
};

let motore = new MotorePonte();
let profilo: ProfiloPonte = profiloBase(900, 'landscape');
let profiloVh = 0;
let profiloOrient: Orientamento = 'landscape';
let daSaltare = true;
let primoPlateau = true;
let silenzioFino = 0;

/** Il profilo in uso (per chi deve calcolare uno scroll "a una quota": asta, fermi, test). */
export function profiloCorrente(): ProfiloPonte {
  return profilo;
}

/** Al prossimo frame il ponte va subito agli obiettivi, senza movimento (arrivo da hash). */
export function saltaPonte(): void {
  daSaltare = true;
  ticker.wake();
}

/** Il prossimo plateau raggiunto non va annunciato (salto da asta o link: il fuoco va già all'h2). */
export function silenziaPlateau(): void {
  silenzioFino = typeof performance !== 'undefined' ? performance.now() + SILENZIO_MAX_MS : 0;
}

function vh(): number {
  return runtime.viewport.h > 0 ? runtime.viewport.h : 900;
}

/** Rimisura (se serve) e ricalcola il profilo. Restituisce true se è cambiato. */
function aggiornaProfilo(forza: boolean): boolean {
  const h = vh();
  const o = runtime.viewport.orient;
  const misurate = stazioniInvalide() ? misuraStazioni() : false;
  if (!forza && !misurate && h === profiloVh && o === profiloOrient) return false;
  if (o !== profiloOrient && profiloVh !== 0) daSaltare = true;
  profilo = profiloDaGeometria(geometrie(), h, o);
  profiloVh = h;
  profiloOrient = o;
  return true;
}

/**
 * Lo scroll a cui portare la pagina per un'ancora, in modo che il ponte sia
 * GIÀ alla quota della sezione (ux §2.6): per gomme e freni il pannello sta
 * in alto (sotto la testata) e dentro il plateau; per il sottoscocca si
 * arriva all'aggancio dello stadio. `null` per le altre ancore (va bene lo
 * scroll normale all'elemento). Legge il layout: solo da gestori di evento.
 */
export function scrollPerAncora(id: string, margineAlto: number): number | null {
  if (id === 'inizio') return 0;
  const indice = id === 'gomme' ? 1 : id === 'freni' ? 2 : id === 'sottoscocca' ? 3 : -1;
  if (indice < 0) return null;
  aggiornaProfilo(true);
  const quota: Quota = indice === 1 ? 20 : indice === 2 ? 80 : 180;
  const t = profilo.quota;
  let da = Number.NaN;
  let a = Number.NaN;
  for (let i = 1; i < t.length; i += 1) {
    const k0 = t[i - 1] as Chiave;
    const k1 = t[i] as Chiave;
    if (k0.v === quota && k1.v === quota) {
      da = k0.s;
      a = k1.s;
      break;
    }
  }
  if (!Number.isFinite(da)) return null;
  const st = geometrie()[indice];
  if (st === undefined) return Math.max(0, da);
  if (indice === 3 && st.fissa === true) return Math.max(0, Math.ceil(da) + 1);
  const pannello = st.pannelloTop ?? st.top;
  const voluto = pannello - margineAlto;
  const dentro = Math.min(Math.max(voluto, da + 1), Math.max(da + 1, a - 1));
  return Math.max(0, Math.round(dentro));
}

function leggi(): void {
  aggiornaProfilo(false);
}

function aggiorna(dt: number, now: number): boolean {
  const s = store.get();
  const fermo = s.fermo;
  if (fermo !== null) {
    obiettivo.quota = fermo;
    obiettivo.binario = binarioDaQuota(fermo);
    obiettivo.discesa = 0;
    obiettivo.opacita = 1;
    obiettivo.plateau = fermo;
  } else {
    statoDaScroll(profilo, runtime.scrollY, s.reducedMotion, obiettivo);
  }
  runtime.percorso = percorsoDaScroll(runtime.scrollY, vh(), profilo.stazioni);
  ingresso.ridotto = s.reducedMotion;
  ingresso.evidenze = evidenzeCorrenti();

  let inMoto = false;
  if (daSaltare) {
    daSaltare = false;
    motore.salta(ingresso, runtime);
  } else {
    inMoto = motore.passo(dt, now, ingresso, runtime);
  }
  if (motore.cambiato) runtime.markDirty();

  const pl = motore.plateauRaggiunto;
  if (pl !== null && (pl !== s.quotaPlateau || primoPlateau)) {
    const annunciare = !primoPlateau && now > silenzioFino && fermo === null;
    primoPlateau = false;
    silenzioFino = 0;
    if (pl !== s.quotaPlateau) store.set({ quotaPlateau: pl });
    if (annunciare) annuncia(QUOTE[pl].annuncio);
  }

  const sezione: IdSezione | null = sezioneA(runtime.scrollY + LINEA_SEZIONE * vh());
  if (sezione !== null && sezione !== store.get().sezione) store.set({ sezione });

  return inMoto;
}

/**
 * Solo Radice.tsx: registra le fasi `read` e `update`. Restituisce lo
 * smontaggio. Si riparte sempre da capo (motore nuovo, primo frame = salto).
 */
export function avviaPonte(): () => void {
  motore = new MotorePonte();
  daSaltare = true;
  primoPlateau = true;
  silenzioFino = 0;
  profiloVh = 0;
  const togliLettura = ticker.add(leggi, 'read');
  const togliAggiorna = ticker.add(aggiorna, 'update');
  const togliRipresa = ticker.suRipresa(saltaPonte);
  return () => {
    togliRipresa();
    togliAggiorna();
    togliLettura();
  };
}
