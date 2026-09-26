/**
 * SOTTOSCOCCA · materiali della scena (webgl-artist).
 *
 * Materiali piatti e opachi dalla palette (`styles/tokens.ts`, ruoli in
 * `SCENA`): Lambert con `flatShading`, cosi' il low-poly Kenney si legge a
 * facce come un modellino tecnico in scala, non come un giocattolo lucido.
 * Nessuna mappa d'ambiente, nessun riflesso, nessuna ombra calcolata.
 *
 * Evidenza (CD 4.3): il pezzo toccato passa dal suo colore al bianco
 * segnaletica. Ogni materiale evidenziabile tiene il colore di partenza e
 * `impostaEvidenza(m, v)` scrive solo `color` (nessuna ricompilazione).
 *
 * Nessun accesso a window/document: si crea solo quando la scena si costruisce.
 */

import { Color, DoubleSide, FrontSide, MeshBasicMaterial, MeshLambertMaterial } from 'three';
import type { Material, Texture } from 'three';
import { OPACITA, PALETTE, SCENA } from '../../styles/tokens';
import type { IdColore } from '../../styles/tokens';

/** Colore three (lineare) di un ruolo della scena, da `SCENA` in tokens.ts. */
export function coloreRuolo(ruolo: keyof typeof SCENA): Color {
  const id: IdColore = SCENA[ruolo] ?? 'verde';
  return new Color(PALETTE[id].hex);
}

/** Colore three (lineare) di una voce della palette. */
export function colorePalette(id: IdColore): Color {
  return new Color(PALETTE[id].hex);
}

/**
 * Un materiale evidenziabile: `userData.base` e' il colore a riposo,
 * `userData.evidenza` quello a evidenza piena.
 */
export type MaterialeEvidenza = MeshLambertMaterial & {
  userData: { base: Color; evidenza: Color; valore: number };
};

function lambert(colore: Color, opzioni: { doppio?: boolean } = {}): MeshLambertMaterial {
  return new MeshLambertMaterial({
    color: colore,
    flatShading: true,
    side: opzioni.doppio ? DoubleSide : FrontSide,
  });
}

function evidenziabile(colore: Color, opzioni: { doppio?: boolean } = {}): MaterialeEvidenza {
  const m = lambert(colore.clone(), opzioni) as MaterialeEvidenza;
  m.userData = { base: colore.clone(), evidenza: coloreRuolo('evidenza'), valore: 0 };
  return m;
}

/**
 * Porta il materiale verso il bianco segnaletica (v 0..1). Scrive solo se il
 * valore cambia di almeno 1/512: il ticker puo' chiamarla a ogni frame.
 */
export function impostaEvidenza(m: MaterialeEvidenza, v: number): boolean {
  const x = v <= 0 ? 0 : v >= 1 ? 1 : v;
  if (Math.abs(x - m.userData.valore) < 1 / 512) return false;
  m.userData.valore = x;
  m.color.copy(m.userData.base).lerp(m.userData.evidenza, x);
  return true;
}

export interface Materiali {
  // auto (i gruppi della scocca seguono l'ordine di scripts/glb-a-bin.mjs)
  carrozzeria: MeshLambertMaterial;
  fascia: MeshLambertMaterial;
  fondo: MeshLambertMaterial;
  vetri: MeshLambertMaterial;
  fanali: MeshLambertMaterial;
  gommaAnteriore: MaterialeEvidenza;
  gommaPosteriore: MaterialeEvidenza;
  cerchioAnteriore: MeshLambertMaterial;
  cerchioPosteriore: MeshLambertMaterial;
  // ponte
  ponte: MeshLambertMaterial;
  tampone: MeshLambertMaterial;
  metallo: MeshLambertMaterial;
  targhetta: MeshBasicMaterial;
  // officina
  pavimento: MeshBasicMaterial;
  ombra: MeshBasicMaterial;
  neon: MeshBasicMaterial;
  // pezzi del sottoscocca (uno per pezzo evidenziabile)
  coppa: MaterialeEvidenza;
  filtro: MaterialeEvidenza;
  tubo: MaterialeEvidenza;
  catalizzatore: MaterialeEvidenza;
  silenziatore: MaterialeEvidenza;
  disco: MaterialeEvidenza;
  pinza: MaterialeEvidenza;
  molla: MaterialeEvidenza;
  ammortizzatore: MaterialeEvidenza;
  /** Assali, bracci oscillanti, supporti: non evidenziabili. */
  meccanica: MeshLambertMaterial;
}

export interface TextureScena {
  pavimento: Texture;
  ombra: Texture;
  targhetta: Texture;
}

/**
 * Crea tutti i materiali. Colori:
 * - carrozzeria, colonne, bracci, pezzi: verde macchina;
 * - fascia bassa della scocca: verde ombra (la scocca resta leggibile in due toni);
 * - pianale e passaruota, gomme, tamponi, vetri: nero grasso (i vetri
 *   schiariti verso lo zincato al 30%, OPACITA.vetri: la scocca non ha interni,
 *   un vetro trasparente mostrerebbe il vuoto);
 * - cerchi, fanali, meccanica non evidenziabile: zincato.
 */
export function creaMateriali(tex: TextureScena): Materiali {
  const verde = coloreRuolo('carrozzeria');
  const nero = coloreRuolo('gomme');
  const zincato = coloreRuolo('cerchi');
  const pezzi = coloreRuolo('pezzi');
  const vetro = coloreRuolo('vetri').lerp(zincato, 1 - OPACITA.vetri);

  const cerchioAnteriore = lambert(zincato.clone(), { doppio: true });
  cerchioAnteriore.transparent = true;
  cerchioAnteriore.opacity = 1;
  cerchioAnteriore.depthWrite = false;

  const pavimento = new MeshBasicMaterial({ color: 0xffffff, map: tex.pavimento, side: FrontSide });
  const ombra = new MeshBasicMaterial({
    color: 0xffffff,
    map: tex.ombra,
    transparent: true,
    depthWrite: false,
    side: FrontSide,
  });
  const targhetta = new MeshBasicMaterial({ color: 0xffffff, map: tex.targhetta, side: FrontSide });

  return {
    carrozzeria: lambert(verde.clone(), { doppio: true }),
    fascia: lambert(colorePalette('verdeOmbra'), { doppio: true }),
    fondo: lambert(nero.clone(), { doppio: true }),
    vetri: lambert(vetro, { doppio: true }),
    fanali: lambert(coloreRuolo('fanali'), { doppio: true }),
    gommaAnteriore: evidenziabile(nero, { doppio: true }),
    gommaPosteriore: evidenziabile(nero, { doppio: true }),
    cerchioAnteriore,
    cerchioPosteriore: lambert(zincato.clone(), { doppio: true }),
    ponte: lambert(coloreRuolo('colonne')),
    tampone: lambert(coloreRuolo('tamponi')),
    metallo: lambert(coloreRuolo('pezziMetallo')),
    targhetta,
    pavimento,
    ombra,
    neon: new MeshBasicMaterial({ color: coloreRuolo('neon') }),
    coppa: evidenziabile(pezzi),
    filtro: evidenziabile(pezzi),
    tubo: evidenziabile(pezzi),
    catalizzatore: evidenziabile(pezzi),
    silenziatore: evidenziabile(pezzi),
    disco: evidenziabile(pezzi),
    pinza: evidenziabile(pezzi),
    molla: evidenziabile(pezzi),
    ammortizzatore: evidenziabile(pezzi),
    meccanica: lambert(zincato.clone()),
  };
}

/**
 * Opacita' del cerchio anteriore: pieno a terra e a 20 cm, al 35% a 80 cm
 * (si vedono disco e pinza), resta aperto sopra. `cm` e' la quota corrente.
 */
export function opacitaCerchio(cm: number): number {
  const t = cm <= 20 ? 0 : cm >= 80 ? 1 : (cm - 20) / 60;
  const s = t * t * (3 - 2 * t);
  return 1 + (OPACITA.cerchioAperto - 1) * s;
}

/**
 * Applica l'opacita' al cerchio anteriore. Il materiale resta sempre
 * `transparent` (cambiare il flag a runtime sposta la mesh tra le liste di
 * render e fa un salto): a opacita' 1 si vede identico a un opaco.
 */
export function impostaCerchio(m: MeshLambertMaterial, opacita: number): boolean {
  if (Math.abs(m.opacity - opacita) < 1 / 512) return false;
  m.opacity = opacita;
  return true;
}

/** Libera tutti i materiali (le texture le libera chi le ha create). */
export function liberaMateriali(m: Materiali): void {
  for (const v of Object.values(m) as Material[]) v.dispose();
}
