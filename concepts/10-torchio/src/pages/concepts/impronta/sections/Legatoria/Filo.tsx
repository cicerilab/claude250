/**
 * IMPRONTA · Legatoria · i pezzi del filo (section-builder-legatoria).
 *
 * Il filo della sezione è UNO, ma nel DOM è fatto di pezzi in fila:
 *
 *   ingresso ─ schema brossura ─ coda ─ schema cartonato ─ coda ─
 *   schema giapponese ─ coda ─ schema punto metallico ─ coda ─ uscita ─ nodo
 *
 * Ogni pezzo riceve da Legatoria.tsx due variabili, `--filo-da` e `--filo-a`
 * (frazioni 0..1 della lunghezza totale del filo, misurata in px veri), e
 * disegna il proprio tratto quando `--imp-filo-p` (scritto da `useFilo` del
 * motion) passa da `da` ad `a`. Tutto in CSS: nessun calcolo per frame qui.
 *
 * Gli schemi del vector-artist entrano inline una volta sola (id unici). Qui
 * si prepara la stringa, una volta, a livello di modulo (solo testo, nessun
 * accesso a window/document):
 * - al path del filo si aggiunge `pathLength="1"` e una classe;
 * - se ne fa una copia SENZA id (la "guida", tratteggio a matita che mostra
 *   dove passerà l'ago) messa sotto al filo;
 * - alle graffe del punto metallico `pathLength="1"` e una classe;
 * - il titolo dell'SVG si toglie (il contenitore è aria-hidden: il testo per
 *   i lettori di schermo è `LEGATORIA.voci[].filoAlt`, accanto) così non
 *   compare il suggerimento del browser al passaggio del mouse.
 */

import { forwardRef, memo, type CSSProperties } from 'react';
import { FILI, type Legatura as LegaturaSvg } from '../../assets/svg';

/** Unità del viewBox comune ai quattro schemi (vector-artist §3.1). */
export const SCHEMA_W = 240;
export const SCHEMA_H = 300;
/** x del filo nello schema: entra in (16, 0) ed esce in (16, 300). */
export const SCHEMA_FILO_X = 16;
/** Raggio del nodo finale, in unità dello schema (come il cappio della brossura). */
export const NODO_R = 5;

function preparaSchema(chiave: LegaturaSvg): string {
  const dati = FILI[chiave];
  let svg = dati.svg
    .replace(/<title[^>]*>[\s\S]*?<\/title>/, '')
    .replace(/\s(?:role|aria-labelledby)="[^"]*"/g, '')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" class="imp-legatoria__svg" ');

  const cerca = new RegExp(`<path id="${dati.filoId}"[^>]*/>`);
  const trovato = cerca.exec(svg);
  if (trovato !== null) {
    const originale = trovato[0];
    const guida = originale.replace(`id="${dati.filoId}"`, 'class="imp-legatoria__guida"');
    const filo = originale.replace(
      `id="${dati.filoId}"`,
      `id="${dati.filoId}" class="imp-legatoria__cucito" pathLength="1"`,
    );
    svg = svg.replace(originale, `${guida}${filo}`);
  }

  for (const tratto of dati.tratti ?? []) {
    svg = svg.replace(`id="${tratto.id}"`, `id="${tratto.id}" class="imp-legatoria__graffa" pathLength="1"`);
  }
  return svg;
}

/** Markup pronto dei quattro schemi (stringhe, calcolate una volta). */
const MARKUP: Record<LegaturaSvg, { __html: string }> = {
  brossura: { __html: preparaSchema('brossura') },
  cartonato: { __html: preparaSchema('cartonato') },
  giapponese: { __html: preparaSchema('giapponese') },
  'punto-metallico': { __html: preparaSchema('punto-metallico') },
};

interface SchemaProps {
  readonly legatura: LegaturaSvg;
}

/**
 * Lo schema di cucitura di una legatura, inline. Memo: il markup non cambia
 * mai, così React non riscrive l'innerHTML (e non perde gli stili del filo).
 */
export const SchemaFilo = memo(
  forwardRef<HTMLSpanElement, SchemaProps>(function SchemaFilo({ legatura }, ref) {
    return (
      <span
        ref={ref}
        className="imp-legatoria__schema imp-legatoria__pezzo"
        data-legatura={legatura}
        aria-hidden="true"
        dangerouslySetInnerHTML={MARKUP[legatura]}
      />
    );
  }),
);

interface TrattoProps {
  /** Dove sta il tratto: cambia solo la classe (posizione e altezza nel CSS). */
  readonly ruolo: 'ingresso' | 'coda' | 'uscita';
  readonly style?: CSSProperties;
}

/**
 * Tratto dritto del filo tra un punto e l'altro: una riga d'inchiostro larga
 * quanto il filo dello schema, che si srotola dall'alto (scaleY) mentre
 * `--imp-filo-p` attraversa il suo intervallo.
 */
export const TrattoFilo = forwardRef<HTMLSpanElement, TrattoProps>(function TrattoFilo({ ruolo, style }, ref) {
  return (
    <span
      ref={ref}
      className={`imp-legatoria__tratto imp-legatoria__tratto--${ruolo} imp-legatoria__pezzo`}
      aria-hidden="true"
      style={style}
    />
  );
});

/**
 * Il nodo finale: il filo si chiude su sé stesso accanto a "Prova la tua",
 * come il nodo con cui il legatore ferma l'ultima segnatura.
 */
export const NodoFilo = forwardRef<SVGSVGElement>(function NodoFilo(_props, ref) {
  const lato = NODO_R * 2 + 4;
  return (
    <svg
      ref={ref}
      className="imp-legatoria__nodo imp-legatoria__pezzo"
      viewBox={`${-lato / 2} 0 ${lato} ${lato}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        className="imp-legatoria__nodo-cerchio"
        cx="0"
        cy={NODO_R + 1}
        r={NODO_R}
        pathLength="1"
        transform={`rotate(-90 0 ${NODO_R + 1})`}
      />
    </svg>
  );
});
