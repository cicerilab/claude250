/**
 * BATTIFILO · il cantiere tipo, mese per mese (copywriter).
 *
 * Unica fonte di costi, progressivi, fermi e bilancio: la usano la scheda del
 * mese, la linea battuta (`core/tempo.ts` → `calcolaBuchi`), lo slider
 * (`aria-valuetext`), la vista "Tutti i mesi" e le chiavi. Nessun componente
 * riscrive queste cifre.
 *
 * Casa unifamiliare di 170 m² in laterizio e cemento armato a Cordenons.
 * Cifre di un cantiere tipo, IVA esclusa, di un'impresa inventata.
 * Il cantiere apre lunedì 10 marzo 2025 e consegna le chiavi giovedì
 * 30 aprile 2026. Gli anni servono solo ai conti delle date: a vista si
 * scrive "ottobre, mese 8", mai l'anno.
 *
 * Fermi (i buchi nella linea): pioggia 5 giorni ad aprile, gelo 6 a dicembre
 * (11 giorni lavorativi per il meteo, come nel bilancio), più le chiusure di
 * calendario: ferie dal 4 al 22 agosto e Natale dal 24 al 31 dicembre, subito
 * dopo il gelo (a vista è un buco solo, lungo). Le feste comandate e i fine
 * settimana non sono fermi, come in cantiere.
 */

export type NumeroMese = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export type MotivoFermo = 'pioggia' | 'ferie' | 'gelo' | 'natale';

export interface Fermo {
  /** id stabile: diventa `Buco.chiave` in `core/tempo.ts` */
  readonly id: string;
  readonly motivo: MotivoFermo;
  /** primo e ultimo giorno di calendario del fermo, dentro il mese (1..31) */
  readonly giornoDa: number;
  readonly giornoA: number;
  /** giorni lavorativi persi (lunedì-venerdì, feste escluse) */
  readonly giorniLavorativi: number;
  /** true se è un fermo per il meteo (conta negli 11 giorni del bilancio) */
  readonly meteo: boolean;
  /** la riga che compare sul buco, sulla tacca a fuoco e nella vista elenco */
  readonly riga: string;
  /** il pezzo che entra in "chi c'era" e nell'aria-valuetext */
  readonly breve: string;
}

export interface Mese {
  readonly n: NumeroMese;
  /** anno e mese di calendario (1-12), per `calcolaBuchi` */
  readonly anno: number;
  readonly mese: number;
  /** nome del mese in minuscolo: "ottobre" */
  readonly nome: string;
  /** tacca sotto la linea, tre lettere (lo stencil la mette in maiuscolo) */
  readonly tacca: string;
  /** fase: marcatura a stencil, al massimo 22 caratteri */
  readonly fase: string;
  /** euro spesi nel mese, IVA esclusa */
  readonly costo: number;
  /** euro spesi dal mese 1 a questo compreso */
  readonly finora: number;
  /** cosa si è fatto, al massimo 180 caratteri */
  readonly fatto: string;
  /** mestieri e persone, senza i giorni (li aggiunge `SCHEDA.chiCera`) */
  readonly chi: string;
  /** giorni con la squadra in cantiere */
  readonly giorni: number;
  readonly fermi: readonly Fermo[];
  /** "Controlla tu": un consiglio pratico, al massimo 130 caratteri */
  readonly controlla: string;
  /** mesi 7 e 12: link "Quanto costerebbe la tua finestra?" */
  readonly finestra: boolean;
}

type RigaMese = Omit<Mese, 'finora'>;

const RIGHE: readonly RigaMese[] = [
  {
    n: 1,
    anno: 2025,
    mese: 3,
    nome: 'marzo',
    tacca: 'Mar',
    fase: 'Tracciamento e scavo',
    costo: 14600,
    fatto:
      'Tracciamento: con picchetti e battifilo si segna a terra dove vanno i muri. Poi lo scavo fino alla quota delle fondazioni, e la terra portata via.',
    chi: 'Renzo e Loris, escavatorista 1, muratori 2',
    giorni: 12,
    fermi: [],
    controlla:
      'Vieni il giorno del tracciamento: vedere i muri battuti per terra ti dice subito se le stanze sono come le immaginavi.',
    finestra: false,
  },
  {
    n: 2,
    anno: 2025,
    mese: 4,
    nome: 'aprile',
    tacca: 'Apr',
    fase: 'Fondazioni',
    costo: 32400,
    fatto:
      'Magrone, il piano pulito sotto le fondazioni. Poi i ferri della platea, la fondazione a lastra unica sotto tutta la casa, e il getto in una giornata.',
    chi: 'Muratori 4, ferraioli 2, autobetoniera',
    giorni: 15,
    fermi: [
      {
        id: 'pioggia-aprile',
        motivo: 'pioggia',
        giornoDa: 14,
        giornoA: 18,
        giorniLavorativi: 5,
        meteo: true,
        riga: 'Pioggia: cantiere fermo dal 14 al 18 aprile, 5 giorni.',
        breve: '5 fermi per pioggia',
      },
    ],
    controlla: 'Chiedi le foto dei ferri prima del getto. Dopo non si vedono più.',
    finestra: false,
  },
  {
    n: 3,
    anno: 2025,
    mese: 5,
    nome: 'maggio',
    tacca: 'Mag',
    fase: 'Vespaio e primi muri',
    costo: 29800,
    fatto:
      "Vespaio aerato: sotto il pavimento resta un'intercapedine d'aria, così l'umidità del terreno non sale. Gli scarichi, poi i primi corsi di blocchi in laterizio.",
    chi: 'Muratori 4, idraulico 1 per gli scarichi',
    giorni: 20,
    fermi: [],
    controlla:
      'Controlla sul disegno dove escono gli scarichi della cucina: spostarli dopo costa un pavimento.',
    finestra: false,
  },
  {
    n: 4,
    anno: 2025,
    mese: 6,
    nome: 'giugno',
    tacca: 'Giu',
    fase: 'Muri e solaio',
    costo: 38900,
    fatto:
      'Muri del piano terra in blocchi porizzati, cioè laterizio alleggerito che isola meglio. Poi il solaio in laterocemento, il piano tra i due piani, e il suo getto.',
    chi: 'Muratori 4, gruista 1',
    giorni: 20,
    fermi: [],
    controlla:
      'Dopo il getto del solaio non ci si cammina sopra per una settimana. Aspetta a salire a vedere.',
    finestra: false,
  },
  {
    n: 5,
    anno: 2025,
    mese: 7,
    nome: 'luglio',
    tacca: 'Lug',
    fase: 'Muri del primo piano',
    costo: 31700,
    fatto:
      'Muri del primo piano e cordoli, le travi in cemento armato che legano i muri. Variante tua: una finestra in più in cucina, 2.100 €, firmata prima di aprire il muro.',
    chi: 'Muratori 4',
    giorni: 20,
    fermi: [],
    controlla:
      'Adesso si vedono le finestre vere nei muri: è l’ultimo momento comodo per cambiarne una.',
    finestra: false,
  },
  {
    n: 6,
    anno: 2025,
    mese: 8,
    nome: 'agosto',
    tacca: 'Ago',
    fase: 'Struttura del tetto',
    costo: 22300,
    fatto:
      "Travi e tavolato del tetto in legno, sopra l'isolamento. È un tetto ventilato: uno strato d'aria sotto le tegole porta via il caldo d'estate.",
    chi: 'Carpentieri 3, muratori 2',
    giorni: 6,
    fermi: [
      {
        id: 'ferie-agosto',
        motivo: 'ferie',
        giornoDa: 4,
        giornoA: 22,
        giorniLavorativi: 14,
        meteo: false,
        riga: 'Ferie: cantiere chiuso dal 4 al 22 agosto.',
        breve: 'ferie dal 4 al 22',
      },
    ],
    controlla:
      'Le ferie erano nel calendario dalla firma. Usale per scegliere pavimenti e sanitari.',
    finestra: false,
  },
  {
    n: 7,
    anno: 2025,
    mese: 9,
    nome: 'settembre',
    tacca: 'Set',
    fase: 'Tetto e controtelai',
    costo: 27500,
    fatto:
      'Coppi e lattonerie: grondaie, pluviali, scossaline. Ivan e Marius murano i controtelai, i telai su cui a febbraio si fisseranno le finestre.',
    chi: 'Lattoniere 1, carpentieri 2, Ivan e Marius',
    giorni: 19,
    fermi: [],
    controlla:
      'I controtelai fissano la misura delle finestre. Da qui in poi la luce non cambia più.',
    finestra: true,
  },
  {
    n: 8,
    anno: 2025,
    mese: 10,
    nome: 'ottobre',
    tacca: 'Ott',
    fase: 'Impianti',
    costo: 41200,
    fatto:
      'Tracce nei muri, i solchi dove passano tubi e cavi. Dorsali elettriche, tubi di carico e scarico, collettori del riscaldamento.',
    chi: 'Elettricisti 2, idraulici 2',
    giorni: 19,
    fermi: [],
    controlla:
      'Prima che chiudano le tracce, fotografa i tubi: un giorno ti servirà sapere dove passano.',
    finestra: false,
  },
  {
    n: 9,
    anno: 2025,
    mese: 11,
    nome: 'novembre',
    tacca: 'Nov',
    fase: 'Intonaci',
    costo: 24600,
    fatto:
      "Intonaco su tutti i muri interni, poi la rasatura, lo strato finale liscio. Le tracce degli impianti spariscono sotto.",
    chi: 'Intonacatori 3',
    giorni: 18,
    fermi: [],
    controlla:
      'Fai il giro con la pianta in mano: prese e interruttori adesso si vedono. Se uno è fuori posto, dillo prima della pittura.',
    finestra: false,
  },
  {
    n: 10,
    anno: 2025,
    mese: 12,
    nome: 'dicembre',
    tacca: 'Dic',
    fase: 'Massetti e radiante',
    costo: 26900,
    fatto:
      "Tubi del riscaldamento a pavimento, dove scorre acqua tiepida. Sopra, il massetto: lo strato di sabbia e cemento su cui si posa il pavimento.",
    chi: 'Idraulici 2, massettisti 2',
    giorni: 10,
    fermi: [
      {
        id: 'gelo-dicembre',
        motivo: 'gelo',
        giornoDa: 16,
        giornoA: 23,
        giorniLavorativi: 6,
        meteo: true,
        riga: 'Gelo: cantiere fermo dal 16 al 23 dicembre, 6 giorni. Sotto i 5 gradi il massetto non si getta.',
        breve: '6 fermi per gelo',
      },
      {
        id: 'natale-dicembre',
        motivo: 'natale',
        giornoDa: 24,
        giornoA: 31,
        giorniLavorativi: 4,
        meteo: false,
        riga: 'Natale: cantiere chiuso dal 24 dicembre a Capodanno.',
        breve: 'poi Natale',
      },
    ],
    controlla:
      'Il massetto ha bisogno di settimane per asciugare. Chiedi il calendario di accensione del radiante.',
    finestra: false,
  },
  {
    n: 11,
    anno: 2026,
    mese: 1,
    nome: 'gennaio',
    tacca: 'Gen',
    fase: 'Cartongessi e VMC',
    costo: 30400,
    fatto:
      "Pareti in cartongesso. La VMC, la ventilazione che cambia l'aria senza aprire le finestre. La pompa di calore, che scalda e raffresca con l'aria di fuori.",
    chi: 'Cartongessisti 2, impiantisti 3',
    giorni: 20,
    fermi: [],
    controlla:
      'La pompa di calore fuori fa un po’ di rumore: controlla che non finisca sotto la finestra di una camera.',
    finestra: false,
  },
  {
    n: 12,
    anno: 2026,
    mese: 2,
    nome: 'febbraio',
    tacca: 'Feb',
    fase: 'Posa dei serramenti',
    costo: 36800,
    fatto:
      'Ivan e Marius posano le finestre sui controtelai di settembre. Il nodo di posa, cioè come si uniscono telaio, muro e isolante, decide se poi entra aria.',
    chi: 'Ivan e Marius, muratori 1',
    giorni: 18,
    fermi: [],
    controlla:
      'Alla consegna delle finestre apri e chiudi ogni anta. Se una tocca, si regola adesso.',
    finestra: true,
  },
  {
    n: 13,
    anno: 2026,
    mese: 3,
    nome: 'marzo',
    tacca: 'Mar',
    fase: 'Cappotto e pavimenti',
    costo: 34100,
    fatto:
      'Cappotto: pannelli isolanti incollati e tassellati fuori dai muri, poi rasati. Dentro, i pavimenti. Variante tua: rovere al piano terra al posto del gres, 12.400 €.',
    chi: 'Cappottisti 3, posatori dei pavimenti 2',
    giorni: 21,
    fermi: [],
    controlla:
      'Il cappotto risvolta sul telaio della finestra: guarda gli angoli, devono essere dritti come il battifilo.',
    finestra: false,
  },
  {
    n: 14,
    anno: 2026,
    mese: 4,
    nome: 'aprile',
    tacca: 'Apr',
    fase: 'Finiture e collaudi',
    costo: 21300,
    fatto:
      'Pittura, porte interne, marciapiede intorno alla casa. Collaudi, cioè la prova finale di impianti e strutture, e i documenti da consegnare con le chiavi.',
    chi: 'Pittori 2, muratori 2, tecnici dei collaudi',
    giorni: 17,
    fermi: [],
    controlla: 'Fatti dare le dichiarazioni degli impianti prima delle chiavi, non dopo.',
    finestra: false,
  },
];

/** I 14 mesi, con il progressivo calcolato una volta sola dai costi. */
export const MESI: readonly Mese[] = RIGHE.reduce<Mese[]>((mesi, riga) => {
  const prima = mesi.length > 0 ? mesi[mesi.length - 1]!.finora : 0;
  mesi.push({ ...riga, finora: prima + riga.costo });
  return mesi;
}, []);

/** Il mese n (1..14). */
export function mese(n: NumeroMese): Mese {
  return MESI[n - 1]!;
}

/** Somma dei 14 mesi: 412.500 €. */
export const TOTALE: number = MESI[MESI.length - 1]!.finora;

/** Giorni lavorativi fermi per il meteo (pioggia + gelo): 11. */
export const GIORNI_METEO: number = MESI.reduce(
  (somma, m) => somma + m.fermi.reduce((s, f) => s + (f.meteo ? f.giorniLavorativi : 0), 0),
  0,
);

/** Tutti i fermi in ordine di tempo, con il mese a cui appartengono. */
export const FERMI: readonly (Fermo & { readonly n: NumeroMese })[] = MESI.flatMap((m) =>
  m.fermi.map((f) => ({ ...f, n: m.n })),
);

/** Il bilancio delle chiavi (S2) e della vista elenco. */
export const BILANCIO = {
  /** apertura del cantiere e consegna delle chiavi */
  inizio: { anno: 2025, mese: 3, giorno: 10 },
  chiavi: { anno: 2026, mese: 4, giorno: 30 },
  durataMesi: 14,
  superficieM2: 170,
  preventivo: 398000,
  /** le due varianti chieste dal cliente, scritte e firmate prima di farle */
  varianti: [
    {
      id: 'finestra-cucina',
      cosa: "una finestra in più in cucina, con l'apertura del muro e l'architrave",
      euro: 2100,
      n: 5,
    },
    {
      id: 'rovere',
      cosa: 'il rovere al piano terra al posto del gres',
      euro: 12400,
      n: 13,
    },
  ],
  /** finale = preventivo + varianti = somma dei 14 mesi */
  finale: 412500,
  /** scostamento in percentuale, a una cifra decimale: 3,6 */
  scostamentoPercento: 3.6,
} as const;
