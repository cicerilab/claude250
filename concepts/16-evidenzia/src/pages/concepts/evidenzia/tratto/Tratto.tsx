/**
 * EVIDENZIA · il tratto rosa sopra il testo (interaction-designer).
 *
 * Due componenti, stessa resa (docs/vector-artist.md §3.3, tokens del tratto
 * dell'art-director):
 *
 * - `<Tratto id />`: dentro l'`<article>` di un annuncio (che deve essere
 *   `position: relative`). Legge le righe d'attacco dal registro, lo stato
 *   dallo store (segnato o no), il gesto dal runtime e dal canale `segni`.
 *   Anima con le funzioni del motion-designer (motion/tratto.ts).
 * - `<TrattoSu id>testo</TrattoSu>`: avvolge un testo e ci disegna sopra il
 *   tratto dell'annuncio `id`, pieno (tappe del giro, "Hai segnato") o
 *   dimostrativo (la parola "Segna" del riquadro di testa, una volta sola).
 *   Misura da sé le proprie righe.
 *
 * Struttura: uno `<span class="evd-tratto" data-evdvar>` (il nodo foglia su
 * cui vivono `--evd-avanzamento`, `--evd-inizio`, `--evd-ripasso`) con un
 * `<svg>` per riga. Ogni riga ritaglia la sua parte con `clip-path`
 * calcolato in tratto.css dalle variabili del nodo e dalla sua quota di
 * lunghezza (`--evd-riga-o`, `--evd-riga-f`): una sola variabile guida due
 * righe. Il tratto è sempre `aria-hidden`: lo stato si dice col bottone
 * Evidenzia (`aria-pressed`) e con la regione live.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { fontsReady } from '../core/fonts';
import { semeDa } from '../core/semi';
import { ticker } from '../core/ticker';
import { segni, type EventoTratto } from '../interaction/segni';
import { TRATTO } from '../motion/durate';
import {
  completa,
  dimostrativo,
  disegnaDaBottone,
  ferma,
  ritira,
  scarico as animaScarico,
  scolora,
} from '../motion/tratto';
import { useVoceAnnuncio, type RigaTratto } from '../state/registro';
import { runtime } from '../state/runtime';
import { useEvidenzia, type IdAnnuncio } from '../state/store';
import { formaTratto, ingombroTratto, semePerRiga, variazione } from './forma';
import './tratto.css';

/** Correzione verticale del centro del tratto (vector-artist §3.3): 0,07 × corpo verso l'alto. */
const RIALZO_SU_CORPO = 0.07;
const RIGHE_MAX = 2;

type Stile = CSSProperties & Record<`--${string}`, string | number>;

interface GeometriaRiga {
  readonly chiave: string;
  readonly d: string;
  readonly inchiostro: string;
  readonly striature: readonly string[];
  readonly viewBox: string;
  readonly stile: Stile;
}

function numero(v: number): string {
  return String(Math.round(v * 10000) / 10000);
}

/** Geometria di tutte le righe: pura, ricalcolata solo se cambiano righe, corpo o seme. */
function geometria(
  righe: readonly RigaTratto[],
  corpo: number,
  seme: number,
  scarico: boolean,
): readonly GeometriaRiga[] {
  const usate = righe.slice(0, RIGHE_MAX).filter((r) => r.w > 0);
  const totale = usate.reduce((t, r) => t + r.w, 0);
  if (totale <= 0 || corpo <= 0) return [];
  let offset = 0;
  return usate.map((riga, i) => {
    const semeRiga = semePerRiga(seme, i);
    const ing = ingombroTratto(riga.w, corpo);
    const forma = formaTratto({ larghezza: ing.larghezza, altezza: ing.altezza, seme: semeRiga, scarico });
    const v = variazione(semeRiga);
    const centro = riga.y + riga.h / 2 - RIALZO_SU_CORPO * corpo;
    const quota = riga.w / totale;
    const stile: Stile = {
      left: `${numero(riga.x - ing.sbordo)}px`,
      top: `${numero(centro - ing.altezza / 2 + v.dy)}px`,
      width: `${numero(ing.larghezza)}px`,
      height: `${numero(ing.altezza)}px`,
      transform: v.rotazione === 0 ? undefined : `rotate(${v.rotazione}deg)`,
      '--evd-riga-o': numero(offset / totale),
      '--evd-riga-f': numero(quota),
    };
    offset += riga.w;
    return {
      chiave: `${i}-${forma.viewBox}`,
      d: forma.d,
      inchiostro: forma.inchiostro,
      striature: forma.striature,
      viewBox: forma.viewBox,
      stile,
    };
  });
}

function RigheTratto({ righe }: { readonly righe: readonly GeometriaRiga[] }) {
  return (
    <>
      {righe.map((r) => (
        <svg
          key={r.chiave}
          className="evd-tratto__riga"
          viewBox={r.viewBox}
          preserveAspectRatio="none"
          style={r.stile}
          focusable="false"
          aria-hidden="true"
        >
          <path className="evd-tratto__corpo" d={r.d} />
          {r.inchiostro !== '' && <path className="evd-tratto__inchiostro" d={r.inchiostro} />}
          {r.striature.map((s, i) => (
            <path key={i} className="evd-tratto__stria" d={s} />
          ))}
        </svg>
      ))}
    </>
  );
}

function scriviVar(el: HTMLElement, nome: string, valore: number): void {
  const s = numero(valore);
  if (el.style.getPropertyValue(nome).trim() !== s) el.style.setProperty(nome, s);
}

function corpoDi(el: Element | undefined | null): number {
  if (el === undefined || el === null) return 0;
  const n = Number.parseFloat(getComputedStyle(el).fontSize);
  return Number.isFinite(n) ? n : 0;
}

/* ====================================================================== */
/* Tratto dell'annuncio                                                    */
/* ====================================================================== */

export interface TrattoProps {
  readonly id: IdAnnuncio;
}

export function Tratto({ id }: TrattoProps) {
  const voce = useVoceAnnuncio(id);
  const segnato = useEvidenzia((s) => s.segnati.includes(id));
  const nodo = useRef<HTMLSpanElement>(null);
  const nodoScarico = useRef<HTMLSpanElement>(null);
  const [corpo, setCorpo] = useState(0);
  const [scaricoVisibile, setScaricoVisibile] = useState(false);
  const seme = useMemo(() => semeDa(id), [id]);

  // corpo della riga d'attacco: letto quando il registro rimisura (mai nel gesto)
  const versione = voce?.versione ?? -1;
  const attacco = voce?.attacco;
  useLayoutEffect(() => {
    const c = corpoDi(attacco);
    setCorpo((prec) => (Math.abs(prec - c) < 0.01 ? prec : c));
  }, [attacco, versione]);

  const righe = voce?.righe;
  const geo = useMemo(() => (righe ? geometria(righe, corpo, seme, false) : []), [righe, corpo, seme]);
  const geoScarico = useMemo(
    () => (righe && scaricoVisibile ? geometria(righe.slice(0, 1), corpo, seme, true) : []),
    [righe, corpo, seme, scaricoVisibile],
  );

  // stato iniziale (tratti ritrovati o da URL: già interi, nessun tratto "entra")
  const segnatoIniziale = useRef(segnato);
  useLayoutEffect(() => {
    const el = nodo.current;
    if (el === null) return;
    scriviVar(el, '--evd-avanzamento', segnatoIniziale.current ? 1 : 0);
    scriviVar(el, '--evd-inizio', 0);
    scriviVar(el, '--evd-ripasso', 0);
  }, []);

  // cambi dello store che il gesto non ha già animato: bottone, scheda, giro, posti
  const segnatoPrec = useRef(segnato);
  useEffect(() => {
    if (segnatoPrec.current === segnato) return;
    segnatoPrec.current = segnato;
    const el = nodo.current;
    if (el === null) return;
    if (segni.consumaAttesa(id, segnato ? 'aggiunta' : 'rimozione')) return;
    delete el.dataset.evdGesto;
    if (segnato) {
      scriviVar(el, '--evd-inizio', 0);
      scriviVar(el, '--evd-ripasso', 0);
      disegnaDaBottone(el, { id });
    } else {
      scolora(el, {
        id,
        onFine: () => {
          scriviVar(el, '--evd-inizio', 0);
          scriviVar(el, '--evd-ripasso', 0);
        },
      });
    }
  }, [segnato, id]);

  // il gesto
  const togliScrittura = useRef<(() => void) | null>(null);
  const smettiDiSeguire = useCallback(() => {
    togliScrittura.current?.();
    togliScrittura.current = null;
  }, []);

  useEffect(() => {
    const suEvento = (e: EventoTratto): void => {
      const el = nodo.current;
      if (el === null) return;
      switch (e.tipo) {
        case 'inizio': {
          if (e.modo === 'scarico') return;
          ferma(el);
          el.dataset.evdGesto = e.modo;
          scriviVar(el, '--evd-ripasso', 0);
          if (e.modo === 'segna') scriviVar(el, '--evd-inizio', segni.inizio(id));
          smettiDiSeguire();
          const segna = e.modo === 'segna';
          togliScrittura.current = ticker.add(() => {
            const t = runtime.tratti.get(id);
            if (segna) {
              if (t !== undefined) scriviVar(el, '--evd-avanzamento', t.avanzamento);
            } else {
              scriviVar(el, '--evd-ripasso', segni.ripasso(id));
            }
            return false;
          }, 'write');
          return;
        }
        case 'completa': {
          smettiDiSeguire();
          delete el.dataset.evdGesto;
          // l'inizio torna alla prima lettera con la transizione CSS (160 ms), mentre la fine corre a fine riga
          scriviVar(el, '--evd-inizio', 0);
          completa(el, e.da, { id, velocita: e.velocita });
          return;
        }
        case 'ritira': {
          smettiDiSeguire();
          ritira(el, e.da, {
            id,
            onFine: () => {
              delete el.dataset.evdGesto;
              scriviVar(el, '--evd-inizio', 0);
            },
          });
          return;
        }
        case 'toglie': {
          smettiDiSeguire();
          scolora(el, {
            id,
            onFine: () => {
              delete el.dataset.evdGesto;
              scriviVar(el, '--evd-ripasso', 0);
              scriviVar(el, '--evd-inizio', 0);
            },
          });
          return;
        }
        case 'ripristina': {
          smettiDiSeguire();
          delete el.dataset.evdGesto;
          // torna pieno con la transizione CSS di --evd-ripasso (200 ms; nessuna con reduced motion)
          scriviVar(el, '--evd-ripasso', 0);
          return;
        }
        case 'scarico': {
          smettiDiSeguire();
          setScaricoVisibile(true);
          return;
        }
        case 'fine': {
          smettiDiSeguire();
          return;
        }
      }
    };
    const stacca = segni.ascolta(id, suEvento);
    return () => {
      stacca();
      smettiDiSeguire();
    };
  }, [id, smettiDiSeguire]);

  // il quinto annuncio: il tratto scarico esce, muore a metà, si ritira
  useEffect(() => {
    if (!scaricoVisibile) return undefined;
    const el = nodoScarico.current;
    if (el === null) {
      setScaricoVisibile(false);
      return undefined;
    }
    let vivo = true;
    const anim = animaScarico(el, {
      seme,
      onFine: () => {
        if (vivo) setScaricoVisibile(false);
      },
    });
    if (anim === null) setScaricoVisibile(false);
    return () => {
      vivo = false;
      anim?.cancel();
    };
  }, [scaricoVisibile, seme]);

  return (
    <span className="evd-tratto" aria-hidden="true">
      <span ref={nodo} className="evd-tratto__segno" data-evdvar="">
        <RigheTratto righe={geo} />
      </span>
      {scaricoVisibile && geoScarico.length > 0 && (
        <span ref={nodoScarico} className="evd-tratto__segno evd-tratto__segno--scarico" data-evdvar="">
          <RigheTratto righe={geoScarico} />
        </span>
      )}
    </span>
  );
}

/* ====================================================================== */
/* Tratto su un testo qualunque                                            */
/* ====================================================================== */

export interface TrattoSuProps {
  /** Id dell'annuncio (stesso seme del foglio) o una chiave fissa ("segna"). */
  readonly id: string;
  readonly children: ReactNode;
  /** 'pieno' (default): già intero. 'dimostrativo': si disegna una volta dopo i font. */
  readonly modo?: 'pieno' | 'dimostrativo';
  readonly className?: string;
}

function righeDaTesto(contenitore: HTMLElement, testo: HTMLElement): readonly RigaTratto[] {
  const base = contenitore.getBoundingClientRect();
  const larghezzaLocale = contenitore.offsetWidth;
  const scala = larghezzaLocale > 0 && base.width > 0 ? base.width / larghezzaLocale : 1;
  const range = document.createRange();
  range.selectNodeContents(testo);
  const rett = Array.from(range.getClientRects()).filter((r) => r.width > 0.5 && r.height > 0.5);
  range.detach();
  const righe: { top: number; bottom: number; left: number; right: number }[] = [];
  for (const r of rett) {
    const stessa = righe.find((g) => Math.abs(g.top - r.top) <= 2);
    if (stessa) {
      stessa.left = Math.min(stessa.left, r.left);
      stessa.right = Math.max(stessa.right, r.right);
      stessa.bottom = Math.max(stessa.bottom, r.bottom);
    } else {
      righe.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
    }
  }
  righe.sort((a, b) => a.top - b.top);
  return righe.slice(0, RIGHE_MAX).map((g) => ({
    x: (g.left - base.left) / scala,
    y: (g.top - base.top) / scala,
    w: (g.right - g.left) / scala,
    h: (g.bottom - g.top) / scala,
  }));
}

function stesseRighe(a: readonly RigaTratto[], b: readonly RigaTratto[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((r, i) => {
    const s = b[i];
    return (
      s !== undefined &&
      Math.abs(r.x - s.x) < 0.5 &&
      Math.abs(r.y - s.y) < 0.5 &&
      Math.abs(r.w - s.w) < 0.5 &&
      Math.abs(r.h - s.h) < 0.5
    );
  });
}

export function TrattoSu({ id, children, modo = 'pieno', className }: TrattoSuProps) {
  const contenitore = useRef<HTMLSpanElement>(null);
  const testo = useRef<HTMLSpanElement>(null);
  const nodo = useRef<HTMLSpanElement>(null);
  const [righe, setRighe] = useState<readonly RigaTratto[]>([]);
  const [corpo, setCorpo] = useState(0);
  const seme = useMemo(() => semeDa(id), [id]);
  const geo = useMemo(() => geometria(righe, corpo, seme, false), [righe, corpo, seme]);

  // misura: al montaggio, ai font pronti, a ogni cambio di dimensione
  useLayoutEffect(() => {
    const c = contenitore.current;
    const t = testo.current;
    if (c === null || t === null) return undefined;
    let vivo = true;
    const misura = (): void => {
      if (!vivo) return;
      const nuove = righeDaTesto(c, t);
      setRighe((prec) => (stesseRighe(prec, nuove) ? prec : nuove));
      const nuovoCorpo = corpoDi(t);
      setCorpo((prec) => (Math.abs(prec - nuovoCorpo) < 0.01 ? prec : nuovoCorpo));
    };
    misura();
    const ro = new ResizeObserver(() => {
      misura();
    });
    ro.observe(c);
    void fontsReady().then(misura, misura);
    const fonti = document.fonts;
    const suFonti = (): void => {
      misura();
    };
    fonti.addEventListener('loadingdone', suFonti);
    return () => {
      vivo = false;
      ro.disconnect();
      fonti.removeEventListener('loadingdone', suFonti);
    };
  }, []);

  // pieno: intero subito; dimostrativo: parte da vuoto
  useLayoutEffect(() => {
    const el = nodo.current;
    if (el === null) return;
    scriviVar(el, '--evd-avanzamento', modo === 'pieno' ? 1 : 0);
    scriviVar(el, '--evd-inizio', 0);
    scriviVar(el, '--evd-ripasso', 0);
  }, [modo]);

  // il dimostrativo: una volta sola, dopo i font (attesa massima TRATTO.attesaFontMax)
  const disegnato = useRef(false);
  const pronto = geo.length > 0;
  useEffect(() => {
    if (modo !== 'dimostrativo' || !pronto || disegnato.current) return undefined;
    const el = nodo.current;
    if (el === null) return undefined;
    disegnato.current = true;
    let anim: Animation | null = null;
    let vivo = true;
    const limite = new Promise<void>((risolvi) => {
      window.setTimeout(risolvi, TRATTO.attesaFontMax);
    });
    void Promise.race([fontsReady(), limite]).then(() => {
      if (vivo) anim = dimostrativo(el);
    });
    return () => {
      vivo = false;
      if (anim !== null) {
        // smontato a metà: resta intero, mai un tratto troncato
        anim.cancel();
        scriviVar(el, '--evd-avanzamento', 1);
      }
    };
  }, [modo, pronto]);

  return (
    <span ref={contenitore} className={className ? `evd-tratto-su ${className}` : 'evd-tratto-su'}>
      <span ref={testo} className="evd-tratto-su__testo">
        {children}
      </span>
      <span className="evd-tratto" aria-hidden="true">
        <span ref={nodo} className="evd-tratto__segno" data-evdvar="">
          <RigheTratto righe={geo} />
        </span>
      </span>
    </span>
  );
}
