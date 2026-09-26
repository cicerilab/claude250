// Tratti a pennarello di CONTROPELO (vector-artist). Funzioni pure: nessun accesso al DOM,
// nessun Math.random (stesso input = stesso tratto, anche al prerender).
//
// Sono segni che il barbiere fa sul vetro, non componenti di interfaccia:
// - la sottolineatura turchese del tuo nome dopo "Segna" (CD §7.3, ux L10);
// - il trattino turchese che sta al posto del nome nei posti liberi (CD §7.1), in 3 varianti
//   perché una mano non fa mai due trattini uguali;
// - il tratteggio sulla seconda mezz'ora di "taglio e barba" (CD §7.2);
// - il cerchio a pennarello del fuoco attorno a un posto libero (CD §4.3).
//
// Ogni tratto è generato alla misura vera in px CSS (viewBox = larghezza x altezza), così
// lo spessore resta quello giusto su qualsiasi lunghezza e `pathLength="1"` rende
// l'animazione `stroke-dashoffset` indipendente dalla lunghezza. Il colore è sempre
// currentColor: chi lo usa mette `color: var(--ctp-turchese)` sul contenitore.
// Si usano con <Tratto /> di Icona.tsx.

/** Spessore in px CSS di ogni tipo di tratto (ux §5.6: sottolineatura 3 px; fuoco 2 px). */
export const SPESSORE_TRATTO = {
  sottolineatura: 3,
  trattino: 3,
  cerchio: 2,
} as const

/** stroke-dasharray del tratteggio della seconda mezz'ora, in px CSS. */
export const TRATTEGGIO = '5 7'

/** Distanza minima in px tra il bordo dell'elemento e il cerchio del fuoco (CD §11: 2 px di stacco). */
export const STACCO_CERCHIO = 2

export type VarianteTrattino = 0 | 1 | 2

export interface DatiTratto {
  /** Larghezza e altezza dell'<svg> in px CSS. */
  readonly larghezza: number
  readonly altezza: number
  readonly viewBox: string
  readonly d: string
  readonly spessore: number
  /**
   * Di quanto l'<svg> sborda dal rettangolo dell'elemento, in px, su ogni lato.
   * Solo il cerchio sborda; per gli altri è 0.
   */
  readonly sborda: number
}

const r1 = (n: number): string => {
  const v = Math.round(n * 10) / 10
  return Object.is(v, -0) ? '0' : String(v)
}

/** Pseudo-caso deterministico in [0, 1) da un intero (hash di Wang ridotto). */
function caso(seme: number, canale: number): number {
  let x = (Math.imul(seme | 0, 374761393) + Math.imul(canale | 0, 668265263)) | 0
  x = Math.imul(x ^ (x >>> 13), 1274126177)
  x ^= x >>> 16
  return (x >>> 0) / 4294967296
}

/** Valore in [-1, 1) dal seme. */
const oscilla = (seme: number, canale: number): number => caso(seme, canale) * 2 - 1

const confina = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n))

/**
 * Sottolineatura del nome: un solo colpo di pennarello che parte un po' basso,
 * scende appena a un terzo e risale con un piccolo guizzo finale, come quando si
 * stacca la punta dal vetro. Altezza fissa 14 px; va messa subito sotto il nome.
 * `seme`: per esempio il numero della mezz'ora, così ogni nome ha la sua.
 */
export function sottolineatura(larghezza: number, seme = 0): DatiTratto {
  const w = Math.round(confina(larghezza, 28, 900))
  const h = 14
  const s = SPESSORE_TRATTO.sottolineatura
  const m = s / 2 + 0.5
  const y0 = 7.2 + oscilla(seme, 1) * 0.8
  const fondo = 9.6 + oscilla(seme, 2) * 0.6
  const finale = 6.6 + oscilla(seme, 3) * 0.6
  const guizzo = Math.min(14, w * 0.12)
  const xa = m
  const xb = w - m - guizzo
  const d =
    `M${r1(xa)} ${r1(y0)}` +
    `C${r1(w * 0.3)} ${r1(fondo)} ${r1(w * 0.62)} ${r1(fondo - 0.4)} ${r1(xb)} ${r1(finale)}` +
    `S${r1(w - m - guizzo * 0.25)} ${r1(m + 1.2)} ${r1(w - m)} ${r1(m)}`
  return { larghezza: w, altezza: h, viewBox: `0 0 ${w} ${h}`, d, spessore: s, sborda: 0 }
}

/**
 * Trattino del posto libero. Tre varianti di mano:
 * 0 = dritto che sale appena; 1 = leggermente pancia in giù; 2 = con l'attacco
 * della punta a sinistra (il pennarello che si appoggia).
 * Altezza fissa 12 px; la linea sta a metà, come la linea di base di un nome in Mansalva.
 * Suggerimento d'uso: variante = numero della mezz'ora % 3.
 */
export function trattino(variante: VarianteTrattino = 0, larghezza = 48): DatiTratto {
  const w = Math.round(confina(larghezza, 20, 400))
  const h = 12
  const s = SPESSORE_TRATTO.trattino
  const m = s / 2 + 0.5
  let d: string
  if (variante === 1) {
    d = `M${r1(m)} ${r1(5.2)}Q${r1(w * 0.5)} ${r1(8.4)} ${r1(w - m)} ${r1(5.6)}`
  } else if (variante === 2) {
    const attacco = Math.min(7, w * 0.16)
    d =
      `M${r1(m)} ${r1(m + 0.6)}` +
      `Q${r1(m + attacco * 0.2)} ${r1(6.8)} ${r1(m + attacco)} ${r1(6.6)}` +
      `C${r1(w * 0.42)} ${r1(6.1)} ${r1(w * 0.74)} ${r1(6.6)} ${r1(w - m)} ${r1(6)}`
  } else {
    d = `M${r1(m)} ${r1(7.4)}C${r1(w * 0.35)} ${r1(6.6)} ${r1(w * 0.7)} ${r1(6.1)} ${r1(w - m)} ${r1(4.8)}`
  }
  return { larghezza: w, altezza: h, viewBox: `0 0 ${w} ${h}`, d, spessore: s, sborda: 0 }
}

/**
 * Tratteggio della seconda mezz'ora di "taglio e barba": stessa linea del trattino
 * dritto; chi lo usa aggiunge `stroke-dasharray` = TRATTEGGIO (lo fa <Tratto tratteggiato />).
 */
export function tratteggio(larghezza = 96): DatiTratto {
  return trattino(0, larghezza)
}

/**
 * Cerchio a pennarello del fuoco attorno a un rettangolo di `larghezza` x `altezza`
 * px (per esempio il trattino libero col suo orario, o il bottone del posto libero).
 * È un giro a mano libera, non chiuso: parte in alto a sinistra, fa un giro e un
 * pezzo, e la fine passa un po' fuori dall'inizio. Forma tra ellisse e rettangolo
 * (superellisse di grado 4), così abbraccia righe basse e larghe senza invadere
 * troppo le righe sopra e sotto. Resta sempre almeno STACCO_CERCHIO px fuori dal
 * rettangolo. L'<svg> va posizionato con `left/top = -sborda` dentro un genitore
 * `position: relative` (lo fa <Tratto tipo="cerchio" />).
 */
export function cerchio(larghezza: number, altezza: number, seme = 0): DatiTratto {
  const wr = confina(larghezza, 16, 1200)
  const hr = confina(altezza, 16, 400)
  const s = SPESSORE_TRATTO.cerchio
  const n = 4
  const esp = 2 / n
  // semiassi minimi: il bordo interno del tratto (raggio - s/2) deve stare a
  // STACCO_CERCHIO dal rettangolo anche nel punto più stretto del giro (0,96).
  const base = STACCO_CERCHIO + s / 2 + 1
  let a = wr / 2 + base + 2
  let b = hr / 2 + base
  // l'angolo del rettangolo (+ stacco) deve stare dentro la superellisse ridotta
  const angolo = (sa: number, sb: number): number =>
    Math.pow((wr / 2 + base) / (sa * 0.96), n) + Math.pow((hr / 2 + base) / (sb * 0.96), n)
  let giri = 0
  while (angolo(a, b) > 1 && giri < 60) {
    a *= 1.02
    b *= 1.02
    giri++
  }
  const giro = Math.PI * 2 + 0.55 // un giro e un pezzo
  const inizio = -Math.PI * 0.78 + oscilla(seme, 7) * 0.12
  const passi = 36
  const fase = caso(seme, 8) * Math.PI * 2
  const punti: Array<[number, number]> = []
  for (let i = 0; i <= passi; i++) {
    const t = i / passi
    const th = inizio + giro * t
    // la mano non chiude il cerchio: il raggio cresce di un 5% verso la fine,
    // e ondeggia appena (3 increspature per giro)
    const k = 0.96 + 0.05 * t * t + 0.018 * Math.sin(3 * th + fase)
    const c = Math.cos(th)
    const sn = Math.sin(th)
    const x = Math.sign(c) * Math.pow(Math.abs(c), esp) * a * k
    const y = Math.sign(sn) * Math.pow(Math.abs(sn), esp) * b * k
    punti.push([x, y])
  }
  // la penna che scende sul vetro inclinata: tutto il giro è ruotato di poco
  const rot = (-2.2 + oscilla(seme, 9) * 1.2) * (Math.PI / 180)
  const cr = Math.cos(rot)
  const sr = Math.sin(rot)
  const ruotati = punti.map(([x, y]): [number, number] => [x * cr - y * sr, x * sr + y * cr])
  let mx = 0
  let my = 0
  for (const [x, y] of ruotati) {
    mx = Math.max(mx, Math.abs(x))
    my = Math.max(my, Math.abs(y))
  }
  const margine = s / 2 + 1
  const sbordaX = Math.ceil(mx + margine - wr / 2)
  const sbordaY = Math.ceil(my + margine - hr / 2)
  const sborda = Math.max(sbordaX, sbordaY)
  const W = Math.round(wr + sborda * 2)
  const H = Math.round(hr + sborda * 2)
  const cx = W / 2
  const cy = H / 2
  const p = ruotati.map(([x, y]): [number, number] => [x + cx, y + cy])
  // Catmull-Rom -> cubiche di Bezier
  const first = p[0] as [number, number]
  let d = `M${r1(first[0])} ${r1(first[1])}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = (p[i - 1] ?? p[i]) as [number, number]
    const p1 = p[i] as [number, number]
    const p2 = p[i + 1] as [number, number]
    const p3 = (p[i + 2] ?? p2) as [number, number]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`
  }
  return { larghezza: W, altezza: H, viewBox: `0 0 ${W} ${H}`, d, spessore: s, sborda }
}
