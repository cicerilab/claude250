/**
 * IMBRUNIRE · tutti i testi visibili del sito (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui (etichette,
 * aria-label, annunci aria-live compresi). Se manca una stringa si chiede al
 * copywriter, non si inventa nel componente. Gli alt delle foto sono del
 * photo-editor (assets/foto/index.ts).
 *
 * Nessun trattino lungo o medio, nessun punto esclamativo, un solo puntino di
 * sospensione (PRENOTA.invio.inCorso, voluto dal creative-director), nessun
 * occhiello numerato. "Scegli le lune" è l'unico richiamo a prenotare; le sue
 * forme sono "Le mie notti qui" e "Tienimi la stanza".
 *
 * Le funzioni mettono valori già pronti dentro frasi già scritte: non
 * calcolano prezzi (dati/prezzo.ts) e non formattano date o euro con Intl
 * (core/date.ts, dati/prezzo.ts). Ricevono le date come PartiData e gli
 * importi come stringhe già formattate da euro().
 */

import type { Ospiti, SlugCamera, SlugCella, SlugSpazio } from './prezzi';

/* ================================================================== tipi di scambio */

/**
 * Una data civile di Pordenone già scomposta con Intl in it-IT (core/date.ts).
 * Esempio per 2026-10-15: { settimana: 'giovedì', giorno: 15, mese: 'ottobre', anno: 2026 }.
 * `settimana` e `mese` in minuscolo, come li dà Intl in italiano.
 */
export interface PartiData {
  settimana: string;
  giorno: number;
  mese: string;
  anno: number;
}

/** Stessi valori di NomeFase in luna/fasi.ts (tech-architect §6.11). */
export type NomeFase =
  | 'nuova'
  | 'falce-crescente'
  | 'primo-quarto'
  | 'gibbosa-crescente'
  | 'piena'
  | 'gibbosa-calante'
  | 'ultimo-quarto'
  | 'falce-calante';

/** Il sottoinsieme di InfoLuna (luna/fasi.ts) che serve alle frasi. InfoLuna lo soddisfa così com'è. */
export interface LunaPerTesto {
  fase: NomeFase;
  percento: number;
  crescente: boolean;
}

/* ================================================================== aiuti di lingua */

/** Prima lettera maiuscola: "giovedì 15" → "Giovedì 15". */
export function maiuscola(testo: string): string {
  return testo.length > 0 ? testo.charAt(0).toUpperCase() + testo.slice(1) : testo;
}

/** "Il Noce" / "Il Noce e La Corte" / "Il Noce, La Corte e La Soffitta". */
export function elenco(voci: readonly string[]): string {
  if (voci.length === 0) return '';
  const ultima = voci[voci.length - 1] ?? '';
  if (voci.length === 1) return ultima;
  return `${voci.slice(0, -1).join(', ')} e ${ultima}`;
}

/** Numeri piccoli in parole, per le frasi ("Mancano due cose"). Oltre il dieci, cifre. */
export function inParole(n: number): string {
  const parole = ['zero', 'una', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci'];
  return parole[n] ?? String(n);
}

/** "1 notte", "3 notti". */
export function notti(n: number): string {
  return n === 1 ? '1 notte' : `${n} notti`;
}

/** "1 persona", "2 persone". */
export function persone(n: number): string {
  return n === 1 ? '1 persona' : `${n} persone`;
}

/** Il giorno del mese come si scrive: 1 diventa "1°". */
function numeroGiorno(g: number): string {
  return g === 1 ? '1°' : String(g);
}

/** Preposizione articolata davanti al numero: "dal 15", "dall'8", "dall'11", "dal 1°". */
function dalNumero(g: number): string {
  return g === 8 || g === 11 ? `dall'${g}` : `dal ${numeroGiorno(g)}`;
}

/** "al 17", "all'8", "all'11", "al 1°". */
function alNumero(g: number): string {
  return g === 8 || g === 11 ? `all'${g}` : `al ${numeroGiorno(g)}`;
}

/** "giovedì 15 ottobre" (con l'anno se richiesto: "giovedì 15 ottobre 2026"). */
export function giorno(d: PartiData, conAnno = false): string {
  return `${d.settimana} ${numeroGiorno(d.giorno)} ${d.mese}${conAnno ? ` ${d.anno}` : ''}`;
}

/** "15 ottobre" senza giorno della settimana. */
export function giornoBreve(d: PartiData, conAnno = false): string {
  return `${numeroGiorno(d.giorno)} ${d.mese}${conAnno ? ` ${d.anno}` : ''}`;
}

/**
 * Le notti scelte, dalla prima all'ultima notte (non la partenza), con il
 * giorno della settimana. In minuscolo: per l'inizio frase usare maiuscola().
 *   stesso mese:  "da giovedì 15 a sabato 17 ottobre"
 *   due mesi:     "da sabato 31 ottobre a lunedì 2 novembre"
 *   due anni:     "da mercoledì 30 dicembre 2026 a sabato 2 gennaio 2027"
 *   una notte:    "venerdì 23 ottobre"
 */
export function dalAl(primo: PartiData, ultimo: PartiData): string {
  const stessoGiorno = primo.giorno === ultimo.giorno && primo.mese === ultimo.mese && primo.anno === ultimo.anno;
  if (stessoGiorno) return giorno(primo);
  if (primo.anno !== ultimo.anno) return `da ${giorno(primo, true)} a ${giorno(ultimo, true)}`;
  if (primo.mese !== ultimo.mese) return `da ${giorno(primo)} a ${giorno(ultimo)}`;
  return `da ${primo.settimana} ${numeroGiorno(primo.giorno)} a ${ultimo.settimana} ${numeroGiorno(ultimo.giorno)} ${ultimo.mese}`;
}

/**
 * Forma breve senza giorno della settimana, per proposte e stanze occupate.
 *   "dal 30 al 31 ottobre", "dall'8 al 10 novembre", "dal 31 ottobre al 2 novembre",
 *   una notte: "il 23 ottobre".
 */
export function dalAlBreve(primo: PartiData, ultimo: PartiData): string {
  const stessoGiorno = primo.giorno === ultimo.giorno && primo.mese === ultimo.mese && primo.anno === ultimo.anno;
  if (stessoGiorno) return `${primo.giorno === 8 || primo.giorno === 11 ? "l'" : 'il '}${giornoBreve(primo)}`;
  if (primo.anno !== ultimo.anno) {
    return `${dalNumero(primo.giorno)} ${primo.mese} ${primo.anno} ${alNumero(ultimo.giorno)} ${ultimo.mese} ${ultimo.anno}`;
  }
  if (primo.mese !== ultimo.mese) {
    return `${dalNumero(primo.giorno)} ${primo.mese} ${alNumero(ultimo.giorno)} ${ultimo.mese}`;
  }
  return `${dalNumero(primo.giorno)} ${alNumero(ultimo.giorno)} ${ultimo.mese}`;
}

/** Iniziali dei giorni sotto le lune, indice = getUTCDay (0 = domenica). */
export const INIZIALI_GIORNO = ['d', 'l', 'm', 'm', 'g', 'v', 's'] as const;

/* ================================================================== la luna in parole */

/** Nome breve della fase, sotto la luna nelle notti di fase esatta e nelle etichette. */
export const NOMI_FASE = {
  nuova: 'luna nuova',
  'falce-crescente': 'falce crescente',
  'primo-quarto': 'primo quarto',
  'gibbosa-crescente': 'gibbosa crescente',
  piena: 'luna piena',
  'gibbosa-calante': 'gibbosa calante',
  'ultimo-quarto': 'ultimo quarto',
  'falce-calante': 'falce calante',
} as const satisfies Record<NomeFase, string>;

/**
 * La luna dentro una frase che comincia con "la luna è":
 *   "piena", "nuova, non si vede", "al primo quarto", "all'ultimo quarto",
 *   "crescente, illuminata al 42%", "calante, illuminata al 18%".
 */
export function lunaE(l: LunaPerTesto): string {
  switch (l.fase) {
    case 'piena':
      return 'piena';
    case 'nuova':
      return 'nuova, non si vede';
    case 'primo-quarto':
      return 'al primo quarto';
    case 'ultimo-quarto':
      return "all'ultimo quarto";
    default:
      return `${l.crescente ? 'crescente' : 'calante'}, illuminata al ${l.percento}%`;
  }
}

/**
 * La luna come nome, per le etichette delle lune del nastro:
 *   "luna piena", "luna nuova", "primo quarto", "ultimo quarto",
 *   "luna crescente illuminata al 42%", "luna calante illuminata al 18%".
 */
export function lunaNome(l: LunaPerTesto): string {
  switch (l.fase) {
    case 'piena':
    case 'nuova':
    case 'primo-quarto':
    case 'ultimo-quarto':
      return NOMI_FASE[l.fase];
    default:
      return `luna ${l.crescente ? 'crescente' : 'calante'} illuminata al ${l.percento}%`;
  }
}

/* ================================================================== meta e vetrina */

/** <title> e description, impostati da Imbrunire.tsx al montaggio (tech-architect §6.4). */
export const META = {
  title: 'Imbrunire, albergo di sette stanze · Concept di Ciceri Lab',
  description:
    'Concept di Ciceri Lab: un albergo inventato di Pordenone, visto in sezione. Entri nelle stanze e scegli le notti su un nastro di lune con le fasi vere.',
  ogTitle: 'Imbrunire, albergo di sette stanze a Pordenone',
  ogDescription:
    'Un concept di Ciceri Lab: il palazzo in sezione, le finestre accese sono le stanze libere, le notti si scelgono sulle lune.',
  ogImageAlt: 'Un palazzo tagliato in sezione di sera, con le stanze illuminate e la luna sopra il tetto.',
} as const;

/** Proposta per la voce CONCEPTS di src/content/site.ts nel sito vero (la decide Luca al porting). */
export const VETRINA = {
  tag: 'Albergo',
  title: 'IMBRUNIRE',
  subtitle: 'Albergo di sette stanze · Pordenone',
  desc: 'Il palazzo è tagliato in sezione: entri nelle stanze e dentro trovi la foto vera. Le notti si scelgono su un nastro di lune, e restano accese le stanze libere.',
  perche:
    'Un piccolo albergo si sceglie per la stanza, non per la categoria: il sito le mostra tutte insieme, diverse, e risponde a "è libera quelle notti?" con le finestre accese.',
  mestieri: [
    'albergo',
    'hotel',
    'piccolo albergo',
    'locanda',
    'residenza d\'epoca',
    'albergo diffuso',
    'affittacamere',
    'bed and breakfast',
    'b&b',
    'pensione',
    'camere',
    'dimora storica',
    'ospitalità',
  ],
} as const;

/* ================================================================== comuni */

export const COMUNI = {
  /** Nome in testata su sezione (≥ 720 px): Marcellus maiuscolo. */
  nome: 'ALBERGO IMBRUNIRE',
  /** Nome in testata su torre (< 720 px). */
  nomeBreve: 'IMBRUNIRE',
  /** L'unico h1 (visivamente è il nome in testata: questo testo va in .imb-sr accanto). */
  h1: 'Albergo Imbrunire, sette stanze a Pordenone',
  /** Il nome come si scrive dentro le frasi. */
  nomeInFrase: 'Albergo Imbrunire',
  scegliLeLune: 'Scegli le lune',
  /** Bottone mobile in basso a destra: testo a vista. Il nome accessibile è scegliLeLune. */
  lune: 'Lune',
  leMieNottiQui: 'Le mie notti qui',
  tieniMiLaStanza: 'Tienimi la stanza',
  tornaAlPalazzo: 'Torna al palazzo',
  chiudi: 'Chiudi',
  fatto: 'Fatto',
  colazioneInclusa: 'colazione inclusa',
  aNotte: 'a notte',
  occupata: 'occupata',
  libera: 'libera',
  laTuaStanza: 'la tua stanza',
  stasera: 'stasera',
  chiuso: 'chiuso',
  /** Aggiunta al nome accessibile dei link che aprono una nuova scheda. */
  nuovaScheda: ', si apre in una nuova scheda',
  /** Nota "attività inventata" (piede sul marciapiede e portico). */
  finzione: 'Albergo inventato per un concept di Ciceri Lab.',
  finzioneRecapiti: 'Telefono ed email sono di esempio: l\'albergo non esiste.',
  /** "da 128 € a notte": sotto il nome delle celle e nel pannello. */
  daANotte: (prezzo: string) => `da ${prezzo} a notte`,
  /** Nel pannello e nell'elenco, con la colazione. */
  daANotteColazione: (prezzo: string) => `da ${prezzo} a notte, colazione inclusa`,
} as const;

/* ================================================================== recapiti di esempio */

/**
 * Dati di esempio (repo pubblico): via reale del centro, civico di fantasia,
 * numero e email inesistenti. A vista vanno solo le etichette con il verbo,
 * mai il numero o l'indirizzo email (docs/ruoli-agent.md, copywriter).
 * core/links.ts (scaffold) costruisce TELEFONO_URL, EMAIL_URL e MAPS_URL da qui.
 */
export const RECAPITI = {
  via: 'Corso Vittorio Emanuele II 47',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  indirizzoRiga: 'Corso Vittorio Emanuele II 47, 33170 Pordenone',
  /** Due righe per il portico. */
  indirizzo: ['Corso Vittorio Emanuele II 47', '33170 Pordenone, sotto i portici'],
  /** Testo del link telefono, a vista. */
  telefono: 'Chiama la reception',
  telefonoBreve: 'Chiama',
  telefonoAria: 'Chiama la reception, numero di esempio',
  /** Il numero di esempio, solo come dato: non va mostrato. */
  telefonoNumero: '0434 000 000',
  telefonoHref: 'tel:+390434000000',
  /** Testo del link email, a vista. */
  emailEtichetta: 'Scrivici',
  emailAria: 'Scrivici una email, indirizzo di esempio',
  /** Indirizzo per il mailto: non va mostrato. */
  email: 'albergo@imbrunire.example',
  /** Maps cerca la via, non un'attività. */
  mapsQuery: 'Corso Vittorio Emanuele II, Pordenone',
} as const;

/* ================================================================== link di salto e testata */

export const SALTI = {
  elenco: 'Vai alle stanze in elenco',
  lune: 'Vai alle lune',
} as const;

export const TESTATA = {
  /** Link del nome (torna a #/). */
  nomeAria: 'Albergo Imbrunire, torna al palazzo',
  /** Link piccolo sotto il nome. */
  elenco: 'le stanze in elenco',
  elencoAria: 'Le stanze in elenco, vista in righe',
  /** Bottone a destra: palazzo, elenco, spazi. */
  scegliLeLune: COMUNI.scegliLeLune,
  /** Su torre con il foglio delle lune aperto il bottone diventa questo. */
  chiudiLune: COMUNI.chiudi,
  chiudiLuneAria: 'Chiudi le lune',
  /** Dentro una stanza o uno spazio. */
  tornaAlPalazzo: COMUNI.tornaAlPalazzo,
  tornaAlPalazzoAria: 'Torna al palazzo, esci dalla stanza',
  /** Bottone mobile in basso a destra (disco della luna + parola). */
  bottoneLune: COMUNI.lune,
  bottoneLuneAria: COMUNI.scegliLeLune,
} as const;

/* ================================================================== cielo */

export const CIELO = {
  /**
   * Testo della figura della luna di stasera (la luna è decorativa, la frase no).
   * Esempio: "Stasera la luna è crescente, illuminata al 38%."
   */
  lunaStasera: (l: LunaPerTesto) => `Stasera la luna è ${lunaE(l)}.`,
  /** Prima del calcolo (prerender): la figura resta senza fase. */
  lunaStaseraAttesa: 'Stasera, la luna sopra il tetto.',
  /** Dopo il successo, al posto della luna di stasera: il testo vero è la frase del successo. */
  lunaPrimaNotte: (g: PartiData, l: LunaPerTesto) => `La luna di ${giorno(g)}: ${lunaE(l)}.`,
  /** La frase di chi siamo, incisa sotto il cornicione. Una riga su sezione. */
  chiSiamo: 'Casa di famiglia sul corso. La tengono Giovanna, Sandro e Irene.',
  /** Su torre va su due righe: stessa frase, a capo qui. */
  chiSiamoRighe: ['Casa di famiglia sul corso.', 'La tengono Giovanna, Sandro e Irene.'],
} as const;

/* ================================================================== palazzo */

export const PIANI = {
  sottotetto: { nome: 'Sottotetto', inFrase: 'sottotetto', vai: 'Vai al sottotetto' },
  nobile: { nome: 'Piano nobile', inFrase: 'piano nobile', vai: 'Vai al piano nobile' },
  terra: { nome: 'Piano terra', inFrase: 'piano terra', vai: 'Vai al piano terra' },
} as const;
export type Piano = keyof typeof PIANI;

export const PALAZZO = {
  /** Nome accessibile dell'insieme delle celle. */
  aria: 'Il palazzo in sezione: tre piani, sette stanze e tre spazi comuni',
  /** Istruzione per la tastiera (aria-describedby del primo gruppo, in .imb-sr). */
  istruzioni:
    'Frecce per spostarti tra le stanze come nel palazzo: destra e sinistra sullo stesso piano, su e giù tra i piani. Invio per entrare.',
  /** Binario della scala sulla torre. */
  binarioAria: 'A che piano sei',
  /** Scritta piccola nel solaio di poché sulla torre (prima del piano). */
  solaio: { nobile: 'piano nobile', terra: 'piano terra' },
  /** Sotto le celle occupate, con notti scelte. */
  occupata: COMUNI.occupata,
  /** Sotto la cella della stanza confermata, dopo il successo. */
  laTuaStanza: COMUNI.laTuaStanza,
  /** Il palazzo ridotto nel foglio delle lune su torre. */
  ridottoAria: 'Il palazzo intero: tocca una stanza accesa per entrare',
} as const;

/* ================================================================== camere */

/**
 * Le sette camere. Nomi provvisori finché il photo-editor non ha scelto le
 * foto (creative-director §8.2): se un nome cambia, cambia qui e nello slug.
 *
 * - nome: sulle celle in Marcellus (il maiuscolo lo fa il CSS), nel titolo h2.
 * - breve: nel palazzo ridotto su torre (Commissioner 12 px).
 * - carattere: le due righe del pannello, sotto il titolo (≤ 90 caratteri in tutto).
 * - fatti: righe di dati nel pannello, in quest'ordine (brand-strategist §5.2).
 * - limite: la cosa da sapere prima, detta con calma.
 * - scale / lettoBreve / ospiti: colonne dell'elenco e nome accessibile della cella.
 * - numero: dato piccolo, mai identità.
 * - guarda: bottoni per la seconda foto (usati solo se FOTO[slug].seconda esiste).
 */
export const CAMERE = {
  'il-noce': {
    nome: 'Il Noce',
    breve: 'Noce',
    piano: 'sottotetto',
    numero: 5,
    carattere: ['Travi e pavimento di noce.', "La luce arriva dall'alto, da un lucernario."],
    fatti: [
      'sottotetto, 3 rampe di scale, niente ascensore',
      '19 m²',
      'letto matrimoniale da 160',
      'bagno con doccia',
      'per 1 o 2 persone',
      'senza TV',
    ],
    limite: 'La finestra è nel tetto: dal letto si vede il cielo, non la strada.',
    scale: '3 rampe',
    lettoBreve: 'matrimoniale da 160',
    mq: '19 m²',
    ospiti: '1-2',
    ospitiAria: 'fino a 2 persone',
    guarda: { principale: 'Guarda il letto', seconda: 'Guarda il lucernario' },
  },
  'il-campanile': {
    nome: 'Il Campanile',
    breve: 'Campanile',
    piano: 'sottotetto',
    numero: 6,
    carattere: ['Una finestra alta sotto le travi.', 'Dentro la finestra, il campanile di San Marco.'],
    fatti: [
      'sottotetto, 3 rampe di scale, niente ascensore',
      '17 m²',
      'letto matrimoniale da 160',
      'bagno con doccia',
      'per 1 o 2 persone',
      'senza TV',
    ],
    limite: 'Le campane di San Marco suonano le ore, dalle 7 alle 22.',
    scale: '3 rampe',
    lettoBreve: 'matrimoniale da 160',
    mq: '17 m²',
    ospiti: '1-2',
    ospitiAria: 'fino a 2 persone',
    guarda: { principale: 'Guarda il letto', seconda: 'Guarda la finestra' },
  },
  'la-soffitta': {
    nome: 'La Soffitta',
    breve: 'Soffitta',
    piano: 'sottotetto',
    numero: 7,
    carattere: ['La più piccola, sotto la falda del tetto.', 'Il soffitto scende fino a 1,60 m dal lato del letto.'],
    fatti: [
      'sottotetto, 3 rampe di scale, niente ascensore',
      '14 m²',
      'letto alla francese da 140',
      'bagno con doccia',
      'per 1 o 2 persone',
      'senza TV',
    ],
    limite: 'Se sei alto, scegli Il Noce.',
    scale: '3 rampe',
    lettoBreve: 'alla francese da 140',
    mq: '14 m²',
    ospiti: '1-2',
    ospitiAria: 'fino a 2 persone',
    guarda: { principale: 'Guarda il letto', seconda: 'Guarda il bagno' },
  },
  'il-camino': {
    nome: 'Il Camino',
    breve: 'Camino',
    piano: 'nobile',
    numero: 2,
    carattere: ['La più grande, al piano nobile.', 'Camino in pietra e soffitto alto 3,90 m.'],
    fatti: [
      'piano nobile, 2 rampe di scale, niente ascensore',
      '30 m²',
      'letto matrimoniale da 180 e divano letto',
      'bagno con vasca e doccia',
      'fino a 3 persone, culla su richiesta',
      'con TV',
    ],
    limite: 'Il camino è di pietra vera, ma non si accende.',
    scale: '2 rampe',
    lettoBreve: 'matrimoniale da 180 e divano letto',
    mq: '30 m²',
    ospiti: '1-3',
    ospitiAria: 'fino a 3 persone',
    guarda: { principale: 'Guarda il camino', seconda: 'Guarda il bagno' },
  },
  'la-loggia': {
    nome: 'La Loggia',
    breve: 'Loggia',
    piano: 'nobile',
    numero: 3,
    carattere: ['Una porta finestra ad arco', 'su un piccolo balcone sopra il corso.'],
    fatti: [
      'piano nobile, 2 rampe di scale, niente ascensore',
      '22 m²',
      'letto matrimoniale da 160',
      'bagno con doccia',
      'per 1 o 2 persone',
      'con TV',
    ],
    limite: 'Dà sul corso: la sera si sente il passeggio fino alle 23.',
    scale: '2 rampe',
    lettoBreve: 'matrimoniale da 160',
    mq: '22 m²',
    ospiti: '1-2',
    ospitiAria: 'fino a 2 persone',
    guarda: { principale: 'Guarda il letto', seconda: 'Guarda il balcone' },
  },
  'sul-noncello': {
    nome: 'Sul Noncello',
    breve: 'Noncello',
    piano: 'nobile',
    numero: 4,
    carattere: ['Due finestre sul retro,', 'verso il fiume e gli alberi del parco.'],
    fatti: [
      'piano nobile, 2 rampe di scale, niente ascensore',
      '21 m²',
      'letto matrimoniale da 160 oppure due letti da 90',
      'bagno con doccia',
      'per 1 o 2 persone',
      'senza TV',
    ],
    limite: 'Senza TV. È la stanza più silenziosa della casa.',
    scale: '2 rampe',
    lettoBreve: 'matrimoniale o due letti',
    mq: '21 m²',
    ospiti: '1-2',
    ospitiAria: 'fino a 2 persone',
    guarda: { principale: 'Guarda il letto', seconda: 'Guarda le finestre' },
  },
  'la-corte': {
    nome: 'La Corte',
    breve: 'Corte',
    piano: 'terra',
    numero: 1,
    carattere: ['Al piano terra, porta finestra sulla corte interna.', 'Nessun gradino dalla strada.'],
    fatti: [
      'piano terra, nessun gradino dalla strada',
      '24 m²',
      'letto matrimoniale da 160 e letto aggiunto',
      'bagno con doccia a filo pavimento e maniglioni',
      'fino a 3 persone, culla su richiesta',
      'con TV',
      'porte larghe 90 cm',
    ],
    limite: 'Guarda la corte, non il cielo: la luce è più bassa che ai piani.',
    scale: 'nessun gradino',
    lettoBreve: 'matrimoniale da 160 e letto aggiunto',
    mq: '24 m²',
    ospiti: '1-3',
    ospitiAria: 'fino a 3 persone',
    guarda: { principale: 'Guarda il letto', seconda: 'Guarda la corte' },
  },
} as const satisfies Record<
  SlugCamera,
  {
    nome: string;
    breve: string;
    piano: Piano;
    numero: number;
    carattere: readonly [string, string];
    fatti: readonly string[];
    limite: string;
    scale: string;
    lettoBreve: string;
    mq: string;
    ospiti: string;
    ospitiAria: string;
    guarda: { principale: string; seconda: string };
  }
>;

/** Ordine della pianta, dall'alto e da sinistra (vista elenco "per piano", annunci). */
export const ORDINE_CAMERE = [
  'il-noce',
  'il-campanile',
  'la-soffitta',
  'il-camino',
  'la-loggia',
  'sul-noncello',
  'la-corte',
] as const satisfies readonly SlugCamera[];

/** Nomi delle camere nell'ordine dato (per le frasi con più stanze). */
export function nomiCamere(slugs: readonly SlugCamera[]): string[] {
  return slugs.map((s) => CAMERE[s].nome);
}

/* ================================================================== spazi comuni: nomi */

/**
 * Nome sulle celle, parola al posto del prezzo, nome breve (palazzo ridotto),
 * nome dentro le frasi ("Accanto: l'androne").
 */
export const SPAZI_NOMI = {
  portico: {
    nome: 'Il portico',
    breve: 'Portico',
    inFrase: 'il portico',
    parola: 'dove siamo',
    piano: 'terra',
    cellaAria: 'Il portico, piano terra, dove siamo e come arrivare',
  },
  androne: {
    nome: "L'androne",
    breve: 'Androne',
    inFrase: "l'androne",
    parola: 'reception',
    piano: 'terra',
    cellaAria: "L'androne, piano terra, reception e regole della casa",
  },
  colazione: {
    nome: 'La colazione',
    breve: 'Colazione',
    inFrase: 'la colazione',
    parola: '7:30-10:30',
    piano: 'terra',
    cellaAria: 'La colazione, piano terra, sala della colazione dalle 7:30 alle 10:30',
  },
} as const satisfies Record<
  SlugSpazio,
  { nome: string; breve: string; inFrase: string; parola: string; piano: Piano; cellaAria: string }
>;

/** Nome di una cella qualsiasi, per porte, scala e annunci. */
export function nomeCella(slug: SlugCella): string {
  return slug in CAMERE ? CAMERE[slug as SlugCamera].nome : SPAZI_NOMI[slug as SlugSpazio].nome;
}

/* ================================================================== celle: nome accessibile */

export type StatoCellaTesto = 'nessuna-notte' | 'libera' | 'occupata' | 'scelta';

export const CELLA = {
  /**
   * Nome accessibile completo di una cella-camera.
   * "Il Campanile, sottotetto, 3 rampe, matrimoniale da 160, da 128 € a notte, libera per le tue notti"
   */
  aria: (slug: SlugCamera, prezzoDa: string, stato: StatoCellaTesto) => {
    const c = CAMERE[slug];
    const base = `${c.nome}, ${PIANI[c.piano].inFrase}, ${c.scale}, ${c.lettoBreve}, da ${prezzoDa} a notte`;
    switch (stato) {
      case 'libera':
        return `${base}, libera per le tue notti`;
      case 'occupata':
        return `${base}, occupata per le tue notti`;
      case 'scelta':
        return `${base}, la tua stanza`;
      default:
        return base;
    }
  },
  /** Spazi comuni: sempre uguale, con le notti non cambia. */
  ariaSpazio: (slug: SlugSpazio) => SPAZI_NOMI[slug].cellaAria,
  /** Foto della parete non caricata (piano B): testo in .imb-sr accanto al nome inciso. */
  fotoAssente: 'La foto di questa stanza non si è caricata: qui sotto ci sono le sue misure.',
} as const;

/* ================================================================== dentro la stanza */

export const STANZA = {
  /** Riga piccola nel pannello. */
  numero: (n: number) => `camera ${n}`,
  /** Prezzo nel pannello senza notti. */
  prezzoDa: (prezzo: string) => COMUNI.daANotteColazione(prezzo),
  /** Seconda foto: gruppo di due bottoni con aria-pressed. */
  guardaAria: 'Cosa guardi nella stanza',
  /** Porte laterali: testo a vista è il nome della cella; questo è il nome accessibile. */
  porta: (nome: string) => `Accanto: ${nome}`,
  portaAria: (nome: string) => `Stanza accanto: ${nome}`,
  /** Scala dai pianerottoli: testo a vista e nome accessibile. */
  scalaSu: (nome: string) => `${nome}, piano di sopra`,
  scalaSuAria: (nome: string) => `Piano di sopra: ${nome}`,
  scalaGiu: (nome: string) => `${nome}, piano di sotto`,
  scalaGiuAria: (nome: string) => `Piano di sotto: ${nome}`,
  /** Nome accessibile del gruppo porte e scala. */
  porteAria: 'Stanze vicine e scala',
  /** Foglio della stanza su torre: bottone-maniglia. */
  foglioApri: 'Apri tutto',
  foglioRiduci: 'Riduci',
  foglioAria: (nome: string) => `Scheda di ${nome}`,
  /** Stanza occupata per le notti scelte (S3), in luna, niente rosso. */
  occupataIl: (quando: string) => `Occupata ${quando}.`,
  /** Proposta di notti libere per questa stanza, toccabile: "Libera dal 30 al 31 ottobre: usa queste lune". */
  proposta: (dalAlBreveTesto: string) => `Libera ${dalAlBreveTesto}: usa queste lune`,
  /** Nessuna proposta entro l'orizzonte. */
  sempreOccupata: 'Nelle prossime lune è sempre occupata.',
  guardaLeLibere: 'Guarda le stanze libere',
  /** F4: le notti sono cambiate mentre si compilava. */
  nuoveNottiOccupata: 'Per le nuove notti la stanza è occupata.',
} as const;

/* ================================================================== spazi comuni: contenuto */

export const ANDRONE = {
  titolo: "L'androne",
  /** Inciso sulla parete di intonaco (Marcellus, solo testo grande). */
  iscrizione: 'ALBERGO IMBRUNIRE',
  intro: 'Qui c\'è il banco della reception. Fino alle 21 ti aspetta Giovanna.',
  /** Mezza riga di storia. */
  banco: 'Il banco è quello della vecchia merceria di famiglia: nei cassetti c\'erano i bottoni.',
  /** Titolo della targa delle regole (dl). */
  regoleTitolo: 'Le regole della casa',
  regole: [
    { termine: 'Reception', definizione: 'Tutti i giorni dalle 7:30 alle 21:00.' },
    {
      termine: 'Dopo le 21',
      definizione: 'Si arriva solo avvisando: ti lasciamo le istruzioni per entrare.',
    },
    { termine: 'Arrivo', definizione: 'Dalle 14:00. Prima puoi lasciare le valigie qui.' },
    { termine: 'Partenza', definizione: 'Entro le 11:00. Le valigie possono restare fino a sera, gratis.' },
    { termine: 'Colazione', definizione: 'Dalle 7:30 alle 10:30 in sala, inclusa nel prezzo.' },
    { termine: 'Scale', definizione: 'Niente ascensore. La Corte è al piano terra, senza gradini.' },
    {
      termine: 'Animali',
      definizione: 'Piccoli, fino a 10 kg, su richiesta: 10 € a notte. Non nel sottotetto, le scale sono strette.',
    },
    { termine: 'Parcheggio', definizione: 'Il corso è pedonale. Garage convenzionato a 250 m, 12 € ogni 24 ore.' },
    {
      termine: 'Tassa di soggiorno',
      definizione: '1,50 € a persona a notte, dai 14 anni, per le prime 5 notti. Si paga qui.',
    },
    { termine: 'Pagamento', definizione: 'In albergo, con carta o in contanti. Niente acconti online.' },
    { termine: 'Cancellazione', definizione: 'Gratis fino a 3 giorni prima. Dopo, si paga la prima notte.' },
    { termine: 'Chiusura', definizione: 'Dal 7 al 28 gennaio.' },
  ],
  /** Riga sopra i due link di contatto. */
  contattiIntro: 'Preferisci chiedere a voce? Irene risponde anche in inglese e tedesco.',
  chiama: RECAPITI.telefono,
  chiamaAria: RECAPITI.telefonoAria,
  scrivi: RECAPITI.emailEtichetta,
  scriviAria: RECAPITI.emailAria,
} as const;

export const COLAZIONE = {
  titolo: 'La colazione',
  orario: 'Dalle 7:30 alle 10:30. Dalle 7:00 se parti presto e ce lo dici la sera prima.',
  inclusa: 'È inclusa nel prezzo della stanza. Per un ospite esterno, 12 €.',
  /** Tre righe al massimo: cosa c'è e da dove viene. */
  righe: [
    'Pane e brioche dal forno del quartiere. Le torte le fa Sandro, il pomeriggio.',
    'Latte, burro e formaggi di una latteria della Pedemontana; marmellate e frutta di stagione.',
    'Uova su richiesta, caffè della moka o della macchina, tè e tisane.',
  ],
  esigenze: 'Senza glutine, senza lattosio o vegana: dillo il giorno prima.',
  /** Dove c'era la merceria (mezza riga, facoltativa). */
  storia: 'La sala è dove c\'era la merceria.',
} as const;

export const PORTICO = {
  titolo: 'Il portico',
  intro: 'Siamo sotto i portici del corso. In centro si va a piedi.',
  indirizzo: RECAPITI.indirizzo,
  aPiediTitolo: 'A piedi da qui',
  /** Minuti a piedi verosimili (brand-strategist §9.2). */
  aPiedi: [
    { luogo: 'Loggia del Municipio', minuti: 3 },
    { luogo: 'Palazzo Ricchieri, museo civico', minuti: 3 },
    { luogo: 'Duomo di San Marco e campanile', minuti: 4 },
    { luogo: 'Piazza XX Settembre', minuti: 5 },
    { luogo: 'Teatro Verdi', minuti: 7 },
    { luogo: 'Parco del Noncello, lungo il fiume', minuti: 8 },
    { luogo: 'Stazione dei treni', minuti: 10 },
  ],
  /** Accanto a ogni luogo: "3 min". */
  minuti: (n: number) => `${n} min`,
  /** Nome accessibile della riga: "Loggia del Municipio, 3 minuti a piedi". */
  minutiAria: (luogo: string, n: number) => `${luogo}, ${n === 1 ? '1 minuto' : `${n} minuti`} a piedi`,
  comeArrivareTitolo: 'Come arrivare',
  comeArrivare: [
    { mezzo: 'In treno', testo: 'Dalla stazione sono 10 minuti a piedi, quasi tutti sotto i portici.' },
    {
      mezzo: 'In auto',
      testo: 'A28, uscita Pordenone. Il corso è pedonale: l\'auto resta nel garage convenzionato a 250 m.',
    },
    { mezzo: 'In aereo', testo: 'Venezia o Trieste, poi il treno fino a Pordenone.' },
    { mezzo: 'Per la Fiera', testo: 'Pordenone Fiere è a 6 minuti in auto, 25 a piedi.' },
  ],
  maps: 'Apri in Maps',
  mapsAria: `Apri in Maps${COMUNI.nuovaScheda}`,
  finzione: COMUNI.finzione,
} as const;

/** Con notti scelte, dentro uno spazio comune (S4). */
export const SPAZIO_CON_NOTTI = {
  libere: (n: number) =>
    n === 0
      ? 'Per le tue notti siamo pieni.'
      : n === 1
        ? 'Per le tue notti c\'è 1 stanza libera.'
        : `Per le tue notti ci sono ${n} stanze libere.`,
  torna: COMUNI.tornaAlPalazzo,
  /** Negli spazi comuni "Scegli le lune" è secondario (contorno). */
  scegliLeLune: COMUNI.scegliLeLune,
} as const;

/* ================================================================== la strada (piede) */

export const STRADA = {
  /** Riga sul marciapiede sotto il palazzo. */
  finzione: COMUNI.finzione,
  recapiti: COMUNI.finzioneRecapiti,
  /** Torre: il portico chiude la pagina con questi. */
  aPiediTitolo: PORTICO.aPiediTitolo,
  maps: PORTICO.maps,
  mapsAria: PORTICO.mapsAria,
  chiama: RECAPITI.telefono,
  chiamaAria: RECAPITI.telefonoAria,
  scrivi: RECAPITI.emailEtichetta,
  scriviAria: RECAPITI.emailAria,
} as const;

/* ================================================================== nastro delle lune */

export interface ScelteTesto {
  /** Prima e ultima notte scomposte (core/date). */
  primo: PartiData;
  ultimo: PartiData;
  notti: number;
}

export const NASTRO = {
  /** h2 visivamente nascosto. */
  titolo: 'Le notti',
  listboxAria: 'Le notti, da stasera',
  /** Gruppo di un mese: "ottobre 2026". */
  meseAria: (mese: string, anno: number) => `${mese} ${anno}`,
  /** Istruzione breve a vista sotto il nastro, stato vuoto. */
  istruzione: 'Trascina sulle lune delle notti che vuoi.',
  /** Istruzione per la tastiera (aria-describedby del listbox, in .imb-sr). */
  istruzioneTastiera:
    'Frecce: notte prima e notte dopo. Invio: fissa l\'arrivo, poi l\'ultima notte. Maiuscolo e frecce: allarga la scelta. Pagina su e pagina giù: mese. Home: stasera. Canc: togli le notti.',
  meseIndietro: 'Mese prima',
  meseAvanti: 'Mese dopo',
  stasera: COMUNI.stasera,
  chiuso: COMUNI.chiuso,
  /** Sotto la prima e l'ultima luna scelte (al fuoco o al passaggio). */
  arrivo: 'arrivo',
  ultimaNotte: 'ultima notte',
  /** Nota piccola, una volta, sul puntino di venerdì e sabato. */
  notaWeekend: 'Col puntino, venerdì e sabato: si riempiono prima e costano il 15% in più.',
  /** Legenda del nastro filtrato su una stanza (differenza di forma, non solo di colore). */
  legendaFiltro: 'Punto di luce: libera. Trattino: occupata.',
  scriviLeDate: 'Scrivi le date',
  svuota: 'Svuota',
  svuotaAria: 'Togli le notti scelte',
  /** Nome accessibile di una luna: "Giovedì 15 ottobre, luna crescente illuminata al 42%, 4 stanze libere". */
  lunaAria: (g: PartiData, l: LunaPerTesto | null, libere: number, conAnno = false) => {
    const luna = l ? `, ${lunaNome(l)}` : '';
    const stanze = libere === 0 ? 'nessuna stanza libera' : libere === 1 ? '1 stanza libera' : `${libere} stanze libere`;
    return `${maiuscola(giorno(g, conAnno))}${luna}, ${stanze}`;
  },
  /** Filtrato su una stanza: "Giovedì 15 ottobre, luna piena, La Corte libera". */
  lunaAriaFiltro: (g: PartiData, l: LunaPerTesto | null, slug: SlugCamera, libera: boolean, conAnno = false) => {
    const luna = l ? `, ${lunaNome(l)}` : '';
    return `${maiuscola(giorno(g, conAnno))}${luna}, ${CAMERE[slug].nome} ${libera ? 'libera' : 'occupata'}`;
  },
  /** Notte di chiusura. */
  lunaAriaChiusa: (g: PartiData, conAnno = false) => `${maiuscola(giorno(g, conAnno))}, chiuso`,
  /** Aggiunta per la luna di stasera. */
  staseraAria: ', stasera',
  /** Foglio mobile. */
  foglioAria: 'Le lune',
  fatto: COMUNI.fatto,
  chiudi: COMUNI.chiudi,
  chiudiAria: 'Chiudi le lune',
  /** Fascia di cielo dentro una stanza (desktop). */
  fasciaStanza: (slug: SlugCamera) => `Le notti di ${CAMERE[slug].nome}`,
} as const;

/* ================================================================== riga di stato */

export const RIGA_STATO = {
  /** P0, P2, P13. */
  vuoto: NASTRO.istruzione,
  /** P3: prima luna fissata. */
  arrivoFissato: (g: PartiData) => `Arrivo ${giorno(g)}. Ora scegli l'ultima notte.`,
  /**
   * P5: notti scelte, almeno una libera.
   * "Da giovedì 15 a sabato 17 ottobre, 3 notti. Libere: Il Camino, La Corte, Il Noce e La Soffitta. Da 112 € a notte."
   */
  scelte: (s: ScelteTesto, libere: readonly SlugCamera[], prezzoDa: string) => {
    const quando = `${maiuscola(dalAl(s.primo, s.ultimo))}, ${notti(s.notti)}.`;
    if (libere.length === ORDINE_CAMERE.length) {
      return `${quando} Tutte e sette le stanze sono libere. Da ${prezzoDa} a notte.`;
    }
    const sola = libere.length === 1 ? libere[0] : undefined;
    if (sola) {
      return `${quando} Libera solo ${CAMERE[sola].nome}. Da ${prezzoDa} a notte.`;
    }
    return `${quando} Libere: ${elenco(nomiCamere(libere))}. Da ${prezzoDa} a notte.`;
  },
  /** P6: nessuna libera. Poi le proposte, come bottoni. */
  pieno: 'Per queste notti siamo pieni.',
  /** Bottone di proposta: "Da domenica 22 a martedì 24 ottobre si liberano Il Noce e La Corte". */
  proposta: (s: ScelteTesto, libere: readonly SlugCamera[]) => {
    const quando = maiuscola(dalAl(s.primo, s.ultimo));
    const sola = libere.length === 1 ? libere[0] : undefined;
    return sola ? `${quando} si libera ${CAMERE[sola].nome}` : `${quando} si liberano ${elenco(nomiCamere(libere))}`;
  },
  propostaAria: 'Notti vicine con stanze libere',
  /** P7: oltre 14 notti. Frase + link "scrivici" (mailto di esempio). */
  troppeNotti: 'Da noi al massimo 14 notti: per soggiorni più lunghi',
  troppeNottiLink: 'scrivici',
  troppeNottiFine: '.',
  /** P8: la selezione attraversa la chiusura. */
  chiuso: 'Dal 7 al 28 gennaio siamo chiusi: rifacciamo le stanze.',
  /** P9: agosto con un sabato, una notte sola. Più i due bottoni. */
  minimoAgosto: 'Ad agosto, se c\'è un sabato, si resta almeno due notti.',
  aggiungiDomenica: 'Aggiungi la domenica',
  aggiungiVenerdi: 'Aggiungi il venerdì',
  /** Motivo 'notte-occupata' sul nastro filtrato: la selezione si ferma prima. */
  notteOccupata: (slug: SlugCamera, g: PartiData) =>
    `${CAMERE[slug].nome} è occupata ${giorno(g)}: le notti si fermano alla sera prima.`,
  /** P10: filtrato su una stanza, senza notti. */
  filtroVuoto: (slug: SlugCamera) =>
    `${CAMERE[slug].nome}: le lune col punto di luce sono le notti in cui è libera.`,
  /** P10: filtrato, notti tutte libere. */
  filtroLibera: (slug: SlugCamera, s: ScelteTesto, prezzoTotale: string, o: Ospiti) =>
    `${CAMERE[slug].nome}: libera ${dalAl(s.primo, s.ultimo)}, ${notti(s.notti)}. ${prezzoTotale} ${o === 1 ? 'per te' : o === 2 ? 'in due' : 'in tre'}, colazione inclusa.`,
  /**
   * P10: filtrato, una notte occupata dentro la scelta, con le alternative già scritte in forma breve.
   * "La Loggia: occupata sabato 24 ottobre. Libera venerdì 23 ottobre, oppure dal 30 al 31 ottobre."
   */
  filtroOccupata: (slug: SlugCamera, occupataIl: PartiData, alternative: readonly string[]) => {
    const primaParte = `${CAMERE[slug].nome}: occupata ${giorno(occupataIl)}.`;
    if (alternative.length === 0) return `${primaParte} Nelle prossime lune non si libera.`;
    return `${primaParte} Libera ${alternative.join(', oppure ')}.`;
  },
  /** P12: notti dall'indirizzo non più valide. */
  nottiNonValide: 'Quelle notti non si possono più scegliere: eccole da stasera.',
} as const;

/* ================================================================== scrivi le date */

export const SCRIVI_DATE = {
  legenda: 'Scrivi le date',
  arrivo: 'Arrivo',
  partenza: 'Partenza',
  /** Sotto i due campi, a vista. */
  aiuto: 'La partenza è la mattina dopo l\'ultima notte.',
  usa: 'Usa queste date',
  chiudi: COMUNI.chiudi,
  /** Errori, sotto il campo sbagliato (P11). */
  arrivoVuoto: 'Scrivi il giorno in cui arrivi.',
  partenzaVuota: 'Scrivi il giorno in cui riparti.',
  partenzaPrima: 'La partenza viene dopo l\'arrivo.',
  arrivoPassato: 'L\'arrivo va da stasera in poi.',
  /** "Scegli una data da stasera a lunedì 24 maggio." */
  oltre: (ultima: PartiData, conAnno = false) => `Scegli una data da stasera a ${giorno(ultima, conAnno)}.`,
  troppeNotti: 'Da noi al massimo 14 notti: per soggiorni più lunghi scrivici.',
  chiuso: RIGA_STATO.chiuso,
  minimoAgosto: RIGA_STATO.minimoAgosto,
} as const;

/* ================================================================== pannello di prenotazione */

/** Ore d'arrivo proposte, dall'alto (prima) al basso (più tardi): tre piani di cinque finestre. */
export const ORE_ARRIVO = [
  '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
] as const;
export type OraArrivo = (typeof ORE_ARRIVO)[number];

export const PRENOTA = {
  /** Notti in parole, sotto il titolo della stanza. "Da giovedì 15 a sabato 17 ottobre, 3 notti" */
  notti: (s: ScelteTesto) => `${maiuscola(dalAl(s.primo, s.ultimo))}, ${notti(s.notti)}`,
  /** Partenza, riga piccola sotto le notti. "Riparti domenica 18 ottobre entro le 11." */
  partenza: (g: PartiData) => `Riparti ${giorno(g)} entro le 11.`,
  cambiaNotti: 'cambia le notti',
  cambiaNottiAria: 'Cambia le notti, riapre le lune di questa stanza',

  ospiti: {
    legenda: 'Quanti siete',
    opzione: (n: Ospiti) => String(n),
    opzioneAria: (n: Ospiti) => (n === 3 ? '3 persone, con il letto aggiunto' : persone(n)),
    /** Sotto il gruppo quando si sceglie 1. */
    singola: 'In uno la stanza costa 15 € in meno a notte.',
    /** Sotto il gruppo, solo Il Camino e La Corte, quando si sceglie 3. */
    terzo: (slug: SlugCamera) =>
      slug === 'il-camino'
        ? 'Il terzo dorme sul divano letto: 35 € a notte, colazione compresa.'
        : 'Per il terzo c\'è il letto aggiunto: 35 € a notte, colazione compresa.',
    /** Culla, nelle due stanze da tre. */
    culla: 'La culla è gratis: scrivilo qui sotto, nella nota.',
  },

  totale: {
    /** Sopra il numero grande: "3 notti, 2 persone". */
    riga: (n: number, o: Ospiti) => `${notti(n)}, ${persone(o)}`,
    /** Accanto al totale. */
    colazione: COMUNI.colazioneInclusa,
    /**
     * Tassa a parte, in euro, con chi paga:
     * "Tassa di soggiorno a parte: 9 € in due, si paga qui."
     */
    tassa: (importo: string, o: Ospiti) =>
      `Tassa di soggiorno a parte: ${importo} ${o === 1 ? 'per te' : o === 2 ? 'in due' : 'in tre'}, si paga qui.`,
    /** Riga piccola sotto la tassa. */
    tassaNota: 'Dai 14 anni in su, per le prime 5 notti.',
    /** aria-live con debounce 600 ms: "422 euro per 3 notti, 2 persone, colazione inclusa". */
    aria: (totale: string, n: number, o: Ospiti) => `${totale} per ${notti(n)}, ${persone(o)}, colazione inclusa`,
  },

  dettaglio: {
    bottone: 'Come è fatto il prezzo',
    /** Riga per notte: la data a sinistra, l'importo a destra. */
    notte: (g: PartiData) => giorno(g),
    /** Accanto all'importo delle notti di venerdì e sabato. */
    weekend: 'venerdì e sabato, +15%',
    /** Riga del letto aggiunto: "letto aggiunto, 2 notti". */
    lettoAggiunto: (n: number) => `letto aggiunto, ${notti(n)}`,
    /** Nota in fondo quando si è in uno. */
    singola: 'Uso singola: 15 € in meno a notte, prima del +15% del fine settimana.',
    totale: 'Totale, colazione inclusa',
    eventi: 'Il prezzo non cambia nei giorni di Fiera, di Pordenonelegge o del Cinema Muto.',
  },

  ora: {
    legenda: 'Quando arrivi',
    /** Descrizione del gruppo (aria-describedby) e riga a vista sotto la fila. */
    descrizione: 'Dalle 14:00 alle 21:00.',
    dopo21Prima: 'Dopo le 21 la reception è chiusa: se arrivi più tardi,',
    dopo21Link: 'chiamaci',
    dopo21Dopo: 'e ti lasciamo le istruzioni per entrare.',
    /** La stessa frase intera, per aria-describedby. */
    dopo21Intera:
      'Dopo le 21 la reception è chiusa: se arrivi più tardi, chiamaci e ti lasciamo le istruzioni per entrare.',
    dopo21LinkAria: 'Chiama la reception, numero di esempio',
    /** Nome di ogni finestra: l'ora stessa. */
    finestra: (ora: OraArrivo) => ora,
    errore: 'Scegli l\'ora in cui pensi di arrivare.',
  },

  campi: {
    nome: 'Il tuo nome',
    nomeErrore: 'Scrivi il tuo nome.',
    contatto: 'Email o telefono',
    contattoAiuto: 'Ti scriviamo lì per confermare.',
    contattoErrore: 'Scrivi un\'email completa o un numero di telefono.',
    nota: 'Una cosa che dobbiamo sapere',
    notaFacoltativo: '(facoltativo)',
    notaAiuto: 'Un\'allergia, un cane piccolo, una culla, un treno che arriva tardi.',
    /** Al posto di notaAiuto nelle tre stanze del sottotetto. */
    notaAiutoSottotetto: 'Un\'allergia, una culla, un treno che arriva tardi. Nel sottotetto niente animali: le scale sono strette.',
  },

  /** Riepilogo errori in aria-live all'invio (F1). */
  errori: {
    ora: "l'ora d'arrivo",
    nome: 'il nome',
    contatto: 'il contatto',
    riepilogo: (mancano: readonly string[]) =>
      mancano.length === 1 ? `Manca una cosa: ${mancano[0]}.` : `Mancano ${inParole(mancano.length)} cose: ${elenco(mancano)}.`,
  },

  invio: {
    bottone: COMUNI.tieniMiLaStanza,
    /** F2: l'unico puntino di sospensione del sito. */
    inCorso: 'Ti teniamo la stanza…',
    inCorsoAria: 'Invio in corso',
    /** Sotto il bottone, sempre. */
    promessa: 'Non paghi niente adesso. Cancelli gratis fino a 3 giorni prima.',
    conferma: 'Ti scriviamo entro stasera per confermare.',
    /** Dopo le 21 (ora di Pordenone) la conferma arriva il mattino dopo. */
    confermaDopo21: 'Ti scriviamo entro domattina alle 9 per confermare.',
    /** F3: invio fallito. Frase + link + fine. */
    fallitoPrima: 'Non è partito. Riprova, oppure',
    fallitoLink: 'chiama la reception',
    fallitoDopo: '.',
    fallitoIntero: 'Non è partito. Riprova, oppure chiama la reception.',
    fallitoLinkAria: RECAPITI.telefonoAria,
  },

  /** Bozza ritrovata rientrando nella stanza (sessionStorage). */
  bozzaRitrovata: 'Abbiamo tenuto quello che avevi scelto per questa stanza.',
} as const;

/* ================================================================== successo */

export interface SuccessoTesto {
  /** Prima notte (il giorno d'arrivo). */
  arrivo: PartiData;
  ora: OraArrivo;
  /** La luna della prima notte. */
  luna: LunaPerTesto | null;
  /** true se la richiesta parte dopo le 21 ora di Pordenone. */
  dopo21: boolean;
}

export const SUCCESSO = {
  /**
   * La frase unica, h2 che prende il fuoco:
   * "Ti aspettiamo giovedì 15 ottobre verso le 19:30. Quella sera la luna è crescente,
   *  illuminata al 42%. Ti scriviamo entro stasera per confermare."
   */
  frase: (p: SuccessoTesto) => {
    const arrivo = `Ti aspettiamo ${giorno(p.arrivo)} verso le ${p.ora}.`;
    const luna = p.luna ? ` Quella sera la luna è ${lunaE(p.luna)}.` : '';
    const conferma = ` ${p.dopo21 ? PRENOTA.invio.confermaDopo21 : PRENOTA.invio.conferma}`;
    return `${arrivo}${luna}${conferma}`;
  },
  /** Riga piccola sotto la frase (il solo "Mandi" del sito). */
  firma: 'Mandi, Giovanna',
  calendario: 'Aggiungi al calendario',
  calendarioAria: 'Aggiungi l\'arrivo al calendario, file .ics',
  torna: COMUNI.tornaAlPalazzo,
  /** Sotto la cella accesa. */
  laTuaStanza: COMUNI.laTuaStanza,
} as const;

/** Contenuto del file .ics (sections/Prenota/ics.ts lo compone e fa l'escape). */
export const ICS = {
  nomeFile: 'imbrunire-arrivo.ics',
  titolo: (slug: SlugCamera) => `Arrivo all'Albergo Imbrunire, ${CAMERE[slug].nome}`,
  descrizione:
    'Reception aperta fino alle 21: se arrivi più tardi, chiama prima. Partenza entro le 11. Albergo inventato per un concept di Ciceri Lab.',
  luogo: RECAPITI.indirizzoRiga,
} as const;

/* ================================================================== elenco */

export type OrdineElenco = 'piano' | 'prezzo';

export const ELENCO = {
  titolo: 'Le stanze',
  intro: 'Se hai fretta, eccole in fila.',
  /** Con notti scelte, sotto il titolo: "Per le notti da giovedì 15 a sabato 17 ottobre, 3 notti." */
  perLeNotti: (s: ScelteTesto) => `Per le notti ${dalAl(s.primo, s.ultimo)}, ${notti(s.notti)}.`,
  caption: 'Le sette stanze, con piano, scale, letto, metri quadri, ospiti e prezzo a notte',
  captionConNotti: 'Le sette stanze per le tue notti: le libere per prime',
  ordina: 'ordina per',
  ordini: { piano: 'piano', prezzo: 'prezzo' } as const satisfies Record<OrdineElenco, string>,
  ordiniAria: { piano: 'Ordina per piano, dall\'alto', prezzo: 'Ordina per prezzo, dal più basso' } as const satisfies Record<
    OrdineElenco,
    string
  >,
  colonne: {
    foto: 'Foto',
    stanza: 'Stanza',
    scale: 'Scale',
    letto: 'Letto',
    mq: 'm²',
    ospiti: 'Ospiti',
    prezzo: 'Da, a notte',
    notti: 'Per le tue notti',
    entra: 'Entra',
  },
  /** Cella "Per le tue notti". */
  libera: (totale: string, o: Ospiti) => `libera, ${totale} ${o === 1 ? 'per te' : o === 2 ? 'in due' : 'in tre'}`,
  occupata: COMUNI.occupata,
  entra: 'Entra',
  entraAria: (slug: SlugCamera) => `Entra in ${CAMERE[slug].nome}`,
  spaziTitolo: 'Spazi comuni',
  spazioAria: (slug: SlugSpazio) => `Entra: ${SPAZI_NOMI[slug].inFrase}`,
  scegliLeLune: COMUNI.scegliLeLune,
  chiudi: 'Chiudi l\'elenco',
} as const;

/* ================================================================== annunci (regione aria-live della radice) */

export const ANNUNCI = {
  /** P1 finito (solo se qualcuno è già dentro il palazzo con il fuoco). */
  luciAccese: 'Le luci del palazzo sono accese.',
  /** Svuota (P13). */
  nottiTolte: 'Notti tolte. Tutte le stanze sono accese.',
  /** Elenco riordinato. */
  ordinato: (o: OrdineElenco) => (o === 'piano' ? 'Elenco per piano, dall\'alto.' : 'Elenco per prezzo, dal più basso.'),
  /** F2. */
  invioInCorso: PRENOTA.invio.inCorsoAria,
  /** F3 (il fuoco va al messaggio, l'annuncio lo ripete). */
  invioFallito: PRENOTA.invio.fallitoIntero,
  /** F4. */
  nuoveNottiOccupata: STANZA.nuoveNottiOccupata,
  /** Bozza ritrovata. */
  bozzaRitrovata: PRENOTA.bozzaRitrovata,
  /** Foglio delle lune aperto su torre (il fuoco va alla luna di stasera). */
  luneAperte: 'Lune aperte.',
  luneChiuse: 'Lune chiuse.',
  /** Dopo "Torna al palazzo" dal successo. */
  palazzoRiacceso: 'Sei di nuovo davanti al palazzo. Le luci sono accese.',
} as const;

/* ================================================================== esportazione unica */

const TESTI = {
  meta: META,
  vetrina: VETRINA,
  comuni: COMUNI,
  recapiti: RECAPITI,
  salti: SALTI,
  testata: TESTATA,
  cielo: CIELO,
  piani: PIANI,
  palazzo: PALAZZO,
  camere: CAMERE,
  ordineCamere: ORDINE_CAMERE,
  spaziNomi: SPAZI_NOMI,
  cella: CELLA,
  stanza: STANZA,
  androne: ANDRONE,
  colazione: COLAZIONE,
  portico: PORTICO,
  spazioConNotti: SPAZIO_CON_NOTTI,
  strada: STRADA,
  nastro: NASTRO,
  rigaStato: RIGA_STATO,
  scriviDate: SCRIVI_DATE,
  oreArrivo: ORE_ARRIVO,
  prenota: PRENOTA,
  successo: SUCCESSO,
  ics: ICS,
  elenco: ELENCO,
  annunci: ANNUNCI,
  nomiFase: NOMI_FASE,
  inizialiGiorno: INIZIALI_GIORNO,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
