/**
 * IMPRONTA · la scena WebGL nel layout (shader-engineer)
 *
 * Un renderer three, un canvas fisso dietro il contenuto, UN piano a schermo
 * intero con UN materiale (relief.frag.glsl del webgl-artist): 1 draw call per
 * frame, più 3 draw call nei soli frame in cui si cuoce una maschera.
 *
 * Il ciclo vive dentro il ticker (core/ticker.ts), l'unico rAF del concept:
 *
 *   fase 'read'   → `preparazione`: misura del canvas quando cambia il
 *                   viewport (resize, DPR), avvio dei disegni delle maschere
 *                   sul canvas 2D (leggono il layout del fantasma DOM);
 *   fase 'render' → `render`: cottura delle maschere pronte nell'atlante,
 *                   culling dei blocchi, uniform, disegno. Solo se qualcosa
 *                   è cambiato: scroll, luce, pressioni, carta, onda,
 *                   misure, maschere nuove. A pagina ferma: 0 render.
 *
 * SINCRONIA CON LO SCROLL. Il ticker chiama `lenis.raf(now)` all'inizio del
 * frame: lenis scrive lo scroll del documento e `runtime.scrollY`; il
 * registro porta i rettangoli dei blocchi in coordinate viewport nella fase
 * 'read' dello STESSO frame; qui si disegna nella fase 'render' dello stesso
 * frame. DOM e canvas escono quindi nello stesso fotogramma del compositore:
 * nessuno scollamento. (Con reduced motion lo scroll è nativo: il browser può
 * scorrere il DOM sul thread del compositore un frame prima; è il limite di
 * qualsiasi canvas con scroll nativo.)
 *
 * COMPARSA. Il canvas nasce trasparente (layout.css, `.imp-gl`). Quando il
 * primo frame con TUTTE le maschere dei blocchi sullo schermo è disegnato, si
 * chiama `impostaGL('on')`: il canvas va a 1 in 300 ms e nello stesso istante
 * i fantasmi perdono il rilievo CSS (relief-fallback.css). Se una maschera non
 * arriva entro 3 s si parte comunque con quelle pronte.
 *
 * SPEGNIMENTO. Qualità (quality.ts): troppo lento → `impostaGL('off',
 * 'qualita')` e `onSpegni()`: il componente aspetta la dissolvenza e smonta.
 * Perdita del contesto → `impostaGL('off', 'contesto-perso')` subito; al
 * ripristino si ricrea tutto (three rifà programmi e texture da solo) e si
 * ricuociono le maschere, poi di nuovo `impostaGL('on')`.
 *
 * Nessun accesso a window/document a livello di modulo.
 */
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  HalfFloatType,
  LinearFilter,
  Mesh,
  NoColorSpace,
  OrthographicCamera,
  Scene,
  type ShaderMaterial,
  type WebGLRenderTarget,
  Vector2,
  WebGLRenderer,
  type PlaneGeometry,
  type Texture,
} from 'three';

import { ticker } from '../core/ticker';
import { getPaperWave } from '../interaction/paperWave';
import { registry } from '../relief/registry';
import type { EventoRegistro, ReliefBlock } from '../relief/types';
import { runtime } from '../state/runtime';
import { impostaGL, store } from '../state/store';
import { CARTE, LAMINA as LAMINA_TOKEN } from '../styles/tokens';
import { Atlante, tipoTexel, type Slot } from './atlas';
import {
  aggiornato,
  firmaStile,
  impacchetta,
  misuraInAttesa,
  nuovoStato,
  ordinaPerDisegno,
  punteggio,
  selezionaBlocchi,
  serveDisegno,
  sulloSchermo,
  type StatoBloccoGL,
} from './blocks';
import { creaTexturaFibra, generaFibraAPezzi } from './fiber';
import { disegnaMaschera } from './maskPainter';
import {
  creaGeometriaSchermo,
  creaMaterialeBlur,
  creaMaterialeComposite,
  creaMaterialeRilievo,
  impostaBlur,
  impostaCartaAttiva,
  impostaCarte,
  impostaComposite,
  impostaLamina,
  impostaLuce,
  impostaNumeroBlocchi,
  impostaOnda,
  impostaVista,
  type MaterialeBlur,
  type MaterialeComposite,
  type MaterialeRilievo,
} from './materials';
import { paletteCarta, type CartaGL } from './presets';
import { Qualita, dprAlMinimo, dprPerCanvas } from './quality';

/* ------------------------------------------------------------------------- */
/* Costanti                                                                   */
/* ------------------------------------------------------------------------- */

/** Scala massima di cottura delle maschere, texel per px CSS (tech-architect §7.4). */
export const SCALA_MASCHERA_MAX = 1.5;
/** Dopo quanto (ms dall'avvio o dal ripristino) si accende il GL anche se manca qualche maschera. */
export const ATTESA_PRIMO_FRAME_MAX = 3000;
/** Disegni di maschere (canvas 2D) avviati per frame. */
const DISEGNI_PER_FRAME = 2;
/**
 * Cotture per frame prima della comparsa. Giro 2 (performance-auditor P5): 3
 * e non più 6, così l'avvio non si concentra in un solo task lungo.
 */
const COTTURE_PER_FRAME_ATTESA = 3;
/** Cotture per frame a GL acceso quando tutto ciò che è in vista è già disegnato: 3 draw call in più (budget §8). */
const COTTURE_PER_FRAME = 1;
/**
 * Cotture per frame a GL acceso quando un blocco in vista aspetta la sua
 * maschera (entrato di colpo con un salto d'ancora o su uno schermo grande):
 * recuperare in fretta conta più del budget di draw call di quei pochi frame.
 */
const COTTURE_PER_FRAME_RECUPERO = 2;
/** Intervallo minimo tra due rimisure del registro per cambi di layout (ms); l'ultima arriva sempre. */
const INTERVALLO_RIMISURA = 100;
/** Variabile inline scritta da motion/usePressione sull'elemento premuto: urto 0..1. */
const VAR_URTO = '--imp-press-urto';
/** Attributo scritto sui fantasmi che il GL non sta disegnando (vedi docs/shader-engineer.md). */
export const ATTR_FUORI_GL = 'data-imp-gl';
/**
 * Segni nella timeline di Performance per chi misura l'avvio
 * (performance-auditor): `impronta-gl:<passo>`. Costano niente.
 */
function segna(passo: string): void {
  try {
    performance.mark(`impronta-gl:${passo}`);
  } catch {
    // Performance API assente: niente segni
  }
}

/** dt del primo frame dopo un risveglio del ticker (contratto di core/ticker.ts). */
const DT_RISVEGLIO = 1 / 60;

export type MotivoSpegnimento = 'qualita';

export interface OpzioniImprontaGL {
  /** Il canvas (già nel DOM, classe `imp-gl`). */
  readonly canvas: HTMLCanvasElement;
  /** `?gl=1`: il GL non si spegne mai per lentezza (il DPR scende lo stesso). */
  readonly forzato: boolean;
  /** Puntatore grossolano (telefono, tablet): tetto del DPR 1,75, atlante a 8 bit. */
  readonly grossolano: boolean;
  /** Chiamata una volta se la qualità decide di passare al fallback CSS. */
  readonly onSpegni: (motivo: MotivoSpegnimento) => void;
}

/** Diagnostica leggibile da console e dai test (solo in sviluppo o con `?gl=1`). */
export interface DiagnosticaGL {
  stato: 'avvio' | 'attesa' | 'acceso' | 'perso' | 'spento' | 'smontato';
  frameDisegnati: number;
  frameSaltati: number;
  /** Draw call dell'ultimo frame disegnato (1, o 1 + 3 × cotture). */
  drawCallUltimoFrame: number;
  /** Draw call dell'ultimo frame SENZA cotture: deve essere 1. */
  drawCallFrameNormale: number;
  cotture: number;
  disegniMaschera: number;
  compattazioni: number;
  blocchiDisegnati: number;
  blocchiSulloSchermo: number;
  dpr: number;
  buffer: [number, number];
  css: [number, number];
  atlante: { lato: number; halfFloat: boolean; slot: number; occupazione: number };
  qualita: { media: number; riduzione: number };
  contestiPersi: number;
  /** Rimisure del registro per un cambio di layout delle sezioni (giro 3). */
  rimisureLayout: number;
}

/* ------------------------------------------------------------------------- */
/* Classe                                                                     */
/* ------------------------------------------------------------------------- */

export class ImprontaGL {
  readonly diagnostica: DiagnosticaGL;

  private readonly canvas: HTMLCanvasElement;
  private readonly grossolano: boolean;
  private readonly onSpegni: (motivo: MotivoSpegnimento) => void;

  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly qualita: Qualita;

  private geometria: PlaneGeometry | null = null;
  private mesh: Mesh<PlaneGeometry, ShaderMaterial> | null = null;
  private rilievo: MaterialeRilievo | null = null;
  private blur: MaterialeBlur | null = null;
  private composite: MaterialeComposite | null = null;
  private fibra: Texture | null = null;
  private atlante: Atlante | null = null;

  private readonly stati = new Map<string, StatoBloccoGL>();
  private readonly fantasmi = new Map<string, HTMLElement>();
  private readonly candidati: ReliefBlock[] = [];
  private readonly selezione: ReliefBlock[] = [];
  private readonly disegnati = new Set<string>();
  /** Appoggi riusati per ordinare disegni e cotture (niente allocazioni per frame). */
  private readonly daOrdinare: ReliefBlock[] = [];
  /** Un blocco sullo schermo non è stato disegnato nell'ultimo frame. */
  private mancanoInVista = false;
  private readonly misuraBuffer = new Vector2();

  /** Viewport applicato (per accorgersi dei cambi). */
  private vpW = -1;
  private vpH = -1;
  private vpDpr = -1;
  private riduzioneApplicata = -1;
  private cssW = 1;
  private cssH = 1;
  private bufW = 1;
  private bufH = 1;
  private dpr = 1;
  private scalaMaschere = 0;
  private viewportCambiato = true;

  /** Ultimi valori disegnati (render on demand). */
  private ultimoScroll = Number.NaN;
  private ultimoAzimut = Number.NaN;
  private ultimaElevazione = Number.NaN;
  private cartaApplicata: CartaGL | null = null;
  private ondaAttiva = false;

  private pronto = false;
  private primoFrame = false;
  private inizioAttesa = 0;
  private timerAttesa = 0;
  private perso = false;
  private spento = false;
  private smontato = false;
  private numeroFrame = 0;
  /** Dopo la comparsa: le maschere vanno ridisegnate appena il DOM mostra data-gl="on". */
  private rifaiDopoComparsa = false;
  /** Una sezione ha cambiato misura: i rettangoli "doc" del registro vanno riletti. */
  private layoutCambiato = false;
  private ultimaRimisura = Number.NEGATIVE_INFINITY;

  private togli: Array<() => void> = [];
  /** compileAsync in corso: il contesto non si può perdere finché three la sta aspettando. */
  private compilazione: Promise<unknown> | null = null;
  private gpuLiberata = false;

  constructor(opzioni: OpzioniImprontaGL) {
    this.canvas = opzioni.canvas;
    this.grossolano = opzioni.grossolano;
    this.onSpegni = opzioni.onSpegni;
    this.qualita = new Qualita({ puoSpegnere: !opzioni.forzato });

    // Il rilevamento (core/capabilities) ha già scartato le GPU software con
    // failIfMajorPerformanceCaveat: qui il contesto si crea senza, per non
    // fallire su un dispositivo che il rilevamento ha già approvato.
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    });
    this.renderer.autoClear = false;
    this.renderer.info.autoReset = false;
    this.camera.position.z = 0.5;

    this.diagnostica = {
      stato: 'avvio',
      frameDisegnati: 0,
      frameSaltati: 0,
      drawCallUltimoFrame: 0,
      drawCallFrameNormale: 0,
      cotture: 0,
      disegniMaschera: 0,
      compattazioni: 0,
      blocchiDisegnati: 0,
      blocchiSulloSchermo: 0,
      dpr: 1,
      buffer: [1, 1],
      css: [1, 1],
      atlante: { lato: 0, halfFloat: false, slot: 0, occupazione: 0 },
      qualita: { media: 0, riduzione: 0 },
      contestiPersi: 0,
      rimisureLayout: 0,
    };

    this.canvas.addEventListener('webglcontextlost', this.suContestoPerso, false);
    this.canvas.addEventListener('webglcontextrestored', this.suContestoRipristinato, false);
  }

  /**
   * Seconda metà dell'avvio, asincrona: fibra generata a pezzi (niente task
   * lunghi), materiali, atlante, abbonamenti. Poi il ticker fa il resto.
   */
  async avvia(): Promise<void> {
    const cedi = (): Promise<void> =>
      new Promise<void>((risolvi) => {
        window.setTimeout(risolvi, 0);
      });
    segna('avvio');
    const datiFibra = await generaFibraAPezzi(cedi);
    if (this.smontato) return;
    segna('fibra');

    const r = this.renderer;
    this.fibra = creaTexturaFibra(datiFibra);
    const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const atlante = new Atlante(tipoTexel(r, this.grossolano, memoria));
    this.atlante = atlante;

    const rilievo = creaMaterialeRilievo({
      atlante: atlante.target.texture,
      fibra: this.fibra,
      larghezzaAtlante: atlante.lato,
      altezzaAtlante: atlante.lato,
    });
    impostaCarte(rilievo, {
      citrino: paletteCarta(CARTE.citrino),
      cotone: paletteCarta(CARTE.cotone),
      cipria: paletteCarta(CARTE.cipria),
      grafite: paletteCarta(CARTE.grafite),
    });
    impostaLamina(rilievo, LAMINA_TOKEN.base);
    this.cartaApplicata = store.get().carta;
    impostaCartaAttiva(rilievo, this.cartaApplicata);
    this.rilievo = rilievo;
    this.blur = creaMaterialeBlur();
    this.composite = creaMaterialeComposite();

    this.geometria = creaGeometriaSchermo();
    const mesh = new Mesh<PlaneGeometry, ShaderMaterial>(this.geometria, rilievo);
    mesh.frustumCulled = false;
    this.mesh = mesh;
    this.scene.add(mesh);

    // Giro 2 (performance-auditor P5): prima l'avvio compilava i tre
    // programmi e li usava per la prima volta nello stesso task (~950 ms in
    // SwiftShader, 100-300 ms stimati su un telefono). Adesso ogni programma
    // ha due task suoi, separati da un setTimeout:
    //   1. `compileAsync`: con KHR_parallel_shader_compile il driver compila
    //      e collega in parallelo e three aspetta senza bloccare; senza
    //      l'estensione il costo si sposta al primo uso;
    //   2. primo uso su un bersaglio minuscolo (verifica del link, uniform,
    //      allocazione del render target): per il composite è l'atlante, così
    //      anche l'allocazione dei suoi 16-32 MB cade in un task a parte.
    const riscaldo: ReadonlyArray<readonly [ShaderMaterial, WebGLRenderTarget]> = [
      [this.blur, atlante.blurA],
      [this.composite, atlante.target],
      [rilievo, atlante.blurB],
    ];
    for (const [m, bersaglio] of riscaldo) {
      mesh.material = m;
      this.compilazione = r.compileAsync(this.scene, this.camera);
      await this.compilazione;
      segna(`compilato-${m.name}`);
      this.compilazione = null;
      if (this.smontato) {
        this.liberaGpu();
        return;
      }
      await cedi();
      if (this.smontato) {
        this.liberaGpu();
        return;
      }
      bersaglio.viewport.set(0, 0, 1, 1);
      bersaglio.scissor.set(0, 0, 1, 1);
      bersaglio.scissorTest = true;
      r.setRenderTarget(bersaglio);
      r.render(this.scene, this.camera);
      r.setRenderTarget(null);
      bersaglio.scissorTest = false;
      bersaglio.viewport.set(0, 0, bersaglio.width, bersaglio.height);
      bersaglio.scissor.set(0, 0, bersaglio.width, bersaglio.height);
      segna(`primo-uso-${m.name}`);
      await cedi();
      if (this.smontato) {
        this.liberaGpu();
        return;
      }
    }
    mesh.material = rilievo;

    for (const b of registry.all()) this.aggiungiStato(b);
    this.togli.push(registry.subscribe(this.suRegistro));
    this.togli.push(store.subscribe(this.suStore));

    const fonts = 'fonts' in document ? document.fonts : null;
    if (fonts !== null) {
      fonts.addEventListener('loadingdone', this.suFont);
      this.togli.push(() => {
        fonts.removeEventListener('loadingdone', this.suFont);
      });
    }

    this.osservaLayout();

    this.pronto = true;
    this.avviaAttesa();
    this.togli.push(ticker.add(this.preparazione, 'read'));
    this.togli.push(ticker.add(this.render, 'render'));
    runtime.markDirty();
    ticker.wake();
  }

  /** Smonta tutto: ticker, abbonamenti, GPU, contesto. Idempotente. */
  dispose(): void {
    if (this.smontato) return;
    this.smontato = true;
    this.pronto = false;
    window.clearTimeout(this.timerAttesa);
    for (const t of this.togli) t();
    this.togli = [];
    this.canvas.removeEventListener('webglcontextlost', this.suContestoPerso, false);
    this.canvas.removeEventListener('webglcontextrestored', this.suContestoRipristinato, false);

    for (const [id, el] of this.fantasmi) {
      if (el.getAttribute(ATTR_FUORI_GL) !== null) el.removeAttribute(ATTR_FUORI_GL);
      this.fantasmi.delete(id);
    }
    this.stati.clear();
    this.diagnostica.stato = 'smontato';

    // three controlla lo stato dei programmi di compileAsync con un
    // setTimeout finché non sono pronti: perdere il contesto adesso lo
    // lascerebbe a interrogare per sempre. Il GPU si libera appena finisce
    // (avvia() se ne accorge da `smontato`).
    if (this.compilazione !== null) return;
    this.liberaGpu();
  }

  /** Libera materiali, texture, render target e contesto. Una volta sola. */
  private liberaGpu(): void {
    if (this.gpuLiberata) return;
    this.gpuLiberata = true;
    if (this.mesh !== null) this.scene.remove(this.mesh);
    this.geometria?.dispose();
    this.rilievo?.dispose();
    this.blur?.dispose();
    this.composite?.dispose();
    this.fibra?.dispose();
    this.atlante?.dispose();
    this.geometria = null;
    this.mesh = null;
    this.rilievo = null;
    this.blur = null;
    this.composite = null;
    this.fibra = null;
    this.atlante = null;

    this.renderer.renderLists.dispose();
    this.renderer.dispose();
    try {
      this.renderer.forceContextLoss();
    } catch {
      // contesto già perso: niente da liberare
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Eventi                                                                  */
  /* ----------------------------------------------------------------------- */

  private readonly suRegistro = (e: EventoRegistro): void => {
    if (this.smontato) return;
    if (e.tipo === 'aggiunto') {
      const b = registry.get(e.id);
      if (b !== undefined) this.aggiungiStato(b);
    } else if (e.tipo === 'rimosso') {
      this.togliStato(e.id);
    }
    // versione, spec, misura, visibilita: se ne occupano preparazione e render.
    ticker.wake();
  };

  private readonly suStore = (): void => {
    const s = store.get();
    if (s.carta !== this.cartaApplicata || s.cartaWave !== null) {
      runtime.markDirty();
      ticker.wake();
    }
  };

  private readonly suFont = (): void => {
    // Un font arrivato può cambiare i glifi senza cambiare la misura del
    // blocco (ripieghi con size-adjust): si ridisegnano tutte le maschere.
    for (const s of this.stati.values()) s.daRifare = true;
    ticker.wake();
  };

  private readonly suContestoPerso = (e: Event): void => {
    e.preventDefault();
    if (this.smontato) return;
    this.perso = true;
    this.primoFrame = false;
    this.diagnostica.stato = 'perso';
    this.diagnostica.contestiPersi += 1;
    impostaGL('off', 'contesto-perso');
  };

  private readonly suContestoRipristinato = (): void => {
    if (this.smontato) return;
    this.perso = false;
    // three ha già rifatto il suo stato GL (programmi e texture si ricaricano
    // al primo uso); il contenuto dei render target invece è perso.
    this.atlante?.azzera();
    for (const s of this.stati.values()) {
      s.slot = null;
      s.cotta = null;
      s.versioneCotta = 0;
      s.statici = null;
      s.chiaveStatici = '';
    }
    if (this.fibra !== null) this.fibra.needsUpdate = true;
    this.vpW = -1;
    this.qualita.azzera();
    this.ultimoScroll = Number.NaN;
    this.avviaAttesa();
    runtime.markDirty();
    ticker.wake();
  };

  /* ----------------------------------------------------------------------- */
  /* Ticker: fase 'read'                                                     */
  /* ----------------------------------------------------------------------- */

  private readonly preparazione = (_dt: number, now: number): boolean => {
    if (!this.pronto || this.perso || this.spento) return false;
    this.applicaViewport();

    // Giro 3: una sezione sopra un blocco ha cambiato altezza (hero
    // ricomposto a font arrivati, legatoria, banco…) → i rettangoli "doc" si
    // rileggono, qui in fase 'read', al massimo ogni INTERVALLO_RIMISURA ms;
    // l'ultima rimisura arriva sempre (il ticker resta sveglio fino ad allora).
    let rimisuraInAttesa = false;
    if (this.layoutCambiato) {
      if (now - this.ultimaRimisura >= INTERVALLO_RIMISURA) {
        this.layoutCambiato = false;
        this.ultimaRimisura = now;
        this.diagnostica.rimisureLayout += 1;
        registry.invalidate();
        runtime.markDirty();
      } else {
        rimisuraInAttesa = true;
      }
    }

    // Con data-gl="on" relief-fallback.css porta i fantasmi agli assi di
    // arrivo (wdth/wght finali): la loro scatola non cambia, quindi nessun
    // ResizeObserver se ne accorge, ma i glifi sì. Le maschere cotte durante
    // l'attesa (assi a metà pressa, o font di ripiego) si ridisegnano una
    // volta, appena React ha scritto l'attributo sulla radice.
    if (this.rifaiDopoComparsa) {
      const radice = this.canvas.closest('.imp-root');
      if (radice === null || radice.getAttribute('data-gl') === 'on') {
        this.rifaiDopoComparsa = false;
        // Giro 2: si ridisegnano solo le maschere il cui fantasma ha
        // davvero cambiato stile (di solito la sola parola dell'hero).
        for (const b of registry.all()) {
          const st = this.stati.get(b.id);
          if (st === undefined || st.firma === '' || !b.el.isConnected) continue;
          if (firmaStile(b.el) !== st.firma) st.daRifare = true;
        }
      } else {
        return true;
      }
    }

    // Blocchi che chiedono un disegno, in ordine: slot riservato (Banco,
    // cambia a ogni tasto), poi sullo schermo per priorità e area in vista
    // (i pezzi grandi prima), poi quelli entro una viewport (IO del registro).
    let inAttesa = false;
    const lista = this.daOrdinare;
    lista.length = 0;
    for (const b of registry.all()) {
      if (!b.visibile) continue;
      const stato = this.stati.get(b.id);
      if (stato === undefined) continue;
      if (serveDisegno(b, stato, now)) lista.push(b);
      else if (misuraInAttesa(stato)) inAttesa = true;
    }
    this.ordinaPerUrgenza(lista);
    const n = Math.min(lista.length, DISEGNI_PER_FRAME);
    for (let i = 0; i < n; i += 1) {
      const b = lista[i];
      const stato = b === undefined ? undefined : this.stati.get(b.id);
      if (b !== undefined && stato !== undefined) this.avviaDisegno(b, stato);
    }
    lista.length = 0;
    // Un cambio di misura aspetta ATTESA_MISURA: il ticker resta sveglio fino ad allora.
    return inAttesa || rimisuraInAttesa;
  };

  /* ----------------------------------------------------------------------- */
  /* Ticker: fase 'render'                                                   */
  /* ----------------------------------------------------------------------- */

  private readonly render = (dt: number, now: number): boolean => {
    if (!this.pronto || this.perso || this.spento) return false;
    const rilievo = this.rilievo;
    const mesh = this.mesh;
    const atlante = this.atlante;
    if (rilievo === null || mesh === null || atlante === null) return false;

    this.renderer.info.reset();
    this.applicaViewport();

    // 1. Cotture delle maschere pronte.
    const limiteCotture = !this.primoFrame
      ? COTTURE_PER_FRAME_ATTESA
      : this.mancanoInVista
        ? COTTURE_PER_FRAME_RECUPERO
        : COTTURE_PER_FRAME;
    const cotte = this.cuociPronte(limiteCotture);
    let ancora = this.haPronte();

    // 2. Culling: blocchi sullo schermo, massimo 8.
    selezionaBlocchi(registry.all(), this.cssW, this.cssH, this.candidati, this.selezione);
    this.diagnostica.blocchiSulloSchermo = this.candidati.length;

    // 3. Prima comparsa: si aspetta che tutti i blocchi sullo schermo abbiano la loro maschera.
    if (!this.primoFrame) {
      let tutti = true;
      for (const b of this.selezione) {
        if (!aggiornato(b, this.stati.get(b.id))) {
          tutti = false;
          break;
        }
      }
      if (!tutti && now - this.inizioAttesa < ATTESA_PRIMO_FRAME_MAX) {
        this.diagnostica.stato = 'attesa';
        return ancora;
      }
    }

    // 3b. Urto (carta schiacciata attorno al solco, giro 3): lo scrive
    // motion/usePressione come variabile inline sull'elemento premuto; si
    // legge solo per i blocchi selezionati (stile inline: nessun layout).
    let urtoCambiato = false;
    for (const b of this.selezione) {
      const st = this.stati.get(b.id);
      if (st === undefined) continue;
      const grezzo = parseFloat(b.el.style.getPropertyValue(VAR_URTO));
      const urto = Number.isFinite(grezzo) ? Math.max(0, Math.min(1, grezzo)) : 0;
      if (urto !== st.urto) {
        st.urto = urto;
        urtoCambiato = true;
      }
    }

    // 4. Serve disegnare?
    const L = runtime.light;
    const s = store.get();
    const onda = s.cartaWave !== null ? getPaperWave(now) : null;
    const serve =
      !this.primoFrame ||
      runtime.dirty ||
      urtoCambiato ||
      cotte > 0 ||
      this.viewportCambiato ||
      runtime.scrollY !== this.ultimoScroll ||
      L.azimuth !== this.ultimoAzimut ||
      L.elevation !== this.ultimaElevazione ||
      s.carta !== this.cartaApplicata ||
      onda !== null ||
      this.ondaAttiva;
    if (!serve) {
      // Frame saltato (per esempio l'arco della luce a 30 fps): non
      // interrompe il conteggio della qualità, solo un sonno del ticker lo fa.
      this.diagnostica.frameSaltati += 1;
      if (dt === DT_RISVEGLIO) this.qualita.interrompi();
      return ancora;
    }

    // 5. Uniform globali.
    impostaVista(rilievo, this.bufW, this.bufH, this.dpr, runtime.scrollY);
    impostaLuce(rilievo, L.azimuth, L.elevation, 1);
    if (onda !== null) {
      impostaOnda(rilievo, {
        x: onda.x * this.dpr,
        y: onda.y * this.dpr,
        raggio: onda.raggio * this.dpr,
        sfumatura: onda.bordo * this.dpr,
        da: onda.from,
        a: onda.to,
      });
      this.ondaAttiva = true;
      ancora = true;
    } else if (this.ondaAttiva || s.carta !== this.cartaApplicata) {
      impostaOnda(rilievo, null, s.carta);
      this.ondaAttiva = false;
    }
    this.cartaApplicata = s.carta;

    // 6. Blocchi negli uniform.
    this.numeroFrame += 1;
    ordinaPerDisegno(this.selezione);
    const n = impacchetta(rilievo, this.selezione, this.stati, this.dpr, atlante.lato, this.numeroFrame, this.disegnati);
    impostaNumeroBlocchi(rilievo, n);

    // 7. Il frame: 1 draw call.
    mesh.material = rilievo;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);

    this.ultimoScroll = runtime.scrollY;
    this.ultimoAzimut = L.azimuth;
    this.ultimaElevazione = L.elevation;
    this.viewportCambiato = false;
    runtime.dirty = false;

    this.scriviFantasmi();
    this.aggiornaDiagnostica(n, cotte);

    // 8. Comparsa.
    if (!this.primoFrame) {
      this.primoFrame = true;
      window.clearTimeout(this.timerAttesa);
      this.diagnostica.stato = 'acceso';
      segna('primo-frame');
      impostaGL('on');
      this.rifaiDopoComparsa = true;
      return true;
    }

    // 9. Qualità: frame disegnati senza cotture. Il dt è l'intervallo dal
    // frame precedente (disegnato o saltato): misura quanto il GPU trattiene
    // il main thread. Il primo frame dopo un sonno del ticker non conta.
    if (cotte === 0) {
      if (dt === DT_RISVEGLIO) {
        this.qualita.interrompi();
      } else {
        const alMinimo = dprAlMinimo(this.dprDispositivo(), this.cssW, this.cssH, this.grossolano, this.qualita.riduzione);
        const esito = this.qualita.campione(dt * 1000, now, alMinimo);
        if (esito === 'abbassa') {
          runtime.markDirty();
          ancora = true;
        } else if (esito === 'spegni') {
          this.spegni();
          return false;
        }
      }
    }
    return ancora;
  };

  /* ----------------------------------------------------------------------- */
  /* Layout delle sezioni (giro 3)                                           */
  /* ----------------------------------------------------------------------- */

  /**
   * Il registro rimisura un blocco "doc" quando cambia la SUA misura, a
   * resize della finestra e a font pronti. Non quando una sezione SOPRA di
   * lui cambia altezza dopo: l'hero che si ricompone quando Anybody arriva
   * (47 px a 1440 in prova), la legatoria, il banco, un testo che va a capo.
   * Il blocco allora scende o sale nel DOM ma il suo `rectDoc` resta quello
   * vecchio, e il rilievo GL finisce fuori posto (bottega a 375, colophon e
   * Per chi a 1440 nel giro 2 della giuria).
   *
   * Qui un ResizeObserver guarda il contenitore del contenuto e ogni sezione
   * (figli di `.imp-contenuto` e di `.imp-main`): qualunque cambio di misura
   * sposta i blocchi che vengono dopo, quindi chiede una rimisura del
   * registro (`registry.invalidate()`) nella prossima fase 'read'.
   */
  private osservaLayout(): void {
    if (typeof ResizeObserver === 'undefined') return;
    const contenuto = this.canvas.closest('.imp-root')?.querySelector<HTMLElement>('.imp-contenuto') ?? null;
    if (contenuto === null) return;
    const ro = new ResizeObserver(() => {
      if (this.smontato) return;
      this.layoutCambiato = true;
      ticker.wake();
    });
    ro.observe(contenuto);
    for (const figlio of Array.from(contenuto.children)) ro.observe(figlio);
    const main = contenuto.querySelector<HTMLElement>(':scope > main');
    if (main !== null) for (const sezione of Array.from(main.children)) ro.observe(sezione);
    this.togli.push(() => {
      ro.disconnect();
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Viewport e DPR                                                          */
  /* ----------------------------------------------------------------------- */

  private dprDispositivo(): number {
    const v = runtime.viewport.dpr;
    if (Number.isFinite(v) && v > 0) return v;
    return window.devicePixelRatio || 1;
  }

  /**
   * Porta il drawing buffer alla misura del canvas × DPR quando cambia il
   * viewport, il DPR del dispositivo o la riduzione adattiva. Legge il layout
   * (clientWidth/Height del canvas) solo in quel caso.
   */
  private applicaViewport(): void {
    const v = runtime.viewport;
    const dprDisp = this.dprDispositivo();
    if (v.w === this.vpW && v.h === this.vpH && dprDisp === this.vpDpr && this.qualita.riduzione === this.riduzioneApplicata) {
      return;
    }
    this.vpW = v.w;
    this.vpH = v.h;
    this.vpDpr = dprDisp;
    this.riduzioneApplicata = this.qualita.riduzione;

    const cssW = Math.max(1, this.canvas.clientWidth || v.w || window.innerWidth);
    const cssH = Math.max(1, this.canvas.clientHeight || v.h || window.innerHeight);
    const dpr = dprPerCanvas(dprDisp, cssW, cssH, this.grossolano, this.qualita.riduzione);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(cssW, cssH, false);
    this.renderer.getDrawingBufferSize(this.misuraBuffer);
    this.cssW = cssW;
    this.cssH = cssH;
    this.bufW = Math.max(1, this.misuraBuffer.x);
    this.bufH = Math.max(1, this.misuraBuffer.y);
    // DPR effettivo: il buffer è arrotondato per difetto, così i blocchi
    // cadono esattamente sul pixel del DOM anche con DPR frazionari.
    this.dpr = this.bufW / cssW;

    // Scala delle maschere: dal DPR del dispositivo (non dalla riduzione
    // adattiva: una maschera più fine del buffer non costa nulla a frame).
    const scala = Math.min(SCALA_MASCHERA_MAX, dprPerCanvas(dprDisp, cssW, cssH, this.grossolano, 0));
    if (this.scalaMaschere !== 0 && Math.abs(scala - this.scalaMaschere) > 1e-3) {
      for (const s of this.stati.values()) s.daRifare = true;
    }
    this.scalaMaschere = scala;
    this.viewportCambiato = true;
    this.qualita.azzera();
    runtime.markDirty();
  }

  /* ----------------------------------------------------------------------- */
  /* Maschere: disegno (canvas 2D) e cottura (GPU)                           */
  /* ----------------------------------------------------------------------- */

  private aggiungiStato(b: ReliefBlock): void {
    if (this.stati.has(b.id)) return;
    this.stati.set(b.id, nuovoStato(b.id));
    this.fantasmi.set(b.id, b.el);
  }

  private togliStato(id: string): void {
    const s = this.stati.get(id);
    if (s !== undefined && s.slot !== null) this.atlante?.libera(s.slot);
    this.stati.delete(id);
    const el = this.fantasmi.get(id);
    if (el !== undefined && el.getAttribute(ATTR_FUORI_GL) !== null) el.removeAttribute(ATTR_FUORI_GL);
    this.fantasmi.delete(id);
  }

  private avviaDisegno(b: ReliefBlock, stato: StatoBloccoGL): void {
    const atlante = this.atlante;
    if (atlante === null) return;
    const versione = b.versione;
    const misuraW = b.rectDoc.w;
    const misuraH = b.rectDoc.h;
    stato.inCorso = versione;
    stato.daRifare = false;
    stato.diversoDa = Number.NaN;
    stato.firma = b.el.isConnected ? firmaStile(b.el) : '';
    this.diagnostica.disegniMaschera += 1;

    let canvas: HTMLCanvasElement | null = null;
    if (b.spec.slot !== undefined) {
      if (stato.canvas === null) stato.canvas = document.createElement('canvas');
      canvas = stato.canvas;
    }

    disegnaMaschera({
      spec: b.spec,
      el: b.el,
      larghezza: misuraW,
      altezza: misuraH,
      scala: this.scalaMaschere > 0 ? this.scalaMaschere : 1,
      maxLato: atlante.latoMaschera,
      canvas,
    }).then(
      (risultato) => {
        if (this.smontato || this.stati.get(b.id) !== stato) return;
        stato.inCorso = 0;
        stato.pronta = { risultato, versione, misuraW, misuraH };
        runtime.markDirty();
        ticker.wake();
      },
      (errore: unknown) => {
        if (this.smontato || this.stati.get(b.id) !== stato) return;
        stato.inCorso = 0;
        stato.versioneFallita = versione;
        if (import.meta.env.DEV) console.warn('[impronta/gl] maschera non disegnata', b.id, errore);
        ticker.wake();
      },
    );
  }

  private haPronte(): boolean {
    for (const s of this.stati.values()) if (s.pronta !== null) return true;
    return false;
  }

  /**
   * Ordine di urgenza per disegni e cotture: slot riservato, poi sullo
   * schermo per `punteggio` (priorità, area in vista, centro), poi il resto.
   */
  private ordinaPerUrgenza(lista: ReliefBlock[]): void {
    if (lista.length < 2) return;
    const vw = this.cssW;
    const vh = this.cssH;
    const chiave = (b: ReliefBlock): number => {
      const riservato = b.spec.slot !== undefined ? 1e14 : 0;
      const schermo = sulloSchermo(b, vw, vh) ? 1e12 : 0;
      return riservato + schermo + punteggio(b, vw, vh);
    };
    lista.sort((a, b) => chiave(b) - chiave(a));
  }

  /** Cuoce fino a `limite` maschere pronte, nell'ordine di urgenza. */
  private cuociPronte(limite: number): number {
    const lista = this.daOrdinare;
    lista.length = 0;
    for (const b of registry.all()) {
      const stato = this.stati.get(b.id);
      if (stato !== undefined && stato.pronta !== null) lista.push(b);
    }
    this.ordinaPerUrgenza(lista);
    let fatte = 0;
    for (const b of lista) {
      if (fatte >= limite) break;
      const stato = this.stati.get(b.id);
      if (stato === undefined || stato.pronta === null) continue;
      if (this.cuoci(b, stato)) fatte += 1;
    }
    lista.length = 0;
    return fatte;
  }

  /**
   * Maschera pronta → blur orizzontale (RT A) → blur verticale (RT B) →
   * composite nello slot dell'atlante. 3 draw call. true se ha disegnato.
   */
  private cuoci(b: ReliefBlock, stato: StatoBloccoGL): boolean {
    const p = stato.pronta;
    const atlante = this.atlante;
    const mesh = this.mesh;
    const blur = this.blur;
    const comp = this.composite;
    const rilievo = this.rilievo;
    stato.pronta = null;
    if (p === null || atlante === null || mesh === null || blur === null || comp === null || rilievo === null) return false;
    if (p.versione < stato.versioneCotta) return false;

    const ris = p.risultato;
    const w = ris.larghezzaTexel;
    const h = ris.altezzaTexel;

    let slot = stato.slot;
    if (slot !== null && (slot.w < w || slot.h < h)) {
      atlante.libera(slot);
      slot = null;
      stato.slot = null;
    }
    if (slot === null) {
      // Slot riservato (testo che cambia a ogni tasto): la misura massima
      // dichiarata, così i tasti successivi ricuociono nello stesso posto.
      let lw = w;
      let lh = h;
      const riserva = b.spec.slot;
      if (riserva !== undefined) {
        lw = Math.max(w, Math.ceil((riserva.maxW + ris.padCss * 2) * ris.scala));
        lh = Math.max(h, Math.ceil((riserva.maxH + ris.padCss * 2) * ris.scala));
        lw = Math.min(lw, atlante.latoMaschera);
        lh = Math.min(lh, atlante.latoMaschera);
      }
      slot = this.allocaConSfratto(lw, lh, b.id) ?? (lw !== w || lh !== h ? this.allocaConSfratto(w, h, b.id) : null);
      if (slot === null) slot = this.compatta(w, h, b.id);
      if (slot === null) {
        stato.versioneFallita = p.versione;
        if (import.meta.env.DEV) console.warn('[impronta/gl] atlante pieno: blocco saltato', b.id, w, h);
        return false;
      }
      stato.slot = slot;
    }

    const r = this.renderer;
    const tex = new CanvasTexture(ris.canvas);
    tex.flipY = true;
    tex.generateMipmaps = false;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.wrapS = ClampToEdgeWrapping;
    tex.wrapT = ClampToEdgeWrapping;
    tex.colorSpace = NoColorSpace;
    tex.needsUpdate = true;

    atlante.preparaBlur(w, h);

    mesh.material = blur;
    impostaBlur(blur, tex, w, h, 0, ris.raggiTexel);
    r.setRenderTarget(atlante.blurA);
    r.render(this.scene, this.camera);

    impostaBlur(blur, atlante.blurA.texture, w, h, 1, ris.raggiTexel);
    r.setRenderTarget(atlante.blurB);
    r.render(this.scene, this.camera);

    const t = atlante.target;
    t.viewport.set(slot.x, slot.y, w, h);
    t.scissor.set(slot.x, slot.y, w, h);
    t.scissorTest = true;
    mesh.material = comp;
    impostaComposite(comp, tex, atlante.blurB.texture, ris.tecnica);
    r.setRenderTarget(t);
    r.render(this.scene, this.camera);

    r.setRenderTarget(null);
    mesh.material = rilievo;
    tex.dispose();
    // I riferimenti alle texture di cottura non devono restare nei materiali.
    blur.uniforms.tSrc.value = null;
    comp.uniforms.tMask.value = null;
    comp.uniforms.tBlur.value = null;

    stato.cotta = {
      larghezzaTexel: w,
      altezzaTexel: h,
      padCss: ris.padCss,
      larghezzaCss: ris.larghezzaCss,
      altezzaCss: ris.altezzaCss,
      corpoCss: ris.corpoCss,
      scala: ris.scala,
      tecnica: ris.tecnica,
      misuraW: p.misuraW,
      misuraH: p.misuraH,
    };
    stato.versioneCotta = p.versione;
    stato.statici = null;
    stato.chiaveStatici = '';
    stato.diversoDa = Number.NaN;
    this.diagnostica.cotture += 1;
    return true;
  }

  /** Alloca; se l'atlante è pieno libera i blocchi lontani dallo schermo, dal meno usato. */
  private allocaConSfratto(w: number, h: number, perId: string): Slot | null {
    const atlante = this.atlante;
    if (atlante === null) return null;
    let slot = atlante.alloca(w, h);
    while (slot === null) {
      let vittima: StatoBloccoGL | null = null;
      for (const [id, s] of this.stati) {
        if (id === perId || s.slot === null) continue;
        const b = registry.get(id);
        if (b !== undefined && b.visibile) continue;
        if (vittima === null || s.ultimoUso < vittima.ultimoUso) vittima = s;
      }
      if (vittima === null || vittima.slot === null) return null;
      atlante.libera(vittima.slot);
      vittima.slot = null;
      vittima.cotta = null;
      vittima.versioneCotta = 0;
      slot = atlante.alloca(w, h);
    }
    return slot;
  }

  /**
   * Ultima risorsa: l'atlante si svuota (frammentato) e si ricomincia dal
   * blocco che serve adesso; gli altri visibili si ridisegnano nei frame dopo.
   */
  private compatta(w: number, h: number, perId: string): Slot | null {
    const atlante = this.atlante;
    if (atlante === null) return null;
    atlante.azzera();
    for (const [id, s] of this.stati) {
      if (id === perId) continue;
      s.slot = null;
      s.cotta = null;
      s.versioneCotta = 0;
    }
    this.diagnostica.compattazioni += 1;
    return atlante.alloca(w, h);
  }

  /* ----------------------------------------------------------------------- */
  /* Fantasmi, attesa, spegnimento, diagnostica                              */
  /* ----------------------------------------------------------------------- */

  /**
   * `data-imp-gl="fuori"` sui fantasmi sullo schermo che il GL non disegna in
   * questo frame (oltre gli 8, o maschera non ancora cotta), così il CSS può
   * ridare loro il rilievo di ripiego invece di lasciarli trasparenti.
   * Scrive solo quando cambia.
   */
  private scriviFantasmi(): void {
    let mancano = false;
    for (const b of registry.all()) {
      const stato = this.stati.get(b.id);
      if (stato === undefined) continue;
      const fuori = b.visibile && sulloSchermo(b, this.cssW, this.cssH) && !this.disegnati.has(b.id);
      if (fuori && b.versione !== stato.versioneFallita) mancano = true;
      if (fuori === stato.fuori) continue;
      stato.fuori = fuori;
      if (fuori) b.el.setAttribute(ATTR_FUORI_GL, 'fuori');
      else b.el.removeAttribute(ATTR_FUORI_GL);
    }
    this.mancanoInVista = mancano;
  }

  private avviaAttesa(): void {
    this.inizioAttesa = performance.now();
    window.clearTimeout(this.timerAttesa);
    // Sveglia di sicurezza: se una maschera non arriva, allo scadere si
    // accende comunque con quelle pronte.
    this.timerAttesa = window.setTimeout(() => {
      runtime.markDirty();
      ticker.wake();
    }, ATTESA_PRIMO_FRAME_MAX + 50);
  }

  private spegni(): void {
    if (this.spento) return;
    this.spento = true;
    this.diagnostica.stato = 'spento';
    impostaGL('off', 'qualita');
    this.onSpegni('qualita');
  }

  private aggiornaDiagnostica(n: number, cotte: number): void {
    const d = this.diagnostica;
    const chiamate = this.renderer.info.render.calls;
    d.frameDisegnati += 1;
    d.drawCallUltimoFrame = chiamate;
    if (cotte === 0) d.drawCallFrameNormale = chiamate;
    d.blocchiDisegnati = n;
    d.dpr = this.dpr;
    d.buffer = [this.bufW, this.bufH];
    d.css = [this.cssW, this.cssH];
    const a = this.atlante;
    if (a !== null) {
      d.atlante = { lato: a.lato, halfFloat: a.tipo === HalfFloatType, slot: a.numeroSlot, occupazione: a.occupazione };
    }
    d.qualita = { media: this.qualita.media, riduzione: this.qualita.riduzione };
  }
}
