/**
 * MADRE · tutti i testi visibili del sito, aria-label, alt, meta e annunci (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter. Nessun trattino lungo, nessun punto
 * esclamativo, nessun occhiello numerato, nessuna freccia scritta come testo
 * (le frecce sono icone del vector-artist). Unici puntini: "Un momento…"
 * dell'invio in corso, voluto dal creative-director §4.4.
 *
 * "Il pane fisso" è l'unica etichetta del richiamo alla prenotazione (menu,
 * apertura, fine della domenica, piede). "Tieni da parte" è solo l'invio.
 *
 * Chi parla: Sabrina al banco. Dà del tu, frasi corte, numeri al posto degli
 * aggettivi. Titoli in minuscolo (il creative-director lo chiede).
 *
 * Le funzioni mettono parole e numeri già calcolati dentro frasi già scritte
 * (giorni, generi, plurali). Non calcolano prezzi: i totali arrivano da
 * state/settimana.ts. Nessun accesso al browser a livello di modulo.
 */

import {
  DOMENICA_PANI,
  MAX_PEZZI,
  MAX_PREFERITE,
  ORA_PRONTO,
  ORDINE_GIORNI,
  ORDINE_PANI,
  PANI_PER_ID,
  PASTE_AL_KG,
  PASTE_PER_ID,
  RECAPITI,
  VASSOI,
  euro,
} from './prezzi';
import type {
  Frequenza,
  IdDolce,
  IdGiorno,
  IdPane,
  IdPasta,
  IdPezzatura,
  MisuraVassoio,
  Pane,
  PesoVassoio,
  PezzoDolce,
  Pezzatura,
} from './prezzi';

/* ================================================================== tipi locali */

/** Coincide con IdBanco di state/store.ts (tech-architect §6.1). */
type IdBanco = 'impasto' | 'pane' | 'la-madre' | 'dolci' | 'domenica' | 'pane-fisso' | 'bottega';

/** Coincide con IdFoto di assets/foto/index.ts (tech-architect §6.7). */
type IdFoto = IdPane | IdDolce | IdPasta | 'impasto' | 'madre' | 'vassoio';

/** Coincide con CodiceErrore di state/store.ts (tech-architect §6.1). */
type CodiceErrore =
  | 'giorno-sbagliato'
  | 'lunedi'
  | 'domenica-limitata'
  | 'troppi-pezzi'
  | 'troppe-paste'
  | 'settimana-vuota';

/** Stessa forma di ErrorePaneFisso dello store: lo si passa così com'è. */
export interface ErroreTesti {
  readonly codice: CodiceErrore;
  readonly giorno: IdGiorno | null;
  readonly pane: IdPane | null;
}

/** Stessa forma di Riga dello store. */
export interface RigaTesti {
  readonly pane: IdPane;
  readonly pezzatura: IdPezzatura;
  readonly quantita: number;
}

/** Stessa forma di Settimana dello store: si passa `store.get().settimana`. */
export type SettimanaTesti = { readonly [G in IdGiorno]: readonly RigaTesti[] };

/** Stessa forma di Vassoio dello store. */
export interface VassoioTesti {
  readonly peso: PesoVassoio;
  readonly misto: boolean;
  readonly preferite: readonly IdPasta[];
  readonly frequenza: Frequenza;
}

/**
 * Totali già calcolati da state/settimana.ts, in euro:
 * `pane` = somma dei pani di una settimana (prezzo della pezzatura per quantità);
 * `vassoio` = prezzo di UN vassoio (VASSOI per il suo peso), 0 se non c'è.
 */
export interface TotaliFrase {
  readonly pane: number;
  readonly vassoio: number;
}

/** Le cinque posizioni della prova del dito da tastiera (ux §6.3). */
export type PuntoProva = 'centro' | 'sopra' | 'destra' | 'sotto' | 'sinistra';

type Genere = 'm' | 'f';

/* ================================================================== aiuti di lingua */

/** Prima lettera maiuscola: "la segale" diventa "La segale". */
export function maiuscola(testo: string): string {
  return testo.length > 0 ? testo.charAt(0).toUpperCase() + testo.slice(1) : testo;
}

/** "a", "a e b", "a, b e c". */
export function elenco(voci: readonly string[]): string {
  if (voci.length === 0) return '';
  if (voci.length === 1) return voci[0] ?? '';
  return `${voci.slice(0, -1).join(', ')} e ${voci[voci.length - 1] ?? ''}`;
}

const NUMERI_IN_PAROLE = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci'] as const;

/** "due", "sei"; oltre il dieci le cifre. */
export function inParole(n: number): string {
  return NUMERI_IN_PAROLE[n] ?? String(n);
}

/** "1 pezzo", "3 pezzi" (per i lettori di schermo: "tre pezzi"). */
export function pezzi(n: number, aParole = false): string {
  const numero = aParole ? (n === 1 ? 'un' : inParole(n)) : String(n);
  return `${numero} ${n === 1 ? 'pezzo' : 'pezzi'}`;
}

/** Accordo del participio o dell'aggettivo: ("scelt", "f") diventa "scelta". */
function accorda(radice: string, genere: Genere, plurale = false): string {
  if (plurale) return `${radice}${genere === 'f' ? 'e' : 'i'}`;
  return `${radice}${genere === 'f' ? 'a' : 'o'}`;
}

/** "5,80 € al chilo". */
export function alChilo(valore: number): string {
  return `${euro(valore)} al chilo`;
}

/* ================================================================== parole: giorni */

interface ParoleGiorno {
  /** "martedì" */
  readonly nome: string;
  /** "Martedì" a inizio frase. */
  readonly maiuscolo: string;
  /** "mar" (barra del riassunto su 375 px). */
  readonly breve: string;
  /** Abituale, per le cose che si ripetono: "il martedì", "la domenica". */
  readonly ogni: string;
  /** "dal martedì", "dalla domenica". */
  readonly dal: string;
  /** "al martedì", "alla domenica". */
  readonly al: string;
}

export const GIORNI = {
  lun: { nome: 'lunedì', maiuscolo: 'Lunedì', breve: 'lun', ogni: 'il lunedì', dal: 'dal lunedì', al: 'al lunedì' },
  mar: { nome: 'martedì', maiuscolo: 'Martedì', breve: 'mar', ogni: 'il martedì', dal: 'dal martedì', al: 'al martedì' },
  mer: { nome: 'mercoledì', maiuscolo: 'Mercoledì', breve: 'mer', ogni: 'il mercoledì', dal: 'dal mercoledì', al: 'al mercoledì' },
  gio: { nome: 'giovedì', maiuscolo: 'Giovedì', breve: 'gio', ogni: 'il giovedì', dal: 'dal giovedì', al: 'al giovedì' },
  ven: { nome: 'venerdì', maiuscolo: 'Venerdì', breve: 'ven', ogni: 'il venerdì', dal: 'dal venerdì', al: 'al venerdì' },
  sab: { nome: 'sabato', maiuscolo: 'Sabato', breve: 'sab', ogni: 'il sabato', dal: 'dal sabato', al: 'al sabato' },
  dom: { nome: 'domenica', maiuscolo: 'Domenica', breve: 'dom', ogni: 'la domenica', dal: 'dalla domenica', al: 'alla domenica' },
} as const satisfies Record<IdGiorno, ParoleGiorno>;

/** Giorni in ordine, divisi in tratti di giorni consecutivi. */
function tratti(giorni: readonly IdGiorno[]): IdGiorno[][] {
  const ordinati = ORDINE_GIORNI.filter((g) => giorni.includes(g));
  const risultato: IdGiorno[][] = [];
  let corrente: IdGiorno[] = [];
  let ultimo = -2;
  for (const g of ordinati) {
    const i = ORDINE_GIORNI.indexOf(g);
    if (i === ultimo + 1 && corrente.length > 0) {
      corrente.push(g);
    } else {
      if (corrente.length > 0) risultato.push(corrente);
      corrente = [g];
    }
    ultimo = i;
  }
  if (corrente.length > 0) risultato.push(corrente);
  return risultato;
}

/**
 * Giorni detti come si dicono al banco, per una cosa che si ripete:
 * ["mar","ven"] → "il martedì e il venerdì";
 * ["mar","mer","gio","sab"] → "dal martedì al giovedì e il sabato";
 * da martedì a domenica → "dal martedì alla domenica".
 * Tre o più giorni di fila diventano "dal … al …".
 */
export function giorniAbituali(giorni: readonly IdGiorno[]): string {
  const voci: string[] = [];
  for (const t of tratti(giorni)) {
    const primo = t[0];
    const ultimo = t[t.length - 1];
    if (primo === undefined || ultimo === undefined) continue;
    if (t.length >= 3) {
      voci.push(`${GIORNI[primo].dal} ${GIORNI[ultimo].al}`);
    } else {
      for (const g of t) voci.push(GIORNI[g].ogni);
    }
  }
  return elenco(voci);
}

/** Versione corta per la barra del riassunto: "mar e ven", "da mar a sab". */
export function giorniBrevi(giorni: readonly IdGiorno[]): string {
  const voci: string[] = [];
  for (const t of tratti(giorni)) {
    const primo = t[0];
    const ultimo = t[t.length - 1];
    if (primo === undefined || ultimo === undefined) continue;
    if (t.length >= 3) {
      voci.push(`da ${GIORNI[primo].breve} a ${GIORNI[ultimo].breve}`);
    } else {
      for (const g of t) voci.push(GIORNI[g].breve);
    }
  }
  return elenco(voci);
}

/* ================================================================== parole: pani, pezzature, paste, pesi */

interface ParolePane {
  /** Nome corto, minuscolo: "segale", "filone", "pan di sorc". */
  readonly breve: string;
  /** Con l'articolo: "la segale", "l'integrale". */
  readonly articolo: string;
  /** "la tua segale", "il tuo filone". */
  readonly tuo: string;
  /** Plurale per le quantità: "due ciabatte", "tre pani di segale". */
  readonly plurale: string;
  readonly genere: Genere;
}

export const PAROLE_PANI = {
  pagnotta: { breve: 'pagnotta', articolo: 'la pagnotta', tuo: 'la tua pagnotta', plurale: 'pagnotte', genere: 'f' },
  ciabatta: { breve: 'ciabatta', articolo: 'la ciabatta', tuo: 'la tua ciabatta', plurale: 'ciabatte', genere: 'f' },
  integrale: { breve: 'integrale', articolo: 'l\'integrale', tuo: 'il tuo integrale', plurale: 'integrali', genere: 'm' },
  segale: { breve: 'segale', articolo: 'la segale', tuo: 'la tua segale', plurale: 'pani di segale', genere: 'f' },
  semola: { breve: 'filone', articolo: 'il filone', tuo: 'il tuo filone', plurale: 'filoni', genere: 'm' },
  sorc: { breve: 'pan di sorc', articolo: 'il pan di sorc', tuo: 'il tuo pan di sorc', plurale: 'pani di sorc', genere: 'm' },
} as const satisfies Record<IdPane, ParolePane>;

interface ParolePezzatura {
  /** Dentro la frase che si scrive da sola: "la pagnotta da un chilo". Vuota se non si dice. */
  readonly frase: string;
  /** Barra del riassunto: "1 kg". */
  readonly breve: string;
  /** Lettori di schermo: "500 grammi". */
  readonly sr: string;
}

export const PAROLE_PEZZATURE = {
  '500g': { frase: 'da mezzo chilo', breve: '500 g', sr: '500 grammi' },
  '1kg': { frase: 'da un chilo', breve: '1 kg', sr: 'un chilo' },
  pezzo: { frase: '', breve: '', sr: 'circa 300 grammi' },
} as const satisfies Record<IdPezzatura, ParolePezzatura>;

interface ParolePasta {
  /** Minuscolo, al plurale: "bignè", "diplomatiche". */
  readonly minuscolo: string;
  readonly genere: Genere;
}

export const PAROLE_PASTE = {
  bigne: { minuscolo: 'bignè', genere: 'm' },
  cannoncini: { minuscolo: 'cannoncini', genere: 'm' },
  diplomatiche: { minuscolo: 'diplomatiche', genere: 'f' },
  sfogliatine: { minuscolo: 'sfogliatine', genere: 'f' },
  krapfen: { minuscolo: 'krapfen', genere: 'm' },
} as const satisfies Record<IdPasta, ParolePasta>;

interface ParolePeso {
  /** Bottoni e cartellini: "750 g". */
  readonly etichetta: string;
  /** Nella frase: "il vassoio da mezzo chilo". */
  readonly frase: string;
  /** Lettori di schermo: "750 grammi". */
  readonly sr: string;
}

export const PAROLE_PESI = {
  500: { etichetta: '500 g', frase: 'da mezzo chilo', sr: '500 grammi' },
  750: { etichetta: '750 g', frase: 'da 750 g', sr: '750 grammi' },
  1000: { etichetta: '1 kg', frase: 'da un chilo', sr: 'un chilo' },
} as const satisfies Record<PesoVassoio, ParolePeso>;

export const PAROLE_FREQUENZA = {
  ogni: { frase: 'ogni domenica', breve: 'ogni domenica' },
  alterna: { frase: 'una domenica sì e una no', breve: 'domeniche alterne' },
} as const satisfies Record<Frequenza, { frase: string; breve: string }>;

/** Nomi minuscoli delle paste in elenco: "bignè, diplomatiche e sfogliatine". */
export function elencoPaste(paste: readonly IdPasta[]): string {
  return elenco(paste.map((p) => PAROLE_PASTE[p].minuscolo));
}

/**
 * "la segale si fa il martedì e il venerdì" (con la stagione se c'è);
 * con `solo`: "la segale si fa solo il martedì e il venerdì".
 */
function siFa(pane: Pane, solo = false): string {
  const stagione = pane.stagione ? `, ${pane.stagione}` : '';
  return `${PAROLE_PANI[pane.id].articolo} si fa ${solo ? 'solo ' : ''}${giorniAbituali(pane.giorni)}${stagione}`;
}

/* ================================================================== meta e vetrina del sito */

export const META = {
  /** <title>: 56 caratteri. "Concept" già nello snippet, marchio "Ciceri Lab" come nel pilota. */
  title: 'Concept 17 · MADRE, panificio e pasticceria | Ciceri Lab',
  /** meta description: 145 caratteri. Dice subito che è un concept e che la bottega è inventata. */
  description:
    'Concept di Ciceri Lab: il sito di un panificio e pasticceria di Pordenone, inventato. Premi l\'impasto, poi fai il tuo pane fisso della settimana.',
  ogTitle: 'MADRE, panificio e pasticceria. Un concept di Ciceri Lab',
  ogDescription: 'Premi l\'impasto: se torna su piano piano, è pronto. Un concept di Ciceri Lab.',
  /** Testo alternativo dell'anteprima (public/concepts/concept-17.jpg, da fare al porting). */
  ogImageAlt: 'Un impasto bianco di farina con il segno leggero di un dito, e la scritta premi. se torna su piano piano, è pronto.',
} as const;

/**
 * Voce per src/content/site.ts (CONCEPTS) nel sito vero. Non è di questo
 * progetto: la usa chi porta il concept, se Luca è d'accordo.
 */
export const VETRINA_SITO = {
  tag: 'Panificio e pasticceria',
  title: 'MADRE',
  subtitle: 'Panificio e pasticceria · Pordenone',
  desc: 'Premi l\'impasto e guarda come torna su. Poi cammini lungo il bancone e ti fai il pane fisso: la tua settimana, pronta col tuo nome sul sacchetto.',
  perche: 'Chi compra il pane lo compra sempre uguale: il sito tiene da parte la tua settimana, come il quaderno di chi serve al banco.',
  mestieri: [
    'panificio',
    'panetteria',
    'panettiere',
    'panettiera',
    'fornaio',
    'forno',
    'pane',
    'pasticceria',
    'pasticcere',
    'pasticcera',
    'dolci',
    'lievito madre',
    'pasta madre',
    'gubana',
    'biscotti',
  ],
} as const;

/* ================================================================== comuni */

export const COMUNI = {
  marchio: 'MADRE',
  marchioSotto: 'panificio e pasticceria',
  citta: 'Pordenone',
  /** L'unico richiamo alla prenotazione, identico ovunque. */
  ilPaneFisso: 'Il pane fisso',
  /** L'unico invio. */
  tieniDaParte: 'Tieni da parte',
  nuovaScheda: 'si apre in una nuova scheda',
  erroreSegno: '!',
  erroreSr: 'Errore:',
  chiudi: 'chiudi',
} as const;

export const SALTI = {
  paneFisso: 'Salta al pane fisso',
  contenuto: 'Salta al contenuto',
} as const;

/** Etichette dei recapiti di esempio: numero ed email non si mostrano mai. */
export const RECAPITI_TESTI = {
  chiama: 'Chiama',
  chiamaAria: 'Chiama la bottega (numero di esempio)',
  chiamaci: 'chiamaci',
  chiamaciAria: 'Chiamaci (numero di esempio)',
  scrivi: 'Scrivi',
  scriviAria: 'Scrivi alla bottega (indirizzo di esempio)',
  nota: 'Telefono ed email sono di esempio: la bottega non esiste.',
} as const;

/* ================================================================== testata */

export const TESTATA = {
  navAria: 'Principale',
  marchioAria: 'MADRE, torna all\'impasto',
  voci: [
    { id: 'pane', etichetta: 'pane', href: '#pane' },
    { id: 'dolci', etichetta: 'dolci', href: '#dolci' },
    { id: 'bottega', etichetta: 'la bottega', href: '#bottega' },
  ],
  paneFisso: COMUNI.ilPaneFisso,
  paneFissoAria: 'Il pane fisso: fai la tua settimana',
  /** Al posto del bottone quando si è già dentro il pane fisso (testo, non cliccabile). */
  seiQui: 'sei al pane fisso',
} as const;

/* ================================================================== banchi: la riga in basso */

interface ParoleBanco {
  /** Nome sulla riga dei banchi (minuscolo, come i cartellini di vetrina). */
  readonly riga: string;
  readonly href: string;
}

export const BANCHI = {
  impasto: { riga: 'l\'impasto', href: '#impasto' },
  pane: { riga: 'pane', href: '#pane' },
  'la-madre': { riga: 'la madre', href: '#la-madre' },
  dolci: { riga: 'dolci', href: '#dolci' },
  domenica: { riga: 'domenica', href: '#domenica' },
  'pane-fisso': { riga: 'pane fisso', href: '#pane-fisso' },
  bottega: { riga: 'bottega', href: '#bottega' },
} as const satisfies Record<IdBanco, ParoleBanco>;

/** Ordine della riga dei banchi (l'impasto non c'è: lì la riga è nascosta). */
export const ORDINE_RIGA_BANCHI = ['pane', 'la-madre', 'dolci', 'domenica', 'pane-fisso', 'bottega'] as const;

export const RIGA_BANCHI = {
  aria: 'Il bancone',
  /** Numero dei pani scelti lungo la vetrina, scritto accanto a "pane fisso" (solo se > 0). */
  conteggio: (n: number) => String(n),
  /** Nome accessibile del link "pane fisso" quando ci sono pani scelti. */
  paneFissoAria: (n: number) =>
    n > 0 ? `pane fisso, ${n} ${n === 1 ? 'pane scelto' : 'pani scelti'}` : 'pane fisso',
} as const;

/* ================================================================== banco 0: l'impasto */

const IMPASTO_PUNTI: Readonly<Record<PuntoProva, string>> = {
  centro: 'al centro',
  sopra: 'in alto',
  destra: 'a destra',
  sotto: 'in basso',
  sinistra: 'a sinistra',
};

const SPIEGAZIONE_PROVA =
  'Torna su piano piano e lascia un segno leggero: è pronto. Il pane di oggi l\'abbiamo impastato ieri sera.';

export const IMPASTO = {
  /** Unico h1 del sito. In minuscolo, come tutti i titoli. 41 caratteri: 2 righe a 1440, 3 a 375. */
  titolo: 'premi. se torna su piano piano, è pronto.',
  /** Riga sotto il titolo (13 parole). */
  riga: 'Questo è l\'impasto della pagnotta. MADRE, panificio e pasticceria a Pordenone.',
  /** Al posto della riga quando il pane fisso è già stato tenuto da parte. */
  rigaDopoInvio: (nome: string) => `Il tuo pane è da parte, ${nome.trim()}.`,
  /** Il bottone d'apertura (unico richiamo della prima schermata). */
  paneFisso: COMUNI.ilPaneFisso,
  paneFissoAria: 'Il pane fisso: fai la tua settimana',
  /** Il <button> che copre la zona dove si preme. */
  provaAria: 'Fai la prova del dito sull\'impasto',
  /** Solo per lettori di schermo (aria-describedby del bottone, insieme alla riga). */
  provaIstruzioni: 'Premi Invio o Spazio e lascia andare. Con le frecce sposti il punto.',
  /** Compare accanto all'impasto dopo la prima prova, una volta sola per visita. */
  spiegazione: SPIEGAZIONE_PROVA,
  punti: IMPASTO_PUNTI,
  /** Ordine delle frecce (ux §6.3): centro, sopra, destra, sotto, sinistra. */
  ordinePunti: ['centro', 'sopra', 'destra', 'sotto', 'sinistra'],
  /** Detto solo al cambio di punto. */
  puntoAria: (p: PuntoProva) => `punto della prova: ${IMPASTO_PUNTI[p]}`,
} as const;

/* ================================================================== la vetrina (striscia) */

export const VETRINA = {
  /** role="region" della striscia orizzontale. */
  aria: 'La vetrina',
} as const;

/** Etichette dei dati sotto ogni prodotto (dt, anche solo per lettori di schermo). */
const DT = {
  pezzi: 'Pezzi e prezzo',
  alChilo: 'Al chilo',
  quando: 'Quando si fa',
  quandoDolci: 'Quando c\'è',
} as const;

/* ================================================================== banco 1: il pane */

export const BANCO_PANE = {
  titolo: 'il pane',
  intro: 'Sei pani, tutti dalla stessa madre, il lievito che teniamo vivo in bottega. Ognuno ha i suoi giorni.',
  dt: DT,
  /** "500 g: 2,90 €", "circa 300 g: 1,50 €". */
  pezzo: (p: Pezzatura) => `${p.etichetta}: ${euro(p.prezzo)}`,
  /** "5,80 € al chilo". */
  alChilo: (pane: Pane) => alChilo(pane.alKg),
  /** "si fa da martedì a domenica", "si fa venerdì e sabato, da ottobre a Pasqua". */
  giorni: (pane: Pane) => `si fa ${pane.giorniTesto}${pane.stagione ? `, ${pane.stagione}` : ''}`,
  /** Riga in più solo sotto pagnotta e ciabatta. */
  domenica: 'la domenica fino alle 12.30',
  /** Il gesto lungo la vetrina (interruttore con aria-pressed). */
  azione: 'Nel pane fisso',
  /** Etichetta visibile quando è scelto: "Scelta", "Scelto". */
  scelto: (pane: IdPane) => maiuscola(accorda('scelt', PAROLE_PANI[pane].genere)),
  /** Nome accessibile: comincia con il testo visibile (WCAG 2.5.3). */
  azioneAria: (pane: IdPane, premuto: boolean) => {
    const nome = PANI_PER_ID[pane].nome.toLowerCase();
    return premuto
      ? `${maiuscola(accorda('scelt', PAROLE_PANI[pane].genere))}: ${nome}, nel pane fisso`
      : `Nel pane fisso: ${nome}`;
  },
} as const;

/** Vale per i pani che si fanno anche la domenica (DOMENICA_PANI). */
export function ancheDomenica(pane: IdPane): boolean {
  return DOMENICA_PANI.includes(pane);
}

/* ================================================================== banco 2: la madre */

export const LA_MADRE = {
  titolo: 'la madre',
  /** Tre frasi, 260 caratteri in tutto: stanno in 8 righe a 375 px. */
  frasi: [
    'È una pasta di farina e acqua, viva. Renzo l\'ha portata da un forno di Spilimbergo, in un vasetto.',
    'Ogni giorno le diamo farina e acqua nuove, e lei riparte: si chiama rinfresco.',
    'Il pane lievita circa 18 ore, in parte al fresco. Per questo dura fino al terzo giorno.',
  ],
} as const;

/* ================================================================== banco 3: i dolci */

export const BANCO_DOLCI = {
  titolo: 'i dolci',
  intro: 'Dall\'altra parte della vetrina, i dolci di Giulia. Nei lievitati c\'è la madre, con un po\' di lievito di birra.',
  dt: DT,
  /** "piccola, 500 g: 13,00 €", "un etto: 2,00 €". */
  pezzo: (p: PezzoDolce) => `${p.etichetta}: ${euro(p.prezzo)}`,
  alChilo: (valore: number) => alChilo(valore),
  /** Cartello di testo alla fine del banco (non è un prodotto). */
  intero: {
    titolo: 'Un dolce intero per un giorno preciso?',
    testo: 'Chiamaci o scrivici almeno due giorni prima. Per la pinza, entro il mercoledì santo.',
    chiama: RECAPITI_TESTI.chiama,
    chiamaAria: RECAPITI_TESTI.chiamaAria,
    scrivi: RECAPITI_TESTI.scrivi,
    scriviAria: RECAPITI_TESTI.scriviAria,
  },
} as const;

/* ================================================================== banco 4: la domenica */

export const DOMENICA = {
  titolo: 'la domenica',
  intro: 'Le paste di Giulia si vendono a peso e si incartano nella carta da zucchero, quella azzurra delle pasticcerie.',
  quante: 'Mezzo chilo sono circa 12 paste.',
  /** Gesto su ogni pasta (interruttore con aria-pressed, massimo 4). */
  azione: 'Sul vassoio',
  azioneAria: (pasta: IdPasta) => `Sul vassoio: ${PAROLE_PASTE[pasta].minuscolo}`,
  /** Il vassoio sotto il piano, con le paste scelte scritte per nome. */
  vassoio: {
    aria: 'Il tuo vassoio',
    misto: 'misto: un po\' di tutto',
    conPaste: (paste: readonly IdPasta[]) => (paste.length > 0 ? elencoPaste(paste) : 'misto: un po\' di tutto'),
  },
  /** "500 g, circa 12 paste: 17,00 €". */
  misura: (m: MisuraVassoio) => `${PAROLE_PESI[m.peso].etichetta}, circa ${m.paste} paste: ${euro(m.prezzo)}`,
  alChilo: alChilo(PASTE_AL_KG),
  troppe: 'Al massimo quattro paste preferite: togline una, poi scegli l\'altra.',
  paneFisso: COMUNI.ilPaneFisso,
  paneFissoAria: 'Il pane fisso: metti il vassoio nella tua settimana',
} as const;

/* ================================================================== banco 5: il pane fisso */

export const PANE_FISSO = {
  titolo: 'il pane fisso',
  intro: 'Fai la tua settimana una volta sola. Noi la teniamo pronta, col tuo nome sul sacchetto.',
  /** Come si usa: una riga sotto l'intro, diversa per dito e mouse. */
  come: {
    tocco: 'Tocca un pane, poi tocca i giorni.',
    puntatore: 'Trascina un pane su un giorno. Oppure cliccalo, e poi clicca i giorni.',
  },
  /** Le tre rassicurazioni, sempre vicine alla frase e all'invio. */
  rassicurazioni: ['Si paga al ritiro', 'Lo sospendi con un messaggio', 'Nessun account'],
  /** Regole di servizio, piccole, sotto l'invio. */
  regole: [
    'Il sacchetto è pronto dalle 7, la domenica dalle 7.30, e resta da parte fino a chiusura.',
    'Cambi e sospensioni entro le 12 del giorno prima, con un messaggio o una telefonata.',
    'Se non passi e non avvisi per due volte di fila, Sabrina ti chiama prima di andare avanti.',
    'Ad agosto chiudiamo due settimane: il pane fisso si ferma da solo e poi riparte.',
  ],

  /* ---------- bozza ritrovata, scelte dal bancone */
  bozza: {
    frase: 'Abbiamo tenuto la tua settimana di prima.',
    ricomincia: 'Ricomincia',
    ricominciaAria: 'Ricomincia: svuota la settimana e il vassoio',
  },

  /* ---------- la fila dei pani (gettoni) */
  fila: {
    aria: 'I pani da mettere nei giorni',
    /** Prezzo sotto il nome del gettone. */
    prezzo: (pane: IdPane) => alChilo(PANI_PER_ID[pane].alKg),
    /** Sotto il nome, se il pane è stato scelto lungo la vetrina. */
    sceltoSulBancone: (pane: IdPane) => `${accorda('scelt', PAROLE_PANI[pane].genere)} sul bancone`,
    /** Sotto il nome mentre è in mano. */
    inMano: 'scegli i giorni',
    /** Solo pan di sorc: "si fa da ottobre a Pasqua". */
    stagione: (s: string) => `si fa ${s}`,
    /** Nome accessibile del gettone (con aria-pressed = in mano). */
    gettoneAria: (pane: IdPane) => {
      const p = PANI_PER_ID[pane];
      const stagione = p.stagione ? `, ${p.stagione}` : '';
      return `${p.nome}, ${alChilo(p.alKg)}. Si fa ${giorniAbituali(p.giorni)}${stagione}.`;
    },
    vassoio: {
      nome: 'il vassoio',
      sotto: 'solo la domenica',
      aria: 'Il vassoio delle paste, solo la domenica',
    },
  },

  /* ---------- in mano (striscia fissa in cima su 375 px) */
  mano: {
    inMano: (pane: IdPane) => `In mano: ${PAROLE_PANI[pane].breve}`,
    inManoVassoio: 'In mano: il vassoio',
    posa: (pane: IdPane) => (PAROLE_PANI[pane].genere === 'f' ? 'posala' : 'posalo'),
    posaVassoio: 'posalo',
    posaAria: (pane: IdPane) => `Posa ${PAROLE_PANI[pane].articolo}`,
    posaVassoioAria: 'Posa il vassoio',
  },

  /* ---------- la settimana */
  settimana: {
    aria: 'La tua settimana',
    /** Scomparto vuoto, a bassa voce. */
    vuoto: 'qui il tuo pane',
    /** Bottone del giorno quando c'è un pane in mano. */
    mettiQui: 'metti qui',
    /** Giorno valido mentre un pane è in mano. */
    siFa: 'si fa',
    /** Giorno non valido mentre un pane è in mano: "la segale si fa solo il martedì e il venerdì". */
    nonSiFa: (pane: IdPane) => siFa(PANI_PER_ID[pane], true),
    lunedi: 'lunedì siamo chiusi',
    domenica: 'solo pagnotta, ciabatta e vassoio, fino alle 12.30',
    /** Esempio fantasma del martedì (aria-hidden, non conta). */
    esempio: (pane: IdPane) => `per esempio: ${PAROLE_PANI[pane].articolo}`,
    /** Bottone del giorno senza niente in mano. */
    prendiPrima: 'Prendi prima un pane',
    /** Nome accessibile del bottone del giorno. Comincia con il testo visibile. */
    giornoAria: (giorno: IdGiorno, pane: IdPane | null, valido: boolean) => {
      if (pane === null) return `Prendi prima un pane, poi ${GIORNI[giorno].ogni}`;
      const p = PAROLE_PANI[pane];
      return valido
        ? `Metti qui ${p.articolo}, ${GIORNI[giorno].ogni}`
        : `Metti qui ${p.articolo}, ${GIORNI[giorno].ogni}: non si fa`;
    },
    giornoVassoioAria: (giorno: IdGiorno) =>
      giorno === 'dom' ? 'Metti qui il vassoio, la domenica' : `Metti qui il vassoio, ${GIORNI[giorno].ogni}: è solo la domenica`,
  },

  /* ---------- una riga dentro un giorno */
  riga: {
    /** Nome del gruppo: "Segale e cumino, il martedì". */
    aria: (pane: IdPane, giorno: IdGiorno) => `${PANI_PER_ID[pane].nome}, ${GIORNI[giorno].ogni}`,
    pezzaturaLegenda: 'Pezzatura',
    /** Nome corto nella riga: "segale", "filone" (la pezzatura è nei suoi bottoni, dove si sceglie). */
    nome: (pane: IdPane) => PAROLE_PANI[pane].breve,
    meno: 'Uno in meno',
    piu: 'Uno in più',
    menoAria: (pane: IdPane, giorno: IdGiorno) => `Uno in meno: ${PAROLE_PANI[pane].breve}, ${GIORNI[giorno].ogni}`,
    piuAria: (pane: IdPane, giorno: IdGiorno) => `Uno in più: ${PAROLE_PANI[pane].breve}, ${GIORNI[giorno].ogni}`,
    quantitaAria: (n: number) => pezzi(n, true),
    troppi: `Per più di ${MAX_PEZZI} pezzi chiamaci: li mettiamo in conto nell'impasto.`,
    chiama: RECAPITI_TESTI.chiama,
    chiamaAria: RECAPITI_TESTI.chiamaAria,
  },

  /* ---------- il vassoio dentro il pane fisso */
  vassoio: {
    legenda: 'Il vassoio della domenica',
    /** Nello scomparto della domenica: "vassoio da 750 g, ogni domenica". */
    nelGiorno: (peso: PesoVassoio, frequenza: Frequenza) =>
      `vassoio ${PAROLE_PESI[peso].frase}, ${PAROLE_FREQUENZA[frequenza].frase}`,
    pesoLegenda: 'Quanto',
    /** Bottone del peso: etichetta grande e riga sotto. */
    peso: (peso: PesoVassoio) => PAROLE_PESI[peso].etichetta,
    pesoSotto: (peso: PesoVassoio) => {
      const m = VASSOI.find((v) => v.peso === peso);
      return m ? `circa ${m.paste} paste, ${euro(m.prezzo)}` : '';
    },
    quandoLegenda: 'Quando',
    frequenza: (f: Frequenza) => PAROLE_FREQUENZA[f].frase,
    pasteLegenda: 'Quali paste',
    misto: 'misto',
    pasta: (pasta: IdPasta) => PASTE_PER_ID[pasta].nome,
    pasteAiuto: `Misto è un po' di tutto. Oppure scegli fino a ${inParole(MAX_PREFERITE)} paste.`,
    troppe: DOMENICA.troppe,
    togli: 'Togli il vassoio',
    soloDomenica: 'Il vassoio è solo la domenica.',
  },
} as const;

/* ================================================================== la frase che si scrive da sola */

/** Un pane detto in frase: "la segale il martedì e il venerdì", "due ciabatte il sabato". */
function voceFrase(pane: IdPane, pezzatura: IdPezzatura, quantita: number, giorni: readonly IdGiorno[]): string {
  const parole = PAROLE_PANI[pane];
  const datiPane = PANI_PER_ID[pane];
  const pezz = datiPane.pezzature.length > 1 ? PAROLE_PEZZATURE[pezzatura].frase : '';
  const cosa = quantita === 1 ? parole.articolo : `${inParole(quantita)} ${parole.plurale}`;
  return [cosa, pezz, giorniAbituali(giorni)].filter((p) => p.length > 0).join(' ');
}

/** Versione corta: "segale mar e ven", "2 ciabatte sab", "pagnotta 1 kg sab". */
function voceBreve(pane: IdPane, pezzatura: IdPezzatura, quantita: number, giorni: readonly IdGiorno[]): string {
  const parole = PAROLE_PANI[pane];
  const datiPane = PANI_PER_ID[pane];
  const pezz = datiPane.pezzature.length > 1 ? PAROLE_PEZZATURE[pezzatura].breve : '';
  const cosa = quantita === 1 ? parole.breve : `${quantita} ${parole.plurale}`;
  return [cosa, pezz, giorniBrevi(giorni)].filter((p) => p.length > 0).join(' ');
}

interface Gruppo {
  readonly pane: IdPane;
  readonly pezzatura: IdPezzatura;
  readonly quantita: number;
  readonly giorni: IdGiorno[];
}

/**
 * Raggruppa le righe uguali (stesso pane, pezzatura e quantità) dei vari
 * giorni: così "segale martedì" e "segale venerdì" diventano una voce sola.
 * Ordine della settimana (il primo giorno di ogni voce), poi quello della vetrina.
 */
function gruppi(s: SettimanaTesti): Gruppo[] {
  const mappa = new Map<string, Gruppo>();
  for (const g of ORDINE_GIORNI) {
    for (const r of s[g]) {
      if (r.quantita < 1) continue;
      const chiave = `${r.pane}|${r.pezzatura}|${r.quantita}`;
      const esistente = mappa.get(chiave);
      if (esistente) {
        if (!esistente.giorni.includes(g)) esistente.giorni.push(g);
      } else {
        mappa.set(chiave, { pane: r.pane, pezzatura: r.pezzatura, quantita: r.quantita, giorni: [g] });
      }
    }
  }
  const primoGiorno = (x: Gruppo) => ORDINE_GIORNI.indexOf(x.giorni[0] ?? 'dom');
  return [...mappa.values()].sort(
    (a, b) =>
      primoGiorno(a) - primoGiorno(b) ||
      ORDINE_PANI.indexOf(a.pane) - ORDINE_PANI.indexOf(b.pane) ||
      a.quantita - b.quantita,
  );
}

/**
 * Unisce le voci con la virgola; se una voce ha già una virgola dentro
 * ("il martedì, il giovedì e il sabato") usa il punto e virgola, così non si
 * confondono.
 */
function unisciVoci(voci: readonly string[]): string {
  return voci.join(voci.some((v) => v.includes(',')) ? '; ' : ', ');
}

function settimanaHaPane(s: SettimanaTesti): boolean {
  return ORDINE_GIORNI.some((g) => s[g].some((r) => r.quantita > 0));
}

/** "Il vassoio da 750 g ogni domenica, misto." */
function fraseVassoio(v: VassoioTesti): string {
  const paste = !v.misto && v.preferite.length > 0 ? `con ${elencoPaste(v.preferite)}` : 'misto';
  return `il vassoio ${PAROLE_PESI[v.peso].frase} ${PAROLE_FREQUENZA[v.frequenza].frase}, ${paste}`;
}

const FRASE_VUOTA = 'La tua settimana è ancora vuota: comincia da un pane.';
const FRASE_VUOTA_BREVE = 'La tua settimana è ancora vuota.';

export const FRASE = {
  /** Etichetta della colonna (aside) a 1440. */
  aria: 'La tua settimana, in una frase',
  vuota: FRASE_VUOTA,
  vuotaBreve: FRASE_VUOTA_BREVE,
  /** Stato "con scelte dal bancone", al posto di `vuota`: "Hai scelto la segale e la pagnotta sul bancone: mettile nei giorni." */
  sceltiDalBancone: (pani: readonly IdPane[]) => {
    if (pani.length === 0) return FRASE_VUOTA;
    const tuttiF = pani.every((p) => PAROLE_PANI[p].genere === 'f');
    let pronome = tuttiF ? 'mettile' : 'mettili';
    if (pani.length === 1) pronome = tuttiF ? 'mettila' : 'mettilo';
    return `Hai scelto ${elenco(pani.map((p) => PAROLE_PANI[p].articolo))} sul bancone: ${pronome} nei giorni.`;
  },

  /** Solo il pane: "la segale il martedì e il venerdì, la pagnotta da un chilo il sabato". Vuota se non c'è pane. */
  pane: (s: SettimanaTesti) => unisciVoci(gruppi(s).map((g) => voceFrase(g.pane, g.pezzatura, g.quantita, g.giorni))),

  /** Solo il vassoio: "Il vassoio da 750 g ogni domenica, con bignè e diplomatiche." */
  vassoio: (v: VassoioTesti) => `${maiuscola(fraseVassoio(v))}.`,

  /**
   * La cifra, sempre "circa" e sempre col "si paga al ritiro".
   * Con il vassoio una domenica sì e una no: due cifre, mai una media.
   */
  cifra: (t: TotaliFrase, v: VassoioTesti | null) => {
    if (v !== null && v.frequenza === 'alterna') {
      if (t.pane > 0) {
        return `Circa ${euro(t.pane)} a settimana di pane, più ${euro(t.vassoio)} il vassoio ogni due domeniche. Si paga al ritiro.`;
      }
      return `Circa ${euro(t.vassoio)} il vassoio, ogni due domeniche. Si paga al ritiro.`;
    }
    const totale = t.pane + (v !== null ? t.vassoio : 0);
    return `Circa ${euro(totale)} a settimana, si paga al ritiro.`;
  },

  /**
   * La frase intera:
   * "La tua settimana: la segale il martedì e il venerdì, la pagnotta da un
   * chilo il sabato. Il vassoio da 750 g ogni domenica, misto. Circa 38,50 €
   * a settimana, si paga al ritiro."
   */
  intera: (s: SettimanaTesti, v: VassoioTesti | null, t: TotaliFrase) => {
    const conPane = settimanaHaPane(s);
    if (!conPane && v === null) return FRASE_VUOTA;
    const parti: string[] = [];
    if (conPane) {
      parti.push(`La tua settimana: ${FRASE.pane(s)}.`);
      if (v !== null) parti.push(FRASE.vassoio(v));
    } else if (v !== null) {
      parti.push(`La tua settimana: ${fraseVassoio(v)}.`);
    }
    parti.push(FRASE.cifra(t, v));
    return parti.join(' ');
  },

  /** Barra chiusa su 375 px, prima riga: "segale mar e ven, pagnotta 1 kg sab, vassoio dom". */
  breve: (s: SettimanaTesti, v: VassoioTesti | null) => {
    const voci = gruppi(s).map((g) => voceBreve(g.pane, g.pezzatura, g.quantita, g.giorni));
    if (v !== null) voci.push(`vassoio ${PAROLE_PESI[v.peso].etichetta} dom`);
    return voci.length > 0 ? unisciVoci(voci) : FRASE_VUOTA_BREVE;
  },

  /** Barra chiusa su 375 px, seconda riga. */
  cifraBreve: (t: TotaliFrase, v: VassoioTesti | null) => {
    if (v !== null && v.frequenza === 'alterna') {
      return t.pane > 0
        ? `circa ${euro(t.pane)} a settimana, più il vassoio`
        : `circa ${euro(t.vassoio)} ogni due domeniche`;
    }
    return `circa ${euro(t.pane + (v !== null ? t.vassoio : 0))} a settimana`;
  },

  /**
   * Primo ritiro. `data` arriva già scritta da core/oggi.ts ("martedì 6 ottobre"),
   * `giorno` è il suo giorno della settimana. Nel prerender la riga non si scrive.
   * "Il primo sacchetto è pronto martedì 6 ottobre, dalle 7."
   */
  primoRitiro: (data: string, giorno: IdGiorno, soloVassoio: boolean) =>
    `Il primo ${soloVassoio ? 'vassoio' : 'sacchetto'} è pronto ${data}, dalle ${ORA_PRONTO[giorno] ?? '7'}.`,

  sospendi: 'Lo sospendi quando vuoi, con un messaggio o una telefonata.',
} as const;

/* ================================================================== invio, esito, calendario */

/** Cosa c'è nel primo ritiro, per la frase di successo. */
export interface PrimoRitiro {
  /** "martedì 6 ottobre", scritta da core/oggi.ts. */
  readonly data: string;
  readonly giorno: IdGiorno;
  /** I pani di quel giorno. */
  readonly pani: readonly IdPane[];
  /** C'è anche (o solo) il vassoio. */
  readonly vassoio: boolean;
}

/** "Da martedì 6 ottobre la tua segale è pronta col tuo nome sul sacchetto, dalle 7." */
function frasePronto(r: PrimoRitiro): string {
  const ora = ORA_PRONTO[r.giorno] ?? '7';
  const primo = r.pani[0];
  if (r.pani.length === 0 && r.vassoio) {
    return `Da ${r.data} il tuo vassoio è pronto col tuo nome sopra, dalle ${ora}.`;
  }
  if (r.vassoio) {
    return `Da ${r.data} il tuo pane e il vassoio sono pronti col tuo nome, dalle ${ora}.`;
  }
  if (r.pani.length === 1 && primo !== undefined) {
    const p = PAROLE_PANI[primo];
    return `Da ${r.data} ${p.tuo} è ${accorda('pront', p.genere)} col tuo nome sul sacchetto, dalle ${ora}.`;
  }
  return `Da ${r.data} il tuo pane è pronto col tuo nome sul sacchetto, dalle ${ora}.`;
}

export const INVIO = {
  legenda: 'A chi lo teniamo da parte',
  nome: {
    etichetta: 'Nome per il sacchetto',
    aiuto: 'Basta il nome, come ti chiamano al banco.',
    vuoto: 'Scrivi il nome da mettere sul sacchetto.',
    corto: 'Ci servono almeno due lettere.',
    lungo: 'Sul sacchetto ci stanno 24 lettere: accorcialo un po\'.',
  },
  contatto: {
    etichetta: 'Telefono o email',
    aiuto: 'Ti chiamiamo o scriviamo solo per il tuo pane.',
    vuoto: 'Scrivi un telefono o un\'email: ti avvisiamo solo se cambia qualcosa.',
    nonValido: 'Scrivi un numero di telefono o un\'email (nome@esempio.it).',
    /** Dopo "Cambia la settimana": il contatto non è salvato da nessuna parte. */
    riscrivi: 'Riscrivi il telefono o l\'email: non lo teniamo salvato.',
  },
  erroreSegno: COMUNI.erroreSegno,
  erroreSr: COMUNI.erroreSr,
  bottone: COMUNI.tieniDaParte,
  inCorso: 'Un momento…',
  /** Sotto il bottone, piccola: il concept non spedisce niente. */
  demo: 'È un concept: nessun ordine parte davvero e il contatto non esce da questa pagina.',

  successo: {
    /** "Fatto, Marta. Da martedì 6 ottobre la tua segale è pronta col tuo nome sul sacchetto, dalle 7." */
    frase: (nome: string, r: PrimoRitiro) => `Fatto, ${nome.trim()}. ${frasePronto(r)}`,
    /** Dopo "Cambia la settimana" e un nuovo invio. */
    aggiornato: (nome: string, data: string) => `Aggiornato, ${nome.trim()}. Da ${data} vale la settimana nuova.`,
    /** Ritorno sul sito dopo un invio (nessun annuncio all'arrivo). */
    daParte: (nome: string) => `La tua settimana è da parte, ${nome.trim()}.`,
    calendario: 'Aggiungi al calendario',
    calendarioAria: 'Aggiungi al calendario: scarica il file con i giorni di ritiro',
    /** Se il download non parte (iOS vecchi). */
    apriFile: 'Apri il file del calendario',
    cambia: 'Cambia la settimana',
    cambiaAria: 'Cambia la settimana: torna a modificare i giorni',
  },

  fallito: {
    /** Frase con il link in mezzo: prima + link + dopo. */
    prima: 'Non è partito. Riprova, o ',
    link: RECAPITI_TESTI.chiamaci,
    linkAria: RECAPITI_TESTI.chiamaciAria,
    dopo: '.',
    rassicura: 'La tua settimana è ancora qui, com\'era.',
  },

  /** Senza JavaScript, al posto del pane fisso interattivo (<noscript>). */
  noscript: {
    prima: 'Il pane fisso si fa con due tocchi, ma qui serve JavaScript. Oppure ',
    link: RECAPITI_TESTI.chiamaci,
    dopo: '.',
  },
} as const;

/** Barra del riassunto in basso su 375 px (ux §5.8). */
export const BARRA = {
  aria: 'Riassunto della tua settimana',
  vaiInvio: 'Vai all\'invio',
  vaiInvioAria: 'Vai all\'invio: nome e telefono',
  leggi: 'leggi tutto',
  leggiAria: 'Leggi tutta la frase della settimana',
  chiudi: 'chiudi',
  chiudiAria: 'Chiudi la frase della settimana',
} as const;

/** Testi del file .ics generato nel browser (sections/PaneFisso/ics.ts fa l'escape di , ; e \). */
export const ICS = {
  nomeFile: 'madre-pane-fisso.ics',
  prodid: '-//Ciceri Lab//MADRE concept//IT',
  /** "Pane fisso da MADRE: segale e pagnotta". */
  titoloPane: (pani: readonly IdPane[]) => `Pane fisso da MADRE: ${elenco(pani.map((p) => PAROLE_PANI[p].breve))}`,
  titoloVassoio: 'Vassoio della domenica da MADRE',
  descrizione: (giorno: IdGiorno) =>
    `Il sacchetto col tuo nome è pronto dalle ${ORA_PRONTO[giorno] ?? '7'} fino a chiusura. Cambi e sospensioni entro le 12 del giorno prima. MADRE è un'attività inventata: è un concept di Ciceri Lab.`,
  luogo: RECAPITI.indirizzo,
} as const;

/* ================================================================== banco 6: la bottega */

export const BOTTEGA = {
  titolo: 'la bottega',
  /** L'indirizzo è il titolo del blocco. */
  indirizzo: [RECAPITI.via, `${RECAPITI.cap} ${RECAPITI.citta}`],
  maps: 'Apri in Maps',
  mapsAria: `Apri in Maps: ${RECAPITI.via}, ${RECAPITI.citta} (si apre in una nuova scheda)`,
  mapsQuery: RECAPITI.mapsQuery,
  orariTitolo: 'Quando siamo aperti',
  /** Lista di definizioni (dt giorni, dd ore), una volta sola nel sito. */
  orari: [
    { giorni: 'lunedì', ore: 'chiuso' },
    { giorni: 'da martedì a sabato', ore: 'dalle 7 alle 13 e dalle 16.30 alle 19.30' },
    { giorni: 'domenica', ore: 'dalle 7.30 alle 12.30, solo pagnotta, ciabatta e vassoi' },
    { giorni: 'ad agosto', ore: 'due settimane di ferie, le date le scriviamo in bacheca' },
  ],
  chi: 'Renzo fa il pane, Giulia i dolci, Sabrina ti mette da parte il sacchetto.',
  parcheggio: 'Davanti si parcheggia per cinque minuti: il tempo del sacchetto.',
  nonFacciamoTitolo: 'Cosa non facciamo',
  nonFacciamo: [
    'Consegne a casa: il pane si ritira al banco. La gubana te la incartiamo per il viaggio.',
    'Torte a piani e in pasta di zucchero. Per un compleanno, una crostata o una gubana grande.',
    'Pizza, panini imbottiti, caffè: siamo un panificio, non un bar.',
    'Senza glutine non possiamo garantirlo: qui la farina è dappertutto.',
  ],
  chiama: RECAPITI_TESTI.chiama,
  chiamaAria: RECAPITI_TESTI.chiamaAria,
  scrivi: RECAPITI_TESTI.scrivi,
  scriviAria: RECAPITI_TESTI.scriviAria,
  recapitiNota: RECAPITI_TESTI.nota,
} as const;

/* ================================================================== piede */

export const PIEDE = {
  aria: 'Piede della pagina',
  paneFisso: COMUNI.ilPaneFisso,
  paneFissoAria: 'Il pane fisso: torna alla tua settimana',
  ricomincia: {
    bottone: 'Ricomincia da capo',
    domanda: 'Svuotiamo la settimana e il vassoio salvati in questo browser?',
    si: 'Sì, ricomincia',
    no: 'No, lascia così',
    fatto: 'Fatto. La settimana è vuota e il vassoio non c\'è più.',
  },
  creditiTitolo: 'Foto',
  /** "Gubana: Eric Fung, CC BY-SA 2.0" (il link va sulla licenza e sulla foto). */
  credito: (id: IdFoto, autore: string, licenza: string) => `${FOTO_SOGGETTO[id]}: ${autore}, ${licenza}`,
  creditoAria: (id: IdFoto) => `${FOTO_SOGGETTO[id]}, la foto originale (si apre in una nuova scheda)`,
  licenzaAria: (licenza: string) => `Licenza ${licenza} (si apre in una nuova scheda)`,
  finzione: 'MADRE è un\'attività inventata: persone, prezzi, indirizzo e recapiti sono di esempio.',
  conceptDi: 'Un concept di Ciceri Lab',
  mandi: 'Mandi.',
} as const;

/* ================================================================== foto: alt e soggetti dei crediti */

/**
 * Testo alternativo di ogni foto, per soggetto (scritto sulla lista foto del
 * creative-director §4.6). Il photo-editor controlla che ogni frase descriva
 * davvero la foto scelta, o chiede la correzione (copywriter.md, Richieste).
 * - impasto: foto di ripiego sotto il bottone della prova, aria-hidden: alt vuoto.
 * - nei gettoni del pane fisso le foto hanno alt vuoto (il nome è accanto).
 */
export const FOTO_ALT = {
  impasto: '',
  madre: 'Lievito madre in un vasetto di vetro, pieno di bolle.',
  vassoio: 'Un vassoio di paste mignon: bignè, cannoncini e paste di sfoglia.',
  pagnotta: 'Pagnotta di madre tagliata a metà: crosta scura e mollica chiara con i buchi fitti.',
  ciabatta: 'Ciabatta aperta: dentro, buchi grandi e irregolari.',
  integrale: 'Pane integrale tagliato: mollica scura e fitta.',
  segale: 'Pane di segale e cumino tagliato, con i semini nella mollica scura.',
  semola: 'Filone di semola: crosta dorata e mollica gialla.',
  sorc: 'Pan di sorc tagliato: mollica gialla di mais con uvetta e pezzi di fico.',
  gubana: 'Gubana tagliata: la spirale di noci e uvetta nella pasta.',
  strucolo: 'Strucolo di mele a fette: la pasta sottile arrotolata attorno alle mele.',
  crostata: 'Crostata di marmellata con la grata di frolla sopra.',
  esse: 'Biscotti di frolla a forma di S.',
  frolla: 'Biscotti di frolla di forme diverse.',
  pinza: 'Pinza di Pasqua: tonda, con i tre tagli aperti sulla crosta.',
  bigne: 'Bignè alla crema, visti da vicino.',
  cannoncini: 'Cannoncini di sfoglia pieni di crema.',
  diplomatiche: 'Diplomatica tagliata: strati di sfoglia, crema e pan di Spagna.',
  sfogliatine: 'Sfogliatine con la glassa di zucchero.',
  krapfen: 'Krapfen piccoli con lo zucchero a velo.',
} as const satisfies Record<IdFoto, string>;

/** Soggetto della foto nei crediti del piede. */
export const FOTO_SOGGETTO = {
  impasto: 'Impasto',
  madre: 'Lievito madre',
  vassoio: 'Vassoio della domenica',
  pagnotta: 'Pagnotta',
  ciabatta: 'Ciabatta',
  integrale: 'Integrale',
  segale: 'Segale e cumino',
  semola: 'Filone di semola',
  sorc: 'Pan di sorc',
  gubana: 'Gubana',
  strucolo: 'Strucolo',
  crostata: 'Crostata',
  esse: 'Esse',
  frolla: 'Biscotti di frolla',
  pinza: 'Pinza',
  bigne: 'Bignè',
  cannoncini: 'Cannoncini',
  diplomatiche: 'Diplomatiche',
  sfogliatine: 'Sfogliatine',
  krapfen: 'Krapfen',
} as const satisfies Record<IdFoto, string>;

/* ================================================================== errori del pane fisso (per codice) */

/**
 * Messaggio vicino a dove nasce l'errore (scomparto, riga, fila) e uguale
 * nell'annuncio. Inchiostro su farina, sempre con il segno "!".
 */
export const ERRORI = {
  messaggio: (e: ErroreTesti): string => {
    switch (e.codice) {
      case 'giorno-sbagliato':
        return e.pane !== null ? `${maiuscola(siFa(PANI_PER_ID[e.pane], true))}.` : 'Quel giorno questo pane non lo facciamo.';
      case 'lunedi':
        return 'Il lunedì siamo chiusi.';
      case 'domenica-limitata':
        return 'La domenica facciamo solo pagnotta e ciabatta, fino alle 12.30.';
      case 'troppi-pezzi':
        return PANE_FISSO.riga.troppi;
      case 'troppe-paste':
        return DOMENICA.troppe;
      case 'settimana-vuota':
        return 'Metti almeno un pane in un giorno, o il vassoio la domenica.';
    }
  },
  /** Quanto resta a vista il motivo nello scomparto (ux §5.8). */
  durataMs: 6000,
} as const;

/* ================================================================== annunci aria-live */

/**
 * Tutti i messaggi per la regione aria-live="polite" della pagina (una sola,
 * core/annunci.ts). Le azioni dello store li chiamano; i componenti non
 * duplicano. Mai un annuncio a ogni lettera o a ogni pixel di scroll.
 */
export const ANNUNCI = {
  /** Prima prova del dito, una volta per visita. */
  provaDito: SPIEGAZIONE_PROVA,
  puntoProva: (p: PuntoProva) => `Punto della prova: ${IMPASTO_PUNTI[p]}.`,

  /** "Nel pane fisso" lungo la vetrina. */
  sceltoDalBancone: (pane: IdPane, scelto: boolean) => {
    const p = PAROLE_PANI[pane];
    return scelto
      ? `${maiuscola(p.breve)} ${accorda('scelt', p.genere)} per il pane fisso.`
      : `${maiuscola(p.breve)} ${accorda('tolt', p.genere)} dal pane fisso.`;
  },
  /** "Sul vassoio" lungo la vetrina e nel pane fisso. */
  sulVassoio: (pasta: IdPasta, messa: boolean) => {
    const p = PAROLE_PASTE[pasta];
    return messa
      ? `${maiuscola(p.minuscolo)} sul vassoio.`
      : `${maiuscola(p.minuscolo)} ${accorda('tolt', p.genere, true)} dal vassoio.`;
  },

  /** Pane in mano: "Segale in mano. Si fa il martedì e il venerdì. Scegli i giorni." */
  inMano: (pane: IdPane) => {
    const p = PANI_PER_ID[pane];
    const stagione = p.stagione ? `, ${p.stagione}` : '';
    return `${maiuscola(PAROLE_PANI[pane].breve)} in mano. Si fa ${giorniAbituali(p.giorni)}${stagione}. Scegli i giorni.`;
  },
  vassoioInMano: 'Il vassoio in mano. Va solo la domenica.',
  posato: (pane: IdPane) => `${maiuscola(PAROLE_PANI[pane].breve)} ${accorda('posat', PAROLE_PANI[pane].genere)}.`,
  vassoioPosato: 'Vassoio posato.',
  prendiPrima: 'Prendi prima un pane dalla fila.',

  /** Messo in un giorno: "Segale messa il martedì, 500 grammi." */
  messo: (pane: IdPane, pezzatura: IdPezzatura, giorno: IdGiorno) => {
    const p = PAROLE_PANI[pane];
    return `${maiuscola(p.breve)} ${accorda('mess', p.genere)} ${GIORNI[giorno].ogni}, ${PAROLE_PEZZATURE[pezzatura].sr}.`;
  },
  /** Più e meno (debounce 600 ms): "Segale, il martedì: due pezzi." */
  quantita: (pane: IdPane, giorno: IdGiorno, n: number) =>
    `${maiuscola(PAROLE_PANI[pane].breve)}, ${GIORNI[giorno].ogni}: ${pezzi(n, true)}.`,
  /** Cambio di pezzatura: "Pagnotta del sabato: un chilo." */
  pezzatura: (pane: IdPane, giorno: IdGiorno, pezzatura: IdPezzatura) =>
    `${maiuscola(PAROLE_PANI[pane].breve)}, ${GIORNI[giorno].ogni}: ${PAROLE_PEZZATURE[pezzatura].sr}.`,
  /** Tolto: "Segale tolta dal martedì." */
  tolto: (pane: IdPane, giorno: IdGiorno) => {
    const p = PAROLE_PANI[pane];
    return `${maiuscola(p.breve)} ${accorda('tolt', p.genere)} ${GIORNI[giorno].dal}.`;
  },
  /** Errore per codice (stesso testo dello scomparto). */
  errore: (e: ErroreTesti) => ERRORI.messaggio(e),
  vassoioSoloDomenica: PANE_FISSO.vassoio.soloDomenica,

  /** Vassoio messo: "Vassoio da 750 grammi, ogni domenica, misto." */
  vassoioMesso: (v: VassoioTesti) => {
    const paste = !v.misto && v.preferite.length > 0 ? `con ${elencoPaste(v.preferite)}` : 'misto';
    return `Vassoio da ${PAROLE_PESI[v.peso].sr}, ${PAROLE_FREQUENZA[v.frequenza].frase}, ${paste}.`;
  },
  vassoioTolto: 'Vassoio tolto dalla domenica.',
  pesoVassoio: (peso: PesoVassoio) => {
    const m = VASSOI.find((x) => x.peso === peso);
    return m
      ? `Vassoio da ${PAROLE_PESI[peso].sr}: circa ${m.paste} paste, ${euro(m.prezzo)}.`
      : `Vassoio da ${PAROLE_PESI[peso].sr}.`;
  },
  frequenzaVassoio: (f: Frequenza) => `Il vassoio ${PAROLE_FREQUENZA[f].frase}.`,
  vassoioMisto: 'Vassoio misto: un po\' di tutto.',

  /** Frase riassuntiva (debounce 800 ms): solo la cifra, il resto lo dicono le azioni. */
  cifra: (t: TotaliFrase, v: VassoioTesti | null) => FRASE.cifra(t, v),

  /** Invio. */
  inCorso: INVIO.inCorso,
  successo: (nome: string, r: PrimoRitiro) => INVIO.successo.frase(nome, r),
  aggiornato: (nome: string, data: string) => INVIO.successo.aggiornato(nome, data),
  fallito: 'Non è partito. La tua settimana è ancora qui, com\'era. Puoi riprovare o chiamarci.',
  settimanaSbloccata: 'Puoi cambiare la settimana.',

  /** Bozza e piede. */
  bozzaRitrovata: PANE_FISSO.bozza.frase,
  bozzaSvuotata: 'Settimana svuotata.',
  ricominciato: PIEDE.ricomincia.fatto,

  /** Barra del riassunto su 375 px. */
  barraAperta: 'Frase della settimana aperta.',
  barraChiusa: 'Frase della settimana chiusa.',
} as const;

/* ================================================================== esportazione unica */

export const TESTI = {
  meta: META,
  vetrinaSito: VETRINA_SITO,
  comuni: COMUNI,
  salti: SALTI,
  recapiti: RECAPITI_TESTI,
  testata: TESTATA,
  banchi: BANCHI,
  rigaBanchi: RIGA_BANCHI,
  impasto: IMPASTO,
  vetrina: VETRINA,
  bancoPane: BANCO_PANE,
  laMadre: LA_MADRE,
  bancoDolci: BANCO_DOLCI,
  domenica: DOMENICA,
  paneFisso: PANE_FISSO,
  frase: FRASE,
  invio: INVIO,
  barra: BARRA,
  ics: ICS,
  bottega: BOTTEGA,
  piede: PIEDE,
  fotoAlt: FOTO_ALT,
  fotoSoggetto: FOTO_SOGGETTO,
  errori: ERRORI,
  annunci: ANNUNCI,
  giorni: GIORNI,
  parolePani: PAROLE_PANI,
  parolePezzature: PAROLE_PEZZATURE,
  parolePaste: PAROLE_PASTE,
  parolePesi: PAROLE_PESI,
  paroleFrequenza: PAROLE_FREQUENZA,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
