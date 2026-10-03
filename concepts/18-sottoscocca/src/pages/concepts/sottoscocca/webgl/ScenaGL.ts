/**
 * SOTTOSCOCCA · la scena WebGL nel layout (shader-engineer).
 *
 * Una classe, montata da ScenaCanvas.tsx su un canvas creato a mano dentro
 * `.ssc-gl-strato` (fisso, livello 0, dissolvenza on/off in layout.css).
 *
 * CICLO DEL FRAME (ticker unico, nessun altro rAF):
 * - `update` (registrata dopo il motore del ponte): quota, ruote, evidenze e
 *   apertura della ruota sulla scena; posa della camera dal binario; i punti
 *   della quota proiettati in `runtime.punti` (proiezione.ts). Se qualcosa è
 *   cambiato → `runtime.markDirty()`.
 * - `write`: `--ssc-opacita-scena` sul canvas (e sulla tela della
 *   dissolvenza) solo quando cambia; passo della dissolvenza ridotta.
 * - `render`: misura e DPR nuovi applicati qui (mai nel callback del
 *   ResizeObserver: il canvas si svuoterebbe senza un frame nuovo), poi
 *   `renderer.render` SOLO con `runtime.dirty` e opacità > 0; poi
 *   `runtime.dirty = false`. A scena ferma: zero render.
 *
 * ACCENSIONE: `data-gl` resta `pending` (si vede il poster del Fondale)
 * finché il primo frame non è davvero a schermo: si disegna, e al frame
 * DOPO (il primo è già stato presentato) `impostaGL('on')`; il canvas va da
 * 0 a 1 in 300 ms sopra il poster. Con `?fermo=` al posto di `on` si segna
 * `data-ssc-fermo="pronto"` sullo strato, ma solo dopo che la targhetta è
 * stata ridisegnata con Tektur (contratto di scripts/fermi-immagine.mjs).
 *
 * MISURA E DPR: un ResizeObserver guarda lo strato (la scatola vera del
 * canvas, anche con la barra degli indirizzi che entra ed esce); il DPR
 * viene da `runtime.viewport.dpr` (core/viewport.ts lo rilegge a ogni
 * resize, anche da zoom) e da qualita.ts (tetti, pixel massimi, riduzione).
 *
 * PERDITA DEL CONTESTO: `webglcontextlost` → `impostaGL('off',
 * 'contesto-perso')` subito (torna il Fondale, la dissolvenza on → off la fa
 * il CSS), niente render. `webglcontextrestored` → three ricrea il suo stato,
 * qui si rifà la mappa d'ambiente (era un render target, il contenuto è
 * perso) e si ridisegna; al frame dopo di nuovo `on`.
 *
 * QUALITÀ: qualita.ts abbassa il DPR se i frame di fila superano 20 ms; al
 * minimo e sotto 24 fps per 3 s → `impostaGL('off', 'qualita')` e
 * `onSpegni()`: ScenaCanvas smonta tutto dopo la dissolvenza.
 *
 * Nessun accesso al browser a livello di modulo.
 */

import { AgXToneMapping, SRGBColorSpace, WebGLRenderer } from 'three';
import type { IdPezzo, Quota } from '../content/lavori';
import { PONTI_TESTI } from '../content/testi';
import { fontsReady } from '../core/fonts';
import { ticker } from '../core/ticker';
import { aperturaCerchio } from '../motion/percorso';
import { formatta } from '../motion/useMotionVars';
import { runtime } from '../state/runtime';
import { impostaGL, store } from '../state/store';
import { Dissolvenza } from './dissolvenza';
import { Proiezione } from './proiezione';
import { Qualita, dprAlMinimo, dprPerCanvas } from './qualita';
import { creaAmbiente, costruisciScena, ESPOSIZIONE } from './scena';
import type { Ambiente, Scena } from './scena';
import type { TestiTarghetta } from './scena/texture';

/** Attributo e valore che `scripts/fermi-immagine.mjs` aspetta sullo strato. */
export const ATTR_FERMO = 'data-ssc-fermo';
/** Pezzi che, evidenziati, aprono la ruota anteriore sinistra (motion-designer §12). */
const PEZZI_APRONO: readonly IdPezzo[] = ['disco', 'pinza', 'freni'];
/** Font della targhetta: il GL la ridisegna quando è arrivato. */
const FONT_TARGHETTA = ['600 48px Tektur'] as const;

export type StatoScenaGL = 'nuova' | 'costruzione' | 'attesa-primo-frame' | 'accesa' | 'contesto-perso' | 'spenta' | 'smontata';

export interface OpzioniScenaGL {
  /** Il canvas (creato da ScenaCanvas, classe `ssc-gl`). */
  readonly canvas: HTMLCanvasElement;
  /** Lo strato `.ssc-gl-strato` che lo contiene (misura, dissolvenza, attributo del fermo). */
  readonly strato: HTMLElement;
  /** `?gl=1`: mai spegnere per lentezza. */
  readonly forzato: boolean;
  /** `?fermo=<quota>`: DPR esatto, `data-ssc-fermo="pronto"` al primo frame vero. */
  readonly fermo: Quota | null;
  /** Puntatore grossolano: tetto del DPR a 1,5. */
  readonly grossolano: boolean;
  /** Chiamata dopo `impostaGL('off', 'qualita')`. */
  readonly onSpegni?: () => void;
}

export interface DiagnosticaGL {
  stato: StatoScenaGL;
  render: number;
  drawCall: number;
  triangoli: number;
  programmi: number;
  geometrie: number;
  texture: number;
  dpr: number;
  css: [number, number];
  buffer: [number, number];
  mediaFrameMs: number;
  riduzioneDpr: number;
  contestiPersi: number;
  dissolvenze: number;
}

/** Testi della targhetta sulla colonna, da `PONTI_TESTI[1].targhetta` ("due colonne · 3500 kg"). */
export function testiTarghetta(): TestiTarghetta {
  const parti = PONTI_TESTI[1].targhetta.split(' · ');
  const sopra = parti[0] ?? '';
  const sotto = parti[1] ?? parti[0] ?? '';
  return { sopra: sopra.toUpperCase(), sotto };
}

export class ScenaGL {
  readonly diagnostica: DiagnosticaGL = {
    stato: 'nuova',
    render: 0,
    drawCall: 0,
    triangoli: 0,
    programmi: 0,
    geometrie: 0,
    texture: 0,
    dpr: 1,
    css: [0, 0],
    buffer: [0, 0],
    mediaFrameMs: 0,
    riduzioneDpr: 0,
    contestiPersi: 0,
    dissolvenze: 0,
  };

  private readonly canvas: HTMLCanvasElement;
  private readonly strato: HTMLElement;
  private readonly fermo: Quota | null;
  private readonly grossolano: boolean;
  private readonly onSpegni: (() => void) | undefined;
  private readonly renderer: WebGLRenderer;
  private readonly proiezione = new Proiezione();
  private readonly qualita: Qualita;
  private readonly dissolvenza: Dissolvenza;
  private readonly controllo = new AbortController();

  private scena: Scena | null = null;
  private ambiente: Ambiente | null = null;
  private stacca: (() => void)[] = [];
  private osservatore: ResizeObserver | null = null;

  /** Misura CSS dello strato (px) e misura applicata al renderer. */
  private cssW = 0;
  private cssH = 0;
  private applicataW = 0;
  private applicataH = 0;
  private applicatoDpr = 0;
  private misuraCambiata = true;

  private perso = false;
  private spento = false;
  private smontato = false;
  private primoFrameFatto = false;
  private daAccendere = false;
  private fontPronti = false;
  private renderDopoFont = false;
  private opacitaScritta = '';
  private ridottoPrima = false;
  private ultimoBinario = Number.NaN;
  private ultimaDiscesa = Number.NaN;

  constructor(o: OpzioniScenaGL) {
    this.canvas = o.canvas;
    this.strato = o.strato;
    this.fermo = o.fermo;
    this.grossolano = o.grossolano;
    this.onSpegni = o.onSpegni;
    const prova = o.forzato || o.fermo !== null;
    this.qualita = new Qualita({ puoSpegnere: !prova, puoAbbassare: o.fermo === null });
    // Il renderer può lanciare (nessun contesto): ScenaCanvas lo intercetta.
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: !prova,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = AgXToneMapping;
    this.renderer.toneMappingExposure = ESPOSIZIONE;
    this.renderer.autoClear = true;
    this.dissolvenza = new Dissolvenza(this.strato);
  }

  /**
   * Costruisce la scena (a passi, con `await`), la mappa d'ambiente, compila i
   * programmi e si registra nel ticker. Lancia AbortError se smontata prima.
   */
  async avvia(): Promise<void> {
    this.diagnostica.stato = 'costruzione';
    const segnale = this.controllo.signal;
    const scena = await costruisciScena({ testiTarghetta: testiTarghetta(), signal: segnale });
    if (this.smontato) {
      scena.dispose();
      throw new DOMException('Scena smontata', 'AbortError');
    }
    this.scena = scena;
    this.ambiente = creaAmbiente(this.renderer);
    scena.impostaAmbiente(this.ambiente.texture);

    this.misuraIniziale();
    this.applicaMisura();
    this.aggiornaScena(true);

    // Programmi compilati prima del primo frame: niente scatti quando un
    // pezzo entra nell'inquadratura per la prima volta durante lo scroll.
    const conAsync = this.renderer as WebGLRenderer & {
      compileAsync?: (s: Scena['scena'], c: Proiezione['camera']) => Promise<unknown>;
    };
    try {
      if (typeof conAsync.compileAsync === 'function') {
        await conAsync.compileAsync(scena.scena, this.proiezione.camera);
      } else {
        this.renderer.compile(scena.scena, this.proiezione.camera);
      }
    } catch {
      // la compilazione anticipata è solo un'ottimizzazione: il render compila lo stesso
    }
    if (this.smontato) throw new DOMException('Scena smontata', 'AbortError');

    this.collega();
    this.diagnostica.stato = 'attesa-primo-frame';
    runtime.markDirty();
    ticker.wake();

    void fontsReady(FONT_TARGHETTA).then(() => {
      if (this.smontato || this.scena === null) return;
      this.scena.ridisegnaTarghetta();
      this.fontPronti = true;
      runtime.markDirty();
      ticker.wake();
    });
  }

  /** Smonta tutto: ticker, osservatori, ascoltatori, scena, renderer e contesto. */
  dispose(): void {
    if (this.smontato) return;
    this.smontato = true;
    this.controllo.abort();
    for (const f of this.stacca) f();
    this.stacca = [];
    this.osservatore?.disconnect();
    this.osservatore = null;
    this.canvas.removeEventListener('webglcontextlost', this.suContestoPerso, false);
    this.canvas.removeEventListener('webglcontextrestored', this.suContestoRipristinato, false);
    this.dissolvenza.dispose();
    this.scena?.dispose();
    this.scena = null;
    this.ambiente?.dispose();
    this.ambiente = null;
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.strato.removeAttribute(ATTR_FERMO);
    this.diagnostica.stato = 'smontata';
  }

  /* ------------------------------------------------------------------ */
  /* Collegamenti                                                        */
  /* ------------------------------------------------------------------ */

  private collega(): void {
    this.stacca.push(ticker.add(this.fnAggiorna, 'update'));
    this.stacca.push(ticker.add(this.fnScrivi, 'write'));
    this.stacca.push(ticker.add(this.fnRender, 'render'));
    this.stacca.push(
      ticker.suRipresa(() => {
        this.proiezione.invalida();
        runtime.markDirty();
      }),
    );
    this.canvas.addEventListener('webglcontextlost', this.suContestoPerso, false);
    this.canvas.addEventListener('webglcontextrestored', this.suContestoRipristinato, false);
    if (typeof ResizeObserver !== 'undefined') {
      this.osservatore = new ResizeObserver((voci) => {
        for (const v of voci) {
          const box = v.contentBoxSize?.[0];
          const w = box ? box.inlineSize : v.contentRect.width;
          const h = box ? box.blockSize : v.contentRect.height;
          if (w !== this.cssW || h !== this.cssH) {
            this.cssW = w;
            this.cssH = h;
            this.misuraCambiata = true;
            runtime.markDirty();
            ticker.wake();
          }
        }
      });
      this.osservatore.observe(this.strato);
    }
  }

  private misuraIniziale(): void {
    const r = this.strato.getBoundingClientRect();
    this.cssW = r.width > 0 ? r.width : runtime.viewport.w || window.innerWidth;
    this.cssH = r.height > 0 ? r.height : runtime.viewport.h || window.innerHeight;
    this.misuraCambiata = true;
  }

  /** Applica misura e DPR al renderer (solo nella fase render o all'avvio). */
  private applicaMisura(): boolean {
    const w = Math.max(1, Math.round(this.cssW));
    const h = Math.max(1, Math.round(this.cssH));
    const dpr = dprPerCanvas(
      runtime.viewport.dpr || window.devicePixelRatio || 1,
      w,
      h,
      this.grossolano,
      this.qualita.riduzione,
      this.fermo !== null,
    );
    this.misuraCambiata = false;
    if (w === this.applicataW && h === this.applicataH && dpr === this.applicatoDpr) return false;
    this.applicataW = w;
    this.applicataH = h;
    this.applicatoDpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    const bw = this.canvas.width;
    const bh = this.canvas.height;
    this.dissolvenza.ridimensiona(bw, bh);
    this.proiezione.invalida();
    this.qualita.azzera();
    this.diagnostica.dpr = dpr;
    this.diagnostica.css = [w, h];
    this.diagnostica.buffer = [bw, bh];
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* Fasi del ticker                                                     */
  /* ------------------------------------------------------------------ */

  /** Scena + camera + punti. `forza` all'avvio (scrive i punti anche se nulla è cambiato). */
  private aggiornaScena(forza: boolean): void {
    const s = this.scena;
    if (s === null) return;
    const rt = runtime;
    let sporco = s.impostaQuota(rt.quota.valore);
    sporco = s.impostaRuote(rt.ruote) || sporco;
    sporco = s.impostaEvidenza(rt.evidenza) || sporco;
    let apertura = aperturaCerchio(rt.binario);
    for (const id of PEZZI_APRONO) apertura = Math.max(apertura, rt.evidenza[id] ?? 0);
    sporco = s.impostaApertura(apertura) || sporco;
    const w = Math.max(1, Math.round(this.cssW));
    const h = Math.max(1, Math.round(this.cssH));
    const camera = this.proiezione.aggiornaCamera(rt.binario, rt.discesa, rt.viewport.orient, w, h);
    if (sporco || camera) rt.markDirty();
    // Senza GL (contesto perso, spento) i punti li scrive il Fondale dalle foto.
    if ((forza || sporco || camera) && !this.perso && !this.spento && store.get().gl !== 'off') {
      this.proiezione.proietta(s, rt.quota.valore, w, h, rt.punti);
    }
  }

  private readonly fnAggiorna = (): boolean => {
    if (this.smontato || this.spento) return false;
    // la misura nuova cambia subito la camera e i punti; il renderer si
    // ridimensiona nella fase render dello stesso frame
    this.aggiornaScena(false);
    return false;
  };

  private readonly fnScrivi = (_dt: number, now: number): boolean => {
    if (this.smontato) return false;
    const testo = formatta(runtime.opacitaScena, 3);
    if (testo !== this.opacitaScritta) {
      this.opacitaScritta = testo;
      this.canvas.style.setProperty('--ssc-opacita-scena', testo);
      this.dissolvenza.sopra.style.setProperty('--ssc-opacita-scena', testo);
      this.dissolvenza.sopra.style.opacity = testo;
    }
    return this.dissolvenza.passo(now);
  };

  private readonly fnRender = (_dt: number, now: number): boolean => {
    const s = this.scena;
    if (this.smontato || this.spento || this.perso || s === null) return false;

    // Il frame disegnato al giro prima è già a schermo: adesso si accende.
    if (this.daAccendere) {
      this.daAccendere = false;
      this.accendi();
    }

    if (this.misuraCambiata || this.dprCambiato()) {
      if (this.applicaMisura()) runtime.markDirty();
    }
    if (!runtime.dirty) return this.daAccendere;
    // Opacità 0 (officina, piede): niente render; dirty resta e si disegna al ritorno.
    if (runtime.opacitaScena <= 0 && this.primoFrameFatto) return false;

    const ridotto = store.get().reducedMotion;
    if (ridotto !== this.ridottoPrima) {
      this.ridottoPrima = ridotto;
      this.dissolvenza.dimentica();
    }
    if (ridotto && this.primoFrameFatto && this.eScatto()) {
      if (this.dissolvenza.avvia(now)) this.diagnostica.dissolvenze += 1;
    }

    try {
      this.renderer.render(s.scena, this.proiezione.camera);
    } catch (errore) {
      if (import.meta.env.DEV) console.warn('[sottoscocca/gl] render non riuscito', errore);
      return false;
    }
    runtime.dirty = false;
    this.ultimoBinario = runtime.binario;
    this.ultimaDiscesa = runtime.discesa;
    if (ridotto) this.dissolvenza.ricorda(this.canvas);
    this.contaRender();

    const primo = !this.primoFrameFatto;
    this.primoFrameFatto = true;
    let conFontNuovo = false;
    if (this.fontPronti && !this.renderDopoFont) {
      this.renderDopoFont = true;
      conFontNuovo = true;
    }
    // Il frame va a schermo alla fine di questo task: si accende al prossimo.
    if (primo || (conFontNuovo && this.fermo !== null)) {
      this.daAccendere = true;
      return true;
    }

    const esito = this.qualita.render(
      now,
      dprAlMinimo(runtime.viewport.dpr || 1, this.applicataW, this.applicataH, this.grossolano, this.qualita.riduzione),
    );
    this.diagnostica.mediaFrameMs = Math.round(this.qualita.media * 10) / 10;
    this.diagnostica.riduzioneDpr = this.qualita.riduzione;
    if (esito === 'abbassa') {
      this.misuraCambiata = true;
      runtime.markDirty();
      return true;
    }
    if (esito === 'spegni') {
      this.spegni();
      return false;
    }
    return this.daAccendere || this.dissolvenza.attiva;
  };

  /* ------------------------------------------------------------------ */
  /* Stati                                                               */
  /* ------------------------------------------------------------------ */

  private accendi(): void {
    if (this.smontato || this.perso || this.spento) return;
    this.diagnostica.stato = 'accesa';
    if (this.fermo !== null) {
      if (this.fontPronti && this.renderDopoFont) this.strato.setAttribute(ATTR_FERMO, 'pronto');
      if (store.get().gl !== 'on') impostaGL('on');
      return;
    }
    const st = store.get();
    // Se il tetto degli 8 s è già scattato Radice smonta lo strato: non si riaccende.
    if (st.gl === 'off' && st.glMotivo === 'tempo') return;
    if (st.gl !== 'on') impostaGL('on');
  }

  private spegni(): void {
    if (this.spento) return;
    this.spento = true;
    this.diagnostica.stato = 'spenta';
    impostaGL('off', 'qualita');
    this.onSpegni?.();
  }

  private dprCambiato(): boolean {
    const dpr = dprPerCanvas(
      runtime.viewport.dpr || 1,
      Math.max(1, Math.round(this.cssW)),
      Math.max(1, Math.round(this.cssH)),
      this.grossolano,
      this.qualita.riduzione,
      this.fermo !== null,
    );
    return dpr !== this.applicatoDpr;
  }

  /** Con reduced motion la quota scatta: binario o discesa che saltano tra due render. */
  private eScatto(): boolean {
    if (Number.isNaN(this.ultimoBinario)) return false;
    return Math.abs(runtime.binario - this.ultimoBinario) > 0.02 || Math.abs(runtime.discesa - this.ultimaDiscesa) > 0.02;
  }

  private contaRender(): void {
    const d = this.diagnostica;
    const info = this.renderer.info;
    d.render += 1;
    d.drawCall = info.render.calls;
    d.triangoli = info.render.triangles;
    d.programmi = info.programs?.length ?? 0;
    d.geometrie = info.memory.geometries;
    d.texture = info.memory.textures;
  }

  private readonly suContestoPerso = (e: Event): void => {
    e.preventDefault();
    if (this.smontato) return;
    this.perso = true;
    this.primoFrameFatto = false;
    this.daAccendere = false;
    this.dissolvenza.dimentica();
    this.diagnostica.stato = 'contesto-perso';
    this.diagnostica.contestiPersi += 1;
    if (!this.spento) impostaGL('off', 'contesto-perso');
  };

  private readonly suContestoRipristinato = (): void => {
    if (this.smontato || this.spento || this.scena === null) return;
    // three ha già ricreato il suo stato (WebGLRenderer ascolta lo stesso
    // evento ed è registrato prima): la mappa d'ambiente era un render
    // target e va ridisegnata; il resto si ricarica al primo render.
    this.ambiente?.dispose();
    this.ambiente = creaAmbiente(this.renderer);
    this.scena.impostaAmbiente(this.ambiente.texture);
    this.perso = false;
    this.applicatoDpr = 0;
    this.misuraCambiata = true;
    this.proiezione.invalida();
    this.diagnostica.stato = 'attesa-primo-frame';
    runtime.markDirty();
    ticker.wake();
  };
}
