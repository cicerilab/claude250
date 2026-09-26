/**
 * IMPRONTA · sezione 5 · Legatoria, "il filo" (`#legatoria`).
 * Proprietario: section-builder-legatoria (ondata 3, giro 2).
 *
 * Un solo filo d'inchiostro attraversa tutta l'area viva: da 600 px va a
 * serpentina da un lato all'altro della pagina e a ogni fermata passa nei
 * fori veri di una legatura (schemi del vector-artist, grandi, 500-600 px
 * d'altezza a 1440); su 375 corre nel margine esterno, entra nello schema e
 * sottolinea il nome della legatura. Il nome di ogni legatura è appeso al
 * filo: un laccio parte dal primo foro dello schema e arriva al nodo accanto
 * al nome (da 600 px), o il filo stesso passa sotto il nome (375). Il nodo è
 * un radio vero: scegli la legatura toccando il suo nodo.
 *
 * Il filo si cuce con lo scroll (`useFilo` del motion-designer:
 * `--imp-filo-p` con le soste, `--imp-filo-aggancio` e `data-imp-agganciato`
 * su ogni fermata). Il testo è già lì, fermo, in inchiostro.
 *
 * In fondo il filo scende e sottolinea "Prova la tua" (un solo richiamo,
 * testuale: la lamina resta della testata) e si chiude in un nodo. Il link
 * imposta libro + la legatura scelta sul nodo, oppure, se non l'hai scelta,
 * quella che hai letto più a lungo (brossura se nessuna). I radio non si
 * spuntano mai da soli (B6 dell'accessibility-auditor): la preselezione vale
 * solo per il link ed è scritta accanto.
 *
 * Misure: al montaggio, su ResizeObserver del corpo e a font pronti. Si
 * misura la lunghezza vera di ogni pezzo in px e si scrive su ciascuno il
 * suo intervallo (`--filo-da`, `--filo-a`); le soste passate a `useFilo`
 * sono le frazioni in cui il filo finisce di cucire ogni legatura. Nessuna
 * lettura di layout durante lo scroll. Reduced motion: filo già cucito.
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './legatoria.css';

import { FILI, type Legatura as LegaturaSvg } from '../../assets/svg';
import { BANCO, BOTTEGA, COMUNI, LEGATORIA, LEGATURE_NOMI, PRODOTTI, euro } from '../../content/testi';
import { LEGATORIA_A_COPIA, LEGATURA_DEFAULT, type Legatura } from '../../content/prezzi';
import { LEGATORIA as MOTION_LEGATORIA } from '../../motion/choreography';
import { useFilo } from '../../motion/useScrollProgress';
import { aggiornaProva } from '../../state/store';
import { NODO_R, NodoFilo, SCHEMA_W, SchemaFilo, TrattoFilo, type RuoloTratto } from './Filo';

/** Legatura dei testi e dei prezzi → nome dello schema SVG. */
const SVG_DI: Record<Legatura, LegaturaSvg> = {
  brossura: 'brossura',
  cartonato: 'cartonato',
  giapponese: 'giapponese',
  punto: 'punto-metallico',
};

/**
 * Punto dello schema (frazione del suo path) in cui la legatura è "fatta":
 * fine della cucitura per le tre cucite; per il punto metallico il filo
 * della sezione passa accanto alle graffe a metà schema (le graffe battono
 * insieme, come le teste della cucitrice).
 */
function fineCucitura(chiave: LegaturaSvg): number {
  if (chiave === 'punto-metallico') return 0.5;
  return FILI[chiave].cucitura[1];
}

const N = LEGATORIA.voci.length;
/** Tempo minimo di lettura (ms) perché una legatura conti come "vista". */
const SOGLIA_VISTA = 700;

/** Pezzi del filo di ogni fermata, nell'ordine in cui il filo li percorre. */
const PEZZI_FERMATA = ['entra', 'scende', 'schema', 'esce', 'traversa', 'coda'] as const;
type PezzoFermata = (typeof PEZZI_FERMATA)[number];

/** Il simbolo dell'euro non va mai a capo da solo ("90 €"). */
function unito(testo: string): string {
  return testo.replace(/ €/g, ' €');
}

function stessiNumeri(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (Math.abs((a[i] ?? 0) - (b[i] ?? 0)) > 1e-4) return false;
  }
  return true;
}

function scriviIntervallo(el: Element | null, da: number, a: number): void {
  if (!(el instanceof HTMLElement) && !(el instanceof SVGElement)) return;
  el.style.setProperty('--filo-da', da.toFixed(5));
  el.style.setProperty('--filo-a', Math.max(a, da + 1e-5).toFixed(5));
}

/** Lunghezza in px di un tratto dritto: larghezza se orizzontale, altezza se verticale. */
function lunghezzaTratto(el: HTMLElement | null): number {
  if (el === null) return 0;
  return el.dataset.versoTratto === 'orizzontale' ? el.offsetWidth : el.offsetHeight;
}

function mappaVuota(): Record<PezzoFermata, HTMLElement | null> {
  return { entra: null, scende: null, schema: null, esce: null, traversa: null, coda: null };
}

export default function Legatoria() {
  const corpoRef = useRef<HTMLDivElement>(null);
  const ingressoRef = useRef<HTMLSpanElement>(null);
  const fineRef = useRef<HTMLDivElement>(null);
  const fineScendeRef = useRef<HTMLSpanElement>(null);
  const nodoRef = useRef<SVGSVGElement>(null);
  const fermateRef = useRef<Array<HTMLLIElement | null>>(Array.from({ length: N }, () => null));
  const pezziRef = useRef<Array<Record<PezzoFermata, HTMLElement | null>>>(Array.from({ length: N }, mappaVuota));
  const testiRef = useRef<Array<HTMLDivElement | null>>(Array.from({ length: N }, () => null));

  const [soste, setSoste] = useState<readonly number[]>(MOTION_LEGATORIA.soste);
  /** Scelta fatta dal lettore sul nodo (null finché non tocca nulla). */
  const [scelta, setScelta] = useState<Legatura | null>(null);
  /** Legatura letta più a lungo: vale solo come default del link. */
  const [vista, setVista] = useState<Legatura>(LEGATURA_DEFAULT);
  const permanenzaRef = useRef<number[]>(Array.from({ length: N }, () => 0));

  /* ---------------------------------------------------------------- misura del filo */

  const misura = useCallback(() => {
    const pezzi: Array<{ el: Element | null; lunghezza: number }> = [];
    let scala = 1;

    /*
     * Da 600 px l'ultimo schema non occupa spazio sotto il suo testo: le
     * righe finali salgono accanto a lui e il filo riparte dal suo piede,
     * che può stare più in basso dell'inizio del blocco finale. Lo scarto va
     * al CSS come --fine-inizio (letto solo da 600 px).
     */
    const fine = fineRef.current;
    const ultimoSchema = pezziRef.current[N - 1]?.schema ?? null;
    if (fine !== null && ultimoSchema !== null) {
      const scarto = ultimoSchema.getBoundingClientRect().bottom - fine.getBoundingClientRect().top;
      fine.style.setProperty('--fine-inizio', `${Math.round(scarto * 10) / 10}px`);
    }

    pezzi.push({ el: ingressoRef.current, lunghezza: lunghezzaTratto(ingressoRef.current) });

    const indiciSchema: number[] = [];
    LEGATORIA.voci.forEach((voce, i) => {
      const mappa = pezziRef.current[i] ?? mappaVuota();
      for (const nome of PEZZI_FERMATA) {
        const el = mappa[nome];
        if (nome === 'schema') {
          const larghezza = el?.getBoundingClientRect().width ?? 0;
          if (larghezza > 0) scala = larghezza / SCHEMA_W;
          indiciSchema.push(pezzi.length);
          pezzi.push({ el, lunghezza: FILI[SVG_DI[voce.id]].lunghezza * (larghezza / SCHEMA_W) });
        } else {
          pezzi.push({ el, lunghezza: lunghezzaTratto(el) });
        }
      }
    });

    pezzi.push({ el: fineScendeRef.current, lunghezza: lunghezzaTratto(fineScendeRef.current) });
    pezzi.push({ el: nodoRef.current, lunghezza: 2 * Math.PI * NODO_R * scala });

    const totale = pezzi.reduce((s, p) => s + p.lunghezza, 0);
    if (totale <= 0) return;

    const inizi: number[] = [];
    let corrente = 0;
    for (const pezzo of pezzi) {
      inizi.push(corrente);
      scriviIntervallo(pezzo.el, corrente / totale, (corrente + pezzo.lunghezza) / totale);
      corrente += pezzo.lunghezza;
    }

    const nuove = LEGATORIA.voci.map((voce, i) => {
      const indice = indiciSchema[i] ?? 0;
      const pezzo = pezzi[indice];
      const inizio = inizi[indice] ?? 0;
      return (inizio + fineCucitura(SVG_DI[voce.id]) * (pezzo?.lunghezza ?? 0)) / totale;
    });
    setSoste((prima) => (stessiNumeri(prima, nuove) ? prima : nuove));
  }, []);

  useLayoutEffect(() => {
    misura();
    const corpo = corpoRef.current;
    if (corpo === null) return undefined;
    const ro = new ResizeObserver(() => {
      misura();
    });
    ro.observe(corpo);
    let vivo = true;
    void document.fonts.ready.then(() => {
      if (vivo) misura();
    });
    return () => {
      vivo = false;
      ro.disconnect();
    };
  }, [misura]);

  /* ---------------------------------------------------------------- il filo con lo scroll */

  useFilo(corpoRef, { fermate: fermateRef, soste });

  /* ---------------------------------------------------------------- quale legatura hai letto */

  /*
   * "La legatura dell'ultima fermata vista" (ux-architect 5.5): arrivati in
   * fondo il filo le ha passate tutte, quindi conta il tempo. Una fascia al
   * centro dello schermo misura quanto resta sotto gli occhi il testo di
   * ciascuna; vince la più letta (a parità, la più recente). Non tocca i
   * radio: serve solo al link in fondo, che lo dice accanto.
   */
  useEffect(() => {
    const entrate: Array<number | null> = Array.from({ length: N }, () => null);
    const permanenza = permanenzaRef.current;

    const aggiornaVista = (): void => {
      let migliore = -1;
      let massimo = SOGLIA_VISTA;
      permanenza.forEach((ms, i) => {
        if (ms >= massimo) {
          massimo = ms;
          migliore = i;
        }
      });
      const voce = migliore >= 0 ? LEGATORIA.voci[migliore] : undefined;
      setVista(voce !== undefined ? voce.id : LEGATURA_DEFAULT);
    };

    const io = new IntersectionObserver(
      (voci) => {
        const ora = performance.now();
        for (const v of voci) {
          const i = testiRef.current.indexOf(v.target as HTMLDivElement);
          if (i < 0) continue;
          if (v.isIntersecting) {
            entrate[i] = ora;
          } else {
            const da = entrate[i];
            if (da !== null && da !== undefined) {
              permanenza[i] = (permanenza[i] ?? 0) + (ora - da);
              entrate[i] = null;
            }
          }
        }
        aggiornaVista();
      },
      { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
    );
    for (const el of testiRef.current) {
      if (el !== null) io.observe(el);
    }
    return () => {
      io.disconnect();
    };
  }, []);

  const perIlBanco: Legatura = scelta ?? vista;

  const provaLaTua = (): void => {
    // Il viaggio verso #banco lo fa il listener delegato di Impronta.tsx.
    aggiornaProva({ prodotto: 'libro', legatura: perIlBanco });
  };

  const registraPezzo = (i: number, nome: PezzoFermata) => (el: HTMLElement | null) => {
    const mappa = pezziRef.current[i];
    if (mappa !== undefined) mappa[nome] = el;
  };

  return (
    <section id="legatoria" className="imp-legatoria imp-block" aria-labelledby="legatoria-titolo">
      <div className="imp-page">
        <header className="imp-legatoria__testa">
          <h2 id="legatoria-titolo" className="imp-legatoria__titolo">
            {LEGATORIA.titolo}
          </h2>
          <p className="imp-legatoria__intro">{LEGATORIA.intro}</p>
          <p className="imp-legatoria__segnatura">{LEGATORIA.segnatura}</p>
        </header>

        <div ref={corpoRef} className="imp-legatoria__corpo">
          <TrattoFilo ref={ingressoRef} ruolo="ingresso" />

          <fieldset className="imp-legatoria__gruppo">
            <legend className="imp-sr">{BANCO.legatura.legenda}</legend>
            <ol className="imp-legatoria__fermate imp-lista">
              {LEGATORIA.voci.map((voce, i) => {
                const chiave = SVG_DI[voce.id];
                const idNome = `legatoria-${voce.id}`;
                const scelto = scelta === voce.id;
                const tratto = (ruolo: Exclude<PezzoFermata, 'schema'> & RuoloTratto) => (
                  <TrattoFilo ref={registraPezzo(i, ruolo)} ruolo={ruolo} />
                );
                return (
                  <li
                    key={voce.id}
                    ref={(el) => {
                      fermateRef.current[i] = el;
                    }}
                    className="imp-legatoria__fermata"
                    data-legatura={chiave}
                    data-verso={i % 2 === 0 ? 'dritto' : 'rovescio'}
                    data-scelto={scelto ? '' : undefined}
                  >
                    {tratto('entra')}
                    {tratto('scende')}
                    <SchemaFilo ref={registraPezzo(i, 'schema')} legatura={chiave} />
                    {tratto('esce')}
                    {tratto('traversa')}
                    {tratto('coda')}

                    <div
                      ref={(el) => {
                        testiRef.current[i] = el;
                      }}
                      className="imp-legatoria__testo"
                    >
                      <div className="imp-legatoria__nome-riga">
                        <span className="imp-legatoria__laccio" aria-hidden="true" />
                        <label className="imp-legatoria__nodo-scelta">
                          <input
                            className="imp-legatoria__radio"
                            type="radio"
                            name="legatoria-legatura"
                            value={voce.id}
                            checked={scelto}
                            aria-labelledby={idNome}
                            onChange={() => {
                              setScelta(voce.id);
                            }}
                          />
                          <span className="imp-legatoria__nodo-segno" aria-hidden="true" />
                        </label>
                        <h3 id={idNome} className="imp-legatoria__nome">
                          {voce.titolo}
                        </h3>
                        {scelto ? <span className="imp-legatoria__scelto">{BANCO.carta.scelta}</span> : null}
                      </div>
                      <p className="imp-legatoria__cosa">{voce.testo}</p>
                      <p className="imp-legatoria__quando">{voce.perCosa}</p>
                      <p className="imp-legatoria__prezzo">
                        <span className="imp-legatoria__cifra">{euro(LEGATORIA_A_COPIA[voce.id])}</span>{' '}
                        <span className="imp-legatoria__prezzo-testo">{voce.prezzoDopoCifra}</span>
                      </p>
                      {voce.id === 'punto' ? <p className="imp-legatoria__nota">{BANCO.legatura.notaPunto}</p> : null}
                      <p className="imp-sr">{voce.filoAlt}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </fieldset>

          <div ref={fineRef} className="imp-legatoria__fine">
            <TrattoFilo ref={fineScendeRef} ruolo="fine-scende" />

            <ul className="imp-legatoria__note imp-lista">
              <li className="imp-legatoria__riferimento">{LEGATORIA.riferimento}</li>
              <li>{BOTTEGA.tempi}</li>
              <li>{unito(LEGATORIA.tesi)}</li>
              <li>{unito(LEGATORIA.restauro)}</li>
            </ul>

            <p id="legatoria-per-il-banco" className="imp-legatoria__per-il-banco">
              {`${PRODOTTI.libro.nome}, ${LEGATURE_NOMI[perIlBanco].nome.toLowerCase()}`}
            </p>

            <div className="imp-legatoria__azione">
              <NodoFilo ref={nodoRef} />
              <a
                href="#banco"
                className="imp-legatoria__prova"
                aria-describedby="legatoria-prova-aria legatoria-per-il-banco"
                onClick={provaLaTua}
              >
                {COMUNI.provaLaTua}
              </a>
              <span id="legatoria-prova-aria" className="imp-sr">
                {LEGATORIA.provaAria}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
