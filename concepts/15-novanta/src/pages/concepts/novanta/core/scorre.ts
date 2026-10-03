/**
 * NOVANTA · l'area che scorre adesso (per `useRotella({ scrollInterno })`,
 * interaction-designer §7): il corpo dell'angolo in vista, in vista
 * quadrante. Null in vista elenco (scorre la pagina) o fuori dal browser.
 * Legge solo il DOM (nessuna misura): si può chiamare in un handler.
 */

export function corpoAttivo(radice?: ParentNode | null): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const base = radice ?? document;
  return base.querySelector<HTMLElement>(
    '.nov-root[data-modo="quadrante"] .nov-angolo:is([data-stato="attivo"], [data-stato="entra"]) .nov-angolo__corpo',
  );
}
