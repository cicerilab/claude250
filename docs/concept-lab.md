# Concept Lab di cicerilab.com — cosa sapere per rifare i concept 10–20

## I 20 concept attuali

| # | Nome | Mestiere · idea | Giudizio di Luca |
|---|---|---|---|
| 1 | MERIDIANA | Alta orologeria · configuratore 3D, l'orologio si smonta | ✅ giusto |
| 2 | QUOTA TREMILA | Guide alpine · profili altimetrici disegnati | ✅ |
| 3 | MARGINALIA | Libreria indipendente & caffè letterario | ✅ |
| 4 | STUDIO FORMA | Architettura & interni · portfolio editoriale svizzero | ✅ |
| 5 | FORGIA CLUB | Palestra performance · orari live & membership | ✅ |
| 6 | MERIGGIO | Gelateria artigianale · pastello giocoso | ✅ |
| 7 | CONTROLUCE | Studio fotografico · galleria in nero assoluto | ✅ |
| 8 | PODERE LIVENZA | Cantina · etichette d'autore e degustazioni | ✅ |
| 9 | LUME | Studio dentistico · calma, chiarezza, prezzi trasparenti | ✅ |
| 10 | TORCHIO | Tipografia e legatoria · caratteri mobili | ❌ da rifare |
| 11 | VESPRO | Osteria di paese · il sito cambia con l'ora vera | ❌ |
| 12 | LUCIDA | Studio di tatuaggi · i disegni sul corpo | ❌ |
| 13 | TRE POLTRONE | Barbiere · la fila in tempo reale | ❌ |
| 14 | FILO A PIOMBO | Impresa edile e serramenti · il cantiere scorrendo | ❌ |
| 15 | SNODO | Fisioterapia e osteopatia · tocchi dove ti fa male | ❌ |
| 16 | QUATTRO MURA | Agenzia immobiliare · planimetria che segue il sole | ❌ |
| 17 | INFORNATA | Panificio e pasticceria · il forno a orari | ❌ |
| 18 | CHIAVE DEL TREDICI | Officina e gommista · libretto di manutenzione | ❌ |
| 19 | ANIMA | Liuteria · lo strumento che si apre e suona | ❌ |
| 20 | SETTE CHIAVI | Albergo di sette stanze · bacheca delle chiavi | ❌ |

Screenshot: `docs/concept-attuali/concept-N.jpg`.

**Default: stesso numero, stesso mestiere, design nuovo da zero.** I numeri e
le rotte (`/concept-10` … `/concept-20`) sono già usati in post e inserzioni,
quindi non si spostano. Nome e idea si possono cambiare se il nuovo concept
lo richiede. Se pensi che un mestiere vada cambiato, proponilo a Luca, non
farlo da solo.

## Perché 10–20 sono stati bocciati

Sono nati tutti dalla stessa ricetta, cambiando solo colori e testi. La
ricetta da **non** ripetere (vale per ogni concept nuovo):

- titoloni in serif corsivo (tipo Cormorant) con sottotitolo in sans;
- sezioni numerate "01 ·", "02 ·" con etichette in maiuscoletto spaziato o
  monospace;
- griglie di schede bianche con bordino sottile e ombra leggera;
- tutto che entra in dissolvenza dal basso allo scroll (lo stesso reveal
  ovunque);
- onde, filetti e divisori decorativi tra le sezioni;
- una "mappa" disegnata a mano al posto di quella vera;
- una prenotazione a passi che finisce in una "cartolina"/"scontrino" di
  conferma — sempre la stessa meccanica con un vestito diverso;
- sagome/figure umane disegnate in SVG (esplicitamente sgradite).

Una bozza di anteprima per un cliente vero (centro estetico) fatta con questa
ricetta è stata definita da Luca "orribile… con figure assurde". La versione
che invece ha approvato aveva un'identità presa dal cliente (i colori e il
segno grafico della sua insegna), foto vere, e una struttura nata dal
contenuto, non da un modello.

## Le regole di Luca per ogni concept (feedback ripetuto)

1. **Design radicalmente diversi tra loro**: mai due palette, tipografie o
   strutture simili. Ogni concept deve avere una metafora visiva forte che
   nasce dal mestiere.
2. **Il sistema di prenotazione/contatto è unico per ogni concept** e fa
   parte dell'identità (es. nei concept buoni: certificato numerato, scheda di
   spedizione della cordata, scontrino live, calendario a tema, widget
   clinico). Mai lo stesso form/drawer ricolorato.
3. **Ultra-dettaglio e mobile impeccabile**: 375 px deve essere bello quanto
   1440 px, non una colonna schiacciata.
4. **Foto verificate nel soggetto**: scaricale e guardale (mai un medico in un
   salone, mai un parrucchiere in un barbiere se non c'entra, mai un 404).
5. **Niente effetti lampeggianti** (fotosensibilità) e
   `prefers-reduced-motion` rispettato.
6. Italiano vero, testi da attività reale del Friuli, niente "lorem" né
   placeholder visibili. Prezzi, orari, recensioni sono di esempio ma
   verosimili; non inventare dati legali (P.IVA ecc.).

## Integrazione nel sito (repo privato `cicerilab/cicerilab`)

- Ogni concept è una pagina `src/pages/ConceptN.tsx` (componente default
  export), caricata lazy da `src/App.tsx` sulla rotta `/concept-N`.
  Guarda `Concept1.tsx`…`Concept9.tsx` per il pattern: stile scoped con un
  prefisso di classe proprio (tutto dentro un wrapper), font Google iniettati in
  `useEffect`, analytics con `track()` da `@/lib/analytics`. Se un concept
  nuovo è grande, può vivere in una cartella `src/pages/concepts/<nome>/` con
  `ConceptN.tsx` che la importa.
- I metadati stanno in `src/content/site.ts`, array `CONCEPTS`: `id`, `tag`,
  `title`, `subtitle`, `desc`, `icon`, `perche` (una frase: perché il sito è
  fatto così), `mestieri` (parole che il campo "Che lavoro fai?" in home usa
  per trovare il concept). Aggiorna la voce del concept rifatto.
- Anteprima nella vetrina: `public/concepts/concept-N.jpg` (≈760×475, JPG).
  Rigenerala dal concept nuovo con Playwright.
- Stack disponibile: React 18, Vite 5, React Router 6, three 0.160,
  @react-three/fiber 8, @react-three/drei 9, lenis. GSAP non è installato:
  se serve, aggiungilo al branch e dillo nel riepilogo.
- Comandi: `npm run dev` (porta 8080), `npm run build` (vite build +
  prerender + pagine statiche: deve restare verde),
  `npx tsc -p tsconfig.app.json --noEmit`, `npx eslint <file>`.
- **Mai** toccare altro del sito oltre al concept su cui lavori, e mai
  deploy.

## Consegna del pilota

Link o istruzioni per vederlo, screenshot a 375 / 768 / 1440, tre righe:
qual è l'idea, perché è di quel mestiere, cosa lo rende diverso dagli altri
19. Poi si aspetta Luca.
