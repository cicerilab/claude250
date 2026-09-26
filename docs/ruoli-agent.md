# Istruzioni per ruolo (concept 11–20)

Ogni agent riceve dall'orchestratore: **N** (numero), **NOME** (es. TAJUT),
**CARTELLA** (`concepts/<N>-<nome>/`), **SLUG** (cartella del codice in
`src/pages/concepts/<slug>/`), **PREFISSO** CSS (es. `taj-`), **PORTE**
(tabella in fondo). Tutti i path sono relativi a `/home/user/claude250/`.

Valgono sempre: `docs/lab-operativo.md`, `docs/concept-lab.md`,
`docs/processo-agent.md`, `concepts/10-torchio/docs/integrazione-sito.md`, la
riga N di `docs/matrice-concept-11-20.md`, `CARTELLA/docs/creative-director.md`.
Il pilota `concepts/10-torchio/` è riferimento di **formato, architettura e
qualità**, mai di design. Scrivi in italiano. Non fare commit. Tocca solo i
tuoi file (tabella in `CARTELLA/docs/tech-architect.md`); se ti serve una
modifica altrui, scrivila in una sezione "Richieste ad altri agent" del tuo doc.
Chi scrive codice frontend segue `.claude/skills/design-taste-frontend/SKILL.md`
e `.claude/skills/full-output-enforcement/SKILL.md` (niente placeholder/TODO).
Rispondi all'orchestratore con al massimo 6 righe.

---

## Ondata 1

**trend-researcher** → `docs/trend-researcher.md`. Segui `.claude/skills/taste/SKILL.md`:
/taste su 3-4 siti reali coerenti col concept (se un dominio rifiuta, scegline
altri e dichiaralo); più 2-4 sistemi da `design-references/awesome-design-md/design-md/`.
8-10 principi da reinterpretare con "come si applica qui", 10 pattern
inflazionati da evitare (inclusa la ricetta bocciata), rischi del concept.

**brand-strategist** → `docs/brand-strategist.md`. Posizionamento dell'attività
immaginaria (persone per nome, storia verosimile, cosa fa e non fa; niente dati
legali), 3 pubblici (bisogni, paure, cosa convince), messaggio chiave + 3 di
supporto, tono (5 regole sì/no con esempi), gerarchia dei contenuti per ogni
schermata del creative-director, lessico del mestiere, prezzi indicativi 2026,
orari/indirizzo di esempio verosimili (telefono/email di esempio: repo pubblico).

**ux-architect** → `docs/ux-architect.md`. Sitemap/URL, navigazione a 1440 e
375 (convivenza col ConceptBackButton), arco emotivo, 3 journey fino alla
prenotazione, wireframe testuali per schermata a 1440 e 375, TUTTI gli stati
della prenotazione, accessibilità per ogni interazione (tastiera, lettore di
schermo, reduced motion, zoom 400%), conversione. In fondo una sezione
**"Sezioni da costruire"**: elenco in kebab-case, una per section-builder, con
cosa contiene (5-9 sezioni).

**tech-architect** → `docs/tech-architect.md`. Parti da `concepts/10-torchio/docs/tech-architect.md`
e `scaffold-engineer.md` (store con useSyncExternalStore, ticker unico con fasi
read/update/write/render, ConceptBackButton e analytics copiati come nel
pilota, `src/pages/Concept<N>.tsx` sottile, prefisso CSS, nessun accesso a
window/document a livello di modulo). Stack con versioni (three/R3F solo se il
concept lo usa), struttura cartelle, **file esclusivi per ogni agent** delle
ondate 2-3 (usa i nomi sezione del creative-director; si allineano con lo ux),
stato condiviso, budget (JS concept ≤ 60 KB gz, CSS ≤ 24 KB gz, WebGL lazy ≤
160 KB gz, LCP ≤ 2,5 s, CLS ≤ 0,02, INP ≤ 150 ms), caricamento, fallback senza
WebGL se usato, comandi (`npm run dev` sulla prima porta del concept).

## Ondata 2

**art-director** → `DESIGN.md` (formato Stitch, nella root di CARTELLA),
`docs/art-director.md`, `src/pages/concepts/SLUG/styles/tokens.css` e
`tokens.ts` (+ eventuali css di base visivi assegnati). Tipografia (scala
fluida, 375 incluso), palette con ruoli, **contrasti WCAG AA calcolati con uno
script** (tabella nel doc), griglia non convenzionale, texture, trattamento
foto. Guarda le prove a schermo.

**motion-designer** → `motion/*` + `docs/motion-designer.md`. Easing custom,
coreografia per schermata, transizioni. Niente fade-up generico, niente
lampeggi, reduced motion = stato finale immediato. Scrive variabili CSS solo
sugli elementi foglia marcati `data-<prefisso>var`, solo quando il valore cambia.

**webgl-artist** (solo se il concept usa WebGL) → `webgl/` (shader, materiali,
scena) + doc. Verifica la compilazione in Chromium headless (SwiftShader).

**interaction-designer** → `interaction/*` + doc. Interazione firma, hover,
micro-interazioni, alternativa da tastiera per ogni gesto. Limite anti-lampeggio:
qualsiasi cambio di colore di grandi superfici al massimo 1 ogni 500 ms. Niente
cursore custom né preloader se il creative-director li esclude.

**copywriter** → `content/testi.ts` (+ `prezzi.ts` se serve) + doc. Tutti i testi
come dati tipizzati `as const`, microcopy di tutti gli stati, aria-label, alt,
title/description che dicono "Concept di Ciceri Lab", recapiti di esempio
presentati come link ("Chiama", "Scrivi") senza numeri finti in vista, nota
"attività inventata" nel piede. Niente em-dash, niente "01 ·".

**vector-artist** → `assets/svg/*` + `public/favicon.svg` + doc. SVG disegnati a
mano e ottimizzati (svgo via npx), renderizzati e guardati; image-to-svg solo
per raster reali. Niente figure umane. Id unici.

**photo-editor** (se il concept usa foto) → `assets/foto/*` + `docs/photo-editor.md`.
Cerca su Unsplash (API pubblica di ricerca o pagine), scarica, **guarda ogni foto
con Read**, scarta quelle sbagliate nel soggetto, ottimizza (webp, 2 misure),
elenca autore e URL.

## Ondata 3

**scaffold-engineer** (da solo) → tutti i file di base elencati dal tech-architect
(package.json con versioni esatte, vite/tsconfig/eslint, index.html, main, App
con rotta `/concept-<N>` e redirect, analytics stub, ConceptBackButton copia,
Concept<N>.tsx, radice, core/, state/, stub delle sezioni) + doc con le API
esatte. Raccogli TUTTE le "Richieste allo scaffold" dei doc dell'ondata 2 e fai
combaciare import e firme già usati dai loro file. Fatto = `npm install`,
typecheck, lint, build verdi e pagina aperta senza errori in console.

**section-builder-<sezione>** → solo i file della sua sezione + doc. Testi solo da
`content/testi.ts`. Verifica con il proprio dev server (porta assegnata,
`--strictPort`), screenshot a 375/768/1440 (e 2560 se rilevante) **guardati**,
typecheck e lint verdi.

**shader-engineer** (se WebGL) → integrazione del canvas nel layout, resize, DPR,
perdita di contesto, render solo quando serve, un blocco torna al fallback
finché il GL non l'ha disegnato davvero, ResizeObserver per rimisurare.

## Ondata 4

**responsive-tester** → build + `vite preview`, screenshot della **finestra** di
ogni schermata a 375/768/1440/2560 in `CARTELLA/qa/shots-g<giro>/`, font veri,
scrollWidth, sovrapposizioni, fissi che coprono. Doc con tabella problemi →
proprietario.

**accessibility-auditor** → skill `web-design-guidelines`, axe (@axe-core/playwright
in una cartella tmp), tastiera completa, fuoco mai coperto, reduced motion,
zoom 400%, contrasti reali, lampeggio (conta i cambi di colore al secondo).

**performance-auditor** → pesi gz vs budget, Lighthouse mobile/desktop, CLS con
font in ritardo di 2 s, long task in scroll a 390 px CPU 4×, INP delle
interazioni principali.

**cross-browser-tester** → Chromium, Firefox, WebKit (in `/tmp/claude-0/pw-extra`)
a 1440 e 375: zero errori in console, interazione firma, prenotazione completa,
fallback senza WebGL.

**seo-engineer** → title/description/OG/JSON-LD (WebPage/CreativeWork di Ciceri
Lab, MAI LocalBusiness finto), semantica, un solo h1, cosa fare al porting.

**awwwards-jury** → guarda davvero gli screenshot, valuta DESIGN, USABILITÀ,
CREATIVITÀ, CONTENUTO (1-10) con la severità del pilota (`concepts/10-torchio/docs/awwwards-jury.md`),
voto per schermata, confronto con la ricetta vietata, con 1–9, con IMPRONTA e
con gli altri concept 11–20 già fatti (cartelle in `concepts/`). Tabella finale
"Interventi per agent" per tutto ciò che è sotto 8.

---

## Parametri dei concept

| N | NOME | CARTELLA | SLUG | PREFISSO | PORTE |
|---|---|---|---|---|---|
| 11 | TAJUT | concepts/11-tajut/ | tajut | taj- | 9110–9119 |
| 12 | SOTTOPELLE | concepts/12-sottopelle/ | sottopelle | stp- | 9120–9129 |
| 13 | CONTROPELO | concepts/13-contropelo/ | contropelo | ctp- | 9130–9139 |
| 14 | BATTIFILO | concepts/14-battifilo/ | battifilo | btf- | 9140–9149 |
| 15 | NOVANTA | concepts/15-novanta/ | novanta | nov- | 9150–9159 |
| 16 | EVIDENZIA | concepts/16-evidenzia/ | evidenzia | evd- | 9160–9169 |
| 17 | MADRE | concepts/17-madre/ | madre | mad- | 9170–9179 |
| 18 | SOTTOSCOCCA | concepts/18-sottoscocca/ | sottoscocca | ssc- | 9180–9189 |
| 19 | NODI | concepts/19-nodi/ | nodi | nod- | 9190–9199 |
| 20 | IMBRUNIRE | concepts/20-imbrunire/ | imbrunire | imb- | 9200–9219 |

(Nota: 9200–9219 per il 20; nessun'altra sovrapposizione.)
