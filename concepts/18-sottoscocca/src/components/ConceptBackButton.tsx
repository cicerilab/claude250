/**
 * Copia fedele (solo app standalone, NON si porta) di
 * `src/components/ConceptBackButton.tsx` del sito cicerilab, letta il
 * 25/09/2026. Unica differenza: `returnToConceptLab()` (che nel sito torna
 * alla vetrina del Concept Lab) è sostituito da `location.href = "/"`, perché
 * qui non esiste `@/lib/returnToLab`. Il resto (markup, classi `cl-backbtn`,
 * stile inline con i colori di CiceriLab) è identico: è il comando del sito,
 * non del concept, e resta uguale su ogni prototipo.
 */

/**
 * Pulsante "Torna in Ciceri Lab" condiviso dalle nove pagine prototipo.
 *
 * Ogni prototipo ha un suo mondo cromatico, alcuni chiarissimi e altri neri:
 * il pulsante non prende il tema della pagina che lo ospita, prende quello di
 * Ciceri Lab — carta bianca, filetto d'inchiostro, mono maiuscolo. È il segno
 * che quel comando appartiene al sito, non al prototipo, e resta leggibile su
 * qualsiasi sfondo. `label`/`onClick` restano per riusarlo come indietro locale.
 */
const ConceptBackButton = ({
  label = "Torna in Ciceri Lab",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) => (
  <>
    <button
      type="button"
      className="cl-backbtn"
      onClick={onClick ?? (() => { location.href = "/"; })}
      aria-label={label}
    >
      <span className="cl-backbtn-arrow" aria-hidden>←</span>
      {label}
    </button>
    <style>{`
      .cl-backbtn {
        position: fixed;
        top: max(env(safe-area-inset-top), 14px);
        left: 14px;
        z-index: 2147483000;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 11px 16px;
        border: none;
        border-radius: 0;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10px;
        letter-spacing: 0.17em;
        text-transform: uppercase;
        color: #14171e;
        background: rgba(246, 244, 239, 0.94);
        box-shadow: inset 0 0 0 1px #14171e, 0 8px 24px -14px rgba(0, 0, 0, 0.55);
        -webkit-backdrop-filter: saturate(180%) blur(12px);
        backdrop-filter: saturate(180%) blur(12px);
        cursor: pointer;
        transition: color .3s ease, background .3s ease, transform .3s cubic-bezier(.16,1,.3,1);
      }
      .cl-backbtn:hover { background: #14171e; color: #f6f4ef; }
      .cl-backbtn:active { transform: scale(0.975); }
      .cl-backbtn:focus-visible { outline: 2px solid #14171e; outline-offset: 3px; }
      .cl-backbtn-arrow { font-size: 13px; line-height: 1; transition: transform .3s cubic-bezier(.16,1,.3,1); }
      .cl-backbtn:hover .cl-backbtn-arrow { transform: translateX(-4px); }
      /* Su telefono va in basso: in alto copriva l'insegna di ogni prototipo
         (su Meridiana finiva sopra "MERIDIANA REF. MRD-01"). In basso a
         sinistra nessuna delle nove pagine tiene comandi. */
      @media (max-width: 640px) {
        .cl-backbtn {
          top: auto;
          bottom: max(env(safe-area-inset-bottom), 14px);
          left: 12px;
          padding: 10px 14px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .cl-backbtn, .cl-backbtn-arrow { transition: none; }
      }
    `}</style>
  </>
);

export default ConceptBackButton;
