/**
 * IMBRUNIRE · variabili CSS del movimento.
 *
 * `variabiliMotion(ridotto)` produce lo stile inline della radice `.imb-root`
 * (lo applica solo `Imbrunire.tsx`): durate e curve come variabili, così i CSS
 * delle sezioni non scrivono mai numeri di tempo. Con reduced motion le
 * durate delle luci scendono a 250 ms, gli spostamenti a zero, le durate
 * dell'interfaccia a 0 ms (stato finale immediato).
 *
 * `stileCella(slug)` produce le due variabili di ritardo di una cella del
 * palazzo (le applica `Cella.tsx` in render: sono costanti per cella).
 *
 * Modulo puro: nessun accesso a window/document.
 */

import type { CSSProperties } from 'react';
import type { SlugCella } from '../state/store';
import { BEZIER_CSS } from './easing';
import {
  CAMERA,
  DURATA_ACCENSIONE,
  INTERFACCIA,
  LUCE,
  NASTRO,
  SUCCESSO,
  ritardoAccensione,
  ritardoLuce,
} from './choreography';

/** Stile con variabili CSS personalizzate. */
export type StileVariabili = CSSProperties & Record<`--imb-${string}`, string>;

function ms(n: number): string {
  return `${Math.round(n)}ms`;
}

/**
 * Nomi e significato (vedi docs/motion-designer.md §5):
 *
 * luci
 *   --imb-luce-accensione-durata   accensione iniziale di ogni stanza
 *   --imb-luce-accendi-durata      stanza che torna accesa per le notti
 *   --imb-luce-spegni-durata       stanza che si spegne per le notti
 *   --imb-luce-accendi-curva / --imb-luce-spegni-curva
 *   --imb-luce-calore-entra / --imb-luce-calore-esce   velatura +8% al passaggio
 *   --imb-luce-sfalsa              1 se le celle usano il loro ritardo, 0 se no
 * telecamera e stanza
 *   --imb-camera-dissolvenza       dissolvenza incrociata (ridotto, elenco, indirizzo)
 *   --imb-foto-seconda-durata      cambio della parete (seconda foto)
 *   --imb-foto-caricata-durata     la foto che sostituisce l'intonaco
 * interfaccia
 *   --imb-dur-rapida / --imb-curva-rapida
 *   --imb-dur-foglio / --imb-curva-foglio
 *   --imb-dur-bottone-lune
 *   --imb-dur-ora-arrivo / --imb-curva-ora-arrivo
 * lune
 *   --imb-dur-fasi-luna            le fasi calcolate che entrano
 *   --imb-luna-successo-durata / --imb-luna-successo-salita / --imb-luna-successo-ritardo
 *   --imb-frase-successo-durata / --imb-frase-successo-ritardo
 */
export function variabiliMotion(ridotto: boolean): StileVariabili {
  const luceLenta = (v: number): string => ms(ridotto ? LUCE.ridotta : v);
  const rapida = (v: number): string => ms(ridotto ? 0 : v);
  return {
    '--imb-luce-accensione-durata': luceLenta(DURATA_ACCENSIONE),
    '--imb-luce-accendi-durata': luceLenta(LUCE.accendi),
    '--imb-luce-spegni-durata': luceLenta(LUCE.spegni),
    '--imb-luce-accendi-curva': ridotto ? BEZIER_CSS.lineare : BEZIER_CSS.accendi,
    '--imb-luce-spegni-curva': ridotto ? BEZIER_CSS.lineare : BEZIER_CSS.spegni,
    '--imb-luce-calore-entra': rapida(LUCE.caloreEntra),
    '--imb-luce-calore-esce': rapida(LUCE.caloreEsce),
    '--imb-luce-sfalsa': ridotto ? '0' : '1',

    '--imb-camera-dissolvenza': ms(CAMERA.dissolvenza),
    '--imb-foto-seconda-durata': ms(ridotto ? CAMERA.dissolvenza : INTERFACCIA.secondaFoto),
    '--imb-foto-caricata-durata': ms(ridotto ? 0 : INTERFACCIA.fotoCaricata),

    '--imb-dur-rapida': rapida(INTERFACCIA.rapida),
    '--imb-curva-rapida': BEZIER_CSS.interfaccia,
    '--imb-dur-foglio': rapida(INTERFACCIA.foglio),
    '--imb-curva-foglio': BEZIER_CSS.foglio,
    '--imb-dur-bottone-lune': rapida(INTERFACCIA.bottoneLune),
    '--imb-dur-ora-arrivo': rapida(INTERFACCIA.oraArrivo),
    '--imb-curva-ora-arrivo': BEZIER_CSS.accendi,

    '--imb-dur-fasi-luna': rapida(NASTRO.fasi),
    '--imb-luna-successo-durata': ms(ridotto ? LUCE.ridotta : SUCCESSO.lunaDurata),
    '--imb-luna-successo-salita': `${ridotto ? 0 : SUCCESSO.lunaSalita}px`,
    '--imb-luna-successo-ritardo': ms(ridotto ? 0 : SUCCESSO.luna),
    '--imb-frase-successo-durata': rapida(SUCCESSO.fraseDurata),
    '--imb-frase-successo-ritardo': ms(ridotto ? 0 : SUCCESSO.frase),
  };
}

/**
 * Ritardi di una cella del palazzo. Il CSS li moltiplica per
 * `--imb-luce-sfalsa` (0 con reduced motion: una sola partenza).
 *   --imb-accensione-ritardo   posto nella sequenza dell'accensione iniziale
 *   --imb-luce-ritardo         sfalsamento quando cambiano le notti (0..480 ms)
 */
export function stileCella(slug: SlugCella): StileVariabili {
  return {
    '--imb-accensione-ritardo': ms(ritardoAccensione(slug)),
    '--imb-luce-ritardo': ms(ritardoLuce(slug)),
  };
}
