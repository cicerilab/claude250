/**
 * NOVANTA · chi muove il braccio quando arriva una richiesta d'angolo.
 *
 * `richiediAngolo()` (state/store.ts) scrive solo la richiesta. In vista
 * quadrante la esegue `useBraccio` (section-builder-quadrante), che si
 * registra qui finché è montato: il braccio ruota con il rotore, il contenuto
 * cambia vicino all'arrivo, `onFermo` scrive l'hash. Se nessuno è registrato
 * (vista elenco, o quadrante non ancora montato) la esegue Novanta.tsx: angolo
 * subito, scroll alla sezione in elenco, hash con `replace`.
 *
 * Contatore, non booleano: regge il doppio montaggio di StrictMode.
 */

let guide = 0;

/** Lo chiama useBraccio in un effetto; restituisce la pulizia. */
export function registraGuida(): () => void {
  guide += 1;
  let staccata = false;
  return () => {
    if (staccata) return;
    staccata = true;
    guide = Math.max(0, guide - 1);
  };
}

/** true se un braccio montato sta eseguendo le richieste. */
export function guidaPresente(): boolean {
  return guide > 0;
}
