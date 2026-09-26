/**
 * SOTTOSCOCCA · montaggio della scena (webgl-artist).
 *
 * Un solo ingresso per lo shader-engineer (`webgl/ScenaGL.ts`):
 *
 *   const s = await costruisciScena({ testiTarghetta, signal });
 *   // ticker, fase update:
 *   s.impostaQuota(runtime.quota.valore);
 *   s.impostaRuote(runtime.ruote);
 *   s.impostaEvidenza(runtime.evidenza);
 *   posaDaBinario(runtime.binario, runtime.discesa, orient, posa);   // binario.ts
 *   applicaPosa(camera, posa, orient, w, h);
 *   s.ancoraMondo(id, quotaPlateau, v); v.project(camera);           // punti
 *   // fase render: renderer.render(s.scena, camera) solo se qualcosa e' cambiato
 *
 * I setter restituiscono `true` quando cambiano qualcosa: servono a
 * `runtime.markDirty()`. La costruzione e' spezzata in passi con `await`
 * (TBT): prima il fetch del modello, poi auto, pezzi, ponte, officina.
 */

import { Scene, Vector3 } from 'three';
import type { IdPezzo, IdPunto, Quota } from '../../content/lavori';
import { ancoraPunto, calcolaAncore } from './ancore';
import type { Ancore } from './ancore';
import { caricaAuto, costruisciAuto } from './auto';
import type { Auto, DatiAuto } from './auto';
import { creaMateriali, impostaApertura, liberaMateriali, opacitaCerchio } from './materiali';
import type { Materiali } from './materiali';
import { costruisciOfficina, preparaScena } from './officina';
import type { Officina } from './officina';
import { costruisciPezzi } from './pezzi';
import type { Pezzi } from './pezzi';
import { costruisciPonte } from './ponte';
import type { Ponte } from './ponte';
import { creaTarghetta, creaTextureOmbra, creaTexturePavimento } from './texture';
import type { TestiTarghetta } from './texture';

export { posaDaBinario, applicaPosa, creaPosa, CHIAVI, LONTANO } from './binario';
export type { Orientamento, Posa, ChiaveCamera } from './binario';

export interface OpzioniScena {
  /** Testi della targhetta sulla colonna (da content/testi.ts). */
  testiTarghetta: TestiTarghetta;
  signal?: AbortSignal;
  /** Dati del modello gia' letti (test, fermi immagine); altrimenti fetch di auto.bin. */
  dati?: DatiAuto;
  /** Pausa tra i passi di costruzione. Default: un macrotask. */
  passo?: () => Promise<void>;
}

export interface Scena {
  scena: Scene;
  auto: Auto;
  ponte: Ponte;
  pezzi: Pezzi;
  officina: Officina;
  materiali: Materiali;
  ancore: Ancore;
  /** Quota corrente (cm) applicata. */
  readonly quota: number;
  /** Alza auto, bracci e tamponi; schiarisce l'ombra; apre la ruota anteriore sinistra. */
  impostaQuota(cm: number): boolean;
  /** Angolo delle ruote (rad), runtime.ruote. */
  impostaRuote(rad: number): boolean;
  /** Evidenza dei pezzi 0..1, runtime.evidenza. */
  impostaEvidenza(ev: Partial<Record<IdPezzo, number>>): boolean;
  /** Posizione in coordinate di scena del punto `id` alla quota del plateau `quota` (usa la quota corrente). */
  ancoraMondo(id: IdPunto, quota: Quota, out: Vector3): Vector3;
  /** Ridisegna la targhetta (dopo `fontsReady`). */
  ridisegnaTarghetta(): void;
  dispose(): void;
}

const pausa = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

function controlla(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('Scena annullata', 'AbortError');
}

export async function costruisciScena(opz: OpzioniScena): Promise<Scena> {
  const passo = opz.passo ?? pausa;
  const dati = opz.dati ?? (await caricaAuto(opz.signal));
  controlla(opz.signal);

  const targhetta = creaTarghetta(opz.testiTarghetta);
  const tex = { pavimento: creaTexturePavimento(), ombra: creaTextureOmbra(), targhetta: targhetta.texture };
  const materiali = creaMateriali(tex);
  const scena = new Scene();
  scena.name = 'sottoscocca';
  preparaScena(scena);

  const auto = costruisciAuto(dati, materiali);
  await passo();
  controlla(opz.signal);

  const pezzi = costruisciPezzi(auto.misure, auto.centri, materiali);
  auto.gruppo.add(pezzi.gruppo);
  const ancore = calcolaAncore(auto.misure, auto.centri, pezzi.layout);
  await passo();
  controlla(opz.signal);

  const ponte = costruisciPonte(
    auto.misure,
    auto.centri['anteriore-sinistra'][2],
    auto.centri['posteriore-sinistra'][2],
    materiali,
    targhetta.aspetto,
  );
  const officina = costruisciOfficina(auto.misure, materiali);
  scena.add(officina.gruppo, ponte.fisso, ponte.mobile, auto.gruppo);
  await passo();
  controlla(opz.signal);

  let quota = Number.NaN;
  let ruote = Number.NaN;

  const s: Scena = {
    scena,
    auto,
    ponte,
    pezzi,
    officina,
    materiali,
    ancore,
    get quota() {
      return quota;
    },
    impostaQuota(cm) {
      if (cm === quota) return false;
      quota = cm;
      const y = cm / 100;
      auto.gruppo.position.y = y;
      ponte.impostaQuota(cm);
      officina.impostaQuota(cm);
      impostaApertura(materiali, opacitaCerchio(cm));
      return true;
    },
    impostaRuote(rad) {
      if (rad === ruote) return false;
      ruote = rad;
      auto.impostaRotazioneRuote(rad);
      return true;
    },
    impostaEvidenza(ev) {
      return pezzi.applicaEvidenza(ev);
    },
    ancoraMondo(id, q, out) {
      ancoraPunto(ancore, id, q, out);
      auto.gruppo.updateMatrixWorld();
      return auto.gruppo.localToWorld(out);
    },
    ridisegnaTarghetta() {
      targhetta.ridisegna();
    },
    dispose() {
      auto.dispose();
      pezzi.dispose();
      ponte.dispose();
      officina.dispose();
      liberaMateriali(materiali);
      tex.pavimento.dispose();
      tex.ombra.dispose();
      tex.targhetta.dispose();
      scena.clear();
    },
  };
  s.impostaQuota(0);
  s.impostaRuote(0);
  return s;
}
