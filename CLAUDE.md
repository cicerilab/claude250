# claude250 — istruzioni per Claude Code (sessioni cloud)

Leggi questo file per intero prima di fare qualsiasi cosa. Rispondi **sempre in
italiano**.

## Chi è e cosa fa

**Luca Ciceri** gestisce **CiceriLab** (cicerilab.com), uno studio web che fa
siti su misura in abbonamento per attività locali del Friuli (base Pordenone).
Lavora solo da remoto. Il sito di CiceriLab ha un **Concept Lab**: 20 prototipi
di siti, uno per mestiere, che servono da vetrina commerciale ("guarda cosa
potrei fare per te"). Sono la cosa che i potenziali clienti vedono prima di
contattarlo: la loro qualità vende o non vende.

Questo repo (`cicerilab/claude250`) serve per i progetti fatti con Claude Code
nel cloud. **È PUBBLICO**: non scriverci mai dati di clienti, email, telefoni,
chiavi o token.

## Il lavoro in corso: rifare i concept 10–20

Luca ha detto chiaramente che **i concept 1–9 sono fatti nel modo giusto**
(ognuno ha un'idea sua e un linguaggio suo) e che **i concept 10–20 non gli
piacciono: sono tutti simili**, nonostante lo avesse ripetuto più volte. Vanno
sostituiti con design unici, originali, adatti al mestiere.

Tutto il dettaglio (elenco, cosa è andato storto, regole, architettura) è in
**[docs/concept-lab.md](docs/concept-lab.md)**. Gli screenshot attuali di tutti
e 20 sono in `docs/concept-attuali/concept-N.jpg`: guarda 1–9 per capire il
livello richiesto e 10–20 per capire cosa NON rifare.

Il processo da seguire per ogni sito è il prompt a ondate di agent che Luca ti
ha dato in chat (creative-director → ricerca → design system → build → QA →
giuria, finché ogni voto è ≥ 8). Salvalo in `docs/processo-agent.md` se non c'è.

**Si parte con UN sito pilota**, lo si fa vedere a Luca, e solo dopo la sua
approvazione si fanno gli altri 10.

## Dove va il codice

Il sito vero è nel repo **privato `cicerilab/cicerilab`** (React 18 + Vite +
React Router, SPA; già installati `three`, `@react-three/fiber`,
`@react-three/drei`, `lenis`). Se non lo vedi nell'ambiente, chiedi a Luca di
aggiungerlo all'ambiente cloud su claude.ai: senza quel repo i concept si
possono solo prototipare qui, non integrare.

- Lavora su un **branch** di `cicerilab/cicerilab`, mai su `main`.
- **Non fare deploy** (`wrangler deploy`) e non pubblicare nulla: Luca
  revisiona tutto prima. Il deploy lo fa lui.
- Se il repo del sito non è disponibile: costruisci il pilota qui in
  `concepts/<id>-<nome>/` come app Vite + React autonoma, con la stessa
  struttura che avrà dentro al sito (vedi docs/concept-lab.md, "Integrazione"),
  così il porting è un copia-incolla.

## Skill e riferimenti (già nel repo)

- `.claude/skills/` contiene le skill del prompt: `design-taste-frontend`,
  `taste`, `image-to-code`, `image-to-svg`, `full-output-enforcement`,
  `web-design-guidelines`, `playwright-cli`, `redesign-existing-projects`.
  Leggi il `SKILL.md` di ognuna e seguile. `image-to-svg` è senza il suo
  ambiente Python e senza il binario compilato: se serve, ricompila
  `scripts/nn_assign.c` e installa le dipendenze indicate nello SKILL.md.
- La libreria di riferimento che il prompt chiama
  `~/design-references/awesome-design-md/design-md/` qui sta in
  **`design-references/awesome-design-md/design-md/`** (74 design system, MIT,
  VoltAgent). Serve per estrarre **principi**, mai per copiare 1:1.

## Rete

Se l'ambiente blocca domini che servono (awwwards.com per /taste,
images.unsplash.com per le foto, fonts.googleapis.com / fonts.gstatic.com,
cicerilab.com), dillo a Luca indicando i domini esatti: la network policy
dell'ambiente si cambia da claude.ai, non da qui.

## Come lavorare con Luca

- Frasi semplici, niente gergo. Poche domande, solo se bloccanti; per il
  resto scegli e dichiara l'assunzione.
- Mai mostrare un risultato come "pronto" senza averlo guardato davvero
  (screenshot a 375 / 768 / 1440 px).
- Se Luca boccia un design, non ritoccarlo: si riparte da un'idea diversa.
