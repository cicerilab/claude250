// Icone di servizio di CONTROPELO (vector-artist). Solo dati: nessun accesso al DOM.
//
// Cinque icone sono Phosphor Icons, peso Light, copiate come path da
// @phosphor-icons/core 2.1.1 (https://github.com/phosphor-icons/core).
// Licenza MIT, Copyright (c) 2023 Phosphor Icons: il testo completo della licenza
// e l'elenco dei file di origine sono in docs/vector-artist.md.
// Le due icone dello specchio ("vapore" e "pulito") sono disegnate a mano sulla
// stessa griglia 256 e con lo stesso tratto Light (12 unità), con gli spigoli vivi
// del bisello degli specchi (CD §4.3).
//
// Nessuna forbice, rasoio, pettine, baffo, palo o figura (CD §4.3, §12).
// Tutte in currentColor: prendono il colore del testo accanto (pennarello).
// Si usano con <Icona nome="..." /> di Icona.tsx.

/** Griglia comune a tutte le icone. */
export const VIEWBOX_ICONA = '0 0 256 256'

/** Spessore del tratto delle icone disegnate a tratto (Light Phosphor = 12 su 256). */
export const TRATTO_ICONA = 12

export type ModoIcona = 'pieno' | 'tratto'

export interface DatiIcona {
  /** 'pieno' = path riempito (Phosphor), 'tratto' = path a tratto 12/256. */
  readonly modo: ModoIcona
  readonly d: string
  /** Solo per 'tratto': giunti degli angoli. */
  readonly giunti?: 'miter' | 'round'
}

export const ICONE = {
  /** Phosphor "info" Light. Bottone "Informazioni" nella fascia su mobile. */
  info: {
    modo: 'pieno',
    d: 'M142,176a6,6,0,0,1-6,6,14,14,0,0,1-14-14V128a2,2,0,0,0-2-2,6,6,0,0,1,0-12,14,14,0,0,1,14,14v40a2,2,0,0,0,2,2A6,6,0,0,1,142,176ZM124,94a10,10,0,1,0-10-10A10,10,0,0,0,124,94Zm106,34A102,102,0,1,1,128,26,102.12,102.12,0,0,1,230,128Zm-12,0a90,90,0,1,0-90,90A90.1,90.1,0,0,0,218,128Z',
  },
  /** Phosphor "x" Light. "chiudi" del pannello Informazioni. */
  chiudi: {
    modo: 'pieno',
    d: 'M204.24,195.76a6,6,0,1,1-8.48,8.48L128,136.49,60.24,204.24a6,6,0,0,1-8.48-8.48L119.51,128,51.76,60.24a6,6,0,0,1,8.48-8.48L128,119.51l67.76-67.75a6,6,0,0,1,8.48,8.48L136.49,128Z',
  },
  /** Phosphor "warning-circle" Light. Accanto a ogni errore di campo e di servizio (L6e, L8). */
  avviso: {
    modo: 'pieno',
    d: 'M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm-6-82V80a6,6,0,0,1,12,0v56a6,6,0,0,1-12,0Zm16,36a10,10,0,1,1-10-10A10,10,0,0,1,138,172Z',
  },
  /** Phosphor "arrow-up-right" Light. "Apri in Maps" (link che esce dal sito). */
  esterna: {
    modo: 'pieno',
    d: 'M198,64V168a6,6,0,0,1-12,0V78.48L68.24,196.24a6,6,0,0,1-8.48-8.48L177.52,70H88a6,6,0,0,1,0-12H192A6,6,0,0,1,198,64Z',
  },
  /** Phosphor "phone" Light. "Chiama" (vetro di Samir, riga di stato, invio fallito). */
  telefono: {
    modo: 'pieno',
    d: 'M221.59,160.3l-47.24-21.17a14,14,0,0,0-13.28,1.22,4.81,4.81,0,0,0-.56.42l-24.69,21a1.88,1.88,0,0,1-1.68.06c-15.87-7.66-32.31-24-40-39.65a1.91,1.91,0,0,1,0-1.68l21.07-25a6.13,6.13,0,0,0,.42-.58,14,14,0,0,0,1.12-13.27L95.73,34.49a14,14,0,0,0-14.56-8.38A54.24,54.24,0,0,0,34,80c0,78.3,63.7,142,142,142a54.25,54.25,0,0,0,53.89-47.17A14,14,0,0,0,221.59,160.3ZM176,210C104.32,210,46,151.68,46,80A42.23,42.23,0,0,1,82.67,38h.23a2,2,0,0,1,1.84,1.31l21.1,47.11a2,2,0,0,1,0,1.67L84.73,113.15a4.73,4.73,0,0,0-.43.57,14,14,0,0,0-.91,13.73c8.87,18.16,27.17,36.32,45.53,45.19a14,14,0,0,0,13.77-1c.19-.13.38-.27.56-.42l24.68-21a1.92,1.92,0,0,1,1.6-.1l47.25,21.17a2,2,0,0,1,1.21,2A42.24,42.24,0,0,1,176,210Z',
  },
  /**
   * Disegnata a mano. Interruttore "Specchio pulito" con aria-pressed="false":
   * lo specchio (quadrato a spigolo vivo) con tre righe di vapore spezzate nella
   * metà bassa, dove il vapore e' più fitto (CD §6.2).
   */
  vapore: {
    modo: 'tratto',
    giunti: 'miter',
    d: 'M40 40h176v176H40ZM72 136h40m24 0h48M72 164h24m24 0h64M72 192h72m24 0h16',
  },
  /**
   * Disegnata a mano. Interruttore "Specchio pulito" con aria-pressed="true":
   * lo stesso specchio, pulito, con i due riflessi obliqui in alto a sinistra.
   */
  pulito: {
    modo: 'tratto',
    giunti: 'miter',
    d: 'M40 40h176v176H40ZM76 116l40-40m-40 80 80-80',
  },
} as const satisfies Record<string, DatiIcona>

export type NomeIcona = keyof typeof ICONE

/**
 * Dove si usa ogni icona e a che misura (px CSS). Solo documentazione per i
 * section-builder: l'icona sta sempre accanto a un testo che dice già l'azione,
 * oppure dentro un bottone con aria-label.
 */
export const USO_ICONE: Readonly<Record<NomeIcona, string>> = {
  info: 'fascia alta < 640 px: bottone "Informazioni" 44 x 44 solo icona, aria-label obbligatorio; 22 px',
  chiudi: 'pannello Informazioni: "chiudi" 44 x 44 (icona 20 px + testo nascosto o visibile)',
  avviso: 'riga di scrittura: prima del testo di errore in Figtree 15; 18 px, allineata alla prima riga',
  esterna: 'vetro di Samir: dopo "Apri in Maps"; 0,8 em (circa 20 px su Mansalva 26)',
  telefono: 'vetro di Samir e riga di stato: prima di "Chiama"; 0,8 em',
  vapore: 'mensola / fascia: interruttore "Specchio pulito" quando il vapore è attivo; 22 px',
  pulito: 'mensola / fascia: interruttore "Specchio pulito" quando è premuto; 22 px',
}
