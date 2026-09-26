/**
 * SOTTOSCOCCA · tutti i testi visibili del sito (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter, non si inventa nel componente.
 * Nessun trattino lungo o medio, nessun punto esclamativo, nessun puntino di
 * sospensione (unica eccezione: il bottone "Invio..." voluto dal
 * creative-director), nessun occhiello numerato, al massimo un punto mediano
 * per riga. "Trova un buco" è l'unica etichetta dell'intento prenotazione,
 * "Metti in ponte" l'unico invio, "Aggiungi al lavoro" l'unica aggiunta.
 *
 * Le funzioni inseriscono valori già calcolati (minuti, orari, giorni) in
 * frasi già scritte: non calcolano buchi né prezzi. Nessun accesso al browser.
 */

import {
  BATTISTRADA,
  DEPOSITO,
  GOMMA_NUOVA_DA,
  LAVORI,
  RECAPITI_DATI,
  type IdLavoro,
  type IdPunto,
  type Occupato,
  type Ponte,
  type Quota,
} from './lavori';

/* ================================================================== aiuti di formato */

/** Euro all'italiana: "48 €", "1.090 €", "79,02 €". */
export function euro(valore: number): string {
  const intero = Math.floor(valore + 1e-9);
  const centesimi = Math.round((valore - intero) * 100);
  const interoTxt = String(intero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const testo = centesimi > 0 ? `${interoTxt},${String(centesimi).padStart(2, '0')}` : interoTxt;
  return `${testo} €`;
}

/** Forbice di prezzo di un lavoro: "da 110 € a 160 €" oppure "55 €". */
export function prezzoLavoro(id: IdLavoro): string {
  const { prezzoDa, prezzoA } = LAVORI[id];
  return prezzoA === null ? euro(prezzoDa) : `da ${euro(prezzoDa)} a ${euro(prezzoA)}`;
}

/** Durata scritta come in officina: "40'", "1 h", "1 h 30", "2 h 10". */
export function durata(minuti: number): string {
  if (minuti < 60) return `${minuti}'`;
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  return resto === 0 ? `${ore} h` : `${ore} h ${resto}`;
}

/** Durata da leggere ad alta voce: "40 minuti", "1 ora", "2 ore e 30". */
export function durataParlata(minuti: number): string {
  if (minuti < 60) return `${minuti} minuti`;
  const ore = Math.floor(minuti / 60);
  const resto = minuti % 60;
  const oreTxt = ore === 1 ? '1 ora' : `${ore} ore`;
  return resto === 0 ? oreTxt : `${oreTxt} e ${resto}`;
}

/** Minuti da mezzanotte → "9:10". */
export function ora(minuti: number): string {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** "9:10-11:40" (trattino semplice, mai lungo). */
export function intervallo(inizio: number, fine: number): string {
  return `${ora(inizio)}-${ora(fine)}`;
}

/** Iniziale maiuscola, per i giorni a inizio frase. */
export function maiuscola(testo: string): string {
  return testo.charAt(0).toLocaleUpperCase('it-IT') + testo.slice(1);
}

/** Indice come `Date.getDay()`: 0 domenica, 6 sabato. */
export const GIORNI_SETTIMANA = [
  'domenica',
  'lunedì',
  'martedì',
  'mercoledì',
  'giovedì',
  'venerdì',
  'sabato',
] as const;

export const GIORNI_BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'] as const;

/** Numero del giorno della settimana, come `Date.getDay()`. */
export type GiornoSettimana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** "martedì 7" (minuscolo, dentro una frase). */
export function giorno(settimana: GiornoSettimana, numero: number): string {
  return `${GIORNI_SETTIMANA[settimana]} ${numero}`;
}

/** "Martedì 7" (a inizio frase). */
export function Giorno(settimana: GiornoSettimana, numero: number): string {
  return maiuscola(giorno(settimana, numero));
}

/** "mar 7" (striscia dei giorni, mensola, tacca dell'asta). */
export function giornoBreve(settimana: GiornoSettimana, numero: number): string {
  return `${GIORNI_BREVI[settimana]} ${numero}`;
}

/** Un giorno già scomposto, come lo passa il planning. */
export interface GiornoTesto {
  settimana: GiornoSettimana;
  numero: number;
}

/* ================================================================== nomi condivisi */

/**
 * I lavori. `nome` nella scheda e nel parcheggio, `breve` per comporre
 * l'etichetta del blocco ("Tagliando + pastiglie"), `parlato` negli annunci.
 */
export const LAVORI_NOMI = {
  'gomme-stagionali': {
    nome: 'Cambio gomme con equilibratura',
    breve: 'cambio gomme',
    parlato: 'cambio gomme',
    nota: 'Estive o invernali, montate sui tuoi cerchi, con valvole nuove.',
  },
  'gomme-deposito': {
    nome: 'Cambio gomme già in deposito',
    breve: 'gomme dal deposito',
    parlato: 'cambio gomme dal deposito',
    nota: 'Il treno è già pronto sullo scaffale: si fa prima.',
  },
  convergenza: {
    nome: 'Convergenza',
    breve: 'convergenza',
    parlato: 'convergenza',
    nota: 'Controllo e regolazione sul banco prova.',
  },
  pastiglie: {
    nome: 'Pastiglie anteriori',
    breve: 'pastiglie',
    parlato: 'pastiglie anteriori',
    nota: 'Se i dischi sono ancora buoni.',
  },
  'pastiglie-dischi': {
    nome: 'Pastiglie e dischi anteriori',
    breve: 'pastiglie e dischi',
    parlato: 'pastiglie e dischi anteriori',
    nota: 'I dischi si cambiano in coppia, destro e sinistro.',
  },
  ammortizzatori: {
    nome: 'Coppia di ammortizzatori',
    breve: 'ammortizzatori',
    parlato: 'coppia di ammortizzatori',
    nota: 'Anteriori o posteriori, sempre in coppia.',
  },
  tagliando: {
    nome: 'Tagliando',
    breve: 'tagliando',
    parlato: 'tagliando',
    nota: 'Olio fino a 5 litri, filtro olio, aria e abitacolo, controllo dei livelli. Timbro sul libretto: la garanzia della casa resta valida.',
  },
  scarico: {
    nome: 'Silenziatore e controllo scarico',
    breve: 'scarico',
    parlato: 'silenziatore e controllo scarico',
    nota: 'Il controllo è gratis se l\'auto è già in ponte per altro. Il prezzo è quello del silenziatore.',
  },
} as const satisfies Record<IdLavoro, { nome: string; breve: string; parlato: string; nota: string }>;

/** "Tagliando + pastiglie" (ordine di aggiunta; vuoto se non c'è niente). */
export function nomeLavoro(ids: readonly IdLavoro[]): string {
  return maiuscola(ids.map((id) => LAVORI_NOMI[id].breve).join(' + '));
}

/** "tagliando e pastiglie" per i nomi accessibili e gli annunci. */
export function nomeLavoroParlato(ids: readonly IdLavoro[]): string {
  const nomi = ids.map((id) => LAVORI_NOMI[id].breve);
  if (nomi.length <= 1) return nomi.join('');
  return `${nomi.slice(0, -1).join(', ')} e ${nomi[nomi.length - 1]}`;
}

/**
 * Etichetta del blocco e di `selEtichettaLavoro` (CD 4.3):
 * "Tagliando + pastiglie · 2 h 30".
 */
export function etichettaLavoro(ids: readonly IdLavoro[], minuti: number): string {
  return `${nomeLavoro(ids)} · ${durata(minuti)}`;
}

/** I ponti: targhetta su due righe (un solo punto mediano per riga). */
export const PONTI_TESTI = {
  1: {
    nome: 'Ponte 1',
    targhetta: 'due colonne · 3500 kg',
    chi: 'quello di Loris',
    aria: 'Ponte 1, due colonne, portata 3500 chili',
  },
  2: {
    nome: 'Ponte 2',
    targhetta: 'due colonne · 4000 kg',
    chi: 'quello di Denis, porta anche i furgoni',
    aria: 'Ponte 2, due colonne, portata 4000 chili, anche furgoni',
  },
  3: {
    nome: 'Ponte 3',
    targhetta: 'forbice · 3000 kg',
    chi: 'quello di Samuele, solo gomme',
    aria: 'Ponte 3, a forbice, portata 3000 chili, solo gomme e convergenza',
  },
} as const satisfies Record<Ponte, { nome: string; targhetta: string; chi: string; aria: string }>;

/** "ponte 1 o 2", "ponte 3". */
export function pontiTesto(ponti: readonly Ponte[]): string {
  if (ponti.length === 0) return '';
  if (ponti.length === 1) return `ponte ${ponti[0]}`;
  return `ponte ${ponti.slice(0, -1).join(', ')} o ${ponti[ponti.length - 1]}`;
}

/** Tipi di lavoro nei blocchi occupati del planning (mai nomi o targhe). */
export const OCCUPATI_TESTI = {
  tagliando: 'tagliando',
  gomme: 'gomme',
  freni: 'freni',
  convergenza: 'convergenza',
  furgone: 'furgone',
  diagnosi: 'diagnosi',
} as const satisfies Record<Occupato, string>;

/* ================================================================== meta e vetrina */

export const META = {
  /** 56 caratteri. */
  title: 'SOTTOSCOCCA, officina e gommista | Concept di Ciceri Lab',
  /** 152 caratteri. */
  description:
    'Concept di Ciceri Lab: un\'officina e gommista inventata a Pordenone. Alzi l\'auto sul ponte, vedi prezzi e tempi, metti il tuo lavoro in un buco libero.',
  ogTitle: 'SOTTOSCOCCA, officina e gommista | Concept di Ciceri Lab',
  ogDescription:
    'Scorri e il ponte alza l\'auto. Tocchi un pezzo del sottoscocca e sai quanto costa e quanto dura. Un concept di Ciceri Lab, attività inventata.',
  ogImageAlt: 'Un\'auto verde su un ponte sollevatore a due colonne, vista da sotto.',
} as const;

/** Proposta per la voce di `CONCEPTS` in `src/content/site.ts` del sito. Decide Luca. */
export const VETRINA = {
  tag: 'Officina e gommista',
  title: 'SOTTOSCOCCA',
  subtitle: 'Officina e gommista · Pordenone',
  desc: 'Scorri e il ponte alza l\'auto: a ogni altezza si vede un pezzo, con prezzo e tempo sul ponte. Poi metti il tuo lavoro in un buco libero dei tre ponti.',
  perche: 'In officina la verità sta sotto la macchina: il sito ti ci porta, e la prenotazione è la lavagna dei ponti.',
  mestieri: ['officina', 'meccanico', 'gommista', 'autofficina', 'gomme', 'tagliando', 'freni'],
} as const;

/* ================================================================== comuni, salti, testata */

export const COMUNI = {
  marchio: 'SOTTOSCOCCA',
  marchioSotto: 'officina e gommista, Pordenone',
  /** Unica etichetta dell'intento prenotazione. */
  trovaUnBuco: 'Trova un buco',
  trovaUnBucoAria: 'Trova un buco: vai al planning dei tre ponti',
  /** Al posto del bottone, dentro il planning (niente link che porta dove sei). */
  seiSulPlanning: 'sei sul planning',
  aggiungi: 'Aggiungi al lavoro',
  aggiunto: 'Nel tuo lavoro, togli',
  chiudi: 'Chiudi',
  ivaInclusa: 'Prezzi indicativi, IVA inclusa.',
  sulPonte: 'sul ponte',
  daQuiSiVede: 'Da qui si vede:',
  centimetri: 'cm',
} as const;

export const SALTI = {
  contenuto: 'Salta al contenuto',
  planning: 'Trova un buco',
} as const;

export const TESTATA = {
  aria: 'SOTTOSCOCCA',
  marchioAria: 'SOTTOSCOCCA, torna al ponte a terra',
  navAria: 'Sezioni',
  voci: [
    { id: 'deposito', etichetta: 'Deposito', href: '#deposito' },
    { id: 'officina', etichetta: 'Officina', href: '#officina' },
  ],
} as const;

/* ================================================================== asta graduata e quote */

/** Le quattro quote: numeri, nomi accessibili dei link, annunci di plateau. */
export const QUOTE = {
  0: {
    cifra: '0 cm',
    numero: '0',
    nome: 'a terra',
    linkAria: 'Ponte a 0 centimetri: l\'auto a terra',
    annuncio: 'Ponte a 0 centimetri: l\'auto è a terra.',
    gruppoPuntiAria: 'Pezzi a terra',
  },
  20: {
    cifra: '20 cm',
    numero: '20',
    nome: 'gomme',
    linkAria: 'Ponte a 20 centimetri: gomme',
    annuncio: 'Ponte a 20 centimetri: gomme.',
    gruppoPuntiAria: 'Pezzi a 20 centimetri',
  },
  80: {
    cifra: '80 cm',
    numero: '80',
    nome: 'freni e sospensioni',
    linkAria: 'Ponte a 80 centimetri: freni e sospensioni',
    annuncio: 'Ponte a 80 centimetri: freni e sospensioni.',
    gruppoPuntiAria: 'Pezzi a 80 centimetri',
  },
  180: {
    cifra: '180 cm',
    numero: '180',
    nome: 'il sottoscocca',
    linkAria: 'Ponte a 180 centimetri: il sottoscocca',
    annuncio: 'Ponte a 180 centimetri: il sottoscocca, tutti i pezzi.',
    gruppoPuntiAria: 'Pezzi del sottoscocca, a 180 centimetri',
  },
} as const satisfies Record<
  Quota,
  { cifra: string; numero: string; nome: string; linkAria: string; annuncio: string; gruppoPuntiAria: string }
>;

export const ASTA = {
  navAria: 'Quota del ponte',
  /** Numero accanto all'indice (aria-hidden), arrotondato ai 5 cm. */
  indice: (cm: number): string => `${cm} cm`,
  /** Numeri ogni 50 cm sulla scala. */
  scala: ['0', '50', '100', '150', '200'],
  /** Tacca dopo una prenotazione riuscita (ux §2.3). */
  tuoPonte: (g: GiornoTesto, inizio: number): string => `il tuo ponte: ${giornoBreve(g.settimana, g.numero)}, ${ora(inizio)}`,
  tuoPonteAria: (g: GiornoTesto, inizio: number, ponte: Ponte): string =>
    `Il tuo lavoro: ${giorno(g.settimana, g.numero)} alle ${ora(inizio)} sul ponte ${ponte}. Vai al planning`,
  /** Modalità "bassa" (altezza sotto 520 px): indicatore unico. */
  compattoAria: (cm: number): string => `Ponte a ${cm} centimetri`,
} as const;

/* ================================================================== apertura · 0 cm */

export const APERTURA = {
  /** h1 visibile. */
  titolo: 'SOTTOSCOCCA',
  /** Nome accessibile completo dell'h1. */
  titoloAria: 'SOTTOSCOCCA, officina e gommista a Pordenone',
  sottotitolo: 'officina e gommista, Pordenone',
  /** Messaggio chiave, una volta sola in tutto il sito. */
  frase: 'Te la alziamo davanti e ti facciamo vedere cosa c\'è sotto.',
  /** Una riga facoltativa accanto al bottone (trend P4): un prezzo vero subito. */
  prezzoIngresso: 'Cambio gomme da 48 €, 40 minuti sul ponte.',
  /** Il poster a 0 cm è decorativo: il canvas è aria-hidden e il testo dice tutto. */
  posterAlt: '',
} as const;

/* ================================================================== gomme · 20 cm */

export const GOMME = {
  cifra: '20 cm',
  titolo: 'Gomme',
  titoloSr: ', a 20 centimetri da terra',
  testo:
    'Le ruote si staccano da terra e girano libere: così si vede il battistrada su tutto il giro. Le invernali servono dal 15 novembre al 15 aprile, e si montano già da metà ottobre.',
  battistrada: `Il minimo di legge è ${String(BATTISTRADA.legge).replace('.', ',')} mm. Noi diciamo di cambiarle a ${BATTISTRADA.consigliato} mm, le invernali a ${BATTISTRADA.invernali}. Se ne restano di più, fanno un'altra stagione e te lo diciamo.`,
  tabella: {
    caption: 'Montaggio ed equilibratura di quattro gomme, per misura. IVA inclusa.',
    colonne: { misura: 'Misura', montaggio: 'Montaggio ed equilibratura', tempo: 'Sul ponte' },
    /** Variante a elenco sotto 360 px: "205/55 R16: 56 €, 40 minuti". */
    riga: (misura: string, montaggio: number, minuti: number): string =>
      `${misura}: ${euro(montaggio)}, ${durataParlata(minuti)}`,
    misuraAria: (misura: string): string => misura.replace('/', ' su ').replace(' R', ', cerchio da '),
  },
  gommeNuove: `Gomme nuove da ${euro(GOMMA_NUOVA_DA)} l'una per una 195/65 R15. Lo smaltimento delle vecchie è compreso.`,
  convergenza: `Convergenza: ${euro(LAVORI.convergenza.prezzoDa)}, ${durataParlata(LAVORI.convergenza.minuti)} sul ponte 3.`,
  deposito: {
    testo: 'Le gomme della stagione ferma possono restare da noi.',
    link: 'Come funziona il deposito',
    href: '#deposito',
  },
} as const;

/* ================================================================== freni e sospensioni · 80 cm */

export const FRENI = {
  cifra: '80 cm',
  titolo: 'Freni e sospensioni',
  titoloSr: ', a 80 centimetri da terra',
  testo:
    'La ruota è all\'altezza degli occhi. Dietro il cerchio ci sono il disco e la pinza, sopra la molla e l\'ammortizzatore.',
  freni: {
    titolo: 'Freni',
    segnali: 'Fischia quando freni, il pedale va giù più di prima, il volante vibra in frenata.',
    ogniQuanto: 'Pastiglie da 30.000 a 40.000 km, dischi ogni due cambi di pastiglie, liquido ogni due anni.',
    prezzo: `Pastiglie anteriori ${prezzoLavoro('pastiglie')}, ${durata(LAVORI.pastiglie.minuti)} sul ponte. Con i dischi ${prezzoLavoro('pastiglie-dischi')}, ${durata(LAVORI['pastiglie-dischi'].minuti)}.`,
  },
  sospensioni: {
    titolo: 'Sospensioni',
    segnali: 'L\'auto ondeggia dopo un dosso, senti un colpo a ogni buca, in curva sembra appoggiarsi.',
    ogniQuanto: 'Gli ammortizzatori li guardiamo a ogni tagliando. Di solito durano da 80.000 a 100.000 km.',
    prezzo: `Coppia di ammortizzatori ${prezzoLavoro('ammortizzatori')}, ${durata(LAVORI.ammortizzatori.minuti)} sul ponte.`,
  },
  coppia:
    'Dischi e ammortizzatori si cambiano in coppia, destro e sinistro insieme, perché l\'auto frena e tiene la strada uguale dai due lati. Per questo il prezzo è per due.',
} as const;

/* ================================================================== il sottoscocca · 180 cm */

export const SOTTOSCOCCA = {
  cifra: '180 cm',
  titolo: 'Il sottoscocca',
  titoloSr: ', a 180 centimetri da terra',
  testo: 'Qui sotto c\'è quasi tutto quello che paghi. Tocca un pezzo.',
  promessa: 'Se sotto troviamo altro, ti chiamiamo prima e decidi tu. Il pezzo cambiato te lo facciamo vedere, o te lo lasciamo in una busta.',
  /** Striscia nello stadio fisso a 375 px. */
  striscia: 'Il sottoscocca',
  strisciaInvito: 'tocca un pezzo',
  /** Accanto a ogni bottone dell'elenco "Da qui si vede" (ux §5.4): "1 h". */
  tempoElenco: (minuti: number): string => durata(minuti),
} as const;

/* ================================================================== punti e schede */

/**
 * Per ogni punto: nome (etichetta accanto al cerchio e titolo della scheda),
 * aria del bottone, cosa si guarda, segnali in parole normali, nota.
 * I lavori della scheda vengono da `PUNTI[id].lavori` con i nomi di `LAVORI_NOMI`.
 */
export const PUNTI_TESTI = {
  'ruota-anteriore': {
    nome: 'Gomme',
    aria: 'Gomme: apri prezzi e tempi',
    cosa: 'Battistrada, data sul fianco, pressione, tagli e bolle.',
    segnali: [
      'il battistrada è sotto i 3 mm',
      'sul fianco c\'è una bolla o un taglio',
      'la spia della pressione si accende spesso',
    ],
    nota: 'Con l\'auto in ponte per le gomme, un\'occhiata a freni e scarico è compresa.',
  },
  freni: {
    nome: 'Freni',
    aria: 'Freni: apri prezzi e tempi',
    cosa: 'Pastiglie, dischi, pinze, tubi e liquido.',
    segnali: [
      'fischia quando freni',
      'il volante o il pedale vibrano in frenata',
      'il pedale va giù più di prima',
    ],
    nota: 'Se fischia sono quasi sempre le pastiglie. Se vibra, anche i dischi.',
  },
  sospensioni: {
    nome: 'Sospensioni',
    aria: 'Sospensioni: apri prezzi e tempi',
    cosa: 'Ammortizzatori, molle, testine e braccetti.',
    segnali: [
      'l\'auto ondeggia dopo un dosso',
      'senti un colpo sulle buche',
      'le gomme si consumano a macchie',
    ],
    nota: 'Una molla rotta di solito è l\'ultima spira: si vede solo da qui sotto.',
  },
  olio: {
    nome: 'Olio e filtri',
    aria: 'Olio e filtri: apri prezzi e tempi',
    cosa: 'Coppa dell\'olio, tappo di scarico, filtro olio, perdite.',
    segnali: [
      'sono passati un anno o i chilometri del piano della casa',
      'la spia dell\'olio si è accesa',
      'sotto l\'auto parcheggiata c\'è una macchia',
    ],
    nota: 'Usiamo l\'olio che chiede il libretto, non quello che avanza in magazzino.',
  },
  scarico: {
    nome: 'Scarico',
    aria: 'Scarico: apri prezzi e tempi',
    cosa: 'Catalizzatore, silenziatore, tubi e supporti in gomma.',
    segnali: [
      'il rumore è più forte di prima',
      'senti un tintinnio da sotto quando parti',
      'odore di gas di scarico in abitacolo',
    ],
    nota: 'Il controllo è gratis se l\'auto è già in ponte per un altro lavoro.',
  },
  'ruota-posteriore': {
    nome: 'Convergenza',
    aria: 'Convergenza: apri prezzi e tempi',
    cosa: 'Gli angoli delle ruote, misurati sul banco prova e riportati ai valori della casa.',
    segnali: [
      'l\'auto tira da un lato',
      'il volante è storto quando vai dritto',
      'le gomme sono consumate su un bordo solo',
    ],
    nota: 'Conviene farla con le gomme nuove, così durano di più.',
  },
} as const satisfies Record<
  IdPunto,
  { nome: string; aria: string; cosa: string; segnali: readonly string[]; nota: string }
>;

export const SCHEDA = {
  chiudi: 'Chiudi',
  chiudiAria: (nome: string): string => `Chiudi la scheda ${nome}`,
  cosaTitolo: 'Cosa guardiamo',
  segnaliTitolo: 'Te ne accorgi se',
  /** Riga del lavoro: prezzo e tempo sono i due numeri grandi. */
  prezzo: (id: IdLavoro): string => prezzoLavoro(id),
  tempo: (id: IdLavoro): string => `${durata(LAVORI[id].minuti)} sul ponte`,
  tempoAria: (id: IdLavoro): string => `${durataParlata(LAVORI[id].minuti)} sul ponte`,
  ponte: (ponti: readonly Ponte[]): string => `Sul ${pontiTesto(ponti)}`,
  aggiungi: 'Aggiungi al lavoro',
  aggiunto: 'Nel tuo lavoro, togli',
  aggiungiAria: (id: IdLavoro): string => `Aggiungi al lavoro: ${LAVORI_NOMI[id].parlato}`,
  aggiuntoAria: (id: IdLavoro): string => `${maiuscola(LAVORI_NOMI[id].parlato)} è nel tuo lavoro. Premi per toglierlo`,
  ivaInclusa: 'Prezzi indicativi per un\'utilitaria o una compatta, ricambi compresi, IVA inclusa.',
} as const;

/* ================================================================== barra "Il tuo lavoro" */

export const BARRA = {
  regioneAria: 'Il tuo lavoro',
  titolo: 'Il tuo lavoro',
  /** Desktop: "Tagliando + pastiglie: 2 h 30 sul ponte". */
  riepilogo: (ids: readonly IdLavoro[], minuti: number): string => `${nomeLavoro(ids)}: ${durata(minuti)} sul ponte`,
  /** Mobile: "2 lavori · 2 h 30". */
  riepilogoBreve: (n: number, minuti: number): string => `${n === 1 ? '1 lavoro' : `${n} lavori`} · ${durata(minuti)}`,
  riepilogoAria: (ids: readonly IdLavoro[], minuti: number): string =>
    `Il tuo lavoro: ${nomeLavoroParlato(ids)}, ${durataParlata(minuti)} sul ponte`,
  modifica: 'Modifica',
  modificaAria: 'Modifica il tuo lavoro',
  elencoAria: 'Lavori scelti',
  togli: 'Togli',
  togliAria: (id: IdLavoro): string => `Togli ${LAVORI_NOMI[id].parlato}`,
  trovaUnBuco: 'Trova un buco',
} as const;

/* ================================================================== deposito gomme */

export const DEPOSITO_TESTI = {
  titolo: 'Deposito gomme',
  frase: 'Le gomme della stagione ferma le teniamo noi.',
  come: [
    'Le laviamo, controlliamo battistrada e pressione, e le mettiamo sullo scaffale al coperto, in piedi o impilate come vuole il cerchio.',
    'Ogni treno ha un cartellino con una D e tre cifre, legato alla tua targa.',
    'Le ritiri quando vuoi, negli orari di apertura.',
  ],
  prezzi: [
    { voce: 'Una stagione, circa sei mesi', prezzo: euro(DEPOSITO.stagione) },
    { voce: 'Un anno, i due treni a turno', prezzo: euro(DEPOSITO.anno) },
  ],
  prezziCaption: 'Deposito di quattro gomme, IVA inclusa.',
  cartellino: {
    codice: DEPOSITO.esempio,
    riga: 'legato alla tua targa',
    aria: `Esempio di cartellino: ${DEPOSITO.esempio.replace('-', ' ')}, legato alla tua targa`,
  },
  conviene: 'Se sono già da noi il cambio dura 30 minuti invece di 40, e non le carichi in macchina.',
  aggiungi: 'Aggiungi il cambio gomme',
  aggiunto: 'Cambio gomme nel tuo lavoro, togli',
  aggiungiAria: 'Aggiungi al lavoro il cambio gomme',
  /** Foto stock: l'alt descrive quello che si vede, non dice "il nostro deposito". */
  fotoAlt: 'Scaffali di gomme in un deposito, i treni impilati uno sopra l\'altro.',
} as const;

/* ================================================================== il ponte libero · planning */

export const PONTE_LIBERO = {
  titolo: 'Il ponte libero',
  intro: 'Questa è la giornata dell\'officina, come la vede Erika. Metti il tuo lavoro in un buco libero: la lunghezza è il tempo vero.',

  /* --- striscia dei giorni --- */
  giorni: {
    aria: 'Giorno',
    oggi: 'oggi',
    pieno: 'pieno',
    soloGomme: 'solo gomme',
    /** Nome completo del radio: "Venerdì 10, pieno", "Sabato 11, solo gomme, mattina". */
    radioAria: (g: GiornoTesto, stato: 'libero' | 'pieno' | 'oggi'): string => {
      const base = Giorno(g.settimana, g.numero);
      const sabato = g.settimana === 6 ? ', solo gomme, mattina' : '';
      if (stato === 'pieno') return `${base}${sabato}, pieno`;
      if (stato === 'oggi') return `${base}, oggi${sabato}`;
      return `${base}${sabato}`;
    },
    scorriAria: 'Altri giorni',
  },

  /* --- asse delle ore e corsie --- */
  asseAria: 'Ore della giornata',
  chiuso: 'chiuso',
  chiusoSabato: 'chiuso il sabato',
  passato: 'passato',
  mattina: 'Mattina',
  pomeriggio: 'Pomeriggio',
  mezzaGiornataAria: 'Parte della giornata',
  corsiaAria: (ponte: Ponte): string => PONTI_TESTI[ponte].aria,
  intervalloOccupato: (inizio: number, fine: number, lavoro: Occupato): string =>
    `${intervallo(inizio, fine)}, ${OCCUPATI_TESTI[lavoro]}, occupato`,
  intervalloPassato: (inizio: number, fine: number): string => `${intervallo(inizio, fine)}, passato`,
  /** Buco libero visibile: "libero" sopra, orario e durata sotto. */
  buco: 'libero',
  bucoDurata: (inizio: number, fine: number): string => `${intervallo(inizio, fine)}, ${durata(fine - inizio)}`,
  bucoAria: (ponte: Ponte, inizio: number, fine: number): string =>
    `Ponte ${ponte}, ${intervallo(inizio, fine)}, libero. Metti qui il tuo lavoro`,
  bucoCortoAria: (inizio: number, fine: number): string =>
    `${intervallo(inizio, fine)}, libero, troppo corto per il tuo lavoro`,
  /** Durante il trascinamento, in corsia non adatta. */
  corsiaNonAdatta: {
    soloGomme: 'Il ponte 3 fa solo gomme.',
    gommeSulTre: 'Le gomme le facciamo sul ponte 3.',
    sabato: 'Il sabato questo ponte è chiuso.',
  },
  /** Sotto l'ombra di aggancio mentre trascini. */
  ciSta: 'ci sta',
  nonCiSta: (liberi: number): string => `non ci sta: ${durataParlata(liberi)} liberi`,

  /* --- parcheggio e blocco --- */
  parcheggio: {
    titolo: 'Cosa facciamo?',
    aria: 'Il tuo lavoro, da comporre',
    lavoroBottone: (id: IdLavoro): string => `${LAVORI_NOMI[id].nome}, ${durata(LAVORI[id].minuti)}`,
    lavoroAria: (id: IdLavoro): string =>
      `${LAVORI_NOMI[id].nome}, ${durataParlata(LAVORI[id].minuti)} sul ponte, ${prezzoLavoro(id)}`,
    primoBuco: 'Primo buco libero',
    primoBucoAria: 'Metti il tuo lavoro nel primo buco libero',
    vuoto: 'Scegli uno o più lavori: il blocco prende la loro lunghezza.',
  },
  blocco: {
    /** Scritta fissa nel blocco: il bianco non basta, serve la parola. */
    etichetta: 'il tuo lavoro',
    lavoro: (ids: readonly IdLavoro[], minuti: number): string => etichettaLavoro(ids, minuti),
    orario: (inizio: number, fine: number): string => `il tuo lavoro · ${intervallo(inizio, fine)}`,
    aria: (ids: readonly IdLavoro[], minuti: number): string =>
      `Il tuo lavoro: ${nomeLavoroParlato(ids)}, ${durataParlata(minuti)}`,
    cartellino: (numero: string): string => `deposito ${numero}`,
    giornataIntera: 'giornata intera',
  },
  prima: '10\' prima',
  dopo: '10\' dopo',
  primaAria: 'Sposta il tuo lavoro 10 minuti prima',
  dopoAria: 'Sposta il tuo lavoro 10 minuti dopo',
  /** Mensola mobile: "mar 7, ponte 2, 9:10-10:40". */
  mensola: (g: GiornoTesto, ponte: Ponte, inizio: number, fine: number): string =>
    `${giornoBreve(g.settimana, g.numero)}, ponte ${ponte}, ${intervallo(inizio, fine)}`,
  mensolaAria: 'Posizione del tuo lavoro',

  /* --- istruzioni da tastiera (visibili, collegate con aria-describedby) --- */
  istruzioni: {
    orizzontale:
      'Con la tastiera: frecce sinistra e destra spostano di 10 minuti, su e giù cambiano ponte, Pagina su e Pagina giù cambiano giorno, Invio conferma, Esc lo riporta al parcheggio.',
    verticale:
      'Con la tastiera: frecce su e giù spostano di 10 minuti, sinistra e destra cambiano ponte, Pagina su e Pagina giù cambiano giorno, Invio conferma, Esc lo riporta al parcheggio.',
    parcheggio: 'Con la tastiera: Invio mette il tuo lavoro nel primo buco libero.',
  },

  /* --- elenco dei buchi compatibili (alternativa senza gesti) --- */
  buchi: {
    titolo: (g: GiornoTesto): string => `Buchi adatti di ${giorno(g.settimana, g.numero)}`,
    bottone: (ponte: Ponte, inizio: number, fine: number): string => `Ponte ${ponte}, ${intervallo(inizio, fine)}`,
    bottoneAria: (ponte: Ponte, inizio: number, fine: number): string =>
      `Metti il tuo lavoro sul ponte ${ponte} dalle ${ora(inizio)}, libero fino alle ${ora(fine)}`,
    nessuno: (g: GiornoTesto, minuti: number): string =>
      `${Giorno(g.settimana, g.numero)} non ha buchi da ${durata(minuti)}. Prova Primo buco libero: cerca anche nei giorni dopo.`,
    senzaLavoro: 'Scegli prima cosa facciamo: i buchi adatti dipendono dalla lunghezza del lavoro.',
  },

  /* --- stati P0-P14 (ux §6.1) --- */
  stati: {
    /** P0: prima del montaggio (prerender). */
    caricamento: 'Il planning si carica.',
    caricamentoAltro: 'Oppure',
    chiama: 'Chiama',
    chiamaAria: 'Chiama l\'officina (numero di esempio)',

    /** P2: composto, non piazzato. */
    composto: (minuti: number, ponti: readonly Ponte[], nBuchi: number, g: GiornoTesto): string =>
      `Il tuo lavoro: ${durataParlata(minuti)} sul ${pontiTesto(ponti)}. ${
        nBuchi === 0 ? 'Nessun buco adatto' : nBuchi === 1 ? '1 buco adatto' : `${nBuchi} buchi adatti`
      } ${giorno(g.settimana, g.numero)}.`,

    /** P4: piazzato. */
    piazzato: (ponte: Ponte, g: GiornoTesto, inizio: number, fine: number): string =>
      `Ponte ${ponte}, ${giorno(g.settimana, g.numero)}, dalle ${ora(inizio)} alle ${ora(fine)}. Libero.`,
    /** Spostamento da tastiera o con 10' prima/dopo. */
    spostato: (ponte: Ponte, inizio: number, fine: number, libero: boolean): string =>
      libero
        ? `Ponte ${ponte}, dalle ${ora(inizio)} alle ${ora(fine)}, libero.`
        : `Ponte ${ponte}, dalle ${ora(inizio)}: non ci sta.`,
    spostatoOccupato: (ponte: Ponte, occupatoDalle: number): string =>
      `Ponte ${ponte}, occupato dalle ${ora(occupatoDalle)}: non ci sta.`,
    ponteSaltato: (ponte: Ponte): string => `Il ponte ${ponte} non fa questo lavoro: saltato.`,

    /** P5: non ci sta. `alternativa` = primo buco adatto dopo quello scelto, se c'è. */
    nonCiSta: (liberi: number, chiesti: number, alternativa: { ponte: Ponte; inizio: number } | null): string =>
      `Qui ci sono ${durataParlata(liberi)}, il tuo lavoro ne chiede ${durataParlata(chiesti)}.${
        alternativa ? ` Il ponte ${alternativa.ponte} è libero dalle ${ora(alternativa.inizio)}.` : ''
      }`,
    mettiloAlle: (inizio: number): string => `Mettilo alle ${ora(inizio)}`,
    mettiloAlleAria: (ponte: Ponte, inizio: number): string => `Metti il tuo lavoro sul ponte ${ponte} alle ${ora(inizio)}`,

    /** P6: ponte sbagliato. */
    ponteSbagliatoGomme: 'Le gomme le facciamo sul ponte 3.',
    ponteSbagliatoMisto: 'Le gomme le facciamo sul ponte 3. Con la meccanica insieme, la mettiamo sul ponte 1 o 2.',
    ponteSbagliatoMeccanica: 'Il ponte 3 fa solo gomme.',

    /** P7: fuori orario. `fine` è l'orario che il lavoro sforerebbe. */
    fuoriOrarioPranzo: (partenza: number, fine: number): string =>
      `A pranzo il ponte si ferma: il tuo lavoro finisce alle ${ora(fine)} se parti alle ${ora(partenza)}.`,
    fuoriOrarioSera: (partenza: number, fine: number): string =>
      `La sera chiudiamo: il tuo lavoro finisce alle ${ora(fine)} se parti alle ${ora(partenza)}.`,

    /** P8: giorno pieno. */
    giornoPieno: (g: GiornoTesto, alt: GiornoTesto, ponte: Ponte, inizio: number): string =>
      `${Giorno(g.settimana, g.numero)} è pieno. ${Giorno(alt.settimana, alt.numero)} il ponte ${ponte} è libero dalle ${ora(inizio)}.`,
    vaiA: (g: GiornoTesto): string => `Vai a ${giorno(g.settimana, g.numero)}`,

    /** P9: sabato con meccanica. `lavoro` = nome breve del primo lavoro di meccanica. */
    sabatoMeccanica: (lavoro: IdLavoro, alt: GiornoTesto, inizio: number): string =>
      `Il sabato facciamo solo gomme. Per ${articolo(lavoro)} il primo buco è ${giorno(alt.settimana, alt.numero)} alle ${ora(inizio)}.`,

    /** P10: troppo lungo per mezza giornata. */
    troppoLungo: 'Più di 4 h 30 non sta in mezza giornata.',
    troppoLungoAria: 'Il tuo lavoro è più lungo di 4 ore e 30: non sta in mezza giornata.',
    togliUnLavoro: 'Togli un lavoro',
    giornataIntera: 'Lascia l\'auto per la giornata',
    giornataInteraSpiega: 'La porti alle 8:00, la ritiri in serata. Va su un ponte 1 o 2 libero tutta la mattina.',
    giornataInteraNessuna: 'Questo giorno non ha un ponte 1 o 2 libero tutta la mattina. Prova un altro giorno.',

    /** P11: nessun buco nei sei giorni. */
    nessunBuco: (minuti: number): string =>
      `In questi sei giorni non c'è un buco da ${durataParlata(minuti)}. Lasciaci il numero: ti chiamiamo noi con una data.`,

    /** P12: lavoro cambiato con il blocco già piazzato. */
    allungato: (minuti: number): string => `Il tuo lavoro ora dura ${durataParlata(minuti)}: ci sta ancora.`,
    accorciato: (minuti: number): string => `Il tuo lavoro ora dura ${durataParlata(minuti)}.`,
    oraServe: (ponti: readonly Ponte[]): string => `Ora serve il ${pontiTesto(ponti)}.`,

    /** Primo buco libero trovato in un altro giorno (ux §6.4). */
    primoBucoAltroGiorno: (g: GiornoTesto, minuti: number, alt: GiornoTesto, ponte: Ponte, inizio: number): string =>
      `${Giorno(g.settimana, g.numero)} non ha un buco da ${durataParlata(minuti)}: il primo è ${giorno(alt.settimana, alt.numero)} alle ${ora(inizio)}, sul ponte ${ponte}.`,

    /** P13: cambio giorno. */
    cambioGiorno: (g: GiornoTesto, nBuchi: number | null): string => {
      const base = Giorno(g.settimana, g.numero);
      if (nBuchi === null) return `${base}.`;
      if (nBuchi === 0) return `${base}: nessun buco adatto.`;
      return `${base}: ${nBuchi === 1 ? '1 buco adatto' : `${nBuchi} buchi adatti`}.`;
    },
    /** P13 con blocco piazzato: torna nel parcheggio. */
    tornatoAlParcheggio: 'Il tuo lavoro è tornato nel parcheggio.',

    /** P14: tutti i lavori tolti. */
    vuoto: 'Il tuo lavoro è vuoto.',

    /** Annullato il trascinamento (Esc o fuori dal planning). */
    trascinamentoAnnullato: 'Il tuo lavoro è rimasto dov\'era.',
  },

  /* --- deposito gomme D0-D4 (ux §6.2) --- */
  deposito: {
    domanda: 'Le tue gomme sono già da noi?',
    si: 'Sì',
    no: 'No',
    etichetta: 'Numero deposito',
    formato: `Una D e tre cifre, per esempio ${DEPOSITO.esempio}. È sul cartellino.`,
    erroreFormato: 'Il numero di deposito è una D e tre cifre, lo trovi sul cartellino.',
    erroreVuoto: 'Scrivi il numero di deposito, o rispondi No.',
    noSpiega: 'Ti diamo noi un numero quando porti le gomme.',
    siAnnuncio: 'Gomme già da noi: il cambio dura 30 minuti.',
    noAnnuncio: 'Il cambio gomme dura 40 minuti.',
  },

  /* --- dati e invio F0-F7 (ux §6.3) --- */
  dati: {
    legenda: 'I tuoi dati',
    riepilogo: (g: GiornoTesto, ponte: Ponte, inizio: number, fine: number): string =>
      `${Giorno(g.settimana, g.numero)}, ponte ${ponte}, ${intervallo(inizio, fine)}`,
    riepilogoGiornata: (g: GiornoTesto, ponte: Ponte): string =>
      `${Giorno(g.settimana, g.numero)}, ponte ${ponte}, giornata intera`,
    riepilogoSenzaOrario: 'Senza orario: ti chiamiamo noi con una data.',
    nome: { etichetta: 'Nome', aiuto: '', errore: 'Serve un nome per sapere chi cercare.' },
    telefono: {
      etichetta: 'Telefono',
      aiuto: 'Ti chiamiamo solo per questo lavoro.',
      errore: 'Serve un numero di telefono per richiamarti.',
      erroreCorto: 'Il numero sembra corto: controlla le cifre.',
    },
    targa: { etichetta: 'Targa o modello', facoltativo: 'facoltativo', aiuto: 'Ci aiuta a preparare i ricambi.' },
    nota: {
      etichetta: 'Nota',
      facoltativo: 'facoltativa',
      aiuto: 'Una riga, per esempio: fischia quando freno in discesa.',
      max: 200,
    },
    /** All'invio con errori: "Due cose da sistemare: nome, telefono." */
    errori: (campi: readonly string[]): string => {
      const n = campi.length;
      const quante = n === 1 ? 'Una cosa' : n === 2 ? 'Due cose' : n === 3 ? 'Tre cose' : `${n} cose`;
      return `${quante} da sistemare: ${campi.join(', ')}.`;
    },
    /** Nomi dei campi dentro la frase degli errori. */
    nomiCampi: { nome: 'nome', telefono: 'telefono', deposito: 'numero di deposito' },
  },
  invio: {
    bottone: 'Metti in ponte',
    inCorso: 'Invio...',
    inCorsoAnnuncio: 'Invio in corso.',
    /** F4: `quando` = 'sera' se si invia prima delle 18:30 di un giorno aperto, altrimenti 'domani'. */
    successo: (g: GiornoTesto, inizio: number, ponte: Ponte): string =>
      `Fatto. ${Giorno(g.settimana, g.numero)} alle ${ora(inizio)} te la alziamo sul ponte ${ponte}.`,
    successoGiornata: (g: GiornoTesto, ponte: Ponte): string =>
      `Fatto. ${Giorno(g.settimana, g.numero)} la porti alle 8:00, va sul ponte ${ponte} e la ritiri in serata.`,
    successoSenzaOrario: 'Fatto. Nessun orario per ora: troviamo una data insieme al telefono.',
    richiamo: (quando: 'sera' | 'domani'): string =>
      quando === 'sera'
        ? 'Ti richiama Erika entro sera per confermare. Se serve un ricambio da ordinare, te lo dice lei.'
        : 'Ti richiama Erika entro le 12:00 di domani per confermare. Se serve un ricambio da ordinare, te lo dice lei.',
    depositoGia: (numero: string): string => `Le tue gomme sono in deposito col numero ${numero}.`,
    depositoNuovo: (numero: string): string => `Il tuo numero di deposito sarà ${numero}: lo scriviamo sul cartellino.`,
    firma: 'Mandi, Erika.',
    altro: 'Un altro lavoro',
    altroAria: 'Componi un altro lavoro',
    altroAnnuncio: 'Pronto per un altro lavoro.',
    /** F5 */
    fallito: 'Non è partito, ma il buco è ancora tuo.',
    riprova: 'Riprova',
    oppure: 'oppure',
    chiama: 'Chiama',
    chiamaAria: 'Chiama l\'officina (numero di esempio)',
    fallitoAnnuncio: 'Non è partito. Il buco è ancora tuo: riprova, oppure chiamaci.',
    /** F6: ritorno dopo un successo. */
    giaInPonte: (g: GiornoTesto, inizio: number): string =>
      `Hai già un lavoro in ponte ${giorno(g.settimana, g.numero)} alle ${ora(inizio)}.`,
    giaInPonteGiornata: (g: GiornoTesto): string => `Hai già un lavoro in ponte ${giorno(g.settimana, g.numero)}, giornata intera.`,
  },
} as const;

/** "il tagliando", "le pastiglie", "gli ammortizzatori", "lo scarico". */
function articolo(id: IdLavoro): string {
  const conArticolo: Record<IdLavoro, string> = {
    'gomme-stagionali': 'il cambio gomme',
    'gomme-deposito': 'il cambio gomme',
    convergenza: 'la convergenza',
    pastiglie: 'le pastiglie',
    'pastiglie-dischi': 'pastiglie e dischi',
    ammortizzatori: 'gli ammortizzatori',
    tagliando: 'il tagliando',
    scarico: 'lo scarico',
  };
  return conArticolo[id];
}

/* ================================================================== recapiti */

/** Testi dei recapiti. Il numero e l'email non si mostrano: solo i link. */
export const RECAPITI = {
  indirizzoRiga1: `${RECAPITI_DATI.via} ${RECAPITI_DATI.civico}`,
  indirizzoRiga2: `${RECAPITI_DATI.cap} ${RECAPITI_DATI.citta}`,
  indirizzoAria: `${RECAPITI_DATI.via} ${RECAPITI_DATI.civico}, ${RECAPITI_DATI.citta} (indirizzo di esempio)`,
  chiama: 'Chiama',
  chiamaAria: 'Chiama l\'officina (numero di esempio)',
  chiamaHref: RECAPITI_DATI.telefonoHref,
  scrivi: 'Scrivi',
  scriviAria: 'Scrivi all\'officina (indirizzo email di esempio)',
  scriviHref: RECAPITI_DATI.emailHref,
  maps: 'Apri in Maps',
  mapsAria: `Apri in Maps: ${RECAPITI_DATI.via}, ${RECAPITI_DATI.citta} (si apre in una nuova scheda)`,
  mapsHref: RECAPITI_DATI.mapsHref,
  nota: 'Telefono ed email sono di esempio: l\'officina non esiste.',
} as const;

/* ================================================================== l'officina */

export const OFFICINA = {
  titolo: 'L\'officina',
  come: 'Dal centro sono 10 minuti in auto verso Azzano Decimo. Si parcheggia davanti.',
  orariTitolo: 'Orari',
  orari: [
    { giorni: 'Lunedì-venerdì', ore: '8:00-12:30 e 14:00-18:30' },
    { giorni: 'Sabato', ore: '8:00-12:00, solo gomme' },
    { giorni: 'Domenica', ore: 'chiuso' },
  ],
  picchi: 'Da metà ottobre a metà novembre e da metà marzo a metà aprile c\'è la coda delle gomme: conviene una settimana di anticipo.',
  chi: 'Loris e Denis sono sui ponti 1 e 2, Samuele alle gomme sul ponte 3, Erika in accettazione e al telefono.',
  storia:
    'Loris ha aperto alla fine degli anni Novanta, con un ponte usato e un banco da lavoro verde comprato all\'asta di un\'officina di Porcia. Il banco c\'è ancora; la lavagna dei ponti, quella che trovi qui sopra, l\'ha voluta Erika.',
  attesa: 'Fino a un\'ora di lavoro si aspetta in accettazione. Per i lavori lunghi c\'è un\'auto di cortesia, una sola: chiedila quando ti richiamiamo.',
  noFacciamo:
    'Carrozzeria, elaborazioni e batterie ad alta tensione di ibride ed elettriche no: ti diciamo a chi andare. La revisione la prepariamo noi e ti accompagniamo al centro revisioni.',
  voci: [
    { testo: 'Mi hanno fatto scendere sotto la macchina a vedere le pastiglie. Erano davvero finite.', chi: 'Paola, Cordenons' },
    { testo: 'Prenotato alle 8:00 sul ponte 2, furgone fuori alle 9:40.', chi: 'Mirco, Fiume Veneto' },
    { testo: 'Gomme in deposito da tre inverni, il cambio dura mezz\'ora.', chi: 'Giulia, Porcia' },
  ],
  vociAria: 'Cosa dicono i clienti',
  /** Foto stock: l'alt dice quello che si vede, mai "la nostra officina". */
  fotoAlt: {
    ponte: 'Un\'auto alzata su un ponte a due colonne in un\'officina ordinata.',
    attrezzatura: 'Il pavimento di un\'officina con le linee di una postazione e l\'attrezzatura al muro.',
    esterno: 'L\'ingresso di un\'officina con la serranda alzata.',
  },
} as const;

/* ================================================================== fallback senza WebGL */

/**
 * Foto a tutto schermo al posto della scena (una per quota; la 20 usa quella
 * a terra). Nessun messaggio "il browser non supporta": la pagina non deve
 * sembrare rotta. Le foto sono decorative quanto il canvas: il testo delle
 * quote dice già tutto, quindi `alt` vuoto; `descrizione` è per il doc del
 * photo-editor, se decide di renderle non decorative.
 */
export const FALLBACK = {
  alt: '',
  descrizione: {
    0: 'Un\'auto ferma su un ponte a due colonne, ruote a terra.',
    80: 'Una ruota smontata con disco e pinza in vista, all\'altezza degli occhi.',
    180: 'Il sottoscocca di un\'auto visto da sotto, con lo scarico.',
  },
  /** Fermi immagine della scena 3D (piano B): decorativi. */
  fermoAlt: '',
} as const;

/* ================================================================== piede */

export const PIEDE = {
  marchio: 'SOTTOSCOCCA, officina e gommista',
  finzione: 'Attività inventata: nomi, prezzi, indirizzo e recapiti sono di esempio.',
  modello: 'Modello 3D: Car Kit di Kenney (CC0)',
  modelloHref: RECAPITI_DATI.kenneyHref,
  modelloAria: 'Car Kit di Kenney, licenza CC0 (si apre in una nuova scheda)',
  fotoTitolo: 'Foto',
  /** "Foto di Nome Cognome su Unsplash": autore e URL da `assets/foto/index.ts`. */
  foto: (autore: string): string => `${autore} su Unsplash`,
  fotoAria: (autore: string): string => `Foto di ${autore} su Unsplash (si apre in una nuova scheda)`,
  conceptDi: 'Un concept di Ciceri Lab',
  indiceTitolo: 'Indice',
  indiceAria: 'Indice della pagina',
  indice: [
    { etichetta: '0 cm, a terra', href: '#inizio' },
    { etichetta: '20 cm, gomme', href: '#gomme' },
    { etichetta: '80 cm, freni e sospensioni', href: '#freni' },
    { etichetta: '180 cm, il sottoscocca', href: '#sottoscocca' },
    { etichetta: 'Deposito gomme', href: '#deposito' },
    { etichetta: 'Il ponte libero', href: '#ponte-libero' },
    { etichetta: 'L\'officina', href: '#officina' },
  ],
  trovaUnBuco: 'Trova un buco',
  ricomincia: 'Ricomincia da capo',
  ricominciaAria: 'Ricomincia da capo: svuota il tuo lavoro e riporta il ponte a terra',
  ricominciato: 'Fatto: il tuo lavoro è vuoto e il ponte è a terra.',
} as const;

/* ================================================================== annunci aria-live */

/**
 * Regione `aria-live="polite"`. I plateau li annuncia `ponte/quota.ts` con
 * `QUOTE[q].annuncio`; il planning usa `PONTE_LIBERO.stati.*`.
 */
export const ANNUNCI = {
  plateau: (q: Quota): string => QUOTE[q].annuncio,
  aggiunto: (id: IdLavoro, totale: number): string =>
    `Aggiunto: ${LAVORI_NOMI[id].parlato}. Il tuo lavoro: ${durataParlata(totale)}.`,
  sostituito: (nuovo: IdLavoro, vecchio: IdLavoro, totale: number): string =>
    `${maiuscola(LAVORI_NOMI[nuovo].parlato)} al posto di ${LAVORI_NOMI[vecchio].parlato}. Il tuo lavoro: ${durataParlata(totale)}.`,
  tolto: (id: IdLavoro, totale: number): string =>
    totale > 0
      ? `Tolto: ${LAVORI_NOMI[id].parlato}. Il tuo lavoro: ${durataParlata(totale)}.`
      : `Tolto: ${LAVORI_NOMI[id].parlato}. Il tuo lavoro è vuoto.`,
  schedaAperta: (id: IdPunto): string => `${PUNTI_TESTI[id].nome}: prezzi e tempi.`,
  ricominciato: PIEDE.ricominciato,
} as const;

/* ================================================================== tutto insieme */

const TESTI = {
  META,
  VETRINA,
  COMUNI,
  SALTI,
  TESTATA,
  QUOTE,
  ASTA,
  APERTURA,
  GOMME,
  FRENI,
  SOTTOSCOCCA,
  PUNTI_TESTI,
  SCHEDA,
  BARRA,
  DEPOSITO: DEPOSITO_TESTI,
  PONTE_LIBERO,
  RECAPITI,
  OFFICINA,
  FALLBACK,
  PIEDE,
  ANNUNCI,
  LAVORI_NOMI,
  PONTI_TESTI,
  OCCUPATI_TESTI,
} as const;

export type Testi = typeof TESTI;

export default TESTI;
