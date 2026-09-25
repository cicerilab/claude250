/**
 * IMPRONTA · sezione 5 · Legatoria, "il filo" (`#legatoria`).
 * Proprietario: section-builder-legatoria (ondata 3).
 *
 * Un solo filo d'inchiostro scende lungo il margine interno e, a ogni
 * legatura, passa nei fori veri di quella legatura (schemi del
 * vector-artist). Si cuce con lo scroll (`useFilo` del motion-designer:
 * `--imp-filo-p` con le soste, `--imp-filo-aggancio` e
 * `data-imp-agganciato` su ogni fermata). Accanto a ogni schema il testo è
 * già lì, fermo, in inchiostro: cos'è, per cosa sceglierla, prezzo.
 * In fondo "Prova la tua" porta al banco con libro e la legatura su cui il
 * lettore si è fermato di più (brossura se nessuna).
 *
 * Misure: una volta al montaggio, su ResizeObserver del corpo e a font
 * pronti. Si misura la lunghezza vera di ogni pezzo in px (tratti dritti,
 * schemi in scala, nodo) e si scrive su ciascuno il suo intervallo
 * (`--filo-da`, `--filo-a`); le soste passate a `useFilo` sono le frazioni
 * in cui il filo finisce di cucire ogni legatura. Nessuna lettura di layout
 * durante lo scroll.
 *
 * Reduced motion: `useFilo` scrive 1 e aggancia tutto: filo già cucito.
 * Nessun accesso a window/document a livello di modulo.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import './legatoria.css';

import { FILI, type Legatura as LegaturaSvg } from '../../assets/svg';
import { BANCO, BOTTEGA, COMUNI, LEGATORIA, LEGATURE_NOMI, euro } from '../../content/testi';
import { LEGATORIA_A_COPIA, LEGATURA_DEFAULT, type Legatura } from '../../content/prezzi';
import { LEGATORIA as MOTION_LEGATORIA } from '../../motion/choreography';
import { useFilo } from '../../motion/useScrollProgress';
import { LEGATURE_VALIDE, aggiornaProva } from '../../state/store';
import { NODO_R, NodoFilo, SCHEMA_W, SchemaFilo, TrattoFilo } from './Filo';

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
 * della sezione passa accanto alle graffe a metà schema (le graffe
 * battono insieme, come le teste della cucitrice).
 */
function fineCucitura(chiave: LegaturaSvg): number {
  if (chiave === 'punto-metallico') return 0.5;
  return FILI[chiave].cucitura[1];
}

const N = LEGATORIA.voci.length;
/** Tempo minimo di lettura (ms) perché una legatura conti come "vista". */
const SOGLIA_VISTA = 700;

/** Il simbolo dell'euro non va mai a capo da solo ("90 €"). */
function unito(testo: string): string {
  return testo.replace(/ €/g, '\u00a0€');
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

export default function Legatoria() {
  const corpoRef = useRef<HTMLDivElement>(null);
  const ingressoRef = useRef<HTMLSpanElement>(null);
  const uscitaRef = useRef<HTMLSpanElement>(null);
  const nodoRef = useRef<SVGSVGElement>(null);
  const fermateRef = useRef<Array<HTMLLIElement | null>>(Array.from({ length: N }, () => null));
  const schemiRef = useRef<Array<HTMLSpanElement | null>>(Array.from({ length: N }, () => null));
  const codeRef = useRef<Array<HTMLSpanElement | null>>(Array.from({ length: N }, () => null));
  const testiRef = useRef<Array<HTMLDivElement | null>>(Array.from({ length: N }, () => null));

  const [soste, setSoste] = useState<readonly number[]>(MOTION_LEGATORIA.soste);
  const [scelta, setScelta] = useState<Legatura>(LEGATURA_DEFAULT);
  const permanenzaRef = useRef<number[]>(Array.from({ length: N }, () => 0));
  /** Il lettore ha scelto a mano la legatura: il tempo di lettura non la cambia più. */
  const sceltaManualeRef = useRef(false);

  /* ---------------------------------------------------------------- misura del filo */

  const misura = useCallback(() => {
    const pezzi: Array<{ el: Element | null; lunghezza: number }> = [];
    let scala = 1;

    const ingresso = ingressoRef.current;
    pezzi.push({ el: ingresso, lunghezza: ingresso?.offsetHeight ?? 0 });

    const finiSchema: number[] = [];
    LEGATORIA.voci.forEach((voce, i) => {
      const chiave = SVG_DI[voce.id];
      const schema = schemiRef.current[i] ?? null;
      const larghezza = schema?.getBoundingClientRect().width ?? 0;
      if (larghezza > 0) scala = larghezza / SCHEMA_W;
      const lunghezza = FILI[chiave].lunghezza * (larghezza / SCHEMA_W);
      finiSchema.push(pezzi.length);
      pezzi.push({ el: schema, lunghezza });
      const coda = codeRef.current[i] ?? null;
      pezzi.push({ el: coda, lunghezza: coda?.offsetHeight ?? 0 });
    });

    const uscita = uscitaRef.current;
    pezzi.push({ el: uscita, lunghezza: uscita?.offsetHeight ?? 0 });
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
      const indice = finiSchema[i] ?? 0;
      const pezzo = pezzi[indice];
      const inizio = inizi[indice] ?? 0;
      const frazione = fineCucitura(SVG_DI[voce.id]);
      return (inizio + frazione * (pezzo?.lunghezza ?? 0)) / totale;
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

  useFilo(corpoRef, {
    fermate: fermateRef,
    soste,
  });

  /* ---------------------------------------------------------------- quale legatura hai guardato */

  /*
   * "La legatura dell'ultima fermata vista" (ux-architect 5.5): arrivati in
   * fondo il filo le ha passate tutte, quindi conta il tempo. Una fascia al
   * centro dello schermo misura quanto resta sotto gli occhi il testo di
   * ciascuna; vince la più letta (a parità, la più recente). Sotto la soglia
   * resta la brossura cucita.
   */
  useEffect(() => {
    const entrate: Array<number | null> = Array.from({ length: N }, () => null);
    const permanenza = permanenzaRef.current;

    const aggiornaScelta = (): void => {
      let migliore = -1;
      let massimo = SOGLIA_VISTA;
      permanenza.forEach((ms, i) => {
        if (ms >= massimo) {
          massimo = ms;
          migliore = i;
        }
      });
      if (sceltaManualeRef.current) return;
      const voce = migliore >= 0 ? LEGATORIA.voci[migliore] : undefined;
      setScelta(voce !== undefined ? voce.id : LEGATURA_DEFAULT);
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
        aggiornaScelta();
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

  const provaLaTua = (_evento: ReactMouseEvent<HTMLAnchorElement>): void => {
    // Il viaggio verso #banco lo fa il listener delegato di Impronta.tsx.
    aggiornaProva({ prodotto: 'libro', legatura: scelta });
  };

  const scegli = (legatura: Legatura): void => {
    sceltaManualeRef.current = true;
    setScelta(legatura);
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

          <ol className="imp-legatoria__fermate imp-lista">
            {LEGATORIA.voci.map((voce, i) => {
              const chiave = SVG_DI[voce.id];
              return (
                <li
                  key={voce.id}
                  ref={(el) => {
                    fermateRef.current[i] = el;
                  }}
                  className="imp-legatoria__fermata"
                  data-legatura={chiave}
                  data-verso={i % 2 === 0 ? 'dritto' : 'rovescio'}
                  aria-labelledby={`legatoria-${voce.id}`}
                >
                  <SchemaFilo
                    ref={(el: HTMLSpanElement | null) => {
                      schemiRef.current[i] = el;
                    }}
                    legatura={chiave}
                  />
                  <TrattoFilo
                    ref={(el) => {
                      codeRef.current[i] = el;
                    }}
                    ruolo="coda"
                  />

                  <div
                    ref={(el) => {
                      testiRef.current[i] = el;
                    }}
                    className="imp-legatoria__testo"
                  >
                    <h3 id={`legatoria-${voce.id}`} className="imp-legatoria__nome">
                      {voce.titolo}
                    </h3>
                    <p className="imp-legatoria__cosa">{unito(voce.testo)}</p>
                    <p className="imp-legatoria__quando">{voce.perCosa}</p>
                    <p className="imp-legatoria__prezzo">
                      <span className="imp-legatoria__cifra" aria-hidden="true">
                        {euro(LEGATORIA_A_COPIA[voce.id])}
                      </span>
                      <span className="imp-legatoria__prezzo-testo">{unito(voce.prezzo)}</span>
                    </p>
                    <p className="imp-sr">{voce.filoAlt}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="imp-legatoria__fine">
            <div className="imp-legatoria__fine-filo" aria-hidden="true">
              <TrattoFilo ref={uscitaRef} ruolo="uscita" />
              <NodoFilo ref={nodoRef} />
            </div>

            <div className="imp-legatoria__fine-testo">
              <ul className="imp-legatoria__note imp-lista">
                <li>{LEGATORIA.tiraturaMinima}</li>
                <li>{BOTTEGA.tempi}</li>
                <li>{unito(LEGATORIA.tesi)}</li>
                <li>{unito(LEGATORIA.restauro)}</li>
              </ul>

              <fieldset className="imp-legatoria__legature">
                <legend className="imp-legatoria__legenda">{BANCO.legatura.legenda}</legend>
                <div className="imp-legatoria__opzioni">
                  {LEGATURE_VALIDE.map((legatura) => {
                    const attiva = legatura === scelta;
                    return (
                      <label key={legatura} className="imp-legatoria__opzione imp-ix-scelta imp-ix-premibile">
                        <input
                          className="imp-ix-scelta__input"
                          type="radio"
                          name="legatoria-legatura"
                          value={legatura}
                          checked={attiva}
                          onChange={() => {
                            scegli(legatura);
                          }}
                        />
                        <span className="imp-legatoria__opzione-nome">{LEGATURE_NOMI[legatura].breve}</span>
                        {attiva ? <span className="imp-legatoria__opzione-segno">{BANCO.carta.scelta}</span> : null}
                      </label>
                    );
                  })}
                </div>
                {scelta === 'punto' ? <p className="imp-legatoria__nota-punto">{BANCO.legatura.notaPunto}</p> : null}
              </fieldset>

              <div className="imp-legatoria__azione">
                <a
                  href="#banco"
                  className="imp-legatoria__prova imp-lamina imp-ix-premibile"
                  aria-describedby="legatoria-prova-aria"
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
      </div>
    </section>
  );
}
