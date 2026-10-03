// File GENERATO da scripts/modi/calcola-modi.mjs (2026-10-03). Non modificare a mano:
// rilancia `npm run modi`. Il blocco tra JSON e FINE è JSON puro (lo rilegge
// scripts/modi/controllo-nodi.mjs).

export type TopologiaModo = 'croce' | 'parentesi' | 'anello-aperto';
export type FormatoModi = 'i8-96x168' | 'i16-64x112';

export interface MetaModo {
  readonly modo: 1 | 2 | 5;
  /** Frequenza di bottega usata dal sito (Hz). */
  readonly hzBottega: number;
  /** Modi calcolati che compongono la figura (ordine, Hz del modello, quota d'energia): solo documentazione. */
  readonly composizione: ReadonlyArray<{ readonly ordine: number; readonly hz: number; readonly quota: number }>;
  /** Distanza media (mm) tra le linee nodali spedite e i punti misurati da Jansson. */
  readonly distanzaMediaMm: number;
  readonly topologia: TopologiaModo;
  /** Quattro cuscinetti (u, v) in [0, 1] sul rettangolo, sulle linee nodali. */
  readonly cuscinetti: ReadonlyArray<readonly [number, number]>;
}

export interface MetaModi {
  readonly versione: number;
  readonly data: string;
  readonly metodo: 'rayleigh-ritz' | 'rayleigh-ritz-tarato' | 'a-mano';
  readonly formato: FormatoModi;
  readonly griglia: { readonly nu: number; readonly nv: number };
  /** Rettangolo dei campi in mm: x centrata sulla giunta, y = 0 al bordo verso il riccio. */
  readonly rettangoloMm: { readonly x0: number; readonly y0: number; readonly w: number; readonly h: number };
  readonly contorno: 'svg' | 'riserva';
  readonly parametri: Readonly<Record<string, unknown>>;
  /** Nell'ordine dei campi in modi.bin: modo 1, modo 2, modo 5. */
  readonly modi: readonly [MetaModo, MetaModo, MetaModo];
  readonly anello: { readonly centro: readonly [number, number]; readonly apertoAlleC: { readonly bassi: boolean; readonly acuti: boolean } };
  readonly riposo: { readonly cuscinetti: ReadonlyArray<readonly [number, number]> };
  readonly calcolati: ReadonlyArray<{ readonly ordine: number; readonly hz: number; readonly topologia: string; readonly parita: number }>;
}

export const MODI_META: MetaModi = /*JSON*/{
  "versione": 1,
  "data": "2026-10-03",
  "metodo": "rayleigh-ritz-tarato",
  "formato": "i8-96x168",
  "griglia": {
    "nu": 96,
    "nv": 168
  },
  "rettangoloMm": {
    "x0": -104,
    "y0": 0,
    "w": 208,
    "h": 356
  },
  "contorno": "svg",
  "parametri": {
    "ELGPa": 15,
    "ERGPa": 0.8,
    "GGPa": 0.84,
    "poissonLR": 0.37,
    "densita": 460,
    "spessoreMm": 2.8,
    "rapportoRigidezza": 18.8,
    "gradoPolinomi": 16,
    "funzioniBase": 153,
    "catena": null,
    "bombaturaMm": 15.5,
    "taratura": {
      "misure": {
        "modo1": {
          "yTraverso": 190
        },
        "modo2": {
          "distanzaAlta": 140,
          "distanzaBassa": 162,
          "semidistanzaVita": 27,
          "yVita": 158,
          "esponente": 1.25
        },
        "modo5": {
          "altoCentro": 69,
          "altoBordo": 92,
          "bassoCentro": 60,
          "bassoBordo": 254
        }
      },
      "base": 6,
      "penalita": 0.01
    }
  },
  "modi": [
    {
      "modo": 1,
      "hzBottega": 92,
      "composizione": [
        {
          "ordine": 1,
          "hz": 268,
          "quota": 1
        }
      ],
      "distanzaMediaMm": 24.3,
      "topologia": "croce",
      "cuscinetti": [
        [
          0.4948,
          0.003
        ],
        [
          0.5052,
          0.997
        ],
        [
          0.5052,
          0.497
        ],
        [
          0.0781,
          0.7351
        ]
      ]
    },
    {
      "modo": 2,
      "hzBottega": 168,
      "composizione": [
        {
          "ordine": 2,
          "hz": 306,
          "quota": 0.537
        },
        {
          "ordine": 7,
          "hz": 617,
          "quota": 0.252
        },
        {
          "ordine": 3,
          "hz": 424,
          "quota": 0.117
        },
        {
          "ordine": 12,
          "hz": 992,
          "quota": 0.087
        }
      ],
      "distanzaMediaMm": 4.6,
      "topologia": "parentesi",
      "cuscinetti": [
        [
          0.7969,
          0.1042
        ],
        [
          0.2031,
          0.1042
        ],
        [
          0.849,
          0.9018
        ],
        [
          0.151,
          0.9018
        ]
      ]
    },
    {
      "modo": 5,
      "hzBottega": 348,
      "composizione": [
        {
          "ordine": 5,
          "hz": 516,
          "quota": 0.661
        },
        {
          "ordine": 3,
          "hz": 424,
          "quota": 0.324
        },
        {
          "ordine": 10,
          "hz": 874,
          "quota": 0.012
        },
        {
          "ordine": 2,
          "hz": 306,
          "quota": 0.001
        }
      ],
      "distanzaMediaMm": 2,
      "topologia": "anello-aperto",
      "cuscinetti": [
        [
          0.5885,
          0.1756
        ],
        [
          0.4115,
          0.1756
        ],
        [
          0.5677,
          0.872
        ],
        [
          0.4323,
          0.872
        ]
      ]
    }
  ],
  "anello": {
    "centro": [
      0.5,
      0.5776
    ],
    "apertoAlleC": {
      "bassi": true,
      "acuti": true
    }
  },
  "riposo": {
    "cuscinetti": [
      [
        0.4948,
        0.003
      ],
      [
        0.5052,
        0.997
      ],
      [
        0.5052,
        0.497
      ],
      [
        0.0781,
        0.7351
      ]
    ]
  },
  "calcolati": [
    {
      "ordine": 1,
      "hz": 268.2,
      "topologia": "croce",
      "parita": -1
    },
    {
      "ordine": 2,
      "hz": 305.8,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 3,
      "hz": 423.8,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 4,
      "hz": 432.1,
      "topologia": "altro",
      "parita": -1
    },
    {
      "ordine": 5,
      "hz": 516.3,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 6,
      "hz": 535.8,
      "topologia": "altro",
      "parita": -1
    },
    {
      "ordine": 7,
      "hz": 617,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 8,
      "hz": 739.9,
      "topologia": "altro",
      "parita": -1
    },
    {
      "ordine": 9,
      "hz": 825.5,
      "topologia": "altro",
      "parita": -1
    },
    {
      "ordine": 10,
      "hz": 873.8,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 11,
      "hz": 956.7,
      "topologia": "altro",
      "parita": -1
    },
    {
      "ordine": 12,
      "hz": 991.9,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 13,
      "hz": 1054.6,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 14,
      "hz": 1176.5,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 15,
      "hz": 1247.5,
      "topologia": "altro",
      "parita": -1
    },
    {
      "ordine": 16,
      "hz": 1318.2,
      "topologia": "altro",
      "parita": 1
    },
    {
      "ordine": 17,
      "hz": 1336.6,
      "topologia": "altro",
      "parita": -1
    },
    {
      "ordine": 18,
      "hz": 1430.9,
      "topologia": "altro",
      "parita": -1
    }
  ]
}/*FINE*/ as MetaModi;
