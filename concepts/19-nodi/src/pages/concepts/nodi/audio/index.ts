/**
 * NODI · audio (chunk lazy, interaction-designer).
 *
 * Si carica solo al primo tocco di "Suono" o "Senti la voce", attraverso
 * interaction/suono.ts, che crea il contesto dentro il gesto e lo passa qui
 * con `usaContesto`. Nessuna libreria: oscillatori, filtro e guadagni nativi.
 */

export { usaContesto, chiudiAudio } from './contesto';
export { accendiAltoparlante, spegniAltoparlante } from './altoparlante';
export { suonaNotaEsempio, fermaNotaEsempio } from './notaEsempio';
