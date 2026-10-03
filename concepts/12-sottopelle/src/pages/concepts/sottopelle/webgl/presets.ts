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
  frenata: 2.3,
  /** Allungamento iniziale della nuvola nella direzione d'ingresso (1 = tonda). */
  aniso: 1.75,
  /** Quanto la nuvola si arrotonda finendo (0 = resta allungata, 1 = tonda alla fine). */
  arrotonda: 0.55,
  /** Ampiezza delle lingue del fronte (frazione del raggio). */
  dita: 0.2,
  /** Frequenza delle lingue intorno al punto d'ingresso. */
  ditaFreq: 1.6,
  /** Margine oltre l'angolo più lontano, in moduli: a fine corsa la tessera è tutta coperta. */
  margine: 0.32,

  /** Rimescolamento: frequenza del campo a rotore (per modulo). */
  rimFreq: 2.1,
  /** Rimescolamento: spostamento per passo, in moduli (3 passi). */
  agita: 0.05,
  /** Quanto il campo di rimescolamento scorre in avanti con la nuvola (in unità di rumore). */
  deriva: 0.9,

  /** Volute: rotazione massima al centro di ogni vortice, in radianti. */
  voluta: 4.2,
  /** Volute: raggio di un vortice, in moduli. */
  vortRaggio: 0.17,
  /** Volute: posizione dei vortici rispetto al fronte (1 = sul fronte). */
  vortPos: 0.9,
  /** Volute: apertura del ventaglio dei 4 vortici attorno alla direzione d'ingresso, in radianti. */
  ventaglio: 0.55,

  /** Larghezza del bordo morbido interno della nuvola, in moduli. */
  bordo: 0.16,
  /** Quanto si scurisce il fronte (0..1, verso il nero). */
  fronte: 0.38,

  /** Filamenti davanti al fronte: lunghezza della zona, in moduli. */
  filLungo: 0.42,
  /** Filamenti: frequenza lungo il fronte (per modulo d'arco). */
  filFreq: 9.0,
  /** Filamenti: allungamento lungo la direzione di corsa (più basso = fili più lunghi). */
  filStira: 0.16,
  /** Filamenti: finezza (più alto = fili più sottili). */
  filSottile: 4.2,
  /** Filamenti: opacità massima del grigio sfumato sul nero. */
  filAlfa: 0.62,

  /** Distanza dietro al fronte dove la foto è già nitida, in moduli. */
  posa: 0.42,
  /** Sfocatura massima della foto appena arrivata, in moduli. */
  sfoca: 0.03,
  /** Desaturazione massima della foto appena arrivata (0..1). */
  desatura: 0.7,
  /** Velo d'inchiostro sulla foto appena arrivata (0..1, verso il nero). */
  velo: 0.32,
  /** Quanto la foto è trascinata dal flusso prima di posarsi (frazione dello spostamento del campo). */
  trascina: 0.55,
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
