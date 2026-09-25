# Processo a ondate di agent (prompt di Luca)

Da seguire per ogni concept del Concept Lab. Testo originale:

```
Costruisci un sito di livello Awwwards "Site of the Day": design mai visto, non template.
Orchestra i seguenti sub-agent. Gli agent della stessa ONDATA vanno lanciati IN PARALLELO.
Ogni agent scrive il proprio output in /docs/<nome-agent>.md prima che parta l'ondata successiva.
Ogni agent ha file di competenza esclusivi: nessun agent modifica file di un altro.

SKILL DISPONIBILI (usale esplicitamente dove indicato):
- design-taste-frontend → regole di gusto per tutto il codice frontend
- taste → /taste <url> estrae il design DNA di un sito (tramite Playwright MCP)
- image-to-code → pipeline immagine → analisi → codice
- redesign-existing-projects → solo se si parte da un sito esistente
- full-output-enforcement → vieta output troncati o "// resto del codice qui"
- web-design-guidelines → audit UI/UX/accessibilità
- playwright-cli → screenshot, test, navigazione browser
- image-to-svg → vettorializzazione fedele di loghi, icone, illustrazioni
- Libreria riferimenti: ~/design-references/awesome-design-md/design-md/

REGOLE GLOBALI
- Tutti gli agent che scrivono codice frontend seguono design-taste-frontend e full-output-enforcement.
- I riferimenti (awesome-design-md, /taste) servono per estrarre PRINCIPI, mai per copiare 1:1.
- Vietati i cliché: hero con gradiente viola, card con ombre generiche, bento grid standard, font Inter.

=== ONDATA 0 — Direzione (sequenziale) ===
1. creative-director: seguendo design-taste-frontend, definisce il concept (una metafora visiva
   forte), 3 direzioni creative radicalmente diverse, ne sceglie una e motiva la scelta.

=== ONDATA 1 — Ricerca e strategia (parallelo) ===
2. trend-researcher: esegue /taste su 3-5 siti di riferimento (Awwwards SOTD recenti coerenti
   col concept) e consulta awesome-design-md; produce un documento con principi da reinterpretare
   e pattern ormai inflazionati da evitare.
3. brand-strategist: tono di voce, messaggio chiave, gerarchia dei contenuti.
4. ux-architect: sitemap, flusso narrativo di scroll, user journey, wireframe testuali per sezione.
5. tech-architect: stack (es. Next.js/Astro + Three.js/R3F + GSAP + Lenis), struttura cartelle,
   budget di performance, strategia di caricamento asset 3D.

=== ONDATA 2 — Design system (parallelo) ===
6. art-director: tipografia (display sperimentale + testo), palette, griglia non convenzionale,
   texture, trattamento immagini. Scrive DESIGN.md nella root del progetto (formato Stitch)
   e i design tokens in /src/styles/tokens.
7. motion-designer: coreografia completa dello scroll, easing personalizzati, transizioni di pagina,
   timeline GSAP documentate sezione per sezione.
8. webgl-artist: scena 3D/shader principale (GLSL custom, post-processing, particelle o
   distorsioni legate a scroll e mouse). Lavora solo in /src/webgl.
9. interaction-designer: cursore custom, hover magnetici, micro-interazioni, preloader memorabile.
10. copywriter: testi definitivi per ogni sezione, coerenti con il brand-strategist.
11. vector-artist: usa image-to-svg per convertire loghi, icone e illustrazioni raster in SVG
    puliti; ottimizza gli SVG e li salva in /src/assets/svg.

=== ONDATA 3 — Build (scaffold sequenziale, poi parallelo) ===
12. scaffold-engineer (prima, da solo): setup progetto, tokens, layout base, routing, Lenis.
13..N. section-builder-[nome-sezione]: UN agent per sezione (hero, manifesto, lavori, servizi,
   contatti, footer…), tutti in parallelo, ognuno solo nel proprio componente. Seguono DESIGN.md.
   Se esiste un mockup/immagine di riferimento per la sezione, usano image-to-code seguendo la
   pipeline: analizza l'immagine, poi scrivi il codice.
N+1. shader-engineer: integra e ottimizza la scena WebGL nel layout, gestisce resize e DPR.

=== ONDATA 4 — Quality assurance (parallelo) ===
- performance-auditor: Lighthouse, Core Web Vitals, peso asset, draw call, FPS su mobile.
- accessibility-auditor: esegue web-design-guidelines su tutti i componenti; verifica WCAG AA,
  prefers-reduced-motion, navigazione da tastiera, contrasti.
- responsive-tester: con playwright-cli fa screenshot di ogni sezione a 375, 768, 1440, 2560px.
- cross-browser-tester: con playwright-cli testa Chromium, Firefox e WebKit (Safari);
  verifica il fallback se WebGL non è disponibile.
- seo-engineer: meta, Open Graph, dati strutturati, sitemap, semantica HTML.
- awwwards-jury: guarda gli screenshot del responsive-tester e valuta design, usabilità,
  creatività, contenuto (1-10 ciascuno) confrontando con i principi di design-taste-frontend.
  Tutto ciò che è sotto 8 torna agli agent responsabili con indicazioni precise.

=== LOOP ===
Ripeti ondata 3-4 sulle sezioni bocciate finché la giuria dà almeno 8 in ogni categoria.
Alla fine, riepilogo di cosa è stato fatto e cosa resta aperto.
```

## Adattamenti a questo repo

- Ogni concept vive in `concepts/<id>-<nome>/`; lì `/docs/`, `DESIGN.md`,
  `/src/styles/tokens`, `/src/webgl`, `/src/assets/svg` sono relativi alla
  cartella del concept.
- `~/design-references/...` qui è `design-references/awesome-design-md/design-md/`.
- Stack fissato dal sito vero: React 18 + Vite + TypeScript + three/R3F/drei + lenis
  (GSAP aggiungibile). Niente Next/Astro: il concept deve essere portabile in
  `src/pages/ConceptN.tsx` del repo `cicerilab/cicerilab`.
- Se la rete blocca un dominio (awwwards per /taste, banche foto), l'agent lo
  dichiara nel proprio doc e lavora con ciò che è disponibile.
