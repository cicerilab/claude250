/**
 * SOTTOSCOCCA · dati del mestiere (copywriter).
 *
 * Una sola fonte per punti, lavori, durate, ponti, orari, listino gomme e
 * deposito. Tipi e id fissati dal tech-architect (§6.4): non si rinominano.
 * I testi (nomi, segnali, frasi) stanno in `testi.ts`; qui solo numeri e id.
 *
 * Prezzi: indicativi 2026, IVA inclusa, per privati (brand-strategist §7).
 * Orari e minuti: minuti da mezzanotte (8:00 = 480).
 * Nessun accesso al browser: il file è puro e si può leggere in prerender.
 */

/* ================================================================== tipi (§6.4) */

export type Quota = 0 | 20 | 80 | 180;
export type Ponte = 1 | 2 | 3;
export type IdPunto =
  | 'ruota-anteriore'
  | 'ruota-posteriore'
  | 'freni'
  | 'sospensioni'
  | 'olio'
  | 'scarico';
export type IdPezzo =
  | IdPunto
  | 'catalizzatore'
  | 'silenziatore'
  | 'filtro'
  | 'disco'
  | 'pinza'
  | 'molla'
  | 'ammortizzatore';
export type IdLavoro =
  | 'gomme-stagionali'
  | 'gomme-deposito'
  | 'convergenza'
  | 'pastiglie'
  | 'pastiglie-dischi'
  | 'ammortizzatori'
  | 'tagliando'
  | 'scarico';

/** Reparto del lavoro: decide il ponte (vedi `pontiAdatti`). */
export type Reparto = 'gomme' | 'meccanica';

export interface DatiPunto {
  /** Quote in cui il punto compare sulla scena (tutti a 180). */
  quote: readonly Quota[];
  /** Pezzi della scena che diventano bianchi quando il punto è toccato. */
  pezzi: readonly IdPezzo[];
  /** Lavori proposti nella scheda del punto, nell'ordine in cui compaiono. */
  lavori: readonly IdLavoro[];
}

export interface DatiLavoro {
  /** Tempo sul ponte in minuti (CD 4.3, brand-strategist 7.3). */
  minuti: number;
  /** Ponti su cui il lavoro si fa DA SOLO. Con altri lavori vale `pontiAdatti`. */
  ponti: readonly Ponte[];
  /** Prezzo indicativo di partenza in euro, IVA inclusa. */
  prezzoDa: number;
  /** Fine della forbice di prezzo; `null` se il prezzo è uno solo. */
  prezzoA: number | null;
  reparto: Reparto;
}

export interface DatiPonte {
  tipo: 'due-colonne' | 'forbice';
  portataKg: number;
}

export interface Orari {
  /** Lunedì-venerdì mattina, [inizio, fine] in minuti. */
  mattina: readonly [number, number];
  /** Lunedì-venerdì pomeriggio. */
  pomeriggio: readonly [number, number];
  /** Sabato, solo ponte 3; `null` se chiuso. */
  sabato: readonly [number, number] | null;
}

export interface MisuraGomme {
  /** Misura scritta per intero, come sul fianco. */
  misura: string;
  /** Montaggio ed equilibratura di 4 gomme, euro. */
  montaggio: number;
  /** Tempo sul ponte 3. */
  minuti: number;
}

/* ================================================================== punti toccabili */

/**
 * I sei punti. Ordine delle chiavi = ordine davanti → dietro (tabulazione,
 * elenco "Da qui si vede"): vedi anche `ORDINE_PUNTI`.
 * I nomi dei pezzi coincidono con i nomi delle mesh del webgl-artist.
 */
export const PUNTI = {
  'ruota-anteriore': {
    quote: [20, 180],
    pezzi: ['ruota-anteriore'],
    lavori: ['gomme-stagionali', 'gomme-deposito'],
  },
  freni: {
    quote: [80, 180],
    pezzi: ['disco', 'pinza'],
    lavori: ['pastiglie', 'pastiglie-dischi'],
  },
  sospensioni: {
    quote: [80, 180],
    pezzi: ['molla', 'ammortizzatore'],
    lavori: ['ammortizzatori'],
  },
  olio: {
    quote: [180],
    pezzi: ['olio', 'filtro'],
    lavori: ['tagliando'],
  },
  scarico: {
    quote: [180],
    pezzi: ['scarico', 'catalizzatore', 'silenziatore'],
    lavori: ['scarico'],
  },
  'ruota-posteriore': {
    quote: [20, 180],
    pezzi: ['ruota-posteriore'],
    lavori: ['convergenza'],
  },
} as const satisfies Record<IdPunto, DatiPunto>;

/** Davanti → dietro. La convergenza sta sulla ruota posteriore, per ultima. */
export const ORDINE_PUNTI = [
  'ruota-anteriore',
  'freni',
  'sospensioni',
  'olio',
  'scarico',
  'ruota-posteriore',
] as const satisfies readonly IdPunto[];

/** I punti di una quota, in ordine davanti → dietro. A 0 cm non ce ne sono. */
export function puntiDellaQuota(quota: Quota): IdPunto[] {
  return ORDINE_PUNTI.filter((id) => (PUNTI[id].quote as readonly Quota[]).includes(quota));
}

/* ================================================================== lavori */

/**
 * Durate identiche alla tabella del creative-director (4.3), prezzi del
 * brand-strategist (7.1, 7.3). `ponti` è il ponte del lavoro fatto da solo.
 */
export const LAVORI = {
  'gomme-stagionali': { minuti: 40, ponti: [3], prezzoDa: 48, prezzoA: 64, reparto: 'gomme' },
  'gomme-deposito': { minuti: 30, ponti: [3], prezzoDa: 48, prezzoA: 64, reparto: 'gomme' },
  convergenza: { minuti: 30, ponti: [3], prezzoDa: 55, prezzoA: null, reparto: 'gomme' },
  pastiglie: { minuti: 60, ponti: [1, 2], prezzoDa: 110, prezzoA: 160, reparto: 'meccanica' },
  'pastiglie-dischi': { minuti: 90, ponti: [1, 2], prezzoDa: 240, prezzoA: 340, reparto: 'meccanica' },
  ammortizzatori: { minuti: 120, ponti: [1, 2], prezzoDa: 280, prezzoA: 420, reparto: 'meccanica' },
  tagliando: { minuti: 90, ponti: [1, 2], prezzoDa: 190, prezzoA: 260, reparto: 'meccanica' },
  scarico: { minuti: 60, ponti: [1, 2], prezzoDa: 160, prezzoA: 290, reparto: 'meccanica' },
} as const satisfies Record<IdLavoro, DatiLavoro>;

/** Ordine dei lavori nel parcheggio "Cosa facciamo?" e nella barra. */
export const ORDINE_LAVORI = [
  'gomme-stagionali',
  'gomme-deposito',
  'convergenza',
  'pastiglie',
  'pastiglie-dischi',
  'ammortizzatori',
  'tagliando',
  'scarico',
] as const satisfies readonly IdLavoro[];

/**
 * Lavori che si escludono: aggiungerne uno toglie l'altro dello stesso gruppo
 * (ux §5.0, "si sostituiscono, e l'annuncio lo dice").
 */
export const ESCLUSIVI = [
  ['gomme-stagionali', 'gomme-deposito'],
  ['pastiglie', 'pastiglie-dischi'],
] as const satisfies readonly (readonly IdLavoro[])[];

/** L'altro lavoro del gruppo esclusivo, se c'è. */
export function esclusoDa(id: IdLavoro): IdLavoro | null {
  for (const gruppo of ESCLUSIVI) {
    const lista = gruppo as readonly IdLavoro[];
    if (lista.includes(id)) return lista.find((altro) => altro !== id) ?? null;
  }
  return null;
}

/** C'è un cambio gomme nel lavoro (fa comparire la domanda del deposito). */
export function haCambioGomme(ids: readonly IdLavoro[]): boolean {
  return ids.includes('gomme-stagionali') || ids.includes('gomme-deposito');
}

/**
 * Durata del blocco in minuti: somma dei tempi. Il cambio gomme stagionale
 * conta 30' invece di 40' se le gomme sono già in deposito (CD 4.4).
 * Da usare in `selDurata` dello store, così la regola sta in un posto solo.
 */
export function durataMinuti(ids: readonly IdLavoro[], gommeGiaInDeposito: boolean | null): number {
  let totale = 0;
  for (const id of ids) {
    if (id === 'gomme-stagionali' && gommeGiaInDeposito === true) {
      totale += LAVORI['gomme-deposito'].minuti;
    } else {
      totale += LAVORI[id].minuti;
    }
  }
  return totale;
}

/**
 * Ponti adatti al blocco (ux §5.0, brand-strategist 7.3):
 * solo gomme e convergenza → ponte 3; basta un lavoro di meccanica → ponte 1
 * o 2, che fanno anche le gomme. Non è un'intersezione: con gomme + freni la
 * risposta è [1, 2], mai vuota. Nessun lavoro → [].
 */
export function pontiAdatti(ids: readonly IdLavoro[]): Ponte[] {
  if (ids.length === 0) return [];
  const conMeccanica = ids.some((id) => LAVORI[id].reparto === 'meccanica');
  return conMeccanica ? [1, 2] : [3];
}

/* ================================================================== ponti e orari */

/** Targhette dei ponti (brand-strategist 1.6). */
export const PONTI = {
  1: { tipo: 'due-colonne', portataKg: 3500 },
  2: { tipo: 'due-colonne', portataKg: 4000 },
  3: { tipo: 'forbice', portataKg: 3000 },
} as const satisfies Record<Ponte, DatiPonte>;

export const ORDINE_PONTI = [1, 2, 3] as const satisfies readonly Ponte[];

/**
 * Lun-ven 8:00-12:30 e 14:00-18:30; sabato 8:00-12:00, solo ponte 3
 * (brand-strategist §9, confermato qui). Pausa 12:30-14:00: "chiuso", non un buco.
 */
export const ORARI = {
  mattina: [480, 750],
  pomeriggio: [840, 1110],
  sabato: [480, 720],
} as const satisfies Orari;

/** Ponti aperti il sabato. */
export const PONTI_SABATO = [3] as const satisfies readonly Ponte[];

/** Passo di aggancio del blocco nel planning, in minuti. */
export const PASSO_MINUTI = 10;

/**
 * Blocco più lungo prenotabile: mezza giornata (4 h 30), perché il blocco non
 * attraversa la pausa (ux P10). Oltre: "giornata intera" o togliere un lavoro.
 */
export const MINUTI_MAX_BLOCCO = 270;

/** Giorni lavorativi mostrati nella striscia (lun-sab). */
export const GIORNI_MOSTRATI = 6;

/** Oggi si prenota solo da "adesso + 60 minuti" in poi (ux §5.6). */
export const ANTICIPO_MINIMO_MINUTI = 60;

/* ================================================================== gomme */

/** Listino per le misure più comuni (brand-strategist 7.1). */
export const MISURE_GOMME = [
  { misura: '195/65 R15', montaggio: 48, minuti: 40 },
  { misura: '205/55 R16', montaggio: 56, minuti: 40 },
  { misura: '225/45 R17', montaggio: 64, minuti: 40 },
] as const satisfies readonly MisuraGomme[];

/** Gomma nuova di fascia media, a pezzo, per la misura più piccola del listino. */
export const GOMMA_NUOVA_DA = 74;

/** Battistrada in millimetri (brand-strategist, lessico). */
export const BATTISTRADA = { legge: 1.6, consigliato: 3, invernali: 4 } as const;

/* ================================================================== deposito */

export const DEPOSITO = {
  /** Una stagione, circa 6 mesi, treno di 4. */
  stagione: 40,
  /** Un anno: i due treni a turno. */
  anno: 70,
  /** Numero di esempio del cartellino (sezione Deposito, formato del campo). */
  esempio: 'D-214',
} as const;

/**
 * Formato del numero di deposito: una D e tre cifre. Accetta anche minuscolo
 * e senza trattino (`d214`); si normalizza con `normalizzaDeposito`.
 */
export const DEPOSITO_FORMATO = /^\s*[dD]\s*-?\s*(\d{3})\s*$/;

/** "d214" → "D-214"; `null` se il formato non torna. */
export function normalizzaDeposito(valore: string): string | null {
  const trovato = DEPOSITO_FORMATO.exec(valore);
  return trovato && trovato[1] ? `D-${trovato[1]}` : null;
}

/* ================================================================== planning di esempio */

/**
 * Tipi di lavoro scritti nei blocchi occupati (brand-strategist 5.6). Mai nomi,
 * targhe o modelli. `genera.ts` sceglie solo tra questi: 'gomme' e
 * 'convergenza' vanno sul ponte 3, gli altri sui ponti 1 e 2.
 */
export type Occupato = 'tagliando' | 'gomme' | 'freni' | 'convergenza' | 'furgone' | 'diagnosi';

export const OCCUPATI_PER_PONTE = {
  1: ['tagliando', 'freni', 'diagnosi'],
  2: ['tagliando', 'freni', 'furgone', 'diagnosi'],
  3: ['gomme', 'convergenza'],
} as const satisfies Record<Ponte, readonly Occupato[]>;

/* ================================================================== recapiti (solo dati) */

/**
 * Dati di esempio. Il numero e l'email NON si mostrano mai: nel sito ci sono
 * solo i link "Chiama" e "Scrivi" (testi in `testi.ts`). Il repo è pubblico.
 */
export const RECAPITI_DATI = {
  via: 'Via Nuova di Corva',
  civico: '94',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  telefono: '0434 000 000',
  telefonoHref: 'tel:+390434000000',
  email: 'officina@sottoscocca.example',
  emailHref: 'mailto:officina@sottoscocca.example',
  /** Ricerca della via, non di un'attività. */
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Via%20Nuova%20di%20Corva%2C%20Pordenone',
  kenneyHref: 'https://kenney.nl/assets/car-kit',
} as const;
