# Motion designer · Concept 15 · NOVANTA

Ondata 2. Questo documento vale per chiunque muova qualcosa nel concept:
scaffold, section-builder del quadrante e della prenotazione, e chi usa i mini
archi. Qui trovi la curva, il rotore (braccio e anello), cosa succede in ogni
schermata, le transizioni CSS, il reduced motion e cosa chiedo agli altri agent.

Ho letto: `docs/ruoli-agent.md`, `docs/processo-agent.md`,
`docs/lab-operativo.md`, `docs/creative-director.md` (tutto),
`docs/tech-architect.md` (§2, §5, §6, §7.1-7.4, §9), `docs/ux-architect.md`
(§1.1, §2.4, §3, §6.2-6.8, "Sezioni da costruire"), `docs/trend-researcher.md`
(P9, P10, §4.3), `docs/brand-strategist.md`, il motion del pilota
(`concepts/10-torchio/.../motion/easing.ts`, `spring.ts`, per il formato) e le
skill `design-taste-frontend` e `full-output-enforcement`. Ho letto anche i file
scritti in parallelo: `interaction/attivita.ts`, `tastiera.ts`, `trascina.ts`,
`rotella.ts` e `styles/tokens.css`.

File miei, tutti in `src/pages/concepts/novanta/motion/`:

| File | Contenuto |
|---|---|
| `easing.ts` | utilità numeriche, `cubicBezier`, la curva `frenata` (TS e CSS), la famiglia `hermite` che eredita la velocità, `curvaInvito` |
| `molla.ts` | `MollaCritica` in forma chiusa sul dt, senza sorpasso; preset `presa` e `rotella`; `tempoDiAssestamento` |
| `choreography.ts` | tutte le costanti (durate, soglie, distanze), `durataCorsa()`, `variabiliMotion()`, `accompagnaCambio()` (FLIP) |
| `rotore.ts` | `creaRotore()` (contratto §7.2 più alcune aggiunte), `contenutoDuranteIlMoto()`, `scriviVarSeCambia()`, `formattaGradi()` |
| `invito.ts` | `avviaInvito()`: l'invito di 6° una volta sola, con un solo `setTimeout` |
| `motion.css` | variabili `--nov-motion-*`, dissolvenza incrociata degli angoli, mini arco, arco del ciclo, tacche, classi di durata per i cambi su mobile |

**Verifiche fatte**
- `tsc` con le opzioni di `tsconfig.app.json` (`strict`,
  `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`) sui cinque file TS:
  zero errori. I file motion importano solo tra loro, quindi il controllo non
  ha avuto bisogno di stub.
- ESLint 9 con la configurazione del pilota (la stessa prevista qui): zero
  errori, zero avvisi.
- Controlli numerici (file compilati ed eseguiti in Node):
  - la curva CSS `cubic-bezier(0.3333, 0.5, 0.6667, 1)` coincide con `frenata`
    con un errore massimo di 1,4·10⁻⁵;
  - `hermite` con a = 0 / 1,5 / 3: massimo esattamente 1, **nessun sorpasso**;
    con a = −1 torna indietro al massimo del 5,35% e poi arriva;
  - molla `presa`: 0,18 s per arrivare entro 0,1° su 30°; `rotella`: 0,31 s;
  - `durataCorsa`: 4° → 214 ms, 30° → 350, 60° → 420, 90° → 490, 180° → 560;
  - scenari del rotore: `vaA(180)` da 0 finisce a 180 in 567 ms, senza
    superarlo e con un solo `onFermo(180)`; trascinato fino a 38° e lasciato
    piano → 30°; trascinato a 44° e lanciato a 400°/s → 60° (un angolo in più,
    mai due); tocco sul disco a 100° → presa in 200 ms, poi rilascio → 90°;
    dieci spinte da 2,5° di trackpad → aggancio a 30° dopo la quiete; reduced:
    `vaA(90)` immediato, due spinte da 10° → salto secco a 120°; invito da 30°:
    sale a 36° e torna a 30° in 1100 ms **senza** `onFermo`; anello periodico:
    `vaA(350)` da 0 va a −10 (la via più corta), il trascinamento che passa da
    355° a 5° non salta di un giro; salto 0 → 90: il contenuto cambia **una
    volta**, a 75°;
  - le variabili di `motion.css` coincidono con `variabiliMotion(false)` e
    `variabiliMotion(true)` (lo script legge il CSS e confronta tutto, anche il
    blocco della media query).

---

## 0. Decisioni in breve

1. **Una curva sola, la frenata**: p(s) = 1,5 s − 0,5 s³. Parte già in moto
   (la spinge un dito, una rotella o un clic) e arriva a velocità zero
   esattamente sull'aggancio. In CSS è `cubic-bezier(0.3333, 0.5, 0.6667, 1)`,
   la stessa funzione e non un'approssimazione. È la "curva unica" chiesta dal
   trend-researcher (P9).
2. **Nessun rimbalzo, dimostrato**: il braccio arriva con una hermite monotona
   (non supera mai l'arrivo per costruzione), la molla è critica e in più non
   può sorpassare. "Una spalla che si muove bene non rimbalza."
3. **La velocità del dito si eredita.** Al rilascio la frenata parte con la
   velocità vera del braccio, quindi non c'è scatto tra "lo tengo io" e "va da
   solo". Se il lancio è più veloce di quanto la frenata assorba, la corsa si
   accorcia invece di sorpassare.
4. **Un solo rotore per braccio e anello** (tech-architect §7.2). L'anello
   usa lo stesso codice con `periodo: 360`, magnete infinito (si ferma solo su
   ore libere) e 280 ms di aggancio.
5. **Niente GSAP, niente rAF nostro.** Il rotore si muove solo in `tick(dt)`,
   chiamato dalla fn del ticker. L'invito aspetta con un `setTimeout`, così a
   riposo il ticker è fermo (budget: 0 frame a riposo).
6. **Il contenuto cambia una volta sola** nei salti (Prenota, parole, hash,
   rotella): regola in `contenutoDuranteIlMoto()`, con isteresi di 3° durante
   il trascinamento perché il testo non tremoli sul confine.
7. **Niente fade-up.** L'unico spostamento del testo è di 8 px **nel verso
   della rotazione**: in verticale su desktop (la punta del braccio a 90° sale
   o scende), in orizzontale su mobile (in cima la punta va a destra o a
   sinistra). Il testo segue lo strumento, non "compare".
8. **Reduced motion = stato finale immediato** ovunque. Unica eccezione
   dichiarata (dal creative-director): la dissolvenza del contenuto resta, di
   120 ms e senza spostamento. Il trascinamento resta 1:1: è un controllo.
9. **Le variabili CSS del movimento sono statiche in `motion.css`**, con la
   versione ridotta su `[data-motion="reduced"]` e sotto
   `prefers-reduced-motion`. Da JS si scrivono solo le variabili che cambiano
   davvero (`--nov-deg`), solo su elementi foglia `data-nov-var` e solo quando
   il valore cambia (`scriviVarSeCambia`).

---

## 1. Principi (valgono anche per ciò che non è scritto qui)

- **Chi lo muove?** Il dito, la rotella, un tasto o un clic muovono il braccio;
  il braccio cambia il contenuto; la prenotazione chiude l'arco del ciclo.
  Niente si muove da solo, tranne l'invito (una volta, 6°).
- **Il testo è fermo e orizzontale.** Si sposta di 8 px e solo durante la
  dissolvenza. Nessuna animazione per lettera, per parola o per riga.
- **Le misure non si animano.** Quando un blocco cambia misura (quadrante →
  fascia a 90° su mobile, anello → 140 px) si anima solo `transform` e
  `opacity` con `accompagnaCambio()` (tecnica FLIP). Mai `width`, `height`,
  `top`, `r` o `d` in transizione.
- **Il numero dei gradi è l'unica cosa che si muove con continuità**: scorre
  grado per grado mentre il braccio gira (con reduced motion salta al valore
  finale, perché il braccio stesso salta).
- **Niente lampi.** Nessun cambio di luminosità ripetuto; le tacche percorse
  crescono con continuità (clipPath), non si accendono a scatti. Le grandi
  superfici che si accendono e spengono (foto, anello gesso, fascia) passano
  dalla cadenza di 500 ms di `interaction/attivita.ts`.
- **La prima pittura non si anima**: tutte le animazioni di `motion.css`
  valgono solo con `data-pronto="1"`, e l'arrivo da un link `#gradi-N` mette il
  braccio al suo posto con `vaA(g, { subito: true, silenzioso: true })`.

---

## 2. Le curve (`easing.ts`)

| Nome | Formula | Uso |
|---|---|---|
| `frenata` | p(s) = 1,5 s − 0,5 s³ · CSS `cubic-bezier(0.3333, 0.5, 0.6667, 1)` | ogni transizione CSS del concept (`--nov-motion-curva`), ogni `vaA` partito da fermo |
| `hermite(s, a)` | p(s) = (a − 2) s³ + (3 − 2a) s² + a s | le corse del rotore: `a` è la velocità iniziale normalizzata (velocità × durata / tragitto). a = 1,5 è la frenata |
| `curvaInvito` | sin²(π · s^0,75) | l'invito: parte e torna da fermo, picco al 40% del tempo |

Limiti di `a` nel rotore: da fermo o con poca velocità verso l'arrivo si usa
almeno 1,5 (la frenata: il braccio "viene tirato" all'aggancio, non si
avvia pigro); fino a 3 la velocità del lancio si conserva; oltre 3 la corsa si
accorcia (minimo 120 ms); se il braccio stava andando nel verso opposto `a`
scende fino a −1 (prosegue un attimo, poi torna: al massimo il 5,35% del
tragitto).

Perché non una molla per l'aggancio: una molla critica non ha una durata (la
coda è infinita) e il creative-director chiede "circa 350 ms che frena alla
fine". La hermite dura esattamente quanto dice `durataCorsa()`, eredita la
velocità come una molla e non può rimbalzare.

---

## 3. Il rotore (`rotore.ts`)

### 3.1 Contratto (tech-architect §7.2, con aggiunte compatibili)

```ts
interface StatoRotazione { deg: number; target: number; vel: number;
  stato: 'fermo' | 'trascina' | 'aggancio' | 'inerzia' }   // = Rotazione di state/runtime.ts

interface OpzioniRotore {
  stato: StatoRotazione;                 // runtime.braccio o runtime.anello
  min?: number; max?: number;            // braccio 0..180; anello senza limiti
  agganci: () => readonly number[];      // letti ogni volta (le ore libere cambiano)
  magnete: number;                       // braccio MAGNETE (15); anello Infinity
  inerziaMax: number;                    // braccio INERZIA_MAX (30)
  durataAggancio: number;                // braccio DUR_AGGANCIO (350); anello DUR_AGGANCIO_ANELLO (280)
  ridotto: () => boolean;
  onFermo?: (g: number) => void;
  // aggiunte
  periodo?: number;                      // anello: 360
  sveglia?: () => void;                  // ticker.wake
  ora?: () => number;                    // default performance.now()
}

interface Rotore {
  trascina(g): void; rilascia(vel): void; vaA(g, opz?): void; spingi(delta): void; tick(dt): boolean;
  // aggiunte
  passoAggancio(verso: 1 | -1): number | null;  // aggancio successivo/precedente strettamente oltre
  aggancia(): void;                             // aggancia ora (fine gesto trackpad)
  annullaTrascina(): void;                      // Esc: torna al punto di partenza
  accenna(ampiezza?): boolean;                  // l'invito
  interrompi(): void;                           // ferma dov'è, senza onFermo
  readonly viaggio: 'nessuno' | 'presa' | 'lancio' | 'salto' | 'rotella' | 'invito';
  readonly meta: number;                        // dove sta andando
}

vaA(g, { subito?: boolean; silenzioso?: boolean; aggancia?: boolean })
```

`StatoRotazione` è dichiarato in `rotore.ts` con la stessa forma di
`Rotazione` (§6.2): non importo `state/runtime.ts` così il motion non dipende
dall'ordine di scrittura dello scaffold; TypeScript accetta `runtime.braccio`
per struttura.

### 3.2 Stati e viaggi

| Comando | `stato` | `viaggio` | Cosa succede | `onFermo` |
|---|---|---|---|---|
| `trascina(g)` vicino al braccio (≤ 6°) | `trascina` | `nessuno` | `deg = g` 1:1, velocità del dito stimata (media esponenziale) | no |
| `trascina(g)` lontano (tocco sul disco) | `trascina` | `presa` | la molla `presa` porta il braccio al dito (~180 ms), poi 1:1 | no |
| `rilascia(vel)` | `aggancio` | `lancio` | proiezione `rilascio + vel · 0,12 s` limitata a ±30° (sotto 90°/s nessuna proiezione), aggancio più vicino entro il magnete, frenata che eredita la velocità | sì, all'arrivo |
| `vaA(g)` | `aggancio` | `salto` | frenata fino a `g` esatto (con `aggancia: true` fino all'aggancio più vicino) | sì, salvo `silenzioso` |
| `vaA(g, { subito })` | `fermo` | `nessuno` | nello stesso frame | sì, salvo `silenzioso` |
| `spingi(d)` | `inerzia` | `rotella` | l'obiettivo si sposta di `d`, la molla `rotella` lo insegue; dopo 140 ms senza spinte parte il lancio verso l'aggancio | sì, all'arrivo |
| `aggancia()` | `aggancio` | `lancio` | aggancio immediato dell'obiettivo attuale | sì |
| `passoAggancio(±1)` | come `vaA` | `salto` | prossimo aggancio strettamente oltre la meta (non oltre `deg`: tre pressioni rapide sommano tre passi) | sì |
| `annullaTrascina()` | `aggancio` | `salto` | torna dove il braccio era prima del gesto | sì |
| `accenna(6)` | `aggancio` | `invito` | +6° e ritorno in 1100 ms (−6° se a 180) | **no** |
| `interrompi()` | `fermo` | `nessuno` | si ferma dov'è | no |

`tick(dt)` restituisce `true` finché c'è da muoversi; durante il
trascinamento 1:1 restituisce `false` (lo muove l'handler, che chiama
`sveglia()`: un frame per ogni movimento del dito).

### 3.3 Reduced motion

`ridotto()` letto a ogni comando: `vaA`, `rilascia`, `aggancia`,
`passoAggancio` e `annullaTrascina` saltano allo stato finale; `spingi`
accumula in silenzio e salta all'aggancio appena l'accumulo entra nel magnete
(uno scatto di 30° → un angolo; un trackpad a piccoli delta → salto a metà
strada); `accenna` rifiuta. Il trascinamento resta 1:1, senza presa.

### 3.4 Durate (`durataCorsa`)

- fino a 30°: dal 55% al 100% di `durataAggancio` (4° → 214 ms): un aggancio
  corto non deve sembrare pigro;
- oltre 30°: +20% per ogni 30° in più, fino a +60% (braccio: 0 → 90 in 490 ms,
  0 → 180 in 560 ms). Il braccio attraversa gli angoli intermedi e si vede
  percorrere la misura: è il gesto del goniometro.

### 3.5 Quale contenuto mostrare (`contenutoDuranteIlMoto`)

| Situazione | Regola |
|---|---|
| fermo | l'angolo più vicino (Maiusc + freccia a 47° → 60°) |
| trascinamento, presa | cambia oltre metà strada + 3° (18° dal centro dell'angolo) |
| salto, lancio, rotella | una volta sola: quando il braccio entra nella zona della meta |
| invito | mai |

### 3.6 Scrivere nel DOM

`scriviVarSeCambia(el, '--nov-deg', formattaGradi(deg))` scrive solo se il
testo è diverso dall'ultimo scritto su quell'elemento (cache in `WeakMap`).
`formattaGradi` dà due decimali e mai `-0.00`. L'elemento deve avere
`data-nov-var` (regola del Lab); la verifica è a vista del section-builder,
non in codice, per non avere avvisi in console in produzione.

---

## 4. Coreografia per schermata

Ogni angolo ha la stessa entrata: dissolvenza incrociata di 180 ms, il testo
nuovo entra spostandosi di 8 px nel verso della rotazione, quello vecchio esce
proseguendo nello stesso verso. Chi entra resta trasparente per il primo 30%
del tempo, chi esce è sparito al 65%: i due testi non si leggono mai insieme a
metà opacità. Il numero dei gradi non si dissolve mai: scorre.

| Momento | Cosa si muove | Tempo e curva | Reduced |
|---|---|---|---|
| **Arrivo** (nessun hash o `#gradi-N`) | niente: braccio già all'angolo (`vaA(g, { subito, silenzioso })`), contenuto dal primo frame | 0 | uguale |
| **Invito** (0°, dopo 3 s senza input, una volta per sessione) | la manopola sale di 6° e torna; il numero dei gradi mostra 1…6…0 (fa capire che il numero è legato al braccio) | 1100 ms, `curvaInvito` | mai |
| **Trascinamento** | braccio 1:1, numero grado per grado, tacche percorse che crescono (clipPath), contenuto a metà strada + 3° | continuo | uguale (è un controllo) |
| **Rilascio** | frenata sull'aggancio, al massimo un angolo in più | 120-350 ms, hermite | salto |
| **Tocco sul disco / parola / Prenota / hash / Indietro** | il braccio percorre l'arco fino all'angolo; contenuto una volta, vicino all'arrivo | 350-560 ms, frenata | salto, dissolvenza 120 ms |
| **Rotella / trackpad** | il braccio insegue i delta, poi si aggancia dopo 140 ms di silenzio; uno scatto di rotella = `passoAggancio` | molla `rotella` + frenata | salto all'aggancio |
| **0° da zero** | solo l'entrata comune; la foto dello studio **non** si muove (niente zoom, niente parallasse) | 180 ms | 120 ms |
| **30° primo incontro** | entrata comune; il braccietto del mini arco "oggi 70°" sale da 0 a 70 una volta, dopo il 30% della dissolvenza | 400 ms, frenata | già a 70 |
| **60° trattamenti** | entrata comune; la lista che scorre dentro il Palco usa lo scroll nativo (nessuna inerzia nostra) | 180 ms | 120 ms |
| **90° prenota, desktop** | entrata comune; l'anello è già girato sulla prima ora libera (nessun giro d'ingresso) | 180 ms | 120 ms |
| **90° prenota, mobile** | il quadrante diventa fascia da 64 px e l'anello sale: `accompagnaCambio` con `.nov-m-fascia` | 320 ms, frenata | immediato |
| **Anello: gira** | come il braccio: trascinamento 1:1, aggancio solo su ore libere, la via più corta | 280 ms per un'ora | salto |
| **S2 controllo proposto** | la linea sottile del ciclo compare | 180 ms | immediato |
| **"prima" / "dopo" del controllo** | il path del ciclo cambia di colpo (nessuna animazione di `d`), il punto del controllo si sposta con lui | 0 | 0 |
| **S7 entrando nei campi (mobile)** | l'anello si riduce a 140 px e resta in alto: `accompagnaCambio` con `.nov-m-riduci` | 240 ms | immediato |
| **S9 invio in corso** | il tratto pieno del ciclo si disegna dalla prima visita al controllo; nessuno spinner | 520 ms, frenata | già completo |
| **S10 ora presa** | la tacca si spegne, poi l'anello va da solo alla prossima ora libera (`vaA`) | 320 ms + 280 ms | tutto immediato |
| **S11 invio fallito** | il tratto pieno torna indietro | 400 ms | immediato |
| **S12 successo** | le tacche non scelte si attenuano a 0,35; le due scelte restano piene | 400 ms | immediato |
| **120° osteopatia** | solo l'entrata comune | 180 ms | 120 ms |
| **150° esercizi** | entrata comune; i tre mini archi sono **fermi** all'obiettivo (tre braccetti che salgono insieme sarebbero una sfilata) | 180 ms | 120 ms |
| **180° prezzi e dove** | entrata comune; nessun movimento sulla foto o sul listino | 180 ms | 120 ms |
| **Cambio di vista** (quadrante ↔ elenco) | nessuna animazione: la pagina cambia struttura, il focus va all'`h2` | 0 | 0 |
| **Vista elenco** | niente: nessuna animazione allo scroll, mini archi fermi, `scrollIntoView` con `behavior: smooth` solo senza reduced motion | nativo | `auto` |

---

## 5. Transizioni CSS (`motion.css`)

### 5.1 Variabili (su `.nov-root`)

| Variabile | Piena | Ridotta |
|---|---|---|
| `--nov-motion-curva` | `cubic-bezier(0.3333, 0.5, 0.6667, 1)` | uguale |
| `--nov-motion-sposta` | `8px` | `0px` |
| `--nov-motion-dur-dissolvenza` | `180ms` | `120ms` |
| `--nov-motion-dur-ciclo-chiude` | `520ms` | `0ms` |
| `--nov-motion-dur-ciclo-apre` | `400ms` | `0ms` |
| `--nov-motion-dur-proposta` | `180ms` | `0ms` |
| `--nov-motion-dur-spegni` | `320ms` | `0ms` |
| `--nov-motion-dur-attenua` | `400ms` | `0ms` |
| `--nov-motion-opacita-attenuata` | `0.35` | uguale |
| `--nov-motion-dur-fascia` | `320ms` | `0ms` |
| `--nov-motion-dur-riduci` | `240ms` | `0ms` |
| `--nov-motion-dur-mini` | `400ms` | `0ms` |
| `--nov-motion-entra-da` / `--nov-motion-esce-a` | calcolate da `data-geo` + `data-dir` | `0 0` |

La versione ridotta vale con `data-motion="reduced"` e, prima del mount, con
`@media (prefers-reduced-motion: reduce)` (a meno che la radice dica
`data-motion="full"`).

Verifica di coerenza CSS/TS: `variabiliMotion()` è la fonte; lo script usato
(legge `motion.css` e confronta i tre blocchi con `variabiliMotion(false/true)`)
sta nel mio scratchpad e si rifà in dieci righe: va rilanciato se qualcuno
cambia un valore in uno dei due file.

### 5.2 Hook che i proprietari devono usare

| Hook | Dove | Chi lo mette | Effetto |
|---|---|---|---|
| `.nov-angolo[data-stato="entra"\|"esce"]` | `<li>` di `Angolo` | scaffold | dissolvenza incrociata con spostamento |
| `.nov-m-sale` | gruppo del braccietto del mini arco | vector-artist (`Arco.tsx`) | la variabile registrata `--nov-m-sale` va da 0 a 1 all'ingresso dell'angolo; il braccietto ruota di `calc(var(--nov-m-sale, 1) * valore)` |
| `[data-nov-ciclo="nessuno\|proposto\|chiuso"]` | gruppo SVG del ciclo | section-builder-prenota | linea sottile `.nov-ciclo__proposta`, tratto pieno `.nov-ciclo__pieno` (entrambi con `pathLength="1"`, il pieno disegnato dalla prima visita al controllo) |
| `.nov-m-spegnibile` + `data-nov-spegni="1"` | tacca dell'ora presa (S10) | section-builder-prenota | si spegne in 320 ms |
| `.nov-m-attenuabile` + `data-nov-esito="fatto"` sull'anello, `data-nov-scelta` sulle due tacche scelte | tacche dell'anello | section-builder-prenota | le altre scendono a 0,35 in 400 ms |
| `.nov-m-fascia`, `.nov-m-riduci` + `accompagnaCambio(el, applica, ridotto)` | quadrante a 90° su mobile, anello in S7 | section-builder quadrante e prenota | il cambio di misura accompagnato con transform |

---

## 6. Come si collega (esempio per `useBraccio.ts`)

Solo indicativo: il file è del section-builder-quadrante.

```ts
const rotore = creaRotore({
  stato: runtime.braccio, min: 0, max: 180,
  agganci: () => ANGOLI, magnete: MAGNETE, inerziaMax: INERZIA_MAX,
  durataAggancio: DUR_AGGANCIO, ridotto: () => store.get().reducedMotion,
  sveglia: ticker.wake,
  onFermo: (g) => { /* aria-valuenow/valuetext, scriviHash(push/replace), niente analytics */ },
});
// update: ticker.add((dt) => rotore.tick(dt), 'update')
// write:  scriviVarSeCambia(quadranteEl, '--nov-deg', formattaGradi(runtime.braccio.deg));
//         clipPath se deg è cambiato; gradiEl.textContent solo se Math.round(deg) è cambiato;
//         const c = contenutoDuranteIlMoto({ attuale: store.get().attivo, rotore,
//                     stato: runtime.braccio, diContenuto: angoloDiContenuto });
//         if (c !== attuale) store.impostaAttivo(c)   // fuori dal ticker: via cadenza o microtask
// trascina.ts: onMuovi → rotore.trascina, onFine → rotore.rilascia,
//              onTocco(g) → rotore.vaA(g, { aggancia: true }), onAnnulla → rotore.annullaTrascina()
// rotella.ts:  onScatto(v) → rotore.passoAggancio(v); onDelta → rotore.spingi; onFine → rotore.aggancia()
// tastiera:    destinazioneBraccio(azione, rotore.meta) → rotore.vaA(meta)
// invito:      avviaInvito({ rotore, stato: runtime.braccio, ultimoInput: () => runtime.ultimoInput,
//                consentito: …, onFatto: store.segnaInvito })
```

Per l'anello (`useAnello.ts`): `creaRotore({ stato: runtime.anello,
agganci: () => angoliOreLibere, magnete: Infinity, inerziaMax: 30,
durataAggancio: DUR_AGGANCIO_ANELLO, periodo: 360, … })`. `onFermo(g)` può
ricevere valori fuori da 0..360 (l'anello conta i giri): normalizzare con
`((g % 360) + 360) % 360` prima di cercare l'ora.

---

## 7. Richieste ad altri agent

**scaffold-engineer**
1. `Angolo` scrive `data-stato` con questo significato: `attivo` = in vista
   dal primo frame (nessuna animazione); `entra` = diventato attivo per un
   cambio (può restare `entra` finché non cambia di nuovo, oppure passare ad
   `attivo` dopo la dissolvenza: il nome dell'animazione è lo stesso e non
   riparte); `esce` = il `precedente`; `spento` = gli altri.
2. `layout.css`: `entra` si comporta come `attivo` (visibile), `esce` come
   `spento` (nascosto): è l'animazione di `motion.css` a tenerlo visibile per
   180 ms con `fill-mode: both`. Nessun `translate`/`transform`/`animation`
   sul `<li class="nov-angolo">` da parte di altri file.
3. **Non** mettere `variabiliMotion()` inline sulla radice: le variabili sono
   già in `motion.css` (regola "variabili da JS solo su foglie `data-nov-var`").
   Basta scrivere `data-motion="full|reduced"` e `data-pronto`.
4. `data-dir` va scritto nello stesso render in cui cambia `data-attivo`
   (verso = segno di nuovo − precedente).
5. `Rotazione` in `state/runtime.ts` con esattamente i campi `deg`, `target`,
   `vel`, `stato` ('fermo' | 'trascina' | 'aggancio' | 'inerzia').
6. Ordine dei CSS come §5 del tech-architect (`motion.css` dopo `arco.css`).

**section-builder-quadrante**: usare il rotore come in §6; `data-nov-var` sul
nodo dove scrivi `--nov-deg`; `store.impostaAttivo` solo tramite
`contenutoDuranteIlMoto` (e la cadenza di interaction se c'è una foto a filo
del bordo nell'angolo); a 90° su mobile, il passaggio a fascia con
`accompagnaCambio(el, applica, ridotto)` e la classe `.nov-m-fascia`. Hash
all'arrivo: `vaA(g, { subito: true, silenzioso: true })`. Allo smontaggio o al
passaggio in vista elenco: `rotore.interrompi()` e la pulizia di `avviaInvito`.

**section-builder-prenota**: rotore dell'anello come in §6; hook di §5.2 per
ciclo, tacca presa e attenuazione; in S10 prima `data-nov-spegni="1"`, dopo
`DUR_SPEGNI` ms (0 con reduced) la tacca diventa occupata e `vaA` alla
prossima ora libera; in S7 `.nov-m-riduci` con `accompagnaCambio`. Il path
`.nov-ciclo__pieno` deve partire dalla prima visita.

**vector-artist** (`dial/Arco.tsx`): nel mini arco, il gruppo del braccietto
con classe `nov-m-sale` e rotazione `calc(var(--nov-m-sale, 1) * <valore>deg)`
(segno secondo `rotazioneCss`). Solo il mini arco a 30° ("oggi 70°") lo usa
davvero; a 150° gli archi restano fermi: basta non mettere la classe lì, o
metterla e lasciare che valga 1.

**interaction-designer**: nessuna modifica. Le API di `trascina.ts` e
`rotella.ts` combaciano con il rotore (`onTocco` → `vaA(g, { aggancia: true })`,
`onAnnulla` → `annullaTrascina()`, `onScatto` → `passoAggancio`, `onFine` →
`aggancia()`). Nota: rotella.ts chiude già il gesto a 140 ms e il rotore ha la
stessa quiete: chiamare `aggancia()` da `onFine` rende l'aggancio immediato,
senza aspettare il timer interno.

**orchestratore**: ux-architect §1.3 parla di `novanta.invito` in localStorage
("una volta per browser"), il tech-architect di `novanta:invito` in
sessionStorage. Il motion vale per entrambi (decide `consentito()`); la scelta
va fatta dallo scaffold. Io consiglio sessionStorage: chi torna un altro
giorno ha dimenticato il gesto.
