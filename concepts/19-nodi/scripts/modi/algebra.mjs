// @ts-check
// Algebra lineare minima per il calcolo dei modi della tavola.
// Node puro, nessuna dipendenza. Matrici dense come Float64Array a righe.

/**
 * Ortonormalizzazione di Gram-Schmidt modificata, pesata.
 * Le colonne di `phi` (G righe = punti della griglia, N colonne = funzioni di
 * base) vengono rese ortonormali rispetto al prodotto scalare
 * <f, g> = sum_k peso[k] f[k] g[k]. La stessa trasformazione lineare viene
 * applicata alle matrici `derivate` (stesse dimensioni), che così restano le
 * derivate della nuova base. Restituisce false per le colonne scartate perché
 * (quasi) dipendenti.
 *
 * @param {Float64Array[]} colonne  N colonne, ognuna lunga G
 * @param {Float64Array[][]} derivate  liste di N colonne (una lista per derivata)
 * @param {Float64Array} peso  G pesi (area della cella × maschera)
 * @param {number} soglia  norma minima relativa sotto cui la colonna si scarta
 * @returns {boolean[]}
 */
export function gramSchmidt(colonne, derivate, peso, soglia = 1e-7) {
  const n = colonne.length;
  const g = peso.length;
  /** @type {boolean[]} */
  const tenute = new Array(n).fill(false);
  /** @type {number[]} */
  const normeIniziali = [];
  for (let j = 0; j < n; j++) normeIniziali.push(Math.sqrt(prodotto(colonne[j], colonne[j], peso)));
  for (let j = 0; j < n; j++) {
    const cj = colonne[j];
    for (let i = 0; i < j; i++) {
      if (!tenute[i]) continue;
      const ci = colonne[i];
      const r = prodotto(ci, cj, peso);
      for (let k = 0; k < g; k++) cj[k] -= r * ci[k];
      for (const lista of derivate) {
        const di = lista[i];
        const dj = lista[j];
        for (let k = 0; k < g; k++) dj[k] -= r * di[k];
      }
    }
    const norma = Math.sqrt(prodotto(cj, cj, peso));
    if (!(norma > soglia * normeIniziali[j]) || !(norma > 0)) {
      tenute[j] = false;
      continue;
    }
    const inv = 1 / norma;
    for (let k = 0; k < g; k++) cj[k] *= inv;
    for (const lista of derivate) {
      const dj = lista[j];
      for (let k = 0; k < g; k++) dj[k] *= inv;
    }
    tenute[j] = true;
  }
  return tenute;
}

/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @param {Float64Array} peso
 */
export function prodotto(a, b, peso) {
  let s = 0;
  for (let k = 0; k < a.length; k++) s += peso[k] * a[k] * b[k];
  return s;
}

/**
 * Autovalori e autovettori di una matrice simmetrica reale (Jacobi ciclico).
 * Restituisce autovalori in ordine crescente e autovettori per colonne.
 *
 * @param {Float64Array} a  matrice n×n a righe (viene copiata)
 * @param {number} n
 * @returns {{ valori: Float64Array, vettori: Float64Array }}
 */
export function jacobi(a, n) {
  const m = Float64Array.from(a);
  const v = new Float64Array(n * n);
  for (let i = 0; i < n; i++) v[i * n + i] = 1;
  for (let giro = 0; giro < 100; giro++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += m[p * n + q] * m[p * n + q];
    if (off < 1e-22) break;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = m[p * n + q];
        if (Math.abs(apq) < 1e-300) continue;
        const app = m[p * n + p];
        const aqq = m[q * n + q];
        const theta = (aqq - app) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = m[k * n + p];
          const akq = m[k * n + q];
          m[k * n + p] = c * akp - s * akq;
          m[k * n + q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = m[p * n + k];
          const aqk = m[q * n + k];
          m[p * n + k] = c * apk - s * aqk;
          m[q * n + k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k * n + p];
          const vkq = v[k * n + q];
          v[k * n + p] = c * vkp - s * vkq;
          v[k * n + q] = s * vkp + c * vkq;
        }
      }
    }
  }
  const ordine = Array.from({ length: n }, (_, i) => i).sort((i, j) => m[i * n + i] - m[j * n + j]);
  const valori = new Float64Array(n);
  const vettori = new Float64Array(n * n);
  ordine.forEach((src, dst) => {
    valori[dst] = m[src * n + src];
    for (let k = 0; k < n; k++) vettori[k * n + dst] = v[k * n + src];
  });
  return { valori, vettori };
}

/**
 * Polinomi di Legendre P_0..P_grado in t ∈ [-1, 1] con derivate prima e seconda.
 * @param {number} t
 * @param {number} grado
 * @returns {{ p: Float64Array, d1: Float64Array, d2: Float64Array }}
 */
export function legendre(t, grado) {
  const p = new Float64Array(grado + 1);
  const d1 = new Float64Array(grado + 1);
  const d2 = new Float64Array(grado + 1);
  p[0] = 1;
  if (grado >= 1) {
    p[1] = t;
    d1[1] = 1;
  }
  for (let k = 2; k <= grado; k++) {
    // (k) P_k = (2k-1) t P_{k-1} - (k-1) P_{k-2}
    p[k] = ((2 * k - 1) * t * p[k - 1] - (k - 1) * p[k - 2]) / k;
    d1[k] = ((2 * k - 1) * (p[k - 1] + t * d1[k - 1]) - (k - 1) * d1[k - 2]) / k;
    d2[k] = ((2 * k - 1) * (2 * d1[k - 1] + t * d2[k - 1]) - (k - 1) * d2[k - 2]) / k;
  }
  return { p, d1, d2 };
}
