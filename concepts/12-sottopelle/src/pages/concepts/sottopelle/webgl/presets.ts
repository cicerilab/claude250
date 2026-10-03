/**
 * SOTTOPELLE · parametri del materiale "inchiostro in acqua".
 *
 * Unica fonte dei numeri dello shader della tessera: programma.ts li inietta
 * come `#define` in testa a vertex e fragment (vedi definizioniGLSL()).
 * Le lunghezze sono in MODULI della parete (uModulo = px fisici di un modulo),
 * così l'inchiostro ha la stessa grana su una tessera 1x1 e su una 2x3, e a
 * 375 px come a 2560 px.
 *
 * Nessun colore qui: nero e grigio sfumato arrivano da styles/tokens.ts
 * tramite le uniform uNero e uGrigio. Nessun accesso al browser.
 */

/** Lo sboccio: la nuvola che si apre dal punto d'ingresso e si posa nella foto. */
export const INCHIOSTRO = {
  /** Esponente della frenata del fronte: avanzamento = 1 − (1 − t)^frenata (t lineare nel tempo). */
  frenata: 1.8,
  /** Allungamento iniziale della nuvola nella direzione d'ingresso (1 = tonda). */
  aniso: 1.6,
  /** Quanto la nuvola si arrotonda finendo (0 = resta allungata, 1 = tonda alla fine). */
  arrotonda: 0.55,
  /** Ampiezza delle lingue del fronte (frazione del raggio). */
  dita: 0.18,
  /** Frequenza delle lingue intorno al punto d'ingresso. */
  ditaFreq: 1.7,
  /** Margine oltre l'angolo più lontano, in moduli: a fine corsa la tessera è tutta coperta. */
  margine: 0.2,
  /** Saturazione finale: quanto cresce ancora il raggio (in portate) tra t = 0,45 e la chiusura. */
  satura: 0.45,

  /** Rimescolamento: frequenza del campo a rotore (per modulo). */
  rimFreq: 1.8,
  /** Rimescolamento: spostamento per passo, in moduli (2 passi). */
  agita: 0.07,
  /** Quanto il campo di rimescolamento scorre in avanti con la nuvola (in unità di rumore). */
  deriva: 0.9,

  /** Cappello: angolo delle spalle (i due vortici dell'anello) dalla direzione di corsa, in radianti. */
  spalla: 0.95,
  /** Cappello: distanza dei vortici dal punto d'ingresso, in frazione del raggio del fronte. */
  anelloPos: 0.9,
  /** Cappello: raggio dei vortici, in frazione del raggio del fronte. */
  anelloRaggio: 0.3,
  /** Cappello: raggio massimo dei vortici, in moduli (sulle tessere grandi niente uncini giganti). */
  anelloMax: 0.34,
  /** Cappello: rotazione al centro dei vortici, in radianti. */
  anelloGiro: 4.5,
  /** Cappello: verso di rotazione (+1 o −1): i lati si arrotolano all'indietro. */
  anelloVerso: 1.0,

  /** Riccioli: rotazione al centro dei quattro vortici piccoli, in radianti. */
  riccioloGiro: 3.6,
  /** Riccioli: raggio, in moduli. */
  riccioloRaggio: 0.1,
  /** Riccioli: apertura del ventaglio lungo il fronte, in radianti. */
  ventaglio: 0.7,

  /** Mezza larghezza del bordo del corpo, in moduli (definito ma con antialias). */
  nitido: 0.02,
  /** Fronte denso: distanza dal bordo, in moduli. */
  rim: 0.05,
  /** Fronte denso: larghezza, in moduli. */
  rimLargo: 0.05,
  /** Quanto si scurisce il fronte (0..1, verso il nero). */
  fronte: 0.5,

  /** Veli davanti al fronte: distanza del primo velo dal fronte, in moduli (il secondo a 2,1×). */
  veliPasso: 0.12,
  /** Veli: frequenza del loro moto proprio (per modulo). */
  veliFreq: 2.6,
  /** Veli: ampiezza del loro moto proprio, in moduli. */
  veliMossa: 0.05,
  /** Veli: frequenza delle loro lingue. */
  veliLingue: 2.6,
  /** Veli: sfumatura del contorno, in moduli. */
  veliSfuma: 0.05,
  /** Veli: opacità del foglio (grigio sfumato sul nero). */
  veliAlfa: 0.18,
  /** Orlo ripiegato del velo: mezza larghezza del lato netto (fuori), in moduli. */
  orloNetto: 0.018,
  /** Orlo: quanto si scioglie verso l'interno (decadimento), in moduli. */
  orloScioglie: 0.045,
  /** Orlo: opacità in più. */
  orloAlfa: 0.34,
  /** Sfrangiatura fine dei veli: frequenza (per modulo). */
  fineFreq: 7.5,
  /** Sfrangiatura fine: ampiezza, in moduli. */
  fineMossa: 0.012,

  /** Distanza dietro al fronte dove la foto è già nitida, in moduli. */
  posa: 0.42,
  /** Sfocatura massima della foto appena arrivata, in moduli. */
  sfoca: 0.025,
  /** Desaturazione massima della foto appena arrivata (0..1). */
  desatura: 0.7,
  /** Velo d'inchiostro sulla foto appena arrivata (0..1, verso il nero). */
  velo: 0.32,
  /** Quanto la foto è trascinata dal flusso prima di posarsi (frazione dello spostamento del campo). */
  trascina: 0.5,
  /** Da questo t la nuvola si chiude sulla foto nitida (dissolvenza finale fino a t = 1). */
  chiude: 0.84,
  /** Bordo morbido verso i lati della tessera durante lo sboccio, in moduli (a posa finita: spigolo vivo). */
  lati: 0.05,
} as const;

/** L'increspatura al passaggio: un anello di rifrazione, lento, una volta. */
export const INCRESPATURA = {
  /** Durata totale in secondi: oltre, lo shader la ignora (motion/increspature.ts può smettere di passarla). */
  durata: 1.6,
  /** Tempo in cui l'anello finisce di allargarsi, in secondi. */
  espande: 1.4,
  /** Raggio finale dell'anello, in moduli. */
  raggio: 1.25,
  /** Larghezza del pacchetto d'onda, in moduli. */
  largo: 0.16,
  /** Creste dentro il pacchetto (radianti per unità di larghezza). */
  creste: 4.2,
  /** Salita dell'ampiezza, in secondi. */
  attacco: 0.14,
  /** Smorzamento con la distanza dal punto (per modulo). */
  smorza: 1.1,
  /** Spostamento massimo: 0,6% della tessera (CD §4.3). */
  spostamento: 0.006,
  /** Guadagno della luce di rifrazione. */
  luce: 0.022,
  /** Variazione massima di luminosità: ±3% (CD §4.3). */
  luceMax: 0.03,
} as const;

/** L'arretramento dei filtri: l'inchiostro si ritira, resta un bicromo nero → grigio sfumato. */
export const ARRETRAMENTO = {
  /** Luminanza della foto che diventa nero pieno. */
  nero: 0.04,
  /** Luminanza della foto che diventa grigio sfumato pieno. */
  luce: 0.9,
  /** Quanto i bordi arretrano prima del centro durante il passaggio (0 = tutto insieme). */
  onda: 0.6,
} as const;

/** Bordo di antialias attorno al quad, in px fisici (le tessere distano almeno M/6: non si toccano mai). */
export const BORDO_AA = 1;

/** Tetto di sicurezza per i disegni in un frame (tech-architect §8). */
export const DISEGNI_MAX = 56;

type Mappa = Readonly<Record<string, number>>;

function numeroGLSL(n: number): string {
  if (!Number.isFinite(n)) throw new Error(`presets: valore non finito ${String(n)}`);
  const s = Number.isInteger(n) ? n.toFixed(1) : n.toFixed(6).replace(/0+$/, '');
  return s.endsWith('.') ? `${s}0` : s;
}

function maiuscoloSerpente(chiave: string): string {
  return chiave.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
}

function blocco(prefisso: string, m: Mappa): string {
  return Object.keys(m)
    .map((k) => `#define ${prefisso}_${maiuscoloSerpente(k)} ${numeroGLSL(m[k] as number)}`)
    .join('\n');
}

/**
 * Intestazione `#define` comune a vertex e fragment.
 * Esempio: INCHIOSTRO.filSottile → `#define INK_FIL_SOTTILE 4.2`.
 */
export function definizioniGLSL(): string {
  return [
    blocco('INK', INCHIOSTRO),
    blocco('INC', INCRESPATURA),
    blocco('ARR', ARRETRAMENTO),
    `#define BORDO_AA ${numeroGLSL(BORDO_AA)}`,
    '',
  ].join('\n');
}
