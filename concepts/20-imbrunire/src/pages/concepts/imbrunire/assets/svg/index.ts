// Icone di servizio di IMBRUNIRE (vector-artist). Solo stringhe: nessun accesso al DOM.
// Tutte in currentColor, aria-hidden, focusable="false" e senza id: si possono ripetere
// quante volte serve nella stessa pagina. Vanno inserite inline accanto a un testo che
// dice già l'azione (mai un bottone con la sola icona senza aria-label).
// Nessuna luna qui: la luna è calcolata e generata da luna/disegno.ts (CD §7.4).
// Dettagli, misure e usi in docs/vector-artist.md.

import avviso from './avviso.svg?raw'
import calendario from './calendario.svg?raw'
import chiudi from './chiudi.svg?raw'
import esterna from './esterna.svg?raw'
import indietro from './indietro.svg?raw'
import portaDestra from './porta-destra.svg?raw'
import portaSinistra from './porta-sinistra.svg?raw'
import scalaGiu from './scala-giu.svg?raw'
import scalaSu from './scala-su.svg?raw'

export { avviso, calendario, chiudi, esterna, indietro, portaDestra, portaSinistra, scalaGiu, scalaSu }

export type NomeIcona =
  | 'avviso'
  | 'calendario'
  | 'chiudi'
  | 'esterna'
  | 'indietro'
  | 'porta-destra'
  | 'porta-sinistra'
  | 'scala-giu'
  | 'scala-su'

/** Tutte le icone per nome, per un eventuale componente <Icona nome="..." />. */
export const ICONE: Readonly<Record<NomeIcona, string>> = {
  avviso,
  calendario,
  chiudi,
  esterna,
  indietro,
  'porta-destra': portaDestra,
  'porta-sinistra': portaSinistra,
  'scala-giu': scalaGiu,
  'scala-su': scalaSu,
}

/** Dove si usa ciascuna icona (ux-architect §2.2, §5.2-5.6, §6.3) e a quale misura in px CSS. */
export const USO_ICONE: Readonly<Record<NomeIcona, { dove: string; px: number }>> = {
  avviso: { dove: 'accanto al messaggio di errore sotto un campo del pannello di prenotazione (F1), in luna', px: 16 },
  calendario: { dove: '"Aggiungi al calendario" nella frase di successo (#/ti-aspettiamo)', px: 20 },
  chiudi: { dove: '"Chiudi" del foglio delle lune su mobile e "Chiudi l\'elenco" (icona dopo il testo)', px: 20 },
  esterna: { dove: '"Apri in Maps" nel portico e link che escono dal sito (icona dopo il testo)', px: 14 },
  indietro: { dove: '"Torna al palazzo" dentro una stanza o uno spazio comune (icona prima del testo)', px: 20 },
  'porta-destra': { dove: 'porta laterale verso la stanza accanto a destra, "guarda la finestra ▸", mese successivo ›, "Entra" nell\'elenco', px: 20 },
  'porta-sinistra': { dove: 'porta laterale verso la stanza accanto a sinistra, "◂ guarda il letto", mese precedente ‹', px: 20 },
  'scala-giu': { dove: '"▾ piano di sotto" col nome della stanza d\'arrivo (scala dentro la stanza)', px: 20 },
  'scala-su': { dove: '"▴ piano di sopra" col nome della stanza d\'arrivo (scala dentro la stanza)', px: 20 },
}
