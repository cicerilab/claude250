/*
 * NOVANTA · assets/svg/index.ts (vector-artist)
 * Icone di Tabler Icons 3.48.0 (MIT, licenza in icone/LICENSE-tabler.txt),
 * ripulite e ottimizzate con svgo. Solo stringhe: nessun accesso al DOM.
 * Tutte usano currentColor e stroke-width 2 sul viewBox 24: il colore e la
 * misura li decide il CSS di chi le inserisce. Hanno già aria-hidden="true"
 * e focusable="false": il testo accessibile sta sempre nel controllo.
 * Il quadrante, i mini archi e l'indice NON sono file: li genera dial/Arco.tsx.
 */

import telefono from './icone/telefono.svg?raw';
import calendario from './icone/calendario.svg?raw';
import errore from './icone/errore.svg?raw';
import esterno from './icone/esterno.svg?raw';
import elenco from './icone/elenco.svg?raw';
import quadrante from './icone/quadrante.svg?raw';
import precedente from './icone/precedente.svg?raw';
import successivo from './icone/successivo.svg?raw';

/** Markup SVG completo di ogni icona, da inserire inline in uno <span> (dangerouslySetInnerHTML). */
export const ICONE = {
  /** Tabler "phone": link tel: in testata e a 180° */
  telefono,
  /** Tabler "calendar-plus": "Aggiungi al calendario" dopo la prenotazione */
  calendario,
  /** Tabler "ban", il cerchio barrato: errore di campo, sempre accanto al messaggio scritto */
  errore,
  /** Tabler "arrow-up-right": link che escono dal sito ("Apri in Maps") */
  esterno,
  /** Tabler "list": interruttore "Leggi in elenco" */
  elenco,
  /** Tabler "angle": interruttore "Torna al quadrante" */
  quadrante,
  /** Tabler "chevron-left" / "chevron-right": passi ±30° nel basamento e "prima / dopo" del controllo */
  precedente,
  successivo,
} as const;

export type NomeIcona = keyof typeof ICONE;
