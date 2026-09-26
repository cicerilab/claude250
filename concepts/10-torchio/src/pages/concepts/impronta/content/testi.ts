/**
 * IMPRONTA · tutti i testi visibili del sito (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter. Nessun trattino lungo, nessun punto
 * esclamativo, nessun puntino di sospensione, nessun occhiello numerato.
 * "Prova la tua" è l'unica etichetta del richiamo al preventivo.
 *
 * Le funzioni servono solo a inserire valori (carta scelta, prezzo, nomi) in
 * frasi già scritte: non fanno calcoli di prezzo.
 */

import type { Carta, Legatura, Prodotto, Quando, Tecnica } from './prezzi';

/* ================================================================== aiuti */

/**
 * Euro all'italiana: "160 €", "1.090 €", "8,50 €", "0,40 €".
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

/** "1.000" per le tirature. */
export function numero(valore: number): string {
  return String(valore).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ================================================================== nomi condivisi */

/** Le quattro carte: nome, grammatura, uso. Stessi testi ovunque. */
export const CARTE = {
  citrino: {
    nome: 'Citrino',
    grammatura: '300 g',
    spessore: 'circa 0,4 mm',
    uso: 'per tutto',
    descrizione: 'Giallo pieno, tinto nella fibra. La carta di casa: cartoline, menu, inviti.',
    radioAria: 'Citrino, 300 grammi, per tutto',
  },
  cotone: {
    nome: 'Cotone',
    grammatura: '600 g',
    spessore: 'circa 0,7 mm',
    uso: 'biglietti da visita',
    descrizione: 'Bianco caldo, cotone al 100%. Morbida e spessa: il rilievo ci affonda.',
    radioAria: 'Cotone, 600 grammi, per biglietti da visita',
  },
  cipria: {
    nome: 'Cipria',
    grammatura: '350 g',
    spessore: 'circa 0,45 mm',
    uso: 'partecipazioni',
    descrizione: 'Rosa polvere, tinta in pasta. Il colore è dentro la carta, non sopra.',
    radioAria: 'Cipria, 350 grammi, per partecipazioni',
  },
  grafite: {
    nome: 'Grafite',
    grammatura: '400 g',
    spessore: 'circa 0,5 mm',
    uso: 'copertine e libri',
    descrizione: 'Grigio quasi nero. Si stampa in bianco o in lamina, il secco si legge di luce.',
    radioAria: 'Grafite, 400 grammi, per copertine e libri',
  },
} as const satisfies Record<Carta, unknown>;

/** Ordine di presentazione delle carte (sezione carta, banco, indice). */
export const ORDINE_CARTE = ['citrino', 'cotone', 'cipria', 'grafite'] as const;

/** Le tecniche con il nome lungo e quello breve (bottoni stretti su 375 px). */
export const TECNICHE_NOMI = {
  secco: { nome: 'a secco', breve: 'a secco' },
  colore: { nome: 'a un colore', breve: 'a un colore' },
  lamina: { nome: 'lamina argento', breve: 'lamina' },
} as const satisfies Record<Tecnica, unknown>;

/** I prodotti del banco. */
export const PRODOTTI = {
  biglietto: {
    nome: 'Biglietto da visita',
    breve: 'biglietto',
    formato: '85×55 mm',
    unita: 'biglietti',
    unitaUno: 'biglietto',
  },
  partecipazione: {
    nome: 'Partecipazione',
    breve: 'partecipazione',
    formato: '148×105 mm',
    unita: 'partecipazioni con busta',
    unitaUno: 'partecipazione con busta',
  },
  intestata: {
    nome: 'Carta intestata',
    breve: 'carta intestata',
    formato: 'A4, 210×297 mm',
    unita: 'fogli e buste',
    unitaUno: 'foglio e busta',
  },
  libro: {
    nome: 'Libro o libretto',
    breve: 'libro',
    formato: '150×210 mm, 48 pagine',
    unita: 'copie',
    unitaUno: 'copia',
  },
} as const satisfies Record<Prodotto, unknown>;

/** Le legature (sezione il filo e banco, se libro). */
export const LEGATURE_NOMI = {
  brossura: { nome: 'Brossura cucita', breve: 'brossura cucita' },
  cartonato: { nome: 'Cartonato', breve: 'cartonato' },
  giapponese: { nome: 'Legatura giapponese', breve: 'giapponese' },
  punto: { nome: 'Punto metallico', breve: 'punto metallico' },
} as const satisfies Record<Legatura, unknown>;

/** Le sezioni: nome nell'indice (lungo) e nel segnapagina (max 10 caratteri). */
export const SEZIONI = {
  inizio: { indice: 'la pressa', segnapagina: 'la pressa' },
  lavori: { indice: 'tre lavori sul bancone', segnapagina: 'tre lavori' },
  tecniche: { indice: 'la stessa parola, quattro volte', segnapagina: 'tecniche' },
  carta: { indice: 'la carta', segnapagina: 'la carta' },
  legatoria: { indice: 'il filo', segnapagina: 'il filo' },
  banco: { indice: 'il banco di prova', segnapagina: 'il banco' },
  bottega: { indice: 'la bottega', segnapagina: 'la bottega' },
  colophon: { indice: 'colophon', segnapagina: 'colophon' },
} as const;

export type SezioneId = keyof typeof SEZIONI;

export const ORDINE_SEZIONI = [
  'inizio',
  'lavori',
  'tecniche',
  'carta',
  'legatoria',
  'banco',
  'bottega',
  'colophon',
] as const;

/* ================================================================== bottega (dati di esempio) */

/**
 * Dati di contatto DI ESEMPIO. Il repo è pubblico: il numero e l'email non
 * esistono. Nessuna P.IVA, nessuna ragione sociale.
 *
 * Giro 2: il numero e l'indirizzo email non si mostrano mai come testo.
 * A vista ci sono solo le etichette dei link ("Chiama la bottega", "Scrivi
 * alla bottega"); `telefono` ora È l'etichetta. `email` resta l'indirizzo
 * perché core/links.ts ci costruisce il mailto: a vista va `emailEtichetta`.
 */
export const RECAPITI = {
  via: 'Via Cavallotti 18',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  indirizzoRiga: 'Via Cavallotti 18, 33170 Pordenone',
  /** Testo visibile del link telefono (niente numero a vista). */
  telefono: 'Chiama la bottega',
  telefonoEtichetta: 'Chiama la bottega',
  /** Il numero di esempio, solo come dato: non va mostrato. */
  telefonoNumero: '0434 000 000',
  telefonoHref: 'tel:+390434000000',
  /** Indirizzo per il mailto (core/links.ts). Non va mostrato: a vista usare emailEtichetta. */
  email: 'bottega@impronta.example',
  emailEtichetta: 'Scrivi alla bottega',
  /** Una riga che dice che i recapiti sono di esempio. */
  nota: 'Telefono ed email sono di esempio: la bottega non esiste.',
  /** Testo da cercare in Maps: la via, non un'attività. */
  mapsQuery: 'Via Cavallotti, 33170 Pordenone PN',
} as const;

/* ================================================================== meta */

export const META = {
  /**
   * <title>: 58 caratteri. Dice "concept" già nello snippet (SEO P3) e scrive
   * il marchio "Ciceri Lab" come i titoli del prerender (SEO P11).
   * Copiato in scripts/prerender-meta.mjs del sito: tenerli uguali.
   */
  title: 'Concept 10 · IMPRONTA, tipografia e legatoria | Ciceri Lab',
  /** meta description: 149 caratteri. Dice subito che la bottega è inventata. */
  description:
    'Concept di Ciceri Lab: il sito di una tipografia e legatoria di Pordenone, inventata. Scrivi il tuo testo, scegli la carta e guarda la prova premuta.',
  /** og:title, og:description, og:image:alt: non li usa il codice, li copia il prerender del sito (SEO P10). */
  ogTitle: 'IMPRONTA, tipografia e legatoria. Un concept di Ciceri Lab',
  ogDescription: 'Scrivi il tuo nome e guardalo premuto nella carta. Un concept di Ciceri Lab.',
  /** Testo alternativo dell'immagine di anteprima (public/concepts/concept-10.jpg). */
  ogImageAlt: 'La parola impronta premuta a secco in un foglio giallo citrino, con la luce radente.',
} as const;

/**
 * Voce per src/content/site.ts (CONCEPTS) nel sito vero. Non è di questo
 * progetto: la usa chi porta il concept, se Luca è d'accordo.
 */
export const VETRINA = {
  tag: 'Tipografia e legatoria',
  title: 'IMPRONTA',
  subtitle: 'Tipografia e legatoria · Pordenone',
  desc: 'Scrivi il tuo testo e lo vedi premuto nella carta che scegli, con il prezzo che si aggiorna. Per inviare si tiene premuta la leva.',
  perche: 'Nella stampa a rilievo il valore si tocca: il sito lo fa vedere con la luce radente, come si controlla una prova al bancone.',
  mestieri: [
    'tipografia',
    'tipografo',
    'tipografa',
    'legatoria',
    'legatore',
    'stampa',
    'stamperia',
    'letterpress',
    'cartoleria',
    'partecipazioni',
    'biglietti da visita',
    'rilegatura',
    'grafica',
    'copisteria',
  ],
} as const;

/* ================================================================== comuni */

export const COMUNI = {
  marchio: 'IMPRONTA',
  marchioSotto: 'tipografia e legatoria',
  citta: 'Pordenone',
  /** L'unico richiamo al preventivo, identico ovunque. */
  provaLaTua: 'Prova la tua',
  /** Al posto del bottone quando si è già nel banco (testata desktop). */
  seiSulBanco: 'sei sul banco',
  tornaLab: '← Torna in Ciceri Lab',
  tornaLabBreve: '← Ciceri Lab',
  tornaLabAria: 'Torna in Ciceri Lab, la vetrina dei concept',
  nuovaScheda: 'si apre in una nuova scheda',
  ivaInclusa: 'IVA inclusa',
  indicativo: 'Indicativo',
} as const;

export const SALTI = {
  contenuto: 'Salta al contenuto',
  banco: 'Vai al banco di prova',
} as const;

/* ================================================================== testata */

export const TESTATA = {
  /** aria-label del <nav>. */
  navAria: 'Principale',
  marchioAria: 'IMPRONTA, torna all\'inizio',
  voci: [
    { id: 'lavori', etichetta: 'lavori', href: '#lavori' },
    { id: 'legatoria', etichetta: 'legatoria', href: '#legatoria' },
    { id: 'bottega', etichetta: 'bottega', href: '#bottega' },
  ],
  /** aria-label dei tre "Prova la tua" della testata/segnapagina/hero. */
  provaAria: 'Prova la tua: vai al banco di prova',
} as const;

/* ================================================================== segnapagina e indice (mobile) */

export const SEGNAPAGINA = {
  aria: 'Segnapagina',
  indice: 'indice',
  /** aria-label del bottone "indice · <sezione>". */
  apriAria: (sezione: SezioneId) => `Apri l'indice. Sei in: ${SEZIONI[sezione].indice}`,
} as const;

export const INDICE = {
  titolo: 'indice',
  chiudi: 'chiudi',
  chiudiAria: 'Chiudi l\'indice',
  seiQui: 'sei qui',
  cartaTitolo: 'la carta del sito',
  luceTelefono: 'Luce col telefono',
  luceSi: 'sì',
  luceNo: 'no',
} as const;

/* ================================================================== hero */

export const HERO = {
  /** La parola premuta a secco. Decorativa: ripete il marchio. */
  parola: 'impronta',
  /** Unico h1 del sito. 51 caratteri: 3 righe a 375 px, 2 a 1440. */
  titolo: 'Stampiamo cose che si leggono anche a occhi chiusi.',
  /** 19 parole, 116 caratteri: max 4 righe a 375 px. */
  sottotitolo:
    'Tipografia e legatoria a Pordenone. Premiamo le lettere nella carta e cuciamo i libri a mano, nella stanza accanto.',
  /** Dopo l'invio: sostituisce il sottotitolo. */
  dopoInvio: 'La tua prova è in stampa.',
  /** Il testo del cliente al posto di "impronta": due nomi uniti da "e". */
  parolaCliente: (primo: string, secondo?: string) =>
    secondo && secondo.trim() ? `${primo.trim()} e ${secondo.trim()}` : primo.trim(),
  /** Invito all'inclinazione (solo iOS, dopo il primo tocco, una volta). */
  tilt: {
    frase: 'Muovi la luce inclinando il telefono.',
    attiva: 'Attiva',
    lascia: 'Lascia stare',
  },
} as const;

/* ================================================================== luce (dial) */

/**
 * Dial della luce: input range 0-345°, passo 15°.
 * Convenzione (da allineare con interaction/light.ts): 0° = luce da destra,
 * 90° = dall'alto, 135° = da sinistra in alto (posizione di riposo), 180° = da
 * sinistra, 270° = dal basso. Il testo arrotonda all'ottavo più vicino.
 */
const DIREZIONI_LUCE = [
  'luce da destra',
  'luce da destra in alto',
  'luce dall\'alto',
  'luce da sinistra in alto',
  'luce da sinistra',
  'luce da sinistra in basso',
  'luce dal basso',
  'luce da destra in basso',
] as const;

export const LUCE = {
  aria: 'Direzione della luce',
  /** Visibile accanto al dial solo su desktop, nascosto su mobile. */
  etichetta: 'luce',
  valore: (gradi: number) => {
    const g = ((gradi % 360) + 360) % 360;
    return DIREZIONI_LUCE[Math.round(g / 45) % 8];
  },
} as const;

/* ================================================================== per chi: tre lavori sul bancone */

export const PER_CHI = {
  titolo: 'Tre lavori sul bancone',
  intro: 'Li facciamo ogni settimana. Cento pezzi sono una tiratura normale, non un favore.',
  pezzi: [
    {
      id: 'partecipazione',
      titolo: 'Partecipazione di nozze',
      perChi: 'per chi si sposa',
      righe: 'Cipria 350 g, 148×105 mm. Nomi a secco, data in inchiostro.',
      prezzo: '100 con busta, da 390 €',
      nomeBreve: 'partecipazione',
      provaAria: 'Prova la tua partecipazione',
      /** Con che cosa parte il banco dopo il clic. */
      preset: { prodotto: 'partecipazione', carta: 'cipria', tecnica: 'secco' },
      /** Testo premuto sul pezzo (shader o fallback CSS). */
      rilievo: ['Irene e Davide', 'si sposano', 'sabato 12 giugno 2027', 'Duomo di San Marco, Pordenone'],
      alt: 'Partecipazione su carta Cipria. I nomi Irene e Davide premuti a secco, sotto in inchiostro: si sposano sabato 12 giugno 2027, Duomo di San Marco, Pordenone.',
    },
    {
      id: 'biglietto',
      titolo: 'Biglietto da visita',
      perChi: 'per chi si presenta',
      righe: 'Cotone 600 g, 85×55 mm. Nome in lamina argento, retro a secco.',
      prezzo: '100 biglietti, da 160 €',
      nomeBreve: 'biglietto',
      provaAria: 'Prova il tuo biglietto',
      preset: { prodotto: 'biglietto', carta: 'cotone', tecnica: 'lamina' },
      rilievo: ['Chiara Zanin', 'Restauratrice'],
      alt: 'Biglietto da visita su carta Cotone. Il nome Chiara Zanin in lamina argento, sotto la parola Restauratrice.',
    },
    {
      id: 'libro',
      titolo: 'Copertina di un libretto',
      perChi: 'per chi pubblica',
      righe: 'Grafite 400 g, 150×210 mm. Titolo in inchiostro bianco, brossura cucita.',
      prezzo: '50 copie da 48 pagine, da 780 €',
      nomeBreve: 'copertina',
      provaAria: 'Prova il tuo libro',
      preset: { prodotto: 'libro', carta: 'grafite', tecnica: 'colore' },
      rilievo: ['Sul Noncello', 'Ada Gerometta', 'poesie'],
      alt: 'Copertina di libretto su carta Grafite. Il titolo Sul Noncello in inchiostro bianco, sotto Ada Gerometta, poesie.',
    },
  ],
  /** Controlli della fila su mobile. */
  fila: {
    aria: 'Tre lavori, uno per volta',
    precedente: 'Lavoro precedente',
    successivo: 'Lavoro successivo',
    inVista: (nome: string, n: number) => `${nome}, ${n} di 3`,
  },
} as const;

/* ================================================================== tecniche */

export const TECNICHE = {
  titolo: 'La stessa parola, quattro volte',
  /** Giro 2: vuota (micro-frase sotto il titolo, giuria). Se è vuota non si rende il <p>. */
  intro: '',
  /** Parola campione se l'utente non ha ancora scritto nulla. */
  parolaCampione: 'Pordenone',
  elencoAria: 'Le quattro tecniche',
  /** Segno visivo accanto alla tecnica in vista (aria-hidden). */
  segnoCorrente: '◂',
  /** Testo per lettori di schermo accanto alla tecnica in vista. */
  correnteSr: 'in vista',
  tornaAlBanco: 'Torna al banco',
  voci: [
    {
      id: 'secco',
      nome: 'a secco',
      breve: 'a secco',
      titolo: 'A secco',
      cosa: 'La lettera è solo premuta, senza inchiostro. Si legge con la luce.',
      suCosa: 'Rende su carte spesse e chiare, da 300 g in su. Sotto, il rilievo si vede dietro.',
      costo: 'È la base dei nostri prezzi: niente in più.',
    },
    {
      id: 'colore',
      nome: 'a un colore',
      breve: 'a un colore',
      titolo: 'A un colore',
      cosa: 'Il solco si riempie d\'inchiostro. Rilievo e colore, in un passaggio solo.',
      suCosa: 'Va bene su tutte e quattro le carte. È la più leggibile per date e indirizzi.',
      costo: '40 € in più per inchiostro e lavaggio, poi 0,20 € a pezzo.',
    },
    {
      id: 'lamina',
      nome: 'lamina a caldo',
      breve: 'lamina',
      titolo: 'Lamina a caldo',
      cosa: 'Una piastra calda posa sulla carta una pellicola d\'argento. Brilla quando giri il foglio.',
      suCosa: 'Sta bene su Cotone e su Grafite. Meglio sui nomi che sui testi lunghi.',
      costo: 'Il cliché in metallo costa 80 € invece di 60, poi 0,60 € a pezzo.',
    },
    {
      id: 'taglio',
      nome: 'taglio colorato',
      breve: 'taglio',
      titolo: 'Taglio colorato',
      cosa: 'Il bordo del biglietto dipinto a mano, pila per pila. Si vede di taglio.',
      suCosa: 'Dà il meglio sul Cotone 600 g. Sulle carte sottili resta una riga appena.',
      costo: '0,40 € a pezzo, minimo 40 €.',
    },
  ],
  /** Testo alternativo della parola resa nella tecnica (una per voce). */
  rilievoAlt: (parola: string, tecnica: 'secco' | 'colore' | 'lamina' | 'taglio', carta: Carta) => {
    const c = CARTE[carta].nome;
    switch (tecnica) {
      case 'secco':
        return `La parola ${parola} premuta a secco su carta ${c}, senza inchiostro.`;
      case 'colore':
        return `La parola ${parola} premuta su carta ${c}, con il solco pieno d'inchiostro.`;
      case 'lamina':
        return `La parola ${parola} in lamina argento su carta ${c}.`;
      case 'taglio':
        return `La parola ${parola} su carta ${c}, vista di tre quarti: il bordo del foglio è dipinto.`;
    }
  },
} as const;

/* ================================================================== la carta */

export const CARTA = {
  titolo: 'Tocca prima di scegliere',
  intro: 'La carta che scegli diventa la carta di tutto il sito.',
  /** Riga sotto le strisce. */
  campioni: 'Vengono da cartiere italiane. I campioni veri li tocchi al bancone.',
  gruppoAria: 'La carta del sito',
  scelta: '✓ la carta del sito',
  /** Testo per lettori di schermo della costa (spessore). */
  spessoreSr: (carta: Carta) => `spessore ${CARTE[carta].spessore}`,
} as const;

/* ================================================================== legatoria: il filo */

export const LEGATORIA = {
  titolo: 'Il filo',
  intro: 'Facciamo anche i libri. Li cuce a mano Franco, segnatura per segnatura.',
  /** Spiegazione di "segnatura" alla prima occorrenza. */
  segnatura: 'Una segnatura è un foglio stampato e piegato in 8 o 16 pagine: il mattone di ogni libro.',
  voci: [
    {
      id: 'brossura',
      titolo: 'Brossura cucita',
      testo: 'Le segnature si cuciono tra loro a filo refe, poi la copertina morbida si incolla sul dorso. Si apre bene e non perde pagine.',
      perCosa: 'Per poesie, cataloghi, fanzine che devono durare.',
      prezzo: 'da 6 € a copia, su 100 copie',
      /** Giro 2: testo accanto alla cifra grande, senza ripeterla. La cifra allora non va aria-hidden. */
      prezzoDopoCifra: 'a copia, solo la legatura',
      filoAlt: 'Il filo entra ed esce dalla piega di ogni segnatura e le lega una all\'altra lungo il dorso.',
    },
    {
      id: 'cartonato',
      titolo: 'Cartonato',
      testo: 'Copertina rigida in cartone rivestito, carta di guardia all\'interno e capitello in testa e in piede.',
      perCosa: 'Per tesi, libri di famiglia, cataloghi da tenere in vista.',
      prezzo: 'da 10 € a copia, su 100 copie',
      /** Giro 2: testo accanto alla cifra grande, senza ripeterla. La cifra allora non va aria-hidden. */
      prezzoDopoCifra: 'a copia, solo la legatura',
      filoAlt: 'Il filo cuce le segnature come nella brossura; sopra il dorso si chiude una copertina rigida con il capitello.',
    },
    {
      id: 'giapponese',
      titolo: 'Legatura giapponese',
      testo: 'Il filo passa attraverso il margine e resta a vista sul dorso. Fogli singoli, nessuna piega.',
      perCosa: 'Per quaderni d\'artista, portfolio, raccolte di stampe.',
      prezzo: 'da 8,50 € a copia, su 100 copie',
      /** Giro 2: testo accanto alla cifra grande, senza ripeterla. La cifra allora non va aria-hidden. */
      prezzoDopoCifra: 'a copia, solo la legatura',
      filoAlt: 'Il filo passa per quattro fori lungo il margine e gira attorno al dorso, visibile da fuori.',
    },
    {
      id: 'punto',
      titolo: 'Punto metallico',
      testo: 'Due punti di metallo sul dorso piegato. Veloce e pulito, fino a 48 pagine.',
      perCosa: 'Per programmi di sala, libretti di una mostra, menu.',
      prezzo: 'da 4,50 € a copia, su 100 copie',
      /** Giro 2: testo accanto alla cifra grande, senza ripeterla. La cifra allora non va aria-hidden. */
      prezzoDopoCifra: 'a copia, solo la legatura',
      filoAlt: 'Due punti metallici attraversano la piega centrale del libretto.',
    },
  ],
  /** Una riga sola sotto le quattro cifre: vale per tutte. */
  riferimento: 'Prezzi su 100 copie. Si parte da 30.',
  /** Righe dopo le quattro legature. */
  tiraturaMinima: 'Si parte da 30 copie. Sotto, ne parliamo al bancone.',
  tesi: 'Tesi di laurea cartonata, titolo in lamina: 55 € la prima copia, 38 € le altre. Fino a 200 pagine.',
  restauro: 'Libri di famiglia da sistemare: ricuciamo, rifacciamo dorso e guardie. Da 90 €, il prezzo giusto dopo averlo visto.',
  provaAria: 'Prova il tuo libro: vai al banco di prova con questa legatura',
} as const;

/* ================================================================== banco di prova */

/** Campo del testo per prodotto. `max` = limite prima che vada su due righe. */
type CampoTesto = {
  readonly chiave: string;
  readonly etichetta: string;
  readonly esempio: string;
  readonly max: number;
  readonly autocomplete: string;
};

export const CAMPI_TESTO = {
  biglietto: [
    { chiave: 'nome', etichetta: 'Nome e cognome', esempio: 'Chiara Zanin', max: 28, autocomplete: 'name' },
    { chiave: 'mestiere', etichetta: 'Mestiere', esempio: 'Restauratrice', max: 32, autocomplete: 'organization-title' },
  ],
  partecipazione: [
    { chiave: 'primo', etichetta: 'Primo nome', esempio: 'Irene', max: 18, autocomplete: 'off' },
    { chiave: 'secondo', etichetta: 'Secondo nome', esempio: 'Davide', max: 18, autocomplete: 'off' },
    { chiave: 'data', etichetta: 'Data', esempio: 'sabato 12 giugno 2027', max: 24, autocomplete: 'off' },
  ],
  intestata: [
    { chiave: 'nome', etichetta: 'Nome o studio', esempio: 'Studio Bortolin', max: 32, autocomplete: 'organization' },
    { chiave: 'indirizzo', etichetta: 'Indirizzo breve', esempio: 'Via Mazzini 7, Pordenone', max: 40, autocomplete: 'off' },
  ],
  libro: [
    { chiave: 'titolo', etichetta: 'Titolo', esempio: 'Sul Noncello', max: 36, autocomplete: 'off' },
    { chiave: 'autore', etichetta: 'Autore', esempio: 'Ada Gerometta', max: 28, autocomplete: 'off' },
  ],
} as const satisfies Record<Prodotto, readonly CampoTesto[]>;

export const BANCO = {
  titolo: 'Il banco di prova',
  /** Giro 2: vuota (micro-frase sotto il titolo, giuria). Se è vuota non si rende il <p>. */
  intro: '',

  /* ---------- bozza ritrovata (sopra il compositoio) */
  bozza: {
    frase: 'Abbiamo tenuto la tua prova dell\'ultima volta.',
    ricomincia: 'Ricomincia',
    ricominciaAria: 'Ricomincia: svuota il testo e le scelte del banco',
  },

  /* ---------- cosa stampi */
  cosaStampi: {
    legenda: 'Cosa stampi',
  },

  /* ---------- il tuo testo */
  tuoTesto: {
    legenda: 'Il tuo testo',
    /** Sotto la legenda finché i campi sono vuoti. */
    esempio: 'È un esempio. Scrivi il tuo e lo vedi premuto.',
    /** Sotto il campo quando si supera `max`. */
    lungo: (max: number) => `Oltre ${max} lettere lo componiamo su due righe.`,
    /** Contatore, compare solo negli ultimi 5 caratteri prima di `max`. */
    contatore: (usate: number, max: number) => `${usate} su ${max}`,
    contatoreAria: (usate: number, max: number) => `${usate} lettere su ${max} per stare su una riga`,
    /** Emoji o segni fuori dal font. */
    segnoMancante: 'Questo segno non c\'è nella nostra cassa di caratteri: nella prova lo lasciamo fuori.',
  },

  /* ---------- la carta */
  carta: {
    legenda: 'La carta',
    gruppoAria: 'La carta della prova e del sito',
    scelta: 'scelta',
    /** Solo per la carta intestata: la grammatura cambia. */
    notaIntestata: 'Per la carta intestata usiamo la stessa tinta in 120 g, così passa nella stampante.',
    /** Solo per il libro. */
    notaLibro: 'Sul libro la carta è quella della copertina. L\'interno è su carta da 120 g.',
  },

  /* ---------- la tecnica */
  tecnica: {
    legenda: 'La tecnica',
    cosE: 'cos\'è?',
    cosEAria: 'Cosa sono le tecniche: vai alla sezione',
    taglio: 'taglio colorato',
    taglioNota: 'il bordo dipinto, 0,40 € a pezzo',
    taglioNonDisponibile: 'Sulla carta intestata il taglio colorato non lo facciamo: i fogli devono passare in stampante.',
    notaLibro: 'Sul libro la tecnica vale per la copertina.',
  },

  /* ---------- la legatura (solo libro) */
  legatura: {
    legenda: 'La legatura',
    notaPunto: 'Il punto metallico tiene fino a 48 pagine.',
  },

  /* ---------- quante */
  quante: {
    legenda: 'Quante',
    /** Etichetta di ogni bottone per lettori di schermo, es. "250 biglietti". */
    aria: (n: number, prodotto: Prodotto) => `${numero(n)} ${PRODOTTI[prodotto].unita}`,
  },

  /* ---------- prova (lastra) */
  prova: {
    /** aria-label della figure. La figcaption è il riepilogo. */
    figureAria: 'La tua prova',
    alt: (p: { prodotto: Prodotto; carta: Carta; tecnica: Tecnica; righe: readonly string[]; taglio: boolean }) => {
      const testo = p.righe.filter((r) => r.trim()).join(', ');
      const taglio = p.taglio ? ', bordo dipinto' : '';
      return `Prova di ${PRODOTTI[p.prodotto].breve} su carta ${CARTE[p.carta].nome}: ${testo}, ${TECNICHE_NOMI[p.tecnica].nome}${taglio}.`;
    },
  },

  /* ---------- prezzo e riepilogo */
  prezzo: {
    totale: 'Totale indicativo',
    iva: 'IVA inclusa',
    /** Da cosa dipende, sempre visibile sotto il riepilogo. */
    dipende: 'L\'impianto si paga una volta, poi contano carta e pezzi: più pezzi, meno costa ciascuno.',
    ristampa: 'Teniamo la lastra due anni: la ristampa non paga l\'impianto.',
    /** Voci del riepilogo in parole, solo quelle diverse dalla base. */
    voci: {
      lastra: 'lastra e messa a punto 60 € compresi',
      colore: 'inchiostro e lavaggio 40 €',
      lamina: 'cliché per la lamina 80 € al posto della lastra',
      taglio: (aPezzo: string, minimo: string) => `taglio colorato ${aPezzo} a pezzo, minimo ${minimo}`,
      busta: 'busta in tinta compresa',
      buste: 'buste stampate comprese',
      cartaPiu: (carta: Carta, percento: number) => `carta ${CARTE[carta].nome} ${percento}% in più`,
      legatura: (legatura: Legatura) => `${LEGATURE_NOMI[legatura].breve}`,
    },
    /**
     * Riepilogo in parole (figcaption della prova, aria-live con debounce).
     * Esempio: "Biglietto da visita 85×55 mm, Cotone 600 g, lamina argento,
     * 250 biglietti. Cliché per la lamina 80 € al posto della lastra.
     * Indicativo 400 €, IVA inclusa. Pronti in 8-12 giorni lavorativi dalla
     * prova approvata."
     */
    riepilogo: (p: {
      prodotto: Prodotto;
      carta: Carta;
      grammatura: number;
      tecnica: Tecnica;
      tiratura: number;
      legatura?: Legatura;
      voci: readonly string[];
      totale: number;
      giorniDa: number;
      giorniA: number;
    }) => {
      const pr = PRODOTTI[p.prodotto];
      const legatura = p.prodotto === 'libro' && p.legatura ? `, ${LEGATURE_NOMI[p.legatura].nome.toLowerCase()}` : '';
      const voci = p.voci.length
        ? ` ${p.voci.join(', ').replace(/^./, (c) => c.toUpperCase())}.`
        : '';
      return (
        `${pr.nome} ${pr.formato}, ${CARTE[p.carta].nome} ${p.grammatura} g, ${TECNICHE_NOMI[p.tecnica].nome}${legatura}, ` +
        `${numero(p.tiratura)} ${pr.unita}.${voci} ` +
        `Indicativo ${euro(p.totale)}, IVA inclusa. ` +
        `Pronti in ${p.giorniDa}-${p.giorniA} giorni lavorativi dalla prova approvata.`
      );
    },
    /** Versione corta sotto la lastra su 375 px. */
    rigaMobile: (totale: number) => `Totale indicativo ${euro(totale)}`,
  },

  /* ---------- contatto */
  contatto: {
    etichetta: 'Dove ti scriviamo',
    aiuto: 'Email o telefono. Ti scriviamo solo per questo lavoro.',
    placeholder: 'nome@esempio.it',
    erroreSegno: '!',
    erroreSr: 'Errore:',
    nonValido: 'Scrivi un\'email (nome@esempio.it) o un numero di telefono.',
    vuoto: 'Ci serve un\'email o un telefono per mandarti la prova.',
  },

  /* ---------- quando ti serve */
  quando: {
    legenda: 'Quando ti serve',
    facoltativo: 'facoltativo',
    opzioni: {
      quindici: 'entro 15 giorni',
      mese: 'entro un mese',
      avanti: 'più avanti',
    } satisfies Record<Quando, string>,
    /** Se libro + entro 15 giorni. */
    notaLibroFretta: 'Un libro in 15 giorni è stretto. Scrivilo pure: ti diciamo subito se ce la facciamo.',
  },

  /* ---------- la leva */
  leva: {
    /** Promessa sopra l'istruzione. */
    promessa: 'Ti spediamo a casa una prova vera, gratis, sulla carta che hai scelto.',
    /** Istruzione sempre visibile sopra la leva, e nome accessibile del bottone. */
    istruzione: 'Tieni premuto per stampare',
    aria: 'Tieni premuto per stampare',
    /** Dopo un clic o Invio breve, per 6 secondi. */
    confermaDiNuovo: 'Premi di nuovo per confermare',
    /** Rilascio prima di ~900 ms. */
    presto: 'Hai lasciato presto: tieni premuto finché la pressa tocca il foglio. Oppure premi due volte.',
    /** Invio in corso: la pressa resta giù, nessuno spinner. */
    inCorso: 'La pressa è giù. Stiamo spedendo la richiesta.',
  },

  /* ---------- esito */
  successo: {
    /**
     * `giorno`: "domani", oppure "martedì" se si invia di sabato, domenica o
     * lunedì (la bottega risponde da martedì a sabato).
     */
    frase: (carta: Carta, giorno: string) =>
      `Ricevuto. ${giorno.charAt(0).toUpperCase()}${giorno.slice(1)} ti scriviamo il prezzo esatto e ti spediamo a casa questa prova, stampata davvero, sulla carta ${CARTE[carta].nome}.`,
    firma: 'Mandi, Marta',
    altra: 'Prova un\'altra cosa',
    altraAria: 'Prova un\'altra cosa: il banco si svuota, la carta resta',
  },
  fallito: {
    frase: 'Non siamo riusciti a spedire la richiesta. Controlla la connessione e tieni premuto di nuovo, oppure',
    telefono: 'chiama la bottega',
    telefonoHref: RECAPITI.telefonoHref,
    chiusura: '.',
    rassicura: 'Il testo e le scelte sono ancora qui.',
  },

  /**
   * Senza WebGL: il fallback CSS è completo, quindi nessun messaggio a vista.
   * Resta solo una riga per lettori di schermo nella figure, uguale in tutti e
   * due i casi, così chi non vede non riceve informazioni diverse.
   */
  senzaWebgl: {
    messaggio: null,
    sr: 'La prova è un\'anteprima: il rilievo vero lo senti sulla carta che ti spediamo.',
  },

  /** La striscia compressa con la tastiera aperta (375 px) non ha testo suo. */
} as const;

/* ================================================================== bottega */

export const BOTTEGA = {
  titolo: 'Portaci la bozza',
  intro: 'Anche scritta a mano su un foglio. La guardiamo insieme al bancone e la componiamo noi.',
  /** L'indirizzo è premuto e stampato: il rilievo è decorativo. */
  indirizzo: {
    riga1: RECAPITI.via,
    riga2: `${RECAPITI.cap} ${RECAPITI.citta}`,
  },
  orariTitolo: 'Orari',
  orari: [
    { giorni: 'lunedì', ore: 'chiuso, si stampa a porta chiusa' },
    { giorni: 'martedì-venerdì', ore: '9.00-12.30 e 15.00-19.00' },
    { giorni: 'sabato', ore: '9.30-12.30' },
  ],
  senzaAppuntamento: 'Per guardare e toccare le carte entra pure, senza appuntamento.',
  appuntamento: 'Per nozze e libri meglio fissare, anche il sabato pomeriggio: così abbiamo tempo.',
  /** Giro 2: nessun numero e nessun indirizzo email a vista, solo l'azione. */
  telefono: {
    testo: RECAPITI.telefonoEtichetta,
    /** Bottone pieno su 375 px. */
    bottone: RECAPITI.telefonoEtichetta,
    aria: 'Chiama la bottega (numero di esempio)',
    href: RECAPITI.telefonoHref,
  },
  email: {
    testo: RECAPITI.emailEtichetta,
    aria: 'Scrivi alla bottega (indirizzo di esempio)',
  },
  /** Sotto i due link, piccola. */
  recapitiNota: RECAPITI.nota,
  /** Stato dell'orario come riga di testo, non come titolo (giuria). */
  stato: {
    aperto: 'Adesso siamo aperti.',
    chiuso: 'Adesso siamo chiusi.',
  },
  maps: {
    testo: 'Apri in Maps ↗',
    /** Giro 3b: l'etichetta accessibile inizia con il testo visibile (WCAG 2.5.3). */
    aria: `Apri in Maps: ${RECAPITI.via}, ${RECAPITI.citta} (si apre in una nuova scheda)`,
    query: RECAPITI.mapsQuery,
  },
  parcheggio: 'Parcheggi in zona piazza XX Settembre, poi due minuti a piedi.',
  chi: 'Marta compone e stampa. Franco rilega, tre giorni a settimana. Elia taglia, piega e consegna in città.',
  storia: 'La legatoria c\'è dagli anni Settanta. La platina Heidelberg è arrivata a metà dei Novanta, da una tipografia di Sacile che chiudeva.',
  tempi: 'Pronti in 8-12 giorni lavorativi dalla prova approvata, i libri in 15-20.',
  spedizione: 'Spediamo in tutta Italia. A Pordenone consegna a mano.',
  noGrandi: 'Grandi tirature e stampa fotografica a quattro colori no: per quelle c\'è l\'offset, e ti diciamo a chi chiedere.',
} as const;

/* ================================================================== colophon */

export const COLOPHON = {
  titolo: 'colophon',
  /** La carta nel testo è quella attiva, aggiornata dal vivo. */
  testo: (carta: Carta) =>
    `Questo sito è composto in Anybody e Hanken Grotesk e stampato a secco su carta ${CARTE[carta].nome} ${CARTE[carta].grammatura}, nella tipografia IMPRONTA di Pordenone.`,
  secondaRiga: 'Le lettere qui le preme il tuo schermo. Quelle vere si premono al torchio.',
  indiceTitolo: 'indice',
  indiceAria: 'Indice del sito',
  indice: [
    { id: 'inizio', etichetta: 'la pressa', href: '#inizio' },
    { id: 'lavori', etichetta: 'tre lavori', href: '#lavori' },
    { id: 'tecniche', etichetta: 'le tecniche', href: '#tecniche' },
    { id: 'carta', etichetta: 'la carta', href: '#carta' },
    { id: 'legatoria', etichetta: 'il filo', href: '#legatoria' },
    { id: 'banco', etichetta: 'il banco di prova', href: '#banco' },
    { id: 'bottega', etichetta: 'la bottega', href: '#bottega' },
  ],
  /** Giro 2: niente numero né email a vista. */
  recapiti: `${RECAPITI.indirizzoRiga}. ${RECAPITI.nota}`,
  /** Etichette dei link del colophon (al posto di RECAPITI.telefono / RECAPITI.email). */
  telefono: RECAPITI.telefonoEtichetta,
  email: RECAPITI.emailEtichetta,
  ricomincia: {
    bottone: 'Ricomincia da capo',
    domanda: 'Svuotiamo la carta e la prova salvate in questo browser?',
    si: 'Sì, ricomincia',
    no: 'No, lascia così',
    /** Stringa fissa, vera con qualsiasi carta di partenza (compatibilità). */
    fatto: 'Fatto. Il banco è vuoto e la carta è tornata quella di partenza.',
    /** Con la carta a cui si è tornati (Citrino, o Grafite col modo scuro). */
    fattoCarta: (carta: Carta) => `Fatto. Il sito è tornato su ${CARTE[carta].nome} e il banco è vuoto.`,
  },
  finzione: 'IMPRONTA è una bottega inventata. Il civico, il telefono, l\'email, i nomi e i prezzi sono di esempio.',
  conceptDi: 'Un concept di Ciceri Lab',
} as const;

/* ================================================================== rilievi: testi alternativi */

/**
 * Ogni superficie premuta (canvas o fallback CSS) è aria-hidden. Qui c'è, per
 * ognuna, il testo che la sostituisce: o ripete un testo già leggibile nel DOM
 * (`decorativo: true`, non serve altro), o va messo in un elemento .imp-sr.
 * `vedi` indica dove sta il testo quando dipende dai dati.
 * Nessuna informazione vive solo nel rilievo.
 */
export const RILIEVI = {
  marchio: { decorativo: true, alt: 'IMPRONTA' },
  heroParola: {
    decorativo: true,
    alt: (carta: Carta) => `La parola impronta premuta a secco nella carta ${CARTE[carta].nome}.`,
  },
  heroParolaCliente: {
    decorativo: false,
    alt: (testo: string) => `${testo}, premuto a secco al posto della parola impronta.`,
  },
  perChi: {
    decorativo: false,
    vedi: 'PER_CHI.pezzi[].alt',
  },
  tecniche: {
    decorativo: false,
    vedi: 'TECNICHE.rilievoAlt(parola, tecnica, carta)',
  },
  carte: {
    decorativo: true,
    alt: 'Il nome della carta premuto a secco: lo stesso nome è scritto accanto.',
  },
  legatoria: {
    decorativo: false,
    /** Il filo SVG è aria-hidden: il testo va in un .imp-sr per ogni fermata. */
    vedi: 'LEGATORIA.voci[].filoAlt',
  },
  bancoProva: {
    decorativo: false,
    /** figcaption = riepilogo; in più BANCO.prova.alt in un .imp-sr. */
    vedi: 'BANCO.prova.alt(...)',
  },
  bancoPrezzo: {
    decorativo: true,
    alt: 'Il prezzo in lamina ripete il totale indicativo scritto sotto.',
  },
  bottegaIndirizzo: { decorativo: true, alt: `${RECAPITI.via}, ${RECAPITI.cap} ${RECAPITI.citta}` },
} as const;

/* ================================================================== annunci aria-live */

/**
 * Tutti i messaggi per la regione aria-live="polite" della pagina (una sola,
 * nello scaffold) o per quelle locali indicate. Mai annunciare a ogni lettera.
 */
export const ANNUNCI = {
  /** Cambio carta, da qualsiasi gruppo. */
  carta: (carta: Carta) =>
    `Carta ${CARTE[carta].nome} ${CARTE[carta].grammatura}. Tutto il sito ora è su ${CARTE[carta].nome}.`,
  /** Cambio prodotto nel banco. */
  prodotto: (prodotto: Prodotto) =>
    `Ora provi: ${PRODOTTI[prodotto].nome.toLowerCase()}, ${PRODOTTI[prodotto].formato}. Nella prova c'è un testo di esempio.`,
  /** Prezzo cambiato (debounce 800 ms): solo prezzo e voce cambiata. */
  prezzo: (totale: number, cambiato?: string) =>
    cambiato ? `${cambiato}. Indicativo ${euro(totale)}.` : `Indicativo ${euro(totale)}.`,
  /** Banco aperto da un "Prova la tua" con preset. */
  bancoImpostato: (prodotto: Prodotto, carta: Carta) =>
    `Banco di prova: ${PRODOTTI[prodotto].nome.toLowerCase()} su carta ${CARTE[carta].nome}.`,
  bozzaRitrovata: 'Abbiamo tenuto la tua prova dell\'ultima volta.',
  bozzaSvuotata: 'Banco svuotato. Nella prova c\'è di nuovo il testo di esempio.',
  confermaDiNuovo: 'Premi di nuovo entro 6 secondi per confermare.',
  presto: 'Hai lasciato presto. La richiesta non è partita.',
  inCorso: 'Stiamo spedendo la richiesta.',
  /** Successo e fallito: il focus va alla frase, l'annuncio la ripete. */
  successo: (carta: Carta, giorno: string) => BANCO.successo.frase(carta, giorno),
  fallito: 'Non siamo riusciti a spedire la richiesta. Il testo e le scelte sono ancora qui. Puoi riprovare o chiamare la bottega.',
  indiceAperto: 'Indice aperto.',
  indiceChiuso: 'Indice chiuso.',
  tecnica: (nome: string) => `Tecnica in vista: ${nome}.`,
  lavoroInVista: (nome: string, n: number) => `${nome}, ${n} di 3.`,
  ricominciato: COLOPHON.ricomincia.fatto,
  tiltAttivo: 'La luce ora segue l\'inclinazione del telefono.',
  tiltSpento: 'La luce non segue più il telefono.',
} as const;

/* ================================================================== esportazione unica */

export const TESTI = {
  meta: META,
  comuni: COMUNI,
  salti: SALTI,
  testata: TESTATA,
  segnapagina: SEGNAPAGINA,
  indice: INDICE,
  hero: HERO,
  luce: LUCE,
  perChi: PER_CHI,
  tecniche: TECNICHE,
  carta: CARTA,
  legatoria: LEGATORIA,
  banco: BANCO,
  campiTesto: CAMPI_TESTO,
  bottega: BOTTEGA,
  colophon: COLOPHON,
  rilievi: RILIEVI,
  annunci: ANNUNCI,
  carte: CARTE,
  prodotti: PRODOTTI,
  tecnicheNomi: TECNICHE_NOMI,
  legatureNomi: LEGATURE_NOMI,
  sezioni: SEZIONI,
  recapiti: RECAPITI,
  vetrina: VETRINA,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
