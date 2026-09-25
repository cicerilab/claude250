/**
 * IMPRONTA · prezzo indicativo del banco di prova (section-builder-banco).
 *
 * Solo calcolo, nessun testo proprio e nessun accesso al browser: la formula
 * è quella di docs/copywriter.md §7, i numeri sono in content/prezzi.ts, le
 * parole del riepilogo in content/testi.ts (BANCO.prezzo.voci).
 *
 *   base      = PREZZO_BASE[prodotto][tiratura]
 *   carta     = base × (1 + SUPPLEMENTO_CARTA[carta])
 *   tecnica   = impianto + aPezzo × tiratura
 *   taglio    = se scelto e disponibile: max(aPezzo × tiratura, minimo)
 *   legatura  = solo libro: SUPPLEMENTO_LEGATURA[legatura] × tiratura
 *   totale    = arrotondato ai 5 € di carta + tecnica + taglio + legatura
 *
 * Verifiche del copywriter (docs/copywriter.md §7), tutte riprodotte da
 * `calcolaPrezzo`: 100 partecipazioni Cotone a secco 390 €, in lamina 470 €;
 * 100 biglietti Cotone a secco 160 €, in lamina 240 €; 250 biglietti Cotone in
 * lamina 400 €; 50 libri Grafite a un colore in brossura 780 €.
 *
 * In fondo al file ci sono anche i due calcoli sul testo della prova, puri
 * come il prezzo e usati sia dalla prova sia dal compositoio: le righe da
 * comporre (testo scritto o esempio) e i segni che la cassa non ha.
 */

import {
  ARROTONDAMENTO,
  GRAMMATURA,
  PREZZO_BASE,
  SUPPLEMENTO_CARTA,
  SUPPLEMENTO_LEGATURA,
  SUPPLEMENTO_TECNICA,
  TAGLIO_COLORATO,
  TEMPI_GIORNI,
  TIRATURA_DEFAULT,
} from '../../content/prezzi';
import type { Carta, Legatura, Prodotto, Tecnica } from '../../content/prezzi';
import { BANCO, CAMPI_TESTO, euro } from '../../content/testi';

/** Le scelte che fanno il prezzo (la prova dello store ha gli stessi campi). */
export interface SceltePrezzo {
  readonly prodotto: Prodotto;
  readonly carta: Carta;
  readonly tecnica: Tecnica;
  readonly tiratura: number;
  readonly taglioColorato: boolean;
  readonly legatura: Legatura;
}

/** Le singole voci in euro, prima dell'arrotondamento (utili per i test e per chi legge). */
export interface VociPrezzo {
  readonly base: number;
  readonly carta: number;
  readonly tecnica: number;
  readonly taglio: number;
  readonly legatura: number;
}

export interface EsitoPrezzo {
  /** Totale indicativo, IVA inclusa, arrotondato ai 5 €. */
  readonly totale: number;
  /** Somma esatta prima dell'arrotondamento. */
  readonly esatto: number;
  readonly voci: VociPrezzo;
  /** Parole del riepilogo (BANCO.prezzo.voci), solo quelle che dicono qualcosa di questa prova. */
  readonly parole: readonly string[];
  /** Grammatura della carta per questo prodotto (la intestata è sempre 120 g). */
  readonly grammatura: number;
  readonly giorniDa: number;
  readonly giorniA: number;
  /** Il taglio colorato conta davvero (scelto e disponibile per il prodotto). */
  readonly taglioApplicato: boolean;
}

/** Prezzo base della tabella; se la tiratura non esiste per il prodotto usa quella di partenza. */
function prezzoBase(prodotto: Prodotto, tiratura: number): number {
  const tabella = PREZZO_BASE[prodotto] as Readonly<Record<number, number>>;
  const valore = tabella[tiratura];
  if (valore !== undefined) return valore;
  const ripiego = tabella[TIRATURA_DEFAULT[prodotto]];
  return ripiego ?? 0;
}

/** Arrotondamento ai 5 € più vicini (ARROTONDAMENTO), senza errori di virgola mobile. */
export function arrotonda(valore: number): number {
  const passo = ARROTONDAMENTO;
  return Math.round(Math.round(valore * 100) / 100 / passo) * passo;
}

/** Grammatura mostrata nel riepilogo: la intestata usa la stessa tinta in 120 g. */
export function grammaturaPer(prodotto: Prodotto, carta: Carta): number {
  return prodotto === 'intestata' ? GRAMMATURA.intestata : GRAMMATURA[carta];
}

/** Il taglio colorato è possibile su questo prodotto? */
export function taglioDisponibile(prodotto: Prodotto): boolean {
  return TAGLIO_COLORATO.disponibile[prodotto];
}

/** Il prezzo di una prova, con le parole del riepilogo. */
export function calcolaPrezzo(s: SceltePrezzo): EsitoPrezzo {
  const base = prezzoBase(s.prodotto, s.tiratura);
  const conCarta = base * (1 + SUPPLEMENTO_CARTA[s.carta]);
  const tec = SUPPLEMENTO_TECNICA[s.tecnica];
  const tecnica = tec.impianto + tec.aPezzo * s.tiratura;
  const taglioApplicato = s.taglioColorato && taglioDisponibile(s.prodotto);
  const taglio = taglioApplicato ? Math.max(TAGLIO_COLORATO.aPezzo * s.tiratura, TAGLIO_COLORATO.minimo) : 0;
  const legatura = s.prodotto === 'libro' ? SUPPLEMENTO_LEGATURA[s.legatura] * s.tiratura : 0;
  const esatto = conCarta + tecnica + taglio + legatura;

  const v = BANCO.prezzo.voci;
  const parole: string[] = [];
  if (s.tecnica === 'lamina') {
    parole.push(v.lamina);
  } else {
    parole.push(v.lastra);
    if (s.tecnica === 'colore') parole.push(v.colore);
  }
  if (s.prodotto === 'partecipazione') parole.push(v.busta);
  if (s.prodotto === 'intestata') parole.push(v.buste);
  const percento = Math.round(SUPPLEMENTO_CARTA[s.carta] * 100);
  if (percento > 0) parole.push(v.cartaPiu(s.carta, percento));
  if (taglioApplicato) parole.push(v.taglio(euro(TAGLIO_COLORATO.aPezzo), euro(TAGLIO_COLORATO.minimo)));
  if (s.prodotto === 'libro' && s.legatura !== 'brossura') parole.push(v.legatura(s.legatura));

  const tempi = TEMPI_GIORNI[s.prodotto];
  return {
    totale: arrotonda(esatto),
    esatto,
    voci: { base, carta: conCarta - base, tecnica, taglio, legatura },
    parole,
    grammatura: grammaturaPer(s.prodotto, s.carta),
    giorniDa: tempi.da,
    giorniA: tempi.a,
    taglioApplicato,
  };
}

/* ------------------------------------------------------------------ composizione della prova */

/**
 * Segni che la cassa di caratteri ha (Anybody e Hanken Grotesk coprono il
 * latino esteso): lettere latine con i loro accenti, cifre, spazi e la
 * punteggiatura di una partecipazione o di un indirizzo. Tutto il resto
 * (emoji, alfabeti non latini, simboli) resta fuori dalla prova.
 */
const SEGNO_IN_CASSA = /[\p{Script=Latin}\p{M}\p{Nd}\s.,;:!?'’‘"“”«»()[\]&@#%+/*=°€$£×·…-]/u;

export interface EsitoSegni {
  /** Il testo con solo i segni che si possono comporre. */
  readonly pulito: string;
  /** true se almeno un segno è stato lasciato fuori. */
  readonly mancanti: boolean;
}

/** Toglie i segni che la cassa non ha (stato "Segno non disponibile", ux-architect 5.6). */
export function pulisciSegni(testo: string): EsitoSegni {
  const normale = testo.normalize('NFC');
  let pulito = '';
  let mancanti = false;
  for (const segno of normale) {
    if (SEGNO_IN_CASSA.test(segno)) pulito += segno;
    else mancanti = true;
  }
  return { pulito: pulito.replace(/\s+/g, ' '), mancanti };
}

/** Peso tipografico di una riga sulla prova. */
export type RuoloRiga = 'principale' | 'secondaria';

export interface RigaProva {
  /** Chiave del campo (CAMPI_TESTO[prodotto][i].chiave). */
  readonly chiave: string;
  /** Testo da premere: quello scritto (ripulito) o l'esempio. */
  readonly testo: string;
  /** true se il campo è vuoto e si vede il testo di esempio. */
  readonly esempio: boolean;
  readonly ruolo: RuoloRiga;
  /** Limite di lettere del campo: oltre, la riga va su due. */
  readonly max: number;
}

/** Quali campi sono la riga grande del pezzo (il resto è in corpo di lettura). */
const PRINCIPALI: Readonly<Record<Prodotto, readonly string[]>> = {
  biglietto: ['nome'],
  partecipazione: ['primo', 'secondo'],
  intestata: [],
  libro: ['titolo'],
};

/** Le righe della prova per un prodotto: il testo scritto, o l'esempio se il campo è vuoto. */
export function righeDellaProva(prodotto: Prodotto, campi: Readonly<Record<string, string>>): RigaProva[] {
  return CAMPI_TESTO[prodotto].map((campo) => {
    const scritto = pulisciSegni(campi[campo.chiave] ?? '').pulito.trim();
    return {
      chiave: campo.chiave,
      testo: scritto.length > 0 ? scritto : campo.esempio,
      esempio: scritto.length === 0,
      ruolo: PRINCIPALI[prodotto].includes(campo.chiave) ? 'principale' : 'secondaria',
      max: campo.max,
    };
  });
}
