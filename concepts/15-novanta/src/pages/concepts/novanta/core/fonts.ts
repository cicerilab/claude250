/**
 * NOVANTA · font (tech-architect §1.3 e §9.3, art-director §4).
 *
 * `injectFonts()` aggiunge al <head> i `preconnect` e il `<link>` del CSS di
 * Google Fonts (`FONT_CSS_URL` di styles/tokens.ts, dell'art-director).
 * Restituisce lo smontaggio, che toglie SOLO gli elementi aggiunti qui (se il
 * sito li aveva già, restano).
 *
 * `fontsReady()` aspetta le combinazioni di `FONT_DA_CARICARE` con un tetto
 * di tempo: non rifiuta mai, nessuno resta appeso se la rete dei font è lenta
 * o bloccata. I font di ripiego tarati di tokens.css reggono il layout.
 */

import { FONT_CSS_URL, FONT_DA_CARICARE } from '../styles/tokens';

const ATTR_PROPRIETARIO = 'data-novanta-font';

/** Origini dei font di Google (preconnect). */
export const FONT_PRECONNECT = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'] as const;

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

/** Tetto di attesa dei font (ms). */
export const FONT_ATTESA_MAX = 3000;

/**
 * Risolve quando le combinazioni `specs` (sintassi `font` di CSS, es.
 * `'800 1em Epilogue'`) sono caricate, o dopo `attesaMax` ms. Non rifiuta mai.
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
