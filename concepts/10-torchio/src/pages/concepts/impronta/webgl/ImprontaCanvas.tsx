/**
 * IMPRONTA · il canvas WebGL nel layout (shader-engineer)
 *
 * Componente sottile: crea il `<canvas class="imp-gl">` (fisso, dietro il
 * contenuto, `pointer-events: none`, opacità 0 finché `data-gl` non è "on":
 * tutto in styles/layout.css), ci monta `ImprontaGL` e lo smonta.
 *
 * Il canvas si crea A MANO dentro l'effetto, non con JSX: `dispose()` fa
 * `forceContextLoss()`, e un canvas il cui contesto è stato perso non ne dà
 * più uno nuovo. Con StrictMode (effetto montato, smontato e rimontato in
 * sviluppo) o con un rimontaggio, ogni `ImprontaGL` ha così il suo canvas
 * fresco. L'ospite è uno `<span>` con `display: contents`: non genera box,
 * quindi il canvas resta di fatto figlio di `.imp-root` per il layout.
 *
 * Spegnimento per qualità: `ImprontaGL` chiama `impostaGL('off', 'qualita')`
 * (il canvas svanisce in `GL.spegnimento` ms, i fantasmi riprendono il rilievo
 * CSS) e poi `onSpegni`: dopo la dissolvenza il componente smonta tutto e non
 * rende più niente. La perdita di contesto invece NON smonta: si aspetta il
 * ripristino.
 *
 * Diagnostica: in sviluppo, o con `?gl=1`, `window.__improntaGL` espone
 * `ImprontaGL.diagnostica` (draw call per frame, DPR, atlante, qualità).
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { isCoarsePointer, leggiForzaturaGL } from '../core/capabilities';
import { GL } from '../motion/choreography';
import { impostaGL, store } from '../state/store';
import { ImprontaGL } from './ImprontaGL';

const STILE_OSPITE: CSSProperties = { display: 'contents' };
const CHIAVE_DIAGNOSTICA = '__improntaGL';

type FinestraConDiagnostica = Window & { [CHIAVE_DIAGNOSTICA]?: unknown };

export default function ImprontaCanvas() {
  const ospiteRef = useRef<HTMLSpanElement>(null);
  const [spento, setSpento] = useState(false);

  useEffect(() => {
    const ospite = ospiteRef.current;
    if (spento || ospite === null) return undefined;

    const canvas = document.createElement('canvas');
    canvas.className = 'imp-gl';
    canvas.setAttribute('aria-hidden', 'true');
    ospite.appendChild(canvas);

    if (store.get().gl !== 'pending') impostaGL('pending');

    const forzato = leggiForzaturaGL(window.location.search) === 'on';
    let vivo = true;
    let timerSpegni = 0;
    let gl: ImprontaGL | null = null;

    try {
      gl = new ImprontaGL({
        canvas,
        forzato,
        grossolano: isCoarsePointer(),
        onSpegni: () => {
          window.clearTimeout(timerSpegni);
          timerSpegni = window.setTimeout(() => {
            if (vivo) setSpento(true);
          }, GL.spegnimento + 50);
        },
      });
    } catch (errore) {
      if (import.meta.env.DEV) console.warn('[impronta/gl] renderer non creato', errore);
      impostaGL('off', 'errore-init');
      canvas.remove();
      return undefined;
    }

    const istanza = gl;
    const w = window as FinestraConDiagnostica;
    if (import.meta.env.DEV || forzato) w[CHIAVE_DIAGNOSTICA] = istanza.diagnostica;

    istanza.avvia().catch((errore: unknown) => {
      if (!vivo) return;
      if (import.meta.env.DEV) console.warn('[impronta/gl] avvio non riuscito', errore);
      impostaGL('off', 'errore-init');
      istanza.dispose();
    });

    return () => {
      vivo = false;
      window.clearTimeout(timerSpegni);
      istanza.dispose();
      canvas.remove();
      if (w[CHIAVE_DIAGNOSTICA] === istanza.diagnostica) delete w[CHIAVE_DIAGNOSTICA];
    };
  }, [spento]);

  if (spento) return null;
  return <span ref={ospiteRef} className="imp-gl-ospite" style={STILE_OSPITE} aria-hidden="true" />;
}
