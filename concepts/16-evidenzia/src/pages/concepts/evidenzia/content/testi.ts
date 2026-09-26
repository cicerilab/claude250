/**
 * EVIDENZIA · tutti i testi visibili, i nomi accessibili e le voci aria-live
 * (copywriter).
 *
 * Regole: i componenti non scrivono testo, lo importano da qui. Se manca una
 * stringa si chiede al copywriter. Nessun trattino lungo o medio, nessun punto
 * esclamativo (l'unico "!" è il segno d'errore dei campi chiesto dall'ux),
 * nessuna emoji, nessun occhiello numerato, al massimo un "·" per riga.
 * Si dà del tu. "Prepara il giro" è l'unica etichetta del richiamo alla
 * visita in tutto il sito.
 *
 * Le funzioni servono solo a inserire valori (date, orari, nomi, conteggi) in
 * frasi già scritte: non calcolano orari, ordine del giro o sabati. Nessuna
 * funzione legge la data corrente: niente accesso al browser a livello di modulo.
 */

import type { Annuncio } from './annunci';
import { confrontoZona } from './listino';
import { AGENZIA, ZONE, type ZonaId } from './zone';

/* ================================================================== aiuti */

/** Separatore delle migliaia all'italiana, anche a 4 cifre: "1.100", "168.000". */
export function numero(valore: number): string {
  const segno = valore < 0 ? '-' : '';
  return segno + String(Math.round(Math.abs(valore))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Decimale all'italiana con una o due cifre: 8,6 → "8,60". */
function decimale(valore: number, cifre = 2): string {
  const [intero, dec] = Math.abs(valore).toFixed(cifre).split('.');
  return `${numero(Number(intero))},${dec ?? '00'}`;
}

/** Prezzo come sul foglio: "€ 168.000". */
export function euro(valore: number): string {
  return `€ ${numero(valore)}`;
}

/** "82 m²", "1.100 m²". */
export function mq(valore: number): string {
  return `${numero(valore)} m²`;
}

/** "2.050 €/m²" (vendita) oppure "8,60 €/m² al mese" (affitto). */
export function euroMq(valore: number, affitto = false): string {
  return affitto ? `${decimale(valore)} €/m² al mese` : `${numero(valore)} €/m²`;
}

/** Prezzo dell'annuncio: "€ 168.000" oppure "€ 690 al mese". */
export function prezzoAnnuncio(a: Pick<Annuncio, 'prezzo' | 'affitto'>): string {
  return a.affitto ? `${euro(a.prezzo)} al mese` : euro(a.prezzo);
}

/** Riga di spese per gli affitti sul foglio: "più 60 € di spese". null se non ci sono. */
export function speseAffitto(a: Pick<Annuncio, 'affitto' | 'speseMese'>): string | null {
  if (!a.affitto || a.speseMese === null) return null;
  return `più ${numero(a.speseMese)} € di spese`;
}

/** "09:30" → "9:30"; accetta anche minuti dalla mezzanotte (570 → "9:30"). */
export function orario(valore: string | number): string {
  if (typeof valore === 'number') {
    const h = Math.floor(valore / 60);
    const m = valore % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  }
  const [h, m] = valore.split(':');
  return `${Number(h)}:${m ?? '00'}`;
}

/** Numeri in parole per le frasi (1-4): "una casa", "due case". */
const PAROLE_CASE = ['nessuna', 'una', 'due', 'tre', 'quattro'] as const;
const PAROLE_VISITE = ['nessuna', 'una', 'due', 'tre', 'quattro'] as const;
const PAROLE_MASCHILI = ['nessun', 'un', 'due', 'tre', 'quattro'] as const;

/** "una casa", "due case", fino a quattro; oltre, in cifre. */
export function caseN(n: number): string {
  if (n === 1) return 'una casa';
  return `${PAROLE_CASE[n] ?? String(n)} case`;
}

/** "Una casa su quattro.", "Due case su quattro." */
export function suQuattro(n: number): string {
  const testo = n === 1 ? 'Una casa su quattro' : `${maiuscola(PAROLE_CASE[n] ?? String(n))} case su quattro`;
  return `${testo}.`;
}

/** Prima lettera maiuscola. */
export function maiuscola(testo: string): string {
  return testo.length > 0 ? testo.charAt(0).toUpperCase() + testo.slice(1) : testo;
}

/** Elenco all'italiana: "Torre", "Torre e Centro", "Torre, Centro e Porcia". */
export function elenco(voci: readonly string[]): string {
  if (voci.length <= 1) return voci[0] ?? '';
  return `${voci.slice(0, -1).join(', ')} e ${voci[voci.length - 1] ?? ''}`;
}

/* ================================================================== date */

export const MESI = [
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

/** Una data già calcolata in Europe/Rome da core/sabato.ts. mese: 1-12. */
export interface Giorno {
  giorno: number;
  mese: number;
  anno: number;
}

function meseNome(mese: number): string {
  return MESI[mese - 1] ?? '';
}

/** "sabato 3 ottobre 2026": la data della testata e del piede. */
export function sabatoLungo(d: Giorno): string {
  return `sabato ${d.giorno} ${meseNome(d.mese)} ${d.anno}`;
}

/** "sabato 3 ottobre": nelle frasi. */
export function sabatoBreve(d: Giorno): string {
  return `sabato ${d.giorno} ${meseNome(d.mese)}`;
}

/** "Sabato 3 ottobre": titolo della colonna del giro. */
export function sabatoTitolo(d: Giorno): string {
  return maiuscola(sabatoBreve(d));
}

/** "sabato 3 ott.": bottoni radio stretti del sabato a 375 px. */
export function sabatoCorto(d: Giorno): string {
  return `sabato ${d.giorno} ${meseNome(d.mese).slice(0, 3)}.`;
}

/**
 * Riga riservata nel prerender prima che la data sia calcolata (ux 6.14): si
 * stampa "sabato" e si riserva lo spazio della data più lunga.
 */
export const DATA_PRERENDER = {
  testo: 'sabato',
  /** Stringa più lunga possibile, per riservare la larghezza con un elemento invisibile. */
  riservaLarghezza: 'sabato 26 settembre 2026',
} as const;

/* ================================================================== meta e vetrina */

export const META = {
  /** <title>: 56 caratteri. */
  title: 'Concept 16 · EVIDENZIA, agenzia immobiliare | Ciceri Lab',
  /** meta description: 153 caratteri. Dice subito che l'agenzia è inventata. */
  description:
    'Concept di Ciceri Lab: la pagina degli annunci di un’agenzia immobiliare di Pordenone, inventata. Segna fino a quattro case e il giro di sabato è pronto.',
  ogTitle: 'EVIDENZIA, agenzia immobiliare. Un concept di Ciceri Lab',
  ogDescription: 'Passa l’evidenziatore sulle case che ti piacciono: diventano un giro di visite il sabato mattina. Un concept di Ciceri Lab.',
  ogImageAlt: 'Una pagina di annunci di case su carta grigia, con alcune righe segnate in rosa evidenziatore.',
} as const;

/** Proposta per la voce CONCEPTS in src/content/site.ts del sito vero. */
export const VETRINA = {
  tag: 'Agenzia immobiliare',
  title: 'EVIDENZIA',
  subtitle: 'Agenzia immobiliare · Pordenone',
  desc: 'La pagina delle case del sabato: passi l’evidenziatore sugli annunci che ti piacciono e diventano un giro di visite su una mappa vera, con gli orari già calcolati.',
  perche: 'Chi cerca casa ha sempre segnato gli annunci sul giornale: qui quel segno diventa una mattina di visite già organizzata.',
  mestieri: [
    'agenzia immobiliare',
    'immobiliare',
    'agente immobiliare',
    'agenzia',
    'mediatore immobiliare',
    'case',
    'compravendita',
    'vendita case',
    'affitti',
    'affitto',
    'appartamenti',
    'real estate',
  ],
} as const;

/* ================================================================== comuni */

export const COMUNI = {
  marchio: 'EVIDENZIA',
  cosaE: 'Case in vendita e in affitto a Pordenone e dintorni',
  /** Etichetta del ConceptBackButton condiviso (se si passa label). */
  tornaLab: 'Torna in Ciceri Lab',
  nuovaScheda: '(si apre in una nuova scheda)',
  /** Segno d'errore dei campi, in testo (ux 6.11): accompagnato sempre da una frase. */
  segnoErrore: '!',
  inventata: 'Attività inventata: annunci, prezzi, persone e recapiti sono di esempio.',
} as const;

export const SALTI = {
  annunci: 'Vai agli annunci',
  giro: 'Vai al tuo giro',
} as const;

/* ================================================================== rubriche */

export const RUBRICHE = {
  appartamenti: { nome: 'Appartamenti in vendita', breve: 'Appartamenti', ancora: 'appartamenti' },
  case: { nome: 'Case e villette', breve: 'Case e villette', ancora: 'case' },
  rustici: { nome: 'Rustici e terreni', breve: 'Rustici e terreni', ancora: 'rustici' },
  affitti: { nome: 'Affitti', breve: 'Affitti', ancora: 'affitti' },
} as const;

/* ================================================================== testata */

export const TESTATA = {
  /** h1: il nome. La riga "cosaE" va nell'h1 come span (ux 6.1). */
  titolo: 'EVIDENZIA',
  riga: 'Case in vendita e in affitto a Pordenone e dintorni',
  /** Nome accessibile del nav con il sommario (desktop) e della striscia (mobile). */
  sommarioAria: 'Rubriche',
  /** Titolo visibile del sommario, sopra i quattro link (desktop, colonna 4). */
  sommarioTitolo: 'In questa pagina',
  /** Voce corrente nella striscia mobile, solo per chi usa il lettore di schermo. */
  correnteSr: '(sei qui)',
  /** Orecchia in c6: gli orari del sabato in due righe. */
  orecchia: {
    titolo: 'Il sabato',
    testo: 'Siamo sempre aperti, dalle 9 alle 12:30. È il giorno dei giri.',
  },
  /** Nome accessibile della data: "Pagina di sabato 3 ottobre 2026". */
  dataAria: (d: Giorno) => `Pagina di ${sabatoLungo(d)}`,
} as const;

/* ================================================================== riquadro di testa */

export const RIQUADRO = {
  /**
   * h2, messaggio chiave, massimo due righe a 556 px. La parola "Segna" porta
   * il tratto dimostrativo: il componente compone
   * <span>{parolaTratto}</span>{restoPrimaRiga} <br/> {secondaRiga}.
   */
  parolaTratto: 'Segna',
  restoPrimaRiga: ' le case che vuoi vedere.',
  secondaRiga: 'Il giro di sabato lo prepariamo noi.',
  /** Il titolo intero, per aria-label o per chi non spezza. */
  titolo: 'Segna le case che vuoi vedere. Il giro di sabato lo prepariamo noi.',
  /** 18 parole (massimo 20). */
  testo: 'Fino a quattro case, un percorso, una mattina. Gli orari li calcoliamo noi, Sara ti richiama per confermare.',
  comeFunziona: {
    titolo: 'Come funziona',
    /** Foglio, da 640 px in su: il molo è in basso a destra. */
    foglio:
      'Passa l’evidenziatore sulla riga in grassetto di un annuncio, oppure premi Evidenzia. Poi Prepara il giro, qui in basso a destra.',
    /** Colonna, sotto i 640 px: la barra del giro è in alto. */
    colonna: 'Passa il dito in orizzontale sulla riga in grassetto, oppure premi Evidenzia. Poi Prepara il giro, qui in alto.',
    /** Versione corta per la colonna se il messaggio chiave non sta nella prima schermata (ux 5.4). */
    colonnaCorta: 'Passa il dito sulla riga in grassetto, o premi Evidenzia. Poi Prepara il giro, qui in alto.',
  },
} as const;

/* ================================================================== annuncio */

export const ANNUNCIO = {
  /** Testo visibile del bottone, sempre uguale (lo stato lo dicono aria-pressed e la riga del Rif.). */
  evidenzia: 'Evidenzia',
  /** Nome accessibile del bottone Evidenzia (costante, con aria-pressed). */
  evidenziaAria: (a: Pick<Annuncio, 'rif'>) => `Evidenzia per il giro, Rif. ${a.rif}`,
  /** Riga del riferimento: "Rif. 214". */
  rif: (a: Pick<Annuncio, 'rif'>) => `Rif. ${a.rif}`,
  /** Riga del riferimento quando è nel giro: segnale non cromatico visibile (trend R1). */
  rifNelGiro: (a: Pick<Annuncio, 'rif'>) => `Rif. ${a.rif}, nel giro`,
  /** Parola da mostrare dove serve una sola etichetta di stato. */
  nelGiro: 'Nel giro',
  /** Descrizione del bottone-attacco per il lettore di schermo (aria-describedby, facoltativa). */
  apreScheda: 'Apre la scheda della casa',
  /** Testo alternativo della foto a retino sul foglio, se photo-editor non ne dà uno. */
  retinoAlt: (a: Pick<Annuncio, 'attacco'>) => `Foto della casa: ${a.attacco}`,
  /** Quinto annuncio (evidenziatore scarico): riga sotto l'attacco per 8 s, e in live. */
  scarico: 'Il giro del sabato sta in una mattina: quattro case. Togline una per mettere questa.',
  scaricoLink: 'Vedi il tuo giro',
} as const;

/* ================================================================== molo e barra del giro */

export const BARRA = {
  /** Nome del landmark aside (ux 6.1). */
  aria: 'Il tuo giro',
  titolo: 'Il tuo giro',
  vuoto: 'Il giro è vuoto',
  pieno: 'Il giro è pieno',
  mandato: (d: Giorno) => `Giro mandato per ${sabatoBreve(d)}`,
  cambiato: 'Cambiato dopo l’invio',
  /** L'unico richiamo alla visita in tutto il sito. */
  prepara: 'Prepara il giro',
  /** Nome del gruppo dei posti: "Il tuo giro: due case su quattro". */
  gruppoAria: (n: number) =>
    n === 0 ? 'Il tuo giro: nessuna casa su quattro' : `Il tuo giro: ${caseN(n)} su quattro`,
  /** Posto pieno (desktop, bottone): porta all'annuncio. */
  postoAria: (posizione: number, a: Pick<Annuncio, 'attacco'>) =>
    `Casa ${posizione} del giro: ${a.attacco}. Vai all’annuncio`,
  /** Posto vuoto, solo testo nascosto. */
  postoLibero: 'posto libero',
  /** Riga delle zone del giro, in ordine: "Torre, Centro e Porcia". */
  zone: (zone: readonly ZonaId[]) => elenco(zone.map((z) => ZONE[z].nome)),
} as const;

export const VISTA = {
  gruppoAria: 'Vista della pagina',
  leggi: 'Leggi',
  intera: 'Pagina intera',
  /** Descrizione accessibile del foglio (aria-describedby) e aiuto accanto ai due bottoni. */
  spostarsi: 'Per spostarti nella pagina: rotella, frecce, oppure tieni premuto spazio e muovi il mouse.',
  /** Nome accessibile del foglio scorrevole. */
  foglioAria: 'Pagina degli annunci',
} as const;

export const HAI_SEGNATO = {
  titolo: 'Hai segnato',
  vuoto: 'Non hai ancora segnato niente.',
  tornaAnnunci: 'Torna agli annunci',
  vaiAria: (a: Pick<Annuncio, 'attacco' | 'rif'>) => `${a.attacco}, Rif. ${a.rif}: vai all’annuncio`,
} as const;

/* ================================================================== scheda della casa */

export const SCHEDA = {
  /** Barra in alto: bottone di chiusura. */
  rimetti: 'Rimetti nella pagina',
  rif: (a: Pick<Annuncio, 'rif'>) => `Rif. ${a.rif}`,
  foto: {
    regioneAria: (n: number) => `Foto della casa, ${n}`,
    precedente: 'Foto precedente',
    successiva: 'Foto successiva',
    contatore: (i: number, n: number) => `${i} di ${n}`,
    /** Testo alternativo di riserva se una foto non ha alt (non dovrebbe succedere). */
    altRiserva: (a: Pick<Annuncio, 'attacco'>, i: number) => `${a.attacco}, foto ${i}`,
  },
  /** Piano B: annuncio senza foto, o tutte le foto non caricate. */
  senzaFoto: 'Foto in agenzia, su richiesta.',
  /** Frase del confronto con la zona. null per box e zone senza media. */
  confronto: (a: Annuncio): string | null => {
    const c = confrontoZona(a);
    if (c === null) return null;
    return `${euroMq(c.annuncioMq, c.affitto)}: ${c.dove} la media ${c.cosa} è ${euroMq(c.mediaMq, c.affitto)}.`;
  },
  /** Titoli dei tre blocchi della consistenza (h3 con dl). */
  blocchi: { casa: 'La casa', costi: 'I costi', fuori: 'Fuori' },
  /** Titolo (h3) della descrizione e della zona. */
  descrizioneTitolo: 'Com’è',
  zonaTitolo: (a: Pick<Annuncio, 'zona'>) => `La zona: ${ZONE[a.zona].nome}`,
  planimetria: 'Planimetria catastale disponibile in agenzia.',
  /** Toggle: testo visibile costante, stato con aria-pressed e con la riga statoNelGiro. */
  toggle: 'Evidenzia per il giro',
  statoNelGiro: 'Questa casa è nel tuo giro di sabato.',
  statoFuori: 'Questa casa non è ancora nel tuo giro.',
  /** Nome del dialogo = attacco (aria-labelledby sull'h2), questa è la descrizione. */
  dialogoDescrizione: 'Scheda della casa',
} as const;

/* ================================================================== il giro del sabato */

export const GIRO = {
  titolo: 'Il giro del sabato',
  /** Titolo del dialogo con la data: "Il giro del sabato, sabato 3 ottobre". */
  titoloAria: (d: Giorno) => `Il giro del sabato, ${sabatoBreve(d)}`,
  chiudi: 'Torna alla pagina',
  /** Titolo della colonna (h3). */
  data: (d: Giorno) => sabatoTitolo(d),

  sabato: {
    legenda: 'Quale sabato',
    opzione: (d: Giorno) => sabatoBreve(d),
    opzioneCorta: (d: Giorno) => sabatoCorto(d),
    /** Dopo venerdì alle 12:00, o di sabato. */
    tardi: (proposto: Giorno) => `Per questo sabato è tardi: ti proponiamo ${sabatoBreve(proposto)}.`,
    chiuso: (chiuso: Giorno) => `${maiuscola(sabatoBreve(chiuso))} siamo chiusi.`,
    passato: (vecchio: Giorno) =>
      `Il giro di ${sabatoBreve(vecchio)} è passato. Le case segnate sono ancora qui: scegli un altro sabato.`,
  },
  partenza: {
    legenda: 'Partenza',
    opzione: (hhmm: string) => orario(hhmm),
    opzioneAria: (hhmm: string) => `Partenza alle ${orario(hhmm)}`,
  },
  daDove: {
    legenda: 'Da dove',
    agenzia: 'Dall’agenzia',
    primaCasa: 'Ci vediamo alla prima casa',
  },

  /** Riga della partenza nell'elenco: "Agenzia, via Mazzini". */
  tappaAgenzia: `Agenzia, ${AGENZIA.viaBreve}`,
  elencoAria: 'Tappe del giro, in ordine',
  /** Orario d'arrivo (in <time>) e nome accessibile della tappa. */
  arrivo: (hhmm: string | number) => orario(hhmm),
  tappaAria: (posizione: number, a: Pick<Annuncio, 'attacco'>, arrivo: string | number) =>
    `Tappa ${posizione}, ${a.attacco}, arrivo alle ${orario(arrivo)}`,
  /** Tragitto sotto la tappa: "12 minuti da Borgomeduna", "10 minuti dall’agenzia". */
  tragitto: (minuti: number, da: ZonaId | 'agenzia') =>
    da === 'agenzia' ? `${minuti} minuti dall’agenzia` : `${minuti} minuti da ${ZONE[da].nome}`,
  /** Prima tappa con "ci vediamo alla prima casa". */
  tragittoPrima: 'ci vediamo qui',
  /** Durata della visita, facoltativa accanto al prezzo. */
  visita: (minuti: number) => `visita di ${minuti} minuti`,
  prima: 'Prima',
  dopo: 'Dopo',
  togli: 'Togli',
  primaAria: (a: Pick<Annuncio, 'attacco'>) => `Sposta prima: ${a.attacco}`,
  dopoAria: (a: Pick<Annuncio, 'attacco'>) => `Sposta dopo: ${a.attacco}`,
  togliAria: (a: Pick<Annuncio, 'attacco'>) => `Togli dal giro: ${a.attacco}`,
  rimettiOrdine: 'Rimetti l’ordine più breve',
  onesta: 'Tragitti stimati in auto, in linea d’aria corretta. L’indirizzo esatto te lo diamo quando confermiamo.',
  fine: (hhmm: string | number) => `L’ultima visita finisce alle ${orario(hhmm)}.`,
  /**
   * Sforamento delle 12:30 (non blocca l'invio). partenzaPiuPresto: la
   * partenza più presto non ancora scelta ("09:00"), oppure null se è già 9:00.
   */
  sforamento: (fine: string | number, partenzaPiuPresto: string | null) =>
    partenzaPiuPresto === null
      ? `L’ultima visita finirebbe alle ${orario(fine)}: togli una casa, oppure mandalo così e Sara ti propone come dividerlo.`
      : `L’ultima visita finirebbe alle ${orario(fine)}: parti alle ${orario(partenzaPiuPresto)} o togli una casa.`,
  /** Riga d'intestazione dello sforamento per chi usa il lettore di schermo, prima del "!". */
  sforamentoSr: 'Attenzione:',
  casaSparita: 'Una casa che avevi segnato non è più in pagina: è stata venduta o ritirata.',
  caseSparite: (n: number) =>
    n === 1
      ? 'Una casa che avevi segnato non è più in pagina: è stata venduta o ritirata.'
      : `${maiuscola(caseN(n))} che avevi segnato non sono più in pagina: sono state vendute o ritirate.`,

  vuoto: {
    testo: 'Il giro è vuoto. Passa l’evidenziatore su un annuncio, o premi Evidenzia, e la casa comparirà qui.',
    daCuiPartire: 'Da cui partire',
    /** Etichetta sopra i nomi delle zone sulla mappa vuota, solo per il lettore di schermo. */
    zoneAria: 'Le zone degli annunci in pagina',
  },
  unaCasa: 'Una casa sola va benissimo. Il giro può arrivare a quattro.',

  /** Chi accompagna, riga facoltativa sotto l'ultima tappa. */
  accompagna: 'Ti accompagna Marta in città e Denis nei comuni intorno: chi dei due, te lo dice Sara quando ti richiama.',

  chiSei: {
    legenda: 'Chi sei',
    nome: 'Nome',
    telefono: 'Telefono',
    telefonoAiuto: 'Lo usiamo solo per confermare il giro.',
    email: 'Email (facoltativa)',
    nota: 'Una nota (facoltativa)',
    notaAiuto: 'Per esempio: veniamo in due, con un bambino piccolo.',
    /** Contatore della nota, solo negli ultimi 30 caratteri. */
    contatore: (restano: number) => (restano === 1 ? 'Resta 1 carattere.' : `Restano ${restano} caratteri.`),
    maxNota: 300,
    errori: {
      nomeVuoto: 'Scrivi il tuo nome: Sara ti chiama così.',
      telefonoVuoto: 'Scrivi un numero per la conferma: ti chiamiamo solo per il giro.',
      telefonoNonValido: 'Questo numero non sembra completo. Controlla le cifre.',
      emailNonValida: 'Questa email non sembra completa: controlla la chiocciola e il punto.',
      notaLunga: 'La nota è troppo lunga: al massimo 300 caratteri.',
      /** Riepilogo in cima al modulo, solo con 2 o più errori. campi: nomi in minuscolo. */
      riepilogo: (campi: readonly string[]) =>
        `Controlla ${PAROLE_MASCHILI[campi.length] ?? String(campi.length)} campi: ${elenco(campi)}.`,
      nomiCampi: { nome: 'nome', telefono: 'telefono', email: 'email', nota: 'nota' },
    },
  },

  /** Cosa succede dopo, in una riga sopra il bottone. */
  promessa:
    'Sara ti richiama entro venerdì alle 18. Se una casa nel frattempo è stata venduta, te lo dice e ne proponiamo un’altra.',
  manda: 'Manda il giro',
  /** Invio in corso: il bottone cambia testo e si disattiva. */
  mando: 'Mando il giro…',

  successo: {
    frase: 'Giro mandato. Sara ti richiama entro venerdì alle 18 per confermarlo.',
    /** Il modulo si chiude in una riga; ultime: ultime due cifre del telefono. */
    aNome: (nome: string, ultime: string) => `Mandato a nome di ${nome}, telefono che finisce con ${ultime}.`,
    cambia: 'Cambia',
    cambiaAria: 'Cambia nome o telefono',
    /** Riaperto dopo il successo: la riga in cima, con la data. */
    riaperto: (d: Giorno) => `Giro mandato per ${sabatoBreve(d)}. Sara ti richiama entro venerdì alle 18 per confermarlo.`,
  },
  cambiatoDopo: 'Hai cambiato il giro dopo averlo mandato. Mandalo di nuovo e Sara vedrà l’ultimo.',

  calendario: {
    link: 'Aggiungi al calendario',
    aria: (n: number) => `Aggiungi al calendario, file con ${n === 1 ? 'una visita' : `${PAROLE_VISITE[n] ?? String(n)} visite`}`,
    scaricato: (n: number) =>
      n === 1
        ? 'Il file ha una visita: aprilo per metterla nel tuo calendario.'
        : `Il file ha ${PAROLE_VISITE[n] ?? String(n)} visite: aprilo per metterle nel tuo calendario.`,
  },

  /** Invio fallito: prima + link "chiamaci" (tel:) + dopo. Nessun numero in vista. */
  fallito: {
    prima: 'Non è partito. Il giro è salvato su questo telefono: ',
    link: 'chiamaci',
    linkAria: 'Chiama l’agenzia',
    dopo: ' e lo confermiamo a voce.',
    href: AGENZIA.telefonoHref,
  },
} as const;

/* ================================================================== mappa */

export const MAPPA = {
  /** Titolo nascosto della regione mappa (ux 6.10). */
  titoloSr: 'Mappa del giro: le stesse tappe dell’elenco',
  caricamento: 'Carico la mappa di Pordenone.',
  errore: 'La mappa non si carica. Il giro resta valido: ecco le tappe in ordine.',
  apriOsm: 'Apri la zona su openstreetmap.org',
  /** URL della zona su openstreetmap.org (link dell'errore). */
  osmUrl: (lat: number, lng: number, zoom: number) =>
    `https://www.openstreetmap.org/#map=${zoom}/${lat.toFixed(4)}/${lng.toFixed(4)}`,
  avvicina: 'Avvicina',
  allontana: 'Allontana',
  /** Attribuzione obbligatoria, sempre visibile (il link va a openstreetmap.org/copyright). */
  attribuzione: '© OpenStreetMap contributors',
  attribuzioneUrl: 'https://www.openstreetmap.org/copyright',
  /** Numero dentro il marcatore rosa (1-4) e lettera dell'agenzia. */
  siglaAgenzia: 'A',
  marcatoreAria: (posizione: number, zona: ZonaId, arrivo: string | number) =>
    `Tappa ${posizione}, ${ZONE[zona].nome}, arrivo alle ${orario(arrivo)}`,
  agenziaAria: (partenza: string | number) => `Partenza, agenzia in ${AGENZIA.viaBreve}, ${orario(partenza)}`,
  /** Etichetta di una zona sulla mappa vuota. */
  zonaEtichetta: (zona: ZonaId) => ZONE[zona].nome,
} as const;

/* ================================================================== file .ics */

export const ICS = {
  nomeFile: 'giro-del-sabato.ics',
  nomeCalendario: 'Il giro del sabato, EVIDENZIA',
  titolo: (a: Pick<Annuncio, 'attacco' | 'rif'>) => `Visita: ${a.attacco} (Rif. ${a.rif})`,
  luogo: (zona: ZonaId) => ZONE[zona].luogo,
  descrizione: (a: Pick<Annuncio, 'rif' | 'attacco'>) =>
    `${a.attacco}, Rif. ${a.rif}. Indirizzo esatto alla conferma del giro. EVIDENZIA è un’agenzia di esempio, in un concept di Ciceri Lab.`,
  /** Primo evento facoltativo, se si parte dall'agenzia. */
  titoloPartenza: 'Partenza del giro dall’agenzia',
  luogoPartenza: AGENZIA.indirizzoRiga,
} as const;

/* ================================================================== regione aria-live */

/**
 * Voci della regione aria-live="polite" unica del giro. Si sostituiscono, non
 * si accumulano. Funzioni pure: ricevono l'annuncio e i conteggi già calcolati.
 */
export function voceAggiunto(a: Pick<Annuncio, 'attacco'>, quanti: number): string {
  return `Aggiunto al giro: ${a.attacco}. ${suQuattro(quanti)}`;
}

export function voceTolto(a: Pick<Annuncio, 'attacco'>, quanti: number): string {
  return quanti === 0 ? `Tolto dal giro: ${a.attacco}. Il giro è vuoto.` : `Tolto dal giro: ${a.attacco}. ${suQuattro(quanti)}`;
}

export const LIVE = {
  aggiunto: voceAggiunto,
  tolto: voceTolto,
  scarico: ANNUNCIO.scarico,
  daUrl: (n: number) =>
    n === 1
      ? 'Nel tuo giro c’è già una casa, segnata dal link che hai aperto.'
      : `Nel tuo giro ci sono già ${caseN(n)}, segnate dal link che hai aperto.`,
  vistaIntera: 'Vista Pagina intera: tutta la pagina in uno schermo.',
  vistaLeggi: 'Vista Leggi.',
  riordino: (a: Pick<Annuncio, 'zona'>, posizione: number, arrivo: string | number) =>
    `${ZONE[a.zona].nome} ora è la tappa ${posizione}, arrivo alle ${orario(arrivo)}.`,
  ordineBreve: 'Ordine più breve rimesso.',
  nuovaFine: (fine: string | number) => `L’ultima visita finisce alle ${orario(fine)}.`,
  mappaErrore: 'La mappa non si carica. Le tappe sono nell’elenco.',
  invioInCorso: 'Mando il giro…',
  successo: GIRO.successo.frase,
  fallito: 'Non è partito. Il giro è salvato su questo telefono: chiamaci e lo confermiamo a voce.',
} as const;

/* ================================================================== box redazionali */

export const VENDI = {
  titolo: 'Vendi casa?',
  promessa: 'Veniamo a vederla, ti diciamo quanto vale e perché. Gratis, senza impegno.',
  cosaServeTitolo: 'Cosa serve',
  cosaServe: [
    'l’atto di provenienza;',
    'visura e planimetria catastale;',
    'l’APE, l’attestato di prestazione energetica: indicativamente 150-250 € per un appartamento, 250-400 € per una casa;',
    'la conformità urbanistica e catastale.',
  ],
  seManca: 'Se qualcosa manca, lo troviamo insieme al tuo tecnico. Una regolarizzazione catastale semplice parte da 400 €.',
  comeTitolo: 'Come lavoriamo',
  come: [
    'Controlliamo i documenti prima di pubblicare: i problemi si scoprono adesso, non al rogito.',
    'Incarico di 4 mesi, rinnovabile. L’esclusiva è facoltativa.',
    'Le visite si fanno il sabato, con persone che hanno già letto tutto l’annuncio: niente curiosi.',
  ],
  provvigioneTitolo: 'Quanto costiamo',
  provvigione:
    'Per chi vende: 2,5% più IVA sul prezzo di vendita, minimo € 2.500 più IVA per le case sotto € 100.000. Per chi compra: 3% più IVA. Te lo diciamo prima di firmare.',
  affitti: 'Per gli affitti: una mensilità più IVA per ciascuna parte; mezza per box e posti auto.',
  chiama: 'Chiama',
  chiamaAria: 'Chiama l’agenzia per una valutazione',
  passa: 'Passa in agenzia',
  passaAria: 'Passa in agenzia: indirizzo e orari',
} as const;

export const AGENZIA_BOX = {
  titolo: 'L’agenzia',
  storia:
    'Marta ha aperto EVIDENZIA con un’idea sola: fare le visite il sabato mattina, quando le coppie che lavorano sono libere tutte e due. Il nome viene dai clienti, che arrivavano con la pagina delle case già segnata.',
  persone: [
    { nome: 'Marta', ruolo: 'segue le vendite in città e fa le valutazioni per chi vende.' },
    { nome: 'Denis', ruolo: 'segue case, villette e rustici nei comuni intorno.' },
    { nome: 'Sara', ruolo: 'è in agenzia tutti i giorni: affitti, telefono e agenda dei giri.' },
  ],
  abilitati: 'Agenti immobiliari abilitati.',
  dove: 'Dove',
  indirizzo: AGENZIA.via,
  citta: `${AGENZIA.cap} ${AGENZIA.citta}`,
  parcheggio: 'Parcheggi a pagamento in centro, a pochi minuti a piedi.',
  maps: 'Apri in Maps',
  mapsAria: 'Apri in Maps via Mazzini a Pordenone',
  mapsHref: AGENZIA.mapsUrl,
  orariTitolo: 'Quando',
  orari: [
    { giorni: 'Da lunedì a venerdì', ore: '9:00-12:30 e 15:00-19:00' },
    { giorni: 'Sabato', ore: '9:00-12:30' },
    { giorni: 'Domenica', ore: 'chiuso' },
  ],
  /** In grassetto, non a colori. */
  sabato: 'Il sabato siamo sempre aperti: è il giorno dei giri.',
  settimana: 'Visite in settimana su appuntamento, anche dopo le 18.',
  zona: 'Lavoriamo a Pordenone e nei comuni della prima cintura: Cordenons, Porcia, Roveredo in Piano, Fiume Veneto. Più in là non andiamo, perché non ci sta nel giro.',
  chiama: 'Chiama',
  chiamaAria: 'Chiama l’agenzia',
  chiamaHref: AGENZIA.telefonoHref,
  scrivi: 'Scrivi',
  scriviAria: 'Scrivi una email all’agenzia',
  scriviHref: AGENZIA.emailHref,
} as const;

export const HANNO_COMPRATO = {
  titolo: 'Hanno comprato con noi',
  /** Corsivo Newsreader. Virgolette basse aggiunte dal componente o già qui: sono qui. */
  citazioni: [
    {
      testo: '«Quattro case in una mattina, con i bambini dai nonni. La terza era quella.»',
      chi: 'Elisa e Matteo, Rorai Grande',
    },
    {
      testo: '«Ci hanno detto subito che il tetto andava rifatto. L’abbiamo messo nel conto e abbiamo comprato lo stesso.»',
      chi: 'Loris e Graziella, Cordenons',
    },
  ],
} as const;

/* ================================================================== piede */

export const PIEDE = {
  pagina: 'Pagina 1',
  testata: 'EVIDENZIA',
  /** La data si compone con sabatoLungo(d). */
  data: (d: Giorno) => sabatoLungo(d),
  fotoTitolo: 'Foto',
  /** Credito di una foto (autore e link da assets/foto/index.ts). */
  credito: (autore: string) => `${autore} su Unsplash`,
  creditoAria: (autore: string) => `Foto di ${autore} su Unsplash (si apre in una nuova scheda)`,
  mappaCredito: 'Mappa del giro: © OpenStreetMap contributors.',
  inventata: COMUNI.inventata,
  conceptDi: 'Un concept di Ciceri Lab',
  conceptDiHref: 'https://cicerilab.com',
} as const;

/* ================================================================== tutto insieme */

export const TESTI = {
  meta: META,
  vetrina: VETRINA,
  comuni: COMUNI,
  salti: SALTI,
  rubriche: RUBRICHE,
  testata: TESTATA,
  riquadro: RIQUADRO,
  annuncio: ANNUNCIO,
  barra: BARRA,
  vista: VISTA,
  haiSegnato: HAI_SEGNATO,
  scheda: SCHEDA,
  giro: GIRO,
  mappa: MAPPA,
  ics: ICS,
  live: LIVE,
  vendi: VENDI,
  agenzia: AGENZIA_BOX,
  hannoComprato: HANNO_COMPRATO,
  piede: PIEDE,
  dataPrerender: DATA_PRERENDER,
} as const;

export type Testi = typeof TESTI;
export default TESTI;
