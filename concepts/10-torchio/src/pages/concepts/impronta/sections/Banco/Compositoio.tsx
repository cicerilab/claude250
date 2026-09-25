/**
 * IMPRONTA · il compositoio del banco di prova (section-builder-banco).
 *
 * Le scelte, in ordine libero e tutte aperte (niente passi numerati): cosa
 * stampi, il tuo testo, la carta, la tecnica (più il taglio colorato), la
 * legatura se è un libro, quante, dove ti scriviamo, quando ti serve.
 *
 * - Ogni gruppo è un `fieldset` con `legend` e radio veri resi come fogli di
 *   carta (`imp-ix-scelta`): frecce native, scelta = bordo d'inchiostro 3 px
 *   più la parola "scelta", mai il solo colore.
 * - I campi hanno l'etichetta sopra, l'errore o l'avviso sotto (collegati con
 *   `aria-describedby`), corpo 17 px (niente zoom su iOS), nessun limite
 *   duro: oltre il limite la riga va su due, e lo si dice con garbo.
 * - Le scelte scrivono nello store (`aggiornaProva`, bozza salvata dopo
 *   300 ms). La carta passa da `cambiaCarta` (l'onda parte dal quadrato).
 *   Il contatto no: resta stato locale del Banco, non si salva mai.
 * - Nessun testo scritto qui: tutto da content/testi.ts.
 */

import { type ChangeEvent, type RefObject } from 'react';
import type { Carta, Legatura, Prodotto, Quando, Tecnica } from '../../content/prezzi';
import { TIRATURE } from '../../content/prezzi';
import {
  ANNUNCI,
  BANCO,
  CAMPI_TESTO,
  CARTE,
  LEGATURE_NOMI,
  ORDINE_CARTE,
  PRODOTTI,
  TECNICHE_NOMI,
  numero,
} from '../../content/testi';
import { cambiaCarta } from '../../interaction/paperWave';
import { aggiornaProva, type Prova } from '../../state/store';
import { pulisciSegni, taglioDisponibile } from './calcolaPrezzo';

export type ErroreContatto = 'nonValido' | 'vuoto' | null;

export interface CompositoioProps {
  prova: Prova;
  carta: Carta;
  /** In stampa o già inviata: le scelte restano visibili ma ferme. */
  fermo: boolean;
  /** Riepilogo in parole: su mobile sta qui, non nella lastra. */
  riepilogo: string;
  contatto: string;
  contattoRef: RefObject<HTMLInputElement>;
  tastieraContatto: 'tel' | 'email';
  erroreContatto: ErroreContatto;
  onContatto: (valore: string) => void;
  onEsciContatto: () => void;
  /** Annuncio nella regione aria-live del Banco. */
  onAnnuncia: (testo: string) => void;
  /** Nome della scelta appena cambiata, per l'annuncio del prezzo. */
  onCambiato: (nome: string) => void;
}

const ORDINE_PRODOTTI: readonly Prodotto[] = ['biglietto', 'partecipazione', 'intestata', 'libro'];
const ORDINE_TECNICHE: readonly Tecnica[] = ['secco', 'colore', 'lamina'];
const ORDINE_LEGATURE: readonly Legatura[] = ['brossura', 'cartonato', 'giapponese', 'punto'];
const ORDINE_QUANDO: readonly Quando[] = ['quindici', 'mese', 'avanti'];

/** Il segno "scelta" accanto al foglio scelto (il lettore di schermo sente già lo stato del radio). */
function SegnoScelta({ scelto }: { scelto: boolean }) {
  return (
    <span className="imp-banco__segno" aria-hidden="true">
      {scelto ? BANCO.carta.scelta : ''}
    </span>
  );
}

/** Un campo di "Il tuo testo": etichetta sopra, avvisi sotto, mai bloccato. */
function CampoTesto({
  prodotto,
  chiave,
  etichetta,
  esempio,
  max,
  autocomplete,
  valore,
  fermo,
}: {
  prodotto: Prodotto;
  chiave: string;
  etichetta: string;
  esempio: string;
  max: number;
  autocomplete: string;
  valore: string;
  fermo: boolean;
}) {
  const id = `imp-banco-campo-${prodotto}-${chiave}`;
  const idNota = `${id}-nota`;
  const { pulito, mancanti } = pulisciSegni(valore);
  const usate = Array.from(pulito.trim()).length;
  const lungo = usate > max;
  const vicino = !lungo && usate >= max - 5 && usate > 0;
  const haNota = lungo || vicino || mancanti;

  return (
    <div className="imp-banco__campo" data-chiave={chiave}>
      <label className="imp-banco__etichetta" htmlFor={id}>
        {etichetta}
      </label>
      <input
        id={id}
        className="imp-banco__input"
        type="text"
        name={chiave}
        value={valore}
        placeholder={esempio}
        autoComplete={autocomplete}
        autoCapitalize="sentences"
        spellCheck={false}
        enterKeyHint="next"
        maxLength={max * 3}
        readOnly={fermo}
        aria-describedby={haNota ? idNota : undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => aggiornaProva({ campi: { [chiave]: e.currentTarget.value } })}
      />
      <p className="imp-banco__nota-campo" id={idNota} hidden={!haNota}>
        {vicino ? (
          <>
            <span aria-hidden="true">{BANCO.tuoTesto.contatore(usate, max)}</span>
            <span className="imp-sr">{BANCO.tuoTesto.contatoreAria(usate, max)}</span>
          </>
        ) : null}
        {lungo ? <span>{BANCO.tuoTesto.lungo(max)}</span> : null}
        {mancanti ? <span>{BANCO.tuoTesto.segnoMancante}</span> : null}
      </p>
    </div>
  );
}

export default function Compositoio({
  prova,
  carta,
  fermo,
  riepilogo,
  contatto,
  contattoRef,
  tastieraContatto,
  erroreContatto,
  onContatto,
  onEsciContatto,
  onAnnuncia,
  onCambiato,
}: CompositoioProps) {
  const { prodotto, tecnica, taglioColorato, tiratura, legatura, quando } = prova;
  const campi = CAMPI_TESTO[prodotto];
  const tuttiVuoti = campi.every((c) => (prova.campi[c.chiave] ?? '').trim().length === 0);
  const taglioOk = taglioDisponibile(prodotto);
  const idContatto = 'imp-banco-contatto';
  const idContattoAiuto = `${idContatto}-aiuto`;
  const idContattoErrore = `${idContatto}-errore`;

  const scegliProdotto = (p: Prodotto): void => {
    aggiornaProva({ prodotto: p });
    onCambiato(PRODOTTI[p].nome);
    onAnnuncia(ANNUNCI.prodotto(p));
  };

  const scegliCarta = (c: Carta, e: ChangeEvent<HTMLInputElement>): void => {
    const foglio = e.currentTarget.closest('label') ?? e.currentTarget;
    onCambiato(`${CARTE[c].nome} ${CARTE[c].grammatura}`);
    void cambiaCarta(c, foglio).then(() => onAnnuncia(ANNUNCI.carta(c)));
  };

  return (
    <div className="imp-banco__compositoio">
      {/* ---------- cosa stampi */}
      <fieldset className="imp-banco__gruppo imp-banco__gruppo--prodotto" disabled={fermo}>
        <legend className="imp-banco__legenda">{BANCO.cosaStampi.legenda}</legend>
        <div className="imp-banco__scelte imp-banco__scelte--prodotti">
          {ORDINE_PRODOTTI.map((p) => (
            <label key={p} className="imp-banco__scelta imp-ix-scelta imp-ix-premibile">
              <input
                className="imp-ix-scelta__input"
                type="radio"
                name="imp-banco-prodotto"
                value={p}
                checked={prodotto === p}
                onChange={() => scegliProdotto(p)}
              />
              <span className="imp-banco__scelta-testo">
                <span className="imp-banco__scelta-nome">{PRODOTTI[p].breve}</span>
                <span className="imp-banco__scelta-dettaglio">{PRODOTTI[p].formato}</span>
              </span>
              <SegnoScelta scelto={prodotto === p} />
            </label>
          ))}
        </div>
      </fieldset>

      {/* ---------- il tuo testo */}
      <fieldset className="imp-banco__gruppo imp-banco__gruppo--testo" disabled={fermo}>
        <legend className="imp-banco__legenda">{BANCO.tuoTesto.legenda}</legend>
        {tuttiVuoti ? <p className="imp-banco__nota">{BANCO.tuoTesto.esempio}</p> : null}
        <div className="imp-banco__campi">
          {campi.map((c) => (
            <CampoTesto
              key={`${prodotto}-${c.chiave}`}
              prodotto={prodotto}
              chiave={c.chiave}
              etichetta={c.etichetta}
              esempio={c.esempio}
              max={c.max}
              autocomplete={c.autocomplete}
              valore={prova.campi[c.chiave] ?? ''}
              fermo={fermo}
            />
          ))}
        </div>
      </fieldset>

      {/* ---------- la carta */}
      <fieldset className="imp-banco__gruppo imp-banco__gruppo--carta" disabled={fermo}>
        <legend className="imp-banco__legenda">
          <span aria-hidden="true">{BANCO.carta.legenda}</span>
          <span className="imp-sr">{BANCO.carta.gruppoAria}</span>
        </legend>
        <div className="imp-banco__carte">
          {ORDINE_CARTE.map((c) => (
            <label key={c} className="imp-banco__carta imp-ix-scelta">
              <input
                className="imp-ix-scelta__input"
                type="radio"
                name="imp-banco-carta"
                value={c}
                checked={carta === c}
                aria-label={CARTE[c].radioAria}
                onChange={(e) => scegliCarta(c, e)}
              />
              <span className="imp-banco__campione imp-costa" data-carta={c} aria-hidden="true" />
              <span className="imp-banco__carta-nome" aria-hidden="true">
                {CARTE[c].nome}
              </span>
              <span className="imp-banco__carta-grammatura" aria-hidden="true">
                {CARTE[c].grammatura}
              </span>
              <SegnoScelta scelto={carta === c} />
            </label>
          ))}
        </div>
        {prodotto === 'intestata' ? <p className="imp-banco__nota">{BANCO.carta.notaIntestata}</p> : null}
        {prodotto === 'libro' ? <p className="imp-banco__nota">{BANCO.carta.notaLibro}</p> : null}
      </fieldset>

      {/* ---------- la tecnica */}
      <fieldset className="imp-banco__gruppo imp-banco__gruppo--tecnica" disabled={fermo}>
        <legend className="imp-banco__legenda">{BANCO.tecnica.legenda}</legend>
        <a className="imp-banco__cose imp-ix-link" href="#tecniche" aria-label={BANCO.tecnica.cosEAria}>
          {BANCO.tecnica.cosE}
        </a>
        <div className="imp-banco__scelte imp-banco__scelte--tecniche">
          {ORDINE_TECNICHE.map((t) => (
            <label key={t} className="imp-banco__scelta imp-ix-scelta imp-ix-premibile">
              <input
                className="imp-ix-scelta__input"
                type="radio"
                name="imp-banco-tecnica"
                value={t}
                checked={tecnica === t}
                onChange={() => {
                  aggiornaProva({ tecnica: t });
                  onCambiato(TECNICHE_NOMI[t].nome);
                }}
              />
              <span className="imp-banco__scelta-testo">
                <span className="imp-banco__scelta-nome">{TECNICHE_NOMI[t].nome}</span>
              </span>
              <SegnoScelta scelto={tecnica === t} />
            </label>
          ))}
        </div>
        <label
          className="imp-banco__taglio imp-ix-scelta"
          data-non-disponibile={taglioOk ? undefined : ''}
        >
          <input
            className="imp-ix-scelta__input"
            type="checkbox"
            name="imp-banco-taglio"
            checked={taglioColorato && taglioOk}
            disabled={!taglioOk}
            aria-describedby="imp-banco-taglio-nota"
            onChange={(e) => {
              const si = e.currentTarget.checked;
              aggiornaProva({ taglioColorato: si });
              onCambiato(BANCO.tecnica.taglio);
            }}
          />
          <span className="imp-banco__casella" aria-hidden="true" />
          <span className="imp-banco__scelta-testo">
            <span className="imp-banco__scelta-nome">{BANCO.tecnica.taglio}</span>
            <span className="imp-banco__scelta-dettaglio" id="imp-banco-taglio-nota">
              {taglioOk ? BANCO.tecnica.taglioNota : BANCO.tecnica.taglioNonDisponibile}
            </span>
          </span>
        </label>
        {prodotto === 'libro' ? <p className="imp-banco__nota">{BANCO.tecnica.notaLibro}</p> : null}
      </fieldset>

      {/* ---------- la legatura (solo libro) */}
      {prodotto === 'libro' ? (
        <fieldset className="imp-banco__gruppo imp-banco__gruppo--legatura" disabled={fermo}>
          <legend className="imp-banco__legenda">{BANCO.legatura.legenda}</legend>
          <div className="imp-banco__scelte imp-banco__scelte--legature">
            {ORDINE_LEGATURE.map((l) => (
              <label key={l} className="imp-banco__scelta imp-ix-scelta imp-ix-premibile">
                <input
                  className="imp-ix-scelta__input"
                  type="radio"
                  name="imp-banco-legatura"
                  value={l}
                  checked={legatura === l}
                  onChange={() => {
                    aggiornaProva({ legatura: l });
                    onCambiato(LEGATURE_NOMI[l].nome);
                  }}
                />
                <span className="imp-banco__scelta-testo">
                  <span className="imp-banco__scelta-nome">{LEGATURE_NOMI[l].nome}</span>
                </span>
                <SegnoScelta scelto={legatura === l} />
              </label>
            ))}
          </div>
          {legatura === 'punto' ? <p className="imp-banco__nota">{BANCO.legatura.notaPunto}</p> : null}
        </fieldset>
      ) : null}

      {/* ---------- quante */}
      <fieldset className="imp-banco__gruppo imp-banco__gruppo--quante" disabled={fermo}>
        <legend className="imp-banco__legenda">{BANCO.quante.legenda}</legend>
        <div className="imp-banco__scelte imp-banco__scelte--tirature">
          {(TIRATURE[prodotto] as readonly number[]).map((n) => (
            <label key={n} className="imp-banco__scelta imp-banco__scelta--numero imp-ix-scelta imp-ix-premibile">
              <input
                className="imp-ix-scelta__input"
                type="radio"
                name="imp-banco-tiratura"
                value={n}
                checked={tiratura === n}
                aria-label={BANCO.quante.aria(n, prodotto)}
                onChange={() => {
                  aggiornaProva({ tiratura: n });
                  onCambiato(BANCO.quante.aria(n, prodotto));
                }}
              />
              <span className="imp-banco__scelta-testo" aria-hidden="true">
                <span className="imp-banco__scelta-numero">{numero(n)}</span>
              </span>
              <SegnoScelta scelto={tiratura === n} />
            </label>
          ))}
        </div>
      </fieldset>

      {/* ---------- riepilogo in parole (solo sotto i 1024 px: sopra sta sotto la lastra) */}
      <div className="imp-banco__riepilogo-stretto">
        <p className="imp-banco__riepilogo">{riepilogo}</p>
        <p className="imp-banco__dipende">{BANCO.prezzo.dipende}</p>
        <p className="imp-banco__ristampa">{BANCO.prezzo.ristampa}</p>
      </div>

      {/* ---------- dove ti scriviamo */}
      <div className="imp-banco__gruppo imp-banco__gruppo--contatto">
        <div className="imp-banco__campo" data-errore={erroreContatto ? '' : undefined}>
          <label className="imp-banco__etichetta imp-banco__etichetta--grande" htmlFor={idContatto}>
            {BANCO.contatto.etichetta}
          </label>
          <p className="imp-banco__aiuto" id={idContattoAiuto}>
            {BANCO.contatto.aiuto}
          </p>
          <input
            ref={contattoRef}
            id={idContatto}
            className="imp-banco__input"
            type="text"
            inputMode={tastieraContatto}
            name="contatto"
            value={contatto}
            placeholder={BANCO.contatto.placeholder}
            autoComplete={tastieraContatto === 'email' ? 'email' : 'tel'}
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="done"
            readOnly={fermo}
            aria-invalid={erroreContatto ? true : undefined}
            aria-describedby={erroreContatto ? `${idContattoErrore} ${idContattoAiuto}` : idContattoAiuto}
            onChange={(e) => onContatto(e.currentTarget.value)}
            onBlur={onEsciContatto}
          />
          <p className="imp-banco__errore" id={idContattoErrore} hidden={!erroreContatto}>
            <span className="imp-banco__errore-segno" aria-hidden="true">
              {BANCO.contatto.erroreSegno}
            </span>
            <span className="imp-sr">{BANCO.contatto.erroreSr} </span>
            <span>{erroreContatto === 'vuoto' ? BANCO.contatto.vuoto : BANCO.contatto.nonValido}</span>
          </p>
        </div>
      </div>

      {/* ---------- quando ti serve (facoltativo, non cambia il prezzo) */}
      <fieldset className="imp-banco__gruppo imp-banco__gruppo--quando" disabled={fermo}>
        <legend className="imp-banco__legenda imp-banco__legenda--piccola">
          {BANCO.quando.legenda} <span className="imp-banco__facoltativo">{BANCO.quando.facoltativo}</span>
        </legend>
        <div className="imp-banco__scelte imp-banco__scelte--quando">
          {ORDINE_QUANDO.map((q) => (
            <label key={q} className="imp-banco__scelta imp-ix-scelta imp-ix-premibile">
              <input
                className="imp-ix-scelta__input"
                type="radio"
                name="imp-banco-quando"
                value={q}
                checked={quando === q}
                onChange={() => aggiornaProva({ quando: q })}
              />
              <span className="imp-banco__scelta-testo">
                <span className="imp-banco__scelta-nome">{BANCO.quando.opzioni[q]}</span>
              </span>
              <SegnoScelta scelto={quando === q} />
            </label>
          ))}
        </div>
        {prodotto === 'libro' && quando === 'quindici' ? (
          <p className="imp-banco__nota">{BANCO.quando.notaLibroFretta}</p>
        ) : null}
      </fieldset>
    </div>
  );
}
