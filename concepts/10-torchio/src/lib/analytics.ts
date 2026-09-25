/**
 * Stub di analytics per l'app standalone (NON si porta nel sito).
 *
 * Stessa firma e stesso tipo `TrackEvent` di `src/lib/analytics.ts` del sito
 * cicerilab (copiati il 25/09/2026, docs/integrazione-sito.md punto 2), così il
 * codice del concept compila identico nei due posti. Qui non si invia niente:
 * in sviluppo l'evento finisce in console.debug, in produzione è muto.
 *
 * Per i concept si usano solo:
 * - "apri_concept"       apertura del prototipo (params liberi, es. { concept: 10 })
 * - "demo_prenotazione"  prototipo esplorato fino in fondo (invio del banco di prova)
 */

export type TrackEvent =
  // — Macro conversioni: il lead è arrivato davvero —
  | 'lead_piano' // form piano inviato con successo
  | 'lead_info' // form "ho un dubbio / altra richiesta" inviato con successo
  // — Micro conversioni: intenzione alta, precedono il lead —
  | 'seleziona_piano' // click su SCEGLI BASE/PRO/PREMIUM
  | 'apri_richiesta_info' // click su "Hai dubbi o altre richieste?"
  | 'interesse_pubblicita' // add-on campagne aggiunto alla richiesta dalla carta sotto i piani
  | 'form_riepilogo' // dati compilati e validi, arrivo al riepilogo
  | 'apri_concept' // apertura di un prototipo del Concept Lab
  | 'demo_prenotazione' // prototipo esplorato fino in fondo: prenotazione finta completata
  // — Segnali di interesse / diagnostica —
  | 'vedi_settore' // navigazione tra i settori del sito
  | 'apri_faq' // apertura di una domanda frequente nella sezione piani
  | 'toggle_ciclo' // switch mensile/annuale sui piani
  | 'click_instagram' // uscita verso il profilo Instagram
  | 'copia_email' // copia dell'indirizzo email dalla status line
  | 'errore_invio'; // invio form fallito (per accorgersi dei lead persi)

type Params = Record<string, string | number | boolean | undefined>;

/** Come nel sito: toglie i parametri undefined, poi (qui) scrive in console solo in sviluppo. */
export const track = (event: TrackEvent, params: Params = {}): void => {
  const clean: Params = {};
  for (const [k, v] of Object.entries(params)) if (v !== undefined) clean[k] = v;
  if (import.meta.env.DEV) {
    console.debug('[track]', event, clean);
  }
};
