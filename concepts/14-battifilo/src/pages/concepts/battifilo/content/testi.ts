/**
 * BATTIFILO · tutti i testi visibili del sito (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter, non si inventa. Nessun trattino lungo,
 * nessun punto esclamativo, nessun occhiello numerato, nessun maiuscolo nei
 * testi di lettura (il maiuscolo lo fa il CSS solo sulle marcature a stencil).
 * "Misura e manda" è l'unica etichetta del richiamo; "Manda le misure" è
 * l'atto dentro il flusso.
 *
 * Le funzioni inseriscono valori già calcolati (euro, misure, date, nomi) in
 * frasi scritte qui: non calcolano prezzi né date.
 *
 * Telefono ed email non compaiono mai a vista: solo come href di "Chiama",
 * "Scrivi", "Chiama Loris", "chiama l’ufficio" (da `impresa.ts`).
 */

import { BILANCIO, GIORNI_METEO, MESI, TOTALE, type Fermo, type Mese } from './cantiere';
import {
  ALTRO_COMUNE,
  COMUNI_SERVITI,
  ORARI,
  PROMESSE,
  QUANDO,
  RAGGIO_KM,
  RECAPITI,
  type Quando,
} from './impresa';
import { A_PARTE, LIMITI, PORTA, QUANTE, type Materiale, type TipoFinestra } from './prezzi';

/* ================================================================== aiuti */

/**
 * Euro all'italiana: "160 €", "1.090 €", "412.500 €", "8,50 €".
 * (Intl it-IT non mette il punto delle migliaia a 4 cifre, per questo è a mano.)
 */
export function euro(valore: number): string {
  const negativo = valore < 0;
  const assoluto = Math.abs(valore);
  const intero = Math.floor(assoluto + 1e-9);
  const centesimi = Math.round((assoluto - intero) * 100);
  const interoTxt = String(intero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const testo = centesimi > 0 ? `${interoTxt},${String(centesimi).padStart(2, '0')}` : interoTxt;
  return `${negativo ? 'meno ' : ''}${testo} €`;
}

/** Euro detti dal lettore di schermo: "41.200 euro". */
export function euroParlati(valore: number): string {
  return euro(valore).replace(' €', ' euro');
}

/** Numero all'italiana con la virgola: "1,68", "118", "118,5". */
export function numero(valore: number, decimali = 0): string {
  const fisso = valore.toFixed(decimali);
  const [intero = '0', dec] = fisso.split('.');
  const interoTxt = intero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPulito = dec ? dec.replace(/0+$/, '') : '';
  return decPulito ? `${interoTxt},${decPulito}` : interoTxt;
}

/** "1,68 m²" */
export function metriQuadri(m2: number): string {
  return `${numero(m2, 2)} m²`;
}

/** "118 × 142" (in cm, senza unità: la unità la dice il contesto) */
export function misure(larghezza: number, altezza: number): string {
  return `${numero(larghezza, 1)} × ${numero(altezza, 1)}`;
}

/** "3,6%" */
export function percento(valore: number): string {
  return `${numero(valore, 1)}%`;
}

const MESI_NOME = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
] as const;

const MESI_BREVE = [
  'gen',
  'feb',
  'mar',
  'apr',
  'mag',
  'giu',
  'lug',
  'ago',
  'set',
  'ott',
  'nov',
  'dic',
] as const;

/** Da 'AAAA-MM-GG' a parti numeriche; null se il testo non è una data. */
function partiData(iso: string): { anno: number; mese: number; giorno: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const anno = Number(m[1]);
  const mese = Number(m[2]);
  const giorno = Number(m[3]);
  if (mese < 1 || mese > 12 || giorno < 1 || giorno > 31) return null;
  return { anno, mese, giorno };
}

/** 'AAAA-MM-GG' → "26 settembre" (l'anno non si dice: è sempre quest'anno). */
export function dataLunga(iso: string): string {
  const p = partiData(iso);
  if (!p) return '';
  return `${p.giorno} ${MESI_NOME[p.mese - 1] ?? ''}`;
}

/** 'AAAA-MM-GG' → "26 set": la data marcata a spruzzo (lo stencil la mette in maiuscolo). */
export function dataStencil(iso: string): string {
  const p = partiData(iso);
  if (!p) return '';
  return `${p.giorno} ${MESI_BREVE[p.mese - 1] ?? ''}`;
}

/**
 * Quando arriva la richiamata, dal giorno dell'invio ('AAAA-MM-GG'):
 * da domenica a giovedì "entro domani", venerdì e sabato "lunedì".
 * Senza data (prerender) "entro il giorno lavorativo dopo".
 * Le feste non si contano: è una promessa di ufficio, non un calendario.
 */
export function richiamata(oggiIso: string | null): string {
  const p = oggiIso ? partiData(oggiIso) : null;
  if (!p) return 'entro il giorno lavorativo dopo';
  const giorno = new Date(p.anno, p.mese - 1, p.giorno).getDay();
  return giorno === 5 || giorno === 6 ? 'lunedì' : 'entro domani';
}

/** "9 finestre uguali" / "1 finestra" */
export function quanteFinestre(n: number): string {
  return n === 1 ? '1 finestra' : `${n} finestre uguali`;
}

/* ================================================================== meta e vetrina */

export const META = {
  /** <title>: 58 caratteri. Dice "Concept" nello snippet e scrive "Ciceri Lab" come il prerender. */
  title: 'Concept 14 · BATTIFILO, edilizia e serramenti | Ciceri Lab',
  /** meta description: 155 caratteri. Dice subito che l'impresa è inventata. */
  description:
    "Concept di Ciceri Lab: il sito di un’impresa edile e di serramenti di Cordenons, inventata. Tira il filo e leggi 14 mesi di cantiere, poi misura la tua finestra.",
  ogTitle: 'BATTIFILO, impresa edile e serramenti. Un concept di Ciceri Lab',
  ogDescription:
    'Quattordici mesi di cantiere, mese per mese, con costi e fermi. Misura la tua finestra e vedila battuta accanto a una porta. Un concept di Ciceri Lab.',
  /** Testo alternativo dell'immagine di anteprima (public/concepts/concept-14.jpg). */
  ogImageAlt:
    'Una linea blu di battifilo battuta su una lastra di calcestruzzo, con i mesi del cantiere marcati a stencil sotto.',
} as const;

/** Proposta per la voce CONCEPTS in site.ts del sito vero. */
export const VETRINA = {
  tag: 'Impresa edile e serramenti',
  title: 'BATTIFILO',
  subtitle: 'Impresa edile e serramenti · Cordenons',
  desc: 'Tiri il filo e passano i 14 mesi di un cantiere tipo, con quanto è costato ogni mese e dove si è fermato. Poi misuri la tua finestra e la vedi battuta in scala, con la forbice di prezzo. Con le foto di un cantiere vero, una al mese col telefono, diventa la cronaca della tua impresa.',
  perche:
    "Chi costruisce ha paura di due cose: quanto dura e quanto costa. Il sito risponde con il gesto più vecchio del cantiere, la corda blu che batte una linea dritta, e con i buchi dove il cantiere si è fermato.",
  mestieri: [
    'impresa edile',
    'impresa di costruzioni',
    'muratore',
    'costruttore',
    'serramenti',
    'serramentista',
    'finestre',
    'infissi',
    'ristrutturazioni',
    'cappotto',
    'edilizia',
  ],
} as const;

/* ================================================================== comuni */

export const COMUNI = {
  marchio: 'Battifilo',
  marchioAria: 'Battifilo, torna all’inizio della cronaca',
  marchioSotto: 'costruzioni e serramenti',
  /** l'unica etichetta del richiamo */
  misuraEManda: 'Misura e manda',
  misuraEMandaAria: 'Misura e manda: misura la tua finestra e chiedi il sopralluogo',
  tornaAllaCronaca: 'Torna alla cronaca',
  chiudi: 'Chiudi',
  leggiTuttiIMesi: 'Leggi tutti i mesi',
  diPiu: 'Di più',
  meno: 'Meno',
  nuovaScheda: 'si apre in una nuova scheda',
  /** la dichiarazione delle foto (S0, S5) */
  fotoDiverse: 'Un cantiere tipo, raccontato con foto di cantieri diversi.',
  fotoDiverseBreve: 'Foto di cantieri diversi.',
  /** la riga delle cifre (prima comparsa in ogni schermata) */
  cifreEsempio: 'Cifre di un cantiere tipo, IVA esclusa.',
  /** nota del Lab, in fondo alla lastra e nel piede dei documenti */
  conceptDi: 'Un concept di Ciceri Lab.',
  finzione: 'Attività inventata.',
  finzioneLunga:
    "Un concept di Ciceri Lab. L’impresa, le persone e i recapiti sono inventati; le cifre sono di esempio.",
  obbligatorio: 'obbligatorio',
  facoltativo: 'facoltativo',
} as const;

export const SALTI = {
  filo: 'Vai al filo del tempo',
  misura: 'Vai a Misura e manda',
  mesi: 'Leggi tutti i mesi',
} as const;

/* ================================================================== fascia alta e bassa */

export const FASCIA = {
  navAria: 'Principale',
  scorciatoieAria: 'Scorciatoie',
  cronaca: 'Cronaca',
  cronacaAria: 'Cronaca del cantiere, torna alla linea dei mesi',
  cartello: 'Il cartello',
  cartelloAria: 'Il cartello: chi siamo, dove, orari',
  menu: 'Menu',
  menuAria: 'Apri il menu',
  chiudiMenu: 'Chiudi',
  chiudiMenuAria: 'Chiudi il menu',
  /** dentro il menu del telefono */
  menuTitolo: 'Menu',
  ciSei: 'ci sei',
  tuttiIMesi: 'Tutti i mesi',
  seiQui: (voce: string) => `${voce}, ci sei`,
} as const;

/* ================================================================== S0 · apertura */

export const APERTURA = {
  /** h1, a stencil, due righe: il CSS lo mette in maiuscolo */
  titolo: 'Quattordici mesi, dallo scavo alle chiavi.',
  /** riga sotto il titolo: 96 caratteri, 15 parole */
  riga: 'La cronaca di un cantiere tipo a Cordenons: cosa si fa ogni mese, chi c’è, quanto costa.',
  /** ≤ 20 parole, per lo spazio a 375×667 */
  dichiarazione: COMUNI.fotoDiverse,
  /** l'istruzione del controllo, una volta sola, vicino alla cassetta */
  istruzione: 'Tira il filo per far passare i mesi.',
  /** testo del pulsante a fuoco sull'istruzione, per chi non trascina */
  istruzioneAria: 'Tira il filo per far passare i mesi. Oppure usa le frecce sulla cassetta.',
  /** nome della tappa 0 nella linea */
  tacca: 'Prima',
  taccaAria: 'Prima dello scavo: il terreno',
} as const;

/* ================================================================== S1 · schede dei mesi */

/** "ottobre, mese 8" */
export function meseERango(m: Pick<Mese, 'nome' | 'n'>): string {
  return `${m.nome}, mese ${m.n}`;
}

/** "Ottobre, mese 8" con la maiuscola (h3 di Tutti i mesi, aria-label delle tacche) */
export function meseERangoMaiuscolo(m: Pick<Mese, 'nome' | 'n'>): string {
  const testo = meseERango(m);
  return testo.charAt(0).toUpperCase() + testo.slice(1);
}

export const SCHEDA = {
  /** etichette in linea col testo, Chivo 700, minuscole */
  fatto: 'Fatto',
  chiCera: 'Chi c’era',
  controlla: 'Controlla tu',
  fermi: 'Fermi',
  /** "speso finora 238.400 € su 412.500 €" */
  finora: (finora: number) => `speso finora ${euro(finora)} su ${euro(TOTALE)}`,
  /** "elettricisti 2, idraulici 2. 19 giorni in cantiere." */
  chiERiga: (m: Pick<Mese, 'chi' | 'giorni'>) =>
    `${m.chi}. ${m.giorni} ${m.giorni === 1 ? 'giorno' : 'giorni'} in cantiere.`,
  /** aggiunta alla riga di "chi c’era" quando ci sono fermi: "Fermi: 5 fermi per pioggia." */
  fermiRiga: (fermi: readonly Fermo[]) =>
    fermi.length === 0 ? '' : `Fermi: ${fermi.map((f) => f.breve).join(', ')}.`,
  /** solo nei mesi 7 e 12: link contestuale a Misura e manda */
  tuaFinestra: 'Quanto costerebbe la tua finestra?',
  tuaFinestraAria: 'Quanto costerebbe la tua finestra? Apri Misura e manda',
  /** "Di più" espande: nome accessibile completo */
  diPiuAria: (m: Pick<Mese, 'nome' | 'n'>) => `Di più su ${meseERango(m)}`,
  menoAria: (m: Pick<Mese, 'nome' | 'n'>) => `Meno su ${meseERango(m)}`,
  /** didascalia della foto sulla lastra: "Tracce degli impianti in un’altra casa. Foto di N. Cognome, Unsplash." */
  didascalia: (cosa: string, autore: string, fonte: string) => `${cosa} Foto di ${autore}, ${fonte}.`,
  /** mese senza foto (piano B o errore di caricamento): nessun messaggio a vista, solo per il lettore di schermo */
  senzaFotoSr: (m: Pick<Mese, 'nome' | 'n'>) => `Nessuna foto per ${meseERango(m)}.`,
  /** l'h1 di S0 resta nel DOM, nascosto, quando si è su un mese */
  h1Sr: APERTURA.titolo,
} as const;

/* ================================================================== S2 · le chiavi */

const variantiTesto = BILANCIO.varianti
  .map((v) => `${v.cosa} (${euro(v.euro)})`)
  .join(' e ');

export const CHIAVI = {
  titolo: 'Le chiavi',
  tacca: 'Chiavi',
  taccaAria: `Le chiavi: ${BILANCIO.durataMesi} mesi, finale ${euro(BILANCIO.finale)}`,
  totale: euro(BILANCIO.finale),
  totaleSotto: `${BILANCIO.superficieM2} m² in laterizio e cemento armato, ${euro(Math.round(BILANCIO.finale / BILANCIO.superficieM2 / 10) * 10)} al metro quadro. ${COMUNI.cifreEsempio}`,
  /** le quattro righe del <dl> */
  tempi: 'Tempi',
  tempiTesto: `${BILANCIO.durataMesi} mesi, dal ${BILANCIO.inizio.giorno} ${MESI_NOME[BILANCIO.inizio.mese - 1] ?? ''} al ${BILANCIO.chiavi.giorno} ${MESI_NOME[BILANCIO.chiavi.mese - 1] ?? ''} dell’anno dopo. ${GIORNI_METEO} giorni fermi per pioggia e gelo. Le ferie di agosto e di Natale erano nel calendario dalla firma.`,
  soldi: 'Soldi',
  soldiTesto: `Preventivo firmato ${euro(BILANCIO.preventivo)}, finale ${euro(BILANCIO.finale)}: più ${percento(BILANCIO.scostamentoPercento)}. La differenza sono due varianti che hai chiesto tu, ${variantiTesto}, scritte e firmate prima di farle.`,
  consegna: 'Con le chiavi ti diamo',
  consegnaVoci: [
    "l’attestato di prestazione energetica, con la classe della casa",
    'le dichiarazioni di conformità degli impianti',
    'il libretto della pompa di calore',
    'il manuale d’uso e manutenzione dei serramenti',
    'i disegni degli impianti come sono stati fatti, con le foto delle tracce',
  ],
  dopo: 'Per il primo anno',
  dopoTesto: 'Il numero di Loris, il capocantiere: lo stesso dal tracciamento a oggi.',
  chiamaLoris: 'Chiama Loris',
  chiamaLorisAria: 'Chiama Loris, il capocantiere. Numero di esempio',
  chiamaLorisHref: RECAPITI.capocantiereHref,
  /** link in fondo alla lastra */
  cartello: 'Il cartello: chi siamo e dove',
  rileggi: 'Rileggi tutti i mesi',
  /** su telefono, "Di più" apre consegna e dopo */
  diPiuAria: 'Di più sulle chiavi: cosa ti diamo e chi chiami dopo',
} as const;

/* ================================================================== la linea (filo del tempo) */

export const LINEA = {
  /** la cassetta: role="slider" */
  sliderAria: 'Filo del tempo',
  sliderIstruzioniSr:
    'Frecce: un mese avanti o indietro. Pagina su e giù: tre mesi. Home: prima dello scavo. Fine: le chiavi.',
  taccheAria: 'Mesi del cantiere',
  gancioSr: 'Inizio del filo',
  /** aria-label completo della tacca: "Agosto, mese 6: struttura del tetto" */
  taccaAria: (m: Pick<Mese, 'nome' | 'n' | 'fase'>) => `${meseERangoMaiuscolo(m)}: ${m.fase.toLowerCase()}`,
  /** il nome completo che compare sopra la tacca al passaggio o a fuoco */
  taccaTitolo: (m: Pick<Mese, 'nome' | 'fase'>) =>
    `${m.nome.charAt(0).toUpperCase()}${m.nome.slice(1)}: ${m.fase.toLowerCase()}`,
  /** il buco sopra la linea: bottone invisibile che mostra `fermo.riga` */
  bucoAria: (fermo: Fermo) => fermo.riga,
  /** telefono: i due bottoni ai lati */
  mesePrima: 'Mese prima',
  meseDopo: 'Mese dopo',
  /** annuncio aria-live 500 ms dopo la fermata (se il cambio non viene dallo slider a fuoco) */
  annuncio: (m: Pick<Mese, 'nome' | 'n' | 'fase' | 'costo'>) =>
    `${meseERangoMaiuscolo(m)}: ${m.fase.toLowerCase()}. ${euroParlati(m.costo)}.`,
  annuncioPrima: 'Prima dello scavo: il terreno.',
  annuncioChiavi: CHIAVI.taccaAria,
  /** tacca "TU", prima del gancio, dopo un invio riuscito */
  tu: 'Tu',
  tuMisure: (larghezza: number, altezza: number) => misure(larghezza, altezza),
  tuDoppia: '×2',
  tuAria: (tipo: TipoFinestra, larghezza: number, altezza: number, dataIso: string) =>
    `La tua finestra ${TIPI_NOMI[tipo].inFrase}, ${numero(larghezza, 1)} per ${numero(altezza, 1)}, mandata il ${dataLunga(dataIso)}. Apri Misura e manda`,
  tuTitolo: (dataIso: string) => `Le tue misure, mandate il ${dataLunga(dataIso)}. Ti chiama Davide.`,
} as const;

/**
 * aria-valuetext dello slider, per le 16 posizioni.
 * 0: "Prima dello scavo: il terreno."
 * 1-14: "Mese 8, ottobre: impianti. 41.200 euro. Speso finora 238.400 euro." + fermi
 * 15: "Le chiavi: 14 mesi, finale 412.500 euro."
 */
export function valoreParlante(tappa: number): string {
  if (tappa <= 0) return LINEA.annuncioPrima;
  if (tappa >= 15) return `Le chiavi: ${BILANCIO.durataMesi} mesi, finale ${euroParlati(BILANCIO.finale)}.`;
  const m = MESI[tappa - 1];
  if (!m) return '';
  const fermi = m.fermi.map((f) => ` ${f.parlato}`).join('');
  return `Mese ${m.n}, ${m.nome}: ${m.fase.toLowerCase()}. ${euroParlati(m.costo)}. Speso finora ${euroParlati(m.finora)}.${fermi}`;
}

/* ================================================================== nomi condivisi di Misura e manda */

export const TIPI_NOMI = {
  'un-anta': { nome: 'Finestra a un’anta', breve: 'un’anta', inFrase: 'a un’anta', articolo: 'Una finestra alta' },
  'due-ante': { nome: 'Finestra a due ante', breve: 'due ante', inFrase: 'a due ante', articolo: 'Una finestra alta' },
  portafinestra: { nome: 'Portafinestra', breve: 'portafinestra', inFrase: 'portafinestra', articolo: 'Una portafinestra alta' },
  scorrevole: { nome: 'Scorrevole alzante', breve: 'scorrevole', inFrase: 'scorrevole alzante', articolo: 'Uno scorrevole alzante alto' },
} as const satisfies Record<TipoFinestra, { nome: string; breve: string; inFrase: string; articolo: string }>;

export const MATERIALI_NOMI = {
  pvc: {
    nome: 'PVC',
    carattere: 'Non si vernicia mai. Il più economico, telaio un po’ più largo.',
  },
  'legno-alluminio': {
    nome: 'Legno-alluminio',
    carattere: 'Legno dentro, alluminio fuori: sole e pioggia li prende l’alluminio.',
  },
  legno: {
    nome: 'Legno',
    carattere: 'Il più caldo in casa. Fuori va ridipinto ogni 8-10 anni.',
  },
} as const satisfies Record<Materiale, { nome: string; carattere: string }>;

export const QUANDO_NOMI = {
  mattina: 'mattina',
  pomeriggio: 'pomeriggio',
  sabato: 'sabato mattina',
} as const satisfies Record<Quando, string>;

/* ================================================================== S3 · Misura e manda */

export const MISURA = {
  titolo: 'Misura e manda',
  intro: 'Prendi il metro, scrivi due numeri, vedi quanto costa. Poi veniamo noi a rimisurare.',

  comeSiMisura: {
    titolo: 'Come si misura la luce',
    righe: [
      'Misura la larghezza in alto, al centro e in basso, da muro a muro. Tieni la più piccola.',
      "Fai lo stesso con l’altezza, dal davanzale all’architrave.",
      "Se c’è ancora il telaio vecchio, misura dove vedi l’intonaco: al sopralluogo rimisuriamo noi al millimetro.",
    ],
    schemaAlt: 'Una finestra vista da dentro: tre frecce in larghezza e tre in altezza, dove si misura.',
  },

  cheCosa: {
    legenda: 'Che cosa',
    opzioni: (['un-anta', 'due-ante', 'portafinestra', 'scorrevole'] as const).map((id) => ({
      id,
      nome: TIPI_NOMI[id].nome,
    })),
  },

  larghezza: {
    etichetta: 'Larghezza',
    unita: 'cm',
    aiuto: `tra ${LIMITI.min} e ${LIMITI.max} cm`,
    aria: 'Larghezza della luce in centimetri',
  },
  altezza: {
    etichetta: 'Altezza',
    unita: 'cm',
    aiuto: `tra ${LIMITI.min} e ${LIMITI.max} cm`,
    aria: 'Altezza della luce in centimetri',
  },

  quante: {
    legenda: 'Quante uguali',
    meno: 'Una finestra in meno',
    piu: 'Una finestra in più',
    aria: 'Quante finestre uguali',
    /** annuncio live dopo il clic */
    annuncio: (n: number) => quanteFinestre(n),
    /** Q1: a 20 */
    massimo: `Più di ${QUANTE.max}? Dillo al telefono: al sopralluogo le contiamo insieme.`,
    /** fuori 1-20 scritto a mano: si riporta al limite */
    riportato: (n: number) => `Da ${QUANTE.min} a ${QUANTE.max}: ho messo ${n}.`,
  },

  /** il piano di tracciamento */
  piano: {
    figcaption: `La porta è ${PORTA.larghezza} × ${PORTA.altezza} cm. Stessa scala.`,
    portaQuota: `${PORTA.larghezza} × ${PORTA.altezza}`,
    /** P0: il filo teso non battuto, al posto della finestra */
    vuoto: 'Scrivi le tue due misure: la battiamo qui, accanto alla porta.',
    /** sotto la finestra battuta */
    luce: (m2: number) => `${metriQuadri(m2)} di luce`,
    /** quota del davanzale, quando c'è */
    davanzale: (cm: number) => `davanzale a ${cm} cm`,
    /** testo per il lettore di schermo, debounce 1 s */
    descrizioneSr: (tipo: TipoFinestra, larghezza: number, altezza: number, m2: number) =>
      `La tua finestra ${TIPI_NOMI[tipo].inFrase}, ${numero(larghezza, 1)} per ${numero(altezza, 1)} centimetri, ${numero(m2, 2)} metri quadri di luce, disegnata accanto a una porta da ${PORTA.larghezza} per ${PORTA.altezza}.`,
    descrizioneVuotaSr: `Il piano di tracciamento: una porta da ${PORTA.larghezza} per ${PORTA.altezza} centimetri e, accanto, lo spazio dove verrà disegnata la tua finestra.`,
    descrizioneParzialeSr: (lato: 'larghezza' | 'altezza', cm: number) =>
      `Per ora solo la ${lato}: ${numero(cm, 1)} centimetri. Manca l'altra misura.`,
  },

  /** errori delle misure (E1-E6), sotto il campo; il filo è molle */
  errori: {
    troppoPiccola: (cm: number) => `Una finestra da ${numero(cm, 1)} cm non esiste: controlla la misura.`,
    troppoGrande: `Oltre 3 metri è una vetrata: scrivi fino a ${LIMITI.max} e il resto lo misuriamo noi al sopralluogo.`,
    millimetri: (mm: number, cm: number) => `Forse hai scritto in millimetri: ${numero(mm)} mm sono ${numero(cm, 1)} cm.`,
    metri: (m: number, cm: number) => `Forse hai scritto in metri: ${numero(m, 2)} m sono ${numero(cm, 1)} cm.`,
    nonNumero: 'Scrivi solo i centimetri, per esempio 118.',
    enorme: `Controlla la misura: scrivila in centimetri, tra ${LIMITI.min} e ${LIMITI.max}.`,
    /** bottone di correzione: "Usa 118" con nome completo */
    usa: (cm: number) => `Usa ${numero(cm, 1)}`,
    usaAria: (cm: number, lato: 'larghezza' | 'altezza') => `Usa ${numero(cm, 1)} centimetri come ${lato}`,
  },

  /** avvisi di coerenza (A1), non bloccano */
  coerenza: {
    forseFinestra: (tipo: TipoFinestra, cm: number) =>
      `${TIPI_NOMI[tipo].articolo} ${numero(cm, 1)} cm? Di solito è una finestra.`,
    faiFinestra: 'Fai finestra',
    faiFinestraAria: 'Cambia in finestra a due ante',
    forsePortafinestra: (cm: number) =>
      `Una finestra alta ${numero(cm, 1)} cm di solito parte da terra: è una portafinestra?`,
    faiPortafinestra: 'Fai portafinestra',
    faiPortafinestraAria: 'Cambia in portafinestra',
  },

  forbice: {
    titolo: 'La forbice',
    legenda: 'Quale ti interessa di più?',
    legendaNota: COMUNI.facoltativo,
    nonSo: 'Non so ancora',
    /** P0: senza cifre */
    vuota: 'La forbice compare con le due misure.',
    /** "da 920 € a 1.330 € a pezzo" */
    pezzo: (min: number, max: number) => `da ${euro(min)} a ${euro(max)} a pezzo`,
    /** nome accessibile del radio: "PVC, da 920 a 1.330 euro a pezzo. Non si vernicia mai…" */
    rigaAria: (materiale: Materiale, min: number, max: number) =>
      `${MATERIALI_NOMI[materiale].nome}, da ${euroParlati(min)} a ${euroParlati(max)} a pezzo. ${MATERIALI_NOMI[materiale].carattere}`,
    /** totale sotto l'asse */
    totale: (quante: number, min: number, max: number) =>
      quante === 1
        ? `Per una finestra: da ${euro(min)} a ${euro(max)}.`
        : `Per ${quanteFinestre(quante)}: da ${euro(min)} a ${euro(max)}.`,
    /** annuncio live del totale, debounce 800 ms */
    totaleAria: (materiale: Materiale, min: number, max: number, quante: number, totMin: number, totMax: number) =>
      `${MATERIALI_NOMI[materiale].nome} da ${euroParlati(min)} a ${euroParlati(max)} a pezzo; per ${quante}, da ${euroParlati(totMin)} a ${euroParlati(totMax)}.`,
    compreso: 'Prezzi indicativi per pezzo, posa e smontaggio del vecchio compresi, IVA esclusa.',
    aParte: `Tapparelle e scuri a parte: da ${euro(A_PARTE.tapparellaDa)} a tapparella, da ${euro(A_PARTE.scuriCoppiaDa)} la coppia di scuri.`,
    detrazioni: 'Detrazioni fiscali: te ne parliamo al sopralluogo.',
    /** l'asse comune: estremi a stencil piccolo */
    asseDa: euro(0),
    asseA: (max: number) => euro(max),
    asseSr: 'Asse dei prezzi, uguale per i tre materiali.',
    posatori: 'La posa la fanno Ivan e Marius, dell’impresa: non una squadra a chiamata.',
  },

  contatti: {
    titolo: 'Dove ti richiamiamo',
    nome: 'Nome',
    nomeAria: 'Il tuo nome',
    contatto: 'Telefono o email',
    contattoAiuto: 'uno dei due basta',
    comune: 'Comune',
    comuneOpzioni: [...COMUNI_SERVITI.map((c) => ({ id: c, nome: c })), { id: ALTRO_COMUNE, nome: 'Altro comune' }],
    comuneScegli: 'Scegli il comune',
    altroComune: 'Quale comune?',
    altroComuneRiga: `Lavoriamo fino a ${RAGGIO_KM} km da Cordenons: ti diciamo subito se ci arriviamo.`,
    quando: 'Quando preferisci il sopralluogo',
    quandoOpzioni: QUANDO.map((id) => ({ id, nome: QUANDO_NOMI[id] })),
    rassicura: 'Ti chiamiamo solo per questo sopralluogo. Niente commerciali.',
    promessa: 'Ti chiamiamo entro il giorno lavorativo dopo. Al sopralluogo rimisuriamo noi al millimetro.',
  },

  invio: {
    bottone: 'Manda le misure',
    inCorso: 'Mando le misure',
    inCorsoAria: 'Invio in corso',
    /** I0: cosa manca, sotto il bottone (sempre, anche prima di premere) */
    mancano: (cose: readonly string[]) =>
      cose.length === 0 ? '' : `Per mandarle mancano: ${elenco(cose)}.`,
    /** i pezzi che possono mancare, nel loro ordine */
    pezzi: {
      misure: 'le misure',
      larghezza: 'la larghezza',
      altezza: "l’altezza",
      nome: 'il nome',
      contatto: 'un recapito',
      comune: 'il comune',
    },
    /** C1, C2 */
    nomeMancante: 'Come ti chiami? Serve a chi ti richiama.',
    contattoNonValido: 'Scrivi un numero di telefono o un’email: ti richiamiamo lì.',
    comuneMancante: 'Scegli il comune: serve a capire se ci arriviamo.',
    /** riepilogo role="alert" all'invio incompleto */
    riepilogoAria: (cose: readonly string[]) => `Per mandarle mancano: ${elenco(cose)}. Il fuoco è sul primo campo da sistemare.`,
    /** nota del concept, in fondo alla colonna */
    simulato: 'Concept di Ciceri Lab: l’invio è simulato, non parte nessuna richiesta.',
  },

  successo: {
    /** la data marcata a spruzzo: dataStencil(oggi) */
    frase: (comune: string | null, oggiIso: string | null) =>
      `Ricevute. Ti chiamiamo ${richiamata(oggiIso)} per il sopralluogo${comune ? ` a ${comune}` : ''}. Tieni il metro a portata di mano.`,
    chiChiama: `Ti chiama Davide, il geometra. Sopralluogo gratuito, prezzo scritto entro ${PROMESSE.prezzoScrittoGiorni} giorni lavorativi.`,
    saluto: 'Mandi.',
    altra: 'Misura un’altra finestra',
    torna: COMUNI.tornaAllaCronaca,
    /** OK2: si riapre con un invio già fatto */
    giaMandata: (tipo: TipoFinestra, larghezza: number, altezza: number, dataIso: string) =>
      `Hai mandato ${misure(larghezza, altezza)}, ${TIPI_NOMI[tipo].breve}, il ${dataLunga(dataIso)}. Ti richiamiamo noi.`,
    /** OK3: seconda finestra */
    ancheQueste: 'Ricevute anche queste. Al sopralluogo le guardiamo tutte.',
    /** annuncio aria-live */
    annuncio: (oggiIso: string | null) => `Misure ricevute. Ti chiamiamo ${richiamata(oggiIso)}.`,
    tempi: `Serramenti in ${PROMESSE.consegnaSettimane} settimane dall’ordine, posa in una giornata per ${PROMESSE.posaAlGiorno} finestre.`,
  },

  fallito: {
    frase: 'Non è partita. Riprova tra poco oppure',
    chiama: 'chiama l’ufficio',
    chiamaAria: 'Chiama l’ufficio, numero di esempio',
    chiamaHref: RECAPITI.telefonoHref,
    chiusura: '. Le misure restano scritte qui.',
    annuncio: 'Invio non riuscito. I dati sono ancora nei campi.',
  },

  /** P0b: bozza ritrovata */
  bozza: {
    frase: 'Abbiamo tenuto le misure dell’ultima volta.',
    cancella: 'Cancella',
    cancellaAria: 'Cancella le misure dell’ultima volta',
  },
} as const;

/** "la larghezza e un recapito" / "le misure, il nome e un recapito" */
function elenco(cose: readonly string[]): string {
  if (cose.length <= 1) return cose[0] ?? '';
  return `${cose.slice(0, -1).join(', ')} e ${cose[cose.length - 1] ?? ''}`;
}

/* ================================================================== S4 · il cartello */

export const CARTELLO = {
  titolo: 'Il cartello',
  /** righe del <dl>, nell'ordine del cartello vero */
  impresa: 'Impresa esecutrice',
  impresaTesto: 'BATTIFILO costruzioni e serramenti',
  chiSiamo: 'Chi siamo',
  chiSiamoTesto:
    'Muratori e posatori sono dell’impresa, non squadre a chiamata. Un capocantiere solo, Loris, dallo scavo alle chiavi. Ha cominciato Renzo, muratore; oggi i preventivi li fa suo figlio Davide, geometra.',
  sede: 'Sede e magazzino serramenti',
  sedeTesto: RECAPITI.indirizzo,
  sedeNota: 'Parcheggio nel cortile, davanti al magazzino. Da Pordenone dieci minuti in auto.',
  orari: 'Orari',
  orariRighe: ORARI,
  orariNota: 'Il sabato mattina Sara apre il magazzino: vieni a vedere e toccare profili e vetri.',
  dove: 'Dove lavoriamo',
  doveTesto: `${COMUNI_SERVITI.join(', ')}. Altri comuni fino a ${RAGGIO_KM} km: chiedici.`,
  nonFacciamo: 'Cosa non facciamo',
  nonFacciamoTesto:
    'Case in legno, capannoni, condomini grandi, finestre vendute senza posa, preventivi a corpo senza computo.',
  contatti: 'Contatti',
  chiama: 'Chiama',
  chiamaAria: 'Chiama l’ufficio, numero di esempio',
  chiamaHref: RECAPITI.telefonoHref,
  scrivi: 'Scrivi',
  scriviAria: 'Scrivi all’ufficio, email di esempio',
  scriviHref: RECAPITI.emailHref,
  maps: 'Apri in Maps',
  mapsAria: `Apri in Maps, ${COMUNI.nuovaScheda}`,
  mapsHref: RECAPITI.mapsHref,
  esempio: 'Indirizzo e recapiti sono di esempio.',
  pagamenti: 'Pagamenti a stati di avanzamento per i cantieri; acconto all’ordine e saldo a posa finita per i serramenti.',
  crediti: 'Crediti delle foto',
  creditiAria: 'Crediti delle foto, in fondo a Tutti i mesi',
  nota: COMUNI.finzioneLunga,
  /** "Ricomincia da capo" con conferma in linea */
  ricomincia: {
    bottone: 'Ricomincia da capo',
    domanda: 'Sicuro? Cancella le misure salvate e la tua tacca.',
    si: 'Sì, ricomincia',
    no: 'No',
    fatto: 'Cancellato. La cronaca riparte dal terreno.',
  },
} as const;

/* ================================================================== S5 · tutti i mesi */

export const MESI_VISTA = {
  titolo: 'Tutti i mesi',
  intro: `${COMUNI.fotoDiverse} ${COMUNI.cifreEsempio}`,
  indiceAria: 'Vai al mese',
  indiceVai: 'vai a',
  /** h3 di ogni voce: "Marzo, mese 1: tracciamento e scavo" */
  voceTitolo: (m: Pick<Mese, 'nome' | 'n' | 'fase'>) => `${meseERangoMaiuscolo(m)}: ${m.fase.toLowerCase()}`,
  /** "14.600 € · speso finora 14.600 €" */
  voceCosto: (m: Pick<Mese, 'costo' | 'finora'>) => `${euro(m.costo)} · speso finora ${euro(m.finora)}`,
  fermiNessuno: 'nessuno',
  vedilo: 'Vedilo nella cronaca',
  vediloAria: (m: Pick<Mese, 'nome' | 'n'>) => `Vedi ${meseERango(m)} nella cronaca`,
  chiaviTitolo: 'Le chiavi: il bilancio',
  crediti: 'Crediti delle foto',
  creditiRiga: (cosa: string, autore: string, fonte: string, licenza: string) =>
    `${cosa} Foto di ${autore}, ${fonte}, ${licenza}.`,
  piede: `${COMUNI.conceptDi} ${COMUNI.finzione} ${COMUNI.cifreEsempio}`,
  stampaSr: 'Questa pagina si può stampare: viene solo l’elenco dei mesi.',
} as const;

/* ================================================================== annunci aria-live */

export const ANNUNCI = {
  vistaAperta: (titolo: string) => `${titolo} aperto`,
  vistaChiusa: 'Torni alla cronaca',
  menuAperto: 'Menu aperto',
  menuChiuso: 'Menu chiuso',
} as const;

/* ================================================================== default export */

const TESTI = {
  meta: META,
  vetrina: VETRINA,
  comuni: COMUNI,
  salti: SALTI,
  fascia: FASCIA,
  apertura: APERTURA,
  scheda: SCHEDA,
  chiavi: CHIAVI,
  linea: LINEA,
  tipi: TIPI_NOMI,
  materiali: MATERIALI_NOMI,
  quando: QUANDO_NOMI,
  misura: MISURA,
  cartello: CARTELLO,
  mesiVista: MESI_VISTA,
  annunci: ANNUNCI,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
