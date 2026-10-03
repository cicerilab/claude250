/**
 * NOVANTA · ore della prenotazione come stringhe stabili (tech-architect §6.1).
 *
 * `SlotId` = 'AAAA-MM-GG@HH:MM', ora locale: è la chiave che passa tra
 * anello, elenco delle ore, modulo, esito, file .ics e memoria. Qui solo
 * conversioni pure (nessun calcolo di disponibilità: quello è di
 * sections/Prenota/calendario.ts). Nessun accesso al browser.
 */

import type { IndiceGiorno, Quando } from '../content/testi';
import type { SlotId } from './store';

export interface SlotLetto {
  /** 'AAAA-MM-GG' */
  readonly data: string;
  /** 'HH:MM' */
  readonly ora: string;
}

/** Compone lo slot da data e ora. */
export function slotId(data: string, ora: string): SlotId {
  return `${data}@${ora}`;
}

/** 'AAAA-MM-GG@HH:MM' → { data, ora }; null se la forma non torna. */
export function leggiSlot(id: SlotId): SlotLetto | null {
  const m = /^(\d{4}-\d{2}-\d{2})@(\d{2}:\d{2})$/.exec(id);
  if (m === null || m[1] === undefined || m[2] === undefined) return null;
  return { data: m[1], ora: m[2] };
}

/** Data locale (con l'ora) dello slot; null se non valido. */
export function dataDaSlot(id: SlotId): Date | null {
  const s = leggiSlot(id);
  if (s === null) return null;
  const [a, me, g] = s.data.split('-').map(Number);
  const [h, mi] = s.ora.split(':').map(Number);
  if (a === undefined || me === undefined || g === undefined || h === undefined || mi === undefined) return null;
  const d = new Date(a, me - 1, g, h, mi, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Giorno della settimana con lunedì = 0 … domenica = 6 (come l'anello e content/testi.ts). */
export function giornoSettimana(d: Date): IndiceGiorno {
  return ((d.getDay() + 6) % 7) as IndiceGiorno;
}

/** Lo slot nella forma che vogliono le frasi del copywriter (`quandoBreve`, `quandoFrase`…). */
export function quandoDaSlot(id: SlotId): Quando | null {
  const d = dataDaSlot(id);
  const s = leggiSlot(id);
  if (d === null || s === null) return null;
  return { giorno: giornoSettimana(d), data: d.getDate(), mese: d.getMonth(), ora: s.ora };
}

/** Giorni interi tra due date 'AAAA-MM-GG' (b − a), indipendente dall'ora legale. */
export function giorniTra(a: string, b: string): number {
  const [aa, am, ag] = a.split('-').map(Number);
  const [ba, bm, bg] = b.split('-').map(Number);
  const ua = Date.UTC(aa ?? 0, (am ?? 1) - 1, ag ?? 1);
  const ub = Date.UTC(ba ?? 0, (bm ?? 1) - 1, bg ?? 1);
  return Math.round((ub - ua) / 86400000);
}
