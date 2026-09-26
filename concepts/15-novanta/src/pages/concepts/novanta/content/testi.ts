/**
 * NOVANTA · tutti i testi visibili del sito (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter. Nessun trattino lungo o medio, nessun
 * punto esclamativo, nessun puntino di sospensione (unica eccezione chiesta
 * dal creative-director: "Fissiamo..."), nessun occhiello numerato, un solo
 * "·" per riga. I gradi misurano il movimento, mai il dolore.
 *
 * Numero di telefono ed email non compaiono mai a vista: i link dicono
 * "Chiama" e "Scrivi" (numero ed email di esempio sono in `studio.ts`, solo
 * come href).
 *
 * Le funzioni servono solo a inserire valori (date, ore, gradi, nomi) in
 * frasi già scritte: non calcolano disponibilità né prezzi.
 */

import { euro, PREZZI } from './listino';
import { ACCESSO, RECAPITI } from './studio';
import { ORARI_IN_BREVE } from './orari';

/* ================================================================== tipi */

/**
 * Gli angoli di contenuto. Stesso tipo di `Angolo` in `dial/geometria.ts`
 * (tupla 0…180 ogni 30): è ridefinito qui perché il contenuto compili da
 * solo; i due tipi sono strutturalmente identici.
 */
export type GradiAngolo = 0 | 30 | 60 | 90 | 120 | 150 | 180;

/** Giorno della settimana: 0 = lunedì … 6 = domenica (come l'anello). */
export type IndiceGiorno = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Un momento sul calendario, come lo passa `sections/Prenota/calendario.ts`:
 * `ora` è 'HH:MM', `mese` 0-11, `data` il giorno del mese.
 */
export interface Quando {
  readonly giorno: IndiceGiorno;
  readonly data: number;
  readonly mese: number;
  readonly ora: string;
}

/** Id dei suggerimenti del campo "Cosa ti porta da noi" (e valori di `?motivo=`). */
export type IdMotivo = 'spalla' | 'schiena' | 'collo' | 'ginocchio' | 'intervento';

/* ================================================================== date e ore */

export const GIORNI = {
  lungo: ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'],
  breve: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
} as const;

export const MESI = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
] as const;

/** '18:00' → '18:00'; '8:00' → '8:00' (niente zero davanti a vista). */
export function oraVista(ora: string): string {
  const [h = '0', m = '00'] = ora.split(':');
  return `${Number(h)}:${m}`;
}

/** Ora in una frase: '18:00' → '18', '13:30' → '13:30'. Si usa dopo "alle". */
export function oraFrase(ora: string): string {
  const [h = '0', m = '00'] = ora.split(':');
  return m === '00' ? String(Number(h)) : `${Number(h)}:${m}`;
}

/** Ora per il lettore di schermo: '18:00' → 'ore 18', '13:30' → 'ore 13 e 30'. */
export function oraSr(ora: string): string {
  const [h = '0', m = '00'] = ora.split(':');
  return m === '00' ? `ore ${Number(h)}` : `ore ${Number(h)} e ${Number(m)}`;
}

/** Sigla del giorno con la data: "mer 7". */
export const giornoBreve = (q: Quando): string => `${GIORNI.breve[q.giorno]} ${q.data}`;

/** Lettura breve (centro dell'anello, riga del controllo): "mer 7 · 18:00". */
export const quandoBreve = (q: Quando): string => `${giornoBreve(q)} · ${oraVista(q.ora)}`;

/** In una frase: "mercoledì 7 alle 18". */
export const quandoFrase = (q: Quando): string => `${GIORNI.lungo[q.giorno]} ${q.data} alle ${oraFrase(q.ora)}`;

/** Per il lettore di schermo e per la legend: "mercoledì 7 ottobre". */
export const giornoLungo = (q: Pick<Quando, 'giorno' | 'data' | 'mese'>): string =>
  `${GIORNI.lungo[q.giorno]} ${q.data} ${MESI[q.mese] ?? ''}`.trim();

/** Per il lettore di schermo: "mercoledì 7 ottobre, ore 18". */
export const quandoSr = (q: Quando): string => `${giornoLungo(q)}, ${oraSr(q.ora)}`;

/** Prima lettera maiuscola (inizio di frase). */
const maiuscola = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* ================================================================== meta e vetrina */

export const META = {
  /** <title>: 57 caratteri, dice "Concept di Ciceri Lab". */
  title: 'NOVANTA, fisioterapia e osteopatia · Concept di Ciceri Lab',
  /** meta description: 158 caratteri. Dice subito che lo studio è inventato. */
  description:
    'Concept di Ciceri Lab: il sito di uno studio di fisioterapia e osteopatia di Pordenone, inventato. Alzi il braccio del goniometro e prenoti visita e controllo.',
  /** Open Graph: li copia il prerender del sito. */
  ogTitle: 'NOVANTA, fisioterapia e osteopatia. Un concept di Ciceri Lab',
  ogDescription:
    'Il movimento si misura in gradi. Ruota il goniometro, e a 90 gradi prenoti la prima visita con il controllo della settimana dopo. Un concept di Ciceri Lab.',
  ogImageAlt:
    'Un goniometro a mezzo disco color gesso su fondo albicocca, con il braccio petrolio alzato a 90 gradi.',
} as const;

/**
 * Proposta di voce per `src/content/site.ts` (CONCEPTS) nel sito vero. La
 * usa chi porta il concept, se Luca è d'accordo.
 */
export const VETRINA = {
  tag: 'Fisioterapia e osteopatia',
  title: 'NOVANTA',
  subtitle: 'Fisioterapia e osteopatia · Pordenone',
  desc: 'Il sito si naviga alzando il braccio di un goniometro, da 0 a 180 gradi. A 90 si prenota la prima visita, e il controllo della settimana dopo si fissa da solo.',
  perche: 'Il fisioterapista misura il movimento in gradi. Il sito usa lo stesso strumento: il numero che cambia è il modo in cui ti muovi tra i contenuti.',
  mestieri: [
    'fisioterapia',
    'fisioterapista',
    'osteopatia',
    'osteopata',
    'riabilitazione',
    'studio di fisioterapia',
  ],
} as const;

/* ================================================================== comuni */

export const COMUNI = {
  marchio: 'NOVANTA',
  /** Seconda riga dell'h1 (visibile piccola, o solo per il lettore di schermo a 375). */
  marchioSotto: 'fisioterapia e osteopatia, Pordenone',
  /** Testo accessibile completo dell'h1. */
  h1Sr: 'NOVANTA, fisioterapia e osteopatia, Pordenone',
  /** "90°" a vista. */
  gradi: (g: number) => `${Math.round(g)}°`,
  /** "90 gradi" in una frase o per il lettore di schermo. */
  gradiParlati: (g: number) => {
    const n = Math.round(g);
    return n === 1 ? '1 grado' : `${n} gradi`;
  },
  conceptDi: 'Un concept di Ciceri Lab',
  /** Riga di finzione nel piede (180° e vista elenco). */
  finzione:
    'NOVANTA è uno studio inventato. Indirizzo, telefono, email, nomi, orari e prezzi sono di esempio.',
  /** Nome accessibile aggiunto ai link che aprono una nuova scheda. */
  nuovaScheda: '(si apre in una nuova scheda)',
  /** Per le aree di contenuto che scorrono (sotto la maschera sfumata). */
  continuaSotto: 'Il testo continua sotto: scorri quest\'area.',
  obbligatorio: 'obbligatorio',
  facoltativo: 'facoltativo',
} as const;

/* ================================================================== recapiti a vista */

/** Link di contatto: mai il numero o l'email a vista. */
export const CONTATTI = {
  chiama: {
    testo: 'Chiama',
    /** Il nome accessibile inizia con il testo visibile (WCAG 2.5.3). */
    aria: 'Chiama lo studio (numero di esempio)',
    href: RECAPITI.telefonoHref,
  },
  scrivi: {
    testo: 'Scrivi',
    aria: 'Scrivi allo studio (indirizzo email di esempio)',
    href: RECAPITI.emailHref,
  },
  maps: {
    testo: 'Apri in Maps ↗',
    aria: `Apri in Maps: ${RECAPITI.via}, ${RECAPITI.citta} ${COMUNI.nuovaScheda}`,
    query: RECAPITI.mapsQuery,
  },
  /** Una riga piccola vicino ai link. */
  nota: 'Telefono ed email sono di esempio: lo studio non esiste.',
} as const;

/* ================================================================== salti */

export const SALTI = {
  contenuto: 'Salta al contenuto',
  prenotazione: 'Vai alla prenotazione',
} as const;

/* ================================================================== testata */

export const TESTATA = {
  aria: 'Testata',
  chiama: CONTATTI.chiama.testo,
  chiamaAria: CONTATTI.chiama.aria,
  /** Interruttore di vista: l'etichetta cambia, niente aria-pressed. */
  vistaElenco: 'Leggi in elenco',
  vistaElencoBreve: 'elenco',
  /** A 375 il testo visibile è "elenco": il nome accessibile lo contiene. */
  vistaElencoAria: 'elenco: leggi tutti gli angoli in una pagina sola',
  vistaQuadrante: 'Torna al quadrante',
  vistaQuadranteBreve: 'quadrante',
  vistaQuadranteAria: 'quadrante: torna al goniometro',
} as const;

/* ================================================================== quadrante */

/** Nome di ogni angolo: parola sul quadrante, annuncio, nome nei passi. */
export const NOMI_ANGOLI = {
  0: { parola: 'da zero', annuncio: 'Da zero', frammento: 'gradi-0' },
  30: { parola: 'primo incontro', annuncio: 'Primo incontro', frammento: 'gradi-30' },
  60: { parola: 'trattamenti', annuncio: 'Trattamenti', frammento: 'gradi-60' },
  90: { parola: 'prenota', annuncio: 'Prenota', frammento: 'gradi-90' },
  120: { parola: 'osteopatia', annuncio: 'Osteopatia', frammento: 'gradi-120' },
  150: { parola: 'esercizi', annuncio: 'Esercizi', frammento: 'gradi-150' },
  180: { parola: 'prezzi e dove', annuncio: 'Prezzi e dove', frammento: 'gradi-180' },
} as const satisfies Record<GradiAngolo, { parola: string; annuncio: string; frammento: string }>;

export const QUADRANTE = {
  navAria: 'Angoli',
  /** aria-label dello slider del braccio. */
  sliderAria: 'Angolo',
  /**
   * aria-valuetext del braccio, aggiornato a fine movimento.
   * Agganciato: "90 gradi, prenota". Fermo tra due angoli: "47 gradi, vicino a trattamenti".
   */
  valoreSr: (gradi: number, vicino: GradiAngolo) => {
    const n = Math.round(gradi);
    return n === vicino
      ? `${COMUNI.gradiParlati(n)}, ${NOMI_ANGOLI[vicino].parola}`
      : `${COMUNI.gradiParlati(n)}, vicino a ${NOMI_ANGOLI[vicino].parola}`;
  },
  /** Passi del basamento mobile (a vista). */
  passoPrecedente: '‹ 30°',
  passoSuccessivo: '30° ›',
  /** aria-label dei passi, con il nome vero della destinazione. */
  passoPrecedenteAria: (verso: GradiAngolo) => `Angolo precedente: ${NOMI_ANGOLI[verso].parola}`,
  passoSuccessivoAria: (verso: GradiAngolo) => `Angolo successivo: ${NOMI_ANGOLI[verso].parola}`,
  /** Passo disattivato ai limiti (aria-describedby). */
  passoFermoInizio: 'Sei già a 0 gradi.',
  passoFermoFine: 'Sei già a 180 gradi.',
  /** Fascia mobile a 90°: i due passi hanno il nome a vista. */
  fasciaPrecedente: (verso: GradiAngolo) => `‹ ${NOMI_ANGOLI[verso].parola}`,
  fasciaSuccessivo: (verso: GradiAngolo) => `${NOMI_ANGOLI[verso].parola} ›`,
  /** Finestrella di lettura del braccio (aria-hidden): solo il numero. */
  finestrella: (gradi: number) => String(Math.round(gradi)),
} as const;

/* ================================================================== testi alternativi */

/**
 * `alt` delle tre foto scelte dal photo-editor (Wikimedia Commons, guardate
 * una per una). Descrivono ciò che si vede davvero. Le chiavi coincidono con
 * `ChiaveFoto` di `assets/foto/index.ts`: la chiave `ingresso` resta per
 * contratto, ma la foto è l'angolo d'attesa.
 */
export const ALT_FOTO = {
  studio:
    'Una stanza dello studio vuota: il lettino con un cuscino a ferro di cavallo e un rullo arancio, davanti alla finestra con due piante sul davanzale.',
  attrezzi:
    'Attrezzi appoggiati al muro: un tappetino blu arrotolato, un cuscino di equilibrio, tappetini rossi, tavolette per l\'equilibrio e un rullo.',
  ingresso: 'L\'angolo d\'attesa dello studio: una poltrona grigia accanto a una lampada di carta accesa.',
} as const;

/**
 * Crediti delle foto (CC BY 4.0, attribuzione obbligatoria). Vanno nel piede
 * di 180° e nel piede della vista elenco. Autore e licenza sono link: la
 * licenza a `licenzaHref`, le fonti alle pagine `FOTO[chiave].url` di
 * `assets/foto/index.ts`, con le etichette di `fonti`.
 * Il nome dello studio della fonte non si scrive da nessuna parte.
 */
export const CREDITI_FOTO = {
  /** Riga intera in testo semplice (se non si usano i link). */
  riga: 'Foto: PantheraLeo1359531, Wikimedia Commons, licenza CC BY 4.0. Ritagliate e ridimensionate.',
  prima: 'Foto: ',
  autore: 'PantheraLeo1359531',
  fonte: 'Wikimedia Commons',
  licenza: 'CC BY 4.0',
  licenzaAria: `Licenza CC BY 4.0 ${'(si apre in una nuova scheda)'}`,
  licenzaHref: 'https://creativecommons.org/licenses/by/4.0/deed.it',
  modifiche: 'Ritagliate e ridimensionate.',
  /** Etichette dei link alle pagine delle foto. */
  fontiTitolo: 'Le foto su Wikimedia Commons:',
  fonti: {
    studio: 'la stanza',
    attrezzi: 'gli attrezzi',
    ingresso: 'l\'angolo d\'attesa',
  },
  fontiAria: {
    studio: 'la stanza: pagina della foto su Wikimedia Commons (si apre in una nuova scheda)',
    attrezzi: 'gli attrezzi: pagina della foto su Wikimedia Commons (si apre in una nuova scheda)',
    ingresso: 'l\'angolo d\'attesa: pagina della foto su Wikimedia Commons (si apre in una nuova scheda)',
  },
  /** Precisazione onesta: le foto non sono di uno studio di Pordenone. */
  nota: 'Le foto mostrano un vero studio di terapia, non NOVANTA.',
} as const;

/* ================================================================== angoli */

/** 0° · da zero. */
export const ZERO = {
  titolo: 'Misuriamo il movimento, lavoriamo per riprenderlo.',
  /** ≤ 20 parole (18): chi siamo e per chi. */
  frase:
    'Fisioterapia e osteopatia a Pordenone. Spalla, schiena, collo, ginocchio, dopo un intervento o una caduta, ritorno allo sport.',
  /** Didascalia di strumento (Lexend 14 px), la prova concreta. */
  nota: 'Alla prima visita ti diamo un numero: di quanti gradi ti muovi oggi, e dove si può arrivare.',
  orario: ORARI_IN_BREVE,
  /** Unico richiamo alla prenotazione: porta il braccio a 90°. */
  prenota: 'Prenota',
  /** Sotto il bottone, piccolo: link tel:. */
  oChiama: 'o chiama',
  oChiamaAria: 'o chiama lo studio (numero di esempio)',
} as const;

/** 30° · primo incontro. */
export const PRIMO_INCONTRO = {
  titolo: 'La prima visita, un\'ora.',
  /** Quattro momenti in una `ol`: la parola in Epilogue, il resto in Lexend. */
  momenti: [
    { parola: 'Parliamo.', resto: 'Cosa non riesci più a fare, da quando, cosa hai già provato.' },
    { parola: 'Guardiamo', resto: 'come ti muovi: da seduto, in piedi, sul lettino.' },
    {
      parola: 'Misuriamo',
      resto: 'con il goniometro di quanti gradi si muove l\'articolazione. Si chiama escursione articolare.',
    },
    { parola: 'Ti diciamo', resto: 'quante sedute servono, indicativamente, e quanto costano.' },
  ],
  durata: `60 minuti, ${euro(PREZZI.primaVisita)}. Comprende il primo trattamento e gli esercizi da fare a casa.`,
  portare:
    'Porta referti ed esami recenti. Se sei stato operato, la lettera di dimissione e le indicazioni del chirurgo. Vestiti comodi: pantaloncini se è il ginocchio, canottiera se è la spalla.',
  /** Chi la fa (brand: stessa persona dall'inizio alla fine). */
  chi: 'La prima visita la fa quasi sempre Giulia. Poi ti segue la stessa persona per tutto il ciclo.',
  /** Il mini arco doppio: esempio di misura, GINOCCHIO dopo una protesi. */
  misura: {
    articolazione: 'ginocchio dopo una protesi',
    oggi: 'oggi 70°',
    obiettivo: 'obiettivo 90°',
    /** figcaption: il mini arco SVG è aria-hidden, questa frase dice tutto. */
    didascalia:
      'Esempio: un ginocchio operato di protesi oggi si piega a 70 gradi. 90 è un traguardo comune delle prime settimane, non il punto d\'arrivo per tutti.',
  },
  /** Didascalia di strumento, piccola. */
  nota: 'A ogni controllo la misura si ripete nella stessa posizione, così i numeri si possono confrontare.',
} as const;

/** 60° · trattamenti. */
export const TRATTAMENTI = {
  titolo: 'Con le mani e con l\'esercizio.',
  intro: 'Si lavora sul movimento: prima con le mani del terapista, poi con esercizi scelti e dosati per te.',
  /** `dl`: nome (dt), frase e durata (dd). */
  voci: [
    {
      id: 'manuale',
      nome: 'Terapia manuale',
      frase: 'Mobilizzazione delle articolazioni e trattamento dei tessuti molli, con le mani, lenti e controllati.',
      durata: '45 min',
      durataSr: '45 minuti',
    },
    {
      id: 'esercizio',
      nome: 'Esercizio terapeutico',
      frase: 'Esercizi scelti per il tuo problema e aumentati poco alla volta. Si imparano qui, si continuano a casa.',
      durata: '45 min',
      durataSr: '45 minuti',
    },
    {
      id: 'dopo-intervento',
      nome: 'Riabilitazione dopo intervento',
      frase: 'Protesi di anca e ginocchio, crociato, spalla operata, fratture. Si parte dalle indicazioni del chirurgo.',
      durata: '60 min',
      durataSr: '60 minuti',
    },
    {
      id: 'sport',
      nome: 'Ritorno allo sport',
      frase: 'Carico progressivo e criteri misurati, cioè gradi, forza e test semplici. Se ne occupa Davide: corsa, padel, sci, bici.',
      durata: '45 min',
      durataSr: '45 minuti',
    },
    {
      id: 'taping',
      nome: 'Taping',
      frase: 'Nastro elastico sulla pelle che sostiene un movimento. È un aiuto, non una cura.',
      durata: '5-10 min, con la seduta',
      durataSr: 'da 5 a 10 minuti, dentro una seduta',
    },
  ],
  /** Prova di credibilità: numero indicativo di sedute. */
  quante:
    'Dopo una protesi di ginocchio di solito servono 2 sedute a settimana per 6-8 settimane, poi si diradano. Il numero per te lo diciamo alla prima visita.',
  noMacchine: 'Niente sedute di sole macchine: nessun pacchetto di tecar o laser come unica cura.',
  /** Rimando a 120°: link che porta il braccio a osteopatia. Non è un richiamo alla prenotazione. */
  rimando: {
    prima: 'Cerchi l\'osteopatia? ',
    link: 'È a 120 gradi',
    aria: 'È a 120 gradi: vai a osteopatia',
  },
} as const;

/* ================================================================== 90° · prenota */

/** Testo del bottone di invio in base allo stato. */
type ModoInvio = 'due' | 'una';

export const PRENOTA = {
  titolo: 'Prenota la prima visita.',
  istruzione: 'Gira l\'anello fino a un\'ora che ti va. Il controllo lo fissiamo noi, una settimana dopo.',
  /** Il prezzo è scritto anche qui (ux-architect 7). */
  prezzo: `Prima visita, 60 minuti, ${euro(PREZZI.primaVisita)}. La paghi in studio: qui non si paga niente.`,

  /* ---------------- anello */
  anello: {
    /** aria-label dello slider dell'anello. */
    aria: 'Prima visita',
    /** aria-valuetext: si ferma solo su ore libere. */
    valoreSr: (q: Quando) => `${quandoSr(q)}, libero`,
    /** Lettura al centro, riga grande: "mer 7 · 18:00". */
    lettura: quandoBreve,
    /** Lettura al centro, riga sotto. */
    letturaSotto: 'prima visita, 60 min',
    /** Durante la rotazione (S1), se sotto l'indice c'è un'ora piena. */
    occupata: 'occupata',
    /** Nomi delle due piste (legenda piccola accanto all'anello). */
    pistaInterna: 'questa settimana: prima visita',
    pistaEsterna: 'settimana dopo: controllo',
    /** Spicchi senza ore. */
    chiuso: 'chiuso',
    passato: 'passato',
    /** Etichetta di uno spicchio fuori dall'anello: "ven 2". */
    spicchio: giornoBreve,
    /** Nel prerender e senza date: niente ore, niente scelta. */
    prerender: 'Le ore libere compaiono qui appena la pagina è pronta.',
    /** Riga piccola sotto l'anello: non si finge una disponibilità vera. */
    esempio: 'Orari di esempio: questo è un prototipo.',
  },

  /* ---------------- elenco "Tutte le ore libere" */
  oreLibere: {
    bottone: 'Tutte le ore libere',
    /** legend di ogni fieldset: "venerdì 2 ottobre". */
    legend: giornoLungo,
    /** Etichetta di ogni radio: "18:00". */
    radio: (ora: string) => oraVista(ora),
    /** Nome accessibile della radio, se serve più contesto. */
    radioSr: (q: Quando) => quandoSr(q),
    nessunaNelGiorno: 'Nessuna ora libera.',
    settimanaInterna: 'Questa settimana',
    settimanaEsterna: 'La settimana dopo',
  },

  /* ---------------- controllo proposto */
  controllo: {
    /** Riga a vista: "controllo: gio 15 · 18:00". */
    lettura: (q: Quando) => `controllo: ${quandoBreve(q)}`,
    /** Nome accessibile della riga. */
    letturaSr: (q: Quando) => `Controllo: ${quandoSr(q)}`,
    prima: 'prima',
    dopo: 'dopo',
    primaAria: 'Controllo un giorno prima',
    dopoAria: 'Controllo un giorno dopo',
    /** Motivo quando "prima" o "dopo" è disattivato (aria-describedby). */
    limite: 'Il controllo resta tra 7 e 10 giorni dalla prima visita.',
    togli: 'solo la prima visita',
    rimetti: 'Aggiungi il controllo',
    /** Prima di aver scelto: la pista esterna mostra le tacche ma niente è acceso. */
    inAttesa: 'Il controllo compare qui quando scegli la prima visita.',
  },

  /* ---------------- campi */
  campi: {
    nome: {
      etichetta: 'Nome',
      aiuto: 'Se prenoti per un familiare, scrivi il nome di chi viene.',
      erroreVuoto: 'Scrivi il tuo nome, così sappiamo chi aspettare.',
      erroreCorto: 'Il nome sembra troppo corto: almeno due lettere.',
    },
    telefono: {
      etichetta: 'Telefono',
      aiuto: 'Lo usiamo solo per i tuoi appuntamenti.',
      erroreVuoto: 'Scrivi un numero di telefono: il promemoria arriva lì.',
      erroreIncompleto: 'Il numero sembra incompleto: controlla le cifre.',
    },
    motivo: {
      etichetta: 'Cosa ti porta da noi',
      aiuto: 'Due parole bastano. Il resto lo diciamo alla visita.',
      /** Solo sopra 120 caratteri su 140. */
      contatore: (restano: number) => (restano === 1 ? 'ancora 1 carattere' : `ancora ${restano} caratteri`),
      max: 140,
    },
    /** Suggerimenti a tocco sotto il terzo campo: aggiungono la parola al campo. */
    suggerimentiAria: 'Suggerimenti',
    suggerimenti: [
      { id: 'spalla', testo: 'spalla' },
      { id: 'schiena', testo: 'schiena' },
      { id: 'collo', testo: 'collo' },
      { id: 'ginocchio', testo: 'ginocchio' },
      { id: 'intervento', testo: 'dopo un intervento' },
    ],
  },

  /* ---------------- invio */
  invio: {
    bottone: { due: 'Fissa le due visite', una: 'Fissa la visita' } satisfies Record<ModoInvio, string>,
    /** Dopo "Cambia" (S13). */
    sposta: { due: 'Sposta le visite', una: 'Sposta la visita' } satisfies Record<ModoInvio, string>,
    /** S9: unica eccezione ai puntini, voluta dal creative-director. */
    inCorso: 'Fissiamo...',
    /** Sotto il bottone, sempre visibile. */
    dopo:
      'Ti scriviamo il giorno prima per ricordarti l\'orario. Puoi spostare o annullare con una telefonata o un messaggio fino a 24 ore prima, senza costi.',
  },

  /* ---------------- frasi degli stati (a vista; gli annunci sono in ANNUNCI) */
  stati: {
    /** S4: la stessa ora non c'è nella finestra 7-10 giorni. */
    oraDiversa: (oraChiesta: string, proposto: Quando, stessoGiorno: boolean) =>
      stessoGiorno
        ? `Alle ${oraFrase(oraChiesta)} non c'è posto: ti proponiamo le ${oraFrase(proposto.ora)}.`
        : `Alle ${oraFrase(oraChiesta)} non c'è posto: ti proponiamo ${quandoFrase(proposto)}.`,
    /** S5: finestra 7-10 giorni tutta piena. */
    settimanaPiena: 'La settimana dopo è piena: il controllo lo fissiamo insieme alla prima visita.',
    /** S6. */
    soloPrima: 'Fissi solo la prima visita. Il controllo lo decidiamo insieme in studio.',
    /** S10: l'ora è stata presa nel frattempo; l'anello si è spostato da solo. */
    postoPreso: (perso: Quando, nuovo: Quando) =>
      perso.giorno === nuovo.giorno && perso.data === nuovo.data
        ? `${maiuscola(GIORNI.lungo[perso.giorno])} alle ${oraFrase(perso.ora)} qualcuno ha appena prenotato. Ti abbiamo spostato alle ${oraFrase(nuovo.ora)}, sempre ${GIORNI.lungo[nuovo.giorno]}.`
        : `${maiuscola(GIORNI.lungo[perso.giorno])} alle ${oraFrase(perso.ora)} qualcuno ha appena prenotato. Ti abbiamo spostato a ${quandoFrase(nuovo)}.`,
    postoPresoDopo: 'Controlla l\'ora e premi di nuovo il bottone. I tuoi dati sono ancora qui.',
    /** S11: invio fallito. "chiamaci" è un link tel:, niente numero a vista. */
    fallito: {
      prima: (due: boolean) =>
        `Non siamo riusciti a fissare ${due ? 'le visite' : 'la visita'}. I tuoi dati sono ancora qui. Riprova tra poco o `,
      link: 'chiamaci',
      linkAria: 'chiamaci (numero di esempio)',
      dopo: '.',
    },
  },

  /* ---------------- successo (S12) e ritorno (S14) */
  successo: {
    /** Al centro dell'anello. Con il controllo: due frasi. */
    frase: (prima: Quando, controllo: Quando | null) =>
      controllo
        ? `Ci vediamo ${quandoFrase(prima)}. Il controllo è ${quandoFrase(controllo)}.`
        : `Ci vediamo ${quandoFrase(prima)}.`,
    /** Il messaggio chiave torna, in altra forma, solo qui. */
    chiusa: 'Alla prima visita misuriamo da dove parti. Mandi.',
    promemoria: 'Ti scriviamo il giorno prima.',
    /** Riassunto dei campi, che spariscono: "A nome di Marta, telefono che finisce per 42." */
    riassunto: (nome: string, ultimeDueCifre: string) =>
      `A nome di ${nome}, telefono che finisce per ${ultimeDueCifre}.`,
    calendario: 'Aggiungi al calendario',
    calendarioAria: 'Aggiungi al calendario: scarica un file con le visite',
    cambia: 'Cambia',
    cambiaAria: 'Cambia giorno o ora delle visite',
    /** S14: al ritorno, quando la prenotazione è in memoria nel browser. */
    giaFissato: 'Hai già fissato:',
    altraPersona: 'Prenota un\'altra persona',
  },

  /* ---------------- senza JavaScript (S15) */
  senzaScript: {
    frase: 'Per prenotare ',
    link: 'chiamaci',
    linkAria: 'chiamaci (numero di esempio)',
    dopo: '. Fissiamo insieme la prima visita e il controllo della settimana dopo.',
    orari: ORARI_IN_BREVE,
  },

  /* ---------------- file .ics (due VEVENT, generati nel browser) */
  ics: {
    nomeFile: 'novanta.ics',
    /** Una riga, un solo "·". */
    titoloPrima: 'Prima visita · NOVANTA',
    titoloControllo: 'Controllo · NOVANTA',
    luogo: RECAPITI.indirizzoRiga,
    descrizionePrima:
      'Prima visita fisioterapica, 60 minuti. Porta referti ed esami recenti e vestiti comodi. NOVANTA è uno studio di esempio: questo appuntamento non è vero.',
    descrizioneControllo:
      'Seduta di controllo, 45 minuti: rimisuriamo e aggiorniamo gli esercizi. NOVANTA è uno studio di esempio: questo appuntamento non è vero.',
  },
} as const;

/** 120° · osteopatia. */
export const OSTEOPATIA = {
  titolo: 'Osteopatia, detta semplice.',
  cosa:
    'È un trattamento manuale. L\'osteopata guarda come si muovono le diverse parti del corpo e lavora con le mani sulle zone che si muovono meno.',
  quandoSiTitolo: 'Quando ha senso',
  quandoSi:
    'Mal di schiena, dolore al collo, rigidità che tornano. Anche insieme alla fisioterapia: Chiara e i fisioterapisti si parlano e si dividono il lavoro.',
  quandoNoTitolo: 'Quando no',
  quandoNo:
    'Dolore forte e improvviso dopo un trauma, febbre, formicolii che peggiorano, perdita di forza: lì serve un medico o il pronto soccorso. Non trattiamo neonati, né disturbi di digestione, ciclo o ansia.',
  /** Lexend 500, la frase dell'onestà. */
  medico: 'Se serve un medico te lo diciamo, e ti indichiamo a chi rivolgerti.',
  chi: 'La fa Chiara, osteopata con formazione a tempo pieno. È qui martedì e giovedì pomeriggio e sabato mattina.',
  durata: `Prima seduta 60 minuti, ${euro(PREZZI.primaOsteopatia)}. Le successive 45 minuti, ${euro(PREZZI.osteopatia)}.`,
} as const;

/** 150° · esercizi. */
export const ESERCIZI = {
  titolo: 'Tre cose da fare a casa.',
  intro: 'Tra una seduta e l\'altra si lavora anche a casa. Tre esempi, ognuno con il suo angolo.',
  /** Ogni esercizio: `li` con h3, testo, mini arco (aria-hidden) con l'angolo obiettivo. */
  voci: [
    {
      id: 'pendolo',
      nome: 'Pendolo',
      articolazione: 'spalla',
      obiettivo: 30,
      /** A vista accanto al mini arco. */
      obiettivoVista: 'fino a circa 30°',
      come:
        'In piedi, busto in avanti e una mano appoggiata al tavolo. L\'altro braccio pende e oscilla piano, avanti e indietro, senza spingere.',
      quanto: '10 volte, 2 volte al giorno.',
      /** L'angolo scritto a parole (il mini arco è aria-hidden). */
      obiettivoSr: 'Fino a circa 30 gradi.',
    },
    {
      id: 'muro',
      nome: 'Scivolamento al muro',
      articolazione: 'spalla',
      obiettivo: 120,
      obiettivoVista: 'fino a circa 120°',
      come:
        'In piedi di fronte al muro, la mano sale scivolando e poi scende piano. Ti fermi dove il dolore non aumenta.',
      quanto: '10 volte, 2 volte al giorno.',
      obiettivoSr: 'Fino a circa 120 gradi, o fin dove il dolore non aumenta.',
    },
    {
      id: 'tallone',
      nome: 'Tallone che scivola',
      articolazione: 'ginocchio, dopo una protesi',
      obiettivo: 90,
      obiettivoVista: 'obiettivo 90°',
      come:
        'Sdraiato sul letto, il tallone scivola verso il sedere e il ginocchio si piega. Poi torna disteso, piano.',
      quanto: '10 volte, 3 volte al giorno.',
      obiettivoSr: 'Obiettivo 90 gradi di piegamento.',
    },
  ],
  /** Sempre visibile, in fondo all'angolo. */
  avvertenza:
    'Sono esempi. Il programma giusto per te lo decidiamo alla visita. Se un esercizio aumenta il dolore, fermati e parlane con noi.',
  /** Didascalia di strumento, piccola. */
  nota: 'Gli esercizi scritti te li diamo dopo ogni seduta in cui cambiano.',
} as const;

/** 180° · prezzi e dove. */
export const PREZZI_DOVE = {
  titolo: 'Quanto costa, e dove siamo.',
  prezziTitolo: 'Quanto costa',
  /** Sopra il listino (dati in `listino.ts`). */
  prezziNota: 'Prezzi per seduta, di esempio.',
  listinoAria: 'Listino di esempio',
  pagamento: 'Paghi con carta, bancomat o contanti. Fattura sanitaria a ogni seduta.',
  cicli: 'I cicli si pagano seduta per seduta o in anticipo, come preferisci. Non ti chiediamo di pagare sedute che non servono.',
  detrazione:
    'Le prestazioni sanitarie con fattura possono essere detratte nella dichiarazione dei redditi secondo le regole in vigore. Conserva la fattura e il pagamento tracciabile; per i dettagli chiedi al tuo CAF o al commercialista.',
  assicurazioni: 'Se la tua polizza rimborsa la fisioterapia, ti diamo la fattura da presentare.',
  disdetta: 'Spostare o disdire è gratis fino a 24 ore prima.',
  accessoDiretto: 'Per la fisioterapia privata non serve la prescrizione del medico. Porta comunque ogni referto.',

  doveTitolo: 'Dove siamo',
  indirizzo: {
    riga1: RECAPITI.via,
    riga2: `${RECAPITI.cap} ${RECAPITI.citta}`,
  },
  accesso: `${ACCESSO.piano} ${ACCESSO.ingresso}`,
  parcheggio: `${ACCESSO.parcheggio} ${ACCESSO.autobus}`,
  orariTitolo: 'Orari',
  /** Le righe degli orari sono in `orari.ts` (RIGHE_ORARI, RIGA_ORARI_OSTEOPATIA, RIGA_ORARI_SEGRETERIA). */
  orariAria: 'Orari dello studio',
  chiama: CONTATTI.chiama,
  scrivi: CONTATTI.scrivi,
  maps: CONTATTI.maps,
  recapitiNota: CONTATTI.nota,
  /** Piede dell'angolo. Testo semplice, non un bottone (il ritorno è il ConceptBackButton). */
  conceptDi: COMUNI.conceptDi,
  finzione: COMUNI.finzione,
  /** Crediti delle foto, obbligatori (CC BY 4.0), nel piede dell'angolo. */
  creditiFoto: CREDITI_FOTO,
} as const;

/** Il contenuto di ogni angolo: titolo h2 (≤ 6 parole) e nome. */
export const ANGOLI_TESTI = {
  0: { ...NOMI_ANGOLI[0], titolo: ZERO.titolo },
  30: { ...NOMI_ANGOLI[30], titolo: PRIMO_INCONTRO.titolo },
  60: { ...NOMI_ANGOLI[60], titolo: TRATTAMENTI.titolo },
  90: { ...NOMI_ANGOLI[90], titolo: PRENOTA.titolo },
  120: { ...NOMI_ANGOLI[120], titolo: OSTEOPATIA.titolo },
  150: { ...NOMI_ANGOLI[150], titolo: ESERCIZI.titolo },
  180: { ...NOMI_ANGOLI[180], titolo: PREZZI_DOVE.titolo },
} as const satisfies Record<GradiAngolo, { parola: string; annuncio: string; frammento: string; titolo: string }>;

/* ================================================================== vista elenco */

export const ELENCO = {
  /** Riga role="status" in cima quando il passaggio è automatico. */
  automatico: {
    finestraBassa: 'Stai leggendo in elenco perché la finestra è bassa.',
    testoGrande: 'Stai leggendo in elenco perché il testo è grande.',
    nonSiPuo: 'Il quadrante torna quando la finestra è più grande.',
  },
  /** Piede (footer) della vista elenco. */
  piede: {
    aria: 'Dove siamo e chi ha fatto questo sito',
    dove: `${RECAPITI.indirizzoBreve}. ${ORARI_IN_BREVE}`,
    chiama: CONTATTI.chiama,
    maps: CONTATTI.maps,
    conceptDi: COMUNI.conceptDi,
    finzione: COMUNI.finzione,
    creditiFoto: CREDITI_FOTO,
  },
} as const;

/* ================================================================== annunci aria-live */

/**
 * Regione aria-live="polite" dell'angolo (solo il nome dell'angolo, una volta
 * per aggancio) e regione degli esiti della prenotazione.
 */
export const ANNUNCI = {
  /** Cambio d'angolo: solo il nome. */
  angolo: (g: GradiAngolo) => NOMI_ANGOLI[g].annuncio,
  /** S2: prima visita scelta e controllo proposto. */
  scelta: (prima: Quando, controllo: Quando | null) =>
    controllo
      ? `Prima visita ${quandoSr(prima)}. Controllo proposto ${quandoSr(controllo)}.`
      : `Prima visita ${quandoSr(prima)}.`,
  /** S3. */
  controlloSpostato: (controllo: Quando) => `Controllo: ${quandoSr(controllo)}.`,
  /** S4 e S5 ripetono la frase a vista: PRENOTA.stati.oraDiversa / settimanaPiena. */
  /** S6. */
  controlloTolto: 'Controllo tolto. Fissi solo la prima visita.',
  controlloRimesso: (controllo: Quando) => `Controllo di nuovo proposto: ${quandoSr(controllo)}.`,
  /** Suggerimento toccato. */
  suggerimento: (testo: string) => `Aggiunto: ${testo}.`,
  /** S9. */
  inCorso: (due: boolean) => (due ? 'Stiamo fissando le visite.' : 'Stiamo fissando la visita.'),
  /** S10 ripete PRENOTA.stati.postoPreso. S11. */
  fallito: (due: boolean) =>
    `Non siamo riusciti a fissare ${due ? 'le visite' : 'la visita'}. I tuoi dati sono ancora qui. Riprova tra poco o chiama lo studio.`,
  /** S12: la frase intera, poi il promemoria. */
  successo: (prima: Quando, controllo: Quando | null) =>
    `${PRENOTA.successo.frase(prima, controllo)} ${PRENOTA.successo.promemoria}`,
  /** S13. */
  cambia: (due: boolean) => (due ? 'Puoi cambiare le visite.' : 'Puoi cambiare la visita.'),
  /** Cambio di vista. */
  vistaElenco: 'Vista elenco.',
  vistaQuadrante: 'Vista quadrante.',
} as const;

/* ================================================================== esportazione unica */

export const TESTI = {
  meta: META,
  vetrina: VETRINA,
  comuni: COMUNI,
  contatti: CONTATTI,
  salti: SALTI,
  testata: TESTATA,
  quadrante: QUADRANTE,
  nomiAngoli: NOMI_ANGOLI,
  angoli: ANGOLI_TESTI,
  zero: ZERO,
  primoIncontro: PRIMO_INCONTRO,
  trattamenti: TRATTAMENTI,
  prenota: PRENOTA,
  osteopatia: OSTEOPATIA,
  esercizi: ESERCIZI,
  prezziDove: PREZZI_DOVE,
  elenco: ELENCO,
  altFoto: ALT_FOTO,
  creditiFoto: CREDITI_FOTO,
  annunci: ANNUNCI,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
