/**
 * NODI · dati del mestiere (copywriter).
 *
 * Solo dati, nessun calcolo. I tipi sono quelli fissati dal tech-architect
 * (§6.4): lo store li importa da qui, così la fonte è una sola.
 *
 * Tutto è DI ESEMPIO per un concept: prezzi verosimili per una bottega di due
 * liutai nel Nord Est nel 2026, IVA inclusa, per privati. Nessun dato legale.
 * I nomi delle riparazioni e le frasi stanno in testi.ts.
 */

/* ------------------------------------------------------------------ tipi */

export type Strumento = 'violino' | 'viola' | 'violoncello';

/** I tre modi che il liutaio guarda (numerazione di Hutchins). */
export type Modo = 1 | 2 | 5;

/** Le cinque zone del piano del suono (stesse chiavi dello store). */
export type ZonaVoce =
  | 'scura-morbida'
  | 'scura-pronta'
  | 'brillante-morbida'
  | 'brillante-pronta'
  | 'equilibrata';

export interface VoceListino {
  strumento: Strumento;
  /** Euro, intero: "a partire da". */
  prezzoDa: number;
  /** Acconto quando si entra in lista, dopo la prova in bottega. */
  acconto: number;
  /** Mesi al banco, da quando tocca a te in lista. */
  mesi: { min: number; max: number };
  /** Nota d'esempio del bottone "Senti la voce" (CD §4.4). */
  notaEsempio: { nome: string; hz: number };
}

export interface PostoInLista {
  numero: number;
  /** In parole: "primavera 2028". */
  consegna: string;
}

export interface Riparazione {
  id: string;
  /** Euro, intero, "da". */
  prezzoDa: number;
}

/* ------------------------------------------------------------ strumenti */

export const STRUMENTI: readonly VoceListino[] = [
  {
    strumento: 'violino',
    prezzoDa: 9500,
    acconto: 1500,
    mesi: { min: 3, max: 4 },
    notaEsempio: { nome: 'La', hz: 440 },
  },
  {
    strumento: 'viola',
    prezzoDa: 11000,
    acconto: 1500,
    mesi: { min: 4, max: 5 },
    notaEsempio: { nome: 'Do', hz: 131 },
  },
  {
    strumento: 'violoncello',
    prezzoDa: 19500,
    acconto: 3000,
    mesi: { min: 6, max: 8 },
    notaEsempio: { nome: 'Do', hz: 65 },
  },
];

/** Ordine di presentazione (radio, Costruire). */
export const ORDINE_STRUMENTI = ['violino', 'viola', 'violoncello'] as const;

/** Strumenti costruiti in un anno, in due persone. */
export const STRUMENTI_ANNO = 7;

/**
 * Lista d'attesa: una lista sola per tutti gli strumenti, quindi il numero è
 * lo stesso; cambia la stagione di consegna (il violoncello è più lungo).
 * Coerente con 7 strumenti l'anno, 6 persone davanti, settembre 2026.
 * Valori fissi: nessun contatore.
 */
export const LISTA: Record<Strumento, PostoInLista> = {
  violino: { numero: 7, consegna: 'primavera 2028' },
  viola: { numero: 7, consegna: 'estate 2028' },
  violoncello: { numero: 7, consegna: 'autunno 2028' },
};

/** Varianti a pagamento, citate una volta sola in Costruire. */
export const VARIANTI = {
  verniceAnticataDa: 600,
  fondoInUnPezzoDa: 400,
} as const;

/** Promesse di servizio (brand-strategist §8), come numeri. */
export const SERVIZIO = {
  rispostaGiorni: 2,
  regolazioniAnni: 1,
  /** Se dopo la consegna la voce non va, si regola; se dopo un mese ancora no, acconto restituito. */
  ripensamentoMesi: 1,
  /** Strumento in prestito agli studenti se la riparazione dura più di così. */
  prestitoOltreGiorni: 7,
} as const;

/* ---------------------------------------------------------- riparazioni */

/**
 * Elenco corto delle riparazioni comuni, in ordine di frequenza in bottega.
 * Gli id sono le chiavi di RIPARAZIONI in testi.ts (nome, tempo, evidenza).
 */
export const RIPARAZIONI: readonly Riparazione[] = [
  { id: 'anima-rimessa', prezzoDa: 30 },
  { id: 'anima-nuova', prezzoDa: 60 },
  { id: 'regolazione', prezzoDa: 90 },
  { id: 'ponticello', prezzoDa: 150 },
  { id: 'ponticello-violoncello', prezzoDa: 220 },
  { id: 'crine', prezzoDa: 65 },
  { id: 'crine-violoncello', prezzoDa: 75 },
  { id: 'capotasto', prezzoDa: 70 },
  { id: 'tastiera-ripassata', prezzoDa: 90 },
  { id: 'tastiera-nuova', prezzoDa: 280 },
  { id: 'scollatura', prezzoDa: 60 },
  { id: 'crepa-tavola', prezzoDa: 120 },
  { id: 'crepa-apertura', prezzoDa: 450 },
  { id: 'cavigliere', prezzoDa: 250 },
  { id: 'innesto', prezzoDa: 900 },
];

/** Il sabato di bottega: fascia e quanti sabati proporre. */
export const SABATO = { dalle: '9:00', alle: '12:30', quanti: 4 } as const;

/**
 * Sabati in cui la bottega è chiusa se cadono di sabato (festivi nazionali),
 * come "MM-DD". Il calcolo dei prossimi quattro (sections/Riparazioni/sabati.ts)
 * li salta. Niente ferie inventate.
 */
export const SABATI_FESTIVI = [
  '01-01',
  '01-06',
  '04-25',
  '05-01',
  '06-02',
  '08-15',
  '11-01',
  '12-08',
  '12-25',
  '12-26',
] as const;

/* --------------------------------------------------------------- misure */

/**
 * Misure della tavola d'esempio del sito, citate nei testi con "circa".
 * Le frequenze coincidono con risonanza/modi.ts (fonte per il codice: quella).
 * Le fasce "nelle tavole vere" vengono da Jansson (fig. 5.17) e Hutchins.
 */
export const MISURE = {
  hz: { 1: 92, 2: 168, 5: 348 } as Record<Modo, number>,
  fasciaHz: {
    1: { da: 80, a: 100 },
    2: { da: 150, a: 180 },
    5: { da: 320, a: 370 },
  } as Record<Modo, { da: number; a: number }>,
  /** Peso della tavola d'esempio con la catena, in grammi. Non è un dato di letteratura. */
  pesoTavolaG: 70,
  spessoreMm: 2.8,
  lunghezzaMm: 356,
  /** Anni di stagionatura minimi in bottega. */
  stagionaturaAnni: 8,
  /** La voce sposta il modo 5 in questa fascia (risonanza/modi.ts VOCE_HZ). */
  voceHz: { min: 330, max: 366 },
} as const;
