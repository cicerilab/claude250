/**
 * BATTIFILO · tariffe di "Misura e manda" (copywriter).
 *
 * Solo dati, niente calcolo: la forbice la calcola
 * `sections/Misura/forbice.ts` (section-builder-misura) con queste regole.
 *
 *   superficie = max(arrotonda(L/100 × H/100, DECIMALI_M2), MINIMO_M2)
 *   pezzo_min  = arrotondaA(ARROTONDA, superficie × euroM2[0] × coefficiente + POSA[0])
 *   pezzo_max  = arrotondaA(ARROTONDA, superficie × euroM2[1] × coefficiente + POSA[1])
 *   totale     = pezzo × quante
 *
 * La superficie si arrotonda al centesimo PRIMA del conto, perché è il numero
 * che il cliente vede ("1,68 m² di luce") e con cui può rifare il conto.
 * Controllo: due ante 118 × 142 = 1,68 m², PVC da 920 € a 1.330 € a pezzo;
 * legno-alluminio da 1.500 € a 2.090 €; legno da 1.250 € a 1.750 €.
 *
 * Prezzi indicativi 2026, IVA esclusa, fornitura + posa + smontaggio e
 * smaltimento del vecchio. Cifre di esempio di un'impresa inventata.
 */

export type TipoFinestra = 'un-anta' | 'due-ante' | 'portafinestra' | 'scorrevole';
export type Materiale = 'pvc' | 'legno-alluminio' | 'legno';

/**
 * I quattro tipi, nell'ordine in cui compaiono in "Che cosa".
 * `davanzale`: altezza in cm da cui parte la luce sul piano di tracciamento
 * (90 per le finestre, 0 per chi arriva a terra).
 * `ante`: quante ante disegnare dentro il rettangolo (lo scorrevole ne ha 2,
 * una fissa e una che scorre).
 */
export const TIPI = [
  { id: 'un-anta', coefficiente: 1, davanzale: 90, ante: 1 },
  { id: 'due-ante', coefficiente: 1, davanzale: 90, ante: 2 },
  { id: 'portafinestra', coefficiente: 1.1, davanzale: 0, ante: 2 },
  { id: 'scorrevole', coefficiente: 1.6, davanzale: 0, ante: 2 },
] as const satisfies readonly {
  id: TipoFinestra;
  coefficiente: number;
  davanzale: number;
  ante: 1 | 2;
}[];

/** Tipo scelto quando si apre Misura e manda senza `?tipo=`. */
export const TIPO_INIZIALE: TipoFinestra = 'un-anta';

/**
 * I tre materiali nell'ordine della forbice (creative-director §4.4):
 * PVC, legno-alluminio, legno. Euro al metro quadro di luce, solo fornitura.
 */
export const MATERIALI = [
  { id: 'pvc', euroM2: [450, 650] },
  { id: 'legno-alluminio', euroM2: [800, 1100] },
  { id: 'legno', euroM2: [650, 900] },
] as const satisfies readonly { id: Materiale; euroM2: readonly [number, number] }[];

/** Posa, smontaggio e smaltimento del vecchio: euro a pezzo, [minimo, massimo]. */
export const POSA = [160, 240] as const satisfies readonly [number, number];

/** Superficie minima fatturata per pezzo, in m². */
export const MINIMO_M2 = 1;

/** Decimali a cui si arrotonda la superficie prima del conto (1,68 m²). */
export const DECIMALI_M2 = 2;

/**
 * Campo delle misure, in cm.
 * Tra `mmDa` e `mmA` il numero è probabilmente in millimetri (1180 → 118).
 * Tra `metriDa` e `metriA`, con i decimali, è probabilmente in metri (1,18 → 118).
 */
export const LIMITI = {
  min: 40,
  max: 300,
  mmDa: 400,
  mmA: 3000,
  metriDa: 0.4,
  metriA: 3,
} as const;

/** Quante finestre uguali si possono chiedere in una volta. */
export const QUANTE = { min: 1, max: 20 } as const;

/** Arrotondamento delle cifre in vista, in euro. */
export const ARROTONDA = 10;

/** Porta interna di riferimento sul piano di tracciamento, in cm. */
export const PORTA = { larghezza: 80, altezza: 210 } as const;

/**
 * Soglie degli avvisi di coerenza (non errori, non bloccano l'invio).
 * - portafinestra o scorrevole più bassi di `altezzaMinimaATerra`: forse è una finestra;
 * - finestra con davanzale + altezza oltre `quotaMassimaFinestra`: forse è una portafinestra.
 */
export const COERENZA = {
  altezzaMinimaATerra: 180,
  quotaMassimaFinestra: 280,
} as const;

/** Voci fuori dalla forbice, dette in una riga sotto di lei (euro, IVA esclusa). */
export const A_PARTE = {
  tapparellaDa: 180,
  scuriCoppiaDa: 420,
} as const;
