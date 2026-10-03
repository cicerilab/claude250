/**
 * EVIDENZIA · semi stabili (tech-architect §7.2, vector-artist §5).
 *
 * `semeDa(id)`: hash FNV-1a a 32 bit SENZA segno di una stringa. Stesso id =
 * stesso seme, sempre: il tratto di un annuncio è identico a ogni ritorno,
 * sul foglio, nelle tappe del giro e in "Hai segnato".
 * `mulberry32(seme)`: generatore pseudocasuale deterministico in [0, 1)
 * (stessa famiglia del PRNG locale di tratto/forma.ts).
 * Funzioni pure, nessun accesso al browser.
 */

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIMO = 0x01000193;

/** Seme intero a 32 bit senza segno (0 … 4294967295) per una stringa. */
export function semeDa(id: string): number {
  let h = FNV_OFFSET;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, FNV_PRIMO);
  }
  // mescolamento finale: semi vicini per id simili ("rif-214", "rif-215") divergono
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
}

/** Generatore mulberry32: restituisce una funzione che dà numeri in [0, 1). */
export function mulberry32(seme: number): () => number {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
