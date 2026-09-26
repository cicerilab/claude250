/*
 * NOVANTA · dial/Arco.tsx (vector-artist)
 * --------------------------------------------------------------------------
 * Il goniometro disegnato: faccia gesso con il lato dritto, contorno, diametro,
 * tacche calcolate (non disegnate a mano), numeri ogni 30°. Presentazionale:
 * nessun evento, nessuno stato, sempre aria-hidden. Tre varianti:
 *   - 'quadrante': lo strumento di navigazione. Non rende il braccio (lo rende
 *     Braccio.tsx con <FormaBraccio/>, in un SVG sovrapposto con lo stesso
 *     viewBox). Con `percorsoClipId` rende la clipPath dello strato
 *     "percorso", che useBraccio aggiorna nel ticker.
 *   - 'mini': angolo obiettivo statico (30°, 150°, vista elenco), braccio
 *     compreso; con `confronto` mostra "oggi" (braccio pieno) e "obiettivo"
 *     (braccio tratteggiato) e l'arco che manca tra i due.
 *   - 'indice': la testina di lettura dell'anello della settimana, un piccolo
 *     goniometro capovolto con il braccio a 90° che punta dentro l'anello.
 * Misure e posizione del perno: `impaginaArco()` in geometria.ts.
 * Il CSS (dial/arco.css) lo importa Novanta.tsx nell'ordine del §5 del
 * tech-architect; qui non si importa.
 */

import type { ReactNode } from 'react';
import {
  arcoPath,
  impaginaArco,
  limita,
  n2,
  percorsoPath,
  polare,
  tacche,
  versore,
  type Geometria,
  type ImpaginazioneArco,
  type Tacca,
  type VarianteArco,
} from './geometria';

export interface ArcoProps {
  variante: VarianteArco;
  geo: Geometria;
  /** raggio del disco in unità del viewBox (quadrante: 1 unità = 1 px) */
  raggio: number;
  /** arco graduato visibile (default 0..180) */
  da?: number;
  a?: number;
  /** mini: angolo obiettivo. Quadrante: angolo iniziale dello strato percorso (default 0). */
  valore?: number;
  /** mini doppio del 30°: dove si arriva oggi (es. 70) mentre `valore` è l'obiettivo (es. 90) */
  confronto?: number;
  /** quadrante: id della clipPath dello strato percorso; il suo <path> ha id `${percorsoClipId}-forma` */
  percorsoClipId?: string;
  className?: string;
  /** solo elementi decorativi (l'SVG è aria-hidden): mai controlli focalizzabili */
  children?: ReactNode;
}

type Punto = { x: number; y: number };

const p2 = (p: Punto) => `${n2(p.x)} ${n2(p.y)}`;

/** Un path per tipo di tacca: 6 nodi per due strati invece di 362 linee. */
function pathTacche(lay: ImpaginazioneArco, lista: readonly Tacca[], tipo: Tacca['tipo']): string {
  const { cx, cy, raggio, geo, misure, variante } = lay;
  const esterno = raggio - misure.tacca.rientro;
  let d = '';
  for (const t of lista) {
    // sui mini archi e sull'indice (passo 10) la lunga è ogni 30, le altre medie
    const tipoVero: Tacca['tipo'] = variante === 'quadrante' ? t.tipo : t.numero ? 'lunga' : 'media';
    if (tipoVero !== tipo) continue;
    const l = misure.tacca[tipo];
    if (l <= 0) continue;
    d += `M${p2(polare(cx, cy, esterno, t.g, geo))}L${p2(polare(cx, cy, esterno - l, t.g, geo))}`;
  }
  return d;
}

function StratoTacche({ lay, lista, classe }: { lay: ImpaginazioneArco; lista: readonly Tacca[]; classe: string }) {
  return (
    <>
      {(['corta', 'media', 'lunga'] as const).map((tipo) => {
        const d = pathTacche(lay, lista, tipo);
        return d ? <path key={tipo} className={`${classe} nov-arco__tacca--${tipo}`} d={d} /> : null;
      })}
    </>
  );
}

/** Faccia gesso: mezzo disco più il lato dritto spesso `base` dietro il diametro. */
function pathFaccia(lay: ImpaginazioneArco, chiuso: boolean): string {
  const { cx, cy, raggio, geo, misure } = lay;
  const dentro = versore(90, geo); // verso l'interno del disco: il lato dritto sta dalla parte opposta
  const p0 = polare(cx, cy, raggio, 0, geo);
  const p180 = polare(cx, cy, raggio, 180, geo);
  const b = misure.base;
  const b0 = { x: p0.x - dentro.x * b, y: p0.y - dentro.y * b };
  const b180 = { x: p180.x - dentro.x * b, y: p180.y - dentro.y * b };
  const r = n2(raggio);
  // g crescente: antiorario in 'bordo', orario in 'fondo'
  const sw = geo === 'fondo' ? 1 : 0;
  return `M${p2(b0)} L${p2(p0)} A${r} ${r} 0 0 ${sw} ${p2(p180)} L${p2(b180)}${chiuso ? ' Z' : ''}`;
}

export interface FormaBraccioProps {
  variante: VarianteArco;
  geo: Geometria;
  raggio: number;
  /** angolo statico; il braccio vivo del quadrante resta a 0 e ruota con CSS (rotazioneCss) */
  g?: number;
  /** disegna la finestrella tonda (solo quadrante; default true) */
  lente?: boolean;
  /** tratteggiato, manopola vuota: l'obiettivo del mini arco doppio */
  fantasma?: boolean;
  className?: string;
}

/**
 * Il braccio dello strumento, in coordinate del viewBox di `impaginaArco`:
 * asta a capi tondi, finestrella tonda alla distanza dei numeri della scala
 * (a braccio fermo incornicia il numero stampato), manopola, rivetto del
 * perno con anello gesso. La finestrella è vuota: il numero lo scrive
 * Braccio.tsx in un <text> controruotato.
 */
export function FormaBraccio({ variante, geo, raggio, g = 0, lente = true, fantasma = false, className }: FormaBraccioProps) {
  const lay = impaginaArco(variante, geo, raggio);
  const { cx, cy, misure: m } = lay;
  const punta = polare(cx, cy, raggio + m.sporgenza, g, geo);
  const centroLente = polare(cx, cy, m.distanzaLente, g, geo);
  const classi = ['nov-braccio-forma', fantasma ? 'nov-braccio-forma--fantasma' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <g className={classi}>
      <line
        className="nov-braccio-forma__asta"
        x1={n2(cx)}
        y1={n2(cy)}
        x2={n2(punta.x)}
        y2={n2(punta.y)}
        strokeWidth={n2(fantasma ? Math.max(1, m.spessoreBraccio * 0.3) : m.spessoreBraccio)}
      />
      {lente && !fantasma && m.lente > 0 ? (
        <circle className="nov-braccio-forma__lente" cx={n2(centroLente.x)} cy={n2(centroLente.y)} r={n2(m.lente / 2)} />
      ) : null}
      <circle className="nov-braccio-forma__manopola" cx={n2(punta.x)} cy={n2(punta.y)} r={n2(m.manopola / 2)} />
      {!fantasma ? (
        <circle className="nov-braccio-forma__presa" cx={n2(punta.x)} cy={n2(punta.y)} r={n2(m.manopola * 0.16)} />
      ) : null}
      {!fantasma ? (
        <>
          <circle className="nov-braccio-forma__perno" cx={n2(cx)} cy={n2(cy)} r={n2(m.perno / 2)} />
          <circle
            className="nov-braccio-forma__anello-perno"
            cx={n2(cx)}
            cy={n2(cy)}
            r={n2(m.perno * 0.28)}
            strokeWidth={n2(m.pernoAnello)}
          />
        </>
      ) : null}
    </g>
  );
}

export function Arco({
  variante,
  geo,
  raggio,
  da = 0,
  a = 180,
  valore,
  confronto,
  percorsoClipId,
  className,
  children,
}: ArcoProps) {
  // l'indice è sempre un goniometro 'fondo' capovolto
  const geoVera: Geometria = variante === 'indice' ? 'fondo' : geo;
  const lay = impaginaArco(variante, geoVera, raggio);
  const { cx, cy, misure: m } = lay;
  const g0 = limita(Math.min(da, a));
  const g1 = limita(Math.max(da, a));
  const lista = tacche(g0, g1, m.passo);
  const chiuso = variante !== 'quadrante';

  // strato "percorso": clip dinamica (quadrante) oppure sottoinsieme statico
  const limitePercorso =
    variante === 'indice' ? 180 : confronto !== undefined ? confronto : valore !== undefined ? valore : variante === 'mini' ? 0 : -1;
  const percorsoStatico = percorsoClipId ? lista : lista.filter((t) => t.g <= limitePercorso + 1e-6);
  const rClip = raggio - m.tacca.rientro;

  const numeri =
    variante === 'quadrante' && m.corpoNumeri > 0
      ? lista
          .filter((t) => t.numero)
          .map((t) => {
            const p = polare(cx, cy, m.distanzaLente, t.g, geoVera);
            // 0 e 180 stanno sul diametro: si spostano verso l'interno del disco
            const dentro = versore(90, geoVera);
            const sposta = t.g === 0 || t.g === 180 ? m.corpoNumeri * 0.8 : 0;
            return { g: t.g, x: p.x + dentro.x * sposta, y: p.y + dentro.y * sposta };
          })
      : [];

  const p0 = polare(cx, cy, raggio, 0, geoVera);
  const p180 = polare(cx, cy, raggio, 180, geoVera);

  const contenuto = (
    <>
      <path className="nov-arco__faccia" d={pathFaccia(lay, true)} />
      <path className="nov-arco__diametro" d={`M${p2(p0)}L${p2(p180)}`} />
      <g className="nov-arco__tacche">
        <StratoTacche lay={lay} lista={lista} classe="nov-arco__tacca" />
      </g>
      {percorsoClipId ? (
        <>
          <defs>
            <clipPath id={percorsoClipId}>
              <path id={`${percorsoClipId}-forma`} d={percorsoPath(cx, cy, rClip, valore ?? 0, geoVera)} />
            </clipPath>
          </defs>
          <g className="nov-arco__tacche nov-arco__tacche--percorso" clipPath={`url(#${percorsoClipId})`}>
            <StratoTacche lay={lay} lista={lista} classe="nov-arco__tacca" />
          </g>
        </>
      ) : percorsoStatico.length > 0 ? (
        <g className="nov-arco__tacche nov-arco__tacche--percorso">
          <StratoTacche lay={lay} lista={percorsoStatico} classe="nov-arco__tacca" />
        </g>
      ) : null}
      <path className="nov-arco__bordo" d={pathFaccia(lay, chiuso)} />
      {numeri.length > 0 ? (
        <g className="nov-arco__numeri" fontSize={m.corpoNumeri}>
          {numeri.map((q) => (
            <text key={q.g} className="nov-arco__numero" x={n2(q.x)} y={n2(q.y)} textAnchor="middle" dominantBaseline="central">
              {q.g}
            </text>
          ))}
        </g>
      ) : null}
      {variante === 'mini' && confronto !== undefined && valore !== undefined && valore !== confronto ? (
        <>
          <path
            className="nov-arco__da-fare"
            d={arcoPath(cx, cy, raggio * 1.07, limita(confronto), limita(valore), geoVera)}
            strokeWidth={n2(Math.max(1.5, raggio * 0.035))}
          />
          <FormaBraccio variante="mini" geo={geoVera} raggio={raggio} g={limita(valore)} fantasma />
        </>
      ) : null}
      {variante === 'mini' ? (
        <FormaBraccio variante="mini" geo={geoVera} raggio={raggio} g={limita(confronto ?? valore ?? 0)} />
      ) : null}
      {variante === 'indice' ? <FormaBraccio variante="indice" geo="fondo" raggio={raggio} g={90} /> : null}
      {children}
    </>
  );

  const classi = ['nov-arco', `nov-arco--${variante}`, `nov-arco--${geoVera}`, className ?? ''].filter(Boolean).join(' ');

  return (
    <svg
      className={classi}
      viewBox={lay.viewBox}
      width={lay.larghezza}
      height={lay.altezza}
      aria-hidden="true"
      focusable="false"
    >
      {variante === 'indice' ? <g transform={`matrix(1 0 0 -1 0 ${n2(2 * cy)})`}>{contenuto}</g> : contenuto}
    </svg>
  );
}

export default Arco;
