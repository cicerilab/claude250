/**
 * SOTTOSCOCCA · font (tech-architect §1.3, art-director §4).
 *
 * `injectFonts()` aggiunge al <head> i `preconnect` e il `<link>` del CSS di
 * Google Fonts (`FONT_CSS_URL` e `FONT_PRECONNECT` di styles/tokens.ts).
 * Restituisce lo smontaggio, che toglie SOLO gli elementi aggiunti da lei.
 *
 * `fontsReady()` aspetta le combinazioni usate dal GL (targhetta "3500 kg" in
 * Tektur) e dal testo (`FONT_DA_CARICARE`) con un tetto: non rifiuta mai.
 */

import { FONT_CSS_URL, FONT_DA_CARICARE, FONT_PRECONNECT } from '../styles/tokens';

const ATTR_PROPRIETARIO = 'data-sottoscocca-font';

function cercaLink(rel: string, href: string): HTMLLinkElement | null {
  const elenco = document.head.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`);
  for (const link of Array.from(elenco)) {
    if (link.href === href || link.getAttribute('href') === href) return link;
  }
  return null;
}

function aggiungiLink(rel: string, href: string, crossOrigin: boolean): HTMLLinkElement | null {
  if (cercaLink(rel, href) !== null) return null;
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (crossOrigin) link.crossOrigin = 'anonymous';
  link.setAttribute(ATTR_PROPRIETARIO, '');
  document.head.appendChild(link);
  return link;
}

/** Inietta preconnect e foglio dei font. Restituisce lo smontaggio. */
export function injectFonts(url: string = FONT_CSS_URL): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const aggiunti: HTMLLinkElement[] = [];
  for (const origine of FONT_PRECONNECT) {
    const link = aggiungiLink('preconnect', origine, origine.includes('gstatic'));
    if (link !== null) aggiunti.push(link);
  }
  const foglio = aggiungiLink('stylesheet', url, false);
  if (foglio !== null) aggiunti.push(foglio);
  return () => {
    for (const link of aggiunti) link.remove();
  };
}

/** Tetto di attesa dei font (ms): oltre, si va avanti con i ripieghi. */
export const FONT_ATTESA_MAX = 3000;

/**
 * Risolve quando `specs` (sintassi `font` di CSS, es. `'600 48px Tektur'`)
 * sono caricate, o dopo `attesaMax` ms. Non rifiuta mai.
 */
export function fontsReady(specs: readonly string[] = FONT_DA_CARICARE, attesaMax: number = FONT_ATTESA_MAX): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return Promise.resolve();
  const caricamenti = Promise.all(
    specs.map((spec) =>
      document.fonts.load(spec).then(
        () => undefined,
        () => undefined,
      ),
    ),
  ).then(() => document.fonts.ready.then(() => undefined));
  const tetto = new Promise<void>((risolvi) => {
    window.setTimeout(risolvi, attesaMax);
  });
  return Promise.race([caricamenti, tetto]).catch(() => undefined);
}
