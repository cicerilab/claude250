# SEO engineer · Concept 10 · IMPRONTA

Ondata 4 (QA). Verificato il 25/09/2026 su `npm run build` +
`vite preview --port 8205` (chiuso a fine lavoro) con Playwright/Chromium
(`/opt/pw-browsers`), a 1440×900, con JS, senza CSS e senza JS; in più un
`renderToString` di `Concept10` (build SSR in scratchpad) per simulare un
prerender del contenuto.

Letti: `docs/processo-agent.md`, `docs/integrazione-sito.md`,
`docs/tech-architect.md` §3–4, e nel repo del sito (`/home/user/cicerilab`,
commit `517da78`): `index.html`, `scripts/prerender-meta.mjs`, `src/App.tsx`,
`src/pages/Concept1..9.tsx`, `src/pages/ConceptPage.tsx`,
`src/content/site.ts`, `public/robots.txt`, `public/sitemap.xml`,
`public/llms.txt`, `wrangler.json`.

Non ho modificato file altrui: sotto solo patch proposte.

---

## 1. Come il sito vero gestisce i meta dei concept 1–9 (fatti)

| Cosa | Come funziona oggi | Effetto su `/concept-N` |
|---|---|---|
| `<title>` | ogni `ConceptN.tsx` fa `document.title = "Meridiana — Alta Orologeria"` in un effect (senza marchio CiceriLab) | solo per chi esegue JS |
| meta description | nessun concept la cambia | resta quella della home |
| canonical | `index.html` ha `https://cicerilab.com/`; il componente `Canonical` in `src/App.tsx` la riscrive lato client se il path è nel set `ROUTES` (1–9 ci sono), altrimenti punta alla home | senza JS = home; con JS = URL giusto **solo se il path è in `ROUTES`** |
| OG / Twitter | globali in `index.html` (og:image = immagine Lovable su googleapis, og:url home) | ogni concept condiviso sui social mostra l'anteprima della home |
| JSON-LD | `ProfessionalService` "Ciceri Lab" in `index.html` (globale), `FAQPage` nella home | il concept eredita il ProfessionalService dell'autore; niente di specifico |
| prerender | `scripts/prerender-meta.mjs` (dopo `vite build`) scrive `dist/<path>/index.html` con title/description/og:title/og:description/twitter:*/canonical/og:url **solo** per `piani`, `chi-sono`, `concept-lab`, `contatti`. **Non** tocca og:image, **non** i concept, **non** il body | `/concept-N` servito dal fallback SPA (`wrangler.json`: `not_found_handling: single-page-application`) = head della home + `<div id="root"></div>` vuoto |
| robots | `robots.txt` Allow a tutti; nessun `noindex` in nessun concept | i concept sono **indicizzabili** |
| sitemap | **statica** in `public/sitemap.xml` (non la genera `prerender-meta.mjs`), elenca `/concept-1`…`/concept-9` a priority 0.6, monthly | |
| immagini concept | `public/concepts/concept-N.jpg` 760×475 via `conceptShot(id)` in `site.ts`, usate solo nelle card del Concept Lab, **non** come og:image | |

Nota: sul `main` di GitHub ci sono solo i concept 1–9; il sito online ne ha
fino a 20 (integrazione-sito.md §1). Al porting va rifatto questo controllo
sulla versione locale di Luca: se ha già un meccanismo diverso per 10–20,
vale quello.

## 2. Stato attuale del concept (standalone)

Con JS, dopo il mount (`Impronta.tsx → useMetaPagina`, testi da `content/testi.ts → META`):

- `<html lang="it">` ✓
- title: `IMPRONTA, tipografia e legatoria a Pordenone | CiceriLab` (58 car.) ✓ lunghezza
- description: `Stampa a rilievo e legatoria a mano a Pordenone. Scrivi il tuo testo, scegli la carta e guarda la prova premuta, con il prezzo subito.` (~135 car.) ✓ lunghezza
- title e description vengono **ripristinati allo smontaggio** ✓ (utile nella SPA del sito)
- canonical: **assente** · OG/Twitter: **assenti** · robots: assente (= index) · JSON-LD: **nessuno**
- `META.ogTitle`, `META.ogDescription`, `META.ogImageAlt` esistono in `testi.ts` ma **non li usa nessuno**; `public/concepts/concept-10.jpg` **non esiste** (né qui né nel sito)
- Senza JS: `<body>` = `<div id="root"></div>` vuoto (come i concept 1–9: il sito non prerenderizza il contenuto)
- `renderToString(<Concept10/>)` funziona senza browser (66 KB di HTML, 1 h1, 8 h2): il vincolo di tech-architect §3.1 è rispettato. Solo 4 avvisi `useLayoutEffect does nothing on the server` (Hero, Legatoria, …): innocui oggi, da sapere se un giorno il sito facesse SSR vero.

Semantica (DOM renderizzato):

- **Un solo `<h1>`**: "Stampiamo cose che si leggono anche a occhi chiusi." ✓
- h2 per sezione (lavori, tecniche, carta, legatoria, banco, bottega, colophon) con h3 dentro, nessun salto di livello ✓. Unica stranezza: l'`<h2>indice` del pannello indice della Testata viene **prima dell'h1** nell'ordine del DOM (è nell'header).
- Landmark: `header` (Testata) → `nav "Principale"` + `nav` indice → `main#contenuto` (sezioni con `aria-labelledby`) → `footer#colophon` con `nav "Indice del sito"` ✓. Link di salto in testa ✓.
- `<address>` due volte: Bottega (in `main`, testo leggibile + gemello a rilievo `aria-hidden`) e Colophon (nel `footer`, con link Maps/tel/mail) ✓ uso corretto.
- Link: testi significativi ("il banco di prova", "Apri in Maps", "Un concept di CiceriLab, si apre in una nuova scheda"). Link esterni con `rel="noopener noreferrer"` ✓. "Prova la tua" compare 8 volte verso `#banco` (con `aria-label` diverse): per i motori è anchor text ripetuto su un frammento, peso nullo, nessun danno.
- Testi a rilievo duplicati: tutti gli 11 `.imp-relief` che ripetono un testo sono dentro `aria-hidden="true"` ✓ (parola "impronta", tavoli di Per chi, prova e prezzo del Banco, indirizzo della Bottega). Il segnapagina nascosto ha anche `tabIndex=-1` ✓.
  **Ma `aria-hidden` non nasconde nulla a Google**: il crawler indicizza il `textContent` visibile. Sono pochi frammenti corti e visibili (non è testo nascosto), quindi niente rischio di spam o di contenuto duplicato: al massimo qualche parola in più.
- Senza CSS (`innerText` dopo aver tolto gli stili) il testo si legge in ordine, ma alcuni frammenti a rilievo/doppi si **incollano senza spazio**, e i motori li tokenizzano come parole inventate:
  - Per chi: `Irene e Davidesi sposanosabato 12 giugno 2027Duomo…`, `Chiara ZaninRestauratrice`, `Sul NoncelloAda Geromettapoesie`
  - Banco (prova): `Chiara ZaninRestauratrice`
  - Bottega: `Via Cavallotti 1833170 Pordenone` (rilievo) e il link telefono `0434 000 000Chiama 0434 000 000`
  - Colophon: `tipografia e legatoriaPordenone`
  - Testata: `indicela pressa`
- Disclaimer: il colophon dice "IMPRONTA è una bottega di esempio: indirizzo, telefono, nomi e prezzi sono inventati." ✓; telefono `0434 000 000`, email `@impronta.example` ✓ inesistenti; Maps cerca la via, non un'attività ✓.

## 3. Problemi, per gravità

| # | Gravità | Problema | Dove si risolve |
|---|---|---|---|
| P1 | **Alta** (al porting) | Se `/concept-10` non entra nel set `ROUTES` di `src/App.tsx` del sito, il componente `Canonical` lo fa puntare alla **home**: Google lo tratta come duplicato della home e non lo indicizza. | repo sito, `src/App.tsx` |
| P2 | **Alta** (al porting) | Senza una voce in `scripts/prerender-meta.mjs`, l'HTML servito per `/concept-10` ha title, description, canonical e og:* **della home**. I crawler social (Facebook, LinkedIn, WhatsApp, X) non eseguono JS: il link condiviso mostra la home. È lo stesso difetto dei concept 1–9. | repo sito, `scripts/prerender-meta.mjs` |
| P3 | Media | Title e description attuali ("…tipografia e legatoria **a Pordenone**", "Stampa a rilievo e legatoria a mano a Pordenone") si presentano come una bottega vera: la pagina può posizionarsi su "tipografia Pordenone" e portare persone reali a chiamare un numero inesistente. Il disclaimer sta solo in fondo alla pagina. Serve dire "concept" già nello snippet. | `content/testi.ts` (copywriter) + copia in prerender |
| P4 | Media | `public/concepts/concept-10.jpg` non esiste: manca sia la card del Concept Lab sia l'og:image. | al porting (vedi §5) |
| P5 | Media | og:image del sito è globale e il prerender non la sostituisce: anche con P2 risolto l'anteprima social resta quella della home. | repo sito, `prerender-meta.mjs` |
| P6 | Bassa | Nessun dato strutturato specifico del concept (vedi §4 per cosa mettere e cosa **non** mettere). | repo sito, `prerender-meta.mjs` |
| P7 | Bassa | Parole incollate senza spazio nel testo senza CSS (§2). Peggiora lo snippet e l'indicizzazione di quei frammenti. | sezioni (vedi patch) |
| P8 | Bassa | `<h2>indice` prima dell'`<h1>` nel DOM. Nessun impatto reale sul ranking; solo ordine meno pulito. | Testata (hero) |
| P9 | Bassa | `index.html` standalone senza canonical/OG: se l'app standalone venisse pubblicata (anteprima Vercel/Netlify) sarebbe un duplicato di cicerilab.com/concept-10 senza canonical. | `index.html` [S] (scaffold) |
| P10 | Info | `META.ogTitle/ogDescription/ogImageAlt` inutilizzati nel codice: sono dati per il prerender del sito, va detto nel commento. | `content/testi.ts` (copywriter) |
| P11 | Info | Titoli dei concept 1–9 senza marchio ("Meridiana — Alta Orologeria"); il 10 lo ha. Il 10 è quello giusto; per coerenza con i titoli del prerender del sito il marchio si scrive "Ciceri Lab". | copywriter |

Robots: **index, follow**, allineato ai concept 1–9 (tutti in sitemap, in
`ROUTES`, nessun `noindex`). Un concept è portfolio di CiceriLab: è
proprio la pagina che deve uscire per "sito tipografia esempio", "sito
legatoria". Il rischio della bottega inventata si governa con title/snippet
chiari (P3) e con l'assenza di markup LocalBusiness (§4), non con `noindex`,
che toglierebbe al sito una pagina di valore e renderebbe il 10 diverso dagli
altri nove.

## 4. Dati strutturati: cosa sì, cosa no

**No `LocalBusiness`/`Store`/`ProfessionalService` per IMPRONTA.** La
bottega non esiste: indirizzo, telefono, orari e prezzi sono inventati.
Markup di un'attività locale con dati falsi viola le linee guida di Google sui
dati strutturati (il markup deve descrivere contenuto vero e non ingannevole)
e rischia un'azione manuale sull'intero dominio cicerilab.com; potrebbe
anche far comparire una scheda "tipografia a Pordenone" con un numero che
non risponde. Stesso discorso per `Offer`/`Product` con i prezzi del banco.

**Sì a `WebPage` + `CreativeWork` + `BreadcrumbList`**, che descrivono il
vero: una pagina del sito di Ciceri Lab che contiene un prototipo creato da
Luca Ciceri. Il ProfessionalService globale di `index.html` resta (descrive
l'autore, ed è vero). Si mette **nel prerender** (HTML statico, lo leggono
tutti i crawler), non nel componente React: così resta fuori da `impronta/`
e non va ripulito allo smontaggio.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://cicerilab.com/concept-10#pagina",
      "url": "https://cicerilab.com/concept-10",
      "name": "Concept 10 · IMPRONTA, tipografia e legatoria | Ciceri Lab",
      "description": "Concept di Ciceri Lab: il sito di una tipografia e legatoria di Pordenone, inventata. Scrivi il tuo testo, scegli la carta e guarda la prova premuta.",
      "inLanguage": "it-IT",
      "isPartOf": { "@type": "WebSite", "@id": "https://cicerilab.com/#sito", "url": "https://cicerilab.com/", "name": "Ciceri Lab" },
      "primaryImageOfPage": "https://cicerilab.com/concepts/concept-10.jpg",
      "mainEntity": { "@id": "https://cicerilab.com/concept-10#concept" },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ciceri Lab", "item": "https://cicerilab.com/" },
          { "@type": "ListItem", "position": 2, "name": "Concept Lab", "item": "https://cicerilab.com/concept-lab" },
          { "@type": "ListItem", "position": 3, "name": "IMPRONTA", "item": "https://cicerilab.com/concept-10" }
        ]
      }
    },
    {
      "@type": "CreativeWork",
      "@id": "https://cicerilab.com/concept-10#concept",
      "name": "IMPRONTA",
      "alternativeHeadline": "Concept di sito per una tipografia e legatoria",
      "genre": "Prototipo di sito web",
      "about": "Sito dimostrativo per una tipografia e legatoria artigianale; l'attività, i nomi, i recapiti e i prezzi sono inventati.",
      "image": "https://cicerilab.com/concepts/concept-10.jpg",
      "inLanguage": "it-IT",
      "position": 10,
      "isPartOf": { "@type": "CreativeWorkSeries", "name": "Concept Lab", "url": "https://cicerilab.com/concept-lab" },
      "creator": { "@type": "Person", "name": "Luca Ciceri", "sameAs": ["https://instagram.com/luca.cicerii"] },
      "publisher": { "@type": "Organization", "name": "Ciceri Lab", "url": "https://cicerilab.com" },
      "dateCreated": "2026-09-25"
    }
  ]
}
```

Il BreadcrumbList è l'unico pezzo che può dare un risultato visibile in SERP
(percorso "cicerilab.com › Concept Lab › IMPRONTA" al posto dell'URL): è
anche un segnale in più che si tratta di una vetrina, non di una bottega.

## 5. Patch proposte (non applicate)

### 5.1 In questo progetto

**A. `src/pages/concepts/impronta/content/testi.ts` → `META`** · proprietario:
**copywriter** · risolve P3, P10, P11

```ts
export const META = {
  /** <title>: 58 caratteri. Copiato in scripts/prerender-meta.mjs del sito: tenerli uguali. */
  title: 'Concept 10 · IMPRONTA, tipografia e legatoria | Ciceri Lab',
  /** meta description: 149 caratteri. Dice subito che è un concept (bottega inventata). */
  description:
    'Concept di Ciceri Lab: il sito di una tipografia e legatoria di Pordenone, inventata. Scrivi il tuo testo, scegli la carta e guarda la prova premuta.',
  /** og:title / og:description / og:image:alt: non li usa il codice, li copia il prerender del sito. */
  ogTitle: 'IMPRONTA, tipografia e legatoria · un concept di Ciceri Lab',
  ogDescription: 'Scrivi il tuo nome e guardalo premuto nella carta. Un concept di Ciceri Lab.',
  ogImageAlt: 'La parola impronta premuta a secco in un foglio giallo citrino, con la luce radente.',
} as const;
```

Il formato "Concept NN · Nome" è quello che il sito stesso usa in
`src/pages/ConceptPage.tsx`; "Ciceri Lab" con lo spazio è la grafia dei title
del prerender e del JSON-LD del sito. Se il copywriter preferisce tenere
"CiceriLab" attaccato, va bene purché title runtime e title del prerender
restino identici.

**B. `index.html` (standalone, [S])** · proprietario: **scaffold-engineer** ·
risolve P9 e rende l'anteprima standalone una prova fedele del prerender.
Dopo la meta description:

```html
<link rel="canonical" href="https://cicerilab.com/concept-10" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://cicerilab.com/concept-10" />
<meta property="og:site_name" content="Ciceri Lab" />
<meta property="og:locale" content="it_IT" />
<meta property="og:title" content="IMPRONTA, tipografia e legatoria · un concept di Ciceri Lab" />
<meta property="og:description" content="Scrivi il tuo nome e guardalo premuto nella carta. Un concept di Ciceri Lab." />
<meta property="og:image" content="https://cicerilab.com/concepts/concept-10.jpg" />
<meta property="og:image:width" content="760" />
<meta property="og:image:height" content="475" />
<meta property="og:image:alt" content="La parola impronta premuta a secco in un foglio giallo citrino, con la luce radente." />
<meta name="twitter:card" content="summary_large_image" />
```

e allineare `<title>`/description al punto A. (Il canonical cross-domain
verso cicerilab.com fa sì che un'eventuale pubblicazione della standalone non
competa col sito.)

**C. Spazi nel testo senza CSS** · risolve P7. Regola unica per tutti: tra
due righe/pezzi di testo fratelli dentro lo stesso blocco inline mettere uno
spazio vero (`{' '}`) o un separatore `<br />`; con `display:block` il layout
non cambia, e il testo senza CSS diventa "Chiara Zanin Restauratrice".

| File | Proprietario | Frammento |
|---|---|---|
| `sections/PerChi/Pezzo.tsx` (tavolo) | section-builder-per-chi | righe del pezzo sul tavolo |
| `sections/Banco/Prova.tsx` | section-builder-banco | righe della prova |
| `sections/Bottega/Bottega.tsx` | section-builder-bottega | tra le due `RigaPremuta` (r. 270–271) e tra i due `<span>` del link telefono (r. 316–317) |
| `sections/Colophon/Colophon.tsx` | section-builder-colophon | "tipografia e legatoria" / "Pordenone" |
| `sections/Hero/Testata.tsx` | section-builder-hero | titolo "indice" / prima voce |

**D. `sections/Hero/Testata.tsx`** · section-builder-hero · P8 (facoltativa):
il titolo del pannello indice può diventare un `<p>`/`<span>` con `id`
(resta il nome accessibile della `nav` via `aria-labelledby`), così il
primo heading del DOM è l'h1. Solo ordine, niente urgenza.

### 5.2 Nel repo del sito, al porting (proprietario: chi fa il porting / Luca)

1. **`src/App.tsx`**: aggiungere la rotta e il path al set dei canonical
   (P1):
   ```tsx
   const Concept10 = lazy(() => import("./pages/Concept10.tsx"));
   // ROUTES: aggiungere "/concept-10"
   <Route path="/concept-10" element={<Concept10 />} />
   ```
2. **`scripts/prerender-meta.mjs`** (P2, P5, P6): voce per il concept e
   supporto a og:image e JSON-LD per pagina. Patch:
   ```js
   const PAGINE = [
     // …le quattro esistenti…
     {
       path: "concept-10",
       title: "Concept 10 · IMPRONTA, tipografia e legatoria | Ciceri Lab",
       description:
         "Concept di Ciceri Lab: il sito di una tipografia e legatoria di Pordenone, inventata. Scrivi il tuo testo, scegli la carta e guarda la prova premuta.",
       ogTitle: "IMPRONTA, tipografia e legatoria · un concept di Ciceri Lab",
       ogDescription: "Scrivi il tuo nome e guardalo premuto nella carta. Un concept di Ciceri Lab.",
       image: "/concepts/concept-10.jpg",
       imageAlt: "La parola impronta premuta a secco in un foglio giallo citrino, con la luce radente.",
       jsonLd: { /* l'oggetto di §4 */ },
     },
   ];

   const sostituisci = (src, { title, description, canonical, ogTitle, ogDescription, image, imageAlt, jsonLd }) => {
     let out = src
       .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
       .replace(/(<meta name="description" content=")[^"]*(">)/, `$1${description}$2`)
       .replace(/(<meta property="og:title" content=")[^"]*(">)/, `$1${ogTitle ?? title}$2`)
       .replace(/(<meta name="twitter:title" content=")[^"]*(">)/, `$1${ogTitle ?? title}$2`)
       .replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${ogDescription ?? description}$2`)
       .replace(/(<meta name="twitter:description" content=")[^"]*(">)/, `$1${ogDescription ?? description}$2`)
       .replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${canonical}$2`)
       .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${canonical}$2`);
     if (image) {
       const abs = `${BASE}${image}`;
       out = out
         .replace(/(<meta property="og:image" content=")[^"]*(">)/, `$1${abs}$2`)
         .replace(/(<meta name="twitter:image" content=")[^"]*(">)/, `$1${abs}$2`)
         .replace("</head>",
           `<meta property="og:image:width" content="760"><meta property="og:image:height" content="475">` +
           (imageAlt ? `<meta property="og:image:alt" content="${imageAlt}"><meta name="twitter:image:alt" content="${imageAlt}">` : "") +
           "</head>");
     }
     if (jsonLd) {
       out = out.replace("</head>",
         `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script></head>`);
     }
     return out;
   };
   ```
   Dopo il build controllare che `dist/concept-10/index.html` esista e che
   `wrangler.json` (`html_handling: drop-trailing-slash`) lo serva su
   `/concept-10` (curl dell'HTML, senza JS). Consiglio: fare lo stesso per
   i concept 1–9 (oggi hanno lo stesso difetto P2).
3. **`public/sitemap.xml`** (statica, non generata dal prerender): aggiungere
   ```xml
   <url><loc>https://cicerilab.com/concept-10</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
   ```
   (se la versione locale ha già 10–20, verificare che la riga non ci sia già).
4. **`public/concepts/concept-10.jpg`** (P4): 760×475 JPEG come gli altri,
   ≤ ~80 KB, dall'hero su carta Citrino con WebGL attivo (la parola
   "impronta" premuta). Va bene uno screenshot del responsive-tester a
   1440 ritagliato 16:10. Serve sia alla card (`conceptShot(10)`) sia
   all'og:image (760×475 supera il minimo di 600×315 per Facebook e
   300×157 per X `summary_large_image`).
5. **`src/content/site.ts` → `CONCEPTS`**: sul `main` i campi sono solo
   `id, tag, title, subtitle, desc, icon`. `VETRINA` in `testi.ts` ha
   `perche`/`mestieri` (non esistono sul main) e non ha `icon`; il `tag`
   deve seguire il formato `"// CONCEPT 10"`. Voce proposta:
   ```ts
   { id: 10, tag: "// CONCEPT 10", title: "IMPRONTA", subtitle: "Tipografia e legatoria · stampa a rilievo e libri cuciti a mano", desc: "Scrivi il tuo testo e lo vedi premuto nella carta che scegli, con il prezzo che si aggiorna. Per inviare si tiene premuta la leva.", icon: "¶" },
   ```
6. **Testi "nove"**: in `prerender-meta.mjs` la pagina `concept-lab` dice
   "nove esempi… Nove prototipi", e `public/llms.txt` dice "Nove prototipi
   navigabili": aggiornare al numero vero dopo il porting.
7. **Non** aggiungere un `noindex` e **non** aggiungere markup
   LocalBusiness per IMPRONTA (vedi §3 e §4).

## 6. Cosa vede un crawler

- **Senza JS (social, Bing base, LLM crawler)**, oggi e dopo il porting senza
  la patch 5.2.2: head della home, body vuoto. Con la patch: title,
  description, canonical, OG, JSON-LD giusti; body sempre vuoto (come tutto
  il sito: il contenuto non è prerenderizzato).
- **Con JS (Googlebot)**: h1, sezioni, testi completi (~9.400 caratteri),
  title/description del concept, canonical giusto **solo** con la patch
  5.2.1.
- Il concept è già pronto per un eventuale prerender del contenuto:
  `renderToString` passa, con i soli avvisi `useLayoutEffect` di Hero e
  Legatoria (se un giorno servisse, `useIsomorphicLayoutEffect` nei due
  file).

## 7. Richieste ad altri agent

- **copywriter**: patch 5.1.A (META).
- **scaffold-engineer**: patch 5.1.B (`index.html`).
- **section-builder-per-chi / banco / bottega / colophon / hero**: patch
  5.1.C (spazi); hero anche 5.1.D (facoltativa).
- **orchestratore / chi porta**: §5.2 punti 1–7; l'immagine
  `concept-10.jpg` non ha un proprietario in tech-architect §4, va
  assegnata (proposta: responsive-tester per lo scatto).
