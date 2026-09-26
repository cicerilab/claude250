# Regole operative per i concept 11–20 (valgono per ogni agent)

## Struttura

- Ogni concept vive in `concepts/<n>-<nome>/` con la stessa struttura del pilota
  `concepts/10-torchio/`: app Vite + React 18 + TS autonoma, codice del concept in
  `src/pages/concepts/<nome>/`, `src/pages/Concept<n>.tsx` sottile, `docs/` con un
  file per agent, `DESIGN.md` nella root del concept.
- Il pilota è un riferimento per **struttura, processo e qualità**, MAI per il
  design: non riusare palette, font, rilievo, leva, carta, luce radente.
- Fatti reali del sito (valgono per tutti): `concepts/10-torchio/docs/integrazione-sito.md`
  (track() solo "apri_concept" e "demo_prenotazione"; `ConceptBackButton` condiviso,
  in alto a sinistra su desktop e in basso a sinistra sotto 640px; nessun Lenis globale).
- Stack: React 18.3, react-router-dom 6, TS 5.6, Vite 5; three 0.160 (+ R3F 8 / drei 9
  se serve davvero); lenis e GSAP opzionali. Niente Tailwind salvo motivazione.
  Nessun accesso a window/document a livello di modulo (il sito fa prerender).

## Porte (mai usare quelle di un altro concept)

Concept N usa le porte `9N00`–`9N19` (es. concept 11 → 9110–9119, concept 20 →
9200–9219). Ogni agent usa una porta sua nel range del concept, sempre con
`--strictPort`, e chiude il proprio server alla fine. Mai uccidere processi altrui.

## Font negli screenshot

Il Chromium della sandbox spesso non scarica Google Fonts. Negli script Playwright
intercetta `fonts.googleapis.com` e `fonts.gstatic.com` con `page.route` e servi i
file scaricati con **curl** (il fetch di Node non passa sempre dal proxy). Prima di
scattare: `await document.fonts.ready` e verifica che le famiglie siano caricate.
Scatta la **finestra** (non full-page) per le sezioni: le full-page mettono i
fissi sopra il testo.

## WebGL in headless

Chromium in `/opt/pw-browsers`, `playwright` npm globale. Per avere WebGL:
args `['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']`
(lento: le prove DOM fanno senza questi args). Firefox e WebKit sono in
`/tmp/claude-0/pw-extra` (PLAYWRIGHT_BROWSERS_PATH).

## Foto

La rete è aperta. Foto da Unsplash: scaricale (`https://images.unsplash.com/photo-...?w=1600&q=70&fm=webp`),
**guardale con Read** per verificare che il soggetto sia giusto (mai un parrucchiere
in un barbiere, mai un medico in un salone), salvale ottimizzate negli asset del
concept e annota autore/URL nel doc. Mai un 404.

## Git

- Gli agent NON fanno commit: li fa l'orchestratore.
- Screenshot di QA in `concepts/<n>-<nome>/qa/` (ignorati da git); quelli finali
  scelti in `docs/screenshot/finale/`.

## Regole di Luca (da docs/concept-lab.md, sempre)

Design radicalmente diversi; prenotazione unica per ogni concept; 375px bello quanto
1440; foto verificate; niente lampeggi, reduced motion rispettato; italiano vero,
niente lorem; niente dati legali inventati; repo pubblico: recapiti di esempio.
