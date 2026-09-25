# Fatti reali del sito cicerilab/cicerilab (letti dal repo il 25/09/2026)

Nota dell'orchestratore: questi fatti PREVALGONO su quanto ipotizzato in
tech-architect.md dove sono in conflitto.

1. **Il `main` su GitHub contiene solo i concept 1–9** (`src/App.tsx`,
   `src/content/site.ts`). Il sito online ha anche 10–20: quel codice non è
   su GitHub. Il porting finale si fa quando Luca avrà pubblicato la sua
   versione locale.
2. **`track()`** (`src/lib/analytics.ts`): firma
   `track(event: TrackEvent, params?: Record<string, string|number|boolean|undefined>)`.
   `TrackEvent` è un'unione CHIUSA. Per i concept si usano solo:
   - `"apri_concept"` (apertura del prototipo; params liberi, es. `{ concept: 10 }`)
   - `"demo_prenotazione"` (prototipo esplorato fino in fondo: invio del banco di prova)
   Tutti gli altri eventi del concept vanno come params di questi due, oppure
   non si tracciano. Lo stub standalone `src/lib/analytics.ts` deve avere
   lo stesso tipo `TrackEvent` (copiato) e la stessa firma.
3. **"Torna in Ciceri Lab"**: tutti i concept usano il componente condiviso
   `@/components/ConceptBackButton` (default export, props opzionali
   `label`, `onClick`). È `position: fixed`, in alto a sinistra (top 14px,
   left 14px) su desktop e **in basso a sinistra sotto i 640px**, z-index
   altissimo, stile proprio di CiceriLab (carta bianca, bordo nero, mono
   maiuscolo). Il concept NON crea un proprio link "torna": monta questo
   componente e lascia libera quella zona (in alto a sinistra ~230×44px su
   desktop, in basso a sinistra ~210×44px su mobile). Eccezione ammessa
   alla regola "nessun import fuori da impronta/": `@/components/ConceptBackButton`
   e `@/lib/analytics`. Lo scaffold ne mette una copia fedele nell'app
   standalone (con `returnToConceptLab` sostituito da `location.href = "/"`).
4. **Nessun Lenis globale**: il sito lo ha tolto (conflitti con la scena
   Babylon della home). Il concept può crearne uno suo, montato e distrutto
   con la pagina, e deve ripristinare lo stato di html/body allo smontaggio.
5. `src/content/site.ts` → `CONCEPTS` ha campi `id, tag, title, subtitle,
   desc, icon` (niente `perche`/`mestieri` sul main attuale).
6. Il sito NON usa GSAP; three è 0.160 (con @types/three 0.160).
