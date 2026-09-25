// Asset vettoriali di IMPRONTA (vector-artist). Solo stringhe e dati: nessun accesso al DOM.
// Tutti gli SVG usano currentColor: il colore lo decide il CSS di chi li inserisce.
// Dettagli, misure e uso in docs/vector-artist.md.

import marchioImpronta from './marchio-impronta.svg?raw'
import filoBrossura from './filo-brossura.svg?raw'
import filoCartonato from './filo-cartonato.svg?raw'
import filoGiapponese from './filo-giapponese.svg?raw'
import filoPuntoMetallico from './filo-punto-metallico.svg?raw'
import freccia from './freccia.svg?raw'

export { marchioImpronta, filoBrossura, filoCartonato, filoGiapponese, filoPuntoMetallico, freccia }

/** Proporzioni del marchio (viewBox 0 0 941 100): larghezza = altezza × MARCHIO_RAPPORTO. */
export const MARCHIO_RAPPORTO = 9.41

export type Legatura = 'brossura' | 'cartonato' | 'giapponese' | 'punto-metallico'

export interface SchemaFilo {
  /** markup SVG completo, da inserire inline (aria-hidden sul contenitore) */
  svg: string
  /** viewBox comune: 240 × 300 */
  larghezza: number
  altezza: number
  /** id del path del filo da animare con stroke-dashoffset */
  filoId: string
  /** lunghezza del path del filo in unità del viewBox (getTotalLength in Chromium) */
  lunghezza: number
  /** punto d'ingresso e d'uscita del filo, identici nei quattro schemi: si concatenano in colonna */
  ingresso: readonly [number, number]
  uscita: readonly [number, number]
  /** frazione 0-1 del path in cui il filo entra nel primo foro e in cui finisce di cucire */
  cucitura: readonly [number, number]
  /** altri tratti animabili (le graffe del punto metallico) con la loro lunghezza */
  tratti?: readonly { id: string; lunghezza: number }[]
}

const INGRESSO = [16, 0] as const
const USCITA = [16, 300] as const

export const FILI: Record<Legatura, SchemaFilo> = {
  brossura: {
    svg: filoBrossura,
    larghezza: 240,
    altezza: 300,
    filoId: 'filo-brossura',
    lunghezza: 1224.6,
    ingresso: INGRESSO,
    uscita: USCITA,
    cucitura: [0.11, 0.895],
  },
  cartonato: {
    svg: filoCartonato,
    larghezza: 240,
    altezza: 300,
    filoId: 'filo-cartonato',
    lunghezza: 1330.5,
    ingresso: INGRESSO,
    uscita: USCITA,
    cucitura: [0.098, 0.906],
  },
  giapponese: {
    svg: filoGiapponese,
    larghezza: 240,
    altezza: 300,
    filoId: 'filo-giapponese',
    lunghezza: 1697.7,
    ingresso: INGRESSO,
    uscita: USCITA,
    cucitura: [0.114, 0.857],
  },
  'punto-metallico': {
    svg: filoPuntoMetallico,
    larghezza: 240,
    altezza: 300,
    filoId: 'filo-punto-metallico',
    lunghezza: 300,
    ingresso: INGRESSO,
    uscita: USCITA,
    cucitura: [0, 1],
    tratti: [
      { id: 'graffa-1', lunghezza: 99.9 },
      { id: 'graffa-2', lunghezza: 99.9 },
    ],
  },
}

/** Ordine delle fermate nella sezione Legatoria (ux-architect §5.5). */
export const ORDINE_LEGATURE: readonly Legatura[] = ['brossura', 'cartonato', 'giapponese', 'punto-metallico']
