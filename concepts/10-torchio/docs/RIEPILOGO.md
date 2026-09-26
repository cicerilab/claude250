# Concept 10 · IMPRONTA — riepilogo per Luca

Tipografia e legatoria a Pordenone. Pilota del rifacimento dei concept 10–20.

## L'idea in tre righe

- **Idea:** il sito è un foglio di carta colorata in cui le lettere sono premute
  dal torchio. Si leggono con la luce radente, che segue il mouse, il dito o
  l'inclinazione del telefono.
- **Perché è di quel mestiere:** in una tipografia il carattere è il prodotto.
  Qui il visitatore sceglie la carta, e diventa la carta di tutto il sito. Nel
  "banco di prova" scrive il suo testo, lo vede premuto dal vivo con il prezzo e
  invia la richiesta tenendo premuta una leva.
- **Perché è diverso dagli altri 19:** non usa foto. Tipografia larga variabile
  (Anybody) su carta citrino, rilievo a secco e lamina in WebGL. Niente serif
  corsivo, niente sezioni numerate, niente schede con bordino, niente cartolina
  finale.

## Come vederlo

```
cd concepts/10-torchio
npm install
npm run dev          # http://localhost:8080/concept-10
```

Parametri utili:

- `?gl=0`: senza WebGL, con il rilievo in CSS.
- `?carta=cotone|cipria|grafite`: parte con quella carta.
- `?invio=ko`: simula un invio fallito.

## Giuria (processo a ondate, 3 giri)

| | Giro 1 | Giro 2 | Giro 3 |
|---|---|---|---|
| Design | 6 | 7,5 | 8 |
| Usabilità | 5,5 | 7 | 8 |
| Creatività | 7,5 | 8,5 | 8,5 |
| Contenuto | 7 | 8 | 8,5 |

Dopo il giro 3 è stata fatta un'ultima passata su Per chi, Banco e Colophon, le
sezioni rimaste a 7,5.

## Verifiche fatte (giro 3)

- **Accessibilità:** axe 0 violazioni su 4 carte, a 1440 e 375. Tastiera
  completa, reduced motion rispettato, zoom 400%. Cambi di carta al massimo 2
  al secondo (niente lampeggi).
- **Prestazioni:** Lighthouse 95 mobile e 100 desktop (con `?gl=0`). CLS 0
  anche con i font in ritardo. Lo scroll su mobile lento sale da 6 a 50 fps.
- **Browser:** Chromium, Firefox e WebKit/Safari senza errori in console. Senza
  WebGL la pagina è completa, con il rilievo in CSS.
- **Screenshot:** 375, 768, 1440 e 2560 su Citrino e Cotone, nessuno scroll
  orizzontale. La selezione finale è in `docs/screenshot/finale/`.

## Cosa resta aperto

1. **Integrazione nel sito.** Il `main` di `cicerilab/cicerilab` su GitHub ha
   solo i concept 1–9, mentre il sito online ne ha 20: il codice aggiornato è
   solo in locale da Luca. Quando sarà su GitHub, il porting è quasi un
   copia-incolla:
   - `src/pages/concepts/impronta/` e `src/pages/Concept10.tsx`;
   - rotta e `ROUTES` in `App.tsx`;
   - voce in `site.ts` e nel prerender;
   - `sitemap.xml`;
   - immagine `public/concepts/concept-10.jpg`.

   Le istruzioni sono in `docs/integrazione-sito.md` e `docs/seo-engineer.md`
   §5.2.
2. **WebGL su dispositivo vero.** Tutte le prove WebGL girano in un Chromium
   senza GPU (SwiftShader). Luce radente, lamina, tempi di avvio e fps vanno
   guardati su un iPhone e un Android veri.
3. **Budget.**
   - JS del concept: 60,7 KB gz su 60, con 0,7 KB in più.
   - CSS: 23,4 KB gz. Il budget è stato portato da 20 a 24 KB per scelta
     dell'orchestratore.
4. **Piccoli difetti (gravità bassa):**
   - a 375, mentre si scorre, il bottone del sito e "Prova la tua" coprono per
     un momento l'ultima riga di testo;
   - a 1440, nelle Tecniche, resta un'area vuota a destra sotto i nomi delle
     tecniche;
   - GSAP non è servito: sono stati usati lenis, IntersectionObserver e un
     ticker proprio.
5. **Dati di esempio.** Via Cavallotti 18 è una via vera con un civico
   inventato. Telefono ed email sono finti e dichiarati tali nel colophon.
   Nessuna P.IVA.

## Documenti

Ogni agent ha il suo file in `docs/`. Si parte da `creative-director.md`
(l'idea) e `DESIGN.md` (il design system). `awwwards-jury.md` contiene i tre
giri di giuria.
