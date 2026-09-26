// Icone di servizio di EVIDENZIA (vector-artist). Solo stringhe: nessun accesso al DOM.
// Tutte in currentColor, aria-hidden e senza id: si possono ripetere quante volte
// serve nella stessa pagina (il bottone Evidenzia compare in ogni annuncio).
// Vanno inserite inline accanto a un testo che dice già l'azione. Dettagli in docs/vector-artist.md.

import evidenziatore from './evidenziatore.svg?raw'
import frecciaSu from './freccia-su.svg?raw'
import frecciaGiu from './freccia-giu.svg?raw'
import indietro from './indietro.svg?raw'
import chiudi from './chiudi.svg?raw'
import precedente from './precedente.svg?raw'
import successiva from './successiva.svg?raw'
import frecciaEsterna from './freccia-esterna.svg?raw'

export { evidenziatore, frecciaSu, frecciaGiu, indietro, chiudi, precedente, successiva, frecciaEsterna }

export type NomeIcona =
  | 'evidenziatore'
  | 'freccia-su'
  | 'freccia-giu'
  | 'indietro'
  | 'chiudi'
  | 'precedente'
  | 'successiva'
  | 'freccia-esterna'

/** Tutte le icone per nome, per un eventuale componente <Icona nome="..." />. */
export const ICONE: Readonly<Record<NomeIcona, string>> = {
  evidenziatore,
  'freccia-su': frecciaSu,
  'freccia-giu': frecciaGiu,
  indietro,
  chiudi,
  precedente,
  successiva,
  'freccia-esterna': frecciaEsterna,
}

/** Dove si usa ciascuna icona (ux-architect §5), e a quale misura in px CSS. */
export const USO_ICONE: Readonly<Record<NomeIcona, { dove: string; px: number }>> = {
  evidenziatore: { dove: 'bottone Evidenzia degli annunci, toggle "Evidenzia per il giro" nella scheda', px: 20 },
  'freccia-su': { dove: 'bottone Prima delle tappe del giro', px: 20 },
  'freccia-giu': { dove: 'bottone Dopo delle tappe del giro', px: 20 },
  indietro: { dove: '"Rimetti nella pagina" e "Torna alla pagina" a 1440 (testo a destra dell\'icona)', px: 20 },
  chiudi: { dove: '"Rimetti nella pagina" e "Torna alla pagina" sotto i 640 px (icona a destra del testo)', px: 20 },
  precedente: { dove: 'bottone foto precedente della striscia nella scheda (44 × 44)', px: 24 },
  successiva: { dove: 'bottone foto successiva della striscia nella scheda (44 × 44)', px: 24 },
  'freccia-esterna': { dove: 'link che escono dal sito: openstreetmap.org, crediti Unsplash, CiceriLab', px: 14 },
}
