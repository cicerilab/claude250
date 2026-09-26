/**
 * CONTROPELO · prezzi e durate di esempio (copywriter).
 *
 * UNICA fonte di prezzi, durate e mezz'ore del concept (brand-strategist §7):
 * il listino sul vetro (specchio 1), la barba (specchio 2), la riga di
 * scrittura e l'agenda della lista leggono tutti da qui. Nessun prezzo o
 * durata scritto altrove.
 *
 * Prezzi verosimili per una barberia di quartiere a Pordenone nel 2026, in
 * euro, IVA inclusa, pagamento in salone. Tondi, senza "da", senza asterischi.
 * Sono ESEMPI per un concept: nessun dato legale.
 *
 * Solo dati: nessun calcolo, nessun accesso al browser.
 */

/* ------------------------------------------------------------------ tipi */

/**
 * Le quattro parole della riga di scrittura. Coincide con `Servizio` di
 * state/store.ts (tech-architect §6.1): lo scaffold può importarlo da qui.
 */
export type Servizio = 'taglio' | 'barba' | 'taglio-barba' | 'rasatura';

/** Le sette voci del listino sul vetro dello specchio 1. */
export type VoceListino =
  | 'taglio'
  | 'taglio-barba'
  | 'barba'
  | 'rasatura'
  | 'sfumatura'
  | 'bambini'
  | 'macchinetta';

/* ------------------------------------------------------------------ passo */

/** Le mezz'ore fisse della lista. Uguale a ORARI.passo (content/orari.ts). */
export const PASSO_MINUTI = 30;

/* ------------------------------------------------------------------ listino */

/**
 * Prezzo in euro e durata in minuti di ogni voce del listino.
 * `servizio` dice quale parola della riga di scrittura la copre.
 */
export const LISTINO = {
  taglio: { prezzo: 22, minuti: 30, servizio: 'taglio' },
  'taglio-barba': { prezzo: 34, minuti: 60, servizio: 'taglio-barba' },
  barba: { prezzo: 16, minuti: 30, servizio: 'barba' },
  rasatura: { prezzo: 20, minuti: 30, servizio: 'rasatura' },
  sfumatura: { prezzo: 25, minuti: 30, servizio: 'taglio' },
  bambini: { prezzo: 15, minuti: 30, servizio: 'taglio' },
  macchinetta: { prezzo: 15, minuti: 30, servizio: 'taglio' },
} as const satisfies Record<VoceListino, { prezzo: number; minuti: number; servizio: Servizio }>;

/** Ordine delle voci sul vetro (brand-strategist §5.3). */
export const ORDINE_LISTINO = [
  'taglio',
  'taglio-barba',
  'barba',
  'rasatura',
  'sfumatura',
  'bambini',
  'macchinetta',
] as const satisfies readonly VoceListino[];

/* ------------------------------------------------------------------ servizi prenotabili */

/**
 * Le quattro parole della riga di scrittura: quante mezz'ore occupano e che
 * prezzo si scrive accanto quando si sceglie (quello della voce base).
 * `taglio-barba` occupa due mezz'ore consecutive: la seconda riga si segna
 * con il tratto tratteggiato.
 */
export const SERVIZI = {
  taglio: { mezzore: 1, prezzo: LISTINO.taglio.prezzo, voce: 'taglio' },
  barba: { mezzore: 1, prezzo: LISTINO.barba.prezzo, voce: 'barba' },
  'taglio-barba': { mezzore: 2, prezzo: LISTINO['taglio-barba'].prezzo, voce: 'taglio-barba' },
  rasatura: { mezzore: 1, prezzo: LISTINO.rasatura.prezzo, voce: 'rasatura' },
} as const satisfies Record<Servizio, { mezzore: 1 | 2; prezzo: number; voce: VoceListino }>;

/** Ordine delle quattro parole nella riga di scrittura (CD §7.2). */
export const ORDINE_SERVIZI = ['taglio', 'barba', 'taglio-barba', 'rasatura'] as const satisfies readonly Servizio[];

/* ------------------------------------------------------------------ la rasatura, passo per passo */

/**
 * Specchio 2 (Denis): i passaggi della rasatura con panno caldo, con i minuti.
 * La somma (28) sta nella mezz'ora di LISTINO.rasatura.
 */
export const RASATURA_PASSAGGI = {
  pannoCaldo: 3,
  sapone: 2,
  conIlPelo: 10,
  contropelo: 10,
  dopobarba: 3,
} as const;

export const ORDINE_RASATURA = ['pannoCaldo', 'sapone', 'conIlPelo', 'contropelo', 'dopobarba'] as const satisfies readonly (keyof typeof RASATURA_PASSAGGI)[];

/* ------------------------------------------------------------------ fuori listino */

/**
 * Voci che non stanno sul vetro del listino ma compaiono nel testo dello
 * specchio 2 (barba lunga) e nel pannello Informazioni (collo e basette).
 */
export const FUORI_LISTINO = {
  /** Barba lunga in forma: forbice, pettine, contorno a lama. Stesso prezzo della barba. */
  barbaLunga: { prezzo: LISTINO.barba.prezzo, minuti: 30 },
  /** Collo e basette tra un taglio e l'altro, senza appuntamento se c'è un momento. */
  colloBasette: { prezzo: 8, minuti: 10 },
} as const;

/* ------------------------------------------------------------------ regole con un numero */

/** Numeri delle regole del salone (brand-strategist §1.6). */
export const REGOLE_NUMERI = {
  /** Si arriva qualche minuto prima. */
  arrivoPrimaMinuti: 5,
  /** Dopo questo ritardo il barbiere può prendere chi aspetta. */
  ritardoMinuti: 10,
  /** Età massima per il prezzo bambini, e sotto la quale serve un adulto. */
  bambiniFinoAnni: 12,
  /** Quanti giorni lavorativi avanti si può scrivere il nome (CD §7.1). */
  giorniPrenotabili: 6,
  /** Per un matrimonio: con quanto anticipo conviene scriversi. */
  matrimonioGiorniPrima: 7,
} as const;
