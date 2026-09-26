/**
 * NOVANTA · listino di ESEMPIO 2026 (copywriter, dal brand-strategist §7).
 *
 * Prestazioni sanitarie esenti IVA: non si scrive "IVA inclusa", si scrive
 * "prezzi per seduta". Nessuna promessa sulla detraibilità dell'osteopatia,
 * nessuna percentuale, nessun riferimento normativo.
 */

/** Euro all'italiana: "65 €", "480 €", "1.200 €", "7,50 €". */
export function euro(valore: number): string {
  const intero = Math.floor(Math.abs(valore) + 1e-9);
  const centesimi = Math.round((Math.abs(valore) - intero) * 100);
  const interoTxt = String(intero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const testo = centesimi > 0 ? `${interoTxt},${String(centesimi).padStart(2, '0')}` : interoTxt;
  return `${valore < 0 ? 'meno ' : ''}${testo} €`;
}

/** Prezzi in euro, per chi li usa in una frase (30°, 90°, 120°). */
export const PREZZI = {
  primaVisita: 65,
  seduta: 55,
  ciclo5: 250,
  ciclo10: 480,
  riabilitazione: 60,
  primaOsteopatia: 70,
  osteopatia: 60,
  taping: 10,
  domicilio: 75,
} as const;

export type IdVoce =
  | 'prima-visita'
  | 'seduta'
  | 'ciclo-5'
  | 'ciclo-10'
  | 'riabilitazione'
  | 'prima-osteopatia'
  | 'osteopatia'
  | 'taping'
  | 'domicilio';

export interface VoceListino {
  readonly id: IdVoce;
  /** Nome della prestazione (dt). */
  readonly nome: string;
  /** Cosa comprende, una riga (dd, secondaria). Null se il nome basta. */
  readonly dettaglio: string | null;
  /** Durata a vista, cifre e "min". */
  readonly durata: string;
  /** Durata per il lettore di schermo. */
  readonly durataSr: string;
  /** Prezzo in euro. */
  readonly prezzo: number;
  /** Nota sul prezzo (prezzo a seduta dei cicli). Null se non serve. */
  readonly notaPrezzo: string | null;
}

/**
 * Il listino a 180°, in quest'ordine: fisioterapia, osteopatia, aggiunte.
 * I gruppi servono a mettere un filo tra blocchi senza fare schede.
 */
export const LISTINO = [
  {
    titolo: 'Fisioterapia',
    voci: [
      {
        id: 'prima-visita',
        nome: 'Prima visita',
        dettaglio: 'Colloquio, misura in gradi, primo trattamento, esercizi scritti.',
        durata: '60 min',
        durataSr: '60 minuti',
        prezzo: PREZZI.primaVisita,
        notaPrezzo: null,
      },
      {
        id: 'seduta',
        nome: 'Seduta',
        dettaglio: 'Anche il controllo a 7-10 giorni.',
        durata: '45 min',
        durataSr: '45 minuti',
        prezzo: PREZZI.seduta,
        notaPrezzo: null,
      },
      {
        id: 'ciclo-5',
        nome: 'Ciclo di 5 sedute',
        dettaglio: null,
        durata: '5 × 45 min',
        durataSr: '5 sedute da 45 minuti',
        prezzo: PREZZI.ciclo5,
        notaPrezzo: '50 € a seduta',
      },
      {
        id: 'ciclo-10',
        nome: 'Ciclo di 10 sedute',
        dettaglio: null,
        durata: '10 × 45 min',
        durataSr: '10 sedute da 45 minuti',
        prezzo: PREZZI.ciclo10,
        notaPrezzo: '48 € a seduta',
      },
      {
        id: 'riabilitazione',
        nome: 'Riabilitazione dopo intervento',
        dettaglio: 'Seduta più lunga, secondo le indicazioni del chirurgo.',
        durata: '60 min',
        durataSr: '60 minuti',
        prezzo: PREZZI.riabilitazione,
        notaPrezzo: null,
      },
    ],
  },
  {
    titolo: 'Osteopatia',
    voci: [
      {
        id: 'prima-osteopatia',
        nome: 'Prima seduta di osteopatia',
        dettaglio: null,
        durata: '60 min',
        durataSr: '60 minuti',
        prezzo: PREZZI.primaOsteopatia,
        notaPrezzo: null,
      },
      {
        id: 'osteopatia',
        nome: 'Seduta di osteopatia',
        dettaglio: null,
        durata: '45 min',
        durataSr: '45 minuti',
        prezzo: PREZZI.osteopatia,
        notaPrezzo: null,
      },
    ],
  },
  {
    titolo: 'In più',
    voci: [
      {
        id: 'taping',
        nome: 'Taping',
        dettaglio: 'Aggiunto a una seduta.',
        durata: '5-10 min',
        durataSr: 'da 5 a 10 minuti',
        prezzo: PREZZI.taping,
        notaPrezzo: null,
      },
      {
        id: 'domicilio',
        nome: 'Seduta a domicilio',
        dettaglio: 'A Pordenone città, solo dopo un intervento e su accordo.',
        durata: '45 min',
        durataSr: '45 minuti',
        prezzo: PREZZI.domicilio,
        notaPrezzo: null,
      },
    ],
  },
] as const satisfies readonly { titolo: string; voci: readonly VoceListino[] }[];

/** Prezzo a vista di una voce: "65 €". Con la nota dei cicli: "250 €" e sotto "50 € a seduta". */
export const prezzoVoce = (voce: VoceListino): string => euro(voce.prezzo);

/** Nome accessibile di una riga del listino (per chi legge la `dl` come testo unico). */
export const rigaListinoSr = (voce: VoceListino): string =>
  `${voce.nome}, ${voce.durataSr}, ${euro(voce.prezzo)}${voce.notaPrezzo ? `, cioè ${voce.notaPrezzo}` : ''}.`;
