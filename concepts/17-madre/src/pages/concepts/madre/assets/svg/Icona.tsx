import { ICONE, type NomeIcona } from './index'

interface IconaProps {
  nome: NomeIcona
  /** classi in più (prefisso mad-), per esempio per girare il chevron: `mad-icona--su` */
  className?: string
}

/**
 * Icona di servizio inline, sempre decorativa (aria-hidden): il testo accanto o
 * l'aria-label del bottone dicono cosa fa. Prende colore (currentColor) e misura
 * (1em) dal testo che la contiene. Nessun id dentro gli SVG: si ripete senza conflitti.
 */
export default function Icona({ nome, className }: IconaProps) {
  return (
    <span
      className={className ? `mad-icona ${className}` : 'mad-icona'}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONE[nome] }}
    />
  )
}
