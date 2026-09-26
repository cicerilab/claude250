/**
 * CONTROPELO · nomi di esempio dei clienti nella lista (copywriter).
 *
 * Nome + iniziale del cognome, mai cognomi completi (brand-strategist §8.2).
 * Uomini di Pordenone e dintorni nel 2026, di età e origini diverse.
 * La generazione deterministica di sections/Lista/agenda.ts pesca da qui.
 *
 * Regole per l'agenda:
 * - mai "Mattia", "Denis", "Samir" o "Bruno" come clienti (NOMI_VIETATI:
 *   valgono solo per il generatore; il visitatore scrive il nome che vuole);
 * - nessun nome ripetuto nello stesso giorno sullo stesso specchio;
 * - un "taglio e barba" di esempio occupa due righe con lo stesso nome.
 *
 * Solo dati.
 */

/** Tutti i nomi, 44. */
export const NOMI = [
  'Luca B.',
  'Enrico P.',
  'Franco D.',
  'Giorgio T.',
  'Renzo M.',
  'Sergio Z.',
  'Walter C.',
  'Elvio R.',
  'Gianni S.',
  'Paolo F.',
  'Roberto V.',
  'Stefano L.',
  'Marco G.',
  'Andrea N.',
  'Davide Z.',
  'Nicola P.',
  'Fabio T.',
  'Mirko D.',
  'Ivan B.',
  'Loris M.',
  'Cristian F.',
  'Manuel S.',
  'Alberto R.',
  'Simone C.',
  'Matteo P.',
  'Tommaso G.',
  'Riccardo B.',
  'Federico M.',
  'Gabriele T.',
  'Leonardo V.',
  'Omar K.',
  'Karim B.',
  'Ionut P.',
  'Arben H.',
  'Kevin D.',
  'Oleksandr M.',
  'Alessio F.',
  'Diego S.',
  'Filippo Z.',
  'Edoardo L.',
  'Nevio T.',
  'Dario C.',
  'Emanuele B.',
  'Ottavio G.',
] as const;

export type NomeCliente = (typeof NOMI)[number];

/**
 * Da quali nomi pesca ogni specchio (indice 0, 1, 2), per rendere verosimili
 * le liste: Mattia ha i clienti di sempre, Denis la barba (30-60 anni),
 * Samir i ragazzi della sfumatura. Ogni gruppo ha almeno 18 nomi, così una
 * giornata piena (18 mezz'ore del sabato) non ripete mai un nome.
 * I gruppi si sovrappongono: il quartiere è lo stesso.
 */
export const NOMI_PER_SPECCHIO = [
  // Mattia: clienti di sempre, 45-75 anni, più qualche padre con figlio.
  [
    'Franco D.',
    'Giorgio T.',
    'Renzo M.',
    'Sergio Z.',
    'Walter C.',
    'Elvio R.',
    'Gianni S.',
    'Paolo F.',
    'Roberto V.',
    'Nevio T.',
    'Ottavio G.',
    'Enrico P.',
    'Luca B.',
    'Stefano L.',
    'Marco G.',
    'Dario C.',
    'Tommaso G.',
    'Alberto R.',
    'Arben H.',
    'Andrea N.',
  ],
  // Denis: barba e rasatura, 30-60 anni.
  [
    'Enrico P.',
    'Karim B.',
    'Stefano L.',
    'Marco G.',
    'Andrea N.',
    'Nicola P.',
    'Fabio T.',
    'Alberto R.',
    'Simone C.',
    'Omar K.',
    'Arben H.',
    'Dario C.',
    'Emanuele B.',
    'Oleksandr M.',
    'Roberto V.',
    'Loris M.',
    'Cristian F.',
    'Paolo F.',
    'Davide Z.',
    'Luca B.',
  ],
  // Samir: sfumature, 16-32 anni, e bambini.
  [
    'Mirko D.',
    'Ivan B.',
    'Kevin D.',
    'Manuel S.',
    'Matteo P.',
    'Tommaso G.',
    'Riccardo B.',
    'Federico M.',
    'Gabriele T.',
    'Leonardo V.',
    'Ionut P.',
    'Alessio F.',
    'Diego S.',
    'Filippo Z.',
    'Edoardo L.',
    'Davide Z.',
    'Cristian F.',
    'Omar K.',
    'Emanuele B.',
    'Loris M.',
  ],
] as const satisfies readonly [readonly NomeCliente[], readonly NomeCliente[], readonly NomeCliente[]];

/** Nomi che il generatore non usa mai come clienti (sono i barbieri, e Bruno). */
export const NOMI_VIETATI = ['Mattia', 'Denis', 'Samir', 'Bruno'] as const;
