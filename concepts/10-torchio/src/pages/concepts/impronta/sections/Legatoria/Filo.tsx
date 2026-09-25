/**
 * IMPRONTA · Legatoria · i pezzi del filo (section-builder-legatoria).
 *
 * Il filo della sezione è UNO, ma nel DOM è fatto di pezzi in fila. In ogni
 * fermata:
 *
 *   entra (orizzontale, in testa) ─ scende ─ SCHEMA ─ esce ─ traversa ─ coda
 *
 * e in fondo alla sezione: scende ─ traversa (sotto "Prova la tua") ─ nodo.
 * Da 600 px il filo va a serpentina da un lato all'altro della pagina
 * (schemi alternati a sinistra e a destra); su 375 scende nel margine
 * esterno, entra nello schema e sottolinea il nome della legatura. Quali
 * pezzi esistono e dove stanno lo decide `legatoria.css`: un pezzo nascosto
 * misura 0 e non conta nella lunghezza.
 *
 * Ogni pezzo porta `data-imp-var="--imp-filo-p"` (lo scrive lì il motion) e
 * riceve da Legatoria.tsx `--filo-da` e `--filo-a` (frazioni 0..1
 * della lunghezza totale, misurata in px veri) e si disegna quando
 * `--imp-filo-p` (motion, `useFilo`) attraversa il suo intervallo. Tutto in
 * CSS: nessun calcolo per frame qui.
 *
 * Gli schemi del vector-artist entrano inline una volta sola (id unici). La
 * stringa si prepara una volta, a livello di modulo (solo testo, nessun
 * accesso a window/document):
 * - al path del filo `pathLength="1"` e una classe;
 * - una copia SENZA id del path (la "guida" a matita) sotto al filo;
 * - alle graffe del punto metallico `pathLength="1"` e una classe;
 * - via `<title>`, `role`, `aria-labelledby`: il contenitore è aria-hidden e
 *   il testo per i lettori di schermo è `LEGATORIA.voci[].filoAlt`.
 */

import { forwardRef, memo } from 'react';
import { FILI, type Legatura as LegaturaSvg } from '../../assets/svg';
import { VAR } from '../../motion/choreography';

/**
 * Giro 2 del motion-designer: `useScrollProgress` scrive `--imp-filo-p` solo
 * sulle foglie marcate `data-imp-var`, cioè sui pezzi del filo, e non più su
 * tutto il corpo della sezione a ogni frame.
 */
const VAR_FILO = VAR.filoP;

/** Unità del viewBox comune ai quattro schemi (vector-artist §3.1). */
export const SCHEMA_W = 240;
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
 * mai, così React non riscrive l'innerHTML.
 */
export const SchemaFilo = memo(
  forwardRef<HTMLSpanElement, SchemaProps>(function SchemaFilo({ legatura }, ref) {
    return (
      <span
        ref={ref}
        className="imp-legatoria__schema imp-legatoria__pezzo"
        data-legatura={legatura}
        data-imp-var={VAR_FILO}
        aria-hidden="true"
        dangerouslySetInnerHTML={MARKUP[legatura]}
      />
    );
  }),
);

export type RuoloTratto =
  | 'ingresso'
  | 'entra'
  | 'scende'
  | 'esce'
  | 'traversa'
  | 'coda'
  | 'fine-scende'
  | 'fine-traversa';

/** Tratti che corrono in orizzontale (si misurano in larghezza, si srotolano con scaleX). */
const ORIZZONTALI: ReadonlySet<RuoloTratto> = new Set<RuoloTratto>(['entra', 'traversa', 'fine-traversa']);

interface TrattoProps {
  readonly ruolo: RuoloTratto;
}

/**
 * Tratto dritto del filo: sotto il percorso a matita, sopra la riga
 * d'inchiostro larga quanto il filo degli schemi, che si srotola
 * (scaleX / scaleY) mentre `--imp-filo-p` attraversa il suo intervallo.
 */
export const TrattoFilo = forwardRef<HTMLSpanElement, TrattoProps>(function TrattoFilo({ ruolo }, ref) {
  const verso = ORIZZONTALI.has(ruolo) ? 'orizzontale' : 'verticale';
  return (
    <span
      ref={ref}
      className={`imp-legatoria__tratto imp-legatoria__tratto--${verso} imp-legatoria__tratto--${ruolo} imp-legatoria__pezzo`}
      data-verso-tratto={verso}
      data-imp-var={VAR_FILO}
      aria-hidden="true"
    />
  );
});

/**
 * Il nodo finale: il filo arriva da destra sotto "Prova la tua" e si chiude
 * su sé stesso, come il nodo con cui il legatore ferma l'ultima segnatura.
 * Il cerchio parte dal punto a destra (dove arriva il filo).
 */
export const NodoFilo = forwardRef<SVGSVGElement>(function NodoFilo(_props, ref) {
  const lato = NODO_R * 2 + 2.4;
  const centro = lato / 2;
  return (
    <svg
      ref={ref}
      className="imp-legatoria__nodo imp-legatoria__pezzo"
      data-imp-var={VAR_FILO}
      viewBox={`0 0 ${lato} ${lato}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle className="imp-legatoria__nodo-cerchio" cx={centro} cy={centro} r={NODO_R} pathLength="1" />
    </svg>
  );
});
