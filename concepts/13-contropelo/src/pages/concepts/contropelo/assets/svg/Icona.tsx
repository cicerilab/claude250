// Componenti SVG di CONTROPELO (vector-artist): <Icona /> e <Tratto />.
// Nessun id dentro gli SVG: si possono ripetere quante volte serve nella pagina.
// Nessun colore fisso: currentColor. Nessun accesso al DOM a livello di modulo.
// Dettagli, misure e usi in docs/vector-artist.md.

import type { CSSProperties } from 'react'
import { ICONE, TRATTO_ICONA, VIEWBOX_ICONA, type NomeIcona } from './icone'
import {
  cerchio,
  sottolineatura,
  trattino,
  tratteggio,
  TRATTEGGIO,
  type DatiTratto,
  type VarianteTrattino,
} from './tratti'

export type { NomeIcona } from './icone'
export type { VarianteTrattino } from './tratti'

const unisci = (...classi: Array<string | undefined | false>): string =>
  classi.filter(Boolean).join(' ')

interface PropsIcona {
  nome: NomeIcona
  /** Lato in px (numero) o qualsiasi misura CSS. Predefinito: 1em (segue il testo). */
  dimensione?: number | string
  /**
   * Da dare SOLO se l'icona è l'unico contenuto di un controllo senza aria-label
   * (meglio mettere aria-label sul bottone). Senza etichetta l'icona è aria-hidden.
   */
  etichetta?: string
  className?: string
  style?: CSSProperties
}

/**
 * Icona di servizio (Phosphor Light o disegnata a mano sulla stessa griglia).
 * Classe base `ctp-icona`; allineamento e margini li decide chi la usa.
 */
export function Icona({ nome, dimensione = '1em', etichetta, className, style }: PropsIcona) {
  const icona = ICONE[nome]
  const accessibile = etichetta
    ? { role: 'img' as const, 'aria-label': etichetta }
    : { 'aria-hidden': true as const }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEWBOX_ICONA}
      width={dimensione}
      height={dimensione}
      className={unisci('ctp-icona', className)}
      style={style}
      focusable="false"
      data-icona={nome}
      {...accessibile}
    >
      {icona.modo === 'pieno' ? (
        <path d={icona.d} fill="currentColor" />
      ) : (
        <path
          d={icona.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={TRATTO_ICONA}
          strokeLinecap="round"
          strokeLinejoin={'giunti' in icona ? icona.giunti : 'round'}
          strokeMiterlimit={4}
        />
      )}
    </svg>
  )
}

type PropsTratto = {
  className?: string
  style?: CSSProperties
} & (
  | {
      /** Sottolineatura del tuo nome. `larghezza` = larghezza del nome in px (misurata). */
      tipo: 'sottolineatura'
      larghezza: number
      seme?: number
    }
  | {
      /** Trattino del posto libero (3 varianti di mano). */
      tipo: 'trattino'
      variante?: VarianteTrattino
      larghezza?: number
    }
  | {
      /** Tratteggio della seconda mezz'ora di "taglio e barba". */
      tipo: 'tratteggio'
      larghezza?: number
    }
  | {
      /**
       * Cerchio a pennarello del fuoco. `larghezza` e `altezza` = rettangolo da
       * circondare. Si posiziona da solo (absolute, -sborda): il genitore deve
       * essere position: relative.
       */
      tipo: 'cerchio'
      larghezza: number
      altezza: number
      seme?: number
    }
)

function datiTratto(p: PropsTratto): DatiTratto {
  switch (p.tipo) {
    case 'sottolineatura':
      return sottolineatura(p.larghezza, p.seme)
    case 'trattino':
      return trattino(p.variante, p.larghezza)
    case 'tratteggio':
      return tratteggio(p.larghezza)
    case 'cerchio':
      return cerchio(p.larghezza, p.altezza, p.seme)
  }
}

/**
 * Tratto a pennarello, sempre aria-hidden (il significato lo dà il testo nascosto
 * della riga: "libero", "il tuo appuntamento"). Classi: `ctp-tratto` +
 * `ctp-tratto--<tipo>`. Tranne il tratteggio, il path ha `pathLength="1"`: per
 * tracciarlo basta `stroke-dasharray: 1; stroke-dashoffset: 1 → 0` in CSS
 * (motion-designer), con `stroke-dashoffset: 0` come stato finale in reduced motion.
 * Il path ha la classe `ctp-tratto__segno`.
 */
export function Tratto(props: PropsTratto) {
  const t = datiTratto(props)
  const tratteggiato = props.tipo === 'tratteggio'
  const posizione: CSSProperties | undefined =
    props.tipo === 'cerchio'
      ? { position: 'absolute', left: -t.sborda, top: -t.sborda, pointerEvents: 'none' }
      : undefined
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={t.viewBox}
      width={t.larghezza}
      height={t.altezza}
      className={unisci('ctp-tratto', `ctp-tratto--${props.tipo}`, props.className)}
      style={posizione ? { ...posizione, ...props.style } : props.style}
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="ctp-tratto__segno"
        d={t.d}
        fill="none"
        stroke="currentColor"
        strokeWidth={t.spessore}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={tratteggiato ? undefined : 1}
        strokeDasharray={tratteggiato ? TRATTEGGIO : undefined}
      />
    </svg>
  )
}
