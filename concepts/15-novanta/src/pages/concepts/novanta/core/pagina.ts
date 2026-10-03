/**
 * NOVANTA · html/body in vista quadrante (tech-architect §7.3, §9).
 *
 * In vista quadrante la pagina non scorre: `overflow: hidden` e
 * `overscroll-behavior: none` su html e body (niente rimbalzo di iOS che
 * trascina la pagina invece del braccio). In vista elenco lo scroll è quello
 * nativo. Il fondo albicocca va su html/body inline (niente strisce di un
 * altro colore nel rimbalzo). Tutto viene rimesso ESATTAMENTE com'era allo
 * smontaggio. Solo Novanta.tsx. Nessun accesso al browser a livello di modulo.
 */

interface Ricordo {
  htmlOverflow: string;
  htmlOverscroll: string;
  bodyOverflow: string;
  bodyOverscroll: string;
  htmlFondo: string;
  bodyFondo: string;
}

let ricordo: Ricordo | null = null;

function ricorda(): void {
  if (ricordo !== null) return;
  const h = document.documentElement.style;
  const b = document.body.style;
  ricordo = {
    htmlOverflow: h.overflow,
    htmlOverscroll: h.overscrollBehavior,
    bodyOverflow: b.overflow,
    bodyOverscroll: b.overscrollBehavior,
    htmlFondo: h.backgroundColor,
    bodyFondo: b.backgroundColor,
  };
}

/** Fondo del documento (inline). */
export function impostaFondoPagina(colore: string): void {
  if (typeof document === 'undefined') return;
  ricorda();
  document.documentElement.style.backgroundColor = colore;
  document.body.style.backgroundColor = colore;
}

/** Blocca (quadrante) o libera (elenco) lo scroll della pagina. */
export function bloccaPagina(blocca: boolean): void {
  if (typeof document === 'undefined') return;
  ricorda();
  const h = document.documentElement.style;
  const b = document.body.style;
  if (blocca) {
    h.overflow = 'hidden';
    b.overflow = 'hidden';
    h.overscrollBehavior = 'none';
    b.overscrollBehavior = 'none';
  } else if (ricordo !== null) {
    h.overflow = ricordo.htmlOverflow;
    b.overflow = ricordo.bodyOverflow;
    h.overscrollBehavior = ricordo.htmlOverscroll;
    b.overscrollBehavior = ricordo.bodyOverscroll;
  }
}

/** Rimette html e body come prima del mount (smontaggio). */
export function ripristinaPagina(): void {
  if (typeof document === 'undefined' || ricordo === null) return;
  const h = document.documentElement.style;
  const b = document.body.style;
  h.overflow = ricordo.htmlOverflow;
  b.overflow = ricordo.bodyOverflow;
  h.overscrollBehavior = ricordo.htmlOverscroll;
  b.overscrollBehavior = ricordo.bodyOverscroll;
  h.backgroundColor = ricordo.htmlFondo;
  b.backgroundColor = ricordo.bodyFondo;
  ricordo = null;
}
