// Geometria del tratto dell'evidenziatore (vector-artist).
// Funzioni pure: nessun accesso al DOM, nessun Math.random. Dato lo stesso seme
// e le stesse misure il tratto è identico al millimetro (CD 4.4).
// Uso, resa consigliata e misure in docs/vector-artist.md.

/** Opzioni del tratto: misure in px CSS non scalati, seme da core/semi.ts. */
export interface OpzioniForma {
  larghezza: number
  altezza: number
  seme: number
  /** evidenziatore "scarico" (quinto annuncio): pallido, a strisce, senza pozze */
  scarico?: boolean
}

/** Le quattro forme base dell'estremità a scalpello. */
export type Punta = 'netta' | 'consumata' | 'sfrangiata' | 'pressata'

export interface FormaTratto {
  /** corpo del tratto, un solo sottotracciato chiuso (nello scarico: una striscia per sottotracciato) */
  d: string
  /** striature più chiare, interamente dentro il corpo: si dipingono in colore carta sopra il corpo */
  striature: readonly string[]
  /** "più inchiostro" all'inizio e alla fine: due pozze dentro il corpo; stringa vuota nello scarico */
  inchiostro: string
  /** sempre "0 0 larghezza altezza": unità = px CSS, nessuna deformazione */
  viewBox: string
  /** estremità scelte dal seme (utile per QA e per il doc) */
  punte: { readonly inizio: Punta; readonly fine: Punta }
  /** sbieco orizzontale della punta a scalpello, in px */
  sbieco: number
}

export const PUNTE: readonly Punta[] = ['netta', 'consumata', 'sfrangiata', 'pressata']

/** Altezza del tratto rispetto al corpo del testo (CD 4.4). */
export const RAPPORTO_ALTEZZA = 1.15

/** Oscillazione verticale massima (px) e rotazione massima (gradi) del tratto intero. */
export const DY_MAX = 2
export const ROTAZIONE_MAX = 0.6

type Punto = readonly [number, number]
type Casuale = () => number

// PRNG mulberry32 locale (la stessa famiglia di core/semi.ts): forma.ts resta senza dipendenze.
function generatore(seme: number): Casuale {
  let a = seme >>> 0
  if (a === 0) a = 0x9e3779b9
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function tra(r: Casuale, min: number, max: number): number {
  return min + (max - min) * r()
}

function limita(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

function misura(v: number, ripiego: number): number {
  return Number.isFinite(v) && v > 0 ? v : ripiego
}

function num(v: number): string {
  const x = Math.round(v * 10) / 10
  return Object.is(x, -0) ? '0' : String(x)
}

/** Sottotracciato chiuso; `dx` sposta i punti dalle coordinate del corpo a quelle del viewBox. */
function percorso(punti: readonly Punto[], dx = 0): string {
  if (punti.length === 0) return ''
  const [primo, ...resto] = punti
  if (!primo) return ''
  let s = `M${num(primo[0] + dx)} ${num(primo[1])}`
  if (resto.length > 0) s += 'L' + resto.map(([x, y]) => `${num(x + dx)} ${num(y)}`).join(' ')
  return s + 'Z'
}

/** Campioni da a a b (compresi) con passo circa `passo`. */
function campioni(a: number, b: number, passo: number): number[] {
  const n = Math.max(1, Math.ceil(Math.abs(b - a) / passo))
  const out: number[] = []
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n)
  return out
}

/** Onda lenta a due armoniche, fasi e lunghezze dal seme. */
function onda(r: Casuale, ampiezza: number): (x: number) => number {
  const l1 = tra(r, 90, 170)
  const l2 = tra(r, 28, 55)
  const f1 = tra(r, 0, Math.PI * 2)
  const f2 = tra(r, 0, Math.PI * 2)
  return (x) =>
    ampiezza * (0.62 * Math.sin((Math.PI * 2 * x) / l1 + f1) + 0.38 * Math.sin((Math.PI * 2 * x) / l2 + f2))
}

function campana(t: number, centro: number, ampiezza: number): number {
  const z = (t - centro) / ampiezza
  return Math.exp(-z * z)
}

/**
 * Profilo dell'estremità: scostamento lungo la normale esterna (in frazioni di
 * altezza) per t da 0 (spigolo più esterno della punta) a 1.
 */
function profilo(tipo: Punta, r: Casuale): { passi: number; f: (t: number) => number } {
  switch (tipo) {
    case 'netta': {
      const k = tra(r, -0.015, 0.015)
      return { passi: 6, f: (t) => k * Math.sin(Math.PI * t) }
    }
    case 'consumata': {
      const k = tra(r, 0.16, 0.24)
      const w = tra(r, 0.34, 0.46)
      return { passi: 10, f: (t) => -k * Math.max(0, 1 - t / w) ** 2 }
    }
    case 'sfrangiata': {
      const c1 = tra(r, 0.2, 0.32)
      const c2 = tra(r, 0.56, 0.72)
      const k1 = tra(r, 0.09, 0.13)
      const k2 = tra(r, 0.05, 0.08)
      return { passi: 16, f: (t) => k1 * campana(t, c1, 0.06) - k2 * campana(t, c2, 0.07) }
    }
    case 'pressata': {
      const k = tra(r, 0.1, 0.15)
      const c = tra(r, 0.42, 0.58)
      return { passi: 10, f: (t) => k * Math.max(0, Math.sin(Math.PI * t)) ** 1.3 * (1 + 0.3 * (c - 0.5)) }
    }
  }
}

/**
 * Punti dell'estremità da P (spigolo esterno, t=0) a Q (t=1), P e Q esclusi,
 * spostati lungo la normale esterna `n` di profilo(t) * altezza.
 */
function estremita(
  P: Punto,
  Q: Punto,
  n: Punto,
  tipo: Punta,
  r: Casuale,
  H: number,
  xMin: number,
  xMax: number,
): Punto[] {
  const { passi, f } = profilo(tipo, r)
  const out: Punto[] = []
  for (let i = 1; i < passi; i++) {
    const t = i / passi
    const o = f(t) * H
    const x = P[0] + (Q[0] - P[0]) * t + n[0] * o
    const y = P[1] + (Q[1] - P[1]) * t + n[1] * o
    out.push([limita(x, xMin, xMax), limita(y, 0, H)])
  }
  return out
}

/** Oscillazione e rotazione del tratto intero, dal seme dell'annuncio. */
export function variazione(seme: number): { dy: number; rotazione: number } {
  const r = generatore((seme ^ 0x5bd1e995) >>> 0)
  const dy = Math.round(tra(r, -DY_MAX, DY_MAX) * 10) / 10
  const rotazione = Math.round(tra(r, -ROTAZIONE_MAX, ROTAZIONE_MAX) * 100) / 100
  return { dy: Object.is(dy, -0) ? 0 : dy, rotazione: Object.is(rotazione, -0) ? 0 : rotazione }
}

/** Seme della seconda riga dello stesso annuncio (CD 4.4: massimo due righe). */
export function semePerRiga(seme: number, riga: number): number {
  return riga === 0 ? seme >>> 0 : (Math.imul(seme >>> 0, 2654435761) + riga * 7919) >>> 0
}

/**
 * Ingombro consigliato del tratto su una riga di testo: altezza = 1,15 × corpo,
 * e uno sbordo a sinistra e a destra perché lo sbieco della punta non lasci
 * scoperte la prima e l'ultima lettera.
 */
export function ingombroTratto(
  larghezzaRiga: number,
  corpo: number,
): { larghezza: number; altezza: number; sbordo: number } {
  const altezza = Math.round(misura(corpo, 16) * RAPPORTO_ALTEZZA * 10) / 10
  const sbordo = Math.round(altezza * 0.32 * 10) / 10
  return { larghezza: Math.round((misura(larghezzaRiga, 1) + sbordo * 2) * 10) / 10, altezza, sbordo }
}

/** Il tratto: corpo a scalpello, striature, pozze d'inchiostro. */
export function formaTratto(o: OpzioniForma): FormaTratto {
  const larghezza = misura(o.larghezza, 1)
  const H = misura(o.altezza, 1)
  const r = generatore(o.seme)
  // il corpo sta dentro un margine orizzontale: le punte "pressata" e "sfrangiata"
  // sporgono in fuori senza essere tagliate dal bordo del viewBox
  const mh = Math.min(H * 0.14, larghezza * 0.08)
  const L = larghezza - mh * 2

  // punta a scalpello: sbieco da un angolo di 14-24 gradi, mai oltre un quinto del tratto
  const angolo = (tra(r, 14, 24) * Math.PI) / 180
  const s = Math.min(H * Math.tan(angolo), L * 0.2)

  const margine = H * 0.075
  const ampiezza = Math.min(H * 0.032, 1.1)
  const deriva = tra(r, -0.035, 0.035) * H
  const ondaSu = onda(r, ampiezza)
  const ondaGiu = onda(r, ampiezza)
  const pressione = (x: number) => H * 0.03 * Math.exp(-x / (H * 1.6))
  const su = (x: number) => limita(margine + ondaSu(x) + deriva * (x / L - 0.5) - pressione(x), 0, H)
  const giu = (x: number) => limita(H - margine + ondaGiu(x) + deriva * (x / L - 0.5) + pressione(x), 0, H)

  const inizio: Punta = PUNTE[Math.floor(r() * PUNTE.length)] ?? 'netta'
  const fine: Punta = PUNTE[Math.floor(r() * PUNTE.length)] ?? 'netta'
  const passo = limita(H * 0.6, 6, 14)
  const viewBox = `0 0 ${num(larghezza)} ${num(H)}`

  // normali esterne delle due estremità (entrambe inclinate come "/")
  const hMed = H - 2 * margine
  const lung = Math.hypot(hMed, s) || 1
  const nFine: Punto = [hMed / lung, s / lung]
  const nInizio: Punto = [-hMed / lung, -s / lung]

  const pInizio: Punto = [0, giu(0)]
  const qInizio: Punto = [s, su(s)]
  const pFine: Punto = [L, su(L)]
  const qFine: Punto = [L - s, giu(L - s)]

  if (o.scarico) {
    return {
      d: strisceScariche(L, H, s, su, giu, r, mh),
      striature: [],
      inchiostro: '',
      viewBox,
      punte: { inizio, fine },
      sbieco: Math.round(s * 10) / 10,
    }
  }

  const bordoInizio = estremita(pInizio, qInizio, nInizio, inizio, r, H, -mh, L + mh)
  const bordoFine = estremita(pFine, qFine, nFine, fine, r, H, -mh, L + mh)

  const corpo: Punto[] = []
  for (const x of campioni(s, L, passo)) corpo.push([x, su(x)])
  corpo.push(...bordoFine)
  for (const x of campioni(L - s, 0, passo)) corpo.push([x, giu(x)])
  corpo.push(...bordoInizio)

  // pozze: dall'estremità verso l'interno, chiuse da una curva inclinata come la punta
  const pozze: Punto[][] = []
  const lunghezzaUtile = L - 2 * s
  if (lunghezzaUtile > H * 1.2) {
    const profInizio = Math.min(tra(r, 0.35, 0.7) * H, lunghezzaUtile * 0.3)
    const profFine = Math.min(tra(r, 0.3, 0.6) * H, lunghezzaUtile * 0.3)
    const bombatura = H * tra(r, 0.1, 0.2)

    const xa = s + profInizio
    const xb = xa - s * 0.9
    const p1: Punto[] = [pInizio, ...bordoInizio, qInizio]
    for (const x of campioni(s, xa, passo).slice(1)) p1.push([x, su(x)])
    for (let i = 1; i < 6; i++) {
      const t = i / 6
      const x = xa + (xb - xa) * t + bombatura * Math.sin(Math.PI * t)
      const y = su(xa) + (giu(xb) - su(xa)) * t
      p1.push([limita(x, 0, L), y])
    }
    for (const x of campioni(xb, 0, passo).slice(0, -1)) p1.push([x, giu(x)])
    pozze.push(p1)

    const xc = L - s - profFine
    const xd = xc + s * 0.9
    const p2: Punto[] = []
    for (const x of campioni(xd, L, passo)) p2.push([x, su(x)])
    p2.push(...bordoFine)
    for (const x of campioni(L - s, xc, passo)) p2.push([x, giu(x)])
    for (let i = 1; i < 6; i++) {
      const t = i / 6
      const x = xc + (xd - xc) * t - bombatura * Math.sin(Math.PI * t)
      const y = giu(xc) + (su(xd) - giu(xc)) * t
      p2.push([limita(x, 0, L), y])
    }
    pozze.push(p2)
  }

  // striature: 2 o 3 fili più chiari nel senso del tratto, sempre lontani dai bordi
  const striature: string[] = []
  const quante = L < H * 4 ? (L < H * 2.2 ? 0 : 1) : r() < 0.5 ? 2 : 3
  const posizioni =
    quante === 1 ? [tra(r, 0.4, 0.6)] : quante === 2 ? [tra(r, 0.26, 0.36), tra(r, 0.62, 0.72)] : [tra(r, 0.2, 0.28), tra(r, 0.46, 0.54), tra(r, 0.72, 0.8)]
  const ondaStria = onda(r, H * 0.02)
  for (const f of posizioni) {
    const spessore = H * tra(r, 0.045, 0.085)
    const libero = L - 2 * s - H
    const xs = s + H * 0.5 + r() * libero * 0.28
    const xe = L - s - H * 0.5 - r() * libero * 0.28
    if (xe - xs < H * 1.5) continue
    // sui tratti lunghi il filo si interrompe una volta, come una punta che salta
    const segmenti: [number, number][] =
      xe - xs > H * 14 && r() < 0.6
        ? (() => {
            const taglio = xs + (xe - xs) * tra(r, 0.35, 0.65)
            const vuoto = H * tra(r, 0.8, 1.6)
            return [
              [xs, taglio - vuoto / 2],
              [taglio + vuoto / 2, xe],
            ]
          })()
        : [[xs, xe]]
    for (const [a, b] of segmenti) {
      const sopra: Punto[] = []
      const sotto: Punto[] = []
      for (const x of campioni(a, b, passo)) {
        const u = (x - a) / (b - a)
        const affina = Math.max(0, Math.sin(Math.PI * u)) ** 0.5
        const c = su(x) + f * (giu(x) - su(x)) + ondaStria(x)
        sopra.push([x, c - (spessore / 2) * affina])
        sotto.push([x, c + (spessore / 2) * affina])
      }
      striature.push(percorso([...sopra, ...sotto.reverse()], mh))
    }
  }

  return {
    d: percorso(corpo, mh),
    striature,
    inchiostro: pozze.map((p) => percorso(p, mh)).join(''),
    viewBox,
    punte: { inizio, fine },
    sbieco: Math.round(s * 10) / 10,
  }
}

/** Evidenziatore scarico: 4-6 strisce con vuoti tra l'una e l'altra, capi sfilacciati. */
function strisceScariche(
  L: number,
  H: number,
  s: number,
  su: (x: number) => number,
  giu: (x: number) => number,
  r: Casuale,
  dx: number,
): string {
  const k = 4 + Math.floor(r() * 3)
  const passo = limita(H * 0.6, 6, 14)
  const parti: string[] = []
  for (let j = 0; j < k; j++) {
    const quota = j / k
    const vuoto = tra(r, 0.32, 0.5) / k
    const a = quota + vuoto / 2
    const b = quota + 1 / k - vuoto / 2
    // lo sbieco segue la punta: le strisce basse partono prima
    const spostamento = s * (1 - (a + b) / 2)
    const xs = limita(spostamento + r() * H * 0.9, 0, L)
    const xe = limita(L - s + spostamento - r() * L * 0.22, 0, L)
    if (xe - xs < H) continue
    const coda = H * tra(r, 0.6, 1.2)
    const sopra: Punto[] = []
    const sotto: Punto[] = []
    for (const x of campioni(xs, xe, passo)) {
      const alt = giu(x) - su(x)
      const affina = Math.max(0, Math.min(1, (x - xs) / coda, (xe - x) / coda)) ** 0.7
      const centro = su(x) + ((a + b) / 2) * alt
      const semi = ((b - a) / 2) * alt * Math.max(affina, 0.15)
      sopra.push([x, centro - semi])
      sotto.push([x, centro + semi])
    }
    parti.push(percorso([...sopra, ...sotto.reverse()], dx))
  }
  return parti.join('')
}
