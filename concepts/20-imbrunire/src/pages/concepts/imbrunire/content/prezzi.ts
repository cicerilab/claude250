/**
 * IMBRUNIRE · prezzi di esempio (copywriter).
 *
 * Solo dati: nessun calcolo qui dentro. Le formule vivono in dati/prezzo.ts
 * (scaffold) e sono descritte in docs/copywriter.md, sezione "Come si legge
 * prezzi.ts". Fonte: docs/brand-strategist.md §7.
 *
 * Prezzi verosimili per un piccolo albergo di centro a Pordenone, anno 2026,
 * in euro, IVA inclusa, PER NOTTE E PER LA STANZA (non a persona), colazione
 * inclusa. Sono ESEMPI per un concept: l'albergo non esiste, nessun dato legale.
 */

/* ------------------------------------------------------------------ tipi */

/**
 * Devono coincidere con i tipi di state/store.ts e dati/palazzo.ts
 * (tech-architect §6.1). Lo scaffold può importarli da qui o ridefinirli
 * uguali: TypeScript li confronta per struttura.
 */
export type SlugCamera =
  | 'il-noce'
  | 'il-campanile'
  | 'la-soffitta'
  | 'il-camino'
  | 'la-loggia'
  | 'sul-noncello'
  | 'la-corte';
export type SlugSpazio = 'androne' | 'colazione' | 'portico';
export type SlugCella = SlugCamera | SlugSpazio;
export type Ospiti = 1 | 2 | 3;

/* ------------------------------------------------------------ prezzo base */

/**
 * Prezzo di una notte da domenica a giovedì, per 1 o 2 ospiti (il "da" che si
 * vede sulle celle è questo numero). Ordine: dal più basso al più alto.
 */
export const PREZZO_BASE = {
  'la-soffitta': 112,
  'il-campanile': 128,
  'il-noce': 136,
  'la-corte': 142,
  'sul-noncello': 148,
  'la-loggia': 158,
  'il-camino': 178,
} as const satisfies Record<SlugCamera, number>;

/**
 * Uso singola: la doppia per una persona sola costa 15 € in meno a notte.
 * Si toglie PRIMA della maggiorazione del fine settimana.
 */
export const SCONTO_USO_SINGOLA = 15;

/**
 * Notti di venerdì e sabato: +15% sul prezzo della notte (già scontato se uso
 * singola), arrotondato all'euro con Math.round.
 * Esempi: Il Camino 178 → 205; La Soffitta 112 → 129; uso singola La Soffitta
 * 97 → 112.
 */
export const MAGGIORAZIONE_WEEKEND = 0.15;

/** Giorni della settimana delle notti maggiorate (0 = domenica, come Date.getUTCDay). */
export const NOTTI_WEEKEND = [5, 6] as const;

/** Terzo ospite: letto aggiunto (o divano letto), colazione inclusa, a notte. Nessuna maggiorazione weekend. */
export const LETTO_AGGIUNTO = 35;

/** Ospiti massimi per stanza. Il terzo solo in Il Camino e La Corte. */
export const OSPITI_MAX = {
  'il-noce': 2,
  'il-campanile': 2,
  'la-soffitta': 2,
  'il-camino': 3,
  'la-loggia': 2,
  'sul-noncello': 2,
  'la-corte': 3,
} as const satisfies Record<SlugCamera, 2 | 3>;

/* ------------------------------------------------------ tassa di soggiorno */

/**
 * Tassa (imposta) di soggiorno di ESEMPIO: fuori dal totale, si paga in
 * albergo, ma il pannello la dice in euro.
 * Formula: perPersonaNotte × ospiti × min(notti, nottiMassime).
 * Nel concept tutti gli ospiti contano come adulti (il pannello non chiede
 * l'età); l'esenzione sotto i 14 anni è detta a parole.
 */
export const TASSA_SOGGIORNO = {
  perPersonaNotte: 1.5,
  nottiMassime: 5,
  etaMinima: 14,
} as const;

/* ------------------------------------------------------------- accessori */

/** Voci fuori dal prezzo della stanza (dette nell'androne e nelle regole). */
export const ACCESSORI = {
  /** Garage convenzionato a 250 m, ogni 24 ore. */
  parcheggio: 12,
  /** Animale piccolo fino a 10 kg, a notte. Non nel sottotetto. */
  animale: 10,
  /** Peso massimo dell'animale, in kg. */
  animalePesoMax: 10,
  /** Colazione per un ospite esterno. */
  colazioneEsterno: 12,
  /** Colazione anticipata dalle 7:00, deposito bagagli, culla: gratis. */
  colazioneAnticipata: 0,
  depositoBagagli: 0,
  culla: 0,
} as const;

/** Distanza del garage convenzionato, in metri. */
export const PARCHEGGIO_METRI = 250;

/* ------------------------------------------------------ regole del soggiorno */

/** Cancellazione gratuita fino a N giorni prima dell'arrivo; dopo, si paga la prima notte. */
export const CANCELLAZIONE_GRATIS_GIORNI = 3;

/**
 * Nessun supplemento per Fiera, Pordenonelegge, Cinema Muto: il prezzo cambia
 * solo il venerdì e il sabato. Lo sconto per 7+ notti del brand-strategist è
 * OMESSO (ux-architect §5.5): non esiste nel concept.
 */
export const SUPPLEMENTO_EVENTI = 0;

/* ---------------------------------------------------------------- controllo */

/**
 * Casi di controllo per chi scrive dati/prezzo.ts (da mettere nel test).
 * Date verificate: 15/10/2026 è giovedì, 23/10/2026 venerdì, 10/11/2026 martedì.
 */
export const CASI_DI_CONTROLLO = [
  {
    // brand-strategist §7.2: 158 + 182 + 182
    slug: 'la-loggia',
    dal: '2026-10-15',
    notti: 3,
    ospiti: 2,
    camera: 522,
    lettoAggiunto: 0,
    tassa: 9,
    totale: 522,
  },
  {
    // ux-architect §5.5: 128 + 147 + 147
    slug: 'il-campanile',
    dal: '2026-10-15',
    notti: 3,
    ospiti: 2,
    camera: 422,
    lettoAggiunto: 0,
    tassa: 9,
    totale: 422,
  },
  {
    // ux-architect §4.1: 170 + 170
    slug: 'sul-noncello',
    dal: '2026-10-23',
    notti: 2,
    ospiti: 2,
    camera: 340,
    lettoAggiunto: 0,
    tassa: 6,
    totale: 340,
  },
  {
    // ux-architect §4.2: uso singola 97 × 3 (martedì, mercoledì, giovedì)
    slug: 'la-soffitta',
    dal: '2026-11-10',
    notti: 3,
    ospiti: 1,
    camera: 291,
    lettoAggiunto: 0,
    tassa: 4.5,
    totale: 291,
  },
  {
    // Il Camino in tre, venerdì e sabato: 205 + 205 + letto aggiunto 35 × 2
    slug: 'il-camino',
    dal: '2026-10-16',
    notti: 2,
    ospiti: 3,
    camera: 410,
    lettoAggiunto: 70,
    tassa: 9,
    totale: 480,
  },
] as const satisfies readonly {
  slug: SlugCamera;
  dal: string;
  notti: number;
  ospiti: Ospiti;
  camera: number;
  lettoAggiunto: number;
  tassa: number;
  totale: number;
}[];
