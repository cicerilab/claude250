/**
 * CONTROPELO · tutti i tempi e le soglie del movimento (motion-designer).
 *
 * Unica fonte per chi muove qualcosa: vapore (section-builder-vapore),
 * parete, lista, mensola, interaction. Nessun section-builder scrive numeri
 * di tempo propri: se ne manca uno, lo chiede al motion-designer.
 * I tempi che servono al CSS sono ripetuti identici in motion.css come
 * variabili --ctp-dur-* (se ne cambi uno, cambialo anche lì).
 *
 * Tutti i valori sono in millisecondi, salvo dove indicato.
 *
 * Modulo puro: nessun accesso a window/document, sicuro per il prerender.
 */

import { clamp, clamp01, condensa, inversa, lerp, sale, smoothstep01 } from './easing';

/* ------------------------------------------------------------------ */
/* Tempi di interfaccia e di pennarello                                */
/* ------------------------------------------------------------------ */

export const TEMPI = {
  /* La parete */
  /** Pan orizzontale tra due specchi (girare la testa). Curva `gira`. */
  pan: 650,
  /** Con riduzione del movimento il pan diventa questa dissolvenza tra i due specchi. */
  dissolviSpecchio: 200,
  /** Tornando su uno specchio, il vapore recupera il tempo passato in questa durata (mai uno scatto). */
  attivaSpecchio: 600,

  /* I modi del vapore (interruttore "Specchio pulito") */
  /** Il vapore sparisce da tutti gli specchi. */
  modoFermo: 900,
  /** Idem con riduzione del movimento. */
  modoFermoRidotto: 200,
  /** Il vapore torna (interruttore spento): risale dal basso come all'apertura. */
  modoVivo: 2400,
  /** Idem con riduzione del movimento: dissolvenza uniforme, senza fronte. */
  modoVivoRidotto: 1200,

  /* Zone che il vapore non copre */
  /** Ovale attorno all'elemento col fuoco da tastiera. */
  fuocoPulisce: 300,
  /** Zone grandi (lista durante la scrittura, pannello Informazioni): mai sotto 300 ms su grandi aree. */
  zonaGrande: 450,
  /** Il tuo nome dopo la prenotazione: il vapore gli passa dietro come alone. */
  alone: 600,

  /* Lo straccio (cambio giorno, cambio fascia, cambio faccia su mobile) */
  /** La passata che cancella. Curva `straccio`. */
  straccioVia: 400,
  /** Sfasamento tra una riga e la successiva quando la lista si riscrive. */
  straccioRiga: 60,
  /** Quanto impiega una riga a scriversi. Curva `pennarello`. */
  rigaScrive: 260,
  /** Riscrittura completa mai più lunga di così (le righe si stringono, il sabato ha 18 righe). */
  riscritturaMassima: 1100,
  /** Con riduzione del movimento: dissolvenza di uscita e di entrata (200 ms in tutto). */
  straccioRidotto: 100,
  /** Tra l'inizio di due stracci passano almeno 500 ms (anti-lampeggio, ux 8.12). */
  codaStracci: 500,

  /* Il pennarello */
  /** Il tuo nome che si scrive durante l'invio (nomi fino a 6 lettere). Vedi `durataScrittura`. */
  scrittura: 600,
  /** Ogni lettera oltre la sesta aggiunge questo tempo. */
  scritturaPerLettera: 30,
  /** Nessun nome impiega più di così (l'invio simulato dura 900 ms). */
  scritturaMassima: 900,
  /** Lettere scritte nel tempo base. */
  scritturaLettereBase: 6,
  /** Segni brevi: il trattino che torna dopo "cancella", il tratteggio della seconda mezz'ora. */
  scritturaBreve: 260,
  /** Il tratto turchese sotto il tuo nome. Curva `sottolinea`. */
  sottolinea: 400,
  /** Pausa tra la fine della scrittura e la sottolineatura (il barbiere alza il pennarello). */
  ritardoSottolinea: 80,
  /** Lo straccio che toglie il tuo nome ("cancella"). */
  cancella: 400,
  /** Il nome che sbiadisce quando l'invio fallisce. */
  sbiadisce: 400,

  /* La raccolta delle righe lontane (riga di scrittura aperta) */
  /** Le righe lontane svaniscono (opacità) prima di raccogliersi. */
  raccoltaVia: 180,
  /** Le righe che restano si stringono (FLIP, solo transform). Curva `raccolta`. */
  raccoltaFlip: 300,
  /** Chiudendo la riga, le righe lontane ricompaiono. */
  riappare: 220,

  /* Interfaccia */
  /** La riga di scrittura che segue la tastiera virtuale. Curva `tastiera`. */
  tastiera: 250,
  /** La riga di stato che esce da dietro la mensola (mobile). Curva `striscia`. */
  strisciaEntra: 320,
  /** La riga di stato che rientra. */
  strisciaEsce: 240,
  /** Il suggerimento del gesto sulla mensola compare. */
  suggerimentoEntra: 320,
  /** Il suggerimento sparisce al primo gesto. */
  suggerimentoEsce: 240,

  /* Durata dei messaggi (ux §7) */
  /** Messaggi informativi della riga di stato. */
  rigaStato: 8000,
  /** "Cancellato. Rimettilo" resta per questo tempo. */
  rimettilo: 10000,
} as const;

export type NomeTempo = keyof typeof TEMPI;
export type Tempi = { readonly [K in NomeTempo]: number };

/**
 * I tempi da usare davvero, secondo la riduzione del movimento.
 * Con `ridotto` ogni movimento va allo stato finale subito (0 ms), tranne:
 * - le dissolvenze della direzione (specchio 200 ms, straccio 100 + 100 ms,
 *   modi del vapore);
 * - le zone pulite dal vapore (sono dissolvenze, e il vapore esiste solo se
 *   l'utente ha spento "Specchio pulito");
 * - la coda anti-lampeggio e la durata dei messaggi.
 */
export function tempiEffettivi(ridotto: boolean): Tempi {
  if (!ridotto) return { ...TEMPI, dissolviSpecchio: 0 };
  return {
    ...TEMPI,
    pan: 0,
    dissolviSpecchio: TEMPI.dissolviSpecchio,
    modoFermo: TEMPI.modoFermoRidotto,
    modoVivo: TEMPI.modoVivoRidotto,
    straccioVia: TEMPI.straccioRidotto,
    straccioRiga: 0,
    rigaScrive: TEMPI.straccioRidotto,
    riscritturaMassima: TEMPI.straccioRidotto,
    scrittura: 0,
    scritturaPerLettera: 0,
    scritturaMassima: 0,
    scritturaBreve: 0,
    sottolinea: 0,
    ritardoSottolinea: 0,
    cancella: 0,
    sbiadisce: 0,
    raccoltaVia: 0,
    raccoltaFlip: 0,
    riappare: 0,
    tastiera: 0,
    strisciaEntra: 0,
    strisciaEsce: 0,
    suggerimentoEntra: 0,
    suggerimentoEsce: 0,
  };
}

/**
 * Quanto impiega il tuo nome a scriversi: 600 ms fino a 6 lettere, 30 ms per
 * ogni lettera in più, mai oltre 900 ms. Il builder lo scrive una volta al
 * render come `--ctp-scrivi` sull'elemento del nome (vedi motion.css).
 */
export function durataScrittura(nome: string, ridotto = false): number {
  if (ridotto) return 0;
  const lettere = Array.from(nome.trim()).length;
  const extra = Math.max(0, lettere - TEMPI.scritturaLettereBase) * TEMPI.scritturaPerLettera;
  return Math.min(TEMPI.scritturaMassima, TEMPI.scrittura + extra);
}

/**
 * Sfasamento tra due righe che si riscrivono: 60 ms, ridotto quando le righe
 * sono tante perché la riscrittura intera non superi `riscritturaMassima`.
 */
export function passoRiga(righe: number, ridotto = false): number {
  if (ridotto || righe <= 1) return 0;
  const disponibile = TEMPI.riscritturaMassima - TEMPI.rigaScrive;
  return Math.min(TEMPI.straccioRiga, disponibile / (righe - 1));
}

/** Durata complessiva della riscrittura di `righe` righe (dall'inizio della prima alla fine dell'ultima). */
export function durataRiscrittura(righe: number, ridotto = false): number {
  if (ridotto) return TEMPI.straccioRidotto;
  const n = Math.max(1, Math.floor(righe));
  return Math.round((n - 1) * passoRiga(n) + TEMPI.rigaScrive);
}

/* ------------------------------------------------------------------ */
/* Apertura (creative-director §6.3, ux §5.1)                          */
/* ------------------------------------------------------------------ */

export const APERTURA = {
  /** Il vapore non sale prima di così dal montaggio: prima si legge il listino. */
  attesaMinima: 500,
  /** Se i font tardano, si parte comunque dopo questo tempo. */
  attesaFontMassima: 2500,
  /** Se il canvas non ha ancora deciso (on/off), si rinuncia all'apertura dopo questo tempo. */
  attesaCanvasMassima: 3000,
  /** Il vapore sale dal basso e copre il vetro. Curva `sale`, fronte con banda `RITORNO.bandaSalita`. */
  sale: 2400,
  /** Il vapore si posa prima della passata. */
  pausa: 700,
  /** La passata automatica, col palmo. Curva `palmo`. */
  passata: 700,
  /** Raggio della passata in px CSS (il palmo). */
  raggioPassata: 60,
  /** Raggio della passata su vetri stretti (mobile). */
  raggioPassataStretto: 44,
  /** Sotto questa larghezza del vetro (px CSS) la passata è orizzontale e più stretta. */
  larghezzaStretta: 640,
} as const;

/** Istante (ms dall'inizio della salita) in cui parte la passata. */
export const INIZIO_PASSATA = APERTURA.sale + APERTURA.pausa;

/* ------------------------------------------------------------------ */
/* Il vapore che torna (creative-director §6.2, trend-researcher P1)    */
/* ------------------------------------------------------------------ */

/**
 * Il ritorno del vapore in un punto dipende da quanto tempo è passato da
 * quando è stato pulito (la sua "età") e dalla **nucleazione** del punto
 * (0..1, da una mappa di rumore statica a bassa frequenza: 1 = le goccioline
 * si riformano qui per prime).
 *
 * Per ogni punto:
 * - **pausa di pulito**: per `inizio` ms il vetro resta pulito pieno
 *   (3,6 s dove nuclea per primo, 5,2 s dove nuclea per ultimo): il tempo
 *   di leggere un prezzo;
 * - **ritorno**: in `durata` ms il vapore torna con la curva `condensa`
 *   (9,6 s dove nuclea per primo, 12,4 s dove nuclea per ultimo).
 *
 * Risultato: una zona pulita comincia a velarsi a chiazze dopo 3,6 s, a 10 s
 * le chiazze sono al 79% e il resto al 32%, a 15,2 s le chiazze sono chiuse e
 * a 17,6 s è tutto coperto in modo uniforme. In ogni punto il vapore sale e
 * basta: nessuna oscillazione, nessun respiro.
 */
export const RITORNO = {
  /** Pausa di pulito pieno dove il vapore nuclea per ultimo (nucleazione 0). */
  inizioLento: 5200,
  /** Pausa di pulito pieno dove nuclea per primo (nucleazione 1). */
  inizioSvelto: 3600,
  /** Durata del ritorno dove nuclea per ultimo. */
  durataLenta: 12400,
  /** Durata del ritorno dove nuclea per primo. */
  durataSvelta: 9600,
  /**
   * Età oltre la quale ogni punto è coperto del tutto (inizioLento + durataLenta).
   * È il `ritornoVapore` del tech-architect: dopo questo tempo dall'ultimo
   * tratto il motore può fermare il ticker.
   */
  ritornoVapore: 17600,
  /** Banda del fronte che sale nell'apertura, in frazione dell'altezza del vetro. */
  bandaSalita: 0.35,
  /** Grana della mappa di nucleazione: macchie larghe tra questi due valori (px CSS). */
  macchiaMinima: 80,
  macchiaMassima: 160,
  /** Livelli di nucleazione nelle tabelle precalcolate. */
  livelli: 16,
  /** Passo temporale delle tabelle precalcolate. */
  passoTabella: 16,
} as const;

export interface TrattoRitorno {
  /** ms di pulito pieno. */
  readonly inizio: number;
  /** ms del ritorno. */
  readonly durata: number;
}

/** Pausa e durata del ritorno per una nucleazione 0..1. */
export function trattoRitorno(nucleazione: number): TrattoRitorno {
  const n = clamp01(nucleazione);
  return {
    inizio: lerp(RITORNO.inizioLento, RITORNO.inizioSvelto, n),
    durata: lerp(RITORNO.durataLenta, RITORNO.durataSvelta, n),
  };
}

/**
 * Quanto vapore c'è in un punto (0 = pulito, 1 = vapore pieno di quel punto,
 * che poi il motore moltiplica per la densità 0,78 in alto / 0,9 in basso di
 * tokens.ts) dopo `etaMs` dall'ultima pulizia.
 * Monotona non decrescente in `etaMs`.
 */
export function nebbiaNelTempo(etaMs: number, nucleazione: number): number {
  if (!(etaMs > 0)) return 0;
  const { inizio, durata } = trattoRitorno(nucleazione);
  return condensa((etaMs - inizio) / durata);
}

/**
 * L'inverso: quale età dà quella quantità di vapore. Serve al pennello per
 * le pulizie parziali (bordo morbido del pennello, pulizia leggera): un punto
 * pulito con forza `s` (0..1) prende come istante di pulizia
 * `ora - etaPerNebbia(1 - s, n)`, e se il punto era già più pulito resta
 * com'era (si tiene l'istante più recente). Così il bordo della traccia
 * torna per primo, il centro resta pulito per tutta la pausa.
 * Per `nebbia` 0 restituisce 0; per `nebbia` 1 restituisce l'età di copertura.
 */
export function etaPerNebbia(nebbia: number, nucleazione: number): number {
  const f = clamp01(nebbia);
  if (f <= 0) return 0;
  const { inizio, durata } = trattoRitorno(nucleazione);
  if (f >= 1) return inizio + durata;
  return inizio + durata * inversa(condensa, f);
}

/**
 * Il fronte del vapore che sale nell'apertura (e quando si spegne
 * "Specchio pulito"). `y` = posizione verticale nel vetro (0 in alto, 1 in
 * basso), `t` = avanzamento nel tempo 0..1 (il motore passa il tempo
 * lineare: la curva `sale` è applicata qui).
 * Restituisce il fattore 0..1 per cui moltiplicare il vapore di quel punto.
 * In ogni punto il fattore cresce in modo lineare mentre la banda lo
 * attraversa: nessun lampo, nessuna linea netta.
 */
export function vaporeInAlzata(y: number, t: number): number {
  const b = RITORNO.bandaSalita;
  const fronte = sale(clamp01(t)) * (1 + b);
  return clamp01((fronte - (1 - clamp01(y))) / b);
}

/**
 * Il recupero del tempo passato quando uno specchio torna attivo (o la
 * scheda torna visibile): invece di saltare all'età vera, il motore usa un
 * orologio che raggiunge quello vero in `durata` ms (600).
 * `ora` = adesso, `inizio` = quando è partito il recupero, `arretrato` =
 * quanti ms erano rimasti indietro in quel momento.
 * L'orologio è sempre crescente e coincide con `ora` alla fine.
 */
export function tempoRecuperato(ora: number, inizio: number, arretrato: number, durata: number = TEMPI.attivaSpecchio): number {
  if (durata <= 0 || arretrato <= 0) return ora;
  const p = clamp01((ora - inizio) / durata);
  return ora - arretrato * (1 - smoothstep01(p));
}

/** Tabelle precalcolate per il motore del vapore (una volta sola, alla registrazione). */
export interface TabelleNebbia {
  readonly passoMs: number;
  readonly livelli: number;
  /** Passi temporali per livello: l'ultimo vale sempre 255. */
  readonly passi: number;
  /** nebbia[livello * passi + indiceTempo] = vapore 0..255. indiceTempo = floor(eta / passoMs), limitato a passi - 1. */
  readonly nebbia: Uint8Array;
  /** eta[livello * 256 + v] = età in ms che dà vapore v/255 (per le pulizie parziali). */
  readonly eta: Float32Array;
}

/**
 * Costruisce le tabelle di `nebbiaNelTempo` ed `etaPerNebbia` per `livelli`
 * valori di nucleazione (livello k = nucleazione k / (livelli - 1)).
 * Circa 17 KB con i valori di default. Pura: nessun accesso al browser.
 */
export function costruisciTabelleNebbia(passoMs: number = RITORNO.passoTabella, livelli: number = RITORNO.livelli): TabelleNebbia {
  const passo = Math.max(1, passoMs);
  const nLivelli = Math.max(2, Math.floor(livelli));
  const passi = Math.ceil(RITORNO.ritornoVapore / passo) + 2;
  const nebbia = new Uint8Array(nLivelli * passi);
  const eta = new Float32Array(nLivelli * 256);
  for (let k = 0; k < nLivelli; k += 1) {
    const n = k / (nLivelli - 1);
    for (let i = 0; i < passi; i += 1) {
      nebbia[k * passi + i] = Math.round(nebbiaNelTempo(i * passo, n) * 255);
    }
    nebbia[k * passi + passi - 1] = 255;
    for (let v = 0; v < 256; v += 1) {
      eta[k * 256 + v] = etaPerNebbia(v / 255, n);
    }
  }
  return { passoMs: passo, livelli: nLivelli, passi, nebbia, eta };
}

/* ------------------------------------------------------------------ */
/* Le gocce (creative-director §6.1)                                   */
/* ------------------------------------------------------------------ */

export const GOCCE = {
  /** Mai più di due gocce insieme. */
  massimo: 2,
  /** Mai più di una goccia ogni 1,5 s. */
  intervalloMinimo: 1500,
  /** Probabilità che un tratto finito lasci una goccia (se i limiti lo consentono). */
  probabilita: 0.35,
  /** La goccia parte dopo questo ritardo dalla fine del tratto (l'acqua si raccoglie): minimo e massimo. */
  ritardoMinimo: 500,
  ritardoMassimo: 1200,
  /** Velocità media della corsa, px CSS al secondo: minima e massima. Curva `goccia`. */
  velocitaMinima: 30,
  velocitaMassima: 40,
  /** Lunghezza della corsa, px CSS: minima e massima. */
  corsaMinima: 60,
  corsaMassima: 140,
  /** Larghezza della scia pulita, px CSS. */
  larghezzaScia: 5,
  /** Raggio della testa della goccia, px CSS. */
  raggioTesta: 3.5,
  /** La goccia parte dal bordo basso della traccia: questa frazione del raggio sotto il centro dell'ultimo punto più basso. */
  partenzaSottoCentro: 0.85,
} as const;

/** Durata della corsa di una goccia (ms) da lunghezza (px) e velocità media (px/s). */
export function durataGoccia(corsaPx: number, velocitaPxS: number): number {
  const v = clamp(velocitaPxS, GOCCE.velocitaMinima, GOCCE.velocitaMassima);
  return (Math.max(0, corsaPx) / v) * 1000;
}

/**
 * Da un numero 0..1 (il PRNG del motore) ai parametri di una goccia.
 * Tre numeri indipendenti: ritardo, velocità, corsa.
 */
export function parametriGoccia(a: number, b: number, c: number): { ritardo: number; velocita: number; corsa: number; durata: number } {
  const ritardo = lerp(GOCCE.ritardoMinimo, GOCCE.ritardoMassimo, clamp01(a));
  const velocita = lerp(GOCCE.velocitaMinima, GOCCE.velocitaMassima, clamp01(b));
  const corsa = lerp(GOCCE.corsaMinima, GOCCE.corsaMassima, clamp01(c));
  return { ritardo, velocita, corsa, durata: durataGoccia(corsa, velocita) };
}
