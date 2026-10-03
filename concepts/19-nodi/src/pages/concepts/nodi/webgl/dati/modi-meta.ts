// File GENERATO da scripts/modi/calcola-modi.mjs (2026-10-03). Non modificare a mano:
// rilancia `npm run modi`. Il blocco tra JSON e FINE è JSON puro (lo rilegge
// scripts/modi/controllo-nodi.mjs).

export type TopologiaModo = 'croce' | 'parentesi' | 'anello-aperto';
export type FormatoModi = 'i8-96x168' | 'i16-64x112';

export interface MetaModo {
  readonly modo: 1 | 2 | 5;
  /** Frequenza di bottega usata dal sito (Hz). */
  readonly hzBottega: number;
  /** Frequenza della piastra piana del calcolo: solo documentazione, mai usata. */
  readonly hzCalcolatoPiastraPiana: number;
  readonly ordineCalcolo: number;
  readonly topologia: TopologiaModo;
  /** Quattro cuscinetti (u, v) in [0, 1] sul rettangolo, sulle linee nodali. */
  readonly cuscinetti: ReadonlyArray<readonly [number, number]>;
}

export interface MetaModi {
  readonly versione: number;
  readonly data: string;
  readonly metodo: 'rayleigh-ritz' | 'a-mano';
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
  readonly calcolati: ReadonlyArray<{ readonly ordine: number; readonly hz: number; readonly topologia: string }>;
}

export const MODI_META: MetaModi = /*JSON*/{
  "versione": 1,
  "data": "2026-10-03",
  "metodo": "rayleigh-ritz",
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
  "contorno": "riserva",
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
    "catena": {
      "xMm": -18.5,
      "larghezzaMm": 5.5,
      "y0Mm": 46,
      "y1Mm": 316,
      "altezzaCentroMm": 11,
      "altezzaEstremiMm": 3
    },
    "bombatura": false
  },
  "modi": [
    {
      "modo": 1,
      "hzBottega": 92,
      "hzCalcolatoPiastraPiana": 220.1,
      "ordineCalcolo": 1,
      "topologia": "croce",
      "cuscinetti": [
        [
          0.4948,
          0.0327
        ],
        [
          0.5052,
          0.9732
        ],
        [
          0.4948,
          0.503
        ],
        [
          0.4948,
          0.7411
        ]
      ]
    },
    {
      "modo": 2,
      "hzBottega": 168,
      "hzCalcolatoPiastraPiana": 289.2,
      "ordineCalcolo": 2,
      "topologia": "parentesi",
      "cuscinetti": [
        [
          0.7344,
          0.0804
        ],
        [
          0.2656,
          0.0804
        ],
        [
          0.776,
          0.9256
        ],
        [
          0.224,
          0.9256
        ]
      ]
    },
    {
      "modo": 5,
      "hzBottega": 348,
      "hzCalcolatoPiastraPiana": 494.9,
      "ordineCalcolo": 5,
      "topologia": "anello-aperto",
      "cuscinetti": [
        [
          0.5677,
          0.1161
        ],
        [
          0.4323,
          0.1161
        ],
        [
          0.7135,
          0.8661
        ],
        [
          0.2865,
          0.8661
        ]
      ]
    }
  ],
  "anello": {
    "centro": [
      0.5,
      0.6401
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
        0.0327
      ],
      [
        0.5052,
        0.9732
      ],
      [
        0.4948,
        0.503
      ],
      [
        0.4948,
        0.7411
      ]
    ]
  },
  "calcolati": [
    {
      "ordine": 1,
      "hz": 220.1,
      "topologia": "croce"
    },
    {
      "ordine": 2,
      "hz": 289.2,
      "topologia": "parentesi"
    },
    {
      "ordine": 3,
      "hz": 364.2,
      "topologia": "altro"
    },
    {
      "ordine": 4,
      "hz": 453.5,
      "topologia": "altro"
    },
    {
      "ordine": 5,
      "hz": 494.9,
      "topologia": "anello"
    },
    {
      "ordine": 6,
      "hz": 512,
      "topologia": "altro"
    },
    {
      "ordine": 7,
      "hz": 592.7,
      "topologia": "altro"
    },
    {
      "ordine": 8,
      "hz": 649.3,
      "topologia": "altro"
    },
    {
      "ordine": 9,
      "hz": 691.9,
      "topologia": "altro"
    },
    {
      "ordine": 10,
      "hz": 759.3,
      "topologia": "altro"
    },
    {
      "ordine": 11,
      "hz": 809.6,
      "topologia": "altro"
    },
    {
      "ordine": 12,
      "hz": 937.3,
      "topologia": "altro"
    }
  ]
}/*FINE*/ as MetaModi;
