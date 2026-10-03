/**
 * Ingresso dell'app standalone (non si porta: nel sito c'è già il suo main).
 * StrictMode acceso di proposito: i moduli del concept devono reggere il
 * doppio montaggio degli effetti in sviluppo (ticker, lenis, observer).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const contenitore = document.getElementById('root');
if (contenitore === null) {
  throw new Error('Elemento #root mancante in index.html');
}

createRoot(contenitore).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
