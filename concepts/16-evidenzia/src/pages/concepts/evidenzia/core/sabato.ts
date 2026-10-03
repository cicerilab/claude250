/**
 * EVIDENZIA · il sabato della pagina e quelli del giro (tech-architect §6.1,
 * brand-strategist 9.3, ux-architect 6.14, copywriter: CALENDARIO).
 *
 * Regole (fuso Europe/Rome, sempre):
 * - **testata**: il sabato che viene; oggi, se è sabato (il foglio "di oggi");
 * - **giro**: il prossimo sabato se la richiesta parte entro venerdì alle
 *   12:00 (CALENDARIO.scadenzaVenerdi); dopo, e di sabato, il sabato
 *   seguente. Il sabato saltato è `tardi` ("Per questo sabato è tardi: ti
 *   proponiamo …"). I sabati di chiusura (CALENDARIO.sabatiChiusi) non sono
 *   mai proposti: il primo saltato è `chiuso` ("Sabato 26 dicembre siamo
 *   chiusi."). Si propongono sempre due sabati (radio "Quale sabato").
 *
 * `?oggi=2026-10-03` o `?oggi=2026-10-02T12:30` fissano una data finta per
 * la QA (ora di Roma; senza ora vale 09:00).
 *
 * Le date sono oggetti `Giorno` (mese 1-12) per le funzioni di testi.ts, più
 * l'ISO `yyyy-mm-dd` per memoria e confronti (l'ordine delle stringhe ISO è
 * quello delle date). Nessun accesso al browser né a `Intl` a livello di
 * modulo: tutto si calcola quando lo store si inizializza.
 */

import type { Giorno } from '../content/testi';
import { CALENDARIO } from '../content/zone';

export type { Giorno };

export interface Sabato {
  /** "2026-10-03" */
  readonly iso: string;
  readonly giorno: Giorno;
}

/** Un istante letto a Roma. */
export interface Istante {
  /** Data di oggi a Roma, ISO. */
  readonly iso: string;
  readonly giorno: Giorno;
  /** 0 = domenica … 6 = sabato. */
  readonly settimana: number;
  /** Minuti dalla mezzanotte, ora di Roma. */
  readonly minuti: number;
}

export interface Calendario {
  readonly oggi: Istante;
  /** Il sabato della pagina (testata e piede). */
  readonly testata: Sabato;
  /** I due sabati che il giro propone, nell'ordine: il primo è quello scelto di default. */
  readonly proposti: readonly [Sabato, Sabato];
  /** Il sabato che viene, saltato perché è tardi (dopo venerdì alle 12, o di sabato). null se non è tardi. */
  readonly tardi: Sabato | null;
  /** Il primo sabato di chiusura saltato nel proporre, o null. */
  readonly chiuso: Sabato | null;
}

const SABATO = 6;
const VENERDI = 5;

/* ------------------------------------------------------------------ date di calendario */

function due(n: number): string {
  return String(n).padStart(2, '0');
}

export function isoDa(g: Giorno): string {
  return `${g.anno}-${due(g.mese)}-${due(g.giorno)}`;
}

/** "2026-10-03" → Giorno; null se la stringa non è una data valida. */
export function giornoDa(iso: string): Giorno | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (m === null) return null;
  const anno = Number(m[1]);
  const mese = Number(m[2]);
  const giorno = Number(m[3]);
  const d = new Date(Date.UTC(anno, mese - 1, giorno));
  if (d.getUTCFullYear() !== anno || d.getUTCMonth() !== mese - 1 || d.getUTCDate() !== giorno) return null;
  return { giorno, mese, anno };
}

/** Giorno + n giorni (calendario puro, in UTC: niente ora legale di mezzo). */
export function aggiungiGiorni(g: Giorno, n: number): Giorno {
  const d = new Date(Date.UTC(g.anno, g.mese - 1, g.giorno + n));
  return { giorno: d.getUTCDate(), mese: d.getUTCMonth() + 1, anno: d.getUTCFullYear() };
}

function giornoSettimana(g: Giorno): number {
  return new Date(Date.UTC(g.anno, g.mese - 1, g.giorno)).getUTCDay();
}

function sabatoDa(g: Giorno): Sabato {
  return { iso: isoDa(g), giorno: g };
}

function minutiDa(hhmm: string): number {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m ?? 0);
}

/* ------------------------------------------------------------------ adesso, a Roma */

/** `?oggi=` dalla query string, o null. Accetta "2026-10-03" e "2026-10-03T12:30". */
export function leggiOggiFinto(search: string): string | null {
  const v = new URLSearchParams(search).get('oggi');
  if (v === null) return null;
  const pulito = v.trim().replace(' ', 'T');
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(pulito) ? pulito : null;
}

/** L'istante di adesso a Roma, oppure quello finto di `?oggi=`. */
export function adessoRoma(finto: string | null = null, adesso: Date = new Date()): Istante {
  if (finto !== null) {
    const [data, ora] = finto.split('T');
    const g = giornoDa(data ?? '');
    if (g !== null) {
      return { iso: isoDa(g), giorno: g, settimana: giornoSettimana(g), minuti: minutiDa(ora ?? '09:00') };
    }
  }
  const parti = new Intl.DateTimeFormat('en-GB', {
    timeZone: CALENDARIO.fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(adesso);
  const val = (tipo: Intl.DateTimeFormatPartTypes): number =>
    Number(parti.find((p) => p.type === tipo)?.value ?? '0');
  const g: Giorno = { giorno: val('day'), mese: val('month'), anno: val('year') };
  return { iso: isoDa(g), giorno: g, settimana: giornoSettimana(g), minuti: val('hour') * 60 + val('minute') };
}

/* ------------------------------------------------------------------ i sabati */

/** Il sabato della pagina: quello che viene, oggi se è sabato. */
export function prossimoSabato(oggi: Istante): Sabato {
  const mancano = (SABATO - oggi.settimana + 7) % 7;
  return sabatoDa(aggiungiGiorni(oggi.giorno, mancano));
}

function chiuso(s: Sabato): boolean {
  return (CALENDARIO.sabatiChiusi as readonly string[]).includes(s.iso);
}

/** Il primo sabato non di chiusura da `s` in poi (s compreso), e il primo chiuso saltato. */
function primoAperto(s: Sabato): { sabato: Sabato; saltato: Sabato | null } {
  let corrente = s;
  let saltato: Sabato | null = null;
  // al massimo qualche settimana di chiusure di fila: il limite evita cicli con dati sbagliati
  for (let i = 0; i < 12 && chiuso(corrente); i += 1) {
    if (saltato === null) saltato = corrente;
    corrente = sabatoDa(aggiungiGiorni(corrente.giorno, 7));
  }
  return { sabato: corrente, saltato };
}

/** Tutto il calendario del concept per un istante (puro). */
export function calendario(oggi: Istante): Calendario {
  const testata = prossimoSabato(oggi);
  const scadenza = minutiDa(CALENDARIO.scadenzaVenerdi);
  const tardiOra = oggi.settimana === SABATO || (oggi.settimana === VENERDI && oggi.minuti > scadenza);
  const tardi = tardiOra ? testata : null;
  const base = tardiOra ? sabatoDa(aggiungiGiorni(testata.giorno, 7)) : testata;
  const primo = primoAperto(base);
  const secondo = primoAperto(sabatoDa(aggiungiGiorni(primo.sabato.giorno, 7)));
  return {
    oggi,
    testata,
    proposti: [primo.sabato, secondo.sabato],
    tardi,
    chiuso: primo.saltato ?? secondo.saltato,
  };
}
