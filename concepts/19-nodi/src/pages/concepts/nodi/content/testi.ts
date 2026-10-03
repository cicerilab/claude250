/**
 * NODI · tutti i testi visibili del sito (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter, non si inventa nel componente. Nessun
 * trattino lungo, nessun punto esclamativo, nessun puntino di sospensione,
 * nessun occhiello numerato, mai "scorri".
 * "La voce che vorresti" è l'unico richiamo alla prenotazione; "Mettimi in
 * lista" è solo l'azione del form.
 *
 * Le funzioni inseriscono valori (Hz, strumento, data, prezzi del listino)
 * in frasi già scritte: non fanno calcoli.
 *
 * Le frasi con cifre in vernice escono anche come `Pezzo[]`: il componente
 * mette in vernice solo i pezzi con `cifra: true`, il resto in tè.
 */

import {
  LISTA,
  MISURE,
  RIPARAZIONI,
  RIPARAZIONI_VIOLONCELLO,
  SABATO,
  SERVIZIO,
  STRUMENTI,
  STRUMENTI_ANNO,
  VARIANTI,
} from './listino';
import type { IdRiparazione, Modo, Strumento, ZonaVoce } from './listino';

/* ================================================================== aiuti */

/** Un pezzo di frase: `cifra` = va in vernice. */
export interface Pezzo {
  readonly t: string;
  readonly cifra?: true;
}

/** Ricompone una frase a pezzi in testo semplice (aria, annunci). */
export function testoDaPezzi(pezzi: readonly Pezzo[]): string {
  return pezzi.map((p) => p.t).join('');
}

/**
 * Euro all'italiana: "150 €", "9.500 €", "19.500 €".
 * (Intl it-IT non mette il punto delle migliaia a 4 cifre, per questo è a mano.)
 */
export function euro(valore: number): string {
  const intero = Math.round(valore);
  return `${String(intero).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;
}

/** "da 9.500 €" */
export function prezzoDa(valore: number): string {
  return `da ${euro(valore)}`;
}

/** "168 Hz" (valore del righello e cifre: sempre interi). */
export function hz(valore: number): string {
  return `${Math.round(valore)} Hz`;
}

/** "168 hertz" per lettori di schermo. */
export function hertz(valore: number): string {
  return `${Math.round(valore)} hertz`;
}

const MESI = [
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

/**
 * Un sabato in parole: "sabato 3 ottobre", oppure "oggi, sabato 3 ottobre".
 * `mese` va da 1 a 12. Il calcolo della data è di sections/Riparazioni/sabati.ts.
 */
export function sabatoInParole(giorno: number, mese: number, oggi = false): string {
  const nome = MESI[Math.min(Math.max(mese, 1), 12) - 1];
  return `${oggi ? 'oggi, ' : ''}sabato ${giorno} ${nome}`;
}

/** Da "YYYY-MM-DD" a "sabato 3 ottobre" (per il ritorno R8 e il successo R6). */
export function sabatoDaIso(iso: string, oggi = false): string {
  const [, m, g] = iso.split('-').map((n) => Number.parseInt(n, 10));
  return sabatoInParole(g ?? 1, m ?? 1, oggi);
}

const QUANTE_COSE = ['Una cosa', 'Due cose', 'Tre cose', 'Quattro cose', 'Cinque cose'] as const;

/** "Due cose da sistemare: nome, email o telefono." */
function riepilogoErrori(voci: readonly string[]): string {
  if (voci.length === 0) return '';
  const quante = QUANTE_COSE[Math.min(voci.length, QUANTE_COSE.length) - 1];
  return `${quante} da sistemare: ${voci.join(', ')}.`;
}

function listinoDi(strumento: Strumento) {
  const voce = STRUMENTI.find((s) => s.strumento === strumento);
  if (!voce) throw new Error(`Strumento sconosciuto: ${strumento}`);
  return voce;
}

/* ================================================================== bottega (dati di esempio) */

/**
 * Dati di contatto DI ESEMPIO. Il repo è pubblico: numero ed email non
 * esistono. Nessuna P.IVA, nessuna ragione sociale.
 * A vista ci sono solo le azioni ("Chiama", "Scrivi"): mai il numero né
 * l'indirizzo email come testo.
 */
export const RECAPITI = {
  via: 'Via della Motta 12',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  indirizzoRiga1: 'Via della Motta 12',
  indirizzoRiga2: '33170 Pordenone',
  indirizzoRiga: 'Via della Motta 12, 33170 Pordenone',
  indirizzoAria: 'Via della Motta 12, Pordenone (indirizzo di esempio)',
  chiama: 'Chiama',
  chiamaAria: 'Chiama la bottega (numero di esempio)',
  /** Solo come dato per l'href: non va mostrato. */
  telefonoHref: 'tel:+390434000000',
  scrivi: 'Scrivi',
  scriviAria: 'Scrivi alla bottega (indirizzo email di esempio)',
  /** Solo come dato per l'href: non va mostrato. */
  emailHref: 'mailto:bottega@nodi.example',
  maps: 'Apri in Maps',
  mapsAria: 'Apri in Maps: Via della Motta, Pordenone (si apre in una nuova scheda)',
  /** Ricerca della via, non di un'attività. */
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Via+della+Motta%2C+33170+Pordenone+PN',
  nota: 'Telefono ed email sono di esempio: la bottega non esiste.',
} as const;

/* ================================================================== meta */

export const META = {
  /** <title>, 40 caratteri. Dice "concept" e "Ciceri Lab" già nello snippet. */
  title: 'Concept 19 · NODI, liuteria | Ciceri Lab',
  /** meta description, 153 caratteri. Dice subito che la bottega è inventata. */
  description:
    'Concept di Ciceri Lab: il sito di una liuteria di Pordenone, inventata. Fai suonare la tavola di un violino e guarda le foglie di tè disegnare la figura.',
  ogTitle: 'NODI, liuteria. Un concept di Ciceri Lab',
  ogDescription: 'La tavola di un violino, le foglie di tè e la voce che vorresti. Un concept di Ciceri Lab.',
  /** Testo alternativo dell'immagine di anteprima (fermo del modo 5). */
  ogImageAlt: 'La tavola di un violino vista dall\'alto, con le foglie di tè che disegnano un anello dentro il bordo.',
} as const;

/**
 * Voce per src/content/site.ts (CONCEPTS) nel sito vero. Non è di questo
 * progetto: la usa chi porta il concept, se Luca è d'accordo.
 */
export const VETRINA = {
  tag: 'Liuteria',
  title: 'NODI',
  subtitle: 'Liuteria · Pordenone',
  desc: 'Fai salire la nota e le foglie di tè disegnano sulla tavola di un violino le linee dove il legno sta fermo. Poi scegli la voce del tuo strumento su un piano e ti metti in lista.',
  perche: 'Il liutaio prova le tavole con un altoparlante e le foglie di tè prima di chiudere lo strumento: il sito fa vedere quella prova, che di solito resta in bottega.',
  mestieri: [
    'liuteria',
    'liutaio',
    'liutaia',
    'violino',
    'viola',
    'violoncello',
    'strumenti ad arco',
    'riparazione violini',
    'restauro strumenti',
    'archetti',
    'bottega artigiana',
    'strumenti musicali',
  ],
} as const;

/* ================================================================== comuni */

export const COMUNI = {
  marchio: 'NODI',
  marchioSotto: 'liuteria in Pordenone',
  citta: 'Pordenone',
  /** L'unico richiamo alla prenotazione, identico ovunque (apertura, indice, Costruire, piede). */
  laVoce: 'La voce che vorresti',
  laVoceAria: 'La voce che vorresti: scegli la voce del tuo strumento e mettiti in lista',
  nuovaScheda: 'si apre in una nuova scheda',
  circa: 'circa',
  ivaInclusa: 'IVA inclusa',
  erroreSr: 'Errore:',
} as const;

export const SALTI = {
  contenuto: 'Salta al contenuto',
  voce: 'Vai alla voce che vorresti',
} as const;

/* ================================================================== sezioni, indice, menu */

/** Id delle ancore (tech-architect §3): `inizio` è la schermata "a riposo". */
export type IdSezioneTesti = 'inizio' | 'legni' | 'costruire' | 'voce' | 'riparazioni' | 'bottega' | 'piede';

export const SEZIONI = {
  inizio: { nome: 'A riposo', breve: 'A riposo', modo: null },
  legni: { nome: 'I legni', breve: 'I legni', modo: 1 },
  costruire: { nome: 'Costruire uno strumento', breve: 'Costruire', modo: 2 },
  voce: { nome: 'La voce che vorresti', breve: 'La voce che vorresti', modo: 5 },
  riparazioni: { nome: 'Riparazioni e restauri', breve: 'Riparazioni', modo: null },
  bottega: { nome: 'La bottega', breve: 'La bottega', modo: null },
  piede: { nome: 'Piede', breve: 'Piede', modo: null },
} as const satisfies Record<IdSezioneTesti, { nome: string; breve: string; modo: Modo | null }>;

/** Nome della sezione che porta un modo (righello, valuetext). */
export const NOME_DEL_MODO = {
  1: SEZIONI.legni.nome,
  2: SEZIONI.costruire.nome,
  5: SEZIONI.voce.nome,
} as const satisfies Record<Modo, string>;

export const INDICE = {
  navAria: 'Contenuti',
  /**
   * Cinque voci. `etichetta` a vista; `modo` a vista accanto, aria-hidden
   * (è già in `aria`, il nome accessibile completo).
   */
  voci: [
    { id: 'legni', href: '#legni', etichetta: 'I legni', modo: 'modo 1', aria: 'I legni, modo 1' },
    { id: 'costruire', href: '#costruire', etichetta: 'Costruire', modo: 'modo 2', aria: 'Costruire uno strumento, modo 2' },
    { id: 'voce', href: '#voce', etichetta: 'La voce che vorresti', modo: 'modo 5', aria: 'La voce che vorresti, modo 5' },
    { id: 'riparazioni', href: '#riparazioni', etichetta: 'Riparazioni', modo: null, aria: 'Riparazioni e restauri' },
    { id: 'bottega', href: '#bottega', etichetta: 'La bottega', modo: null, aria: 'La bottega' },
  ],
} as const;

export const TESTATA = {
  /** Il marchio è un link a #inizio sul largo (non è un titolo). */
  marchioAria: 'NODI, liuteria in Pordenone: torna all\'inizio',
  /** Sotto i 1200 px il marchio è il bottone del menu. */
  menuAria: 'Indice di NODI',
  /** Il segno del menu accanto a "NODI" su stretto è decorativo (aria-hidden). */
  menuPannelloAria: 'Indice di NODI',
} as const;

/* ================================================================== banco di prova: righello, suono, foglie */

export const PROVA = {
  /** <section aria-label> del banco di prova. */
  sezioneAria: 'Prova della tavola',
  cursoreAria: 'Frequenza dell\'altoparlante',
  unita: 'Hz',
  /** Valore grande accanto al cursore. 0 o null = altoparlante spento. */
  valore: (v: number | null) => (v === null || v <= 0 ? '0 Hz' : hz(v)),
  /** Sotto il valore quando l'altoparlante è spento (al posto del nome del modo). */
  spento: 'spento',
  /** Fermo in fondo alla scala. */
  fermoSpento: 'spento',
  /** Sotto il valore, solo in risonanza. */
  nomeModo: (m: Modo) => `modo ${m}`,
  /** Accanto alle tacche dei modi già trovati (aria-hidden: la versione accessibile è l'indice). */
  taccaTrovato: (m: Modo) => `modo ${m}`,
  /** Tacca permanente dopo l'invio della voce. */
  laTuaVoce: (v: number) => `la tua voce, ${hz(v)}`,
  /** Su mobile, al posto del nome del modo quando il cursore è sulla tacca. */
  laTuaVoceBreve: 'la tua voce',
  /** Le tre scorciatoie accanto al righello (bottoni veri). */
  scorciatoie: {
    gruppoAria: 'Vai a un modo',
    voci: [
      { modo: 1, etichetta: 'modo 1', aria: 'Vai al modo 1, I legni' },
      { modo: 2, etichetta: 'modo 2', aria: 'Vai al modo 2, Costruire uno strumento' },
      { modo: 5, etichetta: 'modo 5', aria: 'Vai al modo 5, La voce che vorresti' },
    ],
  },
  suono: {
    /** Nome accessibile fisso: lo stato lo dà aria-pressed. */
    nome: 'Suono',
    /** Parola a vista dopo "Suono", in uno span aria-hidden. */
    acceso: 'acceso',
    spento: 'spento',
    /** Sempre visibile accanto all'interruttore, anche da spento (aria-describedby). */
    nota: 'Suono basso. Con le cuffie abbassa il volume.',
  },
  rimetti: 'Rimetti le foglie',
  /** Riga facoltativa sotto il righello o nel menu: i modi 3 e 4 esistono. */
  altriModi: 'Tra il 2 e il 5 la tavola ha altri modi. Il liutaio guarda soprattutto l\'1, il 2 e il 5.',
  /** Riga onesta sulla larghezza delle risonanze (CD §2.2 regola 4). */
  banda: 'Qui le risonanze sono più larghe di quelle vere, così si trovano col dito.',
} as const;

/**
 * aria-valuetext del righello.
 * - spento in apertura: "Altoparlante spento, tavola a riposo"
 * - spento nella coda: "Altoparlante spento, le foglie restano dove erano"
 * - fuori risonanza: "150 hertz"
 * - in risonanza: "168 hertz, modo 2, Costruire uno strumento"
 * - sulla voce inviata: "352 hertz, modo 5, la tua voce"
 */
export function valuetextRighello(
  v: number | null,
  modo: Modo | null,
  opz: { readonly coda?: boolean; readonly tuaVoce?: boolean } = {},
): string {
  if (v === null || v <= 0) {
    return opz.coda
      ? 'Altoparlante spento, le foglie restano dove erano'
      : 'Altoparlante spento, tavola a riposo';
  }
  if (modo === null) return hertz(v);
  if (modo === 5 && opz.tuaVoce) return `${hertz(v)}, modo 5, la tua voce`;
  return `${hertz(v)}, modo ${modo}, ${NOME_DEL_MODO[modo]}`;
}

/* ================================================================== la tavola: descrizioni e fermi */

/**
 * Cosa fanno le foglie, in parole. Le frasi seguono le figure vere della
 * tavola di abete (Jansson, cap. 5): modo 2 a due linee che si avvicinano
 * tra le effe, modo 5 ad anello aperto alle C. Vedi docs/copywriter.md §5.
 */
export const FIGURE = {
  1: 'una croce: una linea lungo la giunta e una di traverso all\'altezza delle C',
  2: 'due linee lungo la tavola, dagli angoli in alto a quelli in basso, che si avvicinano tra le effe senza toccarsi',
  5: 'un anello dentro il bordo, che si apre all\'altezza delle C',
} as const satisfies Record<Modo, string>;

/**
 * Frase "guarda" sotto il titolo di ogni modo (trend-researcher P1), max 14
 * parole. Dice cosa guardare sulla tavola in quel momento.
 */
export const GUARDA = {
  1: 'Guarda la croce: una linea lungo la giunta, una di traverso alle C.',
  2: 'Guarda le due linee: corrono lungo la tavola e si avvicinano tra le effe.',
  5: 'Guarda l\'anello: corre dentro il bordo e si apre all\'altezza delle C.',
} as const satisfies Record<Modo, string>;

/** Testi della regione aria-live della tavola (ux §3.3) e del Palco. */
export const TAVOLA = {
  /** Testo fisso della descrizione prima del primo cambio (prerender e riposo). Non si annuncia. */
  riposo: 'Tavola a riposo: le foglie di tè sono sparse, come appena versate.',
  /** T4, una volta per ingresso nel modo, 600 ms dopo l'ultimo cambio. */
  modo: (m: Modo, v: number) => `Modo ${m}, circa ${hertz(v)}: le foglie formano ${FIGURE[m]}.`,
  /** T8, solo la prima volta per visita. */
  spenta: 'Altoparlante spento: le foglie restano dove erano.',
  /** T9. */
  rimesse: 'Foglie rimesse sulla tavola.',
  /** Dalla coda, prima freccia o primo trascinamento del righello. */
  tornaAllaProva: (v: number) => `Torni alla prova: ${hertz(v)}.`,
} as const;

/** Testi alternativi dei fermi immagine (poster, fallback senza WebGL, modalità bassa). */
export const FERMI_ALT = {
  vuota: 'La tavola di un violino in abete, vista dall\'alto, ancora senza foglie.',
  riposo: 'La tavola di un violino vista dall\'alto, con le foglie di tè sparse a caso.',
  modo1: `Le foglie di tè sulla tavola formano ${FIGURE[1]}.`,
  modo2: `Le foglie di tè sulla tavola formano ${FIGURE[2]}.`,
  modo5: `Le foglie di tè sulla tavola formano ${FIGURE[5]}.`,
} as const;

/* ================================================================== foto */

/**
 * Testi alternativi delle foto, per chiave. Funzionali, senza poesia. Il
 * photo-editor li verifica sulla foto scelta: se la foto mostra altro, chiede
 * la correzione qui (non scrive l'alt da sé).
 */
export const FOTO_ALT = {
  legni: 'Tavole e cunei di abete accatastati a stagionare.',
  costruire: 'Una tavola di violino in lavorazione sul banco, con le sgorbie accanto.',
  bottega: 'Il banco di una bottega di liuteria, con le forme e gli strumenti in bianco appesi.',
  dettaglio: 'Il dettaglio di un violino verniciato: l\'effe e il bordo con il filetto.',
  /** Piano B del CD §4.6: una sola macro di abete in I legni. */
  abeteMacro: 'La vena di una tavola di abete tagliata di quarto, vista da vicino.',
} as const;

export type ChiaveFoto = keyof typeof FOTO_ALT;

/* ================================================================== apertura (#inizio) */

export const APERTURA = {
  /** Unico h1 del sito. 39 caratteri: due righe a 384 e a 335 px. */
  titolo: 'Ascoltiamo il legno prima di chiuderlo.',
  /** 17 parole. */
  frase: 'Violini, viole e violoncelli fatti a mano a Pordenone. Ogni tavola passa sotto le foglie di tè.',
  bottone: COMUNI.laVoce,
  bottoneAria: COMUNI.laVoceAria,
} as const;

/* ================================================================== modo 1: i legni */

/** Parole del mestiere, spiegate una volta (dl). */
export const PAROLE_DEL_MESTIERE = [
  { parola: 'Tavola', vuolDire: 'il piano di sopra, in abete, con le effe. È quella che vedi qui.' },
  { parola: 'Fondo', vuolDire: 'il piano di sotto, in acero, di solito in due pezzi.' },
  { parola: 'Fasce', vuolDire: 'le strisce di acero piegate a caldo che fanno i fianchi.' },
  { parola: 'Effe', vuolDire: 'i due fori a forma di f sulla tavola.' },
  { parola: 'Le C', vuolDire: 'i due fianchi stretti a metà dello strumento, dove passa l\'arco.' },
  { parola: 'Catena', vuolDire: 'un listello di abete incollato sotto la tavola, dal lato delle corde basse. La regge e le dà voce.' },
  { parola: 'Di quarto', vuolDire: 'tagliato dal centro del tronco verso la corteccia, come una fetta di torta.' },
] as const;

export const LEGNI = {
  titolo: SEZIONI.legni.nome,
  guarda: GUARDA[1],
  /** Le sole due cifre in vernice della schermata, con la loro tolleranza in tè. */
  misure: [
    {
      id: 'hz',
      circa: 'circa',
      valore: String(MISURE.hz[1]),
      unita: 'Hz',
      sotto: `la torsione della tavola in prova. Nelle tavole vere tra ${MISURE.fasciaHz[1].da} e ${MISURE.fasciaHz[1].a}.`,
      aria: `circa ${MISURE.hz[1]} hertz, la torsione della tavola in prova. Nelle tavole vere tra ${MISURE.fasciaHz[1].da} e ${MISURE.fasciaHz[1].a}.`,
    },
    {
      id: 'peso',
      circa: 'circa',
      valore: String(MISURE.pesoTavolaG),
      unita: 'g',
      sotto: 'il peso della nostra tavola d\'esempio, con la catena.',
      aria: `circa ${MISURE.pesoTavolaG} grammi, il peso della nostra tavola d'esempio, con la catena.`,
    },
  ],
  paragrafi: [
    'La tavola è di abete rosso della Val di Fiemme, dalla foresta di Paneveggio: anelli fitti e dritti, niente nodi. Fondo, fasce e manico sono di acero dei Balcani, fiammato.',
    `Il legno resta in bottega almeno ${MISURE.stagionaturaAnni} anni prima di diventare uno strumento. I cunei sul banco adesso sono stati tagliati tra il 2012 e il 2018.`,
    'Lo prendiamo di quarto: il tronco si spacca come una torta, così la vena corre dritta lungo la tavola. Regge meglio le corde e risponde prima.',
    'Prima di chiudere lo strumento lo proviamo: la tavola su quattro cuscinetti, un altoparlante sotto, una nota che sale. Dove il legno vibra le foglie scappano, dove sta fermo si fermano. Si chiama taratura delle tavole libere.',
  ],
  /** La giunta, citata nella frase "guarda": spiegata una volta. */
  giunta: 'La tavola è fatta di due metà dello stesso cuneo, incollate al centro: quella riga è la giunta.',
  foto: 'legni',
  paroleTitolo: 'Le parole del mestiere',
  parole: PAROLE_DEL_MESTIERE,
} as const;

/* ================================================================== modo 2: costruire */

export const STRUMENTI_NOMI = {
  violino: {
    nome: 'Violino',
    minuscolo: 'violino',
    conArticolo: 'un violino',
    /** Pronome per "Prima di chiuderlo, lo ascoltiamo". */
    lo: 'lo',
    radio: 'Violino',
    riga: '4/4, su modello Stradivari o Guarneri. Il più richiesto: quattro o cinque l\'anno.',
    nota: 'un La',
  },
  viola: {
    nome: 'Viola',
    minuscolo: 'viola',
    conArticolo: 'una viola',
    lo: 'la',
    radio: 'Viola',
    riga: 'Da 39,5 a 42 cm di cassa: la misura la scegliamo insieme, sul tuo braccio.',
    nota: 'un Do',
  },
  violoncello: {
    nome: 'Violoncello',
    minuscolo: 'violoncello',
    conArticolo: 'un violoncello',
    lo: 'lo',
    radio: 'Violoncello',
    riga: '4/4. Uno l\'anno: quando c\'è un violoncello sul banco, il banco è suo.',
    nota: 'un Do grave',
  },
} as const satisfies Record<Strumento, unknown>;

/** "3-4 mesi al banco" */
function mesiAlBanco(m: { min: number; max: number }): string {
  return m.min === m.max ? `${m.min} mesi al banco` : `${m.min}-${m.max} mesi al banco`;
}

export const COSTRUIRE = {
  titolo: SEZIONI.costruire.nome,
  guarda: GUARDA[2],
  intro: `Ne costruiamo circa ${STRUMENTI_ANNO === 7 ? 'sette' : String(STRUMENTI_ANNO)} l'anno, in due. Pochi, così ogni tavola passa sotto le foglie.`,
  /** Tre righe per strumento: h3, cifre in vernice (prezzo e mesi), riga in tè. */
  strumenti: (['violino', 'viola', 'violoncello'] as const).map((s) => {
    const l = listinoDi(s);
    return {
      id: s,
      nome: STRUMENTI_NOMI[s].nome,
      prezzo: prezzoDa(l.prezzoDa),
      /** "da" in tè, cifra in vernice. */
      prezzoPezzi: [{ t: 'da ' }, { t: euro(l.prezzoDa), cifra: true }] as readonly Pezzo[],
      mesi: mesiAlBanco(l.mesi),
      mesiPezzi: [
        { t: l.mesi.min === l.mesi.max ? String(l.mesi.min) : `${l.mesi.min}-${l.mesi.max}`, cifra: true },
        { t: ' mesi al banco' },
      ] as readonly Pezzo[],
      riga: STRUMENTI_NOMI[s].riga,
      aria: `${STRUMENTI_NOMI[s].nome}: ${prezzoDa(l.prezzoDa)}, ${mesiAlBanco(l.mesi)}.`,
    };
  }),
  incluso: 'Il prezzo comprende montatura, corde, un anno di regolazioni e il foglio della prova: le frequenze delle sue tavole, scritte a mano. Custodia e archetto a parte.',
  ivaInclusa: 'Prezzi di esempio, IVA inclusa.',
  mesiNota: 'I mesi al banco partono quando tocca a te in lista.',
  comeFunzionaTitolo: 'Come funziona',
  /** Un <ol> senza numeri a vista: l'ordine è nel testo. */
  passi: [
    'Vieni in bottega e provi gli strumenti finiti che ci sono in quel momento.',
    'Decidiamo insieme la voce e, per la viola, la misura.',
    `Dopo la prova versi l'acconto ed entri in lista: ${euro(listinoDi('violino').acconto)} per violino e viola, ${euro(listinoDi('violoncello').acconto)} per il violoncello. Prima della prova non chiediamo niente.`,
    'Quando tocca a te, Tobia ti chiama: puoi venire a vedere la tua tavola sotto le foglie.',
    'Alla consegna il saldo, il foglio della prova e un anno di regolazioni gratis.',
  ],
  /** Una riga, senza enfasi (brand-strategist §7.1). */
  ripensamento: `Se alla consegna la voce non è quella decisa, ci rimettiamo le mani. Se dopo ${SERVIZIO.ripensamentoMesi === 1 ? 'un mese' : `${SERVIZIO.ripensamentoMesi} mesi`} ancora non va, ti restituiamo l'acconto.`,
  apertura: 'Uno strumento nuovo si apre nei primi mesi di studio. Per questo lo regoliamo gratis per un anno.',
  varianti: `A richiesta: vernice anticata ${prezzoDa(VARIANTI.verniceAnticataDa)}, fondo in un pezzo solo ${prezzoDa(VARIANTI.fondoInUnPezzoDa)}.`,
  nonFacciamo: 'Non costruiamo chitarre, contrabbassi né strumenti piccoli per bambini: per quelli va benissimo il noleggio di un negozio di musica. Da noi quando arriva il 4/4.',
  /** Due parole che compaiono qui per la prima volta (dl breve, facoltativo). */
  parole: [
    { parola: 'Chiudere', vuolDire: 'incollare la tavola sulle fasce. È l\'ultima cosa, e dopo la tavola non si tocca più.' },
    { parola: 'In bianco', vuolDire: 'lo strumento finito, prima della vernice.' },
  ],
  foto: 'costruire',
  link: COMUNI.laVoce,
  linkAria: COMUNI.laVoceAria,
} as const;

/* ================================================================== modo 5: la voce che vorresti */

/** Le cinque zone del piano del suono (brand-strategist §5.4). */
export const ZONE = {
  'scura-morbida': {
    breve: 'scura e morbida',
    frase: 'Scura e morbida: piena, bassa, non graffia. Per la musica da camera e le sale piccole.',
    dallaVoce: 'dalla voce scura e morbida',
  },
  'scura-pronta': {
    breve: 'scura e pronta',
    frase: 'Scura e pronta: piena, ma parte subito sotto l\'arco. Per chi suona in quartetto e vuole farsi sentire.',
    dallaVoce: 'dalla voce scura e pronta',
  },
  equilibrata: {
    breve: 'equilibrata',
    frase: 'Equilibrata: né scura né brillante. Se non lo sai ancora, va benissimo così.',
    dallaVoce: 'dalla voce equilibrata',
  },
  'brillante-morbida': {
    breve: 'brillante e morbida',
    frase: 'Brillante e morbida: chiara, canta, senza spigoli. Per chi suona da solo in sale raccolte.',
    dallaVoce: 'dalla voce brillante e morbida',
  },
  'brillante-pronta': {
    breve: 'brillante e pronta',
    frase: 'Brillante e pronta: chiara e subito presente. Passa l\'orchestra e arriva in fondo alla sala.',
    dallaVoce: 'dalla voce brillante e pronta',
  },
} as const satisfies Record<ZonaVoce, { breve: string; frase: string; dallaVoce: string }>;

/** Righe del successo della voce (V7, V10), fuori da VOCE per poterle comporre. */
function successoSeconda(s: Strumento, z: ZonaVoce): string {
  return `Hai chiesto ${STRUMENTI_NOMI[s].conArticolo} ${ZONE[z].dallaVoce}.`;
}

/** Il messaggio chiave torna qui, in un'altra forma. */
function successoTerza(s: Strumento): string {
  const lo = STRUMENTI_NOMI[s].lo;
  return `Ti scriviamo entro due giorni per fissare una prova in bottega. Prima di chiuderl${lo === 'la' ? 'a' : 'o'}, ${lo} ascoltiamo insieme.`;
}

function successoTesto(s: Strumento, z: ZonaVoce): string {
  return `Sei in lista, al numero ${LISTA[s].numero}. ${successoSeconda(s, z)} ${successoTerza(s)}`;
}

/** Valori 0-100 di un asse in parole (aria-valuetext dei due range). */
function asseInParole(v: number, basso: string, alto: string, centro: string): string {
  if (v <= 15) return `molto ${basso}`;
  if (v <= 40) return `un po' ${basso}`;
  if (v < 60) return centro;
  if (v < 85) return `un po' ${alto}`;
  return `molto ${alto}`;
}

export const VOCE = {
  titolo: SEZIONI.voce.nome,
  guarda: GUARDA[5],
  intro: 'Non serve sapere di acustica: ci basta sapere come lo senti. Il resto lo proviamo in bottega.',

  /* ---------- lo strumento */
  strumento: {
    legenda: 'Lo strumento',
    /** Etichetta di ogni radio (IM Fell). */
    radio: {
      violino: STRUMENTI_NOMI.violino.radio,
      viola: STRUMENTI_NOMI.viola.radio,
      violoncello: STRUMENTI_NOMI.violoncello.radio,
    },
  },

  /* ---------- il piano del suono */
  piano: {
    /** Invito sopra il piano (V1). */
    invito: 'Sposta la foglia dove senti il tuo strumento. Se non lo sai, lasciala al centro: ne parliamo in bottega.',
    aria: 'Piano del suono',
    roledescription: 'piano del suono',
    fogliaAria: 'Foglia della voce',
    istruzioni: 'Frecce sinistra e destra: da scuro a brillante. Su e giù: da morbido a pronto. Inizio: al centro.',
    assi: {
      scuro: 'scuro',
      brillante: 'brillante',
      morbido: 'morbido',
      pronto: 'pronto',
    },
    /** I due range accessibili (compaiono al focus). */
    rangeX: 'Da scuro a brillante',
    rangeY: 'Da morbido a pronto',
    valuetextX: (v: number) => asseInParole(v, 'scura', 'brillante', 'né scura né brillante'),
    valuetextY: (v: number) => asseInParole(v, 'morbida', 'pronta', 'né morbida né pronta'),
    /** Frase della zona, aggiornata a vista. */
    zona: (z: ZonaVoce) => ZONE[z].frase,
    /** Modalità bassa e fallback: la frequenza scritta nella frase. */
    zonaConHz: (z: ZonaVoce, v: number) => `${ZONE[z].frase} Sulla tavola, circa ${hz(v)}.`,
    /** Nota onesta sotto la frase della zona. */
    onesta: 'È un modo per parlarne, non una promessa di laboratorio.',
    /** Facoltativa, sotto la nota onesta (trend-researcher R10). */
    hutchins: 'Carleen Hutchins notava che le tavole che risuonano più in alto danno violini più brillanti. Per questo, se sposti la foglia, l\'anello cambia.',
  },

  /* ---------- la nota d'esempio */
  nota: {
    bottone: 'Senti la voce',
    bottoneAria: 'Senti la voce di esempio',
    ferma: 'Ferma la nota',
    /** Che nota suona, per strumento (facoltativa, sotto il bottone). */
    quale: (s: Strumento) => {
      const n = listinoDi(s).notaEsempio;
      return `Suona ${STRUMENTI_NOMI[s].nota}, ${hz(n.hz)}.`;
    },
    didascalia: 'Suono sintetico d\'esempio, per orientarti. In bottega si prova lo strumento vero.',
    volume: PROVA.suono.nota,
    /** V13: Web Audio assente o bloccato, al posto del bottone. */
    senzaAudio: 'Qui non possiamo farti sentire la nota: in bottega si prova lo strumento vero.',
  },

  /* ---------- chi sei */
  chi: {
    legenda: 'Chi sei',
    nome: 'Nome',
    contattoLegenda: 'Come ti troviamo: email o telefono, basta uno dei due',
    email: 'Email',
    telefono: 'Telefono',
    notaEtichetta: 'Per chi è, che musica suoni',
    facoltativo: '(facoltativo)',
    notaMax: 140,
    /** Visibile solo sopra i 120 caratteri. */
    contatore: (rimasti: number) =>
      rimasti === 1 ? 'Ancora un carattere' : rimasti <= 0 ? 'Non ci sta altro' : `Ancora ${rimasti} caratteri`,
    rassicura: 'Ti scriviamo solo per questo strumento.',
  },

  /* ---------- lista d'attesa */
  lista: {
    /** "Saresti il numero 7 in lista. Consegna prevista: primavera 2028." */
    pezzi: (s: Strumento): readonly Pezzo[] => [
      { t: 'Saresti il numero ' },
      { t: String(LISTA[s].numero), cifra: true },
      { t: ' in lista. Consegna prevista: ' },
      { t: LISTA[s].consegna, cifra: true },
      { t: '.' },
    ],
    frase: (s: Strumento) =>
      `Saresti il numero ${LISTA[s].numero} in lista. Consegna prevista: ${LISTA[s].consegna}.`,
    /** V9: dopo "Cambia la voce". */
    giaInLista: (s: Strumento): readonly Pezzo[] => [
      { t: 'Sei già in lista al numero ' },
      { t: String(LISTA[s].numero), cifra: true },
      { t: ': aggiorniamo la tua richiesta.' },
    ],
    giaInListaTesto: (s: Strumento) => `Sei già in lista al numero ${LISTA[s].numero}: aggiorniamo la tua richiesta.`,
  },

  /* ---------- invio */
  invio: {
    bottone: 'Mettimi in lista',
    /** V6. Il bottone è largo come questa etichetta, la più lunga. */
    inCorso: 'Ti mettiamo in lista',
    nota: 'È un concept: la richiesta non parte davvero.',
    /** V0, sotto l'invio prima del montaggio. "chiamaci" è il link tel: */
    primaDelMontaggio: { prima: 'Oppure ', link: 'chiamaci', linkAria: RECAPITI.chiamaAria, dopo: '.' },
  },

  /* ---------- errori (V5) */
  errori: {
    nome: 'Serve un nome per sapere chi cercare.',
    contattoVuoto: 'Scrivi un\'email o un numero di telefono, ci basta uno dei due.',
    emailSenzaChiocciola: 'Questa email non sembra completa: manca la chiocciola?',
    emailSenzaDominio: 'Questa email non sembra completa: controlla quello che c\'è dopo la chiocciola.',
    telefonoCorto: 'Questo numero sembra corto: controlla le cifre.',
    /** Nomi dei campi nel riepilogo dell'annuncio. */
    campi: { nome: 'nome', contatto: 'email o telefono', email: 'email', telefono: 'telefono' },
    riepilogo: riepilogoErrori,
  },

  /* ---------- successo (V7, V10) */
  successo: {
    /** Prima riga, con il numero in vernice. */
    prima: (s: Strumento): readonly Pezzo[] => [
      { t: 'Sei in lista, al numero ' },
      { t: String(LISTA[s].numero), cifra: true },
      { t: '.' },
    ],
    seconda: successoSeconda,
    terza: successoTerza,
    /** Tutte e tre le righe come testo (annuncio, focus). */
    testo: successoTesto,
    cambia: 'Cambia la voce',
    concept: 'Questo è un concept di Ciceri Lab: la richiesta non è stata inviata a nessuno.',
  },

  /* ---------- fallito (V8) */
  fallito: {
    prima: 'Non è partita. Riprova tra poco o ',
    link: 'chiamaci',
    linkAria: RECAPITI.chiamaAria,
    dopo: ': rispondiamo dal martedì al sabato, dalle 9 a mezzogiorno.',
    testo: 'Non è partita. Riprova tra poco o chiamaci: rispondiamo dal martedì al sabato, dalle 9 a mezzogiorno.',
  },
} as const;

/* ================================================================== riparazioni e il sabato */

export const RIPARAZIONI_TESTI = {
  anima: {
    nome: 'Anima rimessa a posto',
    spiega: 'L\'anima è il cilindretto di abete tra tavola e fondo, sotto il ponticello.',
    tempo: 'mentre aspetti',
    vernice: false,
  },
  regolazione: {
    nome: 'Regolazione completa di anima, ponticello, capotasto e piroli',
    spiega: null,
    tempo: 'in giornata',
    vernice: false,
  },
  ponticello: {
    nome: 'Ponticello nuovo',
    spiega: null,
    tempo: 'una settimana',
    vernice: true,
  },
  crine: {
    nome: 'Crine nuovo all\'archetto',
    spiega: null,
    tempo: 'in giornata',
    vernice: false,
  },
  tastiera: {
    nome: 'Tastiera spianata',
    spiega: null,
    tempo: 'una settimana',
    vernice: false,
  },
  scollatura: {
    nome: 'Bordo o fasce scollati',
    spiega: null,
    tempo: '2-3 giorni',
    vernice: false,
  },
  crepa: {
    nome: 'Crepa della tavola',
    spiega: null,
    tempo: 'due settimane',
    vernice: true,
  },
  cavigliere: {
    nome: 'Cavigliere rotto',
    spiega: null,
    tempo: 'tre settimane',
    vernice: false,
  },
} as const satisfies Record<IdRiparazione, { nome: string; spiega: string | null; tempo: string; vernice: boolean }>;

export const RIPARAZIONI_SEZIONE = {
  titolo: SEZIONI.riparazioni.nome,
  /** L'altoparlante è spento: lo dice una riga, con naturalezza. */
  spento: 'Qui l\'altoparlante è spento. Le foglie restano dove erano, come sul banco.',

  cosaTitolo: 'Cosa ripariamo',
  /** Elenco: nome in tè, "da" + prezzo (vernice solo dove `vernice` è true), tempo in tè. */
  voci: RIPARAZIONI.map((r) => {
    const id = r.id as IdRiparazione;
    const t = RIPARAZIONI_TESTI[id];
    return {
      id,
      nome: t.nome,
      spiega: t.spiega,
      prezzo: prezzoDa(r.prezzoDa),
      tempo: t.tempo,
      vernice: t.vernice,
      aria: `${t.nome}: ${prezzoDa(r.prezzoDa)}, ${t.tempo}.`,
    };
  }),
  violoncello: `Sul violoncello ponticello e crine costano un po' di più: ${prezzoDa(RIPARAZIONI_VIOLONCELLO.ponticello)} e ${prezzoDa(RIPARAZIONI_VIOLONCELLO.crine)}.`,
  prezzoPrima: 'Il prezzo te lo diciamo prima di cominciare.',
  restauro: 'Strumenti di famiglia: prima li guardiamo il sabato, poi ti diciamo se vale la pena e quanto costa.',
  prestito: `Se studi e il lavoro dura più di ${SERVIZIO.prestitoOltreGiorni === 7 ? 'una settimana' : `${SERVIZIO.prestitoOltreGiorni} giorni`}, ti prestiamo uno strumento della bottega.`,
  nonFacciamo: 'Chitarre, mandolini e strumenti elettrici no: non è il nostro banco. Perizie per l\'assicurazione nemmeno, ma ti diciamo a chi chiedere.',

  sabatoTitolo: 'Il sabato di bottega',
  sabatoTesto: 'Il sabato mattina, dalle 9 a mezzogiorno e mezzo, la bottega è aperta. Porti lo strumento, lo guardiamo insieme e il controllo non si paga.',
  sabatoIrene: 'Al banco c\'è Irene: ti dice cosa ha lo strumento, quanto costa e se vale la pena sistemarlo.',
} as const;

export const SABATI = {
  /** R0: prima del montaggio, al posto dei quattro sabati. */
  primaDelMontaggio: `Il sabato mattina la bottega è aperta, dalle ${SABATO.dalle.replace(':00', '')} alle ${SABATO.alle}.`,
  legenda: 'Scegli un sabato',
  /** Etichetta di ogni radio: "sabato 3 ottobre" (o "oggi, sabato 3 ottobre"). */
  sabato: sabatoInParole,
  /** Sotto ogni sabato, 13 px. */
  fascia: `${SABATO.dalle}-${SABATO.alle}`,
  fasciaAria: `dalle ${SABATO.dalle} alle ${SABATO.alle}`,
  problema: 'Lo strumento e cosa non va',
  problemaAiuto: 'Basta una riga, per esempio: viola, ponticello piegato.',
  nome: 'Nome',
  telefono: 'Telefono',
  telefonoAiuto: 'Ti chiamiamo solo se cambia qualcosa.',
  invio: 'Ci vediamo sabato',
  /** R4. Il bottone resta largo come "Ci vediamo sabato". */
  inCorso: 'Un momento',
  errori: {
    sabato: 'Scegli un sabato.',
    problema: 'Scrivi lo strumento e cosa non va, basta una riga.',
    nome: 'Serve un nome.',
    telefonoVuoto: 'Serve un numero di telefono per richiamarti.',
    telefonoCorto: 'Questo numero sembra corto: controlla le cifre.',
    campi: { sabato: 'il sabato', problema: 'lo strumento', nome: 'nome', telefono: 'telefono' },
    riepilogo: riepilogoErrori,
  },
  /** R6. `quando` = sabatoInParole(...) o sabatoDaIso(...). */
  successo: (quando: string) =>
    `Ti aspettiamo ${quando} tra le 9 e mezzogiorno e mezzo. Porta anche l'archetto.`,
  saluto: 'Mandi, Irene',
  concept: 'È un concept: la richiesta non è partita.',
  altro: 'Scegli un altro sabato',
  /** R8: al ritorno, se il sabato salvato è nel futuro. */
  ritorno: (quando: string) => `Ti aspettiamo ${quando}.`,
  /** R5. */
  fallito: {
    prima: 'Non è partita. Riprova tra poco o ',
    link: 'chiamaci',
    linkAria: RECAPITI.chiamaAria,
    dopo: '.',
    testo: 'Non è partita. Riprova tra poco o chiamaci.',
  },
} as const;

/* ================================================================== la bottega */

export const BOTTEGA = {
  titolo: SEZIONI.bottega.nome,
  chi: 'Tobia costruisce: sceglie il legno, scava, prova le tavole e chiude gli strumenti. Irene ripara, vernicia, monta e prova gli strumenti con chi suona.',
  storia: 'Abbiamo aperto nel 2015, al piano terra di quella che era una bottega di corniciaio. Il banco sta sotto la finestra, per la luce da nord.',
  nome: 'Il nome: in un abete di risonanza i nodi non ci devono essere. Sulla tavola che vibra, invece, le linee nodali sono proprio quello che cerchiamo.',
  foto: 'bottega',
  indirizzo: {
    riga1: RECAPITI.indirizzoRiga1,
    riga2: RECAPITI.indirizzoRiga2,
    aria: RECAPITI.indirizzoAria,
    descrizione: 'Piano terra, vetrina sulla strada.',
    parcheggio: 'Parcheggi in centro, poi cinque minuti a piedi.',
  },
  orariTitolo: 'Orari',
  /** dl: giorno / fascia. */
  orari: [
    { giorni: 'Sabato', ore: '9:00-12:30, aperto senza appuntamento' },
    { giorni: 'Martedì-venerdì', ore: 'al banco; su appuntamento 15:00-18:30' },
    { giorni: 'Domenica e lunedì', ore: 'chiuso' },
  ],
  telefonoOrari: 'Al telefono rispondiamo dal martedì al sabato, 9:00-12:00.',
  chiama: { testo: RECAPITI.chiama, aria: RECAPITI.chiamaAria, href: RECAPITI.telefonoHref },
  scrivi: { testo: RECAPITI.scrivi, aria: RECAPITI.scriviAria, href: RECAPITI.emailHref },
  maps: { testo: RECAPITI.maps, aria: RECAPITI.mapsAria, href: RECAPITI.mapsHref },
  recapitiNota: RECAPITI.nota,
} as const;

/* ================================================================== piede */

export const PIEDE = {
  /** Testo, non link: l'unico ritorno è il ConceptBackButton. */
  conceptDi: 'Un concept di Ciceri Lab.',
  finzione: 'NODI è una bottega inventata: Tobia, Irene, l\'indirizzo, il telefono, l\'email, i prezzi e la lista d\'attesa sono di esempio.',
  simulazione: 'Le figure sono calcolate da una tavola di violino d\'esempio: si chiamano figure di Chladni. Le frequenze sono indicative e vengono dagli studi di Carleen Hutchins ed Erik Jansson. Le risonanze vere sono più strette: qui le abbiamo allargate perché si trovino col dito.',
  fotoPrima: 'Foto: ',
  fotoFonte: ' su Unsplash',
  /** Nome accessibile del link all'autore. */
  fotoAria: (autore: string) => `Foto di ${autore} su Unsplash (si apre in una nuova scheda)`,
  /** Piano B senza foto di bottega. */
  senzaFoto: 'In questo concept non ci sono foto: la tavola e la vena sono disegnate.',
  laVoce: COMUNI.laVoce,
  dimentica: 'Dimentica le mie prove',
  dimenticaAiuto: 'Cancella da questo browser le tacche dei modi trovati, la tua voce e il sabato scelto.',
  dimenticato: 'Fatto. Le tue prove sono cancellate e le foglie sono di nuovo sparse.',
} as const;

/* ================================================================== annunci aria-live */

/**
 * Una regione per la tavola (Palco/Righello) e una per ciascun form. Mai
 * annunciare durante un trascinamento o a ogni tasto.
 */
export const ANNUNCI = {
  /* tavola */
  modo: TAVOLA.modo,
  spenta: TAVOLA.spenta,
  rimesse: TAVOLA.rimesse,
  tornaAllaProva: TAVOLA.tornaAllaProva,
  /* menu */
  menuAperto: 'Indice aperto.',
  menuChiuso: 'Indice chiuso.',
  /* voce */
  strumento: (s: Strumento) =>
    `${STRUMENTI_NOMI[s].nome}: saresti il numero ${LISTA[s].numero}, consegna prevista ${LISTA[s].consegna}.`,
  zona: (z: ZonaVoce, v: number) => {
    const b = ZONE[z].breve;
    return `Voce ${b}, ${hertz(v)}.`;
  },
  erroriVoce: riepilogoErrori,
  invioVoce: 'Ti mettiamo in lista.',
  successoVoce: successoTesto,
  fallitoVoce: VOCE.fallito.testo,
  cambiaVoce: 'Puoi cambiare la voce. I tuoi dati sono ancora qui.',
  /* sabato */
  erroriSabato: riepilogoErrori,
  invioSabato: 'Un momento.',
  successoSabato: SABATI.successo,
  fallitoSabato: SABATI.fallito.testo,
  altroSabato: 'Scegli un altro sabato.',
  /* piede */
  dimenticato: PIEDE.dimenticato,
} as const;

/* ================================================================== esportazione unica */

export const TESTI = {
  meta: META,
  vetrina: VETRINA,
  comuni: COMUNI,
  salti: SALTI,
  sezioni: SEZIONI,
  indice: INDICE,
  testata: TESTATA,
  prova: PROVA,
  figure: FIGURE,
  guarda: GUARDA,
  tavola: TAVOLA,
  fermiAlt: FERMI_ALT,
  fotoAlt: FOTO_ALT,
  apertura: APERTURA,
  legni: LEGNI,
  costruire: COSTRUIRE,
  strumentiNomi: STRUMENTI_NOMI,
  zone: ZONE,
  voce: VOCE,
  riparazioni: RIPARAZIONI_SEZIONE,
  riparazioniTesti: RIPARAZIONI_TESTI,
  sabati: SABATI,
  bottega: BOTTEGA,
  piede: PIEDE,
  recapiti: RECAPITI,
  annunci: ANNUNCI,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
