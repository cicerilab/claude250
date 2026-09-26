/**
 * BATTIFILO · coreografia.
 *
 * Unica fonte di durate, soglie e ampiezze del concept. Le sezioni importano
 * da qui, non scrivono numeri propri. Spiegazione schermata per schermata in
 * docs/motion-designer.md.
 *
 * Gli unici movimenti del sito (creative director 4.9): il filo che si tende
 * e batte, la polvere, la dissolvenza delle foto, il cambio della scheda, la
 * battuta a quattro lati della finestra. Più, chiesti dall'ux-architect, il
 * filo molle, il sussulto, la lastra che sale per "Di più" e le dissolvenze
 * di menu e schermate. Nient'altro si muove.
 *
 * Modulo puro: nessun accesso a window/document, sicuro per il prerender.
 */

import { BEZIER_CSS, clamp } from './easing';

/* ------------------------------------------------------------------ */
/* Costanti del contratto (tech-architect §7.2)                        */
/* ------------------------------------------------------------------ */

/** ms fermo col dito sulla cassetta prima dell'aggancio con battuta. */
export const SOSTA = 500;
/** ms del volo da una tacca alla vicina (tocco, tasto, swipe, rotella). */
export const VOLO = 500;
/** ms della battuta piena del filo (alzata, caduta, due rimbalzi). */
export const BATTUTA = 350;
/** ms della polvere che si alza e si posa. */
export const POLVERE = 800;
/** ms della dissolvenza della scheda sulla lastra. */
export const DISSOLVENZA_TAPPA = 250;
/** ms della dissolvenza incrociata delle foto. */
export const DISSOLVENZA_FOTO = 450;
/** ms della dissolvenza delle foto con reduced motion. */
export const DISSOLVENZA_FOTO_RIDOTTA = 150;
/**
 * ms minimi tra due cambi di tappa mostrata (quindi di foto) durante il
 * trascinamento e tra un cambio e l'aggancio. Limite anti-lampeggio del Lab
 * (una grande superficie al massimo ogni 500 ms), più severo dei 3 al
 * secondo della direzione (ux-architect 6.10).
 */
export const LIMITE_CAMBIO_TAPPA = 500;
/** ms di attesa prima della battuta d'apertura. */
export const ATTESA_APERTURA = 600;
/** ms tra l'inizio di una battuta e la successiva nei lati della finestra. */
export const PASSO_BATTUTE = 120;
/** ms di blocco tra due passi della rotella. */
export const BLOCCO_ROTELLA = 400;
/** Opacità del gesso già battuto oltre la cassetta (dove si è guardato). */
export const OPACITA_GESSO_VECCHIO = 0.55;

/* ------------------------------------------------------------------ */
/* La scheda sulla lastra                                               */
/* ------------------------------------------------------------------ */

/**
 * Cambio di scheda: l'uscente sfuma in 250 ms, l'entrante parte 100 ms dopo
 * e sfuma in 250 ms. Solo opacità, nessuna traslazione (niente fade-up):
 * le due schede stanno nella stessa cella e si sovrappongono 150 ms, a
 * metà strada tutte e due sotto il 50%, così non si legge un doppio testo.
 */
export const TAPPA = {
  esce: DISSOLVENZA_TAPPA,
  entra: DISSOLVENZA_TAPPA,
  ritardoEntra: 100,
  /** Reduced motion (ux-architect 6.2): 150 ms, senza ritardo. */
  ridotta: 150,
} as const;

/** ms dopo cui `Tappa` può passare da 'entra'/'esce' a 'attiva'/'spenta'. */
export function fineCambioTappa(ridotto: boolean): number {
  return ridotto ? TAPPA.ridotta : TAPPA.ritardoEntra + TAPPA.entra;
}

/* ------------------------------------------------------------------ */
/* Il filo                                                              */
/* ------------------------------------------------------------------ */

export const FILO = {
  /** Alzata al centro (px) per forza di battuta. */
  ampiezza: {
    /** Aggancio normale: rilascio, sosta, tacca, rotella, swipe. */
    piena: 7,
    /** Tasto tenuto premuto (un passo ogni 250 ms): battuta corta. */
    corta: 3.5,
    /** Apertura: la prima battuta, un po' più alta perché si veda. */
    apertura: 10,
    /** Sussulto della Misura (I0): niente segno. */
    sussulto: 2.5,
  },
  /** Durata (ms) per forza di battuta. L'impatto cade al 36% (easing BATTUTA_FASI). */
  durata: {
    piena: BATTUTA,
    corta: 220,
    apertura: 420,
    sussulto: 180,
  },
  /** Spessore del filo (px, non scalato). */
  tratto: 1.5,
  /** Pendenza del filo molle: frazione della lunghezza, limitata in px. */
  molle: { frazione: 0.14, min: 6, max: 48 },
} as const;

export type ForzaBattuta = 'piena' | 'corta' | 'apertura';

/** Quanto pende al centro un filo molle lungo `lunghezza` (stesse unità). */
export function pendenzaMolle(lunghezza: number): number {
  return clamp(Math.abs(lunghezza) * FILO.molle.frazione, FILO.molle.min, FILO.molle.max);
}

/* ------------------------------------------------------------------ */
/* La cassetta                                                          */
/* ------------------------------------------------------------------ */

export const CASSETTA = {
  sosta: SOSTA,
  volo: VOLO,
  /** Volo più lungo per salti di più mesi (Home, Fine, Pagina su/giù, tacca lontana). */
  voloMassimo: 800,
  /** Aggancio dopo il rilascio: 160 ms + 240 ms per tappa di distanza, entro [160, 360]. */
  aggancioBase: 160,
  aggancioPerTappa: 240,
  aggancioMassimo: 360,
  /**
   * Spostamento minimo (in tappe) che conta come "il dito si è mosso" e
   * rimette a zero il cronometro della sosta. 0,02 tappe = 1,7 px a 1440.
   */
  sogliaMovimento: 0.02,
  /**
   * Dopo un aggancio in sosta il dito deve allontanarsi di tanto (tappe)
   * perché la cassetta lo segua di nuovo: il tremolio della mano non stacca
   * la cassetta dalla tacca. 0,06 tappe = 5 px a 1440, 3,4 px su telefono.
   */
  sogliaRipresa: 0.06,
  /** Proiezione della velocità al rilascio (s): decide se andare alla tacca dopo. */
  proiezione: 0.12,
  /** Velocità (tappe/s) oltre cui la proiezione vale. Sotto: tacca più vicina. */
  sogliaLancio: 2.5,
  /** Velocità massima portata dentro l'aggancio o il volo (tappe/s). */
  velocitaMassima: 12,
  /** Tasto tenuto premuto: un passo ogni 250 ms, le ripetizioni più rapide si ignorano. */
  ripetizioneTasto: 250,
} as const;

/** Durata (ms) del volo per una distanza in tappe. 500 ms per una tappa, cresce piano. */
export function durataVolo(distanza: number, base: number = CASSETTA.volo): number {
  const d = Math.abs(distanza);
  if (d <= 1) return base;
  return Math.min(CASSETTA.voloMassimo, Math.round(base * (1 + 0.25 * Math.log2(d))));
}

/** Durata (ms) dell'aggancio al rilascio per una distanza in tappe (≤ 1 di solito). */
export function durataAggancio(distanza: number): number {
  return clamp(
    Math.round(CASSETTA.aggancioBase + CASSETTA.aggancioPerTappa * Math.abs(distanza)),
    CASSETTA.aggancioBase,
    CASSETTA.aggancioMassimo,
  );
}

/* ------------------------------------------------------------------ */
/* Il cambio di tappa durante il trascinamento                          */
/* ------------------------------------------------------------------ */

/** Isteresi (tappe) attorno alla metà del mese: niente va e vieni sul confine. */
export const ISTERESI_TAPPA = 0.06;

/**
 * Tappa da mostrare per la posizione `pos`, sapendo quella mostrata ora.
 * Cambia a metà mese (come `tappaDaPos` di core/tempo.ts) ma solo quando il
 * confine è superato di `isteresi`: fermare il dito proprio sulla metà non
 * fa alternare due foto.
 */
export function tappaConIsteresi(pos: number, corrente: number, isteresi = ISTERESI_TAPPA): number {
  const grezza = Math.round(pos);
  if (grezza === corrente) return corrente;
  if (grezza > corrente) {
    const confine = corrente + 0.5;
    return pos >= confine + isteresi ? grezza : corrente;
  }
  const confine = corrente - 0.5;
  return pos <= confine - isteresi ? grezza : corrente;
}

/**
 * Millisecondi da aspettare prima di poter mostrare un'altra tappa (0 = si
 * può subito). `useCassetta.ts` la chiama nella fase `update` con
 * `runtime.ultimoCambioTappa`; se è > 0 rimanda il cambio al frame in cui
 * torna 0, tenendo solo l'ultima tappa chiesta (mai una coda).
 */
export function attesaCambioTappa(now: number, ultimoCambio: number): number {
  if (!Number.isFinite(ultimoCambio) || ultimoCambio <= 0) return 0;
  return Math.max(0, LIMITE_CAMBIO_TAPPA - (now - ultimoCambio));
}

/* ------------------------------------------------------------------ */
/* Apertura                                                             */
/* ------------------------------------------------------------------ */

/**
 * La battuta d'apertura (ux-architect 5.1, confermata qui con una modifica
 * di geometria). La cassetta NON si muove, la tappa resta 0, nessun annuncio:
 * dopo 600 ms il filo teso tra il gancio e PRIMA si alza e batte una volta
 * (forza 'apertura'), lascia il primo tratto blu e un filo di polvere.
 * Perché il tratto esista, il gancio sta `gancioAnticipo` tappe PRIMA della
 * tacca 0: la linea lo disegna a `xDaPos(-gancioAnticipo, g)` (la formula di
 * core/tempo.ts è lineare e accetta pos negativi). Il tratto d'apertura
 * [−gancioAnticipo, 0] resta battuto per sempre dopo l'apertura.
 */
export const APERTURA = {
  attesa: ATTESA_APERTURA,
  forza: 'apertura' as ForzaBattuta,
  gancioAnticipo: 0.6,
} as const;

/* ------------------------------------------------------------------ */
/* Il gesso                                                             */
/* ------------------------------------------------------------------ */

/**
 * Il gesso nuovo si scopre all'impatto del filo: `--btf-battuto` si scrive
 * UNA volta e `clip-path` passa al valore nuovo con una transizione CSS di
 * `POSA_GESSO` ms e curva `posa` (niente JS per frame). Lo stesso vale per
 * `--btf-massimo` quando cresce.
 */
export const POSA_GESSO = 160;

/* ------------------------------------------------------------------ */
/* La finestra battuta (Misura e manda)                                 */
/* ------------------------------------------------------------------ */

export const FINESTRA = {
  /** ms tra un lato e il successivo (sopra, destra, sotto, sinistra). */
  passo: PASSO_BATTUTE,
  /** ms di un lato: 35% alzata del filo, poi il gesso si apre dal centro. */
  durataLato: 240,
  /** Frazione del lato in cui il filo si alza prima del colpo. */
  alzata: 0.35,
  /** Invio in corso: una battuta lunga su tutto il perimetro. */
  invio: { durata: 900, alzata: 0.2 },
  /** Il disegno si aggiorna quando il valore è valido e fermo da tanto (ms). */
  quieteDigitazione: 400,
  /** Alzata (px nel sistema del piano) del filo sul lato che sta per battere. */
  ampiezzaAlzata: 6,
} as const;

/** Durata totale (ms) di una sequenza di `n` lati. */
export function durataSequenzaLati(n: number, passo: number = FINESTRA.passo, durataLato: number = FINESTRA.durataLato): number {
  if (n <= 0) return 0;
  return (n - 1) * passo + durataLato;
}

/* ------------------------------------------------------------------ */
/* Polvere                                                              */
/* ------------------------------------------------------------------ */

export const POLVERE_PARAMETRI = {
  durata: POLVERE,
  granelliMin: 8,
  granelliMax: 12,
  /** Salita massima (px) e deriva laterale massima (px). */
  salita: [6, 20] as const,
  deriva: 14,
  /** Lato del granello (px): 2 o 3. */
  lato: [2, 3] as const,
  /** Opacità di picco, bassa: niente lampo. */
  opacita: [0.16, 0.36] as const,
  /** Ritardo massimo di partenza tra granelli (ms). */
  ritardo: 70,
} as const;

export interface Granello {
  /** 0..1 lungo il tratto appena battuto (0 = inizio del tratto nuovo). */
  readonly u: number;
  /** Deriva orizzontale finale (px). */
  readonly dx: number;
  /** Salita al culmine (px, negativa = su). */
  readonly dy: number;
  /** Lato (px). */
  readonly lato: number;
  /** Opacità di picco. */
  readonly opacita: number;
  /** Ritardo di partenza (ms). */
  readonly ritardo: number;
}

/** Generatore pseudo-casuale deterministico (mulberry32): stessi granelli con lo stesso seme. */
function casuale(seme: number): () => number {
  let s = (Math.floor(seme) >>> 0) || 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * I granelli di una battuta. `seme` diverso a ogni battuta (per esempio il
 * contatore delle battute): la polvere non è mai identica, ma è
 * riproducibile (screenshot stabili con lo stesso seme).
 */
export function granelliPolvere(seme: number, quanti?: number): readonly Granello[] {
  const p = POLVERE_PARAMETRI;
  const r = casuale(seme);
  const n = clamp(Math.round(quanti ?? p.granelliMin + r() * (p.granelliMax - p.granelliMin)), p.granelliMin, p.granelliMax);
  const out: Granello[] = [];
  for (let i = 0; i < n; i += 1) {
    const u = clamp((i + 0.5 + (r() - 0.5) * 0.8) / n, 0, 1);
    out.push({
      u: Math.round(u * 1000) / 1000,
      dx: Math.round((r() - 0.5) * 2 * p.deriva * 10) / 10,
      dy: -Math.round((p.salita[0] + r() * (p.salita[1] - p.salita[0])) * 10) / 10,
      lato: r() < 0.6 ? p.lato[0] : p.lato[1],
      opacita: Math.round((p.opacita[0] + r() * (p.opacita[1] - p.opacita[0])) * 100) / 100,
      ritardo: Math.round(r() * p.ritardo),
    });
  }
  return out;
}

/**
 * Stile inline di un granello per `Polvere.tsx` (valori fissi al render,
 * mai riscritti: l'animazione è il keyframe `btf-polvere` di motion.css).
 */
export function stileGranello(g: Granello): Record<`--btf-g-${string}`, string> {
  return {
    '--btf-g-u': String(g.u),
    '--btf-g-dx': `${g.dx}px`,
    '--btf-g-dy': `${g.dy}px`,
    '--btf-g-lato': `${g.lato}px`,
    '--btf-g-o': String(g.opacita),
    '--btf-g-ritardo': `${g.ritardo}ms`,
  };
}

/* ------------------------------------------------------------------ */
/* Altri tempi (menu, schermate, lastra, istruzione, marcatura)        */
/* ------------------------------------------------------------------ */

export const TEMPI = {
  /** Menu del telefono: dissolvenza (ux-architect 2.5). Niente tendina. */
  menu: 200,
  /** Schermate Misura, Cartello, Mesi: dissolvenza all'apertura e alla chiusura. */
  schermata: 250,
  /** La lastra che sale sopra la foto per "Di più" (solo transform). */
  lastraSale: 320,
  lastraScende: 260,
  /** Piano di tracciamento con la tastiera aperta (ux-architect 5.5.4). */
  tastiera: 200,
  /** Istruzione "Tira il filo" che sparisce al primo movimento. */
  istruzione: 250,
  /** Data e frase del successo "marcate a spruzzo": compaiono, non si spruzzano. */
  marcatura: 250,
  /** Riga del fermo sotto la linea al passaggio o al fuoco. */
  rigaFermo: 250,
  /** Annuncio aria-live dopo la fermata (ux-architect 5.3.5). */
  annuncio: 500,
  /** Tacca TU: attesa prima delle quattro battute in piccolo al primo ritorno in cronaca. */
  tuAttesa: 400,
} as const;

/* ------------------------------------------------------------------ */
/* Variabili CSS                                                        */
/* ------------------------------------------------------------------ */

/**
 * Curve e durate per le transizioni CSS, da mettere come style inline su
 * `.btf-root` (lo fa Battifilo.tsx, e le ricalcola se cambia reduced
 * motion). Con reduced motion: i movimenti durano 0 ms; restano solo le
 * dissolvenze brevi di foto e scheda (150 ms), perché un cambio netto di
 * una foto intera è peggio di una velatura corta.
 */
export function variabiliMotion(ridotto: boolean): Record<`--btf-${string}`, string> {
  const ms = (v: number): string => `${Math.round(v)}ms`;
  const mov = (v: number): string => (ridotto ? '0ms' : ms(v));
  return {
    '--btf-ease-tiro': BEZIER_CSS.tiro,
    '--btf-ease-aggancio': BEZIER_CSS.aggancio,
    '--btf-ease-velatura': BEZIER_CSS.velatura,
    '--btf-ease-posa': BEZIER_CSS.posa,
    '--btf-ease-solleva': BEZIER_CSS.solleva,
    '--btf-ease-scende': BEZIER_CSS.scende,
    '--btf-ease-sbuffo': BEZIER_CSS.sbuffo,
    '--btf-dur-tappa-esce': ms(ridotto ? TAPPA.ridotta : TAPPA.esce),
    '--btf-dur-tappa-entra': ms(ridotto ? TAPPA.ridotta : TAPPA.entra),
    '--btf-ritardo-tappa-entra': ridotto ? '0ms' : ms(TAPPA.ritardoEntra),
    '--btf-dur-foto': ms(ridotto ? DISSOLVENZA_FOTO_RIDOTTA : DISSOLVENZA_FOTO),
    '--btf-dur-polvere': mov(POLVERE),
    '--btf-dur-posa': mov(POSA_GESSO),
    '--btf-dur-menu': mov(TEMPI.menu),
    '--btf-dur-schermata': mov(TEMPI.schermata),
    '--btf-dur-lastra-sale': mov(TEMPI.lastraSale),
    '--btf-dur-lastra-scende': mov(TEMPI.lastraScende),
    '--btf-dur-tastiera': mov(TEMPI.tastiera),
    '--btf-dur-istruzione': mov(TEMPI.istruzione),
    '--btf-dur-marcatura': mov(TEMPI.marcatura),
    '--btf-dur-riga-fermo': mov(TEMPI.rigaFermo),
    '--btf-opacita-gesso-vecchio': String(OPACITA_GESSO_VECCHIO),
  };
}
