/**
 * CONTROPELO · tutti i testi visibili del sito (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter. Nessun trattino lungo o medio, nessun punto
 * esclamativo, nessun puntino di sospensione, nessuna emoji, nessun occhiello
 * numerato. "Scrivi il tuo nome" è l'unico richiamo alla prenotazione.
 *
 * Due voci (brand-strategist §4):
 * - SUL VETRO (Mansalva, `.ctp-pennarello`): listino, barba, dove e quando,
 *   la lista, il tuo nome. Frasi nominali, numeri, minuscole dove le scrive
 *   un barbiere.
 * - SULLA MENSOLA, negli stati e negli errori (Figtree): frasi complete,
 *   brevi, calme. Il barbiere che ti risponde a voce.
 * Ogni oggetto sotto dice in quale voce va, nel commento.
 *
 * Prezzi e durate NON sono scritti qui: arrivano da content/prezzi.ts.
 * Gli orari del vetro arrivano da content/orari.ts.
 *
 * Le funzioni servono solo a inserire valori (giorno, ora, nome, prezzo) in
 * frasi già scritte. Giorni già formattati da core/date.ts ("martedì 29"),
 * ore già in 'HH:MM' o già passate da `oraVisibile()`.
 */

import {
  FUORI_LISTINO,
  LISTINO,
  ORDINE_LISTINO,
  ORDINE_RASATURA,
  ORDINE_SERVIZI,
  RASATURA_PASSAGGI,
  REGOLE_NUMERI,
  SERVIZI,
  type Servizio,
  type VoceListino,
} from './prezzi';
import { ORARI_VETRO } from './orari';

/* ================================================================== aiuti */

/** Spazio non separabile: il prezzo non va mai a capo lontano dal "€". */
const NBSP = ' ';

/** "22 €" (con spazio non separabile). I prezzi del concept sono interi. */
export function euro(valore: number): string {
  return `${valore}${NBSP}€`;
}

/** "22 euro", per il lettore di schermo e per le etichette dei radio. */
export function euroSr(valore: number): string {
  return `${valore} euro`;
}

/** '09:00' → '9:00'; '14:30' → '14:30'. Le ore si scrivono senza lo zero davanti. */
export function oraVisibile(hhmm: string): string {
  return hhmm.startsWith('0') ? hhmm.slice(1) : hhmm;
}

/** "martedì 29" → "Martedì 29" (inizio di frase o titolo). */
export function maiuscola(testo: string): string {
  return testo.length === 0 ? testo : testo.charAt(0).toUpperCase() + testo.slice(1);
}

/** "nessun posto libero", "1 posto libero", "4 posti liberi". */
export function postiLiberi(n: number): string {
  if (n <= 0) return 'nessun posto libero';
  if (n === 1) return '1 posto libero';
  return `${n} posti liberi`;
}

/** Indice di uno specchio, come `IndiceSpecchio` di state/store.ts. */
type Indice = 0 | 1 | 2;

/** Come si chiama il giorno mostrato rispetto a oggi. */
export type Relativo = 'oggi' | 'domani' | 'altro';

/* ================================================================== link e recapiti di esempio */

/**
 * Dati di esempio della barberia (brand-strategist §9). Il repo è pubblico:
 * numero ed email sono finti e NON vanno mai mostrati. A vista ci sono solo
 * le etichette dei link ("Chiama", "Scrivi una email").
 */
export const RECAPITI = {
  via: 'Via Montereale 41',
  cap: '33170',
  citta: 'Pordenone',
  provincia: 'PN',
  /** Riga dell'indirizzo sul vetro 3. */
  indirizzoRiga: 'Via Montereale 41, Pordenone',
  /** Per `<address>` e lettore di schermo. */
  indirizzoCompleto: 'Via Montereale 41, 33170 Pordenone',
  /** Solo dato, mai a vista. */
  telefonoNumero: '+39 0434 000000',
  telefonoHref: 'tel:+390434000000',
  /** Solo dato, mai a vista. */
  email: 'ciao@contropelo.example',
  emailHref: 'mailto:ciao@contropelo.example',
  /** Ricerca della via, mai di un'attività. */
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Via+Montereale+41+Pordenone',
} as const;

/** Letti da core/links.ts (scaffold). */
export const LINK = {
  lab: '/',
  cicerilab: 'https://cicerilab.com',
  maps: RECAPITI.mapsHref,
  telefono: RECAPITI.telefonoHref,
  email: RECAPITI.emailHref,
} as const;

/* ================================================================== meta */

export const META = {
  /** <title>: 58 caratteri (max 60). Dice "Concept" e "Ciceri Lab" come il pilota. */
  title: 'Concept 13 · CONTROPELO, barberia a Pordenone | Ciceri Lab',
  /** meta description: 153 caratteri (max 155). Dice subito che la barberia è inventata. */
  description:
    'Concept di Ciceri Lab: il sito di una barberia di Pordenone, inventata. Pulisci lo specchio appannato, leggi il listino e scrivi il tuo nome nella lista.',
  ogTitle: 'CONTROPELO, barberia. Un concept di Ciceri Lab',
  ogDescription: 'Pulisci lo specchio appannato e scrivi il tuo nome nella lista del barbiere. Un concept di Ciceri Lab.',
  /** Testo alternativo dell'immagine di anteprima (se il seo-engineer la prevede). */
  ogImageAlt: 'Lo specchio di una barberia appannato dal vapore, con il listino scritto a pennarello sul vetro.',
} as const;

/**
 * Voce per src/content/site.ts (CONCEPTS) nel sito vero. Non è di questo
 * progetto: la usa chi porta il concept, se Luca è d'accordo.
 */
export const VETRINA = {
  tag: 'Barbiere',
  title: 'CONTROPELO',
  subtitle: 'Barberia · Pordenone',
  desc: 'Tre specchi, tre barbieri. Pulisci il vapore dal vetro, leggi i prezzi scritti a pennarello e scrivi il tuo nome in un buco della lista.',
  perche: 'Dal barbiere tutto passa dallo specchio: il listino, gli appuntamenti, il cliente che guarda il riflesso. Il sito è lo specchio.',
  mestieri: [
    'barbiere',
    'barberia',
    'barbiere uomo',
    'parrucchiere uomo',
    'taglio uomo',
    'barba',
    'rasatura',
    'sfumatura',
    'salone',
  ],
} as const;

/* ================================================================== i tre barbieri */

/**
 * Uno per specchio, in ordine di parete (indice 0, 1, 2).
 * - `id`: identificativo stabile del vetro (ux-architect §1), utile a URL e test.
 * - `nome`: Limelight sulla mensola (tab) e Mansalva in testa al vetro.
 * - `titoloVetro`: h3 del vetro, a pennarello.
 * - `riga`: la riga sul barbiere, a pennarello piccolo in fondo al vetro.
 * - `indietro`: bottone a pennarello della faccia lista per tornare al vetro.
 */
export const BARBIERI = [
  {
    id: 'listino',
    nome: 'Mattia',
    poltrona: 'poltrona 1',
    titoloVetro: 'Il listino',
    riga: 'Mattia: forbice e riga, da quando aveva 17 anni.',
    indietro: '← il listino',
    indietroAria: 'Torna al listino di Mattia',
  },
  {
    id: 'barba',
    nome: 'Denis',
    poltrona: 'poltrona 2',
    titoloVetro: 'La barba',
    riga: 'Denis: panno caldo e lama. Viene da Conegliano.',
    indietro: '← la barba',
    indietroAria: 'Torna alla barba di Denis',
  },
  {
    id: 'orari',
    nome: 'Samir',
    poltrona: 'poltrona 3',
    titoloVetro: 'Dove e quando',
    riga: 'Samir: sfumature a pelle e bambini che non stanno fermi.',
    indietro: '← dove e quando',
    indietroAria: 'Torna a dove e quando, sullo specchio di Samir',
  },
] as const;

export type BarbiereId = (typeof BARBIERI)[number]['id'];

/** Testi della parete e dei pannelli degli specchi (Figtree per aria, Mansalva per h2). */
export const PARETE = {
  /** h2 del pannello: visibile solo il nome, il resto in `.ctp-sr`. */
  h2Sr: (i: Indice) => `, ${BARBIERI[i].poltrona}`,
  /** Bordo dello specchio vicino (bottone fuori dal Tab su L). */
  bordoAria: (i: Indice) => `Specchio di ${BARBIERI[i].nome}`,
  /** La foto del riflesso è decorativa: alt vuoto (ux-architect §8.1). */
  riflessoAlt: '',
} as const;

/* ================================================================== fascia alta */

/**
 * Figtree tranne l'insegna (Limelight).
 * h1 consigliato: `<h1><span>{insegna}</span><span class="ctp-sr">, </span><span>{sotto}</span></h1>`
 * così si legge "Contropelo, barberia, Pordenone".
 */
export const FASCIA = {
  insegna: 'Contropelo',
  sotto: 'barberia, Pordenone',
  /** Bottone testuale che apre il pannello. */
  informazioni: 'Informazioni',
  informazioniAria: 'Informazioni su questa pagina',
} as const;

export const SALTI = {
  /** Link di salto, primo nel Tab (ux-architect §2.6). */
  lista: 'Vai alla lista di oggi',
} as const;

/* ================================================================== vetro: i tre specchi */

/** Specchio 1, Mattia. Tutto a pennarello tranne `*Sr`. */
export const VETRO_LISTINO = {
  titolo: BARBIERI[0].titoloVetro,
  /**
   * Nome della voce a sinistra, prezzo a destra da `euro(LISTINO[id].prezzo)`.
   * Massimo 22 caratteri (entrano a 375 px con il prezzo).
   */
  voci: {
    taglio: { voce: 'Taglio', sr: 'Taglio' },
    'taglio-barba': { voce: 'Taglio e barba', sr: 'Taglio e barba' },
    barba: { voce: 'Barba', sr: 'Barba' },
    rasatura: { voce: 'Rasatura a panno caldo', sr: 'Rasatura con panno caldo' },
    sfumatura: { voce: 'Sfumatura a pelle', sr: 'Sfumatura a pelle' },
    bambini: { voce: 'Bambini fino a 12 anni', sr: `Bambini fino a ${REGOLE_NUMERI.bambiniFinoAnni} anni` },
    macchinetta: { voce: "Macchinetta un'altezza", sr: "Macchinetta a un'altezza sola" },
  } satisfies Record<VoceListino, { voce: string; sr: string }>,
  /** Ordine delle righe, da prezzi.ts. */
  ordine: ORDINE_LISTINO,
  prezzo: (id: VoceListino) => euro(LISTINO[id].prezzo),
  prezzoSr: (id: VoceListino) => euroSr(LISTINO[id].prezzo),
  /** Una riga sola in fondo al listino, non una colonna (brand-strategist §5.3). */
  durata: "tutto mezz'ora, taglio e barba un'ora",
  pagamento: 'si paga qui: contanti o bancomat',
  /** Titolo accessibile della lista `<dl>` dei prezzi. */
  elencoAria: 'Prezzi',
} as const;

/** Specchio 2, Denis. Tutto a pennarello tranne `*Sr`. */
export const VETRO_BARBA = {
  titolo: BARBIERI[1].titoloVetro,
  /** Righe della rasatura, con i minuti a destra da `minuti(RASATURA_PASSAGGI[k])`. */
  passaggi: {
    pannoCaldo: 'Panno caldo',
    sapone: 'Sapone e pennello',
    conIlPelo: 'Lama, con il pelo',
    contropelo: 'Contropelo',
    dopobarba: 'Panno freddo, dopobarba',
  } satisfies Record<keyof typeof RASATURA_PASSAGGI, string>,
  ordine: ORDINE_RASATURA,
  minuti: (k: keyof typeof RASATURA_PASSAGGI) => `${RASATURA_PASSAGGI[k]} min`,
  minutiSr: (k: keyof typeof RASATURA_PASSAGGI) => `${RASATURA_PASSAGGI[k]} minuti`,
  /** Riga di chiusura della rasatura, con il prezzo del listino. */
  totale: `in tutto mezz'ora, ${euro(LISTINO.rasatura.prezzo)}`,
  totaleSr: `In tutto mezz'ora, ${euroSr(LISTINO.rasatura.prezzo)}`,
  lama: 'lama nuova per ognuno',
  sensibile: 'pelle sensibile? dillo prima: solo con il pelo',
  barbaLunga: `barba lunga: forbice, pettine e contorno a lama, ${euro(FUORI_LISTINO.barbaLunga.prezzo)}`,
  barbaLungaSr: `Barba lunga: forbice, pettine e contorno a lama, ${euroSr(FUORI_LISTINO.barbaLunga.prezzo)}`,
  /** Facoltative, solo se c'è spazio (L). In ordine di priorità. */
  contropeloSpiegato: 'contropelo: la seconda passata, quella che rifinisce',
  matrimonio: `per un matrimonio scriviti ${REGOLE_NUMERI.matrimonioGiorniPrima} giorni prima`,
  elencoAria: 'La rasatura, passo per passo',
} as const;

/** Specchio 3, Samir. Tutto a pennarello tranne link e `*Sr`/`*Aria`. */
export const VETRO_DOVE = {
  titolo: BARBIERI[2].titoloVetro,
  /** Tre righe parlate (content/orari.ts). */
  orari: ORARI_VETRO,
  orariAria: 'Orari',
  indirizzo: RECAPITI.indirizzoRiga,
  parcheggio: 'parcheggio lungo la via, dal centro 10 minuti a piedi',
  maps: 'Apri in Maps',
  mapsSr: ', si apre in una nuova scheda',
  chiama: 'Chiama',
  chiamaAria: 'Chiama la barberia',
  scrivi: 'Scrivi una email',
  scriviAria: 'Scrivi una email alla barberia',
  /** Le tre regole, brevi, in questo ordine. */
  regole: [
    'chi è in lista passa prima',
    `${REGOLE_NUMERI.ritardoMinuti} minuti di ritardo: tocca a chi aspetta`,
    'non vieni? cancella il nome, nessuna penale',
  ],
  regoleAria: 'Regole del salone',
} as const;

/** In fondo a ogni vetro, solo dove le facce si alternano (S, M, L stretto). */
export const VETRO_COMUNE = {
  vaiAllaLista: 'la lista →',
  vaiAllaListaAria: (i: Indice) => `Vai alla lista di ${BARBIERI[i].nome}`,
} as const;

/* ================================================================== la lista sullo specchio */

/**
 * Faccia "lista" di ogni specchio. Righe a pennarello; messaggi lunghi
 * (pieno, promessa, già segnato) in Figtree. `*Sr` in `.ctp-sr`.
 */
export const LISTA = {
  /** Stato L0 (prerender, prima del montaggio): nessuna data. */
  titoloAttesa: 'La lista del giorno',
  /** h3 con `<time>`: "Oggi, martedì 29", "Domani, mercoledì 30", "Giovedì 1". */
  titolo: (rel: Relativo, giorno: string) =>
    rel === 'oggi' ? `Oggi, ${giorno}` : rel === 'domani' ? `Domani, ${giorno}` : maiuscola(giorno),
  /** Titolo su S con la riga di scrittura aperta: dice anche l'ora scelta. */
  titoloConOra: (rel: Relativo, giorno: string, ora: string) =>
    `${rel === 'oggi' ? `Oggi, ${giorno}` : rel === 'domani' ? `Domani, ${giorno}` : maiuscola(giorno)}, alle ${oraVisibile(ora)}`,
  /**
   * Il messaggio chiave (brand-strategist §3.1), UNA volta: riga Figtree 14-15
   * sotto il titolo della lista, solo con la riga di scrittura chiusa. Se su S
   * non c'è spazio, si omette: torna comunque nella conferma.
   */
  promessa: "Qui non si fa la fila: scrivi il nome in un buco, e alla tua mezz'ora la poltrona è tua.",
  /** Fasce su mobile (bottoni `aria-pressed`). Quattro fasce: si usa l'ora d'inizio, `oraVisibile()`. */
  fasce: { mattina: 'mattina', pomeriggio: 'pomeriggio' },
  fasceAria: 'Fascia oraria',
  fasciaOraAria: (da: string) => `Dalle ${oraVisibile(da)}`,
  /** Riga della pausa: "12:30-14:30 pranzo" (trattino corto). */
  pranzo: (da: string, a: string) => `${oraVisibile(da)}-${oraVisibile(a)} pranzo`,
  pranzoSr: (da: string, a: string) => `Dalle ${oraVisibile(da)} alle ${oraVisibile(a)}, pranzo`,
  /** Posto libero: il trattino turchese è un segno (tratti.ts), il testo è solo per lettore di schermo. */
  liberoSr: (ora: string) => `Ore ${oraVisibile(ora)}, libero, scrivi il tuo nome`,
  /** Con `forced-colors: active` accanto al trattino si vede questa parola. */
  liberoParola: 'libero',
  /** Occupato da un nome di esempio: il nome è a vista, qui la frase per il lettore di schermo. */
  occupatoSr: (ora: string, nome: string) => `Ore ${oraVisibile(ora)}, ${nome}`,
  /** Seconda mezz'ora di un "taglio e barba" di esempio (stesso nome, tratto tratteggiato). */
  secondaMezzoraSr: (ora: string, nome: string) => `Ore ${oraVisibile(ora)}, ${nome}, seconda mezz'ora`,
  /** Mezz'ore già passate di oggi: ora dimessa, nessun nome né trattino. */
  passataSr: (ora: string) => `Ore ${oraVisibile(ora)}, passata`,
  /** La tua riga (successo e ritorno). Nome a vista in Mansalva, sottolineato. */
  tuaSr: (ora: string, nome: string) => `Ore ${oraVisibile(ora)}, ${nome}, il tuo appuntamento`,
  tuaSecondaSr: (ora: string, nome: string) => `Ore ${oraVisibile(ora)}, ${nome}, seconda mezz'ora del tuo appuntamento`,
  cancella: 'cancella',
  cancellaAria: (ora: string) => `Cancella il tuo nome delle ${oraVisibile(ora)}`,
  /** Navigazione tra i giorni, a pennarello. `nomeGiorno` = "sabato" o "sabato 3", da core/date.ts. */
  avanti: (rel: Relativo, nomeGiorno: string) => (rel === 'domani' ? 'domani →' : `${nomeGiorno} →`),
  indietro: (rel: Relativo, nomeGiorno: string) => (rel === 'oggi' ? '← oggi' : `← ${nomeGiorno}`),
  vaiAGiornoAria: (giorno: string) => `Vai a ${giorno}`,
  /** Oltre i 6 giorni lavorativi, al posto di "giorno dopo →" (Figtree). */
  oltre: 'Più in là? ',
  oltreChiama: 'Chiama',
  oltreChiamaAria: 'Chiama la barberia per un giorno più avanti',
  /** Giorno chiuso (domenica, lunedì): parola grande a pennarello. */
  chiuso: 'chiuso',
  chiusoSr: (giorno: string) => `${maiuscola(giorno)}, chiuso`,
  /** Giorno pieno (Figtree). `quando` = "oggi", "domani" o "martedì 6". */
  pieno: (rel: Relativo, giorno: string) => (rel === 'oggi' ? 'Oggi siamo pieni.' : `${maiuscola(giorno)} siamo pieni.`),
  /** Link al primo posto libero sui tre specchi. `stesso` = stesso barbiere della lista. */
  pienoProposta: (p: { barbiere: string; stesso: boolean; quando: string; ora: string }) =>
    p.stesso
      ? `${maiuscola(p.quando)} alle ${oraVisibile(p.ora)} c'è posto`
      : `Da ${p.barbiere} ${p.quando} alle ${oraVisibile(p.ora)} c'è posto`,
  pienoPropostaAria: (p: { barbiere: string; stesso: boolean; quando: string; ora: string }) =>
    `${p.stesso ? maiuscola(p.quando) : `Da ${p.barbiere} ${p.quando}`} alle ${oraVisibile(p.ora)} c'è posto: vai alla lista di ${p.barbiere}`,
  /** Nessun posto sui tre specchi in tutti i giorni prenotabili (Figtree). */
  pienoSettimana: 'Questa settimana siamo pieni su tutte e tre le poltrone. ',
  pienoSettimanaChiama: 'Chiamaci',
  pienoSettimanaDopo: ': ti diciamo noi il primo buco.',
  /** Oggi, dopo l'ultima mezz'ora (Figtree). */
  finita: 'Per oggi abbiamo finito.',
  /** Titolo accessibile dell'`<ol>`. */
  elencoAria: (nome: string) => `Appuntamenti di ${nome}`,
} as const;

/* ================================================================== la riga di scrittura */

/** Le quattro parole del servizio, a pennarello. */
const SCRITTURA_PAROLE = {
  taglio: 'taglio',
  barba: 'barba',
  'taglio-barba': 'taglio e barba',
  rasatura: 'rasatura',
} as const satisfies Record<Servizio, string>;

/**
 * Il form al posto del trattino. Etichette e errori in Figtree; le parole del
 * servizio, il nome e il telefono che si digitano in Mansalva.
 */
export const SCRITTURA = {
  formAria: (ora: string, barbiere: string) => `Scrivi il tuo nome alle ${oraVisibile(ora)} con ${barbiere}`,
  /** L15: hai già un nome segnato e ne apri un altro (in testa alla riga, Figtree). */
  sostituisce: (p: { giorno: string; ora: string; barbiere: string }) =>
    `Hai già le ${oraVisibile(p.ora)} di ${p.giorno} con ${p.barbiere}: se segni questa, quella si cancella.`,
  servizio: {
    legenda: 'Cosa ti facciamo?',
    /** Le quattro parole a pennarello, nell'ordine di ORDINE_SERVIZI. */
    parole: SCRITTURA_PAROLE,
    ordine: ORDINE_SERVIZI,
    /** Prezzo scritto accanto alla parola scelta. */
    prezzo: (s: Servizio) => euro(SERVIZI[s].prezzo),
    /** Etichetta del radio per il lettore di schermo: "taglio, 22 euro". */
    radioAria: (s: Servizio) => `${SCRITTURA_PAROLE[s]}, ${euroSr(SERVIZI[s].prezzo)}`,
    /** Una riga sotto le parole (Figtree 14): le voci del listino che ricadono in "taglio". */
    aiuto: 'Sfumatura, bambini o macchinetta: tocca taglio. Il prezzo è quello del listino.',
  },
  nome: {
    etichetta: 'Il tuo nome',
    /** Nessun placeholder al posto dell'etichetta; campo vuoto. */
  },
  telefono: {
    etichetta: 'Telefono',
    /** Sotto il campo (Figtree 14), collegato con aria-describedby. */
    aiuto: "Solo per avvisarti se il barbiere ha un imprevisto. Non lo usiamo per nient'altro.",
  },
  segna: 'Segna',
  lasciaStare: 'lascia stare',
  lasciaStareAria: 'Lascia stare e chiudi la riga',
  /** Annuncio mentre il nome si scrive (L9). */
  inCorso: 'Sto segnando il tuo nome.',
} as const;

/**
 * Messaggi di errore dei campi (L8), sotto il campo con icona di avviso.
 * Le chiavi sono quelle che lo store salva in `Scrittura.errori`.
 */
export const ERRORI = {
  servizioVuoto: 'Scegli cosa ti facciamo: taglio, barba, taglio e barba o rasatura.',
  nomeVuoto: 'Scrivi un nome, anche solo quello: il barbiere deve sapere chi chiamare.',
  telefonoVuoto: 'Lasciaci un numero: se il barbiere ha un imprevisto ti chiama.',
  telefonoNonValido: 'Il numero non torna: controlla le cifre.',
} as const;

export type ChiaveErrore = keyof typeof ERRORI;

/**
 * Messaggi con un link dentro (L6e, L11, L12): testo prima, testo del link,
 * testo dopo. Il componente mette il link in mezzo. Figtree.
 */
export const ERRORI_CON_LINK = {
  /** L6e, "taglio e barba" in un buco da mezz'ora. `giorno` solo se l'ora proposta è in un altro giorno. */
  mezzora: (p: { ora: string; giorno?: string } | null) =>
    p
      ? {
          prima: "Qui c'è solo mezz'ora: taglio, barba o rasatura. Per taglio e barba ci sono ",
          link: `le ${oraVisibile(p.ora)}${p.giorno ? ` di ${p.giorno}` : ''}`,
          dopo: '.',
        }
      : {
          prima: "Qui c'è solo mezz'ora: taglio, barba o rasatura. Per taglio e barba ",
          link: 'guarda il giorno dopo',
          dopo: '.',
        },
  /** L11, posto preso nel frattempo. `libera` = prossima ora compatibile col servizio, se c'è. */
  preso: (p: { ora: string; libera: string | null }) =>
    p.libera
      ? {
          prima: `Qualcuno ha scritto prima di te alle ${oraVisibile(p.ora)}. `,
          link: `Le ${oraVisibile(p.libera)} sono libere`,
          dopo: '.',
        }
      : {
          prima: `Qualcuno ha scritto prima di te alle ${oraVisibile(p.ora)}, e oggi non resta posto per questo. `,
          link: 'Guarda il giorno dopo',
          dopo: '.',
        },
  /** L12, invio fallito: due link, "Riprova" e "chiamaci". */
  fallito: {
    prima: 'Non è arrivato. ',
    riprova: 'Riprova',
    riprovaAria: 'Riprova a segnare il tuo nome',
    mezzo: ', oppure ',
    chiama: 'chiamaci',
    chiamaAria: 'Chiama la barberia',
    dopo: '.',
  },
} as const;

/* ================================================================== conferma e prenotazione esistente */

/**
 * Riga di stato dopo la prenotazione (Figtree). Anche qui il link "chiamaci"
 * sta in mezzo. "Mandi" compare solo qui, una volta (brand-strategist §4).
 */
export const CONFERMA = {
  /** L10, successo. */
  segnato: (p: { giorno: string; ora: string; barbiere: string }) => ({
    prima: `Segnato: ${p.giorno} alle ${oraVisibile(p.ora)} con ${p.barbiere}. Se non puoi venire, cancella il nome o `,
    link: 'chiamaci',
    dopo: '. Mandi.',
  }),
  chiamaAria: 'Chiama la barberia',
  /** L13, prenotazione già salvata (al ritorno o da "Scrivi il tuo nome"). */
  giaSegnato: (p: { giorno: string; ora: string; barbiere: string }) =>
    `Sei già segnato: ${p.giorno} alle ${oraVisibile(p.ora)} con ${p.barbiere}. Per cambiare, cancella e riscrivi.`,
  /** L14, dopo "cancella": testo e link per 10 s. */
  cancellato: 'Cancellato: il posto torna libero. ',
  rimettilo: 'Rimettilo',
  rimettiloAria: (ora: string) => `Rimetti il tuo nome alle ${oraVisibile(ora)}`,
  /** "Rimettilo" quando nel frattempo il posto non è più libero. */
  rimettiloPreso: 'Nel frattempo quel posto è stato preso. Scegli un altro buco.',
} as const;

/* ================================================================== mensola */

/** Tutto Figtree, tranne i nomi dei barbieri (Limelight, da BARBIERI). */
export const MENSOLA = {
  navAria: 'Le tre poltrone',
  tablistAria: 'Le tre poltrone',
  /** Testo nascosto dopo il nome nel tab: "Mattia, poltrona 1, il listino". */
  tabSr: (i: Indice) => `, ${BARBIERI[i].poltrona}, ${BARBIERI[i].titoloVetro.toLowerCase()}`,
  /** Interruttore del vapore: etichetta fissa, cambia solo aria-pressed e icona. */
  pulito: 'Specchio pulito',
  /** L'unico richiamo alla prenotazione. `righe` per il bottone a due righe sotto i 380 px. */
  scriviIlTuoNome: 'Scrivi il tuo nome',
  scriviIlTuoNomeRighe: ['Scrivi il', 'tuo nome'],
  /** Suggerimento del gesto, sparisce al primo gesto. */
  suggerimentoMouse: 'Passa il mouse sul vetro',
  suggerimentoDito: 'Passa il dito sul vetro',
} as const;

/* ================================================================== pannello Informazioni */

/**
 * Titolo a pennarello, testi in Figtree (è testo di servizio).
 * È anche il "piede" del concept: nota di finzione e credito a Ciceri Lab.
 */
export const INFORMAZIONI = {
  titolo: 'Informazioni',
  chiudi: 'chiudi',
  chiudiAria: 'Chiudi le informazioni',
  /** Prima cosa del pannello (brand-strategist §5.9). */
  finzione:
    "Contropelo non esiste: è un concept di Ciceri Lab. Barbieri, clienti, indirizzo, telefono ed email sono di esempio, e qui non si prenota davvero: il nome che scrivi resta solo in questo browser.",
  /** La storia, in una frase sola. Bruno è nominato solo qui. */
  storia:
    'Il salone era di Bruno, che scriveva gli appuntamenti a pennarello sullo specchio; dal 2017 è di Mattia, che da ragazzo ci lavorava il sabato e ha tenuto le tre specchiere e la lista sul vetro.',
  /** Come si lavora, detto una volta. */
  igiene: 'Lama nuova per ogni cliente, pettini e forbici nel disinfettante tra un cliente e l\'altro, mantellina e carta collo pulite.',
  nonFacciamo: 'Non facciamo colore, tinte, permanenti, pieghe da cerimonia e cerette. Niente tessere, niente abbonamenti.',
  collo: `Collo e basette tra un taglio e l'altro: ${euro(FUORI_LISTINO.colloBasette.prezzo)}, senza appuntamento se c'è un momento.`,
  bambini: `Sotto i ${REGOLE_NUMERI.bambiniFinoAnni} anni si viene con un adulto.`,
  ritardo: `Arriva ${REGOLE_NUMERI.arrivoPrimaMinuti} minuti prima. Dopo ${REGOLE_NUMERI.ritardoMinuti} minuti di ritardo prendiamo chi aspetta, e ti diciamo noi quando c'è il primo buco.`,
  ferie: 'Ferie: due settimane a metà agosto.',
  /** Cosa c'è dietro al vetro (le foto hanno alt vuoto). */
  riflesso: 'Dietro al vetro c\'è un salone vero, riflesso come in uno specchio: le poltrone in fila, la mensola, la porta sulla via.',
  fotoTitolo: 'Foto',
  /** Una riga per foto, con i dati di assets/foto/index.ts. Il nome dell'autore è il testo del link. */
  foto: (autore: string) => ({ prima: 'Foto di ', link: autore, dopo: ', su Unsplash.' }),
  fotoLinkSr: ', si apre in una nuova scheda',
  font: 'Caratteri: Limelight, Mansalva e Figtree, da Google Fonts.',
  icone: 'Icone: Phosphor, licenza MIT.',
  conceptDi: 'Un concept di Ciceri Lab',
  cicerilab: 'cicerilab.com',
  cicerilabSr: ', si apre in una nuova scheda',
  ricomincia: {
    bottone: 'Ricomincia da capo',
    domanda: 'Cancelliamo il tuo nome e le scelte salvate in questo browser?',
    si: 'Sì, ricomincia',
    no: 'No, lascia così',
    fatto: 'Fatto: lo specchio è come la prima volta.',
  },
} as const;

/* ================================================================== annunci (regione aria-live unica) */

/** Letti da `store.annuncia()`. Frasi complete, brevi. */
export const ANNUNCI = {
  /** Cambio barbiere: "Denis, poltrona 2: la barba." */
  specchio: (i: Indice) => `${BARBIERI[i].nome}, ${BARBIERI[i].poltrona}: ${BARBIERI[i].titoloVetro.toLowerCase()}.`,
  /** Cambio faccia su S e M. */
  facciaLista: (i: Indice) => `La lista di ${BARBIERI[i].nome}.`,
  facciaVetro: (i: Indice) => `${BARBIERI[i].titoloVetro}, sullo specchio di ${BARBIERI[i].nome}.`,
  /** Cambio giorno o fascia: "Mercoledì 30, mattina: 4 posti liberi." */
  giorno: (p: { rel: Relativo; giorno: string; fascia?: string; liberi: number }) =>
    `${LISTA.titolo(p.rel, p.giorno)}${p.fascia ? `, ${p.fascia}` : ''}: ${postiLiberi(p.liberi)}.`,
  chiuso: (giorno: string) => `${maiuscola(giorno)}: chiuso.`,
  pulitoAcceso: 'Specchio pulito: il vapore non torna.',
  pulitoSpento: 'Il vapore torna.',
  inCorso: SCRITTURA.inCorso,
  /** Successo: stessa frase della riga di stato, senza link. */
  segnato: (p: { giorno: string; ora: string; barbiere: string }) => {
    const r = CONFERMA.segnato(p);
    return `${r.prima}${r.link}${r.dopo}`;
  },
  giaSegnato: CONFERMA.giaSegnato,
  cancellato: 'Cancellato: il posto torna libero.',
  ricominciato: INFORMAZIONI.ricomincia.fatto,
} as const;

/* ================================================================== esportazione unica */

export const TESTI = {
  meta: META,
  vetrina: VETRINA,
  recapiti: RECAPITI,
  link: LINK,
  barbieri: BARBIERI,
  parete: PARETE,
  fascia: FASCIA,
  salti: SALTI,
  vetroListino: VETRO_LISTINO,
  vetroBarba: VETRO_BARBA,
  vetroDove: VETRO_DOVE,
  vetroComune: VETRO_COMUNE,
  lista: LISTA,
  scrittura: SCRITTURA,
  errori: ERRORI,
  erroriConLink: ERRORI_CON_LINK,
  conferma: CONFERMA,
  mensola: MENSOLA,
  informazioni: INFORMAZIONI,
  annunci: ANNUNCI,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
